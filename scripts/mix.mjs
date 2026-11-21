// npm run mix <slug>：後製混音（P1-1／P1-2／P1-3，只用在 styleVersion 2）
//   畫面：out/<slug>.video.mp4（render.mjs 輸出，-c:v copy 不重新編碼）
//   人聲：public/audio/<slug>/voice.wav（align.mjs 疊好、整條 loudnorm 的 stem）
//   音效：ffmpeg 自己合成（whoosh／pop／chime，public/sfx/），克制：whoosh 只在章節轉場、pop 在數字落定、chime 在關鍵 cue，平均 ≤1 個/3 秒
//   BGM：ffmpeg 自己合成的中性和弦底（無授權問題），sidechain ducking：人聲出現時壓低
//   最後兩段式 loudnorm → −14 LUFS、TP −1.5 dBTP、LRA ≤8，AAC 256k／48kHz → out/<slug>.mp4
//   量測寫到 videos/<slug>/mix.json（入庫）；事件清單與合成參數也在裡面，改音效不必重 render 畫面。
// script.json 頂層可設 audio: { bgm: false, sfx: false, bgmLufs: -27, events: [{ type, frame }] } 覆寫預設。
import fs from "node:fs";
import path from "node:path";
import { spawnSync, execFileSync } from "node:child_process";
import crypto from "node:crypto";

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const slug = process.argv[2];
if (!slug) { console.error("用法：npm run mix <slug>"); process.exit(2); }
const dir = path.join(ROOT, "videos", slug);
const script = JSON.parse(fs.readFileSync(path.join(dir, "script.json"), "utf8"));
const tl = JSON.parse(fs.readFileSync(path.join(dir, "timeline.json"), "utf8"));
if (tl.version !== 2 || !tl.voice) { console.error("mix 只支援時間軸 v2（需要 timeline.voice，請先 npm run align）"); process.exit(2); }
const FPS = tl.fps ?? 30;
const opt = { bgm: true, sfx: true, bgmLufs: -27, ...(script.audio ?? {}) };
const video = path.join(ROOT, "out", `${slug}.video.mp4`);
const out = path.join(ROOT, "out", `${slug}.mp4`);
const voice = path.join(ROOT, "public", tl.voice.file);
if (!fs.existsSync(video)) { console.error(`找不到 ${path.relative(ROOT, video)}，請先 npm run render ${slug}`); process.exit(2); }
const DUR = tl.totalFrames / FPS;
const ff = (args) => { const r = spawnSync("ffmpeg", ["-y", "-hide_banner", ...args], { encoding: "utf8", maxBuffer: 64 << 20 }); if (r.status !== 0) throw new Error(r.stderr.slice(-800)); return r.stderr; };

// ───────── 音效合成（固定參數，可重現；全部自製，無授權問題） ─────────
const SFX_DIR = path.join(ROOT, "public", "sfx");
fs.mkdirSync(SFX_DIR, { recursive: true });
const NOTCH = "equalizer=f=3000:t=q:w=1.2:g=-9"; // 避開 2–4kHz（人聲清晰度頻段）
const SFX = {
  // 粉紅雜訊、低通掃頻感（前段漸強、後段漸弱），峰值約在 0.28 秒
  whoosh: { sec: 0.5, gainDb: -17, graph: `anoisesrc=d=0.5:c=pink:a=0.6:seed=7,highpass=f=180,lowpass=f=2400,${NOTCH},afade=t=in:st=0:d=0.28:curve=exp,afade=t=out:st=0.28:d=0.22:curve=qsin` },
  // 短促下滑音（900→400Hz），數字落定用
  pop: { sec: 0.12, gainDb: -16, graph: `aevalsrc='sin(2*PI*(400*t+500*(1-exp(-t*40))/40))*exp(-t*38)':s=48000:d=0.12,${NOTCH}` },
  // 兩音鐘聲（A5＋E6），關鍵 cue 用
  chime: { sec: 0.7, gainDb: -18, graph: `aevalsrc='0.55*sin(2*PI*880*t)*exp(-t*6)+0.3*sin(2*PI*1318.5*t)*exp(-t*7.5)':s=48000:d=0.7,${NOTCH},afade=t=in:st=0:d=0.004` },
};
const peakOffsetMs = (file) => {
  const raw = execFileSync("ffmpeg", ["-v", "error", "-i", file, "-ac", "1", "-ar", "48000", "-f", "f32le", "-"], { maxBuffer: 64 << 20 });
  const a = new Float32Array(raw.buffer, raw.byteOffset, raw.length / 4);
  let k = 0; for (let i = 1; i < a.length; i++) if (Math.abs(a[i]) > Math.abs(a[k])) k = i;
  return Math.round((k / 48000) * 1000);
};
const sfxMeta = {};
for (const [name, s] of Object.entries(SFX)) {
  const file = path.join(SFX_DIR, `${name}-${crypto.createHash("sha1").update(s.graph + s.gainDb).digest("hex").slice(0, 8)}.wav`); // 參數變了就重做
  if (!fs.existsSync(file)) ff(["-f", "lavfi", "-i", s.graph, "-ar", "48000", "-ac", "1", "-af", `volume=${s.gainDb}dB`, file]);
  sfxMeta[name] = { file: path.relative(ROOT, file), peakOffsetMs: peakOffsetMs(file), gainDb: s.gainDb };
}

// ───────── 音效事件（預設規則；script.audio.events 可整個覆寫） ─────────
const scenes = script.scenes;
const byId = Object.fromEntries(tl.scenes.map((x) => [x.id, x]));
const cueFrame = (id, cue) => byId[id]?.cues?.find((c) => c.id === cue)?.frame ?? null;
let events = [];
if (Array.isArray(opt.events)) events = opt.events;
else if (opt.sfx) {
  // whoosh：只在章節切換（beat 改變到 you／twist／cta 的第一幕），峰值對齊轉場中點（−2～0 幀）
  scenes.forEach((s, i) => {
    if (i === 0) return;
    const prev = scenes[i - 1];
    if (s.beat !== prev.beat && ["you", "twist", "cta"].includes(s.beat) && s.component !== "EndCard") events.push({ type: "whoosh", frame: byId[s.id].startFrame + Math.round(byId[s.id].transitionFrames / 2), why: `${prev.beat}→${s.beat}` });
  });
  // chime：鉤子 slam、CTA 的「留言」
  const hook = scenes.find((s) => s.component === "HookTitle");
  if (hook?.props?.slamAt) { const f = cueFrame(hook.id, hook.props.slamAt); if (f !== null) events.push({ type: "chime", frame: f, why: `${hook.id} slam` }); }
  const cta = scenes.find((s) => s.component === "CtaCard");
  if (cta?.props?.promptAt) { const f = cueFrame(cta.id, cta.props.promptAt); if (f !== null) events.push({ type: "chime", frame: f, why: `${cta.id} prompt` }); }
  // pop：BigNumber 落定（at 的 cue）
  for (const s of scenes) if (s.component === "BigNumber" && s.props?.at) { const f = cueFrame(s.id, s.props.at); if (f !== null) events.push({ type: "pop", frame: f, why: `${s.id} 數字落定` }); }
  events.sort((a, b) => a.frame - b.frame);
  // 密度：平均 ≤1 個/3 秒，且相鄰 ≥1.5 秒；超過就先拿掉 pop
  const limit = Math.floor(DUR / 3);
  events = events.filter((e, i, a) => i === 0 || e.frame - a[i - 1].frame >= 45 || e.type !== "pop");
  while (events.length > limit) { const k = events.map((e) => e.type).lastIndexOf("pop"); if (k < 0) break; events.splice(k, 1); }
}
// 峰值對齊：whoosh 峰值落在事件幀 −2～0 幀（提前 2 幀），pop／chime 起音即峰值（0～+1 幀）
const placed = events.map((e) => {
  const m = sfxMeta[e.type];
  const lead = e.type === "whoosh" ? 2 / FPS : 0;
  const startSec = Math.max(0, e.frame / FPS - lead - m.peakOffsetMs / 1000);
  return { ...e, startSec: Number(startSec.toFixed(3)), peakSec: Number((startSec + m.peakOffsetMs / 1000).toFixed(3)) };
});

// ───────── BGM：自合成中性和弦底（Cmaj9 開放和聲＋緩慢呼吸），長度剛好等於片長 ─────────
const bgmFile = path.join(ROOT, "out", `${slug}.bgm.wav`);
const BGM_LEAD = Number(process.env.BGM_LEAD || 0).toFixed(2); // 片頭先靜音幾秒再淡入背景音（交件前驗證：第一個字起音 ≥0.25 秒），預設 0＝舊行為
if (opt.bgm) {
  const tones = [[130.81, 0.32], [196.0, 0.26], [246.94, 0.18], [293.66, 0.16], [329.63, 0.14]];
  const expr = tones.map(([f, a], i) => `${a}*sin(2*PI*${f}*t)*(0.75+0.25*sin(2*PI*${(0.05 + i * 0.013).toFixed(3)}*t+${i}))`).join("+");
  ff(["-f", "lavfi", "-i", `aevalsrc='${expr}':s=48000:d=${DUR.toFixed(3)}`, "-af", `lowpass=f=900,${NOTCH},volume=0:enable='lt(t,${BGM_LEAD})',afade=t=in:st=${BGM_LEAD}:d=1.5,afade=t=out:st=${(DUR - 2.5).toFixed(2)}:d=2.5,loudnorm=I=${opt.bgmLufs}:TP=-9:LRA=7`, "-ar", "48000", "-ac", "1", bgmFile]);
}

// ───────── 混音 ─────────
const inputs = ["-i", voice];
if (opt.bgm) inputs.push("-i", bgmFile);
const sfxIdx = {};
for (const name of [...new Set(placed.map((e) => e.type))]) { sfxIdx[name] = inputs.length / 2; inputs.push("-i", path.join(ROOT, sfxMeta[name].file)); }
const parts = ["[0:a]aresample=48000,asplit=2[vo][sc]"];
const mixIn = ["[vo]"];
if (opt.bgm) { parts.push("[1:a]aresample=48000[bg]", "[bg][sc]sidechaincompress=threshold=0.03:ratio=6:attack=25:release=350:makeup=1[bgd]"); mixIn.push("[bgd]"); }
else parts.push("[sc]anullsink");
const counts = {};
for (const [k, e] of placed.entries()) { counts[e.type] = (counts[e.type] ?? 0) + 1; mixIn.push(`[s${k}]`); }
// 同一個音效檔要用好幾次：asplit 分流（多分一路接 anullsink，避免未使用的輸出）
const usage = {};
for (const e of placed) usage[e.type] = (usage[e.type] ?? 0) + 1;
const split = Object.entries(sfxIdx).map(([name, i]) => `[${i}:a]aresample=48000,asplit=${usage[name] + 1}${Array.from({ length: usage[name] + 1 }, (_, n) => `[${name}${n}]`).join("")}`);
const used = {};
const sfxChains = placed.map((e, k) => { const n = used[e.type] = (used[e.type] ?? -1) + 1; return `[${e.type}${n}]adelay=${Math.round(e.startSec * 1000)}:all=1[s${k}]`; });
const nulls = Object.keys(sfxIdx).map((name) => `[${name}${usage[name]}]anullsink`);
const graphBase = [...parts, ...split, ...sfxChains, ...nulls,
  `${mixIn.join("")}amix=inputs=${mixIn.length}:normalize=0:dropout_transition=0,atrim=0:${DUR.toFixed(3)}`].join(";");
const LN = "I=-14:TP=-1.5:LRA=7";
const p1 = ff([...inputs, "-filter_complex", `${graphBase},loudnorm=${LN}:print_format=json`, "-f", "null", "-"]);
const j = JSON.parse(/\{[^{}]*"input_i"[^{}]*\}/s.exec(p1)[0]);
const mixWav = path.join(ROOT, "out", `${slug}.mix.wav`);
ff([...inputs, "-filter_complex", `${graphBase},loudnorm=${LN}:measured_I=${j.input_i}:measured_TP=${j.input_tp}:measured_LRA=${j.input_lra}:measured_thresh=${j.input_thresh}:offset=${j.target_offset}:linear=true,aresample=48000`, "-ac", "2", "-c:a", "pcm_s16le", mixWav]);
ff(["-i", video, "-i", mixWav, "-map", "0:v", "-map", "1:a", "-c:v", "copy", "-c:a", "aac", "-b:a", "256k", "-ar", "48000", "-t", DUR.toFixed(3), out]);

// ───────── 量測 ─────────
const ebur = (file, extra = []) => {
  const e = spawnSync("ffmpeg", ["-hide_banner", ...extra, "-i", file, "-af", "ebur128=peak=true", "-f", "null", "-"], { encoding: "utf8", maxBuffer: 64 << 20 }).stderr;
  const sum = e.slice(e.lastIndexOf("Summary:"));
  const num = (re) => Number(re.exec(sum)?.[1]);
  return { I: num(/I:\s+(-?[\d.]+) LUFS/), LRA: num(/LRA:\s+(-?[\d.]+) LU/), TP: num(/Peak:\s+(-?[\d.]+) dBFS/) };
};
const final = ebur(out);
// 講話時 BGM 比人聲低多少：只取人聲區間，量 voice 與 ducking 後 BGM 的響度
const speech = tl.scenes.filter((x) => x.audio).map((x) => [x.voiceStartFrame / FPS, x.voiceEndFrame / FPS]);
let bgmUnderVoice = null;
if (opt.bgm) {
  const duck = path.join(ROOT, "out", `${slug}.bgmduck.wav`);
  ff(["-i", voice, "-i", bgmFile, "-filter_complex", "[0:a]aresample=48000[sc];[1:a]aresample=48000[bg];[bg][sc]sidechaincompress=threshold=0.03:ratio=6:attack=25:release=350:makeup=1", duck]);
  const sel = speech.map(([a, b]) => `between(t,${a.toFixed(2)},${b.toFixed(2)})`).join("+");
  const L = (f) => ebur(f, []).I;
  const cut = (f, o) => { ff(["-i", f, "-af", `aselect='${sel}',asetpts=N/SR/TB`, o]); return o; };
  const v = L(cut(voice, path.join(ROOT, "out", `${slug}.v-speech.wav`)));
  const b = L(cut(duck, path.join(ROOT, "out", `${slug}.b-speech.wav`)));
  bgmUnderVoice = Number((v - b).toFixed(1));
}
const report = {
  slug, at: new Date().toISOString(), durationSec: Number(DUR.toFixed(2)),
  final: { lufs: final.I, truePeakDbfs: final.TP, lra: final.LRA, codec: "aac 256k 48kHz stereo" },
  target: { lufs: -14, truePeakDbfs: -1.5, lraMax: 8, bgmUnderVoiceLuMin: 15 },
  bgm: opt.bgm ? { source: "ffmpeg 自合成中性和弦（C–G–B–D–E 正弦＋慢速呼吸、低通 900Hz），無授權問題", lufsBeforeDuck: opt.bgmLufs, duck: "sidechaincompress threshold 0.03 ratio 6 attack 25ms release 350ms", underVoiceDuringSpeechLu: bgmUnderVoice } : null,
  sfx: { meta: sfxMeta, notch: "−9dB @3kHz（避開 2–4kHz）", counts, perThreeSec: Number((placed.length / (DUR / 3)).toFixed(2)), events: placed },
};
fs.writeFileSync(path.join(dir, "mix.json"), JSON.stringify(report, null, 1));
for (const f of [`${slug}.v-speech.wav`, `${slug}.b-speech.wav`, `${slug}.bgmduck.wav`]) fs.rmSync(path.join(ROOT, "out", f), { force: true });
console.log(`✔ ${path.relative(ROOT, out)}  ${final.I} LUFS、TP ${final.TP} dBFS、LRA ${final.LRA}；BGM 講話時比人聲低 ${bgmUnderVoice ?? "—"} LU；音效 ${placed.length} 個（${JSON.stringify(counts)}，${report.sfx.perThreeSec}/3 秒）→ videos/${slug}/mix.json`);

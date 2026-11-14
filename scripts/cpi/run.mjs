// CPI 實測短片：使用者自備旁白 → 對齊 → 字幕 → 畫面 → MP4（H.264＋AAC）→ ffprobe → 自查截圖。
//
// 用法：
//   node scripts/cpi/run.mjs <旁白音檔.wav>     → <音檔同資料夾>/cpi_ai_test.mp4，並複製一份到 out/cpi_ai_test.mp4
//   node scripts/cpi/run.mjs --preview          → 沒有音檔時：依字數估算時間軸＋同長度靜音 → out/cpi/preview.mp4、out/cpi/preview-sheet.png
// 選項：--out=<路徑> 指定輸出檔；--no-copy 不複製到 out/；--method=fa|silence|estimate 強制對齊方式。
//
// 對齊：scripts/fa.py（MMS forced aligner，吃逐字稿）。數字的念法試四種（趴／百分之 × 二／兩），取信心最高的。
// 信心 < 0.3 或失敗 → 依靜音切段（ffmpeg silencedetect，字數比例分配到有聲區段）→ 再不行用字數估算。
// 吃 CPU：整支腳本自動包在 flock /tmp/aimp4-render.lock 裡（排隊等其他渲染）。原音檔只讀不改。
import fs from "node:fs";
import path from "node:path";
import { execFileSync, spawnSync } from "node:child_process";

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "../..");
const LOCK = "/tmp/aimp4-render.lock";
if (!process.env.CPI_LOCKED) {
  console.log(`⏳ 等候 ${LOCK}（其他渲染在排隊時會等）…`);
  const r = spawnSync("flock", [LOCK, process.execPath, new URL(import.meta.url).pathname, ...process.argv.slice(2)], { stdio: "inherit", env: { ...process.env, CPI_LOCKED: "1" } });
  process.exit(r.status ?? 1);
}

const args = process.argv.slice(2);
const opt = Object.fromEntries(args.filter((a) => a.startsWith("--")).map((a) => { const [k, v] = a.slice(2).split("="); return [k, v ?? true]; }));
const PREVIEW = !!opt.preview;
const audioArg = args.find((a) => !a.startsWith("--"));
if (!PREVIEW && !audioArg) { console.error("用法：node scripts/cpi/run.mjs <旁白音檔.wav>｜--preview"); process.exit(2); }
const FPS = 30, MAXW = 14;
const WORK = path.join(ROOT, "out", "cpi");
fs.mkdirSync(path.join(WORK, "check"), { recursive: true });

// ───────── 逐字稿（六段＝六個畫面）─────────
const SEGS = [
  { id: "open", text: "十月物價出來了，你有請 AI 抓重點嗎？", cues: { q: ["你", "start"] } },
  { id: "ask", text: "我們用 Gemini 實測，先只打一句話。", cues: { type: ["先", "start"], typeEnd: ["一句話", "end"] } },
  { id: "reply", text: "它回了一大篇，說十月是 1.69%。", cues: { num: ["1.69%", "start"] } },
  { id: "wrong", text: "其實那是兩年前的數字，今年是 2.33%。", cues: { past: ["兩年前", "start"], num: ["2.33%", "start"] } },
  { id: "why", text: "這不能怪它，我們沒開搜尋，也沒給它新聞。", cues: { search: ["搜尋", "start"], news: ["新聞", "start"] } },
  { id: "end", text: "所以，我們換個問法。", cues: { ask: ["換", "start"] } },
];
const PUNCT = /^[，。？！、,.?!]$/;
const tokenize = (text) => [...text.matchAll(/\d+(?:\.\d+)?%|[A-Za-z]+|\s+|./gu)].map((m) => ({ t: m[0], off: m.index }));
const tokens = []; // { t, seg, off（在該段文字的位置）}
SEGS.forEach((s, si) => tokenize(s.text).forEach((k) => tokens.push({ ...k, seg: si })));
const isSpoken = (k) => !/^\s+$/.test(k.t) && !PUNCT.test(k.t);
const width = (str) => [...str].reduce((w, c) => w + (/\s/.test(c) ? 0 : /[\x21-\x7e]/.test(c) ? 0.5 : 1), 0);

/** 數字念法：「1.69%」→ 一點六九趴／百分之一點六九；2 可能念二或兩 */
const DIG = "零一二三四五六七八九";
const sayNum = (t, v) => {
  const [a, b] = t.replace("%", "").split(".");
  const ia = a.split("").map((d) => (d === "2" && v.liang && a.length === 1 ? "兩" : DIG[+d])).join("");
  const n = ia + (b ? "點" + b.split("").map((d) => DIG[+d]).join("") : "");
  return t.endsWith("%") ? (v.pct === "baifen" ? "百分之" + n : n + "趴") : n;
};
const VARIANTS = [{ pct: "pa", liang: false }, { pct: "pa", liang: true }, { pct: "baifen", liang: false }, { pct: "baifen", liang: true }];
const spokenOf = (k, v) => (/^\d/.test(k.t) ? sayNum(k.t, v) : k.t);

// ───────── 音檔 ─────────
const probeDur = (f) => Number(execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", f]).toString().trim());
const estimate = () => { // 依字數估算：中文字 0.2 秒、數字 1.0 秒、英文詞 0.4 秒、逗號停 0.25、句號停 0.45
  let t = 0.4;
  for (const k of tokens) {
    if (/^\s+$/.test(k.t)) continue;
    if (PUNCT.test(k.t)) { k.start = k.end = t; t += /[，、,]/.test(k.t) ? 0.25 : 0.45; continue; }
    const d = /^\d/.test(k.t) ? 1.0 : /^[A-Za-z]/.test(k.t) ? 0.4 : 0.2;
    k.start = t; k.end = t + d; t = k.end;
  }
  return t + 0.6;
};

let audio, dur, method, faInfo = null;
if (PREVIEW) {
  dur = estimate(); method = "estimate";
  audio = path.join(WORK, "preview-silence.wav");
  execFileSync("ffmpeg", ["-v", "error", "-y", "-f", "lavfi", "-i", "anullsrc=r=24000:cl=mono", "-t", dur.toFixed(3), audio]);
} else {
  audio = path.resolve(audioArg);
  if (!fs.existsSync(audio)) { console.error(`找不到音檔 ${audio}`); process.exit(2); }
  dur = probeDur(audio);
}
console.log(`🎧 ${PREVIEW ? "（預覽：靜音）" : audio}  ${dur.toFixed(2)} 秒`);

// ───────── 對齊 ─────────
const runFA = () => {
  const spoken = tokens.filter(isSpoken);
  const jobs = VARIANTS.map((v, vi) => {
    let text = "";
    const ranges = spoken.map((k) => { const sp = spokenOf(k, v); const a = text.length; text += (/^[A-Za-z]/.test(sp) ? " " + sp + " " : sp); return [a, text.length]; });
    return { id: `v${vi}`, file: audio, text, ranges };
  });
  const r = spawnSync(path.join(ROOT, ".venv/bin/python"), [path.join(ROOT, "scripts/fa.py")], { input: JSON.stringify(jobs.map(({ id, file, text }) => ({ id, file, text }))), encoding: "utf8", maxBuffer: 64 << 20, stdio: ["pipe", "pipe", "inherit"] });
  if (r.status !== 0) throw new Error("fa.py 失敗");
  const res = JSON.parse(r.stdout).filter((x) => x.ok).sort((a, b) => b.confidence - a.confidence);
  if (!res.length) throw new Error("四種念法都對不上");
  const best = res[0], job = jobs.find((j) => j.id === best.id);
  console.log(`  採用念法 ${JSON.stringify(VARIANTS[+best.id.slice(1)])}，信心 ${best.confidence}（其他：${res.slice(1).map((x) => `${x.id} ${x.confidence}`).join("、")}）`);
  if (best.confidence < 0.3) throw new Error(`信心 ${best.confidence} 太低`);
  spoken.forEach((k, i) => {
    const [a, b] = job.ranges[i];
    const us = best.units.filter((u) => u.i >= a && u.i < b);
    if (us.length) { k.start = Math.min(...us.map((u) => u.start)); k.end = Math.max(...us.map((u) => u.end)); } else { k.start = k.end = undefined; }
  });
  // 對不到的字：前後內插
  spoken.forEach((k, i) => {
    if (k.start !== undefined) return;
    const p = spoken.slice(0, i).reverse().find((x) => x.start !== undefined), n = spoken.slice(i + 1).find((x) => x.start !== undefined);
    k.start = p ? p.end : 0; k.end = n ? n.start : k.start + 0.2;
  });
  return { confidence: best.confidence, minScore: best.minScore, variant: VARIANTS[+best.id.slice(1)], onsetMedianMs: best.onsetMedianMs };
};
const runSilence = () => { // 依靜音切段：有聲區段串起來，依字的估計長度比例分配
  const log = spawnSync("ffmpeg", ["-v", "info", "-i", audio, "-af", "silencedetect=noise=-35dB:d=0.18", "-f", "null", "-"], { encoding: "utf8" }).stderr;
  const sil = []; let s0 = null;
  for (const l of log.split("\n")) {
    const a = /silence_start: ([\d.]+)/.exec(l), b = /silence_end: ([\d.]+)/.exec(l);
    if (a) s0 = +a[1]; if (b && s0 !== null) { sil.push([s0, +b[1]]); s0 = null; }
  }
  if (s0 !== null) sil.push([s0, dur]);
  const speech = []; let t = 0;
  for (const [a, b] of sil) { if (a > t + 0.05) speech.push([t, a]); t = b; }
  if (t < dur - 0.05) speech.push([t, dur]);
  const total = speech.reduce((x, [a, b]) => x + b - a, 0);
  if (total < 2) throw new Error("找不到有聲區段");
  const sp = tokens.filter(isSpoken), wt = (k) => (/^\d/.test(k.t) ? 5 : /^[A-Za-z]/.test(k.t) ? 2 : 1), W = sp.reduce((x, k) => x + wt(k), 0);
  const at = (x) => { let r = x * total; for (const [a, b] of speech) { if (r <= b - a) return a + r; r -= b - a; } return dur; };
  let c = 0;
  for (const k of sp) { k.start = at(c / W); c += wt(k); k.end = at(c / W); }
  return { speechRegions: speech.length };
};
const want = opt.method;
if (!PREVIEW) {
  const tries = want ? [want] : ["fa", "silence", "estimate"];
  for (const m of tries) {
    try {
      console.log(`▶ 對齊：${m}`);
      faInfo = m === "fa" ? runFA() : m === "silence" ? runSilence() : (estimate(), {});
      method = m; break;
    } catch (e) { console.warn(`  ⚠ ${m} 失敗：${e.message}`); }
  }
  if (!method) process.exit(1);
}
// 標點與空白：接在前一個字的結尾
tokens.forEach((k, i) => { if (!isSpoken(k)) { const p = tokens.slice(0, i).reverse().find(isSpoken); k.start = k.end = p ? p.end : 0; } });

// ───────── 字幕行（每行 ≤14 字，在標點處斷，數字與英文詞不拆）─────────
const total = Math.ceil(dur * FPS);
const fr = (s) => Math.max(0, Math.round(s * FPS));
const lines = [];
SEGS.forEach((s, si) => {
  const segToks = tokens.filter((k) => k.seg === si);
  const clauses = []; let cur = [];
  for (const k of segToks) { cur.push(k); if (PUNCT.test(k.t)) { clauses.push(cur); cur = []; } }
  if (cur.length) clauses.push(cur);
  const show = (ks) => ks.map((k) => k.t).join("").trim().replace(/[，。,.、]+$/, "");
  const groups = []; let g = [];
  for (const c of clauses) {
    if (g.length && width(show([...g, ...c])) <= MAXW) { g.push(...c); continue; }
    if (g.length) groups.push(g);
    g = [...c];
    while (width(show(g)) > MAXW) { // 單一子句太長：在字與字之間切（不拆數字、英文詞）
      let n = 0; while (n < g.length && width(show(g.slice(0, n + 1))) <= MAXW) n++;
      groups.push(g.slice(0, n)); g = g.slice(n);
    }
  }
  if (g.length) groups.push(g);
  for (const ks of groups) {
    const sp = ks.filter(isSpoken);
    lines.push({ text: show(ks), seg: si, t0: sp[0].start, t1: sp[sp.length - 1].end });
  }
});
lines.forEach((l, i) => {
  l.from = Math.max(0, fr(l.t0) - 3);
  const n = lines[i + 1];
  // 顯示到下一行出現；兩行之間停很久（> 1.5 秒）時，念完 1.5 秒後先收掉
  l.to = !n ? total : Math.max(l.from + 1, Math.min(fr(n.t0) - 3, fr(l.t1 + 1.5)));
});
const bad = lines.filter((l) => width(l.text) > MAXW);
if (bad.length) { console.error("✖ 字幕超過 14 字：", bad.map((l) => l.text)); process.exit(1); }
for (const want of ["1.69%", "2.33%", "Gemini", "AI"]) if (!lines.some((l) => l.text.includes(want))) { console.error(`✖ 字幕裡找不到完整的「${want}」（被拆行了）`); process.exit(1); }

// ───────── 畫面段落與 cue ─────────
const segs = SEGS.map((s, si) => {
  const ks = tokens.filter((k) => k.seg === si);
  const first = ks.find(isSpoken);
  const cues = {};
  for (const [name, [needle, edge]] of Object.entries(s.cues)) {
    const off = s.text.indexOf(needle);
    const hit = ks.filter((k) => isSpoken(k) && k.off < off + needle.length && k.off + k.t.length > off);
    cues[name] = fr(edge === "end" ? hit[hit.length - 1].end : hit[0].start);
  }
  return { id: s.id, from: si === 0 ? 0 : Math.max(0, fr(first.start) - 4), to: 0, cues, t0: first.start };
});
segs.forEach((s, i) => { s.to = segs[i + 1] ? segs[i + 1].from : total; });

const props = { durationInFrames: total, segs: segs.map(({ id, from, to, cues }) => ({ id, from, to, cues })), lines: lines.map(({ text, from, to }) => ({ text, from, to })) };
const ts = (f) => (f / FPS).toFixed(2);
console.log(`\n對齊方式：${method}${faInfo?.confidence !== undefined ? `（信心 ${faInfo.confidence}）` : ""}；總長 ${dur.toFixed(2)} 秒＝${total} 幀`);
console.log("畫面段落：\n" + props.segs.map((s) => `  ${s.id.padEnd(6)} ${ts(s.from)}–${ts(s.to)}s  cue ${Object.entries(s.cues).map(([k, v]) => `${k}@${ts(v)}`).join(" ")}`).join("\n"));
console.log("字幕：\n" + lines.map((l) => `  ${ts(l.from)}–${ts(l.to)}s（念到 ${l.t0.toFixed(2)}）${l.text}`).join("\n"));
const tag = PREVIEW ? "preview" : "cpi_ai_test";
const srt = lines.map((l, i) => { const t = (f) => { const ms = Math.round((f / FPS) * 1000); const p = (n, w = 2) => String(n).padStart(w, "0"); return `${p(Math.floor(ms / 3600000))}:${p(Math.floor(ms / 60000) % 60)}:${p(Math.floor(ms / 1000) % 60)},${p(ms % 1000, 3)}`; }; return `${i + 1}\n${t(l.from)} --> ${t(l.to)}\n${l.text}\n`; }).join("\n");
fs.writeFileSync(path.join(WORK, `${tag}.srt`), srt);
fs.writeFileSync(path.join(WORK, `${tag}.timeline.json`), JSON.stringify({ audio, dur, method, fa: faInfo, words: tokens.filter(isSpoken).map(({ t, seg, start, end }) => ({ t, seg: SEGS[seg].id, start: +start.toFixed(3), end: +end.toFixed(3) })), ...props }, null, 1));

// ───────── 磁碟 ─────────
const avail = () => Number(execFileSync("df", ["-Pk", "/"]).toString().trim().split("\n")[1].split(/\s+/)[3]) / 1048576;
console.log(`\n💾 可用 ${avail().toFixed(2)} GB`);
if (avail() < 1) { for (const f of fs.readdirSync(WORK)) if (/\.video\.mp4$/.test(f)) fs.rmSync(path.join(WORK, f)); console.log(`  清掉 out/cpi/ 中間檔後：${avail().toFixed(2)} GB`); }
if (avail() < 0.3) { console.error("✖ 磁碟不足"); process.exit(1); }

// ───────── 渲染（無聲畫面）─────────
const { renderMedia, selectComposition } = await import("@remotion/renderer");
const { BROWSER, makeBundle, chromiumOptions } = await import("../lib.mjs");
await import("../fetch-fonts.mjs");
const serveUrl = await makeBundle();
const ro = { serveUrl, inputProps: props, browserExecutable: BROWSER, chromiumOptions };
const comp = await selectComposition({ ...ro, id: "CpiVideo" });
const vid = path.join(WORK, `${tag}.video.mp4`);
let last = -1; const t0 = Date.now();
await renderMedia({ ...ro, composition: comp, codec: "h264", pixelFormat: "yuv420p", colorSpace: "bt709", muted: true, outputLocation: vid, concurrency: 4,
  onProgress: ({ progress }) => { const p = Math.floor(progress * 10); if (p !== last) { last = p; process.stdout.write(`render ${p * 10}%  `); } } });
console.log(`\n✔ 畫面 ${comp.durationInFrames} 幀（${Math.round((Date.now() - t0) / 1000)} 秒）`);

// ───────── 混音：只有這條旁白（AAC），不加音樂 ─────────
const out = opt.out ? path.resolve(opt.out) : PREVIEW ? path.join(WORK, "preview.mp4") : path.join(path.dirname(audio), "cpi_ai_test.mp4");
execFileSync("ffmpeg", ["-v", "error", "-y", "-i", vid, "-i", audio, "-map", "0:v:0", "-map", "1:a:0", "-c:v", "copy", "-c:a", "aac", "-b:a", "192k", "-ar", "48000", "-ac", "2", "-movflags", "+faststart", out]);
fs.rmSync(vid);
const probe = JSON.parse(execFileSync("ffprobe", ["-v", "error", "-show_entries", "stream=codec_type,codec_name,width,height,r_frame_rate,duration:format=duration", "-of", "json", out]).toString());
const v = probe.streams.find((x) => x.codec_type === "video"), a = probe.streams.find((x) => x.codec_type === "audio");
const okp = v?.codec_name === "h264" && v.width === 1080 && v.height === 1920 && v.r_frame_rate === "30/1" && a?.codec_name === "aac" && probe.streams.length === 2;
console.log(`${okp ? "✔" : "✖"} ffprobe：${v?.codec_name} ${v?.width}x${v?.height} ${v?.r_frame_rate}fps ${(+v?.duration).toFixed(2)}s ｜ ${a?.codec_name} ${(+a?.duration).toFixed(2)}s ｜ 音檔 ${dur.toFixed(2)}s ｜ ${out}`);
if (!okp) process.exit(1);
if (!PREVIEW && !opt["no-copy"]) { const cp = path.join(ROOT, "out", "cpi_ai_test.mp4"); if (path.resolve(cp) !== out) { fs.copyFileSync(out, cp); console.log(`✔ 複製到 ${cp}`); } }

// ───────── 自查截圖：每段中間各一張 ＋ 拼圖 ─────────
const dir = path.join(WORK, "check");
for (const f of fs.readdirSync(dir)) if (f.startsWith(tag)) fs.rmSync(path.join(dir, f));
const shots = props.segs.map((s, i) => {
  const t = ((s.from + s.to) / 2 + 0.5) / FPS, f = path.join(dir, `${tag}-${i + 1}-${s.id}.png`);
  execFileSync("ffmpeg", ["-v", "error", "-y", "-ss", t.toFixed(3), "-i", out, "-frames:v", "1", f]);
  const ln = lines.find((l) => (s.from + s.to) / 2 >= l.from && (s.from + s.to) / 2 < l.to);
  return { f, label: `${i + 1} ${s.id}  ${t.toFixed(2)}s`, sub: ln?.text ?? "" };
});
const sheet = PREVIEW ? path.join(WORK, "preview-sheet.png") : path.join(dir, `${tag}-sheet.png`);
const py = `
import json,sys
from PIL import Image, ImageDraw, ImageFont
shots=json.loads(sys.argv[1]); out=sys.argv[2]
tw,th,pad,lab=360,640,16,44
W=3*tw+4*pad; H=2*(th+lab)+3*pad
im=Image.new("RGB",(W,H),(20,24,36)); d=ImageDraw.Draw(im)
try: font=ImageFont.truetype("DejaVuSans-Bold.ttf",24)
except Exception: font=ImageFont.load_default()
for i,s in enumerate(shots):
  x=pad+(i%3)*(tw+pad); y=pad+(i//3)*(th+lab+pad)
  im.paste(Image.open(s["f"]).convert("RGB").resize((tw,th)),(x,y+lab))
  d.text((x+4,y+8),s["label"],fill=(230,236,255),font=font)
im.save(out)
`;
execFileSync(path.join(ROOT, ".venv/bin/python"), ["-c", py, JSON.stringify(shots), sheet]);
console.log(`✔ 自查截圖 ${dir}/${tag}-*.png\n✔ 拼圖 ${sheet}`);

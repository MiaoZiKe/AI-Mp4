// node scripts/dossier/recording-timeline.mjs <slug> <錄音.wav（public/ 底下的相對路徑）> <錄音涵蓋前幾幕>
// 使用者自備的旁白錄音只念了前面幾幕時用：涵蓋到的幕用 CTC 強制對齊（scripts/fa.py，本機、不花任何請求）的真時間，
// 影片時間＝錄音時間（不搬動、不加速、保留原本的句間停頓）；錄音沒念到的幕接在後面，照 silent-timeline.mjs 的估法（音節數 ÷ RATE）。
// 寫出 videos/<slug>/timeline.json（version 2，格式同 align.mjs；estimated 標記留著，並多一個 recording 欄位記錄哪幾幕是真時間）。
// 不寫 timeline.voice：畫面照常渲成無聲檔，旁白另外用 ffmpeg 合進去（不加背景音樂與音效）。
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { splitPhrases, SUB_MAX_EM_V2, clean } from "../validate.mjs";

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "../..");
const [slug, recRel, nRecStr] = process.argv.slice(2);
const N_REC = Number(nRecStr);
if (!slug || !recRel || !(N_REC > 0)) { console.error("用法：node scripts/dossier/recording-timeline.mjs <slug> <audio/<slug>/take.wav> <涵蓋幕數>"); process.exit(2); }
const dir = path.join(ROOT, "videos", slug), tlPath = path.join(dir, "timeline.json");
const script = JSON.parse(fs.readFileSync(path.join(dir, "script.json"), "utf8"));

// ── 強制對齊：錄音 × 前 N_REC 幕的念稿 ──
const recScenes = script.scenes.slice(0, N_REC), texts = recScenes.map((s) => s.tts ?? s.narration);
const py = fs.existsSync(path.join(ROOT, ".venv/bin/python")) ? path.join(ROOT, ".venv/bin/python") : "python3";
const fa = JSON.parse(execFileSync(py, [path.join(ROOT, "scripts/fa.py")], { input: JSON.stringify([{ id: "rec", file: path.join("public", recRel), text: texts.join("") }]), cwd: ROOT, stdio: ["pipe", "pipe", "ignore"], maxBuffer: 1 << 26 }).toString())[0];
if (!fa?.ok) { console.error("✖ 強制對齊失敗"); process.exit(1); }
/** 把一幕的字幕字（去標點）對到念稿字的時間：LCS 對得上的直接用，對不上的（33↔三十三）在前後兩個錨點之間平均分 */
const mapTimes = (subChars, units) => {
  const a = subChars, b = units.map((u) => u.ch), n = a.length, m = b.length;
  const dp = Array.from({ length: n + 1 }, () => new Int32Array(m + 1));
  for (let i = n - 1; i >= 0; i--) for (let j = m - 1; j >= 0; j--) dp[i][j] = a[i] === b[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
  const t = new Array(n).fill(null);
  for (let i = 0, j = 0; i < n && j < m;) { if (a[i] === b[j]) { t[i] = units[j].start; i++; j++; } else if (dp[i + 1][j] >= dp[i][j + 1]) i++; else j++; }
  for (let i = 0; i < n; i++) if (t[i] === null) {
    let p = i - 1, q = i; while (q < n && t[q] === null) q++;
    const t0 = p >= 0 ? t[p] : units[0].start - (q < n ? (t[q] - units[0].start) / (q - p) : 0), t1 = q < n ? t[q] : units.at(-1).end;
    for (let k = i; k < q; k++) t[k] = t0 + ((t1 - t0) * (k - p)) / (q - p);
    if (p < 0) t[0] = units[0].start;
    i = q - 1;
  }
  return t;
};
const real = [];
{ let off = 0; for (const [k, s] of recScenes.entries()) {
  const units = fa.units.filter((u) => u.i >= off && u.i < off + texts[k].length); off += texts[k].length;
  if (!units.length) { console.error(`✖ ${s.id} 在錄音裡沒有對到任何字`); process.exit(1); }
  const sc = units.map((u) => u.score);
  real.push({ vs: units[0].start, ve: units.at(-1).end, units, confidence: +(sc.reduce((p, c) => p + c, 0) / sc.length).toFixed(3), minScore: Math.min(...sc) });
} }
const FPS = 30, TRANS = 10, SUB_LEAD = 3, MIN_SCENE_F = 45, EXIT_AFTER_VOICE = 2, HEAD_F = 5;
const RATE = Number(process.env.SILENT_RATE ?? 4.9), GAP = Number(process.env.SILENT_GAP ?? 0.3), TAIL_END_F = Number(process.env.ALIGN_TAIL_END_F ?? 18);
/** 念出來的音節數：中文字與數字各 1；單一英文字母 1；英文單字約每 2.2 個字母 1 個音節 */
const syllables = (t) => (String(t).match(/[A-Za-z]+|[0-9]|[一-鿿]/g) ?? []).reduce((a, w) => a + (/^[A-Za-z]{2,}$/.test(w) ? Math.ceil(w.length / 2.2) : 1), 0);

const out = [];
let prevEnd = 0, prevGap = 0;
for (const [i, s] of script.scenes.entries()) {
  if (s.silent === true && s.durationSec > 0 && i === script.scenes.length - 1) { // 無旁白的最後一幕（片尾卡）：排法照 align.mjs 的 buildV2
    const p = out[i - 1], startFrame = Math.max(p.startFrame + MIN_SCENE_F, p.voiceEndFrame - EXIT_AFTER_VOICE);
    out.push({ id: s.id, audio: null, audioFrame: startFrame, audioSec: 0, headSilSec: 0, tailSilSec: 0, startFrame, durationFrames: Math.max(MIN_SCENE_F, Math.round(s.durationSec * FPS)), transitionFrames: TRANS,
      transition: { type: "fade", frames: TRANS, exit: [0, 5], enter: [3, 8] }, voiceStartFrame: startFrame + TRANS, voiceEndFrame: startFrame + TRANS, stillFrame: 0, silent: true,
      subtitleWindow: null, sourceWindow: [startFrame + Math.ceil(TRANS / 2), 0], lines: [], keywords: [], isEnd: true, cues: [], sub: "", provider: "estimate", syllables: 0, words: [], charTimes: [] });
    continue;
  }
  const sub = s.subtitle.zh, syl = syllables(s.tts ?? s.narration), R = real[i], dur = R ? R.ve - R.vs : syl / RATE;
  // 每個字幕字（去標點）的時間：平均分配，換行處多停一下
  const charTimes = [];
  let units = 0;
  for (const ch of sub) { if (ch === "\n") units += 1.2; else if (clean(ch).length) { charTimes.push(units); units += 1; } }
  for (let k = 0; k < charTimes.length; k++) charTimes[k] = +((charTimes[k] / units) * dur).toFixed(3);
  if (R) { const tt = mapTimes([...clean(sub)], R.units); for (let k = 0; k < charTimes.length; k++) charTimes[k] = +Math.max(0, tt[k] - R.vs).toFixed(3); }
  const vs = R ? R.vs : prevEnd + prevGap, ve = vs + dur;
  prevEnd = ve; prevGap = typeof s.pauseAfter === "number" && s.pauseAfter > 0 ? s.pauseAfter : GAP;
  const audioFrame = Math.round(vs * FPS), voiceStartFrame = Math.floor(vs * FPS), voiceEndFrame = Math.ceil(ve * FPS);
  const p = out[i - 1];
  // cutDelayF（script.json 該幕）：這一鏡的畫面比預設晚幾幀才換進來（前一鏡最後一個標籤需要多停一下時用；聲音不動）
  const headF = typeof s.headSec === "number" && s.headSec > 0 ? Math.max(TRANS, Math.round(s.headSec * FPS)) : TRANS;   // 開口前只有畫面（headSec；錄音要先用 scripts/three/pad-recording.mjs 補靜音）
  const startFrame = i === 0 ? 0 : Math.max(p.startFrame + MIN_SCENE_F, voiceStartFrame - headF, p.voiceEndFrame - EXIT_AFTER_VOICE) + Math.max(0, Math.round(Number(s.cutDelayF ?? 0)));
  const subIn = i === 0 ? 0 : voiceStartFrame - SUB_LEAD;
  const af = (t, lead) => audioFrame + Math.round((t - lead) * FPS);
  const lines = [];
  let idx = 0;
  for (const [li, l] of splitPhrases(sub, s.keywords ?? [], SUB_MAX_EM_V2).entries()) {
    const start = li === 0 ? subIn : Math.max(subIn, af(charTimes[idx] ?? 0, 0.12));
    let last = start;
    const chars = [...l].map((ch) => { if (clean(ch).length) { last = Math.max(start, af(charTimes[idx] ?? 0, 0.05)); idx++; } return last; });
    lines.push({ text: l, start, chars });
  }
  const cl = clean(sub);
  const cues = (s.cues ?? []).map((q) => {
    const t = clean(q.text);
    let pos = -1;
    for (let k = 0; k < (q.occurrence ?? 1); k++) pos = cl.indexOf(t, pos + 1);
    if (pos < 0) console.warn(`⚠ ${s.id}: cue「${q.text}」不在字幕裡`);
    return { id: q.id, text: q.text, frame: pos < 0 ? null : af(charTimes[pos], 0) };
  });
  const keywords = (s.keywords ?? []).map((k) => { const pos = cl.indexOf(clean(k)); return { text: k, start: pos < 0 ? subIn : Math.max(subIn, af(charTimes[pos], 0.05)) }; });
  out.push({ id: s.id, audio: null, audioFrame, audioSec: +dur.toFixed(3), headSilSec: 0, tailSilSec: 0, startFrame, durationFrames: 0, transitionFrames: i === 0 ? 0 : TRANS,
    transition: i === 0 ? null : { type: "fade", frames: TRANS, exit: [0, 5], enter: [3, 8] }, voiceStartFrame, voiceEndFrame, stillFrame: 0,
    subtitleWindow: [subIn, 0], sourceWindow: [i === 0 ? 0 : startFrame + Math.ceil(TRANS / 2), 0], pauseAfter: s.pauseAfter || undefined,
    lines, keywords, cues, sub, provider: R ? "recording+fa" : "estimate", syllables: syl, words: [], charTimes, ...(R ? { fa: { confidence: R.confidence, minScore: R.minScore } } : {}) });
}
for (const [i, x] of out.entries()) {
  const n = out[i + 1];
  if (!x.silent) x.durationFrames = n ? n.startFrame + n.transitionFrames - x.startFrame : Math.max(MIN_SCENE_F, x.voiceEndFrame + TAIL_END_F - x.startFrame);
  x.stillFrame = n ? n.startFrame : x.startFrame + x.durationFrames - 12;
  if (x.subtitleWindow) x.subtitleWindow[1] = n ? (n.subtitleWindow ? n.subtitleWindow[0] : n.startFrame + n.transitionFrames) : x.startFrame + x.durationFrames;
  x.sourceWindow[1] = n ? n.sourceWindow[0] : x.startFrame + x.durationFrames;
}
const last = out[out.length - 1], totalFrames = last.startFrame + last.durationFrames;
const tl = { version: 2, slug, fps: FPS, totalFrames, totalSec: +(totalFrames / FPS).toFixed(2), gapSec: GAP, transitionFrames: TRANS,
  ...(N_REC >= out.filter((x) => !x.silent).length ? {} : { estimated: { note: `前 ${N_REC} 幕＝使用者錄音的真時間（強制對齊）；其餘各幕錄音沒念到，是無聲估算（scripts/dossier/recording-timeline.mjs）`, rate: RATE, gap: GAP, tailEndFrames: TAIL_END_F, partial: true } }),
  recording: { file: recRel, scenes: recScenes.map((s) => s.id), sec: fa.audioSec, confidence: fa.confidence, minScore: fa.minScore, lastVoiceSec: real.at(-1).ve }, scenes: out };
fs.writeFileSync(tlPath, JSON.stringify(tl, null, 1));
const syl = out.reduce((a, x) => a + x.syllables, 0);
console.log(`✔ ${path.relative(ROOT, tlPath)}（前 ${N_REC} 幕真時間、對齊信心 ${fa.confidence}；其餘估算）：${tl.totalSec} 秒、${totalFrames} 幀；${syl} 個音節、每秒 ${RATE} 個、幕間停 ${GAP} 秒、片尾留 ${TAIL_END_F} 幀`);
for (const x of out) console.log(`  ${x.id}  ${x.startFrame}–${x.startFrame + x.durationFrames}  人聲 ${x.voiceStartFrame}–${x.voiceEndFrame}  ${x.cues.map((q) => `${q.id}@${q.frame}`).join(" ")}`);

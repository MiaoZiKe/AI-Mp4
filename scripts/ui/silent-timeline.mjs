// node scripts/ui/silent-timeline.mjs <slug> [--force]
// 還沒配音時用：照念稿的音節數估每一幕的人聲長度，寫出格式和 align.mjs 一樣的 videos/<slug>/timeline.json（version 2），
// 讓 still／render 先出無聲版。畫面的時間仍然全部寫 cue id；配音後跑 tts-take → align 會整份覆蓋這個檔，畫面自動對上真的聲音。
// 估法：每幕人聲＝音節數 ÷ RATE（預設 4.9 音節/秒）；幕與幕之間停 GAP 秒（預設 0.3；該幕有 pauseAfter 就用它）；
//       幕內每個字平均分配，字幕裡每個換行（\n）多停 1.2 個字的時間。排版規則（開口前 10 幀轉場、字幕早 3 幀、片尾留 ALIGN_TAIL_END_F 幀）照 align.mjs 的 buildV2。
// 已經有真的配音時間軸（沒有 estimated 標記）就不覆蓋，除非加 --force。
import fs from "node:fs";
import path from "node:path";
import { splitPhrases, SUB_MAX_EM_V2, clean } from "../validate.mjs";

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "../..");
const slug = process.argv.slice(2).find((a) => !a.startsWith("--"));
if (!slug) { console.error("用法：node scripts/ui/silent-timeline.mjs <slug> [--force]"); process.exit(2); }
const dir = path.join(ROOT, "videos", slug), tlPath = path.join(dir, "timeline.json");
const script = JSON.parse(fs.readFileSync(path.join(dir, "script.json"), "utf8"));
if (fs.existsSync(tlPath) && !JSON.parse(fs.readFileSync(tlPath, "utf8")).estimated && !process.argv.includes("--force")) { console.error(`✖ ${slug} 已經有配音時間軸，不覆蓋（確定要蓋掉再加 --force）`); process.exit(1); }

const FPS = 30, TRANS = 10, SUB_LEAD = 3, MIN_SCENE_F = 45, EXIT_AFTER_VOICE = 2, HEAD_F = 5;
const RATE = Number(process.env.SILENT_RATE ?? 4.9), GAP = Number(process.env.SILENT_GAP ?? 0.3), TAIL_END_F = Number(process.env.ALIGN_TAIL_END_F ?? 18);
/** 念出來的音節數：中文字與數字各 1；單一英文字母 1；英文單字約每 2.2 個字母 1 個音節 */
const syllables = (t) => (String(t).match(/[A-Za-z]+|[0-9]|[一-鿿]/g) ?? []).reduce((a, w) => a + (/^[A-Za-z]{2,}$/.test(w) ? Math.ceil(w.length / 2.2) : 1), 0);

const out = [];
let prevEnd = 0, prevGap = 0;
for (const [i, s] of script.scenes.entries()) {
  const sub = s.subtitle.zh, syl = syllables(s.tts ?? s.narration), dur = syl / RATE;
  // 每個字幕字（去標點）的時間：平均分配，換行處多停一下
  const charTimes = [];
  let units = 0;
  for (const ch of sub) { if (ch === "\n") units += 1.2; else if (clean(ch).length) { charTimes.push(units); units += 1; } }
  for (let k = 0; k < charTimes.length; k++) charTimes[k] = +((charTimes[k] / units) * dur).toFixed(3);
  const vs = i === 0 ? HEAD_F / FPS : prevEnd + prevGap, ve = vs + dur;
  prevEnd = ve; prevGap = typeof s.pauseAfter === "number" && s.pauseAfter > 0 ? s.pauseAfter : GAP;
  const audioFrame = Math.round(vs * FPS), voiceStartFrame = Math.floor(vs * FPS), voiceEndFrame = Math.ceil(ve * FPS);
  const p = out[i - 1];
  const startFrame = i === 0 ? 0 : Math.max(p.startFrame + MIN_SCENE_F, voiceStartFrame - TRANS, p.voiceEndFrame - EXIT_AFTER_VOICE);
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
    lines, keywords, cues, sub, provider: "estimate", syllables: syl, words: [], charTimes });
}
for (const [i, x] of out.entries()) {
  const n = out[i + 1];
  x.durationFrames = n ? n.startFrame + n.transitionFrames - x.startFrame : Math.max(MIN_SCENE_F, x.voiceEndFrame + TAIL_END_F - x.startFrame);
  x.stillFrame = n ? n.startFrame : x.startFrame + x.durationFrames - 12;
  x.subtitleWindow[1] = n ? n.subtitleWindow[0] : x.startFrame + x.durationFrames;
  x.sourceWindow[1] = n ? n.sourceWindow[0] : x.startFrame + x.durationFrames;
}
const last = out[out.length - 1], totalFrames = last.startFrame + last.durationFrames;
const tl = { version: 2, slug, fps: FPS, totalFrames, totalSec: +(totalFrames / FPS).toFixed(2), gapSec: GAP, transitionFrames: TRANS,
  estimated: { note: "無聲估算時間軸（scripts/ui/silent-timeline.mjs）；配音後跑 tts-take → align 會覆蓋", rate: RATE, gap: GAP, tailEndFrames: TAIL_END_F }, scenes: out };
fs.writeFileSync(tlPath, JSON.stringify(tl, null, 1));
const syl = out.reduce((a, x) => a + x.syllables, 0);
console.log(`✔ ${path.relative(ROOT, tlPath)}（估算）：${tl.totalSec} 秒、${totalFrames} 幀；${syl} 個音節、每秒 ${RATE} 個、幕間停 ${GAP} 秒、片尾留 ${TAIL_END_F} 幀`);
for (const x of out) console.log(`  ${x.id}  ${x.startFrame}–${x.startFrame + x.durationFrames}  人聲 ${x.voiceStartFrame}–${x.voiceEndFrame}  ${x.cues.map((q) => `${q.id}@${q.frame}`).join(" ")}`);

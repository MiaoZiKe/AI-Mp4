// node scripts/three/silent-timeline.mjs <slug>：沒有配音時，依各幕 durationSec 排一條「無聲時間軸」（timeline.json version 2），
// 讓 styleVersion 3 的 still／render 可以先出無聲版。字在每幕的發聲區間裡平均排開（cue、字幕短語都照這個算），
// 不放任何音檔（scenes[].audio = null、沒有 voice）。拿到真正的配音後走正常流程（tts-take → align），會整份覆蓋這個檔。
// 2026/11/14 為 videos/short-tech 新增；不改 align.mjs。
import fs from "node:fs";
import path from "node:path";
import { splitPhrases, SUB_MAX_EM_V2, clean } from "../validate.mjs";
import { writeStoryboard } from "../subs.mjs";

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "../..");
const slug = process.argv[2];
if (!slug) { console.error("用法：node scripts/three/silent-timeline.mjs <slug>"); process.exit(1); }
const sp = path.join(ROOT, "videos", slug, "script.json");
const script = JSON.parse(fs.readFileSync(sp, "utf8"));
const FPS = 30, LEAD_F = 4, TAIL_F = 10, SUB_LEAD = 3;

let t = 0;
const scenes = script.scenes.map((s, i) => {
  const dur = Math.round((s.durationSec ?? clean(s.subtitle.zh).length / 5 + 1) * FPS);
  const startFrame = t; t += dur;
  const vs = startFrame + (i === 0 ? 0 : LEAD_F), ve = startFrame + dur - TAIL_F;
  const cl = clean(s.subtitle.zh);
  // 每個字的開口幀（平均排開）
  const charF = [...cl].map((_, k) => Math.round(vs + ((ve - vs) * k) / Math.max(1, cl.length)));
  const subIn = i === 0 ? 0 : vs - SUB_LEAD;
  const lines = [];
  let idx = 0;
  for (const [li, l] of splitPhrases(s.subtitle.zh, s.keywords ?? [], SUB_MAX_EM_V2).entries()) {
    const st = li === 0 ? subIn : Math.max(subIn, (charF[idx] ?? ve) - 4);
    let last = st;
    const chars = [...l].map((ch) => { if (clean(ch).length) { last = Math.max(st, (charF[idx] ?? ve) - 2); idx++; } return last; });
    lines.push({ text: l, start: st, chars });
  }
  const cues = (s.cues ?? []).map((q) => {
    let p = -1; const tx = clean(q.text);
    for (let k = 0; k < (q.occurrence ?? 1); k++) p = cl.indexOf(tx, p + 1);
    if (p < 0) console.warn(`⚠ ${s.id}: cue「${q.text}」不在字幕裡`);
    return { id: q.id, text: q.text, frame: p < 0 ? null : charF[p] };
  });
  const keywords = (s.keywords ?? []).map((k) => { const p = cl.indexOf(clean(k)); return { text: k, start: p < 0 ? subIn : Math.max(subIn, charF[p] - 2) }; });
  return { id: s.id, audio: null, audioFrame: vs, audioSec: 0, headSilSec: 0, tailSilSec: 0, startFrame, durationFrames: dur, transitionFrames: 0, transition: null,
    voiceStartFrame: vs, voiceEndFrame: ve, stillFrame: 0, subtitleWindow: [subIn, 0], sourceWindow: [startFrame, 0], lines, keywords, cues, sub: s.subtitle.zh, silentEstimate: true };
});
for (const [i, x] of scenes.entries()) {
  const n = scenes[i + 1];
  x.stillFrame = n ? n.startFrame - 1 : x.startFrame + x.durationFrames - 12;
  x.subtitleWindow[1] = n ? n.subtitleWindow[0] : x.startFrame + x.durationFrames;
  x.sourceWindow[1] = n ? n.sourceWindow[0] : x.startFrame + x.durationFrames;
}
const totalFrames = t;
const tl = { version: 2, slug, fps: FPS, totalFrames, totalSec: Number((totalFrames / FPS).toFixed(2)), gapSec: 0, transitionFrames: 0, silent: true,
  _說明: "無聲時間軸（scripts/three/silent-timeline.mjs 依 durationSec 估算，字平均排開）；有配音後 tts-take → align 會覆蓋", scenes };
fs.writeFileSync(path.join(ROOT, "videos", slug, "timeline.json"), JSON.stringify(tl, null, 1));
try { writeStoryboard?.(slug, script, tl); } catch (e) { console.warn(`⚠ storyboard.json 沒寫：${e.message}`); }
console.log(`✔ videos/${slug}/timeline.json（無聲）：${totalFrames} 幀、${tl.totalSec} 秒`);
for (const x of scenes) console.log(`  ${x.id} ${x.startFrame}–${x.startFrame + x.durationFrames}  cues ${x.cues.map((q) => `${q.id}@${q.frame}`).join(" ")}`);

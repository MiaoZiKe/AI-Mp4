// node scripts/caffaine/make-endcard-timeline.mjs <slug>
// 只有片尾卡的測試片用：直接寫出 videos/<slug>/timeline.json（沒有旁白，長度＝片尾卡時間表的 total 幀）。
// 一般的片（有旁白）照正常流程：silent-timeline.mjs（無聲預覽）或 tts-take → align（配音版），最後一幕寫 silent: true 的 caffend 就會自動排在最後。
import fs from "node:fs";
import path from "node:path";
const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "../..");
const slug = process.argv[2];
const TL = JSON.parse(fs.readFileSync(path.join(ROOT, "src/components/ai-iso/caffaineTimeline.json"), "utf8"));
const script = JSON.parse(fs.readFileSync(path.join(ROOT, "videos", slug, "script.json"), "utf8"));
const s = script.scenes[0], n = TL.total;
const tl = { version: 2, slug, fps: 30, totalFrames: n, totalSec: +(n / 30).toFixed(3), estimated: true, scenes: [{
  id: s.id, audio: null, audioFrame: 0, audioSec: 0, headSilSec: 0, tailSilSec: 0, startFrame: 0, durationFrames: n, transitionFrames: 0,
  transition: null, voiceStartFrame: 0, voiceEndFrame: 0, stillFrame: n - 1, silent: true, subtitleWindow: null, sourceWindow: [0, 0], lines: [], keywords: [], isEnd: true, cues: [], sub: "", provider: "estimate", syllables: 0, words: [], charTimes: [] }] };
fs.writeFileSync(path.join(ROOT, "videos", slug, "timeline.json"), JSON.stringify(tl, null, 1));
console.log(`✔ videos/${slug}/timeline.json：${n} 幀（${(n / 30).toFixed(2)} 秒）`);

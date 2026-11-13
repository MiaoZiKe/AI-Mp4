// node scripts/chat/sfx.mjs <slug>：對話泡泡片的音效事件。依 timeline.json 的 cue 算出每則訊息跳出來的幀（pop）與統計卡上色的幀（chime），
// 寫進 script.json 的 audio.events（scripts/mix.mjs 會照這份清單混音）。重新配音或 align 之後要重跑一次，再 npm run mix。
import fs from "node:fs";
import path from "node:path";
const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "../..");
const slug = process.argv[2];
const sp = path.join(ROOT, "videos", slug, "script.json");
const script = JSON.parse(fs.readFileSync(sp, "utf8")), tl = JSON.parse(fs.readFileSync(path.join(ROOT, "videos", slug, "timeline.json"), "utf8"));
const LEAD = 3; // 和 src/components/chat/engine.ts 的 CUE_LEAD 一致
const by = Object.fromEntries(tl.scenes.map((t, i) => [t.id, { t, exit: tl.scenes[i + 1]?.startFrame ?? tl.totalFrames }]));
const frameOf = (at, sid) => {
  const m = /^(?:([^:\s]+):)?([^\s+-]+)([+-]\d+)?$/.exec(at), s = by[m[1] ?? sid], off = Number(m[3] ?? 0);
  if (m[2] === "start") return s.t.startFrame + off;
  if (m[2] === "voice") return s.t.voiceStartFrame + off;
  if (m[2] === "end") return s.t.voiceEndFrame + off;
  if (m[2] === "exit") return s.exit + off;
  return s.t.cues.find((q) => q.id === m[2]).frame - LEAD + off;
};
const events = [];
for (const sc of script.scenes) for (const ev of sc.props?.events ?? []) {
  if (ev.type === "bubble" || ev.type === "card") events.push({ type: "pop", frame: frameOf(ev.at, sc.id), why: `${sc.id} ${ev.type}` });
  if (ev.type === "stat" && ev.fillAt) events.push({ type: "chime", frame: frameOf(ev.fillAt, sc.id), why: `${sc.id} 統計卡上色` });
}
events.sort((a, b) => a.frame - b.frame);
script.audio = { ...(script.audio ?? {}), events };
fs.writeFileSync(sp, JSON.stringify(script, null, 2) + "\n");
console.log(`✔ ${events.length} 個音效事件寫進 videos/${slug}/script.json：${events.map((e) => `${e.type}@${e.frame}`).join("、")}`);

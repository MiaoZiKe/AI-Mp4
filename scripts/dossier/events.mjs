// node scripts/dossier/events.mjs <slug>：列出檔案室式每一鏡的畫面事件（props 裡所有 at／…At／…Ats、字幕換段、換鏡）落在第幾幀，
// 以及相鄰事件的最大間隔、前 3 秒的事件數。用來檢查「每 1.5–2.5 秒有事件」「前 3 秒 ≥3 個事件」。時間讀 videos/<slug>/timeline.json。
import fs from "node:fs";
import path from "node:path";
const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "../..");
const slug = process.argv[2];
const dir = path.join(ROOT, "videos", slug);
const script = JSON.parse(fs.readFileSync(path.join(dir, "script.json"), "utf8")), tl = JSON.parse(fs.readFileSync(path.join(dir, "timeline.json"), "utf8"));
const by = Object.fromEntries(tl.scenes.map((x) => [x.id, x])), ids = tl.scenes.map((x) => x.id);
const resolve = (spec, sid0) => {
  const r = /^(?:([\w-]+):)?([^\s+:-]+)([+-]\d+)?$/.exec(String(spec)); if (!r) return null;
  const sid = r[1] ?? sid0, t = by[sid], n = by[ids[ids.indexOf(sid) + 1]];
  const base = r[2] === "start" ? t.startFrame : r[2] === "voice" ? t.voiceStartFrame : r[2] === "end" ? t.voiceEndFrame : r[2] === "exit" ? (n ? n.startFrame : tl.totalFrames) : t.cues.find((q) => q.id === r[2])?.frame;
  return base == null ? null : base + Number(r[3] ?? 0);
};
const all = [];
for (const s of script.scenes) {
  const t = by[s.id], ev = [];
  const walk = (v, where) => { if (Array.isArray(v)) v.forEach((x, k) => walk(x, `${where}[${k}]`)); else if (v && typeof v === "object") for (const [k, x] of Object.entries(v)) { if (k === "at" || /At$/.test(k)) ev.push([resolve(x, s.id), `${where}.${k}`]); else if (/Ats$/.test(k)) x.forEach((y, j) => ev.push([resolve(y, s.id), `${where}.${k}[${j}]`])); else walk(x, `${where}.${k}`); } };
  walk(s.props, "");
  t.lines.forEach((l, i) => { if (i) ev.push([l.start, `字幕換段「${l.text}」`]); });
  if (script.news?.link && String(script.news.link.at).startsWith(`${s.id}:`)) ev.push([resolve(script.news.link.at, s.id), "地圖連線"]);
  ev.push([t.startFrame, script.news ? "換鏡（擦切＋電頭＋欄目籤＋出處）" : "換鏡"]);
  const fr = [...new Set(ev.map((e) => Math.max(t.startFrame, e[0])).filter((x) => x != null))].sort((a, b) => a - b);
  const end = by[ids[ids.indexOf(s.id) + 1]]?.startFrame ?? tl.totalFrames;
  const gaps = fr.map((x, i) => (fr[i + 1] ?? end) - x), mx = Math.max(...gaps);
  console.log(`${s.id}  ${t.startFrame}–${end}（${((end - t.startFrame) / tl.fps).toFixed(1)} 秒）事件 ${fr.length} 個：${fr.join(" ")}｜最大間隔 ${(mx / tl.fps).toFixed(2)} 秒${mx > 75 ? "  ⚠ 超過 2.5 秒" : ""}`);
  all.push(...fr);
}
console.log(`前 3 秒（0–89 幀）事件 ${all.filter((x) => x < 90).length} 個；全片 ${all.length} 個、平均每 ${(tl.totalFrames / tl.fps / all.length).toFixed(2)} 秒一個`);

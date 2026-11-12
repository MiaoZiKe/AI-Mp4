// node scripts/v3/proof.mjs [--stills s01,s05] [--clip s07:s09] [--frames 120,300] [--all] [--at s08:order+20]
// v3（桌面紙拼貼）打樣：用假時間軸（依字數估）渲 still 與短樣片到 out/what-is-server/v3-proof/，
// 並把合併後的完整範例寫到 docs/style-v3/proof-script.json。不讀、不寫 videos/<slug>/script.json 與 timeline.json。
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { renderMedia, renderStill, selectComposition } from "@remotion/renderer";
import { ROOT, BROWSER, makeBundle, chromiumOptions } from "../lib.mjs";
import { fakeTimeline } from "./fake-timeline.mjs";
import { SCENES } from "./proof-data.mjs";

await import("../fetch-fonts.mjs");
const slug = "what-is-server";
const arg = (k) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : null; };
const draft = JSON.parse(fs.readFileSync(path.join(ROOT, "videos", slug, "storyboard.draft.json"), "utf8"));
const REAL = process.argv.includes("--real"); // 用 videos/<slug>/script.json＋timeline.json（只讀），props 由 proof-data 覆蓋
const script = REAL ? (() => {
  const r = JSON.parse(fs.readFileSync(path.join(ROOT, "videos", slug, "script.json"), "utf8"));
  r.scenes = r.scenes.map((s) => { const x = SCENES[s.id] ?? {}; return { ...s, component: x.component ?? "PaperScene", props: x.props ?? {}, sources: x.sources ?? s.sources ?? [] }; });
  return r;
})() : {
  slug, title: draft.title, asOf: "2026/11/12", styleVersion: 3,
  scenes: draft.shots.map((s) => {
    const x = SCENES[s.id] ?? {};
    const end = x.component === "EndCard";
    return { id: s.id, beat: end ? undefined : s.beat, narration: end ? "" : s.narration, tts: end ? undefined : s.tts, subtitle: end ? { zh: "", en: "" } : s.subtitle, keywords: x.keywords ?? [], cues: x.cues ?? [],
      component: x.component ?? "PaperScene", props: x.props ?? {}, sources: x.sources ?? [], ...(x.pauseAfter ? { pauseAfter: x.pauseAfter } : {}) };
  }),
};
if (!REAL) fs.writeFileSync(path.join(ROOT, "docs", "style-v3", "proof-script.json"), JSON.stringify(script, null, 1) + "\n");
script.v3 = { assets: JSON.parse(fs.readFileSync(path.join(ROOT, "public", "v3", slug, "meta.json"), "utf8")) };
script.timeline = REAL ? JSON.parse(fs.readFileSync(path.join(ROOT, "videos", slug, "timeline.json"), "utf8")) : fakeTimeline(script);
const tl = script.timeline, by = Object.fromEntries(tl.scenes.map((x) => [x.id, x]));
const out = path.join(ROOT, "out", slug, "v3-proof", ...(REAL ? ["real"] : []));
fs.mkdirSync(out, { recursive: true });
if (!REAL) fs.writeFileSync(path.join(out, "fake-timeline.json"), JSON.stringify(tl, null, 1));
console.log(`ℹ ${REAL ? "配音時間軸" : "假時間軸"}：${tl.totalFrames} 幀（${tl.totalSec}s），${tl.scenes.length} 幕`);

const serveUrl = await makeBundle();
const opts = { serveUrl, inputProps: script, browserExecutable: BROWSER, chromiumOptions, logLevel: "warn" };
const comp = await selectComposition({ ...opts, id: "Video" });
const still = async (frame, name) => { const f = path.join(out, name); await renderStill({ ...opts, composition: comp, frame, output: f }); console.log(`✔ ${path.relative(ROOT, f)} (frame ${frame})`); return f; };
const cueFrame = (spec) => { const [id, at] = spec.split(":"); const t = by[id]; const m = /^([^+-]+)([+-]\d+)?$/.exec(at); const c = (t.cues ?? []).find((q) => q.id === m[1]); return (m[1] === "start" ? t.startFrame : c.frame) + Number(m[2] ?? 0); };

const ids = arg("--stills") ? arg("--stills").split(",") : process.argv.includes("--all") ? script.scenes.map((s) => s.id) : [];
const files = [];
for (const id of ids) files.push(await still(by[id].stillFrame, `${id}.png`));
if (arg("--frames")) for (const fr of arg("--frames").split(",").map(Number)) await still(fr, `f${String(fr).padStart(4, "0")}.png`);
if (arg("--at")) for (const sp of arg("--at").split(",")) await still(cueFrame(sp), `${sp.replace(/[:+]/g, "_")}.png`);
if (process.argv.includes("--all")) {
  const sheet = path.join(out, "overview.png");
  execFileSync("ffmpeg", ["-y", "-loglevel", "error", "-framerate", "1", "-pattern_type", "glob", "-i", path.join(out, "s??.png"), "-vf", `scale=360:640,tile=8x${Math.ceil(files.length / 8)}:padding=10:color=0x1E1B16`, "-frames:v", "1", sheet]);
  console.log(`✔ ${path.relative(ROOT, sheet)}`);
}
if (arg("--clip")) {
  const [a, b] = arg("--clip").split(":");
  const range = [by[a].startFrame, by[b].startFrame + by[b].durationFrames - 1];
  const f = path.join(out, `clip-${a}-${b}.mp4`);
  const t0 = Date.now();
  await renderMedia({ ...opts, composition: comp, codec: "h264", pixelFormat: "yuv420p", outputLocation: f, concurrency: 4, frameRange: range });
  const n = range[1] - range[0] + 1, ms = Date.now() - t0;
  console.log(`✔ ${path.relative(ROOT, f)}：第 ${range[0]}–${range[1]} 幀（${n} 幀，${(n / 30).toFixed(1)}s），${Math.round(ms / n)} ms/幀（concurrency 4，含啟動）`);
  fs.writeFileSync(path.join(out, "clip.json"), JSON.stringify({ file: path.relative(ROOT, f), range, frames: n, renderSec: +(ms / 1000).toFixed(1), msPerFrame: Math.round(ms / n), concurrency: 4 }, null, 1));
}

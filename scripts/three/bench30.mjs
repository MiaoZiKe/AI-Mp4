// node scripts/three/bench30.mjs <slug> [起始幀=150] [幀數=30]：先渲一小段，量 3D 鏡頭每幀要多久（swangle、concurrency 1），再決定要不要渲整支。
import path from "node:path";
import fs from "node:fs";
import { renderMedia, selectComposition } from "@remotion/renderer";
import { ROOT, BROWSER, loadScript, makeBundle, chromiumOptions, renderTuning } from "../lib.mjs";
const slug = process.argv[2], from = Number(process.argv[3] ?? 150), n = Number(process.argv[4] ?? 30);
const script = loadScript(slug);
const serveUrl = await makeBundle();
const opts = { serveUrl, inputProps: script, browserExecutable: BROWSER, chromiumOptions, logLevel: "error" };
const comp = await selectComposition({ ...opts, id: "Video" });
const out = path.join(ROOT, "out", slug, "bench30.mp4");
fs.mkdirSync(path.dirname(out), { recursive: true });
const t0 = Date.now();
await renderMedia({ ...opts, composition: comp, codec: "h264", pixelFormat: "yuv420p", outputLocation: out, concurrency: renderTuning.concurrency, frameRange: [from, from + n - 1], muted: true });
const ms = Date.now() - t0;
console.log(`✔ ${n} 幀（第 ${from}–${from + n - 1} 幀）${(ms / 1000).toFixed(1)} 秒，每幀 ${Math.round(ms / n)} ms（gl ${chromiumOptions.gl}、concurrency ${renderTuning.concurrency}）；整支 ${comp.durationInFrames} 幀估 ${Math.round((ms / n) * comp.durationInFrames / 1000)} 秒`);
fs.writeFileSync(path.join(ROOT, "out", slug, "bench30.json"), JSON.stringify({ from, frames: n, sec: +(ms / 1000).toFixed(1), msPerFrame: Math.round(ms / n), gl: chromiumOptions.gl, concurrency: renderTuning.concurrency }, null, 1));

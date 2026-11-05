// node scripts/bench.mjs <slug> [from] [count]：渲染一小段計時，用來比較動畫成本
import path from "node:path";
import { renderMedia, selectComposition } from "@remotion/renderer";
import { ROOT, BROWSER, loadScript, makeBundle, chromiumOptions } from "./lib.mjs";
const [slug, fromArg = "300", countArg = "60"] = process.argv.slice(2);
const script = loadScript(slug);
const serveUrl = await makeBundle();
const opts = { serveUrl, inputProps: script, browserExecutable: BROWSER, chromiumOptions };
const comp = await selectComposition({ ...opts, id: "Video" });
const from = Number(fromArg), count = Number(countArg);
const t0 = Date.now();
await renderMedia({ ...opts, composition: comp, codec: "h264", outputLocation: path.join(ROOT, "out", "bench.mp4"), concurrency: 4, frameRange: [from, from + count - 1], scale: Number(process.env.BENCH_SCALE ?? 1) });
const ms = Date.now() - t0;
console.log(`${count} frames in ${(ms / 1000).toFixed(1)}s → ${(ms / count).toFixed(0)} ms/frame → 每 60 秒影片約 ${(1800 * ms / count / 60000).toFixed(1)} 分鐘`);

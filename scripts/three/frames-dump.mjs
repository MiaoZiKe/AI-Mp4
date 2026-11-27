// node scripts/three/frames-dump.mjs <slug> <輸出資料夾> <幀,幀,...|a-b/step,...> [--scale 1]：一次打包、逐幀存原尺寸單張 f<幀>.png（幕界／關鍵格抽看用）。
import fs from "node:fs";
import path from "node:path";
import { renderStill, selectComposition } from "@remotion/renderer";
import { BROWSER, loadScript, makeBundle, chromiumOptions } from "../lib.mjs";
const [slug, outDir, list] = process.argv.slice(2);
const si = process.argv.indexOf("--scale"); const scale = si > 0 ? Number(process.argv[si + 1]) : 1;
await import("../fetch-fonts.mjs");
const script = loadScript(slug);
const frames = [];
for (const sp of list.split(",")) { const m = /^(\d+)-(\d+)\/(\d+)$/.exec(sp); if (m) for (let f = +m[1]; f <= +m[2]; f += +m[3]) frames.push(f); else frames.push(+sp); }
const serveUrl = await makeBundle();
const opts = { serveUrl, inputProps: script, browserExecutable: BROWSER, chromiumOptions, logLevel: "error" };
const comp = await selectComposition({ ...opts, id: "Video" });
fs.mkdirSync(outDir, { recursive: true });
for (const fr of frames) { const f = path.join(outDir, `f${String(fr).padStart(4, "0")}.png`); if (fs.existsSync(f) && !process.env.FORCE) continue; await renderStill({ ...opts, composition: comp, frame: Math.max(0, Math.min(comp.durationInFrames - 1, fr)), output: f, scale }); }
console.log(`✔ ${frames.length} 幀 → ${outDir}`);

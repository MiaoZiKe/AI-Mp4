// npm run render <slug>：輸出 out/<slug>.mp4（H.264, 1080x1920, 30fps）
import path from "node:path";
import fs from "node:fs";
import { renderMedia, selectComposition } from "@remotion/renderer";
import { ROOT, BROWSER, loadScript, makeBundle, chromiumOptions } from "./lib.mjs";
import { synthesize } from "./tts.mjs";

await import("./fetch-fonts.mjs");
const slug = process.argv[2];
const script = loadScript(slug);
script.audio = await synthesize(script);
const serveUrl = await makeBundle();
const opts = { serveUrl, inputProps: script, browserExecutable: BROWSER, chromiumOptions };
const comp = await selectComposition({ ...opts, id: "Video" });
fs.mkdirSync(path.join(ROOT, "out"), { recursive: true });
const out = path.join(ROOT, "out", `${slug}.mp4`);
let last = -1;
await renderMedia({ ...opts, composition: comp, codec: "h264", pixelFormat: "yuv420p", colorSpace: "bt709", outputLocation: out, concurrency: 4,
  onProgress: ({ progress }) => { const p = Math.floor(progress * 10); if (p !== last) { last = p; console.log(`render ${p * 10}%`); } } });
console.log(`✔ ${path.relative(ROOT, out)}  ${(comp.durationInFrames / comp.fps).toFixed(1)}s`);

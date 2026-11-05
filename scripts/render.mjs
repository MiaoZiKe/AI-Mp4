// npm run render <slug>：輸出 out/<slug>.mp4（H.264, 1080x1920, 30fps）
// 有 videos/<slug>/timeline.json（npm run tts + npm run align 產生）→ 配音版；否則無聲版（字數估算長度）
import path from "node:path";
import fs from "node:fs";
import { execFileSync } from "node:child_process";
import { renderMedia, selectComposition } from "@remotion/renderer";
import { ROOT, BROWSER, loadScript, makeBundle, chromiumOptions } from "./lib.mjs";

await import("./fetch-fonts.mjs");
const slug = process.argv[2];
const script = loadScript(slug);
if (!script.timeline) console.log(`ℹ 沒有 videos/${slug}/timeline.json → 無聲版（先 npm run tts ${slug} && npm run align ${slug} 可得配音版）`);
const serveUrl = await makeBundle();
const opts = { serveUrl, inputProps: script, browserExecutable: BROWSER, chromiumOptions };
const comp = await selectComposition({ ...opts, id: "Video" });
fs.mkdirSync(path.join(ROOT, "out"), { recursive: true });
const out = path.join(ROOT, "out", `${slug}.mp4`);
let last = -1;
await renderMedia({ ...opts, composition: comp, codec: "h264", pixelFormat: "yuv420p", colorSpace: "bt709", outputLocation: out, concurrency: 4,
  onProgress: ({ progress }) => { const p = Math.floor(progress * 10); if (p !== last) { last = p; console.log(`render ${p * 10}%`); } } });
const probe = execFileSync("ffprobe", ["-v", "error", "-show_entries", "stream=codec_type,codec_name,width,height,r_frame_rate:format=duration", "-of", "compact=p=0:nk=1", out]).toString().trim().replace(/\n/g, " | ");
console.log(`✔ ${path.relative(ROOT, out)}  ${(comp.durationInFrames / comp.fps).toFixed(1)}s\n  ffprobe: ${probe}`);

// npm run render <slug>：輸出 out/<slug>.mp4（H.264, 1080x1920, 30fps, AAC）
// 流程：Remotion 渲染無聲畫面 → 合成 BGM／音效（／旁白）→ ffmpeg 混音並封裝
import path from "node:path";
import fs from "node:fs";
import { renderMedia, selectComposition } from "@remotion/renderer";
import { ROOT, BROWSER, loadScript, makeBundle, chromiumOptions } from "./lib.mjs";
import { synthesize } from "./tts.mjs";
import { mixAudio } from "./mix.mjs";

await import("./fetch-fonts.mjs");
const slug = process.argv[2];
const script = loadScript(slug);
const narration = await synthesize(script);
script.audio = null; // 音訊統一在 mix 階段處理
const serveUrl = await makeBundle();
const opts = { serveUrl, inputProps: script, browserExecutable: BROWSER, chromiumOptions };
const comp = await selectComposition({ ...opts, id: script.composition?.video ?? "Video" });
const work = path.join(ROOT, "out", slug);
fs.mkdirSync(work, { recursive: true });
const silent = path.join(work, "silent.mp4");
let last = -1;
await renderMedia({ ...opts, composition: comp, codec: "h264", pixelFormat: "yuv420p", colorSpace: "bt709", outputLocation: silent, concurrency: 4, muted: true,
  onProgress: ({ progress }) => { const p = Math.floor(progress * 10); if (p !== last) { last = p; console.log(`render ${p * 10}%`); } } });
const out = path.join(ROOT, "out", `${slug}.mp4`);
mixAudio(script, silent, out, path.join(work, "audio"), narration);
console.log(`✔ ${path.relative(ROOT, out)}  ${(comp.durationInFrames / comp.fps).toFixed(1)}s  ${narration ? "含旁白" : "無旁白（音樂＋音效）"}`);

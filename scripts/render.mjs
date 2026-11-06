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
if (process.env.AUDIT === "1") script.audit = true; // 量測用：關掉 ambient 動作（見 scripts/audit/README.md）
if (!script.timeline) console.log(`ℹ 沒有 videos/${slug}/timeline.json → 無聲版（先 npm run tts ${slug} && npm run align ${slug} 可得配音版）`);
const serveUrl = await makeBundle();
const opts = { serveUrl, inputProps: script, browserExecutable: BROWSER, chromiumOptions };
const comp = await selectComposition({ ...opts, id: "Video" });
fs.mkdirSync(path.join(ROOT, "out"), { recursive: true });
const out = path.join(ROOT, "out", `${slug}${script.audit ? "-audit" : ""}.mp4`);
const t0 = Date.now();
let last = -1;
await renderMedia({ ...opts, composition: comp, codec: "h264", pixelFormat: "yuv420p", colorSpace: "bt709", outputLocation: out, concurrency: 4,
  onProgress: ({ progress }) => { const p = Math.floor(progress * 10); if (p !== last) { last = p; console.log(`render ${p * 10}%`); } } });
const ms = Date.now() - t0;
if (!script.audit) fs.writeFileSync(path.join(ROOT, "out", `${slug}.render.json`), JSON.stringify({ frames: comp.durationInFrames, renderSec: Math.round(ms / 1000), msPerFrame: Math.round(ms / comp.durationInFrames), concurrency: 4, at: new Date().toISOString() }, null, 1));
const probe = execFileSync("ffprobe", ["-v", "error", "-show_entries", "stream=codec_type,codec_name,width,height,r_frame_rate:format=duration", "-of", "compact=p=0:nk=1", out]).toString().trim().replace(/\n/g, " | ");
const nFrames = Number(execFileSync("ffprobe", ["-v", "error", "-count_packets", "-select_streams", "v:0", "-show_entries", "stream=nb_read_packets", "-of", "csv=p=0", out]).toString().trim());
if (nFrames !== comp.durationInFrames) console.warn(`⚠ ffprobe 幀數 ${nFrames} ≠ composition ${comp.durationInFrames}`);
else console.log(`✔ ffprobe 幀數 ${nFrames} ＝ composition ＝ timeline`);
console.log(`✔ ${path.relative(ROOT, out)}  ${(comp.durationInFrames / comp.fps).toFixed(1)}s（${comp.durationInFrames} 幀，${Math.round(ms / comp.durationInFrames)} ms/幀）\n  ffprobe: ${probe}`);

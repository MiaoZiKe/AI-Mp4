// npm run render <slug>：輸出完整影片 out/<slug>.mp4（含 -20dB 合成背景音樂）與封面
import fs from "node:fs";
import path from "node:path";
import { execFileSync, spawnSync } from "node:child_process";
import { renderMedia, renderStill, selectComposition } from "@remotion/renderer";
import { synthBgm } from "./bgm.mjs";
import { ROOT, browserExecutable, buildProps, chromiumOptions, getSlug, makeBundle } from "./lib.mjs";

const slug = getSlug();
const { props, voiced } = buildProps(slug);
const work = path.join(ROOT, "out", slug);
fs.mkdirSync(work, { recursive: true });
const serveUrl = await makeBundle();
const composition = await selectComposition({ serveUrl, id: "Main", inputProps: props, browserExecutable, chromiumOptions });
const seconds = composition.durationInFrames / composition.fps;
console.log(`▸ ${composition.durationInFrames} frames（${seconds.toFixed(2)} 秒）${voiced ? "，含配音" : "，無配音版"}`);

const raw = path.join(work, "video-raw.mp4");
let last = -1;
// --mix-only：沿用已 render 的畫面，只重做混音
if (!(process.argv.includes("--mix-only") && fs.existsSync(raw))) await renderMedia({
  composition, serveUrl, codec: "h264", outputLocation: raw, inputProps: props, browserExecutable, chromiumOptions,
  pixelFormat: "yuv420p", crf: 18, concurrency: Number(process.env.CONCURRENCY ?? 3), muted: !voiced,
  onProgress: ({ progress }) => {
    const pct = Math.floor(progress * 20) * 5;
    if (pct !== last) { last = pct; console.log(`  render ${pct}%`); }
  },
});

// 背景音樂：合成後量測平均音量，調整到約 -20 dB
const bgmRaw = path.join(work, "bgm-raw.wav");
synthBgm(seconds, bgmRaw);
const det = spawnSync("ffmpeg", ["-hide_banner", "-i", bgmRaw, "-af", "volumedetect", "-f", "null", "-"], { encoding: "utf8" }).stderr;
const mean = parseFloat(det.match(/mean_volume:\s*(-?[\d.]+) dB/)?.[1] ?? "-20");
const gain = -20 - mean;
console.log(`▸ BGM mean ${mean.toFixed(1)} dB → 增益 ${gain.toFixed(1)} dB`);

const out = path.join(ROOT, "out", `${slug}.mp4`);
const bgmFilter = `[1:a]volume=${gain.toFixed(2)}dB,atrim=0:${seconds.toFixed(3)}[bg]`;
const args = voiced
  ? ["-i", raw, "-i", bgmRaw, "-filter_complex", `${bgmFilter};[0:a][bg]amix=inputs=2:duration=first:normalize=0[a]`, "-map", "0:v", "-map", "[a]"]
  : ["-i", raw, "-i", bgmRaw, "-filter_complex", bgmFilter, "-map", "0:v", "-map", "[bg]"];
execFileSync("ffmpeg", ["-y", "-loglevel", "error", ...args, "-c:v", "copy", "-c:a", "aac", "-b:a", "192k", "-shortest", "-movflags", "+faststart", out]);
console.log(`  ✓ ${path.relative(ROOT, out)}`);

const cover = await selectComposition({ serveUrl, id: "Cover", inputProps: props, browserExecutable, chromiumOptions });
const coverOut = path.join(ROOT, "out", `${slug}-cover.png`);
await renderStill({ composition: cover, serveUrl, output: coverOut, inputProps: props, browserExecutable, chromiumOptions });
console.log(`  ✓ ${path.relative(ROOT, coverOut)}`);

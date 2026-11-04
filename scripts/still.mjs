// npm run still <slug>：輸出每幕截圖 + 總覽圖 + 封面
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { renderStill, selectComposition } from "@remotion/renderer";
import { ROOT, browserExecutable, buildProps, chromiumOptions, getSlug, makeBundle } from "./lib.mjs";

const slug = getSlug();
const { script, props, frames } = buildProps(slug);
const outDir = path.join(ROOT, "out", slug, "stills");
fs.mkdirSync(outDir, { recursive: true });
const serveUrl = await makeBundle();
const composition = await selectComposition({ serveUrl, id: "Main", inputProps: props, browserExecutable, chromiumOptions });

let start = 0;
const files = [];
for (let i = 0; i < script.scenes.length; i++) {
  const s = script.scenes[i];
  // 取動畫完成、淡出之前的畫面
  const frame = start + Math.round(frames[i] * 0.82);
  const output = path.join(outDir, `${String(i + 1).padStart(2, "0")}-${s.id}.png`);
  await renderStill({ composition, serveUrl, output, frame, inputProps: props, browserExecutable, chromiumOptions });
  console.log(`  ✓ ${path.relative(ROOT, output)} (frame ${frame})`);
  files.push(output);
  start += frames[i];
}

const cover = await selectComposition({ serveUrl, id: "Cover", inputProps: props, browserExecutable, chromiumOptions });
const coverOut = path.join(ROOT, "out", `${slug}-cover.png`);
await renderStill({ composition: cover, serveUrl, output: coverOut, inputProps: props, browserExecutable, chromiumOptions });
console.log(`  ✓ ${path.relative(ROOT, coverOut)}`);

// 總覽圖（4 欄）
const cols = 4;
const rows = Math.ceil(files.length / cols);
const overview = path.join(ROOT, "out", `${slug}-overview.png`);
const inputs = files.flatMap((f) => ["-i", f]);
const filters = files.map((_, i) => `[${i}:v]scale=360:640[v${i}]`).join(";");
const layout = files.map((_, i) => `${(i % cols) * 360}_${Math.floor(i / cols) * 640}`).join("|");
execFileSync("ffmpeg", ["-y", "-loglevel", "error", ...inputs, "-filter_complex", `${filters};${files.map((_, i) => `[v${i}]`).join("")}xstack=inputs=${files.length}:layout=${layout}:fill=black`, "-frames:v", "1", overview]);
console.log(`  ✓ ${path.relative(ROOT, overview)} (${cols}x${rows})`);

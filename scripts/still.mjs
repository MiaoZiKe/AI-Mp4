// npm run still <slug>：每幕截一張圖 + 封面 + 總覽圖（有 timeline 時用配音長度）
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { renderStill, selectComposition } from "@remotion/renderer";
import { ROOT, BROWSER, loadScript, makeBundle, chromiumOptions, sceneFrames } from "./lib.mjs";

await import("./fetch-fonts.mjs");
const slug = process.argv[2];
const script = loadScript(slug);
const outDir = path.join(ROOT, "out", slug, "stills");
fs.rmSync(outDir, { recursive: true, force: true });
fs.mkdirSync(outDir, { recursive: true });
const serveUrl = await makeBundle();
const opts = { serveUrl, inputProps: script, browserExecutable: BROWSER, chromiumOptions };
const comp = await selectComposition({ ...opts, id: "Video" });

let t = 0;
const files = [];
for (const [i, s] of script.scenes.entries()) {
  const n = sceneFrames(s, script.timeline);
  const frame = t + n - 12; // 動畫結束、淡出前（配音版：字幕每行都已出現）
  t += n;
  const file = path.join(outDir, `${String(i + 1).padStart(2, "0")}-${s.id}.png`);
  await renderStill({ ...opts, composition: comp, frame, output: file });
  files.push(file);
  console.log(`✔ ${path.relative(ROOT, file)} (frame ${frame})`);
}
const cover = await selectComposition({ ...opts, id: "Cover" });
const coverFile = path.join(ROOT, "out", `${slug}-cover.png`);
await renderStill({ ...opts, composition: cover, frame: 0, output: coverFile });
console.log(`✔ ${path.relative(ROOT, coverFile)}`);

// 總覽圖（ffmpeg tile）
const sheet = path.join(ROOT, "out", `${slug}-overview.png`);
const cols = 6, rows = Math.ceil(files.length / cols);
execFileSync("ffmpeg", ["-y", "-loglevel", "error", "-framerate", "1", "-pattern_type", "glob", "-i", path.join(outDir, "*.png"),
  "-vf", `scale=360:640,tile=${cols}x${rows}:padding=12:color=0x0B1026`, "-frames:v", "1", sheet], { stdio: "inherit", shell: false });
console.log(`✔ ${path.relative(ROOT, sheet)}`);

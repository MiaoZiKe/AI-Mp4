// node scripts/frames.mjs <slug> <frame,frame,...> [out.png]：渲染指定幀並橫向拼接（檢查轉場、字幕換句用；scale 0.5）
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { renderStill, selectComposition } from "@remotion/renderer";
import { ROOT, BROWSER, loadScript, makeBundle, chromiumOptions } from "./lib.mjs";
const [slug, list, outArg] = process.argv.slice(2);
const script = loadScript(slug);
const serveUrl = await makeBundle();
const opts = { serveUrl, inputProps: script, browserExecutable: BROWSER, chromiumOptions };
const comp = await selectComposition({ ...opts, id: "Video" });
const dir = path.join(ROOT, "out", slug, "frames");
fs.mkdirSync(dir, { recursive: true });
const files = [];
for (const fr of list.split(",").map(Number)) {
  const file = path.join(dir, `f${String(fr).padStart(5, "0")}.png`);
  await renderStill({ ...opts, composition: comp, frame: fr, output: file, scale: 0.5 });
  files.push(file);
}
const out = outArg ?? path.join(ROOT, "out", `${slug}-frames.png`);
execFileSync("ffmpeg", ["-y", "-loglevel", "error", ...files.flatMap((f) => ["-i", f]), "-filter_complex", `${files.map((_, i) => `[${i}]`).join("")}hstack=${files.length}`, out]);
console.log(`✔ ${path.relative(ROOT, out)}`);

// node scripts/caffaine/still-frames.mjs <slug> <幀,幀,...> <輸出資料夾>   存主片（composition Video）指定幀
import fs from "node:fs";
import path from "node:path";
import { renderStill, selectComposition } from "@remotion/renderer";
import { BROWSER, loadScript, makeBundle, chromiumOptions } from "../lib.mjs";
await import("../fetch-fonts.mjs");
const [slug, frames, dir] = process.argv.slice(2);
const script = loadScript(slug);
const serveUrl = await makeBundle();
const opts = { serveUrl, inputProps: script, browserExecutable: BROWSER, chromiumOptions };
const comp = await selectComposition({ ...opts, id: "Video" });
fs.mkdirSync(dir, { recursive: true });
for (const f of frames.split(",").map(Number)) await renderStill({ ...opts, composition: comp, frame: f, output: path.join(dir, `f${String(f).padStart(4, "0")}.png`) });
console.log("✔", dir);

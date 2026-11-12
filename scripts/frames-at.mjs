// node scripts/frames-at.mjs <slug> <outDir> <frame,frame,...>：渲指定絕對幀（回歸比對、打樣用）
import fs from "node:fs";
import path from "node:path";
import { renderStill, selectComposition } from "@remotion/renderer";
import { ROOT, BROWSER, loadScript, makeBundle, chromiumOptions } from "./lib.mjs";
await import("./fetch-fonts.mjs");
const [slug, outDir, list] = process.argv.slice(2);
const script = loadScript(slug);
fs.mkdirSync(outDir, { recursive: true });
const serveUrl = await makeBundle();
const opts = { serveUrl, inputProps: script, browserExecutable: BROWSER, chromiumOptions };
const comp = await selectComposition({ ...opts, id: "Video" });
for (const fr of list.split(",").map(Number)) {
  const file = path.join(outDir, `${slug}-f${fr}.png`);
  await renderStill({ ...opts, composition: comp, frame: fr, output: file });
  console.log(`✔ ${path.relative(ROOT, file)}`);
}

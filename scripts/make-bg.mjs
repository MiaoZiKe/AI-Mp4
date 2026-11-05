// 預先渲染背景靜態圖：public/bg/base.png（格線＋中央光暈）、public/bg/blob.png（漂移光暈，透明底）
import fs from "node:fs";
import path from "node:path";
import { renderStill, selectComposition } from "@remotion/renderer";
import { ROOT, BROWSER, makeBundle, chromiumOptions } from "./lib.mjs";
const dir = path.join(ROOT, "public", "bg");
fs.mkdirSync(dir, { recursive: true });
const serveUrl = await makeBundle();
const opts = { serveUrl, browserExecutable: BROWSER, chromiumOptions };
for (const [id, file] of [["BackgroundStatic", "base.png"], ["GlowBlob", "blob.png"]]) {
  const comp = await selectComposition({ ...opts, id });
  await renderStill({ ...opts, composition: comp, frame: 0, output: path.join(dir, file), imageFormat: "png" });
  console.log(`✔ public/bg/${file}`);
}

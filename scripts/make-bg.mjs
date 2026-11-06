// 預先渲染背景靜態圖：public/bg/base.png（格線＋中央光暈）、public/bg/blob.png（漂移光暈，透明底）
import fs from "node:fs";
import path from "node:path";
import { renderStill, selectComposition } from "@remotion/renderer";
import { ROOT, BROWSER, makeBundle, chromiumOptions } from "./lib.mjs";
const dir = path.join(ROOT, "public", "bg");
fs.mkdirSync(dir, { recursive: true });
const serveUrl = await makeBundle();
const opts = { serveUrl, browserExecutable: BROWSER, chromiumOptions };
// v1：base.png、blob.png；styleVersion 2（A 奶油編輯）：base-v2.png（米白＋圓點紙紋）
const only = process.argv[2];
const all = [["BackgroundStatic", "base.png"], ["GlowBlob", "blob.png"], ["BackgroundStaticV2", "base-v2.png"]];
for (const [id, file] of all.filter(([, f]) => !only || f === only)) {
  const comp = await selectComposition({ ...opts, id });
  await renderStill({ ...opts, composition: comp, frame: 0, output: path.join(dir, file), imageFormat: "png" });
  console.log(`✔ public/bg/${file}`);
}

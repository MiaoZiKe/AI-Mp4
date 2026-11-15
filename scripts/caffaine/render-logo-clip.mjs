// node scripts/caffaine/render-logo-clip.mjs still <tall|square> <幀,幀,...> [輸出資料夾]   存指定幀
// node scripts/caffaine/render-logo-clip.mjs video <tall|square> <輸出.mp4>                   渲整段（無聲）
import fs from "node:fs";
import path from "node:path";
import { renderMedia, renderStill, selectComposition } from "@remotion/renderer";
import { ROOT, BROWSER, makeBundle, chromiumOptions } from "../lib.mjs";
await import("../fetch-fonts.mjs");
const [mode, fmt, arg, dir] = process.argv.slice(2);
const id = fmt === "square" ? "CaffLogoClipSquare" : "CaffLogoClipTall";
const serveUrl = await makeBundle();
const opts = { serveUrl, browserExecutable: BROWSER, chromiumOptions };
const comp = await selectComposition({ ...opts, id });
if (mode === "still") {
  const out = path.resolve(dir ?? path.join(ROOT, "out/caffaine-logo-anim/frames")); fs.mkdirSync(out, { recursive: true });
  for (const fr of arg.split(",").map(Number)) await renderStill({ ...opts, composition: comp, frame: fr, output: path.join(out, `${fmt}-${String(fr).padStart(3, "0")}.png`) });
  console.log("✔ stills", out);
} else {
  await renderMedia({ ...opts, composition: comp, codec: "h264", pixelFormat: "yuv420p", colorSpace: "bt709", outputLocation: path.resolve(arg), concurrency: 4 });
  console.log("✔", arg);
}

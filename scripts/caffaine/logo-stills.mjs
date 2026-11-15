// node scripts/caffaine/logo-stills.mjs [A B C D]   新 LOGO 四款的靜態示意圖 → out/caffaine-logo-v2/
// 每款三張：<v>-square.png（1080×1080 淺底橫式大圖）、<v>-phone.png（1080×1920 片尾構圖示意）、<v>-header.png（左上角小版本實際大小，1080×150 裁切）；再拼 overview.png。
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { renderStill, selectComposition } from "@remotion/renderer";
import { ROOT, BROWSER, makeBundle, chromiumOptions } from "../lib.mjs";
await import("../fetch-fonts.mjs");
const vs = process.argv.slice(2).filter((a) => /^[A-D]$/.test(a)), list = vs.length ? vs : ["A", "B", "C", "D"];
const out = path.join(ROOT, "out", "caffaine-logo-v2"); fs.mkdirSync(out, { recursive: true });
const serveUrl = await makeBundle();
if (process.argv.includes("--probe")) {
  // 量每款圖形的外框：白底上渲一張大圖，找出非白的範圍，換算回 viewBox 座標（加 20 的邊）寫進 caffLogoVb.json
  const vb = {}; const { default: sharp } = await import("sharp").catch(() => ({ default: null }));
  for (const v of ["A", "B", "C", "D"]) {
    const inputProps = { variant: v, layout: "probe" };
    const comp = await selectComposition({ serveUrl, id: "CaffLogoStill", inputProps, browserExecutable: BROWSER, chromiumOptions });
    const raw = path.join(out, `probe-${v}.png`);
    await renderStill({ serveUrl, composition: comp, inputProps, frame: 0, output: raw, browserExecutable: BROWSER, chromiumOptions });
    const r = execFileSync("python3", ["-c", `from PIL import Image;import numpy as np;a=np.array(Image.open('${raw}').convert('RGB')).astype(int);m=(a.sum(2)<740);ys,xs=np.where(m);print(xs.min(),ys.min(),xs.max(),ys.max())`]).toString().trim().split(" ").map(Number);
    const k = 1800 / 1080, pad = 24, [x0, y0, x1, y1] = r;
    vb[v] = [Math.round(-900 + x0 * k - pad), Math.round(-900 + y0 * k - pad), Math.round((x1 - x0) * k + 2 * pad), Math.round((y1 - y0) * k + 2 * pad)];
    console.log(v, vb[v]);
  }
  fs.writeFileSync(path.join(ROOT, "src/components/ai-iso/caffLogoVb.json"), JSON.stringify(vb));
  process.exit(0);
}
for (const v of list) for (const layout of ["square", "phone"]) {
  const inputProps = { variant: v, layout };
  const comp = await selectComposition({ serveUrl, id: "CaffLogoStill", inputProps, browserExecutable: BROWSER, chromiumOptions });
  const raw = path.join(out, `${v}-${layout}.raw.png`);
  await renderStill({ serveUrl, composition: comp, inputProps, frame: 0, output: raw, browserExecutable: BROWSER, chromiumOptions });
  const f = (a) => execFileSync("ffmpeg", ["-y", "-loglevel", "error", ...a]);
  if (layout === "square") f(["-i", raw, "-vf", "crop=1080:1080:0:0", path.join(out, `${v}-square.png`)]);
  else { f(["-i", raw, path.join(out, `${v}-phone.png`)]); f(["-i", raw, "-vf", "crop=1080:150:0:200", path.join(out, `${v}-header.png`)]); }
  fs.rmSync(raw);
  console.log(`✔ ${v}-${layout}`);
}

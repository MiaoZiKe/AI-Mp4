// node scripts/three/make-brand-tex.mjs <slug> flag:JP flag:US logo:dnp text:tmc=台灣光罩|2338 …
// 2026/11/24 tech-mask2：把國旗（Brand.tsx 程式繪製、官方比例與色碼）與公司 LOGO（public/logos 原檔，不改色）轉成 3D 貼圖用的 PNG：
//   flag-<CODE>.png  國旗本身（寬高照官方比例）
//   sign-<id>.png    白色廠牌：白底＋LOGO 原檔置中（只放大縮小，不改色）
//   sign-<id>.png（text:）沒有原檔可用的公司：白底＋深藍字名牌（不仿商標）
// 輸出到 public/tex/brand/（不進 git；genmodel.py 每次重產），寬高比寫在 public/tex/brand/meta.json 給 genmodel 量貼圖尺寸。
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { pathToFileURL } from "node:url";
import { build } from "esbuild";

const require = createRequire(import.meta.url);
const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "../..");
const items = process.argv.slice(3);
const outDir = path.join(ROOT, "public", "tex", "brand");
fs.mkdirSync(outDir, { recursive: true });
const tmp = path.join(ROOT, "out", ".bundle", `brandtex-${process.pid}`);
fs.mkdirSync(tmp, { recursive: true });
process.on("exit", () => fs.rmSync(tmp, { recursive: true, force: true }));
const entry = path.join(tmp, "entry.tsx");
const extra = ["BrandWafer"].filter((n) => fs.existsSync(path.join(ROOT, "src/components/three", `${n}.tsx`)));
fs.writeFileSync(entry, `import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { FLAGS, LOGOS } from ${JSON.stringify(path.join(ROOT, "src/components/three/Brand"))};
${extra.map((n) => `import ${JSON.stringify(path.join(ROOT, "src/components/three", n))};`).join("\n")}
export const flag = (c: string) => { const d = FLAGS[c]; if (!d) return null; return { w: d.w, h: d.h, svg: renderToStaticMarkup(<svg xmlns="http://www.w3.org/2000/svg" viewBox={\`0 0 \${d.w} \${d.h}\`} width="100%" height="100%" preserveAspectRatio="none">{d.draw()}</svg>) }; };
export const logos = LOGOS;
`);
const outfile = path.join(tmp, "entry.mjs");
await build({ entryPoints: [entry], bundle: true, platform: "node", format: "esm", outfile, logLevel: "error", jsx: "automatic",
  plugins: [{ name: "stub-remotion", setup(b) { b.onResolve({ filter: /^remotion$/ }, () => ({ path: "remotion", namespace: "stub" })); b.onLoad({ filter: /.*/, namespace: "stub" }, () => ({ contents: "export const Img=()=>null; export const staticFile=(s)=>s;", loader: "js" })); } }],
  banner: { js: "import { createRequire as __cr } from 'module'; const require = __cr(import.meta.url);" } });
const { flag, logos } = await import(pathToFileURL(outfile).href);

const mfp = path.join(ROOT, "public", "fonts", "manifest.json");
const faces = fs.existsSync(mfp) ? JSON.parse(fs.readFileSync(mfp, "utf8")).map((f) => `@font-face{font-family:"${f.family}";font-weight:${f.weight};src:url("${pathToFileURL(path.join(ROOT, "public", f.file)).href}") format("woff2");unicode-range:${f.unicodeRange};}`).join("\n") : "";
const { chromium } = require("playwright");
const browser = await chromium.launch();
const meta = fs.existsSync(path.join(outDir, "meta.json")) ? JSON.parse(fs.readFileSync(path.join(outDir, "meta.json"), "utf8")) : {};
const shoot = async (name, w, h, body) => {
  const pg = await browser.newPage({ viewport: { width: w, height: h } });
  await pg.setContent(`<!doctype html><html><head><meta charset="utf-8"><style>${faces}html,body{margin:0;padding:0;width:${w}px;height:${h}px;overflow:hidden}</style></head><body>${body}</body></html>`);
  await pg.evaluate(async () => { await document.fonts.ready; await Promise.all([...document.images].map((i) => i.decode().catch(() => {}))); });
  await pg.screenshot({ path: path.join(outDir, `${name}.png`), omitBackground: false });
  await pg.close();
  meta[name] = { w, h, aspect: +(w / h).toFixed(4) };
  console.log(`  ${name}.png ${w}×${h}`);
};
const BORDER = "#C9D1DD", INK = "#14213D";
for (const it of items) {
  const [kind, rest] = [it.split(":")[0], it.split(":").slice(1).join(":")];
  if (kind === "flag") {
    const f = flag(rest); if (!f) { console.error(`沒有國旗 ${rest}`); process.exitCode = 1; continue; }
    const H = 256, W = Math.round((H * f.w) / f.h);
    await shoot(`flag-${rest}`, W, H, `<div style="width:${W}px;height:${H}px">${f.svg}</div>`);
  } else if (kind === "logo") {
    const s = logos[rest]; if (!s) { console.error(`沒有 LOGO ${rest}`); process.exitCode = 1; continue; }
    // 廠牌：LOGO 高 200px（太扁的 LOGO 以寬 900px 為上限），四周留白
    let lh = 200, lw = Math.round((lh * s.w) / s.h);
    if (lw > 900) { lw = 900; lh = Math.round((lw * s.h) / s.w); }
    const W = lw + 120, H = lh + 120;
    await shoot(`sign-${rest}`, W, H, `<div style="width:${W - 12}px;height:${H - 12}px;background:#FFFFFF;border:6px solid ${BORDER};display:flex;align-items:center;justify-content:center"><img src="data:${s.file.endsWith(".svg") ? "image/svg+xml" : "image/png"};base64,${fs.readFileSync(path.join(ROOT, "public", s.file)).toString("base64")}" style="width:${lw}px;height:${lh}px"></div>`);
  } else if (kind === "text") {
    const [id, txt] = rest.split("="), [l1, l2] = (txt ?? id).split("|");
    const W = 760, H = 320;
    await shoot(`sign-${id}`, W, H, `<div style="width:${W - 12}px;height:${H - 12}px;background:#FFFFFF;border:6px solid ${BORDER};display:flex;flex-direction:column;align-items:center;justify-content:center;font-family:'Inter','Noto Sans TC';color:${INK}"><div style="font-size:120px;font-weight:900;line-height:1.1">${l1}</div>${l2 ? `<div style="font-size:64px;font-weight:900;line-height:1.2;color:#4B5675">${l2}</div>` : ""}</div>`);
  }
}
await browser.close();
fs.writeFileSync(path.join(outDir, "meta.json"), JSON.stringify(meta, null, 1));

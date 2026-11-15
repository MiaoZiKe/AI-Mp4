// node scripts/caffaine/ov-check.mjs <slug> [每幾幀一張=6] [上限幀]   版面檢查（程式，量真實 DOM）：
//   每隔 N 幀渲一張圖（script 帶 ovcheck: true 時，AgentIso 會把每個 data-ov 元素的框、小於 28px 的文字、桌面四角用 console.log 回報），
//   檢查：① data-ov 元素兩兩不相交（世界裡的「標籤」只和別的 UI 比，不和桌面比）② 說明卡／步驟／細節／選項卡不壓到桌面 ③ 文字不出框（scrollWidth）④ DOM 文字 ≥28px
//   ⑤ 上下邊緣連續空白 ≤60px（用圖）⑥ LOGO 每幀同位置。結果寫 out/<slug>/ov-report.json。
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { renderStill, selectComposition } from "@remotion/renderer";
import { ROOT, BROWSER, loadScript, makeBundle, chromiumOptions } from "../lib.mjs";
await import("../fetch-fonts.mjs");
const [slug, stepA, maxA] = process.argv.slice(2), step = Number(stepA ?? 6);
const script = loadScript(slug); script.ovcheck = true;
const serveUrl = await makeBundle();
let cur = null; const reports = {};
const opts = { serveUrl, inputProps: script, browserExecutable: BROWSER, chromiumOptions, onBrowserLog: (l) => { if (l.text?.startsWith("OVREPORT ")) { const r = JSON.parse(l.text.slice(9)); reports[r.f] = r; } } };
const comp = await selectComposition({ ...opts, id: "Video" });
const total = Math.min(comp.durationInFrames, Number(maxA ?? 1e9)), dir = path.join(ROOT, "out", slug, "ov"); fs.mkdirSync(dir, { recursive: true });
const only = process.argv.find((a) => a.startsWith("--frames="));
const frames = []; if (only) frames.push(...only.slice(9).split(",").map(Number)); else for (let f = 0; f < total; f += step) frames.push(f);
for (const f of frames) await renderStill({ ...opts, composition: comp, frame: f, output: path.join(dir, `f${String(f).padStart(4, "0")}.png`) });
const hit = (a, b) => a.x < b.x + b.w - 3 && b.x < a.x + a.w - 3 && a.y < b.y + b.h - 3 && b.y < a.y + a.h - 3;
const UI = new Set(["說明卡", "步驟1", "步驟2", "步驟3", "細節", "標籤chip", "鉤子大字", "鉤子大字2", "選項卡", "下一集卡"]);
const segInter = (p, q, r, s2) => { const d = (a, b, c) => (c[1] - a[1]) * (b[0] - a[0]) - (b[1] - a[1]) * (c[0] - a[0]); return d(p, r, s2) * d(q, r, s2) < 0 && d(p, q, r) * d(p, q, s2) < 0; };
const rectPoly = (b) => { const k = [[b.x, b.y], [b.x + b.w, b.y], [b.x + b.w, b.y + b.h], [b.x, b.y + b.h]]; return k; };
const inPoly = (pt, poly) => { let c = false; for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) if ((poly[i][1] > pt[1]) !== (poly[j][1] > pt[1]) && pt[0] < ((poly[j][0] - poly[i][0]) * (pt[1] - poly[i][1])) / (poly[j][1] - poly[i][1]) + poly[i][0]) c = !c; return c; };
const polyHit = (b, poly) => { const rp = rectPoly(b); if (rp.some((p) => inPoly(p, poly)) || poly.some((p) => inPoly(p, rp))) return true; for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) if (segInter(rp[i], rp[(i + 1) % 4], poly[j], poly[(j + 1) % 4])) return true; return false; };
const issues = []; let logoRef = null;
for (const f of frames) {
  const r = reports[f]; if (!r) { issues.push(`f${f} 沒有收到回報`); continue; }
  const bx = r.boxes;
  for (let i = 0; i < bx.length; i++) {
    const a = bx[i];
    if (a.ovf) issues.push(`f${f} ${a.n} 文字超出框`);
    if (a.x < -1 || a.x + a.w > 1081 || a.y < -1 || a.y + a.h > 1921) issues.push(`f${f} ${a.n} 超出畫面`);
    for (let j = i + 1; j < bx.length; j++) if (hit(a, bx[j])) issues.push(`f${f} ${a.n} × ${bx[j].n} 重疊`);
    if (UI.has(a.n) && r.desk && polyHit(a, r.desk)) issues.push(`f${f} ${a.n} 壓到桌面`);
    if (a.n === "LOGO") { const k = [a.x, a.y, a.w, a.h].map(Math.round).join(","); if (!logoRef) logoRef = k; else if (k !== logoRef) issues.push(`f${f} LOGO 位置改變 ${k} ≠ ${logoRef}`); }
  }
  for (const s of r.small) issues.push(`f${f} DOM 文字「${s.t}」${s.fs}px < 28px`);
}
// 上下邊緣空白
let topMax = 0, botMax = 0;
for (const f of frames) {
  const raw = execFileSync("python3", ["-c", `
from PIL import Image
import numpy as np
a=np.array(Image.open('${path.join(dir, `f${String(f).padStart(4, "0")}.png`)}').convert('RGB')).astype(int)
ref=a[:, :3, :].mean(1)
d=(np.abs(a-ref[:,None,:]).sum(2)>36).any(1)
t=int(np.argmax(d)) if d.any() else 1920
b=int(np.argmax(d[::-1])) if d.any() else 1920
print(t,b)`]).toString().trim().split(" ").map(Number);
  topMax = Math.max(topMax, raw[0]); botMax = Math.max(botMax, raw[1]);
  if (raw[0] > 60 || raw[1] > 60) issues.push(`f${f} 上緣空白 ${raw[0]}px／下緣空白 ${raw[1]}px > 60`);
}
fs.writeFileSync(path.join(ROOT, "out", slug, "ov-report.json"), JSON.stringify({ frames: frames.length, step, issues, topMax, botMax }, null, 1));
const uniq = [...new Set(issues.map((x) => x.replace(/^f\d+ /, "")))];
console.log(`版面檢查（程式）：${frames.length} 幀（每 ${step} 幀），${issues.length} 筆；上緣最大空白 ${topMax}px、下緣 ${botMax}px`);
for (const u of uniq.slice(0, 25)) console.log("  ", u, "×", issues.filter((x) => x.endsWith(u)).length);

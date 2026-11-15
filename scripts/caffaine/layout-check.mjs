// node scripts/caffaine/layout-check.mjs   版面檢查：片尾卡每一幀，主要東西（頁首 LOGO、進度條、圖形、八個字母、標語、留言列）兩兩不得相交，
// 也不得跑出畫面或伸進上下 220px 之外的平台介面區以外的音量條帶（最高 200px）。框的算法和畫面共用 caffaineEnd.ts。特效粒子（鎖定迸開、星光）與背景音量條不算主要東西。
import { build } from "../../node_modules/esbuild/lib/main.js";
import fs from "node:fs";
import path from "node:path";
const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "../..");
const outfile = path.join(ROOT, "out", ".caffaine-layout.mjs");
await build({ entryPoints: [path.join(ROOT, "src/components/ai-iso/caffaineEnd.ts")], bundle: true, format: "esm", outfile, loader: { ".json": "json" }, logLevel: "error" });
const m = await import(outfile + "?t=" + Date.now());
const hit = (a, b) => a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h;
const bars = [{ name: "上音量條", x: 0, y: 0, w: m.W, h: m.BAR_MAX }, { name: "下音量條", x: 0, y: m.H - m.BAR_MAX, w: m.W, h: m.BAR_MAX }];
let bad = 0, n = 0;
for (let f = 0; f < m.TIMELINE.total; f++) {
  const bx = m.boxesAt(f); n++;
  for (let i = 0; i < bx.length; i++) {
    const b = bx[i];
    if (b.x < 0 || b.y < 0 || b.x + b.w > m.W || b.y + b.h > m.H) { bad++; console.log(`f${f} ${b.name} 超出畫面`, b); }
    for (let j = i + 1; j < bx.length; j++) if (hit(b, bx[j])) { bad++; console.log(`f${f} ${b.name} × ${bx[j].name} 重疊`); }
    for (const r of bars) if (hit(b, r)) { bad++; console.log(`f${f} ${b.name} × ${r.name} 重疊`); }
  }
}
console.log(`重疊檢查（程式）：${n} 幀，${bad} 筆`);
process.exit(bad ? 1 : 0);

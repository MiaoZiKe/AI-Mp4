// node scripts/caffaine/layout-check.mjs [--no-kw] [--no-header]   版面檢查（程式）：LOGO 動畫每一幀，主要東西（頁首 LOGO、進度條、卡片組、字母、AI 色塊、標語、留言列、桌上小物）兩兩不得相交、不得出畫面。
// 框的算法和畫面共用 src/components/ai-iso/caffAnim.ts。特效（迸開像素、擴散波、資料點、星光）不算主要東西。
import { build } from "../../node_modules/esbuild/lib/main.js";
import path from "node:path";
const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "../..");
const outfile = path.join(ROOT, "out", ".caffanim-layout.mjs");
await build({ entryPoints: [path.join(ROOT, "src/components/ai-iso/caffAnim.ts")], bundle: true, format: "esm", outfile, loader: { ".json": "json" }, logLevel: "error" });
const m = await import(outfile + "?t=" + Date.now());
const kw = !process.argv.includes("--no-kw"), header = !process.argv.includes("--no-header");
const hit = (a, b) => a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h;
const props = m.propBoxes();
let bad = 0, n = 0; const seen = new Set();
for (let f = 0; f < m.TIMELINE.total; f++) {
  const bx = [...m.boxesAt(f, kw, header), ...props]; n++;
  for (let i = 0; i < bx.length; i++) {
    const b = bx[i];
    if (b.x < 0 || b.y < 0 || b.x + b.w > m.W || b.y + b.h > m.H) { bad++; console.log(`f${f} ${b.name} 超出畫面`); }
    for (let j = i + 1; j < bx.length; j++) { if (bx[j].name.startsWith("鍵盤") && b.name.startsWith("盆栽")) continue; if (hit(b, bx[j])) { const k = `${b.name}×${bx[j].name}`; bad++; if (!seen.has(k)) { seen.add(k); console.log(`f${f} ${k} 重疊`, JSON.stringify([b, bx[j]].map((q) => [q.x, q.y, q.w, q.h].map(Math.round)))); } } }
  }
}
console.log(`重疊檢查（程式）：${n} 幀，${bad} 筆`);
process.exit(bad ? 1 : 0);

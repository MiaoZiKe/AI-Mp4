// node scripts/dossier/make-worldmap.mjs <land-110m.json 的路徑>
// 把 Natural Earth 1:110m 陸地輪廓（公有領域；npm 套件 world-atlas 2.0.2 的 land-110m.json，ISC）取樣成 2° 一點的點陣，
// 寫到 src/components/dossier/worldDots.json（檔案室式「國際新聞」版的淡背景世界地圖用）。只要跑一次，結果已 commit。
// 取得原始檔：在暫存資料夾 npm pack world-atlas@2.0.2 後解開（不加進 package.json）。
import fs from "node:fs";
import path from "node:path";
const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "../..");
const src = process.argv[2];
if (!src) { console.error("用法：node scripts/dossier/make-worldmap.mjs <land-110m.json>"); process.exit(2); }
const topo = JSON.parse(fs.readFileSync(src, "utf8"));
const { scale: [kx, ky], translate: [tx, ty] } = topo.transform;
const arcs = topo.arcs.map((a) => { let x = 0, y = 0; return a.map(([dx, dy]) => { x += dx; y += dy; return [x * kx + tx, y * ky + ty]; }); });
const ring = (ids) => ids.flatMap((i) => { const a = i < 0 ? [...arcs[~i]].reverse() : arcs[i]; return a.slice(0, -1); });
const polys = [];
for (const g of topo.objects.land.geometries) for (const p of g.type === "Polygon" ? [g.arcs] : g.arcs) polys.push(p.map(ring));
const inRing = (r, x, y) => { let c = false; for (let i = 0, j = r.length - 1; i < r.length; j = i++) { const [xi, yi] = r[i], [xj, yj] = r[j]; if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) c = !c; } return c; };
const land = (x, y) => polys.some((p) => inRing(p[0], x, y) && !p.slice(1).some((h) => inRing(h, x, y)));
const STEP = 2, rows = [];
for (let lat = 83; lat >= -59; lat -= STEP) { let s = ""; for (let lon = -179; lon < 180; lon += STEP) s += land(lon, lat) ? "1" : "0"; rows.push(s); }
const out = { note: "Natural Earth 1:110m 陸地，2° 一點；scripts/dossier/make-worldmap.mjs 產生", step: STEP, lat0: 83, lon0: -179, rows };
fs.writeFileSync(path.join(ROOT, "src/components/dossier/worldDots.json"), JSON.stringify(out));
console.log(`✔ worldDots.json：${rows.length} 列 × ${rows[0].length} 欄，陸地 ${rows.join("").split("1").length - 1} 點`);
for (const r of rows.filter((_, i) => i % 2 === 0)) console.log(r.replace(/0/g, " ").replace(/1/g, "#"));

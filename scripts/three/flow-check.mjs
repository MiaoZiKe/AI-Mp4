// node scripts/three/flow-check.mjs <slug>... [--tol=0.2] [--json]：flow（光點流動）動作的靜態檢查，不開瀏覽器（秒級）。
//   ① 每條 flow 路徑上所有光點可能出現的位置（路徑取樣點 ＋ 並排 lanes 的偏移，和 Ops.tsx 同一個算法：lanes 以路徑為中心對稱展開）
//      都必須落在某個零件的外框（AABB）內或貼著它（容差 --tol，預設 0.2 單位）；否則 error ＝ 光點會「懸在半空」。
//      （2026/11/18 tech-server：27 條 lanes 以機櫃最底層為中心，一半的光點掉到機櫃底下堆成一塊點陣。）
//   ② 光點不得在路徑末端累積：Ops.tsx 必須用 frac(raw) 讓每個光點走完一圈就回到起點，兩端有淡入淡出（Math.min(1, u * 10, (1 - u) * 10)）；
//      程式碼被改掉這兩處就報 error。另外 n × lanes 超過 600 顆光點給警告（渲染成本）。
//   結果寫 out/<slug>/flow-check.json；有 error 時結束碼 1。validate-three.mjs 會自動跑（見該檔）。
import fs from "node:fs";
import path from "node:path";
import { expandModel } from "./parts/index.mjs";

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "../..");
const args = process.argv.slice(2), asJson = args.includes("--json");
const tol = Number((args.find((a) => a.startsWith("--tol=")) ?? "--tol=0.2").slice(6));
const slugs = args.filter((a) => !a.startsWith("--"));

const aabbs = (model) => {
  const out = [];
  for (const p of model.parts ?? []) {
    const s = p.size ?? [1, 1, 1]; let h;
    const rot = p.rot ?? [0, 0, 0];
    if (p.shape === "sphere") h = [s[0], s[0], s[0]];
    else if (p.shape === "cyl") { const r = s[0], L = (s[1] ?? 1) / 2; h = rot[0] % 180 === 90 ? [r, L, r] : rot[2] % 180 === 90 ? [L, r, r] : rot[1] % 180 === 90 ? [L, r, r] : [r, r, L]; }
    else if (p.shape === "tube") h = [s[0] / 2, s[1] / 2, s[2] / 2];
    else { h = [(s[0] ?? 1) / 2, (s[1] ?? s[0] ?? 1) / 2, (s[2] ?? s[0] ?? 1) / 2]; if (rot.some((x) => x % 180 !== 0)) { const m = Math.max(...h); h = [m, m, m]; } }
    const base = p.pos ?? [0, 0, 0];
    for (const a of p.at ?? [[0, 0, 0]]) out.push({ id: p.id, lo: [0, 1, 2].map((i) => base[i] + a[i] - h[i]), hi: [0, 1, 2].map((i) => base[i] + a[i] + h[i]) });
  }
  return out;
};
const inside = (b, q, t) => [0, 1, 2].every((i) => q[i] >= b.lo[i] - t && q[i] <= b.hi[i] + t);

let totalErr = 0;
const table = [];
for (const slug of slugs) {
  const dir = path.join(ROOT, "videos", slug);
  let model;
  try { model = JSON.parse(fs.readFileSync(path.join(dir, "model.json"), "utf8")); } catch { const sj = JSON.parse(fs.readFileSync(path.join(dir, "script.json"), "utf8")); model = sj.model; }
  if (!model) { table.push({ slug, flows: 0, errors: 0, note: "沒有 model" }); continue; }
  model = expandModel(model);
  const boxes = aabbs(model), errs = [], warns = [];
  for (const [key, d] of Object.entries(model.actions ?? {})) {
    if (d.type !== "flow" || !d.path || d.path.length < 2 || d.free) continue; // free: true ＝ 本來就在空中的流動（氣流）
    const n = d.n ?? 4, lanes = Math.max(1, d.lanes ?? 1);
    if (n * lanes > 600) warns.push(`${key}：光點 ${n * lanes} 顆（n×lanes）偏多`);
    const ld = (d.laneDir ?? [0, 1, 0]); const len = Math.hypot(...ld) || 1; const gap = d.laneGap ?? 1;
    let bad = 0, worst = null;
    for (let ln = 0; ln < lanes; ln++) {
      const o = (ln - (lanes - 1) / 2) * gap;
      const pts = d.path.map((p) => [p[0] + (ld[0] / len) * o, p[1] + (ld[1] / len) * o, p[2] + (ld[2] / len) * o]);
      for (let k = 0; k < pts.length - 1; k++) for (let s = 0; s <= 6; s++) {
        const u = s / 6, q = [0, 1, 2].map((i) => pts[k][i] + (pts[k + 1][i] - pts[k][i]) * u);
        if (!boxes.some((b) => inside(b, q, tol))) { bad++; worst ??= q.map((x) => +x.toFixed(2)); }
      }
    }
    if (bad) errs.push(`${key}：${bad} 個取樣點離所有零件外框 >${tol}（例：[${worst.join(", ")}]；lanes=${lanes}、laneGap=${gap}）→ 光點會懸在半空`);
  }
  const ops = fs.readFileSync(path.join(ROOT, "src/components/three/Ops.tsx"), "utf8");
  if (!/frac\(raw\)/.test(ops) || !/Math\.min\(1, u \* 10, \(1 - u\) \* 10\)/.test(ops)) errs.push("Ops.tsx 的 flow 不再用 frac(raw) 回收光點或沒有兩端淡出 → 光點會在末端累積");
  fs.mkdirSync(path.join(ROOT, "out", slug), { recursive: true });
  fs.writeFileSync(path.join(ROOT, "out", slug, "flow-check.json"), JSON.stringify({ slug, tol, errors: errs, warnings: warns }, null, 1));
  const nf = Object.values(model.actions ?? {}).filter((d) => d.type === "flow").length;
  table.push({ slug, flows: nf, errors: errs.length, warnings: warns.length, detail: errs });
  totalErr += errs.length;
}
if (asJson) console.log(JSON.stringify(table, null, 1));
else for (const t of table) { console.log(`${t.errors ? "✖" : "✔"} ${t.slug}：flow ${t.flows} 條，error ${t.errors}、警告 ${t.warnings ?? 0}${t.note ? "（" + t.note + "）" : ""}`); for (const e of t.detail ?? []) console.log("    ✖ " + e); }
process.exit(totalErr ? 1 : 0);

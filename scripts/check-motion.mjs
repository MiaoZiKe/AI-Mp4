// node scripts/check-motion.mjs：motion token 函式單元檢查（P0-7）。validate 也會呼叫 checkMotion()。
// 直接把 src/components/anim.ts 用 TypeScript 轉成 JS 在 Node 跑（theme 的 FPS 以 30 取代，避免載入字型）。
import fs from "node:fs";
import path from "node:path";
import ts from "typescript";

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
export async function checkMotion() {
  const src = fs.readFileSync(path.join(ROOT, "src/components/anim.ts"), "utf8").replace(/import \{ FPS \} from "\.\.\/theme";/, "const FPS = 30;");
  const js = ts.transpileModule(src, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2020 } }).outputText;
  const tmp = path.join(ROOT, "node_modules", ".cache", "anim-check.mjs");
  fs.mkdirSync(path.dirname(tmp), { recursive: true });
  fs.writeFileSync(tmp, js);
  const A = await import(`${tmp}?t=${fs.statSync(tmp).mtimeMs}`);
  const errors = [], rows = [];
  const ok = (cond, msg) => { rows.push(`${cond ? "✔" : "✖"} ${msg}`); if (!cond) errors.push(`motion: ${msg}`); };
  const p25 = A.countUp(10, 0, 40);
  ok(p25 >= 0.4 && p25 <= 0.6, `countUp p(0.25) = ${p25.toFixed(4)} ∈ [0.4, 0.6]`);
  ok(A.countUp(40, 0, 40) === 1 && A.countUp(60, 0, 40) === 1 && A.countUp(0, 0, 40) === 0, "countUp p(start)=0、p(landAt)=1、之後維持 1");
  const peak = (fn) => Math.max(...Array.from({ length: 120 }, (_, f) => fn(f)));
  const ovA = peak((f) => A.springAccent(f, 0)) - 1, ovU = peak((f) => A.springUi(f, 0)) - 1;
  ok(ovA > 0 && ovA <= 0.03, `accent spring 過衝 ${(ovA * 100).toFixed(2)}% ≤ 3%`);
  ok(ovU <= 1e-6, `ui spring 無過衝（${(ovU * 100).toFixed(3)}%）`);
  const r = A.exitDur(A.DUR.m) / A.DUR.m;
  ok(r >= 0.6 && r <= 0.7, `出場時長 / 進場 = ${r.toFixed(2)} ∈ [0.6, 0.7]（m=${A.DUR.m}）`);
  ok(A.STAGGER >= 3 && A.STAGGER <= 4, `錯開間隔 ${A.STAGGER} 幀 ∈ [3, 4]`);
  ok(A.bump(0, 10) === 1 && A.bump(40, 10) === 1 && A.bump(13, 10) > 1, "bump 前後都是 1（不硬跳）");
  // 進場每幀位移 ≤ 24px（dist 24）
  const ys = Array.from({ length: 60 }, (_, f) => Number(/translateY\((-?\d+)px\)/.exec(A.enter(f, 0, 24).transform)[1]));
  const dmax = Math.max(...ys.slice(1).map((y, i) => Math.abs(y - ys[i])));
  ok(dmax <= 24 && ys.every(Number.isInteger), `enter 位移整數 px、每幀最大 ${dmax}px ≤ 24`);
  ok(A.typeChars(18 + 200, 18, 30) === 30 && A.typeChars(18, 18, 30) === 0, "typeChars 依字數打完");
  return { errors, rows };
}
if (process.argv[1] && import.meta.url.endsWith(path.basename(process.argv[1]))) {
  const { errors, rows } = await checkMotion();
  rows.forEach((r) => console.log(r));
  process.exit(errors.length ? 1 : 0);
}

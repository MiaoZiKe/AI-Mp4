// node videos/tech-ccl/gen-model.mjs → 寫 videos/tech-ccl/model.json
// 2026/11/27 tech-ccl（PCB-1：銅箔基板，系列 3 第 11 集）。構造與物理照 physics-spec.md、模組清單照 visual-spec.md。全部放大示意，非特定廠牌／型號。
// 站點（地板頂面 y＝0）：K 電路板與銅箔基板夾心（x 0）｜G 玻纖布織紋放大（x 30）｜R 含浸線：布泡樹脂、擠壓、烘箱、裁成膠片（x 60）
//   H 熱壓機：膠片＋銅箔疊好、上下熱板壓（x 95）｜E 蝕刻成線路＋訊號沿線跑（x 125）｜S 損耗對照：一般材料 vs 低損耗（x 155）｜V 供應商展示台（x 185）｜N 下一集：銅箔捲與玻纖布捲（x 215）
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
const HERE = path.dirname(new URL(import.meta.url).pathname);
const R2 = (x) => Math.round(x * 1000) / 1000;
const D2R = Math.PI / 180;
const palette = {
  floorC: "#C9D2DE", panel: "#F3F5F8", panel2: "#E2E8F0", seam: "#8E9BB0", band: "#24324C", steel: "#7D8CA6", steel2: "#A9B5C7", dark: "#3E4A60", darker: "#2A3142",
  lampY: "#F2B632", lampG: "#2FBF71", lampR: "#E5484D", screen: "#5B8DEF", rubber: "#2B2F36", gold: "#C9A24A", warnY: "#F2B632",
  cuC: "#C8794A", cuHi: "#E39A68", chipC: "#4C5568", chipTop: "#6B7690", padGold: "#E0B84E",
  yarnC: "#EEF2F6", yarnS: "#C9D3DE", ppC: "#E0A43A", ppD: "#B9822A", coreC: "#9C7A3C", resinL: "#D8962A", heatC: "#E5484D", hotC: "#E5602B",
  pcbC: "#1E6B4E", pcbD: "#16523B", silk: "#F4F6FA", capC: "#C8A46A", mudC: "#6B5236", mudD: "#4E3B27", trackC: "#3D7BD9", trackL: "#F4F7FB",
  sigC: "#2FD3E0", sigW: "#8FA1B8", glassC: "#BFD3F2", markC: "#E8613C", okC: "#14A38B", whiteP: "#FFFFFF",
};
const M = (kind, color, o = {}) => ({ kind, color, ...o });
const glowM = (c, op, ei = 1) => M("std", c, { emissive: c, ei, opacity: op, rough: 1, metal: 0 });
const materials = {
  floor: M("std", "floorC", { rough: 0.7, metal: 0.3, tex: "brushed", texScale: 3 }),
  panel: M("std", "panel", { rough: 0.55, metal: 0.05, env: 0.25 }), panel2: M("std", "panel2", { rough: 0.6, metal: 0.05, env: 0.2 }),
  seam: M("std", "seam", { rough: 0.6, metal: 0.3 }), band: M("std", "band", { rough: 0.4, metal: 0.3, env: 0.4 }),
  steel: M("std", "steel", { rough: 0.35, metal: 0.85, env: 0.5 }), steel2: M("std", "steel2", { rough: 0.3, metal: 0.8, env: 0.6, tex: "brushed", texScale: 2 }),
  mirror: M("std", "steel2", { rough: 0.08, metal: 0.95, env: 1.2 }),
  dark: M("std", "dark", { rough: 0.5, metal: 0.4, env: 0.3 }), darker: M("std", "darker", { rough: 0.5, metal: 0.3, env: 0.3 }), rubber: M("std", "rubber", { rough: 0.9, metal: 0 }),
  gold: M("std", "gold", { rough: 0.3, metal: 0.9, env: 0.8 }), padGold: M("std", "padGold", { rough: 0.25, metal: 0.9, env: 0.9 }),
  lampY: M("std", "lampY", { emissive: "lampY", ei: 0.45, rough: 0.4, metal: 0 }), lampG: M("std", "lampG", { emissive: "lampG", ei: 0.45, rough: 0.4, metal: 0 }),
  lampR: M("std", "lampR", { emissive: "lampR", ei: 0.4, rough: 0.4, metal: 0 }), screen: M("std", "screen", { emissive: "screen", ei: 0.5, rough: 0.3, metal: 0 }),
  warnY: M("std", "warnY", { rough: 0.5, metal: 0, emissive: "warnY", ei: 0.2 }),
  cu: M("std", "cuC", { rough: 0.3, metal: 0.9, env: 0.9 }), cuHi: M("std", "cuHi", { rough: 0.2, metal: 0.9, env: 1.1 }),
  chip: M("std", "chipC", { rough: 0.3, metal: 0.5, env: 0.8 }), chipTop: M("std", "chipTop", { rough: 0.2, metal: 0.5, env: 0.9, tex: "traces", texScale: 0.6 }),
  yarn: M("std", "yarnC", { rough: 0.45, metal: 0, env: 0.5 }), yarnS: M("std", "yarnS", { rough: 0.5, metal: 0, env: 0.4 }),
  pp: M("phys", "ppC", { rough: 0.25, metal: 0, clearcoat: 0.6, opacity: 0.72, env: 0.5 }), ppD: M("std", "ppD", { rough: 0.4, metal: 0, env: 0.3 }),
  core: M("std", "coreC", { rough: 0.5, metal: 0, env: 0.25 }), resinL: M("phys", "resinL", { rough: 0.05, metal: 0, clearcoat: 1, opacity: 0.8, env: 0.8 }),
  heat: glowM("heatC", 1, 0.8), hot: glowM("hotC", 1, 0.6),
  film: M("std", "trackC", { rough: 0.4, metal: 0, opacity: 0.85 }),
  pcb: M("std", "pcbC", { rough: 0.45, metal: 0.1, env: 0.35, tex: "traces", texScale: 1.2 }), pcbD: M("std", "pcbD", { rough: 0.5, metal: 0.1 }), silk: M("std", "silk", { rough: 0.6, metal: 0 }),
  cap: M("std", "capC", { rough: 0.5, metal: 0.2 }), mud: M("std", "mudC", { rough: 0.95, metal: 0 }), mudD: M("std", "mudD", { rough: 0.95, metal: 0 }),
  track: M("std", "trackC", { rough: 0.5, metal: 0, env: 0.3 }), trackL: M("std", "trackL", { rough: 0.5, metal: 0 }),
  glass: M("phys", "glassC", { rough: 0.05, metal: 0, clearcoat: 1, opacity: 0.22, env: 0.6 }), mark: M("std", "markC", { rough: 0.5, metal: 0, emissive: "markC", ei: 0.25 }),
  ok: glowM("okC", 1, 0.6), sig: glowM("sigC", 1, 0.9), white: M("std", "whiteP", { rough: 0.7, metal: 0 }),
};
const parts = [], layers = [], anchors = {}, actions = {};
const P = (o) => { parts.push(o); return o; };
const LAY = (id, outline, bg) => layers.push({ id, z: 0, k: 0, outline, ...(bg ? { bg: true } : {}) });
const V = [90, 0, 0], HX = [0, 90, 0];
const BOX = (id, layer, x0, x1, y0, y1, z0, z1, mat, o = {}) => P({ id, layer, shape: "box", size: [R2(x1 - x0), R2(y1 - y0), R2(z1 - z0)], pos: [R2((x0 + x1) / 2), R2((y0 + y1) / 2), R2((z0 + z1) / 2)], mat, ...o });
const VC = (id, layer, R, y0, y1, mat, o = {}) => { const { x = 0, z = 0, ...r } = o; return P({ id, layer, shape: "cyl", size: [R, R2(y1 - y0)], rot: V, pos: [x, R2((y0 + y1) / 2), z], mat, ...r }); };
const HXC = (id, layer, R, x0, x1, y, z, mat, o = {}) => P({ id, layer, shape: "cyl", size: [R, R2(Math.abs(x1 - x0))], rot: HX, pos: [R2((x0 + x1) / 2), y, z], mat, ...o });
const ZC = (id, layer, R, z0, z1, x, y, mat, o = {}) => P({ id, layer, shape: "cyl", size: [R, R2(Math.abs(z1 - z0))], pos: [x, y, R2((z0 + z1) / 2)], mat, ...o });
const SPH = (id, layer, r, x, y, z, mat, o = {}) => P({ id, layer, shape: "sphere", size: [r], pos: [x, y, z], mat, ...o });
const A = (layer, p, dx, dy) => ({ layer, p, dx, dy });
// 任意方向的圓柱（3D，a→b）
const SEG3 = (id, layer, a, b, r, mat, o = {}) => {
  const dx = b[0] - a[0], dy = b[1] - a[1], dz = b[2] - a[2], L = Math.hypot(dx, dy, dz), ux = dx / L, uy = dy / L, uz = dz / L;
  const t1 = -Math.asin(uy) / D2R, t2 = Math.atan2(ux, uz) / D2R;
  return P({ id, layer, shape: "cyl", size: [r, R2(L)], rot: [R2(t1), R2(t2), 0], pos: [R2((a[0] + b[0]) / 2), R2((a[1] + b[1]) / 2), R2((a[2] + b[2]) / 2)], mat, ...o });
};
// 平的帶子（布、銅箔）：在 xy 平面從 a 走到 b，z 方向寬 w、厚 t
const WEB = (id, layer, a, b, w, t, mat) => {
  const dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy), ang = Math.atan2(dy, dx) / D2R;
  return P({ id, layer, shape: "box", size: [R2(L + t), t, w], pos: [R2((a[0] + b[0]) / 2), R2((a[1] + b[1]) / 2), 0], rot: [0, 0, R2(ang)], mat });
};
const idsOf = (layer) => parts.filter((q) => q.layer === layer).map((q) => q.id);

// ═════ 地板 ═════
LAY("floor", [300, 2, 110, 0], true);
P({ id: "floor", layer: "floor", shape: "slab", size: [320, 0.5, 44], r: 0.2, pos: [110, -0.25, 0], mat: "floor" });
P({ id: "floorSeam", layer: "floor", shape: "slab", size: [320, 0.04, 0.1], pos: [110, 0.01, 0], at: Array.from({ length: 7 }, (_, i) => [0, 0, -16 + i * 5.3]), mat: "seam" });

// ═════ 站 K：做好的電路板（鉤子）與銅箔基板夾心（x 0；1＝約 1 cm 的板，厚度放大） ═════
LAY("kBase", [13, 1, 0, 0.45]);
BOX("kPlinth", "kBase", -6.2, 6.2, 0, 0.8, -4.6, 4.6, "band"); BOX("kPlinthTop", "kBase", -6.2, 6.2, 0.8, 0.85, -4.6, 4.6, "panel2");
P({ id: "kBolt", layer: "kBase", shape: "cyl", size: [0.12, 0.05], rot: V, pos: [0, 0.86, 0], at: [[-5.8, 0, -4.2], [5.8, 0, -4.2], [-5.8, 0, 4.2], [5.8, 0, 4.2]], mat: "steel" });
// 做好的電路板：綠漆、走線、晶片、電容、金手指、白字框
LAY("kPCB", [10, 1, 0, 1.2]);
BOX("kpBoard", "kPCB", -5, 5, 0.85, 1.05, -3.5, 3.5, "pcb");
BOX("kpChip", "kPCB", -1.4, 1.4, 1.05, 1.35, -1.2, 1.4, "chip"); BOX("kpChipTop", "kPCB", -1.3, 1.3, 1.35, 1.36, -1.1, 1.3, "chipTop");
P({ id: "kpMem", layer: "kPCB", shape: "box", size: [0.9, 0.22, 1.4], pos: [0, 1.16, 0], at: [[-3.3, 0, -1.6], [-3.3, 0, 0.4], [3.3, 0, -1.6], [3.3, 0, 0.4]], mat: "darker" });
P({ id: "kpCap", layer: "kPCB", shape: "box", size: [0.3, 0.16, 0.18], pos: [0, 1.13, 0], at: Array.from({ length: 10 }, (_, i) => [R2(-2.7 + i * 0.6), 0, -2.6]), mat: "cap" });
P({ id: "kpFinger", layer: "kPCB", shape: "box", size: [0.22, 0.02, 0.6], pos: [0, 1.06, 3.1], at: Array.from({ length: 16 }, (_, i) => [R2(-3.75 + i * 0.5), 0, 0]), mat: "padGold" });
P({ id: "kpSilk", layer: "kPCB", shape: "box", size: [3.2, 0.01, 0.04], pos: [0, 1.055, 0], at: [[0, 0, -1.45], [0, 0, 1.65]], mat: "silk" });
P({ id: "kpVia", layer: "kPCB", shape: "cyl", size: [0.06, 0.02], rot: V, pos: [0, 1.06, 0], at: Array.from({ length: 12 }, (_, i) => [R2(-4.4 + (i % 6) * 1.76), 0, i < 6 ? -3.1 : 2.4]), mat: "padGold" });
// 銅箔基板夾心：下銅箔、三張膠片（樹脂裡有玻纖布織紋）、上銅箔（爆炸分解時各自抬起）
const KX0 = -4.6, KX1 = 4.6, KZ0 = -3.2, KZ1 = 3.2, KCU = 0.08, KPP = 0.32;
LAY("kCuB", [9.2, 0.1, 0, 0.89]); BOX("kcB", "kCuB", KX0, KX1, 0.85, 0.85 + KCU, KZ0, KZ1, "cuHi");
for (let i = 0; i < 3; i++) {
  const y0 = 0.85 + KCU + i * KPP, y1 = y0 + KPP, id = `kPP${i}`;
  LAY(id, [9.2, 0.3, 0, R2((y0 + y1) / 2)]);
  BOX(`${id}r`, id, KX0, KX1, y0, y1, KZ0, KZ1, "pp");
  // 布：經紗（沿 z）＋緯紗（沿 x），浸在樹脂中間
  P({ id: `${id}w`, layer: id, shape: "box", size: [0.16, 0.06, R2(KZ1 - KZ0 - 0.1)], pos: [0, R2((y0 + y1) / 2), 0], at: Array.from({ length: 15 }, (_, k) => [R2(KX0 + 0.35 + k * 0.6), 0, 0]), mat: "yarn" });
  P({ id: `${id}f`, layer: id, shape: "box", size: [R2(KX1 - KX0 - 0.1), 0.05, 0.16], pos: [0, R2((y0 + y1) / 2 + 0.02), 0], at: Array.from({ length: 11 }, (_, k) => [0, 0, R2(KZ0 + 0.3 + k * 0.6)]), mat: "yarnS" });
}
const KTOP = 0.85 + KCU + 3 * KPP;
LAY("kCuT", [9.2, 0.1, 0, R2(KTOP + 0.04)]); BOX("kcT", "kCuT", KX0, KX1, KTOP, KTOP + KCU, KZ0, KZ1, "cuHi");
// 夾心旁的實體餅乾（比喻）：兩片餅乾夾奶油
LAY("kCookie", [2.4, 1, 0, 1.6]);
const CKX = 7.6;
P({ id: "kckBot", layer: "kCookie", shape: "cyl", size: [1.0, 0.22], rot: V, pos: [CKX, 0.96, 0], mat: "cu" });
P({ id: "kckMid", layer: "kCookie", shape: "cyl", size: [0.9, 0.24], rot: V, pos: [CKX, 1.19, 0], mat: "pp" });
P({ id: "kckTop", layer: "kCookie", shape: "cyl", size: [1.0, 0.22], rot: V, pos: [CKX, 1.42, 0], mat: "cu" });
P({ id: "kckDot", layer: "kCookie", shape: "cyl", size: [0.07, 0.02], rot: V, pos: [CKX, 1.54, 0], at: [[-0.5, 0, 0], [0.5, 0, 0], [0, 0, 0.5], [0, 0, -0.5], [0, 0, 0]], mat: "darker" });
BOX("kckStand", "kCookie", CKX - 1.2, CKX + 1.2, 0, 0.85, -1.2, 1.2, "band");

// ═════ 站 G：玻纖布織紋放大（x 30；1＝約 0.05 mm） ═════
const GX = 30;
LAY("gBase", [10, 1, GX, 0.5]);
BOX("gTable", "gBase", GX - 5, GX + 5, 0, 0.9, -4.2, 4.2, "band"); BOX("gTableTop", "gBase", GX - 5, GX + 5, 0.9, 0.95, -4.2, 4.2, "panel2");
P({ id: "gFoot", layer: "gBase", shape: "box", size: [0.5, 0.1, 0.5], pos: [GX, 0.05, 0], at: [[-4.5, 0, -3.7], [4.5, 0, -3.7], [-4.5, 0, 3.7], [4.5, 0, 3.7]], mat: "rubber" });
// 經紗（沿 z，固定）＋緯紗（沿 x，一根根織進去）；上下交錯
const GN = 8, GP = 0.8, GY = 1.35, GA = 0.13, GR = 0.16;
const gx = (i) => R2(GX + (i - (GN - 1) / 2) * GP), gz = (j) => R2((j - (GN - 1) / 2) * GP);
LAY("gWarp", [7, 0.5, GX, GY]);
const sg = (i, j) => ((i + j) % 2 === 0 ? 1 : -1);   // 交叉點：緯紗在上（+）或在下（−）
for (let i = 0; i < GN; i++) for (let j = 0; j < GN - 1; j++) SEG3(`gW${i}_${j}`, "gWarp", [gx(i), R2(GY - GA * sg(i, j)), gz(j)], [gx(i), R2(GY - GA * sg(i, j + 1)), gz(j + 1)], GR, "yarn");
for (let j = 0; j < GN; j++) {
  const id = `gF${j}`; LAY(id, [7, 0.4, GX, GY]);
  for (let i = 0; i < GN - 1; i++) SEG3(`${id}_${i}`, id, [gx(i), R2(GY + GA * sg(i, j)), gz(j)], [gx(i + 1), R2(GY + GA * sg(i + 1, j)), gz(j)], GR, "yarnS");
}
P({ id: "gWJ", layer: "gWarp", shape: "sphere", size: [GR], pos: [0, 0, 0], at: Array.from({ length: GN }, (_, i) => Array.from({ length: GN }, (_, j) => [gx(i), R2(GY - GA * sg(i, j)), gz(j)])).flat(), mat: "yarn" });
// 一根紗拆開＝很多根玻璃絲（散開的尾端）
LAY("gFil", [2, 1, GX + 4, GY]);
for (let k = 0; k < 15; k++) { const t = (k - 7) / 7, u = ((k * 5) % 7 - 3) / 3; SEG3(`gFl${k}`, "gFil", [GX, R2(GY + 0.2), R2(gz(GN - 1) + 0.2)], [R2(GX + 1.1 * t), R2(GY + 0.9 + 0.5 * u), R2(gz(GN - 1) + 2.4)], 0.05, "yarn"); }
// 後面一捲布
LAY("gRoll", [8, 2, GX, 2]);
HXC("grRoll", "gRoll", 0.9, GX - 4, GX + 4, 1.85, -5.6, "yarn"); HXC("grCore", "gRoll", 0.25, GX - 4.4, GX + 4.4, 1.85, -5.6, "steel");
for (const x of [-4.6, 4.6]) BOX(`grStand${x > 0 ? "R" : "L"}`, "gRoll", GX + x - 0.15, GX + x + 0.15, 0, 1.9, -5.8, -5.4, "dark");
P({ id: "grRing", layer: "gRoll", shape: "tube", size: [0.92, 0.88, 0.04], rot: HX, pos: [GX, 1.85, -5.6], at: [-3, -1, 1, 3].map((x) => [x, 0, 0]), mat: "yarnS" });

// ═════ 站 R：含浸線（x 60；側面看）：放卷 → 浸樹脂槽 → 擠壓輥 → 烘箱 → 裁成膠片 ═════
const RX = 60, RW = 2.4;
LAY("rFrame", [18, 4, RX + 1, 2]);
BOX("rBed", "rFrame", RX - 7.5, RX + 10.5, 0, 0.3, -1.8, 1.8, "band");
// 放卷
ZC("rRollStandB", "rFrame", 0.12, -1.6, 1.6, RX - 6, 2.2, "steel"); BOX("rUnStand", "rFrame", RX - 6.2, RX - 5.8, 0.3, 2.2, -1.7, -1.5, "dark"); BOX("rUnStand2", "rFrame", RX - 6.2, RX - 5.8, 0.3, 2.2, 1.5, 1.7, "dark");
LAY("rUnwind", [2, 2, RX - 6, 2.2]); ZC("rUnRoll", "rUnwind", 0.95, -1.25, 1.25, RX - 6, 2.2, "yarn"); ZC("rUnMark", "rUnwind", 0.12, 1.25, 1.28, RX - 5.4, 2.6, "mark");
// 導輥
ZC("rGuide0", "rFrame", 0.16, -1.4, 1.4, RX - 3.6, 3.05, "steel2"); ZC("rGuide1", "rFrame", 0.16, -1.4, 1.4, RX - 1.8, 0.75, "steel2");
for (const [n, x, y] of [["g0", RX - 3.6, 3.05], ["g1", RX - 1.8, 0.75], ["s0", RX + 0.4, 2.25], ["s1", RX + 0.4, 2.95]]) for (const z of [-1.55, 1.55]) BOX(`rBrg${n}${z > 0 ? "F" : "B"}`, "rFrame", R2(x - 0.28), R2(x + 0.28), R2(y - 0.28), R2(y + 0.28), R2(z - 0.12), R2(z + 0.12), "dark");
for (const z of [-1.72, 1.72]) { BOX(`rSideG${z > 0 ? "F" : "B"}`, "rFrame", RX - 4.0, RX - 3.2, 0.3, 3.4, R2(z - 0.05), R2(z + 0.05), "steel"); BOX(`rSideS${z > 0 ? "F" : "B"}`, "rFrame", RX + 0.05, RX + 0.75, 0.3, 3.35, R2(z - 0.05), R2(z + 0.05), "steel"); }

// 樹脂槽（前壁透明）
BOX("rTankB", "rFrame", RX - 3.2, RX - 0.4, 0.3, 1.7, -1.5, -1.4, "steel2"); BOX("rTankL", "rFrame", RX - 3.2, RX - 3.1, 0.3, 1.7, -1.5, 1.5, "steel2"); BOX("rTankR", "rFrame", RX - 0.5, RX - 0.4, 0.3, 1.7, -1.5, 1.5, "steel2");
BOX("rTankBot", "rFrame", RX - 3.2, RX - 0.4, 0.3, 0.4, -1.5, 1.5, "steel2"); BOX("rTankF", "rFrame", RX - 3.2, RX - 0.4, 0.3, 1.7, 1.4, 1.5, "glass");
BOX("rResin", "rFrame", RX - 3.1, RX - 0.5, 0.4, 1.45, -1.4, 1.4, "resinL");
VC("rPipe", "rFrame", 0.1, 1.7, 3.6, "steel", { x: RX - 0.8, z: -1.2 }); BOX("rPump", "rFrame", RX - 1.3, RX - 0.3, 3.6, 4.2, -1.6, -0.8, "dark");
// 擠壓輥（一對）
ZC("rSqz0", "rFrame", 0.28, -1.4, 1.4, RX + 0.4, 2.25, "rubber"); ZC("rSqz1", "rFrame", 0.28, -1.4, 1.4, RX + 0.4, 2.95, "rubber");
for (const [n, x, y, r] of [["G0", RX - 3.6, 3.05, 0.16], ["G1", RX - 1.8, 0.75, 0.16], ["S0", RX + 0.4, 2.25, 0.28], ["S1", RX + 0.4, 2.95, 0.28]]) BOX(`rMk${n}`, "rFrame", R2(x - 0.04), R2(x + 0.04), R2(y + r - 0.08), R2(y + r + 0.01), 1.36, 1.44, "mark");
BOX("rSqzStand", "rFrame", RX + 0.2, RX + 0.6, 0.3, 3.3, -1.6, -1.4, "dark");
// 烘箱（前蓋透明，上下加熱管，熱風箭頭）
const OV0 = RX + 1.6, OV1 = RX + 7.6;
BOX("rOvBack", "rFrame", OV0, OV1, 1.2, 4.2, -1.6, -1.45, "panel"); BOX("rOvTop", "rFrame", OV0, OV1, 4.0, 4.3, -1.6, 1.6, "panel"); BOX("rOvBot", "rFrame", OV0, OV1, 1.2, 1.5, -1.6, 1.6, "panel");
BOX("rOvF", "rFrame", OV0, OV1, 1.5, 4.0, 1.45, 1.6, "glass"); BOX("rOvEnd0", "rFrame", OV0, OV0 + 0.15, 1.5, 4.0, -1.6, 1.6, "panel2"); BOX("rOvEnd1", "rFrame", OV1 - 0.15, OV1, 1.5, 4.0, -1.6, 1.6, "panel2");
BOX("rOvBand", "rFrame", OV0, OV1, 4.3, 4.45, -1.6, 1.6, "band"); BOX("rOvWarn", "rFrame", OV0 + 0.3, OV0 + 1.4, 1.25, 1.45, 1.6, 1.64, "warnY");
P({ id: "rHeat", layer: "rFrame", shape: "cyl", size: [0.08, 2.8], pos: [0, 0, 0], at: [0, 1, 2, 3, 4].flatMap((k) => [[R2(OV0 + 0.8 + k * 1.1), 1.7, 0], [R2(OV0 + 0.8 + k * 1.1), 3.8, 0]]), mat: "heat" });
BOX("rOvPanel", "rFrame", OV1 - 1.4, OV1 - 0.2, 4.45, 5.2, 1.0, 1.4, "dark"); BOX("rOvScreen", "rFrame", OV1 - 1.3, OV1 - 0.3, 4.6, 5.05, 1.4, 1.42, "screen");
// 布帶路徑：乾布（白）→ 進槽 → 濕布（琥珀色）→ 擠壓 → 烘箱 → 裁切
const RP = { top: [RX - 6, 3.15], g1: [RX - 3.6, 3.21], dip: [RX - 1.8, 0.6], s: [RX + 0.4, 2.6], o0: [OV0, 2.6], o1: [OV1, 2.6], cut: [RX + 8.6, 2.6] };
LAY("rWebDry", [6, 3, RX - 4, 2]); WEB("rwD0", "rWebDry", RP.top, RP.g1, RW, 0.04, "yarn"); WEB("rwD1", "rWebDry", RP.g1, [RX - 2.5, 1.45], RW, 0.04, "yarn");
LAY("rWebWet", [12, 3, RX + 2, 2]); WEB("rwW0", "rWebWet", [RX - 2.5, 1.45], RP.dip, RW, 0.05, "pp"); WEB("rwW1", "rWebWet", RP.dip, RP.s, RW, 0.05, "pp"); WEB("rwW2", "rWebWet", RP.s, RP.cut, RW, 0.05, "pp");
// 裁刀（上下）＋膠片堆
LAY("rCutter", [1, 1, RX + 8.6, 3.4]); BOX("rKnife", "rCutter", RX + 8.5, RX + 8.7, 2.7, 3.6, -1.4, 1.4, "steel"); BOX("rKnifeHead", "rCutter", RX + 8.2, RX + 9.0, 3.6, 4.0, -1.5, 1.5, "dark");
BOX("rCutStand", "rFrame", RX + 8.2, RX + 9.0, 0.3, 2.5, -1.6, -1.3, "dark");
BOX("rStackTable", "rFrame", RX + 8.8, RX + 10.4, 0.3, 1.0, -1.4, 1.4, "panel2");
for (let k = 0; k < 6; k++) { const id = `rPP${k}`; LAY(id, [1.6, 0.1, RX + 9.6, 1.05 + k * 0.07]); BOX(`${id}b`, id, RX + 8.9, RX + 10.3, R2(1.0 + k * 0.07), R2(1.06 + k * 0.07), -1.2, 1.2, "pp"); }

// ═════ 站 H：熱壓機（x 95）：下熱板固定、上熱板由油壓缸壓下；中間一疊：鋼板／銅箔／四張膠片／銅箔／鋼板 ═════
const HX0 = 95;
LAY("hFrame", [9, 9, HX0, 4.5]);
BOX("hBase", "hFrame", HX0 - 4.2, HX0 + 4.2, 0, 1.2, -2.2, 2.2, "band");
for (const [x, z] of [[-3.6, -1.7], [3.6, -1.7], [-3.6, 1.7], [3.6, 1.7]]) VC(`hPost${x}${z}`, "hFrame", 0.22, 1.2, 7.2, "steel2", { x: HX0 + x, z });
BOX("hCrown", "hFrame", HX0 - 4.2, HX0 + 4.2, 7.2, 8.2, -2.2, 2.2, "band"); VC("hCyl", "hFrame", 0.8, 8.2, 9.6, "steel", { x: HX0 }); VC("hCylCap", "hFrame", 0.9, 9.6, 9.8, "dark", { x: HX0 });
VC("hHose", "hFrame", 0.07, 8.5, 9.4, "rubber", { x: HX0 + 1.1 }); BOX("hNamePl", "hFrame", HX0 - 1.2, HX0 + 1.2, 7.4, 7.9, 2.2, 2.24, "gold");
BOX("hBotPlaten", "hFrame", HX0 - 3.2, HX0 + 3.2, 1.2, 1.8, -1.8, 1.8, "steel");
P({ id: "hBotHeat", layer: "hFrame", shape: "cyl", size: [0.09, 0.06], pos: [0, 1.5, 1.82], at: Array.from({ length: 7 }, (_, i) => [R2(HX0 - 2.7 + i * 0.9), 0, 0]), mat: "heat" });
BOX("hCab", "hFrame", HX0 + 4.6, HX0 + 6.0, 0, 4.0, -1.0, 1.0, "panel"); BOX("hCabScreen", "hFrame", HX0 + 4.8, HX0 + 5.8, 2.8, 3.6, 1.0, 1.02, "screen");
P({ id: "hCabLamp", layer: "hFrame", shape: "sphere", size: [0.11], pos: [0, 2.3, 1.05], at: [[HX0 + 5.0, 0, 0], [HX0 + 5.3, 0, 0], [HX0 + 5.6, 0, 0]], mat: "lampG" });
SPH("hCabLampR", "hFrame", 0.11, HX0 + 5.3, 1.9, 1.05, "lampR");
// 上熱板（可動）＋活塞桿
LAY("hTop", [7, 2, HX0, 5.8]);
BOX("htPlaten", "hTop", HX0 - 3.2, HX0 + 3.2, 5.2, 5.8, -1.8, 1.8, "steel"); VC("htRod", "hTop", 0.4, 5.8, 9.4, "steel2", { x: HX0 });
P({ id: "htHeat", layer: "hTop", shape: "cyl", size: [0.09, 0.06], pos: [0, 5.5, 1.82], at: Array.from({ length: 7 }, (_, i) => [R2(HX0 - 2.7 + i * 0.9), 0, 0]), mat: "heat" });
P({ id: "htBush", layer: "hTop", shape: "tube", size: [0.34, 0.24, 0.6], rot: V, pos: [0, 5.5, 0], at: [[HX0 - 3.6, 0, -1.7], [HX0 + 3.6, 0, -1.7], [HX0 - 3.6, 0, 1.7], [HX0 + 3.6, 0, 1.7]], mat: "gold" });
// 一疊（book）：每張各自一層，依序落下
const HS = [["hPlB", 0.12, "mirror"], ["hCuB", 0.05, "cuHi"], ["hPP0", 0.18, "pp"], ["hPP1", 0.18, "pp"], ["hPP2", 0.18, "pp"], ["hPP3", 0.18, "pp"], ["hCuT", 0.05, "cuHi"], ["hPlT", 0.12, "mirror"]];
let hy = 1.8; const HSY = {};
for (const [id, t, mat] of HS) { LAY(id, [5.6, 0.2, HX0, R2(hy + t / 2)]); BOX(`${id}b`, id, HX0 - 2.8, HX0 + 2.8, R2(hy), R2(hy + t), -1.5, 1.5, mat);
  if (id.startsWith("hPP")) P({ id: `${id}w`, layer: id, shape: "box", size: [0.1, 0.04, 2.9], pos: [0, R2(hy + t / 2), 0], at: Array.from({ length: 13 }, (_, k) => [R2(HX0 - 2.6 + k * 0.43), 0, 0]), mat: "yarn" });
  HSY[id] = [hy, hy + t]; hy += t; }
const HTOP = hy;   // 2.86
// 壓下後：樹脂從邊緣擠出一點（流膠）、四張膠片固化成一塊（深色芯板）
LAY("hBleed", [6, 0.3, HX0, 2.3]);
for (const sx of [-1, 1]) BOX(`hBleed${sx > 0 ? "R" : "L"}`, "hBleed", R2(HX0 + sx * 2.8 - (sx > 0 ? 0 : 0.18)), R2(HX0 + sx * 2.8 + (sx > 0 ? 0.18 : 0)), R2(HSY.hPP0[0] + 0.05), R2(HSY.hPP3[1] - 0.05), -1.4, 1.4, "resinL");
for (const sz of [-1, 1]) BOX(`hBleedZ${sz > 0 ? "F" : "B"}`, "hBleed", HX0 - 2.7, HX0 + 2.7, R2(HSY.hPP0[0] + 0.05), R2(HSY.hPP3[1] - 0.05), R2(sz * 1.5 - (sz > 0 ? 0 : 0.14)), R2(sz * 1.5 + (sz > 0 ? 0.14 : 0)), "resinL");
LAY("hCore", [5.6, 0.7, HX0, 2.33]); BOX("hCoreB", "hCore", HX0 - 2.81, HX0 + 2.81, R2(HSY.hPP0[0] - 0.002), R2(HSY.hPP3[1] + 0.002), -1.51, 1.51, "core");

// ═════ 站 E：蝕刻成線路（x 125）：輸送滾輪、噴嘴；板子＝芯板＋上層銅（蝕刻前整片／蝕刻後剩線路）；訊號沿線跑 ═════
const EX = 125;
LAY("eLine", [10, 4, EX, 2]);
BOX("eFrame", "eLine", EX - 5, EX + 5, 0, 0.95, -2.6, 2.6, "panel"); BOX("eBand", "eLine", EX - 5, EX + 5, 0.95, 1.05, -2.6, 2.6, "band");
for (let i = 0; i < 11; i++) { ZC(`eRol${i}`, "eLine", 0.11, -2.3, 2.3, R2(EX - 4.5 + i * 0.9), 1.13, "steel2"); BOX(`eRolMk${i}`, "eLine", R2(EX - 4.5 + i * 0.9 - 0.03), R2(EX - 4.5 + i * 0.9 + 0.03), 1.18, 1.25, 2.2, 2.32, "mark"); }
HXC("eBar", "eLine", 0.12, EX - 4.4, EX + 4.4, 3.4, 0, "steel");
P({ id: "eNozzle", layer: "eLine", shape: "cone", size: [0.15, 0.05, 0.32], rot: [-90, 0, 0], pos: [0, 3.14, 0], at: [-3.6, -2.4, -1.2, 0, 1.2, 2.4, 3.6].map((x) => [R2(EX + x), 0, 0]), mat: "darker" });
for (const x of [-4.8, 4.8]) VC(`ePost${x}`, "eLine", 0.1, 1.05, 3.6, "steel", { x: EX + x, z: -1.8 });
BOX("eHood", "eLine", EX - 5, EX + 5, 3.6, 3.8, -2.4, 0.4, "glass"); BOX("eWarn", "eLine", EX - 4.6, EX - 3.2, 0.4, 0.7, 2.6, 2.64, "warnY");
LAY("ePanel", [8, 0.3, EX, 1.3]); BOX("epCore", "ePanel", EX - 4, EX + 4, 1.24, 1.4, -2.1, 2.1, "core"); BOX("epCuB", "ePanel", EX - 4, EX + 4, 1.2, 1.24, -2.1, 2.1, "cu");
for (let k = 0; k < 8; k++) { LAY(`eCu${k}`, [1, 0.1, R2(EX - 3.5 + k), 1.42]); BOX(`ecFull${k}`, `eCu${k}`, R2(EX - 4 + k), R2(EX - 3 + k), 1.4, 1.45, -2.1, 2.1, "cuHi"); }
// 線路：三條走線（含轉角）＋焊墊＋過孔
LAY("eTr", [8, 0.1, EX, 1.42]);
const ETR = [[[-3.6, -1.4], [-1.2, -1.4], [-0.4, -0.6], [3.6, -0.6]], [[-3.6, 0.2], [3.6, 0.2]], [[-3.6, 1.4], [0.2, 1.4], [1.0, 0.9], [3.6, 0.9]],
  [[-3.6, -1.85], [3.6, -1.85]], [[-3.6, -0.95], [-2.0, -0.95], [-1.6, -0.2], [0.8, -0.2], [1.4, -1.2], [3.6, -1.2]], [[-3.6, 0.65], [-0.8, 0.65], [-0.4, 0.45], [3.6, 0.45]],
  [[-3.6, 1.85], [3.6, 1.85]], [[-2.4, 1.05], [-1.0, 1.05]]];
ETR.forEach((pts, k) => { for (let i = 0; i < pts.length - 1; i++) { const [x0, z0] = pts[i], [x1, z1] = pts[i + 1], L = Math.hypot(x1 - x0, z1 - z0), ang = -Math.atan2(z1 - z0, x1 - x0) / D2R;
  P({ id: `eT${k}_${i}`, layer: "eTr", shape: "box", size: [R2(L + 0.16), 0.04, 0.16], pos: [R2(EX + (x0 + x1) / 2), 1.42, R2((z0 + z1) / 2)], rot: [0, R2(ang), 0], mat: "cuHi" }); }
  for (const [x, z] of [pts[0], pts[pts.length - 1]]) P({ id: `ePad${k}_${x > 0 ? 1 : 0}_${z}`, layer: "eTr", shape: "cyl", size: [0.22, 0.04], rot: V, pos: [R2(EX + x), 1.42, z], mat: "cuHi" }); });
P({ id: "eVia", layer: "eTr", shape: "cyl", size: [0.07, 0.05], rot: V, pos: [0, 1.43, 0], at: ETR.flatMap((pts) => [pts[0], pts[pts.length - 1]]).map(([x, z]) => [R2(EX + x), 0, z]), mat: "darker" });
// 中央一顆有接腳的晶片（QFP）
BOX("eIc", "eTr", EX + 1.6, EX + 2.6, 1.44, 1.6, 1.0, 1.7, "chip"); P({ id: "eIcPin", layer: "eTr", shape: "box", size: [0.06, 0.03, 0.18], pos: [0, 1.45, 0], at: [0, 1, 2, 3, 4, 5, 6].flatMap((i) => [[R2(EX + 1.7 + i * 0.14), 0, 0.9], [R2(EX + 1.7 + i * 0.14), 0, 1.8]]), mat: "padGold" });
// 乾膜：蝕刻前蓋住要留下的線路（藍色），蝕刻完剝掉
LAY("eFilm", [8, 0.1, EX, 1.46]);
ETR.forEach((pts, k) => { for (let i = 0; i < pts.length - 1; i++) { const [x0, z0] = pts[i], [x1, z1] = pts[i + 1], L = Math.hypot(x1 - x0, z1 - z0), ang = -Math.atan2(z1 - z0, x1 - x0) / D2R;
  P({ id: `eF${k}_${i}`, layer: "eFilm", shape: "box", size: [R2(L + 0.2), 0.03, 0.2], pos: [R2(EX + (x0 + x1) / 2), 1.455, R2((z0 + z1) / 2)], rot: [0, R2(ang), 0], mat: "film" }); }
  for (const [x, z] of [pts[0], pts[pts.length - 1]]) P({ id: `eFp${k}_${x > 0 ? 1 : 0}_${z}`, layer: "eFilm", shape: "cyl", size: [0.25, 0.03], rot: V, pos: [R2(EX + x), 1.455, z], mat: "film" }); });
// 兩端的小晶片（送出／接收）
LAY("eChips", [8, 0.4, EX, 1.6]);
for (const [x, n] of [[-4.5, "Tx"], [4.5, "Rx"]]) { BOX(`e${n}`, "eChips", R2(EX + x - 0.5), R2(EX + x + 0.5), 1.24, 1.6, -1.8, 1.8, "chip"); BOX(`e${n}Top`, "eChips", R2(EX + x - 0.45), R2(EX + x + 0.45), 1.6, 1.61, -1.7, 1.7, "chipTop"); }

// ═════ 站 S：損耗對照（x 155）：後道＝一般材料（泥巴路）、前道＝低損耗（跑道）；兩端送出／接收晶片 ═════
const SX = 155, SL = 6, LA = -1.7, LB = 1.7;
LAY("sBase", [14, 1, SX, 0.4]);
BOX("sTable", "sBase", SX - 7.2, SX + 7.2, 0, 0.7, -3.4, 3.4, "band"); BOX("sTableTop", "sBase", SX - 7.2, SX + 7.2, 0.7, 0.75, -3.4, 3.4, "panel2");
const lane = (pre, z, mat, lay) => {
  LAY(lay, [13, 0.5, SX, 0.9]);
  BOX(`${pre}Board`, lay, SX - SL - 0.3, SX + SL + 0.3, 0.75, 0.95, z - 1.2, z + 1.2, mat);
  BOX(`${pre}Trace`, lay, SX - SL + 0.6, SX + SL - 0.6, 0.95, 0.99, z - 0.09, z + 0.09, "cuHi");
  BOX(`${pre}Tx`, lay, SX - SL - 0.2, SX - SL + 0.8, 0.95, 1.35, z - 0.8, z + 0.8, "chip"); BOX(`${pre}TxTop`, lay, SX - SL - 0.15, SX - SL + 0.75, 1.35, 1.36, z - 0.75, z + 0.75, "chipTop");
  P({ id: `${pre}Pin`, layer: lay, shape: "box", size: [0.08, 0.04, 0.22], pos: [0, 0.97, 0], at: [SX - SL + 0.3, SX + SL - 0.3].flatMap((cx) => [0, 1, 2, 3, 4, 5].flatMap((i) => [[R2(cx - 0.4 + i * 0.16), 0, R2(z - 0.9)], [R2(cx - 0.4 + i * 0.16), 0, R2(z + 0.9)]])), mat: "padGold" });
  BOX(`${pre}Rx`, lay, SX + SL - 0.8, SX + SL + 0.2, 0.95, 1.35, z - 0.8, z + 0.8, "chip"); BOX(`${pre}RxTop`, lay, SX + SL - 0.75, SX + SL + 0.15, 1.35, 1.36, z - 0.75, z + 0.75, "chipTop");
};
lane("sa", LA, "mud", "sLaneA"); lane("sb", LB, "track", "sLaneB");
// 泥巴路：坑坑疤疤的泥塊；跑道：白色分道線
P({ id: "saMud", layer: "sLaneA", shape: "sphere", size: [0.16], pos: [0, 0.95, LA], at: Array.from({ length: 22 }, (_, i) => [R2(SX - 5.2 + i * 0.5), 0, R2(((i * 7) % 5 - 2) * 0.22 + (i % 2 ? 0.55 : -0.55))]), mat: "mudD" });
P({ id: "sbLine", layer: "sLaneB", shape: "box", size: [R2(2 * SL - 1.6), 0.012, 0.05], pos: [SX, 0.957, LB], at: [[0, 0, -0.75], [0, 0, 0.75]], mat: "trackL" });
P({ id: "sbDash", layer: "sLaneB", shape: "box", size: [0.4, 0.012, 0.05], pos: [0, 0.957, LB], at: Array.from({ length: 12 }, (_, i) => [R2(SX - 5 + i * 0.9), 0, 0.38]), mat: "trackL" });
// 接收端燈：一般材料暗、低損耗亮
LAY("sRxA", [0.4, 0.4, SX + SL - 0.3, 1.5]); SPH("saRxLed", "sRxA", 0.13, SX + SL - 0.3, 1.45, LA, "lampY");
LAY("sRxB", [0.4, 0.4, SX + SL - 0.3, 1.5]); SPH("sbRxLed", "sRxB", 0.13, SX + SL - 0.3, 1.45, LB, "lampG");
// 後方伺服器機箱（情境）
LAY("sServer", [8, 4, SX, 3]);
BOX("ssBox", "sServer", SX - 4, SX + 4, 0.75, 4.6, -6.0, -4.2, "darker");
P({ id: "ssSlot", layer: "sServer", shape: "box", size: [7.4, 0.5, 0.05], pos: [SX, 0, -4.18], at: Array.from({ length: 6 }, (_, i) => [0, R2(1.1 + i * 0.6), 0]), mat: "dark" });
P({ id: "ssHdl", layer: "sServer", shape: "box", size: [0.12, 0.3, 0.12], pos: [0, 0, -4.1], at: Array.from({ length: 6 }, (_, i) => [[R2(SX - 3.6), R2(1.1 + i * 0.6), 0], [R2(SX + 3.0), R2(1.1 + i * 0.6), 0]]).flat(), mat: "steel2" });
P({ id: "ssVent", layer: "sServer", shape: "box", size: [0.08, 0.3, 0.02], pos: [0, 0, -4.14], at: Array.from({ length: 6 }, (_, i) => Array.from({ length: 14 }, (_, j) => [R2(SX - 2.2 + j * 0.32), R2(1.1 + i * 0.6), 0])).flat(), mat: "darker" });
P({ id: "ssLed", layer: "sServer", shape: "sphere", size: [0.07], pos: [0, 0, -4.15], at: Array.from({ length: 6 }, (_, i) => [R2(SX + 3.4), R2(1.1 + i * 0.6), 0]), mat: "lampG" });

// ═════ 站 V：供應商展示台（x 185）：三座台子各放一疊銅箔基板 ═════
const VX = 185;
// 每座：檯座正面貼公司文字名牌＋國旗（不是商標）；檯面一疊 5 張銅箔基板（銅面＋米色膠片邊、看得到布紋點，張與張略錯位）；後面立一片蝕刻好的樣板（走線、銲墊、過孔）
const VSIGNS = [["cclemc", "台光電|2383"], ["ccliteq", "聯茂|6213"], ["ccltuc", "台燿|6274"]];
{ const r = spawnSync("node", [path.join(HERE, "..", "..", "scripts", "three", "make-brand-tex.mjs"), "tech-ccl", "flag:TW", ...VSIGNS.map(([id, t]) => `text:${id}=${t}`)], { encoding: "utf8" }); if (r.status !== 0) { console.error(r.stderr); process.exit(1); } }
VSIGNS.forEach(([id]) => { materials[`t_${id}`] = { kind: "unlit", color: "#FFFFFF", img: `tex/brand/sign-${id}.png` }; });
materials.flag_TW = { kind: "unlit", color: "#FFFFFF", img: "tex/brand/flag-TW.png" };
for (const [k, dx] of [[0, -4.1], [1, 0], [2, 4.1]]) {
  const id = `vP${k}`, x = VX + dx; LAY(id, [3.6, 3.4, x, 1.7]);
  BOX(`${id}Pl`, id, x - 1.8, x + 1.8, 0, 1.1, -1.6, 1.6, "band"); BOX(`${id}Top`, id, x - 1.8, x + 1.8, 1.1, 1.15, -1.6, 1.6, "panel2");
  BOX(`${id}Kick`, id, x - 1.85, x + 1.85, 0, 0.12, -1.65, 1.65, "darker");
  for (let s = 0; s < 5; s++) {
    const jx = R2(((s * 37 + k * 11) % 7 - 3) * 0.025), jz = R2(((s * 53 + k * 7) % 5 - 2) * 0.03), y = 1.15 + s * 0.17;
    BOX(`${id}Cb${s}`, id, x - 1.4 + jx, x + 1.4 + jx, R2(y), R2(y + 0.025), -1.2 + jz, 0.9 + jz, "cu");
    BOX(`${id}S${s}`, id, x - 1.4 + jx, x + 1.4 + jx, R2(y + 0.025), R2(y + 0.145), -1.2 + jz, 0.9 + jz, "core");
    P({ id: `${id}W${s}`, layer: id, shape: "box", size: [0.07, 0.03, 0.012], pos: [0, R2(y + 0.085), R2(0.9 + jz + 0.004)], at: Array.from({ length: 14 }, (_, i) => [R2(x - 1.3 + jx + i * 0.2), 0, 0]), mat: "yarn" });
    BOX(`${id}C${s}`, id, x - 1.4 + jx, x + 1.4 + jx, R2(y + 0.145), R2(y + 0.17), -1.2 + jz, 0.9 + jz, "cuHi");
  }
  // 後面的蝕刻樣板（立在小架子上，朝前）
  const by = 2.75, bz = -1.35;
  BOX(`${id}Easel`, id, x - 0.08, x + 0.08, 1.15, 2.0, R2(bz - 0.12), R2(bz - 0.02), "dark");
  BOX(`${id}Bd`, id, x - 1.2, x + 1.2, R2(by - 0.8), R2(by + 0.8), R2(bz - 0.02), R2(bz + 0.04), "pcb");
  for (let t = 0; t < 4; t++) {
    const ty = R2(by - 0.55 + t * 0.36);
    BOX(`${id}Tr${t}a`, id, x - 1.0, x + 0.1, ty, R2(ty + 0.045), R2(bz + 0.04), R2(bz + 0.055), "padGold");
    BOX(`${id}Tr${t}b`, id, x + 0.1, x + 0.95, R2(ty + 0.16), R2(ty + 0.205), R2(bz + 0.04), R2(bz + 0.055), "padGold");
    BOX(`${id}Tr${t}c`, id, x + 0.08, x + 0.14, ty, R2(ty + 0.205), R2(bz + 0.04), R2(bz + 0.055), "padGold");
    BOX(`${id}Pd${t}`, id, x - 1.1, x - 0.94, R2(ty - 0.05), R2(ty + 0.095), R2(bz + 0.04), R2(bz + 0.06), "padGold");
    P({ id: `${id}Via${t}`, layer: id, shape: "cyl", size: [0.07, 0.03], rot: [Math.PI / 2, 0, 0], pos: [R2(x + 0.98), R2(ty + 0.18), R2(bz + 0.06)], mat: "padGold" });
    P({ id: `${id}ViaH${t}`, layer: id, shape: "cyl", size: [0.03, 0.035], rot: [Math.PI / 2, 0, 0], pos: [R2(x + 0.98), R2(ty + 0.18), R2(bz + 0.065)], mat: "darker" });
  }
  BOX(`${id}Ic`, id, x - 0.35, x + 0.25, R2(by + 0.45), R2(by + 0.72), R2(bz + 0.04), R2(bz + 0.12), "chip");
  P({ id: `${id}Sign`, layer: id, shape: "plane", size: [2.2, 0.7], pos: [R2(x + 0.25), 0.6, 1.62], mat: `t_${VSIGNS[k][0]}`, uv01: true });
  P({ id: `${id}Flag`, layer: id, shape: "plane", size: [0.72, 0.48], pos: [R2(x - 1.3), 0.6, 1.62], mat: "flag_TW", uv01: true });
}

// ═════ 站 N：下一集（x 215）：銅箔捲（亮面，拉出一段）＋玻纖布捲（拉出一段，看得到織紋） ═════
const NX = 215;
LAY("nBase", [12, 1, NX, 0.4]); BOX("nTable", "nBase", NX - 6, NX + 6, 0, 0.7, -2.6, 2.6, "band"); BOX("nTableTop", "nBase", NX - 6, NX + 6, 0.7, 0.75, -2.6, 2.6, "panel2");
LAY("nCuRoll", [3, 3, NX - 3, 2]); HXC("ncRoll", "nCuRoll", 1.0, NX - 5, NX - 1, 2.1, -0.6, "cuHi"); HXC("ncCore", "nCuRoll", 0.25, NX - 5.4, NX - 0.6, 2.1, -0.6, "steel");
for (const x of [-5.5, -0.5]) BOX(`ncStand${x}`, "nCuRoll", NX + x - 0.12, NX + x + 0.12, 0.75, 2.1, -0.8, -0.4, "dark");
BOX("ncSheet", "nCuRoll", NX - 4.8, NX - 1.2, 1.12, 1.15, 0.4, 2.2, "cuHi");
LAY("nGlRoll", [3, 3, NX + 3, 2]); HXC("ngRoll", "nGlRoll", 1.0, NX + 1, NX + 5, 2.1, -0.6, "yarn"); HXC("ngCore", "nGlRoll", 0.25, NX + 0.6, NX + 5.4, 2.1, -0.6, "steel");
for (const x of [0.5, 5.5]) BOX(`ngStand${x}`, "nGlRoll", NX + x - 0.12, NX + x + 0.12, 0.75, 2.1, -0.8, -0.4, "dark");
BOX("ngSheet", "nGlRoll", NX + 1.2, NX + 4.8, 0.76, 0.79, 0.4, 2.2, "yarnS");
P({ id: "ncRing", layer: "nCuRoll", shape: "tube", size: [1.01, 0.97, 0.02], rot: HX, pos: [0, 2.1, -0.6], at: [NX - 5.01, NX - 0.99].map((x) => [x, 0, 0]), mat: "cu" });
P({ id: "ncRing2", layer: "nCuRoll", shape: "tube", size: [0.7, 0.66, 0.02], rot: HX, pos: [0, 2.1, -0.6], at: [NX - 5.01, NX - 0.99].map((x) => [x, 0, 0]), mat: "cu" });
P({ id: "ngRingE", layer: "nGlRoll", shape: "tube", size: [1.01, 0.97, 0.02], rot: HX, pos: [0, 2.1, -0.6], at: [NX + 0.99, NX + 5.01].map((x) => [x, 0, 0]), mat: "yarnS" });
P({ id: "ngRingE2", layer: "nGlRoll", shape: "tube", size: [0.7, 0.66, 0.02], rot: HX, pos: [0, 2.1, -0.6], at: [NX + 0.99, NX + 5.01].map((x) => [x, 0, 0]), mat: "yarnS" });
P({ id: "ngWv", layer: "nGlRoll", shape: "tube", size: [1.015, 0.99, 0.03], rot: HX, pos: [0, 2.1, -0.6], at: Array.from({ length: 19 }, (_, i) => [R2(NX + 1.2 + i * 0.2), 0, 0]), mat: "yarnS" });
P({ id: "ngWarp", layer: "nGlRoll", shape: "box", size: [0.06, 0.03, 1.8], pos: [0, 0.8, 1.3], at: Array.from({ length: 12 }, (_, i) => [R2(NX + 1.4 + i * 0.3), 0, 0]), mat: "yarn" });
P({ id: "ngWeft", layer: "nGlRoll", shape: "box", size: [3.6, 0.03, 0.06], pos: [NX + 3, 0.81, 0], at: Array.from({ length: 6 }, (_, i) => [0, 0, R2(0.55 + i * 0.3)]), mat: "yarn" });

// ═════ 動作 ═════
const KSIG = [[-4.2, 1.07, 3.0], [-4.2, 1.07, -0.2], [-1.4, 1.07, -0.2], [1.4, 1.07, -0.2], [4.2, 1.07, -0.2], [4.2, 1.07, 3.0]];
actions.kSig = { type: "flow", _說明: "鉤子：做好的電路板上，訊號沿走線來回跑（示意）", layer: "kPCB", path: KSIG, n: 6, size: 0.13, shape: "dot", rate: 0.7, color: "sigC", track: false };
actions.gGlow = { type: "pulse", _說明: "念到「撐住形狀」：經緯紗整片亮一下", parts: [...idsOf("gWarp")], color: "okC", glow: 0.35, freq: 1.0, halo: 0 };
actions.rUnSpin = { type: "rotate", _說明: "放卷：布捲轉動送布", parts: ["rUnRoll", "rUnMark"], axis: [0, 0, -1], pivot: [RX - 6, 2.2, 0], rps: 0.35, rampSpin: true };
actions.rWebDryF = { type: "flow", _說明: "乾布往前走（白色標記點）", layer: "rWebDry", path: [[RX - 6, 3.2, 1.0], [RX - 3.6, 3.26, 1.0], [RX - 2.5, 1.5, 1.0]], n: 4, size: 0.09, shape: "dot", rate: 0.45, color: "glassC", track: false };
actions.rWebWetF = { type: "flow", _說明: "布浸過樹脂後往前走，經擠壓輥、進烘箱（琥珀色標記點）", layer: "rWebWet", path: [[RX - 2.5, 1.5, 1.0], [RX - 1.8, 0.66, 1.0], [RX + 0.4, 2.65, 1.0], [OV0, 2.65, 1.0], [OV1, 2.65, 1.0], [RX + 8.6, 2.65, 1.0]], n: 8, size: 0.09, shape: "dot", rate: 0.3, color: "ppC", track: false };
actions.rGuideSpin = { type: "rotate", parts: ["rGuide0", "rMkG0"], axis: [0, 0, -1], pivot: [RX - 3.6, 3.05, 0], rps: 0.9, rampSpin: true };
actions.rDipSpin = { type: "rotate", parts: ["rGuide1", "rMkG1"], axis: [0, 0, 1], pivot: [RX - 1.8, 0.75, 0], rps: 0.9, rampSpin: true };
actions.rSqzLo = { type: "rotate", _說明: "擠壓輥一對反向轉（下支逆、上支順，夾著布往右送）", parts: ["rSqz0", "rMkS0"], axis: [0, 0, -1], pivot: [RX + 0.4, 2.25, 0], rps: 0.5, rampSpin: true };
actions.rSqzHi = { type: "rotate", parts: ["rSqz1", "rMkS1"], axis: [0, 0, 1], pivot: [RX + 0.4, 2.95, 0], rps: 0.5, rampSpin: true };
for (let i = 0; i < 11; i++) actions[`eRS${i}`] = { type: "rotate", parts: [`eRol${i}`, `eRolMk${i}`], axis: [0, 0, -1], pivot: [R2(EX - 4.5 + i * 0.9), 1.13, 0], rps: 0.6, rampSpin: true };
actions.rDrip = { type: "flow", _說明: "擠壓輥擠掉多的樹脂，滴回槽裡（受重力加速）", layer: "rFrame", path: [[RX + 0.1, 2.3, 0.6], [RX - 0.6, 1.45, 0.6]], n: 3, lanes: 2, laneDir: [0, 0, -1], laneGap: 0.9, size: 0.08, shape: "dot", rate: 1.1, color: "resinL", track: false, accel: true, free: true };
actions.rHeatGlow = { type: "pulse", _說明: "烘箱加熱管發紅（把樹脂烘到半固化）", parts: ["rHeat"], color: "heatC", glow: 0.8, freq: 0.8, halo: 0 };
actions.rHotAir = { type: "flow", _說明: "烘箱裡熱風貼著布面吹過（布在 y2.6）", layer: "rFrame", path: [[OV0 + 0.4, 2.76, 0], [OV1 - 0.4, 2.76, 0]], n: 4, lanes: 3, laneDir: [0, 0, 1], laneGap: 0.8, size: 0.12, shape: "arrow", rate: 0.9, color: "hotC", track: false };
actions.hHeat = { type: "pulse", _說明: "上下熱板加熱（示意，不標溫度）", parts: ["hBotHeat", "htHeat"], color: "heatC", glow: 0.9, freq: 0.8, halo: 0 };
actions.hStackHot = { type: "pulse", _說明: "膠片受熱（樹脂變軟、流動）", parts: ["hPP0b", "hPP1b", "hPP2b", "hPP3b"], color: "hotC", glow: 0.35, freq: 1.0, halo: 0 };
actions.eSpray = { type: "flow", _說明: "蝕刻藥水往下噴（受重力加速）", layer: "eLine", path: [[EX - 3.6, 3.0, 0], [EX - 3.6, 1.5, 0]], n: 3, lanes: 7, laneDir: [1, 0, 0], laneGap: 1.2, size: 0.09, shape: "dot", rate: 1.2, color: "glassC", track: false, accel: true, free: true };
ETR.slice(0, 3).forEach((pts, k) => { actions[`eSig${k}`] = { type: "flow", ...(k === 0 ? { _說明: "訊號沿三條走線從送出晶片跑到接收晶片" } : {}), layer: "eTr", path: pts.map(([x, z]) => [R2(EX + x), 1.47, z]), n: 3, size: 0.12, shape: "dot", rate: 0.6, color: "sigC", track: false, phase: k * 0.3 }; });
// 損耗對照：一般材料（後道）訊號越走越小；低損耗（前道）幾乎不變
const SA = [SX - SL + 0.8, SX - 2, SX + 2, SX + SL - 0.8];
for (let k = 0; k < 8; k++) { const x0 = R2(SA[0] + (SA[3] - SA[0]) * k / 8), x1 = R2(SA[0] + (SA[3] - SA[0]) * (k + 1) / 8);
  actions[`sA${k}`] = { type: "flow", ...(k === 0 ? { _說明: "一般材料：同速前進，光點沿路一段段變小（每段約 ×0.78，示意）" } : {}), layer: "sLaneA", path: [[x0, 1.04, LA], [x1, 1.04, LA]], n: 1, size: R2(0.26 * 0.78 ** k), shape: "dot", rate: 0.6, color: k < 6 ? "sigC" : "sigW", track: false, phase: R2(k / 8) };
  actions[`sB${k}`] = { type: "flow", ...(k === 0 ? { _說明: "低損耗：同速，光點只稍微變小（到終點約剩八成，示意）" } : {}), layer: "sLaneB", path: [[x0, 1.04, LB], [x1, 1.04, LB]], n: 1, size: R2(0.26 * 0.97 ** k), shape: "dot", rate: 0.6, color: "sigC", track: false, phase: R2(k / 8) }; }
actions.sRxBGlow = { type: "pulse", _說明: "低損耗那道的接收燈亮", parts: ["sbRxLed"], color: "lampG", glow: 0.9, freq: 1.2, halo: 0 };
actions.sSrvLed = { type: "pulse", parts: ["ssLed"], color: "lampG", glow: 0.7, freq: 2.0, halo: 0 };
actions.nCuSpin = { type: "rotate", _說明: "銅箔捲、玻纖布捲慢慢轉（下一集主角）", parts: ["ncRoll", "ncRing", "ncRing2"], axis: [1, 0, 0], pivot: [NX - 3, 2.1, -0.6], rps: 0.15, rampSpin: true };
actions.nGlSpin = { type: "rotate", parts: ["ngRoll", "ngWv", "ngRingE", "ngRingE2"], axis: [1, 0, 0], pivot: [NX + 3, 2.1, -0.6], rps: 0.15, rampSpin: true };

// 標註點
Object.assign(anchors, {
  kBoardA: A("kPCB", [3.6, 1.06, 2.2], 150, -100), kChipA: A("kPCB", [1.2, 1.36, 1.2], 150, -100),
  kCuTA: A("kCuT", [3.8, R2(KTOP + 0.08), 2.6], 150, -100), kPPA: A("kPP1", [-3.8, R2(0.85 + KCU + 1.5 * KPP), 3.2], -150, -100), kCuBA: A("kCuB", [3.8, 0.93, 3.2], 150, 100), kCookieA: A("kCookie", [CKX, 1.53, 0.6], 150, -100),
  gWarpA: A("gWarp", [gx(2), GY, gz(GN - 1)], -150, -100), gFilA: A("gFil", [R2(GX + 1.1), R2(GY + 1.2), R2(gz(GN - 1) + 2.4)], 150, -100), gRollA: A("gRoll", [GX + 2, 2.75, -5.6], 150, -100),
  rTankA: A("rFrame", [RX - 1.8, 1.45, 1.3], -150, 100), rSqzA: A("rFrame", [RX + 0.4, 2.95, 1.3], -150, -100), rOvenA: A("rFrame", [RX + 4.6, 4.3, 1.5], 150, -100), rPPA: A("rPP5", [RX + 9.6, 1.42, 1.2], 150, -100),
  hPPA: A("hPP2", [HX0 + 2.8, R2((HSY.hPP2[0] + HSY.hPP2[1]) / 2), 1.5], 150, -100), hCuA: A("hCuT", [HX0 - 2.8, R2(HSY.hCuT[1]), 1.5], -150, -100), hTopA: A("hTop", [HX0 + 3.2, 5.5, 1.8], 150, -100),
  hBleedA: A("hBleed", [HX0 + 2.9, 2.33, 1.4], 150, 100), hCoreA: A("hCore", [HX0 - 2.8, 2.33, 1.5], -150, 100),
  eSprayA: A("eLine", [EX - 1.2, 3.14, 0], -150, -100), eTrA: A("eTr", [EX + 2.4, 1.44, -0.6], 150, 100), eSigA: A("eTr", [EX + 0.4, 1.44, 0.2], 150, -100),
  sLaneAA: A("sLaneA", [SX - 2, 0.96, LA - 0.9], -150, -100), sRxAA: A("sRxA", [SX + SL - 0.3, 1.55, LA], 150, -100), sLaneBA: A("sLaneB", [SX + 2, 0.96, LB + 0.9], 150, 100), sRxBA: A("sRxB", [SX + SL - 0.3, 1.55, LB], 150, -100),
  vA0: A("vP0", [VX - 4.1, 2.0, 1.2], -150, -100), vA1: A("vP1", [VX, 2.0, 1.2], 150, -100), vA2: A("vP2", [VX + 4.1, 2.0, 1.2], 150, -100),
  nCuA: A("nCuRoll", [NX - 3, 3.1, -0.6], -150, -100), nGlA: A("nGlRoll", [NX + 3, 3.1, -0.6], 150, -100),
});

const model = {
  name: "示意 銅箔基板：做好的電路板、夾心構造（銅箔／膠片／銅箔）、玻纖布織紋、含浸線、熱壓機、蝕刻成線路、損耗對照、供應商、下一集銅箔與玻纖布（示意，非特定廠牌／型號）",
  unit: "示意（放大）",
  size: { w: 40, h: 18, r: 0.6, t: 30 },
  palette, materials,
  partNames: { kCuT: "銅箔", kPP1: "膠片", gWarp: "玻纖布" },
  layers, parts, anchors, actions,
  pose: { yaw0: 0, yawIso: 0, drift: 0 },
  camera: { stand: { d: 70, elev: 24, y: 4 } },
  fx: { dpr: 1, srcPx: 30, shadows: 0, fog: false, dust: false, vaporSprites: false, shimmer: false },
  info: { GX, RX, HX0, EX, SX, VX, NX, GN, HTOP: R2(HTOP), KTOP: R2(KTOP) },
};
fs.writeFileSync(path.join(HERE, "model.json"), JSON.stringify(model, null, 1) + "\n");
console.log(`✔ model.json：${parts.length} 個零件、${parts.reduce((a, p) => a + Math.max(1, p.at?.length ?? 0), 0)} 個實體、${layers.length} 層`);

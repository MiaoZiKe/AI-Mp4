// node videos/tech-fanout/gen-model.mjs → 寫 videos/tech-fanout/model.json
// 2026/11/27 tech-fanout（扇出型與晶圓級封裝，系列 3 第 5 集）。構造與物理照 physics-spec.md。
// 單位：1＝1 mm（示意，封裝尺寸放大，不按真實比例），地板頂面 y＝0，x 向右、z 向觀眾。站點：
//   A 覆晶 vs 扇出型對照（x 0）｜B 晶圓級封裝晶圓＋切割（x 36）｜C 晶片底面（扇入擠不下，x 72）｜D 重組晶圓（取放＋模封，x 108）
//   E 扇出型封裝剖面爆炸（x 144）｜F 翹曲與晶片偏移（x 180）｜G 公司（x 216）｜H 多晶片封裝＋設備剪影（x 252）。示意，非特定產品。
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
const HERE = path.dirname(new URL(import.meta.url).pathname);
const R2 = (x) => Math.round(x * 1000) / 1000;
const D2R = Math.PI / 180;
const pol = (aDeg, r) => [R2(r * Math.cos(aDeg * D2R)), R2(r * Math.sin(aDeg * D2R))]; // (x, z)
let seed = 20261128;
const rnd = () => { seed |= 0; seed = (seed + 0x6d2b79f5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
const palette = {
  moldC: "#25272C", moldEC: "#3A3D45", piC: "#D9A441", piDC: "#B8862E", solderC: "#C9CED6", padC: "#D8B04A", subC: "#2F7D4F", subDC: "#225E3B", tapeC: "#F5F2E6", carrierC: "#CFE6F2", uFillC: "#E9E3D2", redC: "#E5484D", dieTopC: "#59657A",
  eqC: "#18A957",
  floorC: "#C9D2DE", panel: "#F3F5F8", panel2: "#E2E8F0", seam: "#8E9BB0", band: "#24324C", steel: "#7D8CA6", steel2: "#A9B5C7", dark: "#3E4A60", backC: "#2B3650",
  glassC: "#BFD3F2", lampY: "#F2B632", lampG: "#2FBF71", lampR: "#E5484D", rubber: "#2B2F36", gold: "#C9A24A", estop: "#D93A2B", cutC: "#6E809C",
  cerC: "#F2EBDD", cerDC: "#D9CDB4", quartzC: "#DDF0F4", quartzOC: "#B9CDD2", siC: "#7C8798", sicC: "#2E3340", cuC: "#C47B3E", cuDC: "#A9622D", aluC: "#B8C2D2",
  plasmaC: "#8E7CF6", plasmaPC: "#F06FB8", sheathC: "#2B2250", ionC: "#FFD35A", debrisC: "#3B3427", chipC: "#F4F1EA", heC: "#7FD3F5", plusC: "#E5484D", minusC: "#2F7FE0",
  markC: "#E8613C", brassC: "#C8A24A", yellowBr: "#F2B632", hoseB: "#3E7BD6", hoseR: "#D9534F", wallW: "#F4F6FA", pumpC: "#5C7396", cabC: "#EDEFF3", airC: "#9FD8F5", ffuC: "#FFFFFF", amberC: "#F29A4A",
};
const M = (kind, color, o = {}) => ({ kind, color, ...o });
const glowM = (c, op, ei = 1) => M("std", c, { emissive: c, ei, opacity: op, rough: 1, metal: 0 });
const materials = {
  mold: M("std", "moldC", { rough: 0.85, metal: 0.05, env: 0.1 }), moldE: M("std", "moldEC", { rough: 0.8, metal: 0.05 }), pi: M("std", "piC", { rough: 0.5, metal: 0, opacity: 0.85, env: 0.3 }), piD: M("std", "piDC", { rough: 0.55, metal: 0, opacity: 0.9 }),
  solder: M("std", "solderC", { rough: 0.25, metal: 0.9, env: 0.9 }), pad: M("std", "padC", { rough: 0.3, metal: 0.9, env: 0.8 }), sub: M("std", "subC", { rough: 0.6, metal: 0.05 }), subD: M("std", "subDC", { rough: 0.6, metal: 0.05 }),
  tape: M("std", "tapeC", { rough: 0.8, metal: 0, opacity: 0.35 }), carrier: M("phys", "carrierC", { rough: 0.05, metal: 0, clearcoat: 1, opacity: 0.55, env: 0.7 }), uFill: M("std", "uFillC", { rough: 0.7, metal: 0 }), red: glowM("redC", 0.95, 0.7), dieTop: M("std", "dieTopC", { rough: 0.3, metal: 0.6, env: 0.7 }),
  floor: M("std", "floorC", { rough: 0.7, metal: 0.3, tex: "brushed", texScale: 3 }), panel: M("std", "panel", { rough: 0.55, metal: 0.05, env: 0.25 }), panel2: M("std", "panel2", { rough: 0.6, metal: 0.05, env: 0.2 }),
  seam: M("std", "seam", { rough: 0.6, metal: 0.3 }), band: M("std", "band", { rough: 0.4, metal: 0.3, env: 0.4 }), back: M("std", "backC", { rough: 0.7, metal: 0.1 }),
  steel: M("std", "steel", { rough: 0.35, metal: 0.85, env: 0.5 }), steel2: M("std", "steel2", { rough: 0.3, metal: 0.8, env: 0.6, tex: "brushed", texScale: 2 }), alu: M("std", "aluC", { rough: 0.3, metal: 0.8, env: 0.6, tex: "brushed", texScale: 1.6 }),
  dark: M("std", "dark", { rough: 0.5, metal: 0.4, env: 0.3 }), rubber: M("std", "rubber", { rough: 0.9, metal: 0 }), gold: M("std", "gold", { rough: 0.3, metal: 0.9, env: 0.8 }),
  window: M("phys", "glassC", { rough: 0.05, metal: 0, clearcoat: 1, opacity: 0.3, env: 0.6 }), cut: M("std", "cutC", { rough: 0.8, metal: 0.2 }),
  lampY: M("std", "lampY", { emissive: "lampY", ei: 0.4, rough: 0.4, metal: 0 }), lampG: M("std", "lampG", { emissive: "lampG", ei: 0.35, rough: 0.4, metal: 0 }), lampR: M("std", "lampR", { emissive: "lampR", ei: 0.3, rough: 0.4, metal: 0 }), estop: M("std", "estop", { rough: 0.4, metal: 0, emissive: "estop", ei: 0.15 }),
  cer: M("std", "cerC", { rough: 0.9, metal: 0, env: 0.15 }), cerD: M("std", "cerDC", { rough: 0.95, metal: 0 }), quartz: M("phys", "quartzC", { rough: 0.05, metal: 0, clearcoat: 1, opacity: 0.62, env: 0.8 }), quartzOld: M("phys", "quartzOC", { rough: 0.7, metal: 0, opacity: 0.85, env: 0.3 }),
  si: M("std", "siC", { rough: 0.2, metal: 0.65, env: 0.9 }), sic: M("std", "sicC", { rough: 0.85, metal: 0.2, env: 0.2 }), cu: M("std", "cuC", { rough: 0.3, metal: 0.95, env: 0.8 }), cuD: M("std", "cuDC", { rough: 0.35, metal: 0.95, env: 0.7 }),
  plasma: glowM("plasmaC", 0.4, 1.0), plasmaCore: glowM("plasmaC", 0.34, 1.3), plasmaP: glowM("plasmaPC", 0.42, 1.0), sheath: M("std", "sheathC", { rough: 1, metal: 0, opacity: 0.55 }),
  ion: glowM("ionC", 0.95, 0.9), debris: glowM("debrisC", 0.95, 0.1), chip: glowM("chipC", 0.95, 0.4), he: glowM("heC", 0.95, 0.7), plus: glowM("plusC", 0.95, 0.9), minus: glowM("minusC", 0.95, 0.9), mark: M("std", "markC", { rough: 0.5, metal: 0, emissive: "markC", ei: 0.25 }),
  eq: glowM("eqC", 0.95, 0.8), spark: glowM("ionC", 0.9, 1.4), bracket: M("std", "yellowBr", { rough: 0.5, metal: 0, emissive: "yellowBr", ei: 0.35 }), warnY: M("std", "lampY", { rough: 0.5, metal: 0, emissive: "lampY", ei: 0.2 }),
  brass: M("std", "brassC", { rough: 0.3, metal: 0.9, env: 0.7 }), hoseB: M("std", "hoseB", { rough: 0.35, metal: 0.3 }), hoseR: M("std", "hoseR", { rough: 0.35, metal: 0.3 }),
  wallW: M("std", "wallW", { rough: 0.6, metal: 0.05, env: 0.3 }), pump: M("std", "pumpC", { rough: 0.45, metal: 0.5, env: 0.5 }), cab: M("std", "cabC", { rough: 0.55, metal: 0.1, env: 0.3 }), screen: M("std", "hoseB", { emissive: "hoseB", ei: 0.5, rough: 0.3, metal: 0 }),
  air: glowM("airC", 0.85, 0.7), ffu: M("std", "ffuC", { emissive: "ffuC", ei: 0.7, rough: 0.5, metal: 0 }), hot: glowM("amberC", 0.9, 0.9), edge: glowM("ffuC", 0.95, 0.6),
};
const parts = [], layers = [], anchors = {}, actions = {};
const P = (o) => { parts.push(o); return o; };
const LAY = (id, outline, bg) => layers.push({ id, z: 0, k: 0, outline, ...(bg ? { bg: true } : {}) });
const V = [90, 0, 0], HX = [0, 90, 0];
const BOX = (id, layer, x0, x1, y0, y1, z0, z1, mat, o = {}) => P({ id, layer, shape: "box", size: [R2(x1 - x0), R2(y1 - y0), R2(z1 - z0)], pos: [R2((x0 + x1) / 2), R2((y0 + y1) / 2), R2((z0 + z1) / 2)], mat, ...o });
const VC = (id, layer, R, y0, y1, mat, o = {}) => { const { x = 0, z = 0, ...r } = o; return P({ id, layer, shape: "cyl", size: [R, R2(y1 - y0)], rot: V, pos: [x, R2((y0 + y1) / 2), z], mat, ...r }); };
const VT = (id, layer, Ro, Ri, y0, y1, mat, o = {}) => { const { x = 0, z = 0, ...r } = o; return P({ id, layer, shape: "tube", size: [Ro, Ri, R2(y1 - y0)], rot: V, pos: [x, R2((y0 + y1) / 2), z], mat, ...r }); };
const HXC = (id, layer, R, x0, x1, y, z, mat, o = {}) => P({ id, layer, shape: "cyl", size: [R, R2(Math.abs(x1 - x0))], rot: HX, pos: [R2((x0 + x1) / 2), y, z], mat, ...o });
const ZC = (id, layer, R, z0, z1, x, y, mat, o = {}) => P({ id, layer, shape: "cyl", size: [R, R2(Math.abs(z1 - z0))], pos: [x, y, R2((z0 + z1) / 2)], mat, ...o });
const RING = (n, r, a0 = 0, cx = 0, cz = 0) => Array.from({ length: n }, (_, i) => { const [x, z] = pol(a0 + (i * 360) / n, r); return [R2(x + cx), 0, R2(z + cz)]; });
const SPH = (id, layer, r, x, y, z, mat, o = {}) => P({ id, layer, shape: "sphere", size: [r], pos: [x, y, z], mat, ...o });
const A = (layer, p, dx, dy) => ({ layer, p, dx, dy });
const PIPE = (id, layer, pts, r, mat, o = {}) => {
  for (let i = 0; i < pts.length - 1; i++) {
    const [x0, y0, z0] = pts[i], [x1, y1, z1] = pts[i + 1];
    const dx = x1 - x0, dy = y1 - y0, dz = z1 - z0, L = Math.hypot(dx, dy, dz);
    const rot = Math.abs(dx) > 1e-6 ? HX : Math.abs(dy) > 1e-6 ? V : [0, 0, 0];
    P({ id: `${id}${i}`, layer, shape: "cyl", size: [r, R2(L)], rot, pos: [R2((x0 + x1) / 2), R2((y0 + y1) / 2), R2((z0 + z1) / 2)], mat, ...o });
    if (i > 0) SPH(`${id}J${i}`, layer, r * 1.12, x0, y0, z0, mat);
  }
};
// 剖面輪廓亮線（前表面）：每段一根細條，斜段用 z 軸旋轉
const OUTL = (id, layer, pts, z, mat = "edge", w = 0.06, closed = true) => { const n = pts.length; for (let i = 0; i < (closed ? n : n - 1); i++) { const [x0, y0] = pts[i], [x1, y1] = pts[(i + 1) % n]; const L = Math.hypot(x1 - x0, y1 - y0); if (L < 1e-3) continue; P({ id: `${id}${i}`, layer, shape: "box", size: [R2(L + w), w, 0.03], pos: [R2((x0 + x1) / 2), R2((y0 + y1) / 2), z], rot: [0, 0, R2((Math.atan2(y1 - y0, x1 - x0) * 180) / Math.PI)], mat }); } };
const idsOf = (layer) => parts.filter((q) => q.layer === layer).map((q) => q.id);
LAY("floor", [320, 2, 126, 0], true);
P({ id: "floor", layer: "floor", shape: "slab", size: [340, 0.5, 60], r: 0.2, pos: [126, -0.25, 0], mat: "floor" });
P({ id: "floorSeam", layer: "floor", shape: "slab", size: [340, 0.04, 0.1], pos: [126, 0.01, 0], at: Array.from({ length: 9 }, (_, i) => [0, 0, -20 + i * 5]), mat: "seam" });
const BACKDROP = (id, x0, x1, y1, zb = -4.2) => { LAY(id, [R2(x1 - x0), y1, R2((x0 + x1) / 2), R2(y1 / 2)], true); BOX(`${id}P`, id, x0, x1, 0.9, y1, zb, R2(zb + 0.12), "back"); };
const PLINTH = (id, x0, x1, z = 4.0) => { LAY(id, [R2(x1 - x0), 1, R2((x0 + x1) / 2), 0.5], true); BOX(`${id}B`, id, x0, x1, 0, 0.9, -z, z, "band"); BOX(`${id}T`, id, x0, x1, 0.9, 1.0, -z, z, "panel2"); };

// ═════ 共用：半剖封裝（z ≤ 0 的半個，剖面朝鏡頭）═════
const GRID = (xs, zs) => xs.flatMap((x) => zs.map((z) => [x, 0, z]));
// 覆晶封裝（前一集）：錫球→厚載板（綠，內層銅）→銅柱凸塊＋底部填膠→晶片
const flipPkg = (pre, X, y0 = 1.0) => {
  LAY(`${pre}`, [12, 4.4, X, y0 + 2.2]);
  P({ id: `${pre}Ball`, layer: pre, shape: "sphere", size: [0.42], pos: [X, R2(y0 + 0.42), 0], at: GRID([-4.5, -3, -1.5, 0, 1.5, 3, 4.5], [-0.5, -2, -3.5, -5]), mat: "solder" });
  BOX(`${pre}SubB`, pre, X - 6, X + 6, y0 + 0.8, y0 + 1.5, -6, 0, "subD"); BOX(`${pre}SubT`, pre, X - 6, X + 6, y0 + 1.5, y0 + 2.2, -6, 0, "sub");
  for (let k = 0; k < 4; k++) BOX(`${pre}SubCu${k}`, pre, X - 5.6, X + 5.6, R2(y0 + 0.95 + k * 0.33), R2(y0 + 1.0 + k * 0.33), -0.04, 0.01, "cu"); // 剖面看得到的內層銅
  P({ id: `${pre}Via`, layer: pre, shape: "box", size: [0.12, 1.3, 0.05], pos: [X, R2(y0 + 1.5), -0.01], at: [-4.5, -1.5, 1.5, 4.5].map((x) => [x, 0, 0]), mat: "cu" });
  BOX(`${pre}UF`, pre, X - 3.1, X + 3.1, y0 + 2.2, y0 + 2.6, -3.1, 0, "uFill"); BOX(`${pre}UFf`, pre, X - 3.4, X + 3.4, y0 + 2.2, y0 + 2.32, -3.4, 0, "uFill");
  P({ id: `${pre}Bump`, layer: pre, shape: "cyl", size: [0.18, 0.4], rot: V, pos: [X, R2(y0 + 2.4), 0], at: GRID([-2.4, -1.6, -0.8, 0, 0.8, 1.6, 2.4], [-0.3, -1.1, -1.9, -2.7]), mat: "cu" });
  BOX(`${pre}Die`, pre, X - 2.8, X + 2.8, y0 + 2.6, y0 + 3.4, -2.8, 0, "si"); BOX(`${pre}DieT`, pre, X - 2.8, X + 2.8, y0 + 3.38, y0 + 3.42, -2.8, 0, "dieTop");
  BOX(`${pre}O1`, pre, X - 6, X + 6, R2(y0 + 2.17), R2(y0 + 2.22), 0, 0.04, "edge"); BOX(`${pre}O2`, pre, X - 6, X + 6, R2(y0 + 0.78), R2(y0 + 0.83), 0, 0.04, "edge"); // 載板剖面亮邊
};
// 扇出型封裝：錫球→球下金屬墊→介電層 2→銅重佈線→介電層 1＋導通孔→晶片（正面朝下）埋在模封料；pre 下分 5 層（可爆炸）
const FO = { ball: [0, 0.84], ubm: [0.84, 0.92], pi2: [0.92, 1.22], rdl: [1.22, 1.34], pi1: [1.34, 1.64], die: [1.64, 2.6], mold: [1.64, 2.9] };
// up：製作時的方向（重組晶圓翻面、重佈線面朝上，錫球最後植在最上面）
const FOU = { mold: [0, 1.26], die: [0.3, 1.26], pi1: [1.26, 1.56], rdl: [1.56, 1.68], pi2: [1.68, 1.98], ubm: [1.98, 2.06], ball: [2.06, 2.9] };
const foPkg = (pre, X, y0 = 1.0, o = {}) => {
  const { half = true, W = 12, dieW = 5, D = half ? 6 : 12, tiv = false, up = false } = o; const F = up ? FOU : FO;
  const z0 = half ? -D : -D / 2, z1 = half ? 0 : D / 2, dz0 = half ? -dieW : -dieW / 2, dz1 = half ? 0 : dieW / 2;
  const Y = (k, i) => R2(y0 + F[k][i]);
  const xsB = [-4.5, -3, -1.5, 0, 1.5, 3, 4.5].filter((x) => Math.abs(x) <= W / 2 - 1), zsB = half ? [-0.5, -2, -3.5, -5] : [-4.5, -3, -1.5, 0, 1.5, 3, 4.5].filter((z) => Math.abs(z) <= D / 2 - 1);
  LAY(`${pre}Ball`, [W, 1, X, Y("ball", 1) - 0.4]); P({ id: `${pre}BallS`, layer: `${pre}Ball`, shape: "sphere", size: [0.42], pos: [X, R2(Y("ball", 0) + 0.42), 0], at: GRID(xsB, zsB), mat: "solder" });
  LAY(`${pre}Pi2`, [W, 0.5, X, Y("pi2", 0)]); BOX(`${pre}Pi2B`, `${pre}Pi2`, X - W / 2, X + W / 2, Y("pi2", 0), Y("pi2", 1), z0, z1, "pi");
  P({ id: `${pre}Ubm`, layer: `${pre}Pi2`, shape: "cyl", size: [0.48, 0.08], rot: V, pos: [X, R2(Y("ubm", 0) + 0.04), 0], at: GRID(xsB, zsB), mat: "pad" });
  P({ id: `${pre}Via2`, layer: `${pre}Pi2`, shape: "cyl", size: [0.24, R2(F.pi2[1] - F.pi2[0] + 0.02)], rot: V, pos: [X, R2((Y("pi2", 0) + Y("pi2", 1)) / 2), 0], at: GRID(xsB, zsB).filter(([x, , z]) => !(Math.abs(x) < dieW / 2 && (half ? z > -dieW : Math.abs(z) < dieW / 2))), mat: "cu" }); // 第二層導通孔：重佈線末端 ↔ 球下金屬墊
  LAY(`${pre}Rdl`, [W, 0.3, X, Y("rdl", 0)]);
  // 銅重佈線：從晶片焊墊（晶片範圍內）一路拉到外圍錫球位置（三段：tr0 晶片下、tr1 跨出晶片邊、tr2 到外圍焊墊），s6 依序長出
  const rd = (id, x0, x1, z0_, z1_) => BOX(id, `${pre}Rdl`, R2(X + Math.min(x0, x1) - 0.09), R2(X + Math.max(x0, x1) + 0.09), Y("rdl", 0), Y("rdl", 1), R2(Math.min(z0_, z1_) - 0.09), R2(Math.max(z0_, z1_) + 0.09), "cu");
  const tr = []; xsB.forEach((bx, i) => zsB.forEach((bz, j) => { if (Math.abs(bx) < dieW / 2 && (half ? bz > -dieW : Math.abs(bz) < dieW / 2)) return; const px = Math.max(-dieW / 2 + 0.5, Math.min(dieW / 2 - 0.5, bx * 0.55)), pz = half ? Math.max(-dieW + 0.5, Math.min(-0.3, bz * 0.6)) : Math.max(-dieW / 2 + 0.5, Math.min(dieW / 2 - 0.5, bz * 0.55)); tr.push([px, pz, bx, bz]); }));
  tr.forEach(([px, pz, bx, bz], k) => { rd(`${pre}T${k}a`, px, px, pz, bz); rd(`${pre}T${k}b`, px, bx, bz, bz); });
  P({ id: `${pre}RdlPad`, layer: `${pre}Rdl`, shape: "cyl", size: [0.3, 0.13], rot: V, pos: [X, R2(Y("rdl", 0) + 0.06), 0], at: tr.map(([px, pz]) => [px, 0, pz]), mat: "cu" });
  LAY(`${pre}Pi1`, [W, 0.5, X, Y("pi1", 0)]); BOX(`${pre}Pi1B`, `${pre}Pi1`, X - W / 2, X + W / 2, Y("pi1", 0), Y("pi1", 1), z0, z1, "piD");
  P({ id: `${pre}Via`, layer: `${pre}Pi1`, shape: "cyl", size: [0.2, R2(F.pi1[1] - F.pi1[0] + 0.02)], rot: V, pos: [X, R2((Y("pi1", 0) + Y("pi1", 1)) / 2), 0], at: tr.map(([px, pz]) => [px, 0, pz]), mat: "cu" });
  LAY(`${pre}Die`, [W, 1.4, X, Y("mold", 0) + 0.6]);
  BOX(`${pre}DieB`, `${pre}Die`, X - dieW / 2, X + dieW / 2, Y("die", 0), Y("die", 1), dz0, dz1, "si"); BOX(`${pre}DieAct`, `${pre}Die`, X - dieW / 2, X + dieW / 2, up ? R2(Y("die", 1) - 0.06) : Y("die", 0), up ? Y("die", 1) : R2(Y("die", 0) + 0.06), dz0, R2(dz1 + 0.005), "pad"); // 正面（主動面）朝下
  // 模封料：晶片四周＋背面（半剖：前表面就是剖面）
  BOX(`${pre}MoL`, `${pre}Die`, X - W / 2, X - dieW / 2, Y("mold", 0), Y("mold", 1), z0, z1, "mold"); BOX(`${pre}MoR`, `${pre}Die`, X + dieW / 2, X + W / 2, Y("mold", 0), Y("mold", 1), z0, z1, "mold");
  BOX(`${pre}MoTop`, `${pre}Die`, X - dieW / 2, X + dieW / 2, up ? Y("mold", 0) : Y("die", 1), up ? Y("die", 0) : Y("mold", 1), dz0, dz1, "mold");
  if (half) BOX(`${pre}MoBack`, `${pre}Die`, X - dieW / 2, X + dieW / 2, Y("mold", 0), Y("mold", 1), z0, dz0, "mold");
  else { BOX(`${pre}MoBk`, `${pre}Die`, X - dieW / 2, X + dieW / 2, Y("mold", 0), Y("mold", 1), z0, dz0, "mold"); BOX(`${pre}MoFr`, `${pre}Die`, X - dieW / 2, X + dieW / 2, Y("mold", 0), Y("mold", 1), dz1, z1, "mold"); }
  if (half) { BOX(`${pre}DieO1`, `${pre}Die`, X - dieW / 2, X + dieW / 2, R2(Y("die", 1) - 0.05), Y("die", 1), 0, 0.03, "edge"); BOX(`${pre}DieO2`, `${pre}Die`, X - dieW / 2, R2(X - dieW / 2 + 0.05), Y("die", 0), Y("die", 1), 0, 0.03, "edge"); BOX(`${pre}DieO3`, `${pre}Die`, R2(X + dieW / 2 - 0.05), X + dieW / 2, Y("die", 0), Y("die", 1), 0, 0.03, "edge"); }
  if (tiv) P({ id: `${pre}Tiv`, layer: `${pre}Die`, shape: "cyl", size: [0.22, R2(FO.mold[1] - FO.rdl[1])], rot: V, pos: [X, R2((Y("rdl", 1) + Y("mold", 1)) / 2), 0], at: GRID([-W / 2 + 0.7, -W / 2 + 1.4, W / 2 - 1.4, W / 2 - 0.7].map(R2), [-3, -1.5, 0, 1.5, 3]).filter(([x, , z]) => Math.abs(z) <= D / 2 - 0.5), mat: "cu" });
  return { tr, Y, xsB, zsB };
};

// ═════ 站 A：覆晶（左）vs 扇出型（右）對照 ═════
const AX0 = 0; BACKDROP("aBack", -16, 16, 9.0); PLINTH("aPl", -16, 16, 7);
flipPkg("aFlip", AX0 - 8); const aFo = foPkg("aFo", AX0 + 8);
LAY("aTagL", [5, 1, AX0 - 8, 0.5]); BOX("aTagLB", "aTagL", AX0 - 10.5, AX0 - 5.5, 0.15, 0.8, 7.0, 7.06, "panel");
LAY("aBrk", [12, 0.2, AX0 - 8, 1.85]); BOX("aBrkV1", "aBrk", AX0 - 14.6, AX0 - 14.5, 1.8, 3.2, 0.1, 0.16, "bracket"); BOX("aBrkT1", "aBrk", AX0 - 14.8, AX0 - 14.3, 3.15, 3.25, 0.1, 0.16, "bracket"); BOX("aBrkB1", "aBrk", AX0 - 14.8, AX0 - 14.3, 1.75, 1.85, 0.1, 0.16, "bracket");
P({ id: "aBrkLink", layer: "aBrk", shape: "box", size: [0.6, 0.06, 0.06], pos: [AX0 - 14.2, 2.5, 0.13], mat: "bracket" }); // 載板厚度括弧（s1：載板）

// ═════ 站 B：晶圓級封裝（整片晶圓：每格晶片已有錫球；切割刀；頂出一顆）═════
const BXc = 36; BACKDROP("bBack", 22, 50, 9.0); PLINTH("bPl", 22, 50, 9);
const WR = 9.0, DP = 2.0; // 晶圓半徑、晶片間距
const bDies = []; for (let i = -5; i <= 4; i++) for (let j = -5; j <= 4; j++) { const cx = (i + 0.5) * DP, cz = (j + 0.5) * DP; if (Math.hypot(Math.abs(cx) + DP / 2, Math.abs(cz) + DP / 2) < WR - 0.2) bDies.push([cx, cz]); }
LAY("bWafer", [18, 0.6, BXc, 1.3]); VC("bWfDisc", "bWafer", WR, 1.0, 1.4, "si", { x: BXc }); VT("bWfBevel", "bWafer", WR, WR - 0.15, 1.38, 1.42, "edge", { x: BXc }); BOX("bWfNotch", "bWafer", BXc - 0.3, BXc + 0.3, 1.0, 1.43, WR - 0.3, WR + 0.02, "dark");
for (let i = -4; i <= 4; i++) { const c = i * DP, L = 2 * Math.sqrt(Math.max(0, WR * WR - c * c)) - 0.4; BOX(`bStX${i + 4}`, "bWafer", BXc - L / 2, BXc + L / 2, 1.4, 1.43, R2(c - 0.05), R2(c + 0.05), "dark"); BOX(`bStZ${i + 4}`, "bWafer", R2(BXc + c - 0.05), R2(BXc + c + 0.05), 1.4, 1.43, -L / 2, L / 2, "dark"); }
const bBalls = bDies.flatMap(([cx, cz]) => [-0.5, 0, 0.5].flatMap((a) => [-0.5, 0, 0.5].map((b) => [R2(cx + a), 0, R2(cz + b)])));
P({ id: "bWfBall", layer: "bWafer", shape: "sphere", size: [0.16], pos: [BXc, 1.52, 0], at: bBalls, mat: "solder" });
const BPK = [1.0, 5.0]; // 頂出的那顆（晶圓右前方）
LAY("bPick", [2, 1, BXc + BPK[0], 1.6]); BOX("bPkDie", "bPick", BXc + BPK[0] - 0.92, BXc + BPK[0] + 0.92, 1.0, 1.42, BPK[1] - 0.92, BPK[1] + 0.92, "si");
P({ id: "bPkBall", layer: "bPick", shape: "sphere", size: [0.16], pos: [BXc + BPK[0], 1.52, BPK[1]], at: GRID([-0.5, 0, 0.5], [-0.5, 0, 0.5]), mat: "solder" });
BOX("bPkHole", "bWafer", BXc + BPK[0] - 0.92, BXc + BPK[0] + 0.92, 1.41, 1.425, BPK[1] - 0.92, BPK[1] + 0.92, "dark");
// （同尺寸裸晶片對照拿掉：近景會掉到卡片區；頂出那顆抬起就看得出跟一格晶片一樣大）
// 切割刀（主軸＋護罩＋刀片＋冷卻水嘴），沿 x 方向的切割道（z＝4.0，兩排晶片之間）走；護罩只在刀片後半，刀片看得到
LAY("bSaw", [6, 5, BXc - 12, 4.5]); const SZ = 4.0;
ZC("bBlade", "bSaw", 2.2, R2(SZ - 0.04), R2(SZ + 0.04), BXc - 12, 2.6, "steel2"); ZC("bHub", "bSaw", 0.7, R2(SZ - 0.3), R2(SZ + 0.3), BXc - 12, 2.6, "steel"); ZC("bHubNut", "bSaw", 0.3, R2(SZ + 0.3), R2(SZ + 0.42), BXc - 12, 2.6, "dark");
BOX("bGuard", "bSaw", BXc - 14.6, BXc - 9.4, 3.6, 5.0, R2(SZ - 0.7), R2(SZ - 0.15), "panel"); BOX("bGuardS", "bSaw", BXc - 14.6, BXc - 9.4, 4.95, 5.05, R2(SZ - 0.72), R2(SZ - 0.13), "seam"); BOX("bGuardTop", "bSaw", BXc - 14.6, BXc - 9.4, 4.9, 5.0, R2(SZ - 0.7), R2(SZ + 0.3), "panel");
ZC("bSpindle", "bSaw", 0.6, R2(SZ - 3.5), R2(SZ - 0.3), BXc - 12, 2.6, "dark"); BOX("bMotor", "bSaw", BXc - 13.4, BXc - 10.6, 1.6, 3.8, R2(SZ - 6), R2(SZ - 3.5), "pump");
P({ id: "bMotorFin", layer: "bSaw", shape: "box", size: [2.8, 0.06, 0.08], pos: [BXc - 12, 2.0, R2(SZ - 3.48)], at: [0, 1, 2, 3, 4].map((k) => [0, R2(k * 0.35), 0]), mat: "dark" });
PIPE("bNoz", "bSaw", [[BXc - 9.6, 5.0, SZ], [BXc - 9.6, 3.6, SZ], [BXc - 10.4, 3.2, SZ]], 0.12, "steel");
actions.bSpin = { type: "rotate", _說明: "切割刀高速轉動", parts: ["bBlade", "bHub", "bHubNut"], axis: [0, 0, 1], pivot: [BXc - 12, 2.6, SZ], rps: 3, rampSpin: true };
actions.bCoolant = { type: "flow", _說明: "冷卻水從噴嘴噴到刀口、往後甩開", layer: "bSaw", path: [[BXc - 10.4, 3.2, SZ], [BXc - 11.0, 1.6, SZ], [BXc - 12.6, 1.5, SZ]], n: 10, size: 0.07, shape: "dot", rate: 0.9, color: "heC", track: false, free: true, jitter: 0.12 };
// 切口亮線：跟著刀一段段長出（8 段）；被頂出那顆另一個方向的切口（之前已切好的十字切痕）
for (let k = 0; k < 8; k++) { LAY(`bKerf${k}`, [2.2, 0.1, R2(BXc - 7.7 + k * 2.2), 1.43]); BOX(`bKerfL${k}`, `bKerf${k}`, R2(BXc - 8.8 + k * 2.2), R2(BXc - 6.6 + k * 2.2), 1.43, 1.46, R2(SZ - 0.07), R2(SZ + 0.07), "edge"); }
LAY("bCross", [2.4, 0.1, BXc + BPK[0], 1.44]); [[-1, 0], [1, 0]].forEach(([sx], i) => BOX(`bCrossX${i}`, "bCross", R2(BXc + BPK[0] + sx * 1.0 - 0.06), R2(BXc + BPK[0] + sx * 1.0 + 0.06), 1.43, 1.46, R2(BPK[1] - 1.0), R2(BPK[1] + 1.0), "edge"));
BOX("bCrossZ", "bCross", R2(BXc + BPK[0] - 1.0), R2(BXc + BPK[0] + 1.0), 1.43, 1.46, R2(BPK[1] + 0.94), R2(BPK[1] + 1.06), "edge");
// 頂針（從膠膜下往上頂）＋吸嘴（從上面下來吸住）
LAY("bEject", [0.6, 1.2, BXc + BPK[0], 0.6]); VC("bNeedle", "bEject", 0.07, 0.2, 1.0, "steel2", { x: BXc + BPK[0], z: BPK[1] }); VC("bNeedleBase", "bEject", 0.3, 0.1, 0.25, "dark", { x: BXc + BPK[0], z: BPK[1] });
LAY("bCollet", [1.4, 4, BXc + BPK[0], 4.5]); VC("bColTip", "bCollet", 0.55, 1.55, 1.75, "rubber", { x: BXc + BPK[0], z: BPK[1] }); VC("bColBody", "bCollet", 0.35, 1.75, 4.4, "steel2", { x: BXc + BPK[0], z: BPK[1] });
BOX("bColHead", "bCollet", BXc + BPK[0] - 0.7, BXc + BPK[0] + 0.7, 4.4, 5.3, BPK[1] - 0.7, BPK[1] + 0.7, "dark"); PIPE("bColVac", "bCollet", [[BXc + BPK[0] + 0.7, 5.0, BPK[1]], [BXc + BPK[0] + 2.0, 5.0, BPK[1]], [BXc + BPK[0] + 2.0, 6.4, BPK[1]]], 0.1, "rubber");

// ═════ 站 C：晶片底面（扇入）：焊墊密、錫球放不下 ═════
const CXc = 72; BACKDROP("cBack", 60, 84, 9.0); PLINTH("cPl", 60, 84, 8);
const CD = 9.0; LAY("cDie", [CD, 0.8, CXc, 1.4]); BOX("cDieB", "cDie", CXc - CD / 2, CXc + CD / 2, 1.0, 1.8, -CD / 2, CD / 2, "si"); BOX("cPass", "cDie", CXc - CD / 2 + 0.1, CXc + CD / 2 - 0.1, 1.8, 1.84, -CD / 2 + 0.1, CD / 2 - 0.1, "dieTop");
const CP = [-3.6, -2.4, -1.2, 0, 1.2, 2.4, 3.6]; P({ id: "cPad", layer: "cDie", shape: "cyl", size: [0.32, 0.04], rot: V, pos: [CXc, 1.86, 0], at: GRID(CP, CP), mat: "pad" });
const CP2 = [-3.0, -1.8, -0.6, 0.6, 1.8, 3.0]; P({ id: "cPadS", layer: "cDie", shape: "cyl", size: [0.14, 0.04], rot: V, pos: [CXc, 1.86, 0], at: GRID(CP2, CP2), mat: "pad" }); // 接點越來越多：焊墊之間又多一排小焊墊
LAY("cEdge", [CD, 0.1, CXc, 1.9]); const ce = CD / 2, cw = 0.08; // 晶片邊界黃框（扇入：錫球只能放在框內）
BOX("cEdgeN", "cEdge", CXc - ce, CXc + ce, 1.86, 1.94, -ce - cw, -ce + cw, "bracket"); BOX("cEdgeS", "cEdge", CXc - ce, CXc + ce, 1.86, 1.94, ce - cw, ce + cw, "bracket");
BOX("cEdgeW", "cEdge", CXc - ce - cw, CXc - ce + cw, 1.86, 1.94, -ce, ce, "bracket"); BOX("cEdgeE", "cEdge", CXc + ce - cw, CXc + ce + cw, 1.86, 1.94, -ce, ce, "bracket");
for (let r = 0; r < 7; r++) { LAY(`cRow${r}`, [CD, 1, CXc, 2.2]); P({ id: `cBall${r}`, layer: `cRow${r}`, shape: "sphere", size: [0.52], pos: [CXc, 2.36, CP[r]], at: CP.map((x) => [x, 0, 0]), mat: "solder" }); }
LAY("cExtra", [CD, 1, CXc, 2.9]); P({ id: "cExtraB", layer: "cExtra", shape: "sphere", size: [0.52], pos: [CXc, 2.9, 4.55], at: [-3.0, -1.8, -0.6, 0.6, 1.8, 3.0].map((x) => [x, 0, 0]), mat: "red" }); // 想再塞一排：壓在最外排與晶片邊上，放不下 // 放不下的錫球（紅）

// ═════ 站 D：重組晶圓（玻璃載盤＋膠帶 → 取放晶片 → 點膠模封 → 上模壓下）═════
const DXc = 108; BACKDROP("dBack", 94, 122, 11.0); PLINTH("dPl", 94, 122, 9);
LAY("dCarrier", [18, 0.6, DXc, 1.3]); VC("dGlass", "dCarrier", 9.0, 1.0, 1.4, "carrier", { x: DXc }); VT("dGlassE", "dCarrier", 9.0, 8.88, 1.38, 1.42, "edge", { x: DXc }); VC("dTape", "dCarrier", 8.8, 1.4, 1.46, "tape", { x: DXc });
P({ id: "dFid", layer: "dCarrier", shape: "cyl", size: [0.25, 0.02], rot: V, pos: [DXc, 1.47, 0], at: [[-7.6, 0, 0], [7.6, 0, 0], [0, 0, -7.6], [0, 0, 7.6]], mat: "markC" in palette ? "mark" : "dark" });
const DDP = 3.6, DDW = 2.2, DR = [-1.5, -0.5, 0.5, 1.5].map((k) => R2(k * DDP));
// 載盤上已排好 14 顆，最後兩顆（前排右邊兩格）由取放頭一顆一顆放
DR.forEach((z, r) => { const xs = r === 3 ? DR.slice(0, 2) : DR; LAY(`dRow${r}`, [14, 0.6, DXc, 1.8]); P({ id: `dDie${r}`, layer: `dRow${r}`, shape: "box", size: [DDW, 0.5, DDW], pos: [DXc, 1.71, z], at: xs.map((x) => [x, 0, 0]), mat: "si" }); P({ id: `dDieT${r}`, layer: `dRow${r}`, shape: "box", size: [DDW, 0.03, DDW], pos: [DXc, 1.975, z], at: xs.map((x) => [x, 0, 0]), mat: "dieTop" }); });
// 晶片盤（已切好、挑出的好晶片）：放在載盤左前方台面
const TRX = DXc - 9.0, TRZ = 7.6; LAY("dTray", [5, 0.6, TRX, 1.2]); BOX("dTrayB", "dTray", TRX - 2.4, TRX + 2.4, 1.0, 1.25, TRZ - 1.6, TRZ + 1.6, "dark"); BOX("dTrayRim", "dTray", TRX - 2.5, TRX + 2.5, 1.25, 1.32, TRZ - 1.7, TRZ + 1.7, "steel2");
P({ id: "dTrayDie", layer: "dTray", shape: "box", size: [DDW, 0.5, DDW], pos: [TRX + 1.2, 1.5, TRZ], mat: "si" }); // 盤裡還剩的一顆
// 兩顆被搬的晶片：起點在晶片盤左格，搬到載盤前排右邊兩格（DR[2]、DR[3]）
[0, 1].forEach((k) => { LAY(`dCarry${k}`, [DDW, 0.5, TRX - 1.2, 1.5]); P({ id: `dCarryD${k}`, layer: `dCarry${k}`, shape: "box", size: [DDW, 0.5, DDW], pos: [TRX - 1.2, 1.5, TRZ], mat: "si" }); P({ id: `dCarryT${k}`, layer: `dCarry${k}`, shape: "box", size: [DDW, 0.03, DDW], pos: [TRX - 1.2, 1.765, TRZ], mat: "dieTop" }); });
// 龍門：兩根立柱＋X 導軌（後方）＋X 滑座帶一根往前伸的 Y 橫樑＋Y 滑座帶 Z 軸與吸嘴
LAY("dGantry", [24, 10, DXc, 6]); BOX("dRail", "dGantry", DXc - 11, DXc + 11, 8.6, 9.0, -7.6, -7.2, "steel2"); BOX("dRailB", "dGantry", DXc - 11, DXc + 11, 8.4, 8.6, -7.7, -7.1, "dark");
[-11, 11].forEach((x, i) => { BOX(`dPost${i}`, "dGantry", DXc + x - 0.4, DXc + x + 0.4, 1.0, 9.0, -7.8, -7.0, "panel"); BOX(`dPostFoot${i}`, "dGantry", DXc + x - 0.8, DXc + x + 0.8, 1.0, 1.2, -8.2, -6.6, "steel"); });
BOX("dBelt", "dGantry", DXc - 10.5, DXc + 10.5, 9.0, 9.08, -7.5, -7.3, "rubber");
const HX0 = DXc + 9.6, HZ0 = -4.0; // 待命位置：右後方
LAY("dHeadX", [2, 2, HX0, 8.4]); BOX("dCarr", "dHeadX", HX0 - 1.0, HX0 + 1.0, 8.2, 9.2, -8.0, -6.8, "dark"); BOX("dYBeam", "dHeadX", HX0 - 0.35, HX0 + 0.35, 7.6, 8.2, -7.4, 9.0, "steel2"); BOX("dYRail", "dHeadX", HX0 - 0.15, HX0 + 0.15, 7.5, 7.6, -7.0, 8.8, "dark");
LAY("dHead", [2, 6, HX0, 5.0]); BOX("dYCarr", "dHead", HX0 - 0.6, HX0 + 0.6, 6.9, 7.5, HZ0 - 0.6, HZ0 + 0.6, "dark"); BOX("dZ", "dHead", HX0 - 0.3, HX0 + 0.3, 3.4, 6.9, HZ0 - 0.3, HZ0 + 0.3, "steel2");
VC("dNozzle", "dHead", 0.22, 2.4, 3.4, "steel", { x: HX0, z: HZ0 }); VC("dTip", "dHead", 0.32, 2.25, 2.4, "rubber", { x: HX0, z: HZ0 }); BOX("dCam", "dHead", HX0 + 0.35, HX0 + 1.05, 3.4, 4.2, HZ0 - 0.35, HZ0 + 0.35, "dark"); VC("dCamL", "dHead", 0.2, 3.3, 3.4, "screen", { x: HX0 + 0.7, z: HZ0 });
P({ id: "dZScrew", layer: "dHead", shape: "cyl", size: [0.07, 0.05], pos: [HX0, 5.2, R2(HZ0 + 0.32)], at: [[0, -1, 0], [0, 0, 0], [0, 1, 0]], mat: "steel" });
// 點膠：支架（立柱＋懸臂）＋點膠頭＋針頭
LAY("dDisp", [2, 6, DXc, 6.5]); VC("dDispN", "dDisp", 0.35, 3.2, 6.4, "steel2", { x: DXc }); VC("dDispT", "dDisp", 0.18, 2.9, 3.2, "dark", { x: DXc }); BOX("dDispB", "dDisp", DXc - 1.0, DXc + 1.0, 6.4, 8.0, -1.0, 1.0, "panel");
BOX("dDispArm", "dDisp", DXc - 0.3, DXc + 0.3, 7.2, 7.6, -7.0, -1.0, "steel"); BOX("dDispPost", "dDisp", DXc - 0.4, DXc + 0.4, 1.0, 7.6, -7.4, -6.6, "steel2");
// 模封料：中心一坨先厚，往外攤開的每一圈較薄、邊緣圓鈍（外緣一圈較暗的唇邊）
const MR = [0, 2.2, 4.4, 6.6, 8.8], MT = [2.75, 2.55, 2.4, 2.3];
for (let k = 0; k < 4; k++) { LAY(`dMold${k}`, [R2(MR[k + 1] * 2), 0.9, DXc, 1.9]); if (k === 0) VC(`dMoldR${k}`, `dMold${k}`, MR[1], 1.46, MT[0], "mold", { x: DXc }); else VT(`dMoldR${k}`, `dMold${k}`, MR[k + 1], MR[k], 1.46, MT[k], "mold", { x: DXc });
  VT(`dMoldLip${k}`, `dMold${k}`, R2(MR[k + 1] + 0.12), R2(MR[k + 1] - 0.15), R2(MT[k] - 0.25), R2(MT[k] - 0.02), "moldE", { x: DXc }); }
actions.dPour = { type: "flow", _說明: "模封料從點膠嘴往下流（稠液體，連續料柱）", layer: "dDisp", path: [[DXc, 2.9, 0], [DXc, 2.75, 0]], n: 8, size: 0.2, shape: "liquid", rate: 0.3, color: "moldC", track: false, free: false, jitter: 0.0 };
LAY("dChase", [19, 1.6, DXc, 6]); VC("dChaseP", "dChase", 9.3, 5.2, 6.0, "steel2", { x: DXc }); VT("dChaseR", "dChase", 9.4, 9.0, 4.6, 5.2, "steel", { x: DXc }); VC("dHeatLamp", "dChase", 0.25, 6.0, 6.2, "lampY", { x: DXc + 7.5 }); BOX("dChaseBar", "dChase", DXc - 1.0, DXc + 1.0, 6.0, 9.5, -1.0, 1.0, "steel");
actions.dHeat = { type: "pulse", _說明: "上模加熱（模封料固化）", parts: ["dChaseP", "dHeatLamp"], color: "amberC", glow: 0.7, freq: 1.2, halo: 0 };

// ═════ 站 E：扇出型封裝剖面＋爆炸分解（s6）═════
const EXc = 144; BACKDROP("eBack", 130, 158, 11.0); PLINTH("ePl", 130, 158, 8);
const eFo = foPkg("e", EXc, 1.0, { W: 14, dieW: 5, up: true }); // 製作方向：重佈線面朝上
// 重佈線分三段長出（晶片下→跨出晶片邊→到外圍焊墊）：把 eRdl 的銅線依「離晶片中心遠近」拆到三層
{ const tr = parts.filter((q) => q.layer === "eRdl" && /^eT\d+b$/.test(q.id)); tr.forEach((q) => { q.layer = "eRdlOut"; }); LAY("eRdlOut", [14, 0.3, EXc, 2.3]); }
// 錫球（eBall）在 s6 最後才落到外圍焊墊（genscript：fallIn）
actions.eCuGrow = { type: "flow", _說明: "銅沿介電層表面一路沉積出去（從晶片焊墊往外圍）", layer: "eRdl", path: [[EXc - 1.5, 2.64, -2.0], [EXc - 4.5, 2.64, -2.0]], n: 6, lanes: 3, laneDir: [0, 0, 1], laneGap: 1.2, size: 0.1, shape: "dot", rate: 0.6, color: "cuC", track: true, free: false };
actions.eCuGrow2 = { type: "flow", layer: "eRdl", path: [[EXc + 1.5, 2.64, -2.0], [EXc + 4.5, 2.64, -2.0]], n: 6, lanes: 3, laneDir: [0, 0, 1], laneGap: 1.2, size: 0.1, shape: "dot", rate: 0.6, color: "cuC", track: true, free: false };
LAY("eFoot", [14, 0.1, EXc, 1.95]); // 晶片範圍虛框 BOX("eFootL", "eFoot", EXc - 2.5, EXc - 2.45, 1.0, 4.6, 0.02, 0.06, "bracket"); BOX("eFootR", "eFoot", EXc + 2.45, EXc + 2.5, 1.0, 4.6, 0.02, 0.06, "bracket"); // 晶片範圍（黃虛框）

// ═════ 站 F：翹曲與晶片偏移（重組晶圓，同心環分段）═════
const FXc = 180; BACKDROP("fBack", 166, 194, 10.0); PLINTH("fPl", 166, 194, 9);
// 重組晶圓：10 圈同心環（每圈高差小，翹起來接近連續彎曲）；晶片照中心點所在的圈，整顆跟著那一圈抬高
const FR = Array.from({ length: 11 }, (_, k) => R2(k * 0.96)), FY = [1.0, 1.7], NR = 10;
const FDIES = []; for (let i = -3; i <= 3; i++) for (let j = -3; j <= 3; j++) { const x = i * 2.6, z = j * 2.6, r = Math.hypot(x, z); if (r < 8.4) FDIES.push([x, z, r]); }
const FSH = [2.6, 5.2]; // 被推歪的那顆（前右）
for (let k = 0; k < NR; k++) { LAY(`fR${k}`, [R2(FR[k + 1] * 2), 1, FXc, 1.35]); if (k === 0) VC(`fRing${k}`, `fR${k}`, FR[1], FY[0], FY[1], "mold", { x: FXc }); else VT(`fRing${k}`, `fR${k}`, FR[k + 1], FR[k], FY[0], FY[1], "mold", { x: FXc });
  const dies = FDIES.filter(([x, z, r]) => r >= FR[k] && r < FR[k + 1] && !(x === FSH[0] && z === FSH[1])).map(([x, z]) => [x, 0, z]);
  if (dies.length) P({ id: `fDie${k}`, layer: `fR${k}`, shape: "box", size: [1.6, 0.05, 1.6], pos: [FXc, 1.72, 0], at: dies, mat: "dieTop" }); }
VT("fEdgeRing", `fR${NR - 1}`, 9.62, 9.5, 1.68, 1.74, "edge", { x: FXc });
LAY("fFlat", [20, 0.1, FXc, 1.7]); BOX("fFlatL", "fFlat", FXc - 10, FXc + 10, 1.69, 1.73, 9.6, 9.66, "bracket"); // 原本平的參考線
const FSR = Math.hypot(FSH[0], FSH[1]), FSK = Math.min(NR - 1, Math.floor(FSR / 0.96)); // 那顆所在的圈
LAY("fShift", [2, 0.6, FXc + FSH[0], 1.8]); BOX("fShDie", "fShift", FXc + FSH[0] - 0.8, FXc + FSH[0] + 0.8, 1.7, 1.78, FSH[1] - 0.8, FSH[1] + 0.8, "dieTop");
LAY("fGhost", [2, 0.1, FXc + FSH[0], 1.8]); [[-0.8, 0], [0.8, 0]].forEach(([dx], i) => BOX(`fGhX${i}`, "fGhost", R2(FXc + FSH[0] + dx - 0.04), R2(FXc + FSH[0] + dx + 0.04), 1.78, 1.81, FSH[1] - 0.8, FSH[1] + 0.8, "bracket"));
[[-0.8], [0.8]].forEach(([dz], i) => BOX(`fGhZ${i}`, "fGhost", FXc + FSH[0] - 0.8, FXc + FSH[0] + 0.8, 1.78, 1.81, R2(FSH[1] + dz - 0.04), R2(FSH[1] + dz + 0.04), "bracket")); // 原位虛框（黃）
LAY("fArrow", [2, 0.4, FXc + FSH[0] + 1.2, 2.2]); P({ id: "fArS", layer: "fArrow", shape: "box", size: [1.3, 0.14, 0.14], pos: [FXc + FSH[0] + 0.9, 2.2, FSH[1]], mat: "bracket" }); P({ id: "fArH", layer: "fArrow", shape: "cone", size: [0.01, 0.34, 0.5], rot: [0, 90, 0], pos: [FXc + FSH[0] + 1.8, 2.2, FSH[1]], mat: "bracket" });
// 對不準：重佈線照原位做的導通孔（銅）落在原位，晶片焊墊已經跑掉 → 紅叉
LAY("fMiss", [2, 0.5, FXc + FSH[0], 2.0]); P({ id: "fViaGhost", layer: "fMiss", shape: "cyl", size: [0.32, 0.1], rot: V, pos: [FXc + FSH[0] - 0.4, 1.86, FSH[1]], mat: "cu" });
BOX("fMiss1", "fMiss", FXc + FSH[0] - 0.95, FXc + FSH[0] + 0.15, 2.0, 2.1, FSH[1] - 0.05, FSH[1] + 0.05, "red", { rot: [0, 45, 0] }); BOX("fMiss2", "fMiss", FXc + FSH[0] - 0.95, FXc + FSH[0] + 0.15, 2.0, 2.1, FSH[1] - 0.05, FSH[1] + 0.05, "red", { rot: [0, -45, 0] });
actions.fHot = { type: "pulse", _說明: "加熱固化（整片發熱）→冷卻後翹", parts: Array.from({ length: NR }, (_, k) => `fRing${k}`), color: "amberC", glow: 0.55, freq: 1.0, halo: 0 };
actions.fFlow = { type: "flow", _說明: "模封料流動，把晶片往外推", layer: `fR${FSK}`, path: [[FXc + FSH[0] - 1.6, 1.76, FSH[1]], [FXc + FSH[0], 1.76, FSH[1]], [FXc + FSH[0] + 1.6, 1.76, FSH[1]]], n: 6, lanes: 2, laneDir: [0, 0, 1], laneGap: 0.9, size: 0.14, shape: "liquid", rate: 0.25, color: "moldEC", track: false, free: true, jitter: 0.05 };

// ═════ 站 G：公司（台積電整合扇出型 InFO-PoP；力成方形面板）═════
const GXc = 216; BACKDROP("gBack", 200, 232, 11.0, -6.4); PLINTH("gPl", 200, 232, 8);
const SIGNS = [["tsmc", "logo:tsmc"], ["ptc", "text:ptc=力成|6239"]];
{ const r = spawnSync("node", [path.join(HERE, "..", "..", "scripts", "three", "make-brand-tex.mjs"), "tech-fanout", "flag:TW", ...SIGNS.map(([, a]) => a)], { encoding: "utf8" }); if (r.status !== 0) { console.error(r.stderr); process.exit(1); } }
const SIGNM = JSON.parse(fs.readFileSync(path.join(HERE, "..", "..", "public", "tex", "brand", "meta.json"), "utf8"));
materials.f_TW = { kind: "unlit", color: "#FFFFFF", img: "tex/brand/flag-TW.png" };
SIGNS.forEach(([id]) => { materials[`t_${id}`] = { kind: "unlit", color: "#FFFFFF", img: `tex/brand/sign-${id}.png` }; });
const GK = [GXc - 8, GXc + 8];
["gA", "gB"].forEach((id, i) => { const x = GK[i]; LAY(id, [12, 9, x, 4.5]);
  BOX(`${id}Ped`, id, x - 5.5, x + 5.5, 1.0, 2.2, -5.0, 3.0, "panel"); BOX(`${id}PedT`, id, x - 5.6, x + 5.6, 2.2, 2.3, -5.1, 3.1, "steel2");
  const sg = SIGNM[`sign-${SIGNS[i][0]}`], sw = Math.min(6.0, R2(1.15 * sg.aspect)); P({ id: `${id}Sign`, layer: id, shape: "plane", size: [sw, R2(sw / sg.aspect)], pos: [x, 1.62, 3.12], uv01: true, shadow: false, mat: `t_${SIGNS[i][0]}` });
  const fg = SIGNM["flag-TW"]; const px = i === 0 ? -5.0 : 5.0; VC(`${id}Pole`, id, 0.08, 2.3, 9.0, "steel2", { x: R2(x + px), z: -4.4 }); P({ id: `${id}Flag`, layer: id, shape: "plane", size: [2.4, R2(2.4 / fg.aspect)], pos: [R2(x + px + (i === 0 ? 1.25 : -1.25)), 8.1, -4.4], uv01: true, shadow: false, mat: "f_TW" }); SPH(`${id}PoleTop`, id, 0.16, R2(x + px), 9.05, -4.4, "gold"); });
// 台積電：InFO-PoP（處理器扇出封裝＋穿模銅柱＋疊在上面的記憶體封裝），整顆（不剖）
foPkg("gI", GK[0], 2.3, { half: false, W: 9, dieW: 4, tiv: true });
LAY("gMem", [9, 2, GK[0], 6.4]); P({ id: "gMemBall", layer: "gMem", shape: "sphere", size: [0.3], pos: [GK[0], 5.5, 0], at: GRID([-3.8, -3.1, 3.1, 3.8], [-3, -1.5, 0, 1.5, 3]), mat: "solder" });
BOX("gMemSub", "gMem", GK[0] - 4.5, GK[0] + 4.5, 5.8, 6.3, -4.5, 4.5, "sub"); BOX("gMemMold", "gMem", GK[0] - 4.5, GK[0] + 4.5, 6.3, 7.4, -4.5, 4.5, "mold"); BOX("gMemMark", "gMem", GK[0] - 2.4, GK[0] + 2.4, 7.4, 7.42, -1.6, 1.6, "moldE");
// 力成：方形面板（大量晶片陣列）＋旁邊一片圓晶圓對照
const GPX = GK[1] - 1.6, GPH = 3.3; LAY("gPanel", [7, 0.6, GPX, 2.6]); BOX("gPanelB", "gPanel", GPX - GPH, GPX + GPH, 2.3, 2.8, -GPH, GPH, "mold"); BOX("gPanelO", "gPanel", GPX - GPH, GPX + GPH, 2.76, 2.81, GPH, R2(GPH + 0.04), "edge");
P({ id: "gPanelDie", layer: "gPanel", shape: "box", size: [0.56, 0.04, 0.56], pos: [GPX, 2.82, 0], at: GRID([-2.8, -2.1, -1.4, -0.7, 0, 0.7, 1.4, 2.1, 2.8], [-2.8, -2.1, -1.4, -0.7, 0, 0.7, 1.4, 2.1, 2.8]), mat: "dieTop" });
const GWR = R2(GPH * 2 * 0.58 / 2); LAY("gRound", [4, 0.4, GK[1] + 3.6, 2.6]); VC("gRoundW", "gRound", GWR, 2.3, 2.8, "mold", { x: GK[1] + 3.6, z: 0 }); VT("gRoundE", "gRound", GWR, R2(GWR - 0.06), 2.78, 2.82, "edge", { x: GK[1] + 3.6, z: 0 });
P({ id: "gRoundDie", layer: "gRound", shape: "box", size: [0.56, 0.04, 0.56], pos: [GK[1] + 3.6, 2.82, 0], at: GRID([-1.4, -0.7, 0, 0.7, 1.4], [-1.4, -0.7, 0, 0.7, 1.4]).filter(([x, , z]) => Math.hypot(Math.abs(x) + 0.3, Math.abs(z) + 0.3) < GWR), mat: "dieTop" }); // 圓晶圓（直徑約方形面板邊長 0.58 倍，面積約 1：3.7）
actions.gAHot = { type: "pulse", _說明: "念到台積電時台面亮一下", parts: ["gAPedT"], color: "amberC", glow: 0.9, freq: 1.6, halo: 0 }; actions.gBHot = { type: "pulse", parts: ["gBPedT"], color: "amberC", glow: 0.9, freq: 1.6, halo: 0 };

// ═════ 站 H：多晶片扇出封裝＋下一集設備剪影 ═════
const HXc = 252; BACKDROP("hBack", 238, 266, 11.0); PLINTH("hPl", 238, 266, 8);
LAY("hPkg", [14, 2, HXc - 4, 2]); BOX("hPkgMold", "hPkg", HXc - 11, HXc + 3, 1.0, 2.4, -4, 4, "mold"); BOX("hPkgRdl", "hPkg", HXc - 11, HXc + 3, 0.95, 1.05, -4, 4, "piD");
[[-8, 3.0], [-4, 3.0], [0.2, 2.4]].forEach(([dx, w], i) => BOX(`hDie${i}`, "hPkg", R2(HXc + dx - w / 2), R2(HXc + dx + w / 2), 2.38, 2.44, -2.6, 2.6, "dieTop"));
P({ id: "hLink", layer: "hPkg", shape: "box", size: [1.2, 0.03, 0.12], pos: [HXc, 2.45, 0], at: [[-6.0, 0, -1.5], [-6.0, 0, 0], [-6.0, 0, 1.5], [-1.9, 0, -1.2], [-1.9, 0, 0], [-1.9, 0, 1.2]], mat: "cu" });
LAY("hTool", [10, 9, HXc + 9, 5]); BOX("hToolB", "hTool", HXc + 5, HXc + 13, 1.2, 8.6, -4, 2.5, "panel"); BOX("hToolKick", "hTool", HXc + 5, HXc + 13, 1.0, 1.2, -4, 2.45, "dark");
BOX("hToolWin", "hTool", HXc + 5.6, HXc + 12.4, 4.6, 7.8, 2.5, 2.56, "window"); BOX("hToolWinF", "hTool", HXc + 5.5, HXc + 12.5, 4.5, 7.9, 2.48, 2.52, "steel2");
BOX("hToolScr", "hTool", HXc + 5.6, HXc + 7.6, 2.4, 3.8, 2.5, 2.58, "screen"); BOX("hToolPlate", "hTool", HXc + 10.4, HXc + 12.4, 3.6, 4.1, 2.5, 2.56, "warnY"); // 觸控螢幕、銘牌
P({ id: "hToolSeam", layer: "hTool", shape: "box", size: [0.05, 3.2, 0.04], pos: [HXc + 9, 2.8, 2.53], mat: "seam" }); BOX("hToolSeamH", "hTool", HXc + 5, HXc + 13, 4.3, 4.35, 2.5, 2.54, "seam");
P({ id: "hToolScrew", layer: "hTool", shape: "cyl", size: [0.07, 0.05], pos: [HXc + 9, 0, 2.55], at: [[-3.8, 1.5, 0], [3.8, 1.5, 0], [-3.8, 4.1, 0], [3.8, 4.1, 0], [-3.8, 8.3, 0], [3.8, 8.3, 0]], mat: "steel" });
BOX("hToolHandle1", "hTool", HXc + 8.5, HXc + 8.65, 2.0, 3.6, 2.55, 2.75, "steel2"); BOX("hToolHandle2", "hTool", HXc + 9.35, HXc + 9.5, 2.0, 3.6, 2.55, 2.75, "steel2");
P({ id: "hToolVent", layer: "hTool", shape: "box", size: [1.6, 0.06, 0.04], pos: [HXc + 11.4, 1.6, 2.53], at: [0, 1, 2, 3].map((k) => [0, R2(k * 0.22), 0]), mat: "dark" });
BOX("hToolTop", "hTool", HXc + 4.9, HXc + 13.1, 8.6, 8.9, -4.1, 2.6, "steel2");
VC("hTowerPole", "hTool", 0.08, 8.9, 9.6, "steel", { x: HXc + 12.4, z: 1.6 }); [["lampG", 9.6], ["lampY", 9.85], ["lampR", 10.1]].forEach(([m, y], i) => VC(`hTower${i}`, "hTool", 0.18, y, R2(y + 0.24), m, { x: HXc + 12.4, z: 1.6 }));
BOX("hLoadPort", "hTool", HXc + 5.2, HXc + 7.8, 4.0, 4.3, 2.5, 4.0, "steel2"); BOX("hLoadBox", "hTool", HXc + 5.5, HXc + 7.5, 4.3, 5.8, 2.7, 3.8, "panel2"); BOX("hLoadDoor", "hTool", HXc + 5.5, HXc + 7.5, 4.4, 5.7, 3.8, 3.86, "seam"); // 裝載埠＋料盒
BOX("hToolHead", "hTool", HXc + 8.6, HXc + 10.2, 6.0, 7.2, -0.5, 1.0, "steel"); VC("hToolNoz", "hTool", 0.2, 5.0, 6.0, "steel2", { x: HXc + 9.4, z: 0.25 }); BOX("hToolRail", "hTool", HXc + 5.8, HXc + 12.2, 7.2, 7.5, 0.0, 0.5, "dark"); // 窗內：取放頭與導軌

actions.cEdgeGlow = { type: "pulse", _說明: "晶片邊界框閃一下（錫球只能放在框內）", parts: ["cEdgeN", "cEdgeS", "cEdgeW", "cEdgeE"], color: "yellowBr", glow: 0.9, freq: 1.4, halo: 0 };
actions.hLamp = { type: "pulse", _說明: "設備燈塔綠燈閃", parts: ["hTower0"], color: "lampG", glow: 0.9, freq: 1.0, halo: 0 };
// ═════ 標註點 ═════
Object.assign(anchors, {
  aSubA: A("aFlip", [AX0 - 12, 2.3, 0], -170, -170), aBumpA: A("aFlip", [AX0 - 9.6, 3.4, 0], -150, -110), aFoA: A("aFoDie", [AX0 + 11.5, 3.2, 0], 150, -110), aRdlA: A("aFoRdl", [AX0 + 12, 2.3, 0], 170, -170),
  bWaferA: A("bWafer", [BXc - 4, 1.45, 3], -150, -100), bPickA: A("bPick", [BXc + BPK[0], 1.6, BPK[1]], 150, -110), bSawA: A("bSaw", [BXc - 12, 2.6, SZ + 0.1], -150, -100), bColA: A("bCollet", [BXc + BPK[0], 3.4, BPK[1]], 150, -110),
  cPadA: A("cDie", [CXc + 3.6, 1.88, 3.6], 150, 110), cBallA: A("cRow0", [CXc - 3.6, 2.6, -3.6], -150, -110), cExtraA: A("cExtra", [CXc + 3.0, 3.1, 4.55], 150, -110), cEdgeA: A("cEdge", [CXc - CD / 2, 1.9, CD / 2], -150, 110),
  dCarA: A("dCarrier", [DXc - 7, 1.4, 6], -150, 110), dHeadA: A("dHead", [HX0, 3.0, HZ0], -150, -100), dMoldA: A("dMold0", [DXc + 1.2, 2.75, 1.2], 150, -100), dChaseA: A("dChase", [DXc + 6, 5.6, 4], 150, -100),
  eBallA: A("eBall", [EXc + 4.5, 3.5, -0.5], 150, -110), eRdlA: A("eRdlOut", [EXc + 4.5, 2.62, -0.5], 150, -60), ePi1A: A("ePi1", [EXc - 6, 2.4, 0], -150, -80), eDieA: A("eDie", [EXc, 1.9, 0], -150, 110), ePi2A: A("ePi2", [EXc - 6, 2.9, 0], -150, -100),
  fWarpA: A(`fR${NR - 1}`, [FXc - 9.2, 1.7, 2], -150, -110), fShiftA: A("fShift", [FXc + FSH[0], 1.78, FSH[1]], 150, -100), fMissA: A("fMiss", [FXc + FSH[0] - 0.4, 1.9, FSH[1]], -150, -120),
  gInfoA: A("gIDie", [GK[0] + 4.5, 3.8, 4.5], -150, -110), gMemA: A("gMem", [GK[0] + 4.5, 7.0, 4.5], 150, -100), gPanelA: A("gPanel", [GPX - GPH, 2.8, GPH], -150, -100),
  hPkgA: A("hPkg", [HXc - 4, 2.4, 4], -150, -110), hToolA: A("hTool", [HXc + 9, 8.6, 2.5], 150, -100),
});
const model = {
  name: "示意 扇出型與晶圓級封裝：覆晶 vs 扇出型對照、晶圓級封裝晶圓與切割、晶片底面扇入、重組晶圓取放與模封、扇出型封裝剖面爆炸、翹曲與晶片偏移、公司、多晶片封裝（示意，非特定產品）",
  unit: "示意（1＝1 mm，封裝放大）", size: { w: 40, h: 18, r: 0.6, t: 30 }, palette, materials, partNames: { aFoDie: "扇出型封裝", aFlip: "覆晶封裝" },
  layers, parts, anchors, actions,
  pose: { yaw0: 0, yawIso: 0, drift: 0 }, camera: { stand: { d: 70, elev: 24, y: 4 } },
  fx: { dpr: 1, srcPx: 30, shadows: 0, fog: false, dust: false, vaporSprites: false, shimmer: false },
  info: { NR, FSK, FSH, FSR, FR, AX0, BXc, CXc, DXc, EXc, FXc, GXc, HXc, GK, DR, HX0, HZ0, TRX, TRZ, SZ, BPK, DDW },
};
fs.writeFileSync(path.join(HERE, "model.json"), JSON.stringify(model, null, 1) + "\n");
console.log(`✔ model.json：${parts.length} 個零件、${parts.reduce((a, p) => a + Math.max(1, (p.at?.length ?? 0)), 0)} 個實體、${layers.length} 層、${Object.keys(actions).length} 個動作`);

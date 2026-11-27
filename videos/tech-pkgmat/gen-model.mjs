// node videos/tech-pkgmat/gen-model.mjs → 寫 videos/tech-pkgmat/model.json
// 2026/11/27 tech-pkgmat（封裝材料，系列 3 第 3 集）。構造與物理照 physics-spec.md、模組清單照 visual-spec.md。全部放大示意，非特定廠牌／型號。
// 站點（地板頂面 y＝0）：L 導線架單元（x 0）｜P 沖壓機與蝕刻線（x 30）｜M 轉移成型模具剖面＋料餅與填料放大（x 60）｜Q 封好的封裝（爆炸分解，x 90）
//   B 植球台與焊到電路板（x 120）｜T 錫點熱循環剖面（x 150）｜U 底部填充剖面（x 170）｜V 供應商展示台（x 195）｜F 覆晶預告（x 220）
import fs from "node:fs";
import path from "node:path";
const HERE = path.dirname(new URL(import.meta.url).pathname);
const R2 = (x) => Math.round(x * 1000) / 1000;
const D2R = Math.PI / 180;
let seed = 20261224;
const rnd = () => { seed |= 0; seed = (seed + 0x6d2b79f5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
const palette = {
  floorC: "#C9D2DE", panel: "#F3F5F8", panel2: "#E2E8F0", seam: "#8E9BB0", band: "#24324C", steel: "#7D8CA6", steel2: "#A9B5C7", dark: "#3E4A60", darker: "#2A3142",
  lampY: "#F2B632", lampG: "#2FBF71", lampR: "#E5484D", screen: "#5B8DEF", rubber: "#2B2F36", gold: "#C9A24A", estop: "#D93A2B", warnY: "#F2B632",
  cuC: "#C8794A", cuHi: "#E39A68", agC: "#E6EAF0", chipC: "#4C5568", chipTop: "#6B7690", padGold: "#E0B84E", wireC: "#E8C45A", resistC: "#3C6FD8",
  emcC: "#1B1D22", emcSoftC: "#4A3528", emcHot: "#E5602B", siO2: "#F4F6FA", resinC: "#2A2420", heatC: "#E5484D", fluxC: "#F3E7B0",
  solderC: "#B9C0CA", solderHi: "#E6EBF2", pcbC: "#1E6B4E", pcbD: "#16523B", subC: "#2F5D4A", capC: "#C8A46A", ufC: "#E8A33A", crackC: "#E0472F",
  waterC: "#6FB6E8", pebbleC: "#8A7F72", okC: "#14A38B", pinkC: "#E8A0B8", whiteP: "#FFFFFF", markC: "#E8613C", edgeC: "#F4FAFF", glassC: "#BFD3F2",
};
const M = (kind, color, o = {}) => ({ kind, color, ...o });
const glowM = (c, op, ei = 1) => M("std", c, { emissive: c, ei, opacity: op, rough: 1, metal: 0 });
const materials = {
  floor: M("std", "floorC", { rough: 0.7, metal: 0.3, tex: "brushed", texScale: 3 }),
  panel: M("std", "panel", { rough: 0.55, metal: 0.05, env: 0.25 }), panel2: M("std", "panel2", { rough: 0.6, metal: 0.05, env: 0.2 }),
  seam: M("std", "seam", { rough: 0.6, metal: 0.3 }), band: M("std", "band", { rough: 0.4, metal: 0.3, env: 0.4 }),
  steel: M("std", "steel", { rough: 0.35, metal: 0.85, env: 0.5 }), steel2: M("std", "steel2", { rough: 0.3, metal: 0.8, env: 0.6, tex: "brushed", texScale: 2 }),
  dark: M("std", "dark", { rough: 0.5, metal: 0.4, env: 0.3 }), darker: M("std", "darker", { rough: 0.5, metal: 0.3, env: 0.3 }), rubber: M("std", "rubber", { rough: 0.9, metal: 0 }),
  gold: M("std", "gold", { rough: 0.3, metal: 0.9, env: 0.8 }), padGold: M("std", "padGold", { rough: 0.25, metal: 0.9, env: 0.9 }),
  lampY: M("std", "lampY", { emissive: "lampY", ei: 0.45, rough: 0.4, metal: 0 }), lampG: M("std", "lampG", { emissive: "lampG", ei: 0.45, rough: 0.4, metal: 0 }),
  lampR: M("std", "lampR", { emissive: "lampR", ei: 0.4, rough: 0.4, metal: 0 }), estop: M("std", "estop", { rough: 0.4, metal: 0, emissive: "estop", ei: 0.15 }),
  screen: M("std", "screen", { emissive: "screen", ei: 0.5, rough: 0.3, metal: 0 }), warnY: M("std", "warnY", { rough: 0.5, metal: 0, emissive: "warnY", ei: 0.2 }),
  cu: M("std", "cuC", { rough: 0.3, metal: 0.9, env: 0.9 }), cuHi: M("std", "cuHi", { rough: 0.25, metal: 0.9, env: 1.0 }), ag: M("std", "agC", { rough: 0.15, metal: 0.95, env: 1.2 }),
  chip: M("std", "chipC", { rough: 0.3, metal: 0.5, env: 0.8 }), chipTop: M("std", "chipTop", { rough: 0.2, metal: 0.5, env: 0.9, tex: "traces", texScale: 0.6 }),
  wire: M("std", "wireC", { rough: 0.2, metal: 0.95, env: 1.1, emissive: "wireC", ei: 0.1 }), resist: M("std", "resistC", { rough: 0.5, metal: 0, emissive: "resistC", ei: 0.1 }),
  emc: M("std", "emcC", { rough: 0.75, metal: 0, env: 0.15 }), emcSoft: M("std", "emcSoftC", { rough: 0.6, metal: 0, env: 0.2 }), resin: M("phys", "resinC", { rough: 0.3, metal: 0, clearcoat: 0.5, opacity: 0.55, env: 0.4 }),
  sio2: M("std", "siO2", { rough: 0.35, metal: 0, env: 0.5 }), heat: glowM("heatC", 1, 0.8), flux: M("phys", "fluxC", { rough: 0.1, metal: 0, clearcoat: 1, opacity: 0.65, env: 0.6 }),
  solder: M("std", "solderC", { rough: 0.2, metal: 0.9, env: 1.0 }), solderHi: M("std", "solderHi", { rough: 0.1, metal: 0.9, env: 1.2, emissive: "solderHi", ei: 0.2 }),
  pcb: M("std", "pcbC", { rough: 0.45, metal: 0.1, env: 0.35, tex: "traces", texScale: 1.2 }), pcbD: M("std", "pcbD", { rough: 0.5, metal: 0.1 }), sub: M("std", "subC", { rough: 0.45, metal: 0.1, env: 0.3 }),
  cap: M("std", "capC", { rough: 0.5, metal: 0.2 }), uf: M("phys", "ufC", { rough: 0.2, metal: 0, clearcoat: 0.8, opacity: 0.78, env: 0.5, emissive: "ufC", ei: 0.1 }),
  crack: glowM("crackC", 1, 0.9), water: M("phys", "waterC", { rough: 0.05, metal: 0, clearcoat: 1, opacity: 0.8, env: 0.9 }), pebble: M("std", "pebbleC", { rough: 0.9, metal: 0 }),
  pink: M("std", "pinkC", { rough: 0.9, metal: 0 }), white: M("std", "whiteP", { rough: 0.7, metal: 0 }), mark: M("std", "markC", { rough: 0.5, metal: 0, emissive: "markC", ei: 0.25 }),
  glass: M("phys", "glassC", { rough: 0.05, metal: 0, clearcoat: 1, opacity: 0.25, env: 0.6 }), ok: glowM("okC", 1, 0.6),
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
const SPH = (id, layer, r, x, y, z, mat, o = {}) => P({ id, layer, shape: "sphere", size: [r], pos: [x, y, z], mat, ...o });
const A = (layer, p, dx, dy) => ({ layer, p, dx, dy });
const PIPE = (id, layer, pts, r, mat) => {
  for (let i = 0; i < pts.length - 1; i++) {
    const [x0, y0, z0] = pts[i], [x1, y1, z1] = pts[i + 1];
    const L = Math.hypot(x1 - x0, y1 - y0, z1 - z0);
    const rot = Math.abs(x1 - x0) > 1e-6 ? HX : Math.abs(y1 - y0) > 1e-6 ? V : [0, 0, 0];
    P({ id: `${id}${i}`, layer, shape: "cyl", size: [r, R2(L)], rot, pos: [R2((x0 + x1) / 2), R2((y0 + y1) / 2), R2((z0 + z1) / 2)], mat });
    if (i > 0) SPH(`${id}J${i}`, layer, r * 1.15, x0, y0, z0, mat);
  }
};
// 斜的圓柱（在 xy 平面內，從 a 到 b）
const SEG = (id, layer, a, b, r, mat, o = {}) => {
  const dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy), ang = (Math.atan2(dx, dy) * 180) / Math.PI;
  return P({ id, layer, shape: "cyl", size: [r, R2(L)], rot: [90, 0, R2(-ang)], pos: [R2((a[0] + b[0]) / 2), R2((a[1] + b[1]) / 2), a[2] ?? 0], mat, ...o });
};
// 平面多邊形（xy），沿 z 擠出 t 厚
const POLY = (id, layer, pts, t, z, mat) => {
  const xs = pts.map((p) => p[0]), ys = pts.map((p) => p[1]), cx = (Math.min(...xs) + Math.max(...xs)) / 2, cy = (Math.min(...ys) + Math.max(...ys)) / 2;
  return P({ id, layer, shape: "poly", size: [R2(Math.max(...xs) - Math.min(...xs)), R2(Math.max(...ys) - Math.min(...ys)), t], pts: pts.map(([x, y]) => [R2(x - cx), R2(y - cy)]), pos: [R2(cx), R2(cy), z], mat });
};
const idsOf = (layer) => parts.filter((q) => q.layer === layer).map((q) => q.id);
const grid = (nx, nz, px, pz, cx, cz, y = 0) => { const o = []; for (let i = 0; i < nx; i++) for (let j = 0; j < nz; j++) o.push([R2(cx + (i - (nx - 1) / 2) * px), y, R2(cz + (j - (nz - 1) / 2) * pz)]); return o; };
// 任意方向的圓柱（3D，a→b）
const SEG3 = (id, layer, a, b, r, mat, o = {}) => {
  const dx = b[0] - a[0], dy = b[1] - a[1], dz = b[2] - a[2], L = Math.hypot(dx, dy, dz), ux = dx / L, uy = dy / L, uz = dz / L;
  const t1 = -Math.asin(uy) / D2R, t2 = Math.atan2(ux, uz) / D2R;
  return P({ id, layer, shape: "cyl", size: [r, R2(L)], rot: [R2(t1), R2(t2), 0], pos: [R2((a[0] + b[0]) / 2), R2((a[1] + b[1]) / 2), R2((a[2] + b[2]) / 2)], mat, ...o });
};

// ═════ 地板 ═════
LAY("floor", [300, 2, 110, 0], true);
P({ id: "floor", layer: "floor", shape: "slab", size: [320, 0.5, 44], r: 0.2, pos: [110, -0.25, 0], mat: "floor" });
P({ id: "floorSeam", layer: "floor", shape: "slab", size: [320, 0.04, 0.1], pos: [110, 0.01, 0], at: Array.from({ length: 7 }, (_, i) => [0, 0, -16 + i * 5.3]), mat: "seam" });

// ═════ 共用：導線架單元＋晶片＋金線（L 站、Q 站、M 站模穴裡縮小版） ═════
// 中心 (cx, y0, cz)、比例 s；8×4＝32 根引腳；回傳各零件所屬層
const LEADS = Array.from({ length: 8 }, (_, i) => (i - 3.5) * 0.6);
const buildUnit = (pre, cx, y0, cz, s, lays, opt = {}) => {
  const { lf, chip, wire, da } = lays, T = 0.15 * s, y1 = y0 + T;
  // 晶片座＋四根連桿
  BOX(`${pre}Pad`, lf, cx - 2 * s, cx + 2 * s, y0, y1, cz - 2 * s, cz + 2 * s, "cu");
  if (!opt.noBar) for (const [sx, sz] of [[1, 1], [1, -1], [-1, 1], [-1, -1]]) P({ id: `${pre}Tie${sx}${sz}`, layer: lf, shape: "box", size: [R2(3.6 * s), T, R2(0.25 * s)], pos: [R2(cx + sx * 3.4 * s), R2((y0 + y1) / 2), R2(cz + sz * 3.4 * s)], rot: [0, sx * sz > 0 ? -45 : 45, 0], mat: "cu" });
  // 引腳：內引腳（2.7→4.3）、擋條（4.3→4.5）、外引腳（4.5→outer）
  const outer = opt.outer ?? 6.2;
  for (const side of [0, 1, 2, 3]) for (const [k, u] of LEADS.entries()) {
    const ang = side * 90, c = Math.cos(ang * D2R), sn = Math.sin(ang * D2R);
    const P0 = (r, t) => [cx + (c * r - sn * t) * s, cz + (sn * r + c * t) * s];
    const [ax, az] = P0((2.7 + outer) / 2, u), len = (outer - 2.7) * s;
    P({ id: `${pre}Ld${side}_${k}`, layer: lf, shape: "box", size: [R2(len), T, R2(0.28 * s)], pos: [R2(ax), R2((y0 + y1) / 2), R2(az)], rot: [0, -ang, 0], mat: "cu" });
    const [bx, bz] = P0(2.95, u);
    P({ id: `${pre}Ag${side}_${k}`, layer: lf, shape: "box", size: [R2(0.45 * s), R2(0.012 * s + 0.004), R2(0.24 * s)], pos: [R2(bx), R2(y1 + 0.004), R2(bz)], rot: [0, -ang, 0], mat: "ag" });
    if (wire) { const [px, pz] = P0(1.32, u * 0.55), [mx, mz] = P0(2.15, u * 0.78), yTop = y1 + (0.05 + 0.3 + 0.75) * s;
      SEG3(`${pre}W${side}_${k}a`, wire, [px, y1 + 0.35 * s, pz], [mx, yTop, mz], 0.035 * s, "wire"); SEG3(`${pre}W${side}_${k}b`, wire, [mx, yTop, mz], [bx, y1 + 0.01, bz], 0.035 * s, "wire"); }
  }
  if (!opt.noBar) for (const side of [0, 1, 2, 3]) { const ang = side * 90, c = Math.cos(ang * D2R), sn = Math.sin(ang * D2R); P({ id: `${pre}Dam${side}`, layer: lf, shape: "box", size: [R2(0.2 * s), T, R2(9.2 * s)], pos: [R2(cx + c * 4.4 * s), R2((y0 + y1) / 2), R2(cz + sn * 4.4 * s)], rot: [0, -ang, 0], mat: "cu" }); }
  // 黏晶膠＋晶片＋晶片接點
  BOX(`${pre}DA`, da ?? chip, cx - 1.55 * s, cx + 1.55 * s, y1, y1 + 0.05 * s, cz - 1.55 * s, cz + 1.55 * s, "ag");
  BOX(`${pre}Chip`, chip, cx - 1.5 * s, cx + 1.5 * s, y1 + 0.05 * s, y1 + 0.35 * s, cz - 1.5 * s, cz + 1.5 * s, "chip");
  BOX(`${pre}ChipTop`, chip, cx - 1.42 * s, cx + 1.42 * s, y1 + 0.35 * s, y1 + 0.36 * s, cz - 1.42 * s, cz + 1.42 * s, "chipTop");
  P({ id: `${pre}ChipPad`, layer: chip, shape: "box", size: [R2(0.12 * s), R2(0.01 * s + 0.004), R2(0.12 * s)], pos: [cx, R2(y1 + 0.36 * s + 0.003), cz],
    at: [0, 1, 2, 3].flatMap((side) => LEADS.map((u) => { const a = side * 90 * D2R, r = 1.32, t = u * 0.55; return [R2((Math.cos(a) * r - Math.sin(a) * t) * s), 0, R2((Math.sin(a) * r + Math.cos(a) * t) * s)]; })), mat: "padGold" });
  return { y1, chipTop: y1 + 0.36 * s };
};

// ═════ 站 L：導線架單元（放大示意，1＝約 1 mm） ═════
LAY("lBase", [16, 1, 0, 0.45]);
BOX("lPlate", "lBase", -8.5, 8.5, 0, 0.85, -8.6, 8.6, "band"); BOX("lPlateTop", "lBase", -8.5, 8.5, 0.85, 0.9, -8.6, 8.6, "panel2");
P({ id: "lPlateBolt", layer: "lBase", shape: "cyl", size: [0.12, 0.05], rot: V, pos: [0, 0.91, 0], at: [[-8, 0, -8.1], [8, 0, -8.1], [-8, 0, 8.1], [8, 0, 8.1]], mat: "steel" });
LAY("lLF", [14, 0.3, 0, 1.0]); LAY("lChip", [3.2, 0.5, 0, 1.3]); LAY("lWire", [6, 1, 0, 1.6]);
buildUnit("l", 0, 0.9, 0, 1, { lf: "lLF", chip: "lChip", wire: "lWire" });
// 載條（兩側長條＋定位孔）
for (const z of [-7.4, 7.4]) { BOX(`lRail${z > 0 ? "F" : "B"}`, "lLF", -8.2, 8.2, 0.9, 1.05, z - 0.6, z + 0.6, "cu"); P({ id: `lHole${z > 0 ? "F" : "B"}`, layer: "lLF", shape: "cyl", size: [0.22, 0.17], rot: V, pos: [0, 0.98, z], at: [-6, -3, 0, 3, 6].map((x) => [x, 0, 0]), mat: "darker" }); }
for (const x of [-6.2, 6.2]) BOX(`lSide${x > 0 ? "R" : "L"}`, "lLF", x - 0.3, x + 0.3, 0.9, 1.05, -6.8, 6.8, "cu");

// ═════ 站 P：沖壓機（x 26）＋蝕刻線（x 36） ═════
const PX = 26;
LAY("pPress", [6, 6, PX, 3]);
BOX("ppBase", "pPress", PX - 2.6, PX + 2.6, 0, 1.2, -1.8, 1.8, "band"); BOX("ppBed", "pPress", PX - 1.6, PX + 1.6, 1.2, 1.6, -1.2, 1.2, "darker");
BOX("ppDieCav", "pPress", PX - 0.7, PX + 0.7, 1.58, 1.61, -0.6, 0.6, "dark");
for (const [x, z] of [[-1.9, -1.3], [1.9, -1.3], [-1.9, 1.3], [1.9, 1.3]]) VC(`ppPost${x}${z}`, "pPress", 0.14, 1.2, 5.0, "steel2", { x: PX + x, z });
BOX("ppCrown", "pPress", PX - 2.4, PX + 2.4, 5.0, 5.8, -1.6, 1.6, "band"); BOX("ppPlate", "pPress", PX - 1.0, PX + 0.4, 5.3, 5.6, 1.6, 1.65, "gold");
ZC("ppFly", "pPress", 1.0, -2.25, -1.9, PX, 5.4, "steel"); ZC("ppFlyHub", "pPress", 0.3, -2.35, -1.8, PX, 5.4, "dark"); ZC("ppFlyMark", "pPress", 0.12, -2.28, -2.26, PX + 0.7, 5.4, "mark");
ZC("ppShaft", "pPress", 0.16, -2.4, 1.7, PX, 5.4, "steel2"); ZC("ppCrank", "pPress", 0.42, 1.15, 1.32, PX, 5.4, "dark"); ZC("ppCrankPin", "pPress", 0.1, 1.32, 1.45, PX + 0.25, 5.4, "steel");
// ↑ 前端曲柄（偏心輪）＋曲柄銷，跟飛輪同軸轉，連桿大端套在這裡
P({ id: "ppBearing", layer: "pPress", shape: "box", size: [0.6, 0.6, 0.3], pos: [PX, 5.4, 0], at: [[0, 0, -1.7], [0, 0, 1.7]], mat: "dark" });
BOX("ppMotorB", "pPress", PX + 1.6, PX + 2.8, 5.8, 6.7, -2.5, -1.6, "dark"); ZC("ppPulley", "pPress", 0.25, -2.25, -1.9, PX + 2.2, 6.25, "steel");
SEG3("ppBeltT", "pPress", [PX + 2.2, 6.5, -2.08], [PX, 6.4, -2.08], 0.04, "rubber"); SEG3("ppBeltB", "pPress", [PX + 2.2, 6.0, -2.08], [PX + 0.55, 4.55, -2.08], 0.04, "rubber");
 BOX("ppWarn", "pPress", PX + 1.2, PX + 2.2, 0.4, 0.8, 1.8, 1.84, "warnY");
for (let i = 0; i < 5; i++) BOX(`ppVent${i}`, "pPress", PX - 2.2, PX - 0.6, 0.3 + i * 0.16, 0.36 + i * 0.16, 1.8, 1.84, "darker");
SPH("ppLed", "pPress", 0.1, PX - 0.2, 0.9, 1.85, "lampG");
LAY("pRam", [3.4, 1.8, PX, 3.3]);
BOX("prSlide", "pRam", PX - 1.75, PX + 1.75, 3.4, 4.2, -1.0, 1.0, "steel2"); BOX("prRod", "pRam", PX - 0.15, PX + 0.15, 4.2, 5.25, 0.9, 1.1, "steel"); ZC("prBigEnd", "pRam", 0.28, 0.85, 1.15, PX, 5.25, "dark"); BOX("prPunch", "pRam", PX - 0.7, PX + 0.7, 2.4, 3.4, -0.6, 0.6, "steel");
P({ id: "prTooth", layer: "pRam", shape: "box", size: [0.12, 0.2, 0.9], pos: [PX, 2.3, 0], at: Array.from({ length: 6 }, (_, i) => [R2(-0.55 + i * 0.22), 0, 0]), mat: "darker" });
P({ id: "prBush", layer: "pRam", shape: "tube", size: [0.25, 0.15, 0.8], rot: V, pos: [PX, 3.8, 0], at: [[-1.9, 0, -1.3], [1.9, 0, -1.3], [-1.9, 0, 1.3], [1.9, 0, 1.3]], mat: "gold" });
// 銅帶：捲料 → 未沖 → 沖好（梳狀引腳）
LAY("pStrip", [10, 0.2, PX - 1, 1.62]); LAY("pReel", [3, 3, PX - 5.2, 1.9]);
ZC("psReel", "pReel", 1.2, -0.9, 0.9, PX - 5.2, 1.9, "cu"); ZC("psReelHub", "pReel", 0.35, -1.0, 1.0, PX - 5.2, 1.9, "steel"); BOX("psReelStand", "pReel", PX - 5.5, PX - 4.9, 0, 1.9, -0.15, 0.15, "dark");
BOX("psRaw", "pStrip", PX - 4.2, PX - 0.7, 1.6, 1.64, -0.8, 0.8, "cu"); SEG("psFeed", "pReel", [PX - 5.2, 3.1, 0], [PX - 4.2, 1.62, 0], 0.03, "cu");
BOX("psDoneRail", "pStrip", PX + 0.7, PX + 4.8, 1.6, 1.64, -0.8, -0.55, "cu"); BOX("psDoneRail2", "pStrip", PX + 0.7, PX + 4.8, 1.6, 1.64, 0.55, 0.8, "cu");
P({ id: "psComb", layer: "pStrip", shape: "box", size: [0.12, 0.04, 1.1], pos: [0, 1.62, 0], at: Array.from({ length: 18 }, (_, i) => [R2(PX + 0.9 + i * 0.22), 0, 0]), mat: "cuHi" });
// 蝕刻線
const EXX = 36.5;
LAY("pEtch", [7, 4, EXX, 2]);
BOX("peFrame", "pEtch", EXX - 3.2, EXX + 3.2, 0, 0.95, -1.8, 1.8, "panel"); BOX("peBand", "pEtch", EXX - 3.2, EXX + 3.2, 0.95, 1.05, -1.8, 1.8, "band");
P({ id: "peRoller", layer: "pEtch", shape: "cyl", size: [0.12, 3.0], pos: [0, 1.12, 0], at: [-2.7, -1.8, -0.9, 0, 0.9, 1.8, 2.7].map((x) => [R2(EXX + x), 0, 0]), mat: "steel2" });
HXC("peBar", "pEtch", 0.12, EXX - 2.6, EXX + 2.6, 3.0, 0, "steel"); P({ id: "peNozzle", layer: "pEtch", shape: "cone", size: [0.14, 0.04, 0.3], rot: [-90, 0, 0], pos: [0, 2.75, 0], at: [-2, -1, 0, 1, 2].map((x) => [R2(EXX + x), 0, 0]), mat: "darker" });
for (const x of [-3.0, 3.0]) VC(`pePost${x}`, "pEtch", 0.1, 1.05, 3.2, "steel", { x: EXX + x, z: -1.2 });
BOX("peHood", "pEtch", EXX - 3.2, EXX + 3.2, 3.2, 3.4, -1.6, 0.2, "glass"); BOX("peWarn", "pEtch", EXX - 2.8, EXX - 1.6, 0.4, 0.7, 1.8, 1.84, "warnY");
// 銅片：蝕刻前（整片＋光阻圖形）／蝕刻後（只剩光阻底下的引腳）
const etchPat = Array.from({ length: 11 }, (_, i) => [R2(EXX - 2.0 + i * 0.4), 0, 0]);
LAY("peSheet0", [5, 0.1, EXX, 1.25]); BOX("pes0", "peSheet0", EXX - 2.3, EXX + 2.3, 1.22, 1.27, -1.2, 1.2, "cu");
LAY("peSheet1", [5, 0.1, EXX, 1.25]); BOX("pes1a", "peSheet1", EXX - 2.3, EXX + 2.3, 1.22, 1.25, -1.2, 1.2, "cu");
LAY("peSheet2", [5, 0.1, EXX, 1.25]); P({ id: "pes2", layer: "peSheet2", shape: "box", size: [0.2, 0.05, 1.8], pos: [0, 1.245, 0], at: etchPat, mat: "cuHi" }); BOX("pes2r", "peSheet2", EXX - 2.3, EXX + 2.3, 1.22, 1.27, -1.2, -0.95, "cu");
LAY("peResist", [5, 0.1, EXX, 1.29]); P({ id: "peRes", layer: "peResist", shape: "box", size: [0.2, 0.02, 1.8], pos: [0, 1.28, 0], at: etchPat, mat: "resist" });

// ═════ 站 M：轉移成型模具剖面（剖開示意；零件只在 z −1.5～0，從正面看得到模穴）＋料餅與填料放大 ═════
const MX = 60, MZ0 = -1.5, MZ1 = 0;
const CAV = [[55.6, 58.4], [61.6, 64.4]], CY0 = 1.7, CY1 = 2.5, RY0 = 2.0, RY1 = 2.22;
LAY("mLow", [12, 2, MX, 1]);
BOX("mlBaseL", "mLow", 54, 59.45, 0, 1.7, MZ0, MZ1, "steel2"); BOX("mlBaseR", "mLow", 60.55, 66, 0, 1.7, MZ0, MZ1, "steel2"); BOX("mlBaseBack", "mLow", 59.45, 60.55, 0, 1.7, MZ0, MZ0 + 0.1, "dark"); BOX("mlTopL", "mLow", 54, 55.6, 1.7, 2.0, MZ0, MZ1, "steel2"); BOX("mlTopM1", "mLow", 58.4, 59.45, 1.7, 2.0, MZ0, MZ1, "steel2");
BOX("mlTopM2", "mLow", 60.55, 61.6, 1.7, 2.0, MZ0, MZ1, "steel2"); BOX("mlTopR", "mLow", 64.4, 66, 1.7, 2.0, MZ0, MZ1, "steel2");
P({ id: "mlHeat", layer: "mLow", shape: "cyl", size: [0.16, 1.5], pos: [0, 0.7, -0.75], at: [55.2, 57.2, 62.8, 64.8].map((x) => [x, 0, 0]), mat: "heat" });
BOX("mlPotL", "mLow", 59.45, 59.5, 0.3, 1.7, MZ0, MZ1, "dark"); BOX("mlPotR", "mLow", 60.5, 60.55, 0.3, 1.7, MZ0, MZ1, "dark");
BOX("mlPotFill", "mLow", 59.5, 60.5, 0, 0.3, MZ0, MZ1, "steel2");
P({ id: "mlBolt", layer: "mLow", shape: "cyl", size: [0.12, 0.06], pos: [0, 0, 0.02], at: [[54.4, 0.3, 0], [65.6, 0.3, 0], [54.4, 1.4, 0], [65.6, 1.4, 0]], mat: "dark" });
BOX("mlEdge", "mLow", 54, 66, 0, 0.08, MZ0, MZ1 + 0.02, "dark");
LAY("mUp", [12, 2, MX, 3.2]);
BOX("muBase", "mUp", 54, 66, CY1, 4.3, MZ0, MZ1, "steel2"); BOX("muL", "mUp", 54, 55.6, 2.0, CY1, MZ0, MZ1, "steel2"); BOX("muM", "mUp", 58.4, 61.6, RY1, CY1, MZ0, MZ1, "steel2"); BOX("muR", "mUp", 64.4, 66, 2.0, CY1, MZ0, MZ1, "steel2");
P({ id: "muHeat", layer: "mUp", shape: "cyl", size: [0.16, 1.5], pos: [0, 3.5, -0.75], at: [55.2, 57.2, 62.8, 64.8].map((x) => [x, 0, 0]), mat: "heat" });
BOX("muPlate", "mUp", 54.6, 56.6, 3.7, 4.1, MZ1, MZ1 + 0.03, "gold"); BOX("muEdge", "mUp", 54, 66, 4.22, 4.3, MZ0, MZ1 + 0.02, "dark");
P({ id: "muPin", layer: "mUp", shape: "cyl", size: [0.08, 1.6], rot: V, pos: [0, 3.3, -0.4], at: [57, 63].map((x) => [x, 0, 0]), mat: "steel" });
// 模穴裡的導線架單元（縮小 0.3，晶片＋金線）
LAY("mUnit", [10, 0.6, MX, 2.1]);
for (const [i, [a, b]] of CAV.entries()) { const c = (a + b) / 2; BOX(`muLF${i}`, "mUnit", a - 0.02, b + 0.02, 1.97, 2.02, MZ0 + 0.1, MZ1, "cu"); BOX(`muDie${i}`, "mUnit", c - 0.5, c + 0.5, 2.02, 2.14, MZ0 + 0.3, MZ1, "chip");
}
// 金線：原形（mWire）與被膠流沖彎後（mWireS：線弧頂點往膠流方向偏 0.3，兩端焊點不動＝沖線，留下不回彈）
LAY("mWire", [10, 0.6, MX, 2.2]); LAY("mWireS", [10, 0.6, MX, 2.2]);
for (const [i, [a, b]] of CAV.entries()) { const c = (a + b) / 2, fd = c < MX ? -1 : 1;
  for (const [k, sx] of [[0, -1], [1, 1]]) { const p0 = [c + sx * 0.45, 2.14, 0.02], p2 = [c + sx * 1.25, 2.03, 0.02];
    SEG(`muW${i}${k}a`, "mWire", p0, [c + sx * 0.85, 2.38, 0.02], 0.03, "wire"); SEG(`muW${i}${k}b`, "mWire", [c + sx * 0.85, 2.38, 0.02], p2, 0.03, "wire");
    const ap = [R2(c + sx * 0.85 + fd * 0.3), 2.34, 0.02]; SEG(`msW${i}${k}a`, "mWireS", p0, ap, 0.03, "wire"); SEG(`msW${i}${k}b`, "mWireS", ap, p2, 0.03, "wire"); } }
// 料筒裡的料餅（三種高度）與柱塞
const PELH = [0.7, 0.45, 0.2];
for (const [k, h] of PELH.entries()) { LAY(`mPel${k}`, [1, 0.8, MX, 1.4]); BOX(`mPel${k}b`, `mPel${k}`, 59.5, 60.5, 1.0, R2(1.0 + h), MZ0 + 0.1, MZ1, k ? "emcSoft" : "emc"); }
LAY("mPlunger", [1, 1, MX, 0.6]); BOX("mpHead", "mPlunger", 59.52, 60.48, 0.8, 1.0, MZ0 + 0.1, MZ1, "steel"); BOX("mpRod", "mPlunger", 59.8, 60.2, 0.0, 0.8, MZ0 + 0.3, MZ1 - 0.2, "steel2");
// 膠的前緣：流道（兩邊各 3 段）、模穴（兩邊各 6 段，從澆口往外），先是軟（褐），最後一起變硬（黑）
const FILL = [];
for (const side of [0, 1]) {
  const dir = side ? 1 : -1;
  for (let k = 0; k < 3; k++) { const x0 = 60 + dir * (0.5 + k * 0.37), x1 = x0 + dir * 0.37; const id = `mR${side}_${k}`; LAY(id, [0.4, 0.2, R2((x0 + x1) / 2), 2.1]); BOX(`${id}b`, id, Math.min(x0, x1), Math.max(x0, x1), RY0, RY1, MZ0 + 0.05, MZ1 - 0.01, "emcSoft"); FILL.push(id); }
  const [a, b] = CAV[side], gate = side ? a : b;
  for (let k = 0; k < 6; k++) { const x0 = gate - dir * (k * 0.467) * -1, x1 = x0 + dir * 0.467; const id = `mC${side}_${k}`; LAY(id, [0.5, 0.8, R2((x0 + x1) / 2), 2.1]); BOX(`${id}b`, id, R2(Math.min(x0, x1)), R2(Math.max(x0, x1)), CY0, CY1, MZ0 + 0.05, MZ1 - 0.01, "emcSoft"); FILL.push(id); }
}
LAY("mRup", [1, 0.3, MX, 1.9]); BOX("mRupB", "mRup", 59.5, 60.5, 1.75, 2.0, MZ0 + 0.05, MZ1 - 0.01, "emcSoft");
LAY("mCure", [10, 0.8, MX, 2.1]);
for (const [i, [a, b]] of CAV.entries()) BOX(`mCure${i}`, "mCure", a, b, CY0, CY1, MZ0 + 0.04, MZ1 - 0.005, "emc");
BOX("mCureR", "mCure", 59.5, 60.5, 1.55, RY1, MZ0 + 0.04, MZ1 - 0.005, "emc"); BOX("mCureRL", "mCure", 58.4, 59.5, RY0, RY1, MZ0 + 0.04, MZ1 - 0.005, "emc"); BOX("mCureRR", "mCure", 60.5, 61.6, RY0, RY1, MZ0 + 0.04, MZ1 - 0.005, "emc");
// 料餅（整顆）與填料放大塊
LAY("mPellet", [2, 1.6, 67.6, 1.3]);
BOX("mpStand", "mPellet", 66.7, 68.5, 0, 0.5, -0.9, 0.9, "band"); VC("mpCyl", "mPellet", 0.75, 0.5, 2.1, "emc", { x: 67.6, z: 0 }); VT("mpEdge", "mPellet", 0.76, 0.7, 2.05, 2.1, "darker", { x: 67.6, z: 0 });
LAY("mFiller", [2.4, 2.4, 70.6, 1.9]);
BOX("mfStand", "mFiller", 69.4, 71.8, 0, 0.5, -1.2, 1.2, "band"); BOX("mfCube", "mFiller", 69.5, 71.7, 0.6, 2.8, -1.1, 1.1, "resin");
{ const pts = []; for (let i = 0; i < 7; i++) for (let j = 0; j < 7; j++) for (let k = 0; k < 7; k++) { if (rnd() > 0.85) continue; pts.push([R2(69.66 + i * 0.31 + (rnd() - 0.5) * 0.06), R2(0.76 + j * 0.31 + (rnd() - 0.5) * 0.06), R2(-0.94 + k * 0.31 + (rnd() - 0.5) * 0.06)]); }
  P({ id: "mfBall", layer: "mFiller", shape: "sphere", size: [0.135], pos: [0, 0, 0], at: pts, mat: "sio2" }); }
BOX("mfEdge", "mFiller", 69.48, 71.72, 2.8, 2.84, -1.12, 1.12, "edgeLine");
materials.edgeLine = glowM("edgeC", 0.95, 0.5);

// ═════ 站 Q：封好的封裝（QFP，爆炸分解） ═════
const QX = 90;
LAY("qBase", [12, 1, QX, 0.4]); BOX("qPlate", "qBase", QX - 6, QX + 6, 0, 0.6, -6, 6, "band"); BOX("qPlateTop", "qBase", QX - 6, QX + 6, 0.6, 0.65, -6, 6, "panel2");
LAY("qLF", [12, 1.2, QX, 1.4]); LAY("qChip", [3.2, 1.2, QX, 2.2]); LAY("qBody", [8, 1.6, QX, 2.4]); LAY("qBot", [8, 0.8, QX, 1.3]);
const QY = 1.6;
buildUnit("q", QX, QY, 0, 1, { lf: "qLF", chip: "qChip", wire: "qChip", da: "qChip" }, { noBar: true, outer: 5.0 });
// 鷗翼腳：外引腳在膠體外往下彎
for (const side of [0, 1, 2, 3]) for (const [k, u] of LEADS.entries()) { const a = side * 90 * D2R, c = Math.cos(a), s = Math.sin(a), X = (r, t) => [QX + c * r - s * t, c * t + s * r];
  const [x1, z1] = X(5.0, u), [x2, z2] = X(5.4, u); SEG3(`qGull${side}_${k}a`, "qLF", [x1, QY + 0.07, z1], [x2, 0.72, z2], 0.08, "cu"); const [x3, z3] = X(5.9, u); SEG3(`qGull${side}_${k}b`, "qLF", [x2, 0.72, z2], [x3, 0.72, z3], 0.08, "cu"); }
BOX("qbBot", "qBot", QX - 3.9, QX + 3.9, 1.0, QY, -3.9, 3.9, "emc"); BOX("qbTop", "qBody", QX - 3.9, QX + 3.9, QY + 0.15, 3.0, -3.9, 3.9, "emc");
for (const side of [0, 1, 2, 3]) { const a = side * 90; P({ id: `qbMid${side}`, layer: "qBot", shape: "box", size: [0.5, 0.15, 7.8], pos: [R2(QX + Math.cos(a * D2R) * 3.65), QY + 0.075, R2(Math.sin(a * D2R) * 3.65)], rot: [0, -a, 0], mat: "emc" }); }
VC("qbDot", "qBody", 0.3, 3.0, 3.015, "darker", { x: QX - 2.9, z: 2.9 }); BOX("qbMark", "qBody", QX - 1.8, QX + 1.8, 3.0, 3.012, -0.5, 0.5, "dark"); BOX("qbMark2", "qBody", QX - 1.2, QX + 1.2, 3.0, 3.012, 0.8, 1.2, "dark");
P({ id: "qbEject", layer: "qBody", shape: "cyl", size: [0.35, 0.012], rot: V, pos: [QX, 3.006, 0], at: [[2.6, 0, -2.6], [-2.6, 0, -2.6]], mat: "darker" }); BOX("qbGate", "qBody", QX + 3.5, QX + 3.9, 2.0, 2.6, 3.5, 3.9, "darker");
// 水滴與小石子
LAY("qDrops", [8, 3, QX, 3.6]); LAY("qPebble", [0.6, 0.6, QX + 1.5, 3.3]); SPH("qPeb", "qPebble", 0.28, QX + 1.5, 3.3, 1.2, "pebble");
P({ id: "qWater", layer: "qDrops", shape: "sphere", size: [0.16], scale: [1, 0.7, 1], pos: [0, 3.05, 0], at: [[QX - 2.2, 0, -1.2], [QX + 0.4, 0, 1.8], [QX + 2.4, 0, -2.0]], mat: "water" });

// ═════ 站 B：植球台（左）與焊到電路板（右） ═════
const BX = 118;
LAY("bJig", [8, 1.2, BX, 0.6]);
BOX("bjBase", "bJig", BX - 4, BX + 4, 0, 0.6, -4, 4, "band"); for (const [x0, x1, z0, z1] of [[-3.4, 3.4, 2.8, 3.4], [-3.4, 3.4, -3.4, -2.8], [-3.4, -2.8, -2.8, 2.8], [2.8, 3.4, -2.8, 2.8]]) BOX(`bjFrame${x0}${z0}`, "bJig", BX + x0, BX + x1, 0.6, 1.4, z0, z1, "steel2");
BOX("bjPlate", "bJig", BX - 1, BX + 1, 0.3, 0.5, 4, 4.04, "gold"); SPH("bjLed", "bJig", 0.1, BX + 2.5, 0.3, 4.05, "lampG");
LAY("bPkg", [5.4, 0.9, BX, 1.1]);
BOX("bpCap", "bPkg", BX - 2.4, BX + 2.4, 0.6, 1.2, -2.4, 2.4, "emc"); BOX("bpSub", "bPkg", BX - 2.6, BX + 2.6, 1.2, 1.5, -2.6, 2.6, "sub");
const BG = grid(8, 8, 0.6, 0.6, BX, 0, 0);
P({ id: "bpPad", layer: "bPkg", shape: "cyl", size: [0.17, 0.02], rot: V, pos: [0, 1.51, 0], at: BG, mat: "padGold" });
LAY("bFlux", [5, 0.1, BX, 1.53]); P({ id: "bfDot", layer: "bFlux", shape: "cyl", size: [0.2, 0.03], rot: V, pos: [0, 1.535, 0], at: BG, mat: "flux" });
for (let i = 0; i < 8; i++) { LAY(`bB${i}`, [0.6, 0.5, R2(BX - 2.1 + i * 0.6), 1.7]); P({ id: `bbBall${i}`, layer: `bB${i}`, shape: "sphere", size: [0.18], pos: [0, 1.7, 0], at: grid(1, 8, 0.6, 0.6, R2(BX - 2.1 + i * 0.6), 0, 0), mat: "solder" }); }
// 右：電路板＋焊好的 BGA（錫球朝下）
const BX2 = 128;
LAY("bPCB", [9, 0.4, BX2, 0.5]); BOX("bPcb", "bPCB", BX2 - 4.5, BX2 + 4.5, 0.3, 0.55, -4, 4, "pcb"); BOX("bPcbStand", "bPCB", BX2 - 4.3, BX2 + 4.3, 0, 0.3, -3.6, 3.6, "darker");
P({ id: "bPcbCap", layer: "bPCB", shape: "box", size: [0.4, 0.2, 0.25], pos: [0, 0.65, 0], at: [[-3.6, 0, -3.2], [-3.0, 0, -3.2], [3.2, 0, 3.2], [3.6, 0, 2.6], [-3.6, 0, 3.0], [3.4, 0, -3.0]].map(([x, y, z]) => [BX2 + x, y, z]), mat: "cap" });
P({ id: "bPcbChip", layer: "bPCB", shape: "box", size: [1.2, 0.25, 1.2], pos: [0, 0.68, 0], at: [[BX2 - 3.4, 0, 0.6], [BX2 + 3.4, 0, -0.6]], mat: "emc" });
LAY("bMount", [5.4, 1.4, BX2, 1.2]);
P({ id: "bmBall", layer: "bMount", shape: "sphere", size: [0.19], scale: [1, 0.85, 1], pos: [0, 0.75, 0], at: grid(8, 8, 0.6, 0.6, BX2, 0, 0), mat: "solder" });
BOX("bmSub", "bMount", BX2 - 2.6, BX2 + 2.6, 0.95, 1.25, -2.6, 2.6, "sub"); BOX("bmCap", "bMount", BX2 - 2.4, BX2 + 2.4, 1.25, 1.85, -2.4, 2.4, "emc"); VC("bmDot", "bMount", 0.22, 1.85, 1.86, "darker", { x: BX2 - 1.9, z: 1.9 });

// ═════ 站 T／U：錫點剖面（T＝沒填充、熱循環扯裂；U＝底部填充） ═════
const BALLX = [-4.5, -2.7, -0.9, 0.9, 2.7, 4.5];
const jointStation = (pre, cx) => {
  // 電路板分三段：中段不動，左右兩段受熱往外伸（離中心越遠位移越大＝錫點剪切越大；段與段重疊 0.5，伸縮時不露縫）
  LAY(`${pre}Stand`, [13, 1, cx, 0.5]); BOX(`${pre}StandB`, `${pre}Stand`, cx - 6.6, cx + 6.6, 0, 1.0, -1.0, 1.0, "darker"); BOX(`${pre}StandT`, `${pre}Stand`, cx - 6.7, cx + 6.7, 0.95, 1.0, -1.05, 1.05, "steel2");
  for (const [seg, a, b, dz] of [["c", -1.8, 1.8, 0], ["l", -7, -1.3, 0.01], ["r", 1.3, 7, 0.01]]) {
    const L = `${pre}PCB${seg}`; LAY(L, [b - a, 0.9, R2(cx + (a + b) / 2), 1.5]);
    BOX(`${pre}Pcb${seg}`, L, cx + a, cx + b, 1.0, 1.9, -1.2 - dz, 1.2 + dz, "pcb"); BOX(`${pre}PcbCore${seg}`, L, cx + a, cx + b, 1.3, 1.6, -1.21 - dz, 1.21 + dz, "pcbD");
    const xs = BALLX.filter((x) => (seg === "c" ? Math.abs(x) < 1.3 : seg === "l" ? x < -1.3 : x > 1.3));
    P({ id: `${pre}PcbPad${seg}`, layer: L, shape: "box", size: [1.0, 0.1, 1.6], pos: [0, 1.95, 0], at: xs.map((x) => [R2(cx + x), 0, 0]), mat: "cu" });
  }
  LAY(`${pre}Pkg`, [12, 1.6, cx, 3.8]);
  BOX(`${pre}Sub`, `${pre}Pkg`, cx - 6, cx + 6, 3.0, 3.6, -1.2, 1.2, "sub"); P({ id: `${pre}SubPad`, layer: `${pre}Pkg`, shape: "box", size: [1.0, 0.1, 1.6], pos: [0, 2.95, 0], at: BALLX.map((x) => [R2(cx + x), 0, 0]), mat: "cu" });
  BOX(`${pre}Cap`, `${pre}Pkg`, cx - 5.6, cx + 5.6, 3.6, 4.7, -1.2, 1.2, "emc"); BOX(`${pre}Die`, `${pre}Pkg`, cx - 3, cx + 3, 3.7, 4.1, -1.0, 1.21, "chip");
  P({ id: `${pre}Via`, layer: `${pre}Pkg`, shape: "box", size: [0.12, 0.6, 0.12], pos: [0, 3.3, 1.21], at: BALLX.map((x) => [R2(cx + x), 0, 0]), mat: "cu" });
  BALLX.forEach((x, i) => { LAY(`${pre}B${i}`, [1.3, 1.0, R2(cx + x), 2.45]); P({ id: `${pre}Ball${i}`, layer: `${pre}B${i}`, shape: "sphere", size: [0.62], scale: [1, 0.82, 0.9], pos: [R2(cx + x), 2.45, 0], mat: "solder" }); });
};
jointStation("t", 150); jointStation("u", 172);
// T：裂縫（球頂頸部，紅），兩階段
for (const st of [0, 1]) { LAY(`tCrack${st}`, [12, 0.3, 150, 2.85]); const xs = st ? [-4.5, -2.7, 2.7, 4.5] : [-4.5, 4.5];
  P({ id: `tCr${st}`, layer: `tCrack${st}`, shape: "poly", size: [0.9, 0.22, 2.0], pts: [[-0.45, 0.11], [0.45, 0.04], [0.45, -0.04], [-0.45, -0.11]], pos: [0, 2.83, 0.1], at: xs.map((x) => [R2(150 + x + (x < 0 ? -0.05 : 0.05)), 0, 0]), mat: "crack" }); }
// U：點膠針、膠的前緣（從右邊往左 6 段）、膠角
LAY("uNeedle", [1, 3, 178.6, 4.6]); VC("unTip", "uNeedle", 0.06, 2.3, 3.4, "steel", { x: 178.6, z: 0.6 }); VC("unBarrel", "uNeedle", 0.3, 3.4, 6.0, "glass", { x: 178.6, z: 0.6 }); VC("unFluid", "uNeedle", 0.26, 3.4, 5.0, "uf", { x: 178.6, z: 0.6 }); VC("unHub", "uNeedle", 0.34, 3.3, 3.5, "gold", { x: 178.6, z: 0.6 });
const UFX = [[176, 178.1], [174.3, 176], [172.6, 174.3], [170.9, 172.6], [169.2, 170.9], [166, 169.2]];
UFX.forEach(([a, b], k) => { LAY(`uF${k}`, [b - a, 1.0, (a + b) / 2, 2.45]); BOX(`uFb${k}`, `uF${k}`, a, b, 2.0, 2.9, -1.15, 1.15, "uf"); });
LAY("uFillet", [1, 1, 178.3, 2.3]); P({ id: "uFil", layer: "uFillet", shape: "poly", size: [0.8, 0.9, 2.3], pts: [[-0.4, -0.45], [0.4, -0.45], [-0.4, 0.45]], pos: [178.4, 2.45, 0], mat: "uf" });
LAY("uFilletL", [1, 1, 165.7, 2.3]); P({ id: "uFilL", layer: "uFilletL", shape: "poly", size: [0.8, 0.9, 2.3], pts: [[-0.4, -0.45], [0.4, -0.45], [0.4, 0.45]], pos: [165.6, 2.45, 0], mat: "uf" });

// ═════ 站 V：供應商展示台（導線架卷、導線架片、料餅罐） ═════
const VX = 196;
LAY("vBase", [16, 1, VX, 0.4]); BOX("vFloor", "vBase", VX - 8, VX + 8, 0, 0.3, -3, 3, "panel2");
for (const [i, x] of [-5, 0, 5].entries()) { LAY(`vP${i}`, [3.4, 3, VX + x, 1.6]); BOX(`vPod${i}`, `vP${i}`, VX + x - 1.6, VX + x + 1.6, 0.3, 1.5, -1.6, 1.6, "band"); BOX(`vPodTop${i}`, `vP${i}`, VX + x - 1.65, VX + x + 1.65, 1.5, 1.58, -1.65, 1.65, "panel"); BOX(`vPodPlate${i}`, `vP${i}`, VX + x - 1.1, VX + x + 1.1, 0.7, 1.2, 1.6, 1.64, "white"); }
ZC("vReel", "vP0", 1.2, -0.25, 0.25, VX - 5, 2.8, "cu"); ZC("vReelHub", "vP0", 0.4, -0.35, 0.35, VX - 5, 2.8, "steel"); BOX("vReelStand", "vP0", VX - 5.6, VX - 4.4, 1.58, 1.7, -0.5, 0.5, "dark");
P({ id: "vStrip", layer: "vP1", shape: "box", size: [2.8, 0.04, 0.8], pos: [VX, 1.62, 0], at: [[0, 0, -0.6], [0, 0.04, 0.4]], mat: "cu" }); P({ id: "vStripLead", layer: "vP1", shape: "box", size: [0.08, 0.06, 0.6], pos: [VX, 1.67, 0.4], at: Array.from({ length: 10 }, (_, i) => [R2(-1.2 + i * 0.27), 0, 0]), mat: "cuHi" });
VC("vJar", "vP2", 0.9, 1.58, 3.2, "glass", { x: VX + 5, z: 0 }); VC("vJarLid", "vP2", 0.95, 3.2, 3.45, "dark", { x: VX + 5, z: 0 });
P({ id: "vPellet", layer: "vP2", shape: "cyl", size: [0.28, 0.4], rot: V, pos: [VX + 5, 1.8, 0], at: [[-0.35, 0, -0.3], [0.35, 0, -0.3], [0, 0, 0.35], [-0.2, 0.42, 0], [0.25, 0.42, 0.1], [0, 0.84, -0.1], [0.3, 0.84, 0.35]], mat: "emc" });

// ═════ 站 F：覆晶預告（晶片自己長凸塊、翻面倒扣到基板） ═════
const FX = 222;
LAY("fSub", [6, 1, FX, 0.8]); BOX("fsStand", "fSub", FX - 3.2, FX + 3.2, 0, 0.6, -3.2, 3.2, "darker"); BOX("fsSub", "fSub", FX - 3, FX + 3, 0.6, 0.95, -3, 3, "sub");
P({ id: "fsPad", layer: "fSub", shape: "cyl", size: [0.12, 0.02], rot: V, pos: [0, 0.96, 0], at: grid(7, 7, 0.32, 0.32, FX, 0, 0), mat: "padGold" });
P({ id: "fsBall", layer: "fSub", shape: "sphere", size: [0.18], pos: [0, 0.4, 0], at: grid(6, 6, 0.9, 0.9, FX, 0, 0).map(([x, y, z]) => [x, y, z]), mat: "solder" });
LAY("fChip", [2.6, 0.6, FX, 3.2]);
BOX("fcDie", "fChip", FX - 1.2, FX + 1.2, 3.0, 3.3, -1.2, 1.2, "chip"); BOX("fcFace", "fChip", FX - 1.15, FX + 1.15, 3.3, 3.31, -1.15, 1.15, "chipTop");
P({ id: "fcBump", layer: "fChip", shape: "sphere", size: [0.09], pos: [0, 3.36, 0], at: grid(7, 7, 0.32, 0.32, FX, 0, 0), mat: "solderHi" });

// ═════ 動作 ═════
actions.lChipGlow = { type: "pulse", _說明: "第 1 幕：光著的晶片（沒有外殼）一閃一閃", parts: ["lChip", "lChipTop"], color: "lampY", glow: 0.6, freq: 1.1, halo: 0 };
actions.ppFlySpin = { type: "rotate", _說明: "沖壓機飛輪＋曲軸轉（馬達經皮帶帶動，起轉加速）", parts: ["ppFly", "ppFlyHub", "ppFlyMark", "ppCrank", "ppCrankPin"], axis: [0, 0, 1], pivot: [PX, 5.4, -2.1], rps: 0.9, rampSpin: true };
const spray = (x) => ({ type: "flow", layer: "pEtch", path: [[EXX + x, 2.6, 0], [EXX + x, 1.3, 0]], n: 4, lanes: 3, laneDir: [0, 0, 1], laneGap: 0.5, size: 0.07, shape: "dot", rate: 1.4, color: "waterC", track: false, accel: true, free: true, jitter: 0.05 });
for (const [i, x] of [-2, -1, 0, 1, 2].entries()) actions[`peSpray${i}`] = { ...spray(x), ...(i === 0 ? { _說明: "蝕刻藥水從噴嘴往下噴（受重力加速）" } : {}), phase: i * 0.2 };
actions.mHeatGlow = { type: "pulse", _說明: "模具加熱棒發紅（約 175 度，示意）", parts: ["mlHeat", "muHeat"], color: "emcHot", glow: 0.9, freq: 0.8, halo: 0 };
actions.mPelHot = { type: "pulse", _說明: "料餅在料筒裡受熱變軟", parts: ["mPel0b", "mPel1b", "mPel2b"], color: "emcHot", glow: 0.6, freq: 1.2, halo: 0 };
actions.mFlowL = { type: "flow", _說明: "軟化的膠從料筒沿流道往左右模穴流（示意）", layer: "mLow", path: [[60, 1.6, -0.1], [60, 2.1, -0.1], [58.6, 2.1, -0.1], [57.6, 2.1, -0.1]], n: 5, size: 0.07, shape: "dot", rate: 0.6, color: "emcHot", track: false, free: true, jitter: 0.03 };
actions.mFlowR = { type: "flow", layer: "mLow", path: [[60, 1.6, -0.1], [60, 2.1, -0.1], [61.4, 2.1, -0.1], [62.4, 2.1, -0.1]], n: 5, size: 0.07, shape: "dot", rate: 0.6, color: "emcHot", track: false, free: true, jitter: 0.03 };
actions.qRain = { type: "flow", _說明: "水滴受重力落到外殼、彈開滑落（不滲進去）", layer: "qBody", path: [[QX - 1.0, 6.0, 0.6], [QX - 1.0, 3.05, 0.6], [QX - 0.4, 3.5, 0.9], [QX + 0.6, 3.05, 1.3], [QX + 1.8, 3.05, 1.6]], n: 4, lanes: 3, laneDir: [1, 0, -1], laneGap: 1.1, size: 0.12, shape: "dot", rate: 0.5, color: "waterC", track: false, accel: true, free: true, jitter: 0.03 };
actions.bReflow = { type: "pulse", _說明: "回焊：錫球受熱發亮、變圓接合", parts: Array.from({ length: 8 }, (_, i) => `bbBall${i}`), color: "lampY", glow: 0.7, freq: 1.2, halo: 0 };
// 熱循環：電路板受熱伸長比封裝多 → 錫點被剪成來回擺（頂端固定在封裝、底端跟電路板走）
const thermal = (pre, cx, amp, deg, hot) => {
  actions[`${pre}BoardL`] = { type: "vibrate", _說明: "電路板受熱往兩側伸長（左段往左，示意放大）", parts: idsOf(`${pre}PCBl`), axis: [-1, 0, 0], amp, freq: 0.55 };
  actions[`${pre}BoardR`] = { type: "vibrate", parts: idsOf(`${pre}PCBr`), axis: [1, 0, 0], amp, freq: 0.55 };
  BALLX.forEach((x, i) => { if (Math.abs(x) < 1.3) return; actions[`${pre}Shear${i}`] = { type: "rotate", _說明: "錫點頂端固定在封裝、底端被電路板拉著走＝剪切", parts: [`${pre}Ball${i}`], axis: [0, 0, 1], swing: x < 0 ? -deg : deg, freq: 0.55, pivot: [R2(cx + x), 2.95, 0] }; });
  actions[`${pre}Hot`] = { type: "pulse", parts: ["c", "l", "r"].map((g) => `${pre}Pcb${g}`), color: "emcHot", glow: hot, freq: 0.55, halo: 0 };
};
thermal("t", 150, 0.32, 17, 0.45); thermal("u", 172, 0.08, 4, 0.45);
actions.uDrip = { type: "flow", _說明: "膠從針頭流到封裝邊緣的縫口", layer: "uNeedle", path: [[178.6, 2.3, 0.6], [178.4, 2.1, 0.6]], n: 3, size: 0.09, shape: "dot", rate: 1.2, color: "ufC", track: false, accel: true, free: true, jitter: 0.01 };
actions.uCure = { type: "pulse", _說明: "加熱硬化", parts: UFX.map((_, k) => `uFb${k}`), color: "emcHot", glow: 0.5, freq: 0.9, halo: 0 };
actions.fFlip = { type: "rotate", _說明: "晶片翻面 180 度（加減速）", parts: idsOf("fChip"), axis: [1, 0, 0], pivot: [FX, 3.15, 0], angle: 180, hold: true };

// 標註點
Object.assign(anchors, {
  lChipA: A("lChip", [1.2, 1.41, 1.2], 150, -100), lPadA: A("lLF", [-1.9, 1.05, 1.9], -150, 100), lLeadA: A("lLF", [5.4, 1.05, 0.9], 150, 100), lWireA: A("lWire", [-2.2, 1.9, 0.2], -150, -100),
  pPunchA: A("pRam", [PX + 0.6, 2.6, 0.6], -150, -100), pStripA: A("pStrip", [PX + 3.2, 1.64, 0.5], 150, 100), pEtchA: A("peResist", [EXX + 0.8, 1.29, 0.8], 150, 100), pSprayA: A("pEtch", [EXX + 1, 2.75, 0], 150, -100),
  mPelletA: A("mPellet", [67.6, 2.1, 0.6], -150, -100), mFillerA: A("mFiller", [71.2, 2.6, 1.1], 150, -100), mPotA: A("mLow", [60, 1.6, 0], -150, 100), mCavA: A("mUnit", [57.0, 2.2, -0.05], -150, -100),
  mHeatA: A("mUp", [62.8, 3.5, 0], 150, -100), mWireA: A("mWireS", [64.15, 2.34, -0.05], 150, -100),
  qBodyA: A("qBody", [QX + 2.5, 3.0, 2.5], 150, -100), qBotA: A("qBot", [QX + 3.0, 1.3, 3.9], 150, 100), qChipA: A("qChip", [QX + 1.3, 2.0, 1.3], 150, -100), qLFA: A("qLF", [QX + 4.5, 1.7, 1.2], 150, 100), qDropA: A("qBody", [QX - 1.0, 3.05, 0.6], -150, -100),
  bBallA: A("bB7", [BX + 2.1, 1.75, 1.8], 150, -100), bPCBA: A("bPCB", [BX2 + 3.8, 0.55, 2.0], 150, 100), bMountA: A("bMount", [BX2 + 2.1, 0.75, 2.1], 150, 100),
  tBallA: A("tB5", [154.5, 2.45, 0.6], 150, -100), tCrackA: A("tCrack1", [154.5, 2.86, 0.6], 150, -100), tPcbA: A("tPCBr", [155.5, 1.9, 1.2], 150, 100),
  uNeedleA: A("uNeedle", [178.6, 3.0, 0.6], 150, -100), uFillA: A("uF3", [172, 2.0, 1.15], -150, 100), uBallA: A("uB2", [171.1, 2.45, 0.6], -150, -100),
  vA0: A("vP0", [VX - 5, 3.8, 0.3], -150, -100), vA1: A("vP1", [VX + 0.8, 1.67, 0.4], 150, -100), vA2: A("vP2", [VX + 5, 3.3, 0.6], 150, -100),
  fChipA: A("fChip", [FX + 1.1, 3.3, 1.1], 150, -100), fSubA: A("fSub", [FX + 2.6, 0.95, 2.6], 150, 100),
});

const model = {
  name: "示意 封裝材料：導線架（沖壓、蝕刻）、轉移成型灌封裝膠（料餅、模具剖面、填料放大）、封好的封裝（爆炸分解）、植錫球與焊到電路板、熱循環剪切與底部填充、覆晶預告（示意，非特定廠牌／型號）",
  unit: "示意（放大）",
  size: { w: 40, h: 18, r: 0.6, t: 30 },
  palette, materials,
  partNames: { lLF: "導線架", qBody: "封裝膠", bBalls: "錫球" },
  layers, parts, anchors, actions,
  pose: { yaw0: 0, yawIso: 0, drift: 0 },
  camera: { stand: { d: 70, elev: 24, y: 4 } },
  fx: { dpr: 1, srcPx: 30, shadows: 0, fog: false, dust: false, vaporSprites: false, shimmer: false },
  info: { PX, EXX, MX, QX, BX, BX2, FX, FILL, UFX: UFX.length, VX, PELH: PELH.length },
};
fs.writeFileSync(path.join(HERE, "model.json"), JSON.stringify(model, null, 1) + "\n");
console.log(`✔ model.json：${parts.length} 個零件、${parts.reduce((a, p) => a + Math.max(1, p.at?.length ?? 0), 0)} 個實體、${layers.length} 層`);

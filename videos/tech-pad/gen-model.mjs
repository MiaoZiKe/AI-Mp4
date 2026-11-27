// node videos/tech-pad/gen-model.mjs → 寫 videos/tech-pad/model.json
// 2026/11/27 tech-pad（研磨墊，系列 2 第 17 集）。構造與物理照 physics-spec.md、模組清單照 visual-spec.md。
// 單位：1＝10 cm，地板頂面 y＝0，x 向右、z 向觀眾。站點：
//   A 研磨台（x 0；圓台＋墊子三層＋研磨頭＋噴液臂＋鑽石碟臂）｜W 晶圓剖面（x 18；凸處壓力色、逐步磨低）｜M 墊子顯微剖面（x 38；細孔、溝槽、微凸起、鑽石碟修整）
//   T 新舊墊子厚度對照（x 58）｜H 軟硬墊對照（軟 x 74、硬 x 90）｜V 供應商出貨棧板（x 112）｜N 耗材三件（x 134）
//   外形依專利圖與一般 CMP 機台（示意，非特定廠牌／型號）；不標墊子壽命、硬度、溝槽尺寸數字。
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
const HERE = path.dirname(new URL(import.meta.url).pathname);

const R2 = (x) => Math.round(x * 1000) / 1000;
const D2R = Math.PI / 180;
const pol = (aDeg, r) => [R2(r * Math.cos(aDeg * D2R)), R2(r * Math.sin(aDeg * D2R))]; // (x, z)
let seed = 20261127;
const rnd = () => { seed |= 0; seed = (seed + 0x6d2b79f5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
const palette = {
  floorC: "#C9D2DE", panel: "#F3F5F8", panel2: "#E2E8F0", seam: "#8E9BB0", band: "#24324C", steel: "#7D8CA6", steel2: "#A9B5C7", dark: "#3E4A60",
  glassC: "#BFD3F2", lampY: "#F2B632", lampG: "#2FBF71", lampR: "#E5484D", screen: "#5B8DEF", rubber: "#2B2F36", gold: "#C9A24A", knurl: "#5C6678", estop: "#D93A2B",
  padCreamC: "#F0E2BA", glzShineC: "#FBF9F0", strandC: "#F7D77A", padCreamDC: "#D6C69A", padGlazeC: "#E6DCC4", padOldC: "#A8987A", subC: "#8F95A0", adhC: "#7FB2E0", grooveC: "#5C533C", poreC: "#2F2A20",
  slurryC: "#F8F2E4", pr0: "#E5484D", pr1: "#F28A3C", pr2: "#F4C54E", oxC: "#A9C0E0", siC: "#5E6B82", softC: "#F3E8CD", hardC: "#B58B5A",
  diaC: "#E8F8FF", diaE: "#BFEFFF", niC: "#B5BCC8", quartzC: "#E6F2F6", debrisC: "#3B3427", warnY: "#F2B632", boxGreen: "#2C6E55", cabC: "#EDEFF3", brassC: "#C8A24A",
  cartonC: "#C9A66B", cartonD: "#A9884F", whiteP: "#FFFFFF", markC: "#E8613C", hotC: "#E5602B", edgeC: "#F4FAFF", yellowBr: "#F2B632",
};
const M = (kind, color, o = {}) => ({ kind, color, ...o });
const glowM = (c, op, ei = 1) => M("std", c, { emissive: c, ei, opacity: op, rough: 1, metal: 0 });
const materials = {
  floor: M("std", "floorC", { rough: 0.7, metal: 0.3, tex: "brushed", texScale: 3 }),
  panel: M("std", "panel", { rough: 0.55, metal: 0.05, env: 0.25 }), panel2: M("std", "panel2", { rough: 0.6, metal: 0.05, env: 0.2 }),
  seam: M("std", "seam", { rough: 0.6, metal: 0.3 }), band: M("std", "band", { rough: 0.4, metal: 0.3, env: 0.4 }),
  steel: M("std", "steel", { rough: 0.35, metal: 0.85, env: 0.5 }), steel2: M("std", "steel2", { rough: 0.3, metal: 0.8, env: 0.6, tex: "brushed", texScale: 2 }),
  dark: M("std", "dark", { rough: 0.5, metal: 0.4, env: 0.3 }), rubber: M("std", "rubber", { rough: 0.9, metal: 0 }), gold: M("std", "gold", { rough: 0.3, metal: 0.9, env: 0.8 }),
  window: M("phys", "glassC", { rough: 0.05, metal: 0, clearcoat: 1, opacity: 0.25, env: 0.6 }),
  lampY: M("std", "lampY", { emissive: "lampY", ei: 0.4, rough: 0.4, metal: 0 }), lampG: M("std", "lampG", { emissive: "lampG", ei: 0.35, rough: 0.4, metal: 0 }),
  lampR: M("std", "lampR", { emissive: "lampR", ei: 0.3, rough: 0.4, metal: 0 }), estop: M("std", "estop", { rough: 0.4, metal: 0, emissive: "estop", ei: 0.15 }),
  screen: M("std", "screen", { emissive: "screen", ei: 0.5, rough: 0.3, metal: 0 }),
  padCream: M("std", "padCreamC", { rough: 0.92, metal: 0, env: 0.1 }), padCreamD: M("std", "padCreamDC", { rough: 0.95, metal: 0 }), padGlaze: M("std", "padGlazeC", { rough: 0.22, metal: 0.1, env: 0.6 }), padGlazeShine: M("std", "glzShineC", { rough: 0.08, metal: 0.35, env: 1.0, emissive: "glzShineC", ei: 0.3 }), strand: M("std", "strandC", { rough: 0.4, metal: 0, emissive: "strandC", ei: 0.45 }),
  padOld: M("std", "padOldC", { rough: 0.95, metal: 0 }), subpad: M("std", "subC", { rough: 1, metal: 0 }), adh: M("phys", "adhC", { rough: 0.3, metal: 0, clearcoat: 0.6, opacity: 0.85, env: 0.5 }),
  groove: M("std", "grooveC", { rough: 1, metal: 0 }), pore: M("std", "poreC", { rough: 1, metal: 0 }),
  slurryF: M("phys", "slurryC", { rough: 0.05, metal: 0, clearcoat: 1, opacity: 0.38, env: 0.6 }), slurryM: M("phys", "slurryC", { rough: 0.05, metal: 0, clearcoat: 1, opacity: 0.55, env: 0.6 }),
  slurryDot: glowM("slurryC", 0.95, 0.5),
  pr0: M("std", "pr0", { emissive: "pr0", ei: 0.55, rough: 0.5, metal: 0.1 }), pr1: M("std", "pr1", { emissive: "pr1", ei: 0.45, rough: 0.5, metal: 0.1 }), pr2: M("std", "pr2", { emissive: "pr2", ei: 0.35, rough: 0.5, metal: 0.1 }),
  ox: M("phys", "oxC", { rough: 0.2, metal: 0.1, clearcoat: 0.8, opacity: 0.9, env: 0.7 }), oxHot: M("phys", "pr2", { rough: 0.3, metal: 0.1, opacity: 0.9, emissive: "pr2", ei: 0.25 }),
  si: M("std", "siC", { rough: 0.35, metal: 0.55, env: 0.7 }),
  soft: M("std", "softC", { rough: 0.95, metal: 0 }), hard: M("std", "hardC", { rough: 0.8, metal: 0.05, env: 0.2 }),
  dia: M("std", "diaC", { rough: 0.05, metal: 0.2, env: 1.3, emissive: "diaE", ei: 0.45 }), ni: M("std", "niC", { rough: 0.3, metal: 0.9, env: 0.7, tex: "brushed", texScale: 1.6 }),
  quartz: M("phys", "quartzC", { rough: 0.05, metal: 0, clearcoat: 1, opacity: 0.6, env: 0.8 }), debris: M("std", "debrisC", { rough: 0.9, metal: 0.1 }), debrisDot: glowM("debrisC", 0.95, 0.1),
  warnY: M("std", "warnY", { rough: 0.5, metal: 0, emissive: "warnY", ei: 0.2 }), boxGreen: M("std", "boxGreen", { rough: 0.5, metal: 0.1 }),
  cab: M("std", "cabC", { rough: 0.55, metal: 0.1, env: 0.3 }), brass: M("std", "brassC", { rough: 0.3, metal: 0.9, env: 0.7 }),
  carton: M("std", "cartonC", { rough: 0.95, metal: 0 }), cartonD: M("std", "cartonD", { rough: 0.95, metal: 0 }), white: M("std", "whiteP", { rough: 0.7, metal: 0 }),
  mark: M("std", "markC", { rough: 0.5, metal: 0, emissive: "markC", ei: 0.25 }), hotGlow: glowM("hotC", 0.9, 0.9), edge: glowM("edgeC", 0.95, 0.5),
  bracket: M("std", "yellowBr", { rough: 0.5, metal: 0, emissive: "yellowBr", ei: 0.35 }),
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
const idsOf = (layer) => parts.filter((q) => q.layer === layer).map((q) => q.id);

// ═════ 地板 ═════
LAY("floor", [240, 2, 60, 0], true);
P({ id: "floor", layer: "floor", shape: "slab", size: [260, 0.5, 44], r: 0.2, pos: [60, -0.25, 0], mat: "floor" });
P({ id: "floorSeam", layer: "floor", shape: "slab", size: [260, 0.04, 0.1], pos: [60, 0.01, 0], at: Array.from({ length: 7 }, (_, i) => [0, 0, -16 + i * 5.3]), mat: "seam" });

// ═════ 站 A：CMP 機台檯面（deck）＋研磨圓台（platen）＋墊子三層＋研磨頭＋橫樑＋噴液臂＋鑽石碟臂 ═════
const PADR = 4.2, PLR = 4.4, Y_PL = 2.0, Y_ADH = 2.03, Y_SUB = 2.2, Y_TOP = 2.38;
LAY("deck", [16, 2, 0, 0.8]);
BOX("deckBase", "deck", -7.8, 7.8, 0, 1.5, -6.8, 6.8, "band");
BOX("deckTop", "deck", -7.8, 7.8, 1.5, 1.6, -6.8, 6.8, "panel2");
VT("splash", "deck", 5.3, 5.05, 1.6, 2.45, "panel"); VT("splashLip", "deck", 5.4, 5.25, 2.4, 2.5, "steel2");
VC("drainPan", "deck", 5.05, 1.6, 1.64, "dark");
P({ id: "deckSeam", layer: "deck", shape: "box", size: [0.05, 1.42, 0.05], pos: [0, 0.8, 6.82], at: [[-5.2, 0, 0], [0, 0, 0], [5.2, 0, 0]], mat: "seam" });
BOX("deckDoorL", "deck", -7.3, -0.3, 0.3, 1.3, 6.8, 6.86, "panel"); BOX("deckDoorR", "deck", 0.3, 7.3, 0.3, 1.3, 6.8, 6.86, "panel");
P({ id: "deckHandle", layer: "deck", shape: "box", size: [0.12, 0.6, 0.14], pos: [-0.6, 0.8, 6.95], at: [[0, 0, 0], [1.2, 0, 0]], mat: "steel2" });
BOX("deckScreen", "deck", -6.6, -4.2, 1.0, 1.25, 6.86, 6.9, "screen");
P({ id: "deckLed", layer: "deck", shape: "sphere", size: [0.08], pos: [-3.6, 1.12, 6.9], at: [[0, 0, 0], [0.4, 0, 0], [0.8, 0, 0]], mat: "lampG" });
BOX("deckEstop", "deck", 4.9, 5.4, 1.0, 1.3, 6.86, 7.0, "estop");
BOX("deckWarn", "deck", 5.7, 7.0, 0.45, 0.85, 6.86, 6.9, "warnY");
for (let i = 0; i < 6; i++) BOX(`deckVent${i}`, "deck", 2.4, 4.4, 0.35 + i * 0.12, 0.4 + i * 0.12, 6.86, 6.9, "dark");
P({ id: "deckScrew", layer: "deck", shape: "cyl", size: [0.07, 0.04], rot: V, pos: [0, 1.62, 0], at: [[-7.2, 0, -6.3], [7.2, 0, -6.3], [-7.2, 0, 6.3], [7.2, 0, 6.3], [-7.2, 0, 0], [7.2, 0, 0]], mat: "steel" });
VT("drainPort", "deck", 0.35, 0.25, 1.62, 1.95, "steel2", { x: 4.9, z: 3.4 }); PIPE("drainHose", "deck", [[4.9, 1.62, 3.4], [4.9, 1.0, 3.4], [7.9, 1.0, 3.4]], 0.17, "steel");
// 圓台（platen）：旋轉件。鋁合金盤、邊環、螺栓圈、冷卻水路、中心軸蓋、定位銷、紅色刻度（讓旋轉看得見）
LAY("platen", [9, 0.6, 0, 1.8]);
VC("plDisc", "platen", PLR, 1.6, Y_PL, "steel2"); VT("plRim", "platen", PLR + 0.08, PLR - 0.06, 1.62, 1.75, "dark");
P({ id: "plBolt", layer: "platen", shape: "cyl", size: [0.08, 0.05], rot: V, pos: [0, Y_PL + 0.02, 0], at: RING(24, 3.9), mat: "steel" });
for (const r of [1.4, 2.1, 2.8, 3.4]) VT(`plCool${r * 10}`, "platen", r + 0.06, r - 0.06, Y_PL, Y_PL + 0.012, "dark");
VC("plHub", "platen", 0.75, Y_PL, Y_PL + 0.08, "steel"); P({ id: "plHubBolt", layer: "platen", shape: "cyl", size: [0.07, 0.04], rot: V, pos: [0, Y_PL + 0.1, 0], at: RING(6, 0.5), mat: "dark" });
P({ id: "plPin", layer: "platen", shape: "cyl", size: [0.07, 0.07], rot: V, pos: [0, Y_PL + 0.04, 0], at: RING(3, 2.4, 30), mat: "gold" });
BOX("plNotch", "platen", 3.7, 4.38, 1.62, 1.98, -0.16, 0.16, "mark");
P({ id: "plTick", layer: "platen", shape: "box", size: [0.1, 0.02, 0.1], pos: [0, 1.99, 0], at: RING(12, 4.25), mat: "dark" });
// 墊子三層（rotate 一起轉）：背膠（淡藍，邊緣一條拉環）、子墊（灰泡綿）、研磨層（淡奶油，同心溝槽＋放射溝＋細孔＋終點偵測窗）；
// 舊墊（oPad*）是同一組的「用久」版本（顏色較深、溝槽淺），換墊時才出現、不隨圓台轉（避免旋轉鏈與撕起互相牽連）
const pores = []; for (let i = 0; i < 160; i++) { const r = 0.7 + 3.4 * Math.sqrt(rnd()), a = rnd() * 360, [x, z] = pol(a, r); pores.push([x, 0, z]); }
const buildPad = (pre, worn) => {
  const A1 = pre ? pre + "PadAdh" : "padAdh", S1 = pre ? pre + "PadSub" : "padSub", T1 = pre ? pre + "PadTop" : "padTop", tm = worn ? "padOld" : "padCream", top = Y_TOP - (worn ? 0.1 : 0);
  LAY(A1, [8.6, 0.2, 0, 2.0]); LAY(S1, [8.6, 0.3, 0, 2.1]); LAY(T1, [8.6, 0.3, 0, 2.3]);
  VC(`${pre}adhDisc`, A1, PADR, Y_PL, Y_ADH, "adh"); BOX(`${pre}adhTab`, A1, 3.9, 4.8, Y_PL, Y_ADH, -0.5, 0.5, "adh");
  VC(`${pre}subDisc`, S1, PADR, Y_ADH, Y_SUB, "subpad");
  P({ id: `${pre}subCell`, layer: S1, shape: "sphere", size: [0.03], pos: [0, 0, 0], at: RING(40, PADR - 0.01, 3).map(([x, , z], i) => [x, Y_ADH + 0.05 + (i % 3) * 0.04, z]), mat: "dark" });
  VC(`${pre}topDisc`, T1, PADR, Y_SUB, top, tm); VT(`${pre}topChamfer`, T1, PADR, PADR - 0.12, top - 0.015, top, worn ? "padOld" : "padCreamD");
  for (let i = 0; i < 7; i++) { const r = 0.9 + i * 0.5; VT(`${pre}topGroove${i}`, T1, r + 0.05, r - 0.05, top - 0.012, top + 0.004, "groove"); }
  for (let i = 0; i < 6; i++) { const a = i * 60 + 10, [cx, cz] = pol(a, 2.5); P({ id: `${pre}topRadial${i}`, layer: T1, shape: "box", size: [3.1, 0.016, 0.1], pos: [cx, top - 0.004, cz], rot: [0, -a, 0], mat: "groove" }); }
  P({ id: `${pre}topPore`, layer: T1, shape: "cyl", size: [0.035, 0.006], rot: V, pos: [0, top + 0.002, 0], at: pores, mat: "pore" });
  { const [wx, wz] = pol(215, 2.55); P({ id: `${pre}topWinFrame`, layer: T1, shape: "box", size: [1.0, 0.014, 0.62], pos: [wx, top + 0.001, wz], rot: [0, -215, 0], mat: "dark" }); P({ id: `${pre}topWin`, layer: T1, shape: "box", size: [0.84, 0.02, 0.46], pos: [wx, top + 0.003, wz], rot: [0, -215, 0], mat: "window" }); }
  BOX(`${pre}topMark`, T1, 3.7, 4.05, top - 0.004, top + 0.01, -0.07, 0.07, "mark");
  if (worn) P({ id: `${pre}topCrumb`, layer: T1, shape: "sphere", size: [0.05], pos: [0, top + 0.02, 0], at: RING(14, 3.6, 7), mat: "debris" });
};
buildPad("", false); buildPad("o", true);
// 研磨液薄膜（半透明，貼在墊面）
LAY("film", [8.2, 0.1, 0, 2.4]); VC("slFilm", "film", 3.9, Y_TOP, Y_TOP + 0.014, "slurryF");
// 研磨頭（carrier head）：固定環＋晶圓＋氣囊分區＋本體＋旋轉軸＋旋轉接頭＋氣管＋馬達＋滑座（沿橫樑滑動、自轉、小幅來回擺）
const HX0 = 2.4;
LAY("head", [4.2, 7.0, HX0, 5.4]);
VT("hdRing", "head", 1.74, 1.5, Y_TOP, 2.95, "dark", { x: HX0 }); VT("hdRingEdge", "head", 1.75, 1.7, 2.9, 2.96, "steel2", { x: HX0 });
VC("hdWafer", "head", 1.49, Y_TOP + 0.01, Y_TOP + 0.06, "steel2", { x: HX0 }); BOX("hdNotch", "head", HX0 + 1.38, HX0 + 1.52, Y_TOP + 0.02, Y_TOP + 0.07, -0.1, 0.1, "dark");
VC("hdMembrane", "head", 1.5, 2.95, 3.05, "window", { x: HX0 });
for (const r of [0.45, 0.9, 1.3]) VT(`hdZone${r * 100}`, "head", r + 0.03, r - 0.03, 2.95, 3.05, "edge", { x: HX0 });
VC("hdBody", "head", 1.72, 3.05, 3.85, "steel2", { x: HX0 }); VT("hdFlange", "head", 1.8, 1.5, 3.8, 3.95, "steel", { x: HX0 });
P({ id: "hdBolt", layer: "head", shape: "cyl", size: [0.07, 0.07], rot: V, pos: [HX0, 3.98, 0], at: RING(12, 1.62), mat: "dark" });
BOX("hdPlate", "head", HX0 - 0.7, HX0 + 0.7, 3.2, 3.5, 1.7, 1.78, "gold"); BOX("hdWarn", "head", HX0 - 0.6, HX0 + 0.6, 3.55, 3.75, 1.7, 1.76, "warnY");
VC("hdCap", "head", 1.2, 3.95, 4.3, "steel", { x: HX0 });
VC("hdShaft", "head", 0.42, 4.3, 6.4, "steel2", { x: HX0 }); VT("hdUnion", "head", 0.62, 0.42, 4.9, 5.4, "dark", { x: HX0 });
P({ id: "hdAirMark", layer: "head", shape: "box", size: [0.1, 0.5, 0.1], pos: [HX0 + 0.45, 5.8, 0], mat: "mark" });
VC("hdMotor", "head", 0.8, 6.4, 7.35, "dark", { x: HX0 }); VT("hdMotorFin", "head", 0.86, 0.78, 6.5, 7.25, "steel2", { x: HX0 });
BOX("hdTrolley", "head", HX0 - 1.1, HX0 + 1.1, 7.35, 7.85, -0.7, 0.7, "steel");
P({ id: "hdWheel", layer: "head", shape: "cyl", size: [0.18, 0.12], pos: [HX0, 7.65, 0], at: [[-0.8, 0, 0.78], [0.8, 0, 0.78], [-0.8, 0, -0.78], [0.8, 0, -0.78]], mat: "dark" });
PIPE("hdAir", "head", [[HX0 + 0.45, 5.15, 0], [HX0 + 1.2, 5.15, 0], [HX0 + 1.2, 6.9, 0]], 0.08, "pipeBlue");
// 橫樑與立柱（站在檯面後方、不動）：研磨頭沿橫樑滑開
LAY("gantry", [14, 8, 4, 4]);
BOX("gtBeam", "gantry", -1.8, 12.4, 7.85, 8.55, -0.8, 0.8, "panel"); BOX("gtRail", "gantry", -1.6, 12.2, 7.78, 7.88, -0.15, 0.15, "steel2");
BOX("gtPost", "gantry", 11.2, 12.6, 1.6, 8.55, -0.8, 0.8, "panel"); BOX("gtFoot", "gantry", 10.6, 13.2, 1.5, 1.9, -1.4, 1.4, "band");
P({ id: "gtBolt", layer: "gantry", shape: "cyl", size: [0.07, 0.04], rot: V, pos: [0, 1.92, 0], at: [[10.9, 0, -1.1], [12.9, 0, -1.1], [10.9, 0, 1.1], [12.9, 0, 1.1]], mat: "steel" });
BOX("gtCover", "gantry", 3, 9.6, 8.2, 8.6, -0.5, -0.4, "dark"); SPH("gtLed", "gantry", 0.08, 11.9, 6.0, 0.82, "lampG");
// 噴液臂（研磨液入口）：白色管、彎頭、閥盒、噴嘴
LAY("slurry", [7, 4.6, 3.8, 4.0]);
PIPE("slArm", "slurry", [[6.2, 1.62, -5.8], [6.2, 4.4, -5.8], [1.4, 4.4, -5.8], [1.4, 4.4, -3.6], [1.4, 3.35, -3.6]], 0.16, "white");
BOX("slValve", "slurry", 5.7, 6.7, 2.4, 3.2, -6.3, -5.3, "steel2"); VC("slNozzle", "slurry", 0.1, 3.0, 3.38, "steel", { x: 1.4, z: -3.6 }); VT("slClamp", "slurry", 0.24, 0.16, 4.0, 4.2, "dark", { x: 6.2, z: -5.8 });
// 鑽石碟（修整器）臂：立柱＋馬達＋臂＋氣缸＋鑽石碟；臂繞立柱來回掃過墊面、碟自轉
const CPX = -5.4, CPZ = -3.6, ARML = 5.0, A0 = 33.7, CDX = R2(CPX + ARML * Math.cos(A0 * D2R)), CDZ = R2(CPZ + ARML * Math.sin(A0 * D2R));
LAY("condPost", [3, 3, CPX, 2.4]); LAY("cond", [7, 3, -3, 3.0]);
VC("cpBase", "condPost", 0.9, 1.6, 1.8, "band", { x: CPX, z: CPZ }); VC("cpPost", "condPost", 0.6, 1.8, 3.0, "steel2", { x: CPX, z: CPZ });
P({ id: "cpBolt", layer: "condPost", shape: "cyl", size: [0.06, 0.04], rot: V, pos: [CPX, 1.82, CPZ], at: RING(6, 0.74), mat: "steel" });
VC("cdMotor", "cond", 0.62, 3.0, 3.75, "dark", { x: CPX, z: CPZ }); VT("cdMotorFin", "cond", 0.67, 0.6, 3.1, 3.65, "steel2", { x: CPX, z: CPZ });
{ const mx = R2(CPX + 2.5 * Math.cos(A0 * D2R)), mz = R2(CPZ + 2.5 * Math.sin(A0 * D2R));
  P({ id: "cdArm", layer: "cond", shape: "box", size: [5.3, 0.36, 0.48], pos: [R2(CPX + 2.65 * Math.cos(A0 * D2R)), 3.3, R2(CPZ + 2.65 * Math.sin(A0 * D2R))], rot: [0, -A0, 0], mat: "panel" });
  P({ id: "cdArmStripe", layer: "cond", shape: "box", size: [4.4, 0.04, 0.1], pos: [mx, 3.5, mz], rot: [0, -A0, 0], mat: "steel2" });
  P({ id: "cdArmLed", layer: "cond", shape: "sphere", size: [0.07], pos: [R2(CPX + 1.5 * Math.cos(A0 * D2R)), 3.42, R2(CPZ + 1.5 * Math.sin(A0 * D2R))], mat: "lampG" }); }
VC("cdCyl", "cond", 0.36, 2.52, 3.3, "steel2", { x: CDX, z: CDZ }); VC("cdCap", "cond", 0.42, 3.1, 3.4, "dark", { x: CDX, z: CDZ });
VC("cdPlate", "cond", 0.9, Y_TOP, 2.5, "ni", { x: CDX, z: CDZ }); VT("cdRing", "cond", 0.95, 0.82, 2.5, 2.58, "steel2", { x: CDX, z: CDZ });
P({ id: "cdGrainRim", layer: "cond", shape: "sphere", size: [0.06], pos: [CDX, Y_TOP + 0.01, CDZ], at: RING(36, 0.86), mat: "dia" });
P({ id: "cdGrainIn", layer: "cond", shape: "sphere", size: [0.06], pos: [CDX, Y_TOP + 0.01, CDZ], at: RING(22, 0.55, 5), mat: "dia" });
BOX("cdMark", "cond", CDX + 0.6, CDX + 0.85, 2.5, 2.6, CDZ - 0.06, CDZ + 0.06, "mark");
PIPE("cdAir", "cond", [[CDX + 0.2, 3.25, CDZ], [CDX + 0.2, 3.6, CDZ]], 0.06, "pipeBlue");
materials.pipeBlue = M("std", "#3E7BD6", { rough: 0.35, metal: 0.6, env: 0.4 });

// ═════ 站 W：晶圓剖面（s3）＝倒扣的晶圓（矽、氧化層、向下的凸起）壓在研磨墊上；凸處壓力大先被磨低 ═════
const WX = 18, WZ = 1.6, WAFX0 = 12.5, WAFX1 = 23.5, WPADTOP = 1.85, WH = [1.0, 0.5, 0.2, 0], WT = [0.3, 0.28, 0.26, 0.25];
LAY("wPlinth", [15, 1, WX, 0.5]);
BOX("wPl", "wPlinth", 10.5, 25.5, 0, 0.9, -3.0, 3.0, "band"); BOX("wPlTop", "wPlinth", 10.5, 25.5, 0.9, 1.0, -3.0, 3.0, "panel2");
P({ id: "wPlScrew", layer: "wPlinth", shape: "cyl", size: [0.06, 0.04], rot: V, pos: [0, 1.02, 0], at: [[11, 0, -2.6], [25, 0, -2.6], [11, 0, 2.6], [25, 0, 2.6]], mat: "steel" });
LAY("wPad", [13, 1, WX, 1.4]);
BOX("wSub", "wPad", 11.5, 24.5, 1.0, 1.4, -2.0, 2.0, "subpad"); BOX("wTop", "wPad", 11.5, 24.5, 1.4, WPADTOP, -2.0, 2.0, "padCream");
{ const dots = []; for (let i = 0; i < 30; i++) dots.push([R2(11.8 + rnd() * 12.4), R2(1.46 + rnd() * 0.32), 2.005]); const dd = dots.map(([x, y, z]) => [x, y, z]);
  P({ id: "wPore", layer: "wPad", shape: "cyl", size: [0.07, 0.012], pos: [0, 0, 0], at: dd, mat: "pore" }); }
P({ id: "wPoreTop", layer: "wPad", shape: "cyl", size: [0.05, 0.01], rot: V, pos: [0, WPADTOP + 0.002, 0], at: Array.from({ length: 22 }, () => [R2(11.8 + rnd() * 12.4), 0, R2(-1.8 + rnd() * 3.6)]), mat: "pore" });
const WB = [[14.2, 1.0], [16.3, 0.7], [18.0, 1.4], [20.6, 0.8], [22.3, 1.0]];
for (let k = 0; k < 4; k++) { LAY(`wOx${k}`, [11, 0.5, WX, 2.9]); BOX(`wOxB${k}`, `wOx${k}`, WAFX0, WAFX1, R2(WPADTOP + WH[k]), R2(WPADTOP + WH[k] + WT[k]), -WZ, WZ, k === 0 ? "ox" : "ox"); }
for (let k = 0; k < 3; k++) { LAY(`wB${k}`, [11, 0.6, WX, 2.1]); WB.forEach(([x, w], i) => BOX(`wBump${k}_${i}`, `wB${k}`, R2(x - w / 2), R2(x + w / 2), WPADTOP, R2(WPADTOP + WH[k]), -WZ, WZ, `pr${k}`)); }
LAY("wSi", [11, 1, WX, 3.2]);
BOX("wSiSlab", "wSi", WAFX0, WAFX1, 3.15, 3.95, -WZ, WZ, "si"); BOX("wHeadPlate", "wSi", WAFX0 - 0.3, WAFX1 + 0.3, 3.95, 4.25, -WZ - 0.2, WZ + 0.2, "dark");
P({ id: "wArrow", layer: "wSi", shape: "cyl", size: [0.09, 0.8], rot: V, pos: [0, 4.65, 0], at: [[14.2, 0, 0], [16.9, 0, 0], [19.6, 0, 0], [22.3, 0, 0]], mat: "mark" });
P({ id: "wArrowHead", layer: "wSi", shape: "cyl", size: [0.22, 0.14], rot: V, pos: [0, 4.32, 0], at: [[14.2, 0, 0], [16.9, 0, 0], [19.6, 0, 0], [22.3, 0, 0]], mat: "mark" });
P({ id: "wSiNotch", layer: "wSi", shape: "box", size: [0.3, 0.8, 0.06], pos: [0, 3.55, WZ + 0.02], at: [[13.2, 0, 0], [22.8, 0, 0]], mat: "dark" });
// 剖面標尺：左側黃色括弧（標凸處磨掉的量）
// ═════ 站 M：墊子顯微剖面（s2 局部放大、s4～s6）＝研磨層（三塊陸地、兩條溝槽、細孔開在墊面）＋子墊＋微凸起（新／磨滑／重新刷粗）＋鑽石碟修整頭 ═════
// r1（2026/11/27 審查）：橫向縮窄、縱向加高，讓剖面站撐滿主畫面；磨滑＝平滑發亮的頂面（和尖齒一眼分得出）；細孔開在墊面、孔裡卡磨粒；
// 修整頭降到貼墊面，一塊一塊掃過（每塊陸地被蓋住時是磨滑、頭離開後變尖齒）。
const MX = 38, MZ = 2.2, LANDS = [[33.2, 35.8], [36.7, 39.3], [40.2, 42.8]], LY0 = 1.6, LTOP = 3.0, TX = 38.0;
LAY("mPlinth", [12, 1, MX, 0.5]);
BOX("mPl", "mPlinth", 32.0, 44.0, 0, 0.9, -3.2, 3.2, "band"); BOX("mPlTop", "mPlinth", 32.0, 44.0, 0.9, 1.0, -3.2, 3.2, "panel2");
LAY("mBase", [11, 1, MX, 1.3]); BOX("mSub", "mBase", 32.8, 43.2, 1.0, LY0, -MZ, MZ, "subpad");
{ const cells = []; for (let i = 0; i < 22; i++) cells.push([R2(33.0 + rnd() * 10.0), R2(1.08 + rnd() * 0.42), MZ + 0.006]); P({ id: "mSubCell", layer: "mBase", shape: "cyl", size: [0.05, 0.01], pos: [0, 0, 0], at: cells, mat: "dark" }); }
BOX("mAdhLine", "mBase", 32.8, 43.2, 1.0, 1.06, -MZ - 0.01, MZ + 0.01, "adh");
// 細孔：靠近墊面（頂邊）的圓孔，一塊陸地 4 個（其中第 3 個＝抓磨粒的孔）＋中下段 3 個較小的孔（剖面裡的內部孔隙）
const PORE_DX = [-0.95, -0.3, 0.35, 0.95], PORE_DY = [0.0, 0.07, 0.03, 0.1], poreXY = [], poreIn = [];
LANDS.forEach(([a, b], i) => { const c = (a + b) / 2; PORE_DX.forEach((dx, k) => poreXY.push([R2(c + dx), R2(LTOP - 0.19 - PORE_DY[k])])); [[-0.6, 0.55], [0.1, 0.95], [0.75, 0.62]].forEach(([dx, dy]) => poreIn.push([R2(c + dx), R2(LTOP - 0.19 - dy - 0.3)])); });
LANDS.forEach(([a, b], i) => { LAY(`mLand${i}`, [R2(b - a), 1.4, R2((a + b) / 2), 2.3]); BOX(`mLandB${i}`, `mLand${i}`, a, b, LY0, LTOP, -MZ, MZ, "padCream");
  P({ id: `mLandPore${i}`, layer: `mLand${i}`, shape: "cyl", size: [0.18, 0.02], pos: [0, 0, 0], at: poreXY.slice(i * 4, i * 4 + 4).map(([x, y]) => [x, y, MZ + 0.012]), mat: "pore" });
  P({ id: `mLandPoreIn${i}`, layer: `mLand${i}`, shape: "cyl", size: [0.1, 0.02], pos: [0, 0, 0], at: poreIn.slice(i * 3, i * 3 + 3).map(([x, y]) => [x, y, MZ + 0.012]), mat: "pore" }); });
// 磨粒：卡在細孔裡（每塊陸地第 1、3 個孔各一顆，亮白球，露出孔口）
LAY("mGrains", [11, 1.4, MX, 2.3]); P({ id: "mGrain", layer: "mGrains", shape: "sphere", size: [0.085], pos: [0, 0, MZ + 0.05], at: poreXY.filter((_, i) => i % 4 === 0 || i % 4 === 2).map(([x, y]) => [x, R2(y + 0.02), 0]), mat: "slurryDot" });
LAY("mSlurry", [2, 1, MX, 2.0]); [[35.8, 36.7], [39.3, 40.2]].forEach(([a, b], i) => BOX(`mSlurryB${i}`, "mSlurry", a, b, LY0, 2.7, -MZ, MZ, "slurryM"));
// 微凸起（沿 z 拉長的三角齒）：F 新（尖）、R 重新刷粗（尖）；磨滑 G＝平滑發亮的薄片（沒有齒）
const teeth = (w, kind, ph) => { const pitch = 0.3, n = Math.floor(w / pitch), pts = [[-w / 2, -0.03]];
  for (let i = 0; i < n; i++) { const x0 = -w / 2 + i * pitch + (w - n * pitch) / 2, h = 0.5 * (0.75 + 0.5 * rnd()); pts.push([x0, 0.02], [x0 + pitch / 2, h], [x0 + pitch, 0.02]); }
  pts.push([w / 2, 0.02], [w / 2, -0.03]); return pts.map(([u, v]) => [R2(u), R2(v)]); };
LANDS.forEach(([a, b], i) => { const xc = (a + b) / 2, w = b - a;
  for (const k of ["F", "R"]) { LAY(`mA${k}${i}`, [w, 0.6, xc, 3.2]); P({ id: `mAsp${k}${i}`, layer: `mA${k}${i}`, shape: "poly", size: [1, 1, R2(2 * MZ)], pts: teeth(w, k, i + (k === "R" ? 3 : 0)), pos: [R2(xc), LTOP, 0], mat: "padCream" }); }
  LAY(`mAG${i}`, [w, 0.2, xc, 3.05]); BOX(`mAspG${i}`, `mAG${i}`, a, b, LTOP, R2(LTOP + 0.05), -MZ, MZ, "padGlazeShine"); });
// 鑽石碟修整頭（寬 3.2，剛好蓋住一塊陸地）：鎳底板＋鑽石顆粒（朝下的菱形尖）＋氣缸＋旋轉軸；尖端貼在磨滑的墊面上
LAY("mTool", [4, 2, TX, 4.2]);
BOX("mtPlate", "mTool", R2(TX - 1.6), R2(TX + 1.6), 3.65, 3.9, -1.75, 1.75, "ni"); BOX("mtCyl", "mTool", R2(TX - 0.45), R2(TX + 0.45), 3.9, 4.6, -0.45, 0.45, "steel2"); BOX("mtCap", "mTool", R2(TX - 0.8), R2(TX + 0.8), 4.6, 4.95, -0.65, 0.65, "dark");
P({ id: "mtGrain", layer: "mTool", shape: "poly", size: [1, 1, 0.5], pts: [[-0.26, 0], [0.26, 0], [0, -0.62]], pos: [0, 3.65, 0], at: [-1.2, -0.6, 0, 0.6, 1.2].flatMap((dx) => [-1.0, 0.3, 1.5].map((z) => [R2(TX + dx), 0, z])), mat: "dia" });
P({ id: "mtBond", layer: "mTool", shape: "box", size: [0.36, 0.1, 0.62], pos: [0, 3.67, 0], at: [-1.2, -0.6, 0, 0.6, 1.2].flatMap((dx) => [-1.0, 0.3, 1.5].map((z) => [R2(TX + dx), 0, z])), mat: "steel" });
P({ id: "mtChip", layer: "mTool", shape: "sphere", size: [0.06], pos: [TX, 3.3, 1.2], at: [[-1.4, 0.1, 0.2], [-0.5, 0.3, -0.3], [0.2, 0.05, 0.4], [0.9, 0.25, -0.2], [1.5, 0.1, 0.3], [-0.9, 0.18, -0.5]], mat: "debris" });
BOX("mtMark", "mTool", R2(TX + 0.9), R2(TX + 1.3), 3.9, 3.98, 1.1, 1.5, "mark");

// ═════ 站 T：新舊墊子厚度對照（s7 開頭）＝舊墊總厚約新墊 60%、溝槽也淺；黃色括弧標總厚 ═════
// r1：兩塊墊橫向縮窄（各 3.4 寬）、縱向加厚，站撐滿主畫面。新墊總厚 2.0（子墊 0.4＋研磨層 1.6），舊墊 1.2（子墊 0.4＋研磨層 0.8）
LAY("tPlinth", [11, 1, 58, 0.5]); BOX("tPl", "tPlinth", 53.2, 62.8, 0, 0.9, -2.8, 2.8, "band"); BOX("tPlTop", "tPlinth", 53.2, 62.8, 0.9, 1.0, -2.8, 2.8, "panel2");
const TH = { Old: { x0: 54.2, base: 0.4, land: 0.4, mat: "padOld" }, New: { x0: 58.4, base: 1.0, land: 0.6, mat: "padCream" } };
for (const [nm, d] of Object.entries(TH)) {
  const x0 = d.x0, yb = 1.4, yt = R2(yb + d.base), yl = R2(yt + d.land);
  LAY(`t${nm}`, [4, 2.2, x0 + 1.7, 2.0]);
  BOX(`t${nm}Sheet`, `t${nm}`, x0, R2(x0 + 3.4), 1.0, yb, -1.8, 1.8, "subpad");
  BOX(`t${nm}Base`, `t${nm}`, x0, R2(x0 + 3.4), yb, yt, -1.8, 1.8, d.mat);
  for (let i = 0; i < 3; i++) BOX(`t${nm}Land${i}`, `t${nm}`, R2(x0 + 0.2 + i * 1.15), R2(x0 + 1.1 + i * 1.15), yt, yl, -1.8, 1.8, d.mat);
  if (nm === "Old") P({ id: "tOldCrumb", layer: "tOld", shape: "sphere", size: [0.07], pos: [x0, yt + 0.05, 1.9], at: [[0.4, 0, 0.1], [1.45, 0.02, 0.2], [2.6, 0, 0.15], [3.2, 0.02, 0.3], [1.9, 0, 0.35]], mat: "debris" });
  LAY(`t${nm}Br`, [1, 3, x0 - 0.45, 2.0]);
  BOX(`t${nm}BrV`, `t${nm}Br`, R2(x0 - 0.55), R2(x0 - 0.41), 1.0, yl, 1.8, 1.9, "bracket"); BOX(`t${nm}BrT`, `t${nm}Br`, R2(x0 - 0.85), R2(x0 - 0.11), R2(yl - 0.05), R2(yl + 0.05), 1.8, 1.9, "bracket"); BOX(`t${nm}BrB`, `t${nm}Br`, R2(x0 - 0.85), R2(x0 - 0.11), 0.95, 1.05, 1.8, 1.9, "bracket");
}

// ═════ 站 H：軟墊（順著起伏、凸凹都被碰到）vs 硬墊（只碰凸處、一顆碎屑壓出刮痕）；晶圓剖面倒扣，同 W 站的凸起 ═════
const HS = [["soft", 74], ["hard", 90]];
for (const [nm, cx] of HS) {
  const x0 = cx - 5, x1 = cx + 5, bumps = [[cx - 3.4, 0.9], [cx - 1.0, 0.7], [cx + 1.4, 1.3], [cx + 3.4, 0.9]];
  LAY(`${nm}Plinth`, [12, 1, cx, 0.5]); BOX(`${nm}Pl`, `${nm}Plinth`, cx - 6.2, cx + 6.2, 0, 0.9, -3.0, 3.0, "band"); BOX(`${nm}PlTop`, `${nm}Plinth`, cx - 6.2, cx + 6.2, 0.9, 1.0, -3.0, 3.0, "panel2");
  LAY(`${nm}Pad`, [11, 1.2, cx, 1.4]);
  const padMat = nm === "soft" ? "soft" : "hard";
  // 墊子斷面（poly 沿 z 拉長）：硬墊頂面是平的（y 1.85），軟墊頂面順著晶圓凸起凹陷、凹處被頂高到谷底附近（y 2.28）
  const top = []; if (nm === "hard") top.push([-5.2, 1.85], [5.2, 1.85]);
  else { top.push([-5.2, 2.4]); let px = -5.2; for (const [bx, bw] of bumps) { const l = bx - cx - bw / 2, r = bx - cx + bw / 2; top.push([l - 0.45, 2.78], [l - 0.15, 2.5], [l + 0.12, 1.85], [r - 0.12, 1.85], [r + 0.15, 2.5], [r + 0.45, 2.78]); px = r; } top.push([5.2, 2.4]); }
  P({ id: `${nm}PadPoly`, layer: `${nm}Pad`, shape: "poly", size: [1, 1, 4.0], pts: [[-5.2, 1.0], [5.2, 1.0], ...top.slice().reverse()].map(([u, v]) => [R2(u), R2(v)]), pos: [cx, 0, 0], mat: padMat });
  P({ id: `${nm}PadPore`, layer: `${nm}Pad`, shape: "cyl", size: [0.06, 0.012], pos: [cx, 0, 2.006], at: Array.from({ length: 16 }, () => [R2(-4.8 + rnd() * 9.6), R2(1.15 + rnd() * 0.5), 0]), mat: "pore" });
  LAY(`${nm}Wafer`, [11, 1.6, cx, 3.2]);
  BOX(`${nm}Ox`, `${nm}Wafer`, x0, x1, 2.85, 3.15, -WZ, WZ, nm === "soft" ? "oxHot" : "ox");
  bumps.forEach(([bx, bw], i) => BOX(`${nm}Bump${i}`, `${nm}Wafer`, R2(bx - bw / 2), R2(bx + bw / 2), 1.85, 2.85, -WZ, WZ, nm === "soft" ? "pr1" : "pr0"));
  BOX(`${nm}Si`, `${nm}Wafer`, x0, x1, 3.15, 3.95, -WZ, WZ, "si"); BOX(`${nm}Plate`, `${nm}Wafer`, x0 - 0.3, x1 + 0.3, 3.95, 4.25, -WZ - 0.2, WZ + 0.2, "dark");
  P({ id: `${nm}Arrow`, layer: `${nm}Wafer`, shape: "cyl", size: [0.09, 0.8], rot: V, pos: [cx, 4.65, 0], at: [[-3.4, 0, 0], [-1.0, 0, 0], [1.4, 0, 0], [3.4, 0, 0]], mat: "mark" });
}
// 硬墊旁：一顆大碎屑與刮痕（只出現一次，示意）
LAY("hardPart", [0.8, 0.8, 91.4, 2.2]); SPH("hardPartB", "hardPart", 0.14, 91.4, 1.99, WZ - 0.05, "debris");
LAY("hardScratch", [2, 0.2, 91.4, 2.2]); BOX("hardScratchL", "hardScratch", 89.9, 92.9, 2.3, 2.34, WZ, WZ + 0.03, "lampR"); BOX("hardScratchL2", "hardScratch", 90.3, 92.4, 2.26, 2.29, WZ, WZ + 0.03, "lampR");

// ═════ 站 V：供應商出貨棧板＋三只裝研磨墊的紙箱（念到哪家就從幽靈變實體；非特定廠牌）═════
// r1：棧板縮窄、紙箱加高加大，正面貼文字貼紙（白底深色字；不是商標，官方 LOGO 三類來源都抓不到，見 assets.md）
// 貼紙貼圖由 make-brand-tex.mjs 產生（public/tex/brand/sign-*.png，不進 git），這裡每次重產
const SIGNS = [["padq", "Qnity"], ["padf", "富士紡|Fujibo"], ["padp", "頌勝|7768"]];
{ const r = spawnSync("node", [path.join(HERE, "..", "..", "scripts", "three", "make-brand-tex.mjs", ), "tech-pad", ...SIGNS.map(([id, t]) => `text:${id}=${t}`)], { encoding: "utf8" }); if (r.status !== 0) { console.error(r.stderr); process.exit(1); } }
const SIGNM = JSON.parse(fs.readFileSync(path.join(HERE, "..", "..", "public", "tex", "brand", "meta.json"), "utf8"));
SIGNS.forEach(([id]) => { materials[`t_${id}`] = { kind: "unlit", color: "#FFFFFF", img: `tex/brand/sign-${id}.png` }; });
LAY("supBase", [12, 4.2, 112, 0.3]);
BOX("supPallet", "supBase", 106.2, 117.8, 0, 0.5, -2.1, 2.1, "band");
P({ id: "supSlat", layer: "supBase", shape: "box", size: [11.6, 0.06, 0.12], pos: [112, 0.52, 0], at: [[0, 0, -1.5], [0, 0, -0.5], [0, 0, 0.5], [0, 0, 1.5]], mat: "seam" });
P({ id: "supFoot", layer: "supBase", shape: "box", size: [1.0, 0.3, 3.9], pos: [0, -0.15, 0], at: [[106.9, 0, 0], [112, 0, 0], [117.1, 0, 0]], mat: "dark" });
P({ id: "supBeam", layer: "supBase", shape: "box", size: [11.8, 0.22, 0.22], pos: [112, 0.24, 0], at: [[0, 0, -2.0], [0, 0, 2.0]], mat: "steel2" });
for (const [i, x, band] of [[0, 108.6, "pr0"], [1, 112, "boxGreen"], [2, 115.4, "warnY"]]) {
  LAY(`sup${i}`, [3.2, 4.0, x, 1.9]);
  BOX(`sup${i}Box`, `sup${i}`, x - 1.45, x + 1.45, 0.5, 3.1, -1.45, 1.45, "carton");
  BOX(`sup${i}Lid`, `sup${i}`, x - 1.5, x + 1.5, 3.1, 3.24, -1.5, 1.5, "cartonD");
  BOX(`sup${i}Band`, `sup${i}`, x - 1.46, x + 1.46, 0.62, 0.9, -1.46, 1.46, band);
  BOX(`sup${i}Tape`, `sup${i}`, x - 0.18, x + 0.18, 3.24, 3.26, -1.5, 1.5, "white");
  const sg = SIGNM[`sign-${SIGNS[i][0]}`], sw = 2.5; P({ id: `sup${i}Sign`, layer: `sup${i}`, shape: "plane", size: [sw, R2(sw / sg.aspect)], pos: [x, 2.0, 1.47], uv01: true, shadow: false, mat: `t_${SIGNS[i][0]}` });
  BOX(`sup${i}Warn`, `sup${i}`, x + 0.9, x + 1.3, 1.0, 1.35, 1.45, 1.48, "warnY");
  VC(`sup${i}Pad`, `sup${i}`, 1.2, 3.26, 3.5, "padCream", { x }); VT(`sup${i}PadRing`, `sup${i}`, 1.0, 0.94, 3.485, 3.51, "groove", { x }); VT(`sup${i}PadRing2`, `sup${i}`, 0.6, 0.54, 3.485, 3.51, "groove", { x });
  P({ id: `sup${i}Strap`, layer: `sup${i}`, shape: "box", size: [2.9, 0.1, 0.05], pos: [x, 2.85, 1.5], mat: "dark" });
}
P({ id: "supCorner", layer: "supBase", shape: "box", size: [0.5, 0.7, 0.5], pos: [0, 0.85, 0], at: [[106.3, 0, -1.9], [106.3, 0, 1.9], [117.7, 0, -1.9], [117.7, 0, 1.9]], mat: "dark" });
Object.assign(anchors, { supA: A("sup0", [108.6, 3.3, 1.4], -150, -90) });

// ═════ 站 N：耗材三件（墊子、鑽石碟、石英環）（s10）═════
// r1：三件放大約 2 倍、後一前二排開；底座換深色板，石英環白對白看不見的問題解決（深色底＋亮邊＋深色環腳）
LAY("nBase", [14, 1, 134, 0.5]); BOX("nPl", "nBase", 127.0, 141.0, 0, 0.9, -5.0, 5.0, "band"); BOX("nPlTop", "nBase", 127.0, 141.0, 0.9, 1.0, -5.0, 5.0, "dark");
LAY("nPad", [7, 1, 134, 1.4]); const NPX = 134, NPZ = -1.7; VC("nPadD", "nPad", 3.2, 1.0, 1.45, "padCream", { x: NPX, z: NPZ }); for (const r of [1.0, 1.9, 2.7]) VT(`nPadG${r * 100}`, "nPad", r + 0.08, r - 0.08, 1.44, 1.462, "groove", { x: NPX, z: NPZ });
P({ id: "nPadPore", layer: "nPad", shape: "cyl", size: [0.06, 0.01], rot: V, pos: [NPX, 1.458, NPZ], at: Array.from({ length: 80 }, () => { const [x, z] = pol(rnd() * 360, 0.4 + 2.6 * Math.sqrt(rnd())); return [x, 0, z]; }), mat: "pore" });
LAY("nDisc", [5, 1, 130, 1.4]); const NDX = 130.2, NDZ = 2.5; VC("nDiscD", "nDisc", 2.2, 1.0, 1.28, "ni", { x: NDX, z: NDZ }); VT("nDiscRing", "nDisc", 2.3, 2.0, 1.28, 1.5, "steel2", { x: NDX, z: NDZ });
P({ id: "nDiscGr", layer: "nDisc", shape: "sphere", size: [0.07], pos: [NDX, 1.32, NDZ], at: RING(32, 1.8).concat(RING(22, 1.2, 5)).concat(RING(10, 0.55)), mat: "dia" });
LAY("nQuartz", [5, 2.4, 138, 1.8]); const NQX = 138.0, NQZ = 2.5; VC("nQzBase", "nQuartz", 2.45, 1.0, 1.06, "dark", { x: NQX, z: NQZ }); VT("nQz", "nQuartz", 2.2, 1.78, 1.06, 3.0, "quartz", { x: NQX, z: NQZ }); VT("nQzFl", "nQuartz", 2.4, 1.78, 1.06, 1.3, "quartz", { x: NQX, z: NQZ });
BOX("nQzNotch", "nQuartz", R2(NQX + 1.9), R2(NQX + 2.45), 1.3, 3.0, R2(NQZ - 0.25), R2(NQZ + 0.25), "dark"); VT("nQzEdge", "nQuartz", 2.22, 2.12, 2.9, 3.02, "edge", { x: NQX, z: NQZ }); VT("nQzEdge2", "nQuartz", 2.42, 2.3, 1.26, 1.32, "edge", { x: NQX, z: NQZ });

// ═════ 動作 ═════
const platenIds = [...idsOf("platen"), ...idsOf("padAdh"), ...idsOf("padSub"), ...idsOf("padTop")];
const padIds = [...idsOf("padAdh"), ...idsOf("padSub"), ...idsOf("padTop")];
const headIds = idsOf("head"), condIds = idsOf("cond"), discIds = ["cdCyl", "cdCap", "cdPlate", "cdRing", "cdGrainRim", "cdGrainIn", "cdMark", "cdAir0"];
actions.padPeel = { type: "rotate", _說明: "換墊（s7）：舊墊（背膠＋子墊＋研磨層）從右緣被撕起，繞左側一條線掀起約 22 度後停住", parts: [...idsOf("oPadAdh"), ...idsOf("oPadSub"), ...idsOf("oPadTop")], axis: [0, 0, 1], pivot: [-2.0, Y_PL, 0], angle: 22, hold: true };
actions.padSpin = { type: "rotate", _說明: "圓台與墊子一起轉：起轉加速、停轉減速（rampSpin）", parts: platenIds, axis: [0, 1, 0], pivot: [0, 0, 0], rps: 0.55, rampSpin: true };
actions.headSpin = { type: "rotate", _說明: "研磨頭同向自轉", parts: headIds, axis: [0, 1, 0], pivot: [HX0, 0, 0], rps: 0.45, rampSpin: true };
actions.headSweep = { type: "vibrate", _說明: "研磨頭沿橫樑小幅來回擺（讓墊子磨損均勻）", parts: headIds, axis: [1, 0, 0], amp: 0.18, freq: 0.22 };
actions.condSwing = { type: "rotate", _說明: "鑽石碟臂繞立柱來回掃過墊面（正弦擺動，兩端自然減速）", parts: condIds.filter((i) => !["cdMotor", "cdMotorFin"].includes(i)), axis: [0, 1, 0], pivot: [CPX, 3.3, CPZ], swing: 24, freq: 0.22 };
actions.condSpin = { type: "rotate", _說明: "鑽石碟自轉（轉軸跟著臂走：先自轉、再隨臂擺）", parts: discIds.filter((i) => condIds.includes(i)), axis: [0, 1, 0], pivot: [CDX, 3.3, CDZ], rps: 0.8, rampSpin: true };
actions.rollerSpin = { type: "rotate", _說明: "壓平滾輪滾過新墊：表面速度≈前進速度", parts: ["rollerBody", "rollerMark"], axis: [1, 0, 0], rps: 1.27, pivot: [0, 2.95, 0] };
actions.wRub = { type: "vibrate", _說明: "晶圓與墊子相對滑動（s3）", parts: ["wSub", "wTop", "wPore", "wPoreTop"], axis: [1, 0, 0], amp: 0.5, freq: 0.5 };
actions.wGlow0 = { type: "pulse", parts: idsOf("wB0"), color: "pr0", glow: 0.9, freq: 1.1, halo: 0 };
actions.wGlow1 = { type: "pulse", parts: idsOf("wB1"), color: "pr1", glow: 0.8, freq: 1.1, halo: 0 };
actions.toolRub = { type: "vibrate", _說明: "修整頭貼著墊面小幅磨擦（s6；整個頭的位置移動由層位移 shift 做，標籤才跟得住鑽石顆粒）", parts: ["mtPlate", "mtCyl", "mtCap", "mtGrain", "mtBond"], axis: [1, 0, 0], amp: 0.07, freq: 3.2 };
actions.toolChips = { type: "vibrate", parts: ["mtChip"], axis: [0, 1, 0], amp: 0.1, freq: 4.5 };
actions.toolCrumb = { type: "flow", _說明: "修整頭切下來的細屑從接觸處往前飛出（s6；跟著層位移）", layer: "mTool", path: [[TX, 3.1, 1.8], [R2(TX + 0.4), 3.3, 2.6], [R2(TX + 0.7), 2.2, 3.4]], n: 6, size: 0.07, shape: "dot", rate: 0.55, color: "debrisC", track: false, free: true, jitter: 0.2 };
actions.hsRubSoft = { type: "vibrate", parts: ["softPadPoly", "softPadPore"], axis: [1, 0, 0], amp: 0.4, freq: 0.5 };
actions.hsRubHard = { type: "vibrate", parts: ["hardPadPoly", "hardPadPore"], axis: [1, 0, 0], amp: 0.4, freq: 0.5 };
const SPIRAL = (a0, dir, y) => Array.from({ length: 9 }, (_, i) => { const r = 0.5 + i * 0.5, a = a0 + dir * i * 22, [x, z] = pol(a, r); return [x, y, z]; });
actions.slDrop = { type: "flow", _說明: "研磨液（稠、不拉絲）從噴嘴滴下，受重力加速落到墊面", layer: "slurry", path: [[1.4, 3.15, -3.6], [1.4, Y_TOP + 0.04, -3.6]], n: 3, size: 0.1, shape: "dot", rate: 1.3, color: "slurryC", track: false, accel: true, free: true, jitter: 0.02 };
actions.slOutA = { type: "flow", _說明: "研磨液被離心力沿溝槽與墊面甩向外緣（螺旋）", layer: "film", path: SPIRAL(260, 1, Y_TOP + 0.03), n: 6, size: 0.075, shape: "dot", rate: 0.2, color: "slurryC", track: false, free: true, jitter: 0.08 };
actions.slOutB = { type: "flow", layer: "film", path: SPIRAL(140, 1, Y_TOP + 0.03), n: 6, size: 0.075, shape: "dot", rate: 0.22, color: "slurryC", track: false, free: true, jitter: 0.08 };
actions.slOutC = { type: "flow", layer: "film", path: SPIRAL(20, 1, Y_TOP + 0.03), n: 5, size: 0.075, shape: "dot", rate: 0.2, color: "debrisC", track: false, free: true, jitter: 0.08 };
actions.slSpread = { type: "wave", _說明: "液膜在墊面攤開", from: { layer: "film", p: [1.4, Y_TOP + 0.02, -3.6] }, dir: [0, 1, 0], reach: 0.1, count: 2, r0: 0.1, spread: 5, rate: 0.9, color: "slurryC", width: 0.08 };
actions.wDebris = { type: "flow", _說明: "凸處被磨下的細屑貼著墊面被液膜帶走（示意）", layer: "wPad", path: [[13.2, 1.95, 1.75], [16.4, 1.97, 1.75], [19.4, 1.95, 1.8], [23.9, 2.0, 1.85]], n: 9, size: 0.06, shape: "dot", rate: 0.12, color: "debrisC", track: false, free: true, jitter: 0.08 };
actions.wSlurry = { type: "flow", _說明: "磨粒夾在晶圓與墊子之間", layer: "wPad", path: [[12.3, 1.88, 1.7], [23.7, 1.88, 1.7]], n: 12, size: 0.045, shape: "dot", rate: 0.1, color: "slurryC", track: false, free: true, jitter: 0.05 };
actions.mGroove = { type: "flow", _說明: "溝槽把研磨液與碎屑往外輸送（沿 z 流向外緣）", layer: "mSlurry", path: [[36.25, 2.3, -2.1], [36.25, 2.3, 2.9]], n: 9, size: 0.07, shape: "dot", rate: 0.2, color: "slurryC", track: false, free: true, jitter: 0.05, accel: false };
actions.mGroove2 = { type: "flow", layer: "mSlurry", path: [[39.75, 2.3, -2.1], [39.75, 2.3, 2.9]], n: 9, size: 0.07, shape: "dot", rate: 0.18, color: "slurryC", track: false, free: true, jitter: 0.05 };
actions.mDebris = { type: "flow", _說明: "碎屑（深色）隨液流經溝槽離開", layer: "mSlurry", path: [[36.25, 2.0, -2.0], [36.25, 2.0, 2.9]], n: 6, size: 0.07, shape: "dot", rate: 0.17, color: "debrisC", track: false, free: true, jitter: 0.04 };
actions.mDebris2 = { type: "flow", layer: "mSlurry", path: [[39.75, 2.0, -2.0], [39.75, 2.0, 2.9]], n: 6, size: 0.07, shape: "dot", rate: 0.15, color: "debrisC", track: false, free: true, jitter: 0.04 };
actions.mAbrIn = { type: "flow", _說明: "磨粒落進細孔被抓住（s4）", layer: "mGrains", path: [[38.35, 4.4, 2.35], [38.35, 2.84, 2.35]], n: 2, lanes: 3, laneDir: [1, 0, 0], laneGap: 3.5, size: 0.085, shape: "dot", rate: 0.4, color: "slurryC", track: false, accel: true, free: true, jitter: 0.05 };
actions.mAbrBounce = { type: "flow", _說明: "磨粒落到磨滑的表面，抓不住、彈開（s5）", layer: "mGrains", path: [[37.6, 5.0, 1.0], [37.6, 3.1, 1.0], [38.5, 4.0, 1.4], [39.2, 4.9, 1.6]], n: 2, lanes: 3, laneDir: [1, 0, 0], laneGap: 3.5, size: 0.085, shape: "dot", rate: 0.5, color: "slurryC", track: false, accel: true, free: true, jitter: 0.05 };
actions.hsPartDrop = { type: "flow", _說明: "硬墊：一顆大碎屑被夾在凸處下（s8）", layer: "hardPart", path: [[91.4, 2.6, 1.55], [91.4, 1.99, 1.55]], n: 1, size: 0.14, shape: "dot", rate: 0.5, color: "debrisC", track: false, accel: true, free: true, jitter: 0.0 };
actions.hsHot = { type: "pulse", _說明: "硬墊：壓力集中在凸處（紅）", parts: ["hardBump0", "hardBump1", "hardBump2", "hardBump3"], color: "pr0", glow: 0.9, freq: 1.0, halo: 0 };
actions.hsSoftHot = { type: "pulse", _說明: "軟墊：壓力分散，凸處與凹處都被輕輕磨到（橘）", parts: ["softBump0", "softBump1", "softBump2", "softBump3", "softOx"], color: "pr1", glow: 0.7, freq: 1.0, halo: 0 };
actions.condDust = { type: "flow", _說明: "鑽石碟掃過墊面刮起的細屑（s6 全景）", layer: "cond", path: [[CDX, 2.5, CDZ], [CDX + 0.5, 3.2, CDZ + 0.5], [CDX + 0.9, 3.9, CDZ + 0.7]], n: 5, size: 0.06, shape: "dot", rate: 0.6, color: "debrisC", track: false, free: true, jitter: 0.3 };

// 壓平滾輪（換墊 s7）：圓柱沿 z 橫放，由墊子中心往外滾
LAY("roller", [1.2, 9, 0, 2.9]); HXC("rollerBody", "roller", 0.5, -3.6, 3.6, 2.95, 0, "steel2"); P({ id: "rollerMark", layer: "roller", shape: "box", size: [7.0, 0.14, 0.14], pos: [0, 2.95, 0.5], mat: "mark" });
BOX("rollerHandleL", "roller", -3.9, -3.7, 2.95, 3.6, -0.15, 0.15, "dark"); BOX("rollerHandleR", "roller", 3.7, 3.9, 2.95, 3.6, -0.15, 0.15, "dark"); BOX("rollerHandleBar", "roller", -3.9, 3.9, 3.6, 3.78, -0.15, 0.15, "dark");
// 新墊（換墊 s7）：與舊墊同尺寸，更厚、更亮；從上方放下（fallIn）
LAY("newPad", [8.6, 0.6, 0, 2.2]);
VC("npAdh", "newPad", PADR, Y_PL, Y_ADH, "adh"); VC("npSub", "newPad", PADR, Y_ADH, Y_SUB, "subpad"); VC("npTop", "newPad", PADR, Y_SUB, Y_TOP + 0.02, "padCream");
for (let i = 0; i < 7; i++) { const r = 0.9 + i * 0.5; VT(`npGroove${i}`, "newPad", r + 0.05, r - 0.05, Y_TOP + 0.005, Y_TOP + 0.026, "groove"); }
for (let i = 0; i < 6; i++) { const a = i * 60 + 10, [cx, cz] = pol(a, 2.5); P({ id: `npRadial${i}`, layer: "newPad", shape: "box", size: [3.1, 0.016, 0.1], pos: [cx, Y_TOP + 0.016, cz], rot: [0, -a, 0], mat: "groove" }); }
P({ id: "npPore", layer: "newPad", shape: "cyl", size: [0.035, 0.006], rot: V, pos: [0, Y_TOP + 0.024, 0], at: pores, mat: "pore" });
// 舊墊拉絲（背膠被撕開時拉出的細絲）：三個階段（撕起角度 8／15／22 度），每階段 15 條，長度＝撕開的縫隙高度
for (const [k, ang] of [[0, 8], [1, 15], [2, 22]]) { LAY(`strand${k}`, [6, 2.6, 1.5, 3.0]); const t = Math.tan(ang * D2R);
  [-0.5, 0.8, 2.0, 3.0, 3.8].forEach((x, xi) => [-1.2, 0, 1.2].forEach((z, zi) => { const len = Math.max(0.12, (x + 2.0) * t - 0.06); P({ id: `strandS${k}_${xi}_${zi}`, layer: `strand${k}`, shape: "cyl", size: [0.05, R2(len)], rot: V, pos: [x, R2(Y_PL + len / 2 + 0.03), z], mat: "strand" }); }));
}

// 標註點
Object.assign(anchors, {
  platen: A("platen", [3.8, 1.85, 2.6], 150, 100), padA: A("padTop", [2.5, Y_TOP, 3.2], 150, 100), head: A("head", [HX0 + 1.5, 4.0, 1.0], 150, -90), wafer: A("head", [HX0, Y_TOP + 0.04, 1.6], 150, 100),
  padTop: A("padTop", [-1.2, Y_TOP, 3.4], -150, 100), padSub: A("padSub", [-3.6, 2.12, 1.6], -150, 90), padAdh: A("padAdh", [-3.8, 2.015, 1.8], -150, 100),
  slurry: A("slurry", [1.4, 3.3, -3.6], 150, -90), cond: A("cond", [CDX, 3.3, CDZ + 0.4], -150, -90), condDisc: A("cond", [CDX - 0.5, 2.45, CDZ + 0.7], -150, 100),
  bump: A("wB0", [16.3, 1.9, 1.65], -60, 190), valley: A("wOx0", [13.2, 2.9, 1.65], -150, -100), wpad: A("wPad", [23.3, 1.6, 2.0], 150, 100),
  pore: A("mLand1", [38.35, 2.81, MZ], 150, -90), groove: A("mSlurry", [36.25, 2.3, MZ], -150, 100), asp: A("mAF1", [38.6, 3.3, 1.0], 150, -100), glaze: A("mAG1", [38.6, 3.04, 1.2], 150, -100),
  tool: A("mTool", [TX, 4.2, 0.5], -150, -80), grain: A("mTool", [R2(TX + 0.6), 3.07, 1.5], 150, 100),
  padOld: A("oPadTop", [2.4, Y_TOP - 0.1, 3.0], 150, -110), padNew: A("newPad", [-2.6, Y_TOP + 0.02, 2.4], -230, -110), tOld: A("tOld", [55.9, 2.0, 1.8], -150, 90), tNew: A("tNew", [60.1, 3.0, 1.8], 150, -90),
  softL: A("softPad", [74, 2.0, 2.0], -150, 100), hardL: A("hardPad", [90, 1.85, 2.0], 150, 100), scratchL: A("hardScratch", [91.4, 2.32, 1.65], 150, -100),
  nPadA: A("nPad", [NPX - 1.2, 1.45, NPZ + 1.0], -150, -90), nDiscA: A("nDisc", [NDX, 1.5, NDZ + 1.5], -150, 100), nQzA: A("nQuartz", [NQX + 1.5, 3.0, NQZ + 1.2], 150, -90),
});

const model = {
  name: "示意 研磨墊（CMP 研磨台）：圓台、三層墊子（背膠、子墊、研磨層）與溝槽細孔、研磨頭、噴液臂、鑽石碟臂；晶圓剖面、墊子顯微剖面、軟硬墊對照、換墊（示意，非特定廠牌／型號）",
  unit: "示意（1＝10 cm）",
  size: { w: 40, h: 18, r: 0.6, t: 30 },
  palette, materials,
  partNames: { padTop: "研磨層", padSub: "子墊", padAdh: "背膠", platen: "圓台" },
  layers, parts, anchors, actions,
  pose: { yaw0: 0, yawIso: 0, drift: 0 },
  camera: { stand: { d: 70, elev: 24, y: 4 } },
  fx: { dpr: 1, srcPx: 30, shadows: 0, fog: false, dust: false, vaporSprites: false, shimmer: false },
  info: { PADR, PLR, Y_TOP, HX0, CPX, CPZ, CDX, CDZ, WX, MX, MZ, LANDS, WH, WT, WPADTOP, WB },
};
const out = path.join(path.dirname(new URL(import.meta.url).pathname), "model.json");
fs.writeFileSync(out, JSON.stringify(model, null, 1) + "\n");
console.log(`✔ ${out}：${parts.length} 個零件、${parts.reduce((a, p) => a + Math.max(1, (p.at?.length ?? 0)), 0)} 個實體（含複製）、${layers.length} 層`);

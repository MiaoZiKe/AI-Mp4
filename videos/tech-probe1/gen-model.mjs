// node videos/tech-probe1/gen-model.mjs → 寫 videos/tech-probe1/model.json
// 2026/11/27 tech-probe1（探針卡-1，系列 2 第 21 集）。構造與物理照 physics-spec.md、模組清單照 visual-spec.md。
// 單位：站 A＝1＝10 cm；其他站是放大示意（W 晶圓放大約 3 倍、E 探針卡放大、N 針尖剖面 1＝約 10 µm、K 三種針型示意），地板頂面 y＝0。站點：
//   A 針測機台（x 0；機台底座、吸盤 XY 平台與 Z 柱、晶圓、對位相機、頂板與探針卡、測試頭與機械臂、測試機機櫃、排線）
//   W 晶圓俯視（x 30；好幾百顆晶片、測試位置框步進、壞晶片墨點）
//   E 探針卡爆炸分解（x 60；測試頭接口、加固板與螺栓、主板、彈簧針板、空間轉換器、上下導板、針林、頭髮對照）
//   N 針尖剖面（x 90；五根垂直針、上下導板偏移、鋁墊與氧化膜、晶圓抬起、彎曲與刮動逐格狀態）
//   K 三種針型（x 120；懸臂式、垂直式、微機電）
//   外形依專利圖與一般針測機台（示意，非特定廠牌／型號）；不標針數、力量、間距以外沒有來源的數字。
import fs from "node:fs";
import path from "node:path";
const HERE = path.dirname(new URL(import.meta.url).pathname);

const R2 = (x) => Math.round(x * 1000) / 1000;
const D2R = Math.PI / 180;
let seed = 20261223;
const rnd = () => { seed |= 0; seed = (seed + 0x6d2b79f5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
const palette = {
  floorC: "#C9D2DE", panel: "#F3F5F8", panel2: "#E2E8F0", seam: "#8E9BB0", band: "#24324C", steel: "#7D8CA6", steel2: "#A9B5C7", dark: "#3E4A60", darker: "#2A3142",
  glassC: "#BFD3F2", lampY: "#F2B632", lampG: "#2FBF71", lampR: "#E5484D", screen: "#5B8DEF", rubber: "#2B2F36", gold: "#C9A24A", estop: "#D93A2B",
  pcbC: "#1E6B4E", pcbD: "#16523B", capC: "#C8A46A", resC: "#2B2B2B", connC: "#E9E4D6", padGold: "#E0B84E", ceramC: "#E8E4DA", ceramD: "#9AA3B2", ceramDk: "#5A6272",
  needleC: "#D8B25A", needleHi: "#F4D27A", alC: "#C3CAD6", alShine: "#F4F7FB", oxC: "#6FA7D8", siC: "#5E6B82", passC: "#C9B3D9", dieC: "#7F95BC", dieE: "#9DB2D8",
  epoxyC: "#B07A3A", niC: "#B5BCC8", hairC: "#4A3525", inkC: "#B3261E", cableC: "#E8823A", warnY: "#F2B632", pinkC: "#E8A0B8", whiteP: "#FFFFFF", markC: "#E8613C",
  okC: "#14A38B", ngC: "#E0472F", sigC: "#2F7FE0", retC: "#14A38B", siteC: "#F29A4A", edgeC: "#F4FAFF", stiffC: "#3A4252", debrisC: "#5A6B86",
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
  lens: M("phys", "glassC", { rough: 0.05, metal: 0, clearcoat: 1, opacity: 0.6, env: 1.2 }),
  lampY: M("std", "lampY", { emissive: "lampY", ei: 0.45, rough: 0.4, metal: 0 }), lampG: M("std", "lampG", { emissive: "lampG", ei: 0.45, rough: 0.4, metal: 0 }),
  lampR: M("std", "lampR", { emissive: "lampR", ei: 0.4, rough: 0.4, metal: 0 }), estop: M("std", "estop", { rough: 0.4, metal: 0, emissive: "estop", ei: 0.15 }),
  screen: M("std", "screen", { emissive: "screen", ei: 0.5, rough: 0.3, metal: 0 }), ringLight: glowM("edgeC", 0.95, 0.7),
  pcb: M("std", "pcbC", { rough: 0.45, metal: 0.1, env: 0.35, tex: "traces", texScale: 1.2 }), pcbD: M("std", "pcbD", { rough: 0.5, metal: 0.1 }),
  cap: M("std", "capC", { rough: 0.5, metal: 0.2 }), res: M("std", "resC", { rough: 0.4, metal: 0.1 }), conn: M("std", "connC", { rough: 0.6, metal: 0 }),
  ceram: M("std", "ceramC", { rough: 0.55, metal: 0, env: 0.3 }), ceramD: M("std", "ceramD", { rough: 0.5, metal: 0.05, env: 0.3 }), ceramDk: M("std", "ceramDk", { rough: 0.5, metal: 0.05 }),
  needle: M("std", "needleC", { rough: 0.25, metal: 0.9, env: 0.9 }), needleHi: M("std", "needleHi", { rough: 0.2, metal: 0.9, env: 1.0, emissive: "needleHi", ei: 0.15 }),
  al: M("std", "alC", { rough: 0.35, metal: 0.85, env: 0.7 }), alShine: M("std", "alShine", { rough: 0.05, metal: 0.95, env: 1.4, emissive: "alShine", ei: 0.35 }),
  ox: M("phys", "oxC", { rough: 0.2, metal: 0, clearcoat: 0.8, opacity: 0.82, env: 0.6 }), si: M("std", "siC", { rough: 0.35, metal: 0.55, env: 0.7 }),
  pass: M("std", "passC", { rough: 0.6, metal: 0 }), die: M("std", "dieC", { rough: 0.3, metal: 0.5, env: 0.8, emissive: "dieE", ei: 0.08 }),
  epoxy: M("std", "epoxyC", { rough: 0.6, metal: 0 }), ni: M("std", "niC", { rough: 0.3, metal: 0.9, env: 0.7 }), hair: M("std", "hairC", { rough: 0.7, metal: 0 }),
  ink: M("std", "inkC", { rough: 0.6, metal: 0, emissive: "inkC", ei: 0.25 }), cable: M("std", "cableC", { rough: 0.55, metal: 0 }), warnY: M("std", "warnY", { rough: 0.5, metal: 0, emissive: "warnY", ei: 0.2 }),
  pink: M("std", "pinkC", { rough: 0.9, metal: 0 }), white: M("std", "whiteP", { rough: 0.7, metal: 0 }), mark: M("std", "markC", { rough: 0.5, metal: 0, emissive: "markC", ei: 0.25 }),
  tipOk: glowM("lampY", 1, 0.8), tipNg: glowM("ngC", 1, 0.8), site: glowM("siteC", 0.95, 0.8), stiff: M("std", "stiffC", { rough: 0.45, metal: 0.6, env: 0.5 }),
  plane: M("phys", "glassC", { rough: 0.05, metal: 0, clearcoat: 1, opacity: 0.22, env: 0.6 }), debris: glowM("debrisC", 0.95, 0.2),
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

// ═════ 地板 ═════
LAY("floor", [240, 2, 60, 0], true);
P({ id: "floor", layer: "floor", shape: "slab", size: [280, 0.5, 44], r: 0.2, pos: [60, -0.25, 0], mat: "floor" });
P({ id: "floorSeam", layer: "floor", shape: "slab", size: [280, 0.04, 0.1], pos: [60, 0.01, 0], at: Array.from({ length: 7 }, (_, i) => [0, 0, -16 + i * 5.3]), mat: "seam" });

// ═════ 站 A：針測機台（prober）＋測試頭＋測試機 ═════
// 底座（深藍）：前門兩扇、把手、螢幕、三顆燈、緊急鈕、通風、銘牌、踢腳、螺絲
LAY("aBase", [14, 4.4, 0, 2.2]);
BOX("abBody", "aBase", -7, 7, 0.3, 4.4, -5.5, 5.5, "band"); BOX("abKick", "aBase", -7.05, 7.05, 0, 0.3, -5.55, 5.55, "rubber");
BOX("abDoorL", "aBase", -6.6, -0.15, 0.6, 3.9, 5.5, 5.56, "dark"); BOX("abDoorR", "aBase", 0.15, 6.6, 0.6, 3.9, 5.5, 5.56, "dark");
P({ id: "abHandle", layer: "aBase", shape: "box", size: [0.12, 0.8, 0.14], pos: [-0.5, 2.3, 5.62], at: [[0, 0, 0], [1.0, 0, 0]], mat: "steel2" });
BOX("abScreen", "aBase", -6.0, -3.4, 2.7, 3.6, 5.56, 5.6, "screen"); BOX("abScreenF", "aBase", -6.1, -3.3, 2.6, 3.7, 5.55, 5.57, "darker");
P({ id: "abLed", layer: "aBase", shape: "sphere", size: [0.09], pos: [-2.8, 3.4, 5.6], at: [[0, 0, 0], [0.35, 0, 0], [0.7, 0, 0]], mat: "lampG" });
BOX("abEstop", "aBase", 4.6, 5.3, 3.0, 3.6, 5.56, 5.75, "estop"); BOX("abWarn", "aBase", 3.2, 4.3, 3.1, 3.5, 5.56, 5.6, "warnY");
for (let i = 0; i < 6; i++) BOX(`abVent${i}`, "aBase", 1.2, 5.8, 0.9 + i * 0.16, 0.97 + i * 0.16, 5.56, 5.6, "darker");
BOX("abPlate", "aBase", -6.0, -4.2, 1.0, 1.5, 5.56, 5.6, "gold");
P({ id: "abScrew", layer: "aBase", shape: "cyl", size: [0.07, 0.04], pos: [0, 0, 5.58], at: [[-6.8, 4.2, 0], [6.8, 4.2, 0], [-6.8, 0.5, 0], [6.8, 0.5, 0], [-0.1, 4.2, 0]], mat: "steel" });
BOX("abTop", "aBase", -7, 7, 4.3, 4.45, -5.5, 5.5, "panel2");
// 腔體牆（後牆、兩側），前方拆開只留門框（示意）
LAY("aWall", [14, 4.3, 0, 6.5]);
BOX("awBack", "aWall", -7, 7, 4.45, 8.6, -5.5, -5.25, "panel"); BOX("awL", "aWall", -7, -6.75, 4.45, 8.6, -5.5, 5.5, "panel"); BOX("awR", "aWall", 6.75, 7, 4.45, 8.6, -5.5, 5.5, "panel");
BOX("awPostL", "aWall", -7.05, -6.6, 4.45, 8.6, 5.2, 5.6, "steel"); BOX("awPostR", "aWall", 6.6, 7.05, 4.45, 8.6, 5.2, 5.6, "steel");
P({ id: "awHinge", layer: "aWall", shape: "cyl", size: [0.1, 0.5], rot: V, pos: [7.1, 0, 5.5], at: [[0, 5.3, 0], [0, 7.8, 0]], mat: "dark" });
for (let i = 0; i < 4; i++) BOX(`awSeam${i}`, "aWall", -6.74, -6.72, 4.6, 8.4, -4.4 + i * 2.6, -4.35 + i * 2.6, "seam");
BOX("awBackSeam", "aWall", -0.03, 0.03, 4.6, 8.5, -5.25, -5.22, "seam"); BOX("awBackPlate", "aWall", -6.2, -4.6, 7.4, 8.0, -5.25, -5.2, "gold");
// 頂板（head plate）：中間方孔＋插入環，探針卡掛在這裡
LAY("aHead", [14, 0.6, 0, 8.85]);
BOX("ahL", "aHead", -7, -2.9, 8.6, 9.1, -5.5, 5.5, "panel2"); BOX("ahR", "aHead", 2.9, 7, 8.6, 9.1, -5.5, 5.5, "panel2");
BOX("ahF", "aHead", -2.9, 2.9, 8.6, 9.1, 2.9, 5.5, "panel2"); BOX("ahB", "aHead", -2.9, 2.9, 8.6, 9.1, -5.5, -2.9, "panel2");
BOX("ahEdge", "aHead", -7.02, 7.02, 8.55, 8.62, 5.45, 5.6, "steel");
VT("ahRing", "aHead", 2.95, 2.5, 8.5, 9.18, "steel2"); P({ id: "ahRingBolt", layer: "aHead", shape: "cyl", size: [0.07, 0.05], rot: V, pos: [0, 9.2, 0], at: Array.from({ length: 12 }, (_, i) => { const a = i * 30 * D2R; return [R2(2.72 * Math.cos(a)), 0, R2(2.72 * Math.sin(a))]; }), mat: "dark" });
// 探針卡（在機台裡）：主板（綠）、底面被動元件環、探針頭（陶瓷塊）與針
LAY("aCard", [5, 1.2, 0, 8.2]);
VC("acPcb", "aCard", 2.45, 8.42, 8.56, "pcb");
P({ id: "acCap", layer: "aCard", shape: "box", size: [0.14, 0.05, 0.08], pos: [0, 8.395, 0], at: Array.from({ length: 36 }, (_, i) => { const a = i * 10 * D2R, r = i % 2 ? 1.55 : 2.0; return [R2(r * Math.cos(a)), 0, R2(r * Math.sin(a))]; }), mat: "cap" });
P({ id: "acRes", layer: "aCard", shape: "box", size: [0.1, 0.04, 0.05], pos: [0, 8.4, 0], at: Array.from({ length: 24 }, (_, i) => { const a = (i * 15 + 5) * D2R; return [R2(1.2 * Math.cos(a)), 0, R2(1.2 * Math.sin(a))]; }), mat: "res" });
BOX("acST", "aCard", -0.7, 0.7, 8.2, 8.42, -0.7, 0.7, "ceram"); BOX("acHead", "aCard", -0.55, 0.55, 8.05, 8.2, -0.55, 0.55, "ceramD");
P({ id: "acNeedle", layer: "aCard", shape: "cyl", size: [0.018, 0.12], rot: V, pos: [0, 7.99, 0], at: grid(8, 8, 0.12, 0.12, 0, 0), mat: "needle" });
BOX("acLabel", "aCard", 1.6, 2.3, 8.38, 8.42, -0.25, 0.25, "white");
// 吸盤 XY 平台：X 軌道（不動）→ X 滑台（左右）→ Y 滑台＋Z 柱＋吸盤＋晶圓（上下）
LAY("aRail", [12, 0.6, 0, 4.6]);
for (const z of [-2.6, 2.6]) BOX(`arRail${z > 0 ? "F" : "B"}`, "aRail", -6.2, 6.2, 4.45, 4.62, z - 0.18, z + 0.18, "steel2");
HXC("arScrew", "aRail", 0.12, -6.2, 6.2, 4.7, 0, "steel"); VC("arMotorDummy", "aRail", 0.01, 4.45, 4.46, "steel", { x: 6.3, z: 0 });
HXC("arMotor", "aRail", 0.45, -6.6, -5.4, 4.95, 0, "dark"); HXC("arMotorFin", "aRail", 0.5, -6.4, -5.6, 4.95, 0, "steel2"); HXC("arCoup", "aRail", 0.2, -5.4, -5.0, 4.85, 0, "gold");
LAY("aXcar", [6, 0.6, 0, 4.8]);
BOX("axBody", "aXcar", -3, 3, 4.62, 5.0, -3, 3, "steel"); BOX("axNut", "aXcar", -0.4, 0.4, 4.55, 4.85, -0.3, 0.3, "gold");
for (const x of [-2.1, 2.1]) BOX(`axRail${x > 0 ? "R" : "L"}`, "aXcar", x - 0.15, x + 0.15, 5.0, 5.14, -2.9, 2.9, "steel2");
ZC("axScrew", "aXcar", 0.1, -2.9, 2.9, 0, 5.12, "steel"); ZC("axMotor", "aXcar", 0.38, -3.9, -3.0, 0, 5.15, "dark"); ZC("axMotorFin", "aXcar", 0.42, -3.75, -3.15, 0, 5.15, "steel2");
P({ id: "axBolt", layer: "aXcar", shape: "cyl", size: [0.06, 0.04], rot: V, pos: [0, 5.01, 0], at: [[-2.8, 0, -2.8], [2.8, 0, -2.8], [-2.8, 0, 2.8], [2.8, 0, 2.8]], mat: "dark" });
LAY("aY", [4.4, 0.4, 0, 5.3]);
BOX("ayBody", "aY", -2.3, 2.3, 5.14, 5.5, -2.3, 2.3, "steel2"); BOX("ayBlock", "aY", -2.3, -1.9, 5.0, 5.14, -1.2, 1.2, "dark"); BOX("ayBlock2", "aY", 1.9, 2.3, 5.0, 5.14, -1.2, 1.2, "dark");
LAY("aZ", [3.4, 2.4, 0, 6.6]);
VC("azCol", "aZ", 0.7, 4.9, 6.7, "steel"); VT("azBellows", "aZ", 0.82, 0.7, 5.5, 6.2, "rubber");
VC("azChuck", "aZ", 1.62, 6.7, 7.15, "steel2"); VT("azChuckRim", "aZ", 1.66, 1.56, 6.7, 6.95, "dark");
for (const r of [0.5, 0.9, 1.3]) VT(`azVac${r * 10}`, "aZ", r + 0.03, r - 0.03, 7.15, 7.16, "dark");
VC("azWafer", "aZ", 1.5, 7.15, 7.18, "si");
{ const d = []; for (let i = -7; i <= 7; i++) for (let j = -7; j <= 7; j++) { const x = i * 0.19, z = j * 0.19; if (Math.hypot(Math.abs(x) + 0.09, Math.abs(z) + 0.09) < 1.42) d.push([R2(x), 0, R2(z)]); }
  P({ id: "azDie", layer: "aZ", shape: "box", size: [0.16, 0.012, 0.16], pos: [0, 7.186, 0], at: d, mat: "die" }); }
BOX("azNotch", "aZ", -0.06, 0.06, 7.15, 7.19, 1.45, 1.52, "dark");
BOX("azCleanHold", "aZ", 1.62, 2.45, 6.75, 7.0, -0.45, 0.45, "dark"); BOX("azClean", "aZ", 1.68, 2.4, 7.0, 7.13, -0.4, 0.4, "pink");
// 對位相機（掛在後牆的橫臂上，吸盤移過來時看晶圓圖案）
LAY("aCam", [2, 1, -4.6, 8.0]);
BOX("acmArm", "aCam", -5.0, -4.2, 8.05, 8.4, -5.25, 0.2, "panel2"); VC("acmBody", "aCam", 0.36, 7.7, 8.4, "darker", { x: -4.6, z: 0 });
VT("acmRing", "aCam", 0.52, 0.38, 7.58, 7.7, "ringLight", { x: -4.6, z: 0 }); VC("acmLens", "aCam", 0.3, 7.6, 7.66, "lens", { x: -4.6, z: 0 });
BOX("acmLabel", "aCam", -4.9, -4.3, 8.15, 8.3, 0.2, 0.22, "warnY");
// 測試頭（對接環＋箱體＋把手＋通風＋銘板＋燈）
LAY("aTH", [7.2, 3.4, 0, 11]);
VT("athDock", "aTH", 3.0, 2.55, 9.1, 9.6, "steel"); P({ id: "athDockLatch", layer: "aTH", shape: "box", size: [0.3, 0.35, 0.3], pos: [0, 9.35, 0], at: [[3.0, 0, 0], [-3.0, 0, 0], [0, 0, 3.0], [0, 0, -3.0]], mat: "dark" });
BOX("athBody", "aTH", -3.6, 3.6, 9.6, 12.4, -3.2, 3.2, "darker"); BOX("athTop", "aTH", -3.5, 3.5, 12.4, 12.55, -3.1, 3.1, "dark");
for (let i = 0; i < 8; i++) BOX(`athVent${i}`, "aTH", -2.8, 0.8, 10.0 + i * 0.22, 10.08 + i * 0.22, 3.2, 3.24, "dark");
BOX("athPlate", "aTH", 1.4, 3.0, 11.3, 11.9, 3.2, 3.24, "gold"); P({ id: "athLed", layer: "aTH", shape: "sphere", size: [0.1], pos: [1.6, 10.6, 3.25], at: [[0, 0, 0], [0.4, 0, 0], [0.8, 0, 0]], mat: "lampG" });
P({ id: "athHandle", layer: "aTH", shape: "box", size: [0.14, 0.14, 1.6], pos: [0, 12.7, 0], at: [[-2.6, 0, 0], [2.6, 0, 0]], mat: "steel2" });
BOX("athSeam", "aTH", -3.62, 3.62, 11.0, 11.04, 3.2, 3.23, "seam"); BOX("athPort", "aTH", 3.6, 3.9, 10.9, 12.0, -1.0, 1.0, "dark");
// 機械臂（吊住測試頭）
LAY("aMan", [2, 13, -9, 6.5]);
BOX("amCol", "aMan", -9.8, -8.4, 0.3, 13.2, -1.0, 1.0, "panel"); BOX("amFoot", "aMan", -10.4, -7.8, 0, 0.3, -1.6, 1.6, "band");
BOX("amArm", "aMan", -8.4, -3.6, 10.6, 11.5, -0.6, 0.6, "panel2"); VC("amPivot", "aMan", 0.5, 10.4, 11.7, "dark", { x: -4.1, z: 0 });
for (let i = 0; i < 5; i++) BOX(`amSeam${i}`, "aMan", -9.82, -8.38, 2 + i * 2.2, 2.04 + i * 2.2, 1.0, 1.02, "seam");
BOX("amPlate", "aMan", -9.5, -8.7, 8.5, 9.1, 1.0, 1.04, "warnY"); P({ id: "amBolt", layer: "aMan", shape: "cyl", size: [0.07, 0.04], pos: [0, 0, 1.02], at: [[-9.6, 1.0, 0], [-8.6, 1.0, 0], [-9.6, 12.8, 0], [-8.6, 12.8, 0]], mat: "steel" }); BOX("amChain", "aMan", -8.35, -8.1, 1.0, 10.6, -0.4, 0.4, "rubber"); for (let i = 0; i < 12; i++) BOX(`amChainL${i}`, "aMan", -8.36, -8.09, 1.4 + i * 0.8, 1.46 + i * 0.8, -0.42, 0.42, "dark");
// 測試機機櫃
LAY("aTester", [4.4, 12, 11.2, 6]);
BOX("atBody", "aTester", 9, 13.4, 0.2, 12, -3, 3, "panel"); BOX("atKick", "aTester", 9, 13.4, 0, 0.2, -3, 3, "rubber");
BOX("atDoorSeam", "aTester", 11.18, 11.22, 0.4, 11.8, 3.0, 3.03, "seam"); BOX("atTopBand", "aTester", 9, 13.4, 11.4, 12, 3.0, 3.04, "band");
for (let i = 0; i < 10; i++) SPH(`atLed${i}`, "aTester", 0.09, 9.6, 10.9 - i * 0.32, 3.05, i === 3 ? "lampY" : "lampG");
for (const y of [2.2, 5.2]) for (const x of [10.2, 12.3]) { VT(`atFan${x}_${y}`, "aTester", 0.75, 0.65, 2.99, 3.06, "darker", { x, z: 0 }); }
P({ id: "atFanGrill", layer: "aTester", shape: "box", size: [1.3, 0.05, 0.04], pos: [0, 0, 3.04], at: [10.2, 12.3].flatMap((x) => [2.2, 5.2].flatMap((y) => [-0.4, 0, 0.4].map((d) => [x, R2(y + d), 0]))), mat: "darker" });
P({ id: "atHandle", layer: "aTester", shape: "box", size: [0.12, 1.0, 0.14], pos: [0, 8.2, 3.08], at: [[10.95, 0, 0], [11.45, 0, 0]], mat: "steel2" });
BOX("atScreen", "aTester", 10.0, 12.6, 8.8, 10.4, 3.0, 3.04, "screen"); BOX("atPlate", "aTester", 11.6, 13.0, 0.8, 1.3, 3.0, 3.04, "gold");
BOX("atWarn", "aTester", 9.4, 10.6, 0.8, 1.2, 3.0, 3.04, "warnY");
// 排線（測試頭 → 測試機，三束＋管夾）
LAY("aCable", [9, 2, 7.4, 12]);
for (const [k, z] of [[0, -0.6], [1, 0], [2, 0.6]]) PIPE(`acb${k}`, "aCable", [[3.9, 11.6, z], [6.4, 11.6, z], [6.4, 12.9, z], [11.2, 12.9, z], [11.2, 11.9, z]], 0.16, "cable");
P({ id: "acbClamp", layer: "aCable", shape: "box", size: [0.25, 0.5, 1.8], pos: [0, 12.9, 0], at: [[8.0, 0, 0], [9.8, 0, 0]], mat: "dark" });

// ═════ 站 W：晶圓俯視（放大示意） ═════
const WX = 30, WR = 5.0, WP = 0.5, WD = 0.44, WY = 1.07;
LAY("wPl", [14, 1, WX, 0.5]);
BOX("wPlinth", "wPl", WX - 6.6, WX + 6.6, 0, 0.6, -6.6, 6.6, "band"); BOX("wPlTop", "wPl", WX - 6.6, WX + 6.6, 0.6, 0.66, -6.6, 6.6, "panel2");
VC("wChuck", "wPl", 5.35, 0.66, 1.0, "steel2", { x: WX }); for (const r of [1.5, 3.0, 4.4]) VT(`wVac${r * 10}`, "wPl", r + 0.05, r - 0.05, 1.0, 1.012, "dark", { x: WX });
P({ id: "wPlBolt", layer: "wPl", shape: "cyl", size: [0.08, 0.05], rot: V, pos: [WX, 0.67, 0], at: [[-6.1, 0, -6.1], [6.1, 0, -6.1], [-6.1, 0, 6.1], [6.1, 0, 6.1]], mat: "steel" });
LAY("wWafer", [10, 0.2, WX, 1.05]);
VC("wSi", "wWafer", WR, 1.0, 1.05, "si", { x: WX }); BOX("wNotch", "wWafer", WX - 0.12, WX + 0.12, 1.0, 1.06, WR - 0.12, WR + 0.02, "dark");
const dies = [];
for (let i = -11; i <= 10; i++) for (let j = -11; j <= 10; j++) { const x = (i + 0.5) * WP, z = (j + 0.5) * WP; if (Math.hypot(Math.abs(x) + WD / 2, Math.abs(z) + WD / 2) < WR - 0.2) dies.push([R2(x), R2(z)]); }
P({ id: "wDie", layer: "wWafer", shape: "box", size: [WD, 0.02, WD], pos: [WX, WY - 0.01, 0], at: dies.map(([x, z]) => [x, 0, z]), mat: "die" });
// 鉤子：幾顆晶片發亮（哪顆是好的？）
LAY("wQ", [10, 0.2, WX, 1.1]);
const qd = [3, 17, 40, 66, 91, 120, 150, 177, 201].map((k) => dies[k % dies.length]);
P({ id: "wQDie", layer: "wQ", shape: "box", size: [WD, 0.024, WD], pos: [WX, WY + 0.002, 0], at: qd.map(([x, z]) => [x, 0, z]), mat: "lampY" });
// 測試結果：已測完的列（z < 測試列）壞晶片墨點；測試列分 7 步（每步 2 顆）
const ROWZ = 0.25, fail = dies.map(([x, z], k) => { const e = Math.hypot(x, z) / WR; return rnd() < (e > 0.78 ? 0.32 : 0.07); });
LAY("wInkDone", [10, 0.2, WX, 1.1]);
P({ id: "wInkD", layer: "wInkDone", shape: "cyl", size: [0.15, 0.03], rot: V, pos: [WX, WY + 0.02, 0], at: dies.filter(([x, z], k) => z < ROWZ - 0.01 && fail[k]).map(([x, z]) => [x, 0, z]), mat: "ink" });
P({ id: "wDoneTint", layer: "wInkDone", shape: "box", size: [WD, 0.022, WD], pos: [WX, WY + 0.001, 0], at: dies.filter(([x, z], k) => z < ROWZ - 0.01 && !fail[k]).map(([x, z]) => [x, 0, z]), mat: M("std", "okC", { rough: 0.4, metal: 0.2, emissive: "okC", ei: 0.25, opacity: 0.55 }) });
materials.okTint = parts.at(-1).mat; parts.at(-1).mat = "okTint";
const row = dies.map((d, k) => [d, k]).filter(([[x, z]]) => Math.abs(z - ROWZ) < 0.01).sort((a, b) => a[0][0] - b[0][0]);
const WSTEPS = Math.ceil(row.length / 2), SITE0 = (row[0][0][0] + row[1][0][0]) / 2;
for (let s = 0; s < WSTEPS; s++) {
  LAY(`wStep${s}`, [1.2, 0.2, R2(WX + SITE0 + s * 2 * WP), 1.1]);
  const pr = row.slice(s * 2, s * 2 + 2);
  pr.forEach(([[x, z], k], i) => { if (fail[k]) P({ id: `wInkS${s}_${i}`, layer: `wStep${s}`, shape: "cyl", size: [0.15, 0.03], rot: V, pos: [R2(WX + x), WY + 0.02, z], mat: "ink" }); else BOX(`wOkS${s}_${i}`, `wStep${s}`, R2(WX + x - WD / 2), R2(WX + x + WD / 2), WY, WY + 0.022, R2(z - WD / 2), R2(z + WD / 2), "okTint"); });
}
// 至少一個壞的在測試列（第 2 步），讓「標記」看得到
{ const [[x, z]] = row[5]; if (!parts.some((p) => p.id.startsWith("wInkS2_"))) P({ id: "wInkS2_x", layer: "wStep2", shape: "cyl", size: [0.15, 0.03], rot: V, pos: [R2(WX + x), WY + 0.02, z], mat: "ink" }); }
// 測試位置框（探針卡下方的針區，蓋住 2 顆晶片）：框＋針點
LAY("wSite", [1.4, 0.4, R2(WX + SITE0), 1.3]);
const SX = R2(WX + SITE0), SW = WP * 2 + 0.06, SD = WP + 0.06;
BOX("wsF", "wSite", SX - SW / 2, SX + SW / 2, 1.1, 1.16, ROWZ + SD / 2 - 0.05, ROWZ + SD / 2, "site"); BOX("wsB", "wSite", SX - SW / 2, SX + SW / 2, 1.1, 1.16, ROWZ - SD / 2, ROWZ - SD / 2 + 0.05, "site");
BOX("wsL", "wSite", SX - SW / 2, SX - SW / 2 + 0.05, 1.1, 1.16, ROWZ - SD / 2, ROWZ + SD / 2, "site"); BOX("wsR", "wSite", SX + SW / 2 - 0.05, SX + SW / 2, 1.1, 1.16, ROWZ - SD / 2, ROWZ + SD / 2, "site");
P({ id: "wsPin", layer: "wSite", shape: "cyl", size: [0.025, 0.04], rot: V, pos: [SX, 1.12, ROWZ], at: grid(8, 4, 0.13, 0.12, 0, 0), mat: "needle" });

// ═════ 站 E：探針卡爆炸分解（放大示意） ═════
const EX = 60;
const EY = { tip: 2.6, lg0: 2.85, lg1: 2.97, ug0: 3.3, ug1: 3.42, st0: 3.55, st1: 3.9, ip0: 3.9, ip1: 4.1, pcb0: 4.1, pcb1: 4.28, sf0: 4.28, sf1: 4.6, dk0: 4.8, dk1: 5.3 };
// 測試頭接口（對接環、彈簧針塔、線束頭）
LAY("eDock", [7.4, 1.6, EX, 5.4]);
VT("edRing", "eDock", 3.7, 3.15, EY.dk0, EY.dk1, "steel", { x: EX }); VT("edRingTop", "eDock", 3.72, 3.5, EY.dk1 - 0.04, EY.dk1 + 0.02, "steel2", { x: EX });
P({ id: "edLatch", layer: "eDock", shape: "box", size: [0.4, 0.5, 0.4], pos: [EX, 5.05, 0], at: [0, 90, 180, 270].map((a) => [R2(3.7 * Math.cos(a * D2R)), 0, R2(3.7 * Math.sin(a * D2R))]), mat: "dark" });
P({ id: "edPogo", layer: "eDock", shape: "cyl", size: [0.05, 0.4], rot: V, pos: [EX, 4.7, 0], at: Array.from({ length: 48 }, (_, i) => { const a = i * 7.5 * D2R; return [R2(3.4 * Math.cos(a)), 0, R2(3.4 * Math.sin(a))]; }), mat: "gold" });
for (const [k, a] of [[0, 30], [1, 150], [2, 270]]) { const x = R2(EX + 3.4 * Math.cos(a * D2R)), z = R2(3.4 * Math.sin(a * D2R)); VC(`edCab${k}`, "eDock", 0.22, EY.dk1, 6.4, "cable", { x, z }); VT(`edCabNut${k}`, "eDock", 0.3, 0.22, EY.dk1, EY.dk1 + 0.25, "dark", { x, z }); }
// 加固板（黑色陽極鋁：外環＋中心轂＋六根輻條＋減重孔）與 8 顆螺栓
LAY("eStiff", [6, 0.4, EX, 4.45]);
VT("esRing", "eStiff", 3.0, 2.5, EY.sf0, EY.sf1, "stiff", { x: EX }); VC("esHub", "eStiff", 0.9, EY.sf0, EY.sf1, "stiff", { x: EX });
for (let i = 0; i < 6; i++) { const a = i * 60 + 30; P({ id: `esSpoke${i}`, layer: "eStiff", shape: "box", size: [1.7, 0.3, 0.32], pos: [R2(EX + 1.7 * Math.cos(a * D2R)), R2((EY.sf0 + EY.sf1) / 2), R2(1.7 * Math.sin(a * D2R))], rot: [0, -a, 0], mat: "stiff" }); }
P({ id: "esHole", layer: "eStiff", shape: "cyl", size: [0.14, 0.34], rot: V, pos: [EX, 4.44, 0], at: Array.from({ length: 12 }, (_, i) => { const a = (i * 30 + 15) * D2R; return [R2(2.75 * Math.cos(a)), 0, R2(2.75 * Math.sin(a))]; }), mat: "darker" });
BOX("esMark", "eStiff", EX + 2.5, EX + 3.0, EY.sf1, EY.sf1 + 0.02, -0.12, 0.12, "mark");
LAY("eScrew", [6, 0.6, EX, 4.6]);
const SCR = Array.from({ length: 8 }, (_, i) => { const a = i * 45 * D2R; return [R2(2.75 * Math.cos(a)), 0, R2(2.75 * Math.sin(a))]; });
P({ id: "escHead", layer: "eScrew", shape: "cyl", size: [0.16, 0.14], rot: V, pos: [EX, EY.sf1 + 0.07, 0], at: SCR, mat: "steel2" });
P({ id: "escSlot", layer: "eScrew", shape: "box", size: [0.26, 0.03, 0.05], pos: [EX, EY.sf1 + 0.15, 0], at: SCR, mat: "darker" });
P({ id: "escShank", layer: "eScrew", shape: "cyl", size: [0.07, 0.55], rot: V, pos: [EX, EY.sf1 - 0.27, 0], at: SCR, mat: "steel" });
// 主板（大圓多層電路板）：電容排、電阻、板邊連接器、定位銷、螺絲孔、銘板、金色焊墊環
LAY("ePCB", [8.4, 0.4, EX, 4.2]);
VC("epBoard", "ePCB", 4.2, EY.pcb0, EY.pcb1, "pcb", { x: EX }); VT("epEdge", "ePCB", 4.22, 4.1, EY.pcb0, EY.pcb1, "pcbD", { x: EX });
const ring = (n, r, a0 = 0) => Array.from({ length: n }, (_, i) => { const a = (a0 + (i * 360) / n) * D2R; return [R2(r * Math.cos(a)), 0, R2(r * Math.sin(a))]; });
P({ id: "epCapT", layer: "ePCB", shape: "box", size: [0.2, 0.12, 0.12], pos: [EX, EY.pcb1 + 0.06, 0], at: [...ring(40, 3.3, 4), ...ring(40, 3.65, 0)], mat: "cap" });
P({ id: "epResT", layer: "ePCB", shape: "box", size: [0.14, 0.05, 0.07], pos: [EX, EY.pcb1 + 0.025, 0], at: ring(48, 3.95, 3), mat: "res" });
P({ id: "epCapB", layer: "ePCB", shape: "box", size: [0.2, 0.1, 0.12], pos: [EX, EY.pcb0 - 0.05, 0], at: [...ring(32, 1.9, 0), ...ring(32, 2.3, 6), ...ring(24, 2.8, 3)], mat: "cap" });
P({ id: "epResB", layer: "ePCB", shape: "box", size: [0.13, 0.05, 0.06], pos: [EX, EY.pcb0 - 0.025, 0], at: ring(36, 1.55, 2), mat: "res" });
P({ id: "epConn", layer: "ePCB", shape: "box", size: [0.7, 0.22, 0.3], pos: [EX, EY.pcb1 + 0.11, 0], at: ring(12, 3.95, 15).map(([x, y, z]) => [R2(x * 0.98), y, R2(z * 0.98)]), mat: "conn" });
P({ id: "epPadRing", layer: "ePCB", shape: "box", size: [0.08, 0.02, 0.08], pos: [EX, EY.pcb0 - 0.01, 0], at: [...ring(48, 1.25, 0), ...ring(48, 1.38, 3.75)], mat: "padGold" });
P({ id: "epPin", layer: "ePCB", shape: "cyl", size: [0.07, 0.3], rot: V, pos: [EX, EY.pcb1 + 0.12, 0], at: ring(3, 4.0, 60), mat: "gold" });
BOX("epName", "ePCB", EX - 1.2, EX + 0.2, EY.pcb1, EY.pcb1 + 0.02, 3.0, 3.5, "white"); BOX("epNameBar", "ePCB", EX - 1.15, EX - 0.4, EY.pcb1 + 0.02, EY.pcb1 + 0.03, 3.1, 3.2, "mark");
// 彈簧介面（方框＋彈簧針陣列，針頭金色）
LAY("eIP", [3, 0.4, EX, 4.0]);
const IPS = 1.45;
BOX("eiF", "eIP", EX - IPS, EX + IPS, EY.ip0, EY.ip1, IPS - 0.2, IPS, "darker"); BOX("eiB", "eIP", EX - IPS, EX + IPS, EY.ip0, EY.ip1, -IPS, -IPS + 0.2, "darker");
BOX("eiL", "eIP", EX - IPS, EX - IPS + 0.2, EY.ip0, EY.ip1, -IPS, IPS, "darker"); BOX("eiR", "eIP", EX + IPS - 0.2, EX + IPS, EY.ip0, EY.ip1, -IPS, IPS, "darker");
BOX("eiCore", "eIP", EX - IPS + 0.2, EX + IPS - 0.2, EY.ip0 + 0.06, EY.ip1 - 0.06, -IPS + 0.2, IPS - 0.2, "rubber");
P({ id: "eiPogo", layer: "eIP", shape: "cyl", size: [0.045, 0.3], rot: V, pos: [EX, (EY.ip0 + EY.ip1) / 2, 0], at: grid(10, 10, 0.24, 0.24, 0, 0), mat: "gold" });
P({ id: "eiPogoHead", layer: "eIP", shape: "sphere", size: [0.06], pos: [EX, EY.ip1 + 0.05, 0], at: grid(10, 10, 0.24, 0.24, 0, 0), mat: "padGold" });
// 空間轉換器（陶瓷：上側大焊墊、下側密焊墊，正面畫扇入走線）
LAY("eST", [2.4, 0.4, EX, 3.7]);
const STS = 1.2;
BOX("estBody", "eST", EX - STS, EX + STS, EY.st0, EY.st1, -STS, STS, "ceram");
P({ id: "estPadTop", layer: "eST", shape: "box", size: [0.2, 0.02, 0.2], pos: [EX, EY.st1 + 0.01, 0], at: grid(6, 6, 0.36, 0.36, 0, 0), mat: "padGold" });
P({ id: "estPadBot", layer: "eST", shape: "box", size: [0.06, 0.02, 0.06], pos: [EX, EY.st0 - 0.01, 0], at: grid(12, 12, 0.11, 0.11, 0, 0), mat: "padGold" });
for (let i = 0; i < 6; i++) { const xt = (i - 2.5) * 0.36, xb = (i - 2.5) * 0.11; SEG(`estFan${i}`, "eST", [EX + xt, EY.st1 - 0.01, STS + 0.01], [EX + xb, EY.st0 + 0.01, STS + 0.01], 0.018, "padGold"); }
P({ id: "estChamfer", layer: "eST", shape: "box", size: [0.12, 0.35, 0.12], pos: [EX, (EY.st0 + EY.st1) / 2, 0], at: [[-STS, 0, -STS], [STS, 0, -STS], [-STS, 0, STS], [STS, 0, STS]], rot: [0, 45, 0], mat: "ceramD" });
// 上、下導板（淺灰陶瓷、導孔陣列；下導板孔位往右偏 0.05）
const GS = 0.85;
LAY("eUG", [1.8, 0.2, EX, 3.36]);
BOX("eugPlate", "eUG", EX - GS, EX + GS, EY.ug0, EY.ug1, -GS, GS, "ceramD"); P({ id: "eugHole", layer: "eUG", shape: "cyl", size: [0.022, 0.02], rot: V, pos: [EX, EY.ug1 + 0.002, 0], at: grid(12, 12, 0.11, 0.11, 0, 0), mat: "darker" });
P({ id: "eugPin", layer: "eUG", shape: "cyl", size: [0.05, 0.14], rot: V, pos: [EX, EY.ug1 + 0.04, 0], at: [[-0.75, 0, -0.75], [0.75, 0, 0.75]], mat: "gold" });
LAY("eLG", [1.8, 0.2, EX, 2.91]);
BOX("elgPlate", "eLG", EX - GS, EX + GS, EY.lg0, EY.lg1, -GS, GS, "ceramD"); P({ id: "elgHole", layer: "eLG", shape: "cyl", size: [0.022, 0.02], rot: V, pos: [EX + 0.05, EY.lg0 - 0.002, 0], at: grid(12, 12, 0.11, 0.11, 0, 0), mat: "darker" });
// 針林（12×12＝144 根示意；實際數千到數萬根）：上段直、中段斜（兩片導板偏移壓出的弧度）、下段直、針尖
LAY("eNdl", [1.6, 1.0, EX, 3.08]);
const NG = grid(12, 12, 0.11, 0.11, 0, 0);
P({ id: "enTop", layer: "eNdl", shape: "cyl", size: [0.013, R2(EY.st0 - EY.ug0)], rot: V, pos: [EX, R2((EY.st0 + EY.ug0) / 2), 0], at: NG, mat: "needle" });
{ const a = [EX, EY.ug0], b = [EX + 0.05, EY.lg1], dx = b[0] - a[0], dy = b[1] - a[1], ang = (Math.atan2(dx, -dy) * 180) / Math.PI;
  P({ id: "enMid", layer: "eNdl", shape: "cyl", size: [0.013, R2(Math.hypot(dx, dy))], rot: [90, 0, R2(ang)], pos: [R2(EX + dx / 2), R2((a[1] + b[1]) / 2), 0], at: NG, mat: "needle" }); }
P({ id: "enBot", layer: "eNdl", shape: "cyl", size: [0.013, R2(EY.lg1 - EY.tip)], rot: V, pos: [EX + 0.05, R2((EY.lg1 + EY.tip) / 2), 0], at: NG, mat: "needle" });
P({ id: "enTip", layer: "eNdl", shape: "sphere", size: [0.018], pos: [EX + 0.05, EY.tip, 0], at: NG, mat: "needleHi" });
// 不平的針尖（第 8 幕：針越多越難壓得一樣平）：幾根針尖紅色發亮＋針尖平面
LAY("eTipHi", [1.6, 0.2, EX, 2.6]);
const hiIdx = [5, 22, 40, 61, 77, 95, 118, 133];
P({ id: "etHi", layer: "eTipHi", shape: "sphere", size: [0.07], pos: [EX + 0.05, EY.tip, 0], at: hiIdx.map((k) => NG[k]), mat: "tipNg" });
P({ id: "etPlane", layer: "eTipHi", shape: "box", size: [1.6, 0.006, 1.6], pos: [EX + 0.05, EY.tip - 0.02, 0], mat: "plane" });
// 頭髮（第 4 幕對照：比最密的針距還寬）
LAY("eHair", [0.2, 0.2, EX, 2.5]);
ZC("ehHair", "eHair", 0.085, -1.1, 1.1, EX + 0.05, EY.tip - 0.1, "hair");

// ═════ 站 N：針尖剖面（五根垂直針，放大示意：1＝約 10 µm） ═════
const NX = [86, 88, 90, 92, 94], NDEL = [0.06, -0.1, 0, 0.14, -0.04], NT = { st0: 7.9, ug0: 6.9, ug1: 7.4, lg0: 4.0, lg1: 4.5, tip0: 3.15, pad: 2.45 };
const OFF = 0.5, BOW0 = 0.32, NW = 0.2, GAP = 0.6, OD = 0.55, NSTEP = 8, SCRUB = 1.0;
LAY("nST", [14, 1, 90, 8.1]);
BOX("nstBody", "nST", 83.4, 96.6, NT.st0, NT.st0 + 1.0, -1, 1, "ceram"); for (const x of NX) BOX(`nstPad${x}`, "nST", x - 0.3, x + 0.3, NT.st0 - 0.06, NT.st0, -0.9, 0.9, "padGold");
for (let i = 0; i < 6; i++) BOX(`nstVia${i}`, "nST", 84.5 + i * 2.2, 84.6 + i * 2.2, NT.st0 + 0.1, NT.st0 + 0.9, 1.0, 1.02, "padGold");
const plate = (id, x0s, y0, y1) => { const xs = [83.4, ...x0s.flatMap((x) => [x - 0.2, x + 0.2]), 96.6]; for (let i = 0; i < xs.length; i += 2) BOX(`${id}${i / 2}`, id, xs[i], xs[i + 1], y0, y1, -1, 1, "ceramD"); };
LAY("nUG", [14, 0.5, 90, 6.85]); plate("nUG", NX, NT.ug0, NT.ug1);
LAY("nLG", [14, 0.5, 90, 3.95]); plate("nLG", NX.map((x) => x + OFF), NT.lg0, NT.lg1);
// 針的中心線：上段直 → 中段弧（偏移 OFF、往 −x 鼓 A）→ 下段（穿出下導板到針尖；壓縮 c 時針往上滑、尾端微斜＝刮動）
const midPts = (x, A, n = 14) => Array.from({ length: n + 1 }, (_, k) => { const t = k / n; return [x + OFF * t - A * Math.sin(Math.PI * t), NT.ug0 - (NT.ug0 - NT.lg1) * t]; });
const arcLen = (pts) => pts.slice(1).reduce((a, p, k) => a + Math.hypot(p[0] - pts[k][0], p[1] - pts[k][1]), 0);
const bowFor = (x, c) => { const L = arcLen(midPts(x, BOW0)) + c; let lo = BOW0, hi = 3; for (let it = 0; it < 40; it++) { const m = (lo + hi) / 2; if (arcLen(midPts(x, m)) < L) lo = m; else hi = m; } return lo; };
const centerline = (i, c) => { const x = NX[i], A = bowFor(x, c), tipY = NT.tip0 + NDEL[i] + c, s = SCRUB * c;
  return [[x, NT.st0], [x, NT.ug1], [x, NT.ug0], ...midPts(x, A).slice(1), [x + OFF + s * 0.25, NT.lg0], [x + OFF + s, tipY + 0.25], [x + OFF + s, tipY]]; };
const outline = (cl, w) => { const L = [], Rr = []; cl.forEach((p, k) => { const a = cl[Math.max(0, k - 1)], b = cl[Math.min(cl.length - 1, k + 1)], tx = b[0] - a[0], ty = b[1] - a[1], n = Math.hypot(tx, ty) || 1;
  const ww = k === cl.length - 1 ? 0.05 : k === cl.length - 2 ? w * 0.75 : w; L.push([p[0] - (ty / n) * ww / 2, p[1] + (tx / n) * ww / 2]); Rr.push([p[0] + (ty / n) * ww / 2, p[1] - (tx / n) * ww / 2]); }); return [...L, ...Rr.reverse()]; };
// 晶圓抬起量（R）的逐格：k＝0（接近完，GAP）… NSTEP（GAP＋OD）；每根針的壓縮 c＝max(0, R − (GAP＋0.1＋δ))，第一根（δ＝−0.1）在 R＝GAP 剛碰到
const Rk = (k) => GAP + (OD * k) / NSTEP, comp = (i, k) => Math.max(0, Rk(k) - (GAP + 0.1 + NDEL[i]));
for (let i = 0; i < 5; i++) for (let k = -1; k <= NSTEP; k++) {
  const id = `nN${i}_${k < 0 ? "r" : k}`, c = k < 0 ? 0 : comp(i, k); LAY(id, [2, 4.6, NX[i] + 0.3, 5.3]);
  const cl = centerline(i, c);
  POLY(`${id}p`, id, outline(cl, NW), 0.2, 0, "needle");
  const tp = cl.at(-1); SPH(`${id}t`, id, 0.09, R2(tp[0]), R2(tp[1] + 0.03), 0.12, k >= 0 && c > 0 ? "tipOk" : k >= 0 ? "tipNg" : "needleHi");
}
// 晶片剖面（跟著吸盤抬起）：矽、保護層（留開口）、鋁墊、氧化膜（藍灰半透明，跟鋁不同色）
LAY("nDie", [14, 2, 90, 1.5]);
BOX("ndSi", "nDie", 83.2, 96.8, 0.4, 2.1, -1.1, 1.1, "si"); BOX("ndChuck", "nDie", 83.0, 97.0, 0.1, 0.4, -1.2, 1.2, "steel2");
{ const xs = [83.2, ...NX.flatMap((x) => [x + OFF - 0.72, x + OFF + 0.72]), 96.8]; for (let i = 0; i < xs.length; i += 2) BOX(`ndPass${i / 2}`, "nDie", xs[i], xs[i + 1], 2.1, 2.52, -1.1, 1.1, "pass"); }
for (const x of NX) BOX(`ndPad${x}`, "nDie", x + OFF - 0.7, x + OFF + 0.7, 2.1, NT.pad - 0.08, -1.0, 1.0, "al");
BOX("ndMetal", "nDie", 83.6, 96.4, 1.75, 1.85, -1.0, 1.0, "padGold");
for (const x of NX) BOX(`ndVia${x}`, "nDie", x + OFF - 0.08, x + OFF + 0.08, 1.85, 2.1, -0.9, 0.9, "padGold");
LAY("nOx", [14, 0.2, 90, 2.42]);
for (const [k, x] of NX.entries()) if (k !== 2) BOX(`noOx${x}`, "nOx", x + OFF - 0.7, x + OFF + 0.7, NT.pad - 0.08, NT.pad, -1.0, 1.0, "ox");
// 中間那根（i＝2）的墊子：氧化膜分兩半（刮開處會露出亮金屬）、刮痕逐格變長、碎屑
LAY("nOx2", [1.4, 0.2, 90.5, 2.42]); BOX("noOx2", "nOx2", NX[2] + OFF - 0.7, NX[2] + OFF + 0.7, NT.pad - 0.08, NT.pad, -1.0, 1.0, "ox");
for (let k = 1; k <= NSTEP; k++) { const c = comp(2, k), s0 = SCRUB * comp(2, 0), s = SCRUB * c; LAY(`nScr${k}`, [1, 0.2, 90.6, 2.42]);
  BOX(`nscr${k}`, `nScr${k}`, R2(NX[2] + OFF + s0 - 0.08), R2(NX[2] + OFF + s + 0.08), NT.pad - 0.08, NT.pad + 0.03, -0.6, 0.6, "alShine"); }
const NIDS = ["nDie", "nOx", "nOx2", ...Array.from({ length: NSTEP }, (_, k) => `nScr${k + 1}`)];

// ═════ 站 K：三種針型（懸臂式、垂直式、微機電） ═════
LAY("kBase", [17, 1, 120, 0.5]); BOX("kPl", "kBase", 111.6, 128.4, 0, 0.9, -2.6, 2.6, "band"); BOX("kPlTop", "kBase", 111.6, 128.4, 0.9, 1.0, -2.6, 2.6, "panel2");
for (const x of [117.5, 122.5]) BOX(`kSep${x}`, "kBase", x - 0.04, x + 0.04, 1.0, 1.02, -2.4, 2.4, "seam");
const kPads = (id, x0, x1, pads, w) => { LAY(id, [x1 - x0, 1.4, (x0 + x1) / 2, 1.8]); BOX(`${id}Si`, id, x0, x1, 1.0, 2.6, -1.4, 1.4, "si"); BOX(`${id}Pass`, id, x0, x1, 2.6, 2.75, -1.4, 1.4, "pass");
  P({ id: `${id}Pad`, layer: id, shape: "box", size: [w, 0.1, w], pos: [0, 2.78, 0], at: pads, mat: "al" }); };
// 懸臂式：環氧樹脂環（斜切面）伸出粗鎢針，斜向下再折下來，針尖碰墊
LAY("kCant", [6, 3, 113, 4.5]);
BOX("kcPcb", "kCant", 110.6, 115.4, 6.2, 6.5, -1.6, 1.6, "pcb"); BOX("kcRing", "kCant", 109.8, 112.0, 5.3, 6.2, -1.4, 1.4, "epoxy");
P({ id: "kcCap", layer: "kCant", shape: "box", size: [0.25, 0.12, 0.14], pos: [0, 6.56, 0], at: [[110.2, 0, -1.2], [111, 0, -1.2], [114.5, 0, 1.2], [115.3, 0, 1.2], [114.5, 0, -1.2]], mat: "cap" });
const CZ = [-0.9, -0.3, 0.3, 0.9];
for (const [k, z] of CZ.entries()) { SEG(`kcN${k}`, "kCant", [111.8, 5.7, z], [114.0, 3.55, z], 0.07, "needle"); SEG(`kcT${k}`, "kCant", [114.0, 3.55, z], [114.12, 2.95, z], 0.06, "needle"); }
kPads("kcDie", 111.0, 115.3, CZ.map((z) => [114.12, 0, z]), 0.55);
// 垂直式：上板＋上下導板（半透明陶瓷）、五根中段有弧度的針
LAY("kVert", [5, 3, 120, 4.5]);
BOX("kvST", "kVert", 117.6, 122.4, 5.8, 6.4, -1.4, 1.4, "ceram"); BOX("kvUG", "kVert", 117.8, 122.2, 5.3, 5.5, -1.2, -0.3, "ceramD"); BOX("kvLG", "kVert", 117.8, 122.2, 3.6, 3.8, -1.2, -0.3, "ceramD"); P({ id: "kvPost", layer: "kVert", shape: "box", size: [0.16, 2.0, 0.16], pos: [0, 4.8, -1.0], at: [[117.9, 0, 0], [122.1, 0, 0]], mat: "steel" });
const VXs = [118.9, 119.45, 120, 120.55, 121.1];
for (const [k, x] of VXs.entries()) for (const z of [-0.5, 0.5]) { const q = `${k}${z > 0 ? "f" : "b"}`; SEG(`kvA${q}`, "kVert", [x, 5.8, z], [x, 5.3, z], 0.035, "needle"); SEG(`kvB${q}`, "kVert", [x, 5.3, z], [x - 0.12, 4.55, z], 0.035, "needle"); SEG(`kvC${q}`, "kVert", [x - 0.12, 4.55, z], [x + 0.15, 3.8, z], 0.035, "needle"); SEG(`kvD${q}`, "kVert", [x + 0.15, 3.8, z], [x + 0.15, 2.95, z], 0.035, "needle"); }
kPads("kvDie", 117.6, 122.4, VXs.flatMap((x) => [-0.5, 0.5].map((z) => [x + 0.15, 0, z])), 0.32);
// 微機電：陶瓷基板＋一排排半導體製程做的 S 形微彈簧針（9 根 × 3 排）
LAY("kMems", [5, 3, 127, 4.5]);
BOX("kmSub", "kMems", 124.6, 129.4, 5.6, 6.2, -1.4, 1.4, "ceram"); P({ id: "kmPad", layer: "kMems", shape: "box", size: [0.2, 0.03, 0.2], pos: [0, 5.585, 0], at: grid(9, 3, 0.4, 0.6, 127, 0).map(([x, y, z]) => [x, 0, z]), mat: "padGold" });
const MXs = grid(9, 3, 0.4, 0.6, 127, 0).map(([x, , z]) => [x, z]);
const mAt = (dx, y) => MXs.map(([x, z]) => [R2(x + dx), y, z]);
P({ id: "kmPost", layer: "kMems", shape: "box", size: [0.07, 0.5, 0.07], pos: [0, 0, 0], at: mAt(0, 5.35), mat: "ni" });
P({ id: "kmArm1", layer: "kMems", shape: "box", size: [0.28, 0.06, 0.07], pos: [0, 0, 0], at: mAt(0.11, 5.1), mat: "ni" });
P({ id: "kmPost2", layer: "kMems", shape: "box", size: [0.07, 0.55, 0.07], pos: [0, 0, 0], at: mAt(0.22, 4.82), mat: "ni" });
P({ id: "kmArm2", layer: "kMems", shape: "box", size: [0.28, 0.06, 0.07], pos: [0, 0, 0], at: mAt(0.11, 4.55), mat: "ni" });
P({ id: "kmPost3", layer: "kMems", shape: "box", size: [0.07, 1.4, 0.07], pos: [0, 0, 0], at: mAt(0, 3.85), mat: "ni" });
P({ id: "kmTip", layer: "kMems", shape: "cone", size: [0.06, 0.005, 0.18], rot: [-90, 0, 0], pos: [0, 0, 0], at: mAt(0, 3.06), mat: "needleHi" });
kPads("kmDie", 124.6, 129.4, MXs.map(([x, z]) => [x, 0, z]), 0.22);
// 演進箭頭（底座上：懸臂 → 垂直 → 微機電）
LAY("kArrow", [16, 0.2, 120, 1.05]);
BOX("kaBar", "kArrow", 113.5, 125.2, 1.0, 1.06, 2.0, 2.2, "mark");
P({ id: "kaHead", layer: "kArrow", shape: "cone", size: [0.001, 0.32, 0.6], rot: [0, 90, 0], pos: [125.5, 1.06, 2.1], mat: "mark" });

// 三組往中間靠（懸臂 +2.1、微機電 −2.0），整站寬約 17 單位，鏡頭才推得近
for (const [lays, dx] of [[["kCant", "kcDie"], 2.1], [["kMems", "kmDie"], -2.0]]) for (const q of parts) if (lays.includes(q.layer)) { if (q.at && Math.abs(q.pos[0]) < 1e-6) q.at = q.at.map(([x, y, z]) => [R2(x + dx), y, z]); else q.pos[0] = R2(q.pos[0] + dx); }
for (const l of layers) { if (["kCant", "kcDie"].includes(l.id)) l.outline[2] = R2(l.outline[2] + 2.1); if (["kMems", "kmDie"].includes(l.id)) l.outline[2] = R2(l.outline[2] - 2.0); }
// ═════ 動作 ═════
actions.aTipGlow = { type: "pulse", _說明: "第 3 幕：針碰到晶圓接點時針區發亮（接觸）", parts: ["acNeedle", "acHead"], color: "okC", glow: 0.8, freq: 1.6, halo: 0.9 };
actions.wQPulse = { type: "pulse", _說明: "第 1 幕：幾顆晶片輪流發亮（哪顆是好的？）", parts: ["wQDie"], color: "lampY", glow: 0.9, freq: 1.2, halo: 0 };
actions.etHiPulse = { type: "pulse", _說明: "第 8 幕：高低不平的針尖（紅）閃", parts: ["etHi"], color: "ngC", glow: 0.9, freq: 1.4, halo: 0 };
actions.wSitePulse = { type: "pulse", parts: ["wsF", "wsB", "wsL", "wsR"], color: "siteC", glow: 0.9, freq: 2.2, halo: 0 };
// 測試機送訊號（藍）：機櫃 → 排線 → 測試頭 → 探針卡 → 針；晶片回答（綠）：反方向
const SIGP = [[11.2, 11.9, 0], [11.2, 12.9, 0], [6.4, 12.9, 0], [6.4, 11.6, 0], [3.9, 11.6, 0], [0.5, 11.2, 0], [0.3, 9.4, 0], [0.2, 8.5, 0], [0.1, 8.0, 0]];
actions.sigDown = { type: "flow", layer: "aCable", _說明: "測試機送出的測試訊號（出題）沿排線、測試頭、探針卡往下到針", path: SIGP, n: 8, size: 0.16, shape: "dot", rate: 0.45, color: "sigC", track: false, trail: 3, trailGap: 0.5 };
actions.sigUp = { type: "flow", layer: "aCable", _說明: "晶片回應（作答）沿同一路往回送到測試機判讀", path: [...SIGP].reverse().map(([x, y, z]) => [x, y, x >= 3.9 ? z + 0.6 : z]), n: 6, size: 0.14, shape: "dot", rate: 0.45, color: "retC", track: false, trail: 3, trailGap: 0.5, phase: 0.5 };
actions.thLed = { type: "pulse", parts: ["athLed", "atLed0", "atLed1", "atLed2"], color: "lampG", glow: 1, freq: 3, halo: 0 };
// 刮破氧化膜：碎屑從針尖往前噴、掉落；接通後電流（綠）沿針往上
const tipC = centerline(2, comp(2, NSTEP)), tipEnd = tipC.at(-1);
actions.nDebris = { type: "flow", _說明: "針尖刮動時刮下的氧化膜碎屑往刮動方向飛出、受重力落在墊面（拋物線）", layer: "nOx2", path: [[R2(tipEnd[0] - 0.05), NT.pad + 0.02, 0.3], [R2(tipEnd[0] + 0.35), NT.pad + 0.2, 0.5], [R2(tipEnd[0] + 0.62), NT.pad + 0.03, 0.6]], n: 8, size: 0.085, shape: "dot", rate: 0.9, color: "oxC", track: false, free: true, jitter: 0.05, accel: true };
actions.nCurrent = { type: "flow", layer: "nST", _說明: "接通後電流從晶片接點沿針往上到空間轉換器（綠點）", path: [...tipC].reverse().filter((_, k) => k % 2 === 0).map(([x, y]) => [R2(x), R2(y), 0.15]), n: 7, size: 0.1, shape: "dot", rate: 0.7, color: "okC", track: false, trail: 2, trailGap: 0.4 };
actions.nGlowOk = { type: "pulse", parts: ["ndPad90"], color: "okC", glow: 0.7, freq: 1.5, halo: 0 };
// 三種針型各壓一下：墊片往上頂、針微震
actions.kcBuzz = { type: "vibrate", parts: idsOf("kCant").filter((i) => i.startsWith("kcT")), axis: [1, 0, 0], amp: 0.03, freq: 3 };

// 標註點
Object.assign(anchors, {
  aProber: A("aBase", [5.8, 4.3, 5.5], 150, 110), aCamA: A("aCam", [-4.3, 7.62, 0.4], -150, -90), aCardA: A("aCard", [1.2, 8.38, 1.8], 160, -60), aWafer: A("aZ", [1.1, 7.18, 0.9], 150, 90), aTH: A("aTH", [2.4, 12.4, 3.2], 150, -90),
  aTester: A("aTester", [10.2, 11.0, 3.0], -150, -90), aNeedleA: A("aCard", [0.4, 7.95, 0.5], 150, 90), aCable: A("aCable", [8.0, 12.9, 0.6], -120, -100), aChuck: A("aZ", [-1.6, 6.9, 0.6], -150, 90),
  wDieA: A("wWafer", [WX + 1.4, 1.06, 2.2], 150, 100), wSiteA: A("wSite", [SX + 0.55, 1.16, ROWZ], 150, -100), wInkA: A("wInkDone", [WX + dies.find(([x, z], k) => z < ROWZ - 0.01 && fail[k])[0], 1.1, dies.find(([x, z], k) => z < ROWZ - 0.01 && fail[k])[1]], -150, -100),
  eDockA: A("eDock", [EX + 3.4, 5.3, 1.6], 150, -90), eStiffA: A("eStiff", [EX + 2.4, 4.6, 1.4], 150, -100), ePCBA: A("ePCB", [EX + 3.6, 4.28, 1.8], 150, -90), eIPA: A("eIP", [EX + 1.2, 4.1, 1.2], 150, -80),
  eSTA: A("eST", [EX + 1.0, 3.9, 1.2], 150, -80), eUGA: A("eUG", [EX + 0.8, 3.42, 0.8], 150, -80), eLGA: A("eLG", [EX - 0.8, 2.85, 0.8], -150, 90), eNdlA: A("eNdl", [EX + 0.6, 2.62, 0.6], 150, 90),
  eHairA: A("eHair", [EX + 0.05, 2.5, 1.4], 150, 90), eTipA: A("eTipHi", [EX + 0.05 + NG[61][0], 2.6, NG[61][2]], 150, 90),
  nNdlA: A("nST", [90.4, 5.4, 0.1], 150, -90), nPadA: A("nOx2", [90.9, 2.45, 0.6], 150, 100), nOxA: A("nOx2", [90.1, NT.pad, 0.8], -150, 100), nOnA: A("nOx2", [R2(tipEnd[0]), NT.pad, 0.2], 150, 100),
  nTipNg: A("nST", [NX[3] + OFF, NT.tip0 + NDEL[3], 0.1], 150, 80), nScrA: A("nOx2", [R2(tipEnd[0] - 0.1), NT.pad, 0.3], -150, 100),
  kCantA: A("kCant", [115.0, 4.65, 0.9], -150, -100), kVertA: A("kVert", [120.6, 4.2, 0.5], 150, -100), kMemsA: A("kMems", [125.8, 4.3, 0.6], 150, -100),
});
// 註：nNdlA 綁在 nST 層（不動），點在中間那根針的弧上

const model = {
  name: "示意 探針卡與晶圓針測：針測機台（吸盤 XY 平台、對位相機、頂板）、測試頭與測試機、探針卡分解（加固板、主板、彈簧針板、空間轉換器、上下導板、針）、針尖剖面（彎曲、刮破氧化膜）、三種針型（示意，非特定廠牌／型號）",
  unit: "示意（站 A：1＝10 cm；其他站放大）",
  size: { w: 40, h: 18, r: 0.6, t: 30 },
  palette, materials,
  partNames: { aCard: "探針卡", aTH: "測試頭", aTester: "測試機", eST: "空間轉換器" },
  layers, parts, anchors, actions,
  pose: { yaw0: 0, yawIso: 0, drift: 0 },
  camera: { stand: { d: 70, elev: 24, y: 4 } },
  fx: { dpr: 1, srcPx: 30, shadows: 0, fog: false, dust: false, vaporSprites: false, shimmer: false },
  info: { WX, WP, ROWZ, WSTEPS, SITE0, EX, EY, NX, NDEL, NT, GAP, OD, NSTEP, OFF, NIDS, nDies: dies.length, nFailDone: parts.find((p) => p.id === "wInkD").at.length },
};
fs.writeFileSync(path.join(HERE, "model.json"), JSON.stringify(model, null, 1) + "\n");
console.log(`✔ model.json：${parts.length} 個零件、${parts.reduce((a, p) => a + Math.max(1, p.at?.length ?? 0), 0)} 個實體、${layers.length} 層；晶片 ${dies.length} 顆`);

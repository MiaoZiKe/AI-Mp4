// node videos/tech-twequip/gen-model.mjs → 寫 videos/tech-twequip/model.json
// 2026/11/27 tech-twequip（系列 2 第 12 集：台灣自己的設備廠）。構造與物理照 physics-spec.md、模組清單照 visual-spec.md。
// 單位：1＝10 cm（晶圓直徑 300 mm＝3），地板 y＝0，x 向右、z 向觀眾。外形與比例是示意（依一般構造與專利原理，非弘塑／辛耘實機尺寸）。
// ① 前端搬運區（x −12.2～−2.9，高約晶圓盒 5 倍）：3 個裝載埠＋晶圓盒、頂上 3 台風扇濾網、地板沖孔板、單臂雙刀大氣手臂（立柱＋Z 軸螺桿）、預對準器、送片窄縫
// ② 清洗機（x −2.7～10.3，2×2 共 4 腔）：下層近側腔 C1 全細節（吸盤＋邊緣抓取銷＋空心軸＋馬達、三層擋液杯、擺動噴嘴臂、IPA 臂、背面噴嘴、排液／排氣、閥島）；其他三腔簡化
// ③ 電控箱（x 10.8～14.0，門平常關著）與化學液櫃（x 14.6～26.6：藥液桶、幫浦、濾芯、加熱、混合閥島、管路）
// ④ 批次酸槽（x 34～54，對照，只在一幕出場）：6 槽＋溢流堰＋卡匣＋沿導軌的搬運手臂
import fs from "node:fs";
import path from "node:path";

const R2 = (x) => Math.round(x * 1000) / 1000;
const D2R = Math.PI / 180;
const pol = (aDeg, r) => [R2(r * Math.cos(aDeg * D2R)), R2(r * Math.sin(aDeg * D2R))]; // (x, z)

const palette = {
  floorC: "#C9D2DE", panel: "#F3F5F8", panel2: "#E2E8F0", seam: "#8E9BB0", band: "#24324C", steel: "#7D8CA6", steel2: "#A9B5C7", dark: "#3E4A60",
  glassC: "#BFD3F2", waferC: "#5F7FB8", dieC: "#7FA4E0", foupC: "#E8E2D4", lampY: "#F2B632", lampG: "#2FBF71", lampR: "#E5484D", screen: "#5B8DEF",
  pipeB: "#3E7BD6", pipeR: "#D9534F", rubber: "#2B2F36", light: "#9FD8FF", lightW: "#E8F4FF", lightR: "#7EE0C8", pcbC: "#1F6B45", chipC: "#1C1F26",
  traceC: "#C9A24A", connC: "#2A2D33", ribbonC: "#B8BEC8", estop: "#D93A2B", knurl: "#5C6678", gold: "#C9A24A", defect: "#FF5A36",
  pe: "#F2F4F6", peBand: "#D8DEE6", pvdf: "#EFE9D6", pfa: "#F4F1E6", quartz: "#CFEBF2", liqC: "#58C9D8", liqW: "#4FA3FF", liqChem: "#FFA24D", liqIpa: "#B07CFF", n2: "#BFEFFF",
  tankA: "#E8A317", tankB: "#2A7F8F", tankC: "#8B7CD8", markC: "#D9482B", wetC: "#7CCFE0", hotC: "#FF9A52", spark: "#FFFFFF",
};
const M = (kind, color, o = {}) => ({ kind, color, ...o });
const glowM = (c, op, ei = 1) => M("std", c, { emissive: c, ei, opacity: op, rough: 1, metal: 0 });
const materials = {
  floor: M("std", "floorC", { rough: 0.7, metal: 0.3, tex: "brushed", texScale: 3 }),
  panel: M("std", "panel", { rough: 0.55, metal: 0.05, env: 0.25 }), panel2: M("std", "panel2", { rough: 0.6, metal: 0.05, env: 0.2 }),
  seam: M("std", "seam", { rough: 0.6, metal: 0.3 }), band: M("std", "band", { rough: 0.4, metal: 0.3, env: 0.4 }),
  steel: M("std", "steel", { rough: 0.35, metal: 0.85, env: 0.5 }), steel2: M("std", "steel2", { rough: 0.3, metal: 0.8, env: 0.6, tex: "brushed", texScale: 2 }),
  dark: M("std", "dark", { rough: 0.5, metal: 0.4, env: 0.3 }),
  window: M("phys", "glassC", { rough: 0.05, metal: 0, clearcoat: 1, opacity: 0.4, env: 0.6 }), glassDoor: M("phys", "glassC", { rough: 0.05, metal: 0, clearcoat: 1, opacity: 0.28, env: 0.6 }),
  wafer: M("phys", "waferC", { rough: 0.15, metal: 0.6, clearcoat: 0.9, env: 0.9 }), dieM: M("std", "dieC", { rough: 0.25, metal: 0.5, env: 0.8 }),
  foup: M("phys", "foupC", { rough: 0.35, metal: 0, clearcoat: 0.4, env: 0.3, opacity: 0.5 }), foupDoor: M("std", "panel2", { rough: 0.5, metal: 0 }),
  lampY: M("std", "lampY", { emissive: "lampY", ei: 0.4, rough: 0.4, metal: 0 }), lampG: M("std", "lampG", { emissive: "lampG", ei: 0.35, rough: 0.4, metal: 0 }), lampR: M("std", "lampR", { emissive: "lampR", ei: 0.2, rough: 0.4, metal: 0 }),
  screen: M("std", "screen", { emissive: "screen", ei: 0.5, rough: 0.3, metal: 0 }), pipeB: M("std", "pipeB", { rough: 0.35, metal: 0.6, env: 0.4 }), pipeR: M("std", "pipeR", { rough: 0.35, metal: 0.6, env: 0.4 }),
  rubber: M("std", "rubber", { rough: 0.9, metal: 0 }), gold: M("std", "gold", { rough: 0.3, metal: 0.9, env: 0.8 }),
  pcb: M("std", "pcbC", { rough: 0.5, metal: 0.1 }), chip: M("std", "chipC", { rough: 0.35, metal: 0.2, env: 0.4 }), trace: M("std", "traceC", { rough: 0.3, metal: 0.9, env: 0.6 }),
  conn: M("std", "connC", { rough: 0.5, metal: 0.2 }), ribbon: M("std", "ribbonC", { rough: 0.7, metal: 0 }), estop: M("std", "estop", { rough: 0.4, metal: 0, emissive: "estop", ei: 0.15 }), knurl: M("std", "knurl", { rough: 0.4, metal: 0.8, env: 0.5 }),
  pe: M("std", "pe", { rough: 0.5, metal: 0, env: 0.3 }), peBand: M("std", "peBand", { rough: 0.5, metal: 0 }), pvdf: M("std", "pvdf", { rough: 0.45, metal: 0, env: 0.3 }), pfa: M("phys", "pfa", { rough: 0.3, metal: 0, clearcoat: 0.6, opacity: 0.7, env: 0.5 }),
  quartz: M("phys", "quartz", { rough: 0.05, metal: 0, clearcoat: 1, opacity: 0.35, env: 0.8 }), liqTank: M("std", "liqC", { opacity: 0.45, rough: 0.1, metal: 0, env: 0.5 }),
  tankA: M("std", "tankA", { rough: 0.5, metal: 0 }), tankB: M("std", "tankB", { rough: 0.5, metal: 0 }), tankC: M("std", "tankC", { rough: 0.5, metal: 0 }), markC: M("std", "markC", { rough: 0.5, metal: 0 }),
  // 液體：薄液膜（疊多層，中心較厚＝先厚後薄）、液柱、邊緣隆起、杯內三層（化學液橘、純水藍、IPA 紫）、氮氣
  film: M("std", "liqC", { opacity: 0.2, rough: 0.05, metal: 0, env: 0.7 }), filmEdge: glowM("lightW", 0.6, 0.6), stream: M("std", "liqC", { opacity: 0.78, rough: 0.05, metal: 0, env: 0.6, emissive: "liqC", ei: 0.25 }),
  cupWall: M("phys", "glassC", { rough: 0.08, metal: 0, clearcoat: 1, opacity: 0.2, env: 0.7 }), cupChem: M("std", "liqChem", { opacity: 0.55, rough: 0.2, metal: 0, env: 0.5, emissive: "liqChem", ei: 0.15 }),
  cupWater: M("std", "liqW", { opacity: 0.55, rough: 0.2, metal: 0, env: 0.5, emissive: "liqW", ei: 0.15 }), cupIpa: M("std", "liqIpa", { opacity: 0.55, rough: 0.2, metal: 0, env: 0.5, emissive: "liqIpa", ei: 0.15 }),
  cupHot: glowM("hotC", 0.32, 0.5), ipaBeam: glowM("liqIpa", 0.65, 0.8), n2Beam: glowM("n2", 0.35, 0.5), wetFlag: glowM("liqW", 0.6, 0.8), dryHi: glowM("lightR", 0.55, 0.7),
  mapBeam: glowM("lampR", 0.9, 1), airC: glowM("light", 0.4, 0.5), mark: M("std", "markC", { rough: 0.5, metal: 0 }),
};
const parts = [], layers = [], anchors = {}, actions = {};
const P = (o) => { parts.push(o); return o; };
const SEG = (o, ax, n) => {
  const th = ((o.rot?.[1] ?? 0) * Math.PI) / 180, dir = ax === 0 ? [Math.cos(th), 0, -Math.sin(th)] : [Math.sin(th), 0, Math.cos(th)];
  const L = o.size[ax], l = L / n, base = o.at ?? [[0, 0, 0]], at = [];
  for (const b of base) for (let i = 0; i < n; i++) { const u = (i - (n - 1) / 2) * l; at.push([R2((b[0] ?? 0) + dir[0] * u), R2(b[1] ?? 0), R2((b[2] ?? 0) + dir[2] * u)]); }
  const size = [...o.size]; size[ax] = R2(l * 1.04);
  return P({ ...o, size, at });
};
const LAY = (id, outline, bg) => layers.push({ id, z: 0, k: 0, outline, ...(bg ? { bg: true } : {}) });
const V = [90, 0, 0];
const BOX = (id, layer, x0, x1, y0, y1, z0, z1, mat, o = {}) => P({ id, layer, shape: "box", size: [R2(x1 - x0), R2(y1 - y0), R2(z1 - z0)], pos: [R2((x0 + x1) / 2), R2((y0 + y1) / 2), R2((z0 + z1) / 2)], mat, ...o });
const SCREWS = (id, layer, pts, mat = "steel", r = 0.05, ax = "z") => P({ id, layer, shape: "cyl", size: [r, 0.04], rot: ax === "z" ? [0, 0, 0] : ax === "x" ? [0, 90, 0] : V, pos: [0, 0, 0], at: pts, mat });
const grid = (x0, x1, nx, y0, y1, ny, z) => { const o = []; for (let i = 0; i < nx; i++) for (let j = 0; j < ny; j++) o.push([R2(x0 + ((x1 - x0) * i) / Math.max(1, nx - 1)), R2(y0 + ((y1 - y0) * j) / Math.max(1, ny - 1)), z]); return o; };
const ring = (id, layer, cx, y, cz, ro, ri, h, mat, o = {}) => P({ id, layer, shape: "tube", size: [ro, ri, h], rot: V, pos: [cx, y, cz], mat, ...o });
const cylY = (id, layer, cx, y, cz, r, h, mat, o = {}) => P({ id, layer, shape: "cyl", size: [r, h], rot: V, pos: [cx, y, cz], mat, ...o });

// ═════ 共用尺寸 ═════
const YW = 8.45, WT = 0.08, WR = 1.5;               // 晶圓中心高（全程搬運高度）、厚、半徑
const EX0 = -12.2, EX1 = -2.9, EZ = 7, EH = 18;     // 前端搬運區：左牆外面、右牆外面、半深、高（≈晶圓盒 3.65 的 5 倍）
const RB = [-7.6, 0], L1 = 3.6, BL = 2.3;           // 大氣手臂底座、臂長、刀片到夾持點長
const FZ = [-4.4, 0, 4.4], FX = EX0 - 1.65;         // 三個裝載埠的 z、晶圓盒中心 x
const ALN = [-9.6, 5.2];                            // 預對準器
const CX1 = 0.3;                                    // C1 吸盤中心 x
const CHW = 3.2, CHD = 4.0, CHH = 11.2, YB0 = 0.6, YBU = 11.8;  // 腔體半寬、半深、高、下層底、上層底
const BLH = 0.54;                                   // 下刀片比上刀片低多少

// ═════ 地板 ═════
LAY("floor", [100, 2, 20, -0.3], true);
P({ id: "floor", layer: "floor", shape: "slab", size: [100, 0.5, 46], r: 0.2, pos: [20, -0.25, 0], mat: "floor" });
P({ id: "floorSeam", layer: "floor", shape: "slab", size: [100, 0.04, 0.1], pos: [20, 0.01, 0], at: Array.from({ length: 8 }, (_, i) => [0, 0, -20 + i * 6]), mat: "seam" });

// ═════ ① 前端搬運區 EFEM ═════
LAY("efem", [9.4, EH, -7.55, EH / 2]); LAY("efemFront", [9.4, EH, -7.55, EH / 2]); LAY("ffu", [9.4, 2, -7.55, EH + 0.6]); LAY("efemFloor", [9.4, 0.4, -7.55, 0.7]);
// 機殼：後牆、左牆（三個裝載埠開口）、右牆（通清洗機，z ±1.9、y 7.7–9.15 開送片窄縫）、底座腰帶、地板沖孔板
BOX("efemBack", "efem", EX0, EX1, 0.6, EH, -EZ - 0.2, -EZ, "panel");
BOX("efemBase", "efem", EX0, EX1, 0, 0.6, -EZ - 0.2, EZ + 0.2, "band");
{ const cuts = [[-EZ - 0.2, FZ[0] - 1.95], [FZ[0] + 1.95, FZ[1] - 1.95], [FZ[1] + 1.95, FZ[2] - 1.95], [FZ[2] + 1.95, EZ + 0.2]];
  cuts.forEach(([z0, z1], i) => { if (z1 - z0 > 0.01) BOX(`efemLw${i}`, "efem", EX0, EX0 + 0.2, 0.6, EH, z0, z1, "panel"); }); }
FZ.forEach((c, i) => { BOX(`efemLwLo${i}`, "efem", EX0, EX0 + 0.2, 0.6, 6.4, c - 1.95, c + 1.95, "panel"); BOX(`efemLwHi${i}`, "efem", EX0, EX0 + 0.2, 10.4, EH, c - 1.95, c + 1.95, "panel"); });
BOX("slotWallA", "efem", EX1 - 0.2, EX1, 0.6, EH, -EZ - 0.2, -1.9, "panel2"); BOX("slotWallB", "efem", EX1 - 0.2, EX1, 0.6, EH, 1.9, EZ + 0.2, "panel2");
BOX("slotWallLo", "efem", EX1 - 0.2, EX1, 0.6, 7.7, -1.9, 1.9, "panel2"); BOX("slotWallHi", "efem", EX1 - 0.2, EX1, 9.15, EH, -1.9, 1.9, "panel2");
BOX("slotLip", "efem", EX1 - 0.25, EX1 - 0.15, 9.15, 9.25, -2.0, 2.0, "dark"); BOX("slotLipLo", "efem", EX1 - 0.25, EX1 - 0.15, 7.6, 7.7, -2.0, 2.0, "dark");
// 地板沖孔板（氣流由此排出）：整面圓孔陣列＋導流槽
P({ id: "efemPlate", layer: "efemFloor", shape: "slab", size: [9.0, 0.12, 13.8], r: 0.05, pos: [-7.55, 0.66, 0], mat: "steel2" });
P({ id: "efemHole", layer: "efemFloor", shape: "cyl", size: [0.11, 0.02], rot: V, pos: [-7.55, 0.73, 0], at: Array.from({ length: 12 * 20 }, (_, i) => [R2(-4.1 + (i % 12) * 0.745), 0, R2(-6.3 + Math.floor(i / 12) * 0.66)]), mat: "dark" });
// 正面（朝觀眾）：不透明面板分塊＋接縫＋螺絲＋觀察窗＋門把＋旋轉扣＋銘板（s3 講搬運時整片滑開）
BOX("efemFront", "efemFront", EX0, EX1, 0.6, EH, EZ, EZ + 0.2, "panel");
BOX("efemFrontWin", "efemFront", -11.2, -4.0, 6.5, 12.5, EZ + 0.2, EZ + 0.28, "window");
BOX("efemFrontWinFrame", "efemFront", -11.35, -3.85, 6.35, 6.5, EZ + 0.2, EZ + 0.3, "dark", { at: [[0, 0, 0], [0, 6.15, 0]] });
BOX("efemFrontWinFrameV", "efemFront", -11.35, -11.2, 6.35, 12.65, EZ + 0.2, EZ + 0.3, "dark", { at: [[0, 0, 0], [7.5, 0, 0]] });
BOX("efemFrontBand", "efemFront", EX0, EX1, 1.4, 2.0, EZ + 0.2, EZ + 0.3, "band");
BOX("efemSeamH", "efemFront", EX0, EX1, 13.45, 13.5, EZ + 0.2, EZ + 0.27, "seam", { at: [[0, 0, 0], [0, -9.5, 0]] });
BOX("efemSeamV", "efemFront", -7.575, -7.525, 0.6, EH, EZ + 0.2, EZ + 0.27, "seam");
SCREWS("efemScrew", "efemFront", grid(-11.9, -3.2, 6, 1.0, 17.4, 5, EZ + 0.24));
BOX("efemHandle", "efemFront", -7.1, -6.8, 8.5, 11.5, EZ + 0.28, EZ + 0.5, "dark", { at: [[0, 0, 0], [-0.9, 0, 0]] });
P({ id: "efemTurn", layer: "efemFront", shape: "cyl", size: [0.16, 0.12], rot: [0, 0, 0], pos: [-4.2, 15.4, EZ + 0.26], at: [[0, 0, 0], [-6.5, 0, 0], [0, -4, 0]], mat: "steel" });
P({ id: "efemPlate2", layer: "efemFront", shape: "slab", size: [1.8, 0.5, 0.05], r: 0.04, pos: [-4.8, 16.6, EZ + 0.24], mat: "dark" });
P({ id: "efemEstop", layer: "efemFront", shape: "cyl", size: [0.3, 0.18], rot: [0, 0, 0], pos: [-3.7, 13.6, EZ + 0.32], mat: "estop" });
P({ id: "efemGrille", layer: "efemFront", shape: "box", size: [3.2, 0.08, 0.05], pos: [-9.6, 2.6, EZ + 0.26], at: Array.from({ length: 7 }, (_, i) => [0, i * 0.3, 0]), mat: "dark" });
// 搬運區頂：3 台風扇濾網（外框＋風扇護網同心圈＋輻條＋馬達蓋＋電源線），天花板下方可見摺紋濾網
P({ id: "ffuRoof", layer: "ffu", shape: "slab", size: [9.3, 0.3, 14.4], r: 0.1, pos: [-7.55, EH + 0.15, 0], mat: "panel2" });
FZ.forEach((z, i) => {
  P({ id: `ffuBox${i}`, layer: "ffu", shape: "slab", size: [6.2, 0.9, 3.9], r: 0.1, pos: [-7.55, EH + 0.75, z], mat: "panel" });
  ring(`ffuRing${i}`, "ffu", -7.55, EH + 1.22, z, 1.45, 1.38, 0.05, "steel"); ring(`ffuRing2${i}`, "ffu", -7.55, EH + 1.22, z, 0.95, 0.9, 0.05, "steel"); ring(`ffuRing3${i}`, "ffu", -7.55, EH + 1.22, z, 0.45, 0.4, 0.05, "steel");
  cylY(`ffuCap${i}`, "ffu", -7.55, EH + 1.24, z, 0.22, 0.12, "dark");
  P({ id: `ffuSpoke${i}`, layer: "ffu", shape: "box", size: [2.9, 0.04, 0.05], pos: [-7.55, EH + 1.22, z], at: [[0, 0, 0]], rot: [0, 0, 0], mat: "steel" });
  P({ id: `ffuSpoke2${i}`, layer: "ffu", shape: "box", size: [0.05, 0.04, 2.9], pos: [-7.55, EH + 1.22, z], mat: "steel" });
  BOX(`ffuCable${i}`, "ffu", -4.6, -4.45, EH + 0.5, EH + 0.9, z - 0.15, z + 0.15, "conn");
  P({ id: `ffuLouver${i}`, layer: "ffu", shape: "box", size: [0.05, 0.08, 3.2], pos: [-10.67, EH + 0.45, z], at: Array.from({ length: 4 }, (_, j) => [0, j * 0.18, 0]), mat: "dark" });
  P({ id: `ffuPleat${i}`, layer: "ffu", shape: "box", size: [0.04, 0.08, 3.6], pos: [-7.55, EH - 0.06, z], at: Array.from({ length: 44 }, (_, j) => [R2(-2.8 + j * 0.13), 0, 0]), mat: "steel2" });
});
// 離子風扇（除靜電）：頂部長條，兩端離子針
BOX("ionBar", "ffu", -9.8, -5.3, EH - 0.55, EH - 0.25, -0.35, 0.35, "dark");
P({ id: "ionNeedle", layer: "ffu", shape: "cone", size: [0.005, 0.04, 0.3], rot: V, pos: [-9.8, EH - 0.7, 0], at: [[0, 0, 0], [4.5, 0, 0]], mat: "steel" });
// 裝載埠（三座）：托板＋三顆運動定位銷＋夾持鉤＋底部吹淨噴嘴（2 供氣 2 排氣）＋門開啟機構（取門器、升降滑軌、氣缸）＋映射感測桿＋狀態燈＋操作面板
const lpBuild = (n, fz, full) => {
  const lay = `lp${n}`, f = `foup${n}`, door = `foup${n}Door`, X0 = EX0; LAY(lay, [4, 7, X0 - 2, 3.5]); LAY(f, [4, 4, FX, 8.4]); LAY(door, [1, 4, X0 - 0.1, 8.4]);
  BOX(`${lay}Shelf`, lay, X0 - 3.8, X0, 6.2, 6.55, fz - 2.1, fz + 2.1, "steel2");
  BOX(`${lay}Leg`, lay, X0 - 0.9, X0, 0.6, 6.2, fz - 1.6, fz + 1.6, "panel2");
  P({ id: `${lay}Pin`, layer: lay, shape: "cyl", size: [0.12, 0.2], rot: V, pos: [FX, 6.62, fz], at: [[-1, 0, -1.2], [-1, 0, 1.2], [1.1, 0, 0]], mat: "dark" });
  P({ id: `${lay}Hook`, layer: lay, shape: "box", size: [0.3, 0.12, 0.4], pos: [FX, 6.64, fz], at: [[1.55, 0, -1.2], [1.55, 0, 1.2]], mat: "gold" });
  P({ id: `${lay}Purge`, layer: lay, shape: "cyl", size: [0.07, 0.14], rot: V, pos: [FX, 6.62, fz], at: [[0.9, 0, -0.55], [0.9, 0, 0.55], [-0.9, 0, -0.55], [-0.9, 0, 0.55]], mat: "trace" });
  P({ id: `${lay}Led`, layer: lay, shape: "box", size: [0.08, 0.25, 0.6], pos: [X0 - 0.05, 5.5, fz], at: [[0, 0, -0.5], [0, 0, 0.5]], mat: "lampG" });
  P({ id: `${lay}Panel`, layer: lay, shape: "slab", size: [0.08, 0.9, 1.2], r: 0.04, pos: [X0 - 0.05, 4.4, fz], mat: "dark" });
  P({ id: `${lay}Btn`, layer: lay, shape: "cyl", size: [0.12, 0.06], rot: [0, 90, 0], pos: [X0 - 0.1, 4.4, fz], at: [[0, 0.2, -0.3], [0, 0.2, 0.3], [0, -0.2, 0]], mat: "lampG" });
  // 晶圓盒：半透明光滑外殼（頂、底、後、兩側）＋頂上吊掛法蘭（蘑菇形）＋兩側把手；前門朝搬運區
  const t = X0 - 3.4, b0 = X0 - 3.45;
  BOX(`${f}Top`, f, t, X0, 10.0, 10.25, fz - 1.95, fz + 1.95, "foup"); BOX(`${f}Bot`, f, t, X0, 6.6, 6.85, fz - 1.95, fz + 1.95, "foup");
  BOX(`${f}Back`, f, b0, b0 + 0.25, 6.6, 10.25, fz - 1.95, fz + 1.95, "foup");
  BOX(`${f}SideA`, f, t, X0, 6.6, 10.25, fz - 1.95, fz - 1.75, "foup"); BOX(`${f}SideB`, f, t, X0, 6.6, 10.25, fz + 1.75, fz + 1.95, "foup");
  cylY(`${f}Stem`, f, FX, 10.5, fz, 0.18, 0.3, "dark"); BOX(`${f}Flange`, f, FX - 0.8, FX + 0.8, 10.6, 10.85, fz - 0.8, fz + 0.8, "dark");
  BOX(`${f}Handle`, f, FX - 0.5, FX + 0.5, 8.0, 8.6, fz - 2.2, fz - 1.95, "panel2", { at: [[0, 0, 0], [0, 0, 4.15]] });
  P({ id: `${f}Vent`, layer: f, shape: "cyl", size: [0.1, 0.05], rot: V, pos: [FX - 1.2, 6.9, fz], at: [[0, 0, -0.6], [0, 0, 0.6]], mat: "dark" });
  // 盒內晶圓（一盒 8 片示意，片距 0.36；中間那盒空出被取走的那槽，另缺一片給映射感測抓）＋兩側承架齒
  const ks = [-4, -3, -2, -1, 1, 2, 3].filter((k) => !(full && k === -2)).concat(full ? [] : [0]);
  P({ id: `${f}Stack`, layer: f, shape: "cyl", size: [WR, WT], rot: V, pos: [FX, YW, fz], at: ks.map((k) => [0, R2(k * 0.36), 0]), mat: "wafer" });
  P({ id: `${f}Rib`, layer: f, shape: "box", size: [2.8, 0.04, 0.12], pos: [FX, YW - 1.6, fz], at: Array.from({ length: 9 }, (_, i) => [0, R2(i * 0.36 * 0.99), -1.68]).concat(Array.from({ length: 9 }, (_, i) => [0, R2(i * 0.36 * 0.99), 1.68])), mat: "panel2" });
  BOX(`${door}`, door, X0 - 0.02, X0 + 0.13, 6.65, 10.2, fz - 1.9, fz + 1.9, "foupDoor");
  BOX(`${door}Latch`, door, X0 + 0.13, X0 + 0.2, 8.1, 8.8, fz - 1.2, fz + 1.2, "steel", { at: [[0, 0, 0]] });
  P({ id: `${door}Key`, layer: door, shape: "cyl", size: [0.12, 0.06], rot: [0, 90, 0], pos: [X0 + 0.2, 8.45, fz], at: [[0, 0, -1.2], [0, 0, 1.2]], mat: "dark" });
};
FZ.forEach((z, i) => lpBuild(i + 1, z, i === 1));
// 取門器（吸盤式）＋升降滑軌＋氣缸（中間那座）：在晶圓盒門內側
LAY("door2Arm", [1, 2, EX0 + 0.4, 8.4]); LAY("door2Rail", [1, 6, EX0 + 0.4, 3.5]);
BOX("dArmRail", "door2Rail", EX0 + 0.25, EX0 + 0.4, 0.8, 6.0, FZ[1] - 1.5, FZ[1] + 1.5, "steel2");
BOX("dArmCyl", "door2Rail", EX0 + 0.25, EX0 + 0.5, 0.8, 2.2, FZ[1] - 0.2, FZ[1] + 0.2, "steel");
P({ id: "dArmCup", layer: "door2Arm", shape: "cyl", size: [0.14, 0.1], rot: [0, 90, 0], pos: [EX0 + 0.3, 8.45, FZ[1]], at: [[0, 0.7, -1.2], [0, 0.7, 1.2], [0, -0.7, -1.2], [0, -0.7, 1.2]], mat: "rubber" });
// 映射感測桿（紅光水平光束，念到映射才出現）：從晶圓盒頂掃到底，被每片晶圓邊緣擋住
LAY("lMap", [0.2, 3.6, FX, 8.4]);
P({ id: "lMap", layer: "lMap", shape: "cyl", size: [0.025, 3.2], rot: [90, 0, 0], pos: [FX + 1.5, 9.85, FZ[1]], mat: "mapBeam" });
P({ id: "lMapEnd", layer: "lMap", shape: "box", size: [0.2, 0.14, 0.14], pos: [FX + 1.5, 9.85, FZ[1]], at: [[0, 0, -1.7], [0, 0, 1.7]], mat: "dark" });
// 預對準器：細轉軸＋小吸盤＋馬達座＋缺口感測器（ㄈ字形，下顎發光、上顎收光，夾住晶圓邊緣）
LAY("aligner", [2, 8.4, ALN[0], 4.2]);
P({ id: "alnBase", layer: "aligner", shape: "slab", size: [1.8, 6.3, 1.8], r: 0.15, pos: [ALN[0], 3.75, ALN[1]], mat: "panel2" });
cylY("alnShaft", "aligner", ALN[0], 7.525, ALN[1], 0.2, 1.45, "steel"); P({ id: "alnHub", layer: "aligner", shape: "cyl", size: [0.4, 0.14], rot: V, pos: [ALN[0], 7.0, ALN[1]], mat: "steel2" });
cylY("alnSpin", "aligner", ALN[0], 8.32, ALN[1], 0.26, 0.14, "rubber");
BOX("alnSensorPost", "aligner", ALN[0] - 0.3, ALN[0] + 0.3, 7.1, 9.0, ALN[1] + 1.9, ALN[1] + 2.1, "dark");
BOX("alnSensorLo", "aligner", ALN[0] - 0.3, ALN[0] + 0.3, 7.95, 8.22, ALN[1] + 1.2, ALN[1] + 2.1, "dark");
BOX("alnSensorHi", "aligner", ALN[0] - 0.3, ALN[0] + 0.3, 8.85, 9.0, ALN[1] + 1.2, ALN[1] + 2.1, "dark");
BOX("alnBeam", "aligner", ALN[0] - 0.08, ALN[0] + 0.08, 8.22, 8.25, ALN[1] + 1.32, ALN[1] + 1.48, "mapBeam");
P({ id: "alnLed", layer: "aligner", shape: "box", size: [0.2, 0.08, 0.05], pos: [ALN[0], 6.0, ALN[1] - 0.93], at: [[-0.3, 0, 0], [0.3, 0, 0]], mat: "lampG" });
SCREWS("alnScrew", "aligner", grid(ALN[0] - 0.7, ALN[0] + 0.7, 2, 2.0, 5.0, 3, ALN[1] - 0.93), "steel", 0.05);

// 單臂雙刀大氣手臂（ar，model.kin.ar）：立柱（升降座，內有 Z 軸滾珠螺桿、馬達、聯軸器、滑座）＋大臂 j1＋小臂 j2＋腕 j3＋雙刀（lift：上刀載片、下刀備用，快換用）。靜止姿態全部朝 +x
LAY("ar", [8, 8.5, RB[0] + 2, 4.3]);
cylY("arCol", "ar", RB[0], 4.275, RB[1], 0.75, 7.05, "panel2");
ring("arColBand", "ar", RB[0], 6.9, RB[1], 0.8, 0.6, 0.3, "band"); ring("arColBand2", "ar", RB[0], 1.3, RB[1], 0.8, 0.6, 0.3, "band");
cylY("arHead", "ar", RB[0], 7.9, RB[1], 0.6, 0.3, "steel");
BOX("arZhouse", "ar", RB[0] - 0.7, RB[0] + 0.7, 0.75, 7.2, RB[1] - 1.6, RB[1] - 0.75, "panel2");                     // Z 軸機殼（柱後）
BOX("arZrail", "ar", RB[0] - 0.55, RB[0] - 0.4, 1.0, 7.0, RB[1] - 0.76, RB[1] - 0.7, "steel2", { at: [[0, 0, 0], [0.95, 0, 0]] });
cylY("arZscrew", "ar", RB[0], 4.0, RB[1] - 0.72, 0.1, 6.0, "knurl"); cylY("arZcoupler", "ar", RB[0], 1.6, RB[1] - 0.72, 0.18, 0.3, "gold");
BOX("arZmotor", "ar", RB[0] - 0.4, RB[0] + 0.4, 0.75, 1.45, RB[1] - 1.5, RB[1] - 0.95, "dark");
BOX("arZcarriage", "ar", RB[0] - 0.5, RB[0] + 0.5, 6.7, 7.4, RB[1] - 0.8, RB[1] - 0.6, "steel");
SCREWS("arColScrew", "ar", [[-0.5, 6.0, 0.77], [0.5, 6.0, 0.77], [-0.5, 2.4, 0.77], [0.5, 2.4, 0.77]].map(([x, y, z]) => [RB[0] + x, y, RB[1] + z * 0 + 0.78]), "steel", 0.05);
SEG({ id: "arLink1", layer: "ar", shape: "slab", size: [L1 + 0.7, 0.3, 1.0], r: 0.4, pos: [RB[0] + L1 / 2, 8.05, RB[1]], mat: "panel" }, 0, 7);
cylY("arElbow", "ar", RB[0] + L1, 8.18, RB[1], 0.52, 0.32, "steel");
ring("arElbowCap", "ar", RB[0] + L1, 8.36, RB[1], 0.4, 0.3, 0.06, "gold");
P({ id: "arElbowScrew", layer: "ar", shape: "cyl", size: [0.05, 0.04], rot: V, pos: [RB[0] + L1, 8.4, RB[1]], at: [0, 60, 120, 180, 240, 300].map((t) => { const [x, z] = pol(t, 0.34); return [x, 0, z]; }), mat: "dark" });
SEG({ id: "arLink2", layer: "ar", shape: "slab", size: [L1 + 0.6, 0.22, 0.8], r: 0.32, pos: [RB[0] + 1.5 * L1, 8.22, RB[1]], mat: "panel" }, 0, 7);
cylY("arWrist", "ar", RB[0] + 2 * L1, 8.3, RB[1], 0.4, 0.12, "steel");
ring("arWristCap", "ar", RB[0] + 2 * L1, 8.38, RB[1], 0.3, 0.2, 0.05, "gold");
ring("arShoulderCap", "ar", RB[0], 8.08, RB[1], 0.68, 0.5, 0.08, "gold");
P({ id: "arShoulderScrew", layer: "ar", shape: "cyl", size: [0.05, 0.04], rot: V, pos: [RB[0], 8.13, RB[1]], at: [0, 45, 90, 135, 180, 225, 270, 315].map((t) => { const [x, z] = pol(t, 0.6); return [x, 0, z]; }), mat: "dark" });
BOX("arLinkLed", "ar", RB[0] + L1 + 1.6, RB[0] + L1 + 2.0, 8.3, 8.34, -0.15, -0.05, "lampG");
const GX = RB[0] + 2 * L1 + BL;
// 雙刀：共用刀座（連兩片刀）；上刀＝載片、下刀（低 BLH）＝快換用；末端各三顆止滑墊，上刀有真空吸孔
BOX("arBladeRoot", "ar", RB[0] + 2 * L1 - 0.15, RB[0] + 2 * L1 + 0.55, 7.80, 8.40, -0.35, 0.35, "dark");
const BLEN = BL + 0.65, BC = RB[0] + 2 * L1 + 0.55 + BLEN / 2;
SEG({ id: "arBlade", layer: "ar", shape: "box", size: [BLEN, 0.04, 0.26], pos: [BC, 8.37, RB[1]], at: [[0, 0, -0.5], [0, 0, 0.5]], mat: "steel2" }, 0, 6);
SEG({ id: "arBlade2", layer: "ar", shape: "box", size: [BLEN, 0.04, 0.26], pos: [BC, 8.37 - BLH, RB[1]], at: [[0, 0, -0.5], [0, 0, 0.5]], mat: "steel" }, 0, 6);
P({ id: "arPad", layer: "ar", shape: "cyl", size: [0.1, 0.04], rot: V, pos: [GX, 8.4, RB[1]], at: [[-0.8, 0, -0.5], [-0.8, 0, 0.5], [0.95, 0, -0.5], [0.95, 0, 0.5], [0.1, 0, -0.5], [0.1, 0, 0.5]], mat: "rubber" });
P({ id: "arPad2", layer: "ar", shape: "cyl", size: [0.1, 0.04], rot: V, pos: [GX, 8.4 - BLH, RB[1]], at: [[-0.8, 0, -0.5], [-0.8, 0, 0.5], [0.95, 0, -0.5], [0.95, 0, 0.5]], mat: "rubber" });
P({ id: "arVac", layer: "ar", shape: "cyl", size: [0.05, 0.02], rot: V, pos: [GX, 8.395, RB[1]], at: [[-0.1, 0, -0.5], [-0.1, 0, 0.5]], mat: "lampY" });
const kinAr = {
  layer: "ar", tip: "lift", size: 2 * L1 + BL, grip: [GX, 8.41, RB[1]],
  joints: [
    { id: "j1", type: "rot", axis: [0, 1, 0], pivot: [RB[0], 8.05, RB[1]], parts: ["arLink1", "arShoulderCap", "arShoulderScrew"], min: -400, max: 400 },
    { id: "j2", parent: "j1", type: "rot", axis: [0, 1, 0], pivot: [RB[0] + L1, 8.18, RB[1]], parts: ["arElbow", "arElbowCap", "arElbowScrew", "arLink2", "arLinkLed"], min: -178, max: 178 },
    { id: "j3", parent: "j2", type: "rot", axis: [0, 1, 0], pivot: [RB[0] + 2 * L1, 8.3, RB[1]], parts: ["arWrist", "arWristCap"], min: -270, max: 270 },
    { id: "lift", parent: "j3", type: "slide", axis: [0, 1, 0], parts: ["arBladeRoot", "arBlade", "arBlade2", "arPad", "arPad2", "arVac"], min: -1.0, max: 0.6 },
  ],
  body: ["arCol", "arColBand", "arColBand2", "arHead", "arZhouse", "arZrail", "arZscrew", "arZcoupler", "arZmotor", "arZcarriage", "arColScrew", "arLink1", "arShoulderCap", "arShoulderScrew", "arElbow", "arElbowCap", "arElbowScrew", "arLink2", "arLinkLed", "arWrist", "arWristCap", "arBladeRoot", "arBlade", "arBlade2", "arPad", "arPad2", "arVac"],
  info: { L1, BL, type: "atmospheric SCARA (single arm, dual blade)" },
};
// 晶圓：wfA（晶圓盒 → 預對準器）、wfR（預對準器上轉找缺口）、wfB（預對準器 → 清洗腔）、wfC（清洗腔吸盤上，轉、被噴液、被甩乾）
const wafer = (lay, [x, z], dies, y = YW) => {
  LAY(lay, [3, 0.3, x, y]);
  P({ id: lay, layer: lay, shape: "cyl", size: [WR, WT], rot: V, pos: [x, y, z], mat: "wafer" });
  P({ id: `${lay}Notch`, layer: lay, shape: "box", size: [0.16, 0.1, 0.12], pos: [x, y + 0.005, z + WR - 0.04], mat: "dark" });
  if (dies) {
    const at = [];
    for (let i = -4; i <= 4; i++) for (let j = -4; j <= 4; j++) { const dx = i * 0.31, dz = j * 0.31; if (Math.hypot(Math.abs(dx) + 0.16, Math.abs(dz) + 0.16) < WR - 0.05) at.push([dx, 0, dz]); }
    P({ id: `${lay}Die`, layer: lay, shape: "box", size: [0.27, 0.012, 0.27], pos: [x, y + WT / 2 + 0.006, z], at, mat: "dieM" });
  }
  P({ id: `${lay}Mark`, layer: lay, shape: "box", size: [WR - 0.1, 0.014, 0.05], pos: [x + (WR - 0.1) / 2 - 0.0, y + WT / 2 + 0.012, z], mat: "mark" });   // 一條放射標記，轉起來才看得出在轉
};
wafer("wfA", [FX, FZ[1]], true); wafer("wfR", ALN, true); wafer("wfB", ALN, true);

// ═════ ② 清洗機（2×2 共 4 腔；C1＝下層近側腔，全細節） ═════
const CLX0 = -2.9, CLX1 = 10.1, TOPY = YBU + CHH;
LAY("cl", [13.2, TOPY, 3.6, TOPY / 2]); LAY("clFront", [13.2, TOPY, 3.6, TOPY / 2]);
BOX("clBack", "cl", CLX0, CLX1, 0.6, TOPY, -CHD - 0.2, -CHD, "panel");
BOX("clBase", "cl", CLX0, CLX1, 0, 0.6, -CHD - 0.2, CHD + 0.2, "band");
BOX("clRight", "cl", CLX1 - 0.2, CLX1, 0.6, TOPY, -CHD, CHD, "panel2");
P({ id: "clTop", layer: "cl", shape: "slab", size: [13.2, 0.4, 8.6], r: 0.1, pos: [(CLX0 + CLX1) / 2, TOPY + 0.2, 0], mat: "panel2" });
P({ id: "clTopDuct", layer: "cl", shape: "cyl", size: [0.7, 1.4], rot: V, pos: [1.5, TOPY + 1.1, -1.5], at: [[0, 0, 0], [5.2, 0, 0]], mat: "steel2" });
ring("clTopDuctFl", "cl", 1.5, TOPY + 1.7, -1.5, 0.85, 0.65, 0.1, "dark", { at: [[0, 0, 0], [5.2, 0, 0]] });
P({ id: "clFoot", layer: "cl", shape: "cyl", size: [0.35, 0.3], rot: V, pos: [0, 0.15, 0], at: [[CLX0 + 0.5, 0, -CHD + 0.3], [CLX0 + 0.5, 0, CHD - 0.3], [CLX1 - 0.5, 0, -CHD + 0.3], [CLX1 - 0.5, 0, CHD - 0.3]], mat: "dark" });
// 機身正面：整片面板（念到清洗腔時整塊滑開），每腔一扇觀察窗、門把、接縫、螺絲、百葉、銘牌
BOX("clFront", "clFront", CLX0, CLX1, 0.6, TOPY, CHD, CHD + 0.2, "panel");
BOX("clFrontBand", "clFront", CLX0, CLX1, 1.2, 1.7, CHD + 0.2, CHD + 0.3, "band");
for (const [n, cx, yb] of [[1, CX1, YB0], [2, 6.9, YB0], [3, CX1, YBU], [4, 6.9, YBU]]) {
  BOX(`clWin${n}`, "clFront", cx - 2.6, cx + 2.6, yb + 3.2, yb + 8.8, CHD + 0.2, CHD + 0.28, "window");
  BOX(`clWinFr${n}`, "clFront", cx - 2.75, cx + 2.75, yb + 3.05, yb + 3.2, CHD + 0.2, CHD + 0.3, "dark", { at: [[0, 0, 0], [0, 5.75, 0]] });
  BOX(`clWinFrV${n}`, "clFront", cx - 2.75, cx - 2.6, yb + 3.05, yb + 8.95, CHD + 0.2, CHD + 0.3, "dark", { at: [[0, 0, 0], [5.35, 0, 0]] });
  BOX(`clHandle${n}`, "clFront", cx + 2.75, cx + 2.95, yb + 4.0, yb + 7.0, CHD + 0.28, CHD + 0.5, "dark");
  P({ id: `clLouver${n}`, layer: "clFront", shape: "box", size: [3.6, 0.07, 0.05], pos: [cx, yb + 1.2, CHD + 0.24], at: Array.from({ length: 6 }, (_, i) => [0, i * 0.28, 0]), mat: "dark" });
  P({ id: `clPlate${n}`, layer: "clFront", shape: "slab", size: [1.2, 0.4, 0.05], r: 0.04, pos: [cx - 1.8, yb + 9.8, CHD + 0.24], mat: "dark" });
}
BOX("clSeam", "clFront", CLX0, CLX1, 11.75, 11.8, CHD + 0.2, CHD + 0.27, "seam"); BOX("clSeamV", "clFront", 3.6, 3.65, 0.6, TOPY, CHD + 0.2, CHD + 0.27, "seam");
SCREWS("clScrew", "clFront", grid(CLX0 + 0.4, CLX1 - 0.4, 7, 1.0, TOPY - 0.4, 5, CHD + 0.24));
P({ id: "clLed", layer: "clFront", shape: "box", size: [0.4, 0.12, 0.05], pos: [CLX1 - 1.5, TOPY - 0.5, CHD + 0.24], at: [[0, 0, 0], [0.55, 0, 0], [1.1, 0, 0]].map(([x, y, z]) => [x - 1.1, y, z]), mat: "lampG" });
// 其他三腔（簡化）：地板、左右隔牆、吸盤＋抓取銷＋晶圓＋三層杯的外形，不做噴嘴臂與管線
const mini = (n, cx, yb) => {
  const l = `c${n}`; LAY(l, [6.4, CHH, cx, yb + CHH / 2]); const fy = yb + 0.3, yw = fy + 7.55;
  BOX(`${l}Floor`, l, cx - CHW, cx + CHW, yb, fy, -CHD, CHD, "panel2");
  BOX(`${l}WallL`, l, cx - CHW, cx - CHW + 0.2, fy, yb + CHH, -CHD, CHD, "panel2"); BOX(`${l}WallR`, l, cx + CHW - 0.2, cx + CHW, fy, yb + CHH, -CHD, CHD, "panel2");
  BOX(`${l}Roof`, l, cx - CHW, cx + CHW, yb + CHH - 0.3, yb + CHH, -CHD, CHD, "panel2");
  cylY(`${l}Motor`, l, cx, fy + 1.1, 0, 0.95, 1.4, "dark"); cylY(`${l}Spindle`, l, cx, fy + 4.2, 0, 0.45, 5.2, "steel2");
  cylY(`${l}Plate`, l, cx, yw - 0.95, 0, 1.25, 0.25, "steel2");
  P({ id: `${l}Pin`, layer: l, shape: "cyl", size: [0.07, 0.85], rot: V, pos: [cx, yw - 0.42, 0], at: [30, 90, 150, 210, 270, 330].map((t) => { const [x, z] = pol(t, 1.57); return [x, 0, z]; }), mat: "dark" });
  P({ id: `${l}Wafer`, layer: l, shape: "cyl", size: [WR, WT], rot: V, pos: [cx, yw, 0], mat: "wafer" });
  ring(`${l}Cup`, l, cx, yw - 0.55, 0, 2.6, 2.54, 3.5, "cupWall"); ring(`${l}CupPl`, l, cx, yw, 0, 2.54, 1.95, 0.1, "pvdf", { at: [[0, -1.35, 0], [0, -0.45, 0], [0, 0.45, 0], [0, 1.35, 0]] });
  P({ id: `${l}Drain`, layer: l, shape: "cyl", size: [0.2, 3.0], rot: V, pos: [cx, fy + 1.5, 0], at: [0, 120, 240].map((t) => { const [x, z] = pol(t, 1.9); return [x, 0, z]; }), mat: "pipeB" });
  P({ id: `${l}Arm`, layer: l, shape: "slab", size: [3.5, 0.3, 0.4], r: 0.1, pos: [cx - 0.5, yw + 2.3, -CHD + 1.0], mat: "panel" });
  cylY(`${l}ArmPost`, l, cx + 1.2, yw + 0.65, -CHD + 1.0, 0.22, 3.4, "panel2");
};
mini(2, 6.9, YB0); mini(3, CX1, YBU); mini(4, 6.9, YBU);

// ── C1 全細節（下層近側腔；中心 x＝CX1、z＝0；地板上緣 0.9；晶圓面 YW＝8.45） ──
{
  const cx = CX1, fy = YB0 + 0.3, X0 = cx - CHW, X1 = cx + CHW;
  LAY("c1Wall", [6.4, CHH, cx, YB0 + CHH / 2]); LAY("c1Chuck", [3.2, 4, cx, 7]); LAY("c1Motor", [3.2, 5, cx, 2.8]); LAY("c1Cup", [5.4, 4, cx, YW]); LAY("c1Drain", [5, 3.4, cx, 2]); LAY("c1Exh", [1, 10, X0 + 0.7, 6]); LAY("c1Shut", [0.4, 1.6, X0, 8.4]);
  LAY("c1Nz", [4.4, 3, cx + 1, 10.5]); LAY("c1Ip", [4.4, 3, cx + 1, 10.5]); LAY("c1CupPipe", [4, 2.4, cx, 4.5]); LAY("c1Valve", [3, 4, cx - 1.5, 5]); LAY("c1Fan", [5.6, 0.7, cx, YB0 + CHH - 0.7]); LAY("c1Pipe", [6, 12, cx + 1, 6]);
  // 牆：地板、左牆（z ±1.9、y 7.7–9.15 送片窄縫）、右隔牆、頂板；背牆用機身共用背牆
  BOX("c1Floor", "c1Wall", X0, X1, YB0, fy, -CHD, CHD, "panel2");
  BOX("c1WallLa", "c1Wall", X0, X0 + 0.2, fy, YB0 + CHH, -CHD, -1.9, "panel2"); BOX("c1WallLb", "c1Wall", X0, X0 + 0.2, fy, YB0 + CHH, 1.9, CHD, "panel2");
  BOX("c1WallLlo", "c1Wall", X0, X0 + 0.2, fy, 7.7, -1.9, 1.9, "panel2"); BOX("c1WallLhi", "c1Wall", X0, X0 + 0.2, 9.15, YB0 + CHH, -1.9, 1.9, "panel2");
  BOX("c1WallR", "c1Wall", X1 - 0.2, X1, fy, YB0 + CHH, -CHD, CHD, "panel2");
  BOX("c1Roof", "c1Wall", X0, X1, YB0 + CHH - 0.3, YB0 + CHH, -CHD, CHD, "panel2");
  BOX("c1Back", "c1Wall", X0, X1, fy, YB0 + CHH - 0.3, -CHD, -CHD + 0.1, "panel2");   // 腔體自己的背牆（機身背牆在更後面）
  BOX("c1SlotLip", "c1Wall", X0 + 0.2, X0 + 0.28, 9.15, 9.23, -2.0, 2.0, "dark"); BOX("c1SlotLipLo", "c1Wall", X0 + 0.2, X0 + 0.28, 7.62, 7.7, -2.0, 2.0, "dark");
  BOX("c1Liner", "c1Wall", X0 + 0.2, X0 + 0.28, fy, 7.7, -CHD, CHD, "pvdf"); BOX("c1LinerHi", "c1Wall", X0 + 0.2, X0 + 0.28, 9.15, YB0 + CHH - 0.3, -CHD, CHD, "pvdf"); BOX("c1LinerSd", "c1Wall", X0 + 0.2, X0 + 0.28, 7.7, 9.15, -CHD, -1.9, "pvdf", { at: [[0, 0, 0]] }); BOX("c1LinerSd2", "c1Wall", X0 + 0.2, X0 + 0.28, 7.7, 9.15, 1.9, CHD, "pvdf");   // PVDF 內襯（耐酸）
  P({ id: "c1Win", layer: "c1Wall", shape: "box", size: [0.04, 3.0, 2.4], pos: [X1 - 0.02, YB0 + 7.2, 0], mat: "window" });
  // 送片窄縫擋板（平常關著，手臂進出時往下收進牆裡）
  BOX("c1Shut", "c1Shut", X0 + 0.07, X0 + 0.13, 7.72, 9.13, -1.88, 1.88, "steel");
  // 腔體頂風扇濾網（維持向下潔淨氣流）：外框＋護網＋輻條
  P({ id: "c1FanBox", layer: "c1Fan", shape: "slab", size: [5.4, 0.45, 5.4], r: 0.1, pos: [cx, YB0 + CHH - 0.55, 0], mat: "panel" });
  ring("c1FanRing", "c1Fan", cx, YB0 + CHH - 0.77, 0, 1.6, 1.52, 0.05, "steel"); ring("c1FanRing2", "c1Fan", cx, YB0 + CHH - 0.77, 0, 0.9, 0.84, 0.05, "steel");
  P({ id: "c1FanSpoke", layer: "c1Fan", shape: "box", size: [3.2, 0.04, 0.05], pos: [cx, YB0 + CHH - 0.77, 0], at: [[0, 0, 0]], mat: "steel" });
  P({ id: "c1FanSpoke2", layer: "c1Fan", shape: "box", size: [0.05, 0.04, 3.2], pos: [cx, YB0 + CHH - 0.77, 0], mat: "steel" });
  P({ id: "c1FanPleat", layer: "c1Fan", shape: "box", size: [0.04, 0.06, 4.8], pos: [cx, YB0 + CHH - 0.82, 0], at: Array.from({ length: 36 }, (_, i) => [R2(-2.3 + i * 0.13), 0, 0]), mat: "steel2" });
  // 吸盤（旋轉件）：邊緣抓取銷 6 顆（lug 托住晶圓邊緣，液體才流得過上表面）、盤面、輪轂、空心軸＋鍵槽；底下馬達＋軸承座＋編碼器＋聯軸器
  cylY("chPlate", "c1Chuck", cx, 7.475, 0, 1.25, 0.25, "steel2");
  P({ id: "chPlateMark", layer: "c1Chuck", shape: "box", size: [0.9, 0.03, 0.12], pos: [cx + 0.6, 7.61, 0], mat: "mark" });
  P({ id: "chPlateHole", layer: "c1Chuck", shape: "cyl", size: [0.07, 0.03], rot: V, pos: [cx, 7.605, 0], at: [0, 72, 144, 216, 288].map((t) => { const [x, z] = pol(t, 0.85); return [x, 0, z]; }), mat: "dark" });
  P({ id: "chPin", layer: "c1Chuck", shape: "cyl", size: [0.07, 0.75], rot: V, pos: [cx, 7.975, 0], at: [30, 90, 150, 210, 270, 330].map((t) => { const [x, z] = pol(t, 1.57); return [x, 0, z]; }), mat: "steel" });
  P({ id: "chLug", layer: "c1Chuck", shape: "box", size: [0.16, 0.05, 0.12], pos: [cx, 8.33, 0], at: [30, 90, 150, 210, 270, 330].map((t) => { const [x, z] = pol(t, 1.46); return [x, 0, z]; }), mat: "dark" });
  cylY("chHub", "c1Chuck", cx, 7.175, 0, 0.5, 0.35, "steel");
  cylY("chShaft", "c1Chuck", cx, 5.8, 0, 0.35, 2.4, "steel2"); BOX("chKey", "c1Chuck", cx + 0.33, cx + 0.45, 4.8, 6.9, -0.06, 0.06, "gold");
  // 背面噴嘴：中心靜止管（穿過空心軸）＋環形噴嘴（朝晶圓背面噴純水）＋輻條
  cylY("chBackStem", "c1Chuck", cx, 7.0, 0, 0.12, 1.4, "pipeB");
  ring("chBackRing", "c1Chuck", cx, 7.65, 0, 1.1, 1.02, 0.05, "pipeB");
  P({ id: "chBackSpoke", layer: "c1Chuck", shape: "box", size: [2.1, 0.05, 0.07], pos: [cx, 7.65, 0], at: [[0, 0, 0]], mat: "pipeB" });
  P({ id: "chBackJet", layer: "c1Chuck", shape: "cone", size: [0.03, 0.06, 0.08], rot: V, pos: [cx, 7.665, 0], at: [0, 45, 90, 135, 180, 225, 270, 315].map((t) => { const [x, z] = pol(t, 1.06); return [x, 0, z]; }), mat: "pipeB" });
  ring("chBearing", "c1Motor", cx, 4.575, 0, 0.8, 0.36, 0.15, "gold"); cylY("chBearBody", "c1Motor", cx, 3.6, 0, 0.55, 1.8, "dark");
  ring("chEncoder", "c1Motor", cx, 2.45, 0, 1.0, 0.45, 0.15, "knurl"); cylY("chCoupler", "c1Motor", cx, 2.75, 0, 0.45, 0.4, "gold");
  cylY("chMotor", "c1Motor", cx, 1.6, 0, 0.95, 1.4, "dark");
  P({ id: "chMotorFin", layer: "c1Motor", shape: "tube", size: [1.0, 0.9, 0.06], rot: V, pos: [cx, 1.2, 0], at: [[0, 0, 0], [0, 0.25, 0], [0, 0.5, 0], [0, 0.75, 0]], mat: "steel2" });
  BOX("chMotorBox", "c1Motor", cx + 0.9, cx + 1.5, 1.0, 2.0, -0.4, 0.4, "conn"); P({ id: "chMotorCable", layer: "c1Motor", shape: "cyl", size: [0.07, 1.2], rot: [0, 90, 0], pos: [cx + 1.9, 1.4, 0], mat: "conn" });
  SCREWS("chMotorScrew", "c1Motor", [0, 60, 120, 180, 240, 300].map((t) => { const [x, z] = pol(t, 0.88); return [cx + x, 2.32, z]; }), "steel", 0.05, "y");
  // 擋液杯（整組一層，可升降）：外壁（半透明）＋三個進液槽（各有一圈彩色內襯：橘＝化學液、藍＝純水、紫＝IPA）＋四片隔板＋底部漏斗＋三支排液管（套在地板上的導管外，可伸縮）
  ring("cupWall", "c1Cup", cx, YW - 0.675, 0, 2.6, 2.54, 3.55, "cupWall");
  ring("cupPlate", "c1Cup", cx, YW, 0, 2.54, 1.95, 0.1, "pvdf", { at: [[0, -1.35, 0], [0, -0.45, 0], [0, 0.45, 0], [0, 1.35, 0]] });
  ring("cupChemLiner", "c1Cup", cx, YW, 0, 2.54, 2.46, 0.8, "cupChem"); ring("cupWaterLiner", "c1Cup", cx, YW + 0.9, 0, 2.54, 2.46, 0.8, "cupWater"); ring("cupIpaLiner", "c1Cup", cx, YW - 0.9, 0, 2.54, 2.46, 0.8, "cupIpa");
  ring("cupHotGlow", "c1Cup", cx, YW, 0, 2.5, 2.42, 0.8, "cupHot");
  P({ id: "cupFunnel", layer: "c1Cup", shape: "cone", size: [0.95, 2.5, 1.1], rot: V, pos: [cx, YW - 1.9, 0], mat: "pvdf" });
  P({ id: "cupPipe", layer: "c1CupPipe", shape: "tube", size: [0.17, 0.12, 2.4], rot: V, pos: [cx, 4.5, 0], at: [[2.0, 0, 0], [-1.0, 0, 1.73], [-1.0, 0, -1.73]], mat: "pipeR" });
  ring("cupFlange", "c1Cup", cx, YW + 1.4, 0, 2.7, 2.54, 0.08, "dark"); SCREWS("cupBolt", "c1Cup", [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((t) => { const [x, z] = pol(t, 2.62); return [cx + x, YW + 1.45, z]; }), "steel", 0.04, "y");
  // 排液導管（地板上的靜止管，套住杯底的排液管）＋排氣管（沿背牆、帶蝶閥與壓差計）＋氣缸（升降杯口）
  P({ id: "drainSleeve", layer: "c1Drain", shape: "tube", size: [0.27, 0.2, 2.9], rot: V, pos: [cx, fy + 1.45, 0], at: [[2.0, 0, 0], [-1.0, 0, 1.73], [-1.0, 0, -1.73]], mat: "pipeB" });
  P({ id: "drainElbow", layer: "c1Drain", shape: "sphere", size: [0.3], pos: [cx, fy + 0.3, 0], at: [[2.0, 0, 0], [-1.0, 0, 1.73], [-1.0, 0, -1.73]], mat: "pipeB" });
  cylY("exhDuct", "c1Exh", X0 + 0.7, fy + 5.2, -CHD + 0.55, 0.4, 10.0, "pvdf"); ring("exhFl", "c1Exh", X0 + 0.7, fy + 5.2, -CHD + 0.55, 0.52, 0.4, 0.1, "dark", { at: [[0, -4.0, 0], [0, 0, 0], [0, 4.0, 0]] });
  P({ id: "exhValve", layer: "c1Exh", shape: "cyl", size: [0.36, 0.05], rot: [0, 90, 0], pos: [X0 + 0.7, fy + 8.0, -CHD + 0.55], mat: "steel" }); BOX("exhActuator", "c1Exh", X0 + 0.5, X0 + 0.9, fy + 8.3, fy + 8.9, -CHD + 0.4, -CHD + 0.7, "pipeB");
  P({ id: "exhGauge", layer: "c1Exh", shape: "cyl", size: [0.22, 0.12], rot: [0, 0, 0], pos: [X0 + 1.5, fy + 6.0, -CHD + 0.4], mat: "dark" }); P({ id: "exhGaugeNeedle", layer: "c1Exh", shape: "box", size: [0.02, 0.15, 0.02], pos: [X0 + 1.5, fy + 6.06, -CHD + 0.47], mat: "lampR" });
  P({ id: "cupCyl", layer: "c1Drain", shape: "cyl", size: [0.2, 2.6], rot: V, pos: [cx + 2.75, fy + 2.5, 0.6], at: [[0, 0, 0], [0, 0, -1.2]], mat: "steel" }); P({ id: "cupCylFit", layer: "c1Drain", shape: "cyl", size: [0.08, 0.3], rot: [0, 90, 0], pos: [cx + 2.75, fy + 3.6, 0.6], at: [[0.2, 0, 0], [0.2, 0, -1.2]], mat: "pipeB" });
  // 閥島＋流量計＋三通（背牆上）：氣動隔膜閥（藍色致動器）、手動針閥（手輪）、流量計（浮子玻璃管）、PP 管夾
  const vx = X0 + 1.0, vy = 5.2, vz = -CHD + 0.3;
  BOX("vManifold", "c1Valve", vx, vx + 2.8, vy, vy + 0.5, vz - 0.2, vz + 0.2, "pvdf");
  for (let i = 0; i < 4; i++) { const x = vx + 0.4 + i * 0.65; BOX(`vAct${i}`, "c1Valve", x - 0.2, x + 0.2, vy + 0.5, vy + 1.3, vz - 0.2, vz + 0.2, "pipeB"); cylY(`vWheel${i}`, "c1Valve", x, vy + 1.4, vz, 0.2, 0.06, "lampR"); }
  P({ id: "vFlowTube", layer: "c1Valve", shape: "cyl", size: [0.12, 1.2], rot: V, pos: [vx + 0.4, vy + 2.1, vz], at: [[0, 0, 0], [0.65, 0, 0]], mat: "glassDoor" }); P({ id: "vFloat", layer: "c1Valve", shape: "sphere", size: [0.07], pos: [vx + 0.4, vy + 2.0, vz], at: [[0, 0, 0], [0.65, 0.3, 0]], mat: "lampY" });
  P({ id: "vPipe", layer: "c1Valve", shape: "cyl", size: [0.12, 2.2], rot: [0, 90, 0], pos: [vx + 1.4, vy + 0.25, vz + 0.35], mat: "pipeB" });
  P({ id: "vClamp", layer: "c1Valve", shape: "tube", size: [0.2, 0.12, 0.1], rot: [0, 90, 0], pos: [vx + 0.4, vy + 0.25, vz + 0.35], at: [[0, 0, 0], [0.9, 0, 0], [1.8, 0, 0]], mat: "steel" });
  SCREWS("vScrew", "c1Valve", [[vx + 0.1, vy + 0.25, vz + 0.21], [vx + 2.7, vy + 0.25, vz + 0.21], [vx + 0.1, vy + 0.25, vz - 0.21], [vx + 2.7, vy + 0.25, vz - 0.21]], "steel", 0.04);
  // 噴嘴臂：後角（−z）化學液／純水臂，前角（+z）IPA／氮氣臂；兩根立柱落在地板上，臂在杯口上方、頭往下垂進杯口孔
  const armBuild = (pre, lay, s, hot) => {
    const layA = lay + "A"; LAY(layA, [4.4, 2, cx + 1, 10.5]);
    const px = cx + 2.2, pz = s * 3.0, La = Math.hypot(2.2, 3.0), ang0 = Math.atan2(-pz, -2.2) / D2R;     // 臂指向晶圓中心的方位角（atan2(z,x)，度）
    const phi = 2 * Math.asin(1.35 / (2 * La)) / D2R, dirOf = (a) => [Math.cos(a * D2R), Math.sin(a * D2R)];
    const aMid = pre === "nz" ? ang0 + phi / 2 : ang0;               // nz 靜止姿態＝掃描行程中點；ip 靜止姿態＝對準晶圓中心
    const [ux, uz] = dirOf(aMid), AY = 10.65, mid = [px + ux * La / 2, pz + uz * La / 2], tip = [px + ux * La, pz + uz * La];
    // 臂模組掛在腔體牆上（懸臂支架＋齒輪箱＋馬達＋編碼器；靜止）：nz 掛背牆、ip 掛右牆，不用落地的長立柱（畫面上才不會被撐得很高）
    const brk = (id, x0, x1, y0, y1, z0, z1) => BOX(id, lay, Math.min(x0, x1), Math.max(x0, x1), y0, y1, Math.min(z0, z1), Math.max(z0, z1), "panel2");
    if (s < 0) brk(`${pre}Bracket`, px - 0.3, px + 0.3, AY - 1.05, AY - 0.75, -CHD + 0.1, pz); else brk(`${pre}Bracket`, px, X1 - 0.2, AY - 1.05, AY - 0.75, pz - 0.3, pz + 0.3);
    BOX(`${pre}Gear`, lay, px - 0.4, px + 0.4, AY - 0.95, AY - 0.25, pz - 0.4, pz + 0.4, "dark"); cylY(`${pre}Motor`, lay, px, AY + 0.3, pz, 0.28, 0.7, "band");
    ring(`${pre}Enc`, lay, px, AY + 0.72, pz, 0.3, 0.14, 0.12, "knurl");
    // 旋轉的臂（繞立柱）：臂體、蓋板＋螺絲、管路、噴嘴頭＋噴管＋彎頭接頭
    const ang = Math.atan2(uz, ux), rotY = -ang / D2R;   // rot[1]：three 的 y 軸右手旋轉，+x 轉到 (cosθ, 0, −sinθ)，所以 θ＝−方位角
    P({ id: `${pre}Arm`, layer: layA, shape: "slab", size: [La + 0.4, 0.26, 0.4], r: 0.1, rot: [0, R2(rotY), 0], pos: [R2(mid[0]), AY, R2(mid[1])], mat: "panel" });
    P({ id: `${pre}ArmCap`, layer: layA, shape: "box", size: [La - 0.6, 0.05, 0.28], rot: [0, R2(rotY), 0], pos: [R2(mid[0]), AY + 0.15, R2(mid[1])], mat: "steel2" });
    P({ id: `${pre}ArmScrew`, layer: layA, shape: "cyl", size: [0.04, 0.03], rot: V, pos: [0, AY + 0.19, 0], at: [-1.2, -0.4, 0.4, 1.2].map((u) => [R2(mid[0] + ux * u * La / 2.4), 0, R2(mid[1] + uz * u * La / 2.4)]), mat: "steel" });
    P({ id: `${pre}Head`, layer: layA, shape: "slab", size: [0.55, 0.5, 0.5], r: 0.1, pos: [R2(tip[0]), AY - 0.3, R2(tip[1])], mat: "dark" });
    P({ id: `${pre}Tube`, layer: layA, shape: "cyl", size: [0.07, 0.8], rot: V, pos: [0, AY - 0.8, 0], at: [[R2(tip[0] - 0.1), 0, R2(tip[1] - 0.1)], [R2(tip[0] + 0.1), 0, R2(tip[1] + 0.1)]], mat: hot ? "pipeR" : "pipeB" });
    P({ id: `${pre}Nut`, layer: layA, shape: "tube", size: [0.13, 0.08, 0.1], rot: V, pos: [0, AY - 0.58, 0], at: [[R2(tip[0] - 0.1), 0, R2(tip[1] - 0.1)], [R2(tip[0] + 0.1), 0, R2(tip[1] + 0.1)]], mat: "steel" });
    P({ id: `${pre}Hose`, layer: layA, shape: "cyl", size: [0.07, La * 0.9], rot: [0, R2(Math.atan2(ux, uz) / D2R), 0], pos: [R2(mid[0] + ux * 0.15), AY + 0.26, R2(mid[1] + uz * 0.15)], mat: "pipeB" });
    // 待機座（噴嘴停放時蓋住，避免滴液）：在停放位置（臂轉到平行背牆／右牆）的噴嘴下面，掛在牆上
    const [pxu, pzu] = dirOf(180), ptx = px + pxu * La, ptz = pz + pzu * La;
    ring(`${pre}Dock`, lay, ptx, AY - 1.35, ptz, 0.32, 0.22, 0.35, "pvdf");
    if (s < 0) brk(`${pre}DockBr`, ptx - 0.1, ptx + 0.1, AY - 1.6, AY - 1.5, -CHD + 0.1, ptz); else brk(`${pre}DockBr`, X0 + 0.28, ptx, AY - 1.6, AY - 1.5, ptz - 0.1, ptz + 0.1);
    const rotParts = [`${pre}Arm`, `${pre}ArmCap`, `${pre}ArmScrew`, `${pre}Head`, `${pre}Tube`, `${pre}Nut`, `${pre}Hose`];
    return { px, pz, La, ang0, phi, aMid, tip, rotParts, AY };
  };
  const NZ = armBuild("nz", "c1Nz", -1, true), IP = armBuild("ip", "c1Ip", 1, false);
  // 液柱（噴嘴頭下方一條連續細絲，跟著頭一起繞立柱轉）、IPA 液柱
  const stream = (pre, lay, A, mat) => P({ id: `${pre}Stream`, layer: lay, shape: "cyl", size: [0.035, 1.08], rot: V, pos: [R2(A.tip[0]), R2(YW + 0.04 + 0.54), R2(A.tip[1])], mat });
  LAY("nzStr", [0.2, 1.2, cx, 9]); LAY("ipStr", [0.2, 1.6, cx, 9]);
  stream("nz", "nzStr", NZ, "stream"); stream("ip", "ipStr", IP, "ipaBeam");
  P({ id: "ipN2", layer: "ipStr", shape: "cone", size: [0.55, 0.04, 1.5], rot: V, pos: [R2(IP.tip[0] + 0.14), 9.25, R2(IP.tip[1])], mat: "n2Beam" });   // 氮氣：臂頭往下錐狀散開，到晶圓表面沿表面流走
  anchors.nzTip = { layer: "c1NzA", p: [R2(NZ.tip[0]), AY_(NZ), R2(NZ.tip[1])], dx: 160, dy: -140 };
  const info = { NZ: { tip: NZ.tip, px: NZ.px, pz: NZ.pz, La: NZ.La, ang0: R2(NZ.ang0), phi: R2(NZ.phi), aMid: R2(NZ.aMid), parts: NZ.rotParts }, IP: { tip: IP.tip, px: IP.px, pz: IP.pz, La: IP.La, ang0: R2(IP.ang0), phi: R2(IP.phi), aMid: R2(IP.aMid), parts: IP.rotParts } };
  globalThis.__c1info = info;
}
function AY_(A) { return A.AY - 0.2; }

// ═════ ③ 電控箱（門平常關著；念到才打開）與化學液櫃 ═════
const EBX0 = 10.5, EBX1 = 13.7, EBZ0 = -3.5, EBZ1 = 0.5, EBH = 14;
LAY("ebox", [3.2, EBH, 12.1, EBH / 2]); LAY("ebDoor", [3.2, EBH, 12.1, EBH / 2]); LAY("ebIn", [3, 10, 12.1, 8]);
BOX("ebBack", "ebox", EBX0, EBX1, 0.6, EBH, EBZ0, EBZ0 + 0.12, "panel"); BOX("ebSideL", "ebox", EBX0, EBX0 + 0.12, 0.6, EBH, EBZ0, EBZ1, "panel"); BOX("ebSideR", "ebox", EBX1 - 0.12, EBX1, 0.6, EBH, EBZ0, EBZ1, "panel");
BOX("ebTop", "ebox", EBX0, EBX1, EBH - 0.12, EBH, EBZ0, EBZ1, "panel"); BOX("ebBase", "ebox", EBX0, EBX1, 0, 0.6, EBZ0, EBZ1, "band");
BOX("ebFrame", "ebox", EBX0, EBX1, 0.6, 0.8, EBZ1 - 0.06, EBZ1, "dark", { at: [[0, EBH - 0.8, 0]] }); BOX("ebFrameV", "ebox", EBX0, EBX0 + 0.2, 0.6, EBH, EBZ1 - 0.06, EBZ1, "dark", { at: [[EBX1 - EBX0 - 0.2, 0, 0]] });
// 門（繞右緣鉸鍊轉開）：金屬面板、橫向通風百葉、把手、銘板（只寫「示意」）、三顆指示燈、鉸鍊
const EBP = [EBX1, 7, EBZ1 + 0.06];
BOX("ebDoorP", "ebDoor", EBX0, EBX1, 0.7, EBH - 0.1, EBZ1, EBZ1 + 0.12, "panel2");
P({ id: "ebDoorLv", layer: "ebDoor", shape: "box", size: [2.4, 0.07, 0.05], pos: [(EBX0 + EBX1) / 2, 1.8, EBZ1 + 0.15], at: Array.from({ length: 7 }, (_, i) => [0, i * 0.26, 0]), mat: "dark" });
BOX("ebDoorHandle", "ebDoor", EBX0 + 0.25, EBX0 + 0.45, 6.5, 8.5, EBZ1 + 0.12, EBZ1 + 0.32, "steel");
P({ id: "ebDoorPlate", layer: "ebDoor", shape: "slab", size: [1.6, 0.5, 0.05], r: 0.04, pos: [(EBX0 + EBX1) / 2, EBH - 1.0, EBZ1 + 0.15], mat: "dark" });
P({ id: "ebDoorLamp", layer: "ebDoor", shape: "cyl", size: [0.12, 0.08], rot: [0, 0, 0], pos: [EBX0 + 0.7, EBH - 2.2, EBZ1 + 0.16], at: [[0, 0, 0], [0.5, 0, 0], [1.0, 0, 0]], mat: "lampG" });
P({ id: "ebHinge", layer: "ebDoor", shape: "cyl", size: [0.1, 0.5], rot: V, pos: [EBX1 + 0.05, 0, EBZ1 + 0.06], at: [[0, 2.5, 0], [0, 7, 0], [0, 11.5, 0]], mat: "steel" });
SCREWS("ebDoorScrew", "ebDoor", grid(EBX0 + 0.25, EBX1 - 0.25, 4, 1.0, EBH - 0.4, 6, EBZ1 + 0.14), "steel", 0.05);
// 箱內（門打開才看得到）：背板、控制板（機器手臂控制器／輸入輸出板）、斷路器列、電源模組、端子排、線槽
BOX("ebPlate", "ebIn", EBX0 + 0.15, EBX1 - 0.15, 0.8, EBH - 0.2, EBZ0 + 0.12, EBZ0 + 0.2, "steel2");
P({ id: "ebPcb", layer: "ebIn", shape: "box", size: [2.5, 3.0, 0.07], pos: [12.1, 11.3, EBZ0 + 0.26], mat: "pcb" });
P({ id: "ebBga", layer: "ebIn", shape: "box", size: [0.7, 0.7, 0.1], pos: [12.1, 11.5, EBZ0 + 0.32], at: [[-0.55, 0.3, 0], [0.5, -0.2, 0]], mat: "chip" });
P({ id: "ebChip", layer: "ebIn", shape: "box", size: [0.3, 0.3, 0.08], pos: [12.1, 11.3, EBZ0 + 0.31], at: [[0.6, 0.9, 0], [-0.8, -0.9, 0], [0.1, -1.0, 0]], mat: "chip" });
P({ id: "ebCap", layer: "ebIn", shape: "box", size: [0.1, 0.07, 0.06], pos: [12.1, 11.3, EBZ0 + 0.31], at: grid(-1.0, 1.0, 11, -1.35, -1.2, 2, 0).map(([x, y]) => [x, y, 0]), mat: "trace" });
P({ id: "ebTrace", layer: "ebIn", shape: "box", size: [1.6, 0.015, 0.01], pos: [12.1, 11.3, EBZ0 + 0.305], at: [[0, 0.5, 0], [0, 0.4, 0], [0, 0.1, 0], [0.2, -0.3, 0], [0, 0.75, 0]], mat: "trace" });
P({ id: "ebConn", layer: "ebIn", shape: "box", size: [0.6, 0.22, 0.2], pos: [12.1, 9.7, EBZ0 + 0.3], at: [[-0.7, 0, 0], [0.7, 0, 0]], mat: "conn" }); P({ id: "ebRibbon", layer: "ebIn", shape: "box", size: [0.5, 1.1, 0.03], pos: [11.4, 8.95, EBZ0 + 0.3], mat: "ribbon" });
BOX("ebDuct", "ebIn", EBX0 + 0.25, EBX1 - 0.25, 12.9, 13.3, EBZ0 + 0.2, EBZ0 + 0.7, "pvdf"); P({ id: "ebDuctSlot", layer: "ebIn", shape: "box", size: [0.05, 0.3, 0.02], pos: [12.1, 13.1, EBZ0 + 0.71], at: Array.from({ length: 20 }, (_, i) => [R2(-1.3 + i * 0.14), 0, 0]), mat: "dark" });
P({ id: "ebBreaker", layer: "ebIn", shape: "box", size: [0.32, 0.9, 0.5], pos: [11.2, 7.6, EBZ0 + 0.46], at: Array.from({ length: 5 }, (_, i) => [R2(i * 0.42), 0, 0]), mat: "dark" });
P({ id: "ebToggle", layer: "ebIn", shape: "box", size: [0.1, 0.18, 0.1], pos: [11.2, 7.9, EBZ0 + 0.74], at: Array.from({ length: 5 }, (_, i) => [R2(i * 0.42), 0, 0]), mat: "lampY" });
P({ id: "ebPower", layer: "ebIn", shape: "slab", size: [2.0, 1.6, 0.6], r: 0.06, pos: [12.1, 5.4, EBZ0 + 0.5], mat: "band" }); P({ id: "ebPowerFin", layer: "ebIn", shape: "box", size: [1.8, 0.05, 0.5], pos: [12.1, 4.8, EBZ0 + 0.52], at: Array.from({ length: 6 }, (_, i) => [0, R2(i * 0.24), 0]), mat: "steel2" });
P({ id: "ebTerm", layer: "ebIn", shape: "box", size: [0.2, 0.3, 0.2], pos: [11.0, 2.6, EBZ0 + 0.3], at: Array.from({ length: 10 }, (_, i) => [R2(i * 0.26), 0, 0]), mat: "conn" });
SCREWS("ebTermScrew", "ebIn", Array.from({ length: 10 }, (_, i) => [11.0 + i * 0.26, 2.78, EBZ0 + 0.41]), "steel", 0.04);
P({ id: "ebWire", layer: "ebIn", shape: "cyl", size: [0.04, 1.2], rot: V, pos: [11.0, 3.5, EBZ0 + 0.3], at: Array.from({ length: 10 }, (_, i) => [R2(i * 0.26), 0, 0]), mat: i2("pipeR") });
function i2(x) { return x; }
// 化學液櫃：框架＋背板＋側板＋頂；正面雙門（可整片滑開）；內有藥液桶×3（氨水／雙氧水／稀釋氫氟酸，各一圈色標）、泵×2、濾芯×2、加熱器、混合閥島、排放與洩漏偵測
const CCX0 = 14.6, CCX1 = 26.6, CCH = 17, CCZ = 4.2;
LAY("cc", [12, CCH, 20.6, CCH / 2]); LAY("ccDoor", [12, CCH, 20.6, CCH / 2]); LAY("ccTank", [11, 6, 20.6, 4]); LAY("ccPump", [9, 2.6, 20, 8.3]); LAY("ccFilter", [8, 3.2, 20, 11.6]); LAY("ccHeater", [4, 2, 20.6, 14.6]); LAY("ccValve", [9, 2, 20.6, 16.2]); LAY("ccPipe", [11, 14, 20.6, 8]); LAY("ccDrain", [11, 1.2, 20.6, 0.9]);
BOX("ccBack", "cc", CCX0, CCX1, 0.6, CCH, -CCZ, -CCZ + 0.15, "panel"); BOX("ccSideL", "cc", CCX0, CCX0 + 0.15, 0.6, CCH, -CCZ, CCZ, "panel"); BOX("ccSideR", "cc", CCX1 - 0.15, CCX1, 0.6, CCH, -CCZ, CCZ, "panel");
BOX("ccTop", "cc", CCX0, CCX1, CCH - 0.15, CCH, -CCZ, CCZ, "panel2"); BOX("ccBase", "cc", CCX0, CCX1, 0, 0.6, -CCZ, CCZ, "band");
SCREWS("ccScrew", "cc", [[CCX0 + 0.1, 3.0, 0.0], [CCX0 + 0.1, 9.0, 0.0], [CCX0 + 0.1, 15.0, 0.0]].map(([x, y]) => [x - 0.03, y, 3.0]).concat([[CCX0 + 0.1, 3.0, -3.0], [CCX0 + 0.1, 9.0, -3.0], [CCX0 + 0.1, 15.0, -3.0]]), "steel", 0.05, "x");
BOX("ccDoorL", "ccDoor", CCX0, (CCX0 + CCX1) / 2 - 0.05, 0.7, CCH - 0.2, CCZ, CCZ + 0.12, "panel"); BOX("ccDoorR", "ccDoor", (CCX0 + CCX1) / 2 + 0.05, CCX1, 0.7, CCH - 0.2, CCZ, CCZ + 0.12, "panel");
BOX("ccDoorWin", "ccDoor", CCX0 + 1.5, (CCX0 + CCX1) / 2 - 1.5, 6.5, 12.5, CCZ + 0.12, CCZ + 0.18, "window", { at: [[0, 0, 0], [6.0, 0, 0]] });
BOX("ccDoorHandle", "ccDoor", 20.3, 20.5, 7.5, 10.5, CCZ + 0.12, CCZ + 0.34, "dark", { at: [[0, 0, 0], [0.7, 0, 0]] });
P({ id: "ccDoorLv", layer: "ccDoor", shape: "box", size: [4.5, 0.07, 0.05], pos: [17.4, 1.6, CCZ + 0.16], at: Array.from({ length: 6 }, (_, i) => [0, i * 0.26, 0]).concat(Array.from({ length: 6 }, (_, i) => [6.0, i * 0.26, 0])), mat: "dark" });
P({ id: "ccPlate", layer: "ccDoor", shape: "slab", size: [1.6, 0.5, 0.05], r: 0.04, pos: [17.4, 16.0, CCZ + 0.15], mat: "dark" });
P({ id: "ccLamp", layer: "ccDoor", shape: "cyl", size: [0.12, 0.08], rot: [0, 0, 0], pos: [22.0, 16.0, CCZ + 0.16], at: [[0, 0, 0], [0.5, 0, 0], [1.0, 0, 0]], mat: "lampG" });
SCREWS("ccDoorScrew", "ccDoor", grid(CCX0 + 0.3, CCX1 - 0.3, 6, 1.0, CCH - 0.5, 5, CCZ + 0.14));
// 藥液桶 ×3：白色 PE 桶（桶身、桶肩、蓋、液位計玻璃管＋浮子、色標帶、抽液管＋接頭）
for (const [i, [x, mt]] of [[17.2, "tankA"], [20.6, "tankB"], [24.0, "tankC"]].entries()) {
  cylY(`tk${i}`, "ccTank", x, 3.6, -0.3, 1.3, 5.0, "pe"); ring(`tkBand${i}`, "ccTank", x, 2.4, -0.3, 1.33, 1.28, 0.6, mt); ring(`tkRib${i}`, "ccTank", x, 3.6, -0.3, 1.33, 1.25, 0.08, "peBand", { at: [[0, -1.2, 0], [0, 0, 0], [0, 1.2, 0]] });
  cylY(`tkLid${i}`, "ccTank", x, 6.2, -0.3, 1.0, 0.3, "peBand"); cylY(`tkCap${i}`, "ccTank", x, 6.45, -0.3, 0.25, 0.2, "dark");
  P({ id: `tkGauge${i}`, layer: "ccTank", shape: "cyl", size: [0.1, 3.6], rot: V, pos: [x + 1.0, 3.6, 1.15], mat: "glassDoor" }); cylY(`tkFloat${i}`, "ccTank", x + 1.0, 3.8 + i * 0.4, 1.15, 0.07, 0.15, "lampY");
  cylY(`tkDip${i}`, "ccTank", x - 0.5, 6.9, -0.3, 0.09, 1.2, "pvdf"); P({ id: `tkFit${i}`, layer: "ccTank", shape: "tube", size: [0.17, 0.1, 0.1], rot: V, pos: [x - 0.5, 7.5, -0.3], mat: "steel" });
}
// 隔膜泵 ×2（氣動：兩個圓頂泵腔、中間氣閥塊）＋濾芯外殼 ×2（排氣旋鈕）＋加熱器（SC1 通例 70–85 ℃，示意）
for (const [i, x] of [18.3, 22.7].entries()) {
  P({ id: `pmpDome${i}`, layer: "ccPump", shape: "sphere", size: [0.7], scale: [1, 1, 0.8], pos: [x, 8.3, 0], at: [[-0.9, 0, 0], [0.9, 0, 0]], mat: "pvdf" }); BOX(`pmpMid${i}`, "ccPump", x - 0.35, x + 0.35, 7.9, 8.7, -0.4, 0.4, "pipeB");
  cylY(`pmpAir${i}`, "ccPump", x, 9.1, 0, 0.12, 0.4, "pvdf"); P({ id: `pmpIn${i}`, layer: "ccPump", shape: "cyl", size: [0.12, 0.5], rot: V, pos: [x, 7.6, 0], at: [[-0.9, 0, 0], [0.9, 0, 0]], mat: "pipeB" });
  cylY(`flt${i}`, "ccFilter", x, 11.6, 0, 0.7, 2.6, "pvdf"); ring(`fltBand${i}`, "ccFilter", x, 11.6, 0, 0.74, 0.68, 0.15, "steel", { at: [[0, 0.9, 0], [0, -0.9, 0]] }); cylY(`fltKnob${i}`, "ccFilter", x, 13.05, 0, 0.18, 0.25, "lampY");
  P({ id: `fltPort${i}`, layer: "ccFilter", shape: "cyl", size: [0.1, 0.4], rot: [0, 90, 0], pos: [x, 12.4, 0], at: [[0.65, 0, 0], [-0.65, -1.6, 0]], mat: "pipeB" });
}
BOX("htrBody", "ccHeater", 19.4, 22.0, 13.7, 15.2, -0.8, 0.8, "band"); P({ id: "htrFin", layer: "ccHeater", shape: "box", size: [2.4, 0.05, 1.4], pos: [20.7, 14.0, 0], at: Array.from({ length: 5 }, (_, i) => [0, R2(i * 0.24), 0]), mat: "steel2" });
cylY("htrProbe", "ccHeater", 20.7, 15.6, 0, 0.07, 0.8, "steel"); BOX("htrLed", "ccHeater", 19.6, 19.9, 14.4, 14.5, 0.8, 0.84, "lampR");
// 混合閥島（純水＋藥液按比例混合）：閥塊＋五個氣動致動器＋手輪＋歷史配比標示（只在 2D 卡）
BOX("mvBlock", "ccValve", 18.4, 23.0, 15.4, 15.9, -0.3, 0.3, "pvdf");
for (let i = 0; i < 5; i++) { const x = 18.8 + i * 1.0; BOX(`mvAct${i}`, "ccValve", x - 0.2, x + 0.2, 15.9, 16.6, -0.2, 0.2, "pipeB"); cylY(`mvWheel${i}`, "ccValve", x, 16.7, 0, 0.18, 0.05, "lampR"); }
P({ id: "mvPipe", layer: "ccValve", shape: "cyl", size: [0.12, 4.8], rot: [0, 90, 0], pos: [20.7, 15.65, 0.45], mat: "pipeB" });
// 管路：桶 → 泵 → 濾芯 → 加熱 → 混合閥（彎頭、直管、管夾）；排放與回收（廢液桶＋洩漏偵測）
const pipeV = (id, x, z, y0, y1, mat = "pipeB") => cylY(id, "ccPipe", x, (y0 + y1) / 2, z, 0.1, y1 - y0, mat);
pipeV("pv0", 16.7, 0.7, 7.5, 8.0); pipeV("pv1", 19.2, 0.7, 8.7, 11.2); pipeV("pv2", 21.8, 0.7, 8.7, 11.2); pipeV("pv3", 20.7, 0.5, 13.1, 13.7); pipeV("pv4", 20.7, 0.5, 15.2, 15.4);
P({ id: "ph0", layer: "ccPipe", shape: "cyl", size: [0.1, 4.8], rot: [0, 90, 0], pos: [20.8, 7.4, 0.7], mat: "pipeB" }); P({ id: "ph1", layer: "ccPipe", shape: "cyl", size: [0.1, 2.0], rot: [0, 90, 0], pos: [20.8, 13.6, 0.5], mat: "pipeB" });
P({ id: "pElbow", layer: "ccPipe", shape: "sphere", size: [0.15], pos: [0, 0, 0], at: [[16.7, 7.5, 0.7], [19.2, 8.7, 0.7], [21.8, 8.7, 0.7], [19.2, 11.2, 0.7], [21.8, 11.2, 0.7], [20.7, 13.1, 0.5], [20.7, 15.2, 0.5]], mat: "steel" });
P({ id: "pClamp", layer: "ccPipe", shape: "tube", size: [0.2, 0.12, 0.1], rot: V, pos: [0, 0, 0], at: [[19.2, 10.0, 0.7], [21.8, 10.0, 0.7], [16.7, 7.8, 0.7]], mat: "steel" });
P({ id: "pTrunk", layer: "ccPipe", shape: "cyl", size: [0.14, 6.6], rot: [0, 90, 0], pos: [CCX0 - 3.3, 15.6, -CCZ - 0.4], mat: "pipeB" }); P({ id: "pTrunk2", layer: "ccPipe", shape: "cyl", size: [0.14, 6.6], rot: [0, 90, 0], pos: [CCX0 - 3.3, 15.2, -CCZ - 0.8], mat: "pipeR" });
BOX("drTray", "ccDrain", CCX0 + 0.3, CCX1 - 0.3, 0.6, 1.1, -CCZ + 0.3, CCZ - 0.3, "steel2"); cylY("drBin", "ccDrain", 25.2, 1.9, 2.4, 0.8, 1.6, "pe"); BOX("drLeak", "ccDrain", 17.0, 17.5, 1.1, 1.3, 2.5, 3.0, "lampR"); P({ id: "drHose", layer: "ccDrain", shape: "cyl", size: [0.1, 1.6], rot: [0, 90, 0], pos: [24.2, 1.1, 2.4], mat: "pipeR" });

// ═════ ④ 批次酸槽（Wet bench，對照用）：6 槽（石英槽體、溢流堰、外槽、槽蓋）＋循環泵濾芯＋沿導軌的搬運手臂＋卡匣 ═════
const BBX0 = 34, BBX1 = 54, BBDECK = 6.0, TKP = 3.2, TKX = (i) => 36 + i * TKP;
LAY("bb", [20.4, 9.4, 44, 4.7]); LAY("bbLid", [3, 0.6, 38, 10]); LAY("bbRail", [22, 4, 44, 19]); LAY("bbCar", [3.2, 4.4, 36, 16]); LAY("bbCass", [3.2, 8, 36, 12]);
BOX("bbBase", "bb", BBX0, BBX1, 0, BBDECK, -3.4, 3.4, "panel"); BOX("bbBand", "bb", BBX0, BBX1, 0, 0.6, -3.5, 3.5, "band"); BOX("bbDeck", "bb", BBX0 - 0.2, BBX1 + 0.2, BBDECK, BBDECK + 0.2, -3.6, 3.6, "steel2");
BOX("bbFrontSeam", "bb", BBX0, BBX1, 3.0, 3.05, 3.4, 3.47, "seam", { at: [[0, 0, 0]] }); SCREWS("bbScrew", "bb", grid(BBX0 + 0.4, BBX1 - 0.4, 14, 1.2, 5.2, 3, 3.44));
P({ id: "bbLouver", layer: "bb", shape: "box", size: [3.0, 0.07, 0.05], pos: [BBX0 + 2.0, 1.5, 3.44], at: Array.from({ length: 6 }, (_, i) => [0, i * 0.28, 0]).concat(Array.from({ length: 6 }, (_, i) => [8.0, i * 0.28, 0])), mat: "dark" });
for (let i = 0; i < 6; i++) {
  const x = TKX(i), top = BBDECK + 0.2;
  BOX(`bbOuter${i}`, "bb", x - 1.5, x + 1.5, top, top + 0.9, -3.3, 3.3, "steel");                                   // 外槽（接溢流）
  BOX(`bbTank${i}`, "bb", x - 1.3, x + 1.3, top, top + 3.4, -2.3, 2.3, "quartz");                                    // 石英槽體
  BOX(`bbLiq${i}`, "bb", x - 1.25, x + 1.25, top + 0.1, top + 3.0, -2.25, 2.25, "liqTank");                          // 槽內液體
  BOX(`bbWeir${i}`, "bb", x - 1.3, x + 1.3, top + 3.4, top + 3.5, -2.35, -2.3, "steel2", { at: [[0, 0, 4.65]] });    // 溢流堰（前後兩邊）
  cylY(`bbPump${i}`, "bb", x, 3.0, 2.6, 0.45, 1.6, "pvdf"); ring(`bbFil${i}`, "bb", x, 3.0, 2.6, 0.5, 0.4, 0.2, "steel", { at: [[0, 0.5, 0]] });
  P({ id: `bbHtr${i}`, layer: "bb", shape: "box", size: [0.1, 1.8, 0.1], pos: [x, top + 1.6, -2.1], at: [[-0.8, 0, 0], [0.8, 0, 0]], mat: "lampR" });
}
// 槽蓋（最後一槽是乾燥槽，蓋子半掀）
BOX("bbLid", "bbLid", TKX(0) - 1.4, TKX(0) + 1.4, BBDECK + 3.7, BBDECK + 3.85, -2.4, 2.4, "panel2", { at: [[0, 0, 0], [TKP * 5, 0, 0]] });
// 導軌（兩根立柱＋橫梁沿 x）、拖鏈、搬運臂拖車（吊在橫梁下）、垂直桿（伸縮進拖車）、夾具、卡匣（內有一排晶圓）
BOX("bbPost", "bbRail", BBX0 - 0.6, BBX0 - 0.1, 0, 19.2, -0.3, 0.3, "panel2", { at: [[0, 0, 0], [20.7, 0, 0]] }); BOX("bbBeam", "bbRail", BBX0 - 0.6, BBX1 + 0.6, 18.5, 19.2, -0.45, 0.45, "panel2");
BOX("bbRailBar", "bbRail", BBX0 - 0.3, BBX1 + 0.3, 18.3, 18.5, -0.3, -0.2, "steel2", { at: [[0, 0, 0.5]] }); P({ id: "bbChain", layer: "bbRail", shape: "slab", size: [0.28, 0.3, 0.5], r: 0.04, pos: [0, 19.45, 0], at: Array.from({ length: 50 }, (_, i) => [R2(BBX0 + i * 0.42), 0, 0]), mat: "conn" });
BOX("bbCarBody", "bbCar", TKX(0) - 1.3, TKX(0) + 1.3, 13.8, 18.2, -0.9, 0.9, "panel"); P({ id: "bbCarSlide", layer: "bbCar", shape: "slab", size: [0.9, 0.3, 0.7], r: 0.05, pos: [TKX(0), 18.35, 0], at: [[-0.8, 0, 0], [0.8, 0, 0]], mat: "steel" });
SCREWS("bbCarScrew", "bbCar", grid(TKX(0) - 1.0, TKX(0) + 1.0, 3, 14.2, 17.8, 3, 0.94), "steel", 0.05); BOX("bbCarLed", "bbCar", TKX(0) - 0.4, TKX(0) + 0.4, 17.2, 17.3, 0.9, 0.94, "lampG");
BOX("bbRod", "bbCass", TKX(0) - 0.3, TKX(0) + 0.3, 13.6, 17.5, -0.3, 0.3, "steel2"); BOX("bbGrip", "bbCass", TKX(0) - 1.5, TKX(0) + 1.5, 13.0, 13.6, -0.5, 0.5, "dark", { at: [[0, 0, 0]] });
BOX("bbCassL", "bbCass", TKX(0) - 1.2, TKX(0) - 1.1, 9.9, 13.0, -1.0, 1.0, "pfa"); BOX("bbCassR", "bbCass", TKX(0) + 1.1, TKX(0) + 1.2, 9.9, 13.0, -1.0, 1.0, "pfa");
BOX("bbCassBot", "bbCass", TKX(0) - 1.2, TKX(0) + 1.2, 9.8, 9.9, -1.0, 1.0, "pfa"); BOX("bbCassTop", "bbCass", TKX(0) - 1.2, TKX(0) + 1.2, 13.0, 13.1, -1.0, 1.0, "pfa");
P({ id: "bbCassWf", layer: "bbCass", shape: "cyl", size: [1.0, 0.06], rot: [0, 90, 0], pos: [TKX(0), 11.5, 0], at: Array.from({ length: 12 }, (_, i) => [R2(-0.9 + i * 0.165), 0, 0]), mat: "wafer" });

// 清洗腔吸盤上的晶圓（wfC）＋液膜（8 層半透明圓盤，由中心往外一層一層出現；疊起來中心較厚＝先厚後薄）＋邊緣隆起環＋乾區（7 段環形濕膜，內徑一段比一段大＝乾區由中心向外擴大）
wafer("wfC", [CX1, 0], true);
[0.28, 0.46, 0.64, 0.82, 1.0, 1.18, 1.34, 1.48].forEach((r, k) => { LAY(`film${k}`, [3, 0.1, CX1, YW]); cylY(`film${k}`, `film${k}`, CX1, R2(YW + WT / 2 + 0.012 + (7 - k) * 0.002), 0, r, 0.012, "film"); });
LAY("filmEdge", [3, 0.1, CX1, YW]); ring("filmEdge", "filmEdge", CX1, R2(YW + WT / 2 + 0.022), 0, 1.5, 1.44, 0.02, "filmEdge");
[0.2, 0.45, 0.7, 0.95, 1.15, 1.32, 1.42].forEach((r, j) => { LAY(`dry${j}`, [3, 0.1, CX1, YW]); ring(`dryW${j}`, `dry${j}`, CX1, R2(YW + WT / 2 + 0.014), 0, 1.48, r, 0.014, "film"); ring(`dryF${j}`, `dry${j}`, CX1, R2(YW + WT / 2 + 0.02), 0, R2(r + 0.05), r, 0.012, "dryHi"); });
// ═════ 運作動畫 ═════
const lpt = (layer, p) => ({ layer, p });
const info = globalThis.__c1info;
actions.alnLaser = { type: "pulse", _說明: "缺口感測器紅光", parts: ["alnBeam"], color: "lampR", glow: 1, freq: 3, halo: 0 };
actions.alnSpin = { type: "rotate", _說明: "預對準器帶著晶圓轉，找缺口（起轉、停轉有加減速）", parts: ["wfR", "wfRNotch", "wfRDie", "wfRMark", "alnSpin"], axis: [0, 1, 0], pivot: [ALN[0], YW, ALN[1]], pivots: Object.fromEntries(["wfR", "wfRNotch", "wfRDie", "wfRMark", "alnSpin"].map((k) => [k, [ALN[0], YW, ALN[1]]])), rps: 0.6, rampSpin: true };
actions.mapBeam = { type: "pulse", _說明: "映射感測紅光束", parts: ["lMap"], color: "lampR", glow: 1, steady: true, halo: 0 };
actions.ffuAir = { type: "flow", _說明: "風扇過濾機組往下吹的潔淨空氣（向下層流，三台各一組）", path: [lpt("ffu", [-7.55, 17.5, 0]), lpt("ffu", [-7.55, 10.0, 0])], n: 3, lanes: 6, laneGap: 1.3, laneDir: [1, 0, 0], size: 0.09, shape: "dot", rate: 0.45, color: "light", track: false };
actions.ffuAir2 = { type: "flow", _說明: "（前後各一排）", path: [lpt("ffu", [-9.5, 17.5, -4.4]), lpt("ffu", [-9.5, 10.0, -4.4])], n: 3, lanes: 4, laneGap: 1.7, laneDir: [1, 0, 0], size: 0.09, shape: "dot", rate: 0.5, color: "light", track: false, phase: 0.3 };
actions.ffuAir3 = { type: "flow", path: [lpt("ffu", [-9.5, 17.5, 4.4]), lpt("ffu", [-9.5, 10.0, 4.4])], n: 3, lanes: 4, laneGap: 1.7, laneDir: [1, 0, 0], size: 0.09, shape: "dot", rate: 0.5, color: "light", track: false, phase: 0.6 };
actions.c1Air = { type: "flow", _說明: "腔體頂風扇：向下潔淨氣流，沿杯口進入、由底部排氣管抽走", path: [lpt("c1Fan", [CX1, YB0 + CHH - 1.0, 0]), lpt("c1Fan", [CX1, 9.9, 0])], n: 3, lanes: 5, laneGap: 0.7, laneDir: [1, 0, 0], size: 0.07, shape: "dot", rate: 0.5, color: "light", track: false };
// 吸盤與晶圓一起轉（低速約 300 rpm 示意＝畫面 1.1 圈／秒；甩乾約 2000 rpm 示意＝畫面 2.6 圈／秒；轉速只當示意）
const SPIN_P = ["wfC", "wfCNotch", "wfCDie", "wfCMark", "chPlate", "chPlateMark", "chPlateHole", "chPin", "chLug", "chHub", "chShaft", "chKey"];
const spin = (rps) => ({ type: "rotate", _說明: "晶圓、抓取銷、吸盤一起轉（起轉停轉有加減速）", parts: SPIN_P, axis: [0, 1, 0], pivot: [CX1, YW, 0], pivots: Object.fromEntries(SPIN_P.map((k) => [k, [CX1, YW, 0]])), rps, rampSpin: true });
actions.spinLo = spin(1.1); actions.spinHi = spin(2.6);
// 噴嘴臂（立柱在後角）：先停在待機位置（偏離晶圓），念到才掃進來；掃進晶圓後在中心↔邊緣之間來回掃（每次來回約 2 秒）
const NZP = Object.fromEntries(info.NZ.parts.map((k) => [k, [info.NZ.px, 10.65, info.NZ.pz]])), IPP = Object.fromEntries(info.IP.parts.map((k) => [k, [info.IP.px, 10.65, info.IP.pz]]));
const nzParts = [...info.NZ.parts, "nzStream"], ipParts = [...info.IP.parts, "ipStream", "ipN2"];
const NZPV = Object.fromEntries(nzParts.map((k) => [k, [info.NZ.px, 10.65, info.NZ.pz]])), IPPV = Object.fromEntries(ipParts.map((k) => [k, [info.IP.px, 10.65, info.IP.pz]]));
const parkAng = (info.NZ.aMid - 180);   // 臂方位角從 aMid 轉到 180°（停放位置）的差（度，atan2 方向）；rotate 的 angle＝−差
actions.nzPark = { type: "rotate", _說明: "噴嘴臂停在待機位置（念到才掃進晶圓）", parts: nzParts, axis: [0, 1, 0], pivot: [info.NZ.px, 10.65, info.NZ.pz], pivots: NZPV, angle: R2(-(180 - info.NZ.aMid)), chain: true };
actions.nzSwing = { type: "rotate", _說明: "噴嘴臂在中心與邊緣之間來回掃（正弦＝到頭減速、轉向、再加速）", parts: nzParts, axis: [0, 1, 0], pivot: [info.NZ.px, 10.65, info.NZ.pz], pivots: NZPV, swing: R2(info.NZ.phi / 2), freq: 0.5, chain: true };
actions.ipPark = { type: "rotate", _說明: "IPA 臂停在待機位置", parts: ipParts, axis: [0, 1, 0], pivot: [info.IP.px, 10.65, info.IP.pz], pivots: IPPV, angle: R2(-(180 - info.IP.aMid)), chain: true };
actions.ipSweep = { type: "rotate", _說明: "IPA 臂跟著乾區邊緣由中心掃向邊緣（一次，緩入緩出）", parts: ipParts, axis: [0, 1, 0], pivot: [info.IP.px, 10.65, info.IP.pz], pivots: IPPV, angle: R2(-info.IP.phi), chain: true };
actions.cupHot = { type: "pulse", _說明: "化學液槽（橘色內襯）微亮：藥液溫度高（SC1 通例約 70–85 ℃，示意）", parts: ["cupHotGlow"], color: "hotC", glow: 0.6, freq: 0.8, halo: 0 };
actions.ipaGlow = { type: "pulse", parts: ["ipStream"], color: "liqIpa", glow: 0.9, steady: true, halo: 0 };
actions.n2Glow = { type: "pulse", _說明: "氮氣錐微微閃動", parts: ["ipN2"], color: "n2", glow: 0.7, freq: 3.2, halo: 0 };
actions.nzGlow = { type: "pulse", parts: ["nzStream"], color: "liqC", glow: 0.9, steady: true, halo: 0 };
actions.alnGreen = { type: "pulse", parts: ["lp2Led"], color: "lampG", glow: 0.9, freq: 0.7, halo: 0 };
actions.cabLed = { type: "pulse", parts: ["ccLamp", "htrLed", "drLeak"], color: "lampG", glow: 0.8, freq: 0.6, halo: 0 };
// 液膜被甩出：邊緣先隆起（亮環），液滴沿切線飛出（帶旋轉方向的拖尾、受重力微微下落），撞杯壁後沿壁面往下流
for (let k = 0; k < 6; k++) {
  const th = k * 60 * D2R + 0.25, ex = CX1 + 1.5 * Math.cos(th), ez = 1.5 * Math.sin(th), tx = -Math.sin(th), tz = Math.cos(th), s = Math.sqrt(2.45 ** 2 - 1.5 ** 2);
  const pts = [0, 0.35, 0.7, 1.0].map((u, i) => lpt("c1Cup", [R2(ex + tx * s * u), R2(YW + 0.05 - 0.12 * u * u), R2(ez + tz * s * u)]));
  actions[`fling${k}`] = { type: "flow", _說明: "液滴沿切線甩出（拖尾）", path: pts, n: 3, size: 0.06, shape: "dot", rate: 1.6, phase: k * 0.17, color: "liqW", trail: 4, trailGap: 0.045, trailColor: "liqW", track: false, free: true };
}
// 螺旋流線（晶圓上表面：往外螺旋，4 條）
for (let k = 0; k < 4; k++) {
  const pts = []; for (let i = 0; i <= 14; i++) { const u = i / 14, r = 0.1 + 1.38 * u, th = k * Math.PI / 2 - 1.6 * u * u; pts.push(lpt("c1Cup", [R2(CX1 + r * Math.cos(th)), R2(YW + 0.07), R2(r * Math.sin(th))])); }
  actions[`spir${k}`] = { type: "flow", _說明: "晶圓上液膜向外流動（螺旋紋）", path: pts, n: 3, size: 0.05, shape: "dot", rate: 0.7, phase: k * 0.25, color: "lightW", trail: 3, trailGap: 0.05, trailColor: "lightW", track: false, free: true };
}
// 杯內排液：沿杯壁下流到杯底漏斗，再進排液管（橘＝化學液槽；藍＝純水槽）
const wall = (r, c, y0, y1, th) => [lpt("c1Cup", [R2(CX1 + r * Math.cos(th)), y0, R2(r * Math.sin(th))]), lpt("c1Cup", [R2(CX1 + r * Math.cos(th)), R2((y0 + y1) / 2), R2(r * Math.sin(th))]), lpt("c1Cup", [R2(CX1 + (r - 0.3) * Math.cos(th)), y1, R2((r - 0.3) * Math.sin(th))])];
[0, 2.1, 4.2].forEach((th, k) => {
  actions[`dr${k}`] = { type: "flow", _說明: "化學液沿杯壁往下流進排液管（橘）", path: wall(2.4, 0, YW - 0.35, YW - 2.1, th), n: 3, size: 0.07, shape: "dot", rate: 0.6, phase: k * 0.3, color: "liqChem", trail: 3, trailGap: 0.05, trailColor: "liqChem", track: false, free: true };
  actions[`dw${k}`] = { type: "flow", _說明: "純水沿杯壁往下流進排液管（藍）", path: wall(2.4, 0, YW + 0.55, YW - 2.1, th), n: 3, size: 0.07, shape: "dot", rate: 0.6, phase: k * 0.3, color: "liqW", trail: 3, trailGap: 0.05, trailColor: "liqW", track: false, free: true };
});
// 背面噴嘴：純水從晶圓背面下方環形噴嘴朝上噴
actions.backJet = { type: "flow", _說明: "背面噴嘴：純水朝晶圓背面噴", path: [lpt("c1Chuck", [CX1 + 1.0, 7.7, 0]), lpt("c1Chuck", [CX1 + 1.0, 8.36, 0])], n: 3, lanes: 4, laneGap: 0.5, laneDir: [0, 0, 1], size: 0.05, shape: "dot", rate: 1.0, color: "liqW", track: false };
// 藥液路徑：桶 → 泵 → 濾芯 → 加熱 → 混合閥（沿管路流動的點）；批次槽溢流
const cc = (p) => lpt("ccPipe", p);
actions.chemFlow = { type: "flow", _說明: "藥液：桶 → 幫浦 → 濾芯 → 加熱 → 混合閥島 → 管路出櫃", path: [cc([16.7, 7.5, 0.7]), cc([19.2, 8.7, 0.7]), cc([19.2, 11.2, 0.7]), cc([20.7, 13.1, 0.5]), cc([20.7, 15.4, 0.5]), cc([CCX0 + 1, 15.6, 0.5]), cc([CCX0 - 6.5, 15.6, -CCZ - 0.4])], n: 5, size: 0.11, shape: "dot", rate: 0.35, color: "liqChem", trail: 3, trailGap: 0.06, trailColor: "liqChem", track: false };
actions.chemFlow2 = { type: "flow", path: [cc([20.6, 7.5, 0.7]), cc([21.8, 8.7, 0.7]), cc([21.8, 11.2, 0.7]), cc([20.7, 13.1, 0.5])], n: 3, size: 0.1, shape: "dot", rate: 0.35, phase: 0.4, color: "liqW", trail: 3, trailGap: 0.06, trailColor: "liqW", track: false };
actions.pumpBeat = { type: "vibrate", _說明: "隔膜泵微微抖動", parts: ["pmpDome0", "pmpDome1"], axis: [1, 0, 0], amp: 0.03, freq: 3 };
actions.ebLamp = { type: "pulse", parts: ["ebDoorLamp"], color: "lampG", glow: 0.8, freq: 0.7, halo: 0 };
actions.ebBlink = { type: "pulse", _說明: "控制板上的指示（箱內）", parts: ["ebToggle"], color: "lampY", glow: 0.9, freq: 1.8, halo: 0 };
actions.ebDoorOpen = { type: "rotate", _說明: "電控箱門繞右緣鉸鍊打開（朝觀眾轉出去）", parts: ["ebDoorP", "ebDoorLv", "ebDoorHandle", "ebDoorPlate", "ebDoorLamp", "ebDoorScrew"], axis: [0, 1, 0], pivot: [EBX1, 7, EBZ1 + 0.06], pivots: Object.fromEntries(["ebDoorP", "ebDoorLv", "ebDoorHandle", "ebDoorPlate", "ebDoorLamp", "ebDoorScrew"].map((k) => [k, [EBX1, 7, EBZ1 + 0.06]])), angle: 105, chain: true };
for (let i = 0; i < 6; i++) actions[`bbOver${i}`] = { type: "flow", _說明: "溢流：液面越過溢流堰流進外槽", path: [lpt("bb", [TKX(i) - 0.6, BBDECK + 3.45, -2.3]), lpt("bb", [TKX(i) - 0.6, BBDECK + 3.6, -2.7]), lpt("bb", [TKX(i) - 0.6, BBDECK + 2.0, -3.0])], n: 3, size: 0.06, shape: "dot", rate: 0.8, phase: i * 0.15, color: "liqC", trail: 2, trailGap: 0.04, trailColor: "liqC", track: false, free: true };
actions.bbIpa = { type: "pulse", _說明: "乾燥槽：IPA 蒸氣", parts: ["bbLiq5"], color: "liqIpa", glow: 0.35, freq: 0.6, halo: 0 };

// ── 標註點 ──
const A = (layer, p, dx, dy) => ({ layer, p, dx, dy });
Object.assign(anchors, {
  efem: A("efem", [-9.5, 17.0, -7.0], -150, -130), ffu: A("ffu", [-7.55, EH + 1.3, 0], 150, -130), foup: A("foup2", [FX, 10.4, FZ[1] - 2.0], -150, -120), lp: A("lp2", [EX0 - 1.6, 6.4, FZ[1] + 2.0], -150, 120),
  map: A("lMap", [FX + 1.5, 9.0, FZ[1] + 1.7], 150, -110), arm: A("ar", [RB[0] + L1, 8.4, 1.0], 140, 110), blade: A("ar", [RB[0] + 2 * L1 + 0.8, 8.0, 0.9], 150, 120), aln: A("aligner", [ALN[0], 9.0, ALN[1] + 0.8], 140, -120),
  door: A("foup2Door", [EX0 + 0.1, 9.8, FZ[1] + 1.2], -150, -100), chamber: A("c1Wall", [CX1 + 3.2, 10.4, 3.0], 150, -140),
  nz: A("c1NzA", [R2(info.NZ.tip[0]), 10.2, R2(info.NZ.tip[1])], 150, -140), ip: A("c1IpA", [R2(info.IP.tip[0]), 10.2, R2(info.IP.tip[1])], 150, -100),
  chuck: A("c1Chuck", [CX1 + 1.2, 7.6, 1.0], -150, 120), pin: A("c1Chuck", [CX1 + 1.5, 8.2, 0.8], 150, 120), motor: A("c1Chuck", [CX1 + 0.9, 1.6, 0.6], 150, 100), cup: A("c1Cup", [CX1 - 2.55, YW - 0.2, 0.4], -150, -80),
  drain: A("c1Drain", [CX1 + 2.0, 1.6, 0.4], 150, 110), valve: A("c1Valve", [X0v() + 1.4, 6.8, -CHD + 0.3], -150, -90),
  tank: A("ccTank", [20.6, 6.3, 0.6], 140, -150), pump: A("ccPump", [22.7, 8.3, 0.7], 150, -110), filter: A("ccFilter", [22.7, 12.3, 0.7], 150, -100), mix: A("ccValve", [20.7, 16.5, 0.2], 150, -100),
  eb: A("ebIn", [12.1, 11.3, EBZ0 + 0.4], -150, -100), ebpow: A("ebIn", [12.1, 5.4, EBZ0 + 0.8], -150, 80),
  efemTop: A("ffu", [-7.55, EH + 1.4, 3.0], -150, -100), ccTop: A("ccDoor", [20.6, 16.5, CCZ + 0.2], 150, -110), bb: A("bb", [44, BBDECK + 3.6, 3.0], 140, -130), cass: A("bbCass", [TKX(0), 12.2, 1.0], 150, -110),
});
function X0v() { return CX1 - CHW; }

for (const d of Object.values(actions)) if (d.type === "flow" && d.path?.[0]?.p) { d.layer = d.path[0].layer; d.path = d.path.map((q) => q.p); d.free = true; }
const model = {
  name: "示意 單晶圓旋轉清洗機＋前端搬運區＋化學液櫃＋批次酸槽（tech-twequip）：前端搬運區（3 個裝載埠與晶圓盒、風扇濾網×3、沖孔地板、單臂雙刀大氣手臂、預對準器）、清洗機 2×2 共 4 腔（C1 全細節：旋轉吸盤與邊緣抓取銷、三槽擋液杯、擺動噴嘴臂、IPA 臂、背面噴嘴、排液排氣、閥島）、電控箱、化學液櫃（藥液桶、泵、濾芯、加熱、混合閥島）、批次酸槽（對照）。外形與比例是示意（依一般構造與專利原理），不是弘塑或辛耘的實機。由 gen-model.mjs 產生，不要手改",
  unit: "示意（1＝10 cm；晶圓直徑 300 mm）",
  size: { w: 40, h: 18, r: 0.6, t: 30 },
  palette, materials,
  partNames: { efem: "前端搬運區", ar: "雙刀手臂", aligner: "預對準器", c1Wall: "清洗腔", c1Cup: "擋液杯", c1Chuck: "旋轉吸盤", cc: "化學液櫃", bb: "批次酸槽", ebox: "電控箱" },
  layers, parts, anchors, actions,
  kin: { ar: kinAr },
  pose: { yaw0: -0.3, yawIso: -0.3, drift: 0 },
  camera: { stand: { d: 100, elev: 24, y: 9 } },
  fx: { dpr: 1, srcPx: 30, shadows: 0, fog: false, dust: false, vaporSprites: false, shimmer: false },
  info: { YW, WT, WR, EX0, EX1, EZ, EH, RB, L1, BL, FZ, FX, ALN, CX1, CHW, CHD, CHH, YB0, YBU, BLH, TKX: [0, 1, 2, 3, 4, 5].map(TKX), BBDECK, TKP, EBX0, EBX1, EBZ1, CCX0, CCX1, CCZ, NZ: info.NZ, IP: info.IP },
};
const out = path.join(path.dirname(new URL(import.meta.url).pathname), "model.json");
fs.writeFileSync(out, JSON.stringify(model, null, 1) + "\n");
console.log(`✔ ${out}：${parts.length} 個零件、${parts.reduce((a, p) => a + Math.max(1, (p.at?.length ?? 0) + (p.grid ? p.grid.n[0] * p.grid.n[1] : 0)), 0)} 個實體（含複製）、${layers.length} 層`);

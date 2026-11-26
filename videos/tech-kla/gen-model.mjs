// node videos/tech-kla/gen-model.mjs → 寫 videos/tech-kla/model.json
// 2026/11/26 tech-kla（設備五大-5：KLA，量測檢測）。構造與物理照 physics-spec.md、模組清單照 visual-spec.md。
// 單位：1＝10 cm（晶圓直徑 300 mm＝3），地板 y＝0，x 向右、z 向觀眾。外形是「櫃式箱體＋側邊前端搬運區」的共通造型（示意，非 39xx 實際尺寸）。
// ① 前端搬運區 EFEM（x −14～−7）：兩個裝載埠＋晶圓盒、大氣 SCARA 手臂（model.kin.ar 關節鏈）、預對準器、頂上風扇過濾機組；與主機之間一道牆，開一條送片窄縫
// ② 主機（x −7～11）：氣墊隔振腳 → 花崗岩基座 → X 軸長行程滑台 → Z 軸短行程滑台 → 真空吸盤（升降銷）；橋式花崗岩橫梁吊著光學頭、物鏡、上方 TDI 偵測器；
//    左後方寬頻電漿光源（雷射從側面打進封裝燈泡）→ 濾片轉盤 → 照明管 → 光學頭（分光鏡）→ 物鏡垂直往下（明場）；斜射暗場照明臂＋對面吸光擋板
// ③ 影像運算櫃（x 12～16）、後勤櫃、狀態燈塔、觸控螢幕、廠牌＋美國國旗
// ④ 量測站（x 20～30，另一台示意）：成像式疊對（物鏡＋框中框標記）、橢圓偏光膜厚（入射臂＋偏光片、反射臂＋旋轉檢偏器）
import fs from "node:fs";
import path from "node:path";

const R2 = (x) => Math.round(x * 1000) / 1000;
const D2R = Math.PI / 180;
const pol = (aDeg, r) => [R2(r * Math.cos(aDeg * D2R)), R2(r * Math.sin(aDeg * D2R))]; // (x, z)

const palette = {
  floorC: "#C9D2DE", panel: "#F3F5F8", panel2: "#E2E8F0", seam: "#8E9BB0", band: "#24324C", steel: "#7D8CA6", steel2: "#A9B5C7", dark: "#3E4A60",
  stage: "#8FA3C4", glassC: "#BFD3F2", granite: "#4A4F58", graniteL: "#6B717B", waferC: "#5F7FB8", dieC: "#7FA4E0", foupC: "#E8E2D4",
  lampY: "#F2B632", lampG: "#2FBF71", lampR: "#E5484D", screen: "#5B8DEF", pipeB: "#3E7BD6", pipeR: "#D9534F", rubber: "#2B2F36",
  bulb: "#F4F0FF", plasma: "#B9A8FF", laser: "#FF3B3B", light: "#9FD8FF", lightW: "#E8F4FF", lightR: "#7EE0C8", scanC: "#4FA3FF", pcbC: "#1F6B45", chipC: "#1C1F26", traceC: "#C9A24A", connC: "#2A2D33", ribbonC: "#B8BEC8", estop: "#D93A2B", knurl: "#5C6678", dfc: "#FFC857", defect: "#FF5A36",
  filtU: "#7B61FF", filtB: "#3E8EF7", filtG: "#2FBF71", filtV: "#C084FC", gold: "#C9A24A", filmC: "#2BA39A", markA: "#E8613C", markB: "#2A7F8F",
};
const M = (kind, color, o = {}) => ({ kind, color, ...o });
const glowM = (c, op, ei = 1) => M("std", c, { emissive: c, ei, opacity: op, rough: 1, metal: 0 });
const materials = {
  floor: M("std", "floorC", { rough: 0.7, metal: 0.3, tex: "brushed", texScale: 3 }),
  panel: M("std", "panel", { rough: 0.55, metal: 0.05, env: 0.25 }), panel2: M("std", "panel2", { rough: 0.6, metal: 0.05, env: 0.2 }),
  seam: M("std", "seam", { rough: 0.6, metal: 0.3 }), band: M("std", "band", { rough: 0.4, metal: 0.3, env: 0.4 }),
  steel: M("std", "steel", { rough: 0.35, metal: 0.85, env: 0.5 }), steel2: M("std", "steel2", { rough: 0.3, metal: 0.8, env: 0.6, tex: "brushed", texScale: 2 }),
  dark: M("std", "dark", { rough: 0.5, metal: 0.4, env: 0.3 }), stage: M("std", "stage", { rough: 0.45, metal: 0.5, tex: "brushed", texScale: 2.2, env: 0.4 }),
  granite: M("std", "granite", { rough: 0.85, metal: 0.05, tex: "brushed", texScale: 5 }), graniteL: M("std", "graniteL", { rough: 0.8, metal: 0.05 }),
  window: M("phys", "glassC", { rough: 0.05, metal: 0, clearcoat: 1, opacity: 0.45, env: 0.6 }),
  lens: M("phys", "glassC", { rough: 0.02, metal: 0, clearcoat: 1, opacity: 0.7, env: 0.9 }),
  wafer: M("phys", "waferC", { rough: 0.15, metal: 0.6, clearcoat: 0.9, env: 0.9 }), dieM: M("std", "dieC", { rough: 0.25, metal: 0.5, env: 0.8 }),
  foup: M("phys", "foupC", { rough: 0.35, metal: 0, clearcoat: 0.4, env: 0.3 }), foupDoor: M("std", "panel2", { rough: 0.5, metal: 0 }),
  lampY: M("std", "lampY", { emissive: "lampY", ei: 0.4, rough: 0.4, metal: 0 }), lampG: M("std", "lampG", { emissive: "lampG", ei: 0.35, rough: 0.4, metal: 0 }),
  lampR: M("std", "lampR", { emissive: "lampR", ei: 0.2, rough: 0.4, metal: 0 }),
  screen: M("std", "screen", { emissive: "screen", ei: 0.5, rough: 0.3, metal: 0 }), pipeB: M("std", "pipeB", { rough: 0.35, metal: 0.6, env: 0.4 }), pipeR: M("std", "pipeR", { rough: 0.35, metal: 0.6, env: 0.4 }),
  rubber: M("std", "rubber", { rough: 0.9, metal: 0 }), gold: M("std", "gold", { rough: 0.3, metal: 0.9, env: 0.8 }),
  bulb: M("std", "bulb", { emissive: "bulb", ei: 1, opacity: 0.95, rough: 1, metal: 0 }), plasma: glowM("plasma", 0.55),
  laserM: glowM("laser", 0.9), beam: glowM("light", 0.34), beamCore: glowM("lightW", 0.6), beamRet: glowM("lightR", 0.5), beamDF: glowM("dfc", 0.45), beamDFc: glowM("dfc", 0.2),
  spot: glowM("lightW", 0.85), defect: M("std", "defect", { emissive: "defect", ei: 0.8, rough: 0.5, metal: 0 }), defRing: glowM("defect", 0.7),
  filtU: glowM("filtU", 0.75, 0.5), filtB: glowM("filtB", 0.75, 0.5), filtG: glowM("filtG", 0.75, 0.5), filtV: glowM("filtV", 0.75, 0.5),
  film: M("std", "filmC", { rough: 0.3, metal: 0.3, env: 0.6, opacity: 0.85 }), markA: M("std", "markA", { rough: 0.4, metal: 0 }), markB: M("std", "markB", { rough: 0.4, metal: 0 }),
  dieHi: glowM("lightR", 0.55), scanBand: glowM("dfc", 0.62, 0.8), pcb: M("std", "pcbC", { rough: 0.5, metal: 0.1 }), chip: M("std", "chipC", { rough: 0.35, metal: 0.2, env: 0.4 }), trace: M("std", "traceC", { rough: 0.3, metal: 0.9, env: 0.6 }), conn: M("std", "connC", { rough: 0.5, metal: 0.2 }), ribbon: M("std", "ribbonC", { rough: 0.7, metal: 0 }), estop: M("std", "estop", { rough: 0.4, metal: 0, emissive: "estop", ei: 0.15 }), knurl: M("std", "knurl", { rough: 0.4, metal: 0.8, env: 0.5 }), glassDoor: M("phys", "glassC", { rough: 0.05, metal: 0, clearcoat: 1, opacity: 0.28, env: 0.6 }), ffuAir: glowM("light", 0.5),
  t_kla: { kind: "unlit", color: "#FFFFFF", img: "tex/brand/sign-kla.png" }, t_us: { kind: "unlit", color: "#FFFFFF", img: "tex/brand/flag-US.png" },
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

// ═════ 共用尺寸 ═════
const yW = 8.45, WT = 0.08, WR = 1.5;                 // 晶圓中心高（全程搬運高度）、厚、半徑
const OX = 2, OZ = 0;                                 // 物鏡正下方（檢測點）
const LOADX = -3.6;                                   // 晶圓台的裝片位置（x）
const RB = [-10.3, 0], L1 = 2.8, BL = 1.5, yA = 8.0;  // 大氣手臂底座、臂長、刀片長、肩高
const FOUP1 = [-15.85, 0], FOUP2 = [-15.85, 3.85], ALN = [-10.5, 3.8];
const EH = 17.5, MH = 17.5;

// ═════ 地板 ═════
LAY("floor", [80, 2, 6, -0.3], true);
P({ id: "floor", layer: "floor", shape: "slab", size: [80, 0.5, 40], r: 0.2, pos: [6, -0.25, 0], mat: "floor" });
P({ id: "floorSeam", layer: "floor", shape: "slab", size: [80, 0.04, 0.1], pos: [6, 0.01, 0], at: Array.from({ length: 7 }, (_, i) => [0, 0, -18 + i * 6]), mat: "seam" });

// ═════ ① 前端搬運區 EFEM ═════
LAY("efem", [7, EH, -10.5, EH / 2]); LAY("efemFront", [7, EH, -10.5, EH / 2]); LAY("ffu", [7, 1, -10.5, EH + 0.4]);
// 機殼：後牆、頂板、左牆（裝載埠那面，兩個開口）、右牆（通主機，開送片窄縫 y7.8–9.2、z −1.8～1.8）
BOX("efemBack", "efem", -14, -6.5, 0, EH, -4.7, -4.5, "panel");
BOX("efemBase", "efem", -14, -6.5, 0, 0.6, -4.5, 6, "band");
// 左牆在兩個裝載埠開口之外的部分（開口＝晶圓盒寬 ±1.95）
{ const cuts = [[-4.5, FOUP1[1] - 1.95], [FOUP1[1] + 1.95, FOUP2[1] - 1.95], [FOUP2[1] + 1.95, 6]];
  cuts.forEach(([z0, z1], i) => { if (z1 - z0 > 0.01) BOX(`efemLw${i}`, "efem", -14.2, -14, 0, EH, z0, z1, "panel"); }); }
for (const [c, n] of [[FOUP1[1], "1"], [FOUP2[1], "2"]]) { BOX(`efemLwLo${n}`, "efem", -14.2, -14, 0, 6.4, c - 1.95, c + 1.95, "panel"); BOX(`efemLwHi${n}`, "efem", -14.2, -14, 10.4, EH, c - 1.95, c + 1.95, "panel"); }
BOX("slotWallA", "efem", -6.7, -6.5, 0, EH, -4.5, -1.8, "panel2"); BOX("slotWallB", "efem", -6.7, -6.5, 0, EH, 1.8, 6, "panel2");
BOX("slotWallLo", "efem", -6.7, -6.5, 0, 7.8, -1.8, 1.8, "panel2"); BOX("slotWallHi", "efem", -6.7, -6.5, 9.2, EH, -1.8, 1.8, "panel2");
BOX("slotLip", "efem", -6.55, -6.45, 9.2, 9.3, -1.9, 1.9, "dark", { at: [[0, 0, 0], [0, -1.5, 0]] });
// 正面（朝觀眾）：不透明面板＋觀察窗＋門把（s3 講搬運時整片剖開）
BOX("efemFront", "efemFront", -14, -6.5, 0.6, EH, 5.8, 6.0, "panel");
BOX("efemFrontWin", "efemFront", -13, -8, 6.5, 12.5, 6.0, 6.08, "window");
BOX("efemFrontBand", "efemFront", -14, -6.5, 1.4, 2.0, 6.0, 6.1, "band");
BOX("efemFrontHandle", "efemFront", -8.4, -8.0, 8.5, 11.5, 6.08, 6.3, "dark");
// 頂上風扇過濾機組（平的格網過濾面，看不到風扇）
P({ id: "ffuBox", layer: "ffu", shape: "slab", size: [7.5, 0.8, 10.5], r: 0.1, pos: [-10.25, EH + 0.4, 0.75], mat: "panel2" });
P({ id: "ffuGrid", layer: "ffu", shape: "box", size: [6.4, 0.06, 0.05], pos: [-10.5, EH - 0.02, 0.75], at: Array.from({ length: 17 }, (_, i) => [0, 0, -4.8 + i * 0.6]), mat: "seam" });
// 裝載埠（兩座）：外側托板＋定位銷，晶圓盒前門被埠吸住打開
const lpBuild = (n, [fx, fz]) => {
  const lay = `lp${n}`, f = `foup${n}`, door = `foup${n}Door`; LAY(lay, [4, 7, -15.5, 3.5]); LAY(f, [4, 4, fx, 8.4]); LAY(door, [1, 4, -14.1, 8.4]);
  BOX(`${lay}Shelf`, lay, -18, -14.2, 6.2, 6.55, fz - 2.1, fz + 2.1, "stage");
  BOX(`${lay}Leg`, lay, -14.9, -14.2, 0, 6.2, fz - 1.6, fz + 1.6, "panel2");
  P({ id: `${lay}Pin`, layer: lay, shape: "cyl", size: [0.12, 0.2], rot: V, pos: [-15.9, 6.62, fz], at: [[-1, 0, -1.2], [-1, 0, 1.2], [1.1, 0, 0]], mat: "dark" });
  P({ id: `${lay}Led`, layer: lay, shape: "box", size: [0.08, 0.25, 0.6], pos: [-14.95, 5.5, fz], at: [[0, 0, -0.5], [0, 0, 0.5]], mat: "lampG" });
  // 晶圓盒：光滑外殼（頂、底、後、兩側）＋頂上把手法蘭＋兩側把手；前門朝前端搬運區
  BOX(`${f}Top`, f, -17.6, -14.2, 10.0, 10.25, fz - 1.95, fz + 1.95, "foup"); BOX(`${f}Bot`, f, -17.6, -14.2, 6.6, 6.85, fz - 1.95, fz + 1.95, "foup");
  BOX(`${f}Back`, f, -17.65, -17.4, 6.6, 10.25, fz - 1.95, fz + 1.95, "foup");
  BOX(`${f}SideA`, f, -17.6, -14.2, 6.6, 10.25, fz - 1.95, fz - 1.75, "foup"); BOX(`${f}SideB`, f, -17.6, -14.2, 6.6, 10.25, fz + 1.75, fz + 1.95, "foup");
  BOX(`${f}Flange`, f, -16.6, -15.1, 10.25, 10.6, fz - 0.8, fz + 0.8, "dark");
  BOX(`${f}Handle`, f, -16.6, -15.4, 8.0, 8.6, fz - 2.2, fz - 1.95, "panel2", { at: [[0, 0, 0], [0, 0, 4.15]] });
  // 盒內 7 片示意（25 槽只畫部分）＋槽齒
  P({ id: `${f}Stack`, layer: f, shape: "cyl", size: [WR, 0.05], rot: V, pos: [fx, 7.3, fz], at: [0, 0.3, 1.8, 2.1, 2.4, 2.7].map((dy) => [0, dy, 0]), mat: "wafer" });
  P({ id: `${f}Rib`, layer: f, shape: "box", size: [2.8, 0.04, 0.12], pos: [fx, 7.25, fz], at: Array.from({ length: 13 }, (_, i) => [0, i * 0.225, -1.68]).concat(Array.from({ length: 13 }, (_, i) => [0, i * 0.225, 1.68])), mat: "panel2" });
  BOX(`${door}`, door, -14.2, -14.05, 6.65, 10.2, fz - 1.9, fz + 1.9, "foupDoor");
  BOX(`${door}Latch`, door, -14.05, -13.95, 8.1, 8.8, fz - 1.2, fz + 1.2, "steel", { at: [[0, 0, -0.0]] });
};
lpBuild(1, FOUP1); lpBuild(2, FOUP2);
// 預對準器：底座＋轉軸＋小吸盤＋缺口感測器（ㄈ字形，紅光）
LAY("aligner", [2, 8.4, ALN[0], 4.2]);
P({ id: "alnBase", layer: "aligner", shape: "slab", size: [1.8, 7.3, 1.8], r: 0.15, pos: [ALN[0], 3.65 + 0.6, ALN[1]], mat: "panel2" });
P({ id: "alnHub", layer: "aligner", shape: "cyl", size: [0.24, 0.36], rot: V, pos: [ALN[0], 8.2, ALN[1]], mat: "steel" });
P({ id: "alnSpin", layer: "aligner", shape: "cyl", size: [0.22, 0.06], rot: V, pos: [ALN[0], 8.39, ALN[1]], mat: "rubber" });
// 缺口感測器（ㄈ字形夾住晶圓邊緣：下顎發光、上顎收光，晶圓從中間的縫轉過）
BOX("alnSensorPost", "aligner", ALN[0] - 0.3, ALN[0] + 0.3, 7.2, 9.0, ALN[1] + 1.9, ALN[1] + 2.1, "dark");
BOX("alnSensorLo", "aligner", ALN[0] - 0.3, ALN[0] + 0.3, 7.95, 8.22, ALN[1] + 1.2, ALN[1] + 2.1, "dark");
BOX("alnSensorHi", "aligner", ALN[0] - 0.3, ALN[0] + 0.3, 8.85, 9.0, ALN[1] + 1.2, ALN[1] + 2.1, "dark");
BOX("alnBeam", "aligner", ALN[0] - 0.08, ALN[0] + 0.08, 8.22, 8.25, ALN[1] + 1.32, ALN[1] + 1.48, "laserM");

// 大氣 SCARA 手臂（ar，model.kin.ar）：立柱（升降座）＋大臂 j1＋小臂 j2＋腕 j3＋刀片（lift）。靜止姿態全部朝 +x
LAY("ar", [6, 8.5, RB[0] + 2, 4.3]);
P({ id: "arCol", layer: "ar", shape: "cyl", size: [0.75, 7.2], rot: V, pos: [RB[0], 0.6 + 3.6, RB[1]], mat: "panel2" });
P({ id: "arColBand", layer: "ar", shape: "tube", size: [0.8, 0.6, 0.3], rot: V, pos: [RB[0], 6.9, RB[1]], mat: "band" });
P({ id: "arHead", layer: "ar", shape: "cyl", size: [0.6, 0.3], rot: V, pos: [RB[0], 7.9, RB[1]], mat: "steel" });
SEG({ id: "arLink1", layer: "ar", shape: "slab", size: [L1 + 0.6, 0.3, 0.9], r: 0.4, pos: [RB[0] + L1 / 2, 8.05, RB[1]], mat: "panel" }, 0, 6);
P({ id: "arElbow", layer: "ar", shape: "cyl", size: [0.45, 0.32], rot: V, pos: [RB[0] + L1, 8.18, RB[1]], mat: "steel" });
SEG({ id: "arLink2", layer: "ar", shape: "slab", size: [L1 + 0.5, 0.22, 0.7], r: 0.32, pos: [RB[0] + 1.5 * L1, 8.22, RB[1]], mat: "panel" }, 0, 6);
P({ id: "arWrist", layer: "ar", shape: "cyl", size: [0.34, 0.12], rot: V, pos: [RB[0] + 2 * L1, 8.3, RB[1]], mat: "steel" });
const GX = RB[0] + 2 * L1 + BL;
P({ id: "arBladeRoot", layer: "ar", shape: "box", size: [0.7, 0.05, 0.6], pos: [RB[0] + 2 * L1 + 0.15, 8.36, RB[1]], mat: "dark" });
SEG({ id: "arBlade", layer: "ar", shape: "box", size: [2.3, 0.04, 0.26], pos: [GX + 0.05, 8.37, RB[1]], at: [[0, 0, -0.45], [0, 0, 0.45]], mat: "steel2" }, 0, 6);
P({ id: "arPad", layer: "ar", shape: "cyl", size: [0.1, 0.04], rot: V, pos: [GX, 8.4, RB[1]], at: [[-0.8, 0, -0.45], [-0.8, 0, 0.45], [0.95, 0, -0.45], [0.95, 0, 0.45]], mat: "rubber" });
const kinAr = {
  layer: "ar", tip: "lift", size: 2 * L1 + BL, grip: [GX, 8.41, RB[1]],
  joints: [
    { id: "j1", type: "rot", axis: [0, 1, 0], pivot: [RB[0], 8.05, RB[1]], parts: ["arLink1"], min: -400, max: 400 },
    { id: "j2", parent: "j1", type: "rot", axis: [0, 1, 0], pivot: [RB[0] + L1, 8.18, RB[1]], parts: ["arElbow", "arLink2"], min: -178, max: 178 },
    { id: "j3", parent: "j2", type: "rot", axis: [0, 1, 0], pivot: [RB[0] + 2 * L1, 8.3, RB[1]], parts: ["arWrist"], min: -270, max: 270 },
    { id: "lift", parent: "j3", type: "slide", axis: [0, 1, 0], parts: ["arBladeRoot", "arBlade", "arPad"], min: -0.3, max: 0.4 },
  ],
  body: ["arCol", "arColBand", "arHead", "arLink1", "arElbow", "arLink2", "arWrist", "arBladeRoot", "arBlade", "arPad"],
  info: { L1, BL, type: "atmospheric SCARA (single blade)" },
};
// 晶圓：wfA（晶圓盒 → 預對準器）、wfR（預對準器上轉找缺口）、wfB（預對準器 → 晶圓台，之後跟著晶圓台掃描；有晶粒格與一顆缺陷）
const wafer = (lay, [x, z], dies) => {
  LAY(lay, [3, 0.3, x, yW]);
  P({ id: lay, layer: lay, shape: "cyl", size: [WR, WT], rot: V, pos: [x, yW, z], mat: "wafer" });
  P({ id: `${lay}Notch`, layer: lay, shape: "box", size: [0.16, 0.1, 0.12], pos: [x, yW + 0.005, z + WR - 0.04], mat: "dark" });
  if (dies) {
    const at = [];
    for (let i = -4; i <= 4; i++) for (let j = -4; j <= 4; j++) { const dx = i * 0.31, dz = j * 0.31; if (Math.hypot(Math.abs(dx) + 0.16, Math.abs(dz) + 0.16) < WR - 0.05) at.push([dx, 0, dz]); }
    P({ id: `${lay}Die`, layer: lay, shape: "box", size: [0.27, 0.012, 0.27], pos: [x, yW + WT / 2 + 0.006, z], at, mat: "dieM" });
  }
};
wafer("wfA", FOUP1, true); wafer("wfR", ALN, true); wafer("wfB", ALN, true);
// wfS：s8 俯視比對用的同一片晶圓（掃描結束、晶圓台停在物鏡下之後，同位置換成不帶搬運關係的這一層）
wafer("wfS", [OX, 0], true);
P({ id: "wfSDefect", layer: "wfS", shape: "sphere", size: [0.05], pos: [OX + 0.05, yW + 0.07, -0.04], mat: "defect" });
P({ id: "wfSDefRing", layer: "wfS", shape: "tube", size: [0.2, 0.15, 0.02], rot: V, pos: [OX + 0.05, yW + 0.07, -0.04], mat: "defRing" });
P({ id: "wfSDieHi", layer: "wfS", shape: "tube", size: [0.2, 0.17, 0.02], rot: V, pos: [OX, yW + 0.065, 0], at: [[0, 0, 0], [-0.31, 0, 0]], mat: "dieHi" });
// wfB：檢測點正下方那顆晶粒上的小缺陷（顆粒）＋缺陷圈（s8 亮）＋比對的兩顆相鄰晶粒框
P({ id: "wfBDefect", layer: "wfB", shape: "sphere", size: [0.05], pos: [ALN[0] + 0.05, yW + 0.07, ALN[1] - 0.04], mat: "defect" });
P({ id: "wfBDefRing", layer: "wfB", shape: "tube", size: [0.2, 0.15, 0.02], rot: V, pos: [ALN[0] + 0.05, yW + 0.07, ALN[1] - 0.04], mat: "defRing" });
P({ id: "wfBDieHi", layer: "wfB", shape: "tube", size: [0.2, 0.17, 0.02], rot: V, pos: [ALN[0], yW + 0.065, ALN[1]], at: [[0, 0, 0], [-0.31, 0, 0]], mat: "dieHi" });

// ═════ ② 主機 ═════
LAY("shell", [18, MH, 2, MH / 2]); LAY("roof", [18, 1, 2, MH + 0.3]); LAY("front", [18, MH, 2, MH / 2]);
BOX("shellBack", "shell", -6.9, 11, 0, MH, -6.2, -6.0, "panel"); BOX("shellRight", "shell", 10.8, 11, 0, MH, -6, 6, "panel");
BOX("shellBase", "shell", -6.9, 11, 0, 0.6, -6, 6, "band");
P({ id: "shellVent", layer: "shell", shape: "box", size: [0.05, 0.12, 3.2], pos: [11.03, 3, 2.5], at: Array.from({ length: 10 }, (_, i) => [0, i * 0.35, 0]), mat: "seam" });
P({ id: "roof", layer: "roof", shape: "slab", size: [18, 0.5, 12.2], r: 0.15, pos: [2.05, MH + 0.25, 0], mat: "panel2" });
P({ id: "roofFfu", layer: "roof", shape: "slab", size: [12, 0.5, 9], r: 0.1, pos: [2, MH + 0.75, 0], mat: "panel" });
P({ id: "roofGrid", layer: "roof", shape: "box", size: [11.4, 0.04, 0.05], pos: [2, MH + 1.02, 0], at: Array.from({ length: 14 }, (_, i) => [0, 0, -3.9 + i * 0.6]), mat: "seam" });
BOX("front", "front", -6.9, 11, 0.6, MH, 5.8, 6.0, "panel");
BOX("frontWin", "front", -3, 8, 6.5, 13, 6.0, 6.08, "window");
BOX("frontBand", "front", -6.9, 11, 1.4, 2.0, 6.0, 6.1, "band");
BOX("frontDoorSeam", "front", 2.45, 2.55, 0.6, 15, 6.0, 6.1, "seam");
BOX("frontHandle", "front", 1.6, 2.0, 7.5, 10.5, 6.08, 6.3, "dark", { at: [[0, 0, 0], [1.4, 0, 0]] });
// 觸控螢幕（懸臂）與狀態燈塔
LAY("ui", [3, 5, 9.5, 12]);
BOX("uiArm", "ui", 9.4, 9.6, 11.0, 11.2, 6.0, 7.2, "steel"); P({ id: "uiScreen", layer: "ui", shape: "slab", size: [2.4, 1.6, 0.18], r: 0.1, pos: [9.5, 11.6, 7.3], mat: "dark" });
BOX("uiGlass", "ui", 8.4, 10.6, 10.9, 12.3, 7.4, 7.43, "screen");
LAY("tower", [1, 3, 10, MH + 1.5]);
P({ id: "towerPole", layer: "tower", shape: "cyl", size: [0.12, 1.0], rot: V, pos: [10.2, MH + 1.0, 5.2], mat: "steel" });
P({ id: "towerR", layer: "tower", shape: "cyl", size: [0.3, 0.4], rot: V, pos: [10.2, MH + 2.6, 5.2], mat: "lampR" });
P({ id: "towerY", layer: "tower", shape: "cyl", size: [0.3, 0.4], rot: V, pos: [10.2, MH + 2.15, 5.2], mat: "lampY" });
P({ id: "towerG", layer: "tower", shape: "cyl", size: [0.3, 0.4], rot: V, pos: [10.2, MH + 1.7, 5.2], mat: "lampG" });
// 氣墊隔振腳（四支：缸體＋橡膠氣囊＋頂板）
LAY("iso", [16, 4.6, 2, 2.3]);
const ISO = [[-4.6, -3.8], [-4.6, 3.8], [8.6, -3.8], [8.6, 3.8]].map(([x, z]) => [x, 0, z]);
P({ id: "isoCan", layer: "iso", shape: "cyl", size: [0.8, 2.8], rot: V, pos: [0, 2.0, 0], at: ISO, mat: "steel" });
P({ id: "isoBag", layer: "iso", shape: "tube", size: [0.85, 0.3, 0.8], rot: V, pos: [0, 3.8, 0], at: ISO, mat: "rubber" });
P({ id: "isoTop", layer: "iso", shape: "cyl", size: [0.7, 0.2], rot: V, pos: [0, 4.3, 0], at: ISO, mat: "dark" });
P({ id: "isoFoot", layer: "iso", shape: "cyl", size: [1.0, 0.6], rot: V, pos: [0, 0.9, 0], at: ISO, mat: "band" });
// 花崗岩基座＋X 軸導軌（長行程）
LAY("granite", [15.4, 1.6, 2, 5.1]);
P({ id: "granite", layer: "granite", shape: "slab", size: [15.2, 1.4, 9.6], r: 0.1, pos: [2, 5.1, 0], mat: "granite" });
BOX("railX", "granite", -5.4, 9.4, 5.8, 6.1, -1.75, -1.35, "steel2", { at: [[0, 0, 0], [0, 0, 3.1]] });
BOX("motorX", "granite", -5.4, 9.4, 5.8, 5.95, -0.3, 0.3, "gold");
// X 滑台（stX，沿 x 走）＋Z 滑台（stZ，沿 z 走）＋吸盤（chuck，可升降）＋升降銷（pins）
LAY("stX", [3.6, 0.8, OX, 6.5]); LAY("stZ", [3.4, 0.6, OX, 7.2]); LAY("chuck", [3.4, 0.7, OX, 7.9]); LAY("pins", [2.4, 0.6, OX, 8.1]);
P({ id: "stX", layer: "stX", shape: "slab", size: [3.6, 0.7, 4.4], r: 0.08, pos: [OX, 6.45, 0], mat: "stage" });
BOX("stXCoil", "stX", OX - 1.4, OX + 1.4, 6.05, 6.12, -0.4, 0.4, "band");
BOX("railZ", "stX", OX - 1.3, OX + 1.3, 6.8, 7.0, -2.1, 2.1, "steel2", { at: [[-0.0, 0, 0]] });
BOX("railZ2", "stX", OX - 1.55, OX - 1.25, 6.8, 7.0, -2.1, 2.1, "steel2", { at: [[0, 0, 0], [2.8, 0, 0]] });
BOX("cableX", "stX", OX + 1.8, OX + 2.0, 6.2, 6.6, -2.0, 2.0, "dark");
P({ id: "stZ", layer: "stZ", shape: "slab", size: [3.4, 0.5, 3.4], r: 0.08, pos: [OX, 7.25, 0], mat: "steel2" });
P({ id: "stZEnc", layer: "stZ", shape: "box", size: [0.1, 0.14, 3.0], pos: [OX + 1.72, 7.25, 0], mat: "gold" });
P({ id: "chuck", layer: "chuck", shape: "cyl", size: [1.6, 0.55], rot: V, pos: [OX, 8.125, 0], mat: "stage" });
P({ id: "chuckTop", layer: "chuck", shape: "cyl", size: [1.52, 0.04], rot: V, pos: [OX, 8.385, 0], mat: "steel2" });
P({ id: "chuckVac", layer: "chuck", shape: "tube", size: [1.2, 1.12, 0.02], rot: V, pos: [OX, 8.405, 0], at: [[0, 0, 0], [0, 0, 0]], mat: "dark" });
P({ id: "chuckVac2", layer: "chuck", shape: "tube", size: [0.7, 0.64, 0.02], rot: V, pos: [OX, 8.405, 0], mat: "dark" });
P({ id: "pins", layer: "pins", shape: "cyl", size: [0.06, 0.6], rot: V, pos: [OX, 8.11, 0], at: [90, 225, 315].map((t) => { const [x, z] = pol(t, 1.0); return [x, 0, z]; }), mat: "steel" });
// 橋式橫梁（兩支花崗岩立柱在晶圓台行程兩側，橫梁沿 z 跨過）
LAY("bridge", [2, 8.4, OX, 9.8]);
BOX("bridgeCol", "bridge", OX - 0.8, OX + 0.8, 5.8, 13.6, -4.75, -3.9, "graniteL");
LAY("bridgeF", [2, 8, OX, 9.7]);
BOX("bridgeColF", "bridgeF", OX - 0.8, OX + 0.8, 5.8, 13.6, 3.9, 4.75, "graniteL");
BOX("bridgeBeam", "bridge", OX - 0.8, OX + 0.8, 12.4, 13.6, -4.75, 4.75, "graniteL");
// 光學頭（分光鏡在裡面）＋物鏡（多節鏡筒，最下面一片鏡片）＋ TDI 偵測器（散熱鰭片、訊號線）
LAY("head", [3, 1.8, OX, 11.7]); LAY("obj", [1.4, 2.2, OX, 10]); LAY("det", [2.4, 2.4, OX, 14.6]);
P({ id: "head", layer: "head", shape: "slab", size: [2.6, 1.5, 2.4], r: 0.12, pos: [OX, 11.75, 0], mat: "panel" });
BOX("headEdge", "head", OX - 1.32, OX + 1.32, 12.36, 12.5, -1.22, 1.22, "band");
P({ id: "headSplit", layer: "head", shape: "box", size: [1.0, 0.04, 0.9], rot: [0, 0, 45], pos: [OX, 11.8, 0], mat: "lens" });
P({ id: "obj", layer: "obj", shape: "cyl", size: [0.55, 1.2], rot: V, pos: [OX, 10.4, 0], mat: "steel2" });
P({ id: "objMid", layer: "obj", shape: "cyl", size: [0.45, 0.6], rot: V, pos: [OX, 9.5, 0], mat: "steel" });
P({ id: "objTip", layer: "obj", shape: "cone", size: [0.22, 0.4, 0.25], rot: V, pos: [OX, 9.08, 0], mat: "dark" });
P({ id: "objLens", layer: "obj", shape: "cyl", size: [0.2, 0.03], rot: V, pos: [OX, 8.95, 0], mat: "lens" });
P({ id: "objRing", layer: "obj", shape: "tube", size: [0.6, 0.5, 0.08], rot: V, pos: [OX, 10.6, 0], at: [[0, 0, 0], [0, 0.4, 0], [0, -0.4, 0]], mat: "gold" });
P({ id: "det", layer: "det", shape: "slab", size: [2.0, 1.4, 1.8], r: 0.1, pos: [OX, 14.3, 0], mat: "band" });
P({ id: "detFin", layer: "det", shape: "box", size: [2.0, 0.6, 0.06], pos: [OX, 15.3, 0], at: Array.from({ length: 8 }, (_, i) => [0, 0, -0.84 + i * 0.24]), mat: "steel2" });
P({ id: "detCable", layer: "det", shape: "cyl", size: [0.1, 4.0], rot: [0, 0, 90], pos: [OX + 3, 14.3, 0.4], mat: "dark" });
P({ id: "detLed", layer: "det", shape: "box", size: [0.3, 0.12, 0.05], pos: [OX - 0.5, 14.5, 0.92], mat: "lampG" });
// 寬頻電漿光源：燈箱（外殼）＋封裝燈泡（電漿）＋橢球反射鏡＋側面雷射模組＋雷射束；濾片轉盤；照明管接到光學頭
LAY("srcHouse", [4, 3.4, -3.4, 11.8]); LAY("src", [4, 3, -3.4, 11.8]); LAY("fw", [0.4, 2, -1.2, 11.8]); LAY("illum", [4, 0.8, -0.2, 11.8]);
BOX("srcHouseTop", "srcHouse", -5.4, -1.8, 13.4, 13.7, -1.3, 1.3, "panel2");
BOX("srcHouseBack", "srcHouse", -5.4, -1.8, 10.1, 13.7, -1.3, -1.1, "panel2");
BOX("srcHouseFront", "srcHouse", -5.4, -1.8, 10.1, 13.7, 1.1, 1.3, "panel2");
BOX("srcHouseFin", "srcHouse", -5.0, -2.2, 13.7, 14.3, -0.05, 0.05, "steel2", { at: [-1, -0.6, -0.2, 0.2, 0.6, 1].map((z) => [0, 0, z]) });
BOX("srcHouseBot", "srcHouse", -5.4, -1.8, 9.9, 10.1, -1.3, 1.3, "band");
P({ id: "srcRefl", layer: "src", shape: "cone", size: [0.35, 0.95, 1.3], rot: [0, 90, 0], pos: [-3.95, 11.8, 0], mat: "steel2" });
P({ id: "srcBulb", layer: "src", shape: "sphere", size: [0.38], pos: [-4.2, 11.8, 0], mat: "bulb" });
P({ id: "srcPlasma", layer: "src", shape: "sphere", size: [0.62], pos: [-4.2, 11.8, 0], mat: "plasma" });
P({ id: "srcStem", layer: "src", shape: "cyl", size: [0.08, 1.4], rot: V, pos: [-4.2, 11.0, 0], at: [[0, 0, 0], [0, 1.6, 0]], mat: "gold" });
P({ id: "srcLaser", layer: "src", shape: "slab", size: [1.2, 0.8, 0.9], r: 0.08, pos: [-4.2, 11.8, -2.1], mat: "dark" });
P({ id: "srcLaserBeam", layer: "src", shape: "cyl", size: [0.05, 1.3], rot: [0, 0, 0], pos: [-4.2, 11.8, -1.05], mat: "laserM" });
P({ id: "srcWater", layer: "src", shape: "cyl", size: [0.1, 1.3], rot: V, pos: [-4.6, 10.4, -2.2], at: [[0, 0, 0], [0, 0, -0.4]], mat: "pipeB" });
P({ id: "srcWaterH", layer: "src", shape: "cyl", size: [0.1, 1.2], rot: V, pos: [-4.6, 10.5, -1.6], at: [[0, 0, 0], [0, 0, -0.3]], mat: "pipeB" });
P({ id: "fwDisc", layer: "fw", shape: "cyl", size: [0.95, 0.1], rot: [0, 90, 0], pos: [-1.2, 11.8, 0], mat: "dark" });
P({ id: "fwHub", layer: "fw", shape: "cyl", size: [0.2, 0.3], rot: [0, 90, 0], pos: [-1.2, 11.8, 0], mat: "steel" });
for (const [i, m] of ["filtU", "filtB", "filtG", "filtV", "filtU", "filtB"].entries()) {
  const t = (i * 60) * D2R; P({ id: `fwF${i}`, layer: "fw", shape: "cyl", size: [0.2, 0.12], rot: [0, 90, 0], pos: [-1.18, R2(11.8 + 0.62 * Math.sin(t)), R2(0.62 * Math.cos(t))], mat: m });
}
P({ id: "fwMotor", layer: "fw", shape: "cyl", size: [0.25, 0.5], rot: [0, 90, 0], pos: [-0.85, 11.8, 0], mat: "band" });
P({ id: "illumTube", layer: "illum", shape: "cyl", size: [0.32, 1.7], rot: [0, 90, 0], pos: [-0.2, 12.42, 0], mat: "steel2" });
P({ id: "illumTube2", layer: "illum", shape: "cyl", size: [0.32, 0.7], rot: [0, 90, 0], pos: [-2.15, 12.42, 0], mat: "steel2" });
P({ id: "illumFlange", layer: "illum", shape: "tube", size: [0.42, 0.3, 0.12], rot: [0, 90, 0], pos: [-1.6, 12.42, 0], at: [[0, 0, 0], [2.2, 0, 0]], mat: "dark" });
// 暗場斜射照明臂（從左上斜打到檢測點，約 65°，示意）＋對面吸光擋板
LAY("dfArm", [2.6, 1.2, OX - 1.6, 9.7]); LAY("dump", [1, 0.8, OX + 2.0, 9.4]);
const DFA = 65, DFL = 2.2, dfx = Math.sin(DFA * D2R), dfy = Math.cos(DFA * D2R);
const at65 = (r) => [R2(OX - dfx * r), R2(yW + WT / 2 + dfy * r), 0];
P({ id: "dfArm", layer: "dfArm", shape: "cyl", size: [0.24, 1.6], rot: [90, 0, DFA], pos: at65(2.9), mat: "steel2" });
P({ id: "dfNozzle", layer: "dfArm", shape: "cone", size: [0.12, 0.24, 0.4], rot: [90, 0, DFA], pos: at65(1.95), mat: "dark" });
BOX("dfMount", "dfArm", OX - 3.8, OX - 3.3, 9.9, 12.0, -0.15, 0.15, "steel");
const sx = (r) => [R2(OX + dfx * r), R2(yW + WT / 2 + dfy * r), 0];
P({ id: "dump", layer: "dump", shape: "slab", size: [0.7, 0.5, 0.6], r: 0.05, rot: [0, 0, -DFA], pos: sx(2.3), mat: "rubber" });
BOX("dumpMount", "dump", OX + 2.1, OX + 2.3, 9.5, 12.4, -0.12, 0.12, "steel");
// 光（全部預設看不見，念到才出現）：照明主光束、物鏡下收斂的光錐（明場）、反射回來往上到偵測器、暗場斜射、鏡面反射進擋板、散射進物鏡的淡光錐、亮點
const LIGHT = ["lMain", "lBF", "lRet", "lDF", "lSpec", "lDFc", "lSpot"];
for (const l of LIGHT) LAY(l, [2, 2, OX, 10]);
P({ id: "lMain", layer: "lMain", shape: "cyl", size: [0.18, 5.2], rot: [0, 90, 0], pos: [-0.9, 12.42, 0], mat: "beam" });
P({ id: "lMainCore", layer: "lMain", shape: "cyl", size: [0.07, 5.2], rot: [0, 90, 0], pos: [-0.9, 12.42, 0], mat: "beamCore" });
P({ id: "lMainDown", layer: "lMain", shape: "cyl", size: [0.18, 0.6], rot: V, pos: [OX, 12.15, 0], mat: "beam" });
P({ id: "lBF", layer: "lBF", shape: "cone", size: [0.05, 0.42, 2.85], rot: V, pos: [OX, R2(yW + WT / 2 + 1.43), 0], mat: "beam" });
P({ id: "lBFCore", layer: "lBF", shape: "cone", size: [0.02, 0.16, 2.85], rot: V, pos: [OX, R2(yW + WT / 2 + 1.43), 0], mat: "beamCore" });
P({ id: "lRet", layer: "lRet", shape: "cyl", size: [0.11, 2.1], rot: V, pos: [OX, 12.6 + 0.0, 0], mat: "beamRet" });
P({ id: "lRetUp", layer: "lRet", shape: "cone", size: [0.05, 0.3, 2.8], rot: V, pos: [OX + 0.0, R2(yW + WT / 2 + 1.42), 0.0], mat: "beamRet" });
P({ id: "lDF", layer: "lDF", shape: "cyl", size: [0.09, DFL - 0.05], rot: [90, 0, DFA], pos: at65((DFL - 0.05) / 2), mat: "beamDF" });
P({ id: "lSpec", layer: "lSpec", shape: "cyl", size: [0.09, 2.05], rot: [90, 0, -DFA], pos: sx(1.02), mat: "beamDF" });
P({ id: "lDFc", layer: "lDFc", shape: "cone", size: [0.04, 0.4, 0.45], rot: V, pos: [OX, R2(yW + WT / 2 + 0.24), 0], mat: "beamDFc" });
P({ id: "lSpot", layer: "lSpot", shape: "cyl", size: [0.16, 0.012], rot: V, pos: [OX, R2(yW + WT / 2 + 0.008), 0], mat: "spot" });
// 後勤櫃（電源、冷卻、真空）：在主機後方，管線接進來
LAY("util", [5, 9, 6, 4.5]);
P({ id: "util", layer: "util", shape: "slab", size: [5, 9, 3], r: 0.15, pos: [6, 4.5, -8.5], mat: "panel2" });
BOX("utilBand", "util", 3.5, 8.5, 8.2, 8.6, -7.0, -6.95, "band");
P({ id: "utilPipe", layer: "util", shape: "cyl", size: [0.15, 2.6], rot: [0, 0, 0], pos: [5, 2.5, -6.9], at: [[0, 0, 0], [0.5, 0, 0], [1.5, 1.2, 0]], mat: "pipeB" });
P({ id: "utilPipeR", layer: "util", shape: "cyl", size: [0.15, 2.6], rot: [0, 0, 0], pos: [6.2, 2.5, -6.9], mat: "pipeR" });

// ═════ ③ 影像運算櫃（機旁）：機櫃＋前門網孔＋一排排板卡指示燈＋上方線槽通主機 ═════
LAY("pc", [4.5, 15, 14, 7.5]);
P({ id: "pc", layer: "pc", shape: "slab", size: [4.2, 15, 5.0], r: 0.12, pos: [14.3, 7.5, -1.5], mat: "band" });
BOX("pcSideL", "pc", 12.2, 12.4, 0.6, 14.4, 0.95, 1.62, "band"); BOX("pcSideR", "pc", 16.2, 16.4, 0.6, 14.4, 0.95, 1.62, "band");
BOX("pcDoor", "pc", 12.15, 16.45, 0.8, 14.2, 1.62, 1.66, "glassDoor");
BOX("pcDoorFrame", "pc", 12.1, 16.5, 0.75, 0.95, 1.6, 1.72, "dark", { at: [[0, 0, 0], [0, 13.4, 0]] });
BOX("pcDoorFrameV", "pc", 12.1, 12.3, 0.75, 14.35, 1.6, 1.72, "dark", { at: [[0, 0, 0], [4.2, 0, 0]] });
BOX("pcHandle", "pc", 15.9, 16.05, 6.5, 9.0, 1.72, 1.86, "steel");
P({ id: "pcLed", layer: "pc", shape: "box", size: [0.14, 0.14, 0.05], pos: [12.9, 3.75, 1.25], at: Array.from({ length: 4 }, (_, b) => Array.from({ length: 6 }, (_, j) => [j * 0.3, b * 2.7, 0])).flat(), mat: "lampG" });
P({ id: "pcFan", layer: "pc", shape: "tube", size: [0.5, 0.42, 0.06], rot: V, pos: [14.3, 15.03, -1.2], at: [[-1, 0, -1.2], [1, 0, -1.2], [-1, 0, 1.2], [1, 0, 1.2]], mat: "steel" });
BOX("pcTray", "pc", 10.8, 12.2, 15.5, 15.9, -0.6, 0.6, "steel");
// 廠牌（主機頂上正面）＋美國國旗
// 廠牌：正面雙門上方的平面銘板（寬約機身 1/4），國旗只放 2D 公司卡
LAY("sign", [5, 1.4, 2, 15.4]);
P({ id: "signBack", layer: "front", shape: "slab", size: [4.8, 1.3, 0.08], r: 0.06, pos: [2.5, 15.4, 6.06], mat: "panel" });
P({ id: "signLogo", layer: "front", shape: "plane", size: [4.4, R2(4.4 / (960 / 214))], pos: [2.5, 15.4, 6.11], uv01: true, shadow: false, mat: "t_kla" });

// ═════ ④ 量測站（另一台，示意）：機櫃底座＋小晶圓台＋成像物鏡（疊對）＋橢圓偏光兩支臂（膜厚） ═════
const MX = 25, MY = yW, OVZ0 = -0.9;
LAY("met", [10, 9, MX, 4.5]); LAY("metOvl", [2, 5, MX - 1.4, 11]); LAY("metEll", [2, 3, MX + 1.2, 10]); LAY("wM", [3, 0.5, MX, MY]);
LAY("lOvl", [1, 2, MX - 1, 9]); LAY("lEllIn", [1, 2, MX + 1, 9]); LAY("lEllOut", [1, 2, MX + 1, 9]);
P({ id: "met", layer: "met", shape: "slab", size: [9, 7.4, 7], r: 0.15, pos: [MX, 3.7, 0], mat: "panel" });
BOX("metBand", "met", MX - 4.5, MX + 4.5, 6.6, 7.0, 3.5, 3.55, "band");
P({ id: "metTop", layer: "met", shape: "slab", size: [8, 0.5, 6], r: 0.1, pos: [MX, 7.65, 0], mat: "graniteL" });
P({ id: "metStage", layer: "wM", shape: "cyl", size: [1.6, 0.5], rot: V, pos: [MX, 8.15, 0], mat: "stage" });
BOX("metPost", "met", MX - 3.4, MX - 2.8, 7.9, 14.4, OVZ0 - 0.4, OVZ0 + 0.4, "graniteL");
BOX("metArmH", "met", MX - 3.4, MX - 0.35, 13.8, 14.4, OVZ0 - 0.4, OVZ0 + 0.4, "graniteL");
LAY("metLbl", [4, 1, MX, 7]);
P({ id: "wM", layer: "wM", shape: "cyl", size: [WR, WT], rot: V, pos: [MX, MY, 0], mat: "wafer" });
P({ id: "wMFilm", layer: "wM", shape: "cyl", size: [WR - 0.02, 0.05], rot: V, pos: [MX, MY + 0.065, 0], mat: "film" });
// 疊對標記（框中框，放大示意）：下層外框（珊瑚）＋上層內框（深青），內框中心刻意偏一點；成像物鏡在後排（z −0.9），橢圓偏光在前排（z +0.7），兩排不互擋
const OVX = MX - 0.6, OVZ = -0.9;
for (const [i, [w, m, y, dx, dz]] of [[0.9, "markA", MY + 0.1, 0, 0], [0.42, "markB", MY + 0.12, 0.06, -0.04]].entries()) {
  const t = 0.08; P({ id: `ovlMark${i}`, layer: i ? "ovlTop" : "wM", shape: "box", size: [w, 0.02, t], pos: [OVX + dx, y, OVZ + dz], at: [[0, 0, -w / 2 + t / 2], [0, 0, w / 2 - t / 2]], mat: m });
  P({ id: `ovlMarkS${i}`, layer: i ? "ovlTop" : "wM", shape: "box", size: [t, 0.02, w], pos: [OVX + dx, y, OVZ + dz], at: [[-w / 2 + t / 2, 0, 0], [w / 2 - t / 2, 0, 0]], mat: m });
}
P({ id: "metObj", layer: "metOvl", shape: "cyl", size: [0.45, 1.6], rot: V, pos: [OVX, 10.0, OVZ], mat: "steel2" });
P({ id: "metObjTip", layer: "metOvl", shape: "cone", size: [0.18, 0.34, 0.25], rot: V, pos: [OVX, 9.08, OVZ], mat: "dark" });
P({ id: "metObjCam", layer: "metOvl", shape: "slab", size: [1.4, 1.3, 1.4], r: 0.1, pos: [OVX, 12.8, OVZ], mat: "band" });
P({ id: "metObjRing", layer: "metOvl", shape: "tube", size: [0.5, 0.4, 0.08], rot: V, pos: [OVX, 10.4, OVZ], at: [[0, 0, 0], [0, -0.5, 0]], mat: "gold" });
BOX("metArm", "metOvl", OVX - 0.25, OVX + 0.25, 11.6, 13.8, OVZ - 0.25, OVZ + 0.25, "steel");
P({ id: "lOvl", layer: "lOvl", shape: "cone", size: [0.05, 0.36, 0.85], rot: V, pos: [OVX, R2(MY + 0.5), OVZ], mat: "beam" });
// 橢圓偏光（前排 z＝EZ，x–y 平面）：入射臂（光源＋偏光片）從左上斜下 70°、反射臂（旋轉檢偏器＋光譜儀）往右上
const EX = MX + 0.5, EZ = 0.7, EA = 70, ex = Math.sin(EA * D2R), ey = Math.cos(EA * D2R);
const ePt = (r, s) => [R2(EX + s * ex * r), R2(MY + 0.06 + ey * r), EZ];
P({ id: "ellIn", layer: "metEll", shape: "cyl", size: [0.3, 1.6], rot: [90, 0, EA], pos: ePt(2.6, -1), mat: "steel2" });
P({ id: "ellPol", layer: "metEll", shape: "cyl", size: [0.36, 0.1], rot: [90, 0, EA], pos: ePt(1.7, -1), mat: "filtV" });
P({ id: "ellOut", layer: "metEll", shape: "cyl", size: [0.3, 1.6], rot: [90, 0, -EA], pos: ePt(2.6, 1), mat: "steel2" });
P({ id: "ellAna", layer: "metEll", shape: "cyl", size: [0.36, 0.1], rot: [90, 0, -EA], pos: ePt(1.7, 1), mat: "filtB" });
P({ id: "ellAnaMark", layer: "metEll", shape: "box", size: [0.05, 0.05, 0.5], rot: [0, 0, -EA], pos: ePt(1.62, 1), mat: "lampY" });
P({ id: "ellBox", layer: "metEll", shape: "slab", size: [1.0, 0.9, 0.9], r: 0.08, pos: ePt(3.7, 1), mat: "band" });
P({ id: "ellSrc", layer: "metEll", shape: "slab", size: [1.0, 0.9, 0.9], r: 0.08, pos: ePt(3.7, -1), mat: "band" });
BOX("ellMount", "metEll", EX - 3.7, EX + 3.7, 10.7, 11.0, EZ - 0.15, EZ + 0.15, "steel");
BOX("ellPost", "metEll", EX - 3.85, EX - 3.55, 7.9, 10.7, EZ - 0.15, EZ + 0.15, "steel", { at: [[0, 0, 0], [7.4, 0, 0]] });
P({ id: "ellHang", layer: "metEll", shape: "box", size: [0.12, 0.55, 0.12], pos: [0, 10.43, EZ], at: [ePt(3.7, -1), ePt(3.7, 1)].map(([x]) => [x, 0, 0]), mat: "dark" });
P({ id: "lEllIn", layer: "lEllIn", shape: "cyl", size: [0.07, 1.55], rot: [90, 0, EA], pos: ePt(0.8, -1), mat: "beamCore" });
P({ id: "lEllOut", layer: "lEllOut", shape: "cyl", size: [0.07, 1.55], rot: [90, 0, -EA], pos: ePt(0.8, 1), mat: "beamRet" });


// ═════ 細節層（Andy 11/26 第 20 條：入鏡 >2 秒或被標籤指到的零件，都要看得出是真的零件，不是積木）═════
const SCREWS = (id, layer, pts, mat = "steel", r = 0.05, ax = "z") => P({ id, layer, shape: "cyl", size: [r, 0.04], rot: ax === "z" ? [0, 0, 0] : ax === "x" ? [0, 90, 0] : V, pos: [0, 0, 0], at: pts, mat });
const grid = (x0, x1, nx, y0, y1, ny, z) => { const o = []; for (let i = 0; i < nx; i++) for (let j = 0; j < ny; j++) o.push([R2(x0 + ((x1 - x0) * i) / Math.max(1, nx - 1)), R2(y0 + ((y1 - y0) * j) / Math.max(1, ny - 1)), z]); return o; };
// 主機正面：面板接縫、四角螺絲、下方進氣格柵、緊急停止鈕、狀態燈條、型號小銘板
BOX("frontSeamH", "front", -6.9, 11, 4.95, 5.0, 6.0, 6.07, "seam", { at: [[0, 0, 0], [0, 9.0, 0]] });
SCREWS("frontScrew", "front", grid(-6.5, 10.6, 6, 1.0, 16.9, 4, 6.04));
P({ id: "frontGrille", layer: "front", shape: "box", size: [6.0, 0.08, 0.05], pos: [-3.6, 2.4, 6.06], at: Array.from({ length: 7 }, (_, i) => [0, i * 0.3, 0]), mat: "dark" });
P({ id: "frontGrille2", layer: "front", shape: "box", size: [4.0, 0.08, 0.05], pos: [7.6, 2.4, 6.06], at: Array.from({ length: 7 }, (_, i) => [0, i * 0.3, 0]), mat: "dark" });
P({ id: "frontEstop", layer: "front", shape: "cyl", size: [0.32, 0.18], rot: [0, 0, 0], pos: [9.6, 9.2, 6.12], mat: "estop" });
P({ id: "frontEstopRing", layer: "front", shape: "tube", size: [0.48, 0.32, 0.06], rot: [0, 0, 0], pos: [9.6, 9.2, 6.05], mat: "lampY" });
P({ id: "frontLed", layer: "front", shape: "box", size: [0.5, 0.12, 0.05], pos: [5.6, 14.6, 6.07], at: [[0, 0, 0], [0.7, 0, 0], [1.4, 0, 0]], mat: "lampG" });
P({ id: "frontModel", layer: "front", shape: "slab", size: [1.6, 0.5, 0.05], r: 0.04, pos: [-0.6, 14.6, 6.06], mat: "dark" });
BOX("frontWinFrame", "front", -3.15, 8.15, 6.35, 6.5, 6.0, 6.1, "dark", { at: [[0, 0, 0], [0, 6.65, 0]] });
BOX("frontWinFrameV", "front", -3.15, -3.0, 6.35, 13.15, 6.0, 6.1, "dark", { at: [[0, 0, 0], [11.15, 0, 0]] });
// 前端搬運區：螺絲、緊急停止鈕、觀察窗框、裝載埠操作面板
SCREWS("efemScrew", "efemFront", grid(-13.7, -6.8, 4, 1.0, 17.0, 4, 6.04));
P({ id: "efemEstop", layer: "efemFront", shape: "cyl", size: [0.3, 0.18], rot: [0, 0, 0], pos: [-7.6, 13.6, 6.12], mat: "estop" });
BOX("efemWinFrame", "efemFront", -13.1, -7.9, 6.35, 6.5, 6.0, 6.1, "dark", { at: [[0, 0, 0], [0, 6.15, 0]] });
for (const n of ["1", "2"]) { const fz = n === "1" ? FOUP1[1] : FOUP2[1];
  P({ id: `lp${n}Panel`, layer: `lp${n}`, shape: "slab", size: [0.08, 0.9, 1.2], r: 0.04, pos: [-14.96, 4.6, fz], mat: "dark" });
  P({ id: `lp${n}Btn`, layer: `lp${n}`, shape: "cyl", size: [0.12, 0.06], rot: [0, 90, 0], pos: [-15.02, 4.6, fz], at: [[0, 0.2, -0.3], [0, 0.2, 0.3], [0, -0.2, 0]], mat: "lampG" }); }
// 晶圓台：導軌滑塊（X 軸 4 顆、Y 軸 4 顆）、線性馬達磁軌（深淺交錯）、拖鏈、光學尺讀頭、吸盤真空接頭
P({ id: "stXBlock", layer: "stX", shape: "slab", size: [0.9, 0.3, 0.6], r: 0.05, pos: [OX, 6.2, 0], at: [[-1.1, 0, -1.55], [1.1, 0, -1.55], [-1.1, 0, 1.55], [1.1, 0, 1.55]], mat: "steel" });
SCREWS("stXBlockScrew", "stX", [[-1.3, 6.36, -1.45], [-0.9, 6.36, -1.45], [1.3, 6.36, -1.45], [0.9, 6.36, -1.45], [-1.3, 6.36, 1.65], [-0.9, 6.36, 1.65], [1.3, 6.36, 1.65], [0.9, 6.36, 1.65]].map(([x, y, z]) => [OX + x, y, z]), "dark", 0.04, "y");
P({ id: "stZBlock", layer: "stZ", shape: "slab", size: [0.55, 0.25, 0.8], r: 0.05, pos: [OX, 7.05, 0], at: [[-1.4, 0, -1.0], [-1.4, 0, 1.0], [1.4, 0, -1.0], [1.4, 0, 1.0]], mat: "steel" });
P({ id: "motorMag", layer: "granite", shape: "box", size: [0.35, 0.05, 0.5], pos: [0, 5.97, 0], at: Array.from({ length: 36 }, (_, i) => [R2(-5.0 + i * 0.4), 0, 0]), mat: "dark" });
P({ id: "dragChain", layer: "granite", shape: "slab", size: [0.28, 0.3, 0.5], r: 0.04, pos: [0, 6.0, 4.2], at: Array.from({ length: 24 }, (_, i) => [R2(-4.4 + i * 0.36), 0, 0]), mat: "conn" });
BOX("dragTray", "granite", -5.0, 9.0, 5.8, 5.85, 3.8, 4.6, "steel");
P({ id: "stZRead", layer: "stZ", shape: "box", size: [0.3, 0.2, 0.25], pos: [OX + 1.78, 7.25, 1.2], mat: "conn" });
P({ id: "chuckFit", layer: "chuck", shape: "cyl", size: [0.1, 0.4], rot: [0, 90, 0], pos: [OX + 1.75, 7.95, 0.0], at: [[0, 0, -0.3], [0, 0, 0.3]], mat: "trace" });
P({ id: "graniteBolt", layer: "granite", shape: "cyl", size: [0.12, 0.08], rot: V, pos: [0, 5.82, 0], at: [[-5.2, 0, -4.4], [-5.2, 0, 4.4], [9.2, 0, -4.4], [9.2, 0, 4.4], [2, 0, -4.4], [2, 0, 4.4]], mat: "steel" });
// 隔振腳：氣管接頭＋管夾、底座螺栓
P({ id: "isoFit", layer: "iso", shape: "cyl", size: [0.08, 0.5], rot: [0, 90, 0], pos: [0, 3.0, 0], at: ISO.map(([x, , z]) => [x + 0.95, 0, z]), mat: "trace" });
P({ id: "isoBolt", layer: "iso", shape: "cyl", size: [0.08, 0.08], rot: V, pos: [0, 1.25, 0], at: ISO.flatMap(([x, , z]) => [0, 90, 180, 270].map((t) => { const [dx, dz] = pol(t, 0.85); return [x + dx, 0, z + dz]; })), mat: "dark" });
// 物鏡：鏡座三顆調整螺絲、滾花環、遮光筒；光學頭：接頭與線纜、蓋板螺絲
P({ id: "objKnurl", layer: "obj", shape: "box", size: [0.05, 0.3, 0.05], pos: [OX, 10.8, 0], at: Array.from({ length: 20 }, (_, i) => { const [x, z] = pol(i * 18, 0.57); return [x, 0, z]; }), mat: "knurl" });
P({ id: "objAdj", layer: "obj", shape: "cyl", size: [0.06, 0.3], rot: [0, 0, 0], pos: [OX, 11.0, 0], at: [0, 120, 240].map((t) => { const [x, z] = pol(t, 0.62); return [x, 0, z]; }), mat: "dark" });
P({ id: "headScrew", layer: "head", shape: "cyl", size: [0.05, 0.04], rot: [0, 0, 0], pos: [OX, 11.75, 1.22], at: grid(-1.1, 1.1, 4, -0.6, 0.6, 2, 0), mat: "steel" });
P({ id: "headConn", layer: "head", shape: "cyl", size: [0.14, 0.3], rot: [0, 90, 0], pos: [OX + 1.42, 11.6, 0], at: [[0, 0, -0.4], [0, 0, 0.4]], mat: "trace" });
P({ id: "headCable", layer: "head", shape: "cyl", size: [0.07, 1.6], rot: V, pos: [OX + 1.6, 12.4, 0], at: [[0, 0, -0.4], [0, 0, 0.4]], mat: "conn" });
// 偵測器：側面外露的電路板（晶片、被動元件、走線、連接器、排線）
P({ id: "detPcb", layer: "det", shape: "box", size: [1.6, 1.0, 0.04], pos: [OX, 14.3, 0.93], mat: "pcb" });
P({ id: "detChip", layer: "det", shape: "box", size: [0.36, 0.36, 0.05], pos: [OX, 14.35, 0.97], at: [[-0.4, 0, 0], [0.3, 0.12, 0]], mat: "chip" });
P({ id: "detCap", layer: "det", shape: "box", size: [0.06, 0.04, 0.04], pos: [OX, 14.0, 0.97], at: grid(-0.7, 0.7, 9, -0.12, 0.0, 2, 0), mat: "trace" });
P({ id: "detTrace", layer: "det", shape: "box", size: [0.9, 0.012, 0.01], pos: [OX, 14.6, 0.955], at: [[0, 0, 0], [0, 0.06, 0], [0, -0.06, 0], [0.1, -0.14, 0]], mat: "trace" });
P({ id: "detConn", layer: "det", shape: "box", size: [0.5, 0.16, 0.12], pos: [OX + 0.45, 13.85, 0.99], mat: "conn" });
P({ id: "detRibbon", layer: "det", shape: "box", size: [0.42, 1.2, 0.02], pos: [OX + 0.45, 13.2, 1.0], mat: "ribbon" });
// 光源：鏡座法蘭＋調整螺絲、雷射散熱鰭片＋光纖接頭、冷卻水管接頭與管夾
P({ id: "srcMount", layer: "src", shape: "tube", size: [1.05, 0.9, 0.12], rot: [0, 90, 0], pos: [-3.3, 11.8, 0], mat: "knurl" });
P({ id: "srcAdj", layer: "src", shape: "cyl", size: [0.05, 0.3], rot: [0, 90, 0], pos: [-3.2, 11.8, 0], at: [0, 120, 240].map((t) => [0, R2(Math.sin((t * Math.PI) / 180) * 0.98), R2(Math.cos((t * Math.PI) / 180) * 0.98)]), mat: "dark" });
P({ id: "srcLaserFin", layer: "src", shape: "box", size: [1.1, 0.4, 0.05], pos: [-4.2, 12.35, -2.1], at: Array.from({ length: 6 }, (_, i) => [0, 0, R2(-0.35 + i * 0.14)]), mat: "steel2" });
P({ id: "srcFiber", layer: "src", shape: "cyl", size: [0.07, 1.4], rot: [0, 90, 0], pos: [-5.1, 11.6, -2.1], mat: "lampY" });
P({ id: "srcClamp", layer: "src", shape: "tube", size: [0.16, 0.1, 0.08], rot: V, pos: [-4.6, 10.3, -2.2], at: [[0, 0, 0], [0, 0, -0.4]], mat: "steel" });
// 濾片轉盤馬達接頭與線、後勤管夾、運算櫃電路板（晶片、被動元件、走線、連接器、排線）
P({ id: "fwCable", layer: "fw", shape: "cyl", size: [0.05, 0.9], rot: V, pos: [-0.6, 11.3, 0.2], mat: "conn" });
P({ id: "utilClamp", layer: "util", shape: "tube", size: [0.22, 0.14, 0.1], rot: V, pos: [5, 3.0, -6.9], at: [[0, 0, 0], [0.5, 0, 0], [1.2, 0, 0], [0, 1.2, 0], [0.5, 1.2, 0]], mat: "steel" });
for (let b = 0; b < 4; b++) { const y = 3.0 + b * 2.7;
  P({ id: `pcBoard${b}`, layer: "pc", shape: "box", size: [3.6, 1.9, 0.04], pos: [14.3, y, 1.2], mat: "pcb" });
  P({ id: `pcBga${b}`, layer: "pc", shape: "box", size: [0.55, 0.55, 0.06], pos: [14.3, y + 0.15, 1.24], at: [[-1.1, 0, 0], [-0.3, 0, 0], [0.5, 0, 0]], mat: "chip" });
  P({ id: `pcPass${b}`, layer: "pc", shape: "box", size: [0.08, 0.05, 0.04], pos: [14.3, y - 0.55, 1.23], at: grid(-1.5, 1.5, 12, 0, 0.12, 2, 0), mat: "trace" });
  P({ id: `pcTrace${b}`, layer: "pc", shape: "box", size: [2.6, 0.015, 0.01], pos: [14.3, y - 0.3, 1.225], at: [[0, 0, 0], [0, 0.05, 0], [0, 0.1, 0], [0, 0.15, 0]], mat: "trace" });
  P({ id: `pcConn${b}`, layer: "pc", shape: "box", size: [0.3, 1.5, 0.14], pos: [16.0, y, 1.26], mat: "conn" });
  P({ id: `pcRibbon${b}`, layer: "pc", shape: "box", size: [0.25, 0.8, 0.02], pos: [16.0, y - 1.1, 1.34], mat: "ribbon" }); }

// ═════ 掃描條帶（s7，每條 4 段，層 sc<條>_<段>，跟著晶圓台一起移動）═════
const LANEZ = [0.9, 0, -0.9];
LANEZ.forEach((lz, i) => { for (let j = 0; j < 4; j++) { const id = `sc${i}_${j}`, half = Math.sqrt(Math.max(0, WR * WR - lz * lz)) - 0.05, x0 = -half + (j * 2 * half) / 4;
  LAY(id, [1, 0.1, OX, yW]); P({ id, layer: id, shape: "box", size: [R2((2 * half) / 4 + 0.01), 0.01, 0.62], pos: [R2(OX + x0 + half / 4), R2(yW + WT / 2 + 0.012), lz], mat: "scanBand" }); } });
// 疊對：上層內框獨立一層（推近時往一邊偏）
LAY("ovlTop", [1, 0.1, OVX, MY]);

// ═════ 運作動畫 ═════
const lpt = (layer, p) => ({ layer, p });
actions.srcGlow = { type: "pulse", _說明: "電漿亮球：雷射持續供能，亮度微微閃動（不是白熾燈絲）", parts: ["srcPlasma", "srcBulb"], color: "plasma", glow: 1, freq: 2.2, halo: 0 };
actions.laser = { type: "pulse", _說明: "雷射束（紅）打進燈泡", parts: ["srcLaserBeam"], color: "laser", glow: 1, steady: true, halo: 0 };
actions.fwSpin = { type: "rotate", _說明: "濾片轉盤轉到要的波段（起轉、停轉有加減速）", parts: ["fwDisc", "fwHub", ...Array.from({ length: 6 }, (_, i) => `fwF${i}`)], axis: [1, 0, 0], pivot: [-1.2, 11.8, 0], pivots: Object.fromEntries(["fwDisc", "fwHub", ...Array.from({ length: 6 }, (_, i) => `fwF${i}`)].map((k) => [k, [-1.2, 11.8, 0]])), rps: 0.5, rampSpin: true };
actions.bfPulse = { type: "pulse", _說明: "明場光錐：亮度穩定，中心較亮", parts: ["lBF", "lBFCore", "lMain", "lMainCore", "lMainDown"], color: "light", glow: 0.7, steady: true, halo: 0 };
actions.spot = { type: "pulse", _說明: "照到晶圓的小亮點", parts: ["lSpot"], color: "lightW", glow: 1, freq: 1.0, halo: 0 };
actions.dfPulse = { type: "pulse", parts: ["lDF", "lSpec"], color: "dfc", glow: 0.8, steady: true, halo: 0 };
actions.defGlow = { type: "pulse", _說明: "缺陷被照到：散射亮點閃", parts: ["wfBDefect", "wfSDefect"], color: "defect", glow: 1, freq: 2.4, halo: 0 };
actions.defRing = { type: "pulse", _說明: "比對後圈出缺陷", parts: ["wfBDefRing", "wfSDefRing"], color: "defect", glow: 1, freq: 1.4, halo: 0 };
actions.dieHi = { type: "pulse", _說明: "相鄰兩顆晶粒框起來比對", parts: ["wfBDieHi", "wfSDieHi"], color: "lightR", glow: 0.9, freq: 1.0, halo: 0 };
actions.pcBlink = { type: "pulse", _說明: "運算櫃板卡指示燈（比對中）", parts: ["pcLed"], color: "lampG", glow: 1, freq: 3.0, halo: 0 };
actions.status = { type: "pulse", parts: ["towerG", "detLed"], color: "lampG", glow: 0.8, freq: 0.5, halo: 0 };
actions.alnLaser = { type: "pulse", _說明: "缺口感測器紅光", parts: ["alnBeam"], color: "laser", glow: 1, freq: 3, halo: 0 };
actions.alnSpin = { type: "rotate", _說明: "預對準器帶著晶圓轉，找缺口（起轉、停轉有加減速）", parts: ["wfR", "wfRNotch", "wfRDie", "alnSpin"], axis: [0, 1, 0], pivot: [ALN[0], yW, ALN[1]], pivots: Object.fromEntries(["wfR", "wfRNotch", "wfRDie", "alnSpin"].map((k) => [k, [ALN[0], yW, ALN[1]]])), rps: 0.6, rampSpin: true };
actions.ffuAir = { type: "flow", _說明: "風扇過濾機組往下吹的潔淨空氣（向下層流）", path: [lpt("efem", [-12.5, 16.6, 4.5]), lpt("efem", [-12.5, 10.5, 4.5])], n: 3, lanes: 4, laneGap: 1.4, laneDir: [1, 0, 0], size: 0.09, shape: "dot", rate: 0.45, color: "light", track: false };
// 散射：缺陷把斜射光往四面八方散開（上半球 7 道，短而快、帶拖尾；只有往上那幾道進物鏡）
const SC = [[0, 90], [35, 70], [145, 70], [80, 40], [200, 45], [270, 55], [320, 35]];
SC.forEach(([az, el], i) => {
  const r = 1.0, dx = R2(r * Math.cos(el * D2R) * Math.cos(az * D2R)), dz = R2(r * Math.cos(el * D2R) * Math.sin(az * D2R)), dy = R2(r * Math.sin(el * D2R));
  actions[`scat${i}`] = { type: "flow", _說明: "缺陷散射光（從缺陷往外，越遠越淡）", path: [lpt("lDFc", [OX, yW + 0.1, OZ]), lpt("lDFc", [R2(OX + dx), R2(yW + 0.1 + dy), R2(OZ + dz)])], n: 3, size: 0.05, shape: "dot", rate: 1.6, phase: i * 0.13, color: "dfc", trail: 3, trailGap: 0.03, trailColor: "dfc", track: false };
});
actions.ovlPulse = { type: "pulse", parts: ["lOvl", "ovlMark1"], color: "light", glow: 0.8, freq: 1.0, halo: 0 };
actions.ellBeam = { type: "pulse", parts: ["lEllIn", "lEllOut"], color: "lightW", glow: 0.8, steady: true, halo: 0 };
actions.ellAna = { type: "rotate", _說明: "反射臂上的檢偏器一直轉，量偏振怎麼變", parts: ["ellAna", "ellAnaMark"], axis: [R2(ex), R2(ey), 0], pivot: ePt(1.7, 1), pivots: { ellAna: ePt(1.7, 1), ellAnaMark: ePt(1.7, 1) }, rps: 0.7, rampSpin: true };

// ── 標註點 ──
const A = (layer, p, dx, dy) => ({ layer, p, dx, dy });
Object.assign(anchors, {
  src: A("src", [-4.0, 12.3, 0.6], -140, -150), head: A("head", [OX, 12.5, 1.2], 150, -150), obj: A("obj", [OX + 0.5, 9.6, 0.4], 150, -110),
  stage: A("stX", [OX + 1.6, 6.8, 2.2], 150, 120), pc: A("pc", [14.3, 13, 1.7], -150, -150), det: A("det", [OX + 0.8, 15, 0.9], 150, -120),
  foup: A("foup1", [-16, 10.4, -2.2], -140, -120), aln: A("aligner", [ALN[0], 9.0, ALN[1] + 0.8], 140, -120), ar: A("ar", [RB[0], 8.4, RB[1]], 140, 110),
  plasma: A("src", [-4.2, 11.8, 0.3], -150, -140), laser: A("src", [-4.2, 11.85, -1.5], 150, -120), fw: A("fw", [-1.2, 12.8, 0.2], 140, -140),
  bf: A("lBF", [OX + 0.3, 9.8, 0], 150, -130), df: A("dfArm", [OX - 2.6, 10.3, 0], -150, -130), dump: A("dump", [OX + 2.1, 9.8, 0.2], 150, -120),
  defect: A("wfS", [OX + 0.05, yW + 0.12, -0.04], 140, 120), iso: A("iso", [8.6, 2.4, 3.8], 150, -120),
  ovl: A("metOvl", [OVX + 0.5, 10.6, OVZ], 150, -140), ell: A("metEll", [EX + 1.2, 9.6, EZ], 150, -120), film: A("wM", [EX, MY + 0.1, 1.0], 150, 110),
  sign: A("front", [2.5, 14.8, 6.1], -150, -130), chuck: A("chuck", [OX + 1.0, 8.42, 0.6], 150, -130),
});

for (const d of Object.values(actions)) if (d.type === "flow" && d.path?.[0]?.p) { d.layer = d.path[0].layer; d.path = d.path.map((q) => q.p); d.free = true; }
const model = {
  name: "示意 光學缺陷檢測機＋量測站（tech-kla）：前端搬運區（裝載埠、晶圓盒、大氣 SCARA 手臂、預對準器、風扇過濾機組）、主機（氣墊隔振腳、花崗岩基座、X／Z 雙軸晶圓台、真空吸盤與升降銷、橋式橫梁、光學頭、物鏡、TDI 偵測器、寬頻電漿光源（雷射＋燈泡＋反射鏡）、濾片轉盤、照明管、暗場斜射臂、吸光擋板）、影像運算櫃、後勤櫃、燈塔、觸控螢幕；量測站（成像疊對、橢圓偏光）。外形與比例是示意，不仿特定機型。由 gen-model.mjs 產生，不要手改",
  unit: "示意（1＝10 cm；晶圓直徑 300 mm）",
  size: { w: 40, h: 18, r: 0.6, t: 30 },
  palette, materials,
  partNames: { src: "寬頻電漿光源", head: "光學頭", obj: "物鏡", stage: "晶圓台", pc: "影像運算櫃", efem: "前端搬運區", met: "量測站" },
  layers, parts, anchors, actions,
  kin: { ar: kinAr },
  pose: { yaw0: -0.3, yawIso: -0.3, drift: 0 },
  camera: { stand: { d: 90, elev: 24, y: 8 } },
  fx: { dpr: 1, srcPx: 30, shadows: 0, fog: false, dust: false, vaporSprites: false, shimmer: false },
  info: { yW, WT, WR, OX, OZ, LOADX, RB, L1, BL, FOUP1, FOUP2, ALN, MX, OVX, OVZ, EX, EZ, DFA },
};
const out = path.join(path.dirname(new URL(import.meta.url).pathname), "model.json");
fs.writeFileSync(out, JSON.stringify(model, null, 1) + "\n");
console.log(`✔ ${out}：${parts.length} 個零件、${parts.reduce((a, p) => a + Math.max(1, (p.at?.length ?? 0) + (p.grid ? p.grid.n[0] * p.grid.n[1] : 0)), 0)} 個實體（含複製）、${layers.length} 層`);

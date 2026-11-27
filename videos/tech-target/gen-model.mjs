// node videos/tech-target/gen-model.mjs → 寫 videos/tech-target/model.json
// 2026/11/27 tech-target（濺鍍靶材，系列 2 第 13 集）。構造與物理照 physics-spec.md、模組清單照 visual-spec.md。
// 單位：1＝10 cm（晶圓直徑 300 mm＝3），地板頂面 y＝−1.4，x 向右、z 向觀眾。陰極總成沿 y 軸（x＝0、z＝0）由上而下疊：
//   供電接頭／上蓋＋驅動 → 磁鐵組（磁軛＋磁鐵圈＋偏心軸）→ 冷卻水腔 → 背板 → 焊層 → 靶材 → 暗區遮蔽環；絕緣環與三道 O 環；晶圓與吸盤在靶下方。
//   外形是「平面磁控陰極」通例（示意，非特定廠牌實機尺寸）。本集不重畫整台集群機台（應材集已講過）。
// 站點（x 軸往右）：精煉槽 x22、真空爐 x33、軋機 x45、立式車床 x57、接合壓合台 x69；換靶展示台 x−13。
import fs from "node:fs";
import path from "node:path";

const R2 = (x) => Math.round(x * 1000) / 1000;
const D2R = Math.PI / 180;
const pol = (aDeg, r) => [R2(r * Math.cos(aDeg * D2R)), R2(r * Math.sin(aDeg * D2R))]; // (x, z)
const palette = {
  floorC: "#C9D2DE", panel: "#F3F5F8", panel2: "#E2E8F0", seam: "#8E9BB0", band: "#24324C", steel: "#7D8CA6", steel2: "#A9B5C7", dark: "#3E4A60",
  glassC: "#BFD3F2", lampY: "#F2B632", lampG: "#2FBF71", lampR: "#E5484D", screen: "#5B8DEF", rubber: "#2B2F36", gold: "#C9A24A", knurl: "#5C6678", estop: "#D93A2B",
  tgtC: "#D2793F", tgtFaceC: "#F0A066", tgtDarkC: "#8C4A22", solderC: "#E8ECF2", backC: "#B9C2CF", ceramic: "#F1EEE6", copperC: "#C9794A", waterC: "#4DA3FF", waterD: "#2F7FE0",
  magBody: "#2B2F36", magN: "#E0472F", magS: "#2F7FE0", yokeC: "#8D97A8", plasmaC: "#9B7BFF", plasmaE: "#C9B8FF", ionC: "#7EC8FF", eleC: "#FFE08A", argonC: "#9FD8FF", hitC: "#FFB45A",
  filmC: "#C47A4E", scanC: "#4FA3FF", fieldC: "#5BE0C0", moltenC: "#FF8A2B", hotC: "#E5602B", pcbC: "#1F6B45", chipC: "#1C1F26", traceC: "#C9A24A", connC: "#2A2D33", elecT: "#7FD0C0", pipeB: "#3E7BD6", pipeR: "#D9534F",
  warnC: "#F2B632", plateDark: "#4A525F", cuBright: "#E39A64", chipFlake: "#C9794A", markA: "#E8613C",
};
const M = (kind, color, o = {}) => ({ kind, color, ...o });
const glowM = (c, op, ei = 1) => M("std", c, { emissive: c, ei, opacity: op, rough: 1, metal: 0 });
const materials = {
  floor: M("std", "floorC", { rough: 0.7, metal: 0.3, tex: "brushed", texScale: 3 }),
  panel: M("std", "panel", { rough: 0.55, metal: 0.05, env: 0.25 }), panel2: M("std", "panel2", { rough: 0.6, metal: 0.05, env: 0.2 }),
  seam: M("std", "seam", { rough: 0.6, metal: 0.3 }), band: M("std", "band", { rough: 0.4, metal: 0.3, env: 0.4 }),
  steel: M("std", "steel", { rough: 0.35, metal: 0.85, env: 0.5 }), steel2: M("std", "steel2", { rough: 0.3, metal: 0.8, env: 0.6, tex: "brushed", texScale: 2 }),
  dark: M("std", "dark", { rough: 0.5, metal: 0.4, env: 0.3 }), rubber: M("std", "rubber", { rough: 0.9, metal: 0 }), gold: M("std", "gold", { rough: 0.3, metal: 0.9, env: 0.8 }),
  knurl: M("std", "knurl", { rough: 0.4, metal: 0.8, env: 0.5 }),
  window: M("phys", "glassC", { rough: 0.05, metal: 0, clearcoat: 1, opacity: 0.22, env: 0.6 }), glassDoor: M("phys", "glassC", { rough: 0.05, metal: 0, clearcoat: 1, opacity: 0.3, env: 0.6 }),
  lampY: M("std", "lampY", { emissive: "lampY", ei: 0.4, rough: 0.4, metal: 0 }), lampG: M("std", "lampG", { emissive: "lampG", ei: 0.35, rough: 0.4, metal: 0 }),
  lampR: M("std", "lampR", { emissive: "lampR", ei: 0.25, rough: 0.4, metal: 0 }), estop: M("std", "estop", { rough: 0.4, metal: 0, emissive: "estop", ei: 0.15 }),
  screen: M("std", "screen", { emissive: "screen", ei: 0.5, rough: 0.3, metal: 0 }),
  tgt: M("std", "tgtC", { rough: 0.3, metal: 0.92, env: 0.7, tex: "brushed", texScale: 1.6 }), tgtFace: M("std", "tgtFaceC", { rough: 0.08, metal: 0.95, env: 1.0 }), tgtDark: M("std", "tgtDarkC", { rough: 0.7, metal: 0.5, env: 0.3 }),
  solder: M("std", "solderC", { rough: 0.18, metal: 0.95, env: 0.9 }), back: M("std", "backC", { rough: 0.35, metal: 0.85, env: 0.6, tex: "brushed", texScale: 2.4 }),
  ceramic: M("std", "ceramic", { rough: 0.6, metal: 0, env: 0.3 }), copper: M("std", "copperC", { rough: 0.3, metal: 0.95, env: 0.7 }),
  water: M("phys", "waterC", { rough: 0.05, metal: 0, clearcoat: 1, opacity: 0.38, env: 0.5 }), pipeB: M("std", "pipeB", { rough: 0.35, metal: 0.6, env: 0.4 }), pipeR: M("std", "pipeR", { rough: 0.35, metal: 0.6, env: 0.4 }),
  magBody: M("std", "magBody", { rough: 0.45, metal: 0.5, env: 0.4 }), magN: M("std", "magN", { rough: 0.5, metal: 0.2, emissive: "magN", ei: 0.25 }), magS: M("std", "magS", { rough: 0.5, metal: 0.2, emissive: "magS", ei: 0.25 }), yoke: M("std", "yokeC", { rough: 0.35, metal: 0.85, env: 0.5, tex: "brushed", texScale: 2 }),
  plasma: glowM("plasmaC", 0.5, 1.2), plasmaIn: glowM("plasmaE", 0.75, 1.3), shieldM: M("std", "seam", { rough: 0.85, metal: 0.45, env: 0.3 }), ion: glowM("ionC", 0.95), ele: glowM("eleC", 0.95), argon: glowM("argonC", 0.7), hit: glowM("hitC", 0.9), field: glowM("fieldC", 0.8),
  atom: glowM("tgtFaceC", 0.95), film: M("std", "filmC", { rough: 0.3, metal: 0.85, env: 0.8 }), warn: glowM("warnC", 0.9, 0.9),
  molten: M("std", "moltenC", { emissive: "moltenC", ei: 1, rough: 0.6, metal: 0.2 }), hot: M("std", "hotC", { emissive: "hotC", ei: 0.55, rough: 0.5, metal: 0.4 }), heatRing: glowM("hotC", 0.85, 1),
  electrolyte: M("phys", "elecT", { rough: 0.05, metal: 0, clearcoat: 1, opacity: 0.4, env: 0.5 }), plateDark: M("std", "plateDark", { rough: 0.55, metal: 0.5, env: 0.4 }),
  pcb: M("std", "pcbC", { rough: 0.5, metal: 0.1 }), chip: M("std", "chipC", { rough: 0.35, metal: 0.2, env: 0.4 }), trace: M("std", "traceC", { rough: 0.3, metal: 0.9, env: 0.6 }), conn: M("std", "connC", { rough: 0.5, metal: 0.2 }),
  cuBright: M("std", "cuBright", { rough: 0.25, metal: 0.95, env: 0.8 }), flake: glowM("chipFlake", 0.95, 0.4), mist: glowM("argonC", 0.55, 0.6), cuIon: glowM("cuBright", 0.9, 0.7),
  t_jx: { kind: "unlit", color: "#FFFFFF", img: "tex/brand/sign-jx.png" }, t_sol: { kind: "unlit", color: "#FFFFFF", img: "tex/brand/sign-solstice.png" }, t_solar: { kind: "unlit", color: "#FFFFFF", img: "tex/brand/sign-solar.png" },
  t_jp: { kind: "unlit", color: "#FFFFFF", img: "tex/brand/flag-JP.png" }, t_us: { kind: "unlit", color: "#FFFFFF", img: "tex/brand/flag-US.png" }, t_tw: { kind: "unlit", color: "#FFFFFF", img: "tex/brand/flag-TW.png" },
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
const RING = (n, r, a0 = 0) => Array.from({ length: n }, (_, i) => { const [x, z] = pol(a0 + (i * 360) / n, r); return [x, 0, z]; });
const SPH = (id, layer, r, x, y, z, mat, o = {}) => P({ id, layer, shape: "sphere", size: [r], pos: [x, y, z], mat, ...o });
const grid = (x0, x1, nx, y0, y1, ny, z) => { const o = []; for (let i = 0; i < nx; i++) for (let j = 0; j < ny; j++) o.push([R2(x0 + ((x1 - x0) * i) / Math.max(1, nx - 1)), R2(y0 + ((y1 - y0) * j) / Math.max(1, ny - 1)), z]); return o; };

// ═════ 共用尺寸 ═════
const FY = -1.4;                 // 地板頂面
const WY = 1.5, WR = 1.5;        // 晶圓頂面高、半徑
const RT = 1.2;                  // 磁場跑道（電漿環、侵蝕溝）半徑
const TGT_R = 1.9, TGT_Y0 = 3.2, TGT_Y1 = 3.8;   // 靶材圓盤：濺射面朝下（y 3.2），背面接焊層（y 3.8）

// ═════ 地板 ═════
LAY("floor", [140, 2, 45, FY], true);
P({ id: "floor", layer: "floor", shape: "slab", size: [140, 0.5, 44], r: 0.2, pos: [45, R2(FY - 0.25), 0], mat: "floor" });
P({ id: "floorSeam", layer: "floor", shape: "slab", size: [140, 0.04, 0.1], pos: [45, R2(FY + 0.01), 0], at: Array.from({ length: 7 }, (_, i) => [0, 0, -18 + i * 6]), mat: "seam" });

// ═════ 製程腔（靜態）：玻璃筒壁＋頂法蘭＋底座＋支腳 ═════
LAY("chamber", [9, 6, 0, 1.2]); LAY("gas", [3, 3, -4.4, 2.4]); LAY("gasEq", [4, 6, -6.8, 2.5]); LAY("pump", [5, 4, 6.5, 0]);
VT("chWall", "chamber", 3.8, 3.65, -0.8, 3.5, "window");
VT("chTopFlange", "chamber", 4.1, 2.95, 3.5, 3.7, "steel2");
VT("chBotFlange", "chamber", 4.1, 3.4, -1.0, -0.8, "steel2");
VC("chBase", "chamber", 4.2, -1.1, -0.8, "band");
P({ id: "chFlangeBolt", layer: "chamber", shape: "cyl", size: [0.09, 0.1], rot: V, pos: [0, 3.76, 0], at: RING(20, 3.55), mat: "steel" });
P({ id: "chFlangeWasher", layer: "chamber", shape: "tube", size: [0.16, 0.09, 0.03], rot: V, pos: [0, 3.72, 0], at: RING(20, 3.55), mat: "dark" });
P({ id: "chBotBolt", layer: "chamber", shape: "cyl", size: [0.09, 0.1], rot: V, pos: [0, -0.74, 0], at: RING(20, 3.7), mat: "steel" });
P({ id: "chLeg", layer: "chamber", shape: "box", size: [0.7, R2(-1.1 - FY), 0.7], pos: [0, R2((-1.1 + FY) / 2), 0], at: [[-3.1, 0, -3.1], [3.1, 0, -3.1], [-3.1, 0, 3.1], [3.1, 0, 3.1]], mat: "band" });
P({ id: "chLegFoot", layer: "chamber", shape: "slab", size: [1.1, 0.12, 1.1], r: 0.04, pos: [0, R2(FY + 0.06), 0], at: [[-3.1, 0, -3.1], [3.1, 0, -3.1], [-3.1, 0, 3.1], [3.1, 0, 3.1]], mat: "dark" });
BOX("chBrace", "chamber", -3.2, 3.2, -1.2, -1.1, -0.15, 0.15, "dark", { at: [[0, 0, -3.1], [0, 0, 3.1]] });
// 觀察窗（正面）：窗框、四顆窗螺栓、把手
P({ id: "chViewFrame", layer: "chamber", shape: "tube", size: [0.85, 0.62, 0.14], pos: [0, 1.3, 3.84], mat: "steel2" });
P({ id: "chViewBolt", layer: "chamber", shape: "cyl", size: [0.05, 0.06], pos: [0, 1.3, 3.93], at: RING(8, 0.76).map(([x, , z]) => [x, z, 0]), mat: "steel" });
// 吸盤＋晶圓（在靶下方，靶面朝下對著晶圓）
LAY("chuck", [4, 2.2, 0, 0.6]); LAY("wf", [3.2, 0.2, 0, WY - 0.03]);
VC("chuckStem", "chuck", 0.55, -0.8, 0.14, "steel2");
VC("chuckBody", "chuck", 1.78, 0.14, 1.38, "steel");
VT("chuckRim", "chuck", 1.78, 1.55, 1.38, 1.44, "steel2");
P({ id: "chuckBolt", layer: "chuck", shape: "cyl", size: [0.07, 0.05], rot: V, pos: [0, 1.42, 0], at: RING(8, 1.67), mat: "steel" });
P({ id: "chuckLiftPin", layer: "chuck", shape: "cyl", size: [0.05, 0.12], rot: V, pos: [0, 1.46, 0], at: RING(3, 1.2, 90), mat: "gold" });
VT("chuckOuter", "chuck", 1.84, 1.76, 1.2, 1.4, "dark");
VT("chuckSeal", "chuck", 0.8, 0.64, 0.5, 0.6, "rubber");
HXC("chuckCable", "chuck", 0.07, 0.4, 1.8, 0.0, 0.0, "conn", { rot: [0, 90, 0] });
HXC("chuckHeatPort", "chuck", 0.14, 0.4, 0.7, 0.4, 0.3, "trace", { rot: [0, 90, 0] });
VC("wafer", "wf", WR, 1.44, WY, "steel2");
BOX("wfNotch", "wf", -0.12, 0.12, 1.45, 1.5, 1.42, 1.55, "dark");
VT("wfEdge", "wf", WR + 0.01, WR - 0.04, 1.47, 1.5, "band");
// 沉積膜：島 → 連續膜 → 變厚（三層，念到「薄膜」時淡入）
const ISL = RING(8, 0.3).concat(RING(14, 0.62, 7)).concat(RING(20, 0.95, 4)).concat(RING(24, 1.25, 9)).concat([[0, 0, 0]]);
LAY("film1", [3, 0.1, 0, WY]); LAY("film2", [3, 0.1, 0, WY]); LAY("film3", [3, 0.1, 0, WY]);
P({ id: "filmIsl", layer: "film1", shape: "cyl", size: [0.065, 0.02], rot: V, pos: [0, R2(WY + 0.01), 0], at: ISL, mat: "film" });
VC("filmThin", "film2", WR - 0.03, WY, WY + 0.014, "film");
VC("filmThick", "film3", WR - 0.03, WY + 0.014, WY + 0.034, "cuBright");

// ═════ 暗區遮蔽環（shield）：靶外緣一圈接地金屬環，內壁噴砂 ═════
LAY("shield", [6, 1.2, 0, 3.2]);
VT("shdRing", "shield", 2.85, 2.0, 3.1, 3.7, "shieldM");
P({ id: "shdGroove", layer: "shield", shape: "tube", size: [2.0, 1.96, 0.04], rot: V, pos: [0, 3.16, 0], at: Array.from({ length: 8 }, (_, i) => [0, i * 0.07, 0]), mat: "seam" });
P({ id: "shdBolt", layer: "shield", shape: "cyl", size: [0.09, 0.14], rot: V, pos: [0, 3.77, 0], at: RING(6, 2.45, 15), mat: "steel" });
VT("shdLip", "shield", 2.1, 1.98, 3.03, 3.1, "steel2");
VT("shdSkirt", "shield", 2.07, 2.0, 2.0, 3.03, "window");
VT("shdGap", "shield", 2.0, 1.9, 3.1, 3.7, "rubber");
P({ id: "shdSide", layer: "shield", shape: "sphere", size: [0.09], pos: [0, 3.4, 0], at: RING(6, 2.88, 0), mat: "steel" });
P({ id: "shdSideB", layer: "shield", shape: "sphere", size: [0.09], pos: [0, 3.65, 0], at: RING(6, 2.86, 30), mat: "steel" });
P({ id: "shdEar", layer: "shield", shape: "box", size: [0.5, 0.12, 0.3], pos: [0, 3.55, 0], at: [[2.6, 0, 0], [-2.6, 0, 0]], mat: "dark" });
// ═════ 絕緣環與 O 環 ═════
LAY("ins", [7, 0.5, 0, 3.95]); LAY("oring3", [7, 0.1, 0, 3.7]); LAY("oring2", [7, 0.1, 0, 4.2]); LAY("oring1", [7, 0.1, 0, 6.1]);
VT("insRing", "ins", 3.55, 2.5, 3.7, 4.2, "ceramic");
P({ id: "insGroove", layer: "ins", shape: "tube", size: [3.57, 3.5, 0.04], rot: V, pos: [0, 3.78, 0], at: [[0, 0, 0], [0, 0.18, 0], [0, 0.36, 0]], mat: "seam" });
P({ id: "insBolt", layer: "ins", shape: "cyl", size: [0.1, 0.06], rot: V, pos: [0, 4.23, 0], at: RING(12, 3.3, 15), mat: "steel" });
P({ id: "insBoltHole", layer: "ins", shape: "tube", size: [0.19, 0.11, 0.03], rot: V, pos: [0, 4.2, 0], at: RING(12, 3.3, 15), mat: "dark" });
VT("or3", "oring3", 3.2, 3.1, 3.7, 3.78, "rubber"); VT("or2", "oring2", 3.0, 2.9, 4.2, 4.28, "rubber"); VT("or1", "oring1", 3.2, 3.1, 6.1, 6.18, "rubber");

// ═════ 靶材本體（濺射面朝下）、焊層、背板 ═════
LAY("tgt", [4.2, 0.7, 0, 3.5]); LAY("solder", [4.2, 0.1, 0, 3.83]); LAY("back", [6.4, 0.9, 0, 4.2]);
VC("tgtBody", "tgt", TGT_R, TGT_Y0 + 0.03, TGT_Y1, "tgt");
VC("tgtFace", "tgt", TGT_R - 0.07, TGT_Y0, TGT_Y0 + 0.03, "tgtFace");
VT("tgtNoPlate", "tgt", TGT_R, TGT_R - 0.22, TGT_Y0 - 0.005, TGT_Y0 + 0.03, "tgtDark");
VT("tgtChamfer", "tgt", TGT_R + 0.03, TGT_R - 0.05, TGT_Y0 + 0.03, TGT_Y0 + 0.1, "cuBright");
VT("tgtStep", "tgt", TGT_R + 0.08, TGT_R - 0.02, TGT_Y1 - 0.12, TGT_Y1, "tgt");
P({ id: "tgtMark", layer: "tgt", shape: "box", size: [0.28, 0.1, 0.03], pos: [0, 3.5, 1.97], at: [[0.3, 0.1, 0], [0.7, 0.1, -0.05], [1.0, 0.1, -0.15], [0.6, -0.12, -0.05]], mat: "dark" });
VC("solLayer", "solder", TGT_R - 0.02, TGT_Y1, TGT_Y1 + 0.05, "solder");
VT("solBead", "solder", TGT_R + 0.05, TGT_R - 0.06, TGT_Y1 - 0.01, TGT_Y1 + 0.06, "solder");
P({ id: "solDrop", layer: "solder", shape: "sphere", size: [0.13], scale: [1, 0.6, 1], pos: [0, 3.83, 0], at: RING(12, 1.97, 10), mat: "solder" });
VC("backBody", "back", 2.2, TGT_Y1 + 0.05, 4.46, "back");
VT("backFlange", "back", 3.1, 2.2, 4.2, 4.46, "back");
VT("backChamfer", "back", 2.24, 2.12, 3.86, 3.96, "steel2");
P({ id: "backBolt", layer: "back", shape: "cyl", size: [0.1, 0.1], rot: V, pos: [0, 4.51, 0], at: RING(12, 2.75, 15), mat: "steel" });
P({ id: "backBoltHole", layer: "back", shape: "tube", size: [0.19, 0.11, 0.03], rot: V, pos: [0, 4.46, 0], at: RING(12, 2.75, 15), mat: "dark" });
P({ id: "backGroove", layer: "back", shape: "tube", size: [1.95, 1.85, 0.03], rot: V, pos: [0, 4.465, 0], at: [[0, 0, 0]], mat: "dark" });
P({ id: "backGroove2", layer: "back", shape: "tube", size: [1.45, 1.35, 0.03], rot: V, pos: [0, 4.465, 0], mat: "dark" });
P({ id: "backGroove3", layer: "back", shape: "tube", size: [0.95, 0.85, 0.03], rot: V, pos: [0, 4.465, 0], mat: "dark" });
HXC("backPort", "back", 0.17, 3.1, 3.5, 4.33, 0, "copper", { at: [[0, 0, 0.9], [0, 0, -0.9]] });
P({ id: "backKey", layer: "back", shape: "box", size: [0.3, 0.2, 0.3], pos: [0, 4.35, 0], at: [[0, 0, 3.1], [0, 0, -3.1]], mat: "steel2" });

// ═════ 冷卻水腔與水路（水套筒壁玻璃、水體半透明、磁鐵泡在水裡） ═════
LAY("water", [7.6, 2, 0, 5.3]); LAY("pipes", [9, 3, 0, 5]);
VT("jkWall", "water", 3.1, 2.95, 4.46, 6.1, "window");
VC("jkWater", "water", 2.95, 4.46, 5.9, "water");
VT("jkTopFlange", "water", 3.45, 2.9, 6.0, 6.1, "steel2");
VT("jkBotFlange", "water", 3.45, 3.0, 4.46, 4.56, "steel2");
P({ id: "jkBolt", layer: "water", shape: "cyl", size: [0.09, 0.08], rot: V, pos: [0, 6.14, 0], at: RING(14, 3.2, 8), mat: "steel" });
P({ id: "jkBotBolt", layer: "water", shape: "cyl", size: [0.09, 0.08], rot: V, pos: [0, 4.52, 0], at: RING(14, 3.2, 8), mat: "steel" });
P({ id: "jkRib", layer: "water", shape: "box", size: [0.08, 1.5, 0.2], pos: [0, 5.3, 0], at: RING(6, 3.07, 0).map(([x, , z]) => [x, 0, z]), mat: "steel2", rot: [0, 0, 0] });
// 進水管（右）與出水管（左）：不鏽鋼＋銅管、彎頭、管夾、快速接頭、閥門手輪
for (const [sg, id, mat] of [[1, "pIn", "pipeB"], [-1, "pOut", "pipeR"]]) {
  HXC(`${id}A`, "pipes", 0.14, sg * 3.1, sg * 4.4, 4.9, 0, "copper");
  SPH(`${id}E1`, "pipes", 0.21, sg * 4.4, 4.9, 0, "copper");
  P({ id: `${id}B`, layer: "pipes", shape: "cyl", size: [0.14, 1.9], rot: V, pos: [sg * 4.4, 5.85, 0], mat: "copper" });
  SPH(`${id}E2`, "pipes", 0.21, sg * 4.4, 6.85, 0, "copper");
  HXC(`${id}C`, "pipes", 0.14, sg * 4.4, sg * 5.5, 6.85, 0, "copper");
  P({ id: `${id}Clamp`, layer: "pipes", shape: "tube", size: [0.23, 0.15, 0.1], rot: V, pos: [sg * 4.4, 5.5, 0], at: [[0, 0, 0], [0, 0.8, 0]], mat: "steel" });
  P({ id: `${id}Clamp2`, layer: "pipes", shape: "tube", size: [0.23, 0.15, 0.1], rot: HX, pos: [sg * 3.75, 4.9, 0], mat: "steel" });
  P({ id: `${id}Qc`, layer: "pipes", shape: "cyl", size: [0.2, 0.34], rot: HX, pos: [sg * 5.3, 6.85, 0], mat: mat });
  P({ id: `${id}QcRing`, layer: "pipes", shape: "tube", size: [0.27, 0.19, 0.07], rot: HX, pos: [sg * 5.05, 6.85, 0], mat: "knurl" });
  P({ id: `${id}Valve`, layer: "pipes", shape: "tube", size: [0.34, 0.26, 0.07], pos: [sg * 4.4, 5.2, 0.28], mat: mat });
  P({ id: `${id}ValveStem`, layer: "pipes", shape: "cyl", size: [0.05, 0.3], pos: [sg * 4.4, 5.2, 0.14], mat: "steel" });
}
// ═════ 磁鐵組（磁控管）：磁軛板＋外環與中心相反極性＋偏心軸＋軸承座與皮帶輪 ═════
LAY("mag", [5, 2, 0, 5.8]);
VC("yoke", "mag", 2.3, 5.15, 5.27, "yoke");
VT("yokeRim", "mag", 2.3, 2.2, 4.98, 5.15, "yoke");
P({ id: "magOuter", layer: "mag", shape: "cyl", size: [0.17, 0.37], rot: V, pos: [0, 4.965, 0], at: RING(18, 1.85), mat: "magBody" });
P({ id: "magOuterCap", layer: "mag", shape: "cyl", size: [0.17, 0.04], rot: V, pos: [0, 4.78, 0], at: RING(18, 1.85), mat: "magN" });
VC("magCenter", "mag", 0.5, 4.78, 5.15, "magBody");
VC("magCenterCap", "mag", 0.5, 4.76, 4.8, "magS");
P({ id: "magInner", layer: "mag", shape: "cyl", size: [0.13, 0.3], rot: V, pos: [0, 4.995, 0], at: RING(10, 0.82, 18), mat: "magBody" });
P({ id: "magScrew", layer: "mag", shape: "cyl", size: [0.07, 0.05], rot: V, pos: [0, 5.3, 0], at: RING(8, 2.05, 22), mat: "steel" });
P({ id: "magMark", layer: "mag", shape: "box", size: [0.5, 0.04, 0.08], pos: [0, 5.29, 0], at: [[1.6, 0, 0.25], [-1.6, 0, -0.25]], mat: "lampY" });
P({ id: "magTopN", layer: "mag", shape: "cyl", size: [0.17, 0.03], rot: V, pos: [0, 5.285, 0], at: RING(18, 1.85), mat: "magN" });
VC("magTopS", "mag", 0.5, 5.27, 5.3, "magS");
VC("magShaft", "mag", 0.14, 5.27, 6.9, "steel2");
VT("magBearing", "mag", 0.42, 0.14, 5.35, 5.6, "dark");
VC("magPulley", "mag", 0.36, 6.95, 7.2, "steel2");
VT("magPulleyRim", "mag", 0.42, 0.34, 6.93, 6.97, "steel");
VT("magPulleyRim2", "mag", 0.42, 0.34, 7.18, 7.22, "steel");
// ═════ 上蓋（含馬達驅動）與高壓供電接頭 ═════
LAY("lid", [8, 2.6, 0, 7.2]); LAY("hv", [3, 2, -1.4, 7.2]);
VC("lidPlate", "lid", 3.5, 6.1, 6.6, "steel2");
VT("lidGroove", "lid", 3.25, 3.05, 6.09, 6.13, "dark");
VT("lidTop", "lid", 3.5, 3.4, 6.6, 6.66, "steel");
P({ id: "lidBolt", layer: "lid", shape: "cyl", size: [0.1, 0.09], rot: V, pos: [0, 6.66, 0], at: RING(14, 3.2, 8), mat: "steel" });
P({ id: "lidWasher", layer: "lid", shape: "tube", size: [0.18, 0.1, 0.03], rot: V, pos: [0, 6.62, 0], at: RING(14, 3.2, 8), mat: "dark" });
P({ id: "lidLug", layer: "lid", shape: "tube", size: [0.3, 0.19, 0.08], pos: [0, 6.9, 0], at: [[2.9, 0, 0], [-2.9, 0, 0]], mat: "steel" });
P({ id: "lidLugBase", layer: "lid", shape: "box", size: [0.3, 0.3, 0.3], pos: [0, 6.75, 0], at: [[2.9, 0, 0], [-2.9, 0, 0]], mat: "steel" });
HXC("lidWin", "lid", 0.34, 3.5, 3.78, 6.35, 1.5, "window");
P({ id: "lidWinFrame", layer: "lid", shape: "tube", size: [0.46, 0.32, 0.1], rot: HX, pos: [3.55, 6.35, 1.5], mat: "dark" });
VT("lidSeal", "lid", 0.5, 0.18, 6.6, 6.78, "rubber");
// 馬達驅動：齒輪箱、馬達（鰭片）、皮帶輪、皮帶、護罩、水密線纜
BOX("drvBracket", "lid", 0.6, 2.4, 6.66, 6.86, -0.8, 0.8, "dark");
BOX("drvGear", "lid", 1.0, 2.1, 6.86, 7.4, -0.55, 0.55, "band");
P({ id: "drvGearBolt", layer: "lid", shape: "cyl", size: [0.05, 0.04], rot: V, pos: [1.55, 7.42, 0], at: RING(4, 0.4, 45), mat: "steel" });
VC("drvMotor", "lid", 0.5, 7.4, 8.5, "steel", { x: 1.55 });
P({ id: "drvFin", layer: "lid", shape: "tube", size: [0.56, 0.48, 0.07], rot: V, pos: [1.55, 7.6, 0], at: Array.from({ length: 7 }, (_, i) => [0, i * 0.16, 0]), mat: "steel2" });
VC("drvCap", "lid", 0.38, 8.5, 8.7, "dark", { x: 1.55 });
VC("drvPulley", "lid", 0.3, 6.95, 7.2, "steel2", { x: 1.55 });
BOX("drvBeltA", "lid", 0.0, 1.55, 7.02, 7.12, 0.3, 0.34, "rubber"); BOX("drvBeltB", "lid", 0.0, 1.55, 7.02, 7.12, -0.34, -0.3, "rubber");
BOX("drvGuard", "lid", -0.55, 2.0, 6.9, 7.3, -0.45, 0.45, "glassDoor");
HXC("drvCable", "lid", 0.07, 2.05, 3.2, 8.3, 0, "conn"); SPH("drvCableE", "lid", 0.1, 3.2, 8.3, 0, "conn");
P({ id: "drvCableDown", layer: "lid", shape: "cyl", size: [0.07, 1.6], rot: V, pos: [3.2, 7.5, 0], mat: "conn" });
// 高壓同軸接頭：陶瓷底座、金色接頭、橡膠護套、線纜彎管、接地編織帶、紅色警示銘板
VC("hvBase", "hv", 0.6, 6.66, 7.3, "ceramic", { x: -1.4 });
P({ id: "hvRib", layer: "hv", shape: "tube", size: [0.66, 0.52, 0.06], rot: V, pos: [-1.4, 6.8, 0], at: [[0, 0, 0], [0, 0.16, 0], [0, 0.32, 0], [0, 0.48, 0]], mat: "ceramic" });
VC("hvShell", "hv", 0.4, 7.3, 7.9, "gold", { x: -1.4 });
P({ id: "hvKnurl", layer: "hv", shape: "tube", size: [0.44, 0.36, 0.05], rot: V, pos: [-1.4, 7.4, 0], at: [[0, 0, 0], [0, 0.18, 0], [0, 0.36, 0]], mat: "knurl" });
P({ id: "hvBoot", layer: "hv", shape: "cone", size: [0.3, 0.46, 0.5], rot: V, pos: [-1.4, 8.15, 0], mat: "rubber" });
P({ id: "hvCable", layer: "hv", shape: "cyl", size: [0.16, 1.3], rot: V, pos: [-1.4, 8.8, 0], mat: "rubber" });
SPH("hvElbow", "hv", 0.2, -1.4, 9.5, 0, "rubber");
HXC("hvCableOut", "hv", 0.16, -1.4, -3.4, 9.5, 0, "rubber");
BOX("hvBraid", "hv", -1.46, -1.34, 6.68, 7.3, 0.62, 0.7, "steel2", { at: [[0, 0, 0], [0, 0, -1.32]] });
BOX("hvWarn", "hv", -1.7, -1.1, 6.7, 6.9, 0.58, 0.62, "estop");
BOX("hvWarnStripe", "hv", -1.66, -1.5, 6.72, 6.88, 0.62, 0.64, "panel", { at: [[0, 0, 0], [0.2, 0, 0], [0.4, 0, 0]] });
// ═════ 製程氣體入口（氬）與壓力計、抽氣口與真空泵 ═════
HXC("gasPipe", "gas", 0.14, -3.7, -5.5, 2.0, 0, "steel2");
SPH("gasElbow", "gas", 0.2, -5.5, 2.0, 0, "steel2");
P({ id: "gasUp", layer: "gas", shape: "cyl", size: [0.14, 1.7], rot: V, pos: [-5.5, 2.85, 0], mat: "steel2" });
P({ id: "gasFlange", layer: "gas", shape: "tube", size: [0.34, 0.2, 0.1], rot: HX, pos: [-3.82, 2.0, 0], mat: "steel" });
P({ id: "gasBolt", layer: "gas", shape: "cyl", size: [0.04, 0.05], rot: HX, pos: [-3.78, 2.0, 0], at: [[0, 0.27, 0], [0, -0.27, 0], [0, 0, 0.27], [0, 0, -0.27]], mat: "steel" });
BOX("mfcBox", "gasEq", -6.1, -4.9, 3.7, 4.6, -0.4, 0.4, "band");
BOX("mfcDisplay", "gasEq", -5.85, -5.15, 4.2, 4.45, 0.4, 0.44, "screen");
P({ id: "mfcLed", layer: "gasEq", shape: "cyl", size: [0.05, 0.04], pos: [-5.35, 3.88, 0.42], at: [[0, 0, 0], [0.2, 0, 0], [0.4, 0, 0]], mat: "lampG" });
P({ id: "mfcConn", layer: "gasEq", shape: "cyl", size: [0.1, 0.3], rot: V, pos: [-5.5, 4.75, 0], mat: "trace" });
P({ id: "gasCable", layer: "gasEq", shape: "cyl", size: [0.05, 1.2], rot: V, pos: [-5.8, 5.35, 0], mat: "conn" });
P({ id: "gasClamp", layer: "gas", shape: "tube", size: [0.22, 0.15, 0.08], rot: V, pos: [-5.5, 3.1, 0], at: [[0, 0, 0], [0, 0.7, 0]], mat: "steel" });
P({ id: "gasTank", layer: "gasEq", shape: "cyl", size: [0.45, 3.4], rot: V, pos: [-7.7, 0.3, 0], mat: "panel2" });
P({ id: "gasTankBand", layer: "gasEq", shape: "tube", size: [0.48, 0.44, 0.12], rot: V, pos: [-7.7, 0.3, 0], at: [[0, 0.5, 0], [0, -0.7, 0]], mat: "estop" });
SPH("gasTankCap", "gasEq", 0.45, -7.7, 2.0, 0, "panel2", { scale: [1, 0.6, 1] });
HXC("gasHose", "gasEq", 0.07, -7.7, -5.6, 2.45, 0, "conn");
P({ id: "gaugeBody", layer: "gas", shape: "cyl", size: [0.45, 0.3], pos: [-3.2, 1.0, 3.9], mat: "steel2" });
P({ id: "gaugeDial", layer: "gas", shape: "cyl", size: [0.36, 0.04], pos: [-3.2, 1.0, 4.07], mat: "panel" });
P({ id: "gaugeNeedle", layer: "gas", shape: "box", size: [0.04, 0.3, 0.02], rot: [0, 0, 35], pos: [-3.2, 1.0, 4.1], mat: "estop" });
P({ id: "gaugeStem", layer: "gas", shape: "cyl", size: [0.1, 0.5], pos: [-3.2, 1.0, 3.7], mat: "steel" });
HXC("pumpDuct", "pump", 0.7, 3.8, 5.7, 0.6, 0, "steel2");
P({ id: "pumpFlange", layer: "pump", shape: "tube", size: [1.05, 0.62, 0.14], rot: HX, pos: [5.7, 0.6, 0], mat: "steel" });
P({ id: "pumpFlangeBolt", layer: "pump", shape: "cyl", size: [0.07, 0.1], rot: HX, pos: [5.78, 0.6, 0], at: RING(12, 0.85).map(([x, , z]) => [0, z, x]), mat: "steel" });
BOX("pumpValve", "pump", 5.8, 7.0, -0.7, 1.9, -0.8, 0.8, "band");
P({ id: "pumpValveWheel", layer: "pump", shape: "tube", size: [0.5, 0.4, 0.08], pos: [6.4, 0.6, 0.9], mat: "estop" });
P({ id: "pumpValveStem", layer: "pump", shape: "cyl", size: [0.07, 0.15], pos: [6.4, 0.6, 0.82], mat: "steel" });
VC("pumpBody", "pump", 1.1, FY, -0.6, "dark", { x: 7.8 });
P({ id: "pumpDuct2", layer: "pump", shape: "cyl", size: [0.45, 1.6], rot: V, pos: [7.8, 0.2, 0], mat: "steel2" });
P({ id: "pumpFin", layer: "pump", shape: "tube", size: [1.22, 1.08, 0.07], rot: V, pos: [7.8, -1.2, 0], at: Array.from({ length: 6 }, (_, i) => [0, i * 0.17, 0]), mat: "steel2" });
BOX("pumpMotor", "pump", 8.6, 10.2, FY, -0.4, -0.7, 0.7, "steel");
P({ id: "pumpLed", layer: "pump", shape: "cyl", size: [0.05, 0.04], pos: [9.0, -0.7, 0.72], at: [[0, 0, 0], [0.25, 0, 0]], mat: "lampG" });
P({ id: "pumpHose", layer: "pump", shape: "cyl", size: [0.1, 1.9], rot: HX, pos: [9.4, 0.1, 0], mat: "conn" });

// ═════ 磁控濺鍍的電漿與場（示意層）：電漿環、撞擊點、暗區 ═════
LAY("plasma", [4, 0.8, 0, 2.95]); LAY("hitL", [4, 0.4, 0, 3.15]);
VT("plasmaOut", "plasma", 1.8, 0.65, 2.72, 3.1, "plasma");
VT("plasmaMid", "plasma", 1.55, 0.9, 2.8, 3.08, "plasmaIn");
VT("plasmaCore", "plasma", RT + 0.1, RT - 0.1, 2.92, 3.05, "plasmaIn");
P({ id: "hitGlow", layer: "hitL", shape: "sphere", size: [0.085], scale: [1, 0.5, 1], pos: [0, 3.13, 0], at: RING(6, RT, 15), mat: "hit" });
// 磁場線（在靶面前方的半橢圓弧；4 個方位）：用 flow 的軌道線畫（見 actions.field0..3）

// ═════ 換靶展示台（x＝−20，靶面朝上，侵蝕溝分四階段淡入）＋新靶（從左邊送入） ═════
const DX = -20, SY = -0.5;
LAY("dspBase", [7, 1.1, DX, -0.9]); LAY("tgtDsp", [4.6, 0.8, DX, 0]);
for (const [lx, lz] of [[-2.7, -2.0], [2.7, -2.0], [-2.7, 2.0], [2.7, 2.0]]) P({ id: `dspLeg${lx}${lz}`, layer: "dspBase", shape: "box", size: [0.4, R2(SY - FY), 0.4], pos: [DX + lx, R2((SY + FY) / 2), lz], mat: "band" });
P({ id: "dspTop", layer: "dspBase", shape: "slab", size: [6.4, 0.14, 5.0], r: 0.05, pos: [DX, R2(SY - 0.07), 0], mat: "steel2" });
BOX("dspRail", "dspBase", DX - 3.2, DX + 3.2, SY - 0.2, SY - 0.14, -2.45, -2.35, "dark", { at: [[0, 0, 0], [0, 0, 4.8]] });
P({ id: "dspPin", layer: "dspBase", shape: "cyl", size: [0.08, 0.2], rot: V, pos: [DX, SY + 0.1, 0], at: RING(3, 2.6, 30), mat: "gold" });
P({ id: "dspPlate", layer: "dspBase", shape: "box", size: [0.9, 0.04, 0.5], pos: [DX, SY - 0.12, 2.2], mat: "panel" });
const assembly = (layer, cx, flat) => {
  VC(`${layer}Back`, layer, 2.2, SY, SY + 0.4, "back", { x: cx }); VT(`${layer}Flange`, layer, 2.55, 2.2, SY + 0.12, SY + 0.4, "back", { x: cx });
  P({ id: `${layer}Bolt`, layer, shape: "cyl", size: [0.08, 0.06], rot: V, pos: [cx, SY + 0.43, 0], at: RING(12, 2.38, 15), mat: "steel" });
  VC(`${layer}Sol`, layer, TGT_R + 0.02, SY + 0.4, SY + 0.46, "solder", { x: cx });
  if (flat) VC(`${layer}Tgt`, layer, TGT_R, SY + 0.46, SY + 1.06, "tgtFace", { x: cx });
};
const TB = SY + 0.46, TT = SY + 1.06;   // 靶底（接焊層）、靶面（未用過時）
assembly("tgtDsp", DX, false);
VC("dspBase0", "tgtDsp", TGT_R, TB, TB + 0.12, "tgt", { x: DX });
const stageD = [0, 0.2, 0.34, 0.46];
for (let s = 0; s < 4; s++) {
  const id = `tgtD${s}`; LAY(id, [4.2, 0.6, DX, TB + 0.3]);
  if (s === 0) { VC(`${id}Body`, id, TGT_R, TB + 0.12, TT, "tgtFace", { x: DX }); continue; }
  VC(`${id}Center`, id, 0.65, TB + 0.12, TT, "tgt", { x: DX }); VT(`${id}Outer`, id, TGT_R, 1.75, TB + 0.12, TT, "tgt", { x: DX });
  [0.725, 0.875, 1.025, 1.175, 1.325, 1.475, 1.625].forEach((rm, k) => {
    const prof = Math.max(0, 1 - Math.abs(rm - RT) / 0.55), top = R2(TT - stageD[s] * prof);
    VT(`${id}B${k}`, id, R2(rm + 0.075), R2(rm - 0.075), TB + 0.12, Math.max(TB + 0.14, top), prof > 0.4 ? "tgtDark" : "tgtFace", { x: DX });
  });
}
LAY("tgtWarn", [4, 0.2, DX, TB + 0.3]); VT("tgtWarnRing", "tgtWarn", 1.285, 1.115, TB + 0.12 + 0.0, TB + 0.17, "warn", { x: DX });
LAY("tgtNew", [6, 1.2, DX, 0.1]); assembly("tgtNew", DX, true);

// ═════ 展示架：三塊靶（銅、鈦、鉭）＋國旗＋名牌（s11，只在公司那一幕出現） ═════
LAY("rack", [11, 3, 0, 1.6]); LAY("rkJP", [3, 1, -3.8, 3.4]); LAY("rkUS", [3, 1, 0, 3.4]); LAY("rkTW", [3, 1, 3.8, 3.4]);
palette.tiC = "#AEB8C6"; palette.taC = "#7D8CA6";
materials.tgtTi = M("std", "tiC", { rough: 0.3, metal: 0.9, env: 0.7, tex: "brushed", texScale: 1.6 }); materials.tgtTa = M("std", "taC", { rough: 0.3, metal: 0.9, env: 0.7, tex: "brushed", texScale: 1.6 });
BOX("rkBase", "rack", -5.2, 5.2, -0.4, 0.0, -1.2, 1.2, "band"); BOX("rkTopPlate", "rack", -5.2, 5.2, 0.0, 0.08, -1.2, 1.2, "steel2");
[[-3.8, "tgt", "jx"], [0, "tgtTi", "sol"], [3.8, "tgtTa", "solar"]].forEach(([x, m, k], i) => {
  const lyr = ["rkJP", "rkUS", "rkTW"][i];
  BOX(`rkStand${i}`, "rack", x - 0.8, x + 0.8, 0.08, 0.22, -0.6, 0.6, "dark"); BOX(`rkPost${i}`, "rack", x - 0.12, x + 0.12, 0.22, 0.9, -0.1, 0.1, "steel");
  ZC(`rkDisc${i}`, "rack", 1.15, -0.15, 0.15, x, 2.05, m); ZC(`rkRim${i}`, "rack", 1.19, -0.1, -0.05, x, 2.05, "steel2");
  P({ id: `rkHole${i}`, layer: "rack", shape: "cyl", size: [0.07, 0.04], pos: [x, 2.05, 0.16], at: RING(6, 0.85).map(([a, , b]) => [a, b, 0]), mat: "dark" });
  P({ id: `rkSign${i}`, layer: lyr, shape: "plane", size: [2.6, 0.68], pos: [x, 0.5, 0.65], mat: `t_${k}`, uv01: true, shadow: false });
  BOX(`rkPole${i}`, lyr, x - 0.04, x + 0.04, 3.3, 4.4, -0.04, 0.04, "steel2"); P({ id: `rkFlag${i}`, layer: lyr, shape: "plane", size: [1.2, 0.8], pos: [x + 0.64, 3.95, 0.05], mat: `t_${["jp", "us", "tw"][i]}`, uv01: true, shadow: false });
});
// 三塊靶的廠牌小旗（只有名牌，不放商標圖案）

// ═════ 站 1：電解精煉槽（x＝22）：銅陰極（起始片）與陽極交錯、電流（銅離子）從陽極走向陰極，陰極變厚 ═════
const SX = { rf: 22, fn: 34, fg: 46, ml: 58, an: 71, lt: 83, bd: 95 };
LAY("rf", [8, 4, SX.rf, 0.3]); LAY("rfElyt", [6, 2, SX.rf, 0]); LAY("rfCath", [6, 2.4, SX.rf, 0.5]); LAY("rfCathThick", [6, 2.4, SX.rf, 0.5]); LAY("rfAnode", [6, 2.4, SX.rf, 0.5]);
{ const x0 = SX.rf;
  BOX("rfFloor", "rf", x0 - 3.3, x0 + 3.3, FY, FY + 0.3, -1.85, 1.85, "band");
  BOX("rfWallF", "rf", x0 - 3.3, x0 + 3.3, FY + 0.3, 1.4, 1.7, 1.85, "panel2"); BOX("rfWallB", "rf", x0 - 3.3, x0 + 3.3, FY + 0.3, 1.4, -1.85, -1.7, "panel2");
  BOX("rfWallL", "rf", x0 - 3.3, x0 - 3.15, FY + 0.3, 1.4, -1.7, 1.7, "panel2"); BOX("rfWallR", "rf", x0 + 3.15, x0 + 3.3, FY + 0.3, 1.4, -1.7, 1.7, "panel2");
  BOX("rfRim", "rf", x0 - 3.4, x0 + 3.4, 1.4, 1.5, 1.65, 1.9, "steel2", { at: [[0, 0, 0], [0, 0, -3.55]] }); BOX("rfRimEnd", "rf", x0 - 3.4, x0 - 3.1, 1.4, 1.5, -1.9, 1.9, "steel2", { at: [[0, 0, 0], [6.5, 0, 0]] });
  BOX("rfRib", "rf", x0 - 0.1, x0 + 0.1, FY + 0.3, 1.4, 1.85, 2.0, "dark", { at: [-2.8, -1.4, 0, 1.4, 2.8].map((d) => [d, 0, 0]) });
  BOX("rfElyte", "rfElyt", x0 - 3.1, x0 + 3.1, -1.0, 1.0, -1.65, 1.65, "electrolyte");
  const xs = Array.from({ length: 15 }, (_, i) => R2(-2.66 + i * 0.38));
  P({ id: "rfCathode", layer: "rfCath", shape: "box", size: [0.07, 2.2, 2.3], pos: [x0, 0.5, 0], at: xs.filter((_, i) => i % 2 === 0).map((d) => [d, 0, 0]), mat: "cuBright" });
  P({ id: "rfCathThick", layer: "rfCathThick", shape: "box", size: [0.2, 2.2, 2.34], pos: [x0, 0.5, 0], at: xs.filter((_, i) => i % 2 === 0).map((d) => [d, 0, 0]), mat: "cuBright" });
  P({ id: "rfAnodeP", layer: "rfAnode", shape: "box", size: [0.1, 2.2, 2.3], pos: [x0, 0.5, 0], at: xs.filter((_, i) => i % 2 === 1).map((d) => [d, 0, 0]), mat: "plateDark" });
  P({ id: "rfLug", layer: "rf", shape: "box", size: [0.07, 0.07, 3.0], pos: [x0, 1.62, 0], at: xs.map((d) => [d, 0, 0]), mat: "copper" });
  P({ id: "rfBus", layer: "rf", shape: "cyl", size: [0.1, 6.5], rot: HX, pos: [x0, 1.72, 0], at: [[0, 0, 1.5], [0, 0, -1.5]], mat: "copper" });
  BOX("rfBusIns", "rf", x0 - 3.3, x0 - 3.1, 1.5, 1.7, 1.4, 1.6, "ceramic", { at: [[0, 0, 0], [0, 0, -3.0], [6.4, 0, 0], [6.4, 0, -3.0]] });
  BOX("rfCab", "rf", x0 + 4.0, x0 + 5.8, FY, 2.2, -0.9, 0.9, "band"); BOX("rfCabDoor", "rf", x0 + 4.05, x0 + 5.75, FY + 0.1, 2.1, 0.9, 0.96, "panel2");
  P({ id: "rfCabLamp", layer: "rf", shape: "cyl", size: [0.07, 0.05], pos: [x0 + 4.4, 1.7, 1.0], at: [[0, 0, 0], [0.4, 0, 0], [0.8, 0, 0]], mat: "lampG" });
  P({ id: "rfCabDial", layer: "rf", shape: "cyl", size: [0.3, 0.05], pos: [x0 + 4.9, 0.5, 1.0], mat: "panel" }); P({ id: "rfCabNeedle", layer: "rf", shape: "box", size: [0.03, 0.22, 0.02], rot: [0, 0, 30], pos: [x0 + 4.9, 0.5, 1.04], mat: "estop" });
  BOX("rfCabVent", "rf", x0 + 4.3, x0 + 5.5, -0.9, -0.85, 0.96, 1.0, "dark", { at: Array.from({ length: 5 }, (_, i) => [0, i * 0.14, 0]) });
  HXC("rfCable", "rf", 0.2, x0 + 3.4, x0 + 4.0, 1.72, 0, "copper"); P({ id: "rfCableUp", layer: "rf", shape: "cyl", size: [0.2, 0.9], rot: V, pos: [x0 + 3.4, 1.3, 0], mat: "copper" });
  ZC("rfDrainPipe", "rf", 0.14, 1.85, 2.7, x0 - 2.5, FY + 0.6, "steel2"); P({ id: "rfValveW", layer: "rf", shape: "tube", size: [0.3, 0.22, 0.07], rot: V, pos: [x0 - 2.5, FY + 0.95, 2.3], mat: "estop" });
  P({ id: "rfLevel", layer: "rf", shape: "cyl", size: [0.07, 1.6], rot: V, pos: [x0 + 3.45, 0.3, 1.0], mat: "window" });
  // 銅離子：從陽極走向相鄰陰極（電解液裡的電流）
  [[-1.9, 0.0], [-0.4, 0.0], [1.1, 0.0]].forEach(([dx], i) => { actions[`rfIon${i}`] = { type: "flow", layer: "rfElyt", path: [[x0 + dx, 0.2, -0.9], [x0 + dx + 0.38, 0.2, -0.9]], n: 4, lanes: 5, laneDir: [0, 0, 1], laneGap: 0.45, size: 0.06, shape: "dot", rate: 0.9, color: "cuBright", track: false, jitter: 0.08, trail: 2, trailGap: 0.05, free: true }; });
}
// ═════ 站 2：真空爐（x＝33）：玻璃爐身、水冷銅容器、感應線圈、熔池發光、錠往下抽 ═════
LAY("fn", [6, 6, SX.fn, 1]); LAY("fnCoil", [3, 1, SX.fn, 1.7]); LAY("fnPool", [3, 0.2, SX.fn, 2.3]); LAY("fnIngot", [2, 2.4, SX.fn, 0.5]); LAY("fnHot", [2, 0.5, SX.fn, 1.05]);
{ const x0 = SX.fn;
  VC("fnBase", "fn", 2.2, FY, -0.7, "band", { x: x0 }); VT("fnBaseRing", "fn", 2.25, 2.1, -0.75, -0.7, "steel2", { x: x0 });
  P({ id: "fnBaseBolt", layer: "fn", shape: "cyl", size: [0.09, 0.08], rot: V, pos: [x0, -0.66, 0], at: RING(16, 1.9), mat: "steel" });
  VT("fnShell", "fn", 1.55, 1.5, -0.7, 3.4, "window", { x: x0 });
  P({ id: "fnJacket", layer: "fn", shape: "tube", size: [1.62, 1.54, 0.12], rot: V, pos: [x0, 0, 0], at: [0.2, 1.0, 1.8, 2.6, 3.3].map((y) => [0, y, 0]), mat: "copper" });
  VC("fnCap", "fn", 1.65, 3.4, 3.6, "steel2", { x: x0 }); SPH("fnDome", "fn", 1.5, x0, 3.6, 0, "steel", { scale: [1, 0.42, 1] });
  P({ id: "fnCapBolt", layer: "fn", shape: "cyl", size: [0.09, 0.08], rot: V, pos: [x0, 3.64, 0], at: RING(12, 1.55), mat: "steel" });
  P({ id: "fnEye", layer: "fn", shape: "tube", size: [0.3, 0.19, 0.08], pos: [x0, 4.4, 0], mat: "steel" }); VC("fnEyeBase", "fn", 0.18, 4.0, 4.3, "steel", { x: x0 });
  VT("fnMold", "fn", 0.95, 0.72, 1.2, 2.3, "copper", { x: x0 }); P({ id: "fnMoldBolt", layer: "fn", shape: "cyl", size: [0.05, 0.06], rot: V, pos: [x0, 2.34, 0], at: RING(8, 0.84), mat: "steel" });
  P({ id: "fnCoilT", layer: "fnCoil", shape: "tube", size: [1.2, 1.1, 0.1], rot: V, pos: [x0, 1.3, 0], at: [0, 0.25, 0.5, 0.75, 1.0].map((y) => [0, y, 0]), mat: "copper" });
  VC("fnPoolD", "fnPool", 0.7, 2.3, 2.34, "molten", { x: x0 });
  VC("fnIng", "fnIngot", 0.7, -0.1, 2.2, "steel2", { x: x0 }); VC("fnRod", "fnIngot", 0.22, -0.65, -0.1, "steel", { x: x0 }); VC("fnRodB", "fnIngot", 0.5, -1.2, -0.65, "dark", { x: x0 });
  VC("fnIngHot", "fnHot", 0.705, 1.4, 2.2, "hot", { x: x0 });
  HXC("fnPort", "fn", 0.34, x0 + 1.5, x0 + 3.2, 0.5, 0, "steel2"); P({ id: "fnPortFl", layer: "fn", shape: "tube", size: [0.5, 0.3, 0.12], rot: HX, pos: [x0 + 3.2, 0.5, 0], mat: "steel" });
  BOX("fnValve", "fn", x0 + 3.3, x0 + 4.3, -0.4, 1.4, -0.6, 0.6, "band"); P({ id: "fnValveW", layer: "fn", shape: "tube", size: [0.42, 0.33, 0.08], pos: [x0 + 3.8, 0.5, 0.68], mat: "estop" });
  P({ id: "fnPumpLine", layer: "fn", shape: "cyl", size: [0.18, 1.5], rot: V, pos: [x0 + 3.8, -0.9, 0], mat: "steel2" });
  P({ id: "fnVP", layer: "fn", shape: "tube", size: [0.42, 0.26, 0.12], pos: [x0, 2.0, 1.58], mat: "steel2" }); P({ id: "fnVPG", layer: "fn", shape: "cyl", size: [0.26, 0.04], pos: [x0, 2.0, 1.6], mat: "glassDoor" });
  BOX("fnTrans", "fn", x0 - 4.8, x0 - 3.2, FY, 1.0, -0.8, 0.8, "band"); P({ id: "fnTransLamp", layer: "fn", shape: "cyl", size: [0.07, 0.05], pos: [x0 - 4.4, 0.6, 0.82], at: [[0, 0, 0], [0.4, 0, 0]], mat: "lampY" });
  HXC("fnLead", "fn", 0.09, x0 - 3.2, x0 - 1.2, 1.6, 0.0, "copper", { at: [[0, 0, 0.25], [0, 0, -0.25]] }); P({ id: "fnLeadUp", layer: "fn", shape: "cyl", size: [0.09, 0.7], rot: V, pos: [x0 - 3.2, 1.25, 0], mat: "copper", at: [[0, 0, 0.25], [0, 0, -0.25]] });
  P({ id: "fnGauge", layer: "fn", shape: "cyl", size: [0.3, 0.1], pos: [x0 + 2.2, 1.2, 0.35], mat: "panel" });
}
// ═════ 站 3：軋機（x＝45）：機架窗框、上下工作輥與支撐輥、液壓缸、輸送滾輪、冷卻噴桿；板由厚變薄 ═════
LAY("ml", [8, 8, SX.ml, 2]); LAY("mlRoll", [3, 5, SX.ml, 1.6]); LAY("mlIn", [4, 0.7, SX.ml - 3.2, 1.6]); LAY("mlOut", [5, 0.5, SX.ml + 2.6, 1.6]);
{ const x0 = SX.ml, YU = 2.38, YL = 0.82, BU = 3.75, BL = -0.55;
  for (const [z, s] of [[2.1, "F"], [-2.1, "B"]]) {
    BOX(`mlPostL${s}`, "ml", x0 - 1.6, x0 - 0.95, FY, 5.6, z - 0.3, z + 0.3, "steel2"); BOX(`mlPostR${s}`, "ml", x0 + 0.95, x0 + 1.6, FY, 5.6, z - 0.3, z + 0.3, "steel2");
    BOX(`mlTop${s}`, "ml", x0 - 1.7, x0 + 1.7, 4.9, 5.6, z - 0.3, z + 0.3, "band"); BOX(`mlBot${s}`, "ml", x0 - 1.7, x0 + 1.7, FY, -1.0, z - 0.3, z + 0.3, "band");
    P({ id: `mlBolt${s}`, layer: "ml", shape: "cyl", size: [0.07, 0.05], pos: [x0, 5.3, z + (z > 0 ? 0.32 : -0.32)], at: [[-1.4, 0, 0], [1.4, 0, 0], [-1.4, -0.5, 0], [1.4, -0.5, 0], [-1.25, -3.8, 0], [1.25, -3.8, 0], [-1.25, -5.0, 0], [1.25, -5.0, 0]], mat: "steel" });
    BOX(`mlChockU${s}`, "ml", x0 - 0.85, x0 + 0.85, BU - 0.4, BU + 0.4, z > 0 ? 1.35 : -1.85, z > 0 ? 1.85 : -1.35, "dark"); BOX(`mlChockL${s}`, "ml", x0 - 0.85, x0 + 0.85, BL - 0.4, BL + 0.4, z > 0 ? 1.35 : -1.85, z > 0 ? 1.85 : -1.35, "dark");
  }
  BOX("mlTie", "ml", x0 - 1.6, x0 + 1.6, 4.9, 5.4, -2.1, 2.1, "band");
  VC("mlHyd", "ml", 0.45, 5.6, 6.7, "steel", { x: x0 }); VC("mlHydRod", "ml", 0.2, 5.1, 5.6, "steel2", { x: x0 }); VT("mlHydRing", "ml", 0.5, 0.42, 5.6, 5.7, "estop", { x: x0 });
  P({ id: "mlHydPipe", layer: "ml", shape: "cyl", size: [0.07, 1.2], rot: HX, pos: [x0 + 0.65, 6.4, 0], mat: "pipeR" });
  ZC("mlRU", "mlRoll", 0.55, -1.6, 1.6, x0, YU, "steel2"); ZC("mlRL", "mlRoll", 0.55, -1.6, 1.6, x0, YL, "steel2");
  ZC("mlBU", "mlRoll", 0.82, -1.3, 1.3, x0, BU, "steel"); ZC("mlBL", "mlRoll", 0.82, -1.3, 1.3, x0, BL, "steel");
  P({ id: "mlNeckU", layer: "mlRoll", shape: "cyl", size: [0.3, 1.2], pos: [x0, YU, 0], at: [[0, 0, 2.5], [0, 0, -2.5]], mat: "steel" }); P({ id: "mlNeckL", layer: "mlRoll", shape: "cyl", size: [0.3, 1.2], pos: [x0, YL, 0], at: [[0, 0, 2.5], [0, 0, -2.5]], mat: "steel" });
  P({ id: "mlMarkU", layer: "mlRoll", shape: "box", size: [0.07, 0.07, 3.1], pos: [x0 + 0.54, YU, 0], mat: "lampY" }); P({ id: "mlMarkL", layer: "mlRoll", shape: "box", size: [0.07, 0.07, 3.1], pos: [x0 - 0.54, YL, 0], mat: "lampY" });
  P({ id: "mlMarkBU", layer: "mlRoll", shape: "box", size: [0.07, 0.07, 2.5], pos: [x0 + 0.81, BU, 0], mat: "estop" });
  ZC("mlMotorShaft", "ml", 0.25, -4.0, -2.9, x0, YU, "steel2"); ZC("mlMotor", "ml", 0.8, -5.9, -4.0, x0, YU, "band"); P({ id: "mlMotorFin", layer: "ml", shape: "tube", size: [0.86, 0.78, 0.07], pos: [x0, YU, -4.3], at: Array.from({ length: 8 }, (_, i) => [0, 0, -i * 0.2]), mat: "steel2" });
  BOX("mlMotorBase", "ml", x0 - 0.9, x0 + 0.9, FY, YU - 0.8, -5.9, -4.0, "dark");
  for (let i = 0; i < 10; i++) { const xx = i < 5 ? x0 - 5.8 + i * 0.8 : x0 + 1.5 + (i - 5) * 0.9; ZC(`mlTR${i}`, "ml", 0.13, -1.4, 1.4, xx, 1.17, "steel2"); }
  BOX("mlRailA", "ml", x0 - 6.2, x0 - 2.3, 0.7, 0.9, 1.5, 1.7, "dark", { at: [[0, 0, 0], [0, 0, -3.2]] }); BOX("mlRailB", "ml", x0 + 1.3, x0 + 5.6, 0.7, 0.9, 1.5, 1.7, "dark", { at: [[0, 0, 0], [0, 0, -3.2]] });
  BOX("mlTLeg", "ml", x0 - 6.0, x0 - 5.7, FY, 0.7, 1.5, 1.7, "dark", { at: [[0, 0, 0], [0, 0, -3.2], [3.4, 0, 0], [3.4, 0, -3.2], [7.5, 0, 0], [7.5, 0, -3.2]] });
  ZC("mlSprayBar", "ml", 0.09, -1.8, 1.8, x0 - 1.25, 3.3, "pipeB"); P({ id: "mlNozzle", layer: "ml", shape: "cone", size: [0.04, 0.09, 0.3], rot: [45, 0, 0], pos: [x0 - 1.25, 3.15, 0], at: [-1.4, -0.7, 0, 0.7, 1.4].map((z) => [0, 0, z]), mat: "steel" });
  P({ id: "mlPlateIn", layer: "mlIn", shape: "box", size: [3.4, 0.62, 2.4], pos: [x0 - 1.8, 1.6, 0], mat: "tgt" });
  P({ id: "mlPlateOut", layer: "mlOut", shape: "box", size: [4.6, 0.4, 2.4], pos: [x0 + 2.5, 1.6, 0], mat: "tgtFace" });
  const RPIV = (ids, y) => Object.fromEntries(ids.map((k) => [k, [x0, y, 0]]));
  actions.rollRU = { type: "rotate", parts: ["mlRU", "mlNeckU", "mlMarkU"], axis: [0, 0, 1], pivot: [x0, YU, 0], pivots: RPIV(["mlRU", "mlNeckU", "mlMarkU"], YU), rps: 0.5, rampSpin: true };
  actions.rollRL = { type: "rotate", parts: ["mlRL", "mlNeckL", "mlMarkL"], axis: [0, 0, -1], pivot: [x0, YL, 0], pivots: RPIV(["mlRL", "mlNeckL", "mlMarkL"], YL), rps: 0.5, rampSpin: true };
  actions.rollBU = { type: "rotate", parts: ["mlBU", "mlMarkBU"], axis: [0, 0, -1], pivot: [x0, BU, 0], pivots: RPIV(["mlBU", "mlMarkBU"], BU), rps: 0.33, rampSpin: true };
  actions.rollBL = { type: "rotate", parts: ["mlBL"], axis: [0, 0, 1], pivot: [x0, BL, 0], pivots: RPIV(["mlBL"], BL), rps: 0.33, rampSpin: true };
  actions.mlTable = { type: "rotate", parts: Array.from({ length: 10 }, (_, i) => `mlTR${i}`), axis: [0, 0, -1], rps: 0.7, rampSpin: true };
  actions.mlSpray = { type: "flow", layer: "ml", path: [[x0 - 1.25, 3.1, 0.0], [x0 - 0.42, 2.8, 0.0]], n: 3, lanes: 5, laneDir: [0, 0, 1], laneGap: 0.7, size: 0.05, shape: "dot", rate: 1.4, color: "argonC", track: false, accel: true, free: true, jitter: 0.06 };
}
// ═════ 站 4：立式車床（x＝57）：回轉工作台、卡爪、靶坯圓盤、刀架在橫樑導軌上，面由外往內車亮 ═════
LAY("lt", [9, 8, SX.lt, 2]); LAY("ltTab", [6, 2, SX.lt, 0.5]); LAY("ltTool", [4, 5, SX.lt - 1.9, 3]);
LAY("ltF1", [4, 0.1, SX.lt, 1.2]); LAY("ltF2", [3, 0.1, SX.lt, 1.2]); LAY("ltF3", [2, 0.1, SX.lt, 1.2]);
{ const x0 = SX.lt;
  BOX("ltBase", "lt", x0 - 3.9, x0 + 3.9, FY, -0.2, -2.7, 2.7, "band"); BOX("ltSkirt", "lt", x0 - 3.7, x0 + 3.7, FY + 0.15, -0.3, 2.7, 2.78, "panel2"); BOX("ltFoot", "lt", x0 - 0.4, x0 + 0.4, FY, FY + 0.12, 2.78, 3.0, "dark", { at: [-3.2, 0, 3.2].map((d) => [d, 0, 0]) });
  VC("ltTable", "ltTab", 2.7, -0.2, 0.6, "steel2", { x: x0 }); VT("ltTSlot", "ltTab", 2.5, 2.4, 0.6, 0.64, "dark", { x: x0 });
  P({ id: "ltJawX", layer: "ltTab", shape: "box", size: [0.5, 0.55, 0.4], pos: [x0, 0.875, 0], at: [[2.05, 0, 0], [-2.05, 0, 0]], mat: "dark" }); P({ id: "ltJawZ", layer: "ltTab", shape: "box", size: [0.4, 0.55, 0.5], pos: [x0, 0.875, 0], at: [[0, 0, 2.05], [0, 0, -2.05]], mat: "dark" });
  P({ id: "ltJawBolt", layer: "ltTab", shape: "cyl", size: [0.07, 0.05], rot: V, pos: [x0, 1.18, 0], at: [[2.05, 0, 0], [-2.05, 0, 0], [0, 0, 2.05], [0, 0, -2.05]], mat: "steel" });
  VC("ltDisc", "ltTab", TGT_R, 0.6, 1.2, "tgt", { x: x0 }); VC("ltRough", "ltTab", TGT_R - 0.05, 1.2, 1.215, "tgtDark", { x: x0 });
  BOX("ltMark", "ltTab", x0 + 2.2, x0 + 2.65, 0.64, 0.7, -0.07, 0.07, "lampY");
  VT("ltF1T", "ltF1", 1.9, 1.35, 1.215, 1.23, "tgtFace", { x: x0 }); VT("ltF2T", "ltF2", 1.35, 0.7, 1.215, 1.23, "tgtFace", { x: x0 }); VC("ltF3T", "ltF3", 0.7, 1.215, 1.23, "tgtFace", { x: x0 });
  for (const sx of [-1, 1]) { BOX(`ltCol${sx}`, "lt", x0 + (sx > 0 ? 3.0 : -3.9), x0 + (sx > 0 ? 3.9 : -3.0), -0.2, 5.8, -2.4, -1.2, "steel2"); BOX(`ltColFace${sx}`, "lt", x0 + (sx > 0 ? 3.1 : -3.8), x0 + (sx > 0 ? 3.8 : -3.1), 0.3, 5.5, -1.2, -1.15, "dark"); }
  BOX("ltRail", "lt", x0 - 3.9, x0 + 3.9, 4.7, 5.6, -2.4, -1.2, "band"); BOX("ltRailGuide", "lt", x0 - 3.0, x0 + 3.0, 4.95, 5.05, -1.2, -1.14, "steel", { at: [[0, 0, 0], [0, 0.4, 0]] });
  BOX("ltRack", "lt", x0 - 3.0, x0 + 3.0, 5.62, 5.7, -2.2, -1.6, "knurl");
  BOX("ltSaddle", "ltTool", x0 - 2.45, x0 - 1.35, 4.6, 5.7, -1.2, -0.65, "dark"); BOX("ltArm", "ltTool", x0 - 2.3, x0 - 1.5, 4.8, 5.3, -0.65, 0.35, "band"); BOX("ltRam", "ltTool", x0 - 2.2, x0 - 1.6, 2.0, 5.1, -0.3, 0.3, "steel2");
  BOX("ltHolder", "ltTool", x0 - 2.15, x0 - 1.65, 1.5, 2.0, -0.25, 0.25, "dark"); BOX("ltInsert", "ltTool", x0 - 2.0, x0 - 1.8, 1.23, 1.5, -0.1, 0.1, "gold");
  P({ id: "ltRamBolt", layer: "ltTool", shape: "cyl", size: [0.05, 0.04], pos: [x0 - 1.9, 3.0, 0.32], at: [[-0.2, 0, 0], [0.2, 0, 0], [-0.2, 0.8, 0], [0.2, 0.8, 0]], mat: "steel" });
  BOX("ltPanel", "lt", x0 + 3.2, x0 + 4.4, 0.8, 2.0, 2.3, 2.5, "band"); BOX("ltScreen", "lt", x0 + 3.3, x0 + 4.3, 1.1, 1.8, 2.5, 2.54, "screen"); P({ id: "ltEstop", layer: "lt", shape: "cyl", size: [0.16, 0.1], pos: [x0 + 4.0, 0.95, 2.55], mat: "estop" });
  P({ id: "ltPanelArm", layer: "lt", shape: "cyl", size: [0.1, 2.0], rot: V, pos: [x0 + 3.8, -0.4, 2.4], mat: "steel" });
  BOX("ltSeam", "lt", x0 - 3.8, x0 + 3.8, FY + 0.2, -0.3, 2.7, 2.74, "seam", { at: [-2.4, -0.8, 0.8, 2.4].map((d) => [d, 0, 0]) });
  P({ id: "ltScrew", layer: "lt", shape: "cyl", size: [0.06, 0.04], pos: [x0, -0.6, 2.78], at: grid(-3.4, 3.4, 8, -0.5, 0.3, 2, 0), mat: "steel" });
  BOX("ltPlateName", "lt", x0 - 0.8, x0 + 0.8, -0.65, -0.35, 2.78, 2.82, "gold");
  BOX("ltColSeam", "lt", x0 - 3.8, x0 - 3.1, 2.0, 2.06, -1.15, -1.1, "seam", { at: [[0, 0, 0], [0, 1.6, 0], [6.9, 0, 0], [6.9, 1.6, 0]] });
  P({ id: "ltPipe", layer: "lt", shape: "cyl", size: [0.07, 3.0], rot: V, pos: [x0 - 3.4, 1.4, -0.6], mat: "pipeB" }); ZC("ltPipeH", "lt", 0.07, -0.6, -0.0, x0 - 3.4, 2.9, "pipeB");
  ZC("ltNozzle", "lt", 0.07, -1.0, 0.6, x0 - 2.6, 3.0, "pipeB"); SPH("ltNozzleTip", "lt", 0.1, x0 - 2.6, 3.0, 0.6, "steel2");
  const NZ = [x0 - 2.6, 3.0, 0.7];
  actions.ltCool = { type: "flow", layer: "lt", path: [NZ, [x0 - 1.7, 1.35, 0.1]], n: 3, lanes: 3, laneDir: [0, 0, 1], laneGap: 0.08, size: 0.06, shape: "liquid", band: 0.06, bandO: 0.35, rate: 1.2, color: "argonC", track: false, accel: true, free: true };
  [[-1.6, -0.9], [-1.9, 0.4], [-1.3, 1.1]].forEach(([dx, dz], i) => { actions[`ltChip${i}`] = { type: "flow", layer: "lt", path: [[x0 - 1.8, 1.3, 0.05], [x0 + dx - 0.8, 0.8, dz * 0.6], [x0 + dx - 1.2, -0.15, dz]], n: 2, size: 0.09, shape: "flake", rate: 0.9, phase: i * 0.3, color: "chipFlake", track: false, accel: true, free: true }; });
  const ids = ["ltTable", "ltTSlot", "ltJawX", "ltJawZ", "ltJawBolt", "ltDisc", "ltRough", "ltMark", "ltF1T", "ltF2T", "ltF3T"];
  actions.ltSpin = { type: "rotate", parts: ids, axis: [0, 1, 0], pivot: [x0, 0.6, 0], pivots: Object.fromEntries(ids.map((k) => [k, [x0, 0.6, 0]])), rps: 0.5, rampSpin: true };
}
// ═════ 站 5：接合壓合台（x＝69）：加熱盤、定位銷、背板、焊料（融化攤開、邊緣圓鈍）、液壓壓頭帶靶下壓 ═════
LAY("bd", [9, 8, SX.bd, 2]); LAY("bdBack", [5, 1, SX.bd, 0.8]); LAY("bdS0", [2, 0.3, SX.bd, 1.15]); LAY("bdS1", [3, 0.2, SX.bd, 1.1]); LAY("bdS2", [5, 0.2, SX.bd, 1.08]); LAY("bdPress", [5, 3, SX.bd, 2.4]); LAY("bdHeat", [6, 0.2, SX.bd, 0.42]);
{ const x0 = SX.bd;
  BOX("bdBase", "bd", x0 - 3.8, x0 + 3.8, FY, -0.2, -2.8, 2.8, "band"); BOX("bdSkirt", "bd", x0 - 3.6, x0 + 3.6, FY + 0.15, -0.3, 2.8, 2.86, "panel2");
  VC("bdPlateH", "bd", 3.0, -0.2, 0.4, "steel", { x: x0 });
  P({ id: "bdPlateEdge", layer: "bd", shape: "tube", size: [3.04, 2.95, 0.07], rot: V, pos: [x0, 0.1, 0], at: [[0, -0.05, 0], [0, 0.18, 0]], mat: "steel2" });
  [2.7, 2.35, 2.0].forEach((r, i) => VT(`bdHeat${i}`, "bdHeat", r + 0.06, r - 0.06, 0.4, 0.44, "heatRing", { x: x0 }));
  P({ id: "bdTc", layer: "bd", shape: "cyl", size: [0.05, 0.9], rot: HX, pos: [x0 + 3.4, 0.1, 0.3], mat: "conn" }); P({ id: "bdTcTip", layer: "bd", shape: "cyl", size: [0.09, 0.1], rot: HX, pos: [x0 + 2.95, 0.1, 0.3], mat: "gold" });
  P({ id: "bdPin", layer: "bdBack", shape: "cyl", size: [0.08, 0.55], rot: V, pos: [x0, 0.67, 0], at: RING(3, 2.5, 30), mat: "gold" });
  VC("bdBackD", "bdBack", 2.2, 0.44, 1.04, "back", { x: x0 }); VT("bdBackCh", "bdBack", 2.24, 2.12, 0.44, 0.54, "steel2", { x: x0 });
  VC("bdS0D", "bdS0", 0.7, 1.04, 1.24, "solder", { x: x0 }); VC("bdS1D", "bdS1", 1.4, 1.04, 1.14, "solder", { x: x0 }); VC("bdS2D", "bdS2", 2.08, 1.04, 1.09, "solder", { x: x0 }); VT("bdS2Bead", "bdS2", 2.12, 2.0, 1.04, 1.14, "solder", { x: x0 });
  VC("bdTgtD", "bdPress", TGT_R, 1.1, 1.7, "tgt", { x: x0 }); VC("bdTgtF", "bdPress", TGT_R - 0.05, 1.08, 1.1, "tgtFace", { x: x0 });
  VC("bdPressPl", "bdPress", 2.3, 1.7, 2.0, "steel2", { x: x0 }); VT("bdPressRim", "bdPress", 2.34, 2.1, 1.7, 1.75, "dark", { x: x0 });
  VC("bdRod", "bdPress", 0.3, 2.0, 4.3, "steel2", { x: x0 }); P({ id: "bdRodBand", layer: "bdPress", shape: "tube", size: [0.34, 0.28, 0.1], rot: V, pos: [x0, 3.0, 0], at: [[0, 0, 0], [0, 0.7, 0]], mat: "estop" });
  for (const sx of [-1, 1]) BOX(`bdCol${sx}`, "bd", x0 + (sx > 0 ? 3.1 : -3.8), x0 + (sx > 0 ? 3.8 : -3.1), -0.2, 6.2, -1.0, 1.0, "steel2");
  BOX("bdBeam", "bd", x0 - 3.8, x0 + 3.8, 5.6, 6.2, -1.0, 1.0, "band"); VC("bdCyl", "bd", 0.55, 4.3, 5.6, "steel", { x: x0 }); VT("bdCylRing", "bd", 0.6, 0.5, 4.3, 4.4, "estop", { x: x0 });
  P({ id: "bdGauge", layer: "bd", shape: "cyl", size: [0.3, 0.1], pos: [x0 + 0.55, 5.0, 0.4], rot: HX, mat: "panel" }); P({ id: "bdHose", layer: "bd", shape: "cyl", size: [0.08, 1.5], rot: HX, pos: [x0 + 1.4, 5.9, 0], mat: "pipeR" });
  for (const sx of [-1, 1]) { P({ id: `bdGuide${sx}`, layer: "bdPress", shape: "cyl", size: [0.1, 3.2], rot: V, pos: [x0 + sx * 1.6, 3.4, 0.0], mat: "steel2" }); BOX(`bdScale${sx}`, "bdPress", x0 + sx * 1.6 + 0.12, x0 + sx * 1.6 + 0.2, 2.0, 4.8, -0.03, 0.03, "lampY"); }
  BOX("bdCtrl", "bd", x0 + 4.2, x0 + 5.6, FY, 1.6, -0.8, 0.8, "band"); P({ id: "bdCtrlLamp", layer: "bd", shape: "cyl", size: [0.07, 0.05], pos: [x0 + 4.6, 1.2, 0.82], at: [[0, 0, 0], [0.35, 0, 0], [0.7, 0, 0]], mat: "lampY" }); BOX("bdCtrlScr", "bd", x0 + 4.4, x0 + 5.4, 0.2, 0.8, 0.8, 0.84, "screen");
  HXC("bdCtrlHose", "bd", 0.08, x0 + 3.0, x0 + 4.2, 0.0, 0.3, "conn"); BOX("bdSkirtScrew", "bd", x0 - 3.4, x0 + 3.4, FY + 0.4, FY + 0.46, 2.86, 2.9, "seam");
  BOX("bdColBolt", "bd", x0 - 3.7, x0 - 3.2, 5.7, 5.74, 1.0, 1.04, "steel");
  actions.bdHeat = { type: "pulse", parts: ["bdHeat0", "bdHeat1", "bdHeat2"], color: "hotC", glow: 1, steady: true, halo: 0 };
}

// ═════ 站 3：鍛壓機（x＝SX.fg）：機架、油壓缸、上下模；錠先是高的圓柱，壓下去變扁寬 ═════
LAY("fg", [8, 9, SX.fg, 2.5]); LAY("fgRam", [4, 3, SX.fg, 3.7]); LAY("fgIng0", [2, 2, SX.fg, 1.1]); LAY("fgIng1", [2, 1, SX.fg, 0.7]);
{ const x0 = SX.fg;
  BOX("fgBase", "fg", x0 - 3.6, x0 + 3.6, FY, -0.7, -1.8, 1.8, "band"); BOX("fgAnvil", "fg", x0 - 1.6, x0 + 1.6, -0.7, 0.2, -1.2, 1.2, "dark"); BOX("fgAnvilTop", "fg", x0 - 1.5, x0 + 1.5, 0.2, 0.26, -1.1, 1.1, "steel2");
  for (const sx of [-1, 1]) { BOX(`fgPost${sx}`, "fg", x0 + (sx > 0 ? 2.7 : -3.5), x0 + (sx > 0 ? 3.5 : -2.7), -0.7, 6.3, -0.8, 0.8, "steel2"); BOX(`fgRail${sx}`, "fg", x0 + sx * 2.55 - 0.05, x0 + sx * 2.55 + 0.05, 0.4, 5.3, -0.5, 0.5, "dark"); }
  BOX("fgBeam", "fg", x0 - 3.5, x0 + 3.5, 5.4, 6.3, -0.9, 0.9, "band"); VC("fgCyl", "fg", 0.85, 6.3, 8.0, "steel", { x: x0 }); VT("fgCylRing", "fg", 0.92, 0.8, 6.3, 6.45, "estop", { x: x0 }); VT("fgCylRing2", "fg", 0.92, 0.8, 7.7, 7.85, "estop", { x: x0 });
  P({ id: "fgHose", layer: "fg", shape: "cyl", size: [0.1, 2.0], rot: HX, pos: [x0 + 1.9, 7.4, 0], mat: "pipeR" }); P({ id: "fgGauge", layer: "fg", shape: "cyl", size: [0.32, 0.1], pos: [x0 + 0.95, 7.0, 0.4], mat: "panel" });
  P({ id: "fgBolt", layer: "fg", shape: "cyl", size: [0.08, 0.05], pos: [x0, 5.9, 0.92], at: [-3.0, -1.5, 0, 1.5, 3.0].map((d) => [d, 0, 0]), mat: "steel" });
  BOX("fgCtrl", "fg", x0 + 4.2, x0 + 5.6, FY, 1.8, -0.8, 0.8, "band"); P({ id: "fgLamp", layer: "fg", shape: "cyl", size: [0.07, 0.05], pos: [x0 + 4.6, 1.4, 0.82], at: [[0, 0, 0], [0.35, 0, 0], [0.7, 0, 0]], mat: "lampG" });
  VC("fgRamRod", "fgRam", 0.5, 2.9, 6.3, "steel2", { x: x0 }); BOX("fgDie", "fgRam", x0 - 1.5, x0 + 1.5, 2.3, 2.9, -1.1, 1.1, "dark"); BOX("fgDieFace", "fgRam", x0 - 1.45, x0 + 1.45, 2.25, 2.3, -1.05, 1.05, "steel2");
  P({ id: "fgRamBand", layer: "fgRam", shape: "tube", size: [0.56, 0.48, 0.1], rot: V, pos: [x0, 4.0, 0], at: [[0, 0, 0], [0, 0.6, 0]], mat: "estop" });
  VC("fgIngA", "fgIng0", 0.6, 0.26, 2.0, "hot", { x: x0 }); VC("fgIngB", "fgIng1", 0.92, 0.26, 1.15, "hot", { x: x0 });
}
// ═════ 站 5：退火爐（x＝SX.an）：箱式爐、玻璃門看得到裡面的板（燙橘色慢慢變暗）、加熱絲、煙囪、控制櫃 ═════
LAY("an", [8, 6, SX.an, 1]); LAY("anPlate", [4, 0.4, SX.an, 0.35]); LAY("anHot", [4, 0.4, SX.an, 0.35]); LAY("anElem", [5, 0.2, SX.an, 1.9]);
{ const x0 = SX.an;
  BOX("anFloor", "an", x0 - 3.0, x0 + 3.0, FY, -0.2, -2.0, 2.0, "band"); BOX("anBack", "an", x0 - 3.0, x0 + 3.0, -0.2, 2.8, -2.0, -1.8, "panel2");
  BOX("anL", "an", x0 - 3.0, x0 - 2.8, -0.2, 2.8, -1.8, 1.8, "panel2"); BOX("anR", "an", x0 + 2.8, x0 + 3.0, -0.2, 2.8, -1.8, 1.8, "panel2"); BOX("anTop", "an", x0 - 3.0, x0 + 3.0, 2.8, 3.0, -2.0, 2.0, "panel2");
  BOX("anDoorFrame", "an", x0 - 2.8, x0 + 2.8, -0.2, 0.0, 1.8, 2.0, "dark"); BOX("anDoorFrameT", "an", x0 - 2.8, x0 + 2.8, 2.6, 2.8, 1.8, 2.0, "dark");
  BOX("anDoor", "an", x0 - 2.8, x0 + 2.8, 0.0, 2.6, 1.86, 1.94, "glassDoor"); BOX("anHandle", "an", x0 + 2.3, x0 + 2.45, 0.6, 1.9, 1.94, 2.2, "steel2");
  P({ id: "anHinge", layer: "an", shape: "cyl", size: [0.1, 0.4], rot: V, pos: [x0 - 2.8, 0, 2.0], at: [[0, 0.3, 0], [0, 2.0, 0]], mat: "steel" });
  P({ id: "anBolt", layer: "an", shape: "cyl", size: [0.06, 0.04], pos: [x0, 2.9, 2.02], at: grid(-2.6, 2.6, 8, -2.9, -2.9, 1, 0).map(([a, , c]) => [a, 0, c]), mat: "steel" });
  VC("anChimney", "an", 0.4, 3.0, 4.4, "steel2", { x: x0 + 1.6 }); VT("anChimneyRing", "an", 0.48, 0.38, 4.2, 4.3, "steel", { x: x0 + 1.6 });
  P({ id: "anRack", layer: "an", shape: "box", size: [4.4, 0.08, 0.1], pos: [x0, 0.14, 0], at: [[0, 0, -0.9], [0, 0, 0.9]], mat: "steel2" });
  P({ id: "anPlateD", layer: "anPlate", shape: "box", size: [3.4, 0.34, 2.0], pos: [x0, 0.35, 0], mat: "tgtFace" }); P({ id: "anPlateH", layer: "anHot", shape: "box", size: [3.42, 0.35, 2.02], pos: [x0, 0.35, 0], mat: "hot" });
  P({ id: "anElemB", layer: "anElem", shape: "box", size: [4.6, 0.06, 0.08], pos: [x0, 2.0, 0], at: [-1.4, -0.7, 0, 0.7, 1.4].map((z) => [0, 0, z]), mat: "heatRing" });
  BOX("anCab", "an", x0 + 3.6, x0 + 5.0, FY, 2.4, -0.9, 0.9, "band"); BOX("anCabScr", "an", x0 + 3.8, x0 + 4.8, 1.2, 1.9, 0.9, 0.94, "screen"); P({ id: "anCabLamp", layer: "an", shape: "cyl", size: [0.07, 0.05], pos: [x0 + 4.0, 0.7, 0.92], at: [[0, 0, 0], [0.35, 0, 0], [0.7, 0, 0]], mat: "lampR" });
  P({ id: "anTc", layer: "an", shape: "cyl", size: [0.05, 1.0], rot: V, pos: [x0 - 2.2, 3.5, 0.5], mat: "conn" });
  actions.anHeat = { type: "pulse", parts: ["anElemB"], color: "hotC", glow: 1, steady: true, halo: 0 };
}

// ═════ 運作動畫（actions）：電漿、氬氣、離子加速、原子餘弦散開、電子跑道、磁場線、磁鐵轉、冷卻水 ═════
const FACE = TGT_Y0 - 0.02;   // 靶面（濺射面）高度
actions.plasmaGlow = { type: "pulse", _說明: "電漿輝光：靶面前環形區、微微閃動（顏色為示意）", parts: ["plasmaOut", "plasmaMid", "plasmaCore"], color: "plasmaC", glow: 1, freq: 1.7, halo: 2.2 };
actions.hitGlow = { type: "pulse", _說明: "離子撞到靶面的亮點", parts: ["hitGlow"], color: "hitC", glow: 1, freq: 2.6, halo: 0 };
// 氬氣：從左邊入口進腔，稀薄、均勻擴散到整個腔（粒子很稀、自由飛、不收攏到中心）
[[3.0, 0.9, 1.6], [2.4, 2.9, -1.9], [-2.2, 0.5, -2.6], [0.6, 2.2, 3.0]].forEach(([ex, ey, ez], i) => {
  actions[`gas${i}`] = { type: "flow", layer: "gas", path: [[-3.75, 2.0, 0], [-2.2, 2.2 + 0.2 * (i % 2), 0.5 * (i - 1.5)], [ex, ey, ez]], n: 4, lanes: 3, laneDir: [0, 1, 1], laneGap: 0.6, size: 0.06, shape: "dot", rate: 0.1 + 0.02 * i, phase: i * 0.17, color: "argonC", track: false, jitter: 0.9 };
});
// 離子：在跑道電漿環裡產生，只在靶前一小段往靶面加速（accel＝越近越快）、帶拖尾；6 個方位
for (let i = 0; i < 6; i++) {
  const [x, z] = pol(15 + i * 60, RT);
  actions[`ion${i}`] = { type: "flow", layer: "plasma", path: [[x, 2.62, z], [x, FACE, z]], n: 2, size: 0.085, shape: "dot", rate: 0.62, phase: i * 0.09, color: "ionC", trail: 3, trailGap: 0.05, trailColor: "ionC", track: false, accel: true };
}
// 原子：每個發射點以「靶面法線（正下方）」為中心散開，餘弦分布：正前方最多（n 大），越斜越少；往內往外對稱；往外飛出晶圓邊的打到遮蔽環裙板（R2.0）
const CONE = [[0, 3], [14, 2], [28, 2], [48, 1]];
let ai = 0;
[20, 140, 260].forEach((a0) => {
  const [sx, sz] = pol(a0, RT), ux = Math.cos(a0 * D2R), uz = Math.sin(a0 * D2R), y0 = FACE - 0.05, dyAll = y0 - 1.53;
  for (const [th, n] of CONE) for (const sg of th === 0 ? [1] : [1, -1]) {
    const tn = Math.tan(th * D2R) * sg;
    let h = dyAll * tn, yEnd = 1.53;
    const rEnd = RT + h;
    if (rEnd > 2.0) { h = 2.0 - RT; yEnd = y0 - h / tn; } else if (rEnd > 1.75) { h = 1.75 - RT; yEnd = y0 - h / tn; } else if (rEnd < -1.4) { h = -1.4 - RT; yEnd = y0 - h / tn; }
    actions[`atom${ai}`] = { type: "flow", layer: "hitL", path: [[sx, y0, sz], [R2(sx + h * ux), R2(yEnd), R2(sz + h * uz)]], n, size: 0.06, shape: "dot", rate: 0.45 + 0.04 * (ai % 3), phase: ai * 0.07, color: "tgtFaceC", trail: 3, trailGap: 0.035, trailColor: "tgtFaceC", track: false, free: true };
    ai++;
  }
});
actions.atomScat = { type: "flow", _說明: "少數原子撞到氬原子被散射偏轉（折線）", layer: "hitL", path: [[R2(RT * 0.7), FACE - 0.05, 0.3], [R2(RT * 0.7 + 0.1), 2.55, 0.35], [2.9, 1.9, 0.8]], n: 1, size: 0.06, shape: "dot", rate: 0.35, color: "tgtFaceC", trail: 3, trailGap: 0.04, track: false, free: true };
// 電子：被磁場困住，沿跑道轉圈（小亮點，帶輕微上下抖動）
const LOOP = Array.from({ length: 25 }, (_, i) => { const [x, z] = pol(i * 15, RT); return [x, 3.0, z]; });
actions.elec = { type: "flow", _說明: "二次電子沿磁場跑道轉圈（示意）", layer: "plasma", path: LOOP, n: 8, lanes: 2, laneDir: [0, 1, 0], laneGap: 0.07, size: 0.055, shape: "dot", rate: 0.34, color: "eleC", trail: 3, trailGap: 0.012, trailColor: "eleC", track: false, jitter: 0.07, free: true };
// 磁場線：靶面前方半橢圓弧，從外環（N）出、繞過跑道回中心（S）；四個方位（x＋、x−、z＋、z−）
[[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(([ux, uz], i) => {
  const path = Array.from({ length: 13 }, (_, k) => { const ph = (k / 12) * Math.PI, r = RT + 0.65 * Math.cos(ph); return [R2(ux * r), R2(FACE - 0.04 - 0.4 * Math.sin(ph)), R2(uz * r)]; });
  actions[`field${i}`] = { type: "flow", _說明: "磁場線（示意）：從外環磁鐵出、繞到中心磁鐵", layer: "plasma", path, n: 2, size: 0.08, shape: "arrow", rate: 0.35, phase: i * 0.12, color: "fieldC", track: true, free: true };
});
const MAGP = ["yoke", "yokeRim", "magOuter", "magOuterCap", "magCenter", "magCenterCap", "magInner", "magScrew", "magMark", "magTopN", "magTopS", "magShaft", "magPulley", "magPulleyRim", "magPulleyRim2"];
actions.magSpin = { type: "rotate", _說明: "磁鐵組旋轉（起轉、停轉有加減速；轉動讓溝較寬較平順）", parts: MAGP, axis: [0, 1, 0], pivot: [0, 5.2, 0], pivots: Object.fromEntries(MAGP.map((k) => [k, [0, 5.2, 0]])), rps: 0.28, rampSpin: true };
actions.drvSpin = { type: "rotate", parts: ["drvPulley"], axis: [0, 1, 0], pivot: [1.55, 7.0, 0], pivots: { drvPulley: [1.55, 7.0, 0] }, rps: 0.5, rampSpin: true };
// 冷卻水：進水管 → 水套（繞一圈）→ 出水管（藍色顆粒、受泵壓沿管流）
const SPIRAL = Array.from({ length: 14 }, (_, i) => { const a = i * 38, r = 2.7 - i * 0.025, [x, z] = pol(a, r); return [x, 4.9 + 0.12 * Math.sin(i), z]; });
actions.waterFlow = { type: "flow", _說明: "冷卻水：從進水管進水套、繞一圈帶走熱、從出水管出去", layer: "water", path: [[5.5, 6.85, 0], [4.4, 6.85, 0], [4.4, 4.9, 0], [3.2, 4.9, 0], ...SPIRAL, [-3.2, 4.9, 0], [-4.4, 4.9, 0], [-4.4, 6.85, 0], [-5.5, 6.85, 0]], n: 12, size: 0.085, shape: "dot", rate: 0.1, color: "waterD", trail: 2, trailGap: 0.012, track: false, free: true };
// 熱：離子轟擊使靶面發熱，背面水冷把熱帶走（示意）
actions.fnPoolGlow = { type: "pulse", parts: ["fnPoolD"], color: "moltenC", glow: 1, freq: 1.2, halo: 0 };

const A = (layer, p, dx, dy) => ({ layer, p, dx, dy });
Object.assign(anchors, {
  hv: A("hv", [-1.4, 7.6, 0.4], -150, -90), lid: A("lid", [2.2, 6.4, 3.2], 150, 100), mag: A("mag", [1.85, 5.0, 0.4], 150, -80), drive: A("lid", [1.55, 8.4, 0.4], 150, -90),
  water: A("water", [3.0, 5.4, 1.0], 150, 80), back: A("back", [2.3, 4.2, 1.8], 150, 90), solder: A("solder", [1.9, 3.83, 0.8], 150, 120), tgt: A("tgt", [1.7, 3.4, 0.9], 150, 100),
  shield: A("shield", [2.7, 3.2, 0.6], 150, 110), ins: A("ins", [3.4, 3.95, 0.6], 150, -100), oring: A("oring2", [2.95, 4.2, 0.4], -150, -90),
  plasma: A("plasma", [1.45, 2.95, 0.5], 150, 100), ion: A("plasma", [0.7, 2.7, 1.0], -150, 100), hit: A("hitL", [-0.5, 3.13, 1.1], -150, -100), atom: A("hitL", [0.9, 2.2, 0.9], 150, 40), wafer: A("wf", [1.3, 1.5, 0.5], 150, 100),
  elec: A("plasma", [1.2, 3.0, 0.0], 150, -90), field: A("plasma", [-1.0, 2.7, 0.0], -150, 100), gas: A("gas", [-5.1, 2.0, 0.0], -150, -80), pump: A("pump", [5.0, 0.6, 0.0], 150, 100), pumpPort: A("pump", [4.6, 0.6, 0.0], 150, 100),
  dsp: A("tgtDsp", [DX + 1.7, 0.2, 1.0], 150, 100), groove: A("tgtD3", [DX + 1.2, 0.1, 0.5], 150, -80), newT: A("tgtNew", [DX + 1.7, 0.5, 0.9], 150, -100),
  rfTank: A("rf", [SX.rf, 1.5, 1.7], 150, -100), furnace: A("fn", [SX.fn + 1.5, 2.0, 0.6], 150, -100), forge: A("fgRam", [SX.fg + 1.4, 2.6, 1.0], 150, -100), anneal: A("an", [SX.an + 2.0, 2.4, 2.0], 150, -100), ingot: A("fnIngot", [SX.fn + 0.7, 0.5, 0.2], 330, 150),
  mill: A("mlRoll", [SX.ml + 0.55, 2.38, 1.4], 150, -110), plateIn: A("mlIn", [SX.ml - 5.0, 1.9, 1.2], -150, -90), lathe: A("ltTab", [SX.lt + 1.6, 1.2, 1.2], 150, -90), tool: A("ltTool", [SX.lt - 1.9, 1.4, 0.2], -150, 90),
  bond: A("bdBack", [SX.bd + 2.1, 0.8, 0.8], 150, 90), solder2: A("bdS2", [SX.bd + 2.0, 1.1, 0.4], 150, 120), press: A("bdPress", [SX.bd + 0.6, 3.0, 0.4], 150, -100),
  rkJX: A("rkJP", [-3.8, 4.0, 0.0], 0, -40), rkSol: A("rkUS", [0, 4.0, 0.0], 0, -40), rkSolar: A("rkTW", [3.8, 4.0, 0.0], 0, -40),
});
for (const [k, d] of Object.entries(actions)) if (d.type === "flow" && /^(gas\d|atomScat|ltChip\d)$/.test(k)) d.free = true;   // 本來就在空中的流動（氣體擴散、被散射的原子、飛屑）
const model = {
  name: "示意 平面磁控濺鍍陰極總成（爆炸分解）與靶材製作站（tech-target）：製程腔（玻璃筒壁、頂法蘭、吸盤、晶圓、氣體入口、壓力計、抽氣口與真空泵）、陰極（高壓供電接頭、上蓋與驅動、磁鐵組、冷卻水腔與水路、背板、焊層、靶材、暗區遮蔽環、絕緣環、三道 O 環）、換靶展示台、公司展示架、精煉槽、真空爐、軋機、立式車床、接合壓合台（示意，非特定廠牌實機尺寸）",
  unit: "示意（1＝10 cm；晶圓直徑 300 mm）",
  size: { w: 40, h: 18, r: 0.6, t: 30 },
  palette, materials,
  partNames: { hv: "高壓供電接頭", lid: "上蓋與驅動", mag: "磁鐵組", water: "冷卻水腔", back: "背板", solder: "焊層", tgt: "靶材", shield: "遮蔽環", ins: "絕緣環" },
  layers, parts, anchors, actions,
  pose: { yaw0: 0, yawIso: 0, drift: 0 },
  camera: { stand: { d: 70, elev: 24, y: 7 } },
  fx: { dpr: 1, srcPx: 30, shadows: 0, fog: false, dust: false, vaporSprites: false, shimmer: false },
  info: { FY, WY, WR, RT, TGT_R, TGT_Y0, TGT_Y1, DX, SX, FACE },
};
const out = path.join(path.dirname(new URL(import.meta.url).pathname), "model.json");
fs.writeFileSync(out, JSON.stringify(model, null, 1) + "\n");
console.log(`✔ ${out}：${parts.length} 個零件、${parts.reduce((a, p) => a + Math.max(1, (p.at?.length ?? 0) + (p.grid ? p.grid.n[0] * p.grid.n[1] : 0)), 0)} 個實體（含複製）、${layers.length} 層`);

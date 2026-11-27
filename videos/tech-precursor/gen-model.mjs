// node videos/tech-precursor/gen-model.mjs → 寫 videos/tech-precursor/model.json
// 2026/11/27 tech-precursor（前驅物，系列 2 第 14 集）。構造與物理照 physics-spec.md、模組清單照 visual-spec.md。
// 單位：1＝10 cm，地板頂面 y＝0，x 向右、z 向觀眾。站點：A 氣櫃與起泡器 x0｜加熱管路 x6～20｜B 閥箱 x24｜C 腔體入口 x38｜D 晶圓表面分子 x58。
//   外形是通例（依專利圖與一般氣櫃／閥箱，示意，非特定廠牌實機）；腔體只畫入口與晶圓，不重畫整台集群機台（應材集已畫）。
import fs from "node:fs";
import path from "node:path";

const R2 = (x) => Math.round(x * 1000) / 1000;
const D2R = Math.PI / 180;
const pol = (aDeg, r) => [R2(r * Math.cos(aDeg * D2R)), R2(r * Math.sin(aDeg * D2R))]; // (x, z)
const palette = {
  floorC: "#C9D2DE", panel: "#F3F5F8", panel2: "#E2E8F0", seam: "#8E9BB0", band: "#24324C", steel: "#7D8CA6", steel2: "#A9B5C7", dark: "#3E4A60",
  glassC: "#BFD3F2", lampY: "#F2B632", lampG: "#2FBF71", lampR: "#E5484D", screen: "#5B8DEF", rubber: "#2B2F36", gold: "#C9A24A", knurl: "#5C6678", estop: "#D93A2B",
  tgtC: "#D2793F", tgtFaceC: "#F0A066", tgtDarkC: "#8C4A22", solderC: "#E8ECF2", backC: "#B9C2CF", ceramic: "#F1EEE6", copperC: "#C9794A", waterC: "#4DA3FF", waterD: "#2F7FE0",
  magBody: "#2B2F36", magN: "#E0472F", magS: "#2F7FE0", yokeC: "#8D97A8", plasmaC: "#9B7BFF", chuckC: "#D5DCE6", plasmaE: "#C9B8FF", ionC: "#7EC8FF", eleC: "#FFE08A", argonC: "#9FD8FF", hitC: "#FFB45A",
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
  plasma: glowM("plasmaC", 0.5, 1.2), plasmaIn: glowM("plasmaE", 0.75, 1.3), chuckM: M("std", "chuckC", { rough: 0.3, metal: 0.85, env: 0.8, tex: "brushed", texScale: 1.5 }), shieldM: M("std", "seam", { rough: 0.85, metal: 0.45, env: 0.3 }), ion: glowM("ionC", 0.95), ele: glowM("eleC", 0.95), argon: glowM("argonC", 0.7), hit: glowM("hitC", 0.9), field: glowM("fieldC", 0.8),
  atom: glowM("tgtFaceC", 0.95), film: M("std", "filmC", { rough: 0.3, metal: 0.85, env: 0.8 }), warn: glowM("warnC", 0.9, 0.9),
  molten: M("std", "moltenC", { emissive: "moltenC", ei: 1, rough: 0.6, metal: 0.2 }), hot: M("std", "hotC", { emissive: "hotC", ei: 0.55, rough: 0.5, metal: 0.4 }), heatRing: glowM("hotC", 0.85, 1),
  electrolyte: M("phys", "elecT", { rough: 0.05, metal: 0, clearcoat: 1, opacity: 0.4, env: 0.5 }), plateDark: M("std", "plateDark", { rough: 0.55, metal: 0.5, env: 0.4 }),
  pcb: M("std", "pcbC", { rough: 0.5, metal: 0.1 }), chip: M("std", "chipC", { rough: 0.35, metal: 0.2, env: 0.4 }), trace: M("std", "traceC", { rough: 0.3, metal: 0.9, env: 0.6 }), conn: M("std", "connC", { rough: 0.5, metal: 0.2 }),
  cuBright: M("std", "cuBright", { rough: 0.25, metal: 0.95, env: 0.8 }), flake: glowM("chipFlake", 0.95, 0.4), mist: glowM("argonC", 0.55, 0.6), cuIon: glowM("cuBright", 0.9, 0.7),
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

// ═════ 追加色票與材質 ═════
Object.assign(palette, {
  liqC: "#CFE6F2", liqTopC: "#E8F4FA", jackTan: "#D6B677", jackDark: "#A7844A", hotTape: "#FF8A2B", sinterC: "#9AA3AF", vapC: "#FF9A3C", crustC: "#EDE6D8", crustOr: "#E8A15C",
  gaugeF: "#F4F1E6", alC: "#F29A4A", meC: "#8A94A3", ohO: "#E5484D", ohH: "#F4F6FA", h2oC: "#3FC1E8", ch4C: "#98A2B3", n2C: "#B8C4D4", filmC2: "#E39A64", subC: "#9DB1D1", subD: "#6C84AC",
  coldPipeC: "#6FA8E0", hotPipeC: "#E06A3A", bubC: "#F6FBFF", warnY: "#F2B632", boxGreen: "#2C6E55", cabC: "#EDEFF3", cabDarkC: "#B4BCC9", brassC: "#C8A24A", rubberC: "#2B2F36", meshC: "#B9C0CA", siliC: "#C44536", jkBoxC: "#7C8591",
});
Object.assign(materials, {
  liq: M("phys", "liqC", { rough: 0.05, metal: 0, clearcoat: 1, opacity: 0.55, env: 0.5 }), liqTop: M("std", "liqTopC", { rough: 0.1, metal: 0.3, opacity: 0.9, env: 0.8 }),
  jackTan: M("std", "jackTan", { rough: 0.95, metal: 0, env: 0.1 }), jackMesh: M("std", "meshC", { rough: 0.55, metal: 0.75, env: 0.5, tex: "brushed", texScale: 7 }), siliR: M("std", "siliC", { rough: 0.85, metal: 0 }), jkBox: M("std", "jkBoxC", { rough: 0.4, metal: 0.6, env: 0.4 }), jackDark: M("std", "jackDark", { rough: 0.9, metal: 0 }),
  tape: glowM("hotTape", 0.95, 0.5), sinter: M("std", "sinterC", { rough: 1, metal: 0.4, env: 0.2 }), vap: glowM("vapC", 0.9, 0.9), vapBub: glowM("vapC", 0.75, 0.7),
  crust: M("std", "crustC", { rough: 0.95, metal: 0 }), crustOr: M("std", "crustOr", { rough: 0.9, metal: 0.1 }), gaugeF: M("std", "gaugeF", { rough: 0.5, metal: 0 }),
  alM: M("std", "alC", { rough: 0.35, metal: 0.3, env: 0.5 }), meM: M("std", "meC", { rough: 0.5, metal: 0.1 }), ohO: M("std", "ohO", { rough: 0.4, metal: 0.1 }), ohH: M("std", "ohH", { rough: 0.4, metal: 0.1 }),
  h2o: glowM("h2oC", 0.95, 0.5), ch4: glowM("ch4C", 0.85, 0.2), n2: glowM("n2C", 0.8, 0.3), bub: glowM("bubC", 0.8, 0.35), filmM: M("std", "filmC2", { rough: 0.3, metal: 0.6, opacity: 0.55, env: 0.6 }),
  sub: M("std", "subC", { rough: 0.35, metal: 0.55, env: 0.6 }), subD: M("std", "subD", { rough: 0.5, metal: 0.4 }), coldPipe: M("std", "coldPipeC", { rough: 0.35, metal: 0.6, env: 0.4 }), hotPipe: M("std", "hotPipeC", { rough: 0.35, metal: 0.6, env: 0.4 }),
  warnY: M("std", "warnY", { rough: 0.5, metal: 0, emissive: "warnY", ei: 0.2 }), boxGreen: M("std", "boxGreen", { rough: 0.5, metal: 0.1 }), cab: M("std", "cabC", { rough: 0.55, metal: 0.1, env: 0.3 }), cabDark: M("std", "cabDarkC", { rough: 0.6, metal: 0.3, env: 0.3 }),
  brass: M("std", "brassC", { rough: 0.3, metal: 0.9, env: 0.7 }), bubGlass: M("phys", "glassC", { rough: 0.05, metal: 0, clearcoat: 1, opacity: 0.25, env: 0.6 }),
});
const FY = 0, SX = { A: 0, B: 24, C: 38, D: 58 };
const A = (layer, p, dx, dy) => ({ layer, p, dx, dy });
const lampPos = (id, layer, x, y, z, mat) => SPH(id, layer, 0.07, x, y, z, mat);
// 管線：一段一段直管＋肘接頭球，沿折線（絕對座標）。回傳每段 id，給保溫套與加熱帶對位
const PIPE = (id, layer, pts, r, mat, o = {}) => {
  for (let i = 0; i < pts.length - 1; i++) {
    const [x0, y0, z0] = pts[i], [x1, y1, z1] = pts[i + 1];
    const dx = x1 - x0, dy = y1 - y0, dz = z1 - z0, L = Math.hypot(dx, dy, dz);
    const rot = Math.abs(dx) > 1e-6 ? HX : Math.abs(dy) > 1e-6 ? V : [0, 0, 0];
    P({ id: `${id}${i}`, layer, shape: "cyl", size: [r, R2(L)], rot, pos: [R2((x0 + x1) / 2), R2((y0 + y1) / 2), R2((z0 + z1) / 2)], mat, ...o });
    if (i > 0) SPH(`${id}J${i}`, layer, r * 1.12, x0, y0, z0, mat);
  }
};

// ═════ 地板與站名 ═════
LAY("floor", [140, 2, 40, FY], true);
P({ id: "floor", layer: "floor", shape: "slab", size: [140, 0.5, 40], r: 0.2, pos: [40, R2(FY - 0.25), 0], mat: "floor" });
P({ id: "floorSeam", layer: "floor", shape: "slab", size: [140, 0.04, 0.1], pos: [40, R2(FY + 0.01), 0], at: Array.from({ length: 7 }, (_, i) => [0, 0, -16 + i * 5.3]), mat: "seam" });

// ═════ 站 A：氣櫃（外殼可淡成幽靈）＋起泡器（本集爆炸主角） ═════
const CW = 5, CD = 3.2, CH = 9.6, CB = 0.5;
LAY("cabBase", [11, 0.5, 0, 0.25]); LAY("cabWall", [10.4, 9.8, 0, 5.2]); LAY("cabDoor", [10.4, 9.6, 0, 5.2]);
BOX("cabPlinth", "cabBase", -CW - 0.2, CW + 0.2, 0, CB, -CD - 0.2, CD + 0.2, "band");
P({ id: "cabFoot", layer: "cabBase", shape: "cyl", size: [0.25, 0.14], rot: V, pos: [0, 0.07, 0], at: [[-4.6, 0, -2.8], [4.6, 0, -2.8], [-4.6, 0, 2.8], [4.6, 0, 2.8]], mat: "dark" });
BOX("cabFloorPl", "cabBase", -CW + 0.1, CW - 0.1, CB, CB + 0.08, -CD + 0.1, CD - 0.1, "cabDark");
P({ id: "cabFloorBolt", layer: "cabBase", shape: "cyl", size: [0.07, 0.04], rot: V, pos: [0, CB + 0.1, 0], at: [[-4.6, 0, -2.7], [4.6, 0, -2.7], [-4.6, 0, 2.7], [4.6, 0, 2.7], [0, 0, -2.7], [0, 0, 2.7]], mat: "steel" });
BOX("cabBack", "cabWall", -CW, CW, CB, CH, -CD, -CD + 0.12, "cab");
BOX("cabLeft", "cabWall", -CW, -CW + 0.12, CB, CH, -CD, CD, "cab");
BOX("cabRight", "cabWall", CW - 0.12, CW, CB, CH, -CD, CD, "cab");
BOX("cabTop", "cabWall", -CW, CW, CH - 0.12, CH, -CD, CD, "cab");
P({ id: "cabSeam", layer: "cabWall", shape: "box", size: [0.04, CH - CB, 0.04], pos: [0, 5.05, -CD + 0.13], at: [[-2.5, 0, 0], [2.5, 0, 0]], mat: "seam" });
P({ id: "cabScrew", layer: "cabWall", shape: "cyl", size: [0.05, 0.03], rot: [0, 0, 0], pos: [0, 0, -CD + 0.14], at: grid(-4.6, 4.6, 5, 1.0, 9.0, 4, 0).map(([x, y]) => [x, y, 0]), mat: "steel" });
// 頂部排氣口＋風量指示、氣櫃銘牌
VT("cabDuct", "cabWall", 0.9, 0.78, CH, CH + 1.1, "steel2", { x: 3.0, z: -1.0 });
VT("cabDuctFl", "cabWall", 1.05, 0.78, CH + 0.95, CH + 1.1, "steel2", { x: 3.0, z: -1.0 });
BOX("cabFlowInd", "cabWall", 3.4, 4.6, CH - 0.5, CH - 0.05, CD - 0.05, CD + 0.08, "dark");
BOX("cabFlowBar", "cabWall", 3.5, 4.2, CH - 0.4, CH - 0.28, CD + 0.08, CD + 0.1, "lampG");
BOX("cabLeakDet", "cabWall", -0.4, 0.4, CH - 0.45, CH - 0.12, -1.2, -0.7, "dark"); SPH("cabLeakLed", "cabWall", 0.1, 0, CH - 0.5, -0.95, "lampR");
BOX("cabGland", "cabWall", CW - 0.02, CW + 0.18, 6.7, 7.7, -0.6, 0.6, "steel2");
P({ id: "cabGlandBolt", layer: "cabWall", shape: "cyl", size: [0.06, 0.06], rot: HX, pos: [CW + 0.2, 7.2, 0], at: [[0, 0.35, 0.35], [0, 0.35, -0.35], [0, -0.35, 0.35], [0, -0.35, -0.35]], mat: "steel" });
// 前門（滑開）：框、觀察窗、把手、鉸鍊、警示標籤、緊急鈕、狀態燈
BOX("doorFrame", "cabDoor", -CW, CW, CB, CH, CD, CD + 0.14, "cab");
P({ id: "doorWindow", layer: "cabDoor", shape: "box", size: [8.2, 6.4, 0.08], pos: [0, 5.2, CD + 0.16], mat: "window" });
BOX("doorWinFrameT", "cabDoor", -4.3, 4.3, 8.4, 8.55, CD + 0.14, CD + 0.24, "steel2"); BOX("doorWinFrameB", "cabDoor", -4.3, 4.3, 1.85, 2.0, CD + 0.14, CD + 0.24, "steel2");
BOX("doorWinFrameL", "cabDoor", -4.3, -4.15, 1.85, 8.55, CD + 0.14, CD + 0.24, "steel2"); BOX("doorWinFrameR", "cabDoor", 4.15, 4.3, 1.85, 8.55, CD + 0.14, CD + 0.24, "steel2");
P({ id: "doorHandle", layer: "cabDoor", shape: "box", size: [0.22, 1.6, 0.22], pos: [-4.55, 5.2, CD + 0.28], mat: "steel2" });
P({ id: "doorHinge", layer: "cabDoor", shape: "box", size: [0.3, 0.9, 0.2], pos: [4.9, 0, CD + 0.1], at: [[0, 2.2, 0], [0, 5.2, 0], [0, 8.2, 0]], mat: "dark" });
BOX("doorWarn", "cabDoor", 1.6, 4.4, 0.7, 1.55, CD + 0.14, CD + 0.18, "warnY");
BOX("doorWarnText", "cabDoor", 1.9, 4.1, 0.95, 1.3, CD + 0.18, CD + 0.2, "dark");
VC("doorEstop", "cabDoor", 0.28, 8.65, 8.95, "estop", { x: -3.8, z: CD + 0.3 }); P({ id: "doorEstopRim", layer: "cabDoor", shape: "tube", size: [0.42, 0.3, 0.12], rot: V, pos: [-3.8, 8.6, CD + 0.2], mat: "warnY" });
P({ id: "doorLed", layer: "cabDoor", shape: "sphere", size: [0.08], pos: [-2.4, 8.8, CD + 0.18], at: [[0, 0, 0], [0.5, 0, 0], [1.0, 0, 0]], mat: "lampG" });

// 站座
LAY("bbBase", [4.6, 0.4, 0, 0.62]);
VC("bbBasePl", "bbBase", 2.1, CB + 0.08, 0.8, "steel2");
VT("bbBaseRing", "bbBase", 2.1, 1.98, 0.8, 0.88, "dark");
P({ id: "bbBaseBolt", layer: "bbBase", shape: "cyl", size: [0.07, 0.06], rot: V, pos: [0, 0.82, 0], at: RING(8, 2.04), mat: "steel" });

// 起泡器容器（外殼可淡成半透明）：圓筒、底、液位計、銘牌、警示標籤
const BY0 = 0.9, BY1 = 5.0, BR = 1.5;
LAY("vshell", [3.4, 4.2, 0, 3.0]); LAY("liq", [3.0, 2.3, 0, 2.0]);
VT("vsWall", "vshell", BR, BR - 0.07, BY0, BY1, "steel2");
VC("vsBottom", "vshell", BR, BY0 - 0.05, BY0 + 0.08, "steel");
VT("vsFlange", "vshell", BR + 0.0, BR - 0.3, BY1 - 0.12, BY1, "steel2");
P({ id: "vsBolt", layer: "vshell", shape: "cyl", size: [0.07, 0.07], rot: V, pos: [0, BY1 + 0.02, 0], at: RING(8, 1.28, 22), mat: "steel" });
VT("vsWeld", "vshell", BR + 0.015, BR - 0.02, 2.4, 2.46, "dark");
BOX("vsPlate", "vshell", -0.75, 0.75, 3.2, 4.0, BR - 0.01, BR + 0.05, "steel2"); BOX("vsPlateText", "vshell", -0.55, 0.55, 3.45, 3.55, BR + 0.05, BR + 0.07, "dark"); BOX("vsPlateText2", "vshell", -0.55, 0.3, 3.7, 3.78, BR + 0.05, BR + 0.07, "dark");
BOX("vsWarn", "vshell", -0.6, 0.6, 1.2, 2.0, BR - 0.01, BR + 0.04, "warnY"); BOX("vsWarnText", "vshell", -0.4, 0.4, 1.45, 1.75, BR + 0.04, BR + 0.06, "dark");
VC("vsSightT", "vshell", 0.07, 1.1, 3.9, "bubGlass", { x: 1.7, z: 0.0 }); BOX("vsSightClampT", "vshell", 1.58, 1.82, 1.0, 1.2, -0.1, 0.1, "steel"); BOX("vsSightClampB", "vshell", 1.58, 1.82, 3.8, 4.0, -0.1, 0.1, "steel");
// 液體與頂部空間
VC("liqBody", "liq", BR - 0.1, BY0 + 0.1, 3.1, "liq");
VC("liqSurf", "liq", BR - 0.1, 3.1, 3.13, "liqTop");
P({ id: "liqSight", layer: "liq", shape: "cyl", size: [0.05, 2.0], rot: V, pos: [1.7, 2.1, 0], mat: "liq" });

// 蓋（頂蓋法蘭＋進氣閥＋出氣閥＋致動器＋接頭＋彎管）：爆炸時整組往上
LAY("lid", [4.6, 4.2, 0, 7.0]);
VC("lidFlange", "lid", BR, BY1, BY1 + 0.25, "steel2");
VT("lidOring", "lid", 1.12, 1.04, BY1 - 0.02, BY1 + 0.02, "rubber");
P({ id: "lidBolt", layer: "lid", shape: "cyl", size: [0.07, 0.09], rot: V, pos: [0, BY1 + 0.29, 0], at: RING(8, 1.28, 22), mat: "steel" });
for (const [nm, vx, col] of [["In", -0.75, "lampG"], ["Out", 0.75, "lampY"]]) {
  VC(`lv${nm}Body`, "lid", 0.3, BY1 + 0.25, 5.95, "steel2", { x: vx });
  VT(`lv${nm}Hex`, "lid", 0.36, 0.2, 5.55, 5.7, "steel", { x: vx });
  VC(`lv${nm}Act`, "lid", 0.4, 5.95, 6.85, "dark", { x: vx });
  VT(`lv${nm}ActRim`, "lid", 0.42, 0.3, 6.4, 6.46, "steel2", { x: vx });
  P({ id: `lv${nm}Stem`, layer: "lid", shape: "cyl", size: [0.05, 0.3], rot: V, pos: [vx, 7.0, 0], mat: "steel2" });
  P({ id: `lv${nm}Wheel`, layer: "lid", shape: "cyl", size: [0.26, 0.05], rot: V, pos: [vx, 7.17, 0], mat: "steel2" });
  SPH(`lv${nm}Led`, "lid", 0.07, vx + 0.4, 6.6, 0.1, col);
  P({ id: `lv${nm}Air`, layer: "lid", shape: "cyl", size: [0.04, 0.9], rot: HX, pos: [vx, 6.55, 0.35], mat: "pipeB" });
}
// 進氣：從 MFC 來的彎管（接進氣閥）；出氣：彎管往右出櫃，穿過氣櫃右壁
PIPE("lidIn", "lid", [[-0.75, 5.95, 0], [-0.75, 7.3, 0], [-1.95, 7.3, 0]], 0.12, "steel");
PIPE("lidOut", "lid", [[0.75, 5.95, 0], [0.75, 7.2, 0], [6.2, 7.2, 0]], 0.12, "steel");
P({ id: "lidOutClamp", layer: "lid", shape: "tube", size: [0.2, 0.12, 0.14], rot: HX, pos: [3.6, 7.2, 0], at: [[0, 0, 0], [1.6, 0, 0]], mat: "dark" });
P({ id: "lidShort", layer: "lid", shape: "cyl", size: [0.1, 0.5], rot: V, pos: [0.75, 4.75, 0], mat: "steel" });
// 插管：從進氣閥下伸到液面下，末端接燒結頭（分散成細氣泡）
LAY("dip", [1.0, 4.5, -0.75, 3.1]);
P({ id: "dipTube", layer: "dip", shape: "cyl", size: [0.1, 4.2], rot: V, pos: [-0.75, 3.3, 0], mat: "steel" });
VT("dipCollar", "dip", 0.19, 0.1, 5.2, 5.4, "steel2", { x: -0.75 });
VC("dipHead", "dip", 0.19, 1.2, 1.5, "sinter", { x: -0.75 });
P({ id: "dipPores", layer: "dip", shape: "sphere", size: [0.035], pos: [-0.75, 1.35, 0], at: RING(6, 0.2).concat(RING(6, 0.2, 30).map(([x, y, z]) => [x, 0.1, z])), mat: "dark" });
VC("dipTip", "dip", 0.1, 1.15, 1.2, "steel");

// 加熱套（金屬網＋矽膠包覆式加熱套，不是木桶）：銀色編織網外層、紅色矽膠上下收邊、垂直縫線與魔鬼氈接縫、垂直發熱線（會發光）、側邊接線盒＋電源線、前方控溫器＋溫控標籤、探棒
LAY("jack", [4.0, 3.0, 0, 2.3]);
VT("jkBody", "jack", 1.82, 1.6, 1.0, 3.6, "jackMesh");
P({ id: "jkSeam", layer: "jack", shape: "box", size: [0.05, 2.5, 0.05], pos: [0, 2.3, 0], at: RING(12, 1.835, 15), mat: "dark" });
P({ id: "jkBand0", layer: "jack", shape: "box", size: [0.07, 2.4, 0.07], pos: [0, 2.3, 0], at: RING(4, 1.845, 0), mat: "tape" });
P({ id: "jkBand1", layer: "jack", shape: "box", size: [0.07, 2.4, 0.07], pos: [0, 2.3, 0], at: RING(4, 1.845, 45), mat: "tape" });
P({ id: "jkBand2", layer: "jack", shape: "box", size: [0.07, 2.4, 0.07], pos: [0, 2.3, 0], at: RING(4, 1.845, 22.5).concat(RING(4, 1.845, 67.5)), mat: "tape" });
VT("jkTop", "jack", 1.86, 1.6, 3.5, 3.62, "siliR"); VT("jkBot", "jack", 1.86, 1.6, 1.0, 1.12, "siliR");
BOX("jkVelcro", "jack", 1.35, 1.65, 1.2, 3.4, 1.18, 1.46, "dark");
P({ id: "jkBuckle", layer: "jack", shape: "box", size: [0.2, 0.12, 0.06], pos: [0, 0, 0], at: [[0.3, 1.5, 1.8], [0.3, 3.1, 1.8]], mat: "steel2" });
BOX("jkCtl", "jack", -0.55, 0.55, 1.55, 2.4, 1.86, 2.24, "jkBox");
BOX("jkCtlScreen", "jack", -0.42, 0.42, 1.98, 2.3, 2.24, 2.26, "screen"); BOX("jkCtlBar", "jack", -0.32, 0.22, 2.1, 2.16, 2.26, 2.28, "lampY");
P({ id: "jkCtlKnob", layer: "jack", shape: "cyl", size: [0.07, 0.05], rot: [0, 0, 0], pos: [0, 1.72, 2.26], at: [[-0.28, 0, 0], [0, 0, 0], [0.28, 0, 0]], mat: "steel2" });
BOX("jkTag", "jack", -0.5, 0.5, 1.1, 1.45, 1.86, 1.9, "warnY"); BOX("jkTagText", "jack", -0.38, 0.38, 1.2, 1.35, 1.9, 1.92, "dark");
BOX("jkJb", "jack", 1.95, 2.75, 1.7, 2.45, -0.4, 0.4, "jkBox");
P({ id: "jkJbScrew", layer: "jack", shape: "cyl", size: [0.05, 0.04], rot: HX, pos: [2.77, 0, 0], at: [[0, 1.82, 0.28], [0, 2.33, 0.28], [0, 1.82, -0.28], [0, 2.33, -0.28]], mat: "steel" });
P({ id: "jkJbGland", layer: "jack", shape: "tube", size: [0.2, 0.12, 0.3], rot: V, pos: [2.35, 2.6, 0], mat: "steel2" });
PIPE("jkWire", "jack", [[2.35, 2.75, 0], [2.35, 3.4, 0], [2.0, 3.9, -0.5]], 0.07, "conn");
P({ id: "jkProbe", layer: "jack", shape: "cyl", size: [0.04, 1.4], rot: V, pos: [-1.2, 3.9, 0], mat: "steel2" });
BOX("jkProbeHead", "jack", -1.35, -1.05, 4.5, 4.75, -0.12, 0.12, "dark");
P({ id: "jkCable", layer: "jack", shape: "cyl", size: [0.04, 1.3], rot: HX, pos: [-0.5, 2.3, 1.95], mat: "conn" });

// 載氣：減壓閥＋雙壓力錶（站外左側固定）；MFC＋過濾器＋連管（爆炸時往左拉）
LAY("gsrc", [4.6, 2.4, -12, 7.3]); LAY("mfc", [5.2, 1.8, -3.4, 7.3]);
PIPE("gsrcPipe", "gsrc", [[-15, 7.3, 0], [-8.8, 7.3, 0]], 0.12, "steel");
BOX("gsrcBody", "gsrc", -11.2, -9.2, 6.7, 7.9, -0.55, 0.55, "brass");
for (const [i, z] of [-0.65, 0.65].entries()) { P({ id: `gauge${i}`, layer: "gsrc", shape: "cyl", size: [0.5, 0.18], rot: [0, 0, 0], pos: [-10.2, 7.9, z * 1.0], mat: "steel2" }); P({ id: `gaugeFace${i}`, layer: "gsrc", shape: "cyl", size: [0.42, 0.04], rot: [0, 0, 0], pos: [-10.2, 7.9, z + (z > 0 ? 0.1 : -0.1)], mat: "gaugeF" }); }
P({ id: "gsrcKnob", layer: "gsrc", shape: "cyl", size: [0.28, 0.2], rot: V, pos: [-10.2, 8.0, 0], mat: "knurl" });
PIPE("gsrcPipe2", "gsrc", [[-9.2, 7.3, 0], [-8.8, 7.3, 0]], 0.12, "steel");
// 過濾器（燒結濾芯）＋MFC
P({ id: "filBody", layer: "mfc", shape: "cyl", size: [0.34, 1.0], rot: HX, pos: [-4.5, 7.3, 0], mat: "steel2" });
P({ id: "filCap", layer: "mfc", shape: "tube", size: [0.4, 0.28, 0.14], rot: HX, pos: [-5.05, 7.3, 0], at: [[0, 0, 0], [1.1, 0, 0]], mat: "steel" });
BOX("mfcBody", "mfc", -3.7, -2.1, 6.9, 7.7, -0.45, 0.45, "steel2");
BOX("mfcCap", "mfc", -3.5, -2.3, 7.7, 8.4, -0.4, 0.4, "dark");
P({ id: "mfcConn", layer: "mfc", shape: "cyl", size: [0.16, 0.35], rot: [0, 0, 0], pos: [-2.9, 8.05, 0.55], mat: "steel2" });
P({ id: "mfcCable", layer: "mfc", shape: "cyl", size: [0.06, 1.0], rot: [0, 0, 0], pos: [-2.9, 8.05, 1.2], mat: "conn" });
BOX("mfcPlate", "mfc", -3.5, -2.4, 6.98, 7.35, 0.45, 0.5, "gold"); BOX("mfcPlateText", "mfc", -3.3, -2.6, 7.1, 7.25, 0.5, 0.52, "dark");
SPH("mfcLed", "mfc", 0.07, -2.5, 7.5, 0.48, "lampG");
P({ id: "mfcSensor", layer: "mfc", shape: "cyl", size: [0.06, 0.9], rot: HX, pos: [-2.9, 7.95, -0.5], mat: "steel2" });
PIPE("mfcPipe", "mfc", [[-4.0, 7.3, 0], [-3.7, 7.3, 0]], 0.12, "steel");
PIPE("mfcPipe2", "mfc", [[-2.1, 7.3, 0], [-1.9, 7.3, 0]], 0.12, "steel");
P({ id: "mfcNut", layer: "mfc", shape: "tube", size: [0.2, 0.12, 0.18], rot: HX, pos: [-2.0, 7.3, 0], mat: "steel2" });
P({ id: "mfcMount", layer: "mfc", shape: "box", size: [0.8, 0.12, 1.0], pos: [-2.9, 6.8, 0], mat: "dark" });

// ═════ 加熱管路（氣櫃 → 閥箱）：細管、三段保溫套（可剝開）、加熱帶、熱電偶、管夾 ═════
LAY("hline", [15.4, 5.6, 13, 4.7]);
PIPE("hp", "hline", [[6.2, 7.2, 0], [6.2, 2.2, 0], [20.9, 2.2, 0]], 0.13, "steel");
P({ id: "hpVcr", layer: "hline", shape: "tube", size: [0.22, 0.12, 0.2], rot: HX, pos: [6.2, 7.2, 0], at: [[0, 0, 0]], mat: "steel2" });
P({ id: "hpVcrB", layer: "hline", shape: "tube", size: [0.2, 0.12, 0.18], rot: HX, pos: [20.3, 2.2, 0], mat: "steel2" });
P({ id: "hpClampV", layer: "hline", shape: "box", size: [0.4, 0.14, 0.4], pos: [6.2, 0, 0], at: [[0, 3.2, 0], [0, 4.6, 0], [0, 6.0, 0]], mat: "dark" });
const SLV = [[7.2, 10.8], [11.6, 15.2], [16.0, 19.6]];
SLV.forEach(([a, b], i) => {
  LAY(`hjk${i}`, [3.8, 0.9, (a + b) / 2, 2.2]);
  HXC(`hjkBody${i}`, `hjk${i}`, 0.36, a, b, 2.2, 0, "jackTan");
  P({ id: `hjkTape${i}`, layer: `hjk${i}`, shape: "tube", size: [0.39, 0.36, 0.07], rot: HX, pos: [a + 0.3, 2.2, 0], at: Array.from({ length: 11 }, (_, j) => [j * 0.3, 0, 0]), mat: "tape" });
  P({ id: `hjkEnd${i}`, layer: `hjk${i}`, shape: "tube", size: [0.4, 0.3, 0.1], rot: HX, pos: [a, 2.2, 0], at: [[0, 0, 0], [b - a, 0, 0]], mat: "jackDark" });
  BOX(`hjkTc${i}`, `hjk${i}`, (a + b) / 2 - 0.2, (a + b) / 2 + 0.2, 2.56, 2.8, -0.2, 0.2, "boxGreen");
  P({ id: `hjkTcWire${i}`, layer: `hjk${i}`, shape: "cyl", size: [0.03, 0.6], rot: HX, pos: [(a + b) / 2 + 0.5, 2.78, 0], mat: "conn" });
  P({ id: `hjkClamp${i}`, layer: `hjk${i}`, shape: "tube", size: [0.42, 0.34, 0.12], rot: HX, pos: [a + 0.9, 2.2, 0], at: [[0, 0, 0], [(b - a) - 1.8, 0, 0]], mat: "dark" });
  P({ id: `hjkLabel${i}`, layer: `hjk${i}`, shape: "box", size: [0.5, 0.2, 0.02], pos: [(a + b) / 2 - 0.9, 2.2, 0.37], mat: "warnY" });
});

// 純化過濾（規格第 14 項）：加熱管路起點的微粒過濾器（外殼可淡成幽靈、燒結濾芯沿管軸抽出；擋下氣泡夾帶的微小液滴與微粒）
LAY("pfilShell", [1.6, 2.4, 6.2, 4.4]); LAY("pfilCore", [1.0, 1.8, 6.2, 4.4]);
VT("pfShell", "pfilShell", 0.66, 0.58, 3.4, 5.4, "steel2", { x: 6.2 });
VC("pfCapT", "pfilShell", 0.7, 5.4, 5.52, "steel", { x: 6.2 }); VC("pfCapB", "pfilShell", 0.7, 3.28, 3.4, "steel", { x: 6.2 });
P({ id: "pfBolt", layer: "pfilShell", shape: "cyl", size: [0.05, 0.05], rot: V, pos: [6.2, 5.56, 0], at: RING(6, 0.55, 10), mat: "steel" });
P({ id: "pfVcr", layer: "pfilShell", shape: "tube", size: [0.2, 0.12, 0.16], rot: V, pos: [6.2, 0, 0], at: [[0, 5.7, 0], [0, 3.1, 0]], mat: "steel2" });
BOX("pfPlate", "pfilShell", 5.7, 6.7, 4.1, 4.7, 0.62, 0.66, "steel"); BOX("pfPlateText", "pfilShell", 5.85, 6.55, 4.3, 4.45, 0.66, 0.68, "dark");
VT("pfCore", "pfilCore", 0.46, 0.3, 3.6, 5.2, "sinter", { x: 6.2 });
VT("pfCoreRing", "pfilCore", 0.5, 0.44, 3.55, 3.65, "dark", { x: 6.2 }); VT("pfCoreRing2", "pfilCore", 0.5, 0.44, 5.15, 5.25, "dark", { x: 6.2 });
P({ id: "pfGrit", layer: "pfilCore", shape: "sphere", size: [0.04], pos: [6.2, 0, 0], at: RING(9, 0.47, 5).map(([x, , z], i) => [x, 3.8 + (i % 4) * 0.35, z]), mat: "dark" });

// ═════ 站 B：閥箱（外框、前壁可淡掉）、閥塊底座（閥座＋流道）、隔膜層、閥塊上層（三個氣動閥）、加熱棒 ═════
const BX0 = 19.5, BX1 = 28.6, BZ = 2.8, BH = 3.3;
LAY("vbox", [9.4, 3.4, 24, 1.7]); LAY("vfront", [9.4, 3.2, 24, 1.7]);
BOX("vbPlate", "vbox", BX0, BX1, 0, 0.2, -BZ, BZ, "band");
BOX("vbBack", "vbox", BX0, BX1, 0.2, BH, -BZ, -BZ + 0.1, "panel2");
BOX("vbLeft", "vbox", BX0, BX0 + 0.1, 0.2, BH, -BZ, BZ, "panel2");
BOX("vbRight", "vbox", BX1 - 0.1, BX1, 0.2, BH, -BZ, BZ, "panel2");
BOX("vbFront", "vfront", BX0, BX1, 0.2, BH, BZ - 0.1, BZ, "panel2");
P({ id: "vbScrew", layer: "vbox", shape: "cyl", size: [0.05, 0.03], rot: [0, 0, 0], pos: [24, 0, -BZ + 0.12], at: [[-4.2, 0.6, 0], [4.2, 0.6, 0], [-4.2, 2.9, 0], [4.2, 2.9, 0], [0, 2.9, 0]], mat: "steel" });
BOX("vbVent", "vfront", 20.2, 22.2, 2.4, 3.0, BZ, BZ + 0.04, "dark");
P({ id: "vbVentSlot", layer: "vfront", shape: "box", size: [1.7, 0.04, 0.02], pos: [21.2, 0, BZ + 0.05], at: [[0, 2.5, 0], [0, 2.65, 0], [0, 2.8, 0]], mat: "seam" });
BOX("vbName", "vfront", 25.4, 28.0, 0.5, 1.1, BZ, BZ + 0.04, "steel2"); BOX("vbNameText", "vfront", 25.7, 27.5, 0.75, 0.85, BZ + 0.04, BZ + 0.06, "dark");
P({ id: "vbLed", layer: "vfront", shape: "sphere", size: [0.09], pos: [26.0, 2.7, BZ + 0.05], at: [[0, 0, 0], [0.5, 0, 0], [1.0, 0, 0]], mat: "lampG" });
// 閥塊底座（固定）：流道槽與三個閥座環
LAY("vbase", [7.0, 1.8, 24, 1.5]);
BOX("vbaseBlock", "vbase", 20.8, 27.2, 0.7, 2.4, -1.4, 1.4, "steel2");
BOX("vbaseChan", "vbase", 21.0, 27.0, 2.36, 2.42, -0.12, 0.12, "dark");
for (const [i, x] of [22.2, 24.0, 25.8].entries()) { VT(`vseat${i}`, "vbase", 0.4, 0.27, 2.4, 2.5, "brass", { x }); VC(`vport${i}`, "vbase", 0.15, 2.41, 2.46, "dark", { x }); }
P({ id: "vbaseBolt", layer: "vbase", shape: "cyl", size: [0.08, 0.1], rot: V, pos: [0, 2.43, 0], at: [[21.1, 0, 1.15], [21.1, 0, -1.15], [26.9, 0, 1.15], [26.9, 0, -1.15], [24.0, 0, 1.2], [24.0, 0, -1.2]], mat: "steel" });
P({ id: "vbaseHeat", layer: "vbase", shape: "cyl", size: [0.16, 1.6], rot: HX, pos: [24, 1.0, 0.8], mat: "tape" });
P({ id: "vbaseHeat2", layer: "vbase", shape: "cyl", size: [0.16, 1.6], rot: HX, pos: [24, 1.0, -0.8], mat: "tape" });
// 隔膜（每路一片＋彈簧＋推桿）：爆炸時分開；A 路運作時一開一關
for (const [i, nm] of ["A", "B", "P"].entries()) {
  const x = [22.2, 24.0, 25.8][i];
  LAY(`vdia${nm}`, [1.0, 1.2, x, 2.8]);
  VC(`diaDisc${nm}`, `vdia${nm}`, 0.42, 2.5, 2.55, "steel2", { x }); VT(`diaRim${nm}`, `vdia${nm}`, 0.46, 0.38, 2.5, 2.58, "steel", { x });
  VC(`diaStem${nm}`, `vdia${nm}`, 0.07, 2.55, 3.0, "steel2", { x });
  P({ id: `diaSpring${nm}`, layer: `vdia${nm}`, shape: "tube", size: [0.2, 0.16, 0.05], rot: V, pos: [x, 2.7, 0], at: Array.from({ length: 6 }, (_, j) => [0, j * 0.1, 0]), mat: "brass" });
}
// 閥塊上層：蓋板＋三個閥身＋氣動致動器＋指示燈＋氣管
LAY("vblock", [7.0, 2.2, 24, 3.4]);
BOX("vcap", "vblock", 20.8, 27.2, 2.5, 2.8, -1.4, 1.4, "steel2");
P({ id: "vcapBolt", layer: "vblock", shape: "cyl", size: [0.07, 0.05], rot: V, pos: [0, 2.82, 0], at: [[21.1, 0, 1.15], [21.1, 0, -1.15], [26.9, 0, 1.15], [26.9, 0, -1.15]], mat: "steel" });
for (const [i, nm] of ["A", "B", "P"].entries()) {
  const x = [22.2, 24.0, 25.8][i], col = ["lampG", "lampY", "lampR"][i];
  VC(`vbody${nm}`, "vblock", 0.46, 2.8, 3.2, "steel2", { x });
  VT(`vhex${nm}`, "vblock", 0.5, 0.36, 2.95, 3.05, "steel", { x });
  VC(`vact${nm}`, "vblock", 0.4, 3.2, 3.95, "dark", { x }); VT(`vactRim${nm}`, "vblock", 0.43, 0.34, 3.45, 3.5, "steel2", { x });
  P({ id: `vled${nm}`, layer: "vblock", shape: "sphere", size: [0.08], pos: [x, 4.0, 0.0], mat: col });
  P({ id: `vair${nm}`, layer: "vblock", shape: "cyl", size: [0.04, 0.9], rot: [0, 0, 0], pos: [x, 3.6, 0.7], mat: "pipeB" });
}
// 進氣管：B 路（反應物，青）從後方、吹淨路從前方進閥塊；出口接往腔體的加熱管
LAY("vpipes", [10.5, 3.0, 28, 2.4]);
PIPE("vpB", "vpipes", [[24.0, 1.5, -BZ - 0.6], [24.0, 1.5, -1.4]], 0.1, "pipeB"); PIPE("vpP", "vpipes", [[25.8, 1.5, BZ + 0.6], [25.8, 1.5, 1.4]], 0.1, "steel");
PIPE("vpOut", "vpipes", [[27.2, 1.7, 0], [31.5, 1.7, 0], [31.5, 5.2, 0], [38, 5.2, 0], [38, 3.55, 0]], 0.12, "steel");
P({ id: "vpOutSleeve", layer: "vpipes", shape: "cyl", size: [0.26, 3.4], rot: HX, pos: [29.4, 1.7, 0], mat: "jackTan" });
P({ id: "vpOutTape", layer: "vpipes", shape: "tube", size: [0.29, 0.26, 0.06], rot: HX, pos: [27.9, 1.7, 0], at: Array.from({ length: 10 }, (_, j) => [j * 0.3, 0, 0]), mat: "tape" });
P({ id: "vpClamp", layer: "vpipes", shape: "box", size: [0.4, 0.14, 0.4], pos: [31.5, 0, 0], at: [[0, 2.7, 0], [0, 4.4, 0]], mat: "dark" });

// ═════ 站 C：腔體入口（簡化：玻璃筒、頂蓋、進氣頭、吸盤與晶圓、抽氣口、泵） ═════
LAY("chb", [6.2, 5.2, 38, 2.6]); LAY("cwf", [3.4, 1.2, 38, 1.0]); LAY("cpump", [3.0, 1.6, 45.2, 0.8]);
VC("cBase", "chb", 3.0, 0, 0.4, "band"); VT("cWall", "chb", 2.7, 2.62, 0.4, 3.2, "window"); VT("cFlangeT", "chb", 3.0, 2.2, 3.2, 3.45, "steel2"); VT("cFlangeB", "chb", 3.0, 2.2, 0.4, 0.6, "steel2");
VC("cLid", "chb", 2.75, 3.45, 3.62, "steel2"); P({ id: "cBolt", layer: "chb", shape: "cyl", size: [0.09, 0.1], rot: V, pos: [0, 3.68, 0], at: RING(16, 2.55), mat: "steel" });
VT("cOring", "chb", 2.4, 2.32, 3.2, 3.26, "rubber");
VC("cInlet", "chb", 0.3, 3.62, 3.9, "steel2", { x: 0 }); P({ id: "cInletNut", layer: "chb", shape: "tube", size: [0.38, 0.2, 0.22], rot: V, pos: [0, 3.92, 0], mat: "steel" });
VC("cHead", "chb", 1.9, 2.95, 3.12, "steel2"); VT("cHeadRim", "chb", 1.95, 1.8, 2.95, 3.14, "dark");
VT("cExh", "chb", 0.4, 0.3, 0.6, 1.2, "steel", { x: 2.9 }); P({ id: "cExhPipe", layer: "chb", shape: "cyl", size: [0.3, 3.4], rot: HX, pos: [41.7, 0.9, 0], mat: "steel2" });
VC("cChuck", "cwf", 1.5, 0.4, 1.1, "chuckM"); VC("cWafer", "cwf", 1.25, 1.1, 1.16, "steel2"); VT("cChuckRim", "cwf", 1.52, 1.3, 1.05, 1.12, "dark");
P({ id: "cPin", layer: "cwf", shape: "cyl", size: [0.07, 0.3], rot: V, pos: [0, 1.25, 0], at: RING(3, 1.1, 90), mat: "gold" });
// 腔體與晶圓原本建在原點（與氣櫃重疊），移到站 C（x＝38）；排氣管 cExhPipe 本來就是絕對座標
for (const q of parts) if ((q.layer === "chb" || q.layer === "cwf") && q.id !== "cExhPipe") q.pos[0] = R2(q.pos[0] + 38);
BOX("cpBody", "cpump", 44.2, 46.2, 0.2, 1.6, -0.9, 0.9, "steel2"); BOX("cpFins", "cpump", 44.3, 46.1, 0.35, 1.5, 0.9, 0.95, "dark");
P({ id: "cpFin", layer: "cpump", shape: "box", size: [1.8, 0.04, 0.2], pos: [45.2, 0, 1.0], at: [[0, 0.5, 0], [0, 0.7, 0], [0, 0.9, 0], [0, 1.1, 0], [0, 1.3, 0]], mat: "steel" });
SPH("cpLed", "cpump", 0.08, 44.5, 1.4, -0.95, "lampG");

// ═════ 比較用：s6 兩條平行管路（有加熱 vs 沒加熱，玻璃管看得到裡面），冷管出口閥座前慢慢結出凝結物 ═════
LAY("hotCmp", [13, 1.4, 13.5, 2.4]); LAY("coldCmp", [13, 1.4, 13.5, 2.4]); LAY("crust1", [1.4, 0.8, 18, 2.3]); LAY("crust2", [1.8, 0.8, 17.6, 2.3]); LAY("crust3", [2.2, 0.8, 17.4, 2.3]); LAY("cmpValve", [2.4, 1.2, 20, 2.4]);
const HZ = -2.4, CZ = 2.4, CMX0 = 7.4, CMX1 = 19.2;
HXC("hcGlass", "hotCmp", 0.42, CMX0, CMX1, 2.4, HZ, "bubGlass"); P({ id: "hcTape", layer: "hotCmp", shape: "tube", size: [0.47, 0.42, 0.07], rot: HX, pos: [CMX0 + 0.3, 2.4, HZ], at: Array.from({ length: 39 }, (_, j) => [j * 0.3, 0, 0]), mat: "tape" });
P({ id: "hcEnd", layer: "hotCmp", shape: "tube", size: [0.5, 0.36, 0.12], rot: HX, pos: [CMX0, 2.4, HZ], at: [[0, 0, 0], [CMX1 - CMX0, 0, 0]], mat: "jackDark" });
BOX("hcTc", "hotCmp", 12.8, 13.3, 2.92, 3.2, HZ - 0.2, HZ + 0.2, "boxGreen"); P({ id: "hcStand", layer: "hotCmp", shape: "box", size: [0.3, 0.9, 0.9], pos: [0, 1.6, HZ], at: [[8.4, 0, 0], [13.2, 0, 0], [18.0, 0, 0]], mat: "dark" });
HXC("ccGlass", "coldCmp", 0.42, CMX0, CMX1, 2.4, CZ, "bubGlass"); P({ id: "ccFrost", layer: "coldCmp", shape: "tube", size: [0.46, 0.42, 0.05], rot: HX, pos: [CMX0 + 0.6, 2.4, CZ], at: Array.from({ length: 12 }, (_, j) => [j * 0.95, 0, 0]), mat: "crust" });
P({ id: "ccEnd", layer: "coldCmp", shape: "tube", size: [0.5, 0.36, 0.12], rot: HX, pos: [CMX0, 2.4, CZ], at: [[0, 0, 0], [CMX1 - CMX0, 0, 0]], mat: "dark" });
P({ id: "ccStand", layer: "coldCmp", shape: "box", size: [0.3, 0.9, 0.9], pos: [0, 1.6, CZ], at: [[8.4, 0, 0], [13.2, 0, 0], [18.0, 0, 0]], mat: "dark" });
BOX("cmpV0", "cmpValve", 19.2, 20.6, 1.8, 3.0, HZ - 0.6, HZ + 0.6, "steel2"); BOX("cmpV1", "cmpValve", 19.2, 20.6, 1.8, 3.0, CZ - 0.6, CZ + 0.6, "steel2");
P({ id: "cmpVAct", layer: "cmpValve", shape: "cyl", size: [0.32, 0.5], rot: V, pos: [19.9, 3.25, 0], at: [[0, 0, HZ], [0, 0, CZ]], mat: "dark" });
P({ id: "crust1a", layer: "crust1", shape: "sphere", size: [0.13], pos: [17.6, 2.15, CZ], at: [[0, 0, 0], [0.25, 0.05, 0.1], [0.55, 0, -0.08], [0.9, 0.04, 0.05], [-0.3, 0, -0.1]], mat: "crust" });
P({ id: "crust2a", layer: "crust2", shape: "sphere", size: [0.2], pos: [17.8, 2.25, CZ], at: [[0, 0, 0], [0.4, 0.1, 0.1], [0.8, 0.05, -0.1], [-0.4, 0.05, 0.08], [1.1, 0.1, 0]], mat: "crustOr" });
P({ id: "crust3a", layer: "crust3", shape: "cyl", size: [0.38, 0.9], rot: HX, pos: [18.2, 2.4, CZ], mat: "crust" }); P({ id: "crust3b", layer: "crust3", shape: "sphere", size: [0.26], pos: [17.5, 2.4, CZ], at: [[0, 0, 0], [0.3, 0.1, 0.1], [0.2, -0.1, -0.1]], mat: "crustOr" });

// ═════ 站 D：晶圓表面的分子（教學範例：鋁前驅物與水），八個表面位置 ═════
const DX0 = 58, SITES = [];
for (const z of [-0.95, 0.95]) for (const x of [55.9, 57.4, 58.9, 60.4]) SITES.push([x, z]);
LAY("sub", [9, 1.2, DX0, 0.2]); LAY("surf", [8, 0.8, DX0, 0.6]); LAY("film", [8.4, 0.5, DX0, 0.8]);
BOX("subSlab", "sub", 53.6, 62.4, -0.45, 0.45, -3.0, 3.0, "sub");
P({ id: "subLat", layer: "sub", shape: "sphere", size: [0.2], pos: [53.9, 0, 3.02], at: Array.from({ length: 12 }, (_, i) => [i * 0.7, 0, 0]).concat(Array.from({ length: 12 }, (_, i) => [i * 0.7 + 0.35, -0.3, 0])), mat: "subD" });
P({ id: "subLat2", layer: "sub", shape: "sphere", size: [0.2], pos: [53.9, 0.3, 3.02], at: Array.from({ length: 12 }, (_, i) => [i * 0.7, 0, 0]), mat: "subD" });
P({ id: "subOx", layer: "surf", shape: "sphere", size: [0.17], pos: [0, 0.62, 0], at: SITES.map(([x, z]) => [x, 0, z]), mat: "ohO" });
SITES.forEach(([x, z], k) => {
  LAY(`h${k}`, [0.4, 0.4, x, 0.9]); LAY(`al${k}`, [0.6, 0.6, x, 0.9]); LAY(`me${k}`, [0.6, 0.5, x, 1.2]); LAY(`oh2${k}`, [0.5, 0.5, x, 1.3]);
  SPH(`hH${k}`, `h${k}`, 0.1, x + 0.17, 0.78, z, "ohH");
  SPH(`alA${k}`, `al${k}`, 0.27, x, 0.9, z, "alM");
  SPH(`me${k}a`, `me${k}`, 0.13, x - 0.16, 1.27, z, "meM"); SPH(`me${k}b`, `me${k}`, 0.13, x + 0.16, 1.27, z, "meM");
  SPH(`oh2${k}O`, `oh2${k}`, 0.17, x, 1.25, z, "ohO"); SPH(`oh2${k}H`, `oh2${k}`, 0.1, x + 0.17, 1.42, z, "ohH");
});
BOX("filmSlab", "film", 54.0, 62.0, 0.62, 1.0, -2.6, 2.6, "filmM");

// ═════ 動作 ═════
actions.jackGlow = { type: "pulse", _說明: "加熱套亮起（示意，不標溫度）", parts: ["jkBand0", "jkBand1", "jkBand2"], color: "hotC", glow: 1, steady: true, halo: 0 };
actions.liqWarm = { type: "pulse", _說明: "液體被加熱：微微泛暖色（示意）", parts: ["liqBody"], color: "hotC", glow: 0.35, steady: true, halo: 0 };
actions.tapeGlow = { type: "pulse", parts: ["hjkTape0", "hjkTape1", "hjkTape2", "hcTape", "vpOutTape", "vbaseHeat", "vbaseHeat2"], color: "hotC", glow: 1, steady: true, halo: 0 };
actions.ledA = { type: "pulse", parts: ["vledA"], color: "lampG", glow: 1, steady: true, halo: 0 };
actions.mfcLed = { type: "pulse", parts: ["mfcLed"], color: "lampG", glow: 1, freq: 1.4, halo: 0 };
// 氣泡：從燒結頭出來（小）→ 上升時先加速、很快趨近終端速度（rise）→ 越往上越帶橘色（吃進蒸氣）→ 到液面破掉；頂部空間的蒸氣比載氣密
actions.bubA = { type: "flow", _說明: "氣泡（載氣，白）從燒結頭出來上升", layer: "liq", path: [[-0.75, 1.55, 0], [-0.75, 2.45, 0]], n: 4, lanes: 3, laneDir: [0, 0, 1], laneGap: 0.34, size: 0.17, shape: "dot", rate: 0.85, color: "bubC", track: false, rise: true, jitter: 0.18, free: true };
actions.bubB = { type: "flow", _說明: "氣泡上半段：吃進蒸氣，漸漸變橘（飽和後不再變深）", layer: "liq", path: [[-0.75, 2.45, 0], [-0.75, 3.06, 0]], n: 4, lanes: 3, laneDir: [0, 0, 1], laneGap: 0.34, size: 0.2, shape: "dot", rate: 1.1, color: "vapC", track: false, jitter: 0.18, free: true };
actions.bubC = { type: "flow", _說明: "氣泡側邊另一串，晚一點出發", layer: "liq", path: [[-0.62, 1.55, 0.18], [-0.66, 3.06, 0.2]], n: 3, size: 0.13, shape: "dot", rate: 0.7, color: "bubC", track: false, rise: true, jitter: 0.12, free: true, phase: 0.3 };
actions.vapLow = { type: "flow", _說明: "頂部空間：蒸氣稀（溫度低或氣流太快）", layer: "liq", path: [[-0.5, 3.25, 0], [0.1, 4.1, 0], [0.75, 4.6, 0]], n: 5, size: 0.08, shape: "dot", rate: 0.4, color: "vapC", track: false, jitter: 0.3, free: true };
actions.vapHi = { type: "flow", _說明: "頂部空間：蒸氣濃（溫度上來、氣泡走完飽和）", layer: "liq", path: [[-0.5, 3.25, 0], [0.1, 4.1, 0], [0.75, 4.6, 0]], n: 14, size: 0.09, shape: "dot", rate: 0.55, color: "vapC", track: false, jitter: 0.35, free: true };
actions.ripple = { type: "wave", _說明: "液面破泡的小漣漪", from: { layer: "liq", p: [-0.75, 3.15, 0] }, dir: [0, 1, 0], reach: 0.1, count: 2, r0: 0.12, spread: 4.5, rate: 1.2, color: "bubC", width: 0.1 };
actions.hotFlow = { type: "flow", _說明: "有加熱的管：蒸氣一路順暢通過", layer: "hotCmp", path: [[7.5, 2.4, HZ], [19.0, 2.4, HZ]], n: 10, size: 0.1, shape: "dot", rate: 0.22, color: "vapC", track: false, jitter: 0.18, free: true };
actions.coldFlowA = { type: "flow", _說明: "沒加熱的管：蒸氣走到冷處慢下來、停在管壁", layer: "coldCmp", path: [[7.5, 2.4, CZ], [17.0, 2.4, CZ]], n: 8, size: 0.1, shape: "dot", rate: 0.2, color: "vapC", track: false, jitter: 0.18, free: true };
actions.coldFlowB = { type: "flow", _說明: "凝結物長出來之後，剩一點點通過", layer: "coldCmp", path: [[7.5, 2.4, CZ], [16.6, 2.4, CZ]], n: 3, size: 0.1, shape: "dot", rate: 0.08, color: "vapC", track: false, jitter: 0.12, free: true };
// 脈衝：A 路蒸氣一小團沿管路進腔體（前緣陡、後緣漸收）；吹淨氣把管裡沖乾淨
const POUT = [[19.9, 2.2, 0], [22.2, 1.7, 0], [27.2, 1.7, 0], [31.5, 1.7, 0], [31.5, 5.2, 0], [38, 5.2, 0], [38, 3.5, 0], [38, 2.2, 0]];
actions.pulseA = { type: "flow", _說明: "A 路蒸氣一小團（橘）：閥開才有，沿管路進腔體", layer: "vpipes", path: POUT, n: 8, size: 0.13, shape: "dot", rate: 0.17, color: "vapC", track: false, trail: 3, trailGap: 0.012, trailColor: "vapC", jitter: 0.06, free: true };
actions.purgeN = { type: "flow", _說明: "吹淨氮氣（淡灰）從前方進閥塊，沿同一條管把殘氣沖走", layer: "vpipes", path: [[25.8, 1.7, BZ + 0.5]].concat(POUT.slice(2)), n: 14, size: 0.1, shape: "dot", rate: 0.2, color: "n2C", track: false, jitter: 0.12, free: true };
actions.carrierIn = { type: "flow", _說明: "載氣（淡灰）從減壓閥經濾器、MFC 進起泡器", layer: "gsrc", path: [[-14.5, 7.3, 0], [-8.8, 7.3, 0], [-4.0, 7.3, 0], [-1.95, 7.3, 0], [-0.75, 7.3, 0], [-0.75, 5.8, 0]], n: 9, size: 0.1, shape: "dot", rate: 0.25, color: "n2C", track: false, free: true };
// ALD 一圈：TMA（橘分子）→ 反應 → 吹淨 → 水（青分子）→ 吹淨；表面位置用完就停（後來的分子彈開）
actions.tmaIn = { type: "flow", _說明: "鋁前驅物分子（橘）落到表面、與表面羥基反應", layer: "sub", path: [[DX0, 6.5, 0], [DX0, 1.5, 0]], n: 3, lanes: 4, laneDir: [1, 0, 0.5], laneGap: 1.6, size: 0.3, shape: "mol", rate: 0.24, color: "alC", rim: "alC", track: false, accel: true, jitter: 0.7, free: true };
actions.tmaBnc = { type: "flow", _說明: "表面都被蓋滿後，後來的分子彈開", layer: "sub", path: [[DX0 + 0.4, 6.0, 0.4], [DX0 + 0.6, 1.6, 0.4], [DX0 + 4.4, 4.6, 1.8]], n: 5, size: 0.3, shape: "mol", rate: 0.22, color: "alC", rim: "alC", track: false, jitter: 0.8, free: true };
actions.ch4Out = { type: "flow", _說明: "反應副產物（甲烷，灰）飄走", layer: "sub", path: [[DX0, 1.4, 0], [DX0 + 0.8, 5.2, -1.0]], n: 6, size: 0.14, shape: "dot", rate: 0.25, color: "ch4C", track: false, jitter: 1.6, free: true };
actions.purge1 = { type: "flow", _說明: "吹淨氣（淡灰）沿表面掃過，把多的分子沖走", layer: "sub", path: [[51.5, 2.0, 0], [65.0, 2.0, 0]], n: 12, lanes: 4, laneDir: [0, 1, 1], laneGap: 0.7, size: 0.1, shape: "dot", rate: 0.9, color: "n2C", track: false, jitter: 0.4, free: true };
actions.h2oIn = { type: "flow", _說明: "水分子（青）落到表面，與甲基反應", layer: "sub", path: [[DX0, 6.5, 0], [DX0, 1.9, 0]], n: 3, lanes: 4, laneDir: [1, 0, 0.5], laneGap: 1.6, size: 0.26, shape: "mol", rate: 0.24, color: "h2oC", rim: "h2oC", track: false, accel: true, jitter: 0.7, free: true };
actions.ch4Out2 = { type: "flow", layer: "sub", path: [[DX0, 1.6, 0], [DX0 - 0.8, 5.2, 1.0]], n: 6, size: 0.14, shape: "dot", rate: 0.25, color: "ch4C", track: false, jitter: 1.6, free: true };

// ═════ 站 E：固體安瓿（短版爆炸：蓋、托盤疊層升起；加熱讓固體直接變蒸氣，昇華） ═════
const EX = -26;
LAY("ampBase", [3.8, 3.4, EX, 1.8]); LAY("ampShell", [3.4, 3.4, EX, 2.0]); LAY("ampLid", [3.0, 1.6, EX, 4.2]);
VC("ampFoot", "ampBase", 1.7, 0, 0.4, "band"); VT("ampHeater", "ampBase", 1.62, 1.4, 0.4, 1.0, "jackTan"); VT("ampHeatBand", "ampBase", 1.65, 1.58, 0.55, 0.65, "tape");
P({ id: "ampBolt", layer: "ampBase", shape: "cyl", size: [0.07, 0.06], rot: V, pos: [EX, 0.43, 0], at: RING(8, 1.5), mat: "steel" });
VT("ampWall", "ampShell", 1.3, 1.22, 0.9, 3.6, "steel2"); VC("ampBot", "ampShell", 1.3, 0.85, 0.95, "steel");
BOX("ampPlate", "ampShell", EX - 0.5, EX + 0.5, 1.6, 2.2, 1.28, 1.34, "gold"); BOX("ampWarn", "ampShell", EX - 0.5, EX + 0.5, 2.5, 3.0, 1.28, 1.34, "warnY");
for (let i = 0; i < 4; i++) {
  LAY(`ampT${i}`, [2.4, 0.5, EX, 1.1 + 0.7 * i]);
  const y = 1.1 + 0.7 * i;
  VC(`tray${i}`, `ampT${i}`, 1.12, y, y + 0.06, "steel2", { x: EX }); VT(`trayRim${i}`, `ampT${i}`, 1.14, 1.04, y, y + 0.16, "steel", { x: EX });
  P({ id: `trayHole${i}`, layer: `ampT${i}`, shape: "cyl", size: [0.09, 0.07], rot: V, pos: [EX, y + 0.05, 0], at: RING(6, 0.6, i * 17), mat: "dark" });
  P({ id: `trayPowder${i}`, layer: `ampT${i}`, shape: "sphere", size: [0.07], pos: [EX, y + 0.1, 0], at: RING(10, 0.85, i * 9).concat(RING(7, 0.5, i * 13)).concat(RING(4, 0.2, 5)), mat: "crust" });
}
VC("ampLidFl", "ampLid", 1.3, 3.6, 3.85, "steel2", { x: EX }); P({ id: "ampLidBolt", layer: "ampLid", shape: "cyl", size: [0.07, 0.08], rot: V, pos: [EX, 3.9, 0], at: RING(8, 1.1), mat: "steel" });
for (const [nm, vx] of [["I", -0.5], ["O", 0.5]]) { VC(`ampV${nm}`, "ampLid", 0.22, 3.85, 4.5, "steel2", { x: EX + vx }); VC(`ampVAct${nm}`, "ampLid", 0.3, 4.5, 5.1, "dark", { x: EX + vx }); }
actions.ampHeat = { type: "pulse", parts: ["ampHeatBand"], color: "hotC", glow: 1, steady: true, halo: 0 };
actions.sublime = { type: "flow", _說明: "固體受熱直接變蒸氣（昇華）：從托盤粉粒表面升起，載氣帶著往出口走（示意）", layer: "ampBase", path: [[EX, 1.2, 0.3], [EX, 3.0, 0.2], [EX + 0.5, 3.9, 0], [EX + 0.5, 5.0, 0]], n: 14, size: 0.09, shape: "dot", rate: 0.3, color: "vapC", track: false, jitter: 0.5, free: true };
Object.assign(anchors, { impA: A("imp", [59.9, 1.3, 0.2], 150, 100), amp: A("ampT2", [EX + 1.0, 2.7, 0.5], 150, -90), ampLidA: A("ampLid", [EX + 0.5, 4.8, 0.2], 150, -80) });

// 供應商（s10）：一塊出貨棧板上並排三只前驅物容器（各有銘板與色帶；非特定廠牌），念到哪一家就從幽靈變實體
LAY("supBase", [14, 4.6, 40, 0.3]);
BOX("supPallet", "supBase", 33.4, 46.6, 0, 0.5, -2.3, 2.3, "band");
P({ id: "supSlat", layer: "supBase", shape: "box", size: [13.2, 0.06, 0.12], pos: [40, 0.52, 0], at: [[0, 0, -1.6], [0, 0, -0.5], [0, 0, 0.5], [0, 0, 1.6]], mat: "seam" });
P({ id: "supFoot", layer: "supBase", shape: "box", size: [1.0, 0.3, 4.2], pos: [0, -0.15, 0], at: [[34.2, 0, 0], [40, 0, 0], [45.8, 0, 0]], mat: "dark" });
for (const [i, x, band] of [[0, 36.6, "warnY"], [1, 40, "coldPipe"], [2, 43.4, "boxGreen"]]) {
  LAY(`sup${i}`, [3.0, 5.2, x, 2.8]);
  VC(`sup${i}Body`, `sup${i}`, 1.15, 0.5, 3.6, "steel2", { x });
  VC(`sup${i}Dome`, `sup${i}`, 0.95, 3.6, 3.85, "steel", { x });
  VT(`sup${i}Weld`, `sup${i}`, 1.17, 1.1, 1.3, 1.36, "dark", { x }); VT(`sup${i}Weld2`, `sup${i}`, 1.17, 1.1, 2.9, 2.96, "dark", { x });
  VT(`sup${i}Foot`, `sup${i}`, 1.2, 1.05, 0.5, 0.65, "dark", { x });
  for (const [j, dx] of [[0, -0.45], [1, 0.45]]) { VC(`sup${i}V${j}`, `sup${i}`, 0.24, 3.85, 4.45, "steel2", { x: x + dx }); VC(`sup${i}W${j}`, `sup${i}`, 0.3, 4.45, 4.55, "knurl", { x: x + dx }); VT(`sup${i}N${j}`, `sup${i}`, 0.3, 0.2, 3.95, 4.05, "steel", { x: x + dx }); }
  BOX(`sup${i}Plate`, `sup${i}`, x - 0.75, x + 0.75, 1.55, 2.75, 1.12, 1.16, "gaugeF");
  BOX(`sup${i}Band`, `sup${i}`, x - 0.75, x + 0.75, 2.35, 2.6, 1.16, 1.18, band);
  BOX(`sup${i}T1`, `sup${i}`, x - 0.55, x + 0.55, 1.95, 2.05, 1.16, 1.18, "dark"); BOX(`sup${i}T2`, `sup${i}`, x - 0.55, x + 0.2, 1.72, 1.8, 1.16, 1.18, "dark");
  BOX(`sup${i}Warn`, `sup${i}`, x - 0.3, x + 0.3, 0.8, 1.15, 1.12, 1.15, "warnY");
}
Object.assign(anchors, { supA: A("sup0", [36.6, 4.4, 0.3], -150, -90) });

// 雜質：一顆金屬原子（金黃）落到薄膜裡，旁邊發出警示光（s9，示意）
LAY("imp", [0.8, 0.8, 59.65, 1.1]);
SPH("impA", "imp", 0.3, 59.65, 1.12, -0.2, "brass"); VT("impRing", "imp", 0.5, 0.42, 1.0, 1.04, "warnY", { x: 59.65, z: -0.2 });
actions.impDrop = { type: "flow", _說明: "混進原料的一顆雜質金屬原子（金黃）隨氣流落下", layer: "sub", path: [[59.65, 6.4, -0.2], [59.65, 1.4, -0.2]], n: 1, size: 0.3, shape: "dot", rate: 0.28, color: "brassC", track: false, accel: true, free: true, rim: "warnY" };
actions.impGlow = { type: "pulse", parts: ["impRing"], color: "warnY", glow: 1, freq: 1.8, halo: 1.2 };

// 標註點
Object.assign(anchors, {
  cab: A("cabWall", [-CW - 0.05, 8.6, 0.4], -150, -80), door: A("cabDoor", [0, 8.0, CD + 0.3], 150, -90),
  jack: A("jack", [1.75, 2.6, 0.4], 150, 80), jctl: A("jack", [0.45, 2.0, 2.2], 150, 110),
  lid: A("lid", [0.75, 6.6, 0.3], 150, -90), valveIn: A("lid", [-0.75, 7.17, 0], -150, -80), valveOut: A("lid", [0.75, 7.17, 0], 150, -90),
  dip: A("dip", [-0.75, 2.8, 0], -150, 100), dipTip: A("dip", [-0.75, 1.35, 0.2], -150, 110),
  liq: A("liq", [0.9, 2.0, 0.6], 150, 90), headspace: A("liq", [0.2, 3.9, 0.4], 150, -100), shell: A("vshell", [1.45, 4.0, 0.4], 150, -100),
  mfc: A("mfc", [-3.0, 7.7, 0.4], -150, -90), filter: A("mfc", [-4.6, 7.3, 0.35], -150, 90), gas: A("gsrc", [-10.2, 8.4, 0.6], 150, -90),
  pfil: A("pfilCore", [6.75, 4.5, 0.3], 150, -100), hline: A("hjk1", [13.4, 2.6, 0.3], 150, -100), pipeIn: A("hline", [6.2, 5.0, 0.3], 150, -80), tape: A("hjk2", [18.4, 2.6, 0.3], 150, -100),
  vblock: A("vblock", [24.0, 4.0, 0.1], 150, -110), seat: A("vbase", [24.0, 2.5, 0.0], 150, 110), diaA: A("vdiaA", [22.2, 2.55, 0.4], -150, -100), spring: A("vdiaP", [25.8, 2.7, 0.35], 150, -100), vbox: A("vbox", [BX1, 1.6, 1.2], 150, 100),
  chamber: A("chb", [40.4, 2.2, 1.6], 150, -80), wafer: A("cwf", [38.8, 1.14, 0.4], 150, 110), inlet: A("chb", [38.0, 3.9, 0.4], 150, -100),
  hotL: A("hotCmp", [11.0, 2.9, HZ], -150, -90), coldL: A("coldCmp", [11.0, 2.9, CZ], -150, 90), cold: A("crust2", [17.8, 2.5, CZ], 150, -100),
  site: A("surf", [56.2, 0.78, 0.9], -150, 100), tma: A("sub", [58, 4.2, 0], 150, -100), purgeA: A("sub", [62.5, 2.0, 0], 150, -100), filmA: A("film", [61.8, 0.9, 1.4], 150, 100),
});

const model = {
  name: "示意 前驅物送料系統（爆炸分解）：氣櫃、起泡器（容器、液體、插管與燒結頭、頂蓋與進出氣閥、加熱套）、載氣減壓閥與流量控制器與過濾器、加熱管路與保溫套與加熱帶、閥箱（閥塊、隔膜、彈簧、閥座、氣動致動器）、腔體入口與晶圓、真空泵；另有加熱與未加熱管路對照、晶圓表面分子（示意，非特定廠牌實機尺寸）",
  unit: "示意（1＝10 cm）",
  size: { w: 40, h: 18, r: 0.6, t: 30 },
  palette, materials,
  partNames: { cab: "氣櫃", jack: "加熱套", lid: "進出氣閥", dip: "插管", liq: "液體", mfc: "載氣流量控制", hline: "加熱管路", pfil: "微粒過濾器", vblock: "脈衝閥" },
  layers, parts, anchors, actions,
  pose: { yaw0: 0, yawIso: 0, drift: 0 },
  camera: { stand: { d: 70, elev: 24, y: 7 } },
  fx: { dpr: 1, srcPx: 30, shadows: 0, fog: false, dust: false, vaporSprites: false, shimmer: false },
  info: { FY, SX, BX0, BX1, HZ, CZ, SITES, DX0, CH, CD, CW, EX },
};
const out = path.join(path.dirname(new URL(import.meta.url).pathname), "model.json");
fs.writeFileSync(out, JSON.stringify(model, null, 1) + "\n");
console.log(`✔ ${out}：${parts.length} 個零件、${parts.reduce((a, p) => a + Math.max(1, (p.at?.length ?? 0)), 0)} 個實體（含複製）、${layers.length} 層`);

// node videos/tech-gas/gen-model.mjs → 寫 videos/tech-gas/model.json
// 2026/11/27 tech-gas（特用氣體，系列 2 第 15 集）。構造與物理照 physics-spec.md、模組清單照 visual-spec.md。示意，非特定廠牌實機尺寸。
// 單位：1＝10 cm，地板頂面 y＝0，x 向右、z 向觀眾。主管線沿 y＝7.5、z＝0 由左到右串起六個站（全程連續，鏡頭只切換不留空景）：
//   氣瓶櫃 x0（含雙瓶、調節器、吹淨支路、控制器）→ 純化器 x20 → 閥箱 VMB x38 → 雙套管 x58 → 製程腔與乾式泵 x76～86 → 尾氣處理器 x96。
import fs from "node:fs";
import path from "node:path";

const R2 = (x) => Math.round(x * 1000) / 1000;
const D2R = Math.PI / 180;
const pol = (aDeg, r) => [R2(r * Math.cos(aDeg * D2R)), R2(r * Math.sin(aDeg * D2R))];
const palette = {
  floorC: "#C9D2DE", panel: "#F3F5F8", panel2: "#E4E8EE", cab: "#EDE9DD", cab2: "#D9D4C4", seam: "#8E9BB0", band: "#24324C", steel: "#7D8CA6", steel2: "#B4BFCF", dark: "#3E4A60",
  glassC: "#BFD3F2", lampY: "#F2B632", lampG: "#2FBF71", lampR: "#E5484D", screen: "#5B8DEF", rubber: "#2B2F36", gold: "#C9A24A", knurl: "#5C6678", estop: "#D93A2B",
  pneu: "#2F7FE0", bottleC: "#8A97AB", ringA: "#2FBF9B", ringB: "#F28C28", pcbC: "#1F6B45", chipC: "#1C1F26", traceC: "#C9A24A", connC: "#2A2D33", warnC: "#F2B632",
  gasC: "#3FD0B8", impC: "#FF8A2B", n2C: "#5BB6FF", wasteC: "#E8D27A", fireIn: "#4DA3FF", fireOut: "#FF8A2B", ashC: "#B8BEC9", waterC: "#4DA3FF", plasmaC: "#9B7BFF",
  hotC: "#E5602B", beadC: "#D9B36B", waferC: "#B4C2DA", detC: "#F4F6F9", markA: "#E8613C",
};
const M = (kind, color, o = {}) => ({ kind, color, ...o });
const glowM = (c, op, ei = 1) => M("std", c, { emissive: c, ei, opacity: op, rough: 1, metal: 0 });
const materials = {
  floor: M("std", "floorC", { rough: 0.7, metal: 0.3, tex: "brushed", texScale: 3 }),
  panel: M("std", "panel", { rough: 0.55, metal: 0.05, env: 0.25 }), panel2: M("std", "panel2", { rough: 0.6, metal: 0.05, env: 0.2 }),
  cab: M("std", "cab", { rough: 0.5, metal: 0.05, env: 0.25 }), cab2: M("std", "cab2", { rough: 0.55, metal: 0.05, env: 0.2 }),
  seam: M("std", "seam", { rough: 0.6, metal: 0.3 }), band: M("std", "band", { rough: 0.4, metal: 0.3, env: 0.4 }),
  steel: M("std", "steel", { rough: 0.35, metal: 0.85, env: 0.5 }), steel2: M("std", "steel2", { rough: 0.25, metal: 0.9, env: 0.7, tex: "brushed", texScale: 2 }),
  dark: M("std", "dark", { rough: 0.5, metal: 0.4, env: 0.3 }), rubber: M("std", "rubber", { rough: 0.9, metal: 0 }), gold: M("std", "gold", { rough: 0.3, metal: 0.9, env: 0.8 }),
  knurl: M("std", "knurl", { rough: 0.4, metal: 0.8, env: 0.5 }),
  window: M("phys", "glassC", { rough: 0.05, metal: 0, clearcoat: 1, opacity: 0.22, env: 0.6 }), glassDoor: M("phys", "glassC", { rough: 0.05, metal: 0, clearcoat: 1, opacity: 0.3, env: 0.6 }),
  lampY: M("std", "lampY", { emissive: "lampY", ei: 0.4, rough: 0.4, metal: 0 }), lampG: M("std", "lampG", { emissive: "lampG", ei: 0.35, rough: 0.4, metal: 0 }),
  lampR: M("std", "lampR", { emissive: "lampR", ei: 0.25, rough: 0.4, metal: 0 }), estop: M("std", "estop", { rough: 0.4, metal: 0, emissive: "estop", ei: 0.15 }),
  screen: M("std", "screen", { emissive: "screen", ei: 0.5, rough: 0.3, metal: 0 }),
  pneu: M("std", "pneu", { rough: 0.4, metal: 0.4, env: 0.4 }), bottle: M("std", "bottleC", { rough: 0.35, metal: 0.8, env: 0.7 }),
  ringA: M("std", "ringA", { rough: 0.5, metal: 0.2 }), ringB: M("std", "ringB", { rough: 0.5, metal: 0.2 }),
  pcb: M("std", "pcbC", { rough: 0.5, metal: 0.1 }), chip: M("std", "chipC", { rough: 0.35, metal: 0.2, env: 0.4 }), trace: M("std", "traceC", { rough: 0.3, metal: 0.9, env: 0.6 }), conn: M("std", "connC", { rough: 0.5, metal: 0.2 }),
  warn: M("std", "warnC", { rough: 0.5, metal: 0.1 }), det: M("std", "detC", { rough: 0.5, metal: 0.05, env: 0.3 }),
  gas: glowM("gasC", 0.85), imp: glowM("impC", 0.95), n2: glowM("n2C", 0.9), waste: glowM("wasteC", 0.85), ash: glowM("ashC", 0.7, 0.5),
  fireIn: glowM("fireIn", 0.85, 1.2), fireOut: glowM("fireOut", 0.7, 1.2), droplet: glowM("waterC", 0.9, 0.8), plasma: glowM("plasmaC", 0.5, 1.2),
  water: M("phys", "waterC", { rough: 0.05, metal: 0, clearcoat: 1, opacity: 0.4, env: 0.5 }), bead: M("std", "beadC", { rough: 0.7, metal: 0.1 }), wafer: M("std", "waferC", { rough: 0.2, metal: 0.8, env: 0.9 }),
  hot: M("std", "hotC", { emissive: "hotC", ei: 0.55, rough: 0.5, metal: 0.4 }), heat: glowM("hotC", 0.85, 1),
  led: glowM("lampR", 0.95, 0.9), ledG: glowM("lampG", 0.95, 0.9),
};
const parts = [], layers = [], anchors = {}, actions = {};
const P = (o) => { parts.push(o); return o; };
const LAY = (id, outline, bg) => layers.push({ id, z: 0, k: 0, outline, ...(bg ? { bg: true } : {}) });
const V = [90, 0, 0], HX = [0, 90, 0];
const BOX = (id, layer, x0, x1, y0, y1, z0, z1, mat, o = {}) => P({ id, layer, shape: "box", size: [R2(x1 - x0), R2(y1 - y0), R2(z1 - z0)], pos: [R2((x0 + x1) / 2), R2((y0 + y1) / 2), R2((z0 + z1) / 2)], mat, ...o });
const VC = (id, layer, R, y0, y1, mat, o = {}) => { const { x = 0, z = 0, ...r } = o; return P({ id, layer, shape: "cyl", size: [R, R2(y1 - y0)], rot: V, pos: [x, R2((y0 + y1) / 2), z], mat, ...r }); };
const VT = (id, layer, Ro, Ri, y0, y1, mat, o = {}) => { const { x = 0, z = 0, ...r } = o; return P({ id, layer, shape: "tube", size: [Ro, Ri, R2(y1 - y0)], rot: V, pos: [x, R2((y0 + y1) / 2), z], mat, ...r }); };
const HXC = (id, layer, R, x0, x1, y, z, mat, o = {}) => P({ id, layer, shape: "cyl", size: [R, R2(Math.abs(x1 - x0))], rot: HX, pos: [R2((x0 + x1) / 2), y, z], mat, ...o });
const HXT = (id, layer, Ro, Ri, x0, x1, y, z, mat, o = {}) => P({ id, layer, shape: "tube", size: [Ro, Ri, R2(Math.abs(x1 - x0))], rot: HX, pos: [R2((x0 + x1) / 2), y, z], mat, ...o });
const ZC = (id, layer, R, z0, z1, x, y, mat, o = {}) => P({ id, layer, shape: "cyl", size: [R, R2(Math.abs(z1 - z0))], pos: [x, y, R2((z0 + z1) / 2)], mat, ...o });
const RING = (n, r, a0 = 0) => Array.from({ length: n }, (_, i) => { const [x, z] = pol(a0 + (i * 360) / n, r); return [x, 0, z]; });
const SPH = (id, layer, r, x, y, z, mat, o = {}) => P({ id, layer, shape: "sphere", size: [r], pos: [x, y, z], mat, ...o });
const grid = (x0, x1, nx, y0, y1, ny, z) => { const o = []; for (let i = 0; i < nx; i++) for (let j = 0; j < ny; j++) o.push([R2(x0 + ((x1 - x0) * i) / Math.max(1, nx - 1)), R2(y0 + ((y1 - y0) * j) / Math.max(1, ny - 1)), z]); return o; };
/** 直角折線管：每段沿 x／y／z 其中一軸，轉角放一顆球當彎頭，每段中間一個管夾 */
const PIPE = (id, layer, pts, r, mat = "steel2", o = {}) => {
  pts.forEach((p, i) => {
    if (i === 0) return;
    const a = pts[i - 1], dx = p[0] - a[0], dy = p[1] - a[1], dz = p[2] - a[2], L = Math.abs(dx) + Math.abs(dy) + Math.abs(dz);
    const mid = [R2((p[0] + a[0]) / 2), R2((p[1] + a[1]) / 2), R2((p[2] + a[2]) / 2)];
    if (dx) P({ id: `${id}${i}`, layer, shape: "cyl", size: [r, R2(Math.abs(dx))], rot: HX, pos: mid, mat });
    else if (dy) P({ id: `${id}${i}`, layer, shape: "cyl", size: [r, R2(Math.abs(dy))], rot: V, pos: mid, mat });
    else P({ id: `${id}${i}`, layer, shape: "cyl", size: [r, R2(Math.abs(dz))], pos: mid, mat });
    if (!o.noClamp && L > 2.4) P({ id: `${id}Cl${i}`, layer, shape: "tube", size: [R2(r * 1.5), r, 0.16], rot: dx ? HX : dy ? V : [0, 0, 0], pos: mid, mat: "knurl" });
  });
  pts.slice(1, -1).forEach((p, i) => SPH(`${id}E${i}`, layer, R2(r * 1.3), p[0], p[1], p[2], mat));
};
/** 壓力表（面朝 +z）：外殼、玻璃、錶面、刻度點、指針（獨立零件，可旋轉）、接管 */
const GAUGE = (id, layer, x, y, z, r, a0, mat = "steel2") => {
  ZC(`${id}Hs`, layer, r, z, R2(z + 0.4), x, y, mat);
  VT(`${id}Rim`, layer, R2(r * 1.06), R2(r * 0.94), R2(y - 0.001), R2(y + 0.001), "knurl", { x: 0, z: 0, pos: [x, y, R2(z + 0.42)], rot: [0, 0, 0], size: [R2(r * 1.06), R2(r * 0.94), 0.07] });
  ZC(`${id}Face`, layer, R2(r * 0.92), R2(z + 0.4), R2(z + 0.42), x, y, "panel");
  P({ id: `${id}Tick`, layer, shape: "sphere", size: [0.04], pos: [x, y, R2(z + 0.45)], at: Array.from({ length: 9 }, (_, i) => { const a = (225 - i * 33.75) * D2R; return [R2(Math.cos(a) * r * 0.72), R2(Math.sin(a) * r * 0.72), 0]; }), mat: "dark" });
  const L = r * 0.78;
  P({ id: `${id}Nd`, layer, shape: "box", size: [L, 0.07, 0.04], pos: [R2(x + Math.cos(a0 * D2R) * L / 2), R2(y + Math.sin(a0 * D2R) * L / 2), R2(z + 0.47)], rot: [0, 0, a0], mat: "estop" });
  SPH(`${id}Hub`, layer, 0.1, x, y, R2(z + 0.48), "dark");
  P({ id: `${id}Stem`, layer, shape: "cyl", size: [0.16, 0.5], rot: V, pos: [x, R2(y - r - 0.15), R2(z + 0.2)], mat: "gold" });
};
/** 氣動閥（沿 x 方向的管內閥）：閥體、法蘭螺栓、閥桿、藍色氣動致動器、指示桿 */
const PVALVE = (id, layer, x, y, z) => {
  BOX(`${id}Body`, layer, x - 0.7, x + 0.7, y - 0.55, y + 0.55, z - 0.55, z + 0.55, "steel2");
  VT(`${id}Fl`, layer, 0.62, 0.3, y - 0.55, y + 0.55, "steel", { x: x - 0.8, z, rot: HX });
  VC(`${id}Neck`, layer, 0.24, y + 0.55, y + 1.0, "steel", { x, z });
  VC(`${id}Act`, layer, 0.52, y + 1.0, y + 2.3, "pneu", { x, z });
  VT(`${id}ActRing`, layer, 0.56, 0.46, y + 2.2, y + 2.35, "dark", { x, z });
  VC(`${id}Ind`, layer, 0.07, y + 2.3, y + 2.75, "lampY", { x, z });
  P({ id: `${id}Bolt`, layer, shape: "cyl", size: [0.07, 0.1], rot: HX, pos: [x, y, z], at: [[-0.75, 0.42, 0.42], [-0.75, -0.42, 0.42], [0.75, 0.42, 0.42], [0.75, -0.42, 0.42]], mat: "steel" });
  PIPE(`${id}Air`, layer, [[x + 0.5, y + 1.7, z + 0.2], [x + 0.9, y + 1.7, z + 0.2], [x + 0.9, y + 1.7, z + 1.4]], 0.05, "pneu", { noClamp: true });
};
const FY = 0, LY = 7.5;             // 地板、主管線高度
const X = { cab: 0, pur: 20, vmb: 38, dbl: 58, chm: 76, pmp: 87, abt: 97 };
// ═════ 地板（背景層）＋ 管線底下的管架 ═════
LAY("floor", [116, 2, 48, FY], true);
P({ id: "floor", layer: "floor", shape: "slab", size: [118, 0.5, 26], r: 0.2, pos: [48, R2(FY - 0.25), 0], mat: "floor" });
P({ id: "floorSeam", layer: "floor", shape: "slab", size: [118, 0.04, 0.12], pos: [48, 0.01, 0], at: Array.from({ length: 7 }, (_, i) => [0, 0, -9 + i * 3]), mat: "seam" });
LAY("line", [100, 6, 50, LY]);
// 主管線（站與站之間的連接段，帶彎頭與管夾；站內的由各模組自己畫）
PIPE("ln1", "line", [[5.2, LY, -1.4], [6.4, LY, -1.4], [6.4, LY, 0], [18.2, LY, 0]], 0.2);
PIPE("ln2", "line", [[21.8, LY, 0], [31, LY, 0]], 0.2);
PIPE("ln3", "line", [[45, LY, 0], [50.6, LY, 0]], 0.2);
PIPE("ln4", "line", [[66.4, LY, 0], [70.4, LY, 0], [70.4, 12.4, 0], [72.2, 12.4, 0]], 0.2);
for (const sx of [10, 26, 48, 69]) { BOX(`stand${sx}`, "line", sx - 0.15, sx + 0.15, 0, LY - 0.25, -0.25, 0.25, "band"); BOX(`standFoot${sx}`, "line", sx - 0.6, sx + 0.6, 0, 0.12, -0.6, 0.6, "dark"); BOX(`standSaddle${sx}`, "line", sx - 0.5, sx + 0.5, LY - 0.3, LY - 0.2, -0.4, 0.4, "steel"); }
for (const [a, b] of [[8.3, 10.8], [24.4, 29.4], [47.2, 49.2]]) P({ id: `lnArrow${a}`, layer: "line", shape: "box", size: [1.0, 0.3, 0.04], pos: [(a + b) / 2, LY + 0.1, 0.34], mat: "lampY" });

// ═════ 1 氣瓶櫃（x＝0）：外殼、門、雙瓶、調節器×2、吹淨支路、控制器（門＋電路板）、排氣管 ═════
const CB = { x0: -5, x1: 5, z0: -3.5, z1: 3.5, H: 20 };
LAY("cabShell", [10, 23, 0, 11.5]); LAY("cabDoor", [8, 18, -1, 10]); LAY("botA", [3, 15, -2.2, 7.5]); LAY("botB", [3, 15, 2.2, 7.5]);
LAY("regA", [5, 7, -2.2, 15]); LAY("regB", [5, 7, 2.2, 15]); LAY("purge", [2, 10, -4, 8]); LAY("ctl", [2, 10, 3.7, 12.5]); LAY("ctlDoor", [2, 10, 3.7, 12.5]); LAY("ctlPcb", [2, 9, 3.7, 12.5]);
BOX("cbPlinth", "cabShell", -5, 5, 0, 1.2, -3.5, 3.5, "band");
P({ id: "cbVent", layer: "cabShell", shape: "box", size: [0.7, 0.14, 0.05], pos: [0, 0.6, 3.52], at: Array.from({ length: 9 }, (_, i) => [-3.6 + i * 0.9, 0, 0]), mat: "dark" });
P({ id: "cbFoot", layer: "cabShell", shape: "cyl", size: [0.28, 0.3], rot: V, pos: [0, 0.15, 0], at: [[-4.6, 0, -3.1], [4.6, 0, -3.1], [-4.6, 0, 3.1], [4.6, 0, 3.1]], mat: "steel" });
BOX("cbBack", "cabShell", -5, 5, 1.2, 20, -3.5, -3.3, "cab2"); BOX("cbL", "cabShell", -5, -4.8, 1.2, 20, -3.5, 3.5, "cab"); BOX("cbR", "cabShell", 4.8, 5, 1.2, 20, -3.5, 3.5, "cab");
BOX("cbTop", "cabShell", -5, 5, 19.6, 20, -3.5, 3.5, "cab"); BOX("cbFloor", "cabShell", -4.8, 4.8, 1.2, 1.35, -3.3, 3.3, "steel");
BOX("cbPostL", "cabShell", -5, -4.6, 1.2, 19.6, 3.3, 3.5, "cab"); BOX("cbPostR", "cabShell", 4.6, 5, 1.2, 19.6, 3.3, 3.5, "cab"); BOX("cbRailT", "cabShell", -5, 5, 18.8, 19.6, 3.3, 3.5, "cab"); BOX("cbRailB", "cabShell", -5, 5, 1.2, 2.0, 3.3, 3.5, "cab");
P({ id: "cbScrew", layer: "cabShell", shape: "cyl", size: [0.07, 0.05], pos: [0, 0, 3.52], at: [...grid(-4.8, 4.8, 8, 19.2, 19.2, 1, 0), ...grid(-4.8, 4.8, 8, 1.6, 1.6, 1, 0)], mat: "steel" });
VC("cbDuct", "cabShell", 1.0, 20, 23.2, "steel2", { x: -2.5, z: -1 }); VT("cbDuctFl", "cabShell", 1.45, 0.9, 20, 20.3, "steel", { x: -2.5, z: -1 });
P({ id: "cbDuctBolt", layer: "cabShell", shape: "cyl", size: [0.08, 0.12], rot: V, pos: [-2.5, 20.35, -1], at: RING(8, 1.25), mat: "steel" }); VT("cbDuctClamp", "cabShell", 1.1, 1.0, 21.6, 21.9, "knurl", { x: -2.5, z: -1 }); VT("cbDuctClamp2", "cabShell", 1.1, 1.0, 22.6, 22.9, "knurl", { x: -2.5, z: -1 });
BOX("cbWarn", "cabShell", 3.2, 4.5, 17.6, 18.6, 3.5, 3.55, "warn"); P({ id: "cbWarnTxt", layer: "cabShell", shape: "box", size: [0.9, 0.08, 0.02], pos: [3.85, 18.1, 3.56], at: [[0, 0.22, 0], [0, 0, 0], [0, -0.22, 0]], mat: "dark" });
VC("cbBeaconG", "cabShell", 0.35, 20, 20.6, "lampG", { x: 3.6, z: 0 }); VC("cbBeaconY", "cabShell", 0.35, 20.6, 21.2, "lampY", { x: 3.6, z: 0 }); VC("cbBeaconR", "cabShell", 0.35, 21.2, 21.8, "lampR", { x: 3.6, z: 0 });
BOX("cbPlateA", "cabShell", -1.4, 1.4, 12.8, 18.4, -3.3, -3.15, "steel"); BOX("cbPlateB", "cabShell", -3.9, -0.6, 12.8, 18.4, -3.3, -3.15, "steel"); BOX("cbPlateB2", "cabShell", 0.6, 3.9, 12.8, 18.4, -3.3, -3.15, "steel");
// 出口總管：兩支調節器出口匯在 x＝0.4，往下到 y 7.5，穿右牆
PIPE("cbHdr", "cabShell", [[0.4, 14.2, -1.4], [0.4, LY, -1.4], [4.9, LY, -1.4]], 0.2);
P({ id: "cbHdrNut", layer: "cabShell", shape: "tube", size: [0.34, 0.2, 0.3], rot: HX, pos: [4.6, LY, -1.4], mat: "knurl" });
// 門（滑向左前方打開）
LAY("cabDoorX", [1, 1, 0, 0]); layers.pop();
const DX0 = -4.6, DX1 = 2.6;
BOX("dTop", "cabDoor", DX0, DX1, 16, 19.2, 3.5, 3.85, "cab"); BOX("dBot", "cabDoor", DX0, DX1, 1.8, 4, 3.5, 3.85, "cab"); BOX("dL", "cabDoor", DX0, -3.6, 4, 16, 3.5, 3.85, "cab"); BOX("dR", "cabDoor", 1.6, DX1, 4, 16, 3.5, 3.85, "cab");
BOX("dGlass", "cabDoor", -3.6, 1.6, 4, 16, 3.62, 3.7, "glassDoor");
for (const [i, [a, b, c, d]] of [[-3.7, 1.7, 15.9, 16.1], [-3.7, 1.7, 3.9, 4.1], [-3.7, -3.5, 4, 16], [1.5, 1.7, 4, 16]].entries()) BOX(`dTrim${i}`, "cabDoor", a, b, c, d, i < 2 ? 3.84 : 3.84, 3.92, "steel2");
BOX("dHandle", "cabDoor", 1.9, 2.1, 8, 12, 4.0, 4.4, "steel2"); P({ id: "dHandleStand", layer: "cabDoor", shape: "cyl", size: [0.09, 0.2], pos: [2.0, 0, 3.95], at: [[0, 8.4, 0], [0, 11.6, 0]], mat: "steel" });
ZC("dLock", "cabDoor", 0.2, 3.85, 4.1, 2.0, 7.2, "gold"); P({ id: "dHinge", layer: "cabDoor", shape: "cyl", size: [0.16, 1.4], rot: V, pos: [-4.7, 0, 3.9], at: [[0, 3, 0], [0, 10.5, 0], [0, 17.5, 0]], mat: "steel" });
P({ id: "dLouver", layer: "cabDoor", shape: "box", size: [4.8, 0.1, 0.05], pos: [-1, 0, 3.87], at: Array.from({ length: 5 }, (_, i) => [0, 2.2 + i * 0.35, 0]), mat: "dark" });
BOX("dName", "cabDoor", -3.2, -0.6, 17.2, 18.4, 3.85, 3.9, "gold"); P({ id: "dNameTxt", layer: "cabDoor", shape: "box", size: [1.8, 0.08, 0.02], pos: [-1.9, 17.8, 3.91], at: [[0, 0.2, 0], [0, -0.2, 0]], mat: "dark" });
// 鋼瓶 A（綠環，使用中）、B（橘環，備用）：瓶身、肩、頸、瓶閥（手輪、出口接頭、安全洩壓）、色環、標籤、底環、固定鏈
const BOT = (id, layer, x, ring) => {
  VC(`${id}Body`, layer, 1.1, 1.35, 11.2, "bottle", { x }); P({ id: `${id}Shoulder`, layer, shape: "sphere", size: [1.1], scale: [1, 0.55, 1], pos: [x, 11.2, 0], mat: "bottle" });
  VC(`${id}Neck`, layer, 0.5, 11.5, 12.3, "steel2", { x }); BOX(`${id}Valve`, layer, x - 0.55, x + 0.55, 12.3, 13.4, -0.5, 0.5, "gold");
  VT(`${id}Wheel`, layer, 0.62, 0.5, 13.4, 13.6, "knurl", { x }); BOX(`${id}Spoke`, layer, x - 0.55, x + 0.55, 13.45, 13.55, -0.06, 0.06, "dark"); BOX(`${id}Spoke2`, layer, x - 0.06, x + 0.06, 13.45, 13.55, -0.55, 0.55, "dark");
  HXC(`${id}Out`, layer, 0.22, x + 0.5, x + 1.5, 12.9, 0, "gold"); HXT(`${id}Nut`, layer, 0.36, 0.2, x + 0.95, x + 1.35, 12.9, 0, "knurl"); ZC(`${id}Relief`, layer, 0.14, 0.4, 0.9, x, 12.9, "steel2");
  VT(`${id}Ring`, layer, 1.13, 1.0, 9.6, 10.4, ring, { x }); BOX(`${id}Label`, layer, x - 0.6, x + 0.6, 5, 8.2, 1.06, 1.1, "panel"); P({ id: `${id}LabelTxt`, layer, shape: "box", size: [0.9, 0.08, 0.02], pos: [x, 7.4, 1.11], at: [[0, 0, 0], [0, -0.35, 0], [0, -0.7, 0], [0, -1.8, 0]], mat: "dark" });
  VT(`${id}Base`, layer, 1.22, 1.0, 1.35, 1.9, "dark", { x });
};
BOT("bA", "botA", -2.2, "ringA"); BOT("bB", "botB", 2.2, "ringB");
BOX("bAChain", "botA", -4.7, -1.1, 6.6, 6.78, 1.1, 1.22, "steel"); P({ id: "bAChainLk", layer: "botA", shape: "box", size: [0.16, 0.26, 0.16], pos: [0, 6.7, 1.16], at: Array.from({ length: 7 }, (_, i) => [-4.4 + i * 0.5, 0, 0]), mat: "dark" });
BOX("bBChain", "botB", 1.1, 4.7, 6.6, 6.78, 1.1, 1.22, "steel"); P({ id: "bBChainLk", layer: "botB", shape: "box", size: [0.16, 0.26, 0.16], pos: [0, 6.7, 1.16], at: Array.from({ length: 7 }, (_, i) => [1.4 + i * 0.5, 0, 0]), mat: "dark" });
// 瓶帽（取下放在櫃底）
VC("bCap", "cabShell", 0.8, 1.35, 3.0, "bottle", { x: 0.0, z: 2.4 }); P({ id: "bCapDome", layer: "cabShell", shape: "sphere", size: [0.8], scale: [1, 0.6, 1], pos: [0, 3.0, 2.4], mat: "bottle" });
// 調節器（兩段式）：黃銅本體、T 型旋鈕、高壓表＋低壓表、出口、洩壓口、流量限制孔、盤管
const REG = (id, layer, x, a0H) => {
  const z = -1.4;
  VC(`${id}Body`, layer, 0.6, 13.2, 16.2, "gold", { x, z }); VC(`${id}In`, layer, 0.3, 12.6, 13.2, "gold", { x, z }); VT(`${id}Bonnet`, layer, 0.72, 0.5, 16.2, 17.1, "knurl", { x, z });
  BOX(`${id}Knob`, layer, x - 0.9, x + 0.9, 17.1, 17.3, z - 0.15, z + 0.15, "dark"); HXC(`${id}Out`, layer, 0.2, x + 0.55, x + 1.6, 14.2, z, "gold"); ZC(`${id}Vent`, layer, 0.12, z - 0.9, z - 0.5, x, 15.8, "steel2");
  BOX(`${id}Rfo`, layer, x - 0.25, x + 0.25, 12.9, 13.1, z - 0.25, z + 0.25, "dark");
  GAUGE(`${id}GH`, layer, R2(x - 0.95), 14.6, R2(z + 0.5), 0.85, a0H); GAUGE(`${id}GL`, layer, R2(x + 0.95), 15.9, R2(z + 0.5), 0.85, 75);
  PIPE(`${id}Pig`, layer, [[x + 3.1 * 0 + (id === "rA" ? 1.5 : -1.5), 12.9, 0], [x + (id === "rA" ? 1.5 : -1.5), 12.9, z], [x, 12.9, z]], 0.16, "steel2", { noClamp: true });
  for (let i = 0; i < 3; i++) HXT(`${id}Coil${i}`, layer, 0.46, 0.3, R2(x + (id === "rA" ? 0.45 : -0.45) + (id === "rA" ? 0.35 : -0.35) * i), R2(x + (id === "rA" ? 0.45 : -0.45) + (id === "rA" ? 0.35 : -0.35) * i + 0.2), 12.9, z, "steel2");
  PIPE(`${id}Hdr`, layer, id === "rA" ? [[x + 1.6, 14.2, z], [0.4, 14.2, z]] : [[x - 1.6, 14.2, z], [0.4, 14.2, z]], 0.16, "steel2", { noClamp: true });
};
REG("rA", "regA", -2.2, -25); REG("rB", "regB", 2.2, -25);
// 吹淨支路（貼左牆）：氮氣入口、止回閥、三顆氣動閥、真空產生器、小管
const PX = -4.1, PZ = -2.2;
PIPE("pgN", "purge", [[-5.4, 11.8, PZ], [PX, 11.8, PZ], [PX, 4.0, PZ]], 0.14, "steel2"); P({ id: "pgNLabel", layer: "purge", shape: "box", size: [0.04, 0.5, 0.5], pos: [-4.85, 11.8, PZ], mat: "pneu" });
for (const [i, y] of [10.2, 7.6, 5.2].entries()) { BOX(`pgV${i}`, "purge", PX - 0.4, PX + 0.4, y - 0.4, y + 0.4, PZ - 0.4, PZ + 0.4, "steel2"); ZC(`pgAct${i}`, "purge", 0.42, PZ + 0.4, PZ + 1.5, PX, y, "pneu"); ZC(`pgInd${i}`, "purge", 0.07, PZ + 1.5, PZ + 1.9, PX, y, "lampY"); }
BOX("pgVen", "purge", PX - 0.5, PX + 0.5, 3.0, 4.0, PZ - 0.5, PZ + 0.5, "dark"); HXT("pgVenTube", "purge", 0.28, 0.16, PX - 1.6, PX - 0.5, 3.5, PZ, "steel2");
PIPE("pgOut", "purge", [[PX, 9.0, PZ], [-2.6, 9.0, PZ], [-2.6, 12.0, PZ]], 0.12, "steel2", { noClamp: true });
// 控制器：機身（四面板）、前蓋（螢幕、按鍵、緊急停止、指示燈）、電路板
BOX("ctlBack", "ctl", 2.8, 4.6, 8, 17, 3.3, 3.45, "dark"); BOX("ctlL", "ctl", 2.8, 2.95, 8, 17, 3.3, 4.3, "band"); BOX("ctlR", "ctl", 4.45, 4.6, 8, 17, 3.3, 4.3, "band"); BOX("ctlT", "ctl", 2.8, 4.6, 16.85, 17, 3.3, 4.3, "band"); BOX("ctlB", "ctl", 2.8, 4.6, 8, 8.15, 3.3, 4.3, "band");
P({ id: "ctlGland", layer: "ctl", shape: "cyl", size: [0.13, 0.3], rot: V, pos: [3.2, 17.15, 3.8], at: [[0, 0, 0], [0.4, 0, 0], [0.8, 0, 0]], mat: "conn" }); PIPE("ctlAir", "ctl", [[4.2, 17.0, 3.8], [4.2, 19.0, 3.8]], 0.06, "pneu", { noClamp: true });
BOX("cfPlate", "ctlDoor", 2.8, 4.6, 8, 17, 4.3, 4.45, "cab2"); BOX("cfScr", "ctlDoor", 3.0, 4.4, 13.4, 15.4, 4.45, 4.5, "screen");
P({ id: "cfLed", layer: "ctlDoor", shape: "cyl", size: [0.08, 0.05], pos: [3.2, 16.2, 4.47], at: [[0, 0, 0], [0.45, 0, 0], [0.9, 0, 0]], mat: "lampG" }); P({ id: "cfLedA", layer: "ctlDoor", shape: "cyl", size: [0.08, 0.05], pos: [3.2, 12.9, 4.47], at: [[0, 0, 0], [0.45, 0, 0], [0.9, 0, 0]], mat: "lampY" });
P({ id: "cfKey", layer: "ctlDoor", shape: "cyl", size: [0.13, 0.08], pos: [3.2, 11.4, 4.48], at: grid(0, 0.9, 3, 0, -1.6, 4, 0).map(([a, b, c]) => [a, b, 0]), mat: "dark" });
ZC("cfEstop", "ctlDoor", 0.4, 4.45, 4.8, 3.7, 9.2, "estop"); VT("cfEstopRing", "ctlDoor", 0.55, 0.4, 9.2 - 0.05, 9.2 + 0.05, "lampY", { x: 3.7, z: 4.5, rot: [0, 0, 0], size: [0.55, 0.4, 0.06], pos: [3.7, 9.2, 4.47] });
P({ id: "cfBolt", layer: "ctlDoor", shape: "cyl", size: [0.06, 0.05], pos: [0, 0, 4.47], at: [[2.95, 8.15, 0], [4.45, 8.15, 0], [2.95, 16.85, 0], [4.45, 16.85, 0]], mat: "steel" });
P({ id: "pcbBoard", layer: "ctlPcb", shape: "slab", size: [1.5, 7.5, 0.1], r: 0.03, pos: [3.7, 12.5, 3.52], mat: "pcb" });
BOX("pcbChip", "ctlPcb", 3.2, 4.1, 14.4, 15.3, 3.57, 3.67, "chip"); P({ id: "pcbChipPin", layer: "ctlPcb", shape: "box", size: [0.9, 0.02, 0.02], pos: [3.65, 14.85, 3.6], at: [[0, 0.5, 0], [0, -0.5, 0], [0, 0.35, 0], [0, -0.35, 0]], mat: "trace" });
P({ id: "pcbCap", layer: "ctlPcb", shape: "cyl", size: [0.12, 0.28], rot: HX, pos: [3.2, 0, 3.64], at: [[0, 13.3, 0], [0.5, 13.3, 0], [1.0, 13.3, 0], [0, 12.9, 0], [0.5, 12.9, 0]], mat: "pneu" });
BOX("pcbRelay", "ctlPcb", 3.1, 4.3, 11.2, 12.1, 3.57, 4.0, "pneu"); BOX("pcbRelay2", "ctlPcb", 3.1, 4.3, 10.0, 10.9, 3.57, 4.0, "pneu"); BOX("pcbTerm", "ctlPcb", 3.1, 4.3, 8.6, 9.3, 3.57, 3.9, "gold"); P({ id: "pcbTermScr", layer: "ctlPcb", shape: "cyl", size: [0.07, 0.04], pos: [3.3, 8.95, 3.9], at: [[0, 0, 0], [0.4, 0, 0], [0.8, 0, 0]], mat: "dark" });
P({ id: "pcbTrace", layer: "ctlPcb", shape: "box", size: [0.04, 1.5, 0.02], pos: [3.7, 12.5, 3.58], at: [[-0.5, 1.3, 0], [-0.25, 1.6, 0], [0.25, 1.3, 0], [0.5, 1.6, 0], [0.0, -1.0, 0]], mat: "trace" });
BOX("pcbConn", "ctlPcb", 3.2, 4.2, 16.0, 16.5, 3.57, 3.85, "conn"); P({ id: "pcbWire", layer: "ctlPcb", shape: "box", size: [0.06, 0.8, 0.06], pos: [3.4, 16.9, 3.7], at: [[0, 0, 0], [0.3, 0, 0], [0.6, 0, 0]], mat: "lampR" });

// ═════ 2 純化器（x＝20）：底座、不鏽鋼罐（上下蓋、法蘭螺栓、加熱帶）、吸附劑顆粒、進出口閥與壓力表、下游過濾器 ═════
const XP = X.pur;
LAY("purBase", [6, 3, XP, 1]); LAY("purCan", [4, 13, XP, 7]); LAY("purBed", [3, 5, XP, 4.2]); LAY("purFilt", [4, 3, XP + 5, 7.5]);
BOX("pbPlate", "purBase", XP - 3, XP + 3, 0, 0.6, -2.5, 2.5, "band"); P({ id: "pbBolt", layer: "purBase", shape: "cyl", size: [0.12, 0.2], rot: V, pos: [XP, 0.7, 0], at: [[-2.6, 0, -2.1], [2.6, 0, -2.1], [-2.6, 0, 2.1], [2.6, 0, 2.1]], mat: "steel" });
BOX("pbSkid", "purBase", XP - 3.4, XP + 3.4, 0, 0.15, -2.9, 2.9, "dark"); P({ id: "pbLeg", layer: "purBase", shape: "cyl", size: [0.25, 0.5], rot: V, pos: [XP, 0.3, 0], at: [[-2.9, 0, -2.5], [2.9, 0, -2.5], [-2.9, 0, 2.5], [2.9, 0, 2.5]], mat: "steel" });
VC("pcLower", "purCan", 1.8, 0.6, 7, "steel2", { x: XP }); VC("pcUpper", "purCan", 1.8, 7.3, 11.5, "steel2", { x: XP }); P({ id: "pcDomeT", layer: "purCan", shape: "sphere", size: [1.8], scale: [1, 0.45, 1], pos: [XP, 11.5, 0], mat: "steel2" }); P({ id: "pcDomeB", layer: "purCan", shape: "sphere", size: [1.8], scale: [1, 0.35, 1], pos: [XP, 0.6, 0], mat: "steel2" });
VT("pcFlange", "purCan", 2.3, 1.6, 7.0, 7.3, "steel", { x: XP }); P({ id: "pcFlBolt", layer: "purCan", shape: "cyl", size: [0.12, 0.45], rot: V, pos: [XP, 7.15, 0], at: RING(12, 2.0), mat: "dark" });
VT("pcHeater", "purCan", 1.88, 1.8, 2.5, 5.5, "dark", { x: XP }); P({ id: "pcHeatStrap", layer: "purCan", shape: "tube", size: [1.92, 1.8, 0.1], rot: V, pos: [XP, 4, 0], at: [[0, -1.2, 0], [0, 1.2, 0]], mat: "knurl" }); PIPE("pcHeatCable", "purCan", [[XP + 1.9, 5.0, 0], [XP + 2.6, 5.0, 0], [XP + 2.6, 2.0, 0]], 0.07, "conn", { noClamp: true });
BOX("pcPlate", "purCan", XP - 0.6, XP + 0.6, 8.6, 9.8, 1.78, 1.84, "gold"); P({ id: "pcPlateTxt", layer: "purCan", shape: "box", size: [0.8, 0.07, 0.02], pos: [XP, 9.2, 1.85], at: [[0, 0.3, 0], [0, 0, 0], [0, -0.3, 0]], mat: "dark" });
ZC("pcPort", "purCan", 0.2, 0, 0, XP, 0, "steel2", { size: [0.2, 0.01] }); parts.pop();
HXC("pcIn", "purCan", 0.22, XP - 2.4, XP - 1.6, LY, 0, "steel2"); HXT("pcInNut", "purCan", 0.36, 0.2, XP - 2.1, XP - 1.8, LY, 0, "knurl"); HXC("pcOut", "purCan", 0.22, XP + 1.6, XP + 2.4, LY, 0, "steel2"); HXT("pcOutNut", "purCan", 0.36, 0.2, XP + 1.8, XP + 2.1, LY, 0, "knurl");
GAUGE("pgIn", "purBase", XP - 1.5, 9.8, 1.5, 0.6, 20); GAUGE("pgOut", "purBase", XP + 1.5, 9.8, 1.5, 0.6, 20);
PIPE("pcGaugeLn", "purBase", [[XP - 1.5, 9.1, 1.6], [XP - 1.5, 9.1, 0], [XP - 1.5, LY + 0.0, 0]], 0.07, "steel2", { noClamp: true });
P({ id: "pcBead", layer: "purBed", shape: "sphere", size: [0.17], pos: [XP, 4, 0], at: (() => { const o = []; let k = 0; for (let y = 1.5; y <= 6.5; y += 0.5) for (const r of [0.0, 0.55, 1.0, 1.35]) { const n = r === 0 ? 1 : Math.round(r * 7); for (let i = 0; i < n; i++) { const [x, z] = pol(i * (360 / n) + (k++ % 2) * 17, r); o.push([x, R2(y - 4 + (i % 2) * 0.15), z]); } } return o; })(), mat: "bead" });
VC("pcTube", "purBed", 0.35, 1.0, 7.0, "window", { x: XP });
VC("pfBody", "purFilt", 0.8, 5.8, 9.2, "steel2", { x: XP + 5 }); VT("pfCapA", "purFilt", 0.9, 0.5, 5.6, 6.0, "knurl", { x: XP + 5 }); VT("pfCapB", "purFilt", 0.9, 0.5, 9.0, 9.4, "knurl", { x: XP + 5 }); BOX("pfLabel", "purFilt", XP + 4.5, XP + 5.5, 7.0, 7.9, 0.78, 0.82, "lampY");
HXC("pfIn", "purFilt", 0.2, XP + 2.4, XP + 4.1, LY, 0, "steel2"); PIPE("pfOutPipe", "purFilt", [[XP + 5, 9.4, 0], [XP + 5, 10.4, 0], [XP + 6.2, 10.4, 0], [XP + 6.2, LY, 0], [XP + 11, LY, 0]], 0.2, "steel2"); PIPE("pfInPipe", "purFilt", [[XP + 2.4, LY, 0], [XP + 5, LY, 0], [XP + 5, 5.8, 0]], 0.2, "steel2", { noClamp: true });
P({ id: "pfArrow", layer: "purFilt", shape: "box", size: [0.7, 0.2, 0.04], pos: [XP + 5, 6.5, 0.84], mat: "dark" });

// ═════ 3 閥箱 VMB（x＝38）：外殼、窗門、三條支路（stick）、集管、洩漏感測、排氣口、氮氣吹淨線 ═════
const XV = X.vmb, VX0 = XV - 7, VX1 = XV + 7;
LAY("vmbShell", [14, 17, XV, 8.5]); LAY("vmbDoor", [14, 17, XV, 8.5]); LAY("vmbStx", [14, 12, XV, 7.5]); LAY("stk", [13, 1, XV, LY]);
for (let i = 1; i <= 5; i++) LAY(`vc${i}`, [2, 3, XV + (i - 3) * 2.6, LY]);
BOX("vbPlinth", "vmbShell", VX0, VX1, 0, 0.8, -2.5, 2.5, "band"); BOX("vbBack", "vmbShell", VX0, VX1, 0.8, 16.5, -2.5, -2.3, "cab2"); BOX("vbL", "vmbShell", VX0, VX0 + 0.2, 0.8, 16.5, -2.5, 2.5, "cab"); BOX("vbR", "vmbShell", VX1 - 0.2, VX1, 0.8, 16.5, -2.5, 2.5, "cab"); BOX("vbTop", "vmbShell", VX0, VX1, 16.3, 16.5, -2.5, 2.5, "cab"); BOX("vbFloor", "vmbShell", VX0 + 0.2, VX1 - 0.2, 0.8, 0.95, -2.3, 2.3, "steel");
VC("vbDuct", "vmbShell", 0.7, 16.5, 18.6, "steel2", { x: XV - 4, z: -1 }); VT("vbDuctFl", "vmbShell", 1.0, 0.65, 16.5, 16.75, "steel", { x: XV - 4, z: -1 }); VT("vbDuctClamp", "vmbShell", 0.78, 0.68, 17.6, 17.9, "knurl", { x: XV - 4, z: -1 });
P({ id: "vbFootBolt", layer: "vmbShell", shape: "cyl", size: [0.12, 0.16], rot: V, pos: [XV, 0.85, 0], at: [[-6.4, 0, -2.0], [6.4, 0, -2.0], [-6.4, 0, 2.0], [6.4, 0, 2.0]], mat: "steel" });
P({ id: "vbSensor", layer: "vmbShell", shape: "cyl", size: [0.45, 0.2], rot: V, pos: [XV + 3, 1.05, 1.0], mat: "det" }); VT("vbSensorMesh", "vmbShell", 0.5, 0.3, 1.15, 1.25, "knurl", { x: XV + 3, z: 1.0 }); P({ id: "vbSensorLed", layer: "vmbShell", shape: "sphere", size: [0.06], pos: [XV + 3.3, 1.2, 1.4], mat: "ledG" });
PIPE("vbHdr", "vmbShell", [[VX0 + 0.9, 13.2, -1.6], [VX0 + 0.9, 3.5, -1.6]], 0.22, "steel2"); PIPE("vbHdrIn", "vmbShell", [[VX0, LY, 0], [VX0 + 0.9, LY, 0], [VX0 + 0.9, LY, -1.6]], 0.2, "steel2", { noClamp: true });
PIPE("vbN2", "vmbShell", [[VX0 + 0.5, 15.2, -2.0], [VX1 - 0.5, 15.2, -2.0]], 0.07, "pneu", { noClamp: true }); P({ id: "vbN2Dot", layer: "vmbShell", shape: "box", size: [0.04, 0.3, 0.3], pos: [VX0 + 0.5, 15.2, -2.0], mat: "pneu" });
BOX("vbPlate", "vmbShell", XV - 1, XV + 1, 14.3, 15.0, -2.28, -2.2, "gold"); BOX("vbWarn", "vmbShell", XV + 3, XV + 5.5, 14.3, 15.2, -2.28, -2.2, "warn");
// 窗門（含觀察窗、把手、鉸鍊、螺絲、銘板）
BOX("vdTop", "vmbDoor", VX0 + 0.2, VX1 - 0.2, 14.5, 16.3, 2.5, 2.7, "cab"); BOX("vdBot", "vmbDoor", VX0 + 0.2, VX1 - 0.2, 0.95, 1.9, 2.5, 2.7, "cab"); BOX("vdL", "vmbDoor", VX0 + 0.2, VX0 + 1.0, 1.9, 14.5, 2.5, 2.7, "cab"); BOX("vdR", "vmbDoor", VX1 - 1.0, VX1 - 0.2, 1.9, 14.5, 2.5, 2.7, "cab");
BOX("vdGlass", "vmbDoor", VX0 + 1.0, VX1 - 1.0, 1.9, 14.5, 2.56, 2.62, "glassDoor"); BOX("vdTrim", "vmbDoor", VX0 + 0.9, VX1 - 0.9, 14.4, 14.6, 2.7, 2.78, "steel2"); BOX("vdTrim2", "vmbDoor", VX0 + 0.9, VX1 - 0.9, 1.8, 2.0, 2.7, 2.78, "steel2");
BOX("vdHandle", "vmbDoor", VX1 - 0.95, VX1 - 0.75, 6, 10, 2.78, 3.2, "steel2"); P({ id: "vdHinge", layer: "vmbDoor", shape: "cyl", size: [0.15, 1.2], rot: V, pos: [VX0 + 0.1, 0, 2.7], at: [[0, 3, 0], [0, 8, 0], [0, 13.5, 0]], mat: "steel" });
P({ id: "vdScrew", layer: "vmbDoor", shape: "cyl", size: [0.07, 0.05], pos: [0, 0, 2.72], at: [...grid(VX0 + 0.5, VX1 - 0.5, 9, 15.4, 15.4, 1, 0), ...grid(VX0 + 0.5, VX1 - 0.5, 9, 1.4, 1.4, 1, 0)], mat: "steel" }); BOX("vdName", "vmbDoor", XV - 2, XV + 2, 15.0, 16.0, 2.7, 2.74, "gold");
// 上下兩條固定 stick（簡化）與中間可抽出的 stick（含五個元件）
const COMP = {
  valve: (id, layer, x, y) => { BOX(`${id}B`, layer, x - 0.6, x + 0.6, y - 0.5, y + 0.5, -0.5, 0.5, "steel2"); VC(`${id}A`, layer, 0.42, y + 0.5, y + 1.7, "pneu", { x }); VC(`${id}I`, layer, 0.06, y + 1.7, y + 2.1, "lampY", { x }); P({ id: `${id}Bolt`, layer, shape: "cyl", size: [0.06, 0.1], rot: HX, pos: [x, y, 0], at: [[-0.65, 0.35, 0.35], [-0.65, -0.35, -0.35], [0.65, 0.35, -0.35], [0.65, -0.35, 0.35]], mat: "steel" }); },
  filter: (id, layer, x, y) => { HXC(`${id}B`, layer, 0.5, x - 0.9, x + 0.9, y, 0, "steel2"); HXT(`${id}Cp`, layer, 0.58, 0.3, x - 0.95, x - 0.7, y, 0, "knurl"); HXT(`${id}Cp2`, layer, 0.58, 0.3, x + 0.7, x + 0.95, y, 0, "knurl"); BOX(`${id}Lb`, layer, x - 0.3, x + 0.3, y - 0.2, y + 0.2, 0.48, 0.52, "lampY"); },
  reg: (id, layer, x, y) => { HXC(`${id}B`, layer, 0.52, x - 0.7, x + 0.7, y, 0, "gold"); VC(`${id}K`, layer, 0.36, y + 0.5, y + 1.3, "knurl", { x }); BOX(`${id}Kn`, layer, x - 0.5, x + 0.5, y + 1.3, y + 1.42, -0.1, 0.1, "dark"); ZC(`${id}G`, layer, 0.3, 0.5, 0.75, x, y + 0.0, "panel"); P({ id: `${id}Nd`, layer, shape: "box", size: [0.26, 0.04, 0.03], pos: [x + 0.06, y + 0.1, 0.78], rot: [0, 0, 40], mat: "estop" }); },
  pt: (id, layer, x, y) => { HXC(`${id}B`, layer, 0.28, x - 0.7, x + 0.7, y, 0, "steel2"); HXT(`${id}N`, layer, 0.4, 0.2, x - 0.2, x + 0.2, y, 0, "knurl"); VC(`${id}C`, layer, 0.14, y + 0.28, y + 1.5, "conn", { x }); BOX(`${id}Lb`, layer, x - 0.2, x + 0.2, y - 0.2, y + 0.2, 0.26, 0.3, "pneu"); },
};
const KIND = ["valve", "filter", "reg", "pt", "valve"];
[3.5, 11.5].forEach((y, si) => { BOX(`stR${si}`, "vmbStx", VX0 + 1.2, VX1 - 1.2, y - 0.7, y - 0.55, -1.0, 0.8, "dark"); PIPE(`stP${si}`, "vmbStx", [[VX0 + 0.9, y, -1.6], [VX0 + 1.8, y, -1.6], [VX0 + 1.8, y, 0], [VX1 - 1.0, y, 0]], 0.14, "steel2", { noClamp: true }); KIND.forEach((k, i) => COMP[k](`s${si}c${i}`, "vmbStx", XV + (i - 2) * 2.6, y)); });
BOX("stkRail", "stk", VX0 + 1.2, VX1 - 1.2, LY - 0.7, LY - 0.55, -1.0, 0.8, "dark"); BOX("stkRail2", "stk", VX0 + 1.2, VX1 - 1.2, LY - 0.55, LY - 0.45, 0.3, 0.8, "steel"); PIPE("stkP", "stk", [[VX0 + 0.9, LY, -1.6], [VX0 + 1.8, LY, -1.6], [VX0 + 1.8, LY, 0], [VX1, LY, 0]], 0.14, "steel2", { noClamp: true });
P({ id: "stkScrew", layer: "stk", shape: "cyl", size: [0.07, 0.05], pos: [XV, LY - 0.5, 0.82], at: [[-5, 0, 0], [-2.5, 0, 0], [0, 0, 0], [2.5, 0, 0], [5, 0, 0]], mat: "steel" });
KIND.forEach((k, i) => COMP[k](`m${i}`, `vc${i + 1}`, XV + (i - 2) * 2.6, LY));
PIPE("vbOut", "vmbShell", [[VX1 - 0.1, LY, 0], [VX1 + 1.0, LY, 0]], 0.2, "steel2", { noClamp: true });

// ═════ 4 雙套管（x＝58，橫剖特寫）：內管、外套管（可抽開）、端封、支撐環、偵測點、氣動閥 ═════
const XD = X.dbl, DL = XD - 8, DR = XD + 8;
LAY("dblPipe", [18, 3, XD, LY]); LAY("dblJacket", [14, 3, XD, LY]); LAY("dblSkin", [14, 3, XD, LY]); LAY("dblDet", [4, 5, XD + 4, 10]); LAY("dblHole", [1, 1, XD, LY + 0.5]); LAY("dblValve", [3, 5, XD - 9, LY + 1]); LAY("dblValveAct", [3, 5, XD - 9, LY + 2]);
HXC("dbIn", "dblPipe", 0.45, DL - 0.6, DR + 0.6, LY, 0, "steel2"); P({ id: "dbWeld", layer: "dblPipe", shape: "tube", size: [0.5, 0.44, 0.12], rot: HX, pos: [XD, LY, 0], at: [[-6, 0, 0], [-3, 0, 0], [0, 0, 0], [3, 0, 0], [6, 0, 0]], mat: "knurl" });
P({ id: "dbSupport", layer: "dblPipe", shape: "tube", size: [0.86, 0.44, 0.14], rot: HX, pos: [XD, LY, 0], at: [[-6.2, 0, 0], [-2.1, 0, 0], [2.1, 0, 0], [6.2, 0, 0]], mat: "rubber" });
P({ id: "dbArrow", layer: "dblPipe", shape: "box", size: [1.1, 0.04, 0.3], pos: [XD - 4.2, LY + 0.46, 0], mat: "lampY" }); P({ id: "dbBand", layer: "dblPipe", shape: "tube", size: [0.5, 0.44, 0.25], rot: HX, pos: [XD - 7.2, LY, 0], mat: "ringA" });
HXT("dbSealL", "dblPipe", 1.12, 0.46, DL - 0.5, DL + 0.5, LY, 0, "steel"); HXT("dbSealR", "dblPipe", 1.12, 0.46, DR - 0.5, DR + 0.5, LY, 0, "steel"); P({ id: "dbSealBolt", layer: "dblPipe", shape: "cyl", size: [0.07, 0.12], rot: HX, pos: [0, LY, 0], at: [...RING(8, 1.0).map(([y, , z]) => [DL - 0.55, z, y].map((v, i) => (i === 1 ? R2(LY + v) : v))), ...RING(8, 1.0).map(([y, , z]) => [DR + 0.55, z, y].map((v, i) => (i === 1 ? R2(LY + v) : v)))], mat: "steel" });
P({ id: "dbStand", layer: "dblPipe", shape: "box", size: [0.3, LY - 1.1, 0.3], pos: [0, (LY - 1.1) / 2, 0], at: [[XD - 5, 0, 0], [XD + 5, 0, 0]].map(([x, y, z]) => [x, y, z]), mat: "band" }); P({ id: "dbSaddle", layer: "dblPipe", shape: "box", size: [1.4, 0.2, 1.3], pos: [0, LY - 1.15, 0], at: [[XD - 5, 0, 0], [XD + 5, 0, 0]], mat: "steel" }); P({ id: "dbFoot", layer: "dblPipe", shape: "box", size: [1.4, 0.12, 1.4], pos: [0, 0.06, 0], at: [[XD - 5, 0, 0], [XD + 5, 0, 0]], mat: "dark" });
HXT("djSleeve", "dblJacket", 0.95, 0.85, DL + 0.3, DR - 0.3, LY, 0, "window"); HXT("djSteel", "dblSkin", 1.0, 0.94, DL + 0.5, DR - 0.5, LY, 0, "steel2"); P({ id: "djWeld", layer: "dblJacket", shape: "tube", size: [1.06, 0.94, 0.14], rot: HX, pos: [XD, LY, 0], at: [[-6.6, 0, 0], [-3.3, 0, 0], [0, 0, 0], [3.3, 0, 0], [6.6, 0, 0]], mat: "knurl" });
P({ id: "djClamp", layer: "dblSkin", shape: "tube", size: [1.12, 0.98, 0.2], rot: HX, pos: [XD, LY, 0], at: [[-5, 0, 0], [5, 0, 0]], mat: "knurl" }); P({ id: "djBand", layer: "dblSkin", shape: "tube", size: [1.02, 0.96, 0.4], rot: HX, pos: [XD - 1.6, LY, 0], mat: "ringB" }); P({ id: "djArrow", layer: "dblSkin", shape: "box", size: [1.2, 0.04, 0.34], pos: [XD + 3.0, LY + 1.02, 0], mat: "lampY" });
ZC("ddTap", "dblDet", 0.14, 0, 0, 0, 0, "steel2", { size: [0.14, 0.01] }); parts.pop();
PIPE("ddPipe", "dblDet", [[XD + 4, LY + 0.9, 0], [XD + 4, LY + 2.6, 0], [XD + 4, LY + 2.6, 0.01]], 0.12, "steel2", { noClamp: true }); BOX("ddBox", "dblDet", XD + 3.1, XD + 4.9, LY + 2.6, LY + 4.3, -0.7, 0.7, "det");
P({ id: "ddMesh", layer: "dblDet", shape: "sphere", size: [0.5], scale: [1, 0.5, 1], pos: [XD + 4, LY + 4.3, 0], mat: "knurl" }); P({ id: "ddLed", layer: "dblDet", shape: "sphere", size: [0.11], pos: [XD + 3.5, LY + 3.7, 0.72], at: [[0, 0, 0], [0.5, 0, 0], [1.0, 0, 0]].map(([a, b, c]) => [a, b, c]), mat: "ledG" });
P({ id: "ddLedR", layer: "dblDet", shape: "sphere", size: [0.14], pos: [XD + 4.4, LY + 3.7, 0.74], mat: "led" }); BOX("ddCap", "dblDet", XD + 3.2, XD + 4.8, LY + 2.4, LY + 2.6, -0.5, 0.5, "steel"); P({ id: "ddCable", layer: "dblDet", shape: "cyl", size: [0.05, 2.5], rot: V, pos: [XD + 5.2, LY + 3.4, 0], mat: "conn" });
P({ id: "dhHole", layer: "dblHole", shape: "sphere", size: [0.17], scale: [1.4, 0.6, 1.4], pos: [XD - 1.5, LY + 0.45, 0], mat: "dark" });
BOX("dvBody", "dblValve", XD - 10, XD - 8.6, LY - 0.55, LY + 0.55, -0.55, 0.55, "steel2"); VC("dvNeck", "dblValveAct", 0.24, LY + 0.55, LY + 1.0, "steel", { x: XD - 9.3 }); VC("dvAct", "dblValveAct", 0.52, LY + 1.0, LY + 2.3, "pneu", { x: XD - 9.3 }); VC("dvInd", "dblValveAct", 0.07, LY + 2.3, LY + 2.75, "lampG", { x: XD - 9.3 }); VT("dvRing", "dblValveAct", 0.56, 0.46, LY + 2.2, LY + 2.35, "dark", { x: XD - 9.3 });
PIPE("dvPipe", "dblPipe", [[XD - 15, LY, 0], [DL - 0.6, LY, 0]], 0.2, "steel2", { noClamp: true }); PIPE("dvPipe2", "dblPipe", [[50.6, LY, 0], [XD - 10, LY, 0]], 0.2, "steel2", { noClamp: true });
PIPE("dbPurgeLn", "dblPipe", [[DR - 1.0, LY + 1.0, 0], [DR - 1.0, LY + 2.6, 0], [DR + 2.0, LY + 2.6, 0]], 0.07, "pneu", { noClamp: true }); PIPE("dbOutPipe", "dblPipe", [[DR + 0.6, LY, 0], [66.4, LY, 0]], 0.2, "steel2", { noClamp: true });

// ═════ 5 製程腔與乾式泵（x＝76／87）：腔壁、噴頭孔陣、吸盤與晶圓、質量流量控制器、抽氣口、泵 ═════
const XC = X.chm;
LAY("chm", [8, 11, XC, 5]); LAY("chShw", [5.2, 1, XC, 7.3]); LAY("chMfc", [6, 3, XC - 2, 12.4]); LAY("chWf", [3.4, 1, XC, 3.1]); LAY("pmp", [6, 5, X.pmp, 2.2]);
VT("chWall", "chm", 3.5, 3.35, 0.9, 7.2, "window"); VT("chBotFl", "chm", 3.95, 3.2, 0.5, 0.9, "steel2", { x: XC }); VC("chBase", "chm", 3.95, 0.0, 0.5, "band", { x: XC }); VT("chTopFl", "chm", 3.95, 3.0, 7.2, 7.6, "steel2", { x: XC });
for (const nm of ["chWall", "chBotFl", "chTopFl"]) { const p = parts.find((q) => q.id === nm); p.pos[0] = XC; }
parts.find((q) => q.id === "chBase").pos[0] = XC; 
P({ id: "chBolt", layer: "chm", shape: "cyl", size: [0.1, 0.12], rot: V, pos: [XC, 7.66, 0], at: RING(18, 3.65), mat: "steel" }); P({ id: "chBotBolt", layer: "chm", shape: "cyl", size: [0.1, 0.12], rot: V, pos: [XC, 0.96, 0], at: RING(18, 3.65), mat: "steel" });
VC("chPlenum", "chm", 2.6, 7.6, 10.2, "steel2", { x: XC }); VT("chPlenumRib", "chm", 2.8, 2.55, 8.4, 8.55, "steel", { x: XC }); P({ id: "chPlenumBolt", layer: "chm", shape: "cyl", size: [0.08, 0.12], rot: V, pos: [XC, 10.25, 0], at: RING(12, 2.3), mat: "steel" });
BOX("chView", "chm", XC - 1.0, XC + 1.0, 3.5, 5.3, 3.5, 3.65, "steel2"); BOX("chViewGl", "chm", XC - 0.8, XC + 0.8, 3.7, 5.1, 3.55, 3.7, "glassDoor"); P({ id: "chViewBolt", layer: "chm", shape: "cyl", size: [0.05, 0.08], pos: [XC, 4.4, 3.7], at: [[-0.9, 0.9, 0], [0.9, 0.9, 0], [-0.9, -0.9, 0], [0.9, -0.9, 0]], mat: "steel" });
VC("chChuckStem", "chWf", 0.6, 0.5, 2.2, "steel2", { x: XC }); VC("chChuck", "chWf", 1.9, 2.2, 3.0, "steel2", { x: XC }); VT("chChuckRim", "chWf", 1.95, 1.7, 3.0, 3.12, "dark", { x: XC }); VC("chWafer", "chWf", 1.5, 3.12, 3.18, "wafer", { x: XC }); BOX("chNotch", "chWf", XC - 0.12, XC + 0.12, 3.12, 3.19, 1.4, 1.52, "dark");
P({ id: "chPin", layer: "chWf", shape: "cyl", size: [0.07, 0.4], rot: V, pos: [XC, 3.3, 0], at: RING(3, 1.6, 90), mat: "gold" });
VC("shPlate", "chShw", 2.4, 7.0, 7.4, "steel2", { x: XC }); P({ id: "shHole", layer: "chShw", shape: "cyl", size: [0.06, 0.42], rot: V, pos: [XC, 7.0, 0], at: (() => { const o = []; for (const [r, n] of [[0, 1], [0.5, 6], [1.0, 12], [1.5, 18], [2.0, 24]]) for (let i = 0; i < n; i++) { const [x, z] = pol(i * (360 / n), r); o.push([x, 0, z]); } return o; })(), mat: "dark" });
VT("shRim", "chShw", 2.5, 2.38, 6.95, 7.5, "steel", { x: XC });
BOX("mfcBody", "chMfc", XC - 3.6, XC - 1.6, 11.7, 13.1, -0.7, 0.7, "chip"); BOX("mfcTop", "chMfc", XC - 3.4, XC - 1.8, 13.1, 13.5, -0.5, 0.5, "dark"); BOX("mfcDisp", "chMfc", XC - 3.2, XC - 2.0, 12.0, 12.6, 0.7, 0.74, "screen"); P({ id: "mfcLed", layer: "chMfc", shape: "sphere", size: [0.07], pos: [XC - 3.3, 12.9, 0.72], at: [[0, 0, 0], [0.35, 0, 0], [0.7, 0, 0]], mat: "ledG" }); HXT("mfcNutA", "chMfc", 0.36, 0.2, XC - 3.9, XC - 3.6, 12.4, 0, "knurl"); HXT("mfcNutB", "chMfc", 0.36, 0.2, XC - 1.6, XC - 1.3, 12.4, 0, "knurl"); P({ id: "mfcCable", layer: "chMfc", shape: "cyl", size: [0.07, 1.2], rot: V, pos: [XC - 2.6, 14.1, 0], mat: "conn" });
PIPE("chIn", "chMfc", [[XC - 1.3, 12.4, 0], [XC, 12.4, 0], [XC, 10.2, 0]], 0.2, "steel2");
HXC("chPort", "chm", 0.5, XC + 3.4, XC + 8, 1.6, 0, "steel2"); HXT("chPortFl", "chm", 0.8, 0.45, XC + 4.2, XC + 4.5, 1.6, 0, "steel"); VC("chGate", "chm", 0.5, 1.6, 3.4, "steel", { x: XC + 6 }); VT("chWheel", "chm", 0.8, 0.7, 3.4, 3.55, "knurl", { x: XC + 6 }); BOX("chWheelSp", "chm", XC + 5.2, XC + 6.8, 3.42, 3.5, -0.06, 0.06, "dark");
BOX("pmBody", "pmp", X.pmp - 3, X.pmp + 3, 0.5, 3.6, -2.0, 2.0, "cab"); BOX("pmBase", "pmp", X.pmp - 3.2, X.pmp + 3.2, 0, 0.5, -2.2, 2.2, "band"); P({ id: "pmFin", layer: "pmp", shape: "box", size: [5.4, 0.08, 0.5], pos: [X.pmp, 0, 2.05], at: Array.from({ length: 7 }, (_, i) => [0, 0.9 + i * 0.38, 0]), mat: "dark" });
HXC("pmMotor", "pmp", 0.9, X.pmp + 3, X.pmp + 5, 1.9, 0, "steel"); P({ id: "pmMotorFin", layer: "pmp", shape: "tube", size: [0.98, 0.9, 0.08], rot: HX, pos: [X.pmp + 4, 1.9, 0], at: [[-0.8, 0, 0], [-0.4, 0, 0], [0, 0, 0], [0.4, 0, 0], [0.8, 0, 0]], mat: "knurl" }); P({ id: "pmLed", layer: "pmp", shape: "sphere", size: [0.09], pos: [X.pmp - 2, 3.2, 2.05], at: [[0, 0, 0], [0.4, 0, 0]], mat: "ledG" });
ZC("pmGauge", "pmp", 0.4, 2.0, 2.2, X.pmp - 1.2, 2.7, "panel"); HXT("pmInFl", "pmp", 0.9, 0.5, X.pmp - 3.4, X.pmp - 3.0, 1.6, 0, "steel2");
PIPE("pmOut", "pmp", [[X.pmp, 3.6, 0], [X.pmp, 5.0, 0], [X.abt - 3.4, 5.0, 0]], 0.3, "steel2");

// ═════ 6 尾氣處理器（x＝97）：水槽、燃燒室（燒嘴、火焰）、水洗段（噴淋環、液滴）、排氣管、控制櫃 ═════
const XA = X.abt;
LAY("abTank", [6, 4, XA, 2.3]); LAY("abBurn", [5, 5, XA, 6.5]); LAY("abWash", [5, 5, XA, 11.5]); LAY("abStack", [3, 5, XA, 16]); LAY("abCab", [3, 5, XA + 5, 3]);
VT("tkWall", "abTank", 2.8, 2.65, 0.4, 4.0, "window", { x: XA }); VC("tkWater", "abTank", 2.6, 0.5, 2.6, "water", { x: XA }); VC("tkBase", "abTank", 3.1, 0, 0.4, "band", { x: XA }); VT("tkFl", "abTank", 3.2, 2.5, 3.9, 4.2, "steel2", { x: XA }); P({ id: "tkBolt", layer: "abTank", shape: "cyl", size: [0.1, 0.12], rot: V, pos: [XA, 4.25, 0], at: RING(16, 2.95), mat: "steel" });
BOX("tkGlass", "abTank", XA - 0.3, XA + 0.3, 0.7, 3.0, 2.85, 2.95, "steel2"); P({ id: "tkLevel", layer: "abTank", shape: "box", size: [0.3, 0.3, 0.02], pos: [XA, 0, 2.97], at: [[0, 1.2, 0], [0, 1.9, 0]], mat: "lampY" }); HXC("tkDrain", "abTank", 0.25, XA + 2.8, XA + 4.2, 0.9, 0, "steel2"); VC("tkValve", "abTank", 0.3, 0.9, 1.5, "pneu", { x: XA + 4.0, z: 0 });
PIPE("abIn", "abTank", [[XA - 3.4, 5.0, 0], [XA - 2.6, 5.0, 0]], 0.3, "steel2", { noClamp: true }); HXT("abInFl", "abTank", 0.55, 0.3, XA - 3.0, XA - 2.7, 5.0, 0, "steel", { });
VT("bnWall", "abBurn", 2.6, 2.45, 4.2, 9.0, "window", { x: XA }); VT("bnFl", "abBurn", 3.0, 2.3, 8.9, 9.2, "steel2", { x: XA }); P({ id: "bnBolt", layer: "abBurn", shape: "cyl", size: [0.1, 0.12], rot: V, pos: [XA, 9.25, 0], at: RING(16, 2.75), mat: "steel" });
VT("bnRing", "abBurn", 1.3, 1.0, 5.2, 5.5, "steel", { x: XA }); P({ id: "bnJet", layer: "abBurn", shape: "cyl", size: [0.09, 0.25], rot: V, pos: [XA, 5.5, 0], at: RING(10, 1.15), mat: "dark" }); BOX("bnIgn", "abBurn", XA + 1.6, XA + 2.0, 5.0, 6.4, -0.2, 0.2, "steel2"); P({ id: "bnPilot", layer: "abBurn", shape: "sphere", size: [0.1], pos: [XA + 1.55, 6.3, 0], mat: "heat" }); VC("bnGasLn", "abBurn", 0.12, 4.4, 5.2, "pneu", { x: XA + 1.5 });
BOX("bnGlass", "abBurn", XA - 0.6, XA + 0.6, 6.0, 8.0, 2.62, 2.7, "steel2");
VT("wsWall", "abWash", 2.6, 2.45, 9.2, 14.0, "window", { x: XA }); VT("wsFl", "abWash", 3.0, 2.3, 13.9, 14.2, "steel2", { x: XA }); P({ id: "wsBolt", layer: "abWash", shape: "cyl", size: [0.1, 0.12], rot: V, pos: [XA, 14.25, 0], at: RING(16, 2.75), mat: "steel" });
VT("wsSpray", "abWash", 2.0, 1.8, 12.2, 12.4, "pneu", { x: XA }); P({ id: "wsNozzle", layer: "abWash", shape: "cyl", size: [0.08, 0.3], rot: V, pos: [XA, 12.1, 0], at: RING(10, 1.9), mat: "knurl" }); PIPE("wsFeed", "abWash", [[XA + 2.0, 12.3, 0], [XA + 3.4, 12.3, 0], [XA + 3.4, 10.0, 0]], 0.14, "pneu"); VT("wsPack", "abWash", 2.4, 0.9, 10.2, 10.6, "dark", { x: XA }); VT("wsPack2", "abWash", 2.4, 0.9, 10.7, 11.1, "dark", { x: XA }); VT("wsMist", "abWash", 2.4, 1.0, 13.2, 13.5, "knurl", { x: XA });
VC("skDuct", "abStack", 1.3, 14.2, 17.8, "steel2", { x: XA }); VT("skFl", "abStack", 1.9, 1.2, 14.2, 14.5, "steel", { x: XA }); P({ id: "skBolt", layer: "abStack", shape: "cyl", size: [0.09, 0.12], rot: V, pos: [XA, 14.55, 0], at: RING(10, 1.65), mat: "steel" }); VT("skClamp", "abStack", 1.38, 1.28, 16.0, 16.3, "knurl", { x: XA }); VT("skCap", "abStack", 1.45, 1.1, 17.7, 18.0, "steel", { x: XA }); BOX("skTag", "abStack", XA - 0.5, XA + 0.5, 15.0, 15.8, 1.28, 1.32, "lampY");
BOX("acBody", "abCab", XA + 3.8, XA + 6.2, 0, 6, -1.0, 1.0, "cab"); BOX("acScr", "abCab", XA + 4.1, XA + 5.9, 3.6, 4.8, 1.0, 1.04, "screen"); P({ id: "acLed", layer: "abCab", shape: "sphere", size: [0.08], pos: [XA + 4.3, 5.3, 1.04], at: [[0, 0, 0], [0.4, 0, 0], [0.8, 0, 0]], mat: "lampG" }); P({ id: "acVent", layer: "abCab", shape: "box", size: [1.6, 0.08, 0.04], pos: [XA + 5, 0, 1.03], at: Array.from({ length: 5 }, (_, i) => [0, 1.0 + i * 0.3, 0]), mat: "dark" }); HXC("acHose", "abCab", 0.1, XA + 2.7, XA + 3.8, 2.0, 0, "conn");
// 火焰（內焰藍、外焰橘，會閃動）與燃燒後的熱氣
P({ id: "flOut", layer: "abBurn", shape: "sphere", size: [0.9], scale: [1, 1.9, 1], pos: [XA, 6.9, 0], mat: "fireOut" }); P({ id: "flIn", layer: "abBurn", shape: "sphere", size: [0.55], scale: [1, 1.6, 1], pos: [XA, 6.5, 0], mat: "fireIn" });
P({ id: "flSide", layer: "abBurn", shape: "sphere", size: [0.3], scale: [1, 1.7, 1], pos: [XA, 6.2, 0], at: RING(6, 1.2, 10), mat: "fireOut" });
// 加熱與電漿示意（機台內，示意）
P({ id: "plasmaGl", layer: "chShw", shape: "cyl", size: [1.9, 1.0], rot: V, pos: [XC, 6.2, 0], mat: "plasma" });

// ═════ 運作動畫（actions）═════
// 站內氣流圖層
LAY("fl", [100, 20, 48, 8]);
const pt = (x, y, z) => [R2(x), R2(y), R2(z)];
actions.needleHigh = { type: "rotate", _說明: "高壓表指針緩降（瓶壓隨使用慢慢下降；示意，不標數值）", parts: ["rAGHNd"], axis: [0, 0, 1], pivot: [R2(-2.2 - 0.95), 14.6, 0], pivots: { rAGHNd: [R2(-2.2 - 0.95), 14.6, -0.9] }, rps: 0.018, rampSpin: true };
actions.lowJit = { type: "vibrate", _說明: "低壓表指針只輕微抖動（出口壓力穩定）", parts: ["rAGLNd"], axis: [0, 1, 0], amp: 0.02, freq: 3 };
actions.fanBeacon = { type: "pulse", parts: ["cbBeaconG"], color: "lampG", glow: 1, freq: 1.0, halo: 0 };
actions.ctlLed = { type: "pulse", parts: ["cfLed"], color: "lampG", glow: 1, freq: 1.2, halo: 0 };
// 氣體：瓶 A 閥 → 盤管 → 調節器（上游密）→ 出口（下游疏）
actions.regIn = { type: "flow", layer: "fl", path: [pt(-0.7, 12.9, 0), pt(-0.7, 12.9, -1.4), pt(-2.2, 12.9, -1.4), pt(-2.2, 14.0, -1.4)], n: 9, size: 0.09, shape: "dot", rate: 0.55, color: "gasC", track: false, free: true, jitter: 0.08 };
actions.regOut = { type: "flow", layer: "fl", path: [pt(-1.6, 14.2, -1.4), pt(0.4, 14.2, -1.4), pt(0.4, LY, -1.4), pt(4.9, LY, -1.4), pt(6.4, LY, -1.4), pt(6.4, LY, 0), pt(12, LY, 0)], n: 3, size: 0.09, shape: "dot", rate: 0.2, color: "gasC", track: false, free: true };
actions.purgeN2 = { type: "flow", layer: "purge", path: [pt(-5.4, 11.8, PZ), pt(PX, 11.8, PZ), pt(PX, 9.0, PZ), pt(-2.6, 9.0, PZ), pt(-2.6, 12.0, PZ), pt(-2.2, 12.9, -1.4)], n: 8, size: 0.09, shape: "dot", rate: 0.5, color: "n2C", track: false, free: true };
actions.lineGas = { type: "flow", layer: "fl", path: [pt(6.4, LY, 0), pt(18.2, LY, 0), pt(19.4, LY, 0), pt(19.4, 1.4, 0)], n: 6, size: 0.1, shape: "dot", rate: 0.3, color: "gasC", track: false, free: true };
// 純化器：帶雜質的氣（橘點）上升穿過吸附床，雜質被留在顆粒表面，乾淨的氣離開
actions.impIn = { type: "flow", layer: "fl", path: [pt(XP - 0.3, 1.5, 0.2), pt(XP - 0.3, 3.0, 0.2), pt(XP + 0.2, 4.2, 0.4)], n: 7, size: 0.08, shape: "dot", rate: 0.22, color: "impC", track: false, free: true, jitter: 0.4 };
actions.cleanOut = { type: "flow", layer: "fl", path: [pt(XP, 6.6, 0), pt(XP, 7.0, 0), pt(XP + 1.9, LY, 0), pt(XP + 5, LY, 0)], n: 5, size: 0.09, shape: "dot", rate: 0.3, color: "gasC", track: false, free: true };
actions.impLeak = { type: "flow", layer: "fl", path: [pt(XP + 0.2, 4.2, 0.3), pt(XP, 6.6, 0), pt(XP + 1.9, LY, 0), pt(XP + 11, LY, 0)], n: 1, size: 0.1, shape: "dot", rate: 0.12, color: "impC", track: false, free: true };
// 雙套管：內管氣體流動；破洞噴出錐狀氣體；環空往兩端擴散；偵測；關閥；氮氣吹淨
actions.dblFlow = { type: "flow", layer: "fl", path: [pt(XD - 10, LY, 0), pt(XD + 9, LY, 0)], n: 12, size: 0.1, shape: "dot", rate: 0.35, color: "gasC", track: false, free: true, jitter: 0.12 };
actions.leakJet = { type: "flow", layer: "fl", path: [pt(XD - 1.5, LY + 0.45, 0), pt(XD - 1.7, LY + 0.88, 0.05)], n: 14, size: 0.12, shape: "dot", rate: 1.1, color: "gasC", track: false, free: true, jitter: 0.5 };
actions.annL = { type: "flow", layer: "fl", path: [pt(XD - 1.6, LY + 0.7, 0), pt(XD - 4, LY + 0.7, 0), pt(XD - 7, LY + 0.7, 0)], n: 6, size: 0.07, shape: "dot", rate: 0.2, color: "gasC", track: false, free: true, jitter: 0.1 };
actions.annR = { type: "flow", layer: "fl", path: [pt(XD - 1.4, LY + 0.7, 0), pt(XD + 2, LY + 0.7, 0), pt(XD + 4, LY + 0.7, 0), pt(XD + 4, LY + 2.5, 0)], n: 6, size: 0.07, shape: "dot", rate: 0.25, color: "gasC", track: false, free: true, jitter: 0.1 };
actions.dblPurge = { type: "flow", layer: "fl", path: [pt(DR - 1.0, LY + 0.7, 0), pt(DL + 1, LY + 0.7, 0)], n: 12, size: 0.08, shape: "dot", rate: 0.4, color: "n2C", track: false, free: true, jitter: 0.1 };
actions.detBlink = { type: "pulse", parts: ["ddLedR"], color: "lampR", glow: 1, freq: 3.2, halo: 1.6 };
actions.valveAct = { type: "pulse", parts: ["dvInd"], color: "lampY", glow: 1, freq: 2, halo: 0 };
// 進製程腔：噴頭孔陣錐狀均勻噴出、沿晶圓表面向外、到邊緣被抽走
for (let i = 0; i < 6; i++) { const [sx, sz] = pol(i * 60, 1.4); actions[`shw${i}`] = { type: "flow", layer: "fl", path: [pt(XC + sx, 7.0, sz), pt(XC + sx * 1.1, 4.2, sz * 1.1), pt(XC + sx * 1.1, 3.25, sz * 1.1)], n: 4, size: 0.08, shape: "dot", rate: 0.3, phase: i * 0.14, color: "gasC", track: false, free: true, jitter: 0.1 }; }
for (let i = 0; i < 4; i++) { const a = i * 90 + 20, [ex, ez] = pol(a, 1.5), [fx, fz] = pol(a, 3.2); actions[`wfOut${i}`] = { type: "flow", layer: "fl", path: [pt(XC, 3.3, 0), pt(XC + ex, 3.3, ez), pt(XC + fx, 1.9, fz), pt(XC + 3.0, 1.6, 0), pt(XC + 8, 1.6, 0)], n: 3, size: 0.08, shape: "dot", rate: 0.25, phase: i * 0.2, color: "gasC", track: false, free: true, jitter: 0.1 }; }
actions.plasmaPulse = { type: "pulse", parts: ["plasmaGl"], color: "plasmaC", glow: 1, freq: 1.7, halo: 2 };
actions.foreline = { type: "flow", layer: "fl", path: [pt(XC + 8, 1.6, 0), pt(X.pmp - 3.0, 1.6, 0), pt(X.pmp, 3.6, 0), pt(X.pmp, 5.0, 0), pt(XA - 3.4, 5.0, 0), pt(XA - 1.4, 5.0, 0)], n: 7, size: 0.1, shape: "dot", rate: 0.3, color: "wasteC", track: false, free: true };
// 尾氣處理：廢氣進燃燒室 → 火焰裡變色 → 水洗段被水珠帶走 → 出口氣流變乾淨
actions.abBurnIn = { type: "flow", layer: "abTank", path: [pt(XA - 3.4, 5.0, 0), pt(XA - 1.0, 5.0, 0), pt(XA - 0.3, 5.6, 0), pt(XA, 6.6, 0)], n: 6, size: 0.1, shape: "dot", rate: 0.3, color: "wasteC", track: false, free: true, jitter: 0.1 };
actions.abAsh = { type: "flow", layer: "abBurn", path: [pt(XA, 6.8, 0), pt(XA, 8.6, 0.2), pt(XA, 10.4, -0.2), pt(XA, 12.6, 0)], n: 8, size: 0.1, shape: "dot", rate: 0.28, color: "ashC", track: false, free: true, jitter: 0.5 };
actions.abClean = { type: "flow", layer: "abStack", path: [pt(XA, 13.0, 0), pt(XA, 15.5, 0), pt(XA, 18.4, 0)], n: 5, size: 0.1, shape: "dot", rate: 0.3, color: "n2C", track: false, free: true };
for (let i = 0; i < 6; i++) { const [sx, sz] = pol(i * 60 + 15, 1.7); actions[`abDrop${i}`] = { type: "flow", layer: "abWash", path: [pt(XA + sx, 12.0, sz), pt(XA + sx * 0.8, 6.0, sz * 0.8), pt(XA + sx * 0.7, 2.6, sz * 0.7)], n: 3, size: 0.07, shape: "liquid", rate: 0.35, phase: i * 0.15, color: "waterC", track: false, free: true, accel: true, band: 0.05, bandO: 0.3 }; }
actions.abFlame = { type: "pulse", parts: ["flOut", "flIn", "flSide"], color: "fireOut", glow: 1, freq: 3.4, halo: 2.4 };
actions.abPilot = { type: "pulse", parts: ["bnPilot"], color: "hotC", glow: 1, freq: 2, halo: 0 };

const A = (layer, p, dx, dy) => ({ layer, p, dx, dy });
Object.assign(anchors, {
  cab: A("cabShell", [-4.4, 17.8, 3.5], -150, -80), bottle: A("botA", [-2.2, 8.5, 1.1], -150, 90), valveA: A("botA", [-2.2, 13.0, 0.5], -150, -80), reg: A("regA", [-2.2, 15.4, -0.8], 150, -80), gH: A("regA", [-3.15, 14.6, -0.4], -150, -70), gL: A("regA", [-1.25, 15.9, -0.4], 150, -70), coil: A("regA", [-1.2, 12.9, -1.4], 150, 80),
  purge: A("purge", [PX, 7.6, PZ + 1.8], -150, 80), ctl: A("ctl", [3.7, 14.4, 4.4], 150, -80), estopA: A("ctlDoor", [3.7, 9.2, 4.8], 150, 80), pcb: A("ctlPcb", [3.7, 14.8, 3.7], 150, -90),
  pur: A("purCan", [XP + 1.8, 9.2, 0.5], 150, -90), bed: A("purBed", [XP, 4.2, 0.9], 150, 90), filt: A("purFilt", [XP + 5.8, 7.5, 0.4], 150, 80),
  vmb: A("vmbShell", [VX1, 12.5, 0.5], 150, -80), stk: A("stk", [XV, LY + 0.4, 0.8], 0, -150), vInlet: A("vc1", [XV - 5.2, LY + 1.1, 0], -150, -90), vFilter: A("vc2", [XV - 2.6, LY, 0.5], -120, 120), vReg: A("vc3", [XV, LY + 1.4, 0], 0, -140), vPt: A("vc4", [XV + 2.6, LY + 1.5, 0], 120, -110), vOut: A("vc5", [XV + 5.2, LY + 1.1, 0], 150, -90),
  dblInner: A("dblPipe", [XD - 5.0, LY, 0.3], -150, 100), dblOuter: A("dblSkin", [XD + 4, LY + 1.0, 0.4], 150, -90), det: A("dblDet", [XD + 4, LY + 3.4, 0.7], 150, -80), hole: A("dblHole", [XD - 1.5, LY + 0.5, 0], -150, -90), dvalve: A("dblValve", [XD - 9.3, LY + 2.2, 0], -150, -90), annulus: A("dblJacket", [XD + 3.0, LY + 0.9, 0.2], 150, 80),
  chm: A("chm", [XC + 3.5, 6.0, 0.3], 150, -90), shw: A("chShw", [XC + 1.8, 7.0, 0.3], 150, -100), pump: A("pmp", [X.pmp + 2, 3.6, 2.0], 150, -90), mfc: A("chMfc", [XC - 2.6, 13.2, 0.4], -150, -80),
  abTank: A("abTank", [XA - 2.7, 1.5, 0.6], -150, 80), abBurn: A("abBurn", [XA - 2.6, 7.2, 0.6], -150, 70), abWash: A("abWash", [XA - 2.6, 12.0, 0.6], -150, 70), abStack: A("abStack", [XA - 1.3, 16.2, 0.6], -150, -70), flame: A("abBurn", [XA + 0.7, 6.9, 0.4], 150, 80),
});
const model = {
  name: "示意 特用氣體送氣系統（爆炸分解）：氣瓶櫃（雙瓶、兩段調節器、吹淨支路、控制器含電路板）→ 純化器 → 閥箱 VMB（可抽出的支路）→ 雙套管（外套可抽開）→ 製程腔（噴頭孔陣、晶圓）與乾式泵 → 尾氣處理器（水槽、燃燒室、水洗段、排氣）（tech-gas）",
  unit: "示意（1＝10 cm）",
  size: { w: 40, h: 18, r: 0.6, t: 30 },
  palette, materials,
  partNames: { cab: "氣瓶櫃", bottle: "鋼瓶", reg: "調節器", purge: "吹淨支路", ctl: "控制器", pur: "純化器", vmb: "閥箱", stk: "支路", dblInner: "內管", dblOuter: "外套管", det: "偵測點", chm: "製程腔", pump: "乾式泵" },
  layers, parts, anchors, actions,
  pose: { yaw0: 0, yawIso: 0, drift: 0 },
  camera: { stand: { d: 70, elev: 24, y: 8 } },
  fx: { dpr: 1, srcPx: 30, shadows: 0, fog: false, dust: false, vaporSprites: false, shimmer: false },
  info: { FY, LY, X, XP, XV, XD, XC, XA, PX, PZ },
};
const out = path.join(path.dirname(new URL(import.meta.url).pathname), "model.json");
fs.writeFileSync(out, JSON.stringify(model, null, 1) + "\n");
const ids = new Set(); for (const p of parts) { if (ids.has(p.id)) console.warn("⚠ 重複零件 id", p.id); ids.add(p.id); }
console.log(`✔ ${out}：${parts.length} 個零件、${parts.reduce((a, p) => a + Math.max(1, (p.at?.length ?? 0) + (p.grid ? p.grid.n[0] * p.grid.n[1] : 0)), 0)} 個實體、${layers.length} 層`);

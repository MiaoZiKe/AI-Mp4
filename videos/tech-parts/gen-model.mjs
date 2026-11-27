// node videos/tech-parts/gen-model.mjs → 寫 videos/tech-parts/model.json
// 2026/11/27 tech-parts（零組件耗材，系列 2 第 18 集）。構造與物理照 physics-spec.md，模組清單與細節見 visual-spec.md。
// 單位：1＝10 cm（示意，不按真實比例），地板頂面 y＝0，x 向右、z 向觀眾。站點：
//   A 蝕刻腔體剖面一角（x 0；腔壁、陶瓷內襯、頂電極、射頻線圈、吸盤、邊緣環、晶圓、電漿）｜B 邊緣環剖面（x 33；被打薄、電場延伸）
//   S 靜電吸盤爆炸站（x 96）｜C 新舊邊緣環對照＋更換（x 66）｜E 陶瓷／金屬表面對照（x 128）｜P 真空泵、閥門、電源（x 150）
//   K 供應商展台（x 180）｜R 無塵室（x 215）。示意，非特定廠牌／型號；不標壽命小時數、市占。
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
  floorC: "#C9D2DE", panel: "#F3F5F8", panel2: "#E2E8F0", seam: "#8E9BB0", band: "#24324C", steel: "#7D8CA6", steel2: "#A9B5C7", dark: "#3E4A60", backC: "#2B3650",
  glassC: "#BFD3F2", lampY: "#F2B632", lampG: "#2FBF71", lampR: "#E5484D", rubber: "#2B2F36", gold: "#C9A24A", estop: "#D93A2B", cutC: "#6E809C",
  cerC: "#F2EBDD", cerDC: "#D9CDB4", quartzC: "#DDF0F4", siC: "#4A5468", sicC: "#2E3340", cuC: "#C47B3E", cuDC: "#A9622D", aluC: "#B8C2D2",
  plasmaC: "#8E7CF6", plasmaPC: "#F06FB8", sheathC: "#2B2250", ionC: "#FFD35A", debrisC: "#3B3427", chipC: "#F4F1EA", heC: "#7FD3F5", plusC: "#E5484D", minusC: "#2F7FE0",
  markC: "#E8613C", brassC: "#C8A24A", yellowBr: "#F2B632", hoseB: "#3E7BD6", hoseR: "#D9534F", wallW: "#F4F6FA", pumpC: "#5C7396", cabC: "#EDEFF3", airC: "#9FD8F5", ffuC: "#FFFFFF", amberC: "#F29A4A",
};
const M = (kind, color, o = {}) => ({ kind, color, ...o });
const glowM = (c, op, ei = 1) => M("std", c, { emissive: c, ei, opacity: op, rough: 1, metal: 0 });
const materials = {
  floor: M("std", "floorC", { rough: 0.7, metal: 0.3, tex: "brushed", texScale: 3 }), panel: M("std", "panel", { rough: 0.55, metal: 0.05, env: 0.25 }), panel2: M("std", "panel2", { rough: 0.6, metal: 0.05, env: 0.2 }),
  seam: M("std", "seam", { rough: 0.6, metal: 0.3 }), band: M("std", "band", { rough: 0.4, metal: 0.3, env: 0.4 }), back: M("std", "backC", { rough: 0.7, metal: 0.1 }),
  steel: M("std", "steel", { rough: 0.35, metal: 0.85, env: 0.5 }), steel2: M("std", "steel2", { rough: 0.3, metal: 0.8, env: 0.6, tex: "brushed", texScale: 2 }), alu: M("std", "aluC", { rough: 0.3, metal: 0.8, env: 0.6, tex: "brushed", texScale: 1.6 }),
  dark: M("std", "dark", { rough: 0.5, metal: 0.4, env: 0.3 }), rubber: M("std", "rubber", { rough: 0.9, metal: 0 }), gold: M("std", "gold", { rough: 0.3, metal: 0.9, env: 0.8 }),
  window: M("phys", "glassC", { rough: 0.05, metal: 0, clearcoat: 1, opacity: 0.3, env: 0.6 }), cut: M("std", "cutC", { rough: 0.8, metal: 0.2 }),
  lampY: M("std", "lampY", { emissive: "lampY", ei: 0.4, rough: 0.4, metal: 0 }), lampG: M("std", "lampG", { emissive: "lampG", ei: 0.35, rough: 0.4, metal: 0 }), lampR: M("std", "lampR", { emissive: "lampR", ei: 0.3, rough: 0.4, metal: 0 }), estop: M("std", "estop", { rough: 0.4, metal: 0, emissive: "estop", ei: 0.15 }),
  cer: M("std", "cerC", { rough: 0.9, metal: 0, env: 0.15 }), cerD: M("std", "cerDC", { rough: 0.95, metal: 0 }), quartz: M("phys", "quartzC", { rough: 0.05, metal: 0, clearcoat: 1, opacity: 0.62, env: 0.8 }), quartzOld: M("phys", "cerDC", { rough: 0.55, metal: 0, opacity: 0.8, env: 0.3 }),
  si: M("std", "siC", { rough: 0.2, metal: 0.65, env: 0.9 }), sic: M("std", "sicC", { rough: 0.85, metal: 0.2, env: 0.2 }), cu: M("std", "cuC", { rough: 0.3, metal: 0.95, env: 0.8 }), cuD: M("std", "cuDC", { rough: 0.35, metal: 0.95, env: 0.7 }),
  plasma: glowM("plasmaC", 0.2, 0.7), plasmaCore: glowM("plasmaC", 0.14, 1.0), plasmaP: glowM("plasmaPC", 0.22, 0.8), sheath: M("std", "sheathC", { rough: 1, metal: 0, opacity: 0.4 }),
  ion: glowM("ionC", 0.95, 0.9), debris: glowM("debrisC", 0.95, 0.1), chip: glowM("chipC", 0.95, 0.4), he: glowM("heC", 0.95, 0.7), plus: glowM("plusC", 0.95, 0.9), minus: glowM("minusC", 0.95, 0.9), mark: M("std", "markC", { rough: 0.5, metal: 0, emissive: "markC", ei: 0.25 }),
  spark: glowM("ionC", 0.9, 1.4), bracket: M("std", "yellowBr", { rough: 0.5, metal: 0, emissive: "yellowBr", ei: 0.35 }), warnY: M("std", "lampY", { rough: 0.5, metal: 0, emissive: "lampY", ei: 0.2 }),
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
const idsOf = (layer) => parts.filter((q) => q.layer === layer).map((q) => q.id);


// ═════ 地板 ═════
LAY("floor", [320, 2, 110, 0], true);
P({ id: "floor", layer: "floor", shape: "slab", size: [340, 0.5, 60], r: 0.2, pos: [110, -0.25, 0], mat: "floor" });
P({ id: "floorSeam", layer: "floor", shape: "slab", size: [340, 0.04, 0.1], pos: [110, 0.01, 0], at: Array.from({ length: 9 }, (_, i) => [0, 0, -20 + i * 5]), mat: "seam" });
const BACKDROP = (id, x0, x1, y1, zb = -3.2) => { LAY(id, [R2(x1 - x0), y1, R2((x0 + x1) / 2), R2(y1 / 2)]); BOX(`${id}P`, id, x0, x1, 0.9, y1, zb, R2(zb + 0.12), "back"); };

// ═════ 站 A：蝕刻腔體剖面一角（x 0）。前面整片拿掉露出內部；左右牆前緣是剖面色 ═════
const Y0 = 0.9, YF = 1.5, WAF_R = 2.25, PUCK_R = 2.1, RG_O = 3.4, RG_I = 2.55, Y_PED = 2.7, Y_ESC = 3.3, Y_RG = 3.55;
LAY("aBase", [19, 1, 0, 0.45]); BOX("aBaseB", "aBase", -9.6, 9.6, 0, 0.8, -6.4, 6.4, "band"); BOX("aBaseT", "aBase", -9.6, 9.6, 0.8, 0.9, -6.4, 6.4, "panel2");
P({ id: "aBaseScrew", layer: "aBase", shape: "cyl", size: [0.07, 0.04], rot: V, pos: [0, 0.92, 0], at: [[-9.0, 0, -5.8], [9.0, 0, -5.8], [-9.0, 0, 5.8], [9.0, 0, 5.8]], mat: "steel" });
LAY("chamber", [18, 11, 0, 5.6]);
BOX("chFloor", "chamber", -8, 8, Y0, YF, -5.2, 5.2, "steel2"); BOX("chBack", "chamber", -8, 8, YF, 8.6, -5.2, -4.7, "steel2");
BOX("chLeft", "chamber", -8, -7.5, YF, 8.6, -5.2, 5.2, "steel2"); BOX("chRight", "chamber", 7.5, 8, YF, 8.6, -5.2, 5.2, "steel2");
BOX("chCutL", "chamber", -8, -7.5, YF, 8.6, 5.2, 5.26, "cut"); BOX("chCutR", "chamber", 7.5, 8, YF, 8.6, 5.2, 5.26, "cut"); BOX("chCutF", "chamber", -8, 8, Y0, YF, 5.2, 5.26, "cut");
BOX("chLid", "chamber", -8.4, 8.4, 8.6, 9.2, -5.4, 5.4, "panel2"); BOX("chLidRim", "chamber", -8.5, 8.5, 9.2, 9.28, -5.5, 5.5, "steel");
P({ id: "chLidBolt", layer: "chamber", shape: "cyl", size: [0.1, 0.07], rot: V, pos: [0, 9.32, 0], at: [-7.4, -3.7, 0, 3.7, 7.4].flatMap((x) => [-4.7, 4.7].map((z) => [x, 0, z])), mat: "steel" });
P({ id: "chPortWin", layer: "chamber", shape: "cyl", size: [0.95, 0.1], pos: [-4.5, 5.0, -4.6], mat: "window" });
P({ id: "chPortFl", layer: "chamber", shape: "tube", size: [1.3, 0.95, 0.3], pos: [-4.5, 5.0, -4.55], mat: "steel" });
P({ id: "chPortBolt", layer: "chamber", shape: "cyl", size: [0.07, 0.07], pos: [-4.5, 5.0, -4.38], at: Array.from({ length: 8 }, (_, i) => { const [a, b] = pol(i * 45, 1.12); return [a, b, 0]; }), mat: "dark" });
P({ id: "chPortBlank", layer: "chamber", shape: "tube", size: [1.3, 0.2, 0.3], pos: [4.5, 5.0, -4.55], mat: "steel" }); P({ id: "chPortCap", layer: "chamber", shape: "cyl", size: [1.0, 0.12], pos: [4.5, 5.0, -4.58], mat: "steel2" });
P({ id: "chPortBolt2", layer: "chamber", shape: "cyl", size: [0.07, 0.07], pos: [4.5, 5.0, -4.38], at: Array.from({ length: 8 }, (_, i) => { const [a, b] = pol(i * 45, 1.12); return [a, b, 0]; }), mat: "dark" });
BOX("chGateHouse", "chamber", -9.5, -8, 2.0, 3.9, -2.6, 2.6, "panel"); BOX("chGateBar", "chamber", -9.55, -9.45, 2.2, 3.7, -2.0, 2.0, "steel2"); BOX("chGateLed", "chamber", -9.55, -9.4, 3.5, 3.65, 2.1, 2.3, "lampG");
BOX("chGateSlot", "chamber", -7.56, -7.5, 2.6, 3.5, -2.0, 2.0, "dark");
P({ id: "chGateBolt", layer: "chamber", shape: "cyl", size: [0.07, 0.06], rot: HX, pos: [-9.5, 0, 0], at: [[0, 2.15, -2.4], [0, 2.15, 2.4], [0, 3.75, -2.4], [0, 3.75, 2.4]], mat: "steel" });
VT("chOring", "chamber", 3.8, 3.64, YF, 1.58, "rubber"); VT("chPortEx", "chamber", 1.1, 0.8, Y0, 1.56, "steel", { x: 5.4, z: 1.2 }); VC("chExHole", "chamber", 0.8, 1.52, 1.57, "dark", { x: 5.4, z: 1.2 });
P({ id: "chExBolt", layer: "chamber", shape: "cyl", size: [0.07, 0.06], rot: V, pos: [5.4, 1.58, 1.2], at: RING(8, 0.96).map(([x, y, z]) => [x, y, z]), mat: "dark" });
PIPE("chGas", "chamber", [[-2.2, 9.3, 0], [-2.2, 10.8, 0], [-6.4, 10.8, 0]], 0.2, "steel2"); BOX("chGasValve", "chamber", -5.2, -4.2, 10.4, 11.2, -0.45, 0.45, "panel"); VC("chGasKnob", "chamber", 0.22, 11.2, 11.5, "mark", { x: -4.7 });
for (let i = 0; i < 3; i++) VT(`chCoil${i}`, "chamber", 3.5, 3.3, 9.5 + i * 0.4, 9.65 + i * 0.4, "cu");
BOX("chCoilLead", "chamber", 3.3, 4.2, 9.5, 9.65, -0.1, 0.1, "cu");
LAY("topE", [7, 1, 0, 8.2]); VC("teDisc", "topE", 3.4, 7.9, 8.6, "alu"); VT("teRim", "topE", 3.5, 3.25, 8.35, 8.6, "steel");
P({ id: "teHole", layer: "topE", shape: "cyl", size: [0.06, 0.03], rot: V, pos: [0, 7.89, 0], at: RING(24, 2.9).concat(RING(18, 2.2, 5), RING(12, 1.5, 9), RING(6, 0.8), [[0, 0, 0]]), mat: "dark" });
// 陶瓷內襯（s5 拉開）：背板（開觀察窗）、左板（開閘縫）、右板
LAY("liner", [16, 7, 0, 4.8]);
BOX("lnBackL", "liner", -7.5, -5.65, YF, 8.0, -4.7, -4.4, "cer"); BOX("lnBackR", "liner", -3.35, 7.5, YF, 8.0, -4.7, -4.4, "cer"); BOX("lnBackD", "liner", -5.65, -3.35, YF, 4.0, -4.7, -4.4, "cer"); BOX("lnBackU", "liner", -5.65, -3.35, 6.0, 8.0, -4.7, -4.4, "cer");
BOX("lnLeftD", "liner", -7.5, -7.2, YF, 2.6, -4.4, 5.0, "cer"); BOX("lnLeftU", "liner", -7.5, -7.2, 3.5, 8.0, -4.4, 5.0, "cer"); BOX("lnRight", "liner", 7.2, 7.5, YF, 8.0, -4.4, 5.0, "cer");
P({ id: "lnBolt", layer: "liner", shape: "cyl", size: [0.08, 0.05], pos: [0, 0, -4.38], at: [-6.8, -2.0, 1.0, 4.0, 6.8].flatMap((x) => [2.2, 5.0, 7.4].map((y) => [x, y, 0])).filter(([x, y]) => !(x < -3.3 && x > -5.7 && y > 3.9 && y < 6.1)), mat: "steel" });
// 吸盤檯：冷卻基座、陶瓷吸盤、頂針、邊緣環、晶圓
LAY("pedBase", [7.4, 2, 0, 2.1]); VC("pbBase", "pedBase", 3.5, YF, Y_PED, "alu"); VT("pbCollar", "pedBase", 3.55, 3.4, Y_PED - 0.12, Y_PED, "steel"); VC("pbMark", "pedBase", 0.12, Y_PED - 0.3, Y_PED + 0.01, "mark", { x: 3.2 });
P({ id: "pbBolt", layer: "pedBase", shape: "cyl", size: [0.08, 0.05], rot: V, pos: [0, Y_PED + 0.01, 0], at: RING(16, 3.45), mat: "steel" });
HXC("pbFit", "pedBase", 0.24, 3.4, 4.6, 2.1, 1.0, "brass"); HXC("pbFit2", "pedBase", 0.24, 3.4, 4.6, 2.1, -1.0, "brass"); PIPE("pbHoseB", "pedBase", [[4.6, 2.1, 1.0], [6.4, 2.1, 1.0], [6.4, 1.5, 1.0]], 0.13, "hoseB"); PIPE("pbHoseR", "pedBase", [[4.6, 2.1, -1.0], [6.4, 2.1, -1.0], [6.4, 1.5, -1.0]], 0.13, "hoseR");
LAY("pedEsc", [4.4, 1, 0, 3.0]); VC("peDisc", "pedEsc", PUCK_R, Y_PED, Y_ESC, "cer"); VT("peSeal", "pedEsc", PUCK_R, PUCK_R - 0.12, Y_ESC, Y_ESC + 0.04, "cerD");
VT("peHe1", "pedEsc", 1.5, 1.42, Y_ESC, Y_ESC + 0.012, "dark"); VT("peHe2", "pedEsc", 0.8, 0.72, Y_ESC, Y_ESC + 0.012, "dark");
P({ id: "peHole", layer: "pedEsc", shape: "cyl", size: [0.08, 0.02], rot: V, pos: [0, Y_ESC + 0.005, 0], at: RING(3, 1.2, 30), mat: "dark" });
LAY("pins", [3, 2, 0, 2.4]); P({ id: "pinRod", layer: "pins", shape: "cyl", size: [0.06, 1.8], rot: V, pos: [0, 2.4, 0], at: RING(3, 1.2, 30), mat: "steel2" });
LAY("ring", [7, 1, 0, 3.1]); VT("rgBody", "ring", RG_O, RG_I, Y_PED, Y_RG, "quartz"); VT("rgStep", "ring", RG_I + 0.01, 2.13, Y_PED, 3.26, "quartz"); VT("rgEdge", "ring", RG_O + 0.01, RG_O - 0.1, Y_RG - 0.04, Y_RG + 0.01, "edge");
BOX("rgNotch", "ring", 3.15, 3.42, Y_PED + 0.2, Y_RG - 0.06, -0.15, 0.15, "dark");
LAY("wafer", [4.6, 0.3, 0, 3.4]); VC("wfDisc", "wafer", WAF_R, Y_ESC, Y_ESC + 0.07, "si"); BOX("wfNotch", "wafer", 2.1, 2.3, Y_ESC + 0.005, Y_ESC + 0.075, -0.12, 0.12, "dark");
// 電漿（輝光＋鞘層暗區）
LAY("plasma", [7, 4, 0, 5.2]); VC("plHalo", "plasma", 3.2, 3.8, 7.3, "plasma"); VC("plCore", "plasma", 2.1, 4.6, 6.6, "plasmaCore"); VC("plSheath", "plasma", 3.2, Y_RG + 0.05, 3.8, "sheath");
// 離子（受鞘層電場往下加速；離子從輝光落下）
actions.ionA0 = { type: "flow", _說明: "離子從電漿落向晶圓（受鞘層電場加速）", layer: "plasma", path: [[0, 6.8, 0.4], [0, 3.42, 0.4]], n: 3, lanes: 3, laneDir: [1, 0, 0], laneGap: 1.5, size: 0.1, shape: "dot", rate: 0.9, color: "ionC", track: false, accel: true, free: true, jitter: 0.04 };
actions.ionA1 = { type: "flow", layer: "plasma", path: [[2.95, 6.8, 0.2], [2.95, 3.62, 0.2]], n: 3, lanes: 2, laneDir: [0, 0, 1], laneGap: 1.2, size: 0.1, shape: "dot", rate: 0.85, color: "ionC", track: false, accel: true, free: true, jitter: 0.04 };
actions.ionA2 = { type: "flow", layer: "plasma", path: [[-2.95, 6.8, 0.2], [-2.95, 3.62, 0.2]], n: 3, lanes: 2, laneDir: [0, 0, 1], laneGap: 1.2, size: 0.1, shape: "dot", rate: 0.8, color: "ionC", track: false, accel: true, free: true, jitter: 0.04 };
actions.plasmaGlow = { type: "pulse", parts: ["plHalo", "plCore"], color: "plasmaC", glow: 0.9, freq: 2.2, halo: 0 };
actions.liningHot = { type: "pulse", parts: ["lnBackL", "lnBackR", "lnLeftU", "lnRight"], color: "amberC", glow: 0.55, freq: 1.2, halo: 0 };
actions.ringHot = { type: "pulse", parts: ["rgBody", "rgStep"], color: "amberC", glow: 0.7, freq: 1.5, halo: 0 };

// ═════ 站 B：邊緣環剖面（x 33）＝ESC 邊緣、晶圓邊緣、階梯環；s2 環頂四片依序被打掉；s3 電場等位線延伸 ═════
const BX = 28, BZ = 2.2;
BACKDROP("bBack", 26.4, 40.6, 8.4);
LAY("bPlinth", [14.6, 1, 33.4, 0.5]); BOX("bPl", "bPlinth", 26.4, 40.6, 0, 0.9, -3.2, 3.2, "band"); BOX("bPlTop", "bPlinth", 26.4, 40.6, 0.9, 1.0, -3.2, 3.2, "panel2");
const edgeSec = (pre, ox, o) => { // pW 吸盤寬、lipW 階梯寬、bodyW 環身寬、top 環頂 y
  const { pW = 3.4, lipW = 1.2, bodyW = 4.6, top = 3.0, worn = false, wear = "quartz", wcol = "quartz" } = o;
  const x1 = R2(ox + pW), xl = R2(x1 + 0.05), xb = R2(xl + lipW), xe = R2(xb + bodyW);
  LAY(`${pre}Esc`, [R2(xe - ox + 0.6), 3, R2((ox + xe) / 2), 1.8]);
  BOX(`${pre}Base`, `${pre}Esc`, R2(ox - 0.3), R2(xe + 0.3), 0.9, 1.8, -BZ, BZ, "steel2"); BOX(`${pre}Puck`, `${pre}Esc`, ox, x1, 1.8, 3.0, -BZ, BZ, "cer");
  BOX(`${pre}Seal`, `${pre}Esc`, R2(x1 - 0.18), x1, 3.0, 3.04, -BZ, BZ, "cerD"); BOX(`${pre}He`, `${pre}Esc`, R2(ox + 0.8), R2(ox + 0.88), 2.9, 3.0, -BZ - 0.01, BZ + 0.01, "he");
  LAY(`${pre}Wafer`, [R2(pW + 0.3), 0.3, R2(ox + pW / 2), 3.1]); BOX(`${pre}Wf`, `${pre}Wafer`, R2(ox + 0.2), R2(x1 + 0.2), 3.04, 3.18, -BZ, BZ, "si");
  const pts = [[xl, 1.8], [xe, 1.8], [xe, top], [xb, top], [xb, 2.95], [xl, 2.95]];
  if (worn) pts.splice(0, pts.length, [xl, 1.8], [xe, 1.8], [xe, top], [R2(xb + 1.0), top], [xb, 2.55], [xl, 2.55]);
  LAY(`${pre}Ring`, [R2(xe - xl), top - 1.7, R2((xl + xe) / 2), R2((top + 1.8) / 2)]);
  P({ id: `${pre}RingP`, layer: `${pre}Ring`, shape: "poly", size: [1, 1, R2(2 * BZ)], pts: pts.map(([a, b]) => [R2(a), R2(b)]), pos: [0, 0, 0], mat: wcol });
  return { x1, xl, xb, xe };
};
const bs = edgeSec("b", BX, { top: 3.0 });
const SLY = [[3.0, 3.2], [3.2, 3.4], [3.4, 3.6], [3.6, 3.8]];
SLY.forEach(([a, b], i) => { LAY(`bSl${i}`, [bs.xe - bs.xb, 0.2, R2((bs.xb + bs.xe) / 2), R2((a + b) / 2)]); BOX(`bSlB${i}`, `bSl${i}`, bs.xb, bs.xe, a, b, -BZ, BZ, "quartz"); BOX(`bSlE${i}`, `bSl${i}`, bs.xb, R2(bs.xb + 0.03), a, b, BZ, R2(BZ + 0.02), "edge"); });
LAY("bPlasma", [13, 4, 33.4, 6.4]); BOX("bPlHalo", "bPlasma", 27.7, 40.2, 4.9, 8.2, -BZ, BZ, "plasma"); BOX("bPlSheath", "bPlasma", 27.7, 40.2, 3.9, 4.9, -BZ, BZ, "sheath");
LAY("bGaugeFull", [0.6, 2, 40.1, 2.8]); LAY("bGaugeNow", [0.6, 2, 40.1, 2.4]);
const gauge = (id, y1) => { BOX(`${id}V`, id, 39.85, 39.95, 1.8, y1, 2.0, 2.1, "bracket"); BOX(`${id}T`, id, 39.6, 40.2, R2(y1 - 0.04), R2(y1 + 0.04), 2.0, 2.1, "bracket"); BOX(`${id}B`, id, 39.6, 40.2, 1.76, 1.84, 2.0, 2.1, "bracket"); };
for (let k = 0; k < 4; k++) { LAY(`bGauge${k}`, [0.6, 2.2, 40.1, 2.8]); gauge(`bGauge${k}`, R2(3.8 - 0.2 * k)); }
LAY("bTopLine", [4.6, 0.1, R2((bs.xb + bs.xe) / 2), 3.8]); BOX("bTopLineB", "bTopLine", bs.xb, bs.xe, 3.79, 3.81, 2.15, 2.2, "bracket");
LAY("bSpark", [4.6, 1, R2((bs.xb + bs.xe) / 2), 3.9]); P({ id: "bSparkD", layer: "bSpark", shape: "sphere", size: [0.12], pos: [0, 3.9, 0], at: [[bs.xb + 0.7, 0, -1.2], [bs.xb + 1.9, 0, 0.3], [bs.xb + 3.1, 0, -0.5], [bs.xb + 3.9, 0, 1.2], [bs.xb + 1.2, 0, 1.4]], mat: "spark" });
const RX = [R2(bs.xb + 0.6), R2(bs.xb + 1.5), R2(bs.xb + 2.4), R2(bs.xb + 3.3), R2(bs.xb + 4.0)];
RX.forEach((x, i) => { actions[`bIon${i}`] = { type: "flow", _說明: "離子垂直表面往下加速（鞘層電場），撞到環頂", layer: "bPlasma", path: [[x, 8.0, R2(-1.4 + 0.7 * i)], [x, 3.95, R2(-1.4 + 0.7 * i)]], n: 3, size: 0.1, shape: "dot", rate: 0.8 + 0.05 * i, color: "ionC", track: false, accel: true, free: true, jitter: 0.02, phase: i * 0.19 }; });
actions.bSparkP = { type: "pulse", parts: ["bSparkD"], color: "ionC", glow: 1.0, freq: 6, halo: 0.5 };
actions.bDebris = { type: "flow", _說明: "被打下的石英碎屑沿表面法線附近往上拋", layer: "bPlasma", path: [[R2(bs.xb + 1.6), 3.9, 0.2], [R2(bs.xb + 1.9), 4.6, 0.4], [R2(bs.xb + 2.2), 5.5, 0.6]], n: 6, size: 0.07, shape: "dot", rate: 0.6, color: "chipC", track: false, free: true, jitter: 0.25 };
actions.bDebris2 = { type: "flow", layer: "bPlasma", path: [[R2(bs.xb + 3.2), 3.9, -0.6], [R2(bs.xb + 3.5), 4.7, -0.4], [R2(bs.xb + 3.8), 5.6, -0.2]], n: 6, size: 0.07, shape: "dot", rate: 0.55, color: "chipC", track: false, free: true, jitter: 0.25 };
// 電場等位線（s3）：沿晶圓＋環連續延伸（y 4.0、4.5）
[["bField0", 4.2, 0.0], ["bField1", 4.7, 0.0]].forEach(([id, y, ph]) => { actions[id] = { type: "flow", _說明: "電場等位線：越過晶圓邊緣、順著環一路延伸", layer: "bPlasma", path: [[27.9, y, 1.6], [R2(bs.xb - 1.0), y, 1.6], [R2(bs.xb + 1.0), R2(y + 0.05), 1.6], [R2(bs.xe + 0.2), y, 1.6]], n: 10, size: 0.09, shape: "arrow", rate: 0.3, color: "plasmaC", track: true, free: false, phase: ph }; });
actions.bRingGlow = { type: "pulse", parts: ["bRingP"], color: "amberC", glow: 0.6, freq: 1.2, halo: 0 };

// ═════ 站 S：靜電吸盤爆炸站（x 96）＝冷卻基座、氦氣與頂針層、電極層、陶瓷盤面、晶圓；通電後盤面與晶圓出現相反電荷 ═════
const SX = 96, SR = 3.0;
BACKDROP("sBack", 88.4, 103.6, 9.6, -4.4);
LAY("sPlinth", [15.6, 1, SX, 0.5]); BOX("sPl", "sPlinth", 88.2, 103.8, 0, 0.9, -4.6, 4.6, "band"); BOX("sPlTop", "sPlinth", 88.2, 103.8, 0.9, 1.0, -4.6, 4.6, "panel2");
LAY("sCool", [8, 1.8, SX, 1.7]); VC("scDisc", "sCool", 3.2, 1.0, 2.0, "alu", { x: SX }); VT("scFlange", "sCool", 3.28, 3.12, 1.7, 2.0, "steel", { x: SX });
for (const r of [2.4, 1.8, 1.2]) VT(`scWater${r * 10}`, "sCool", r + 0.07, r - 0.07, 2.0, 2.02, "dark", { x: SX });
P({ id: "scBolt", layer: "sCool", shape: "cyl", size: [0.08, 0.05], rot: V, pos: [SX, 2.03, 0], at: RING(16, 3.06), mat: "steel" });
HXC("scFit", "sCool", 0.24, R2(SX + 3.2), R2(SX + 4.6), 1.5, 0.9, "brass"); HXC("scFit2", "sCool", 0.24, R2(SX + 3.2), R2(SX + 4.6), 1.5, -0.9, "brass");
PIPE("scHoseB", "sCool", [[R2(SX + 4.6), 1.5, 0.9], [R2(SX + 6.2), 1.5, 0.9], [R2(SX + 6.2), 1.0, 0.9]], 0.14, "hoseB"); PIPE("scHoseR", "sCool", [[R2(SX + 4.6), 1.5, -0.9], [R2(SX + 6.2), 1.5, -0.9], [R2(SX + 6.2), 1.0, -0.9]], 0.14, "hoseR");
BOX("scHv", "sCool", R2(SX - 4.6), R2(SX - 3.2), 1.15, 1.9, -0.5, 0.5, "dark"); PIPE("scCable", "sCool", [[R2(SX - 4.6), 1.5, 0], [R2(SX - 6.0), 1.5, 0], [R2(SX - 6.0), 1.0, 0]], 0.13, "rubber"); BOX("scPlate", "sCool", R2(SX - 3.9), R2(SX - 3.5), 1.5, 1.8, 0.5, 0.56, "warnY");
LAY("sHe", [7, 1, SX, 2.2]); VC("shDisc", "sHe", SR, 2.02, 2.38, "dark", { x: SX });
for (const r of [2.2, 1.4, 0.6]) VT(`shRing${r * 10}`, "sHe", r + 0.05, r - 0.05, 2.38, 2.41, "he", { x: SX });
for (let i = 0; i < 4; i++) { const a = i * 90 + 45, [cx, cz] = pol(a, 1.4); P({ id: `shRad${i}`, layer: "sHe", shape: "box", size: [1.6, 0.03, 0.08], pos: [R2(SX + cx), 2.405, cz], rot: [0, -a, 0], mat: "he" }); }
P({ id: "shPin", layer: "sHe", shape: "cyl", size: [0.1, 1.4], rot: V, pos: [SX, 2.75, 0], at: RING(3, 1.2, 30), mat: "steel2" });
LAY("sElec", [7, 1, SX, 2.5]); VC("seBase", "sElec", SR, 2.38, 2.44, "dark", { x: SX });
for (let i = -4; i <= 4; i++) { if (i === 0) continue; const x = i * 0.6 - Math.sign(i) * 0.3, len = 2 * Math.sqrt(2.85 * 2.85 - x * x); BOX(`seS${i}`, "sElec", R2(SX + x - 0.22), R2(SX + x + 0.22), 2.44, 2.54, R2(-len / 2), R2(len / 2), x < 0 ? "cuD" : "cu"); }
BOX("seBusL", "sElec", R2(SX - 2.7), R2(SX - 0.3), 2.44, 2.54, -2.7, -2.5, "cuD"); BOX("seBusR", "sElec", R2(SX + 0.3), R2(SX + 2.7), 2.44, 2.54, 2.5, 2.7, "cu");
P({ id: "sePlus", layer: "sElec", shape: "sphere", size: [0.08], pos: [SX, 2.62, 0], at: [-2.1, -1.5, -0.9].flatMap((x) => [-1.2, 0, 1.2].map((z) => [x, 0, z])).concat([2.1, 1.5, 0.9].flatMap((x) => [-1.2, 0, 1.2].map((z) => [x, 0, z]))), mat: "plus" });
LAY("sTop", [7, 1, SX, 2.8]); VC("stDisc", "sTop", SR, 2.54, 3.0, "cer", { x: SX }); VT("stSeal", "sTop", SR, SR - 0.14, 3.0, 3.05, "cerD", { x: SX });
for (const r of [2.2, 1.4, 0.6]) VT(`stGroove${r * 10}`, "sTop", r + 0.05, r - 0.05, 3.0, 3.014, "dark", { x: SX });
P({ id: "stHole", layer: "sTop", shape: "cyl", size: [0.12, 0.02], rot: V, pos: [SX, 3.01, 0], at: RING(3, 1.2, 30), mat: "dark" });
P({ id: "stMesa", layer: "sTop", shape: "cyl", size: [0.07, 0.02], rot: V, pos: [SX, 3.02, 0], at: RING(18, 2.6).concat(RING(12, 1.9, 7), RING(8, 1.0, 11)), mat: "cerD" });
LAY("sWafer", [7, 1, SX, 3.4]); VC("swDisc", "sWafer", 3.25, 3.04, 3.12, "si", { x: SX }); BOX("swNotch", "sWafer", R2(SX + 3.1), R2(SX + 3.3), 3.045, 3.125, -0.14, 0.14, "dark");
P({ id: "swMinus", layer: "sWafer", shape: "sphere", size: [0.08], pos: [SX, 2.98, 0], at: [-2.1, -1.5, -0.9].flatMap((x) => [-1.2, 0, 1.2].map((z) => [x, 0, z])).concat([2.1, 1.5, 0.9].flatMap((x) => [-1.2, 0, 1.2].map((z) => [x, 0, z]))), mat: "minus" });
LAY("sArrows", [7, 1.4, SX, 4.0]); P({ id: "saShaft", layer: "sArrows", shape: "cyl", size: [0.09, 0.8], rot: V, pos: [SX, 4.2, 0], at: [[-2.2, 0, 0], [-0.7, 0, 0], [0.8, 0, 0], [2.3, 0, 0]], mat: "mark" });
P({ id: "saHead", layer: "sArrows", shape: "cyl", size: [0.22, 0.14], rot: V, pos: [SX, 3.72, 0], at: [[-2.2, 0, 0], [-0.7, 0, 0], [0.8, 0, 0], [2.3, 0, 0]], mat: "mark" });
actions.sHeFlow = { type: "flow", _說明: "氦氣在晶圓背面環槽內流動、傳走熱（淡藍細點沿環槽）", layer: "sTop", path: RING(13, 2.2).map(([x, , z], i) => [R2(SX + x), 3.03, z]).concat([[R2(SX + 2.2), 3.03, 0]]), n: 10, size: 0.06, shape: "dot", rate: 0.12, color: "heC", track: false, free: true, jitter: 0.04 };
actions.sHeFlow2 = { type: "flow", layer: "sTop", path: RING(13, 1.4, 20).map(([x, , z]) => [R2(SX + x), 3.03, z]).concat([[R2(SX + 1.4 * Math.cos(20 * D2R)), 3.03, R2(1.4 * Math.sin(20 * D2R))]]), n: 8, size: 0.06, shape: "dot", rate: 0.16, color: "heC", track: false, free: true, jitter: 0.04 };
actions.sPlusGlow = { type: "pulse", parts: ["sePlus"], color: "plusC", glow: 0.9, freq: 1.6, halo: 0 };
actions.sMinusGlow = { type: "pulse", parts: ["swMinus"], color: "minusC", glow: 0.9, freq: 1.6, halo: 0 };
actions.sArrowP = { type: "pulse", parts: ["saShaft", "saHead"], color: "markC", glow: 0.9, freq: 3, halo: 0 };
actions.sWaterFlow = { type: "flow", _說明: "冷卻水沿基座環路流動", layer: "sCool", path: RING(13, 2.4).map(([x, , z]) => [R2(SX + x), 2.04, z]), n: 7, size: 0.07, shape: "dot", rate: 0.14, color: "hoseB", track: false, free: true, jitter: 0.03 };

// ═════ 站 C：新舊邊緣環對照＋更換（x 66）＝舊環厚約新環 60%、內緣被打圓；電漿輝光邊緣隨之偏移（藍→粉）；機械夾具換環 ═════
BACKDROP("cBack", 53.4, 72.6, 8.4);
LAY("cPlinth", [19.2, 1, 63, 0.5]); BOX("cPl", "cPlinth", 53.4, 72.6, 0, 0.9, -3.2, 3.2, "band"); BOX("cPlTop", "cPlinth", 53.4, 72.6, 0.9, 1.0, -3.2, 3.2, "panel2");
const cn = edgeSec("cN", 54, { pW: 2.6, lipW: 1.1, bodyW: 3.4, top: 3.8, wcol: "quartz" });
const co = edgeSec("cO", 63.2, { pW: 2.6, lipW: 1.1, bodyW: 3.4, top: 3.0, worn: true, wcol: "quartzOld" });
LAY("cOldCrumb", [3, 1, R2(co.xb + 1.7), 2.8]); P({ id: "cOldCrumbD", layer: "cOldCrumb", shape: "sphere", size: [0.07], pos: [0, 2.7, 0], at: [[co.xb + 0.8, 0, -1.3], [co.xb + 1.9, 0, 0.4], [co.xb + 2.7, 0, 1.4]], mat: "debris" });
LAY("cPlN", [8.6, 4, 58, 6.2]); BOX("cPlNHalo", "cPlN", 53.7, 62.3, 4.7, 8.0, -BZ, BZ, "plasma"); BOX("cPlNSheath", "cPlN", 53.7, 62.3, 3.9, 4.7, -BZ, BZ, "sheath");
LAY("cPlO0", [9, 4, 67.5, 6.2]); BOX("cPlO0Halo", "cPlO0", 63.0, 72.0, 4.7, 8.0, -BZ, BZ, "plasma"); BOX("cPlO0Sheath", "cPlO0", 63.0, 72.0, 3.9, 4.7, -BZ, BZ, "sheath");
LAY("cPlO1", [9, 4, 67.5, 6.2]); BOX("cPlO1Halo", "cPlO1", 63.0, 72.0, 4.7, 8.0, -BZ, BZ, "plasmaP");
P({ id: "cPlO1Dip", layer: "cPlO1", shape: "poly", size: [1, 1, R2(2 * BZ)], pts: [[63.0, 3.5], [R2(co.xb - 0.4), 3.5], [R2(co.xb + 0.9), 4.1], [72.0, 4.2], [72.0, 4.9], [63.0, 4.9]], pos: [0, 0, 0], mat: "plasmaP" });
LAY("cPlO1S", [9, 1, 67.5, 4.1]); P({ id: "cPlO1Sh", layer: "cPlO1S", shape: "poly", size: [1, 1, R2(2 * BZ)], pts: [[63.0, 3.5], [R2(co.xb - 0.4), 3.5], [R2(co.xb + 0.9), 4.1], [72.0, 4.2], [72.0, 4.9], [63.0, 4.9]], pos: [0, 0.02, 0], mat: "sheath" });
LAY("cEdgeLine", [3, 0.2, 58, 5], false); BOX("cEdgeLineB", "cEdgeLine", co.xb - 1.0, R2(co.xb + 1.0), 4.95, 4.99, 2.15, 2.2, "bracket");
// 厚度括弧（新 2.0、舊 0.8…黃色）
LAY("cBrN", [1, 3, 61.7, 2.8]); BOX("cBrNV", "cBrN", 61.65, 61.75, 1.8, 3.8, 2.0, 2.1, "bracket"); BOX("cBrNT", "cBrN", 61.4, 62.0, 3.76, 3.84, 2.0, 2.1, "bracket"); BOX("cBrNB", "cBrN", 61.4, 62.0, 1.76, 1.84, 2.0, 2.1, "bracket");
LAY("cBrO", [1, 3, 71.3, 2.2]); BOX("cBrOV", "cBrO", 71.25, 71.35, 1.8, 3.0, 2.0, 2.1, "bracket"); BOX("cBrOT", "cBrO", 71.0, 71.6, 2.96, 3.04, 2.0, 2.1, "bracket"); BOX("cBrOB", "cBrO", 71.0, 71.6, 1.76, 1.84, 2.0, 2.1, "bracket");
// 更換用夾具（機械手臂末端）：立桿、橫臂、兩爪；與新環（備用環，落到舊環的位置）
LAY("cArm", [6, 9, co.xb + 1.7, 7.0]); const AX = R2(co.xb + 1.7);
BOX("caMast", "cArm", R2(AX - 0.2), R2(AX + 0.2), 6.4, 12.0, -0.2, 0.2, "panel"); BOX("caHead", "cArm", R2(AX - 0.9), R2(AX + 0.9), 5.9, 6.4, -0.7, 0.7, "dark");
BOX("caClawL", "cArm", R2(AX - 1.9), R2(AX - 1.6), 3.3, 5.9, -0.5, 0.5, "steel2"); BOX("caClawR", "cArm", R2(AX + 1.6), R2(AX + 1.9), 3.3, 5.9, -0.5, 0.5, "steel2"); BOX("caPadL", "cArm", R2(AX - 1.6), R2(AX - 1.5), 3.4, 3.8, -0.45, 0.45, "rubber"); BOX("caPadR", "cArm", R2(AX + 1.5), R2(AX + 1.6), 3.4, 3.8, -0.45, 0.45, "rubber");
BOX("caLed", "cArm", R2(AX + 0.3), R2(AX + 0.6), 6.0, 6.2, 0.7, 0.76, "lampG"); BOX("caArmBar", "cArm", R2(AX - 0.9), 72.0, 11.7, 12.0, -0.3, 0.3, "panel");
LAY("cNewRing", [R2(co.xe - co.xl), 2, R2((co.xl + co.xe) / 2), 2.8]);
P({ id: "cNewRingP", layer: "cNewRing", shape: "poly", size: [1, 1, R2(2 * BZ)], pts: [[co.xl, 1.8], [co.xe, 1.8], [co.xe, 3.8], [co.xb, 3.8], [co.xb, 2.95], [co.xl, 2.95]].map(([a, b]) => [R2(a), R2(b)]), pos: [0, 0, 0], mat: "quartz" });
actions.cPlPulseN = { type: "pulse", parts: ["cPlNHalo"], color: "plasmaC", glow: 0.8, freq: 2.2, halo: 0 }; actions.cPlPulseO = { type: "pulse", parts: ["cPlO0Halo"], color: "plasmaC", glow: 0.8, freq: 2.2, halo: 0 }; actions.cPlPulseP = { type: "pulse", parts: ["cPlO1Halo", "cPlO1Dip"], color: "plasmaPC", glow: 0.9, freq: 2.6, halo: 0 };
actions.cIonN = { type: "flow", layer: "cPlN", path: [[R2(cn.xb + 1.4), 7.8, 0.2], [R2(cn.xb + 1.4), 3.95, 0.2]], n: 3, lanes: 2, laneDir: [1, 0, 0], laneGap: 1.2, size: 0.09, shape: "dot", rate: 0.9, color: "ionC", track: false, accel: true, free: true, jitter: 0.03 };
actions.cIonO = { type: "flow", layer: "cPlO0", path: [[R2(co.xb + 1.4), 7.8, 0.2], [R2(co.xb + 1.4), 3.15, 0.2]], n: 3, lanes: 2, laneDir: [1, 0, 0], laneGap: 1.2, size: 0.09, shape: "dot", rate: 0.9, color: "ionC", track: false, accel: true, free: true, jitter: 0.03 };

// ═════ 站 E：陶瓷與金屬表面對照（x 128，s5）＝同樣被離子轟擊；陶瓷平整少掉渣，金屬被打花、碎屑飛出 ═════
BACKDROP("eBack", 117.4, 138.6, 8.4);
LAY("ePlinth", [21.4, 1, 128, 0.5]); BOX("ePl", "ePlinth", 117.2, 138.8, 0, 0.9, -3.2, 3.2, "band"); BOX("ePlTop", "ePlinth", 117.2, 138.8, 0.9, 1.0, -3.2, 3.2, "panel2");
const EY = 3.9;
LAY("eCer", [6, 3.2, 122.2, 2.5]); BOX("ecBlock", "eCer", 119.4, 125.0, 0.9, EY, -2.3, 2.3, "cer"); BOX("ecEdge", "eCer", 119.4, 125.0, EY - 0.04, EY + 0.01, -2.3, 2.3, "cerD");
P({ id: "ecPit", layer: "eCer", shape: "cyl", size: [0.07, 0.015], rot: V, pos: [0, EY + 0.008, 0], at: [[120.6, 0, -1.2], [123.3, 0, 0.9], [121.8, 0, 1.6]], mat: "cerD" });
BOX("ecTag", "eCer", 119.5, 121.5, 1.3, 1.9, 2.3, 2.34, "panel");
LAY("eMet", [6, 3.2, 134.4, 2.5]); BOX("emBlock", "eMet", 131.4, 137.0, 0.9, EY, -2.3, 2.3, "steel2"); BOX("emEdge", "eMet", 131.4, 137.0, EY - 0.04, EY + 0.01, -2.3, 2.3, "steel");
P({ id: "emPit", layer: "eMet", shape: "cyl", size: [0.16, 0.03], rot: V, pos: [0, EY + 0.01, 0], at: Array.from({ length: 22 }, () => [R2(131.7 + rnd() * 5.0), 0, R2(-2.0 + rnd() * 4.0)]), mat: "dark" });
P({ id: "emBump", layer: "eMet", shape: "sphere", size: [0.09], pos: [0, EY + 0.03, 0], scale: [1, 0.6, 1], at: Array.from({ length: 30 }, () => [R2(131.7 + rnd() * 5.0), 0, R2(-2.0 + rnd() * 4.0)]), mat: "steel" });
BOX("emTag", "eMet", 131.5, 133.5, 1.3, 1.9, 2.3, 2.34, "panel");
LAY("ePlasma", [21, 4, 128, 6.4]); BOX("epHalo", "ePlasma", 118.4, 138.0, 5.1, 8.2, -2.3, 2.3, "plasma"); BOX("epSheath", "ePlasma", 118.4, 138.0, 4.1, 5.1, -2.3, 2.3, "sheath");
[["eIonC", 122.2], ["eIonM", 134.2]].forEach(([id, x]) => { actions[id] = { type: "flow", _說明: "離子垂直往下加速撞擊表面", layer: "ePlasma", path: [[x, 8.0, 0.2], [x, EY + 0.05, 0.2]], n: 3, lanes: 4, laneDir: [1, 0, 0], laneGap: 1.2, size: 0.1, shape: "dot", rate: 0.85, color: "ionC", track: false, accel: true, free: true, jitter: 0.03 }; });
actions.eDebrisM = { type: "flow", _說明: "金屬表面被打下的碎屑：多、往四面飛、會掉在腔內變成微粒", layer: "ePlasma", path: [[134.0, EY + 0.1, 0.4], [134.6, EY + 1.2, 0.7], [135.5, EY + 2.2, 1.0]], n: 8, lanes: 3, laneDir: [1, 0, 0], laneGap: 1.4, size: 0.08, shape: "dot", rate: 0.5, color: "debrisC", track: false, free: true, jitter: 0.5 };
actions.eBounceC = { type: "flow", _說明: "離子打到陶瓷平整的表面，彈開、幾乎沒有碎屑", layer: "ePlasma", path: [[122.2, EY + 0.05, 0.2], [122.8, EY + 0.6, 0.4], [123.4, EY + 1.4, 0.5]], n: 3, lanes: 2, laneDir: [1, 0, 0], laneGap: 1.6, size: 0.06, shape: "dot", rate: 0.4, color: "ionC", track: false, free: true, jitter: 0.1 };
actions.eSparkC = { type: "pulse", parts: ["ecEdge"], color: "ionC", glow: 0.35, freq: 3, halo: 0 }; actions.eSparkM = { type: "pulse", parts: ["emEdge", "emPit"], color: "ionC", glow: 0.8, freq: 4, halo: 0 };

// ═════ 站 P：真空泵、閥門、射頻電源（x 150，s7；一次亮一件）═════
BACKDROP("pBack", 140.4, 160.6, 7.0);
LAY("pPlinth", [21, 1, 150.5, 0.5]); BOX("pPl", "pPlinth", 140.2, 160.8, 0, 0.9, -3.2, 3.2, "band"); BOX("pPlTop", "pPlinth", 140.2, 160.8, 0.9, 1.0, -3.2, 3.2, "panel2");
LAY("pPump", [5.6, 4.4, 144.5, 3.0]); BOX("ppBody", "pPump", 142.0, 147.0, 1.0, 3.6, -1.6, 1.6, "pump"); BOX("ppTop", "pPump", 142.2, 146.8, 3.6, 3.9, -1.4, 1.4, "steel2"); VC("ppMotor", "pPump", 1.0, 3.9, 5.0, "dark", { x: 144.5 }); VT("ppFan", "pPump", 1.08, 0.98, 4.2, 4.9, "steel2", { x: 144.5 });
for (let i = 0; i < 7; i++) BOX(`ppFin${i}`, "pPump", R2(142.2 + i * 0.68), R2(142.5 + i * 0.68), 1.2, 3.3, 1.6, 1.75, "steel2");
VT("ppInlet", "pPump", 0.6, 0.45, 3.9, 4.7, "steel", { x: 143.3, z: 0.9 }); VT("ppFlange", "pPump", 0.85, 0.45, 4.55, 4.7, "steel2", { x: 143.3, z: 0.9 }); BOX("ppPlate", "pPump", 146.0, 146.9, 1.5, 2.1, 1.6, 1.64, "warnY"); BOX("ppLamp", "pPump", 145.2, 145.5, 3.2, 3.4, 1.6, 1.66, "lampG");
HXC("ppExhaust", "pPump", 0.3, 147.0, 148.4, 1.8, 0.0, "steel");
LAY("pValve", [5, 4.4, 151.5, 3.0]); PIPE("pvPipe", "pValve", [[148.4, 1.8, 0], [155.0, 1.8, 0]], 0.3, "steel"); SPH("pvBody", "pValve", 0.7, 151.7, 1.8, 0, "steel2"); VT("pvFlangeL", "pValve", 0.5, 0.3, 1.5, 1.6, "steel2", { x: 149.3, z: 0 }); P({ id: "pvFlA", layer: "pValve", shape: "tube", size: [0.55, 0.3, 0.15], rot: HX, pos: [149.5, 1.8, 0], mat: "steel2" }); P({ id: "pvFlB", layer: "pValve", shape: "tube", size: [0.55, 0.3, 0.15], rot: HX, pos: [153.9, 1.8, 0], mat: "steel2" });
VC("pvStem", "pValve", 0.14, 2.3, 4.2, "steel", { x: 151.7 }); VC("pvBonnet", "pValve", 0.38, 2.2, 3.0, "steel2", { x: 151.7 }); VT("pvWheel", "pValve", 0.95, 0.82, 4.2, 4.3, "mark", { x: 151.7 });
for (let i = 0; i < 3; i++) P({ id: `pvSpoke${i}`, layer: "pValve", shape: "box", size: [1.8, 0.07, 0.1], pos: [151.7, 4.25, 0], rot: [0, i * 60, 0], mat: "mark" });
VC("pvHub", "pValve", 0.2, 4.1, 4.4, "steel", { x: 151.7 });
LAY("pPower", [5, 5, 156.4, 3.4]); BOX("prBody", "pPower", 154.6, 158.2, 1.0, 5.6, -1.4, 1.4, "cab"); BOX("prPanel", "pPower", 154.9, 157.9, 1.4, 5.2, 1.4, 1.44, "panel2"); BOX("prScreen", "pPower", 155.2, 157.6, 4.1, 4.9, 1.44, 1.48, "screen");
for (let i = 0; i < 5; i++) BOX(`prVent${i}`, "pPower", 155.2, 157.6, R2(1.6 + i * 0.16), R2(1.68 + i * 0.16), 1.44, 1.47, "dark");
P({ id: "prKnob", layer: "pPower", shape: "cyl", size: [0.2, 0.15], rot: [90, 0, 0], pos: [155.6, 3.4, 1.5], at: [[0, 0, 0], [1.2, 0, 0]], mat: "steel2" }); P({ id: "prLed", layer: "pPower", shape: "sphere", size: [0.07], pos: [155.4, 3.8, 1.5], at: [[0, 0, 0], [0.4, 0, 0], [0.8, 0, 0]], mat: "lampG" });
P({ id: "prConn", layer: "pPower", shape: "cyl", size: [0.28, 0.5], rot: [90, 0, 0], pos: [158.4, 2.6, 0], mat: "brass" }); HXC("prConnH", "pPower", 0.28, 158.2, 158.6, 2.6, 0, "brass"); PIPE("prCable", "pPower", [[158.6, 2.6, 0], [159.8, 2.6, 0], [159.8, 1.0, 0]], 0.14, "rubber");
actions.pPumpHot = { type: "pulse", parts: ["ppBody", "ppTop"], color: "amberC", glow: 0.6, freq: 1.4, halo: 0 }; actions.pValveHot = { type: "pulse", parts: ["pvBody", "pvBonnet"], color: "amberC", glow: 0.6, freq: 1.4, halo: 0 }; actions.pPowerHot = { type: "pulse", parts: ["prBody"], color: "amberC", glow: 0.5, freq: 1.4, halo: 0 };
actions.pFan = { type: "rotate", _說明: "真空泵風扇", parts: ["ppFan"], axis: [0, 1, 0], pivot: [144.5, 0, 0], rps: 0.9, rampSpin: true };
actions.pWheel = { type: "rotate", _說明: "閥門手輪轉動", parts: ["pvWheel", "pvSpoke0", "pvSpoke1", "pvSpoke2", "pvHub"], axis: [0, 1, 0], pivot: [151.7, 0, 0], rps: 0.3, rampSpin: true };
actions.pExhaust = { type: "flow", layer: "pPump", path: [[147.0, 1.8, 0], [148.4, 1.8, 0], [153.9, 1.8, 0], [155.0, 1.8, 0]], n: 8, size: 0.09, shape: "dot", rate: 0.35, color: "heC", track: false, free: true, jitter: 0.06 };

// ═════ 站 K：供應商展台（x 180，s8）＝TOTO（日）、台灣精材（台）、翔名（台）；念到才從幽靈變實體 ═════
const SIGNS = [["toto", "logo:toto"], ["twcm", "text:twcm=台灣精材|3467"], ["xm", "text:xm=翔名|8091"]];
{ const r = spawnSync("node", [path.join(HERE, "..", "..", "scripts", "three", "make-brand-tex.mjs"), "tech-parts", "flag:JP", "flag:TW", ...SIGNS.map(([, a]) => a)], { encoding: "utf8" }); if (r.status !== 0) { console.error(r.stderr); process.exit(1); } }
const SIGNM = JSON.parse(fs.readFileSync(path.join(HERE, "..", "..", "public", "tex", "brand", "meta.json"), "utf8"));
["JP", "TW"].forEach((c) => { materials[`f_${c}`] = { kind: "unlit", color: "#FFFFFF", img: `tex/brand/flag-${c}.png` }; });
SIGNS.forEach(([id]) => { materials[`t_${id}`] = { kind: "unlit", color: "#FFFFFF", img: `tex/brand/sign-${id}.png` }; });
BACKDROP("kBack", 169.4, 191.0, 8.5);
LAY("kBase", [23, 1, 180, 0.5]); BOX("kPl", "kBase", 169.2, 191.2, 0, 0.9, -3.4, 3.4, "band"); BOX("kPlTop", "kBase", 169.2, 191.2, 0.9, 1.0, -3.4, 3.4, "panel2");
const KX = [173.8, 180.2, 186.6], KF = ["JP", "TW", "TW"];
KX.forEach((x, i) => { const id = ["kA", "kB", "kC"][i]; LAY(id, [5.4, 6.8, x, 3.6]);
  BOX(`${id}Ped`, id, R2(x - 2.5), R2(x + 2.5), 1.0, 2.2, -2.2, 2.2, "panel"); BOX(`${id}PedTop`, id, R2(x - 2.55), R2(x + 2.55), 2.2, 2.3, -2.25, 2.25, "steel2");
  const sg = SIGNM[`sign-${SIGNS[i][0]}`], sw = 3.6; P({ id: `${id}Sign`, layer: id, shape: "plane", size: [sw, R2(sw / sg.aspect)], pos: [x, 1.65, 2.23], uv01: true, shadow: false, mat: `t_${SIGNS[i][0]}` });
  const fg = SIGNM[`flag-${KF[i]}`]; 
  VC(`${id}Pole`, id, 0.07, 2.3, 7.6, "steel2", { x: R2(x + 2.2), z: -1.8 }); P({ id: `${id}Flag`, layer: id, shape: "plane", size: [2.1, R2(2.1 / fg.aspect)], pos: [R2(x + 3.3), 6.8, -1.8], uv01: true, shadow: false, mat: `f_${KF[i]}` }); SPH(`${id}PoleTop`, id, 0.14, R2(x + 2.2), 7.65, -1.8, "gold");
});
// TOTO：靜電吸盤（陶瓷盤面、氦氣環槽、頂針孔、密封環）
{ const x = KX[0]; VC("kaPuck", "kA", 2.0, 2.3, 2.9, "cer", { x }); VT("kaSeal", "kA", 2.0, 1.9, 2.9, 2.94, "cerD", { x }); VT("kaGroove", "kA", 1.2, 1.14, 2.9, 2.915, "dark", { x }); VT("kaGroove2", "kA", 0.55, 0.5, 2.9, 2.915, "dark", { x });
  P({ id: "kaHole", layer: "kA", shape: "cyl", size: [0.1, 0.02], rot: V, pos: [x, 2.91, 0], at: RING(3, 0.9, 30), mat: "dark" }); VC("kaBase", "kA", 2.15, 2.3, 2.5, "alu", { x }); }
// 台灣精材：陶瓷環、石英環、矽環三種
{ const x = KX[1]; [["kbC", -1.6, "cer"], ["kbQ", 0, "quartz"], ["kbS", 1.6, "si"]].forEach(([id, dx, mt]) => { VT(id, "kB", 0.78, 0.5, 2.3, 3.3, mt, { x: R2(x + dx), z: 0.4 }); VT(`${id}Lip`, "kB", 0.5, 0.38, 2.3, 2.9, mt, { x: R2(x + dx), z: 0.4 }); }); VT("kbQEdge", "kB", 0.79, 0.7, 3.27, 3.33, "edge", { x, z: 0.4 }); }
// 翔名：噴塗表面處理的環、離子佈植零件（弧室塊）
{ const x = KX[2]; VT("kcRing", "kC", 1.1, 0.7, 2.3, 3.1, "steel2", { x: R2(x - 1.0), z: 0.4 }); VT("kcCoat", "kC", 1.12, 0.68, 3.1, 3.2, "cerD", { x: R2(x - 1.0), z: 0.4 }); VT("kcCoatEdge", "kC", 1.13, 1.03, 3.18, 3.22, "edge", { x: R2(x - 1.0), z: 0.4 });
  BOX("kcBlock", "kC", R2(x + 0.5), R2(x + 2.1), 2.3, 3.5, -0.5, 1.3, "steel"); BOX("kcSlit", "kC", R2(x + 0.7), R2(x + 1.9), 3.3, 3.52, 0.1, 0.3, "dark"); P({ id: "kcBolt", layer: "kC", shape: "cyl", size: [0.07, 0.05], rot: V, pos: [x, 3.52, 0], at: [[0.65, 0, -0.3], [1.95, 0, -0.3], [0.65, 0, 1.1], [1.95, 0, 1.1]], mat: "steel2" }); }

// ═════ 站 R：無塵室（x 215，s9）＝頂部送風過濾單元往下送潔淨空氣（層流、一道道平行往下）、穿孔高架地板、白牆；機台與零件推車放在裡面 ═════
const RX0 = 202, RX1 = 228;
LAY("rRoom", [27, 12, 215, 6]); BOX("rFloor", "rRoom", RX0, RX1, 0, 0.9, -7, 7, "band"); BOX("rFloorT", "rRoom", RX0, RX1, 0.9, 1.0, -7, 7, "panel2");
P({ id: "rPerf", layer: "rRoom", shape: "cyl", size: [0.11, 0.02], rot: V, pos: [0, 1.005, 0], at: Array.from({ length: 5 }, (_, j) => Array.from({ length: 14 }, (_, i) => [R2(RX0 + 2.0 + i * 1.7), 0, R2(-5.2 + j * 2.6)])).flat(), mat: "dark" });
BOX("rBack", "rRoom", RX0, RX1, 1.0, 11, -7, -6.8, "wallW"); BOX("rLeft", "rRoom", RX0, RX0 + 0.2, 1.0, 11, -7, 7, "wallW"); BOX("rRightGlass", "rRoom", RX1 - 0.2, RX1, 1.0, 11, -7, 7, "window");
BOX("rCeil", "rRoom", RX0, RX1, 11, 11.5, -7, 7, "wallW"); BOX("rCutF", "rRoom", RX0, RX1, 0, 0.9, 7, 7.06, "cut"); BOX("rCutL", "rRoom", RX0, RX0 + 0.2, 1.0, 11.5, 7, 7.06, "cut");
BOX("rDoor", "rRoom", 205, 208.6, 1.0, 6.2, -6.8, -6.72, "panel2"); BOX("rDoorWin", "rRoom", 205.6, 208.0, 3.6, 5.4, -6.72, -6.68, "window"); BOX("rDoorBar", "rRoom", 205.2, 205.4, 3.0, 4.4, -6.72, -6.62, "steel2"); BOX("rWarn", "rRoom", 210, 211.8, 5.6, 6.6, -6.8, -6.76, "warnY");
for (let i = 0; i < 4; i++) BOX(`rWallSeam${i}`, "rRoom", R2(RX0 + 6 * i + 3), R2(RX0 + 6 * i + 3.05), 1.0, 11, -6.8, -6.77, "seam");
LAY("rFfu", [26, 1, 215, 10.8]); P({ id: "rFfuFrame", layer: "rFfu", shape: "box", size: [4.5, 0.12, 3.6], pos: [0, 10.9, 0], at: [0, 1, 2, 3, 4].flatMap((i) => [-4.2, 0, 4.2].map((z) => [R2(RX0 + 3.4 + i * 5.2), 0, z])), mat: "steel2" });
P({ id: "rFfuLight", layer: "rFfu", shape: "box", size: [4.0, 0.06, 3.1], pos: [0, 10.84, 0], at: [0, 1, 2, 3, 4].flatMap((i) => [-4.2, 0, 4.2].map((z) => [R2(RX0 + 3.4 + i * 5.2), 0, z])), mat: "ffu" });
LAY("rTool", [8, 8, 213, 4.6]); BOX("rtBody", "rTool", 209.5, 216.5, 1.0, 5.2, -2.2, 2.2, "panel"); BOX("rtCham", "rTool", 210.6, 215.4, 5.2, 7.3, -1.7, 1.7, "steel2"); VT("rtCoil", "rTool", 1.9, 1.7, 7.3, 7.45, "cu", { x: 213 }); BOX("rtLid", "rTool", 210.4, 215.6, 7.3, 7.5, -1.9, 1.9, "panel2");
BOX("rtScreen", "rTool", 210.2, 212.4, 3.3, 4.5, 2.2, 2.24, "screen"); BOX("rtDoor", "rTool", 213.0, 216.0, 1.4, 4.4, 2.2, 2.24, "panel2"); BOX("rtHandle", "rTool", 213.2, 213.35, 2.3, 3.5, 2.24, 2.34, "steel2"); P({ id: "rtVent", layer: "rTool", shape: "box", size: [2.0, 0.07, 0.04], pos: [211.3, 1.7, 2.22], at: Array.from({ length: 4 }, (_, i) => [0, i * 0.2, 0]), mat: "dark" });
VC("rtTower", "rTool", 0.12, 5.2, 8.1, "steel", { x: 216.1, z: 1.4 }); P({ id: "rtLamp", layer: "rTool", shape: "cyl", size: [0.2, 0.2], rot: V, pos: [216.1, 7.4, 1.4], at: [[0, 0, 0], [0, 0.3, 0], [0, 0.6, 0]], mat: "lampG" }); parts.at(-1).mat = "lampG";
BOX("rtFoot", "rTool", 209.3, 216.7, 0.95, 1.1, -2.3, 2.3, "band");
LAY("rParts", [6, 4, 223, 2.4]); BOX("rpTop", "rParts", 220.4, 225.6, 2.5, 2.65, -1.7, 1.7, "steel2"); BOX("rpShelf", "rParts", 220.6, 225.4, 1.6, 1.7, -1.5, 1.5, "steel2"); P({ id: "rpLeg", layer: "rParts", shape: "cyl", size: [0.07, 1.5], rot: V, pos: [223, 1.75, 0], at: [[-2.4, 0, -1.4], [2.4, 0, -1.4], [-2.4, 0, 1.4], [2.4, 0, 1.4]], mat: "steel" });
P({ id: "rpWheel", layer: "rParts", shape: "cyl", size: [0.2, 0.14], pos: [223, 1.15, 0], at: [[-2.4, 0, 1.5], [2.4, 0, 1.5], [-2.4, 0, -1.5], [2.4, 0, -1.5]], mat: "rubber" }); P({ id: "rpHandle", layer: "rParts", shape: "box", size: [0.1, 1.3, 0.1], pos: [225.8, 3.3, 0], mat: "steel2" }); BOX("rpBar", "rParts", 225.7, 225.9, 3.9, 4.0, -1.0, 1.0, "steel2");
VT("rpRing", "rParts", 1.3, 0.85, 2.65, 3.15, "quartz", { x: 221.9, z: 0.3 }); VC("rpPuck", "rParts", 1.1, 2.65, 3.1, "cer", { x: 224.2, z: -0.2 }); VC("rpWaf", "rParts", 1.0, 1.7, 1.78, "si", { x: 223, z: 0 });
[-4.5, 0, 4.5].forEach((z, k) => { actions[`rAir${k}`] = { type: "flow", _說明: "潔淨空氣從頂部單元往下送（層流：一道道平行往下、速度穩定）", layer: "rFfu", path: [[203.6, 10.7, z], [203.6, 1.1, z]], n: 6, lanes: 8, laneDir: [1, 0, 0], laneGap: 3.0, size: 0.09, shape: "dot", rate: 0.22 + 0.01 * k, color: "airC", track: false, free: true, jitter: 0.03, phase: 0.31 * k }; });
actions.rFfuPulse = { type: "pulse", parts: ["rFfuLight"], color: "airC", glow: 0.5, freq: 0.8, halo: 0 };

// ═════ 標註點 ═════
Object.assign(anchors, {
  plasmaA: A("plasma", [0.6, 5.4, 1.4], 150, -90), ringA: A("ring", [2.95, 3.5, 0.9], 150, -100), waferA: A("wafer", [1.5, 3.37, 1.3], -150, -90), escA: A("pedEsc", [1.5, 3.2, 1.4], -150, 100),
  linerA: A("liner", [3.2, 5.6, -4.4], 150, -80), wallA: A("chamber", [-7.5, 6.4, 1.0], -150, -80), windowA: A("chamber", [-4.5, 5.0, -4.4], 150, -90), topEA: A("topE", [1.8, 7.9, 1.6], 150, 100), pedA: A("pedBase", [3.4, 2.1, 1.0], 150, 100),
  bRing: A("bRing", [R2(bs.xb + 2.3), 2.7, BZ], 150, 120), bStep: A("bRing", [R2(bs.xb + 0.3), 2.95, BZ], -150, -100), bSpark: A("bSpark", [R2(bs.xb + 1.9), 3.9, 0.3], 150, -100), bLineA: A("bTopLine", [R2(bs.xb + 2.3), 3.8, 2.2], 150, -100), bPlasmaA: A("bPlasma", [30.5, 6.4, BZ], -150, -90), bEscA: A("bEsc", [29.6, 2.4, BZ], -150, 100), bWaferA: A("bWafer", [29.8, 3.1, BZ], -150, -100),
  sWafer: A("sWafer", [R2(SX + 2.0), 3.12, 1.6], -150, -90), sTop: A("sTop", [R2(SX + 2.4), 2.76, 1.8], 150, -60), sElec: A("sElec", [R2(SX - 1.5), 2.5, 1.5], -150, 100), sHeA: A("sHe", [R2(SX + 0.6), 2.4, 1.2], 150, 100), sCoolA: A("sCool", [R2(SX + 1.6), 1.5, 3.0], 150, 100),
  cNew: A("cNRing", [R2(cn.xb + 1.7), 3.0, BZ], -150, -100), cOld: A("cORing", [R2(co.xb + 1.7), 2.4, BZ], 150, -100), cArmA: A("cArm", [AX, 5.0, 0.7], 150, -90), cPlO: A("cPlO1", [R2(co.xb + 2.5), 4.5, BZ], 150, -100),
  eCerA: A("eCer", [122.2, EY, 2.3], -150, -100), eMetA: A("eMet", [134.2, EY, 2.3], 150, -100),
  pPumpA: A("pPump", [144.5, 4.5, 1.2], -150, -100), pValveA: A("pValve", [151.7, 4.25, 0.6], 150, -100), pPowerA: A("pPower", [156.4, 5.6, 1.4], 150, -90),
  rFfuA: A("rFfu", [215, 10.9, 4.2], -150, 100), rToolA: A("rTool", [213, 5.0, 2.3], -150, 100), rPartsA: A("rParts", [223, 3.0, 1.5], 150, 100),
});


// 站間距：P、K、R 整站往右平移（避免相鄰站被鏡頭看到邊緣）
const SHIFT = [[["pBack", "pPlinth", "pPump", "pValve", "pPower"], 12], [["kBack", "kBase", "kA", "kB", "kC"], 30], [["rRoom", "rFfu", "rTool", "rParts"], 50]];
const sx = (v, d) => [R2(v[0] + d), v[1], v[2]];
for (const [ls, d] of SHIFT) { const S = new Set(ls);
  for (const q of parts) if (S.has(q.layer)) q.pos = sx(q.pos, d);
  for (const l of layers) if (S.has(l.id)) l.outline = [l.outline[0], l.outline[1], R2(l.outline[2] + d), l.outline[3]];
  for (const a of Object.values(actions)) { if (S.has(a.layer)) { a.path = a.path?.map((p) => (Array.isArray(p) ? sx(p, d) : { ...p, p: sx(p.p, d) })); } if (a.type === "rotate" && a.pivot && a.parts?.some((id) => S.has(parts.find((q) => q.id === id)?.layer))) a.pivot = sx(a.pivot, d); }
  for (const a of Object.values(anchors)) if (S.has(a.layer)) a.p = sx(a.p, d);
}
const model = {
  name: "示意 零組件耗材：蝕刻腔體一角（腔壁、陶瓷內襯、吸盤、邊緣環、晶圓、電漿）、邊緣環剖面、靜電吸盤爆炸、新舊環對照與更換、陶瓷與金屬表面、真空泵閥門電源、供應商展台、無塵室（示意，非特定廠牌／型號）",
  unit: "示意（1＝10 cm）", size: { w: 40, h: 18, r: 0.6, t: 30 }, palette, materials,
  partNames: { ring: "邊緣環", pedEsc: "靜電吸盤", liner: "陶瓷內襯", wafer: "晶圓" },
  layers, parts, anchors, actions,
  pose: { yaw0: 0, yawIso: 0, drift: 0 }, camera: { stand: { d: 70, elev: 24, y: 4 } },
  fx: { dpr: 1, srcPx: 30, shadows: 0, fog: false, dust: false, vaporSprites: false, shimmer: false },
  info: { BX, BZ, bs, cn, co, AX, SX, EY, KX, RX },
};
fs.writeFileSync(path.join(HERE, "model.json"), JSON.stringify(model, null, 1) + "\n");
console.log(`✔ model.json：${parts.length} 個零件、${parts.reduce((a, p) => a + Math.max(1, (p.at?.length ?? 0)), 0)} 個實體、${layers.length} 層、${Object.keys(actions).length} 個動作`);

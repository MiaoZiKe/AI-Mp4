// node videos/tech-dicing/gen-model.mjs → 寫 videos/tech-dicing/model.json
// 2026/11/27 tech-dicing（晶圓切割與薄化，系列 3 第 1 集）。構造與物理照 physics-spec.md；來源 research.md §6。
// 單位：1＝2 cm（晶圓半徑 7.5＝300 mm），地板頂面 y＝0，x 向右、z 向觀眾。剖面站（X、C、L、T、V、K）另外放大，畫面標「示意，非實際比例」。站點：
//   A 刀片切割機（x 0）｜X 鋸子為什麼不行（x 60）｜C 崩角：厚薄對照（x 120）｜L 雷射隱形切割（x 180）｜E 擴片（x 240）
//   T 疊高度對照（x 300）｜G 背面研磨機（x 370）｜V 矽穿孔剖面（x 440）＋V2 四層堆疊（x 470）｜P 出貨箱（x 530）｜K 下一集預告（x 590）
//   外形依 DISCO／Hamamatsu 官方說明、大學無塵室 SOP（示意，非特定廠牌／型號）；只用兩個數字（轉速、厚度），模型不標尺寸。
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
  glassC: "#BFD3F2", lampY: "#F2B632", lampG: "#2FBF71", lampR: "#E5484D", screen: "#5B8DEF", rubber: "#2B2F36", gold: "#C9A24A", estop: "#D93A2B",
  siC: "#5E6B82", siTopC: "#6F7FA0", streetC: "#A8B6CC", kerfC: "#1C2333", circC: "#2F4E86", padC: "#D9B44A", tapeC: "#7FB6E8", bgTapeC: "#EAF2FA",
  ceramicC: "#F4F1EA", bladeC: "#6B7385", hubC: "#C3CBD8", diaC: "#E8F8FF", diaE: "#BFEFFF", waterC: "#9ED8F5", chipC: "#55607A", crackC: "#E5484D",
  laserC: "#E0473A", modC: "#B23A2E", siGlassC: "#7C8AA8", copperC: "#C77B3C", linerC: "#E9D9B8", bumpC: "#B9C2CF", subC: "#3F7A55", subPadC: "#E2B84A",
  okC: "#14A38B", badC: "#E5484D", frameC: "#9AA7BB", cartonC: "#C9A66B", cartonD: "#A9884F", whiteP: "#FFFFFF", markC: "#E8613C", warnY: "#F2B632", wireC: "#E7B341",
  wheelC: "#8C97AB", segC: "#D8DEE8", toothC: "#9099A8", sawC: "#B7BFCB", edgeC: "#F4FAFF",
};
const M = (kind, color, o = {}) => ({ kind, color, ...o });
const glowM = (c, op, ei = 1) => M("std", c, { emissive: c, ei, opacity: op, rough: 1, metal: 0 });
const materials = {
  floor: M("std", "floorC", { rough: 0.7, metal: 0.3, tex: "brushed", texScale: 6 }),
  panel: M("std", "panel", { rough: 0.55, metal: 0.05, env: 0.25 }), panel2: M("std", "panel2", { rough: 0.6, metal: 0.05, env: 0.2 }),
  seam: M("std", "seam", { rough: 0.6, metal: 0.3 }), band: M("std", "band", { rough: 0.4, metal: 0.3, env: 0.4 }),
  steel: M("std", "steel", { rough: 0.35, metal: 0.85, env: 0.5 }), steel2: M("std", "steel2", { rough: 0.3, metal: 0.8, env: 0.6, tex: "brushed", texScale: 3 }),
  dark: M("std", "dark", { rough: 0.5, metal: 0.4, env: 0.3 }), rubber: M("std", "rubber", { rough: 0.9, metal: 0 }), gold: M("std", "gold", { rough: 0.3, metal: 0.9, env: 0.8 }),
  window: M("phys", "glassC", { rough: 0.05, metal: 0, clearcoat: 1, opacity: 0.3, env: 0.6 }),
  lampY: M("std", "lampY", { emissive: "lampY", ei: 0.4, rough: 0.4, metal: 0 }), lampG: M("std", "lampG", { emissive: "lampG", ei: 0.35, rough: 0.4, metal: 0 }),
  lampR: M("std", "lampR", { emissive: "lampR", ei: 0.3, rough: 0.4, metal: 0 }), estop: M("std", "estop", { rough: 0.4, metal: 0, emissive: "estop", ei: 0.15 }),
  screen: M("std", "screen", { emissive: "screen", ei: 0.5, rough: 0.3, metal: 0 }),
  si: M("std", "siC", { rough: 0.3, metal: 0.55, env: 0.7 }), siTop: M("std", "siTopC", { rough: 0.25, metal: 0.5, env: 0.8, tex: "traces", texScale: 2.2 }),
  street: M("std", "streetC", { rough: 0.4, metal: 0.4, env: 0.5 }), kerf: M("std", "kerfC", { rough: 0.9, metal: 0.1 }),
  circ: M("std", "circC", { rough: 0.4, metal: 0.3, env: 0.5, tex: "traces", texScale: 1.2 }), pad: M("std", "padC", { rough: 0.3, metal: 0.9, env: 0.8 }),
  tape: M("phys", "tapeC", { rough: 0.2, metal: 0, clearcoat: 0.6, opacity: 0.72, env: 0.4 }), bgTape: M("std", "bgTapeC", { rough: 0.6, metal: 0, env: 0.2 }),
  ceramic: M("std", "ceramicC", { rough: 0.9, metal: 0, tex: "wick", texScale: 0.8, bump: 0.3 }),
  blade: M("std", "bladeC", { rough: 0.35, metal: 0.85, env: 0.6 }), hub: M("std", "hubC", { rough: 0.3, metal: 0.8, env: 0.6, tex: "brushed", texScale: 1 }),
  dia: M("std", "diaC", { rough: 0.05, metal: 0.2, env: 1.3, emissive: "diaE", ei: 0.45 }),
  waterDot: glowM("waterC", 0.9, 0.4), chipDot: glowM("chipC", 0.95, 0.05), chip: M("std", "chipC", { rough: 0.6, metal: 0.4 }),
  crack: M("std", "crackC", { emissive: "crackC", ei: 0.6, rough: 0.5, metal: 0 }),
  laser: M("std", "laserC", { emissive: "laserC", ei: 1, opacity: 0.42, rough: 1, metal: 0 }), laserCore: glowM("laserC", 0.95, 1.2),
  mod: M("std", "modC", { emissive: "laserC", ei: 0.9, rough: 0.6, metal: 0 }),
  siGlass: M("phys", "siGlassC", { rough: 0.2, metal: 0.2, clearcoat: 0.6, opacity: 0.5, env: 0.6 }),
  copper: M("std", "copperC", { rough: 0.25, metal: 0.9, env: 0.8 }), liner: M("std", "linerC", { rough: 0.5, metal: 0.1 }), bump: M("std", "bumpC", { rough: 0.3, metal: 0.9, env: 0.7 }),
  sub: M("std", "subC", { rough: 0.5, metal: 0.1, tex: "traces", texScale: 2 }), subPad: M("std", "subPadC", { rough: 0.3, metal: 0.9, env: 0.8 }),
  ok: M("std", "okC", { emissive: "okC", ei: 0.35, rough: 0.5, metal: 0 }), bad: M("std", "badC", { emissive: "badC", ei: 0.45, rough: 0.5, metal: 0 }),
  frame: M("std", "frameC", { rough: 0.3, metal: 0.85, env: 0.6, tex: "brushed", texScale: 2 }),
  carton: M("std", "cartonC", { rough: 0.95, metal: 0 }), cartonD: M("std", "cartonD", { rough: 0.95, metal: 0 }), white: M("std", "whiteP", { rough: 0.7, metal: 0 }),
  mark: M("std", "markC", { rough: 0.5, metal: 0, emissive: "markC", ei: 0.25 }), warnY: M("std", "warnY", { rough: 0.5, metal: 0, emissive: "warnY", ei: 0.2 }),
  wire: M("std", "wireC", { rough: 0.3, metal: 0.9, env: 0.8, emissive: "wireC", ei: 0.2 }),
  wheel: M("std", "wheelC", { rough: 0.35, metal: 0.8, env: 0.6, tex: "brushed", texScale: 2 }), seg: M("std", "segC", { rough: 0.6, metal: 0.3, env: 0.8, emissive: "diaE", ei: 0.15 }),
  tooth: M("std", "toothC", { rough: 0.4, metal: 0.8, env: 0.5 }), saw: M("std", "sawC", { rough: 0.35, metal: 0.85, env: 0.6, tex: "brushed", texScale: 3 }),
  edge: glowM("edgeC", 0.95, 0.5), okGlow: glowM("okC", 0.9, 0.8), badGlow: glowM("badC", 0.9, 0.8), wireDot: glowM("wireC", 0.95, 0.9),
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
const ZT = (id, layer, Ro, Ri, z0, z1, x, y, mat, o = {}) => P({ id, layer, shape: "tube", size: [Ro, Ri, R2(Math.abs(z1 - z0))], pos: [x, y, R2((z0 + z1) / 2)], mat, ...o });
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
const chord = (r, z) => 2 * Math.sqrt(Math.max(0, r * r - z * z));

// ═════ 地板 ═════
LAY("floor", [700, 2, 300, 0], true);
P({ id: "floor", layer: "floor", shape: "slab", size: [720, 0.5, 60], r: 0.2, pos: [300, -0.25, 0], mat: "floor" });
P({ id: "floorSeam", layer: "floor", shape: "slab", size: [720, 0.04, 0.12], pos: [300, 0.01, 0], at: Array.from({ length: 7 }, (_, i) => [0, 0, -24 + i * 8]), mat: "seam" });

// ═════ 站 A：刀片切割機（x 0）═════
// 機台本體（檯面、蛇腹護蓋、θ 轉台、排水槽、前面板）
const YT = 6.4, YC = 7.6, YF0 = 7.6, YF1 = 7.78, YTP = 7.64, YW = 7.94, WR = 7.5, PITCH = 1.0;
LAY("base", [34, 7, 0, 3.2], true);
BOX("baseBody", "base", -17, 17, 0, YT - 0.3, -13, 13, "panel"); BOX("baseTop", "base", -17, 17, YT - 0.3, YT, -13, 13, "panel2");
BOX("baseBand", "base", -17, 17, 0, 0.8, -13.05, 13.05, "band");
for (const sx of [-1, 1]) for (let i = 0; i < 9; i++) { const a = R2(sx * (10.4 + i * 0.6)), b = R2(sx * (10.4 + i * 0.6) + sx * 0.36); BOX(`bellow${sx > 0 ? "R" : "L"}${i}`, "base", Math.min(a, b), Math.max(a, b), YT, YT + 0.5, -5.2, 5.2, "rubber"); }
BOX("trough", "base", -16.6, 16.6, YT, YT + 0.2, 5.6, 6.6, "dark"); BOX("troughBack", "base", -16.6, 16.6, YT, YT + 0.2, -6.6, -5.6, "dark");
BOX("frontPanel", "base", -15, -3, 1.4, 5.2, 13, 13.08, "panel2"); BOX("frontScreen", "base", -14, -7.5, 2.4, 4.8, 13.08, 13.14, "screen");
P({ id: "frontLed", layer: "base", shape: "sphere", size: [0.18], pos: [-6.6, 4.4, 13.12], at: [[0, 0, 0], [0.7, 0, 0], [1.4, 0, 0]], mat: "lampG" });
BOX("frontEstop", "base", 10.6, 12, 3.2, 4.6, 13, 13.4, "estop"); BOX("frontWarn", "base", 6, 9.6, 2.0, 3.0, 13, 13.06, "warnY");
for (let i = 0; i < 6; i++) BOX(`frontVent${i}`, "base", 2, 8, 4.0 + i * 0.22, 4.1 + i * 0.22, 13, 13.06, "dark");
P({ id: "baseScrew", layer: "base", shape: "cyl", size: [0.16, 0.08], rot: V, pos: [0, YT + 0.02, 0], at: [[-16.3, 0, -12.3], [16.3, 0, -12.3], [-16.3, 0, 12.3], [16.3, 0, 12.3]], mat: "steel" });
// 背後立柱＋橫樑（主軸沿 z 方向進給，Y 軸）
LAY("col", [8, 14, 0, 12], true);
BOX("colBody", "col", -3, 3, YT, 17.6, -16, -13.4, "panel"); BOX("colCap", "col", -3.2, 3.2, 17.6, 18.1, -16.2, -13.2, "steel2");
BOX("beam", "col", -1.6, 1.6, 15.6, 17.2, -13.4, 3.4, "panel2"); BOX("beamRail", "col", -1.0, 1.0, 15.3, 15.6, -13.4, 3.2, "steel");
BOX("beamCap", "col", -1.7, 1.7, 15.5, 17.3, 3.4, 3.7, "steel2"); BOX("colLamp", "col", 2.2, 2.8, 16.2, 17.2, -13.38, -13.3, "lampG");
// 主軸（沿 z 橫放）、刀片、法蘭、螺帽、刀蓋與噴嘴、對位攝影機；ZC0＝刀片初始 z
const ZC0 = -2.0, BR = 2.8, BCY = R2(YW + BR - 0.32), BT = 0.12;
LAY("spindle", [6, 6, 0, 12]);
ZC("spHouse", "spindle", 1.5, ZC0 - 13, ZC0 - 1.0, 0, BCY, "steel2");
for (let i = 0; i < 8; i++) ZT(`spFin${i}`, "spindle", 1.62, 1.45, R2(ZC0 - 12 + i * 1.1), R2(ZC0 - 11.7 + i * 1.1), 0, BCY, "dark");
ZC("spNose", "spindle", 0.55, ZC0 - 1.0, ZC0 - 0.3, 0, BCY, "steel");
BOX("spSlide", "spindle", -1.5, 1.5, BCY + 1.4, 15.3, ZC0 - 11, ZC0 - 5, "steel"); BOX("spSlideCap", "spindle", -1.6, 1.6, 15.0, 15.3, ZC0 - 11.2, ZC0 - 4.8, "dark");
PIPE("spAir", "spindle", [[1.2, BCY + 0.8, ZC0 - 12.4], [1.2, 15.0, ZC0 - 12.4]], 0.18, "rubber");
BOX("spPlate", "spindle", -1.0, 1.0, BCY + 1.3, BCY + 1.52, ZC0 - 9, ZC0 - 6, "gold");
LAY("flangeR", [2, 3, 0, BCY]); ZC("flR", "flangeR", 1.25, ZC0 - 0.3, ZC0 - BT / 2, 0, BCY, "steel"); ZT("flRLip", "flangeR", 1.3, 1.1, ZC0 - 0.3, ZC0 - 0.22, 0, BCY, "dark");
LAY("blade", [6, 6, 0, BCY]);
ZC("bdDisc", "blade", BR - 0.16, ZC0 - BT / 2, ZC0 + BT / 2, 0, BCY, "blade"); ZT("bdEdge", "blade", BR, BR - 0.18, ZC0 - BT / 2 - 0.01, ZC0 + BT / 2 + 0.01, 0, BCY, "dia");
ZC("bdHub", "blade", 1.7, ZC0 - 0.2, ZC0 + 0.2, 0, BCY, "hub"); ZT("bdHubRim", "blade", 1.75, 1.55, ZC0 - 0.22, ZC0 + 0.22, 0, BCY, "steel");
BOX("bdMark", "blade", -0.12, 0.12, BCY + 1.0, BCY + 1.65, ZC0 + 0.2, ZC0 + 0.24, "mark");
P({ id: "bdGrit", layer: "blade", shape: "sphere", size: [0.06], pos: [0, BCY, ZC0 + 0.08], at: Array.from({ length: 36 }, (_, i) => { const [x, y] = pol(i * 10, BR - 0.08); return [x, y, 0]; }), mat: "dia" });
LAY("flangeF", [2, 3, 0, BCY]); ZC("flF", "flangeF", 1.2, ZC0 + 0.2, ZC0 + 0.5, 0, BCY, "steel"); ZT("flFLip", "flangeF", 1.25, 1.05, ZC0 + 0.2, ZC0 + 0.28, 0, BCY, "dark");
LAY("nut", [1.6, 1.6, 0, BCY]); ZC("nutBody", "nut", 0.8, ZC0 + 0.5, ZC0 + 0.95, 0, BCY, "dark");
P({ id: "nutHole", layer: "nut", shape: "cyl", size: [0.1, 0.06], pos: [0, BCY, ZC0 + 0.97], at: [[0.5, 0, 0], [-0.5, 0, 0], [0, 0.5, 0], [0, -0.5, 0]], mat: "steel" });
LAY("cover", [7, 4, 0, BCY + 2]);
BOX("cvTop", "cover", -3.4, 3.4, BCY + 2.85, BCY + 3.15, ZC0 - 0.75, ZC0 + 1.15, "panel2");
BOX("cvBack", "cover", -3.4, 3.4, BCY + 0.7, BCY + 2.85, ZC0 - 0.75, ZC0 - 0.6, "panel2"); BOX("cvFront", "cover", -3.4, 3.4, BCY + 0.7, BCY + 2.85, ZC0 + 1.0, ZC0 + 1.15, "window");
BOX("cvEnd", "cover", 3.25, 3.4, BCY + 0.7, BCY + 2.85, ZC0 - 0.75, ZC0 + 1.15, "panel2"); BOX("cvEndL", "cover", -3.4, -3.25, BCY + 0.7, BCY + 2.85, ZC0 - 0.75, ZC0 + 1.15, "panel2");
BOX("cvLabel", "cover", -1.4, 1.4, BCY + 1.6, BCY + 2.4, ZC0 + 1.15, ZC0 + 1.18, "warnY");
const NZX = -2.6, NZY = R2(YW + 0.55);
for (const [k, dz] of [["A", -0.42], ["B", 0.42]]) PIPE(`nz${k}`, "cover", [[-3.0, BCY + 2.9, ZC0 + dz], [-3.0, BCY + 0.9, ZC0 + dz], [NZX, NZY, ZC0 + dz]], 0.14, "steel");
PIPE("nzFeed", "cover", [[-3.0, BCY + 3.15, ZC0], [-3.0, BCY + 4.2, ZC0], [-3.0, BCY + 4.2, ZC0 - 6]], 0.2, "rubber");
// 對位攝影機（主軸旁，跟著主軸走）
VC("camBody", "spindle", 0.6, BCY + 0.2, BCY + 3.6, "rubber", { x: -5.4, z: ZC0 });
VT("camRing", "spindle", 0.75, 0.55, BCY - 0.3, BCY + 0.2, "edge", { x: -5.4, z: ZC0 });
BOX("camArm", "spindle", -5.4, -1.4, BCY + 2.6, BCY + 3.2, ZC0 - 0.3, ZC0 + 0.3, "dark");
// 卡盤（多孔陶瓷真空吸盤）＋θ 轉台＋夾爪
LAY("chuck", [20, 2, 0, 7]);
VT("thTable", "chuck", 9.6, 8.9, YT, YT + 0.5, "dark"); P({ id: "thTick", layer: "chuck", shape: "box", size: [0.12, 0.08, 0.5], pos: [0, YT + 0.52, 0], at: RING(36, 9.25), mat: "steel2" });
VC("ckBase", "chuck", 8.9, YT, YC - 0.4, "steel2"); VC("ckCer", "chuck", 8.2, YC - 0.4, YC - 0.02, "ceramic"); VT("ckRim", "chuck", 8.9, 8.2, YC - 0.4, YC - 0.05, "steel");
const CLAMPS = RING(4, 10.4, 45).map(([x, , z], i) => { LAY(`clamp${i}`, [1.4, 0.8, x, YC]); BOX(`ckClamp${i}`, `clamp${i}`, x - 0.8, x + 0.8, YC - 0.35, YC + 0.42, z - 0.9, z + 0.9, "dark"); BOX(`ckClampArm${i}`, `clamp${i}`, R2(x - 0.25), R2(x + 0.25), YC + 0.42, YC + 0.9, R2(z - 0.25), R2(z + 0.25), "lampY"); BOX(`ckClampPad${i}`, `clamp${i}`, R2(x - 0.3), R2(x + 0.3), YC + 0.32, YC + 0.4, R2(z - 0.4), R2(z + 0.4), "rubber"); return { id: `clamp${i}`, x, z }; });
// 鐵框＋膠膜＋晶圓（晶片格線、缺口）
LAY("frame", [24, 0.4, 0, YF1]);
VT("frRing", "frame", 11.4, 9.7, YF0, YF1, "frame"); P({ id: "frNotch", layer: "frame", shape: "box", size: [0.9, 0.2, 0.5], pos: [0, YF1 - 0.08, 0], at: [[-11.2, 0, 0], [11.2, 0, 0]], mat: "dark" });
BOX("frFlatN", "frame", -3, 3, YF0, YF1 + 0.01, -11.5, -11.1, "steel");
LAY("tape", [20, 0.2, 0, YTP]); VC("tpFilm", "tape", 9.75, YF0 + 0.01, YTP, "tape");
LAY("wafer", [16, 0.4, 0, YW]);
VC("wfBody", "wafer", WR, YTP, YW - 0.03, "si"); VC("wfTop", "wafer", WR - 0.05, YW - 0.03, YW, "siTop");
BOX("wfNotch", "wafer", -0.3, 0.3, YTP, YW + 0.005, -WR - 0.02, -WR + 0.3, "kerf");
for (let i = -7; i <= 7; i++) { const c = chord(WR - 0.15, i * PITCH); if (c < 0.5) continue;
  BOX(`stX${i + 7}`, "wafer", R2(-c / 2), R2(c / 2), YW, YW + 0.008, R2(i * PITCH - 0.04), R2(i * PITCH + 0.04), "street");
  BOX(`stZ${i + 7}`, "wafer", R2(i * PITCH - 0.04), R2(i * PITCH + 0.04), YW, YW + 0.008, R2(-c / 2), R2(c / 2), "street"); }
// 切痕：每一道切完才出現（深色、略寬於走道）
const CUTS = [-2, -1, 0, 1, 2, 3];
CUTS.forEach((zc, k) => { LAY(`kerf${k}`, [16, 0.1, 0, YW]); const c = chord(WR, zc); BOX(`kf${k}`, `kerf${k}`, R2(-c / 2), R2(c / 2), YTP + 0.02, YW + 0.012, R2(zc - 0.07), R2(zc + 0.07), "kerf"); });

// ═════ 站 X：為什麼不能用鋸子（x 60；剖面放大）：一片連續的矽，前後兩顆晶片的電路層中間留一條沿 x 的窄走道；鋸片平面＝走道方向（x-y 平面），厚度比走道寬很多 ═════
const XX = 60, XTOP = 8.6, XSW = 0.3;
LAY("xBlock", [22, 5, XX, 6]);
BOX("xBase", "xBlock", XX - 11, XX + 11, 0, 5.2, -4.2, 4.2, "steel2"); BOX("xTape", "xBlock", XX - 10.6, XX + 10.6, 5.2, 5.6, -3.8, 3.8, "tape");
BOX("xSi", "xBlock", XX - 10.2, XX + 10.2, 5.6, XTOP, -3.6, 3.6, "si");
BOX("xCircF", "xBlock", XX - 10.2, XX + 10.2, XTOP, XTOP + 0.4, XSW, 3.6, "circ"); BOX("xCircB", "xBlock", XX - 10.2, XX + 10.2, XTOP, XTOP + 0.4, -3.6, -XSW, "circ");
BOX("xStreet", "xBlock", XX - 10.2, XX + 10.2, XTOP, XTOP + 0.02, -XSW, XSW, "street");
P({ id: "xPad", layer: "xBlock", shape: "box", size: [0.8, 0.12, 0.8], pos: [XX, XTOP + 0.46, 0], at: [-8.6, -6.2, -3.8, -1.4, 1.4, 3.8, 6.2, 8.6].flatMap((x) => [[x, 0, -2.2], [x, 0, 2.2]]), mat: "pad" });
const XSR = 6.4, XSY = R2(XTOP + XSR + 0.55 - 0.9);       // 鋸齒尖落到走道表面下 0.9（真的切進去）
LAY("xSaw", [14, 14, XX, XSY]);
ZC("xsDisc", "xSaw", XSR, -0.6, 0.6, XX, XSY, "saw"); ZC("xsArbor", "xSaw", 1.1, -1.4, 1.4, XX, XSY, "dark"); ZC("xsNut", "xSaw", 0.6, 1.4, 1.8, XX, XSY, "steel");
BOX("xsMark", "xSaw", XX - 0.2, XX + 0.2, XSY + 2.6, XSY + 5.6, 0.6, 0.66, "mark");
for (let i = 0; i < 30; i++) { const a = i * 12, [x, y] = pol(a, XSR + 0.3); P({ id: `xsT${i}`, layer: "xSaw", shape: "box", size: [0.9, 0.55, 1.3], pos: [R2(XX + x), R2(XSY + y), 0], rot: [0, 0, a + 30], mat: "tooth" }); }
// 裂紋：鋸齒碰到走道的地方往前後兩顆晶片爆開（頂面）＋前切面往下裂
LAY("xCrack", [12, 4, XX, 7]);
const XCR = [[-0.4, 0.3, 1.4, 1, 30], [0.5, 0.3, 1.6, 1, -25], [-1.6, 1.4, 1.2, 1, 60], [1.4, 1.5, 1.3, 1, -55], [-0.4, -0.3, 1.4, -1, -30], [0.6, -0.3, 1.5, -1, 25], [1.7, -1.4, 1.2, -1, 55]];
XCR.forEach(([dx, z0, L, sz, a], i) => P({ id: `xCr${i}`, layer: "xCrack", shape: "box", size: [0.1, 0.06, L], pos: [R2(XX + dx), XTOP + 0.43, R2(z0 + sz * L / 2)], rot: [0, a, 0], mat: "crack" }));
const frontCrack = [[0, XTOP], [0.6, XTOP - 0.9], [-0.3, XTOP - 1.7], [0.8, XTOP - 2.7]];
for (let i = 0; i < frontCrack.length - 1; i++) { const [x0, y0] = frontCrack[i], [x1, y1] = frontCrack[i + 1], L = Math.hypot(x1 - x0, y1 - y0), a = Math.atan2(y1 - y0, x1 - x0) / D2R;
  P({ id: `xCf${i}`, layer: "xCrack", shape: "box", size: [R2(L + 0.05), 0.12, 0.06], pos: [R2(XX + (x0 + x1) / 2), R2((y0 + y1) / 2), 3.63], rot: [0, 0, R2(a)], mat: "crack" }); }
LAY("xChips", [6, 3, XX, 10]);
P({ id: "xChip", layer: "xChips", shape: "box", size: [0.45, 0.3, 0.5], pos: [XX, XTOP + 0.6, 0], at: [[-1.4, 0, 1.2], [1.1, 0, -1.0], [-2.2, 0, -1.6], [1.9, 0, 1.4], [-0.9, 0, 2.2]], mat: "chip" });

// ═════ 站 C：崩角（x 120；剖面：切口的一面牆朝鏡頭，前半片拿掉）：左厚（切口整齊）、右薄（背面崩角）；刀片在切口裡（x-y 平面） ═════
const CX = 120, CTY = 6.6, CBX = CX + 6.5, CWZ = 0;
LAY("cBlock", [26, 6, CX, 3]);
BOX("cBase", "cBlock", CX - 13, CX + 13, 0, 5.0, -3.4, 1.6, "steel2"); BOX("cTape", "cBlock", CX - 12.6, CX + 12.6, 5.0, 5.4, -3.0, 1.2, "tape");
BOX("cTapeKerf", "cBlock", CX - 12.6, CX + 12.6, 5.25, 5.41, CWZ, 0.5, "kerf");
BOX("cThick", "cBlock", CX - 12, CX - 1, 5.4, 10.4, -2.8, CWZ, "si"); BOX("cThickCirc", "cBlock", CX - 12, CX - 1, 10.4, 10.7, -2.8, CWZ, "circ");
BOX("cThin", "cBlock", CX + 1, CX + 12, 5.4, CTY, -2.8, CWZ, "si"); BOX("cThinCirc", "cBlock", CX + 1, CX + 12, CTY, CTY + 0.3, -2.8, CWZ, "circ");
// 薄晶圓切口牆的背面（下緣）崩角：刀走過才崩下（碎片往前掉），留下紅色缺口
const CHIPS = [[-2.4, 0.5], [-1.0, 0.4], [0.4, 0.55], [1.6, 0.35], [2.8, 0.45]];
LAY("cScar", [8, 1, CBX, 5.6]); P({ id: "cScar", layer: "cScar", shape: "box", size: [0.7, 0.4, 0.06], pos: [CBX, 5.62, CWZ + 0.02], at: CHIPS.map(([dx]) => [dx, 0, 0]), mat: "bad" });
CHIPS.forEach(([dx, h], i) => { LAY(`cChip${i}`, [1, 1, CBX + dx, 5.6]); P({ id: `cCh${i}`, layer: `cChip${i}`, shape: "box", size: [0.7, h, 0.4], pos: [R2(CBX + dx), R2(5.42 + h / 2), CWZ + 0.2], rot: [R2(rnd() * 20), R2(rnd() * 30), R2(rnd() * 40 - 20)], mat: "chip" }); });
const CBR = 4.6, CBY0 = R2(5.25 + CBR), CBZ = 0.3;
LAY("cBlade", [10, 10, CBX, CBY0]);
ZC("cbDisc", "cBlade", CBR - 0.2, CBZ - 0.12, CBZ + 0.12, CBX, CBY0, "blade"); ZT("cbEdge", "cBlade", CBR, CBR - 0.22, CBZ - 0.13, CBZ + 0.13, CBX, CBY0, "dia");
ZC("cbHub", "cBlade", 2.4, CBZ + 0.13, CBZ + 0.6, CBX, CBY0, "hub"); ZC("cbFl", "cBlade", 1.8, CBZ + 0.6, CBZ + 1.0, CBX, CBY0, "steel"); BOX("cbMark", "cBlade", CBX - 0.15, CBX + 0.15, CBY0 + 1.5, CBY0 + 2.3, CBZ + 0.6, CBZ + 0.66, "mark");
P({ id: "cbGrit", layer: "cBlade", shape: "sphere", size: [0.09], pos: [CBX, CBY0, CBZ + 0.12], at: Array.from({ length: 40 }, (_, i) => { const [x, y] = pol(i * 9, CBR - 0.1); return [x, y, 0]; }), mat: "dia" });
ZC("cbShaft", "cBlade", 0.7, CBZ + 1.0, CBZ + 3.2, CBX, CBY0, "steel2");
BOX("cbCover", "cBlade", CBX - 5.2, CBX + 5.2, CBY0 + 0.9, CBY0 + 5.3, CBZ - 0.5, CBZ - 0.38, "panel2"); BOX("cbCoverTop", "cBlade", CBX - 5.2, CBX + 5.2, CBY0 + 5.1, CBY0 + 5.4, CBZ - 0.5, CBZ + 1.2, "panel2");
BOX("cbCoverL", "cBlade", CBX - 5.3, CBX - 5.1, CBY0 + 0.9, CBY0 + 5.4, CBZ - 0.5, CBZ + 1.2, "panel2"); BOX("cbCoverR", "cBlade", CBX + 5.1, CBX + 5.3, CBY0 + 0.9, CBY0 + 5.4, CBZ - 0.5, CBZ + 1.2, "panel2");
BOX("cbCoverWin", "cBlade", CBX - 5.1, CBX + 5.1, CBY0 + 0.9, CBY0 + 5.1, CBZ + 1.1, CBZ + 1.2, "window"); BOX("cbCoverLab", "cBlade", CBX - 1.4, CBX + 1.4, CBY0 + 3.6, CBY0 + 4.4, CBZ + 1.2, CBZ + 1.24, "warnY");
PIPE("cbNz", "cBlade", [[CBX - 5.0, CBY0 + 4.8, CBZ + 0.6], [CBX - 5.0, CBY0 + 1.0, CBZ + 0.6], [CBX - 3.0, CTY + 0.75, CBZ + 0.6]], 0.16, "steel");

// ═════ 站 L：雷射隱形切割（x 180；晶圓剖面半透明，看得到內部）═════
const LX = 180, LW0 = 5.4, LW1 = 8.6, LFY = 7.0;
LAY("lBlock", [24, 6, LX, 4]);
BOX("lBase", "lBlock", LX - 12, LX + 12, 0, 4.9, -3.6, 3.6, "steel2"); BOX("lTape", "lBlock", LX - 11.6, LX + 11.6, 4.9, LW0, -3.2, 3.2, "tape");
BOX("lSi", "lBlock", LX - 11, LX + 11, LW0, LW1, -3, 3, "siGlass"); BOX("lCirc", "lBlock", LX - 11, LX + 11, LW1, LW1 + 0.25, -3, 3, "circ");
BOX("lStreet", "lBlock", LX - 11, LX + 11, LW1 + 0.25, LW1 + 0.27, -0.25, 0.25, "street");
const LH0 = LX - 9;
LAY("lHead", [4, 12, LH0, 16]);
VC("lhBody", "lHead", 1.4, 15.6, 22.0, "panel2", { x: LH0 }); VC("lhCap", "lHead", 1.55, 21.6, 22.4, "steel", { x: LH0 }); VT("lhBand", "lHead", 1.5, 1.38, 18.2, 18.6, "lampR", { x: LH0 });
VC("lhLensBarrel", "lHead", 0.95, 13.8, 15.6, "dark", { x: LH0 }); VC("lhLens", "lHead", 0.8, 13.6, 13.8, "window", { x: LH0 });
BOX("lhArm", "lHead", LH0 - 0.6, LH0 + 0.6, 20.4, 21.2, -5, -1.2, "dark"); PIPE("lhFiber", "lHead", [[LH0, 22.4, 0], [LH0, 23.4, 0], [LH0, 23.4, -5]], 0.2, "rubber");
P({ id: "lhBeam", layer: "lHead", shape: "cone", size: [0.04, 0.7, R2(13.6 - LFY)], rot: [90, 0, 0], pos: [LH0, R2((13.6 + LFY) / 2), 0], mat: "laser" });
P({ id: "lhFocus", layer: "lHead", shape: "sphere", size: [0.22], pos: [LH0, LFY, 0], mat: "laserCore" });
// 改質點：沿切割道一排，雷射頭走過才逐段出現；裂紋從改質層往上下表面延伸（細線）
const LDOT = 8;
for (let g = 0; g < LDOT; g++) { LAY(`lDot${g}`, [2.4, 4, LH0 + g * 2.25, LFY]);
  P({ id: `lD${g}`, layer: `lDot${g}`, shape: "sphere", size: [0.17], pos: [R2(LH0 + g * 2.25), LFY, 0], at: [[-0.75, 0, 0], [0, 0, 0], [0.75, 0, 0]], mat: "mod" }); }
for (let g = 0; g < LDOT; g++) { LAY(`lCrk${g}`, [2.4, 4, LH0 + g * 2.25, LFY]);
  BOX(`lCk${g}`, `lCrk${g}`, R2(LH0 + g * 2.25 - 0.03), R2(LH0 + g * 2.25 + 0.03), LW0 + 0.05, LW1 - 0.05, -0.04, 0.04, "crack"); }

// ═════ 站 E：擴片（x 240）═════
const EX = 240, EY = 5.4, EG = 1.6, ED = 1.42;
LAY("eBase", [26, 6, EX, 2.8]);
VC("ebBody", "eBase", 12.6, 0, EY - 0.4, "panel", { x: EX }); VT("ebBand", "eBase", 12.65, 12.2, 0, 0.8, "band", { x: EX });
VT("ebClamp", "eBase", 12.2, 9.8, EY + 0.25, EY + 0.8, "dark", { x: EX }); P({ id: "ebBolt", layer: "eBase", shape: "cyl", size: [0.2, 0.12], rot: V, pos: [EX, EY + 0.86, 0], at: RING(12, 11.0), mat: "steel" });
VT("ebFrame", "eBase", 11.4, 9.7, EY - 0.4, EY - 0.05, "frame", { x: EX });
VT("ebTapeOut", "eBase", 9.75, 8.25, EY - 0.05, EY, "tape", { x: EX });
P({ id: "ebHot", layer: "eBase", shape: "box", size: [1.6, 1.0, 1.6], pos: [EX - 10.2, EY + 1.6, -10.2], mat: "warnY" });
LAY("eLift", [18, 3, EX, 4]); VT("elRing", "eLift", 8.2, 7.5, 0.8, EY - 0.02, "steel2", { x: EX }); VT("elRingTop", "eLift", 8.25, 7.45, EY - 0.12, EY - 0.02, "dark", { x: EX });
LAY("eTape", [17, 0.2, EX, EY]); VC("etFilm", "eTape", 8.25, EY - 0.05, EY, "tape", { x: EX });
LAY("eSkirt", [20, 2, EX, EY]); P({ id: "esCone", layer: "eSkirt", shape: "cone", size: [9.75, 8.25, 1.5], rot: [-90, 0, 0], pos: [EX, R2(EY + 0.75 - 0.02), 0], mat: "tape" });
const EDIE = [];
for (let i = 0; i < 6; i++) for (let j = 0; j < 6; j++) { const x = (i - 2.5) * EG, z = (j - 2.5) * EG; const id = `eD${i}${j}`; LAY(id, [ED, 0.3, EX + x, EY + 0.2]);
  BOX(`${id}b`, id, R2(EX + x - ED / 2), R2(EX + x + ED / 2), EY, EY + 0.28, R2(z - ED / 2), R2(z + ED / 2), "si"); BOX(`${id}t`, id, R2(EX + x - ED / 2 + 0.05), R2(EX + x + ED / 2 - 0.05), EY + 0.28, EY + 0.32, R2(z - ED / 2 + 0.05), R2(z + ED / 2 - 0.05), "siTop");
  EDIE.push({ id, x, z }); }

// ═════ 站 T：為什麼要磨薄（x 300）：同一個封裝高度框，厚晶片疊三層爆框、薄晶片疊八層剛好 ═════
const TX = 300, TH = 6.0, TB = 2.0;
for (const [nm, cx] of [["tA", TX - 6], ["tB", TX + 6]]) {
  LAY(`${nm}Box`, [9, 9, cx, 5]);
  BOX(`${nm}Sub`, `${nm}Box`, cx - 4, cx + 4, 0, TB, -3, 3, "sub"); P({ id: `${nm}Ball`, layer: `${nm}Box`, shape: "sphere", size: [0.3], pos: [cx, 0.25, 2.5], at: [-3, -1.8, -0.6, 0.6, 1.8, 3].map((x) => [x, 0, 0]), mat: "bump" });
  for (const [k, [x0, x1, z0, z1]] of [[0, [-4, -3.9, -3, 3]], [1, [3.9, 4, -3, 3]], [2, [-4, 4, -3, -2.9]]].map(([k, b]) => [k, b])) BOX(`${nm}Wall${k}`, `${nm}Box`, cx + x0, cx + x1, TB, TB + TH, z0, z1, "window");
  LAY(`${nm}LidL`, [9, 0.2, cx, TB + TH]); BOX(`${nm}Lid`, `${nm}LidL`, cx - 4.2, cx + 4.2, TB + TH, TB + TH + 0.12, -3.1, 3.1, "warnY"); BOX(`${nm}Post`, `${nm}Box`, cx - 4.2, cx - 3.9, TB, TB + TH, 2.9, 3.1, "warnY"); BOX(`${nm}Post2`, `${nm}Box`, cx + 3.9, cx + 4.2, TB, TB + TH, 2.9, 3.1, "warnY");
}
const THK = 2.45, THN = 0.62, TUB = 0.1;
for (let k = 0; k < 3; k++) { const y0 = R2(TB + TUB + k * (THK + TUB)); LAY(`tK${k}`, [6, THK, TX - 6, y0 + THK / 2]);
  BOX(`tK${k}Si`, `tK${k}`, TX - 9, TX - 3, y0, y0 + THK - 0.1, -2.4, 2.4, k === 2 ? "bad" : "si"); BOX(`tK${k}Top`, `tK${k}`, TX - 9, TX - 3, y0 + THK - 0.1, y0 + THK, -2.4, 2.4, "circ");
  P({ id: `tK${k}Bump`, layer: `tK${k}`, shape: "sphere", size: [0.08], pos: [TX - 6, y0 - 0.04, 0], at: [-2.4, -1.2, 0, 1.2, 2.4].map((x) => [x, 0, 1.8]), mat: "bump" }); }
for (let k = 0; k < 8; k++) { const y0 = R2(TB + TUB + k * (THN + TUB)); LAY(`tN${k}`, [6, THN, TX + 6, y0 + THN / 2]);
  BOX(`tN${k}Si`, `tN${k}`, TX + 3, TX + 9, y0, y0 + THN - 0.08, -2.4, 2.4, "si"); BOX(`tN${k}Top`, `tN${k}`, TX + 3, TX + 9, y0 + THN - 0.08, y0 + THN, -2.4, 2.4, "circ");
  P({ id: `tN${k}Bump`, layer: `tN${k}`, shape: "sphere", size: [0.06], pos: [TX + 6, y0 - 0.03, 0], at: [-2.4, -1.2, 0, 1.2, 2.4].map((x) => [x, 0, 1.8]), mat: "bump" }); }
LAY("tOk", [1, 1, TX + 6, TB + TH + 1]); VT("tOkRing", "tOk", 0.9, 0.6, TB + TH + 0.6, TB + TH + 0.8, "okGlow", { x: TX + 6, z: 3.4 });
LAY("tBad", [1, 1, TX - 6, TB + TH + 1]); P({ id: "tBadX", layer: "tBad", shape: "box", size: [2.2, 0.3, 0.3], pos: [TX - 6, TB + TH + 1.6, 3.4], at: [[0, 0, 0]], rot: [0, 0, 45], mat: "badGlow" });
P({ id: "tBadX2", layer: "tBad", shape: "box", size: [2.2, 0.3, 0.3], pos: [TX - 6, TB + TH + 1.6, 3.4], rot: [0, 0, -45], mat: "badGlow" });

// ═════ 站 G：背面研磨機（x 370）：轉盤 4 個卡盤、粗磨 Z1（右）、細磨 Z2（後）、測厚探頭 ═════
const GX = 370, GY = 5.0, GTR = 9.2, GCR = 3.7, GOFF = 5.4, GWR = 3.3, GWY = GY + 1.25;
LAY("gBase", [30, 6, GX, 2.5]);
BOX("gbBody", "gBase", GX - 15, GX + 15, 0, GY - 0.2, -13, 13, "panel"); BOX("gbTop", "gBase", GX - 15, GX + 15, GY - 0.2, GY, -13, 13, "panel2");
BOX("gbBand", "gBase", GX - 15, GX + 15, 0, 0.8, -13.05, 13.05, "band"); BOX("gbScreen", "gBase", GX - 13, GX - 6, 1.6, 3.8, 13, 13.08, "screen");
P({ id: "gbLed", layer: "gBase", shape: "sphere", size: [0.18], pos: [GX - 4.8, 3.4, 13.08], at: [[0, 0, 0], [0.7, 0, 0], [1.4, 0, 0]], mat: "lampG" });
BOX("gbWarn", "gBase", GX + 6, GX + 10, 1.8, 2.8, 13, 13.06, "warnY"); VT("gbSplash", "gBase", GTR + 0.9, GTR + 0.6, GY, GY + 1.2, "panel2", { x: GX });
// 轉盤（含 4 個卡盤）
LAY("gTable", [20, 1.5, GX, GY + 0.5]);
VC("gtDisc", "gTable", GTR, GY, GY + 0.5, "steel2", { x: GX }); VC("gtHub", "gTable", 1.4, GY + 0.5, GY + 0.8, "dark", { x: GX });
BOX("gtMark", "gTable", GX - 0.2, GX + 0.2, GY + 0.5, GY + 0.56, GTR - 1.2, GTR - 0.2, "mark");
const GPOS = [[0, GOFF], [GOFF, 0], [0, -GOFF], [-GOFF, 0]];          // 前（裝卸）、右（粗磨 Z1）、後（細磨 Z2）、左（拋光）
GPOS.forEach(([dx, dz], i) => { VC(`gtCk${i}`, "gTable", GCR, GY + 0.5, GY + 0.95, "steel", { x: GX + dx, z: dz }); VC(`gtCer${i}`, "gTable", GCR - 0.3, GY + 0.95, GY + 1.0, "ceramic", { x: GX + dx, z: dz }); });
// 晶圓（倒扣、正面貼 BG 膠帶）：前站剛放下的那片（G0，三層矽：磨一層藏一層）＋後站細磨那片（G2）
const gWafer = (nm, dx, dz, n) => { LAY(`${nm}Tape`, [7, 0.1, GX + dx, GY + 1.03]); VC(`${nm}TapeD`, `${nm}Tape`, GWR, GY + 1.0, GY + 1.06, "bgTape", { x: GX + dx, z: dz });
  for (let k = 0; k < n; k++) { LAY(`${nm}S${k}`, [7, 0.15, GX + dx, GY + 1.1 + k * 0.16]); VC(`${nm}S${k}D`, `${nm}S${k}`, GWR - 0.02, R2(GY + 1.06 + k * 0.16), R2(GY + 1.22 + k * 0.16), "si", { x: GX + dx, z: dz }); } };
gWafer("g0", GPOS[0][0], GPOS[0][1], 4); gWafer("g2", GPOS[2][0], GPOS[2][1], 2);
// 翻面中的那片（正面＝電路面朝上、貼 BG 膠帶 → 翻 180 度，膠帶朝下）
LAY("gFlip", [7, 1, GX, GY + 7]); VC("gfSi", "gFlip", GWR, GY + 6.6, GY + 7.2, "si", { x: GX, z: GOFF }); VC("gfTape", "gFlip", GWR, GY + 7.2, GY + 7.28, "bgTape", { x: GX, z: GOFF });
BOX("gfArm", "gFlip", GX - 11, GX - 0.6, GY + 7.3, GY + 7.7, GOFF - 0.4, GOFF + 0.4, "dark"); BOX("gfArmPost", "gFlip", GX - 11.4, GX - 10.6, GY - 0.2, GY + 7.7, GOFF - 0.4, GOFF + 0.4, "steel2"); VC("gfPad", "gFlip", 1.0, GY + 7.28, GY + 7.36, "rubber", { x: GX, z: GOFF });
// 研磨主軸（杯型鑽石砂輪：外緣一圈磨塊）：Z1 粗磨在右站、Z2 細磨在後站；輪心偏離晶圓中心＝輪緣經過晶圓中心
const spindleG = (nm, wx, wz, segN, segMat) => { LAY(nm, [9, 12, wx, GY + 7]); const y0 = GWY + 0.15;
  VT(`${nm}Cup`, nm, GWR + 0.2, GWR - 0.7, y0 + 0.4, y0 + 1.5, "wheel", { x: wx, z: wz }); VC(`${nm}Web`, nm, GWR + 0.2, y0 + 1.5, y0 + 1.8, "wheel", { x: wx, z: wz });
  P({ id: `${nm}Seg`, layer: nm, shape: "box", size: [0.5, 0.42, 0.8], pos: [wx, R2(y0 + 0.21), wz], at: RING(segN, GWR - 0.25).map(([x, , z]) => [x, 0, z]), mat: segMat });
  VC(`${nm}Flange`, nm, 1.6, y0 + 1.8, y0 + 2.3, "steel", { x: wx, z: wz }); VC(`${nm}Shaft`, nm, 0.7, y0 + 2.3, y0 + 4.0, "steel2", { x: wx, z: wz });
  VC(`${nm}House`, nm, 1.9, y0 + 4.0, y0 + 9.0, "panel2", { x: wx, z: wz }); for (let i = 0; i < 5; i++) VT(`${nm}Fin${i}`, nm, 2.0, 1.85, R2(y0 + 4.6 + i * 0.8), R2(y0 + 4.9 + i * 0.8), "dark", { x: wx, z: wz });
  BOX(`${nm}Mark`, nm, wx - 0.1, wx + 0.1, y0 + 0.5, y0 + 1.4, wz + GWR + 0.18, wz + GWR + 0.24, "mark");
  BOX(`${nm}Slide`, nm, wx - 1.4, wx + 1.4, y0 + 5, y0 + 9.6, wz - 3.6, wz - 1.8, "steel"); };
const Z1X = GX + GOFF + GWR, Z1Z = 0, Z2X = GX, Z2Z = -GOFF - GWR;
spindleG("gZ1", Z1X, Z1Z, 18, "seg"); spindleG("gZ2", Z2X, Z2Z, 30, "dia");
LAY("gCol", [26, 16, GX, 10]); BOX("gcBack", "gCol", GX - 13, GX + 13, GY, GY + 15, -13, -11.4, "panel"); BOX("gcCap", "gCol", GX - 13.2, GX + 13.2, GY + 15, GY + 15.4, -13.2, -11.2, "steel2");
BOX("gcRail1", "gCol", Z1X - 0.6, Z1X + 0.6, GY + 2, GY + 15, -11.4, -11.0, "steel"); BOX("gcArm1", "gCol", Z1X - 1.2, Z1X + 1.2, GY + 12.4, GY + 13.4, -11.4, Z1Z - 1.8, "panel2");
BOX("gcRail2", "gCol", Z2X - 0.6, Z2X + 0.6, GY + 2, GY + 15, -11.4, -11.0, "steel");
// 測厚探頭（跟著 Z1 站）
LAY("gProbe", [2, 4, Z1X - GWR - 1.6, GY + 3]); VC("gpBody", "gProbe", 0.35, GWY + 0.9, GWY + 4, "dark", { x: GX + GOFF - 1.2, z: 2.4 }); VC("gpTip", "gProbe", 0.12, GWY + 0.3, GWY + 0.9, "lampY", { x: GX + GOFF - 1.2, z: 2.4 });
BOX("gpArm", "gProbe", GX + GOFF - 1.4, GX + GOFF - 1.0, GWY + 3.6, GWY + 4.0, -2.0, 2.4, "dark");
// 研磨水噴嘴（Z1）
PIPE("gNz", "gZ1", [[Z1X - 5.6, GWY + 3.2, 1.6], [Z1X - 4.6, GWY + 1.0, 1.0]], 0.15, "steel");

// ═════ 站 V：矽穿孔（x 440 剖面：背面矽磨掉、銅柱露頭）＋V2（x 470 四層堆疊，電流沿銅柱往下）═════
const VX = 440, VY0 = 4.6, VCI = 5.2, VTOP = 10.4, VS = [10.4, 11.2, 12.0, 12.8];
LAY("vBlock", [22, 9, VX, 7]);
BOX("vBase", "vBlock", VX - 11, VX + 11, 0, VY0 - 0.4, -3.6, 3.6, "steel2"); BOX("vCarrier", "vBlock", VX - 10.6, VX + 10.6, VY0 - 0.4, VY0, -3.2, 3.2, "glassC" in materials ? "window" : "window");
BOX("vCirc", "vBlock", VX - 10, VX + 10, VY0, VCI, -3, 3, "circ"); BOX("vSi", "vBlock", VX - 10, VX + 10, VCI, VTOP, -3, 3, "si");
const VPIL = [-7.5, -4.5, -1.5, 1.5, 4.5, 7.5];
P({ id: "vPilLiner", layer: "vBlock", shape: "cyl", size: [0.56, R2(VTOP + 0.02 - VCI)], rot: V, pos: [VX, R2((VTOP + 0.02 + VCI) / 2), 3.02], at: VPIL.map((x) => [x, 0, 0]), mat: "liner" });
P({ id: "vPil", layer: "vBlock", shape: "cyl", size: [0.5, R2(VTOP + 0.03 - VCI)], rot: V, pos: [VX, R2((VTOP + 0.03 + VCI) / 2), 3.12], at: VPIL.map((x) => [x, 0, 0]), mat: "copper" });
for (let k = 0; k < 3; k++) { LAY(`vS${k}`, [20, 0.8, VX, VS[k] + 0.4]); BOX(`vS${k}B`, `vS${k}`, VX - 10, VX + 10, VS[k], VS[k + 1], -3, 3, k === 2 ? "siTop" : "si"); }
LAY("vTip", [20, 0.3, VX, VTOP]); P({ id: "vTipG", layer: "vTip", shape: "cyl", size: [0.5, 0.06], rot: V, pos: [VX, VTOP + 0.02, 0], at: VPIL.map((x) => [x, 0, 3.12]), mat: "copper" });
LAY("vWheel", [10, 3, VX, 14]); BOX("vwBody", "vWheel", VX - 6, VX + 6, 13.4, 14.6, -3.4, 3.4, "wheel");
P({ id: "vwSeg", layer: "vWheel", shape: "box", size: [1.1, 0.5, 6.6], pos: [VX, 13.15, 0], at: [-5, -3, -1, 1, 3, 5].map((x) => [x, 0, 0]), mat: "seg" });
const V2X = 470, V2T = 1.3, V2B = 0.22, V2N = 4, V2Y0 = 2.0;
LAY("v2Sub", [16, 2, V2X, 1]); BOX("v2SubB", "v2Sub", V2X - 8, V2X + 8, 0, V2Y0, -3.6, 3.6, "sub");
P({ id: "v2Ball", layer: "v2Sub", shape: "sphere", size: [0.34], pos: [V2X, 0.28, 3.0], at: [-6, -3.6, -1.2, 1.2, 3.6, 6].map((x) => [x, 0, 0]), mat: "bump" });
const V2P = [-4.5, -1.5, 1.5, 4.5];
for (let k = 0; k < V2N; k++) { const y0 = R2(V2Y0 + V2B + k * (V2T + V2B)), id = `v2L${k}`; LAY(id, [12, V2T, V2X, y0 + V2T / 2]);
  BOX(`${id}Si`, id, V2X - 6, V2X + 6, y0, y0 + V2T - 0.14, -2.8, 2.8, "si"); BOX(`${id}Circ`, id, V2X - 6, V2X + 6, y0 + V2T - 0.14, y0 + V2T, -2.8, 2.8, "circ");
  P({ id: `${id}Pil`, layer: id, shape: "cyl", size: [0.34, V2T + 0.02], rot: V, pos: [V2X, R2(y0 + V2T / 2), 2.82], at: V2P.map((x) => [x, 0, 0]), mat: "copper" });
  P({ id: `${id}Bmp`, layer: id, shape: "sphere", size: [0.17], pos: [V2X, R2(y0 - V2B / 2), 2.6], at: V2P.map((x) => [x, 0, 0]), mat: "bump" }); }
const V2TOP = R2(V2Y0 + V2B + V2N * (V2T + V2B));

// ═════ 站 P：出貨箱（x 530）：三只紙箱貼文字貼紙（不仿商標）═════
const SIGNS = [["dcdisco", "DISCO|迪思科"], ["dcbtl", "鈦昇|8027"], ["dcphoe", "昇陽半導體|8028"]];
{ const r = spawnSync("node", [path.join(HERE, "..", "..", "scripts", "three", "make-brand-tex.mjs"), "tech-dicing", ...SIGNS.map(([id, t]) => `text:${id}=${t}`)], { encoding: "utf8" }); if (r.status !== 0) { console.error(r.stderr); process.exit(1); } }
SIGNS.forEach(([id]) => { materials[`t_${id}`] = { kind: "unlit", color: "#FFFFFF", img: `tex/brand/sign-${id}.png` }; });
const PX = 530, PBW = 6.4, PBH = 5.6;
LAY("pPallet", [24, 1.2, PX, 0.5]); BOX("ppDeck", "pPallet", PX - 12, PX + 12, 0.6, 1.0, -4, 4, "cartonD");
P({ id: "ppFoot", layer: "pPallet", shape: "box", size: [1.6, 0.6, 7.6], pos: [PX, 0.3, 0], at: [[-10.6, 0, 0], [0, 0, 0], [10.6, 0, 0]], mat: "dark" });
P({ id: "ppSlat", layer: "pPallet", shape: "box", size: [23.6, 0.06, 0.5], pos: [PX, 1.03, 0], at: [[0, 0, -3], [0, 0, -1], [0, 0, 1], [0, 0, 3]], mat: "seam" });
const PCOL = ["badGlow", "okGlow", "warnY"];
SIGNS.forEach(([id], i) => { const cx = PX + (i - 1) * 7.6, ly = `p${i}`; LAY(ly, [PBW, PBH, cx, 1 + PBH / 2]);
  BOX(`${ly}Box`, ly, cx - PBW / 2, cx + PBW / 2, 1.0, 1.0 + PBH, -3.2, 3.2, "carton"); BOX(`${ly}Lid`, ly, cx - PBW / 2 - 0.05, cx + PBW / 2 + 0.05, 1.0 + PBH - 0.5, 1.0 + PBH, -3.25, 3.25, "cartonD");
  BOX(`${ly}TapeS`, ly, cx - 0.5, cx + 0.5, 1.0 + PBH, 1.0 + PBH + 0.02, -3.25, 3.25, "seam"); BOX(`${ly}Band`, ly, cx - PBW / 2 - 0.02, cx + PBW / 2 + 0.02, 1.2, 1.7, 3.2, 3.24, PCOL[i]);
  P({ id: `${ly}Sign`, layer: ly, shape: "plane", size: [5.2, 2.6], pos: [cx, 4.1, 3.23], mat: `t_${id}`, uv01: true });
  BOX(`${ly}Fragile`, ly, cx + 1.6, cx + 2.7, 1.9, 2.6, 3.2, 3.24, "warnY"); });

// ═════ 站 K：下一集預告（x 590）：一顆切好的晶片放在基板，焊墊亮、金線虛線預告 ═════
const KX = 590;
LAY("kSub", [16, 2, KX, 1]); BOX("ksBody", "kSub", KX - 8, KX + 8, 0, 1.4, -6, 6, "sub");
P({ id: "ksPad", layer: "kSub", shape: "box", size: [0.7, 0.08, 0.5], pos: [KX, 1.44, 0], at: [...[-4.2, -2.8, -1.4, 0, 1.4, 2.8, 4.2].map((x) => [x, 0, -5.0]), ...[-4.2, -2.8, -1.4, 0, 1.4, 2.8, 4.2].map((x) => [x, 0, 5.0]), ...[-3, -1, 1, 3].map((z) => [-7.0, 0, z]), ...[-3, -1, 1, 3].map((z) => [7.0, 0, z])], mat: "subPad" });
LAY("kDie", [9, 1, KX, 2]); BOX("kdSi", "kDie", KX - 4.6, KX + 4.6, 1.4, 2.4, -3.6, 3.6, "si"); BOX("kdTop", "kDie", KX - 4.5, KX + 4.5, 2.4, 2.48, -3.5, 3.5, "siTop");
P({ id: "kdPad", layer: "kDie", shape: "box", size: [0.5, 0.06, 0.5], pos: [KX, 2.5, 0], at: [...[-4.2, -2.8, -1.4, 0, 1.4, 2.8, 4.2].map((x) => [x * 0.95, 0, -3.1]), ...[-4.2, -2.8, -1.4, 0, 1.4, 2.8, 4.2].map((x) => [x * 0.95, 0, 3.1])], mat: "pad" });
LAY("kWire", [10, 2, KX, 3]);
const KWP = [];
for (const side of [-1, 1]) [-4.2, -2.8, -1.4, 0, 1.4, 2.8, 4.2].forEach((x, i) => { const a = [x * 0.95, 2.53, side * 3.1], b = [x, 1.5, side * 5.0], c = [x * 0.97, 4.1, side * 3.8];
  const pts = Array.from({ length: 22 }, (_, k) => { const t = k / 21, u = 1 - t; return [R2(u * u * a[0] + 2 * u * t * c[0] + t * t * b[0]), R2(u * u * a[1] + 2 * u * t * c[1] + t * t * b[1]), R2(u * u * a[2] + 2 * u * t * c[2] + t * t * b[2])]; });
  P({ id: `kW${side > 0 ? "F" : "B"}${i}`, layer: "kWire", shape: "sphere", size: [0.075], pos: [KX, 0, 0], at: pts, mat: "wire" }); if (side > 0) KWP.push(pts[7]); });

// ═════ 動作 ═════
const tableIds = [...idsOf("chuck"), ...idsOf("frame"), ...idsOf("tape"), ...idsOf("wafer"), ...CUTS.flatMap((_, k) => idsOf(`kerf${k}`))];
actions.tableFeed = { type: "vibrate", _說明: "卡盤帶晶圓沿 x 直線走刀（刀片不動，桌子來回）", parts: tableIds, axis: [1, 0, 0], amp: 7.2, freq: 0.19 };
const bladeIds = [...idsOf("blade"), ...idsOf("flangeR"), ...idsOf("flangeF"), ...idsOf("nut")];
actions.bladeSpin = { type: "rotate", _說明: "刀片高速旋轉（示意轉速；紅色標記讓旋轉看得見），起轉加速、停轉減速；轉向＝刀口底部往 +x，和水、矽屑被帶出的方向一致", parts: bladeIds, axis: [0, 0, 1], pivot: [0, BCY, ZC0], rps: 2.4, rampSpin: true };
actions.water = { type: "flow", _說明: "兩側噴嘴對刀口噴純水：沿管流出、打到刀口後被刀片往後甩成拋物線、帶走矽屑", layer: "cover", path: [[NZX, NZY, ZC0 - 0.42], [-0.6, YW + 0.25, ZC0 - 0.3], [1.8, YW + 1.4, ZC0 - 0.2], [4.4, YW + 0.2, ZC0 - 0.1]], n: 12, size: 0.13, shape: "dot", rate: 0.9, color: "waterC", track: false, free: true, jitter: 0.12 };
actions.water2 = { type: "flow", layer: "cover", path: [[NZX, NZY, ZC0 + 0.42], [-0.6, YW + 0.25, ZC0 + 0.3], [1.8, YW + 1.6, ZC0 + 0.25], [4.6, YW + 0.2, ZC0 + 0.15]], n: 12, size: 0.13, shape: "dot", rate: 0.85, color: "waterC", track: false, free: true, jitter: 0.12 };
actions.sawDust = { type: "flow", _說明: "矽屑（灰點）隨水被甩出", layer: "cover", path: [[0.4, YW + 0.05, ZC0], [2.6, YW + 1.0, ZC0 + 0.2], [5.4, YW + 0.1, ZC0 + 0.4]], n: 8, size: 0.09, shape: "dot", rate: 0.7, color: "chipC", track: false, free: true, jitter: 0.15 };
actions.xSawSpin = { type: "rotate", _說明: "粗齒鋸片轉動（鋸片平面＝走道方向）", parts: idsOf("xSaw"), axis: [0, 0, 1], pivot: [XX, XSY, 0], rps: 0.7, rampSpin: true };
actions.xChipFly = { type: "flow", _說明: "鋸子一碰，脆的矽爆出碎片往外飛（受重力）", layer: "xBlock", path: [[XX, XTOP + 0.5, 0.8], [XX - 1.2, XTOP + 3.2, 2.6], [XX - 2.4, XTOP + 0.9, 4.0]], n: 5, size: 0.24, shape: "dot", rate: 0.8, color: "chipC", track: false, free: true, jitter: 0.5, accel: true };
actions.xChipFly2 = { type: "flow", layer: "xBlock", path: [[XX, XTOP + 0.5, 0.8], [XX + 3.4, XTOP + 3.0, 1.4], [XX + 6.8, XTOP + 0.7, 2.0]], n: 5, size: 0.24, shape: "dot", rate: 0.75, color: "chipC", track: false, free: true, jitter: 0.5, accel: true };
actions.cBladeSpin = { type: "rotate", _說明: "刀片轉向＝刀口底部往 +x，水與矽屑往右甩（刀蓋、噴嘴不轉）", parts: idsOf("cBlade").filter((i) => !/Cover|Nz/.test(i)), axis: [0, 0, 1], pivot: [CBX, CBY0, 0], rps: 2.0, rampSpin: true };
actions.cWater = { type: "flow", _說明: "噴嘴從左邊對刀口噴水，被刀口帶往右甩出", layer: "cBlade", path: [[CBX - 3.0, CTY + 0.75, CBZ + 0.6], [CBX - 0.6, CTY + 0.45, CBZ + 0.5], [CBX + 2.8, CTY + 1.8, CBZ + 0.7], [CBX + 5.4, CTY + 0.35, CBZ + 0.9]], n: 10, size: 0.16, shape: "dot", rate: 0.9, color: "waterC", track: false, free: true, jitter: 0.15 };
actions.cDust = { type: "flow", layer: "cBlade", path: [[CBX + 0.3, CTY + 0.35, CBZ + 0.5], [CBX + 2.6, CTY + 1.4, CBZ + 0.8], [CBX + 4.8, CTY + 0.2, CBZ + 1.0]], n: 6, size: 0.12, shape: "dot", rate: 0.7, color: "chipC", track: false, free: true, jitter: 0.2 };
actions.cScarGlow = { type: "pulse", parts: ["cScar"], color: "badC", glow: 0.9, freq: 1.2, halo: 0 };
actions.lPulse = { type: "pulse", _說明: "雷射脈衝閃動（焦點在晶圓中間）", parts: ["lhFocus", "lhBeam"], color: "laserC", glow: 1, freq: 3.0, halo: 0 };
actions.eHot = { type: "flow", _說明: "熱風收緊外圈膠膜（DDS 類擴片機：冷擴片後熱風）", layer: "eBase", path: [[EX - 10.2, EY + 1.1, -10.2], [EX - 9.6, EY + 0.3, -9.4], [EX - 8.8, EY + 0.1, -8.6]], n: 6, size: 0.16, shape: "dot", rate: 0.8, color: "lampY", track: false, free: true, jitter: 0.2 };
actions.gTableIndex = { type: "rotate", _說明: "轉盤轉一格（90 度）：把剛放下的晶圓從裝卸站送到粗磨站", parts: [...idsOf("gTable"), ...["g0Tape", "g0S0", "g0S1", "g0S2", "g0S3"].flatMap(idsOf)], axis: [0, 1, 0], pivot: [GX, 0, 0], angle: 90, hold: true };
actions.gFlipRot = { type: "rotate", _說明: "機械手把晶圓翻面（正面貼膠帶朝下）", parts: idsOf("gFlip").filter((i) => i !== "gfArm"), axis: [1, 0, 0], pivot: [GX, GY + 6.9, GOFF], angle: 180, hold: true };
actions.gZ1Spin = { type: "rotate", _說明: "粗磨砂輪自轉（杯型，輪緣磨塊經過晶圓中心）", parts: idsOf("gZ1").filter((i) => !/Slide|Nz/.test(i)), axis: [0, 1, 0], pivot: [Z1X, 0, Z1Z], rps: 1.4, rampSpin: true };
actions.gZ2Spin = { type: "rotate", parts: idsOf("gZ2").filter((i) => !/Slide/.test(i)), axis: [0, 1, 0], pivot: [Z2X, 0, Z2Z], rps: 1.6, rampSpin: true };
actions.gW2Spin = { type: "rotate", _說明: "細磨站的卡盤帶晶圓自轉（與砂輪同時轉＝in-feed 研磨）", parts: ["g2TapeD", "g2S0D", "g2S1D", "gtCk2", "gtCer2"], axis: [0, 1, 0], pivot: [GX, 0, -GOFF], rps: 0.5, rampSpin: true };
actions.gCoarse = { type: "flow", _說明: "粗磨：大顆磨屑隨研磨水甩出", layer: "gZ1", path: [[GX + GOFF, GWY + 0.4, 0.6], [GX + GOFF - 2.0, GWY + 1.6, 2.6], [GX + GOFF - 3.6, GY + 0.6, 4.6]], n: 7, size: 0.2, shape: "dot", rate: 0.8, color: "chipC", track: false, free: true, jitter: 0.35, accel: true };
actions.gWater = { type: "flow", layer: "gZ1", path: [[Z1X - 4.6, GWY + 1.0, 1.0], [GX + GOFF + 0.2, GWY + 0.35, 0.4], [GX + GOFF - 1.8, GWY + 1.0, 2.6], [GX + GOFF - 3.2, GY + 0.5, 4.2]], n: 9, size: 0.13, shape: "dot", rate: 0.9, color: "waterC", track: false, free: true, jitter: 0.15 };
actions.gFine = { type: "flow", _說明: "細磨：細粉（小點）", layer: "gZ2", path: [[GX, GWY + 0.3, -GOFF + 0.4], [GX - 2.2, GWY + 1.1, -GOFF + 2.0], [GX - 3.8, GY + 0.5, -GOFF + 3.8]], n: 10, size: 0.09, shape: "dot", rate: 0.9, color: "chipC", track: false, free: true, jitter: 0.25, accel: true };
actions.vWheelRub = { type: "vibrate", _說明: "砂輪磨塊在背面來回磨", parts: idsOf("vWheel"), axis: [1, 0, 0], amp: 0.9, freq: 1.2 };
actions.vDust = { type: "flow", layer: "vWheel", path: [[VX - 6, 13.0, 3.4], [VX - 8.6, 13.8, 4.2], [VX - 10.4, 11.2, 4.8]], n: 6, size: 0.14, shape: "dot", rate: 0.8, color: "chipC", track: false, free: true, jitter: 0.25, accel: true };
actions.vTipGlow = { type: "pulse", parts: ["vTipG"], color: "copperC", glow: 0.9, freq: 1.0, halo: 0 };
V2P.forEach((x, i) => { actions[`v2Cur${i}`] = { type: "flow", _說明: "電流沿銅柱垂直穿過四層晶片（像電梯井）", layer: "v2Sub", path: [[R2(V2X + x), R2(V2TOP + 0.4), 3.05], [R2(V2X + x), R2(V2Y0 + 0.1), 3.05]], n: 4, size: 0.2, shape: "dot", rate: 0.5 + i * 0.04, color: "lampY", track: false, free: true, jitter: 0.0 }; });
actions.kPadGlow = { type: "pulse", parts: ["kdPad"], color: "padC", glow: 1, freq: 1.2, halo: 0 };
actions.kWireGlow = { type: "pulse", parts: idsOf("kWire"), color: "wireC", glow: 0.9, freq: 1.0, halo: 0 };

// 標註點
Object.assign(anchors, {
  blade: A("blade", [-1.6, BCY + 2.2, ZC0 + 0.2], -150, -90), bladeE: A("blade", [0, BCY - BR + 0.15, ZC0 + 0.1], 150, 100),
  wafer: A("wafer", [-4.5, YW, 3.2], -150, -100), tape: A("tape", [-8.6, YTP, 4.4], -150, 100), frame: A("frame", [7.6, YF1, 7.9], 150, 100), chuck: A("chuck", [8.4, YC - 0.3, 3.8], 150, 100),
  cover: A("cover", [2.4, BCY + 3.1, ZC0 + 0.4], 150, -90), nozzle: A("cover", [NZX, NZY + 0.6, ZC0 + 0.42], -150, -90), flange: A("flangeF", [0, BCY + 1.1, ZC0 + 0.5], 150, -90), spindle: A("spindle", [0, BCY + 1.5, ZC0 - 7], 150, -90), cam: A("spindle", [-5.4, BCY + 3.6, ZC0], -150, -90),
  street: A("xBlock", [XX + 5, XTOP + 0.02, 0], 150, 100), xcrack: A("xCrack", [XX + 0.3, XTOP - 1.3, 3.64], -150, 100), saw: A("xSaw", [XX - 4.5, XSY + 4.5, 0.6], -150, -90),
  cThick: A("cBlock", [CX - 6, 10.7, -0.2], -40, -170), cChip: A("cScar", [CBX + 1.6, 5.62, 0.1], 150, 100), cBlade: A("cBlade", [CBX + 2, CBY0 + 3, CBZ], 150, -90),
  lHead: A("lHead", [LH0 + 1.4, 19.5, 0.6], 150, -90), lFocus: A("lHead", [LH0, LFY, 0.3], -150, 100), lDot: A("lDot4", [LH0 + 4 * 2.25, LFY, 0.3], 150, 100),
  eTape: A("eSkirt", [EX + 8.2, EY + 0.9, 3.4], 150, -100), eDie: A("eD55", [EX + 2.5 * EG, EY + 0.3, 2.5 * EG], 150, 100), eLift: A("eLift", [EX + 7.8, 2.4, 2.8], 150, 100),
  tThick: A("tK2", [TX - 6, TB + TUB + 2 * (THK + TUB) + THK, 2.4], -150, -100), tThin: A("tN7", [TX + 6, TB + TUB + 7 * (THN + TUB) + THN, 2.4], 150, -100), tBox: A("tBBox", [TX + 9.9, TB + TH, 3.1], 150, -100),
  gTape: A("gFlip", [GX + GWR, GY + 7.24, GOFF + 0.4], 150, -90), gWheel1: A("gZ1", [Z1X + GWR, GWY + 1.2, Z1Z], 150, -90), gWheel2: A("gZ2", [Z2X + GWR, GWY + 1.2, Z2Z], 150, -90), gProbe: A("gProbe", [GX + GOFF - 1.2, GWY + 2.2, 2.4], -150, -90),
  vPil: A("vBlock", [VX + 4.5, 8.0, 3.1], 150, 100), vTip: A("vTip", [VX + 1.5, VTOP + 0.1, 1.5], 150, -90), v2Pil: A("v2L3", [V2X + 4.5, V2TOP - 0.6, 2.9], 150, -90),
  p0: A("p0", [PX - 7.6, 4.1, 3.3], -150, -90), p1: A("p1", [PX, 4.1, 3.3], 150, -90), p2: A("p2", [PX + 7.6, 4.1, 3.3], 150, -90),
  kPad: A("kDie", [KX + 4.0, 2.5, 3.1], 150, -90), kWire: A("kWire", [R2(KX + KWP[2][0]), KWP[2][1], KWP[2][2]], -150, -90),
});

const model = {
  name: "示意 晶圓切割與薄化：刀片切割機（主軸、刀片、法蘭、刀蓋噴嘴、卡盤、框架膠膜晶圓）、鋸子破壞剖面、崩角對照、雷射隱形切割、擴片機、疊高度對照、背面研磨機（轉盤、粗細砂輪、測厚）、矽穿孔剖面與堆疊、出貨箱、打線預告（示意，非特定廠牌／型號）",
  unit: "示意（1＝2 cm；剖面站另外放大）",
  size: { w: 40, h: 20, r: 0.6, t: 30 },
  palette, materials,
  partNames: { blade: "鑽石刀片", wafer: "晶圓", tape: "膠膜", frame: "鐵框", chuck: "卡盤" },
  layers, parts, anchors, actions,
  pose: { yaw0: 0, yawIso: 0, drift: 0 },
  camera: { stand: { d: 90, elev: 24, y: 8 } },
  fx: { dpr: 1, srcPx: 30, shadows: 0, fog: false, dust: false, vaporSprites: false, shimmer: false },
  info: { CLAMPS, BCY, ZC0, BR, YW, WR, CUTS, XX, XSY, CX, CBX, CBY0, CTY, LX, LH0, LFY, EX, EY, EDIE, TX, GX, GY, GOFF, Z1X, Z2Z, VX, V2X, V2TOP, PX, KX },
};
const out = path.join(HERE, "model.json");
fs.writeFileSync(out, JSON.stringify(model, null, 1) + "\n");
console.log(`✔ ${out}：${parts.length} 個零件、${parts.reduce((a, p) => a + Math.max(1, (p.at?.length ?? 0)), 0)} 個實體（含複製）、${layers.length} 層`);

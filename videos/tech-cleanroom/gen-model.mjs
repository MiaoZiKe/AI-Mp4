// node videos/tech-cleanroom/gen-model.mjs → 寫 videos/tech-cleanroom/model.json
// 2026/11/27 tech-cleanroom（廠務-1：無塵室，系列 2 第 19 集）。構造與物理照 physics-spec.md、模組清單照 visual-spec.md。
// 單位：1＝約 0.5 m（示意；站 F 纖維放大另計，1＝約 1.7 µm），地板頂面 y＝0，x 向右、z 向觀眾。站點：
//   R 廠房剖面（x 0；外觀、屋頂機組、旗桿、警衛室、冷卻水塔 → 前牆打開：空氣室、風扇濾網陣列、無塵室、機台、高架地板、回風層、回風豎井）
//   K 衣櫃大的空氣（x 40；一立方公尺衣櫃、十顆灰塵、微粒計數器）｜F 濾網纖維放大（x 70；纖維迷宮、灰塵被攔住）
//   P 人與無塵衣（x 100；中性假人，不畫臉）｜G 氣閘（x 130；走廊｜前室風淋｜無塵室，兩道門）｜H 溫濕度（x 160；儀表、感測頭、晶圓）
//   B 工程公司（x 190；三個無塵室模組＋文字名牌，不是商標）
//   示意：不標換氣次數、溫濕度數字、風速；潔淨度只說「最乾淨那一級」。
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
const HERE = path.dirname(new URL(import.meta.url).pathname);

const R2 = (x) => Math.round(x * 1000) / 1000;
const D2R = Math.PI / 180;
let seed = 20261219;
const rnd = () => { seed |= 0; seed = (seed + 0x6d2b79f5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
const palette = {
  floorC: "#C9D2DE", groundC: "#B9C3CF", panel: "#F3F5F8", panel2: "#E2E8F0", seam: "#8E9BB0", band: "#24324C", steel: "#7D8CA6", steel2: "#A9B5C7", dark: "#3E4A60",
  glassC: "#BFD3F2", lampY: "#F2B632", lampG: "#2FBF71", lampR: "#E5484D", screen: "#5B8DEF", rubber: "#2B2F36", warnY: "#F2B632",
  wallC: "#DCE3EC", wallD: "#B8C4D3", roofC: "#8F9BAD", concC: "#A7AFBA", ahuC: "#9FB2C8", towerC: "#7FA6B8", guardC: "#E8D7B5",
  ffuC: "#F7F9FC", hepaC: "#FFFFFF", pleatC: "#D5DCE6", tileC: "#D9DEE6", holeC: "#5A6478", toolC: "#E4E9F0", toolD: "#C3CCD8",
  airC: "#7FD3F5", airD: "#2F9FD8", dustC: "#4A3B2C", dustL: "#8A6A48", cleanC: "#BFEFFF",
  woodC: "#C79A62", woodD: "#9E7444", fiberC: "#F1EEE6", fiberD: "#D8D2C4",
  skinC: "#E8C3A0", hairC: "#4A3426", shirtC: "#4F7FBF", pantsC: "#3A4254", shoeC: "#2B2F36", suitC: "#FAFBFD", suitS: "#D7DEE8", gloveC: "#6C7FD8", visorC: "#2E3A4E",
  corrC: "#E8DFCF", anteC: "#E6EEF6", matC: "#7C93A8", nozC: "#A9B5C7",
  waterC: "#2F7FE0", gasC: "#8E99A8", powerC: "#F2B632", sparkC: "#CFE8FF", markC: "#E8613C", yellowBr: "#F2B632", whiteP: "#FFFFFF", edgeC: "#F4FAFF",
};
const M = (kind, color, o = {}) => ({ kind, color, ...o });
const glowM = (c, op, ei = 1) => M("std", c, { emissive: c, ei, opacity: op, rough: 1, metal: 0 });
const materials = {
  floor: M("std", "floorC", { rough: 0.7, metal: 0.3, tex: "brushed", texScale: 3 }), ground: M("std", "groundC", { rough: 0.9, metal: 0.05 }),
  panel: M("std", "panel", { rough: 0.55, metal: 0.05, env: 0.25 }), panel2: M("std", "panel2", { rough: 0.6, metal: 0.05, env: 0.2 }),
  seam: M("std", "seam", { rough: 0.6, metal: 0.3 }), band: M("std", "band", { rough: 0.4, metal: 0.3, env: 0.4 }),
  steel: M("std", "steel", { rough: 0.35, metal: 0.85, env: 0.5 }), steel2: M("std", "steel2", { rough: 0.3, metal: 0.8, env: 0.6, tex: "brushed", texScale: 2 }),
  dark: M("std", "dark", { rough: 0.5, metal: 0.4, env: 0.3 }), rubber: M("std", "rubber", { rough: 0.9, metal: 0 }),
  window: M("phys", "glassC", { rough: 0.05, metal: 0, clearcoat: 1, opacity: 0.3, env: 0.6 }), glassD: M("std", "#3E5A80", { rough: 0.15, metal: 0.4, env: 0.9 }),
  lampY: M("std", "lampY", { emissive: "lampY", ei: 0.5, rough: 0.4, metal: 0 }), lampG: M("std", "lampG", { emissive: "lampG", ei: 0.6, rough: 0.4, metal: 0 }),
  lampR: M("std", "lampR", { emissive: "lampR", ei: 0.5, rough: 0.4, metal: 0 }), screen: M("std", "screen", { emissive: "screen", ei: 0.5, rough: 0.3, metal: 0 }),
  warnY: M("std", "warnY", { rough: 0.5, metal: 0, emissive: "warnY", ei: 0.2 }),
  wall: M("std", "wallC", { rough: 0.7, metal: 0.05, env: 0.2 }), wallD: M("std", "wallD", { rough: 0.7, metal: 0.1 }), roof: M("std", "roofC", { rough: 0.8, metal: 0.1 }),
  conc: M("std", "concC", { rough: 0.95, metal: 0 }), ahu: M("std", "ahuC", { rough: 0.45, metal: 0.4, env: 0.4 }), tower: M("std", "towerC", { rough: 0.6, metal: 0.2 }), guard: M("std", "guardC", { rough: 0.8, metal: 0 }),
  ffu: M("std", "ffuC", { rough: 0.4, metal: 0.2, env: 0.4 }), hepa: M("std", "hepaC", { rough: 0.95, metal: 0, emissive: "hepaC", ei: 0.12 }), pleat: M("std", "pleatC", { rough: 0.95, metal: 0 }),
  tile: M("std", "tileC", { rough: 0.6, metal: 0.3, env: 0.3 }), hole: M("std", "holeC", { rough: 1, metal: 0 }), tool: M("std", "toolC", { rough: 0.45, metal: 0.1, env: 0.35 }), toolD: M("std", "toolD", { rough: 0.5, metal: 0.2 }),
  airDot: glowM("airC", 0.85, 0.6), dustDot: glowM("dustC", 0.95, 0.05), dust: M("std", "dustC", { rough: 0.9, metal: 0 }), dustL: M("std", "dustL", { rough: 0.9, metal: 0 }),
  dustGlow: glowM("lampY", 1, 0.9), ringG: glowM("lampY", 0.95, 0.6),
  wood: M("std", "woodC", { rough: 0.75, metal: 0, tex: "brushed", texScale: 1.5 }), woodD: M("std", "woodD", { rough: 0.8, metal: 0 }),
  edge: glowM("edgeC", 0.95, 0.5), airBox: M("phys", "airC", { rough: 0.1, metal: 0, clearcoat: 0.5, opacity: 0.1, env: 0.3 }),
  fiber: M("std", "fiberC", { rough: 0.35, metal: 0.05, env: 0.6 }), fiberD: M("std", "fiberD", { rough: 0.5, metal: 0.05, env: 0.4 }),
  skin: M("std", "skinC", { rough: 0.7, metal: 0 }), hair: M("std", "hairC", { rough: 0.9, metal: 0 }), shirt: M("std", "shirtC", { rough: 0.85, metal: 0 }), pants: M("std", "pantsC", { rough: 0.85, metal: 0 }),
  shoe: M("std", "shoeC", { rough: 0.6, metal: 0.1 }), suit: M("std", "suitC", { rough: 0.8, metal: 0, env: 0.3, emissive: "suitC", ei: 0.05 }), suitS: M("std", "suitS", { rough: 0.8, metal: 0 }),
  glove: M("std", "gloveC", { rough: 0.5, metal: 0 }), visor: M("phys", "visorC", { rough: 0.1, metal: 0.2, clearcoat: 1, env: 0.8 }), leak: M("std", "markC", { rough: 0.5, metal: 0, emissive: "markC", ei: 0.25 }),
  corr: M("std", "corrC", { rough: 0.8, metal: 0 }), ante: M("std", "anteC", { rough: 0.7, metal: 0.05 }), mat: M("std", "matC", { rough: 0.95, metal: 0 }), noz: M("std", "nozC", { rough: 0.3, metal: 0.8, env: 0.6 }),
  water: M("std", "waterC", { rough: 0.35, metal: 0.5, env: 0.5 }), gas: M("std", "gasC", { rough: 0.3, metal: 0.85, env: 0.6 }), power: M("std", "powerC", { rough: 0.5, metal: 0.2, emissive: "powerC", ei: 0.15 }),
  spark: glowM("sparkC", 1, 1.2), mark: M("std", "markC", { rough: 0.5, metal: 0, emissive: "markC", ei: 0.25 }), bracket: M("std", "yellowBr", { rough: 0.5, metal: 0, emissive: "yellowBr", ei: 0.35 }),
  white: M("std", "whiteP", { rough: 0.7, metal: 0 }), lightPanel: M("std", "whiteP", { rough: 0.3, metal: 0, emissive: "whiteP", ei: 0.55 }),
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
const PIPE = (id, layer, pts, r, mat, o = {}) => {
  for (let i = 0; i < pts.length - 1; i++) {
    const [x0, y0, z0] = pts[i], [x1, y1, z1] = pts[i + 1];
    const dx = x1 - x0, dy = y1 - y0, dz = z1 - z0, L = Math.hypot(dx, dy, dz);
    const rot = Math.abs(dx) > 1e-6 ? HX : Math.abs(dy) > 1e-6 ? V : [0, 0, 0];
    P({ id: `${id}${i}`, layer, shape: "cyl", size: [r, R2(L)], rot, pos: [R2((x0 + x1) / 2), R2((y0 + y1) / 2), R2((z0 + z1) / 2)], mat, ...o });
    if (i > 0) SPH(`${id}J${i}`, layer, r * 1.15, x0, y0, z0, mat);
  }
};
const GXZ = (nx, nz, sx, sz, x0, z0, y = 0) => { const o = []; for (let j = 0; j < nz; j++) for (let i = 0; i < nx; i++) o.push([R2(x0 + i * sx), y, R2(z0 + j * sz)]); return o; };
const idsOf = (layer) => parts.filter((q) => q.layer === layer).map((q) => q.id);
// 正面看得到的方形格線（邊框四條）
const FRAME = (id, layer, x0, x1, y0, y1, z, t, mat) => { BOX(`${id}T`, layer, x0, x1, R2(y1 - t), y1, z, R2(z + t), mat); BOX(`${id}B`, layer, x0, x1, y0, R2(y0 + t), z, R2(z + t), mat); BOX(`${id}L`, layer, x0, R2(x0 + t), y0, y1, z, R2(z + t), mat); BOX(`${id}R`, layer, R2(x1 - t), x1, y0, y1, z, R2(z + t), mat); };

// ═════ 地板（背景層）═════
LAY("floor", [260, 2, 100, 0], true);
P({ id: "floor", layer: "floor", shape: "slab", size: [280, 0.5, 60], r: 0.2, pos: [100, -0.25, 0], mat: "floor" });
P({ id: "floorSeam", layer: "floor", shape: "slab", size: [280, 0.04, 0.1], pos: [100, 0.01, 0], at: Array.from({ length: 9 }, (_, i) => [0, 0, -24 + i * 6]), mat: "seam" });

// ═════ 站 R：廠房（x 0）═════
// 高度（y）：回風層 0–2.2｜高架地板 1.5–2.4（孔板頂 2.4）｜無塵室 2.4–8.2｜天花板格柵 8.2–8.4＋風扇濾網 8.4–9.2｜空氣室 8.4–10.2｜屋頂 10.2–10.6｜屋頂機組 10.6–12.6
const BX0 = -11.2, BX1 = 11.2, BZ0 = -6.2, BZ1 = 6.2, YF = 2.4, YC = 8.2, YR = 10.2;
// 外殼（背牆、側牆、屋頂）：前牆分左右兩半（s2 向兩側滑開）
LAY("shell", [23, 13, 0, 6.3]);
BOX("shBack", "shell", BX0, BX1, 0, YR, BZ0 - 0.3, BZ0, "wall");
BOX("shSideL", "shell", BX0 - 0.3, BX0, 0, YR, BZ0 - 0.3, BZ1, "wall"); BOX("shSideR", "shell", BX1, BX1 + 0.3, 0, YR, BZ0 - 0.3, BZ1, "wall");
BOX("shRoof", "shell", BX0 - 0.4, BX1 + 0.4, YR, YR + 0.4, BZ0 - 0.5, BZ1 + 0.3, "roof"); BOX("shParapet", "shell", BX0 - 0.4, BX1 + 0.4, YR + 0.4, YR + 0.8, BZ1 + 0.1, BZ1 + 0.3, "wallD");
P({ id: "shSideSeam", layer: "shell", shape: "box", size: [0.06, YR, 0.06], pos: [0, YR / 2, 0], at: [[BX0 - 0.32, 0, -3.1], [BX0 - 0.32, 0, 0], [BX0 - 0.32, 0, 3.1], [BX1 + 0.32, 0, -3.1], [BX1 + 0.32, 0, 0], [BX1 + 0.32, 0, 3.1]], mat: "seam" });
// 中間樓板（回風層與無塵室之間的格子樓板，梁柱看得見）、空氣室樓板（屋頂下）
LAY("slab", [22.4, 0.3, 0, 1.45]);
BOX("slabWaffle", "slab", BX0, BX1, 1.35, 1.55, BZ0, BZ1, "conc");
P({ id: "slabHole", layer: "slab", shape: "box", size: [0.9, 0.22, 0.9], pos: [0, 1.45, 0], at: GXZ(14, 7, 1.5, 1.6, -9.75, -4.8), mat: "hole" });
P({ id: "slabCol", layer: "subfab", shape: "box", size: [0.5, 0.75, 0.5], pos: [0, 0.375, 0], at: [[-7, 0, 4.6], [0, 0, 4.6], [7, 0, 4.6], [-7, 0, -3], [0, 0, -3], [7, 0, -3]], mat: "conc" });
// 回風豎井（兩側）：從回風層往上到空氣室；靠室內那面是有孔的回風牆，裡面是乾盤管與回風風機（示意）
for (const [s, x0, x1] of [["L", BX0, -9.6], ["R", 9.6, BX1]]) {
  BOX(`chase${s}Wall`, "shell", s === "L" ? x1 - 0.2 : x0, s === "L" ? x1 : x0 + 0.2, YF, YC, BZ0, BZ1, "wallD");
  P({ id: `chase${s}Grille`, layer: "shell", shape: "box", size: [0.06, 0.12, 1.0], pos: [s === "L" ? x1 + 0.02 : x0 - 0.02, 0, 0], at: Array.from({ length: 18 }, (_, i) => [0, R2(YF + 0.5 + (i % 6) * 0.9), R2(-4 + Math.floor(i / 6) * 4)]), mat: "dark" });
  BOX(`chase${s}Coil`, "shell", x0 + 0.2, x1 - 0.2, 5.0, 6.2, BZ1 - 3.8, BZ1 - 0.6, "steel2");
  P({ id: `chase${s}Fin`, layer: "shell", shape: "box", size: [R2(x1 - x0 - 0.5), 0.03, 3.2], pos: [R2((x0 + x1) / 2), 0, BZ1 - 2.2], at: Array.from({ length: 10 }, (_, i) => [0, R2(5.05 + i * 0.12), 0]), mat: "dark" });
  ZC(`chase${s}Fan`, "shell", 0.55, BZ1 - 1.2, BZ1 - 0.6, R2((x0 + x1) / 2), 7.2, "dark"); VT(`chase${s}FanRing`, "shell", 0.62, 0.55, 7.2 - 0.05, 7.2 + 0.05, "steel2", { x: R2((x0 + x1) / 2), z: BZ1 - 0.58, rot: [0, 0, 0] });
}
// 前牆（左右兩半，有板縫、窗帶、廠牌位置空著）
LAY("frontL", [11.4, 10.6, -5.6, 5.3]); LAY("frontR", [11.4, 10.6, 5.6, 5.3]);
for (const [s, x0, x1] of [["L", BX0 - 0.3, 0], ["R", 0, BX1 + 0.3]]) {
  const ly = `front${s}`;
  BOX(`fr${s}Wall`, ly, x0, x1, 0, YR, BZ1, BZ1 + 0.3, "wall");
  P({ id: `fr${s}Seam`, layer: ly, shape: "box", size: [0.06, YR, 0.05], pos: [0, YR / 2, BZ1 + 0.32], at: [1, 2, 3, 4].map((i) => [R2(x0 + ((x1 - x0) * i) / 5), 0, 0]), mat: "seam" });
  BOX(`fr${s}Band`, ly, x0, x1, 8.5, 9.4, BZ1 + 0.3, BZ1 + 0.36, "band");
  BOX(`fr${s}Win`, ly, x0 + 0.5, x1 - 0.5, 3.4, 4.6, BZ1 + 0.3, BZ1 + 0.36, "glassD");
  P({ id: `fr${s}Mull`, layer: ly, shape: "box", size: [0.08, 1.2, 0.06], pos: [0, 4.0, BZ1 + 0.38], at: [1, 2, 3, 4, 5].map((i) => [R2(x0 + 0.5 + ((x1 - x0 - 1) * i) / 6), 0, 0]), mat: "dark" });
  BOX(`fr${s}Kick`, ly, x0, x1, 0, 0.5, BZ1 + 0.3, BZ1 + 0.4, "wallD");
  BOX(`fr${s}Louver`, ly, s === "L" ? x0 + 1 : x1 - 3.4, s === "L" ? x0 + 3.4 : x1 - 1, 0.9, 2.3, BZ1 + 0.3, BZ1 + 0.36, "dark");
  P({ id: `fr${s}LouverS`, layer: ly, shape: "box", size: [2.3, 0.05, 0.06], pos: [s === "L" ? x0 + 2.2 : x1 - 2.2, 0, BZ1 + 0.4], at: Array.from({ length: 6 }, (_, i) => [0, R2(1.0 + i * 0.22), 0]), mat: "steel2" });
}
BOX("frDoor", "frontR", 6.0, 8.0, 0, 2.6, BZ1 + 0.3, BZ1 + 0.42, "steel2"); BOX("frDoorCanopy", "frontR", 5.6, 8.4, 2.6, 2.8, BZ1 + 0.3, BZ1 + 1.4, "band");
// 屋頂機組：外氣空調箱（MAU）兩台、排氣風機三台、風管伸進空氣室
LAY("roofTop", [23, 2.6, 0, 11.6]);
for (const [i, x] of [[0, -6.4], [1, 1.0]]) {
  BOX(`mau${i}`, "roofTop", x - 2.8, x + 2.8, YR + 0.4, YR + 2.1, -3.6, -0.6, "ahu");
  P({ id: `mau${i}Louver`, layer: "roofTop", shape: "box", size: [0.06, 1.2, 2.6], pos: [x - 2.84, YR + 1.25, -2.1], mat: "dark" });
  P({ id: `mau${i}Door`, layer: "roofTop", shape: "box", size: [1.0, 1.3, 0.05], pos: [x, YR + 1.25, -0.57], at: [[-1.6, 0, 0], [0, 0, 0], [1.6, 0, 0]], mat: "panel2" });
  P({ id: `mau${i}Handle`, layer: "roofTop", shape: "box", size: [0.08, 0.3, 0.08], pos: [x + 0.35, YR + 1.25, -0.52], at: [[-1.6, 0, 0], [0, 0, 0], [1.6, 0, 0]], mat: "steel" });
  BOX(`mau${i}Duct`, "roofTop", x + 2.8, x + 3.8, YR + 0.4, YR + 1.4, -2.6, -1.6, "steel2");
}
for (const [i, x] of [[0, -2.0], [1, 6.6], [2, 9.0]]) { VC(`exf${i}`, "roofTop", 0.7, YR + 0.4, YR + 1.5, "steel2", { x, z: 2.0 }); VT(`exf${i}Hood`, "roofTop", 0.95, 0.7, YR + 1.5, YR + 1.8, "dark", { x, z: 2.0 }); VC(`exf${i}Cap`, "roofTop", 0.5, YR + 1.8, YR + 2.0, "steel", { x, z: 2.0 }); }
P({ id: "roofRail", layer: "roofTop", shape: "box", size: [22.6, 0.06, 0.06], pos: [0, YR + 1.3, BZ1 + 0.2], mat: "warnY" });
P({ id: "roofRailPost", layer: "roofTop", shape: "box", size: [0.06, 0.5, 0.06], pos: [0, YR + 1.05, BZ1 + 0.2], at: Array.from({ length: 9 }, (_, i) => [R2(-11 + i * 2.75), 0, 0]), mat: "warnY" });
// 冷卻水塔（右側地面）、管排（左側）、警衛室與柵欄（左前）、旗桿與國旗（入口前）
LAY("yard", [40, 13, 0, 4]);
BOX("ctBase", "yard", 13.2, 17.8, 0, 0.5, -4.5, 0.5, "conc"); BOX("ctBody", "yard", 13.6, 17.4, 0.5, 4.6, -4.1, 0.1, "tower");
P({ id: "ctLouver", layer: "yard", shape: "box", size: [3.8, 0.08, 0.06], pos: [15.5, 0, 0.14], at: Array.from({ length: 9 }, (_, i) => [0, R2(0.8 + i * 0.32), 0]), mat: "dark" });
VT("ctFan", "yard", 1.5, 1.3, 4.6, 5.4, "steel2", { x: 15.5, z: -2.0 }); VC("ctFanHub", "yard", 0.3, 4.6, 5.3, "dark", { x: 15.5, z: -2.0 });
PIPE("ctPipe", "yard", [[13.6, 1.2, -1.0], [11.6, 1.2, -1.0]], 0.22, "water");
for (const [k, y] of [[0, 4.4], [1, 5.0]]) PIPE(`rack${k}`, "yard", [[-16.5, y, 3.0], [-11.6, y, 3.0]], 0.18, k ? "gas" : "water");
P({ id: "rackPost", layer: "yard", shape: "box", size: [0.2, 5.4, 0.2], pos: [0, 2.7, 3.0], at: [[-16.0, 0, 0], [-13.4, 0, 0]], mat: "steel" }); BOX("rackBeam", "yard", -16.4, -12.0, 4.0, 4.15, 2.6, 3.4, "steel");
BOX("guardBody", "yard", -18.4, -15.4, 0, 2.4, 6.6, 9.0, "guard"); BOX("guardRoof", "yard", -18.7, -15.1, 2.4, 2.65, 6.3, 9.3, "band"); BOX("guardWin", "yard", -18.0, -15.8, 1.1, 2.0, 9.0, 9.05, "window");
BOX("gateArm", "yard", -15.2, -10.4, 1.15, 1.3, 9.2, 9.35, "lampR"); P({ id: "gateArmStripe", layer: "yard", shape: "box", size: [0.4, 0.16, 0.17], pos: [0, 1.225, 9.27], at: [[-14.2, 0, 0], [-12.8, 0, 0], [-11.4, 0, 0]], mat: "white" });
VC("flagPole", "yard", 0.09, 0, 9.8, "steel2", { x: 10.4, z: 9.4 }); SPH("flagBall", "yard", 0.18, 10.4, 9.9, 9.4, "steel");
VC("flagBase", "yard", 0.45, 0, 0.3, "conc", { x: 10.4, z: 9.4 });
// 國旗貼圖（Brand.tsx FLAGS 程式繪製 → PNG），旗桿上方，不擋廠房
{ const r = spawnSync("node", [path.join(HERE, "..", "..", "scripts", "three", "make-brand-tex.mjs"), "tech-cleanroom", "flag:TW", "text:uis=漢唐|2404", "text:lk=亞翔|6139", "text:yk=洋基工程|6691"], { encoding: "utf8" }); if (r.status !== 0) { console.error(r.stderr); process.exit(1); } }
materials.t_tw = { kind: "unlit", color: "#FFFFFF", img: "tex/brand/flag-TW.png" };
P({ id: "flagTW", layer: "yard", shape: "plane", size: [2.4, 1.6], pos: [11.66, 8.95, 9.4], uv01: true, shadow: false, mat: "t_tw" });

// 無塵室內：機台一排（只露外形）、地面黃線、微粒計數器
LAY("tools", [18, 5, 0, 5]);
for (const [i, x] of [[0, -6.0], [1, -0.6], [2, 4.8]]) {
  BOX(`tool${i}Body`, "tools", x - 2.0, x + 2.0, YF, YF + 3.6, -4.6, -1.4, "tool");
  BOX(`tool${i}Efem`, "tools", x - 2.0, x + 2.0, YF, YF + 2.4, -1.4, -0.4, "toolD");
  P({ id: `tool${i}Port`, layer: "tools", shape: "box", size: [0.9, 0.9, 0.06], pos: [x, YF + 1.5, -0.36], at: [[-1.1, 0, 0], [0, 0, 0], [1.1, 0, 0]], mat: "dark" });
  P({ id: `tool${i}Seam`, layer: "tools", shape: "box", size: [0.04, 3.4, 0.04], pos: [x, YF + 1.8, -1.38], at: [[-1.0, 0, 0], [0, 0, 0], [1.0, 0, 0]], mat: "seam" });
  BOX(`tool${i}Screen`, "tools", x + 0.9, x + 1.7, YF + 2.6, YF + 3.2, -1.42, -1.38, "screen");
  BOX(`tool${i}Exh`, "tools", x - 0.5, x + 0.5, YF + 3.6, YF + 4.2, -3.6, -2.6, "steel2");
  VC(`tool${i}Tower`, "tools", 0.09, YF + 3.6, YF + 4.4, "steel", { x: x + 1.7, z: -1.7 });
  SPH(`tool${i}TowerG`, "tools", 0.12, x + 1.7, YF + 4.2, -1.7, "lampG"); SPH(`tool${i}TowerY`, "tools", 0.12, x + 1.7, YF + 4.45, -1.7, "lampY");
}
P({ id: "laneLine", layer: "tools", shape: "box", size: [18, 0.02, 0.12], pos: [0, YF + 0.01, 0], at: [[0, 0, 0.1], [0, 0, 3.8]], mat: "warnY" });
// 微粒計數器（推車上的小方盒＋吸氣管＋螢幕）
BOX("pcCart", "tools", 7.6, 8.8, YF, YF + 0.9, 1.4, 2.4, "steel2"); BOX("pcBox", "tools", 7.7, 8.7, YF + 0.9, YF + 1.5, 1.5, 2.3, "white");
BOX("pcScreen", "tools", 7.85, 8.55, YF + 1.05, YF + 1.4, 2.3, 2.33, "screen"); PIPE("pcTube", "tools", [[8.2, YF + 1.5, 1.9], [8.2, YF + 2.4, 1.9], [8.2, YF + 2.4, 2.6]], 0.06, "steel"); SPH("pcLed", "tools", 0.06, 8.6, YF + 1.42, 2.34, "lampG");
// 高架地板（孔板＋支柱＋橫樑）：s4 向下分開半個身位
LAY("rFloor", [22, 1.2, 0, 2.0]);
BOX("tileTop", "rFloor", BX0 + 1.6, BX1 - 1.6, YF - 0.12, YF, BZ0, BZ1, "tile");
P({ id: "tileHole", layer: "rFloor", shape: "box", size: [0.14, 0.02, 0.14], pos: [0, YF + 0.002, 0], at: GXZ(44, 4, 0.42, 0.42, -9.03, 4.6), mat: "hole" });
P({ id: "tileHole2", layer: "rFloor", shape: "box", size: [0.14, 0.02, 0.14], pos: [0, YF + 0.002, 0], at: GXZ(44, 3, 0.42, 0.42, -9.03, 1.0), mat: "hole" });
P({ id: "tileSeam", layer: "rFloor", shape: "box", size: [0.04, 0.03, 12.4], pos: [0, YF + 0.004, 0], at: Array.from({ length: 13 }, (_, i) => [R2(-9.6 + i * 1.6), 0, 0]), mat: "seam" });
P({ id: "tileEdge", layer: "rFloor", shape: "box", size: [19.2, 0.12, 0.05], pos: [0, YF - 0.06, BZ1 + 0.03], mat: "seam" });
P({ id: "pedestal", layer: "rFloor", shape: "cyl", size: [0.07, 0.75], rot: V, pos: [0, 1.93, BZ1 - 0.2], at: Array.from({ length: 13 }, (_, i) => [R2(-9.6 + i * 1.6), 0, 0]), mat: "steel" });
P({ id: "pedestalHead", layer: "rFloor", shape: "box", size: [0.3, 0.06, 0.3], pos: [0, YF - 0.15, BZ1 - 0.2], at: Array.from({ length: 13 }, (_, i) => [R2(-9.6 + i * 1.6), 0, 0]), mat: "dark" });
P({ id: "stringer", layer: "rFloor", shape: "box", size: [19.2, 0.06, 0.06], pos: [0, YF - 0.2, BZ1 - 0.2], mat: "steel2" });
// 回風層（地板下）：回風往兩側流，豎井底部有導流片
LAY("subfab", [22, 1.6, 0, 0.8]);
P({ id: "sfVane", layer: "subfab", shape: "box", size: [0.06, 1.0, 2.0], pos: [0, 0.6, BZ1 - 1.4], at: [[-10.4, 0, 0], [-10.0, 0, 0], [10.0, 0, 0], [10.4, 0, 0]], rot: [0, 0, 20], mat: "steel2" });
BOX("sfPad0", "subfab", -8.4, -6.0, 0, 0.3, -5.6, -3.4, "conc"); BOX("sfPad1", "subfab", 2.4, 4.8, 0, 0.3, -5.6, -3.4, "conc");
BOX("sfPump0", "subfab", -8.0, -6.4, 0.3, 0.72, -5.2, -3.8, "band"); BOX("sfPump1", "subfab", 2.8, 4.4, 0.3, 0.72, -5.2, -3.8, "band");
for (const [s, x] of [["L", -8.6], ["R", 8.6]]) {
  BOX(`sfDuct${s}`, "subfab", x - 0.8, x + 0.8, 0.05, 0.72, -5.4, 5.6, "steel2");
  P({ id: `sfDuctFl${s}`, layer: "subfab", shape: "box", size: [1.75, 0.78, 0.08], pos: [x, 0.385, 0], at: [-4, -1.5, 1, 3.5].map((z) => [0, 0, z]), mat: "steel" });
  BOX(`sfDuctGr${s}`, "subfab", x - 0.6, x + 0.6, 0.72, 0.74, 3.8, 5.4, "dark");
  BOX(`sfDuctDoor${s}`, "subfab", x - 0.5, x + 0.1, 0.15, 0.6, 5.6, 5.64, "panel2");
  ZC(`sfFan${s}`, "subfab", 0.32, 5.64, 5.9, x + 0.45, 0.4, "dark");
}
// 天花板格柵（T 型鋼）＋燈條
LAY("ceil", [20, 0.4, 0, 8.3]);
P({ id: "tbarX", layer: "ceil", shape: "box", size: [19.4, 0.12, 0.08], pos: [0, YC + 0.06, 0], at: Array.from({ length: 8 }, (_, i) => [0, 0, R2(-5.6 + i * 1.6)]), mat: "steel2" });
P({ id: "tbarZ", layer: "ceil", shape: "box", size: [0.08, 0.12, 11.2], pos: [0, YC + 0.06, 0], at: Array.from({ length: 13 }, (_, i) => [R2(-9.6 + i * 1.6), 0, 0]), mat: "steel2" });
P({ id: "ceilLight", layer: "ceil", shape: "box", size: [0.06, 0.04, 11.0], pos: [0, YC - 0.01, 0], at: Array.from({ length: 13 }, (_, i) => [R2(-9.6 + i * 1.6), 0, 0]), mat: "lightPanel" });
// 風扇濾網陣列（FFU）：12×7 台。每台：外框、濾網面（白、褶線）、風扇箱、馬達、指示燈；前排 12 台有可轉的扇葉（各自轉軸）
const FX = Array.from({ length: 12 }, (_, i) => R2(-8.8 + i * 1.6)), FZ = Array.from({ length: 7 }, (_, j) => R2(-4.8 + j * 1.6));
const ARR = [], FRONT = [];
FZ.forEach((z, j) => FX.forEach((x, i) => { if (j === 6 && i === 5) return; (j === 6 ? FRONT : ARR).push([x, z]); }));
const ONE = [FX[5], FZ[6]];
const ffuBuild = (ly, pts, pre) => {
  const at = pts.map(([x, z]) => [x, 0, z]);
  P({ id: `${pre}Frame`, layer: ly, shape: "box", size: [1.5, 0.14, 1.5], pos: [0, YC + 0.25, 0], at, mat: "ffu" });
  P({ id: `${pre}Face`, layer: ly, shape: "box", size: [1.3, 0.03, 1.3], pos: [0, YC + 0.17, 0], at, mat: "hepa" });
  P({ id: `${pre}Box`, layer: ly, shape: "box", size: [1.3, 0.5, 1.3], pos: [0, YC + 0.57, 0], at, mat: "ffu" });
  P({ id: `${pre}Motor`, layer: ly, shape: "cyl", size: [0.3, 0.22], rot: V, pos: [0, YC + 0.93, 0], at, mat: "dark" });
  P({ id: `${pre}Led`, layer: ly, shape: "sphere", size: [0.05], pos: [0.55, YC + 0.15, 0.55], at, mat: "lampG" });
  P({ id: `${pre}Cable`, layer: ly, shape: "box", size: [0.04, 0.04, 0.8], pos: [0.3, YC + 1.06, 0.2], at, mat: "rubber" });
};
LAY("ffuArr", [20, 1.2, 0, 8.8]); ffuBuild("ffuArr", ARR, "fa");
LAY("ffuFront", [20, 1.2, 0, 8.8]); ffuBuild("ffuFront", FRONT, "ff");
// 前排扇葉（在風扇箱上方，網罩下；每片各自的轉軸）
const BLADE = [[0, 0.06], [0.46, 0.12], [0.5, -0.02], [0, -0.06], [-0.46, -0.12], [-0.5, 0.02]].map(([u, v]) => [R2(u), R2(v)]);
const bladeIds = [], bladePiv = {};
FRONT.forEach(([x, z], i) => { const id = `ffBlade${i}`; P({ id, layer: "ffuFront", shape: "poly", size: [1, 1, 0.04], pts: BLADE, pos: [x, YC + 0.86, z], rot: [-90, 0, 0], mat: "steel2" }); bladeIds.push(id); bladePiv[id] = [x, YC + 0.86, z];
  const id2 = `ffBladeX${i}`; P({ id: id2, layer: "ffuFront", shape: "poly", size: [1, 1, 0.04], pts: BLADE, pos: [x, YC + 0.86, z], rot: [-90, 90, 0], mat: "steel2" }); bladeIds.push(id2); bladePiv[id2] = [x, YC + 0.86, z]; });
P({ id: "ffGuard", layer: "ffuFront", shape: "tube", size: [0.56, 0.5, 0.04], rot: V, pos: [0, YC + 0.9, 0], at: FRONT.map(([x, z]) => [x, 0, z]), mat: "dark" });
// 拉出來的那一台（s4 爆炸：風扇箱往上、濾網往下、外框留在原位）
LAY("oneFrame", [1.8, 0.4, ONE[0], 8.4]); LAY("oneFan", [1.8, 1.0, ONE[0], 9.0]); LAY("oneHepa", [1.8, 0.6, ONE[0], 8.3]);
BOX("oneFrameT", "oneFrame", ONE[0] - 0.75, ONE[0] + 0.75, YC + 0.32, YC + 0.38, ONE[1] - 0.75, ONE[1] + 0.75, "ffu");
FRAME("oneFrameF", "oneFrame", ONE[0] - 0.75, ONE[0] + 0.75, YC + 0.18, YC + 0.38, ONE[1] + 0.75, 0.05, "steel2");
BOX("oneGasket", "oneFrame", ONE[0] - 0.7, ONE[0] + 0.7, YC + 0.17, YC + 0.2, ONE[1] - 0.7, ONE[1] + 0.7, "rubber");
BOX("oneBox", "oneFan", ONE[0] - 0.65, ONE[0] + 0.65, YC + 0.4, YC + 0.8, ONE[1] - 0.65, ONE[1] + 0.65, "ffu");
FRAME("oneBoxEdge", "oneFan", ONE[0] - 0.65, ONE[0] + 0.65, YC + 0.4, YC + 0.8, ONE[1] + 0.65, 0.04, "seam");
VC("oneMotor", "oneFan", 0.3, YC + 0.8, YC + 1.05, "dark", { x: ONE[0], z: ONE[1] }); VT("oneMotorFin", "oneFan", 0.33, 0.29, YC + 0.83, YC + 1.02, "steel2", { x: ONE[0], z: ONE[1] });
VT("oneGuard", "oneFan", 0.56, 0.5, YC + 0.86, YC + 0.9, "dark", { x: ONE[0], z: ONE[1] });
P({ id: "oneBlade", layer: "oneFan", shape: "poly", size: [1, 1, 0.04], pts: BLADE, pos: [ONE[0], YC + 0.84, ONE[1]], rot: [-90, 0, 0], mat: "steel2" });
P({ id: "oneBladeX", layer: "oneFan", shape: "poly", size: [1, 1, 0.04], pts: BLADE, pos: [ONE[0], YC + 0.84, ONE[1]], rot: [-90, 90, 0], mat: "steel2" });
SPH("oneLed", "oneFan", 0.06, ONE[0] + 0.5, YC + 0.6, ONE[1] + 0.67, "lampG"); BOX("onePlate", "oneFan", ONE[0] - 0.4, ONE[0] + 0.1, YC + 0.5, YC + 0.68, ONE[1] + 0.65, ONE[1] + 0.68, "warnY");
P({ id: "oneCable", layer: "oneFan", shape: "box", size: [0.05, 0.05, 1.0], pos: [ONE[0] + 0.3, YC + 1.0, ONE[1] - 0.2], mat: "rubber" });
// 濾網包：正面看得到 V 形褶疊（白色纖維膜）＋分隔帶＋鋁框＋密封膠條
BOX("hepaFrameL", "oneHepa", ONE[0] - 0.7, ONE[0] - 0.62, YC + 0.02, YC + 0.32, ONE[1] - 0.68, ONE[1] + 0.68, "steel2"); BOX("hepaFrameR", "oneHepa", ONE[0] + 0.62, ONE[0] + 0.7, YC + 0.02, YC + 0.32, ONE[1] - 0.68, ONE[1] + 0.68, "steel2"); BOX("hepaFrameB", "oneHepa", ONE[0] - 0.68, ONE[0] + 0.68, YC + 0.02, YC + 0.32, ONE[1] - 0.7, ONE[1] - 0.64, "steel2"); BOX("hepaGrid", "oneHepa", ONE[0] - 0.62, ONE[0] + 0.62, YC + 0.02, YC + 0.04, ONE[1] - 0.64, ONE[1] + 0.68, "steel");
{ const n = 9, w = 1.24, pts = [[-w / 2, -0.12]]; for (let i = 0; i < n; i++) { const u = -w / 2 + (i * w) / n; pts.push([R2(u), 0.12], [R2(u + w / n / 2), -0.12]); } pts.push([w / 2, 0.12], [w / 2, -0.14], [-w / 2, -0.14]);
  P({ id: "hepaPleat", layer: "oneHepa", shape: "poly", size: [1, 1, 1.3], pts: pts.map(([u, v]) => [R2(u), R2(v)]), pos: [ONE[0], YC + 0.17, ONE[1] - 0.64], mat: "hepa" });
  P({ id: "hepaPleatEdge", layer: "oneHepa", shape: "poly", size: [1, 1, 0.02], pts: pts.slice(0, -3).map(([u, v]) => [R2(u), R2(v * 1.02)]).concat([[0.62, -0.13], [-0.62, -0.13]]), pos: [ONE[0], YC + 0.17, ONE[1] + 0.665], mat: "pleat" }); }
P({ id: "hepaSep", layer: "oneHepa", shape: "box", size: [1.26, 0.02, 0.03], pos: [ONE[0], YC + 0.17, 0], at: [[0, 0, ONE[1] - 0.3], [0, 0, ONE[1] + 0.1], [0, 0, ONE[1] + 0.5]], mat: "pleat" });
for (const [k, x0, x1, z0, z1] of [["F", -0.7, 0.7, 0.62, 0.7], ["B", -0.7, 0.7, -0.7, -0.62], ["L", -0.7, -0.62, -0.7, 0.7], ["R", 0.62, 0.7, -0.7, 0.7]]) BOX(`hepaSeal${k}`, "oneHepa", ONE[0] + x0, ONE[0] + x1, YC + 0.3, YC + 0.34, ONE[1] + z0, ONE[1] + z1, "rubber");
BOX("hepaTag", "oneHepa", ONE[0] + 0.2, ONE[0] + 0.6, YC + 0.08, YC + 0.24, ONE[1] + 0.69, ONE[1] + 0.71, "white");
// 地下的水氣電管路（s9 才出現）：水藍、氣灰、電黃
LAY("utilW", [22, 1, 0, 0.9]); LAY("utilG", [22, 1, 0, 0.7]); LAY("utilP", [22, 1, 0, 1.1]);
PIPE("uWater", "utilW", [[-10.6, 0.55, 5.2], [10.6, 0.55, 5.2]], 0.2, "water"); PIPE("uWater2", "utilW", [[-10.6, 0.55, 4.5], [10.6, 0.55, 4.5]], 0.16, "water");
P({ id: "uWaterFl", layer: "utilW", shape: "cyl", size: [0.28, 0.08], rot: HX, pos: [0, 0.55, 5.2], at: [-8, -4, 0, 4, 8].map((x) => [x, 0, 0]), mat: "steel" });
P({ id: "uWaterRise", layer: "utilW", shape: "cyl", size: [0.1, 1.5], rot: V, pos: [0, 1.4, 4.5], at: [-6.0, -0.6, 4.8].map((x) => [R2(x + 0.6), 0, 0]), mat: "water" });
PIPE("uGas", "utilG", [[-10.6, 1.0, 3.8], [10.6, 1.0, 3.8]], 0.08, "gas"); PIPE("uGas2", "utilG", [[-10.6, 1.0, 3.5], [10.6, 1.0, 3.5]], 0.08, "gas");
P({ id: "uGasValve", layer: "utilG", shape: "box", size: [0.36, 0.3, 0.6], pos: [0, 1.0, 3.65], at: [-6.0, -0.6, 4.8].map((x) => [x, 0, 0]), mat: "steel2" });
BOX("uTray", "utilP", -10.6, 10.6, 1.25, 1.33, 2.6, 3.2, "power"); P({ id: "uCable", layer: "utilP", shape: "cyl", size: [0.05, 21.2], rot: HX, pos: [0, 1.38, 0], at: [[0, 0, 2.7], [0, 0, 2.85], [0, 0, 3.0], [0, 0, 3.12]], mat: "rubber" });
P({ id: "uTrayHanger", layer: "utilP", shape: "box", size: [0.05, 0.12, 0.7], pos: [0, 1.3, 2.9], at: [-9, -6, -3, 0, 3, 6, 9].map((x) => [x, 0, 0]), mat: "steel" });

// ═════ 站 K：衣櫃大的空氣（x 40）：一立方公尺（示意放大），十顆灰塵（加放大圈）；旁邊微粒計數器 ═════
const KX = 40, KS = 4.2, KY0 = 1.0;
LAY("kPlinth", [12, 1, KX, 0.5]); BOX("kPl", "kPlinth", KX - 6, KX + 6, 0, 0.9, -3.8, 3.8, "band"); BOX("kPlTop", "kPlinth", KX - 6, KX + 6, 0.9, 1.0, -3.8, 3.8, "panel2");
LAY("closet", [5, 5, KX - 0.6, 3.3]);
const CX0 = KX - 0.6 - KS / 2, CX1 = KX - 0.6 + KS / 2, CY1 = KY0 + KS + 0.3, CZ0 = -KS / 2, CZ1 = KS / 2;
BOX("clBack", "closet", CX0, CX1, KY0, CY1, CZ0 - 0.12, CZ0, "wood"); BOX("clSideL", "closet", CX0 - 0.12, CX0, KY0, CY1, CZ0 - 0.12, CZ1, "wood"); BOX("clSideR", "closet", CX1, CX1 + 0.12, KY0, CY1, CZ0 - 0.12, CZ1, "wood");
BOX("clTop", "closet", CX0 - 0.2, CX1 + 0.2, CY1, CY1 + 0.14, CZ0 - 0.2, CZ1 + 0.1, "woodD"); BOX("clBase", "closet", CX0 - 0.12, CX1 + 0.12, KY0, KY0 + 0.3, CZ0 - 0.12, CZ1, "woodD");
HXC("clRod", "closet", 0.05, CX0, CX1, CY1 - 0.5, -0.4, "steel2");
P({ id: "clHanger", layer: "closet", shape: "poly", size: [1, 1, 0.03], pts: [[0, 0.22], [0.5, -0.18], [-0.5, -0.18]], pos: [0, CY1 - 0.7, -0.4], at: [[CX0 + 0.8, 0, 0], [CX0 + 1.5, 0, 0], [CX1 - 0.8, 0, 0]], mat: "steel" });
// 兩扇打開的門（向外打開約 110 度，鉸鏈與把手看得見）
P({ id: "clDoorL", layer: "closet", shape: "box", size: [0.1, KS, KS / 2], pos: [CX0 - 0.06, R2(KY0 + 0.3 + KS / 2), R2(CZ1 + KS / 4)], rot: [0, 20, 0], mat: "wood" });
P({ id: "clDoorR", layer: "closet", shape: "box", size: [0.1, KS, KS / 2], pos: [CX1 + 0.06, R2(KY0 + 0.3 + KS / 2), R2(CZ1 + KS / 4)], rot: [0, -20, 0], mat: "wood" });
P({ id: "clKnob", layer: "closet", shape: "sphere", size: [0.08], pos: [0, R2(KY0 + 0.3 + KS / 2), R2(CZ1 + KS / 2 - 0.2)], at: [[R2(CX0 + 0.15), 0, 0], [R2(CX1 - 0.15), 0, 0]], mat: "steel" });
P({ id: "clHinge", layer: "closet", shape: "box", size: [0.06, 0.3, 0.06], pos: [0, 0, R2(CZ1 + 0.02)], at: [[CX0 - 0.04, KY0 + 0.8, 0], [CX0 - 0.04, CY1 - 0.5, 0], [CX1 + 0.04, KY0 + 0.8, 0], [CX1 + 0.04, CY1 - 0.5, 0]], mat: "steel" });
// 衣櫃裡的空氣：淡藍半透明方塊＋發亮的邊線
LAY("kAir", [4.4, 4.4, KX - 0.6, 3.4]);
BOX("kAirBox", "kAir", CX0 + 0.05, CX1 - 0.05, KY0 + 0.32, CY1 - 0.05, CZ0 + 0.05, CZ1 - 0.05, "airBox");
for (const [i, [x, z]] of [[CX0 + 0.05, CZ1 - 0.05], [CX1 - 0.05, CZ1 - 0.05], [CX0 + 0.05, CZ0 + 0.05], [CX1 - 0.05, CZ0 + 0.05]].entries()) VC(`kEdgeV${i}`, "kAir", 0.025, KY0 + 0.32, CY1 - 0.05, "edge", { x: R2(x), z: R2(z) });
for (const [i, y] of [[0, KY0 + 0.32], [1, CY1 - 0.05]]) { HXC(`kEdgeXf${i}`, "kAir", 0.025, CX0 + 0.05, CX1 - 0.05, R2(y), R2(CZ1 - 0.05), "edge"); HXC(`kEdgeXb${i}`, "kAir", 0.025, CX0 + 0.05, CX1 - 0.05, R2(y), R2(CZ0 + 0.05), "edge");
  ZC(`kEdgeZl${i}`, "kAir", 0.025, CZ0 + 0.05, CZ1 - 0.05, R2(CX0 + 0.05), R2(y), "edge"); ZC(`kEdgeZr${i}`, "kAir", 0.025, CZ0 + 0.05, CZ1 - 0.05, R2(CX1 - 0.05), R2(y), "edge"); }
// 尺寸括弧（黃）：高、寬
LAY("kBr", [5, 5, KX - 0.6, 3.3]);
BOX("kBrV", "kBr", CX1 + 0.5, CX1 + 0.6, KY0 + 0.3, CY1, CZ1, CZ1 + 0.1, "bracket"); BOX("kBrVt", "kBr", CX1 + 0.35, CX1 + 0.75, CY1 - 0.05, CY1 + 0.05, CZ1, CZ1 + 0.1, "bracket"); BOX("kBrVb", "kBr", CX1 + 0.35, CX1 + 0.75, KY0 + 0.25, KY0 + 0.35, CZ1, CZ1 + 0.1, "bracket");
// 十顆灰塵：各自是一個零件（亮黃小點＋放大圈），每顆有自己的布朗擺動
const DUST10 = Array.from({ length: 10 }, (_, i) => [R2(CX0 + 0.6 + ((i * 0.37 + rnd() * 0.25) % 1) * (KS - 1.2)), R2(KY0 + 0.8 + rnd() * (KS - 1.0)), R2(CZ0 + 0.8 + rnd() * (KS - 1.6))]);
LAY("kDust", [4.4, 4.4, KX - 0.6, 3.4]);
DUST10.forEach(([x, y, z], i) => { SPH(`kD${i}`, "kDust", 0.06, x, y, z, "dustGlow"); P({ id: `kR${i}`, layer: "kDust", shape: "tube", size: [0.26, 0.21, 0.02], pos: [x, y, R2(z + 0.02)], mat: "ringG" }); });
// 微粒計數器（推車＋方盒＋吸氣管伸進衣櫃＋螢幕＋燈）
LAY("kCounter", [2.2, 3, KX + 3.8, 2.4]);
BOX("kcCart", "kCounter", KX + 3.0, KX + 4.6, 1.0, 2.2, -0.8, 0.8, "steel2"); P({ id: "kcWheel", layer: "kCounter", shape: "cyl", size: [0.15, 0.12], pos: [0, 1.1, 0], at: [[KX + 3.15, 0, 0.75], [KX + 4.45, 0, 0.75]], mat: "rubber" });
BOX("kcBox", "kCounter", KX + 3.1, KX + 4.5, 2.2, 3.1, -0.65, 0.65, "white"); BOX("kcScreen", "kCounter", KX + 3.3, KX + 4.3, 2.45, 2.95, 0.65, 0.68, "screen");
P({ id: "kcBtn", layer: "kCounter", shape: "cyl", size: [0.06, 0.04], pos: [0, 2.32, 0.68], at: [[KX + 3.4, 0, 0], [KX + 3.6, 0, 0], [KX + 3.8, 0, 0]], mat: "dark" }); SPH("kcLed", "kCounter", 0.07, KX + 4.35, 2.32, 0.68, "lampG");
PIPE("kcTube", "kCounter", [[KX + 3.4, 3.1, 0], [KX + 3.4, 3.8, 0], [R2(CX1 - 0.4), 3.8, 0]], 0.07, "steel"); VT("kcInlet", "kCounter", 0.13, 0.08, 3.6, 3.82, "dark", { x: R2(CX1 - 0.4), z: 0 });

// ═════ 站 F：濾網纖維放大（x 70）：纖維亂向交錯；空氣（淡藍）繞過纖維，灰塵（深色）撞到黏住 ═════
const FXC = 70;
LAY("fPlinth", [13, 1, FXC, 0.5]); BOX("fPl", "fPlinth", FXC - 6.5, FXC + 6.5, 0, 0.9, -3.4, 3.4, "band"); BOX("fPlTop", "fPlinth", FXC - 6.5, FXC + 6.5, 0.9, 1.0, -3.4, 3.4, "panel2");
LAY("fFrame", [12.4, 6.4, FXC, 4.2]);
BOX("fFrameL", "fFrame", FXC - 6.2, FXC - 5.8, 1.0, 7.4, -2.6, 2.6, "steel2"); BOX("fFrameR", "fFrame", FXC + 5.8, FXC + 6.2, 1.0, 7.4, -2.6, 2.6, "steel2");
P({ id: "fFrameRib", layer: "fFrame", shape: "box", size: [0.06, 6.4, 0.06], pos: [0, 4.2, 2.62], at: [[FXC - 6.0, 0, 0], [FXC + 6.0, 0, 0]], mat: "seam" });
const FIB = [];
for (let i = 0; i < 56; i++) { const y = R2(2.0 + (i % 9) * 0.6 + rnd() * 0.3), x = R2(FXC - 5.0 + rnd() * 10.0), z = R2(-1.6 + rnd() * 3.2), yaw = R2(rnd() * 180), tilt = R2(-14 + rnd() * 28), L = R2(3.2 + rnd() * 1.4), r = R2(0.16 + rnd() * 0.12);
  FIB.push({ x, y, z, yaw, r, L }); P({ id: `fib${i}`, layer: "fFrame", shape: "cyl", size: [r, Math.min(L, 11)], pos: [x, y, z], rot: [tilt, yaw, 0], mat: i % 3 ? "fiber" : "fiberD" }); }
// 攔住的灰塵（三批，依序出現：越來越多）
const STUCK = [[], [], []];
FIB.forEach((f, i) => { if (f.z < -0.4) return; const k = i % 3, a = f.yaw * D2R, u = -0.6 + rnd() * 1.2; STUCK[k].push([R2(f.x + Math.cos(a) * u), R2(f.y + f.r + 0.08), R2(f.z - Math.sin(a) * u + f.r * 0.7)]); });
STUCK.forEach((pts, k) => { LAY(`fStuck${k}`, [11, 6, FXC, 4.2]); P({ id: `fStuckD${k}`, layer: `fStuck${k}`, shape: "sphere", size: [k === 1 ? 0.09 : 0.14], pos: [0, 0, 0], at: pts, mat: "dust" }); });
// 空氣進出方向的提示（上方淡藍格柵＝進風，下方＝出風）
LAY("fIO", [12, 7.4, FXC, 4.2]);
P({ id: "fInBar", layer: "fIO", shape: "box", size: [11.4, 0.06, 0.06], pos: [FXC, 7.35, 2.4], mat: "airDot" }); P({ id: "fOutBar", layer: "fIO", shape: "box", size: [11.4, 0.06, 0.06], pos: [FXC, 1.15, 2.4], mat: "airDot" });

// ═════ 站 P：人與無塵衣（x 100）：中性假人（不畫臉），便服 → 穿上無塵衣；頭頂風扇濾網、腳下孔板 ═════
const PX = 100, HIP = 3.8, SH = 6.1;
LAY("pRoom", [12, 9, PX, 4.6]);
BOX("prFloor", "pRoom", PX - 6, PX + 6, 0, 0.9, -3.4, 3.4, "tile");
P({ id: "prHole", layer: "pRoom", shape: "box", size: [0.16, 0.02, 0.16], pos: [0, 0.905, 0], at: GXZ(26, 3, 0.45, 0.45, PX - 5.6, 2.2), mat: "hole" });
P({ id: "prSeam", layer: "pRoom", shape: "box", size: [0.04, 0.03, 6.8], pos: [0, 0.91, 0], at: [-4, -2, 0, 2, 4].map((d) => [PX + d, 0, 0]), mat: "seam" });
BOX("prCeil", "pRoom", PX - 6, PX + 6, 9.3, 9.45, -3.4, 2.4, "steel2");
P({ id: "prFfu", layer: "pRoom", shape: "box", size: [1.8, 0.05, 1.8], pos: [0, 9.27, -0.4], at: [-4, -2, 0, 2, 4].map((d) => [PX + d, 0, 0]), mat: "hepa" });
P({ id: "prFfuEdge", layer: "pRoom", shape: "box", size: [0.08, 0.1, 2.0], pos: [0, 9.25, -0.4], at: [-5, -3, -1, 1, 3, 5].map((d) => [PX + d, 0, 0]), mat: "steel" });
P({ id: "prFfuLed", layer: "pRoom", shape: "sphere", size: [0.05], pos: [0, 9.22, 0.4], at: [-4, -2, 0, 2, 4].map((d) => [PX + d + 0.7, 0, 0]), mat: "lampG" });
// 便服的人（中性假人，臉是空白圓）
LAY("person", [3, 7.6, PX, 4.8]);
SPH("pHead", "person", 0.5, PX, 7.35, 0, "skin"); VC("pNeck", "person", 0.2, 6.7, 6.95, "skin", { x: PX });
P({ id: "pHair", layer: "person", shape: "sphere", size: [0.53], pos: [PX, 7.5, -0.06], scale: [1, 0.85, 1], mat: "hair" });
P({ id: "pTorso", layer: "person", shape: "slab", size: [1.5, 2.3, 0.8], r: 0.32, pos: [PX, 5.6, -0.4], mat: "shirt" });
P({ id: "pHip", layer: "person", shape: "slab", size: [1.36, 0.7, 0.76], r: 0.25, pos: [PX, 4.15, -0.38], mat: "pants" });
for (const [s, dx] of [["L", -0.38], ["R", 0.38]]) {
  VC(`pLeg${s}`, "person", 0.27, 1.25, HIP, "pants", { x: PX + dx }); BOX(`pShoe${s}`, "person", PX + dx - 0.25, PX + dx + 0.25, 0.9, 1.25, -0.3, 0.5, "shoe");
  VC(`pArmU${s}`, "person", 0.2, 4.9, SH, "shirt", { x: PX + dx * 2.25 }); VC(`pArmF${s}`, "person", 0.17, 3.85, 4.9, "skin", { x: PX + dx * 2.25 }); SPH(`pHand${s}`, "person", 0.2, PX + dx * 2.25, 3.7, 0, "skin");
}
// 無塵衣（連身服、頭罩、口罩與護目鏡、手套、鞋套），各自從上方落下套上
LAY("suitBody", [3.2, 6, PX, 4.0]); LAY("suitHood", [1.4, 1.6, PX, 7.2]); LAY("suitGlove", [3.2, 0.6, PX, 3.7]); LAY("suitBoot", [1.6, 1.0, PX, 1.4]);
P({ id: "sTorso", layer: "suitBody", shape: "slab", size: [1.72, 2.5, 1.02], r: 0.38, pos: [PX, 5.6, -0.51], mat: "suit" });
P({ id: "sHip", layer: "suitBody", shape: "slab", size: [1.58, 0.86, 0.98], r: 0.32, pos: [PX, 4.15, -0.49], mat: "suit" });
BOX("sZip", "suitBody", PX - 0.03, PX + 0.03, 4.0, 6.7, 0.0, 0.04, "suitS"); BOX("sPocket", "suitBody", PX + 0.25, PX + 0.65, 5.7, 6.15, 0.0, 0.03, "suitS");
VT("sCollar", "suitBody", 0.34, 0.2, 6.55, 6.75, "leak", { x: PX });
for (const [s, dx] of [["L", -0.38], ["R", 0.38]]) {
  VC(`sLeg${s}`, "suitBody", 0.35, 1.45, HIP + 0.1, "suit", { x: PX + dx });
  VC(`sArmU${s}`, "suitBody", 0.27, 4.85, SH + 0.05, "suit", { x: PX + dx * 2.25 }); VC(`sArmF${s}`, "suitBody", 0.25, 4.0, 4.9, "suit", { x: PX + dx * 2.25 });
  VT(`sCuff${s}`, "suitBody", 0.31, 0.2, 4.1, 4.24, "leak", { x: PX + dx * 2.25 }); VT(`sAnkle${s}`, "suitBody", 0.37, 0.25, 1.9, 2.04, "leak", { x: PX + dx });
}
P({ id: "sSeam", layer: "suitBody", shape: "box", size: [0.03, 2.3, 0.03], pos: [0, 2.6, 0.33], at: [[PX - 0.38, 0, 0], [PX + 0.38, 0, 0]], mat: "suitS" });
SPH("hHood", "suitHood", 0.6, PX, 7.38, -0.02, "suit"); VT("hDrape", "suitHood", 0.62, 0.22, 6.6, 6.98, "suit", { x: PX });
P({ id: "hVisor", layer: "suitHood", shape: "slab", size: [0.8, 0.26, 0.22], r: 0.1, pos: [PX, 7.48, 0.46], mat: "visor" });
P({ id: "hMask", layer: "suitHood", shape: "slab", size: [0.62, 0.34, 0.2], r: 0.12, pos: [PX, 7.08, 0.48], mat: "suitS" });
P({ id: "hStrap", layer: "suitHood", shape: "box", size: [1.22, 0.05, 0.05], pos: [PX, 7.2, 0.0], mat: "suitS" });
for (const [s, dx] of [["L", -0.38], ["R", 0.38]]) { SPH(`gHand${s}`, "suitGlove", 0.24, PX + dx * 2.25, 3.68, 0, "glove"); VT(`gCuff${s}`, "suitGlove", 0.27, 0.2, 3.85, 4.1, "glove", { x: PX + dx * 2.25 });
  BOX(`bBoot${s}`, "suitBoot", PX + dx - 0.3, PX + dx + 0.3, 0.9, 1.9, -0.36, 0.56, "suit"); BOX(`bSole${s}`, "suitBoot", PX + dx - 0.31, PX + dx + 0.31, 0.9, 1.0, -0.37, 0.57, "suitS"); BOX(`bStrap${s}`, "suitBoot", PX + dx - 0.31, PX + dx + 0.31, 1.6, 1.68, -0.37, 0.57, "suitS"); }

// ═════ 站 G：氣閘（x 130）：走廊（外）｜前室（風淋、黏塵墊、更衣櫃）｜無塵室（風扇濾網）；兩道門、互鎖燈、壓差表、傳遞窗 ═════
const GX0 = 120.6, GA = 125.6, GB = 131.4, GX1 = 137.4, GY0 = 0.9, GY1 = 7.4, GZ0 = -3.2, GZ1 = 3.2;
LAY("gRoom", [17, 7, 129, 4]);
BOX("gFloorC", "gRoom", GX0, GA, 0, GY0, GZ0, GZ1, "corr"); BOX("gFloorA", "gRoom", GA, GB, 0, GY0, GZ0, GZ1, "ante"); BOX("gFloorR", "gRoom", GB, GX1, 0, GY0, GZ0, GZ1, "tile");
P({ id: "gHole", layer: "gRoom", shape: "box", size: [0.16, 0.02, 0.16], pos: [0, GY0 + 0.005, 0], at: GXZ(12, 5, 0.48, 0.9, GB + 0.4, -2.6), mat: "hole" });
BOX("gMat", "gRoom", GA + 0.3, GA + 2.3, GY0, GY0 + 0.03, -1.4, 1.4, "mat");
BOX("gBack", "gRoom", GX0, GX1, GY0, GY1, GZ0 - 0.25, GZ0, "wall");
BOX("gBackC", "gRoom", GX0, GA, GY0, GY1, GZ0 - 0.02, GZ0 + 0.01, "corr"); BOX("gBackA", "gRoom", GA, GB, GY0, GY1, GZ0 - 0.02, GZ0 + 0.01, "ante");
BOX("gCeilR", "gRoom", GB, GX1, GY1, GY1 + 0.25, GZ0, GZ0 + 1.4, "steel2"); BOX("gCeilEdge", "gRoom", GX0, GX1, GY1 - 0.1, GY1 + 0.05, GZ0 + 1.35, GZ0 + 1.45, "seam");
P({ id: "gFfu", layer: "gRoom", shape: "box", pos: [0, GY1 - 0.03, 0], at: [[GB + 1.2, 0, -2.5], [GB + 3.0, 0, -2.5], [GB + 4.8, 0, -2.5]], size: [1.6, 0.05, 1.2], mat: "hepa" });
BOX("gCeilA", "gRoom", GA, GB, GY1, GY1 + 0.25, GZ0, GZ0 + 1.4, "panel2"); BOX("gLightA", "gRoom", GA + 1.2, GB - 1.2, GY1 - 0.06, GY1, GZ0 + 0.3, GZ0 + 1.2, "lightPanel");
BOX("gCeilC", "gRoom", GX0, GA, GY1, GY1 + 0.25, GZ0, GZ0 + 1.4, "panel2"); BOX("gLightC", "gRoom", GX0 + 1.2, GA - 1.2, GY1 - 0.06, GY1, GZ0 + 0.3, GZ0 + 1.2, "lightPanel");
// 隔牆（門洞在 z −1.1～1.1）
for (const [w, x] of [["A", GA], ["B", GB]]) {
  BOX(`gWall${w}a`, "gRoom", x - 0.15, x + 0.15, GY0, GY1, GZ0, -1.1, "wallD"); BOX(`gWall${w}b`, "gRoom", x - 0.15, x + 0.15, GY0, GY1, 1.1, GZ1, "wallD"); BOX(`gWall${w}c`, "gRoom", x - 0.15, x + 0.15, 5.6, GY1, -1.1, 1.1, "wallD");
  BOX(`gFrame${w}`, "gRoom", x - 0.2, x + 0.2, 5.5, 5.62, -1.15, 1.15, "steel"); P({ id: `gJamb${w}`, layer: "gRoom", shape: "box", size: [0.4, 4.7, 0.08], pos: [x, 3.25, 0], at: [[0, 0, -1.14], [0, 0, 1.14]], mat: "steel" });
  SPH(`gLock${w}G`, "gRoom", 0.2, x + (w === "A" ? -0.25 : 0.25), 6.0, -0.3, "lampG"); SPH(`gLock${w}R`, "gRoom", 0.2, x + (w === "A" ? -0.25 : 0.25), 6.0, 0.3, "lampR");
  BOX(`gLockBox${w}`, "gRoom", x - 0.34, x + 0.34, 5.72, 6.28, -0.6, 0.6, "dark");
}
// 門（鉸鏈在 z −1.1；rotate 動作開門）
LAY("gDoorA", [0.2, 4.6, GA, 3.2]); LAY("gDoorB", [0.2, 4.6, GB, 3.2]);
for (const [w, x] of [["A", GA], ["B", GB]]) {
  BOX(`gDoor${w}P`, `gDoor${w}`, x - 0.08, x + 0.08, GY0 + 0.05, 5.5, -1.08, 1.08, "panel");
  BOX(`gDoor${w}Win`, `gDoor${w}`, x - 0.09, x + 0.09, 3.9, 5.0, -0.6, 0.6, "window"); FRAME(`gDoor${w}WF`, `gDoor${w}`, x + 0.09, x + 0.13, 3.9, 5.0, -0.62, 0.04, "steel");
  BOX(`gDoor${w}Hd`, `gDoor${w}`, x - 0.2, x + 0.2, 3.1, 3.2, 0.7, 0.95, "steel2"); BOX(`gDoor${w}Kick`, `gDoor${w}`, x - 0.1, x + 0.1, GY0 + 0.05, GY0 + 0.5, -1.06, 1.06, "steel2");
}
// 前室：風淋噴嘴（背牆兩排）、更衣櫃、長椅
P({ id: "gNozzle", layer: "gRoom", shape: "cyl", size: [0.09, 0.2], pos: [0, 0, GZ0 + 0.1], at: Array.from({ length: 10 }, (_, i) => [R2(GA + 0.9 + (i % 5) * 1.0), R2(2.6 + Math.floor(i / 5) * 1.6), 0]), mat: "noz" });
P({ id: "gNozzleRing", layer: "gRoom", shape: "tube", size: [0.16, 0.09, 0.05], pos: [0, 0, GZ0 + 0.03], at: Array.from({ length: 10 }, (_, i) => [R2(GA + 0.9 + (i % 5) * 1.0), R2(2.6 + Math.floor(i / 5) * 1.6), 0]), mat: "steel" });
P({ id: "gLocker", layer: "gRoom", shape: "box", size: [0.9, 2.6, 0.7], pos: [0, GY0 + 1.3, 2.7], at: [[GA + 0.7, 0, 0], [GA + 1.65, 0, 0]], mat: "panel2" });
P({ id: "gLockerVent", layer: "gRoom", shape: "box", size: [0.5, 0.05, 0.02], pos: [0, 0, 2.34], at: [[GA + 0.7, GY0 + 2.2, 0], [GA + 0.7, GY0 + 2.35, 0], [GA + 1.65, GY0 + 2.2, 0], [GA + 1.65, GY0 + 2.35, 0]], mat: "dark" });
BOX("gBench", "gRoom", GA + 2.8, GB - 0.6, GY0 + 0.7, GY0 + 0.85, 1.8, 2.8, "steel2"); P({ id: "gBenchLeg", layer: "gRoom", shape: "box", size: [0.1, 0.7, 0.8], pos: [0, GY0 + 0.35, 2.3], at: [[GA + 3.0, 0, 0], [GB - 0.8, 0, 0]], mat: "steel" });
// 壓差表（三區各一個，指針位置不同；不標數字）
const GAUGES = [["C", GX0 + 2.5, -20], ["A", GA + 3.6, 20], ["R", GB + 3.0, 60]];
for (const [w, x, ang] of GAUGES) {
  VC(`gGauge${w}`, "gRoom", 0.42, 0, 0.08, "white", { x, z: 0, pos: [x, 4.6, GZ0 + 0.1], rot: [0, 0, 0] });
  P({ id: `gGaugeRim${w}`, layer: "gRoom", shape: "tube", size: [0.48, 0.42, 0.1], pos: [x, 4.6, GZ0 + 0.1], mat: "steel" });
  P({ id: `gGaugeNeedle${w}`, layer: "gRoom", shape: "box", size: [0.05, 0.34, 0.03], pos: [R2(x + 0.15 * Math.sin(ang * D2R)), R2(4.6 + 0.15 * Math.cos(ang * D2R)), GZ0 + 0.16], rot: [0, 0, -ang], mat: "lampR" });
  P({ id: `gGaugeTick${w}`, layer: "gRoom", shape: "box", size: [0.03, 0.08, 0.02], pos: [x, 4.98, GZ0 + 0.15], mat: "dark" });
}
// 傳遞窗（不鏽鋼盒＋玻璃觀察窗，嵌在前室／無塵室隔牆，雙門互鎖）
BOX("gPass", "gRoom", GB - 0.5, GB + 0.5, 2.2, 4.0, 1.4, 3.0, "steel2"); BOX("gPassWin", "gRoom", GB + 0.5, GB + 0.54, 2.5, 3.7, 1.6, 2.8, "glassD"); FRAME("gPassFr", "gRoom", GB + 0.54, GB + 0.58, 2.45, 3.75, 1.55, 0.04, "steel"); SPH("gPassLed", "gRoom", 0.12, GB + 0.58, 3.85, 2.85, "lampG");
// 走廊外的灰塵（靜態：貼在門縫外側）
LAY("gDustOut", [3, 4, GA - 1.0, 3]); P({ id: "gDustStuck", layer: "gDustOut", shape: "sphere", size: [0.08], pos: [0, 0, 0], at: Array.from({ length: 14 }, () => [R2(GA - 0.25 - rnd() * 0.5), R2(1.3 + rnd() * 4.0), R2(-1.0 + rnd() * 2.0)]), mat: "dust" });

// ═════ 站 H：溫濕度（x 160）：牆上溫度表、濕度表、感測頭、控制盒；前面晶圓台（脹縮對照）與靜電火花 ═════
const HXc = 160;
LAY("hRoom", [14, 7, HXc, 3.8]);
BOX("hFloor", "hRoom", HXc - 7, HXc + 7, 0, 0.9, -3.4, 3.4, "tile"); BOX("hWall", "hRoom", HXc - 7, HXc + 7, 0.9, 7.6, -3.6, -3.3, "wall");
for (const [w, x] of [["T", HXc - 4.4], ["H", HXc - 1.4]]) {
  P({ id: `hDial${w}`, layer: "hRoom", shape: "cyl", size: [1.05, 0.12], pos: [x, 5.4, -3.2], mat: "white" });
  P({ id: `hDialRim${w}`, layer: "hRoom", shape: "tube", size: [1.16, 1.05, 0.2], pos: [x, 5.4, -3.18], mat: "steel" });
  P({ id: `hDialBand${w}`, layer: "hRoom", shape: "box", size: [0.7, 0.16, 0.02], pos: [x, 6.05, -3.12], mat: "lampG" });
  P({ id: `hDialTick${w}`, layer: "hRoom", shape: "box", size: [0.04, 0.16, 0.02], pos: [0, 0, -3.12], at: Array.from({ length: 9 }, (_, i) => { const a = (-80 + i * 20) * D2R; return [R2(x + 0.85 * Math.sin(a)), R2(5.4 + 0.85 * Math.cos(a)), 0]; }), mat: "dark" });
  P({ id: `hNeedle${w}`, layer: "hRoom", shape: "box", size: [0.07, 0.8, 0.03], pos: [x, 5.78, -3.1], mat: "lampR" }); SPH(`hHub${w}`, "hRoom", 0.1, x, 5.4, -3.08, "dark");
}
BOX("hSensor", "hRoom", HXc + 1.4, HXc + 2.6, 5.0, 6.2, -3.3, -2.8, "white"); P({ id: "hSensorSlot", layer: "hRoom", shape: "box", size: [0.9, 0.05, 0.02], pos: [HXc + 2.0, 0, -2.78], at: [5.3, 5.5, 5.7, 5.9].map((y) => [0, y, 0]), mat: "dark" });
BOX("hConduit", "hRoom", HXc + 1.9, HXc + 2.1, 6.2, 7.6, -3.3, -3.1, "steel2"); BOX("hCtrl", "hRoom", HXc + 3.4, HXc + 5.6, 4.4, 6.4, -3.3, -2.7, "panel2");
P({ id: "hCtrlLed", layer: "hRoom", shape: "sphere", size: [0.07], pos: [0, 6.1, -2.68], at: [[HXc + 3.8, 0, 0], [HXc + 4.1, 0, 0], [HXc + 4.4, 0, 0]], mat: "lampG" }); BOX("hCtrlScreen", "hRoom", HXc + 3.7, HXc + 5.3, 4.7, 5.6, -2.7, -2.67, "screen");
// 晶圓台：台座＋吸盤＋晶圓（圖案格線分左右兩半，脹縮時往外、往內微移）
LAY("hStage", [6, 2, HXc + 1.0, 1.6]);
BOX("hStageBase", "hStage", HXc - 2.4, HXc + 4.4, 0.9, 1.6, -1.2, 2.4, "band"); P({ id: "hStageRail", layer: "hStage", shape: "box", size: [6.6, 0.08, 0.12], pos: [HXc + 1.0, 1.64, 0], at: [[0, 0, -0.8], [0, 0, 2.0]], mat: "steel2" });
VC("hChuck", "hStage", 2.0, 1.6, 1.9, "steel2", { x: HXc + 1.0, z: 0.6 }); VC("hWafer", "hStage", 1.85, 1.9, 1.96, "dark", { x: HXc + 1.0, z: 0.6 });
LAY("hPatL", [2, 0.2, HXc + 0.2, 2]); LAY("hPatR", [2, 0.2, HXc + 1.8, 2]);
for (const [s, sx] of [["L", -1], ["R", 1]]) { const pts = []; for (let i = 0; i < 3; i++) for (let j = 0; j < 5; j++) { const x = HXc + 1.0 + sx * (0.35 + i * 0.45), z = 0.6 - 1.0 + j * 0.5; if (Math.hypot(x - HXc - 1.0, z - 0.6) < 1.6) pts.push([R2(x), 0, R2(z)]); }
  P({ id: `hDie${s}`, layer: `hPat${s}`, shape: "box", size: [0.36, 0.02, 0.4], pos: [0, 1.975, 0], at: pts, mat: "screen" }); }
LAY("hBr", [5, 1, HXc + 1, 2.4]); BOX("hBrL", "hBr", HXc - 0.95, HXc - 0.85, 1.96, 2.5, 2.3, 2.4, "bracket"); BOX("hBrR", "hBr", HXc + 2.85, HXc + 2.95, 1.96, 2.5, 2.3, 2.4, "bracket");
// 靜電：接地叉片靠近晶圓邊緣，火花（鋸齒）閃一下
BOX("hFork", "hStage", HXc + 3.1, HXc + 4.4, 1.95, 2.02, 0.2, 1.0, "steel2");
LAY("hSpark", [1, 0.6, HXc + 2.95, 2.1]); P({ id: "hSparkBolt", layer: "hSpark", shape: "poly", size: [1, 1, 0.05], pts: [[-0.22, 0.02], [-0.05, 0.12], [0.02, -0.04], [0.22, 0.06], [0.22, 0.12], [0.0, 0.04], [-0.06, 0.2], [-0.22, 0.08]], pos: [HXc + 2.95, 2.0, 0.6], rot: [-90, 0, 0], mat: "spark" });
SPH("hSparkGlow", "hSpark", 0.14, HXc + 2.95, 2.02, 0.6, "spark");

// ═════ 站 B：工程公司（x 190）：三個無塵室模組（剖開的小房間）＋文字名牌（白底深色字，不是商標）═════
const BXc = 190;
LAY("bBase", [16, 1, BXc, 0.5]); BOX("bPl", "bBase", BXc - 8, BXc + 8, 0, 0.9, -3.6, 3.6, "band"); BOX("bPlTop", "bBase", BXc - 8, BXc + 8, 0.9, 1.0, -3.6, 3.6, "panel2");
const SIGNS = [["uis", 0], ["lk", 1], ["yk", 2]];
const SIGNM = JSON.parse(fs.readFileSync(path.join(HERE, "..", "..", "public", "tex", "brand", "meta.json"), "utf8"));
SIGNS.forEach(([id]) => { materials[`t_${id}`] = { kind: "unlit", color: "#FFFFFF", img: `tex/brand/sign-${id}.png` }; });
SIGNS.forEach(([sid, i]) => { const x = BXc - 5.0 + i * 5.0, ly = `bMod${i}`;
  LAY(ly, [4.6, 5, x, 3.4]);
  BOX(`b${i}Floor`, ly, x - 2.1, x + 2.1, 1.0, 1.3, -2.0, 2.0, "tile"); P({ id: `b${i}Hole`, layer: ly, shape: "box", size: [0.12, 0.02, 0.12], pos: [0, 1.305, 0], at: GXZ(10, 3, 0.4, 0.4, x - 1.8, 0.9), mat: "hole" });
  BOX(`b${i}Back`, ly, x - 2.1, x + 2.1, 1.3, 4.6, -2.0, -1.85, "wall"); BOX(`b${i}Side`, ly, x - 2.1, x - 1.95, 1.3, 4.6, -2.0, 2.0, "wall");
  BOX(`b${i}Ceil`, ly, x - 2.1, x + 2.1, 4.6, 4.8, -2.0, 2.0, "steel2");
  P({ id: `b${i}Ffu`, layer: ly, shape: "box", size: [0.9, 0.04, 0.9], pos: [0, 4.58, 0], at: [[x - 1.0, 0, -1.0], [x, 0, -1.0], [x + 1.0, 0, -1.0], [x - 1.0, 0, 0], [x, 0, 0], [x + 1.0, 0, 0], [x - 1.0, 0, 1.0], [x, 0, 1.0], [x + 1.0, 0, 1.0]], mat: "hepa" });
  P({ id: `b${i}FfuBox`, layer: ly, shape: "box", size: [0.7, 0.3, 0.7], pos: [0, 4.95, 0], at: [[x - 1.0, 0, -1.0], [x + 1.0, 0, -1.0], [x, 0, 0], [x - 1.0, 0, 1.0], [x + 1.0, 0, 1.0]], mat: "ffu" });
  BOX(`b${i}Tool`, ly, x - 0.9, x + 1.3, 1.3, 2.9, -1.6, -0.2, "tool"); BOX(`b${i}ToolS`, ly, x + 0.2, x + 1.0, 2.2, 2.6, -0.21, -0.18, "screen");
  BOX(`b${i}Crane`, ly, x + 1.7, x + 1.85, 1.3, 5.6, 1.4, 1.55, "warnY"); BOX(`b${i}CraneArm`, ly, x - 0.4, x + 1.85, 5.45, 5.6, 1.4, 1.55, "warnY"); PIPE(`b${i}Hook`, ly, [[x - 0.2, 5.45, 1.47], [x - 0.2, 5.1, 1.47]], 0.03, "dark");
  const sg = SIGNM[`sign-${sid}`], sw = 3.4; P({ id: `b${i}Sign`, layer: ly, shape: "plane", size: [sw, R2(sw / sg.aspect)], pos: [x, R2(0.45 + 0.02), 3.62], uv01: true, shadow: false, mat: `t_${sid}` });
});

// ═════ 動作 ═════
const fanIds = [...bladeIds];
actions.ffuSpin = { type: "rotate", _說明: "前排風扇濾網的扇葉轉動（起轉加速、停轉減速），各自繞自己的軸", parts: fanIds, axis: [0, 1, 0], pivots: bladePiv, rps: 1.6, rampSpin: true };
actions.oneSpin = { type: "rotate", _說明: "拉出來那一台的扇葉", parts: ["oneBlade", "oneBladeX"], axis: [0, 1, 0], pivot: [ONE[0], 0, ONE[1]], rps: 1.6, rampSpin: true };
actions.ffuLed = { type: "pulse", _說明: "每台指示燈綠燈（運轉中）", parts: ["faLed", "ffLed"], color: "lampG", glow: 0.8, freq: 0.6, halo: 0 };
// 層流：天花板往下，平行、速度均勻、有輕微隨機；三排（z 5.0／3.4／1.8）交錯
const LANE_X = 0.0;   // lanes 以路徑為中心向兩側排開
for (const [k, z, dx] of [[0, 5.0, 0], [1, 3.4, 0.8], [2, 1.8, 0.4]]) {
  actions[`airDown${k}`] = { type: "flow", _說明: "垂直單向氣流（層流）：乾淨空氣由濾網往下，平行、速度均勻，像一道瀑布", layer: "ceil", path: [[R2(LANE_X + dx), YC - 0.05, z], [R2(LANE_X + dx), YF + 0.1, z]], n: 3, lanes: 12, phase: -4, laneDir: [1, 0, 0], laneGap: 1.6, size: k === 0 ? 0.24 : 0.19, shape: "arrow", rate: 0.24, color: "airD", rim: "#FFFFFF", track: false, free: true, jitter: 0.06 };
  actions[`airDot${k}`] = { type: "flow", layer: "ceil", path: [[R2(LANE_X + dx + 0.8 - 0.8), YC - 0.05, z - 0.3], [R2(LANE_X + dx), YF + 0.05, z - 0.3]], n: 2, lanes: 11, phase: -4, laneDir: [1, 0, 0], laneGap: 1.6, size: 0.1, shape: "dot", rate: 0.26, color: "airC", rim: "#2F9FD8", track: false, free: true, jitter: 0.1 };
}
actions.airWake = { type: "flow", _說明: "機台頂部後方的小繞流：仍整體往下", layer: "tools", path: [[-1.6, YC - 0.2, -0.2], [-1.6, YF + 4.6, -0.2], [-1.2, YF + 3.9, 0.2], [-1.8, YF + 3.2, 0.1], [-1.4, YF + 1.6, 0.3], [-1.5, YF + 0.1, 0.4]], n: 5, size: 0.12, shape: "dot", rate: 0.24, color: "airD", track: false, free: true, jitter: 0.12 };
actions.dustDown = { type: "flow", _說明: "灰塵（深色）被氣流往下帶走、在地板孔洞被抽走（大小不一、輕微隨機）", layer: "tools", path: [[0.1, YF + 5.0, 4.4], [0.3, YF + 2.6, 4.5], [0.2, YF - 0.6, 4.4]], n: 2, lanes: 6, phase: -4, laneDir: [1, 0, 0], laneGap: 2.9, size: 0.17, shape: "dot", rate: 0.22, color: "dustC", track: false, free: true, jitter: 0.18 };
// 回風循環：地板孔洞 → 回風層 → 兩側豎井往上 → 空氣室 → 回到風扇濾網（箭頭＋軌道）
const LOOP = (s) => [[s * 3.0, YF + 0.3, 5.8], [s * 3.0, 0.45, 5.8], [s * 10.3, 0.45, 5.8], [s * 10.3, 9.4, 5.8], [s * 4.0, 9.6, 5.8], [s * 3.2, YC + 1.0, 5.8]];
actions.loopL = { type: "flow", _說明: "回風循環（左）：從地板孔洞抽回、往兩側、沿豎井往上、回到空氣室重新過濾", layer: "subfab", path: LOOP(-1), n: 8, size: 0.16, shape: "arrow", rate: 0.16, color: "airD", track: true, band: 0.05, bandO: 0.35, free: true, jitter: 0.03 };
actions.loopR = { type: "flow", layer: "subfab", path: LOOP(1), n: 8, size: 0.16, shape: "arrow", rate: 0.16, color: "airD", track: true, band: 0.05, bandO: 0.35, free: true, jitter: 0.03 };
actions.floorSuck = { type: "flow", _說明: "空氣穿過地板孔洞往下", layer: "subfab", path: [[0.0, YF + 0.9, 4.9], [0.0, 0.9, 4.9]], n: 2, lanes: 9, phase: -4, laneDir: [1, 0, 0], laneGap: 2.1, size: 0.1, shape: "arrow", rate: 0.35, color: "airD", track: false, free: true, jitter: 0.05 };
// 站 K：十顆灰塵各自布朗擺動（不同軸、不同頻率）
DUST10.forEach((_, i) => { actions[`kBrown${i}`] = { type: "vibrate", parts: [`kD${i}`, `kR${i}`], axis: [[1, 0.3, 0], [0, 1, 0.2], [0.4, 0, 1], [1, 1, 0]][i % 4], amp: 0.12, freq: 0.18 + (i % 5) * 0.05 }; });
actions.kGlow = { type: "pulse", _說明: "十顆灰塵亮起（數得出來）", parts: DUST10.map((_, i) => `kD${i}`), color: "lampY", glow: 1, freq: 0.9, halo: 0 };
actions.kSample = { type: "flow", _說明: "微粒計數器從衣櫃裡吸一點空氣", layer: "kCounter", path: [[R2(CX1 - 0.4), 3.6, 0], [R2(CX1 - 0.4), 3.8, 0], [KX + 3.4, 3.8, 0], [KX + 3.4, 3.1, 0]], n: 4, size: 0.07, shape: "dot", rate: 0.5, color: "airC", track: false, free: true, jitter: 0.02 };
// 站 F：空氣繞過纖維（淡藍、蛇行）、大灰塵直直撞上纖維（慣性）、小灰塵亂跳（擴散）撞上纖維、乾淨空氣從下方出去
const fy = (y) => R2(y);
actions.fAir = { type: "flow", _說明: "空氣沿纖維之間的縫隙蛇行往下（繞過纖維）", layer: "fFrame", path: [[FXC - 0.4, 7.6, 2.4], [FXC + 0.2, 6.2, 2.4], [FXC - 0.6, 5.0, 2.4], [FXC + 0.3, 3.6, 2.4], [FXC - 0.3, 2.2, 2.4], [FXC, 0.8, 2.4]], n: 4, lanes: 6, phase: -4, laneDir: [1, 0, 0], laneGap: 1.7, size: 0.08, shape: "dot", rate: 0.22, color: "airC", track: false, free: true, jitter: 0.06 };
const hit = FIB.filter((f) => f.z > -0.4).slice(0, 6);
hit.forEach((f, i) => { const big = i % 2 === 0;
  actions[`fDust${i}`] = { type: "flow", _說明: big ? "大灰塵慣性大，不跟著氣流轉彎，直直撞上纖維黏住" : "小灰塵亂跳（擴散），碰到纖維就黏住", layer: "fFrame",
    path: big ? [[f.x, 7.8, 2.2], [f.x, fy(f.y + 1.4), 2.2], [R2(f.x + 0.05), fy(f.y + f.r + 0.12), R2(f.z + f.r * 0.7)]]
      : [[R2(f.x - 0.4), 7.8, 2.2], [R2(f.x + 0.3), 6.6, 2.0], [R2(f.x - 0.5), 5.8, 2.3], [R2(f.x + 0.4), fy(Math.max(f.y + 1.0, 3.0)), 2.1], [R2(f.x - 0.2), fy(f.y + 0.5), 1.9], [f.x, fy(f.y + f.r + 0.1), R2(f.z + f.r * 0.7)]],
    n: 1, size: big ? 0.15 : 0.09, shape: "dot", rate: big ? 0.3 : 0.25, color: "dustC", track: false, free: true, jitter: big ? 0.0 : 0.1, rest: 14, restO: 1 };
});
actions.fOut = { type: "flow", _說明: "乾淨的空氣從濾網另一面出去（顏色變清）", layer: "fIO", path: [[FXC, 1.6, 2.4], [FXC, 0.4, 2.4]], n: 2, lanes: 7, phase: -4, laneDir: [1, 0, 0], laneGap: 1.65, size: 0.09, shape: "arrow", rate: 0.4, color: "cleanC", track: false, free: true, jitter: 0.03 };
// 站 P：走路（腿與手臂來回擺）、皮屑頭髮微粒（便服時大量）、穿上後只從領口袖口少量漏、被往下的氣流帶走
const legPartsL = ["pLegL", "pShoeL", "sLegL", "sAnkleL", "bBootL", "bSoleL", "bStrapL"], legPartsR = ["pLegR", "pShoeR", "sLegR", "sAnkleR", "bBootR", "bSoleR", "bStrapR"];
const armPartsL = ["pArmUL", "pArmFL", "pHandL", "sArmUL", "sArmFL", "sCuffL", "gHandL", "gCuffL"], armPartsR = ["pArmUR", "pArmFR", "pHandR", "sArmUR", "sArmFR", "sCuffR", "gHandR", "gCuffR"];
actions.walkL = { type: "rotate", _說明: "走路：左腿繞髖關節前後擺", parts: legPartsL, axis: [1, 0, 0], pivot: [PX - 0.38, HIP, 0], swing: 16, freq: 0.75 };
actions.walkR = { type: "rotate", parts: legPartsR, axis: [1, 0, 0], pivot: [PX + 0.38, HIP, 0], swing: -16, freq: 0.75 };
actions.armL = { type: "rotate", _說明: "手臂跟腳反向擺", parts: armPartsL, axis: [1, 0, 0], pivot: [PX - 0.855, SH, 0], swing: -12, freq: 0.75 };
actions.armR = { type: "rotate", parts: armPartsR, axis: [1, 0, 0], pivot: [PX + 0.855, SH, 0], swing: 12, freq: 0.75 };
const SHED = [[PX, 7.8, 0.3], [PX - 0.45, 7.4, 0.3], [PX + 0.45, 7.4, 0.3], [PX - 0.7, 6.4, 0.2], [PX + 0.7, 6.4, 0.2], [PX - 0.86, 4.6, 0.2], [PX + 0.86, 4.6, 0.2], [PX - 0.86, 3.7, 0.2], [PX + 0.86, 3.7, 0.2], [PX - 0.4, 2.4, 0.3], [PX + 0.4, 2.4, 0.3], [PX, 5.4, 0.42]];
SHED.forEach(([x, y, z], i) => { const s = x < PX ? -1 : x > PX ? 1 : (i % 2 ? 1 : -1);
  actions[`shed${i}`] = { type: "flow", _說明: i ? undefined : "便服：皮屑、頭髮、衣物纖維從身上散出（走動時更多），被往下的氣流帶走", layer: "person", path: [[x, y, z], [R2(x + s * 0.7), R2(y - 0.3), R2(z + 0.4)], [R2(x + s * 1.3), R2(Math.max(1.1, y - 1.8)), R2(z + 0.6)], [R2(x + s * 1.6), 1.0, R2(z + 0.7)]], n: 5, size: i < 3 ? 0.07 : 0.06, shape: "dot", rate: 0.35 + (i % 4) * 0.05, color: i < 3 ? "hairC" : "dustL", track: false, free: true, jitter: 0.12 };
});
const LEAK = [[PX - 0.3, 6.62, 0.3], [PX + 0.3, 6.62, 0.3], [PX - 0.855, 4.15, 0.3], [PX + 0.855, 4.15, 0.3], [PX - 0.38, 1.97, 0.4], [PX + 0.38, 1.97, 0.4]];
LEAK.forEach(([x, y, z], i) => { const s = x < PX ? -1 : 1;
  actions[`leak${i}`] = { type: "flow", _說明: i ? undefined : "穿上無塵衣後：只從領口、袖口、褲管少量漏出", layer: "person", path: [[x, y, z], [R2(x + s * 0.5), R2(y - 0.4), R2(z + 0.4)], [R2(x + s * 0.8), R2(Math.max(1.0, y - 1.6)), R2(z + 0.5)]], n: 1, size: 0.06, shape: "dot", rate: 0.3, color: "dustL", track: false, free: true, jitter: 0.08 };
});
actions.leakGlow = { type: "pulse", _說明: "領口、袖口、褲管鬆緊帶（主要洩漏處）亮起", parts: ["sCollar", "sCuffL", "sCuffR", "sAnkleL", "sAnkleR"], color: "markC", glow: 0.9, freq: 1.2, halo: 0 };
actions.pDown = { type: "flow", _說明: "頭頂往下的乾淨氣流", layer: "pRoom", path: [[PX, 9.2, 1.6], [PX, 1.0, 1.6]], n: 3, lanes: 6, phase: -4, laneDir: [1, 0, 0], laneGap: 2.0, size: 0.08, shape: "arrow", rate: 0.24, color: "airC", track: false, free: true, jitter: 0.05 };
// 站 G：開門（繞鉸鏈）、空氣由內往外（無塵室 → 前室 → 走廊，粗箭頭＝壓差大）、外面灰塵被擋回去、風淋噴氣
actions.doorA = { type: "rotate", _說明: "外門（走廊／前室）繞鉸鏈打開約 75 度，有加減速；until 後關回", parts: idsOf("gDoorA"), axis: [0, 1, 0], pivot: [GA, 0, -1.1], angle: -75 };
actions.doorB = { type: "rotate", _說明: "內門（前室／無塵室）", parts: idsOf("gDoorB"), axis: [0, 1, 0], pivot: [GB, 0, -1.1], angle: -75 };
actions.gOutA = { type: "flow", _說明: "門一開：前室的空氣往走廊湧出（壓差大，箭頭粗），進去走廊後散開變慢", layer: "gRoom", path: [[GA + 2.0, 2.8, 0.2], [GA + 0.4, 2.8, 0.2], [GA - 1.0, 2.8, 0.4], [GA - 3.0, 3.1, 1.2]], n: 4, lanes: 3, phase: -4, laneDir: [0, 1, 0], laneGap: 1.1, size: 0.32, shape: "arrow", rate: 0.55, color: "airD", track: false, free: true, jitter: 0.08 };
actions.gOutB = { type: "flow", _說明: "無塵室氣壓最高：空氣再從無塵室流進前室", layer: "gRoom", path: [[GB + 3.0, 2.6, 0.0], [GB + 0.4, 2.6, 0.0], [GB - 1.6, 2.7, 0.2]], n: 3, lanes: 3, phase: -4, laneDir: [0, 1, 0], laneGap: 1.1, size: 0.15, shape: "arrow", rate: 0.45, color: "airC", track: false, free: true, jitter: 0.06 };
actions.gDustBack = { type: "flow", _說明: "走廊的灰塵靠近門口，被往外的風推回去（進不來）", layer: "gDustOut", path: [[GX0 + 0.6, 2.2, 1.6], [GA - 0.6, 2.4, 0.6], [GA - 0.9, 2.6, 0.5], [GX0 + 1.2, 3.0, 1.8]], n: 5, lanes: 3, phase: -4, laneDir: [0, 1, 0], laneGap: 1.0, size: 0.11, shape: "dot", rate: 0.3, color: "dustC", track: false, free: true, jitter: 0.12 };
actions.gShower = { type: "flow", _說明: "風淋噴嘴往人身上吹（前室）", layer: "gRoom", path: [[GA + 2.9, 2.6, GZ0 + 0.2], [GA + 2.9, 2.3, GZ0 + 2.2]], n: 3, lanes: 5, phase: -4, laneDir: [1, 0, 0], laneGap: 1.0, size: 0.08, shape: "arrow", rate: 0.9, color: "airC", track: false, free: true, jitter: 0.04 };
actions.gShower2 = { type: "flow", layer: "gRoom", path: [[GA + 2.9, 4.2, GZ0 + 0.2], [GA + 2.9, 3.9, GZ0 + 2.2]], n: 3, lanes: 5, phase: -4, laneDir: [1, 0, 0], laneGap: 1.0, size: 0.08, shape: "arrow", rate: 0.9, color: "airC", track: false, free: true, jitter: 0.04 };
actions.gAnteGlow = { type: "pulse", _說明: "前室燈亮起", parts: ["gLightA", "gBackA", "gFloorA"], color: "airC", glow: 0.45, freq: 0.8, halo: 0 };
actions.gLockA = { type: "pulse", _說明: "外門互鎖燈：綠（可開）", parts: ["gLockAG"], color: "lampG", glow: 1, freq: 1.5, halo: 0.5 };
actions.gLockB = { type: "pulse", _說明: "內門互鎖燈：紅（外門開著時不能開）", parts: ["gLockBR"], color: "lampR", glow: 1, freq: 1.5, halo: 0.5 };
actions.gGaugeGlow = { type: "pulse", _說明: "三個壓差表依序亮起：無塵室最高、前室中間、走廊最低", parts: ["gGaugeRimR", "gGaugeRimA", "gGaugeRimC"], color: "lampY", glow: 0.9, freq: 1.0, halo: 0 };
// 站 H：溫濕度儀表亮、晶圓圖案脹縮（左右兩半往外往內）、靜電火花一閃、灰塵被吸過去
actions.hDialGlow = { type: "pulse", _說明: "溫度、濕度表綠色範圍亮起（被固定住；指針不抖）", parts: ["hDialBandT", "hDialBandH", "hDialRimT", "hDialRimH"], color: "lampG", glow: 0.9, freq: 0.8, halo: 0 };
actions.hExpL = { type: "vibrate", _說明: "溫度一變：圖案往外脹、往內縮（放大示意）", parts: ["hDieL", "hBrL"], axis: [1, 0, 0], amp: -0.12, freq: 0.6 };
actions.hExpR = { type: "vibrate", parts: ["hDieR", "hBrR"], axis: [1, 0, 0], amp: 0.12, freq: 0.6 };
actions.hSparkFlash = { type: "pulse", _說明: "太乾：靜電累積，在晶圓邊緣放電閃一下（示意）", parts: ["hSparkBolt", "hSparkGlow"], color: "sparkC", glow: 1, freq: 3.5, halo: 0.6 };
actions.hDustPull = { type: "flow", _說明: "帶電的晶圓把空氣中的灰塵吸過去", layer: "hStage", path: [[HXc + 4.2, 4.2, 1.6], [HXc + 3.2, 3.0, 1.2], [HXc + 2.6, 2.1, 0.9]], n: 2, lanes: 3, phase: -4, laneDir: [-1, 0.3, 0], laneGap: 0.9, size: 0.09, shape: "dot", rate: 0.45, color: "dustC", track: false, accel: true, free: true, jitter: 0.08 };
// 站 B：模組上的施工吊鉤小幅擺動
actions.bHook = { type: "vibrate", parts: ["b0Hook0", "b1Hook0", "b2Hook0"], axis: [1, 0, 0], amp: 0.06, freq: 0.5 };
// 站 R（s9）：水、氣、電沿管路流動
actions.uWaterFlow = { type: "flow", _說明: "超純水沿藍色管流動", layer: "utilW", path: [[-10.4, 0.55, 5.45], [10.4, 0.55, 5.45]], n: 10, size: 0.1, shape: "dot", rate: 0.25, color: "waterC", track: false, free: true, jitter: 0.02 };
actions.uGasFlow = { type: "flow", _說明: "氣體沿灰色管流動", layer: "utilG", path: [[10.4, 1.0, 3.95], [-10.4, 1.0, 3.95]], n: 9, size: 0.07, shape: "dot", rate: 0.3, color: "gasC", track: false, free: true, jitter: 0.02 };
actions.uPowerFlow = { type: "flow", _說明: "電沿黃色線槽送到機台", layer: "utilP", path: [[-10.4, 1.45, 3.25], [10.4, 1.45, 3.25]], n: 9, size: 0.08, shape: "dot", rate: 0.4, color: "powerC", track: false, free: true, jitter: 0.0 };

// 標註點
Object.assign(anchors, {
  room: A("tools", [-3.4, YF + 3.0, 2.6], -150, -90), ffu: A("ffuFront", [FX[3], YC + 0.17, FZ[6] + 0.7], -150, 110), hepa: A("oneHepa", [ONE[0] - 0.3, YC + 0.15, ONE[1] + 0.72], -170, 110),
  fanOne: A("oneFan", [ONE[0] + 0.4, YC + 0.88, ONE[1] + 0.3], 160, -90), ret: A("subfab", [-8.6, 0.72, 4.6], 150, -80), floorA: A("rFloor", [3.4, YF, 5.6], 150, 100),
  plenum: A("shell", [-4.0, 9.4, 5.0], -150, -80), water: A("utilW", [-5.0, 0.55, 5.4], -150, -90), gas: A("utilG", [1.2, 1.0, 3.9], 150, -100), power: A("utilP", [6.0, 1.33, 3.2], 150, -100),
  closet: A("closet", [CX0 + 0.2, CY1 - 0.6, CZ1], -160, -90), dust1: A("kDust", DUST10[3], 160, -100), counter: A("kCounter", [KX + 3.8, 2.9, 0.68], 120, 110),
  fiber: A("fFrame", [FIB[1].x, FIB[1].y + FIB[1].r, FIB[1].z + FIB[1].r], -160, -100), stuck: A("fStuck0", STUCK[0][2] ?? [FXC, 4, 1], 160, -100),
  person: A("person", [PX + 0.7, 5.6, 0.2], 170, -100), suit: A("suitBody", [PX + 0.75, 5.2, 0.4], 170, -100), leakA: A("suitBody", [PX + 0.3, 6.62, 0.3], 170, -90),
  gauge: A("gRoom", [GB + 3.0, 4.6, GZ0 + 0.2], 150, -100), ante: A("gRoom", [GA + 2.9, 2.2, 0.6], 40, -150), door: A("gDoorA", [GA, 3.4, 0.0], -150, -100), press: A("gRoom", [GA - 1.6, 2.8, 0.6], -120, -120),
  dial: A("hRoom", [HXc - 4.4, 4.4, -3.1], -150, 100), wafer: A("hStage", [HXc + 0.2, 1.96, 2.2], -150, 90), spark: A("hSpark", [HXc + 2.95, 2.05, 0.6], 150, -100),
  b0: A("bMod0", [BXc - 5.0, 4.8, 1.8], -120, -100), b1: A("bMod1", [BXc, 4.8, 1.8], 0, -130), b2: A("bMod2", [BXc + 5.0, 4.8, 1.8], 120, -100),
});

const model = {
  name: "示意 無塵室：廠房外觀與屋頂機組、風扇濾網陣列（含拉出的一台：風扇、濾網褶疊、外框）、無塵室與機台、高架孔板地板、回風層與兩側回風豎井；衣櫃大的空氣與十顆灰塵、濾網纖維放大、中性假人與無塵衣、氣閘（前室、風淋、兩道門、壓差表、傳遞窗）、溫濕度儀表與晶圓、三個無塵室模組（示意，非特定廠房）",
  unit: "示意（廠房 1＝約 0.5 m；纖維放大另計）",
  size: { w: 40, h: 18, r: 0.6, t: 30 },
  palette, materials,
  partNames: { ffuArr: "風扇濾網", oneHepa: "濾網", rFloor: "高架地板", subfab: "回風層", suitBody: "無塵衣" },
  layers, parts, anchors, actions,
  pose: { yaw0: 0, yawIso: 0, drift: 0 },
  camera: { stand: { d: 70, elev: 24, y: 4 } },
  fx: { dpr: 1, srcPx: 30, shadows: 0, fog: false, dust: false, vaporSprites: false, shimmer: false },
  info: { YF, YC, YR, ONE, KX, FXC, PX, GA, GB, HXc, BXc, DUST10 },
};
const out = path.join(HERE, "model.json");
fs.writeFileSync(out, JSON.stringify(model, null, 1) + "\n");
console.log(`✔ ${out}：${parts.length} 個零件、${parts.reduce((a, p) => a + Math.max(1, (p.at?.length ?? 0)), 0)} 個實體（含複製）、${layers.length} 層`);

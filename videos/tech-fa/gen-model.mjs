// node videos/tech-fa/gen-model.mjs → 寫 videos/tech-fa/model.json
// 2026/11/28 tech-fa（中游補充篇 M6：材料分析與故障分析）。構造照 physics-spec.md、模組清單照 visual-spec.md。全部放大示意，非特定廠牌／型號。
// 站點（地板頂面 y＝0）：A 故障晶片＋測試板（x 0）｜B 微光顯微鏡探針台（x 30）｜C 聚焦離子束雙束機（x 60）｜D 剖面挖槽＋薄片（x 90）
//   E 穿透式電子顯微鏡（x 120）｜F 成分分析 EDS（x 150）｜G 送出去做（x 180）｜H 台灣實驗室（x 210）｜N 下一集晶圓切割（x 240）
import fs from "node:fs";
import path from "node:path";
const HERE = path.dirname(new URL(import.meta.url).pathname);
const R2 = (x) => Math.round(x * 1000) / 1000;
const D2R = Math.PI / 180;
const palette = {
  floorC: "#C9D2DE", panel: "#F3F5F8", panel2: "#E2E8F0", seam: "#8E9BB0", band: "#24324C", steel: "#7D8CA6", steel2: "#A9B5C7", dark: "#3E4A60", darker: "#2A3142",
  lampY: "#F2B632", lampG: "#2FBF71", lampR: "#E5484D", screen: "#5B8DEF", rubber: "#2B2F36", gold: "#C9A24A", padGold: "#E0B84E", whiteP: "#FFFFFF",
  pcbC: "#2E7D4F", subC: "#3B5A45", dieC: "#4C5E86", siC: "#7C89A6", cuC: "#C8794A", ptC: "#D7DCE4", diC: "#9CC8E8", granC: "#59606B",
  glassC: "#BFD3F2", winC: "#5B8DEF", winD: "#2F4A7A", roofC: "#B6C0CF", hotC: "#FF5A3C", photC: "#F7F06A", eC: "#4FA8FF", ionC: "#B07CF0",
  xSi: "#2F7FE0", xCu: "#E8913C", xCl: "#E5484D", heatC: "#FF8A3D", gridC: "#D08A4A", tungC: "#8B93A3", tapeC: "#BFD8F0", waterC: "#6FB7E8", mirC: "#C9D3E2",
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
  lampY: M("std", "lampY", { emissive: "lampY", ei: 0.45, rough: 0.4, metal: 0 }), lampG: M("std", "lampG", { emissive: "lampG", ei: 0.45, rough: 0.4, metal: 0 }),
  lampR: M("std", "lampR", { emissive: "lampR", ei: 0.4, rough: 0.4, metal: 0 }), screen: M("std", "screen", { emissive: "screen", ei: 0.5, rough: 0.3, metal: 0 }),
  pcb: M("std", "pcbC", { rough: 0.5, metal: 0.1, env: 0.3, tex: "traces", texScale: 0.6 }), sub: M("std", "subC", { rough: 0.45, metal: 0.2, env: 0.4, tex: "traces", texScale: 0.3 }),
  die: M("std", "dieC", { rough: 0.2, metal: 0.6, env: 0.9, tex: "traces", texScale: 0.25 }), si: M("std", "siC", { rough: 0.25, metal: 0.6, env: 0.7 }),
  cu: M("std", "cuC", { rough: 0.25, metal: 0.95, env: 0.9 }), pt: M("std", "ptC", { rough: 0.3, metal: 0.9, env: 0.8 }),
  diel: M("phys", "diC", { rough: 0.1, metal: 0, clearcoat: 1, opacity: 0.45, env: 0.6 }), gran: M("std", "granC", { rough: 0.6, metal: 0.1, env: 0.3, tex: "brushed", texScale: 1.5 }),
  glass: M("phys", "glassC", { rough: 0.05, metal: 0, clearcoat: 1, opacity: 0.3, env: 0.6 }), win: M("std", "winC", { rough: 0.15, metal: 0.4, env: 1.0, emissive: "winC", ei: 0.15 }),
  winD: M("std", "winD", { rough: 0.2, metal: 0.4, env: 0.8 }), roof: M("std", "roofC", { rough: 0.6, metal: 0.3 }), white: M("std", "whiteP", { rough: 0.7, metal: 0 }),
  hot: glowM("hotC", 1, 0.9), heatRing: glowM("heatC", 0.5, 0.8), heatRing2: glowM("heatC", 0.32, 0.6), heatRing3: glowM("heatC", 0.18, 0.45), coil: M("std", "cuC", { rough: 0.35, metal: 0.9, env: 0.6 }), grid: M("std", "gridC", { rough: 0.3, metal: 0.95, env: 0.9 }),
  tung: M("std", "tungC", { rough: 0.2, metal: 0.95, env: 1.0 }), tape: M("phys", "tapeC", { rough: 0.2, metal: 0, clearcoat: 1, opacity: 0.6, env: 0.5 }),
  mirror: M("std", "mirC", { rough: 0.04, metal: 0.95, env: 1.7 }), fin: M("std", "steel", { rough: 0.4, metal: 0.8, env: 0.5 }), water: glowM("waterC", 0.6, 0.5),
  dielO: M("std", "diC", { rough: 0.5, metal: 0.05, env: 0.3 }),
  lead: M("phys", "winD", { rough: 0.05, metal: 0.2, clearcoat: 1, opacity: 0.7, env: 1.0 }),
};
const parts = [], layers = [], anchors = {}, actions = {};
const P = (o) => { parts.push(o); return o; };
const LAY = (id, outline, bg) => layers.push({ id, z: 0, k: 0, outline, ...(bg ? { bg: true } : {}) });
const V = [90, 0, 0];
const BOX = (id, layer, x0, x1, y0, y1, z0, z1, mat, o = {}) => P({ id, layer, shape: "box", size: [R2(x1 - x0), R2(y1 - y0), R2(z1 - z0)], pos: [R2((x0 + x1) / 2), R2((y0 + y1) / 2), R2((z0 + z1) / 2)], mat, ...o });
const VC = (id, layer, R, y0, y1, mat, o = {}) => { const { x = 0, z = 0, ...r } = o; return P({ id, layer, shape: "cyl", size: [R, R2(y1 - y0)], rot: V, pos: [R2(x), R2((y0 + y1) / 2), R2(z)], mat, ...r }); };
const RING = (id, layer, Ro, Ri, y0, y1, mat, x = 0, z = 0) => P({ id, layer, shape: "tube", size: [Ro, Ri, R2(y1 - y0)], rot: V, pos: [R2(x), R2((y0 + y1) / 2), R2(z)], mat });
const SPH = (id, layer, r, x, y, z, mat, o = {}) => P({ id, layer, shape: "sphere", size: [r], pos: [R2(x), R2(y), R2(z)], mat, ...o });
const A = (layer, p, dx, dy) => ({ layer, p: p.map(R2), dx, dy });
// 斜放圓柱：軸方向 (sinθ, cosθ, 0)（θ＝和垂直的夾角，正的往 +x 倒）；c＝中心點
const TC = (id, layer, R, len, c, th, mat, o = {}) => P({ id, layer, shape: "cyl", size: [R, R2(len)], rot: [-90, 0, R2(-th)], pos: c.map(R2), mat, ...o });
const TT = (id, layer, Ro, Ri, len, c, th, mat) => P({ id, layer, shape: "tube", size: [Ro, Ri, R2(len)], rot: [-90, 0, R2(-th)], pos: c.map(R2), mat });
const along = (p0, th, s) => [p0[0] + s * Math.sin(th * D2R), p0[1] + s * Math.cos(th * D2R), p0[2]];
const plinth = (id, layer, x, z, w, d, h = 0.8) => { BOX(`${id}Pl`, layer, x - w / 2, x + w / 2, 0, h, z - d / 2, z + d / 2, "band"); BOX(`${id}PlT`, layer, x - w / 2, x + w / 2, h, h + 0.05, z - d / 2, z + d / 2, "panel2");
  BOX(`${id}Kick`, layer, x - w / 2 - 0.05, x + w / 2 + 0.05, 0, 0.12, z - d / 2 - 0.05, z + d / 2 + 0.05, "darker");
  P({ id: `${id}Bolt`, layer, shape: "cyl", size: [0.1, 0.04], rot: V, pos: [0, R2(h + 0.07), 0], at: [[x - w / 2 + 0.3, 0, z - d / 2 + 0.3], [x + w / 2 - 0.3, 0, z - d / 2 + 0.3], [x - w / 2 + 0.3, 0, z + d / 2 - 0.3], [x + w / 2 - 0.3, 0, z + d / 2 - 0.3]].map((a) => a.map(R2)), mat: "steel" }); return h + 0.05; };
const panelUI = (id, layer, x, y, z, s = 1) => {
  BOX(`${id}Pn`, layer, x - 0.7 * s, x + 0.7 * s, y, y + 1.0 * s, z, z + 0.08, "darker");
  BOX(`${id}Sc`, layer, x - 0.55 * s, x + 0.35 * s, y + 0.35 * s, y + 0.88 * s, z + 0.08, z + 0.1, "screen");
  SPH(`${id}L0`, layer, 0.06 * s, x + 0.52 * s, y + 0.8 * s, z + 0.1, "lampG"); SPH(`${id}L1`, layer, 0.06 * s, x + 0.52 * s, y + 0.64 * s, z + 0.1, "lampY"); SPH(`${id}L2`, layer, 0.06 * s, x + 0.52 * s, y + 0.48 * s, z + 0.1, "lampR");
  P({ id: `${id}Bt`, layer, shape: "cyl", size: [R2(0.06 * s), 0.04], pos: [0, R2(y + 0.17 * s), R2(z + 0.1)], at: [0, 1, 2, 3, 4].map((i) => [R2(x - 0.5 * s + i * 0.22 * s), 0, 0]), mat: "steel2" });
};
const valve = (id, layer, x, y, z) => { BOX(`${id}B`, layer, x - 0.14, x + 0.14, y - 0.12, y + 0.12, z - 0.12, z + 0.12, "steel"); VC(`${id}S`, layer, 0.03, y + 0.12, y + 0.3, "steel2", { x, z });
  RING(`${id}H`, layer, 0.16, 0.12, y + 0.3, y + 0.34, "lampR", x, z); };
const idsOf = (layer) => parts.filter((q) => q.layer === layer).map((q) => q.id);
// 建築：外牆＋接縫＋窗帶＋屋頂機組＋門
const building = (id, layer, x, z, w, d, h, o = {}) => {
  BOX(`${id}B`, layer, x - w / 2, x + w / 2, 0, h, z - d / 2, z + d / 2, o.mat ?? "panel"); BOX(`${id}R`, layer, x - w / 2 - 0.05, x + w / 2 + 0.05, h, h + 0.15, z - d / 2 - 0.05, z + d / 2 + 0.05, "roof");
  const nf = o.floors ?? Math.max(1, Math.floor(h / 1.4));
  P({ id: `${id}Win`, layer, shape: "box", size: [R2(w - 0.6), 0.45, 0.03], pos: [x, 0, R2(z + d / 2 + 0.015)], at: Array.from({ length: nf }, (_, i) => [0, R2(1.0 + i * (h - 1.2) / Math.max(1, nf - 0.4)), 0]).filter((a) => a[1] < h - 0.4), mat: o.glassy ? "winD" : "win" });
  P({ id: `${id}Sm`, layer, shape: "box", size: [0.04, R2(h), 0.04], pos: [0, R2(h / 2), R2(z + d / 2 + 0.02)], at: Array.from({ length: Math.floor(w / 1.2) }, (_, i) => [R2(x - w / 2 + 0.6 + i * 1.2), 0, 0]), mat: "seam" });
  P({ id: `${id}Ac`, layer, shape: "box", size: [0.9, 0.5, 0.7], pos: [0, R2(h + 0.4), R2(z - d / 4)], at: Array.from({ length: Math.max(1, Math.floor(w / 2.2)) }, (_, i) => [R2(x - w / 2 + 1.1 + i * 2.2), 0, 0]), mat: "steel2" });
  P({ id: `${id}AcF`, layer, shape: "cyl", size: [0.25, 0.04], rot: V, pos: [0, R2(h + 0.67), R2(z - d / 4)], at: Array.from({ length: Math.max(1, Math.floor(w / 2.2)) }, (_, i) => [R2(x - w / 2 + 1.1 + i * 2.2), 0, 0]), mat: "darker" });
  BOX(`${id}Dr`, layer, x - 0.5, x + 0.5, 0, 1.0, z + d / 2, z + d / 2 + 0.03, "dark"); BOX(`${id}Cn`, layer, x - 0.8, x + 0.8, 1.05, 1.15, z + d / 2, z + d / 2 + 0.6, "steel2");
};

// ═════ 地板 ═════
LAY("floor", [300, 2, 120, 0], true);
P({ id: "floor", layer: "floor", shape: "slab", size: [300, 0.5, 44], r: 0.2, pos: [120, -0.25, 0], mat: "floor" });
P({ id: "floorSeam", layer: "floor", shape: "slab", size: [300, 0.04, 0.1], pos: [120, 0.01, 0], at: Array.from({ length: 7 }, (_, i) => [0, 0, R2(-16 + i * 5.3)]), mat: "seam" });

// ═════ 站 A：故障晶片插在測試板上（x 0）＋後方實驗室小樓 ═════
const AX = 0;
LAY("aBase", [9, 1, AX, 0.5]);
const AH = plinth("a", "aBase", AX, 0, 8.6, 6.6, 0.8);
LAY("aBoard", [8, 1.2, AX, AH + 0.4]);
const PB = AH + 0.1, PT = PB + 0.16;
P({ id: "aSpacer", layer: "aBoard", shape: "cyl", size: [0.14, 0.1], rot: V, pos: [0, R2(AH + 0.05), 0], at: [[-3.5, 0, -2.6], [3.5, 0, -2.6], [-3.5, 0, 2.6], [3.5, 0, 2.6]].map(([x, y, z]) => [R2(AX + x), y, z]), mat: "steel" });
BOX("aPcb", "aBoard", AX - 3.8, AX + 3.8, PB, PT, -2.9, 2.9, "pcb");
P({ id: "aScrew", layer: "aBoard", shape: "cyl", size: [0.12, 0.05], rot: V, pos: [0, R2(PT + 0.02), 0], at: [[-3.5, 0, -2.6], [3.5, 0, -2.6], [-3.5, 0, 2.6], [3.5, 0, 2.6]].map(([x, y, z]) => [R2(AX + x), y, z]), mat: "steel2" });
P({ id: "aFinger", layer: "aBoard", shape: "box", size: [0.14, 0.02, 0.5], pos: [0, R2(PT + 0.01), 2.62], at: Array.from({ length: 22 }, (_, i) => [R2(AX - 3.15 + i * 0.3), 0, 0]), mat: "padGold" });
P({ id: "aPad", layer: "aBoard", shape: "box", size: [0.12, 0.02, 0.12], pos: [0, R2(PT + 0.01), 0], at: (() => { const a = []; for (let i = 0; i < 10; i++) for (let j = 0; j < 4; j++) a.push([R2(AX + 2.1 + (i % 5) * 0.28), 0, R2(-2.3 + j * 0.28 + Math.floor(i / 5) * 1.4)]); return a; })(), mat: "padGold" });
P({ id: "aVia", layer: "aBoard", shape: "cyl", size: [0.05, 0.03], rot: V, pos: [0, R2(PT + 0.01), 0], at: Array.from({ length: 30 }, (_, i) => [R2(AX - 3.2 + (i % 10) * 0.32), 0, R2(-2.2 + Math.floor(i / 10) * 0.4)]), mat: "gold" });
P({ id: "aCap", layer: "aBoard", shape: "box", size: [0.22, 0.12, 0.12], pos: [0, R2(PT + 0.06), 0], at: Array.from({ length: 14 }, (_, i) => [R2(AX - 2.2 + (i % 7) * 0.32), 0, R2(1.3 + Math.floor(i / 7) * 0.45)]), mat: "dark" });
P({ id: "aCapE", layer: "aBoard", shape: "box", size: [0.05, 0.13, 0.13], pos: [0, R2(PT + 0.065), 0], at: Array.from({ length: 28 }, (_, i) => { const k = i >> 1; return [R2(AX - 2.2 + (k % 7) * 0.32 + (i % 2 ? 0.1 : -0.1)), 0, R2(1.3 + Math.floor(k / 7) * 0.45)]; }), mat: "steel2" });
BOX("aConn", "aBoard", AX - 3.6, AX - 2.6, PT, PT + 0.45, 0.3, 1.9, "darker");
P({ id: "aConnPin", layer: "aBoard", shape: "box", size: [0.06, 0.06, 0.06], pos: [0, R2(PT + 0.47), 0], at: Array.from({ length: 16 }, (_, i) => [R2(AX - 3.4 + (i % 4) * 0.2), 0, R2(0.5 + Math.floor(i / 4) * 0.35)]), mat: "gold" });
// 測試座（框＋四顆壓蓋螺絲）
const SKX = AX + 0.2, SKZ = -0.6;
P({ id: "aSock", layer: "aBoard", shape: "ring", size: [3.0, 3.0, 0.35], wall: 0.35, r: 0.08, rot: [-90, 0, 0], pos: [SKX, R2(PT + 0.17), SKZ], mat: "darker" });
P({ id: "aSockS", layer: "aBoard", shape: "cyl", size: [0.09, 0.06], rot: V, pos: [0, R2(PT + 0.38), 0], at: [[-1.3, 0, -1.3], [1.3, 0, -1.3], [-1.3, 0, 1.3], [1.3, 0, 1.3]].map(([x, y, z]) => [R2(SKX + x), y, R2(SKZ + z)]), mat: "steel2" });
// 晶片：載板（走線）＋錫球＋上蓋＋印字
LAY("aChip", [2.6, 0.8, SKX, PT + 0.4]);
const CB = PT + 0.12;
P({ id: "aBall", layer: "aChip", shape: "sphere", size: [0.07], pos: [0, R2(CB - 0.03), 0], at: (() => { const a = []; for (let i = 0; i < 9; i++) for (let j = 0; j < 9; j++) a.push([R2(SKX - 0.96 + i * 0.24), 0, R2(SKZ - 0.96 + j * 0.24)]); return a; })(), mat: "steel2" });
BOX("aSub", "aChip", SKX - 1.2, SKX + 1.2, CB, CB + 0.12, SKZ - 1.2, SKZ + 1.2, "sub");
BOX("aLid", "aChip", SKX - 0.9, SKX + 0.9, CB + 0.12, CB + 0.32, SKZ - 0.9, SKZ + 0.9, "steel2");
BOX("aMark", "aChip", SKX - 0.6, SKX + 0.6, CB + 0.32, CB + 0.325, SKZ - 0.2, SKZ + 0.3, "white");
P({ id: "aSubCap", layer: "aChip", shape: "box", size: [0.12, 0.06, 0.07], pos: [0, R2(CB + 0.15), 0], at: Array.from({ length: 8 }, (_, i) => [R2(SKX - 0.84 + i * 0.24), 0, R2(SKZ + 1.06)]), mat: "dark" });
LAY("aFail", [2, 0.4, SKX, CB + 0.35]);
BOX("aFailG", "aFail", SKX - 0.92, SKX + 0.92, CB + 0.33, CB + 0.36, SKZ - 0.92, SKZ + 0.92, "lampR");
actions.aFailGlow = { type: "pulse", _說明: "晶片故障：上蓋紅光閃（示意，不是燒起來）", parts: ["aFailG"], color: "lampR", glow: 0.8, freq: 1.2, halo: 0 };
// 後方實驗室小樓＋送樣箭頭
LAY("aLab", [9, 6, AX + 1, 3]);
building("aLabH", "aLab", AX + 1, -11, 8, 4, 4.2, { floors: 2 });
actions.aSend = { free: true, type: "flow", _說明: "故障晶片送去第三方實驗室（地面路線，到位才出現）", path: [[SKX, PT + 0.8, SKZ - 1.4], [AX + 0.6, 0.3, -5.5], [AX + 1, 0.3, -8.6]].map((a) => a.map(R2)), n: 4, size: 0.3, shape: "arrow", rate: 0.6, track: true, color: "lampG", layer: "aLab" };

// ═════ 站 B：微光顯微鏡探針台（x 30）═════
const BX = 30;
LAY("bTable", [10, 4, BX, 1.5]);
// 防震台：花崗岩台面＋四支氣墊腳
const GT = 2.2;
P({ id: "bLeg", layer: "bTable", shape: "box", size: [0.6, 1.6, 0.6], pos: [0, 0.8, 0], at: [[-3.6, 0, -2.2], [3.6, 0, -2.2], [-3.6, 0, 2.2], [3.6, 0, 2.2]].map(([x, y, z]) => [R2(BX + x), y, z]), mat: "band" });
P({ id: "bIso", layer: "bTable", shape: "cyl", size: [0.38, 0.4], rot: V, pos: [0, 1.8, 0], at: [[-3.6, 0, -2.2], [3.6, 0, -2.2], [-3.6, 0, 2.2], [3.6, 0, 2.2]].map(([x, y, z]) => [R2(BX + x), y, z]), mat: "rubber" });
BOX("bGran", "bTable", BX - 4.4, BX + 4.4, 2.0, GT, -3.0, 3.0, "gran");
// XY 載台：兩層滑座＋導軌＋旋鈕
BOX("bRailX", "bTable", BX - 2.2, BX + 2.2, GT, GT + 0.12, -0.9, -0.7, "steel2"); BOX("bRailX2", "bTable", BX - 2.2, BX + 2.2, GT, GT + 0.12, 0.7, 0.9, "steel2");
BOX("bSlideX", "bTable", BX - 1.6, BX + 1.6, GT + 0.12, GT + 0.4, -1.2, 1.2, "dark");
BOX("bRailY", "bTable", BX - 1.1, BX - 0.9, GT + 0.4, GT + 0.5, -1.2, 1.2, "steel2"); BOX("bRailY2", "bTable", BX + 0.9, BX + 1.1, GT + 0.4, GT + 0.5, -1.2, 1.2, "steel2");
BOX("bSlideY", "bTable", BX - 1.3, BX + 1.3, GT + 0.5, GT + 0.75, -1.0, 1.0, "steel");
P({ id: "bKnob", layer: "bTable", shape: "cyl", size: [0.16, 0.2], pos: [0, R2(GT + 0.3), 0], at: [[R2(BX + 1.75), 0, 0], [R2(BX), 0, 1.35]], rot: [0, 90, 0], mat: "darker" });
const CHY = GT + 0.75;
VC("bChuck", "bTable", 1.0, CHY, CHY + 0.2, "steel2", { x: BX });
[0.3, 0.55, 0.8].forEach((r, i) => RING(`bGroove${i}`, "bTable", r + 0.03, r, CHY + 0.2, CHY + 0.205, "darker", BX, 0));
// 開蓋晶片：載板＋晶粒（走線）＋周圍銲墊
const DY0 = CHY + 0.2;
BOX("bSub", "bTable", BX - 0.7, BX + 0.7, DY0, DY0 + 0.08, -0.7, 0.7, "sub");
BOX("bDie", "bTable", BX - 0.45, BX + 0.45, DY0 + 0.08, DY0 + 0.13, -0.45, 0.45, "die");
P({ id: "bBondPad", layer: "bTable", shape: "box", size: [0.07, 0.01, 0.07], pos: [0, R2(DY0 + 0.135), 0], at: Array.from({ length: 24 }, (_, i) => { const s = Math.floor(i / 6), u = -0.3 + (i % 6) * 0.12; return s === 0 ? [R2(BX + u), 0, -0.38] : s === 1 ? [R2(BX + u), 0, 0.38] : s === 2 ? [R2(BX - 0.38), 0, R2(u)] : [R2(BX + 0.38), 0, R2(u)]; }), mat: "padGold" });
const HSX = BX + 0.1, HSY = DY0 + 0.14, HSZ = 0.08;
LAY("bHot", [1.6, 0.3, HSX, HSY]);
SPH("bHotS", "bHot", 0.06, HSX, HSY, HSZ, "hot");
[0.12, 0.2, 0.28].forEach((r, i) => RING(`bHR${i}`, "bHot", r + 0.015, r, HSY, HSY + 0.004, ["heatRing", "heatRing2", "heatRing3"][i], HSX, HSZ));
actions.bHotGlow = { type: "pulse", _說明: "通電：缺陷處發出微弱的光（熱點小球由暗變亮）", parts: ["bHotS"], color: "hotC", glow: 1, freq: 1.6, halo: 0 };
[0, 1, 2].forEach((i) => { actions[`bHeat${i}`] = { type: "pulse", _說明: "熱從熱點往外擴散：三圈由內往外錯開 6 幀依序亮、越外越淡", parts: [`bHR${i}`], color: "heatC", glow: [0.8, 0.55, 0.35][i], freq: 1.0, halo: 0 }; });
// 4 支微調探針座：磁性底座（紅色開關鈕）＋本體＋X／Y／Z 三個測微頭（套筒＋刻度環）＋懸臂＋針座夾＋鎢針＋線纜
// 針尖落在晶粒邊的銲墊上；懸臂、針座夾、鎢針是獨立一層 bTips（念到「通電」前下降 0.3 停住）
LAY("bProbes", [6, 2, BX, CHY + 0.8]); LAY("bTips", [2, 0.6, BX, DY0 + 0.4]);
const PROBE = [[-2.6, -1.4, 1], [2.6, -1.4, -1], [-2.6, 1.4, 1], [2.6, 1.4, -1]];
const TIPY = DY0 + 0.14, AY = TIPY + 0.25;
PROBE.forEach(([dx, dz, sg], i) => { const px = BX + dx, pz = dz;
  BOX(`bPmMag${i}`, "bProbes", px - 0.55, px + 0.55, GT, GT + 0.3, pz - 0.45, pz + 0.45, "darker");
  P({ id: `bPmSw${i}`, layer: "bProbes", shape: "cyl", size: [0.08, 0.1], pos: [R2(px), R2(GT + 0.15), R2(pz + (pz > 0 ? 0.47 : -0.47))], mat: "lampR" });
  BOX(`bPm${i}`, "bProbes", px - 0.32, px + 0.32, GT + 0.3, AY - 0.06, pz - 0.3, pz + 0.3, "steel");
  P({ id: `bPmSeam${i}`, layer: "bProbes", shape: "box", size: [0.66, 0.03, 0.62], pos: [R2(px), 0, R2(pz)], at: [[0, R2(GT + 0.62), 0], [0, R2(GT + 0.9), 0]], mat: "seam" });
  // X 測微頭（沿 x、朝外）、Y 測微頭（沿 z、朝外）、Z 測微頭（頂上直立）：套筒＋刻度環＋端蓋
  P({ id: `bMx${i}`, layer: "bProbes", shape: "cyl", size: [0.08, 0.5], rot: [0, 90, 0], pos: [R2(px - sg * 0.57), R2(GT + 0.75), R2(pz)], mat: "steel2" });
  P({ id: `bMxT${i}`, layer: "bProbes", shape: "tube", size: [0.12, 0.08, 0.2], rot: [0, 90, 0], pos: [R2(px - sg * 0.75), R2(GT + 0.75), R2(pz)], mat: "darker" });
  const zo = pz > 0 ? 1 : -1;
  P({ id: `bMy${i}`, layer: "bProbes", shape: "cyl", size: [0.08, 0.5], pos: [R2(px), R2(GT + 0.5), R2(pz + zo * 0.55)], mat: "steel2" });
  P({ id: `bMyT${i}`, layer: "bProbes", shape: "tube", size: [0.12, 0.08, 0.2], pos: [R2(px), R2(GT + 0.5), R2(pz + zo * 0.72)], mat: "darker" });
  VC(`bMz${i}`, "bProbes", 0.08, AY - 0.06, AY + 0.4, "steel2", { x: px - sg * 0.15, z: pz }); RING(`bMzT${i}`, "bProbes", 0.12, 0.08, AY + 0.22, AY + 0.42, "darker", px - sg * 0.15, pz);
  const Tx = BX - sg * 0.38, Tz = pz * 0.22, Ex = Tx - sg * 0.43, Ey = AY;
  const ax = px + sg * 0.32, L1 = Math.hypot(Ex - ax, Tz - pz);
  P({ id: `bArm${i}`, layer: "bTips", shape: "box", size: [R2(L1), 0.08, 0.1], pos: [R2((ax + Ex) / 2), R2(Ey), R2((pz + Tz) / 2)], rot: [0, R2(-Math.atan2(Tz - pz, Ex - ax) / D2R), 0], mat: "steel" });
  BOX(`bClamp${i}`, "bTips", Ex - 0.09, Ex + 0.09, Ey - 0.09, Ey + 0.09, Tz - 0.09, Tz + 0.09, "gold");
  TC(`bNdl${i}`, "bTips", 0.014, 0.5, [(Tx + Ex) / 2, (TIPY + Ey) / 2, Tz], -sg * 60, "tung");
  P({ id: `bPmC${i}`, layer: "bProbes", shape: "cyl", size: [0.04, 1.4], pos: [R2(px + sg * 0.1), R2(GT + 0.6), R2(pz + zo * 1.2)], mat: "rubber" }); });
// 顯微鏡：龍門＋對焦箱＋物鏡轉盤＋鏡筒＋冷卻相機
LAY("bScope", [5, 6, BX, GT + 3.2]);
BOX("bBridgeL", "bScope", BX - 3.0, BX - 2.7, GT, GT + 5.0, -2.6, -2.2, "steel2"); BOX("bBridgeR", "bScope", BX + 2.7, BX + 3.0, GT, GT + 5.0, -2.6, -2.2, "steel2");
BOX("bBridgeT", "bScope", BX - 3.0, BX + 3.0, GT + 5.0, GT + 5.4, -2.7, -2.1, "steel2");
BOX("bFocus", "bScope", BX - 0.6, BX + 0.6, GT + 2.9, GT + 4.6, -1.0, -0.2, "dark");
P({ id: "bFocusK", layer: "bScope", shape: "cyl", size: [0.28, 0.12], pos: [0, R2(GT + 3.4), -0.6], at: [[R2(BX - 0.68), 0, 0], [R2(BX + 0.68), 0, 0]], rot: [0, 90, 0], mat: "darker" });
BOX("bFocusArm", "bScope", BX - 0.25, BX + 0.25, GT + 4.4, GT + 4.7, -2.2, -0.9, "steel");
VC("bTube", "bScope", 0.32, GT + 2.4, GT + 5.4, "panel", { x: BX, z: 0 });
VC("bTurret", "bScope", 0.55, GT + 2.15, GT + 2.4, "steel2", { x: BX, z: 0 });
P({ id: "bObj", layer: "bScope", shape: "cyl", size: [0.13, 0.5], rot: V, pos: [0, R2(GT + 1.9), 0], at: [[R2(BX), 0, 0], [R2(BX + 0.38), 0, 0.15], [R2(BX - 0.38), 0, 0.15], [R2(BX), 0, -0.38]], mat: "steel" });
RING("bObjR", "bScope", 0.14, 0.1, GT + 1.82, GT + 1.86, "lampR", BX, 0);
BOX("bCam", "bScope", BX - 0.55, BX + 0.55, GT + 5.4, GT + 6.4, -0.55, 0.55, "darker");
P({ id: "bCamFin", layer: "bScope", shape: "box", size: [0.04, 0.8, 1.0], pos: [0, R2(GT + 5.9), 0], at: [0, 1, 2, 3, 4, 5].map((i) => [R2(BX - 0.5 + i * 0.2), 0, 0]), mat: "fin" });
BOX("bCamTag", "bScope", BX - 0.3, BX + 0.3, GT + 5.6, GT + 5.8, 0.55, 0.57, "white");
P({ id: "bCamCab", layer: "bScope", shape: "cyl", size: [0.05, 2.0], pos: [R2(BX), R2(GT + 6.1), -1.5], mat: "rubber" });
// 電源量表（右邊地上）
LAY("bSmu", [3, 2.6, BX + 6.4, 1.3]);
BOX("bSmuB", "bSmu", BX + 5.2, BX + 7.6, 0, 2.4, -1.2, 1.0, "band"); panelUI("bSmuUi", "bSmu", BX + 6.4, 1.1, 1.0, 0.85);
P({ id: "bSmuJ", layer: "bSmu", shape: "cyl", size: [0.08, 0.06], pos: [0, 0.6, 1.03], at: [0, 1, 2, 3].map((i) => [R2(BX + 5.7 + i * 0.35), 0, 0]), mat: "gold" });
P({ id: "bSmuCab", layer: "bSmu", shape: "cyl", size: [0.05, R2(1.6)], pos: [R2(BX + 4.6), 0.6, 0.5], rot: [0, 90, 0], mat: "rubber" });
// 暗箱：後牆＋頂＋左右門（爆炸＝門繞鉸鏈往外打開）
LAY("bBoxBack", [10, 7, BX, 5]);
BOX("bBoxB", "bBoxBack", BX - 4.6, BX + 4.6, GT, GT + 7.0, -3.3, -3.1, "darker"); BOX("bBoxT", "bBoxBack", BX - 4.6, BX + 4.6, GT + 7.0, GT + 7.2, -3.3, 3.2, "glass"); P({ id: "bBoxTF", layer: "bBoxBack", shape: "box", size: [9.2, 0.25, 0.2], pos: [BX, R2(GT + 7.1), 0], at: [[0, 0, -3.2], [0, 0, 3.1]], mat: "darker" });
for (const [id, sx] of [["bDoorL", -1], ["bDoorR", 1]]) { LAY(id, [5, 7, BX + sx * 2.3, GT + 3.5]);
  const x0 = sx < 0 ? BX - 4.6 : BX, x1 = sx < 0 ? BX : BX + 4.6;
  BOX(`${id}P`, id, x0, x1, GT, GT + 7.0, 3.1, 3.25, "dark");
  P({ id: `${id}Rib`, layer: id, shape: "box", size: [R2(x1 - x0 - 0.3), 0.06, 0.04], pos: [R2((x0 + x1) / 2), 0, 3.27], at: [1.5, 3.5, 5.5].map((y) => [0, R2(GT + y), 0]), mat: "seam" });
  BOX(`${id}H`, id, BX + sx * 0.4 - 0.06, BX + sx * 0.4 + 0.06, GT + 3.0, GT + 4.0, 3.25, 3.4, "steel2");
  P({ id: `${id}Hg`, layer: id, shape: "cyl", size: [0.08, 0.5], rot: V, pos: [R2(BX + sx * 4.62), 0, 3.2], at: [[0, R2(GT + 1.0), 0], [0, R2(GT + 6.0), 0]], mat: "steel" });
  actions[`${id}Open`] = { type: "rotate", _說明: "暗箱門繞外側鉸鏈往外打開（加減速）；until 後關回", parts: idsOf(id), axis: [0, 1, 0], pivot: [R2(BX + sx * 4.62), R2(GT + 3.5), 3.2], angle: R2(sx * 105) }; }
actions.bPhot = { free: true, type: "flow", _說明: "光子從熱點直線往上進物鏡（等速；光速示意）", path: [[HSX, HSY + 0.05, HSZ], [BX, GT + 1.66, 0]].map((a) => a.map(R2)), n: 8, size: 0.035, shape: "dot", rate: 0.9, track: false, color: "photC", layer: "bHot", lanes: 3, laneGap: 0.03, laneDir: [1, 0, 0] };

// ═════ 站 C：聚焦離子束雙束機（x 60）═════
const CX = 60;
LAY("cBase", [10, 3, CX, 1.2]);
P({ id: "cLeg", layer: "cBase", shape: "box", size: [0.5, 1.4, 0.5], pos: [0, 0.7, 0], at: [[-2.8, 0, -2.4], [2.8, 0, -2.4], [-2.8, 0, 2.4], [2.8, 0, 2.4]].map(([x, y, z]) => [R2(CX + x), y, z]), mat: "band" });
BOX("cFrame", "cBase", CX - 3.2, CX + 3.2, 1.4, 1.7, -2.8, 2.8, "steel");
// 渦輪泵（腔體下）
VC("cTurbo", "cBase", 0.6, 0.2, 1.4, "steel2", { x: CX + 1.4, z: -1.2 });
P({ id: "cTurboFin", layer: "cBase", shape: "tube", size: [0.68, 0.6, 0.05], rot: V, pos: [R2(CX + 1.4), 0, -1.2], at: [0, 1, 2, 3, 4].map((i) => [0, R2(0.35 + i * 0.2), 0]), mat: "fin" });
// 真空腔：方腔＋壁面法蘭圓口＋螺栓
LAY("cChamber", [7, 5, CX, 3.8]);
const KY0 = 1.7, KY1 = 5.4, KX0 = CX - 2.6, KX1 = CX + 2.6, KZ0 = -2.4, KZ1 = 2.2;
BOX("cChB", "cChamber", KX0, KX1, KY0, KY1, KZ0, KZ0 + 0.3, "steel2"); BOX("cChL", "cChamber", KX0, KX0 + 0.3, KY0, KY1, KZ0, KZ1, "steel2");
BOX("cChR", "cChamber", KX1 - 0.3, KX1, KY0, KY1, KZ0, KZ1, "steel2"); BOX("cChT", "cChamber", KX0, KX1, KY1 - 0.3, KY1, KZ0, KZ1, "steel"); BOX("cChF", "cChamber", KX0, KX1, KY0, KY0 + 0.3, KZ0, KZ1, "steel");
P({ id: "cPort", layer: "cChamber", shape: "cyl", size: [0.42, 0.16], pos: [0, 0, 0], rot: [0, 90, 0], at: [[KX0 - 0.08, 3.0, -0.8], [KX0 - 0.08, 4.4, 0.8], [KX1 + 0.08, 2.6, 0.6], [KX1 + 0.08, 4.4, -1.0]].map((a) => a.map(R2)), mat: "steel" });
P({ id: "cPortW", layer: "cChamber", shape: "cyl", size: [0.24, 0.2], pos: [0, 0, 0], rot: [0, 90, 0], at: [[KX0 - 0.1, 3.0, -0.8], [KX1 + 0.1, 2.6, 0.6]].map((a) => a.map(R2)), mat: "lead" });
P({ id: "cPortB", layer: "cChamber", shape: "cyl", size: [0.04, 0.2], pos: [0, 0, 0], rot: [0, 90, 0], at: [[KX0 - 0.1, 3.0, -0.8], [KX0 - 0.1, 4.4, 0.8], [KX1 + 0.1, 2.6, 0.6], [KX1 + 0.1, 4.4, -1.0]].flatMap(([x, y, z]) => [0, 60, 120, 180, 240, 300].map((d) => [R2(x), R2(y + 0.34 * Math.cos(d * D2R)), R2(z + 0.34 * Math.sin(d * D2R))])), mat: "steel2" });
// 離子泵（左側掛著）
BOX("cIonP", "cChamber", KX0 - 1.2, KX0 - 0.3, 3.6, 5.0, -1.8, -0.6, "band"); P({ id: "cIonPFin", layer: "cChamber", shape: "box", size: [0.04, 1.2, 1.1], pos: [0, 4.3, -1.2], at: [0, 1, 2, 3].map((i) => [R2(KX0 - 1.1 + i * 0.22), 0, 0]), mat: "fin" });
// 樣品台：底座＋傾斜架＋樣品座＋晶片
const SY = 3.1, SPX = CX, SPZ = -0.2;
// 樣品台：底座＋雙層滑座（各兩條導軌）＋刻度旋轉台＋ U 形傾斜托架（兩側立板＋傾斜軸）
BOX("cStgB", "cChamber", SPX - 1.3, SPX + 1.3, KY0 + 0.3, KY0 + 0.45, SPZ - 1.1, SPZ + 1.1, "dark");
P({ id: "cStgR1", layer: "cChamber", shape: "box", size: [2.4, 0.06, 0.1], pos: [SPX, R2(KY0 + 0.48), 0], at: [[0, 0, R2(SPZ - 0.7)], [0, 0, R2(SPZ + 0.7)]], mat: "steel2" });
BOX("cStgS1", "cChamber", SPX - 1.0, SPX + 1.0, KY0 + 0.51, KY0 + 0.68, SPZ - 0.95, SPZ + 0.95, "steel");
P({ id: "cStgR2", layer: "cChamber", shape: "box", size: [0.1, 0.06, 1.8], pos: [0, R2(KY0 + 0.71), R2(SPZ)], at: [[R2(SPX - 0.6), 0, 0], [R2(SPX + 0.6), 0, 0]], mat: "steel2" });
BOX("cStgS2", "cChamber", SPX - 0.85, SPX + 0.85, KY0 + 0.74, KY0 + 0.9, SPZ - 0.85, SPZ + 0.85, "steel");
VC("cStgRot", "cChamber", 0.8, KY0 + 0.9, KY0 + 1.02, "steel2", { x: SPX, z: SPZ });
P({ id: "cStgTick", layer: "cChamber", shape: "box", size: [0.03, 0.02, 0.1], pos: [0, R2(KY0 + 1.03), 0], at: Array.from({ length: 24 }, (_, k) => [R2(SPX + 0.72 * Math.cos(k * 15 * D2R)), 0, R2(SPZ + 0.72 * Math.sin(k * 15 * D2R))]), mat: "darker" });
BOX("cStgU", "cChamber", SPX - 0.75, SPX + 0.75, KY0 + 1.02, KY0 + 1.12, SPZ - 0.45, SPZ + 0.45, "dark");
P({ id: "cStgCr", layer: "cChamber", shape: "box", size: [0.12, R2(SY - 0.15 - KY0 - 1.12), 0.9], pos: [0, R2((SY - 0.15 + KY0 + 1.12) / 2), R2(SPZ)], at: [[R2(SPX - 0.7), 0, 0], [R2(SPX + 0.7), 0, 0]], mat: "dark" });
P({ id: "cStgAx", layer: "cChamber", shape: "cyl", size: [0.1, 1.7], rot: [0, 90, 0], pos: [SPX, R2(SY - 0.25), R2(SPZ)], mat: "steel2" });
BOX("cStgTop", "cChamber", SPX - 0.6, SPX + 0.6, SY - 0.2, SY - 0.1, SPZ - 0.6, SPZ + 0.6, "steel");
VC("cStub", "cChamber", 0.6, SY - 0.1, SY + 0.12, "steel2", { x: SPX, z: SPZ });
BOX("cSample", "cChamber", SPX - 0.35, SPX + 0.35, SY + 0.12, SY + 0.2, SPZ - 0.35, SPZ + 0.35, "die");
const HIT = [SPX, SY + 0.2, SPZ];
// 前門：門板＋觀察窗＋窗框＋把手＋鉸鏈（爆炸：繞左鉸鏈打開）
LAY("cDoor", [5.4, 3.8, CX, 3.6]);
BOX("cDoorP", "cDoor", KX0, KX1, KY0 + 0.3, KY1 - 0.3, KZ1, KZ1 + 0.18, "steel");
BOX("cDoorWin", "cDoor", CX - 1.0, CX + 1.0, 2.8, 4.3, KZ1 + 0.18, KZ1 + 0.22, "lead");
P({ id: "cDoorWF", layer: "cDoor", shape: "ring", size: [2.2, 1.7, 0.08], wall: 0.12, pos: [CX, 3.55, R2(KZ1 + 0.25)], mat: "dark" });
P({ id: "cDoorBolt", layer: "cDoor", shape: "cyl", size: [0.05, 0.05], pos: [0, 0, R2(KZ1 + 0.21)], at: [...[0, 1, 2, 3, 4, 5, 6].map((i) => [R2(KX0 + 0.3 + i * 0.77), R2(KY1 - 0.45), 0]), ...[0, 1, 2, 3, 4, 5, 6].map((i) => [R2(KX0 + 0.3 + i * 0.77), R2(KY0 + 0.45), 0])], mat: "steel2" });
BOX("cDoorH", "cDoor", KX1 - 0.6, KX1 - 0.45, 2.9, 4.2, KZ1 + 0.18, KZ1 + 0.4, "darker");
P({ id: "cDoorHg", layer: "cDoor", shape: "cyl", size: [0.08, 0.5], rot: V, pos: [R2(KX0 - 0.02), 0, R2(KZ1 + 0.1)], at: [[0, 2.4, 0], [0, 4.8, 0]], mat: "steel" });
actions.cDoorOpen = { type: "rotate", _說明: "前門繞左側鉸鏈打開（加減速）；until 後關回", parts: idsOf("cDoor"), axis: [0, 1, 0], pivot: [R2(KX0 - 0.02), 3.6, R2(KZ1 + 0.1)], angle: -100 };
// 電子束鏡筒（直立）：分段圓筒＋法蘭環＋線圈罩＋頂部高壓線
LAY("cEcol", [2, 6, SPX, KY1 + 2.6]);
const EB = KY1, ET = KY1 + 5.0;
[[EB, EB + 1.4, 0.55, "steel2"], [EB + 1.4, EB + 2.6, 0.7, "dark"], [EB + 2.6, EB + 3.8, 0.55, "steel2"], [EB + 3.8, ET, 0.62, "panel"]].forEach(([a, b, r, m], i) => VC(`cE${i}`, "cEcol", r, a, b, m, { x: SPX, z: SPZ }));
[EB + 1.4, EB + 2.6, EB + 3.8].forEach((y, i) => RING(`cEF${i}`, "cEcol", 0.82, 0.5, y - 0.06, y + 0.06, "steel", SPX, SPZ));
P({ id: "cECoilR", layer: "cEcol", shape: "box", size: [0.12, 0.9, 0.12], pos: [0, R2(EB + 2.0), 0], at: [0, 90, 180, 270].map((d) => [R2(SPX + 0.72 * Math.cos(d * D2R)), 0, R2(SPZ + 0.72 * Math.sin(d * D2R))]), mat: "coil" });
VC("cECap", "cEcol", 0.4, ET, ET + 0.3, "darker", { x: SPX, z: SPZ }); VC("cEHv", "cEcol", 0.09, ET + 0.3, ET + 1.4, "rubber", { x: SPX, z: SPZ });
VC("cETip", "cEcol", 0.2, EB - 0.6, EB, "steel", { x: SPX, z: SPZ });
// 離子束鏡筒（往 −x 斜 52°）：分段環＋鎵離子源頂蓋
const ITH = -52, IL0 = 1.6, IL1 = 6.2;
LAY("cIcol", [4, 5, SPX - 2.8, KY1 + 1.6]);
const ip = (s) => along(HIT, ITH, s);
TC("cIBody", "cIcol", 0.48, IL1 - IL0, ip((IL0 + IL1) / 2), ITH, "steel2");
TC("cITip", "cIcol", 0.18, 0.8, ip(IL0 - 0.4 + 0.0), ITH, "steel");
[IL0 + 0.9, IL0 + 2.2, IL0 + 3.4].forEach((s, i) => TT(`cIF${i}`, "cIcol", 0.66, 0.46, 0.12, ip(s), ITH, "steel"));
TT("cICoil", "cIcol", 0.58, 0.48, 0.7, ip(IL0 + 1.55), ITH, "coil");
TC("cIGa", "cIcol", 0.38, 0.5, ip(IL1 + 0.25), ITH, "lampY");
TC("cIGaC", "cIcol", 0.08, 1.0, ip(IL1 + 1.0), ITH, "rubber");
// 白金氣體注入針（右側斜插）
LAY("cGis", [3, 1, SPX + 2.0, SY + 1.2]);
TC("cGisN", "cGis", 0.04, 2.0, along([SPX + 0.3, SY + 0.45, SPZ], 60, 1.0), 60, "tung");
TC("cGisB", "cGis", 0.25, 1.2, along([SPX + 0.3, SY + 0.45, SPZ], 60, 2.6), 60, "steel2");
BOX("cGisH", "cGis", SPX + 2.8, SPX + 3.4, SY + 1.6, SY + 2.2, SPZ - 0.3, SPZ + 0.3, "darker"); valve("cGisV", "cGis", SPX + 3.1, SY + 2.45, SPZ);
// 控制台（右邊地上）：桌＋雙螢幕
LAY("cCon", [4, 4, CX + 6.4, 2]);
BOX("cDesk", "cCon", CX + 4.6, CX + 8.2, 0, 1.6, -1.2, 1.2, "band"); BOX("cDeskT", "cCon", CX + 4.5, CX + 8.3, 1.6, 1.7, -1.3, 1.3, "panel2");
for (const [i, x] of [[0, CX + 5.5], [1, CX + 7.3]]) { BOX(`cMon${i}`, "cCon", x - 0.8, x + 0.8, 2.2, 3.3, -0.6, -0.5, "darker"); BOX(`cMonS${i}`, "cCon", x - 0.72, x + 0.72, 2.28, 3.22, -0.5, -0.48, "screen"); BOX(`cMonP${i}`, "cCon", x - 0.06, x + 0.06, 1.7, 2.2, -0.6, -0.5, "steel"); }
BOX("cKb", "cCon", CX + 5.6, CX + 7.0, 1.7, 1.75, 0.2, 0.7, "dark"); VC("cTrack", "cCon", 0.2, 1.7, 1.8, "darker", { x: CX + 7.5, z: 0.45 });
// 束流
actions.cIon = { free: true, type: "flow", _說明: "鎵離子束離開鏡筒後等速直線打到樣品（加速在鏡筒內完成）", path: [ip(IL0 - 0.8), HIT].map((a) => a.map(R2)), n: 10, size: 0.05, shape: "dot", rate: 0.9, track: false, color: "ionC", layer: "cChamber" };
actions.cEbeam = { free: true, type: "flow", _說明: "電子束同時照著看（細藍點，等速）", path: [[SPX, EB - 0.6, SPZ], HIT].map((a) => a.map(R2)), n: 6, size: 0.035, shape: "dot", rate: 0.9, track: false, color: "eC", layer: "cChamber" };
// 濺射：真空中被撞下的原子從撞擊點沿直線、等速往外飛（5 條放射，不受重力）
[[0.9, 0.7, 0.2], [0.5, 0.9, -0.5], [1.0, 0.35, -0.3], [0.2, 0.8, 0.7], [0.7, 0.55, 0.8]].forEach((d, k) => { const n = Math.hypot(...d);
  actions[`cSput${k}`] = { free: true, type: "flow", _說明: "濺射原子直線等速往外飛（真空、不受重力）", path: [HIT, [HIT[0] + 1.3 * d[0] / n, HIT[1] + 1.3 * d[1] / n, HIT[2] + 1.3 * d[2] / n]].map((a) => a.map(R2)), n: 3, size: 0.04, shape: "grit", rate: 0.7, track: false, color: "steel2", layer: "cChamber" }; });

// ═════ 站 D：剖面挖槽＋薄片（x 90，放大示意）═════
// 薄片是一片面向鏡頭（法線沿 z）的牆，前後各挖一道階梯槽；從前上方看得到薄片切面上的電晶體、銅導線與通孔。
const DX = 90;
LAY("dBase", [10, 1.2, DX, 0.5]);
const DH = plinth("d", "dBase", DX, 0, 9.6, 6.4, 0.8);
const BY0 = DH, Y_SI = BY0 + 0.9, Y_TR = Y_SI + 0.3, Y_M = Y_TR + 1.2, Y_PT = Y_M + 0.15;
const BKX0 = DX - 3.5, BKX1 = DX + 3.5, BKZ0 = -2.2, BKZ1 = 2.2;
const LX0 = DX - 1.5, LX1 = DX + 1.5, LW = 0.16;      // 薄片：x 3.0 寬、z 厚 LW（面向鏡頭）
const TZ0 = -1.7, TZ1 = 1.7, TB = BY0 + 0.45;          // 槽：z 範圍、槽底（矽裡）
// 槽外的晶片塊（不透明，表面有一層介電＋淡淡的線路貼圖）
LAY("dBlock", [7.4, 2.8, DX, Y_M - 0.8]);
const outer = (id, x0, x1, z0, z1) => { BOX(`${id}Si`, "dBlock", x0, x1, BY0, Y_SI, z0, z1, "si"); BOX(`${id}Di`, "dBlock", x0, x1, Y_SI, Y_M, z0, z1, "dielO"); BOX(`${id}Top`, "dBlock", x0, x1, Y_M, Y_M + 0.01, z0, z1, "die"); };
outer("dL", BKX0, LX0, BKZ0, BKZ1); outer("dR", LX1, BKX1, BKZ0, BKZ1); outer("dB", LX0, LX1, BKZ0, TZ0);
BOX("dTrB", "dBlock", LX0, LX1, BY0, TB, TZ0, TZ1, "si");
// 前槽是階梯（越靠近薄片越深）：四階
[1, 2, 3, 4].forEach((i) => { const z0 = LW / 2 + 0.35 + (i - 1) * 0.32, yT = Math.min(Y_M, TB + i * 0.48); BOX(`dStepF${i}`, "dBlock", LX0, LX1, TB, yT, z0, i === 4 ? BKZ1 : z0 + 0.32, i === 4 ? "dielO" : "si"); });
P({ id: "dStepE", layer: "dBlock", shape: "box", size: [3.0, 0.03, 0.03], pos: [DX, 0, 0], at: [1, 2, 3].map((i) => [0, R2(TB + i * 0.48), R2(LW / 2 + 0.35 + (i - 1) * 0.32)]), mat: "darker" });
// 薄片：矽、電晶體（閘極）、介電＋三層銅導線＋通孔、頂部白金保護條；z 方向很薄
LAY("dLam", [3.2, 2.4, DX, Y_M - 0.6]);
const lz0 = -LW / 2, lz1 = LW / 2, lzc = 0;
BOX("dLmSi", "dLam", LX0, LX1, TB, Y_SI, lz0, lz1, "si");
BOX("dLmTr", "dLam", LX0, LX1, Y_SI, Y_TR, lz0, lz1, "diel"); BOX("dLmDi", "dLam", LX0, LX1, Y_TR, Y_M, lz0, lz1, "diel");
P({ id: "dLmGate", layer: "dLam", shape: "box", size: [0.12, 0.22, R2(LW + 0.01)], pos: [0, R2(Y_SI + 0.12), lzc], at: Array.from({ length: 10 }, (_, i) => [R2(LX0 + 0.15 + i * 0.3), 0, 0]), mat: "pt" });
P({ id: "dLmSD", layer: "dLam", shape: "box", size: [0.1, 0.06, R2(LW + 0.01)], pos: [0, R2(Y_SI + 0.02), lzc], at: Array.from({ length: 11 }, (_, i) => [R2(LX0 + 0.02 + i * 0.3), 0, 0]), mat: "darker" });
[0, 1, 2].forEach((k) => { const y = Y_TR + 0.22 + k * 0.36, w = [0.12, 0.18, 0.3][k], step = [0.3, 0.45, 0.75][k], n = Math.floor(3.0 / step);
  P({ id: `dLmM${k}`, layer: "dLam", shape: "box", size: [w, R2(0.1 + k * 0.04), R2(LW + 0.012)], pos: [0, R2(y), lzc], at: Array.from({ length: n }, (_, i) => [R2(LX0 + step / 2 + i * step), 0, 0]), mat: "cu" });
  P({ id: `dLmV${k}`, layer: "dLam", shape: "box", size: [0.06, 0.2, R2(LW + 0.012)], pos: [0, R2(y - 0.17), lzc], at: Array.from({ length: n }, (_, i) => [R2(LX0 + step / 2 + i * step), 0, 0]), mat: "cu" }); });
BOX("dLmPt", "dLam", LX0, LX1, Y_M, Y_PT, -0.25, 0.25, "pt");
// 薄片前後兩層「多餘的厚度」（削薄＝這兩層依序消失）
for (const [id, s] of [["dSkinA", 1], ["dSkinB", -1]]) { LAY(id, [3.2, 2.4, DX, Y_M - 0.6]);
  const z0 = s > 0 ? lz1 : lz0 - 0.35, z1 = s > 0 ? lz1 + 0.35 : lz0; BOX(`${id}S`, id, LX0, LX1, TB + 0.05, Y_M, z0, z1, "dielO"); }
// （削薄的束流在 LIFT 定義之後才加：最後削到約 100 nm 是在銅載網上做）
// 鎢針（從右上斜下來，針尖碰到薄片右上角）
LAY("dNeedle", [4, 3, DX + 2.5, Y_PT + 1.5]);
const NTH = 55, NTIP = [LX1 - 0.1, Y_PT + 0.04, 0];
TC("dNdl", "dNeedle", 0.05, 4.0, along(NTIP, NTH, 2.0), NTH, "tung"); TC("dNdlB", "dNeedle", 0.16, 1.2, along(NTIP, NTH, 4.4), NTH, "steel");
SPH("dWeld", "dNeedle", 0.09, NTIP[0], NTIP[1], NTIP[2], "pt");
// 銅半月載網（左邊，面向鏡頭）：半圓片＋三根柱＋夾座
LAY("dGrid", [2.4, 2.4, DX - 5.6, DH + 1.4]);
const GXc = DX - 5.4, GYc = DH + 0.3;
P({ id: "dGridHalf", layer: "dGrid", shape: "cyl", size: [1.1, 0.05], pos: [R2(GXc), R2(GYc), 0], mat: "grid" });
P({ id: "dGridPost", layer: "dGrid", shape: "box", size: [0.16, 0.45, 0.05], pos: [0, R2(GYc + 1.3), 0], at: [-0.55, 0, 0.55].map((dx) => [R2(GXc + dx), 0, 0]), mat: "grid" });
BOX("dGridHold", "dGrid", GXc - 1.3, GXc + 1.3, DH, GYc, -0.3, 0.3, "darker");
P({ id: "dGridScrew", layer: "dGrid", shape: "cyl", size: [0.07, 0.04], pos: [0, R2(DH + 0.15), 0.31], at: [[R2(GXc - 1.0), 0, 0], [R2(GXc + 1.0), 0, 0]], mat: "steel2" });
const LIFT = { dx: R2(GXc + 0.55 + 1.6 - DX), dy: R2(GYc + 1.55 - TB + 0.1) };
// 在載網上削薄：A 組貼著前面（+z）、B 組貼著後面（−z）由上往下等速打到薄片底，依序對應 dSkinA、dSkinB 消失
for (const [id, zs] of [["dThinA", 1], ["dThinB", -1]]) { const zz = zs * (LW / 2 + 0.17), x0 = LX0 + LIFT.dx, x1 = LX1 + LIFT.dx;
  actions[id] = { free: true, type: "flow", _說明: "離子束貼著薄片側面往下削（等速）", path: [[DX + LIFT.dx, Y_PT + LIFT.dy + 2.6, zz], [DX + LIFT.dx, TB + LIFT.dy + 0.1, zz]].map((a) => a.map(R2)), n: 8, size: 0.05, shape: "dot", rate: 0.9, track: false, color: "ionC", layer: "dGrid", lanes: 4, laneGap: R2((x1 - x0) / 4.5), laneDir: [1, 0, 0] }; }

// ═════ 站 E：穿透式電子顯微鏡（x 120）═════
const EX = 120;
LAY("eDesk", [12, 3, EX, 1.4]);
BOX("eDeskB", "eDesk", EX - 5.6, EX + 5.6, 0, 1.6, -0.4, 2.4, "band"); BOX("eDeskT", "eDesk", EX - 5.7, EX + 5.7, 1.6, 1.72, -0.5, 2.5, "panel2");
for (const [i, sx] of [[0, -1], [1, 1]]) { const x = EX + sx * 3.6;
  BOX(`eKp${i}`, "eDesk", x - 1.2, x + 1.2, 1.72, 1.9, 1.0, 2.2, "darker");
  P({ id: `eKn${i}`, layer: "eDesk", shape: "cyl", size: [0.16, 0.14], rot: V, pos: [0, 1.97, 0], at: [0, 1, 2, 3].map((k) => [R2(x - 0.8 + k * 0.53), 0, 1.6]), mat: "steel2" });
  BOX(`eMon${i}`, "eDesk", x - 1.0, x + 1.0, 2.4, 3.8, -0.2, -0.1, "darker"); BOX(`eMonS${i}`, "eDesk", x - 0.9, x + 0.9, 2.5, 3.7, -0.1, -0.08, "screen"); BOX(`eMonP${i}`, "eDesk", x - 0.06, x + 0.06, 1.72, 2.4, -0.2, -0.1, "steel"); }
const COL = [EX, -1.6];   // 鏡筒中心（x, z）
const mods = [   // [層 id, y0, y1, 半徑, 材質, 爆炸位移 dy]
  ["eCam", 1.72, 2.8, 1.1, "darker", 0], ["eView", 2.8, 4.0, 1.25, "steel2", 0], ["eProj", 4.0, 5.6, 0.8, "panel", 0.45],
  ["eObj", 5.6, 6.8, 1.0, "steel", 0.95], ["eCond", 6.8, 8.6, 0.85, "panel", 1.55], ["eGun", 8.6, 10.2, 0.75, "steel2", 2.15], ["eHv", 10.2, 11.8, 1.15, "band", 2.75]];
const EXP = {};
for (const [id, y0, y1, r, m, d] of mods) { LAY(id, [3, R2(y1 - y0), COL[0], R2((y0 + y1) / 2)]); EXP[id] = d; VC(`${id}C`, id, r, y0, y1, m, { x: COL[0], z: COL[1] });
  RING(`${id}F0`, id, r + 0.12, r - 0.1, y0, y0 + 0.1, "steel", COL[0], COL[1]); RING(`${id}F1`, id, r + 0.12, r - 0.1, y1 - 0.1, y1, "steel", COL[0], COL[1]);
  P({ id: `${id}Bo`, layer: id, shape: "cyl", size: [0.04, 0.06], rot: V, pos: [0, R2(y1 + 0.01), 0], at: [0, 60, 120, 180, 240, 300].map((a) => [R2(COL[0] + (r + 0.04) * Math.cos(a * D2R)), 0, R2(COL[1] + (r + 0.04) * Math.sin(a * D2R))]), mat: "steel2" }); }
// 各模組細節：相機鰭片／觀察室鉛玻璃窗＋窗框／投影鏡線圈＋水管／物鏡＋測角台＋樣品桿／聚光鏡線圈＋水管／電子槍閥／高壓槽鰭片＋高壓線
P({ id: "eCamFin", layer: "eCam", shape: "box", size: [0.05, 0.8, 1.4], pos: [0, 2.26, R2(COL[1])], at: [-0.5, -0.25, 0, 0.25, 0.5].map((dx) => [R2(COL[0] + dx), 0, 0]), mat: "fin" });
BOX("eCamTag", "eCam", COL[0] - 0.4, COL[0] + 0.4, 2.0, 2.3, COL[1] + 1.1, COL[1] + 1.12, "white");
for (const [i, a] of [[0, 0], [1, 1]]) { const ang = (a ? 40 : -40) * D2R, wx = COL[0] + 1.2 * Math.sin(ang), wz = COL[1] + 1.2 * Math.cos(ang);
  P({ id: `eWin${i}`, layer: "eView", shape: "cyl", size: [0.32, 0.12], pos: [R2(wx), 3.4, R2(wz)], rot: [0, R2(ang / D2R), 0], mat: "lead" });
  P({ id: `eWinF${i}`, layer: "eView", shape: "tube", size: [0.4, 0.32, 0.12], pos: [R2(wx), 3.4, R2(wz)], rot: [0, R2(ang / D2R), 0], mat: "dark" }); }
for (const [id, y0, y1] of [["eProj", 4.2, 5.4], ["eCond", 7.0, 8.4]]) { [0, 1].forEach((k) => RING(`${id}Coil${k}`, id, 0.98 - (id === "eProj" ? 0.05 : 0), 0.82, R2(y0 + k * 0.7), R2(y0 + k * 0.7 + 0.45), "coil", COL[0], COL[1]));
  P({ id: `${id}Hose`, layer: id, shape: "cyl", size: [0.05, 1.4], pos: [R2(COL[0] + 1.0), R2((y0 + y1) / 2), R2(COL[1] - 0.7)], rot: [0, 90, 0], at: [[0, -0.15, 0], [0, 0.15, 0]], mat: "rubber" }); }
// 測角台＋側插樣品桿（從 +x 側插進物鏡）
BOX("eGonio", "eObj", COL[0] + 0.95, COL[0] + 1.6, 5.8, 6.6, COL[1] - 0.5, COL[1] + 0.5, "darker");
P({ id: "eGonioK", layer: "eObj", shape: "cyl", size: [0.14, 0.1], pos: [R2(COL[0] + 1.27), 0, R2(COL[1] + 0.55)], at: [[0, 6.0, 0], [0, 6.35, 0]], mat: "steel2" });
LAY("eHolder", [3, 0.6, COL[0] + 2.2, 6.2]);
P({ id: "eRod", layer: "eHolder", shape: "cyl", size: [0.07, 2.6], pos: [R2(COL[0] + 1.3), 6.2, R2(COL[1])], rot: [0, 90, 0], mat: "steel2" });
P({ id: "eRodGrip", layer: "eHolder", shape: "cyl", size: [0.2, 1.0], pos: [R2(COL[0] + 3.1), 6.2, R2(COL[1])], rot: [0, 90, 0], mat: "darker" });
P({ id: "eRodRing", layer: "eHolder", shape: "tube", size: [0.22, 0.18, 0.06], pos: [0, 6.2, R2(COL[1])], rot: [0, 90, 0], at: [[R2(COL[0] + 2.7), 0, 0], [R2(COL[0] + 3.5), 0, 0]], mat: "steel" });
SPH("eRodTip", "eHolder", 0.06, COL[0] + 0.02, 6.2, COL[1], "grid");
VC("eGunV", "eGun", 0.2, 9.0, 9.5, "steel", { x: COL[0] + 0.9, z: COL[1] }); RING("eGunVH", "eGun", 0.2, 0.15, 9.5, 9.55, "lampR", COL[0] + 0.9, COL[1]);
P({ id: "eHvFin", layer: "eHv", shape: "tube", size: [1.3, 1.15, 0.06], rot: V, pos: [R2(COL[0]), 0, R2(COL[1])], at: [0, 1, 2, 3, 4].map((i) => [0, R2(10.5 + i * 0.25), 0]), mat: "fin" });
P({ id: "eHvCab", layer: "eHv", shape: "cyl", size: [0.12, 2.4], pos: [R2(COL[0] - 1.9), 11.3, R2(COL[1])], rot: [0, 90, 0], mat: "rubber" });
SPH("eHvCabE", "eHv", 0.13, COL[0] - 3.1, 11.3, COL[1], "rubber"); VC("eHvCabV", "eHv", 0.12, 0, 11.3, "rubber", { x: COL[0] - 3.1, z: COL[1] });
// 線圈通電微亮
actions.eCoilGlow = { type: "pulse", _說明: "電磁線圈通電（聚光鏡、投影鏡）微微發亮", parts: ["eCondCoil0", "eCondCoil1", "eProjCoil0", "eProjCoil1"], color: "heatC", glow: 0.5, freq: 0.8, halo: 0 };
// 電子束：槍→聚光鏡收斂→薄片最細→散開到相機
// 電子束 5 條：槍口稍散 → 聚光鏡收斂 → 樣品處最細 → 投影鏡放大散開 → 相機
[-2, -1, 0, 1, 2].forEach((o, k) => { const pt = (dx, y) => [COL[0] + o * dx, y, COL[1]];
  actions[`eBeam${k}`] = { free: true, type: "flow", _說明: "電子束（等速）：聚光鏡收斂、薄片處最細、穿過後放大散開到相機", path: [pt(0.12, 9.6), pt(0.3, 7.9), pt(0.03, 6.2), pt(0.22, 4.8), pt(0.5, 2.7)].map((a) => a.map(R2)), n: 6, size: 0.045, shape: "dot", rate: 0.9, track: false, color: "eC", layer: "eObj" }; });

// ═════ 站 F：成分分析 EDS（x 150，腔內放大）═════
const FX = 150;
LAY("fBase", [9, 1.5, FX, 0.5]);
const FH = plinth("f", "fBase", FX, 0, 9.0, 6.4, 0.8);
VC("fStage", "fBase", 1.4, FH, FH + 0.5, "steel2", { x: FX }); VC("fStub", "fBase", 0.9, FH + 0.5, FH + 0.8, "steel", { x: FX });
// 樣品：剖面薄片放大（三層：矽、介電、銅線）＋混進的顆粒
LAY("fSample", [3, 1.2, FX, FH + 1.2]);
const FS = FH + 0.8;
BOX("fSi", "fSample", FX - 1.4, FX + 1.4, FS, FS + 0.5, -0.9, 0.9, "si"); BOX("fDi", "fSample", FX - 1.4, FX + 1.4, FS + 0.5, FS + 1.1, -0.9, 0.9, "diel");
P({ id: "fCu", layer: "fSample", shape: "box", size: [0.3, 0.25, 1.8], pos: [0, R2(FS + 0.8), 0], at: [-1.0, -0.4, 0.4, 1.0].map((x) => [R2(FX + x), 0, 0]), mat: "cu" });
SPH("fPart", "fSample", 0.16, FX - 0.1, FS + 1.16, 0.2, "lampR");
const FHIT = [FX - 0.1, FS + 1.2, 0.2];
// 物鏡極靴（階梯圓柱）
LAY("fPole", [3, 3, FX, FS + 3.5]);
[[FS + 2.0, FS + 2.5, 0.45, "steel"], [FS + 2.5, FS + 3.3, 0.9, "steel2"], [FS + 3.3, FS + 5.2, 1.5, "dark"]].forEach(([a, b, r, m], i) => VC(`fPo${i}`, "fPole", r, a, b, m, { x: FX - 0.1, z: 0.2 }));
RING("fPoR", "fPole", 1.6, 1.4, FS + 4.0, FS + 4.15, "coil", FX - 0.1, 0.2);
// EDS 偵測器：準直口＋長探頭＋本體鰭片＋支架＋線纜（從 +x 上方斜指樣品）
LAY("fEds", [6, 3, FX + 3.4, FS + 2.4]);
const DTH = -62, DT0 = 1.0;
const dp = (s) => along(FHIT, -DTH, s).map((v, i) => (i === 0 ? FHIT[0] + (FHIT[0] - v) * -1 : v));
const dpx = (s) => [FHIT[0] + s * Math.sin(-DTH * D2R), FHIT[1] + s * Math.cos(-DTH * D2R), FHIT[2]];
TC("fCol", "fEds", 0.2, 0.5, dpx(DT0 + 0.25), -DTH, "darker");
TC("fSnout", "fEds", 0.28, 2.4, dpx(DT0 + 1.7), -DTH, "steel2");
TC("fBody", "fEds", 0.6, 1.6, dpx(DT0 + 3.7), -DTH, "band");
[0, 1, 2, 3, 4].forEach((k) => TT(`fFin${k}`, "fEds", 0.72, 0.6, 0.06, dpx(DT0 + 3.1 + k * 0.28), -DTH, "fin"));
TC("fCab", "fEds", 0.06, 1.4, dpx(DT0 + 5.2), -DTH, "rubber");
BOX("fMount", "fEds", dpx(DT0 + 3.7)[0] - 0.15, dpx(DT0 + 3.7)[0] + 0.15, FH, dpx(DT0 + 3.7)[1] - 0.6, -0.15, 0.15, "steel");
// 電子束＋三色 X 光
actions.fEbeam = { free: true, type: "flow", _說明: "電子束從極靴往下打到顆粒（等速）", path: [[FX - 0.1, FS + 2.0, 0.2], FHIT].map((a) => a.map(R2)), n: 6, size: 0.05, shape: "dot", rate: 0.9, track: false, color: "eC", layer: "fPole" };
const XTO = dpx(DT0);
[["fXsi", "xSi", 0], ["fXcu", "xCu", 0.12], ["fXcl", "xCl", -0.12]].forEach(([id, c, oz]) => {
  actions[id] = { free: true, type: "flow", _說明: "被打到的原子放出特徵 X 光，直線飛向偵測器（每種元素一個顏色）", path: [[FHIT[0], FHIT[1] + 0.05, FHIT[2] + oz], [XTO[0], XTO[1], XTO[2] + oz]].map((a) => a.map(R2)), n: 4, size: 0.12, shape: "arrow", rate: 0.8, track: true, color: c, layer: "fEds" }; });
actions.fPartGlow = { type: "pulse", _說明: "混進的顆粒被點名（紅光閃）", parts: ["fPart"], color: "lampR", glow: 0.8, freq: 1.2, halo: 0 };

// ═════ 站 G：晶圓廠、設計公司 → 實驗室（x 180）═════
const GX = 180;
LAY("gFab", [7, 6, GX - 7, 3]);
building("gFabH", "gFab", GX - 7, -2, 6, 4, 3.4, { floors: 2 });
P({ id: "gFabStack", layer: "gFab", shape: "cyl", size: [0.3, 2.2], rot: V, pos: [0, 4.6, -3.2], at: [[R2(GX - 9), 0, 0], [R2(GX - 8.2), 0, 0]], mat: "steel2" });
LAY("gDes", [4, 9, GX, 4]);
building("gDesH", "gDes", GX, -2.5, 3.6, 3, 7.2, { floors: 6, glassy: true });
P({ id: "gDesFl", layer: "gDes", shape: "box", size: [3.7, 0.06, 3.1], pos: [GX, 0, -2.5], at: [1, 2, 3, 4, 5, 6].map((i) => [0, R2(i * 1.15), 0]), mat: "seam" });
LAY("gLab", [7, 6, GX + 7.5, 3]);
building("gLabH", "gLab", GX + 7.5, -2, 6, 4, 4.2, { floors: 2 });
BOX("gLabSign", "gLab", GX + 6.5, GX + 8.5, 3.0, 3.6, 0.0, 0.05, "white"); BOX("gLabSignL", "gLab", GX + 6.7, GX + 8.3, 3.15, 3.45, 0.05, 0.06, "lampG");
BOX("gRoad", "floor", GX - 11, GX + 12, 0.005, 0.03, 2.0, 3.6, "darker");
P({ id: "gRoadLn", layer: "floor", shape: "box", size: [0.8, 0.01, 0.1], pos: [0, 0.035, 2.8], at: Array.from({ length: 14 }, (_, i) => [R2(GX - 10 + i * 1.6), 0, 0]), mat: "lampY" });
// 送樣盒（兩個：晶圓廠、設計公司各送一個）
for (const [id, x0] of [["gBoxA", GX - 7], ["gBoxB", GX]]) { LAY(id, [1.2, 1, x0, 0.6]);
  BOX(`${id}B`, id, x0 - 0.55, x0 + 0.55, 0.05, 0.85, 2.4, 3.2, "steel2"); BOX(`${id}L`, id, x0 - 0.58, x0 + 0.58, 0.85, 0.95, 2.37, 3.23, "dark");
  BOX(`${id}H`, id, x0 - 0.2, x0 + 0.2, 0.95, 1.05, 2.75, 2.85, "darker"); BOX(`${id}T`, id, x0 - 0.3, x0 + 0.3, 0.35, 0.6, 3.2, 3.22, "lampY");
  P({ id: `${id}Cl`, layer: id, shape: "box", size: [0.12, 0.2, 0.05], pos: [0, 0.8, 3.23], at: [[R2(x0 - 0.35), 0, 0], [R2(x0 + 0.35), 0, 0]], mat: "steel" }); }

// ═════ 站 H：台灣兩家實驗室（x 210）：A 高樓玻璃帷幕、B 低矮長廠房鋸齒屋頂 ═════
const HX = 210;
LAY("hLabA", [5, 10, HX - 4.5, 5]);
building("hA", "hLabA", HX - 4.5, -1.5, 4.4, 3.6, 8.4, { floors: 7, glassy: true });
P({ id: "hAFin", layer: "hLabA", shape: "box", size: [0.12, 8.4, 0.25], pos: [0, 4.2, 0.4], at: [-2.0, -1.0, 0, 1.0, 2.0].map((dx) => [R2(HX - 4.5 + dx), 0, 0]), mat: "steel2" });
LAY("hLabB", [9, 5, HX + 4.5, 2.5]);
building("hB", "hLabB", HX + 4.5, -1.5, 8.0, 4.0, 3.2, { floors: 2 });
P({ id: "hBSaw", layer: "hLabB", shape: "box", size: [1.2, 0.9, 3.9], pos: [0, 3.65, -1.5], rot: [0, 0, 30], at: [0, 1, 2, 3, 4].map((i) => [R2(HX + 1.2 + i * 1.6), 0, 0]), mat: "roof" });
P({ id: "hBLv", layer: "hLabB", shape: "box", size: [1.2, 0.05, 0.03], pos: [R2(HX + 7.4), 0, 0.52], at: [0, 1, 2, 3, 4, 5].map((i) => [0, R2(1.3 + i * 0.18), 0]), mat: "steel2" });
BOX("hBDock", "hLabB", HX + 1.2, HX + 3.2, 0, 2.0, 0.5, 0.53, "seam");

// ═════ 站 N：下一集 晶圓切割（x 240）═════
const NX = 240;
LAY("nBase", [9, 2, NX, 0.8]);
const NH = plinth("n", "nBase", NX, 0, 8.6, 6.4, 1.2);
VC("nChuck", "nBase", 2.6, NH, NH + 0.3, "dark", { x: NX, z: 0.3 });
LAY("nFrame", [6.4, 0.4, NX, NH + 0.4]);
P({ id: "nRing", layer: "nFrame", shape: "tube", size: [3.1, 2.6, 0.1], rot: V, pos: [NX, R2(NH + 0.35), 0.3], mat: "steel2" });
VC("nTape", "nFrame", 2.6, NH + 0.3, NH + 0.33, "tape", { x: NX, z: 0.3 });
VC("nWafer", "nFrame", 2.0, NH + 0.33, NH + 0.4, "mirror", { x: NX, z: 0.3 });
P({ id: "nDie", layer: "nFrame", shape: "box", size: [0.3, 0.012, 0.3], pos: [0, R2(NH + 0.41), 0], at: (() => { const a = []; for (let i = -6; i <= 6; i++) for (let j = -6; j <= 6; j++) if (Math.hypot(i * 0.34, j * 0.34) < 1.8) a.push([R2(NX + i * 0.34), 0, R2(0.3 + j * 0.34)]); return a; })(), mat: "die" });
LAY("nSpindle", [4, 3, NX + 1, NH + 2.2]);
// 主軸箱沿 z 往後（刀片盤面朝鏡頭）：箱體＋散熱鰭片＋銘板；刀片（鑽石刀緣深色環）＋法蘭＋刀蓋只蓋上半；兩支噴水嘴
const BLX = NX - 0.4, BLY = NH + 1.2, BLZ = 0.6;
BOX("nHouse", "nSpindle", BLX - 0.55, BLX + 0.55, NH + 1.55, NH + 2.65, BLZ - 3.6, BLZ - 0.45, "panel");
P({ id: "nHouseFin", layer: "nSpindle", shape: "box", size: [1.14, 0.9, 0.05], pos: [R2(BLX), R2(NH + 2.1), 0], at: [0, 1, 2, 3, 4, 5].map((i) => [0, 0, R2(BLZ - 3.3 + i * 0.25)]), mat: "fin" });
BOX("nTag", "nSpindle", BLX + 0.55, BLX + 0.57, NH + 1.9, NH + 2.3, BLZ - 2.0, BLZ - 1.2, "white");
P({ id: "nShaft", layer: "nSpindle", shape: "cyl", size: [0.12, 0.6], pos: [R2(BLX), R2(BLY), R2(BLZ - 0.3)], mat: "steel" });
BOX("nShaftB", "nSpindle", BLX - 0.2, BLX + 0.2, BLY, NH + 1.55, BLZ - 0.65, BLZ - 0.45, "steel2");
P({ id: "nBlade", layer: "nSpindle", shape: "cyl", size: [0.75, 0.03], pos: [R2(BLX), R2(BLY), R2(BLZ)], mat: "mirror" });
P({ id: "nRim", layer: "nSpindle", shape: "tube", size: [0.76, 0.66, 0.035], pos: [R2(BLX), R2(BLY), R2(BLZ)], mat: "darker" });
P({ id: "nHub", layer: "nSpindle", shape: "cyl", size: [0.3, 0.12], pos: [R2(BLX), R2(BLY), R2(BLZ + 0.05)], mat: "steel" });
P({ id: "nHubB", layer: "nSpindle", shape: "cyl", size: [0.04, 0.03], pos: [0, 0, R2(BLZ + 0.12)], at: [0, 90, 180, 270].map((d) => [R2(BLX + 0.2 * Math.cos(d * D2R)), R2(BLY + 0.2 * Math.sin(d * D2R)), 0]), mat: "steel2" });
BOX("nCover", "nSpindle", BLX - 0.9, BLX + 0.9, BLY + 0.35, BLY + 0.95, BLZ - 0.25, BLZ - 0.08, "steel2");
BOX("nCoverT", "nSpindle", BLX - 0.9, BLX + 0.9, BLY + 0.85, BLY + 0.95, BLZ - 0.25, BLZ + 0.15, "steel2");
P({ id: "nNoz", layer: "nSpindle", shape: "cyl", size: [0.04, 0.5], rot: V, pos: [0, R2(BLY + 0.55), R2(BLZ + 0.12)], at: [[R2(BLX - 0.55), 0, 0], [R2(BLX + 0.55), 0, 0]], mat: "steel" });
actions.nSpin = { type: "rotate", _說明: "切割刀起轉（加速，繞主軸 z）", parts: ["nBlade", "nRim", "nHub", "nHubB"], axis: [0, 0, 1], pivot: [R2(BLX), R2(BLY), R2(BLZ)], rps: 2, rampSpin: true };
actions.nWater = { free: true, type: "flow", _說明: "冷卻水從噴嘴受重力落到刀口（加速）", path: [[BLX - 0.55, BLY + 0.3, BLZ + 0.12], [BLX - 0.3, NH + 0.45, BLZ]].map((a) => a.map(R2)), n: 8, size: 0.04, shape: "liquid", rate: 0.9, accel: true, track: false, color: "waterC", layer: "nSpindle" };

// 標註點
Object.assign(anchors, {
  aChipA: A("aChip", [SKX + 0.9, CB + 0.3, SKZ + 0.9], 120, -390), aLabA: A("aLab", [AX + 1 - 3.4, 3.8, -9.0], -120, -300),
  bDoorA: A("bDoorL", [BX - 4.2, GT + 5.5, 3.3], -120, -300), bHotA: A("bHot", [HSX, HSY, HSZ], 120, -300), bCamA: A("bScope", [BX + 0.55, GT + 6.0, 0.55], 120, -300), bProbeA: A("bProbes", [BX - 2.6, GT + 0.9, 1.4], -120, -300),
  cEcolA: A("cEcol", [SPX + 0.7, EB + 3.0, SPZ], 120, -300), cIcolA: A("cIcol", ip(IL0 + 3.0), -120, -300), cStageA: A("cChamber", [SPX + 0.6, SY + 0.15, SPZ + 0.6], 120, -480), cGisA: A("cGis", [SPX + 3.1, SY + 2.3, SPZ], 120, -300),
  dLamA: A("dLam", [DX, Y_PT, 0], 120, -300), dNeedleA: A("dNeedle", along(NTIP, NTH, 2.4), 120, -470), dGridA: A("dGrid", [GXc, GYc + 1.5, 0], -120, -300), dTrenchA: A("dBlock", [LX0 + 0.5, TB + 0.6, 1.0], -120, -300),
  eGunA: A("eGun", [COL[0] + 0.75, 9.4, COL[1]], 120, -300), eCondA: A("eCond", [COL[0] - 0.95, 7.6, COL[1] + 0.3], -120, -300), eHolderA: A("eHolder", [COL[0] + 3.1, 6.4, COL[1]], 120, -300), eProjA: A("eCam", [COL[0] - 1.1, 2.3, COL[1] + 0.3], -120, -300),
  fEdsA: A("fEds", dpx(DT0 + 3.0), 120, -300), fPartA: A("fSample", [FHIT[0] - 0.1, FHIT[1], FHIT[2] + 0.1], -120, -300),
  gFabA: A("gFab", [GX - 9.5, 3.4, 0], -120, -300), gDesA: A("gDes", [GX + 1.6, 6.5, -1.0], 120, -300), gLabA: A("gLab", [GX + 10.3, 4.0, 0], 120, -300),
  hAA: A("hLabA", [HX - 6.6, 7.0, 0.3], -120, -300), hBA: A("hLabB", [HX + 8.4, 3.0, 0.5], 120, -300), nBladeA: A("nSpindle", [BLX + 0.5, BLY - 0.3, BLZ], -120, -300),
});

const model = {
  name: "示意 材料分析與故障分析：故障晶片與測試板、微光顯微鏡探針台、聚焦離子束雙束機、剖面挖槽與薄片、穿透式電子顯微鏡、EDS 成分分析、送樣到實驗室、台灣實驗室、晶圓切割預告（示意，非特定廠牌／型號）",
  unit: "示意（放大）",
  size: { w: 40, h: 18, r: 0.6, t: 30 },
  palette, materials,
  partNames: { aSub: "晶片載板", bDie: "晶粒" },
  layers, parts, anchors, actions,
  pose: { yaw0: 0, yawIso: 0, drift: 0 },
  camera: { stand: { d: 70, elev: 24, y: 4 } },
  fx: { dpr: 1, srcPx: 30, shadows: 0, fog: false, dust: false, vaporSprites: false, shimmer: false },
  info: { AX, BX, CX, DX, EX, FX, GX, HX, NX, GT: R2(GT), SPX, SY, EXP, LIFT, COLX: COL[0], COLZ: COL[1], ICOL: { dx: R2(-2.2 * Math.sin(-ITH * D2R)), dy: R2(2.2 * Math.cos(ITH * D2R)) } },
};
fs.writeFileSync(path.join(HERE, "model.json"), JSON.stringify(model, null, 1) + "\n");
console.log(`✔ model.json：${parts.length} 個零件、${parts.reduce((a, p) => a + Math.max(1, p.at?.length ?? 0), 0)} 個實體、${layers.length} 層`);

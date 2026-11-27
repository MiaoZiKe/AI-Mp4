// node videos/tech-memfab/gen-model.mjs → 寫 videos/tech-memfab/model.json
// 2026/11/28 tech-memfab（中游補充篇 M2：記憶體製造）。構造照 physics-spec.md、模組清單照 visual-spec.md。全部放大示意，非特定廠牌／型號。
// 站點（地板頂面 y＝0）：A 記憶體晶圓（x 0）｜B 三種記憶體：記憶體模組、固態硬碟、開機晶片（x 30）｜C 動態記憶體陣列：開關＋高瘦電容（x 60）
//   D 儲存型快閃：疊三百多層（示意 16 對）＋鑽深孔＋填通道（x 90）｜E 整合元件製造廠（設計樓＋晶圓廠，x 120）｜F 全球三家（x 150）
//   G 台灣三家（x 180）｜H 美光台灣：晶圓廠＋高頻寬記憶體堆疊（x 210）｜N 下一集：矽／碳化矽／氮化鎵晶圓（x 240）
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
const HERE = path.dirname(new URL(import.meta.url).pathname);
const R2 = (x) => Math.round(x * 1000) / 1000;
const palette = {
  floorC: "#C9D2DE", panel: "#F3F5F8", panel2: "#E2E8F0", seam: "#8E9BB0", band: "#24324C", steel: "#7D8CA6", steel2: "#A9B5C7", dark: "#3E4A60", darker: "#2A3142",
  lampY: "#F2B632", lampG: "#2FBF71", lampR: "#E5484D", screen: "#5B8DEF", rubber: "#2B2F36", gold: "#C9A24A", padGold: "#E0B84E",
  siC: "#5E6B82", siHi: "#8A97B0", waferC: "#7C89A6", dieC: "#4C5E86", chipC: "#2E3442", chipTop: "#3A4152", pcbC: "#1E6B4E", pcbD: "#16523B", ssdC: "#1D2A3A",
  oxC: "#E6EBF2", wlC: "#4A5876", blC: "#C8794A", capC: "#B8C2D4", capIn: "#7E8AA2", chg: "#2FD3E0", plugC: "#8E9BB0", trapC: "#E0A43A", chanC: "#6FB38F", wC: "#9AA6BC",
  holeC: "#151922", etchC: "#B07CF0", glassC: "#BFD3F2", winC: "#5B8DEF", winD: "#2F4A7A", roofC: "#B6C0CF", hbmC: "#4E5A74", baseC: "#3B6E8F",
  sicC: "#3FA37A", ganC: "#C9A24A", crackC: "#E5484D", boltC: "#F2B632", markC: "#E8613C", whiteP: "#FFFFFF",
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
  si: M("std", "siC", { rough: 0.35, metal: 0.5, env: 0.6 }), siHi: M("std", "siHi", { rough: 0.25, metal: 0.6, env: 0.8 }),
  wafer: M("std", "waferC", { rough: 0.12, metal: 0.85, env: 1.1 }), die: M("std", "dieC", { rough: 0.2, metal: 0.6, env: 0.9, tex: "traces", texScale: 0.35 }),
  chip: M("std", "chipC", { rough: 0.35, metal: 0.3, env: 0.5 }), chipTop: M("std", "chipTop", { rough: 0.3, metal: 0.3, env: 0.6, tex: "traces", texScale: 0.5 }),
  pcb: M("std", "pcbC", { rough: 0.45, metal: 0.1, env: 0.35, tex: "traces", texScale: 1.0 }), pcbD: M("std", "pcbD", { rough: 0.5, metal: 0.1 }),
  ssd: M("std", "ssdC", { rough: 0.45, metal: 0.1, env: 0.35, tex: "traces", texScale: 0.8 }),
  ox: M("std", "oxC", { rough: 0.5, metal: 0, env: 0.3 }), wl: M("std", "wlC", { rough: 0.35, metal: 0.7, env: 0.6 }), bl: M("std", "blC", { rough: 0.3, metal: 0.9, env: 0.9 }),
  cap: M("std", "capC", { rough: 0.25, metal: 0.8, env: 0.9 }), capIn: M("std", "capIn", { rough: 0.3, metal: 0.8, env: 0.7 }),
  chg: glowM("chg", 1, 0.9), plug: M("std", "plugC", { rough: 0.3, metal: 0.85, env: 0.7 }),
  trap: M("std", "trapC", { rough: 0.35, metal: 0.2, env: 0.5 }), chan: M("std", "chanC", { rough: 0.35, metal: 0.2, env: 0.5 }), wpin: M("std", "wC", { rough: 0.3, metal: 0.9, env: 0.8 }),
  hole: M("std", "holeC", { rough: 0.9, metal: 0 }), etch: glowM("etchC", 1, 0.9), glass: M("phys", "glassC", { rough: 0.05, metal: 0, clearcoat: 1, opacity: 0.3, env: 0.6 }),
  win: M("std", "winC", { rough: 0.15, metal: 0.4, env: 1.0, emissive: "winC", ei: 0.15 }), winD: M("std", "winD", { rough: 0.2, metal: 0.4, env: 0.8 }), roof: M("std", "roofC", { rough: 0.6, metal: 0.3 }),
  hbm: M("std", "hbmC", { rough: 0.25, metal: 0.6, env: 0.8, tex: "traces", texScale: 0.5 }), base: M("std", "baseC", { rough: 0.3, metal: 0.5, env: 0.7 }),
  sic: M("phys", "sicC", { rough: 0.05, metal: 0, clearcoat: 1, opacity: 0.8, env: 0.9 }), gan: M("std", "ganC", { rough: 0.15, metal: 0.8, env: 1.0 }),
  crack: glowM("crackC", 1, 0.9), bolt: glowM("boltC", 1, 0.7), mark: M("std", "markC", { rough: 0.5, metal: 0, emissive: "markC", ei: 0.25 }), white: M("std", "whiteP", { rough: 0.7, metal: 0 }),
};
const parts = [], layers = [], anchors = {}, actions = {};
const P = (o) => { parts.push(o); return o; };
const LAY = (id, outline, bg) => layers.push({ id, z: 0, k: 0, outline, ...(bg ? { bg: true } : {}) });
const V = [90, 0, 0];
const BOX = (id, layer, x0, x1, y0, y1, z0, z1, mat, o = {}) => P({ id, layer, shape: "box", size: [R2(x1 - x0), R2(y1 - y0), R2(z1 - z0)], pos: [R2((x0 + x1) / 2), R2((y0 + y1) / 2), R2((z0 + z1) / 2)], mat, ...o });
const VC = (id, layer, R, y0, y1, mat, o = {}) => { const { x = 0, z = 0, ...r } = o; return P({ id, layer, shape: "cyl", size: [R, R2(y1 - y0)], rot: V, pos: [x, R2((y0 + y1) / 2), z], mat, ...r }); };
const SPH = (id, layer, r, x, y, z, mat, o = {}) => P({ id, layer, shape: "sphere", size: [r], pos: [x, y, z], mat, ...o });
const A = (layer, p, dx, dy) => ({ layer, p, dx, dy });
const plinth = (id, layer, x, z, w, d, h = 0.8) => { BOX(`${id}Pl`, layer, x - w / 2, x + w / 2, 0, h, z - d / 2, z + d / 2, "band"); BOX(`${id}PlT`, layer, x - w / 2, x + w / 2, h, h + 0.05, z - d / 2, z + d / 2, "panel2");
  BOX(`${id}Kick`, layer, x - w / 2 - 0.05, x + w / 2 + 0.05, 0, 0.12, z - d / 2 - 0.05, z + d / 2 + 0.05, "darker");
  P({ id: `${id}Bolt`, layer, shape: "cyl", size: [0.1, 0.04], rot: V, pos: [0, R2(h + 0.07), 0], at: [[x - w / 2 + 0.3, 0, z - d / 2 + 0.3], [x + w / 2 - 0.3, 0, z - d / 2 + 0.3], [x - w / 2 + 0.3, 0, z + d / 2 - 0.3], [x + w / 2 - 0.3, 0, z + d / 2 - 0.3]], mat: "steel" }); return h + 0.05; };
// 封裝晶片（細間距球閘陣列 FBGA）：黑色本體＋上蓋紋路＋底下一排排錫球＋1 號腳圓點
const fbga = (id, layer, x, y, z, w, d, t = 0.14, rows = 3) => {
  BOX(`${id}B`, layer, x - w / 2, x + w / 2, y + 0.04, y + 0.04 + t, z - d / 2, z + d / 2, "chip"); BOX(`${id}T`, layer, x - w / 2 + 0.03, x + w / 2 - 0.03, y + 0.04 + t, y + 0.045 + t, z - d / 2 + 0.03, z + d / 2 - 0.03, "chipTop");
  const at = []; for (let i = 0; i < 6; i++) for (let j = 0; j < rows; j++) at.push([R2(x - w * 0.38 + i * w * 0.152), 0, R2(z - d * 0.3 + j * d * 0.3)]);
  P({ id: `${id}Ball`, layer, shape: "sphere", size: [0.035], pos: [0, R2(y + 0.03), 0], at, mat: "steel2" });
  P({ id: `${id}Dot`, layer, shape: "cyl", size: [0.035, 0.01], rot: V, pos: [R2(x - w / 2 + 0.1), R2(y + 0.05 + t), R2(z - d / 2 + 0.1)], mat: "panel2" });
};
// SOIC-8 開機晶片：本體＋兩側各 4 支鷗翼腳＋1 號腳圓點
const soic8 = (id, layer, x, y, z, s = 1) => {
  BOX(`${id}B`, layer, x - 0.25 * s, x + 0.25 * s, y + 0.05 * s, y + 0.2 * s, z - 0.2 * s, z + 0.2 * s, "chip"); BOX(`${id}T`, layer, x - 0.23 * s, x + 0.23 * s, y + 0.2 * s, y + 0.205 * s, z - 0.18 * s, z + 0.18 * s, "chipTop");
  const at = []; for (let i = 0; i < 4; i++) for (const sd of [-1, 1]) at.push([R2(x - 0.18 * s + i * 0.12 * s), 0, R2(z + sd * 0.26 * s)]);
  P({ id: `${id}Leg`, layer, shape: "box", size: [R2(0.05 * s), R2(0.03 * s), R2(0.14 * s)], pos: [0, R2(y + 0.03 * s), 0], at, mat: "steel2" });
  P({ id: `${id}LegU`, layer, shape: "box", size: [R2(0.05 * s), R2(0.1 * s), R2(0.03 * s)], pos: [0, R2(y + 0.08 * s), 0], at: at.map(([a, , c]) => [a, 0, R2(c - Math.sign(c - z) * 0.06 * s)]), mat: "steel2" });
  P({ id: `${id}Dot`, layer, shape: "cyl", size: [R2(0.03 * s), 0.01], rot: V, pos: [R2(x - 0.17 * s), R2(y + 0.21 * s), R2(z - 0.12 * s)], mat: "panel2" });
};
const idsOf = (layer) => parts.filter((q) => q.layer === layer).map((q) => q.id);

// ═════ 地板 ═════
LAY("floor", [300, 2, 120, 0], true);
P({ id: "floor", layer: "floor", shape: "slab", size: [300, 0.5, 44], r: 0.2, pos: [120, -0.25, 0], mat: "floor" });
P({ id: "floorSeam", layer: "floor", shape: "slab", size: [300, 0.04, 0.1], pos: [120, 0.01, 0], at: Array.from({ length: 7 }, (_, i) => [0, 0, -16 + i * 5.3]), mat: "seam" });

// ═════ 站 A：記憶體晶圓（x 0）：12 吋晶圓放在轉盤上慢慢轉，上面一格格晶粒（每格看得到陣列紋路），切割道、缺口 ═════
const AX = 0;
LAY("aBase", [10, 1.2, AX, 0.5]);
const AH = plinth("a", "aBase", AX, 0, 9.4, 9.4, 0.8);
VC("aChuck", "aBase", 3.2, AH, AH + 0.35, "steel2", { x: AX }); VC("aChuckRim", "aBase", 3.35, AH, AH + 0.12, "dark", { x: AX });
LAY("aWafer", [8.4, 0.6, AX, 1.4]);
const AWY = AH + 0.35;
VC("aWaf", "aWafer", 4.0, AWY, AWY + 0.08, "wafer", { x: AX });
const adie = []; for (let i = -7; i <= 7; i++) for (let j = -7; j <= 7; j++) { const x = i * 0.52, z = j * 0.52; if (Math.hypot(Math.abs(x) + 0.26, Math.abs(z) + 0.26) < 3.85) adie.push([R2(AX + x), 0, R2(z)]); }
P({ id: "aDie", layer: "aWafer", shape: "box", size: [0.46, 0.02, 0.46], pos: [0, R2(AWY + 0.09), 0], at: adie, mat: "die" });
// 每格晶粒裡的兩塊記憶體陣列（亮）＋中間周邊電路帶（暗）
P({ id: "aDieArr", layer: "aWafer", shape: "box", size: [0.19, 0.006, 0.4], pos: [0, R2(AWY + 0.103), 0], at: adie.flatMap(([x, , z]) => [[R2(x - 0.115), 0, z], [R2(x + 0.115), 0, z]]), mat: "siHi" });
BOX("aNotch", "aWafer", AX - 0.12, AX + 0.12, AWY - 0.01, AWY + 0.1, 3.88, 4.05, "darker");
actions.aSpin = { type: "rotate", _說明: "晶圓放在轉盤上慢慢轉（第 0 幀就在動）", parts: [...idsOf("aWafer")], axis: [0, 1, 0], pivot: [AX, AWY, 0], rps: 0.06, rampSpin: false };

// ═════ 站 B：三種記憶體（x 30）：左 記憶體模組（動態記憶體）｜中 固態硬碟（儲存型快閃）｜右 小電路板上的開機晶片（編碼型快閃） ═════
const BX = 30;
LAY("bBase", [18, 1, BX + 1, 0.4]);
const BH = plinth("b", "bBase", BX + 1, 0, 17, 5.4, 0.8);
// 記憶體模組：綠板＋走線、8 顆晶片、金手指一排、防呆缺口、小晶片（序號）、電阻排
LAY("bDimm", [8.4, 0.6, BX - 3.6, 1.1]);
const DX0 = BX - 7.8, DX1 = BX + 0.6, DY = BH + 0.02;
BOX("bdBoard", "bDimm", DX0, DX1, DY, DY + 0.08, -1.0, 1.0, "pcb");
for (let c = 0; c < 8; c++) fbga(`bdC${c}`, "bDimm", R2(DX0 + 0.75 + c * 1.0 + (c >= 4 ? 0.3 : 0)), DY + 0.08, -0.1, 0.78, 0.95);
P({ id: "bdFing", layer: "bDimm", shape: "box", size: [0.08, 0.012, 0.32], pos: [0, R2(DY + 0.085), 0.8], at: Array.from({ length: 40 }, (_, i) => [R2(DX0 + 0.25 + i * 0.205 + (i >= 20 ? 0.25 : 0)), 0, 0]), mat: "padGold" });
BOX("bdKey", "bDimm", R2(DX0 + 4.33), R2(DX0 + 4.47), DY - 0.005, DY + 0.09, 0.72, 1.01, "darker");
fbga("bdSpd", "bDimm", R2(DX0 + 4.4), DY + 0.08, 0.5, 0.3, 0.22, 0.06, 2);
P({ id: "bdRes", layer: "bDimm", shape: "box", size: [0.2, 0.05, 0.09], pos: [0, R2(DY + 0.105), 0.5], at: Array.from({ length: 8 }, (_, i) => [R2(DX0 + 0.75 + i * 1.0 + (i >= 4 ? 0.3 : 0)), 0, 0]), mat: "steel" });
P({ id: "bdVia", layer: "bDimm", shape: "cyl", size: [0.025, 0.01], rot: V, pos: [0, R2(DY + 0.082), 0], at: Array.from({ length: 24 }, (_, i) => [R2(DX0 + 0.4 + i * 0.35), 0, R2(i % 2 ? -0.82 : 0.62)]), mat: "padGold" });
// 每顆晶片上方一格格「資料」亮點：有電時亮、斷電就熄
LAY("bBits", [8, 0.3, BX - 3.6, 1.5]);
const bits = []; for (let c = 0; c < 8; c++) for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) if ((c * 7 + i * 3 + j * 5) % 3) bits.push([R2(DX0 + 0.75 + c * 1.0 + (c >= 4 ? 0.3 : 0) + (i - 1) * 0.22), 0, R2(-0.1 + (j - 1) * 0.26)]);
P({ id: "bBit", layer: "bBits", shape: "sphere", size: [0.07], pos: [0, R2(DY + 0.42), 0], at: bits, mat: "chg" });
actions.bBitGlow = { type: "pulse", _說明: "動態記憶體有電時資料亮點閃（斷電後整層藏起來＝清空）", parts: ["bBit"], color: "chg", glow: 0.9, freq: 1.6, halo: 0 };
// 固態硬碟：黑板＋控制晶片＋兩顆快閃＋快取＋左端金手指與缺口＋右端半圓螺絲孔
LAY("bSsd", [5, 0.5, BX + 4.2, 1.1]);
const SX0 = BX + 1.6, SX1 = BX + 6.6, SY = BH + 0.02;
BOX("bsBoard", "bSsd", SX0, SX1, SY, SY + 0.07, -0.7, 0.7, "ssd");
fbga("bsCtl", "bSsd", SX0 + 1.0, SY + 0.07, 0, 0.8, 0.8, 0.1, 3);
fbga("bsN0", "bSsd", SX0 + 2.35, SY + 0.07, 0, 1.0, 0.95, 0.14, 3); fbga("bsN1", "bSsd", SX0 + 3.55, SY + 0.07, 0, 1.0, 0.95, 0.14, 3);
fbga("bsDr", "bSsd", SX0 + 1.0, SY + 0.07, 0.52, 0.5, 0.26, 0.06, 2);
P({ id: "bsFing", layer: "bSsd", shape: "box", size: [0.24, 0.012, 0.05], pos: [R2(SX0 + 0.14), R2(SY + 0.075), 0], at: Array.from({ length: 18 }, (_, i) => [0, 0, R2(-0.62 + i * 0.073 + (i >= 13 ? 0.06 : 0))]), mat: "padGold" });
BOX("bsKey", "bSsd", SX0 - 0.01, SX0 + 0.3, SY - 0.005, SY + 0.08, 0.31, 0.37, "darker");
P({ id: "bsScrew", layer: "bSsd", shape: "cyl", size: [0.18, 0.02], rot: V, pos: [R2(SX1 - 0.02), R2(SY + 0.075), 0], mat: "padGold" });
P({ id: "bsScrewH", layer: "bSsd", shape: "cyl", size: [0.09, 0.03], rot: V, pos: [R2(SX1 - 0.02), R2(SY + 0.08), 0], mat: "darker" });
P({ id: "bsCap", layer: "bSsd", shape: "box", size: [0.1, 0.06, 0.06], pos: [0, R2(SY + 0.1), -0.55], at: Array.from({ length: 10 }, (_, i) => [R2(SX0 + 0.6 + i * 0.4), 0, 0]), mat: "steel" });
LAY("bSsdBits", [3, 0.3, SX0 + 2.95, 1.5]);
const sbits = []; for (const cx of [SX0 + 2.35, SX0 + 3.55]) for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) if ((i + j * 2 + Math.round(cx)) % 3) sbits.push([R2(cx + (i - 1) * 0.28), 0, R2((j - 1) * 0.28)]);
P({ id: "bsBit", layer: "bSsdBits", shape: "sphere", size: [0.07], pos: [0, R2(SY + 0.42), 0], at: sbits, mat: "trap" });
// 開機晶片：小電路板＋SOIC-8＋走線＋去耦電容；旁邊一顆處理器（念到「開機」時從開機晶片送出一串光點）
LAY("bNor", [2.6, 0.6, BX + 8.6, 1.1]);
const NX0 = BX + 7.2, NY0 = BH + 0.02;
BOX("bnBoard", "bNor", NX0, NX0 + 2.8, NY0, NY0 + 0.07, -1.0, 1.0, "pcb");
soic8("bnChip", "bNor", NX0 + 0.7, NY0 + 0.07, 0.2, 1.3);
fbga("bnCpu", "bNor", NX0 + 2.0, NY0 + 0.07, -0.2, 0.9, 0.9, 0.12, 3);
P({ id: "bnTr", layer: "bNor", shape: "box", size: [1.0, 0.01, 0.035], pos: [R2(NX0 + 1.25), R2(NY0 + 0.076), 0], at: [[0, 0, -0.45], [0, 0, -0.34], [0, 0, -0.23], [0, 0, -0.12]], mat: "padGold" });
P({ id: "bnCap", layer: "bNor", shape: "box", size: [0.12, 0.07, 0.07], pos: [R2(NX0 + 0.7), R2(NY0 + 0.11), -0.55], at: [[0, 0, 0], [0.25, 0, 0]], mat: "steel" });
actions.bBoot = { type: "flow", _說明: "開機：指令從開機晶片沿走線送到處理器", layer: "bNor", path: [[R2(NX0 + 0.9), R2(NY0 + 0.12), -0.12], [R2(NX0 + 1.75), R2(NY0 + 0.12), -0.12]], n: 3, lanes: 4, laneDir: [0, 0, -1], laneGap: 0.11, size: 0.06, shape: "dot", rate: 0.8, color: "chg", track: false };
actions.bNorGlow = { type: "pulse", parts: ["bnChipT"], color: "lampY", glow: 0.8, freq: 1.0, halo: 0 };
actions.bSsdGlow = { type: "pulse", _說明: "儲存型快閃：斷電後亮點仍在（資料不消失）", parts: ["bsBit"], color: "trapC", glow: 0.6, freq: 0.6, halo: 0 };
// 電源燈：有電綠、斷電紅
LAY("bPwr", [0.4, 0.3, BX - 7.4, 1.2]);
SPH("bPwrG", "bPwr", 0.12, R2(DX0 + 0.25), R2(DY + 0.2), -0.75, "lampG");
LAY("bPwrOff", [0.4, 0.3, BX - 7.4, 1.2]);
SPH("bPwrR", "bPwrOff", 0.12, R2(DX0 + 0.25), R2(DY + 0.2), -0.75, "lampR");

// ═════ 站 C：動態記憶體陣列放大（x 60）：底下矽基板＋字元線（開關的閘）＋位元線，上面一排排又細又高的電容（像筷子站著） ═════
const CX = 60;
LAY("cBase", [9, 1, CX, 0.4]);
const CH = plinth("c", "cBase", CX, 0, 9, 6, 0.6);
LAY("cArr", [8, 5, CX, 2.6]);
const CY0 = CH, CY1 = CH + 0.9;   // 矽基板頂面
BOX("cSub", "cArr", CX - 3.8, CX + 3.8, CY0, CY1, -2.4, 2.4, "si");
// 主動區（一條條斜的島）＋埋入式字元線（沿 z）＋位元線（沿 x，銅色）
P({ id: "cAct", layer: "cArr", shape: "box", size: [0.5, 0.03, 0.2], pos: [0, R2(CY1 + 0.005), 0], rot: [0, 25, 0], at: Array.from({ length: 40 }, (_, i) => [R2(CX - 3.15 + (i % 8) * 0.9), 0, R2(-1.9 + Math.floor(i / 8) * 0.95)]), mat: "siHi" });
P({ id: "cWL", layer: "cArr", shape: "box", size: [0.14, 0.06, 4.7], pos: [0, R2(CY1 + 0.02), 0], at: Array.from({ length: 16 }, (_, i) => [R2(CX - 3.55 + i * 0.45), 0, 0]), mat: "wl" });
P({ id: "cBL", layer: "cArr", shape: "box", size: [7.5, 0.08, 0.11], pos: [CX, R2(CY1 + 0.12), 0], at: Array.from({ length: 5 }, (_, j) => [0, 0, R2(-1.45 + j * 0.95)]), mat: "bl" });
// 電容：落腳墊＋外殼（上電極）＋內電極；8 × 5＝40 根，高 3
const CCAP = []; for (let i = 0; i < 8; i++) for (let j = 0; j < 5; j++) CCAP.push([R2(CX - 3.15 + i * 0.9), 0, R2(-1.9 + j * 0.95)]);
const CAPH = 3.0, CB = CY1 + 0.22;
P({ id: "cPad", layer: "cArr", shape: "cyl", size: [0.24, 0.06], rot: V, pos: [0, R2(CB - 0.03), 0], at: CCAP, mat: "plug" });
P({ id: "cPlug", layer: "cArr", shape: "cyl", size: [0.09, 0.2], rot: V, pos: [0, R2(CY1 + 0.1), 0], at: CCAP.map(([x, , z]) => [R2(x + 0.12), 0, R2(z + 0.22)]), mat: "plug" });
P({ id: "cCapO", layer: "cArr", shape: "tube", size: [0.2, 0.15, CAPH], rot: V, pos: [0, R2(CB + CAPH / 2), 0], at: CCAP, mat: "cap" });
P({ id: "cCapI", layer: "cArr", shape: "cyl", size: [0.12, R2(CAPH - 0.1)], rot: V, pos: [0, R2(CB + CAPH / 2 - 0.05), 0], at: CCAP, mat: "capIn" });
// 後兩排上面蓋共用上電極板（剖開：前排露出來）
BOX("cTopPlate", "cArr", CX - 3.8, CX + 3.8, R2(CB + CAPH + 0.02), R2(CB + CAPH + 0.2), -2.4, -0.95, "steel2");
// 存了「1」的電容：內電極發光（電荷），會慢慢暗掉再被補上（刷新）
const CONE = CCAP.filter((_, k) => (k * 5 + 3) % 3 !== 0 && CCAP[k][2] > -1.0);
LAY("cChg", [8, 3, CX, 2.6]);
P({ id: "cChgI", layer: "cChg", shape: "cyl", size: [0.125, R2(CAPH - 0.2)], rot: V, pos: [0, R2(CB + CAPH / 2 - 0.1), 0], at: CONE, mat: "chg" });
actions.cLeak = { type: "pulse", _說明: "電荷會慢慢漏掉、再被補滿（刷新，示意）", parts: ["cChgI"], color: "chg", glow: 0.9, freq: 0.7, halo: 0 };
actions.cFill = { type: "flow", _說明: "開關打開：電荷從位元線經接觸柱流進電容", layer: "cArr", path: [[CX, R2(CY1 + 0.15), 0], [CX, R2(CB + 0.1), 0], [CX, R2(CB + CAPH - 0.2), 0]], n: 4, lanes: 6, laneDir: [1, 0, 0], laneGap: 0.9, size: 0.07, shape: "dot", rate: 0.9, color: "chg", track: false };
// 一個「開關＋電容」單元框起來（念到「每一格」時）
LAY("cCell", [1, 3.6, CX - 3.15, 2.8]);
P({ id: "cCellF", layer: "cCell", shape: "ring", size: [0.42, 0.36, 0.04], rot: V, pos: [R2(CX - 3.15), R2(CB + CAPH + 0.05), 0.95 * 0 + R2(1.9)], mat: "mark" });
P({ id: "cCellF2", layer: "cCell", shape: "ring", size: [0.42, 0.36, 0.04], rot: V, pos: [R2(CX - 3.15), R2(CY1 + 0.16), R2(1.9)], mat: "mark" });

// ═════ 站 D：儲存型快閃（x 90）：導體層／絕緣層一層層疊（示意 16 對，實際三百多層）→ 由上往下鑽深孔（分三段）→ 填入儲存層與通道（像吸管）；右側階梯接觸 ═════
const DXc = 90;
LAY("dBase", [10, 1, DXc, 0.4]);
const DH = plinth("d", "dBase", DXc, 0, 10, 6, 0.6);
LAY("dSub", [8.4, 0.5, DXc, 0.9]);
BOX("dSubB", "dSub", DXc - 4.2, DXc + 4.2, DH, DH + 0.5, -2.2, 2.2, "si");
const DN = 16, DT1 = 0.1, DT2 = 0.08, DXL = DXc - 4.0, DXR = DXc + 4.0, STEP = 0.16;
const DLY = (k) => R2(DH + 0.5 + k * (DT1 + DT2));
const DTOP = DLY(DN);
for (let k = 0; k < DN; k++) {
  const id = `dL${k}`, xr = R2(DXR - k * STEP); LAY(id, [8, 0.2, DXc, R2(DLY(k) + 0.09)]);
  BOX(`${id}o`, id, DXL, xr, DLY(k), R2(DLY(k) + DT2), -2.0, 2.0, "ox");
  BOX(`${id}w`, id, DXL, xr, R2(DLY(k) + DT2), R2(DLY(k) + DT2 + DT1), -2.0, 2.0, "wl");
}
// 階梯接觸柱：每階一根（鎢）
LAY("dStair", [3, 3.5, DXR - 1.3, 2.6]);
for (let k = 0; k < DN; k++) { const x = R2(DXR - k * STEP - STEP / 2), y0 = R2(DLY(k) + DT2 + DT1), y1 = R2(DTOP + 0.6); VC(`dPin${k}`, "dStair", 0.045, y0, y1, "wpin", { x, z: R2(-1.4 + (k % 4) * 0.25) }); }
// 孔的位置：左側 6 × 4 格（不碰階梯）；前排剖開在前面 z＝2.0 看得到整根
const DH_X = Array.from({ length: 6 }, (_, i) => R2(DXL + 0.55 + i * 0.62)), DH_Z = [-1.35, -0.45, 0.45, 1.35];
const holeAt = []; for (const x of DH_X) for (const z of DH_Z) holeAt.push([x, 0, z]);
const frontAt = DH_X.map((x) => [x, 0, 2.0]);
const DB = DH + 0.5, DD = DTOP - DB;
// 三段鑽孔（上段→中段→下段，像分三段打通）：頂面黑點＋前排剖面的黑柱
for (let s = 0; s < 3; s++) {
  const id = `dHole${s}`, ya = R2(DTOP - (s + 1) * DD / 3), yb = R2(DTOP - s * DD / 3); LAY(id, [4, 1.2, DXL + 2.1, R2((ya + yb) / 2)]);
  P({ id: `${id}F`, layer: id, shape: "cyl", size: [0.17, R2(yb - ya + 0.01)], rot: V, pos: [0, R2((ya + yb) / 2), 0], at: frontAt, mat: "hole" });
  if (s === 0) P({ id: `${id}T`, layer: id, shape: "cyl", size: [0.17, 0.02], rot: V, pos: [0, R2(DTOP + 0.005), 0], at: holeAt, mat: "hole" });
}
// 鑽孔用的離子束（往下）
actions.dEtch = { type: "flow", _說明: "蝕刻離子由上往下打進孔裡（示意）", layer: "dHole0", path: [[R2((DH_X[0] + DH_X[5]) / 2), R2(DTOP + 0.12), 2.0], [R2((DH_X[0] + DH_X[5]) / 2), R2(DB + 0.05), 2.0]], n: 3, lanes: 6, laneDir: [1, 0, 0], laneGap: 0.62, size: 0.07, shape: "dot", rate: 1.1, color: "etchC", track: false, accel: true };
// 填進去：外層儲存層（琥珀）＋中間通道（綠）＝像吸管
LAY("dFill", [4, 3.5, DXL + 2.1, 2.4]);
P({ id: "dTrap", layer: "dFill", shape: "tube", size: [0.17, 0.11, R2(DD)], rot: V, pos: [0, R2(DB + DD / 2), 0], at: frontAt, mat: "trap" });
P({ id: "dChan", layer: "dFill", shape: "cyl", size: [0.11, R2(DD + 0.04)], rot: V, pos: [0, R2(DB + DD / 2), 0], at: frontAt, mat: "chan" });
P({ id: "dFillT", layer: "dFill", shape: "ring", size: [0.17, 0.11, 0.03], rot: V, pos: [0, R2(DTOP + 0.015), 0], at: holeAt, mat: "trap" });
P({ id: "dFillTc", layer: "dFill", shape: "cyl", size: [0.11, 0.035], rot: V, pos: [0, R2(DTOP + 0.016), 0], at: holeAt, mat: "chan" });
// 千層蛋糕的「吸管」示意：一根放大的吸管從上插下去（只在 s5 後半）
LAY("dStraw", [0.6, 4, DXL + 0.55, 3.2]);
P({ id: "dStrawT", layer: "dStraw", shape: "tube", size: [0.2, 0.15, 1.6], rot: V, pos: [DH_X[0], R2(DTOP + 0.8), 2.0], mat: "trap" });

// ═════ 站 E：整合元件製造廠（x 120）：左 設計大樓（窗格），右 晶圓廠（屋頂空調機、排氣煙囪、側面百葉），中間空橋連起來 ═════
const EX = 120;
LAY("eFab", [16, 6, EX, 3]);
BOX("eGround", "eFab", EX - 8.2, EX + 8.2, 0, 0.12, -4.2, 4.2, "panel2");
// 設計大樓
const OX0 = EX - 7.6, OX1 = EX - 3.6;
BOX("eOff", "eFab", OX0, OX1, 0.12, 5.6, -2.2, 2.2, "panel"); BOX("eOffTop", "eFab", OX0 - 0.1, OX1 + 0.1, 5.6, 5.8, -2.3, 2.3, "band");
P({ id: "eOffWin", layer: "eFab", shape: "box", size: [0.62, 0.42, 0.04], pos: [0, 0, 2.21], at: Array.from({ length: 5 * 9 }, (_, i) => [R2(OX0 + 0.5 + (i % 5) * 0.75), R2(0.75 + Math.floor(i / 5) * 0.55), 0]), mat: "win" });
P({ id: "eOffFin", layer: "eFab", shape: "box", size: [0.06, 5.3, 0.12], pos: [0, 2.95, 2.25], at: Array.from({ length: 6 }, (_, i) => [R2(OX0 + 0.13 + i * 0.75), 0, 0]), mat: "steel" });
BOX("eOffDoor", "eFab", OX0 + 1.4, OX0 + 2.6, 0.12, 0.65, 2.15, 2.26, "winD");
// 晶圓廠（矮、長、屋頂設備）
const FX0 = EX - 2.2, FX1 = EX + 7.8;
BOX("eFb", "eFab", FX0, FX1, 0.12, 3.4, -3.0, 3.0, "panel2"); BOX("eFbBand", "eFab", FX0, FX1, 2.9, 3.1, 3.0, 3.06, "band");
P({ id: "eFbLouv", layer: "eFab", shape: "box", size: [1.4, 0.06, 0.04], pos: [0, 0, 3.02], at: Array.from({ length: 4 * 4 }, (_, i) => [R2(FX0 + 1.2 + (i % 4) * 2.4), R2(1.2 + Math.floor(i / 4) * 0.3), 0]), mat: "dark" });
P({ id: "eFbPan", layer: "eFab", shape: "box", size: [0.04, 3.2, 0.03], pos: [0, 1.76, 3.02], at: Array.from({ length: 9 }, (_, i) => [R2(FX0 + 1.0 + i * 1.0), 0, 0]), mat: "seam" });
P({ id: "eHvac", layer: "eFab", shape: "box", size: [1.3, 0.6, 1.4], pos: [0, 3.7, 0], at: [[FX0 + 1.4, 0, -1.4], [FX0 + 3.2, 0, -1.4], [FX0 + 5.0, 0, -1.4], [FX0 + 6.8, 0, -1.4]], mat: "roof" });
P({ id: "eHvacFan", layer: "eFab", shape: "cyl", size: [0.45, 0.05], rot: V, pos: [0, 4.02, 0], at: [[FX0 + 1.4, 0, -1.4], [FX0 + 3.2, 0, -1.4], [FX0 + 5.0, 0, -1.4], [FX0 + 6.8, 0, -1.4]], mat: "darker" });
P({ id: "eStack", layer: "eFab", shape: "cyl", size: [0.32, 2.4], rot: V, pos: [0, 4.6, 1.2], at: [[FX0 + 2.2, 0, 0], [FX0 + 6.0, 0, 0]], mat: "steel2" });
P({ id: "eStackBand", layer: "eFab", shape: "cyl", size: [0.34, 0.2], rot: V, pos: [0, 5.5, 1.2], at: [[FX0 + 2.2, 0, 0], [FX0 + 6.0, 0, 0]], mat: "mark" });
P({ id: "eDuct", layer: "eFab", shape: "box", size: [6.0, 0.3, 0.3], pos: [R2(FX0 + 4.1), 3.55, 0.4], mat: "steel" });
// 空橋（設計 → 製造）
BOX("eBridge", "eFab", OX1, FX0, 2.4, 3.0, -0.6, 0.6, "panel"); P({ id: "eBridgeWin", layer: "eFab", shape: "box", size: [0.3, 0.3, 0.03], pos: [0, 2.7, 0.61], at: [[OX1 + 0.4, 0, 0], [OX1 + 0.95, 0, 0], [OX1 + 1.5, 0, 0]], mat: "win" });
// 一片晶圓沿空橋從設計送到製造（示意：設計好的電路圖交給同一家的廠）
actions.eHand = { type: "flow", _說明: "設計圖從設計大樓沿空橋送進晶圓廠（同一家公司）", layer: "eFab", path: [[OX1 - 0.4, 3.15, 0], [FX0 + 0.6, 3.15, 0], [FX0 + 2.6, 3.15, 0]], n: 3, size: 0.13, shape: "dot", rate: 0.5, color: "chg", track: false };
actions.eOffGlow = { type: "pulse", parts: ["eOffWin"], color: "winC", glow: 0.7, freq: 0.8, halo: 0 };
actions.eFabGlow = { type: "pulse", parts: ["eFbLouv", "eStackBand"], color: "lampY", glow: 0.6, freq: 0.9, halo: 0 };
actions.eFan = { type: "rotate", parts: ["eHvacFan"], axis: [0, 1, 0], pivot: [FX0 + 1.4, 4.02, -1.4], rps: 0.8, rampSpin: true };

// ═════ 站 F／G：公司展示台（x 150：全球三家｜x 180：台灣三家）：檯座正面 LOGO（或文字名牌）＋國旗，檯面放該公司做的記憶體 ═════
const brandItems = ["flag:KR", "flag:US", "flag:TW"];
const LOGO_OK = (id) => fs.existsSync(path.join(HERE, "..", "..", "public", "logos", `${id}.svg`)) || fs.existsSync(path.join(HERE, "..", "..", "public", "logos", `${id}.png`));
const CO = [
  ["F", 150, [["samsung", "三星", "KR", "dram"], ["skhynix", "SK 海力士", "KR", "dram"], ["micron", "美光", "US", "dram"]]],
  ["G", 180, [["nanya", "南亞科|2408", "TW", "dram"], ["winbond", "華邦電|2344", "TW", "both"], ["macronix", "旺宏|2337", "TW", "flash"]]],
];
for (const [, , list] of CO) for (const [id, name] of list) brandItems.push(LOGO_OK(id) ? `logo:${id}` : `text:${id}=${name}`);
{ const r = spawnSync("node", [path.join(HERE, "..", "..", "scripts", "three", "make-brand-tex.mjs"), "tech-memfab", ...brandItems], { encoding: "utf8" }); if (r.status !== 0) { console.error(r.stderr); process.exit(1); } }
const BMETA = JSON.parse(fs.readFileSync(path.join(HERE, "..", "..", "public", "tex", "brand", "meta.json"), "utf8"));
for (const c of ["KR", "US", "TW"]) materials[`flag_${c}`] = { kind: "unlit", color: "#FFFFFF", img: `tex/brand/flag-${c}.png` };
for (const [S, X, list] of CO) list.forEach(([id, , flag, kind], k) => {
  const L = `${S.toLowerCase()}P${k}`, x = X + (k - 1) * 4.0; LAY(L, [3.6, 3.6, x, 1.8]);
  const h = plinth(L, L, x, 0, 3.6, 3.4, 1.2);
  materials[`t_${id}`] = { kind: "unlit", color: "#FFFFFF", img: `tex/brand/sign-${id}.png` };
  const ar = BMETA[`sign-${id}`]?.aspect ?? 3.2, sw = 2.4, sh = R2(Math.min(0.8, sw / ar));
  P({ id: `${L}Sign`, layer: L, shape: "plane", size: [sw, sh], pos: [R2(x + 0.35), 0.62, 1.72], mat: `t_${id}`, uv01: true });
  const fw = 0.72, fh = flag === "US" ? 0.38 : 0.48;
  P({ id: `${L}Flag`, layer: L, shape: "plane", size: [fw, fh], pos: [R2(x - 1.45), 0.62, 1.72], mat: `flag_${flag}`, uv01: true });
  // 檯面：一片晶圓立在架上（晶粒格）＋前面放封裝好的晶片
  const wy = h + 1.35, wz = -0.7;
  BOX(`${L}Easel`, L, x - 0.1, x + 0.1, h, wy - 0.8, wz - 0.25, wz - 0.12, "dark");
  BOX(`${L}EaselF`, L, x - 0.9, x + 0.9, h, h + 0.1, wz - 0.3, wz + 0.15, "dark");
  P({ id: `${L}Waf`, layer: L, shape: "cyl", size: [1.2, 0.05], pos: [x, wy, wz], mat: "wafer" });
  const wd = []; for (let i = -4; i <= 4; i++) for (let j = -4; j <= 4; j++) if (Math.hypot(Math.abs(i * 0.26) + 0.13, Math.abs(j * 0.26) + 0.13) < 1.15) wd.push([R2(x + i * 0.26), R2(wy + j * 0.26), 0]);
  P({ id: `${L}WafD`, layer: L, shape: "box", size: [0.22, 0.22, 0.02], pos: [0, 0, R2(wz + 0.035)], at: wd, mat: kind === "flash" ? "trap" : "die" });
  if (kind !== "flash") fbga(`${L}Dr`, L, R2(x - (kind === "both" ? 0.8 : 0.3)), h, 0.7, 0.9, 0.7, 0.14, 3);
  if (kind !== "dram") soic8(`${L}Nor`, L, R2(x + (kind === "both" ? 0.7 : -0.6)), h, 0.7, 1.4);
  if (kind === "flash") fbga(`${L}Nd`, L, R2(x + 0.8), h, 0.7, 0.9, 0.8, 0.16, 3);
});
actions.fNod = { type: "pulse", parts: ["fP0WafD", "fP1WafD", "fP2WafD"], color: "chg", glow: 0.35, freq: 0.6, halo: 0 };

// ═════ 站 H：美光台灣（x 210）：一座晶圓廠（長條、雙排氣塔、側面管架，和 E 站外型不同）＋高頻寬記憶體堆疊（12 層晶片疊在底層晶片上） ═════
const HX = 210;
LAY("hFab", [10, 4, HX - 2.5, 2]);
BOX("hGround", "hFab", HX - 8, HX + 2.2, 0, 0.12, -3.6, 3.6, "panel2");
BOX("hFb", "hFab", HX - 7.6, HX + 1.6, 0.12, 2.6, -2.6, 1.4, "panel"); BOX("hFbRoof", "hFab", HX - 7.7, HX + 1.7, 2.6, 2.75, -2.7, 1.5, "roof");
BOX("hFbHi", "hFab", HX - 7.6, HX - 3.2, 2.75, 4.2, -2.6, 0.4, "panel2");
P({ id: "hFbStripe", layer: "hFab", shape: "box", size: [9.2, 0.18, 0.03], pos: [R2(HX - 3), 0, 1.42], at: [[0, 0.7, 0], [0, 1.5, 0], [0, 2.3, 0]], mat: "screen" });
P({ id: "hTower", layer: "hFab", shape: "cyl", size: [0.5, 2.0], rot: V, pos: [0, 3.75, -1.6], at: [[HX - 1.6, 0, 0], [HX + 0.3, 0, 0]], mat: "steel2" });
P({ id: "hTowerTop", layer: "hFab", shape: "cyl", size: [0.56, 0.15], rot: V, pos: [0, 4.8, -1.6], at: [[HX - 1.6, 0, 0], [HX + 0.3, 0, 0]], mat: "dark" });
P({ id: "hRack", layer: "hFab", shape: "box", size: [0.08, 1.4, 0.08], pos: [0, 0.82, 2.2], at: Array.from({ length: 6 }, (_, i) => [R2(HX - 7 + i * 1.6), 0, 0]), mat: "steel" });
P({ id: "hPipe", layer: "hFab", shape: "cyl", size: [0.08, 8.2], rot: [0, 90, 0], pos: [R2(HX - 3), 0, 2.2], at: [[0, 1.2, 0], [0, 1.4, 0], [0, 1.6, -0.0]], mat: "steel2" });
P({ id: "hDock", layer: "hFab", shape: "box", size: [0.9, 0.9, 0.04], pos: [0, 0.57, 1.42], at: [[HX - 6.4, 0, 0], [HX - 5.2, 0, 0]], mat: "seam" });
// 高頻寬記憶體：底層晶片＋12 層薄晶片，側面看得到每層與填充膠，前面一排矽穿孔亮點
LAY("hHbm", [3, 3, HX + 5.2, 1.8]);
const HH = plinth("hh", "hHbm", HX + 5.2, 0.6, 3.2, 3.2, 0.9);
BOX("hhBase", "hHbm", HX + 4.0, HX + 6.4, HH, HH + 0.22, -0.4, 1.6, "base");
for (let k = 0; k < 12; k++) { const y = R2(HH + 0.26 + k * 0.155); BOX(`hhD${k}`, "hHbm", HX + 4.05, HX + 6.35, y, R2(y + 0.11), -0.35, 1.55, "hbm"); BOX(`hhG${k}`, "hHbm", HX + 4.1, HX + 6.3, R2(y - 0.04), y, -0.3, 1.5, "ox"); }
P({ id: "hhTsv", layer: "hHbm", shape: "box", size: [0.04, R2(12 * 0.155), 0.02], pos: [0, R2(HH + 0.22 + 6 * 0.155), 1.56], at: Array.from({ length: 10 }, (_, i) => [R2(HX + 4.35 + i * 0.19), 0, 0]), mat: "padGold" });
actions.hTsvGlow = { type: "pulse", parts: ["hhTsv"], color: "lampY", glow: 0.7, freq: 1.2, halo: 0 };

// ═════ 站 N：下一集（x 240）：矽晶圓（念到「撐不住」出現裂紋＋紅光）、碳化矽（透明綠）、氮化鎵（金色，長在基板上），中間一道高壓閃電 ═════
const NX = 240;
const NW = [["nSi", -4.2, "wafer"], ["nSiC", 0, "sic"], ["nGaN", 4.2, "gan"]];
for (const [id, dx, mat] of NW) {
  const x = NX + dx; LAY(id, [3.4, 3.6, x, 1.9]); const h = plinth(id, id, x, 0, 3.2, 2.6, 0.7);
  BOX(`${id}Stand`, id, x - 0.12, x + 0.12, h, h + 0.6, -0.3, -0.1, "dark"); BOX(`${id}Foot`, id, x - 1.0, x + 1.0, h, h + 0.1, -0.5, 0.2, "dark");
  P({ id: `${id}W`, layer: id, shape: "cyl", size: [1.35, 0.06], pos: [x, R2(h + 1.55), 0], mat });
  P({ id: `${id}Flat`, layer: id, shape: "box", size: [0.7, 0.08, 0.08], pos: [x, R2(h + 0.24), 0], mat: "darker" });
}
const NSIH = 0.75;
LAY("nCrack", [2, 2, NX - 4.2, 2.3]);
P({ id: "nCrackA", layer: "nCrack", shape: "box", size: [1.3, 0.04, 0.02], pos: [R2(NX - 4.3), R2(NSIH + 1.6), 0.05], rot: [0, 0, 32], mat: "crack" });
P({ id: "nCrackB", layer: "nCrack", shape: "box", size: [0.9, 0.04, 0.02], pos: [R2(NX - 3.9), R2(NSIH + 1.35), 0.05], rot: [0, 0, -40], mat: "crack" });
P({ id: "nCrackC", layer: "nCrack", shape: "box", size: [0.7, 0.04, 0.02], pos: [R2(NX - 4.7), R2(NSIH + 1.9), 0.05], rot: [0, 0, 70], mat: "crack" });
LAY("nBolt", [1, 2, NX - 4.2, 4]);
P({ id: "nBoltP", layer: "nBolt", shape: "poly", pts: [[0.1, 1.0], [-0.35, 0.05], [-0.02, 0.05], [-0.25, -0.9], [0.4, 0.2], [0.05, 0.2], [0.3, 1.0]], size: [1, 2, 0.08], pos: [R2(NX - 4.2), 3.9, 0], mat: "bolt" });
actions.nBoltGlow = { type: "pulse", parts: ["nBoltP"], color: "boltC", glow: 0.9, freq: 2.0, halo: 0 };
actions.nSicSpin = { type: "rotate", parts: ["nSiCW", "nGaNW"], axis: [0, 1, 0], pivot: [NX, 2.3, 0], rps: 0.0, rampSpin: true };
delete actions.nSicSpin;

// 標註點
Object.assign(anchors, {
  aWafA: A("aWafer", [AX + 2.6, R2(AWY + 0.1), 2.6], 150, -100), aDieA: A("aWafer", [AX - 1.0, R2(AWY + 0.11), 1.0], -150, -100),
  bDimmA: A("bDimm", [DX0 + 1.8, R2(DY + 0.25), -0.6], -150, -100), bSsdA: A("bSsd", [SX0 + 2.9, R2(SY + 0.25), -0.4], 150, -100), bNorA: A("bNor", [NX0 + 0.7, R2(NY0 + 0.35), 0.2], 150, -100),
  cCapA: A("cArr", [CX + 2.25, R2(CB + CAPH), 1.9], 150, -100), cWLA: A("cArr", [CX + 3.3, R2(CY1 + 0.08), 2.2], 150, 100), cCellA: A("cCell", [CX - 3.15, R2(CB + CAPH * 0.5), 1.9], -150, -100),
  dStackA: A("dL8", [DXL + 0.2, DLY(8), 2.0], -150, -100), dHoleA: A("dHole0", [DH_X[3], R2(DTOP - 0.4), 2.0], 150, -100), dFillA: A("dFill", [DH_X[5], R2(DB + DD * 0.5), 2.0], 150, 100), dStairA: A("dStair", [DXR - 1.0, R2(DTOP + 0.6), -1.0], 150, -100),
  eOffA: A("eFab", [OX0 + 2, 4.5, 2.2], -150, -100), eFbA: A("eFab", [FX0 + 6, 2.2, 3.0], 150, -100),
  hFabA: A("hFab", [HX - 3, 2.0, 1.4], -150, -100), hHbmA: A("hHbm", [HX + 6.3, R2(HH + 1.2), 1.55], 150, -100),
  nSiA: A("nSi", [NX - 4.2, 2.3, 0.1], -150, -100), nSiCA: A("nSiC", [NX, 2.3, 0.1], 150, -100), nGaNA: A("nGaN", [NX + 4.2, 2.3, 0.1], 150, -100),
});

const model = {
  name: "示意 記憶體製造：記憶體晶圓、三種記憶體（模組／固態硬碟／開機晶片）、動態記憶體陣列（開關＋高瘦電容）、儲存型快閃疊層與深孔、整合元件製造廠、全球與台灣廠商、美光台灣、下一集化合物半導體晶圓（示意，非特定廠牌／型號）",
  unit: "示意（放大）",
  size: { w: 40, h: 18, r: 0.6, t: 30 },
  palette, materials,
  partNames: { aWaf: "晶圓", cCapO: "電容", dL8w: "導體層" },
  layers, parts, anchors, actions,
  pose: { yaw0: 0, yawIso: 0, drift: 0 },
  camera: { stand: { d: 70, elev: 24, y: 4 } },
  fx: { dpr: 1, srcPx: 30, shadows: 0, fog: false, dust: false, vaporSprites: false, shimmer: false },
  info: { AX, BX, CX, DX: DXc, EX, HX, NX, DN, DTOP: R2(DTOP), CB: R2(CB), CAPH },
};
fs.writeFileSync(path.join(HERE, "model.json"), JSON.stringify(model, null, 1) + "\n");
console.log(`✔ model.json：${parts.length} 個零件、${parts.reduce((a, p) => a + Math.max(1, p.at?.length ?? 0), 0)} 個實體、${layers.length} 層`);

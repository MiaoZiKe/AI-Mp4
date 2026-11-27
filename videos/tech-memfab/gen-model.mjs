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
  siC: "#5E6B82", siHi: "#8A97B0", waferC: "#7C89A6", dieC: "#4C5E86", chipC: "#2E3442", chipTop: "#3A4152", chipLab: "#8E97A8", pcbC: "#1E6B4E", pcbD: "#16523B", ssdC: "#2B5C8A",
  oxC: "#E6EBF2", wlC: "#4A5876", blC: "#C8794A", capC: "#B8C2D4", capIn: "#7E8AA2", chg: "#2FD3E0", plugC: "#8E9BB0", trapC: "#E0A43A", chanC: "#6FB38F", wC: "#9AA6BC",
  holeC: "#151922", etchC: "#B07CF0", glassC: "#BFD3F2", winC: "#5B8DEF", winD: "#2F4A7A", roofC: "#B6C0CF", hbmC: "#4E5A74", baseC: "#3B6E8F",
  sicC: "#3FA37A", ganC: "#9EA3B5", crackC: "#8FD3FF", boltC: "#F2B632", markC: "#E8613C", chgD: "#4E8C99", dielC: "#D9A441", dopeC: "#C46A6A", whiteP: "#FFFFFF",
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
  chipLab: M("std", "chipLab", { rough: 0.6, metal: 0.1 }), silkW: M("std", "whiteP", { rough: 0.7, metal: 0 }),
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
  sic: M("phys", "sicC", { rough: 0.05, metal: 0, clearcoat: 1, opacity: 0.8, env: 0.9 }), gan: M("std", "ganC", { rough: 0.06, metal: 0.9, env: 1.3 }),
  diel: M("std", "dielC", { rough: 0.4, metal: 0.1, env: 0.4 }), dope: M("std", "dopeC", { rough: 0.5, metal: 0.2 }), coreOx: M("std", "whiteP", { rough: 0.6, metal: 0 }),
  cellM: glowM("markC", 1, 0.8), trapG: glowM("trapC", 1, 0.7), mirror: M("std", "waferC", { rough: 0.05, metal: 0.95, env: 1.4 }),
  crack: glowM("crackC", 1, 0.9), arcHalo: glowM("crackC", 0.35, 0.6), chgBase: M("std", "chgD", { rough: 0.4, metal: 0.2, env: 0.4 }), bolt: glowM("boltC", 1, 0.7), mark: M("std", "markC", { rough: 0.5, metal: 0, emissive: "markC", ei: 0.25 }), white: M("std", "whiteP", { rough: 0.7, metal: 0 }),
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

// ═════ 站 B：一片主機板（x 30）：後排兩條直立插著的記憶體模組（動態記憶體）｜前左 M.2 固態硬碟（儲存型快閃）｜前右 開機晶片（編碼型快閃，SOIC-8）＋處理器插座 ═════
const BX = 30;
LAY("bBase", [14, 1, BX, 0.4]);
const BH = plinth("b", "bBase", BX, 0, 14.4, 7.4, 0.7);
LAY("bMb", [13.6, 0.5, BX, 0.8]);
const MB = BH + 0.12, MX0 = BX - 6.8, MX1 = BX + 6.8;
BOX("bmBoard", "bMb", MX0, MX1, BH, MB, -3.4, 3.4, "pcb");
P({ id: "bmHole", layer: "bMb", shape: "cyl", size: [0.16, 0.01], rot: V, pos: [0, R2(MB + 0.003), 0], at: [[MX0 + 0.35, 0, -3.05], [MX1 - 0.35, 0, -3.05], [MX0 + 0.35, 0, 3.05], [MX1 - 0.35, 0, 3.05]], mat: "padGold" });
P({ id: "bmTr", layer: "bMb", shape: "box", size: [0.03, 0.006, 2.1], pos: [0, R2(MB + 0.004), -0.15], at: Array.from({ length: 24 }, (_, i) => [R2(MX0 + 0.9 + i * 0.36), 0, 0]), mat: "padGold" });
P({ id: "bmCap", layer: "bMb", shape: "cyl", size: [0.13, 0.32], rot: V, pos: [0, R2(MB + 0.16), 0], at: [[BX + 3.6, 0, -2.9], [BX + 3.95, 0, -2.9], [BX + 4.3, 0, -2.9], [BX + 4.65, 0, -2.9], [BX + 6.2, 0, -0.4], [BX + 6.2, 0, 0.0]], mat: "steel2" });
// 兩條記憶體插槽（黑色長槽＋兩端白色卡榫）＋直立的記憶體模組：綠板、正面 8 顆晶片（頂面淺色印字區）、序號小晶片、電阻排
const DX0 = BX - 6.2, DX1 = BX + 2.2, SLZ = [-2.2, -1.1], DMH = 1.9, DMB = MB + 0.3;
SLZ.forEach((z, s) => {
  const L = s ? "bDimm" : "bDimm2"; LAY(L, [8.6, 2.4, BX - 2, 1.9]);
  BOX(`${L}Slot`, L, DX0 - 0.35, DX1 + 0.35, MB, R2(DMB + 0.02), R2(z - 0.13), R2(z + 0.13), "darker");
  P({ id: `${L}Latch`, layer: L, shape: "box", size: [0.14, 0.42, 0.24], pos: [0, R2(MB + 0.26), z], at: [[R2(DX0 - 0.45), 0, 0], [R2(DX1 + 0.45), 0, 0]], mat: "white" });
  BOX(`${L}Pcb`, L, DX0, DX1, DMB, R2(DMB + DMH), R2(z - 0.035), R2(z + 0.035), "pcb");
  for (let c = 0; c < 8; c++) { const cx = R2(DX0 + 0.62 + c * 1.0 + (c >= 4 ? 0.2 : 0));
    BOX(`${L}C${c}`, L, cx - 0.38, cx + 0.38, R2(DMB + 0.55), R2(DMB + 1.5), R2(z + 0.035), R2(z + 0.135), "chip");
    BOX(`${L}Cl${c}`, L, cx - 0.3, cx + 0.3, R2(DMB + 1.1), R2(DMB + 1.42), R2(z + 0.135), R2(z + 0.14), "chipLab"); }
  BOX(`${L}Spd`, L, R2(DX0 + 4.2), R2(DX0 + 4.55), R2(DMB + 0.2), R2(DMB + 0.45), R2(z + 0.035), R2(z + 0.08), "chip");
  P({ id: `${L}Res`, layer: L, shape: "box", size: [0.2, 0.08, 0.05], pos: [0, R2(DMB + 0.3), R2(z + 0.06)], at: Array.from({ length: 8 }, (_, i) => [R2(DX0 + 0.62 + i * 1.0 + (i >= 4 ? 0.2 : 0)), 0, 0]), mat: "steel" });
  P({ id: `${L}Fing`, layer: L, shape: "box", size: [0.08, 0.16, 0.012], pos: [0, R2(DMB + 0.1), R2(z + 0.04)], at: Array.from({ length: 36 }, (_, i) => [R2(DX0 + 0.25 + i * 0.225 + (i >= 18 ? 0.2 : 0)), 0, 0]), mat: "padGold" });
});
// 前面那條模組的晶片正面：一格格「資料」亮點（扁平發光格，有電亮、斷電熄）
LAY("bBits", [8, 1, BX - 2, 2]);
const zf = R2(SLZ[1] + 0.142), bits = [];
for (let c = 0; c < 8; c++) for (let i = 0; i < 3; i++) for (let j = 0; j < 2; j++) if ((c * 7 + i * 3 + j * 5) % 3) bits.push([R2(DX0 + 0.62 + c * 1.0 + (c >= 4 ? 0.2 : 0) + (i - 1) * 0.22), R2(DMB + 0.72 + j * 0.24), 0]);
P({ id: "bBit", layer: "bBits", shape: "box", size: [0.16, 0.16, 0.012], pos: [0, 0, zf], at: bits, mat: "chg" });
actions.bBitGlow = { type: "pulse", _說明: "動態記憶體有電時資料亮點閃（斷電後整層藏起來＝清空）", parts: ["bBit"], color: "chg", glow: 0.9, freq: 1.6, halo: 0 };
// 電源燈：有電綠、斷電紅
LAY("bPwr", [0.4, 0.3, MX0 + 0.8, 1]); SPH("bPwrG", "bPwr", 0.14, R2(MX0 + 0.8), R2(MB + 0.1), 2.9, "lampG");
LAY("bPwrOff", [0.4, 0.3, MX0 + 0.8, 1]); SPH("bPwrR", "bPwrOff", 0.14, R2(MX0 + 0.8), R2(MB + 0.1), 2.9, "lampR");
// M.2 固態硬碟（平躺在主機板 M.2 插槽上）：深藍板＋控制晶片＋兩顆快閃＋快取（頂面印字區）、金手指插進插槽、另一端銅柱螺絲
LAY("bSsd", [5.4, 0.6, BX - 3.4, 0.9]);
const SX0 = BX - 6.0, SX1 = BX - 0.9, SZ = 1.9, SY = MB + 0.14;
BOX("bsSlot", "bSsd", SX0 - 0.5, SX0 + 0.05, MB, R2(SY + 0.16), SZ - 0.75, SZ + 0.75, "darker");
BOX("bsBoard", "bSsd", SX0, SX1, SY, R2(SY + 0.06), SZ - 0.7, SZ + 0.7, "ssd");
P({ id: "bsStand", layer: "bSsd", shape: "cyl", size: [0.13, R2(SY - MB)], rot: V, pos: [R2(SX1 - 0.15), R2((MB + SY) / 2), SZ], mat: "gold" });
P({ id: "bsScrew", layer: "bSsd", shape: "cyl", size: [0.17, 0.06], rot: V, pos: [R2(SX1 - 0.15), R2(SY + 0.09), SZ], mat: "steel2" });
for (const [id, cx, w, d] of [["bsCtl", SX0 + 0.95, 0.85, 0.85], ["bsN0", SX0 + 2.3, 1.05, 1.0], ["bsN1", SX0 + 3.55, 1.05, 1.0], ["bsDr", SX0 + 0.95, 0.0, 0]]) {
  if (!w) continue; const cy = R2(SY + 0.06);
  BOX(`${id}B`, "bSsd", R2(cx - w / 2), R2(cx + w / 2), cy, R2(cy + 0.12), R2(SZ - d / 2), R2(SZ + d / 2), "chip");
  BOX(`${id}L`, "bSsd", R2(cx - w / 2 + 0.08), R2(cx + w / 2 - 0.08), R2(cy + 0.12), R2(cy + 0.125), R2(SZ - d / 2 + 0.08), R2(SZ + d / 2 - 0.3), "chipLab");
}
P({ id: "bsCap", layer: "bSsd", shape: "box", size: [0.1, 0.06, 0.06], pos: [0, R2(SY + 0.09), R2(SZ - 0.58)], at: Array.from({ length: 9 }, (_, i) => [R2(SX0 + 1.6 + i * 0.36), 0, 0]), mat: "steel" });
LAY("bSsdBits", [3, 0.3, SX0 + 2.9, 1]);
const sbits = []; for (const cx of [SX0 + 2.3, SX0 + 3.55]) for (let i = 0; i < 3; i++) for (let j = 0; j < 2; j++) sbits.push([R2(cx + (i - 1) * 0.28), 0, R2(SZ + 0.12 + j * 0.24)]);
P({ id: "bsBit", layer: "bSsdBits", shape: "box", size: [0.16, 0.012, 0.16], pos: [0, R2(SY + 0.19), 0], at: sbits, mat: "trap" });
actions.bSsdGlow = { type: "pulse", _說明: "儲存型快閃：斷電後亮點仍在（資料不消失）", parts: ["bsBit"], color: "trapC", glow: 0.6, freq: 0.6, halo: 0 };
// 開機晶片（SOIC-8，焊在主機板上）＋處理器插座（框、針腳格、壓桿）＋處理器；走線從開機晶片連到處理器
LAY("bNor", [4, 0.8, BX + 3.4, 1]);
const NX0 = BX + 1.6, NZ = 2.0;
soic8("bnChip", "bNor", NX0, MB, NZ, 1.6);
BOX("bnSilk", "bNor", NX0 - 0.55, NX0 + 0.55, MB, R2(MB + 0.006), NZ - 0.52, NZ + 0.52, "silkW");
BOX("bnSilk2", "bNor", NX0 - 0.5, NX0 + 0.5, MB, R2(MB + 0.008), NZ - 0.47, NZ + 0.47, "pcb");
const CPX = BX + 4.6, CPZ = 0.6;
BOX("bnSock", "bNor", CPX - 1.3, CPX + 1.3, MB, R2(MB + 0.16), CPZ - 1.3, CPZ + 1.3, "dark");
BOX("bnSockIn", "bNor", CPX - 1.05, CPX + 1.05, R2(MB + 0.16), R2(MB + 0.17), CPZ - 1.05, CPZ + 1.05, "darker");
BOX("bnCpu", "bNor", CPX - 0.95, CPX + 0.95, R2(MB + 0.17), R2(MB + 0.27), CPZ - 0.95, CPZ + 0.95, "steel2");
BOX("bnCpuIhs", "bNor", CPX - 0.75, CPX + 0.75, R2(MB + 0.27), R2(MB + 0.33), CPZ - 0.75, CPZ + 0.75, "steel");
P({ id: "bnLever", layer: "bNor", shape: "cyl", size: [0.04, 2.6], pos: [R2(CPX + 1.42), R2(MB + 0.12), CPZ], mat: "steel2" });
P({ id: "bnTr", layer: "bNor", shape: "box", size: [R2(CPX - 1.3 - NX0 - 0.45), 0.008, 0.035], pos: [R2((CPX - 1.3 + NX0 + 0.45) / 2), R2(MB + 0.004), 0], at: [[0, 0, 1.75], [0, 0, 1.87], [0, 0, 1.99], [0, 0, 2.11]], mat: "padGold" });
P({ id: "bnTrV", layer: "bNor", shape: "box", size: [0.035, 0.008, 0.9], pos: [R2(CPX - 1.45), R2(MB + 0.004), 1.5], at: [[0, 0, 0], [0.12, 0, 0]], mat: "padGold" });
actions.bBoot = { type: "flow", _說明: "開機：指令從開機晶片沿走線送到處理器", layer: "bNor", path: [[R2(NX0 + 0.5), R2(MB + 0.04), 1.93], [R2(CPX - 1.45), R2(MB + 0.04), 1.93], [R2(CPX - 1.45), R2(MB + 0.04), 1.05], [R2(CPX - 0.9), R2(MB + 0.3), 0.8]], n: 4, size: 0.07, shape: "dot", rate: 0.7, color: "chg", track: false };
actions.bSsdSteady = { type: "pulse", _說明: "斷電後：儲存型快閃的亮點穩定亮著、不再閃（資料還在）", parts: ["bsBit"], color: "trapC", glow: 0.6, steady: true, halo: 0 };
actions.bNorGlow = { type: "pulse", parts: ["bnChipT"], color: "lampY", glow: 0.8, freq: 1.0, halo: 0 };


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
// 電容：落腳墊＋外殼（上電極）＋介電層＋內電極；8 × 5＝40 根，高 3；前排（z 1.9）剖開成階梯：外殼只到 1/3、介電層到 2/3、內電極整根露出
const CCAP = []; for (let i = 0; i < 8; i++) for (let j = 0; j < 5; j++) CCAP.push([R2(CX - 3.15 + i * 0.9), 0, R2(-1.9 + j * 0.95)]);
const CBACK = CCAP.filter(([, , z]) => z < 1.5), CFRONT = CCAP.filter(([, , z]) => z > 1.5);
const CAPH = 3.0, CB = CY1 + 0.22;
P({ id: "cPad", layer: "cArr", shape: "cyl", size: [0.24, 0.06], rot: V, pos: [0, R2(CB - 0.03), 0], at: CCAP, mat: "plug" });
P({ id: "cPlug", layer: "cArr", shape: "cyl", size: [0.09, 0.2], rot: V, pos: [0, R2(CY1 + 0.1), 0], at: CCAP.map(([x, , z]) => [R2(x + 0.12), 0, R2(z + 0.22)]), mat: "plug" });
P({ id: "cCapO", layer: "cArr", shape: "tube", size: [0.2, 0.15, CAPH], rot: V, pos: [0, R2(CB + CAPH / 2), 0], at: CBACK, mat: "cap" });
P({ id: "cCapI", layer: "cArr", shape: "cyl", size: [0.12, R2(CAPH - 0.1)], rot: V, pos: [0, R2(CB + CAPH / 2 - 0.05), 0], at: CBACK, mat: "capIn" });
P({ id: "cCapFO", layer: "cArr", shape: "tube", size: [0.2, 0.17, 1.0], rot: V, pos: [0, R2(CB + 0.5), 0], at: CFRONT, mat: "cap" });
P({ id: "cCapFD", layer: "cArr", shape: "tube", size: [0.17, 0.125, 2.0], rot: V, pos: [0, R2(CB + 1.0), 0], at: CFRONT, mat: "diel" });
P({ id: "cCapFI", layer: "cArr", shape: "cyl", size: [0.12, R2(CAPH - 0.1)], rot: V, pos: [0, R2(CB + CAPH / 2 - 0.05), 0], at: CFRONT, mat: "capIn" });
// 後四排上面蓋共用上電極板（剖開：前排露出來）
BOX("cTopPlate", "cArr", CX - 3.8, CX + 3.8, R2(CB + CAPH + 0.02), R2(CB + CAPH + 0.2), -2.4, 1.4, "steel2");
// 前面剖面：每格一顆電晶體（源極、汲極＝摻雜區；中間埋入式閘極＝字元線＋閘氧化層），汲極接觸柱往上接電容落腳墊
const FZ = 2.41;
for (let i = 0; i < 8; i++) { const x = R2(CX - 3.15 + i * 0.9);
  BOX(`cSrc${i}`, "cArr", R2(x - 0.36), R2(x - 0.12), R2(CY1 - 0.28), R2(CY1 - 0.005), 2.4, FZ, "dope");
  BOX(`cDrn${i}`, "cArr", R2(x + 0.06), R2(x + 0.3), R2(CY1 - 0.28), R2(CY1 - 0.005), 2.4, FZ, "dope");
  BOX(`cGox${i}`, "cArr", R2(x - 0.12), R2(x + 0.06), R2(CY1 - 0.5), R2(CY1 - 0.005), 2.4, R2(FZ + 0.004), "ox");
  BOX(`cGate${i}`, "cArr", R2(x - 0.095), R2(x + 0.035), R2(CY1 - 0.475), R2(CY1 - 0.06), 2.4, R2(FZ + 0.008), "wl");
  BOX(`cCt${i}`, "cArr", R2(x + 0.12), R2(x + 0.22), R2(CY1 - 0.01), R2(CB - 0.05), R2(FZ - 0.06), R2(FZ + 0.004), "plug"); }
// 存了「1」的電容：前排內電極整根發光（電荷），慢慢暗掉、一下補滿（刷新，鋸齒）；後排只在頂端露出一圈光
const CONE = CFRONT.filter((_, k) => k % 3 !== 1), CONEB = CBACK.filter((_, k) => (k * 5 + 3) % 3 !== 0);
LAY("cChg", [8, 3, CX, 2.6]);
P({ id: "cChgI", layer: "cChg", shape: "cyl", size: [0.125, R2(CAPH - 0.12)], rot: V, pos: [0, R2(CB + CAPH / 2 - 0.04), 0], at: CONE, mat: "chgBase" });
P({ id: "cChgT", layer: "cChg", shape: "cyl", size: [0.12, 0.04], rot: V, pos: [0, R2(CB + CAPH + 0.21), 0], at: CONEB.filter(([, , z]) => z > 1.4), mat: "chg" });
actions.cLeak = { type: "pulse", _說明: "電荷慢慢漏掉、再被一下補滿（刷新，鋸齒，示意）", parts: ["cChgI", "cChgT"], color: "chg", glow: 0.95, freq: 0.55, halo: 0, saw: true };
actions.cWLGlow = { type: "pulse", _說明: "開關打開：字元線（閘極）先亮", parts: ["cWL", "cGate0", "cGate1", "cGate2", "cGate3", "cGate4", "cGate5", "cGate6", "cGate7"], color: "lampY", glow: 0.8, freq: 1.2, halo: 0 };
actions.cFill = { type: "flow", _說明: "開關打開：電荷從位元線經汲極接觸柱、落腳墊流進前排電容", layer: "cArr", path: [[CX + 0.17, R2(CY1 + 0.15), 2.14], [CX + 0.17, R2(CB + 0.05), 2.14], [CX, R2(CB + 0.3), 2.14], [CX, R2(CB + CAPH - 0.3), 2.14]], n: 4, lanes: 8, laneDir: [1, 0, 0], laneGap: 0.9, size: 0.07, shape: "dot", rate: 0.9, color: "chg", track: false };
// 一個「開關＋電容」單元框起來（念到「每一格」時）：亮橘方框（12 條邊）
LAY("cCell", [1, 3.6, CX - 3.15, 2.8]);
{ const x0 = R2(CX - 3.6), x1 = R2(CX - 2.7), y0 = R2(CY1 - 0.55), y1 = R2(CB + CAPH + 0.12), z0 = 1.42, z1 = 2.46, t = 0.035;
  P({ id: "cCellV", layer: "cCell", shape: "box", size: [t, R2(y1 - y0), t], pos: [0, R2((y0 + y1) / 2), 0], at: [[x0, 0, z0], [x1, 0, z0], [x0, 0, z1], [x1, 0, z1]], mat: "cellM" });
  P({ id: "cCellX", layer: "cCell", shape: "box", size: [R2(x1 - x0), t, t], pos: [R2((x0 + x1) / 2), 0, 0], at: [[0, y0, z0], [0, y1, z0], [0, y0, z1], [0, y1, z1]], mat: "cellM" });
  P({ id: "cCellZ", layer: "cCell", shape: "box", size: [t, t, R2(z1 - z0)], pos: [0, 0, R2((z0 + z1) / 2)], at: [[x0, y0, 0], [x1, y0, 0], [x0, y1, 0], [x1, y1, 0]], mat: "cellM" }); }

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
// 孔的位置：左側 6 × 4 格（不碰階梯）＋最前一排剖在正面（z＝2.0）：剖面看到的是一條條直條紋（孔中心切開）
const DH_X = Array.from({ length: 6 }, (_, i) => R2(DXL + 0.55 + i * 0.62)), DH_Z = [-1.35, -0.45, 0.45, 1.35];
const holeAt = []; for (const x of DH_X) for (const z of DH_Z) holeAt.push([x, 0, z]);
const DB = DH + 0.5, DD = DTOP - DB, FF = 2.0;
// 三段鑽孔（上段→中段→下段，由上往下打通）：頂面黑點＋正面剖開的黑色直條
for (let s = 0; s < 3; s++) {
  const id = `dHole${s}`, ya = R2(DTOP - (s + 1) * DD / 3), yb = R2(DTOP - s * DD / 3); LAY(id, [4, 1.2, DXL + 2.1, R2((ya + yb) / 2)]);
  P({ id: `${id}F`, layer: id, shape: "box", size: [0.34, R2(yb - ya + 0.005), 0.012], pos: [0, R2((ya + yb) / 2), R2(FF + 0.006)], at: DH_X.map((x) => [x, 0, 0]), mat: "hole" });
  if (s === 0) P({ id: `${id}T`, layer: id, shape: "cyl", size: [0.17, 0.02], rot: V, pos: [0, R2(DTOP + 0.005), 0], at: holeAt, mat: "hole" });
  // 蝕刻離子：只打到這一段的底（跟著目前孔深）
  actions[`dEtch${s}`] = { type: "flow", ...(s === 0 ? { _說明: "蝕刻離子由上往下打進孔裡，終點跟著目前孔深（示意）" } : {}), layer: id, path: [[R2((DH_X[0] + DH_X[5]) / 2), R2(DTOP + 0.12), R2(FF + 0.03)], [R2((DH_X[0] + DH_X[5]) / 2), R2(ya + 0.05), R2(FF + 0.03)]], n: 3, lanes: 6, laneDir: [1, 0, 0], laneGap: 0.62, size: 0.07, shape: "dot", rate: 1.1, color: "etchC", track: false, accel: true };
}
// 填進去（剖面由外到內）：阻擋氧化層｜儲存層（琥珀）｜穿隧氧化層｜通道（綠）｜中心氧化柱＝像吸管
LAY("dFill", [4, 3.5, DXL + 2.1, 2.4]);
[["dFbo", 0.34, "ox"], ["dFtr", 0.28, "trap"], ["dFtu", 0.2, "ox"], ["dFch", 0.15, "chan"], ["dFco", 0.07, "coreOx"]].forEach(([id, w, mat], k) =>
  P({ id, layer: "dFill", shape: "box", size: [w, R2(DD), 0.012], pos: [0, R2(DB + DD / 2), R2(FF + 0.014 + k * 0.004)], at: DH_X.map((x) => [x, 0, 0]), mat }));
P({ id: "dFillT", layer: "dFill", shape: "ring", size: [0.17, 0.11, 0.03], rot: V, pos: [0, R2(DTOP + 0.02), 0], at: holeAt, mat: "trap" });
P({ id: "dFillTc", layer: "dFill", shape: "cyl", size: [0.11, 0.036], rot: V, pos: [0, R2(DTOP + 0.021), 0], at: holeAt, mat: "chan" });
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
[1.4, 3.2, 5.0, 6.8].forEach((dx, k) => { P({ id: `eFanB${k}`, layer: "eFab", shape: "box", size: [0.8, 0.03, 0.08], pos: [R2(FX0 + dx), 4.05, -1.4], mat: "steel" });
  P({ id: `eFanG${k}`, layer: "eFab", shape: "ring", size: [0.48, 0.42, 0.06], rot: V, pos: [R2(FX0 + dx), 4.09, -1.4], mat: "steel2" });
  P({ id: `eFanX${k}`, layer: "eFab", shape: "box", size: [0.9, 0.02, 0.03], pos: [R2(FX0 + dx), 4.12, -1.4], at: [[0, 0, -0.2], [0, 0, 0], [0, 0, 0.2]], mat: "steel2" });
  actions[`eFan${k}`] = { type: "rotate", ...(k === 0 ? { _說明: "屋頂空調風扇各自繞自己的中心轉" } : {}), parts: [`eFanB${k}`], axis: [0, 1, 0], pivot: [R2(FX0 + dx), 4.05, -1.4], rps: 0.8, rampSpin: true }; });

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
  const wy = h + 1.75, wz = -0.7;
  BOX(`${L}Easel`, L, x - 0.1, x + 0.1, h, wy - 0.8, wz - 0.25, wz - 0.12, "dark");
  BOX(`${L}EaselF`, L, x - 0.9, x + 0.9, h, h + 0.1, wz - 0.3, wz + 0.15, "dark");
  P({ id: `${L}Waf`, layer: L, shape: "cyl", size: [1.5, 0.05], pos: [x, wy, wz], mat: "mirror" });
  BOX(`${L}WafN`, L, x - 0.07, x + 0.07, R2(wy + 1.42), R2(wy + 1.52), R2(wz - 0.03), R2(wz + 0.03), "darker");
  const wd = []; for (let i = -7; i <= 7; i++) for (let j = -7; j <= 7; j++) if (Math.hypot(Math.abs(i * 0.2) + 0.1, Math.abs(j * 0.2) + 0.1) < 1.42) wd.push([R2(x + i * 0.2), R2(wy + j * 0.2), 0]);
  P({ id: `${L}WafD`, layer: L, shape: "box", size: [0.17, 0.17, 0.02], pos: [0, 0, R2(wz + 0.035)], at: wd, mat: kind === "flash" ? "trap" : "die" });
  BOX(`${L}Riser`, L, x - 1.5, x + 1.5, h, h + 0.3, 0.3, 1.1, "panel");
  const hr = h + 0.3;
  if (kind !== "flash") fbga(`${L}Dr`, L, R2(x - (kind === "both" ? 0.8 : 0.3)), hr, 0.7, 0.9, 0.7, 0.14, 3);
  if (kind !== "dram") soic8(`${L}Nor`, L, R2(x + (kind === "both" ? 0.7 : -0.6)), hr, 0.7, 1.4);
  if (kind === "flash") fbga(`${L}Nd`, L, R2(x + 0.8), hr, 0.7, 0.9, 0.8, 0.16, 3);
});
actions.fNod = { type: "pulse", parts: ["fP0WafD", "fP1WafD", "fP2WafD"], color: "chg", glow: 0.35, freq: 0.6, halo: 0 };

// ═════ 站 H：美光台灣（x 210）：一座晶圓廠（長條、雙排氣塔、側面管架，和 E 站外型不同）＋高頻寬記憶體堆疊（12 層晶片疊在底層晶片上） ═════
const HX = 210;
LAY("hFab", [10, 4, HX - 2.5, 2]);
BOX("hGround", "hFab", HX - 8, HX + 2.7, 0, 0.12, -3.6, 3.6, "panel2");
BOX("hFb", "hFab", HX - 7.6, HX + 1.6, 0.12, 2.6, -2.6, 1.4, "panel"); BOX("hFbRoof", "hFab", HX - 7.7, HX + 1.7, 2.6, 2.75, -2.7, 1.5, "roof");
BOX("hFbHi", "hFab", HX - 7.6, HX - 3.2, 2.75, 4.2, -2.6, 0.4, "panel2");
P({ id: "hFbStripe", layer: "hFab", shape: "box", size: [9.2, 0.18, 0.03], pos: [R2(HX - 3), 0, 1.42], at: [[0, 0.7, 0], [0, 1.5, 0], [0, 2.3, 0]], mat: "screen" });
// 方形冷卻塔（塔體＋側面百葉＋頂部風扇罩＋風扇）×2
for (const [k, tx] of [[0, HX - 1.7], [1, HX + 0.4]]) { BOX(`hTw${k}`, "hFab", tx - 0.75, tx + 0.75, 2.75, 4.3, -2.4, -0.9, "panel2");
  P({ id: `hTwL${k}`, layer: "hFab", shape: "box", size: [1.4, 0.05, 0.03], pos: [tx, 0, -0.89], at: Array.from({ length: 6 }, (_, i) => [0, R2(2.95 + i * 0.22), 0]), mat: "dark" });
  P({ id: `hTwS${k}`, layer: "hFab", shape: "tube", size: [0.62, 0.54, 0.45], rot: V, pos: [tx, 4.52, -1.65], mat: "steel2" });
  P({ id: `hTwF${k}`, layer: "hFab", shape: "box", size: [1.0, 0.03, 0.1], pos: [tx, 4.5, -1.65], mat: "darker" });
  actions[`hFan${k}`] = { type: "rotate", parts: [`hTwF${k}`], axis: [0, 1, 0], pivot: [tx, 4.5, -1.65], rps: 0.7, rampSpin: true }; }
// 外牆接縫、百葉、屋頂空調箱、側邊化學品槽區
P({ id: "hSeam", layer: "hFab", shape: "box", size: [0.03, 2.45, 0.03], pos: [0, 1.38, 1.42], at: Array.from({ length: 11 }, (_, i) => [R2(HX - 7.2 + i * 0.85), 0, 0]), mat: "seam" });
P({ id: "hLouv", layer: "hFab", shape: "box", size: [0.6, 0.04, 0.03], pos: [0, 0, 1.43], at: Array.from({ length: 8 }, (_, i) => [R2(HX - 2.8 + (i % 4) * 0.8 + 0.4), R2(1.9 + Math.floor(i / 4) * 0.12), 0]), mat: "dark" });
P({ id: "hRoofU", layer: "hFab", shape: "box", size: [0.9, 0.45, 0.9], pos: [0, 4.43, 0], at: [[HX - 7.0, 0, -1.8], [HX - 5.8, 0, -1.8], [HX - 4.6, 0, -1.8]], mat: "roof" });
P({ id: "hTank", layer: "hFab", shape: "cyl", size: [0.38, 1.6], rot: V, pos: [0, 0.92, 0], at: [[HX + 2.1, 0, -2.9], [HX + 2.1, 0, -2.0]], mat: "steel2" });
P({ id: "hTankBand", layer: "hFab", shape: "cyl", size: [0.39, 0.12], rot: V, pos: [0, 1.4, 0], at: [[HX + 2.1, 0, -2.9], [HX + 2.1, 0, -2.0]], mat: "mark" });
P({ id: "hRack", layer: "hFab", shape: "box", size: [0.08, 1.4, 0.08], pos: [0, 0.82, -3.3], at: Array.from({ length: 6 }, (_, i) => [R2(HX - 7 + i * 1.6), 0, 0]), mat: "steel" });
P({ id: "hPipe", layer: "hFab", shape: "cyl", size: [0.08, 8.2], rot: [0, 90, 0], pos: [R2(HX - 3), 0, -3.3], at: [[0, 1.2, 0], [0, 1.4, 0], [0, 1.6, -0.0]], mat: "steel2" });
P({ id: "hDock", layer: "hFab", shape: "box", size: [0.9, 0.9, 0.04], pos: [0, 0.57, 1.42], at: [[HX - 6.4, 0, 0], [HX - 5.2, 0, 0]], mat: "seam" });
// 高頻寬記憶體：底層晶片＋12 層薄晶片，側面看得到每層與填充膠，前面一排矽穿孔亮點
LAY("hHbm", [3, 3, HX + 5.2, 1.8]);
const HH = plinth("hh", "hHbm", HX + 5.2, 0.6, 3.2, 3.2, 0.9);
BOX("hhBase", "hHbm", HX + 4.0, HX + 6.4, HH, HH + 0.22, -0.4, 1.6, "base");
for (let k = 0; k < 12; k++) { const y = R2(HH + 0.26 + k * 0.155); BOX(`hhD${k}`, "hHbm", HX + 4.05, HX + 6.35, y, R2(y + 0.11), -0.35, 1.55, "hbm"); BOX(`hhG${k}`, "hHbm", HX + 4.1, HX + 6.3, R2(y - 0.04), y, -0.3, 1.5, "ox"); }
P({ id: "hhTsv", layer: "hHbm", shape: "box", size: [0.04, R2(12 * 0.155), 0.02], pos: [0, R2(HH + 0.22 + 6 * 0.155), 1.56], at: Array.from({ length: 10 }, (_, i) => [R2(HX + 4.35 + i * 0.19), 0, 0]), mat: "padGold" });
P({ id: "hhBump", layer: "hHbm", shape: "box", size: [0.07, 0.035, 0.02], pos: [0, 0, 1.56], at: Array.from({ length: 12 * 10 }, (_, n) => [R2(HX + 4.35 + (n % 10) * 0.19), R2(HH + 0.24 + Math.floor(n / 10) * 0.155), 0]), mat: "padGold" });
actions.hTsvGlow = { type: "pulse", parts: ["hhTsv"], color: "lampY", glow: 0.7, freq: 1.2, halo: 0 };

// ═════ 站 N：下一集（x 240）：矽晶圓（念到「撐不住」出現裂紋＋紅光）、碳化矽（透明綠）、氮化鎵（金色，長在基板上），中間一道高壓閃電 ═════
const NX = 240;
const NW = [["nSi", -3.4, "mirror"], ["nSiC", 0, "sic"], ["nGaN", 3.4, "mirror"]];
for (const [id, dx, mat] of NW) {
  const x = NX + dx; LAY(id, [3.2, 3.6, x, 1.9]); const h = plinth(id, id, x, 0, 3.1, 2.6, 0.7);
  BOX(`${id}Stand`, id, x - 0.12, x + 0.12, h, h + 0.6, -0.3, -0.1, "dark"); BOX(`${id}Foot`, id, x - 1.0, x + 1.0, h, h + 0.1, -0.5, 0.2, "dark");
  P({ id: `${id}W`, layer: id, shape: "cyl", size: [1.35, 0.06], pos: [x, R2(h + 1.55), 0], mat });
  BOX(`${id}Notch`, id, x - 0.08, x + 0.08, R2(h + 2.8), R2(h + 2.92), -0.05, 0.05, "darker");
  if (id === "nGaN") P({ id: "nGaNFilm", layer: id, shape: "cyl", size: [1.3, 0.012], pos: [x, R2(h + 1.55), 0.036], mat: "gan" });
}
const NSIH = 0.75;
LAY("nCrack", [2, 2, NX - 3.4, 2.3]);
// 放電／漏電光：從閃電尖端往下穿過矽晶圓的鋸齒折線（電性崩潰示意，不是裂開）＋光暈
P({ id: "nArc0", layer: "nCrack", shape: "box", size: [0.626, 0.05, 0.02], pos: [R2(NX + -3.225), R2(NSIH + 3.385 - 0.75), 0.06], rot: [0, 0, -53.3], mat: "crack" });
P({ id: "nArcH0", layer: "nCrack", shape: "box", size: [0.686, 0.16, 0.01], pos: [R2(NX + -3.225), R2(NSIH + 3.385 - 0.75), 0.05], rot: [0, 0, -53.3], mat: "arcHalo" });
P({ id: "nArc1", layer: "nCrack", shape: "box", size: [0.751, 0.05, 0.02], pos: [R2(NX + -3.325), R2(NSIH + 2.925 - 0.75), 0.06], rot: [0, 0, -140.7], mat: "crack" });
P({ id: "nArcH1", layer: "nCrack", shape: "box", size: [0.811, 0.16, 0.01], pos: [R2(NX + -3.325), R2(NSIH + 2.925 - 0.75), 0.05], rot: [0, 0, -140.7], mat: "arcHalo" });
P({ id: "nArc2", layer: "nCrack", shape: "box", size: [0.854, 0.05, 0.02], pos: [R2(NX + -3.300), R2(NSIH + 2.425 - 0.75), 0.06], rot: [0, 0, -42.5], mat: "crack" });
P({ id: "nArcH2", layer: "nCrack", shape: "box", size: [0.914, 0.16, 0.01], pos: [R2(NX + -3.300), R2(NSIH + 2.425 - 0.75), 0.05], rot: [0, 0, -42.5], mat: "arcHalo" });
P({ id: "nArc3", layer: "nCrack", shape: "box", size: [0.818, 0.05, 0.02], pos: [R2(NX + -3.275), R2(NSIH + 1.875 - 0.75), 0.06], rot: [0, 0, -135.0], mat: "crack" });
P({ id: "nArcH3", layer: "nCrack", shape: "box", size: [0.878, 0.16, 0.01], pos: [R2(NX + -3.275), R2(NSIH + 1.875 - 0.75), 0.05], rot: [0, 0, -135.0], mat: "arcHalo" });
P({ id: "nArc4", layer: "nCrack", shape: "box", size: [0.634, 0.05, 0.02], pos: [R2(NX + -3.375), R2(NSIH + 1.360 - 0.75), 0.06], rot: [0, 0, -53.9], mat: "crack" });
P({ id: "nArcH4", layer: "nCrack", shape: "box", size: [0.694, 0.16, 0.01], pos: [R2(NX + -3.375), R2(NSIH + 1.360 - 0.75), 0.05], rot: [0, 0, -53.9], mat: "arcHalo" });
LAY("nBolt", [1, 2, NX - 3.4, 4]);
P({ id: "nBoltP", layer: "nBolt", shape: "poly", pts: [[0.1, 1.0], [-0.35, 0.05], [-0.02, 0.05], [-0.25, -0.9], [0.4, 0.2], [0.05, 0.2], [0.3, 1.0]], size: [1, 2, 0.08], pos: [R2(NX - 3.4), 3.9, 0], mat: "bolt" });
actions.nArc = { type: "pulse", _說明: "高壓下矽撐不住：放電／漏電光穿過晶圓（電性崩潰示意，不是裂開）", parts: ["nArc0", "nArc1", "nArc2", "nArc3", "nArc4"], color: "crackC", glow: 1, freq: 3.0, halo: 0 };
actions.nBoltGlow = { type: "pulse", parts: ["nBoltP"], color: "boltC", glow: 0.9, freq: 2.0, halo: 0 };
actions.nSicSpin = { type: "rotate", parts: ["nSiCW", "nGaNW"], axis: [0, 1, 0], pivot: [NX, 2.3, 0], rps: 0.0, rampSpin: true };
delete actions.nSicSpin;

// 標註點
Object.assign(anchors, {
  aWafA: A("aWafer", [AX + 2.6, R2(AWY + 0.1), 2.6], 150, -100), aDieA: A("aWafer", [AX - 1.0, R2(AWY + 0.11), 1.0], -150, -100),
  bDimmA: A("bDimm", [DX0 + 1.0, R2(DMB + DMH), -1.1], -150, -100), bSsdA: A("bSsd", [SX0 + 2.9, R2(SY + 0.2), SZ], -150, -100), bNorA: A("bNor", [NX0, R2(MB + 0.35), NZ], 150, -100),
  cCapA: A("cArr", [R2(CX + 2.25), R2(CB + CAPH * 0.8), 1.9], 150, -100), cWLA: A("cArr", [R2(CX + 2.75), R2(CY1 + 0.05), 1.62], 150, 100), cCellA: A("cCell", [CX - 3.15, R2(CB + CAPH * 0.5), 1.9], -150, -100),
  dStackA: A("dL8", [DXL + 0.2, DLY(8), 2.0], -150, -100), dHoleA: A("dHole0", [DH_X[3], R2(DTOP - 0.4), 2.01], 150, -100), dFillA: A("dFill", [DH_X[5], R2(DB + DD * 0.5), 2.03], 150, 100), dStairA: A("dStair", [DXR - 1.0, R2(DTOP + 0.6), -1.0], 150, -100),
  eOffA: A("eFab", [OX0 + 2, 4.5, 2.2], -150, -100), eFbA: A("eFab", [FX0 + 6, 2.2, 3.0], 150, -100),
  hFabA: A("hFab", [HX - 3, 2.0, 1.4], -150, -100), hHbmA: A("hHbm", [HX + 6.3, R2(HH + 1.2), 1.55], 150, -100),
  nSiA: A("nSi", [NX - 3.4, 2.3, 0.1], -150, -100), nSiCA: A("nSiC", [NX, 2.3, 0.1], 150, -100), nGaNA: A("nGaN", [NX + 3.4, 2.3, 0.1], 150, -100),
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

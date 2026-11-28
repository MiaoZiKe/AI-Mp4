// node videos/tech-compound/gen-model.mjs → 寫 videos/tech-compound/model.json
// 2026/11/28 tech-compound（中游補充篇 M3：化合物半導體 碳化矽／氮化鎵）。構造照 physics-spec.md、模組清單照 visual-spec.md。全部放大示意，非特定廠牌／型號。
// 站點（地板頂面 y＝0）：A 三片晶圓（接 M2 片尾，x 0）｜B 能隙示意台（x 30）｜C 電動車功率模組＋電池＋馬達（x 60）｜D 氮化鎵快充（x 90）
//   E 碳化矽長晶爐（x 120）｜F 氮化鎵磊晶爐（x 150）｜G 台灣三段（x 180）｜H 研磨台（下一集再生晶圓，x 210）
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
const HERE = path.dirname(new URL(import.meta.url).pathname);
const R2 = (x) => Math.round(x * 1000) / 1000;
const palette = {
  floorC: "#C9D2DE", panel: "#F3F5F8", panel2: "#E2E8F0", seam: "#8E9BB0", band: "#24324C", steel: "#7D8CA6", steel2: "#A9B5C7", dark: "#3E4A60", darker: "#2A3142",
  lampY: "#F2B632", lampG: "#2FBF71", lampR: "#E5484D", rubber: "#2B2F36", gold: "#C9A24A", padGold: "#E0B84E", whiteP: "#FFFFFF", plasticW: "#ECEEF2", plasticD: "#3A3F4A",
  waferC: "#7C89A6", dieC: "#4C5E86", chipC: "#2E3442", chipTop: "#3A4152", pcbC: "#1E6B4E", sicC: "#3FA37A", sicD: "#2E7D5E", ganC: "#9EA3B5",
  vbC: "#2F6FD6", cbC: "#BFD3F2", eleC: "#FFD24A", crackC: "#8FD3FF", boltC: "#F2B632", markC: "#E8613C",
  cuC: "#C9794A", cuBright: "#E39A64", ceramic: "#F1EEE6", solderC: "#D8DDE4", gelC: "#F4E7A6", hvC: "#F28C28", acC: "#5BE0C0", heatC: "#FF6A3D",
  ferrite: "#4A4F59", capBlue: "#2D4F8F", graphite: "#33363D", feltC: "#55585F", powderC: "#7FA894", vaporC: "#9EF0C8", hotC: "#FF7A2B", glassC: "#BFD3F2",
  ammoniaC: "#8FC8FF", gaC: "#C9B8FF", padC: "#D9DEE6", slurryC: "#E8F1FF", patC: "#C46A6A",
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
  lampG: M("std", "lampG", { emissive: "lampG", ei: 0.45, rough: 0.4, metal: 0 }), lampR: M("std", "lampR", { emissive: "lampR", ei: 0.4, rough: 0.4, metal: 0 }),
  white: M("std", "whiteP", { rough: 0.7, metal: 0 }), plasticW: M("std", "plasticW", { rough: 0.45, metal: 0, env: 0.3 }), plasticD: M("std", "plasticD", { rough: 0.5, metal: 0.05, env: 0.3 }),
  mirror: M("std", "waferC", { rough: 0.05, metal: 0.95, env: 1.4 }), die: M("std", "dieC", { rough: 0.2, metal: 0.6, env: 0.9, tex: "traces", texScale: 0.35 }),
  chip: M("std", "chipC", { rough: 0.35, metal: 0.3, env: 0.5 }), chipTop: M("std", "chipTop", { rough: 0.3, metal: 0.3, env: 0.6, tex: "traces", texScale: 0.5 }),
  pcb: M("std", "pcbC", { rough: 0.45, metal: 0.1, env: 0.35, tex: "traces", texScale: 1.0 }),
  sic: M("phys", "sicC", { rough: 0.05, metal: 0, clearcoat: 1, opacity: 0.8, env: 0.9 }), sicSolid: M("std", "sicD", { rough: 0.2, metal: 0.3, env: 0.9 }),
  sicDie: M("std", "darker", { rough: 0.25, metal: 0.5, env: 0.8, tex: "traces", texScale: 0.3 }), gan: M("std", "ganC", { rough: 0.06, metal: 0.9, env: 1.3 }),
  vb: M("std", "vbC", { rough: 0.35, metal: 0.2, env: 0.5 }), cb: M("phys", "cbC", { rough: 0.1, metal: 0, clearcoat: 1, opacity: 0.45, env: 0.6 }),
  ele: glowM("eleC", 1, 0.9), crack: glowM("crackC", 1, 0.9), arcHalo: glowM("crackC", 0.35, 0.6), bolt: glowM("boltC", 1, 0.7),
  mark: M("std", "markC", { rough: 0.5, metal: 0, emissive: "markC", ei: 0.25 }),
  cu: M("std", "cuC", { rough: 0.3, metal: 0.95, env: 0.7, tex: "brushed", texScale: 2 }), cuBright: M("std", "cuBright", { rough: 0.25, metal: 0.95, env: 0.8 }),
  ceramic: M("std", "ceramic", { rough: 0.6, metal: 0, env: 0.3 }), solder: M("std", "solderC", { rough: 0.2, metal: 0.95, env: 0.9 }),
  gel: M("phys", "gelC", { rough: 0.1, metal: 0, clearcoat: 1, opacity: 0.3, env: 0.5 }), hv: M("std", "hvC", { rough: 0.5, metal: 0.05, env: 0.3 }),
  dcGlow: glowM("hvC", 1, 0.9), acGlow: glowM("acC", 1, 0.9), heat: glowM("heatC", 0.8, 0.9),
  ferrite: M("std", "ferrite", { rough: 0.7, metal: 0.2 }), capB: M("std", "capBlue", { rough: 0.4, metal: 0.1, env: 0.4 }),
  graphite: M("std", "graphite", { rough: 0.75, metal: 0.2, env: 0.2 }), felt: M("std", "feltC", { rough: 0.95, metal: 0, tex: "brushed", texScale: 6 }),
  powder: M("std", "powderC", { rough: 0.95, metal: 0 }), vapor: glowM("vaporC", 0.9, 0.8), hotGlow: glowM("hotC", 0.85, 1.0), coilGlow: glowM("cuBright", 0.6, 0.8),
  glass: M("phys", "glassC", { rough: 0.05, metal: 0, clearcoat: 1, opacity: 0.25, env: 0.6 }), ghost: M("phys", "glassC", { rough: 0.05, metal: 0, clearcoat: 1, opacity: 0.18, env: 0.4 }),
  nh3: glowM("ammoniaC", 0.85, 0.8), ga: glowM("gaC", 0.85, 0.8), pad: M("std", "padC", { rough: 0.85, metal: 0 }), slurry: glowM("slurryC", 0.9, 0.5), pat: M("std", "patC", { rough: 0.4, metal: 0.4, env: 0.5 }),
};
const parts = [], layers = [], anchors = {}, actions = {};
const P = (o) => { parts.push(o); return o; };
const LAY = (id, outline, bg) => layers.push({ id, z: 0, k: 0, outline, ...(bg ? { bg: true } : {}) });
const V = [90, 0, 0];
const BOX = (id, layer, x0, x1, y0, y1, z0, z1, mat, o = {}) => P({ id, layer, shape: "box", size: [R2(x1 - x0), R2(y1 - y0), R2(z1 - z0)], pos: [R2((x0 + x1) / 2), R2((y0 + y1) / 2), R2((z0 + z1) / 2)], mat, ...o });
const VC = (id, layer, R, y0, y1, mat, o = {}) => { const { x = 0, z = 0, ...r } = o; return P({ id, layer, shape: "cyl", size: [R, R2(y1 - y0)], rot: V, pos: [x, R2((y0 + y1) / 2), z], mat, ...r }); };
const VT = (id, layer, Ro, Ri, y0, y1, mat, o = {}) => { const { x = 0, z = 0, ...r } = o; return P({ id, layer, shape: "tube", size: [Ro, Ri, R2(y1 - y0)], rot: V, pos: [x, R2((y0 + y1) / 2), z], mat, ...r }); };
const SPH = (id, layer, r, x, y, z, mat, o = {}) => P({ id, layer, shape: "sphere", size: [r], pos: [x, y, z], mat, ...o });
const RING = (n, r, cx = 0, cz = 0, a0 = 0) => Array.from({ length: n }, (_, i) => { const a = (a0 + (i * 360) / n) * Math.PI / 180; return [R2(cx + r * Math.cos(a)), 0, R2(cz + r * Math.sin(a))]; });
const A = (layer, p, dx, dy) => ({ layer, p, dx, dy });
const idsOf = (layer) => parts.filter((q) => q.layer === layer).map((q) => q.id);
const plinth = (id, layer, x, z, w, d, h = 0.8) => { BOX(`${id}Pl`, layer, x - w / 2, x + w / 2, 0, h, z - d / 2, z + d / 2, "band"); BOX(`${id}PlT`, layer, x - w / 2, x + w / 2, h, h + 0.05, z - d / 2, z + d / 2, "panel2");
  BOX(`${id}Kick`, layer, x - w / 2 - 0.05, x + w / 2 + 0.05, 0, 0.12, z - d / 2 - 0.05, z + d / 2 + 0.05, "darker");
  P({ id: `${id}Bolt`, layer, shape: "cyl", size: [0.1, 0.04], rot: V, pos: [0, R2(h + 0.07), 0], at: [[x - w / 2 + 0.3, 0, z - d / 2 + 0.3], [x + w / 2 - 0.3, 0, z - d / 2 + 0.3], [x - w / 2 + 0.3, 0, z + d / 2 - 0.3], [x + w / 2 - 0.3, 0, z + d / 2 - 0.3]], mat: "steel" }); return h + 0.05; };
const soic8 = (id, layer, x, y, z, s = 1) => {
  BOX(`${id}B`, layer, x - 0.25 * s, x + 0.25 * s, y + 0.05 * s, y + 0.2 * s, z - 0.2 * s, z + 0.2 * s, "chip"); BOX(`${id}T`, layer, x - 0.23 * s, x + 0.23 * s, y + 0.2 * s, y + 0.205 * s, z - 0.18 * s, z + 0.18 * s, "chipTop");
  const at = []; for (let i = 0; i < 4; i++) for (const sd of [-1, 1]) at.push([R2(x - 0.18 * s + i * 0.12 * s), 0, R2(z + sd * 0.26 * s)]);
  P({ id: `${id}Leg`, layer, shape: "box", size: [R2(0.05 * s), R2(0.03 * s), R2(0.14 * s)], pos: [0, R2(y + 0.03 * s), 0], at, mat: "steel2" });
  P({ id: `${id}LegU`, layer, shape: "box", size: [R2(0.05 * s), R2(0.1 * s), R2(0.03 * s)], pos: [0, R2(y + 0.08 * s), 0], at: at.map(([a, , c]) => [a, 0, R2(c - Math.sign(c - z) * 0.06 * s)]), mat: "steel2" });
  P({ id: `${id}Dot`, layer, shape: "cyl", size: [R2(0.03 * s), 0.01], rot: V, pos: [R2(x - 0.17 * s), R2(y + 0.21 * s), R2(z - 0.12 * s)], mat: "panel2" });
};
// 立著的晶圓（cyl 沿 z＝正面朝觀眾）：缺口＋晶粒格（可選）
const standWafer = (id, layer, x, y, z, r, mat, dieMat) => {
  P({ id: `${id}W`, layer, shape: "cyl", size: [r, 0.06], pos: [x, y, z], mat });
  BOX(`${id}N`, layer, x - 0.07, x + 0.07, R2(y + r - 0.1), R2(y + r + 0.02), R2(z - 0.03), R2(z + 0.03), "darker");
  if (dieMat) { const wd = [], st = r / 7.5; for (let i = -8; i <= 8; i++) for (let j = -8; j <= 8; j++) if (Math.hypot(Math.abs(i * st) + st / 2, Math.abs(j * st) + st / 2) < r * 0.94) wd.push([R2(x + i * st), R2(y + j * st), 0]);
    P({ id: `${id}D`, layer, shape: "box", size: [R2(st * 0.86), R2(st * 0.86), 0.02], pos: [0, 0, R2(z + 0.035)], at: wd, mat: dieMat }); }
};
const easel = (id, layer, x, h, wy, wz) => { BOX(`${id}Easel`, layer, x - 0.1, x + 0.1, h, wy - 0.8, wz - 0.25, wz - 0.12, "dark"); BOX(`${id}EaselF`, layer, x - 0.9, x + 0.9, h, h + 0.1, wz - 0.3, wz + 0.15, "dark");
  P({ id: `${id}EaselBolt`, layer, shape: "cyl", size: [0.05, 0.03], pos: [0, 0, R2(wz + 0.16)], at: [[R2(x - 0.6), R2(h + 0.05), 0], [R2(x + 0.6), R2(h + 0.05), 0]], mat: "steel" }); };

// ═════ 地板 ═════
LAY("floor", [300, 2, 110, 0], true);
P({ id: "floor", layer: "floor", shape: "slab", size: [280, 0.5, 44], r: 0.2, pos: [110, -0.25, 0], mat: "floor" });
P({ id: "floorSeam", layer: "floor", shape: "slab", size: [280, 0.04, 0.1], pos: [110, 0.01, 0], at: Array.from({ length: 7 }, (_, i) => [0, 0, -16 + i * 5.3]), mat: "seam" });

// ═════ 站 A：三片晶圓（接 M2 片尾同一畫面）：矽（念到撐不住時放電光穿過）、碳化矽（透明淡綠＋平邊）、氮化鎵（矽底＋銀灰膜） ═════
const AX = 0;
for (const [id, dx, mat] of [["aSi", -3.4, "mirror"], ["aSiC", 0, "sic"], ["aGaN", 3.4, "mirror"]]) {
  const x = AX + dx; LAY(id, [3.2, 3.6, x, 1.9]); const h = plinth(id, id, x, 0, 3.1, 2.6, 0.7);
  BOX(`${id}Stand`, id, x - 0.12, x + 0.12, h, h + 0.6, -0.3, -0.1, "dark"); BOX(`${id}Foot`, id, x - 1.0, x + 1.0, h, h + 0.1, -0.5, 0.2, "dark");
  P({ id: `${id}FootBolt`, layer: id, shape: "cyl", size: [0.05, 0.03], pos: [0, R2(h + 0.05), 0.21], at: [[R2(x - 0.75), 0, 0], [R2(x + 0.75), 0, 0]], mat: "steel" });
  standWafer(id, id, x, R2(h + 1.55), 0, 1.35, mat, null);
  if (id === "aSiC") BOX("aSiCFlat", id, x - 0.5, x + 0.5, R2(h + 0.17), R2(h + 0.24), -0.04, 0.04, "sicSolid");
  if (id === "aGaN") P({ id: "aGaNFilm", layer: id, shape: "cyl", size: [1.3, 0.012], pos: [x, R2(h + 1.55), 0.036], mat: "gan" });
}
const AH = 0.75;
LAY("aArc", [2, 2, AX - 3.4, 2.3]);
[[0.626, 3.385, -53.3, -3.225], [0.751, 2.925, -140.7, -3.325], [0.854, 2.425, -42.5, -3.3], [0.818, 1.875, -135, -3.275], [0.634, 1.36, -53.9, -3.375]].forEach(([L, y, r, dx], i) => {
  P({ id: `aArc${i}`, layer: "aArc", shape: "box", size: [L, 0.05, 0.02], pos: [R2(AX + dx), R2(AH + y - 0.75), 0.06], rot: [0, 0, r], mat: "crack" });
  P({ id: `aArcH${i}`, layer: "aArc", shape: "box", size: [R2(L + 0.06), 0.16, 0.01], pos: [R2(AX + dx), R2(AH + y - 0.75), 0.05], rot: [0, 0, r], mat: "arcHalo" }); });
LAY("aBolt", [1, 2, AX - 3.4, 4]);
P({ id: "aBoltP", layer: "aBolt", shape: "poly", pts: [[0.1, 1.0], [-0.35, 0.05], [-0.02, 0.05], [-0.25, -0.9], [0.4, 0.2], [0.05, 0.2], [0.3, 1.0]], size: [1, 2, 0.08], pos: [R2(AX - 3.4), 3.9, 0], mat: "bolt" });
LAY("aOk", [6, 1, AX + 1.7, 3.5]);
P({ id: "aOkRing", layer: "aOk", shape: "tube", size: [1.48, 1.4, 0.03], pos: [0, R2(AH + 1.55), 0.08], at: [[AX, 0, 0], [AX + 3.4, 0, 0]], mat: "lampG" });
actions.aArcPulse = { type: "pulse", _說明: "高壓下矽撐不住：放電／漏電光穿過晶圓（電性崩潰示意）", parts: [0, 1, 2, 3, 4].map((i) => `aArc${i}`), color: "crackC", glow: 1, freq: 3.0, halo: 0 };
actions.aBoltGlow = { type: "pulse", parts: ["aBoltP"], color: "boltC", glow: 0.9, freq: 2.0, halo: 0 };

// ═════ 站 B：能隙示意台（x 30）：左＝矽（門檻低）、右＝碳化矽（門檻約 3 倍高）。價帶（藍、滿是電子）→ 空隙＝門檻 → 導帶（淡藍玻璃、空的） ═════
const BX = 30, GAP = { bSi: 0.9, bSc: 2.7 };
for (const [id, dx] of [["bSi", -4.2], ["bSc", 4.2]]) {
  const x = BX + dx; LAY(id, [7, 5, x, 2.2]); const h = plinth(id, id, x, 0, 7.0, 3.6, 0.8);
  const v0 = R2(h + 0.3), v1 = R2(h + 0.75), c0 = R2(v1 + GAP[id]), c1 = R2(c0 + 0.4);
  BOX(`${id}Vb`, id, x - 2.5, x + 2.5, v0, v1, -0.7, 0.7, "vb");
  BOX(`${id}Cb`, id, x - 2.5, x + 2.5, c0, c1, -0.7, 0.7, "cb");
  P({ id: `${id}Post`, layer: id, shape: "cyl", size: [0.08, R2(c1 - h)], rot: V, pos: [0, R2((h + c1) / 2), 0], at: [[R2(x - 2.7), 0, -0.85], [R2(x + 2.7), 0, -0.85]], mat: "steel" });
  BOX(`${id}Rail`, id, x - 2.75, x + 2.75, R2(c1), R2(c1 + 0.08), -0.92, -0.78, "steel2");
  const el = []; for (let i = 0; i < 10; i++) for (let j = 0; j < 3; j++) el.push([R2(x - 2.25 + i * 0.5), 0, R2(-0.45 + j * 0.45)]);
  P({ id: `${id}El`, layer: id, shape: "sphere", size: [0.13], pos: [0, R2(v1 + 0.13), 0], at: el, mat: "ele" });
  // 門檻尺：左側直立刻度（高度＝空隙），上下兩道橫線
  BOX(`${id}Rule`, id, x - 3.05, x - 2.97, v1, c0, 0.55, 0.63, "mark");
  P({ id: `${id}Tick`, layer: id, shape: "box", size: [0.3, 0.05, 0.05], pos: [R2(x - 3.01), 0, 0.59], at: Array.from({ length: Math.round(GAP[id] / 0.3) + 1 }, (_, k) => [0, R2(v1 + k * 0.3), 0]), mat: "mark" });
  // 電極板（左右銅板）＋電壓源（面板、指針表、兩個接線柱、導線）
  BOX(`${id}ElecL`, id, x - 3.35, x - 3.2, h, R2(c1 + 0.3), -0.6, 0.6, "cu"); BOX(`${id}ElecR`, id, x + 3.2, x + 3.35, h, R2(c1 + 0.3), -0.6, 0.6, "cu");
  BOX(`${id}Src`, id, x - 0.9, x + 0.9, h, R2(h + 0.7), 1.1, 1.7, "dark"); BOX(`${id}SrcFace`, id, x - 0.8, x + 0.8, R2(h + 0.1), R2(h + 0.6), 1.7, 1.72, "panel");
  P({ id: `${id}Dial`, layer: id, shape: "cyl", size: [0.22, 0.02], pos: [R2(x - 0.35), R2(h + 0.36), 1.73], mat: "white" });
  P({ id: `${id}Knob`, layer: id, shape: "cyl", size: [0.12, 0.08], pos: [R2(x + 0.45), R2(h + 0.36), 1.76], mat: "darker" });
  P({ id: `${id}Post2`, layer: id, shape: "cyl", size: [0.06, 0.12], rot: V, pos: [0, R2(h + 0.76), 1.4], at: [[R2(x - 0.6), 0, 0], [R2(x + 0.6), 0, 0]], mat: "padGold" });
  BOX(`${id}WireL`, id, x - 3.3, x - 0.6, R2(h + 0.08), R2(h + 0.13), 1.36, 1.44, "lampR"); BOX(`${id}WireR`, id, x + 0.6, x + 3.3, R2(h + 0.08), R2(h + 0.13), 1.36, 1.44, "rubber");
  BOX(`${id}Needle`, id, R2(x - 0.36), R2(x - 0.34), R2(h + 0.36), R2(h + 0.55), 1.755, 1.765, "mark");
}
// 跳上門檻的電子：矽那組跳上導帶後沿導帶流走（漏電）；碳化矽那組跳到一半落回（跳不過去）
{ const xs = BX - 4.2, xc = BX + 4.2, hv = 0.85 + 0.75 + 0.13;
  LAY("bLeak", [6, 2, xs, 2.5]);
  P({ id: "bLeakE", layer: "bLeak", shape: "sphere", size: [0.15], pos: [R2(xs - 1.0), R2(hv), 0.45], mat: "ele" });
  actions.bSiLeak = { type: "flow", _說明: "矽：門檻低，電壓一高電子就跳上導帶流走（漏電示意）", layer: "bLeak", path: [[R2(xs - 1.5), R2(hv), 0.5], [R2(xs - 1.2), R2(hv + 0.9 + 0.2), 0.5], [R2(xs + 2.4), R2(hv + 0.9 + 0.2), 0.5], [R2(xs + 3.15), R2(hv + 0.9 + 0.2), 0.5]], n: 5, size: 0.12, shape: "dot", rate: 0.8, color: "eleC", track: false, free: true };
  actions.bScTry = { type: "flow", _說明: "碳化矽：門檻高約 3 倍，電子跳到一半落回價帶", layer: "bSc", path: [[R2(xc - 1.5), R2(hv), 0.5], [R2(xc - 1.2), R2(hv + 1.0), 0.5], [R2(xc - 0.8), R2(hv), 0.5]], n: 3, size: 0.12, shape: "dot", rate: 0.7, color: "eleC", track: false, free: true };
  actions.bSiNeedle = { type: "rotate", parts: ["bSiNeedle"], axis: [0, 0, -1], pivot: [R2(xs - 0.35), R2(0.85 + 0.36), 1.76], rps: 0.05, rampSpin: true };
  actions.bScNeedle = { type: "rotate", parts: ["bScNeedle"], axis: [0, 0, -1], pivot: [R2(xc - 0.35), R2(0.85 + 0.36), 1.76], rps: 0.05, rampSpin: true };
  actions.bSiElGlow = { type: "pulse", parts: ["bSiEl"], color: "eleC", glow: 0.6, freq: 1.2, halo: 0 };
}

// ═════ 站 C：電動車功率模組（x 60）：爆炸分解 9 層（由下而上）＋左電池包＋右馬達 ═════
const CX = 60;
LAY("cPl", [9, 1.2, CX, 0.5]);
const CH = plinth("cPl", "cPl", CX, 0, 7.6, 6.0, 1.0);
const MX = 2.6, MZ = 1.8;
LAY("cBase", [6, 1, CX, CH + 0.5]); LAY("cSol1", [5, 0.2, CX, CH + 0.9]); LAY("cDbc", [5, 0.3, CX, CH + 1.0]); LAY("cDie", [5, 0.3, CX, CH + 1.1]);
LAY("cWire", [5, 0.4, CX, CH + 1.25]); LAY("cCase", [6, 1.2, CX, CH + 1.3]); LAY("cGel", [5, 0.6, CX, CH + 1.3]); LAY("cLid", [6, 0.3, CX, CH + 1.8]);
// ① 針鰭銅底板：底下一整排針狀散熱鰭（泡在冷卻液裡）、四角固定孔
BOX("cBasePlate", "cBase", CX - MX, CX + MX, CH + 0.6, CH + 0.85, -MZ, MZ, "cu");
{ const pins = []; for (let i = 0; i < 12; i++) for (let j = 0; j < 8; j++) pins.push([R2(CX - 2.3 + i * 0.42), 0, R2(-1.5 + j * 0.43)]);
  P({ id: "cPin", layer: "cBase", shape: "cyl", size: [0.075, 0.6], rot: V, pos: [0, R2(CH + 0.3), 0], at: pins, mat: "cu" }); }
P({ id: "cBaseHole", layer: "cBase", shape: "tube", size: [0.18, 0.1, 0.02], rot: V, pos: [0, R2(CH + 0.86), 0], at: [[CX - 2.35, 0, -1.55], [CX + 2.35, 0, -1.55], [CX - 2.35, 0, 1.55], [CX + 2.35, 0, 1.55]], mat: "darker" });
// ② 銲料　③ 陶瓷覆銅基板（下銅＋陶瓷＋上銅走線三塊）
BOX("cSolA", "cSol1", CX - 2.25, CX + 2.25, CH + 0.85, CH + 0.88, -1.45, 1.45, "solder");
BOX("cDbcCuB", "cDbc", CX - 2.2, CX + 2.2, CH + 0.88, CH + 0.92, -1.4, 1.4, "cu");
BOX("cDbcCer", "cDbc", CX - 2.3, CX + 2.3, CH + 0.92, CH + 1.0, -1.5, 1.5, "ceramic");
for (const [k, x0, x1] of [[0, -2.1, -0.75], [1, -0.65, 0.65], [2, 0.75, 2.1]]) BOX(`cTrace${k}`, "cDbc", CX + x0, CX + x1, CH + 1.0, CH + 1.04, -1.3, 1.3, "cuBright");
BOX("cTraceG", "cDbc", CX - 2.1, CX + 2.1, CH + 1.0, CH + 1.035, 1.33, 1.42, "cuBright");
// ④ 碳化矽晶片 6 顆（每塊走線上 2 顆）：頂面源極金屬、角落閘極銲墊
const DIES = []; for (const xc of [-1.42, 0, 1.42]) for (const zc of [-0.6, 0.55]) DIES.push([R2(CX + xc), zc]);
P({ id: "cDieB", layer: "cDie", shape: "box", size: [0.62, 0.06, 0.62], pos: [0, R2(CH + 1.075), 0], at: DIES.map(([x, z]) => [x, 0, z]), mat: "sicDie" });
P({ id: "cDieS", layer: "cDie", shape: "box", size: [0.42, 0.012, 0.36], pos: [0, R2(CH + 1.11), 0], at: DIES.map(([x, z]) => [R2(x + 0.04), 0, R2(z - 0.05)]), mat: "solder" });
P({ id: "cDieG", layer: "cDie", shape: "box", size: [0.11, 0.014, 0.11], pos: [0, R2(CH + 1.112), 0], at: DIES.map(([x, z]) => [R2(x - 0.2), 0, R2(z + 0.21)]), mat: "padGold" });
// ⑤ 鋁鍵合線：每顆 3 條拱形（上升段＋下降段）接到旁邊走線
{ const up = [], dn = []; for (const [x, z] of DIES) for (const dz of [-0.14, -0.02, 0.1]) { up.push([R2(x + 0.25), 0, R2(z + dz)]); dn.push([R2(x + 0.55), 0, R2(z + dz)]); }
  P({ id: "cWireU", layer: "cWire", shape: "box", size: [0.36, 0.025, 0.025], pos: [0, R2(CH + 1.2), 0], rot: [0, 0, 32], at: up, mat: "steel2" });
  P({ id: "cWireD", layer: "cWire", shape: "box", size: [0.36, 0.025, 0.025], pos: [0, R2(CH + 1.2), 0], rot: [0, 0, -32], at: dn, mat: "steel2" }); }
// ⑥ 塑膠外殼：四面牆、四角螺絲座、左 DC＋／DC−、右 U／V／W 端子（銅片＋螺孔）
BOX("cCaseF", "cCase", CX - MX - 0.1, CX + MX + 0.1, CH + 0.85, CH + 1.75, MZ - 0.05, MZ + 0.1, "plasticD"); BOX("cCaseB", "cCase", CX - MX - 0.1, CX + MX + 0.1, CH + 0.85, CH + 1.75, -MZ - 0.1, -MZ + 0.05, "plasticD");
BOX("cCaseL", "cCase", CX - MX - 0.1, CX - MX + 0.05, CH + 0.85, CH + 1.75, -MZ, MZ, "plasticD"); BOX("cCaseR", "cCase", CX + MX - 0.05, CX + MX + 0.1, CH + 0.85, CH + 1.75, -MZ, MZ, "plasticD");
P({ id: "cBoss", layer: "cCase", shape: "cyl", size: [0.24, 0.9], rot: V, pos: [0, R2(CH + 1.3), 0], at: [[CX - 2.5, 0, -1.7], [CX + 2.5, 0, -1.7], [CX - 2.5, 0, 1.7], [CX + 2.5, 0, 1.7]], mat: "plasticD" });
P({ id: "cBossH", layer: "cCase", shape: "tube", size: [0.14, 0.07, 0.03], rot: V, pos: [0, R2(CH + 1.76), 0], at: [[CX - 2.5, 0, -1.7], [CX + 2.5, 0, -1.7], [CX - 2.5, 0, 1.7], [CX + 2.5, 0, 1.7]], mat: "steel" });
const TERM = [["dcp", -2.25, -0.6], ["dcn", -2.25, 0.6], ["u", 2.25, -0.9], ["v", 2.25, 0], ["w", 2.25, 0.9]];
P({ id: "cTerm", layer: "cCase", shape: "box", size: [0.5, 0.5, 0.06], pos: [0, R2(CH + 2.0), 0], at: TERM.map(([, x, z]) => [R2(CX + x), 0, z]), mat: "cuBright" });
P({ id: "cTermH", layer: "cCase", shape: "tube", size: [0.12, 0.06, 0.08], pos: [0, R2(CH + 2.08), 0], at: TERM.map(([, x, z]) => [R2(CX + x), 0, z]), mat: "darker" });
// ⑦ 矽膠填充（半透明）　⑧ 上蓋：銘板、四顆螺絲
BOX("cGelB", "cGel", CX - 2.45, CX + 2.45, CH + 1.04, CH + 1.5, -1.65, 1.65, "gel");
BOX("cLidP", "cLid", CX - MX - 0.1, CX + MX + 0.1, CH + 1.75, CH + 1.85, -MZ - 0.1, MZ + 0.1, "plasticD");
BOX("cLidPlate", "cLid", CX - 1.2, CX + 1.2, CH + 1.85, CH + 1.87, -0.5, 0.5, "panel");
BOX("cLidPlate2", "cLid", CX - 1.0, CX + 0.6, CH + 1.87, CH + 1.875, -0.15, 0.1, "dark");
P({ id: "cLidScrew", layer: "cLid", shape: "cyl", size: [0.11, 0.05], rot: V, pos: [0, R2(CH + 1.88), 0], at: [[CX - 2.5, 0, -1.7], [CX + 2.5, 0, -1.7], [CX - 2.5, 0, 1.7], [CX + 2.5, 0, 1.7]], mat: "steel" });
P({ id: "cLidSlot", layer: "cLid", shape: "box", size: [0.16, 0.02, 0.03], pos: [0, R2(CH + 1.91), 0], at: [[CX - 2.5, 0, -1.7], [CX + 2.5, 0, -1.7], [CX - 2.5, 0, 1.7], [CX + 2.5, 0, 1.7]], mat: "darker" });
// 電池包（左）：外殼、上面 8 個電池模組、冷卻管、橘色高壓接頭與高壓線（接到 DC 端子）
const BTX = CX - 9.0;
LAY("cBat", [6, 2.4, BTX, 1.2]);
BOX("cBatBox", "cBat", BTX - 2.8, BTX + 2.8, 0, 1.6, -2.2, 2.2, "band");
BOX("cBatLip", "cBat", BTX - 2.9, BTX + 2.9, 1.5, 1.62, -2.3, 2.3, "steel2");
{ const mods = []; for (let i = 0; i < 4; i++) for (let j = 0; j < 2; j++) mods.push([R2(BTX - 2.05 + i * 1.37), 0, R2(-1.0 + j * 2.0)]);
  P({ id: "cBatMod", layer: "cBat", shape: "box", size: [1.22, 0.3, 1.8], pos: [0, 1.77, 0], at: mods, mat: "dark" });
  P({ id: "cBatModT", layer: "cBat", shape: "box", size: [1.0, 0.02, 0.3], pos: [0, 1.93, 0], at: mods, mat: "panel" });
  P({ id: "cBatBus", layer: "cBat", shape: "box", size: [0.3, 0.05, 0.16], pos: [0, 1.95, 0], at: mods.map(([x, , z]) => [R2(x + 0.6), 0, z]), mat: "cuBright" }); }
P({ id: "cBatCool", layer: "cBat", shape: "cyl", size: [0.12, 5.4], rot: [0, 90, 0], pos: [BTX, 0.6, 2.28], at: [[0, 0, 0], [0, 0.45, 0]], mat: "steel" });
BOX("cBatConn", "cBat", BTX + 2.8, BTX + 3.2, 0.9, 1.4, -0.7, 0.7, "hv");
BOX("cHvA", "cBat", BTX + 3.2, CX - 3.0, 1.1, 1.26, -0.68, -0.52, "hv"); BOX("cHvB", "cBat", BTX + 3.2, CX - 3.0, 1.1, 1.26, 0.52, 0.68, "hv");
BOX("cHvUpA", "cBat", CX - 3.0, CX - 2.84, 1.1, R2(CH + 2.0), -0.68, -0.52, "hv"); BOX("cHvUpB", "cBat", CX - 3.0, CX - 2.84, 1.1, R2(CH + 2.0), 0.52, 0.68, "hv");
// 馬達（右）：定子外殼＋散熱鰭、端蓋、轉軸、頂部接線盒、三相線（接 U／V／W）
const MTX = CX + 8.6;
LAY("cMot", [5, 4, MTX, 2]);
BOX("cMotFoot", "cMot", MTX - 1.6, MTX + 1.6, 0, 0.4, -1.6, 1.6, "dark");
P({ id: "cMotBody", layer: "cMot", shape: "cyl", size: [1.6, 3.2], pos: [MTX, 2.0, 0], mat: "steel2" });
P({ id: "cMotFin", layer: "cMot", shape: "tube", size: [1.78, 1.6, 0.08], pos: [MTX, 2.0, 0], at: Array.from({ length: 11 }, (_, i) => [0, 0, R2(-1.4 + i * 0.28)]), mat: "steel" });
P({ id: "cMotCap", layer: "cMot", shape: "cyl", size: [1.5, 0.2], pos: [MTX, 2.0, 1.7], mat: "dark" });
P({ id: "cMotCapBolt", layer: "cMot", shape: "cyl", size: [0.07, 0.06], pos: [0, 0, 1.82], at: RING(6, 1.25, 0, 0).map(([x, , z]) => [R2(MTX + x), R2(2.0 + z), 0]), mat: "steel" });
LAY("cShaft", [1, 1, MTX, 2]);
P({ id: "cMotShaft", layer: "cShaft", shape: "cyl", size: [0.22, 1.0], pos: [MTX, 2.0, 2.3], mat: "steel2" });
BOX("cMotKey", "cShaft", MTX - 0.05, MTX + 0.05, 2.2, 2.26, 2.0, 2.75, "darker");
BOX("cMotJbox", "cMot", MTX - 0.7, MTX + 0.7, 3.5, 4.1, -0.7, 0.7, "dark");
[["u", -0.9, "#E5484D"], ["v", 0, "#2FBF71"], ["w", 0.9, "#2F7FE0"]].forEach(([k, z]) => {
  BOX(`cPh${k}`, "cMot", CX + 2.5, MTX - 0.7, R2(CH + 2.2), R2(CH + 2.32), R2(z - 0.07), R2(z + 0.07), "rubber"); });
BOX("cPhDown", "cMot", MTX - 0.84, MTX - 0.7, R2(CH + 2.2), 3.7, -1.0, 1.0, "rubber");
actions.cDcFlow = { type: "flow", _說明: "電池直流沿高壓線送進功率模組", layer: "cBat", path: [[R2(BTX + 3.2), 1.3, -0.6], [R2(CX - 2.92), 1.3, -0.6], [R2(CX - 2.92), R2(CH + 2.05), -0.6]], n: 5, size: 0.11, shape: "dot", rate: 0.9, color: "hvC", track: false };
actions.cAcFlow = { type: "flow", _說明: "模組切成三相交流送給馬達", layer: "cMot", path: [[R2(CX + 2.5), R2(CH + 2.38), 0], [R2(MTX - 0.75), R2(CH + 2.38), 0]], n: 4, lanes: 3, laneDir: [0, 0, 1], laneGap: 0.9, size: 0.1, shape: "dot", rate: 1.0, color: "acC", track: false };
actions.cShaftSpin = { type: "rotate", parts: idsOf("cShaft"), axis: [0, 0, 1], pivot: [MTX, 2.0, 0], rps: 1.2, rampSpin: true };
actions.cDieHeat = { type: "pulse", _說明: "晶片發熱（示意，碳化矽損耗小，只微亮）", parts: ["cDieB"], color: "heatC", glow: 0.35, freq: 1.0, halo: 0 };

// ═════ 站 D：氮化鎵快充（x 90）：爆炸分解（外殼下、電路板、晶片、變壓器、電容、Type-C、外殼上）＋右邊同功率矽充電頭虛線框 ═════
const DX = 90, DCX = DX - 2.0;
LAY("dPl", [11, 1, DX, 0.4]);
const DH = plinth("dPl", "dPl", DX, 0, 11.0, 5.6, 0.8);
LAY("dShellB", [3.6, 1.2, DCX, DH + 0.5]); LAY("dPcb", [3.2, 0.3, DCX, DH + 0.3]); LAY("dParts", [3.2, 1.2, DCX, DH + 0.8]); LAY("dShellT", [3.6, 0.4, DCX, DH + 1.2]);
BOX("dSbBot", "dShellB", DCX - 1.7, DCX + 1.7, DH, DH + 0.1, -1.7, 1.7, "plasticW");
BOX("dSbF", "dShellB", DCX - 1.7, DCX + 1.7, DH + 0.1, DH + 1.1, 1.62, 1.7, "plasticW"); BOX("dSbBk", "dShellB", DCX - 1.7, DCX + 1.7, DH + 0.1, DH + 1.1, -1.7, -1.62, "plasticW");
BOX("dSbL", "dShellB", DCX - 1.7, DCX - 1.62, DH + 0.1, DH + 1.1, -1.62, 1.62, "plasticW"); BOX("dSbR", "dShellB", DCX + 1.62, DCX + 1.7, DH + 0.1, DH + 1.1, -1.62, 1.62, "plasticW");
P({ id: "dProng", layer: "dShellB", shape: "box", size: [0.14, 0.5, 0.9], pos: [0, R2(DH + 0.55), -2.15], at: [[R2(DCX - 0.45), 0, 0], [R2(DCX + 0.45), 0, 0]], mat: "steel2" });
BOX("dUsbHole", "dShellB", DCX - 0.5, DCX + 0.5, DH + 0.42, DH + 0.66, 1.7, 1.72, "darker");
BOX("dPcbB", "dPcb", DCX - 1.5, DCX + 1.5, DH + 0.2, DH + 0.28, -1.5, 1.5, "pcb");
{ const via = []; for (let i = 0; i < 9; i++) for (let j = 0; j < 9; j++) if ((i * 5 + j * 3) % 4 === 0) via.push([R2(DCX - 1.3 + i * 0.33), 0, R2(-1.3 + j * 0.33)]);
  P({ id: "dVia", layer: "dPcb", shape: "cyl", size: [0.035, 0.01], rot: V, pos: [0, R2(DH + 0.285), 0], at: via, mat: "padGold" }); }
P({ id: "dTr", layer: "dPcb", shape: "box", size: [0.03, 0.008, 1.9], pos: [0, R2(DH + 0.284), 0.1], at: Array.from({ length: 7 }, (_, i) => [R2(DCX - 0.15 + i * 0.12), 0, 0]), mat: "padGold" });
P({ id: "dTrX", layer: "dPcb", shape: "box", size: [1.4, 0.008, 0.03], pos: [R2(DCX - 0.6), R2(DH + 0.284), 0], at: [[0, 0, -0.2], [0, 0, -0.08], [0, 0, 0.04]], mat: "padGold" });
// 氮化鎵功率晶片（QFN：四邊接點＋底部散熱銲墊）
const GX = DCX - 0.6, GZ = -0.6, GY = DH + 0.28;
BOX("dGanB", "dParts", GX - 0.35, GX + 0.35, GY, GY + 0.09, GZ - 0.35, GZ + 0.35, "chip"); BOX("dGanT", "dParts", GX - 0.33, GX + 0.33, GY + 0.09, GY + 0.095, GZ - 0.33, GZ + 0.33, "chipTop");
{ const pads = []; for (let i = 0; i < 6; i++) { const u = -0.27 + i * 0.108; pads.push([R2(GX + u), 0, R2(GZ - 0.37)], [R2(GX + u), 0, R2(GZ + 0.37)], [R2(GX - 0.37), 0, R2(GZ + u)], [R2(GX + 0.37), 0, R2(GZ + u)]); }
  P({ id: "dGanPad", layer: "dParts", shape: "box", size: [0.06, 0.03, 0.06], pos: [0, R2(GY + 0.015), 0], at: pads, mat: "padGold" }); }
P({ id: "dGanDot", layer: "dParts", shape: "cyl", size: [0.04, 0.01], rot: V, pos: [R2(GX - 0.24), R2(GY + 0.1), R2(GZ - 0.24)], mat: "panel2" });
soic8("dIc", "dParts", R2(DCX + 0.8), GY, -0.95, 1.2);
// 變壓器：鐵氧體 E 形磁芯（三柱＋上下軛）＋白色骨架＋銅線繞組
const TX = DCX + 0.55, TZ = 0.45;
for (const dx of [-0.42, 0, 0.42]) BOX(`dCore${dx < 0 ? "L" : dx > 0 ? "R" : "M"}`, "dParts", R2(TX + dx - 0.1), R2(TX + dx + 0.1), GY, GY + 0.75, TZ - 0.3, TZ + 0.3, "ferrite");
BOX("dCoreT", "dParts", TX - 0.52, TX + 0.52, GY + 0.75, GY + 0.86, TZ - 0.3, TZ + 0.3, "ferrite"); BOX("dCoreB", "dParts", TX - 0.52, TX + 0.52, GY, GY + 0.06, TZ - 0.32, TZ + 0.32, "ferrite");
VT("dBobbin", "dParts", 0.3, 0.16, GY + 0.08, GY + 0.72, "white", { x: TX, z: TZ });
P({ id: "dWind", layer: "dParts", shape: "tube", size: [0.33, 0.2, 0.06], rot: V, pos: [TX, 0, TZ], at: Array.from({ length: 8 }, (_, i) => [0, R2(GY + 0.14 + i * 0.07), 0]), mat: "cuBright" });
// 電解電容兩顆（藍色套管、頂部銀色防爆十字）＋小電容排
P({ id: "dCap", layer: "dParts", shape: "cyl", size: [0.28, 0.95], rot: V, pos: [0, R2(GY + 0.475), 0], at: [[R2(DCX - 0.95), 0, 0.7], [R2(DCX - 0.3), 0, 1.0]], mat: "capB" });
P({ id: "dCapTop", layer: "dParts", shape: "cyl", size: [0.27, 0.02], rot: V, pos: [0, R2(GY + 0.96), 0], at: [[R2(DCX - 0.95), 0, 0.7], [R2(DCX - 0.3), 0, 1.0]], mat: "steel2" });
P({ id: "dCapX", layer: "dParts", shape: "box", size: [0.36, 0.01, 0.03], pos: [0, R2(GY + 0.975), 0], at: [[R2(DCX - 0.95), 0, 0.7], [R2(DCX - 0.3), 0, 1.0]], mat: "darker" });
P({ id: "dMlcc", layer: "dParts", shape: "box", size: [0.12, 0.06, 0.07], pos: [0, R2(GY + 0.03), 0], at: Array.from({ length: 6 }, (_, i) => [R2(DCX - 1.2 + i * 0.18), 0, -1.25]), mat: "seam" });
BOX("dUsb", "dParts", DCX - 0.45, DCX + 0.45, GY, GY + 0.3, 1.0, 1.58, "steel2"); BOX("dUsbTongue", "dParts", DCX - 0.3, DCX + 0.3, GY + 0.12, GY + 0.18, 1.3, 1.6, "darker");
// 外殼上蓋：圓角蓋板＋側邊卡榫
BOX("dStTop", "dShellT", DCX - 1.72, DCX + 1.72, DH + 1.1, DH + 1.22, -1.72, 1.72, "plasticW");
BOX("dStRim", "dShellT", DCX - 1.6, DCX + 1.6, DH + 1.04, DH + 1.1, -1.6, 1.6, "panel2");
BOX("dStLogo", "dShellT", DCX - 0.6, DCX + 0.6, DH + 1.22, DH + 1.23, -0.15, 0.15, "seam");
// 同功率矽充電頭（虛線外框＋半透明）：示意大小
LAY("dGhost", [5, 3, DX + 3.2, 1.8]);
const GW = 2.45, GH = 2.4, GXc = DX + 3.0;
BOX("dGhostB", "dGhost", GXc - GW, GXc + GW, DH, DH + GH, -GW + 0.6, GW - 0.6, "ghost");
{ const e = 0.05, x0 = GXc - GW, x1 = GXc + GW, y0 = DH, y1 = DH + GH, z0 = -GW + 0.6, z1 = GW - 0.6;
  for (const [y, z] of [[y0, z0], [y0, z1], [y1, z0], [y1, z1]]) BOX(`dGe_x${y}${z}`.replace(/[.-]/g, "_"), "dGhost", x0, x1, y - e, y + e, z - e, z + e, "mark");
  for (const [x, z] of [[x0, z0], [x0, z1], [x1, z0], [x1, z1]]) BOX(`dGe_y${x}${z}`.replace(/[.-]/g, "_"), "dGhost", x - e, x + e, y0, y1, z - e, z + e, "mark"); }
actions.dGanPulse = { type: "pulse", _說明: "氮化鎵開關特別快：晶片高頻閃（示意頻率）", parts: ["dGanT"], color: "gaC", glow: 0.9, freq: 7.0, halo: 0 };
actions.dPwrFlow = { type: "flow", _說明: "電從插腳經晶片、變壓器送到 Type-C", layer: "dPcb", path: [[DCX, R2(DH + 0.34), -1.45], [R2(GX), R2(DH + 0.34), R2(GZ)], [R2(TX), R2(DH + 0.34), R2(TZ)], [DCX, R2(DH + 0.34), 1.3]], n: 5, size: 0.08, shape: "dot", rate: 1.0, color: "acC", track: false };

// ═════ 站 E：碳化矽長晶爐（x 120，物理氣相傳輸）：沿軸線爆炸（腔體鐘罩 → 感應線圈 → 石英管 → 石墨氈 → 坩堝蓋＋晶種＋晶錠），坩堝與粉末留在底座 ═════
const EX = 120;
LAY("ePl", [9, 1.2, EX, 0.5]);
const EH = plinth("ePl", "ePl", EX, 0, 8.4, 6.6, 0.9);
LAY("eBase", [6, 0.4, EX, EH + 0.15]);
VC("eBaseF", "eBase", 3.0, EH, EH + 0.3, "steel2", { x: EX });
P({ id: "eBaseBolt", layer: "eBase", shape: "cyl", size: [0.09, 0.08], rot: V, pos: [0, R2(EH + 0.34), 0], at: RING(16, 2.85, EX, 0), mat: "steel" });
P({ id: "eBaseLeg", layer: "eBase", shape: "cyl", size: [0.35, 0.55], rot: V, pos: [0, R2(EH + 0.6), 0], at: RING(3, 0.0001, EX, 0), mat: "dark" });
BOX("eVacPort", "eBase", EX + 2.6, EX + 3.9, EH + 0.05, EH + 0.28, -0.25, 0.25, "steel");
// 鐘罩（水冷腔壁）：筒身、頂蓋、上下法蘭、觀察窗、兩條冷卻水管
LAY("eBell", [6, 7.5, EX, EH + 3.8]);
VT("eBellW", "eBell", 2.8, 2.66, EH + 0.32, EH + 7.0, "steel2", { x: EX });
VC("eBellTop", "eBell", 2.85, EH + 7.0, EH + 7.3, "steel2", { x: EX });
VT("eBellFl", "eBell", 3.0, 2.66, EH + 0.32, EH + 0.55, "steel", { x: EX });
P({ id: "eBellFlBolt", layer: "eBell", shape: "cyl", size: [0.08, 0.1], rot: V, pos: [0, R2(EH + 0.6), 0], at: RING(16, 2.88, EX, 0), mat: "steel" });
P({ id: "eWinF", layer: "eBell", shape: "tube", size: [0.55, 0.38, 0.14], pos: [EX, R2(EH + 3.4), 2.82], mat: "steel" });
P({ id: "eWinG", layer: "eBell", shape: "cyl", size: [0.38, 0.04], pos: [EX, R2(EH + 3.4), 2.8], mat: "glass" });
P({ id: "eWinBolt", layer: "eBell", shape: "cyl", size: [0.04, 0.05], pos: [0, 0, 2.9], at: RING(6, 0.47, 0, 0).map(([x, , z]) => [R2(EX + x), R2(EH + 3.4 + z), 0]), mat: "steel" });
P({ id: "eWater", layer: "eBell", shape: "cyl", size: [0.12, 6.0], rot: V, pos: [0, R2(EH + 3.7), 0], at: [[EX - 2.95, 0, -0.8], [EX - 2.95, 0, 0.8]], mat: "capB" });
P({ id: "eWaterElb", layer: "eBell", shape: "sphere", size: [0.15], pos: [0, 0, 0], at: [[EX - 2.95, R2(EH + 6.7), -0.8], [EX - 2.95, R2(EH + 6.7), 0.8], [EX - 2.95, R2(EH + 0.7), -0.8], [EX - 2.95, R2(EH + 0.7), 0.8]], mat: "steel" });
BOX("eBellPlate", "eBell", EX - 0.8, EX + 0.8, EH + 5.6, EH + 6.1, 2.66, 2.82, "panel");
P({ id: "eBellLamp", layer: "eBell", shape: "cyl", size: [0.09, 0.05], pos: [0, R2(EH + 5.85), 2.84], at: [[EX + 0.5, 0, 0]], mat: "lampG" });
// 感應線圈：銅管螺旋（9 圈，每圈略偏表示螺旋）＋兩根引線＋接頭
LAY("eCoil", [5, 5, EX, EH + 3]);
P({ id: "eCoilT", layer: "eCoil", shape: "tube", size: [2.25, 2.05, 0.2], rot: V, pos: [EX, 0, 0], at: Array.from({ length: 9 }, (_, i) => [0, R2(EH + 1.2 + i * 0.48), 0]), mat: "cu" });
P({ id: "eCoilTie", layer: "eCoil", shape: "box", size: [0.12, R2(8 * 0.48 + 0.3), 0.14], pos: [0, R2(EH + 1.2 + 4 * 0.48), 0], at: RING(4, 2.28, EX, 0, 45), mat: "ceramic" });
BOX("eCoilLeadA", "eCoil", EX + 2.1, EX + 3.6, EH + 1.1, EH + 1.3, -0.35, -0.15, "cu"); BOX("eCoilLeadB", "eCoil", EX + 2.1, EX + 3.6, EH + 5.0, EH + 5.2, -0.35, -0.15, "cu");
BOX("eCoilJack", "eCoil", EX + 3.6, EX + 4.0, EH + 0.9, EH + 5.4, -0.5, 0.0, "dark");
// 石英管、石墨氈保溫層
LAY("eQtz", [4, 6, EX, EH + 3.3]); VT("eQtzT", "eQtz", 1.88, 1.78, EH + 0.5, EH + 6.3, "glass", { x: EX });
VT("eQtzRim", "eQtz", 1.95, 1.78, EH + 6.2, EH + 6.35, "steel2", { x: EX });
LAY("eFelt", [3.5, 5, EX, EH + 3.1]); VT("eFeltT", "eFelt", 1.68, 1.24, EH + 0.8, EH + 5.5, "felt", { x: EX });
VT("eFeltTop", "eFelt", 1.68, 0.35, EH + 5.5, EH + 5.8, "felt", { x: EX });
// 坩堝（石墨）＋底部碳化矽粉末（顆粒）
LAY("eCru", [3, 4, EX, EH + 2.8]);
VT("eCruW", "eCru", 1.15, 0.95, EH + 1.0, EH + 4.6, "graphite", { x: EX }); VC("eCruB", "eCru", 1.15, EH + 0.9, EH + 1.0, "graphite", { x: EX });
P({ id: "eCruThread", layer: "eCru", shape: "tube", size: [1.17, 1.1, 0.03], rot: V, pos: [EX, 0, 0], at: [0, 1, 2, 3].map((i) => [0, R2(EH + 4.35 + i * 0.07), 0]), mat: "darker" });
LAY("ePow", [2, 1, EX, EH + 1.6]);
VC("ePowB", "ePow", 0.94, EH + 1.0, EH + 1.9, "powder", { x: EX });
{ const g = []; for (let i = 0; i < 46; i++) { const a = i * 2.39996, r = 0.86 * Math.sqrt((i + 0.5) / 46); g.push([R2(EX + r * Math.cos(a)), 0, R2(r * Math.sin(a))]); }
  P({ id: "ePowG", layer: "ePow", shape: "sphere", size: [0.07], pos: [0, R2(EH + 1.92), 0], at: g, mat: "powder" }); }
LAY("eHot", [2, 1, EX, EH + 1.2]);
VC("eHotD", "eHot", 0.96, EH + 1.0, EH + 1.05, "hotGlow", { x: EX }); VT("eHotR", "eHot", 1.18, 1.14, EH + 1.0, EH + 2.2, "hotGlow", { x: EX });
// 坩堝蓋（螺紋＋把手）＋蓋下的晶種＋往下長的晶錠（三階段）
LAY("eLid", [3, 1, EX, EH + 4.6]);
VC("eLidP", "eLid", 1.2, EH + 4.6, EH + 4.9, "graphite", { x: EX }); VC("eLidKnob", "eLid", 0.35, EH + 4.9, EH + 5.15, "graphite", { x: EX });
VC("eSeed", "eLid", 0.8, EH + 4.5, EH + 4.6, "sicSolid", { x: EX });
for (const [k, t] of [[1, 0.18], [2, 0.42], [3, 0.7]]) { LAY(`eBoule${k}`, [2, 1, EX, EH + 4.2]); VC(`eBouleC${k}`, `eBoule${k}`, R2(0.8 + k * 0.03), R2(EH + 4.5 - t), EH + 4.5, "sic", { x: EX }); }
actions.eCoilGlow = { type: "pulse", _說明: "感應線圈通交流電，坩堝被感應加熱（示意）", parts: idsOf("eCoil").filter((i) => i.startsWith("eCoilT")), color: "cuBright", glow: 0.7, freq: 1.6, halo: 0 };
actions.eHotPulse = { type: "pulse", parts: ["eHotD", "eHotR"], color: "hotC", glow: 1, freq: 0.8, halo: 0 };
actions.eVapor = { type: "flow", _說明: "粉末昇華成氣體，往上擴散到較冷的晶種表面凝結（像結霜）", layer: "ePow", path: [[R2(EX - 0.6), R2(EH + 2.0), 0.3], [R2(EX - 0.4), R2(EH + 3.0), 0.3], [R2(EX - 0.5), R2(EH + 3.9), 0.3], [R2(EX - 0.3), R2(EH + 4.3), 0.3]], n: 4, lanes: 5, laneDir: [1, 0, 0], laneGap: 0.3, jitter: 0.25, size: 0.06, shape: "dot", rate: 0.35, color: "vaporC", track: false, free: true };

// ═════ 站 F：氮化鎵磊晶爐（x 150，有機金屬化學氣相沉積）：腔體、加熱器、旋轉承盤＋6 片矽晶圓、噴氣頭（孔陣）＋上蓋與氣管閥門 ═════
const FX = 150;
LAY("fPl", [9, 1.2, FX, 0.5]);
const FH = plinth("fPl", "fPl", FX, 0, 8.4, 6.6, 0.9);
LAY("fBody", [6, 2.5, FX, FH + 1.2]);
VT("fBodyW", "fBody", 2.6, 2.45, FH, FH + 2.3, "steel2", { x: FX }); VC("fBodyB", "fBody", 2.6, FH, FH + 0.12, "steel", { x: FX });
VT("fBodyFl", "fBody", 2.8, 2.45, FH + 2.2, FH + 2.35, "steel", { x: FX });
P({ id: "fBodyBolt", layer: "fBody", shape: "cyl", size: [0.08, 0.08], rot: V, pos: [0, R2(FH + 2.39), 0], at: RING(16, 2.68, FX, 0), mat: "steel" });
P({ id: "fViewF", layer: "fBody", shape: "tube", size: [0.5, 0.34, 0.12], pos: [FX + 0.9, R2(FH + 1.4), 2.6], mat: "steel" }); P({ id: "fViewG", layer: "fBody", shape: "cyl", size: [0.34, 0.03], pos: [FX + 0.9, R2(FH + 1.4), 2.58], mat: "glass" });
P({ id: "fExh", layer: "fBody", shape: "cyl", size: [0.32, 1.6], rot: [0, 90, 0], pos: [R2(FX - 3.3), R2(FH + 0.45), 0], mat: "steel" });
BOX("fExhFl", "fBody", FX - 2.75, FX - 2.6, FH + 0.05, FH + 0.85, -0.42, 0.42, "steel2");
LAY("fHeat", [4, 0.4, FX, FH + 0.7]);
P({ id: "fHeatR", layer: "fHeat", shape: "tube", size: [1.0, 0.85, 0.08], rot: V, pos: [FX, R2(FH + 0.75), 0], at: [[0, 0, 0]], mat: "hotGlow" });
P({ id: "fHeatR2", layer: "fHeat", shape: "tube", size: [1.75, 1.6, 0.08], rot: V, pos: [FX, R2(FH + 0.75), 0], mat: "hotGlow" });
LAY("fSus", [4.4, 0.6, FX, FH + 1.2]);
VC("fSusD", "fSus", 2.0, FH + 1.05, FH + 1.28, "graphite", { x: FX }); VC("fSusHub", "fSus", 0.35, FH + 1.28, FH + 1.36, "steel2", { x: FX });
VC("fSusShaft", "fSus", 0.2, FH + 0.12, FH + 1.05, "steel", { x: FX });
const POCK = RING(6, 1.3, FX, 0, 30);
P({ id: "fPocket", layer: "fSus", shape: "tube", size: [0.58, 0.52, 0.04], rot: V, pos: [0, R2(FH + 1.29), 0], at: POCK, mat: "darker" });
P({ id: "fWaf", layer: "fSus", shape: "cyl", size: [0.5, 0.035], rot: V, pos: [0, R2(FH + 1.3), 0], at: POCK, mat: "mirror" });
P({ id: "fWafNotch", layer: "fSus", shape: "box", size: [0.08, 0.04, 0.08], pos: [0, R2(FH + 1.31), 0], at: POCK.map(([x, , z]) => [x, 0, R2(z + 0.47)]), mat: "darker" });
LAY("fFilm", [4, 0.2, FX, FH + 1.33]);
P({ id: "fFilmD", layer: "fFilm", shape: "cyl", size: [0.48, 0.02], rot: V, pos: [0, R2(FH + 1.33), 0], at: POCK, mat: "gan" });
// 噴氣頭：圓盤＋底面孔陣（暗點）、上蓋法蘭、兩條氣管（含鎵氣體、氨氣）與閥門手輪
LAY("fShow", [5.6, 2.4, FX, FH + 3.2]);
VC("fShowD", "fShow", 2.15, FH + 2.45, FH + 2.7, "steel2", { x: FX });
{ const h = []; for (let i = -8; i <= 8; i++) for (let j = -8; j <= 8; j++) { const x = i * 0.22, z = j * 0.22; if (Math.hypot(x, z) < 1.9) h.push([R2(FX + x), 0, R2(z)]); }
  P({ id: "fShowHole", layer: "fShow", shape: "cyl", size: [0.04, 0.01], rot: V, pos: [0, R2(FH + 2.444), 0], at: h, mat: "darker" }); }
VC("fLid", "fShow", 2.8, FH + 2.7, FH + 2.95, "steel", { x: FX });
P({ id: "fLidBolt", layer: "fShow", shape: "cyl", size: [0.08, 0.08], rot: V, pos: [0, R2(FH + 2.99), 0], at: RING(16, 2.65, FX, 0), mat: "steel2" });
P({ id: "fGasPipe", layer: "fShow", shape: "cyl", size: [0.13, 1.4], rot: V, pos: [0, R2(FH + 3.65), 0], at: [[FX - 0.8, 0, 0], [FX + 0.8, 0, 0]], mat: "steel2" });
BOX("fManifold", "fShow", FX - 1.2, FX + 1.2, FH + 4.3, FH + 4.55, -0.25, 0.25, "steel");
P({ id: "fValve", layer: "fShow", shape: "box", size: [0.34, 0.34, 0.34], pos: [0, R2(FH + 3.6), 0], at: [[FX - 0.8, 0, 0], [FX + 0.8, 0, 0]], mat: "dark" });
P({ id: "fValveW", layer: "fShow", shape: "tube", size: [0.24, 0.18, 0.04], pos: [0, R2(FH + 3.6), 0.22], at: [[FX - 0.8, 0, 0], [FX + 0.8, 0, 0]], mat: "lampR" });
P({ id: "fGasTag", layer: "fShow", shape: "box", size: [0.5, 0.18, 0.02], pos: [0, R2(FH + 3.15), 0.15], at: [[FX - 0.8, 0, 0], [FX + 0.8, 0, 0]], mat: "panel" });
actions.fSusSpin = { type: "rotate", _說明: "承盤帶著晶圓轉，膜才長得均勻", parts: [...idsOf("fSus").filter((i) => i !== "fSusShaft"), ...idsOf("fFilm")], axis: [0, 1, 0], pivot: [FX, FH + 1.2, 0], rps: 0.25, rampSpin: true };
actions.fGasGa = { type: "flow", _說明: "含鎵氣體從噴氣頭孔往下噴、碰到晶圓沿表面散開", layer: "fShow", path: [[R2(FX - 1.4), R2(FH + 2.4), 0.2], [R2(FX - 1.4), R2(FH + 1.5), 0.2], [R2(FX - 2.3), R2(FH + 1.45), 0.2]], n: 3, lanes: 4, laneDir: [0, 0, 1], laneGap: 0.4, jitter: 0.12, size: 0.06, shape: "dot", rate: 0.7, color: "gaC", track: false, free: true };
actions.fGasN = { type: "flow", _說明: "氨氣（氮的來源）同樣往下噴、在熱晶圓表面反應", layer: "fShow", path: [[R2(FX + 1.4), R2(FH + 2.4), 0.2], [R2(FX + 1.4), R2(FH + 1.5), 0.2], [R2(FX + 2.3), R2(FH + 1.45), 0.2]], n: 3, lanes: 4, laneDir: [0, 0, 1], laneGap: 0.4, jitter: 0.12, size: 0.06, shape: "dot", rate: 0.7, color: "ammoniaC", track: false, free: true };
actions.fGasMid = { type: "flow", layer: "fShow", path: [[FX, R2(FH + 2.4), -0.8], [FX, R2(FH + 1.45), -0.8]], n: 3, lanes: 5, laneDir: [1, 0, 0], laneGap: 0.4, jitter: 0.1, size: 0.05, shape: "dot", rate: 0.7, color: "gaC", track: false, free: true };
actions.fHeatGlow = { type: "pulse", parts: ["fHeatR", "fHeatR2"], color: "hotC", glow: 0.9, freq: 0.6, halo: 0 };

// ═════ 站 G：台灣三段（x 180）：基板（環球晶）→ 磊晶（嘉晶）→ 元件代工（漢磊），台間紙箭頭 ═════
const GXX = 180;
const brandItems = ["flag:TW"];
const LOGO_OK = (id) => fs.existsSync(path.join(HERE, "..", "..", "public", "logos", `${id}.svg`)) || fs.existsSync(path.join(HERE, "..", "..", "public", "logos", `${id}.png`));
const CO = [["globalwafers", "環球晶|6488", "sub"], ["epiworld", "嘉晶|3016", "epi"], ["episil", "漢磊|3707", "dev"]];
for (const [id, name] of CO) brandItems.push(LOGO_OK(id) ? `logo:${id}` : `text:${id}=${name}`);
{ const r = spawnSync("node", [path.join(HERE, "..", "..", "scripts", "three", "make-brand-tex.mjs"), "tech-compound", ...brandItems], { encoding: "utf8" }); if (r.status !== 0) { console.error(r.stderr); process.exit(1); } }
const BMETA = JSON.parse(fs.readFileSync(path.join(HERE, "..", "..", "public", "tex", "brand", "meta.json"), "utf8"));
materials.flag_TW = { kind: "unlit", color: "#FFFFFF", img: "tex/brand/flag-TW.png" };
CO.forEach(([id, , kind], k) => {
  const L = `gP${k}`, x = GXX + (k - 1) * 4.4; LAY(L, [3.8, 3.8, x, 1.8]);
  const h = plinth(L, L, x, 0, 3.8, 3.4, 1.2);
  materials[`t_${id}`] = { kind: "unlit", color: "#FFFFFF", img: `tex/brand/sign-${id}.png` };
  const ar = BMETA[`sign-${id}`]?.aspect ?? 3.2, sw = 2.4, sh = R2(Math.min(0.8, sw / ar));
  P({ id: `${L}Sign`, layer: L, shape: "plane", size: [sw, sh], pos: [R2(x + 0.35), 0.62, 1.72], mat: `t_${id}`, uv01: true });
  P({ id: `${L}Flag`, layer: L, shape: "plane", size: [0.72, 0.48], pos: [R2(x - 1.45), 0.62, 1.72], mat: "flag_TW", uv01: true });
  const wy = h + 1.75, wz = -0.7; easel(L, L, x, h, wy, wz);
  if (kind === "sub") { standWafer(`${L}S`, L, x, wy, wz, 1.5, "sic", null); BOX(`${L}Flat`, L, x - 0.55, x + 0.55, R2(wy - 1.52), R2(wy - 1.45), wz - 0.04, wz + 0.04, "sicSolid");
    P({ id: `${L}Boule`, layer: L, shape: "cyl", size: [0.6, 0.9], rot: V, pos: [R2(x + 0.9), R2(h + 0.45), 0.7], mat: "sic" }); VC(`${L}BouleTop`, L, 0.62, h + 0.9, h + 0.93, "sicSolid", { x: R2(x + 0.9), z: 0.7 }); }
  if (kind === "epi") { standWafer(`${L}S`, L, x, wy, wz, 1.5, "sic", null); P({ id: `${L}Film`, layer: L, shape: "cyl", size: [1.47, 0.012], pos: [x, wy, R2(wz + 0.036)], mat: "gan" }); }
  if (kind === "dev") { standWafer(`${L}S`, L, x, wy, wz, 1.5, "sicSolid", "die");
    // 封裝好的功率晶片（TO-247：黑色本體、金屬散熱片＋螺孔、三支腳）
    const px = R2(x + 0.9), py = R2(h + 0.05), pz = 0.7;
    BOX(`${L}PkgB`, L, px - 0.32, px + 0.32, py, py + 0.08, pz - 0.42, pz + 0.3, "chip"); BOX(`${L}PkgTab`, L, px - 0.32, px + 0.32, py, py + 0.03, pz - 0.7, pz - 0.42, "steel2");
    P({ id: `${L}PkgHole`, layer: L, shape: "tube", size: [0.1, 0.05, 0.04], rot: V, pos: [px, R2(py + 0.02), R2(pz - 0.56)], mat: "darker" });
    P({ id: `${L}PkgLeg`, layer: L, shape: "box", size: [0.06, 0.03, 0.5], pos: [0, R2(py + 0.03), R2(pz + 0.55)], at: [[R2(px - 0.2), 0, 0], [px, 0, 0], [R2(px + 0.2), 0, 0]], mat: "steel2" }); }
  if (k < 2) P({ id: `gArr${k}`, layer: L, shape: "poly", pts: [[-0.5, 0.12], [0.2, 0.12], [0.2, 0.3], [0.55, 0], [0.2, -0.3], [0.2, -0.12], [-0.5, -0.12]], size: [1, 1, 0.06], pos: [R2(x + 2.2), R2(h + 1.9), -0.7], mat: "mark" });
});

// ═════ 站 H：研磨台（x 210，下一集再生晶圓）：左邊用過的測試片（表面有圖案）、右邊研磨盤＋研磨墊（溝紋）＋晶圓載頭＋研磨液管 ═════
const HX = 210;
LAY("hPl", [11, 1.2, HX, 0.5]);
const HH = plinth("hPl", "hPl", HX, 0, 11.0, 6.6, 0.9);
LAY("hUsed", [3.2, 3.4, HX - 3.6, 2.5]);
easel("hU", "hUsed", HX - 3.6, HH, HH + 1.75, -0.7); standWafer("hU", "hUsed", HX - 3.6, HH + 1.75, -0.7, 1.4, "mirror", null);
LAY("hPat", [3, 3, HX - 3.6, 2.6]);
{ const wd = [], st = 0.2; for (let i = -7; i <= 7; i++) for (let j = -7; j <= 7; j++) if (Math.hypot(Math.abs(i * st) + 0.1, Math.abs(j * st) + 0.1) < 1.3) wd.push([R2(HX - 3.6 + i * st), R2(HH + 1.75 + j * st), 0]);
  P({ id: "hPatD", layer: "hPat", shape: "box", size: [0.17, 0.17, 0.02], pos: [0, 0, -0.62], at: wd, mat: "pat" }); }
LAY("hPlaten", [6.4, 0.6, HX + 1.8, HH + 0.3]);
VC("hPlatenD", "hPlaten", 3.0, HH, HH + 0.4, "steel2", { x: HX + 1.8 }); VC("hPadD", "hPlaten", 2.95, HH + 0.4, HH + 0.48, "pad", { x: HX + 1.8 });
[0.6, 1.0, 1.4, 1.8, 2.2, 2.6].forEach((r, i) => VT(`hGroove${i}`, "hPlaten", R2(r), R2(r - 0.04), HH + 0.48, HH + 0.49, "seam", { x: HX + 1.8 }));
LAY("hHead", [2, 3, HX + 2.9, HH + 1.5]);
VC("hHeadC", "hHead", 0.95, HH + 0.55, HH + 1.05, "dark", { x: HX + 2.9, z: 0.4 }); VC("hHeadRing", "hHead", 1.0, HH + 0.49, HH + 0.58, "steel", { x: HX + 2.9, z: 0.4 });
VC("hSpindle", "hHead", 0.22, HH + 1.05, HH + 2.8, "steel2", { x: HX + 2.9, z: 0.4 });
BOX("hArm", "hPl", HX + 2.4, HX + 5.6, HH + 2.8, HH + 3.2, 0.1, 0.7, "band"); BOX("hCol", "hPl", HX + 5.2, HX + 5.6, HH, HH + 3.2, 0.1, 0.7, "band");
BOX("hSlurryArm", "hPl", HX + 0.6, HX + 4.8, HH + 1.3, HH + 1.42, -1.9, -1.78, "steel"); BOX("hSlurryCol", "hPl", HX + 4.7, HX + 4.85, HH, HH + 1.42, -1.95, -1.75, "steel");
actions.hPlatenSpin = { type: "rotate", parts: [...idsOf("hPlaten")], axis: [0, 1, 0], pivot: [HX + 1.8, HH, 0], rps: 0.35, rampSpin: true };
actions.hHeadSpin = { type: "rotate", parts: ["hHeadC", "hHeadRing", "hSpindle"], axis: [0, 1, 0], pivot: [HX + 2.9, HH, 0.4], rps: 0.3, rampSpin: true };
actions.hSlurry = { type: "flow", _說明: "研磨液從管口滴到墊子上", layer: "hPl", path: [[R2(HX + 0.7), R2(HH + 1.28), -1.84], [R2(HX + 0.7), R2(HH + 0.5), -1.84]], n: 3, size: 0.07, shape: "dot", rate: 0.9, color: "slurryC", track: false, free: true };

// ═════ 標註點 ═════
Object.assign(anchors, {
  aSiA: A("aSi", [AX - 3.4, 2.3, 0.1], -150, -100), aSiCA: A("aSiC", [AX, 2.3, 0.1], 150, -100), aGaNA: A("aGaN", [AX + 3.4, 2.3, 0.1], 150, -100),
  bSiGapA: A("bSi", [BX - 7.25, 2.2, 0.6], -150, -100), bScGapA: A("bSc", [BX + 1.15, 3.1, 0.6], 150, -100), bSiCbA: A("bSi", [BX - 2.0, 2.65, 0.7], 150, -100), bScVbA: A("bSc", [BX + 6.2, 1.6, 0.7], 150, 100),
  cDieA: A("cDie", [DIES[4][0], R2(CH + 1.11), DIES[4][1]], 150, -100), cDbcA: A("cDbc", [CX - 2.3, R2(CH + 0.96), 1.5], -150, -100), cBaseA: A("cBase", [CX - 2.4, R2(CH + 0.4), 1.6], -150, 100),
  cBatA: A("cBat", [BTX - 1.5, 1.95, 1.2], -150, -100), cMotA: A("cMot", [MTX, 3.6, 1.0], 150, -100), cCaseA: A("cCase", [CX + 2.25, R2(CH + 2.2), 0.9], 150, -100),
  dGanA: A("dParts", [GX, R2(GY + 0.1), GZ], -150, -100), dXfA: A("dParts", [TX, R2(GY + 0.86), TZ], 150, -100), dGhostA: A("dGhost", [GXc + GW, R2(DH + GH), 1.8], 150, -100),
  eCoilA: A("eCoil", [EX + 2.25, R2(EH + 3.6), 0.3], 150, -100), eCruA: A("eCru", [EX - 1.15, R2(EH + 2.4), 0.4], -150, -100), eSeedA: A("eLid", [EX + 0.8, R2(EH + 4.55), 0.3], 150, -100),
  ePowA: A("ePow", [EX - 0.7, R2(EH + 1.9), 0.5], -150, 100), eBouleA: A("eBoule3", [EX + 0.85, R2(EH + 4.0), 0.3], 150, 100), eFeltA: A("eFelt", [EX - 1.68, R2(EH + 4.0), 0.5], -150, -100),
  fWafA: A("fSus", [POCK[0][0], R2(FH + 1.32), POCK[0][2]], 150, -100), fShowA: A("fShow", [FX - 2.15, R2(FH + 2.55), 0.5], -150, -100), fFilmA: A("fFilm", [POCK[1][0], R2(FH + 1.34), POCK[1][2]], -150, -100),
  hPadA: A("hPlaten", [HX + 0.4, R2(HH + 0.48), 1.6], -150, 100), hUsedA: A("hUsed", [HX - 3.6, R2(HH + 2.6), -0.6], -150, -100), hHeadA: A("hHead", [HX + 3.85, R2(HH + 0.8), 0.4], 150, -100),
});
const model = {
  name: "示意 化合物半導體：矽／碳化矽／氮化鎵晶圓、能隙示意、電動車碳化矽功率模組（爆炸分解）、氮化鎵快充（爆炸分解）、碳化矽長晶爐（物理氣相傳輸，爆炸分解）、氮化鎵磊晶爐、台灣三段分工、研磨台（示意，非特定廠牌／型號）",
  unit: "示意（放大）",
  size: { w: 40, h: 18, r: 0.6, t: 30 },
  palette, materials,
  partNames: { aSiW: "晶圓", cDieB: "碳化矽晶片", eCruW: "坩堝" },
  layers, parts, anchors, actions,
  pose: { yaw0: 0, yawIso: 0, drift: 0 },
  camera: { stand: { d: 70, elev: 24, y: 4 } },
  fx: { dpr: 1, srcPx: 30, shadows: 0, fog: false, dust: false, vaporSprites: false, shimmer: false },
  info: { AX, BX, CX, DX, EX, FX, GX: GXX, HX, CH: R2(CH), DH: R2(DH), EH: R2(EH), FH: R2(FH), HH: R2(HH) },
};
fs.writeFileSync(path.join(HERE, "model.json"), JSON.stringify(model, null, 1) + "\n");
console.log(`✔ model.json：${parts.length} 個零件、${parts.reduce((a, p) => a + Math.max(1, p.at?.length ?? 0), 0)} 個實體、${layers.length} 層`);

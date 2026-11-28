// node videos/tech-reclaim/gen-model.mjs → 寫 videos/tech-reclaim/model.json
// 2026/11/28 tech-reclaim（中游補充篇 M4：再生晶圓）。構造照 physics-spec.md、模組清單照 visual-spec.md。全部放大示意，非特定廠牌／型號。
// 站點（地板頂面 y＝0）：A 晶圓盒（x 0）｜B 沉積腔＋測膜量台（x 30）｜C 直立爐管（x 60）｜D 用過測試片膜層（x 90）｜E 濕式去膜槽（x 120）
//   F 研磨拋光機＋刷洗（x 150）｜G 變薄對照＋卡尺（x 180）｜H 再生廠（x 210）｜N 密封盒運送（x 240）
import fs from "node:fs";
import path from "node:path";
const HERE = path.dirname(new URL(import.meta.url).pathname);
const R2 = (x) => Math.round(x * 1000) / 1000;
const palette = {
  floorC: "#C9D2DE", panel: "#F3F5F8", panel2: "#E2E8F0", seam: "#8E9BB0", band: "#24324C", steel: "#7D8CA6", steel2: "#A9B5C7", dark: "#3E4A60", darker: "#2A3142",
  lampY: "#F2B632", lampG: "#2FBF71", lampR: "#E5484D", screen: "#5B8DEF", rubber: "#2B2F36", gold: "#C9A24A", padGold: "#E0B84E", whiteP: "#FFFFFF",
  waferC: "#7C89A6", dieC: "#4C5E86", oxC: "#5FC4E8", nitC: "#7FCB8A", metC: "#C8794A", quartzC: "#DCE8F5", heatC: "#FF8A3D", insC: "#E9E1D2",
  liqC: "#6FB7E8", bubC: "#E8F6FF", padC: "#3A3F4C", slurC: "#EDEBE4", brushC: "#7FA8D9", dustC: "#C9A66B", beamC: "#E8613C", scanC: "#2FD3E0",
  winC: "#5B8DEF", winD: "#2F4A7A", roofC: "#B6C0CF", markC: "#E8613C", boxC: "#8FA3BF", glassC: "#BFD3F2", plasC: "#B07CF0",
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
  wafer: M("std", "waferC", { rough: 0.12, metal: 0.85, env: 1.1 }), mirror: M("std", "waferC", { rough: 0.05, metal: 0.95, env: 1.4 }),
  die: M("std", "dieC", { rough: 0.2, metal: 0.6, env: 0.9, tex: "traces", texScale: 0.35 }),
  ox: M("std", "oxC", { rough: 0.3, metal: 0.2, env: 0.6, opacity: 0.92 }), nit: M("std", "nitC", { rough: 0.3, metal: 0.2, env: 0.6, opacity: 0.92 }),
  met: M("std", "metC", { rough: 0.25, metal: 0.9, env: 0.9 }),
  quartz: M("phys", "quartzC", { rough: 0.05, metal: 0, clearcoat: 1, opacity: 0.35, env: 0.8 }), quartzS: M("phys", "quartzC", { rough: 0.1, metal: 0, clearcoat: 1, opacity: 0.85, env: 0.8 }),
  ins: M("std", "insC", { rough: 0.9, metal: 0 }), heat: glowM("heatC", 1, 0.8), heatDim: M("std", "heatC", { rough: 0.6, metal: 0.3, emissive: "heatC", ei: 0.15 }),
  glass: M("phys", "glassC", { rough: 0.05, metal: 0, clearcoat: 1, opacity: 0.3, env: 0.6 }), liq: M("phys", "liqC", { rough: 0.05, metal: 0, clearcoat: 1, opacity: 0.5, env: 0.7 }),
  pad: M("std", "padC", { rough: 0.85, metal: 0 }), slur: M("std", "slurC", { rough: 0.6, metal: 0 }), brush: M("std", "brushC", { rough: 0.95, metal: 0, tex: "wick", texScale: 0.3 }),
  win: M("std", "winC", { rough: 0.15, metal: 0.4, env: 1.0, emissive: "winC", ei: 0.15 }), winD: M("std", "winD", { rough: 0.2, metal: 0.4, env: 0.8 }), roof: M("std", "roofC", { rough: 0.6, metal: 0.3 }),
  box: M("phys", "boxC", { rough: 0.2, metal: 0, clearcoat: 1, opacity: 0.55, env: 0.6 }), boxS: M("std", "boxC", { rough: 0.35, metal: 0.1, env: 0.5 }),
  mark: M("std", "markC", { rough: 0.5, metal: 0, emissive: "markC", ei: 0.25 }), white: M("std", "whiteP", { rough: 0.7, metal: 0 }),
  plas: glowM("plasC", 0.55, 0.9), scan: glowM("scanC", 1, 0.9), dust: glowM("lampY", 1, 0.9),
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
const plinth = (id, layer, x, z, w, d, h = 0.8) => { BOX(`${id}Pl`, layer, x - w / 2, x + w / 2, 0, h, z - d / 2, z + d / 2, "band"); BOX(`${id}PlT`, layer, x - w / 2, x + w / 2, h, h + 0.05, z - d / 2, z + d / 2, "panel2");
  BOX(`${id}Kick`, layer, x - w / 2 - 0.05, x + w / 2 + 0.05, 0, 0.12, z - d / 2 - 0.05, z + d / 2 + 0.05, "darker");
  P({ id: `${id}Bolt`, layer, shape: "cyl", size: [0.1, 0.04], rot: V, pos: [0, R2(h + 0.07), 0], at: [[x - w / 2 + 0.3, 0, z - d / 2 + 0.3], [x + w / 2 - 0.3, 0, z - d / 2 + 0.3], [x - w / 2 + 0.3, 0, z + d / 2 - 0.3], [x + w / 2 - 0.3, 0, z + d / 2 - 0.3]].map((a) => a.map(R2)), mat: "steel" }); return h + 0.05; };
// 晶圓（水平）：本體＋缺口；dies＝上面一格格晶粒（產品片）
const wafer = (id, layer, x, y, z, r, mat = "mirror", dies = false, t = 0.06) => {
  VC(`${id}W`, layer, r, y, y + t, mat, { x, z });
  BOX(`${id}N`, layer, x - 0.06, x + 0.06, y - 0.005, y + t + 0.005, z + r - 0.08, z + r + 0.01, "darker");
  if (dies) { const at = [], g = r * 0.26; for (let i = -3; i <= 3; i++) for (let j = -3; j <= 3; j++) if (Math.hypot(Math.abs(i * g) + g / 2, Math.abs(j * g) + g / 2) < r * 0.95) at.push([R2(x + i * g), 0, R2(z + j * g)]);
    P({ id: `${id}D`, layer, shape: "box", size: [R2(g * 0.88), 0.012, R2(g * 0.88)], pos: [0, R2(y + t + 0.006), 0], at, mat: "die" }); }
};
// 控制面板：螢幕＋三顆燈＋按鈕
const panelUI = (id, layer, x, y, z, s = 1) => {
  BOX(`${id}Pn`, layer, x - 0.7 * s, x + 0.7 * s, y, y + 1.0 * s, z, z + 0.08, "darker");
  BOX(`${id}Sc`, layer, x - 0.55 * s, x + 0.35 * s, y + 0.35 * s, y + 0.88 * s, z + 0.08, z + 0.1, "screen");
  SPH(`${id}L0`, layer, 0.06 * s, x + 0.52 * s, y + 0.8 * s, z + 0.1, "lampG"); SPH(`${id}L1`, layer, 0.06 * s, x + 0.52 * s, y + 0.64 * s, z + 0.1, "lampY"); SPH(`${id}L2`, layer, 0.06 * s, x + 0.52 * s, y + 0.48 * s, z + 0.1, "lampR");
  P({ id: `${id}Bt`, layer, shape: "cyl", size: [R2(0.06 * s), 0.04], pos: [0, R2(y + 0.17 * s), R2(z + 0.1)], at: [0, 1, 2, 3, 4].map((i) => [R2(x - 0.5 * s + i * 0.22 * s), 0, 0]), mat: "steel2" });
};
// 閥件：閥體＋手輪
const valve = (id, layer, x, y, z) => { BOX(`${id}B`, layer, x - 0.14, x + 0.14, y - 0.12, y + 0.12, z - 0.12, z + 0.12, "steel"); VC(`${id}S`, layer, 0.03, y + 0.12, y + 0.3, "steel2", { x, z });
  RING(`${id}H`, layer, 0.16, 0.12, y + 0.3, y + 0.34, "lampR", x, z); };
const idsOf = (layer) => parts.filter((q) => q.layer === layer).map((q) => q.id);

// ═════ 地板 ═════
LAY("floor", [300, 2, 120, 0], true);
P({ id: "floor", layer: "floor", shape: "slab", size: [300, 0.5, 44], r: 0.2, pos: [120, -0.25, 0], mat: "floor" });
P({ id: "floorSeam", layer: "floor", shape: "slab", size: [300, 0.04, 0.1], pos: [120, 0.01, 0], at: Array.from({ length: 7 }, (_, i) => [0, 0, R2(-16 + i * 5.3)]), mat: "seam" });

// ═════ 站 A：開放式晶圓盒（x 0）：13 片，產品片（晶粒格）與空白測試片（鏡面）交錯；正中一片測試片會抽出來亮 ═════
const AX = 0;
LAY("aBase", [8, 1, AX, 0.5]);
const AH = plinth("a", "aBase", AX, 0, 7.6, 6.4, 0.8);
LAY("aCas", [6.4, 6, AX, 3.6]);
const AR = 2.4, ASP = 0.42, AN = 13, AY0 = AH + 0.35;
for (const sx of [-1, 1]) {
  BOX(`aSide${sx}`, "aCas", AX + Math.min(sx * (AR + 0.1), sx * (AR + 0.3)), AX + Math.max(sx * (AR + 0.1), sx * (AR + 0.3)), AH + 0.15, AY0 + AN * ASP + 0.2, -1.8, 1.4, "boxS");
  P({ id: `aRib${sx}`, layer: "aCas", shape: "box", size: [0.22, 0.05, 2.9], pos: [R2(AX + sx * (AR - 0.02)), 0, -0.2], at: Array.from({ length: AN + 1 }, (_, i) => [0, R2(AY0 - 0.06 + i * ASP), 0]), mat: "boxS" });
}
BOX("aBack", "aCas", AX - AR - 0.3, AX + AR + 0.3, AH + 0.15, AY0 + AN * ASP + 0.2, -1.95, -1.8, "boxS");
BOX("aTop", "aCas", AX - AR - 0.3, AX + AR + 0.3, AY0 + AN * ASP + 0.2, AY0 + AN * ASP + 0.32, -1.95, 1.4, "boxS");
BOX("aHBar", "aCas", AX - 1.4, AX + 1.4, AY0 + AN * ASP + 0.32, AY0 + AN * ASP + 0.62, -0.4, -0.1, "dark");
BOX("aHBar2", "aCas", AX - 0.15, AX + 0.15, AY0 + AN * ASP + 0.32, AY0 + AN * ASP + 0.62, -1.4, 0.8, "dark");
P({ id: "aFoot", layer: "aCas", shape: "box", size: [0.5, 0.15, 0.5], pos: [0, R2(AH + 0.12), 0], at: [[AX - AR, 0, -1.4], [AX + AR, 0, -1.4], [AX - AR, 0, 1.0], [AX + AR, 0, 1.0]], mat: "darker" });
BOX("aTag", "aCas", AX + AR + 0.3, AX + AR + 0.32, AY0 + 1.0, AY0 + 2.0, -0.6, 0.6, "white");
BOX("aTagBar", "aCas", AX + AR + 0.32, AX + AR + 0.33, AY0 + 1.3, AY0 + 1.7, -0.45, 0.45, "darker");
for (let i = 0; i < AN; i++) { if (i === 6) continue; wafer(`aW${i}`, "aCas", AX, R2(AY0 + i * ASP), -0.2, 2.2, i % 2 ? "mirror" : "wafer", i % 2 === 0); }
LAY("aTest", [4.6, 0.6, AX, AY0 + 6 * ASP]);
wafer("aT", "aTest", AX, R2(AY0 + 6 * ASP), -0.2, 2.2, "mirror", false);
actions.aPull = { type: "vibrate", _說明: "正中那片空白測試片沿滑槽往前抽出一段（之後退回）", parts: idsOf("aTest"), axis: [0, 0, 1], amp: 1.6, freq: 0, grow: false };
delete actions.aPull;
actions.aGlow = { type: "pulse", _說明: "空白測試片發亮（它不做晶片）", parts: ["aTW"], color: "lampY", glow: 0.6, freq: 1.0, halo: 0 };

// ═════ 站 B：沉積腔（左）＋測膜量台（右）（x 30）═════
const BX = 30;
LAY("bTool", [7, 6, BX - 3.2, 2.8]);
const BH = plinth("b", "bTool", BX - 3.2, 0, 6.6, 5.6, 0.8);
const CX0 = BX - 5.8, CX1 = BX - 0.6, CY0 = BH, CY1 = BH + 3.6;
BOX("bChBack", "bTool", CX0, CX1, CY0, CY1, -2.4, -2.1, "steel2");
BOX("bChL", "bTool", CX0, CX0 + 0.3, CY0, CY1, -2.4, 2.0, "steel2"); BOX("bChR", "bTool", CX1 - 0.3, CX1, CY0, CY1, -2.4, 2.0, "steel2");
BOX("bChTop", "bTool", CX0, CX1, CY1, CY1 + 0.35, -2.4, 2.0, "steel"); BOX("bChBot", "bTool", CX0, CX1, CY0, CY0 + 0.4, -2.4, 2.0, "steel");
P({ id: "bWinF", layer: "bTool", shape: "ring", size: [4.4, 2.8, 0.12], wall: 0.22, r: 0.15, pos: [R2((CX0 + CX1) / 2), R2(CY0 + 1.9), 2.0], mat: "dark" });
P({ id: "bWin", layer: "bTool", shape: "box", size: [4.1, 2.5, 0.04], pos: [R2((CX0 + CX1) / 2), R2(CY0 + 1.9), 2.0], mat: "glass" });
P({ id: "bScrew", layer: "bTool", shape: "cyl", size: [0.06, 0.05], pos: [0, 0, 2.08], at: [[CX0 + 0.12, CY0 + 0.7, 0], [CX1 - 0.12, CY0 + 0.7, 0], [CX0 + 0.12, CY1 - 0.4, 0], [CX1 - 0.12, CY1 - 0.4, 0]].map((a) => a.map(R2)), mat: "steel" });
const SHY = CY1 - 0.5;
VC("bShower", "bTool", 1.7, SHY, SHY + 0.18, "steel2", { x: (CX0 + CX1) / 2, z: -0.2 });
P({ id: "bShHole", layer: "bTool", shape: "cyl", size: [0.04, 0.01], rot: V, pos: [0, R2(SHY - 0.005), 0], at: (() => { const a = []; for (let i = -5; i <= 5; i++) for (let j = -5; j <= 5; j++) if (Math.hypot(i, j) <= 5) a.push([R2((CX0 + CX1) / 2 + i * 0.3), 0, R2(-0.2 + j * 0.3)]); return a; })(), mat: "darker" });
VC("bChuck", "bTool", 1.75, CY0 + 0.4, CY0 + 0.9, "steel", { x: (CX0 + CX1) / 2, z: -0.2 });
wafer("bCw", "bTool", (CX0 + CX1) / 2, CY0 + 0.9, -0.2, 1.6, "mirror");
BOX("bRf", "bTool", CX0 + 1.4, CX0 + 2.4, CY1 + 0.35, CY1 + 1.0, -1.6, -0.6, "darker");
P({ id: "bRfCon", layer: "bTool", shape: "cyl", size: [0.15, 0.3], pos: [R2(CX0 + 2.4 + 0.15), R2(CY1 + 0.68), -1.1], rot: [0, 90, 0], mat: "gold" });
P({ id: "bRfCable", layer: "bTool", shape: "cyl", size: [0.09, 2.4], pos: [R2(CX0 + 3.75), R2(CY1 + 0.68), -1.1], rot: [0, 90, 0], mat: "rubber" });
P({ id: "bGasPipe", layer: "bTool", shape: "cyl", size: [0.07, 2.6], rot: V, pos: [0, R2(CY1 + 1.3), 0], at: [[CX1 - 0.8, 0, -1.6], [CX1 - 1.3, 0, -1.6]].map((a) => a.map(R2)), mat: "steel2" });
valve("bV0", "bTool", CX1 - 0.8, CY1 + 1.9, -1.6); valve("bV1", "bTool", CX1 - 1.3, CY1 + 2.3, -1.6);
panelUI("bUi", "bTool", CX0 - 0.95, CY0 + 0.6, 1.2, 0.9);
LAY("bPlasma", [3.4, 1.4, (CX0 + CX1) / 2, CY0 + 1.6]);
VC("bPl", "bPlasma", 1.6, CY0 + 1.0, SHY - 0.05, "plas", { x: (CX0 + CX1) / 2, z: -0.2 });
actions.bPlGlow = { type: "pulse", _說明: "試跑：沉積時腔內電漿輝光微微閃", parts: ["bPl"], color: "plasC", glow: 0.8, freq: 2.2, halo: 0 };
// 測膜量台：吸盤＋晶圓（試跑後多一層膜），龍門架上斜射光源與偵測器；雷射掃描條橫掃
LAY("bMet", [6, 5, BX + 3.4, 2.2]);
const MX = BX + 3.4, MH = plinth("bm", "bMet", MX, 0, 5.4, 5.0, 0.8);
VC("bmChuck", "bMet", 1.9, MH, MH + 0.3, "steel", { x: MX }); RING("bmRim", "bMet", 2.0, 1.9, MH, MH + 0.32, "dark", MX, 0);
wafer("bmW", "bMet", MX, MH + 0.3, 0, 1.8, "mirror");
for (const sx of [-1, 1]) BOX(`bmPost${sx}`, "bMet", MX + sx * 2.3 - 0.15, MX + sx * 2.3 + 0.15, MH, MH + 3.6, -1.9, -1.6, "steel2");
BOX("bmBeam", "bMet", MX - 2.45, MX + 2.45, MH + 3.6, MH + 3.9, -1.95, -1.55, "steel2");
const MWY = MH + 0.37;
// 光源盒（左上斜）、偵測器盒（右上斜），光打在晶圓中心 [MX, MWY, 0]，入射角＝反射角
P({ id: "bmSrc", layer: "bMet", shape: "box", size: [1.0, 0.5, 0.5], pos: [R2(MX - 1.9), R2(MWY + 2.2), 0], rot: [0, 0, -49], mat: "darker" });
P({ id: "bmSrcL", layer: "bMet", shape: "cyl", size: [0.14, 0.12], pos: [R2(MX - 1.5), R2(MWY + 1.75), 0], rot: [0, 90, -49], mat: "lampR" });
P({ id: "bmDet", layer: "bMet", shape: "box", size: [1.0, 0.5, 0.5], pos: [R2(MX + 1.9), R2(MWY + 2.2), 0], rot: [0, 0, 49], mat: "darker" });
P({ id: "bmArm", layer: "bMet", shape: "box", size: [0.12, 1.5, 0.12], pos: [0, R2(MH + 3.0), -1.6], at: [[R2(MX - 1.9), 0, 0], [R2(MX + 1.9), 0, 0]], mat: "steel" });
P({ id: "bmArm2", layer: "bMet", shape: "box", size: [0.12, 0.12, 1.6], pos: [0, R2(MWY + 2.35), -0.8], at: [[R2(MX - 1.9), 0, 0], [R2(MX + 1.9), 0, 0]], mat: "steel" });
panelUI("bmUi", "bMet", MX + 1.5, 0.12, 2.52, 0.7);
LAY("bFilm", [3.6, 0.2, MX, MWY]);
VC("bFilmW", "bFilm", 1.79, MWY - 0.005, MWY + 0.04, "ox", { x: MX });
VC("bFilmC", "bFilm", 1.59, CY0 + 0.955, CY0 + 0.99, "ox", { x: (CX0 + CX1) / 2, z: -0.2 });
actions.bBeam = { free: true, type: "flow", _說明: "測膜厚：斜射光打到膜上、反射進偵測器（入射角＝反射角）", path: [[MX - 1.5, MWY + 1.75, 0], [MX, MWY + 0.02, 0], [MX + 1.5, MWY + 1.75, 0]].map((a) => a.map(R2)), n: 10, size: 0.09, shape: "dot", rate: 0.8, track: true, color: "beamC", layer: "bMet", trail: 3, trailGap: 0.02 };
LAY("bScan", [4, 0.4, MX, MWY + 0.3]);
BOX("bScanBar", "bScan", MX - 0.04, MX + 0.04, MWY + 0.05, MWY + 0.09, -1.8, 1.8, "scan");
BOX("bScanHead", "bScan", MX - 0.2, MX + 0.2, MH + 3.25, MH + 3.6, -1.7, -1.4, "dark");
actions.bScanGo = { type: "vibrate", _說明: "數灰塵：雷射線來回掃過整片（往復，兩端減速）", parts: ["bScanBar", "bScanHead"], axis: [1, 0, 0], amp: 1.6, freq: 0.45 };
LAY("bDust", [3, 0.3, MX, MWY + 0.1]);
P({ id: "bDustP", layer: "bDust", shape: "sphere", size: [0.07], pos: [0, R2(MWY + 0.08), 0], at: [[-0.9, 0, 0.5], [0.4, 0, -0.9], [1.1, 0, 0.7], [-0.3, 0, 1.2], [0.8, 0, -0.2], [-1.3, 0, -0.6]].map(([a, b, c]) => [R2(MX + a), b, c]), mat: "dust" });
actions.bDustGlow = { type: "pulse", parts: ["bDustP"], color: "lampY", glow: 1, freq: 1.8, halo: 0 };

// ═════ 站 C：直立爐管（x 60）：升降座上石英晶舟（上下擋片＋中段產品片），石英管＋加熱線圈，外罩先往上拆開 ═════
const CX = 60;
LAY("cBase", [7, 2, CX, 1]);
const CH = plinth("c", "cBase", CX, 0, 6.6, 5.4, 0.8);
// 升降導軌＋螺桿（右後）
BOX("cRail", "cBase", CX + 2.2, CX + 2.5, CH, CH + 11.2, -1.8, -1.5, "steel2"); VC("cScrewS", "cBase", 0.08, CH, CH + 11.2, "steel", { x: CX + 1.9, z: -1.65 });
P({ id: "cScrewT", layer: "cBase", shape: "cyl", size: [0.11, 0.03], rot: V, pos: [R2(CX + 1.9), 0, -1.65], at: Array.from({ length: 36 }, (_, i) => [0, R2(CH + 0.2 + i * 0.31), 0]), mat: "steel2" });
BOX("cMotor", "cBase", CX + 1.6, CX + 2.2, CH, CH + 0.7, -2.0, -1.3, "darker");
// 爐體支架（上方）
const TB = CH + 5.6, TT = CH + 11.0;   // 石英管底、頂
BOX("cFrameL", "cBase", CX - 2.9, CX - 2.6, CH, TT + 0.6, -2.4, -2.1, "steel"); BOX("cFrameR", "cBase", CX + 2.6, CX + 2.9, CH, TT + 0.6, -2.4, -2.1, "steel");
BOX("cFrameT", "cBase", CX - 2.9, CX + 2.9, TT + 0.6, TT + 0.9, -2.4, -2.1, "steel");
LAY("cTube", [4, 6, CX, TB + 2.7]);
VC("cTubeQ", "cTube", 1.75, TB, TT, "quartz", { x: CX }); RING("cFlange", "cTube", 2.05, 1.75, TB - 0.15, TB + 0.1, "steel2", CX, 0);
VC("cTubeTop", "cTube", 1.75, TT, TT + 0.12, "quartzS", { x: CX });
P({ id: "cExh", layer: "cTube", shape: "cyl", size: [0.16, 1.6], pos: [R2(CX + 2.0), R2(TB + 0.3), 0], rot: [0, 90, 0], mat: "steel2" });
const NCOIL = 10; for (let i = 0; i < NCOIL; i++) RING(`cCoil${i}`, "cTube", 2.05, 1.9, R2(TB + 0.5 + i * 0.5), R2(TB + 0.62 + i * 0.5), "heatDim", CX, 0);
// 晶舟（四支石英桿＋底座＋頂板）與 20 槽：上 3、下 3 為擋片（灰），中段產品片（晶粒）
LAY("cBoat", [3.6, 5.2, CX, CH + 2.8]);
const BB = CH + 0.9, BSP = 0.24, BN = 16, BW0 = BB + 0.5;
VC("cPed", "cBoat", 1.2, CH, BB, "quartzS", { x: CX }); VC("cCap", "cBoat", 1.9, BB - 0.15, BB + 0.05, "steel2", { x: CX });
P({ id: "cRod", layer: "cBoat", shape: "cyl", size: [0.09, R2(BN * BSP + 0.5)], rot: V, pos: [0, R2(BW0 + (BN * BSP) / 2 - 0.1), 0], at: [[CX - 1.45, 0, -0.5], [CX + 1.45, 0, -0.5], [CX - 0.8, 0, -1.3], [CX + 0.8, 0, -1.3]].map((a) => a.map(R2)), mat: "quartzS" });
VC("cBoatTop", "cBoat", 1.6, BW0 + BN * BSP, BW0 + BN * BSP + 0.1, "quartzS", { x: CX });
const DUM = [0, 1, 2, BN - 3, BN - 2, BN - 1];
for (let i = 0; i < BN; i++) if (!DUM.includes(i)) VC(`cP${i}`, "cBoat", 1.5, R2(BW0 + i * BSP), R2(BW0 + i * BSP + 0.04), "die", { x: CX });
LAY("cDummy", [3.4, 5.2, CX, CH + 3.0]);
for (const i of DUM) VC(`cD${i}`, "cDummy", 1.5, R2(BW0 + i * BSP), R2(BW0 + i * BSP + 0.04), "wafer", { x: CX });
// 加熱器外罩：12 片弧形外殼板（隔熱層米色＋外殼板＋接縫＋銘板），分左右兩半；爆炸時沿 x 軸往兩側拉開
const JR = 2.35, JH = R2(TT - TB + 0.4), JY = R2((TB + TT) / 2 + 0.1);
for (const side of ["L", "R"]) {
  const L = `cJacket${side}`, sg = side === "L" ? -1 : 1; LAY(L, [3, 6, CX + sg * 1.4, TB + 2.7]);
  for (let k = 0; k < 6; k++) { const deg = sg * (15 + k * 30), r = (deg * Math.PI) / 180, x = R2(CX + JR * Math.sin(r)), z = R2(JR * Math.cos(r));
    P({ id: `${L}I${k}`, layer: L, shape: "box", size: [1.24, JH, 0.22], pos: [R2(CX + (JR - 0.2) * Math.sin(r)), JY, R2((JR - 0.2) * Math.cos(r))], rot: [0, R2(deg), 0], mat: "ins" });
    P({ id: `${L}S${k}`, layer: L, shape: "box", size: [1.3, JH, 0.1], pos: [x, JY, z], rot: [0, R2(deg), 0], mat: "panel" });
    P({ id: `${L}B${k}`, layer: L, shape: "box", size: [1.32, 0.2, 0.12], pos: [0, 0, 0], at: [[x, R2(TB + 0.05), z], [x, R2(TT + 0.15), z]], rot: [0, R2(deg), 0], mat: "band" }); }
  P({ id: `${L}Seam`, layer: L, shape: "box", size: [0.04, JH, 0.04], pos: [0, JY, 0], at: [0, 1, 2, 3, 4, 5, 6].map((k) => { const r = (sg * k * 30 * Math.PI) / 180; return [R2(CX + (JR + 0.06) * Math.sin(r)), 0, R2((JR + 0.06) * Math.cos(r))]; }), mat: "seam" });
  P({ id: `${L}Hdl`, layer: L, shape: "box", size: [0.1, 0.9, 0.12], pos: [R2(CX + sg * 0.7), R2(TB + 2.6), R2(JR + 0.12)], mat: "steel2" });
}
BOX("cPlate", "cJacketR", CX + 0.15, CX + 0.95, TT - 1.4, TT - 0.8, JR + 0.06, JR + 0.1, "white"); BOX("cPlateL", "cJacketR", CX + 0.25, CX + 0.85, TT - 1.2, TT - 1.0, JR + 0.1, JR + 0.11, "darker");
actions.cCoilGlow = { type: "pulse", _說明: "加熱線圈通電發橘光", parts: Array.from({ length: NCOIL }, (_, i) => `cCoil${i}`), color: "heatC", glow: 0.9, freq: 0.7, halo: 0 };
const BOATUP = R2(TB + 0.2 - BB);   // 晶舟上升量（底座頂到管口）
actions.cHeat = { type: "flow", _說明: "熱從外圈線圈往管中心均勻擴散（左右對稱，各層一樣）", path: [[CX - 1.9, 0, 0], [CX - 0.4, 0, 0]].map((a) => a.map(R2)), n: 6, size: 0.1, shape: "arrow", rate: 0.6, track: false, color: "heatC", layer: "cTube", lanes: 4, laneGap: 1.1, laneDir: [0, 1, 0], jitter: 0.03 };
actions.cHeat2 = { ...actions.cHeat, path: [[CX + 1.9, 0, 0], [CX + 0.4, 0, 0]].map((a) => a.map(R2)) };
for (const k of ["cHeat", "cHeat2"]) actions[k].path = actions[k].path.map(([x, , z]) => [x, R2(TB + 1.0), z]);

// ═════ 站 D：用過的測試片（x 90）：矽底＋氧化層＋氮化層＋金屬層；旁邊淘汰桶（打叉）、再生運送箱 ═════
const DX = 90;
LAY("dBase", [6, 1.4, DX, 0.6]);
const DH = plinth("d", "dBase", DX, 0, 6.4, 6.4, 0.8);
VC("dStand", "dBase", 0.35, DH, DH + 1.2, "steel", { x: DX }); VC("dStandT", "dBase", 1.2, DH + 1.2, DH + 1.35, "steel2", { x: DX });
const DY = DH + 1.35;
LAY("dSi", [5, 0.5, DX, DY + 0.2]); VC("dSiW", "dSi", 2.4, DY, DY + 0.32, "wafer", { x: DX }); BOX("dSiN", "dSi", DX - 0.1, DX + 0.1, DY - 0.01, DY + 0.33, 2.3, 2.41, "darker");
const DL = [["dOx", "ox", 0.12], ["dNit", "nit", 0.1], ["dMet", "met", 0.1]];
let dy = DY + 0.32; const DLY = {};
for (const [id, mat, t] of DL) { LAY(id, [5, 0.3, DX, dy + t / 2]); VC(`${id}F`, id, 2.38, dy, R2(dy + t), mat, { x: DX }); DLY[id] = dy; dy = R2(dy + t); }
P({ id: "dMetLine", layer: "dMet", shape: "box", size: [3.6, 0.03, 0.08], pos: [DX, R2(dy + 0.015), 0], at: Array.from({ length: 9 }, (_, i) => [0, 0, R2(-1.6 + i * 0.4)]), mat: "padGold" });
// 淘汰桶（左前）＋紅叉
LAY("dTrash", [2, 2, DX - 4.6, 1]);
P({ id: "dBin", layer: "dTrash", shape: "tube", size: [0.9, 0.82, 1.6], rot: V, pos: [R2(DX - 4.6), 0.8, 2.2], mat: "dark" });
VC("dBinB", "dTrash", 0.85, 0.02, 0.08, "dark", { x: DX - 4.6, z: 2.2 }); RING("dBinRim", "dTrash", 0.95, 0.82, 1.55, 1.65, "steel2", DX - 4.6, 2.2);
LAY("dX", [2, 2, DX - 4.6, 2.4]);
P({ id: "dX0", layer: "dX", shape: "box", size: [2.2, 0.22, 0.08], pos: [R2(DX - 4.6), 2.5, 3.2], rot: [0, 0, 45], mat: "lampR" });
P({ id: "dX1", layer: "dX", shape: "box", size: [2.2, 0.22, 0.08], pos: [R2(DX - 4.6), 2.5, 3.2], rot: [0, 0, -45], mat: "lampR" });
// 再生運送箱（右）：箱體＋扣件＋把手＋標籤
LAY("dCrate", [2.6, 1.6, DX + 4.6, 0.8]);
BOX("dCr", "dCrate", DX + 3.5, DX + 5.7, 0, 1.4, 1.0, 3.0, "boxS"); BOX("dCrLid", "dCrate", DX + 3.45, DX + 5.75, 1.4, 1.55, 0.95, 3.05, "dark");
P({ id: "dCrClip", layer: "dCrate", shape: "box", size: [0.25, 0.3, 0.06], pos: [0, 1.35, 3.04], at: [[R2(DX + 4.0), 0, 0], [R2(DX + 5.2), 0, 0]], mat: "steel2" });
BOX("dCrTag", "dCrate", DX + 4.2, DX + 5.0, 0.5, 1.0, 3.0, 3.02, "lampG");
actions.dShip = { free: true, type: "flow", _說明: "送去再生：用過的片子沿箭頭進運送箱", path: [[DX + 2.5, DY + 0.4, 1.0], [DX + 3.6, 2.4, 1.6], [DX + 4.6, 1.7, 2.0]].map((a) => a.map(R2)), n: 4, size: 0.18, shape: "arrow", rate: 0.6, track: true, color: "lampG", layer: "dBase" };

// ═════ 站 E：濕式去膜槽（x 120）：透明槽＋藥液、底部循環泵與管、閥件、排氣罩、升降臂夾著整籃晶圓 ═════
const EX = 120;
LAY("eBench", [8, 6, EX, 2.6]);
const EH = plinth("e", "eBench", EX, 0, 7.6, 5.4, 1.4);
const TX0 = EX - 2.4, TX1 = EX + 2.4, TZ0 = -1.8, TZ1 = 1.8, TY0 = EH, TY1 = EH + 3.0;
BOX("eTankB", "eBench", TX0, TX1, TY0, TY0 + 0.15, TZ0, TZ1, "darker");
for (const [id, a, b, c, d] of [["eGF", TX0, TX1, TZ1 - 0.06, TZ1], ["eGB", TX0, TX1, TZ0, TZ0 + 0.06]]) BOX(id, "eBench", a, b, TY0, TY1, c, d, "glass");
for (const [id, a, b] of [["eGL", TX0, TX0 + 0.06], ["eGR", TX1 - 0.06, TX1]]) BOX(id, "eBench", a, b, TY0, TY1, TZ0, TZ1, "glass");
P({ id: "eFrame", layer: "eBench", shape: "box", size: [0.12, R2(TY1 - TY0), 0.12], pos: [0, R2((TY0 + TY1) / 2), 0], at: [[TX0, 0, TZ0], [TX1, 0, TZ0], [TX0, 0, TZ1], [TX1, 0, TZ1]].map((a) => a.map(R2)), mat: "steel" });
P({ id: "eLip", layer: "eBench", shape: "ring", size: [R2(TX1 - TX0 + 0.3), R2(TZ1 - TZ0 + 0.3), 0.14], wall: 0.15, r: 0.05, rot: [-90, 0, 0], pos: [EX, R2(TY1), 0], mat: "steel2" });
LAY("eLiq", [4.6, 2.6, EX, TY0 + 1.3]);
BOX("eLiqB", "eLiq", TX0 + 0.06, TX1 - 0.06, TY0 + 0.15, TY1 - 0.4, TZ0 + 0.06, TZ1 - 0.06, "liq");
P({ id: "eRipple", layer: "eLiq", shape: "box", size: [R2(TX1 - TX0 - 0.2), 0.02, 0.05], pos: [EX, R2(TY1 - 0.39), 0], at: Array.from({ length: 6 }, (_, i) => [0, 0, R2(TZ0 + 0.5 + i * 0.55)]), mat: "white" });
actions.eWave = { type: "vibrate", _說明: "液面波紋", parts: ["eRipple"], axis: [0, 1, 0], amp: 0.03, freq: 1.4 };
// 循環：底部泵＋管路＋閥件；排氣罩
BOX("ePump", "eBench", EX + 2.6, EX + 3.5, 0.15, 1.0, 1.2, 2.2, "darker"); VC("ePumpM", "eBench", 0.3, 1.0, 1.4, "steel", { x: EX + 3.05, z: 1.7 });
P({ id: "ePipe", layer: "eBench", shape: "cyl", size: [0.08, 1.4], pos: [R2(EX + 3.2), 0.7, 0], rot: V, at: [[0, 0, -1.5], [0, 0, 1.5]], mat: "steel2" });
P({ id: "ePipeH", layer: "eBench", shape: "cyl", size: [0.08, 3.0], pos: [R2(EX + 3.2), 1.4, 0], rot: [0, 0, 0], mat: "steel2" });
valve("eV0", "eBench", EX + 3.2, 0.9, -1.5);
P({ id: "eClamp", layer: "eBench", shape: "box", size: [0.25, 0.08, 0.25], pos: [R2(EX + 3.2), 0, 0], at: [[0, 0.5, 1.5], [0, 1.2, 1.5], [0, 0.5, -1.5]], mat: "steel" });
BOX("eHood", "eBench", EX - 3.0, EX + 3.0, TY1 + 3.2, TY1 + 3.6, -2.4, -1.4, "panel"); BOX("eHoodS", "eBench", EX - 3.0, EX + 3.0, TY1 + 3.25, TY1 + 3.3, -1.45, -1.35, "seam");
VC("eDuct", "eBench", 0.4, TY1 + 3.6, TY1 + 4.6, "steel2", { x: EX - 2.0, z: -1.9 });
panelUI("eUi", "eBench", EX - 3.0, 0.2, 2.72, 0.75);
// 升降臂：後方立柱＋橫臂＋夾爪＋整籃（5 片，每片帶三層膜）
LAY("eLift", [5.4, 4.4, EX, TY1 + 1.6]);
const LUP = 2.9;   // 籃子在液面上方的高度；下降 LUP 進槽
const KY = TY0 + 0.5 + LUP;
BOX("eCol", "eLift", EX - 0.2, EX + 0.2, KY + 1.4, KY + 2.4, TZ0 - 0.6, TZ0 - 0.2, "steel");
BOX("eArm", "eLift", EX - 0.2, EX + 0.2, KY + 2.2, KY + 2.5, TZ0 - 0.6, 0.2, "steel2");
P({ id: "eGrip", layer: "eLift", shape: "box", size: [0.12, 2.0, 0.3], pos: [0, R2(KY + 1.2), 0], at: [[R2(EX - 2.1), 0, 0], [R2(EX + 2.1), 0, 0]], mat: "steel" });
BOX("eGripT", "eLift", EX - 2.2, EX + 2.2, KY + 2.1, KY + 2.25, -0.2, 0.2, "steel");
for (const sx of [-1, 1]) P({ id: `eKRib${sx}`, layer: "eLift", shape: "box", size: [0.12, 0.04, 2.2], pos: [R2(EX + sx * 1.95), 0, 0], at: Array.from({ length: 6 }, (_, i) => [0, R2(KY - 0.05 + i * 0.32), 0]), mat: "darker" });
const EWY = (i) => R2(KY + i * 0.32);
for (let i = 0; i < 5; i++) VC(`eW${i}`, "eLift", 1.75, EWY(i), R2(EWY(i) + 0.05), "wafer", { x: EX });
const EF = [["eFm", "met"], ["eFn", "nit"], ["eFo", "ox"]];   // 由外往內溶：先金屬、再氮化、再氧化
EF.forEach(([id, mat], k) => { LAY(id, [3.6, 1.6, EX, KY + 0.6]); for (let i = 0; i < 5; i++) VC(`${id}${i}`, id, R2(1.76 + 0.01 * k), R2(EWY(i) + 0.05 + (2 - k) * 0.02), R2(EWY(i) + 0.07 + (2 - k) * 0.02), mat, { x: EX }); });
actions.eBub = { type: "flow", _說明: "槽底循環冒泡：氣泡由下往上、越升越快", path: [[EX, TY0 + 0.25, 0.9], [EX, TY1 - 0.45, 0.9]].map((a) => a.map(R2)), n: 8, size: 0.08, shape: "dot", rate: 0.5, accel: true, color: "bubC", layer: "eBench", lanes: 6, laneGap: 0.65, laneDir: [1, 0, 0], jitter: 0.06, rim: "liqC" };

// ═════ 站 F：研磨拋光機（x 150，左）＋刷洗檢查（右）═════
const FX = 148;
LAY("fCmp", [8, 4, FX, 1.6]);
const FH = plinth("f", "fCmp", FX, 0, 7.6, 7.0, 1.2);
BOX("fCab", "fCmp", FX - 3.8, FX + 3.8, 0, FH, 3.45, 3.5, "seam");
P({ id: "fLouv", layer: "fCmp", shape: "box", size: [0.8, 0.04, 0.03], pos: [0, 0, 3.52], at: Array.from({ length: 10 }, (_, i) => [R2(FX - 3.0 + (i % 5) * 0.9), R2(0.4 + Math.floor(i / 5) * 0.12), 0]), mat: "dark" });
LAY("fPlaten", [6.6, 0.6, FX, FH + 0.3]);
const PR = 3.1, PY = FH;
VC("fPlat", "fPlaten", PR, PY, PY + 0.3, "steel2", { x: FX }); VC("fPad", "fPlaten", R2(PR - 0.05), PY + 0.3, PY + 0.38, "pad", { x: FX });
for (let i = 1; i <= 5; i++) RING(`fGr${i}`, "fPlaten", R2(i * 0.55 + 0.03), R2(i * 0.55), PY + 0.38, PY + 0.395, "darker", FX, 0);
actions.fSpin = { type: "rotate", _說明: "轉盤＋拋光墊旋轉（起轉加速）", parts: idsOf("fPlaten"), axis: [0, 1, 0], pivot: [FX, PY, 0].map(R2), rps: 0.5, rampSpin: true };
// 研磨頭：主軸＋齒輪箱＋頭蓋＋壓力膜片＋晶圓（在拋光墊右半）
const HX0 = FX + 1.4, HZ = 0.4, HY = PY + 0.38;
LAY("fHead", [2.6, 4, HX0, HY + 1.6]);
const fHW = wafer("fHw", "fHead", HX0, HY, HZ, 1.0, "wafer");
VC("fHMem", "fHead", 1.05, HY + 0.06, HY + 0.14, "rubber", { x: HX0, z: HZ });
VC("fHBody", "fHead", 1.2, HY + 0.14, HY + 0.6, "steel", { x: HX0, z: HZ }); RING("fHRet", "fHead", 1.25, 1.05, HY, HY + 0.2, "darker", HX0, HZ);
P({ id: "fHBolt", layer: "fHead", shape: "cyl", size: [0.06, 0.04], rot: V, pos: [0, R2(HY + 0.62), 0], at: [0, 60, 120, 180, 240, 300].map((d) => [R2(HX0 + 0.9 * Math.cos((d * Math.PI) / 180)), 0, R2(HZ + 0.9 * Math.sin((d * Math.PI) / 180))]), mat: "steel2" });
VC("fHShaft", "fHead", 0.25, HY + 0.6, HY + 2.6, "steel2", { x: HX0, z: HZ });
BOX("fHGear", "fHead", HX0 - 0.6, HX0 + 0.6, HY + 2.6, HY + 3.3, HZ - 0.5, HZ + 0.5, "darker");
BOX("fHArm", "fHead", HX0 - 0.3, HX0 + 3.0, HY + 3.0, HY + 3.3, HZ - 0.3, HZ + 0.3, "steel");
actions.fHSpin = { type: "rotate", _說明: "研磨頭與轉盤同向自轉", parts: idsOf("fHead").filter((q) => !["fHGear", "fHArm"].includes(q)), axis: [0, 1, 0], pivot: [HX0, HY, HZ].map(R2), rps: 0.7, rampSpin: true };
// 研磨液噴臂（後方）＋滴液（稠，受重力加速、落到墊上）
BOX("fSlPost", "fCmp", FX - 3.4, FX - 3.1, FH, FH + 2.4, -2.4, -2.1, "steel");
P({ id: "fSlArm", layer: "fCmp", shape: "cyl", size: [0.12, 3.0], pos: [R2(FX - 1.85), R2(FH + 2.3), -2.25], rot: [0, 90, 0], mat: "steel2" });
VC("fSlNoz", "fCmp", 0.1, FH + 1.9, FH + 2.3, "dark", { x: FX - 0.4, z: -2.25 });
actions.fSlurry = { free: true, type: "flow", _說明: "研磨液（稠）由噴嘴滴下、加速落到墊上", path: [[FX - 0.4, FH + 1.88, -2.25], [FX - 0.4, PY + 0.4, -2.25]].map((a) => a.map(R2)), n: 5, size: 0.1, shape: "liquid", rate: 0.45, accel: true, color: "slurC", layer: "fCmp", trail: 4, trailGap: 0.03 };
actions.fSlSpread = { type: "flow", _說明: "研磨液在旋轉的墊上被離心甩向外圈", path: [[FX - 0.4, PY + 0.4, -2.25], [FX + 0.8, PY + 0.4, -2.2], [FX + 2.0, PY + 0.4, -1.4], [FX + 2.7, PY + 0.4, -0.2]].map((a) => a.map(R2)), n: 12, size: 0.07, shape: "liquid", rate: 0.35, color: "slurC", layer: "fCmp", jitter: 0.05 };
// 鑽石修整器：擺臂＋盤
LAY("fCond", [3, 1.4, FX - 1.6, FH + 1]);
VC("fCdPost", "fCond", 0.2, FH, FH + 1.2, "steel", { x: FX - 3.4, z: 2.0 });
P({ id: "fCdArm", layer: "fCond", shape: "box", size: [2.0, 0.18, 0.25], pos: [R2(FX - 2.4), R2(FH + 1.1), 2.0], mat: "steel2" });
VC("fCdDisk", "fCond", 0.45, PY + 0.4, PY + 0.55, "steel2", { x: FX - 1.4, z: 2.0 }); VC("fCdHub", "fCond", 0.2, PY + 0.55, FH + 1.1, "dark", { x: FX - 1.4, z: 2.0 });
actions.fCdSwing = { type: "rotate", _說明: "修整器來回擺（兩端減速）", parts: idsOf("fCond").filter((q) => q !== "fCdPost"), axis: [0, 1, 0], pivot: [FX - 3.4, FH, 2.0].map(R2), swing: 22, freq: 0.35 };
// 刷洗＋檢查（右）
const GX = FX + 7.2;
LAY("fClean", [4.2, 3, GX, 1.6]);
const GH = plinth("g", "fClean", GX, 0, 4.0, 4.4, 1.2);
for (const dzz of [-0.35, 0.35]) { P({ id: `fBr${dzz > 0 ? 1 : 0}`, layer: "fClean", shape: "cyl", size: [0.32, 3.0], pos: [GX, R2(GH + 0.9 + (dzz > 0 ? 0.68 : 0)), 0], rot: [0, 90, 0], mat: "brush" });
  P({ id: `fBrC${dzz > 0 ? 1 : 0}`, layer: "fClean", shape: "cyl", size: [0.1, 3.4], pos: [GX, R2(GH + 0.9 + (dzz > 0 ? 0.68 : 0)), 0], rot: [0, 90, 0], mat: "steel2" }); }
P({ id: "fCw", layer: "fClean", shape: "cyl", size: [1.0, 0.05], rot: V, pos: [GX, R2(GH + 1.24), 0], mat: "mirror" });
for (const sx of [-1, 1]) BOX(`fBrS${sx}`, "fClean", GX + sx * 1.85 - 0.1, GX + sx * 1.85 + 0.1, GH, GH + 2.0, -0.5, 0.5, "steel");
P({ id: "fNoz", layer: "fClean", shape: "cyl", size: [0.07, 0.3], rot: V, pos: [0, R2(GH + 2.2), 0.9], at: [[R2(GX - 0.8), 0, 0], [R2(GX), 0, 0], [R2(GX + 0.8), 0, 0]], mat: "steel2" });
BOX("fNozBar", "fClean", GX - 1.3, GX + 1.3, GH + 2.35, GH + 2.5, 0.8, 1.0, "steel");
BOX("fInsp", "fClean", GX - 1.4, GX + 1.4, GH + 3.0, GH + 3.2, -0.2, 0.2, "dark");
LAY("fLight", [3, 0.3, GX, GH + 2.9]); BOX("fInspL", "fLight", GX - 1.3, GX + 1.3, GH + 2.94, GH + 3.0, -0.15, 0.15, "scan");
actions.fBrush = { type: "rotate", parts: ["fBr0", "fBr1", "fBrC0", "fBrC1"], axis: [1, 0, 0], pivots: { fBr0: [GX, R2(GH + 0.9), 0], fBrC0: [GX, R2(GH + 0.9), 0], fBr1: [GX, R2(GH + 1.58), 0], fBrC1: [GX, R2(GH + 1.58), 0] }, rps: 1.2, rampSpin: true };
actions.fSpray = { free: true, type: "flow", _說明: "噴水：水受重力加速落到晶圓", path: [[GX, GH + 2.05, 0.9], [GX, GH + 1.3, 0.3]].map((a) => a.map(R2)), n: 6, size: 0.06, shape: "liquid", rate: 0.9, accel: true, color: "liqC", layer: "fClean", lanes: 3, laneGap: 0.8, laneDir: [1, 0, 0] };
actions.fInspGlow = { type: "pulse", parts: ["fInspL"], color: "scanC", glow: 1, freq: 1.5, halo: 0 };

// ═════ 站 G：變薄對照（x 180）：五片晶圓側立，越來越薄（放大示意）＋測厚卡尺＋淘汰箱 ═════
const GX2 = 180;
LAY("gBase", [9, 1, GX2, 0.5]);
const GBH = plinth("gb", "gBase", GX2, 0, 9.4, 3.6, 0.8);
const TH = [0.9, 0.72, 0.55, 0.38, 0.2];
TH.forEach((t, i) => { const x = R2(GX2 - 3.6 + i * 1.8), L = `gW${i}`; LAY(L, [2, 3, x, GBH + 1.4]);
  BOX(`${L}St`, L, x - 0.5, x + 0.5, GBH, GBH + 0.2, -0.4, 0.4, "dark"); BOX(`${L}Sl`, L, x - 0.35, x + 0.35, GBH + 0.2, GBH + 0.45, -0.2, 0.2, "darker");
  P({ id: `${L}W`, layer: L, shape: "cyl", size: [1.25, t], pos: [x, R2(GBH + 1.6), 0], rot: [0, 90, 0], mat: "mirror" });
  BOX(`${L}N`, L, x - t / 2 - 0.01, x + t / 2 + 0.01, R2(GBH + 2.8), R2(GBH + 2.86), -0.06, 0.06, "darker"); });
// 卡尺（後方）：主尺＋刻度＋游尺＋兩個砧座
LAY("gCal", [7, 1.2, GX2, GBH + 3.6]);
BOX("gCalM", "gCal", GX2 - 3.4, GX2 + 3.4, GBH + 3.4, GBH + 3.7, -1.2, -1.1, "steel2");
P({ id: "gCalTk", layer: "gCal", shape: "box", size: [0.02, 0.12, 0.01], pos: [0, R2(GBH + 3.62), -1.095], at: Array.from({ length: 34 }, (_, i) => [R2(GX2 - 3.3 + i * 0.2), 0, 0]), mat: "darker" });
BOX("gCalJ0", "gCal", GX2 - 3.4, GX2 - 3.2, GBH + 2.7, GBH + 3.4, -1.2, -1.1, "steel"); BOX("gCalV", "gCal", GX2 + 1.6, GX2 + 2.6, GBH + 3.3, GBH + 3.8, -1.25, -1.05, "steel");
BOX("gCalJ1", "gCal", GX2 + 1.6, GX2 + 1.8, GBH + 2.7, GBH + 3.3, -1.2, -1.1, "steel"); BOX("gCalScr", "gCal", GX2 + 2.0, GX2 + 2.4, GBH + 3.4, GBH + 3.7, -1.06, -1.04, "screen");
// 淘汰箱（最右前）
LAY("gBin", [2, 1.4, GX2 + 5.6, 0.7]);
BOX("gBinB", "gBin", GX2 + 4.8, GX2 + 6.4, 0, 0.12, -0.9, 0.9, "darker");
for (const [id, a, b, c, d] of [["gBinF", GX2 + 4.8, GX2 + 6.4, 0.84, 0.9], ["gBinK", GX2 + 4.8, GX2 + 6.4, -0.9, -0.84], ["gBinL", GX2 + 4.8, GX2 + 4.86, -0.9, 0.9], ["gBinR", GX2 + 6.34, GX2 + 6.4, -0.9, 0.9]]) BOX(id, "gBin", a, b, 0, 1.2, c, d, "lampR");
BOX("gBinTag", "gBin", GX2 + 5.2, GX2 + 6.0, 0.4, 0.8, 0.9, 0.92, "white");

// ═════ 站 H：再生廠（x 210）═════
const HX = 210;
LAY("hFab", [16, 5, HX - 1, 2.4]);
BOX("hBody", "hFab", HX - 8, HX + 6, 0, 4.2, -3, 1.4, "panel");
BOX("hRoof", "hFab", HX - 8.1, HX + 6.1, 4.2, 4.35, -3.1, 1.5, "roof");
BOX("hBand", "hFab", HX - 8, HX + 6, 3.3, 3.6, 1.4, 1.43, "band");
P({ id: "hWin", layer: "hFab", shape: "box", size: [1.1, 0.7, 0.03], pos: [0, 2.6, 1.43], at: Array.from({ length: 8 }, (_, i) => [R2(HX - 7 + i * 1.6), 0, 0]), mat: "win" });
P({ id: "hSeam", layer: "hFab", shape: "box", size: [0.03, 4.15, 0.03], pos: [0, 2.1, 1.42], at: Array.from({ length: 15 }, (_, i) => [R2(HX - 7.6 + i * 0.95), 0, 0]), mat: "seam" });
P({ id: "hLouv", layer: "hFab", shape: "box", size: [0.6, 0.04, 0.03], pos: [0, 0, 1.44], at: Array.from({ length: 8 }, (_, i) => [R2(HX + 2.4 + (i % 4) * 0.8), R2(1.2 + Math.floor(i / 4) * 0.14), 0]), mat: "dark" });
P({ id: "hRoofU", layer: "hFab", shape: "box", size: [1.0, 0.5, 1.0], pos: [0, 4.6, 0], at: [[HX - 6.5, 0, -1.6], [HX - 5.2, 0, -1.6], [HX - 3.9, 0, -1.6], [HX + 3.5, 0, -1.6]].map((a) => a.map(R2)), mat: "roof" });
P({ id: "hRoofF", layer: "hFab", shape: "cyl", size: [0.38, 0.06], rot: V, pos: [0, 4.88, 0], at: [[HX - 6.5, 0, -1.6], [HX - 5.2, 0, -1.6], [HX - 3.9, 0, -1.6], [HX + 3.5, 0, -1.6]].map((a) => a.map(R2)), mat: "darker" });
P({ id: "hTank", layer: "hFab", shape: "cyl", size: [0.45, 2.0], rot: V, pos: [0, 1.05, 0], at: [[HX + 7.0, 0, -2.2], [HX + 7.0, 0, -1.0]].map((a) => a.map(R2)), mat: "steel2" });
P({ id: "hTankBand", layer: "hFab", shape: "cyl", size: [0.46, 0.14], rot: V, pos: [0, 1.6, 0], at: [[HX + 7.0, 0, -2.2], [HX + 7.0, 0, -1.0]].map((a) => a.map(R2)), mat: "mark" });
P({ id: "hPipe", layer: "hFab", shape: "cyl", size: [0.08, 3.0], rot: [0, 90, 0], pos: [R2(HX + 6.9), 0, -1.6], at: [[0, 2.4, 0], [0, 2.6, 0]], mat: "steel2" });
P({ id: "hDock", layer: "hFab", shape: "box", size: [1.2, 1.3, 0.04], pos: [0, 0.65, 1.43], at: [[HX - 2.0, 0, 0], [HX - 0.5, 0, 0]].map((a) => a.map(R2)), mat: "seam" });
BOX("hSign", "hFab", HX - 1.2, HX + 1.8, 3.75, 4.15, 1.43, 1.47, "white"); BOX("hSignBar", "hFab", HX - 1.0, HX + 1.6, 3.88, 4.02, 1.47, 1.48, "band");
VC("hPole", "hFab", 0.05, 0, 5.4, "steel2", { x: HX - 9.0, z: 1.0 });
LAY("hFlag", [1.4, 1, HX - 8.3, 5]);
BOX("hFlagB", "hFlag", HX - 8.95, HX - 7.6, 4.5, 5.4, 0.98, 1.02, "lampR"); BOX("hFlagC", "hFlag", HX - 8.95, HX - 8.27, 4.95, 5.4, 1.02, 1.03, "winD");
SPH("hFlagS", "hFlag", 0.12, HX - 8.61, 5.175, 1.04, "white");

// ═════ 站 N：密封盒運送（x 240）：盒體（半透明看到晶圓）、前門、頂部吊掛法蘭、側把手；地上軌道；灰塵被擋在外 ═════
const NX = 240;
LAY("nTrack", [16, 0.5, NX, 0.2]);
P({ id: "nRail", layer: "nTrack", shape: "box", size: [16, 0.12, 0.18], pos: [NX, 0.14, 0], at: [[0, 0, -0.9], [0, 0, 0.9]], mat: "steel2" });
P({ id: "nTie", layer: "nTrack", shape: "box", size: [0.3, 0.08, 2.4], pos: [0, 0.05, 0], at: Array.from({ length: 16 }, (_, i) => [R2(NX - 7.5 + i), 0, 0]), mat: "dark" });
LAY("nBox", [4.6, 4.6, NX - 4, 2.6]);
const NB = NX - 4, NY0 = 0.6;
BOX("nCart", "nBox", NB - 1.8, NB + 1.8, 0.2, NY0, -1.3, 1.3, "darker");
P({ id: "nWheel", layer: "nBox", shape: "cyl", size: [0.22, 0.15], pos: [0, 0.22, 0], at: [[NB - 1.3, 0, -0.9], [NB + 1.3, 0, -0.9], [NB - 1.3, 0, 0.9], [NB + 1.3, 0, 0.9]].map((a) => a.map(R2)), mat: "rubber" });
BOX("nShell", "nBox", NB - 1.7, NB + 1.7, NY0, NY0 + 3.2, -1.5, 1.4, "box");
BOX("nShellT", "nBox", NB - 1.75, NB + 1.75, NY0 + 3.2, NY0 + 3.35, -1.55, 1.45, "boxS");
BOX("nFlange", "nBox", NB - 0.8, NB + 0.8, NY0 + 3.55, NY0 + 3.7, -0.8, 0.8, "boxS"); VC("nFlPost", "nBox", 0.25, NY0 + 3.35, NY0 + 3.55, "boxS", { x: NB });
for (const sx of [-1, 1]) BOX(`nHdl${sx}`, "nBox", NB + sx * 1.75 - 0.08, NB + sx * 1.75 + 0.08, NY0 + 1.6, NY0 + 2.0, -0.8, 0.8, "dark");
for (let i = 0; i < 6; i++) VC(`nW${i}`, "nBox", 1.25, R2(NY0 + 0.5 + i * 0.42), R2(NY0 + 0.54 + i * 0.42), "mirror", { x: NB, z: -0.1 });
P({ id: "nRib", layer: "nBox", shape: "box", size: [0.15, 0.04, 2.0], pos: [0, 0, -0.1], at: Array.from({ length: 12 }, (_, i) => [R2(NB + (i % 2 ? 1.45 : -1.45)), R2(NY0 + 0.46 + Math.floor(i / 2) * 0.42), 0]), mat: "boxS" });
LAY("nDoor", [3.6, 3.4, NB, NY0 + 1.6]);
BOX("nDoorP", "nDoor", NB - 1.75, NB + 1.75, NY0 - 0.05, NY0 + 3.25, 1.4, 1.55, "boxS");
P({ id: "nLatch", layer: "nDoor", shape: "cyl", size: [0.2, 0.06], pos: [0, R2(NY0 + 1.6), 1.58], at: [[R2(NB - 0.9), 0, 0], [R2(NB + 0.9), 0, 0]], mat: "dark" });
P({ id: "nLatchK", layer: "nDoor", shape: "box", size: [0.3, 0.06, 0.04], pos: [0, R2(NY0 + 1.6), 1.62], at: [[R2(NB - 0.9), 0, 0], [R2(NB + 0.9), 0, 0]], mat: "steel2" });
BOX("nDoorSeal", "nDoor", NB - 1.65, NB + 1.65, NY0 + 3.05, NY0 + 3.12, 1.38, 1.42, "rubber");
// 灰塵：在盒外飄、碰到盒子就彈開（只在外面）
actions.nDust = { free: true, type: "flow", _說明: "灰塵在盒外亂飄，碰到盒壁沿表面滑走、進不去", path: [[NB - 4.5, 3.2, 2.6], [NB - 2.4, 2.6, 2.1], [NB - 1.9, 1.9, 1.9], [NB - 3.5, 1.2, 2.8]].map((a) => a.map(R2)), n: 14, size: 0.07, shape: "grit", rate: 0.25, color: "dustC", layer: "nTrack", jitter: 0.25, lanes: 3, laneGap: 0.5, laneDir: [0, 1, 0] };
// 兩端示意：左晶圓廠小樓、右再生廠小樓
LAY("nEnds", [18, 3, NX, 1.5]);
for (const [id, x] of [["nFabL", NX - 9.5], ["nFabR", NX + 9.5]]) { BOX(`${id}B`, "nEnds", x - 1.6, x + 1.6, 0, 2.6, -2.6, -0.4, "panel"); BOX(`${id}R`, "nEnds", x - 1.65, x + 1.65, 2.6, 2.72, -2.65, -0.35, "roof");
  P({ id: `${id}W`, layer: "nEnds", shape: "box", size: [0.6, 0.4, 0.03], pos: [0, 1.7, -0.38], at: [[R2(x - 0.8), 0, 0], [R2(x + 0.8), 0, 0]], mat: "win" }); BOX(`${id}D`, "nEnds", x - 0.5, x + 0.5, 0, 1.1, -0.4, -0.37, "seam"); }

// 標註點
Object.assign(anchors, {
  aTestA: A("aTest", [AX + 2.0, AY0 + 6 * ASP + 0.05, 1.0], 150, -100), aProdA: A("aCas", [AX - 1.6, AY0 + 2 * ASP + 0.08, 0.6], -150, 80),
  bChA: A("bTool", [CX0 + 0.5, CY0 + 2.6, 2.0], -150, -100), bFilmA: A("bFilm", [MX + 1.2, MWY + 0.04, 1.0], 150, 100), bBeamA: A("bMet", [MX + 1.9, MWY + 2.2, 0.3], 220, -180), bScanA: A("bScan", [MX, MWY + 0.08, 1.6], -230, 170),
  cJacketA: A("cJacketL", [CX - 2.2, TT - 1.0, 1.0], -150, -100), cDummyA: A("cDummy", [CX + 1.5, BW0 + 1 * BSP, 0.3], 150, 80), cProdA: A("cBoat", [CX + 1.5, BW0 + 8 * BSP, 0.3], 150, -60), cCoilA: A("cTube", [CX - 2.05, TB + 3.0, 0.3], -150, -60),
  dSiA: A("dSi", [DX - 2.4, DY + 0.16, 0.3], -150, 80), dOxA: A("dOx", [DX + 2.38, DLY.dOx + 0.06, 0.3], 150, 0), dNitA: A("dNit", [DX - 2.38, DLY.dNit + 0.05, 0.3], -150, -40), dMetA: A("dMet", [DX + 2.0, DLY.dMet + 0.1, 0.6], 150, -100),
  eTankA: A("eBench", [TX0, TY1 - 0.8, TZ1], -150, -60), eBasketA: A("eLift", [EX + 2.1, KY + 1.0, 0], 150, -100),
  fPadA: A("fPlaten", [FX - 2.0, PY + 0.38, 1.6], -150, 80), fHeadA: A("fHead", [HX0 + 1.2, HY + 0.4, HZ], 150, -100), fBrushA: A("fClean", [GX + 1.5, GH + 1.6, 0.3], 150, -100),
  gW4A: A("gW4", [GX2 - 3.6 + 4 * 1.8, GBH + 2.85, 0], 150, -100), gW0A: A("gW0", [GX2 - 3.6, GBH + 2.85, 0], -150, -100), gBinA: A("gBin", [GX2 + 5.6, 1.2, 0.9], 150, -60),
  hFabA: A("hFab", [HX - 3, 2.6, 1.43], -150, -100),
  nBoxA: A("nBox", [NB + 1.7, NY0 + 2.6, 1.4], 150, -100), nDoorA: A("nDoor", [NB - 1.2, NY0 + 0.8, 1.55], -150, 80),
});

const model = {
  name: "示意 再生晶圓：晶圓盒（產品片與測試片）、沉積腔與測膜量台、直立爐管與擋片、用過測試片的膜層、濕式去膜槽、研磨拋光機與刷洗、變薄對照與卡尺、再生廠、密封盒運送（示意，非特定廠牌／型號）",
  unit: "示意（放大）",
  size: { w: 40, h: 18, r: 0.6, t: 30 },
  palette, materials,
  partNames: { aTW: "測試片", dSiW: "矽晶圓" },
  layers, parts, anchors, actions,
  pose: { yaw0: 0, yawIso: 0, drift: 0 },
  camera: { stand: { d: 70, elev: 24, y: 4 } },
  fx: { dpr: 1, srcPx: 30, shadows: 0, fog: false, dust: false, vaporSprites: false, shimmer: false },
  info: { AX, BX, MX: R2(MX), CHX: R2((CX0 + CX1) / 2), CX, TB: R2(TB), TT: R2(TT), BB: R2(BB), BOATUP, DX, DY: R2(DY), EX, LUP, FX, HX0: R2(HX0), GX: R2(GX), GX2, HX, NX, NB },
};
fs.writeFileSync(path.join(HERE, "model.json"), JSON.stringify(model, null, 1) + "\n");
console.log(`✔ model.json：${parts.length} 個零件、${parts.reduce((a, p) => a + Math.max(1, p.at?.length ?? 0), 0)} 個實體、${layers.length} 層`);

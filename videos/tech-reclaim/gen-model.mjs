// node videos/tech-reclaim/gen-model.mjs → 寫 videos/tech-reclaim/model.json
// 2026/11/28 tech-reclaim（中游補充篇 M4：再生晶圓）。構造照 physics-spec.md、模組清單照 visual-spec.md。全部放大示意，非特定廠牌／型號。
// 站點（地板頂面 y＝0）：A 晶圓盒（x 0）｜B 沉積腔＋測膜量台（x 30）｜C 直立爐管（x 60）｜D 用過測試片膜層（x 90）｜E 濕式去膜槽（x 120）
//   F 研磨拋光機＋刷洗（x 150）｜G 變薄對照＋卡尺（x 180）｜H 再生廠（x 210）｜N 密封盒運送（x 240）
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
const HERE = path.dirname(new URL(import.meta.url).pathname);
const R2 = (x) => Math.round(x * 1000) / 1000;
const palette = {
  floorC: "#C9D2DE", panel: "#F3F5F8", panel2: "#E2E8F0", seam: "#8E9BB0", band: "#24324C", steel: "#7D8CA6", steel2: "#A9B5C7", dark: "#3E4A60", darker: "#2A3142",
  lampY: "#F2B632", lampG: "#2FBF71", lampR: "#E5484D", screen: "#5B8DEF", rubber: "#2B2F36", gold: "#C9A24A", padGold: "#E0B84E", whiteP: "#FFFFFF",
  waferC: "#7C89A6", dieC: "#4C5E86", oxC: "#5FC4E8", nitC: "#7FCB8A", metC: "#C8794A", quartzC: "#DCE8F5", heatC: "#FF8A3D", insC: "#E9E1D2",
  liqC: "#6FB7E8", bubC: "#E8F6FF", padC: "#3A3F4C", slurC: "#EDEBE4", brushC: "#7FA8D9", dustC: "#C9A66B", beamC: "#E8613C", scanC: "#2FD3E0",
  winC: "#5B8DEF", winD: "#2F4A7A", roofC: "#B6C0CF", markC: "#E8613C", boxC: "#8FA3BF", glassC: "#BFD3F2", plasC: "#B07CF0",
  mirC: "#C9D3E2", coilC: "#8A6A55", gasC: "#B9A2F2",
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
  wafer: M("std", "waferC", { rough: 0.12, metal: 0.85, env: 1.1 }), mirror: M("std", "mirC", { rough: 0.04, metal: 0.95, env: 1.7 }),
  die: M("std", "dieC", { rough: 0.2, metal: 0.6, env: 0.9, tex: "traces", texScale: 0.35 }),
  ox: M("std", "oxC", { rough: 0.3, metal: 0.2, env: 0.6, opacity: 0.92 }), nit: M("std", "nitC", { rough: 0.3, metal: 0.2, env: 0.6, opacity: 0.92 }),
  met: M("std", "metC", { rough: 0.25, metal: 0.9, env: 0.9 }),
  quartz: M("phys", "quartzC", { rough: 0.05, metal: 0, clearcoat: 1, opacity: 0.35, env: 0.8 }), quartzS: M("phys", "quartzC", { rough: 0.1, metal: 0, clearcoat: 1, opacity: 0.85, env: 0.8 }),
  ins: M("std", "insC", { rough: 0.9, metal: 0 }), heat: glowM("heatC", 1, 0.8), heatDim: M("std", "coilC", { rough: 0.55, metal: 0.6, env: 0.4 }),
  glass: M("phys", "glassC", { rough: 0.05, metal: 0, clearcoat: 1, opacity: 0.3, env: 0.6 }), liq: M("phys", "liqC", { rough: 0.05, metal: 0, clearcoat: 1, opacity: 0.5, env: 0.7 }),
  pad: M("std", "padC", { rough: 0.85, metal: 0 }), slur: M("std", "slurC", { rough: 0.6, metal: 0 }), brush: M("std", "brushC", { rough: 0.95, metal: 0, tex: "wick", texScale: 0.3 }),
  win: M("std", "winC", { rough: 0.15, metal: 0.4, env: 1.0, emissive: "winC", ei: 0.15 }), winD: M("std", "winD", { rough: 0.2, metal: 0.4, env: 0.8 }), roof: M("std", "roofC", { rough: 0.6, metal: 0.3 }),
  box: M("phys", "glassC", { rough: 0.1, metal: 0, clearcoat: 1, opacity: 0.28, env: 0.6 }), boxS: M("std", "boxC", { rough: 0.35, metal: 0.1, env: 0.5 }),
  mark: M("std", "markC", { rough: 0.5, metal: 0, emissive: "markC", ei: 0.25 }), white: M("std", "whiteP", { rough: 0.7, metal: 0 }),
  plas: glowM("plasC", 0.55, 0.9), scan: glowM("scanC", 1, 0.9), dust: glowM("lampY", 1, 0.9), curtain: glowM("scanC", 0.26, 0.8),
  dustD: M("std", "darker", { rough: 0.6, metal: 0 }), fin: M("std", "steel", { rough: 0.4, metal: 0.8, env: 0.5 }),
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
actions.aGlow = { type: "pulse", _說明: "空白測試片發亮（鏡面白光；它不做晶片）", parts: ["aTW"], color: "whiteP", glow: 0.6, freq: 1.0, halo: 0 };

// ═════ 站 B：沉積腔（左）＋測膜量台（右）（x 30）═════
// r1（機構 r0 必改 7、細節表 2–4；物理 r0 必改 7、8）：管線接回腔體、射頻線接到左側射頻電源箱（面板改裝在電源箱上）、腔體加前框螺絲／傳片閘門／抽氣泵／吸盤升降銷與邊環；
//   試跑後的晶圓經傳片閘門送到量測台（量測台那片獨立一層，到位才出現）；掃描頭往下有一片光幕，微粒平常是暗點、被掃到才亮
const BX = 30;
LAY("bTool", [9.6, 6.6, BX - 4.6, 2.9]);
const BH = plinth("b", "bTool", BX - 3.2, 0, 6.6, 5.6, 0.8);
const CX0 = BX - 5.8, CX1 = BX - 0.6, CY0 = BH, CY1 = BH + 3.6, XC = R2((CX0 + CX1) / 2);
BOX("bChBack", "bTool", CX0, CX1, CY0, CY1, -2.4, -2.1, "steel2");
BOX("bChL", "bTool", CX0, CX0 + 0.3, CY0, CY1, -2.4, 2.0, "steel2"); BOX("bChR", "bTool", CX1 - 0.3, CX1, CY0, CY1, -2.4, 2.0, "steel2");
BOX("bChTop", "bTool", CX0, CX1, CY1, CY1 + 0.35, -2.4, 2.0, "steel"); BOX("bChBot", "bTool", CX0, CX1, CY0, CY0 + 0.4, -2.4, 2.0, "steel");
// 前框（觀察窗四周四條）＋分塊接縫＋12 顆螺絲
BOX("bFrT", "bTool", CX0, CX1, CY0 + 3.3, CY1, 1.95, 2.02, "steel2"); BOX("bFrB", "bTool", CX0, CX1, CY0 + 0.4, CY0 + 0.5, 1.95, 2.02, "steel2");
BOX("bFrL", "bTool", CX0, CX0 + 0.4, CY0 + 0.4, CY0 + 3.3, 1.95, 2.02, "steel2"); BOX("bFrR", "bTool", CX1 - 0.4, CX1, CY0 + 0.4, CY0 + 3.3, 1.95, 2.02, "steel2");
P({ id: "bChSeam", layer: "bTool", shape: "box", size: [0.03, 3.55, 0.03], pos: [0, R2(CY0 + 1.8), 0], at: [[CX0 - 0.005, 0, -0.9], [CX0 - 0.005, 0, 0.7], [CX1 + 0.005, 0, -0.9], [CX1 + 0.005, 0, 0.7]].map((a) => a.map(R2)), mat: "seam" });
BOX("bChSeamT", "bTool", CX0, CX1, CY1 + 0.34, CY1 + 0.36, 0.3, 0.33, "seam");
P({ id: "bScrew", layer: "bTool", shape: "cyl", size: [0.06, 0.05], pos: [0, 0, 2.04], at: [...[0, 1, 2, 3, 4, 5].map((i) => [CX0 + 0.2 + i * ((CX1 - CX0 - 0.4) / 5), CY1 - 0.15, 0]), ...[0, 1, 2, 3, 4, 5].map((i) => [CX0 + 0.2 + i * ((CX1 - CX0 - 0.4) / 5), CY0 + 0.2, 0])].map((a) => a.map(R2)), mat: "steel" });
const SHY = CY1 - 0.5;
VC("bShower", "bTool", 1.7, SHY, SHY + 0.18, "steel2", { x: XC, z: -0.2 });
P({ id: "bShHole", layer: "bTool", shape: "cyl", size: [0.05, 0.01], rot: V, pos: [0, R2(SHY - 0.005), 0], at: (() => { const a = []; for (let i = -5; i <= 5; i++) for (let j = -5; j <= 5; j++) if (Math.hypot(i, j) <= 5) a.push([R2(XC + i * 0.3), 0, R2(-0.2 + j * 0.3)]); return a; })(), mat: "darker" });
// 吸盤：底柱＋盤面＋邊環＋3 根升降銷＋底部線纜
VC("bChStem", "bTool", 0.5, CY0 + 0.4, CY0 + 0.66, "dark", { x: XC, z: -0.2 });
VC("bChuck", "bTool", 1.62, CY0 + 0.66, CY0 + 0.9, "steel", { x: XC, z: -0.2 }); RING("bEdge", "bTool", 1.95, 1.64, CY0 + 0.7, CY0 + 0.95, "quartzS", XC, -0.2);
P({ id: "bPin", layer: "bTool", shape: "cyl", size: [0.05, 0.26], rot: V, pos: [0, R2(CY0 + 0.53), 0], at: [90, 210, 330].map((d) => [R2(XC + 1.1 * Math.cos((d * Math.PI) / 180)), 0, R2(-0.2 + 1.1 * Math.sin((d * Math.PI) / 180))]), mat: "steel2" });
P({ id: "bChCable", layer: "bTool", shape: "cyl", size: [0.06, 1.6], pos: [XC, R2(CY0 + 0.47), -1.3], mat: "rubber" });
// 傳片閘門（右壁）：閘門板＋門框＋氣缸
BOX("bSlitF", "bTool", CX1, CX1 + 0.05, CY0 + 0.8, CY0 + 1.6, -1.1, 0.7, "dark"); BOX("bSlit", "bTool", CX1 + 0.05, CX1 + 0.12, CY0 + 0.9, CY0 + 1.5, -1.0, 0.6, "steel");
VC("bSlitCy", "bTool", 0.12, CY0 + 1.6, CY0 + 2.6, "steel2", { x: CX1 + 0.16, z: -0.2 }); VC("bSlitRod", "bTool", 0.04, CY0 + 1.5, CY0 + 1.6, "steel", { x: CX1 + 0.16, z: -0.2 });
// 抽氣：後壁抽氣管＋彎頭＋地上的真空泵（散熱鰭片）
P({ id: "bExh", layer: "bTool", shape: "cyl", size: [0.2, 1.1], pos: [XC, R2(CY0 + 0.25), -2.95], mat: "steel2" }); SPH("bExhE", "bTool", 0.22, XC, CY0 + 0.25, -3.5, "steel2");
VC("bExhV", "bTool", 0.2, 0.9, CY0 + 0.25, "steel2", { x: XC, z: -3.5 });
BOX("bPump", "bTool", XC - 0.6, XC + 0.6, 0, 0.9, -4.1, -2.9, "darker"); P({ id: "bPumpFin", layer: "bTool", shape: "box", size: [0.08, 0.6, 0.04], pos: [0, 0.45, 0], at: [-1, 1].flatMap((sx) => [0, 1, 2, 3, 4, 5].map((k) => [R2(XC + sx * 0.64), 0, R2(-4.0 + k * 0.2)])), mat: "fin" });
BOX("bPumpTag", "bTool", XC - 0.3, XC + 0.3, 0.4, 0.7, -2.9, -2.88, "lampY");
// 射頻接頭盒（頂）：百葉＋銘牌＋兩個 N 型接頭；左側接頭→線纜→左邊地上的射頻電源箱
BOX("bRf", "bTool", CX0 + 1.4, CX0 + 2.4, CY1 + 0.35, CY1 + 1.0, -1.6, -0.6, "darker");
P({ id: "bRfLv", layer: "bTool", shape: "box", size: [0.7, 0.03, 0.02], pos: [R2(CX0 + 1.9), 0, -0.59], at: [0, 1, 2, 3].map((i) => [0, R2(CY1 + 0.5 + i * 0.1), 0]), mat: "steel2" });
BOX("bRfTag", "bTool", CX0 + 1.5, CX0 + 1.8, CY1 + 0.86, CY1 + 0.96, -0.6, -0.58, "white");
P({ id: "bRfN", layer: "bTool", shape: "cyl", size: [0.08, 0.14], rot: V, pos: [0, R2(CY1 + 1.07), -1.1], at: [[R2(CX0 + 1.7), 0, 0], [R2(CX0 + 2.1), 0, 0]], mat: "gold" });
const GNX = BX - 7.6, CBY = R2(CY1 + 0.68);
P({ id: "bRfCon", layer: "bTool", shape: "cyl", size: [0.12, 0.3], pos: [R2(CX0 + 1.25), CBY, -1.1], rot: [0, 90, 0], mat: "gold" });
P({ id: "bRfCable", layer: "bTool", shape: "cyl", size: [0.09, R2(CX0 + 1.1 - GNX)], pos: [R2((CX0 + 1.1 + GNX) / 2), CBY, -1.1], rot: [0, 90, 0], mat: "rubber" });
SPH("bRfCabE", "bTool", 0.11, GNX, CBY, -1.1, "rubber"); VC("bRfCabV", "bTool", 0.09, 2.5, CBY, "rubber", { x: GNX, z: -1.1 });
BOX("bRfGen", "bTool", GNX - 0.8, GNX + 0.8, 0, 2.4, -1.6, 0.4, "band"); BOX("bRfGenT", "bTool", GNX - 0.82, GNX + 0.82, 2.4, 2.45, -1.62, 0.42, "dark");
VC("bRfGenC", "bTool", 0.13, 2.45, 2.55, "gold", { x: GNX, z: -1.1 });
P({ id: "bRfGenLv", layer: "bTool", shape: "box", size: [1.2, 0.04, 0.03], pos: [GNX, 0, 0.41], at: [0, 1, 2, 3, 4, 5].map((i) => [0, R2(0.3 + i * 0.13), 0]), mat: "dark" });
panelUI("bUi", "bTool", GNX, 1.3, 0.4, 0.7);
// 氣體管線：兩根立管＋閥件手輪，頂端彎頭接到集管，沿 z 走到腔體頂蓋中心再往下（法蘭接口）
const GY = R2(CY1 + 2.6);
P({ id: "bGasPipe", layer: "bTool", shape: "cyl", size: [0.07, 2.6], rot: V, pos: [0, R2(CY1 + 1.3), 0], at: [[CX1 - 0.8, 0, -1.6], [CX1 - 1.3, 0, -1.6]].map((a) => a.map(R2)), mat: "steel2" });
SPH("bGasE", "bTool", 0.1, 0, GY, 0, "steel2", { at: [[CX1 - 0.8, 0, -1.6], [CX1 - 1.3, 0, -1.6], [XC, 0, -1.6], [XC, 0, -0.2]].map((a) => a.map(R2)) });
P({ id: "bGasHdr", layer: "bTool", shape: "cyl", size: [0.07, R2(CX1 - 0.8 - XC)], pos: [R2((CX1 - 0.8 + XC) / 2), GY, -1.6], rot: [0, 90, 0], mat: "steel2" });
P({ id: "bGasZ", layer: "bTool", shape: "cyl", size: [0.07, 1.4], pos: [XC, GY, -0.9], mat: "steel2" });
VC("bGasDrop", "bTool", 0.07, CY1 + 0.35, GY, "steel2", { x: XC, z: -0.2 }); VC("bGasFl", "bTool", 0.2, CY1 + 0.35, CY1 + 0.45, "steel", { x: XC, z: -0.2 });
valve("bV0", "bTool", CX1 - 0.8, CY1 + 1.9, -1.6); valve("bV1", "bTool", CX1 - 1.3, CY1 + 1.5, -1.6);
// 腔內那片晶圓（試跑；長膜後經閘門送到量測台）
LAY("bCW", [3.4, 0.3, XC, CY0 + 0.95]);
wafer("bCw", "bCW", XC, CY0 + 0.9, -0.2, 1.6, "mirror");
LAY("bFilm", [3.4, 0.2, XC, CY0 + 0.97]);
VC("bFilmC", "bFilm", 1.59, CY0 + 0.955, CY0 + 0.99, "ox", { x: XC, z: -0.2 });
LAY("bPlasma", [3.4, 1.4, XC, CY0 + 1.6]);
VC("bPlasmaC", "bPlasma", 1.6, CY0 + 1.0, SHY - 0.05, "plas", { x: XC, z: -0.2 });
actions.bPlGlow = { type: "pulse", _說明: "試跑：沉積時腔內電漿輝光微微閃", parts: ["bPlasmaC"], color: "plasC", glow: 0.8, freq: 2.2, halo: 0 };
actions.bGasIn = { track: false, type: "flow", _說明: "反應氣體從噴頭的孔陣往下噴到晶圓（看得出噴頭在做事）", path: [[XC, SHY - 0.03, -0.2], [XC, CY0 + 1.02, -0.2]].map((a) => a.map(R2)), n: 4, size: 0.06, shape: "dot", rate: 0.7, accel: true, color: "gasC", layer: "bPlasma", lanes: 7, laneGap: 0.42, laneDir: [1, 0, 0], jitter: 0.03 };
// 測膜量台：吸盤，龍門架上斜射光源與偵測器；雷射掃描頭＋光幕＋掃描線橫掃
LAY("bMet", [6, 5, BX + 3.4, 2.2]);
const MX = BX + 3.4, MH = plinth("bm", "bMet", MX, 0, 5.4, 5.0, 0.8);
VC("bmChuck", "bMet", 1.9, MH, MH + 0.3, "steel", { x: MX }); RING("bmRim", "bMet", 2.0, 1.9, MH, MH + 0.32, "dark", MX, 0);
for (const sx of [-1, 1]) BOX(`bmPost${sx}`, "bMet", MX + sx * 2.3 - 0.15, MX + sx * 2.3 + 0.15, MH, MH + 3.6, -1.9, -1.6, "steel2");
BOX("bmBeam", "bMet", MX - 2.45, MX + 2.45, MH + 3.6, MH + 3.9, -1.95, -1.55, "steel2");
const MWY = MH + 0.37;
// 光源盒（左上斜）、偵測器盒（右上斜），光打在晶圓中心 [MX, MWY, 0]，入射角＝反射角
const c49 = Math.cos((49 * Math.PI) / 180), s49 = Math.sin((49 * Math.PI) / 180);
P({ id: "bmSrc", layer: "bMet", shape: "box", size: [1.0, 0.5, 0.5], pos: [R2(MX - 1.9), R2(MWY + 2.2), 0], rot: [0, 0, -49], mat: "darker" });
P({ id: "bmSrcB", layer: "bMet", shape: "cyl", size: [0.17, 0.22], pos: [R2(MX - 1.58), R2(MWY + 1.84), 0], rot: [0, 90, -49], mat: "steel2" });
P({ id: "bmSrcL", layer: "bMet", shape: "cyl", size: [0.12, 0.1], pos: [R2(MX - 1.46), R2(MWY + 1.7), 0], rot: [0, 90, -49], mat: "lampR" });
P({ id: "bmPol", layer: "bMet", shape: "ring", size: [0.42, 0.42, 0.04], wall: 0.07, pos: [R2(MX - 1.34), R2(MWY + 1.56), 0], rot: [0, 90, -49], mat: "steel" });
P({ id: "bmDet", layer: "bMet", shape: "box", size: [1.0, 0.5, 0.5], pos: [R2(MX + 1.9), R2(MWY + 2.2), 0], rot: [0, 0, 49], mat: "darker" });
P({ id: "bmDetW", layer: "bMet", shape: "cyl", size: [0.16, 0.06], pos: [R2(MX + 1.9 - 0.5 * c49), R2(MWY + 2.2 - 0.5 * s49), 0], rot: [0, 90, 49], mat: "winD" });
P({ id: "bmDetFin", layer: "bMet", shape: "box", size: [0.04, 0.16, 0.44], pos: [0, 0, 0], rot: [0, 0, 49], at: [-0.3, -0.15, 0, 0.15, 0.3].map((u) => [R2(MX + 1.9 + u * c49 - 0.33 * s49), R2(MWY + 2.2 + u * s49 + 0.33 * c49), 0]), mat: "fin" });
for (const [id, sx] of [["bmSrcC", -1], ["bmDetC", 1]]) P({ id, layer: "bMet", shape: "cyl", size: [0.05, 1.6], pos: [R2(MX + sx * (1.9 + 0.45 * c49)), R2(MWY + 2.2 + 0.45 * s49), -0.8], mat: "rubber" });
P({ id: "bmArm", layer: "bMet", shape: "box", size: [0.12, 1.5, 0.12], pos: [0, R2(MH + 3.0), -1.6], at: [[R2(MX - 1.9), 0, 0], [R2(MX + 1.9), 0, 0]], mat: "steel" });
P({ id: "bmArm2", layer: "bMet", shape: "box", size: [0.12, 0.12, 1.6], pos: [0, R2(MWY + 2.35), -0.8], at: [[R2(MX - 1.9), 0, 0], [R2(MX + 1.9), 0, 0]], mat: "steel" });
panelUI("bmUi", "bMet", MX + 1.5, 0.12, 2.52, 0.7);
// 量測台上的晶圓（從腔體經閘門送過來；到位才出現）＋膜
LAY("bMW", [3.8, 0.3, MX, MWY]);
wafer("bmW", "bMW", MX, MH + 0.3, 0, 1.8, "mirror");
VC("bFilmW", "bMW", 1.79, MWY - 0.005, MWY + 0.04, "ox", { x: MX });
actions.bXfer = { free: true, type: "flow", _說明: "試跑完的晶圓經閘門送到量測台（傳送方向）", path: [[CX1 + 0.3, CY0 + 1.2, -0.2], [BX + 0.4, MWY + 0.5, 0], [MX - 0.4, MWY + 0.25, 0]].map((a) => a.map(R2)), n: 3, size: 0.2, shape: "arrow", rate: 0.9, track: true, color: "lampG", layer: "bMet" };
actions.bBeam = { free: true, type: "flow", _說明: "測膜厚：斜射光打到膜上、反射進偵測器（入射角＝反射角）", path: [[MX - 1.4, MWY + 1.64, 0], [MX, MWY + 0.05, 0], [MX + 1.4, MWY + 1.64, 0]].map((a) => a.map(R2)), n: 10, size: 0.08, shape: "dot", rate: 0.8, track: true, color: "beamC", layer: "bMet", trail: 3, trailGap: 0.02 };
LAY("bScan", [4, 3, MX, MWY + 1.5]);
BOX("bScanBar", "bScan", MX - 0.04, MX + 0.04, MWY + 0.05, MWY + 0.09, -1.8, 1.8, "scan");
BOX("bScanHead", "bScan", MX - 0.2, MX + 0.2, MH + 3.25, MH + 3.6, -1.7, -1.4, "dark");
VC("bScanOut", "bScan", 0.06, MH + 3.2, MH + 3.25, "lampR", { x: MX, z: -1.55 });
{ const yb = MWY + 0.09, yt = MH + 3.2, h = R2(yt - yb);
  P({ id: "bCurtain", layer: "bScan", shape: "poly", pts: [[-1.8, -h / 2], [1.8, -h / 2], [1.62, h / 2], [1.48, h / 2]].map((a) => a.map(R2)), size: [3.6, h, 0.02], pos: [MX, R2((yb + yt) / 2), 0], rot: [0, 90, 0], mat: "curtain" }); }
const SCAN_AMP = 1.6, SCAN_F = 0.6;
actions.bScanGo = { type: "vibrate", _說明: "數灰塵：雷射線來回掃過整片（往復，兩端減速）", parts: ["bScanBar", "bScanHead", "bScanOut", "bCurtain"], axis: [1, 0, 0], amp: SCAN_AMP, freq: SCAN_F };
LAY("bDust", [3, 0.3, MX, MWY + 0.1]);
const DUSTX = [-0.9, 0.4, 1.1, -0.3, 0.8, -1.3], DUSTZ = [0.5, -0.9, 0.7, 1.2, -0.2, -0.6];
DUSTX.forEach((dx, i) => { SPH(`bDust${i}`, "bDust", 0.07, MX + dx, MWY + 0.08, DUSTZ[i], "dustD");
  actions[`bDG${i}`] = { type: "pulse", _說明: "這顆微粒被雷射掃到才亮（散射光），亮過之後留著＝已記數", parts: [`bDust${i}`], color: "lampY", glow: 1, steady: true, halo: 0 }; });

// ═════ 站 C：直立爐管（x 60）：升降座上石英晶舟（上下擋片＋中段產品片），石英管＋加熱線圈，外罩左右對開（剖開示意） ═════
const CX = 60;
LAY("cBase", [7, 2, CX, 1]);
const CH = plinth("c", "cBase", CX, 0, 6.6, 5.4, 0.8);
// 升降導軌＋螺桿（右後）
BOX("cRail", "cBase", CX + 2.2, CX + 2.5, CH, CH + 11.2, -1.8, -1.5, "steel2"); VC("cScrewS", "cBase", 0.08, CH, CH + 11.2, "steel", { x: CX + 1.9, z: -1.65 });
P({ id: "cScrewT", layer: "cBase", shape: "cyl", size: [0.11, 0.03], rot: V, pos: [R2(CX + 1.9), 0, -1.65], at: Array.from({ length: 36 }, (_, i) => [0, R2(CH + 0.2 + i * 0.31), 0]), mat: "steel2" });
BOX("cMotor", "cBase", CX + 1.6, CX + 2.2, CH, CH + 0.7, -2.0, -1.3, "darker");
// r1（細節表 6）：馬達加散熱鰭片、聯軸器、線纜
P({ id: "cMotFin", layer: "cBase", shape: "box", size: [0.04, 0.55, 0.62], pos: [0, R2(CH + 0.35), -1.65], at: [0, 1, 2, 3, 4].map((i) => [R2(CX + 1.66 + i * 0.12), 0, 0]), mat: "fin" });
VC("cCoup", "cBase", 0.13, CH + 0.7, CH + 0.95, "steel2", { x: CX + 1.9, z: -1.65 }); BOX("cMotTag", "cBase", CX + 1.7, CX + 2.1, CH + 0.25, CH + 0.45, -1.3, -1.28, "white");
P({ id: "cMotCab", layer: "cBase", shape: "cyl", size: [0.05, 1.0], pos: [R2(CX + 1.9), R2(CH + 0.15), -2.5], mat: "rubber" });
// 擋片傳送叉的地面導軌（爐前）
P({ id: "cForkRail", layer: "cBase", shape: "box", size: [0.12, 0.08, 3.6], pos: [0, 0.04, 4.6], at: [[R2(CX - 0.35), 0, 0], [R2(CX + 0.35), 0, 0]], mat: "steel2" });
// 爐體支架（上方）
const TB = CH + 5.6, TT = CH + 11.0;   // 石英管底、頂
BOX("cFrameL", "cBase", CX - 2.9, CX - 2.6, CH, TT + 0.6, -2.4, -2.1, "steel"); BOX("cFrameR", "cBase", CX + 2.6, CX + 2.9, CH, TT + 0.6, -2.4, -2.1, "steel");
BOX("cFrameT", "cBase", CX - 2.9, CX + 2.9, TT + 0.6, TT + 0.9, -2.4, -2.1, "steel");
LAY("cTube", [4, 6, CX, TB + 2.7]);
VC("cTubeQ", "cTube", 1.75, TB, TT, "quartz", { x: CX }); RING("cFlange", "cTube", 2.05, 1.75, TB - 0.15, TB + 0.1, "steel2", CX, 0);
VC("cTubeTop", "cTube", 1.75, TT, TT + 0.12, "quartzS", { x: CX });
// r1（細節表 6）：石英管上下邊緣亮線＋左右輪廓線，看得出有一根管子
RING("cTubeE0", "cTube", 1.8, 1.7, TB + 0.1, TB + 0.16, "quartzS", CX, 0); RING("cTubeE1", "cTube", 1.8, 1.7, TT - 0.08, TT, "quartzS", CX, 0);
P({ id: "cTubeLn", layer: "cTube", shape: "box", size: [0.05, R2(TT - TB - 0.2), 0.05], pos: [0, R2((TB + TT) / 2), 0], at: [[R2(CX - 1.74), 0, 0.15], [R2(CX + 1.74), 0, 0.15]], mat: "quartzS" });
P({ id: "cExh", layer: "cTube", shape: "cyl", size: [0.16, 1.6], pos: [R2(CX + 2.0), R2(TB + 0.3), 0], rot: [0, 90, 0], mat: "steel2" });
const NCOIL = 10; for (let i = 0; i < NCOIL; i++) RING(`cCoil${i}`, "cTube", 2.05, 1.9, R2(TB + 0.5 + i * 0.5), R2(TB + 0.62 + i * 0.5), "heatDim", CX, 0);
// 晶舟（四支石英桿＋底座＋頂板）與 20 槽：上 3、下 3 為擋片（灰），中段產品片（晶粒）
LAY("cBoat", [3.6, 5.2, CX, CH + 2.8]);
const BB = CH + 0.9, BSP = 0.24, BN = 16, BW0 = BB + 0.5;
VC("cPed", "cBoat", 1.2, CH, BB, "quartzS", { x: CX }); VC("cCap", "cBoat", 1.9, BB - 0.15, BB + 0.05, "steel2", { x: CX });
P({ id: "cRod", layer: "cBoat", shape: "cyl", size: [0.09, R2(BN * BSP + 0.5)], rot: V, pos: [0, R2(BW0 + (BN * BSP) / 2 - 0.1), 0], at: [[CX - 1.45, 0, -0.5], [CX + 1.45, 0, -0.5], [CX - 0.8, 0, -1.3], [CX + 0.8, 0, -1.3]].map((a) => a.map(R2)), mat: "quartzS" });
VC("cBoatTop", "cBoat", 1.6, BW0 + BN * BSP, BW0 + BN * BSP + 0.1, "quartzS", { x: CX });
// r1（細節表 6）：每支桿在每個晶圓位置有一顆槽齒（晶圓擱在齒上）
P({ id: "cSlot", layer: "cBoat", shape: "box", size: [0.12, 0.04, 0.12], pos: [0, 0, 0], at: [[CX - 1.4, -0.5], [CX + 1.4, -0.5], [CX - 0.76, -1.24], [CX + 0.76, -1.24]].flatMap(([x, z]) => Array.from({ length: BN }, (_, i) => [R2(x), R2(BW0 + i * BSP - 0.02), z])), mat: "quartzS" });
const DUM = [0, 1, 2, BN - 3, BN - 2, BN - 1];
for (let i = 0; i < BN; i++) if (!DUM.includes(i)) VC(`cP${i}`, "cBoat", 1.5, R2(BW0 + i * BSP), R2(BW0 + i * BSP + 0.04), "die", { x: CX });
LAY("cDummy", [3.4, 5.2, CX, CH + 3.0]);
for (const i of DUM) VC(`cD${i}`, "cDummy", 1.5, R2(BW0 + i * BSP), R2(BW0 + i * BSP + 0.04), "wafer", { x: CX });
// r1（物理 r0 必改 1）：擋片由傳送叉從正面水平送進槽位（不從上面掉），送完叉子退出
LAY("cFork", [1, 6, CX, 3.0]);
P({ id: "cTine", layer: "cFork", shape: "box", size: [0.6, 0.025, 3.55], pos: [CX, 0, 1.175], at: DUM.map((i) => [0, R2(BW0 + i * BSP - 0.015), 0]), mat: "steel2" });
BOX("cSpine", "cFork", CX - 0.15, CX + 0.15, 0.1, BW0 + (BN - 1) * BSP + 0.1, 2.95, 3.2, "steel"); BOX("cForkCar", "cFork", CX - 0.5, CX + 0.5, 0, 0.12, 2.8, 3.4, "dark");
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
// 加熱器外罩左右對開（visual-spec／physics-spec 同一份步驟）
BOX("cPlate", "cJacketR", CX + 0.15, CX + 0.95, TT - 1.4, TT - 0.8, JR + 0.06, JR + 0.1, "white"); BOX("cPlateL", "cJacketR", CX + 0.25, CX + 0.85, TT - 1.2, TT - 1.0, JR + 0.1, JR + 0.11, "darker");
actions.cCoilGlow = { type: "pulse", _說明: "加熱線圈通電發橘光", parts: Array.from({ length: NCOIL }, (_, i) => `cCoil${i}`), color: "heatC", glow: 0.9, freq: 0.7, halo: 0 };
const BOATUP = R2(TB + 0.2 - BB);   // 晶舟上升量（底座頂到管口）
actions.cHeat = { track: false, type: "flow", _說明: "熱從外圈線圈往管中心均勻擴散（左右對稱，各層一樣；線圈區中段）", path: [[CX - 1.9, 0, 0], [CX - 0.4, 0, 0]].map((a) => a.map(R2)), n: 6, size: 0.16, shape: "arrow", rate: 0.6, track: false, color: "heatC", layer: "cTube", lanes: 4, laneGap: 1.1, laneDir: [0, 1, 0], jitter: 0.03 };
actions.cHeat2 = { ...actions.cHeat, path: [[CX + 1.9, 0, 0], [CX + 0.4, 0, 0]].map((a) => a.map(R2)) };
for (const k of ["cHeat", "cHeat2"]) actions[k].path = actions[k].path.map(([x, , z]) => [x, R2(TB + 2.8), z]);

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
// r1（物理建議）：測試片是整面覆蓋膜，拿掉金色細線（不像有圖案的產品片）
// 淘汰桶（左前）＋紅叉
LAY("dTrash", [2, 2, DX - 4.3, 1]);
P({ id: "dBin", layer: "dTrash", shape: "tube", size: [0.9, 0.82, 1.6], rot: V, pos: [R2(DX - 4.3), 0.8, 2.2], mat: "dark" });
VC("dBinB", "dTrash", 0.85, 0.02, 0.08, "dark", { x: DX - 4.3, z: 2.2 }); RING("dBinRim", "dTrash", 0.95, 0.82, 1.55, 1.65, "steel2", DX - 4.3, 2.2);
LAY("dX", [2, 2, DX - 4.3, 2.4]);
P({ id: "dX0", layer: "dX", shape: "box", size: [2.2, 0.22, 0.08], pos: [R2(DX - 4.3), 2.5, 3.2], rot: [0, 0, 45], mat: "lampR" });
P({ id: "dX1", layer: "dX", shape: "box", size: [2.2, 0.22, 0.08], pos: [R2(DX - 4.3), 2.5, 3.2], rot: [0, 0, -45], mat: "lampR" });
// 再生運送箱（右）：箱體＋扣件＋把手＋標籤
LAY("dCrate", [2.6, 1.6, DX + 4.3, 0.8]);
BOX("dCr", "dCrate", DX + 3.3, DX + 5.3, 0, 1.4, 1.0, 3.0, "boxS"); BOX("dCrLid", "dCrate", DX + 3.25, DX + 5.35, 1.4, 1.55, 0.95, 3.05, "dark");
P({ id: "dCrClip", layer: "dCrate", shape: "box", size: [0.25, 0.3, 0.06], pos: [0, 1.35, 3.04], at: [[R2(DX + 3.8), 0, 0], [R2(DX + 4.8), 0, 0]], mat: "steel2" });
BOX("dCrTag", "dCrate", DX + 3.9, DX + 4.7, 0.5, 1.0, 3.0, 3.02, "lampG");
actions.dShip = { free: true, type: "flow", _說明: "送去再生：用過的片子沿箭頭進運送箱", path: [[DX + 2.5, DY + 0.4, 1.0], [DX + 3.4, 2.4, 1.6], [DX + 4.3, 1.7, 2.0]].map((a) => a.map(R2)), n: 4, size: 0.18, shape: "arrow", rate: 0.6, track: true, color: "lampG", layer: "dBase" };

// ═════ 站 E：濕式去膜槽（x 120）：透明槽＋藥液、地上循環泵＋管路＋閥件、後立柱掛的排氣罩、固定升降塔＋滑座＋夾爪、整籃直立晶圓 ═════
// r1（機構 r0 必改 5、6、細節表 8、9；物理 r0 必改 5）：底座縮成 6.0 寬，泵和管路移到右邊地上看得到；升降塔固定在底座上、滑座沿塔下滑；
//   排氣罩由兩根後立柱撐著；籃子有上下框、四根角柱、槽齒；晶圓直立插在籃裡（片面朝 x），槽底打氣管冒出的氣泡從片與片的縫隙往上走
const EX = 120;
LAY("eBench", [9.6, 7.6, EX + 0.6, 3.6]);
const EH = plinth("e", "eBench", EX, 0, 6.0, 5.4, 1.4);
const TX0 = EX - 2.4, TX1 = EX + 2.4, TZ0 = -1.8, TZ1 = 1.8, TY0 = EH, TY1 = EH + 3.0;
BOX("eTankB", "eBench", TX0, TX1, TY0, TY0 + 0.15, TZ0, TZ1, "darker");
for (const [id, a, b, c, d] of [["eGF", TX0, TX1, TZ1 - 0.06, TZ1], ["eGB", TX0, TX1, TZ0, TZ0 + 0.06]]) BOX(id, "eBench", a, b, TY0, TY1, c, d, "glass");
for (const [id, a, b] of [["eGL", TX0, TX0 + 0.06], ["eGR", TX1 - 0.06, TX1]]) BOX(id, "eBench", a, b, TY0, TY1, TZ0, TZ1, "glass");
P({ id: "eFrame", layer: "eBench", shape: "box", size: [0.12, R2(TY1 - TY0), 0.12], pos: [0, R2((TY0 + TY1) / 2), 0], at: [[TX0, 0, TZ0], [TX1, 0, TZ0], [TX0, 0, TZ1], [TX1, 0, TZ1]].map((a) => a.map(R2)), mat: "steel" });
P({ id: "eLip", layer: "eBench", shape: "ring", size: [R2(TX1 - TX0 + 0.3), R2(TZ1 - TZ0 + 0.3), 0.14], wall: 0.15, r: 0.05, rot: [-90, 0, 0], pos: [EX, R2(TY1), 0], mat: "steel2" });
LAY("eLiq", [4.6, 2.6, EX, TY0 + 1.4]);
const LQ = R2(TY1 - 0.25);
BOX("eLiqB", "eLiq", TX0 + 0.06, TX1 - 0.06, TY0 + 0.15, LQ, TZ0 + 0.06, TZ1 - 0.06, "liq");
P({ id: "eRipple", layer: "eLiq", shape: "box", size: [R2(TX1 - TX0 - 0.2), 0.02, 0.05], pos: [EX, R2(LQ + 0.01), 0], at: Array.from({ length: 6 }, (_, i) => [0, 0, R2(TZ0 + 0.5 + i * 0.55)]), mat: "white" });
actions.eWave = { type: "vibrate", _說明: "液面波紋", parts: ["eRipple"], axis: [0, 1, 0], amp: 0.03, freq: 1.4 };
// 槽底打氣管（有孔）：從右壁穿出，接到地上循環泵的出口立管
const SPY = R2(TY0 + 0.18);
P({ id: "eSparger", layer: "eBench", shape: "cyl", size: [0.05, 4.5], pos: [R2(EX + 0.15), SPY, 0], rot: [0, 90, 0], mat: "steel2" });
P({ id: "eSpHole", layer: "eBench", shape: "box", size: [0.04, 0.012, 0.04], pos: [0, R2(SPY + 0.05), 0], at: [-1.25, -0.75, -0.25, 0.25, 0.75, 1.25].map((dx) => [R2(EX + dx), 0, 0]), mat: "darker" });
const PX0 = EX + 3.4, PX1 = EX + 4.3, RX = EX + 3.65;
BOX("ePump", "eBench", PX0, PX1, 0, 0.9, -0.5, 0.5, "darker"); BOX("ePumpTag", "eBench", PX0 + 0.2, PX1 - 0.2, 0.35, 0.6, 0.5, 0.52, "lampY");
P({ id: "ePumpM", layer: "eBench", shape: "cyl", size: [0.34, 0.8], pos: [R2((PX0 + PX1) / 2), 0.45, 0.9], mat: "steel" });
P({ id: "ePumpFin", layer: "eBench", shape: "tube", size: [0.42, 0.34, 0.04], pos: [R2((PX0 + PX1) / 2), 0.45, 0], at: [0, 1, 2, 3, 4].map((i) => [0, 0, R2(0.6 + i * 0.13)]), mat: "fin" });
VC("ePumpFl", "eBench", 0.16, 0.9, 1.0, "steel", { x: RX, z: 0 });
VC("ePipe", "eBench", 0.08, 1.0, SPY, "steel2", { x: RX, z: 0 }); SPH("ePipeE", "eBench", 0.11, RX, SPY, 0, "steel2");
P({ id: "ePipeIn", layer: "eBench", shape: "cyl", size: [0.08, R2(RX - TX1 + 0.1)], pos: [R2((RX + TX1 - 0.1) / 2), SPY, 0], rot: [0, 90, 0], mat: "steel2" });
valve("eV0", "eBench", RX, 1.3, 0);
P({ id: "eClamp", layer: "eBench", shape: "box", size: [0.25, 0.08, 0.25], pos: [RX, 0, 0], at: [[0, 1.12, 0], [0, 1.5, 0]], mat: "steel" });
// 回流管：底座側面出水口→泵的吸入口
P({ id: "ePipeR", layer: "eBench", shape: "cyl", size: [0.07, R2(PX0 + 0.45 - (EX + 3.0))], pos: [R2((PX0 + 0.45 + EX + 3.0) / 2), 0.5, -1.2], rot: [0, 90, 0], mat: "steel2" });
SPH("ePipeRE", "eBench", 0.09, PX0 + 0.45, 0.5, -1.2, "steel2"); P({ id: "ePipeR2", layer: "eBench", shape: "cyl", size: [0.07, 0.7], pos: [R2(PX0 + 0.45), 0.5, -0.85], mat: "steel2" });
BOX("eDrain", "eBench", EX + 3.0, EX + 3.05, 0.35, 0.65, -1.35, -1.05, "steel");
// 排氣罩：兩根後立柱撐著＋接縫＋排氣管
for (const sx of [-1, 1]) BOX(`eHoodPost${sx}`, "eBench", EX + sx * 2.9 - 0.1, EX + sx * 2.9 + 0.1, EH, TY1 + 3.6, -2.4, -2.2, "steel");
BOX("eHood", "eBench", EX - 3.0, EX + 3.0, TY1 + 3.6, TY1 + 4.0, -2.5, -1.4, "panel"); BOX("eHoodS", "eBench", EX - 3.0, EX + 3.0, TY1 + 3.65, TY1 + 3.7, -1.45, -1.35, "seam");
VC("eDuct", "eBench", 0.4, TY1 + 4.0, TY1 + 5.0, "steel2", { x: EX - 2.0, z: -1.9 });
panelUI("eUi", "eBench", EX - 2.2, 0.2, 2.72, 0.75);
// 升降塔（固定）：塔柱＋導軌條＋頂蓋
const LUP = 2.9;   // 籃子在液面上方的高度；下降 LUP 進槽
const KY = R2(TY0 + 0.4 + LUP);   // 籃子底（抬起時）
BOX("eTower", "eBench", EX - 0.25, EX + 0.25, EH, KY + 3.1, TZ0 - 0.9, TZ0 - 0.5, "steel2");
BOX("eTowerR", "eBench", EX - 0.08, EX + 0.08, EH + 0.2, KY + 3.0, TZ0 - 0.5, TZ0 - 0.47, "steel"); BOX("eTowerC", "eBench", EX - 0.32, EX + 0.32, KY + 3.1, KY + 3.25, TZ0 - 0.97, TZ0 - 0.43, "dark");
// 升降臂：滑座（包住塔柱）＋橫臂＋夾爪橫梁＋兩支夾爪（末端勾爪）＋整籃（5 片直立）
LAY("eLift", [4.4, 5.2, EX, KY + 1.4]);
BOX("eCol", "eLift", EX - 0.4, EX + 0.4, KY + 1.9, KY + 2.95, TZ0 - 1.0, TZ0 - 0.4, "steel");
BOX("eArm", "eLift", EX - 0.2, EX + 0.2, KY + 2.65, KY + 2.95, TZ0 - 0.4, 0.15, "steel2");
BOX("eGripT", "eLift", EX - 1.75, EX + 1.75, KY + 2.5, KY + 2.65, -0.15, 0.15, "steel");
P({ id: "eGrip", layer: "eLift", shape: "box", size: [0.1, 0.62, 0.3], pos: [0, R2(KY + 2.19), 0], at: [[R2(EX - 1.7), 0, 0], [R2(EX + 1.7), 0, 0]], mat: "steel" });
P({ id: "eHook", layer: "eLift", shape: "box", size: [0.25, 0.1, 0.3], pos: [0, R2(KY + 1.93), 0], at: [[R2(EX - 1.62), 0, 0], [R2(EX + 1.62), 0, 0]], mat: "darker" });
// 籃子：上下框、四根角柱、兩端橫桿＋吊耳、三條底軌＋槽齒
const KX = 1.42, KZ = 1.0;
P({ id: "eKRod", layer: "eLift", shape: "box", size: [0.07, 2.45, 0.07], pos: [0, R2(KY + 1.125), 0], at: [[-KX, -KZ], [KX, -KZ], [-KX, KZ], [KX, KZ]].map(([x, z]) => [R2(EX + x), 0, z]), mat: "darker" });
P({ id: "eKLong", layer: "eLift", shape: "box", size: [R2(2 * KX + 0.07), 0.07, 0.07], pos: [EX, 0, 0], at: [[0, KY - 0.06, -KZ], [0, KY - 0.06, KZ], [0, KY + 2.32, -KZ], [0, KY + 2.32, KZ]].map((a) => a.map(R2)), mat: "darker" });
P({ id: "eKEnd", layer: "eLift", shape: "box", size: [0.07, 0.07, R2(2 * KZ)], pos: [0, 0, 0], at: [[-KX, KY - 0.06], [KX, KY - 0.06], [-KX, KY + 2.32], [KX, KY + 2.32]].map(([x, y]) => [R2(EX + x), R2(y), 0]), mat: "darker" });
P({ id: "eKLug", layer: "eLift", shape: "box", size: [0.17, 0.15, 0.3], pos: [0, R2(KY + 2.06), 0], at: [[R2(EX - 1.53), 0, 0], [R2(EX + 1.53), 0, 0]], mat: "darker" });
P({ id: "eKLugS", layer: "eLift", shape: "box", size: [0.07, 0.3, 0.07], pos: [0, R2(KY + 2.2), 0], at: [[R2(EX - KX), 0, 0], [R2(EX + KX), 0, 0]], mat: "darker" });
const WR = 1.1, WCY = R2(KY + WR), WXS = [-1.0, -0.5, 0, 0.5, 1.0];
P({ id: "eKRail", layer: "eLift", shape: "box", size: [R2(2 * KX), 0.1, 0.08], pos: [EX, 0, 0], at: [[0, KY - 0.05, 0], [0, R2(KY + 0.09), -0.55], [0, R2(KY + 0.09), 0.55]], mat: "darker" });
P({ id: "eKTooth", layer: "eLift", shape: "box", size: [0.04, 0.1, 0.1], pos: [0, 0, 0], at: [[KY + 0.05, 0], [KY + 0.19, -0.55], [KY + 0.19, 0.55]].flatMap(([y, z]) => WXS.flatMap((x) => [x - 0.07, x + 0.12].map((dx) => [R2(EX + dx), R2(y), z]))), mat: "darker" });
WXS.forEach((x, i) => { P({ id: `eW${i}`, layer: "eLift", shape: "cyl", size: [WR, 0.05], pos: [R2(EX + x), WCY, 0], rot: [0, 90, 0], mat: "wafer" }); });
const EF = [["eFm", "met"], ["eFn", "nit"], ["eFo", "ox"]];   // 由外往內溶：先金屬、再氮化、再氧化（膜在每片 +x 那一面）
EF.forEach(([id, mat], k) => { LAY(id, [2.6, 2.4, EX, WCY]); const off = [0.0675, 0.0525, 0.0350][k], th = [0.015, 0.015, 0.02][k];
  WXS.forEach((x, i) => P({ id: `${id}${i}`, layer: id, shape: "cyl", size: [R2(WR - 0.02 - 0.01 * k), th], pos: [R2(EX + x + off), WCY, 0], rot: [0, 90, 0], mat })); });
actions.eBub = { track: false, type: "flow", _說明: "打氣管冒泡：氣泡從片與片的縫隙由下往上、越升越快", path: [[EX, SPY + 0.08, 0], [EX, LQ - 0.05, 0]].map((a) => a.map(R2)), n: 8, size: 0.08, shape: "dot", rate: 0.5, accel: true, color: "bubC", layer: "eBench", lanes: 6, laneGap: 0.5, laneDir: [1, 0, 0], jitter: 0.1, rim: "liqC" };

// ═════ 站 F：研磨拋光機（x 150，左）＋刷洗檢查（右）═════
// r1（機構 r0 必改 3、4、8、細節表 10–12；物理 r0 必改 6）：研磨頭拆三層（研磨頭本體／壓力膜片＋保持環／晶圓），整組沿立柱升降；
//   橫臂接在立在底座上的立柱；轉盤外圍防濺擋圈、正面操作面板；轉盤與研磨頭都繞 −y 同向自轉，研磨液從後方順著轉向流到研磨頭、從墊緣甩出；
//   刷洗機立柱加高撐住噴水桿與檢查光條（L 形支架）、刷輪軸承座＋馬達、晶圓邊輪，右邊出片輸送台
const FX = 148;
LAY("fCmp", [8, 8.6, FX, 4]);
const FH = plinth("f", "fCmp", FX, 0, 7.6, 7.0, 1.2);
BOX("fCab", "fCmp", FX - 3.8, FX + 3.8, 0, FH, 3.45, 3.5, "seam");
P({ id: "fLouv", layer: "fCmp", shape: "box", size: [0.8, 0.04, 0.03], pos: [0, 0, 3.52], at: Array.from({ length: 10 }, (_, i) => [R2(FX - 3.0 + (i % 5) * 0.9), R2(0.4 + Math.floor(i / 5) * 0.12), 0]), mat: "dark" });
panelUI("fUi", "fCmp", FX + 2.5, 0.15, 3.5, 0.8);
LAY("fPlaten", [6.6, 0.6, FX, FH + 0.3]);
const PR = 3.1, PY = FH;
VC("fPlat", "fPlaten", PR, PY, PY + 0.3, "steel2", { x: FX }); VC("fPad", "fPlaten", R2(PR - 0.05), PY + 0.3, PY + 0.38, "pad", { x: FX });
for (let i = 1; i <= 5; i++) RING(`fGr${i}`, "fPlaten", R2(i * 0.55 + 0.03), R2(i * 0.55), PY + 0.38, PY + 0.395, "darker", FX, 0);
RING("fSplash", "fCmp", 3.38, 3.28, FH, FH + 0.6, "panel2", FX, 0); RING("fSplashT", "fCmp", 3.42, 3.24, FH + 0.6, FH + 0.66, "steel2", FX, 0);
actions.fSpin = { type: "rotate", _說明: "轉盤＋拋光墊旋轉（繞 −y，起轉加速）", parts: idsOf("fPlaten"), axis: [0, -1, 0], pivot: [FX, PY, 0].map(R2), rps: 0.5, rampSpin: true };
// 研磨頭：立柱（固定，立在底座上）；可升降的研磨頭本體（滑座＋橫臂＋齒輪箱＋馬達＋皮帶罩＋旋轉接頭＋主軸＋頭蓋）、壓力膜片＋保持環、晶圓三層
const HX0 = FX + 1.4, HZ = 0.4, HY = PY + 0.38, CLX0 = FX + 3.4, CLX1 = FX + 3.7;
BOX("fHCol", "fCmp", CLX0, CLX1, FH, HY + 6.8, HZ - 0.25, HZ + 0.25, "steel2"); BOX("fHColC", "fCmp", CLX0 - 0.05, CLX1 + 0.05, HY + 6.8, HY + 6.92, HZ - 0.3, HZ + 0.3, "dark");
BOX("fHColR", "fCmp", CLX0 - 0.03, CLX0, FH + 0.3, HY + 6.7, HZ - 0.08, HZ + 0.08, "steel");
BOX("fHColF", "fCmp", CLX0 - 0.2, CLX1 + 0.1, FH, FH + 0.08, HZ - 0.4, HZ + 0.4, "steel");
P({ id: "fHColB", layer: "fCmp", shape: "cyl", size: [0.05, 0.05], rot: V, pos: [0, R2(FH + 0.1), 0], at: [[CLX0 - 0.12, 0, HZ - 0.3], [CLX1 + 0.02, 0, HZ - 0.3], [CLX0 - 0.12, 0, HZ + 0.3], [CLX1 + 0.02, 0, HZ + 0.3]].map((a) => a.map(R2)), mat: "steel2" });
LAY("fHeadT", [5, 5, HX0 + 1.0, HY + 2.6]);
BOX("fHSlide", "fHeadT", CLX0 - 0.07, CLX1 + 0.07, HY + 3.2, HY + 3.9, HZ - 0.32, HZ + 0.32, "dark");
BOX("fHArm", "fHeadT", HX0 - 0.3, CLX0 - 0.07, HY + 3.4, HY + 3.7, HZ - 0.3, HZ + 0.3, "steel");
BOX("fHGear", "fHeadT", HX0 - 0.6, HX0 + 0.6, HY + 3.7, HY + 4.4, HZ - 0.5, HZ + 0.5, "darker"); BOX("fHTag", "fHeadT", HX0 - 0.35, HX0 + 0.25, HY + 3.9, HY + 4.15, HZ + 0.5, HZ + 0.52, "white");
P({ id: "fHMot", layer: "fHeadT", shape: "cyl", size: [0.28, 0.8], pos: [R2(HX0 + 1.5), R2(HY + 4.0), HZ], rot: [0, 90, 0], mat: "steel" });
P({ id: "fHMotFin", layer: "fHeadT", shape: "tube", size: [0.36, 0.28, 0.04], pos: [0, R2(HY + 4.0), HZ], rot: [0, 90, 0], at: [0, 1, 2, 3, 4].map((i) => [R2(HX0 + 1.2 + i * 0.15), 0, 0]), mat: "fin" });
BOX("fHBelt", "fHeadT", HX0 + 0.3, HX0 + 1.3, HY + 3.75, HY + 4.35, HZ + 0.3, HZ + 0.4, "band");
VC("fHUnion", "fHeadT", 0.14, HY + 4.4, HY + 4.62, "steel2", { x: HX0, z: HZ });
P({ id: "fHAir", layer: "fHeadT", shape: "cyl", size: [0.035, R2(CLX0 - 0.07 - HX0)], pos: [R2((CLX0 - 0.07 + HX0) / 2), R2(HY + 4.52), 0], rot: [0, 90, 0], at: [[0, 0, R2(HZ - 0.07)], [0, 0, R2(HZ + 0.07)]], mat: "rubber" });
VC("fHShaft", "fHeadT", 0.22, HY + 0.6, HY + 3.4, "steel2", { x: HX0, z: HZ });
VC("fHBody", "fHeadT", 1.2, HY + 0.14, HY + 0.6, "steel", { x: HX0, z: HZ });
[0, 45, 90, 135, 180, 225, 270, 315].forEach((d, k) => P({ id: `fHRib${k}`, layer: "fHeadT", shape: "box", size: [0.8, 0.1, 0.08], pos: [R2(HX0 + 0.7 * Math.cos((d * Math.PI) / 180)), R2(HY + 0.65), R2(HZ + 0.7 * Math.sin((d * Math.PI) / 180))], rot: [0, -d, 0], mat: "steel2" }));
P({ id: "fHBolt", layer: "fHeadT", shape: "cyl", size: [0.06, 0.04], rot: V, pos: [0, R2(HY + 0.62), 0], at: [22, 82, 142, 202, 262, 322].map((d) => [R2(HX0 + 0.95 * Math.cos((d * Math.PI) / 180)), 0, R2(HZ + 0.95 * Math.sin((d * Math.PI) / 180))]), mat: "steel2" });
LAY("fHeadM", [2.6, 0.3, HX0, HY + 0.1]);
VC("fHMem", "fHeadM", 1.05, HY + 0.06, HY + 0.14, "rubber", { x: HX0, z: HZ }); RING("fHRet", "fHeadM", 1.25, 1.05, HY, HY + 0.2, "darker", HX0, HZ);
P({ id: "fHRetG", layer: "fHeadM", shape: "box", size: [0.06, 0.2, 0.06], pos: [0, R2(HY + 0.1), 0], at: Array.from({ length: 12 }, (_, i) => { const r = (i * 30 * Math.PI) / 180; return [R2(HX0 + 1.25 * Math.cos(r)), 0, R2(HZ + 1.25 * Math.sin(r))]; }), mat: "steel2" });
LAY("fHeadW", [2.2, 0.1, HX0, HY + 0.03]);
wafer("fHw", "fHeadW", HX0, HY, HZ, 1.0, "wafer");
const HEADLIFT = 1.4, HEADSEP = { fHeadT: 1.2, fHeadM: 0.6 };
actions.fHSpin = { type: "rotate", _說明: "研磨頭與轉盤同向自轉（繞 −y）", parts: ["fHShaft", "fHBody", ...Array.from({ length: 8 }, (_, k) => `fHRib${k}`), "fHBolt", "fHMem", "fHRet", "fHRetG", "fHwW", "fHwN"], axis: [0, -1, 0], pivot: [HX0, HY, HZ].map(R2), rps: 0.7, rampSpin: true };
// 研磨液噴臂（後方）＋滴液（稠，細絲受重力加速落到墊上）→ 順著轉向從研磨頭保持環下面流過 → 從墊緣甩出、落在防濺擋圈內
BOX("fSlPost", "fCmp", FX - 3.4, FX - 3.1, FH, FH + 2.4, -2.4, -2.1, "steel");
P({ id: "fSlArm", layer: "fCmp", shape: "cyl", size: [0.12, 3.0], pos: [R2(FX - 1.85), R2(FH + 2.3), -2.25], rot: [0, 90, 0], mat: "steel2" });
VC("fSlNoz", "fCmp", 0.1, FH + 1.9, FH + 2.3, "dark", { x: FX - 0.4, z: -2.25 });
actions.fSlurry = { track: false, free: true, type: "flow", _說明: "研磨液（稠）由噴嘴滴下拉成細絲、加速落到墊上", path: [[FX - 0.4, FH + 1.88, -2.25], [FX - 0.4, PY + 0.4, -2.25]].map((a) => a.map(R2)), n: 4, size: 0.05, shape: "liquid", rate: 0.45, accel: true, color: "slurC", layer: "fCmp", trail: 8, trailGap: 0.02, band: 0.02, bandO: 0.6 };
actions.fSlSpread = { track: false, free: true, type: "flow", _說明: "墊子繞 −y 轉，研磨液被帶著從後方流到研磨頭、從保持環下面穿過、往外甩到墊緣", path: [[FX - 0.4, PY + 0.4, -2.25], [FX + 0.6, PY + 0.4, -1.9], [FX + 1.2, PY + 0.4, -0.7], [HX0, PY + 0.4, HZ], [FX + 2.1, PY + 0.4, 1.6], [FX + 2.5, PY + 0.4, 2.1]].map((a) => a.map(R2)), n: 9, size: 0.05, shape: "liquid", rate: 0.3, color: "slurC", layer: "fCmp", jitter: 0.04, band: 0.05, bandO: 0.3 };
actions.fSlFling = { track: false, free: true, type: "flow", _說明: "研磨液從墊緣甩出、受重力落到防濺擋圈內", path: [[FX + 2.5, PY + 0.4, 2.1], [FX + 2.65, PY + 0.3, 2.3], [FX + 2.72, PY + 0.06, 2.4]].map((a) => a.map(R2)), n: 3, size: 0.045, shape: "liquid", rate: 0.6, accel: true, color: "slurC", layer: "fCmp", band: 0.02, bandO: 0.4 };
// 鑽石修整器：擺臂＋盤
LAY("fCond", [3, 1.4, FX - 1.6, FH + 1]);
VC("fCdPost", "fCond", 0.2, FH, FH + 1.2, "steel", { x: FX - 3.4, z: 2.0 });
P({ id: "fCdArm", layer: "fCond", shape: "box", size: [2.0, 0.18, 0.25], pos: [R2(FX - 2.4), R2(FH + 1.1), 2.0], mat: "steel2" });
VC("fCdDisk", "fCond", 0.45, PY + 0.4, PY + 0.55, "steel2", { x: FX - 1.4, z: 2.0 }); VC("fCdHub", "fCond", 0.2, PY + 0.55, FH + 1.1, "dark", { x: FX - 1.4, z: 2.0 });
actions.fCdSwing = { type: "rotate", _說明: "修整器來回擺（兩端減速）", parts: idsOf("fCond").filter((q) => q !== "fCdPost"), axis: [0, 1, 0], pivot: [FX - 3.4, FH, 2.0].map(R2), swing: 22, freq: 0.35 };
// 刷洗＋檢查（右）＋出片輸送台
const GX = FX + 7.2;
LAY("fClean", [8.6, 4.4, GX + 2.2, 2.0]);
const GH = plinth("g", "fClean", GX, 0, 4.0, 4.4, 1.2);
const BRY = [R2(GH + 0.9), R2(GH + 1.58)];
BRY.forEach((y, k) => { P({ id: `fBr${k}`, layer: "fClean", shape: "cyl", size: [0.32, 3.0], pos: [GX, y, 0], rot: [0, 90, 0], mat: "brush" });
  P({ id: `fBrC${k}`, layer: "fClean", shape: "cyl", size: [0.1, 3.7], pos: [GX, y, 0], rot: [0, 90, 0], mat: "steel2" });
  P({ id: `fBrMot${k}`, layer: "fClean", shape: "cyl", size: [0.2, 0.45], pos: [R2(GX - 2.17), y, 0], rot: [0, 90, 0], mat: "darker" }); });
P({ id: "fBearing", layer: "fClean", shape: "box", size: [0.15, 0.3, 0.4], pos: [0, 0, 0], at: BRY.flatMap((y) => [[R2(GX - 1.67), y, 0], [R2(GX + 1.67), y, 0]]), mat: "dark" });
P({ id: "fCw", layer: "fClean", shape: "cyl", size: [1.0, 0.05], rot: V, pos: [GX, R2(GH + 1.24), 0], mat: "mirror" });
const ERA = [90, 210, 330].map((d) => [R2(GX + 1.1 * Math.cos((d * Math.PI) / 180)), R2(1.1 * Math.sin((d * Math.PI) / 180))]);
P({ id: "fEdgeRoll", layer: "fClean", shape: "cyl", size: [0.1, 0.2], rot: V, pos: [0, R2(GH + 1.24), 0], at: ERA.map(([x, z]) => [x, 0, z]), mat: "rubber" });
P({ id: "fEdgeStem", layer: "fClean", shape: "cyl", size: [0.04, 1.14], rot: V, pos: [0, R2(GH + 0.57), 0], at: ERA.map(([x, z]) => [x, 0, z]), mat: "steel" });
for (const sx of [-1, 1]) BOX(`fBrS${sx}`, "fClean", GX + sx * 1.85 - 0.1, GX + sx * 1.85 + 0.1, GH, GH + 3.0, -0.5, 0.5, "steel");
P({ id: "fNoz", layer: "fClean", shape: "cyl", size: [0.07, 0.3], rot: V, pos: [0, R2(GH + 2.2), 0.9], at: [[R2(GX - 0.8), 0, 0], [R2(GX), 0, 0], [R2(GX + 0.8), 0, 0]], mat: "steel2" });
BOX("fNozBar", "fClean", GX - 1.95, GX + 1.95, GH + 2.35, GH + 2.5, 0.8, 1.0, "steel");
P({ id: "fNozBrk", layer: "fClean", shape: "box", size: [0.2, 0.15, 0.3], pos: [0, R2(GH + 2.425), 0.65], at: [[R2(GX - 1.85), 0, 0], [R2(GX + 1.85), 0, 0]], mat: "steel" });
BOX("fInsp", "fClean", GX - 1.95, GX + 1.95, GH + 3.0, GH + 3.2, -0.2, 0.2, "dark");
P({ id: "fInspBrk", layer: "fClean", shape: "box", size: [0.05, 0.5, 0.4], pos: [0, R2(GH + 2.95), 0], at: [[R2(GX - 1.975), 0, 0], [R2(GX + 1.975), 0, 0]], mat: "steel2" });
LAY("fLight", [3, 0.3, GX, GH + 2.9]); BOX("fInspL", "fLight", GX - 1.3, GX + 1.3, GH + 2.94, GH + 3.0, -0.15, 0.15, "scan");
BOX("fConvL", "fClean", GX + 2.3, GX + 4.5, GH + 0.9, GH + 1.1, -1.15, -1.05, "steel"); BOX("fConvR", "fClean", GX + 2.3, GX + 4.5, GH + 0.9, GH + 1.1, 1.05, 1.15, "steel");
P({ id: "fConvLeg", layer: "fClean", shape: "box", size: [0.12, R2(GH + 0.9), 0.12], pos: [0, R2((GH + 0.9) / 2), 0], at: [[GX + 2.4, -1.1], [GX + 4.4, -1.1], [GX + 2.4, 1.1], [GX + 4.4, 1.1]].map(([x, z]) => [R2(x), 0, z]), mat: "steel2" });
P({ id: "fConvRoll", layer: "fClean", shape: "cyl", size: [0.08, 2.1], pos: [0, R2(GH + 1.0), 0], at: [0, 1, 2, 3, 4, 5].map((i) => [R2(GX + 2.55 + i * 0.38), 0, 0]), mat: "rubber" });
P({ id: "fConvW", layer: "fClean", shape: "cyl", size: [0.85, 0.05], rot: V, pos: [R2(GX + 3.5), R2(GH + 1.105), 0], mat: "mirror" });
actions.fBrush = { type: "rotate", parts: ["fBr0", "fBr1", "fBrC0", "fBrC1"], axis: [1, 0, 0], pivots: { fBr0: [GX, BRY[0], 0], fBrC0: [GX, BRY[0], 0], fBr1: [GX, BRY[1], 0], fBrC1: [GX, BRY[1], 0] }, rps: 1.2, rampSpin: true };
actions.fSpray = { track: false, free: true, type: "flow", _說明: "噴水：水受重力加速落到晶圓（落在刷輪外側的晶圓面上）", path: [[GX, GH + 2.05, 0.9], [GX, GH + 1.28, 0.58]].map((a) => a.map(R2)), n: 6, size: 0.06, shape: "liquid", rate: 0.9, accel: true, color: "liqC", layer: "fClean", band: 0.02, bandO: 0.35, lanes: 3, laneGap: 0.8, laneDir: [1, 0, 0] };
actions.fInspGlow = { type: "pulse", parts: ["fInspL"], color: "scanC", glow: 1, freq: 1.5, halo: 0 };

// ═════ 站 G：變薄對照（x 180）：五片晶圓側立，越來越薄（放大示意）＋測厚卡尺（夾著晶圓）＋淘汰箱 ═════
// r1（機構 r0 必改 9；物理建議）：卡尺裝在後方導軌的立架上、砧座夾住正在講的那片晶圓（間距＝厚度）；念到「薄一點」時抬起、移到下一片、游尺收進去再夾下；
//   最薄那片晶圓本體獨立一層，沿拋物線落進淘汰箱（支架留在原地）
const GX2 = 180;
LAY("gBase", [9.6, 1, GX2, 0.5]);
const GBH = plinth("gb", "gBase", GX2, 0, 9.4, 3.6, 0.8);
const TH = [0.9, 0.72, 0.55, 0.38, 0.2], GWX = TH.map((_, i) => R2(GX2 - 3.6 + i * 1.8)), GWY = R2(GBH + 1.6), GWR = 1.25;
TH.forEach((t, i) => { const x = GWX[i], L = `gW${i}`, LW = i === 4 ? "gW4D" : L; LAY(L, [2, 3, x, GBH + 1.4]); if (i === 4) LAY(LW, [1, 2.6, x, GWY]);
  BOX(`${L}St`, L, x - 0.5, x + 0.5, GBH, GBH + 0.2, -0.4, 0.4, "dark"); BOX(`${L}Sl`, L, x - 0.35, x + 0.35, GBH + 0.2, GBH + 0.45, -0.2, 0.2, "darker");
  P({ id: `${L}W`, layer: LW, shape: "cyl", size: [GWR, t], pos: [x, GWY, 0], rot: [0, 90, 0], mat: "mirror" });
  BOX(`${L}N`, LW, x - t / 2 - 0.01, x + t / 2 + 0.01, R2(GBH + 2.8), R2(GBH + 2.86), -0.06, 0.06, "darker"); });
// 卡尺：後方導軌（固定）＋滑車立柱（gCalCar）＋主尺／固定砧座／套筒（gCal）＋游尺／活動砧座／螢幕（gCalJ）
const CRZ = -1.55, CPX = R2(GWX[0] - 0.9), CSY = R2(GBH + 3.2), CJY = R2(GBH + 2.55);
BOX("gRail", "gBase", GX2 - 4.5, GX2 - 0.6, GBH, GBH + 0.08, CRZ - 0.12, CRZ + 0.12, "steel2");
LAY("gCalCar", [1, 4, CPX, GBH + 2]);
BOX("gCarB", "gCalCar", CPX - 0.3, CPX + 0.3, GBH + 0.08, GBH + 0.28, CRZ - 0.2, CRZ + 0.2, "dark");
BOX("gCarPost", "gCalCar", CPX - 0.06, CPX + 0.06, GBH + 0.28, GBH + 4.4, CRZ - 0.06, CRZ + 0.06, "steel");
LAY("gCal", [3.8, 1.2, GWX[0] + 0.8, CSY]);
BOX("gCalSl", "gCal", CPX - 0.11, CPX + 0.11, CSY - 0.1, CSY + 0.4, CRZ - 0.11, CRZ + 0.11, "darker");
BOX("gCalBr", "gCal", CPX - 0.05, CPX + 0.05, CSY, CSY + 0.2, CRZ + 0.11, 0, "steel2");
BOX("gCalM", "gCal", CPX, GWX[0] + 2.4, CSY, CSY + 0.2, -0.06, 0.06, "steel2");
P({ id: "gCalTk", layer: "gCal", shape: "box", size: [0.02, 0.1, 0.01], pos: [0, R2(CSY + 0.12), 0.065], at: Array.from({ length: 30 }, (_, i) => [R2(CPX + 0.2 + i * 0.1), 0, 0]), mat: "darker" });
BOX("gCalJ0", "gCal", GWX[0] - TH[0] / 2 - 0.12, GWX[0] - TH[0] / 2, CJY, CSY, -0.06, 0.06, "steel");
LAY("gCalJ", [1.2, 1, GWX[0] + 0.6, CSY]);
BOX("gCalJ1", "gCalJ", GWX[0] + TH[0] / 2, GWX[0] + TH[0] / 2 + 0.12, CJY, CSY, -0.06, 0.06, "steel");
BOX("gCalV", "gCalJ", GWX[0] + TH[0] / 2, GWX[0] + TH[0] / 2 + 0.9, CSY - 0.05, CSY + 0.3, -0.1, -0.06, "steel");
BOX("gCalV2", "gCalJ", GWX[0] + TH[0] / 2, GWX[0] + TH[0] / 2 + 0.9, CSY - 0.05, CSY + 0.3, 0.06, 0.1, "steel");
BOX("gCalScr", "gCalJ", GWX[0] + TH[0] / 2 + 0.3, GWX[0] + TH[0] / 2 + 0.8, CSY, CSY + 0.22, 0.1, 0.12, "screen");
const CAL_LIFT = 0.75, CAL_DX = R2(GWX[1] - GWX[0] + (TH[0] - TH[1]) / 2), CAL_DXJ = R2(GWX[1] - GWX[0] - (TH[0] - TH[1]) / 2);
// 淘汰箱（最右前，地上）
LAY("gBin", [2, 1.2, GX2 + 5.7, 0.6]);
BOX("gBinB", "gBin", GX2 + 4.9, GX2 + 6.5, 0, 0.12, -1.5, 1.5, "darker");
for (const [id, a, b, c, d] of [["gBinF", GX2 + 4.9, GX2 + 6.5, 1.44, 1.5], ["gBinK", GX2 + 4.9, GX2 + 6.5, -1.5, -1.44], ["gBinL", GX2 + 4.9, GX2 + 4.96, -1.5, 1.5], ["gBinR", GX2 + 6.44, GX2 + 6.5, -1.5, 1.5]]) BOX(id, "gBin", a, b, 0, 1.0, c, d, "lampR");
BOX("gBinTag", "gBin", GX2 + 5.3, GX2 + 6.1, 0.35, 0.75, 1.5, 1.52, "white");

// ═════ 站 H：再生廠（x 210）：外牆接縫、窗、百葉、屋頂空調箱、屋頂名牌（貼圖文字）、卸貨門、右側化學品槽＋管架 ═════
// r1（機構 r0 必改 10d、細節表 14）：廠房縮窄，化學品槽和管架移到畫面內；名牌改成看得懂的字「再生晶圓廠（示意）」；3D 國旗拿掉（國旗在 2D 卡上照官方比例畫）
const HX = 210;
const SIGNS = [["reclaimfab", "再生晶圓廠|（示意）"]];
{ const r = spawnSync("node", [path.join(HERE, "..", "..", "scripts", "three", "make-brand-tex.mjs"), "tech-reclaim", ...SIGNS.map(([id, t]) => `text:${id}=${t}`)], { encoding: "utf8" }); if (r.status !== 0) { console.error(r.stdout, r.stderr); process.exit(1); } }
materials.t_reclaimfab = { kind: "unlit", color: "#FFFFFF", img: "tex/brand/sign-reclaimfab.png" };
const HW0 = HX - 6.5, HW1 = HX + 3.5;
LAY("hFab", [12.6, 6.2, HX - 1.0, 3.0]);
BOX("hBody", "hFab", HW0, HW1, 0, 4.2, -3, 1.4, "panel");
BOX("hRoof", "hFab", HW0 - 0.1, HW1 + 0.1, 4.2, 4.35, -3.1, 1.5, "roof");
BOX("hBand", "hFab", HW0, HW1, 3.3, 3.6, 1.4, 1.43, "band");
P({ id: "hWin", layer: "hFab", shape: "box", size: [0.9, 0.7, 0.03], pos: [0, 2.6, 1.43], at: Array.from({ length: 7 }, (_, i) => [R2(HW0 + 0.9 + i * 1.35), 0, 0]), mat: "win" });
P({ id: "hSeam", layer: "hFab", shape: "box", size: [0.03, 4.15, 0.03], pos: [0, 2.1, 1.42], at: Array.from({ length: 13 }, (_, i) => [R2(HW0 + 0.4 + i * 0.77), 0, 0]), mat: "seam" });
P({ id: "hLouv", layer: "hFab", shape: "box", size: [0.6, 0.04, 0.03], pos: [0, 0, 1.44], at: Array.from({ length: 8 }, (_, i) => [R2(HX + 0.4 + (i % 4) * 0.75), R2(1.2 + Math.floor(i / 4) * 0.14), 0]), mat: "dark" });
const RU = [[HX - 5.6, -1.6], [HX - 4.4, -1.6], [HX - 3.2, -1.6], [HX + 2.4, -1.6]];
P({ id: "hRoofU", layer: "hFab", shape: "box", size: [1.0, 0.5, 1.0], pos: [0, 4.6, 0], at: RU.map(([x, z]) => [R2(x), 0, z]), mat: "roof" });
P({ id: "hRoofF", layer: "hFab", shape: "cyl", size: [0.38, 0.06], rot: V, pos: [0, 4.88, 0], at: RU.map(([x, z]) => [R2(x), 0, z]), mat: "darker" });
P({ id: "hDock", layer: "hFab", shape: "box", size: [1.2, 1.3, 0.04], pos: [0, 0.65, 1.43], at: [[HX - 2.4, 0, 0], [HX - 0.9, 0, 0]].map((a) => a.map(R2)), mat: "seam" });
// 屋頂名牌：兩根支柱＋背板＋文字貼圖（760×320）
P({ id: "hSignPost", layer: "hFab", shape: "box", size: [0.12, 1.75, 0.12], pos: [0, 5.22, 0.85], at: [[R2(HX - 2.6), 0, 0], [R2(HX + 0.6), 0, 0]], mat: "steel" });
BOX("hSignBk", "hFab", HX - 2.95, HX + 0.95, 4.5, 6.1, 0.92, 0.98, "band");
P({ id: "hSign", layer: "hFab", shape: "plane", size: [3.8, 1.6], pos: [R2(HX - 1.0), 5.3, 0.99], mat: "t_reclaimfab", uv01: true });
// 化學品槽＋管架（廠房右側）
const TKX = HX + 4.7;
P({ id: "hTank", layer: "hFab", shape: "cyl", size: [0.45, 2.0], rot: V, pos: [0, 1.05, 0], at: [[TKX, 0, -2.2], [TKX, 0, -1.0]].map((a) => a.map(R2)), mat: "steel2" });
P({ id: "hTankBand", layer: "hFab", shape: "cyl", size: [0.46, 0.14], rot: V, pos: [0, 1.6, 0], at: [[TKX, 0, -2.2], [TKX, 0, -1.0]].map((a) => a.map(R2)), mat: "mark" });
P({ id: "hTankB", layer: "hFab", shape: "box", size: [1.2, 0.05, 2.6], pos: [R2(TKX), 0.03, -1.6], mat: "dark" });
P({ id: "hPipe", layer: "hFab", shape: "cyl", size: [0.08, R2(TKX - HW1)], rot: [0, 90, 0], pos: [R2((TKX + HW1) / 2), 2.4, -1.6], mat: "steel2" });
P({ id: "hPipe2", layer: "hFab", shape: "cyl", size: [0.07, R2(TKX - 0.5 - HW1)], rot: [0, 90, 0], pos: [R2((TKX - 0.5 + HW1) / 2), 2.62, -1.6], mat: "steel2" });
P({ id: "hPipeH", layer: "hFab", shape: "cyl", size: [0.08, 1.2], pos: [R2(TKX), 2.4, -1.6], mat: "steel2" });
P({ id: "hPipeD", layer: "hFab", shape: "cyl", size: [0.07, 0.35], rot: V, pos: [R2(TKX), 2.23, 0], at: [[0, 0, -2.2], [0, 0, -1.0]], mat: "steel2" });
BOX("hRack", "hFab", TKX - 0.6, TKX - 0.4, 0, 2.7, -1.7, -1.5, "steel"); BOX("hRackT", "hFab", TKX - 0.7, TKX - 0.3, 2.7, 2.76, -1.8, -1.4, "steel");

// ═════ 站 N：密封盒運送（x 240）：盒體（透明看到晶圓）、前門（鉸鏈；開著→念到灰塵關上）、門窗、門四周 O 形環、頂部吊掛法蘭、側把手、台車；地上軌道；灰塵被擋在外 ═════
// r1（機構 r0 必改 10a、11、細節表 15；物理 r0 必改 9）
const NX = 240, NTR0 = NX - 7.0, NTR1 = NX + 4.5;
LAY("nTrack", [12, 0.5, (NTR0 + NTR1) / 2, 0.2]);
P({ id: "nRail", layer: "nTrack", shape: "box", size: [R2(NTR1 - NTR0), 0.12, 0.18], pos: [R2((NTR0 + NTR1) / 2), 0.14, 0], at: [[0, 0, -0.9], [0, 0, 0.9]], mat: "steel2" });
P({ id: "nTie", layer: "nTrack", shape: "box", size: [0.3, 0.08, 2.4], pos: [0, 0.05, 0], at: Array.from({ length: 12 }, (_, i) => [R2(NTR0 + 0.25 + i), 0, 0]), mat: "dark" });
LAY("nBox", [4.6, 4.6, NX - 4, 2.6]);
const NB = NX - 4, NY0 = 0.6;
BOX("nCart", "nBox", NB - 1.8, NB + 1.8, 0.32, NY0, -1.3, 1.3, "darker");
P({ id: "nWheelBr", layer: "nBox", shape: "box", size: [0.12, 0.2, 0.3], pos: [0, 0.32, 0], at: [[NB - 1.3, 0, -0.9], [NB + 1.3, 0, -0.9], [NB - 1.3, 0, 0.9], [NB + 1.3, 0, 0.9]].map((a) => a.map(R2)), mat: "steel" });
P({ id: "nWheel", layer: "nBox", shape: "cyl", size: [0.12, 0.1], pos: [0, 0.32, 0], rot: [0, 90, 0], at: [[NB - 1.3, -0.12, -0.9], [NB + 1.3, -0.12, -0.9], [NB - 1.3, -0.12, 0.9], [NB + 1.3, -0.12, 0.9]].map((a) => a.map(R2)), mat: "rubber" });
BOX("nCartH", "nBox", NB - 2.05, NB - 1.95, NY0 - 0.25, NY0 + 0.9, -0.9, -0.8, "steel2"); BOX("nCartH2", "nBox", NB - 2.05, NB - 1.95, NY0 - 0.25, NY0 + 0.9, 0.8, 0.9, "steel2");
BOX("nCartHT", "nBox", NB - 2.08, NB - 1.92, NY0 + 0.85, NY0 + 0.95, -0.9, 0.9, "rubber"); BOX("nCartHB", "nBox", NB - 1.95, NB - 1.8, NY0 - 0.2, NY0 - 0.05, -0.9, 0.9, "steel2");
BOX("nShell", "nBox", NB - 1.7, NB + 1.7, NY0, NY0 + 3.2, -1.5, 1.4, "box");
P({ id: "nEdgeV", layer: "nBox", shape: "box", size: [0.06, 3.2, 0.06], pos: [0, R2(NY0 + 1.6), 0], at: [[NB - 1.7, 0, -1.5], [NB + 1.7, 0, -1.5], [NB - 1.7, 0, 1.4], [NB + 1.7, 0, 1.4]].map((a) => a.map(R2)), mat: "boxS" });
P({ id: "nEdgeX", layer: "nBox", shape: "box", size: [3.4, 0.06, 0.06], pos: [NB, 0, 0], at: [[0, NY0, -1.5], [0, NY0, 1.4]].map((a) => a.map(R2)), mat: "boxS" });
P({ id: "nEdgeZ", layer: "nBox", shape: "box", size: [0.06, 0.06, 2.9], pos: [0, NY0, -0.05], at: [[NB - 1.7, 0, 0], [NB + 1.7, 0, 0]].map((a) => a.map(R2)), mat: "boxS" });
BOX("nShellT", "nBox", NB - 1.75, NB + 1.75, NY0 + 3.2, NY0 + 3.35, -1.55, 1.45, "boxS");
BOX("nFlange", "nBox", NB - 0.8, NB + 0.8, NY0 + 3.55, NY0 + 3.7, -0.8, 0.8, "boxS"); VC("nFlPost", "nBox", 0.25, NY0 + 3.35, NY0 + 3.55, "boxS", { x: NB });
P({ id: "nFlBolt", layer: "nBox", shape: "cyl", size: [0.06, 0.04], rot: V, pos: [0, R2(NY0 + 3.72), 0], at: [[NB - 0.6, 0, -0.6], [NB + 0.6, 0, -0.6], [NB - 0.6, 0, 0.6], [NB + 0.6, 0, 0.6]].map((a) => a.map(R2)), mat: "steel2" });
for (const sx of [-1, 1]) BOX(`nHdl${sx}`, "nBox", NB + sx * 1.75 - 0.08, NB + sx * 1.75 + 0.08, NY0 + 1.6, NY0 + 2.0, -0.8, 0.8, "dark");
for (let i = 0; i < 6; i++) VC(`nW${i}`, "nBox", 1.25, R2(NY0 + 0.5 + i * 0.42), R2(NY0 + 0.54 + i * 0.42), "mirror", { x: NB, z: -0.1 });
P({ id: "nRib", layer: "nBox", shape: "box", size: [0.15, 0.04, 2.0], pos: [0, 0, -0.1], at: Array.from({ length: 12 }, (_, i) => [R2(NB + (i % 2 ? 1.45 : -1.45)), R2(NY0 + 0.46 + Math.floor(i / 2) * 0.42), 0]), mat: "boxS" });
const HGX = NB + 1.75, HGZ = 1.55;
P({ id: "nHinge", layer: "nBox", shape: "cyl", size: [0.07, 0.4], rot: V, pos: [R2(HGX + 0.02), 0, HGZ], at: [[0, NY0 + 0.6, 0], [0, NY0 + 2.6, 0]].map((a) => a.map(R2)), mat: "steel" });
// 前門：外框四條＋中間透明窗＋窗框＋門閂＋門四周 O 形環
LAY("nDoor", [3.6, 3.4, NB, NY0 + 1.6]);
const DY0 = NY0 - 0.05, DY1 = NY0 + 3.25;
BOX("nDoorT", "nDoor", NB - 1.75, NB + 1.75, DY1 - 0.55, DY1, 1.4, 1.55, "boxS"); BOX("nDoorB", "nDoor", NB - 1.75, NB + 1.75, DY0, DY0 + 0.7, 1.4, 1.55, "boxS");
BOX("nDoorL", "nDoor", NB - 1.75, NB - 1.0, DY0 + 0.7, DY1 - 0.55, 1.4, 1.55, "boxS"); BOX("nDoorR", "nDoor", NB + 1.0, NB + 1.75, DY0 + 0.7, DY1 - 0.55, 1.4, 1.55, "boxS");
BOX("nDoorWin", "nDoor", NB - 1.0, NB + 1.0, DY0 + 0.7, DY1 - 0.55, 1.44, 1.5, "glass");
P({ id: "nDoorWF", layer: "nDoor", shape: "ring", size: [2.1, R2(DY1 - DY0 - 1.15), 0.06], wall: 0.08, pos: [NB, R2((DY0 + 0.7 + DY1 - 0.55) / 2), 1.56], mat: "dark" });
P({ id: "nLatch", layer: "nDoor", shape: "cyl", size: [0.2, 0.06], pos: [0, R2(DY0 + 0.35), 1.58], at: [[R2(NB - 0.9), 0, 0], [R2(NB + 0.9), 0, 0]], mat: "dark" });
P({ id: "nLatchK", layer: "nDoor", shape: "box", size: [0.3, 0.06, 0.04], pos: [0, R2(DY0 + 0.35), 1.62], at: [[R2(NB - 0.9), 0, 0], [R2(NB + 0.9), 0, 0]], mat: "steel2" });
BOX("nDoorSealT", "nDoor", NB - 1.65, NB + 1.65, DY1 - 0.18, DY1 - 0.1, 1.37, 1.4, "rubber"); BOX("nDoorSealB", "nDoor", NB - 1.65, NB + 1.65, DY0 + 0.1, DY0 + 0.18, 1.37, 1.4, "rubber");
BOX("nDoorSealL", "nDoor", NB - 1.65, NB - 1.57, DY0 + 0.1, DY1 - 0.1, 1.37, 1.4, "rubber"); BOX("nDoorSealR", "nDoor", NB + 1.57, NB + 1.65, DY0 + 0.1, DY1 - 0.1, 1.37, 1.4, "rubber");
actions.nDoorSwing = { type: "rotate", _說明: "前門繞右側鉸鏈打開（往外轉 100°）；until 後轉回來關上（加減速）", parts: idsOf("nDoor"), axis: [0, 1, 0], pivot: [R2(HGX), R2(NY0 + 1.6), HGZ], angle: 100 };
// 灰塵：在盒外飄，靠近前門時減速、貼著門面（z＝1.68）滑走，進不去
actions.nDust = { track: false, free: true, type: "flow", _說明: "灰塵在盒外飄，碰到門面減速、沿表面滑走、進不去", path: [[NB - 4.0, 3.0, 3.6], [NB - 1.6, 2.4, 2.2], [NB - 0.6, 2.1, 1.7], [NB + 0.6, 1.9, 1.68], [NB + 1.5, 1.8, 1.7], [NB + 3.2, 1.5, 2.8]].map((a) => a.map(R2)), n: 12, size: 0.07, shape: "grit", rate: 0.22, color: "dustC", layer: "nTrack", jitter: 0.08, lanes: 3, laneGap: 0.45, laneDir: [0, 1, 0] };
// 兩端示意：左晶圓廠小樓、右再生廠小樓
const NEL = NX - 8.7, NER = NX + 6.6;
LAY("nEnds", [18.6, 3, (NEL + NER) / 2, 1.5]);
for (const [id, x] of [["nFabL", NEL], ["nFabR", NER]]) { BOX(`${id}B`, "nEnds", x - 1.6, x + 1.6, 0, 2.6, -2.6, -1.3, "panel"); BOX(`${id}R`, "nEnds", x - 1.65, x + 1.65, 2.6, 2.72, -2.65, -1.25, "roof");
  P({ id: `${id}W`, layer: "nEnds", shape: "box", size: [0.6, 0.4, 0.03], pos: [0, 1.7, -1.28], at: [[R2(x - 0.8), 0, 0], [R2(x + 0.8), 0, 0]], mat: "win" }); BOX(`${id}D`, "nEnds", x - 0.5, x + 0.5, 0, 1.1, -1.3, -1.27, "seam"); }

// 標註點
Object.assign(anchors, {
  aTestA: A("aTest", [AX + 2.0, AY0 + 6 * ASP + 0.05, 1.0], 150, -100), aProdA: A("aCas", [AX - 1.6, AY0 + 2 * ASP + 0.08, 0.6], -150, 80),
  bChA: A("bTool", [CX0 + 0.5, CY0 + 2.6, 2.0], -150, -100), bFilmA: A("bMW", [MX + 1.2, MWY + 0.04, 1.0], 150, 100), bBeamA: A("bMet", [MX + 1.9, MWY + 2.2, 0.3], 220, -180), bScanA: A("bScan", [MX, MWY + 0.08, 1.6], -230, 170),
  cJacketA: A("cJacketL", [CX - 2.2, TT - 1.0, 1.0], -150, -100), cDummyA: A("cDummy", [CX + 1.5, BW0 + 1 * BSP, 0.3], 150, 80), cProdA: A("cBoat", [CX + 1.5, BW0 + 8 * BSP, 0.3], 150, -60), cCoilA: A("cTube", [CX - 2.05, TB + 3.0, 0.3], -150, -60),
  dSiA: A("dSi", [DX - 2.4, DY + 0.16, 0.3], -150, 80), dOxA: A("dOx", [DX + 2.38, DLY.dOx + 0.06, 0.3], 150, 0), dNitA: A("dNit", [DX - 2.38, DLY.dNit + 0.05, 0.3], -150, -40), dMetA: A("dMet", [DX + 2.0, DLY.dMet + 0.1, 0.6], 150, -100),
  eTankA: A("eBench", [TX0, TY1 - 0.8, TZ1], -150, -60), eBasketA: A("eLift", [EX + KX, KY + 1.6, KZ], 150, -100),
  fPadA: A("fPlaten", [FX - 2.0, PY + 0.38, 1.6], -150, 80), fHwA: A("fHeadW", [HX0 + 0.9, HY + 0.06, HZ + 0.3], 150, 60), fHMemA: A("fHeadM", [HX0 + 1.25, HY + 0.12, HZ], 150, -40), fHTopA: A("fHeadT", [HX0 + 1.2, HY + 0.45, HZ], 150, -100), fBrushA: A("fClean", [GX + 1.5, GH + 1.6, 0.3], 150, -100),
  gW4A: A("gW4D", [GX2 - 3.6 + 4 * 1.8, GBH + 2.85, 0], 150, -100), gW0A: A("gW0", [GX2 - 3.6, GBH + 2.85, 0], -150, -100), gBinA: A("gBin", [GX2 + 5.7, 1.0, 1.5], 150, -60), gCalA: A("gCal", [GWX[0] + 1.6, CSY + 0.2, 0.06], 150, -100),
  hFabA: A("hFab", [HX - 4.0, 2.6, 1.43], -150, -100),
  nBoxA: A("nBox", [NB + 1.7, NY0 + 2.6, 1.4], 150, -100), nDoorA: A("nDoor", [NB - 1.3, NY0 + 1.2, 1.55], -150, 80),
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
  info: { AX, BX, MX: R2(MX), CHX: XC, CX, SCAN_AMP, SCAN_F, DUSTX, HEADLIFT, HEADSEP, CAL_LIFT, CAL_DX, CAL_DXJ, GWX, NTR0, NTR1, NEL, NER, HGX, TB: R2(TB), TT: R2(TT), BB: R2(BB), BOATUP, DX, DY: R2(DY), EX, LUP, FX, HX0: R2(HX0), GX: R2(GX), GX2, HX, NX, NB },
};
fs.writeFileSync(path.join(HERE, "model.json"), JSON.stringify(model, null, 1) + "\n");
console.log(`✔ model.json：${parts.length} 個零件、${parts.reduce((a, p) => a + Math.max(1, p.at?.length ?? 0), 0)} 個實體、${layers.length} 層`);

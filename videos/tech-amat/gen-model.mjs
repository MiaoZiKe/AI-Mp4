// node videos/tech-amat/gen-model.mjs → 寫 videos/tech-amat/model.json
// 2026/11/26 tech-amat（設備五大-2：應用材料，沉積與離子佈植）。構造照 physics-spec.md、模組清單照 visual-spec.md。
// 單位：1＝10 cm（晶圓直徑 300 mm＝3），地板 y＝0，x 向右、z 向觀眾。配置與比例是示意，不仿特定機型。
// ① 集群平台（俯視八角形）：中央真空傳送腔（八面，每面一道閘閥）＋真空手臂（兩節＋腕＋刀片，model.kin.vr 關節鏈）
//    前面兩個負載鎖、兩側兩個小腔（脫氣／冷卻）、後面四個製程腔：濺鍍 PVD（銅靶）、化學氣相沉積 CVD、原子層沉積 ALD、濺鍍 PVD（鈦靶）
//    前端：大氣端 EFEM（頂上風扇過濾機組）、大氣手臂、對準器、兩個裝載埠＋晶圓盒 FOUP
// ② 離子佈植機（另一台，x 30～62）：離子源 → 引出電極 → 分析磁鐵（90° 扇形）→ 質量解析縫 → 加速管 → 掃描 → 終端站（傾斜平台）
import fs from "node:fs";
import path from "node:path";

const R2 = (x) => Math.round(x * 1000) / 1000;
const D2R = Math.PI / 180;
const pol = (aDeg, r) => [R2(r * Math.cos(aDeg * D2R)), R2(r * Math.sin(aDeg * D2R))]; // (x, z)

const palette = {
  floorC: "#C9D2DE", panel: "#F3F5F8", panel2: "#E2E8F0", seam: "#8E9BB0", band: "#24324C", steel: "#7D8CA6", steel2: "#A9B5C7", dark: "#3E4A60",
  stage: "#8FA3C4", vessel: "#DDE7F6", glassC: "#BFD3F2", copper: "#D98A3D", cu: "#C8743A", ti: "#B9C0CA", waferC: "#5F7FB8", dieC: "#7FA4E0",
  lampY: "#F2B632", lampG: "#2FBF71", screen: "#5B8DEF", pipeB: "#3E7BD6", foupC: "#5A6474", magN: "#E5484D", magS: "#2F6FE0",
  plasma: "#A78BFA", plasmaHot: "#C4B5FD", ar: "#8B5CF6", atomCu: "#E08A4A", atomTi: "#9AA6B8", gasA: "#F08A3C", gasB: "#06B6D4", purge: "#C8D0DB",
  heater: "#E5484D", filmCu: "#D9894E", filmA: "#2BA39A", filmC: "#E3A63A", ffuAir: "#9CC8F0",
  ionSel: "#38BDF8", ionLight: "#A3E635", ionHeavy: "#F472B6", beam: "#7DD3FC", srcGlow: "#C084FC", coil: "#D98A3D", insul: "#EDE7DA",
};
const M = (kind, color, o = {}) => ({ kind, color, ...o });
const materials = {
  floor: M("std", "floorC", { rough: 0.7, metal: 0.3, tex: "brushed", texScale: 3 }),
  panel: M("std", "panel", { rough: 0.55, metal: 0.05, env: 0.25 }), panel2: M("std", "panel2", { rough: 0.6, metal: 0.05, env: 0.2 }),
  seam: M("std", "seam", { rough: 0.6, metal: 0.3 }), band: M("std", "band", { rough: 0.4, metal: 0.3, env: 0.4 }),
  steel: M("std", "steel", { rough: 0.35, metal: 0.85, env: 0.5 }), steel2: M("std", "steel2", { rough: 0.3, metal: 0.8, env: 0.6, tex: "brushed", texScale: 2 }),
  dark: M("std", "dark", { rough: 0.5, metal: 0.4, env: 0.3 }), stage: M("std", "stage", { rough: 0.45, metal: 0.5, tex: "brushed", texScale: 2.2, env: 0.4 }),
  glass: M("phys", "glassC", { rough: 0.1, metal: 0, clearcoat: 0.8, opacity: 0.16, env: 0.3 }),
  window: M("phys", "glassC", { rough: 0.05, metal: 0, clearcoat: 1, opacity: 0.45, env: 0.6 }),
  copper: M("std", "copper", { rough: 0.35, metal: 0.9, env: 0.6 }), cu: M("std", "cu", { rough: 0.3, metal: 0.9, env: 0.8 }), ti: M("std", "ti", { rough: 0.25, metal: 0.9, env: 0.9 }),
  dieM: M("std", "dieC", { rough: 0.25, metal: 0.5, env: 0.8 }),
  wafer: M("phys", "waferC", { rough: 0.15, metal: 0.6, clearcoat: 0.9, env: 0.9 }),
  lampY: M("std", "lampY", { emissive: "lampY", ei: 0.4, rough: 0.4, metal: 0 }), lampG: M("std", "lampG", { emissive: "lampG", ei: 0.3, rough: 0.4, metal: 0 }),
  screen: M("std", "screen", { emissive: "screen", ei: 0.5, rough: 0.3, metal: 0 }), pipeB: M("std", "pipeB", { rough: 0.35, metal: 0.6, env: 0.4 }),
  foup: M("phys", "foupC", { rough: 0.3, metal: 0, clearcoat: 0.5, env: 0.3 }), foupDoor: M("std", "panel2", { rough: 0.5, metal: 0 }),
  magN: M("std", "magN", { rough: 0.4, metal: 0.3 }), magS: M("std", "magS", { rough: 0.4, metal: 0.3 }),
  glow: M("std", "plasma", { emissive: "plasma", ei: 1, opacity: 0.42, rough: 1, metal: 0 }),
  glowHot: M("std", "plasmaHot", { emissive: "plasmaHot", ei: 1, opacity: 0.85, rough: 1, metal: 0 }),
  glowFaint: M("std", "plasma", { emissive: "plasma", ei: 0.9, opacity: 0.42, rough: 1, metal: 0 }),
  ero: M("std", "dark", { rough: 0.8, metal: 0.2 }),
  heaterM: M("std", "heater", { emissive: "heater", ei: 0.35, rough: 0.6, metal: 0.2 }),
  filmCu: M("std", "filmCu", { rough: 0.3, metal: 0.8, env: 0.8 }), filmA: M("std", "filmA", { rough: 0.3, metal: 0.3, env: 0.6 }), filmC: M("std", "filmC", { rough: 0.35, metal: 0.3, env: 0.6 }),
  coil: M("std", "coil", { rough: 0.35, metal: 0.9, env: 0.6 }), insul: M("std", "insul", { rough: 0.6, metal: 0 }),
  srcGlow: M("std", "srcGlow", { emissive: "srcGlow", ei: 0.9, opacity: 0.55, rough: 1, metal: 0 }),
  beamM: M("std", "beam", { emissive: "beam", ei: 0.9, opacity: 0.22, rough: 1, metal: 0 }),
  t_amat: { kind: "unlit", color: "#FFFFFF", img: "tex/brand/sign-amat.png" }, t_us: { kind: "unlit", color: "#FFFFFF", img: "tex/brand/flag-US.png" },
};
const parts = [], layers = [], anchors = {}, actions = {};
const P = (o) => { parts.push(o); return o; };
// 長條斜放的方塊拆成幾段（同材質重疊，畫面上看是一整條）：關節鏈穿模檢查用包圍盒，斜長條的盒子會被放大很多（docs/three-parts.md 第五節）
const SEG = (o, ax, n) => {
  const th = ((o.rot?.[1] ?? 0) * Math.PI) / 180, dir = ax === 0 ? [Math.cos(th), 0, -Math.sin(th)] : [Math.sin(th), 0, Math.cos(th)];
  const L = o.size[ax], l = L / n, base = o.at ?? [[0, 0, 0]], at = [];
  for (const b of base) for (let i = 0; i < n; i++) { const u = (i - (n - 1) / 2) * l; at.push([R2((b[0] ?? 0) + dir[0] * u), R2(b[1] ?? 0), R2((b[2] ?? 0) + dir[2] * u)]); }
  const size = [...o.size]; size[ax] = R2(l * 1.04);
  return P({ ...o, size, at });
};
const LAY = (id, outline, bg) => layers.push({ id, z: 0, k: 0, outline, ...(bg ? { bg: true } : {}) });
const V = [90, 0, 0]; // 圓柱立起來（軸＝y）

// ═════ 地板 ═════
LAY("floor", [110, 2, 22, -0.3], true);
P({ id: "floor", layer: "floor", shape: "slab", size: [110, 0.5, 52], r: 0.2, pos: [22, -0.25, 2], mat: "floor" });
P({ id: "floorSeam", layer: "floor", shape: "slab", size: [110, 0.04, 0.1], pos: [22, 0.01, 0], at: Array.from({ length: 9 }, (_, i) => [0, 0, -22 + i * 6]), mat: "seam" });

// ═════ 集群平台 ═════
const AP = 6.6, CR = AP / Math.cos(22.5 * D2R), SIDE = 2 * AP * Math.tan(22.5 * D2R); // 八角形：邊心距 6、外接半徑、邊長
const oct = (r) => Array.from({ length: 8 }, (_, i) => pol(i * 45, r));
const yW = 6.58, WT = 0.08;                     // 晶圓中心高度、厚度（全程搬運高度）
const FACETS = { llR: 67.5, llL: 112.5, cool: 22.5, degas: 157.5, pvd: -22.5, cvd: -67.5, ald: -112.5, pvd2: -157.5 };
// 主機底座＋傳送腔（tc：底板、八面牆（中間留閘閥口 y5.9–7.0）、內部）＋頂蓋（tcLid：觀察窗、把手）
LAY("main", [16, 5, 0, 2.6]); LAY("tc", [13, 3, 0, 6.5]); LAY("tcLid", [13, 1, 0, 8.3]);
P({ id: "mainBase", layer: "main", shape: "poly", pts: oct(CR - 0.4), size: [1, 1, 4.6], rot: V, pos: [0, 2.6, 0], mat: "panel2" });
P({ id: "mainBand", layer: "main", shape: "poly", pts: oct(CR - 0.3), size: [1, 1, 0.5], rot: V, pos: [0, 4.6, 0], mat: "band" });
P({ id: "mainFeet", layer: "main", shape: "cyl", size: [0.35, 0.5], rot: V, pos: [0, 0.25, 0], at: oct(CR - 1.2).map(([x, z]) => [x, 0, z]), mat: "dark" });
P({ id: "tcFloor", layer: "tc", shape: "poly", pts: oct(CR), size: [1, 1, 0.3], rot: V, pos: [0, 5.15, 0], mat: "band" });
for (let i = 0; i < 8; i++) {
  const a = 22.5 + i * 45, [x, z] = pol(a, AP - 0.18);
  SEG({ id: `tcWallLo${i}`, layer: "tc", shape: "box", size: [0.36, 0.6, SIDE], rot: [0, -a, 0], pos: [x, 5.6, z], mat: "steel2" }, 2, 10);
  SEG({ id: `tcWallHi${i}`, layer: "tc", shape: "box", size: [0.36, 1.0, SIDE], rot: [0, -a, 0], pos: [x, 7.5, z], mat: "steel2" }, 2, 10);
}
P({ id: "tcPost", layer: "tc", shape: "box", size: [0.5, 2.7, 0.5], pos: [0, 6.65, 0], at: oct(CR + 0.15).map(([x, z]) => [x, 0, z]), mat: "steel" });
P({ id: "tcLid", layer: "tcLid", shape: "poly", pts: oct(CR + 0.1), size: [1, 1, 0.45], rot: V, pos: [0, 8.25, 0], mat: "steel2" });
P({ id: "tcWin", layer: "tcLid", shape: "cyl", size: [2.2, 0.2], rot: V, pos: [0, 8.55, 0], mat: "window" });
P({ id: "tcWinRing", layer: "tcLid", shape: "tube", size: [2.6, 2.2, 0.3], rot: V, pos: [0, 8.6, 0], mat: "steel" });
P({ id: "tcBolts", layer: "tcLid", shape: "cyl", size: [0.12, 0.3], rot: V, pos: [0, 8.6, 0], at: Array.from({ length: 16 }, (_, i) => { const [x, z] = pol(i * 22.5, 2.4); return [x, 0, z]; }), mat: "dark" });
P({ id: "tcHandle", layer: "tcLid", shape: "box", size: [1.6, 0.3, 0.3], pos: [0, 8.65, 0], at: [[-4, 0, 0], [4, 0, 0]], mat: "dark" });

// 閘閥（每一面一道）：外框（上下橫桿＋兩側）＋門板（各自一層，開＝往下滑 1.2）＋下方氣缸
const valve = (key, a) => {
  const [x, z] = pol(a, AP + 0.35), lay = `v_${key}`, door = `vd_${key}`;
  LAY(lay, [5.2, 2, x, 6.4]); LAY(door, [4.4, 1.3, x, 6.45]);
  P({ id: `${lay}Top`, layer: lay, shape: "box", size: [0.7, 0.4, SIDE], rot: [0, -a, 0], pos: [x, 7.2, z], mat: "stage" });
  P({ id: `${lay}Bot`, layer: lay, shape: "box", size: [0.7, 0.4, SIDE], rot: [0, -a, 0], pos: [x, 5.7, z], mat: "stage" });
  P({ id: `${lay}Cyl`, layer: lay, shape: "cyl", size: [0.28, 1.0], rot: V, pos: [x, 5.0, z], mat: "steel" });
  const [ox, oz] = pol(a, AP + 0.55);
  SEG({ id: `${door}`, layer: door, shape: "box", size: [0.18, 1.1, SIDE - 0.6], rot: [0, -a, 0], pos: [ox, 6.45, oz], mat: "dark" }, 2, 10);
  return { lay, door };
};
const VALVES = Object.fromEntries(Object.entries(FACETS).map(([k, a]) => [k, valve(k, a)]));

// 真空手臂（vr，model.kin.vr）：中心立柱＋大臂（j1）＋小臂（j2）＋腕（j3）＋升降刀片（lift）。靜止姿態全部朝 +x
const L1 = 4, BL = 2.8, yR = 5.75;
LAY("vr", [9, 1.5, 4, 6]); LAY("wf", [3, 0.3, -3.4, yW]);
P({ id: "vrBase", layer: "vr", shape: "cyl", size: [0.9, 0.4], rot: V, pos: [0, 5.5, 0], mat: "dark" });
P({ id: "vrShoulder", layer: "vr", shape: "cyl", size: [0.5, 0.5], rot: V, pos: [0, 5.92, 0], mat: "steel" });
// 蛙腿式雙刀（審片 mech 複審 2）：中心兩根同軸上臂（左 j1、右 jr1，反向轉＝伸縮、同向轉＝轉向）各接一根前臂，交會在腕座；
//   腕座上一支雙頭刀片（前刀取放、後刀空著，一次到腔內換片用）。數學上左右兩條鏈互為鏡像，前臂端點永遠在同一點。
SEG({ id: "vrLink1", layer: "vr", shape: "box", size: [L1, 0.2, 0.7], pos: [L1 / 2, 6.02, 0], mat: "steel2" }, 0, 6);
SEG({ id: "vrLinkR1", layer: "vr", shape: "box", size: [L1, 0.2, 0.7], pos: [L1 / 2, 5.8, 0], mat: "steel2" }, 0, 6);
P({ id: "vrElbow", layer: "vr", shape: "cyl", size: [0.38, 0.44], rot: V, pos: [L1, 6.13, 0], mat: "steel" });
P({ id: "vrElbowR", layer: "vr", shape: "cyl", size: [0.38, 0.66], rot: V, pos: [L1, 6.02, 0], mat: "steel" });
SEG({ id: "vrLink2", layer: "vr", shape: "box", size: [L1, 0.2, 0.55], pos: [L1 * 1.5, 6.24, 0], mat: "steel2" }, 0, 6);
SEG({ id: "vrLinkR2", layer: "vr", shape: "box", size: [L1, 0.2, 0.55], pos: [L1 * 1.5, 6.24, 0], mat: "steel2" }, 0, 6);
P({ id: "vrWrist", layer: "vr", shape: "cyl", size: [0.42, 0.16], rot: V, pos: [2 * L1, 6.36, 0], mat: "steel" });
P({ id: "vrBladeRoot", layer: "vr", shape: "box", size: [0.9, 0.06, 0.9], pos: [2 * L1, 6.44, 0], mat: "dark" });
SEG({ id: "vrBlade", layer: "vr", shape: "box", size: [2.7, 0.06, 0.3], pos: [2 * L1 + BL + 0.0, 6.44, 0], at: [[0, 0, -0.55], [0, 0, 0.55]], mat: "ti" }, 0, 9);
SEG({ id: "vrBlade2", layer: "vr", shape: "box", size: [2.7, 0.06, 0.3], pos: [2 * L1 - BL, 6.44, 0], at: [[0, 0, -0.55], [0, 0, 0.55]], mat: "ti" }, 0, 9);
P({ id: "vrBladeNeck", layer: "vr", shape: "box", size: [R2(2 * BL - 2.7), 0.06, 0.5], pos: [2 * L1, 6.44, 0], mat: "ti" });
P({ id: "vrPad", layer: "vr", shape: "cyl", size: [0.12, 0.05], rot: V, pos: [2 * L1 + BL, 6.495, 0], at: [[-0.9, 0, -0.55], [-0.9, 0, 0.55], [1.0, 0, -0.55], [1.0, 0, 0.55]], mat: "dark" });
const kinVr = {
  layer: "vr", tip: "lift", size: 2 * L1 + BL, grip: [2 * L1 + BL, 6.52, 0],
  joints: [
    { id: "j1", type: "rot", axis: [0, 1, 0], pivot: [0, 6.02, 0], parts: ["vrShoulder", "vrLink1"], min: -400, max: 400 },
    { id: "j2", parent: "j1", type: "rot", axis: [0, 1, 0], pivot: [L1, 6.13, 0], parts: ["vrElbow", "vrLink2"], min: -175, max: 175 },
    { id: "j3", parent: "j2", type: "rot", axis: [0, 1, 0], pivot: [2 * L1, 6.36, 0], parts: ["vrWrist"], min: -175, max: 175 },
    { id: "lift", parent: "j3", type: "slide", axis: [0, 1, 0], parts: ["vrBladeRoot", "vrBlade", "vrBlade2", "vrBladeNeck", "vrPad"], min: -0.3, max: 0.5 },
    { id: "jr1", type: "rot", axis: [0, 1, 0], pivot: [0, 5.8, 0], parts: ["vrLinkR1"], min: -400, max: 400 },
    { id: "jr2", parent: "jr1", type: "rot", axis: [0, 1, 0], pivot: [L1, 5.88, 0], parts: ["vrElbowR", "vrLinkR2"], min: -175, max: 175 },
  ],
  body: ["vrBase", "vrShoulder", "vrLink1", "vrLinkR1", "vrElbow", "vrElbowR", "vrLink2", "vrLinkR2", "vrWrist", "vrBladeRoot", "vrBlade", "vrBlade2", "vrBladeNeck", "vrPad"],
  info: { L1, BL, yR, type: "frog-leg dual blade" },
};

// 晶圓（被搬的那一片，wf 層）：一開始在左邊晶圓盒裡（x＝左負載鎖中心 x）
const [LLx, LLz] = pol(FACETS.llL, AP + 0.8 + 2.2);
const FOUPZ = 18.9;
P({ id: "wf", layer: "wf", shape: "cyl", size: [1.5, WT], rot: V, pos: [LLx, yW, FOUPZ], mat: "wafer" });
P({ id: "wfNotch", layer: "wf", shape: "box", size: [0.18, 0.09, 0.12], pos: [LLx, yW + 0.005, FOUPZ - 1.45], mat: "dark" });

// ── 製程腔（共用外殼：腔體 body、頂蓋 lid、底下真空泵 pump；內部各自）──
const chamberShell = (key, a, rr, h, lidH) => {
  const [x, z] = pol(a, AP + 0.8 + rr), body = `${key}Body`, lid = `${key}Lid`, pump = `${key}Pump`;
  LAY(body, [2 * rr + 0.4, h, x, 4.6 + h / 2]); LAY(lid, [2 * rr, lidH + 1.5, x, 4.6 + h + lidH / 2]); LAY(pump, [2, 4.4, x, 2.4]);
  P({ id: `${body}`, layer: body, shape: "tube", size: [rr, rr - 0.22, h], rot: V, pos: [x, 4.6 + h / 2, z], mat: "steel2" });
  P({ id: `${body}Floor`, layer: body, shape: "cyl", size: [rr, 0.3], rot: V, pos: [x, 4.75, z], mat: "steel" });
  P({ id: `${body}Fl`, layer: body, shape: "tube", size: [rr + 0.25, rr - 0.1, 0.3], rot: V, pos: [x, 4.6 + h - 0.15, z], mat: "steel" });
  P({ id: `${body}Rib`, layer: body, shape: "tube", size: [rr + 0.12, rr - 0.05, 0.22], rot: V, pos: [x, 4.6 + h * 0.4, z], mat: "steel" });
  P({ id: `${body}Port`, layer: body, shape: "cyl", size: [0.45, 0.3], rot: [0, 50 - a, 0], pos: [...(() => { const [px, pz] = pol(a + 40, rr + 0.1); return [R2(x + px), 4.6 + h * 0.62, R2(z + pz)]; })()], mat: "window" });
  // 掛在主機框架上（審片 mech 複審 3）：腔底支撐板＋兩根沿徑向接回主機底座的框架梁（泵吊在腔底法蘭下面）
  { const r0 = AP - 0.6, r1 = AP + 0.8 + rr, len = R2(r1 - r0 + rr * 0.6), [mx, mz] = pol(a, R2((r0 + r1 + rr * 0.6) / 2));
    P({ id: `${body}Frame`, layer: pump, shape: "box", size: [len, 0.6, 0.5], rot: [0, -a, 0], pos: [mx, 4.25, mz], at: [-1, 1].map((t) => { const [tx, tz] = pol(a + 90, t * rr * 0.55); return [tx, 0, tz]; }), mat: "band" });
    P({ id: `${body}Plate`, layer: pump, shape: "cyl", size: [R2(rr - 0.15), 0.3], rot: V, pos: [x, 4.45, z], mat: "dark" }); }
  P({ id: `${pump}`, layer: pump, shape: "cyl", size: [0.9, 2.2], rot: V, pos: [x, 2.6, z], mat: "steel" });
  P({ id: `${pump}Fl`, layer: pump, shape: "tube", size: [1.15, 0.7, 0.3], rot: V, pos: [x, 3.85, z], at: [[0, 0, 0], [0, -2.5, 0]], mat: "dark" });
  P({ id: `${pump}Neck`, layer: pump, shape: "cyl", size: [0.6, 0.7], rot: V, pos: [x, 4.3, z], mat: "steel2" });
  return { x, z, body, lid, pump, top: 4.6 + h };
};
const CH = {};
// PVD（銅靶）：靶材（底面朝下）、背板、旋轉磁控（偏心磁鐵組，跟著轉的電漿環）、馬達、冷卻水管；腔內遮罩、加熱基座、升降銷
const pvdBuild = (key, a, metal) => {
  const s = chamberShell(key, a, 3.0, 3.9, 1.8); CH[key] = s;
  const { x, z, lid, top } = s, tgt = `${key}Tgt`, mag = `${key}Mag`, ped = `${key}Ped`, shield = `${key}Shield`;
  LAY(tgt, [5.2, 0.8, x, top - 0.3]); LAY(mag, [5, 1, x, top + 0.3]); LAY(ped, [4.4, 1.6, x, 5.6]); LAY(shield, [5.6, 1.8, x, 6.8]);
  P({ id: `${tgt}`, layer: tgt, shape: "cyl", size: [2.55, 0.36], rot: V, pos: [x, top - 0.5, z], mat: metal });
  P({ id: `${tgt}Back`, layer: tgt, shape: "cyl", size: [2.75, 0.24], rot: V, pos: [x, top - 0.2, z], mat: "copper" });
  P({ id: `${lid}Plate`, layer: lid, shape: "cyl", size: [3.25, 0.3], rot: V, pos: [x, top + 0.05, z], mat: "steel" });
  P({ id: `${lid}House`, layer: lid, shape: "cyl", size: [2.8, 1.1], rot: V, pos: [x, top + 0.75, z], mat: "panel" });
  P({ id: `${lid}Motor`, layer: lid, shape: "cyl", size: [0.6, 1.1], rot: V, pos: [x, top + 1.8, z], mat: "dark" });
  P({ id: `${lid}MotorCap`, layer: lid, shape: "cyl", size: [0.75, 0.2], rot: V, pos: [x, top + 1.3, z], mat: "steel" });
  P({ id: `${lid}Water`, layer: lid, shape: "cyl", size: [0.13, 2.4], rot: [0, 90, 0], pos: [x, top + 0.9, z], at: [[1.9, 0, 1.0], [1.9, 0, 1.35]], mat: a < -90 ? "pipeB" : "copper" });
  P({ id: `${lid}Hv`, layer: lid, shape: "slab", size: [0.9, 0.7, 0.9], r: 0.15, pos: [x - 1.9, top + 0.65, z - 1.2], mat: "band" });
  // 偏心旋轉磁鐵組（俯視腎形）：外圈 N（紅）、內圈 S（藍），整組繞腔軸轉
  const magPts = (n, r0, off) => Array.from({ length: n }, (_, i) => { const t = (i / n) * Math.PI * 2; return [R2(off + r0 * Math.cos(t)), 0, R2(r0 * Math.sin(t))]; });
  P({ id: `${mag}Yoke`, layer: mag, shape: "cyl", size: [1.55, 0.14], rot: V, pos: [x + 0.8, top + 0.42, z], mat: "dark" });
  P({ id: `${mag}N`, layer: mag, shape: "box", size: [0.3, 0.32, 0.3], pos: [x, top + 0.2, z], at: magPts(14, 1.25, 0.8), mat: "magN" });
  P({ id: `${mag}S`, layer: mag, shape: "box", size: [0.3, 0.32, 0.3], pos: [x, top + 0.2, z], at: magPts(6, 0.45, 0.8), mat: "magS" });
  // 電漿：靶面下方 1–2 cm 的環帶（physics-spec 2）；亮的那一段跟著磁鐵轉（magGlow 和磁鐵同一個 rotate），整圈淡淡的
  P({ id: `${mag}Glow`, layer: mag, shape: "tube", size: [1.55, 1.15, 0.26], rot: V, pos: [x + 0.8, top - 0.86, z], mat: "glowHot" });
  P({ id: `${tgt}Glow`, layer: tgt, shape: "tube", size: [2.2, 1.0, 0.34], rot: V, pos: [x, top - 0.9, z], mat: "glowFaint" });
  P({ id: `${tgt}Ero`, layer: `${tgt}Ero`, shape: "tube", size: [2.05, 0.95, 0.04], rot: V, pos: [x, top - 0.69, z], mat: "ero" });
  LAY(`${tgt}Ero`, [4.2, 0.2, x, top - 0.7]);
  P({ id: `${shield}`, layer: shield, shape: "tube", size: [2.72, 2.6, 1.9], rot: V, pos: [x, 6.65, z], mat: "steel" });
  P({ id: `${ped}`, layer: ped, shape: "cyl", size: [1.75, 0.5], rot: V, pos: [x, yW - WT / 2 - 0.25, z], mat: "stage" });
  P({ id: `${ped}Stem`, layer: ped, shape: "cyl", size: [0.4, 1.3], rot: V, pos: [x, 5.35, z], mat: "steel" });
  P({ id: `${ped}Ring`, layer: ped, shape: "tube", size: [1.95, 1.6, 0.18], rot: V, pos: [x, yW - WT / 2 - 0.05, z], mat: "ti" });
  LAY(`${key}Pins`, [2.4, 0.8, x, 6.2]);
  P({ id: `${key}Pins`, layer: `${key}Pins`, shape: "cyl", size: [0.07, 0.7], rot: V, pos: [x, yW - WT / 2 - 0.35, z], at: [[0, 1.0], [130, 1.25], [230, 1.25]].map(([t, rr]) => { const [px, pz] = pol(a + t, rr); return [px, 0, pz]; }), mat: "ti" });
  P({ id: `${key}ArPipe`, layer: s.body, shape: "cyl", size: [0.1, 2.6], rot: V, pos: [...(() => { const [px, pz] = pol(a - 60, 3.15); return [R2(x + px), 3.4, R2(z + pz)]; })()], mat: "pipeB" });
  return { x, z, top, tgt, mag, ped, shield };
};
const PVD = pvdBuild("pvd", FACETS.pvd, "cu");
const PVD2 = pvdBuild("pvd2", FACETS.pvd2, "ti");
// CVD／ALD：頂上氣體歧管＋射頻匹配盒（CVD）或快速閥群（ALD）；噴頭（底面孔陣）；加熱基座（加熱線圈暗紅）；抽氣環
const cvdBuild = (key, a, ald) => {
  const s = chamberShell(key, a, 3.0, 3.9, 1.6); CH[key] = s;
  const { x, z, lid, top } = s, sh = `${key}SH`, ped = `${key}Ped`;
  LAY(sh, [5, 0.8, x, top - 0.6]); LAY(ped, [4.6, 1.6, x, 5.6]);
  P({ id: `${lid}Plate`, layer: lid, shape: "cyl", size: [3.25, 0.32], rot: V, pos: [x, top + 0.05, z], mat: "steel" });
  P({ id: `${lid}Box`, layer: lid, shape: "cyl", size: [1.6, 0.7], rot: V, pos: [x, top + 0.55, z], mat: "steel2" });
  P({ id: `${lid}Inlet`, layer: lid, shape: "cyl", size: [0.3, 1.2], rot: V, pos: [x, top + 1.4, z], mat: "steel" });
  if (!ald) {
    P({ id: `${lid}Rf`, layer: lid, shape: "slab", size: [1.8, 1.3, 1.5], r: 0.15, pos: [x + 1.7, top + 0.85, z + 0.6], mat: "band" });
    P({ id: `${lid}RfN`, layer: lid, shape: "cyl", size: [0.22, 0.5], rot: [0, 90, 0], pos: [x + 2.75, top + 0.85, z + 0.6], mat: "steel" });
    P({ id: `${lid}Gas`, layer: lid, shape: "cyl", size: [0.12, 2.6], rot: [0, 90, 0], pos: [x - 1.4, top + 1.6, z], at: [[0, 0, -0.3], [0, 0, 0.3]], mat: "steel2" });
  } else {
    // ALD：四顆快速脈衝閥圍著入口（輪流開關前驅物與吹淨氣）
    P({ id: `${lid}Valves`, layer: lid, shape: "cyl", size: [0.3, 0.9], rot: V, pos: [x, top + 1.25, z], at: [0, 90, 180, 270].map((t) => { const [px, pz] = pol(t, 0.85); return [px, 0, pz]; }), mat: "dark" });
    P({ id: `${lid}VCap`, layer: lid, shape: "cyl", size: [0.34, 0.16], rot: V, pos: [x, top + 1.78, z], at: [0, 90, 180, 270].map((t) => { const [px, pz] = pol(t, 0.85); return [px, 0, pz]; }), mat: "lampY" });
    P({ id: `${lid}Gas`, layer: lid, shape: "cyl", size: [0.11, 2.2], rot: [0, 90, 0], pos: [x - 1.7, top + 1.0, z], at: [[0, 0, -0.85], [0, 0, 0.85]], mat: "pipeB" });
  }
  // 噴頭：銀色圓盤，底面同心孔陣（示意，不標孔數）
  const SHY = top - 0.75;
  P({ id: `${sh}`, layer: sh, shape: "cyl", size: [2.5, 0.26], rot: V, pos: [x, SHY, z], mat: "steel2" });
  const holes = [[0, 0, 0]];
  for (let r = 1; r <= 5; r++) { const n = r * 7; for (let i = 0; i < n; i++) { const t = (i / n) * Math.PI * 2; holes.push([R2(r * 0.42 * Math.cos(t)), 0, R2(r * 0.42 * Math.sin(t))]); } }
  P({ id: `${sh}Holes`, layer: sh, shape: "cyl", size: [0.055, 0.04], rot: V, pos: [x, SHY - 0.13, z], at: holes, mat: "dark" });
  P({ id: `${sh}Plen`, layer: sh, shape: "cyl", size: [2.2, 0.3], rot: V, pos: [x, SHY + 0.3, z], mat: "steel" });
  P({ id: `${ped}`, layer: ped, shape: "cyl", size: [1.85, 0.55], rot: V, pos: [x, yW - WT / 2 - 0.28, z], mat: "stage" });
  P({ id: `${ped}Heat`, layer: ped, shape: "tube", size: [1.4, 1.25, 0.08], rot: V, pos: [x, yW - WT / 2 - 0.57, z], at: [[0, 0, 0]], mat: "heaterM" });
  P({ id: `${ped}Heat2`, layer: ped, shape: "tube", size: [0.95, 0.8, 0.08], rot: V, pos: [x, yW - WT / 2 - 0.57, z], mat: "heaterM" });
  P({ id: `${ped}Stem`, layer: ped, shape: "cyl", size: [0.45, 1.3], rot: V, pos: [x, 5.35, z], mat: "steel" });
  P({ id: `${ped}Pump`, layer: ped, shape: "tube", size: [2.8, 2.25, 0.25], rot: V, pos: [x, 5.6, z], mat: "dark" });
  // 這一腔自己的晶圓（已在裡面）
  P({ id: `${key}Wf`, layer: ped, shape: "cyl", size: [1.5, WT], rot: V, pos: [x, yW, z], mat: "wafer" });
  return { x, z, top, sh, ped, SHY };
};
const CVD = cvdBuild("cvd", FACETS.cvd, false);
const ALD = cvdBuild("ald", FACETS.ald, true);
// 兩側小腔（脫氣／冷卻）
for (const key of ["cool", "degas"]) {
  const s = chamberShell(key, FACETS[key], 2.2, 3.0, 0.8); CH[key] = s;
  P({ id: `${s.lid}Plate`, layer: s.lid, shape: "cyl", size: [2.45, 0.35], rot: V, pos: [s.x, s.top + 0.1, s.z], mat: "steel" });
  P({ id: `${s.lid}Win`, layer: s.lid, shape: "cyl", size: [0.9, 0.12], rot: V, pos: [s.x, s.top + 0.32, s.z], mat: "window" });
  P({ id: `${s.lid}Lamp`, layer: s.lid, shape: "box", size: [1.2, 0.5, 0.6], pos: [s.x, s.top + 0.5, s.z + 1.1], mat: key === "degas" ? "heaterM" : "pipeB" });
}
// 負載鎖 ×2（方盒：底板、兩側牆、外門 llDoor、頂蓋 llLid、層架、狀態燈、抽氣管）
const llBuild = (key, a) => {
  const [x, z] = pol(a, AP + 0.8 + 2.2), body = `${key}`, lid = `${key}Lid`, door = `${key}Door`, lamp = `${key}Lamp`;
  LAY(body, [4.6, 3.5, x, 6.2]); LAY(lid, [4.6, 1, x, 8.1]); LAY(door, [3.6, 1.6, x, 6.5]);
  const R = [0, -a, 0], o = (r, t = 0) => { const [px, pz] = pol(a, r), [tx, tz] = pol(a + 90, t); return [R2(x + px + tx), R2(z + pz + tz)]; };
  P({ id: `${body}Floor`, layer: body, shape: "box", size: [4.4, 0.4, 5.0], rot: R, pos: [x, 5.0, z], mat: "steel2" });
  for (const t of [-1, 1]) { const [sx, sz] = o(0, t * 2.35); SEG({ id: `${body}Side${t > 0 ? "R" : "L"}`, layer: body, shape: "box", size: [4.4, 2.9, 0.3], rot: R, pos: [sx, 6.4, sz], mat: "steel2" }, 0, 9); }
  { const [ox, oz] = o(2.15); SEG({ id: `${body}Outer`, layer: body, shape: "box", size: [0.3, 0.7, 4.8], rot: R, pos: [ox, 5.5, oz], at: [[0, 2.0, 0]], mat: "steel2" }, 2, 8); }
  { const [ox, oz] = o(2.45); SEG({ id: `${door}`, layer: door, shape: "box", size: [0.2, 1.3, 3.6], rot: R, pos: [ox, 6.6, oz], mat: "dark" }, 2, 8); }
  SEG({ id: `${body}Shelf`, layer: body, shape: "box", size: [2.4, 0.12, 0.3], rot: R, pos: [x, yW - WT / 2 - 0.06, z], at: [-1, 1].map((t) => { const [tx, tz] = pol(a + 90, t * 1.3); return [tx, 0, tz]; }), mat: "ti" }, 0, 6);
  P({ id: `${lid}`, layer: lid, shape: "box", size: [4.6, 0.35, 5.1], rot: R, pos: [x, 8.0, z], mat: "panel" });
  P({ id: `${lid}Win`, layer: lid, shape: "box", size: [2.2, 0.1, 2.2], rot: R, pos: [x, 8.2, z], mat: "window" });
  { const [lx, lz] = o(1.4, 1.5); P({ id: `${lamp}Y`, layer: lid, shape: "cyl", size: [0.26, 0.4], rot: V, pos: [lx, 8.4, lz], mat: "lampY" }); P({ id: `${lamp}G`, layer: lid, shape: "cyl", size: [0.26, 0.4], rot: V, pos: [lx, 8.82, lz], mat: "lampG" }); }
  { const [px, pz] = o(0.4, -2.8); P({ id: `${body}Pipe`, layer: body, shape: "cyl", size: [0.32, 5.4], rot: V, pos: [px, 3.0, pz], mat: "steel" }); }
  return { x, z, body, lid, door };
};
const LLL = llBuild("llL", FACETS.llL), LLR = llBuild("llR", FACETS.llR);

// 大氣端 EFEM（玻璃牆＋框、頂上風扇過濾機組 FFU）、大氣手臂（eb＋eb刀片 ebB）、對準器、裝載埠、晶圓盒
const EZ0 = 12.4, EZ1 = 17.2, EX = 8.4, EBZ = 15.0;
const EH = 15; // EFEM 高度（約晶圓盒的 5 倍；審片 mech 必改 2）
LAY("efem", [17, EH, 0, EH / 2]); LAY("efemFront", [17, EH, 0, EH / 2]); LAY("ffu", [17, 1.2, 0, EH + 0.5]); LAY("eb", [2, 6, LLx, 4]); LAY("ebB", [3, 0.5, LLx, 6.3]); LAY("foup", [12, 4.6, 0, 6.5]); LAY("sign", [11, 5, 0, EH - 2]);
P({ id: "efemBase", layer: "efem", shape: "slab", size: [2 * EX, 3.4, EZ1 - EZ0], r: 0.2, pos: [0, 1.9, (EZ0 + EZ1) / 2], mat: "panel2" });
P({ id: "efemGlass", layer: "efem", shape: "box", size: [2 * EX, EH - 3.6, EZ1 - EZ0], pos: [0, R2(3.6 + (EH - 3.6) / 2), (EZ0 + EZ1) / 2], mat: "glass" });
P({ id: "efemPost", layer: "efem", shape: "box", size: [0.4, EH - 3.5, 0.4], pos: [0, R2(3.6 + (EH - 3.6) / 2), 0], at: [[-EX, 0, EZ0], [EX, 0, EZ0], [-EX, 0, EZ1], [EX, 0, EZ1]], mat: "seam" });
P({ id: "efemRail", layer: "efem", shape: "box", size: [2 * EX - 1, 0.25, 0.6], pos: [0, 3.75, EBZ], mat: "steel" });
P({ id: "efemPortTun", layer: "efem", shape: "box", size: [3.2, 1.6, EZ0 - 11.5], pos: [LLx, 6.45, (EZ0 + 11.5) / 2], at: [[0, 0, 0], [-2 * LLx, 0, 0]], mat: "glass" });
P({ id: "aligner", layer: "efem", shape: "cyl", size: [0.7, 0.9], rot: V, pos: [5.6, 4.35, 14.4], mat: "dark" });
P({ id: "alignerTop", layer: "efem", shape: "cyl", size: [1.2, 0.08], rot: V, pos: [5.6, 4.85, 14.4], mat: "wafer" });
// 正面板（不透明，efemFront；講到晶圓搬運時淡出）：兩個裝載埠開口（x＝±LLx、y 4.8–8.2）以外的面板＋一扇觀察窗
{ const FZ = R2(EZ1 + 0.05), o0 = 4.8, o1 = 8.2, w = 3.4, LX = Math.abs(LLx), xs = [-EX, -LX - w / 2, -LX + w / 2, LX - w / 2, LX + w / 2, EX];
  P({ id: "efemFrLow", layer: "efemFront", shape: "box", size: [2 * EX, o0 - 0.2, 0.25], pos: [0, R2((o0 + 0.2) / 2), FZ], mat: "panel" });
  P({ id: "efemFrHigh", layer: "efemFront", shape: "box", size: [2 * EX, EH - o1, 0.25], pos: [0, R2((EH + o1) / 2), FZ], mat: "panel" });
  for (let k = 0; k < 3; k++) { const a = xs[2 * k], b = xs[2 * k + 1]; P({ id: `efemFrMid${k}`, layer: "efemFront", shape: "box", size: [R2(b - a), o1 - o0, 0.25], pos: [R2((a + b) / 2), R2((o0 + o1) / 2), FZ], mat: "panel" }); }
  P({ id: "efemFrWin", layer: "efemFront", shape: "box", size: [4.2, 3.0, 0.1], pos: [0, 10.6, R2(FZ + 0.14)], mat: "window" });
  P({ id: "efemFrBand", layer: "efemFront", shape: "box", size: [2 * EX, 0.5, 0.1], pos: [0, 4.0, R2(FZ + 0.14)], mat: "band" });
  P({ id: "efemFrScreen", layer: "efemFront", shape: "box", size: [2.0, 1.4, 0.12], pos: [6.6, 10.4, R2(FZ + 0.14)], mat: "screen" }); }
// 風扇過濾機組：平的過濾面板（格網），不露風扇
P({ id: "ffu", layer: "ffu", shape: "slab", size: [2 * EX + 0.4, 0.8, EZ1 - EZ0 + 0.4], r: 0.15, pos: [0, EH + 0.4, (EZ0 + EZ1) / 2], mat: "panel" });
P({ id: "ffuGrill", layer: "ffu", shape: "box", size: [2 * EX - 1, 0.06, 0.12], pos: [0, EH - 0.02, (EZ0 + EZ1) / 2], at: Array.from({ length: 15 }, (_, i) => [0, 0, R2(-2.1 + i * 0.3)]), mat: "seam" });
P({ id: "ffuGrillX", layer: "ffu", shape: "box", size: [0.1, 0.06, EZ1 - EZ0 - 0.6], pos: [0, EH - 0.02, (EZ0 + EZ1) / 2], at: Array.from({ length: 9 }, (_, i) => [R2(-7.2 + i * 1.8), 0, 0]), mat: "seam" });
// 大氣手臂：滑座＋立柱＋伸縮臂；刀片（ebB）往晶圓盒／負載鎖伸縮

P({ id: "ebCar", layer: "eb", shape: "slab", size: [1.6, 0.5, 1.4], r: 0.1, pos: [LLx, 4.1, EBZ], mat: "dark" });
P({ id: "ebCol", layer: "eb", shape: "cyl", size: [0.5, 1.6], rot: V, pos: [LLx, 5.1, EBZ], mat: "steel" });
P({ id: "ebHead", layer: "eb", shape: "slab", size: [1.2, 0.4, 1.6], r: 0.15, pos: [LLx, 5.95, EBZ], mat: "stage" });
P({ id: "ebArm", layer: "ebB", shape: "box", size: [0.5, 0.18, 1.8], pos: [LLx, 6.15, EBZ], mat: "steel2" });
P({ id: "ebBlade", layer: "ebB", shape: "box", size: [0.3, 0.06, 2.4], pos: [LLx, yW - WT / 2 - 0.08, EBZ], at: [[-0.5, 0, 0], [0.5, 0, 0]], mat: "ti" });
// 裝載埠＋晶圓盒（FOUP：霧面深灰、前開門貼在裝載埠、頂部抓取法蘭）
for (const [i, fx] of [LLx, -LLx].entries()) {
  P({ id: `lp${i}`, layer: "foup", shape: "box", size: [3.6, 4.4, 0.3], pos: [fx, 4.0, EZ1 + 0.2], mat: "panel" });
  P({ id: `lpShelf${i}`, layer: "foup", shape: "slab", size: [3.6, 0.3, 3.6], r: 0.1, pos: [fx, 4.7, FOUPZ], mat: "stage" });
  P({ id: `foup${i}`, layer: "foup", shape: "slab", size: [3.4, 3.1, 3.2], r: 0.45, pos: [fx, 6.4, FOUPZ + 0.25], mat: "foup" });
  P({ id: `foupFl${i}`, layer: "foup", shape: "slab", size: [1.7, 0.25, 1.4], r: 0.1, pos: [fx, 8.15, FOUPZ + 0.25], mat: "dark" });
  P({ id: `foupFlNeck${i}`, layer: "foup", shape: "box", size: [0.6, 0.4, 0.6], pos: [fx, 7.9, FOUPZ + 0.25], mat: "dark" });
  LAY(`foupDoor${i}`, [3, 2.7, fx, 6.4]); P({ id: `foupDoor${i}`, layer: `foupDoor${i}`, shape: "box", size: [3.0, 2.7, 0.14], pos: [fx, 6.4, EZ1 + 0.3], mat: "foupDoor" });
  P({ id: `foupSlots${i}`, layer: "foup", shape: "box", size: [0.08, 0.03, 2.4], pos: [fx, 6.4, FOUPZ + 0.2], at: Array.from({ length: 25 }, (_, k) => [-1.5, R2(-1.2 + k * 0.1), 0]).concat(Array.from({ length: 25 }, (_, k) => [1.5, R2(-1.2 + k * 0.1), 0])), mat: "seam" });
  P({ id: `foupHandle${i}`, layer: "foup", shape: "slab", size: [0.25, 0.9, 1.6], r: 0.1, pos: [fx, 6.6, FOUPZ + 0.3], at: [[-1.82, 0, 0], [1.82, 0, 0]], mat: "dark" });
}
// 廠牌：EFEM 頂上掛 LOGO（Commons 原檔轉貼圖，不改色）＋美國國旗旗桿
P({ id: "signBack", layer: "sign", shape: "slab", size: [8.8, 3.6, 0.2], r: 0.2, pos: [0, 12.9, EZ1 + 0.3], mat: "panel" });
P({ id: "signLogo", layer: "sign", shape: "plane", size: [8.2, R2(8.2 / 2.5656)], pos: [0, 12.9, EZ1 + 0.45], uv01: true, shadow: false, mat: "t_amat" });
P({ id: "signPost", layer: "sign", shape: "cyl", size: [0.12, 5], rot: V, pos: [EX - 0.6, R2(EH + 2.3), EZ1 - 0.6], mat: "steel" });
P({ id: "signFlag", layer: "sign", shape: "plane", size: [3.2, R2(3.2 / 1.9)], pos: [R2(EX + 1.05), R2(EH + 3.85), EZ1 - 0.6], uv01: true, shadow: false, mat: "t_us" });
// 外圍：氣體櫃、射頻電源櫃、控制器（左後方小箱）
LAY("aux", [8, 9, -15, 4.5], true);
P({ id: "gasCab", layer: "aux", shape: "slab", size: [3.2, 8.4, 2.6], r: 0.2, pos: [-16.5, 4.2, -2], mat: "panel" });
P({ id: "gasCabWin", layer: "aux", shape: "plane", size: [2.2, 3.2], pos: [-16.5, 5.8, -0.69], mat: "window" });
P({ id: "gasCabStripe", layer: "aux", shape: "box", size: [3.2, 0.4, 0.05], pos: [-16.5, 7.6, -0.68], mat: "lampY" });
P({ id: "rfCab", layer: "aux", shape: "slab", size: [2.6, 6.4, 2.6], r: 0.2, pos: [-16.5, 3.2, 2.2], mat: "panel2" });
P({ id: "rfCabLed", layer: "aux", shape: "box", size: [1.6, 0.14, 0.05], pos: [-16.5, 5.4, 3.52], at: [[0, 0, 0], [0, -0.5, 0], [0, -1.0, 0]], mat: "screen" });
P({ id: "gasLine", layer: "aux", shape: "cyl", size: [0.12, 10.5], rot: [0, 90, 0], pos: [-11.2, 9.2, -2], at: [[0, 0, 0], [0, 0, 0.35]], mat: "steel2" });

// ─── 製程動作（physics-spec 2～3）───
const lpt = (layer, p) => ({ layer, p });
const P1 = PVD;
// PVD：氬離子往靶加速（ease-in：accel）、撞靶後金屬原子往下飛向晶圓（帶散射、比離子慢）
const tY = P1.top - 0.72, gY = P1.top - 0.95, wY = yW + WT / 2 + 0.02;
const pvdPts = (r, t) => [R2(P1.x + r * Math.cos(t)), R2(P1.z + r * Math.sin(t))];
const IONS = [0.3, 1.1, 1.9, 2.7, 3.4, 4.2, 4.9, 5.7];
IONS.forEach((t, i) => { const [x, z] = pvdPts(1.5, t); actions[`pvdIon${i}`] = { type: "flow", _說明: "氬離子（淡紫）從電漿環被拉向靶面，越飛越快（accel）", path: [lpt("pvdTgt", [x, gY - 0.45, z]), lpt("pvdTgt", [x, tY, z])], n: 4, size: 0.07, shape: "dot", rate: 1.3, phase: i * 0.21, color: "ar", trail: 2, trailGap: 0.04, trailColor: "plasmaHot", accel: true, track: false }; });
const ATOMS = Array.from({ length: 10 }, (_, i) => { const t = (i / 10) * Math.PI * 2; return [t, 1.4 + 0.25 * Math.sin(i * 1.7), t + 0.35 * Math.sin(i * 2.3), 0.3 + 1.05 * ((i * 7) % 10) / 10]; });
ATOMS.forEach(([t, r, t2, r2], i) => { const [x0, z0] = pvdPts(r, t), [x1, z1] = pvdPts(r2, t2); actions[`pvdAtom${i}`] = { type: "flow", _說明: "被撞出的銅原子（橘）往下飛向晶圓，方向各自散開，比氬離子慢", path: [lpt("pvdTgt", [x0, tY - 0.05, z0]), lpt("pvdTgt", [R2((x0 + x1) / 2 + 0.15 * Math.cos(i)), R2((tY + wY) / 2), R2((z0 + z1) / 2 + 0.15 * Math.sin(i))]), lpt("pvdTgt", [x1, wY, z1])], n: 5, size: 0.09, shape: "dot", rate: 0.55, phase: i * 0.13, color: "atomCu", trail: 2, trailGap: 0.03, trailColor: "atomCu", jitter: 0.1, track: false }; });
actions.pvdGlow = { type: "pulse", _說明: "氬電漿輝光微微呼吸（不是白熾光）", parts: ["pvdTgtGlow", "pvdMagGlow"], color: "plasma", glow: 0.9, freq: 1.3, halo: 0 };
actions.pvdSpin = { type: "rotate", _說明: "磁控管偏心磁鐵組繞腔軸轉（約 1 圈／秒，示意），電漿亮帶跟著轉；起轉、停轉有加減速（rampSpin）", parts: ["pvdMagYoke", "pvdMagN", "pvdMagS", "pvdMagGlow"], axis: [0, 1, 0], pivot: [P1.x, P1.top, P1.z], pivots: Object.fromEntries(["pvdMagYoke", "pvdMagN", "pvdMagS", "pvdMagGlow"].map((k) => [k, [P1.x, P1.top, P1.z]])), rps: 0.8, rampSpin: true };
{ const [ox, oz] = pvdPts(3.3, -1.2), [ix, iz] = pvdPts(2.0, -1.0); actions.pvdArIn = { type: "flow", _說明: "氬氣由腔壁細管慢慢進來（不是噴流）", path: [lpt("pvdBody", [ox, 6.0, oz]), lpt("pvdBody", [ix, 6.5, iz])], n: 4, size: 0.1, shape: "dot", rate: 0.35, color: "ar", track: false }; }
// CVD：噴頭孔向下均勻噴出（多排簾幕），貼近晶圓轉向往外、流向抽氣環
const gasCurtain = (key, ch, color, pre, rate = 0.5, zo = 0, lanes = 7) => {
  const xs = [-1.6, -0.8, 0, 0.8, 1.6], out = [];
  xs.forEach((u, i) => {
    const sx = R2(ch.x + u), z0 = R2(ch.z + zo), y0 = R2(ch.SHY - 0.16), y1 = R2(yW + 0.25), side = u === 0 ? (i % 2 ? 1 : -1) : Math.sign(u);
    const id = `${pre}${i}`;
    actions[id] = { type: "flow", _說明: "氣體從噴頭小孔往下（整排像簾幕），近晶圓轉向往外，流到抽氣環", path: [lpt(ch.sh, [sx, y0, z0]), lpt(ch.sh, [sx, y1, z0]), lpt(ch.sh, [R2(ch.x + side * 2.15), R2(yW + 0.12), z0]), lpt(ch.sh, [R2(ch.x + side * 2.5), 5.7, z0])], n: 6, lanes, laneGap: R2(3.4 / lanes), laneDir: [0, 0, 1], size: 0.085, shape: "dot", rate, phase: i * 0.17, color, track: false };
    out.push(id);
  });
  return out;
};
const cvdA = gasCurtain("cvd", CVD, "gasA", "cvdA", 0.7, 0), cvdB = gasCurtain("cvd", CVD, "gasB", "cvdB", 0.7, 0.24);
const aldA = gasCurtain("ald", ALD, "gasA", "aldA", 0.9, 0, 9), aldB = gasCurtain("ald", ALD, "gasB", "aldB", 1.2, 0.24), aldP = gasCurtain("ald", ALD, "purge", "aldP", 1.4, 0.12);
actions.cvdHeat = { type: "pulse", _說明: "加熱基座的線圈暗紅微光（穩定）", parts: ["cvdPedHeat", "cvdPedHeat2"], color: "heater", glow: 0.7, steady: true, halo: 0 };
actions.aldHeat = { type: "pulse", parts: ["aldPedHeat", "aldPedHeat2"], color: "heater", glow: 0.6, steady: true, halo: 0 };
// 薄膜：PVD 銅膜 3 層、CVD 膜 3 層、ALD 膜 4 層（一層一層出現，時間在 genscript 的 shift 控制；畫面加厚放大是示意）
const film = (lay, ch, n, mat, wfY, step) => { LAY(lay, [3.2, 0.4, ch.x, wfY]); for (let i = 0; i < n; i++) { const l = `${lay}${i}`; LAY(l, [3.2, 0.2, ch.x, wfY]); P({ id: l, layer: l, shape: "cyl", size: [1.5, R2(step * 0.9)], rot: V, pos: [ch.x, R2(wfY + WT / 2 + step * (i + 0.5)), ch.z], mat }); } };
film("fP", PVD, 3, "filmCu", yW, 0.05);
film("fC", CVD, 3, "filmC", yW, 0.05);
film("fA", ALD, 4, "filmA", yW, 0.09);
// EFEM 頂上風扇往下吹（淺藍小點、向下）
actions.ffuAir = { type: "flow", _說明: "風扇過濾機組往下吹的潔淨空氣（向下的層流）", path: [lpt("efem", [-5.5, 9.2, 14]), lpt("efem", [-5.5, 4.2, 14])], n: 3, lanes: 5, laneGap: 2.6, laneDir: [1, 0, 0], size: 0.09, shape: "dot", rate: 0.45, color: "ffuAir", track: false };
actions.llPump = { type: "pulse", _說明: "負載鎖抽真空中：黃燈閃", parts: ["llLLampY"], color: "lampY", glow: 0.9, freq: 1.6, halo: 0 };
actions.llReady = { type: "pulse", _說明: "抽好真空：綠燈亮", parts: ["llLLampG"], color: "lampG", glow: 0.9, steady: true, halo: 0 };
actions.llAir = { type: "flow", _說明: "負載鎖抽氣：空氣從腔內被抽進下方抽氣管", path: [lpt("llL", [LLx, 6.9, LLz]), lpt("llL", [LLx - 1.0, 5.4, LLz - 0.6]), ...(() => { const [px, pz] = pol(FACETS.llL, 0.4), [tx, tz] = pol(FACETS.llL + 90, -2.8); return [lpt("llL", [R2(LLx + px + tx), 5.2, R2(LLz + pz + tz)]), lpt("llL", [R2(LLx + px + tx), 1.2, R2(LLz + pz + tz)])]; })()], n: 6, size: 0.12, shape: "dot", rate: 0.9, color: "purge", track: false };

// ═════ 離子佈植機（另一台，x 30～62；高度 y 4～10）═════
const IY = 6.5, IX0 = 32;
LAY("imp", [32, 8, 47, 4]); LAY("impSrc", [6, 6, 34, 6.5]); LAY("impMag", [9, 3, 39, 6.5]); LAY("impAcc", [12, 4, 48, 6.5]); LAY("impEnd", [7, 7, 58, 6.5]); LAY("impScan", [3, 2.5, 53.5, 6.5]);
P({ id: "impBase", layer: "imp", shape: "slab", size: [32, 2.6, 15], r: 0.3, pos: [47, 1.3, -2], mat: "panel2" });
P({ id: "impBand", layer: "imp", shape: "slab", size: [32.2, 0.45, 15.2], r: 0.1, pos: [47, 1.9, -2], mat: "band" });
// 離子源：源室（方盒＋終端高壓罩）、內部電漿輝光、氣體瓶櫃、引出電極三片；束從源往 +z 走到磁鐵
const SX = 35, SZ = -8;
P({ id: "impSrcBox", layer: "impSrc", shape: "slab", size: [3, 3, 3], r: 0.25, pos: [SX, IY, SZ - 1.2], mat: "steel2" });
P({ id: "impSrcHv", layer: "impSrc", shape: "slab", size: [4.4, 4.8, 3.6], r: 0.6, pos: [SX, IY + 0.4, SZ - 4.4], mat: "panel" });
P({ id: "impSrcGlow", layer: "impSrc", shape: "sphere", size: [0.75], scale: [1, 0.8, 1.4], pos: [SX, IY, SZ - 1.1], mat: "srcGlow" });
P({ id: "impSrcFil", layer: "impSrc", shape: "cyl", size: [0.08, 1.4], rot: [0, 90, 0], pos: [SX, IY, SZ - 1.9], mat: "heaterM" });
P({ id: "impGas", layer: "impSrc", shape: "slab", size: [2.4, 4.2, 2.2], r: 0.2, pos: [SX - 3.6, 4.7, SZ - 4.2], mat: "panel" });
P({ id: "impGasBtl", layer: "impSrc", shape: "cyl", size: [0.4, 2.6], rot: V, pos: [SX - 3.6, 4.6, SZ - 3.0], at: [[-0.6, 0, 0], [0.6, 0, 0]], mat: "lampY" });
P({ id: "impExt", layer: "impSrc", shape: "tube", size: [1.1, 0.25, 0.14], rot: [0, 0, 0], pos: [SX, IY, SZ + 0.6], at: [[0, 0, 0], [0, 0, 0.55], [0, 0, 1.1]], mat: "steel" });
P({ id: "impTube1", layer: "imp", shape: "cyl", size: [0.5, 4.2], rot: [0, 0, 0], pos: [SX, IY, SZ + 4.1], mat: "glass" });
P({ id: "impTube1Fl", layer: "imp", shape: "tube", size: [0.85, 0.5, 0.25], pos: [SX, IY, SZ + 2.1], at: [[0, 0, 0], [0, 0, 4.0]], mat: "steel" });
// 分析磁鐵：扇形（四分之一圓環）鐵軛＋上下銅線圈；束從 (SX, -2) 往 +z 進來，彎 90° 往 +x 出去（半徑 4）
const RM = 4, MC = [SX + RM, -2]; // 選定質量的弧心
const sector = (r0, r1, n = 14) => { // 弧心 MC，角度從 180°（入口，x＝SX）轉到 90°（出口，往 +x）；poly 的第二座標＝世界 z 的負值（rot [-90]）→ 用 rot V 時第二座標＝z
  const pts = [];
  for (let i = 0; i <= n; i++) { const t = Math.PI - (i / n) * (Math.PI / 2); pts.push([R2(MC[0] + r1 * Math.cos(t) - MC[0]), R2(r1 * Math.sin(t))]); }
  for (let i = n; i >= 0; i--) { const t = Math.PI - (i / n) * (Math.PI / 2); pts.push([R2(r0 * Math.cos(t)), R2(r0 * Math.sin(t))]); }
  return pts;
};
// 弧：起點 (SX, MC.z)＝角 180°，往 +z 走時繞弧心轉向 +x；世界座標 x＝MC.x＋r cos t、z＝MC.z＋r sin t（t 從 180° 減到 90° 時 z 增加）
// 上下兩塊磁極（中間 0.5 的間隙給束走）＋上下銅線圈；推鏡俯視時上磁極（impMagUp）剖開，看得到束在間隙裡分岔
LAY("impMagUp", [9, 1.5, 39, IY + 0.8]);
P({ id: "impMagPoleLo", layer: "impMag", shape: "poly", pts: sector(RM - 1.5, RM + 1.5), size: [1, 1, 0.5], rot: V, pos: [MC[0], IY - 0.5, MC[1]], mat: "dark" });
P({ id: "impMagCoilLo", layer: "impMag", shape: "poly", pts: sector(RM - 1.1, RM + 1.1), size: [1, 1, 0.4], rot: V, pos: [MC[0], IY - 0.95, MC[1]], mat: "coil" });
P({ id: "impMagPoleUp", layer: "impMagUp", shape: "poly", pts: sector(RM - 1.5, RM + 1.5), size: [1, 1, 0.5], rot: V, pos: [MC[0], IY + 0.5, MC[1]], mat: "dark" });
P({ id: "impMagCoilUp", layer: "impMagUp", shape: "poly", pts: sector(RM - 1.1, RM + 1.1), size: [1, 1, 0.4], rot: V, pos: [MC[0], IY + 0.95, MC[1]], mat: "coil" });
P({ id: "impMagWall", layer: "impMag", shape: "poly", pts: sector(RM - 1.5, RM - 1.3), size: [1, 1, 0.5], rot: V, pos: [MC[0], IY, MC[1]], at: [[0, 0, 0]], mat: "steel" });
// 質量解析縫（出口後兩片擋板，中間留縫）、加速管（環形電極＋絕緣環交錯）、掃描（左右偏轉板）、終端站
const EXZ = MC[1] + RM; // 出口 z（≈2）
P({ id: "impSlit", layer: "impAcc", shape: "box", size: [0.25, 1.6, 1.0], pos: [MC[0] + 1.2, IY, EXZ], at: [[0, 0, -0.75], [0, 0, 0.75]], mat: "dark" });
const ACC0 = MC[0] + 2.4, ACC1 = ACC0 + 9;
P({ id: "impAccRing", layer: "impAcc", shape: "tube", size: [1.4, 0.5, 0.35], rot: [0, 90, 0], pos: [ACC0, IY, EXZ], at: Array.from({ length: 8 }, (_, i) => [R2(0.4 + i * 1.15), 0, 0]), mat: "steel2" });
P({ id: "impAccIns", layer: "impAcc", shape: "tube", size: [1.15, 0.55, 0.7], rot: [0, 90, 0], pos: [ACC0, IY, EXZ], at: Array.from({ length: 7 }, (_, i) => [R2(0.975 + i * 1.15), 0, 0]), mat: "insul" });
P({ id: "impAccHv", layer: "impAcc", shape: "slab", size: [9.4, 0.5, 0.5], r: 0.2, pos: [(ACC0 + ACC1) / 2, IY + 1.8, EXZ - 1.0], mat: "band" });
const SCX = ACC1 + 1.6;
P({ id: "impScanPlate", layer: "impScan", shape: "box", size: [1.8, 1.4, 0.12], pos: [SCX, IY, EXZ], at: [[0, 0, -0.65], [0, 0, 0.65]], mat: "copper" });
P({ id: "impScanBox", layer: "impScan", shape: "box", size: [2.2, 0.3, 1.8], pos: [SCX, IY + 0.9, EXZ], mat: "steel2" });
const CRX = SCX + 3.0, EDX = SCX + 6.6; // 平行化（角度修正）磁鐵在掃描器與終端站之間（審片 mech 必改 4）
LAY("impEndCov", [4, 4, EDX, IY]);
P({ id: "impEndCh", layer: "impEndCov", shape: "slab", size: [3.6, 4.6, 4.6], r: 0.25, pos: [EDX + 0.6, IY, EXZ - 0.6], mat: "steel2" });
P({ id: "impEndCov", layer: "impEndCov", shape: "slab", size: [3.6, 4.6, 0.3], r: 0.15, pos: [EDX + 0.6, IY, R2(EXZ + 1.85)], mat: "panel" });
P({ id: "impEndLL", layer: "impEnd", shape: "slab", size: [2.2, 2.2, 2.2], r: 0.2, pos: [EDX + 3.6, IY - 1.0, EXZ - 0.6], mat: "panel2" });
P({ id: "impEndLLDoor", layer: "impEnd", shape: "box", size: [0.1, 1.4, 1.6], pos: [EDX + 4.72, IY - 1.0, EXZ - 0.6], mat: "dark" });
// 傾斜平台：晶圓面朝束（−x）再轉 45°（高傾角佈植，示意），從前方鏡頭看得到正面
P({ id: "impPlaten", layer: "impEnd", shape: "cyl", size: [1.8, 0.3], rot: [0, -45, 0], pos: [EDX + 1.05, IY, EXZ - 0.12], mat: "stage" });
P({ id: "impWafer", layer: "impEnd", shape: "cyl", size: [1.5, WT], rot: [0, -45, 0], pos: [EDX + 0.92, IY, EXZ + 0.01], mat: "wafer" });
P({ id: "impWaferDies", layer: "impEnd", shape: "box", size: [0.5, 0.5, 0.02], rot: [0, -45, 0], pos: [EDX + 0.9, IY, EXZ + 0.03], at: [-0.6, 0, 0.6].flatMap((u) => [-0.6, 0, 0.6].map((v) => [R2(u * 0.707), v, R2(u * 0.707)])), mat: "dieM" });
P({ id: "impPlatenArm", layer: "impEnd", shape: "box", size: [0.4, 3.0, 0.4], pos: [EDX + 1.2, IY - 1.7, EXZ], mat: "steel" });
P({ id: "impEndPump", layer: "impEnd", shape: "cyl", size: [0.8, 2.2], rot: V, pos: [EDX, 2.9, EXZ + 2.2], mat: "steel" });
P({ id: "impPump", layer: "imp", shape: "cyl", size: [0.7, 1.9], rot: V, pos: [0, 3.6, 0], at: [[SX, 0, SZ + 3.5], [MC[0] + 2, 0, EXZ - 2.6], [ACC0 + 4.5, 0, EXZ + 2.3]], mat: "steel" });
P({ id: "impBeamPipe", layer: "imp", shape: "cyl", size: [0.45, SCX - (MC[0] + 0.4)], rot: [0, 90, 0], pos: [R2((SCX + MC[0] + 0.4) / 2), IY, EXZ], mat: "glass" });
// 束：混合離子從源出發 → 磁鐵；輕的半徑小（彎得多撞內牆）、重的半徑大（彎得少撞外牆）、選定的剛好過縫 → 加速管（越跑越快）→ 掃描 → 晶圓
const arc = (r, t1, n = 8, c = MC) => Array.from({ length: n + 1 }, (_, i) => { const t = Math.PI - (i / n) * (Math.PI - t1); return [R2(c[0] + r * Math.cos(t)), IY, R2(c[1] + r * Math.sin(t))]; });
// 半徑 r 的弧、入口切線都在 (SX, MC.z) 往 +z：弧心＝(SX + r, MC.z)
const arcR = (r, endDeg) => arc(r, endDeg * D2R, 8, [SX + r, MC[1]]);
const ipt = (p) => lpt("impMag", p);
const srcLeg = [[SX, IY, SZ + 0.2], [SX, IY, MC[1]]];
actions.ionSel = { type: "flow", _說明: "選定質量的離子：剛好沿磁鐵彎 90°、穿過質量解析縫", path: [...srcLeg, ...arcR(RM, 90).slice(1), [MC[0] + 1.6, IY, EXZ]].map(ipt), n: 6, size: 0.3, shape: "dot", rate: 0.42, color: "ionSel", trail: 3, trailGap: 0.012, trailColor: "ionSel", track: true };
actions.ionLight = { type: "flow", _說明: "較輕的離子：半徑小、彎得多，撞到磁鐵內側（示意）", path: [...srcLeg, ...arcR(2.4, 60).slice(1)].map(ipt), n: 4, size: 0.24, shape: "dot", rate: 0.42, phase: 0.33, color: "ionLight", trail: 2, trailGap: 0.012, trailColor: "ionLight", track: true };
actions.ionHeavy = { type: "flow", _說明: "較重的離子：半徑大、彎得少，撞到磁鐵外側（示意）", path: [...srcLeg, ...arcR(6.2, 118).slice(1)].map(ipt), n: 4, size: 0.36, shape: "dot", rate: 0.42, phase: 0.66, color: "ionHeavy", trail: 2, trailGap: 0.012, trailColor: "ionHeavy", track: true };
actions.ionAcc = { type: "flow", _說明: "加速管：離子逐環加速（accel，越後面越快、拖尾越長）", path: [[MC[0] + 1.6, IY, EXZ], [ACC1 + 0.4, IY, EXZ]].map((p) => lpt("impAcc", p)), n: 6, size: 0.2, shape: "dot", rate: 0.7, accel: true, color: "ionSel", trail: 4, trailGap: 0.035, trailColor: "beam", track: false };
LAY("impCor", [3, 3, CRX, IY]);
P({ id: "impCorYoke", layer: "impCor", shape: "poly", pts: [[-0.9, -1.9], [0.9, -2.5], [0.9, 2.5], [-0.9, 1.9]], size: [1, 1, 1.4], rot: V, pos: [CRX, IY, EXZ], mat: "dark" });
P({ id: "impCorCoil", layer: "impCor", shape: "poly", pts: [[-0.7, -1.7], [0.7, -2.2], [0.7, 2.2], [-0.7, 1.7]], size: [1, 1, 0.4], rot: V, pos: [CRX, IY, EXZ], at: [[0, 0.9, 0], [0, -0.9, 0]], mat: "coil" });
// 掃描後扇形散開（impFanA：繞掃描器轉）→ 修正磁鐵後平行（impFanB：平移），兩段同頻率、等速三角波
const LA = CRX - SCX, LB = EDX + 0.62 - (CRX + 0.9);
P({ id: "impFanA", layer: "impScan", shape: "box", size: [LA, 0.07, 0.1], pos: [R2(SCX + LA / 2), IY, EXZ], mat: "beamM" });
P({ id: "impFanB", layer: "impScan", shape: "box", size: [R2(LB), 0.07, 0.1], pos: [R2(CRX + 0.9 + LB / 2), IY, EXZ], mat: "beamM" });
const SW = 1.25, SWA = R2((Math.atan2(SW, LA) * 180) / Math.PI);
actions.scanSweep = { type: "vibrate", tri: true, _說明: "平行束在晶圓前等速左右掃（三角波：到端點直接折返）", parts: ["impFanB"], axis: [0, 0, 1], amp: SW, freq: 0.6 };
actions.scanFan = { type: "rotate", tri: true, _說明: "掃描器後的扇形束（繞掃描器擺），過修正磁鐵後變平行", parts: ["impFanA"], axis: [0, 1, 0], pivot: [SCX, IY, EXZ], pivots: { impFanA: [SCX, IY, EXZ] }, swing: -SWA, freq: 0.6 };
actions.ionHit = { type: "flow", _說明: "離子經掃描、修正磁鐵後打進晶圓", path: [[ACC1 + 0.4, IY, EXZ], [SCX, IY, EXZ], [CRX, IY, EXZ], [EDX + 0.62, IY, EXZ]].map((p) => lpt("impScan", p)), n: 5, size: 0.18, shape: "dot", rate: 1.0, color: "ionSel", trail: 3, trailGap: 0.02, trailColor: "beam", track: false };
actions.srcGlow = { type: "pulse", _說明: "離子源電漿淡紫輝光、燈絲加熱", parts: ["impSrcGlow", "impSrcFil"], color: "srcGlow", glow: 0.9, freq: 1.4, halo: 0 };
actions.accGlow = { type: "pulse", _說明: "加速管通高壓時電極環亮", parts: ["impAccRing"], color: "beam", glow: 0.5, steady: true, halo: 0 };
actions.status = { type: "pulse", _說明: "機台運轉：射頻櫃指示燈慢慢呼吸", parts: ["rfCabLed"], color: "screen", glow: 0.6, freq: 0.5, halo: 0 };

// ── 標註點 ──
const A = (layer, p, dx, dy) => ({ layer, p, dx, dy });
Object.assign(anchors, {
  tc: A("tcLid", [0, 8.6, 2.5], -150, -150), vr: A("vr", [2, 6.2, 0], 130, -140),
  pvd: A("pvdLid", [PVD.x, PVD.top + 1.2, PVD.z], 120, -150), cvd: A("cvdLid", [CVD.x, CVD.top + 1.2, CVD.z], 120, -150), ald: A("aldLid", [ALD.x, ALD.top + 1.2, ALD.z], -120, -150),
  ll: A("llLLid", [LLL.x, 8.3, LLL.z], -150, -120), foup: A("foup", [LLx, 8.3, FOUPZ], -140, -110), valve: A(VALVES.llL.lay, [LLL.x * 0.62, 7.3, LLL.z * 0.62], 140, -120),
  efem: A("ffu", [5, EH + 0.8, 14], 130, -120),
  tgt: A("pvdTgt", [PVD.x, PVD.top - 0.4, PVD.z + 2.4], 140, -110), plasma: A("pvdTgt", [PVD.x, PVD.top - 0.95, PVD.z + 2.3], 150, 60), mag: A("pvdMag", [PVD.x, PVD.top + 0.3, PVD.z + 1.6], 140, -150), wfP: A("fP", [PVD.x, yW, PVD.z + 1.4], 140, 120),
  sh: A("cvdSH", [CVD.x, CVD.SHY, CVD.z + 2.3], 150, -100), heat: A("cvdPed", [CVD.x, 5.8, CVD.z + 1.8], 150, 110), aldF: A("fA", [ALD.x, yW, ALD.z + 1.4], 150, 110),
  src: A("impSrc", [SX, IY + 1.5, SZ - 1.2], -120, -140), magnet: A("impMag", [MC[0] - 1, IY + 1.2, MC[1] + 2], 120, -150), acc: A("impAcc", [ACC0 + 4.5, IY + 1.5, EXZ], 60, -150), end: A("impEnd", [EDX + 0.9, IY + 0.3, EXZ + 0.05], 110, -150), cor: A("impCor", [CRX, IY + 1.2, EXZ], 60, -150),
  sign: A("sign", [0, 11.0, EZ1 - 0.4], -150, 130),
});

for (const d of Object.values(actions)) if (d.type === "flow" && d.path?.[0]?.p) { d.layer = d.path[0].layer; d.path = d.path.map((q) => q.p); d.free = true; }
const model = {
  name: "示意 集群式沉積平台＋離子佈植機（tech-amat）：中央真空傳送腔（八面閘閥）＋真空手臂（關節鏈）、負載鎖 ×2、脫氣／冷卻腔、濺鍍 PVD ×2（旋轉磁控、靶材、遮罩、基座）、化學氣相沉積 CVD（噴頭孔陣、加熱基座、射頻匹配盒）、原子層沉積 ALD（快速閥群）、EFEM（風扇過濾機組、大氣手臂、對準器、裝載埠、晶圓盒）；離子佈植機（離子源、引出電極、分析磁鐵、質量解析縫、加速管、掃描、終端站）。配置與比例是示意，不仿特定機型。由 gen-model.mjs 產生，不要手改",
  unit: "示意（1＝10 cm；晶圓直徑 300 mm）",
  size: { w: 40, h: 16, r: 0.6, t: 40 },
  palette, materials,
  partNames: { tc: "真空傳送腔", vr: "真空手臂", pvd: "濺鍍腔", cvd: "化學氣相沉積腔", ald: "原子層沉積腔", ll: "負載鎖", foup: "晶圓盒", efem: "大氣端前置模組", imp: "離子佈植機" },
  layers, parts, anchors, actions,
  kin: { vr: kinVr },
  pose: { yaw0: -0.3, yawIso: -0.3, drift: 0 },
  camera: { stand: { d: 110, elev: 30, y: 6 } },
  fx: { dpr: 1, srcPx: 30, shadows: 0, fog: false, dust: false, vaporSprites: false, shimmer: false },
  info: { yW, WT, L1, BL, FACETS, PVD: [PVD.x, PVD.z], CVD: [CVD.x, CVD.z], ALD: [ALD.x, ALD.z], LL: [LLL.x, LLL.z], FOUPZ, EBZ, IMP: { SX, MC, EXZ, EDX } },
};
const out = path.join(path.dirname(new URL(import.meta.url).pathname), "model.json");
fs.writeFileSync(out, JSON.stringify(model, null, 1) + "\n");
console.log(`✔ ${out}：${parts.length} 個零件、${parts.reduce((a, p) => a + Math.max(1, (p.at?.length ?? 0) + (p.grid ? p.grid.n[0] * p.grid.n[1] : 0)), 0)} 個實體（含複製）、${layers.length} 層`);

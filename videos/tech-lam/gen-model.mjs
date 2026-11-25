// node videos/tech-lam/gen-model.mjs → 寫 videos/tech-lam/model.json
// 2026/11/26 tech-lam（設備五大-3：科林研發，蝕刻）。構造與物理照 physics-spec.md、模組清單照 visual-spec.md。
// 單位：1＝10 cm（晶圓直徑 300 mm＝3），地板 y＝0，x 向右、z 向觀眾。配置與比例是示意（Sense.i 的腔數與拓樸官方未公開），不仿特定機型。
// 集群平台（俯視六角形，physics-spec 第 1 節）：中央真空傳送腔（六面，每面一道閘閥）＋真空手臂（model.kin.vr 關節鏈）
//   前面兩個裝載閘（60°、120°）；四個製程腔：0° 導體蝕刻 ICP（線圈＋介電窗，pm1，爆炸分解用這個）、−60° 導體蝕刻 ICP（pm2）、
//   −120° 介電蝕刻 CCP（噴淋頭上電極＋限制環，pm3）、180° 低溫介電蝕刻 CCP（霜色靜電吸盤，pm4）
//   前端：EFEM（FFU、大氣手臂、對準器）、三個 FOUP 載入埠；外圍：氣櫃（MFC 一排）、射頻產生器櫃、冷卻機（藍／紅管）、控制螢幕懸臂、塔燈、廠牌
import fs from "node:fs";
import path from "node:path";

const R2 = (x) => Math.round(x * 1000) / 1000;
const D2R = Math.PI / 180;
const pol = (aDeg, r) => [R2(r * Math.cos(aDeg * D2R)), R2(r * Math.sin(aDeg * D2R))]; // (x, z)

const palette = {
  floorC: "#C9D2DE", panel: "#F3F5F8", panel2: "#E2E8F0", seam: "#8E9BB0", band: "#24324C", steel: "#7D8CA6", steel2: "#A9B5C7", dark: "#3E4A60",
  stage: "#8FA3C4", glassC: "#BFD3F2", copper: "#D98A3D", coilHot: "#F08A3C", ceramic: "#F4F1EA", escC: "#E9ECEF", ringSi: "#5C6675", waferC: "#5F7FB8",
  lampY: "#F2B632", lampG: "#2FBF71", lampR: "#E5484D", screen: "#5B8DEF", pipeB: "#3E7BD6", pipeR: "#D9534F", foupC: "#E8E2D4",
  plasmaI: "#0AA8E0", plasmaIHot: "#00C8FF", plasmaC: "#E58BF0", plasmaCHot: "#F6C6FA", ion: "#38BDF8", rad: "#F5A524", byp: "#A99BC4", cl2: "#8BD45A", purge: "#C8D0DB",
  frost: "#DCEFFF", oxideC: "#BCD9F2", nitrideC: "#C9CDD3", maskC: "#6B4A2E", holeC: "#1B2233", polyC: "#9A7B5C", cold: "#BFE3FF", rubber: "#2B2F36",
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
  dielectric: M("phys", "ceramic", { rough: 0.25, metal: 0, clearcoat: 0.6, opacity: 0.78, env: 0.4 }),
  copper: M("std", "copper", { rough: 0.3, metal: 0.9, env: 0.7 }), ceramic: M("std", "ceramic", { rough: 0.5, metal: 0, env: 0.2 }),
  esc: M("std", "escC", { rough: 0.35, metal: 0.05, env: 0.35 }), ringSi: M("std", "ringSi", { rough: 0.3, metal: 0.6, env: 0.6 }),
  wafer: M("phys", "waferC", { rough: 0.15, metal: 0.6, clearcoat: 0.9, env: 0.9 }),
  lampY: M("std", "lampY", { emissive: "lampY", ei: 0.4, rough: 0.4, metal: 0 }), lampG: M("std", "lampG", { emissive: "lampG", ei: 0.3, rough: 0.4, metal: 0 }),
  lampR: M("std", "lampR", { emissive: "lampR", ei: 0.2, rough: 0.4, metal: 0 }),
  screen: M("std", "screen", { emissive: "screen", ei: 0.5, rough: 0.3, metal: 0 }), pipeB: M("std", "pipeB", { rough: 0.35, metal: 0.6, env: 0.4 }), pipeR: M("std", "pipeR", { rough: 0.35, metal: 0.6, env: 0.4 }),
  foup: M("phys", "foupC", { rough: 0.35, metal: 0, clearcoat: 0.4, env: 0.3 }), foupWin: M("phys", "glassC", { rough: 0.1, metal: 0, opacity: 0.5, env: 0.4 }),
  glowI: M("std", "plasmaI", { emissive: "plasmaI", ei: 1.2, opacity: 0.8, rough: 1, metal: 0 }), glowI2: M("std", "plasmaI", { emissive: "plasmaI", ei: 0.9, opacity: 0.48, rough: 1, metal: 0 }), glowI3: M("std", "plasmaI", { emissive: "plasmaI", ei: 0.8, opacity: 0.3, rough: 1, metal: 0 }), glowIHot: M("std", "plasmaIHot", { emissive: "plasmaIHot", ei: 1.6, opacity: 1, rough: 1, metal: 0 }),
  glowC: M("std", "plasmaC", { emissive: "plasmaC", ei: 1, opacity: 0.58, rough: 1, metal: 0 }), glowCHot: M("std", "plasmaCHot", { emissive: "plasmaCHot", ei: 1, opacity: 0.75, rough: 1, metal: 0 }),
  sheath: M("std", "dark", { opacity: 0.62, rough: 1, metal: 0 }),
  oxide: M("std", "oxideC", { rough: 0.5, metal: 0, env: 0.2 }), nitride: M("std", "nitrideC", { rough: 0.5, metal: 0.05, env: 0.2 }),
  maskM: M("std", "maskC", { rough: 0.6, metal: 0.1 }), holeM: M("std", "holeC", { rough: 1, metal: 0 }), polymer: M("std", "polyC", { rough: 0.8, metal: 0 }),
  glowCold: M("std", "cold", { emissive: "cold", ei: 0.9, opacity: 0.35, rough: 1, metal: 0 }),
  frostRim: M("std", "frost", { emissive: "frost", ei: 0.35, rough: 0.7, metal: 0 }), atomSi: M("std", "steel2", { rough: 0.4, metal: 0.3, env: 0.5 }), atomCl: M("std", "cl2", { rough: 0.5, metal: 0, emissive: "cl2", ei: 0.25 }),
  frost: M("phys", "frost", { rough: 0.6, metal: 0, clearcoat: 0.3, env: 0.5 }), rubber: M("std", "rubber", { rough: 0.9, metal: 0 }),
  t_lam: { kind: "unlit", color: "#FFFFFF", img: "tex/brand/sign-lam.png" }, t_us: { kind: "unlit", color: "#FFFFFF", img: "tex/brand/flag-US.png" },
};
const parts = [], layers = [], anchors = {}, actions = {};
const P = (o) => { parts.push(o); return o; };
// 斜長條拆段（關節鏈穿模檢查用包圍盒，見 docs/three-parts.md 第五節）
const SEG = (o, ax, n) => {
  const th = ((o.rot?.[1] ?? 0) * Math.PI) / 180, dir = ax === 0 ? [Math.cos(th), 0, -Math.sin(th)] : [Math.sin(th), 0, Math.cos(th)];
  const L = o.size[ax], l = L / n, base = o.at ?? [[0, 0, 0]], at = [];
  for (const b of base) for (let i = 0; i < n; i++) { const u = (i - (n - 1) / 2) * l; at.push([R2((b[0] ?? 0) + dir[0] * u), R2(b[1] ?? 0), R2((b[2] ?? 0) + dir[2] * u)]); }
  const size = [...o.size]; size[ax] = R2(l * 1.04);
  return P({ ...o, size, at });
};
const LAY = (id, outline, bg) => layers.push({ id, z: 0, k: 0, outline, ...(bg ? { bg: true } : {}) });
const V = [90, 0, 0];
const ring = (n, r, a0 = 0) => Array.from({ length: n }, (_, i) => { const [x, z] = pol(a0 + (i * 360) / n, r); return [x, 0, z]; });

// ═════ 地板 ═════
LAY("floor", [104, 2, 4, -0.3], true);
P({ id: "floor", layer: "floor", shape: "slab", size: [104, 0.5, 56], r: 0.2, pos: [4, -0.25, 2], mat: "floor" });
P({ id: "floorSeam", layer: "floor", shape: "slab", size: [104, 0.04, 0.1], pos: [4, 0.01, 0], at: Array.from({ length: 10 }, (_, i) => [0, 0, -24 + i * 6]), mat: "seam" });

// ═════ 集群平台：六角傳送腔 ═════
const N = 6, AP = 6.6, CR = AP / Math.cos(30 * D2R), SIDE = 2 * AP * Math.tan(30 * D2R);
const hex = (r) => Array.from({ length: N }, (_, i) => pol(30 + i * 60, r));
const yW = 6.58, WT = 0.08;
const FACETS = { llR: 60, llL: 120, pm1: 0, pm2: -60, pm3: -120, pm4: 180 };
LAY("main", [16, 5, 0, 2.6]); LAY("tc", [14, 3, 0, 6.5]); LAY("tcLid", [14, 1, 0, 8.3]);
P({ id: "mainBase", layer: "main", shape: "poly", pts: hex(CR - 0.4), size: [1, 1, 4.6], rot: V, pos: [0, 2.6, 0], mat: "panel2" });
P({ id: "mainBand", layer: "main", shape: "poly", pts: hex(CR - 0.3), size: [1, 1, 0.5], rot: V, pos: [0, 4.6, 0], mat: "band" });
P({ id: "mainFeet", layer: "main", shape: "cyl", size: [0.35, 0.5], rot: V, pos: [0, 0.25, 0], at: hex(CR - 1.2).map(([x, z]) => [x, 0, z]), mat: "dark" });
P({ id: "tcFloor", layer: "tc", shape: "poly", pts: hex(CR), size: [1, 1, 0.3], rot: V, pos: [0, 5.15, 0], mat: "band" });
for (let i = 0; i < N; i++) {
  const a = i * 60, [x, z] = pol(a, AP - 0.18);
  SEG({ id: `tcWallLo${i}`, layer: "tc", shape: "box", size: [0.36, 0.6, SIDE], rot: [0, -a, 0], pos: [x, 5.6, z], mat: "steel2" }, 2, 10);
  SEG({ id: `tcWallHi${i}`, layer: "tc", shape: "box", size: [0.36, 1.0, SIDE], rot: [0, -a, 0], pos: [x, 7.5, z], mat: "steel2" }, 2, 10);
}
P({ id: "tcPost", layer: "tc", shape: "box", size: [0.5, 2.7, 0.5], pos: [0, 6.65, 0], at: hex(CR + 0.15).map(([x, z]) => [x, 0, z]), mat: "steel" });
P({ id: "tcLid", layer: "tcLid", shape: "poly", pts: hex(CR + 0.1), size: [1, 1, 0.45], rot: V, pos: [0, 8.25, 0], mat: "steel2" });
P({ id: "tcWin", layer: "tcLid", shape: "cyl", size: [2.6, 0.2], rot: V, pos: [0, 8.55, 0], mat: "window" });
P({ id: "tcWinRing", layer: "tcLid", shape: "tube", size: [3.0, 2.6, 0.3], rot: V, pos: [0, 8.6, 0], mat: "steel" });
P({ id: "tcBolts", layer: "tcLid", shape: "cyl", size: [0.12, 0.3], rot: V, pos: [0, 8.6, 0], at: ring(16, 2.8), mat: "dark" });
P({ id: "tcHandle", layer: "tcLid", shape: "box", size: [1.6, 0.3, 0.3], pos: [0, 8.65, 0], at: [[-4.2, 0, 0], [4.2, 0, 0]], mat: "dark" });
P({ id: "tcHinge", layer: "tcLid", shape: "cyl", size: [0.22, 1.4], rot: [0, 0, 90], pos: [0, 8.3, -AP + 0.1], at: [[-2.2, 0, 0], [2.2, 0, 0]], mat: "steel" });

// 閘閥（slit valve）：上下框條、門板（開＝往下滑 1.2）、下方氣缸
const valve = (key, a) => {
  const [x, z] = pol(a, AP + 0.35), lay = `v_${key}`, door = `vd_${key}`;
  LAY(lay, [5.2, 2, x, 6.4]); LAY(door, [4.4, 1.3, x, 6.45]);
  P({ id: `${lay}Top`, layer: lay, shape: "box", size: [0.7, 0.4, SIDE - 1.2], rot: [0, -a, 0], pos: [x, 7.2, z], mat: "stage" });
  P({ id: `${lay}Bot`, layer: lay, shape: "box", size: [0.7, 0.4, SIDE - 1.2], rot: [0, -a, 0], pos: [x, 5.7, z], mat: "stage" });
  P({ id: `${lay}Cyl`, layer: lay, shape: "cyl", size: [0.28, 1.0], rot: V, pos: [x, 5.0, z], mat: "steel" });
  const [ox, oz] = pol(a, AP + 0.55);
  SEG({ id: `${door}`, layer: door, shape: "box", size: [0.18, 1.1, SIDE - 1.8], rot: [0, -a, 0], pos: [ox, 6.45, oz], mat: "dark" }, 2, 10);
  return { lay, door };
};
const VALVES = Object.fromEntries(Object.entries(FACETS).map(([k, a]) => [k, valve(k, a)]));

// 真空手臂（同 tech-amat 的關節鏈：大臂 j1、小臂 j2、腕 j3、升降刀片 lift；陶瓷叉片）
const L1 = 4, BL = 2.8, yR = 5.75;
LAY("vr", [9, 1.5, 4, 6]); LAY("wf", [3, 0.3, -3.4, yW]);
P({ id: "vrBase", layer: "vr", shape: "cyl", size: [0.9, 0.4], rot: V, pos: [0, 5.5, 0], mat: "dark" });
P({ id: "vrShoulder", layer: "vr", shape: "cyl", size: [0.5, 0.5], rot: V, pos: [0, 5.92, 0], mat: "steel" });
SEG({ id: "vrLink1", layer: "vr", shape: "box", size: [L1, 0.2, 0.8], pos: [L1 / 2, 6.02, 0], mat: "steel2" }, 0, 6);
P({ id: "vrElbow", layer: "vr", shape: "cyl", size: [0.4, 0.44], rot: V, pos: [L1, 6.13, 0], mat: "steel" });
SEG({ id: "vrLink2", layer: "vr", shape: "box", size: [L1, 0.2, 0.62], pos: [L1 * 1.5, 6.24, 0], mat: "steel2" }, 0, 6);
P({ id: "vrWrist", layer: "vr", shape: "cyl", size: [0.34, 0.16], rot: V, pos: [2 * L1, 6.36, 0], mat: "steel" });
P({ id: "vrBladeRoot", layer: "vr", shape: "box", size: [0.7, 0.06, 0.7], pos: [2 * L1 + 0.3, 6.44, 0], mat: "dark" });
SEG({ id: "vrBlade", layer: "vr", shape: "box", size: [2.7, 0.06, 0.3], pos: [2 * L1 + BL, 6.44, 0], at: [[0, 0, -0.55], [0, 0, 0.55]], mat: "ceramic" }, 0, 9);
P({ id: "vrPad", layer: "vr", shape: "cyl", size: [0.12, 0.05], rot: V, pos: [2 * L1 + BL, 6.495, 0], at: [[-0.9, 0, -0.55], [-0.9, 0, 0.55], [1.0, 0, -0.55], [1.0, 0, 0.55]], mat: "dark" });
const kinVr = {
  layer: "vr", tip: "lift", size: 2 * L1 + BL, grip: [2 * L1 + BL, 6.52, 0],
  joints: [
    { id: "j1", type: "rot", axis: [0, 1, 0], pivot: [0, 6.02, 0], parts: ["vrShoulder", "vrLink1"], min: -400, max: 400 },
    { id: "j2", parent: "j1", type: "rot", axis: [0, 1, 0], pivot: [L1, 6.13, 0], parts: ["vrElbow", "vrLink2"], min: -175, max: 175 },
    { id: "j3", parent: "j2", type: "rot", axis: [0, 1, 0], pivot: [2 * L1, 6.36, 0], parts: ["vrWrist"], min: -175, max: 175 },
    { id: "lift", parent: "j3", type: "slide", axis: [0, 1, 0], parts: ["vrBladeRoot", "vrBlade", "vrPad"], min: -0.3, max: 0.5 },
  ],
  body: ["vrBase", "vrShoulder", "vrLink1", "vrElbow", "vrLink2", "vrWrist", "vrBladeRoot", "vrBlade", "vrPad"],
  info: { L1, BL, yR },
};
// 被搬的晶圓：一開始在左裝載閘的層架上
const [LLx, LLz] = pol(FACETS.llL, AP + 0.8 + 2.2);
P({ id: "wf", layer: "wf", shape: "cyl", size: [1.5, WT], rot: V, pos: [LLx, yW, LLz], mat: "wafer" });
P({ id: "wfNotch", layer: "wf", shape: "box", size: [0.18, 0.09, 0.12], pos: [LLx, yW + 0.005, LLz - 1.45], mat: "dark" });

// ── 蝕刻腔（physics-spec 2-A／2-B）──
// 共用：腔體（鋁腔＋內襯＋側邊光學感測窗＋法蘭＋補強環）、底下節流閥＋渦輪分子泵（圓柱＋上方轉子盤）＋前級粗管、
//       靜電吸盤 ESC（陶瓷頂盤＋內埋電極暗線＋背面氦氣孔＋冷卻水道＋偏壓饋入桿）、邊緣環、升降銷、偏壓射頻電纜
const RR = 3.0, H = 3.9;
const CH = {};
const etchChamber = (key, a, type) => {
  const [x, z] = pol(a, AP + 0.8 + RR), top = 4.6 + H;
  const body = `${key}Body`, pump = `${key}Pump`, esc = `${key}Esc`, rng = `${key}Ring`, glow = `${key}Glow`, lid = `${key}Lid`;
  LAY(body, [2 * RR + 0.6, H, x, 4.6 + H / 2]); LAY(pump, [3, 4.4, x, 2.4]); LAY(esc, [4.4, 1.6, x, 5.6]); LAY(rng, [4.4, 0.4, x, yW]); LAY(glow, [4.4, 1.6, x, 7.6]); LAY(lid, [7, 3.6, x, top + 1.6]);
  // 腔壁：一般腔用整圈圓管；pm1（手臂伸進去的那一腔）改成 24 片弧板拼成，面向傳送腔一側在晶圓高度留 slit 開口，
  //       每片再切成 ≤0.55 高的小段（關節鏈穿模檢查用包圍盒，斜放的長板會被放大成大方塊）
  if (key !== "pm1") {
    P({ id: `${body}`, layer: body, shape: "tube", size: [RR, RR - 0.22, H], rot: V, pos: [x, 4.6 + H / 2, z], mat: "steel2" });
    P({ id: `${body}Liner`, layer: body, shape: "tube", size: [RR - 0.24, RR - 0.34, H - 0.6], rot: V, pos: [x, 4.6 + H / 2 + 0.1, z], mat: "ceramic" });
  } else {
    const slotY0 = yW - 0.55, slotY1 = yW + 0.55, face = a + 180, seg = R2(2 * RR * Math.tan(7.6 * D2R));
    const cut = (y0, y1) => { const n = Math.ceil((y1 - y0) / 0.55), h = (y1 - y0) / n; return { h: R2(h * 1.02), ys: Array.from({ length: n }, (_, k) => R2(y0 + h * (k + 0.5))) }; };
    for (let i = 0; i < 24; i++) {
      const t = i * 15, [px, pz] = pol(t, RR - 0.11), [lx, lz] = pol(t, RR - 0.29), d = Math.abs(((t - face + 540) % 360) - 180);
      const spans = d < 55 ? [[4.6, slotY0], [slotY1, 4.6 + H]] : [[4.6, 4.6 + H]];
      spans.forEach(([y0, y1], j) => {
        const c = cut(y0, y1);
        P({ id: `${body}W${i}_${j}`, layer: body, shape: "box", size: [0.22, c.h, seg], rot: [0, -t, 0], pos: [R2(x + px), 0, R2(z + pz)], at: c.ys.map((y) => [0, y, 0]), mat: "steel2" });
        P({ id: `${body}L${i}_${j}`, layer: body, shape: "box", size: [0.1, c.h, R2(seg * 0.95)], rot: [0, -t, 0], pos: [R2(x + lx), 0, R2(z + lz)], at: c.ys.filter((y) => y < 4.6 + H - 0.5).map((y) => [0, y, 0]), mat: "ceramic" });
      });
    }
  }
  P({ id: `${body}Floor`, layer: body, shape: "cyl", size: [RR, 0.3], rot: V, pos: [x, 4.75, z], mat: "steel" });
  P({ id: `${body}Fl`, layer: body, shape: "tube", size: [RR + 0.25, RR - 0.1, 0.3], rot: V, pos: [x, top - 0.15, z], mat: "steel" });
  P({ id: `${body}Rib`, layer: body, shape: "tube", size: [RR + 0.12, RR - 0.05, 0.22], rot: V, pos: [x, 4.6 + H * 0.22, z], mat: "steel" });
  // 光學感測窗（終端點偵測）＋光纖
  { const [px, pz] = pol(a + 40, RR + 0.12); P({ id: `${body}Oes`, layer: body, shape: "cyl", size: [0.42, 0.34], rot: [90, 0, 90 - (a + 40)], pos: [R2(x + px), 4.6 + H * 0.68, R2(z + pz)], mat: "window" });
    const [qx, qz] = pol(a + 40, RR + 0.5); P({ id: `${body}OesBox`, layer: body, shape: "slab", size: [0.6, 0.7, 0.6], r: 0.1, pos: [R2(x + qx), 4.6 + H * 0.68, R2(z + qz)], mat: "band" }); }
  P({ id: `${body}Skirt`, layer: pump, shape: "tube", size: [RR + 0.05, RR - 0.25, 0.5], rot: V, pos: [x, 4.35, z], mat: "panel2" });
  { const [bx, bz] = pol(a, -(RR + 0.4) / 2); P({ id: `${body}Beam`, layer: pump, shape: "box", size: [RR + 1.2, 4.1, 1.6], rot: [0, -a, 0], pos: [R2(x + bx), 2.05, R2(z + bz)], mat: "panel2" }); }
  P({ id: `${body}Foot`, layer: pump, shape: "tube", size: [RR - 0.2, RR - 0.5, 0.3], rot: V, pos: [x, 0.15, z], mat: "dark" });
  P({ id: `${body}Legs`, layer: pump, shape: "box", size: [0.35, 4.4, 0.35], pos: [x, 2.3, z], at: [45, 135, 225, 315].map((t) => { const [px, pz] = pol(t, RR - 0.6); return [px, 0, pz]; }), mat: "dark" });
  // 抽氣：腔底偏一側的抽氣口 → 節流閥（扁圓盒＋閥片）→ 渦輪分子泵（圓柱＋頂部轉子盤，會轉）→ 前級粗管（黑色波紋管，往畫面外）
  const [ux, uz] = pol(a, 1.2), PX = R2(x + ux), PZ = R2(z + uz);
  P({ id: `${pump}Throttle`, layer: pump, shape: "cyl", size: [0.95, 0.4], rot: V, pos: [PX, 4.25, PZ], mat: "steel" });
  P({ id: `${pump}Body`, layer: pump, shape: "cyl", size: [0.9, 2.0], rot: V, pos: [PX, 3.05, PZ], mat: "steel2" });
  P({ id: `${pump}Fl`, layer: pump, shape: "tube", size: [1.12, 0.7, 0.24], rot: V, pos: [PX, 4.0, PZ], at: [[0, 0, 0], [0, -1.95, 0]], mat: "dark" });
  [0, 60, 120].forEach((t, j) => P({ id: `${pump}Rotor${j}`, layer: pump, shape: "box", size: [1.5, 0.06, 0.16], rot: [0, t, 0], pos: [PX, 3.82, PZ], mat: "dark" }));
  P({ id: `${pump}Fore`, layer: pump, shape: "cyl", size: [0.32, 1.9], rot: V, pos: [PX, 1.1, PZ], mat: "rubber" });
  P({ id: `${pump}ForeRib`, layer: pump, shape: "tube", size: [0.4, 0.3, 0.08], rot: V, pos: [PX, 0.4, PZ], at: Array.from({ length: 7 }, (_, i) => [0, R2(i * 0.24), 0]), mat: "dark" });
  // ESC：陶瓷頂盤、內埋電極（暗色細環）、背面氦氣孔、基座、冷卻水（藍進紅出）、偏壓饋入桿
  const escTop = yW - WT / 2;
  P({ id: `${esc}`, layer: esc, shape: "cyl", size: [1.62, 0.18], rot: V, pos: [x, escTop - 0.09, z], mat: type === "cryo" ? "frost" : "esc" });
  P({ id: `${esc}Elec`, layer: esc, shape: "tube", size: [1.3, 1.2, 0.02], rot: V, pos: [x, escTop - 0.01, z], at: [[0, 0, 0]], mat: "dark" });
  P({ id: `${esc}Elec2`, layer: esc, shape: "tube", size: [0.75, 0.65, 0.02], rot: V, pos: [x, escTop - 0.01, z], mat: "dark" });
  P({ id: `${esc}He`, layer: esc, shape: "cyl", size: [0.04, 0.02], rot: V, pos: [x, escTop - 0.005, z], at: [...ring(12, 1.0), ...ring(6, 0.45), [0, 0, 0]], mat: "pipeB" });
  P({ id: `${esc}Base`, layer: esc, shape: "cyl", size: [1.78, 0.55], rot: V, pos: [x, escTop - 0.46, z], mat: type === "cryo" ? "frost" : "stage" });
  P({ id: `${esc}Stem`, layer: esc, shape: "cyl", size: [0.45, 1.3], rot: V, pos: [x, 5.35, z], mat: "steel" });
  P({ id: `${esc}Feed`, layer: esc, shape: "cyl", size: [0.16, 1.6], rot: V, pos: [x, 4.0, z], mat: "copper" });
  { const [ox, oz] = pol(a + 90, 0.34), yb = R2(escTop - 0.74); // 冷卻水：從腔底往上沿吸盤桿兩側接進底座（藍進紅出），底下水平接到機台外
    P({ id: `${esc}WaterIn`, layer: esc, shape: "cyl", size: [0.1, R2(yb - 2.0)], rot: V, pos: [R2(x + ox), R2((yb + 2.0) / 2), R2(z + oz)], mat: "pipeB" });
    P({ id: `${esc}WaterOut`, layer: esc, shape: "cyl", size: [0.1, R2(yb - 2.0)], rot: V, pos: [R2(x - ox), R2((yb + 2.0) / 2), R2(z - oz)], mat: "pipeR" });
    P({ id: `${esc}WaterRun`, layer: esc, shape: "cyl", size: [0.1, 2.2], rot: [0, 0, 90], pos: [R2(x + 1.1), 2.0, z], at: [[R2(ox), 0, R2(oz)], [R2(-ox), 0, R2(-oz)]], mat: "steel" }); }
  // 邊緣環：晶圓外緣一圈（矽色），下面一圈石英色的承環
  P({ id: `${rng}`, layer: rng, shape: "tube", size: [1.98, 1.54, 0.14], rot: V, pos: [x, escTop + 0.03, z], mat: "ringSi" });
  P({ id: `${rng}Base`, layer: rng, shape: "tube", size: [2.15, 1.66, 0.12], rot: V, pos: [x, escTop - 0.1, z], mat: "ceramic" });
  LAY(`${key}Pins`, [2.4, 0.8, x, 6.2]);
  P({ id: `${key}Pins`, layer: `${key}Pins`, shape: "cyl", size: [0.07, 0.7], rot: V, pos: [x, escTop - 0.35, z], at: [[0, 1.0], [130, 1.0], [230, 1.0]].map(([t, rr]) => { const [px, pz] = pol(a + t, rr); return [px, 0, pz]; }), mat: "ceramic" });
  CH[key] = { x, z, top, a, body, pump, esc, rng, glow, lid, PX, PZ, escTop };
  return CH[key];
};
// ICP（導體蝕刻，pm1、pm2）：介電窗＋內外兩組平面螺旋線圈＋線圈遮罩罩＋匹配箱＋射頻電纜＋中央氣體注入口
const icpBuild = (key, a) => {
  const c = etchChamber(key, a, "icp"), { x, z, top, lid, glow } = c, coil = `${key}Coil`, win = `${key}Win`;
  LAY(coil, [5, 0.6, x, top + 0.5]); LAY(win, [6.4, 0.6, x, top + 0.1]);
  P({ id: `${win}`, layer: win, shape: "cyl", size: [RR + 0.15, 0.36], rot: V, pos: [x, top + 0.12, z], mat: "dielectric" });
  P({ id: `${win}Clamp`, layer: win, shape: "tube", size: [RR + 0.32, RR - 0.05, 0.22], rot: V, pos: [x, top + 0.36, z], mat: "steel" });
  P({ id: `${win}Inj`, layer: win, shape: "cyl", size: [0.28, 0.6], rot: V, pos: [x, top + 0.2, z], mat: "steel" });
  // 線圈：內 3 圈、外 3 圈（扁平銅帶，示意平面螺旋），兩組各自饋電
  const coilR = [0.62, 0.86, 1.1, 1.72, 1.96, 2.2];
  coilR.forEach((r, i) => P({ id: `${coil}${i}`, layer: coil, shape: "tube", size: [r + 0.09, r - 0.05, 0.16], rot: V, pos: [x, top + 0.42, z], mat: "copper" }));
  P({ id: `${coil}Tap`, layer: coil, shape: "box", size: [0.14, 0.5, 0.14], pos: [x, top + 0.66, z], at: [[1.1, 0, 0], [2.2, 0, 0], [-0.62, 0, 0], [-1.72, 0, 0]], mat: "copper" });
  P({ id: `${lid}Can`, layer: lid, shape: "tube", size: [RR + 0.1, RR - 0.08, 1.5], rot: V, pos: [x, top + 1.25, z], mat: "panel" });
  P({ id: `${lid}CanTop`, layer: lid, shape: "cyl", size: [RR + 0.1, 0.12], rot: V, pos: [x, top + 2.02, z], mat: "panel" });
  P({ id: `${lid}Vent`, layer: lid, shape: "box", size: [1.6, 0.05, 0.12], pos: [x, top + 2.1, z], at: Array.from({ length: 7 }, (_, i) => [0, 0, R2(-1.2 + i * 0.4)]), mat: "seam" });
  P({ id: `${lid}Match`, layer: lid, shape: "slab", size: [1.9, 1.3, 1.5], r: 0.15, pos: [x, top + 2.8, z - 0.2], mat: "band" });
  P({ id: `${lid}MatchKnob`, layer: lid, shape: "cyl", size: [0.16, 0.2], rot: [0, 0, 90], pos: [x + 0.98, top + 2.8, z - 0.2], at: [[0, 0.3, -0.3], [0, 0.3, 0.3], [0, -0.25, 0]], mat: "steel" });
  P({ id: `${lid}Rf`, layer: lid, shape: "cyl", size: [0.16, 3.2], rot: [0, 0, 90], pos: [x - 2.4, top + 3.1, z - 0.2], mat: "rubber" });
  P({ id: `${lid}Gas`, layer: lid, shape: "cyl", size: [0.1, 2.6], rot: [0, 0, 90], pos: [x - 1.6, top + 2.25, z + 0.9], mat: "steel2" });
  // 電漿：介電窗下方厚圓盤（最亮）、往下漸暗；晶圓上方一層暗的鞘層
  const gY = top - 0.75;
  P({ id: `${glow}Core`, layer: glow, shape: "cyl", size: [2.2, 0.6], rot: V, pos: [x, R2(top - 0.42), z], mat: "glowIHot" });
  P({ id: `${glow}`, layer: glow, shape: "cyl", size: [2.6, 0.5], rot: V, pos: [x, R2(top - 0.55), z], mat: "glowI" });
  P({ id: `${glow}Mid`, layer: glow, shape: "cyl", size: [2.6, 0.5], rot: V, pos: [x, R2(top - 1.05), z], mat: "glowI2" });
  P({ id: `${glow}Low`, layer: glow, shape: "cyl", size: [2.6, 0.45], rot: V, pos: [x, R2(top - 1.52), z], mat: "glowI3" });
  P({ id: `${glow}Sheath`, layer: glow, shape: "cyl", size: [1.62, 0.12], rot: V, pos: [x, yW + 0.1, z], mat: "sheath" });
  Object.assign(c, { coil, win, gY, type: "icp" });
  return c;
};
// CCP（介電蝕刻，pm3；pm4＝低溫版）：噴淋頭上電極（底面孔陣）＋限制環＋大射頻箱（兩組頻率）
const ccpBuild = (key, a, cryo) => {
  const c = etchChamber(key, a, cryo ? "cryo" : "ccp"), { x, z, top, lid, glow } = c, sh = `${key}SH`, conf = `${key}Conf`;
  LAY(sh, [5.6, 0.8, x, top - 0.6]); LAY(conf, [4.6, 1.2, x, 7.2]);
  P({ id: `${lid}Plate`, layer: lid, shape: "cyl", size: [RR + 0.25, 0.34], rot: V, pos: [x, top + 0.08, z], mat: "steel" });
  P({ id: `${lid}Rf`, layer: lid, shape: "slab", size: [2.6, 1.7, 2.0], r: 0.18, pos: [x, top + 1.15, z], mat: "band" });
  P({ id: `${lid}RfLed`, layer: lid, shape: "box", size: [0.08, 0.12, 1.2], pos: [x + 1.32, top + 1.4, z], at: [[0, 0, 0], [0, -0.35, 0]], mat: "screen" });
  P({ id: `${lid}Gas`, layer: lid, shape: "cyl", size: [0.1, 2.4], rot: [0, 0, 90], pos: [x - 2.2, top + 0.5, z + 1.0], at: [[0, 0, 0], [0, 0, 0.3]], mat: "steel2" });
  const SHY = top - 0.55;
  P({ id: `${sh}`, layer: sh, shape: "cyl", size: [2.4, 0.24], rot: V, pos: [x, SHY, z], mat: "ringSi" });
  const holes = [[0, 0, 0]];
  for (let r = 1; r <= 5; r++) holes.push(...ring(r * 7, r * 0.4, r * 7));
  P({ id: `${sh}Holes`, layer: sh, shape: "cyl", size: [0.05, 0.04], rot: V, pos: [x, SHY - 0.12, z], at: holes, mat: "dark" });
  P({ id: `${sh}Plen`, layer: sh, shape: "cyl", size: [2.2, 0.28], rot: V, pos: [x, SHY + 0.27, z], mat: "steel" });
  P({ id: `${conf}`, layer: conf, shape: "tube", size: [2.3, 2.12, 0.05], rot: V, pos: [x, 6.9, z], at: [[0, 0, 0], [0, 0.22, 0], [0, 0.44, 0], [0, 0.66, 0]], mat: cryo ? "frostRim" : "ceramic" });
  P({ id: `${glow}`, layer: glow, shape: "cyl", size: [2.05, R2(SHY - 0.14 - (yW + 0.2))], rot: V, pos: [x, R2((SHY - 0.14 + yW + 0.2) / 2), z], mat: cryo ? "glowCold" : "glowC" });
  P({ id: `${glow}Core`, layer: glow, shape: "cyl", size: [1.8, 0.3], rot: V, pos: [x, R2(yW + 0.55), z], mat: cryo ? "glowCold" : "glowCHot" });
  P({ id: `${glow}Sheath`, layer: glow, shape: "cyl", size: [1.62, 0.08], rot: V, pos: [x, yW + 0.11, z], mat: "sheath" });
  if (cryo) P({ id: `${c.esc}Rim`, layer: c.esc, shape: "tube", size: [1.9, 1.66, 0.22], rot: V, pos: [x, R2(c.escTop - 0.4), z], mat: "frostRim" });
  P({ id: `${key}Wf`, layer: c.esc, shape: "cyl", size: [1.5, WT], rot: V, pos: [x, yW, z], mat: "wafer" });
  Object.assign(c, { sh, conf, SHY, type: cryo ? "cryo" : "ccp" });
  return c;
};
const PM1 = icpBuild("pm1", FACETS.pm1), PM2 = icpBuild("pm2", FACETS.pm2), PM3 = ccpBuild("pm3", FACETS.pm3, false), PM4 = ccpBuild("pm4", FACETS.pm4, true);
P({ id: "pm2Wf", layer: PM2.esc, shape: "cyl", size: [1.5, WT], rot: V, pos: [PM2.x, yW, PM2.z], mat: "wafer" });
// pm1 蝕刻中的晶圓表面：圖案化的硬罩幕（暗色細格，示意）——被搬進來的晶圓 wf 放到 pm1 後，這層在 s5 前出現
LAY("pm1Mask", [3.2, 0.2, PM1.x, yW]);
P({ id: "pm1Mask", layer: "pm1Mask", shape: "box", size: [2.0, 0.012, 0.05], pos: [PM1.x, yW + WT / 2 + 0.006, PM1.z], at: Array.from({ length: 9 }, (_, i) => [0, 0, R2(-1.0 + i * 0.25)]), mat: "band" });

// 裝載閘 ×2
const llBuild = (key, a) => {
  const [x, z] = pol(a, AP + 0.8 + 2.2), body = `${key}`, lid = `${key}Lid`, door = `${key}Door`, lamp = `${key}Lamp`;
  LAY(body, [4.6, 3.5, x, 6.2]); LAY(lid, [4.6, 1, x, 8.1]); LAY(door, [3.6, 1.6, x, 6.5]);
  const R = [0, -a, 0], o = (r, t = 0) => { const [px, pz] = pol(a, r), [tx, tz] = pol(a + 90, t); return [R2(x + px + tx), R2(z + pz + tz)]; };
  P({ id: `${body}Floor`, layer: body, shape: "box", size: [4.4, 0.4, 5.0], rot: R, pos: [x, 5.0, z], mat: "steel2" });
  for (const t of [-1, 1]) { const [sx, sz] = o(0, t * 2.5); SEG({ id: `${body}Side${t > 0 ? "R" : "L"}`, layer: body, shape: "box", size: [4.4, 2.9, 0.3], rot: R, pos: [sx, 6.4, sz], mat: "steel2" }, 0, 9); }
  { const [ox, oz] = o(2.15); SEG({ id: `${body}Outer`, layer: body, shape: "box", size: [0.3, 0.7, 4.8], rot: R, pos: [ox, 5.5, oz], at: [[0, 2.0, 0]], mat: "steel2" }, 2, 8); }
  { const [ox, oz] = o(2.45); SEG({ id: `${door}`, layer: door, shape: "box", size: [0.2, 1.3, 3.6], rot: R, pos: [ox, 6.6, oz], mat: "dark" }, 2, 8); }
  SEG({ id: `${body}Shelf`, layer: body, shape: "box", size: [2.4, 0.12, 0.3], rot: R, pos: [x, yW - WT / 2 - 0.06, z], at: [-1, 1].map((t) => { const [tx, tz] = pol(a + 90, t * 1.3); return [tx, 0, tz]; }), mat: "ceramic" }, 0, 6);
  P({ id: `${lid}`, layer: lid, shape: "box", size: [4.6, 0.35, 5.1], rot: R, pos: [x, 8.0, z], mat: "panel" });
  P({ id: `${lid}Win`, layer: lid, shape: "box", size: [2.2, 0.1, 2.2], rot: R, pos: [x, 8.2, z], mat: "window" });
  { const [lx, lz] = o(1.4, 1.5); P({ id: `${lamp}Y`, layer: lid, shape: "cyl", size: [0.26, 0.4], rot: V, pos: [lx, 8.4, lz], mat: "lampY" }); P({ id: `${lamp}G`, layer: lid, shape: "cyl", size: [0.26, 0.4], rot: V, pos: [lx, 8.82, lz], mat: "lampG" }); }
  { const [px, pz] = o(0.4, -2.8); P({ id: `${body}Pipe`, layer: body, shape: "cyl", size: [0.32, 5.4], rot: V, pos: [px, 3.0, pz], mat: "steel" }); }
  return { x, z, body, lid, door };
};
const LLL = llBuild("llL", FACETS.llL), LLR = llBuild("llR", FACETS.llR);

// EFEM（玻璃牆＋框、頂上 FFU）、大氣手臂、對準器、三個 FOUP 載入埠、塔燈、控制螢幕
const EZ0 = 12.2, EZ1 = 17.0, EX = 9.6, EBZ = 14.8, FOUPZ = EZ1 + 1.35, EH = 15.5; // EFEM 頂高 EH（約 1.55 m，示意）；FOUP 背面貼緊裝載埠面板
LAY("efem", [19, 15, 0, 7.5]); LAY("ffu", [19, 1.4, 0, EH + 0.6]); LAY("eb", [2, 6, LLx, 4]); LAY("foup", [16, 4.6, 0, 6.5]); LAY("sign", [7, 3, 0, EH - 2.6]); LAY("tower", [1, 3, -9, EH + 2.5]); LAY("ctrl", [3, 4, 11, 8]);
P({ id: "efemBase", layer: "efem", shape: "slab", size: [2 * EX, 3.4, EZ1 - EZ0], r: 0.2, pos: [0, 1.9, (EZ0 + EZ1) / 2], mat: "panel2" });
P({ id: "efemKick", layer: "efem", shape: "box", size: [2 * EX + 0.1, 0.5, 0.1], pos: [0, 0.4, EZ1 + 0.02], mat: "dark" });
P({ id: "efemFrontPanel", layer: "efem", shape: "box", size: [2 * EX, EH - 9.0, 0.2], pos: [0, (EH + 9.0) / 2, EZ1], mat: "panel" });
P({ id: "efemPortPanel", layer: "efem", shape: "box", size: [2 * EX, 5.4, 0.2], pos: [0, 6.3, EZ1 - 0.05], mat: "panel2" });
P({ id: "efemSide", layer: "efem", shape: "box", size: [0.2, EH - 3.6, EZ1 - EZ0], pos: [0, (EH + 3.6) / 2, (EZ0 + EZ1) / 2], at: [[-EX, 0, 0], [EX, 0, 0]], mat: "panel" });
P({ id: "efemWin", layer: "efem", shape: "box", size: [0.06, 2.4, 3.2], pos: [EX + 0.12, 7.2, (EZ0 + EZ1) / 2], mat: "window" });
P({ id: "efemBack", layer: "efem", shape: "box", size: [2 * EX, EH - 9.0, 0.2], pos: [0, (EH + 9.0) / 2, EZ0], mat: "panel2" });
P({ id: "efemPost", layer: "efem", shape: "box", size: [0.4, EH - 3.6, 0.4], pos: [0, (EH + 3.6) / 2, 0], at: [[-EX, 0, EZ0], [EX, 0, EZ0], [-EX, 0, EZ1], [EX, 0, EZ1], [-3.2, 0, EZ1], [3.2, 0, EZ1]], mat: "seam" });
P({ id: "efemFront", layer: "efem", shape: "box", size: [2 * EX, 0.35, 0.35], pos: [0, EH - 0.2, EZ1], mat: "seam" });
P({ id: "efemRail", layer: "efem", shape: "box", size: [2 * EX - 1, 0.25, 0.6], pos: [0, 3.75, EBZ], mat: "steel" });
P({ id: "efemPortTun", layer: "efem", shape: "box", size: [3.2, 1.6, EZ0 - 11.4], pos: [LLx, 6.45, (EZ0 + 11.4) / 2], at: [[0, 0, 0], [-2 * LLx, 0, 0]], mat: "glass" });
P({ id: "aligner", layer: "efem", shape: "cyl", size: [0.7, 0.9], rot: V, pos: [7.4, 4.35, 13.6], mat: "dark" });
P({ id: "alignerTop", layer: "efem", shape: "cyl", size: [1.2, 0.08], rot: V, pos: [7.4, 4.85, 13.6], mat: "wafer" });
P({ id: "ffu", layer: "ffu", shape: "slab", size: [2 * EX + 0.4, 1.1, EZ1 - EZ0 + 0.4], r: 0.15, pos: [0, EH + 0.6, (EZ0 + EZ1) / 2], mat: "panel" });
P({ id: "ffuGrill", layer: "ffu", shape: "box", size: [2 * EX - 1, 0.06, 0.18], pos: [0, EH + 0.02, (EZ0 + EZ1) / 2], at: Array.from({ length: 11 }, (_, i) => [0, 0, R2(-2.0 + i * 0.4)]), mat: "seam" });
P({ id: "ffuDuct", layer: "ffu", shape: "cyl", size: [0.7, 0.5], rot: V, pos: [-5, EH + 1.35, (EZ0 + EZ1) / 2], mat: "steel2" });
P({ id: "ebCar", layer: "eb", shape: "slab", size: [1.6, 0.5, 1.4], r: 0.1, pos: [LLx, 4.1, EBZ], mat: "dark" });
P({ id: "ebCol", layer: "eb", shape: "cyl", size: [0.5, 1.6], rot: V, pos: [LLx, 5.1, EBZ], mat: "steel" });
P({ id: "ebHead", layer: "eb", shape: "slab", size: [1.2, 0.4, 1.6], r: 0.15, pos: [LLx, 5.95, EBZ], mat: "stage" });
P({ id: "ebArm", layer: "eb", shape: "box", size: [0.5, 0.18, 1.8], pos: [LLx, 6.15, EBZ], mat: "steel2" });
P({ id: "ebBlade", layer: "eb", shape: "box", size: [0.3, 0.06, 2.4], pos: [LLx, yW - WT / 2 - 0.08, EBZ], at: [[-0.5, 0, 0], [0.5, 0, 0]], mat: "ceramic" });
// 三個 FOUP（米白、前開門、正面透明窗看得到疊放的晶圓、頂部抓取法蘭）
[-5.6, 0, 5.6].forEach((fx, i) => {
  P({ id: `lp${i}`, layer: "foup", shape: "box", size: [3.6, 4.4, 0.3], pos: [fx, 4.0, EZ1 + 0.2], mat: "panel" });
  P({ id: `lpShelf${i}`, layer: "foup", shape: "slab", size: [3.6, 0.3, 3.6], r: 0.1, pos: [fx, 4.7, FOUPZ], mat: "stage" });
  P({ id: `foup${i}`, layer: "foup", shape: "slab", size: [3.4, 3.1, 3.2], r: 0.45, pos: [fx, 6.4, FOUPZ + 0.25], mat: "foup" });
  P({ id: `foupFl${i}`, layer: "foup", shape: "slab", size: [1.7, 0.25, 1.4], r: 0.1, pos: [fx, 8.15, FOUPZ + 0.25], mat: "dark" });
  P({ id: `foupFlNeck${i}`, layer: "foup", shape: "box", size: [0.6, 0.4, 0.6], pos: [fx, 7.9, FOUPZ + 0.25], mat: "dark" });
});
// 塔燈（紅黃綠）＋控制螢幕懸臂
P({ id: "towerPole", layer: "tower", shape: "cyl", size: [0.1, 3.0], rot: V, pos: [-9, EH + 2.4, EZ1 - 0.6], mat: "steel" });
P({ id: "towerR", layer: "tower", shape: "cyl", size: [0.28, 0.45], rot: V, pos: [-9, EH + 4.35, EZ1 - 0.6], mat: "lampR" });
P({ id: "towerY", layer: "tower", shape: "cyl", size: [0.28, 0.45], rot: V, pos: [-9, EH + 3.88, EZ1 - 0.6], mat: "lampY" });
P({ id: "towerG", layer: "tower", shape: "cyl", size: [0.28, 0.45], rot: V, pos: [-9, EH + 3.41, EZ1 - 0.6], mat: "lampG" });
P({ id: "ctrlArm", layer: "ctrl", shape: "box", size: [0.2, 0.2, 2.2], pos: [EX + 0.4, 8.6, EZ1 + 0.9], mat: "steel" });
P({ id: "ctrlScreen", layer: "ctrl", shape: "slab", size: [2.6, 1.7, 0.18], r: 0.08, pos: [EX + 0.4, 8.0, EZ1 + 2.0], mat: "band" });
P({ id: "ctrlLines", layer: "ctrl", shape: "box", size: [2.0, 0.1, 0.04], pos: [EX + 0.4, 8.45, EZ1 + 2.1], grid: { n: [1, 5], step: [0, -0.22] }, mat: "screen" });
// 廠牌：EFEM 頂上掛科林研發 LOGO（Commons 原檔轉貼圖，不改色）＋美國國旗旗桿
const LOGO_AR = 713 / 320;
// 廠牌：LOGO 貼在 EFEM 正面板上半部的平面銘板（≤ EFEM 寬的 1/3）；國旗只放在 2D 公司卡
P({ id: "signBack", layer: "sign", shape: "box", size: [6.0, R2(6.0 / LOGO_AR + 0.4), 0.06], pos: [0, EH - 2.6, EZ1 + 0.13], mat: "panel" });
P({ id: "signLogo", layer: "sign", shape: "plane", size: [5.6, R2(5.6 / LOGO_AR)], pos: [0, EH - 2.6, EZ1 + 0.17], uv01: true, shadow: false, mat: "t_lam" });

// ═════ 外圍（機台後方）：氣櫃（MFC 一排＋氣動閥＋不銹鋼管）、射頻產生器櫃、冷卻機（含低溫機櫃）═════
const GX = -6, GZ = -20.5;
LAY("gas", [7, 9, GX, 4.5]); LAY("rfgen", [6, 7, 7, 3.5]); LAY("chill", [6, 6, -18, 3]);
P({ id: "gasCab", layer: "gas", shape: "slab", size: [6.4, 8.4, 2.6], r: 0.2, pos: [GX, 4.2, GZ], mat: "panel" });
P({ id: "gasCabIn", layer: "gas", shape: "box", size: [5.6, 7.0, 0.1], pos: [GX, 4.6, GZ + 1.31], mat: "band" });
P({ id: "gasMfc", layer: "gas", shape: "slab", size: [0.7, 1.1, 0.5], r: 0.06, pos: [GX, 6.6, GZ + 1.6], grid: { n: [6, 1], step: [0.88, 0] }, mat: "steel2" });
P({ id: "gasMfcLed", layer: "gas", shape: "box", size: [0.4, 0.14, 0.04], pos: [GX, 6.85, GZ + 1.86], grid: { n: [6, 1], step: [0.88, 0] }, mat: "lampG" });
P({ id: "gasValve", layer: "gas", shape: "cyl", size: [0.2, 0.4], rot: V, pos: [GX, 4.4, GZ + 1.6], grid: { n: [6, 2], step: [0.88, -1.2] }, mat: "dark" });
P({ id: "gasPipe", layer: "gas", shape: "cyl", size: [0.07, 5.0], rot: V, pos: [GX, 4.4, GZ + 1.45], grid: { n: [6, 1], step: [0.88, 0] }, mat: "steel2" });
P({ id: "gasHeader", layer: "gas", shape: "cyl", size: [0.12, 5.2], rot: [0, 0, 90], pos: [GX, 8.2, GZ + 1.45], mat: "steel2" });
P({ id: "gasStripe", layer: "gas", shape: "box", size: [6.4, 0.4, 0.05], pos: [GX, 8.7, GZ + 1.32], mat: "lampY" });
P({ id: "gasLine", layer: "gas", shape: "cyl", size: [0.12, 9.0], rot: V, pos: [GX + 2.6, 10.0, GZ + 1.45], mat: "steel2" });
P({ id: "gasLineRun", layer: "gas", shape: "cyl", size: [0.12, 8.6], rot: [90, 0, 0], pos: [GX + 2.6, 14.5, GZ + 5.7], mat: "steel2" });
P({ id: "rfGen", layer: "rfgen", shape: "slab", size: [4.8, 6.4, 2.6], r: 0.2, pos: [7, 3.2, GZ], mat: "panel2" });
P({ id: "rfGenUnit", layer: "rfgen", shape: "slab", size: [4.2, 1.1, 0.2], r: 0.05, pos: [7, 3.55, GZ + 1.35], grid: { n: [1, 4], step: [0, 1.3] }, mat: "band" });
P({ id: "rfGenLed", layer: "rfgen", shape: "box", size: [0.6, 0.12, 0.05], pos: [8.4, 3.65, GZ + 1.47], grid: { n: [1, 4], step: [0, 1.3] }, mat: "screen" });
P({ id: "rfCable", layer: "rfgen", shape: "cyl", size: [0.16, 9.0], rot: [90, 0, 0], pos: [8.6, 6.8, GZ + 5.8], mat: "rubber" });
P({ id: "chiller", layer: "chill", shape: "slab", size: [4.4, 5.0, 3.2], r: 0.2, pos: [-18, 2.5, -8], mat: "panel" });
P({ id: "chillGrill", layer: "chill", shape: "box", size: [0.05, 2.4, 2.6], pos: [-15.78, 2.6, -8], mat: "seam" });
P({ id: "chillBand", layer: "chill", shape: "box", size: [4.4, 0.5, 0.05], pos: [-18, 4.6, -6.38], mat: "pipeB" });
P({ id: "chillCryo", layer: "chill", shape: "slab", size: [3.6, 5.6, 3.0], r: 0.2, pos: [-18, 2.8, -3.6], mat: "frost" });
P({ id: "chillPipeB", layer: "chill", shape: "cyl", size: [0.16, 3.6], rot: [0, 0, 90], pos: [-14.4, 1.0, -3.3], mat: "pipeB" });
P({ id: "chillPipeR", layer: "chill", shape: "cyl", size: [0.16, 3.6], rot: [0, 0, 90], pos: [-14.4, 1.0, -3.9], mat: "pipeR" });

// ═════ 放大剖面模型：3D NAND 記憶孔（右側展示台上；孔寬與深度照 1:100 比例，層數與厚度示意）═════
const HX = 25, HZ = 3, HB = 3.0, HH = 12, HW = 0.12, NHOLE = 5, NSEG = 12;
LAY("har", [8, 16, HX, 8]);
P({ id: "harStand", layer: "har", shape: "slab", size: [8.4, 2.6, 3.2], r: 0.2, pos: [HX, 1.3, HZ], mat: "panel2" });
P({ id: "harStandBand", layer: "har", shape: "box", size: [8.5, 0.3, 3.3], pos: [HX, 2.4, HZ], mat: "band" });
P({ id: "harSi", layer: "har", shape: "box", size: [7, 0.6, 1.4], pos: [HX, HB - 0.3 + 0.2, HZ], mat: "steel2" });
P({ id: "harOx", layer: "har", shape: "box", size: [7, 0.25, 1.4], pos: [HX, HB + 0.5 + 0.125 + 5.75, HZ], grid: { n: [1, 24], step: [0, 0.5] }, mat: "oxide" });
P({ id: "harNi", layer: "har", shape: "box", size: [7, 0.25, 1.4], pos: [HX, HB + 0.5 + 0.375 + 5.75, HZ], grid: { n: [1, 24], step: [0, 0.5] }, mat: "nitride" });
P({ id: "harMask", layer: "har", shape: "box", size: [7, 0.5, 1.4], pos: [HX, HB + 0.5 + HH + 0.25, HZ], mat: "maskM" });
const HXS = [-2.5, -1.25, 0, 1.25, 2.5];
// 硬罩幕開口：在孔的位置挖開（用背景深色小方塊表示開口）
P({ id: "harMaskOpen", layer: "har", shape: "box", size: [HW, 0.52, 0.06], pos: [HX, HB + 0.5 + HH + 0.25, HZ + 0.71], at: HXS.map((u) => [u, 0, 0]), mat: "holeM" });
const SEGH = HH / NSEG;
for (let k = 0; k < NSEG; k++) {
  const l = `hole${k}`, yc = R2(HB + 0.5 + HH - SEGH * (k + 0.5));
  LAY(l, [7, SEGH, HX, yc]);
  P({ id: l, layer: l, shape: "box", size: [HW, R2(SEGH * 1.02), 0.06], pos: [HX, yc, HZ + 0.72], at: HXS.map((u) => [u, 0, 0]), mat: "holeM" });
  P({ id: `${l}Poly`, layer: l, shape: "box", size: [0.035, R2(SEGH * 1.02), 0.07], pos: [HX, yc, HZ + 0.72], at: HXS.flatMap((u) => [[R2(u - HW / 2 - 0.02), 0, 0], [R2(u + HW / 2 + 0.02), 0, 0]]), mat: "polymer" });
}
// 低溫版對照：剖面塊右側再一塊（同一展示台），孔更直；以 frost 底座表示（2D 卡另畫室溫弓形 vs 低溫直孔）

// ═════ 製程動作（physics-spec 第 3 節）═════
const lpt = (layer, p) => ({ layer, p });
const P1 = PM1, wY = yW + WT / 2 + 0.03;
const at1 = (r, t) => [R2(P1.x + r * Math.cos(t)), R2(P1.z + r * Math.sin(t))];
// 線圈通電：銅色逐圈發橙光（呼吸）；匹配箱指示
actions.coilHot = { type: "pulse", _說明: "射頻通進線圈：銅帶發橙光、微微呼吸（示意）", parts: ["pm1Coil0", "pm1Coil1", "pm1Coil2", "pm1Coil3", "pm1Coil4", "pm1Coil5"], color: "coilHot", glow: 0.7, freq: 1.1, halo: 0 };
actions.icpGlow = { type: "pulse", _說明: "ICP 電漿：窗下厚圓盤最亮、往下漸暗；輝光微微閃動（氯系青藍白，示意）", parts: ["pm1GlowCore", "pm1Glow", "pm1GlowMid", "pm1GlowLow"], color: "plasmaI", glow: 0.9, freq: 3.6, halo: 0 };
actions.ccpGlow = { type: "pulse", _說明: "CCP 電漿（含氟介電蝕刻，粉紫，示意）", parts: ["pm3Glow", "pm3GlowCore"], color: "plasmaC", glow: 0.85, freq: 1.4, halo: 0 };
actions.cryoGlow = { type: "pulse", _說明: "低溫腔電漿（顏色示意，用冷色避免跟加熱混淆）", parts: ["pm4Glow", "pm4GlowCore"], color: "cold", glow: 0.85, freq: 1.4, halo: 0 };
// 氣體：氣櫃 → 頂部注入口 → 從窗中央往下、往外散開（錐狀）
{ const top = P1.top; actions.gasIn = { type: "flow", _說明: "製程氣體從介電窗中央注入口往下、呈錐狀散開（示意）", path: [lpt("pm1Glow", [P1.x, top - 0.1, P1.z]), lpt("pm1Glow", [P1.x, top - 0.6, P1.z]), lpt("pm1Glow", [R2(P1.x + 1.5), top - 1.4, P1.z])], n: 5, lanes: 6, laneGap: 0.5, laneDir: [0, 0, 1], size: 0.08, shape: "dot", rate: 0.55, color: "purge", track: false }; }
// 離子：在鞘層被偏壓垂直加速往下（越近晶圓越快：accel），幾乎垂直撞晶圓
const ionLanes = [-1.2, -0.6, 0, 0.6, 1.2];
ionLanes.forEach((u, i) => { actions[`ion${i}`] = { type: "flow", _說明: "正離子從電漿下緣進鞘層，被偏壓垂直加速往下：小點、越往下點距與拖尾越長（accel），撞到晶圓（青藍，示意）", path: [lpt("pm1Glow", [R2(P1.x + u), R2(yW + 1.35), P1.z]), lpt("pm1Glow", [R2(P1.x + u), wY, P1.z])], n: 4, lanes: 3, laneGap: 0.42, laneDir: [0, 0, 1], size: 0.06, shape: "dot", rate: 1.1, phase: i * 0.13, accel: true, color: "ion", trail: 5, trailGap: 0.03, trailColor: "ion", track: false }; });
// 自由基：方向亂飄、碰壁彈跳（多段折線＋抖動），比離子慢
const RADS = [[0.3, 1.6], [1.4, 0.9], [2.5, 1.9], [3.6, 1.2], [4.7, 2.1], [5.6, 0.6]];
RADS.forEach(([t, r], i) => {
  const pts = [0, 1, 2, 3, 4].map((k) => { const [x, z] = at1(R2(0.4 + ((r + k * 0.73) % 2.0)), t + k * 1.9); return lpt("pm1Glow", [x, R2(yW + 0.35 + (((i + k) * 0.37) % 1.5)), z]); });
  actions[`rad${i}`] = { type: "flow", _說明: "自由基（橘黃，中性）沒有方向性：亂飄、碰壁彈跳，負責化學反應（示意）", path: pts, n: 6, lanes: 3, laneGap: 0.45, laneDir: [0, 0, 1], size: 0.08, shape: "dot", rate: 0.3, phase: i * 0.16, color: "rad", jitter: 0.12, track: false };
});
// 反應產物：從晶圓表面往上冒（淡紫灰），被氣流帶往腔邊、往下經抽氣口 → 節流閥 → 渦輪泵 → 前級管
const BYP = [-0.9, -0.3, 0.3, 0.9];
BYP.forEach((u, i) => {
  const [ex, ez] = pol(P1.a + (i % 2 ? 25 : -25), RR - 0.5);
  actions[`byp${i}`] = { type: "flow", _說明: "反應產物（淡紫灰氣體）從晶圓表面冒起，沿腔邊往下被抽走：抽氣口 → 節流閥 → 渦輪分子泵 → 前級管（示意）", path: [lpt("pm1Pump", [R2(P1.x + u), wY, P1.z]), lpt("pm1Pump", [R2(P1.x + u * 1.2), R2(yW + 0.6), R2(P1.z + u * 0.3)]), lpt("pm1Pump", [R2(P1.x + ex), R2(yW + 0.2), R2(P1.z + ez)]), lpt("pm1Pump", [R2(P1.x + ex * 0.6), 5.0, R2(P1.z + ez * 0.6)]), lpt("pm1Pump", [P1.PX, 4.3, P1.PZ]), lpt("pm1Pump", [P1.PX, 0.3, P1.PZ])], n: 4, size: 0.13, shape: "dot", rate: 0.42, phase: i * 0.25, color: "byp", trail: 2, trailGap: 0.03, trailColor: "byp", track: false };
});
const HAR_ST = [3, 6, 9, 12];   // 孔深分 4 段（第 3、6、9、12 節）；每段一組離子／產物，genscript 依 cue 換段
HAR_ST.forEach((k, si) => {
  const yb = R2(HB + 0.5 + HH - SEGH * k + 0.15);
  actions[`harIon${si}`] = { type: "flow", _說明: "放大剖面：離子沿孔垂直往下打到目前的孔底（越深，到孔底的越少，示意）", path: [lpt("har", [HX, R2(HB + HH + 2.2), R2(HZ + 0.76)]), lpt("har", [HX, yb, R2(HZ + 0.76)])], n: Math.max(2, 5 - si), lanes: 5, laneGap: 1.25, laneDir: [1, 0, 0], size: 0.1, shape: "dot", rate: R2(1.0 - si * 0.15), accel: true, color: "ion", trail: 2, trailGap: 0.02, trailColor: "ion", track: false };
  actions[`harByp${si}`] = { type: "flow", _說明: "放大剖面：孔底產生的氣體沿孔往上冒出（示意）", path: [lpt("har", [HX, R2(yb + 0.2), R2(HZ + 0.78)]), lpt("har", [HX, R2(HB + HH + 1.4), R2(HZ + 0.78)])], n: 2, lanes: 5, laneGap: 1.25, laneDir: [1, 0, 0], size: 0.08, shape: "dot", rate: 0.45, phase: 0.5, color: "byp", track: false };
});
actions.turbo = { type: "rotate", _說明: "渦輪分子泵轉子：起轉、停轉有加減速（rampSpin），轉速示意", parts: ["pm1PumpRotor0", "pm1PumpRotor1", "pm1PumpRotor2"], axis: [0, 1, 0], pivot: [P1.PX, 3.82, P1.PZ], pivots: Object.fromEntries([0, 1, 2].map((j) => [`pm1PumpRotor${j}`, [P1.PX, 3.82, P1.PZ]])), rps: 1.6, rampSpin: true };
actions.match1 = { type: "pulse", _說明: "匹配箱運作中（指示）", parts: ["pm1LidMatchKnob"], color: "lampG", glow: 0.8, steady: true, halo: 0 };
// ALE（pm1 上）：改質＝氯氣（綠）只鋪最上層；沖洗＝灰白；移除＝氬離子低能量（藍、較慢、不加速太多）；沖洗
// ALE：右側展示台上的 3D 原子格（概念圖，不是真實晶格尺寸）：第 1 圈剝最上層、第 2 圈剝下一層
const AX = 43, AZ = 3, AB = 3.0, ASP = 0.72;
LAY("aleSt", [7, 4, AX, 2]);
P({ id: "aleStand", layer: "aleSt", shape: "slab", size: [6.4, 2.6, 4.4], r: 0.2, pos: [AX, 1.3, AZ], mat: "panel2" });
P({ id: "aleStandBand", layer: "aleSt", shape: "box", size: [6.5, 0.3, 4.5], pos: [AX, 2.4, AZ], mat: "band" });
const aleRow = () => { const out = []; for (let i = 0; i < 7; i++) for (let k = 0; k < 4; k++) out.push([R2((i - 3) * ASP), 0, R2((k - 1.5) * ASP)]); return out; };
const aleY = (ly) => R2(AB + 0.35 + (3 - ly) * ASP);   // ly 0＝最上層
for (let ly = 0; ly < 4; ly++) { LAY(`aleL${ly}`, [6, 0.8, AX, aleY(ly)]); P({ id: `aleL${ly}`, layer: `aleL${ly}`, shape: "sphere", size: [0.3], pos: [AX, aleY(ly), AZ], at: aleRow(), mat: "atomSi" }); }
for (let ly = 0; ly < 2; ly++) { LAY(`aleG${ly}`, [6, 0.8, AX, aleY(ly)]); P({ id: `aleG${ly}`, layer: `aleG${ly}`, shape: "sphere", size: [0.31], pos: [AX, aleY(ly), AZ], at: aleRow(), mat: "atomCl" }); }
const aleTop = (ly) => R2(aleY(ly) + 0.35);
const ALE_CL = [0, 1].map((ly) => { const id = `aleCl${ly}`; actions[id] = { type: "flow", _說明: "改質：氯（綠點）落到最上一層，鋪滿就停（自限，示意）", layer: "aleSt", path: [[AX, R2(aleTop(ly) + 3.0), AZ], [AX, aleTop(ly), AZ]], n: 3, lanes: 7, laneGap: ASP, laneDir: [1, 0, 0], size: 0.12, shape: "dot", rate: 0.9, color: "cl2", free: true, track: false }; return id; });
const ALE_P = [0, 1].map((ly) => { const id = `aleP${ly}`; actions[id] = { type: "flow", _說明: "沖洗：灰點從表面上方橫向帶走多的氣體", layer: "aleSt", path: [[R2(AX - 3.2), R2(aleTop(ly) + 0.6), AZ], [R2(AX + 3.6), R2(aleTop(ly) + 1.0), AZ]], n: 4, lanes: 4, laneGap: 0.6, laneDir: [0, 0, 1], size: 0.1, shape: "dot", rate: 0.9, color: "purge", free: true, track: false }; return id; });
const ALE_AR = [0, 1].map((ly) => { const id = `aleAr${ly}`; actions[id] = { type: "flow", _說明: "移除：少量低能量氬離子慢慢垂直打下，只打掉變色那一層（示意）", layer: "aleSt", path: [[AX, R2(aleTop(ly) + 3.2), AZ], [AX, aleTop(ly), AZ]], n: 4, lanes: 4, laneGap: 1.4, laneDir: [1, 0, 0], size: 0.07, shape: "dot", rate: 2.2, accel: true, color: "ion", trail: 5, trailGap: 0.03, trailColor: "ion", free: true, track: false }; return id; });
// 單孔剖面放大（孔壁長保護膜、孔底被離子打掉）：HAR 剖面塊右邊另一座展示台（孔寬放大示意）
const H2X = 34, H2Z = 3, H2B = 3.0, H2N = 6, H2W = 1.2, H2T = H2B + 0.2 + 7.0;
LAY("har2", [7, 9, H2X, 6.5]);
P({ id: "har2Stand", layer: "har2", shape: "slab", size: [7.2, 2.6, 3.2], r: 0.2, pos: [H2X, 1.3, H2Z], mat: "panel2" });
P({ id: "har2Band", layer: "har2", shape: "box", size: [7.3, 0.3, 3.3], pos: [H2X, 2.4, H2Z], mat: "band" });
P({ id: "har2Si", layer: "har2", shape: "box", size: [6, 0.4, 1.4], pos: [H2X, H2B, H2Z], mat: "steel2" });
P({ id: "har2Ox", layer: "har2", shape: "box", size: [6, 0.25, 1.4], pos: [H2X, R2(H2B + 0.2 + 0.125 + 3.25), H2Z], grid: { n: [1, 14], step: [0, 0.5] }, mat: "oxide" });
P({ id: "har2Ni", layer: "har2", shape: "box", size: [6, 0.25, 1.4], pos: [H2X, R2(H2B + 0.2 + 0.375 + 3.25), H2Z], grid: { n: [1, 14], step: [0, 0.5] }, mat: "nitride" });
P({ id: "har2Mask", layer: "har2", shape: "box", size: [2.4, 0.4, 1.4], pos: [H2X, R2(H2T + 0.2), H2Z], at: [[-1.8, 0, 0], [1.8, 0, 0]], mat: "maskM" });
for (let k = 0; k < H2N; k++) {
  const l = `h2s${k}`, yc = R2(H2T - (k + 0.5) * (7.0 / H2N)), hh = R2((7.0 / H2N) * 1.02);
  LAY(l, [2, hh, H2X, yc]); P({ id: l, layer: l, shape: "box", size: [H2W, hh, 0.08], pos: [H2X, yc, R2(H2Z + 0.72)], mat: "holeM" });
  const lp = `h2p${k}`; LAY(lp, [2, hh, H2X, yc]); P({ id: lp, layer: lp, shape: "box", size: [0.3, hh, 0.1], pos: [H2X, yc, R2(H2Z + 0.74)], at: [[R2(-H2W / 2 + 0.15), 0, 0], [R2(H2W / 2 - 0.15), 0, 0]], mat: "polymer" });
}
[2, 4, 6].forEach((k, si) => { const yb = R2(H2T - k * (7.0 / H2N) + 0.1);
  actions[`h2Ion${si}`] = { type: "flow", _說明: "單孔放大：離子沿孔中央垂直往下、越往下越快，打在孔底（孔底的保護膜被打掉，示意）", layer: "har2", path: [[H2X, R2(H2T + 2.4), R2(H2Z + 0.8)], [H2X, yb, R2(H2Z + 0.8)]], n: 4, lanes: 3, laneGap: 0.28, laneDir: [1, 0, 0], size: 0.09, shape: "dot", rate: 1.0, accel: true, color: "ion", trail: 4, trailGap: 0.03, trailColor: "ion", free: true, track: false };
  actions[`h2Byp${si}`] = { type: "flow", _說明: "單孔放大：孔底產物往上冒出孔口", layer: "har2", path: [[H2X, R2(yb + 0.15), R2(H2Z + 0.82)], [R2(H2X + 0.4), R2(H2T + 1.8), R2(H2Z + 0.82)]], n: 3, size: 0.09, shape: "dot", rate: 0.5, phase: 0.4, color: "byp", jitter: 0.05, free: true, track: false }; });
// 低溫腔（pm4）：靜電吸盤邊緣冒冷氣（往下沉，冷空氣比較重）；冷卻機管路藍進紅出
{ const C4 = PM4; actions.cryoVapor = { type: "flow", _說明: "低溫吸盤邊緣冒出的冷氣，往下沉、慢慢散開（示意）", path: [lpt(C4.esc, [R2(C4.x + 1.75), R2(yW - 0.3), C4.z]), lpt(C4.esc, [R2(C4.x + 2.0), R2(yW - 0.9), C4.z]), lpt(C4.esc, [R2(C4.x + 2.3), 5.0, C4.z])], n: 4, lanes: 6, laneGap: 0.5, laneDir: [0, 0, 1], size: 0.12, shape: "dot", rate: 0.25, color: "cold", jitter: 0.08, track: false };
  actions.cryoEsc = { type: "pulse", _說明: "低溫靜電吸盤（霜色）冷光（示意）", parts: [`${C4.esc}`, `${C4.esc}Base`], color: "cold", glow: 0.5, steady: true, halo: 0 }; }
actions.chillFlow = { type: "flow", _說明: "冷卻水：藍管送出、紅管回流（示意）", path: [lpt("chill", [-16.2, 1.0, -3.3]), lpt("chill", [-12.6, 1.0, -3.3])], n: 4, size: 0.12, shape: "dot", rate: 0.5, color: "pipeB", track: false };
actions.ffuAir = { type: "flow", _說明: "FFU 往下吹的潔淨空氣（向下的層流）", path: [lpt("efem", [-6.5, EH - 0.6, 14]), lpt("efem", [-6.5, 4.2, 14])], n: 3, lanes: 5, laneGap: 3.2, laneDir: [1, 0, 0], size: 0.09, shape: "dot", rate: 0.45, color: "purge", track: false };
actions.tower = { type: "pulse", _說明: "製程進行中：塔燈綠燈亮", parts: ["towerG"], color: "lampG", glow: 0.9, steady: true, halo: 0 };
actions.status = { type: "pulse", _說明: "射頻產生器與 MFC 指示燈慢慢呼吸", parts: ["rfGenLed", "gasMfcLed"], color: "screen", glow: 0.6, freq: 0.5, halo: 0 };
actions.llPump = { type: "pulse", _說明: "裝載閘抽真空：黃燈閃", parts: ["llLLampY"], color: "lampY", glow: 0.9, freq: 1.6, halo: 0 };
actions.llReady = { type: "pulse", parts: ["llLLampG"], color: "lampG", glow: 0.9, steady: true, halo: 0 };

// ── 標註點 ──
const A = (layer, p, dx, dy) => ({ layer, p, dx, dy });
Object.assign(anchors, {
  tc: A("tcLid", [0, 8.6, 2.5], -150, -150), vr: A("vr", [2, 6.2, 0], 130, -140), ll: A("llLLid", [LLL.x, 8.3, LLL.z], -150, -120),
  pm1: A("pm1Lid", [PM1.x, PM1.top + 3.4, PM1.z], 120, -150), pm3: A("pm3Lid", [PM3.x, PM3.top + 2.0, PM3.z], -140, -150), pm4: A("pm4Lid", [PM4.x, PM4.top + 2.0, PM4.z], -140, -140),
  coil: A("pm1Coil", [PM1.x, PM1.top + 0.5, PM1.z + 2.2], 150, -120), win: A("pm1Win", [PM1.x, PM1.top + 0.15, PM1.z + 2.9], 160, -60),
  esc: A("pm1Esc", [PM1.x, yW - 0.4, PM1.z + 1.6], 150, 90), ring: A("pm1Ring", [PM1.x, yW + 0.05, PM1.z + 1.9], -160, 80),
  match: A("pm1Lid", [PM1.x, PM1.top + 3.4, PM1.z - 0.2], 140, -120), pump: A("pm1Pump", [P1.PX, 3.2, P1.PZ + 0.9], 150, 80),
  plasma: A("pm1Glow", [PM1.x, PM1.top - 0.8, PM1.z + 2.2], 160, -40), wafer: A("wf", [PM1.x, yW, PM1.z + 1.3], 150, 120),
  gas: A("gas", [GX, 8.4, GZ + 1.6], -140, -130), rfgen: A("rfgen", [7, 6.4, GZ + 1.4], 140, -130),
  rad: A("pm1Glow", [PM1.x + 1.1, yW + 0.9, PM1.z + 1.4], 160, -60), escB4: A("pm4Esc", [PM4.x, yW - 0.5, PM4.z + 1.8], 150, -120),
  h2wall: A("h2p2", [H2X - H2W / 2 + 0.15, R2(H2T - 2.9), H2Z + 0.78], -160, -40), ale: A("aleL1", [AX + 2.2, aleY(0) + 0.3, AZ + 1.2], 150, -110),
  har: A("har", [HX + 3.5, HB + HH + 0.5, HZ + 0.7], 120, -120), harHole: A("hole6", [HX, HB + 6, HZ + 0.75], 150, 40),
  sign: A("sign", [0, EH - 2.6, EZ1 + 0.2], -150, 130),
});

const model = {
  name: "示意 多腔集群蝕刻平台（tech-lam）：六角真空傳送腔（六面閘閥）＋真空手臂（關節鏈）、裝載閘 ×2、導體蝕刻 ICP ×2（內外平面螺旋線圈、介電窗、線圈遮罩罩、匹配箱）、介電蝕刻 CCP（噴淋頭上電極、限制環、大射頻箱）、低溫介電蝕刻 CCP（霜色吸盤、低溫冷卻機）；每腔：靜電吸盤（內埋電極、背面氦氣孔、冷卻水）、邊緣環、升降銷、光學感測窗、節流閥＋渦輪分子泵＋前級管；EFEM（FFU、大氣手臂、對準器）、三個 FOUP、塔燈、控制螢幕；外圍氣櫃（MFC 一排）、射頻產生器櫃、冷卻機。配置與比例是示意，不仿特定機型。由 gen-model.mjs 產生，不要手改",
  unit: "示意（1＝10 cm；晶圓直徑 300 mm）",
  size: { w: 40, h: 16, r: 0.6, t: 40 },
  palette, materials,
  partNames: { tc: "真空傳送腔", vr: "真空手臂", pm1: "導體蝕刻腔（ICP）", pm3: "介電蝕刻腔", pm4: "低溫蝕刻腔", ll: "裝載閘", efem: "設備前端模組" },
  layers, parts, anchors, actions,
  kin: { vr: kinVr },
  pose: { yaw0: -0.3, yawIso: -0.3, drift: 0 },
  camera: { stand: { d: 110, elev: 30, y: 6 } },
  fx: { dpr: 1, srcPx: 30, shadows: 0, fog: false, dust: false, vaporSprites: false, shimmer: false },
  info: { H2: { X: H2X, N: H2N }, ALEX: AX, HAR: { HX, HZ, HB, HH, NSEG }, EH, yW, WT, L1, BL, AP, RR, FACETS, PM: Object.fromEntries(Object.entries(CH).map(([k, c]) => [k, [c.x, c.z, c.top]])), LL: [LLL.x, LLL.z], FOUPZ, EBZ, GZ, ALE: { CL: ALE_CL, P: ALE_P, AR: ALE_AR } },
};
// flow 路徑：{layer, p} → 動作的 layer＋純座標（引擎與 flow-check 都讀純座標）；在腔內空間／空氣中流動的氣體標 free（本來就在空中）
const FREE = /^(gasIn|rad|ale|cryoVapor|ffuAir|ion\d|byp\d|harIon|harByp)/;
for (const [k, d] of Object.entries(actions)) if (d.type === "flow" && d.path?.[0]?.p) { d.layer = d.path[0].layer; d.path = d.path.map((q) => q.p); if (FREE.test(k)) d.free = true; }
const out = path.join(path.dirname(new URL(import.meta.url).pathname), "model.json");
fs.writeFileSync(out, JSON.stringify(model, null, 1) + "\n");
console.log(`✔ ${out}：${parts.length} 個零件、${parts.reduce((a, p) => a + Math.max(1, (p.at?.length ?? 0) + (p.grid ? p.grid.n[0] * p.grid.n[1] : 0)), 0)} 個實體（含複製）、${layers.length} 層`);

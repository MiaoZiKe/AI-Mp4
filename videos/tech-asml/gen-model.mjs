// node videos/tech-asml/gen-model.mjs → 寫 videos/tech-asml/model.json
// 2026/11/26 tech-asml（設備五大-1：ASML）：沿用 tech-euv 的曝光機示意模型，加：光錐（cone：電漿→收集鏡發散、收集鏡→中間焦點收斂、末鏡→晶圓收斂；內亮外淡兩層）、
//   機櫃頂上的 ASML 廠牌＋荷蘭國旗（官方原檔轉貼圖）、晶圓台導軌移到 frame（晶圓台整層才能換格移動）。
// 曝光機示意模型的產生器（2026/11/15 v2，Andy：「素材部分需要多點，在更細緻」）：螺栓圈、晶粒格、鏡面朝向這些要算座標的，用程式算，避免手填錯。
// 光路順序照 research.md：電漿 → 收集鏡 → 中間焦點 → 照明（場鏡面陣列、瞳鏡面陣列、掠射鏡）→ 反射式光罩 → 投影 6 面反射鏡 → 晶圓，共 11 次反射。
// 配置與比例是示意，不仿任何廠商的機型。
import fs from "node:fs";
import path from "node:path";

const R2 = (x) => Math.round(x * 1000) / 1000;
const deg = (r) => R2((r * 180) / Math.PI);
const norm = ([x, y]) => { const l = Math.hypot(x, y) || 1; return [x / l, y / l]; };
/** 反射點 P 的鏡面法線＝入射方向反向與出射方向的角平分線；回傳繞 z 轉幾度（零件的薄邊 y 軸對齊法線） */
const mirrorRot = (A, P, B) => { const a = norm([A[0] - P[0], A[1] - P[1]]), b = norm([B[0] - P[0], B[1] - P[1]]), n = norm([a[0] + b[0], a[1] + b[1]]); return { a: Math.atan2(-n[0], n[1]), n }; };

// ── 光路上的點（x, y；z＝0 平面） ──
const PL = [-13, -7], COL = [-17.45, -4.3], IF = [-4.4, -7], FF = [0, -7], PF = [-1.2, 3.6], G = [1.6, 11.2], MASK = [6.5, 14.1];
const M = [[11.8, 9.4], [5.0, 7.2], [12.4, 4.6], [5.0, 1.6], [12.0, -1.8], [6.4, -5.2]], WAF = [8, -11.6];

const palette = {
  base: "#C9D4E6", euvTrail2: "#C4B5FD", stage: "#8FA3C4", steel: "#7D8CA6", dark: "#3E4A60", vessel: "#DDE7F6", mirror: "#E8B04A", zone: "#F6D58A", facet: "#F2C266",
  maskc: "#1F3A6B", wafer: "#5F7FB8", die: "#7FA4E0", plasmaC: "#9B5CFF", euv: "#8B5CF6", euvRim: "#5B21B6", euvTrail: "#C4B5FD",
  tin: "#9AA6B8", laserC: "#E5484D", laserPre: "#FF8A7A", laserMain: "#E5484D", glassC: "#BFD3F2", hull: "#E6ECF5", hullF: "#D3DEEE", copper: "#E09A4A",
  lensC: "#9EC3E8", mo: "#3E4A60", si: "#C9D6EA", resist: "#E8DDF7",
};
const materials = {
  base: { kind: "std", color: "base", rough: 0.6, metal: 0.1 },
  stage: { kind: "std", color: "stage", rough: 0.45, metal: 0.5, tex: "brushed", texScale: 2.2, env: 0.4 },
  steel: { kind: "std", color: "steel", rough: 0.35, metal: 0.85, env: 0.5 },
  dark: { kind: "std", color: "dark", rough: 0.5, metal: 0.4, env: 0.3 },
  copper: { kind: "std", color: "copper", rough: 0.35, metal: 0.9, env: 0.6 },
  vessel: { kind: "phys", color: "vessel", rough: 0.15, metal: 0, clearcoat: 0.8, opacity: 0.3, env: 0.4 },
  glass: { kind: "phys", color: "glassC", rough: 0.1, metal: 0, clearcoat: 0.8, opacity: 0.14, env: 0.3 },
  hull: { kind: "std", color: "hull", rough: 0.7, metal: 0.05, opacity: 0.55 },
  hullF: { kind: "phys", color: "hullF", rough: 0.2, metal: 0, clearcoat: 0.6, opacity: 0.6, env: 0.3 },
  mirror: { kind: "std", color: "mirror", rough: 0.12, metal: 0.95, env: 1.4 },
  zone: { kind: "std", color: "zone", rough: 0.1, metal: 0.95, env: 1.6 },
  facet: { kind: "std", color: "facet", rough: 0.1, metal: 0.95, env: 1.6 },
  mask: { kind: "std", color: "maskc", rough: 0.2, metal: 0.7, tex: "traces", texScale: 1.2, env: 0.8 },
  wafer: { kind: "phys", color: "wafer", rough: 0.15, metal: 0.6, clearcoat: 0.9, env: 0.9 },
  die: { kind: "std", color: "die", rough: 0.25, metal: 0.5, tex: "traces", texScale: 0.5, env: 0.8 },
  laser: { kind: "std", color: "laserC", rough: 0.5, metal: 0.2 },
  slit: { kind: "unlit", color: "euv", opacity: 0.35 },
  lensGlass: { kind: "phys", color: "lensC", rough: 0.05, metal: 0, clearcoat: 1, opacity: 0.55, env: 0.6 },
};
const parts = [];
const P = (o) => { parts.push(o); return o; };

// ── 機台底座、雷射（frame） ──
P({ id: "base", layer: "frame", shape: "slab", size: [48, 2, 15], r: 0.6, bevel: 0.15, pos: [0, -15.4, 0], mat: "base" });
P({ id: "feet", layer: "frame", shape: "cyl", size: [0.9, 1.4], rot: [90, 0, 0], pos: [0, -17.0, 0], at: [-21, -8, 8, 21].flatMap((x) => [[x, 0, -5.8], [x, 0, 5.8]]), mat: "dark" });
P({ id: "laserBox", layer: "src", shape: "slab", size: [7, 3.2, 5], r: 0.5, bevel: 0.1, pos: [-19, -12.6, 0], mat: "laser" });
P({ id: "laserFins", layer: "src", shape: "slab", size: [0.25, 0.9, 4.2], r: 0.08, pos: [-19, -10.6, 0], at: Array.from({ length: 8 }, (_, i) => [-2.45 + i * 0.7, 0]), mat: "dark" });
P({ id: "laserUp", layer: "src", shape: "cyl", size: [0.45, 4.2], rot: [90, 0, 0], pos: [-21.8, -8.9, 0], mat: "steel" });
P({ id: "laserFold", layer: "src", shape: "box", size: [1.3, 1.3, 1.3], pos: [-21.8, -7, 0], mat: "steel" });
P({ id: "laserIn", layer: "src", shape: "cyl", size: [0.45, 2.2], rot: [0, 90, 0], pos: [-20.4, -7, 0], mat: "steel" });

// ── 機櫃外殼（s6 才出現：前板掀開＝剖開，s7 整個淡出） ──
const HX = 24.3, HZ = 7.6, HY0 = -14.3, HY1 = 18.2, HH = HY1 - HY0, HYc = (HY0 + HY1) / 2;
P({ id: "hullBack", layer: "hull", shape: "slab", size: [2 * HX, HH, 0.3], r: 0.1, pos: [0, HYc, -HZ], mat: "hull" });
P({ id: "hullTop", layer: "hull", shape: "slab", size: [2 * HX, 0.3, 2 * HZ], r: 0.1, pos: [0, HY1, 0], mat: "hull" });
P({ id: "hullSide", layer: "hull", shape: "slab", size: [0.3, HH, 2 * HZ], r: 0.1, pos: [0, HYc, 0], at: [[-HX, 0], [HX, 0]], mat: "hull" });
P({ id: "hullPost", layer: "hull", shape: "cyl", size: [0.32, HH], rot: [90, 0, 0], pos: [0, HYc, 0], at: [[-HX, 0, -HZ], [HX, 0, -HZ], [-HX, 0, HZ], [HX, 0, HZ]], mat: "dark" });
P({ id: "hullBeamX", layer: "hull", shape: "cyl", size: [0.32, 2 * HX], rot: [0, 90, 0], pos: [0, HY1, 0], at: [[0, 0, -HZ], [0, 0, HZ]], mat: "dark" });
P({ id: "hullBeamZ", layer: "hull", shape: "cyl", size: [0.32, 2 * HZ], pos: [0, HY1, 0], at: [[-HX, 0], [HX, 0]], mat: "dark" });
P({ id: "hullFront", layer: "hullF", shape: "slab", size: [2 * HX - 0.6, HH - 0.6, 0.3], r: 0.1, pos: [0, HYc, HZ], mat: "hullF" });
P({ id: "hullVents", layer: "hullF", shape: "slab", size: [2.6, 0.32, 0.2], r: 0.08, pos: [15, 7, HZ + 0.2], grid: { n: [3, 9], step: [3.0, 0.85] }, mat: "dark" });
P({ id: "hullPanel", layer: "hullF", shape: "slab", size: [6, 3.6, 0.2], r: 0.3, pos: [-16, 12, HZ + 0.2], mat: "dark" });
P({ id: "hullLamp", layer: "hullF", shape: "cyl", size: [0.35, 0.3], pos: [-18.5, 12, HZ + 0.4], at: [[0, 0], [1.2, 0], [2.4, 0]], mat: "laser" });

// ── 光源腔體（src）：真空腔、法蘭與螺栓、錫滴產生器、回收口、收集鏡、中間焦點 ──
P({ id: "vessel", layer: "src", shape: "cyl", size: [5.2, 12.6], rot: [0, 90, 0], pos: [-12.5, -7, 0], mat: "vessel" });
P({ id: "flange", layer: "src", shape: "tube", size: [5.75, 5.0, 0.6], rot: [0, 90, 0], pos: [-12.5, -7, 0], at: [[-6.3, 0], [6.3, 0]], mat: "steel" });
P({ id: "ribs", layer: "src", shape: "tube", size: [5.45, 5.15, 0.25], rot: [0, 90, 0], pos: [-12.5, -7, 0], at: [[-3.1, 0], [3.1, 0]], mat: "steel" });
const bolts = [];
for (const x of [-6.3, 6.3]) for (let i = 0; i < 14; i++) { const t = (i / 14) * Math.PI * 2; bolts.push([R2(x), R2(5.42 * Math.sin(t)), R2(5.42 * Math.cos(t))]); }
P({ id: "bolts", layer: "src", shape: "cyl", size: [0.16, 0.9], rot: [0, 90, 0], pos: [-12.5, -7, 0], at: bolts, mat: "dark" });
P({ id: "saddle", layer: "src", shape: "slab", size: [1.4, 2.6, 8], r: 0.2, pos: [-12.5, -12.95, 0], at: [[-3.6, 0], [3.6, 0]], mat: "stage" });
P({ id: "port", layer: "src", shape: "tube", size: [0.9, 0.6, 1.2], rot: [90, 0, 0], pos: [-12.5, -7, 0], at: [[-3.6, 5.2], [3.6, 5.2]], mat: "steel" });
P({ id: "tinTank", layer: "src", shape: "cyl", size: [1.1, 2.2], rot: [90, 0, 0], pos: [-13, 1.7, 0], mat: "steel" });
P({ id: "tinHeat", layer: "src", shape: "tube", size: [1.28, 1.1, 0.28], rot: [90, 0, 0], pos: [-13, 1.7, 0], at: [[0, -0.7], [0, 0], [0, 0.7]], mat: "copper" });
P({ id: "tinBody", layer: "src", shape: "slab", size: [1.7, 1.4, 1.7], r: 0.2, pos: [-13, -0.15, 0], mat: "stage" });
P({ id: "nozzle", layer: "src", shape: "cyl", size: [0.34, 1.9], rot: [90, 0, 0], pos: [-13, -1.65, 0], mat: "steel" });
P({ id: "nozzleTip", layer: "src", shape: "cyl", size: [0.13, 0.6], rot: [90, 0, 0], pos: [-13, -2.85, 0], mat: "dark" });
P({ id: "catcher", layer: "src", shape: "cyl", size: [0.7, 1.8], rot: [90, 0, 0], pos: [-13, -12.5, 0], mat: "steel" });
P({ id: "catcherMouth", layer: "src", shape: "tube", size: [0.95, 0.55, 0.4], rot: [90, 0, 0], pos: [-13, -11.45, 0], mat: "dark" });
// 收集鏡：碗形（橢球面示意）＝一圈圈半徑漸大的金色環往右排成碗，電漿在碗內焦點；碗底中間是讓雷射穿過的孔，外圈是支撐環
const BOWL_X0 = -18.7, BOWL_X1 = -16.3, BOWL_R = 4.4, bowl = [];
for (let i = 0; i < 9; i++) { const r = 0.75 + (i * (BOWL_R - 0.75)) / 8; bowl.push({ r, x: R2(BOWL_X0 + (BOWL_X1 - BOWL_X0) * (r / BOWL_R) ** 2) }); }
bowl.forEach(({ r, x }, i) => P({ id: i === 0 ? "collector" : `collector${i}`, layer: "src", shape: "tube", size: [R2(r + 0.42), R2(Math.max(0.3, r - 0.08)), 0.5], rot: [0, 90, 0], pos: [x, -7, 0], mat: i % 2 ? "zone" : "mirror" }));
P({ id: "colBack", layer: "src", shape: "sphere", size: [4.6], scale: [0.16, 1, 1], pos: [-19.1, -7, 0], mat: "steel" });
P({ id: "colRim", layer: "src", shape: "tube", size: [4.95, 4.55, 0.5], rot: [0, 90, 0], pos: [-16.3, -7, 0], mat: "steel" });
P({ id: "colHole", layer: "src", shape: "tube", size: [0.6, 0.3, 0.8], rot: [0, 90, 0], pos: [-18.75, -7, 0], mat: "dark" });
// 中間焦點：收束用的錐形環＋一片中間有小孔的隔板（光源腔和掃描機的交界）
P({ id: "ifWall", layer: "src", shape: "tube", size: [3.2, 0.42, 0.18], rot: [0, 90, 0], pos: [-4.4, -7, 0], mat: "dark" });
P({ id: "ifCone", layer: "src", shape: "tube", size: [1.7, 1.45, 0.4], rot: [0, 90, 0], pos: [-6.0, -7, 0], mat: "steel" });
P({ id: "ifCone2", layer: "src", shape: "tube", size: [1.2, 0.95, 0.4], rot: [0, 90, 0], pos: [-5.25, -7, 0], mat: "steel" });
P({ id: "ifCone3", layer: "src", shape: "tube", size: [0.7, 0.42, 0.4], rot: [0, 90, 0], pos: [-4.75, -7, 0], mat: "dark" });
P({ id: "ifPipe", layer: "src", shape: "cyl", size: [0.75, 3.6], rot: [0, 90, 0], pos: [-2.6, -7, 0], mat: "glass" });

// ── s9 的錯誤示範：一片透鏡（玻璃）攔在中間焦點後面，光進去就被吸掉；打叉後整個移除（device-spec 第 9 節第 4 條：整機光路上沒有透鏡） ──
P({ id: "lens", layer: "lens", shape: "sphere", size: [2.4], scale: [0.32, 1, 1], pos: [-2.2, -7, 0], mat: "lensGlass" });
P({ id: "lensRing", layer: "lens", shape: "tube", size: [2.6, 2.35, 0.45], rot: [0, 90, 0], pos: [-2.2, -7, 0], mat: "dark" });

// ── 照明（optics）：場鏡面陣列、瞳鏡面陣列、掠射鏡；每一面的朝向用入射／出射方向算 ──
const facetPlate = (id, Pt, A, B, w, n, fs) => {
  const { a, n: nv } = mirrorRot(A, Pt, B), t = [Math.cos(a), Math.sin(a)];
  P({ id, layer: "optics", shape: "slab", size: [w, 0.45, w], r: 0.2, rot: [0, 0, deg(a)], pos: [Pt[0] - nv[0] * 0.3, Pt[1] - nv[1] * 0.3, 0], mat: "steel" });
  const at = [], st = w / n;
  for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) { const u = (i - (n - 1) / 2) * st, v = (j - (n - 1) / 2) * st; at.push([R2(t[0] * u + nv[0] * 0.05), R2(t[1] * u + nv[1] * 0.05), R2(v)]); }
  P({ id: `${id}Facets`, layer: "optics", shape: "slab", size: [fs, 0.28, fs], r: 0.08, rot: [0, 0, deg(a)], pos: [Pt[0], Pt[1], 0], at, mat: "facet" });
  P({ id: `${id}Arm`, layer: "optics", shape: "cyl", size: [0.22, 1.8], rot: [90, 0, deg(a)], pos: [R2(Pt[0] - nv[0] * 1.3), R2(Pt[1] - nv[1] * 1.3), 0], mat: "dark" });
};
facetPlate("ff", FF, IF, PF, 4.2, 4, 0.9);
facetPlate("pf", PF, FF, G, 3.4, 3, 0.95);
{ const { a, n } = mirrorRot(PF, G, MASK);
  P({ id: "gm", layer: "optics", shape: "slab", size: [3.4, 0.4, 2.8], r: 0.2, rot: [0, 0, deg(a)], pos: G, mat: "mirror" });
  P({ id: "gmArm", layer: "optics", shape: "cyl", size: [0.22, 1.8], rot: [90, 0, deg(a)], pos: [R2(G[0] - n[0] * 1.2), R2(G[1] - n[1] * 1.2), 0], mat: "dark" }); }
P({ id: "illum", layer: "shell", shape: "box", size: [6.4, 21, 7], pos: [0.2, 2.4, 0], mat: "glass" });

// ── 光罩台（mask）：導軌與磁鐵（不動）、移動台、反射式光罩、夾具、護膜框 ──
P({ id: "maskRail", layer: "mask", shape: "slab", size: [24, 0.5, 1.0], r: 0.15, pos: [6.5, 16.6, 0], at: [[0, 0, -3.9], [0, 0, 3.9]], mat: "steel" });
P({ id: "maskMag", layer: "mask", shape: "slab", size: [0.62, 0.35, 1.1], r: 0.06, pos: [6.5, 17.0, 0], at: Array.from({ length: 22 }, (_, i) => [[-10.5 + i, 0, -3.9], [-10.5 + i, 0, 3.9]]).flat(), mat: "dark" });
P({ id: "maskStage", layer: "mask", shape: "slab", size: [15, 1.4, 9], r: 0.4, bevel: 0.1, pos: [6.5, 15.5, 0], mat: "stage" });
P({ id: "maskMotor", layer: "mask", shape: "slab", size: [2.4, 1.0, 9.4], r: 0.2, pos: [6.5, 16.0, 0], at: [[-6.4, 0], [6.4, 0]], mat: "dark" });
P({ id: "mask", layer: "mask", shape: "slab", size: [6.4, 0.45, 6.4], r: 0.2, pos: [6.5, 14.55, 0], mat: "mask" });
P({ id: "maskClamp", layer: "mask", shape: "box", size: [0.8, 0.5, 0.8], pos: [6.5, 14.9, 0], at: [[-3.4, 0, -3.4], [3.4, 0, -3.4], [-3.4, 0, 3.4], [3.4, 0, 3.4]], mat: "dark" });
P({ id: "pellicle", layer: "mask", shape: "ring", size: [6.0, 6.0, 0.3], r: 0.2, wall: 0.25, rot: [90, 0, 0], pos: [6.5, 14.1, 0], mat: "steel" });

// ── 投影光學（shell 外框＋optics 六面反射鏡） ──
P({ id: "po", layer: "shell", shape: "box", size: [11, 15.5, 9], pos: [8.6, 2.2, 0], mat: "glass" });
P({ id: "poPost", layer: "shell", shape: "cyl", size: [0.22, 15.5], rot: [90, 0, 0], pos: [8.6, 2.2, 0], at: [[-5.5, 0, -4.5], [5.5, 0, -4.5], [-5.5, 0, 4.5], [5.5, 0, 4.5]], mat: "steel" });
P({ id: "poRing", layer: "shell", shape: "ring", size: [11, 9, 0.3], r: 0.4, wall: 0.35, rot: [90, 0, 0], pos: [8.6, 2.2, 0], at: [[0, 7.75], [0, 2.4], [0, -2.6], [0, -7.75]], mat: "steel" });
const chain = [MASK, ...M, WAF];
M.forEach((Pt, i) => {
  const { a, n } = mirrorRot(chain[i], Pt, chain[i + 2]);
  P({ id: `pm${i + 1}`, layer: "optics", shape: "sphere", size: [1.75], scale: [1, 0.17, 1], rot: [0, 0, deg(a)], pos: Pt, mat: "mirror" });
  P({ id: `pm${i + 1}Ring`, layer: "optics", shape: "tube", size: [1.9, 1.62, 0.45], rot: [90, 0, deg(a)], pos: [R2(Pt[0] - n[0] * 0.12), R2(Pt[1] - n[1] * 0.12), 0], mat: "steel" });
  P({ id: `pm${i + 1}Arm`, layer: "optics", shape: "cyl", size: [0.2, 1.6], rot: [90, 0, deg(a)], pos: [R2(Pt[0] - n[0] * 1.05), R2(Pt[1] - n[1] * 1.05), 0], mat: "dark" });
});

// ── 晶圓台（wafer）：導軌（不動）、移動台、吸盤、晶圓、晶粒格、位置感測頭、量測站 ──
P({ id: "waferRail", layer: "frame", shape: "slab", size: [26, 0.5, 1], r: 0.15, pos: [8, -14.15, 0], at: [[0, 0, -4.9], [0, 0, 4.9]], mat: "steel" });
P({ id: "waferStage", layer: "wafer", shape: "slab", size: [14, 1.4, 10.4], r: 0.4, bevel: 0.1, pos: [8, -13.2, 0], mat: "stage" });
P({ id: "chuck", layer: "wafer", shape: "cyl", size: [5.7, 0.45], rot: [90, 0, 0], pos: [8, -12.28, 0], mat: "steel" });
P({ id: "wafer", layer: "wafer", shape: "cyl", size: [5.2, 0.2], rot: [90, 0, 0], pos: [8, -11.95, 0], mat: "wafer" });
const dies = [], st = 0.96;
for (let i = -6; i <= 6; i++) for (let j = -6; j <= 6; j++) { const x = i * st, z = j * st, h = 0.45; if ([[x - h, z - h], [x + h, z - h], [x - h, z + h], [x + h, z + h]].every(([a, b]) => Math.hypot(a, b) < 4.95)) dies.push([R2(x), 0, R2(z)]); }
P({ id: "dies", layer: "wafer", shape: "plane", size: [0.84, 0.84], r: 0.04, rot: [-90, 0, 0], pos: [8, -11.84, 0], at: dies, mat: "die" });
P({ id: "encoder", layer: "wafer", shape: "box", size: [1.1, 1.1, 1.1], pos: [8, -12.1, 0], at: [[-6.2, 0, -4.4], [6.2, 0, -4.4], [-6.2, 0, 4.4], [6.2, 0, 4.4]], mat: "dark" });
P({ id: "slit", layer: "wafer", shape: "plane", size: [0.5, 9.4], rot: [-90, 0, 0], pos: [8, -11.7, 0], mat: "slit" });
P({ id: "metro", layer: "frame", shape: "slab", size: [3.6, 1.2, 4], r: 0.3, pos: [20.4, -13.8, 0], mat: "stage" });
P({ id: "metroHead", layer: "frame", shape: "cyl", size: [0.6, 2.4], rot: [90, 0, 0], pos: [20.4, -11.9, 0], mat: "dark" });

// ── 光錐（cone 層）：Andy 第 15 條「光從光源發散或收斂成光錐，有亮度衰減與邊緣柔化」——內層亮、外層淡 ──
materials.coneIn = { kind: "std", color: "euv", emissive: "euv", ei: 0.9, opacity: 0.26, rough: 1, metal: 0 };
materials.coneOut = { kind: "std", color: "euvTrail", emissive: "euvTrail", ei: 0.6, opacity: 0.12, rough: 1, metal: 0 };
const coneX = (id, xA, rA, xB, rB, y, lay = "cone") => { // 沿 x 的錐：xA 端半徑 rA、xB 端半徑 rB（xB > xA）
  const len = xB - xA, cx = (xA + xB) / 2;
  P({ id: `${id}In`, layer: lay, shape: "cone", size: [R2(rB * 0.62), R2(rA * 0.62), R2(len)], rot: [0, 90, 0], pos: [R2(cx), y, 0], mat: "coneIn" });
  P({ id: `${id}Out`, layer: lay, shape: "cone", size: [R2(rB), R2(rA), R2(len)], rot: [0, 90, 0], pos: [R2(cx), y, 0], mat: "coneOut" });
};
coneX("coneA", -17.3, 3.9, -13.0, 0.12, -7);   // 電漿 → 收集鏡（發散：越靠鏡面越寬）
coneX("coneB", -17.3, 3.9, -4.5, 0.18, -7);    // 收集鏡 → 中間焦點（收斂）
{ // 末鏡 → 晶圓（收斂，斜的：用 sphere 縮放不行，改用 cone 再繞 z 轉）
  const A = M[5], B = [WAF[0], -11.75], len = Math.hypot(B[0] - A[0], B[1] - A[1]), ang = Math.atan2(B[1] - A[1], B[0] - A[0]);
  for (const [nm, k, mat] of [["In", 0.62, "coneIn"], ["Out", 1, "coneOut"]])
    P({ id: `coneC${nm}`, layer: "coneW", shape: "cone", size: [R2(0.25 * k), R2(1.7 * k), R2(len)], rot: [0, 90, deg(ang)], pos: [R2((A[0] + B[0]) / 2), R2((A[1] + B[1]) / 2), 0], mat });
}
// ── 廠牌（sign 層）：機櫃頂上的 ASML LOGO（Commons 原檔轉貼圖，不改色）＋荷蘭國旗 ──
materials.t_asml = { kind: "unlit", color: "#FFFFFF", img: "tex/brand/sign-asml.png" };
materials.t_nl = { kind: "unlit", color: "#FFFFFF", img: "tex/brand/flag-NL.png" };
P({ id: "signBack", layer: "sign", shape: "slab", size: [13.4, 5.6, 0.3], r: 0.2, pos: [-6, 21.4, 0.8], mat: "dark" });
P({ id: "signLogo", layer: "sign", shape: "plane", size: [12.4, R2(12.4 / 2.5938)], pos: [-6, 21.4, 1.0], uv01: true, shadow: false, mat: "t_asml" });
P({ id: "signPost", layer: "sign", shape: "cyl", size: [0.2, 6.2], rot: [90, 0, 0], pos: [6.5, 21.3, 0.6], mat: "steel" });
P({ id: "signFlag", layer: "sign", shape: "plane", size: [4.2, 2.8], pos: [8.75, 22.9, 0.7], uv01: true, shadow: false, mat: "t_nl" });

const pt = (layer, p, z = 0.6) => ({ layer, p: [p[0], p[1], z] });
const model = {
  name: "示意 EUV 曝光機（tech-asml 沿用 tech-euv，加光錐與 ASML 廠牌）（極紫外光掃描式曝光機）：錫滴光源（腔體、錫滴產生器、收集鏡、中間焦點、雷射進光）、照明（場鏡面陣列、瞳鏡面陣列、掠射鏡）、反射式光罩台、投影 6 面反射鏡、晶圓台與晶粒格。光路共 11 次反射（research.md #10、#12）。配置與比例是示意，不仿任何廠商的機型。由 gen-model.mjs 產生，不要手改",
  unit: "示意（整台約數公尺）",
  size: { w: 48, h: 33, r: 0.6, t: 15 },
  palette, materials,
  partNames: {
    base: "機台底座", feet: "避震腳", laser: "CO2 雷射與光束導管", hull: "機櫃外殼", vessel: "光源腔體（真空）", flange: "法蘭", ribs: "補強環", bolts: "螺栓", saddle: "腔體支架", port: "觀察窗",
    tin: "錫滴產生器", nozzle: "錫滴噴嘴", catcher: "錫滴回收", collector: "收集鏡", col: "收集鏡細節", if: "中間焦點", ff: "場鏡面陣列", pf: "瞳鏡面陣列", gm: "掠射鏡", illum: "照明外框",
    mask: "光罩台與反射式光罩", pellicle: "護膜框", po: "投影光學外框", pm: "投影反射鏡", wafer: "晶圓台與晶圓", chuck: "吸盤", dies: "晶粒", encoder: "位置感測頭", slit: "曝光光縫", metro: "量測站",
  },
  layers: [
    { id: "frame", z: 0, k: 0, outline: [48, 33, 0, 0] },
    { id: "hull", z: 0, k: 0, outline: [48.6, 32.5, 0, 2] },
    { id: "hullF", z: 0, k: 0, outline: [48, 32, 0, 2] },
    { id: "src", z: 0, k: 0, outline: [18, 16, -14, -6] },
    { id: "lens", z: 0, k: 0, outline: [1.2, 4, -2.2, -7] },
    { id: "optics", z: 0, k: 0, outline: [16, 26, 5, 2] },
    { id: "shell", z: 0, k: 0, outline: [18, 22, 5, 2] },
    { id: "mask", z: 0, k: 0, outline: [24, 3, 6.5, 15.5] },
    { id: "wafer", z: 0, k: 0, outline: [26, 3, 8, -13] },
    { id: "cone", z: 0, k: 0, outline: [13, 8, -11, -7] },
    { id: "coneW", z: 0, k: 0, outline: [3, 7, 7, -8] },
    { id: "sign", z: 0, k: 0, outline: [18, 6, -4, 21.6] },
  ],
  parts,
  anchors: {
    tin: { layer: "src", p: [-13, -4.2, 0], dx: -150, dy: -150 },
    plasma: { layer: "src", p: [-13, -7, 0], dx: 170, dy: 170 },
    laser: { layer: "src", p: [-19, -11.2, 2.5], dx: -60, dy: -200 },
    collector: { layer: "src", p: [-16.6, -3.0, 0], dx: -60, dy: -170 },
    mirror: { layer: "optics", p: [M[0][0], M[0][1], 0], dx: 140, dy: -120 },
    illum: { layer: "optics", p: [FF[0], FF[1], 0], dx: 120, dy: 120 },
    mask: { layer: "mask", p: [6.5, 14.55, 3.2], dx: 170, dy: -60 },
    wafer: { layer: "wafer", p: [8, -11.9, 4.5], dx: 170, dy: 90 },
    lens: { layer: "lens", p: [-2.2, -4.7, 0], dx: 0, dy: -160 },
    ifp: { layer: "src", p: [-4.4, -7, 0], dx: 60, dy: 150 },
    srcZone: { layer: "src", p: [-17.2, -2.8, 0], dx: -80, dy: -160 },
    poZone: { layer: "optics", p: [12.4, 4.6, 0], dx: 150, dy: 60 },
    vac: { layer: "src", p: [-12.5, -2, 0], dx: -60, dy: -190 },
  },
  actions: {
    tin: { type: "flow", _說明: "錫滴：從噴嘴往下掉到回收口（每秒約 5 萬顆，畫面放慢成每秒幾顆）", path: [pt("src", [-13, -3.15], 0), pt("src", [-13, -11.3], 0)], n: 7, size: 0.32, shape: "dot", rate: 0.8, color: "tin", track: false },
    lpp: {
      type: "lpp", _說明: "雷射打錫滴：錫滴排隊落到焦點 → 預脈衝（淡紅細光束）打扁成餅 → 主脈衝（紅粗光束）→ 電漿發光、碎點噴開。雷射從收集鏡中間的孔射進來（示意）。每 1.1 秒一輪（實際每秒約 5 萬次）",
      layer: "src", at: [-13, -7, 0], size: 0.42, halo: 7, color: "tin",
      lpp: { drop: [-13, -3.15, 0], beam: [-18.75, -7, 0], period: 1.1, queue: 4, gravity: 0.4, pancake: 1.5, burst: 1.6, spray: 2.4, pre: "laserPre", main: "laserMain", glow: "plasmaC", preR: 0.17, mainR: 0.38 },
    },
    light: {
      type: "flow", _說明: "極紫外光走的路（EUV 看不見，紫色光點是示意）：電漿 → 收集鏡 → 中間焦點 → 場鏡面 → 瞳鏡面 → 掠射鏡 → 光罩 → 6 面投影反射鏡 → 晶圓。每反射一次只剩 7 成（keep），光點越後面越淡越小；0.7 的 11 次方約 2%（估算）",
      path: [pt("src", PL), pt("src", COL), pt("src", IF), pt("optics", FF), pt("optics", PF), pt("optics", G), pt("mask", [MASK[0], 14.3]), ...M.map((m) => pt("optics", m)), pt("wafer", [WAF[0], -11.75])],
      n: 14, size: 0.46, shape: "dot", rate: 0.26, color: "euv", rim: "euvRim", rimScale: 1.8, rimO: 0.4, trail: 3, trailGap: 0.01, trailColor: "euvTrail", track: true,
      keep: 0.7, bounces: [1, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], lossFloor: 0.04,
    },
    lensFail: { type: "flow", _說明: "s9 錯誤示範：光從中間焦點打進透鏡，穿過去就幾乎沒了（keep 很低）", path: [pt("src", IF), pt("lens", [-2.2, -7]), pt("lens", [1.0, -7])], n: 6, size: 0.46, shape: "dot", rate: 0.9, color: "euv", rim: "euvRim", rimScale: 1.8, rimO: 0.4, trail: 2, trailGap: 0.02, trailColor: "euvTrail", track: false, keep: 0.04, bounces: [1], lossFloor: 0 },
    maskScan: { type: "vibrate", _說明: "掃描：光罩台來回移動（和晶圓台反方向）", parts: ["maskStage", "maskMotor", "mask", "maskClamp", "pellicle"], axis: [1, 0, 0], amp: 1.6, freq: 0.4 },
    waferScan: { type: "vibrate", _說明: "掃描：晶圓台跟光罩反方向、移動距離約四分之一（縮小投影，示意）", parts: ["waferStage", "chuck", "wafer", "dies", "encoder"], axis: [-1, 0, 0], amp: 0.4, freq: 0.4 },
    coneGlow: { type: "pulse", _說明: "光錐跟著電漿一閃一閃（lpp 每 1.1 秒一輪，freq 0.91）", parts: ["coneAIn", "coneAOut", "coneBIn", "coneBOut"], color: "euv", glow: 0.8, freq: 0.91, halo: 0 },
    coneWGlow: { type: "pulse", parts: ["coneCIn", "coneCOut"], color: "euv", glow: 0.7, steady: true, halo: 0 },
    expose: { type: "pulse", _說明: "晶圓上的曝光光縫亮起來", parts: ["slit"], color: "euv", steady: true, glow: 0.9, halo: 0 },
  },
  pose: { yaw0: -0.32, yawIso: -0.32, drift: 0 },
  camera: { stand: { d: 150, elev: 12, y: 0 } },
  fx: { dpr: 1, srcPx: 30, shadows: 0, fog: false, dust: false, vaporSprites: false, shimmer: false },
};
const out = path.join(path.dirname(new URL(import.meta.url).pathname), "model.json");
model.anchors.sign = { layer: "sign", p: [-6, 18.6, 1], dx: 160, dy: 120 };
model.anchors.stage = { layer: "wafer", p: [14.5, -13.2, 5.2], dx: 120, dy: 80 };
model.anchors.cone = { layer: "cone", p: [-10.5, -5.5, 0], dx: 80, dy: -170 };
fs.writeFileSync(out, JSON.stringify(model, null, 1) + "\n");
console.log(`✔ ${out}：${parts.length} 個零件、${parts.reduce((a, p) => a + Math.max(1, (p.at?.length ?? 0) + (p.grid ? p.grid.n[0] * p.grid.n[1] : 0)), 0)} 個實體（含複製）`);

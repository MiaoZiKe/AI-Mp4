// node videos/tech-probe2/gen-model.mjs → 寫 videos/tech-probe2/model.json
// 2026/11/27 tech-probe2（探針卡-2：誰在做，系列 2 第 22 集收尾）。構造與物理照 physics-spec.md，模組與爆炸步驟對照 visual-spec.md。
// 單位：示意（1＝約 1 cm），地板頂面 y＝0，x 向右、z 向觀眾。站點：
//   A 探針台＋探針卡（x 0；翻面、爆炸分解、組回、測完）｜F 美國地圖＋FormFactor 廠（x 40）｜T 台灣地圖＋旺矽、精測廠（x 84）
//   M 探針頭剖面：一排針壓下、高度差、超壓彎曲（x 120）｜W 單根針放大：磨耗、清針、換針（x 150）｜D 下一系列：貼膜環框上的晶圓＋切割刀（x 178）
//   外形依一般垂直式探針卡與探針台（示意，非特定廠牌／型號）；不標針數、針壓、壽命數字。
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
const HERE = path.dirname(new URL(import.meta.url).pathname);
const ROOT = path.join(HERE, "..", "..");

const R2 = (x) => Math.round(x * 1000) / 1000;
const D2R = Math.PI / 180;
const pol = (aDeg, r) => [R2(r * Math.cos(aDeg * D2R)), R2(r * Math.sin(aDeg * D2R))]; // (x, z)
let seed = 20261222;
const rnd = () => { seed |= 0; seed = (seed + 0x6d2b79f5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
const palette = {
  floorC: "#C9D2DE", panel: "#F3F5F8", panel2: "#E2E8F0", seam: "#8E9BB0", band: "#24324C", steel: "#7D8CA6", steel2: "#A9B5C7", dark: "#3E4A60", black: "#23262D",
  glassC: "#BFD3F2", lampY: "#F2B632", lampG: "#2FBF71", lampR: "#E5484D", screen: "#5B8DEF", rubber: "#2B2F36", gold: "#D4A83C", estop: "#D93A2B", warnY: "#F2B632",
  pcbC: "#1F6B45", pcbD: "#164F33", maskC: "#2A8558", capC: "#C8A26A", resC: "#2B2B2B", icC: "#30343B", connC: "#F1F1EC", labelC: "#FFFFFF",
  ceramC: "#F4F1E8", gpC: "#4A5468", needleC: "#C9CED8", tipC: "#E9EDF3", waferC: "#3C4E7A", waferE: "#6F84B8", dieLine: "#9FB0D6", padAl: "#B8BEC9",
  okC: "#2FBF71", badC: "#E5484D", laserC: "#38E07B", heightY: "#F2B632",
  depC: "#8A6A3E", grit: "#6E7480", sheetC: "#5E6573", seaC: "#CFE3F2", landC: "#9CCB8A", landT: "#7DB46B", gridC: "#A9C4DC", routeC: "#E8613C",
  cleanW: "#F7F8FA", winC: "#7FA6D9", roofFF: "#2F7FE0", roofMPI: "#E8613C", roofCH: "#14A38B", tankC: "#D9DEE6", pinR: "#E8613C", pinB: "#F2B632",
  tapeC: "#4F8FE0", frameC: "#B7C0CE", bladeC: "#D9DEE6", coolC: "#9FD3F5", markC: "#E8613C", edgeC: "#F4FAFF",
};
const M = (kind, color, o = {}) => ({ kind, color, ...o });
const glowM = (c, op, ei = 1) => M("std", c, { emissive: c, ei, opacity: op, rough: 1, metal: 0 });
const materials = {
  floor: M("std", "floorC", { rough: 0.7, metal: 0.3, tex: "brushed", texScale: 3 }),
  panel: M("std", "panel", { rough: 0.55, metal: 0.05, env: 0.25 }), panel2: M("std", "panel2", { rough: 0.6, metal: 0.05, env: 0.2 }),
  seam: M("std", "seam", { rough: 0.6, metal: 0.3 }), band: M("std", "band", { rough: 0.4, metal: 0.3, env: 0.4 }),
  steel: M("std", "steel", { rough: 0.35, metal: 0.85, env: 0.5 }), steel2: M("std", "steel2", { rough: 0.3, metal: 0.8, env: 0.6, tex: "brushed", texScale: 2 }),
  dark: M("std", "dark", { rough: 0.5, metal: 0.4, env: 0.3 }), black: M("std", "black", { rough: 0.45, metal: 0.5, env: 0.35 }), rubber: M("std", "rubber", { rough: 0.9, metal: 0 }),
  gold: M("std", "gold", { rough: 0.28, metal: 0.9, env: 0.9 }),
  window: M("phys", "glassC", { rough: 0.05, metal: 0, clearcoat: 1, opacity: 0.3, env: 0.6 }),
  lampY: M("std", "lampY", { emissive: "lampY", ei: 0.4, rough: 0.4, metal: 0 }), lampG: M("std", "lampG", { emissive: "lampG", ei: 0.45, rough: 0.4, metal: 0 }),
  lampR: M("std", "lampR", { emissive: "lampR", ei: 0.35, rough: 0.4, metal: 0 }), estop: M("std", "estop", { rough: 0.4, metal: 0, emissive: "estop", ei: 0.15 }),
  screen: M("std", "screen", { emissive: "screen", ei: 0.5, rough: 0.3, metal: 0 }), warnY: M("std", "warnY", { rough: 0.5, metal: 0, emissive: "warnY", ei: 0.2 }),
  pcb: M("std", "pcbC", { rough: 0.45, metal: 0.05, env: 0.35 }), pcbD: M("std", "pcbD", { rough: 0.5, metal: 0.05 }), mask: M("std", "maskC", { rough: 0.35, metal: 0.05, env: 0.4 }),
  cap: M("std", "capC", { rough: 0.5, metal: 0.1 }), res: M("std", "resC", { rough: 0.5, metal: 0.1 }), ic: M("std", "icC", { rough: 0.35, metal: 0.2, env: 0.3 }),
  conn: M("std", "connC", { rough: 0.6, metal: 0 }), label: M("std", "labelC", { rough: 0.7, metal: 0 }),
  ceram: M("std", "ceramC", { rough: 0.5, metal: 0, env: 0.3 }), gp: M("std", "gpC", { rough: 0.4, metal: 0.2, env: 0.4 }),
  needle: M("std", "needleC", { rough: 0.18, metal: 0.95, env: 1.1 }), tip: M("std", "tipC", { rough: 0.1, metal: 0.95, env: 1.2, emissive: "tipC", ei: 0.15 }),
  wafer: M("std", "waferC", { rough: 0.15, metal: 0.6, env: 1.0 }), waferE: M("std", "waferE", { rough: 0.2, metal: 0.6, env: 0.9 }), dieLine: M("std", "dieLine", { rough: 0.4, metal: 0.3, emissive: "dieLine", ei: 0.15 }),
  padAl: M("std", "padAl", { rough: 0.3, metal: 0.85, env: 0.7 }),
  ok: glowM("okC", 0.95, 0.7), bad: glowM("badC", 0.95, 0.7), laser: glowM("laserC", 0.85, 1.2), heightY: glowM("heightY", 0.95, 0.6),
  dep: M("std", "depC", { rough: 0.95, metal: 0 }), grit: M("std", "grit", { rough: 1, metal: 0.1 }), sheet: M("std", "sheetC", { rough: 0.95, metal: 0.05 }),
  sea: M("std", "seaC", { rough: 0.6, metal: 0 }), land: M("std", "landC", { rough: 0.8, metal: 0 }), landT: M("std", "landT", { rough: 0.8, metal: 0 }), grid: M("std", "gridC", { rough: 0.8, metal: 0 }),
  route: glowM("routeC", 0.95, 0.5),
  clean: M("std", "cleanW", { rough: 0.5, metal: 0.05, env: 0.3 }), win: M("std", "winC", { rough: 0.1, metal: 0.3, env: 0.9, emissive: "winC", ei: 0.12 }),
  roofFF: M("std", "roofFF", { rough: 0.5, metal: 0.1 }), roofMPI: M("std", "roofMPI", { rough: 0.5, metal: 0.1 }), roofCH: M("std", "roofCH", { rough: 0.5, metal: 0.1 }),
  tank: M("std", "tankC", { rough: 0.3, metal: 0.7, env: 0.7 }), pinR: glowM("pinR", 0.95, 0.6), pinB: glowM("pinB", 0.8, 0.8),
  tape: M("phys", "tapeC", { rough: 0.25, metal: 0, clearcoat: 0.8, opacity: 0.75, env: 0.6 }), frame: M("std", "frameC", { rough: 0.25, metal: 0.9, env: 0.8, tex: "brushed", texScale: 1.5 }),
  blade: M("std", "bladeC", { rough: 0.2, metal: 0.95, env: 1.1 }), cool: glowM("coolC", 0.85, 0.5), mark: M("std", "markC", { rough: 0.5, metal: 0, emissive: "markC", ei: 0.25 }), edge: glowM("edgeC", 0.95, 0.5),
};
const parts = [], layers = [], anchors = {}, actions = {};
const P = (o) => { parts.push(o); return o; };
const LAY = (id, outline, bg) => layers.push({ id, z: 0, k: 0, outline, ...(bg ? { bg: true } : {}) });
const V = [90, 0, 0], HX = [0, 90, 0];
const BOX = (id, layer, x0, x1, y0, y1, z0, z1, mat, o = {}) => P({ id, layer, shape: "box", size: [R2(x1 - x0), R2(y1 - y0), R2(z1 - z0)], pos: [R2((x0 + x1) / 2), R2((y0 + y1) / 2), R2((z0 + z1) / 2)], mat, ...o });
const VC = (id, layer, R, y0, y1, mat, o = {}) => { const { x = 0, z = 0, ...r } = o; return P({ id, layer, shape: "cyl", size: [R, R2(y1 - y0)], rot: V, pos: [x, R2((y0 + y1) / 2), z], mat, ...r }); };
const VT = (id, layer, Ro, Ri, y0, y1, mat, o = {}) => { const { x = 0, z = 0, ...r } = o; return P({ id, layer, shape: "tube", size: [Ro, Ri, R2(y1 - y0)], rot: V, pos: [x, R2((y0 + y1) / 2), z], mat, ...r }); };
const SPH = (id, layer, r, x, y, z, mat, o = {}) => P({ id, layer, shape: "sphere", size: [r], pos: [x, y, z], mat, ...o });
const RING = (n, r, a0 = 0, cx = 0, cz = 0) => Array.from({ length: n }, (_, i) => { const [x, z] = pol(a0 + (i * 360) / n, r); return [R2(x + cx), 0, R2(z + cz)]; });
const A = (layer, p, dx, dy) => ({ layer, p, dx, dy });
const PIPE = (id, layer, pts, r, mat, o = {}) => {
  for (let i = 0; i < pts.length - 1; i++) {
    const [x0, y0, z0] = pts[i], [x1, y1, z1] = pts[i + 1];
    const dx = x1 - x0, dy = y1 - y0, dz = z1 - z0, L = Math.hypot(dx, dy, dz);
    const rot = Math.abs(dx) > 1e-6 ? HX : Math.abs(dy) > 1e-6 ? V : [0, 0, 0];
    P({ id: `${id}${i}`, layer, shape: "cyl", size: [r, R2(L)], rot, pos: [R2((x0 + x1) / 2), R2((y0 + y1) / 2), R2((z0 + z1) / 2)], mat, ...o });
    if (i > 0) SPH(`${id}J${i}`, layer, r * 1.12, x0, y0, z0, mat);
  }
};
const idsOf = (layer) => parts.filter((q) => q.layer === layer).map((q) => q.id);

// 文字名牌與國旗貼圖（make-brand-tex.mjs → public/tex/brand/，不進 git，每次重產）。官方 LOGO 三類來源都抓不到（見 assets.md），用白底深色字名牌，不仿商標。
const SIGNS = [["p2ff", "FormFactor"], ["p2mpi", "旺矽|MPI"], ["p2chpt", "中華精測|CHPT"]];
{ const r = spawnSync("node", [path.join(ROOT, "scripts", "three", "make-brand-tex.mjs"), "tech-probe2", "flag:US", "flag:TW", ...SIGNS.map(([id, t]) => `text:${id}=${t}`)], { encoding: "utf8" }); if (r.status !== 0) { console.error(r.stdout, r.stderr); process.exit(1); } }
const SIGNM = JSON.parse(fs.readFileSync(path.join(ROOT, "public", "tex", "brand", "meta.json"), "utf8"));
const tex = (name) => { materials[`t_${name}`] = { kind: "unlit", color: "#FFFFFF", img: `tex/brand/${name}.png` }; return `t_${name}`; };
const plate = (id, layer, name, w, cx, cy, cz, rotY = 0) => { const a = SIGNM[name].aspect, h = R2(w / a); P({ id, layer, shape: "plane", size: [w, h], pos: [cx, cy, cz], uv01: true, shadow: false, mat: tex(name), ...(rotY ? { rot: [0, rotY, 0] } : {}) }); return h; };

// ═════ 地板 ═════
LAY("floor", [260, 2, 90, 0], true);
P({ id: "floor", layer: "floor", shape: "slab", size: [300, 0.5, 50], r: 0.2, pos: [90, -0.25, 0], mat: "floor" });
P({ id: "floorSeam", layer: "floor", shape: "slab", size: [300, 0.04, 0.1], pos: [90, 0.01, 0], at: Array.from({ length: 8 }, (_, i) => [0, 0, -18 + i * 5.2]), mat: "seam" });

// ═════ 站 A：探針台（prober）＋探針卡（垂直式，針面朝下）═════
// 探針台機櫃：門板、把手、螢幕、指示燈、急停、警示貼、百葉、螺絲；上方 XY 載台＋吸盤＋晶圓（晶粒格線、缺口）；後方兩根立柱撐住頭板環（卡座）
LAY("prober", [20, 4, 3.3, 2.0], true);   // 探針台機台當舞台（背景層）：主素材＝探針卡、晶圓
BOX("prBase", "prober", -6.6, 13.2, 0, 1.5, -5.6, 5.6, "band"); BOX("prTop", "prober", -6.6, 13.2, 1.5, 1.6, -5.6, 5.6, "panel2");
// 右側裝卸區（晶圓測完由 XY 載台沿導軌送出來）：門板、窗、指示燈
BOX("prLoadDoor", "prober", 6.9, 12.7, 0.25, 1.32, 5.6, 5.66, "panel"); BOX("prLoadWin", "prober", 7.6, 9.8, 0.55, 1.1, 5.66, 5.69, "window"); P({ id: "prLoadLed", layer: "prober", shape: "sphere", size: [0.08], pos: [11.9, 1.1, 5.7], at: [[0, 0, 0], [0.36, 0, 0]], mat: "lampY" });
BOX("prLoadPlate", "prober", 6.6, 12.9, 1.6, 1.68, -3.9, 3.9, "steel");
BOX("prDoorL", "prober", -6.1, -0.25, 0.25, 1.32, 5.6, 5.66, "panel"); BOX("prDoorR", "prober", 0.25, 6.1, 0.25, 1.32, 5.6, 5.66, "panel");
P({ id: "prHandle", layer: "prober", shape: "box", size: [0.12, 0.55, 0.14], pos: [-0.55, 0.8, 5.75], at: [[0, 0, 0], [1.1, 0, 0]], mat: "steel2" });
BOX("prScreen", "prober", -5.6, -3.4, 0.95, 1.22, 5.66, 5.7, "screen"); BOX("prScreenF", "prober", -5.7, -3.3, 0.88, 1.29, 5.64, 5.67, "dark");
P({ id: "prLed", layer: "prober", shape: "sphere", size: [0.08], pos: [-2.9, 1.1, 5.7], at: [[0, 0, 0], [0.36, 0, 0], [0.72, 0, 0]], mat: "lampG" });
BOX("prEstop", "prober", 4.4, 4.9, 0.95, 1.25, 5.66, 5.8, "estop"); BOX("prWarn", "prober", 5.1, 5.9, 0.4, 0.8, 5.66, 5.7, "warnY");
for (let i = 0; i < 6; i++) BOX(`prVent${i}`, "prober", 2.0, 3.8, 0.32 + i * 0.12, 0.37 + i * 0.12, 5.66, 5.7, "dark");
P({ id: "prSeam", layer: "prober", shape: "box", size: [0.05, 1.4, 0.05], pos: [0, 0.8, 5.62], at: [[-4.4, 0, 0], [0, 0, 0], [4.4, 0, 0]], mat: "seam" });
P({ id: "prScrew", layer: "prober", shape: "cyl", size: [0.07, 0.04], rot: V, pos: [0, 1.62, 0], at: [[-6.2, 0, -5.2], [6.2, 0, -5.2], [-6.2, 0, 5.2], [6.2, 0, 5.2]], mat: "steel" });
BOX("prPlate", "prober", -5.4, 5.4, 1.6, 1.72, -4.6, 4.6, "steel");                      // 頭板（整片厚鋼板的下緣，示意）
P({ id: "prRail", layer: "prober", shape: "box", size: [19.0, 0.1, 0.24], pos: [3.4, 1.78, 0], at: [[0, 0, -3.3], [0, 0, 3.3]], mat: "steel2" });
P({ id: "prRailBolt", layer: "prober", shape: "cyl", size: [0.05, 0.03], rot: V, pos: [0, 1.84, 0], at: Array.from({ length: 12 }, (_, i) => [R2(-5.2 + i * 1.6), 0, -3.3]).concat(Array.from({ length: 12 }, (_, i) => [R2(-5.2 + i * 1.6), 0, 3.3])), mat: "dark" });
P({ id: "prScrewR", layer: "prober", shape: "cyl", size: [0.07, 0.04], rot: V, pos: [0, 1.62, 0], at: [[12.8, 0, -5.2], [12.8, 0, 5.2]], mat: "steel" });
// 後方立柱與頭板環（卡座）：環內放探針卡
P({ id: "prPost", layer: "prober", shape: "box", size: [0.9, 2.1, 0.9], pos: [0, 2.67, -4.6], at: [[-5.3, 0, 0], [5.3, 0, 0]], mat: "panel" });
P({ id: "prPostBolt", layer: "prober", shape: "cyl", size: [0.06, 0.04], rot: V, pos: [0, 1.74, -4.1], at: [[-5.6, 0, 0], [-5.0, 0, 0], [5.0, 0, 0], [5.6, 0, 0]], mat: "steel" });
BOX("prBridge", "prober", -5.75, 5.75, 3.72, 4.05, -5.05, -4.15, "panel");
VT("prRing", "prober", 5.55, 4.72, 3.44, 3.6, "dark"); VT("prRingIn", "prober", 4.78, 4.66, 3.42, 3.56, "steel2");
P({ id: "prRingBolt", layer: "prober", shape: "cyl", size: [0.07, 0.05], rot: V, pos: [0, 3.62, 0], at: RING(16, 5.15, 11), mat: "steel" });
P({ id: "prRingArm", layer: "prober", shape: "box", size: [0.7, 0.16, 1.3], pos: [0, 3.52, -4.6], at: [[-4.2, 0, 0.6], [4.2, 0, 0.6]], mat: "dark" });
// 機台上方看得到的辨識件：右後方三色信號燈塔、左前方操作螢幕（懸臂架）＋鍵盤托盤
VC("prTowerPole", "prober", 0.09, 4.05, 5.0, "steel2", { x: 5.3, z: -4.6 });
[["lampR", 5.0], ["lampY", 5.32], ["lampG", 5.64]].forEach(([mt, y], i) => VC(`prTower${i}`, "prober", 0.2, y, y + 0.3, mt, { x: 5.3, z: -4.6 })); VC("prTowerCap", "prober", 0.21, 5.94, 6.02, "dark", { x: 5.3, z: -4.6 });
VC("prMonPole", "prober", 0.08, 1.6, 4.3, "steel2", { x: -6.2, z: 3.8 }); BOX("prMonArm", "prober", -6.25, -5.2, 4.2, 4.35, 3.75, 3.95, "steel2");
P({ id: "prMon", layer: "prober", shape: "box", size: [1.7, 1.1, 0.1], pos: [-4.7, 4.55, 4.0], rot: [-12, 20, 0], mat: "dark" }); P({ id: "prMonScr", layer: "prober", shape: "box", size: [1.5, 0.9, 0.02], pos: [-4.67, 4.55, 4.06], rot: [-12, 20, 0], mat: "screen" });
// 載台＋吸盤＋晶圓（會上下接觸：touch）
LAY("chuck", [7, 0.8, 0, 1.9]);
BOX("ckStage", "chuck", -3.7, 3.7, 1.84, 1.98, -3.7, 3.7, "steel2");
VC("ckBody", "chuck", 3.25, 1.98, 2.28, "steel2"); VT("ckRim", "chuck", 3.3, 3.12, 2.0, 2.3, "dark");
for (const r of [0.9, 1.7, 2.5]) VT(`ckGroove${r * 10}`, "chuck", r + 0.04, r - 0.04, 2.28, 2.3, "dark");
LAY("wafer", [6.2, 0.2, 0, 2.32]);
VC("wfBody", "wafer", 3.0, 2.3, 2.35, "wafer"); VT("wfEdge", "wafer", 3.02, 2.92, 2.3, 2.352, "waferE");
BOX("wfNotch", "wafer", -0.12, 0.12, 2.3, 2.356, 2.88, 3.05, "dark");
{ const g = []; for (let i = -6; i <= 6; i++) { const L = 2 * Math.sqrt(Math.max(0, 9 - (i * 0.45) ** 2)) - 0.1; g.push([i * 0.45, R2(L)]); }
  g.forEach(([c, L], i) => { P({ id: `wfLx${i}`, layer: "wafer", shape: "box", size: [L, 0.008, 0.025], pos: [0, 2.356, c], mat: "dieLine" }); P({ id: `wfLz${i}`, layer: "wafer", shape: "box", size: [0.025, 0.008, L], pos: [c, 2.356, 0], mat: "dieLine" }); }); }
// 晶粒測試結果（s8）：一列一列亮綠（做完也測完）。每列一層，依序出現
const DIE = 0.45, dies = [];
for (let i = -6; i < 6; i++) for (let j = -6; j < 6; j++) { const x = (i + 0.5) * DIE, z = (j + 0.5) * DIE; if (Math.hypot(Math.abs(x) + DIE / 2, Math.abs(z) + DIE / 2) < 2.95) dies.push([R2(x), R2(z), i]); }
const DROWS = [[-6, -4], [-3, -1], [0, 2], [3, 5]];
DROWS.forEach(([a, b], k) => { LAY(`dieOk${k}`, [6, 0.1, 0, 2.36]); P({ id: `dieOkB${k}`, layer: `dieOk${k}`, shape: "box", size: [0.36, 0.012, 0.36], pos: [0, 2.362, 0], at: dies.filter(([, , i]) => i >= a && i <= b).map(([x, z]) => [x, 0, z]), mat: "ok" }); });
// 探針卡（針面朝下，坐在頭板環裡）。各層：pcb 電路板｜stiff 加強板｜st 空間轉換器｜ugp 上導板｜spc 間隔框｜lgp 下導板｜nd 針林｜ndRow 前排一列針（爆炸時抽出）
const YC = 3.3;              // 翻面轉軸高度（卡片中心）
const LIFT = 4.0;            // 翻面前先抬高：卡片半徑 4.6，立起來時下緣要高過晶圓（3.3＋4.0−4.6＝2.7＞2.35），而且卡片半徑小於卡座環內徑 4.72，轉的時候穿過環孔不碰環
const Y_PCB0 = 3.6, Y_PCB1 = 3.82, Y_ST0 = 3.38, Y_UG0 = 3.1, Y_UG1 = 3.2, Y_LG0 = 2.62, Y_LG1 = 2.72, Y_TIP = 2.4;
LAY("pcb", [9.4, 0.4, 0, 3.7]);
VC("pcbDisc", "pcb", 4.6, Y_PCB0, Y_PCB1, "pcb"); VT("pcbRim", "pcb", 4.62, 4.48, Y_PCB0, Y_PCB1 + 0.004, "pcbD");
P({ id: "pcbPogo", layer: "pcb", shape: "box", size: [0.22, 0.02, 0.12], pos: [0, Y_PCB1 + 0.01, 0], at: RING(56, 4.22).concat(RING(56, 3.98, 3.2)), mat: "gold" });
{ const caps = [], resis = [], ics = []; for (let i = 0; i < 70; i++) { const a = rnd() * 360, r = 1.9 + rnd() * 1.7, [x, z] = pol(a, r); (i % 3 === 0 ? resis : caps).push([x, 0, z]); }
  for (let i = 0; i < 8; i++) { const [x, z] = pol(22 + i * 45, 2.95); ics.push([x, 0, z]); }
  P({ id: "pcbCap", layer: "pcb", shape: "box", size: [0.16, 0.08, 0.09], pos: [0, Y_PCB1 + 0.04, 0], at: caps, mat: "cap" });
  P({ id: "pcbRes", layer: "pcb", shape: "box", size: [0.14, 0.05, 0.07], pos: [0, Y_PCB1 + 0.025, 0], at: resis, mat: "res" });
  P({ id: "pcbIc", layer: "pcb", shape: "box", size: [0.42, 0.06, 0.42], pos: [0, Y_PCB1 + 0.03, 0], at: ics, mat: "ic" }); }
for (let i = 0; i < 16; i++) { const a = i * 22.5 + 5, [x0, z0] = pol(a, 1.5), [x1, z1] = pol(a, 3.9), L = R2(Math.hypot(x1 - x0, z1 - z0)); P({ id: `pcbTrace${i}`, layer: "pcb", shape: "box", size: [L, 0.006, 0.03], pos: [R2((x0 + x1) / 2), Y_PCB1 + 0.003, R2((z0 + z1) / 2)], rot: [0, -a, 0], mat: "gold" }); }
P({ id: "pcbConn", layer: "pcb", shape: "box", size: [0.9, 0.22, 0.32], pos: [0, Y_PCB1 + 0.11, 0], at: [[-3.3, 0, 2.4], [3.3, 0, 2.4], [-3.3, 0, -2.4], [3.3, 0, -2.4]].map(([x, y, z]) => [x, y, z]), mat: "conn" });
BOX("pcbLabel", "pcb", 1.3, 2.4, Y_PCB1, Y_PCB1 + 0.012, 3.3, 3.75, "label"); BOX("pcbLabel2", "pcb", -2.5, -1.5, Y_PCB1, Y_PCB1 + 0.012, 3.3, 3.62, "warnY");
// 下表面（針面那側）也有一圈元件與定位孔，翻面後看得到
P({ id: "pcbCapB", layer: "pcb", shape: "box", size: [0.16, 0.07, 0.09], pos: [0, Y_PCB0 - 0.035, 0], at: RING(28, 3.4, 4).concat(RING(22, 2.3, 9)), mat: "cap" });
P({ id: "pcbHole", layer: "pcb", shape: "cyl", size: [0.11, 0.01], rot: V, pos: [0, Y_PCB0 - 0.006, 0], at: RING(4, 4.1, 45), mat: "black" });
BOX("pcbMaskB", "pcb", -1.55, 1.55, Y_PCB0 - 0.01, Y_PCB0, -1.55, 1.55, "mask");
LAY("stiff", [6, 0.4, 0, 4.0]);
VT("stRing", "stiff", 2.75, 2.25, Y_PCB1, 4.12, "black"); VC("stHub", "stiff", 1.35, Y_PCB1, 4.16, "black");
for (let i = 0; i < 4; i++) { const a = 45 + i * 90, [x, z] = pol(a, 3.35); P({ id: `stSpoke${i}`, layer: "stiff", shape: "box", size: [1.6, 0.26, 0.5], pos: [x, R2(Y_PCB1 + 0.13), z], rot: [0, -a, 0], mat: "black" }); }
P({ id: "stBolt", layer: "stiff", shape: "cyl", size: [0.08, 0.06], rot: V, pos: [0, 4.17, 0], at: RING(8, 2.5, 22.5).concat(RING(6, 0.95)), mat: "steel2" });
P({ id: "stBoltO", layer: "stiff", shape: "cyl", size: [0.08, 0.06], rot: V, pos: [0, Y_PCB1 + 0.28, 0], at: RING(4, 4.0, 45), mat: "steel2" });
BOX("stTag", "stiff", -0.5, 0.5, 4.16, 4.18, -0.25, 0.25, "label");
// 空間轉換器（多層陶瓷）：側面層線＋針尾那面的細密焊墊（翻面、抽出後看得到）
LAY("st", [3, 0.3, 0, 3.5]);
BOX("stBody", "st", -1.3, 1.3, Y_ST0, Y_PCB0, -1.3, 1.3, "ceram");
P({ id: "stLayer", layer: "st", shape: "box", size: [2.62, 0.008, 2.62], pos: [0, 0, 0], at: [3.44, 3.49, 3.54].map((y) => [0, y, 0]), mat: "seam" });
const NG = 12, NP = 0.17, N0 = -((NG - 1) * NP) / 2;
const grid = []; for (let i = 0; i < NG; i++) for (let j = 0; j < NG; j++) grid.push([R2(N0 + i * NP), R2(N0 + j * NP), j]);
P({ id: "stPad", layer: "st", shape: "box", size: [0.1, 0.012, 0.1], pos: [0, Y_ST0 - 0.006, 0], at: grid.map(([x, z]) => [R2(x + 0.05), 0, z]), mat: "gold" });
P({ id: "stPadO", layer: "st", shape: "box", size: [0.2, 0.012, 0.2], pos: [0, Y_PCB0 + 0.0, 0], at: RING(24, 1.05).map(([x, , z]) => [x, 0, z]), mat: "gold" });
// 導板（氮化矽類陶瓷板，示意深灰）＋間隔框
LAY("ugp", [2.6, 0.2, 0, 3.15]); BOX("ugpPlate", "ugp", -1.15, 1.15, Y_UG0, Y_UG1, -1.15, 1.15, "gp");
P({ id: "ugpHole", layer: "ugp", shape: "cyl", size: [0.035, 0.01], rot: V, pos: [0, Y_UG0 - 0.004, 0], at: grid.map(([x, z]) => [R2(x + 0.05), 0, z]), mat: "black" });
LAY("spc", [2.6, 0.4, 0, 2.9]);
P({ id: "spcBar", layer: "spc", shape: "box", size: [2.3, 0.38, 0.16], pos: [0, 2.91, 0], at: [[0, 0, -1.07], [0, 0, 1.07]], mat: "steel" });
P({ id: "spcBarS", layer: "spc", shape: "box", size: [0.16, 0.38, 1.98], pos: [0, 2.91, 0], at: [[-1.07, 0, 0], [1.07, 0, 0]], mat: "steel" });
P({ id: "spcScrew", layer: "spc", shape: "cyl", size: [0.05, 0.02], pos: [0, 2.91, 1.16], at: [[-0.8, 0, 0], [0, 0, 0], [0.8, 0, 0]], mat: "dark" });
LAY("lgp", [2.6, 0.2, 0, 2.67]); BOX("lgpPlate", "lgp", -1.15, 1.15, Y_LG0, Y_LG1, -1.15, 1.15, "gp");
P({ id: "lgpHole", layer: "lgp", shape: "cyl", size: [0.035, 0.01], rot: V, pos: [0, Y_LG0 - 0.004, 0], at: grid.map(([x, z]) => [x, 0, z]), mat: "black" });
P({ id: "lgpMark", layer: "lgp", shape: "box", size: [0.18, 0.012, 0.18], pos: [0, Y_LG0 - 0.006, 0], at: [[-1.0, 0, -1.0], [1.0, 0, 1.0]], mat: "gold" });
// 針：下段直（穿下導板、針尖露出）、中段斜（彎弧，示意）、上段直（穿上導板到針尾）＋針尖。前排（z 最小那排，翻面後轉到前面）另一層 ndRow
const needle = (pre, layer, pts) => {
  const tilt = Math.atan2(0.05, Y_UG0 - Y_LG1) / D2R, L2 = R2(Math.hypot(0.05, Y_UG0 - Y_LG1));
  P({ id: `${pre}Lo`, layer, shape: "cyl", size: [0.022, R2(Y_LG1 - Y_TIP + 0.02)], rot: V, pos: [0, R2((Y_TIP + Y_LG1) / 2 + 0.01), 0], at: pts.map(([x, z]) => [x, 0, z]), mat: "needle" });
  P({ id: `${pre}Mid`, layer, shape: "cyl", size: [0.022, L2], rot: [90, R2(-tilt), 0], pos: [0.025, R2((Y_LG1 + Y_UG0) / 2), 0], at: pts.map(([x, z]) => [x, 0, z]), mat: "needle" });
  P({ id: `${pre}Hi`, layer, shape: "cyl", size: [0.022, R2(Y_ST0 - Y_UG0)], rot: V, pos: [0.05, R2((Y_UG0 + Y_ST0) / 2), 0], at: pts.map(([x, z]) => [x, 0, z]), mat: "needle" });
  P({ id: `${pre}Tip`, layer, shape: "cone", size: [0.004, 0.022, 0.07], rot: V, pos: [0, R2(Y_TIP + 0.035), 0], at: pts.map(([x, z]) => [x, 0, z]), mat: "tip" });
};
LAY("nd", [2.2, 1.0, 0, 2.9]); needle("nd", "nd", grid.filter(([, , j]) => j > 0).map(([x, z]) => [x, z]));
LAY("ndRow", [2.2, 1.0, 0, 2.9]); needle("ndR", "ndRow", grid.filter(([, , j]) => j === 0).map(([x, z]) => [x, z]));
// 針高地圖（翻面後疊在針尖上的彩色點：綠＝高度在範圍內、黃＝偏高、紅＝偏低壓不到；示意，不標數字）＋雷射掃描線
LAY("hmap", [2.4, 0.2, 0, 2.4]);
{ const ok = [], hi = [], lo = []; grid.forEach(([x, z], k) => { const v = rnd(); (v < 0.08 ? lo : v < 0.22 ? hi : ok).push([x, 0, z]); });
  P({ id: "hmOk", layer: "hmap", shape: "cyl", size: [0.055, 0.012], rot: V, pos: [0, Y_TIP - 0.012, 0], at: ok, mat: "ok" });
  P({ id: "hmHi", layer: "hmap", shape: "cyl", size: [0.065, 0.012], rot: V, pos: [0, Y_TIP - 0.012, 0], at: hi, mat: "heightY" });
  P({ id: "hmLo", layer: "hmap", shape: "cyl", size: [0.075, 0.012], rot: V, pos: [0, Y_TIP - 0.012, 0], at: lo, mat: "bad" }); }
const CARD = ["pcb", "stiff", "st", "ugp", "spc", "lgp", "nd", "ndRow", "hmap"];
const flipY = (y) => R2(2 * YC - y);        // 翻面後的高度（未加抬升）
LAY("laser", [0.3, 2.2, 0, 9.2]);
const LZY = R2(2 * YC - Y_TIP + LIFT + 0.08);   // 翻面、抬高後的針尖再高一點
// 雷射量測頭掛在後方橫樑上：立柱＋橫臂（跟著量測頭沿 x 掃），橫樑導軌固定
LAY("lzRail", [12, 1, 0, 11.4]); BOX("lzRailB", "lzRail", -5.75, 5.75, LZY + 2.95, LZY + 3.35, -5.05, -4.45, "panel"); BOX("lzRailT", "lzRail", -5.6, 5.6, LZY + 2.85, LZY + 2.95, -4.9, -4.6, "steel2");
P({ id: "lzRailPost", layer: "lzRail", shape: "box", size: [0.7, R2(LZY + 3.35 - 4.05), 0.6], pos: [0, R2((LZY + 3.35 + 4.05) / 2), -4.75], at: [[-5.4, 0, 0], [5.4, 0, 0]], mat: "panel" });
BOX("lzArm", "laser", -0.22, 0.22, LZY + 2.05, LZY + 2.35, -4.7, -0.3, "steel2"); BOX("lzCar", "laser", -0.5, 0.5, LZY + 2.35, LZY + 2.85, -5.0, -4.4, "dark"); BOX("lzCable", "laser", -0.06, 0.06, LZY + 2.35, LZY + 2.42, -4.3, -0.5, "black");
BOX("lzLine", "laser", -0.03, 0.03, LZY, LZY + 0.03, -1.5, 1.5, "laser"); BOX("lzHead", "laser", -0.35, 0.35, LZY + 1.7, LZY + 2.1, -0.45, 0.45, "dark"); BOX("lzWin", "laser", -0.18, 0.18, LZY + 1.65, LZY + 1.72, -0.3, 0.3, "laser");
P({ id: "lzFan", layer: "laser", shape: "box", size: [0.03, 1.62, 0.03], pos: [0, R2(LZY + 0.84), 0], at: [-1.4, -0.7, 0, 0.7, 1.4].map((z) => [0, 0, z]), mat: "laser" });   // 雷射光幕（示意：幾道細光線）

// ═════ 站 F：美國地圖桌＋FormFactor 廠（Livermore, CA；示意比例）═════
const MAPJ = JSON.parse(fs.readFileSync(path.join(ROOT, "videos", "tech-mask2", "map.json"), "utf8")).rings;   // Natural Earth 1:50m（公有領域），tech-mask2 已整理
const FX = 40, TOPF = 0.52;
const PU = (lon, lat) => [R2(FX + (lon + 96) * 0.4), R2(-(lat - 38.5) * 0.5)];
LAY("fMap", [26, 1, FX, 0.4], true);   // 地圖桌當背景層（像地板）：主素材＝廠房與定位針
BOX("fSea", "fMap", FX - 13, FX + 13, 0, 0.3, -8, 8, "sea"); BOX("fRim", "fMap", FX - 13.3, FX + 13.3, -0.05, 0.22, -8.3, 8.3, "dark");
P({ id: "fLat", layer: "fMap", shape: "box", size: [25.6, 0.012, 0.05], pos: [FX, 0.306, 0], at: [25, 30, 35, 40, 45, 50].map((la) => [0, 0, R2(-(la - 38.5) * 0.5)]), mat: "grid" });
P({ id: "fLon", layer: "fMap", shape: "box", size: [0.05, 0.012, 15.6], pos: [FX, 0.306, 0], at: [-125, -115, -105, -95, -85, -75, -65].map((lo) => [R2((lo + 96) * 0.4), 0, 0]), mat: "grid" });
{ const ring = MAPJ.US[0].map(([lo, la]) => PU(lo, la)); const xs = ring.map((p) => p[0]), zs = ring.map((p) => p[1]); const cx = (Math.min(...xs) + Math.max(...xs)) / 2, cz = (Math.min(...zs) + Math.max(...zs)) / 2;
  P({ id: "fLand", layer: "fMap", shape: "poly", size: [1, 1, 0.22], pts: ring.map(([x, z]) => [R2(x - cx), R2(-(z - cz))]), rot: [-90, 0, 0], pos: [R2(cx), 0.3, R2(cz)], mat: "land" }); }
// 廠房（plant）：潔淨室外牆＋接縫、窗帶、屋頂色帶、空調箱與風扇、排氣管、卸貨門、氮氣槽、廠牌（文字名牌）、旗桿國旗
const plant = (pid, lay, x, z, w, d, h, roof, y0, o = {}) => {
  BOX(`${pid}Pad`, lay, x - w / 2 - 0.3, x + w / 2 + 0.3, y0, y0 + 0.05, z - d / 2 - 0.3, z + d / 2 + 0.6, "panel2");
  BOX(`${pid}B`, lay, x - w / 2, x + w / 2, y0, y0 + h, z - d / 2, z + d / 2, "clean");
  const ns = Math.max(3, Math.floor(w / 0.32));
  P({ id: `${pid}Sm`, layer: lay, shape: "box", size: [0.02, R2(h * 0.9), 0.012], pos: [R2(x - w / 2), R2(y0 + h / 2), R2(z + d / 2 + 0.008)], at: Array.from({ length: ns }, (_, i) => [R2((w * (i + 1)) / (ns + 1)), 0, 0]), mat: "seam" });
  for (const yy of o.winRows ?? [0.68]) BOX(`${pid}Wn${yy * 100}`, lay, x - w * 0.45, x + w * 0.45, y0 + h * yy - h * 0.06, y0 + h * yy + h * 0.06, z + d / 2, z + d / 2 + 0.02, "win");
  BOX(`${pid}Bd`, lay, x - w / 2 - 0.01, x + w / 2 + 0.01, y0 + h * 0.9, y0 + h, z - d / 2 - 0.01, z + d / 2 + 0.01, roof);
  BOX(`${pid}R`, lay, x - w / 2 - 0.03, x + w / 2 + 0.03, y0 + h, y0 + h + 0.04, z - d / 2 - 0.03, z + d / 2 + 0.03, "panel2");
  const na = Math.max(2, Math.floor(w / 0.75));
  P({ id: `${pid}Ah`, layer: lay, shape: "box", size: [0.42, 0.22, 0.32], pos: [R2(x - w / 2 + 0.4), R2(y0 + h + 0.15), R2(z - d * 0.18)], at: Array.from({ length: na }, (_, i) => [R2(((w - 0.8) * i) / (na - 1)), 0, 0]), mat: "steel2" });
  P({ id: `${pid}Fn`, layer: lay, shape: "cyl", size: [0.1, 0.03], rot: V, pos: [R2(x - w / 2 + 0.4), R2(y0 + h + 0.27), R2(z - d * 0.18)], at: Array.from({ length: na }, (_, i) => [R2(((w - 0.8) * i) / (na - 1)), 0, 0]), mat: "dark" });
  P({ id: `${pid}Sk`, layer: lay, shape: "cyl", size: [0.07, 0.7], rot: V, pos: [R2(x + w / 2 - 0.3), R2(y0 + h + 0.35), R2(z + d * 0.22)], at: [[0, 0, 0], [-0.25, 0, 0]], mat: "steel" });
  BOX(`${pid}Dk`, lay, x + w * 0.18, x + w * 0.38, y0, y0 + h * 0.32, z + d / 2, z + d / 2 + 0.03, "dark");
  BOX(`${pid}Door`, lay, x - w * 0.36, x - w * 0.26, y0, y0 + h * 0.3, z + d / 2, z + d / 2 + 0.03, "win");
  VC(`${pid}N2`, lay, 0.16, y0, y0 + h * 0.85, "tank", { x: R2(x + w / 2 + 0.3), z: R2(z - d * 0.15) }); VC(`${pid}N2b`, lay, 0.16, y0, y0 + h * 0.85, "tank", { x: R2(x + w / 2 + 0.3), z: R2(z + d * 0.12) });
  if (o.sign) { const sw = o.signW ?? Math.min(2.2, w * 0.72); const sh = R2(sw / SIGNM[o.sign].aspect);
    P({ id: `${pid}Sp`, layer: lay, shape: "cyl", size: [0.03, 0.4], rot: V, pos: [R2(x - sw / 2 + 0.12), R2(y0 + 0.2), R2(z + d / 2 + 0.45)], at: [[0, 0, 0], [R2(sw - 0.24), 0, 0]], mat: "steel2" });
    plate(`${pid}Sg`, lay, o.sign, sw, R2(x), R2(y0 + 0.38 + sh / 2), R2(z + d / 2 + 0.47)); }
  if (o.flag) { const ph = o.poleH ?? h * 1.35, px = R2(x + w / 2 + 0.75), pz = R2(z + d / 2 + 0.35);
    VC(`${pid}Pole`, lay, 0.025, y0, y0 + ph, "steel2", { x: px, z: pz }); SPH(`${pid}PoleB`, lay, 0.045, px, R2(y0 + ph + 0.02), pz, "steel2");
    const fw = o.flagW ?? 0.7; plate(`${pid}Flag`, lay, o.flag, fw, R2(px + fw / 2 + 0.03), R2(y0 + ph - fw / SIGNM[o.flag].aspect / 2 - 0.04), pz); }
};
const pin = (pid, lay, x, z, y0, r = 0.5, hgt = 2.2) => {
  VT(`${pid}Ring`, lay, r, r - 0.07, y0 + 0.01, y0 + 0.05, "pinR", { x, z }); VC(`${pid}Beam`, lay, 0.04, y0, y0 + hgt, "pinB", { x, z }); SPH(`${pid}Head`, lay, 0.13, x, R2(y0 + hgt + 0.08), z, "pinR");
};
const dots = (id, lay, a, b, y, n, mat = "route") => P({ id, layer: lay, shape: "sphere", size: [0.07], pos: [0, y, 0], at: Array.from({ length: n }, (_, i) => { const t = (i + 0.5) / n; return [R2(a[0] + (b[0] - a[0]) * t), 0, R2(a[1] + (b[1] - a[1]) * t)]; }), mat });
const [LVX, LVZ] = PU(-121.77, 37.68);
LAY("fPin", [1.2, 3, LVX, 1.5]); pin("fP", "fPin", LVX, LVZ, TOPF, 0.45, 2.4);
// FormFactor 廠：長條兩層廠房（橫向兩條窗帶、藍色屋頂帶），坐在加州到內華達一帶（示意比例），旗桿掛美國國旗
const FFX = R2(LVX + 3.4), FFZ = R2(LVZ + 0.9);
LAY("fFab", [6, 3.5, FFX, 1.8]); plant("ff", "fFab", FFX, FFZ, 4.6, 1.9, 1.75, "roofFF", TOPF, { sign: "sign-p2ff", signW: 2.8, flag: "flag-US", winRows: [0.36, 0.7], flagW: 0.8 });
dots("fLead", "fFab", [LVX + 0.4, LVZ + 0.2], [FFX - 2.4, FFZ + 0.1], TOPF + 0.05, 6);

// ═════ 站 T：台灣地圖桌＋旺矽（新竹）、精測（桃園平鎮）（示意放大；廠房放在旁邊的展示台，用虛線連回真實位置）═════
const TX = 84, TOPT = 0.52;
const PT = (lon, lat) => [R2(TX + (lon - 120.95) * 3.5), R2(-(lat - 23.75) * 3.8)];
LAY("tMap", [20, 1, TX, 0.4], true);
BOX("tSea", "tMap", TX - 10, TX + 10, 0, 0.3, -8.5, 8.5, "sea"); BOX("tRim", "tMap", TX - 10.3, TX + 10.3, -0.05, 0.22, -8.8, 8.8, "dark");
P({ id: "tLat", layer: "tMap", shape: "box", size: [19.6, 0.012, 0.05], pos: [TX, 0.306, 0], at: [22, 23, 24, 25, 26].map((la) => [0, 0, R2(-(la - 23.75) * 3.8)]), mat: "grid" });
P({ id: "tLon", layer: "tMap", shape: "box", size: [0.05, 0.012, 16.6], pos: [TX, 0.306, 0], at: [119, 120, 121, 122, 123].map((lo) => [R2((lo - 120.95) * 3.5), 0, 0]), mat: "grid" });
{ const ring = MAPJ.TW[0].map(([lo, la]) => PT(lo, la)); const xs = ring.map((p) => p[0]), zs = ring.map((p) => p[1]); const cx = (Math.min(...xs) + Math.max(...xs)) / 2, cz = (Math.min(...zs) + Math.max(...zs)) / 2;
  P({ id: "tLand", layer: "tMap", shape: "poly", size: [1, 1, 0.22], pts: ring.map(([x, z]) => [R2(x - cx), R2(-(z - cz))]), rot: [-90, 0, 0], pos: [R2(cx), 0.3, R2(cz)], mat: "land" }); }
const [HCX, HCZ] = PT(120.97, 24.8), [PZX, PZZ] = PT(121.21, 24.94);
LAY("tPinM", [1, 3, HCX, 1.5]); pin("tPM", "tPinM", HCX, HCZ, TOPT, 0.38, 1.8);
LAY("tPinC", [1, 3, PZX, 1.5]); pin("tPC", "tPinC", PZX, PZZ, TOPT, 0.38, 1.8);
// 旺矽：展示台在台灣海峽（左），高的方正廠房（三條窗帶、橘色屋頂帶）
const MPX = TX - 6.0, MPZ = -2.6;
LAY("tMpi", [5, 4, MPX, 2]);
BOX("tMpiDeck", "tMpi", MPX - 2.4, MPX + 2.6, TOPT - 0.2, TOPT, MPZ - 1.7, MPZ + 2.1, "band");
plant("mp", "tMpi", MPX, MPZ, 3.0, 1.8, 2.3, "roofMPI", TOPT, { sign: "sign-p2mpi", signW: 2.4, flag: "flag-TW", winRows: [0.3, 0.55, 0.8], flagW: 0.75 });
dots("tLeadM", "tMpi", [MPX + 2.7, MPZ - 0.6], [HCX - 0.4, HCZ + 0.1], TOPT + 0.05, 7);
// 精測：展示台在東北外海（右），寬而低的廠房＋直條外牆鰭片、青綠屋頂帶
const CHX = TX + 6.0, CHZ = -3.6;
LAY("tChpt", [6, 4, CHX, 2]);
BOX("tChDeck", "tChpt", CHX - 2.9, CHX + 2.7, TOPT - 0.2, TOPT, CHZ - 1.6, CHZ + 2.1, "band");
plant("ch", "tChpt", CHX, CHZ, 3.8, 1.7, 1.6, "roofCH", TOPT, { sign: "sign-p2chpt", signW: 3.0, flag: "flag-TW", winRows: [0.62], flagW: 0.75, poleH: 2.4 });
P({ id: "chFin", layer: "tChpt", shape: "box", size: [0.07, 1.3, 0.16], pos: [R2(CHX - 1.75), R2(TOPT + 0.75), R2(CHZ + 0.93)], at: Array.from({ length: 11 }, (_, i) => [R2(i * 0.35), 0, 0]), mat: "panel2" });
dots("tLeadC", "tChpt", [CHX - 3.0, CHZ - 0.4], [PZX + 0.4, PZZ + 0.05], TOPT + 0.05, 7);

// ═════ 站 M：探針頭剖面（s3）＝空間轉換器＋上下導板＋一排 11 根針；針長有高低差（像圖釘），晶圓焊墊在下方 ═════
const MX = 120, MZ = 1.2, NM = 11, MP = 1.15, MX0 = MX - ((NM - 1) * MP) / 2;
const DH = [0.06, 0.22, 0.02, 0.32, 0.08, 0.0, 0.26, 0.06, 0.36, 0.03, 0.18];   // 針尖比基準高多少（正＝針短、離焊墊遠）
const PADT = 2.4, OFF0 = 1.3, OVR = 0.4;                                      // 焊墊頂面；起始抬高；超壓量（全部碰到並彎曲）
const MY_TIP = PADT + OFF0, MY_LG0 = MY_TIP + 0.9, MY_LG1 = MY_LG0 + 0.25, MY_UG0 = MY_LG1 + 2.3, MY_UG1 = MY_UG0 + 0.25, MY_ST0 = MY_UG1 + 0.55;
LAY("mPlinth", [16, 1, MX, 0.5], true);
BOX("mPl", "mPlinth", MX - 7.8, MX + 7.8, 0, 0.9, -2.6, 2.6, "band"); BOX("mPlTop", "mPlinth", MX - 7.8, MX + 7.8, 0.9, 1.0, -2.6, 2.6, "panel2");
P({ id: "mPlScrew", layer: "mPlinth", shape: "cyl", size: [0.07, 0.04], rot: V, pos: [0, 1.02, 0], at: [[MX - 7.3, 0, -2.2], [MX + 7.3, 0, -2.2], [MX - 7.3, 0, 2.2], [MX + 7.3, 0, 2.2]], mat: "steel" });
LAY("mWafer", [14, 1.5, MX, 1.8]);
BOX("mWf", "mWafer", MX - 7.2, MX + 7.2, 1.0, 2.1, -MZ, MZ, "wafer");
P({ id: "mWfLine", layer: "mWafer", shape: "box", size: [14.4, 0.02, 0.02], pos: [MX, 0, MZ + 0.01], at: [1.35, 1.7, 1.95].map((y) => [0, y, 0]), mat: "waferE" });
P({ id: "mPad", layer: "mWafer", shape: "box", size: [0.8, R2(PADT - 2.1), R2(2 * MZ - 0.4)], pos: [0, R2((PADT + 2.1) / 2), 0], at: Array.from({ length: NM }, (_, i) => [R2(MX0 + i * MP), 0, 0]), mat: "padAl" });
const headM = ["mSt", "mUg", "mLg", "mNs", "mNb"];
LAY("mSt", [14, 1, MX, MY_ST0 + 0.4]);
BOX("mStB", "mSt", MX - 7.0, MX + 7.0, MY_ST0, MY_ST0 + 0.8, -MZ, MZ, "ceram");
P({ id: "mStLine", layer: "mSt", shape: "box", size: [14.0, 0.02, 0.02], pos: [MX, 0, MZ + 0.01], at: [0.2, 0.4, 0.6].map((d) => [0, R2(MY_ST0 + d), 0]), mat: "seam" });
P({ id: "mStPad", layer: "mSt", shape: "box", size: [0.5, 0.06, 1.0], pos: [0, R2(MY_ST0 - 0.03), 0], at: Array.from({ length: NM }, (_, i) => [R2(MX0 + i * MP + 0.15), 0, 0]), mat: "gold" });
BOX("mStTop", "mSt", MX - 7.0, MX + 7.0, MY_ST0 + 0.8, MY_ST0 + 1.0, -MZ - 0.1, MZ + 0.1, "pcb");
LAY("mUg", [14, 0.4, MX, MY_UG0]); BOX("mUgB", "mUg", MX - 6.8, MX + 6.8, MY_UG0, MY_UG1, -MZ, MZ, "gp");
LAY("mLg", [14, 0.4, MX, MY_LG0]); BOX("mLgB", "mLg", MX - 6.8, MX + 6.8, MY_LG0, MY_LG1, -MZ, MZ, "gp");
P({ id: "mPost", layer: "mUg", shape: "box", size: [0.4, R2(MY_UG0 - MY_LG1), 0.6], pos: [0, R2((MY_LG1 + MY_UG0) / 2), 0], at: [[MX - 6.6, 0, 0], [MX + 6.6, 0, 0]], mat: "steel" });
// 直針（尚未超壓）：針尾在空間轉換器焊墊、中段微彎、針尖高度各不同
const mNeedle = (pre, lay, bow, dyTip) => {
  for (let i = 0; i < NM; i++) {
    const x = R2(MX0 + i * MP), tip = R2(MY_TIP + DH[i] + dyTip(i)), b = bow(i), top = MY_ST0;
    const y1 = MY_LG1, y2 = MY_UG0;            // 彎弧段在兩片導板之間
    P({ id: `${pre}Lo${i}`, layer: lay, shape: "cyl", size: [0.09, R2(y1 + 0.05 - tip - 0.25)], rot: V, pos: [x, R2((tip + 0.25 + y1 + 0.05) / 2), 0], mat: "needle" });
    P({ id: `${pre}Tip${i}`, layer: lay, shape: "cone", size: [0.015, 0.09, 0.25], rot: V, pos: [x, R2(tip + 0.125), 0], mat: "tip" });
    // 彎弧段：10 小段＋每個接點一顆同半徑小球（接成一整根連續的弧，不會像斷成幾截）；彎的方向全部一致（同一側）
    const segs = 10, jt = []; for (let k = 0; k < segs; k++) { const ya = y1 + ((y2 - y1) * k) / segs, yb = y1 + ((y2 - y1) * (k + 1)) / segs, xa = x + b * Math.sin((Math.PI * k) / segs), xb = x + b * Math.sin((Math.PI * (k + 1)) / segs);
      const t = Math.atan2(xb - xa, yb - ya) / D2R; P({ id: `${pre}Bw${i}_${k}`, layer: lay, shape: "box", size: [0.16, R2(Math.hypot(xb - xa, yb - ya) + 0.04), 0.16], rot: [0, 0, R2(-t)], pos: [R2((xa + xb) / 2), R2((ya + yb) / 2), 0], mat: "needle" }); /* 只繞 z 轉（單軸，不受尤拉角順序影響） */ jt.push([R2(xa), R2(ya), 0]); }
    jt.push([x, y2, 0]); P({ id: `${pre}Jt${i}`, layer: lay, shape: "sphere", size: [0.09], pos: [0, 0, 0], at: jt, mat: "needle" });
    P({ id: `${pre}Hi${i}`, layer: lay, shape: "cyl", size: [0.09, R2(top - y2 + 0.02)], rot: V, pos: [x, R2((y2 + top) / 2), 0], mat: "needle" });
  }
};
LAY("mNs", [13, 5, MX, MY_TIP + 2]); mNeedle("mNs", "mNs", () => 0.12, () => 0);
// 超壓後（整個頭再往下 OVR）：每根針尖都頂在焊墊上，針越長彎得越多（針尖位置在頭座標裡＝焊墊＋頭總下移量）
LAY("mNb", [13, 5, MX, MY_TIP + 2]); mNeedle("mNb", "mNb", (i) => R2(0.12 + 1.2 * (OVR - DH[i])), (i) => R2(OVR - DH[i])); // 針尖全部回到基準高度（被焊墊頂住）
// 接觸指示：第一次下壓後碰到的（綠點）、沒碰到的（紅色縫隙條）、超壓後全部碰到（綠點）
LAY("mC1", [13, 0.4, MX, PADT]); LAY("mGap", [13, 0.6, MX, PADT + 0.2]); LAY("mC2", [13, 0.4, MX, PADT]);
const touch1 = DH.map((d, i) => [d <= 0.08, i]);
P({ id: "mC1Dot", layer: "mC1", shape: "sphere", size: [0.13], pos: [0, PADT + 0.03, MZ - 0.3], at: touch1.filter(([t]) => t).map(([, i]) => [R2(MX0 + i * MP), 0, 0]), mat: "ok" });
touch1.filter(([t]) => !t).forEach(([, i]) => BOX(`mGapB${i}`, "mGap", MX0 + i * MP - 0.22, MX0 + i * MP + 0.22, PADT + 0.02, PADT + Math.max(0.06, DH[i]) - 0.01, MZ - 0.32, MZ - 0.26, "bad"));
P({ id: "mC2Dot", layer: "mC2", shape: "sphere", size: [0.13], pos: [0, PADT + 0.03, MZ - 0.3], at: DH.map((_, i) => [R2(MX0 + i * MP), 0, 0]), mat: "ok" });
// 雷射掃描線（量針尖高度，示意）
LAY("mLaser", [0.3, 2, MX - 6, MY_TIP]);
BOX("mLzLine", "mLaser", MX - 6.4, MX - 6.34, MY_TIP - 0.1, MY_TIP + 0.55, -MZ - 0.2, MZ + 0.2, "laser"); BOX("mLzHead", "mLaser", MX - 6.75, MX - 5.99, MY_TIP - 0.9, MY_TIP - 0.45, -0.5, 0.5, "dark");
// 針尖高度標記（掃描後出現：黃色高度差括號＋各針尖的小色點）
LAY("mHmap", [13, 0.6, MX, MY_TIP]);
P({ id: "mHmDot", layer: "mHmap", shape: "sphere", size: [0.1], pos: [0, 0, MZ - 0.25], at: DH.map((d, i) => [R2(MX0 + i * MP), R2(MY_TIP + d - 0.02), 0]), mat: "heightY" });
BOX("mHmBase", "mHmap", MX0 - 0.5, MX0 + (NM - 1) * MP + 0.5, MY_TIP - 0.012, MY_TIP + 0.012, MZ - 0.26, MZ - 0.24, "heightY");

// ═════ 站 W：單根針放大（s6）＝下導板剖面＋一根垂直針；針尖：新（尖）→ 用久（變鈍、變短、沾汙）→ 清針後（乾淨但較短）；清針片與換針鑷子 ═════
const WX = 150, WZ = 0, WTIP = 2.17;
LAY("wBase", [12, 1, WX, 0.5], true);
BOX("wPl", "wBase", WX - 5.5, WX + 5.5, 0, 0.9, -2.6, 2.6, "band"); BOX("wPlTop", "wBase", WX - 5.5, WX + 5.5, 0.9, 1.0, -2.6, 2.6, "panel2");
LAY("wPadL", [6, 1, WX, 1.5]);
BOX("wWf", "wPadL", WX - 3.2, WX + 3.2, 1.0, 1.9, -1.8, 1.8, "wafer"); BOX("wPadAl", "wPadL", WX - 1.4, WX + 1.4, 1.9, 2.05, -1.2, 1.2, "padAl");
P({ id: "wScrub", layer: "wPadL", shape: "box", size: [0.9, 0.012, 0.05], pos: [WX, 2.056, 0], at: [[-0.2, 0, -0.35], [0.1, 0, 0.0], [0.25, 0, 0.32], [-0.35, 0, 0.6]], mat: "dark" });
LAY("wGuide", [8, 0.6, WX, 6.4]);
BOX("wGpL", "wGuide", WX - 3.6, WX - 0.42, 6.2, 6.7, -1.6, 1.6, "gp"); BOX("wGpR", "wGuide", WX + 0.42, WX + 3.6, 6.2, 6.7, -1.6, 1.6, "gp");
BOX("wGpB", "wGuide", WX - 0.42, WX + 0.42, 6.2, 6.7, -1.6, -0.42, "gp"); BOX("wGpF", "wGuide", WX - 0.42, WX + 0.42, 6.2, 6.7, 0.42, 1.6, "gp");
BOX("wGpEdge", "wGuide", WX - 3.6, WX + 3.6, 6.68, 6.72, 1.58, 1.62, "steel2");
// 針身（共用）＋三種針尖狀態（各一層）
const wNeedleBody = (pre, lay, y0) => { VC(`${pre}Body`, lay, 0.3, y0, 8.8, "needle", { x: WX, z: WZ }); VT(`${pre}Ring`, lay, 0.34, 0.29, 7.6, 7.75, "gold", { x: WX, z: WZ }); };
LAY("wNdl", [1, 8, WX, 6]); wNeedleBody("wN", "wNdl", R2(WTIP + 0.93));
LAY("wTipNew", [1, 1.2, WX, 3.0]); P({ id: "wTipNewC", layer: "wTipNew", shape: "cone", size: [0.03, 0.3, 0.95], rot: V, pos: [WX, R2(WTIP + 0.475), WZ], mat: "tip" });
LAY("wTipWorn", [1, 1.2, WX, 3.2]); P({ id: "wTipWornC", layer: "wTipWorn", shape: "cone", size: [0.17, 0.3, 0.62], rot: V, pos: [WX, R2(WTIP + 0.33 + 0.31), WZ], mat: "needle" });
VC("wTipWornF", "wTipWorn", 0.17, WTIP + 0.31, WTIP + 0.34, "dark", { x: WX, z: WZ });
LAY("wDep", [1, 0.6, WX, 3.0]); P({ id: "wDepB", layer: "wDep", shape: "sphere", size: [0.045], pos: [WX, 0, WZ], at: RING(9, 0.19, 10).map(([x, , z], i) => [x, R2(WTIP + 0.36 + (i % 3) * 0.07), z]).concat([[0, WTIP + 0.3, 0], [0.08, WTIP + 0.3, 0.06]]), mat: "dep" });
VT("wDepRing", "wDep", 0.21, 0.16, WTIP + 0.33, WTIP + 0.43, "dep", { x: WX, z: WZ });
LAY("wTipClean", [1, 1.2, WX, 3.2]); P({ id: "wTipCleanC", layer: "wTipClean", shape: "cone", size: [0.11, 0.3, 0.68], rot: V, pos: [WX, R2(WTIP + 0.27 + 0.34), WZ], mat: "tip" });
// 新針（換針後從上方落下），與舊針同形
LAY("wNew", [1, 8, WX, 6]); wNeedleBody("wNw", "wNew", R2(WTIP + 0.93)); P({ id: "wNewTip", layer: "wNew", shape: "cone", size: [0.03, 0.3, 0.95], rot: V, pos: [WX, R2(WTIP + 0.475), WZ], mat: "tip" });
// 清針片（研磨片：灰色基材＋表面細砂）從右側滑進針尖下方
const SHX = WX;     // 建在最後位置（針尖正下方），進場前由 shift 推到右側
LAY("wSheet", [5, 0.6, SHX, 2.2]);
BOX("wShBase", "wSheet", SHX - 2.4, SHX + 2.4, 1.0, 1.95, -1.6, 1.6, "dark"); BOX("wSh", "wSheet", SHX - 2.2, SHX + 2.2, 1.95, 2.35, -1.4, 1.4, "sheet");
P({ id: "wShGrit", layer: "wSheet", shape: "sphere", size: [0.05], pos: [0, 2.37, 0], at: Array.from({ length: 70 }, () => [R2(SHX - 2.1 + rnd() * 4.2), 0, R2(-1.3 + rnd() * 2.6)]), mat: "grit" });
BOX("wShTab", "wSheet", SHX + 1.6, SHX + 2.2, 2.35, 2.37, -1.3, -0.6, "warnY");
// 換針鑷子（兩片尖頭，從右上方伸進來夾住針身）
LAY("wTwz", [3, 4, WX + 1.5, 8]);
// 鑷子尖端夾在針身（y≈7.3，下導板上方），由右邊水平伸進來
P({ id: "wTwA", layer: "wTwz", shape: "box", size: [2.8, 0.14, 0.12], pos: [R2(WX + 1.65), 7.55, 0.34], rot: [0, 0, 12], mat: "steel2" });
P({ id: "wTwB", layer: "wTwz", shape: "box", size: [2.8, 0.14, 0.12], pos: [R2(WX + 1.65), 7.55, -0.34], rot: [0, 0, 12], mat: "steel2" });
P({ id: "wTwGrip", layer: "wTwz", shape: "box", size: [0.8, 0.3, 0.86], pos: [R2(WX + 2.75), 7.8, 0], rot: [0, 0, 12], mat: "rubber" });
P({ id: "wTwTip", layer: "wTwz", shape: "box", size: [0.12, 0.2, 0.1], pos: [R2(WX + 0.32), 7.28, 0], at: [[0, 0, 0.3], [0, 0, -0.3]], mat: "dark" });

// 第二把鑷子（夾著新針放進導板孔）
LAY("wTwz2", [3, 2, WX + 1.5, 7.6]);
P({ id: "wTw2A", layer: "wTwz2", shape: "box", size: [2.8, 0.14, 0.12], pos: [R2(WX + 1.65), 7.55, 0.34], rot: [0, 0, 12], mat: "steel2" });
P({ id: "wTw2B", layer: "wTwz2", shape: "box", size: [2.8, 0.14, 0.12], pos: [R2(WX + 1.65), 7.55, -0.34], rot: [0, 0, 12], mat: "steel2" });
P({ id: "wTw2Grip", layer: "wTwz2", shape: "box", size: [0.8, 0.3, 0.86], pos: [R2(WX + 2.75), 7.8, 0], rot: [0, 0, 12], mat: "rubber" });
P({ id: "wTw2Tip", layer: "wTwz2", shape: "box", size: [0.12, 0.2, 0.1], pos: [R2(WX + 0.32), 7.28, 0], at: [[0, 0, 0.3], [0, 0, -0.3]], mat: "dark" });
// ═════ 站 D：下一系列預告＝貼在藍色膠膜、金屬環框上的測完晶圓＋切割刀（不轉到切割，只預告）═════
const DX = 178;
LAY("dBase", [12, 1, DX, 0.5], true); BOX("dPl", "dBase", DX - 5.8, DX + 5.8, 0, 0.9, -5.6, 5.6, "band"); BOX("dPlTop", "dBase", DX - 5.8, DX + 5.8, 0.9, 1.0, -5.6, 5.6, "panel2");
P({ id: "dPlScrew", layer: "dBase", shape: "cyl", size: [0.07, 0.04], rot: V, pos: [0, 1.02, 0], at: [[DX - 5.4, 0, -5.2], [DX + 5.4, 0, -5.2], [DX - 5.4, 0, 5.2], [DX + 5.4, 0, 5.2]], mat: "steel" });
LAY("dFrame", [10, 0.4, DX, 1.2]);
VT("dRing", "dFrame", 4.8, 3.95, 1.0, 1.14, "frame", { x: DX }); BOX("dFlatL", "dFrame", DX - 4.9, DX - 4.4, 1.0, 1.14, -1.2, 1.2, "frame"); BOX("dFlatR", "dFrame", DX + 4.4, DX + 4.9, 1.0, 1.14, -1.2, 1.2, "frame");
P({ id: "dNotch", layer: "dFrame", shape: "box", size: [0.5, 0.15, 0.3], pos: [DX, 1.07, -4.55], at: [[-0.8, 0, 0], [0.8, 0, 0]], mat: "dark" });
VC("dTape", "dFrame", 4.15, 1.0, 1.06, "tape", { x: DX });
VC("dWf", "dFrame", 3.0, 1.06, 1.12, "wafer", { x: DX }); VT("dWfE", "dFrame", 3.02, 2.92, 1.06, 1.122, "waferE", { x: DX });
P({ id: "dDie", layer: "dFrame", shape: "box", size: [0.36, 0.012, 0.36], pos: [DX, 1.124, 0], at: dies.map(([x, z]) => [x, 0, z]), mat: "ok" });
BOX("dLabel", "dFrame", DX + 3.1, DX + 3.9, 1.14, 1.16, 2.0, 2.9, "label");
LAY("dBlade", [3, 4, DX + 1.5, 3.6]);
P({ id: "dBl", layer: "dBlade", shape: "cyl", size: [1.25, 0.035], pos: [DX + 1.35, 2.75, 0], mat: "blade" });
P({ id: "dBlHub", layer: "dBlade", shape: "cyl", size: [0.55, 0.26], pos: [DX + 1.35, 2.75, 0], mat: "steel" });
P({ id: "dBlMark", layer: "dBlade", shape: "box", size: [0.12, 0.7, 0.05], pos: [DX + 1.35, 3.15, 0.04], mat: "mark" });
BOX("dSpindle", "dBlade", DX + 0.85, DX + 1.85, 2.8, 4.9, -0.75, -0.2, "panel"); BOX("dSpCap", "dBlade", DX + 0.75, DX + 1.95, 4.9, 5.2, -0.85, -0.1, "dark");
P({ id: "dCover", layer: "dBlade", shape: "box", size: [2.9, 0.7, 0.2], pos: [DX + 1.35, 3.85, 0.22], mat: "panel2" });
PIPE("dNoz", "dBlade", [[DX - 0.3, 4.5, 0.3], [DX - 0.3, 3.0, 0.3], [DX + 0.2, 2.6, 0.3]], 0.07, "steel2");
SPH("dLed", "dBlade", 0.08, DX + 1.35, 4.6, -0.08, "lampG");

// ═════ 動作 ═════
const cardIds = CARD.flatMap(idsOf);
actions.flip = { type: "rotate", _說明: "探針卡翻面（爆炸第 1 步）：抬離卡座後繞卡片中心的水平軸轉 180 度，露出針面；轉到就停住", parts: cardIds, axis: [1, 0, 0], pivot: [0, YC, 0], angle: 180, hold: true };
actions.flipBack = { type: "rotate", _說明: "組回後翻回針面朝下，放回卡座（爆炸第 8 步）", parts: cardIds, axis: [1, 0, 0], pivot: [0, YC, 0], angle: -180, hold: true };
actions.touch = { type: "vibrate", _說明: "載台把晶圓頂上去讓針尖接觸、再放下，換下一顆晶粒（探針台測試動作，示意）", parts: [...idsOf("chuck"), ...idsOf("wafer"), ...DROWS.flatMap((_, k) => idsOf(`dieOk${k}`))], axis: [0, 1, 0], amp: 0.05, freq: 0.9 };
actions.testLed = { type: "pulse", parts: ["prLed"], color: "lampG", glow: 1, freq: 1.8, halo: 0 };
actions.cardSpin = { type: "rotate", _說明: "翻面後的卡片慢慢轉一點角度，讓針面看得清楚（不整圈）", parts: cardIds, axis: [0, 1, 0], pivot: [0, 0, 0], swing: 10, freq: 0.12 };
actions.hmapGlow = { type: "pulse", parts: ["hmLo", "hmHi"], color: "badC", glow: 0.7, freq: 1.2, halo: 0 };
actions.lzScan = { type: "vibrate", _說明: "雷射線掃過針尖（量高度）", parts: idsOf("laser"), axis: [1, 0, 0], amp: 1.2, freq: 0.32 };
actions.mLzScan = { type: "vibrate", parts: idsOf("mLaser"), axis: [1, 0, 0], amp: 0, freq: 0.3 };
actions.mOk1 = { type: "pulse", parts: ["mC1Dot"], color: "okC", glow: 1, freq: 1.4, halo: 0 };
actions.mGapP = { type: "pulse", parts: idsOf("mGap"), color: "badC", glow: 1, freq: 1.6, halo: 0 };
actions.mOk2 = { type: "pulse", parts: ["mC2Dot"], color: "okC", glow: 1, freq: 1.4, halo: 0 };
actions.wScrubAct = { type: "vibrate", _說明: "針尖每次接觸都在焊墊上滑一小段（刮擦），久了就磨鈍", parts: [...idsOf("wNdl"), ...idsOf("wTipNew"), ...idsOf("wTipWorn"), ...idsOf("wDep")], axis: [1, 0, 0], amp: 0.12, freq: 1.6 };
actions.wTouch = { type: "vibrate", parts: [...idsOf("wNdl"), ...idsOf("wTipNew"), ...idsOf("wTipWorn"), ...idsOf("wDep")], axis: [0, 1, 0], amp: 0.12, freq: 1.6 };
actions.wPolish = { type: "vibrate", _說明: "清針：針尖在研磨片上來回磨", parts: [...idsOf("wNdl"), ...idsOf("wTipWorn"), ...idsOf("wDep"), ...idsOf("wTipClean")], axis: [1, 0, 0], amp: 0.22, freq: 2.2 };
actions.wDust = { type: "flow", _說明: "磨下來的汙垢粉末從針尖兩側被甩出、受重力落下（拋物線）", layer: "wSheet", path: [[WX + 0.2, 2.5, 0.4], [WX + 1.0, 3.2, 0.8], [WX + 1.9, 2.45, 1.1]], n: 7, size: 0.09, shape: "dot", rate: 0.9, color: "depC", track: false, free: true, accel: true, jitter: 0.25 };
actions.wDust2 = { type: "flow", layer: "wSheet", path: [[WX - 0.2, 2.5, 0.3], [WX - 1.0, 3.1, 0.6], [WX - 1.8, 2.45, 0.9]], n: 6, size: 0.08, shape: "dot", rate: 0.85, color: "depC", track: false, free: true, accel: true, jitter: 0.25 };
actions.wContact = { type: "pulse", parts: ["wScrub"], color: "depC", glow: 0.4, freq: 1.6, halo: 0 };
actions.bladeSpin = { type: "rotate", _說明: "切割刀起轉（預告，不下刀）", parts: ["dBl", "dBlHub", "dBlMark"], axis: [0, 0, 1], pivot: [DX + 1.35, 2.75, 0], rps: 1.6, rampSpin: true };
actions.ffPin = { type: "pulse", parts: ["fPRing", "fPHead"], color: "pinR", glow: 1, freq: 1.4, halo: 0.5 };
actions.mpiPin = { type: "pulse", parts: ["tPMRing", "tPMHead"], color: "pinR", glow: 1, freq: 1.4, halo: 0.5 };
actions.chPin = { type: "pulse", parts: ["tPCRing", "tPCHead"], color: "pinR", glow: 1, freq: 1.4, halo: 0.5 };

// ═════ 標註點（翻面後的零件用翻面後的座標；抬升與爆炸位移由層的位移加上）═════
Object.assign(anchors, {
  card: A("pcb", [3.6, Y_PCB1, 2.6], 150, -100), needleFace: A("nd", [0.6, flipY(Y_TIP), -0.6], 150, -100),
  lgp: A("lgp", [1.1, flipY(Y_LG0), -0.9], 150, -90), row: A("ndRow", [-0.6, flipY(Y_TIP), -N0], -150, -100), st: A("st", [1.2, flipY(Y_ST0), 1.1], 150, -90),
  hmap: A("hmap", [0.3, flipY(Y_TIP), -0.3], -150, -100), probe2: A("chuck", [2.6, 2.3, 2.0], 150, 100),
  ffFab: A("fFab", [FFX - 1.4, TOPF + 1.4, FFZ + 0.95], -150, -100), mpiFab: A("tMpi", [MPX + 1.0, TOPT + 1.8, MPZ + 0.9], 150, -100), chFab: A("tChpt", [CHX + 1.2, TOPT + 1.2, CHZ + 0.85], 150, -100),
  mGap: A("mGap", [MX0 + 3 * MP, PADT + 0.1, MZ], 150, 110), mNeedle: A("mNs", [MX0 + 8 * MP, MY_TIP + 1.6, MZ], 150, -100), mPad: A("mWafer", [MX0 + 1 * MP, PADT, MZ], -150, 100),
  wTip: A("wTipNew", [WX + 0.2, WTIP + 0.4, 0.2], 150, -60), wSheetA: A("wSheet", [SHX - 0.8, 2.36, 1.2], 150, 100), wNewA: A("wNew", [WX + 0.3, 6.0, 0.3], 150, -80),
  dFrameA: A("dFrame", [DX - 3.9, 1.14, 1.8], -150, 100), dBladeA: A("dBlade", [DX + 1.35, 2.0, 0.1], 150, -80),
});

const model = {
  name: "示意 探針卡（垂直式）與探針台、三家探針卡廠（地圖＋廠房）、探針頭剖面（針長高度差與超壓彎曲）、單針磨耗與清針換針、下一系列貼膜環框晶圓（示意，非特定廠牌／型號）",
  unit: "示意（1＝約 1 cm；地圖另有示意比例）",
  size: { w: 40, h: 18, r: 0.6, t: 30 },
  palette, materials,
  partNames: { pcb: "電路板", st: "空間轉換器", lgp: "下導板", ugp: "上導板", nd: "探針" },
  layers, parts, anchors, actions,
  pose: { yaw0: 0, yawIso: 0, drift: 0 },
  camera: { stand: { d: 40, elev: 30, y: 3 } },
  fx: { dpr: 1, srcPx: 30, shadows: 0, fog: false, dust: false, vaporSprites: false, shimmer: false },
  info: { YC, LIFT, Y_TIP, Y_PCB1, FX, LVX, LVZ, FFX, FFZ, TX, HCX, HCZ, PZX, PZZ, MPX, MPZ, CHX, CHZ, MX, MX0, MP, DH, PADT, OFF0, OVR, MY_TIP, WX, WTIP, SHX, DX, CARD, DROWS: DROWS.length },
};
fs.writeFileSync(path.join(HERE, "model.json"), JSON.stringify(model, null, 1) + "\n");
console.log(`✔ model.json：${parts.length} 個零件、${parts.reduce((a, p) => a + Math.max(1, p.at?.length ?? 0), 0)} 個實體、${layers.length} 層`);

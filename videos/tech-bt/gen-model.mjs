// node videos/tech-bt/gen-model.mjs → 寫 videos/tech-bt/model.json
// 2026/11/28 tech-bt（BT 載板與 T-glass 缺料，系列 3 第 9 集）。構造與物理照 physics-spec.md；來源 research.md。寫法照 tech-abfsub/gen-model.mjs。
// 單位：1＝1 cm（示意），地板頂面 y＝0。剖面站另外放大，畫面標「示意，非實際比例」。站點：
//   A 手機記憶體封裝（x 0）｜B 含浸生產線（x 60：玻纖布捲→樹脂槽→擠壓輥→烘乾→裁片疊銅箔→熱壓）｜C 鋼筋混凝土對照剖面（x 120）
//   D BT／ABF 對照剖面（x 180）｜E 受熱翹曲（x 240：晶片＋載板＋錫球，加熱板）｜F 一般布 vs 低膨脹布（x 300）
//   G 搶料（x 360：布捲被大店拉走，小店空架）｜H 織布機與出貨棧板（x 420）｜I 台灣 BT 載板廠出貨（x 480）｜J 下一集玻璃基板（x 540）
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
const HERE = path.dirname(new URL(import.meta.url).pathname);

const R2 = (x) => Math.round(x * 1000) / 1000;
const D2R = Math.PI / 180;
const pol = (aDeg, r) => [R2(r * Math.cos(aDeg * D2R)), R2(r * Math.sin(aDeg * D2R))]; // (x, z)
let seed = 20261128;
const rnd = () => { seed |= 0; seed = (seed + 0x6d2b79f5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
const palette = {
  floorC: "#C9D2DE", panel: "#F3F5F8", panel2: "#E2E8F0", seam: "#8E9BB0", band: "#24324C", steel: "#7D8CA6", steel2: "#A9B5C7", dark: "#3E4A60",
  glassC: "#BFD3F2", lampY: "#F2B632", lampG: "#2FBF71", lampR: "#E5484D", screen: "#5B8DEF", rubber: "#2B2F36", gold: "#C9A24A", estop: "#D93A2B",
  siC: "#5E6B82", siTopC: "#6F7FA0", streetC: "#A8B6CC", kerfC: "#1C2333", circC: "#2F4E86", padC: "#D9B44A", tapeC: "#7FB6E8", bgTapeC: "#EAF2FA",
  ceramicC: "#F4F1EA", bladeC: "#6B7385", hubC: "#C3CBD8", diaC: "#E8F8FF", diaE: "#BFEFFF", waterC: "#9ED8F5", chipC: "#55607A", crackC: "#E5484D",
  laserC: "#E0473A", modC: "#B23A2E", siGlassC: "#7C8AA8", copperC: "#C77B3C", linerC: "#E9D9B8", bumpC: "#B9C2CF", subC: "#3F7A55", subPadC: "#E2B84A",
  okC: "#14A38B", badC: "#E5484D", frameC: "#9AA7BB", cartonC: "#C9A66B", cartonD: "#A9884F", whiteP: "#FFFFFF", markC: "#E8613C", warnY: "#F2B632", wireC: "#E7B341",
  wheelC: "#8C97AB", segC: "#D8DEE8", toothC: "#9099A8", sawC: "#B7BFCB", edgeC: "#F4FAFF",
};
const M = (kind, color, o = {}) => ({ kind, color, ...o });
const glowM = (c, op, ei = 1) => M("std", c, { emissive: c, ei, opacity: op, rough: 1, metal: 0 });
const materials = {
  floor: M("std", "floorC", { rough: 0.7, metal: 0.3, tex: "brushed", texScale: 6 }),
  panel: M("std", "panel", { rough: 0.55, metal: 0.05, env: 0.25 }), panel2: M("std", "panel2", { rough: 0.6, metal: 0.05, env: 0.2 }),
  seam: M("std", "seam", { rough: 0.6, metal: 0.3 }), band: M("std", "band", { rough: 0.4, metal: 0.3, env: 0.4 }),
  steel: M("std", "steel", { rough: 0.35, metal: 0.85, env: 0.5 }), steel2: M("std", "steel2", { rough: 0.3, metal: 0.8, env: 0.6, tex: "brushed", texScale: 3 }),
  dark: M("std", "dark", { rough: 0.5, metal: 0.4, env: 0.3 }), rubber: M("std", "rubber", { rough: 0.9, metal: 0 }), gold: M("std", "gold", { rough: 0.3, metal: 0.9, env: 0.8 }),
  window: M("phys", "glassC", { rough: 0.05, metal: 0, clearcoat: 1, opacity: 0.3, env: 0.6 }),
  lampY: M("std", "lampY", { emissive: "lampY", ei: 0.4, rough: 0.4, metal: 0 }), lampG: M("std", "lampG", { emissive: "lampG", ei: 0.35, rough: 0.4, metal: 0 }),
  lampR: M("std", "lampR", { emissive: "lampR", ei: 0.3, rough: 0.4, metal: 0 }), estop: M("std", "estop", { rough: 0.4, metal: 0, emissive: "estop", ei: 0.15 }),
  screen: M("std", "screen", { emissive: "screen", ei: 0.5, rough: 0.3, metal: 0 }),
  si: M("std", "siC", { rough: 0.3, metal: 0.55, env: 0.7 }), siTop: M("std", "siTopC", { rough: 0.25, metal: 0.5, env: 0.8, tex: "traces", texScale: 2.2 }),
  street: M("std", "streetC", { rough: 0.4, metal: 0.4, env: 0.5 }), kerf: M("std", "kerfC", { rough: 0.9, metal: 0.1 }),
  circ: M("std", "circC", { rough: 0.4, metal: 0.3, env: 0.5, tex: "traces", texScale: 1.2 }), pad: M("std", "padC", { rough: 0.3, metal: 0.9, env: 0.8 }),
  tape: M("phys", "tapeC", { rough: 0.2, metal: 0, clearcoat: 0.6, opacity: 0.72, env: 0.4 }), bgTape: M("std", "bgTapeC", { rough: 0.6, metal: 0, env: 0.2 }),
  ceramic: M("std", "ceramicC", { rough: 0.9, metal: 0, tex: "wick", texScale: 0.8, bump: 0.3 }),
  blade: M("std", "bladeC", { rough: 0.35, metal: 0.85, env: 0.6 }), hub: M("std", "hubC", { rough: 0.3, metal: 0.8, env: 0.6, tex: "brushed", texScale: 1 }),
  dia: M("std", "diaC", { rough: 0.05, metal: 0.2, env: 1.3, emissive: "diaE", ei: 0.45 }),
  waterDot: glowM("waterC", 0.9, 0.4), chipDot: glowM("chipC", 0.95, 0.05), chip: M("std", "chipC", { rough: 0.6, metal: 0.4 }),
  crack: M("std", "crackC", { emissive: "crackC", ei: 0.6, rough: 0.5, metal: 0 }),
  laser: M("std", "laserC", { emissive: "laserC", ei: 1, opacity: 0.42, rough: 1, metal: 0 }), laserCore: glowM("laserC", 0.95, 1.2),
  mod: M("std", "modC", { emissive: "laserC", ei: 0.9, rough: 0.6, metal: 0 }),
  siGlass: M("phys", "siGlassC", { rough: 0.2, metal: 0.2, clearcoat: 0.6, opacity: 0.5, env: 0.6 }),
  copper: M("std", "copperC", { rough: 0.25, metal: 0.9, env: 0.8 }), liner: M("std", "linerC", { rough: 0.5, metal: 0.1 }), bump: M("std", "bumpC", { rough: 0.3, metal: 0.9, env: 0.7 }),
  sub: M("std", "subC", { rough: 0.5, metal: 0.1, tex: "traces", texScale: 2 }), subPad: M("std", "subPadC", { rough: 0.3, metal: 0.9, env: 0.8 }),
  ok: M("std", "okC", { emissive: "okC", ei: 0.35, rough: 0.5, metal: 0 }), bad: M("std", "badC", { emissive: "badC", ei: 0.45, rough: 0.5, metal: 0 }),
  frame: M("std", "frameC", { rough: 0.3, metal: 0.85, env: 0.6, tex: "brushed", texScale: 2 }),
  carton: M("std", "cartonC", { rough: 0.95, metal: 0 }), cartonD: M("std", "cartonD", { rough: 0.95, metal: 0 }), white: M("std", "whiteP", { rough: 0.7, metal: 0 }),
  mark: M("std", "markC", { rough: 0.5, metal: 0, emissive: "markC", ei: 0.25 }), warnY: M("std", "warnY", { rough: 0.5, metal: 0, emissive: "warnY", ei: 0.2 }),
  wire: M("std", "wireC", { rough: 0.3, metal: 0.9, env: 0.8, emissive: "wireC", ei: 0.2 }),
  wheel: M("std", "wheelC", { rough: 0.35, metal: 0.8, env: 0.6, tex: "brushed", texScale: 2 }), seg: M("std", "segC", { rough: 0.6, metal: 0.3, env: 0.8, emissive: "diaE", ei: 0.15 }),
  tooth: M("std", "toothC", { rough: 0.4, metal: 0.8, env: 0.5 }), saw: M("std", "sawC", { rough: 0.35, metal: 0.85, env: 0.6, tex: "brushed", texScale: 3 }),
  edge: glowM("edgeC", 0.95, 0.5), okGlow: glowM("okC", 0.9, 0.8), badGlow: glowM("badC", 0.9, 0.8), wireDot: glowM("wireC", 0.95, 0.9),
};
const parts = [], layers = [], anchors = {}, actions = {};
const P = (o) => { parts.push(o); return o; };
const LAY = (id, outline, bg) => layers.push({ id, z: 0, k: 0, outline, ...(bg ? { bg: true } : {}) });
const V = [90, 0, 0], HX = [0, 90, 0];
const BOX = (id, layer, x0, x1, y0, y1, z0, z1, mat, o = {}) => P({ id, layer, shape: "box", size: [R2(x1 - x0), R2(y1 - y0), R2(z1 - z0)], pos: [R2((x0 + x1) / 2), R2((y0 + y1) / 2), R2((z0 + z1) / 2)], mat, ...o });
const VC = (id, layer, R, y0, y1, mat, o = {}) => { const { x = 0, z = 0, ...r } = o; return P({ id, layer, shape: "cyl", size: [R, R2(y1 - y0)], rot: V, pos: [x, R2((y0 + y1) / 2), z], mat, ...r }); };
const VT = (id, layer, Ro, Ri, y0, y1, mat, o = {}) => { const { x = 0, z = 0, ...r } = o; return P({ id, layer, shape: "tube", size: [Ro, Ri, R2(y1 - y0)], rot: V, pos: [x, R2((y0 + y1) / 2), z], mat, ...r }); };
const HXC = (id, layer, R, x0, x1, y, z, mat, o = {}) => P({ id, layer, shape: "cyl", size: [R, R2(Math.abs(x1 - x0))], rot: HX, pos: [R2((x0 + x1) / 2), y, z], mat, ...o });
const ZC = (id, layer, R, z0, z1, x, y, mat, o = {}) => P({ id, layer, shape: "cyl", size: [R, R2(Math.abs(z1 - z0))], pos: [x, y, R2((z0 + z1) / 2)], mat, ...o });
const ZT = (id, layer, Ro, Ri, z0, z1, x, y, mat, o = {}) => P({ id, layer, shape: "tube", size: [Ro, Ri, R2(Math.abs(z1 - z0))], pos: [x, y, R2((z0 + z1) / 2)], mat, ...o });
const RING = (n, r, a0 = 0, cx = 0, cz = 0) => Array.from({ length: n }, (_, i) => { const [x, z] = pol(a0 + (i * 360) / n, r); return [R2(x + cx), 0, R2(z + cz)]; });
const SPH = (id, layer, r, x, y, z, mat, o = {}) => P({ id, layer, shape: "sphere", size: [r], pos: [x, y, z], mat, ...o });
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
const chord = (r, z) => 2 * Math.sqrt(Math.max(0, r * r - z * z));

Object.assign(palette, { subTopC: "#3E5C8A", pcbC: "#2F6B4A", pcbTraceC: "#C9A24A", coreC: "#E8D9B0", fiberC: "#CDBB88", abfC: "#9CCFB0", srC: "#2E5A44", resinC: "#E9C46A", cuBrightC: "#D9894A", hotC2: "#F28A3C" });
Object.assign(materials, {
  subTop: M("std", "subTopC", { rough: 0.45, metal: 0.05, env: 0.3 }), badSolid: M("std", "badC", { emissive: "badC", ei: 0.6, rough: 0.5, metal: 0 }), hotSolid: M("std", "hotC2", { emissive: "hotC2", ei: 0.35, rough: 0.6, metal: 0 }), voidM: M("std", "kerfC", { rough: 1, metal: 0 }),
  pcb: M("std", "pcbC", { rough: 0.6, metal: 0.1, tex: "traces", texScale: 3 }), pcbTrace: M("std", "pcbTraceC", { rough: 0.3, metal: 0.9, env: 0.7 }),
  core: M("std", "coreC", { rough: 0.8, metal: 0, env: 0.15 }), fiber: M("std", "fiberC", { rough: 0.9, metal: 0 }),
  abf: M("phys", "abfC", { rough: 0.35, metal: 0, clearcoat: 0.6, opacity: 0.82, env: 0.4 }), sr: M("std", "srC", { rough: 0.5, metal: 0.05, env: 0.3 }),
  resin: M("std", "resinC", { rough: 0.5, metal: 0, env: 0.2 }), cuBright: M("std", "cuBrightC", { rough: 0.22, metal: 0.95, env: 0.9, emissive: "cuBrightC", ei: 0.15 }),
  hot: M("std", "hotC2", { emissive: "hotC2", ei: 0.7, rough: 0.5, metal: 0, opacity: 0.55 }),
});

const GXZ = (nx, nz, sx, sz) => { const o = []; for (let j = 0; j < nz; j++) for (let i = 0; i < nx; i++) o.push([R2((i - (nx - 1) / 2) * sx), 0, R2((j - (nz - 1) / 2) * sz)]); return o; };
Object.assign(palette, { clothC: "#F1EEE4", clothD: "#D9D2BE", tglassC: "#DCEBFA", tglassD: "#9FC3E8", prepregC: "#E3B65A", resinLiqC: "#D9A23A", concreteC: "#B9B7B0", rebarC: "#6E5A4A", glassCoreC: "#BFE3F0", moldC: "#2B313C", heaterC: "#E5484D", phoneC: "#2A3142", screenC2: "#5B8DEF", boardBlueC: "#3E5C8A" });
Object.assign(materials, {
  cloth: M("std", "clothC", { rough: 0.85, metal: 0, env: 0.15 }), clothD: M("std", "clothD", { rough: 0.9, metal: 0 }),
  tglass: M("std", "tglassC", { rough: 0.6, metal: 0.05, env: 0.3 }), tglassD: M("std", "tglassD", { rough: 0.7, metal: 0.05, env: 0.2 }),
  prepreg: M("std", "prepregC", { rough: 0.55, metal: 0, env: 0.2 }), resinLiq: M("phys", "resinLiqC", { rough: 0.15, metal: 0, clearcoat: 0.8, opacity: 0.78, env: 0.5 }),
  resinClear: M("phys", "resinC", { rough: 0.2, metal: 0, clearcoat: 0.6, opacity: 0.55, env: 0.4 }),
  concrete: M("std", "concreteC", { rough: 0.95, metal: 0, tex: "wick", texScale: 1.2, bump: 0.2 }), rebar: M("std", "rebarC", { rough: 0.6, metal: 0.6, env: 0.3 }),
  glassCore: M("phys", "glassCoreC", { rough: 0.05, metal: 0, clearcoat: 1, opacity: 0.55, env: 0.9 }),
  mold: M("phys", "moldC", { rough: 0.4, metal: 0, clearcoat: 0.3, opacity: 0.45, env: 0.3 }), heater: M("std", "heaterC", { emissive: "heaterC", ei: 0.15, rough: 0.5, metal: 0.2 }),
  phone: M("std", "phoneC", { rough: 0.35, metal: 0.4, env: 0.5 }), phoneScreen: M("std", "screenC2", { emissive: "screenC2", ei: 0.35, rough: 0.2, metal: 0 }),
  boardBlue: M("std", "boardBlueC", { rough: 0.55, metal: 0.05, tex: "traces", texScale: 2.5 }),
});
const RZ = (x0, y0, x1, y1) => Math.atan2(y1 - y0, x1 - x0) / D2R;
// 斜放的長條（繞 z 轉）：從 (x0,y0) 到 (x1,y1)，厚 t，z 從 z0 到 z1
const SEG = (id, layer, x0, y0, x1, y1, t, z0, z1, mat, o = {}) => P({ id, layer, shape: "box", size: [R2(Math.hypot(x1 - x0, y1 - y0)), t, R2(z1 - z0)], pos: [R2((x0 + x1) / 2), R2((y0 + y1) / 2), R2((z0 + z1) / 2)], rot: [0, 0, R2(RZ(x0, y0, x1, y1))], mat, ...o });
// 布的編織紋（平面）：經紗沿 x、緯紗沿 z，上下交錯
const WEAVE = (pre, layer, x0, x1, y, z0, z1, mat, matD, step = 0.5, w = 0.32) => {
  const nz = Math.floor((z1 - z0) / step), nx = Math.floor((x1 - x0) / step);
  P({ id: `${pre}Wp`, layer, shape: "box", size: [R2(x1 - x0), 0.03, w], pos: [R2((x0 + x1) / 2), R2(y), 0], at: Array.from({ length: nz }, (_, j) => [0, 0, R2(z0 + step / 2 + j * step)]), mat });
  P({ id: `${pre}Wf`, layer, shape: "box", size: [w, 0.032, R2(z1 - z0)], pos: [0, R2(y + 0.004), R2((z0 + z1) / 2)], at: Array.from({ length: nx }, (_, i) => [R2(x0 + step / 2 + i * step), 0, 0]), mat: matD });
};

// ═════ 地板 ═════
LAY("floor", [620, 2, 270, 0], true);
P({ id: "floor", layer: "floor", shape: "slab", size: [640, 0.5, 60], r: 0.2, pos: [270, -0.25, 0], mat: "floor" });
P({ id: "floorSeam", layer: "floor", shape: "slab", size: [640, 0.04, 0.12], pos: [270, 0.01, 0], at: Array.from({ length: 7 }, (_, i) => [0, 0, -24 + i * 8]), mat: "seam" });

// ═════ 站 A：手機主機板上的記憶體封裝（x 0）：BT 載板（側面看得到玻纖層）、錫球、疊晶片、金線、半透明封膠 ═════
const AX = 0;
LAY("aPcb", [16, 0.6, AX, 0.3]); BOX("apBoard", "aPcb", AX - 8, AX + 8, 0.42, 0.58, -5.5, 5.5, "pcb");
P({ id: "apFoot", layer: "aPcb", shape: "cyl", size: [0.3, 0.42], rot: V, pos: [AX, 0.21, 0], at: [[-7.4, 0, -4.9], [7.4, 0, -4.9], [-7.4, 0, 4.9], [7.4, 0, 4.9]], mat: "steel" });
P({ id: "apPad", layer: "aPcb", shape: "cyl", size: [0.13, 0.02], rot: V, pos: [AX, 0.59, 0], at: GXZ(9, 7, 0.8, 0.8), mat: "pcbTrace" });
for (let i = 0; i < 7; i++) BOX(`apTr${i}`, "aPcb", AX + 4.4, AX + 7.6, 0.58, 0.592, -3 + i * 1.0, -2.92 + i * 1.0, "pcbTrace");
P({ id: "apCap", layer: "aPcb", shape: "box", size: [0.5, 0.3, 0.8], pos: [AX, 0.73, 0], at: [[-6, 0, 3.8], [-5.2, 0, 3.8], [-6, 0, -3.8], [6, 0, -4], [6.8, 0, -4]], mat: "dark" });
P({ id: "apIc", layer: "aPcb", shape: "box", size: [2.2, 0.3, 2.2], pos: [AX - 5.6, 0.73, 0], mat: "chip" });
LAY("aSub", [8, 0.6, AX, 1.05]);
{ const ys = [0.9, 0.95, 1.0, 1.06, 1.12, 1.17, 1.22]; const mats = ["sr", "copper", "prepreg", "core", "prepreg", "copper"];
  for (let k = 0; k < mats.length; k++) BOX(`asL${k}`, "aSub", AX - 4, AX + 4, ys[k], ys[k + 1], -3, 3, mats[k]); }
BOX("asSr", "aSub", AX - 4, AX + 4, 1.22, 1.26, -3, 3, "sr");
for (let k = 0; k < 3; k++) BOX(`asFib${k}`, "aSub", AX - 4, AX + 4, R2(1.015 + k * 0.07), R2(1.035 + k * 0.07), 3.0, 3.02, "fiber");
P({ id: "asBall", layer: "aSub", shape: "sphere", size: [0.16], pos: [AX, 0.74, 0], at: GXZ(9, 7, 0.8, 0.8), mat: "bump" });
P({ id: "asPad", layer: "aSub", shape: "box", size: [0.3, 0.04, 0.3], pos: [AX, 1.28, 2.4], at: [-2.4, -1.6, -0.8, 0, 0.8, 1.6, 2.4].map((x) => [x, 0, 0]), mat: "gold" });
LAY("aDie", [5, 0.6, AX, 1.5]); BOX("adD1", "aDie", AX - 2.6, AX + 2.6, 1.26, 1.46, -1.8, 1.8, "si"); BOX("adD2", "aDie", AX - 2.2, AX + 2.2, 1.46, 1.66, -1.5, 1.5, "siTop");
LAY("aMold", [8, 1.2, AX, 1.8]); BOX("amCap", "aMold", AX - 3.9, AX + 3.9, 1.26, 2.5, -2.9, 2.9, "mold");
LAY("aWire", [6, 1, AX, 2]);
[-2.4, -1.6, -0.8, 0, 0.8, 1.6, 2.4].forEach((x, i) => { const a = [x * 0.8, 1.66, 1.4], c = [x * 0.9, 2.3, 2.0], b = [x, 1.3, 2.4];
  const pts = Array.from({ length: 16 }, (_, k) => { const t = k / 15, u = 1 - t; return [0, 1, 2].map((d) => R2(u * u * a[d] + 2 * u * t * c[d] + t * t * b[d])); });
  P({ id: `aW${i}`, layer: "aWire", shape: "sphere", size: [0.05], pos: [AX, 0, 0], at: pts, mat: "wire" }); });
LAY("aGlow", [4, 0.2, AX, 1.67]); BOX("agGlow", "aGlow", AX - 2.0, AX + 2.0, 1.66, 1.68, -1.3, 1.3, "okGlow");

// ═════ 站 B：含浸生產線（x 60）：玻纖布捲 → 導輥 → 樹脂槽（浸輥） → 擠壓輥（刮掉多的樹脂） → 烘乾爐（半硬化＝預浸材） → 裁片；
//        熱壓台：下銅箔、兩張預浸材、上銅箔依序疊上，上壓板壓下＝銅箔基板（BT 核心板）。布從左往右走（z 寬 6）═════
const BX = 60, BZ = 3, RY = 6.4, RR = 1.5;
LAY("bFrame", [30, 8, BX, 4], true);
BOX("bfBase", "bFrame", BX - 13, BX + 17, 0, 0.3, -4.4, 4.4, "steel2");
P({ id: "bfPost", layer: "bFrame", shape: "box", size: [0.5, 7.4, 0.5], pos: [BX, 3.7, 0], at: [[-11, 0, -3.8], [-11, 0, 3.8], [-2, 0, -3.8], [-2, 0, 3.8], [3.6, 0, -3.8], [3.6, 0, 3.8]], mat: "dark" });
// 布捲（自轉）
LAY("bRoll", [3, 3, BX - 11, RY]);
ZC("brCore", "bRoll", 0.4, -BZ - 0.6, BZ + 0.6, BX - 11, RY, "steel"); ZC("brCloth", "bRoll", RR, -BZ, BZ, BX - 11, RY, "cloth");
for (let k = 0; k < 6; k++) { const [x, y] = pol(k * 60, RR * 0.75); BOX(`brMk${k}`, "bRoll", R2(BX - 11 + x - 0.09), R2(BX - 11 + x + 0.09), R2(RY + y - 0.09), R2(RY + y + 0.09), BZ, BZ + 0.03, "clothD"); }
ZT("brRim", "bRoll", RR + 0.02, RR - 0.25, BZ, BZ + 0.05, BX - 11, RY, "clothD");
// 導輥、浸輥、擠壓輥
const ROL = [["bGuide", BX - 7, 6.9, 0.45], ["bDip", BX - 4.5, 1.6, 0.45], ["bSqA", BX - 2, 6.5, 0.4], ["bSqB", BX - 2, 7.35, 0.4]];
for (const [id, x, y, r] of ROL) { LAY(id, [1, 1, x, y]); ZC(`${id}C`, id, r, -BZ - 0.3, BZ + 0.3, x, y, "steel2"); ZC(`${id}Ax`, id, 0.12, -BZ - 0.7, BZ + 0.7, x, y, "dark"); BOX(`${id}Mk`, id, x - 0.06, x + 0.06, y + r - 0.12, y + r, BZ + 0.3, BZ + 0.33, "mark"); }
// 樹脂槽（半剖：前壁透明）
LAY("bTank", [6, 3.6, BX - 4.5, 1.8]);
BOX("btFloor", "bTank", BX - 7.6, BX - 1.4, 0.3, 0.5, -BZ - 0.4, BZ + 0.4, "steel"); BOX("btWallL", "bTank", BX - 7.6, BX - 7.3, 0.5, 3.6, -BZ - 0.4, BZ + 0.4, "steel"); BOX("btWallR", "bTank", BX - 1.7, BX - 1.4, 0.5, 3.6, -BZ - 0.4, BZ + 0.4, "steel");
BOX("btBack", "bTank", BX - 7.6, BX - 1.4, 0.5, 3.6, -BZ - 0.4, -BZ - 0.2, "steel"); BOX("btFront", "bTank", BX - 7.6, BX - 1.4, 0.5, 3.6, BZ + 0.2, BZ + 0.4, "window");
BOX("btLiquid", "bTank", BX - 7.3, BX - 1.7, 0.5, 2.9, -BZ - 0.2, BZ + 0.2, "resinLiq");
// 布的路徑：布捲底 → 導輥頂 → 浸輥底 → 擠壓輥間 → 烘乾爐 → 裁刀（每一段一片薄板；浸過樹脂以後換成琥珀色）
const PATH = [[BX - 11, RY - RR], [BX - 7, 6.9 + 0.45], [BX - 4.5 + 0.0, 1.6 - 0.45], [BX - 2, 6.92], [BX + 8, 6.92]];
LAY("bWeb", [20, 6, BX - 2, 4]);
SEG("bwS0", "bWeb", PATH[0][0], PATH[0][1], PATH[1][0], PATH[1][1], 0.05, -BZ, BZ, "cloth");
SEG("bwS1", "bWeb", PATH[1][0], PATH[1][1], PATH[2][0] - 0.3, PATH[2][1], 0.05, -BZ, BZ, "cloth");
SEG("bwS2", "bWeb", PATH[2][0] + 0.3, PATH[2][1], PATH[3][0], PATH[3][1], 0.05, -BZ, BZ, "prepreg");
SEG("bwS3", "bWeb", PATH[3][0], PATH[3][1], PATH[4][0], PATH[4][1], 0.05, -BZ, BZ, "prepreg");
// 烘乾爐（半透明窗，裡面紅色加熱管）
LAY("bOven", [8, 2.4, BX + 3.6, 6.9]);
BOX("boTop", "bOven", BX + 0.4, BX + 6.8, 7.9, 8.3, -BZ - 0.5, BZ + 0.5, "panel"); BOX("boBot", "bOven", BX + 0.4, BX + 6.8, 5.5, 5.9, -BZ - 0.5, BZ + 0.5, "panel");
BOX("boBack", "bOven", BX + 0.4, BX + 6.8, 5.9, 7.9, -BZ - 0.5, -BZ - 0.3, "panel2"); BOX("boWin", "bOven", BX + 0.4, BX + 6.8, 5.9, 7.9, BZ + 0.3, BZ + 0.5, "window");
P({ id: "boHeat", layer: "bOven", shape: "cyl", size: [0.08, 6.0], pos: [BX + 3.6, 0, 0], rot: HX, at: [[0, 7.6, -1.5], [0, 7.6, 1.5], [0, 6.2, -1.5], [0, 6.2, 1.5]], mat: "heater" });
BOX("boBand", "bOven", BX + 0.4, BX + 6.8, 8.3, 8.4, BZ + 0.3, BZ + 0.5, "warnY");
// 熱壓台（x BX+12）：下壓板、四片疊料（下銅箔、預浸材×2、上銅箔）、上壓板（紅色加熱帶）
const PX0 = BX + 12, PW = 3.4, PY0 = 1.8, CUT = 0.08, PPT = 0.22;
LAY("bPress", [8, 9, PX0, 4.5], true);
BOX("bpBed", "bPress", PX0 - 3.2, PX0 + 3.2, 0.3, PY0, -BZ - 0.4, BZ + 0.4, "dark");
P({ id: "bpCol", layer: "bPress", shape: "cyl", size: [0.28, 7.4], rot: V, pos: [PX0, 4.0, 0], at: [[-2.8, 0, -BZ], [2.8, 0, -BZ], [-2.8, 0, BZ], [2.8, 0, BZ]], mat: "steel2" });
BOX("bpCrown", "bPress", PX0 - 3.3, PX0 + 3.3, 7.7, 8.4, -BZ - 0.4, BZ + 0.4, "dark"); VC("bpCyl", "bPress", 0.75, 8.4, 12.4, "band", { x: PX0 }); VT("bpCylRing", "bPress", 0.8, 0.7, 11.6, 11.9, "steel", { x: PX0 }); VT("bpGland", "bPress", 0.55, 0.38, 7.5, 7.7, "steel", { x: PX0 });
const SY = [PY0, R2(PY0 + CUT), R2(PY0 + CUT + PPT), R2(PY0 + CUT + 2 * PPT), R2(PY0 + 2 * CUT + 2 * PPT)];
LAY("bCuB", [PW * 2, CUT, PX0, SY[0]]); BOX("bcB", "bCuB", PX0 - PW, PX0 + PW, SY[0], SY[1], -BZ + 0.2, BZ - 0.2, "copper");
LAY("bPp0", [PW * 2, PPT, PX0, SY[1]]); BOX("bpp0", "bPp0", PX0 - PW, PX0 + PW, SY[1], SY[2], -BZ + 0.2, BZ - 0.2, "prepreg"); WEAVE("bpp0w", "bPp0", PX0 - PW, PX0 + PW, SY[2] + 0.002, -BZ + 0.2, BZ - 0.2, "clothD", "fiber", 0.6, 0.3);
LAY("bPp1", [PW * 2, PPT, PX0, SY[2]]); BOX("bpp1", "bPp1", PX0 - PW, PX0 + PW, SY[2], SY[3], -BZ + 0.2, BZ - 0.2, "prepreg"); WEAVE("bpp1w", "bPp1", PX0 - PW, PX0 + PW, SY[3] + 0.002, -BZ + 0.2, BZ - 0.2, "clothD", "fiber", 0.6, 0.3);
LAY("bCuT", [PW * 2, CUT, PX0, SY[3]]); BOX("bcT", "bCuT", PX0 - PW, PX0 + PW, SY[3], SY[4], -BZ + 0.2, BZ - 0.2, "copper");
const PLY = SY[4] + 3.2;   // 上壓板平常停在疊料上方 3.2；壓下 3.2－0.04（壓緊後疊料薄一點看不出來，示意）
LAY("bPlaten", [7, 0.8, PX0, PLY + 0.4]); BOX("bplP", "bPlaten", PX0 - 3.0, PX0 + 3.0, PLY, PLY + 0.7, -BZ - 0.2, BZ + 0.2, "steel"); BOX("bplH", "bPlaten", PX0 - 3.0, PX0 + 3.0, PLY + 0.7, PLY + 0.9, -BZ - 0.2, BZ + 0.2, "heater");
VC("bplRod", "bPlaten", 0.32, PLY + 0.9, 12.0, "steel2", { x: PX0 });   // 活塞桿：平常大部分收在油壓缸裡，壓下 3.2 後上端仍在缸內

// ═════ 站 C：鋼筋混凝土 vs 玻纖布＋樹脂（x 120）：左邊一小塊混凝土（鋼筋剖面），右邊核心板剖面爆炸分解：上銅箔／預浸材（布＋樹脂）×2／下銅箔 ═════
const CX = 120, CW = 12, CD = 6, CY0 = 2.0, CCU = 0.14, CPL = 1.1;
LAY("cStand", [24, 2, CX, 1], true); BOX("csTop", "cStand", CX - 12, CX + 10, 1.6, CY0, -CD / 2 - 0.5, CD / 2 + 0.5, "panel2"); BOX("csLeg", "cStand", CX - 11.5, CX + 9.5, 0, 1.6, -CD / 2, CD / 2, "steel2");
LAY("cRc", [5, 3, CX - 9, CY0 + 1.5]); BOX("crBlock", "cRc", CX - 11.4, CX - 6.6, CY0, CY0 + 3.0, -2.2, 2.2, "concrete");
P({ id: "crBar", layer: "cRc", shape: "cyl", size: [0.24, 4.42], pos: [0, 0, 0], at: [[-10.4, 0.7, 0], [-9, 0.7, 0], [-7.6, 0.7, 0], [-10.4, 2.3, 0], [-9, 2.3, 0], [-7.6, 2.3, 0]].map(([x, y]) => [R2(CX + x), R2(CY0 + y), 0]), mat: "rebar" });
P({ id: "crRib", layer: "cRc", shape: "tube", size: [0.27, 0.22, 0.06], pos: [0, 0, 0], at: [[-10.4, 0.7], [-9, 0.7], [-7.6, 0.7], [-10.4, 2.3], [-9, 2.3], [-7.6, 2.3]].flatMap(([x, y]) => [-1.6, -0.8, 0, 0.8, 1.6].map((z) => [R2(CX + x), R2(CY0 + y), z])), mat: "rebar" });
const C0 = CX + 3;   // 核心板中心
const cuY = [CY0, R2(CY0 + CCU)];
LAY("cCuB", [CW, CCU, C0, CY0]); BOX("ccB", "cCuB", C0 - CW / 2, C0 + CW / 2, cuY[0], cuY[1], -CD / 2, CD / 2, "copper");
for (let p = 0; p < 2; p++) { const y0 = R2(CY0 + CCU + p * CPL), y1 = R2(y0 + CPL), lay = `cPly${p}`;
  LAY(lay, [CW, CPL, C0, (y0 + y1) / 2]); BOX(`cpR${p}`, lay, C0 - CW / 2, C0 + CW / 2, y0, y1, -CD / 2, CD / 2, "resinClear");
  // 經紗（沿 x，前後幾排）＋緯紗（沿 z，剖面上是一顆顆橢圓，上下交錯＝編織）
  P({ id: `cpWarp${p}`, layer: lay, shape: "cyl", size: [0.13, CW - 0.1], rot: HX, pos: [C0, R2((y0 + y1) / 2), 0], at: [-2.2, -1.1, 0, 1.1, 2.2].map((z) => [0, 0, z]), mat: "fiber" });
  P({ id: `cpWeft${p}`, layer: lay, shape: "cyl", size: [0.2, CD - 0.1], pos: [0, 0, 0], at: Array.from({ length: 11 }, (_, i) => [R2(C0 - 5 + i), R2((y0 + y1) / 2 + (i % 2 ? 0.22 : -0.22)), 0]), mat: "cloth" }); }
LAY("cCuT", [CW, CCU, C0, CY0 + CCU + 2 * CPL]); BOX("ccT", "cCuT", C0 - CW / 2, C0 + CW / 2, R2(CY0 + CCU + 2 * CPL), R2(CY0 + 2 * CCU + 2 * CPL), -CD / 2, CD / 2, "copper");

// ═════ 站 D：BT 載板 vs 味之素膜（ABF）載板剖面（x 180）：BT＝每一層都有布、線粗；ABF＝中間核心有布，外面的膜沒布、線細 ═════
const DX = 180, DW = 9, DD = 4, DY0 = 1.6;
LAY("dStand", [26, 1.6, DX, 0.8], true); BOX("dsTop", "dStand", DX - 13, DX + 13, 1.3, DY0, -DD / 2 - 0.6, DD / 2 + 0.6, "panel2"); BOX("dsLeg", "dStand", DX - 12.5, DX + 12.5, 0, 1.3, -DD / 2, DD / 2, "steel2");
const DL = DX - 6.2, DR = DX + 6.2;    // 左 BT、右 ABF 的中心
// BT：三層「布＋樹脂」，層間銅（粗線、間距大）
LAY("dBt", [DW, 2.4, DL, DY0 + 1.2]);
for (let k = 0; k < 3; k++) { const y0 = R2(DY0 + 0.1 + k * 0.72); BOX(`dbP${k}`, "dBt", DL - DW / 2, DL + DW / 2, y0, R2(y0 + 0.62), -DD / 2, DD / 2, "prepreg");
  P({ id: `dbF${k}`, layer: "dBt", shape: "cyl", size: [0.11, DD - 0.1], pos: [0, 0, 0], at: Array.from({ length: 15 }, (_, i) => [R2(DL - 4.2 + i * 0.6), R2(y0 + 0.31 + (i % 2 ? 0.1 : -0.1)), 0]), mat: "cloth" }); }
for (let k = 0; k < 4; k++) P({ id: `dbCu${k}`, layer: "dBt", shape: "box", size: [0.9, 0.1, DD], pos: [0, R2(DY0 + 0.05 + k * 0.72), 0], at: [-3.4, -1.6, 0.2, 2.0, 3.8].map((x) => [R2(DL + x - 0.2 * (k % 2)), 0, 0]), mat: "copper" });
LAY("dBtDie", [3, 0.5, DL, DY0 + 2.5]); BOX("dbtDie", "dBtDie", DL - 1.5, DL + 1.5, R2(DY0 + 2.32), R2(DY0 + 2.62), -1.2, 1.2, "siTop");
// ABF：中間核心（有布）、上下各 3 層膜（淡綠、沒布），細線多
LAY("dAbf", [DW, 2.6, DR, DY0 + 1.3]);
const ACY0 = R2(DY0 + 0.1 + 3 * 0.26), ACY1 = R2(ACY0 + 0.7);
BOX("daCore", "dAbf", DR - DW / 2, DR + DW / 2, ACY0, ACY1, -DD / 2, DD / 2, "prepreg");
P({ id: "daCoreF", layer: "dAbf", shape: "cyl", size: [0.11, DD - 0.1], pos: [0, 0, 0], at: Array.from({ length: 15 }, (_, i) => [R2(DR - 4.2 + i * 0.6), R2((ACY0 + ACY1) / 2 + (i % 2 ? 0.1 : -0.1)), 0]), mat: "cloth" });
for (let k = 0; k < 3; k++) for (const sd of [-1, 1]) { const y0 = sd > 0 ? R2(ACY1 + k * 0.26) : R2(ACY0 - (k + 1) * 0.26); BOX(`daF${k}${sd > 0 ? "t" : "b"}`, "dAbf", DR - DW / 2, DR + DW / 2, y0, R2(y0 + 0.24), -DD / 2, DD / 2, "abf"); }
LAY("dAbfLine", [DW, 2.6, DR, DY0 + 1.3]);
for (let k = 0; k < 3; k++) for (const sd of [-1, 1]) { const y = sd > 0 ? R2(ACY1 + (k + 1) * 0.26 - 0.03) : R2(ACY0 - k * 0.26 - 0.24);
  P({ id: `daL${k}${sd > 0 ? "t" : "b"}`, layer: "dAbfLine", shape: "box", size: [0.2, 0.05, 0.08], pos: [0, y, R2(DD / 2 + 0.01)], at: Array.from({ length: 18 }, (_, i) => [R2(DR - 4.25 + i * 0.5 + (k % 2) * 0.25), 0, 0]), mat: "cuBright" }); }
LAY("dAbfDie", [7, 0.7, DR, DY0 + 2.9]); BOX("dadDie", "dAbfDie", DR - 2.2, DR + 2.2, R2(ACY1 + 0.8), R2(ACY1 + 1.1), -1.4, 1.4, "siTop");
P({ id: "dadHbm", layer: "dAbfDie", shape: "box", size: [0.8, 0.5, 0.9], pos: [DR, R2(ACY1 + 1.03), 0], at: [[-3.3, 0, -0.8], [3.3, 0, -0.8], [-3.3, 0, 0.8], [3.3, 0, 0.8]], mat: "si" });

// ═════ 站 E：受熱翹曲（x 240）：加熱板＋主機板焊墊（固定）、錫球、載板、晶片（同一塊組件，9 個階段：越來越長、越來越彎，兩端往上翹；示意，誇大）═════
const EX = 240, EL = 14, ET = 0.5, HY = 2.0, BRE = 0.24, EYB = R2(HY + 0.04 + 2 * BRE), ECL = 5, ECT = 0.36, EUN = 0.08;
LAY("eHeat", [20, 2, EX, 1], true); BOX("ehBase", "eHeat", EX - 10, EX + 10, 0, 1.6, -3.5, 3.5, "steel2"); BOX("ehPlate", "eHeat", EX - 9, EX + 9, 1.6, HY, -3.2, 3.2, "dark"); BOX("ehStripe", "eHeat", EX - 9, EX + 9, 1.7, 1.86, 3.2, 3.26, "heater");
LAY("eMb", [18, 0.1, EX, HY]); P({ id: "emPad", layer: "eMb", shape: "cyl", size: [0.2, 0.04], rot: V, pos: [EX, R2(HY + 0.02), 0], at: [-2, 0, 2].flatMap((z) => Array.from({ length: 13 }, (_, i) => [R2(-6 + i), 0, z])), mat: "pcbTrace" });
const ENS = 9, EE = 0.035, EH = 1.25;   // 最大伸長 3.5%、最大翹高 1.25（示意誇大）
const curve = (h, L) => (u) => h * (u / (L / 2)) ** 2;
const bentPts = (L, t, yOff, h, Lref) => { const n = 24, top = [], bot = []; const c = curve(h, Lref); for (let i = 0; i <= n; i++) { const u = -L / 2 + (L * i) / n; top.push([R2(u), R2(c(u) + yOff + t)]); bot.push([R2(u), R2(c(u) + yOff)]); } return [...bot, ...top.reverse()]; };
const mixC = (a, b, t) => "#" + [0, 2, 4].map((j) => Math.round(parseInt(a.slice(1 + j, 3 + j), 16) * (1 - t) + parseInt(b.slice(1 + j, 3 + j), 16) * t).toString(16).padStart(2, "0")).join("");
const warmMat = (pre, baseKey, n) => { for (let i = 0; i < n; i++) { const t = i / (n - 1); palette[`${pre}${i}C`] = mixC(palette[baseKey], palette.hotC2, t); materials[`${pre}${i}`] = M("std", `${pre}${i}C`, { emissive: `${pre}${i}C`, ei: R2(0.3 * t), rough: 0.6, metal: 0.05, tex: "traces", texScale: 3 }); } };
warmMat("eWarm", "pcbC", ENS);
const stageAssembly = (pre, cx, i, n, L0, eMax, hMax, mat, balls) => {
  const t = i / (n - 1), L = R2(L0 * (1 + eMax * t)), h = R2(hMax * t ** 1.2), c = curve(h, L);
  const lay = `${pre}${i}`; LAY(lay, [L, ET + h + 0.6, cx, EYB + h / 2]);
  P({ id: `${lay}Sub`, layer: lay, shape: "poly", pts: bentPts(L, ET, 0, h, L), size: [L, R2(ET + h), 6], pos: [cx, EYB, 0], mat });
  const cl = R2(ECL * (1 + eMax * 0.08 * t));   // 晶片幾乎不脹（示意：載板的十二分之一）
  P({ id: `${lay}Und`, layer: lay, shape: "poly", pts: bentPts(cl + 0.3, EUN, ET, h, L), size: [cl, EUN, 3.4], pos: [cx, EYB, 0], mat: "liner" });
  P({ id: `${lay}Die`, layer: lay, shape: "poly", pts: bentPts(cl, ECT, ET + EUN, h, L), size: [cl, ECT, 3.0], pos: [cx, EYB, 0], mat: "siTop" });
  if (balls) P({ id: `${lay}Ball`, layer: lay, shape: "sphere", size: [BRE], pos: [cx, 0, 0], at: [-2, 0, 2].flatMap((z) => Array.from({ length: 13 }, (_, j) => { const u = (-6 + j) * (1 + eMax * t); return [R2(u), R2(EYB + c(u) - BRE), z]; })), mat: "bump" });
  return { L, h, c };
};
const EST = Array.from({ length: ENS }, (_, i) => stageAssembly("eS", EX, i, ENS, EL, EE, EH, `eWarm${i}`, true));
// 熱膨脹箭頭（載板兩端長箭頭＝脹得多；晶片兩端短箭頭＝幾乎不脹）
const ARROW = (id, layer, x, y, z, dir, len, r, mat) => { HXC(`${id}S`, layer, r, x, R2(x + dir * len), y, z, mat); P({ id: `${id}H`, layer, shape: "cone", size: [0.001, r * 2.6, r * 5], rot: [0, dir > 0 ? 90 : -90, 0], pos: [R2(x + dir * (len + r * 2.5)), y, z], mat }); };
LAY("eArrS", [EL + 6, 1, EX, EYB + 0.25]); ARROW("eaSL", "eArrS", EX - EL / 2 - 0.4, R2(EYB + 0.25), 3.3, -1, 1.6, 0.2, "hotSolid"); ARROW("eaSR", "eArrS", EX + EL / 2 + 0.4, R2(EYB + 0.25), 3.3, 1, 1.6, 0.2, "hotSolid");
LAY("eArrC", [ECL + 2, 1, EX, EYB + 1.2]); ARROW("eaCL", "eArrC", EX - ECL / 2 - 0.2, R2(EYB + ET + 0.75), 1.6, -1, 0.15, 0.13, "screen"); ARROW("eaCR", "eArrC", EX + ECL / 2 + 0.2, R2(EYB + ET + 0.75), 1.6, 1, 0.15, 0.13, "screen");
// 兩端錫球離開焊墊（沒焊上）：紅圈
LAY("eOpen", [EL, 1, EX, HY + 0.5]); P({ id: "eoRing", layer: "eOpen", shape: "tube", size: [0.42, 0.34, 0.05], pos: [0, 0, 0], at: [-6, -5, 5, 6].map((u) => [R2(EX + u * (1 + EE)), R2(HY + 0.3), 2.3]), mat: "badGlow" });

// ═════ 站 F：一般玻璃布 vs 低膨脹玻璃布（x 300）：同一塊加熱板上兩組，左邊翹很多、右邊翹很少；前面各放一小塊布樣 ═════
const FX = 300, FL = 11, FNS = 7;
LAY("fHeat", [32, 2, FX, 1], true); BOX("fhBase", "fHeat", FX - 16, FX + 16, 0, 1.6, -3.5, 3.5, "steel2"); BOX("fhPlate", "fHeat", FX - 15, FX + 15, 1.6, HY, -3.2, 3.2, "dark"); BOX("fhStripe", "fHeat", FX - 15, FX + 15, 1.7, 1.86, 3.2, 3.26, "heater");
warmMat("fWarmA", "pcbC", FNS); warmMat("fWarmB", "boardBlueC", FNS);
for (let i = 0; i < FNS; i++) { stageAssembly("fA", FX - 7.5, i, FNS, FL, EE, 1.0, `fWarmA${i}`, true); stageAssembly("fB", FX + 7.5, i, FNS, FL, EE * 0.25, 0.22, `fWarmB${i}`, true); }
LAY("fSwA", [3, 0.1, FX - 7.5, HY + 0.05]); BOX("fswA", "fSwA", FX - 9, FX - 6, R2(HY + 0.01), R2(HY + 0.04), 3.6, 5.4, "cloth"); WEAVE("fswAw", "fSwA", FX - 9, FX - 6, R2(HY + 0.045), 3.6, 5.4, "clothD", "fiber", 0.3, 0.16);
LAY("fSwB", [3, 0.1, FX + 7.5, HY + 0.05]); BOX("fswB", "fSwB", FX + 6, FX + 9, R2(HY + 0.01), R2(HY + 0.04), 3.6, 5.4, "tglass"); WEAVE("fswBw", "fSwB", FX + 6, FX + 9, R2(HY + 0.045), 3.6, 5.4, "tglassD", "tglassD", 0.3, 0.16);
P({ id: "fhStep", layer: "fHeat", shape: "box", size: [30, 0.2, 2.2], pos: [FX, 1.9, 4.5], mat: "panel2" });

// ═════ 站 G：搶料（x 360）：左邊料架上一排低膨脹布捲；右後「人工智慧載板廠」（大棧板＋大片載板）、右前「BT 載板小店」（空架子） ═════
const GX = 360, GN = 6;
LAY("gRack", [8, 4, GX - 10, 2], true); BOX("grDeck", "gRack", GX - 14, GX - 6, 1.6, 1.8, -3, 3, "steel2"); P({ id: "grLeg", layer: "gRack", shape: "box", size: [0.3, 1.6, 0.3], pos: [GX - 10, 0.8, 0], at: [[-3.8, 0, -2.8], [3.8, 0, -2.8], [-3.8, 0, 2.8], [3.8, 0, 2.8]], mat: "dark" });
const GROLL = (i) => [R2(GX - 13.2 + i * 1.3), 2.45];
for (let i = 0; i < GN; i++) { const [x, y] = GROLL(i), ly = `gR${i}`; LAY(ly, [1.3, 1.3, x, y]);
  ZC(`${ly}C`, ly, 0.6, -2.4, 2.4, x, y, "tglass"); ZC(`${ly}A`, ly, 0.22, -2.6, 2.6, x, y, "steel"); ZT(`${ly}E`, ly, 0.62, 0.4, 2.4, 2.45, x, y, "tglassD"); }
LAY("gBig", [12, 3, GX + 6, 1], true); BOX("gbFloor", "gBig", GX - 1, GX + 13, 0, 0.4, -9, -2.5, "panel2"); BOX("gbPallet", "gBig", GX + 1, GX + 11, 0.4, 1.2, -8, -3.5, "cartonD");
P({ id: "gbPanel", layer: "gBig", shape: "box", size: [9.4, 0.12, 4.0], pos: [GX + 6, 0, -5.75], at: Array.from({ length: 6 }, (_, k) => [0, R2(1.26 + k * 0.14), 0]), mat: "pcb" });
BOX("gbSign", "gBig", GX + 1, GX + 11, 0.4, 0.42, -3.52, -3.48, "white");
LAY("gSmall", [6, 3, GX + 5, 1.5], true); BOX("gsDeck", "gSmall", GX + 2, GX + 8, 1.4, 1.6, 1.8, 4.6, "steel2"); P({ id: "gsLeg", layer: "gSmall", shape: "box", size: [0.25, 1.4, 0.25], pos: [GX + 5, 0.7, 3.2], at: [[-2.8, 0, -1.2], [2.8, 0, -1.2], [-2.8, 0, 1.2], [2.8, 0, 1.2]], mat: "dark" });
P({ id: "gsCradle", layer: "gSmall", shape: "box", size: [0.2, 0.5, 2.4], pos: [GX + 5, 1.85, 3.2], at: [[-2, 0, 0], [-1.2, 0, 0], [1.2, 0, 0], [2, 0, 0]], mat: "dark" });
LAY("gOut", [3, 3, GX + 5, 3.6]); P({ id: "goXa", layer: "gOut", shape: "box", size: [2.6, 0.32, 0.32], pos: [GX + 5, 3.4, 3.2], rot: [0, 0, 45], mat: "badSolid" }); P({ id: "goXb", layer: "gOut", shape: "box", size: [2.6, 0.32, 0.32], pos: [GX + 5, 3.4, 3.2], rot: [0, 0, -45], mat: "badSolid" });

// ═════ 站 H：織布機（x 420）：後面經紗軸、經紗、兩組綜框（上下交替＝開口）、筘（前後打緯）、劍桿（左右引緯）、前面捲布軸；右邊兩個棧板（日東紡、台玻的布捲） ═════
const HX2 = 420, HW = 8, HZ0 = -4, HZ1 = 3.2, HYW = 4.2;
LAY("hLoom", [12, 8, HX2 - 4, 4], true);
P({ id: "hlSide", layer: "hLoom", shape: "box", size: [0.5, 5.6, 8.4], pos: [0, 2.8, R2((HZ0 + HZ1) / 2)], at: [[HX2 - 4 - HW / 2 - 0.6, 0, 0], [HX2 - 4 + HW / 2 + 0.6, 0, 0]], mat: "band" });
BOX("hlTie", "hLoom", HX2 - 8.9, HX2 + 0.9, 0.2, 0.7, HZ0 - 0.2, HZ0 + 0.4, "band"); BOX("hlTie2", "hLoom", HX2 - 8.9, HX2 + 0.9, 0.2, 0.7, HZ1 - 0.4, HZ1 + 0.2, "band");
BOX("hlTop", "hLoom", HX2 - 8.9, HX2 + 0.9, 6.6, 7.0, -1.6, 0.0, "band"); BOX("hlPanel", "hLoom", HX2 + 0.9, HX2 + 2.0, 1.0, 4.6, 1.2, 2.8, "panel");
BOX("hlScreen", "hLoom", HX2 + 2.0, HX2 + 2.03, 3.0, 4.2, 1.5, 2.5, "screen"); P({ id: "hlLamp", layer: "hLoom", shape: "cyl", size: [0.16, 0.5], rot: V, pos: [HX2 + 1.45, 4.85, 2.0], mat: "lampG" });
LAY("hBeam", [8, 1.6, HX2 - 4, 3.2]); HXC("hbBeam", "hBeam", 0.9, HX2 - 4 - HW / 2, HX2 - 4 + HW / 2, 3.2, HZ0 + 0.6, "tglass"); HXC("hbAx", "hBeam", 0.25, HX2 - 4 - HW / 2 - 0.6, HX2 - 4 + HW / 2 + 0.6, 3.2, HZ0 + 0.6, "steel");
P({ id: "hbMk", layer: "hBeam", shape: "box", size: [HW, 0.1, 0.1], pos: [HX2 - 4, 4.1, R2(HZ0 + 0.6)], mat: "tglassD" });
LAY("hWarp", [HW, 1, HX2 - 4, HYW]);
P({ id: "hwYarn", layer: "hWarp", shape: "box", size: [0.05, 0.04, 5.4], pos: [0, HYW, -1.2], at: Array.from({ length: 31 }, (_, i) => [R2(HX2 - 4 - HW / 2 + 0.25 + i * 0.25), 0, 0]), mat: "tglassD" });
for (const [k, dy] of [[0, 0.35], [1, -0.35]]) { const ly = `hHeddle${k}`; LAY(ly, [HW, 2.6, HX2 - 4, HYW]);
  BOX(`${ly}T`, ly, HX2 - 4 - HW / 2 - 0.3, HX2 - 4 + HW / 2 + 0.3, R2(HYW + 1.0 + dy), R2(HYW + 1.2 + dy), R2(-1.0 + k * 0.5), R2(-0.8 + k * 0.5), "steel");
  BOX(`${ly}B`, ly, HX2 - 4 - HW / 2 - 0.3, HX2 - 4 + HW / 2 + 0.3, R2(HYW - 1.2 + dy), R2(HYW - 1.0 + dy), R2(-1.0 + k * 0.5), R2(-0.8 + k * 0.5), "steel");
  P({ id: `${ly}W`, layer: ly, shape: "box", size: [0.03, 2.0, 0.03], pos: [0, R2(HYW + dy), R2(-0.9 + k * 0.5)], at: Array.from({ length: 16 }, (_, i) => [R2(HX2 - 4 - HW / 2 + 0.25 + (2 * i + k) * 0.25), 0, 0]), mat: "steel2" }); }
LAY("hReed", [HW, 1.4, HX2 - 4, HYW]); BOX("hrBar", "hReed", HX2 - 4 - HW / 2 - 0.3, HX2 - 4 + HW / 2 + 0.3, R2(HYW - 0.8), R2(HYW - 0.6), 1.2, 1.5, "dark");
P({ id: "hrTooth", layer: "hReed", shape: "box", size: [0.03, 1.3, 0.12], pos: [0, R2(HYW + 0.05), 1.35], at: Array.from({ length: 32 }, (_, i) => [R2(HX2 - 4 - HW / 2 + 0.12 + i * 0.25), 0, 0]), mat: "steel2" });
BOX("hrTop", "hReed", HX2 - 4 - HW / 2 - 0.3, HX2 - 4 + HW / 2 + 0.3, R2(HYW + 0.7), R2(HYW + 0.9), 1.2, 1.5, "dark");
LAY("hRapier", [1.2, 0.3, HX2 - 4, HYW]); BOX("hrpHead", "hRapier", HX2 - 4.5, HX2 - 3.5, R2(HYW - 0.06), R2(HYW + 0.06), 1.7, 1.95, "gold"); BOX("hrpTape", "hRapier", HX2 - 8.6, HX2 - 4.5, R2(HYW - 0.04), R2(HYW + 0.04), 1.75, 1.9, "steel");
LAY("hCloth", [HW, 1, HX2 - 4, HYW]); BOX("hcSheet", "hCloth", HX2 - 4 - HW / 2, HX2 - 4 + HW / 2, R2(HYW - 0.02), R2(HYW + 0.02), 1.5, 2.6, "tglass");
WEAVE("hcW", "hCloth", HX2 - 4 - HW / 2, HX2 - 4 + HW / 2, R2(HYW + 0.025), 1.55, 2.55, "tglassD", "tglassD", 0.25, 0.1);
LAY("hTake", [8, 1.6, HX2 - 4, 3.0]); HXC("htRoll", "hTake", 0.75, HX2 - 4 - HW / 2, HX2 - 4 + HW / 2, 3.3, 2.9, "tglass"); HXC("htAx", "hTake", 0.22, HX2 - 4 - HW / 2 - 0.6, HX2 - 4 + HW / 2 + 0.6, 3.3, 2.9, "steel");
P({ id: "htMk", layer: "hTake", shape: "box", size: [HW, 0.1, 0.1], pos: [HX2 - 4, 4.05, 2.9], mat: "tglassD" });
// 出貨棧板：日東紡、台玻（文字貼紙＋國旗貼紙；不是商標）
const SIGNS = [["btnitto", "日東紡|Nittobo"], ["bttg", "台玻|1802"], ["btkin", "景碩|3189"], ["btnya", "南電|8046"], ["btuni", "欣興|3037"]];
{ const r = spawnSync("node", [path.join(HERE, "..", "..", "scripts", "three", "make-brand-tex.mjs"), "tech-bt", "flag:JP", "flag:TW", ...SIGNS.map(([id, t]) => `text:${id}=${t}`)], { encoding: "utf8" }); if (r.status !== 0) { console.error(r.stderr); process.exit(1); } }
SIGNS.forEach(([id]) => { materials[`t_${id}`] = { kind: "unlit", color: "#FFFFFF", img: `tex/brand/sign-${id}.png` }; });
for (const c of ["JP", "TW"]) materials[`flag_${c}`] = { kind: "unlit", color: "#FFFFFF", img: `tex/brand/flag-${c}.png` };
const PALLET = (ly, cx, sign, flags, nRoll) => { LAY(ly, [5.4, 4, cx, 2]);
  BOX(`${ly}Deck`, ly, cx - 2.7, cx + 2.7, 0.5, 0.9, -2.4, 2.4, "cartonD"); P({ id: `${ly}Foot`, layer: ly, shape: "box", size: [0.8, 0.5, 4.6], pos: [cx, 0.25, 0], at: [[-2.2, 0, 0], [0, 0, 0], [2.2, 0, 0]], mat: "dark" });
  for (let i = 0; i < nRoll; i++) { const x = R2(cx - 1.6 + (i % 3) * 1.6), y = R2(1.6 + Math.floor(i / 3) * 1.4); ZC(`${ly}R${i}`, ly, 0.68, -2.2, 2.2, x, y, "tglass"); ZT(`${ly}E${i}`, ly, 0.7, 0.22, 2.2, 2.25, x, y, "tglassD"); }
  P({ id: `${ly}Sign`, layer: ly, shape: "plane", size: [3.6, 1.8], pos: [cx, R2(1.6 + 1.4 * Math.ceil(nRoll / 3) + 0.4), 0.1], mat: `t_${sign}`, uv01: true });
  flags.forEach((c, j) => P({ id: `${ly}Flag${j}`, layer: ly, shape: "plane", size: [1.2, 0.8], pos: [R2(cx - 2.0 + j * 1.35), 0.7, 2.42], mat: `flag_${c}`, uv01: true })); };
PALLET("hP0", HX2 + 6.2, "btnitto", ["JP", "TW"], 6); PALLET("hP1", HX2 + 12.6, "bttg", ["TW"], 3);

// ═════ 站 I：台灣 BT 載板廠出貨（x 480）：載板條（一條上好幾顆）疊在架上；三只紙箱（文字貼紙）；最後手機與記憶體模組 ═════
const IX = 480, IBW = 5.6, IBH = 6.2;
LAY("iPallet", [24, 1.2, IX, 0.5], true); BOX("ipDeck", "iPallet", IX - 11.1, IX + 11.1, 0.6, 1.0, -4, 4, "cartonD");
P({ id: "ipFoot", layer: "iPallet", shape: "box", size: [1.6, 0.6, 7.6], pos: [IX, 0.3, 0], at: [[-10.1, 0, 0], [0, 0, 0], [10.1, 0, 0]], mat: "dark" });
[["iBox0", "btkin"], ["iBox1", "btnya"], ["iBox2", "btuni"]].forEach(([ly, sg], i) => { const cx = IX + (i - 1) * 7.4; LAY(ly, [IBW, IBH, cx, 1 + IBH / 2]);
  BOX(`${ly}B`, ly, cx - IBW / 2, cx + IBW / 2, 1.0, 1.0 + IBH, -3.0, 3.0, "carton"); BOX(`${ly}L`, ly, cx - IBW / 2 - 0.05, cx + IBW / 2 + 0.05, 1.0 + IBH - 0.4, 1.0 + IBH, -3.05, 3.05, "cartonD");
  BOX(`${ly}T`, ly, cx - 0.45, cx + 0.45, 1.0 + IBH, 1.0 + IBH + 0.02, -3.05, 3.05, "seam");
  P({ id: `${ly}S`, layer: ly, shape: "plane", size: [4.6, 2.3], pos: [cx, R2(1.0 + IBH * 0.6), 3.03], mat: `t_${sg}`, uv01: true });
  P({ id: `${ly}F`, layer: ly, shape: "plane", size: [1.2, 0.8], pos: [R2(cx - 1.9), 1.75, 3.03], mat: "flag_TW", uv01: true });
  // 箱子打開的一角露出 BT 載板條（綠色長條，上面一格一格）
  P({ id: `${ly}Strip`, layer: ly, shape: "box", size: [4.4, 0.08, 1.6], pos: [cx, 0, 0.6], at: [0, 1, 2].map((k) => [0, R2(1.0 + IBH + 0.06 + k * 0.1), 0]), mat: "pcb" });
  P({ id: `${ly}Unit`, layer: ly, shape: "box", size: [0.5, 0.03, 0.5], pos: [0, R2(1.0 + IBH + 0.3), 0.6], at: Array.from({ length: 7 }, (_, j) => [R2(cx - 1.8 + j * 0.6), 0, 0]), mat: "gold" }); });
LAY("iPhone", [3.4, 7, IX - 13.4, 4], false); BOX("ipBody", "iPhone", IX - 15.0, IX - 11.8, 1.0, 7.6, -0.25, 0.25, "phone"); BOX("ipScr", "iPhone", IX - 14.8, IX - 12.0, 1.3, 7.3, 0.25, 0.27, "phoneScreen");
P({ id: "ipCam", layer: "iPhone", shape: "cyl", size: [0.2, 0.08], pos: [IX - 13.4, 7.0, 0.3], mat: "dark" });
LAY("iDimm", [8, 2.2, IX + 15.6, 2]); BOX("idPcb", "iDimm", IX + 11.8, IX + 19.4, 1.0, 3.2, -0.08, 0.08, "pcb");
P({ id: "idChip", layer: "iDimm", shape: "box", size: [0.9, 1.0, 0.12], pos: [0, 2.2, 0.14], at: Array.from({ length: 7 }, (_, j) => [R2(IX + 12.5 + j * 1.05), 0, 0]), mat: "moldSolid" });
P({ id: "idPin", layer: "iDimm", shape: "box", size: [0.12, 0.3, 0.02], pos: [0, 1.15, 0.09], at: Array.from({ length: 30 }, (_, j) => [R2(IX + 12.0 + j * 0.25), 0, 0]), mat: "gold" });
materials.moldSolid = M("std", "moldC", { rough: 0.5, metal: 0.1, env: 0.2 });

// ═════ 站 J：下一集玻璃基板（x 540）：載板拆開，中間的「布＋樹脂」核心往旁邊抽走，換成一整片玻璃（有穿孔銅柱）；示意 ═════
const JX = 540, JW = 10, JD = 5, JY0 = 2.0, JCT = 0.9;
LAY("jStand", [16, 2, JX, 1], true); BOX("jsTop", "jStand", JX - 8, JX + 8, 1.6, JY0, -JD / 2 - 0.5, JD / 2 + 0.5, "panel2"); BOX("jsLeg", "jStand", JX - 7.5, JX + 7.5, 0, 1.6, -JD / 2, JD / 2, "steel2");
LAY("jBot", [JW, 0.6, JX, JY0 + 0.3]); for (let k = 0; k < 2; k++) BOX(`jbL${k}`, "jBot", JX - JW / 2, JX + JW / 2, R2(JY0 + k * 0.3), R2(JY0 + k * 0.3 + 0.26), -JD / 2, JD / 2, k ? "abf" : "sr");
P({ id: "jbCu", layer: "jBot", shape: "box", size: [JW, 0.04, JD], pos: [JX, R2(JY0 + 0.28), 0], mat: "copper" });
const JC0 = R2(JY0 + 0.6), JC1 = R2(JC0 + JCT);
LAY("jCore", [JW, JCT, JX, JC0 + JCT / 2]); BOX("jcBody", "jCore", JX - JW / 2, JX + JW / 2, JC0, JC1, -JD / 2, JD / 2, "prepreg");
P({ id: "jcFib", layer: "jCore", shape: "cyl", size: [0.12, JD - 0.1], pos: [0, 0, 0], at: Array.from({ length: 16 }, (_, i) => [R2(JX - 4.5 + i * 0.6), R2(JC0 + JCT / 2 + (i % 2 ? 0.14 : -0.14)), 0]), mat: "cloth" });
LAY("jGlass", [JW, JCT, JX, JC0 + JCT / 2]); BOX("jgBody", "jGlass", JX - JW / 2, JX + JW / 2, JC0, JC1, -JD / 2, JD / 2, "glassCore");
P({ id: "jgTgv", layer: "jGlass", shape: "cyl", size: [0.12, JCT], rot: V, pos: [0, R2(JC0 + JCT / 2), 0], at: [-1.6, 0, 1.6].flatMap((z) => Array.from({ length: 9 }, (_, i) => [R2(JX - 4 + i), 0, z])), mat: "cuBright" });
LAY("jTop", [JW, 0.6, JX, JC1 + 0.3]); for (let k = 0; k < 2; k++) BOX(`jtL${k}`, "jTop", JX - JW / 2, JX + JW / 2, R2(JC1 + k * 0.3), R2(JC1 + k * 0.3 + 0.26), -JD / 2, JD / 2, k ? "sr" : "abf");
P({ id: "jtCu", layer: "jTop", shape: "box", size: [JW, 0.04, JD], pos: [JX, R2(JC1 + 0.28), 0], mat: "copper" });
LAY("jDie", [5, 0.4, JX, JC1 + 0.8]); BOX("jdDie", "jDie", JX - 2.4, JX + 2.4, R2(JC1 + 0.62), R2(JC1 + 0.94), -1.6, 1.6, "siTop");

// ═════ 動作 ═════
actions.chipGlow = { type: "pulse", _說明: "記憶體運作中（示意）", parts: ["agGlow"], color: "okC", glow: 0.9, freq: 1.0, halo: 0 };
actions.wirePulse = { type: "pulse", parts: Array.from({ length: 7 }, (_, i) => `aW${i}`), color: "wireC", glow: 0.9, freq: 1.0, halo: 0 };
actions.rollSpin = { type: "rotate", _說明: "布捲放布（往右送布）", parts: ["brCloth", "brCore", "brRim", ...Array.from({ length: 6 }, (_, k) => `brMk${k}`)], axis: [0, 0, -1], pivot: [BX - 11, RY, 0], rps: 0.35, rampSpin: true };
for (const [id, x, y] of ROL) actions[`${id}Spin`] = { type: "rotate", parts: [`${id}C`, `${id}Mk`], axis: [0, 0, id === "bSqB" ? 1 : -1], pivot: [x, y, 0], rps: 0.9, rampSpin: true };
actions.webFlow = { type: "flow", _說明: "布面上的紋路跟著布往前走：布捲→導輥→進樹脂槽→浸輥→出槽→擠壓輥→烘乾爐", layer: "bWeb", path: [[PATH[0][0], PATH[0][1], BZ], [PATH[1][0], PATH[1][1], BZ], [PATH[2][0] - 0.3, PATH[2][1], BZ], [PATH[2][0] + 0.3, PATH[2][1], BZ], [PATH[3][0], PATH[3][1], BZ], [PATH[4][0], PATH[4][1], BZ]], n: 26, size: 0.09, shape: "dot", rate: 0.25, color: "clothD", track: false };
actions.ovenGlow = { type: "pulse", parts: ["boHeat"], color: "heaterC", glow: 0.9, freq: 0.8, halo: 0 };
actions.platenHeat = { type: "pulse", parts: ["bplH"], color: "heaterC", glow: 0.9, freq: 0.8, halo: 0 };
actions.heatE = { type: "pulse", parts: ["ehStripe"], color: "heaterC", glow: 0.8, freq: 0.6, halo: 0 };
actions.heatF = { type: "pulse", parts: ["fhStripe"], color: "heaterC", glow: 0.8, freq: 0.6, halo: 0 };
actions.openPulse = { type: "pulse", parts: ["eoRing"], color: "badC", glow: 1, freq: 1.4, halo: 0 };
actions.heddleA = { type: "vibrate", _說明: "兩組綜框一上一下交替（開口，讓緯紗穿過）", parts: ["hHeddle0T", "hHeddle0B", "hHeddle0W"], axis: [0, 1, 0], amp: 0.3, freq: 1.2 };
actions.heddleB = { type: "vibrate", parts: ["hHeddle1T", "hHeddle1B", "hHeddle1W"], axis: [0, 1, 0], amp: -0.3, freq: 1.2 };
actions.reedBeat = { type: "vibrate", _說明: "筘把剛穿過的緯紗往前打緊", parts: ["hrBar", "hrTooth", "hrTop"], axis: [0, 0, 1], amp: 0.12, freq: 2.4 };
actions.rapier = { type: "vibrate", _說明: "劍桿帶著緯紗左右穿過開口", parts: ["hrpHead", "hrpTape"], axis: [1, 0, 0], amp: 3.4, freq: 1.2, tri: true };
actions.beamSpin = { type: "rotate", parts: ["hbBeam", "hbMk"], axis: [1, 0, 0], pivot: [HX2 - 4, 3.2, HZ0 + 0.6], rps: 0.15, rampSpin: true };
actions.takeSpin = { type: "rotate", parts: ["htRoll", "htMk"], axis: [-1, 0, 0], pivot: [HX2 - 4, 3.3, 2.9], rps: 0.2, rampSpin: true };
actions.screenPhone = { type: "pulse", parts: ["ipScr"], color: "screenC2", glow: 0.6, freq: 0.8, halo: 0 };
actions.tgvPulse = { type: "pulse", parts: ["jgTgv"], color: "cuBrightC", glow: 0.8, freq: 1.0, halo: 0 };

// 標註點
Object.assign(anchors, {
  aSub: A("aSub", [AX - 4, 1.05, 3], -150, 100), aDie: A("aDie", [AX + 2.2, 1.66, 1.5], 150, -90),
  bRoll: A("bRoll", [BX - 11, RY + RR, BZ], -150, -90), bTank: A("bTank", [BX - 4.5, 2.9, BZ + 0.3], -150, 100), bOven: A("bOven", [BX + 3.6, 8.3, BZ + 0.5], 150, -90), bPress: A("bPlaten", [PX0 + 3, PLY + 0.4, BZ], 150, -90), bStack: A("bCuT", [PX0 + PW, SY[4], BZ - 0.2], 150, 100),
  cRc: A("cRc", [CX - 9, CY0 + 3.0, 2.2], -150, -90), cPly: A("cPly1", [C0 - 3, CY0 + CCU + 1.5 * CPL, CD / 2], 150, -90), cResin: A("cPly0", [C0 + 4.5, CY0 + CCU + 0.2 * CPL, CD / 2], 150, -90),
  dBt: A("dBt", [DL - 3, DY0 + 2.2, DD / 2], -150, -90), dAbf: A("dAbfLine", [DR + 3, ACY1 + 0.78, DD / 2], 150, -90),
  eDie: A(`eS${ENS - 1}`, [EX, EYB + ET + EUN + ECT, 1.5], 150, -90), eSub: A(`eS${ENS - 1}`, [EX - 5.5, EYB + EST[ENS - 1].c(-5.5) + ET, 3], -150, -90), eOpen: A("eOpen", [EX + 6 * (1 + EE), HY + 0.3, 2.3], 150, 100),
  fA: A(`fA${FNS - 1}`, [FX - 7.5, EYB + 1.2, 3], -150, -90), fB: A(`fB${FNS - 1}`, [FX + 7.5, EYB + 0.9, 3], 150, -90),
  gRack: A("gR0", [GX - 13.2, 3.1, 2.4], -150, -90), gBig: A("gBig", [GX + 6, 2.1, -3.5], 150, -90), gSmall: A("gSmall", [GX + 5, 2.1, 4.6], 150, 100),
  hLoom: A("hLoom", [HX2 - 8.5, 6.8, -0.8], -150, -90), hP0: A("hP0", [HX2 + 6.2, 5.0, 0], 150, -90), hP1: A("hP1", [HX2 + 12.6, 3.8, 0], 150, -90),
  iBox0: A("iBox0", [IX - 7.4, 5.0, 3.0], -150, -90), iPhone: A("iPhone", [IX - 13.4, 7.3, 0.3], -150, -90), iDimm: A("iDimm", [IX + 15.6, 3.2, 0.1], 150, -90),
  jGlass: A("jGlass", [JX + 4, JC0 + JCT / 2, JD / 2], 150, -90), jCore: A("jCore", [JX - 4, JC0 + JCT / 2, JD / 2], -150, -90),
});
const model = {
  name: "示意 BT 載板：手機記憶體封裝、玻纖布含浸生產線與熱壓、鋼筋混凝土對照剖面、BT／味之素膜載板對照、受熱翹曲（晶片、載板、錫球）、一般布與低膨脹布對照、搶料、織布機、出貨、玻璃基板（示意，非特定廠牌／型號）",
  unit: "示意（1＝1 cm；剖面站另外放大）",
  size: { w: 40, h: 20, r: 0.6, t: 30 },
  palette, materials,
  partNames: { aSub: "BT 載板", aDie: "記憶體晶片" },
  layers, parts, anchors, actions,
  pose: { yaw0: 0, yawIso: 0, drift: 0 },
  camera: { stand: { d: 60, elev: 24, y: 3 } },
  fx: { dpr: 1, srcPx: 30, shadows: 0, fog: false, dust: false, vaporSprites: false, shimmer: false },
  info: { AX, BX, PX0, PLY, SY, CX, C0, CY0, CCU, CPL, DX, DL, DR, EX, ENS, EYB, FX, FNS, GX, GN, HX2, IX, JX, JC0, JCT },
};
const out = path.join(HERE, "model.json");
fs.writeFileSync(out, JSON.stringify(model, null, 1) + "\n");
console.log(`✔ ${out}：${parts.length} 個零件、${parts.reduce((a, p) => a + Math.max(1, (p.at?.length ?? 0)), 0)} 個實體（含複製）、${layers.length} 層`);

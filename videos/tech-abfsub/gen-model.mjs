// node videos/tech-abfsub/gen-model.mjs → 寫 videos/tech-abfsub/model.json
// 2026/11/27 tech-abfsub（ABF 載板，系列 3 第 8 集）。構造與物理照 physics-spec.md；來源 research.md §1、§2、§5。
// 單位：1＝1 cm（AI 載板邊長 10），地板頂面 y＝0。剖面站（B、E、F）另外放大，畫面標「示意，非實際比例」。站點：
//   A 封裝（x 0：主機板、錫球、載板、凸塊、晶片＋記憶體）｜B 剖面（x 60：核心板、鑽孔、鍍銅、塞孔、兩面增層、雷射盲孔、疊孔）｜D 大小對照（x 120）
//   E 層數闖關（x 180）｜F 翹曲（x 240）｜G 出貨盒（x 300）｜H 下一集（x 360：手機記憶體用的小薄載板）
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
const HERE = path.dirname(new URL(import.meta.url).pathname);

const R2 = (x) => Math.round(x * 1000) / 1000;
const D2R = Math.PI / 180;
const pol = (aDeg, r) => [R2(r * Math.cos(aDeg * D2R)), R2(r * Math.sin(aDeg * D2R))]; // (x, z)
let seed = 20261127;
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
// ═════ 地板 ═════
LAY("floor", [480, 2, 180, 0], true);
P({ id: "floor", layer: "floor", shape: "slab", size: [500, 0.5, 60], r: 0.2, pos: [180, -0.25, 0], mat: "floor" });
P({ id: "floorSeam", layer: "floor", shape: "slab", size: [500, 0.04, 0.12], pos: [180, 0.01, 0], at: Array.from({ length: 7 }, (_, i) => [0, 0, -24 + i * 8]), mat: "seam" });

// ═════ 站 A：主機板上的封裝（x 0）：主機板、錫球（粗）、載板（側面多層）、凸塊（細）、晶片＋周邊記憶體 ═════
const MBY = 1.0, SBH = 0.56, BR0 = 0.2, SBY0 = R2(MBY + 2 * BR0), SBY1 = R2(SBY0 + SBH), CHY0 = R2(SBY1 + 0.14), CHH = 0.3, SBW = 10;
LAY("mb", [26, 1.2, 0, 0.5]);
BOX("mbBoard", "mb", -13, 13, MBY - 0.2, MBY, -10, 10, "pcb"); P({ id: "mbFoot", layer: "mb", shape: "cyl", size: [0.5, 0.8], rot: V, pos: [0, 0.4, 0], at: [[-12, 0, -9], [12, 0, -9], [-12, 0, 9], [12, 0, 9]], mat: "steel" });
P({ id: "mbPad", layer: "mb", shape: "cyl", size: [0.16, 0.02], rot: V, pos: [0, MBY + 0.01, 0], at: GXZ(12, 12, 0.8, 0.8), mat: "pcbTrace" });
for (let i = 0; i < 10; i++) BOX(`mbTr${i}`, "mb", 5.6, 12.6, MBY, MBY + 0.012, -4.5 + i * 1.0, -4.42 + i * 1.0, "pcbTrace");
for (let i = 0; i < 8; i++) BOX(`mbTrB${i}`, "mb", -4.5 + i * 1.2, -4.42 + i * 1.2, MBY, MBY + 0.012, 5.6, 9.4, "pcbTrace");
P({ id: "mbCap", layer: "mb", shape: "box", size: [0.5, 0.35, 0.8], pos: [0, MBY + 0.17, 0], at: [[-8, 0, 7], [-7, 0, 7], [-6, 0, 7], [8, 0, -7], [9, 0, -7]], mat: "dark" });
P({ id: "mbHole", layer: "mb", shape: "cyl", size: [0.35, 0.02], rot: V, pos: [0, MBY + 0.01, 0], at: [[-12, 0, -9], [12, 0, -9], [-12, 0, 9], [12, 0, 9]], mat: "steel2" });
LAY("balls", [10, 0.4, 0, MBY + BR0]);
P({ id: "ballS", layer: "balls", shape: "sphere", size: [BR0], pos: [0, R2(MBY + BR0), 0], at: GXZ(12, 12, 0.8, 0.8), mat: "bump" });
LAY("sub", [10, SBH, 0, (SBY0 + SBY1) / 2]);
{ const ys = [0, 0.05, 0.11, 0.16, 0.22, 0.34, 0.4, 0.45, 0.51, SBH]; const mats = ["subTop", "abf", "copper", "abf", "core", "abf", "copper", "abf", "subTop"];
  for (let k = 0; k < mats.length; k++) BOX(`sbL${k}`, "sub", -SBW / 2, SBW / 2, R2(SBY0 + ys[k]), R2(SBY0 + ys[k + 1]), -SBW / 2, SBW / 2, mats[k]); }
P({ id: "sbPadT", layer: "sub", shape: "cyl", size: [0.07, 0.02], rot: V, pos: [0, R2(SBY1 + 0.01), 0], at: GXZ(18, 14, 0.25, 0.25), mat: "gold" });
BOX("sbMark", "sub", -4.8, -4.2, SBY1, SBY1 + 0.02, 4.2, 4.8, "white");
LAY("chip", [8, 1.2, 0, CHY0 + 0.5]);
LAY("bumps", [5, 0.2, 0, CHY0 - 0.07]); P({ id: "chBump", layer: "bumps", shape: "sphere", size: [0.06], pos: [0, R2(CHY0 - 0.07), 0], at: GXZ(18, 14, 0.25, 0.25), mat: "bump" });
P({ id: "hbBump", layer: "bumps", shape: "sphere", size: [0.05], pos: [0, R2(CHY0 - 0.07), 0], at: [-3.3, 3.3].flatMap((x) => [-1.3, 1.3].flatMap((z) => GXZ(4, 5, 0.2, 0.2).map(([a, , c]) => [R2(x + a), 0, R2(z + c)]))), mat: "bump" });
BOX("chUnderfill", "chip", -2.5, 2.5, SBY1, CHY0, -2.0, 2.0, "liner");
BOX("chDie", "chip", -2.4, 2.4, CHY0, CHY0 + CHH, -1.9, 1.9, "siTop"); BOX("chDieEdge", "chip", -2.45, 2.45, CHY0, CHY0 + 0.06, -1.95, 1.95, "si");
P({ id: "chHbm", layer: "chip", shape: "box", size: [0.9, 0.55, 1.1], pos: [0, R2(CHY0 + 0.275), 0], at: [[-3.3, 0, -1.3], [-3.3, 0, 1.3], [3.3, 0, -1.3], [3.3, 0, 1.3]], mat: "si" });
P({ id: "chHbmLine", layer: "chip", shape: "box", size: [0.92, 0.02, 1.12], pos: [0, CHY0, 0], at: [-3.3, 3.3].flatMap((x) => [-1.3, 1.3].flatMap((z) => [0.12, 0.24, 0.36, 0.48].map((y) => [x, y, z]))), mat: "dark" });
LAY("chipGlow", [5, 0.4, 0, CHY0 + CHH]); BOX("chGlow", "chipGlow", -2.2, 2.2, CHY0 + CHH, CHY0 + CHH + 0.02, -1.7, 1.7, "okGlow");

// ═════ 站 B：剖面（x 60；半剖：前切面 z＝0 正好切過貫通孔與盲孔）：核心板（玻纖＋樹脂＋兩面銅箔）、鑽孔、孔壁鍍銅（由薄到厚）、樹脂由孔口往下灌、刮平；兩面增層：壓膜→雷射打盲孔（孔底停在下一層銅墊）→銅填滿→下一層，疊孔對準 ═════
const BX = 60, BW = 22, BD = 3.2, BZ0 = -BD, BZ1 = 0, BC0 = 4.0, BC1 = 6.0, BF = 0.16, BL = 0.62, BN = 3, HOX = BX, HR = 0.55, WT0 = 0.04, WT1 = 0.13;
LAY("bBase", [26, 1, BX, 0.4], true); BOX("bFoot", "bBase", BX - 12, BX + 12, 0, 0.3, BZ0 - 0.6, BZ1 + 0.6, "steel2");
P({ id: "bPost", layer: "bBase", shape: "box", size: [0.7, R2(BC0 - BF - BN * BL - 0.3), 0.7], pos: [BX, R2((0.3 + BC0 - BF - BN * BL) / 2), R2(BZ0 / 2)], at: [[-10.4, 0, 0], [10.4, 0, 0]], mat: "dark" });
const ZB = (id, layer, x0, x1, y0, y1, mat) => BOX(id, layer, x0, x1, y0, y1, BZ0, BZ1, mat);
const fiberStripes = (pre, layer, x0, x1) => { for (let k = 0; k < 5; k++) { const y = R2(BC0 + 0.25 + k * 0.38); BOX(`${pre}${k}`, layer, x0, x1, y, y + 0.12, BZ1, BZ1 + 0.02, "fiber"); } };
LAY("bCore", [BW, 2, BX, 5]);
ZB("bCoreL", "bCore", BX - BW / 2, HOX - HR, BC0, BC1, "core"); ZB("bCoreR", "bCore", HOX + HR, BX + BW / 2, BC0, BC1, "core");
fiberStripes("bFibL", "bCore", BX - BW / 2, HOX - HR); fiberStripes("bFibR", "bCore", HOX + HR, BX + BW / 2);
ZB("bCuTL", "bCore", BX - BW / 2, HOX - HR, BC1, BC1 + BF, "copper"); ZB("bCuTR", "bCore", HOX + HR, BX + BW / 2, BC1, BC1 + BF, "copper");
ZB("bCuBL", "bCore", BX - BW / 2, HOX - HR, BC0 - BF, BC0, "copper"); ZB("bCuBR", "bCore", HOX + HR, BX + BW / 2, BC0 - BF, BC0, "copper");
// 鑽孔前：孔的位置跟旁邊一樣是實心板（同材質、同玻纖紋、同銅箔）
LAY("bPlug0", [2, 2, HOX, 5]); ZB("bP0Core", "bPlug0", HOX - HR, HOX + HR, BC0, BC1, "core"); fiberStripes("bP0Fib", "bPlug0", HOX - HR, HOX + HR);
ZB("bP0CuT", "bPlug0", HOX - HR, HOX + HR, BC1, BC1 + BF, "copper"); ZB("bP0CuB", "bPlug0", HOX - HR, HOX + HR, BC0 - BF, BC0, "copper");
// 鑽完：孔裡是空的（深色＝孔的背面）
LAY("bHole", [2, 2, HOX, 5]); BOX("bHoleBack", "bHole", HOX - HR, HOX + HR, BC0 - BF, BC1 + BF, BZ0, BZ0 + 0.05, "voidM");
// 孔壁鍍銅：先一層薄的、再加厚（剖面上是左右兩條銅壁）
LAY("bWall0", [2, 2, HOX, 5]); for (const sx of [-1, 1]) ZB(`bW0${sx > 0 ? "R" : "L"}`, "bWall0", R2(sx > 0 ? HOX + HR - WT0 : HOX - HR), R2(sx > 0 ? HOX + HR : HOX - HR + WT0), BC0 - BF, BC1 + BF, "cuBright");
LAY("bWall1", [2, 2, HOX, 5]); for (const sx of [-1, 1]) ZB(`bW1${sx > 0 ? "R" : "L"}`, "bWall1", R2(sx > 0 ? HOX + HR - WT1 : HOX - HR), R2(sx > 0 ? HOX + HR : HOX - HR + WT1), BC0 - BF, BC1 + BF, "cuBright");
// 樹脂由孔口往下灌（4 段，由上往下依序出現）
const RS = 4, RH = (BC1 - BC0 + 2 * BF) / RS;
for (let k = 0; k < RS; k++) { LAY(`bResin${k}`, [1, RH, HOX, BC1 - k * RH]); ZB(`bRes${k}`, `bResin${k}`, R2(HOX - HR + WT1), R2(HOX + HR - WT1), R2(BC1 + BF - (k + 1) * RH), R2(BC1 + BF - k * RH), "resin"); }
LAY("bResinBump", [1, 0.2, HOX, BC1 + BF + 0.1]); ZB("bResBump", "bResinBump", R2(HOX - HR + WT1), R2(HOX + HR - WT1), BC1 + BF, BC1 + BF + 0.14, "resin");
// 刮平：刮刀從左往右掃過，凸出的樹脂消失、蓋一層銅
LAY("bBlade", [3, 1, HOX - 3, BC1 + 0.6]); BOX("bBladeB", "bBlade", HOX - 3.4, HOX - 3.1, BC1 + BF + 0.14, BC1 + BF + 1.3, BZ0 - 0.2, BZ1 + 0.2, "steel"); BOX("bBladeH", "bBlade", HOX - 3.6, HOX - 2.9, BC1 + BF + 1.3, BC1 + BF + 1.6, BZ0 - 0.2, BZ1 + 0.2, "dark");
LAY("bCap", [2, 0.2, HOX, BC1 + BF]); ZB("bCapT", "bCap", HOX - HR - 0.3, HOX + HR + 0.3, BC1 + BF, BC1 + BF + 0.06, "copper"); ZB("bCapB", "bCap", HOX - HR - 0.3, HOX + HR + 0.3, BC0 - BF - 0.06, BC0 - BF, "copper");
// 鑽針（主軸＋夾頭＋斜向螺旋槽鑽頭；鑽頭直徑比孔小）
const DRY = 7.0, DBR = 0.4;
LAY("bDrill", [2, 6, HOX, 9], true);
VC("bdBit", "bDrill", DBR, DRY, DRY + 2.8, "steel2", { x: HOX, z: -0.4 });
P({ id: "bdFlute", layer: "bDrill", shape: "box", size: [0.84, 0.08, 0.1], pos: [HOX, DRY + 0.3, -0.4], at: Array.from({ length: 7 }, (_, i) => [0, i * 0.38, 0]), rot: [0, 0, 25], mat: "dark" });
VC("bdTip", "bDrill", 0.16, DRY - 0.22, DRY, "steel", { x: HOX, z: -0.4 }); VC("bdChuck", "bDrill", 0.8, DRY + 2.8, DRY + 3.6, "dark", { x: HOX, z: -0.4 }); VC("bdSpindle", "bDrill", 1.2, DRY + 3.6, DRY + 5.0, "panel2", { x: HOX, z: -0.4 });
BOX("bdMark", "bDrill", HOX - 0.06, HOX + 0.06, DRY + 3.7, DRY + 4.9, 0.8, 0.84, "mark");
// 增層：上下對稱各 BN 層。每層三件：膜（bF）、雷射打出的孔（bH，深色倒錐）、銅（bV：填孔銅＋孔頂銅墊＋線路）
const VX = HOX + 3.6;                                    // 盲孔疊在同一個 x（疊孔）
const BLY = [];
for (let k = 0; k < BN; k++) for (const side of ["t", "b"]) {
  const yA = side === "t" ? R2(BC1 + BF + k * BL) : R2(BC0 - BF - (k + 1) * BL);
  const filmY0 = side === "t" ? yA : R2(yA + 0.08), filmY1 = side === "t" ? R2(yA + BL - 0.08) : R2(yA + BL);
  LAY(`bF${k}${side}`, [BW, BL, BX, (filmY0 + filmY1) / 2]); ZB(`bFilm${k}${side}`, `bF${k}${side}`, BX - BW / 2, BX + BW / 2, filmY0, filmY1, "abf");
  const cone = (id, layer, mat, r) => P({ id, layer, shape: "cone", size: side === "t" ? [r * 0.55, r, R2(filmY1 - filmY0)] : [r, r * 0.55, R2(filmY1 - filmY0)], rot: [90, 0, 0], pos: [VX, R2((filmY0 + filmY1) / 2), 0], mat });
  LAY(`bH${k}${side}`, [1, BL, VX, (filmY0 + filmY1) / 2]); cone(`bHole${k}${side}`, `bH${k}${side}`, "voidM", 0.42);
  LAY(`bV${k}${side}`, [BW, BL, BX, (filmY0 + filmY1) / 2]); cone(`bVia${k}${side}`, `bV${k}${side}`, "cuBright", 0.42);
  P({ id: `bViaFill${k}${side}`, layer: `bV${k}${side}`, shape: "cyl", size: [0.3, R2(filmY1 - filmY0 - 0.02)], rot: V, pos: [VX, R2((filmY0 + filmY1) / 2), 0], mat: "cuBright" });
  const cy0 = side === "t" ? filmY1 : R2(filmY0 - 0.08), cy1 = side === "t" ? R2(filmY1 + 0.08) : filmY0;
  ZB(`bPad${k}${side}`, `bV${k}${side}`, VX - 0.75, VX + 0.75, cy0, cy1, "copper");
  [[-9.6, -6.6], [-5.6, -2.6], [-1.0, 1.6], [5.6, 9.8]].forEach(([a, b], i) => ZB(`bTr${k}${side}${i}`, `bV${k}${side}`, R2(BX + a + (k % 2) * 0.4), R2(BX + b + (k % 2) * 0.4), cy0, cy1, "copper"));
  BLY.push({ k, side, y: side === "t" ? filmY1 : filmY0 });
}
// 核心兩面、盲孔正下方的銅墊（第一層盲孔要停在它上面）
ZB("bPadCoreT", "bCore", VX - 0.75, VX + 0.75, BC1, BC1 + BF + 0.01, "cuBright"); ZB("bPadCoreB", "bCore", VX - 0.75, VX + 0.75, BC0 - BF - 0.01, BC0, "cuBright");
// 雷射頭：上面一支、下面一支（兩面各自打孔）；光錐尖端落在第 1 層膜面，每打完一層頭往外退一層（genscript 用 shift 移）
const LT = BLY.filter((q) => q.side === "t")[0].y, LB = BLY.filter((q) => q.side === "b")[0].y;
LAY("bLaserT", [3, 5, VX, LT + 4], true); VC("bltBody", "bLaserT", 0.9, LT + 2.4, LT + 5.2, "panel2", { x: VX }); VC("bltLens", "bLaserT", 0.55, LT + 2.1, LT + 2.4, "dark", { x: VX }); VT("bltBand", "bLaserT", 0.95, 0.85, LT + 4.2, LT + 4.45, "lampR", { x: VX });
LAY("bBeamT", [1, 2, VX, LT + 1]); P({ id: "bltBeam", layer: "bBeamT", shape: "cone", size: [0.06, 0.4, 2.1], rot: [90, 0, 0], pos: [VX, R2(LT + 1.05), 0], mat: "laser" });
LAY("bLaserB", [3, 5, VX, LB - 4], true); VC("blbBody", "bLaserB", 0.9, LB - 5.2, LB - 2.4, "panel2", { x: VX }); VC("blbLens", "bLaserB", 0.55, LB - 2.4, LB - 2.1, "dark", { x: VX }); VT("blbBand", "bLaserB", 0.95, 0.85, LB - 4.45, LB - 4.2, "lampR", { x: VX });
LAY("bBeamB", [1, 2, VX, LB - 1]); P({ id: "blbBeam", layer: "bBeamB", shape: "cone", size: [0.4, 0.06, 2.1], rot: [90, 0, 0], pos: [VX, R2(LB - 1.05), 0], mat: "laser" });

// ═════ 站 D：大小對照（x 120）：一般晶片的小載板 vs 人工智慧晶片的大載板＋10 cm 尺標 ═════
const DX = 120;
LAY("dTable", [30, 1, DX, 0.4]); BOX("dTop", "dTable", DX - 15, DX + 15, 0.6, 0.9, -8, 8, "panel2"); BOX("dLeg", "dTable", DX - 14, DX + 14, 0, 0.6, -7.5, 7.5, "steel2");
LAY("dSmall", [4, 1, DX - 9, 1.5]); BOX("dsSub", "dSmall", DX - 11, DX - 7, 0.9, 1.3, -2, 2, "pcb"); BOX("dsDie", "dSmall", DX - 9.8, DX - 8.2, 1.3, 1.5, -0.8, 0.8, "siTop");
LAY("dBig", [10, 1, DX + 3.5, 1.5]); BOX("dbSub", "dBig", DX - 1.5, DX + 8.5, 0.9, 1.45, -5, 5, "pcb"); BOX("dbSr", "dBig", DX - 1.45, DX + 8.45, 1.45, 1.5, -4.95, 4.95, "sr");
BOX("dbDie", "dBig", DX + 1.0, DX + 6.0, 1.5, 1.8, -2.0, 2.0, "siTop"); P({ id: "dbHbm", layer: "dBig", shape: "box", size: [0.9, 0.55, 1.1], pos: [DX + 3.5, 1.78, 0], at: [[-3.3, 0, -1.4], [-3.3, 0, 1.4], [3.3, 0, -1.4], [3.3, 0, 1.4], [-3.3, 0, 0], [3.3, 0, 0]], mat: "si" });
LAY("dRuler", [10, 0.3, DX + 3.5, 1]); BOX("drBar", "dRuler", DX - 1.5, DX + 8.5, 0.9, 1.0, 5.4, 6.4, "warnY");
for (let i = 0; i <= 10; i++) BOX(`drTick${i}`, "dRuler", R2(DX - 1.5 + i - 0.03), R2(DX - 1.5 + i + 0.03), 1.0, 1.02, 5.4, i % 5 ? 5.8 : 6.2, "dark");

// ═════ 站 E：層數闖關（x 180）：載板側面剖開，二十多層一層層亮綠；其中一層亮紅 → 整片紅、蓋✗ ═════
const EX = 180, EN = 22, ET = 0.32, EY0 = 1.4, ECT = 0.8, EC0 = EN / 2;   // 第 EC0 層起往上多墊一塊核心
const eY = (k) => R2(EY0 + k * ET + (k >= EC0 ? ECT : 0));
LAY("eBase", [18, 1.4, EX, 0.7]); BOX("ebStand", "eBase", EX - 9, EX + 9, 0, EY0, -3, 3, "steel2");
LAY("eStack", [16, EN * ET + ECT, EX, EY0 + (EN * ET + ECT) / 2]);
const EYC = R2(EY0 + EC0 * ET);
BOX("esCore", "eStack", EX - 8, EX + 8, EYC, R2(EYC + ECT), -2.5, 2.5, "core");
for (let i = 0; i < 3; i++) BOX(`esFib${i}`, "eStack", EX - 8, EX + 8, R2(EYC + 0.12 + i * 0.24), R2(EYC + 0.2 + i * 0.24), 2.5, 2.52, "fiber");
for (let k = 0; k < EN; k++) { const y0 = eY(k);
  BOX(`esL${k}`, "eStack", EX - 8, EX + 8, y0, R2(y0 + ET - 0.06), -2.5, 2.5, "abf"); BOX(`esC${k}`, "eStack", EX - 8, EX + 8, R2(y0 + ET - 0.06), R2(y0 + ET), -2.5, 2.5, "copper"); }
const EBAD = 18;      // 核心上方第 8 層出錯
for (let k = 0; k < EN; k++) { LAY(`eOk${k}`, [16, ET, EX, eY(k)]); BOX(`eOkB${k}`, `eOk${k}`, EX - 8.02, EX + 8.02, R2(eY(k) + 0.04), R2(eY(k) + ET - 0.1), 2.5, 2.54, k === EBAD ? "badGlow" : "okGlow"); }
LAY("eFail", [16, EN * ET + ECT, EX, EY0 + (EN * ET + ECT) / 2]); BOX("efBox", "eFail", EX - 8.1, EX + 8.1, EY0, R2(EY0 + EN * ET + ECT + 0.05), 2.5, 2.62, "badSolid");
LAY("eX", [3, 3, EX, EY0 + EN * ET + ECT + 2]); P({ id: "eXa", layer: "eX", shape: "box", size: [3.2, 0.4, 0.4], pos: [EX, R2(EY0 + EN * ET + ECT + 2), 2.6], rot: [0, 0, 45], mat: "badSolid" }); P({ id: "eXb", layer: "eX", shape: "box", size: [3.2, 0.4, 0.4], pos: [EX, R2(EY0 + EN * ET + ECT + 2), 2.6], rot: [0, 0, -45], mat: "badSolid" });

// ═════ 站 F：翹曲（x 240）：連續彎曲的板（poly 剖面沿 z 擠出）；受熱後依序換成越來越彎的四個階段（兩端往上翹，示意） ═════
const FX = 240, FL = 15, FT = 0.56, FY = 3.0, FDEP = 8;
LAY("fBase", [18, 3, FX, 1.5]); BOX("ffStand", "fBase", FX - 9, FX + 9, 0, 1.2, -4.5, 4.5, "steel2"); P({ id: "ffPin", layer: "fBase", shape: "cyl", size: [0.3, 1.8], rot: V, pos: [FX, 2.1, 0], mat: "dark" });
const arcPts = (h) => { const n = 24, top = [], bot = []; for (let i = 0; i <= n; i++) { const u = -FL / 2 + (FL * i) / n, y = h * (u / (FL / 2)) ** 2; top.push([R2(u), R2(y + FT)]); bot.push([R2(u), R2(y)]); } return [...bot, ...top.reverse()]; };
const FNS = 9, FH = Array.from({ length: FNS }, (_, i) => R2(1.6 * (i / (FNS - 1)) ** 1.3));
const mix = (a, b, t) => "#" + [0, 2, 4].map((j) => Math.round(parseInt(a.slice(1 + j, 3 + j), 16) * (1 - t) + parseInt(b.slice(1 + j, 3 + j), 16) * t).toString(16).padStart(2, "0")).join("");
FH.forEach((_, i) => { const t = i / (FNS - 1); palette[`warm${i}C`] = mix(palette.pcbC, palette.hotC2, t); materials[`warm${i}`] = M("std", `warm${i}C`, { emissive: `warm${i}C`, ei: R2(0.35 * t), rough: 0.6, metal: 0.05, tex: "traces", texScale: 3 }); });
FH.forEach((h, i) => { LAY(`fB${i}`, [FL, FT + h, FX, FY + h / 2]); P({ id: `fBoard${i}`, layer: `fB${i}`, shape: "poly", pts: arcPts(h), size: [FL, R2(FT + h), FDEP], pos: [FX, FY, 0], mat: `warm${i}` }); });
LAY("fChip", [5, 0.6, FX, FY + 0.8]); BOX("fcDie", "fChip", FX - 2.2, FX + 2.2, FY + FT, FY + FT + 0.3, -1.8, 1.8, "siTop");

// ═════ 站 G：出貨盒（x 300）：三只紙箱貼文字貼紙（不仿商標）═════
const SIGNS = [["abfuni", "欣興|3037"], ["abfnya", "南電|8046"], ["abfkin", "景碩|3189"]];
{ const r = spawnSync("node", [path.join(HERE, "..", "..", "scripts", "three", "make-brand-tex.mjs"), "tech-abfsub", ...SIGNS.map(([id, t]) => `text:${id}=${t}`)], { encoding: "utf8" }); if (r.status !== 0) { console.error(r.stderr); process.exit(1); } }
SIGNS.forEach(([id]) => { materials[`t_${id}`] = { kind: "unlit", color: "#FFFFFF", img: `tex/brand/sign-${id}.png` }; });
const PX = 300, PBW = 6.4, PBH = 8.4;
LAY("gPallet", [24, 1.2, PX, 0.5]); BOX("gpDeck", "gPallet", PX - 11.1, PX + 11.1, 0.6, 1.0, -4, 4, "cartonD");
P({ id: "gpFoot", layer: "gPallet", shape: "box", size: [1.6, 0.6, 7.6], pos: [PX, 0.3, 0], at: [[-10.1, 0, 0], [0, 0, 0], [10.1, 0, 0]], mat: "dark" });
P({ id: "gpSlat", layer: "gPallet", shape: "box", size: [22.0, 0.06, 0.5], pos: [PX, 1.03, 0], at: [[0, 0, -3], [0, 0, -1], [0, 0, 1], [0, 0, 3]], mat: "seam" });
const PCOL = ["okGlow", "warnY", "badGlow"];
SIGNS.forEach(([id], i) => { const cx = PX + (i - 1) * 7.6, ly = `g${i}`; LAY(ly, [PBW, PBH, cx, 1 + PBH / 2]);
  BOX(`${ly}Box`, ly, cx - PBW / 2, cx + PBW / 2, 1.0, 1.0 + PBH, -3.2, 3.2, "carton"); BOX(`${ly}Lid`, ly, cx - PBW / 2 - 0.05, cx + PBW / 2 + 0.05, 1.0 + PBH - 0.5, 1.0 + PBH, -3.25, 3.25, "cartonD");
  BOX(`${ly}TapeS`, ly, cx - 0.5, cx + 0.5, 1.0 + PBH, 1.0 + PBH + 0.02, -3.25, 3.25, "seam"); BOX(`${ly}Band`, ly, cx - PBW / 2 - 0.02, cx + PBW / 2 + 0.02, 1.2, 1.7, 3.2, 3.24, PCOL[i]);
  P({ id: `${ly}Sign`, layer: ly, shape: "plane", size: [5.2, 2.6], pos: [cx, R2(1.0 + PBH * 0.58), 3.23], mat: `t_${id}`, uv01: true });
  BOX(`${ly}Fragile`, ly, cx + 1.6, cx + 2.7, 1.9, 2.6, 3.2, 3.24, "warnY"); BOX(`${ly}Arrow`, ly, cx - 2.7, cx - 1.9, 2.0, 3.0, 3.2, 3.24, "dark"); });

// ═════ 站 H：下一集（x 360）：手機記憶體用的小薄載板（BT 載板示意）＋兩顆疊晶片＋金線 ═════
const HX2 = 360;
LAY("hPcb", [14, 0.6, HX2, 0.3]); BOX("hpBoard", "hPcb", HX2 - 7, HX2 + 7, 0.42, 0.58, -5, 5, "pcb"); P({ id: "hpFoot", layer: "hPcb", shape: "cyl", size: [0.3, 0.42], rot: V, pos: [HX2, 0.21, 0], at: [[-6.4, 0, -4.4], [6.4, 0, -4.4], [-6.4, 0, 4.4], [6.4, 0, 4.4]], mat: "steel" });
LAY("hSub", [8, 0.6, HX2, 1.2]); BOX("hsBody", "hSub", HX2 - 4, HX2 + 4, 0.9, 1.2, -3, 3, "pcb"); P({ id: "hsBall", layer: "hSub", shape: "sphere", size: [0.16], pos: [HX2, 0.74, 0], at: GXZ(9, 7, 0.8, 0.8), mat: "bump" });
P({ id: "hsPad", layer: "hSub", shape: "box", size: [0.3, 0.04, 0.3], pos: [HX2, 1.22, 2.4], at: [-2.4, -1.6, -0.8, 0, 0.8, 1.6, 2.4].map((x) => [x, 0, 0]), mat: "gold" });
LAY("hDie", [5, 0.6, HX2, 1.5]); BOX("hdD1", "hDie", HX2 - 2.6, HX2 + 2.6, 1.2, 1.4, -1.8, 1.8, "si"); BOX("hdD2", "hDie", HX2 - 2.2, HX2 + 2.2, 1.4, 1.6, -1.5, 1.5, "siTop");
LAY("hWire", [6, 1, HX2, 2]);
[-2.4, -1.6, -0.8, 0, 0.8, 1.6, 2.4].forEach((x, i) => { const a = [x * 0.8, 1.6, 1.4], c = [x * 0.9, 2.4, 2.0], b = [x, 1.24, 2.4];
  const pts = Array.from({ length: 16 }, (_, k) => { const t = k / 15, u = 1 - t; return [0, 1, 2].map((d) => R2(u * u * a[d] + 2 * u * t * c[d] + t * t * b[d])); });
  P({ id: `hW${i}`, layer: "hWire", shape: "sphere", size: [0.05], pos: [HX2, 0, 0], at: pts, mat: "wire" }); });

// ═════ 動作 ═════
actions.chipGlow = { type: "pulse", _說明: "晶片運作中（示意）", parts: ["chGlow"], color: "okC", glow: 0.9, freq: 1.0, halo: 0 };
actions.drillSpin = { type: "rotate", _說明: "鑽針高速自轉（示意），起轉加速", parts: ["bdBit", "bdFlute", "bdTip", "bdChuck", "bdMark"], axis: [0, 1, 0], pivot: [HOX, 0, -0.4], rps: 3, rampSpin: true };
actions.drillChips = { type: "flow", _說明: "鑽屑從孔口往上、往外排出（跟著板子，不跟鑽針）", layer: "bCore", path: [[HOX + 0.3, BC1 + 0.2, 0.3], [HOX + 1.4, BC1 + 1.2, 0.6], [HOX + 2.6, BC1 + 0.3, 0.9]], n: 6, size: 0.1, shape: "dot", rate: 0.8, color: "fiberC", track: false, free: true, jitter: 0.2, accel: true };
actions.laserPulseT = { type: "pulse", parts: ["bltBeam"], color: "laserC", glow: 1, freq: 4, halo: 0 };
actions.laserPulseB = { type: "pulse", parts: ["blbBeam"], color: "laserC", glow: 1, freq: 4, halo: 0 };
actions.heatGlow = { type: "pulse", parts: [`fBoard${FNS - 1}`], color: "hotC2", glow: 0.5, freq: 0.8, halo: 0 };
actions.failPulse = { type: "pulse", parts: ["efBox"], color: "badC", glow: 0.9, freq: 1.2, halo: 0 };
actions.wirePulse = { type: "pulse", parts: Array.from({ length: 7 }, (_, i) => `hW${i}`), color: "wireC", glow: 0.9, freq: 1.0, halo: 0 };

// 標註點
Object.assign(anchors, {
  chip: A("chip", [2.4, CHY0 + CHH, 1.9], 150, -90), sub: A("sub", [-5, SBY0 + 0.3, 5], -150, 100), balls: A("balls", [-4.4, MBY + BR0, 4.4], -150, 100), mb: A("mb", [9, MBY, 8], 150, 100),
  core: A("bCore", [BX - 6, BC0 + 1.0, 0.02], -150, 100), drill: A("bDrill", [HOX + 0.4, DRY + 2, -0.4], 150, -90), resin: A("bResin2", [HOX, BC0 + 0.8, 0.02], 150, 100),
  filmT: A("bF0t", [BX - 7, BC1 + BF + 0.3, 0.02], -150, -90), filmB: A("bF0b", [BX - 7, BC0 - BF - 0.3, 0.02], -150, 100), via: A("bV1t", [VX, BC1 + BF + BL * 1.5, 0.3], 150, -90), laser: A("bLaserT", [VX + 0.9, LT + 3.6, 0.5], 150, -90),
  dSmall: A("dSmall", [DX - 9, 1.5, 0.8], -150, -90), dBig: A("dBig", [DX + 6, 1.8, 2.0], 150, -90), dRuler: A("dRuler", [DX + 8.5, 1.0, 6.0], 150, 100),
  eStack: A("eStack", [EX - 8, EY0 + 3, 2.5], -150, -90), eBad: A(`eOk${EBAD}`, [EX + 6, EY0 + EBAD * ET + 0.1, 2.54], 150, -90),
  fWarp: A(`fB${FNS - 1}`, [FX - 7.0, FY + 2.1, 4], -150, -90), fChip: A("fChip", [FX + 2.2, FY + 0.86, 1.8], 150, -90),
  g0: A("g0", [PX - 7.6, 5.9, 3.3], -150, -90), g1: A("g1", [PX, 5.9, 3.3], 150, -90), g2: A("g2", [PX + 7.6, 5.9, 3.3], 150, -90),
  hSub: A("hSub", [HX2 - 3.5, 1.2, 3], -150, -90),
});
const model = {
  name: "示意 ABF 載板：主機板上的封裝（晶片、凸塊、載板、錫球）、核心板與增層剖面（鑽孔、鍍銅、塞孔、雷射盲孔、填孔、疊孔）、大小對照、層數闖關、翹曲、出貨盒、手機記憶體用的薄載板（示意，非特定廠牌／型號）",
  unit: "示意（1＝1 cm；剖面站另外放大）",
  size: { w: 40, h: 20, r: 0.6, t: 30 },
  palette, materials,
  partNames: { sub: "載板", chip: "晶片", balls: "錫球", mb: "主機板" },
  layers, parts, anchors, actions,
  pose: { yaw0: 0, yawIso: 0, drift: 0 },
  camera: { stand: { d: 60, elev: 24, y: 3 } },
  fx: { dpr: 1, srcPx: 30, shadows: 0, fog: false, dust: false, vaporSprites: false, shimmer: false },
  info: { MBY, SBY0, SBY1, CHY0, BX, BC0, BC1, BF, BL, BN, HOX, VX, DRY, DX, EX, EN, EBAD, FX, FY, FH, FNS, PX, HX2, RS, BLY },
};
const out = path.join(HERE, "model.json");
fs.writeFileSync(out, JSON.stringify(model, null, 1) + "\n");
console.log(`✔ ${out}：${parts.length} 個零件、${parts.reduce((a, p) => a + Math.max(1, (p.at?.length ?? 0)), 0)} 個實體（含複製）、${layers.length} 層`);

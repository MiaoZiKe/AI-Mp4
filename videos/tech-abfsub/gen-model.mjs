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

Object.assign(palette, { pcbC: "#2F6B4A", pcbTraceC: "#C9A24A", coreC: "#E8D9B0", fiberC: "#CDBB88", abfC: "#9CCFB0", srC: "#2E5A44", resinC: "#E9C46A", cuBrightC: "#D9894A", hotC2: "#F28A3C" });
Object.assign(materials, {
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
{ const ys = [0, 0.05, 0.11, 0.16, 0.22, 0.34, 0.4, 0.45, 0.51, SBH]; const mats = ["sr", "abf", "copper", "abf", "core", "abf", "copper", "abf", "sr"];
  for (let k = 0; k < mats.length; k++) BOX(`sbL${k}`, "sub", -SBW / 2, SBW / 2, R2(SBY0 + ys[k]), R2(SBY0 + ys[k + 1]), -SBW / 2, SBW / 2, mats[k]); }
P({ id: "sbPadT", layer: "sub", shape: "cyl", size: [0.07, 0.02], rot: V, pos: [0, R2(SBY1 + 0.01), 0], at: GXZ(18, 14, 0.25, 0.25), mat: "gold" });
BOX("sbMark", "sub", -4.8, -4.2, SBY1, SBY1 + 0.02, 4.2, 4.8, "white");
LAY("chip", [8, 1.2, 0, CHY0 + 0.5]);
P({ id: "chBump", layer: "chip", shape: "sphere", size: [0.06], pos: [0, R2(CHY0 - 0.07), 0], at: GXZ(18, 14, 0.25, 0.25), mat: "bump" });
BOX("chUnderfill", "chip", -2.5, 2.5, SBY1, CHY0, -2.0, 2.0, "liner");
BOX("chDie", "chip", -2.4, 2.4, CHY0, CHY0 + CHH, -1.9, 1.9, "siTop"); BOX("chDieEdge", "chip", -2.45, 2.45, CHY0, CHY0 + 0.06, -1.95, 1.95, "si");
P({ id: "chHbm", layer: "chip", shape: "box", size: [0.9, 0.55, 1.1], pos: [0, R2(CHY0 + 0.275), 0], at: [[-3.3, 0, -1.3], [-3.3, 0, 1.3], [3.3, 0, -1.3], [3.3, 0, 1.3]], mat: "si" });
P({ id: "chHbmLine", layer: "chip", shape: "box", size: [0.92, 0.02, 1.12], pos: [0, CHY0, 0], at: [-3.3, 3.3].flatMap((x) => [-1.3, 1.3].flatMap((z) => [0.12, 0.24, 0.36, 0.48].map((y) => [x, y, z]))), mat: "dark" });
LAY("chipGlow", [5, 0.4, 0, CHY0 + CHH]); BOX("chGlow", "chipGlow", -2.2, 2.2, CHY0 + CHH, CHY0 + CHH + 0.02, -1.7, 1.7, "okGlow");

// ═════ 站 B：剖面（x 60）：核心板（玻纖＋樹脂＋兩面銅箔）、鑽孔、孔壁鍍銅、塞孔、兩面增層（膜、雷射盲孔、填孔銅、線路） ═════
const BX = 60, BW = 22, BD = 3.2, BC0 = 4.0, BC1 = 6.0, BF = 0.16, BL = 0.62, BN = 3, HOX = BX, HR = 0.55;
LAY("bBase", [26, 3.6, BX, 1.6]); BOX("bStand", "bBase", BX - 12, BX + 12, 0, 1.4, -BD / 2 - 0.6, BD / 2 + 0.6, "steel2");
P({ id: "bPost", layer: "bBase", shape: "box", size: [0.6, BC0 - 2 * BF - BN * BL - 1.4 + 0.02, 0.6], pos: [BX, R2((1.4 + BC0 - BF - BN * BL) / 2), 0], at: [[-10, 0, 0], [10, 0, 0]], mat: "dark" });
LAY("bCore", [BW, 2, BX, 5]);
BOX("bCoreL", "bCore", BX - BW / 2, HOX - HR, BC0, BC1, -BD / 2, BD / 2, "core"); BOX("bCoreR", "bCore", HOX + HR, BX + BW / 2, BC0, BC1, -BD / 2, BD / 2, "core");
for (let k = 0; k < 5; k++) { const y = R2(BC0 + 0.25 + k * 0.38);
  BOX(`bFibL${k}`, "bCore", BX - BW / 2, HOX - HR, y, y + 0.12, BD / 2, BD / 2 + 0.02, "fiber"); BOX(`bFibR${k}`, "bCore", HOX + HR, BX + BW / 2, y, y + 0.12, BD / 2, BD / 2 + 0.02, "fiber");
  P({ id: `bFibDot${k}`, layer: "bCore", shape: "cyl", size: [0.08, 0.03], pos: [BX, R2(y + (k % 2 ? 0.25 : 0.06) + 0.02), R2(BD / 2 + 0.015)], at: Array.from({ length: 26 }, (_, i) => [R2(-10.6 + i * 0.84), 0, 0]).filter(([x]) => Math.abs(x) > 0.8), mat: "fiber" }); }
BOX("bCuTL", "bCore", BX - BW / 2, HOX - HR, BC1, BC1 + BF, -BD / 2, BD / 2, "copper"); BOX("bCuTR", "bCore", HOX + HR, BX + BW / 2, BC1, BC1 + BF, -BD / 2, BD / 2, "copper");
BOX("bCuBL", "bCore", BX - BW / 2, HOX - HR, BC0 - BF, BC0, -BD / 2, BD / 2, "copper"); BOX("bCuBR", "bCore", HOX + HR, BX + BW / 2, BC0 - BF, BC0, -BD / 2, BD / 2, "copper");
LAY("bPlug0", [2, 2, HOX, 5]); BOX("bCoreFill", "bPlug0", HOX - HR, HOX + HR, BC0 - BF, BC1 + BF, -BD / 2, BD / 2, "core");     // 鑽孔前：孔的位置還是實心板
LAY("bHoleWall", [2, 2, HOX, 5]); P({ id: "bWall", layer: "bHoleWall", shape: "tube", size: [HR, HR - 0.14, R2(BC1 - BC0 + 2 * BF)], rot: V, pos: [HOX, R2((BC0 + BC1) / 2), 0], mat: "cuBright" });
LAY("bResin", [2, 2, HOX, 5]); VC("bResinC", "bResin", HR - 0.14, BC0 - BF, BC1 + BF, "resin", { x: HOX });
LAY("bCap", [2, 0.2, HOX, BC1 + BF]); BOX("bCapT", "bCap", HOX - HR - 0.3, HOX + HR + 0.3, BC1 + BF, BC1 + BF + 0.08, -BD / 2, BD / 2, "copper"); BOX("bCapB", "bCap", HOX - HR - 0.3, HOX + HR + 0.3, BC0 - BF - 0.08, BC0 - BF, -BD / 2, BD / 2, "copper");
// 鑽針（主軸＋夾頭＋螺旋槽鑽頭）
const DRY = 7.0;
LAY("bDrill", [2, 8, HOX, 11]);
VC("bdBit", "bDrill", 0.48, DRY, DRY + 2.8, "steel2", { x: HOX }); P({ id: "bdFlute", layer: "bDrill", shape: "box", size: [0.98, 0.1, 0.12], pos: [HOX, DRY + 0.3, 0], at: Array.from({ length: 6 }, (_, i) => [0, i * 0.42, 0]), mat: "dark" });
VC("bdTip", "bDrill", 0.2, DRY - 0.25, DRY, "steel", { x: HOX }); VC("bdChuck", "bDrill", 0.9, DRY + 2.8, DRY + 3.6, "dark", { x: HOX }); VC("bdSpindle", "bDrill", 1.3, DRY + 3.6, DRY + 5.2, "panel2", { x: HOX });
BOX("bdMark", "bDrill", HOX - 0.06, HOX + 0.06, DRY + 3.7, DRY + 5.1, 1.3, 1.34, "mark");
// 增層：上下對稱各 BN 層（每層：膜、膜上的線路銅、往下一層的盲孔銅）
const VIA = [[HOX, 0], [HOX + 3.6, 1], [HOX - 4.2, 2]];         // 盲孔 x 位置（第 0 組疊在貫通孔正上方＝疊孔）
for (let k = 0; k < BN; k++) for (const side of ["t", "b"]) {
  const s = side === "t" ? 1 : -1, yA = side === "t" ? R2(BC1 + BF + k * BL) : R2(BC0 - BF - (k + 1) * BL), yB = R2(yA + BL - 0.12);
  LAY(`bF${k}${side}`, [BW, BL, BX, (yA + yB) / 2]); BOX(`bFilm${k}${side}`, `bF${k}${side}`, BX - BW / 2, BX + BW / 2, yA, yB, -BD / 2, BD / 2, "abf");
  LAY(`bV${k}${side}`, [BW, BL, BX, (yA + yB) / 2]);
  const yCu0 = side === "t" ? yB : R2(yA - 0.0), yCu1 = side === "t" ? R2(yB + 0.12) : R2(yA + 0.12);
  // 線路銅（膜的外側一面）：幾段走線＋盲孔頂的焊墊
  const cy0 = side === "t" ? yB : R2(yA - 0.12), cy1 = side === "t" ? R2(yB + 0.12) : yA;
  [[-9.6, -6.6], [-5.6, -2.6], [-1.0, 1.0], [2.6, 5.0], [6.4, 9.8]].forEach(([a, b], i) => BOX(`bTr${k}${side}${i}`, `bV${k}${side}`, R2(BX + a + (k % 2) * 0.4), R2(BX + b + (k % 2) * 0.4), cy0, cy1, -BD / 2, BD / 2, "copper"));
  for (const [vx] of VIA) P({ id: `bVia${k}${side}${vx}`, layer: `bV${k}${side}`, shape: "cyl", size: [0.32, R2(BL - 0.12)], rot: V, pos: [R2(vx + (k % 2) * 0.0), R2((yA + yB) / 2), 0], mat: "cuBright" });
}
// 雷射頭（從上方往下打；示意：兩面各自打孔，畫面只畫上方那一支）
LAY("bLaser", [3, 8, HOX, 14]);
VC("blBody", "bLaser", 1.0, 11.6, 15.4, "panel2", { x: HOX + 3.6 }); VC("blLens", "bLaser", 0.6, 11.2, 11.6, "dark", { x: HOX + 3.6 }); VT("blBand", "bLaser", 1.05, 0.95, 13.6, 13.9, "lampR", { x: HOX + 3.6 });
P({ id: "blBeam", layer: "bLaser", shape: "cone", size: [0.06, 0.45, 3.6], rot: [90, 0, 0], pos: [HOX + 3.6, 9.4, 0], mat: "laser" });

// ═════ 站 D：大小對照（x 120）：一般晶片的小載板 vs 人工智慧晶片的大載板＋10 cm 尺標 ═════
const DX = 120;
LAY("dTable", [30, 1, DX, 0.4]); BOX("dTop", "dTable", DX - 15, DX + 15, 0.6, 0.9, -8, 8, "panel2"); BOX("dLeg", "dTable", DX - 14, DX + 14, 0, 0.6, -7.5, 7.5, "steel2");
LAY("dSmall", [4, 1, DX - 9, 1.5]); BOX("dsSub", "dSmall", DX - 11, DX - 7, 0.9, 1.3, -2, 2, "pcb"); BOX("dsDie", "dSmall", DX - 9.8, DX - 8.2, 1.3, 1.5, -0.8, 0.8, "siTop");
LAY("dBig", [10, 1, DX + 3.5, 1.5]); BOX("dbSub", "dBig", DX - 1.5, DX + 8.5, 0.9, 1.45, -5, 5, "pcb"); BOX("dbSr", "dBig", DX - 1.45, DX + 8.45, 1.45, 1.5, -4.95, 4.95, "sr");
BOX("dbDie", "dBig", DX + 1.0, DX + 6.0, 1.5, 1.8, -2.0, 2.0, "siTop"); P({ id: "dbHbm", layer: "dBig", shape: "box", size: [0.9, 0.55, 1.1], pos: [DX + 3.5, 1.78, 0], at: [[-3.3, 0, -1.4], [-3.3, 0, 1.4], [3.3, 0, -1.4], [3.3, 0, 1.4], [-3.3, 0, 0], [3.3, 0, 0]], mat: "si" });
LAY("dRuler", [10, 0.3, DX + 3.5, 1]); BOX("drBar", "dRuler", DX - 1.5, DX + 8.5, 0.9, 1.0, 5.4, 6.4, "warnY");
for (let i = 0; i <= 10; i++) BOX(`drTick${i}`, "dRuler", R2(DX - 1.5 + i - 0.03), R2(DX - 1.5 + i + 0.03), 1.0, 1.02, 5.4, i % 5 ? 5.8 : 6.2, "dark");

// ═════ 站 E：層數闖關（x 180）：載板側面剖開，二十多層一層層亮綠；其中一層亮紅 → 整片紅、蓋✗ ═════
const EX = 180, EN = 22, ET = 0.32, EY0 = 1.4;
LAY("eBase", [18, 1.4, EX, 0.7]); BOX("ebStand", "eBase", EX - 9, EX + 9, 0, EY0, -3, 3, "steel2");
LAY("eStack", [16, EN * ET, EX, EY0 + EN * ET / 2]);
for (let k = 0; k < EN; k++) { const y0 = R2(EY0 + k * ET), core = k === EN / 2 - 1 || k === EN / 2;
  BOX(`esL${k}`, "eStack", EX - 8, EX + 8, y0, R2(y0 + ET - 0.06), -2.5, 2.5, core ? "core" : "abf"); BOX(`esC${k}`, "eStack", EX - 8, EX + 8, R2(y0 + ET - 0.06), R2(y0 + ET), -2.5, 2.5, "copper"); }
const EBAD = 15;
for (let k = 0; k < EN; k++) { LAY(`eOk${k}`, [16, ET, EX, EY0 + k * ET]); BOX(`eOkB${k}`, `eOk${k}`, EX - 8.02, EX + 8.02, R2(EY0 + k * ET + 0.04), R2(EY0 + (k + 1) * ET - 0.1), 2.5, 2.54, k === EBAD ? "badGlow" : "okGlow"); }
LAY("eFail", [16, EN * ET, EX, EY0 + EN * ET / 2]); BOX("efBox", "eFail", EX - 8.1, EX + 8.1, EY0, R2(EY0 + EN * ET + 0.05), -2.6, 2.6, "hot");
LAY("eX", [3, 3, EX, EY0 + EN * ET + 2]); P({ id: "eXa", layer: "eX", shape: "box", size: [3.2, 0.4, 0.4], pos: [EX, R2(EY0 + EN * ET + 2), 2.6], rot: [0, 0, 45], mat: "badGlow" }); P({ id: "eXb", layer: "eX", shape: "box", size: [3.2, 0.4, 0.4], pos: [EX, R2(EY0 + EN * ET + 2), 2.6], rot: [0, 0, -45], mat: "badGlow" });

// ═════ 站 F：翹曲（x 240）：大載板分段，受熱發橘、兩端往上翹（示意） ═════
const FX = 240, FN = 25, FW = 0.6, FY = 3.0;
LAY("fBase", [18, 3, FX, 1.5]); BOX("ffStand", "fBase", FX - 9, FX + 9, 0, 1.2, -4, 4, "steel2"); P({ id: "ffPin", layer: "fBase", shape: "cyl", size: [0.3, 1.8], rot: V, pos: [FX, 2.1, 0], mat: "dark" });
const FSEG = [];
for (let i = 0; i < FN; i++) { const x = R2((i - (FN - 1) / 2) * FW), id = `fS${i}`; LAY(id, [FW, 0.6, FX + x, FY]);
  BOX(`${id}a`, id, R2(FX + x - FW / 2), R2(FX + x + FW / 2), FY, FY + 0.5, -4, 4, "pcb"); BOX(`${id}b`, id, R2(FX + x - FW / 2), R2(FX + x + FW / 2), FY + 0.5, FY + 0.56, -3.95, 3.95, "sr");
  LAY(`fH${i}`, [FW, 0.6, FX + x, FY]); BOX(`fHot${i}`, `fH${i}`, R2(FX + x - FW / 2 - 0.01), R2(FX + x + FW / 2 + 0.01), FY - 0.01, FY + 0.58, -4.02, 4.02, "hot");
  FSEG.push({ id, h: `fH${i}`, x }); }
LAY("fChip", [5, 0.6, FX, FY + 0.8]); BOX("fcDie", "fChip", FX - 2.2, FX + 2.2, FY + 0.56, FY + 0.86, -1.8, 1.8, "siTop");

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
LAY("hSub", [8, 0.6, HX2, 1.2]); BOX("hsBody", "hSub", HX2 - 4, HX2 + 4, 0.9, 1.2, -3, 3, "pcb"); P({ id: "hsBall", layer: "hSub", shape: "sphere", size: [0.16], pos: [HX2, 0.74, 0], at: GXZ(9, 7, 0.8, 0.8), mat: "bump" });
P({ id: "hsPad", layer: "hSub", shape: "box", size: [0.3, 0.04, 0.3], pos: [HX2, 1.22, 2.4], at: [-2.4, -1.6, -0.8, 0, 0.8, 1.6, 2.4].map((x) => [x, 0, 0]), mat: "gold" });
LAY("hDie", [5, 0.6, HX2, 1.5]); BOX("hdD1", "hDie", HX2 - 2.6, HX2 + 2.6, 1.2, 1.4, -1.8, 1.8, "si"); BOX("hdD2", "hDie", HX2 - 2.2, HX2 + 2.2, 1.4, 1.6, -1.5, 1.5, "siTop");
LAY("hWire", [6, 1, HX2, 2]);
[-2.4, -1.6, -0.8, 0, 0.8, 1.6, 2.4].forEach((x, i) => { const a = [x * 0.8, 1.6, 1.4], c = [x * 0.9, 2.4, 2.0], b = [x, 1.24, 2.4];
  const pts = Array.from({ length: 16 }, (_, k) => { const t = k / 15, u = 1 - t; return [0, 1, 2].map((d) => R2(u * u * a[d] + 2 * u * t * c[d] + t * t * b[d])); });
  P({ id: `hW${i}`, layer: "hWire", shape: "sphere", size: [0.05], pos: [HX2, 0, 0], at: pts, mat: "wire" }); });

// ═════ 動作 ═════
actions.chipGlow = { type: "pulse", _說明: "晶片運作中（示意）", parts: ["chGlow"], color: "okC", glow: 0.9, freq: 1.0, halo: 0 };
actions.drillSpin = { type: "rotate", _說明: "鑽針高速自轉（示意），起轉加速", parts: ["bdBit", "bdFlute", "bdTip", "bdChuck", "bdMark"], axis: [0, 1, 0], pivot: [HOX, 0, 0], rps: 3, rampSpin: true };
actions.drillChips = { type: "flow", _說明: "鑽屑往上排出", layer: "bDrill", path: [[HOX + 0.5, BC1 + 0.2, 1.0], [HOX + 1.6, BC1 + 1.4, 1.4], [HOX + 2.8, BC1 + 0.4, 1.8]], n: 6, size: 0.1, shape: "dot", rate: 0.8, color: "fiberC", track: false, free: true, jitter: 0.2, accel: true };
actions.laserPulse = { type: "pulse", _說明: "雷射脈衝閃動", parts: ["blBeam"], color: "laserC", glow: 1, freq: 4, halo: 0 };
actions.heatGlow = { type: "pulse", parts: FSEG.map((s) => `fHot${s.id.slice(2)}`), color: "hotC2", glow: 0.8, freq: 0.8, halo: 0 };
actions.failPulse = { type: "pulse", parts: ["efBox"], color: "badC", glow: 0.9, freq: 1.2, halo: 0 };
actions.wirePulse = { type: "pulse", parts: Array.from({ length: 7 }, (_, i) => `hW${i}`), color: "wireC", glow: 0.9, freq: 1.0, halo: 0 };

// 標註點
Object.assign(anchors, {
  chip: A("chip", [2.4, CHY0 + CHH, 1.9], 150, -90), sub: A("sub", [-5, SBY0 + 0.3, 5], -150, 100), balls: A("balls", [-4.4, MBY + BR0, 4.4], -150, 100), mb: A("mb", [9, MBY, 8], 150, 100),
  core: A("bCore", [BX - 6, BC0 + 1.0, BD / 2], -150, 100), drill: A("bDrill", [HOX + 0.5, DRY + 2, 0.5], 150, -90), wall: A("bHoleWall", [HOX + HR, BC0 + 0.6, BD / 2], 150, 100), resin: A("bResin", [HOX, BC1, BD / 2], 150, -90),
  filmT: A("bF0t", [BX - 7, BC1 + BF + 0.3, BD / 2], -150, -90), filmB: A("bF0b", [BX - 7, BC0 - BF - 0.3, BD / 2], -150, 100), via: A("bV1t", [HOX + 3.6, BC1 + BF + BL * 1.5, BD / 2], 150, -90), laser: A("bLaser", [HOX + 3.6, 13.0, 1.0], 150, -90),
  dSmall: A("dSmall", [DX - 9, 1.5, 0.8], -150, -90), dBig: A("dBig", [DX + 6, 1.8, 2.0], 150, -90), dRuler: A("dRuler", [DX + 8.5, 1.0, 6.0], 150, 100),
  eStack: A("eStack", [EX - 8, EY0 + 3, 2.5], -150, -90), eBad: A(`eOk${EBAD}`, [EX + 6, EY0 + EBAD * ET + 0.1, 2.54], 150, -90),
  fWarp: A("fS0", [FX - 7.2, FY + 0.5, 4], -150, -90), fChip: A("fChip", [FX + 2.2, FY + 0.86, 1.8], 150, -90),
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
  info: { MBY, SBY0, SBY1, CHY0, BX, BC0, BC1, BF, BL, BN, HOX, DRY, DX, EX, EN, EBAD, FX, FY, FSEG, PX, HX2 },
};
const out = path.join(HERE, "model.json");
fs.writeFileSync(out, JSON.stringify(model, null, 1) + "\n");
console.log(`✔ ${out}：${parts.length} 個零件、${parts.reduce((a, p) => a + Math.max(1, (p.at?.length ?? 0)), 0)} 個實體（含複製）、${layers.length} 層`);

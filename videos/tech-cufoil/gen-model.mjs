// node videos/tech-cufoil/gen-model.mjs → 寫 videos/tech-cufoil/model.json
// 2026/11/27 tech-cufoil（PCB-2：銅箔與玻纖布，系列 3 第 12 集）。構造與物理照 physics-spec.md、模組清單照 visual-spec.md。
// 單位：機台站 1＝約 10 cm；銅箔剖面、粗糙度、玻纖紗為放大示意。地板頂面 y＝0，x 向右、z 向觀眾。站點：
//   H 銅箔基板剖面（x 0；s1）｜E 電解銅箔機（x 34；s2）｜F 銅箔剖面：光面、粗面與銅瘤（x 70；s3）｜R 訊號走銅表面：粗 vs 平（x 104；s4、s5）
//   G 拉絲、捻紗、織布機（x 150；s6）｜W 玻纖效應：紗與空隙（x 192；s7）｜X 開纖＋低介電（x 230；s8）｜K 三家公司（x 268；s9）｜N 疊合熱壓→伺服器主機板（預告 3-13）（x 306；s10）
//   示意：不標粗糙度、介電常數、頻率數字；非特定廠牌／型號。
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
const HERE = path.dirname(new URL(import.meta.url).pathname);

const R2 = (x) => Math.round(x * 1000) / 1000;
const D2R = Math.PI / 180;
let seed = 20261230;
const rnd = () => { seed |= 0; seed = (seed + 0x6d2b79f5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
const palette = {
  floorC: "#C9D2DE", panel: "#F3F5F8", panel2: "#E2E8F0", seam: "#8E9BB0", band: "#24324C", steel: "#7D8CA6", steel2: "#A9B5C7", dark: "#3E4A60",
  glassC: "#BFD3F2", glassD: "#3E5A80", lampY: "#F2B632", lampG: "#2FBF71", lampR: "#E5484D", screen: "#5B8DEF", rubber: "#2B2F36", warnY: "#F2B632",
  waferC: "#6F7FA0", waferD: "#4E5C7A", dieC: "#2B3447", dieTop: "#46536E", bumpC: "#D9DEE6", copper: "#C87533", solder: "#D9DEE6",
  ncfC: "#F4D98A", hotC: "#F2803A", heatC: "#E5602B", ceramic: "#F2EFE8", tapeC: "#6FA8DC", frameC: "#B8C2D2",
  ufC: "#E9B44C", ufD: "#C98F22", glassCar: "#CFE3F2", filmC: "#9ED0B8", ovenC: "#D9DEE6", markC: "#E8613C", yellowBr: "#F2B632",
  subG: "#3E8E5E", subY: "#C8B15A", abfC: "#E8D9A8", camC: "#1E2530", whiteP: "#FFFFFF", edgeC: "#F4FAFF", okC: "#2FBF71", ngC: "#E5484D", sigC: "#5FB4FF",
};
const M = (kind, color, o = {}) => ({ kind, color, ...o });
const glowM = (c, op, ei = 1) => M("std", c, { emissive: c, ei, opacity: op, rough: 1, metal: 0 });
const materials = {
  floor: M("std", "floorC", { rough: 0.7, metal: 0.3, tex: "brushed", texScale: 3 }),
  panel: M("std", "panel", { rough: 0.55, metal: 0.05, env: 0.25 }), panel2: M("std", "panel2", { rough: 0.6, metal: 0.05, env: 0.2 }),
  seam: M("std", "seam", { rough: 0.6, metal: 0.3 }), band: M("std", "band", { rough: 0.4, metal: 0.3, env: 0.4 }),
  steel: M("std", "steel", { rough: 0.35, metal: 0.85, env: 0.5 }), steel2: M("std", "steel2", { rough: 0.3, metal: 0.8, env: 0.6, tex: "brushed", texScale: 2 }),
  dark: M("std", "dark", { rough: 0.5, metal: 0.4, env: 0.3 }), rubber: M("std", "rubber", { rough: 0.9, metal: 0 }),
  window: M("phys", "glassC", { rough: 0.05, metal: 0, clearcoat: 1, opacity: 0.22, env: 0.6 }), glassD: M("std", "glassD", { rough: 0.15, metal: 0.4, env: 0.9 }),
  lampY: M("std", "lampY", { emissive: "lampY", ei: 0.5, rough: 0.4, metal: 0 }), lampG: M("std", "lampG", { emissive: "lampG", ei: 0.6, rough: 0.4, metal: 0 }),
  lampR: M("std", "lampR", { emissive: "lampR", ei: 0.5, rough: 0.4, metal: 0 }), screen: M("std", "screen", { emissive: "screen", ei: 0.5, rough: 0.3, metal: 0 }),
  warnY: M("std", "warnY", { rough: 0.5, metal: 0, emissive: "warnY", ei: 0.2 }),
  wafer: M("std", "waferC", { rough: 0.2, metal: 0.6, env: 0.9 }), waferD: M("std", "waferD", { rough: 0.3, metal: 0.5, env: 0.6 }),
  die: M("std", "dieC", { rough: 0.3, metal: 0.4, env: 0.6 }), dieTop: M("std", "dieTop", { rough: 0.25, metal: 0.5, env: 0.8 }),
  bump: M("std", "bumpC", { rough: 0.25, metal: 0.9, env: 0.9 }), copper: M("std", "cuBright", { rough: 0.35, metal: 0.55, env: 0.4, emissive: "cuBright", ei: 0.06 }),
  ncf: M("std", "ncfC", { rough: 0.5, metal: 0, emissive: "ncfC", ei: 0.1 }), ncfHot: M("std", "#FFC93C", { rough: 0.3, metal: 0, emissive: "#FFC93C", ei: 0.6 }), hot: glowM("hotC", 0.95, 0.9), heat: M("std", "heatC", { rough: 0.4, metal: 0.3, emissive: "heatC", ei: 0.25 }),
  ceramic: M("std", "ceramic", { rough: 0.6, metal: 0, env: 0.2 }), tape: M("phys", "tapeC", { rough: 0.3, metal: 0, clearcoat: 0.5, opacity: 0.85, env: 0.4 }), frame: M("std", "frameC", { rough: 0.3, metal: 0.8, env: 0.6 }),
  uf: M("std", "ufC", { rough: 0.25, metal: 0, env: 0.6, emissive: "ufC", ei: 0.15 }), ufD: M("std", "ufD", { rough: 0.3, metal: 0, env: 0.4 }), ufDot: glowM("ufC", 1, 0.5),
  glassCar: M("phys", "glassCar", { rough: 0.05, metal: 0, clearcoat: 1, opacity: 0.55, env: 0.8 }), film: M("phys", "filmC", { rough: 0.2, metal: 0, clearcoat: 0.6, opacity: 0.75, env: 0.5 }),
  oven: M("std", "ovenC", { rough: 0.4, metal: 0.5, env: 0.5 }), mark: M("std", "markC", { rough: 0.5, metal: 0, emissive: "markC", ei: 0.3 }),
  bracket: M("std", "yellowBr", { rough: 0.5, metal: 0, emissive: "yellowBr", ei: 0.35 }),
  subG: M("std", "subG", { rough: 0.6, metal: 0.1 }), subY: M("std", "subY", { rough: 0.6, metal: 0.1 }), abf: M("std", "abfC", { rough: 0.6, metal: 0, env: 0.2 }),
  cam: M("std", "camC", { rough: 0.3, metal: 0.4, env: 0.5 }), lens: M("phys", "glassC", { rough: 0.02, metal: 0, clearcoat: 1, opacity: 0.7, env: 1.0 }),
  white: M("std", "whiteP", { rough: 0.7, metal: 0 }), edge: glowM("edgeC", 0.95, 0.5), ok: glowM("okC", 0.95, 0.7), ng: glowM("ngC", 0.95, 0.8), sig: glowM("sigC", 1, 0.9),
  ring: glowM("edgeC", 0.9, 0.9),
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
const SPH = (id, layer, r, x, y, z, mat, o = {}) => P({ id, layer, shape: "sphere", size: [r], pos: [x, y, z], mat, ...o });
const A = (layer, p, dx, dy) => ({ layer, p, dx, dy });
const PIPE = (id, layer, pts, r, mat, o = {}) => {
  for (let i = 0; i < pts.length - 1; i++) {
    const [x0, y0, z0] = pts[i], [x1, y1, z1] = pts[i + 1];
    const dx = x1 - x0, dy = y1 - y0, dz = z1 - z0, L = Math.hypot(dx, dy, dz);
    const rot = Math.abs(dx) > 1e-6 ? HX : Math.abs(dy) > 1e-6 ? V : [0, 0, 0];
    P({ id: `${id}${i}`, layer, shape: "cyl", size: [r, R2(L)], rot, pos: [R2((x0 + x1) / 2), R2((y0 + y1) / 2), R2((z0 + z1) / 2)], mat, ...o });
    if (i > 0) SPH(`${id}J${i}`, layer, r * 1.15, x0, y0, z0, mat);
  }
};
const GXZ = (nx, nz, sx, sz, x0, z0, y = 0) => { const o = []; for (let j = 0; j < nz; j++) for (let i = 0; i < nx; i++) o.push([R2(x0 + i * sx), y, R2(z0 + j * sz)]); return o; };
const idsOf = (layer) => parts.filter((q) => q.layer === layer).map((q) => q.id);
// 機台外殼（面板接縫、踢腳、腳座、螢幕、緊急鈕、燈塔、銘牌、百葉）；front＝正面 z
const CAB = (pre, ly, x0, x1, y0, y1, z0, z1, o = {}) => {
  BOX(`${pre}Body`, ly, x0, x1, y0 + 0.3, y1, z0, z1, o.mat ?? "panel");
  BOX(`${pre}Kick`, ly, x0 + 0.05, x1 - 0.05, y0, y0 + 0.3, z0 + 0.05, z1 - 0.05, "band");
  P({ id: `${pre}Foot`, layer: ly, shape: "cyl", size: [0.12, 0.08], rot: V, pos: [0, y0 + 0.04, 0], at: [[x0 + 0.3, 0, z0 + 0.3], [x1 - 0.3, 0, z0 + 0.3], [x0 + 0.3, 0, z1 - 0.3], [x1 - 0.3, 0, z1 - 0.3]], mat: "dark" });
  const n = Math.max(2, Math.round((x1 - x0) / 2.2));
  P({ id: `${pre}Seam`, layer: ly, shape: "box", size: [0.04, R2(y1 - y0 - 0.4), 0.03], pos: [0, R2((y0 + y1) / 2 + 0.15), z1 + 0.01], at: Array.from({ length: n - 1 }, (_, i) => [R2(x0 + ((x1 - x0) * (i + 1)) / n), 0, 0]), mat: "seam" });
  if (o.screen !== false) BOX(`${pre}Screen`, ly, x1 - 1.6, x1 - 0.4, y1 - 1.5, y1 - 0.7, z1, z1 + 0.04, "screen");
  BOX(`${pre}Plate`, ly, x0 + 0.4, x0 + 1.4, y0 + 0.6, y0 + 0.9, z1, z1 + 0.03, "warnY");
  BOX(`${pre}Estop`, ly, x1 - 0.9, x1 - 0.55, y1 - 2.0, y1 - 1.65, z1, z1 + 0.12, "lampR");
  P({ id: `${pre}Vent`, layer: ly, shape: "box", size: [1.2, 0.05, 0.03], pos: [x0 + 1.2, 0, z1 + 0.01], at: Array.from({ length: 5 }, (_, i) => [0, R2(y0 + 1.2 + i * 0.16), 0]), mat: "dark" });
  if (o.tower !== false) { VC(`${pre}Tower`, ly, 0.06, y1, y1 + 0.9, "steel", { x: x1 - 0.4, z: z0 + 0.4 }); SPH(`${pre}TowerG`, ly, 0.11, x1 - 0.4, y1 + 0.95, z0 + 0.4, "lampG"); SPH(`${pre}TowerY`, ly, 0.11, x1 - 0.4, y1 + 1.15, z0 + 0.4, "lampY"); SPH(`${pre}TowerR`, ly, 0.11, x1 - 0.4, y1 + 1.35, z0 + 0.4, "lampR"); }
};

function FRAME3(id, layer, x0, x1, y0, y1, z, t, mat) { BOX(`${id}T`, layer, x0, x1, R2(y1 - t), y1, z, R2(z + t), mat); BOX(`${id}B`, layer, x0, x1, y0, R2(y0 + t), z, R2(z + t), mat); BOX(`${id}L`, layer, x0, R2(x0 + t), y0, y1, z, R2(z + t), mat); BOX(`${id}R`, layer, R2(x1 - t), x1, y0, y1, z, R2(z + t), mat); }

// ═════ 本集額外色票與材質 ═════
Object.assign(palette, {
  resinC: "#E6C27A", glassY: "#EEF2F6", glassLD: "#BFE6D6", liquidC: "#5FA8E8", tiC: "#A3ACB8", anodeC: "#4D5563", cuMatteC: "#A9542A", nodC: "#8A3F1C", cuBright: "#D2692F", warpC: "#DCE6F4", resinV: "#E8B04A",
  fiberC: "#F7FBFF", ionC: "#F2A65A", pregC: "#E9D9A6", boardG: "#2F6B4A", slotC: "#1B1F27", lowC: "#2FBF71", slowC: "#E5484D",
});
Object.assign(materials, {
  resin: M("phys", "resinV", { rough: 0.3, metal: 0, clearcoat: 0.4, opacity: 0.3, env: 0.3 }),
  resinS: M("phys", "resinC", { rough: 0.3, metal: 0, clearcoat: 0.4, opacity: 0.6, env: 0.4 }),
  glassY: M("std", "glassY", { rough: 0.45, metal: 0, env: 0.4 }), warpW: M("std", "warpC", { rough: 0.5, metal: 0, env: 0.3 }), glassLD: M("std", "glassLD", { rough: 0.4, metal: 0, env: 0.4, emissive: "glassLD", ei: 0.15 }),
  liquid: M("phys", "liquidC", { rough: 0.05, metal: 0, clearcoat: 1, opacity: 0.35, env: 0.6 }), titanium: M("std", "tiC", { rough: 0.2, metal: 0.9, env: 0.9, tex: "brushed", texScale: 2 }),
  anode: M("std", "anodeC", { rough: 0.6, metal: 0.5, env: 0.3 }), cuShiny: M("std", "cuBright", { rough: 0.28, metal: 0.55, env: 0.45, emissive: "cuBright", ei: 0.08 }), cuMatte: M("std", "cuMatteC", { rough: 0.75, metal: 0.6, env: 0.3 }),
  nod: M("std", "nodC", { rough: 0.8, metal: 0.5, env: 0.2 }), fiber: glowM("fiberC", 0.95, 0.5), preg: M("std", "pregC", { rough: 0.5, metal: 0, env: 0.3 }),
  board: M("std", "boardG", { rough: 0.55, metal: 0.1, env: 0.3 }), slot: M("std", "slotC", { rough: 0.5, metal: 0.2 }), sigBand: glowM("sigC", 0.35, 0.8),
});

// ═════ 地板 ═════
LAY("floor", [360, 2, 160, 0], true);
P({ id: "floor", layer: "floor", shape: "slab", size: [380, 0.5, 60], r: 0.2, pos: [160, -0.25, 0], mat: "floor" });
P({ id: "floorSeam", layer: "floor", shape: "slab", size: [380, 0.04, 0.1], pos: [160, 0.01, 0], at: Array.from({ length: 9 }, (_, i) => [0, 0, -24 + i * 6]), mat: "seam" });

// 一塊玻纖布（平紋示意）：經紗沿 z、緯紗沿 x，緯紗高低交錯；cx,yc,cz 中心，hw,hd 半寬半深，pitch 間距，r 紗半徑
const CLOTH = (pre, ly, cx, yc, cz, hw, hd, pitch, r, mat = "glassY") => {
  const nx = Math.floor((2 * hw) / pitch), nz = Math.floor((2 * hd) / pitch);
  // 平紋：交點 (i,j) 上，(i+j) 偶數＝經紗在上、緯紗在下；奇數相反。每段長一個 pitch，在交點之間上下換邊
  const up = [], dn = [], wu = [], wd = [];
  for (let i = 0; i < nx; i++) for (let j = 0; j < nz; j++) { const x = R2(-hw + pitch / 2 + i * pitch), z = R2(-hd + pitch / 2 + j * pitch);
    ((i + j) % 2 === 0 ? up : dn).push([x, 0, z]); ((i + j) % 2 === 0 ? wd : wu).push([x, 0, z]); }
  P({ id: `${pre}WpU`, layer: ly, shape: "cyl", size: [r, R2(pitch * 0.98)], pos: [cx, R2(yc + r * 0.55), cz], at: up, mat });
  P({ id: `${pre}WpD`, layer: ly, shape: "cyl", size: [r, R2(pitch * 0.98)], pos: [cx, R2(yc - r * 0.55), cz], at: dn, mat });
  P({ id: `${pre}WfU`, layer: ly, shape: "cyl", size: [r * 0.92, R2(pitch * 0.98)], rot: HX, pos: [cx, R2(yc + r * 0.55), cz], at: wu, mat: "warpW" });
  P({ id: `${pre}WfD`, layer: ly, shape: "cyl", size: [r * 0.92, R2(pitch * 0.98)], rot: HX, pos: [cx, R2(yc - r * 0.55), cz], at: wd, mat: "warpW" });
};

// ═════ 站 H：銅箔基板剖面（s1）：上下銅箔＋兩層玻纖布浸樹脂；上層銅箔掀起一角 ═════
const HX0 = 0, HB = 0.7;
LAY("hStand", [13, 0.8, HX0, 0.35]);
BOX("hsBase", "hStand", HX0 - 6.2, HX0 + 6.2, 0, HB - 0.1, -4.2, 4.2, "band"); BOX("hsTop", "hStand", HX0 - 6.2, HX0 + 6.2, HB - 0.1, HB, -4.2, 4.2, "steel2");
BOX("hsPlate", "hStand", HX0 - 5.8, HX0 - 3.8, 0.15, 0.45, 4.2, 4.23, "warnY");
LAY("hBoard", [10.4, 1.6, HX0, 1.4]);
BOX("hCuB", "hBoard", HX0 - 5, HX0 + 5, HB, HB + 0.15, -3.4, 3.4, "cuShiny");
BOX("hResin", "hBoard", HX0 - 5, HX0 + 5, HB + 0.15, HB + 1.35, -3.4, 3.4, "resin");
CLOTH("hC1", "hBoard", HX0, HB + 0.5, 0, 4.9, 3.3, 0.42, 0.08); CLOTH("hC2", "hBoard", HX0, HB + 1.0, 0, 4.9, 3.3, 0.42, 0.08);
LAY("hCuTop", [10.4, 0.4, HX0, HB + 1.45]);
BOX("hCuT", "hCuTop", HX0 - 5, HX0 + 5, HB + 1.35, HB + 1.5, -3.4, 1.4, "cuShiny"); BOX("hCuT2", "hCuTop", HX0 - 5, HX0 + 2, HB + 1.35, HB + 1.5, 1.4, 3.4, "cuShiny");
LAY("hCuFlap", [3, 0.4, HX0 + 3.5, HB + 1.45]); BOX("hCuFlapB", "hCuFlap", HX0 + 2, HX0 + 5, HB + 1.35, HB + 1.5, 1.4, 3.4, "cuShiny");
P({ id: "hCuFlapNod", layer: "hCuFlap", shape: "sphere", size: [0.05], pos: [HX0, HB + 1.34, 0], at: GXZ(7, 5, 0.42, 0.42, 2.2, 1.6), mat: "nod" });
BOX("hCuBEdge", "hBoard", HX0 - 5, HX0 + 5, HB - 0.02, HB + 0.15, 3.4, 3.43, "cuShiny");
P({ id: "hCuTNod", layer: "hCuTop", shape: "sphere", size: [0.05], pos: [HX0, HB + 1.34, 0], at: GXZ(24, 16, 0.42, 0.42, -4.8, -3.2), mat: "nod" });
const HTOP = HB + 1.5;

// ═════ 站 E：電解銅箔機（s2）：電解槽＋藥水＋鈦滾筒（陰極）＋弧形陽極＋銅箔剝離→導輥→收卷；整流器 ═════
const EX = 34, ECY = 4.6, ER = 3.0, EAR = 3.7, ELQ = 4.0, ETW = 4.3;   // 液面 4.0：滾筒下半泡在藥水裡
LAY("eTank", [9, 4.4, EX, 2.2]);
BOX("etBase", "eTank", EX - 4.6, EX + 4.6, 0, 0.4, -3.2, 3.2, "band");
BOX("etBot", "eTank", EX - 4.4, EX + 4.4, 0.4, 0.6, -3.0, 3.0, "steel2"); BOX("etBack", "eTank", EX - 4.4, EX + 4.4, 0.6, ETW, -3.0, -2.8, "steel2");
BOX("etL", "eTank", EX - 4.4, EX - 4.2, 0.6, ETW, -3.0, 3.0, "steel2"); BOX("etR", "eTank", EX + 4.2, EX + 4.4, 0.6, ETW, -3.0, 3.0, "steel2");
LAY("eTankF", [8.8, 3.8, EX, 2.4]); BOX("etFront", "eTankF", EX - 4.2, EX + 4.2, 0.6, ETW, 2.8, 2.86, "window"); FRAME3("etFr", "eTankF", EX - 4.4, EX + 4.4, 0.6, ETW, 2.86, 0.1, "steel2");
// 出液管＋閥門手輪（右下前）、溢流口（右壁上緣）、液位計（左前玻璃管＋刻度）
PIPE("etOut", "eTank", [[EX + 4.4, 0.9, 2.2], [EX + 5.6, 0.9, 2.2], [EX + 5.6, 0.3, 2.2]], 0.16, "steel");
ZC("etValve", "eTank", 0.22, 2.1, 2.5, EX + 5.0, 0.9, "dark"); P({ id: "etWheel", layer: "eTank", shape: "cyl", size: [0.32, 0.05], rot: V, pos: [EX + 5.0, 1.25, 2.3], mat: "lampR" });
P({ id: "etWheelSp", layer: "eTank", shape: "box", size: [0.6, 0.04, 0.05], pos: [EX + 5.0, 1.26, 2.3], at: [[0, 0, 0]], rot: [0, 45, 0], mat: "lampR" }); VC("etStem", "eTank", 0.05, 0.9, 1.25, "steel", { x: EX + 5.0, z: 2.3 });
BOX("etOver", "eTank", EX + 4.4, EX + 5.0, ETW - 0.5, ETW - 0.2, -1.0, 1.0, "steel2"); PIPE("etOverP", "eTank", [[EX + 4.9, ETW - 0.5, 0], [EX + 4.9, 0.3, 0]], 0.12, "steel");
VC("etGauge", "eTank", 0.09, 0.8, ETW, "window", { x: EX - 4.0, z: 3.05 }); VC("etGaugeL", "eTank", 0.07, 0.8, ELQ, "liquid", { x: EX - 4.0, z: 3.05 });
P({ id: "etGaugeT", layer: "eTank", shape: "box", size: [0.16, 0.025, 0.03], pos: [EX - 3.82, 0, 3.05], at: Array.from({ length: 8 }, (_, i) => [0, R2(1.0 + i * 0.42), 0]), mat: "dark" });
BOX("etLiq", "eTank", EX - 4.2, EX + 4.2, 0.6, ELQ, -2.8, 2.8, "liquid"); BOX("etLiqTop", "eTank", EX - 4.2, EX + 4.2, ELQ - 0.02, ELQ, -2.8, 2.8, "liquid");
PIPE("etFeed", "eTank", [[EX - 3.6, 0.9, -3.8], [EX - 3.6, 0.9, -2.9]], 0.18, "steel"); PIPE("etFeedV", "eTank", [[EX - 3.6, 0.9, -3.8], [EX - 3.6, 3.8, -3.8]], 0.18, "steel");
// 弧形陽極（滾筒下方，泡在藥水裡）
LAY("eAnodeL", [7, 2, EX, 1.6]);
for (let k = 0; k < 9; k++) { const a = (218 + k * 13) * D2R, x = EX + EAR * Math.cos(a), y = ECY + EAR * Math.sin(a);
  P({ id: `eAn${k}`, layer: "eAnodeL", shape: "box", size: [0.88, 0.14, 4.6], pos: [R2(x), R2(y), 0], rot: [0, 0, R2((a / D2R) + 90)], mat: "anode" }); }
// 滾筒（陰極，鈦）＋端蓋＋軸＋軸承座＋馬達
LAY("eDrum", [6.4, 6.4, EX, ECY]);
ZC("edDrum", "eDrum", ER, -2.4, 2.4, EX, ECY, "titanium"); ZC("edCapF", "eDrum", ER + 0.08, 2.4, 2.52, EX, ECY, "dark"); ZC("edCapB", "eDrum", ER + 0.08, -2.52, -2.4, EX, ECY, "dark");
P({ id: "edMark", layer: "eDrum", shape: "box", size: [0.06, 0.06, 4.8], pos: [EX, ECY, 0], at: Array.from({ length: 12 }, (_, i) => { const a = i * 30 * D2R; return [R2((ER + 0.01) * Math.cos(a)), R2((ER + 0.01) * Math.sin(a)), 0]; }), mat: "dark" });
// 端蓋：外圈螺栓＋內圈導電環（陰極接點），沒有輻條
P({ id: "edBolt", layer: "eDrum", shape: "cyl", size: [0.09, 0.06], pos: [EX, ECY, 2.55], at: Array.from({ length: 16 }, (_, i) => { const a = i * 22.5 * D2R; return [R2((ER - 0.35) * Math.cos(a)), R2((ER - 0.35) * Math.sin(a)), 0]; }), mat: "steel2" });
ZC("edHub", "eDrum", 0.9, 2.52, 2.6, EX, ECY, "copper"); ZC("edHubIn", "eDrum", 0.5, 2.6, 2.66, EX, ECY, "steel2");
ZC("edShaft", "eDrum", 0.35, -3.8, 3.0, EX, ECY, "steel");
LAY("eFrame", [10, 6, EX, 3.5]);
BOX("efPostB", "eFrame", EX - 0.5, EX + 0.5, 0, ECY - 0.4, -3.9, -3.3, "panel2"); BOX("efBrgB", "eFrame", EX - 0.7, EX + 0.7, ECY - 0.6, ECY + 0.6, -3.9, -3.3, "dark");
BOX("efBrgF", "eFrame", EX - 0.5, EX + 0.5, ECY - 0.5, ECY + 0.5, 3.0, 3.6, "dark");
BOX("efMotor", "eFrame", EX - 0.8, EX + 0.8, ECY - 0.8, ECY + 0.8, -5.0, -3.9, "dark"); BOX("efMotorL", "eFrame", EX - 0.3, EX + 0.3, ECY + 0.8, ECY + 1.0, -4.8, -4.1, "lampG");
// 從藥水出來到頂端這一段：銅一路長在滾筒上（左上半圈，滾筒順時針轉）
LAY("eCuArc", [3.5, 4.5, EX - 2, ECY + 1.5]);
// 液面出來（約 192°）到頂端（90°）：銅在藥水裡長厚，出液面後厚度不變（示意放大），半徑大過端蓋，正面看得到
for (let k = 0; k < 9; k++) { const a = (90 + 8 + k * 12) * D2R, t = 0.16; P({ id: `eArc${k}`, layer: "eCuArc", shape: "box", size: [0.7, t, 5.0], pos: [R2(EX + (ER + 0.09 + t / 2) * Math.cos(a)), R2(ECY + (ER + 0.09 + t / 2) * Math.sin(a)), 0], rot: [0, 0, R2(a / D2R + 90)], mat: "cuShiny" }); }
// 剝下來的銅箔：滾筒頂端 → 導輥 → 收卷
const EGX = EX + 4.6, EGY = ECY + ER - 0.35, EWX = EX + 6.4, EWY = 2.6, EWR = 1.2;
LAY("eFoil", [8, 5, EX + 4, ECY + 1]);
BOX("efoTop", "eFoil", EX, EGX, ECY + ER + 0.12, ECY + ER + 0.2, -2.3, 2.3, "cuShiny");
ZC("efoGuide", "eFoil", 0.35, -2.6, 2.6, EGX, EGY, "steel2");
BOX("efoDown", "eFoil", EGX + 0.33, EGX + 0.37, EWY, EGY, -2.3, 2.3, "cuShiny");
ZC("efoRoll", "eFoil", EWR, -2.3, 2.3, EGX + 0.35 + EWR, EWY, "copper"); ZC("efoCore", "eFoil", 0.3, -2.8, 2.8, EGX + 0.35 + EWR, EWY, "steel");
P({ id: "efoRollMark", layer: "eFoil", shape: "box", size: [0.05, 0.05, 4.7], pos: [EGX + 0.35 + EWR, EWY, 0], at: [0, 90, 180, 270].map((d) => [R2((EWR + 0.01) * Math.cos(d * D2R)), R2((EWR + 0.01) * Math.sin(d * D2R)), 0]), mat: "nod" });
BOX("efoStand", "eFoil", EGX + 0.35 + EWR - 0.25, EGX + 0.35 + EWR + 0.25, 0, EWY, -3.0, -2.6, "panel2"); BOX("efoStand2", "eFoil", EGX + 0.35 + EWR - 0.25, EGX + 0.35 + EWR + 0.25, 0, EWY, 2.6, 3.0, "panel2");
BOX("efoGuideP", "eFoil", EGX - 0.2, EGX + 0.2, 3.2, EGY, -3.0, -2.6, "panel2");
// 整流器（直流電）：左邊機櫃＋兩條電纜（接陽極、接滾筒軸）
LAY("eRect", [3.4, 5, EX - 7, 2.5]); CAB("er", "eRect", EX - 8.4, EX - 5.6, 0, 4.6, -1.8, 1.8, { tower: false });
PIPE("erCblA", "eRect", [[EX - 5.6, 1.2, 0.6], [EX - 4.4, 1.2, 0.6]], 0.1, "rubber"); PIPE("erCblK", "eRect", [[EX - 5.6, 3.8, -0.6], [EX - 4.2, 3.8, -0.6], [EX - 4.2, 3.8, -3.6], [EX - 0.6, 3.8, -3.6]], 0.1, "rubber");

// ═════ 站 F：銅箔剖面（s3）：底下是滾筒一角；光面（貼滾筒）平、粗面凹凸＋小銅瘤；樹脂壓下來咬住 ═════
const FX = 70, FB = 2.0, FT = 3.3, FW = 3.6;   // r2：剖面縮短（7.2）加厚（1.3），撐滿 3D 窗
LAY("fDrum", [12, 2, FX, 1]); ZC("fdDrum", "fDrum", 3.0, -2.6, 2.6, FX - 1.0, FB - 3.0, "titanium");
P({ id: "fdMark", layer: "fDrum", shape: "box", size: [0.05, 0.05, 5.3], pos: [FX - 1.0, FB - 3.0, 0], at: Array.from({ length: 10 }, (_, i) => { const a = (50 + i * 8.9) * D2R; return [R2(3.01 * Math.cos(a)), R2(3.01 * Math.sin(a)), 0]; }), mat: "dark" });
LAY("fFoil", [FW * 2 + 0.4, 1.6, FX, (FB + FT) / 2]);
BOX("ffBody", "fFoil", FX - FW, FX + FW, FB, FT, -2.4, 2.4, "cuShiny");
BOX("ffShiny", "fFoil", FX - FW, FX + FW, FB - 0.01, FB, -2.4, 2.4, "cuShiny");
for (let g = 0; g < 3; g++) { const h = [0.12, 0.2, 0.28][g]; const pts = []; for (let i = 0; i < 110; i++) pts.push([R2(-FW + 0.15 + rnd() * (2 * FW - 0.3)), 0, R2(-2.0 + rnd() * 4.0)]);
  P({ id: `ffBump${g}`, layer: "fFoil", shape: "sphere", size: [R2(0.16 + h * 0.6)], pos: [FX, R2(FT - 0.04), 0], at: pts, mat: "cuMatte" }); }
// 正面剖面的瘤狀輪廓（高低不一）
{ const pts = []; for (let i = 0; i < 30; i++) pts.push([R2(-FW + 0.12 + i * ((2 * FW - 0.24) / 29)), R2([0, 0.1, 0.03, 0.14, 0.05, 0.09][i % 6]), 0]);
  P({ id: "ffProfile", layer: "fFoil", shape: "sphere", size: [0.24], pos: [FX, FT - 0.02, 2.16], at: pts, mat: "cuMatte" }); }
LAY("fNod", [FW * 2, 0.7, FX, FT + 0.4]);
for (let g = 0; g < 3; g++) { const pts = []; for (let i = 0; i < 100; i++) pts.push([R2(-FW + 0.2 + rnd() * (2 * FW - 0.4)), R2(rnd() * 0.16), R2(-2.2 + rnd() * 4.4)]); P({ id: `fnN${g}`, layer: "fNod", shape: "sphere", size: [[0.09, 0.12, 0.15][g]], pos: [FX, FT + 0.34, 0], at: pts, mat: "nod" }); }
LAY("fResin", [FW * 2 + 0.4, 1.4, FX, FT + 1.0]);
BOX("frBody", "fResin", FX - FW, FX + FW, FT + 0.22, FT + 1.5, -2.4, 2.4, "resinS");
P({ id: "frTooth", layer: "fResin", shape: "box", size: [0.16, 0.26, 4.6], pos: [FX, FT + 0.14, 0], at: Array.from({ length: 21 }, (_, i) => [R2(-FW + 0.2 + i * 0.34), 0, 0]), mat: "resinS" });
BOX("fStand", "fDrum", FX - 4.4, FX + 4.4, 0, 0.3, -3.4, 3.4, "band");

// ═════ 站 R：訊號走在銅表面（s4 粗、s5 平）：展示架（背板刻度＋底座＋兩端夾具）＋上：一般銅箔（粗面瘤狀）＋下：低粗糙度銅箔（樹脂黏住） ═════
// r2：銅箔條加厚（1.1）、縮短（8）、粗面改高低不一的瘤狀（大瘤上再長小瘤）；兩片上下靠近（間距 0.45＜片厚）；展示架開回來
const RX = 104, RL = 3.4, RRB = 3.4, RRT = 5.0, RSB = 1.0, RST = 2.6, RZF = 0.6, RPZ = 0.8;
LAY("rFrame", [8.4, 6.6, RX, 3.3], true);   // 展示架當背景層（不算主素材中心）
BOX("rfBack", "rFrame", RX - 4.2, RX + 4.2, 0.6, 6.6, -1.0, -0.8, "panel2"); BOX("rfBase", "rFrame", RX - 4.4, RX + 4.4, 0, 0.6, -1.3, 1.3, "band");
BOX("rfBaseTop", "rFrame", RX - 4.3, RX + 4.3, 0.6, 0.66, -1.2, 1.2, "steel2");
P({ id: "rfTick", layer: "rFrame", shape: "box", size: [0.04, 0.3, 0.02], pos: [0, 0.82, -0.79], at: Array.from({ length: 15 }, (_, i) => [R2(RX - 3.5 + i * 0.5), 0, 0]), mat: "seam" });
P({ id: "rfTickT", layer: "rFrame", shape: "box", size: [0.04, 0.3, 0.02], pos: [0, 6.38, -0.79], at: Array.from({ length: 15 }, (_, i) => [R2(RX - 3.5 + i * 0.5), 0, 0]), mat: "seam" });
BOX("rfDivider", "rFrame", RX - 4.2, RX + 4.2, 3.24, 3.3, -0.8, -0.76, "seam");
// 兩端立柱＋夾具（每片兩個夾頭、旋鈕）
P({ id: "rfPost", layer: "rFrame", shape: "box", size: [0.3, 5.6, 0.3], pos: [0, 3.4, 0], at: [[RX - 3.95, 0, 0], [RX + 3.95, 0, 0]], mat: "steel" });
for (const [yb, yt, k] of [[RRB, RRT, "U"], [RSB, RST, "L"]]) {
  P({ id: `rfClamp${k}`, layer: "rFrame", shape: "box", size: [0.5, R2(yt - yb + 0.3), 1.4], pos: [0, R2((yb + yt) / 2), 0], at: [[RX - 3.45, 0, 0], [RX + 3.45, 0, 0]], mat: "dark" });
  P({ id: `rfKnob${k}`, layer: "rFrame", shape: "cyl", size: [0.16, 0.2], pos: [0, R2((yb + yt) / 2), 0.8], at: [[RX - 3.45, 0, 0], [RX + 3.45, 0, 0]], mat: "lampR" }); }
// 粗面：高低不一的大瘤＋大瘤上的小瘤（三排沿深度），正面輪廓 RPROF 給訊號路徑與表面亮帶
const RNOD = []; { let x = RX - 2.85; while (x < RX + 2.85) { const r = R2(0.2 + rnd() * 0.25), h = R2(0.08 + rnd() * 0.45); RNOD.push([R2(x), r, h]); x += r * (1.1 + rnd() * 0.6); } }
const rTop = (x) => { let y = RRT + 0.08; for (const [xc, r, h] of RNOD) { const cy = RRT + h - r * 0.35; for (const [dx, dy, rr] of [[0, 0, r], [-0.5 * r, 0.75 * r, 0.42 * r], [0.45 * r, 0.75 * r, 0.36 * r]]) { const d = x - xc - dx; if (Math.abs(d) < rr) y = Math.max(y, cy + dy + Math.sqrt(rr * rr - d * d)); } } return y; };
LAY("rRough", [6.4, 2.6, RX, RRB + 1.1]);
BOX("rrBase", "rRough", RX - RL + 0.4, RX + RL - 0.4, RRB, RRT, -RZF, RZF, "copper");
BOX("rrCap", "rRough", RX - RL + 0.4, RX + RL - 0.4, RRT - 0.02, RRT + 0.08, -RZF, RZF, "cuMatte");
// 半徑分組（每組一個零件，用 at 複製）：每 0.025 一組
const SPHS = (pre, ly, pts, mat) => { const g = {}; for (const [x, y, z, r] of pts) { const k = R2(Math.round(r / 0.025) * 0.025); (g[k] ??= []).push([x, y, z]); }
  Object.entries(g).forEach(([r, at], i) => P({ id: `${pre}${i}`, layer: ly, shape: "sphere", size: [Number(r)], pos: [0, 0, 0], at, mat })); };
SPHS("rrNod", "rRough", [[0.22, 1], [-0.05, 0.9], [-0.34, 0.8]].flatMap(([z, k]) => RNOD.map(([xc, r, h]) => [R2(xc + (rnd() - 0.5) * 0.1), R2(RRT + h - r * 0.35), z, r * k])), "cuMatte");
SPHS("rrNodS", "rRough", RNOD.flatMap(([xc, r, h]) => [[-0.5, 0.42], [0.45, 0.36]].map(([f, k]) => [R2(xc + f * r), R2(RRT + h - r * 0.35 + r * 0.75), R2(0.12 + f * 0.1), r * k])), "nod");
const RPROF = []; for (let x = RX - 2.8; x <= RX + 2.8 + 1e-6; x += 0.05) RPROF.push([R2(x), R2(rTop(x) + 0.04), RPZ]);
LAY("rSkin", [6.4, 1, RX, RRT + 0.3]);
P({ id: "rsBand", layer: "rSkin", shape: "sphere", size: [0.05], pos: [0, 0, 0], at: RPROF.map(([x, y, z]) => [x, R2(y - 0.06), z]), mat: "sigBand" });
LAY("rSmooth", [6.4, 1.6, RX, RSB + 0.8]);
BOX("rsBase", "rSmooth", RX - RL + 0.4, RX + RL - 0.4, RSB, RST, -RZF, RZF, "cuShiny");
P({ id: "rsNod", layer: "rSmooth", shape: "sphere", size: [0.05], pos: [RX, RST + 0.02, 0], at: GXZ(38, 4, 0.15, 0.3, -2.8, -0.45), mat: "nod" });
LAY("rGlue", [4.8, 0.8, RX - 0.8, RST + 0.35]);
BOX("rgResin", "rGlue", RX - RL + 0.4, RX + 1.4, RST, RST + 0.6, -0.65, 0.65, "resinS");
LAY("rGlueEdge", [1.6, 0.8, RX + 2.2, RST + 0.35]); BOX("rgEdge", "rGlueEdge", RX + 1.4, RX + RL - 0.4, RST, RST + 0.6, -0.65, 0.65, "resinS");

// ═════ 站 G：拉絲 → 捻紗 → 織布（s6） ═════
const GX = 150, GSX = GX - 5.2, GBY = 7.0, GSY = 4.4;
LAY("gFurn", [5, 3.4, GSX, 8.2]);
BOX("gfBody", "gFurn", GSX - 2.0, GSX + 2.0, GBY + 0.2, GBY + 2.6, -1.5, 1.5, "oven"); BOX("gfStripe", "gFurn", GSX - 2.0, GSX + 2.0, GBY + 2.2, GBY + 2.3, 1.5, 1.53, "warnY");
BOX("gfBush", "gFurn", GSX - 1.3, GSX + 1.3, GBY, GBY + 0.2, -0.6, 0.6, "hot");
P({ id: "gfTip", layer: "gFurn", shape: "cyl", size: [0.05, 0.12], rot: V, pos: [GSX, GBY - 0.06, 0], at: GXZ(10, 3, 0.26, 0.4, -1.17, -0.4), mat: "heat" });
P({ id: "gfLeg", layer: "gFurn", shape: "box", size: [0.3, GBY + 0.2, 0.3], pos: [0, R2((GBY + 0.2) / 2), 0], at: [[GSX - 1.8, 0, -1.3], [GSX + 1.8, 0, -1.3]], mat: "panel2" });
// r2 熔爐配件：投料口（料斗）、電極接頭＋電纜、冷卻水管（藍）、漏板下塗油輥＋油盤
BOX("gfHop", "gFurn", GSX - 0.6, GSX + 0.6, GBY + 2.6, GBY + 3.0, -0.5, 0.5, "steel2"); BOX("gfHopT", "gFurn", GSX - 0.9, GSX + 0.9, GBY + 3.0, GBY + 3.4, -0.8, 0.8, "steel2"); BOX("gfHopIn", "gFurn", GSX - 0.75, GSX + 0.75, GBY + 3.38, GBY + 3.42, -0.65, 0.65, "dark");
P({ id: "gfElec", layer: "gFurn", shape: "box", size: [0.4, 0.5, 0.5], pos: [0, GBY + 0.3, 0], at: [[GSX - 1.55, 0, 0], [GSX + 1.55, 0, 0]], mat: "copper" });
PIPE("gfCabL", "gFurn", [[GSX - 1.75, GBY + 0.3, 0], [GSX - 2.6, GBY + 0.3, 0], [GSX - 2.6, 0.2, 0]], 0.1, "rubber"); PIPE("gfCabR", "gFurn", [[GSX + 1.75, GBY + 0.3, 0], [GSX + 2.5, GBY + 0.3, 0], [GSX + 2.5, GBY + 1.6, 0]], 0.1, "rubber");
P({ id: "gfWater", layer: "gFurn", shape: "cyl", size: [0.07, 2.8], rot: HX, pos: [GSX, GBY - 0.02, 0], at: [[0, 0, 0.75], [0, 0, -0.75]], mat: "screen" });
PIPE("gfWaterIn", "gFurn", [[GSX + 1.4, GBY - 0.02, 0.75], [GSX + 2.1, GBY - 0.02, 0.75], [GSX + 2.1, 0.2, 0.75]], 0.07, "screen");
HXC("gfOil", "gFurn", 0.22, GSX - 0.9, GSX + 0.9, GSY + 1.1, 0.45, "rubber"); BOX("gfOilPan", "gFurn", GSX - 1.0, GSX + 1.0, GSY + 0.78, GSY + 0.92, 0.25, 0.85, "steel2");
P({ id: "gfOilArm", layer: "gFurn", shape: "box", size: [0.12, 2.0, 0.12], pos: [0, GSY + 1.9, 0.55], at: [[GSX - 1.05, 0, 0], [GSX + 1.05, 0, 0]], mat: "steel" });
LAY("gFil", [3, 3, GSX, (GBY + GSY) / 2]);
for (let j = 0; j < 3; j++) for (let i = 0; i < 10; i++) { const x = GSX - 1.17 + i * 0.26, z = -0.4 + j * 0.4, dx = x - GSX, dy = GBY - 0.12 - GSY, L = Math.hypot(dx, dy);
  P({ id: `gfF${j}_${i}`, layer: "gFil", shape: "box", size: [0.022, R2(L), 0.022], pos: [R2((x + GSX) / 2), R2((GBY - 0.12 + GSY) / 2), R2(z * 0.5)], rot: [0, 0, R2(-Math.asin(dx / L) / D2R)], mat: "fiber" }); }
LAY("gWind", [4, 4.4, GSX, 2.4]);
VC("gwShoe", "gWind", 0.22, GSY - 0.3, GSY, "steel", { x: GSX, z: 0 }); BOX("gwStrand", "gWind", GSX - 0.03, GSX + 0.03, 2.9, GSY - 0.3, -0.03, 0.03, "fiber");
CAB("gw", "gWind", GSX - 1.8, GSX + 1.8, 0, 1.4, -1.4, 1.4, { tower: false, screen: false });
ZC("gwBob", "gWind", 0.9, -1.2, 1.2, GSX, 2.3, "glassY"); ZC("gwBobCore", "gWind", 0.28, -1.4, 1.4, GSX, 2.3, "steel");
P({ id: "gwBobLine", layer: "gWind", shape: "box", size: [0.04, 0.04, 2.42], pos: [GSX, 2.3, 0], at: [0, 60, 120, 180, 240, 300].map((d) => [R2(0.91 * Math.cos(d * D2R)), R2(0.91 * Math.sin(d * D2R)), 0]), mat: "seam" });
// 捻紗：一排小紗管（直立）轉動
LAY("gTwist", [4, 2, GX - 1.4, 1.6]);
BOX("gtRail", "gTwist", GX - 2.9, GX + 0.1, 0.9, 1.1, 1.0, 2.0, "panel2");
P({ id: "gtLeg", layer: "gTwist", shape: "box", size: [0.2, 0.9, 0.2], pos: [0, 0.45, 1.5], at: [[GX - 2.7, 0, 0], [GX - 0.1, 0, 0]], mat: "steel" });
for (let i = 0; i < 4; i++) { const x = GX - 2.4 + i * 0.7; VC(`gtBob${i}`, "gTwist", 0.24, 1.1, 2.3, "glassY", { x, z: 1.5 }); VC(`gtSp${i}`, "gTwist", 0.06, 2.3, 2.7, "steel", { x, z: 1.5 }); P({ id: `gtLn${i}`, layer: "gTwist", shape: "box", size: [0.03, 1.1, 0.03], pos: [x + 0.245, 1.7, 1.5], mat: "seam" }); }
// r2 三站用紗連起來：收絲筒 → 捻紗架（第一個紗管）…（最後一個紗管）→ 織布機經軸
const GYARN = [[GSX + 0.9, 2.3, 0.3], [GX - 2.4, 2.7, 1.5]], GYARN2 = [[GX - 0.3, 2.7, 1.5], [GX + 0.2, 3.2, -1.2], [GX + 1.0, 2.45, -3.0]];
LAY("gYarn", [9, 2, GX - 2, 2.6]);
for (const [k, pts] of [["a", GYARN], ["b", GYARN2]]) for (let i = 0; i < pts.length - 1; i++) { const [x0, y0, z0] = pts[i], [x1, y1, z1] = pts[i + 1], L = Math.hypot(x1 - x0, y1 - y0, z1 - z0);
  const yaw = Math.atan2(x1 - x0, z1 - z0) / D2R, pit = -Math.asin((y1 - y0) / L) / D2R;
  P({ id: `gy${k}${i}`, layer: "gYarn", shape: "box", size: [0.035, 0.035, R2(L)], pos: [R2((x0 + x1) / 2), R2((y0 + y1) / 2), R2((z0 + z1) / 2)], rot: [R2(pit), R2(yaw), 0], mat: "fiber" }); }
P({ id: "gyBar", layer: "gYarn", shape: "box", size: [2.1, 0.03, 0.03], pos: [GX - 1.35, 2.7, 1.5], mat: "fiber" });
// 織布機：經紗從後方經軸拉到前方；綜框（兩組）上下開口；緯紗夾（劍桿）左右穿；筘往前打緊；織好的布捲在前方布軸
const LX0 = GX + 0.8, LX1 = GX + 7.2, LCX = (LX0 + LX1) / 2, LWY = 2.6;
LAY("gLoom", [7, 4, LCX, 2]);
P({ id: "glPost", layer: "gLoom", shape: "box", size: [0.3, 3.8, 0.3], pos: [0, 1.9, 0], at: [[LX0 - 0.4, 0, -3.4], [LX1 + 0.4, 0, -3.4], [LX0 - 0.4, 0, 3.4], [LX1 + 0.4, 0, 3.4]], mat: "panel2" });
BOX("glBeamTop", "gLoom", LX0 - 0.55, LX1 + 0.55, 3.8, 4.1, -3.5, -3.1, "panel2"); BOX("glSideL", "gLoom", LX0 - 0.55, LX0 - 0.25, 1.2, 1.5, -3.4, 3.4, "panel2"); BOX("glSideR", "gLoom", LX1 + 0.25, LX1 + 0.55, 1.2, 1.5, -3.4, 3.4, "panel2");
// r2 上部機架：加高立柱、前後頂樑、多臂開口裝置（左上）、吊綜帶、右柱操作盤＋燈塔
P({ id: "glPostHi", layer: "gLoom", shape: "box", size: [0.3, 2.0, 0.3], pos: [0, 4.8, 0], at: [[LX0 - 0.4, 0, -3.4], [LX1 + 0.4, 0, -3.4], [LX0 - 0.4, 0, -0.4], [LX1 + 0.4, 0, -0.4]], mat: "panel2" });
BOX("glTopB", "gLoom", LX0 - 0.55, LX1 + 0.55, 5.6, 6.0, -3.6, -3.2, "panel2"); BOX("glTopF", "gLoom", LX0 - 0.55, LX1 + 0.55, 5.6, 6.0, -0.6, -0.2, "panel2");
P({ id: "glTopX", layer: "gLoom", shape: "box", size: [0.3, 0.3, 3.4], pos: [0, 5.8, -1.9], at: [[LX0 - 0.4, 0, 0], [LX1 + 0.4, 0, 0], [LCX, 0, 0]], mat: "panel2" });
BOX("glDobby", "gLoom", LX0 - 1.4, LX0 + 0.4, 4.2, 5.6, -1.8, -0.2, "dark"); BOX("glDobbyCap", "gLoom", LX0 - 1.5, LX0 + 0.5, 5.6, 5.75, -1.9, -0.1, "band");
P({ id: "glDobbyLev", layer: "gLoom", shape: "box", size: [1.6, 0.06, 0.08], pos: [LX0 - 0.5, 0, -0.15], at: Array.from({ length: 6 }, (_, i) => [0, R2(4.4 + i * 0.2), 0]), mat: "steel2" });
P({ id: "glStrap", layer: "gLoom", shape: "box", size: [0.05, 2.3, 0.05], pos: [0, 4.4, 0], at: [LX0 + 0.6, LCX, LX1 - 0.6].flatMap((x) => [[x, 0, -0.95], [x, 0, -0.55]]), mat: "rubber" });
BOX("glPanel", "gLoom", LX1 + 0.6, LX1 + 1.5, 3.4, 4.8, -0.6, 0.2, "panel"); BOX("glPanelScr", "gLoom", LX1 + 0.7, LX1 + 1.4, 4.0, 4.6, 0.2, 0.24, "screen");
P({ id: "glPanelBtn", layer: "gLoom", shape: "cyl", size: [0.07, 0.06], pos: [0, 3.7, 0.23], at: [[LX1 + 0.8, 0, 0], [LX1 + 1.05, 0, 0], [LX1 + 1.3, 0, 0]], mat: "lampG" });
VC("glTower", "gLoom", 0.06, 6.0, 6.7, "steel", { x: LX1 + 0.4, z: -0.4 }); SPH("glTowerG", "gLoom", 0.11, LX1 + 0.4, 6.75, -0.4, "lampG"); SPH("glTowerY", "gLoom", 0.11, LX1 + 0.4, 6.95, -0.4, "lampY");
HXC("glWarpBeam", "gLoom", 0.55, LX0, LX1, 1.9, -3.0, "glassY"); HXC("glWarpCore", "gLoom", 0.15, LX0 - 0.3, LX1 + 0.3, 1.9, -3.0, "steel");
HXC("glClothBeam", "gLoom", 0.5, LX0, LX1, 1.9, 3.0, "glassY"); HXC("glClothCore", "gLoom", 0.15, LX0 - 0.3, LX1 + 0.3, 1.9, 3.0, "steel");
P({ id: "glClothMark", layer: "gLoom", shape: "box", size: [6.4, 0.04, 0.04], pos: [LCX, 1.9, 3.0], at: [0, 90, 180, 270].map((d) => [0, R2(0.51 * Math.sin(d * D2R)), R2(0.51 * Math.cos(d * D2R))]), mat: "seam" });
const WXS = Array.from({ length: 30 }, (_, i) => R2(LX0 + 0.1 + i * 0.21));
LAY("gWarpA", [6.4, 0.6, LCX, LWY]); LAY("gWarpB", [6.4, 0.6, LCX, LWY]);
P({ id: "gwaT", layer: "gWarpA", shape: "box", size: [0.04, 0.04, 3.4], pos: [0, LWY, -1.5], at: WXS.filter((_, i) => i % 2 === 0).map((x) => [x, 0, 0]), mat: "fiber" });
P({ id: "gwbT", layer: "gWarpB", shape: "box", size: [0.04, 0.04, 3.4], pos: [0, LWY, -1.5], at: WXS.filter((_, i) => i % 2 === 1).map((x) => [x, 0, 0]), mat: "fiber" });
BOX("gHedA", "gWarpA", LX0 - 0.2, LX1 + 0.2, LWY + 0.5, LWY + 0.6, -1.0, -0.9, "steel"); BOX("gHedA2", "gWarpA", LX0 - 0.2, LX1 + 0.2, LWY - 0.6, LWY - 0.5, -1.0, -0.9, "steel");
BOX("gHedB", "gWarpB", LX0 - 0.2, LX1 + 0.2, LWY + 0.5, LWY + 0.6, -0.6, -0.5, "steel"); BOX("gHedB2", "gWarpB", LX0 - 0.2, LX1 + 0.2, LWY - 0.6, LWY - 0.5, -0.6, -0.5, "steel");
for (const [ly, z] of [["gWarpA", -0.95], ["gWarpB", -0.55]]) { P({ id: `${ly}Fr`, layer: ly, shape: "box", size: [0.08, 1.3, 0.08], pos: [0, LWY, z], at: [[LX0 - 0.2, 0, 0], [LX1 + 0.2, 0, 0]], mat: "steel" });
  P({ id: `${ly}Hd`, layer: ly, shape: "box", size: [0.015, 1.1, 0.015], pos: [0, LWY, z], at: WXS.filter((_, i) => i % 2 === (ly === "gWarpA" ? 0 : 1)).map((x) => [x, 0, 0]), mat: "steel2" }); }
LAY("gReed", [6.6, 1.2, LCX, LWY]);
BOX("grTop", "gReed", LX0 - 0.3, LX1 + 0.3, LWY + 0.5, LWY + 0.6, 0.15, 0.3, "dark"); BOX("grBot", "gReed", LX0 - 0.3, LX1 + 0.3, LWY - 0.6, LWY - 0.5, 0.15, 0.3, "dark");
P({ id: "grWire", layer: "gReed", shape: "box", size: [0.025, 1.0, 0.04], pos: [0, LWY, 0.22], at: WXS.map((x) => [R2(x + 0.1), 0, 0]), mat: "steel2" });
LAY("gRapier", [1, 0.4, LX0 - 0.6, LWY]); BOX("gRap", "gRapier", LX0 - 1.0, LX0 - 0.2, LWY - 0.06, LWY + 0.06, 0.4, 0.6, "warnY"); BOX("gRapTail", "gRapier", LX0 - 1.0, LX0 - 0.2, LWY - 0.02, LWY + 0.02, 0.46, 0.54, "fiber"); BOX("gRapWeft", "gRapier", LX0 - 4.0, LX0 - 1.0, LWY - 0.02, LWY + 0.02, 0.48, 0.52, "fiber"); BOX("gRapRod", "gRapier", LX0 - 4.2, LX0 - 1.0, LWY - 0.05, LWY + 0.05, 0.6, 0.7, "steel");
LAY("gCloth", [6.4, 0.3, LCX, LWY]);
BOX("gcSheet", "gCloth", LX0 + 0.05, LX1 - 0.05, LWY - 0.03, LWY + 0.01, 0.7, 2.6, "glassY");
P({ id: "gcWeftA", layer: "gCloth", shape: "box", size: [6.3, 0.04, 0.06], pos: [LCX, LWY + 0.03, 0], at: Array.from({ length: 10 }, (_, j) => [0, 0, R2(0.8 + j * 0.2)]), mat: "seam" });
P({ id: "gcWarpL", layer: "gCloth", shape: "box", size: [0.03, 0.02, 1.9], pos: [0, LWY + 0.02, 1.65], at: WXS.map((x) => [x, 0, 0]), mat: "fiber" });

// ═════ 站 W：玻纖效應（s7）：放大的一塊板：樹脂裡的紗束（緯紗粗、中間有空隙）；上面一對訊號線：一條在紗上、一條在空隙上 ═════
const WX0 = 192, WB = 1.0, WT = 3.4, WYC = 2.1, WR = 0.42, WZS = [-2.4, -0.8, 0.8, 2.4], TZA = 0.8, TZB = 0.0;
const LAMINA = (pre, cx, round = true) => {
  LAY(`${pre}Base`, [13, 1, cx, 0.5]); BOX(`${pre}bPl`, `${pre}Base`, cx - 6.6, cx + 6.6, 0, WB, -3.4, 3.4, "band");
  LAY(`${pre}Resin`, [12.4, 2.6, cx, (WB + WT) / 2]); BOX(`${pre}rBody`, `${pre}Resin`, cx - 6.2, cx + 6.2, WB, WT, -3.1, 3.1, "resin");
  LAY(`${pre}Trace`, [12.4, 0.3, cx, WT + 0.08]);
  BOX(`${pre}tA`, `${pre}Trace`, cx - 6.2, cx + 6.2, WT, WT + 0.14, TZA - 0.16, TZA + 0.16, "copper"); BOX(`${pre}tB`, `${pre}Trace`, cx - 6.2, cx + 6.2, WT, WT + 0.14, TZB - 0.16, TZB + 0.16, "copper");
  P({ id: `${pre}tPad`, layer: `${pre}Trace`, shape: "box", size: [0.4, 0.16, 0.4], pos: [0, WT + 0.08, 0], at: [[cx - 6.0, 0, TZA], [cx - 6.0, 0, TZB], [cx + 6.0, 0, TZA], [cx + 6.0, 0, TZB]], mat: "copper" });
  P({ id: `${pre}LampA`, layer: `${pre}Trace`, shape: "sphere", size: [0.24], pos: [cx + 5.2, WT + 0.45, TZA], mat: "steel2" }); P({ id: `${pre}LampB`, layer: `${pre}Trace`, shape: "sphere", size: [0.24], pos: [cx + 5.2, WT + 0.45, TZB], mat: "steel2" });
  P({ id: `${pre}tChipL`, layer: `${pre}Trace`, shape: "box", size: [0.8, 0.35, 1.6], pos: [cx - 6.6, WT + 0.18, 0.4], mat: "dark" }); P({ id: `${pre}tChipR`, layer: `${pre}Trace`, shape: "box", size: [0.8, 0.35, 1.6], pos: [cx + 6.6, WT + 0.18, 0.4], mat: "dark" });
};
LAMINA("w", WX0);
LAY("wYarn", [12.4, 1.2, WX0, WYC]);
P({ id: "wyWeft", layer: "wYarn", shape: "cyl", size: [WR, 12.3], rot: HX, pos: [WX0, WYC + 0.12, 0], at: WZS.map((z) => [0, 0, z]), mat: "glassY" });
P({ id: "wyWeftF", layer: "wYarn", shape: "cyl", size: [0.05, 12.32], rot: HX, pos: [WX0, WYC + 0.12, 0], at: WZS.flatMap((z) => [-0.3, -0.12, 0.08, 0.26].map((dy) => [0, dy, R2(z + dy * 0.4)])), mat: "seam" });
P({ id: "wyWarp", layer: "wYarn", shape: "cyl", size: [0.3, 5.9], pos: [WX0, WYC - 0.5, 0], at: Array.from({ length: 8 }, (_, i) => [R2(-5.25 + i * 1.5), 0, 0]), mat: "glassY" });
LAY("wGap", [12.4, 0.3, WX0, WT - 0.05]); BOX("wgMark", "wGap", WX0 - 6.2, WX0 + 6.2, WT - 0.02, WT, TZB - 0.3, TZB + 0.3, "sigBand");

// ═════ 站 X：開纖＋低介電（s8）：同一塊板；圓紗束 → 攤平（空隙變小）→ 換低介電玻璃 ═════
const XX = 230;
LAMINA("x", XX);
LAY("xRound", [12.4, 1.2, XX, WYC]);
P({ id: "xrWeft", layer: "xRound", shape: "cyl", size: [WR, 12.3], rot: HX, pos: [XX, WYC + 0.12, 0], at: WZS.map((z) => [0, 0, z]), mat: "glassY" });
P({ id: "xrWarp", layer: "xRound", shape: "cyl", size: [0.3, 5.9], pos: [XX, WYC - 0.5, 0], at: Array.from({ length: 8 }, (_, i) => [R2(-5.25 + i * 1.5), 0, 0]), mat: "glassY" });
const XWX = Array.from({ length: 8 }, (_, i) => R2(-5.25 + i * 1.5));
const FLAT = (ly, mat) => { LAY(ly, [12.4, 1, XX, WYC]);
  P({ id: `${ly}Weft`, layer: ly, shape: "slab", size: [12.3, 0.3, 1.5], r: 0.1, pos: [XX, WYC + 0.12, 0], at: WZS.map((z) => [0, 0, z]), mat });
  // r2：扁帶上保留纖維細紋（每條 9 道），經紗在交點一上一下（上的那段蓋在緯紗上，紋路沿 z）
  P({ id: `${ly}WeftF`, layer: ly, shape: "box", size: [12.32, 0.02, 0.025], pos: [XX, WYC + 0.28, 0], at: WZS.flatMap((z) => [-0.64, -0.48, -0.32, -0.16, 0, 0.16, 0.32, 0.48, 0.64].map((d) => [0, 0, R2(z + d)])), mat: "seam" });
  P({ id: `${ly}Warp`, layer: ly, shape: "slab", size: [1.3, 0.22, 6.0], r: 0.08, pos: [XX, WYC - 0.2, 0], at: XWX.map((x) => [x, 0, 0]), mat });
  const over = []; XWX.forEach((x, i) => WZS.forEach((z, j) => { if ((i + j) % 2 === 0) over.push([x, z]); }));
  P({ id: `${ly}WarpUp`, layer: ly, shape: "slab", size: [1.3, 0.1, 1.56], r: 0.04, pos: [XX, WYC + 0.32, 0], at: over.map(([x, z]) => [x, 0, z]), mat });
  P({ id: `${ly}WarpUpF`, layer: ly, shape: "box", size: [0.025, 0.02, 1.56], pos: [XX, WYC + 0.38, 0], at: over.flatMap(([x, z]) => [-0.48, -0.24, 0, 0.24, 0.48].map((d) => [R2(x + d), 0, z])), mat: "seam" }); };
// r2：圓→扁的中間兩個狀態（逐步壓扁，接成約 18 幀的連續動作）
[["xMid0", 0.32, 0.95, 0.27], ["xMid1", 0.22, 1.25, 0.24]].forEach(([ly, hh, ww, wr]) => { LAY(ly, [12.4, 1, XX, WYC]);
  P({ id: `${ly}Weft`, layer: ly, shape: "slab", size: [12.3, R2(hh * 2), ww], r: R2(hh * 0.9), pos: [XX, WYC + 0.12, 0], at: WZS.map((z) => [0, 0, z]), mat: "glassY" });
  P({ id: `${ly}Warp`, layer: ly, shape: "slab", size: [R2(ww * 0.85), R2(wr * 1.6), 5.9], r: R2(wr * 0.7), pos: [XX, WYC - 0.45, 0], at: XWX.map((x) => [x, 0, 0]), mat: "glassY" }); });
FLAT("xFlat", "glassY"); FLAT("xFlatLD", "glassLD");

// ═════ 站 K：三家公司（s9）＋文字名牌 ═════
const KX = 268;
{ const r = spawnSync("node", [path.join(HERE, "..", "..", "scripts", "three", "make-brand-tex.mjs"), "tech-cufoil", "text:cotech=金居|8358", "text:tglass=台玻|1802", "text:fulltech=富喬|1815"], { encoding: "utf8" }); if (r.status !== 0) { console.error(r.stderr); process.exit(1); } }
const SIGNM = JSON.parse(fs.readFileSync(path.join(HERE, "..", "..", "public", "tex", "brand", "meta.json"), "utf8"));
LAY("kBase", [18, 1, KX, 0.4]); BOX("kbPl", "kBase", KX - 9, KX + 9, 0, 0.8, -3.6, 3.6, "band"); BOX("kbTop", "kBase", KX - 9, KX + 9, 0.8, 0.9, -3.6, 3.6, "panel2");
[["cotech", -5.2], ["tglass", 0], ["fulltech", 5.2]].forEach(([sid, dx], i) => { const x = KX + dx, ly = `kMod${i}`;
  LAY(ly, [5, 7, x, 3.4]);
  // 三座外觀各不同（r2）：金居＝分條收卷機＋拉出一段銅箔（看得到瘤面刻線）；台玻＝布捲架＋驗布燈台上拉出一段平紋布；富喬＝紗架（多個紗管）＋低介電布捲
  if (i === 0) {
    P({ id: "k0Side", layer: ly, shape: "box", size: [0.3, 4.4, 2.6], pos: [0, 3.1, -0.4], at: [[x - 2.05, 0, 0], [x + 2.05, 0, 0]], mat: "panel2" });
    P({ id: "k0SideSeam", layer: ly, shape: "box", size: [0.32, 0.04, 2.62], pos: [0, 0, -0.4], at: [[x - 2.05, 2.2, 0], [x + 2.05, 2.2, 0], [x - 2.05, 4.0, 0], [x + 2.05, 4.0, 0]], mat: "seam" });
    HXC("k0Roll", ly, 1.0, x - 1.75, x + 1.75, 4.2, -0.5, "copper"); HXC("k0Core", ly, 0.24, x - 2.25, x + 2.25, 4.2, -0.5, "steel");
    P({ id: "k0Mark", layer: ly, shape: "box", size: [3.52, 0.04, 0.04], pos: [x, 4.2, -0.5], at: [0, 90, 180, 270].map((d) => [0, R2(1.01 * Math.sin(d * D2R)), R2(1.01 * Math.cos(d * D2R))]), mat: "nod" });
    HXC("k0Knife", ly, 0.06, x - 1.7, x + 1.7, 2.9, 0.75, "steel"); P({ id: "k0Blade", layer: ly, shape: "cyl", size: [0.26, 0.04], rot: HX, pos: [0, 2.9, 0.75], at: [-1.2, -0.4, 0.4, 1.2].map((d) => [R2(x + d), 0, 0]), mat: "steel2" });
    HXC("k0Guide", ly, 0.22, x - 1.8, x + 1.8, 1.78, 0.85, "steel2");
    BOX("k0Drop", ly, x - 1.6, x + 1.6, 1.8, 4.2, 0.5, 0.54, "cuShiny");
    BOX("k0Table", ly, x - 1.9, x + 1.9, 0.9, 1.5, 0.9, 3.4, "panel"); BOX("k0TableE", ly, x - 1.9, x + 1.9, 1.5, 1.56, 0.9, 3.4, "band");
    BOX("k0Sheet", ly, x - 1.6, x + 1.6, 1.56, 1.6, 0.9, 3.3, "cuMatte");
    P({ id: "k0Line", layer: ly, shape: "box", size: [3.2, 0.03, 0.04], pos: [x, 1.61, 0], at: Array.from({ length: 9 }, (_, j) => [0, 0, R2(1.05 + j * 0.27)]), mat: "nod" });
    P({ id: "k0Nod", layer: ly, shape: "sphere", size: [0.045], pos: [x, 1.61, 0], at: GXZ(16, 8, 0.2, 0.27, -1.5, 1.18), mat: "nod" });
    BOX("k0Motor", ly, x + 2.2, x + 2.9, 3.7, 4.7, -1.0, 0.0, "dark"); BOX("k0Ctrl", ly, x - 2.9, x - 2.2, 1.0, 2.8, -0.2, 0.6, "panel2"); BOX("k0Scr", ly, x - 2.92, x - 2.88, 2.0, 2.6, -0.1, 0.5, "screen");
  }
  if (i === 1) {
    for (const sx of [-1, 1]) { const px = x + sx * 2.0; P({ id: `k1Leg${sx > 0 ? "R" : "L"}`, layer: ly, shape: "box", size: [0.22, 4.0, 0.22], pos: [px, 2.75, -0.6], at: [[0, 0, -0.55], [0, 0, 0.55]], rot: [0, 0, 0], mat: "steel" });
      BOX(`k1Brace${sx > 0 ? "R" : "L"}`, ly, px - 0.1, px + 0.1, 2.2, 2.35, -1.2, 0.0, "steel"); BOX(`k1Cradle${sx > 0 ? "R" : "L"}`, ly, px - 0.18, px + 0.18, 4.3, 4.8, -1.0, -0.2, "dark"); }
    HXC("k1Roll", ly, 1.1, x - 1.75, x + 1.75, 4.6, -0.6, "glassY"); HXC("k1Core", ly, 0.24, x - 2.2, x + 2.2, 4.6, -0.6, "steel");
    P({ id: "k1RollL", layer: ly, shape: "box", size: [3.52, 0.03, 0.03], pos: [x, 4.6, -0.6], at: Array.from({ length: 8 }, (_, j) => { const d = j * 45 * D2R; return [0, R2(1.11 * Math.sin(d)), R2(1.11 * Math.cos(d))]; }), mat: "seam" });
    BOX("k1Drop", ly, x - 1.6, x + 1.6, 1.75, 4.6, 0.5, 0.53, "glassY");
    P({ id: "k1DropW", layer: ly, shape: "box", size: [3.2, 0.03, 0.02], pos: [x, 0, 0.54], at: Array.from({ length: 13 }, (_, j) => [0, R2(1.9 + j * 0.2), 0]), mat: "seam" });
    P({ id: "k1DropV", layer: ly, shape: "box", size: [0.03, 2.85, 0.02], pos: [0, 3.17, 0.54], at: Array.from({ length: 15 }, (_, j) => [R2(x - 1.5 + j * 0.215), 0, 0]), mat: "seam" });
    BOX("k1Light", ly, x - 1.9, x + 1.9, 0.9, 1.5, 0.6, 3.4, "panel"); BOX("k1LightTop", ly, x - 1.8, x + 1.8, 1.5, 1.56, 0.7, 3.3, "edge");
    CLOTH("k1C", ly, x, 1.66, 2.0, 1.55, 1.25, 0.22, 0.05);
  }
  if (i === 2) {
    P({ id: "k2Post", layer: ly, shape: "box", size: [0.2, 4.6, 0.2], pos: [0, 3.2, -0.9], at: [[x - 2.2, 0, 0], [x - 0.2, 0, 0]], mat: "steel" });
    P({ id: "k2Bar", layer: ly, shape: "box", size: [2.2, 0.1, 1.0], pos: [x - 1.2, 0, -0.6], at: [1.4, 2.5, 3.6, 4.7].map((y) => [0, y, 0]), mat: "steel" });
    const pegs = [1.45, 2.55, 3.65, 4.75].flatMap((y) => [-1.85, -1.2, -0.55].map((d) => [R2(x + d), y]));
    P({ id: "k2Bob", layer: ly, shape: "cyl", size: [0.26, 0.7], rot: V, pos: [0, 0.35, -0.6], at: pegs.map(([px, y]) => [px, y, 0]), mat: "glassY" });
    P({ id: "k2BobL", layer: ly, shape: "cyl", size: [0.27, 0.04], rot: V, pos: [0, 0, -0.6], at: pegs.flatMap(([px, y]) => [[px, R2(y + 0.2), 0], [px, R2(y + 0.45), 0]]), mat: "seam" });
    P({ id: "k2Peg", layer: ly, shape: "cyl", size: [0.05, 0.25], rot: V, pos: [0, 0.82, -0.6], at: pegs.map(([px, y]) => [px, y, 0]), mat: "steel2" });
    P({ id: "k2Yarn", layer: ly, shape: "box", size: [0.02, 0.02, 2.2], pos: [0, 0.72, 0.5], at: pegs.map(([px, y]) => [px, y, 0]), mat: "fiber" });
    P({ id: "k2Eye", layer: ly, shape: "box", size: [0.08, 4.3, 0.08], pos: [0, 3.45, 1.6], at: [[x - 2.2, 0, 0], [x - 0.2, 0, 0]], mat: "steel2" }); P({ id: "k2EyeR", layer: ly, shape: "box", size: [2.0, 0.05, 0.05], pos: [x - 1.2, 0.72, 1.6], at: [1.45, 2.55, 3.65, 4.75].map((y) => [0, y, 0]), mat: "steel2" });
    P({ id: "k2EyeH", layer: ly, shape: "box", size: [0.12, 0.12, 0.12], pos: [0, 0.72, 1.68], at: pegs.map(([px, y]) => [px, y, 0]), mat: "dark" });
    P({ id: "k2Stand", layer: ly, shape: "box", size: [0.2, 2.6, 0.2], pos: [0, 2.2, -0.2], at: [[x + 0.15, 0, 0], [x + 2.25, 0, 0]], mat: "steel" });
    HXC("k2Roll", ly, 0.8, x + 0.3, x + 2.1, 3.5, -0.2, "glassLD"); HXC("k2Core", ly, 0.18, x + 0.05, x + 2.35, 3.5, -0.2, "steel");
    BOX("k2Drop", ly, x + 0.35, x + 2.05, 1.6, 3.5, 0.6, 0.63, "glassLD");
    BOX("k2Table", ly, x + 0.1, x + 2.3, 0.9, 1.5, 0.7, 3.4, "panel"); BOX("k2Sheet", ly, x + 0.3, x + 2.1, 1.5, 1.54, 0.7, 3.3, "glassLD");
    CLOTH("k2C", ly, x + 1.2, 1.6, 2.05, 0.85, 1.2, 0.2, 0.045, "glassLD");
  }
  const sg = SIGNM[`sign-${sid}`], sw = 3.6; P({ id: `k${i}Sign`, layer: ly, shape: "plane", size: [sw, R2(sw / sg.aspect)], pos: [x, 0.45, 3.62], uv01: true, shadow: false, mat: `t_${sid}` });
  materials[`t_${sid}`] = { kind: "unlit", color: "#FFFFFF", img: `tex/brand/sign-${sid}.png` }; });

// ═════ 站 N：疊合熱壓（s10）：下壓板＋銅箔＋三張膠片（玻纖布浸樹脂）＋銅箔，上壓板壓下 → 右邊：伺服器主機板（預告 3-13，板邊看得到多層） ═════
const NX = 306, NPX = NX - 3.4, NPB = 1.2;
LAY("nPress", [6, 8, NPX, 4]);
BOX("npLow", "nPress", NPX - 2.6, NPX + 2.6, 0, NPB, -2.4, 2.4, "steel"); BOX("npLowHot", "nPress", NPX - 2.5, NPX + 2.5, NPB - 0.12, NPB, -2.3, 2.3, "heat");
P({ id: "npCol", layer: "nPress", shape: "cyl", size: [0.2, 7.6], rot: V, pos: [0, 3.8, 0], at: [[NPX - 2.4, 0, -2.2], [NPX + 2.4, 0, -2.2], [NPX - 2.4, 0, 2.2], [NPX + 2.4, 0, 2.2]], mat: "steel2" });
BOX("npCross", "nPress", NPX - 2.8, NPX + 2.8, 7.4, 8.0, -2.5, 2.5, "panel2"); VC("npRam", "nPress", 0.5, 6.0, 7.4, "steel2", { x: NPX, z: 0 });
// r2 液壓缸（橫樑上）＋油管＋油壓泵浦箱（右後）＋操作盤（左前立柱：螢幕、按鈕、急停）
VC("npCyl", "nPress", 0.95, 8.0, 9.4, "steel2", { x: NPX, z: 0 }); VC("npCylCap", "nPress", 1.1, 9.4, 9.6, "dark", { x: NPX, z: 0 }); VC("npCylBand", "nPress", 1.0, 8.5, 8.6, "dark", { x: NPX, z: 0 });
P({ id: "npCylBolt", layer: "nPress", shape: "cyl", size: [0.08, 0.1], rot: V, pos: [NPX, 9.65, 0], at: Array.from({ length: 8 }, (_, i) => { const a = i * 45 * D2R; return [R2(0.85 * Math.cos(a)), 0, R2(0.85 * Math.sin(a))]; }), mat: "steel" });
BOX("npPump", "nPress", NPX + 3.0, NPX + 4.4, 0, 2.2, -2.2, -0.6, "band"); BOX("npPumpM", "nPress", NPX + 3.2, NPX + 4.2, 2.2, 3.0, -1.9, -0.9, "dark"); BOX("npPumpG", "nPress", NPX + 3.3, NPX + 3.7, 1.2, 1.6, -0.6, -0.56, "screen");
PIPE("npHoseA", "nPress", [[NPX + 0.95, 9.0, -0.3], [NPX + 3.5, 9.0, -0.3], [NPX + 3.5, 3.0, -0.3], [NPX + 3.5, 3.0, -1.0]], 0.09, "rubber");
PIPE("npHoseB", "nPress", [[NPX + 0.95, 8.3, -0.6], [NPX + 3.9, 8.3, -0.6], [NPX + 3.9, 3.0, -0.6], [NPX + 3.9, 3.0, -1.2]], 0.09, "rubber");
BOX("npPanPost", "nPress", NPX - 3.5, NPX - 3.2, 0, 3.4, 1.6, 1.9, "steel"); BOX("npPanel", "nPress", NPX - 4.0, NPX - 2.7, 3.4, 4.8, 1.4, 2.0, "panel");
BOX("npPanScr", "nPress", NPX - 3.85, NPX - 2.85, 4.0, 4.6, 2.0, 2.04, "screen");
P({ id: "npPanBtn", layer: "nPress", shape: "cyl", size: [0.08, 0.06], pos: [0, 3.7, 2.03], at: [[NPX - 3.7, 0, 0], [NPX - 3.45, 0, 0], [NPX - 3.2, 0, 0]], mat: "lampG" }); BOX("npPanStop", "nPress", NPX - 3.05, NPX - 2.85, 3.6, 3.8, 2.0, 2.1, "lampR");
LAY("nTop", [5.2, 1.2, NPX, 5.6]); BOX("ntPlate", "nTop", NPX - 2.6, NPX + 2.6, 5.0, 5.9, -2.4, 2.4, "steel"); BOX("ntHot", "nTop", NPX - 2.5, NPX + 2.5, 5.0, 5.12, -2.3, 2.3, "heat"); VC("ntRod", "nTop", 0.35, 5.9, 6.6, "steel", { x: NPX, z: 0 });
const NL = [["cuShiny", 0.1], ["preg", 0.3], ["preg", 0.3], ["preg", 0.3], ["cuShiny", 0.1]]; let ny = NPB; const NLY = [];
NL.forEach(([m, t], i) => { LAY(`nL${i}`, [4.6, 0.5, NPX, ny + t / 2]); BOX(`nl${i}`, `nL${i}`, NPX - 2.2, NPX + 2.2, ny, R2(ny + t), -2.0, 2.0, m);
  if (m === "preg") P({ id: `nl${i}W`, layer: `nL${i}`, shape: "box", size: [4.4, 0.02, 0.04], pos: [NPX, R2(ny + t + 0.005), 0], at: Array.from({ length: 13 }, (_, j) => [0, 0, R2(-1.8 + j * 0.3)]), mat: "seam" });
  NLY.push(ny); ny = R2(ny + t); });
const NSTOP = ny;
const MBX = NX + 5.6, MBY = 0.55, MBZ = 1.8;   // r2：主機板加厚（看得到板邊多層）、往前移
LAY("nMb", [8, 1.5, MBX, MBY + 0.6]);
P({ id: "nmBoardG", layer: "nMb", shape: "box", size: [9.0, R2(MBY - 0.05), 7.0], pos: [MBX, R2((MBY + 0.05) / 2), MBZ], mat: "board" }); BOX("nmBoard", "nMb", MBX - 4.5, MBX + 4.5, MBY - 0.03, MBY, MBZ - 3.5, MBZ + 3.5, "board");
for (const dz of [-1.3, 1.3]) { BOX(`nmSock${dz > 0 ? 1 : 0}`, "nMb", MBX - 2.6, MBX - 1.2, MBY, MBY + 0.18, MBZ + dz - 0.7, MBZ + dz + 0.7, "slot"); BOX(`nmLid${dz > 0 ? 1 : 0}`, "nMb", MBX - 2.45, MBX - 1.35, MBY + 0.18, MBY + 0.3, MBZ + dz - 0.55, MBZ + dz + 0.55, "steel2"); }
P({ id: "nmDimm", layer: "nMb", shape: "box", size: [0.08, 0.3, 1.3], pos: [0, MBY + 0.15, MBZ], at: [-0.6, -0.4, -0.2, 0, 0.2, 0.4].flatMap((x) => [[R2(MBX + x), 0, -1.3], [R2(MBX + x), 0, 1.3]]), mat: "slot" });
P({ id: "nmPcie", layer: "nMb", shape: "box", size: [1.8, 0.22, 0.14], pos: [MBX + 2.4, MBY + 0.11, MBZ], at: [[0, 0, -2.2], [0, 0, -1.2], [0, 0, 1.2], [0, 0, 2.2]], mat: "slot" });
P({ id: "nmChoke", layer: "nMb", shape: "box", size: [0.2, 0.2, 0.2], pos: [MBX - 3.3, MBY + 0.1, MBZ], at: Array.from({ length: 8 }, (_, i) => [0, 0, R2(-2.6 + i * 0.75)]), mat: "dark" });
P({ id: "nmTrace", layer: "nMb", shape: "box", size: [2.2, 0.01, 0.04], pos: [MBX - 0.1, MBY + 0.005, MBZ], at: Array.from({ length: 8 }, (_, i) => [0, 0, R2(-2.4 + i * 0.25 + (i > 3 ? 3.0 : 0))]), mat: "copper" });
// 板邊看得到多層：銅（細）與膠片（厚）交錯 12 層（示意「越疊越多層」）
P({ id: "nmEdgeCu", layer: "nMb", shape: "box", size: [9.02, 0.018, 0.02], pos: [MBX, 0, R2(MBZ + 3.51)], at: Array.from({ length: 14 }, (_, i) => [0, R2(0.08 + i * 0.033), 0]), mat: "cuShiny" });
P({ id: "nmVia", layer: "nMb", shape: "cyl", size: [0.05, 0.02], rot: V, pos: [0, MBY + 0.01, MBZ], at: Array.from({ length: 16 }, (_, i) => [R2(MBX - 1.0 + (i % 8) * 0.25), 0, R2(i < 8 ? -0.3 : 0.3)]), mat: "cuShiny" });
// r2 加大後補元件：VRM 散熱鰭片、BMC 晶片（含接腳）、M.2 槽、板邊 I/O 接頭、電源接頭
P({ id: "nmVrmFin", layer: "nMb", shape: "box", size: [0.05, 0.32, 1.6], pos: [0, MBY + 0.16, MBZ], at: Array.from({ length: 7 }, (_, i) => [R2(MBX - 4.1 + i * 0.12), 0, 0]), mat: "steel2" });
BOX("nmBmc", "nMb", MBX + 0.6, MBX + 1.2, MBY, MBY + 0.08, MBZ + 2.4, MBZ + 3.0, "die");
P({ id: "nmBmcPin", layer: "nMb", shape: "box", size: [0.03, 0.03, 0.08], pos: [0, MBY + 0.02, R2(MBZ + 2.36)], at: Array.from({ length: 8 }, (_, i) => [R2(MBX + 0.64 + i * 0.075), 0, 0]), mat: "bump" });
BOX("nmM2", "nMb", MBX + 1.6, MBX + 3.6, MBY, MBY + 0.06, MBZ + 2.6, MBZ + 3.0, "slot"); BOX("nmM2Card", "nMb", MBX + 1.7, MBX + 3.4, MBY + 0.06, MBY + 0.1, MBZ + 2.65, MBZ + 2.95, "subG");
P({ id: "nmIO", layer: "nMb", shape: "box", size: [0.4, 0.35, 0.6], pos: [R2(MBX + 4.25), MBY + 0.17, MBZ], at: [-2.8, -2.0, -1.2, 0.4, 1.2].map((z) => [0, 0, z]), mat: "steel2" });
BOX("nmPwr", "nMb", MBX - 4.3, MBX - 3.5, MBY, MBY + 0.3, MBZ + 2.4, MBZ + 3.2, "rubber");
P({ id: "nmCap", layer: "nMb", shape: "box", size: [0.12, 0.06, 0.06], pos: [0, MBY + 0.03, MBZ], at: Array.from({ length: 10 }, (_, i) => [R2(MBX - 3.0 + i * 0.18), 0, R2(i % 2 ? 2.6 : 2.75)]), mat: "dark" });

// ═════ 動作 ═════
actions.hSig = { type: "flow", _說明: "訊號沿上層銅箔跑（第 0 幀就在動）", layer: "hCuTop", path: [[HX0 - 5, HTOP + 0.02, -0.6], [HX0 + 5, HTOP + 0.02, -0.6]], n: 6, size: 0.14, shape: "dot", rate: 0.3, color: "sigC", track: true, band: 0.05, bandO: 0.35, free: true, jitter: 0 };
actions.hPeel = { type: "rotate", _說明: "上層銅箔右前角掀起，露出下面的玻纖布和銅瘤", parts: idsOf("hCuFlap"), axis: [1, 0, 0], pivot: [HX0, HTOP, 1.4], angle: -38, hold: true };
actions.eDrumSpin = { type: "rotate", _說明: "鈦滾筒（陰極）順時針慢轉：從藥水出來的那一段長滿銅", parts: idsOf("eDrum"), axis: [0, 0, 1], pivot: [EX, ECY, 0], rps: -0.05 };
actions.eGuideSpin = { type: "rotate", parts: ["efoGuide"], axis: [0, 0, 1], pivot: [EGX, EGY, 0], rps: -0.35 };
actions.eRollSpin = { type: "rotate", _說明: "收卷輥逆時針轉，把銅箔捲起來", parts: ["efoRoll", "efoCore", "efoRollMark"], axis: [0, 0, 1], pivot: [EGX + 0.35 + EWR, EWY, 0], rps: 0.12 };
[240, 270, 300].forEach((d, i) => { const a = d * D2R; actions[`eIon${i}`] = { type: "flow", _說明: "銅離子從陽極往滾筒（陰極）走（示意）", layer: "eTank", path: [[R2(EX + (EAR - 0.15) * Math.cos(a)), R2(ECY + (EAR - 0.15) * Math.sin(a)), 2.5], [R2(EX + (ER + 0.05) * Math.cos(a)), R2(ECY + (ER + 0.05) * Math.sin(a)), 2.5]], n: 3, size: 0.1, shape: "dot", rate: 0.9, phase: -i * 0.3, color: "ionC", track: false, free: true, jitter: 0.02 }; });
actions.eFoil = { type: "flow", _說明: "銅箔沿滾筒頂端被撕下來、繞過導輥、捲到收卷輥", layer: "eFoil", path: [[EX - 2.2, ECY + 2.4, 2.6], [EX - 1.1, ECY + 3.0, 2.6], [EX, ECY + ER + 0.24, 2.6], [EGX, ECY + ER + 0.24, 2.6], [EGX + 0.4, EGY - 0.2, 2.4], [EGX + 0.4, EWY + 0.3, 2.4]], n: 7, size: 0.13, shape: "arrow", rate: 0.08, color: "ionC", track: true, band: 0.04, bandO: 0.3, free: true, jitter: 0 };
actions.eAnode = { type: "pulse", _說明: "通電：陽極亮", parts: Array.from({ length: 9 }, (_, k) => `eAn${k}`), color: "ionC", glow: 0.7, freq: 0.8, halo: 0 };
actions.fNodPop = { type: "vibrate", _說明: "小銅瘤長出來（往上長）", parts: ["fnN0", "fnN1", "fnN2"], axis: [0, 1, 0], amp: 0.4, freq: 0.5, grow: true };
actions.fShiny = { type: "pulse", _說明: "光面反光", parts: ["ffShiny"], color: "edgeC", glow: 0.8, freq: 1.0, halo: 0 };
actions.rSigR = { type: "flow", _說明: "高頻訊號擠在表面，沿著瘤狀起伏繞路：路徑長、每過一個凹谷就損耗一點（光點越走越小越淡）；rate 和平道相同＝水平速度一樣", keep: 0.94, bounces: RPROF.map((p, i) => i).filter((i) => i > 0 && i < RPROF.length - 1 && RPROF[i][1] < RPROF[i - 1][1] && RPROF[i][1] <= RPROF[i + 1][1]), lossFloor: 0.25, layer: "rRough", path: RPROF, n: 9, size: 0.12, shape: "dot", rate: 0.11, color: "sigC", track: true, band: 0.04, bandO: 0.35, free: true, jitter: 0 };
actions.rSkin = { type: "pulse", _說明: "表面那一層亮（集膚效應）", parts: ["rsBand"], color: "sigC", glow: 0.9, freq: 1.0, halo: 0 };
actions.rSigS = { type: "flow", _說明: "表面平：訊號走直線，沿路幾乎不減（損耗小）", keep: 0.985, bounces: [1, 2, 3, 4, 5, 6, 7, 8, 9], lossFloor: 0.25, layer: "rSmooth", path: Array.from({ length: 11 }, (_, i) => [R2(RX - 2.8 + i * 0.56), R2(RST + 0.04), RPZ]), n: 9, size: 0.12, shape: "dot", rate: 0.11, color: "sigC", track: true, band: 0.04, bandO: 0.35, free: true, jitter: 0 };
actions.rLift = { type: "rotate", _說明: "低粗糙度：銅瘤小、抓不牢，樹脂右端翹起一角", parts: idsOf("rGlueEdge"), axis: [0, 0, 1], pivot: [RX + 1.4, RST, 0], angle: 9, hold: true };
actions.gBush = { type: "pulse", _說明: "白金漏板（熔融玻璃）發橘光", parts: ["gfBush", "gfTip"], color: "hotC", glow: 1, freq: 0.6, halo: 0.2, steady: true };
actions.gDraw = { type: "flow", _說明: "玻璃絲從漏板往下拉、集束成一股", layer: "gFil", path: [[GSX, GBY - 0.15, 0.3], [GSX, GSY, 0.3], [GSX, 2.3 + 0.95, 0.3]], n: 6, size: 0.09, shape: "dot", rate: 0.5, color: "edgeC", track: false, free: true, jitter: 0 };
actions.gYarnRun = { type: "flow", _說明: "紗從收絲筒經捻紗架送到織布機經軸（三站連起來）", layer: "gYarn", path: [...GYARN, ...GYARN2], n: 8, size: 0.08, shape: "dot", rate: 0.35, color: "edgeC", track: true, band: 0.03, bandO: 0.3, free: true, jitter: 0 };
actions.gBobSpin = { type: "rotate", _說明: "收絲筒轉動捲起玻璃紗", parts: ["gwBob", "gwBobCore", "gwBobLine"], axis: [0, 0, 1], pivot: [GSX, 2.3, 0], rps: 0.5 };
for (let i = 0; i < 4; i++) actions[`gTw${i}`] = { type: "rotate", _說明: "捻紗：紗管自轉加捻", parts: [`gtBob${i}`, `gtSp${i}`, `gtLn${i}`], axis: [0, 1, 0], pivot: [GX - 2.4 + i * 0.7, 1.7, 1.5], rps: 1.2 };
actions.gShedA = { type: "vibrate", _說明: "綜框 A 上、B 下：經紗分開成開口", parts: idsOf("gWarpA"), axis: [0, 1, 0], amp: 0.22, freq: 0.5 };
actions.gShedB = { type: "vibrate", parts: idsOf("gWarpB"), axis: [0, -1, 0], amp: 0.22, freq: 0.5 };
actions.gRapierGo = { type: "vibrate", _說明: "劍桿夾著緯紗左右往返穿過經紗開口（和綜框同頻率）", parts: idsOf("gRapier"), axis: [1, 0, 0], amp: 3.2, freq: 0.5 };
actions.gReedBeat = { type: "vibrate", _說明: "筘往前把緯紗打緊", parts: idsOf("gReed"), axis: [0, 0, 1], amp: 0.25, freq: 1.0 };
actions.gClothSpin = { type: "rotate", _說明: "布軸慢慢捲起織好的布", parts: ["glClothBeam", "glClothCore", "glClothMark"], axis: [1, 0, 0], pivot: [LCX, 1.9, 3.0], rps: 0.08 };
actions.gWarpSpin = { type: "rotate", parts: ["glWarpBeam", "glWarpCore"], axis: [1, 0, 0], pivot: [LCX, 1.9, -3.0], rps: 0.08 };
const TRACE = (k, pre, cx, z, rate, size = 0.13, color = "sigC") => ({ type: "flow", layer: `${pre}Trace`, path: [[cx - 6.0, WT + 0.17, z], [cx + 6.0, WT + 0.17, z]], n: 5, size, shape: "dot", rate, color, track: true, band: 0.05, bandO: 0.35, free: true, jitter: 0 });
actions.wSigA = { ...TRACE(0, "w", WX0, TZA, 0.27), _說明: "走在紗上面的那條：周圍玻璃多、訊號慢" };
actions.wSigB = { ...TRACE(1, "w", WX0, TZB, 0.42), _說明: "走在空隙上面的那條：周圍樹脂多、訊號快 → 兩條對不齊" };
actions.wLampB = { type: "pulse", _說明: "走空隙那條先到：B 燈先亮", parts: ["wLampB"], color: "lampY", glow: 1, freq: 1.2, halo: 0.3 };
actions.wLampA = { type: "pulse", _說明: "走紗上那條晚到：A 燈後亮", parts: ["wLampA"], color: "lampR", glow: 1, freq: 1.2, halo: 0.3 };
actions.xLampAB = { type: "pulse", _說明: "攤平後兩條一起到：兩燈同時亮", parts: ["xLampA", "xLampB"], color: "lampG", glow: 1, freq: 1.2, halo: 0.3 };
actions.wYarnGlow = { type: "pulse", _說明: "紗（玻璃）與空隙（樹脂）標出來", parts: ["wyWeft"], color: "lampY", glow: 0.6, freq: 0.8, halo: 0 };
actions.wGapGlow = { type: "pulse", parts: ["wgMark"], color: "sigC", glow: 1, freq: 0.8, halo: 0 };
actions.xSigA0 = { ...TRACE(0, "x", XX, TZA, 0.27), _說明: "攤平前：一快一慢" }; actions.xSigB0 = TRACE(1, "x", XX, TZB, 0.42);
actions.xSigA1 = { ...TRACE(0, "x", XX, TZA, 0.34), _說明: "攤平後：兩條一樣快（介於紗上與空隙之間）" }; actions.xSigB1 = TRACE(1, "x", XX, TZB, 0.34);
actions.xSigA2 = { ...TRACE(0, "x", XX, TZA, 0.45, 0.15), _說明: "換低介電玻璃：更快、損耗更少（點更亮）" }; actions.xSigB2 = TRACE(1, "x", XX, TZB, 0.45, 0.15);
actions.xLdGlow = { type: "pulse", parts: ["xFlatLDWeft", "xFlatLDWarp"], color: "lowC", glow: 0.5, freq: 0.7, halo: 0 };
actions.kGlow = { type: "pulse", parts: ["k0Roll", "k1Roll", "k2Roll"], color: "lampY", glow: 0.4, freq: 0.9, halo: 0 };
actions.nHeat = { type: "pulse", _說明: "上下壓板加熱", parts: ["npLowHot", "ntHot"], color: "hotC", glow: 1, freq: 0.6, halo: 0.2, steady: true };
actions.nSig = { type: "flow", _說明: "主機板上的訊號沿銅線跑", layer: "nMb", path: [[MBX - 1.2, MBY + 0.03, MBZ - 1.3], [MBX + 1.0, MBY + 0.03, MBZ - 1.3], [MBX + 1.0, MBY + 0.03, MBZ + 1.3], [MBX - 1.2, MBY + 0.03, MBZ + 1.3]], n: 6, size: 0.1, shape: "dot", rate: 0.3, color: "sigC", track: true, band: 0.03, bandO: 0.3, free: true, jitter: 0 };

Object.assign(anchors, {
  hCloth: A("hBoard", [HX0 - 3.0, HB + 1.0, 3.4], -150, 90), hCu: A("hCuTop", [HX0 + 3.0, HTOP, 2.0], 150, -90),
  eDrum: A("eDrum", [EX - 2.0, ECY + 2.0, 2.5], -150, -90), eLiq: A("eTank", [EX - 2.5, 1.6, 2.86], -150, 90), eAnode: A("eTank", [EX + 2.6, 1.8, 2.3], 150, 90), eRectA: A("eRect", [EX - 7, 4.6, 1.8], -150, -90), eRoll: A("eFoil", [EGX + 0.35 + EWR, EWY + EWR, 2.3], 150, -90),
  fShiny: A("fFoil", [FX - 2.5, FB, 2.4], -150, 100), fNod: A("fNod", [FX + 2.5, FT + 0.3, 2.0], 150, -90), fResin: A("fResin", [FX + 2.5, FT + 1.0, 2.4], 150, -90),
  rLift: A("rGlueEdge", [RX + 2.6, RST + 0.6, 0.65], 150, -90), rRough: A("rRough", [RX + 1.5, RRT + 0.4, 0.6], 150, -90), rSmooth: A("rSmooth", [RX + 1.5, RSB + 0.3, 0.6], 150, 90), rGlue: A("rGlue", [RX - 1.5, RST + 0.6, 0.6], -150, -90),
  gBush: A("gFurn", [GSX, GBY, 0.6], -150, -90), gTwist: A("gTwist", [GX - 1.4, 2.4, 1.5], -150, 90), gLoom: A("gCloth", [LCX + 2.0, LWY, 1.8], 150, -90),
  wA: A("wTrace", [WX0 + 3.0, WT + 0.14, TZA], 150, -90), wB: A("wTrace", [WX0 - 3.0, WT + 0.14, TZB], -150, 90),
  xFlat: A("xFlat", [XX + 3.0, WYC + 0.3, 2.4], 150, 90), xLd: A("xFlatLD", [XX - 3.0, WYC + 0.3, 2.4], -150, 90),
  nStack: A("nL2", [NPX - 2.2, NLY[2] + 0.15, 2.0], -150, -90), nMb: A("nMb", [MBX + 1.0, MBY + 0.2, MBZ + 1.0], 150, -90),
});

const model = {
  name: "示意 銅箔與玻纖布：銅箔基板剖面、電解銅箔機（電解槽、鈦滾筒、弧形陽極、導輥、收卷、整流器）、銅箔剖面（光面、粗面、小銅瘤、樹脂）、訊號走銅表面（粗 vs 平）、拉絲漏板與收絲、捻紗、織布機（經軸、綜框、劍桿、筘、布軸）、玻纖效應與開纖、三家公司、疊合熱壓與主機板（示意，非特定廠牌／型號）",
  unit: "示意（機台 1＝約 10 cm；銅箔剖面、粗糙度、紗束放大）",
  size: { w: 40, h: 18, r: 0.6, t: 30 },
  palette, materials,
  partNames: { eDrum: "鈦滾筒", gLoom: "織布機" },
  layers, parts, anchors, actions,
  pose: { yaw0: 0, yawIso: 0, drift: 0 },
  camera: { stand: { d: 70, elev: 24, y: 4 } },
  fx: { dpr: 1, srcPx: 30, shadows: 0, fog: false, dust: false, vaporSprites: false, shimmer: false },
  info: { HX0, EX, FX, RX, GX, WX0, XX, KX, NX, NPX, MBX, NLY, NSTOP, HTOP, ECY, ER },
};
fs.writeFileSync(path.join(HERE, "model.json"), JSON.stringify(model, null, 1) + "\n");
console.log(`✔ model.json：${parts.length} 個零件、${parts.reduce((a, p) => a + Math.max(1, (p.at?.length ?? 0)), 0)} 個實體（含複製）、${layers.length} 層`);

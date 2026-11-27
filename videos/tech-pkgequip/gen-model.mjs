// node videos/tech-pkgequip/gen-model.mjs → 寫 videos/tech-pkgequip/model.json
// 2026/11/27 tech-pkgequip（先進封裝設備，系列 3 第 6 集）。構造與物理照 physics-spec.md、模組清單照 visual-spec.md。
// 單位：1＝約 10 cm（機台站）；晶片疊層、點膠剖面為放大示意。地板頂面 y＝0，x 向右、z 向觀眾。站點：
//   W 中介層晶圓對位（x 0；s1）｜L 封裝線全景（x 34；s2）｜B 覆晶接合機（x 78；s3）｜T 熱壓接合頭＋記憶體疊層（x 112；s4）
//   D 點膠剖面（x 142；s5）｜C 載板貼合、壓膜、烤箱（x 174；s6）｜A 光學檢測機（x 208；s7）｜K 三家公司機台模組（x 242；s8）｜S 載板剖面（x 276；s9）
//   示意：不標精度、溫度、壓力；非特定廠牌／型號。
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
const HERE = path.dirname(new URL(import.meta.url).pathname);

const R2 = (x) => Math.round(x * 1000) / 1000;
const D2R = Math.PI / 180;
let seed = 20261222;
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
  bump: M("std", "bumpC", { rough: 0.25, metal: 0.9, env: 0.9 }), copper: M("std", "copper", { rough: 0.3, metal: 0.9, env: 0.7 }),
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

// ═════ 地板 ═════
LAY("floor", [320, 2, 140, 0], true);
P({ id: "floor", layer: "floor", shape: "slab", size: [340, 0.5, 60], r: 0.2, pos: [140, -0.25, 0], mat: "floor" });
P({ id: "floorSeam", layer: "floor", shape: "slab", size: [340, 0.04, 0.1], pos: [140, 0.01, 0], at: Array.from({ length: 9 }, (_, i) => [0, 0, -24 + i * 6]), mat: "seam" });

// 晶圓（頂面在 y0，半徑 r）：切割道格線、對位十字、缺口
const WAFER = (pre, ly, cx, y0, cz, r, o = {}) => {
  VC(`${pre}W`, ly, r, y0 - 0.06, y0, "wafer", { x: cx, z: cz });
  const lines = []; for (let k = -Math.floor(r / 0.9); k <= Math.floor(r / 0.9); k++) lines.push(k * 0.9);
  lines.forEach((u, i) => { const L = 2 * Math.sqrt(Math.max(0, r * r - u * u)) - 0.1; if (L < 0.3) return; BOX(`${pre}Lx${i}`, ly, cx - L / 2, cx + L / 2, y0, y0 + 0.004, cz + u - 0.015, cz + u + 0.015, "waferD"); BOX(`${pre}Lz${i}`, ly, cx + u - 0.015, cx + u + 0.015, y0, y0 + 0.004, cz - L / 2, cz + L / 2, "waferD"); });
  BOX(`${pre}Notch`, ly, cx - 0.1, cx + 0.1, y0 - 0.06, y0 + 0.005, cz + r - 0.12, cz + r + 0.01, "dark");
  if (o.fid) for (const [dx, dz] of [[-r * 0.6, -r * 0.3], [r * 0.6, r * 0.3]]) { BOX(`${pre}Fa${dx > 0 ? 1 : 0}`, ly, cx + dx - 0.2, cx + dx + 0.2, y0, y0 + 0.006, cz + dz - 0.03, cz + dz + 0.03, "mark"); BOX(`${pre}Fb${dx > 0 ? 1 : 0}`, ly, cx + dx - 0.03, cx + dx + 0.03, y0, y0 + 0.006, cz + dz - 0.2, cz + dz + 0.2, "mark"); }
};
// 晶片（底面在 y0）：本體、頂面亮、接點陣列（凸塊朝下）
const DIE = (pre, ly, cx, y0, cz, w, d, t, o = {}) => {
  BOX(`${pre}B`, ly, cx - w / 2, cx + w / 2, y0, y0 + t, cz - d / 2, cz + d / 2, o.mat ?? "die");
  BOX(`${pre}T`, ly, cx - w / 2 + 0.04, cx + w / 2 - 0.04, y0 + t, y0 + t + 0.01, cz - d / 2 + 0.04, cz + d / 2 - 0.04, o.top ?? "dieTop");
  if (o.bumps !== false) { const nx = Math.max(2, Math.round(w / 0.25)), nz = Math.max(2, Math.round(d / 0.25)); P({ id: `${pre}Bp`, layer: ly, shape: "sphere", size: [0.05], pos: [cx, y0 - 0.03, cz], at: GXZ(nx, nz, (w - 0.2) / (nx - 1), (d - 0.2) / (nz - 1), -(w - 0.2) / 2, -(d - 0.2) / 2), mat: "bump" }); }
};

// ═════ 站 W：中介層晶圓＋上方對位中的晶片（s1）═════
const WX = 0;
LAY("wChuck", [12, 1.2, WX, 0.8]);
VC("wcBase", "wChuck", 5.4, 0, 0.9, "band", { x: WX, z: 0 }); VC("wcTop", "wChuck", 5.0, 0.9, 1.1, "steel2", { x: WX, z: 0 });
P({ id: "wcHole", layer: "wChuck", shape: "cyl", size: [0.05, 0.01], rot: V, pos: [WX, 1.105, 0], at: Array.from({ length: 36 }, (_, i) => { const a = i * 10 * D2R, r = 4.75; return [R2(r * Math.cos(a)), 0, R2(r * Math.sin(a))]; }), mat: "dark" });
LAY("wWafer", [10, 0.3, WX, 1.2]); WAFER("ww", "wWafer", WX, 1.18, 0, 4.6, { fid: true });
// 中介層接點（已放好的晶片位置之外的接點陣列）
P({ id: "wwPad", layer: "wWafer", shape: "cyl", size: [0.045, 0.02], rot: V, pos: [WX, 1.19, 0], at: GXZ(10, 8, 0.25, 0.25, -1.1, -0.9), mat: "copper" });
LAY("wDies", [4, 1.5, WX, 2.6]);
DIE("wdG", "wDies", WX - 0.2, 2.4, 0, 1.6, 1.4, 0.25); for (const [m, zc] of [[0, -0.5], [1, 0.45]]) { DIE(`wdM${m}`, "wDies", WX + 1.35, 2.4, zc, 0.72, 0.62, 0.06, { mat: "die", top: "die" });
  for (let k = 0; k < 12; k++) BOX(`wdM${m}L${k}`, "wDies", WX + 0.99, WX + 1.71, R2(2.46 + k * 0.07), R2(2.46 + k * 0.07 + 0.05), zc - 0.31, zc + 0.31, k % 2 ? "die" : "dieTop"); }
LAY("wRing", [3, 0.2, WX, 1.25]); P({ id: "wRingT", layer: "wRing", shape: "tube", size: [1.4, 1.3, 0.02], rot: V, pos: [WX + 0.3, 1.2, 0], mat: "ring" });
P({ id: "wCross", layer: "wRing", shape: "box", size: [0.04, 0.02, 2.4], pos: [WX + 0.3, 1.21, 0], mat: "ring" }); P({ id: "wCross2", layer: "wRing", shape: "box", size: [2.4, 0.02, 0.04], pos: [WX + 0.3, 1.21, 0], mat: "ring" });

// ═════ 站 L：封裝線全景（s2）：五台機台一排＋輸送軌＋晶圓盒 ═════
const LX = 34, LTAG = ["接合", "熱壓", "點膠", "壓烤", "檢測"];
// 五站排成 U 形（前排三台、後排兩台），輸送軌沿 U 形走：直立畫面才放得下
const LPOS = [[LX - 6.2, 3.2], [LX, 3.2], [LX + 6.2, 3.2], [LX + 3.1, -4.6], [LX - 3.1, -4.6]];
LAY("line", [18, 6, LX, 2.5]);
BOX("lnRailF", "line", LX - 9.5, LX + 9.5, 0.9, 1.0, 6.0, 6.6, "steel2"); BOX("lnRailR", "line", LX + 9.0, LX + 9.6, 0.9, 1.0, -1.6, 6.6, "steel2"); BOX("lnRailB", "line", LX - 6.5, LX + 9.6, 0.9, 1.0, -1.6, -1.0, "steel2");
P({ id: "lnRailLeg", layer: "line", shape: "box", size: [0.15, 0.9, 0.15], pos: [0, 0.45, 0], at: [[LX - 9, 0, 6.3], [LX - 3, 0, 6.3], [LX + 3, 0, 6.3], [LX + 9.3, 0, 6.3], [LX + 9.3, 0, 2.5], [LX + 9.3, 0, -1.3], [LX + 3, 0, -1.3], [LX - 3, 0, -1.3]], mat: "steel" });
P({ id: "lnRoller", layer: "line", shape: "cyl", size: [0.07, 0.55], pos: [0, 1.0, 6.3], at: Array.from({ length: 19 }, (_, i) => [R2(LX - 9 + i), 0, 0]), mat: "dark" });
LPOS.forEach(([x, z], i) => { const f = z > 0 ? 1 : -1, zf = z + f * 2.0;
  CAB(`ln${i}`, "line", x - 2.5, x + 2.5, 0, 4.2, z - 2.0, z + 2.0, { tower: true });
  if (f > 0) { BOX(`ln${i}Win`, "line", x - 1.8, x + 1.0, 2.0, 3.4, zf, zf + 0.04, "window"); BOX(`ln${i}Port`, "line", x - 0.6, x + 0.6, 1.0, 1.9, zf, zf + 0.06, "dark"); }
  BOX(`ln${i}Tag`, "line", x - 1.0, x + 1.0, 4.2, 4.6, z - 0.3, z + 0.3, ["mark", "heat", "warnY", "screen", "lampG"][i]); });
LPOS.forEach(([x, z], i) => { const y = 4.2, ly = "line";
  if (i === 0) { BOX("lnF0Beam", ly, x - 2.0, x + 2.0, y + 0.9, y + 1.2, z - 0.2, z + 0.2, "steel2"); P({ id: "lnF0Post", layer: ly, shape: "box", size: [0.2, 0.9, 0.2], pos: [0, y + 0.45, z], at: [[x - 1.9, 0, 0], [x + 1.9, 0, 0]], mat: "steel2" }); BOX("lnF0Cam", ly, x - 0.3, x + 0.3, y + 0.2, y + 0.9, z - 0.3, z + 0.3, "cam"); }
  if (i === 1) { BOX("lnF1Head", ly, x - 0.7, x + 0.7, y + 0.1, y + 0.9, z - 0.6, z + 0.6, "steel2"); BOX("lnF1Heat", ly, x - 0.8, x + 0.8, y, y + 0.2, z - 0.7, z + 0.7, "hot"); VC("lnF1Shaft", ly, 0.15, y + 0.9, y + 1.6, "steel", { x, z }); }
  if (i === 2) { VC("lnF2Syr", ly, 0.3, y + 0.3, y + 1.6, "window", { x, z }); VC("lnF2Glue", ly, 0.25, y + 0.35, y + 1.2, "uf", { x, z }); VC("lnF2Ndl", ly, 0.05, y, y + 0.3, "steel", { x, z }); }
  if (i === 3) { HXC("lnF3Film", ly, 0.45, x - 1.4, x + 1.4, y + 0.55, z, "film"); BOX("lnF3Glow", ly, x - 1.2, x + 1.2, y - 1.6, y - 0.6, z - 2.06, z - 2.0, "hot"); }
  if (i === 4) { VC("lnF4Cam", ly, 0.35, y + 0.2, y + 1.2, "cam", { x, z }); VT("lnF4Ring", ly, 0.6, 0.4, y + 0.05, y + 0.2, "ring", { x, z }); }
});
LAY("lnFoup", [1.2, 1, LX - 9, 1.6]);
BOX("lfBody", "lnFoup", LX - 9.6, LX - 8.4, 1.05, 2.05, 5.8, 6.8, "panel2"); BOX("lfDoor", "lnFoup", LX - 9.5, LX - 8.5, 1.15, 1.95, 6.8, 6.84, "glassD"); BOX("lfHandle", "lnFoup", LX - 9.3, LX - 8.7, 2.05, 2.2, 6.1, 6.5, "dark");

// ═════ 站 B：覆晶接合機（s3）：外殼＋晶粒供料台＋頂針＋翻轉器＋龍門接合頭＋對位相機＋晶圓吸盤 ═════
const BX = 78, BY = 2.6;   // 工作台面高度
LAY("bBase", [16, 3, BX, 1.3]);
BOX("bbDeck", "bBase", BX - 7.5, BX + 7.5, 0.3, BY, -3.8, 3.8, "band"); BOX("bbDeckTop", "bBase", BX - 7.5, BX + 7.5, BY, BY + 0.1, -3.8, 3.8, "panel2");
P({ id: "bbFoot", layer: "bBase", shape: "cyl", size: [0.15, 0.3], rot: V, pos: [0, 0.15, 0], at: [[BX - 7, 0, -3.3], [BX + 7, 0, -3.3], [BX - 7, 0, 3.3], [BX + 7, 0, 3.3]], mat: "dark" });
P({ id: "bbVent", layer: "bBase", shape: "box", size: [2.0, 0.06, 0.03], pos: [BX - 4.5, 0, 3.81], at: Array.from({ length: 6 }, (_, i) => [0, R2(0.8 + i * 0.2), 0]), mat: "dark" });
BOX("bbPlate", "bBase", BX + 4.4, BX + 6.6, 1.2, 1.7, 3.8, 3.83, "warnY"); BOX("bbDoor", "bBase", BX - 1.5, BX + 3.5, 0.6, 2.3, 3.8, 3.84, "panel"); BOX("bbHandle", "bBase", BX + 3.0, BX + 3.2, 1.2, 1.8, 3.84, 3.95, "steel2");
// 外殼頂蓋與前窗（爆炸 2.1-1 掀開）
LAY("bHood", [16, 5, BX, 5.2]);
BOX("bhRoof", "bHood", BX - 7.5, BX + 7.5, 7.8, 8.0, -3.8, 3.8, "panel"); BOX("bhBack", "bHood", BX - 7.5, BX + 7.5, BY + 0.1, 7.8, -3.8, -3.6, "panel");
BOX("bhSideL", "bHood", BX - 7.5, BX - 7.3, BY + 0.1, 7.8, -3.8, 3.8, "window"); BOX("bhSideR", "bHood", BX + 7.3, BX + 7.5, BY + 0.1, 7.8, -3.8, 3.8, "window");
BOX("bhFront", "bHood", BX - 7.3, BX + 7.3, BY + 0.1, 7.8, 3.6, 3.68, "window"); FRAME3("bhFr", "bHood", BX - 7.5, BX + 7.5, BY + 0.1, 7.8, 3.68, 0.12, "steel2");
VC("bhTower", "bHood", 0.07, 8.0, 9.0, "steel", { x: BX + 6.8, z: -3.2 }); SPH("bhTowerG", "bHood", 0.13, BX + 6.8, 9.05, -3.2, "lampG"); SPH("bhTowerY", "bHood", 0.13, BX + 6.8, 9.3, -3.2, "lampY");
BOX("bhScreen", "bHood", BX + 4.6, BX + 6.6, 5.6, 7.0, 3.68, 3.72, "screen"); BOX("bhFilter", "bHood", BX - 6.5, BX + 2.0, 8.0, 8.4, -2.5, 2.5, "panel2");
P({ id: "bhFilterGrid", layer: "bHood", shape: "box", size: [8.4, 0.03, 0.05], pos: [BX - 2.25, 8.42, 0], at: Array.from({ length: 6 }, (_, i) => [0, 0, R2(-2.2 + i * 0.88)]), mat: "seam" });
function FRAME3(id, layer, x0, x1, y0, y1, z, t, mat) { BOX(`${id}T`, layer, x0, x1, R2(y1 - t), y1, z, R2(z + t), mat); BOX(`${id}B`, layer, x0, x1, y0, R2(y0 + t), z, R2(z + t), mat); BOX(`${id}L`, layer, x0, R2(x0 + t), y0, y1, z, R2(z + t), mat); BOX(`${id}R`, layer, R2(x1 - t), x1, y0, y1, z, R2(z + t), mat); }
// 晶粒供料台（左）：框環＋藍膜＋切好的晶粒陣列；頂針在膜下
const FX = BX - 4.6, FZ = 0.2, FY = BY + 0.9, PK = 0.75, DW = 0.6;   // PK＝被頂起那顆的 x 位移；DW＝晶粒邊長（放大示意）
LAY("bFeed", [5, 1.2, FX, FY]);
VC("bfStage", "bFeed", 2.2, BY + 0.1, FY - 0.25, "steel2", { x: FX, z: FZ }); VT("bfRing", "bFeed", 2.1, 1.9, FY - 0.25, FY - 0.15, "frame", { x: FX, z: FZ }); VC("bfTape", "bFeed", 1.95, FY - 0.2, FY - 0.17, "tape", { x: FX, z: FZ });
P({ id: "bfDie", layer: "bFeed", shape: "box", size: [0.55, 0.1, 0.55], pos: [FX, FY - 0.12, FZ], at: GXZ(5, 5, 0.75, 0.75, -1.5, -1.5).filter(([x, , z]) => Math.hypot(x, z) < 1.8 && !(Math.abs(x - PK) < 0.1 && Math.abs(z) < 0.1)), mat: "dieTop" });
P({ id: "bfDieDot", layer: "bFeed", shape: "box", size: [0.12, 0.01, 0.12], pos: [FX, FY - 0.065, FZ], at: GXZ(5, 5, 0.75, 0.75, -1.5, -1.5).filter(([x, , z]) => Math.hypot(x, z) < 1.8 && !(Math.abs(x - PK) < 0.1 && Math.abs(z) < 0.1)), mat: "mark" });
LAY("bPin", [0.3, 1, FX + PK, FY - 0.6]); VC("bpPin", "bPin", 0.04, BY + 0.1, FY - 0.2, "steel", { x: FX + PK, z: FZ }); VC("bpHousing", "bPin", 0.18, BY + 0.1, BY + 0.5, "dark", { x: FX + PK, z: FZ });
// 被頂起的那顆（之後被翻轉器吸走）
LAY("bPick", [0.5, 0.2, FX + PK, FY]); DIE("bpk", "bPick", FX + PK, FY - 0.17, FZ, DW, DW, 0.1, { bumps: false, mat: "dieTop" }); P({ id: "bpkBump", layer: "bPick", shape: "sphere", size: [0.05], pos: [FX + PK, FY - 0.04, FZ], at: GXZ(4, 4, 0.16, 0.16, -0.24, -0.24), mat: "bump" });
// 翻轉器（供料台右側）：底座＋旋轉臂＋吸嘴；繞 z 軸翻 180 度
const FLX = FX + PK + 2.3, FLY = BY + 1.4;   // 翻轉器吸嘴（臂末端 FLX−2.3）正好在被頂起的晶粒上方
LAY("bFlipBase", [1, 1.5, FLX, BY + 0.7]); BOX("bflBase", "bFlipBase", FLX - 0.4, FLX + 0.4, BY + 0.1, FLY - 0.2, FZ - 0.4, FZ + 0.4, "dark"); ZC("bflMotor", "bFlipBase", 0.3, FZ - 0.6, FZ - 0.4, FLX, FLY, "steel2");
LAY("bFlip", [2.6, 0.4, FLX - 1.2, FLY]);
BOX("bflArm", "bFlip", FLX - 2.3, FLX, FLY - 0.1, FLY + 0.1, FZ - 0.12, FZ + 0.12, "steel2"); ZC("bflHub", "bFlip", 0.22, FZ - 0.35, FZ + 0.35, FLX, FLY, "steel");
VC("bflNoz", "bFlip", 0.09, FLY - 0.45, FLY - 0.1, "ceramic", { x: FLX - 2.3 + 0.0, z: FZ }); PIPE("bflVac", "bFlip", [[FLX - 1.6, FLY + 0.1, FZ], [FLX - 1.6, FLY + 0.35, FZ], [FLX - 0.4, FLY + 0.35, FZ]], 0.03, "rubber");
// 翻轉器吸住的晶粒（翻面前在下、翻面後在上）
LAY("bFlipDie", [0.5, 0.2, FLX - 2.3, FLY - 0.5]); DIE("bfd", "bFlipDie", FLX - 2.3, FLY - 0.6, FZ, DW, DW, 0.1, { bumps: false, mat: "dieTop" }); P({ id: "bfdBump", layer: "bFlipDie", shape: "sphere", size: [0.05], pos: [FLX - 2.3, FLY - 0.475, FZ], at: GXZ(4, 4, 0.16, 0.16, -0.24, -0.24), mat: "bump" });
// 晶圓吸盤台（右）：XY 平台＋吸盤＋中介層晶圓（已放好幾顆）
const CX = BX + 3.0, CZ = 0.0, CY = BY + 0.7;
LAY("bChuck", [7, 1, CX, CY - 0.3]);
BOX("bcY", "bChuck", CX - 3.2, CX + 3.2, BY + 0.1, BY + 0.3, -3.0, 3.0, "steel"); P({ id: "bcRail", layer: "bChuck", shape: "box", size: [0.12, 0.08, 6.0], pos: [0, BY + 0.34, 0], at: [[CX - 2.6, 0, 0], [CX + 2.6, 0, 0]], mat: "steel2" });
BOX("bcX", "bChuck", CX - 2.9, CX + 2.9, BY + 0.38, BY + 0.5, -2.8, 2.8, "steel2"); VC("bcPlate", "bChuck", 2.7, BY + 0.5, CY - 0.06, "steel2", { x: CX, z: CZ }); VT("bcRim", "bChuck", 2.75, 2.65, CY - 0.1, CY, "dark", { x: CX, z: CZ });
BOX("bcMotor", "bChuck", CX + 3.2, CX + 3.9, BY + 0.1, BY + 0.6, -0.4, 0.4, "dark");
WAFER("bcw", "bChuck", CX, CY, CZ, 2.5, { fid: true });
P({ id: "bcPlaced", layer: "bChuck", shape: "box", size: [DW, 0.1, DW], pos: [CX, CY + 0.05, CZ], at: GXZ(4, 3, 0.9, 0.9, -1.35, -0.9).filter((_, i) => i !== 5), mat: "die" });
P({ id: "bcPad", layer: "bChuck", shape: "cyl", size: [0.05, 0.012], rot: V, pos: [CX - 0.45, CY + 0.006, CZ], at: GXZ(4, 4, 0.16, 0.16, -0.24, -0.24), mat: "copper" }); P({ id: "bcSlot", layer: "bChuck", shape: "tube", size: [0.46, 0.42, 0.01], rot: V, pos: [CX - 0.45, CY + 0.008, CZ], mat: "ring" });
// 龍門＋接合頭（爆炸 2.1-2 往上）
const GY = BY + 4.9, HX0 = FLX + 2.3;     // 接合頭起始在翻轉器翻面後晶粒的正上方（吸嘴底＝翻面後晶粒背面）
LAY("bGantry", [12, 1, BX, GY]);
BOX("bgBeam", "bGantry", BX - 6.0, BX + 6.0, GY, GY + 0.6, -0.5, 0.5, "panel"); BOX("bgRail", "bGantry", BX - 5.8, BX + 5.8, GY - 0.1, GY, -0.2, 0.2, "steel2");
P({ id: "bgPost", layer: "bGantry", shape: "box", size: [0.6, R2(GY + 0.6 - BY - 0.1), 0.8], pos: [0, R2((GY + 0.6 + BY + 0.1) / 2), 0], at: [[BX - 6.3, 0, 0], [BX + 6.3, 0, 0]], mat: "panel2" });
BOX("bgChain", "bGantry", BX - 5.0, BX + 4.0, GY + 0.6, GY + 0.8, -0.2, 0.2, "rubber"); BOX("bgLabel", "bGantry", BX + 3.0, BX + 4.2, GY + 0.15, GY + 0.45, 0.5, 0.53, "warnY");
LAY("bHead", [1.2, 3, HX0, GY - 1.2]);
BOX("bhdCarriage", "bHead", HX0 - 0.5, HX0 + 0.5, GY - 0.3, GY + 0.3, -0.55, 0.55, "dark"); BOX("bhdZ", "bHead", HX0 - 0.25, HX0 + 0.25, GY - 2.3, GY - 0.3, -0.25, 0.25, "steel2");
BOX("bhdMotor", "bHead", HX0 - 0.3, HX0 + 0.3, GY + 0.3, GY + 0.9, -0.3, 0.3, "dark"); P({ id: "bhdScrew", layer: "bHead", shape: "cyl", size: [0.05, 1.9], rot: V, pos: [HX0 + 0.33, GY - 1.3, 0.0], mat: "steel" });
VC("bhdTool", "bHead", 0.22, GY - 2.7, GY - 2.3, "ceramic", { x: HX0, z: FZ }); VC("bhdTip", "bHead", 0.12, GY - 2.85, GY - 2.7, "ceramic", { x: HX0, z: FZ });
PIPE("bhdVac", "bHead", [[HX0 + 0.3, GY - 2.5, FZ], [HX0 + 0.6, GY - 2.5, FZ], [HX0 + 0.6, GY + 0.3, FZ]], 0.035, "rubber"); SPH("bhdLed", "bHead", 0.06, HX0, GY - 1.0, 0.27, "lampG");
// 接合頭帶著的晶粒（翻面後接點朝下）
LAY("bCarry", [0.5, 0.2, HX0, GY - 2.9]); DIE("bcy", "bCarry", HX0, GY - 3.0, FZ, DW, DW, 0.1, { mat: "dieTop" });
// 對位相機（爆炸 2.1-3 往前抽出）：上下視雙相機盒＋鏡筒＋環形燈
const CAMX = HX0 - 1.5;   // 對位相機在接合頭左側（不擋接合頭），往左側抽出
LAY("bCam", [1.4, 1.6, CAMX, GY - 1.0]);
BOX("bcmBox", "bCam", CAMX - 0.55, CAMX + 0.55, GY - 1.4, GY - 0.3, 0.55, 1.4, "cam"); VC("bcmLensD", "bCam", 0.2, GY - 1.9, GY - 1.4, "cam", { x: CAMX, z: 1.0 }); VC("bcmGlassD", "bCam", 0.17, GY - 1.92, GY - 1.88, "lens", { x: CAMX, z: 1.0 });
VT("bcmRing", "bCam", 0.34, 0.24, GY - 1.98, GY - 1.9, "ring", { x: CAMX, z: 1.0 }); VC("bcmLensU", "bCam", 0.17, GY - 0.3, GY + 0.1, "cam", { x: CAMX, z: 1.0 }); P({ id: "bcmCable", layer: "bCam", shape: "box", size: [0.06, 0.06, 1.2], pos: [CAMX + 0.4, GY - 0.35, 0.4], mat: "rubber" });
BOX("bcmLabel", "bCam", CAMX - 0.4, CAMX + 0.2, GY - 0.9, GY - 0.6, 1.4, 1.43, "white");

// ═════ 站 T：熱壓接合頭＋記憶體疊層（s4，放大示意）═════
const TX = 112, TB = 1.0;   // 底座頂面
LAY("tBase", [10, 1, TX, 0.5]); BOX("tbBase", "tBase", TX - 5, TX + 5, 0, TB, -3, 3, "band"); BOX("tbStage", "tBase", TX - 3.2, TX + 3.2, TB, TB + 0.35, -2.4, 2.4, "steel2");
P({ id: "tbHole", layer: "tBase", shape: "cyl", size: [0.05, 0.01], rot: V, pos: [TX, TB + 0.355, 0], at: GXZ(9, 6, 0.6, 0.7, -2.4, -1.75), mat: "dark" });
BOX("tbHeat", "tBase", TX - 2.6, TX + 2.6, TB + 0.35, TB + 0.45, -1.9, 1.9, "heat"); BOX("tbLabel", "tBase", TX + 3.4, TX + 4.6, 0.3, 0.7, 3.0, 3.03, "warnY");
// 最底層邏輯晶片（較大）＋十二層記憶體（每層：晶片＋膠膜），逐層出現
const SW = 3.0, SD = 2.4, ST = 0.16, NG = 0.06, SY0 = TB + 0.45;
LAY("tBottom", [4, 0.3, TX, SY0 + 0.1]); DIE("tbt", "tBottom", TX, SY0, 0, SW + 0.6, SD + 0.4, 0.2, { bumps: false }); P({ id: "tbtTsv", layer: "tBottom", shape: "box", size: [0.04, 0.01, SD], pos: [TX, SY0 + 0.205, 0], at: Array.from({ length: 9 }, (_, i) => [R2(-1.2 + i * 0.3), 0, 0]), mat: "copper" });
const LAYY = (k) => R2(SY0 + 0.2 + k * (ST + NG));
for (let k = 0; k < 12; k++) {
  const y = LAYY(k); LAY(`tL${k}`, [SW, 0.25, TX, y + 0.1]);
  BOX(`tL${k}N`, `tL${k}`, TX - SW / 2 - 0.05, TX + SW / 2 + 0.05, y, y + NG, -SD / 2 - 0.05, SD / 2 + 0.05, "ncf");
  BOX(`tL${k}D`, `tL${k}`, TX - SW / 2, TX + SW / 2, y + NG, y + NG + ST, -SD / 2, SD / 2, k % 2 ? "die" : "dieTop");
  P({ id: `tL${k}F`, layer: `tL${k}`, shape: "cyl", size: [0.09, R2(SW + 0.2)], rot: HX, pos: [TX, R2(y + NG / 2), 0], at: [[0, 0, R2(SD / 2 + 0.07)], [0, 0, R2(-SD / 2 - 0.07)]], mat: "ncfHot" });
  P({ id: `tL${k}Tsv`, layer: `tL${k}`, shape: "box", size: [0.04, 0.01, SD - 0.1], pos: [TX, R2(y + NG + ST + 0.002), 0], at: Array.from({ length: 9 }, (_, i) => [R2(-1.2 + i * 0.3), 0, 0]), mat: "copper" });
}
// 正在壓的那一層的膠邊（被擠出來）
// 熱壓接合頭（爆炸 2.2-1 外罩左右分開）：本體＋加熱器＋陶瓷吸嘴＋冷卻氣嘴＋壓力感測
const THY = R2(LAYY(11) + NG + ST + 1.2);
LAY("tHead", [4, 3.5, TX, THY + 0.8]);
BOX("thBody", "tHead", TX - 1.0, TX + 1.0, THY + 0.6, THY + 2.6, -0.9, 0.9, "steel2"); BOX("thLoad", "tHead", TX - 0.7, TX + 0.7, THY + 2.6, THY + 3.0, -0.7, 0.7, "dark");
BOX("thHeater", "tHead", TX - 1.6, TX + 1.6, THY + 0.25, THY + 0.6, -1.25, 1.25, "heat"); P({ id: "thCoil", layer: "tHead", shape: "box", size: [3.0, 0.04, 0.06], pos: [TX, THY + 0.42, 1.27], at: [[0, -0.06, 0], [0, 0.06, 0]], mat: "hot" });
BOX("thTool", "tHead", TX - SW / 2, TX + SW / 2, THY, THY + 0.25, -SD / 2, SD / 2, "ceramic"); P({ id: "thVacHole", layer: "tHead", shape: "cyl", size: [0.05, 0.01], rot: V, pos: [TX, THY - 0.002, 0], at: GXZ(5, 4, 0.6, 0.6, -1.2, -0.9), mat: "dark" });
PIPE("thAir", "tHead", [[TX + 1.7, THY + 0.4, 0.9], [TX + 2.2, THY + 0.4, 0.9], [TX + 2.2, THY + 2.4, 0.9]], 0.05, "rubber"); BOX("thSensor", "tHead", TX - 0.5, TX + 0.5, THY + 2.0, THY + 2.4, 0.9, 0.95, "screen");
VC("thShaft", "tHead", 0.25, THY + 3.0, THY + 6.2, "steel", { x: TX, z: 0 }); VT("thShaftCol", "tHead", 0.36, 0.26, THY + 2.95, THY + 3.25, "dark", { x: TX, z: 0 }); SPH("thLed", "tHead", 0.07, TX + 0.8, THY + 2.3, 0.95, "lampG");
LAY("tCoverL", [1, 2.2, TX - 1.3, THY + 1.6]); LAY("tCoverR", [1, 2.2, TX + 1.3, THY + 1.6]);
BOX("thCovL", "tCoverL", TX - 1.15, TX - 1.0, THY + 0.6, THY + 2.6, -0.95, 0.95, "panel"); BOX("thCovLF", "tCoverL", TX - 1.15, TX - 0.05, THY + 0.6, THY + 2.6, 0.9, 0.97, "panel"); BOX("thCovLV", "tCoverL", TX - 0.9, TX - 0.3, THY + 1.2, THY + 2.2, 0.97, 0.99, "dark");
BOX("thCovR", "tCoverR", TX + 1.0, TX + 1.15, THY + 0.6, THY + 2.6, -0.95, 0.95, "panel"); BOX("thCovRF", "tCoverR", TX + 0.05, TX + 1.15, THY + 0.6, THY + 2.6, 0.9, 0.97, "panel"); BOX("thCovRP", "tCoverR", TX + 0.3, TX + 0.9, THY + 1.4, THY + 1.7, 0.97, 0.99, "warnY");
// 龍門柱
LAY("tFrame", [10, 10, TX, 5]); P({ id: "tfPost", layer: "tFrame", shape: "box", size: [0.7, R2(THY + 4.8), 0.8], pos: [0, R2((THY + 4.8) / 2), -2.6], at: [[TX - 4.2, 0, 0], [TX + 4.2, 0, 0]], mat: "panel2" }); BOX("tfBeam", "tFrame", TX - 4.6, TX + 4.6, THY + 4.8, THY + 5.6, -3.0, -2.2, "panel"); BOX("tfRail", "tFrame", TX - 0.4, TX + 0.4, THY + 3.0, THY + 4.8, -2.2, -1.9, "steel2"); BOX("tfBridge", "tFrame", TX - 0.5, TX + 0.5, THY + 4.2, THY + 4.5, -1.9, 0.45, "steel2"); VT("tfBush", "tFrame", 0.4, 0.27, THY + 4.1, THY + 4.6, "dark", { x: TX, z: 0 });

// ═════ 站 D：點膠剖面（s5，放大示意）：中介層＋晶片（剖開，看得到縫）＋點膠頭 ═════
const DX = 142, DY0 = 1.2;
LAY("dBase", [14, 1.2, DX, 0.6]); BOX("ddBase", "dBase", DX - 7, DX + 7, 0, DY0 - 0.2, -3.4, 3.4, "band"); BOX("ddHot", "dBase", DX - 6.6, DX + 6.6, DY0 - 0.2, DY0, -3.0, 3.0, "heat");
LAY("dSub", [12, 0.8, DX, DY0 + 0.4]); BOX("dsInt", "dSub", DX - 6, DX + 6, DY0, DY0 + 0.7, -2.6, 2.6, "wafer"); P({ id: "dsLine", layer: "dSub", shape: "box", size: [12, 0.03, 0.03], pos: [DX, 0, 2.61], at: [[0, DY0 + 0.2, 0], [0, DY0 + 0.4, 0], [0, DY0 + 0.6, 0]], mat: "copper" });
const GAP = 0.5, DIEB = DY0 + 0.7 + GAP;   // 晶片底面（放大的縫）
LAY("dDie", [6, 1.5, DX, DIEB + 0.7]); BOX("ddDie", "dDie", DX - 3, DX + 3, DIEB, DIEB + 1.4, -2.2, 2.2, "die"); BOX("ddDieT", "dDie", DX - 2.95, DX + 2.95, DIEB + 1.4, DIEB + 1.42, -2.15, 2.15, "dieTop");
P({ id: "ddBump", layer: "dDie", shape: "cyl", size: [0.16, GAP], rot: V, pos: [0, R2(DY0 + 0.7 + GAP / 2), 0], at: Array.from({ length: 11 }, (_, i) => [R2(DX - 2.5 + i * 0.5), 0, 2.0]).concat(Array.from({ length: 11 }, (_, i) => [R2(DX - 2.5 + i * 0.5), 0, 0.4])), mat: "bump" });
P({ id: "ddCap", layer: "dDie", shape: "cyl", size: [0.18, 0.08], rot: V, pos: [0, R2(DY0 + 0.74), 0], at: Array.from({ length: 11 }, (_, i) => [R2(DX - 2.5 + i * 0.5), 0, 2.0]), mat: "copper" });
// 膠：前緣從左邊往右推進（五段依序出現）＋左右膠邊
for (let k = 0; k < 6; k++) { const x0 = DX - 3.0, x1 = R2(DX - 3.0 + (k + 1) * 1.0); LAY(`dUf${k}`, [R2(x1 - x0), GAP, R2((x0 + x1) / 2), DY0 + 0.7 + GAP / 2]); BOX(`dUf${k}B`, `dUf${k}`, R2(x1 - 1.0), x1, DY0 + 0.7, DIEB, -2.2, 2.2, "uf"); }
LAY("dFilL", [1, 1, DX - 3.2, DIEB]); P({ id: "dFilLP", layer: "dFilL", shape: "poly", size: [1, 1, 4.4], pts: [[0, 0], [0.55, 0], [0, 0.9]], pos: [DX - 3.0, DY0 + 0.7, -2.2], rot: [0, 180, 0], mat: "uf" });
LAY("dFilR", [1, 1, DX + 3.2, DIEB]); P({ id: "dFilRP", layer: "dFilR", shape: "poly", size: [1, 1, 4.4], pts: [[0, 0], [0.45, 0], [0, 0.6]], pos: [DX + 3.0, DY0 + 0.7, -2.2], mat: "uf" });
// 點膠頭（沿晶片左緣沿 z 走）：針筒、閥、針頭、相機
const NX = DX - 3.35, NY = DIEB + 0.5;
LAY("dGantry", [2, 6, NX, NY + 3]);
BOX("dgBeam", "dGantry", NX - 0.35, NX + 0.35, NY + 4.8, NY + 5.3, -3.45, 2.9, "panel"); BOX("dgRail", "dGantry", NX - 0.15, NX + 0.15, NY + 4.7, NY + 4.8, -2.8, 3.2, "steel2");
P({ id: "dgPost", layer: "dGantry", shape: "box", size: [0.5, R2(NY + 5.3), 0.5], pos: [NX, R2((NY + 5.3) / 2), 0], at: [[0, 0, -3.2]], mat: "panel2" }); BOX("dgBrace", "dGantry", NX - 0.3, NX + 0.3, NY + 3.9, NY + 4.8, -3.45, -1.6, "panel2");   // 懸臂龍門：只有後柱，針頭前方不擋（r1 機台審） BOX("dgLabel", "dGantry", NX - 0.36, NX - 0.35, NY + 4.85, NY + 5.25, 0.5, 1.6, "warnY");
for (let k = 0; k < 6; k++) { LAY(`dBead${k}`, [0.3, 0.2, DX - 3.05, DY0 + 0.75]); ZC(`dBead${k}B`, `dBead${k}`, 0.09, R2(2.0 - k * 0.6 - 0.6), R2(2.0 - k * 0.6), DX - 3.12, DY0 + 0.79, "uf"); }
LAY("dHead", [1.5, 5, NX, NY + 2.5]);
BOX("dhCarriage", "dHead", NX - 0.45, NX + 0.45, NY + 4.2, NY + 4.7, 1.6, 2.4, "dark"); BOX("dhZ", "dHead", NX + 0.35, NX + 0.6, NY + 1.2, NY + 4.7, 1.85, 2.15, "steel2");
VC("dhNeedle", "dHead", 0.05, NY, NY + 1.0, "steel", { x: NX, z: 2.0 }); VC("dhValve", "dHead", 0.3, NY + 1.0, NY + 1.9, "dark", { x: NX, z: 2.0 }); VC("dhSyr", "dHead", 0.32, NY + 1.9, NY + 4.2, "window", { x: NX, z: 2.0 });
VC("dhGlue", "dHead", 0.27, NY + 1.95, NY + 3.4, "uf", { x: NX, z: 2.0 }); VC("dhPlunger", "dHead", 0.28, NY + 3.4, NY + 3.6, "dark", { x: NX, z: 2.0 }); BOX("dhBracket", "dHead", NX + 0.3, NX + 1.4, NY + 1.2, NY + 3.8, 1.7, 2.3, "steel2");
VC("dhCam", "dHead", 0.18, NY + 0.7, NY + 1.6, "cam", { x: NX + 1.0, z: 2.0 }); VT("dhCamRing", "dHead", 0.26, 0.18, NY + 0.62, NY + 0.7, "ring", { x: NX + 1.0, z: 2.0 }); PIPE("dhAir", "dHead", [[NX, NY + 4.2, 2.0], [NX, NY + 4.6, 2.0], [NX + 1.2, NY + 4.6, 2.0]], 0.04, "rubber");

// ═════ 站 C：載板貼合＋壓膜＋烤箱（s6）═════
const CCX = 174, CCY = 2.0;
LAY("cBase", [18, 2, CCX, 1]); BOX("ccDeck", "cBase", CCX - 9, CCX + 5, 0.3, CCY, -3.2, 3.2, "band"); BOX("ccTop", "cBase", CCX - 9, CCX + 5, CCY, CCY + 0.1, -3.2, 3.2, "panel2");
P({ id: "ccFoot", layer: "cBase", shape: "cyl", size: [0.14, 0.3], rot: V, pos: [0, 0.15, 0], at: [[CCX - 8.6, 0, -2.8], [CCX + 4.6, 0, -2.8], [CCX - 8.6, 0, 2.8], [CCX + 4.6, 0, 2.8]], mat: "dark" });
BOX("ccPlate", "cBase", CCX - 8, CCX - 6, 0.8, 1.2, 3.2, 3.23, "warnY");
// 玻璃載板＋晶圓（翹曲：前、後兩個半圓各沿 x 軸傾斜 6 度；滾輪由後往前滾過時依序壓平）
const CWX = CCX - 4.0, CWY = CCY + 0.1, WR = 2.3;
LAY("cCarrier", [6, 0.3, CWX, CWY + 0.1]); VC("ccGlass", "cCarrier", 2.7, CWY, CWY + 0.25, "glassCar", { x: CWX, z: 0 }); VT("ccGlassEdge", "cCarrier", 2.72, 2.62, CWY + 0.2, CWY + 0.26, "edge", { x: CWX, z: 0 });
const HALF = (sgn) => { const pts = []; for (let i = 0; i <= 24; i++) { const a = Math.PI * i / 24; pts.push([R2(WR * Math.cos(a)), R2(sgn * WR * Math.sin(a))]); } return pts; };
LAY("cWafB", [4.6, 0.5, CWX, CWY + 0.5]); LAY("cWafF", [4.6, 0.5, CWX, CWY + 0.5]);
// poly 在 xy 平面、沿 z 擠出 → rot[-90] 躺平（v→−z）：sgn＋1＝後半（z<0）、−1＝前半；再繞 x 傾斜
P({ id: "cwB", layer: "cWafB", shape: "poly", size: [1, 1, 0.08], pts: HALF(1), pos: [CWX, CWY + 0.3, 0], rot: [-84, 0, 0], mat: "wafer" });
P({ id: "cwF", layer: "cWafF", shape: "poly", size: [1, 1, 0.08], pts: HALF(-1), pos: [CWX, CWY + 0.3, 0], rot: [-96, 0, 0], mat: "wafer" });
P({ id: "cwBd", layer: "cWafB", shape: "box", size: [0.5, 0.05, 0.5], pos: [CWX, CWY + 0.42, -1.0], rot: [6, 0, 0], at: [[-1.2, 0.04, -0.2], [0, 0.04, -0.2], [1.2, 0.04, -0.2], [-0.6, 0.11, -0.9], [0.6, 0.11, -0.9]], mat: "die" });
P({ id: "cwFd", layer: "cWafF", shape: "box", size: [0.5, 0.05, 0.5], pos: [CWX, CWY + 0.42, 1.0], rot: [-6, 0, 0], at: [[-1.2, 0.04, 0.2], [0, 0.04, 0.2], [1.2, 0.04, 0.2], [-0.6, 0.11, 0.9], [0.6, 0.11, 0.9]], mat: "die" });
// 壓膜滾輪（軸沿 x、由後往前滾）：膠膜捲、滾輪、軸、兩側支臂、橫梁
LAY("cRoller", [6, 3, CWX, CWY + 1.5]);
HXC("crRoll", "cRoller", 0.42, CWX - 2.8, CWX + 2.8, CWY + 0.72, -3.0, "rubber"); HXC("crAxle", "cRoller", 0.1, CWX - 3.2, CWX + 3.2, CWY + 0.72, -3.0, "steel");
P({ id: "crMark", layer: "cRoller", shape: "box", size: [5.4, 0.1, 0.1], pos: [CWX, CWY + 1.15, -3.0], mat: "mark" });
P({ id: "crArm", layer: "cRoller", shape: "box", size: [0.2, 1.6, 0.2], pos: [0, CWY + 1.5, -3.0], at: [[CWX - 3.1, 0, 0], [CWX + 3.1, 0, 0]], mat: "steel2" }); BOX("crTop", "cRoller", CWX - 3.2, CWX + 3.2, CWY + 2.2, CWY + 2.4, -3.2, -2.8, "steel2");
HXC("crFilm", "cRoller", 0.65, CWX - 2.8, CWX + 2.8, CWY + 3.1, -3.0, "film"); HXC("crFilmCore", "cRoller", 0.22, CWX - 3.0, CWX + 3.0, CWY + 3.1, -3.0, "steel");
// 烤箱（右）：左側開入口（晶圓從這裡送進去）、正面門框與觀察窗、內膛、加熱管、層架、溫度表
const OX = CCX + 2.4, OY0 = CCY + 0.1, OY1 = CCY + 5.4, SLOT0 = OY0, SLOT1 = CWY + 1.4;
LAY("cOven", [5.4, 6, OX, CCY + 3]);
BOX("coTop", "cOven", OX - 2.6, OX + 2.6, OY1 - 0.3, OY1, -3.0, 3.0, "oven"); BOX("coBot", "cOven", OX - 2.3, OX + 2.6, OY0 - 0.02, OY0, -3.0, 3.0, "oven");
BOX("coBack", "cOven", OX - 2.6, OX + 2.6, OY0, OY1, -3.0, -2.7, "oven"); BOX("coRight", "cOven", OX + 2.3, OX + 2.6, OY0, OY1, -3.0, 3.0, "oven");
BOX("coLeftHigh", "cOven", OX - 2.6, OX - 2.3, SLOT1, OY1, -3.0, 3.0, "oven");
BOX("coSlotFrame", "cOven", OX - 2.66, OX - 2.6, SLOT0, SLOT1, -2.9, 2.9, "dark"); BOX("coInside", "cOven", OX - 2.3, OX + 2.3, OY0 + 0.25, OY1 - 0.3, -2.7, -2.6, "dark");
BOX("coFrontL", "cOven", OX - 2.6, OX - 1.6, OY0, OY1, 2.7, 3.0, "oven"); BOX("coFrontR", "cOven", OX + 1.6, OX + 2.6, OY0, OY1, 2.7, 3.0, "oven");
BOX("coFrontT", "cOven", OX - 1.6, OX + 1.6, OY1 - 1.4, OY1, 2.7, 3.0, "oven"); BOX("coFrontB", "cOven", OX - 1.6, OX + 1.6, OY0, OY0 + 0.6, 2.7, 3.0, "oven");
BOX("coDoorWin", "cOven", OX - 1.6, OX + 1.6, OY0 + 0.6, OY1 - 1.4, 2.8, 2.84, "window");
P({ id: "coHeater", layer: "cOven", shape: "cyl", size: [0.08, 4.0], rot: HX, pos: [OX, 0, -2.0], at: [[0, OY1 - 0.6, 0], [0, OY1 - 0.6, 1.0], [0, OY1 - 0.6, -1.0], [0, OY1 - 2.3, -2.2]], mat: "heat" });
P({ id: "coShelf", layer: "cOven", shape: "box", size: [4.4, 0.05, 5.0], pos: [OX, OY1 - 1.9, 0], mat: "steel" });
VC("coGauge", "cOven", 0.35, 0, 0.06, "white", { x: OX + 2.0, z: 3.05, pos: [OX + 2.0, OY1 - 0.7, 3.03], rot: [0, 0, 0] }); P({ id: "coNeedle", layer: "cOven", shape: "box", size: [0.04, 0.26, 0.02], pos: [OX + 2.0, OY1 - 0.6, 3.08], rot: [0, 0, -30], mat: "lampR" });
BOX("coHandle", "cOven", OX - 1.5, OX - 1.3, OY0 + 1.6, OY0 + 2.8, 3.0, 3.25, "steel2"); SPH("coLed", "cOven", 0.1, OX - 2.0, OY1 - 0.7, 3.06, "lampG");
// 送料軌（從台面延伸進烤箱入口）
P({ id: "coRail", layer: "cOven", shape: "box", size: [9.0, 0.06, 0.12], pos: [OX - 4.5, CWY + 0.03, 0], at: [[0, 0, -1.6], [0, 0, 1.6]], mat: "steel2" });

// ═════ 站 A：光學檢測機（s7）═════
const AX = 208, AY = 2.4;
LAY("aBase", [14, 2.5, AX, 1.2]); BOX("abDeck", "aBase", AX - 6.5, AX + 6.5, 0.3, AY, -3.6, 3.6, "band"); BOX("abTop", "aBase", AX - 6.5, AX + 6.5, AY, AY + 0.1, -3.6, 3.6, "panel2");
P({ id: "abFoot", layer: "aBase", shape: "cyl", size: [0.14, 0.3], rot: V, pos: [0, 0.15, 0], at: [[AX - 6, 0, -3.2], [AX + 6, 0, -3.2], [AX - 6, 0, 3.2], [AX + 6, 0, 3.2]], mat: "dark" });
BOX("abScreen", "aBase", AX + 2.5, AX + 6.0, 0.8, 2.1, 3.6, 3.64, "screen"); BOX("abPlate", "aBase", AX - 6.0, AX - 4.0, 0.8, 1.2, 3.6, 3.63, "warnY");
VC("abChuck", "aBase", 3.0, AY + 0.1, AY + 0.35, "steel2", { x: AX, z: 0 }); VT("abRim", "aBase", 3.05, 2.95, AY + 0.3, AY + 0.4, "dark", { x: AX, z: 0 });
WAFER("aw", "aBase", AX, AY + 0.42, 0, 2.8);
P({ id: "awDie", layer: "aBase", shape: "box", size: [0.6, 0.06, 0.6], pos: [AX, AY + 0.45, 0], at: GXZ(6, 6, 0.9, 0.9, -2.25, -2.25).filter(([x, , z]) => Math.hypot(x, z) < 2.4 && !(Math.abs(x - 0.45) < 0.1 && Math.abs(z + 0.45) < 0.1)), mat: "die" });
P({ id: "awFillet", layer: "aBase", shape: "tube", size: [0.42, 0.33, 0.04], rot: V, pos: [AX, AY + 0.44, 0], at: GXZ(6, 6, 0.9, 0.9, -2.25, -2.25).filter(([x, , z]) => Math.hypot(x, z) < 2.4 && !(Math.abs(x - 0.45) < 0.1 && Math.abs(z + 0.45) < 0.1) && !(Math.abs(x + 1.35) < 0.1 && Math.abs(z - 1.35) < 0.1)), mat: "uf" });
LAY("aBad", [1, 0.2, AX + 0.45, AY + 0.5]); P({ id: "abBadDie", layer: "aBad", shape: "box", size: [0.6, 0.06, 0.6], pos: [AX + 0.55, AY + 0.45, -0.38], rot: [0, 14, 0], mat: "die" });
P({ id: "abNoUf", layer: "aBad", shape: "tube", size: [0.42, 0.33, 0.03], rot: V, pos: [AX - 1.35, AY + 0.44, 1.35], mat: "ng" });
LAY("aFlag", [3, 0.3, AX, AY + 0.6]); P({ id: "afBox", layer: "aFlag", shape: "tube", size: [0.75, 0.6, 0.05], rot: V, pos: [AX + 0.5, AY + 0.52, -0.4], mat: "ng" }); P({ id: "afBox2", layer: "aFlag", shape: "tube", size: [0.7, 0.55, 0.05], rot: V, pos: [AX - 1.35, AY + 0.52, 1.35], mat: "ng" });
// 龍門＋相機頭（相機頭沿 x 來回掃）
LAY("aGantry", [12, 2, AX, AY + 4.5]);
BOX("agBeam", "aGantry", AX - 5.5, AX + 5.5, AY + 4.6, AY + 5.2, -0.4, 0.4, "panel"); P({ id: "agPost", layer: "aGantry", shape: "box", size: [0.6, 5.1, 0.8], pos: [0, AY + 2.65, 0], at: [[AX - 5.8, 0, 0], [AX + 5.8, 0, 0]], mat: "panel2" }); BOX("agRail", "aGantry", AX - 5.2, AX + 5.2, AY + 4.5, AY + 4.6, -0.2, 0.2, "steel2");
LAY("aCam", [1.2, 2.4, AX - 2.6, AY + 3.4]);
BOX("acBox", "aCam", AX - 3.1, AX - 2.1, AY + 3.6, AY + 4.5, -0.5, 0.5, "cam"); VC("acLens", "aCam", 0.3, AY + 2.6, AY + 3.6, "cam", { x: AX - 2.6, z: 0 }); VC("acGlass", "aCam", 0.27, AY + 2.57, AY + 2.62, "lens", { x: AX - 2.6, z: 0 });
VT("acRing", "aCam", 0.55, 0.38, AY + 2.45, AY + 2.57, "ring", { x: AX - 2.6, z: 0 }); P({ id: "acCable", layer: "aCam", shape: "box", size: [0.06, 0.06, 1.0], pos: [AX - 2.2, AY + 4.4, -0.5], mat: "rubber" }); BOX("acLabel", "aCam", AX - 2.9, AX - 2.3, AY + 3.8, AY + 4.1, 0.5, 0.53, "white");
// 比對螢幕小窗（機台正面立著：左＝標準、右＝拍到的）
LAY("aMon", [3.2, 2.4, AX + 4.6, AY + 2.4]);
BOX("amFrame", "aMon", AX + 3.0, AX + 6.2, AY + 1.3, AY + 3.5, -3.1, -2.9, "dark"); BOX("amStand", "aMon", AX + 4.5, AX + 4.7, AY + 0.1, AY + 1.3, -3.05, -2.95, "steel");
BOX("amL", "aMon", AX + 3.1, AX + 4.55, AY + 1.45, AY + 3.35, -2.9, -2.88, "screen"); BOX("amR", "aMon", AX + 4.65, AX + 6.1, AY + 1.45, AY + 3.35, -2.9, -2.88, "screen");
P({ id: "amDieL", layer: "aMon", shape: "box", size: [0.32, 0.32, 0.02], pos: [0, 0, -2.87], at: GXZ(3, 3, 0.42, 0.42, AX + 3.41, 0).map(([x, , z]) => [x, R2(AY + 1.98 + z), 0]).concat([]), mat: "die" });
P({ id: "amDieR", layer: "aMon", shape: "box", size: [0.32, 0.32, 0.02], pos: [0, 0, -2.87], at: GXZ(3, 3, 0.42, 0.42, AX + 4.96, 0).map(([x, , z]) => [x, R2(AY + 1.98 + z), 0]).filter((_, i) => i !== 2), mat: "die" });
P({ id: "amBad", layer: "aMon", shape: "box", size: [0.32, 0.32, 0.02], pos: [AX + 5.86, AY + 2.04, -2.86], rot: [0, 0, 14], mat: "die" }); P({ id: "amRed", layer: "aMon", shape: "tube", size: [0.3, 0.25, 0.02], pos: [AX + 5.82, AY + 2.02, -2.85], mat: "ng" });

// ═════ 站 K：三家公司機台模組（s8）＋文字名牌 ═════
const KX = 242;
{ const r = spawnSync("node", [path.join(HERE, "..", "..", "scripts", "three", "make-brand-tex.mjs"), "tech-pkgequip", "text:hanmi=韓美|Hanmi", "text:allring=萬潤|6187", "text:csun=志聖|2467"], { encoding: "utf8" }); if (r.status !== 0) { console.error(r.stderr); process.exit(1); } }
const SIGNM = JSON.parse(fs.readFileSync(path.join(HERE, "..", "..", "public", "tex", "brand", "meta.json"), "utf8"));
LAY("kBase", [18, 1, KX, 0.4]); BOX("kbPl", "kBase", KX - 9, KX + 9, 0, 0.8, -3.6, 3.6, "band"); BOX("kbTop", "kBase", KX - 9, KX + 9, 0.8, 0.9, -3.6, 3.6, "panel2");
[["hanmi", -5.2, "heat"], ["allring", 0, "warnY"], ["csun", 5.2, "screen"]].forEach(([sid, dx, acc], i) => { const x = KX + dx, ly = `kMod${i}`;
  LAY(ly, [5, 6.5, x, 3.6]); CAB(`k${i}`, ly, x - 2.3, x + 2.3, 0.9, 4.9, -1.8, 1.8, { tower: true });
  BOX(`k${i}Win`, ly, x - 1.8, x + 0.8, 2.7, 4.2, 1.8, 1.84, "window"); BOX(`k${i}Acc`, ly, x - 2.3, x + 2.3, 4.9, 5.1, -1.8, 1.8, acc);
  if (i === 0) { BOX("k0Head", ly, x - 0.8, x + 0.8, 5.3, 6.1, -0.6, 0.6, "steel2"); BOX("k0Heat", ly, x - 0.9, x + 0.9, 5.1, 5.3, -0.7, 0.7, "hot"); VC("k0Shaft", ly, 0.18, 6.1, 6.9, "steel", { x, z: 0 }); for (let k = 0; k < 8; k++) BOX(`k0L${k}`, ly, x - 0.6, x + 0.6, R2(3.0 + k * 0.12), R2(3.08 + k * 0.12), 0.3, 1.2, k % 2 ? "die" : "dieTop"); }
  if (i === 1) { VC("k1Syr", ly, 0.38, 5.5, 7.0, "window", { x, z: 0 }); VC("k1Glue", ly, 0.32, 5.55, 6.6, "uf", { x, z: 0 }); VC("k1Ndl", ly, 0.06, 5.1, 5.5, "steel", { x, z: 0 }); VC("k1Cam", ly, 0.25, 5.1, 6.0, "cam", { x: x + 1.0, z: 0 }); VT("k1Ring", ly, 0.4, 0.26, 5.05, 5.15, "ring", { x: x + 1.0, z: 0 }); }
  if (i === 2) { HXC("k2Roll", ly, 0.45, x - 1.6, x + 1.6, 5.6, 0, "rubber"); HXC("k2Film", ly, 0.6, x - 1.6, x + 1.6, 6.6, -0.4, "film"); BOX("k2Glow", ly, x - 1.8, x + 0.8, 2.7, 4.2, 1.85, 1.9, "hot"); }
  const sg = SIGNM[`sign-${sid}`], sw = 3.6; P({ id: `k${i}Sign`, layer: ly, shape: "plane", size: [sw, R2(sw / sg.aspect)], pos: [x, 0.45, 3.62], uv01: true, shadow: false, mat: `t_${sid}` });
  materials[`t_${sid}`] = { kind: "unlit", color: "#FFFFFF", img: `tex/brand/sign-${sid}.png` }; });

// ═════ 站 S：載板剖面（s9）：多層絕緣膜＋銅線＋導通孔＋錫球；封好的晶片放到載板 ═════
const SX = 276, SB = 1.0;
LAY("sBase", [14, 1, SX, 0.5]); BOX("ssPl", "sBase", SX - 7, SX + 7, 0, SB, -3.2, 3.2, "band");
P({ id: "ssBall", layer: "sBase", shape: "sphere", size: [0.18], pos: [0, SB + 0.15, 2.4], at: Array.from({ length: 21 }, (_, i) => [R2(SX - 5 + i * 0.5), 0, 0]), mat: "bump" });
LAY("sSub", [11, 2, SX, SB + 1.3]);
const SL = [["subG", 0.3], ["abf", 0.22], ["subY", 0.5], ["abf", 0.22], ["subG", 0.3]]; let sy = SB + 0.3;
SL.forEach(([m, t], i) => { BOX(`ssL${i}`, "sSub", SX - 5.5, SX + 5.5, sy, R2(sy + t), -2.6, 2.6, m); if (m === "abf") P({ id: `ssVia${i}`, layer: "sSub", shape: "cyl", size: [0.07, t], rot: V, pos: [0, R2(sy + t / 2), 2.61], at: Array.from({ length: 10 }, (_, k) => [R2(SX - 4.5 + k * 1.0), 0, 0]), mat: "copper" });
  P({ id: `ssCu${i}`, layer: "sSub", shape: "box", size: [0.7, 0.04, 0.05], pos: [0, R2(sy + t + 0.01), 2.62], at: Array.from({ length: 9 }, (_, k) => [R2(SX - 4.0 + k * 1.0), 0, 0]), mat: "copper" }); sy = R2(sy + t); });
const STOP = sy;
LAY("sAbfGlow", [11, 0.3, SX, SB + 1.0]); BOX("sagA", "sAbfGlow", SX - 5.52, SX + 5.52, SB + 0.6, SB + 0.82, 2.6, 2.64, "bracket"); BOX("sagB", "sAbfGlow", SX - 5.52, SX + 5.52, SB + 1.32, SB + 1.54, 2.6, 2.64, "bracket");
LAY("sPkg", [7, 2, SX, STOP + 1]);
BOX("spInt", "sPkg", SX - 3.5, SX + 3.5, STOP + 0.25, STOP + 0.5, -2.2, 2.2, "wafer"); DIE("spG", "sPkg", SX - 0.8, STOP + 0.55, 0, 2.6, 2.6, 0.5, { bumps: false }); DIE("spM0", "sPkg", SX + 2.3, STOP + 0.55, -1.0, 1.4, 1.5, 0.9, { bumps: false, mat: "dieTop" }); DIE("spM1", "sPkg", SX + 2.3, STOP + 0.55, 1.0, 1.4, 1.5, 0.9, { bumps: false, mat: "dieTop" });
P({ id: "spBump", layer: "sPkg", shape: "sphere", size: [0.11], pos: [0, STOP + 0.13, 2.0], at: Array.from({ length: 13 }, (_, i) => [R2(SX - 3.0 + i * 0.5), 0, 0]), mat: "bump" });

// ═════ 動作 ═════
actions.wAlign = { type: "pulse", _說明: "對位環與十字線亮起（s1）", parts: ["wRingT", "wCross", "wCross2"], color: "edgeC", glow: 1, freq: 1.2, halo: 0 };
actions.lnFlow = { type: "flow", _說明: "晶圓沿 U 形輸送軌一站一站往前（示意）", layer: "line", path: [[LX - 9, 1.3, 6.3], [LX + 9.3, 1.3, 6.3], [LX + 9.3, 1.3, -1.3], [LX - 6, 1.3, -1.3]], n: 5, size: 0.14, shape: "arrow", rate: 0.12, color: "sigC", track: true, band: 0.04, bandO: 0.3, free: true, jitter: 0 };
actions.lnLamp = { type: "pulse", _說明: "五站的標籤牌與加熱頭、烤窗亮", parts: ["ln0Tag", "ln1Tag", "ln2Tag", "ln3Tag", "ln4Tag", "lnF1Heat", "lnF3Glow", "lnF4Ring"], color: "lampY", glow: 0.7, freq: 0.8, halo: 0 };
actions.bPinUp = { type: "vibrate", _說明: "頂針由下往上把一顆晶粒頂起", parts: ["bpPin", "bpkB", "bpkT", "bpkBump"], axis: [0, 1, 0], amp: 0.12, freq: 0.6 };
actions.bFlipTurn = { type: "rotate", _說明: "翻轉器吸住晶粒、繞 z 軸翻 180 度（接點朝下），有加減速，翻完停住", parts: [...idsOf("bFlip"), ...idsOf("bFlipDie")], axis: [0, 0, 1], pivot: [FLX, FLY, FZ], angle: 180, hold: true };
actions.bSuck = { type: "pulse", _說明: "吸嘴真空吸附（亮綠）", parts: ["bhdTip", "bflNoz"], color: "lampG", glow: 1, freq: 1.5, halo: 0 };
actions.bCamGlow = { type: "pulse", _說明: "對位相機環形燈亮、拍照對位", parts: ["bcmRing", "bcmGlassD"], color: "edgeC", glow: 1, freq: 2.0, halo: 0.4 };
actions.tHeat = { type: "pulse", _說明: "加熱器由暗到亮橘（熱壓）", parts: ["thHeater", "thCoil", "thTool"], color: "hotC", glow: 1, freq: 0.6, halo: 0.6, steady: true };
actions.tFilGlow = { type: "pulse", _說明: "膠膜受熱變軟、從邊緣擠出膠邊", parts: Array.from({ length: 12 }, (_, k) => `tL${k}F`), color: "ncfC", glow: 0.9, freq: 0.9, halo: 0 };
actions.dDrop = { type: "flow", _說明: "膠受重力從針頭落到晶片邊緣", layer: "dHead", path: [[NX, NY - 0.02, 2.0], [NX, DIEB - 0.1, 2.0]], n: 3, size: 0.12, shape: "dot", rate: 1.0, color: "ufC", track: false, accel: true, free: true, jitter: 0.01 };
actions.dWick = { type: "flow", _說明: "毛細作用：膠前緣從邊緣往縫裡推進（先快後慢）", layer: "dSub", path: [[DX - 3.0, DY0 + 0.95, 2.3], [DX + 3.0, DY0 + 0.95, 2.3]], n: 6, lanes: 2, phase: -4, laneDir: [0, 1, 0], laneGap: 0.2, size: 0.09, shape: "dot", rate: 0.25, color: "ufD", track: false, free: true, jitter: 0.03 };
actions.dHot = { type: "pulse", _說明: "加熱台保溫（膠比較好流）", parts: ["ddHot"], color: "heatC", glow: 0.5, freq: 0.5, halo: 0, steady: true };
actions.cRoll = { type: "rotate", _說明: "壓膜滾輪由後往前滾過晶圓（表面速度≈前進速度）", parts: ["crRoll", "crMark", "crAxle"], axis: [1, 0, 0], pivot: [0, CWY + 0.72, -3.0], rps: 0.9 };
actions.cFlatB = { type: "rotate", _說明: "翹起的晶圓後半被滾輪壓平（繞 x 軸轉回水平）", parts: ["cwB", "cwBd"], axis: [1, 0, 0], pivot: [CWX, CWY + 0.3, 0], angle: -6, hold: true };
actions.cFlatF = { type: "rotate", parts: ["cwF", "cwFd"], axis: [1, 0, 0], pivot: [CWX, CWY + 0.3, 0], angle: 6, hold: true };
actions.cOvenHeat = { type: "pulse", _說明: "烤箱加熱管亮橘", parts: ["coHeater"], color: "hotC", glow: 1, freq: 0.7, halo: 0.3 };
actions.aRing = { type: "pulse", _說明: "環形燈打光拍照", parts: ["acRing", "acGlass"], color: "edgeC", glow: 1, freq: 2.2, halo: 0.3 };
actions.aNg = { type: "pulse", _說明: "異常處（歪掉的晶片、缺膠）紅框閃", parts: ["afBox", "afBox2", "abNoUf"], color: "ngC", glow: 1, freq: 1.6, halo: 0.4 };
actions.kGlow = { type: "pulse", parts: ["k0Acc", "k1Acc", "k2Acc", "k0Heat", "k2Glow"], color: "lampY", glow: 0.7, freq: 0.9, halo: 0 };
actions.sSig = { type: "flow", _說明: "訊號從晶片經中介層、載板銅線、錫球往下拉出去", layer: "sSub", path: [[SX - 0.8, STOP + 1.3, 2.65], [SX - 0.8, STOP + 0.2, 2.65], [SX - 0.8, SB + 1.3, 2.65], [SX - 3.0, SB + 1.3, 2.65], [SX - 3.0, SB + 0.4, 2.65], [SX - 3.0, SB + 0.1, 2.65]], n: 6, size: 0.12, shape: "dot", rate: 0.4, color: "sigC", track: true, band: 0.04, bandO: 0.4, free: true, jitter: 0 };
actions.sAbf = { type: "pulse", _說明: "載板裡的絕緣膜（預告）亮起", parts: ["sagA", "sagB"], color: "lampY", glow: 1, freq: 1.0, halo: 0 };

Object.assign(anchors, {
  wDie: A("wDies", [WX - 0.2, 2.65, 0.7], -150, -90), wPad: A("wWafer", [WX + 0.3, 1.2, 1.0], 150, 100),
  line0: A("line", [LX - 6.2, 4.4, 3.5], -120, -110),
  bHood: A("bHood", [BX - 5.0, 7.9, 3.6], -150, -90), bDeck: A("bBase", [BX - 5.0, BY, 3.8], -150, 100), bHead: A("bHead", [HX0 + 0.25, GY - 1.0, 0.25], -150, -80), bCam: A("bCam", [CAMX + 0.55, GY - 1.0, 1.4], 150, -90), bFlip: A("bFlip", [FLX - 1.2, FLY + 0.1, FZ + 0.12], -150, 100), bWafer: A("bChuck", [CX - 0.45, CY + 0.12, 0.3], 150, 100),
  tHeater: A("tHead", [TX + 1.6, THY + 0.45, 1.25], 150, -90), tStack: A("tL5", [TX + SW / 2, LAYY(5) + 0.1, SD / 2], 150, 90), tNcf: A("tL11", [TX - SW / 2, LAYY(11) + 0.03, SD / 2 + 0.1], -150, 90),
  dNeedle: A("dHead", [NX, NY + 0.4, 2.0], -150, -90), dUf: A("dUf2", [DX - 0.5, DY0 + 0.95, 2.2], 150, 100),
  cWafer: A("cWafF", [CWX + 1.6, CWY + 0.45, 1.6], 150, -90), cRoll: A("cRoller", [CWX + 2.6, CWY + 0.72, -2.6], 150, -90), cOven: A("cOven", [OX + 2.2, CCY + 4.0, 3.0], 150, -90),
  aCam: A("aCam", [AX - 2.6, AY + 3.2, 0.3], -150, -90), aNg: A("aFlag", [AX + 0.5, AY + 0.5, -0.4], 150, -100),
  sAbf: A("sAbfGlow", [SX + 4.5, SB + 1.4, 2.62], 150, -100), sPkg: A("sPkg", [SX - 0.8, STOP + 1.05, 1.3], -150, -90),
});

const model = {
  name: "示意 先進封裝設備：封裝線全景、覆晶接合機（外殼、晶粒供料台、頂針、翻轉器、龍門接合頭、對位相機、晶圓吸盤）、熱壓接合頭與記憶體疊層、點膠剖面、載板貼合壓膜與烤箱、光學檢測機、三家公司機台模組、載板剖面（示意，非特定廠牌／型號）",
  unit: "示意（機台 1＝約 10 cm；晶片疊層與點膠剖面放大）",
  size: { w: 40, h: 18, r: 0.6, t: 30 },
  palette, materials,
  partNames: { bHead: "接合頭", tHead: "熱壓接合頭", dHead: "點膠頭", aCam: "相機頭" },
  layers, parts, anchors, actions,
  pose: { yaw0: 0, yawIso: 0, drift: 0 },
  camera: { stand: { d: 70, elev: 24, y: 4 } },
  fx: { dpr: 1, srcPx: 30, shadows: 0, fog: false, dust: false, vaporSprites: false, shimmer: false },
  info: { WX, LX, BX, TX, DX, CCX, AX, KX, SX, LAYY: Array.from({ length: 12 }, (_, k) => LAYY(k)), FLX, FLY, FZ, HX0, CX, CY, GY, CAMX, FX, FY, NX, CWX, OX },
};
fs.writeFileSync(path.join(HERE, "model.json"), JSON.stringify(model, null, 1) + "\n");
console.log(`✔ model.json：${parts.length} 個零件、${parts.reduce((a, p) => a + Math.max(1, (p.at?.length ?? 0)), 0)} 個實體（含複製）、${layers.length} 層`);

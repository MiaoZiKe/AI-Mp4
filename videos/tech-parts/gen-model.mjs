// node videos/tech-parts/gen-model.mjs → 寫 videos/tech-parts/model.json
// 2026/11/27 tech-parts（零組件耗材，系列 2 第 18 集）。構造與物理照 physics-spec.md，模組清單與細節見 visual-spec.md。
// 單位：1＝10 cm（示意，不按真實比例），地板頂面 y＝0，x 向右、z 向觀眾。站點：
//   A 蝕刻腔體剖面一角（x 0；腔壁、陶瓷內襯、頂電極、射頻線圈、吸盤、邊緣環、晶圓、電漿）｜B 邊緣環剖面（x 33；被打薄、電場延伸）
//   S 靜電吸盤爆炸站（x 96）｜C 新舊邊緣環對照＋更換（x 66）｜E 陶瓷／金屬表面對照（x 128）｜P 真空泵、閥門、電源（x 150）
//   K 供應商展台（x 180）｜R 無塵室（x 215）。示意，非特定廠牌／型號；不標壽命小時數、市占。
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
  floorC: "#C9D2DE", panel: "#F3F5F8", panel2: "#E2E8F0", seam: "#8E9BB0", band: "#24324C", steel: "#7D8CA6", steel2: "#A9B5C7", dark: "#3E4A60", backC: "#2B3650",
  glassC: "#BFD3F2", lampY: "#F2B632", lampG: "#2FBF71", lampR: "#E5484D", rubber: "#2B2F36", gold: "#C9A24A", estop: "#D93A2B", cutC: "#6E809C",
  cerC: "#F2EBDD", cerDC: "#D9CDB4", quartzC: "#DDF0F4", siC: "#4A5468", sicC: "#2E3340", cuC: "#C47B3E", cuDC: "#A9622D", aluC: "#B8C2D2",
  plasmaC: "#8E7CF6", plasmaPC: "#F06FB8", sheathC: "#2B2250", ionC: "#FFD35A", debrisC: "#3B3427", chipC: "#F4F1EA", heC: "#7FD3F5", plusC: "#E5484D", minusC: "#2F7FE0",
  markC: "#E8613C", brassC: "#C8A24A", yellowBr: "#F2B632", hoseB: "#3E7BD6", hoseR: "#D9534F", wallW: "#F4F6FA", pumpC: "#5C7396", cabC: "#EDEFF3", airC: "#9FD8F5", ffuC: "#FFFFFF", amberC: "#F29A4A",
};
const M = (kind, color, o = {}) => ({ kind, color, ...o });
const glowM = (c, op, ei = 1) => M("std", c, { emissive: c, ei, opacity: op, rough: 1, metal: 0 });
const materials = {
  floor: M("std", "floorC", { rough: 0.7, metal: 0.3, tex: "brushed", texScale: 3 }), panel: M("std", "panel", { rough: 0.55, metal: 0.05, env: 0.25 }), panel2: M("std", "panel2", { rough: 0.6, metal: 0.05, env: 0.2 }),
  seam: M("std", "seam", { rough: 0.6, metal: 0.3 }), band: M("std", "band", { rough: 0.4, metal: 0.3, env: 0.4 }), back: M("std", "backC", { rough: 0.7, metal: 0.1 }),
  steel: M("std", "steel", { rough: 0.35, metal: 0.85, env: 0.5 }), steel2: M("std", "steel2", { rough: 0.3, metal: 0.8, env: 0.6, tex: "brushed", texScale: 2 }), alu: M("std", "aluC", { rough: 0.3, metal: 0.8, env: 0.6, tex: "brushed", texScale: 1.6 }),
  dark: M("std", "dark", { rough: 0.5, metal: 0.4, env: 0.3 }), rubber: M("std", "rubber", { rough: 0.9, metal: 0 }), gold: M("std", "gold", { rough: 0.3, metal: 0.9, env: 0.8 }),
  window: M("phys", "glassC", { rough: 0.05, metal: 0, clearcoat: 1, opacity: 0.3, env: 0.6 }), cut: M("std", "cutC", { rough: 0.8, metal: 0.2 }),
  lampY: M("std", "lampY", { emissive: "lampY", ei: 0.4, rough: 0.4, metal: 0 }), lampG: M("std", "lampG", { emissive: "lampG", ei: 0.35, rough: 0.4, metal: 0 }), lampR: M("std", "lampR", { emissive: "lampR", ei: 0.3, rough: 0.4, metal: 0 }), estop: M("std", "estop", { rough: 0.4, metal: 0, emissive: "estop", ei: 0.15 }),
  cer: M("std", "cerC", { rough: 0.9, metal: 0, env: 0.15 }), cerD: M("std", "cerDC", { rough: 0.95, metal: 0 }), quartz: M("phys", "quartzC", { rough: 0.05, metal: 0, clearcoat: 1, opacity: 0.62, env: 0.8 }), quartzOld: M("phys", "cerDC", { rough: 0.55, metal: 0, opacity: 0.8, env: 0.3 }),
  si: M("std", "siC", { rough: 0.2, metal: 0.65, env: 0.9 }), sic: M("std", "sicC", { rough: 0.85, metal: 0.2, env: 0.2 }), cu: M("std", "cuC", { rough: 0.3, metal: 0.95, env: 0.8 }), cuD: M("std", "cuDC", { rough: 0.35, metal: 0.95, env: 0.7 }),
  plasma: glowM("plasmaC", 0.2, 0.7), plasmaCore: glowM("plasmaC", 0.14, 1.0), plasmaP: glowM("plasmaPC", 0.22, 0.8), sheath: M("std", "sheathC", { rough: 1, metal: 0, opacity: 0.4 }),
  ion: glowM("ionC", 0.95, 0.9), debris: glowM("debrisC", 0.95, 0.1), chip: glowM("chipC", 0.95, 0.4), he: glowM("heC", 0.95, 0.7), plus: glowM("plusC", 0.95, 0.9), minus: glowM("minusC", 0.95, 0.9), mark: M("std", "markC", { rough: 0.5, metal: 0, emissive: "markC", ei: 0.25 }),
  spark: glowM("ionC", 0.9, 1.4), bracket: M("std", "yellowBr", { rough: 0.5, metal: 0, emissive: "yellowBr", ei: 0.35 }), warnY: M("std", "lampY", { rough: 0.5, metal: 0, emissive: "lampY", ei: 0.2 }),
  brass: M("std", "brassC", { rough: 0.3, metal: 0.9, env: 0.7 }), hoseB: M("std", "hoseB", { rough: 0.35, metal: 0.3 }), hoseR: M("std", "hoseR", { rough: 0.35, metal: 0.3 }),
  wallW: M("std", "wallW", { rough: 0.6, metal: 0.05, env: 0.3 }), pump: M("std", "pumpC", { rough: 0.45, metal: 0.5, env: 0.5 }), cab: M("std", "cabC", { rough: 0.55, metal: 0.1, env: 0.3 }), screen: M("std", "hoseB", { emissive: "hoseB", ei: 0.5, rough: 0.3, metal: 0 }),
  air: glowM("airC", 0.85, 0.7), ffu: M("std", "ffuC", { emissive: "ffuC", ei: 0.7, rough: 0.5, metal: 0 }), hot: glowM("amberC", 0.9, 0.9), edge: glowM("ffuC", 0.95, 0.6),
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


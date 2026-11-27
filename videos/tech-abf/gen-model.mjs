// node videos/tech-abf/gen-model.mjs → 寫 videos/tech-abf/model.json
// 2026/11/27 tech-abf（ABF-1：ABF 膜，系列 3 第 7 集）。構造與物理照 physics-spec.md、模組清單與爆炸步驟照 visual-spec.md。
// 單位：示意（封裝站 1＝1 mm；設備站 1＝10 cm），地板 y＝0，x 向右、z 向觀眾。站點（相隔 ≥25，換幕硬切）：
//   K 封裝＋載板＋主機板爆炸剖面（x 0）｜M 增層放大剖面＝大樓（x 30）｜L 貼膜：膜捲、真空壓膜機、烘烤爐（x 60）｜D 雷射鑽孔（x 90）
//   S 半加成法剖面＋電鍍槽（x 120）｜A 一般處理器載板 vs AI 晶片載板（x 150）｜J 味之素（日本）、晶化科技（台灣）（x 180）｜N 下一集：載板大板（x 210）
//   示意，非特定廠牌／型號；不標膜厚、線寬、溫度。
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
const HERE = path.dirname(new URL(import.meta.url).pathname);

const R2 = (x) => Math.round(x * 1000) / 1000;
const D2R = Math.PI / 180;
const pol = (aDeg, r) => [R2(r * Math.cos(aDeg * D2R)), R2(r * Math.sin(aDeg * D2R))];
let seed = 20261220;
const rnd = () => { seed |= 0; seed = (seed + 0x6d2b79f5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
const palette = {
  floorC: "#C9D2DE", panel: "#F3F5F8", panel2: "#E2E8F0", extC: "#D9DEE6", seam: "#8E9BB0", band: "#24324C", steel: "#7D8CA6", steel2: "#A9B5C7", dark: "#3E4A60",
  glassC: "#BFD3F2", lampY: "#F2B632", lampG: "#2FBF71", lampR: "#E5484D", screen: "#5B8DEF", rubber: "#2B2F36", gold: "#C9A24A", estop: "#D93A2B",
  frpC: "#3F7FC4", carbonC: "#4A4F58", roC: "#F4F6F8", waterC: "#4FA3E8", upwC: "#BFE9FF", rawC: "#C9B27A", impC: "#D9822B", ionC: "#E5484D", orgC: "#7A5A3A", bactC: "#3FBF4F",
  uvC: "#9B7CFF", quartzC: "#E6F2F6", beadA: "#E8A33C", beadB: "#B8562E", motorR: "#C8443A", motorB: "#3E7BD6", pipeW: "#E9EEF4", pipeCl: "#CFE7FA", gasPipe: "#D7DEE8",
  cableO: "#E8862B", powC: "#FFD34D", battC: "#2E3440", battG: "#3FD07A", porcC: "#8A4B2E", transC: "#6F8197", upsC: "#4A5468",
  aluC: "#C8CED8", lnC: "#F4F7FA", frostC: "#FFFFFF", n2C: "#7FE3E8", liqC: "#3A7BD5", soilC: "#B7946A", markY: "#F2B632", warnY: "#F2B632",
  chillC: "#3B8FE0", condC: "#E8743B", plumeC: "#FFFFFF", heatC: "#E5602B", pcbC: "#2F7A4A", ceramC: "#E8E2D4", siC: "#5E6B82", dieC: "#8D9BB5", padAu: "#D8B04A", needleC: "#D9DEE6",
  roofC: "#B9C2CF", grateC: "#9AA6B8", ffuC: "#F7FAFF", towerC: "#DCE3EC", markC: "#E8613C", insulC: "#D5DBE3", soilD: "#8B6B45", tankC: "#B9C9D8", n2wC: "#1F6A78",
};
const M = (kind, color, o = {}) => ({ kind, color, ...o });
const glowM = (c, op, ei = 1) => M("std", c, { emissive: c, ei, opacity: op, rough: 1, metal: 0 });
const materials = {
  floor: M("std", "floorC", { rough: 0.7, metal: 0.3, tex: "brushed", texScale: 3 }),
  panel: M("std", "panel", { rough: 0.55, metal: 0.05, env: 0.25 }), panel2: M("std", "panel2", { rough: 0.6, metal: 0.05, env: 0.2 }), ext: M("std", "extC", { rough: 0.6, metal: 0.1, env: 0.25 }),
  seam: M("std", "seam", { rough: 0.6, metal: 0.3 }), band: M("std", "band", { rough: 0.4, metal: 0.3, env: 0.4 }),
  steel: M("std", "steel", { rough: 0.35, metal: 0.85, env: 0.5 }), steel2: M("std", "steel2", { rough: 0.3, metal: 0.8, env: 0.6, tex: "brushed", texScale: 2 }),
  steelCut: M("phys", "steel2", { rough: 0.3, metal: 0.6, opacity: 0.42, env: 0.6 }),
  dark: M("std", "dark", { rough: 0.5, metal: 0.4, env: 0.3 }), rubber: M("std", "rubber", { rough: 0.9, metal: 0 }), gold: M("std", "gold", { rough: 0.3, metal: 0.9, env: 0.8 }),
  window: M("phys", "glassC", { rough: 0.05, metal: 0, clearcoat: 1, opacity: 0.3, env: 0.6 }), glassDark: M("std", "band", { rough: 0.1, metal: 0.4, env: 0.9 }),
  lampY: M("std", "lampY", { emissive: "lampY", ei: 0.4, rough: 0.4, metal: 0 }), lampG: M("std", "lampG", { emissive: "lampG", ei: 0.5, rough: 0.4, metal: 0 }),
  lampR: M("std", "lampR", { emissive: "lampR", ei: 0.9, rough: 0.4, metal: 0 }), lampOff: M("std", "seam", { rough: 0.4, metal: 0.1 }), estop: M("std", "estop", { rough: 0.4, metal: 0, emissive: "estop", ei: 0.15 }),
  screen: M("std", "screen", { emissive: "screen", ei: 0.5, rough: 0.3, metal: 0 }),
  frp: M("std", "frpC", { rough: 0.45, metal: 0.05, env: 0.35 }), carbon: M("std", "carbonC", { rough: 0.6, metal: 0.2 }), ro: M("std", "roC", { rough: 0.4, metal: 0.05, env: 0.3 }),
  pipeW: M("std", "pipeW", { rough: 0.35, metal: 0.05, env: 0.3 }), pipeCl: M("phys", "pipeCl", { rough: 0.1, metal: 0, clearcoat: 1, opacity: 0.4, env: 0.6 }),
  gasPipe: M("phys", "gasPipe", { rough: 0.2, metal: 0.6, clearcoat: 0.6, opacity: 0.45, env: 0.8 }), pipeBlue: M("std", "frpC", { rough: 0.35, metal: 0.4, env: 0.4 }),
  pipeGreen: M("std", "pcbC", { rough: 0.35, metal: 0.3, env: 0.4 }),
  water: M("phys", "waterC", { rough: 0.05, metal: 0, clearcoat: 1, opacity: 0.45, env: 0.6 }),
  upwDot: glowM("upwC", 0.95, 0.7), rawDot: glowM("rawC", 0.95, 0.4), impDot: glowM("impC", 0.95, 0.6), ionDot: glowM("ionC", 0.95, 0.6), orgDot: glowM("orgC", 0.95, 0.3),
  bact: M("std", "bactC", { emissive: "bactC", ei: 0.6, rough: 0.8, metal: 0 }),
  uv: glowM("uvC", 0.95, 1.2), quartz: M("phys", "quartzC", { rough: 0.05, metal: 0, clearcoat: 1, opacity: 0.55, env: 0.8 }),
  beadA: M("std", "beadA", { rough: 0.3, metal: 0, env: 0.5 }), beadB: M("std", "beadB", { rough: 0.3, metal: 0, env: 0.5 }),
  motorR: M("std", "motorR", { rough: 0.4, metal: 0.3, env: 0.4 }), motorB: M("std", "motorB", { rough: 0.4, metal: 0.3, env: 0.4 }),
  cable: M("std", "cableO", { rough: 0.5, metal: 0.1 }), powDot: glowM("powC", 0.95, 1.0), battDot: glowM("battG", 0.95, 1.0),
  porc: M("std", "porcC", { rough: 0.25, metal: 0, env: 0.6 }), trans: M("std", "transC", { rough: 0.45, metal: 0.4, env: 0.4 }), ups: M("std", "upsC", { rough: 0.5, metal: 0.3, env: 0.3 }),
  batt: M("std", "battC", { rough: 0.7, metal: 0.1 }),
  alu: M("std", "aluC", { rough: 0.3, metal: 0.8, env: 0.6, tex: "brushed", texScale: 2 }), aluCut: M("phys", "aluC", { rough: 0.3, metal: 0.5, opacity: 0.32, env: 0.6 }),
  ln: M("std", "lnC", { rough: 0.35, metal: 0.2, env: 0.5 }), frost: M("std", "frostC", { rough: 1, metal: 0, opacity: 0.85 }),
  n2Dot: glowM("n2C", 0.95, 0.8), liqDot: glowM("liqC", 0.95, 0.6), soil: M("phys", "soilC", { rough: 0.9, metal: 0, opacity: 0.42 }), soilD: M("std", "soilD", { rough: 0.95, metal: 0 }),
  chill: M("std", "chillC", { rough: 0.4, metal: 0.4, env: 0.4 }), cond: M("std", "condC", { rough: 0.4, metal: 0.4, env: 0.4 }), insul: M("std", "insulC", { rough: 0.5, metal: 0.6, env: 0.6 }),
  plume: glowM("plumeC", 0.75, 0.2), chillDot: glowM("chillC", 0.95, 0.7), condDot: glowM("condC", 0.95, 0.7), heat: glowM("heatC", 0.9, 0.9),
  pcb: M("std", "pcbC", { rough: 0.5, metal: 0.1 }), ceram: M("std", "ceramC", { rough: 0.5, metal: 0 }), si: M("std", "siC", { rough: 0.35, metal: 0.55, env: 0.7 }),
  die: M("std", "dieC", { rough: 0.3, metal: 0.5, env: 0.7 }), padAu: M("std", "padAu", { rough: 0.3, metal: 0.9, env: 0.8 }), needle: M("std", "needleC", { rough: 0.2, metal: 0.95, env: 0.9 }),
  roof: M("std", "roofC", { rough: 0.7, metal: 0.1 }), grate: M("std", "grateC", { rough: 0.5, metal: 0.6, env: 0.4 }), ffu: M("std", "ffuC", { rough: 0.4, metal: 0, emissive: "ffuC", ei: 0.15 }),
  tankP: M("std", "tankC", { rough: 0.45, metal: 0.35, env: 0.45 }),
  tower: M("std", "towerC", { rough: 0.6, metal: 0.05, env: 0.25 }), mark: M("std", "markC", { rough: 0.5, metal: 0, emissive: "markC", ei: 0.25 }),
  warnY: M("std", "warnY", { rough: 0.5, metal: 0, emissive: "warnY", ei: 0.2 }), airDot: glowM("upwC", 0.85, 0.5), edge: glowM("ffuC", 0.95, 0.5),
};

Object.assign(palette, { abfC: "#EFE4C8", abfCureC: "#D9C79A", siO2C: "#FFFFFF", cuC: "#C8743A", cuBrightC: "#E39A5C", coreC: "#C9C08A", fiberC: "#A89F68", smC: "#2E6B47", pcbC2: "#2F7A4A",
  resistC: "#3E6FD8", petC: "#D6ECF7", coverC: "#9FD0EE", laserC: "#FF3B30", plumeC2: "#B7B7B7", hbmC: "#5D6A80", dieC2: "#3B4658", interC: "#8D97A8", solderC: "#C9CDD4", ionC2: "#E39A5C", heaterC: "#F07A2B", etchC: "#7FD1C7" });
Object.assign(materials, {
  abf: M("std", "abfC", { rough: 0.8, metal: 0, env: 0.15 }), abfCure: M("std", "abfCureC", { rough: 0.7, metal: 0, env: 0.2 }), siO2: M("std", "siO2C", { rough: 0.3, metal: 0, env: 0.5 }),
  cu: M("std", "cuC", { rough: 0.3, metal: 0.9, env: 0.8 }), cuB: M("std", "cuBrightC", { rough: 0.25, metal: 0.9, env: 0.9, emissive: "cuBrightC", ei: 0.15 }),
  core: M("std", "coreC", { rough: 0.7, metal: 0, env: 0.15 }), fiber: M("std", "fiberC", { rough: 0.6, metal: 0, env: 0.2 }), sm: M("std", "smC", { rough: 0.4, metal: 0.05, env: 0.4 }),
  resist: M("std", "resistC", { rough: 0.5, metal: 0, env: 0.3 }), pet: M("phys", "petC", { rough: 0.05, metal: 0, clearcoat: 1, opacity: 0.45, env: 0.7 }), cover: M("phys", "coverC", { rough: 0.1, metal: 0, clearcoat: 1, opacity: 0.6, env: 0.6 }),
  laser: M("std", "laserC", { emissive: "laserC", ei: 1.4, rough: 1, metal: 0, opacity: 0.8 }), laserDot: glowM("laserC", 0.95, 1.2), plumeDot: glowM("plumeC2", 0.8, 0.2),
  hbm: M("std", "hbmC", { rough: 0.4, metal: 0.5, env: 0.5 }), die2: M("std", "dieC2", { rough: 0.3, metal: 0.6, env: 0.7 }), inter: M("std", "interC", { rough: 0.35, metal: 0.6, env: 0.6 }),
  solder: M("std", "solderC", { rough: 0.25, metal: 0.95, env: 0.9 }), ionDot2: glowM("ionC2", 0.95, 0.8), heater: M("std", "heaterC", { emissive: "heaterC", ei: 0.5, rough: 0.5, metal: 0 }),
  etchDot: glowM("etchC", 0.9, 0.6), etchFilm: glowM("etchC", 0.35, 0.3), sigDot: glowM("powC", 0.95, 1.0), hole: M("std", "rubber", { rough: 1, metal: 0 }),
});
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
const RING = (n, r, a0 = 0, cx = 0, cz = 0) => Array.from({ length: n }, (_, i) => { const [x, z] = pol(a0 + (i * 360) / n, r); return [R2(x + cx), 0, R2(z + cz)]; });
const A = (layer, p, dx, dy) => ({ layer, p, dx, dy });
const PIPE = (id, layer, pts, r, mat, o = {}) => {
  for (let i = 0; i < pts.length - 1; i++) {
    const [x0, y0, z0] = pts[i], [x1, y1, z1] = pts[i + 1];
    const dx = x1 - x0, dy = y1 - y0, dz = z1 - z0, L = Math.hypot(dx, dy, dz);
    const rot = Math.abs(dx) > 1e-6 ? HX : Math.abs(dy) > 1e-6 ? V : [0, 0, 0];
    P({ id: `${id}${i}`, layer, shape: "cyl", size: [r, R2(L)], rot, pos: [R2((x0 + x1) / 2), R2((y0 + y1) / 2), R2((z0 + z1) / 2)], mat, ...o });
    if (i > 0) SPH(`${id}J${i}`, layer, r * 1.18, x0, y0, z0, o.jmat ?? "steel");
  }
};
// 管夾：沿折線每隔 step 放一圈（彎頭＝球、管夾＝薄環），第 20 條④
const CLAMPS = (id, layer, pts, r, step, mat = "dark") => {
  const at = [];
  for (let i = 0; i < pts.length - 1; i++) {
    const [x0, y0, z0] = pts[i], [x1, y1, z1] = pts[i + 1], L = Math.hypot(x1 - x0, y1 - y0, z1 - z0), n = Math.floor(L / step);
    for (let k = 1; k <= n; k++) { const u = k / (n + 1); at.push({ p: [R2(x0 + (x1 - x0) * u), R2(y0 + (y1 - y0) * u), R2(z0 + (z1 - z0) * u)], ax: Math.abs(x1 - x0) > 1e-6 ? "x" : Math.abs(y1 - y0) > 1e-6 ? "y" : "z" }); }
  }
  for (const ax of ["x", "y", "z"]) { const pp = at.filter((q) => q.ax === ax).map((q) => q.p); if (!pp.length) continue;
    P({ id: `${id}${ax}`, layer, shape: "tube", size: [r * 1.35, r * 0.95, 0.08], rot: ax === "x" ? HX : ax === "y" ? V : [0, 0, 0], pos: [0, 0, 0], at: pp, mat }); }
};
const idsOf = (layer) => parts.filter((q) => q.layer === layer).map((q) => q.id);
const SPIRAL = (a0, cx, y, r0, r1, turns = 1.1) => Array.from({ length: 12 }, (_, i) => { const u = i / 11, [x, z] = pol(a0 + u * 360 * turns, r0 + (r1 - r0) * u); return [R2(x + cx), y, z]; });

// ── 貼圖：國旗、台積電 LOGO（原檔）、沒有原檔可用的公司用白底深色字名牌、電阻率表頭 ──
const TEX = ["flag:TW", "flag:JP", "text:ajino=味之素|Ajinomoto", "text:tbf=晶化科技|TBF 增層膜", "text:abfroll=ABF 增層膜|示意"];
{ const r = spawnSync("node", [path.join(HERE, "..", "..", "scripts", "three", "make-brand-tex.mjs"), "tech-abf", ...TEX], { encoding: "utf8" }); if (r.status !== 0) { console.error(r.stdout, r.stderr); process.exit(1); } }
const SIGN = JSON.parse(fs.readFileSync(path.join(HERE, "..", "..", "public", "tex", "brand", "meta.json"), "utf8"));
const TEXMAT = (name) => { materials[`t_${name}`] = { kind: "unlit", color: "#FFFFFF", img: `tex/brand/${name}.png` }; return `t_${name}`; };
const PLATE = (id, layer, name, w, x, y, z, o = {}) => { const s = SIGN[name]; if (!s) throw new Error(`缺貼圖 ${name}`); return P({ id, layer, shape: "plane", size: [w, R2(w / s.aspect)], pos: [x, y, z], uv01: true, shadow: false, mat: TEXMAT(name), ...o }); };
// 旗桿＋國旗（3D 旗子貼圖；第 4 條）：底座、桿、頂球、旗面
const FLAGPOLE = (id, layer, code, x, z, h = 6, fw = 1.5) => {
  VC(`${id}Base`, layer, 0.3, 0, 0.25, "dark", { x, z }); VC(`${id}Pole`, layer, 0.05, 0.25, h, "steel2", { x, z }); SPH(`${id}Ball`, layer, 0.1, x, h + 0.05, z, "gold");
  const s = SIGN[`flag-${code}`], fh = R2(fw / s.aspect); PLATE(`${id}Flag`, layer, `flag-${code}`, fw, R2(x + fw / 2 + 0.06), R2(h - fh / 2 - 0.1), z);
};



// ═════ 地板 ═════
LAY("floor", [320, 2, 100, 0], true);
P({ id: "floor", layer: "floor", shape: "slab", size: [340, 0.5, 60], r: 0.2, pos: [100, -0.25, 0], mat: "floor" });
P({ id: "floorSeam", layer: "floor", shape: "slab", size: [340, 0.04, 0.1], pos: [100, 0.01, 0], at: Array.from({ length: 9 }, (_, i) => [0, 0, -20 + i * 5]), mat: "seam" });

// ═════ 站 K：AI 晶片封裝＋ABF 載板＋主機板（爆炸剖面：每一層增層＝ABF 膜＋銅線）═════
const KX = 0, SW = 5, BU = 0.18;
LAY("kPcb", [18, 0.5, KX, 0.2]);
BOX("kPcbB", "kPcb", KX - 9, KX + 9, 0, 0.4, -6.5, 6.5, "pcb");
P({ id: "kPcbTr", layer: "kPcb", shape: "box", size: [0.08, 0.01, 4.0], pos: [0, 0.405, 0], at: Array.from({ length: 10 }, (_, i) => [R2(KX - 8.4 + i * 0.3), 0, 3.8]).concat(Array.from({ length: 10 }, (_, i) => [R2(KX + 5.6 + i * 0.3), 0, -3.8])), mat: "gold" });
P({ id: "kPcbCap", layer: "kPcb", shape: "box", size: [0.4, 0.22, 0.25], pos: [0, 0.51, 0], at: [[-7.5, 0, -4], [-6.8, 0, -4], [-7.5, 0, 4.8], [7.2, 0, 4.5], [6.5, 0, 4.5], [7.2, 0, -5.2]].map(([x, y, z]) => [KX + x, y, z]), mat: "dark" });
P({ id: "kPcbIc", layer: "kPcb", shape: "box", size: [1.4, 0.2, 1.4], pos: [0, 0.5, 0], at: [[KX - 7.2, 0, 0], [KX + 7.2, 0, 0.5]], mat: "die2" });
// 載板各層（下而上）：錫球、底阻焊、下增層 4 層、芯板、上增層 4 層、頂阻焊＋焊墊＋加強環
const KL = [];
const ky0 = 0.78;
LAY("kBalls", [10, 0.4, KX, 0.6]);
{ const b = []; for (let i = 0; i < 13; i++) for (let j = 0; j < 13; j++) b.push([R2(KX - 4.5 + i * 0.75), 0, R2(-4.5 + j * 0.75)]); P({ id: "kBall", layer: "kBalls", shape: "sphere", size: [0.17], pos: [0, 0.58, 0], at: b, mat: "solder" }); }
LAY("kSMb", [10, 0.1, KX, 0.75]); BOX("kSMbB", "kSMb", KX - SW, KX + SW, 0.72, ky0, -SW, SW, "sm");
const BUL = (id, y0, top) => { LAY(id, [10, 0.2, KX, y0 + 0.1]); KL.push(id);
  BOX(`${id}A`, id, KX - SW, KX + SW, y0, y0 + 0.14, -SW, SW, "abf");
  P({ id: `${id}Si`, layer: id, shape: "sphere", size: [0.018], pos: [0, 0, SW + 0.003], at: Array.from({ length: 70 }, () => [R2(KX - SW + 0.1 + rnd() * 9.8), R2(y0 + 0.02 + rnd() * 0.1), 0]), mat: "siO2" });
  const n = 9; for (let k = 0; k < n; k++) { const zz = R2(-4.2 + k * 1.05), rot = (k + (top ? 1 : 0)) % 2 === 0;
    if (rot) P({ id: `${id}Tr${k}`, layer: id, shape: "box", size: [9.2, 0.04, 0.16], pos: [KX, R2(y0 + 0.16), zz], mat: "cu" });
    else P({ id: `${id}Tr${k}`, layer: id, shape: "box", size: [0.16, 0.04, 9.2], pos: [R2(KX - 4.2 + k * 1.05), R2(y0 + 0.16), 0], mat: "cu" }); }
  P({ id: `${id}Cs`, layer: id, shape: "box", size: [0.22, 0.04, 0.02], pos: [0, R2(y0 + 0.16), SW + 0.01], at: Array.from({ length: 12 }, (_, i) => [R2(KX - 4.4 + i * 0.8), 0, 0]), mat: "cu" });
  P({ id: `${id}Via`, layer: id, shape: "cone", size: [0.11, 0.06, 0.14], rot: V, pos: [0, R2(y0 + 0.07), SW + 0.01], at: Array.from({ length: 6 }, (_, i) => [R2(KX - 4.0 + i * 1.6 + (top ? 0.4 : 0)), 0, 0]), mat: "cuB" });
  P({ id: `${id}Pad`, layer: id, shape: "cyl", size: [0.12, 0.04], rot: V, pos: [0, R2(y0 + 0.16), 0], at: Array.from({ length: 16 }, () => [R2(KX - 4.4 + rnd() * 8.8), 0, R2(-4.4 + rnd() * 8.8)]), mat: "cu" });
};
["kB4", "kB3", "kB2", "kB1"].forEach((id, i) => BUL(id, R2(ky0 + i * BU), false));
const kc0 = R2(ky0 + 4 * BU), kc1 = R2(kc0 + 0.6);
LAY("kCore", [10, 0.6, KX, kc0 + 0.3]); KL.push("kCore");
BOX("kCoreB", "kCore", KX - SW, KX + SW, kc0, kc1, -SW, SW, "core"); BOX("kCoreCuT", "kCore", KX - SW, KX + SW, kc1 - 0.03, kc1, -SW, SW, "cu"); BOX("kCoreCuB", "kCore", KX - SW, KX + SW, kc0, kc0 + 0.03, -SW, SW, "cu");
P({ id: "kFiber", layer: "kCore", shape: "cyl", size: [0.05, 0.02], pos: [0, 0, SW + 0.01], at: Array.from({ length: 40 }, (_, i) => [R2(KX - 4.8 + (i % 20) * 0.5), R2(kc0 + 0.2 + Math.floor(i / 20) * 0.22), 0]), mat: "fiber" });
P({ id: "kPth", layer: "kCore", shape: "box", size: [0.14, 0.6, 0.02], pos: [0, R2(kc0 + 0.3), SW + 0.012], at: [-3.6, -1.2, 1.2, 3.6].map((d) => [KX + d, 0, 0]), mat: "cuB" });
["kT1", "kT2", "kT3", "kT4"].forEach((id, i) => BUL(id, R2(kc1 + i * BU), true));
const kt = R2(kc1 + 4 * BU);
LAY("kSMt", [10, 0.3, KX, kt + 0.1]);
BOX("kSMtB", "kSMt", KX - SW, KX + SW, kt, kt + 0.06, -SW, SW, "sm");
{ const p = []; for (let i = 0; i < 16; i++) for (let j = 0; j < 12; j++) p.push([R2(KX - 3.0 + i * 0.4), 0, R2(-2.2 + j * 0.4)]); P({ id: "kSMtPad", layer: "kSMt", shape: "cyl", size: [0.08, 0.02], rot: V, pos: [0, kt + 0.07, 0], at: p, mat: "gold" }); }
for (const [x0, x1, z0, z1] of [[-SW, SW, SW - 0.4, SW], [-SW, SW, -SW, -SW + 0.4], [-SW, -SW + 0.4, -SW, SW], [SW - 0.4, SW, -SW, SW]]) BOX(`kRing${x0}${z0}`, "kSMt", KX + x0, KX + x1, kt + 0.06, kt + 0.32, z0, z1, "steel2");
P({ id: "kSMtCap", layer: "kSMt", shape: "box", size: [0.3, 0.12, 0.18], pos: [0, kt + 0.12, 0], at: Array.from({ length: 10 }, (_, i) => [R2(KX - 4.0 + (i % 5) * 0.4), 0, R2(i < 5 ? 3.6 : 4.1)]), mat: "dark" });
// 晶片（承前一集）：中介層＋運算晶片＋四疊記憶體＋底部填膠＋凸塊
const kci = R2(kt + 0.14);
LAY("kChip", [7, 1, KX, kci + 0.5]);
P({ id: "kC4", layer: "kChip", shape: "sphere", size: [0.06], pos: [0, kci - 0.04, 0], at: Array.from({ length: 64 }, (_, i) => [R2(KX - 2.8 + (i % 16) * 0.37), 0, R2(-2.2 + Math.floor(i / 16) * 1.4)]), mat: "solder" });
BOX("kInter", "kChip", KX - 3.2, KX + 3.2, kci, kci + 0.16, -2.6, 2.6, "inter");
BOX("kUf", "kChip", KX - 3.3, KX + 3.3, kci - 0.04, kci + 0.05, -2.7, 2.7, "abfCure");
BOX("kGpu", "kChip", KX - 1.4, KX + 1.4, kci + 0.2, kci + 0.62, -1.5, 1.5, "die2"); BOX("kGpuMark", "kChip", KX - 1.2, KX + 1.2, kci + 0.62, kci + 0.63, -1.3, 1.3, "steel");
for (const [i, x, z] of [[0, -2.35, -1.3], [1, -2.35, 1.3], [2, 2.35, -1.3], [3, 2.35, 1.3]]) { BOX(`kHbm${i}`, "kChip", KX + x - 0.6, KX + x + 0.6, kci + 0.2, kci + 0.68, z - 0.8, z + 0.8, "hbm");
  P({ id: `kHbmS${i}`, layer: "kChip", shape: "box", size: [1.21, 0.012, 1.61], pos: [KX + x, 0, z], at: Array.from({ length: 6 }, (_, k) => [0, R2(kci + 0.26 + k * 0.07), 0]), mat: "seam" }); }
// 訊號（第 0 幀已在流動）：從晶片往下沿載板正面斷面換層，到錫球
// 只走銅：頂增層微孔（x 1.2）→ 芯板鍍通孔（x 1.2）→ 芯板底銅箔橫走 → 底增層微孔（x 0.8）→ 錫球；第二條走 2.8 → 頂銅箔 → 鍍通孔 3.6 → 底銅箔 → 4.0
const K_SIG = [[KX + 1.2, kci + 0.2, SW + 0.06], [KX + 1.2, kc0 + 0.015, SW + 0.06], [KX + 0.8, kc0 + 0.015, SW + 0.06], [KX + 0.8, ky0 - 0.1, SW + 0.06]];
const K_SIG2 = [[KX + 2.8, kci + 0.2, SW + 0.06], [KX + 2.8, kc1 - 0.015, SW + 0.06], [KX + 3.6, kc1 - 0.015, SW + 0.06], [KX + 3.6, kc0 + 0.015, SW + 0.06], [KX + 4.0, kc0 + 0.015, SW + 0.06], [KX + 4.0, ky0 - 0.1, SW + 0.06]];

// ═════ 站 M：增層放大剖面（大樓：樓板＝絕緣膜、走線＝銅線、電梯井＝雷射孔）═════
const MX = 30, MZ = 1.5;
LAY("mBase", [14, 1, MX, 0.4]); BOX("mPl", "mBase", MX - 7.2, MX + 7.2, 0, 0.6, -2.2, 2.2, "band");
LAY("mCore", [12, 1.6, MX, 1.4]);
BOX("mCoreB", "mCore", MX - 6, MX + 6, 0.6, 2.2, -MZ, MZ, "core");
P({ id: "mFib", layer: "mCore", shape: "cyl", size: [0.16, 0.04], pos: [0, 0, MZ + 0.01], at: Array.from({ length: 48 }, (_, i) => [R2(MX - 5.7 + (i % 24) * 0.5), R2(1.0 + Math.floor(i / 24) * 0.7), 0]), mat: "fiber" });
P({ id: "mFibX", layer: "mCore", shape: "box", size: [11.8, 0.1, 0.02], pos: [MX, 0, MZ + 0.012], at: [[0, 1.35, 0], [0, 2.05, 0]], mat: "fiber" });
BOX("mCoreCu", "mCore", MX - 6, MX + 6, 2.2, 2.35, -MZ, MZ, "cu"); BOX("mPth", "mCore", MX - 4.5, MX - 4.1, 0.6, 2.35, MZ - 0.02, MZ + 0.02, "cuB");
const MSI = (id, lay, y0, y1) => P({ id, layer: lay, shape: "sphere", size: [0.05], pos: [0, 0, MZ + 0.01], at: Array.from({ length: 90 }, () => [R2(MX - 5.9 + rnd() * 11.8), R2(y0 + 0.05 + rnd() * (y1 - y0 - 0.1)), 0]), mat: "siO2" });
const MVIA = (id, lay, y0, y1, xs) => xs.forEach((x, k) => P({ id: `${id}_${k}`, layer: lay, shape: "poly", pts: [[-0.5, R2((y1 - y0) / 2)], [0.5, R2((y1 - y0) / 2)], [0.3, R2(-(y1 - y0) / 2)], [-0.3, R2(-(y1 - y0) / 2)]], size: [1, 1, 0.05], pos: [R2(MX + x), R2((y0 + y1) / 2), R2(MZ + 0.01)], mat: "cuB" }));
const MLINE = (id, lay, y, xs) => xs.forEach((x, k) => { BOX(`${id}${k}`, lay, R2(MX + x - 0.42), R2(MX + x + 0.42), y, R2(y + 0.32), -MZ, R2(MZ + 0.03), "cu"); BOX(`${id}T${k}`, lay, R2(MX + x - 0.36), R2(MX + x + 0.36), R2(y + 0.32), R2(y + 0.36), -MZ, R2(MZ + 0.03), "cuB"); });
LAY("mB1", [12, 1.6, MX, 3.0]); BOX("mB1A", "mB1", MX - 6, MX + 6, 2.35, 3.55, -MZ, MZ, "abf"); MSI("mB1Si", "mB1", 2.35, 3.55);
MLINE("mL1", "mB1", 3.55, [-4.3, -2.2, 0.0, 2.6, 4.6]);
MVIA("mV1", "mB1", 2.35, 3.55, [-2.2, 0.0, 2.6]);
LAY("mB2", [12, 1.6, MX, 4.5]); BOX("mB2A", "mB2", MX - 6, MX + 6, 3.55, 5.1, -MZ, MZ, "abf"); MSI("mB2Si", "mB2", 3.91, 5.1);
MLINE("mL2", "mB2", 5.1, [-3.2, -0.9, 0.0, 2.6, 4.8]);
MVIA("mV2", "mB2", 3.91, 5.1, [0.0, 2.6]);
LAY("mB3", [12, 1.6, MX, 6.0]); BOX("mB3A", "mB3", MX - 6, MX + 6, 5.1, 6.65, -MZ, MZ, "abf"); MSI("mB3Si", "mB3", 5.46, 6.65);
MLINE("mL3", "mB3", 6.65, [-4.6, -1.8, 0.0, 3.4]);
MVIA("mV3", "mB3", 5.46, 6.65, [0.0]);
P({ id: "mIface", layer: "mSM", shape: "box", size: [12, 0.025, 0.02], pos: [MX, 0, MZ + 0.012], at: [[0, 3.55, 0], [0, 5.1, 0], [0, 6.65, 0], [0, 2.35, 0]], mat: "dark" });
LAY("mSM", [12, 0.6, MX, 7.2]); BOX("mSMa", "mSM", MX - 6, MX - 0.7, 7.01, 7.4, -MZ, MZ, "sm"); BOX("mSMb", "mSM", MX + 0.7, MX + 6, 7.01, 7.4, -MZ, MZ, "sm"); BOX("mSMpad", "mSM", MX - 0.55, MX + 0.55, 7.01, 7.12, -MZ, MZ, "gold");
LAY("mSig", [1, 6, MX, 4]);
const M_SIG = [[MX, 7.1, MZ + 0.09], [MX, 2.3, MZ + 0.09], [MX - 4.3, 2.3, MZ + 0.09], [MX - 4.3, 0.7, MZ + 0.09]];

// ═════ 站 L：貼膜（膜捲→撕保護膜→真空壓膜機壓平加熱→撕承載膜）＋背景烘烤爐 ═════
const LX = 60;
LAY("lBase", [18, 1, LX, 0.4]); BOX("lTable", "lBase", LX - 9, LX + 7, 0, 1.0, -3.0, 3.0, "band"); BOX("lTableTop", "lBase", LX - 9, LX + 7, 1.0, 1.08, -3.0, 3.0, "panel2");
P({ id: "lRoller", layer: "lBase", shape: "cyl", size: [0.12, 5.4], pos: [0, 1.2, 0], at: [-3.5, -2.7, -1.9].map((d) => [LX + d, 0, 0]), mat: "steel2" });
// 膜捲（軸心沿 z）：捲筒、捲芯、端面看得到三層（保護膜、樹脂、承載膜）
LAY("lRoll", [3, 3, LX - 7, 2.6]);
ZC("lRollB", "lRoll", 1.0, -2.4, 2.4, LX - 7, 2.6, "abf"); ZC("lRollCore", "lRoll", 0.32, -2.6, 2.6, LX - 7, 2.6, "steel2");
for (const [k, r, m] of [[0, 1.03, "cover"], [1, 0.98, "pet"]]) P({ id: `lRollRing${k}`, layer: "lRoll", shape: "tube", size: [r, r - 0.03, 0.02], pos: [LX - 7, 2.6, 2.41], mat: m });
P({ id: "lRollStand", layer: "lRoll", shape: "box", size: [0.2, 1.6, 0.2], pos: [LX - 7, 1.8, 0], at: [[0, 0, -2.7], [0, 0, 2.7]], mat: "steel" });
BOX("lRollTag", "lRoll", LX - 7.5, LX - 6.5, 2.2, 2.6, 2.45, 2.48, "panel"); PLATE("lRollTx", "lRoll", "sign-abfroll", 0.95, LX - 7, 2.4, 2.49);
// 芯板（等著貼膜）＋銅線
LAY("lPanel", [6, 0.3, LX + 1, 1.2]);
BOX("lPanelB", "lPanel", LX - 2.0, LX + 4.0, 1.08, 1.28, -2.2, 2.2, "core");
P({ id: "lPanelCu", layer: "lPanel", shape: "box", size: [5.6, 0.04, 0.16], pos: [LX + 1, 1.3, 0], at: Array.from({ length: 9 }, (_, i) => [0, 0, R2(-1.9 + i * 0.475)]), mat: "cu" });
// 膜三層（從膜捲那邊滑過來）：樹脂（米白，半透明時看得到底下銅線的凸起）、承載膜（透明）、保護膜（淡藍，在貼之前撕掉）
LAY("lResin", [6, 0.2, LX + 1, 1.4]); BOX("lResinB", "lResin", LX - 2.0, LX + 4.0, 1.32, 1.46, -2.2, 2.2, "abf");
LAY("lCured", [6, 0.2, LX + 1, 1.4]); BOX("lCuredB", "lCured", LX - 2.0, LX + 4.0, 1.32, 1.465, -2.2, 2.2, "abfCure");
LAY("lPet", [6, 0.1, LX + 1, 1.5]); BOX("lPetB", "lPet", LX - 2.0, LX + 4.2, 1.465, 1.5, -2.2, 2.2, "pet");
LAY("lCover", [6, 0.1, LX + 1, 1.3]); BOX("lCoverB", "lCover", LX - 2.0, LX + 4.0, 1.30, 1.32, -2.2, 2.2, "cover");
// 真空壓膜機：四根立柱、頂梁、上壓板（加熱條）、下壓板、真空腔（透明門＋密封條）、真空泵＋管、壓力表、控制面板
LAY("lPress", [8, 6, LX + 1, 3.5]);
P({ id: "lPost", layer: "lPress", shape: "cyl", size: [0.16, 5.6], rot: V, pos: [0, 3.88, 0], at: [[LX - 2.6, 0, -2.6], [LX + 4.6, 0, -2.6], [LX - 2.6, 0, 2.6], [LX + 4.6, 0, 2.6]], mat: "steel2" });
BOX("lBeam", "lPress", LX - 2.9, LX + 4.9, 6.68, 7.2, -2.9, 2.9, "panel"); BOX("lCyl", "lPress", LX + 0.6, LX + 1.4, 6.0, 6.68, -0.4, 0.4, "steel");
BOX("lCtl", "lPress", LX + 5.0, LX + 6.4, 1.08, 3.6, -1.0, 0.4, "panel"); BOX("lCtlScr", "lPress", LX + 5.1, LX + 6.3, 2.6, 3.3, 0.4, 0.43, "screen");
P({ id: "lCtlBtn", layer: "lPress", shape: "cyl", size: [0.08, 0.04], pos: [0, 2.0, 0.43], at: [[LX + 5.35, 0, 0], [LX + 5.7, 0, 0], [LX + 6.05, 0, 0]], mat: "lampG" });
ZC("lGauge", "lPress", 0.22, 0.4, 0.46, LX + 5.7, 1.6, "panel"); BOX("lGaugeN", "lPress", LX + 5.69, LX + 5.71, 1.6, 1.78, 0.47, 0.48, "estop");
VC("lPump", "lPress", 0.45, 0.25, 1.2, "motorB", { x: LX + 6.2, z: -2.2 }); PIPE("lVac", "lPress", [[LX + 6.2, 1.2, -2.2], [LX + 6.2, 1.8, -2.2], [LX + 4.4, 1.8, -2.2]], 0.09, "steel2");
P({ id: "lChamberE", layer: "lPress", shape: "box", size: [0.06, 1.1, 0.06], pos: [0, 1.65, 0], at: [[LX - 2.4, 0, -2.5], [LX + 4.4, 0, -2.5], [LX - 2.4, 0, 2.5], [LX + 4.4, 0, 2.5]], mat: "steel" }); for (const [x0, x1, z0, z1] of [[-2.5, 4.5, -2.55, -2.45], [-2.5, 4.5, 2.45, 2.55], [-2.55, -2.45, -2.55, 2.55], [4.45, 4.55, -2.55, 2.55]]) BOX(`lSeal${x0}${z0}`, "lPress", R2(LX + x0), R2(LX + x1), 1.08, 1.22, z0, z1, "rubber");
P({ id: "lBeamBolt", layer: "lPress", shape: "cyl", size: [0.06, 0.03], pos: [0, 6.94, 2.91], at: [-2.4, -1, 0.4, 1.8, 3.2, 4.5].map((d) => [LX + d, 0, 0]), mat: "steel" }); BOX("lBeamPl", "lPress", LX + 2.0, LX + 3.4, 6.8, 7.1, 2.9, 2.93, "gold");
LAY("lTop", [7, 0.8, LX + 1, 4.0]);
BOX("lTopP", "lTop", LX - 2.3, LX + 4.3, 4.7, 5.2, -2.4, 2.4, "steel2"); P({ id: "lHeat", layer: "lTop", shape: "box", size: [6.4, 0.05, 0.14], pos: [LX + 1, 4.68, 0], at: Array.from({ length: 8 }, (_, i) => [0, 0, R2(-2.0 + i * 0.57)]), mat: "heater" });
BOX("lTopPad", "lTop", LX - 2.2, LX + 4.2, 4.6, 4.7, -2.3, 2.3, "rubber"); P({ id: "lHeatF", layer: "lTop", shape: "box", size: [0.5, 0.18, 0.04], pos: [0, 4.95, 2.42], at: Array.from({ length: 8 }, (_, i) => [R2(LX - 1.8 + i * 0.8), 0, 0]), mat: "heater" }); VC("lRod", "lTop", 0.18, 5.2, 6.0, "steel", { x: LX + 1, z: 0 });
// 背景烘烤爐（門開著，看得到層架與板子、熱風扇）
LAY("lOven", [4, 5, LX - 6.5, 2.6]);
BOX("lOvB", "lOven", LX - 8.6, LX - 4.4, 0, 4.8, -5.8, -3.75, "panel"); BOX("lOvIn", "lOven", LX - 8.3, LX - 4.7, 0.4, 4.4, -3.74, -3.68, "dark");   // 背板退到層架後面（r1 複審：同深度閃爍）
P({ id: "lOvShelf", layer: "lOven", shape: "box", size: [3.4, 0.05, 0.05], pos: [LX - 6.5, 0, -3.58], at: [1.2, 2.2, 3.2].map((y) => [0, y, 0]), mat: "steel2" });
P({ id: "lOvBoard", layer: "lOven", shape: "box", size: [3.0, 0.1, 0.04], pos: [LX - 6.5, 0, -3.56], at: [1.3, 2.3, 3.3].map((y) => [0, y, 0]), mat: "abfCure" });
BOX("lOvDoor", "lOven", LX - 4.4, LX - 4.3, 0.2, 4.6, -3.6, -1.6, "panel"); BOX("lOvWin", "lOven", LX - 4.31, LX - 4.29, 1.6, 3.6, -3.3, -1.9, "window");
BOX("lOvPanel", "lOven", LX - 8.4, LX - 6.0, 4.2, 4.6, -3.59, -3.56, "screen");
LAY("lOvFan", [1, 1, LX - 6.5, 3.9]); P({ id: "lOvFanB", layer: "lOvFan", shape: "box", size: [0.9, 0.12, 0.02], pos: [LX - 6.5, 3.9, -3.59], at: [[0, 0, 0]], mat: "steel" }); P({ id: "lOvFanC", layer: "lOvFan", shape: "box", size: [0.12, 0.9, 0.02], pos: [LX - 6.5, 3.9, -3.59], mat: "steel" });

// ═════ 站 D：雷射鑽孔（雷射頭、光錐收斂、膜面打出倒錐孔、到銅墊停住、煙被吸走）═════
const DX = 90, DY = 1.6;
LAY("dBase", [14, 1, DX, 0.5]); BOX("dTable", "dBase", DX - 7, DX + 7, 0, 1.0, -3.4, 3.4, "band");
P({ id: "dRail", layer: "dBase", shape: "box", size: [13.6, 0.08, 0.2], pos: [DX, 1.04, 0], at: [[0, 0, -3.0], [0, 0, 3.0]], mat: "steel2" });
LAY("dPanel", [10, 0.6, DX, 1.3]);
BOX("dCore", "dPanel", DX - 5, DX + 5, 1.0, 1.25, -2.6, 2.6, "core"); BOX("dAbf", "dPanel", DX - 5, DX + 5, 1.35, DY, -2.6, 2.6, "abf");
P({ id: "dPadB", layer: "dPanel", shape: "box", size: [0.9, 0.1, 0.9], pos: [0, 1.3, 0], at: [-2.5, 0, 2.5].map((d) => [DX + d, 0, 0]), mat: "cu" });
P({ id: "dPadF", layer: "dPanel", shape: "box", size: [0.9, 0.1, 0.02], pos: [0, 1.3, 2.61], at: [-2.5, 0, 2.5].map((d) => [DX + d, 0, 0]), mat: "cuB" });
P({ id: "dSi", layer: "dPanel", shape: "sphere", size: [0.03], pos: [0, 0, 2.61], at: Array.from({ length: 60 }, () => [R2(DX - 4.9 + rnd() * 9.8), R2(1.37 + rnd() * 0.2), 0]), mat: "siO2" });
for (const [k, d] of [[0, -2.5], [1, 0], [2, 2.5]]) { LAY(`dHole${k}`, [0.6, 0.3, DX + d, DY]);
  P({ id: `dHoleC${k}`, layer: `dHole${k}`, shape: "cone", size: [0.48, 0.26, 0.25], rot: V, pos: [DX + d, R2(DY - 0.12), 0], mat: "hole" }); P({ id: `dHoleTop${k}`, layer: `dHole${k}`, shape: "cyl", size: [0.46, 0.012], rot: V, pos: [DX + d, R2(DY + 0.006), 0], mat: "hole" }); P({ id: `dHoleRim${k}`, layer: `dHole${k}`, shape: "tube", size: [0.52, 0.46, 0.02], rot: V, pos: [DX + d, R2(DY + 0.01), 0], mat: "abfCure" });
  P({ id: `dHoleCu${k}`, layer: `dHole${k}`, shape: "cyl", size: [0.26, 0.01], rot: V, pos: [DX + d, R2(DY - 0.245), 0], mat: "cuB" });
  P({ id: `dHoleF${k}`, layer: `dHole${k}`, shape: "poly", pts: [[-0.3, 0.13], [0.3, 0.13], [0.16, -0.12], [-0.16, -0.12]], size: [1, 1, 0.02], pos: [DX + d, R2(DY - 0.125), 2.615], mat: "hole" }); }
// 3-7 念稿不改，用畫面補「接通」（負責人 11-27）：中間孔之後鍍銅填滿，膜面銅線經孔接到下層銅墊
LAY("dFill", [2.2, 0.5, DX - 0.8, DY]);
P({ id: "dFillC", layer: "dFill", shape: "cone", size: [0.5, 0.28, 0.26], rot: V, pos: [DX, R2(DY - 0.12), 0], mat: "cu" });
P({ id: "dFillF", layer: "dFill", shape: "poly", pts: [[-0.3, 0.13], [0.3, 0.13], [0.16, -0.12], [-0.16, -0.12]], size: [1, 1, 0.02], pos: [DX, R2(DY - 0.125), 2.63], mat: "cuB" });
BOX("dFillT", "dFill", DX - 1.8, DX + 0.3, DY, DY + 0.1, -2.6, 2.62, "cuB");
// 雷射頭（在 x 方向移動到三個孔位）：立柱、橫梁固定；頭：振鏡盒、鏡筒、聚焦鏡、指示燈、吸煙罩
LAY("dFrame", [12, 6, DX, 4]);
BOX("dPostL", "dFrame", DX - 4.6, DX - 4.0, 1.0, 6.6, -0.5, 0.5, "panel"); BOX("dPostR", "dFrame", DX + 4.0, DX + 4.6, 1.0, 6.6, -0.5, 0.5, "panel"); P({ id: "dPostBolt", layer: "dFrame", shape: "cyl", size: [0.05, 0.03], pos: [0, 0, 0.51], at: [[DX - 4.3, 1.4, 0], [DX + 4.3, 1.4, 0], [DX - 4.3, 6.2, 0], [DX + 4.3, 6.2, 0]], mat: "steel" });
BOX("dBeam", "dFrame", DX - 4.6, DX + 4.6, 6.0, 6.6, -0.7, 0.3, "panel"); BOX("dBeamRail", "dFrame", DX - 4.0, DX + 4.0, 5.9, 6.0, -0.15, 0.15, "steel2"); BOX("dBeamPl", "dFrame", DX + 2.2, DX + 3.6, 6.1, 6.45, 0.3, 0.33, "gold");
BOX("dWarn", "dFrame", DX - 4.55, DX - 4.05, 3.0, 3.5, 0.5, 0.52, "warnY");
LAY("dHead", [2, 3, DX, 4.5]);
BOX("dGalvo", "dHead", DX - 0.7, DX + 0.7, 4.6, 5.9, -0.6, 0.6, "dark"); BOX("dGalvoPl", "dHead", DX - 0.5, DX + 0.1, 5.2, 5.5, 0.6, 0.62, "gold");
VC("dBarrel", "dHead", 0.28, 3.4, 4.6, "steel2", { x: DX }); VC("dLens", "dHead", 0.22, 3.3, 3.42, "quartz", { x: DX }); VT("dLensRing", "dHead", 0.3, 0.22, 3.3, 3.42, "dark", { x: DX });
SPH("dLed", "dHead", 0.06, DX + 0.5, 5.7, 0.62, "lampG");
BOX("dHood", "dHead", DX - 0.9, DX + 0.9, 2.6, 2.8, -0.9, 0.2, "steel"); PIPE("dDuct", "dHead", [[DX - 0.6, 2.8, -0.6], [DX - 0.6, 3.6, -0.6], [DX - 0.6, 3.6, -1.6]], 0.14, "steel2");
LAY("dBeamL", [0.5, 2, DX, 2.4]); P({ id: "dCone", layer: "dBeamL", shape: "cone", size: [0.04, 0.3, 1.7], rot: V, pos: [DX, R2(DY + 0.85), 0], mat: "laser" });

// ═════ 站 S：半加成法剖面（薄銅草稿→光阻→只在開口鍍厚→去光阻→洗掉多的薄銅）＋電鍍槽小插圖 ═════
const SX = 120, SZ = 1.5, SY = 2.0, TK = -2.4;
LAY("sBase", [12, 1, SX, 0.4]); BOX("sPl", "sBase", SX - 6.2, SX + 6.2, 0, 0.5, -2.0, 2.0, "band");
LAY("sAbf", [11, 1.6, SX, 1.2]);
BOX("sAbfB", "sAbf", SX - 5.6, SX + 5.6, 0.5, SY, -SZ, SZ, "abf"); BOX("sPad", "sAbf", SX - 0.8, SX + 0.8, 0.5, 0.75, -SZ, SZ + 0.03, "cu");
const VH = R2(SY - 0.75), VTRAP = [[-0.6, R2(VH / 2)], [0.6, R2(VH / 2)], [0.38, R2(-VH / 2)], [-0.38, R2(-VH / 2)]];
P({ id: "sViaF", layer: "sAbf", shape: "poly", pts: VTRAP, size: [1, 1, 0.02], pos: [SX, R2((SY + 0.75) / 2), SZ + 0.01], mat: "hole" });
P({ id: "sSi", layer: "sAbf", shape: "sphere", size: [0.05], pos: [0, 0, SZ + 0.01], at: Array.from({ length: 80 }, () => { let x; do { x = -5.5 + rnd() * 11; } while (Math.abs(x) < 0.7); return [R2(SX + x), R2(0.8 + rnd() * 1.1), 0]; }), mat: "siO2" });
P({ id: "sVia", layer: "sAbf", shape: "cone", size: [0.6, 0.38, 1.25], rot: V, pos: [SX, R2(SY - 0.625), 0], mat: "hole" });
P({ id: "sRough", layer: "sAbf", shape: "box", size: [0.12, 0.04, 2.9], pos: [0, SY + 0.01, 0], at: Array.from({ length: 30 }, (_, i) => [R2(SX - 5.4 + i * 0.37), 0, 0]), mat: "abfCure" });
LAY("sSeed", [11, 0.1, SX, SY]); BOX("sSeedB", "sSeed", SX - 5.6, SX + 5.6, SY, SY + 0.06, -SZ, SZ, "cuB");
P({ id: "sSeedV", layer: "sSeed", shape: "cone", size: [0.62, 0.4, 1.25], rot: V, pos: [SX, R2(SY - 0.62), 0], mat: "cuB" });
P({ id: "sSeedF", layer: "sSeed", shape: "poly", pts: [[-0.62, R2(VH / 2)], [-0.5, R2(VH / 2)], [-0.3, R2(-VH / 2 + 0.08)], [0.3, R2(-VH / 2 + 0.08)], [0.5, R2(VH / 2)], [0.62, R2(VH / 2)], [0.4, R2(-VH / 2)], [-0.4, R2(-VH / 2)]], size: [1, 1, 0.02], pos: [SX, R2((SY + 0.75) / 2), SZ + 0.03], mat: "cuB" });
const SL = [-4.0, -2.0, 0.0, 2.4, 4.3];
LAY("sResist", [11, 1, SX, SY + 0.5]);
{ let x0 = -5.6; SL.forEach((x, i) => { BOX(`sRs${i}`, "sResist", R2(SX + x0), R2(SX + x - 0.5), SY + 0.06, SY + 0.9, -SZ, SZ, "resist"); x0 = x + 0.5; }); BOX("sRsEnd", "sResist", R2(SX + x0), SX + 5.6, SY + 0.06, SY + 0.9, -SZ, SZ, "resist"); }
LAY("sPlate1", [11, 0.4, SX, SY + 0.2]); SL.forEach((x, i) => BOX(`sP1_${i}`, "sPlate1", R2(SX + x - 0.48), R2(SX + x + 0.48), SY + 0.06, SY + 0.4, -SZ, SZ, "cu")); P({ id: "sP1v", layer: "sPlate1", shape: "cone", size: [0.6, 0.38, 1.25], rot: V, pos: [SX, R2(SY - 0.625), 0], mat: "cu" }); P({ id: "sP1F", layer: "sPlate1", shape: "poly", pts: [[-0.49, 0.0], [0.49, 0.0], [0.38, R2(-VH / 2)], [-0.38, R2(-VH / 2)]], size: [1, 1, 0.02], pos: [SX, R2((SY + 0.75) / 2), SZ + 0.04], mat: "cu" });
LAY("sPlate2", [11, 0.8, SX, SY + 0.4]); SL.forEach((x, i) => { BOX(`sP2_${i}`, "sPlate2", R2(SX + x - 0.48), R2(SX + x + 0.48), SY + 0.06, SY + 0.82, -SZ, SZ, "cu"); BOX(`sP2t_${i}`, "sPlate2", R2(SX + x - 0.44), R2(SX + x + 0.44), SY + 0.82, SY + 0.85, -SZ, SZ, "cuB"); });
P({ id: "sP2v", layer: "sPlate2", shape: "cone", size: [0.6, 0.38, 1.25], rot: V, pos: [SX, R2(SY - 0.625), 0], mat: "cu" }); P({ id: "sP2F", layer: "sPlate2", shape: "poly", pts: VTRAP, size: [1, 1, 0.02], pos: [SX, R2((SY + 0.75) / 2), SZ + 0.04], mat: "cu" });
LAY("sEtchL", [11.4, 0.3, SX, SY + 0.1]); BOX("sEtchFilm", "sEtchL", SX - 5.7, SX + 5.7, SY + 0.07, SY + 0.22, -SZ, SZ + 0.05, "etchFilm");   // 蝕刻藥水薄薄一層蓋過表面（念「洗掉」時演藥水吃掉薄銅）
LAY("sKeep", [11, 0.1, SX, SY]); SL.forEach((x, i) => BOX(`sK_${i}`, "sKeep", R2(SX + x - 0.46), R2(SX + x + 0.46), SY, SY + 0.06, -SZ, SZ, "cuB"));
LAY("sThin", [11, 0.8, SX, SY + 0.4]); SL.forEach((x, i) => BOX(`sT_${i}`, "sThin", R2(SX + x - 0.44), R2(SX + x + 0.44), SY + 0.06, SY + 0.8, -SZ, SZ, "cu")); P({ id: "sTF", layer: "sThin", shape: "poly", pts: VTRAP, size: [1, 1, 0.02], pos: [SX, R2((SY + 0.75) / 2), SZ + 0.04], mat: "cu" });
// 電鍍槽（右側小插圖）：槽體（透明藥液）、陽極銅板、陰極夾具＋板子、整流器
LAY("sTank", [3, 3, SX + TK + 8.5, 1.8]);
BOX("sTankB", "sTank", SX + TK + 7.0, SX + TK + 10.0, 0, 3.0, -1.2, 1.2, "window"); BOX("sTankLiq", "sTank", SX + TK + 7.05, SX + TK + 9.95, 0.05, 2.5, -1.15, 1.15, "water");
BOX("sTankRim", "sTank", SX + TK + 6.95, SX + TK + 10.05, 2.95, 3.1, -1.25, 1.25, "steel");
BOX("sAnode", "sTank", SX + TK + 9.3, SX + TK + 9.5, 0.4, 2.8, -0.8, 0.8, "cu"); BOX("sCath", "sTank", SX + TK + 7.5, SX + TK + 7.6, 0.5, 2.6, -0.8, 0.8, "core");
BOX("sCathClip", "sTank", SX + TK + 7.4, SX + TK + 7.7, 2.6, 3.4, -0.2, 0.2, "steel"); BOX("sRect", "sTank", SX + TK + 10.4, SX + TK + 11.6, 0, 1.6, -0.8, 0.6, "panel"); BOX("sRectS", "sTank", SX + TK + 10.5, SX + TK + 11.5, 1.0, 1.4, 0.6, 0.63, "screen");
PIPE("sCabA", "sTank", [[SX + TK + 9.4, 2.8, 0], [SX + TK + 9.4, 3.4, 0], [SX + TK + 11.0, 3.4, 0], [SX + TK + 11.0, 1.6, 0]], 0.04, "motorR", { jmat: "motorR" });
PIPE("sCabC", "sTank", [[SX + TK + 7.55, 3.4, 0.3], [SX + TK + 7.55, 3.7, 0.3], [SX + TK + 10.8, 3.7, 0.3], [SX + TK + 10.8, 1.6, 0.3]], 0.04, "dark", { jmat: "dark" });

// ═════ 站 A：一般處理器載板（小、層數少）vs AI 晶片載板（大、十幾層）（斷面條紋看得出層數）═════
const AX = 150;
LAY("aBase", [20, 0.4, AX, 0.2]); BOX("aPl", "aBase", AX - 10, AX + 10, 0, 0.3, -4, 4, "band");
const STACK = (id, cx, w, n, yb) => { LAY(id, [w, 1, cx, yb + 0.5]); let y = yb;
  for (let i = 0; i < n; i++) { BOX(`${id}A${i}`, id, cx - w / 2, cx + w / 2, y, R2(y + 0.16), -w / 2, w / 2, "abf"); BOX(`${id}C${i}`, id, cx - w / 2, cx + w / 2, R2(y + 0.16), R2(y + 0.2), -w / 2, w / 2, "cu"); y = R2(y + 0.2); if (i === n / 2 - 1) { BOX(`${id}Core`, id, cx - w / 2, cx + w / 2, y, R2(y + 0.5), -w / 2, w / 2, "core"); y = R2(y + 0.5); } }
  BOX(`${id}SM`, id, cx - w / 2, cx + w / 2, y, R2(y + 0.06), -w / 2, w / 2, "sm"); return R2(y + 0.06); };
const aSmallTop = STACK("aSmall", AX - 6.5, 3.6, 4, 0.5); BOX("aCpu", "aSmall", AX - 7.3, AX - 5.7, aSmallTop, aSmallTop + 0.3, -0.8, 0.8, "die2");
P({ id: "aSmallBall", layer: "aSmall", shape: "sphere", size: [0.1], pos: [0, 0.4, 0], at: Array.from({ length: 25 }, (_, i) => [R2(AX - 8.0 + (i % 5) * 0.75), 0, R2(-1.5 + Math.floor(i / 5) * 0.75)]), mat: "solder" });
const aBigTop = STACK("aBig", AX + 3.0, 9.0, 16, 0.5);
BOX("aGpu", "aBig", AX + 1.6, AX + 4.4, aBigTop + 0.2, aBigTop + 0.62, -1.5, 1.5, "die2"); BOX("aInt", "aBig", AX - 0.2, AX + 6.2, aBigTop, aBigTop + 0.18, -2.6, 2.6, "inter");
for (const [i, x, z] of [[0, 0.65, -1.3], [1, 0.65, 1.3], [2, 5.35, -1.3], [3, 5.35, 1.3]]) BOX(`aHbm${i}`, "aBig", AX + x - 0.6, AX + x + 0.6, aBigTop + 0.2, aBigTop + 0.68, z - 0.8, z + 0.8, "hbm");
P({ id: "aBigBall", layer: "aBig", shape: "sphere", size: [0.1], pos: [0, 0.4, 0], at: Array.from({ length: 144 }, (_, i) => [R2(AX - 1.1 + (i % 12) * 0.75), 0, R2(-4.1 + Math.floor(i / 12) * 0.75)]), mat: "solder" });

// ═════ 站 J：味之素（日本，膜工廠＋膜捲棧板）、晶化科技（台灣，外型不同）═════
const JX = 180;
LAY("jBase", [22, 0.3, JX, 0.1]); BOX("jPave", "jBase", JX - 11, JX + 11, 0, 0.12, -4, 4, "panel2");
LAY("j0", [9, 5, JX - 5.2, 2.5]);
BOX("j0B", "j0", JX - 9.6, JX - 1.6, 0.12, 4.2, -3.2, 0.6, "ext"); BOX("j0Roof", "j0", JX - 9.7, JX - 1.5, 4.2, 4.5, -3.3, 0.7, "panel");
BOX("j0Win", "j0", JX - 9.2, JX - 2.0, 2.6, 3.4, 0.6, 0.64, "glassDark"); BOX("j0Door", "j0", JX - 4.0, JX - 2.4, 0.12, 2.0, 0.6, 0.66, "dark");
P({ id: "j0Seam", layer: "j0", shape: "box", size: [0.05, 4.0, 0.02], pos: [0, 2.2, 0.61], at: [-8, -6.5, -5, -3.5].map((d) => [JX + d, 0, 0]), mat: "seam" });
VC("j0Stack", "j0", 0.3, 4.5, 6.4, "steel2", { x: JX - 8.6, z: -2.4 }); BOX("j0Hvac", "j0", JX - 6.0, JX - 3.6, 4.5, 5.2, -2.6, -1.0, "steel2");
BOX("j0SignBg", "j0", JX - 9.0, JX - 5.6, 1.2, 2.3, 0.62, 0.66, "panel"); PLATE("j0Sign", "j0", "sign-ajino", 3.2, JX - 7.3, 1.75, 0.67);
BOX("j0Pallet", "j0", JX - 5.2, JX - 2.6, 0.12, 0.35, 1.2, 2.8, "band");
for (let i = 0; i < 3; i++) ZC(`j0Roll${i}`, "j0", 0.45, 1.3, 2.7, R2(JX - 4.7 + i * 0.85), 0.8, "abf");
LAY("jF0", [1.6, 5, JX - 1.0, 2.5]); FLAGPOLE("j0Flag", "jF0", "JP", JX - 1.0, 2.2, 5.0, 1.4);
LAY("j1", [8, 4, JX + 5.6, 2]);
BOX("j1B", "j1", JX + 2.0, JX + 9.6, 0.12, 2.8, -3.0, 0.4, "panel");
for (let i = 0; i < 4; i++) P({ id: `j1Saw${i}`, layer: "j1", shape: "box", size: [1.9, 0.12, 3.4], pos: [R2(JX + 2.95 + i * 1.9), 3.2, -1.3], rot: [0, 0, 18], mat: "steel2" });
BOX("j1Win", "j1", JX + 2.4, JX + 9.2, 1.6, 2.2, 0.4, 0.44, "glassDark"); BOX("j1Door", "j1", JX + 8.0, JX + 9.2, 0.12, 1.4, 0.4, 0.46, "dark");
VC("j1Tank", "j1", 0.5, 0.12, 2.4, "steel2", { x: JX + 10.3, z: -1.6 }); BOX("j1SignBg", "j1", JX + 2.6, JX + 6.2, 0.4, 1.4, 0.42, 0.46, "panel"); PLATE("j1Sign", "j1", "sign-tbf", 3.3, JX + 4.4, 0.9, 0.47);
LAY("jF1", [1.6, 5, JX + 8.4, 2.5]); FLAGPOLE("j1Flag", "jF1", "TW", JX + 8.4, 1.8, 4.6, 1.3);

// ═════ 站 N：下一集預告（ABF 載板大板：一片上有多顆載板）═════
const NX = 210;
LAY("nBase", [12, 0.6, NX, 0.3]); BOX("nPl", "nBase", NX - 6.5, NX + 6.5, 0, 0.6, -4.5, 4.5, "band");
LAY("nPanel", [12, 0.3, NX, 0.8]); BOX("nPanelB", "nPanel", NX - 6, NX + 6, 0.6, 0.85, -4, 4, "sm");
for (let i = 0; i < 3; i++) for (let j = 0; j < 2; j++) { const cx = R2(NX - 3.8 + i * 3.8), cz = R2(-1.9 + j * 3.8);
  BOX(`nU${i}${j}`, "nPanel", cx - 1.6, cx + 1.6, 0.85, 0.9, cz - 1.6, cz + 1.6, "sm");
  P({ id: `nUp${i}${j}`, layer: "nPanel", shape: "cyl", size: [0.06, 0.02], rot: V, pos: [0, 0.91, 0], at: Array.from({ length: 49 }, (_, k) => [R2(cx - 1.2 + (k % 7) * 0.4), 0, R2(cz - 1.2 + Math.floor(k / 7) * 0.4)]), mat: "gold" }); }
P({ id: "nTool", layer: "nPanel", shape: "cyl", size: [0.15, 0.27], rot: V, pos: [0, 0.73, 0], at: [[NX - 5.6, 0, -3.6], [NX + 5.6, 0, -3.6], [NX - 5.6, 0, 3.6], [NX + 5.6, 0, 3.6]], mat: "steel" });

// ═════ 動作 ═════
actions.kSig = { type: "flow", _說明: "訊號（亮點）從晶片往下，沿載板裡的銅線經孔換層、到錫球再出去", layer: "kCore", path: K_SIG, n: 7, size: 0.07, shape: "dot", rate: 0.45, color: "powC", track: false, free: true };
actions.kSig2 = { type: "flow", layer: "kCore", path: K_SIG2, n: 7, size: 0.07, shape: "dot", rate: 0.4, phase: 0.3, color: "powC", track: false, free: true };
actions.mSig = { type: "flow", _說明: "訊號沿銅線走、經孔（電梯井）換層", layer: "mB2", path: M_SIG, n: 8, size: 0.12, shape: "dot", rate: 0.25, color: "powC", track: false, free: true };
actions.lPeelCover = { type: "rotate", _說明: "保護膜從左緣慢慢撕起（捲曲）", parts: idsOf("lCover"), axis: [0, 0, 1], pivot: [LX + 4.0, 1.32, 0], angle: -38, hold: true };
actions.lPeelPet = { type: "rotate", _說明: "壓完後撕掉透明承載膜", parts: idsOf("lPet"), axis: [0, 0, 1], pivot: [LX - 2.0, 1.5, 0], angle: 32, hold: true };
actions.lHeatGlow = { type: "pulse", parts: ["lHeat", "lHeatF"], color: "heaterC", glow: 1.0, freq: 1.1, halo: 0.4 };
actions.lVacFlow = { type: "flow", _說明: "抽真空：腔內空氣被泵抽走", layer: "lPress", path: [[LX + 3.8, 1.7, -1.8], [LX + 4.4, 1.8, -2.2], [LX + 6.2, 1.8, -2.2], [LX + 6.2, 1.2, -2.2]], n: 6, size: 0.07, shape: "dot", rate: 0.6, color: "upwC", track: false, free: true, jitter: 0.05 };
actions.lOvFanSpin = { type: "rotate", parts: ["lOvFanB", "lOvFanC"], axis: [0, 0, 1], pivot: [LX - 6.5, 3.9, 0], rps: 1.2, rampSpin: true };
actions.lOvHot = { type: "flow", _說明: "烘烤爐內熱風沿爐壁循環", layer: "lOven", path: [[LX - 6.5, 3.9, -3.5], [LX - 4.9, 3.9, -3.5], [LX - 4.9, 0.6, -3.5], [LX - 8.1, 0.6, -3.5], [LX - 8.1, 3.9, -3.5], [LX - 6.5, 3.9, -3.5]], n: 10, size: 0.08, shape: "dot", rate: 0.3, color: "heatC", track: false, free: true };
for (const [k, d] of [[0, -2.5], [1, 0], [2, 2.5]]) actions[`dPlume${k}`] = { type: "flow", _說明: "膜材被雷射汽化成煙、往上冒、被吸煙罩吸走", layer: `dHole${k}`, path: [[DX + d, DY + 0.05, 0], [DX + d + 0.1, DY + 0.6, -0.2], [DX - 0.6, 2.6, -0.6]], n: 6, size: 0.08, shape: "dot", rate: 0.9, color: "plumeC2", track: false, free: true, jitter: 0.12 };
actions.dFillSig = { type: "flow", _說明: "接通示意：訊號沿膜面銅線、經鍍滿的孔、到下層銅墊", layer: "dFill", path: [[DX - 1.7, R2(DY + 0.05), 2.68], [DX, R2(DY + 0.05), 2.68], [DX, 1.3, 2.68], [DX + 0.4, 1.3, 2.68]], n: 4, size: 0.07, shape: "dot", rate: 0.5, color: "powC", track: false, free: true };
actions.sEtchBath = { type: "pulse", parts: ["sEtchFilm"], color: "etchC", glow: 0.6, freq: 1.5, halo: 0.2 };
actions.dLaserPulse = { type: "pulse", parts: ["dCone"], color: "laserC", glow: 1.2, freq: 6, halo: 0.6 };
actions.sSeedRain = { type: "flow", _說明: "化學鍍：銅原子在整個表面（含孔壁）均勻落下鋪成薄層", layer: "sAbf", path: [[SX - 5.2, SY + 1.6, SZ + 0.15], [SX - 5.2, SY + 0.06, SZ + 0.15]], n: 3, lanes: 14, laneDir: [1, 0, 0], laneGap: 0.8, size: 0.15, shape: "dot", rate: 1.1, phase: -3, color: "cuBrightC", track: false, accel: true, free: true, jitter: 0.06 };   // phase −3：一進場 14 道都已在落（r1 複審：沒畫出來）
actions.sIons = { type: "flow", _說明: "電鍍：銅離子在藥液裡從陽極往陰極（板子）移動", layer: "sTank", path: [[SX + TK + 9.25, 1.5, 0], [SX + TK + 7.65, 1.5, 0]], n: 3, lanes: 5, laneDir: [0, 1, 0], laneGap: 0.4, size: 0.07, shape: "dot", rate: 0.5, color: "ionC2", track: false, free: true, jitter: 0.05 };
actions.sIonsDown = { type: "flow", _說明: "剖面：銅離子只往光阻開口裡落、在開口裡長厚", layer: "sResist", path: [[SX - 4.0, SY + 1.8, 0.3], [SX - 4.0, SY + 0.3, 0.3]], n: 2, lanes: 5, laneDir: [1, 0, 0], laneGap: 2.08, size: 0.07, shape: "dot", rate: 0.8, color: "ionC2", track: false, free: true };
actions.sEtch = { type: "flow", _說明: "快速蝕刻：藥液沿表面流過，把線與線之間的薄銅吃掉", layer: "sBase", path: [[SX - 5.6, SY + 0.12, 0.8], [SX + 5.6, SY + 0.12, 0.8]], n: 10, size: 0.07, shape: "dot", rate: 0.45, color: "etchC", track: false, free: true, jitter: 0.04 };

// 標註點
Object.assign(anchors, {
  kChip: A("kChip", [KX + 1.4, kci + 0.5, 1.5], 150, -110), kT4: A("kT4", [KX + 4.6, R2(kc1 + 3 * BU + 0.16), 3.5], 150, -90), kCore: A("kCore", [KX - 4.8, kc0 + 0.3, SW], -150, 100),
  kTr: A("kT2", [KX - 3.2, R2(kc1 + BU + 0.16), 2.1], -150, -90), kBalls: A("kBalls", [KX - 4.5, 0.58, 4.5], -150, 90), kSig: A("kCore", [KX - 0.4, kc1 + 0.4, SW + 0.06], 160, 120),
  mAbf: A("mB2", [MX - 4.5, 4.6, MZ], -150, -100), mLine: A("mB1", [MX - 4.3, 3.75, MZ], -140, 110), mVia: A("mB2", [MX, 4.5, MZ], 150, -100), mCore: A("mCore", [MX + 4, 1.4, MZ], 150, 100),
  lRoll: A("lRoll", [LX - 7, 3.4, 1.2], -130, -110), lCover: A("lCover", [LX + 3.5, 1.32, 2.2], 150, -110), lCured: A("lOven", [LX - 6.5, 2.3, -3.56], 140, -110), lTop: A("lTop", [LX + 3.8, 3.7, 2.4], 140, -100), lPet: A("lPet", [LX - 1.5, 1.5, 2.2], -150, -110), lOven: A("lOven", [LX - 6.5, 2.3, -3.56], -130, -110),
  dCone: A("dBeamL", [DX, DY + 0.6, 0], 150, -110), dHole: A("dHole1", [DX, DY - 0.1, 0.2], 160, 110), dFill: A("dFill", [DX - 1.2, DY + 0.1, 2.62], -150, -120), dPad: A("dPanel", [DX - 2.5, 1.3, 2.61], -150, 100), dHead: A("dHead", [DX + 0.28, 4.0, 0.3], 140, -100),
  sSeed: A("sSeed", [SX - 3.0, SY + 0.04, SZ], -150, -100), sResist: A("sResist", [SX + 3.3, SY + 0.6, SZ], 150, -110), sPlate: A("sPlate1", [SX - 2.0, SY + 0.6, SZ], -150, -110), sEtch: A("sKeep", [SX - 3.0, SY + 0.03, SZ], -150, 110), sTank: A("sTank", [SX + TK + 9.4, 2.0, 0.8], 130, -110),
  aSmall: A("aSmall", [AX - 6.5, 1.0, 1.8], -140, -110), aBig: A("aBig", [AX + 7.5, 2.0, 4.5], 140, -110),
  j0: A("j0", [JX - 7.3, 3.6, 0.6], -120, -120), j1: A("j1", [JX + 5.6, 2.6, 0.4], 120, -110),
  nPanel: A("nPanel", [NX + 3.8, 0.9, 1.9], 140, -110),
});

const model = {
  name: "示意 ABF 增層膜：AI 晶片封裝與 ABF 載板爆炸剖面、增層放大剖面、膜捲與真空壓膜機、烘烤、雷射鑽孔、半加成法長銅線、一般處理器與 AI 晶片載板層數對照、味之素與晶化科技、載板大板（示意，非特定廠牌／型號）",
  unit: "示意", size: { w: 40, h: 18, r: 0.6, t: 30 }, palette, materials, partNames: {},
  layers, parts, anchors, actions,
  pose: { yaw0: 0, yawIso: 0, drift: 0 }, camera: { stand: { d: 70, elev: 24, y: 4 } },
  fx: { dpr: 1, srcPx: 30, shadows: 0, fog: false, dust: false, vaporSprites: false, shimmer: false },
  info: { KX, MX, LX, DX, SX, AX, JX, NX, kci, kc0, kc1, kt, ky0, BU, SY, DY },
};
fs.writeFileSync(path.join(HERE, "model.json"), JSON.stringify(model, null, 1) + "\n");
console.log(`✔ model.json：${parts.length} 個零件、${parts.reduce((a, p) => a + Math.max(1, (p.at?.length ?? 0)), 0)} 個實體（含複製）、${layers.length} 層`);

// node videos/tech-glass/gen-model.mjs → 寫 videos/tech-glass/model.json
// 2026/11/27 tech-glass（3-10 玻璃基板，系列 3 第 10 集）。構造與物理照 physics-spec.md、模組清單與爆炸步驟照 visual-spec.md。
// 單位：示意（封裝站 1＝1 mm；設備站 1＝10 cm），地板 y＝0，x 向右、z 向觀眾。站點（相隔 ≥25，換幕硬切）：
//   K 封裝＋載板＋主機板爆炸剖面，樹脂芯板換成玻璃芯板（x 0）｜W 加熱台：樹脂芯板翹、玻璃芯板平（x 30）｜T 玻璃穿孔：雷射改質→蝕刻開孔→鍍銅；機械鑽玻璃會裂（x 60）
//   C 公司：英特爾、三星電機、Absolics（美國喬治亞州廠）、欣興、群創（x 90）｜Q 量產時程路標（x 120）｜N 下一集：銅箔基板（x 150）
//   示意，非特定廠牌／型號；不標厚度、孔徑、溫度。
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
const HERE = path.dirname(new URL(import.meta.url).pathname);

const R2 = (x) => Math.round(x * 1000) / 1000;
const D2R = Math.PI / 180;
const pol = (aDeg, r) => [R2(r * Math.cos(aDeg * D2R)), R2(r * Math.sin(aDeg * D2R))];
let seed = 20261210;
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
  resistC: "#3E6FD8", petC: "#D6ECF7", coverC: "#9FD0EE", laserC: "#FF3B30", plumeC2: "#B7B7B7", hbmC: "#5D6A80", dieC2: "#3B4658", interC: "#8D97A8", solderC: "#C9CDD4", ionC2: "#E39A5C", heaterC: "#F07A2B", etchC: "#7FD1C7", glassCoreC: "#A8DCD4", glassEdgeC: "#6FB8AE", modC: "#9FE8FF", kraftC: "#C9A66B" });
Object.assign(materials, {
  abf: M("std", "abfC", { rough: 0.8, metal: 0, env: 0.15 }), abfCure: M("std", "abfCureC", { rough: 0.7, metal: 0, env: 0.2 }), siO2: M("std", "siO2C", { rough: 0.3, metal: 0, env: 0.5 }),
  cu: M("std", "cuC", { rough: 0.3, metal: 0.9, env: 0.8 }), cuB: M("std", "cuBrightC", { rough: 0.25, metal: 0.9, env: 0.9, emissive: "cuBrightC", ei: 0.15 }),
  core: M("std", "coreC", { rough: 0.7, metal: 0, env: 0.15 }), fiber: M("std", "fiberC", { rough: 0.6, metal: 0, env: 0.2 }), sm: M("std", "smC", { rough: 0.4, metal: 0.05, env: 0.4 }),
  resist: M("std", "resistC", { rough: 0.5, metal: 0, env: 0.3 }), pet: M("phys", "petC", { rough: 0.05, metal: 0, clearcoat: 1, opacity: 0.45, env: 0.7 }), cover: M("phys", "coverC", { rough: 0.1, metal: 0, clearcoat: 1, opacity: 0.6, env: 0.6 }),
  laser: M("std", "laserC", { emissive: "laserC", ei: 1.4, rough: 1, metal: 0, opacity: 0.8 }), laserDot: glowM("laserC", 0.95, 1.2), plumeDot: glowM("plumeC2", 0.8, 0.2),
  hbm: M("std", "hbmC", { rough: 0.4, metal: 0.5, env: 0.5 }), die2: M("std", "dieC2", { rough: 0.3, metal: 0.6, env: 0.7 }), inter: M("std", "interC", { rough: 0.35, metal: 0.6, env: 0.6 }),
  solder: M("std", "solderC", { rough: 0.25, metal: 0.95, env: 0.9 }), ionDot2: glowM("ionC2", 0.95, 0.8), heater: M("std", "heaterC", { emissive: "heaterC", ei: 0.5, rough: 0.5, metal: 0 }),
  etchDot: glowM("etchC", 0.9, 0.6), etchFilm: glowM("etchC", 0.35, 0.3),
  kraft: M("std", "kraftC", { rough: 0.85, metal: 0 }), glassCore: M("phys", "glassCoreC", { rough: 0.04, metal: 0, clearcoat: 1, opacity: 0.5, env: 0.9 }), glassEdge: M("std", "glassEdgeC", { rough: 0.1, metal: 0, env: 0.8, opacity: 0.85 }),
  modDot: glowM("modC", 0.95, 1.2), crack: M("std", "laserC", { emissive: "laserC", ei: 0.6, rough: 0.6, metal: 0 }), hot: glowM("heaterC", 0.9, 0.9), coolDot: glowM("chillC", 0.95, 0.7), sigDot: glowM("powC", 0.95, 1.0), hole: M("std", "rubber", { rough: 1, metal: 0 }),
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
const WEAVE = (id, layer, x0, x1, yc, z, step = 0.25) => {
  P({ id: `${id}Wp`, layer, shape: "box", size: [R2(x1 - x0), 0.022, 0.008], pos: [R2((x0 + x1) / 2), yc, z], mat: "fiber" });
  P({ id: `${id}Wf`, layer, shape: "box", size: [R2(step * 0.8), 0.018, 0.01], pos: [0, 0, z + 0.002], at: Array.from({ length: Math.floor((x1 - x0) / step) }, (_, i) => [R2(x0 + step / 2 + i * step), R2(yc + (i % 2 ? 0.032 : -0.032)), 0]), mat: "fiber" });
};
const idsOf = (layer) => parts.filter((q) => q.layer === layer).map((q) => q.id);
const SPIRAL = (a0, cx, y, r0, r1, turns = 1.1) => Array.from({ length: 12 }, (_, i) => { const u = i / 11, [x, z] = pol(a0 + u * 360 * turns, r0 + (r1 - r0) * u); return [R2(x + cx), y, z]; });

// ── 貼圖：國旗、台積電 LOGO（原檔）、沒有原檔可用的公司用白底深色字名牌、電阻率表頭 ──
const TEX = ["flag:TW", "flag:US", "flag:KR", "logo:intel", "logo:samsung", "text:absolics=Absolics|SKC 子公司", "text:unimicron=台灣廠商|送樣中", "text:innolux=台灣廠商|送樣中", "text:m26=2026|現在", "text:m27=2027|最快", "text:m28=2028 以後|多數", "text:goal=量產|預計", "text:ccl=銅箔基板|下一集", "text:unk=尚未確定|截至 2026/11/28"];
{ const r = spawnSync("node", [path.join(HERE, "..", "..", "scripts", "three", "make-brand-tex.mjs"), "tech-glass", ...TEX], { encoding: "utf8" }); if (r.status !== 0) { console.error(r.stdout, r.stderr); process.exit(1); } }
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

// ═════ 站 K：AI 晶片封裝＋載板＋主機板（爆炸剖面：增層＝絕緣膜＋銅線；中間芯板：樹脂玻纖 → 換成玻璃）═════
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
WEAVE("kWv0", "kCore", KX - SW + 0.05, KX + SW - 0.05, R2(kc0 + 0.2), SW + 0.014); WEAVE("kWv1", "kCore", KX - SW + 0.05, KX + SW - 0.05, R2(kc0 + 0.42), SW + 0.014);
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
// 玻璃芯板（和樹脂芯板同一格；一開始在旁邊、念「換成一片玻璃」時滑進來）：玻璃本體＋兩面銅＋玻璃穿孔（銅柱，看得穿）
LAY("kGlass", [10, 0.6, KX, kc0 + 0.3]);
BOX("kGlassB", "kGlass", KX - SW, KX + SW, kc0 + 0.03, kc1 - 0.03, -SW, SW, "glassCore");
{ const g = Array.from({ length: 81 }, (_, i) => [R2(KX - 4.0 + (i % 9) * 1.0), 0, R2(-4.0 + Math.floor(i / 9) * 1.0)]);
  P({ id: "kGlassPadT", layer: "kGlass", shape: "cyl", size: [0.16, 0.025], rot: V, pos: [0, R2(kc1 - 0.012), 0], at: g, mat: "cu" });
  P({ id: "kGlassPadB", layer: "kGlass", shape: "cyl", size: [0.16, 0.025], rot: V, pos: [0, R2(kc0 + 0.012), 0], at: g, mat: "cu" });
  P({ id: "kGlassTrT", layer: "kGlass", shape: "box", size: [0.9, 0.02, 0.06], pos: [0, R2(kc1 - 0.012), 0], at: g.filter((_, i) => i % 9 < 8 && (i * 7) % 5 < 2).map(([x, y, z]) => [R2(x + 0.5), y, z]), mat: "cu" });
  P({ id: "kGlassTrB", layer: "kGlass", shape: "box", size: [0.06, 0.02, 0.9], pos: [0, R2(kc0 + 0.012), 0], at: g.filter((_, i) => i < 72 && (i * 3) % 4 === 1).map(([x, y, z]) => [x, y, R2(z + 0.5)]), mat: "cu" }); }
for (const [x0, x1, z0, z1] of [[-SW, SW, SW - 0.04, SW], [-SW, SW, -SW, -SW + 0.04], [-SW, -SW + 0.04, -SW, SW], [SW - 0.04, SW, -SW, SW]]) BOX(`kGlassE${x0}${z0}`, "kGlass", KX + x0, KX + x1, kc0 + 0.03, kc1 - 0.03, z0, z1, "glassEdge");
P({ id: "kTgv", layer: "kGlass", shape: "tube", size: [0.1, 0.06, R2(kc1 - kc0)], rot: V, pos: [0, R2((kc0 + kc1) / 2), 0], at: Array.from({ length: 81 }, (_, i) => [R2(KX - 4.0 + (i % 9) * 1.0), 0, R2(-4.0 + Math.floor(i / 9) * 1.0)]), mat: "cuB" });
P({ id: "kTgvF", layer: "kGlass", shape: "box", size: [0.14, R2(kc1 - kc0), 0.02], pos: [0, R2((kc0 + kc1) / 2), SW + 0.012], at: [-3.6, -1.2, 1.2, 3.6].map((d) => [KX + d, 0, 0]), mat: "cuB" });

// ═════ 站 W：加熱台（左：樹脂芯板受熱翹起；右：玻璃芯板保持平，線更細更密）═════
const WX = 30, WT = 1.3, WS = 0.25;
LAY("wBase", [18, 1.4, WX, 0.7]);
BOX("wBody", "wBase", WX - 8, WX + 8, 0, 1.0, -3, 3, "steel2"); BOX("wTop", "wBase", WX - 7.6, WX + 7.6, 1.0, WT, -2.6, 2.6, "dark");
P({ id: "wScrew", layer: "wBase", shape: "cyl", size: [0.12, 0.04], rot: V, pos: [0, R2(WT + 0.02), 0], at: [[WX - 7.3, 0, -2.3], [WX + 7.3, 0, -2.3], [WX - 7.3, 0, 2.3], [WX + 7.3, 0, 2.3], [WX, 0, -2.3], [WX, 0, 2.3]], mat: "steel" });
P({ id: "wGrille", layer: "wBase", shape: "box", size: [0.06, 0.7, 0.02], pos: [0, 0.5, 3.01], at: Array.from({ length: 12 }, (_, i) => [R2(WX + 1.0 + i * 0.25), 0, 0]), mat: "dark" });
PIPE("wTc", "wBase", [[WX + 7.4, R2(WT + 0.05), 2.3], [WX + 7.9, R2(WT + 0.05), 2.3], [WX + 7.9, 1.6, 0.6], [WX + 8.4, 1.6, 0.6]], 0.04, "cable");
P({ id: "wHeat", layer: "wBase", shape: "box", size: [14.6, 0.08, 0.04], pos: [WX, 0, 2.62], at: [[0, 1.08, 0], [0, 1.2, 0]], mat: "heater" });
P({ id: "wFoot", layer: "wBase", shape: "cyl", size: [0.25, 0.2], rot: V, pos: [0, 0.1, 0], at: [[WX - 7.4, 0, -2.6], [WX + 7.4, 0, -2.6], [WX - 7.4, 0, 2.6], [WX + 7.4, 0, 2.6]], mat: "rubber" });
P({ id: "wVent", layer: "wBase", shape: "box", size: [0.9, 0.06, 0.02], pos: [0, 0, 3.01], at: Array.from({ length: 5 }, (_, i) => [R2(WX - 6.5 + i * 0.2), R2(0.3 + (i % 2) * 0), 0]).concat(Array.from({ length: 4 }, (_, i) => [WX - 6.5, R2(0.3 + i * 0.15), 0])), mat: "seam" });
LAY("wCtrl", [3, 3, WX + 9.5, 1.5]);
BOX("wCtrlB", "wCtrl", WX + 8.4, WX + 10.6, 0, 2.6, -1.0, 1.0, "panel"); BOX("wScreen", "wCtrl", WX + 8.7, WX + 10.3, 1.7, 2.3, 1.0, 1.03, "screen");
ZC("wKnob", "wCtrl", 0.22, 1.0, 1.15, WX + 9.0, 1.1, "dark"); SPH("wLamp", "wCtrl", 0.1, WX + 10.0, 1.15, 1.06, "lampR"); BOX("wPlate", "wCtrl", WX + 8.7, WX + 10.3, 0.4, 0.7, 1.0, 1.02, "gold");
PIPE("wCable", "wCtrl", [[WX + 8.4, 0.5, 0], [WX + 8.0, 0.5, 0]], 0.08, "cable");
// 樹脂芯板試片（三段：左、中、右；左右兩段受熱往上翹）
const RX0 = WX - 6.6, RX1 = WX - 5.1, RX2 = WX - 2.1, RX3 = WX - 0.6;
const RSEG = (id, x0, x1) => { LAY(id, [R2(x1 - x0), 0.4, R2((x0 + x1) / 2), WT + 0.15]);
  BOX(`${id}B`, id, x0, x1, WT, WT + WS, -2, 2, "core");
  P({ id: `${id}Fib`, layer: id, shape: "cyl", size: [0.045, 0.02], pos: [0, R2(WT + WS / 2), 2.01], at: Array.from({ length: Math.round((x1 - x0) / 0.25) }, (_, i) => [R2(x0 + 0.12 + i * 0.25), 0, 0]), mat: "fiber" });
  P({ id: `${id}Ln`, layer: id, shape: "box", size: [R2(x1 - x0 - 0.1), 0.03, 0.24], pos: [R2((x0 + x1) / 2), R2(WT + WS + 0.015), 0], at: [-1.5, -0.75, 0, 0.75, 1.5].map((z) => [0, 0, z]), mat: "cu" });
  WEAVE(`${id}Wv`, id, x0 + 0.02, x1 - 0.02, R2(WT + WS / 2), 2.014, 0.125); };
const SG = R2((RX1 - RX0) / 4);
for (let k = 0; k < 4; k++) { RSEG(`wRl${k}`, R2(RX1 - (k + 1) * SG), R2(RX1 - k * SG)); RSEG(`wRr${k}`, R2(RX2 + k * SG), R2(RX2 + (k + 1) * SG)); }
RSEG("wRm", RX1, RX2);
const CHIP = (id, layer, cx, hw, hd) => { const y0 = WT + WS;
  BOX(`${id}Uf`, layer, R2(cx - hw - 0.08), R2(cx + hw + 0.08), y0, R2(y0 + 0.05), R2(-hd - 0.08), R2(hd + 0.08), "abfCure");
  P({ id: `${id}Bump`, layer, shape: "sphere", size: [0.035], pos: [0, R2(y0 + 0.03), R2(hd + 0.03)], at: Array.from({ length: Math.round(hw * 10) }, (_, i) => [R2(cx - hw + 0.1 + i * 0.2), 0, 0]), mat: "solder" });
  BOX(`${id}B`, layer, R2(cx - hw), R2(cx + hw), R2(y0 + 0.05), R2(y0 + 0.3), -hd, hd, "die2");
  BOX(`${id}Lid`, layer, R2(cx - hw + 0.05), R2(cx + hw - 0.05), R2(y0 + 0.3), R2(y0 + 0.36), R2(-hd + 0.05), R2(hd - 0.05), "steel");
  BOX(`${id}Mk`, layer, R2(cx - hw * 0.5), R2(cx + hw * 0.1), R2(y0 + 0.36), R2(y0 + 0.365), R2(-hd * 0.4), R2(-hd * 0.2), "dark"); };
LAY("wChipS", [2, 0.4, R2((RX1 + RX2) / 2), WT + 0.45]); CHIP("wChipS", "wChipS", R2((RX1 + RX2) / 2), 0.8, 0.8);
LAY("wChipB", [3.2, 0.4, R2((RX1 + RX2) / 2), WT + 0.45]); CHIP("wChipB", "wChipB", R2((RX1 + RX2) / 2), 1.4, 1.3);
// 玻璃芯板試片（平，線細又密，看得到穿孔銅柱）
const GX0 = WX + 0.8, GX1 = WX + 6.8, GXc = WX + 3.8;
LAY("wGlass", [6, 0.6, GXc, WT + 0.2]);
BOX("wGlassB", "wGlass", GX0, GX1, WT, WT + WS, -2, 2, "glassCore");
BOX("wGlassEF", "wGlass", GX0, GX1, WT, WT + WS, 1.97, 2.0, "glassEdge");
P({ id: "wGlassLn", layer: "wGlass", shape: "box", size: [5.9, 0.025, 0.07], pos: [GXc, R2(WT + WS + 0.012), 0], at: Array.from({ length: 13 }, (_, i) => [0, 0, R2(-1.8 + i * 0.3)]), mat: "cu" });
P({ id: "wGlassTgv", layer: "wGlass", shape: "cyl", size: [0.05, WS], rot: V, pos: [0, R2(WT + WS / 2), 0], at: Array.from({ length: 24 }, (_, i) => [R2(GX0 + 0.5 + (i % 8) * 0.7), 0, R2(-1.2 + Math.floor(i / 8) * 1.2)]), mat: "cuB" });
CHIP("wGlassChip", "wGlass", GXc, 1.4, 1.3);
// 平直尺（量平：玻璃那邊貼平，樹脂那邊兩端翹起離開直尺）
LAY("wRule", [6.4, 0.2, GXc, WT + WS + 0.04]); BOX("wRuleB", "wRule", GX0 - 0.2, GX1 + 0.2, WT + WS, WT + WS + 0.07, -1.95, -1.65, "steel"); P({ id: "wRuleTick", layer: "wRule", shape: "box", size: [0.02, 0.01, 0.12], pos: [0, R2(WT + WS + 0.075), -1.75], at: Array.from({ length: 13 }, (_, i) => [R2(GX0 + i * 0.5), 0, 0]), mat: "dark" });
LAY("wRule2", [6.4, 0.2, R2((RX0 + RX3) / 2), WT + WS + 0.3]); BOX("wRule2B", "wRule2", RX0 - 0.2, RX3 + 0.2, R2(WT + WS + 0.2), R2(WT + WS + 0.27), -1.95, -1.65, "steel"); P({ id: "wRule2Tick", layer: "wRule2", shape: "box", size: [0.02, 0.01, 0.12], pos: [0, R2(WT + WS + 0.275), -1.75], at: Array.from({ length: 13 }, (_, i) => [R2(RX0 + i * 0.5), 0, 0]), mat: "dark" });

// ═════ 站 T：玻璃穿孔（雷射一排排改質 → 蝕刻液開孔 → 鍍銅接通）＋機械鑽玻璃小片（會裂）═════
const TX = 60, TG0 = 1.3, TG1 = 1.7, TZR = [-1.4, 0, 1.4], TXS = Array.from({ length: 7 }, (_, i) => R2(TX - 3.6 + i * 1.2));
LAY("tBase", [14, 1, TX, 0.5]); BOX("tTable", "tBase", TX - 7, TX + 7, 0, 1.0, -3.4, 3.4, "band");
P({ id: "tRail", layer: "tBase", shape: "box", size: [13.6, 0.08, 0.2], pos: [TX, 1.04, 0], at: [[0, 0, -3.0], [0, 0, 3.0]], mat: "steel2" });
P({ id: "tPin", layer: "tBase", shape: "cyl", size: [0.12, 0.3], rot: V, pos: [0, 1.15, 0], at: [[TX - 4.2, 0, -2.2], [TX + 4.2, 0, -2.2], [TX - 4.2, 0, 2.2], [TX + 4.2, 0, 2.2]], mat: "steel" });
const TGL = ["tGlass", "tMod0", "tMod1", "tMod2", "tHole", "tCu", "tEtchL"];
LAY("tGlass", [9, 0.5, TX, 1.5]); BOX("tGlassB", "tGlass", TX - 4.5, TX + 4.5, TG0, TG1, -2.5, 2.5, "glassCore");
for (const [x0, x1, z0, z1] of [[-4.5, 4.5, 2.46, 2.5], [-4.5, 4.5, -2.5, -2.46], [-4.5, -4.46, -2.5, 2.5], [4.46, 4.5, -2.5, 2.5]]) BOX(`tGlassE${x0}${z0}`, "tGlass", TX + x0, TX + x1, TG0, TG1, z0, z1, "glassEdge");
TZR.forEach((z, r) => { LAY(`tMod${r}`, [9, 0.5, TX, 1.5]); P({ id: `tModL${r}`, layer: `tMod${r}`, shape: "cyl", size: [0.035, R2(TG1 - TG0)], rot: V, pos: [0, R2((TG0 + TG1) / 2), 0], at: TXS.map((x) => [x, 0, z]), mat: "modDot" }); });
LAY("tHole", [9, 0.5, TX, 1.5]); P({ id: "tHoleC", layer: "tHole", shape: "cyl", size: [0.16, R2(TG1 - TG0 + 0.01)], rot: V, pos: [0, R2((TG0 + TG1) / 2), 0], at: TZR.flatMap((z) => TXS.map((x) => [x, 0, z])), mat: "hole" });
LAY("tCuW", [9, 0.6, TX, 1.5]); P({ id: "tCuWall", layer: "tCuW", shape: "tube", size: [0.17, 0.12, R2(TG1 - TG0 + 0.01)], rot: V, pos: [0, R2((TG0 + TG1) / 2), 0], at: TZR.flatMap((z) => TXS.map((x) => [x, 0, z])), mat: "cu" });
LAY("tNo", [2, 0.6, TXS[3] - 0.6, TG1 + 0.3]); P({ id: "tNoX", layer: "tNo", shape: "box", size: [0.9, 0.09, 0.02], pos: [TXS[3], R2(TG1 + 0.55), 2.56], at: [[0, 0, 0]], rot: [0, 0, 45], mat: "lampR" }); P({ id: "tNoX2", layer: "tNo", shape: "box", size: [0.9, 0.09, 0.02], pos: [TXS[3], R2(TG1 + 0.55), 2.56], rot: [0, 0, -45], mat: "lampR" });
P({ id: "tNoPad", layer: "tNo", shape: "box", size: [1.0, 0.03, 0.3], pos: [R2(TXS[3] - 0.7), R2(TG1 + 0.015), 2.35], mat: "cu" });
LAY("tCu", [9, 0.6, TX, 1.5]); P({ id: "tCuC", layer: "tCu", shape: "cyl", size: [0.17, R2(TG1 - TG0 + 0.02)], rot: V, pos: [0, R2((TG0 + TG1) / 2), 0], at: TZR.flatMap((z) => TXS.map((x) => [x, 0, z])), mat: "cu" });
P({ id: "tCuPadT", layer: "tCu", shape: "cyl", size: [0.22, 0.012], rot: V, pos: [0, R2(TG1 + 0.006), 0], at: TZR.flatMap((z) => TXS.map((x) => [x, 0, z])), mat: "cuB" });
P({ id: "tCuPadB", layer: "tCu", shape: "cyl", size: [0.22, 0.012], rot: V, pos: [0, R2(TG0 - 0.006), 0], at: TZR.flatMap((z) => TXS.map((x) => [x, 0, z])), mat: "cuB" });
LAY("tEtchL", [9.4, 0.7, TX, 1.5]); BOX("tEtchT", "tEtchL", TX - 4.7, TX + 4.7, TG1 + 0.01, TG1 + 0.16, -2.6, 2.6, "etchFilm"); BOX("tEtchB", "tEtchL", TX - 4.7, TX + 4.7, TG0 - 0.16, TG0 - 0.01, -2.6, 2.6, "etchFilm");
// 雷射頭（龍門＋振鏡盒＋鏡筒＋聚焦鏡＋光錐收斂到玻璃面；沿 x 掃一排）
LAY("tFrame", [12, 6, TX, 4]);
BOX("tPostL", "tFrame", TX - 5.6, TX - 5.0, 1.0, 6.6, -0.5, 0.5, "panel"); BOX("tPostR", "tFrame", TX + 5.0, TX + 5.6, 1.0, 6.6, -0.5, 0.5, "panel");
P({ id: "tPostBolt", layer: "tFrame", shape: "cyl", size: [0.05, 0.03], pos: [0, 0, 0.51], at: [[TX - 5.3, 1.4, 0], [TX + 5.3, 1.4, 0], [TX - 5.3, 6.2, 0], [TX + 5.3, 6.2, 0]], mat: "steel" });
BOX("tBeam", "tFrame", TX - 5.6, TX + 5.6, 6.0, 6.6, -0.7, 0.3, "panel"); BOX("tBeamRail", "tFrame", TX - 5.0, TX + 5.0, 5.9, 6.0, -0.15, 0.15, "steel2"); BOX("tBeamPl", "tFrame", TX + 2.6, TX + 4.4, 6.1, 6.45, 0.3, 0.33, "gold");
BOX("tWarn", "tFrame", TX - 5.55, TX - 5.05, 3.0, 3.5, 0.5, 0.52, "warnY");
LAY("tHead", [2, 3, TX, 4.5]);
BOX("tGalvo", "tHead", TX - 0.7, TX + 0.7, 4.6, 5.9, -0.6, 0.6, "dark"); BOX("tGalvoPl", "tHead", TX - 0.5, TX + 0.1, 5.2, 5.5, 0.6, 0.62, "gold");
LAY("tHeadB", [1, 1.5, TX, 4]); LAY("tHeadL", [1, 0.3, TX, 3.35]); VC("tBarrel", "tHeadB", 0.28, 3.4, 4.6, "steel2", { x: TX }); VC("tLens", "tHeadL", 0.22, 3.3, 3.42, "quartz", { x: TX }); VT("tLensRing", "tHeadL", 0.3, 0.22, 3.3, 3.42, "dark", { x: TX });
SPH("tLed", "tHead", 0.06, TX + 0.5, 5.7, 0.62, "lampG");
LAY("tBeamL", [0.5, 2, TX, 2.5]); P({ id: "tCone", layer: "tBeamL", shape: "cone", size: [0.04, 0.3, 1.6], rot: V, pos: [TX, R2(TG1 + 0.8), 0], mat: "laser" });
// 蝕刻液槽（右後方，管路接到玻璃面上方的噴頭）
LAY("tTank", [3, 3, TX + 8.6, 1.5]);
BOX("tTankB", "tTank", TX + 7.4, TX + 9.8, 0, 2.6, -2.6, -0.6, "tankP"); BOX("tTankWin", "tTank", TX + 7.7, TX + 9.5, 1.2, 2.2, -0.6, -0.57, "window"); BOX("tTankLiq", "tTank", TX + 7.7, TX + 9.5, 1.2, 1.8, -0.62, -0.6, "etchFilm");
BOX("tTankPl", "tTank", TX + 7.7, TX + 9.5, 0.4, 0.8, -0.6, -0.58, "warnY"); PIPE("tTankP", "tTank", [[TX + 7.4, 2.3, -1.6], [TX + 5.0, 2.3, -1.6], [TX + 5.0, 2.3, -2.6]], 0.08, "pipeW", { jmat: "steel2" });
// 機械鑽玻璃小片（右前）：支架、玻璃小片分左右兩半、鑽頭、裂紋
const CPX = TX + 6.0, CPZ = 2.6, CPY = 1.6;
LAY("tCoupS", [2.4, 1.6, CPX, 0.8]); BOX("tCoupStand", "tCoupS", CPX - 1.1, CPX + 1.1, 0, CPY - 0.02, CPZ - 0.9, CPZ + 0.9, "steel2"); BOX("tViseJL", "tCoupS", CPX - 1.15, CPX - 0.9, R2(CPY - 0.1), R2(CPY + 0.32), CPZ - 0.95, CPZ + 0.95, "dark"); BOX("tViseJR", "tCoupS", CPX + 0.9, CPX + 1.15, R2(CPY - 0.1), R2(CPY + 0.32), CPZ - 0.95, CPZ + 0.95, "dark");
BOX("tViseJLf", "tCoupS", CPX - 0.92, CPX - 0.9, R2(CPY), R2(CPY + 0.3), CPZ - 0.9, CPZ + 0.9, "steel"); BOX("tViseJRf", "tCoupS", CPX + 0.9, CPX + 0.92, R2(CPY), R2(CPY + 0.3), CPZ - 0.9, CPZ + 0.9, "steel");
HXC("tViseScrew", "tCoupS", 0.07, CPX + 1.15, CPX + 2.0, R2(CPY + 0.1), CPZ, "steel"); P({ id: "tViseWheel", layer: "tCoupS", shape: "tube", size: [0.3, 0.24, 0.06], rot: HX, pos: [CPX + 2.0, R2(CPY + 0.1), CPZ], mat: "dark" });
P({ id: "tViseSpoke", layer: "tCoupS", shape: "box", size: [0.04, 0.56, 0.04], pos: [CPX + 2.0, R2(CPY + 0.1), CPZ], at: [[0, 0, 0]], mat: "steel" }); P({ id: "tViseSpoke2", layer: "tCoupS", shape: "box", size: [0.04, 0.04, 0.56], pos: [CPX + 2.0, R2(CPY + 0.1), CPZ], mat: "steel" });
BOX("tPressBase", "tCoupS", CPX - 1.6, CPX + 1.6, 0, 0.15, CPZ - 2.2, CPZ + 1.2, "steel2"); VC("tColumn", "tCoupS", 0.16, 0.15, R2(CPY + 3.6), "steel", { x: CPX, z: CPZ - 1.6 });
BOX("tArm", "tCoupS", CPX - 0.3, CPX + 0.3, R2(CPY + 3.0), R2(CPY + 3.4), CPZ - 1.7, CPZ - 0.4, "panel");
LAY("tCoupL", [1, 0.2, CPX - 0.45, CPY + 0.1]); BOX("tCoupLB", "tCoupL", CPX - 0.9, CPX, CPY, CPY + 0.2, CPZ - 0.8, CPZ + 0.8, "glassCore"); BOX("tCoupLE", "tCoupL", CPX - 0.9, CPX, CPY, CPY + 0.2, CPZ + 0.77, CPZ + 0.8, "glassEdge");
LAY("tCoupR", [1, 0.2, CPX + 0.45, CPY + 0.1]); BOX("tCoupRB", "tCoupR", CPX, CPX + 0.9, CPY, CPY + 0.2, CPZ - 0.8, CPZ + 0.8, "glassCore"); BOX("tCoupRE", "tCoupR", CPX, CPX + 0.9, CPY, CPY + 0.2, CPZ + 0.77, CPZ + 0.8, "glassEdge");
LAY("tCrack", [1.6, 0.1, CPX, CPY + 0.21]);
{ const pts = [[0, -0.8], [0.12, -0.45], [-0.1, -0.15], [0.08, 0.2], [-0.06, 0.5], [0.05, 0.8]]; for (let i = 0; i < pts.length - 1; i++) { const [x0, z0] = pts[i], [x1, z1] = pts[i + 1], L = Math.hypot(x1 - x0, z1 - z0), a = Math.atan2(x1 - x0, z1 - z0) / D2R;
  P({ id: `tCrk${i}`, layer: "tCrack", shape: "box", size: [0.035, 0.02, R2(L)], pos: [R2(CPX + (x0 + x1) / 2), R2(CPY + 0.215), R2(CPZ + (z0 + z1) / 2)], rot: [0, R2(a), 0], mat: "crack" }); }
  [[0.55, 0.15], [-0.5, 0.35], [0.4, -0.5], [-0.45, -0.45]].forEach(([dx, dz], i) => { const L = Math.hypot(dx, dz), a = Math.atan2(dx, dz) / D2R; P({ id: `tCrkR${i}`, layer: "tCrack", shape: "box", size: [0.025, 0.02, R2(L)], pos: [R2(CPX + dx / 2), R2(CPY + 0.216), R2(CPZ + dz / 2)], rot: [0, R2(a), 0], mat: "crack" }); });
  BOX("tChip0", "tCrack", CPX + 0.7, CPX + 0.9, CPY + 0.1, CPY + 0.215, CPZ + 0.62, CPZ + 0.81, "crack");
  P({ id: "tCrkF", layer: "tCrack", shape: "box", size: [0.035, 0.2, 0.02], pos: [CPX + 0.05, R2(CPY + 0.1), R2(CPZ + 0.815)], mat: "crack" }); }
LAY("tDrill", [1, 2, CPX, CPY + 1.4]);
VC("tChuck", "tDrill", 0.2, R2(CPY + 1.3), R2(CPY + 1.75), "steel", { x: CPX, z: CPZ }); VC("tQuill", "tDrill", 0.26, R2(CPY + 1.75), R2(CPY + 2.2), "steel2", { x: CPX, z: CPZ });
BOX("tMotor", "tDrill", CPX - 0.55, CPX + 0.55, CPY + 2.2, CPY + 3.0, CPZ - 0.7, CPZ + 0.45, "panel"); P({ id: "tMotorGr", layer: "tDrill", shape: "box", size: [0.9, 0.04, 0.02], pos: [CPX, 0, R2(CPZ + 0.46)], at: Array.from({ length: 6 }, (_, i) => [0, R2(CPY + 2.35 + i * 0.1), 0]), mat: "dark" });
VC("tMotorCap", "tDrill", 0.45, R2(CPY + 3.0), R2(CPY + 3.6), "dark", { x: CPX, z: CPZ - 0.15 }); HXC("tFeedHub", "tDrill", 0.12, CPX + 0.55, CPX + 0.75, R2(CPY + 2.5), CPZ - 0.1, "steel");
[0, 120, 240].forEach((a, i) => { const [dy, dz] = pol(a, 0.45); P({ id: `tFeed${i}`, layer: "tDrill", shape: "box", size: [0.04, 0.04, 0.9], pos: [CPX + 0.7, R2(CPY + 2.5 + dy / 2), R2(CPZ - 0.1 + dz / 2)], rot: [R2(-a), 0, 0], mat: "steel" }); SPH(`tFeedK${i}`, "tDrill", 0.08, CPX + 0.7, R2(CPY + 2.5 + dy), R2(CPZ - 0.1 + dz), "dark"); });
P({ id: "tBit", layer: "tDrill", shape: "cyl", size: [0.06, 1.0], rot: V, pos: [CPX, R2(CPY + 0.8), CPZ], mat: "needle" });
for (let i = 0; i < 10; i++) P({ id: `tFlute${i}`, layer: "tDrill", shape: "box", size: [0.14, 0.03, 0.025], pos: [CPX, R2(CPY + 0.4 + i * 0.07), CPZ], rot: [0, i * 36, 20], mat: "steel2" });
LAY("tChips", [1, 0.6, CPX, CPY + 0.4]);

// ═════ 站 C：公司（後排三廠：英特爾、三星電機、Absolics 美國喬治亞州廠；前排台灣兩家：欣興、群創，送樣箱）═════
const CX = 90;
const FAB = (id, x, z, w, d, h, logo, logoW) => { LAY(id, [w + 1, h + 1, x, h / 2]);
  BOX(`${id}B`, id, x - w / 2, x + w / 2, 0.12, h, z - d / 2, z + d / 2, "panel");
  BOX(`${id}Roof`, id, x - w / 2 - 0.1, x + w / 2 + 0.1, h, h + 0.15, z - d / 2 - 0.1, z + d / 2 + 0.1, "roof");
  BOX(`${id}Win`, id, x - w / 2 + 0.3, x + w / 2 - 0.3, R2(h * 0.62), R2(h * 0.8), z + d / 2, z + d / 2 + 0.04, "glassDark");
  BOX(`${id}Door`, id, x + w / 2 - 1.4, x + w / 2 - 0.4, 0.12, 1.3, z + d / 2, z + d / 2 + 0.06, "dark");
  P({ id: `${id}Fan`, layer: id, shape: "cyl", size: [0.35, 0.25], rot: V, pos: [0, R2(h + 0.28), 0], at: [[x - w / 4, 0, z], [x + w / 4, 0, z]], mat: "steel2" });
  VC(`${id}Stack`, id, 0.22, h, h + 1.4, "steel2", { x: x + w / 2 - 0.6, z: z - d / 2 + 0.6 });
  BOX(`${id}SignBg`, id, x - w / 2 + 0.3, x - w / 2 + 0.5 + logoW, 0.4, R2(0.4 + logoW * 0.42), z + d / 2, z + d / 2 + 0.04, "panel");
  PLATE(`${id}Sign`, id, logo, logoW, R2(x - w / 2 + 0.4 + logoW / 2), R2(0.4 + logoW * 0.21), R2(z + d / 2 + 0.05)); };
FAB("cIntel", CX - 6.4, -2.5, 5.2, 3, 3.2, "sign-intel", 2.0);
FAB("cSem", CX, -2.5, 5.2, 3, 3.2, "sign-samsung", 2.4);
FAB("cAbs", CX + 6.4, -2.5, 5.2, 3, 3.2, "sign-absolics", 2.4);
// 英特爾：屋頂排氣管架（彎頭＋管夾）
PIPE("cIntelEx", "cIntel", [[CX - 8.4, 3.35, -2.0], [CX - 8.4, 4.2, -2.0], [CX - 4.6, 4.2, -2.0], [CX - 4.6, 3.35, -2.0]], 0.12, "pipeW"); CLAMPS("cIntelExC", "cIntel", [[CX - 8.4, 4.2, -2.0], [CX - 4.6, 4.2, -2.0]], 0.12, 0.8);
P({ id: "cIntelExS", layer: "cIntel", shape: "box", size: [0.08, 0.85, 0.08], pos: [0, 3.77, -2.0], at: [[CX - 7.2, 0, 0], [CX - 5.8, 0, 0]], mat: "steel2" });
// 三星電機：側面管線橋（接到旁邊的公用棟）
BOX("cSemBr", "cSem", CX + 2.6, CX + 3.6, 2.2, 2.6, -2.8, -2.2, "steel2"); P({ id: "cSemBrP", layer: "cSem", shape: "cyl", size: [0.08, 1.0], rot: HX, pos: [CX + 3.1, 0, -2.5], at: [[0, 2.3, -0.15], [0, 2.3, 0.15], [0, 2.5, 0]], mat: "pipeW" });
VC("cSemBrL", "cSem", 0.08, 0, 2.2, "steel2", { x: CX + 3.5, z: -2.5 }); BOX("cSemTank", "cSem", CX - 2.4, CX - 1.0, 3.35, 4.1, -3.4, -2.6, "steel2");
// Absolics：側面裝卸碼頭（捲門＋月台）
BOX("cAbsDock", "cAbs", CX + 4.2, CX + 6.0, 0, 0.5, -1.0, -0.2, "band"); BOX("cAbsRoll", "cAbs", CX + 4.4, CX + 5.8, 0.5, 1.9, -1.0, -0.96, "dark");
P({ id: "cAbsRollL", layer: "cAbs", shape: "box", size: [1.4, 0.03, 0.02], pos: [CX + 5.1, 0, -0.95], at: Array.from({ length: 7 }, (_, i) => [0, R2(0.6 + i * 0.2), 0]), mat: "steel2" });
BOX("cAbsCan", "cAbs", CX + 4.2, CX + 6.0, 1.95, 2.05, -1.0, -0.3, "roof");
LAY("cfIntel", [1.6, 5, CX - 4.4, 2.5]); FLAGPOLE("cfIntelP", "cfIntel", "US", CX - 4.4, -0.4, 4.4, 1.0);
LAY("cfSem", [1.6, 5, CX - 2.9, 2.5]); FLAGPOLE("cfSemP", "cfSem", "KR", CX - 2.9, -0.4, 4.4, 1.0);
LAY("cfAbs", [3, 5, CX + 4.9, 2.5]); FLAGPOLE("cfAbsK", "cfAbs", "KR", CX + 4.2, -0.4, 4.4, 1.0); FLAGPOLE("cfAbsU", "cfAbs", "US", CX + 5.6, -0.4, 3.6, 1.0);
const LAB = (id, x, logo) => { LAY(id, [4, 2.4, x, 1.2]);
  BOX(`${id}B`, id, x - 2, x + 2, 0.12, 2.0, 2.2, 4.2, "panel2"); BOX(`${id}Roof`, id, x - 2.1, x + 2.1, 2.0, 2.12, 2.1, 4.3, "roof");
  BOX(`${id}Door`, id, x + 0.9, x + 1.7, 0.12, 1.2, 4.2, 4.25, "dark"); BOX(`${id}SignBg`, id, x - 1.8, x + 0.7, 1.25, 1.85, 4.2, 4.24, "panel");
  PLATE(`${id}Sign`, id, logo, 2.4, x - 0.55, 1.55, 4.25); };
LAB("cUni", CX - 5.5, "sign-unimicron"); LAB("cInno", CX + 1.5, "sign-innolux");
LAY("cfTw", [1.6, 3, CX - 2.0, 1.2]); FLAGPOLE("cfTwP", "cfTw", "TW", CX - 2.0, 4.4, 2.0, 1.0);
// 送樣箱（台灣兩家各一箱，念「送樣」時往外送）：箱子＋上面一片玻璃基板樣品
const BOXES = (id, x) => { LAY(id, [1.2, 0.8, x, 0.4]); BOX(`${id}B`, id, x - 0.5, x + 0.5, 0.12, 0.6, 4.6, 5.4, "kraft"); BOX(`${id}G`, id, x - 0.4, x + 0.4, 0.6, 0.66, 4.7, 5.3, "glassCore"); BOX(`${id}Tape`, id, x - 0.06, x + 0.06, 0.6, 0.61, 4.6, 5.4, "warnY"); };
BOXES("cBoxU", CX - 4.0); BOXES("cBoxI", CX + 3.0);
P({ id: "cRoad", layer: "floor", shape: "box", size: [26, 0.02, 1.2], pos: [CX, 0.02, 5.0], mat: "band" });

// ═════ 站 Q：量產時程路標（2026 現在 → 2027 最快 → 2028 以後），推車載玻璃基板往前、被推回；旁邊可靠性測試箱（冷熱循環）═════
const QX = 120;
LAY("qRoad", [20, 0.2, QX, 0.06]); BOX("qRoadB", "qRoad", QX - 10, QX + 10, 0.02, 0.08, -0.9, 0.9, "band"); P({ id: "qDash", layer: "qRoad", shape: "box", size: [0.8, 0.01, 0.1], pos: [0, 0.085, 0], at: Array.from({ length: 10 }, (_, i) => [R2(QX - 9 + i * 2), 0, 0]), mat: "warnY" });
const POST = (id, x, sign) => { LAY(id, [3.4, 3.6, x, 1.8]); VC(`${id}P`, id, 0.08, 0, 2.6, "steel2", { x, z: -1.4 }); BOX(`${id}Bg`, id, x - 1.5, x + 1.5, 2.2, 3.5, -1.47, -1.43, "panel"); PLATE(`${id}S`, id, sign, 2.8, x, 2.85, -1.42); };
POST("qP26", QX - 5, "sign-m26"); POST("qP27", QX, "sign-m27"); POST("qP28", QX + 5, "sign-m28");
LAY("qCart", [4.8, 2.0, QX - 7, 1.0]);
BOX("qCartB", "qCart", QX - 9.2, QX - 4.8, 0.55, 0.8, -1.2, 1.2, "steel2"); P({ id: "qWheel", layer: "qCart", shape: "cyl", size: [0.34, 0.2], pos: [0, 0.34, 0], at: [[QX - 8.6, 0, -1.25], [QX - 5.4, 0, -1.25], [QX - 8.6, 0, 1.25], [QX - 5.4, 0, 1.25]], mat: "rubber" });
BOX("qCartG", "qCart", QX - 8.8, QX - 5.2, 0.8, 1.15, -1.0, 1.0, "glassCore"); P({ id: "qCartTgv", layer: "qCart", shape: "tube", size: [0.07, 0.045, 0.35], rot: V, pos: [0, 0.975, 0], at: Array.from({ length: 24 }, (_, i) => [R2(QX - 8.5 + (i % 8) * 0.43), 0, R2(-0.6 + Math.floor(i / 8) * 0.6)]), mat: "cuB" });
VC("qCartPostL", "qCart", 0.05, 0.8, 1.9, "steel", { x: QX - 9.1, z: -0.9 }); VC("qCartPostR", "qCart", 0.05, 0.8, 1.9, "steel", { x: QX - 9.1, z: 0.9 }); ZC("qCartBar", "qCart", 0.06, -1.0, 1.0, QX - 9.1, 1.9, "rubber");
// 量產目標旗（念「一延再延」時往後挪兩次）
LAY("qGoal", [3, 5.4, QX + 1.8, 2.7]); VC("qGoalP", "qGoal", 0.08, 0, 5.4, "steel2", { x: QX + 0.4, z: 0 }); VC("qGoalB", "qGoal", 0.3, 0, 0.14, "dark", { x: QX + 0.4, z: 0 }); PLATE("qGoalS", "qGoal", "sign-goal", 3.4, QX + 2.2, 4.6, 0.02);
LAY("qTest", [3.4, 3.4, QX + 3.2, 1.7]);
BOX("qTestB", "qTest", QX + 1.6, QX + 4.8, 0, 3.2, 1.4, 3.6, "panel"); BOX("qTestWin", "qTest", QX + 2.0, QX + 4.0, 1.2, 2.6, 3.6, 3.63, "window"); BOX("qTestIn", "qTest", QX + 2.0, QX + 4.0, 1.2, 2.6, 2.0, 2.04, "dark");
P({ id: "qTestRack", layer: "qTest", shape: "box", size: [1.8, 0.04, 1.2], pos: [QX + 3.0, 0, 2.8], at: [[0, 1.6, 0], [0, 2.1, 0]], mat: "steel2" }); P({ id: "qTestPanel", layer: "qTest", shape: "box", size: [1.4, 0.06, 0.9], pos: [QX + 3.0, 0, 2.8], at: [[0, 1.65, 0], [0, 2.15, 0]], mat: "glassCore" });
SPH("qLampH", "qTest", 0.12, QX + 4.4, 2.9, 3.62, "lampR"); SPH("qLampC", "qTest", 0.12, QX + 4.4, 2.5, 3.62, "chill");
BOX("qTestFrT", "qTest", QX + 1.9, QX + 4.1, 2.6, 2.7, 3.6, 3.66, "steel"); BOX("qTestFrB", "qTest", QX + 1.9, QX + 4.1, 1.1, 1.2, 3.6, 3.66, "steel"); BOX("qTestFrL", "qTest", QX + 1.9, QX + 2.0, 1.1, 2.7, 3.6, 3.66, "steel"); BOX("qTestFrR", "qTest", QX + 4.0, QX + 4.1, 1.1, 2.7, 3.6, 3.66, "steel");
BOX("qTestHandle", "qTest", QX + 3.7, QX + 3.8, 0.9, 1.0, 3.6, 3.75, "steel"); P({ id: "qTestHinge", layer: "qTest", shape: "cyl", size: [0.06, 0.3], rot: V, pos: [0, 0, 3.62], at: [[QX + 1.65, 0.8, 0], [QX + 1.65, 2.6, 0]], mat: "steel" });
P({ id: "qTestVent", layer: "qTest", shape: "box", size: [0.02, 0.06, 1.6], pos: [R2(QX + 4.81), 0, 2.5], at: Array.from({ length: 8 }, (_, i) => [0, R2(0.4 + i * 0.12), 0]), mat: "dark" });
SPH("qTestStop", "qTest", 0.13, QX + 4.4, 0.8, 3.64, "lampR"); VC("qTestPort", "qTest", 0.12, 3.2, 3.4, "dark", { x: QX + 2.0, z: 2.0 });
BOX("qTestScreen", "qTest", QX + 4.15, QX + 4.65, 1.4, 2.1, 3.6, 3.63, "screen");
LAY("qUnk", [3.6, 2.4, QX + 5.6, 1.4]); VC("qUnkP", "qUnk", 0.06, 0, 1.0, "steel2", { x: QX + 5.6, z: 4.0 }); BOX("qUnkBg", "qUnk", QX + 3.8, QX + 7.4, 1.0, 2.4, 4.0, 4.04, "panel"); PLATE("qUnkS", "qUnk", "sign-unk", 3.5, QX + 5.6, 1.7, 4.05);

// ═════ 站 N：下一集（銅箔基板：銅箔／浸樹脂玻纖布／銅箔，疊成一疊）═════
const NX = 150;
LAY("nBase", [12, 0.6, NX, 0.3]); BOX("nPl", "nBase", NX - 6, NX + 6, 0, 0.6, -4, 4, "band");
LAY("nStack", [10, 0.8, NX, 1.0]);
for (let i = 0; i < 4; i++) { const y = R2(0.6 + i * 0.22); BOX(`nCuB${i}`, "nStack", NX - 5, NX + 5, y, R2(y + 0.03), -3.5, 3.5, "cu"); BOX(`nPp${i}`, "nStack", NX - 5, NX + 5, R2(y + 0.03), R2(y + 0.17), -3.5, 3.5, "core"); BOX(`nCuT${i}`, "nStack", NX - 5, NX + 5, R2(y + 0.17), R2(y + 0.2), -3.5, 3.5, "cu"); }
for (let i = 0; i < 4; i++) WEAVE(`nWv${i}`, "nStack", NX - 4.95, NX + 4.95, R2(0.6 + i * 0.22 + 0.1), 3.514, 0.2);
P({ id: "nTopBrush", layer: "nTop", shape: "box", size: [9.8, 0.004, 0.03], pos: [NX, 2.383, 0], at: Array.from({ length: 22 }, (_, i) => [0, 0, R2(-3.3 + i * 0.31)]), mat: "steel" });
WEAVE("nTopWv", "nTop", NX - 4.95, NX + 4.95, 2.02, 3.514, 0.2);
P({ id: "nFib", layer: "nStack", shape: "cyl", size: [0.035, 0.02], pos: [0, 0, 3.51], at: Array.from({ length: 160 }, (_, i) => [R2(NX - 4.9 + (i % 40) * 0.25), R2(0.7 + Math.floor(i / 40) * 0.22), 0]), mat: "fiber" });
LAY("nTop", [10, 0.6, NX, 2.0]);
BOX("nTopCuB", "nTop", NX - 5, NX + 5, 1.7, 1.73, -3.5, 3.5, "cu"); BOX("nTopPp", "nTop", NX - 5, NX + 5, 1.95, 2.09, -3.5, 3.5, "core"); BOX("nTopCuT", "nTop", NX - 5, NX + 5, 2.35, 2.38, -3.5, 3.5, "cuB");
P({ id: "nTopFib", layer: "nTop", shape: "box", size: [0.04, 0.005, 6.9], pos: [0, 2.095, 0], at: Array.from({ length: 30 }, (_, i) => [R2(NX - 4.8 + i * 0.33), 0, 0]), mat: "fiber" });
LAY("nSign", [3, 1.4, NX + 6.5, 1.4]); BOX("nSignBg", "nSign", NX + 4.9, NX + 8.1, 0.6, 2.2, 3.0, 3.04, "panel"); PLATE("nSignS", "nSign", "sign-ccl", 2.9, NX + 6.5, 1.4, 3.05);
VC("nSignP", "nSign", 0.06, 0, 0.6, "steel2", { x: NX + 6.5, z: 3.02 });

// ═════ 動作 ═════
actions.kSig = { type: "flow", _說明: "訊號（亮點）從晶片往下，沿載板裡的銅線經孔換層、到錫球再出去", layer: "kCore", path: K_SIG, n: 7, size: 0.07, shape: "dot", rate: 0.45, color: "powC", track: false, free: true };
actions.kSig2 = { type: "flow", layer: "kCore", path: K_SIG2, n: 7, size: 0.07, shape: "dot", rate: 0.4, phase: 0.3, color: "powC", track: false, free: true };
actions.wHeatGlow = { type: "pulse", _說明: "加熱台發熱條", parts: ["wHeat"], color: "heaterC", glow: 1.0, freq: 1.1, halo: 0.4 };
actions.wLampOn = { type: "pulse", parts: ["wLamp"], color: "lampR", glow: 1.0, freq: 2, halo: 0.3 };
actions.wHotUp = { type: "flow", _說明: "熱從台面往上傳到兩片芯板", layer: "wBase", path: [[WX - 6.8, WT + 0.02, 2.1], [WX - 6.8, WT + 1.2, 2.1]], n: 3, lanes: 14, laneDir: [1, 0, 0], laneGap: 1.0, size: 0.07, shape: "dot", rate: 0.7, phase: -3, color: "heatC", track: false, free: true, jitter: 0.04 };
actions.wHotUpG = { type: "flow", _說明: "玻璃那片同樣受熱", layer: "wBase", path: [[GX0 + 0.3, WT + 0.3, 2.1], [GX0 + 0.3, WT + 1.3, 2.1]], n: 3, lanes: 9, laneDir: [1, 0, 0], laneGap: 0.68, size: 0.07, shape: "dot", rate: 0.7, phase: -3, color: "heatC", track: false, free: true, jitter: 0.04 };
const wPiv = (x) => [x, WT, 0];
for (let k = 0; k < 4; k++) {
  const segL = [], segR = []; for (let j = k; j < 4; j++) { segL.push(...idsOf(`wRl${j}`)); segR.push(...idsOf(`wRr${j}`)); }
  actions[`wWarpL${k}`] = { type: "rotate", _說明: "樹脂芯板受熱，兩端往上連續彎（每個關節轉一點，示意，不標角度）", parts: segL, axis: [0, 0, 1], pivots: Object.fromEntries(segL.map((id) => [id, [R2(RX1 - k * SG), R2(WT + WS / 2), 0]])), angle: -2.2 };
  actions[`wWarpR${k}`] = { type: "rotate", parts: segR, axis: [0, 0, 1], pivots: Object.fromEntries(segR.map((id) => [id, [R2(RX2 + k * SG), R2(WT + WS / 2), 0]])), angle: 2.2 };
  actions[`wBigL${k}`] = { type: "rotate", _說明: "換大晶片，翹得更明顯", parts: segL, axis: [0, 0, 1], pivots: Object.fromEntries(segL.map((id) => [id, [R2(RX1 - k * SG), R2(WT + WS / 2), 0]])), angle: -1.8 };
  actions[`wBigR${k}`] = { type: "rotate", parts: segR, axis: [0, 0, 1], pivots: Object.fromEntries(segR.map((id) => [id, [R2(RX2 + k * SG), R2(WT + WS / 2), 0]])), angle: 1.8 };
}
actions.tScan = { type: "vibrate", _說明: "雷射頭沿 x 一排排掃過去（等速來回）", parts: [...idsOf("tHead"), ...idsOf("tHeadB"), ...idsOf("tHeadL"), ...idsOf("tBeamL")], axis: [1, 0, 0], amp: 3.6, freq: 1.0, tri: true };
actions.tLaserPulse = { type: "pulse", parts: ["tCone"], color: "laserC", glow: 1.2, freq: 8, halo: 0.6 };
actions.tEtchFlow = { type: "flow", _說明: "蝕刻液沿玻璃上下表面流過，把改質的地方吃成孔", layer: "tEtchL", path: [[TX - 4.6, TG1 + 0.2, 2.62], [TX + 4.6, TG1 + 0.2, 2.62]], n: 10, size: 0.07, shape: "dot", rate: 0.6, phase: -2, color: "etchC", track: false, free: true, jitter: 0.04 };
actions.tEtchBath = { type: "pulse", parts: ["tEtchT", "tEtchB"], color: "etchC", glow: 0.6, freq: 1.5, halo: 0.2 };
actions.tCuIons = { type: "flow", _說明: "電鍍：銅離子往孔裡落、把孔鍍滿", layer: "tCu", path: [[TXS[0], TG1 + 1.2, 1.4], [TXS[0], TG1 + 0.02, 1.4]], n: 2, lanes: 7, laneDir: [1, 0, 0], laneGap: 1.2, size: 0.08, shape: "dot", rate: 1.1, phase: -3, color: "ionC2", track: false, free: true, accel: true };
actions.tSig = { type: "flow", _說明: "鍍好後上下接通：訊號從上面的銅墊經孔到下面", layer: "tCu", path: [[TXS[3] - 1.2, TG1 + 0.04, 2.55], [TXS[3], TG1 + 0.04, 2.55], [TXS[3], TG0 - 0.04, 2.55], [TXS[3] + 1.2, TG0 - 0.04, 2.55]], n: 4, size: 0.07, shape: "dot", rate: 0.6, color: "powC", track: false, free: true };
actions.tChipsFly = { type: "flow", _說明: "機械鑽碰到玻璃：碎屑往外噴", layer: "tChips", path: [[CPX, CPY + 0.22, CPZ], [CPX + 0.6, CPY + 0.6, CPZ + 0.5], [CPX + 1.0, CPY + 0.2, CPZ + 0.9]], n: 3, lanes: 4, laneDir: [-1, 0, 0], laneGap: 0.4, size: 0.06, shape: "dot", rate: 1.3, phase: -2, color: "glassCoreC", track: false, free: true, accel: true, jitter: 0.1 };
actions.tDrillSpin = { type: "rotate", parts: ["tBit", ...Array.from({ length: 10 }, (_, i) => `tFlute${i}`)], axis: [0, 1, 0], pivot: [CPX, 0, CPZ], rps: 6, rampSpin: true };
actions.qHot = { type: "flow", _說明: "可靠性測試：冷熱循環（熱風、冷風輪流）", layer: "qTest", path: [[QX + 2.1, 2.5, 2.4], [QX + 3.9, 2.5, 2.4], [QX + 3.9, 1.3, 2.4], [QX + 2.1, 1.3, 2.4], [QX + 2.1, 2.5, 2.4]], n: 6, size: 0.08, shape: "dot", rate: 0.5, color: "heatC", track: false, free: true };
actions.qCold = { type: "flow", layer: "qTest", path: [[QX + 2.1, 2.5, 2.5], [QX + 3.9, 2.5, 2.5], [QX + 3.9, 1.3, 2.5], [QX + 2.1, 1.3, 2.5], [QX + 2.1, 2.5, 2.5]], n: 6, size: 0.08, shape: "dot", rate: 0.5, phase: 0.5, color: "chillC", track: false, free: true };
actions.qLampHot = { type: "pulse", parts: ["qLampH"], color: "lampR", glow: 1.0, freq: 1, halo: 0.3 };
actions.qLampCold = { type: "pulse", parts: ["qLampC"], color: "chillC", glow: 1.0, freq: 1, halo: 0.3 };

// 標註點
Object.assign(anchors, {
  kChip: A("kChip", [KX + 1.4, kci + 0.5, 1.5], 150, -110), kCore: A("kCore", [KX - 4.6, kc0 + 0.3, SW], -150, 100), kGlass: A("kGlass", [KX - 4.6, kc0 + 0.3, SW], -150, 100), kSig: A("kCore", [KX - 0.4, kc1 + 0.4, SW + 0.06], 160, 120),
  kT4: A("kT4", [KX + 4.6, R2(kc1 + 3 * BU + 0.16), 3.5], 150, -90),
  wRes: A("wRl3", [RX0 + 0.1, WT + WS, 2.0], -140, -110), wGlass: A("wGlass", [GX1 - 0.3, WT + WS, 2.0], 140, -110), wChipB: A("wChipB", [R2((RX1 + RX2) / 2), WT + 0.6, 1.3], -120, -120), wLines: A("wGlass", [GXc + 1.6, WT + WS + 0.03, 1.2], 150, -100), wHeat: A("wBase", [WX - 3.6, 1.12, 2.62], -140, 110),
  tMod: A("tMod1", [TXS[1], TG1, 0], -150, -110), tHole: A("tHole", [TXS[5], TG1, 1.4], 150, -110), tCu: A("tCu", [TXS[2], TG1 + 0.03, 1.4], -150, -110), tCrack: A("tCrack", [CPX, CPY + 0.22, CPZ + 0.3], 140, -100),
  cIntel: A("cIntel", [CX - 6.4, 3.3, -1.0], -100, -110), cSem: A("cSem", [CX, 3.3, -1.0], 100, -110), cAbs: A("cAbs", [CX + 6.4, 3.3, -1.0], 100, -110), cUni: A("cUni", [CX - 5.5, 2.1, 3.2], -120, 100),
  qCart: A("qCart", [QX - 7, 0.75, 0], -120, -110), qTest: A("qTest", [QX + 3.2, 3.2, 2.5], 130, -110), qP27: A("qP27", [QX, 3.5, -1.42], 120, -100),
  tGalvo: A("tHead", [TX + 0.7, 5.3, 0.6], 150, -90), tBarrel: A("tHeadB", [TX + 0.28, 4.0, 0.2], 150, 0), tLens: A("tHeadL", [TX + 0.3, 3.36, 0.2], 150, 80), tNo: A("tNo", [TXS[3], TG1 + 0.35, 2.56], -140, -110),
  tDrillH: A("tDrill", [CPX + 0.55, CPY + 2.6, CPZ + 0.45], 140, -100), kB2: A("kB2", [KX + 4.6, R2(ky0 + 2 * BU + 0.1), 3.5], 150, 90), kBalls: A("kBalls", [KX + 3.0, 0.6, 4.5], 150, 100), kT2: A("kT2", [KX + 4.6, R2(kc1 + BU + 0.1), 3.5], 150, -90),
  qGoal: A("qGoal", [QX + 1.9, 4.6, 0.02], 120, -100), qUnk: A("qUnk", [QX + 5.6, 1.7, 4.05], -120, -100),
  nStack: A("nTop", [NX + 3.5, 2.38, 2.0], 140, -110),
});

const model = {
  name: "示意 玻璃基板：AI 晶片封裝與載板爆炸剖面（樹脂芯板換成玻璃芯板）、加熱台上樹脂芯板翹與玻璃芯板平、玻璃穿孔（雷射改質、蝕刻開孔、鍍銅）與機械鑽玻璃會裂、英特爾／三星電機／Absolics／欣興／群創、量產時程路標、銅箔基板（示意，非特定廠牌／型號）",
  unit: "示意", size: { w: 40, h: 18, r: 0.6, t: 30 }, palette, materials, partNames: {},
  layers, parts, anchors, actions,
  pose: { yaw0: 0, yawIso: 0, drift: 0 }, camera: { stand: { d: 70, elev: 24, y: 4 } },
  fx: { dpr: 1, srcPx: 30, shadows: 0, fog: false, dust: false, vaporSprites: false, shimmer: false },
  info: { KX, WX, TX, CX, QX, NX, kci, kc0, kc1, kt, ky0, BU, WT, TG0, TG1, CPX },
};
fs.writeFileSync(path.join(HERE, "model.json"), JSON.stringify(model, null, 1) + "\n");
console.log(`✔ model.json：${parts.length} 個零件、${parts.reduce((a, p) => a + Math.max(1, (p.at?.length ?? 0)), 0)} 個實體（含複製）、${layers.length} 層`);

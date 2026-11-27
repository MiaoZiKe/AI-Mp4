// node videos/tech-mature/gen-model.mjs → 寫 videos/tech-mature/model.json
// 2026/11/28 tech-mature（中游補充篇 M1：成熟與特殊製程代工）。構造與物理照 physics-spec.md、模組清單與爆炸步驟照 visual-spec.md。
// 單位：示意，地板 y＝0，x 向右、z 向觀眾。站點（相隔 40，換幕硬切）：
//   K 手機主機板（先進 SoC＋一堆成熟製程晶片：電源管理、功率元件、驅動、射頻）（x 0）｜P 功率 MOSFET（TO-247 封裝＋散熱片＋垂直溝槽剖面爆炸）（x 40）｜D 螢幕＋驅動 IC（玻璃上晶片＋軟板）＋8 吋／12 吋晶圓（x 80）
//   F 台灣三家代工廠（聯電、世界先進、力積電）（x 120）｜C 中國擴產：新廠一座座冒出＋價格柱下沉（x 160）｜T 轉向：電動車逆變器＋AI 伺服器電源（x 200）｜N 下一集：記憶體模組（x 240）
//   示意，非特定廠牌／型號；不標尺寸、電壓、良率。
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
const HERE = path.dirname(new URL(import.meta.url).pathname);

const R2 = (x) => Math.round(x * 1000) / 1000;
const D2R = Math.PI / 180;
const pol = (aDeg, r) => [R2(r * Math.cos(aDeg * D2R)), R2(r * Math.sin(aDeg * D2R))];
let seed = 20261128;
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


// ── 本片加的顏色與材質 ──
Object.assign(palette, { pcbG: "#2F6E4F", pcbG2: "#255C41", cuTr: "#C88A4A", padSn: "#D9DDE3", socSub: "#3B4A3F", socLid: "#AEB7C6", chipBk: "#2B2E35", chipBk2: "#3A3E47", capTan: "#C9A46A",
  capEnd: "#D7DBE1", indGr: "#5B6270", indTop: "#8C939E", shieldC: "#C4CBD5", fpcC: "#E0A030", fpcCu: "#B8732F", battC2: "#E8EDF3",
  advC: "#2F7FE0", matC: "#F08A24", n_plus: "#3E7BD6", n_drift: "#9EC1EA", p_body: "#E7A33C", oxC: "#F2F4F7", polyC: "#D2483A", alC: "#B9C1CC", drainC: "#8E97A6",
  eDot: "#FFD34D", pxR: "#E5484D", pxG: "#2FBF71", pxB: "#3B82F6", pxOff: "#1C2230", glassP: "#2A3346", bezel: "#141821", bump: "#E0C060",
  waferC: "#A7B3C8", waferHi: "#C9D3E2", dieLn: "#6E7C95", notchC: "#1C2230", standC: "#4A5468", priceC: "#E5484D", priceTag: "#FFFFFF",
  carC: "#E8EDF3", carD: "#3B4A5E", tireC: "#1E2228", rimC: "#B9C1CC", invC: "#5A6B84", rackC: "#2A303B", sledC: "#3E4757", psuC: "#6A7688", fanC: "#1F2329", ledB: "#38B6FF", ledGg: "#2FBF71",
  dimmC: "#2E6B47", dramC: "#22262D", goldF: "#D6B25E", awnR: "#E5484D", awnW: "#FFFFFF" });
Object.assign(materials, {
  pcbB: M("std", "pcbG", { rough: 0.55, metal: 0.05, env: 0.25 }), pcbB2: M("std", "pcbG2", { rough: 0.6, metal: 0.05 }), cuTr: M("std", "cuTr", { rough: 0.3, metal: 0.85, env: 0.7 }),
  padSn: M("std", "padSn", { rough: 0.25, metal: 0.9, env: 0.8 }), socSub: M("std", "socSub", { rough: 0.5, metal: 0.1 }), socLid: M("std", "socLid", { rough: 0.3, metal: 0.8, env: 0.7, tex: "brushed", texScale: 2 }),
  chipBk: M("std", "chipBk", { rough: 0.55, metal: 0.1, env: 0.2 }), chipBk2: M("std", "chipBk2", { rough: 0.5, metal: 0.1, env: 0.2 }), capTan: M("std", "capTan", { rough: 0.5, metal: 0 }),
  capEnd: M("std", "capEnd", { rough: 0.25, metal: 0.9, env: 0.8 }), indGr: M("std", "indGr", { rough: 0.5, metal: 0.3 }), indTop: M("std", "indTop", { rough: 0.4, metal: 0.4, env: 0.4 }),
  shield: M("std", "shieldC", { rough: 0.3, metal: 0.85, env: 0.7, tex: "brushed", texScale: 2 }), fpc: M("std", "fpcC", { rough: 0.4, metal: 0.1, env: 0.3 }), fpcCu: M("std", "fpcCu", { rough: 0.3, metal: 0.8, env: 0.6 }),
  batt2: M("std", "battC2", { rough: 0.45, metal: 0.3, env: 0.4 }),
  nplus: M("std", "n_plus", { rough: 0.5, metal: 0.1 }), ndrift: M("std", "n_drift", { rough: 0.55, metal: 0.05 }), pbody: M("std", "p_body", { rough: 0.5, metal: 0.05 }), ox: M("std", "oxC", { rough: 0.4, metal: 0 }),
  poly: M("std", "polyC", { rough: 0.45, metal: 0.1 }), al: M("std", "alC", { rough: 0.3, metal: 0.85, env: 0.7 }), drainM: M("std", "drainC", { rough: 0.35, metal: 0.8, env: 0.6 }),
  eDot: glowM("eDot", 0.95, 1.0), advGlow: glowM("advC", 0.9, 0.9), matGlow: glowM("matC", 0.9, 0.9),
  pxR: M("std", "pxR", { emissive: "pxR", ei: 0.9, rough: 0.6, metal: 0 }), pxG: M("std", "pxG", { emissive: "pxG", ei: 0.9, rough: 0.6, metal: 0 }), pxB: M("std", "pxB", { emissive: "pxB", ei: 0.9, rough: 0.6, metal: 0 }),
  pxOff: M("std", "pxOff", { rough: 0.5, metal: 0.1 }), glassP: M("std", "glassP", { rough: 0.1, metal: 0.4, env: 0.9 }), bezel: M("std", "bezel", { rough: 0.4, metal: 0.3 }), bump: M("std", "bump", { rough: 0.25, metal: 0.95, env: 0.9 }),
  wafer: M("std", "waferC", { rough: 0.15, metal: 0.75, env: 0.95 }), waferHi: M("std", "waferHi", { rough: 0.12, metal: 0.7, env: 1 }), dieLn: M("std", "dieLn", { rough: 0.3, metal: 0.6 }), notch: M("std", "notchC", { rough: 0.5, metal: 0 }),
  stand: M("std", "standC", { rough: 0.45, metal: 0.5, env: 0.4 }), price: M("std", "priceC", { rough: 0.45, metal: 0.1, env: 0.3 }), priceTag: M("std", "priceTag", { rough: 0.5, metal: 0 }),
  car: M("std", "carC", { rough: 0.25, metal: 0.4, env: 0.8 }), carD: M("std", "carD", { rough: 0.2, metal: 0.4, env: 0.9 }), tire: M("std", "tireC", { rough: 0.9, metal: 0 }), rim: M("std", "rimC", { rough: 0.3, metal: 0.9, env: 0.7 }),
  inv: M("std", "invC", { rough: 0.4, metal: 0.6, env: 0.5, tex: "brushed", texScale: 2 }), rack: M("std", "rackC", { rough: 0.45, metal: 0.5, env: 0.3 }), sled: M("std", "sledC", { rough: 0.4, metal: 0.5, env: 0.4 }),
  psu: M("std", "psuC", { rough: 0.4, metal: 0.6, env: 0.5, tex: "brushed", texScale: 2 }), fan: M("std", "fanC", { rough: 0.6, metal: 0.2 }),
  ledB: M("std", "ledB", { emissive: "ledB", ei: 1.0, rough: 0.4, metal: 0 }), ledGg: M("std", "ledGg", { emissive: "ledGg", ei: 1.0, rough: 0.4, metal: 0 }),
  dimm: M("std", "dimmC", { rough: 0.5, metal: 0.05, env: 0.3 }), dram: M("std", "dramC", { rough: 0.5, metal: 0.1, env: 0.3 }), goldF: M("std", "goldF", { rough: 0.25, metal: 0.95, env: 0.9 }),
  awnR: M("std", "awnR", { rough: 0.6, metal: 0 }), awnW: M("std", "awnW", { rough: 0.6, metal: 0 }), powGlow: glowM("powC", 0.95, 1.0), sigDot2: glowM("ledB", 0.95, 1.0),
});

// ── 貼圖：國旗、公司 LOGO（Commons 原檔）；力積電抓不到原檔 → 白底文字名牌 ──
const TEX = ["flag:TW", "flag:CN", "logo:umc", "logo:vis", "logo:psmc", "text:cnfab=中國新廠|成熟製程", "text:mem=記憶體|下一集"];
{ const r = spawnSync("node", [path.join(HERE, "..", "..", "scripts", "three", "make-brand-tex.mjs"), "tech-mature", ...TEX], { encoding: "utf8" }); if (r.status !== 0) { console.error(r.stdout, r.stderr); process.exit(1); } }
const SIGN = JSON.parse(fs.readFileSync(path.join(HERE, "..", "..", "public", "tex", "brand", "meta.json"), "utf8"));
const TEXMAT = (name) => { materials[`t_${name}`] = { kind: "unlit", color: "#FFFFFF", img: `tex/brand/${name}.png` }; return `t_${name}`; };
const PLATE = (id, layer, name, w, x, y, z, o = {}) => { const s = SIGN[name]; if (!s) throw new Error(`缺貼圖 ${name}`); return P({ id, layer, shape: "plane", size: [w, R2(w / s.aspect)], pos: [x, y, z], uv01: true, shadow: false, mat: TEXMAT(name), ...o }); };
const FLAGPOLE = (id, layer, code, x, z, h = 6, fw = 1.5) => {
  VC(`${id}Base`, layer, 0.3, 0, 0.25, "dark", { x, z }); VC(`${id}Pole`, layer, 0.05, 0.25, h, "steel2", { x, z }); SPH(`${id}Ball`, layer, 0.1, x, h + 0.05, z, "gold");
  const s = SIGN[`flag-${code}`], fh = R2(fw / s.aspect); PLATE(`${id}Flag`, layer, `flag-${code}`, fw, R2(x + fw / 2 + 0.06), R2(h - fh / 2 - 0.1), z);
};

// ═════ 地板 ═════
LAY("floor", [320, 2, 120, 0], true);
P({ id: "floor", layer: "floor", shape: "slab", size: [340, 0.5, 60], r: 0.2, pos: [120, -0.25, 0], mat: "floor" });

// ═════ 站 K：手機主機板（中間大顆先進 SoC；周圍電源管理 IC＋電感＋電容、功率 MOSFET、螢幕排線座、射頻屏蔽罩、記憶體）═════
const KX = 0, KT = 0.5;   // 板面高度
LAY("kPcb", [16, 0.6, KX, 0.25]);
BOX("kBoard", "kPcb", KX - 8, KX + 8, 0.2, KT, -4.5, 4.5, "pcbB", { bevel: 0.04 });
BOX("kBoardB", "kPcb", KX - 8.02, KX + 8.02, 0.12, 0.2, -4.52, 4.52, "pcbB2");
// 銅走線：橫向、縱向兩組（細長條＋轉角）、過孔（小圓）、固定孔（鍍錫環）
{ const h = [], v = [], vias = [];
  for (let i = 0; i < 14; i++) { const z = R2(-4.0 + i * 0.6); if (Math.abs(z) < 1.9) continue; h.push([R2(KX - 0.8 + (i % 3) * 0.6), R2(KT + 0.006), z]); }
  for (let i = 0; i < 18; i++) { const x = R2(KX - 7.4 + i * 0.85); if (Math.abs(x - KX) < 2.2) continue; v.push([x, R2(KT + 0.006), R2((i % 2 ? 1 : -1) * 2.6)]); }
  for (let i = 0; i < 60; i++) vias.push([R2(KX - 7.5 + rnd() * 15), R2(KT + 0.004), R2(-4.2 + rnd() * 8.4)]);
  P({ id: "kTrH", layer: "kPcb", shape: "box", size: [5.6, 0.01, 0.07], pos: [0, 0, 0], at: h, mat: "cuTr" });
  P({ id: "kTrV", layer: "kPcb", shape: "box", size: [0.07, 0.01, 2.6], pos: [0, 0, 0], at: v, mat: "cuTr" });
  P({ id: "kVia", layer: "kPcb", shape: "cyl", size: [0.07, 0.012], rot: V, pos: [0, 0, 0], at: vias, mat: "padSn" });
  P({ id: "kHole", layer: "kPcb", shape: "tube", size: [0.32, 0.18, 0.04], rot: V, pos: [0, R2(KT + 0.01), 0], at: [[KX - 7.5, 0, -4.0], [KX + 7.5, 0, -4.0], [KX - 7.5, 0, 4.0], [KX + 7.5, 0, 4.0]], mat: "padSn" });
  P({ id: "kSilk", layer: "kPcb", shape: "box", size: [0.9, 0.006, 0.04], pos: [0, R2(KT + 0.005), 0], at: Array.from({ length: 10 }, (_, i) => [R2(KX - 7 + i * 1.55), 0, 4.25]), mat: "frost" }); }
// 先進 SoC（3 奈米這類）：封裝基板＋金屬蓋＋周圍去耦電容
LAY("kSoc", [3.6, 0.6, KX, KT + 0.3]);
BOX("kSocSub", "kSoc", KX - 1.8, KX + 1.8, KT, KT + 0.12, -1.8, 1.8, "socSub", { bevel: 0.03 });
BOX("kSocLid", "kSoc", KX - 1.35, KX + 1.35, KT + 0.12, KT + 0.3, -1.35, 1.35, "socLid", { bevel: 0.05 });
P({ id: "kSocBall", layer: "kSoc", shape: "sphere", size: [0.06], pos: [0, R2(KT - 0.01), 0], at: Array.from({ length: 24 }, (_, i) => [R2(KX - 1.72 + i * 0.15), 0, 1.86]), mat: "padSn" });
P({ id: "kSocCap", layer: "kSoc", shape: "box", size: [0.16, 0.08, 0.08], pos: [0, R2(KT + 0.16), 0], at: Array.from({ length: 10 }, (_, i) => [R2(KX - 1.6 + (i % 5) * 0.8), 0, i < 5 ? -1.6 : 1.6]), mat: "capTan" });
// 記憶體（SoC 左邊）
LAY("kMem", [2.2, 0.4, KX - 3.4, KT + 0.2]);
BOX("kMemB", "kMem", KX - 4.4, KX - 2.4, KT, KT + 0.22, -1.2, 1.2, "chipBk", { bevel: 0.03 });
P({ id: "kMemDot", layer: "kMem", shape: "cyl", size: [0.08, 0.01], rot: V, pos: [KX - 4.2, R2(KT + 0.225), -1.0], mat: "dieLn" });
// 電源管理 IC（QFN：四周銲墊）＋旁邊 4 顆電感、一排電容（配電盤）
const PX = KX + 4.2, PZ = -2.3;
LAY("kPmic", [3.6, 0.5, PX + 0.6, KT + 0.25]);
BOX("kPmicB", "kPmic", PX - 0.8, PX + 0.8, KT, KT + 0.16, PZ - 0.8, PZ + 0.8, "chipBk2", { bevel: 0.02 });
P({ id: "kPmicPin", layer: "kPmic", shape: "box", size: [0.1, 0.03, 0.14], pos: [0, R2(KT + 0.015), 0], at: [...Array.from({ length: 8 }, (_, i) => [R2(PX - 0.63 + i * 0.18), 0, R2(PZ - 0.86)]), ...Array.from({ length: 8 }, (_, i) => [R2(PX - 0.63 + i * 0.18), 0, R2(PZ + 0.86)])], mat: "padSn" });
P({ id: "kPmicPinS", layer: "kPmic", shape: "box", size: [0.14, 0.03, 0.1], pos: [0, R2(KT + 0.015), 0], at: [...Array.from({ length: 8 }, (_, i) => [R2(PX - 0.86), 0, R2(PZ - 0.63 + i * 0.18)]), ...Array.from({ length: 8 }, (_, i) => [R2(PX + 0.86), 0, R2(PZ - 0.63 + i * 0.18)])], mat: "padSn" });
P({ id: "kPmicDot", layer: "kPmic", shape: "cyl", size: [0.07, 0.01], rot: V, pos: [PX - 0.6, R2(KT + 0.165), PZ - 0.6], mat: "dieLn" });
P({ id: "kInd", layer: "kPmic", shape: "box", size: [0.55, 0.32, 0.55], pos: [0, R2(KT + 0.16), 0], at: [[PX + 1.7, 0, PZ - 0.75], [PX + 1.7, 0, PZ + 0.0], [PX + 1.7, 0, PZ + 0.75], [PX + 1.7, 0, PZ + 1.5]], mat: "indGr", bevel: 0.05 });
P({ id: "kIndT", layer: "kPmic", shape: "cyl", size: [0.2, 0.02], rot: V, pos: [0, R2(KT + 0.33), 0], at: [[PX + 1.7, 0, PZ - 0.75], [PX + 1.7, 0, PZ + 0.0], [PX + 1.7, 0, PZ + 0.75], [PX + 1.7, 0, PZ + 1.5]], mat: "indTop" });
P({ id: "kCap", layer: "kPmic", shape: "box", size: [0.26, 0.14, 0.14], pos: [0, R2(KT + 0.07), 0], at: Array.from({ length: 6 }, (_, i) => [R2(PX - 0.7 + i * 0.3), 0, R2(PZ + 1.25)]), mat: "capTan" });
P({ id: "kCapE", layer: "kPmic", shape: "box", size: [0.05, 0.145, 0.145], pos: [0, R2(KT + 0.072), 0], at: Array.from({ length: 12 }, (_, i) => [R2(PX - 0.7 + Math.floor(i / 2) * 0.3 + (i % 2 ? 0.11 : -0.11)), 0, R2(PZ + 1.25)]), mat: "capEnd" });
// 功率 MOSFET（電池接頭旁，兩顆小封裝，三支腳）＋電池接頭
const MX = KX - 6.2, MZ = -2.6;
LAY("kMos", [3.2, 0.5, MX + 0.6, KT + 0.25]);
P({ id: "kMosB", layer: "kMos", shape: "box", size: [0.7, 0.2, 0.6], pos: [0, R2(KT + 0.1), 0], at: [[MX, 0, MZ], [MX + 1.0, 0, MZ]], mat: "chipBk", bevel: 0.02 });
P({ id: "kMosTab", layer: "kMos", shape: "box", size: [0.5, 0.03, 0.2], pos: [0, R2(KT + 0.015), 0], at: [[MX, 0, MZ - 0.38], [MX + 1.0, 0, MZ - 0.38]], mat: "padSn" });
P({ id: "kMosLeg", layer: "kMos", shape: "box", size: [0.08, 0.03, 0.22], pos: [0, R2(KT + 0.015), 0], at: [-0.2, 0, 0.2].flatMap((d) => [[R2(MX + d), 0, MZ + 0.4], [R2(MX + 1.0 + d), 0, MZ + 0.4]]), mat: "padSn" });
BOX("kBatt", "kMos", MX - 0.9, MX + 1.9, KT, KT + 0.3, MZ - 2.0, MZ - 1.2, "batt2", { bevel: 0.03 });
P({ id: "kBattPin", layer: "kMos", shape: "box", size: [0.12, 0.05, 0.5], pos: [0, R2(KT + 0.3), 0], at: Array.from({ length: 6 }, (_, i) => [R2(MX - 0.6 + i * 0.45), 0, MZ - 1.6]), mat: "goldF" });
// 螢幕排線座（驅動晶片在螢幕那頭，這裡是接頭）＋軟板伸出板外
const DCX = KX + 5.4, DCZ = 2.8;
LAY("kDisp", [4, 0.4, DCX, KT + 0.2]);
BOX("kConn", "kDisp", DCX - 1.2, DCX + 1.2, KT, KT + 0.18, DCZ - 0.35, DCZ + 0.35, "chipBk2", { bevel: 0.02 });
P({ id: "kConnP", layer: "kDisp", shape: "box", size: [0.05, 0.02, 0.2], pos: [0, R2(KT + 0.19), DCZ], at: Array.from({ length: 20 }, (_, i) => [R2(DCX - 1.05 + i * 0.11), 0, 0]), mat: "goldF" });
BOX("kFpc", "kDisp", DCX - 1.0, DCX + 1.0, KT + 0.18, KT + 0.2, DCZ + 0.1, DCZ + 2.2, "fpc");
P({ id: "kFpcTr", layer: "kDisp", shape: "box", size: [0.03, 0.006, 2.0], pos: [0, R2(KT + 0.205), R2(DCZ + 1.15)], at: Array.from({ length: 12 }, (_, i) => [R2(DCX - 0.85 + i * 0.155), 0, 0]), mat: "fpcCu" });
// 射頻屏蔽罩（金屬罩、通風孔）、其他小晶片
LAY("kRf", [3, 0.4, KX - 4.2, KT + 0.2]);
BOX("kShield", "kRf", KX - 6.0, KX - 2.6, KT, KT + 0.22, 1.8, 3.8, "shield", { bevel: 0.03 });
P({ id: "kShieldH", layer: "kRf", shape: "cyl", size: [0.05, 0.01], rot: V, pos: [0, R2(KT + 0.225), 0], at: Array.from({ length: 24 }, (_, i) => [R2(KX - 5.7 + (i % 8) * 0.4), 0, R2(2.2 + Math.floor(i / 8) * 0.6)]), mat: "dark" });
P({ id: "kSmall", layer: "kRf", shape: "box", size: [0.5, 0.1, 0.5], pos: [0, R2(KT + 0.05), 0], at: [[KX + 2.4, 0, 2.6], [KX + 2.4, 0, 3.6], [KX - 1.4, 0, 3.4], [KX + 1.0, 0, -3.6], [KX - 1.8, 0, -3.4]], mat: "chipBk", bevel: 0.02 });
// 電源走線（寬銅箔）：電池接頭→MOSFET→電源管理 IC→電感→SoC／記憶體／排線座（配電光點沿這幾條走）
{ const W = 0.16, y = R2(KT + 0.008), seg = (id, a, b) => { const [x0, z0] = a, [x1, z1] = b; P({ id, layer: "kPcb", shape: "box", size: [R2(Math.abs(x1 - x0) + W), 0.012, R2(Math.abs(z1 - z0) + W)], pos: [R2((x0 + x1) / 2), y, R2((z0 + z1) / 2)], mat: "cuTr" }); };
  const PW = [[[MX + 0.5, MZ - 1.6], [MX + 0.5, MZ]], [[MX + 0.5, MZ], [PX - 0.9, MZ]], [[PX - 0.9, MZ], [PX - 0.9, PZ]], [[PX + 1.7, PZ + 0.0], [PX + 1.7, PZ + 2.2]], [[PX + 1.7, PZ + 2.2], [KX + 1.6, PZ + 2.2]], [[KX + 1.6, PZ + 2.2], [KX + 1.6, 0]],
    [[PX + 1.7, PZ - 0.75], [PX + 1.7, -3.6]], [[PX + 1.7, -3.6], [KX - 3.4, -3.6]], [[KX - 3.4, -3.6], [KX - 3.4, -1.3]], [[PX + 1.7, PZ + 1.5], [PX + 1.7, DCZ - 0.4]], [[PX + 1.7, DCZ - 0.4], [DCX, DCZ - 0.4]]];
  PW.forEach((q, i) => seg(`kPw${i}`, q[0], q[1])); }
// 發光框（念「三奈米」先進 SoC 藍框；念「成熟製程」其他晶片橘框）
LAY("kGlow", [16, 0.4, KX, KT + 0.2]);
P({ id: "kAdvRing", layer: "kGlow", shape: "tube", size: [2.15, 2.0, 0.05], rot: V, pos: [KX, R2(KT + 0.34), 0], mat: "advGlow" });
P({ id: "kMatRing", layer: "kGlow", shape: "tube", size: [0.95, 0.85, 0.05], rot: V, pos: [0, R2(KT + 0.36), 0], at: [[PX + 0.5, 0, PZ + 0.2], [MX + 0.5, 0, MZ], [KX - 4.3, 0, 2.8]], mat: "matGlow" });

// ═════ 站 P：功率 MOSFET（左：TO-247 封裝鎖在散熱片上；右：垂直溝槽 MOSFET 剖面，可爆炸分層）═════
const PPX = 40;
LAY("pHs", [5, 3, PPX - 3.1, 1.5]);
BOX("pHsBase", "pHs", PPX - 5.6, PPX - 0.6, 0, 0.5, -2.5, 1.5, "alu");
P({ id: "pHsFin", layer: "pHs", shape: "box", size: [0.14, 2.4, 4.0], pos: [0, 1.7, -0.5], at: Array.from({ length: 11 }, (_, i) => [R2(PPX - 5.45 + i * 0.47), 0, 0]), mat: "alu" });
LAY("pPkg", [3, 4, PPX - 3.1, 3.0]);
BOX("pPkgBody", "pPkg", PPX - 4.3, PPX - 1.9, 2.9, 3.25, 0.2, 3.2, "chipBk", { bevel: 0.05 });
BOX("pPkgTab", "pPkg", PPX - 4.3, PPX - 1.9, 2.9, 3.0, -0.9, 0.2, "steel2");
P({ id: "pPkgHole", layer: "pPkg", shape: "tube", size: [0.3, 0.16, 0.12], rot: V, pos: [PPX - 3.1, 2.95, -0.35], mat: "dark" });
P({ id: "pPkgScrew", layer: "pPkg", shape: "cyl", size: [0.2, 0.3], rot: V, pos: [PPX - 3.1, 3.1, -0.35], mat: "steel" });
P({ id: "pLeg", layer: "pPkg", shape: "box", size: [0.16, 0.08, 1.8], pos: [0, 3.0, 4.1], at: [[PPX - 3.85, 0, 0], [PPX - 3.1, 0, 0], [PPX - 2.35, 0, 0]], mat: "needle" });
P({ id: "pLegBend", layer: "pPkg", shape: "box", size: [0.16, 1.4, 0.08], pos: [0, 2.3, 5.0], at: [[PPX - 3.85, 0, 0], [PPX - 3.1, 0, 0], [PPX - 2.35, 0, 0]], mat: "needle" });
P({ id: "pPkgMark", layer: "pPkg", shape: "cyl", size: [0.12, 0.01], rot: V, pos: [PPX - 3.9, 3.26, 2.8], mat: "dieLn" });
// 腳的名牌：G（閘極＝水龍頭把手）、D（汲極）、S（源極）—— 用顏色帽區分
P({ id: "pLegG", layer: "pPkg", shape: "box", size: [0.24, 0.24, 0.24], pos: [PPX - 3.85, 1.55, 5.0], mat: "poly" });
P({ id: "pLegD", layer: "pPkg", shape: "box", size: [0.24, 0.24, 0.24], pos: [PPX - 3.1, 1.55, 5.0], mat: "drainM" });
P({ id: "pLegS", layer: "pPkg", shape: "box", size: [0.24, 0.24, 0.24], pos: [PPX - 2.35, 1.55, 5.0], mat: "al" });
// 剖面（垂直溝槽 MOSFET，示意不按比例）：由下到上 汲極金屬｜N+ 基板｜N− 漂移層｜P 本體｜N+ 源極＋溝槽閘極（氧化層包多晶矽）｜源極金屬
const CX0 = PPX + 0.6, CX1 = PPX + 7.6, CZ0 = -1.5, CZ1 = 1.5;
const PL = [["pDrain", 0.2, 0.5, "drainM"], ["pSub", 0.5, 1.4, "nplus"], ["pDrift", 1.4, 3.6, "ndrift"], ["pBody", 3.6, 4.3, "pbody"], ["pSrcN", 4.3, 4.6, "nplus"], ["pMetal", 4.75, 5.15, "al"]];
for (const [id, y0, y1, m] of PL) { LAY(id, [7, R2(y1 - y0), R2((CX0 + CX1) / 2), R2((y0 + y1) / 2)]); BOX(`${id}B`, id, CX0, CX1, y0, y1, CZ0, CZ1, m); }
// 溝槽閘極：三道溝（氧化層外殼＋多晶矽芯），從上面往下切穿 P 本體到漂移層；源極金屬下面的層間氧化帽
LAY("pGate", [7, 1.6, R2((CX0 + CX1) / 2), 3.9]);
const GXS = [CX0 + 1.4, CX0 + 3.5, CX0 + 5.6];
P({ id: "pGateOx", layer: "pGate", shape: "box", size: [0.56, 1.5, 3.0], pos: [0, 3.85, 0], at: GXS.map((x) => [R2(x), 0, 0]), mat: "ox" });
P({ id: "pGatePoly", layer: "pGate", shape: "box", size: [0.36, 1.35, 3.02], pos: [0, 3.8, 0], at: GXS.map((x) => [R2(x), 0, 0]), mat: "poly" });
P({ id: "pIld", layer: "pGate", shape: "box", size: [0.7, 0.15, 3.0], pos: [0, 4.675, 0], at: GXS.map((x) => [R2(x), 0, 0]), mat: "ox" });
P({ id: "pGateBus", layer: "pGate", shape: "box", size: [4.6, 0.12, 0.25], pos: [R2(CX0 + 3.5), 4.6, -1.62], mat: "poly" });
// 源極金屬上的打線（鋁線兩條）
LAY("pWire", [5, 1.2, R2((CX0 + CX1) / 2), 5.6]);
PIPE("pWireA", "pWire", [[CX0 + 2.0, 5.15, 0], [CX0 + 2.0, 5.9, 0], [CX0 + 0.4, 5.9, 0]], 0.06, "al", { jmat: "al" });
PIPE("pWireB", "pWire", [[CX0 + 4.6, 5.15, 0.6], [CX0 + 4.6, 6.0, 0.6], [CX0 + 0.4, 6.0, 0.6]], 0.06, "al", { jmat: "al" });

// ═════ 站 D：螢幕（玻璃面板＋像素格）＋驅動 IC（玻璃上晶片 COG，凸塊）＋軟板；右前方 8 吋與 12 吋晶圓 ═════
const DX = 80, DPY = 0.6, PXN = 12, PYN = 9, PS = 0.62;
LAY("dPanel", [10, 1, DX - 1, DPY]);
BOX("dBezel", "dPanel", DX - 5.2, DX + 3.2, 0.12, DPY, -4.0, 3.8, "bezel", { bevel: 0.08 });
BOX("dGlass", "dPanel", DX - 5.0, DX + 3.0, DPY, DPY + 0.08, -3.8, 2.4, "glassP");
// 像素：每格 R G B 三條；每一列一個零件（逐列掃描點亮），未點亮的底色在下面
P({ id: "dPxOff", layer: "dPanel", shape: "box", size: [0.5, 0.01, 0.5], pos: [0, R2(DPY + 0.085), 0], at: Array.from({ length: PXN * PYN }, (_, i) => [R2(DX - 4.66 + (i % PXN) * PS), 0, R2(-3.45 + Math.floor(i / PXN) * PS)]), mat: "pxOff" });
const ROWS = [];
for (let r = 0; r < PYN; r++) { const id = `dRow${r}`; LAY(id, [8, 0.1, DX - 1, DPY + 0.1]); ROWS.push(id);
  ["pxR", "pxG", "pxB"].forEach((m, c) => P({ id: `${id}${c}`, layer: id, shape: "box", size: [0.14, 0.02, 0.48], pos: [0, R2(DPY + 0.095), R2(-3.45 + r * PS)], at: Array.from({ length: PXN }, (_, i) => [R2(DX - 4.84 + i * PS + c * 0.18), 0, 0]), mat: m })); }
// 驅動 IC：細長晶片貼在玻璃下緣（凸塊＝金色小方點），一排輸出線往上接到每一行像素
LAY("dDdi", [6, 0.4, DX - 1, DPY + 0.2]);
BOX("dDdiB", "dDdi", DX - 3.6, DX + 1.6, DPY + 0.08, DPY + 0.24, 2.75, 3.15, "chipBk", { bevel: 0.02 });
P({ id: "dDdiBump", layer: "dDdi", shape: "box", size: [0.06, 0.03, 0.08], pos: [0, R2(DPY + 0.08), 2.7], at: Array.from({ length: 36 }, (_, i) => [R2(DX - 3.5 + i * 0.143), 0, 0]), mat: "bump" });
P({ id: "dFan", layer: "dDdi", shape: "box", size: [0.03, 0.006, 0.36], pos: [0, R2(DPY + 0.085), 2.55], at: Array.from({ length: PXN }, (_, i) => [R2(DX - 4.66 + i * PS), 0, 0]), mat: "fpcCu" });
BOX("dFpcB", "dDdi", DX - 2.4, DX + 0.4, DPY - 0.02, DPY, 3.3, 5.6, "fpc");
P({ id: "dFpcTr", layer: "dDdi", shape: "box", size: [0.03, 0.006, 2.2], pos: [0, R2(DPY + 0.004), 4.45], at: Array.from({ length: 14 }, (_, i) => [R2(DX - 2.2 + i * 0.18), 0, 0]), mat: "fpcCu" });
// 晶圓：8 吋（200 mm）與 12 吋（300 mm）並排在晶圓架上，表面晶粒格、缺口（notch）、邊緣倒角
const WAF = (id, cx, cz, r) => { LAY(id, [R2(2 * r + 0.4), 1.2, cx, 0.8]);
  VC(`${id}Stand`, id, R2(r * 0.4), 0, 0.5, "stand", { x: cx, z: cz }); VC(`${id}Ring`, id, R2(r + 0.12), 0.5, 0.62, "stand", { x: cx, z: cz });
  VC(`${id}W`, id, r, 0.62, 0.7, "wafer", { x: cx, z: cz }); VC(`${id}Edge`, id, R2(r - 0.05), 0.7, 0.705, "waferHi", { x: cx, z: cz });
  const st = 0.36, rr = r - 0.12;
  for (let i = -12; i <= 12; i++) { const d = i * st; if (Math.abs(d) >= rr - 0.05) continue; const h = R2(2 * Math.sqrt(rr * rr - d * d));
    P({ id: `${id}Gx${i + 12}`, layer: id, shape: "box", size: [0.015, 0.006, h], pos: [R2(cx + d), 0.708, cz], mat: "dieLn" });
    P({ id: `${id}Gz${i + 12}`, layer: id, shape: "box", size: [h, 0.006, 0.015], pos: [cx, 0.708, R2(cz + d)], mat: "dieLn" }); }
  BOX(`${id}Notch`, id, cx - 0.16, cx + 0.16, 0.62, 0.712, R2(cz + r - 0.22), R2(cz + r + 0.01), "notch"); };
WAF("dW8", DX + 7.0, 0.6, 2.0); WAF("dW12", DX + 12.6, 0.6, 3.0);

// ═════ 站 F：台灣三家代工廠（聯電、世界先進、力積電）＋國旗；各有屋頂設備、管線、窗格、裝卸區 ═════
const FX = 120;
const FAB = (id, x, z, w, d, h, sign, signW, acc) => { LAY(id, [w + 1, h + 1.5, x, h / 2]);
  BOX(`${id}B`, id, x - w / 2, x + w / 2, 0.12, h, z - d / 2, z + d / 2, "panel", { bevel: 0.04 });
  BOX(`${id}Base`, id, x - w / 2 - 0.05, x + w / 2 + 0.05, 0.12, 0.5, z - d / 2 - 0.05, z + d / 2 + 0.05, "panel2");
  BOX(`${id}Band`, id, x - w / 2 - 0.03, x + w / 2 + 0.03, R2(h - 0.45), R2(h - 0.15), z - d / 2 - 0.03, z + d / 2 + 0.03, acc);
  BOX(`${id}Roof`, id, x - w / 2 - 0.1, x + w / 2 + 0.1, h, h + 0.15, z - d / 2 - 0.1, z + d / 2 + 0.1, "roof");
  const n = Math.floor((w - 0.8) / 0.6), rows = Math.max(1, Math.floor((h - 1.6) / 0.8));
  P({ id: `${id}Win`, layer: id, shape: "box", size: [0.4, 0.45, 0.04], pos: [0, 0, R2(z + d / 2 + 0.02)], at: Array.from({ length: n * rows }, (_, i) => [R2(x - (n - 1) * 0.3 + (i % n) * 0.6), R2(1.6 + Math.floor(i / n) * 0.8), 0]), mat: "glassDark" });
  BOX(`${id}Door`, id, x + w / 2 - 1.4, x + w / 2 - 0.3, 0.12, 1.2, z + d / 2, z + d / 2 + 0.06, "dark");
  P({ id: `${id}DoorL`, layer: id, shape: "box", size: [1.1, 0.03, 0.02], pos: [R2(x + w / 2 - 0.85), 0, R2(z + d / 2 + 0.07)], at: Array.from({ length: 5 }, (_, i) => [0, R2(0.3 + i * 0.2), 0]), mat: "steel2" });
  P({ id: `${id}Hv`, layer: id, shape: "box", size: [0.9, 0.5, 0.8], pos: [0, R2(h + 0.4), 0], at: [[R2(x - w / 4), 0, z], [R2(x + w / 4), 0, z]], mat: "panel2", bevel: 0.03 });
  P({ id: `${id}HvF`, layer: id, shape: "cyl", size: [0.3, 0.05], rot: V, pos: [0, R2(h + 0.67), 0], at: [[R2(x - w / 4), 0, z], [R2(x + w / 4), 0, z]], mat: "dark" });
  VC(`${id}Stack`, id, 0.18, h, h + 1.4, "steel2", { x: R2(x + w / 2 - 0.5), z: R2(z - d / 2 + 0.5) }); VC(`${id}StackC`, id, 0.24, h + 1.4, h + 1.5, "steel", { x: R2(x + w / 2 - 0.5), z: R2(z - d / 2 + 0.5) });
  PIPE(`${id}Pipe`, id, [[x - w / 2 + 0.4, R2(h + 0.2), R2(z - d / 2 + 0.3)], [x - w / 2 + 0.4, R2(h + 0.9), R2(z - d / 2 + 0.3)], [x + w / 2 - 0.9, R2(h + 0.9), R2(z - d / 2 + 0.3)]], 0.08, "pipeW");
  BOX(`${id}SignBg`, id, x - signW / 2 - 0.15, x + signW / 2 + 0.15, R2(h - 1.45), R2(h - 0.5), z + d / 2, z + d / 2 + 0.04, "panel");
  PLATE(`${id}Sign`, id, sign, signW, x, R2(h - 0.975), R2(z + d / 2 + 0.05)); };
const vis_ = SIGN["sign-vis"].aspect, umc_ = SIGN["sign-umc"].aspect;
FAB("fUmc", FX - 3.4, 3.0, 4.8, 3.4, 4.2, "sign-umc", R2(Math.min(3.0, 0.8 * umc_)), "advGlow");
FAB("fVis", FX + 3.4, -0.6, 4.6, 3.4, 3.4, "sign-vis", R2(Math.min(2.4, 0.8 * vis_)), "matGlow");
FAB("fPsmc", FX - 1.6, -5.4, 4.6, 3.4, 3.8, "sign-psmc", R2(Math.min(2.6, 0.8 * SIGN["sign-psmc"].aspect)), "priceTag");
LAY("fFlag", [2, 4, FX + 0.2, 2]); FLAGPOLE("fFlagP", "fFlag", "TW", FX + 0.2, 6.0, 3.6, 1.2);
// 廠前產品樣本：聯電＝驅動晶片小條；世界先進＝功率元件（TO 封裝）；力積電＝晶圓盒
LAY("fProd", [18, 1, FX, 0.5]);
P({ id: "fProdDdi", layer: "fProd", shape: "box", size: [1.0, 0.12, 0.22], pos: [0, 0.3, 5.4], at: [[FX - 4.3, 0, 0], [FX - 4.3, 0, 0.4], [FX - 2.9, 0, 0], [FX - 2.9, 0, 0.4]], mat: "chipBk" });
P({ id: "fProdTo", layer: "fProd", shape: "box", size: [0.4, 0.5, 0.14], pos: [0, 0.4, 1.0], at: [[FX + 4.4, 0, 0], [FX + 5.0, 0, 0], [FX + 5.6, 0, 0], [FX + 6.2, 0, 0]], mat: "chipBk" });
P({ id: "fProdToL", layer: "fProd", shape: "box", size: [0.04, 0.3, 0.04], pos: [0, 0.05, 1.0], at: [4.4, 5.0, 5.6, 6.2].flatMap((d) => [[R2(FX + d - 0.12), 0, 0], [R2(FX + d), 0, 0], [R2(FX + d + 0.12), 0, 0]]), mat: "needle" });
P({ id: "fProdFoup", layer: "fProd", shape: "box", size: [1.0, 0.9, 0.9], pos: [0, 0.57, -3.2], at: [[FX + 0.6, 0, 0], [FX + 1.9, 0, 0]], mat: "lampY", bevel: 0.08 });
P({ id: "fProdFoupD", layer: "fProd", shape: "box", size: [0.86, 0.76, 0.06], pos: [0, 0.57, -2.73], at: [[FX + 0.6, 0, 0], [FX + 1.9, 0, 0]], mat: "cond" });
P({ id: "fProdFoupL", layer: "fProd", shape: "box", size: [0.3, 0.08, 0.04], pos: [0, 0.57, -2.69], at: [[FX + 0.6, 0, 0], [FX + 1.9, 0, 0]], mat: "dark" });
P({ id: "fProdFoupS", layer: "fProd", shape: "box", size: [0.06, 0.12, 0.4], pos: [0, 0.75, -3.2], at: [[FX + 0.08, 0, 0], [FX + 1.12, 0, 0], [FX + 1.38, 0, 0], [FX + 2.42, 0, 0]], mat: "dark" });
P({ id: "fProdFoupH", layer: "fProd", shape: "box", size: [0.5, 0.1, 0.2], pos: [0, 1.07, -3.2], at: [[FX + 0.6, 0, 0], [FX + 1.9, 0, 0]], mat: "dark" });


// ═════ 站 C：中國擴產（國旗；九座新廠依序冒出＝夜市一下開很多攤；右邊價格柱往下沉）═════
const CX = 160;
LAY("cFlag", [2, 4, CX - 9.6, 2]); FLAGPOLE("cFlagP", "cFlag", "CN", CX - 9.0, -4.2, 4.2, 1.2);
const NEW = [];
for (let i = 0; i < 9; i++) { const id = `cFab${i}`, x = R2(CX - 7.5 + (i % 3) * 3.6), z = R2(-3.2 + Math.floor(i / 3) * 3.0), h = R2(1.6 + (i % 2) * 0.4); NEW.push(id);
  LAY(id, [3, R2(h + 0.6), x, R2(h / 2)]);
  BOX(`${id}B`, id, x - 1.3, x + 1.3, 0.12, h, z - 1.0, z + 1.0, "panel", { bevel: 0.03 });
  BOX(`${id}R`, id, x - 1.38, x + 1.38, h, R2(h + 0.1), z - 1.08, z + 1.08, "roof");
  BOX(`${id}Band`, id, x - 1.32, x + 1.32, R2(h - 0.3), R2(h - 0.12), z - 1.02, z + 1.02, "awnR");
  P({ id: `${id}Win`, layer: id, shape: "box", size: [0.35, 0.3, 0.03], pos: [0, R2(h - 0.75), R2(z + 1.01)], at: [-0.8, -0.27, 0.27, 0.8].map((d) => [R2(x + d), 0, 0]), mat: "glassDark" });
  BOX(`${id}Door`, id, x + 0.4, x + 1.0, 0.12, 0.8, z + 1.0, z + 1.04, "dark");
  VC(`${id}Stack`, id, 0.12, h, R2(h + 0.8), "steel2", { x: R2(x - 0.9), z: R2(z - 0.6) });
  P({ id: `${id}Hv`, layer: id, shape: "box", size: [0.6, 0.3, 0.5], pos: [R2(x + 0.5), R2(h + 0.25), R2(z - 0.3)], mat: "panel2", bevel: 0.02 });
  P({ id: `${id}Wall`, layer: id, shape: "box", size: [3.2, 0.3, 0.08], pos: [x, 0.27, R2(z + 1.4)], mat: "panel2" });
  P({ id: `${id}Gate`, layer: id, shape: "box", size: [0.12, 0.6, 0.12], pos: [0, 0.42, R2(z + 1.4)], at: [[R2(x + 0.15), 0, 0], [R2(x + 0.95), 0, 0]], mat: "awnR" });
  P({ id: `${id}Bar`, layer: id, shape: "box", size: [0.8, 0.05, 0.05], pos: [R2(x + 0.55), 0.5, R2(z + 1.4)], mat: "warnY" });
  VC(`${id}Tank`, id, 0.22, 0.12, 1.1, "tankP", { x: R2(x + 1.55), z: R2(z - 0.4) }); SPH(`${id}TankT`, id, 0.22, R2(x + 1.55), 1.1, R2(z - 0.4), "tankP");
  PIPE(`${id}Gp`, id, [[R2(x + 1.55), 1.0, R2(z - 0.15)], [R2(x + 1.55), 1.3, R2(z - 0.15)], [R2(x + 1.3), 1.3, R2(z - 0.15)]], 0.05, "pipeW"); }
LAY("cSign", [3, 1.5, CX - 3.9, 4.6]); PLATE("cSignP", "cSign", "sign-cnfab", 2.8, CX - 3.9, 4.6, -4.6);
// 價格柱：底座＋紅色柱＋白色價格牌；往下沉＝價格被壓低（地板蓋住下半）
LAY("cPrice", [2, 6, CX + 2.4, 3]);
BOX("cPriceBase", "floor", CX + 1.5, CX + 3.3, 0, 0.1, -5.4, -3.6, "dark");
BOX("cPriceCol", "cPrice", CX + 1.9, CX + 2.9, 0.1, 5.2, -5.0, -4.0, "price", { bevel: 0.04 });
BOX("cPriceTag", "cPrice", CX + 1.6, CX + 3.2, 4.4, 5.0, -4.0, -3.94, "priceTag");
P({ id: "cPriceTick", layer: "cPrice", shape: "box", size: [0.5, 0.04, 0.04], pos: [0, 0, -3.98], at: Array.from({ length: 8 }, (_, i) => [R2(CX + 2.4), R2(0.6 + i * 0.5), 0]), mat: "priceTag" });

// ═════ 站 T：轉向（左：電動車，底盤逆變器的功率模組；右：AI 伺服器機櫃，電源供應器）═════
const TX = 200;
LAY("tCar", [8, 3, TX - 5, 1.2]);
BOX("tCarBody", "tCar", TX - 9, TX - 1.4, 0.55, 1.5, -1.6, 1.6, "car", { bevel: 0.3 });
BOX("tCarCab", "tCar", TX - 7.2, TX - 3.0, 1.5, 2.4, -1.45, 1.45, "car", { bevel: 0.3 });
BOX("tCarWin", "tCar", TX - 7.0, TX - 3.2, 1.6, 2.3, 1.46, 1.48, "carD");
BOX("tCarWs", "tCar", TX - 3.1, TX - 3.0, 1.6, 2.3, -1.3, 1.3, "carD");
P({ id: "tTire", layer: "tCar", shape: "cyl", size: [0.55, 0.45], pos: [0, 0.55, 0], at: [[TX - 7.6, 0, 1.45], [TX - 2.8, 0, 1.45], [TX - 7.6, 0, -1.45], [TX - 2.8, 0, -1.45]], mat: "tire" });
P({ id: "tRim", layer: "tCar", shape: "cyl", size: [0.32, 0.47], pos: [0, 0.55, 0], at: [[TX - 7.6, 0, 1.45], [TX - 2.8, 0, 1.45], [TX - 7.6, 0, -1.45], [TX - 2.8, 0, -1.45]], mat: "rim" });
P({ id: "tArch", layer: "tCar", shape: "box", size: [1.5, 0.35, 0.06], pos: [0, 1.0, 0], at: [[TX - 7.6, 0, 1.62], [TX - 2.8, 0, 1.62]], mat: "carD" });
P({ id: "tSeam", layer: "tCar", shape: "box", size: [0.03, 1.4, 0.02], pos: [0, 1.55, 1.62], at: [[TX - 5.1, 0, 0], [TX - 3.4, 0, 0]], mat: "carD" });
P({ id: "tHandle", layer: "tCar", shape: "box", size: [0.3, 0.06, 0.04], pos: [0, 1.35, 1.63], at: [[TX - 5.5, 0, 0], [TX - 3.8, 0, 0]], mat: "rim" });
P({ id: "tMirror", layer: "tCar", shape: "box", size: [0.2, 0.18, 0.3], pos: [R2(TX - 3.3), 1.75, 0], at: [[0, 0, 1.7], [0, 0, -1.7]], mat: "carD" });
BOX("tBumper", "tCar", TX - 1.5, TX - 1.2, 0.45, 0.75, -1.5, 1.5, "carD", { bevel: 0.08 });
BOX("tGrille", "tCar", TX - 1.43, TX - 1.36, 0.85, 1.2, -0.6, 0.6, "dark");
P({ id: "tGrilleS", layer: "tCar", shape: "box", size: [0.03, 0.03, 1.15], pos: [R2(TX - 1.34), 0, 0], at: [0.92, 1.0, 1.08, 1.16].map((y) => [0, y, 0]), mat: "rim" });
BOX("tBumperR", "tCar", TX - 9.2, TX - 8.9, 0.45, 0.75, -1.5, 1.5, "carD", { bevel: 0.08 });
P({ id: "tTail", layer: "tCar", shape: "box", size: [0.06, 0.18, 0.45], pos: [R2(TX - 8.98), 1.2, 0], at: [[0, 0, 1.05], [0, 0, -1.05]], mat: "lampR" });
P({ id: "tLamp", layer: "tCar", shape: "box", size: [0.06, 0.2, 0.5], pos: [R2(TX - 1.42), 1.15, 0], at: [[0, 0, 1.0], [0, 0, -1.0]], mat: "lampY" });
// 逆變器（車底；外殼掀開看到 6 顆功率晶片模組）＋高壓線（橘）
LAY("tInv", [3, 1.2, TX - 5.2, 0.9]);
BOX("tInvBox", "tInv", TX - 6.4, TX - 4.0, 0.9, 1.3, 2.4, 4.0, "inv", { bevel: 0.04 });
P({ id: "tInvMod", layer: "tInv", shape: "box", size: [0.5, 0.1, 0.4], pos: [0, 1.35, 0], at: [-0.8, 0, 0.8].flatMap((d) => [[R2(TX - 5.2 + d), 0, 2.9], [R2(TX - 5.2 + d), 0, 3.5]]), mat: "chipBk" });
P({ id: "tInvTerm", layer: "tInv", shape: "box", size: [0.12, 0.08, 0.12], pos: [0, 1.43, 0], at: [-0.8, 0, 0.8].flatMap((d) => [[R2(TX - 5.2 + d - 0.12), 0, 2.9], [R2(TX - 5.2 + d + 0.12), 0, 3.5]]), mat: "cuTr" });
BOX("tInvStand", "tInv", TX - 6.2, TX - 4.2, 0, 0.9, 2.6, 3.8, "stand"); BOX("tInvLid", "tInv", TX - 6.4, TX - 4.0, 1.3, 1.36, 4.0, 4.5, "inv", { rot: [-60, 0, 0] });
P({ id: "tInvCap", layer: "tInv", shape: "cyl", size: [0.18, 0.4], rot: V, pos: [0, 1.5, 3.95], at: [[TX - 6.0, 0, 0], [TX - 5.6, 0, 0]], mat: "capTan" });
PIPE("tHv", "tInv", [[TX - 4.0, 1.1, 3.2], [TX - 3.2, 1.1, 3.2], [TX - 3.2, 0.55, 1.7]], 0.07, "cable", { jmat: "cable" });
// AI 伺服器機櫃（機架＋8 台伺服器＋上面兩台電源供應器，前面有風扇與燈號）
const RX = TX + 1.6;
LAY("tRack", [3, 6, RX, 3]);
BOX("tRackF", "tRack", RX - 1.4, RX + 1.4, 0.1, 6.2, -1.2, 1.2, "rack");
P({ id: "tSled", layer: "tRack", shape: "box", size: [2.5, 0.42, 0.1], pos: [RX, 0, 1.22], at: Array.from({ length: 8 }, (_, i) => [0, R2(0.5 + i * 0.5), 0]), mat: "sled" });
P({ id: "tSledLed", layer: "tRack", shape: "box", size: [0.08, 0.08, 0.04], pos: [R2(RX + 1.0), 0, 1.28], at: Array.from({ length: 8 }, (_, i) => [0, R2(0.5 + i * 0.5), 0]), mat: "ledB" });
LAY("tPsu", [3, 1.4, RX, 5.0]);
P({ id: "tPsuB", layer: "tPsu", shape: "box", size: [1.15, 0.55, 0.1], pos: [0, 0, 1.25], at: [[R2(RX - 0.62), 4.7, 0], [R2(RX + 0.62), 4.7, 0], [R2(RX - 0.62), 5.3, 0], [R2(RX + 0.62), 5.3, 0]], mat: "psu" });
P({ id: "tPsuFan", layer: "tPsu", shape: "cyl", size: [0.18, 0.03], pos: [0, 0, 1.31], at: [[R2(RX - 0.85), 4.7, 0], [R2(RX + 0.39), 4.7, 0], [R2(RX - 0.85), 5.3, 0], [R2(RX + 0.39), 5.3, 0]], mat: "fan" });
P({ id: "tPsuLed", layer: "tPsu", shape: "box", size: [0.07, 0.07, 0.03], pos: [0, 0, 1.31], at: [[R2(RX - 0.2), 4.7, 0], [R2(RX + 1.04), 4.7, 0], [R2(RX - 0.2), 5.3, 0], [R2(RX + 1.04), 5.3, 0]], mat: "ledGg" });

// ═════ 站 N：下一集記憶體（DRAM 模組：綠板＋8 顆顆粒＋金手指；旁邊名牌）═════
const NX = 240;
LAY("nDimm", [10, 3, NX, 1.6]);
BOX("nDimmB", "nDimm", NX - 5, NX + 5, 0.4, 2.8, -0.06, 0.06, "dimm");
P({ id: "nDram", layer: "nDimm", shape: "box", size: [0.9, 1.1, 0.12], pos: [0, 1.75, 0.12], at: Array.from({ length: 8 }, (_, i) => [R2(NX - 4.2 + i * 1.2), 0, 0]), mat: "dram", bevel: 0.02 });
P({ id: "nGold", layer: "nDimm", shape: "box", size: [0.08, 0.35, 0.13], pos: [0, 0.58, 0], at: Array.from({ length: 60 }, (_, i) => [R2(NX - 4.8 + i * 0.163), 0, 0]), mat: "goldF" });
BOX("nNotch", "nDimm", NX - 0.6, NX - 0.4, 0.4, 0.8, -0.08, 0.08, "floor");
LAY("nSign", [3, 1.6, NX, 4.0]); PLATE("nSignP", "nSign", "sign-mem", 2.6, NX, 4.0, -0.4);

// 通道（閘極加電壓時，P 本體貼著溝槽側壁反轉成 N 型的薄層；平常看不到，念到才亮）
LAY("pChan", [7, 0.7, R2((CX0 + CX1) / 2), 3.95]);
P({ id: "pChanS", layer: "pChan", shape: "box", size: [0.07, 0.7, 0.02], pos: [0, 3.95, R2(CZ1 + 0.012)], at: GXS.flatMap((x) => [[R2(x - 0.31), 0, 0], [R2(x + 0.31), 0, 0]]), mat: "eDot" });

// ═════ 動作 ═════
const MES = [CX0 + 0.55, CX0 + 2.45, CX0 + 4.55, CX0 + 6.5];
Object.assign(actions, {
  kAdv: { type: "pulse", _說明: "先進 SoC（三奈米這類）藍框閃", parts: ["kAdvRing"], color: "advC", glow: 1.0, freq: 1.4, halo: 0.4 },
  kMat: { type: "pulse", _說明: "其他晶片（電源、功率、驅動、射頻、記憶體）多半是成熟製程：橘框閃", parts: ["kMatRing"], color: "matC", glow: 1.0, freq: 1.4, halo: 0.4 },
  kPowIn: { type: "flow", _說明: "配電盤：電池→功率開關→電源管理 IC", layer: "kMos", path: [[MX + 0.5, KT + 0.12, MZ - 1.6], [MX + 0.5, KT + 0.12, MZ], [PX - 0.9, KT + 0.12, MZ], [PX - 0.9, KT + 0.12, PZ]], n: 6, size: 0.16, shape: "dot", rate: 0.7, color: "heatC", track: false, free: true },
  kPowSoc: { type: "flow", _說明: "電源管理 IC→電感→分給 SoC", layer: "kPmic", path: [[PX + 1.7, KT + 0.12, PZ + 0.0], [PX + 1.7, KT + 0.12, PZ + 2.2], [KX + 1.6, KT + 0.12, PZ + 2.2], [KX + 1.6, KT + 0.12, 0]], n: 5, size: 0.16, shape: "dot", rate: 0.7, color: "heatC", track: false, free: true },
  kPowMem: { type: "flow", _說明: "分給記憶體", layer: "kPmic", path: [[PX + 1.7, KT + 0.12, PZ - 0.75], [PX + 1.7, KT + 0.12, -3.6], [KX - 3.4, KT + 0.12, -3.6], [KX - 3.4, KT + 0.12, -1.3]], n: 6, size: 0.16, shape: "dot", rate: 0.7, color: "heatC", track: false, free: true },
  kPowDisp: { type: "flow", _說明: "分給螢幕接頭", layer: "kPmic", path: [[PX + 1.7, KT + 0.12, PZ + 1.5], [PX + 1.7, KT + 0.12, DCZ - 0.4], [DCX, KT + 0.12, DCZ - 0.4]], n: 4, size: 0.16, shape: "dot", rate: 0.7, color: "heatC", track: false, free: true },
  pGateOn: { type: "pulse", _說明: "閘極加電壓（水龍頭把手轉開）", parts: ["pGatePoly", "pLegG", "pGateBus"], color: "polyC", glow: 1.0, steady: true, halo: 0.4 },
  pChanOn: { type: "pulse", parts: ["pChanS"], color: "eDot", glow: 1.0, steady: true, halo: 0.3 },
  pCur: { type: "flow", _說明: "電流由下面汲極往上，經漂移層、貼著溝槽側壁的通道、N+ 源極，到上面源極金屬（傳統電流方向）", layer: "pChan",
    path: [[R2(GXS[1] + 0.33), 0.35, CZ1 + 0.06], [R2(GXS[1] + 0.33), 5.0, CZ1 + 0.06]], n: 6, lanes: 3, laneDir: [1, 0, 0], laneGap: 2.1, size: 0.13, shape: "dot", rate: 0.8, color: "eDot", track: false, free: true },
  pPkgCur: { type: "flow", _說明: "封裝外：電流從 D 腳進、S 腳出", layer: "pPkg", path: [[PPX - 5.0, 1.0, 5.0], [PPX - 5.0, 3.0, 4.0], [PPX - 4.25, 3.0, 4.0], [PPX - 4.25, 1.0, 5.0]], n: 4, size: 0.12, shape: "dot", rate: 0.7, color: "powC", track: false, free: true },
  dSig: { type: "flow", _說明: "驅動 IC 把每一行要的亮度送上去（逐列掃描點亮）", layer: "dDdi", path: [[DX - 4.66, DPY + 0.12, 2.75], [DX - 4.66, DPY + 0.12, -3.5]], n: 2, lanes: PXN, laneDir: [1, 0, 0], laneGap: PS, size: 0.07, shape: "dot", rate: 0.9, color: "ledB", track: false, free: true },
  dFpcSig: { type: "flow", _說明: "主機板經軟板送畫面資料進驅動 IC", layer: "dDdi", path: [[DX - 1.0, DPY + 0.03, 5.5], [DX - 1.0, DPY + 0.03, 3.3]], n: 3, lanes: 4, laneDir: [1, 0, 0], laneGap: 0.36, size: 0.07, shape: "dot", rate: 0.8, color: "ledB", track: false, free: true },
  tInvCur: { type: "flow", _說明: "電池高壓電經逆變器功率模組送到馬達", layer: "tInv", path: [[TX - 6.0, 1.5, 2.9], [TX - 4.4, 1.5, 2.9], [TX - 4.4, 1.5, 3.5], [TX - 6.0, 1.5, 3.5]], n: 5, size: 0.12, shape: "dot", rate: 0.8, color: "powC", track: false, free: true },
  tPsuCur: { type: "flow", _說明: "電源供應器把電往下分給每台伺服器", layer: "tPsu", path: [[RX - 1.5, 5.0, 1.35], [RX - 1.5, 0.5, 1.35]], n: 6, size: 0.1, shape: "dot", rate: 0.8, color: "powC", track: false, free: true },
  tLeds: { type: "pulse", parts: ["tSledLed", "tPsuLed"], color: "ledB", glow: 1.0, freq: 2.0, halo: 0.2 },
  tFanSpin: { type: "rotate", parts: ["tPsuFan"], axis: [0, 0, 1], rps: 3, rampSpin: true },
  nSig: { type: "flow", layer: "nDimm", path: [[NX - 4.8, 0.6, 0.15], [NX + 4.8, 0.6, 0.15]], n: 6, size: 0.08, shape: "dot", rate: 0.6, color: "ledB", track: false, free: true },
});
for (let r = 0; r < PYN; r++) actions[`dRowOn${r}`] = { type: "pulse", parts: [0, 1, 2].map((c) => `dRow${r}${c}`), color: "pxB", glow: 0.5, steady: true, halo: 0 };

// ═════ 標註點 ═════
Object.assign(anchors, {
  kSoc: A("kSoc", [KX + 1.3, KT + 0.3, 1.3], 150, -120), kMem: A("kMem", [KX - 3.4, KT + 0.22, 1.2], -150, -110), kPmic: A("kPmic", [PX, KT + 0.16, PZ], 140, -120),
  kInd: A("kPmic", [PX + 1.7, KT + 0.33, PZ + 1.5], 150, 90), kMos: A("kMos", [MX + 0.5, KT + 0.2, MZ], -140, -120), kDisp: A("kDisp", [DCX, KT + 0.2, DCZ], 140, 100), kRf: A("kRf", [KX - 4.3, KT + 0.22, 2.8], -140, 100),
  pPkg: A("pPkg", [PPX - 5.0, 3.25, 1.7], -140, -120), pLegG: A("pPkg", [PPX - 5.75, 1.55, 5.1], -140, 80), pHs: A("pHs", [PPX - 7.6, 2.9, 1.5], -140, -80),
  pDrain: A("pDrain", [CX1, 0.35, CZ1], 150, 40), pSub: A("pSub", [CX1, 0.95, CZ1], 150, 20), pDrift: A("pDrift", [CX1, 2.5, CZ1], 150, 0), pBody: A("pBody", [CX1, 3.95, CZ1], 150, -20),
  pGate: A("pGate", [GXS[2], 4.5, CZ1], 150, -90), pSrcN: A("pSrcN", [CX1, 4.45, CZ1], 150, -40), pMetal: A("pMetal", [CX1, 4.95, CZ1], 150, -60), pWire: A("pWire", [CX0 + 2.0, 5.9, 0], -150, -80),
  pChan: A("pChan", [GXS[1] + 0.31, 3.95, CZ1], -150, -60),
  dDdi: A("dDdi", [DX - 1.0, DPY + 0.24, 3.0], 140, 100), dPanel: A("dRow4", [DX - 4.5, DPY + 0.1, -1.0], -140, -100), dW8: A("dW8", [DX + 7.0, 0.7, 2.6], -120, 100), dW12: A("dW12", [DX + 12.6, 0.7, 3.6], 120, 100),
  fUmc: A("fUmc", [FX - 3.4, 4.4, 4.7], -100, -110), fVis: A("fVis", [FX + 3.4, 3.6, 1.1], 100, -110), fPsmc: A("fPsmc", [FX - 1.6, 4.0, -3.7], -100, -110),
  fProd: A("fProd", [FX - 3.6, 0.4, 5.6], -120, 100), fProdTo: A("fProd", [FX + 5.3, 0.6, 1.1], 110, 100),
  cFab4: A("cFab4", [CX - 3.9, 2.0, -0.2], -120, -110), cPrice: A("cPrice", [CX + 2.4, 4.7, -3.94], 120, -100), cFlag: A("cFlag", [CX - 10.4, 3.8, 0], -100, -90),
  tInv: A("tInv", [TX - 5.2, 1.45, 3.2], -130, 110), tPsu: A("tPsu", [RX + 0.6, 5.3, 1.3], 130, -100), tCar: A("tCar", [TX - 5.0, 2.4, 0.5], -120, -110), tRack: A("tRack", [RX, 3.0, 1.3], 130, 60),
  nDimm: A("nDimm", [NX + 1.0, 2.3, 0.2], 140, -110),
});

const model = {
  name: "示意 成熟與特殊製程代工：手機主機板（先進 SoC 與周圍成熟製程晶片）、功率 MOSFET 封裝與垂直溝槽剖面、螢幕驅動 IC 逐列掃描、8 吋與 12 吋晶圓、聯電／世界先進／力積電廠房、中國新廠與價格柱、電動車逆變器與 AI 伺服器電源、下一集記憶體模組",
  unit: "示意", size: { w: 40, h: 18, r: 0.6, t: 30 }, palette, materials, partNames: {},
  layers, parts, anchors, actions,
  pose: { yaw0: 0, yawIso: 0, drift: 0 }, camera: { stand: { d: 70, elev: 24, y: 4 } },
  fx: { dpr: 1, srcPx: 30, shadows: 0, fog: false, dust: false, vaporSprites: false, shimmer: false },
  info: { KX, KT, PX, PZ, MX, MZ, DCX, DCZ, PPX, CX0, CX1, DX, DPY, PYN, FX, CX, TX, RX, NX },
};
fs.writeFileSync(path.join(HERE, "model.json"), JSON.stringify(model, null, 1) + "\n");
console.log(`✔ model.json：${parts.length} 個零件、${parts.reduce((a, p) => a + Math.max(1, (p.at?.length ?? 0)), 0)} 個實體（含複製）、${layers.length} 層`);

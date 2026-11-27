// node videos/tech-utility/gen-model.mjs → 寫 videos/tech-utility/model.json
// 2026/11/27 tech-utility（廠務-2：水、氣、電，系列 2 第 20 集）。構造與物理照 physics-spec.md、模組清單與細節照 visual-spec.md。
// 單位：1＝1 m（示意），地板頂面 y＝0，x 向右、z 向觀眾。站點（相隔 ≥25，換幕鏡頭硬切）：
//   U 用水點特寫（x −40；旋轉晶圓被超純水沖洗）｜F 晶圓廠垂直剖面（x 0；屋頂、無塵室、回風夾層、地下廠務層，爆炸分解）
//   W 超純水製造（x 40；預處理→逆滲透→離子交換／電去離子→紫外線→脫氣／超過濾→儲槽）｜L 超純水循環迴路（x 70；儲槽、迴路泵、用水點、回流閥、死水支管）
//   T 台積電廠房外觀（x 100；原水槽、廠牌、國旗、屋頂冷卻塔、冰水主機房）｜E 電力（x 135；高壓進線、變壓器、開關櫃、敏感機台、不斷電系統＋電池架）
//   G 氣體（x 170；空氣分離廠、液氮槽、汽化器、地下管線、減壓站、閥箱、機台）｜V 供應商（x 205；三座廠：超純水設備、兩座空分廠）｜P 探針卡預告（x 235）
//   外形依公開資料與通則（示意，非特定廠牌／型號）；只標查證過的數字（電阻率 18.2 MΩ·cm）。
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
  roofC: "#B9C2CF", grateC: "#9AA6B8", ffuC: "#F7FAFF", towerC: "#DCE3EC", markC: "#E8613C", insulC: "#D5DBE3", soilD: "#8B6B45", tankC: "#B9C9D8",
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
const TEX = ["flag:TW", "flag:JP", "logo:tsmc", "text:organo=Organo|オルガノ", "text:lienhwa=聯華林德", "text:sanfu=三福氣體", "text:r182=18.2|MΩ·cm", "text:upsTag=不斷電系統|UPS", "text:n2tag=N₂ 氮氣|惰性氣體"];
{ const r = spawnSync("node", [path.join(HERE, "..", "..", "scripts", "three", "make-brand-tex.mjs"), "tech-utility", ...TEX], { encoding: "utf8" }); if (r.status !== 0) { console.error(r.stdout, r.stderr); process.exit(1); } }
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

// ═════ 站 U：用水點特寫（s1 開場）＝清洗腔的旋轉吸盤＋晶圓＋擋水杯＋噴嘴臂；超純水沖在晶圓中心、離心螺旋甩出、邊緣甩出水珠 ═════
const UX = -40, WR = 1.5, YW = 1.5;
LAY("uBay", [5, 1.2, UX, 1.5]);
BOX("uWall", "uBay", UX - 6, UX + 6, 0, 5.6, -3.6, -3.35, "panel");
P({ id: "uWallSeam", layer: "uBay", shape: "box", size: [0.04, 5.5, 0.04], pos: [0, 2.8, -3.33], at: [-4, -2, 0, 2, 4].map((dx) => [UX + dx, 0, 0]), mat: "seam" });
BOX("uWallWin", "uBay", UX - 5.2, UX - 2.6, 2.4, 4.4, -3.34, -3.3, "window"); BOX("uWallWinF", "uBay", UX - 5.3, UX - 2.5, 2.3, 4.5, -3.36, -3.345, "dark");
BOX("uWallLight", "uBay", UX - 5.5, UX + 5.5, 5.2, 5.35, -3.33, -3.3, "ffu");
BOX("uCab", "uBay", UX - 3.4, UX + 3.4, 0, 1.0, -2.8, 2.8, "band"); BOX("uCabTop", "uBay", UX - 3.4, UX + 3.4, 1.0, 1.08, -2.8, 2.8, "panel2");
BOX("uCabDoor", "uBay", UX - 3.1, UX - 0.2, 0.12, 0.9, 2.8, 2.84, "panel"); BOX("uCabDoor2", "uBay", UX + 0.2, UX + 3.1, 0.12, 0.9, 2.8, 2.84, "panel");
P({ id: "uCabLed", layer: "uBay", shape: "sphere", size: [0.06], pos: [UX + 2.2, 0.7, 2.86], at: [[0, 0, 0], [0.25, 0, 0], [0.5, 0, 0]], mat: "lampG" });
BOX("uCabWarn", "uBay", UX - 2.6, UX - 1.4, 0.3, 0.6, 2.84, 2.87, "warnY");
for (let i = 0; i < 5; i++) BOX(`uCabVent${i}`, "uBay", UX + 0.6, UX + 1.8, 0.25 + i * 0.1, 0.29 + i * 0.1, 2.84, 2.87, "dark");
VT("uCup", "uBay", 2.25, 2.1, 1.08, 1.95, "panel", { x: UX }); VT("uCupLip", "uBay", 2.3, 1.95, 1.9, 2.0, "steel2", { x: UX });
VT("uCupIn", "uBay", 1.85, 1.78, 1.08, 1.6, "panel2", { x: UX }); VC("uCupFloor", "uBay", 2.1, 1.08, 1.12, "dark", { x: UX });
P({ id: "uCupBolt", layer: "uBay", shape: "cyl", size: [0.05, 0.04], rot: V, pos: [0, 2.01, 0], at: RING(16, 2.12, 0, UX, 0), mat: "steel" });
PIPE("uDrain", "uBay", [[UX + 1.9, 1.1, 1.2], [UX + 1.9, 0.5, 1.2], [UX + 3.5, 0.5, 1.2]], 0.1, "pipeW");
LAY("uWafer", [3.2, 0.5, UX, 1.4]);
VC("uChuck", "uWafer", 0.55, 1.12, YW - 0.02, "steel"); VT("uChuckRing", "uWafer", 0.62, 0.52, 1.2, 1.32, "dark", { x: UX });
VC("uWaf", "uWafer", WR, YW - 0.02, YW + 0.02, "si", { x: UX });
{ const dies = []; for (let i = -6; i <= 6; i++) for (let j = -6; j <= 6; j++) { const x = i * 0.22, z = j * 0.22; if (Math.hypot(x, z) < WR - 0.16) dies.push([R2(UX + x), 0, R2(z)]); }
  P({ id: "uDie", layer: "uWafer", shape: "box", size: [0.19, 0.008, 0.19], pos: [0, YW + 0.024, 0], at: dies, mat: "die" }); }
BOX("uWafMark", "uWafer", UX + WR - 0.35, UX + WR - 0.05, YW + 0.02, YW + 0.04, -0.06, 0.06, "mark");
P({ id: "uPin", layer: "uWafer", shape: "cyl", size: [0.06, 0.12], rot: V, pos: [0, YW, 0], at: RING(6, WR + 0.04, 15, UX, 0), mat: "gold" });
LAY("uArm", [1.6, 1.0, UX + 0.6, 2.4]);
VC("uPost", "uArm", 0.16, 1.08, 3.3, "steel2", { x: UX + 2.6, z: -1.6 }); BOX("uValve", "uArm", UX + 2.35, UX + 2.85, 1.6, 2.1, -1.85, -1.35, "steel");
ZC("uValveKnob", "uArm", 0.1, -1.35, -1.25, UX + 2.6, 1.85, "estop");
PIPE("uArmP", "uArm", [[UX + 2.6, 3.2, -1.6], [UX + 0.25, 3.2, -1.6], [UX + 0.25, 3.2, -0.25], [UX + 0.25, 2.45, -0.25]], 0.07, "pipeW", { jmat: "pipeW" });
VC("uNozzle", "uArm", 0.09, 2.25, 2.48, "steel", { x: UX + 0.25, z: -0.25 }); VT("uNozRing", "uArm", 0.12, 0.08, 2.38, 2.44, "dark", { x: UX + 0.25, z: -0.25 });
PIPE("uFeed", "uArm", [[UX + 2.6, 3.3, -1.6], [UX + 2.6, 3.6, -1.6], [UX + 5.5, 3.6, -1.6]], 0.06, "pipeCl", { jmat: "pipeW" });
LAY("uFilm", [3.2, 0.2, UX, YW + 0.05]); VC("uFilmD", "uFilm", WR - 0.05, YW + 0.025, YW + 0.035, "water", { x: UX });

// ═════ 站 F：晶圓廠垂直剖面（爆炸分解：屋頂／無塵室／回風夾層／地下廠務層；地下層再分水、電、氣）═════
const FX = 0;
LAY("fShell", [17, 9, FX, 4.3]);
BOX("fBack", "fShell", FX - 8.4, FX + 8.4, 0, 8.6, -4.35, -4.05, "ext");
BOX("fSideL", "fShell", FX - 8.4, FX - 8.1, 0, 8.6, -4.35, 4.05, "ext"); BOX("fSideR", "fShell", FX + 8.1, FX + 8.4, 0, 8.6, -4.35, 4.05, "ext");
P({ id: "fBackSeam", layer: "fShell", shape: "box", size: [0.05, 8.5, 0.04], pos: [0, 4.3, -4.03], at: [-6, -3, 0, 3, 6].map((d) => [FX + d, 0, 0]), mat: "seam" });
P({ id: "fLvl", layer: "fShell", shape: "box", size: [16.2, 0.08, 0.05], pos: [FX, 0, -4.02], at: [[0, 3.0, 0], [0, 4.4, 0], [0, 8.0, 0]], mat: "seam" });
P({ id: "fPil", layer: "fShell", shape: "box", size: [0.35, 8.6, 0.3], pos: [0, 4.3, 3.9], at: [[FX - 8.25, 0, 0], [FX + 8.25, 0, 0]], mat: "steel" });
LAY("fFacade", [17, 9, FX, 4.3]);
BOX("fFront", "fFacade", FX - 8.4, FX + 8.4, 0, 8.6, 4.05, 4.3, "ext");
BOX("fFrontWin", "fFacade", FX - 7.6, FX + 7.6, 5.4, 6.6, 4.3, 4.34, "glassDark"); BOX("fFrontWin2", "fFacade", FX - 7.6, FX + 7.6, 1.2, 1.9, 4.3, 4.34, "glassDark");
P({ id: "fFrontSeam", layer: "fFacade", shape: "box", size: [0.05, 8.5, 0.04], pos: [0, 4.3, 4.35], at: [-6, -4, -2, 0, 2, 4, 6].map((d) => [FX + d, 0, 0]), mat: "seam" });
BOX("fDoor", "fFacade", FX - 1.0, FX + 1.0, 0, 2.6, 4.3, 4.36, "dark"); for (let i = 0; i < 6; i++) BOX(`fLouver${i}`, "fFacade", FX + 4.4, FX + 7.4, 2.6 + i * 0.18, 2.68 + i * 0.18, 4.3, 4.38, "seam");
LAY("fFrame", [17, 9, FX, 4.3]);
P({ id: "fFrameV", layer: "fFrame", shape: "box", size: [0.1, 8.6, 0.1], pos: [0, 4.3, 4.2], at: [[FX - 8.35, 0, 0], [FX + 8.35, 0, 0]], mat: "band" });
P({ id: "fFrameH", layer: "fFrame", shape: "box", size: [16.8, 0.1, 0.1], pos: [FX, 0, 4.2], at: [[0, 0.06, 0], [0, 8.55, 0]], mat: "steel" });
// 地下廠務層：地板、三區（水左、電中、氣右），各自一層，s2 開頭往左右拉開
LAY("fSubFloor", [17, 0.4, FX, 0.15]);
BOX("fSubSlab", "fSubFloor", FX - 8.1, FX + 8.1, 0, 0.3, -4.0, 4.0, "band");
BOX("fZoneW", "fSubFloor", FX - 7.8, FX - 3.0, 0.3, 0.32, 2.6, 3.0, "frp"); BOX("fZoneE", "fSubFloor", FX - 2.6, FX + 2.6, 0.3, 0.32, 2.6, 3.0, "cable"); BOX("fZoneG", "fSubFloor", FX + 3.0, FX + 7.8, 0.3, 0.32, 2.6, 3.0, "pipeGreen");
LAY("fSubW", [5, 3, FX - 5.3, 1.5]);
for (const [i, x] of [[0, -7.0], [1, -5.7]]) { VC(`fWT${i}`, "fSubW", 0.55, 0.3, 2.3, "frp", { x: FX + x, z: -1.8 }); SPH(`fWTc${i}`, "fSubW", 0.55, FX + x, 2.3, -1.8, "frp"); VT(`fWTb${i}`, "fSubW", 0.58, 0.55, 1.3, 1.38, "dark", { x: FX + x, z: -1.8 }); }
for (let i = 0; i < 4; i++) VC(`fWRo${i}`, "fSubW", 0.12, 0.6, 2.2, "ro", { x: FX - 4.6 + i * 0.32, z: -2.0 });
BOX("fWRoFrame", "fSubW", FX - 4.85, FX - 3.45, 0.3, 0.6, -2.3, -1.7, "steel"); BOX("fWPump", "fSubW", FX - 4.3, FX - 3.4, 0.3, 0.8, 0.2, 0.9, "motorB");
PIPE("fWPipe", "fSubW", [[FX - 7.6, 0.9, -0.9], [FX - 3.6, 0.9, -0.9], [FX - 3.6, 0.9, 1.0], [FX - 3.6, 3.0, 1.0]], 0.1, "pipeBlue");
LAY("fSubE", [5, 3, FX, 1.5]);
for (let i = 0; i < 3; i++) { const x0 = FX - 2.2 + i * 1.5; BOX(`fEC${i}`, "fSubE", x0, x0 + 1.3, 0.3, 2.4, -2.4, -1.4, "panel2"); BOX(`fECd${i}`, "fSubE", x0 + 0.08, x0 + 1.22, 0.4, 2.3, -1.4, -1.37, "panel");
  P({ id: `fECl${i}`, layer: "fSubE", shape: "sphere", size: [0.05], pos: [x0 + 0.3, 2.0, -1.35], at: [[0, 0, 0], [0.2, 0, 0], [0.4, 0, 0]], mat: i === 1 ? "lampY" : "lampG" });
  for (let k = 0; k < 4; k++) BOX(`fECv${i}_${k}`, "fSubE", x0 + 0.3, x0 + 1.0, 0.6 + k * 0.1, 0.64 + k * 0.1, -1.37, -1.35, "dark"); }
BOX("fETray", "fSubE", FX - 2.3, FX + 2.3, 2.55, 2.68, -2.0, -1.6, "cable"); PIPE("fECable", "fSubE", [[FX + 0.6, 2.6, -1.8], [FX + 0.6, 2.6, 1.0], [FX + 0.6, 3.0, 1.0]], 0.09, "cable");
LAY("fSubG", [5, 3, FX + 5.3, 1.5]);
for (let i = 0; i < 6; i++) { const x = FX + 3.4 + (i % 3) * 0.5, z = -2.4 + Math.floor(i / 3) * 0.55; VC(`fGC${i}`, "fSubG", 0.2, 0.3, 1.9, "steel2", { x, z }); SPH(`fGCc${i}`, "fSubG", 0.2, x, 1.9, z, ["pipeGreen", "frp", "warnY"][i % 3]); }
BOX("fGRack", "fSubG", FX + 3.1, FX + 5.0, 0.3, 0.4, -2.75, -1.6, "dark"); BOX("fGVmb", "fSubG", FX + 5.8, FX + 7.4, 0.3, 2.3, -2.4, -1.4, "panel");
BOX("fGVmbW", "fSubG", FX + 5.95, FX + 7.25, 1.2, 2.1, -1.4, -1.37, "window"); P({ id: "fGGauge", layer: "fSubG", shape: "cyl", size: [0.09, 0.04], pos: [FX + 6.2, 0.9, -1.36], at: [[0, 0, 0], [0.4, 0, 0], [0.8, 0, 0]], mat: "steel2" });
PIPE("fGPipe", "fSubG", [[FX + 4.2, 1.2, -1.4], [FX + 4.2, 1.2, 1.0], [FX + 4.2, 3.0, 1.0]], 0.08, "pipeGreen");
// 回風夾層：天花板（地下層的頂）、柱子、回風風管、上面一層孔洞格柵地板（無塵室的地板）
LAY("fPlen", [17, 1.5, FX, 3.7]);
BOX("fPlSlab", "fPlen", FX - 8.1, FX + 8.1, 3.0, 3.2, -4.0, 4.0, "panel2");
P({ id: "fPlCol", layer: "fPlen", shape: "box", size: [0.35, 0.95, 0.35], pos: [0, 3.68, 0], at: [-6, -2, 2, 6].flatMap((dx) => [[FX + dx, 0, -2.5], [FX + dx, 0, 2.5]]), mat: "steel" });
HXC("fPlDuct", "fPlen", 0.32, FX - 7.8, FX + 7.8, 3.65, -3.3, "steel2"); P({ id: "fPlDuctR", layer: "fPlen", shape: "tube", size: [0.37, 0.3, 0.1], rot: HX, pos: [0, 3.65, -3.3], at: [-6, -3, 0, 3, 6].map((d) => [FX + d, 0, 0]), mat: "dark" });
BOX("fGrate", "fPlen", FX - 8.1, FX + 8.1, 4.2, 4.4, -4.0, 4.0, "grate");
{ const h = []; for (let i = -15; i <= 15; i++) for (let j = -7; j <= 7; j++) h.push([R2(FX + i * 0.5), 0, R2(j * 0.5)]); P({ id: "fGrateHole", layer: "fPlen", shape: "box", size: [0.3, 0.01, 0.3], pos: [0, 4.405, 0], at: h, mat: "dark" }); }
for (const [id, x, m] of [["W", -3.6, "pipeBlue"], ["E", 0.6, "cable"], ["G", 4.2, "pipeGreen"]]) VC(`fPlRiser${id}`, "fPlen", 0.1, 3.2, 4.2, m, { x: FX + x, z: 1.0 });
// 無塵室：四台機台、天花板風扇濾網（FFU）、天車軌道；氣流從天花板往下吹（flow）
LAY("fClean", [17, 3.7, FX, 6.2]);
for (let i = 0; i < 4; i++) { const x0 = FX - 7.2 + i * 3.7; BOX(`fT${i}`, "fClean", x0, x0 + 2.8, 4.4, 6.5, -2.4, 0.2, "panel");
  BOX(`fTb${i}`, "fClean", x0, x0 + 2.8, 4.4, 4.62, -2.4, 0.2, "band"); BOX(`fTw${i}`, "fClean", x0 + 0.4, x0 + 1.7, 5.2, 6.1, 0.2, 0.23, "window"); BOX(`fTs${i}`, "fClean", x0 + 2.0, x0 + 2.55, 5.6, 6.0, 0.2, 0.24, "screen");
  BOX(`fTlp${i}`, "fClean", x0 + 0.3, x0 + 1.8, 4.62, 5.0, 0.2, 0.9, "steel2"); VC(`fTlt${i}`, "fClean", 0.07, 6.5, 7.0, "steel", { x: x0 + 2.5, z: -0.2 }); SPH(`fTlg${i}`, "fClean", 0.1, x0 + 2.5, 7.0, -0.2, "lampG");
  for (let k = 0; k < 4; k++) BOX(`fTv${i}_${k}`, "fClean", x0 + 2.0, x0 + 2.6, 4.8 + k * 0.1, 4.84 + k * 0.1, 0.2, 0.23, "dark");   BOX(`fTfoup${i}`, "fClean", x0 + 0.45, x0 + 1.05, 5.0, 5.4, 0.3, 0.8, "panel2"); BOX(`fTfoup2${i}`, "fClean", x0 + 1.15, x0 + 1.75, 5.0, 5.4, 0.3, 0.8, "panel2");
  P({ id: `fTseam${i}`, layer: "fClean", shape: "box", size: [0.03, 1.8, 0.02], pos: [0, 5.55, 0.21], at: [[x0 + 1.85, 0, 0], [x0 + 0.25, 0, 0]], mat: "seam" }); BOX(`fTplate${i}`, "fClean", x0 + 2.05, x0 + 2.5, 5.15, 5.35, 0.2, 0.23, "gold"); }
BOX("fFfu", "fClean", FX - 8.1, FX + 8.1, 7.7, 8.0, -4.0, 4.0, "panel2");
P({ id: "fFfuPanel", layer: "fClean", shape: "box", size: [1.0, 0.04, 1.0], pos: [0, 7.68, 0], at: [-7, -5.5, -4, -2.5, -1, 0.5, 2, 3.5, 5, 6.5].flatMap((dx) => [-3, -1.5, 0, 1.5, 3].map((dz) => [FX + dx + 0.25, 0, dz])), mat: "ffu" });
BOX("fRail", "fClean", FX - 8.0, FX + 8.0, 7.25, 7.38, 1.9, 2.15, "steel2"); BOX("fCarrier", "fClean", FX - 2.4, FX - 1.6, 6.75, 7.25, 1.75, 2.3, "panel2");
// 屋頂：屋頂板、女兒牆、兩座冷卻塔（風扇會轉）、空調箱
LAY("fRoof", [17, 3, FX, 9.2]);
BOX("fRoofSlab", "fRoof", FX - 8.4, FX + 8.4, 8.0, 8.6, -4.35, 4.3, "roof"); BOX("fParapet", "fRoof", FX - 8.4, FX + 8.4, 8.6, 8.9, 4.05, 4.3, "ext");
for (const [i, x] of [[0, -5.5], [1, -2.2]]) { BOX(`fCT${i}`, "fRoof", FX + x - 1.3, FX + x + 1.3, 8.6, 10.2, -2.6, -0.6, "tower");
  for (let k = 0; k < 5; k++) BOX(`fCTl${i}_${k}`, "fRoof", FX + x - 1.2, FX + x + 1.2, 8.8 + k * 0.22, 8.86 + k * 0.22, -0.6, -0.57, "seam");
  VT(`fCTs${i}`, "fRoof", 0.9, 0.82, 10.2, 10.75, "tower", { x: FX + x, z: -1.6 }); }
BOX("fAhu", "fRoof", FX + 1.5, FX + 6.5, 8.6, 9.9, -2.8, -0.8, "panel2"); for (let k = 0; k < 6; k++) BOX(`fAhuV${k}`, "fRoof", FX + 1.8 + k * 0.75, FX + 2.3 + k * 0.75, 8.9, 9.6, -0.8, -0.77, "seam");
HXC("fAhuDuct", "fRoof", 0.35, FX + 6.5, FX + 7.6, 9.2, -1.8, "steel2");
LAY("fFan", [2, 0.3, FX - 3.8, 10.6]);
for (const [i, x] of [[0, -5.5], [1, -2.2]]) { VC(`fFanHub${i}`, "fFan", 0.14, 10.45, 10.6, "dark", { x: FX + x, z: -1.6 });
  P({ id: `fFanB${i}`, layer: "fFan", shape: "box", size: [1.5, 0.03, 0.22], pos: [FX + x, 10.52, -1.6], at: [[0, 0, 0]], rot: [0, 0, 0], mat: "steel" }); P({ id: `fFanB${i}b`, layer: "fFan", shape: "box", size: [0.22, 0.03, 1.5], pos: [FX + x, 10.52, -1.6], mat: "steel" }); }

// ═════ 站 W：超純水製造（後排左→右：預處理、逆滲透；前排右→左：離子交換／電去離子、紫外線、超過濾與脫氣、儲槽）═════
const WX = 40, ZB = -2.4, ZF = 2.0;
LAY("wBase", [17, 0.4, WX, 0.15]);
BOX("wPlinth", "wBase", WX - 8.6, WX + 8.6, 0, 0.3, -4.4, 4.0, "band"); P({ id: "wPlSeam", layer: "wBase", shape: "box", size: [17.2, 0.02, 0.06], pos: [WX, 0.31, 0], at: [[0, 0, -0.3]], mat: "seam" });
BOX("wDrainCh", "wBase", WX - 2, WX + 5, 0.3, 0.34, -4.2, -3.8, "dark");
// 預處理：多介質砂濾罐、活性碳塔、加藥桶與計量泵、反洗閥組
LAY("wPre", [4, 3.6, WX - 6.4, 1.8]);
VC("wSand", "wPre", 0.8, 0.5, 3.0, "frp", { x: WX - 7.1, z: ZB }); SPH("wSandCap", "wPre", 0.8, WX - 7.1, 3.0, ZB, "frp"); ZC("wSandMan", "wPre", 0.26, ZB + 0.7, ZB + 0.92, WX - 7.1, 2.3, "steel2");
P({ id: "wSandLeg", layer: "wPre", shape: "box", size: [0.12, 0.25, 0.12], pos: [0, 0.4, 0], at: RING(3, 0.6, 90, WX - 7.1, ZB), mat: "dark" });
ZC("wSandGauge", "wPre", 0.13, ZB + 0.8, ZB + 0.86, WX - 6.6, 2.75, "steel2"); ZC("wSandGaugeF", "wPre", 0.1, ZB + 0.86, ZB + 0.88, WX - 6.6, 2.75, "panel");
VC("wCarb", "wPre", 0.65, 0.5, 2.8, "carbon", { x: WX - 5.4, z: ZB }); SPH("wCarbCap", "wPre", 0.65, WX - 5.4, 2.8, ZB, "carbon"); VT("wCarbBand", "wPre", 0.68, 0.65, 1.6, 1.68, "steel2", { x: WX - 5.4, z: ZB });
VC("wDose", "wPre", 0.3, 0.3, 1.2, "pipeW", { x: WX - 6.4, z: ZB + 1.3 }); BOX("wDosePump", "wPre", WX - 6.0, WX - 5.5, 0.3, 0.65, ZB + 1.1, ZB + 1.5, "motorR");
P({ id: "wBwValve", layer: "wPre", shape: "box", size: [0.22, 0.22, 0.22], pos: [0, 0.9, ZB + 0.95], at: [[WX - 7.1, 0, 0], [WX - 5.4, 0, 0]], mat: "steel" });
// 逆滲透：膜殼架（4 層 × 2 列白色膜殼，端蓋螺栓）、高壓泵（紅色馬達＋入口濾網）、壓力表、流量計、濃水排放管
LAY("wRO", [6, 3.4, WX - 1.0, 1.8]);
P({ id: "wRoPost", layer: "wRO", shape: "box", size: [0.1, 2.9, 0.1], pos: [0, 1.75, 0], at: [[WX - 3.6, 0, ZB - 0.75], [WX - 3.6, 0, ZB + 0.75], [WX + 1.4, 0, ZB - 0.75], [WX + 1.4, 0, ZB + 0.75]], mat: "steel" });
P({ id: "wRoRail", layer: "wRO", shape: "box", size: [5.1, 0.08, 0.08], pos: [WX - 1.1, 0, 0], at: [0.6, 3.1].flatMap((y) => [[0, y, ZB - 0.75], [0, y, ZB + 0.75]]), mat: "steel" });
for (let r = 0; r < 4; r++) for (let c = 0; c < 2; c++) { const y = 1.0 + r * 0.6, z = ZB - 0.35 + c * 0.7, id = `wRoV${r}${c}`;
  HXC(id, "wRO", 0.24, WX - 3.4, WX + 1.2, y, z, "ro"); HXC(`${id}a`, "wRO", 0.28, WX - 3.5, WX - 3.36, y, z, "steel2"); HXC(`${id}b`, "wRO", 0.28, WX + 1.16, WX + 1.3, y, z, "steel2");
  P({ id: `${id}bolt`, layer: "wRO", shape: "cyl", size: [0.03, 0.04], rot: HX, pos: [WX + 1.32, y, z], at: RING(6, 0.2).map(([dx, , dz]) => [0, dx, dz]), mat: "dark" }); }
VC("wRoHdr", "wRO", 0.09, 0.8, 3.0, "steel2", { x: WX + 1.42, z: ZB }); VC("wRoHdr2", "wRO", 0.09, 0.8, 3.0, "steel2", { x: WX - 3.6, z: ZB });
HXC("wHpMotor", "wRO", 0.33, WX + 1.8, WX + 2.9, 0.75, ZB + 1.3, "motorR"); VC("wHpVol", "wRO", 0.32, 0.4, 1.05, "steel2", { x: WX + 1.6, z: ZB + 1.3 });
P({ id: "wHpFin", layer: "wRO", shape: "box", size: [1.0, 0.04, 0.7], pos: [WX + 2.35, 0, ZB + 1.3], at: [0.5, 0.65, 0.8, 0.95].map((y) => [0, y, 0]), mat: "dark" });
BOX("wHpBase", "wRO", WX + 1.2, WX + 3.0, 0.3, 0.42, ZB + 0.9, ZB + 1.7, "dark"); VC("wHpStr", "wRO", 0.15, 0.42, 0.8, "steel", { x: WX + 1.25, z: ZB + 1.75 });
ZC("wRoGauge", "wRO", 0.12, ZB + 0.8, ZB + 0.86, WX + 1.42, 2.8, "steel2"); ZC("wRoGaugeF", "wRO", 0.09, ZB + 0.86, ZB + 0.88, WX + 1.42, 2.8, "panel");
VC("wRoFlow", "wRO", 0.07, 1.6, 2.3, "window", { x: WX - 3.75, z: ZB + 0.6 });
PIPE("wConcP", "wRO", [[WX + 1.42, 2.0, ZB - 0.4], [WX + 1.42, 2.0, ZB - 1.3], [WX + 1.42, 0.42, ZB - 1.3], [WX + 4.0, 0.42, ZB - 1.3]], 0.07, "pipeCl", { jmat: "pipeW" });
// 前排：離子交換（混床樹脂罐，正面視窗看得到樹脂珠）＋電去離子模組（片狀槽堆疊＋兩端電極＋直流電源線）
LAY("wIX", [4, 3, WX + 4.8, 1.6]);
VC("wMix", "wIX", 0.75, 0.5, 2.7, "frp", { x: WX + 5.4, z: ZF }); SPH("wMixCap", "wIX", 0.75, WX + 5.4, 2.7, ZF, "frp");
BOX("wMixWinF", "wIX", WX + 5.0, WX + 5.8, 1.0, 2.3, ZF + 0.66, ZF + 0.74, "dark"); BOX("wMixWin", "wIX", WX + 5.08, WX + 5.72, 1.08, 2.22, ZF + 0.74, ZF + 0.77, "window");
{ const bA = [], bB = []; for (let i = 0; i < 70; i++) { const p = [R2(WX + 5.12 + rnd() * 0.56), R2(1.12 + rnd() * 1.06), R2(ZF + 0.7)]; (i % 2 ? bA : bB).push(p); }
  P({ id: "wBeadA", layer: "wIX", shape: "sphere", size: [0.045], pos: [0, 0, 0], at: bA, mat: "beadA" }); P({ id: "wBeadB", layer: "wIX", shape: "sphere", size: [0.045], pos: [0, 0, 0], at: bB, mat: "beadB" }); }
P({ id: "wMixLeg", layer: "wIX", shape: "box", size: [0.12, 0.25, 0.12], pos: [0, 0.4, 0], at: RING(3, 0.55, 30, WX + 5.4, ZF), mat: "dark" });
BOX("wEdi", "wIX", WX + 3.4, WX + 4.3, 0.4, 2.0, ZF - 0.6, ZF + 0.6, "panel2");
P({ id: "wEdiPlate", layer: "wIX", shape: "box", size: [0.03, 1.5, 1.24], pos: [0, 1.2, ZF], at: Array.from({ length: 12 }, (_, i) => [R2(WX + 3.48 + i * 0.07), 0, 0]), mat: "frp" });
BOX("wEdiEl0", "wIX", WX + 3.3, WX + 3.4, 0.5, 1.9, ZF - 0.5, ZF + 0.5, "gold"); BOX("wEdiEl1", "wIX", WX + 4.3, WX + 4.4, 0.5, 1.9, ZF - 0.5, ZF + 0.5, "gold");
PIPE("wEdiCab", "wIX", [[WX + 3.35, 1.9, ZF + 0.3], [WX + 3.35, 2.4, ZF + 0.3], [WX + 4.35, 2.4, ZF + 0.3], [WX + 4.35, 1.9, ZF + 0.3]], 0.04, "motorR", { jmat: "motorR" });
// 紫外線：不鏽鋼長圓柱艙（剖開示意＝半透明殼）、兩端法蘭、石英套管、燈管（亮藍紫）
LAY("wUV", [3, 1.4, WX + 1.6, 1.2]);
HXC("wUvBody", "wUV", 0.34, WX + 0.6, WX + 2.8, 1.2, ZF, "steelCut"); HXC("wUvQz", "wUV", 0.16, WX + 0.5, WX + 2.9, 1.2, ZF, "quartz"); HXC("wUvLamp", "wUV", 0.08, WX + 0.55, WX + 2.85, 1.2, ZF, "uv");
for (const x of [WX + 0.6, WX + 2.8]) { HXC(`wUvFl${x}`, "wUV", 0.42, x - 0.06, x + 0.06, 1.2, ZF, "steel"); P({ id: `wUvB${x}`, layer: "wUV", shape: "cyl", size: [0.03, 0.05], rot: HX, pos: [x, 1.2, ZF], at: RING(8, 0.38).map(([dx, , dz]) => [0, dx, dz]), mat: "dark" }); }
P({ id: "wUvLeg", layer: "wUV", shape: "box", size: [0.14, 0.75, 0.5], pos: [0, 0.68, ZF], at: [[WX + 0.9, 0, 0], [WX + 2.5, 0, 0]], mat: "steel" });
BOX("wUvBox", "wUV", WX + 1.3, WX + 2.1, 0.3, 0.75, ZF + 0.4, ZF + 0.85, "panel2"); SPH("wUvLed", "wUV", 0.05, WX + 1.95, 0.62, ZF + 0.87, "uv");
// 脫氣膜接觸器與超過濾：四支直立超過濾模組＋端蓋、上方橫躺的脫氣接觸器、終端濾心匣
LAY("wUF", [3.6, 3, WX - 1.4, 1.5]);
for (let i = 0; i < 4; i++) { const x = WX - 2.6 + i * 0.55; VC(`wUf${i}`, "wUF", 0.2, 0.5, 2.5, "ro", { x, z: ZF - 0.2 }); VC(`wUfC${i}`, "wUF", 0.23, 2.5, 2.62, "steel2", { x, z: ZF - 0.2 }); VC(`wUfB${i}`, "wUF", 0.23, 0.42, 0.52, "steel2", { x, z: ZF - 0.2 }); }
BOX("wUfCut", "wUF", WX - 2.85, WX - 2.35, 0.9, 2.1, ZF - 0.02, ZF + 0.01, "window");
P({ id: "wUfFiber", layer: "wUF", shape: "cyl", size: [0.015, 1.1], rot: V, pos: [0, 1.5, ZF + 0.02], at: Array.from({ length: 7 }, (_, i) => [R2(WX - 2.75 + i * 0.05), 0, 0]), mat: "panel" });
HXC("wDegas", "wUF", 0.18, WX - 2.8, WX - 0.6, 2.95, ZF - 0.2, "pipeW"); HXC("wDegasC", "wUF", 0.21, WX - 2.9, WX - 2.75, 2.95, ZF - 0.2, "steel2");
VC("wPou", "wUF", 0.22, 0.4, 1.5, "steel2", { x: WX - 0.3, z: ZF + 0.5 }); VC("wPouCap", "wUF", 0.25, 1.5, 1.62, "dark", { x: WX - 0.3, z: ZF + 0.5 });
// 儲槽（氮氣封蓋）＋電阻率表（18.2 MΩ·cm）
LAY("wTank", [3, 3.6, WX - 5.6, 1.8]);
VC("wTk", "wTank", 1.0, 0.3, 3.1, "steel2", { x: WX - 5.8, z: ZF }); SPH("wTkCap", "wTank", 1.0, WX - 5.8, 3.1, ZF, "steel2");
VC("wTkN2", "wTank", 0.06, 3.9, 4.4, "pipeGreen", { x: WX - 5.8, z: ZF }); VC("wTkLvl", "wTank", 0.05, 0.6, 2.9, "window", { x: WX - 4.75, z: ZF + 0.3 });
P({ id: "wTkWeld", layer: "wTank", shape: "tube", size: [1.03, 1.0, 0.03], rot: V, pos: [WX - 5.8, 0, ZF], at: [[0, 1.2, 0], [0, 2.2, 0]], mat: "steel" });
BOX("wMeter", "wTank", WX - 4.5, WX - 3.3, 1.2, 2.2, ZF + 0.6, ZF + 0.9, "dark"); PLATE("wMeterTx", "wTank", "sign-r182", 1.0, WX - 3.9, 1.7, ZF + 0.92);
// 管線：後排進水→逆滲透（半透明＝剖開示意，看得到水流），轉到前排→離子交換→紫外線→超過濾→儲槽
const W_IN = [[WX - 8.6, 0.6, ZB + 1.0], [WX - 1.0, 0.6, ZB + 1.0]];
const W_PERM = [[WX - 1.0, 0.6, ZB + 1.0], [WX + 6.6, 0.6, ZB + 1.0], [WX + 6.6, 0.6, ZF - 0.95], [WX - 4.5, 0.6, ZF - 0.95]];
LAY("wPipe", [17, 1, WX, 0.6]);
PIPE("wPin", "wPipe", W_IN, 0.13, "pipeCl", { jmat: "pipeW" }); PIPE("wPperm", "wPipe", W_PERM, 0.13, "pipeCl", { jmat: "pipeW" });
CLAMPS("wPcl", "wPipe", [...W_IN, ...W_PERM.slice(1)], 0.13, 1.5);
for (const [i, x, z] of [[0, WX - 7.1, ZB + 1.0], [1, WX - 5.4, ZB + 1.0], [2, WX - 1.0, ZB + 1.0], [3, WX + 5.4, ZF - 0.95], [4, WX + 1.6, ZF - 0.95], [5, WX - 1.9, ZF - 0.95], [6, WX - 5.8, ZF - 0.95]])
  PIPE(`wStub${i}`, "wPipe", [[x, 0.6, z], [x, 0.6, z + (i < 3 ? -0.55 : 0.55)], [x, 0.95, z + (i < 3 ? -0.55 : 0.55)]], 0.08, "pipeW", { jmat: "pipeW" });

// ═════ 站 L：超純水循環迴路（儲槽→迴路泵→環狀主管→三個用水點→回流閥→電阻率表→回儲槽；一條關掉的死水支管長細菌）═════
const LX = 70, YL = 1.4;
LAY("lBase", [16, 0.4, LX, 0.15]); BOX("lPlinth", "lBase", LX - 8, LX + 8, 0, 0.3, -4.6, 3.6, "band");
LAY("lTank", [3, 4, LX - 5.8, 2]);
VC("lTk", "lTank", 1.1, 0.3, 3.3, "steel2", { x: LX - 5.8, z: -1.0 }); SPH("lTkCap", "lTank", 1.1, LX - 5.8, 3.3, -1.0, "steel2");
P({ id: "lTkWeld", layer: "lTank", shape: "tube", size: [1.13, 1.1, 0.03], rot: V, pos: [LX - 5.8, 0, -1.0], at: [[0, 1.3, 0], [0, 2.3, 0]], mat: "steel" });
VC("lTkN2", "lTank", 0.06, 4.2, 4.9, "pipeGreen", { x: LX - 5.8, z: -1.0 }); BOX("lTkPlate", "lTank", LX - 6.3, LX - 5.3, 2.4, 2.8, 0.08, 0.12, "gold");
VC("lTkLvl", "lTank", 0.05, 0.6, 3.1, "window", { x: LX - 4.65, z: -0.6 });
LAY("lPump", [2, 1.4, LX - 3.4, 0.8]);
BOX("lPumpBase", "lPump", LX - 4.2, LX - 2.2, 0.3, 0.45, 0.4, 1.6, "dark"); HXC("lMotor", "lPump", 0.32, LX - 3.2, LX - 2.3, 0.85, 1.0, "motorB");
P({ id: "lMotorFin", layer: "lPump", shape: "box", size: [0.8, 0.03, 0.66], pos: [LX - 2.75, 0, 1.0], at: [0.62, 0.74, 0.96, 1.08].map((y) => [0, y, 0]), mat: "dark" });
VC("lVolute", "lPump", 0.36, 0.45, 1.1, "steel2", { x: LX - 3.75, z: 1.0 }); BOX("lCoupG", "lPump", LX - 3.45, LX - 3.2, 0.6, 1.1, 0.75, 1.25, "warnY");
ZC("lFanCap", "lPump", 0.3, 1.32, 1.36, LX - 2.75, 0.85, "steel"); LAY("lFanMark", [0.6, 0.6, LX - 2.75, 0.85]); BOX("lFanMarkB", "lFanMark", LX - 2.77, LX - 2.73, 0.6, 1.1, 1.36, 1.39, "mark");
const L_LOOP = [[LX - 4.7, YL, -1.0], [LX - 4.7, YL, 1.0], [LX + 6.4, YL, 1.0], [LX + 6.4, YL, -2.6], [LX - 4.2, YL, -2.6], [LX - 4.2, YL, -1.6]];
LAY("lLoop", [12, 1, LX + 0.8, YL]);
PIPE("lMain", "lLoop", L_LOOP, 0.15, "pipeCl", { jmat: "pipeW" }); CLAMPS("lCl", "lLoop", L_LOOP, 0.15, 1.6);
P({ id: "lSup", layer: "lLoop", shape: "box", size: [0.12, YL - 0.3, 0.12], pos: [0, (YL + 0.3) / 2, 0], at: [[LX - 1, 0, 1.0], [LX + 2, 0, 1.0], [LX + 5, 0, 1.0], [LX + 6.4, 0, -0.8], [LX + 3, 0, -2.6], [LX - 1, 0, -2.6]], mat: "steel" });
for (let i = 0; i < 3; i++) { const x = LX - 1.8 + i * 3.0; PIPE(`lDrop${i}`, "lLoop", [[x, YL, -2.6], [x, YL, -3.3], [x, 2.2, -3.3]], 0.07, "pipeW", { jmat: "pipeW" });
  VC(`lPou${i}`, "lLoop", 0.14, 1.85, 2.15, "steel2", { x, z: -3.3 }); ZC(`lPouV${i}`, "lLoop", 0.1, -3.25, -3.0, x, 1.6, "lampG"); }
LAY("lTools", [10, 2.4, LX + 1.2, 1.4]);
for (let i = 0; i < 3; i++) { const x = LX - 1.8 + i * 3.0; BOX(`lT${i}`, "lTools", x - 1.2, x + 1.2, 0.3, 2.7, -4.5, -3.5, "panel"); BOX(`lTw${i}`, "lTools", x - 0.9, x + 0.2, 1.4, 2.4, -3.5, -3.47, "window");
  BOX(`lTs${i}`, "lTools", x + 0.4, x + 0.95, 1.9, 2.3, -3.5, -3.46, "screen"); BOX(`lTb${i}`, "lTools", x - 1.2, x + 1.2, 0.3, 0.5, -4.5, -3.5, "band"); SPH(`lTl${i}`, "lTools", 0.08, x + 1.0, 2.55, -3.48, "lampG");   BOX(`lTlp${i}`, "lTools", x - 1.0, x - 0.1, 0.5, 1.15, -3.5, -3.0, "steel2"); BOX(`lTfoup${i}`, "lTools", x - 0.9, x - 0.2, 1.15, 1.6, -3.45, -3.05, "panel2"); BOX(`lTfh${i}`, "lTools", x - 0.7, x - 0.4, 1.6, 1.66, -3.3, -3.2, "dark");
  VC(`lTpole${i}`, "lTools", 0.04, 2.7, 3.1, "steel", { x: x + 0.95, z: -4.0 }); VC(`lTr${i}`, "lTools", 0.08, 3.1, 3.22, "lampOff", { x: x + 0.95, z: -4.0 }); VC(`lTy${i}`, "lTools", 0.08, 3.22, 3.34, "lampY", { x: x + 0.95, z: -4.0 }); VC(`lTg${i}`, "lTools", 0.08, 3.34, 3.46, "lampG", { x: x + 0.95, z: -4.0 });
  P({ id: `lTseam${i}`, layer: "lTools", shape: "box", size: [0.03, 2.3, 0.02], pos: [0, 1.5, -3.49], at: [[x - 0.05, 0, 0], [x + 0.3, 0, 0]], mat: "seam" }); P({ id: `lTscrew${i}`, layer: "lTools", shape: "cyl", size: [0.03, 0.02], pos: [0, 0, -3.49], at: [[x - 1.1, 2.6, 0], [x + 1.1, 2.6, 0], [x - 1.1, 0.6, 0], [x + 1.1, 0.6, 0]], mat: "steel" }); }
// 回流閥（手輪）與電阻率表
LAY("lValve", [1.2, 1.2, LX - 4.2, YL]);
VC("lRvBody", "lValve", 0.24, YL - 0.25, YL + 0.25, "steel2", { x: LX - 3.2, z: -2.6 }); VC("lRvStem", "lValve", 0.04, YL + 0.25, YL + 0.7, "steel", { x: LX - 3.2, z: -2.6 });
VT("lRvWheel", "lValve", 0.3, 0.25, YL + 0.68, YL + 0.74, "estop", { x: LX - 3.2, z: -2.6 }); P({ id: "lRvSpoke", layer: "lValve", shape: "box", size: [0.5, 0.03, 0.04], pos: [LX - 3.2, YL + 0.71, -2.6], at: [[0, 0, 0]], mat: "estop" });
BOX("lMeter", "lValve", LX - 2.2, LX - 1.0, 2.0, 2.9, -2.65, -2.4, "dark"); PLATE("lMeterTx", "lValve", "sign-r182", 1.0, LX - 1.6, 2.45, -2.38); VC("lMeterProbe", "lValve", 0.05, YL, 2.0, "steel", { x: LX - 1.6, z: -2.55 });
// 死水支管：從前面主管分出、一路往前、盡頭關掉的閥（紅手柄）；裡面的細菌只在「停著不動」時長出來
LAY("lDead", [1.2, 1.2, LX + 3.0, YL]);
PIPE("lDeadP", "lDead", [[LX + 3.0, YL, 1.0], [LX + 3.0, YL, 2.9]], 0.15, "pipeCl", { jmat: "pipeW" }); VC("lDeadV", "lDead", 0.24, YL - 0.22, YL + 0.22, "steel2", { x: LX + 3.0, z: 3.05 });
BOX("lDeadH", "lDead", LX + 2.75, LX + 3.25, YL + 0.24, YL + 0.3, 2.95, 3.15, "estop"); BOX("lDeadTag", "lDead", LX + 3.2, LX + 3.6, YL - 0.1, YL + 0.2, 3.1, 3.12, "warnY");
LAY("lBact", [0.6, 0.6, LX + 3.0, YL]);
P({ id: "lBactC", layer: "lBact", shape: "sphere", size: [0.05], pos: [0, 0, 0], at: Array.from({ length: 26 }, () => [R2(LX + 3.0 + (rnd() - 0.5) * 0.18), R2(YL + (rnd() - 0.5) * 0.18), R2(1.4 + rnd() * 1.4)]), mat: "bact" });

// ═════ 站 T：台積電廠房外觀（s4 原水槽＋廠牌＋國旗；s7 屋頂冷卻塔＋冰水主機房）═════
const TX = 100;
LAY("tBase", [26, 0.3, TX, 0.1]); BOX("tPave", "tBase", TX - 13, TX + 12, 0, 0.12, -4.5, 4.5, "panel2");
LAY("tBldg", [11, 7, TX, 3.5]);
BOX("tB", "tBldg", TX - 5.0, TX + 6.0, 0.12, 6.5, -3.8, 2.4, "ext"); BOX("tBPar", "tBldg", TX - 5.1, TX + 6.1, 6.5, 6.8, -3.9, 2.5, "panel");
BOX("tBWin1", "tBldg", TX - 4.6, TX + 5.6, 4.2, 5.2, 2.4, 2.44, "glassDark"); BOX("tBWin2", "tBldg", TX - 4.6, TX + 5.6, 1.8, 2.6, 2.4, 2.44, "glassDark");
P({ id: "tBSeam", layer: "tBldg", shape: "box", size: [0.05, 6.3, 0.04], pos: [0, 3.3, 2.45], at: [-3, -1, 1, 3, 5].map((d) => [TX + d, 0, 0]), mat: "seam" });
BOX("tBDoor", "tBldg", TX - 0.8, TX + 0.8, 0.12, 1.5, 2.4, 2.46, "dark"); BOX("tBCanopy", "tBldg", TX - 1.4, TX + 1.4, 1.6, 1.72, 2.4, 3.2, "steel2");
for (let i = 0; i < 5; i++) BOX(`tBLv${i}`, "tBldg", TX + 2.4, TX + 5.2, 0.4 + i * 0.2, 0.48 + i * 0.2, 2.4, 2.48, "seam");
BOX("tSignBg", "tBldg", TX - 4.6, TX - 1.4, 2.9, 4.0, 2.44, 2.47, "panel"); PLATE("tSign", "tBldg", "sign-tsmc", 1.3, TX - 3.0, 3.45, 2.48);
FLAGPOLE("tFlag", "tBldg", "TW", TX + 6.8, 3.4, 6.4, 1.6); FLAGPOLE("tFlag2", "tBldg", "TW", TX - 5.7, 3.4, 6.0, 1.5);
// 原水槽：兩座大槽（爬梯、頂欄、液位計、人孔、銘板），進水管從左邊進來
LAY("tTank", [7, 4.5, TX - 9.0, 2.2]);
for (const [i, x, z] of [[0, TX - 10.6, -1.4], [1, TX - 7.6, 0.6]]) { VC(`tTk${i}`, "tTank", 1.35, 0.12, 4.3, "tankP", { x, z }); VC(`tTkLv${i}`, "tTank", 0.06, 0.4, 4.0, "window", { x: x - 0.95, z: z + 0.95 }); VC(`tTkLvW${i}`, "tTank", 0.04, 0.4, 3.2, "pipeBlue", { x: x - 0.95, z: z + 0.95 });
  VC(`tTkTop${i}`, "tTank", 1.4, 4.3, 4.42, "steel2", { x, z }); VT(`tTkRail${i}`, "tTank", 1.4, 1.36, 4.42, 4.8, "warnY", { x, z });
  P({ id: `tTkHoop${i}`, layer: "tTank", shape: "tube", size: [1.38, 1.35, 0.05], rot: V, pos: [x, 0, z], at: [[0, 1.2, 0], [0, 2.4, 0], [0, 3.6, 0]], mat: "steel" });
  BOX(`tTkLad${i}`, "tTank", x + 1.36, x + 1.42, 0.12, 4.8, z - 0.25, z + 0.25, "dark"); P({ id: `tTkRung${i}`, layer: "tTank", shape: "box", size: [0.06, 0.04, 0.5], pos: [x + 1.4, 0, z], at: Array.from({ length: 14 }, (_, k) => [0, 0.4 + k * 0.32, 0]), mat: "steel" });
  ZC(`tTkMan${i}`, "tTank", 0.3, z + 1.3, z + 1.5, x, 0.8, "steel2"); BOX(`tTkPl${i}`, "tTank", x - 0.4, x + 0.4, 2.0, 2.4, z + 1.33, z + 1.37, "gold"); }
const T_IN = [[TX - 13.5, 0.6, 2.6], [TX - 7.6, 0.6, 2.6], [TX - 7.6, 0.6, 1.9]];
PIPE("tInP", "tTank", T_IN, 0.18, "pipeCl", { jmat: "pipeW" }); CLAMPS("tInCl", "tTank", T_IN, 0.18, 1.4);
PIPE("tLink", "tTank", [[TX - 9.3, 0.5, -0.4], [TX - 9.3, 0.5, 0.2], [TX - 8.9, 0.5, 0.2]], 0.12, "pipeW", { jmat: "pipeW" }); PIPE("tToB", "tTank", [[TX - 6.25, 0.5, 0.6], [TX - 5.0, 0.5, 0.6]], 0.14, "pipeBlue");
// 屋頂冷卻塔（s7 從屋頂抬起：冷卻水管往下接冰水主機房）
LAY("tTower", [8, 4, TX - 0.5, 8]);
for (const [i, x] of [[0, TX - 2.8], [1, TX + 1.8]]) { BOX(`tCT${i}`, "tTower", x - 1.5, x + 1.5, 6.8, 8.8, -3.0, -0.4, "tower");
  for (let k = 0; k < 6; k++) BOX(`tCTl${i}_${k}`, "tTower", x - 1.4, x + 1.4, 7.0 + k * 0.25, 7.08 + k * 0.25, -0.4, -0.36, "seam");
  BOX(`tCTfill${i}`, "tTower", x - 1.3, x + 1.3, 7.0, 8.4, -0.36, -0.34, "window");
  VT(`tCTs${i}`, "tTower", 1.05, 0.96, 8.8, 9.5, "tower", { x, z: -1.7 }); VT(`tCTsR${i}`, "tTower", 1.1, 0.96, 9.42, 9.52, "steel2", { x, z: -1.7 }); BOX(`tCTpl${i}`, "tTower", x + 0.6, x + 1.3, 7.1, 7.4, -0.34, -0.32, "gold"); }
const T_CW = [[TX + 1.8, 7.0, -0.4], [TX + 1.8, 7.0, 0.5], [TX + 6.4, 7.0, 0.5], [TX + 6.4, 2.4, 0.5]];
const T_CW2 = [[TX - 2.8, 6.9, -0.4], [TX - 2.8, 6.9, 0.9], [TX + 6.8, 6.9, 0.9], [TX + 6.8, 2.0, 0.9]];
PIPE("tCwP", "tTower", T_CW, 0.13, "cond", { jmat: "cond" }); PIPE("tCwP2", "tTower", T_CW2, 0.13, "cond", { jmat: "cond" }); CLAMPS("tCwCl", "tTower", T_CW2, 0.13, 1.3);
LAY("tFan", [5, 0.3, TX - 0.5, 9.2]);
for (const [i, x] of [[0, TX - 2.8], [1, TX + 1.8]]) { VC(`tFanHub${i}`, "tFan", 0.16, 9.0, 9.2, "dark", { x, z: -1.7 }); P({ id: `tFanB${i}`, layer: "tFan", shape: "box", size: [1.8, 0.03, 0.26], pos: [x, 9.1, -1.7], mat: "steel" }); P({ id: `tFanC${i}`, layer: "tFan", shape: "box", size: [0.26, 0.03, 1.8], pos: [x, 9.1, -1.7], mat: "steel" }); }
// 冰水主機房（剖開）：蒸發器（藍）、冷凝器（橘）、壓縮機、控制面板、兩台泵、保溫冰水管進廠房
LAY("tChill", [5, 3.4, TX + 8.5, 1.6]);
BOX("tChFloor", "tChill", TX + 6.2, TX + 11.0, 0.12, 0.25, -2.4, 2.2, "panel2"); BOX("tChWall", "tChill", TX + 6.2, TX + 11.0, 0.25, 3.4, -2.4, -2.2, "ext"); BOX("tChRoof", "tChill", TX + 6.2, TX + 11.0, 3.4, 3.6, -2.4, 2.2, "ext");
BOX("tChSide", "tChill", TX + 10.8, TX + 11.0, 0.25, 3.4, -2.4, 2.2, "ext");
HXC("tEvap", "tChill", 0.42, TX + 7.0, TX + 10.0, 0.85, -0.6, "chill"); HXC("tCond", "tChill", 0.42, TX + 7.0, TX + 10.0, 1.85, -0.6, "cond");
P({ id: "tShellEnd", layer: "tChill", shape: "cyl", size: [0.46, 0.12], rot: HX, pos: [0, 0, -0.6], at: [[TX + 6.95, 0.85, 0], [TX + 10.05, 0.85, 0], [TX + 6.95, 1.85, 0], [TX + 10.05, 1.85, 0]], mat: "steel" });
VC("tComp", "tChill", 0.36, 2.25, 2.95, "dark", { x: TX + 8.4, z: -0.6 }); BOX("tChPanel", "tChill", TX + 9.4, TX + 10.4, 0.25, 2.0, -2.2, -1.8, "panel"); BOX("tChScr", "tChill", TX + 9.55, TX + 10.25, 1.4, 1.8, -1.8, -1.77, "screen");
for (const [i, x] of [[0, TX + 7.4], [1, TX + 8.8]]) { HXC(`tPm${i}`, "tChill", 0.22, x - 0.4, x + 0.3, 0.55, 1.3, "motorB"); VC(`tPv${i}`, "tChill", 0.22, 0.25, 0.75, "steel2", { x: x - 0.55, z: 1.3 }); }
const T_CHW = [[TX + 7.0, 0.85, -0.6], [TX + 6.5, 0.85, -0.6], [TX + 6.5, 0.85, 1.6], [TX + 6.0, 0.85, 1.6]];
PIPE("tChwP", "tChill", T_CHW, 0.14, "insul", { jmat: "insul" });
const T_CWIN = [[TX + 6.4, 2.4, 0.5], [TX + 6.4, 1.85, 0.5], [TX + 7.0, 1.85, 0.5], [TX + 7.0, 1.85, -0.6]];
PIPE("tCwIn", "tChill", T_CWIN, 0.13, "cond", { jmat: "cond" });

// ═════ 站 E：電力（地下 161 kV 進線→變壓器→開關櫃→敏感機台；後方不斷電系統＋電池架，s6 推進來）═════
const EX = 135;
LAY("eBase", [18, 0.4, EX, 0.12]); BOX("ePlinth", "eBase", EX - 9, EX + 9, 0, 0.25, -5.0, 3.6, "band");
BOX("eTrench", "eBase", EX - 9, EX - 5.6, 0.25, 0.3, 1.6, 2.8, "dark"); BOX("eTrenchG", "eBase", EX - 9, EX - 5.6, 0.3, 0.32, 1.6, 2.8, "grate");
BOX("eWall", "eBase", EX - 9, EX + 9, 0.25, 4.8, -5.2, -5.0, "panel"); P({ id: "eLampBar", layer: "eBase", shape: "box", size: [3.0, 0.14, 0.1], pos: [0, 4.4, -4.95], at: [-6, -2, 2, 6].map((d) => [EX + d, 0, 0]), mat: "ffu" });
LAY("eLights", [16, 0.4, EX, 4.4]); P({ id: "eLampGlow", layer: "eLights", shape: "box", size: [2.9, 0.1, 0.06], pos: [0, 4.4, -4.88], at: [-6, -2, 2, 6].map((d) => [EX + d, 0, 0]), mat: "edge" });
// 變壓器：油箱、散熱片排、三支套管（瓷裙）、儲油櫃、銘板、接地排
LAY("eTrans", [3, 3.4, EX - 6.0, 1.7]);
BOX("eTk", "eTrans", EX - 7.2, EX - 4.8, 0.25, 2.4, -1.6, 0.6, "trans"); BOX("eTkLid", "eTrans", EX - 7.3, EX - 4.7, 2.4, 2.52, -1.7, 0.7, "steel");
P({ id: "eFin", layer: "eTrans", shape: "box", size: [0.05, 1.8, 0.55], pos: [0, 1.35, 0.95], at: Array.from({ length: 12 }, (_, i) => [R2(EX - 7.05 + i * 0.2), 0, 0]), mat: "trans" });
BOX("eFinHdr", "eTrans", EX - 7.15, EX - 4.85, 2.2, 2.3, 0.65, 1.25, "steel");
for (let i = 0; i < 3; i++) { const x = EX - 6.6 + i * 0.6; VC(`eBu${i}`, "eTrans", 0.1, 2.52, 3.5, "porc", { x, z: -0.5 });
  P({ id: `eBuS${i}`, layer: "eTrans", shape: "tube", size: [0.2, 0.1, 0.05], rot: V, pos: [x, 0, -0.5], at: [2.7, 2.9, 3.1, 3.3].map((y) => [0, y, 0]), mat: "porc" }); SPH(`eBuT${i}`, "eTrans", 0.08, x, 3.52, -0.5, "gold"); }
HXC("eCons", "eTrans", 0.3, EX - 7.0, EX - 5.4, 3.1, -1.3, "trans"); P({ id: "eConsLeg", layer: "eTrans", shape: "box", size: [0.08, 0.58, 0.08], pos: [0, 2.8, -1.3], at: [[EX - 6.8, 0, 0], [EX - 5.6, 0, 0]], mat: "steel" });
BOX("eTkPlate", "eTrans", EX - 6.4, EX - 5.6, 1.4, 1.8, 0.6, 0.64, "gold"); BOX("eTkGnd", "eTrans", EX - 7.25, EX - 7.2, 0.3, 1.6, 0.2, 0.3, "gold"); BOX("eTkWarn", "eTrans", EX - 5.5, EX - 5.0, 0.6, 1.0, 0.6, 0.63, "warnY");
// 開關櫃：四面櫃（門縫、把手、三顆燈、銘板、單線圖色條），第二面有電壓表（指針會擺）
LAY("eSwg", [4.6, 2.6, EX - 1.4, 1.4]);
for (let i = 0; i < 4; i++) { const x0 = EX - 3.6 + i * 1.1; BOX(`eSg${i}`, "eSwg", x0, x0 + 1.05, 0.25, 2.65, -1.2, 0.1, "panel2"); BOX(`eSgD${i}`, "eSwg", x0 + 0.06, x0 + 0.99, 0.35, 2.2, 0.1, 0.13, "panel");
  BOX(`eSgH${i}`, "eSwg", x0 + 0.85, x0 + 0.92, 1.0, 1.5, 0.13, 0.18, "steel"); BOX(`eSgM${i}`, "eSwg", x0 + 0.1, x0 + 0.95, 2.3, 2.36, 0.1, 0.14, "cable");
  P({ id: `eSgL${i}`, layer: "eSwg", shape: "sphere", size: [0.045], pos: [x0 + 0.25, 2.45, 0.12], at: [[0, 0, 0], [0.18, 0, 0], [0.36, 0, 0]], mat: i === 3 ? "lampY" : "lampG" });
  BOX(`eSgP${i}`, "eSwg", x0 + 0.2, x0 + 0.6, 0.5, 0.7, 0.13, 0.15, "gold"); for (let k = 0; k < 3; k++) BOX(`eSgV${i}_${k}`, "eSwg", x0 + 0.2, x0 + 0.7, 0.85 + k * 0.08, 0.88 + k * 0.08, 0.13, 0.15, "dark"); }
ZC("eVm", "eSwg", 0.42, 0.13, 0.17, EX - 2.0, 1.75, "panel"); P({ id: "eVmRim", layer: "eSwg", shape: "tube", size: [0.46, 0.41, 0.06], pos: [EX - 2.0, 1.75, 0.17], mat: "dark" }); P({ id: "eVmRed", layer: "eSwg", shape: "box", size: [0.16, 0.05, 0.01], pos: [EX - 2.24, 1.96, 0.18], rot: [0, 0, 35], mat: "lampR" });
P({ id: "eVmTick", layer: "eSwg", shape: "box", size: [0.02, 0.06, 0.02], pos: [0, 0, 0.18], at: [-50, -25, 0, 25, 50].map((a) => [R2(EX - 2.0 + 0.33 * Math.sin(a * D2R)), R2(1.75 + 0.33 * Math.cos(a * D2R)), 0]), mat: "dark" });
LAY("eNeedle", [0.6, 0.6, EX - 2.0, 1.75]); BOX("eNdl", "eNeedle", EX - 2.02, EX - 1.98, 1.75, 2.08, 0.185, 0.2, "estop"); ZC("eNdlHub", "eNeedle", 0.05, 0.18, 0.21, EX - 2.0, 1.75, "dark");
// 敏感機台：機殼、視窗、螢幕、裝載口、燈塔（綠＝正常、紅＝當機）
LAY("eTool", [3, 3, EX + 4.0, 1.5]);
BOX("eTl", "eTool", EX + 2.6, EX + 5.4, 0.25, 2.5, -1.4, 0.6, "panel"); BOX("eTlB", "eTool", EX + 2.6, EX + 5.4, 0.25, 0.45, -1.4, 0.6, "band");
BOX("eTlW", "eTool", EX + 2.9, EX + 4.2, 1.2, 2.2, 0.6, 0.63, "window"); BOX("eTlS", "eTool", EX + 4.4, EX + 5.1, 1.6, 2.1, 0.6, 0.64, "screen"); BOX("eTlLp", "eTool", EX + 2.8, EX + 4.3, 0.45, 0.85, 0.6, 1.2, "steel2");
for (let k = 0; k < 4; k++) BOX(`eTlV${k}`, "eTool", EX + 4.4, EX + 5.1, 0.6 + k * 0.1, 0.64 + k * 0.1, 0.6, 0.63, "dark");
VC("eTwr", "eTool", 0.05, 2.5, 3.0, "steel", { x: EX + 5.1, z: 0.3 });
for (const [k, y] of [[0, 3.05], [1, 3.25], [2, 3.45]]) VC(`eTwrC${k}`, "eTool", 0.12, y - 0.09, y + 0.09, "lampOff", { x: EX + 5.1, z: 0.3 });
LAY("eLampG", [0.3, 0.3, EX + 5.1, 3.05]); VC("eLg", "eLampG", 0.125, 2.96, 3.14, "lampG", { x: EX + 5.1, z: 0.3 });
LAY("eLampR", [0.3, 0.3, EX + 5.1, 3.45]); VC("eLr", "eLampR", 0.125, 3.36, 3.54, "lampR", { x: EX + 5.1, z: 0.3 });
// 電纜：地下溝（進線）→變壓器套管；變壓器→電纜架→開關櫃→機台
const E_HV = [[EX - 9, 0.28, 2.2], [EX - 6.0, 0.28, 2.2], [EX - 6.0, 0.28, 1.4], [EX - 6.0, 3.7, 1.4], [EX - 6.0, 3.7, -0.5]];
const E_LV = [[EX - 5.4, 3.52, -0.5], [EX - 5.4, 3.0, -0.5], [EX - 3.6, 3.0, -0.5], [EX + 0.8, 3.0, -0.5], [EX + 3.8, 3.0, -0.5], [EX + 3.8, 2.5, -0.5]];
LAY("eCable", [16, 4, EX - 2, 2]);
PIPE("eHv", "eCable", E_HV, 0.11, "cable", { jmat: "cable" }); PIPE("eLv", "eCable", E_LV, 0.09, "cable", { jmat: "cable" });
BOX("eTray", "eCable", EX - 5.6, EX + 4.2, 2.86, 2.92, -0.8, -0.2, "steel"); P({ id: "eTrayHang", layer: "eCable", shape: "box", size: [0.05, 1.85, 0.05], pos: [0, 3.85, -0.8], at: [-5, -2, 1, 4].map((d) => [EX + d, 0, 0]), mat: "steel" });
// 不斷電系統：兩座 UPS 櫃（螢幕、格柵、指示燈）、靜態切換開關、兩座電池架（4 層×5 顆，端子＋連接片）、到機台的電纜
const UZ = -3.6;
LAY("eUPS", [9, 2.6, EX + 1.6, 1.4]);
for (let i = 0; i < 2; i++) { const x0 = EX - 2.6 + i * 1.4; BOX(`eUp${i}`, "eUPS", x0, x0 + 1.3, 0.25, 2.5, UZ - 0.6, UZ + 0.5, "ups"); BOX(`eUpS${i}`, "eUPS", x0 + 0.25, x0 + 1.05, 1.7, 2.2, UZ + 0.5, UZ + 0.53, "screen");
  for (let k = 0; k < 6; k++) BOX(`eUpG${i}_${k}`, "eUPS", x0 + 0.2, x0 + 1.1, 0.5 + k * 0.12, 0.55 + k * 0.12, UZ + 0.5, UZ + 0.53, "dark");
  P({ id: `eUpL${i}`, layer: "eUPS", shape: "sphere", size: [0.045], pos: [x0 + 0.3, 1.45, UZ + 0.53], at: [[0, 0, 0], [0.2, 0, 0]], mat: "lampG" }); }
PLATE("eUpTag", "eUPS", "sign-upsTag", 1.3, EX - 1.25, 2.85, UZ + 0.52); BOX("eUpTagBg", "eUPS", EX - 2.0, EX - 0.5, 2.55, 3.15, UZ + 0.48, UZ + 0.51, "panel");
BOX("eSts", "eUPS", EX + 0.3, EX + 1.1, 0.25, 2.0, UZ - 0.4, UZ + 0.4, "panel2"); SPH("eStsL", "eUPS", 0.06, EX + 0.7, 1.7, UZ + 0.42, "lampG");
for (let r = 0; r < 2; r++) { const x0 = EX + 1.6 + r * 2.0; P({ id: `eRk${r}`, layer: "eUPS", shape: "box", size: [0.06, 2.4, 0.06], pos: [0, 1.45, 0], at: [[x0, 0, UZ - 0.45], [x0, 0, UZ + 0.45], [x0 + 1.8, 0, UZ - 0.45], [x0 + 1.8, 0, UZ + 0.45]], mat: "steel" });
  for (let s = 0; s < 4; s++) { const y = 0.4 + s * 0.58; BOX(`eRkS${r}_${s}`, "eUPS", x0, x0 + 1.8, y, y + 0.05, UZ - 0.45, UZ + 0.45, "steel");
    P({ id: `eBt${r}_${s}`, layer: "eUPS", shape: "box", size: [0.3, 0.36, 0.7], pos: [0, y + 0.23, UZ], at: Array.from({ length: 5 }, (_, k) => [R2(x0 + 0.2 + k * 0.35), 0, 0]), mat: "batt" });
    P({ id: `eBtT${r}_${s}`, layer: "eUPS", shape: "cyl", size: [0.03, 0.05], rot: V, pos: [0, y + 0.43, UZ + 0.25], at: Array.from({ length: 10 }, (_, k) => [R2(x0 + 0.12 + Math.floor(k / 2) * 0.35 + (k % 2) * 0.16), 0, 0]), mat: "gold" });
    BOX(`eBtLk${r}_${s}`, "eUPS", x0 + 0.25, x0 + 1.6, y + 0.44, y + 0.46, UZ + 0.22, UZ + 0.28, "steel"); } }
const E_UPS = [[EX + 5.4, 0.9, UZ + 0.2], [EX + 5.8, 0.9, UZ + 0.2], [EX + 5.8, 2.75, UZ + 0.2], [EX - 1.25, 2.75, UZ + 0.2], [EX - 1.25, 2.75, -0.5], [EX + 3.8, 2.75, -0.5]];
PIPE("eUpC", "eUPS", E_UPS, 0.08, "cable", { jmat: "cable" });

// ═════ 站 G：氣體（廠外空氣分離廠：冷箱內的蒸餾塔、空壓機房、液氮槽、空溫式汽化器 → 地下管線 → 進廠減壓站 → 閥箱 → 機台）═════
const GX = 170;
LAY("gBase", [24, 0.3, GX, 0.1]); BOX("gPave", "gBase", GX - 11.5, GX + 11.5, 0, 0.12, -4.0, 3.6, "panel2"); BOX("gFence", "gBase", GX - 11.5, GX + 3.2, 0.12, 0.2, 3.3, 3.5, "warnY");
LAY("gAsu", [5, 7.4, GX - 8.4, 3.6]);
BOX("gCbFrame", "gAsu", GX - 10.0, GX - 7.8, 0.12, 7.2, -2.6, -0.4, "aluCut"); P({ id: "gCbEdge", layer: "gAsu", shape: "box", size: [0.08, 7.1, 0.08], pos: [0, 3.66, 0], at: [[GX - 10.0, 0, -0.4], [GX - 7.8, 0, -0.4], [GX - 10.0, 0, -2.6], [GX - 7.8, 0, -2.6]], mat: "steel" });
P({ id: "gCbRib", layer: "gAsu", shape: "box", size: [2.3, 0.06, 0.06], pos: [GX - 8.9, 0, -0.38], at: [1.5, 3, 4.5, 6, 7.2].map((y) => [0, y, 0]), mat: "steel" });
VC("gCol", "gAsu", 0.45, 0.6, 6.8, "steel2", { x: GX - 8.9, z: -1.5 }); P({ id: "gTray", layer: "gAsu", shape: "tube", size: [0.47, 0.42, 0.05], rot: V, pos: [GX - 8.9, 0, -1.5], at: Array.from({ length: 14 }, (_, k) => [0, 0.9 + k * 0.42, 0]), mat: "dark" });
SPH("gColTop", "gAsu", 0.45, GX - 8.9, 6.8, -1.5, "steel2"); BOX("gCbPlate", "gAsu", GX - 9.6, GX - 8.2, 1.2, 1.6, -0.36, -0.33, "gold");
BOX("gComp", "gAsu", GX - 7.4, GX - 5.4, 0.12, 2.0, -2.6, -0.6, "panel"); for (let k = 0; k < 5; k++) BOX(`gCompV${k}`, "gAsu", GX - 7.2, GX - 5.6, 0.5 + k * 0.22, 0.58 + k * 0.22, -0.6, -0.57, "seam");
BOX("gIntake", "gAsu", GX - 7.1, GX - 5.7, 2.0, 2.6, -2.2, -1.0, "steel2"); HXC("gAirP", "gAsu", 0.16, GX - 7.8, GX - 7.4, 1.0, -1.5, "steel2");
// 液氮槽（雙層真空夾套、四支腳、頂部安全閥、增壓盤管）
LAY("gTank", [2.2, 5.4, GX - 4.6, 2.8]);
VC("gLn", "gTank", 0.8, 0.9, 5.0, "ln", { x: GX - 4.6, z: 0.6 }); SPH("gLnTop", "gTank", 0.8, GX - 4.6, 5.0, 0.6, "ln"); SPH("gLnBot", "gTank", 0.8, GX - 4.6, 0.9, 0.6, "ln");
P({ id: "gLnLeg", layer: "gTank", shape: "box", size: [0.12, 0.85, 0.12], pos: [0, 0.55, 0], at: RING(4, 0.72, 45, GX - 4.6, 0.6), mat: "steel" });
P({ id: "gLnJacket", layer: "gTank", shape: "tube", size: [0.82, 0.8, 0.04], rot: V, pos: [GX - 4.6, 0, 0.6], at: [[0, 2.0, 0], [0, 3.2, 0], [0, 4.4, 0]], mat: "seam" });
VC("gLnRv", "gTank", 0.06, 5.75, 6.2, "steel", { x: GX - 4.6, z: 0.6 }); BOX("gLnPlate", "gTank", GX - 4.95, GX - 4.25, 2.4, 2.8, 1.38, 1.42, "gold");
P({ id: "gLnCoil", layer: "gTank", shape: "tube", size: [0.12, 0.08, 0.06], rot: [0, 0, 0], pos: [0, 0.55, 0], at: [[GX - 3.7, 0, 0.3], [GX - 3.7, 0.15, 0.3], [GX - 3.7, 0.3, 0.3]], mat: "steel2" });
// 空溫式汽化器（兩組星形鰭片柱）＋底部結霜
LAY("gVap", [2, 3.4, GX - 2.6, 1.7]);
for (const [i, x] of [[0, GX - 3.0], [1, GX - 2.2]]) { VC(`gVc${i}`, "gVap", 0.06, 0.3, 3.2, "alu", { x, z: 1.6 });
  for (const a of [0, 60, 120]) P({ id: `gVf${i}_${a}`, layer: "gVap", shape: "box", size: [0.55, 2.9, 0.03], pos: [x, 1.75, 1.6], rot: [0, a, 0], mat: "alu" });
  VC(`gVfrost${i}`, "gVap", 0.3, 0.3, 1.0, "frost", { x, z: 1.6 }); }
BOX("gVapBase", "gVap", GX - 3.5, GX - 1.7, 0.12, 0.3, 1.1, 2.1, "dark");
// 地下管線：一塊剖開的土層（半透明）＋裡面的管子＋地面標示樁
LAY("gGround", [7, 1.4, GX + 0.4, 0.7]);
BOX("gSoil", "gGround", GX - 2.6, GX + 3.6, 0.12, 1.3, 0.9, 2.4, "soil"); BOX("gSoilTop", "gGround", GX - 2.6, GX + 3.6, 1.3, 1.36, 0.9, 2.4, "soilD");
P({ id: "gMarker", layer: "gGround", shape: "box", size: [0.1, 0.6, 0.1], pos: [0, 1.66, 1.0], at: [-1.5, 0.5, 2.5].map((d) => [GX + d, 0, 0]), mat: "warnY" });
// 進廠減壓站：調壓閥（圓頂）、壓力表、手輪閥、法蘭
LAY("gReg", [1.6, 2, GX + 4.4, 1.2]);
BOX("gRegFrame", "gReg", GX + 3.7, GX + 5.1, 0.12, 0.25, 0.9, 2.3, "dark"); P({ id: "gRegPost", layer: "gReg", shape: "box", size: [0.06, 1.8, 0.06], pos: [0, 1.15, 0], at: [[GX + 3.75, 0, 1.0], [GX + 5.05, 0, 1.0]], mat: "steel" });
for (const [i, x] of [[0, GX + 4.1], [1, GX + 4.7]]) { VC(`gRb${i}`, "gReg", 0.14, 1.3, 1.62, "steel2", { x, z: 1.6 }); SPH(`gRd${i}`, "gReg", 0.18, x, 1.78, 1.6, "steel"); ZC(`gRg${i}`, "gReg", 0.1, 1.72, 1.78, x, 2.2, "panel"); VC(`gRgS${i}`, "gReg", 0.03, 1.62, 2.12, "steel", { x, z: 1.7 }); }
VT("gRegWheel", "gReg", 0.2, 0.16, 1.95, 2.0, "estop", { x: GX + 5.0, z: 1.6 });
// 廠房牆（剖開）＋閥箱（門窗、閥件、壓力表、氣體色標、洩漏偵測燈）＋機台
LAY("gFab", [5, 4.6, GX + 7.8, 2.2]);
BOX("gWall", "gFab", GX + 5.6, GX + 5.9, 0.12, 4.6, -3.0, 0.9, "ext"); BOX("gWall2", "gFab", GX + 5.6, GX + 5.9, 2.3, 4.6, 0.9, 2.6, "ext"); BOX("gFabFloor", "gFab", GX + 5.9, GX + 11.0, 0.12, 0.25, -3.0, 2.6, "panel2");
BOX("gFabRoof", "gFab", GX + 5.6, GX + 11.0, 4.6, 4.8, -3.0, 2.6, "ext"); BOX("gFabBack", "gFab", GX + 5.9, GX + 11.0, 0.25, 4.6, -3.0, -2.8, "panel");
BOX("gVmb", "gFab", GX + 6.4, GX + 7.6, 0.25, 2.7, -1.9, -0.9, "panel"); BOX("gVmbW", "gFab", GX + 6.55, GX + 7.45, 1.4, 2.5, -0.9, -0.87, "window");
P({ id: "gVmbG", layer: "gFab", shape: "cyl", size: [0.09, 0.04], pos: [GX + 6.75, 1.1, -0.86], at: [[0, 0, 0], [0.3, 0, 0], [0.6, 0, 0]], mat: "steel2" });
P({ id: "gVmbTag", layer: "gFab", shape: "box", size: [0.2, 0.08, 0.02], pos: [GX + 6.75, 0.8, -0.86], at: [[0, 0, 0], [0.3, 0, 0], [0.6, 0, 0]], mat: "pipeGreen" });
P({ id: "gVmbVal", layer: "gFab", shape: "box", size: [0.1, 0.18, 0.1], pos: [GX + 6.75, 2.0, -1.1], at: [[0, 0, 0], [0.3, 0, 0], [0.6, 0, 0]], mat: "steel" });
VC("gVmbPur", "gFab", 0.12, 1.5, 2.35, "steel2", { x: GX + 7.25, z: -1.15 }); VC("gVmbPurC", "gFab", 0.14, 2.35, 2.42, "dark", { x: GX + 7.25, z: -1.15 });
P({ id: "gVmbReg", layer: "gFab", shape: "sphere", size: [0.1], pos: [GX + 6.75, 2.3, -1.1], at: [[0, 0, 0], [0.3, 0, 0]], mat: "steel" }); P({ id: "gVmbFace", layer: "gFab", shape: "cyl", size: [0.07, 0.02], pos: [GX + 6.75, 1.1, -0.83], at: [[0, 0, 0], [0.3, 0, 0], [0.6, 0, 0]], mat: "panel" });
P({ id: "gVmbHandle", layer: "gFab", shape: "box", size: [0.2, 0.05, 0.05], pos: [GX + 6.75, 1.95, -0.95], at: [[0, 0, 0], [0.3, 0, 0], [0.6, 0, 0]], mat: "estop" }); BOX("gVmbPlate", "gFab", GX + 6.5, GX + 7.0, 0.4, 0.6, -0.9, -0.87, "gold"); BOX("gVmbWarn", "gFab", GX + 7.05, GX + 7.45, 0.4, 0.65, -0.9, -0.87, "warnY");
LAY("gLeak", [0.3, 0.3, GX + 7.45, 2.6]); SPH("gLeakL", "gLeak", 0.08, GX + 7.45, 2.6, -0.85, "lampG");
BOX("gTl", "gFab", GX + 8.3, GX + 10.6, 0.25, 2.5, -2.2, 0.2, "panel"); BOX("gTlB", "gFab", GX + 8.3, GX + 10.6, 0.25, 0.45, -2.2, 0.2, "band");
BOX("gTlW", "gFab", GX + 8.6, GX + 9.7, 1.2, 2.2, 0.2, 0.23, "window"); BOX("gTlS", "gFab", GX + 9.9, GX + 10.4, 1.6, 2.1, 0.2, 0.24, "screen"); SPH("gTlL", "gFab", 0.08, GX + 10.4, 2.62, -0.2, "lampG");
for (let k = 0; k < 4; k++) BOX(`gTlV${k}`, "gFab", GX + 9.9, GX + 10.4, 0.6 + k * 0.1, 0.64 + k * 0.1, 0.2, 0.23, "dark");
BOX("gRack", "gFab", GX + 5.9, GX + 10.6, 3.15, 3.22, -1.5, -0.9, "steel"); P({ id: "gRackHang", layer: "gFab", shape: "box", size: [0.05, 1.4, 0.05], pos: [0, 3.9, -1.2], at: [7, 9, 10.4].map((d) => [GX + d, 0, 0]), mat: "steel" });
// 氣體管線（半透明＝剖開示意，看得到氮氣）：汽化器出口→地面下→減壓站→穿牆→天花板管架→閥箱→機台
const G_N2 = [[GX - 2.6, 3.0, 1.6], [GX - 2.6, 3.0, 1.65], [GX - 1.9, 3.0, 1.65], [GX - 1.9, 0.6, 1.65], [GX + 4.1, 0.6, 1.65], [GX + 4.1, 1.3, 1.65], [GX + 4.1, 1.3, 1.62], [GX + 4.7, 1.3, 1.62], [GX + 5.4, 1.3, 1.62], [GX + 5.4, 3.0, 1.62], [GX + 5.4, 3.0, -1.2], [GX + 7.0, 3.0, -1.2], [GX + 7.0, 2.7, -1.2]];
const G_TL = [[GX + 7.2, 1.6, -0.9], [GX + 7.2, 1.6, -0.5], [GX + 8.3, 1.6, -0.5]];
LAY("gPipe", [14, 3, GX + 2, 1.6]);
PIPE("gP", "gPipe", G_N2, 0.13, "gasPipe", { jmat: "steel2" }); PIPE("gPt", "gPipe", G_TL, 0.07, "gasPipe", { jmat: "steel2" }); CLAMPS("gPcl", "gPipe", G_N2.slice(3), 0.13, 1.4, "steel");
PIPE("gPtank", "gPipe", [[GX - 7.8, 1.0, -1.5], [GX - 4.6, 1.0, -1.5], [GX - 4.6, 1.0, -0.2]], 0.1, "insul", { jmat: "insul" }); PIPE("gPtv", "gPipe", [[GX - 4.6, 0.7, 1.38], [GX - 4.6, 0.7, 1.6], [GX - 3.0, 0.7, 1.6], [GX - 3.0, 0.3, 1.6]], 0.08, "insul", { jmat: "insul" });
PLATE("gN2Tag", "gPipe", "sign-n2tag", 1.0, GX + 1.0, 2.0, 2.45); BOX("gN2TagPost", "gPipe", GX + 0.97, GX + 1.03, 1.36, 1.62, 2.38, 2.42, "steel");

// ═════ 站 V：供應商（三座廠：超純水設備廠［日本］、兩座空氣分離廠［台灣，外型不同］；廠牌＝文字名牌、國旗旗桿）═════
const VX = 205;
LAY("vBase", [22, 0.3, VX, 0.1]); BOX("vPave", "vBase", VX - 11, VX + 11, 0, 0.12, -3.4, 3.2, "panel2");
P({ id: "vLine", layer: "vBase", shape: "box", size: [0.06, 0.02, 6.4], pos: [0, 0.13, -0.1], at: [[VX - 3.5, 0, 0], [VX + 3.5, 0, 0]], mat: "seam" });
// v0 Organo：超純水撬座（三支藍罐、膜殼架、管線、控制箱）
LAY("v0", [6, 4, VX - 7.2, 2]);
BOX("v0Skid", "v0", VX - 10.2, VX - 4.4, 0.12, 0.35, -2.6, 0.4, "dark");
for (let i = 0; i < 3; i++) { const x = VX - 9.5 + i * 1.1; VC(`v0T${i}`, "v0", 0.45, 0.35, 2.6, "frp", { x, z: -1.6 }); SPH(`v0Tc${i}`, "v0", 0.45, x, 2.6, -1.6, "frp"); }
for (let r = 0; r < 3; r++) HXC(`v0Ro${r}`, "v0", 0.18, VX - 6.4, VX - 4.6, 0.8 + r * 0.45, -1.6, "ro");
BOX("v0Ctl", "v0", VX - 6.4, VX - 5.3, 0.35, 2.0, -0.4, 0.2, "panel"); BOX("v0CtlS", "v0", VX - 6.25, VX - 5.45, 1.4, 1.8, 0.2, 0.23, "screen"); HXC("v0P", "v0", 0.1, VX - 10, VX - 4.6, 0.6, -0.8, "pipeW");
BOX("v0SignBg", "v0", VX - 9.6, VX - 6.6, 0.12, 1.35, 1.0, 1.1, "panel"); PLATE("v0Sign", "v0", "sign-organo", 2.6, VX - 8.1, 0.75, 1.12);
LAY("vF0", [1.6, 4.8, VX - 5.2, 2.4]); FLAGPOLE("v0Flag", "vF0", "JP", VX - 5.2, 1.8, 4.6, 1.3);
// v1 聯華林德：高冷箱＋液氮槽＋空壓機房（矩形冷箱）
LAY("v1", [6, 7, VX, 3.5]);
BOX("v1Cb", "v1", VX - 2.4, VX - 0.8, 0.12, 6.8, -2.8, -1.2, "alu"); P({ id: "v1CbRib", layer: "v1", shape: "box", size: [1.7, 0.06, 0.06], pos: [VX - 1.6, 0, -1.18], at: [1.5, 3, 4.5, 6].map((y) => [0, y, 0]), mat: "steel" });
BOX("v1Lad", "v1", VX - 0.78, VX - 0.72, 0.12, 6.8, -2.2, -1.8, "dark"); P({ id: "v1Rung", layer: "v1", shape: "box", size: [0.06, 0.04, 0.4], pos: [VX - 0.74, 0, -2.0], at: Array.from({ length: 20 }, (_, k) => [0, 0.4 + k * 0.32, 0]), mat: "steel" }); BOX("v1Plate", "v1", VX - 2.0, VX - 1.2, 1.0, 1.4, -1.18, -1.15, "gold"); PIPE("v1P", "v1", [[VX - 0.8, 1.2, -1.6], [VX - 0.05, 1.2, -1.6]], 0.1, "insul", { jmat: "insul" });
VC("v1Ln", "v1", 0.65, 0.8, 4.2, "ln", { x: VX + 0.6, z: -1.6 }); SPH("v1LnT", "v1", 0.65, VX + 0.6, 4.2, -1.6, "ln"); P({ id: "v1LnLeg", layer: "v1", shape: "box", size: [0.1, 0.7, 0.1], pos: [0, 0.47, 0], at: RING(4, 0.58, 45, VX + 0.6, -1.6), mat: "steel" });
BOX("v1Comp", "v1", VX + 1.6, VX + 3.0, 0.12, 1.8, -2.8, -1.0, "panel"); for (let k = 0; k < 4; k++) BOX(`v1CompV${k}`, "v1", VX + 1.7, VX + 2.9, 0.4 + k * 0.25, 0.48 + k * 0.25, -1.0, -0.97, "seam");
BOX("v1SignBg", "v1", VX - 2.6, VX + 0.2, 0.12, 1.35, 1.0, 1.1, "panel"); PLATE("v1Sign", "v1", "sign-lienhwa", 2.4, VX - 1.2, 0.75, 1.12);
LAY("vF1", [1.6, 4.8, VX + 1.5, 2.4]); FLAGPOLE("v1Flag", "vF1", "TW", VX + 1.5, 1.8, 4.6, 1.3);
// v2 三福氣體：雙塔＋球形儲槽（外型與 v1 不同）
LAY("v2", [6, 6, VX + 7.2, 3]);
for (const [i, x] of [[0, VX + 4.6], [1, VX + 5.6]]) { VC(`v2Col${i}`, "v2", 0.38, 0.12, 5.6 - i * 0.8, "alu", { x, z: -2.0 }); SPH(`v2ColT${i}`, "v2", 0.38, x, 5.6 - i * 0.8, -2.0, "alu"); P({ id: `v2Ring${i}`, layer: "v2", shape: "tube", size: [0.41, 0.38, 0.05], rot: V, pos: [x, 0, -2.0], at: [1, 2, 3, 4].map((y) => [0, y, 0]), mat: "steel" }); }
SPH("v2Sph", "v2", 1.1, VX + 7.9, 2.0, -1.6, "ln"); P({ id: "v2SphLeg", layer: "v2", shape: "box", size: [0.1, 1.5, 0.1], pos: [0, 0.85, 0], at: RING(5, 0.95, 0, VX + 7.9, -1.6), mat: "steel" });
VT("v2SphBelt", "v2", 1.12, 1.08, 1.95, 2.05, "steel", { x: VX + 7.9, z: -1.6 }); HXC("v2P", "v2", 0.1, VX + 4.6, VX + 7.9, 0.8, -1.0, "steel2");
BOX("v2SignBg", "v2", VX + 4.4, VX + 7.2, 0.12, 1.35, 1.0, 1.1, "panel"); PLATE("v2Sign", "v2", "sign-sanfu", 2.4, VX + 5.8, 0.75, 1.12);
LAY("vF2", [1.6, 4.8, VX + 9.4, 2.4]); FLAGPOLE("v2Flag", "vF2", "TW", VX + 9.4, 1.8, 4.6, 1.3);

// ═════ 站 P：探針卡預告（晶圓台＋晶圓＋晶粒；上方探針卡：電路板、元件、加強環、陶瓷針座、針陣；測試頭）═════
const PX = 235;
LAY("pBase", [8, 1.2, PX, 0.5]);
BOX("pStage", "pBase", PX - 4, PX + 4, 0, 0.6, -3.0, 3.0, "band"); VC("pChuck", "pBase", 2.5, 0.6, 1.0, "steel2", { x: PX }); VT("pChuckR", "pBase", 2.55, 2.4, 0.9, 1.0, "dark", { x: PX });
VC("pWaf", "pBase", 2.2, 1.0, 1.05, "si", { x: PX });
{ const d = []; for (let i = -7; i <= 7; i++) for (let j = -7; j <= 7; j++) { const x = i * 0.3, z = j * 0.3; if (Math.hypot(x, z) < 2.0) d.push([R2(PX + x), 0, R2(z)]); }
  P({ id: "pDie", layer: "pBase", shape: "box", size: [0.26, 0.012, 0.26], pos: [0, 1.06, 0], at: d, mat: "die" }); }
LAY("pCard", [6, 2.4, PX, 3]);
VC("pPcb", "pCard", 2.9, 2.4, 2.55, "pcb", { x: PX }); VT("pStiff", "pCard", 1.45, 1.0, 2.55, 2.85, "steel", { x: PX }); VC("pHead", "pCard", 0.95, 2.15, 2.4, "ceram", { x: PX });
P({ id: "pComp", layer: "pCard", shape: "box", size: [0.22, 0.08, 0.14], pos: [0, 2.6, 0], at: Array.from({ length: 34 }, (_, i) => { const [x, z] = pol(i * 10.6, 1.75 + (i % 3) * 0.35); return [R2(PX + x), 0, z]; }), mat: "dark" });
P({ id: "pCap", layer: "pCard", shape: "box", size: [0.1, 0.06, 0.06], pos: [0, 2.58, 0], at: Array.from({ length: 30 }, (_, i) => { const [x, z] = pol(i * 12 + 5, 2.5); return [R2(PX + x), 0, z]; }), mat: "gold" });
P({ id: "pConn", layer: "pCard", shape: "box", size: [0.4, 0.14, 0.2], pos: [0, 2.62, 0], at: RING(8, 2.75, 22, PX, 0), mat: "panel" });
{ const n = []; for (let i = -6; i <= 6; i++) for (let j = -6; j <= 6; j++) { const x = i * 0.12, z = j * 0.12; if (Math.hypot(x, z) < 0.75) n.push([R2(PX + x), 0, R2(z)]); }
  P({ id: "pNeedle", layer: "pCard", shape: "cyl", size: [0.012, 0.26], rot: V, pos: [0, 2.02, 0], at: n, mat: "needle" }); }
VT("pPogo", "pCard", 1.4, 1.1, 2.85, 3.35, "dark", { x: PX }); P({ id: "pPogoPin", layer: "pCard", shape: "cyl", size: [0.03, 0.5], rot: V, pos: [0, 3.1, 0], at: RING(24, 1.25, 0, PX, 0), mat: "gold" });
LAY("pHit", [1.6, 0.2, PX, 1.07]); P({ id: "pHitD", layer: "pHit", shape: "box", size: [0.26, 0.014, 0.26], pos: [0, 1.07, 0], at: [-1, 0, 1].flatMap((i) => [-1, 0, 1].map((j) => [R2(PX + i * 0.3), 0, R2(j * 0.3)])), mat: "lampG" });

// ═════ 動作 ═════
// U 用水點：吸盤＋晶圓起轉；超純水從噴嘴落下（重力加速）、在晶圓上沿離心螺旋甩出、邊緣甩出水珠（拋物線落到杯壁）
actions.uSpin = { type: "rotate", _說明: "吸盤與晶圓旋轉（起轉加速、停轉減速）", parts: idsOf("uWafer"), axis: [0, 1, 0], pivot: [UX, 0, 0], rps: 0.9, rampSpin: true };
actions.uJet = { type: "flow", _說明: "超純水從噴嘴落到晶圓中心（受重力加速）", layer: "uArm", path: [[UX + 0.25, 2.24, -0.25], [UX + 0.25, YW + 0.04, -0.25]], n: 5, size: 0.11, shape: "liquid", band: 0.05, bandO: 0.55, rate: 1.4, color: "upwC", track: false, accel: true, free: true, jitter: 0.01 };
for (const [k, a] of [["A", 0], ["B", 120], ["C", 240]]) actions[`uOut${k}`] = { type: "flow", _說明: "水膜被離心力沿螺旋甩向外緣", layer: "uFilm", path: SPIRAL(a, UX, YW + 0.05, 0.15, WR - 0.05, 0.6), n: 6, size: 0.07, shape: "dot", rate: 0.55, color: "upwC", track: false, free: true, jitter: 0.03 };
for (const [k, a] of [["A", 30], ["B", 150], ["C", 270]]) { const [x0, z0] = pol(a, WR), [x1, z1] = pol(a + 12, WR + 0.45), [x2, z2] = pol(a + 18, 1.78);
  actions[`uFling${k}`] = { type: "flow", _說明: "邊緣甩出水珠（拋物線落到擋水杯）", layer: "uFilm", path: [[R2(UX + x0), YW + 0.05, z0], [R2(UX + x1), YW + 0.18, z1], [R2(UX + x2), YW - 0.25, z2]], n: 2, size: 0.07, shape: "dot", rate: 1.1, color: "upwC", track: false, accel: true, free: true, jitter: 0.04 }; }
// F 廠房：冷卻塔風扇；無塵室氣流從天花板往下吹，穿過格柵進回風夾層，往兩側回風
actions.fFanSpin = { type: "rotate", parts: ["fFanB0", "fFanB0b", "fFanHub0"], axis: [0, 1, 0], pivot: [FX - 5.5, 0, -1.6], rps: 0.8, rampSpin: true };
actions.fFanSpin2 = { type: "rotate", parts: ["fFanB1", "fFanB1b", "fFanHub1"], axis: [0, 1, 0], pivot: [FX - 2.2, 0, -1.6], rps: 0.8, rampSpin: true };
actions.fAir = { type: "flow", _說明: "無塵室：天花板濾網往下吹的潔淨空氣（像瀑布，前一集）", layer: "fClean", path: [[FX - 6.5, 7.6, 1.2], [FX - 6.5, 4.5, 1.2]], n: 3, lanes: 6, laneDir: [1, 0, 0], laneGap: 2.6, size: 0.08, shape: "dot", rate: 0.42, color: "upwC", track: false, free: true, jitter: 0.05 };
actions.fRet = { type: "flow", _說明: "回風夾層：空氣穿過格柵往兩側回風", layer: "fPlen", path: [[FX - 1.0, 4.1, 1.5], [FX - 1.0, 3.6, 1.5], [FX - 7.6, 3.6, 1.5]], n: 4, size: 0.07, shape: "dot", rate: 0.35, color: "upwC", track: false, free: true, jitter: 0.06 };
actions.fRet2 = { type: "flow", layer: "fPlen", path: [[FX + 1.0, 4.1, 1.5], [FX + 1.0, 3.6, 1.5], [FX + 7.6, 3.6, 1.5]], n: 4, size: 0.07, shape: "dot", rate: 0.35, color: "upwC", track: false, free: true, jitter: 0.06 };
actions.fWRise = { type: "flow", _說明: "地下層：水、電、氣沿立管往上送進無塵室", layer: "fSubW", path: [[FX - 3.6, 0.9, 1.0], [FX - 3.6, 3.0, 1.0]], n: 3, size: 0.08, shape: "dot", rate: 0.6, color: "upwC", track: false, free: true };
actions.fGRise = { type: "flow", layer: "fSubG", path: [[FX + 4.2, 1.2, 1.0], [FX + 4.2, 3.0, 1.0]], n: 3, size: 0.07, shape: "dot", rate: 0.7, color: "n2C", track: false, free: true };
actions.fERise = { type: "flow", layer: "fSubE", path: [[FX + 0.6, 2.6, 1.0], [FX + 0.6, 3.0, 1.0]], n: 2, size: 0.07, shape: "dot", rate: 1.2, color: "powC", track: false, free: true };
// W 超純水製造：原水沿後排流進來；雜質（橘）被逆滲透膜擋下、濃水（較少）沿排放管走掉；淡水（亮藍）轉到前排；離子（紅）被樹脂抓住；紫外線徑向發散；顆粒（褐）被超過濾擋下
actions.wFeed = { type: "flow", _說明: "原水（略黃）沿後排進水管流向逆滲透", layer: "wPipe", path: W_IN, n: 9, size: 0.1, shape: "dot", rate: 0.16, color: "rawC", track: false, free: true, jitter: 0.04 };
actions.wImp = { type: "flow", _說明: "雜質（橘）跟著原水進逆滲透膜殼，留在膜殼這一側", layer: "wPipe", path: [[WX - 8.6, 0.63, ZB + 1.0], [WX - 1.0, 0.63, ZB + 1.0], [WX - 1.0, 1.0, ZB + 0.35]], n: 5, size: 0.075, shape: "dot", rate: 0.17, color: "impC", track: false, free: true, jitter: 0.05 };
actions.wConc = { type: "flow", _說明: "濃水（被擋下的雜質）沿膜殼外側流向排放口：流量比淡水小", layer: "wRO", path: [[WX + 1.42, 2.0, ZB - 0.4], [WX + 1.42, 2.0, ZB - 1.3], [WX + 1.42, 0.42, ZB - 1.3], [WX + 4.0, 0.42, ZB - 1.3]], n: 2, size: 0.07, shape: "dot", rate: 0.3, color: "impC", track: false, free: true };
actions.wPerm = { type: "flow", _說明: "淡水（亮藍）繞到前排，一路流到儲槽", layer: "wPipe", path: W_PERM, n: 30, size: 0.13, shape: "dot", rate: 0.065, color: "upwC", track: false, free: true, jitter: 0.03 };
actions.wIon = { type: "flow", _說明: "離子（紅）流進混床罐，被樹脂珠抓住、不再出來", layer: "wPipe", path: [[WX + 6.6, 0.63, ZF - 0.95], [WX + 5.4, 0.63, ZF - 0.95], [WX + 5.4, 0.63, ZF - 0.4], [WX + 5.4, 1.4, ZF + 0.6]], n: 4, size: 0.07, shape: "dot", rate: 0.3, color: "ionC", track: false, free: true };
actions.wBeadGlow = { type: "pulse", _說明: "樹脂珠抓到離子時閃一下", parts: ["wBeadA"], color: "ionC", glow: 0.6, freq: 1.4, halo: 0 };
actions.wUvGlow = { type: "pulse", parts: ["wUvLamp"], color: "uvC", glow: 1.0, freq: 2.2, halo: 0.6 };
for (const [k, dx] of [["", 0.8], ["2", 1.4], ["3", 2.0], ["4", 2.6]]) actions[`wUvRay${k}`] = { type: "wave", _說明: "紫外線沿整支燈管往四周一圈圈發散（越遠越淡）", from: { layer: "wUV", p: [R2(WX + dx), 1.2, ZF] }, dir: [1, 0, 0], reach: 0.1, count: 3, r0: 0.14, spread: 0.5, rate: 1.1, color: "uvC", width: 0.05 };
actions.wOrg = { type: "flow", _說明: "細顆粒（褐）被超過濾擋在模組外側", layer: "wPipe", path: [[WX + 0.6, 0.63, ZF - 0.95], [WX - 1.9, 0.63, ZF - 0.95], [WX - 1.9, 0.63, ZF - 0.4], [WX - 1.9, 1.3, ZF - 0.4]], n: 3, size: 0.065, shape: "dot", rate: 0.3, color: "orgC", track: false, free: true };
actions.wHp = { type: "vibrate", parts: ["wHpMotor", "wHpFin"], axis: [0, 1, 0], amp: 0.008, freq: 9 };
// L 循環：迴路泵（風扇罩標記看得到在轉）、主管一直流、死水支管裡細菌長出來（脈動）
actions.lPumpSpin = { type: "rotate", parts: ["lFanMarkB"], axis: [0, 0, 1], pivot: [LX - 2.75, 0.85, 0], rps: 2.2, rampSpin: true };
actions.lFlow = { type: "flow", _說明: "超純水在環狀主管裡一直循環（回到儲槽再出去）", layer: "lLoop", path: L_LOOP, n: 30, size: 0.1, shape: "dot", rate: 0.055, color: "upwC", track: false, free: true, jitter: 0.03 };
actions.lBactGrow = { type: "pulse", _說明: "死水支管：細菌（綠）冒出來", parts: ["lBactC"], color: "bactC", glow: 0.9, freq: 1.2, halo: 0.3 };
actions.lDrip = { type: "flow", _說明: "用水點把超純水送進機台", layer: "lLoop", path: [[LX - 1.8, YL, -2.6], [LX - 1.8, YL, -3.3], [LX - 1.8, 2.2, -3.3]], n: 2, lanes: 3, laneDir: [1, 0, 0], laneGap: 3.0, size: 0.07, shape: "dot", rate: 0.7, color: "upwC", track: false, free: true };
// T 廠房：原水進槽；冷卻塔風扇起轉、白色水氣上升；冷卻水（橘）把熱帶到塔頂；冰水（藍）送進廠房；冷凝器發熱
actions.tIn = { type: "flow", _說明: "原水沿進水管流進原水槽", layer: "tTank", path: T_IN, n: 10, size: 0.12, shape: "dot", rate: 0.13, color: "rawC", track: false, free: true, jitter: 0.04 };
actions.tFanSpin = { type: "rotate", parts: ["tFanB0", "tFanC0", "tFanHub0"], axis: [0, 1, 0], pivot: [TX - 2.8, 0, -1.7], rps: 0.7, rampSpin: true };
actions.tFanSpin2 = { type: "rotate", parts: ["tFanB1", "tFanC1", "tFanHub1"], axis: [0, 1, 0], pivot: [TX + 1.8, 0, -1.7], rps: 0.7, rampSpin: true };
actions.tPlume = { type: "flow", _說明: "冷卻塔把熱以水氣帶走：白霧上升、散開", layer: "tTower", path: [[TX - 2.8, 9.5, -1.7], [TX - 2.6, 10.6, -1.7], [TX - 2.2, 11.8, -1.5]], n: 6, lanes: 2, laneDir: [1, 0, 0], laneGap: 4.6, size: 0.24, shape: "dot", rate: 0.35, color: "plumeC", track: false, free: true, jitter: 0.5 };
actions.tCw = { type: "flow", _說明: "冷卻水（橘，帶著熱）從冷凝器上到塔頂", layer: "tTower", path: [...T_CWIN].reverse().concat(T_CW2.slice().reverse().slice(1)), n: 12, size: 0.09, shape: "dot", rate: 0.08, color: "condC", track: false, free: true };
actions.tChw = { type: "flow", _說明: "冰水（藍）從蒸發器送進廠房", layer: "tChill", path: T_CHW, n: 6, size: 0.09, shape: "dot", rate: 0.3, color: "chillC", track: false, free: true };
actions.tCondHot = { type: "pulse", parts: ["tCond"], color: "heatC", glow: 0.5, freq: 0.8, halo: 0 };
// E 電力：電流（黃點）從地下進線→變壓器→開關櫃→機台；電壓晃一下（燈閃、指針掉下去再回來）；不斷電系統接手（綠點從電池架→UPS→機台）
actions.eHvFlow = { type: "flow", _說明: "電從地下 161 kV 電纜進到變壓器", layer: "eCable", path: E_HV, n: 8, size: 0.08, shape: "dot", rate: 0.22, color: "powC", track: false, free: true };
actions.eLvFlow = { type: "flow", _說明: "降壓後經電纜架送到開關櫃、再到機台", layer: "eCable", path: E_LV, n: 10, size: 0.08, shape: "dot", rate: 0.2, color: "powC", track: false, free: true };
actions.eSag = { type: "rotate", _說明: "電壓晃一下：指針掉下去再回來", parts: ["eNdl"], axis: [0, 0, 1], pivot: [EX - 2.0, 1.75, 0], angle: 48, hold: true };
actions.eFlicker = { type: "pulse", _說明: "燈光閃一下", parts: ["eLampGlow"], color: "ffuC", glow: 1.2, freq: 7, halo: 0 };
actions.eRedBlink = { type: "pulse", parts: ["eLr"], color: "lampR", glow: 1.0, freq: 1.6, halo: 0.6 };
actions.eBatt = { type: "flow", _說明: "電池（綠點）經 UPS 送到機台：市電晃的時候立刻接手", layer: "eUPS", path: E_UPS, n: 12, size: 0.09, shape: "dot", rate: 0.2, color: "battG", track: false, free: true };
actions.eUpsGlow = { type: "pulse", parts: ["eUpS0", "eUpS1", "eStsL"], color: "battG", glow: 0.9, freq: 1.4, halo: 0.3 };
actions.eTransHum = { type: "vibrate", parts: ["eFin"], axis: [1, 0, 0], amp: 0.004, freq: 12 };
// G 氣體：蒸餾塔內冷氣上升、液體下流（逆向交換）；氮氣在管線裡壓力輸送（中心快、管壁慢）；汽化器結霜白霧；洩漏偵測燈閃
actions.gVapUp = { type: "flow", _說明: "蒸餾塔：冷的氣體往上升", layer: "gAsu", path: [[GX - 8.75, 0.9, -0.95], [GX - 8.75, 6.6, -0.95]], n: 9, size: 0.07, shape: "dot", rate: 0.13, color: "n2C", track: false, free: true, jitter: 0.06 };
actions.gLiqDown = { type: "flow", _說明: "蒸餾塔：液體沿塔盤往下流（和氣體逆向接觸）", layer: "gAsu", path: [[GX - 9.05, 6.6, -0.95], [GX - 9.05, 0.9, -0.95]], n: 8, size: 0.08, shape: "dot", rate: 0.1, color: "liqC", track: false, free: true, jitter: 0.04 };
actions.gN2c = { type: "flow", _說明: "氮氣在管裡被壓力推著走：中心快", layer: "gPipe", path: G_N2, n: 22, size: 0.09, shape: "dot", rate: 0.09, color: "n2C", track: false, free: true, jitter: 0.02 };
actions.gN2w = { type: "flow", _說明: "貼著管壁的較慢", layer: "gPipe", path: G_N2, n: 14, lanes: 2, laneDir: [0, 1, 0], laneGap: 0.17, size: 0.05, shape: "dot", rate: 0.03, color: "n2C", track: false, free: true, jitter: 0.01 };
actions.gN2t = { type: "flow", layer: "gPipe", path: G_TL, n: 4, size: 0.06, shape: "dot", rate: 0.45, color: "n2C", track: false, free: true };
actions.gMist = { type: "flow", _說明: "汽化器底部結霜、冒出白霧（往下、往旁邊散）", layer: "gVap", path: [[GX - 2.6, 1.2, 1.6], [GX - 2.4, 0.7, 2.2], [GX - 2.0, 0.4, 2.9]], n: 6, lanes: 2, laneDir: [1, 0, 0], laneGap: 0.8, size: 0.18, shape: "dot", rate: 0.3, color: "plumeC", track: false, free: true, jitter: 0.25 };
actions.gLeakBlink = { type: "pulse", parts: ["gLeakL"], color: "lampG", glow: 0.9, freq: 1.2, halo: 0.4 };
// P 探針卡：碰到晶粒的接點亮綠
actions.pTest = { type: "pulse", parts: ["pHitD"], color: "lampG", glow: 1.0, freq: 1.6, halo: 0.4 };

// 標註點
Object.assign(anchors, {
  uWafer: A("uWafer", [UX - 0.6, YW + 0.03, 0.9], -150, 110), uNoz: A("uArm", [UX + 0.25, 2.3, -0.25], 160, -110),
  fClean: A("fClean", [FX - 3.3, 5.6, 0.2], -170, -110), fPlen: A("fPlen", [FX - 4.5, 3.7, 2.4], -170, 110), fSub: A("fSubE", [FX - 0.4, 1.6, -1.35], 150, 120), fFacade: A("fFrame", [FX + 8.35, 6.0, 4.2], 120, -100),
  wSand: A("wPre", [WX - 7.1, 2.4, ZB + 0.8], -120, -120), wRo: A("wRO", [WX - 1.0, 2.8, ZB + 0.12], 140, -120), wMix: A("wIX", [WX + 5.4, 1.6, ZF + 0.77], 130, 110),
  wUv: A("wUV", [WX + 1.6, 1.2, ZF + 0.34], -60, 150), wUf: A("wUF", [WX - 1.9, 1.8, ZF], -140, 120), wTank: A("wTank", [WX - 5.8, 2.4, ZF + 1.0], -130, -110), wMeter: A("wTank", [WX - 3.9, 2.2, ZF + 0.92], 120, -120),
  lLoop: A("lLoop", [LX + 4.5, YL, 1.15], 120, 110), lDead: A("lBact", [LX + 3.0, YL, 2.4], 140, -110), lValve: A("lValve", [LX - 3.2, YL + 0.7, -2.6], -130, -110), lPump: A("lPump", [LX - 3.0, 1.1, 1.3], -130, 110),
  tTank: A("tTank", [TX - 7.6, 3.6, 1.95], -120, -110), tSign: A("tBldg", [TX - 3.0, 3.9, 2.48], 120, -110), tTower: A("tTower", [TX + 1.8, 8.2, -0.34], 140, -100), tCw: A("tTower", [TX + 6.4, 4.6, 0.6], 120, -60), tChill: A("tChill", [TX + 8.5, 1.85, -0.2], 120, 100),
  eTrans: A("eTrans", [EX - 6.0, 2.0, 1.2], -130, -120), eSwg: A("eSwg", [EX - 2.0, 1.75, 0.2], 110, -140), eTool: A("eLampR", [EX + 5.1, 3.45, 0.42], 120, -100), eUps: A("eUPS", [EX - 1.9, 2.2, UZ + 0.53], -130, -120),
  eBatt: A("eUPS", [EX + 2.25, 0.85, UZ + 0.36], 130, -130), eGrid: A("eCable", [EX - 7.5, 0.3, 2.2], -100, -150),
  gN2: A("gPipe", [GX + 1.0, 2.25, 2.45], 120, -110), gAsu: A("gAsu", [GX - 8.9, 4.5, -0.4], 130, -110), gPipeU: A("gPipe", [GX + 1.5, 0.6, 1.78], 120, 110), gVmb: A("gFab", [GX + 7.0, 2.2, -0.86], -140, -120), gTool: A("gFab", [GX + 9.4, 2.5, 0.2], 120, -110),
  v0: A("v0", [VX - 8.1, 2.6, -1.6], -110, -120), v1: A("v1", [VX - 1.6, 5.0, -1.18], 120, -110), v2: A("v2", [VX + 7.9, 3.1, -1.6], 120, -100),
  pCard: A("pCard", [PX + 2.2, 2.5, 1.5], 130, -110), pNeedle: A("pCard", [PX + 0.6, 2.05, 0.3], 140, 120),
});

const model = {
  name: "示意 晶圓廠廠務（水、氣、電）：用水點、晶圓廠垂直剖面、超純水製造與循環迴路、台積電廠房外觀與冷卻、變電與不斷電系統、空氣分離廠與氮氣管線、供應商、探針卡預告（示意，非特定廠牌／型號）",
  unit: "示意（1＝1 m）",
  size: { w: 40, h: 18, r: 0.6, t: 30 },
  palette, materials,
  partNames: {},
  layers, parts, anchors, actions,
  pose: { yaw0: 0, yawIso: 0, drift: 0 },
  camera: { stand: { d: 70, elev: 24, y: 4 } },
  fx: { dpr: 1, srcPx: 30, shadows: 0, fog: false, dust: false, vaporSprites: false, shimmer: false },
  info: { UX, FX, WX, LX, TX, EX, GX, VX, PX, YW, YL },
};
fs.writeFileSync(path.join(HERE, "model.json"), JSON.stringify(model, null, 1) + "\n");
console.log(`✔ model.json：${parts.length} 個零件、${parts.reduce((a, p) => a + Math.max(1, (p.at?.length ?? 0)), 0)} 個實體（含複製）、${layers.length} 層`);

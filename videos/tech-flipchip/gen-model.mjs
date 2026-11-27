// node videos/tech-flipchip/gen-model.mjs → 寫 videos/tech-flipchip/model.json
// 2026/11/27 tech-flipchip（封裝-2：覆晶，系列 3 第 4 集）。構造與物理照 physics-spec.md，模組清單與爆炸步驟對照 visual-spec.md。
// 單位：示意（1＝約 1 mm 放大；地圖另有示意比例），地板頂面 y＝0，x 向右、z 向觀眾。站點：
//   A 覆晶接合機（x 0；取晶粒 → 翻面 → 沾助焊劑 → 放到載板；s9 爆炸分解）｜B 打線 vs 覆晶（x 34）｜C 散熱蓋（x 56）
//   D 凸塊怎麼長（晶圓剖面，x 78）｜P 覆晶封裝剖面：回焊自我對位、熱脹冷縮、底部填充（x 102）｜H 公司地圖（x 140）｜N 下一集扇出型（x 176）
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
const HERE = path.dirname(new URL(import.meta.url).pathname);
const ROOT = path.join(HERE, "..", "..");
const R2 = (x) => Math.round(x * 1000) / 1000;
const D2R = Math.PI / 180;
const pol = (aDeg, r) => [R2(r * Math.cos(aDeg * D2R)), R2(r * Math.sin(aDeg * D2R))];
let seed = 20261204;
const rnd = () => { seed |= 0; seed = (seed + 0x6d2b79f5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
const palette = {
  floorC: "#C9D2DE", panel: "#F3F5F8", panel2: "#E2E8F0", seam: "#8E9BB0", band: "#24324C", steel: "#7D8CA6", steel2: "#A9B5C7", dark: "#3E4A60", black: "#23262D",
  glassC: "#BFD3F2", lampY: "#F2B632", lampG: "#2FBF71", lampR: "#E5484D", screen: "#5B8DEF", rubber: "#2B2F36", gold: "#D4A83C", estop: "#D93A2B", warnY: "#F2B632",
  siC: "#4A5A7E", siE: "#6F84B8", dieLine: "#9FB0D6", subC: "#3E6B4A", subD: "#2C4F37", cuC: "#C8743C", cuL: "#E39A5E", snC: "#C9CED6", snHot: "#F2B632", padAl: "#B8BEC9",
  resistC: "#7FA8E8", ubmC: "#8C7A6A", passC: "#5E7C9A", fluxC: "#E8D27A", ufWet: "#F0C46A", ufCure: "#B9853A", timC: "#D0D6DE", lidC: "#B7C0CE", heatC: "#E5602B",
  okC: "#2FBF71", badC: "#E5484D", sigC: "#38B6FF", wireC: "#E2B53E", tapeC: "#4F8FE0", frameC: "#B7C0CE", seaC: "#CFE3F2", landC: "#9CCB8A", gridC: "#A9C4DC", routeC: "#E8613C",
  cleanW: "#F7F8FA", winC: "#7FA6D9", roofASE: "#2F7FE0", roofAMK: "#E8613C", tankC: "#D9DEE6", pinR: "#E8613C", pinB: "#F2B632", moldC: "#2B2F3A", rdlC: "#E2B53E", labelC: "#FFFFFF", markC: "#E8613C", ringLight: "#BFEFFF",
};
const M = (kind, color, o = {}) => ({ kind, color, ...o });
const glowM = (c, op, ei = 1) => M("std", c, { emissive: c, ei, opacity: op, rough: 1, metal: 0 });
const materials = {
  floor: M("std", "floorC", { rough: 0.7, metal: 0.3, tex: "brushed", texScale: 3 }),
  panel: M("std", "panel", { rough: 0.55, metal: 0.05, env: 0.25 }), panel2: M("std", "panel2", { rough: 0.6, metal: 0.05, env: 0.2 }),
  seam: M("std", "seam", { rough: 0.6, metal: 0.3 }), band: M("std", "band", { rough: 0.4, metal: 0.3, env: 0.4 }),
  steel: M("std", "steel", { rough: 0.35, metal: 0.85, env: 0.5 }), steel2: M("std", "steel2", { rough: 0.3, metal: 0.8, env: 0.6, tex: "brushed", texScale: 2 }),
  dark: M("std", "dark", { rough: 0.5, metal: 0.4, env: 0.3 }), black: M("std", "black", { rough: 0.45, metal: 0.5, env: 0.35 }), rubber: M("std", "rubber", { rough: 0.9, metal: 0 }),
  gold: M("std", "gold", { rough: 0.28, metal: 0.9, env: 0.9 }), window: M("phys", "glassC", { rough: 0.05, metal: 0, clearcoat: 1, opacity: 0.3, env: 0.6 }),
  lampY: M("std", "lampY", { emissive: "lampY", ei: 0.4, rough: 0.4, metal: 0 }), lampG: M("std", "lampG", { emissive: "lampG", ei: 0.45, rough: 0.4, metal: 0 }), lampR: M("std", "lampR", { emissive: "lampR", ei: 0.35, rough: 0.4, metal: 0 }),
  estop: M("std", "estop", { rough: 0.4, metal: 0, emissive: "estop", ei: 0.15 }), screen: M("std", "screen", { emissive: "screen", ei: 0.5, rough: 0.3, metal: 0 }), warnY: M("std", "warnY", { rough: 0.5, metal: 0, emissive: "warnY", ei: 0.2 }),
  si: M("std", "siC", { rough: 0.25, metal: 0.5, env: 0.8 }), siE: M("std", "siE", { rough: 0.3, metal: 0.5, env: 0.7 }), dieLine: M("std", "dieLine", { rough: 0.4, metal: 0.3, emissive: "dieLine", ei: 0.15 }),
  sub: M("std", "subC", { rough: 0.8, metal: 0, env: 0.08 }), subD: M("std", "subD", { rough: 0.8, metal: 0 }), cu: M("std", "cuC", { rough: 0.3, metal: 0.85, env: 0.8 }), cuL: M("std", "cuL", { rough: 0.3, metal: 0.8, env: 0.8 }),
  sn: M("std", "snC", { rough: 0.2, metal: 0.9, env: 1.0 }), snHot: M("std", "snHot", { rough: 0.3, metal: 0.5, emissive: "snHot", ei: 0.5 }), padAl: M("std", "padAl", { rough: 0.3, metal: 0.85, env: 0.7 }),
  resist: M("phys", "resistC", { rough: 0.3, metal: 0, clearcoat: 0.6, opacity: 0.7, env: 0.5 }), ubm: M("std", "ubmC", { rough: 0.4, metal: 0.7 }), pass: M("std", "passC", { rough: 0.5, metal: 0.1 }),
  flux: M("phys", "fluxC", { rough: 0.15, metal: 0, clearcoat: 1, opacity: 0.75, env: 0.6 }), ufWet: M("phys", "ufWet", { rough: 0.1, metal: 0, clearcoat: 1, opacity: 0.82, env: 0.6 }), ufCure: M("std", "ufCure", { rough: 0.6, metal: 0 }),
  tim: M("std", "timC", { rough: 0.8, metal: 0.1 }), lid: M("std", "lidC", { rough: 0.3, metal: 0.85, env: 0.7, tex: "brushed", texScale: 2 }), heat: glowM("heatC", 0.9, 0.9),
  ok: glowM("okC", 0.95, 0.7), bad: glowM("badC", 0.95, 0.8), sig: glowM("sigC", 0.95, 1.0), wire: M("std", "wireC", { rough: 0.25, metal: 0.9, env: 0.9 }),
  tape: M("phys", "tapeC", { rough: 0.25, metal: 0, clearcoat: 0.8, opacity: 0.75, env: 0.6 }), frame: M("std", "frameC", { rough: 0.25, metal: 0.9, env: 0.8, tex: "brushed", texScale: 1.5 }),
  sea: M("std", "seaC", { rough: 0.6, metal: 0 }), land: M("std", "landC", { rough: 0.8, metal: 0 }), grid: M("std", "gridC", { rough: 0.8, metal: 0 }), route: glowM("routeC", 0.95, 0.5),
  clean: M("std", "cleanW", { rough: 0.5, metal: 0.05, env: 0.3 }), win: M("std", "winC", { rough: 0.1, metal: 0.3, env: 0.9, emissive: "winC", ei: 0.12 }),
  roofASE: M("std", "roofASE", { rough: 0.5, metal: 0.1 }), roofAMK: M("std", "roofAMK", { rough: 0.5, metal: 0.1 }), tank: M("std", "tankC", { rough: 0.3, metal: 0.7, env: 0.7 }),
  pinR: glowM("pinR", 0.95, 0.6), pinB: glowM("pinB", 0.8, 0.8), mold: M("std", "moldC", { rough: 0.7, metal: 0.05 }), rdl: M("std", "rdlC", { rough: 0.25, metal: 0.9, env: 0.9, emissive: "rdlC", ei: 0.1 }),
  label: M("std", "labelC", { rough: 0.7, metal: 0 }), mark: M("std", "markC", { rough: 0.5, metal: 0, emissive: "markC", ei: 0.25 }), ringLight: glowM("ringLight", 0.95, 0.8),
};
const parts = [], layers = [], anchors = {}, actions = {};
const P = (o) => { parts.push(o); return o; };
const LAY = (id, outline, bg) => layers.push({ id, z: 0, k: 0, outline, ...(bg ? { bg: true } : {}) });
const V = [90, 0, 0];
const BOX = (id, layer, x0, x1, y0, y1, z0, z1, mat, o = {}) => P({ id, layer, shape: "box", size: [R2(x1 - x0), R2(y1 - y0), R2(z1 - z0)], pos: [R2((x0 + x1) / 2), R2((y0 + y1) / 2), R2((z0 + z1) / 2)], mat, ...o });
const VC = (id, layer, R, y0, y1, mat, o = {}) => { const { x = 0, z = 0, ...r } = o; return P({ id, layer, shape: "cyl", size: [R, R2(y1 - y0)], rot: V, pos: [x, R2((y0 + y1) / 2), z], mat, ...r }); };
const VT = (id, layer, Ro, Ri, y0, y1, mat, o = {}) => { const { x = 0, z = 0, ...r } = o; return P({ id, layer, shape: "tube", size: [Ro, Ri, R2(y1 - y0)], rot: V, pos: [x, R2((y0 + y1) / 2), z], mat, ...r }); };
const SPH = (id, layer, r, x, y, z, mat, o = {}) => P({ id, layer, shape: "sphere", size: [r], pos: [x, y, z], mat, ...o });
const A = (layer, p, dx, dy) => ({ layer, p, dx, dy });
const idsOf = (layer) => parts.filter((q) => q.layer === layer).map((q) => q.id);
/* x-y 平面上的一段直桿（box＋單軸繞 z 轉，不受尤拉角順序影響） */
const SEG = (id, layer, x0, y0, x1, y1, z, t, mat, o = {}) => { const L = Math.hypot(x1 - x0, y1 - y0), a = Math.atan2(x1 - x0, y1 - y0) / D2R; return P({ id, layer, shape: "box", size: [t, R2(L + t * 0.5), t], rot: [0, 0, R2(-a)], pos: [R2((x0 + x1) / 2), R2((y0 + y1) / 2), z], mat, ...o }); };

// 名牌與國旗貼圖（官方 LOGO 三類來源見 assets.md；抓不到 → 白底深色文字名牌）
const SIGNS = [["fcase", "日月光|ASE"], ["fcamk", "安靠|Amkor"], ["fcbesi", "Besi"]];
{ const r = spawnSync("node", [path.join(ROOT, "scripts", "three", "make-brand-tex.mjs"), "tech-flipchip", "flag:US", "flag:TW", "flag:NL", ...SIGNS.map(([id, t]) => `text:${id}=${t}`)], { encoding: "utf8" }); if (r.status !== 0) { console.error(r.stdout, r.stderr); process.exit(1); } }
const SIGNM = JSON.parse(fs.readFileSync(path.join(ROOT, "public", "tex", "brand", "meta.json"), "utf8"));
const tex = (name) => { materials[`t_${name}`] = { kind: "unlit", color: "#FFFFFF", img: `tex/brand/${name}.png` }; return `t_${name}`; };
const plate = (id, layer, name, w, cx, cy, cz) => { const h = R2(w / SIGNM[name].aspect); P({ id, layer, shape: "plane", size: [w, h], pos: [cx, cy, cz], uv01: true, shadow: false, mat: tex(name) }); return h; };

// ═════ 地板 ═════
LAY("floor", [260, 2, 90, 0], true);
P({ id: "floor", layer: "floor", shape: "slab", size: [300, 0.5, 50], r: 0.2, pos: [90, -0.25, 0], mat: "floor" });
P({ id: "floorSeam", layer: "floor", shape: "slab", size: [300, 0.04, 0.1], pos: [90, 0.01, 0], at: Array.from({ length: 8 }, (_, i) => [0, 0, -18 + i * 5.2]), mat: "seam" });

// ═════ 站 A：覆晶接合機（示意）═════
// 機台檯面（背景層）：機殼、門板、螢幕、信號燈塔、急停；上面依序：晶圓台（x −4.5）→ 翻面單元 → 助焊劑盤（x 0）→ 載板輸送軌（x 3.6）；龍門接合頭跨在上方
const DY = 1.6;
LAY("base", [16, 2, 0, 0.8], true);
BOX("bsCab", "base", -7.2, 7.2, 0, 1.5, -4.6, 4.6, "band"); BOX("bsTop", "base", -7.2, 7.2, 1.5, DY, -4.6, 4.6, "panel2");
BOX("bsDoorL", "base", -6.8, -0.2, 0.22, 1.32, 4.6, 4.66, "panel"); BOX("bsDoorR", "base", 0.2, 6.8, 0.22, 1.32, 4.6, 4.66, "panel");
P({ id: "bsHandle", layer: "base", shape: "box", size: [0.12, 0.5, 0.14], pos: [-0.5, 0.78, 4.74], at: [[0, 0, 0], [1.0, 0, 0]], mat: "steel2" });
BOX("bsScreen", "base", -6.2, -4.2, 0.9, 1.2, 4.66, 4.7, "screen"); P({ id: "bsLed", layer: "base", shape: "sphere", size: [0.08], pos: [-3.7, 1.05, 4.7], at: [[0, 0, 0], [0.34, 0, 0], [0.68, 0, 0]], mat: "lampG" });
BOX("bsEstop", "base", 5.4, 5.9, 0.9, 1.2, 4.66, 4.8, "estop"); BOX("bsWarn", "base", 3.6, 4.6, 0.4, 0.8, 4.66, 4.7, "warnY");
for (let i = 0; i < 5; i++) BOX(`bsVent${i}`, "base", 1.2, 3.0, 0.32 + i * 0.12, 0.37 + i * 0.12, 4.66, 4.7, "dark");
P({ id: "bsScrew", layer: "base", shape: "cyl", size: [0.07, 0.04], rot: V, pos: [0, DY + 0.02, 0], at: [[-6.8, 0, -4.2], [6.8, 0, -4.2], [-6.8, 0, 4.2], [6.8, 0, 4.2]], mat: "steel" });
VC("bsTower", "base", 0.09, DY, 5.4, "steel2", { x: 6.6, z: -4.0 }); [["lampR", 5.4], ["lampY", 5.72], ["lampG", 6.04]].forEach(([mt, y], i) => VC(`bsTw${i}`, "base", 0.2, y, y + 0.3, mt, { x: 6.6, z: -4.0 }));
// 晶圓台：環框、膠膜、切好的晶粒（凸塊朝上，每顆 4×4 個小凸塊）、頂針座；被取的那顆在獨立層 die
const WX = -4.5, TY = DY + 0.42, DIE = 0.8, DT = 0.14, BUMP = 0.055;
LAY("wtable", [6, 1, WX, 1.9]);
VC("wtStage", "wtable", 2.9, DY, DY + 0.3, "steel2", { x: WX }); VT("wtFrame", "wtable", 2.75, 2.35, DY + 0.3, TY, "frame", { x: WX }); VC("wtTape", "wtable", 2.4, DY + 0.36, TY - 0.02, "tape", { x: WX });
const dpos = []; for (let i = -2; i <= 2; i++) for (let j = -2; j <= 2; j++) { if (i === 0 && j === 0) continue; const x = i * 0.95, z = j * 0.95; if (Math.hypot(Math.abs(x) + 0.45, Math.abs(z) + 0.45) < 2.3) dpos.push([R2(WX + x), z]); }
P({ id: "wtDie", layer: "wtable", shape: "box", size: [DIE, DT, DIE], pos: [0, R2(TY + DT / 2), 0], at: dpos.map(([x, z]) => [x, 0, z]), mat: "si" });
const bumpGrid = (n, s) => { const o = []; for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) o.push([R2(-s / 2 + (s * i) / (n - 1)), R2(-s / 2 + (s * j) / (n - 1))]); return o; };
const BG = bumpGrid(4, 0.54);
P({ id: "wtBump", layer: "wtable", shape: "sphere", size: [BUMP], pos: [0, R2(TY + DT + 0.02), 0], at: dpos.flatMap(([x, z]) => BG.map(([a, b]) => [R2(x + a), 0, R2(z + b)])), mat: "sn" });
LAY("eject", [1, 0.5, WX, DY + 0.2]); VC("ejCap", "eject", 0.3, DY + 0.3, DY + 0.36, "dark", { x: WX }); P({ id: "ejPin", layer: "eject", shape: "cyl", size: [0.03, 0.2], rot: V, pos: [WX, DY + 0.4, 0], at: [[-0.15, 0, -0.15], [0.15, 0, -0.15], [-0.15, 0, 0.15], [0.15, 0, 0.15]], mat: "steel2" });
// 被取的晶粒（凸塊朝上；翻面後朝下）
LAY("die", [1, 0.3, WX, TY + 0.1]);
BOX("dieBody", "die", WX - DIE / 2, WX + DIE / 2, TY, TY + DT, -DIE / 2, DIE / 2, "si");
P({ id: "dieBump", layer: "die", shape: "sphere", size: [BUMP], pos: [WX, R2(TY + DT + 0.02), 0], at: BG.map(([a, b]) => [a, 0, b]), mat: "sn" });
P({ id: "dieMark", layer: "die", shape: "box", size: [0.12, 0.01, 0.12], pos: [R2(WX - 0.3), R2(TY + DT + 0.005), 0.3], mat: "gold" });
// 翻面單元：吸嘴從翻轉臂垂下壓在晶粒頂面；繞 z 軸（樞軸 PX, PY）轉 180 度
const PX = WX + 1.2, PY = TY + DT + 0.95, NZ_T = TY + DT + 0.1;
// flipper＝原始姿態（翻面時和晶粒一起轉 180 度）；flipper2＝已翻好的同一支臂（交出晶粒後換成它，再轉 180 度回原位；避免同一零件掛兩個轉動被當成關節鏈）
const buildFlipper = (lay, pre, mir) => { const X = (x) => (mir ? R2(2 * PX - x) : x), Yv = (y) => (mir ? R2(2 * PY - y) : y);
  LAY(lay, [2, 2, PX, PY]);
  BOX(`${pre}Arm`, lay, Math.min(X(WX - 0.12), X(PX)), Math.max(X(WX - 0.12), X(PX)), PY - 0.09, PY + 0.09, -0.16, 0.16, "steel2");
  VC(`${pre}Nozzle`, lay, 0.1, Math.min(Yv(NZ_T), Yv(PY - 0.09)), Math.max(Yv(NZ_T), Yv(PY - 0.09)), "dark", { x: X(WX) }); VC(`${pre}Tip`, lay, 0.16, Math.min(Yv(NZ_T), Yv(NZ_T + 0.06)), Math.max(Yv(NZ_T), Yv(NZ_T + 0.06)), "rubber", { x: X(WX) });
  P({ id: `${pre}Hub`, layer: lay, shape: "cyl", size: [0.32, 0.5], pos: [PX, PY, 0], mat: "dark" }); };
buildFlipper("flipper", "fl", false); buildFlipper("flipper2", "fm", true);
// 翻面單元的底座（不轉）：馬達、軸承座、支柱
LAY("flipBase", [1.4, 3, PX, 2.6]);
BOX("fbPost", "flipBase", PX - 0.25, PX + 0.25, DY, PY - 0.35, -0.95, -0.55, "panel"); BOX("fbBear", "flipBase", PX - 0.35, PX + 0.35, PY - 0.35, PY + 0.35, -0.6, -0.3, "steel");
VC("fbMotor", "flipBase", 0.3, PY - 0.3, PY + 0.3, "black", { x: PX, z: -1.25, rot: [0, 0, 0] }); BOX("fbMotorB", "flipBase", PX - 0.3, PX + 0.3, PY - 0.3, PY + 0.3, -1.6, -0.95, "black");
SPH("fbLed", "flipBase", 0.06, PX + 0.32, PY + 0.2, -1.0, "lampG");
// 助焊劑盤（旋轉盤＋刮刀）
const FX = 0.2;
LAY("flux", [2.4, 0.6, FX, DY + 0.2]);
VC("fxPlate", "flux", 1.05, DY, DY + 0.22, "steel2", { x: FX }); VC("fxFilm", "flux", 0.95, DY + 0.22, DY + 0.26, "flux", { x: FX });
BOX("fxBlade", "flux", FX - 0.06, FX + 0.06, DY + 0.24, DY + 0.5, -0.95, 0.15, "steel"); BOX("fxBladeH", "flux", FX - 0.15, FX + 0.15, DY + 0.5, DY + 0.62, -1.1, -0.6, "dark");
// 往上看相機（拍晶粒凸塊對位）
LAY("upcam", [1, 0.8, -1.9, DY + 0.3]); BOX("ucBody", "upcam", -2.25, -1.55, DY, DY + 0.45, -0.35, 0.35, "black"); VT("ucRing", "upcam", 0.3, 0.2, DY + 0.45, DY + 0.5, "ringLight", { x: -1.9 }); VC("ucLens", "upcam", 0.18, DY + 0.42, DY + 0.48, "window", { x: -1.9 });
// 載板輸送軌：兩條軌道＋條狀載板（4 個封裝位，各有焊墊陣列）
const SX = 3.6, SUBT = 0.16, SUBY = DY + 0.34;
LAY("rail", [7, 0.6, SX + 0.4, DY + 0.2]);
P({ id: "rlRail", layer: "rail", shape: "box", size: [6.6, 0.3, 0.16], pos: [R2(SX + 0.4), R2(DY + 0.15), 0], at: [[0, 0, -0.78], [0, 0, 0.78]], mat: "steel" });
P({ id: "rlStop", layer: "rail", shape: "box", size: [0.12, 0.3, 1.6], pos: [R2(SX + 3.6), R2(DY + 0.3), 0], mat: "dark" });
BOX("rlStrip", "rail", SX - 2.6, SX + 3.4, SUBY - SUBT, SUBY, -0.7, 0.7, "sub");
P({ id: "rlSite", layer: "rail", shape: "box", size: [1.0, 0.012, 1.0], pos: [0, R2(SUBY + 0.004), 0], at: [-1.8, 0, 1.6, 3.0].map((dx) => [R2(SX + dx), 0, 0]), mat: "subD" });
P({ id: "rlPad", layer: "rail", shape: "cyl", size: [0.05, 0.012], rot: V, pos: [0, R2(SUBY + 0.01), 0], at: [-1.8, 0, 1.6, 3.0].flatMap((dx) => BG.map(([a, b]) => [R2(SX + dx + a), 0, b])), mat: "gold" });
P({ id: "rlDone", layer: "rail", shape: "box", size: [DIE, DT, DIE], pos: [0, R2(SUBY + 0.14 + DT / 2), 0], at: [[R2(SX - 1.8), 0, 0]], mat: "si" });
// 龍門接合頭：橫樑（不動，背景感）＋滑座＋Z 軸＋吸嘴＋加熱塊＋往下看相機（隨滑座移動）
const GY = 5.6;
LAY("gantry", [14, 1, 0, GY]);
BOX("gtBeam", "gantry", -6.4, 6.4, GY, GY + 0.6, -1.9, -1.3, "panel"); BOX("gtRail", "gantry", -6.2, 6.2, GY - 0.08, GY, -1.7, -1.5, "steel2");
P({ id: "gtLeg", layer: "gantry", shape: "box", size: [0.6, R2(GY - DY), 0.6], pos: [0, R2((GY + DY) / 2), -1.6], at: [[-6.2, 0, 0], [6.2, 0, 0]], mat: "panel" });
BOX("gtCable", "gantry", -6.0, 6.0, GY + 0.6, GY + 0.72, -1.85, -1.35, "black");
// 接合頭建在「接晶粒」的位置：翻面後晶粒中心 x＝2·PX−WX，背面朝上
const HX = R2(2 * PX - WX), HDIE_TOP = R2(2 * PY - TY), HZ = 0;
LAY("head", [1.6, 4, HX, 4.4]);
BOX("hdCar", "head", HX - 0.5, HX + 0.5, GY - 0.7, GY - 0.08, -1.45, -0.75, "dark");
BOX("hdZ", "head", HX - 0.22, HX + 0.22, HDIE_TOP + 0.9, GY - 0.4, -0.95, -0.55, "steel2");
P({ id: "hdScrew", layer: "head", shape: "cyl", size: [0.06, R2(GY - 0.4 - HDIE_TOP - 0.9)], rot: V, pos: [HX, R2((HDIE_TOP + 0.9 + GY - 0.4) / 2), -0.48], mat: "gold" });
BOX("hdArm", "head", HX - 0.18, HX + 0.18, HDIE_TOP + 0.75, HDIE_TOP + 0.95, -0.95, 0, "steel2");
BOX("hdHeater", "head", HX - 0.42, HX + 0.42, HDIE_TOP + 0.3, HDIE_TOP + 0.75, -0.42, 0.42, "dark"); P({ id: "hdFin", layer: "head", shape: "box", size: [0.86, 0.04, 0.86], pos: [HX, 0, 0], at: [0.4, 0.5, 0.6].map((d) => [0, R2(HDIE_TOP + d), 0]), mat: "steel2" });
VC("hdNozzle", "head", 0.14, HDIE_TOP, HDIE_TOP + 0.3, "rubber", { x: HX });
BOX("hdCam", "head", HX + 0.45, HX + 0.85, HDIE_TOP + 0.6, HDIE_TOP + 1.5, -0.25, 0.25, "black"); VC("hdCamLens", "head", 0.13, HDIE_TOP + 0.5, HDIE_TOP + 0.6, "window", { x: R2(HX + 0.65) });
BOX("hdLabel", "head", HX - 0.3, HX + 0.3, HDIE_TOP + 0.45, HDIE_TOP + 0.6, 0.42, 0.44, "warnY");
// 機殼頂蓋（爆炸第 1 步移開）
LAY("cover", [14, 1, 0, GY + 1.2]);
BOX("cvTop", "cover", -6.8, 6.8, GY + 0.9, GY + 1.05, -2.2, 2.2, "window"); BOX("cvFrame", "cover", -6.9, 6.9, GY + 1.05, GY + 1.15, -2.3, 2.3, "panel2");
P({ id: "cvPost", layer: "cover", shape: "box", size: [0.12, 0.9, 0.12], pos: [0, R2(GY + 0.45), 0], at: [[-6.8, 0, 2.2], [6.8, 0, 2.2], [-6.8, 0, -2.2], [6.8, 0, -2.2]], mat: "steel2" });

// ═════ 站 B：打線 vs 覆晶（s3）═════
const BX = 34, BSUB = 1.8, BD = 2.2;
LAY("bPlinth", [16, 1, BX, 0.5], true); BOX("bPl", "bPlinth", BX - 7.8, BX + 7.8, 0, 0.9, -3.2, 3.2, "band"); BOX("bPlTop", "bPlinth", BX - 7.8, BX + 7.8, 0.9, 1.0, -3.2, 3.2, "panel2");
for (const [nm, cx] of [["wb", BX - 3.8], ["fc", BX + 3.8]]) {
  LAY(`${nm}Sub`, [5, 0.5, cx, 1.2]);
  BOX(`${nm}SubB`, `${nm}Sub`, cx - 2.4, cx + 2.4, 1.0, BSUB, -2.4, 2.4, "sub");
  P({ id: `${nm}Ball`, layer: `${nm}Sub`, shape: "sphere", size: [0.12], pos: [cx, 1.0, 0], at: bumpGrid(8, 4.2).map(([a, b]) => [a, 0, b]), mat: "sn" });
  P({ id: `${nm}SubLine`, layer: `${nm}Sub`, shape: "box", size: [4.8, 0.02, 0.02], pos: [cx, 0, 2.41], at: [1.25, 1.5].map((y) => [0, y, 0]), mat: "cu" });
}
// 打線：晶片正面朝上，邊緣一圈焊墊，金線弧到載板
LAY("wbDie", [2.4, 0.6, BX - 3.8, 2.0]);
BOX("wbDieB", "wbDie", BX - 3.8 - BD / 2, BX - 3.8 + BD / 2, BSUB, BSUB + 0.3, -BD / 2, BD / 2, "si");
const edge = []; for (let i = 0; i < 6; i++) { const t = -0.85 + i * 0.34; edge.push([t, -0.95], [t, 0.95], [-0.95, t], [0.95, t]); }
P({ id: "wbPad", layer: "wbDie", shape: "box", size: [0.14, 0.02, 0.14], pos: [R2(BX - 3.8), R2(BSUB + 0.31), 0], at: edge.map(([a, b]) => [a, 0, b]), mat: "padAl" });
P({ id: "wbLead", layer: "wbDie", shape: "box", size: [0.18, 0.02, 0.18], pos: [R2(BX - 3.8), R2(BSUB + 0.01), 0], at: edge.map(([a, b]) => [R2(a * 1.75), 0, R2(b * 1.75)]), mat: "gold" });
/* 金線＝真實的弧（球焊點先往上、拱過去、斜斜落到載板），用一串小圓珠排成線 */
const WARC = (a, b, n = 40) => { const x0 = BX - 3.8 + a, z0 = b, x1 = BX - 3.8 + a * 1.75, z1 = b * 1.75, y0 = BSUB + 0.31, y1 = BSUB + 0.02;
  return Array.from({ length: n + 1 }, (_, i) => { const t = i / n, s = Math.min(1, t * 1.25); return [R2(x0 + (x1 - x0) * s), R2(y0 + (y1 - y0) * t + 0.5 * Math.sin(Math.PI * Math.pow(t, 0.8))), R2(z0 + (z1 - z0) * s)]; }); };
edge.forEach(([a, b], k) => { P({ id: `wbW${k}`, layer: "wbDie", shape: "sphere", size: [0.02], pos: [0, 0, 0], at: WARC(a, b), mat: "wire" }); });
// 覆晶：晶片正面朝下，整面 8×8 凸塊；抬高（爆開示意）讓凸塊與對應焊墊看得到
LAY("fcPads", [2.4, 0.1, BX + 3.8, BSUB]); P({ id: "fcPad", layer: "fcPads", shape: "cyl", size: [0.08, 0.02], rot: V, pos: [R2(BX + 3.8), R2(BSUB + 0.01), 0], at: bumpGrid(8, 1.8).map(([a, b]) => [a, 0, b]), mat: "gold" });
LAY("fcDie", [2.4, 0.6, BX + 3.8, 2.3]);
BOX("fcDieB", "fcDie", BX + 3.8 - BD / 2, BX + 3.8 + BD / 2, BSUB + 0.22, BSUB + 0.52, -BD / 2, BD / 2, "si");
P({ id: "fcBump", layer: "fcDie", shape: "sphere", size: [0.09], pos: [R2(BX + 3.8), R2(BSUB + 0.13), 0], at: bumpGrid(8, 1.8).map(([a, b]) => [a, 0, b]), mat: "sn" });
P({ id: "fcPillar", layer: "fcDie", shape: "cyl", size: [0.06, 0.08], rot: V, pos: [R2(BX + 3.8), R2(BSUB + 0.18), 0], at: bumpGrid(8, 1.8).map(([a, b]) => [a, 0, b]), mat: "cu" });
BOX("fcDieMark", "fcDie", BX + 3.8 - 0.9, BX + 3.8 - 0.6, BSUB + 0.52, BSUB + 0.53, 0.6, 0.9, "gold");

// ═════ 站 C：散熱蓋（s4）＝覆晶封裝：載板、凸塊、底部填充、晶片背面朝上、導熱膏、散熱蓋落下 ═════
const CX = 56, CSUB = 1.8;
LAY("cPlinth", [12, 1, CX, 0.5], true); BOX("cPl", "cPlinth", CX - 5.5, CX + 5.5, 0, 0.9, -3.2, 3.2, "band"); BOX("cPlTop", "cPlinth", CX - 5.5, CX + 5.5, 0.9, 1.0, -3.2, 3.2, "panel2");
LAY("cPkg", [6, 1.2, CX, 1.8]);
BOX("cSub", "cPkg", CX - 3, CX + 3, 1.0, CSUB, -2.6, 2.6, "sub"); P({ id: "cBall", layer: "cPkg", shape: "sphere", size: [0.13], pos: [CX, 1.0, 0], at: bumpGrid(9, 5.2).map(([a, b]) => [a, 0, b]), mat: "sn" });
P({ id: "cCap", layer: "cPkg", shape: "box", size: [0.2, 0.1, 0.12], pos: [0, R2(CSUB + 0.05), 0], at: [[CX - 2.4, 0, -2.0], [CX - 2.0, 0, -2.0], [CX + 2.2, 0, 2.0], [CX + 2.4, 0, -1.6], [CX - 2.3, 0, 1.8]], mat: "dark" });
BOX("cUf", "cPkg", CX - 1.25, CX + 1.25, CSUB, CSUB + 0.22, -1.25, 1.25, "ufCure");
BOX("cDie", "cPkg", CX - 1.15, CX + 1.15, CSUB + 0.22, CSUB + 0.55, -1.15, 1.15, "si");
LAY("cTim", [2.4, 0.1, CX, CSUB + 0.6]); BOX("cTimB", "cTim", CX - 1.05, CX + 1.05, CSUB + 0.55, CSUB + 0.62, -1.05, 1.05, "tim");
LAY("cLid", [6, 1, CX, 2.8]);
BOX("cLidTop", "cLid", CX - 2.8, CX + 2.8, CSUB + 0.62, CSUB + 0.82, -2.4, 2.4, "lid");
P({ id: "cLidWall", layer: "cLid", shape: "box", size: [5.6, 0.62, 0.2], pos: [CX, R2(CSUB + 0.31), 0], at: [[0, 0, -2.3], [0, 0, 2.3]], mat: "lid" }); P({ id: "cLidWallS", layer: "cLid", shape: "box", size: [0.2, 0.62, 4.6], pos: [0, R2(CSUB + 0.31), 0], at: [[CX - 2.7, 0, 0], [CX + 2.7, 0, 0]], mat: "lid" });
BOX("cLidMark", "cLid", CX - 2.4, CX - 1.6, CSUB + 0.82, CSUB + 0.83, 1.6, 2.1, "label");
LAY("cCut", [6, 1, CX, 2]);   /* 剖開示意：散熱蓋前牆在 s4 淡出，看得到裡面 */

// ═════ 站 D：凸塊怎麼長（晶圓剖面，s5）＝矽、晶片焊墊、保護層、凸塊下金屬層、光阻（開孔）、銅柱（四段長高）、錫帽（兩段）、回焊後圓頂 ═════
const DX = 78, DZ = 1.6, DB = [DX - 3.0, DX, DX + 3.0], DW = 1.1, DS0 = 2.4;
LAY("dPlinth", [12, 1, DX, 0.5], true); BOX("dPl", "dPlinth", DX - 5.8, DX + 5.8, 0, 0.9, -2.6, 2.6, "band"); BOX("dPlTop", "dPlinth", DX - 5.8, DX + 5.8, 0.9, 1.0, -2.6, 2.6, "panel2");
LAY("dWafer", [11, 1.6, DX, 1.8]);
BOX("dSi", "dWafer", DX - 5.2, DX + 5.2, 1.0, DS0, -DZ, DZ, "si"); P({ id: "dSiLine", layer: "dWafer", shape: "box", size: [10.4, 0.02, 0.02], pos: [DX, 0, DZ + 0.01], at: [1.5, 1.9, 2.2].map((y) => [0, y, 0]), mat: "siE" });
P({ id: "dPad", layer: "dWafer", shape: "box", size: [R2(DW + 0.4), 0.12, R2(2 * DZ - 0.4)], pos: [0, R2(DS0 + 0.06), 0], at: DB.map((x) => [x, 0, 0]), mat: "padAl" });
[[DX - 5.2, DB[0] - DW / 2], [DB[0] + DW / 2, DB[1] - DW / 2], [DB[1] + DW / 2, DB[2] - DW / 2], [DB[2] + DW / 2, DX + 5.2]].forEach(([a, b], i) => BOX(`dPass${i}`, "dWafer", a, b, DS0, DS0 + 0.2, -DZ, DZ, "pass"));
LAY("dUbm", [10.4, 0.1, DX, DS0 + 0.2]); BOX("dUbmB", "dUbm", DX - 5.2, DX + 5.2, DS0 + 0.2, DS0 + 0.26, -DZ, DZ, "ubm");
LAY("dUbmK", [10, 0.1, DX, DS0 + 0.15]); P({ id: "dUbmIn", layer: "dUbmK", shape: "box", size: [DW, 0.06, R2(2 * DZ - 0.2)], pos: [0, R2(DS0 + 0.15), 0], at: DB.map((x) => [x, 0, 0]), mat: "ubm" });
const RT = DS0 + 0.26, RH = 2.0;
LAY("dResist", [10.4, 2, DX, RT + 1]);
[[DX - 5.2, DB[0] - DW / 2], [DB[0] + DW / 2, DB[1] - DW / 2], [DB[1] + DW / 2, DB[2] - DW / 2], [DB[2] + DW / 2, DX + 5.2]].forEach(([a, b], i) => BOX(`dRes${i}`, "dResist", a, b, RT, RT + RH, -DZ, DZ, "resist"));
const CU = 1.4; for (let k = 0; k < 4; k++) { LAY(`dCu${k}`, [10, 0.4, DX, RT + (k + 0.5) * CU / 4]); P({ id: `dCuB${k}`, layer: `dCu${k}`, shape: "box", size: [DW, R2(CU / 4), R2(2 * DZ - 0.3)], pos: [0, R2(RT + (k + 0.5) * CU / 4), 0], at: DB.map((x) => [x, 0, 0]), mat: k % 2 ? "cuL" : "cu" }); }
for (let k = 0; k < 2; k++) { LAY(`dSn${k}`, [10, 0.3, DX, RT + CU + (k + 0.5) * 0.22]); P({ id: `dSnB${k}`, layer: `dSn${k}`, shape: "box", size: [DW, 0.22, R2(2 * DZ - 0.3)], pos: [0, R2(RT + CU + (k + 0.5) * 0.22), 0], at: DB.map((x) => [x, 0, 0]), mat: "sn" }); }
LAY("dDome", [10, 0.6, DX, RT + CU + 0.3]); P({ id: "dDomeB", layer: "dDome", shape: "sphere", size: [0.62], pos: [0, R2(RT + CU + 0.04), 0], at: DB.map((x) => [x, 0, 0]), scale: [0.95, 0.6, 1.25], mat: "sn" });
// 電鍍液（示意）：光阻開孔裡的小對流點（流動動作用）
LAY("dBath", [10, 2, DX, RT + 1]);

// ═════ 站 P：覆晶封裝剖面（s6 回焊自我對位、s7 熱脹冷縮、s8 底部填充）═════
const PX0 = 102, PZ = 1.6, PB = [-2.8, -1.4, 0, 1.4, 2.8].map((d) => R2(PX0 + d))   /* 5 顆凸塊、窄一點，鏡頭拉開時兩側邊緣、針筒、圓角都在畫面內 */, PSUB = 2.0, PPAD = 0.08, PCU0 = 2.62, PCU1 = 3.1, PDIE0 = 3.1, PDIE1 = 3.9;
LAY("pPlinth", [14, 1, PX0, 0.5], true); BOX("pPl", "pPlinth", PX0 - 5.4, PX0 + 5.4, 0, 0.9, -2.6, 2.6, "band"); BOX("pPlTop", "pPlinth", PX0 - 5.4, PX0 + 5.4, 0.9, 1.0, -2.6, 2.6, "panel2");
// 載板：左右兩半（熱脹時各往外伸），內部銅層線、焊墊、底部錫球
// 兩半在中間重疊 0.5（熱脹時各往外伸 0.38，仍連成一整塊，不會裂開）；右半略窄一點避免重疊面閃爍
for (const [s, a, b] of [["L", PX0 - 4.4, PX0 + 0.5], ["R", PX0 - 0.5, PX0 + 4.4]]) {
  LAY(`pSub${s}`, [6, 1, (a + b) / 2, 1.5]);
  BOX(`pSubB${s}`, `pSub${s}`, a, b, 1.0, s === "R" ? PSUB - 0.004 : PSUB, s === "R" ? -PZ + 0.004 : -PZ, s === "R" ? PZ - 0.004 : PZ, "sub");
  P({ id: `pSubCu${s}`, layer: `pSub${s}`, shape: "box", size: [R2(b - a), 0.04, 0.02], pos: [R2((a + b) / 2), 0, R2(PZ + (s === "R" ? 0.006 : 0.012))], at: [1.3, 1.55, 1.8].map((y) => [0, y, 0]), mat: "cu" });
  P({ id: `pBall${s}`, layer: `pSub${s}`, shape: "sphere", size: [0.2], pos: [0, 0.95, 0], at: [0.9, 2.1, 3.3, 4.5].map((d) => [R2(s === "L" ? PX0 - d : PX0 + d), 0, 0]), mat: "sn" });
}
/* 焊墊各自一層：熱脹時離中心越遠、跟著載板往外移越多（外圈 0.38、內圈 0.19、中心不動） */
PB.forEach((x, i) => { LAY(`pPad${i}`, [0.6, 0.3, x, 2.1]); P({ id: `pPadB${i}`, layer: `pPad${i}`, shape: "cyl", size: [0.38, PPAD], rot: V, pos: [x, R2(PSUB + PPAD / 2), 0], mat: "gold" }); });
// 晶片（倒扣）＋銅柱（與晶片一起動）
LAY("pDie", [11, 1.4, PX0, 3.4]);
BOX("pDieB", "pDie", PX0 - 3.5, PX0 + 3.5, PDIE0, PDIE1, -PZ + 0.2, PZ - 0.2, "si"); P({ id: "pDieLine", layer: "pDie", shape: "box", size: [10, 0.02, 0.02], pos: [PX0, 0, PZ - 0.19], at: [3.3, 3.5].map((y) => [0, y, 0]), mat: "siE" });
P({ id: "pCu", layer: "pDie", shape: "cyl", size: [0.28, R2(PCU1 - PCU0)], rot: V, pos: [0, R2((PCU0 + PCU1) / 2), 0], at: PB.map((x) => [x, 0, 0]), mat: "cu" });
// 錫：未熔（圓球，s6 放歪時隨晶片）｜熔化後（腰鼓形，連到焊墊；熱脹時外圈拉斜由兩側層位移表現）
LAY("pSnSolid", [11, 0.6, PX0, 2.4]); P({ id: "pSnS", layer: "pSnSolid", shape: "sphere", size: [0.27], pos: [0, R2(PCU0 - 0.26), 0], at: PB.map((x) => [x, 0, 0]), mat: "sn" });
for (const [s, f] of [["L", (x) => x < PX0 - 0.1], ["C", (x) => Math.abs(x - PX0) < 0.1], ["R", (x) => x > PX0 + 0.1]]) {
  LAY(`pSn${s}`, [6, 0.6, PX0, 2.4]);
  P({ id: `pSnM${s}`, layer: `pSn${s}`, shape: "sphere", size: [0.36], pos: [0, R2((PCU0 + PSUB + PPAD) / 2), 0], at: PB.filter(f).map((x) => [x, 0, 0]), scale: [1, 0.78, 1], mat: "sn" });
}
LAY("pHot", [11, 0.6, PX0, 2.4]); P({ id: "pHotB", layer: "pHot", shape: "sphere", size: [0.3], pos: [0, R2(PCU0 - 0.26), 0], at: PB.map((x) => [x, 0, 0]), mat: "snHot" });
// 熱脹冷縮：外圈焊點的裂紋（紅）
/* 熱脹時被扭的焊點：上端黏在銅柱（跟晶片不動）、下端跟焊墊往外移 → 斜成平行四邊形，越外圈越斜 */
const SH = [-0.38, -0.19, 0, 0.19, 0.38], SHH = R2(PCU0 - PSUB - PPAD);
LAY("pStrain", [11, 0.6, PX0, 2.4]);
PB.forEach((x, i) => { const off = SH[i], L = Math.hypot(SHH, off), ang = Math.atan2(off, SHH) / D2R;
  P({ id: `pStr${i}`, layer: "pStrain", shape: "box", size: [0.42, R2(L), 0.42], pos: [R2(x + off / 2), R2(PSUB + PPAD + SHH / 2), 0], rot: [0, 0, R2(ang)], mat: "sn" }); });
/* 裂紋：最外圈兩顆焊點和焊墊的交界，紅色細縫（示意） */
LAY("pCrack", [11, 0.4, PX0, 2.4]); P({ id: "pCrackB", layer: "pCrack", shape: "box", size: [0.46, 0.06, 0.48], pos: [0, R2(PSUB + PPAD + 0.06), 0], at: [[PB[0] + SH[0] * 0.85, 0, 0], [PB[4] + SH[4] * 0.85, 0, 0]].map(([x, y, z]) => [R2(x), y, z]), mat: "bad" });
// 底部填充：沿縫隙 10 段由左往右漸漸填滿（毛細前緣），濕膠（亮琥珀）→ 烤硬（深色）；兩側圓角
const UFN = 8, UF0 = PX0 - 3.5, UF1 = PX0 + 3.5;
for (let k = 0; k < UFN; k++) { LAY(`pUf${k}`, [1, 1, R2(UF0 + (k + 0.5) * (UF1 - UF0) / UFN), 2.6]); BOX(`pUfB${k}`, `pUf${k}`, UF0 + (k * (UF1 - UF0)) / UFN, UF0 + ((k + 1) * (UF1 - UF0)) / UFN, PSUB + 0.01, PDIE0 - 0.01, -PZ + 0.25, PZ - 0.25, "ufWet"); }
LAY("pUfFillet", [11, 1, PX0, 2.6]); /* 圓角（fillet）：晶片邊緣外一圈斜坡（單軸旋轉的方塊） */ P({ id: "pUfFil", layer: "pUfFillet", shape: "box", size: [0.5, 0.95, R2(2 * PZ - 0.5)], pos: [0, R2(PSUB + 0.33), 0], at: [[R2(UF1 + 0.05), 0, 0]], rot: [0, 0, 32], mat: "ufWet" }); P({ id: "pUfFil2", layer: "pUfFillet", shape: "box", size: [0.5, 0.95, R2(2 * PZ - 0.5)], pos: [0, R2(PSUB + 0.33), 0], at: [[R2(UF0 - 0.05), 0, 0]], rot: [0, 0, -32], mat: "ufWet" });
LAY("pUfCure", [11, 1, PX0, 2.6]); BOX("pUfC", "pUfCure", UF0, UF1, PSUB + 0.012, PDIE0 - 0.012, -PZ + 0.24, PZ - 0.24, "ufCure");
P({ id: "pUfCF", layer: "pUfCure", shape: "box", size: [0.5, 0.95, R2(2 * PZ - 0.48)], pos: [0, R2(PSUB + 0.33), 0], at: [[R2(UF1 + 0.05), 0, 0]], rot: [0, 0, 32], mat: "ufCure" }); P({ id: "pUfCF2", layer: "pUfCure", shape: "box", size: [0.5, 0.95, R2(2 * PZ - 0.48)], pos: [0, R2(PSUB + 0.33), 0], at: [[R2(UF0 - 0.05), 0, 0]], rot: [0, 0, -32], mat: "ufCure" });
// 點膠針頭（沿晶片左緣外側，針尖貼近縫口）
LAY("pNeedle", [1, 3, UF0 - 0.6, 4.5]);
VC("pNdTip", "pNeedle", 0.07, PSUB + 0.3, PSUB + 1.6, "steel2", { x: R2(UF0 - 0.55) }); VC("pNdHub", "pNeedle", 0.22, PSUB + 1.6, PSUB + 2.0, "dark", { x: R2(UF0 - 0.55) }); VC("pNdBarrel", "pNeedle", 0.4, PSUB + 2.0, PSUB + 3.6, "window", { x: R2(UF0 - 0.55) });
VC("pNdFluid", "pNeedle", 0.34, PSUB + 2.05, PSUB + 3.0, "ufWet", { x: R2(UF0 - 0.55) }); VC("pNdPlunger", "pNeedle", 0.36, PSUB + 3.0, PSUB + 3.2, "rubber", { x: R2(UF0 - 0.55) });
// 熱（回焊、熱脹時）：底下的加熱板發光
LAY("pHeater", [14, 0.3, PX0, 1.0]); BOX("pHeat", "pHeater", PX0 - 4.3, PX0 + 4.3, 0.96, 1.0, -PZ + 0.1, PZ - 0.1, "heat");

// ═════ 站 H：公司（s9）＝台灣地圖＋日月光（高雄）｜美國地圖＋安靠（亞利桑那 Tempe）；各自的展示台＋廠房（外型不同） ═════
const MAPJ = JSON.parse(fs.readFileSync(path.join(ROOT, "videos", "tech-mask2", "map.json"), "utf8")).rings;
const HX0 = 140, HTOP = 0.52;
const plant = (pid, lay, x, z, w, d, h, roof, y0, o = {}) => {
  BOX(`${pid}Pad`, lay, x - w / 2 - 0.3, x + w / 2 + 0.3, y0, y0 + 0.05, z - d / 2 - 0.3, z + d / 2 + 0.6, "panel2");
  BOX(`${pid}B`, lay, x - w / 2, x + w / 2, y0, y0 + h, z - d / 2, z + d / 2, "clean");
  const ns = Math.max(3, Math.floor(w / 0.32));
  P({ id: `${pid}Sm`, layer: lay, shape: "box", size: [0.02, R2(h * 0.9), 0.012], pos: [R2(x - w / 2), R2(y0 + h / 2), R2(z + d / 2 + 0.008)], at: Array.from({ length: ns }, (_, i) => [R2((w * (i + 1)) / (ns + 1)), 0, 0]), mat: "seam" });
  for (const yy of o.winRows ?? [0.68]) BOX(`${pid}Wn${yy * 100}`, lay, x - w * 0.45, x + w * 0.45, y0 + h * yy - h * 0.06, y0 + h * yy + h * 0.06, z + d / 2, z + d / 2 + 0.02, "win");
  BOX(`${pid}Bd`, lay, x - w / 2 - 0.01, x + w / 2 + 0.01, y0 + h * 0.9, y0 + h, z - d / 2 - 0.01, z + d / 2 + 0.01, roof);
  BOX(`${pid}R`, lay, x - w / 2 - 0.03, x + w / 2 + 0.03, y0 + h, y0 + h + 0.04, z - d / 2 - 0.03, z + d / 2 + 0.03, "panel2");
  const na = Math.max(2, Math.floor(w / (o.ahGap ?? 0.75)));
  P({ id: `${pid}Ah`, layer: lay, shape: "box", size: o.ahSize ?? [0.42, 0.22, 0.32], pos: [R2(x - w / 2 + 0.4), R2(y0 + h + 0.15), R2(z - d * 0.18)], at: Array.from({ length: na }, (_, i) => [R2(((w - 0.8) * i) / (na - 1)), 0, 0]), mat: "steel2" });
  P({ id: `${pid}Sk`, layer: lay, shape: "cyl", size: [0.07, o.stackH ?? 0.7], rot: V, pos: [R2(x + w / 2 - 0.3), R2(y0 + h + (o.stackH ?? 0.7) / 2), R2(z + d * 0.22)], at: [[0, 0, 0], [-0.25, 0, 0]], mat: "steel" });
  BOX(`${pid}Dk`, lay, x + w * 0.18, x + w * 0.38, y0, y0 + h * 0.32, z + d / 2, z + d / 2 + 0.03, "dark");
  VC(`${pid}N2`, lay, 0.16, y0, y0 + h * 0.85, "tank", { x: R2(x + w / 2 + 0.3), z: R2(z - d * 0.15) });
  if (o.sign) { const sw = o.signW; const sh = R2(sw / SIGNM[o.sign].aspect); P({ id: `${pid}Sp`, layer: lay, shape: "cyl", size: [0.03, 0.4], rot: V, pos: [R2(x - sw / 2 + 0.12), R2(y0 + 0.2), R2(z + d / 2 + 0.45)], at: [[0, 0, 0], [R2(sw - 0.24), 0, 0]], mat: "steel2" }); plate(`${pid}Sg`, lay, o.sign, sw, R2(x), R2(y0 + 0.38 + sh / 2), R2(z + d / 2 + 0.47)); }
  if (o.flag) { const ph = h * 1.35, px = R2(x + w / 2 + 0.75), pz = R2(z + d / 2 + 0.35); VC(`${pid}Pole`, lay, 0.025, y0, y0 + ph, "steel2", { x: px, z: pz }); const fw = 0.7; plate(`${pid}Flag`, lay, o.flag, fw, R2(px + fw / 2 + 0.03), R2(y0 + ph - fw / SIGNM[o.flag].aspect / 2 - 0.04), pz); }
};
const pin = (pid, lay, x, z, y0, r = 0.4, hgt = 1.8) => { VT(`${pid}Ring`, lay, r, r - 0.07, y0 + 0.01, y0 + 0.05, "pinR", { x, z }); VC(`${pid}Beam`, lay, 0.04, y0, y0 + hgt, "pinB", { x, z }); SPH(`${pid}Head`, lay, 0.13, x, R2(y0 + hgt + 0.08), z, "pinR"); };
const dots = (id, lay, a, b, y, n) => P({ id, layer: lay, shape: "sphere", size: [0.07], pos: [0, y, 0], at: Array.from({ length: n }, (_, i) => { const t = (i + 0.5) / n; return [R2(a[0] + (b[0] - a[0]) * t), 0, R2(a[1] + (b[1] - a[1]) * t)]; }), mat: "route" });
const mapTable = (lay, cx, cz, w, d, ring, proj) => {
  BOX(`${lay}Sea`, lay, cx - w / 2, cx + w / 2, 0, 0.3, cz - d / 2, cz + d / 2, "sea"); BOX(`${lay}Rim`, lay, cx - w / 2 - 0.3, cx + w / 2 + 0.3, -0.05, 0.22, cz - d / 2 - 0.3, cz + d / 2 + 0.3, "dark");
  const pts = ring.map(([lo, la]) => proj(lo, la)), xs = pts.map((p) => p[0]), zs = pts.map((p) => p[1]), mx = (Math.min(...xs) + Math.max(...xs)) / 2, mz = (Math.min(...zs) + Math.max(...zs)) / 2;
  P({ id: `${lay}Land`, layer: lay, shape: "poly", size: [1, 1, 0.22], pts: pts.map(([x, z]) => [R2(x - mx), R2(-(z - mz))]), rot: [-90, 0, 0], pos: [R2(mx), 0.3, R2(mz)], mat: "land" });
};
// 2026/11/27 第 40 條（公司卡期間鏡頭不切不搖）：三家放在同一張展示台上，一個鏡頭拍完——日月光（台灣）、安靠（美國）、Besi（荷蘭）三座外型不同的廠房＋各自國旗旗桿＋名牌
LAY("hDeck", [26, 1, HX0, 0.3], true);
BOX("hDeckB", "hDeck", HX0 - 12.5, HX0 + 12.5, 0, HTOP - 0.02, -4.2, 4.6, "band"); BOX("hDeckT", "hDeck", HX0 - 12.4, HX0 + 12.4, HTOP - 0.02, HTOP, -4.1, 4.5, "panel2");
P({ id: "hDeckSeam", layer: "hDeck", shape: "box", size: [0.06, 0.02, 8.6], pos: [0, HTOP + 0.005, 0.2], at: [HX0 - 4.2, HX0 + 4.2].map((x) => [x, 0, 0]), mat: "seam" });
LAY("hAse", [7, 4, HX0 - 8.2, 1.8]);
plant("as", "hAse", HX0 - 8.4, 0, 4.6, 2.2, 2.9, "roofASE", HTOP, { sign: "sign-fcase", signW: 2.6, flag: "flag-TW", winRows: [0.3, 0.55, 0.8] });
LAY("hAmk", [7, 3, HX0, 1.5]);
plant("am", "hAmk", HX0 - 0.2, 0, 6.0, 2.0, 1.8, "roofAMK", HTOP, { sign: "sign-fcamk", signW: 2.8, flag: "flag-US", winRows: [0.62], ahGap: 1.4, ahSize: [0.9, 0.36, 0.6], stackH: 1.4 });
LAY("hBesi", [7, 3, HX0 + 8.4, 1.5]);
materials.roofBesi = M("std", "#14A38B", { rough: 0.5, metal: 0.1 });
plant("bs", "hBesi", HX0 + 8.2, 0, 4.4, 2.0, 2.1, "roofBesi", HTOP, { sign: "sign-fcbesi", signW: 2.0, flag: "flag-NL", winRows: [0.45, 0.72] });
P({ id: "bsSaw", layer: "hBesi", shape: "poly", size: [1, 1, 2.0], pts: [[-2.2, 0], [-1.1, 0.55], [-1.1, 0], [0, 0.55], [0, 0], [1.1, 0.55], [1.1, 0], [2.2, 0.55], [2.2, 0]], pos: [R2(HX0 + 8.2), R2(HTOP + 2.14), -1.0], mat: "panel2" });
P({ id: "bsSawGlass", layer: "hBesi", shape: "box", size: [0.04, 0.5, 1.9], pos: [0, R2(HTOP + 2.4), 0], at: [-1.1, 0, 1.1, 2.2].map((d) => [R2(HX0 + 8.2 + d - 0.02), 0, 0]), mat: "win" });
// ═════ 站 N：下一集預告（s10）＝重組晶圓（黑色封模＋晶粒），重布線（金色細線）從晶粒邊緣往外扇出 ═════
const NX = 176;
LAY("nBase", [12, 1, NX, 0.5], true); BOX("nPl", "nBase", NX - 5.8, NX + 5.8, 0, 0.9, -5.0, 5.0, "band"); BOX("nPlTop", "nBase", NX - 5.8, NX + 5.8, 0.9, 1.0, -5.0, 5.0, "panel2");
LAY("nWafer", [9, 0.4, NX, 1.2]); VC("nMold", "nWafer", 4.2, 1.0, 1.3, "mold", { x: NX }); VT("nEdge", "nWafer", 4.22, 4.1, 1.0, 1.31, "steel2", { x: NX });
const ndies = []; for (let i = -2; i <= 2; i++) for (let j = -2; j <= 2; j++) { const x = i * 1.5, z = j * 1.5; if (Math.hypot(Math.abs(x) + 0.75, Math.abs(z) + 0.75) < 4.0) ndies.push([R2(NX + x), z]); }
P({ id: "nDie", layer: "nWafer", shape: "box", size: [0.6, 0.02, 0.6], pos: [0, 1.31, 0], at: ndies.map(([x, z]) => [x, 0, z]), mat: "si" });
LAY("nRdl", [9, 0.2, NX, 1.35]);
{ const segs = []; ndies.forEach(([x, z]) => [[-1, -1], [1, -1], [-1, 1], [1, 1], [0, -1], [0, 1], [-1, 0], [1, 0]].forEach(([a, b]) => { const x0 = x + a * 0.25, z0 = z + b * 0.25, x1 = x + a * 0.62, z1 = z + b * 0.62; segs.push([x0, z0, x1, z1]); }));
  segs.forEach(([x0, z0, x1, z1], k) => { const L = Math.hypot(x1 - x0, z1 - z0); P({ id: `nR${k}`, layer: "nRdl", shape: "box", size: [0.035, 0.012, R2(L)], pos: [R2((x0 + x1) / 2), 1.32, R2((z0 + z1) / 2)], rot: [0, R2(Math.atan2(x1 - x0, z1 - z0) / D2R), 0], mat: "rdl" }); });
  P({ id: "nBall", layer: "nRdl", shape: "sphere", size: [0.07], pos: [0, 1.36, 0], at: ndies.flatMap(([x, z]) => [[-0.62, -0.62], [0.62, -0.62], [-0.62, 0.62], [0.62, 0.62]].map(([a, b]) => [R2(x + a), 0, R2(z + b)])), mat: "sn" }); }

// ═════ 動作 ═════
const dieIds = idsOf("die"), flipIds = idsOf("flipper");
actions.flip = { type: "rotate", _說明: "翻面單元吸著晶粒繞水平軸轉 180 度（起轉、停轉減速），凸塊從朝上變朝下", parts: [...dieIds, ...flipIds], axis: [0, 0, 1], pivot: [PX, PY, 0], angle: -180, hold: true };
actions.flipBackArm = { type: "rotate", _說明: "交出晶粒後翻轉臂轉回原位（用已翻好的那一支 flipper2）", parts: idsOf("flipper2"), axis: [0, 0, 1], pivot: [PX, PY, 0], angle: 180, hold: true };
actions.vac = { type: "pulse", parts: ["flTip"], color: "okC", glow: 0.9, freq: 2, halo: 0 };
actions.vacHead = { type: "pulse", parts: ["hdNozzle"], color: "okC", glow: 0.9, freq: 2, halo: 0 };
actions.upcamFlash = { type: "pulse", parts: ["ucRing"], color: "ringLight", glow: 1, freq: 3, halo: 0.4 };
actions.fluxSpin = { type: "rotate", parts: ["fxPlate", "fxFilm"], axis: [0, 1, 0], pivot: [FX, 0, 0], rps: 0.25, rampSpin: true };
actions.sigWire = { type: "flow", _說明: "訊號沿金線的弧走（長）", layer: "wbDie", path: WARC(0.95, -0.17, 12).map(([x, y, z]) => [x, y, R2(z + 0.03)]), n: 3, size: 0.09, shape: "dot", rate: 0.45, color: "sigC", track: true };
actions.sigBump = { type: "flow", _說明: "訊號穿過凸塊直接往下（短）", layer: "fcDie", path: [[BX + 3.8 + 0.26, BSUB + 0.22, 0.26], [BX + 3.8 + 0.26, BSUB + 0.02, 0.26], [BX + 3.8 + 0.26, BSUB - 0.3, 0.26]], n: 3, size: 0.09, shape: "dot", rate: 0.45, color: "sigC", track: true };
actions.heatUp = { type: "flow", _說明: "熱從晶片背面經導熱膏、散熱蓋一路往上走（箭頭往上，示意）", layer: "cLid", path: [[CX - 0.9, CSUB + 0.9, 0], [CX - 0.9, CSUB + 1.9, 0], [CX - 0.9, CSUB + 3.0, 0]], n: 3, lanes: 3, laneDir: [1, 0, 0], laneGap: 0.9, size: 0.26, shape: "arrow", rate: 0.9, color: "heatC", track: false, free: true };
actions.dieHot = { type: "pulse", parts: ["cDie"], color: "heatC", glow: 0.7, freq: 1, halo: 0 };
actions.plate = { type: "flow", _說明: "電鍍液在光阻開孔裡微小對流（示意），銅離子往孔底走", layer: "dBath", path: [[DB[1] - 0.3, RT + 2.2, 1.0], [DB[1] - 0.2, RT + 1.2, 1.0], [DB[1] + 0.2, RT + 0.3, 1.0]], n: 6, lanes: 3, laneDir: [1, 0, 0], laneGap: 3.0, size: 0.07, shape: "dot", rate: 0.6, color: "cuL", track: false, free: true, jitter: 0.1 };
actions.meltM = { type: "pulse", parts: ["pSnML", "pSnMC", "pSnMR"], color: "snHot", glow: 0.9, freq: 1.2, halo: 0.15 };
actions.melt = { type: "pulse", parts: ["pHotB"], color: "snHot", glow: 1, freq: 1.5, halo: 0.2 };
actions.heaterOn = { type: "pulse", parts: ["pHeat"], color: "heatC", glow: 0.9, freq: 0.8, halo: 0, steady: true };
actions.crackP = { type: "pulse", parts: ["pCrackB"], color: "badC", glow: 1, freq: 2, halo: 0.3 };
actions.ufDrip = { type: "flow", _說明: "膠從針頭擠出、往縫口落（稠，慢）", layer: "pNeedle", path: [[UF0 - 0.55, PSUB + 0.3, 0.6], [UF0 - 0.45, PSUB + 0.05, 0.6], [UF0 - 0.1, PSUB + 0.05, 0.6]], n: 3, size: 0.1, shape: "dot", rate: 0.35, color: "ufWet", track: false, free: true, jitter: 0.02 };
actions.ufCureGlow = { type: "pulse", parts: ["pUfC", "pUfCF", "pUfCF2"], color: "heatC", glow: 0.25, freq: 1, halo: 0 };
actions.rdlGlow = { type: "pulse", parts: idsOf("nRdl").filter((i) => i.startsWith("nR")), color: "rdlC", glow: 0.6, freq: 1.2, halo: 0 };
actions.aseOn = { type: "pulse", parts: idsOf("hAse").filter((i) => i.startsWith("asWn")), color: "winC", glow: 0.9, freq: 1.2, halo: 0.3 };
actions.amkOn = { type: "pulse", parts: idsOf("hAmk").filter((i) => i.startsWith("amWn")), color: "winC", glow: 0.9, freq: 1.2, halo: 0.3 };
actions.besiOn = { type: "pulse", parts: idsOf("hBesi").filter((i) => i.startsWith("bsWn")), color: "winC", glow: 0.9, freq: 1.2, halo: 0.3 };

// ═════ 標註點 ═════
Object.assign(anchors, {
  wtable: A("wtable", [WX - 1.2, TY, 1.6], -150, 100), flipper: A("flipper", [PX, PY, 0.3], 150, -90), head: A("head", [HX + 0.6, HDIE_TOP + 1.0, 0.3], 150, -90), flux: A("flux", [FX + 0.6, DY + 0.26, 0.6], 150, 100), rail: A("rail", [SX + 1.6, SUBY, 0.6], 150, 100),
  dieA: A("die", [WX, TY + DT, 0.4], -150, -90), cover: A("cover", [5.0, GY + 1.05, 2.2], 150, -90), upcam: A("upcam", [-1.9, DY + 0.45, 0.35], -150, 100),
  wbWire: A("wbDie", [BX - 3.8 + 1.3, BSUB + 0.75, 0.95], -150, -90), fcBumpA: A("fcDie", [BX + 3.8 + 0.6, BSUB + 0.13, 0.9], 150, 100),
  lidA: A("cLid", [CX + 2.0, CSUB + 0.82, 1.8], 150, -90), timA: A("cTim", [CX + 0.9, CSUB + 0.62, 1.0], 150, 100),
  resistA: A("dResist", [DX + 4.2, RT + RH, DZ], 150, -90), cuA: A("dCu1", [DB[2] + 0.4, RT + 0.5, DZ], 150, 100), snA: A("dSn1", [DB[0] - 0.4, RT + CU + 0.3, DZ], -150, -90), domeA: A("dDome", [DB[1] + 0.4, RT + CU + 0.2, DZ], 150, -90),
  pSnA: A("pSnC", [PX0 + 0.3, PSUB + 0.3, 0.36], 150, 100), pDieA: A("pDie", [PX0 + 3.5, PDIE1, PZ - 0.2], 150, -90), pCrackA: A("pCrack", [R2(PB[4] + 0.32), PSUB + PPAD + 0.06, 0.24], 150, 100),
  pUfA: A("pUf4", [PX0 - 0.5, PSUB + 0.5, PZ - 0.25], 150, 100), pNeedleA: A("pNeedle", [UF0 - 0.55, PSUB + 1.2, 0], -150, -90),
  aseA: A("hAse", [HX0 - 9.8, HTOP + 2.4, 1.1], -150, -90), amkA: A("hAmk", [HX0 - 2.0, HTOP + 1.5, 1.0], -150, -90), besiA: A("hBesi", [HX0 + 9.6, HTOP + 1.8, 1.0], 150, -90),
  rdlA: A("nRdl", [NX + 1.5, 1.33, 1.5], 150, -90),
});

const model = {
  name: "示意 覆晶：覆晶接合機（晶圓台、翻面單元、助焊劑盤、接合頭、載板輸送軌）、打線 vs 覆晶、散熱蓋、凸塊電鍍剖面、回焊自我對位、熱脹冷縮、底部填充、封測廠地圖、扇出型預告（示意，非特定廠牌／型號）",
  unit: "示意（放大比例）",
  size: { w: 40, h: 18, r: 0.6, t: 30 },
  palette, materials,
  partNames: { die: "晶粒", flipper: "翻面單元", head: "接合頭", flux: "助焊劑盤", rail: "載板" },
  layers, parts, anchors, actions,
  pose: { yaw0: 0, yawIso: 0, drift: 0 },
  camera: { stand: { d: 40, elev: 30, y: 3 } },
  fx: { dpr: 1, srcPx: 30, shadows: 0, fog: false, dust: false, vaporSprites: false, shimmer: false },
  info: { DY, WX, TY, DT, PX, PY, HX, HDIE_TOP, FX, SX, SUBY, GY, BX, CX, CSUB, DX, RT, CU, PX0, PB, PSUB, PCU0, UFN, UF0, UF1, HX0, NX },
};
fs.writeFileSync(path.join(HERE, "model.json"), JSON.stringify(model, null, 1) + "\n");
console.log(`✔ model.json：${parts.length} 個零件、${parts.reduce((a, p) => a + Math.max(1, p.at?.length ?? 0), 0)} 個實體、${layers.length} 層`);

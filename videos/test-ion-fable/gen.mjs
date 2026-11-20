// node videos/test-ion-fable/gen.mjs：產生 model.json 與 script.json（離子佈植機：離子源 → 加速管 → 分析磁鐵 → 終端站晶圓 → 剖面摻雜區）。
// 要算座標的零件（扇形磁鐵、螺栓圈、離子逐幀軌跡、面向鏡頭的剖面放大卡）都在這裡算；改模型改這支，不要手改 json。
// 單位：示意比例（晶圓半徑 1.5）；x 向右、y 向上、z 向觀眾。引擎與共用程式完全沒動。
import fs from "node:fs";
import path from "node:path";
const DIR = path.dirname(new URL(import.meta.url).pathname), SLUG = "test-ion-fable";
const R3 = (x) => Math.round(x * 1000) / 1000, D2R = Math.PI / 180;
const parts = [], layers = [], anchors = {}, actions = {}, kin = {}, palette = {}, materials = {};
const L = (id, o = {}) => { if (!layers.find((l) => l.id === id)) layers.push({ id, z: 0, k: 0, ...o }); return id; };
let auto = 0;
const P = (id, layer, shape, size, pos, mat, o = {}) => {
  L(layer); if (!materials[mat]) throw new Error("沒有材質 " + mat);
  const p = { id: id ?? `p${auto++}`, layer, shape, size: size.map(R3), pos: pos.map(R3), mat, ...o };
  if (p.at) p.at = p.at.map((a) => a.map(R3)); if (p.rot) p.rot = p.rot.map(R3);
  if (parts.find((q) => q.id === p.id)) throw new Error("零件 id 重複 " + p.id);
  parts.push(p); return p.id;
};
const AX = [0, 90, 0], AY = [90, 0, 0];
const C_ = (name, hex) => { palette[name] = hex; return name; };
const M = (name, color, o = {}) => { materials[name] = { kind: "std", color, rough: 0.5, metal: 0, ...o }; return name; };
const U = (name, color, o = {}) => { materials[name] = { kind: "unlit", color, ...o }; return name; };

// ── 色票與材質（淺色皮膚：白與淺藍灰的機台、品牌藍、橘色主角） ──
C_("shell", "#EEF2F8"); C_("shell2", "#D5DEEC"); C_("seam", "#8FA0BC"); C_("navy", "#33415E"); C_("navy2", "#1F2A44");
C_("steel", "#9AA8BE"); C_("steel2", "#73819B"); C_("copper", "#D08A4A"); C_("coil", "#E07B2C"); C_("glass", "#BFD3F2");
C_("ceramic", "#F6F2E7"); C_("yoke", "#2B63C9"); C_("yoke2", "#1F4FA8"); C_("hazard", "#FFC21A"); C_("black", "#1B2233");
C_("ledG", "#19C37D"); C_("ledR", "#E5484D"); C_("ledA", "#FF9F1C"); C_("blue", "#1F6FEB");
C_("ionR", "#FF8A1F"); C_("ionH", "#6A4FD0"); C_("ionL", "#12B5C6"); C_("white", "#FFFFFF"); C_("spark", "#FFD84A");
C_("plasma", "#C77DFF"); C_("beam", "#FFA63D"); C_("wafer", "#B4C2DA"); C_("die", "#5E8BE0"); C_("die2", "#7FA4E0");
C_("floor", "#E3E9F2"); C_("floorLn", "#C2CDDE"); C_("ceil", "#EEF2F8"); C_("ffu", "#FFFFFF"); C_("wall", "#DAE2EE"); C_("far", "#B4C1D6"); C_("shadow", "#0B1220");
C_("si", "#CBD8EC"); C_("siAtom", "#93A6C6"); C_("vac", "#F1F6FE"); C_("cardEdge", "#1F6FEB"); C_("hose", "#3F4E6B"); C_("pump", "#4A6FB5"); C_("screen", "#2F80ED");
M("shell", "shell", { rough: 0.55 }); M("shell2", "shell2", { rough: 0.6 }); M("seam", "seam", { rough: 0.7 }); M("navy", "navy", { rough: 0.5, metal: 0.2 }); M("navy2", "navy2", { rough: 0.6 });
M("steel", "steel", { rough: 0.3, metal: 0.85, env: 0.5 }); M("steel2", "steel2", { rough: 0.35, metal: 0.8 }); M("brushed", "steel", { rough: 0.3, metal: 0.9, tex: "brushed", texScale: 1.6, env: 0.6 });
M("copper", "copper", { rough: 0.3, metal: 0.9, env: 0.6 }); M("coil", "coil", { rough: 0.45, metal: 0.55 }); M("coilTop", "coil", { rough: 0.45, metal: 0.55 });
materials.glass = { kind: "phys", color: "glass", rough: 0.12, metal: 0, clearcoat: 0.8, opacity: 0.2, env: 0.5 };
materials.glass2 = { kind: "phys", color: "glass", rough: 0.12, metal: 0, clearcoat: 0.8, opacity: 0.13, env: 0.4 };
M("ceramic", "ceramic", { rough: 0.35 }); M("yoke", "yoke", { rough: 0.45, metal: 0.25 }); M("yoke2", "yoke2", { rough: 0.5, metal: 0.25 }); M("yokeTop", "yoke", { rough: 0.45, metal: 0.25 });
M("hazard", "hazard", { rough: 0.6 }); M("black", "black", { rough: 0.6 }); U("ledG", "ledG"); U("ledR", "ledR"); U("ledA", "ledA"); M("blue", "blue", { rough: 0.5 });
M("hose", "hose", { rough: 0.65 }); M("pump", "pump", { rough: 0.4, metal: 0.5 });
materials.screen = { kind: "screen", color: "screen", ei: 0.9 };
for (const k of ["R", "H", "L"]) { M("ion" + k, "ion" + k, { rough: 0.35, emissive: "ion" + k, ei: 0.55 }); [0.55, 0.34, 0.18].forEach((o, i) => U(`trail${k}${i}`, "ion" + k, { opacity: o })); }
U("plus", "white"); U("plasma", "plasma", { opacity: 0.75 }); M("filament", "copper", { rough: 0.4, metal: 0.6, emissive: "ledA", ei: 0.2 });
U("ray", "beam", { opacity: 0.3 }); U("spot", "beam", { opacity: 0.95 }); C_("tint", "#FFB03A"); U("tint", "tint", { opacity: 0.5 }); U("scorch", "navy2", { opacity: 0.5 });
materials.wafer = { kind: "phys", color: "wafer", rough: 0.1, metal: 0.45, clearcoat: 1, env: 0.9 };
materials.die = { kind: "phys", color: "die", rough: 0.15, metal: 0.2, clearcoat: 1, tex: "traces", texScale: 0.5, env: 1.2 }; materials.die2 = { kind: "phys", color: "die2", rough: 0.15, metal: 0.2, clearcoat: 1, tex: "traces", texScale: 0.4, env: 1.2 };
M("floor", "floor", { rough: 0.9 }); U("floorLn", "floorLn"); U("perf", "floorLn"); M("ceil", "ceil", { rough: 0.9 }); U("ffu", "ffu"); M("wall", "wall", { rough: 0.9 }); M("far", "far", { rough: 0.8 }); M("far2", "seam", { rough: 0.8 });
U("shadow", "shadow", { opacity: 0.1 }); U("tape", "hazard");
U("card", "white"); U("cardEdge", "cardEdge"); U("vac", "vac"); U("si", "si"); U("siAtom", "siAtom"); U("ink", "navy2"); U("guide", "cardEdge", { opacity: 0.55 });
[0.08, 0.16, 0.26, 0.37, 0.49, 0.61, 0.73, 0.84, 0.94].forEach((o, i) => U("dope" + i, "ionR", { opacity: o }));
// 加速管電極：電位由高到低，顏色由深藍到淺藍
const lerpHex = (a, b, t) => "#" + [1, 3, 5].map((i) => Math.round(parseInt(a.slice(i, i + 2), 16) * (1 - t) + parseInt(b.slice(i, i + 2), 16) * t).toString(16).padStart(2, "0")).join("");
const NEL = 10;
for (let i = 0; i < NEL; i++) { C_("el" + i, lerpHex("#1F4FA8", "#A9C4F0", i / (NEL - 1))); M("el" + i, "el" + i, { rough: 0.3, metal: 0.7, env: 0.5 }); materials["elD" + i] = { kind: "phys", color: "el" + i, rough: 0.15, metal: 0, clearcoat: 0.6, opacity: 0.26, env: 0.4 }; }

// ── 幾何常數 ──
const yB = 4.0, zA = 2.4;                    // 射束高度；第一段（沿 +x）的 z
const E = [-2.4, zA], Cm = [-2.4, -0.6], Rm = 3.0; // 磁鐵入口、圓心、半徑（90 度）
const X = [0.6, -0.6];                        // 磁鐵出口，之後沿 −z
const xSrc = -10.6, xT0 = -9.3, xT1 = -5.0;   // 離子出生點、加速管入口／出口
const zPs = -2.8, zW = -6.86;                 // 掃描板樞紐、晶圓正面
const DUCT_IN = 2.3, DUCT_OUT = 3.7;

// ── 小工具 ──
const ringPts = (R, n, a0 = 0) => Array.from({ length: n }, (_, i) => { const a = a0 + (i / n) * Math.PI * 2; return [R * Math.cos(a), R * Math.sin(a)]; });
const boltsX = (id, layer, c, R, n, r = 0.05, len = 0.08, mat = "steel2") => P(id, layer, "cyl", [r, len], c, mat, { rot: AX, at: ringPts(R, n, 0.3).map(([a, b]) => [0, a, b]) });
const boltsZ = (id, layer, c, R, n, r = 0.05, len = 0.08, mat = "steel2") => P(id, layer, "cyl", [r, len], c, mat, { at: ringPts(R, n, 0.3).map(([a, b]) => [a, b, 0]) });
const boltsY = (id, layer, c, pts, r = 0.07, len = 0.08, mat = "steel2") => P(id, layer, "cyl", [r, len], c, mat, { rot: AY, at: pts.map(([a, b]) => [a, 0, b]) });
/** 直立的陶瓷絕緣柱（傘裙） */
const insulator = (id, layer, x, y0, y1, z, r = 0.16, n = 3) => {
  P(id + "c", layer, "cyl", [r, y1 - y0], [x, (y0 + y1) / 2, z], "ceramic", { rot: AY });
  P(id + "f", layer, "cyl", [r * 1.75, 0.07], [x, y0, z], "ceramic", { rot: AY, at: Array.from({ length: n }, (_, i) => [0, ((i + 1) * (y1 - y0)) / (n + 1), 0]) });
};
/** 機櫃：本體＋踢腳＋頂板＋正面（+z）與右側（+x）的門板、縫、螺絲、把手、散熱縫 */
const cabinet = (id, layer, x0, x1, y1, z0, z1, o = {}) => {
  const w = x1 - x0, d = z1 - z0, cx = (x0 + x1) / 2, cz = (z0 + z1) / 2, kick = 0.26;
  P(id + "_body", layer, "box", [w, y1 - kick, d], [cx, kick + (y1 - kick) / 2, cz], "shell2");
  P(id + "_kick", layer, "box", [w - 0.16, kick, d - 0.16], [cx, kick / 2, cz], "navy");
  P(id + "_top", layer, "slab", [w + 0.1, d + 0.1, 0.1], [cx, y1 + 0.05, cz], "shell", { rot: AY, r: 0.12, bevel: 0.02 });
  P(id + "_feet", layer, "cyl", [0.13, 0.08], [cx, 0.03, cz], "steel2", { rot: AY, at: [[-w / 2 + 0.3, 0, -d / 2 + 0.3], [w / 2 - 0.3, 0, -d / 2 + 0.3], [-w / 2 + 0.3, 0, d / 2 - 0.3], [w / 2 - 0.3, 0, d / 2 - 0.3]] });
  P(id + "_shadow", "room", "plane", [w + 1.0, d + 1.0], [cx + 0.2, 0.012, cz + 0.15], "shadow", { rot: [-90, 0, 0], r: 0.4 });
  const face = (tag, n, len, u0, mk) => {
    const pw = (len - 0.24) / n, ph = y1 - kick - 0.3, py = kick + 0.15 + ph / 2, doors = [], screws = [], handles = [], vents = [];
    for (let i = 0; i < n; i++) {
      const u = u0 + 0.12 + pw * (i + 0.5);
      doors.push(u);
      for (const [a, b] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) screws.push([u + a * (pw / 2 - 0.14), py + b * (ph / 2 - 0.14)]);
      handles.push([u + (i % 2 ? -1 : 1) * (pw / 2 - 0.3), py + 0.1]);
      for (let k = 0; k < 4; k++) vents.push([u, kick + 0.42 + k * 0.13]);
    }
    mk(doors, screws, handles, vents, pw, ph, py);
  };
  if (o.front !== false) face("f", o.nf ?? Math.max(1, Math.round(w / 1.7)), w, x0, (doors, screws, handles, vents, pw, ph, py) => {
    P(id + "_fd", layer, "slab", [pw - 0.07, ph, 0.06], [0, py, z1 + 0.03], "shell", { r: 0.07, bevel: 0.015, at: doors.map((u) => [u, 0, 0]) });
    P(id + "_fs", layer, "cyl", [0.05, 0.03], [0, 0, z1 + 0.075], "steel2", { at: screws.map(([u, v]) => [u, v, 0]) });
    P(id + "_fh", layer, "box", [0.07, 0.5, 0.07], [0, 0, z1 + 0.1], "navy", { at: handles.map(([u, v]) => [u, v, 0]) });
    P(id + "_fv", layer, "box", [pw * 0.5, 0.045, 0.02], [0, 0, z1 + 0.07], "seam", { at: vents.map(([u, v]) => [u, v, 0]) });
  });
  if (o.side !== false) face("s", o.ns ?? Math.max(1, Math.round(d / 1.7)), d, z0, (doors, screws, handles, vents, pw, ph, py) => {
    P(id + "_sd", layer, "slab", [pw - 0.07, ph, 0.06], [x1 + 0.03, py, 0], "shell", { rot: AX, r: 0.07, bevel: 0.015, at: doors.map((u) => [0, 0, u]) });
    P(id + "_ss", layer, "cyl", [0.05, 0.03], [x1 + 0.075, 0, 0], "steel2", { rot: AX, at: screws.map(([u, v]) => [0, v, u]) });
    P(id + "_sv", layer, "box", [0.02, 0.045, pw * 0.5], [x1 + 0.07, 0, 0], "seam", { at: vents.map(([u, v]) => [0, v, u]) });
  });
};
/** 兩點之間一根圓柱（軸預設 z；先繞 x 再繞 y） */
const rodBetween = (id, layer, a, b, r, mat) => {
  const d = [b[0] - a[0], b[1] - a[1], b[2] - a[2]], len = Math.hypot(...d), u = d.map((x) => x / len);
  return P(id, layer, "cyl", [r, len], [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2], mat, { rot: [(Math.asin(-u[1]) * 180) / Math.PI, (Math.atan2(u[0], u[2]) * 180) / Math.PI, 0] });
};
const hose = (id, layer, pts, r, mat = "hose") => { pts.slice(1).forEach((p, i) => rodBetween(`${id}_${i}`, layer, pts[i], p, r, mat)); P(id + "_j", layer, "sphere", [r * 1.02], pts[1], mat, { at: pts.slice(1, -1).map((p) => [p[0] - pts[1][0], p[1] - pts[1][1], p[2] - pts[1][2]]) }); };
/** 法蘭（軸沿 x）：兩片對鎖＋螺栓圈 */
const flangeX = (id, layer, x, R = 0.66, bore = 0.4) => { P(id, layer, "tube", [R, bore, 0.16], [x, yB, zA], "steel", { rot: AX, bevel: 0.015 }); boltsX(id + "_b", layer, [x, yB, zA], R - 0.11, 8, 0.045, 0.24); };
const flangeZ = (id, layer, z, R = 0.66, bore = 0.4, x = X[0]) => { P(id, layer, "tube", [R, bore, 0.16], [x, yB, z], "steel", { bevel: 0.015 }); boltsZ(id + "_b", layer, [x, yB, z], R - 0.11, 8, 0.045, 0.24); };

// ══ 一、無塵室（背景層） ══
L("room", { bg: true });
P("floor", "room", "plane", [150, 130], [-4, 0, -14], "floor", { rot: [-90, 0, 0] });
{
  const xs = [], zs = [];
  for (let x = -76; x <= 68; x += 3) xs.push([x, 0, 0]);
  for (let z = -76; z <= 46; z += 3) zs.push([0, 0, z]);
  P("floorX", "room", "box", [0.05, 0.01, 124], [0, 0.006, -15], "floorLn", { at: xs });
  P("floorZ", "room", "box", [146, 0.01, 0.05], [-4, 0.006, 0], "floorLn", { at: zs });
  // 幾塊開孔地板（回風）
  const dots = [];
  for (const [tx, tz] of [[-14.5, 6.5], [-5.5, 6.5], [3.5, 6.5], [6.5, -2.5], [6.5, -8.5], [-8.5, -5.5], [-17.5, -2.5], [-2.5, -11.5], [9.5, 3.5], [-11.5, -11.5]]) for (let i = 0; i < 6; i++) for (let j = 0; j < 6; j++) dots.push([tx + (i - 2.5) * 0.42, 0, tz + (j - 2.5) * 0.42]);
  P("perf", "room", "cyl", [0.085, 0.01], [0, 0.008, 0], "perf", { rot: AY, at: dots });
  // 機台周圍的黃色警戒線
  const x0 = -14.2, x1 = 4.6, z0 = -10.2, z1 = 5.2;
  P("tapeX", "room", "box", [x1 - x0, 0.012, 0.14], [(x0 + x1) / 2, 0.01, 0], "tape", { at: [[0, 0, z0], [0, 0, z1]] });
  P("tapeZ", "room", "box", [0.14, 0.012, z1 - z0], [0, 0.01, (z0 + z1) / 2], "tape", { at: [[x0, 0, 0], [x1, 0, 0]] });
  // 天花板：T 型架＋風機過濾單元（發亮的白板）
  const CY = 18;
  P("ceil", "room", "plane", [150, 44], [-4, CY, -32], "ceil", { rot: [90, 0, 0] });
  const ff = [], cl = [], cl2 = [];
  for (let i = -12; i <= 11; i++) for (let j = 3; j < 10; j++) if ((i + j) % 2 === 0) ff.push([i * 6 + 3, 0, -72 + j * 6 + 3]);
  for (let i = -12; i <= 12; i++) cl.push([i * 6, 0, 0]);
  for (let j = 3; j <= 10; j++) cl2.push([0, 0, -72 + j * 6]);
  P("ffu", "room", "plane", [5.2, 5.2], [-4, CY - 0.02, 0], "ffu", { rot: [90, 0, 0], r: 0.2, at: ff });
  P("ceilX", "room", "box", [0.14, 0.1, 44], [-4, CY - 0.05, -32], "wall", { at: cl });
  P("ceilZ", "room", "box", [150, 0.1, 0.14], [-4, CY - 0.05, 0], "wall", { at: cl2 });
  // 遠處的牆（板縫、觀察窗）
  P("wallB", "room", "plane", [150, CY], [-4, CY / 2, -54], "wall");
  P("wallBs", "room", "box", [0.1, CY, 0.05], [-4, CY / 2, -53.95], "far2", { at: Array.from({ length: 25 }, (_, i) => [(i - 12) * 6, 0, 0]) });
  P("wallBw", "room", "plane", [44, 3.2], [-10, 6.2, -53.9], "far2", { r: 0.3 });
  P("wallL", "room", "plane", [110, CY], [-62, CY / 2, -10], "wall", { rot: [0, 90, 0] });
  P("wallLs", "room", "box", [0.05, CY, 0.1], [-61.95, CY / 2, -10], "far2", { at: Array.from({ length: 17 }, (_, i) => [0, 0, (i - 8) * 6]) });
  // 遠處其他機台的輪廓（本體＋上層＋窗＋燈塔）
  const tools = [[-40, -40, 12, 6.5, 8], [-22, -44, 9, 5.5, 6], [-5, -42, 14, 7.5, 7], [16, -40, 10, 6, 8], [32, -34, 9, 7, 9], [-48, -22, 8, 6, 12], [-30, -27, 10, 5, 6], [24, -22, 8, 5.5, 7], [40, -14, 7, 6.5, 10]];
  tools.forEach(([x, z, w, h, d], i) => {
    P(`tool${i}`, "room", "box", [w, h, d], [x, h / 2, z], "far");
    P(`tool${i}u`, "room", "box", [w * 0.6, 1.6, d * 0.7], [x - w * 0.12, h + 0.8, z], "far2");
    P(`tool${i}w`, "room", "plane", [w * 0.5, h * 0.22], [x + w * 0.1, h * 0.68, z + d / 2 + 0.03], "wall", { r: 0.2 });
    P(`tool${i}t`, "room", "cyl", [0.18, 1.5], [x + w / 2 - 0.6, h + 0.75, z + d / 2 - 0.6], i % 3 === 0 ? "ledA" : "ledG", { rot: AY });
    P(`tool${i}k`, "room", "box", [w + 0.1, 0.4, d + 0.1], [x, 0.2, z], "far2");
  });
  // 天車軌道（懸吊式搬運）
  P("oht", "room", "box", [150, 0.3, 0.5], [-4, 13.4, -18], "far2", { at: [[0, 0, 0], [0, 0, -14]] });
  P("ohtH", "room", "box", [0.16, 4.5, 0.16], [0, 15.7, -18], "far2", { at: Array.from({ length: 16 }, (_, i) => [(i - 8) * 9, 0, i % 2 ? 0 : -14]) });
  P("ohtV", "room", "box", [2.4, 1.5, 1.6], [-21, 12.5, -18], "far", { at: [[0, 0, 0], [34, 0, -14]] });
}

// ══ 二、離子源（高壓端） ══
L("src");
cabinet("srcCab", "src", -12.9, -9.5, 2.5, 0.8, 4.0, { nf: 2, ns: 2 });
// 高壓警示：菱形黃牌＋閃電、黃黑斜紋條
P("hvSign", "src", "slab", [0.74, 0.74, 0.03], [-12.05, 1.55, 4.1], "hazard", { rot: [0, 0, 45], r: 0.07 });
P("hvBolt1", "src", "box", [0.09, 0.3, 0.02], [-12.0, 1.68, 4.125], "black", { rot: [0, 0, -24] });
P("hvBolt2", "src", "box", [0.26, 0.08, 0.02], [-12.05, 1.55, 4.125], "black", { rot: [0, 0, 12] });
P("hvBolt3", "src", "box", [0.09, 0.3, 0.02], [-12.1, 1.42, 4.125], "black", { rot: [0, 0, -24] });
P("hvBar", "src", "box", [3.3, 0.2, 0.05], [-11.2, 2.34, 4.09], "hazard");
P("hvStripe", "src", "box", [0.13, 0.26, 0.02], [-11.2, 2.34, 4.12], "black", { rot: [0, 0, -38], at: Array.from({ length: 11 }, (_, i) => [(i - 5) * 0.3, 0, 0]) });
// 指示燈與小螢幕
P("srcLedG", "src", "cyl", [0.075, 0.05], [-10.25, 2.02, 4.1], "ledG");
P("srcLedA", "src", "cyl", [0.075, 0.05], [-10.02, 2.02, 4.1], "ledA");
P("srcLedR", "src", "cyl", [0.075, 0.05], [-9.79, 2.02, 4.1], "ledR");
P("srcScr", "src", "plane", [0.74, 0.44], [-10.02, 1.55, 4.1], "screen", { r: 0.05 });
// 絕緣支柱＋源平台
for (const [i, [x, z]] of [[-12.4, 1.4], [-10.0, 1.4], [-12.4, 3.4], [-10.0, 3.4]].entries()) insulator(`srcIns${i}`, "src", x, 2.6, 3.06, z, 0.15, 2);
P("srcDeck", "src", "slab", [3.0, 2.5, 0.1], [-11.2, 3.11, 2.4], "brushed", { rot: AY, r: 0.12, bevel: 0.02 });
P("srcCradle", "src", "box", [0.16, 0.24, 1.1], [-11.0, 3.26, 2.4], "navy", { at: [[-0.6, 0, 0], [0.6, 0, 0]] });
// 源腔體：玻璃筒＋前後法蘭＋螺栓
P("srcShell", "src", "tube", [0.8, 0.74, 1.9], [-10.95, yB, zA], "glass", { rot: AX });
P("srcBack", "src", "cyl", [0.9, 0.16], [-11.98, yB, zA], "steel", { rot: AX });
boltsX("srcBackB", "src", [-12.07, yB, zA], 0.76, 10, 0.05, 0.06);
P("srcFront", "src", "tube", [0.9, 0.3, 0.16], [-9.92, yB, zA], "steel", { rot: AX, bevel: 0.015 });
boltsX("srcFrontB", "src", [-9.83, yB, zA], 0.76, 10, 0.05, 0.06);
P("srcBand", "src", "tube", [0.83, 0.8, 0.12], [-10.95, yB, zA], "steel2", { rot: AX, at: [[-0.5, 0, 0], [0.5, 0, 0]] });
// 電弧室（半透明深色盒）、電漿、燈絲、引出電極
P("arcBase", "src", "box", [1.0, 0.07, 0.56], [-11.0, yB - 0.3, zA], "navy2");
P("arcTop", "src", "box", [1.0, 0.07, 0.56], [-11.0, yB + 0.3, zA], "navy2");
P("arcBackW", "src", "box", [0.07, 0.6, 0.56], [-11.5, yB, zA], "navy2");
P("arcRear", "src", "box", [1.0, 0.6, 0.06], [-11.0, yB, zA - 0.28], "navy2");
P("arcPost", "src", "box", [0.07, 0.53, 0.07], [-10.53, yB, zA], "navy2", { at: [[0, 0, 0.24], [0, 0, -0.24]] });
P("plasma", "src", "sphere", [0.2], [-10.98, yB, zA], "plasma", { scale: [1.9, 1, 1] });
P("filament", "src", "tube", [0.13, 0.09, 0.04], [-11.36, yB, zA], "filament", { rot: AX, at: [[0, 0, 0], [0.07, 0, 0], [0.14, 0, 0]] });
P("extract", "src", "tube", [0.5, 0.25, 0.06], [-10.22, yB, zA], "copper", { rot: AX, at: [[0, 0, 0], [0.2, 0, 0]] });
// 後端的絕緣饋入與電纜、氣瓶與氣體管
P("feedIns", "src", "cyl", [0.2, 0.5], [-12.3, yB, zA], "ceramic", { rot: AX });
P("feedRib", "src", "cyl", [0.3, 0.06], [-12.3, yB, zA], "ceramic", { rot: AX, at: [[-0.15, 0, 0], [0, 0, 0], [0.15, 0, 0]] });
hose("feedCab", "src", [[-12.55, yB, zA], [-12.75, yB, zA], [-12.75, 3.2, zA + 0.3], [-12.6, 2.6, zA + 0.5]], 0.06, "black");
P("gasBot", "src", "cyl", [0.3, 1.5], [-12.2, 3.91, 1.3], "shell", { rot: AY });
P("gasCap", "src", "sphere", [0.3], [-12.2, 4.66, 1.3], "shell", { scale: [1, 0.6, 1] });
P("gasBand", "src", "tube", [0.31, 0.29, 0.22], [-12.2, 4.2, 1.3], "blue", { rot: AY });
P("gasValve", "src", "cyl", [0.08, 0.26], [-12.2, 4.95, 1.3], "copper", { rot: AY });
P("gasWheel", "src", "tube", [0.16, 0.11, 0.04], [-12.2, 5.1, 1.3], "ledR", { rot: AY });
hose("gasLine", "src", [[-12.2, 4.98, 1.3], [-11.5, 4.98, 1.3], [-11.5, 4.98, 2.05], [-11.5, 4.76, 2.2]], 0.035, "copper");
// 高壓籠：立柱＋上框
P("cagePost", "src", "box", [0.07, 2.9, 0.07], [-11.2, 4.61, 2.4], "steel2", { at: [[-1.55, 0, -1.25], [1.55, 0, -1.25], [-1.55, 0, 1.25], [1.55, 0, 1.25]] });
P("cageTopX", "src", "box", [3.17, 0.07, 0.07], [-11.2, 6.06, 2.4], "steel2", { at: [[0, 0, -1.25], [0, 0, 1.25]] });
P("cageTopZ", "src", "box", [0.07, 0.07, 2.5], [-11.2, 6.06, 2.4], "steel2", { at: [[-1.55, 0, 0], [1.55, 0, 0]] });
anchors.src = { layer: "src", p: [-10.95, yB + 0.82, zA], dx: -60, dy: -150 };

// ══ 三、加速管（分段電極環） ══
L("tube");
cabinet("tubeCab", "tube", -9.2, -3.2, 2.5, 1.1, 3.7, { nf: 3, ns: 1 });
P("tubeLed", "tube", "cyl", [0.065, 0.05], [-3.75, 2.05, 3.8], "ledG", { at: [[0, 0, 0], [-0.22, 0, 0]] });
const elX = (i) => xT0 + 0.12 + (i * (xT1 - xT0 - 0.24)) / (NEL - 1);
for (let i = 0; i < NEL; i++) {
  P(`el${i}`, "tube", "tube", [0.8, 0.34, 0.05], [elX(i), yB, zA], "elD" + i, { rot: AX });
  P(`elRim${i}`, "tube", "tube", [0.92, 0.78, 0.14], [elX(i), yB, zA], "el" + i, { rot: AX, bevel: 0.03 });
}
P("tubeGlass", "tube", "tube", [0.6, 0.55, elX(1) - elX(0) - 0.1], [(elX(0) + elX(1)) / 2, yB, zA], "glass", { rot: AX, at: Array.from({ length: NEL - 1 }, (_, i) => [i * (elX(1) - elX(0)), 0, 0]) });
// 分壓電阻鏈（每兩片電極之間一顆）與連接線
P("tubeRes", "tube", "cyl", [0.055, elX(1) - elX(0) - 0.16], [(elX(0) + elX(1)) / 2, yB + 1.0, zA], "ceramic", { rot: AX, at: Array.from({ length: NEL - 1 }, (_, i) => [i * (elX(1) - elX(0)), 0, 0]) });
P("tubeResBand", "tube", "cyl", [0.06, 0.05], [(elX(0) + elX(1)) / 2, yB + 1.0, zA], "navy", { rot: AX, at: Array.from({ length: NEL - 1 }, (_, i) => [i * (elX(1) - elX(0)), 0, 0]) });
P("tubeResPost", "tube", "box", [0.04, 0.16, 0.04], [elX(0), yB + 0.94, zA], "steel2", { at: Array.from({ length: NEL }, (_, i) => [i * (elX(1) - elX(0)), 0, 0]) });
// 拉桿（把整串電極鎖緊）
P("tubeRod", "tube", "cyl", [0.035, xT1 - xT0], [(xT0 + xT1) / 2, yB, zA], "ceramic", { rot: AX, at: [[0, -0.5, 0.6], [0, -0.5, -0.6], [0, 0.62, 0.48], [0, 0.62, -0.48]] });
flangeX("tubeF0", "tube", xT0 - 0.06, 0.92, 0.3);
flangeX("tubeF1", "tube", xT1 + 0.06, 0.92, 0.4);
insulator("tubeLegA", "tube", elX(1), 2.6, 3.1, zA, 0.2, 2); insulator("tubeLegB", "tube", elX(NEL - 2), 2.6, 3.1, zA, 0.2, 2);
// 高壓電源塔（傘裙絕緣柱＋圓頂）與高壓電纜
P("hvBase", "tube", "box", [1.5, 2.6, 1.5], [-4.4, 1.3, -0.2], "shell2"); P("hvBaseK", "tube", "box", [1.56, 0.26, 1.56], [-4.4, 0.13, -0.2], "navy"); P("hvBaseD", "tube", "slab", [1.2, 1.9, 0.05], [-4.4, 1.45, 0.57], "shell", { r: 0.07, bevel: 0.015 }); P("hvBaseSh", "room", "plane", [2.5, 2.5], [-4.2, 0.012, -0.05], "shadow", { rot: [-90, 0, 0], r: 0.4 });
P("hvCol", "tube", "cyl", [0.26, 2.9], [-4.4, 4.05, -0.2], "ceramic", { rot: AY });
P("hvFin", "tube", "cyl", [0.44, 0.07], [-4.4, 2.9, -0.2], "ceramic", { rot: AY, at: Array.from({ length: 10 }, (_, i) => [0, i * 0.27, 0]) });
P("hvDome", "tube", "sphere", [0.55], [-4.4, 5.75, -0.2], "steel", { scale: [1, 0.72, 1] });
hose("hvCable", "tube", [[-4.4, 6.1, -0.2], [-6.6, 6.5, 1.0], [-8.95, 5.7, zA], [elX(0), yB + 0.92, zA]], 0.05, "black");
anchors.tube = { layer: "tube", p: [(xT0 + xT1) / 2 + 0.6, yB + 0.9, zA + 0.3], dx: 80, dy: -170 };

// ══ 四、射束管線一（閘閥、法蘭、渦輪幫浦、前級管與粗抽幫浦） ══
L("pipe");
P("pipe1a", "pipe", "tube", [0.46, 0.4, 0.62], [-4.56, yB, zA], "glass", { rot: AX });
P("gvBody", "pipe", "box", [0.5, 1.5, 1.2], [-4.0, yB + 0.15, zA], "steel");
P("gvFace", "pipe", "slab", [1.0, 1.3, 0.04], [-4.0, yB + 0.15, zA + 0.62], "brushed", { r: 0.08 });
P("gvScrew", "pipe", "cyl", [0.045, 0.03], [-4.0, yB + 0.15, zA + 0.65], "steel2", { at: [[-0.4, -0.55, 0], [0.4, -0.55, 0], [-0.4, 0.55, 0], [0.4, 0.55, 0]] });
P("gvAct", "pipe", "cyl", [0.2, 0.8], [-4.0, yB + 1.3, zA], "shell", { rot: AY });
P("gvCap", "pipe", "cyl", [0.24, 0.1], [-4.0, yB + 1.72, zA], "blue", { rot: AY });
P("gvLed", "pipe", "cyl", [0.06, 0.04], [-4.0, yB + 0.62, zA + 0.66], "ledG");
P("pipe1b", "pipe", "tube", [0.46, 0.4, 0.9], [-3.2, yB, zA], "glass", { rot: AX });
flangeX("pipeF1", "pipe", -3.72); flangeX("pipeF2", "pipe", -2.62, 0.7);
// 渦輪分子幫浦（管線下方）
const turbo = (id, x, z) => {
  P(id + "_neck", "pipe", "cyl", [0.26, 0.4], [x, yB - 0.62, z], "steel", { rot: AY });
  P(id + "_fl", "pipe", "cyl", [0.5, 0.1], [x, yB - 0.84, z], "steel2", { rot: AY });
  P(id + "_body", "pipe", "cyl", [0.44, 0.78], [x, yB - 1.28, z], "pump", { rot: AY });
  P(id + "_rib", "pipe", "tube", [0.47, 0.42, 0.05], [x, yB - 1.28, z], "steel2", { rot: AY, at: [[0, -0.26, 0], [0, -0.13, 0], [0, 0, 0], [0, 0.13, 0], [0, 0.26, 0]] });
  P(id + "_cap", "pipe", "cyl", [0.36, 0.14], [x, yB - 1.74, z], "navy", { rot: AY });
  P(id + "_led", "pipe", "cyl", [0.05, 0.03], [x, yB - 1.5, z + 0.45], "ledG");
};
// 粗抽幫浦（地上）
P("rough", "pipe", "box", [1.7, 0.9, 1.0], [1.9, 0.6, 2.9], "pump");
P("roughFin", "pipe", "box", [0.05, 0.74, 1.04], [1.9, 0.62, 2.9], "navy", { at: [-0.6, -0.4, -0.2, 0, 0.2].map((d) => [d, 0, 0]) });
P("roughMotor", "pipe", "cyl", [0.36, 0.8], [2.95, 0.62, 2.9], "steel", { rot: AX });
P("roughBase", "pipe", "box", [2.7, 0.14, 1.2], [2.2, 0.08, 2.9], "navy");
P("roughSh", "room", "plane", [3.4, 1.9], [2.4, 0.012, 3.0], "shadow", { rot: [-90, 0, 0], r: 0.4 });
P("roughPort", "pipe", "cyl", [0.13, 0.3], [1.5, 1.2, 2.9], "steel", { rot: AY });
P("roughLed", "pipe", "cyl", [0.06, 0.04], [1.3, 0.85, 3.42], "ledG");

// ══ 五、分析磁鐵（90 度扇形：鐵芯、極面、線圈、彎管） ══
L("mag"); L("magTop");
const sector = (id, layer, r1, r2, y0, y1, mat, n = 6, th0 = 0, th1 = 90) => {
  const dth = (th1 - th0) / n, rc = (r1 + r2) / 2;
  for (let j = 0; j < n; j++) {
    const th = th0 + (j + 0.5) * dth, a = th * D2R;
    P(`${id}${j}`, layer, "box", [2 * r2 * Math.tan((dth / 2) * D2R) + 0.012, y1 - y0, r2 - r1], [Cm[0] + rc * Math.sin(a), (y0 + y1) / 2, Cm[1] + rc * Math.cos(a)], mat, { rot: [0, th, 0] });
  }
};
const arcPt = (r, thDeg, y) => [Cm[0] + r * Math.sin(thDeg * D2R), y, Cm[1] + r * Math.cos(thDeg * D2R)];
// 底座
P("magStand", "mag", "box", [3.4, 1.5, 3.4], [-0.75, 0.75, 1.05], "shell2", { rot: [0, 45, 0] });
P("magStandK", "mag", "box", [3.5, 0.26, 3.5], [-0.75, 0.13, 1.05], "navy", { rot: [0, 45, 0] });
P("magStandP", "mag", "slab", [2.5, 0.95, 0.05], [-0.75 + 1.215, 0.85, 1.05 + 1.215], "shell", { rot: [0, 45, 0], r: 0.07, bevel: 0.015 });
P("magSh", "room", "plane", [6.6, 6.6], [-0.3, 0.012, 1.2], "shadow", { rot: [-90, 0, 0], r: 1.4 });
sector("yokeLo", "mag", 1.35, 4.55, 1.5, 2.75, "yoke");
sector("yokeIn", "mag", 1.35, 1.95, 2.75, 5.25, "yoke2");
sector("poleLo", "mag", 2.2, 3.8, 2.75, 3.42, "steel");
sector("coilLoO", "mag", 3.86, 4.42, 2.8, 3.36, "coil");
sector("coilLoI", "mag", 1.98, 2.16, 2.8, 3.36, "coil");
// 線圈在兩端繞回去的那一段
for (const [k, th] of [[0, -3.5], [1, 93.5]]) { const p = arcPt(3.2, th, 3.08); P(`coilLoE${k}`, "mag", "box", [0.5, 0.56, 2.44], p, "coil", { rot: [0, th, 0] }); const q = arcPt(3.2, th, 4.92); P(`coilUpE${k}`, "magTop", "box", [0.5, 0.56, 2.44], q, "coilTop", { rot: [0, th, 0] }); }
// 線圈束帶
P("coilTie", "mag", "box", [0.1, 0.6, 0.62], [0, 0, 0], "navy", { at: [8, 24, 40, 56, 72, 86].map((t) => arcPt(4.14, t, 3.08)), rot: [0, 0, 0] });
// 彎管（真空腔，玻璃）＋兩端法蘭
sector("duct", "mag", DUCT_IN, DUCT_OUT, yB - 0.42, yB + 0.42, "glass2", 6);
materials.ductWall = { kind: "std", color: "navy", rough: 0.5, opacity: 0.3 }; sector("ductWallO", "mag", DUCT_OUT, DUCT_OUT + 0.07, yB - 0.42, yB + 0.42, "ductWall", 6);
sector("ductWallI", "mag", DUCT_IN - 0.07, DUCT_IN, yB - 0.42, yB + 0.42, "steel2", 6);
sector("ductFloor", "mag", DUCT_IN, DUCT_OUT, yB - 0.46, yB - 0.42, "shell", 6);
P("ductF0", "mag", "ring", [1.7, 1.06, 0.14], [E[0] - 0.08, yB, zA], "steel", { rot: AX, r: 0.12, wall: 0.2, bevel: 0.015 });
P("ductF1", "mag", "ring", [1.7, 1.06, 0.14], [X[0], yB, X[1] - 0.08], "steel", { r: 0.12, wall: 0.2, bevel: 0.015 });
// 上半（極面、線圈、鐵芯）：自己一層，演到磁鐵時抬起變透明
sector("poleUp", "magTop", 2.2, 3.8, 4.58, 5.25, "steel");
sector("coilUpO", "magTop", 3.86, 4.42, 4.64, 5.2, "coilTop");
sector("yokeUp", "magTop", 1.35, 4.55, 5.25, 6.5, "yokeTop");
P("yokeBolt", "magTop", "cyl", [0.11, 0.08], [0, 6.54, 0], "steel2", { rot: AY, at: [10, 30, 50, 70, 88].flatMap((t) => [arcPt(1.75, t, 0), arcPt(4.2, t, 0)]) });
P("yokeLift", "magTop", "tube", [0.2, 0.12, 0.08], [0, 6.62, 0], "steel", { rot: [0, 0, 0], at: [arcPt(3.0, 20, 0), arcPt(3.0, 70, 0)] });
P("yokePlate", "mag", "slab", [0.9, 0.5, 0.03], [...arcPt(4.58, 45, 2.12)].map((v, i) => v), "shell", { rot: [0, 45, 0], r: 0.05 });
// 冷卻水管（兩條，沿外緣進線圈）
hose("cool0", "mag", [arcPt(4.75, 62, 0.4), arcPt(4.75, 62, 3.0), arcPt(4.45, 62, 3.0)], 0.05, "blue");
hose("cool1", "mag", [arcPt(4.75, 72, 0.4), arcPt(4.75, 72, 3.18), arcPt(4.45, 72, 3.18)], 0.05, "ledR");
anchors.magnet = { layer: "mag", p: arcPt(4.2, 40, 3.4), dx: 150, dy: 120 };
// 撞壁的位置留下的小痕跡（火花的光暈釘在這裡）
// 位置之後算（離子軌跡決定）

// ══ 六、射束管線二（解析狹縫、掃描板、波紋管） ══
flangeZ("p2F0", "pipe", X[1] - 0.24, 0.7);
P("slitBox", "pipe", "box", [1.3, 1.2, 0.5], [X[0], yB, -1.2], "glass");
P("slitFrame", "pipe", "ring", [1.36, 1.26, 0.08], [X[0], yB, -1.2], "steel", { r: 0.06, wall: 0.1, at: [[0, 0, -0.25], [0, 0, 0.25]] });
P("slitJaw", "pipe", "box", [0.34, 0.86, 0.07], [X[0], yB, -1.2], "copper", { at: [[-0.46, 0, 0], [0.46, 0, 0]] });
P("slitKnob", "pipe", "cyl", [0.09, 0.3], [X[0], yB, -1.2], "navy", { rot: AX, at: [[-0.8, 0, 0], [0.8, 0, 0]] });
P("pipe2a", "pipe", "tube", [0.46, 0.4, 0.82], [X[0], yB, -1.88], "glass");
flangeZ("p2F1", "pipe", -1.9);
P("scanBox", "pipe", "box", [1.5, 1.2, 1.0], [X[0], yB, zPs], "glass");
P("scanFrame", "pipe", "ring", [1.56, 1.26, 0.08], [X[0], yB, zPs], "steel", { r: 0.06, wall: 0.1, at: [[0, 0, -0.5], [0, 0, 0.5]] });
P("scanPlateL", "pipe", "box", [0.05, 0.72, 0.8], [X[0] - 0.52, yB, zPs], "copper");
P("scanPlateR", "pipe", "box", [0.05, 0.72, 0.8], [X[0] + 0.52, yB, zPs], "copper");
P("scanFeed", "pipe", "cyl", [0.07, 0.4], [X[0], yB + 0.78, zPs], "ceramic", { rot: AY, at: [[-0.52, 0, 0], [0.52, 0, 0]] });
P("pipe2b", "pipe", "tube", [0.74, 0.68, 0.84], [X[0], yB, -3.74], "glass");
P("bellows", "pipe", "tube", [0.8, 0.7, 0.06], [X[0], yB, -3.74], "steel", { at: [-0.3, -0.18, -0.06, 0.06, 0.18, 0.3].map((d) => [0, 0, d]) });
flangeZ("p2F2", "pipe", -3.3, 0.9, 0.66); flangeZ("p2F3", "pipe", -4.14, 0.98, 0.7);
// 管線二的支架
P("p2Post", "pipe", "box", [0.22, 3.3, 0.22], [X[0], 1.65, -1.2], "navy", { at: [[0, 0, 0], [0, 0, -1.6]] });
P("p2Foot", "pipe", "box", [0.9, 0.1, 0.7], [X[0], 0.05, -1.2], "steel2", { at: [[0, 0, 0], [0, 0, -1.6]] });
P("p2Saddle", "pipe", "box", [1.0, 0.1, 0.5], [X[0], 3.35, -1.2], "steel2", { at: [[0, 0, 0], [0, 0, -1.6]] });
P("p2Sh", "room", "plane", [1.8, 3.2], [X[0] + 0.15, 0.012, -1.9], "shadow", { rot: [-90, 0, 0], r: 0.4 });
turbo("tp1", -3.2, zA + 0.0);
turbo("tp2", X[0] + 0.0, -1.88);
// 前級管：兩顆渦輪幫浦 → 粗抽幫浦
P("tp1out", "pipe", "cyl", [0.09, 0.5], [-3.2, yB - 1.3, zA + 0.6], "hose");
hose("fore1", "pipe", [[-3.2, yB - 1.3, zA + 0.85], [-3.2, yB - 1.3, 4.3], [-3.2, 0.35, 4.3], [1.5, 0.35, 4.3], [1.5, 0.35, 2.9], [1.5, 1.08, 2.9]], 0.09);
P("tp2out", "pipe", "cyl", [0.09, 0.5], [X[0] + 0.6, yB - 1.3, -1.88], "hose", { rot: AX });
hose("fore2", "pipe", [[X[0] + 0.85, yB - 1.3, -1.88], [2.3, yB - 1.3, -1.88], [2.3, 1.42, -1.88], [2.3, 1.42, 2.4], [1.9, 1.05, 2.75]], 0.09);
P("foreClamp", "pipe", "tube", [0.13, 0.09, 0.08], [0, 0, 0], "steel", { at: [[-3.2, 1.6, 4.3], [-3.2, 0.9, 4.3]], rot: AY });

// ══ 七、終端站（玻璃腔體、晶圓載台、機櫃、燈塔） ══
L("end");
const EX0 = -1.6, EX1 = 5.0, EZ0 = -8.6, EZ1 = -4.2, EY0 = 1.0, EY1 = 7.25;
cabinet("endCab", "end", EX0 - 0.1, EX1 + 0.1, EY0, EZ0 - 0.1, EZ1 + 0.1, { nf: 4, ns: 3 });
P("endScr", "end", "plane", [0.6, 0.3], [EX1 + 0.17, 0.62, -4.72], "screen", { rot: AX, r: 0.04 });
P("endLed", "end", "cyl", [0.06, 0.05], [EX1 + 0.17, 0.62, -6.4], "ledG", { rot: AX, at: [[0, 0, -0.2], [0, 0, 0], [0, 0, 0.2]] });
P("endEstop", "end", "cyl", [0.11, 0.1], [EX1 + 0.2, 0.62, -7.9], "ledR", { rot: AX });
{
  const cx = (EX0 + EX1) / 2, cz = (EZ0 + EZ1) / 2, w = EX1 - EX0, d = EZ1 - EZ0, h = EY1 - EY0, cy = (EY0 + EY1) / 2, t = 0.16;
  // 12 根邊框
  P("endFrY", "end", "box", [t, h, t], [cx, cy, cz], "navy", { at: [[-w / 2, 0, -d / 2], [w / 2, 0, -d / 2], [-w / 2, 0, d / 2], [w / 2, 0, d / 2]] });
  P("endFrX", "end", "box", [w + t, t, t], [cx, cy, cz], "navy", { at: [[0, -h / 2, -d / 2], [0, -h / 2, d / 2], [0, h / 2, -d / 2], [0, h / 2, d / 2]] });
  P("endFrZ", "end", "box", [t, t, d + t], [cx, cy, cz], "navy", { at: [[-w / 2, -h / 2, 0], [w / 2, -h / 2, 0], [-w / 2, h / 2, 0], [w / 2, h / 2, 0]] });
  P("endBack", "end", "box", [w, h, 0.08], [cx, cy, EZ0], "shell");
  P("endLeft", "end", "box", [0.08, h, d], [EX0, cy, cz], "shell");
  P("endFloor", "end", "box", [w, 0.08, d], [cx, EY0 + 0.04, cz], "brushed");
  P("endGlassR", "end", "box", [0.05, h - t, d - t], [EX1, cy, cz], "glass2");
  P("endGlassF", "end", "box", [w - t, h - t, 0.05], [cx, cy, EZ1], "glass2");
  P("endGlassT", "end", "box", [w - t, 0.05, d - t], [cx, EY1, cz], "glass2");
  P("endCorner", "end", "cyl", [0.06, 0.04], [cx, cy, EZ1 + 0.1], "steel", { at: [[-w / 2, -h / 2, 0], [w / 2, -h / 2, 0], [-w / 2, h / 2, 0], [w / 2, h / 2, 0], [0, h / 2, 0], [0, -h / 2, 0]] });
  P("endCornerR", "end", "cyl", [0.06, 0.04], [EX1 + 0.1, cy, cz], "steel", { rot: AX, at: [[0, -h / 2, -d / 2], [0, -h / 2, d / 2], [0, h / 2, -d / 2], [0, h / 2, d / 2], [0, h / 2, 0], [0, -h / 2, 0]] });
  // 入口法蘭（射束從正面進來）
  P("endPort", "end", "tube", [0.98, 0.7, 0.12], [X[0], yB, EZ1 + 0.02], "steel", { bevel: 0.015 });
  // 掃描驅動（腔頂）：機殼、馬達、導桿
  P("drvBox", "end", "box", [1.3, 1.3, 1.1], [X[0], EY1 + 0.7, -7.0], "shell");
  P("drvSeam", "end", "box", [1.32, 0.04, 1.12], [X[0], EY1 + 0.7, -7.0], "seam");
  P("drvMotor", "end", "cyl", [0.3, 0.7], [X[0], EY1 + 1.7, -7.0], "navy", { rot: AY });
  P("drvCap", "end", "cyl", [0.33, 0.08], [X[0], EY1 + 2.08, -7.0], "blue", { rot: AY });
  P("drvScrew", "end", "cyl", [0.045, 0.03], [X[0], EY1 + 0.7, -6.44], "steel2", { at: [[-0.52, -0.52, 0], [0.52, -0.52, 0], [-0.52, 0.52, 0], [0.52, 0.52, 0]] });
  // 低溫幫浦（腔頂後側）與管線
  P("cryo", "end", "cyl", [0.5, 1.0], [-0.6, EY1 + 0.55, -7.9], "pump", { rot: AY });
  P("cryoRib", "end", "tube", [0.53, 0.48, 0.05], [-0.6, EY1 + 0.55, -7.9], "steel2", { rot: AY, at: [[0, -0.3, 0], [0, 0, 0], [0, 0.3, 0]] });
  P("cryoCap", "end", "sphere", [0.5], [-0.6, EY1 + 1.05, -7.9], "pump", { scale: [1, 0.45, 1] });
  hose("cryoLine", "end", [[-0.6, EY1 + 1.25, -7.9], [-0.6, EY1 + 1.6, -7.9], [-1.5, EY1 + 1.6, -7.9], [-1.5, EY1 + 0.1, -7.9]], 0.06, "copper");
  // 燈塔（紅黃綠）
  P("towerPole", "end", "cyl", [0.05, 0.7], [4.5, EY1 + 0.35, -8.1], "steel2", { rot: AY });
  P("towerR", "end", "cyl", [0.15, 0.3], [4.5, EY1 + 1.45, -8.1], "ledR", { rot: AY });
  P("towerA", "end", "cyl", [0.15, 0.3], [4.5, EY1 + 1.13, -8.1], "ledA", { rot: AY });
  P("towerG", "end", "cyl", [0.15, 0.3], [4.5, EY1 + 0.81, -8.1], "ledG", { rot: AY });
  P("towerCap", "end", "cyl", [0.17, 0.06], [4.5, EY1 + 1.63, -8.1], "navy", { rot: AY });
  // 待處理的晶圓匣（腔內右側）：一疊晶圓＋支架
  P("cassBase", "end", "box", [1.5, 0.14, 1.9], [3.7, EY0 + 0.15, -6.9], "navy");
  P("cassPost", "end", "box", [0.1, 2.3, 0.1], [3.7, EY0 + 1.37, -6.9], "steel2", { at: [[-0.68, 0, -0.85], [0.68, 0, -0.85], [-0.68, 0, 0.85], [0.68, 0, 0.85]] });
  P("cassTop", "end", "box", [1.5, 0.1, 1.9], [3.7, EY0 + 2.56, -6.9], "navy");
  P("cassWafer", "end", "cyl", [0.62, 0.03], [3.7, EY0 + 0.45, -6.9], "wafer", { rot: AY, scale: [1, 1, 1.3], at: Array.from({ length: 9 }, (_, i) => [0, i * 0.23, 0]) });
  // 射束擋板（晶圓後方、腔底）
}
anchors.endst = { layer: "end", p: [EX1, EY1 - 0.4, -5.2], dx: 120, dy: -120 };

// ── 晶圓載台（關節鏈 stage：整組沿 y 來回，等同機械式掃描） ──
L("stage");
const SZ = -7.0, WR = 1.5;
const stageParts = [];
const SP = (...a) => { const id = P(...a); stageParts.push(id); return id; };
SP("platen", "stage", "cyl", [1.66, 0.16], [X[0], yB, SZ], "steel");
SP("platenRim", "stage", "tube", [1.7, 1.52, 0.22], [X[0], yB, SZ + 0.02], "navy", { bevel: 0.02 });
SP("waferBody", "stage", "cyl", [WR, 0.04], [X[0], yB, zW - 0.02], "wafer");
SP("clips", "stage", "box", [0.2, 0.12, 0.08], [X[0], yB, zW + 0.03], "steel2", { at: [[0, 1.52, 0], [0, -1.52, 0]] });
SP("clipsS", "stage", "box", [0.12, 0.2, 0.08], [X[0], yB, zW + 0.03], "steel2", { at: [[1.52, 0, 0], [-1.52, 0, 0]] });
SP("scanShaft", "stage", "cyl", [0.13, 5.6], [X[0], yB + 3.7, SZ - 0.18], "steel", { rot: AY });
SP("scanArm", "stage", "box", [0.5, 1.0, 0.2], [X[0], yB + 1.0, SZ - 0.16], "steel2");
SP("scanHub", "stage", "cyl", [0.4, 0.2], [X[0], yB, SZ - 0.17], "navy");
{
  // 晶粒格（兩種色交錯，邊緣留空）
  const step = 0.3, ds = 0.26, a = [], b = [];
  for (let i = -6; i <= 6; i++) for (let j = -6; j <= 6; j++) {
    const x = i * step, y = j * step;
    if ([[x - ds / 2, y - ds / 2], [x + ds / 2, y - ds / 2], [x - ds / 2, y + ds / 2], [x + ds / 2, y + ds / 2]].every(([p, q]) => Math.hypot(p, q) < WR * 0.965)) ((i * 3 + j * 5) % 7 === 0 ? b : a).push([x, y, 0]);
  }
  SP("dies", "stage", "box", [ds, ds, 0.012], [X[0], yB, zW + 0.006], "die", { at: a });
  SP("dies2", "stage", "box", [ds, ds, 0.012], [X[0], yB, zW + 0.006], "die2", { at: b });
  // 晶圓缺口
  SP("notch", "stage", "cyl", [0.06, 0.05], [X[0], yB - WR + 0.015, zW - 0.02], "navy");
}
// 已經打過離子的區域：一條一條的橘色薄層（各自一層，射束掃到才出現）
const NST = 12, stripeY = (j) => -WR + (j + 0.5) * ((2 * WR) / NST);
for (let j = 0; j < NST; j++) {
  const y = stripeY(j), hh = (2 * WR) / NST, half = Math.sqrt(Math.max(0.01, (WR * 0.97) ** 2 - (Math.abs(y) + hh / 2) ** 2));
  L(`tint${j}`); SP(`tint${j}`, `tint${j}`, "box", [2 * half, hh + 0.004, 0.006], [X[0], yB + y, zW + 0.017], "tint");
}
kin.stage = { layer: "stage", tip: "y", size: 6, grip: [X[0], yB, zW], body: [], joints: [{ id: "y", type: "slide", axis: [0, 1, 0], parts: stageParts, min: -2, max: 2 }] };

// ── 掃描中的射束（扇形光線＋晶圓上的亮線） ──
L("fan");
for (const [i, k] of [-11, -8.25, -5.5, -2.75, 0, 2.75, 5.5, 8.25, 11].entries()) {
  const len = (zPs - zW) / Math.cos(k * D2R) - 0.02, a = k * D2R;
  // 繞 +y 轉 k 度：−z 方向轉向 −x（k>0）
  P(`ray${i}`, "fan", "box", [0.035, 0.035, len], [X[0] - (len / 2) * Math.sin(a), yB, zPs - (len / 2) * Math.cos(a)], "ray", { rot: [0, k, 0] });
}
P("spot", "fan", "box", [1.72, 0.09, 0.012], [X[0], yB, zW + 0.03], "spot");

// ══ 八、離子（帶「＋」的小球，各自一條關節鏈；逐幀關鍵格＝想要的速度曲線） ══
const FPS = 30, DUR = [3.0, 4.0, 3.0, 4.2], START = [0, 90, 210, 300], TOTAL = 426;
const PLUS_YAW = -25, PLUS_ELEV = 28; // 「＋」朝向鏡頭的平均方向
const rotXY = (v, rx, ry) => { const a = rx * D2R, b = ry * D2R; const y = v[1] * Math.cos(a) - v[2] * Math.sin(a), z = v[1] * Math.sin(a) + v[2] * Math.cos(a); return [v[0] * Math.cos(b) + z * Math.sin(b), y, -v[0] * Math.sin(b) + z * Math.cos(b)]; };
const rotYabout = (p, c, deg) => { const a = deg * D2R, dx = p[0] - c[0], dz = p[1] - c[1]; return [c[0] + dx * Math.cos(a) + dz * Math.sin(a), c[1] - dx * Math.sin(a) + dz * Math.cos(a)]; };
const KIND = { R: { r: 0.2, v: 1, rad: Rm }, H: { r: 0.25, v: 0.9, rad: 4.7 }, L: { r: 0.15, v: 1.12, rad: 1.85 } };
const V0 = 0.04, VMAX = 0.115, NG = 6;
const U1 = E[0] - xSrc, UA = xT0 - xSrc, UB = xT1 - xSrc, S_SCAN = X[1] - zPs;
const shifts = [], runs = [], kinTracks = [], hitsW = [], hitsWall = [];
const A = (f) => (f >= 0 ? `start+${Math.round(f)}` : `start${Math.round(f)}`);
const ionPos = (kd, Kd, Rd, S) => { let p = [E[0] + S, E[1]]; p = rotYabout(p, [E[0], zA - kd.rad], Rd); p = rotYabout(p, [X[0], zPs], Kd); return p; };
const makeIon = (idx, kind, tEmit, kappa) => {
  const kd = KIND[kind], id = `ion${idx}`, layer = L(id), r = kd.r, rest = [E[0], yB, zA];
  const n = rotXY([0, 0, 1], -PLUS_ELEV, -PLUS_YAW), pp = [rest[0] + n[0] * (r + 0.006), rest[1] + n[1] * (r + 0.006), rest[2] + n[2] * (r + 0.006)];
  P(id + "_b", layer, "sphere", [r], rest, "ion" + kind);
  P(id + "_h", layer, "box", [r * 1.3, r * 0.34, 0.012], pp, "plus", { rot: [-PLUS_ELEV, -PLUS_YAW, 0] });
  P(id + "_v", layer, "box", [r * 0.34, r * 1.3, 0.012], pp, "plus", { rot: [-PLUS_ELEV, -PLUS_YAW, 0] });
  const joints = [
    { id: "K", type: "rot", axis: [0, 1, 0], pivot: [X[0], yB, zPs], parts: [] },
    { id: "R", parent: "K", type: "rot", axis: [0, 1, 0], pivot: [E[0], yB, zA - kd.rad], parts: [] },
    { id: "S", parent: "R", type: "slide", axis: [1, 0, 0], parts: [] },
    { id: "c", parent: "S", type: "rot", axis: [0, 1, 0], pivot: rest, parts: [id + "_b", id + "_h", id + "_v"] },
  ];
  for (let g = 0; g < NG; g++) {
    P(`${id}_g${g}`, layer, "sphere", [r * [0.86, 0.74, 0.62, 0.5, 0.4, 0.3][g]], rest, `trail${kind}${Math.floor(g / 2)}`);
    joints.push({ id: `g${g}`, parent: g ? `g${g - 1}` : "S", type: "slide", axis: [-1, 0, 0], drive: "lag", parts: [`${id}_g${g}`] });
  }
  kin[id] = { layer, tip: "c", size: 20, grip: rest, body: [], joints };
  // 路徑：直線到磁鐵入口 → 圓弧 → （對的離子）直線到掃描板 → 偏轉後到晶圓
  const vm = VMAX * kd.v, v0 = V0 * kd.v;
  let thEnd = 90, sEnd = 0, wall = null;
  if (kind !== "R") {
    for (let th = 0; th <= 90; th += 0.05) { const p = ionPos(kd, 0, th, 0), d = Math.hypot(p[0] - Cm[0], p[1] - Cm[1]); if (kind === "H" ? d >= DUCT_OUT - r - 0.01 : d <= DUCT_IN + r + 0.01) { thEnd = th; break; } }
    const p = ionPos(kd, 0, thEnd, 0), d = Math.hypot(p[0] - Cm[0], p[1] - Cm[1]), wr = kind === "H" ? DUCT_OUT : DUCT_IN;
    wall = [Cm[0] + ((p[0] - Cm[0]) / d) * wr, yB, Cm[1] + ((p[1] - Cm[1]) / d) * wr, (p[0] - Cm[0]) / d, (p[1] - Cm[1]) / d];
  } else sEnd = S_SCAN + (zPs - zW - r * 0.7) / Math.cos(kappa * D2R);
  const uArc = kd.rad * thEnd * D2R, uEnd = U1 + uArc + sEnd;
  const keys = [];
  let u = 0, f = tEmit, die = null;
  const at = (uu) => { const S = uu <= U1 ? uu - U1 : uu <= U1 + uArc ? 0 : uu - U1 - uArc, Rd = uu <= U1 ? 0 : uu <= U1 + uArc ? (uu - U1) / kd.rad / D2R : thEnd, Kd = kind === "R" && S > S_SCAN ? kappa : 0; return { S, Rd, Kd }; };
  const vAt = (uu, tau) => (uu < UA ? v0 * Math.min(1, 0.25 + tau / 10) : uu < UB ? Math.sqrt(v0 * v0 + ((vm * vm - v0 * v0) * (uu - UA)) / (UB - UA)) : vm);
  while (f <= TOTAL + 2) {
    const q = at(u), v = u >= uEnd ? 0 : vAt(u, f - tEmit);
    keys.push([f - tEmit, { K: R3(q.Kd), R: R3(q.Rd), S: R3(q.S), c: R3(-(q.Rd + q.Kd)), lag: R3(v * 1.55) }]);
    if (u >= uEnd) { die = f; break; }
    for (let k = 0; k < 10; k++) u = Math.min(uEnd, u + vAt(u, f - tEmit + k / 10) / 10);
    f++;
  }
  kinTracks.push({ arm: id, at: A(tEmit), keys });
  shifts.push({ layer, at: "start-40", until: A(tEmit - 2), opacity: 0, dur: 3 });
  if (die !== null) {
    shifts.push({ layer, at: A(die), opacity: 0, dur: 2 });
    if (wall) hitsWall.push({ kind, f: die, wall });
    else { const q = at(uEnd), p = ionPos(kd, q.Kd, q.Rd, q.S); hitsW.push({ f: die, p: [p[0], yB, zW + 0.03] }); }
  }
  return { id, die };
};
const PATTERN = ["R", "H", "R", "L"], EMIT0 = 100, EMIT_DT = 8, NION = 40;
let nR = 0;
for (let i = 0; i < NION; i++) {
  const kind = PATTERN[i % PATTERN.length], t = EMIT0 + i * EMIT_DT;
  if (t > TOTAL - 20) break;
  makeIon(i, kind, t, kind === "R" ? [0, 8, -8, 4, -11, 11, -4, 6, -6, 0][nR++ % 10] : 0);
}
const firstHit = Math.min(...hitsW.map((h) => h.f));

// 撞壁火花：光暈＋小圈＋三片碎屑（兩面牆各一組，每次撞擊重新觸發）
for (const kind of ["H", "L"]) {
  const h = hitsWall.find((x) => x.kind === kind); if (!h) continue;
  const [wx, wy, wz, nx, nz] = h.wall, inw = kind === "H" ? -1 : 1, base = [wx + nx * inw * 0.06, wy, wz + nz * inw * 0.06];
  P(`scorch${kind}`, "mag", "sphere", [0.12], [wx, wy, wz], "scorch", { scale: [1, 1.6, 1] });
  actions[`spk${kind}`] = { type: "pulse", layer: "mag", parts: [`scorch${kind}`], color: "spark", freq: 7, glow: 1, halo: 2.4, at: { layer: "mag", p: base } };
  actions[`spk${kind}ring`] = { type: "wave", from: { layer: "mag", p: base }, dir: [0, 1, 0], reach: 0.35, count: 1, r0: 0.12, spread: 2.2, rate: 3, width: 0.25, color: "spark" };
  [[0.55, 0.35, 0.5], [0.6, 0.2, -0.45], [0.35, 0.5, 0]].forEach(([a, up, side], k) => {
    const tx = -nz, tz = nx, e = [base[0] + nx * inw * a + tx * side, base[1] + up, base[2] + nz * inw * a + tz * side];
    actions[`spk${kind}f${k}`] = { type: "flow", layer: "mag", path: [base, e], n: 1, size: 0.1, shape: "grit", rate: 3, track: false, color: "spark" };
  });
  anchors["wall" + kind] = { layer: "mag", p: [wx, wy, wz], dx: kind === "H" ? 150 : -150, dy: -120 };
}
for (const h of hitsWall) for (const s of ["", "ring", "f0", "f1", "f2"]) runs.push({ id: `spk${h.kind}${s}`, at: A(h.f - 1), until: A(h.f + (s === "" ? 5 : 8)), ramp: 2 });
// 打到晶圓：一小圈光暈
P("whDummy", "end", "box", [0.05, 0.05, 0.05], [X[0], EY0 + 0.3, -8.2], "navy");
hitsW.forEach((h, i) => { if (h.f > TOTAL) return; actions[`wh${i}`] = { type: "pulse", layer: "room", parts: ["whDummy"], color: "beam", freq: 5, glow: 1, halo: 0.95, at: { layer: "room", p: h.p } }; runs.push({ id: `wh${i}`, at: A(h.f - 1), until: A(h.f + 5), ramp: 2 }); });

// 晶圓載台掃描：第一顆離子到之前開始，上下來回（緩入緩出）
const SCAN0 = firstHit - 22, AMP = 1.25, SW = 34;
const stageKeys = [[0, { y: 0 }], [20, { y: -AMP }]];
for (let k = 1; 20 + k * SW < TOTAL - SCAN0 + SW; k++) stageKeys.push([20 + k * SW, { y: k % 2 ? AMP : -AMP }]);
kinTracks.push({ arm: "stage", at: A(SCAN0), keys: stageKeys });
const easeIO = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const stageY = (f) => { const d = f - SCAN0; if (d <= 0) return 0; let i = 0; while (i < stageKeys.length - 1 && d >= stageKeys[i + 1][0]) i++; if (i === stageKeys.length - 1) return stageKeys[i][1].y; const a = stageKeys[i], b = stageKeys[i + 1]; return a[1].y + (b[1].y - a[1].y) * easeIO((d - a[0]) / (b[0] - a[0])); };
// 射束在 y＝yB；第 j 條在晶圓上的高度 stripeY(j)，載台位移 s 時它在 yB＋stripeY＋s → 掃到的那一幀＝ s ≈ −stripeY(j)（第一顆離子到了之後才算）
for (let j = 0; j < NST; j++) {
  let hit = TOTAL + 100;
  for (let f = firstHit; f <= TOTAL; f++) if (Math.abs(stageY(f) + stripeY(j)) < WR / NST + 0.14) { hit = f; break; }
  shifts.push({ layer: `tint${j}`, at: "start-40", until: A(hit), opacity: 0, dur: 6 });
}
shifts.push({ layer: "fan", at: "start-40", until: A(firstHit - 8), opacity: 0, dur: 10 });

// ══ 九、鏡頭 ══
const YAW0 = -14;
const shotFor = (T, D, elev, yawAbs) => { const ps = yawAbs * D2R, e = elev * D2R, xp = T[0] * Math.cos(ps) + T[2] * Math.sin(ps), zp = -T[0] * Math.sin(ps) + T[2] * Math.cos(ps); return { x: R3(xp), y: R3(T[1] - zp * Math.tan(e)), d: R3(D + zp / Math.cos(e)), elev }; };
const CAMS = [
  { at: -30, dur: 1, T: [-4.6, 4.6, -1.6], D: 60, elev: 8, yaw: -14 },
  { at: -4, dur: 96, T: [-4.6, 3.4, -1.6], D: 45, elev: 15, yaw: -14 },
  { at: 86, dur: 30, T: [-8.6, 3.9, 2.4], D: 27, elev: 19, yaw: -8 },
  { at: 132, dur: 70, T: [-6.9, 3.9, 2.4], D: 25, elev: 19, yaw: -8 },
  { at: 200, dur: 30, T: [-0.4, 4.7, 1.1], D: 29, elev: 44, yaw: -30 },
  { at: 290, dur: 30, T: [2.1, 1.5, -3.4], D: 37, elev: 23, yaw: -36 },
];
let yawPrev = YAW0;
const shots = CAMS.map((c) => { const s = { at: A(c.at), dur: c.dur, ...shotFor(c.T, c.D, c.elev, c.yaw), yaw: R3((c.yaw - yawPrev) * D2R) }; yawPrev = c.yaw; return s; });

// ══ 十、晶圓剖面放大卡（面向最後一個鏡位；離子打進矽裡、停在一定深度、疊出摻雜區） ══
const C4 = CAMS[CAMS.length - 1];
{
  const rx = -C4.elev, ry = -C4.yaw;
  const bx = rotXY([1, 0, 0], rx, ry), by = rotXY([0, 1, 0], rx, ry), bz = rotXY([0, 0, 1], rx, ry);
  // 鏡頭在模型座標的位置：目標點沿「朝鏡頭」方向退 D
  const camP = [C4.T[0] + bz[0] * C4.D, C4.T[1] + bz[1] * C4.D, C4.T[2] + bz[2] * C4.D];
  const DB = 20.5, OY = -1.75, O = [camP[0] - bz[0] * DB + by[0] * OY, camP[1] - bz[1] * DB + by[1] * OY, camP[2] - bz[2] * DB + by[2] * OY];
  const W = (X_, Y_, Z_ = 0) => [O[0] + bx[0] * X_ + by[0] * Y_ + bz[0] * Z_, O[1] + bx[1] * X_ + by[1] * Y_ + bz[1] * Z_, O[2] + bx[2] * X_ + by[2] * Y_ + bz[2] * Z_];
  const Wd = (X_, Y_, Z_ = 0) => [bx[0] * X_ + by[0] * Y_ + bz[0] * Z_, bx[1] * X_ + by[1] * Y_ + bz[1] * Z_, bx[2] * X_ + by[2] * Y_ + bz[2] * Z_];
  const rot = [rx, ry, 0];
  L("card", { bg: true }); L("dope", { bg: true }); L("guide", { bg: true });
  const CW = 6.3, CH = 4.3, SURF = 0.95, SIB = -1.95, RP = 1.4, SIG = 0.36;
  P("cardBack", "card", "slab", [CW + 0.16, CH + 0.16, 0.04], W(0, 0, -0.06), "cardEdge", { rot, r: 0.3 });
  P("cardFace", "card", "slab", [CW, CH, 0.04], W(0, 0, -0.03), "card", { rot, r: 0.24 });
  P("cardVac", "card", "plane", [CW - 0.4, 2.0 - SURF], W(0, (2.0 + SURF) / 2, 0), "vac", { rot, r: 0.08 });
  P("cardSi", "card", "plane", [CW - 0.4, SURF - SIB], W(0, (SURF + SIB) / 2, 0), "si", { rot, r: 0.08 });
  P("cardSurf", "card", "box", [CW - 0.4, 0.045, 0.01], W(0, SURF, 0.02), "ink", { rot });
  // 矽晶格（一排排原子）
  const atoms = [], AP = 0.42;
  for (let i = -6; i <= 6; i++) for (let j = 0; j < 7; j++) atoms.push(Wd(i * AP, -j * AP));
  P("cardAtoms", "card", "sphere", [0.085], W(0, SURF - 0.24, 0.06), "siAtom", { at: atoms });
  // 深度尺（右側刻度）
  P("cardTick", "card", "box", [0.16, 0.03, 0.01], W(CW / 2 - 0.38, SURF, 0.03), "ink", { rot, at: [0, 1, 2, 3, 4, 5, 6].map((k) => Wd(0, -k * AP)) });
  P("cardAxis", "card", "box", [0.03, 6 * AP, 0.01], W(CW / 2 - 0.3, SURF - 3 * AP, 0.03), "ink", { rot });
  // 摻雜區：濃度隨深度的高斯分佈（中間最濃、上下漸淡）
  const NS = 31, SH = (6.2 * SIG) / NS;
  for (let k = 0; k < NS; k++) {
    const dz = (k - (NS - 1) / 2) * SH, g = Math.exp(-(dz * dz) / (2 * SIG * SIG)), lv = Math.round(g * 8.6 - 0.3); if (lv < 0) continue;
    P(`dopeS${k}`, "dope", "box", [CW - 0.86, SH + 0.004, 0.008], W(-0.22, SURF - RP - dz, 0.035), "dope" + lv, { rot });
  }
  anchors.dope = { layer: "dope", p: W(CW / 2 - 1.5, SURF - RP + 0.1, 0.05), dx: -40, dy: -262 };
  // 放大引線：晶圓上的小方框 → 卡片上緣兩角
  const spotP = [X[0] + 0.55, yB, zW + 0.05];
  P("guideBox", "guide", "ring", [0.42, 0.3, 0.02], spotP, "cardEdge", { r: 0.03, wall: 0.045 });
  rodBetween("guideL", "guide", [spotP[0] - 0.21, spotP[1] - 0.15, spotP[2]], W(-CW / 2 + 0.1, CH / 2 + 0.06, -0.05), 0.022, "guide");
  rodBetween("guideR", "guide", [spotP[0] + 0.21, spotP[1] - 0.15, spotP[2]], W(CW / 2 - 0.1, CH / 2 + 0.06, -0.05), 0.022, "guide");
  const CARD_IN = 332;
  for (const l of ["card", "guide"]) shifts.push({ layer: l, at: "start-40", until: A(CARD_IN), opacity: 0, dur: 9 });
  shifts.push({ layer: "dope", at: "start-40", until: A(CARD_IN + 26), opacity: 0, dur: 46 });
  // 卡片裡的離子：從上方真空飛進來，進矽之後一路撞、一路慢下來，停在深度 RP 附近
  const NI = 11, XS = [-1.5, 1, -3, 2.5, -0.5, 1.5, -2, 0, 3, -1, 2].map((k) => (k + 0.5) * AP * 1.72), DEP = [0.05, -0.55, 0.4, -0.2, 0.75, 0.2, -0.85, -0.05, 0.3, 1.1, -0.35];
  const rI = 0.15, VIN = 0.2, TD = 24, Y0 = 1.72;
  for (let i = 0; i < NI; i++) {
    const id = `cion${i}`, layer = L(id, { bg: true }), rest = W(XS[i], Y0, 0.14), t0 = CARD_IN + 12 + i * 5.5, depth = RP + DEP[i] * SIG;
    P(id + "_b", layer, "sphere", [rI], rest, "ionR");
    const pp = [rest[0] + bz[0] * (rI + 0.006), rest[1] + bz[1] * (rI + 0.006), rest[2] + bz[2] * (rI + 0.006)];
    P(id + "_h", layer, "box", [rI * 1.3, rI * 0.34, 0.012], pp, "plus", { rot });
    P(id + "_v", layer, "box", [rI * 0.34, rI * 1.3, 0.012], pp, "plus", { rot });
    const joints = [{ id: "x", type: "slide", axis: bx, parts: [] }, { id: "y", parent: "x", type: "slide", axis: by.map((v) => -v), parts: [id + "_b", id + "_h", id + "_v"] }];
    for (let g = 0; g < 5; g++) { P(`${id}_g${g}`, layer, "sphere", [rI * [0.84, 0.7, 0.56, 0.44, 0.32][g]], rest, `trailR${Math.min(2, Math.floor(g / 2))}`); joints.push({ id: `g${g}`, parent: g ? `g${g - 1}` : "y", type: "slide", axis: by, drive: "lag", parts: [`${id}_g${g}`] }); }
    kin[id] = { layer, tip: "y", size: 10, grip: rest, body: [], joints };
    const keys = [], T1 = (Y0 - SURF) / VIN, kicks = [[0.25, 0.1], [0.5, -0.16], [0.75, 0.09]].map(([p, a]) => [p, a * (i % 2 ? -1 : 1)]);
    for (let n = 0; n <= Math.ceil(T1 + TD) + 1; n++) {
      let y, v, x = 0;
      if (n <= T1) { y = VIN * n; v = VIN; }
      else { const q = Math.min(1, (n - T1) / TD), k = (3 * depth) / (VIN * TD); /* 起始速度接得上：depth×(1−(1−q)^k) 的初速＝k×depth/TD */ const kk = Math.max(1.2, (VIN * TD) / depth); y = Y0 - SURF + depth * (1 - Math.pow(1 - q, kk)); v = q >= 1 ? 0 : ((depth * kk) / TD) * Math.pow(1 - q, kk - 1); for (const [p, a] of kicks) x += a * easeIO(Math.max(0, Math.min(1, (q - p) / 0.2))); }
      keys.push([n, { x: R3(x), y: R3(y), lag: R3(v * 0.95) }]);
    }
    kinTracks.push({ arm: id, at: A(Math.round(t0)), keys });
    shifts.push({ layer, at: "start-40", until: A(Math.round(t0) - 1), opacity: 0, dur: 2 });
  }
}

// ══ 十一、其他運作：電漿、燈絲、指示燈、線圈通電、掃描板、磁鐵上蓋抬起 ══
actions.plasma = { type: "pulse", layer: "src", parts: ["plasma"], color: "plasma", freq: 2.6, glow: 0.9, halo: 2.3 };
actions.filament = { type: "pulse", layer: "src", parts: ["filament"], color: "ledA", steady: true, glow: 0.9, halo: 0 };
actions.leds = { type: "pulse", layer: "src", parts: ["srcLedA", "gvLed", "tp1_led", "tp2_led", "roughLed"], color: "white", freq: 1.2, glow: 0.7, halo: 0 };
actions.tower = { type: "pulse", layer: "end", parts: ["towerG"], color: "ledG", freq: 0.9, glow: 0.9, halo: 1.3 };
actions.coils = { type: "pulse", layer: "mag", parts: ["coilLoO0", "coilLoO1", "coilLoO2", "coilLoO3", "coilLoO4", "coilLoO5", "coilLoE0", "coilLoE1"], color: "coil", steady: true, glow: 0.3, halo: 0 };
actions.scanL = { type: "pulse", layer: "pipe", parts: ["scanPlateL"], color: "beam", freq: 1.6, glow: 0.9, halo: 0 };
actions.scanR = { type: "pulse", layer: "pipe", parts: ["scanPlateR"], color: "beam", freq: 1.6, glow: 0.9, halo: 0 };
actions.spotGlow = { type: "pulse", layer: "fan", parts: ["spot"], color: "white", freq: 4, glow: 0.6, halo: 0 };
runs.push({ id: "filament", at: A(70), ramp: 14 }, { id: "plasma", at: A(84), ramp: 14 }, { id: "leds", at: "start-30", ramp: 2 }, { id: "tower", at: "start-30", ramp: 2 },
  { id: "coils", at: A(188), ramp: 20 }, { id: "scanL", at: A(firstHit - 60), ramp: 10 }, { id: "scanR", at: A(firstHit - 60 + 9), ramp: 10 }, { id: "spotGlow", at: A(firstHit - 6), ramp: 6 });
shifts.push({ layer: "magTop", at: A(192), dy: 2.4, opacity: 0, dur: 30 });

// ══ 十二、輸出 ══
const model = {
  name: "test-ion-fable：離子佈植機（離子源 → 加速管 → 分析磁鐵 → 掃描 → 終端站晶圓 → 剖面摻雜區）。由 gen.mjs 產生，不要手改",
  unit: "示意比例（晶圓半徑 1.5）",
  size: { w: 18, h: 8, r: 0.1, t: 14 },
  palette, materials, layers, anchors, parts, actions, kin,
  pose: { yaw0: R3(YAW0 * D2R), yawIso: 0, drift: 0 },
  camera: { stand: { d: 60, elev: 10, y: 3 }, outro: { d: 0.6 } },
  fx: { dpr: 1, srcPx: 30, shadows: 0, ghost: false, guides: false, fog: true, dust: false, vaporSprites: false, shimmer: false, sweep: false },
};
const LAB = [
  { part: "src", text: "離子源", en: "Ion source", color: "amber", at: A(92), until: A(196) },
  { part: "tube", text: "加速管", en: "Accelerator", color: "blue", at: A(128), until: A(198) },
  { part: "magnet", text: "分析磁鐵", en: "Analyzer magnet", color: "blue", at: A(226), until: A(288) },
  { part: "dope", text: "摻雜區", en: "Doped layer", color: "amber", at: A(372) },
];
const scene = (i, id, beat, zh, en, cueText, props) => ({ id, beat, narration: zh.replace(/\n/g, ""), tts: zh.replace(/\n/g, ""), subtitle: { zh, en }, keywords: [], cues: [{ id: "c", text: cueText }], component: "ThreeScene", props, sources: ["示意動畫，非實際比例"], durationSec: DUR[i] });
const script = {
  slug: SLUG, title: "模型比較測試：離子佈植機怎麼把離子打進晶圓（無配音、無字幕）", asOf: "2026/11/20", styleVersion: 3, stage: "three",
  channel: { name: "科技透明圈", tag: "放大來看", slogan: "一支講透一件事" }, hudSkin: "light",
  voice: { voiceName: "Iapetus", model: "gemini-2.5-flash-preview-tts", mode: "take", languageCode: "cmn-TW", profile: "tech-b", _說明: "無聲測試片，不送 TTS" },
  hud: { levels: [{ id: "tool", label: "離子佈植機", en: "ION IMPLANTER", field: "6 m", ruler: "1 m", art: "none", handoff3D: true, readout: false, note: "示意圖，非實際比例", noteAlways: true }], theme: "dark", schematic: { text: "Schematic – not to scale", zh: "示意圖，非實際比例・運作為示意" }, maxLabels: 4, smallPx: 30, layout: "fill", scanBand: 0.3 },
  cover: { title: ["離子", "怎麼打進晶圓"], sub: "離子佈植", frame: 40 }, sample: true,
  scenes: [
    scene(0, "s1", "hook", "離子佈植機全景", "The ion implanter", "全景", { zoom: [{ to: "tool", at: "start-30", dur: 1 }], shot: shots, shift: shifts, run: runs, kin: kinTracks, labels: LAB }),
    scene(1, "s2", "mechanism", "離子在加速管加速", "Ions speed up in the tube", "加速", {}),
    scene(2, "s3", "mechanism", "分析磁鐵篩選離子", "The magnet sorts the ions", "篩選", {}),
    scene(3, "s4", "payoff", "離子打進晶圓", "Ions stop inside the silicon", "打進", {}),
  ],
};
fs.writeFileSync(path.join(DIR, "model.json"), JSON.stringify(model));
fs.writeFileSync(path.join(DIR, "script.json"), JSON.stringify(script));
console.log(`零件 ${parts.length}、層 ${layers.length}、關節鏈 ${Object.keys(kin).length}、動作 ${Object.keys(actions).length}；第一顆離子到晶圓：第 ${firstHit} 幀；撞壁 ${hitsWall.map((h) => h.kind + "@" + h.f).join(" ")}；打到晶圓 ${hitsW.map((h) => h.f).join(" ")}`);
// 無聲時間軸（scripts/three/silent-timeline.mjs）＋拿掉字幕窗（這支沒有字幕）
import { execFileSync } from "node:child_process";
execFileSync("node", [path.join(DIR, "../../scripts/three/silent-timeline.mjs"), SLUG], { stdio: "inherit" });
const tp = path.join(DIR, "timeline.json"), tl = JSON.parse(fs.readFileSync(tp, "utf8"));
for (const s of tl.scenes) { delete s.subtitleWindow; s.lines = []; s.keywords = []; }
fs.writeFileSync(tp, JSON.stringify(tl));

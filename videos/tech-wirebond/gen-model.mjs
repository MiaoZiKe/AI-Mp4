// node videos/tech-wirebond/gen-model.mjs → 寫 videos/tech-wirebond/model.json（前半沿用 tech-chem 的零件與材質輔助函式，後半是打線專用）
// 單位依站別：A 站（導線架封裝）1＝0.5 mm、B 站（打線機）1＝10 cm、C 站（劈刀特寫）1＝10 µm、D 站（焊點剖面）1＝2 µm、E 站（金線／銅線）1＝10 µm。全部示意，HUD 比例尺照站別。
import fs from "node:fs";
import path from "node:path";

const R2 = (x) => Math.round(x * 1000) / 1000;
const D2R = Math.PI / 180;
const pol = (aDeg, r) => [R2(r * Math.cos(aDeg * D2R)), R2(r * Math.sin(aDeg * D2R))]; // (x, z)
const palette = {
  floorC: "#C9D2DE", panel: "#F3F5F8", panel2: "#E2E8F0", seam: "#8E9BB0", band: "#24324C", steel: "#7D8CA6", steel2: "#A9B5C7", dark: "#3E4A60",
  glassC: "#BFD3F2", lampY: "#F2B632", lampG: "#2FBF71", lampR: "#E5484D", screen: "#5B8DEF", rubber: "#2B2F36", gold: "#C9A24A", knurl: "#5C6678", estop: "#D93A2B", 
  tgtC: "#D2793F", tgtFaceC: "#F0A066", tgtDarkC: "#8C4A22", solderC: "#E8ECF2", backC: "#B9C2CF", ceramic: "#F1EEE6", copperC: "#C9794A", waterC: "#4DA3FF", waterD: "#2F7FE0",
  magBody: "#2B2F36", magN: "#E0472F", magS: "#2F7FE0", yokeC: "#8D97A8", plasmaC: "#9B7BFF", chuckC: "#D5DCE6", plasmaE: "#C9B8FF", ionC: "#7EC8FF", eleC: "#FFE08A", argonC: "#9FD8FF", hitC: "#FFB45A",
  filmC: "#C47A4E", scanC: "#4FA3FF", fieldC: "#5BE0C0", moltenC: "#FF8A2B", hotC: "#E5602B", pcbC: "#1F6B45", chipC: "#1C1F26", traceC: "#C9A24A", connC: "#2A2D33", elecT: "#7FD0C0", pipeB: "#3E7BD6", pipeR: "#D9534F",
  warnC: "#F2B632", plateDark: "#4A525F", cuBright: "#E39A64", chipFlake: "#C9794A", markA: "#E8613C",
};
const M = (kind, color, o = {}) => ({ kind, color, ...o });
const glowM = (c, op, ei = 1) => M("std", c, { emissive: c, ei, opacity: op, rough: 1, metal: 0 });
const materials = {
  floor: M("std", "floorC", { rough: 0.7, metal: 0.3, tex: "brushed", texScale: 3 }),
  panel: M("std", "panel", { rough: 0.55, metal: 0.05, env: 0.25 }), panel2: M("std", "panel2", { rough: 0.6, metal: 0.05, env: 0.2 }),
  seam: M("std", "seam", { rough: 0.6, metal: 0.3 }), band: M("std", "band", { rough: 0.4, metal: 0.3, env: 0.4 }),
  steel: M("std", "steel", { rough: 0.35, metal: 0.85, env: 0.5 }), steel2: M("std", "steel2", { rough: 0.3, metal: 0.8, env: 0.6, tex: "brushed", texScale: 2 }),
  dark: M("std", "dark", { rough: 0.5, metal: 0.4, env: 0.3 }), rubber: M("std", "rubber", { rough: 0.9, metal: 0 }), gold: M("std", "gold", { rough: 0.3, metal: 0.9, env: 0.8 }),
  knurl: M("std", "knurl", { rough: 0.4, metal: 0.8, env: 0.5 }),
  window: M("phys", "glassC", { rough: 0.05, metal: 0, clearcoat: 1, opacity: 0.22, env: 0.6 }), glassDoor: M("phys", "glassC", { rough: 0.05, metal: 0, clearcoat: 1, opacity: 0.3, env: 0.6 }),
  lampY: M("std", "lampY", { emissive: "lampY", ei: 0.4, rough: 0.4, metal: 0 }), lampG: M("std", "lampG", { emissive: "lampG", ei: 0.35, rough: 0.4, metal: 0 }),
  lampR: M("std", "lampR", { emissive: "lampR", ei: 0.25, rough: 0.4, metal: 0 }), estop: M("std", "estop", { rough: 0.4, metal: 0, emissive: "estop", ei: 0.15 }),
  screen: M("std", "screen", { emissive: "screen", ei: 0.5, rough: 0.3, metal: 0 }),
  tgt: M("std", "tgtC", { rough: 0.3, metal: 0.92, env: 0.7, tex: "brushed", texScale: 1.6 }), tgtFace: M("std", "tgtFaceC", { rough: 0.08, metal: 0.95, env: 1.0 }), tgtDark: M("std", "tgtDarkC", { rough: 0.7, metal: 0.5, env: 0.3 }),
  solder: M("std", "solderC", { rough: 0.18, metal: 0.95, env: 0.9 }), back: M("std", "backC", { rough: 0.35, metal: 0.85, env: 0.6, tex: "brushed", texScale: 2.4 }),
  ceramic: M("std", "ceramic", { rough: 0.6, metal: 0, env: 0.3 }), copper: M("std", "copperC", { rough: 0.3, metal: 0.95, env: 0.7 }),
  water: M("phys", "waterC", { rough: 0.05, metal: 0, clearcoat: 1, opacity: 0.38, env: 0.5 }), pipeB: M("std", "pipeB", { rough: 0.35, metal: 0.6, env: 0.4 }), pipeR: M("std", "pipeR", { rough: 0.35, metal: 0.6, env: 0.4 }),
  magBody: M("std", "magBody", { rough: 0.45, metal: 0.5, env: 0.4 }), magN: M("std", "magN", { rough: 0.5, metal: 0.2, emissive: "magN", ei: 0.25 }), magS: M("std", "magS", { rough: 0.5, metal: 0.2, emissive: "magS", ei: 0.25 }), yoke: M("std", "yokeC", { rough: 0.35, metal: 0.85, env: 0.5, tex: "brushed", texScale: 2 }),
  plasma: glowM("plasmaC", 0.5, 1.2), plasmaIn: glowM("plasmaE", 0.75, 1.3), chuckM: M("std", "chuckC", { rough: 0.3, metal: 0.85, env: 0.8, tex: "brushed", texScale: 1.5 }), shieldM: M("std", "seam", { rough: 0.85, metal: 0.45, env: 0.3 }), ion: glowM("ionC", 0.95), ele: glowM("eleC", 0.95), argon: glowM("argonC", 0.7), hit: glowM("hitC", 0.9), field: glowM("fieldC", 0.8),
  atom: glowM("tgtFaceC", 0.95), film: M("std", "filmC", { rough: 0.3, metal: 0.85, env: 0.8 }), warn: glowM("warnC", 0.9, 0.9),
  molten: M("std", "moltenC", { emissive: "moltenC", ei: 1, rough: 0.6, metal: 0.2 }), hot: M("std", "hotC", { emissive: "hotC", ei: 0.55, rough: 0.5, metal: 0.4 }), heatRing: glowM("hotC", 0.85, 1),
  electrolyte: M("phys", "elecT", { rough: 0.05, metal: 0, clearcoat: 1, opacity: 0.4, env: 0.5 }), plateDark: M("std", "plateDark", { rough: 0.55, metal: 0.5, env: 0.4 }),
  pcb: M("std", "pcbC", { rough: 0.5, metal: 0.1 }), chip: M("std", "chipC", { rough: 0.35, metal: 0.2, env: 0.4 }), trace: M("std", "traceC", { rough: 0.3, metal: 0.9, env: 0.6 }), conn: M("std", "connC", { rough: 0.5, metal: 0.2 }),
  cuBright: M("std", "cuBright", { rough: 0.25, metal: 0.95, env: 0.8 }), flake: glowM("chipFlake", 0.95, 0.4), mist: glowM("argonC", 0.55, 0.6), cuIon: glowM("cuBright", 0.9, 0.7),
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
const RING = (n, r, a0 = 0) => Array.from({ length: n }, (_, i) => { const [x, z] = pol(a0 + (i * 360) / n, r); return [x, 0, z]; });
const SPH = (id, layer, r, x, y, z, mat, o = {}) => P({ id, layer, shape: "sphere", size: [r], pos: [x, y, z], mat, ...o });
const grid = (x0, x1, nx, y0, y1, ny, z) => { const o = []; for (let i = 0; i < nx; i++) for (let j = 0; j < ny; j++) o.push([R2(x0 + ((x1 - x0) * i) / Math.max(1, nx - 1)), R2(y0 + ((y1 - y0) * j) / Math.max(1, ny - 1)), z]); return o; };

// ═════ 追加色票與材質 ═════
Object.assign(palette, {
  liqC: "#5FAEE6", liqTopC: "#E8F4FA", jackTan: "#D6B677", jackDark: "#A7844A", hotTape: "#FF8A2B", tapeColdC: "#6F6150", jackColdC: "#9A8D77", flashC: "#FFE08A", sinterC: "#9AA3AF", vapC: "#FF9A3C", crustC: "#EDE6D8", crustOr: "#E8A15C",
  gaugeF: "#F4F1E6", alC: "#F29A4A", meC: "#8A94A3", ohO: "#E5484D", ohH: "#F4F6FA", h2oC: "#3FC1E8", ch4C: "#98A2B3", n2C: "#B8C4D4", filmC2: "#E39A64", subC: "#9DB1D1", subD: "#6C84AC",
  coldPipeC: "#6FA8E0", hotPipeC: "#E06A3A", bubC: "#F6FBFF", warnY: "#F2B632", boxGreen: "#2C6E55", cabC: "#EDEFF3", cabDarkC: "#B4BCC9", brassC: "#C8A24A", rubberC: "#2B2F36", edgeC: "#F4FAFF", coldSlC: "#9CC4E4", hdspC: "#2A7FD6", meshC: "#B9C0CA", siliC: "#C44536", jkBoxC: "#7C8591",
});
Object.assign(materials, {
  liq: M("phys", "liqC", { rough: 0.05, metal: 0, clearcoat: 1, opacity: 0.55, env: 0.5 }), liqTop: M("std", "liqTopC", { rough: 0.1, metal: 0.3, opacity: 0.9, env: 0.8 }),
  edge: glowM("edgeC", 0.95, 0.5), coldSleeve: M("std", "coldSlC", { rough: 0.9, metal: 0 }), hdsp: glowM("hdspC", 0.95, 0.7), jackTan: M("std", "jackTan", { rough: 0.95, metal: 0, env: 0.1 }), jackMesh: M("std", "meshC", { rough: 0.55, metal: 0.75, env: 0.5, tex: "brushed", texScale: 7 }), siliR: M("std", "siliC", { rough: 0.85, metal: 0 }), jkBox: M("std", "jkBoxC", { rough: 0.4, metal: 0.6, env: 0.4 }), jackDark: M("std", "jackDark", { rough: 0.9, metal: 0 }),
  jackCold: M("std", "jackColdC", { rough: 0.95, metal: 0, env: 0.1 }), tapeCold: M("std", "tapeColdC", { rough: 0.9, metal: 0 }), tape: glowM("hotTape", 0.95, 0.5), sinter: M("std", "sinterC", { rough: 1, metal: 0.4, env: 0.2 }), vap: glowM("vapC", 0.9, 0.9), vapBub: glowM("vapC", 0.75, 0.7),
  crust: M("std", "crustC", { rough: 0.95, metal: 0 }), crustOr: M("std", "crustOr", { rough: 0.9, metal: 0.1 }), gaugeF: M("std", "gaugeF", { rough: 0.5, metal: 0 }),
  alM: M("std", "alC", { rough: 0.35, metal: 0.3, env: 0.5 }), meM: M("std", "meC", { rough: 0.5, metal: 0.1 }), ohO: M("std", "ohO", { rough: 0.4, metal: 0.1 }), ohH: M("std", "ohH", { rough: 0.4, metal: 0.1 }),
  h2o: glowM("h2oC", 0.95, 0.5), ch4: glowM("ch4C", 0.85, 0.2), n2: glowM("n2C", 0.8, 0.3), bub: glowM("bubC", 0.8, 0.35), filmM: M("std", "filmC2", { rough: 0.3, metal: 0.6, opacity: 0.55, env: 0.6 }),
  sub: M("std", "subC", { rough: 0.35, metal: 0.55, env: 0.6 }), subD: M("std", "subD", { rough: 0.5, metal: 0.4 }), coldPipe: M("std", "coldPipeC", { rough: 0.35, metal: 0.6, env: 0.4 }), hotPipe: M("std", "hotPipeC", { rough: 0.35, metal: 0.6, env: 0.4 }),
  warnY: M("std", "warnY", { rough: 0.5, metal: 0, emissive: "warnY", ei: 0.2 }), boxGreen: M("std", "boxGreen", { rough: 0.5, metal: 0.1 }), cab: M("std", "cabC", { rough: 0.55, metal: 0.1, env: 0.3 }), cabDark: M("std", "cabDarkC", { rough: 0.6, metal: 0.3, env: 0.3 }),
  brass: M("std", "brassC", { rough: 0.3, metal: 0.9, env: 0.7 }), bubGlass: M("phys", "glassC", { rough: 0.05, metal: 0, clearcoat: 1, opacity: 0.25, env: 0.6 }),
});
const FY = 0;
const A = (layer, p, dx, dy) => ({ layer, p, dx, dy });
const lampPos = (id, layer, x, y, z, mat) => SPH(id, layer, 0.07, x, y, z, mat);
// 管線：一段一段直管＋肘接頭球，沿折線（絕對座標）。回傳每段 id，給保溫套與加熱帶對位
const PIPE = (id, layer, pts, r, mat, o = {}) => {
  for (let i = 0; i < pts.length - 1; i++) {
    const [x0, y0, z0] = pts[i], [x1, y1, z1] = pts[i + 1];
    const dx = x1 - x0, dy = y1 - y0, dz = z1 - z0, L = Math.hypot(dx, dy, dz);
    const rot = Math.abs(dx) > 1e-6 ? HX : Math.abs(dy) > 1e-6 ? V : [0, 0, 0];
    P({ id: `${id}${i}`, layer, shape: "cyl", size: [r, R2(L)], rot, pos: [R2((x0 + x1) / 2), R2((y0 + y1) / 2), R2((z0 + z1) / 2)], mat, ...o });
    if (i > 0) SPH(`${id}J${i}`, layer, r * 1.12, x0, y0, z0, mat);
  }
};



// ═════ 打線專用色票與材質 ═════
Object.assign(palette, {
  auC: "#E2B33C", auHiC: "#F6D36B", cuWC: "#D07A45", cuOxC: "#5A3424", alPadC: "#C9CED6", dieC: "#2B3A55", dieTopC: "#3D5378", dieEdgeC: "#1D2638", lfC: "#C98A5A", lfAgC: "#E6EAF0",
  pasC: "#8FB4D9", capC: "#F4F1EA", capTipC: "#D9D3C7", hornC: "#AEB8C6", piezoA: "#D9A441", piezoB: "#4A5466", sparkC: "#BFE3FF", sparkHot: "#FFFFFF", heatC: "#F28A3C", imcC: "#B78BE0",
  siC: "#5E6F8A", oxC: "#6B7380", gasC: "#9FD8C8", crackC: "#E5484D", arcC: "#0B57E8", moldC: "#22252B", epoxyC: "#D8DCE2", boardC: "#2F4A3A", ballAtC: "#F6D36B", alAtC: "#9FB0C8", usC: "#4FA3FF",
});
Object.assign(materials, {
  au: M("std", "auC", { rough: 0.2, metal: 0.95, env: 0.9 }), auHi: M("std", "auHiC", { rough: 0.15, metal: 0.95, env: 1.0, emissive: "auC", ei: 0.12 }),
  cuW: M("std", "cuWC", { rough: 0.25, metal: 0.95, env: 0.85 }), cuOx: M("std", "cuOxC", { rough: 0.8, metal: 0.4, env: 0.2 }),
  alPad: M("std", "alPadC", { rough: 0.3, metal: 0.9, env: 0.8, tex: "brushed", texScale: 0.6 }), die: M("std", "dieC", { rough: 0.3, metal: 0.4, env: 0.6, tex: "traces", texScale: 2.2 }),
  dieTop: M("std", "dieTopC", { rough: 0.25, metal: 0.5, env: 0.7, tex: "traces", texScale: 1.4 }), dieEdge: M("std", "dieEdgeC", { rough: 0.6, metal: 0.3 }),
  lf: M("std", "lfC", { rough: 0.3, metal: 0.95, env: 0.8 }), lfAg: M("std", "lfAgC", { rough: 0.15, metal: 0.95, env: 1.0 }),
  pas: M("phys", "pasC", { rough: 0.1, metal: 0, clearcoat: 1, opacity: 0.35, env: 0.6 }),
  cap: M("std", "capC", { rough: 0.35, metal: 0, env: 0.45 }), capTip: M("std", "capTipC", { rough: 0.5, metal: 0, env: 0.3 }), horn: M("std", "hornC", { rough: 0.25, metal: 0.9, env: 0.8, tex: "brushed", texScale: 1.2 }),
  piezoA: M("std", "piezoA", { rough: 0.4, metal: 0.6, env: 0.5 }), piezoB: M("std", "piezoB", { rough: 0.5, metal: 0.3 }),
  spark: glowM("sparkC", 0.95, 1.4), sparkHot: glowM("sparkHot", 0.95, 1.6), heat: glowM("heatC", 0.55, 0.8), heatPlate: M("std", "heatC", { rough: 0.4, metal: 0.7, env: 0.5, emissive: "heatC", ei: 0.18 }),
  imc: glowM("imcC", 0.85, 0.7), si: M("std", "siC", { rough: 0.45, metal: 0.3, env: 0.4 }), ox: M("std", "oxC", { rough: 0.8, metal: 0.1, opacity: 0.85 }), gas: glowM("gasC", 0.5, 0.4),
  crack: glowM("crackC", 0.95, 0.8), mold: M("std", "moldC", { rough: 0.85, metal: 0.05, env: 0.15 }), epoxy: M("std", "epoxyC", { rough: 0.5, metal: 0.6, env: 0.5 }), board: M("std", "boardC", { rough: 0.6, metal: 0.1 }),
  us: glowM("usC", 0.85, 0.8), arc: M("std", "arcC", { emissive: "arcC", ei: 0.7, rough: 1, metal: 0 }), pfaT: M("phys", "glassC", { rough: 0.25, metal: 0, clearcoat: 1, opacity: 0.4, env: 0.5 }),
});
/** 任意方向的細圓柱（兩點之間）：cyl 沿 z，rotateX(a)→rotateY(b)：方向＝(cos a sin b, −sin a, cos a cos b) */
const SEG = (id, layer, p0, p1, r, mat, o = {}) => {
  const [x0, y0, z0] = p0, [x1, y1, z1] = p1, dx = x1 - x0, dy = y1 - y0, dz = z1 - z0, L = Math.hypot(dx, dy, dz);
  const a = -Math.asin(dy / L) / D2R, b = Math.atan2(dx, dz) / D2R;
  return P({ id, layer, shape: "cyl", size: [r, R2(L + r * 0.6)], rot: [R2(a), R2(b), 0], pos: [R2((x0 + x1) / 2), R2((y0 + y1) / 2), R2((z0 + z1) / 2)], mat, ...o });
};
/** 一條線弧：折線每段一個圓柱＋接點小球 */
const WIRE = (id, layer, pts, r, mat) => { for (let i = 0; i < pts.length - 1; i++) { SEG(`${id}s${i}`, layer, pts[i], pts[i + 1], r, mat); if (i > 0) SPH(`${id}j${i}`, layer, r * 1.05, ...pts[i], mat); } };
/** 平滑線弧：控制點做 Catmull-Rom 取樣 */
const smooth = (ctrl, n = 4) => { const o = []; const c = [ctrl[0], ...ctrl, ctrl[ctrl.length - 1]];
  for (let i = 1; i < c.length - 2; i++) for (let k = 0; k < n; k++) { const t = k / n, t2 = t * t, t3 = t2 * t;
    o.push([0, 1, 2].map((d) => R2(0.5 * (2 * c[i][d] + (-c[i - 1][d] + c[i + 1][d]) * t + (2 * c[i - 1][d] - 5 * c[i][d] + 4 * c[i + 1][d] - c[i + 2][d]) * t2 + (-c[i - 1][d] + 3 * c[i][d] - 3 * c[i + 1][d] + c[i + 2][d]) * t3)))); }
  o.push(ctrl[ctrl.length - 1]); return o; };

// ═════ A 站（X0＝0）：導線架上的晶片（1＝0.5 mm）：焊墊一圈、引腳一圈、打完的線 ═════
const X0 = 0;
LAY("lfA", [30, 3, X0, 0.6]); LAY("dieA", [8, 2, X0, 1]); LAY("padGlowA", [8, 1, X0, 1.2]); LAY("leadGlowA", [12, 1, X0, 0.6]);
const LFY = 0.3, LFT = 0.25, DIEY0 = LFY + LFT + 0.06, DIEY1 = DIEY0 + 0.55, DH = 3.5;   // 晶片半寬 3.5
BOX("lfPaddle", "lfA", X0 - 4.4, X0 + 4.4, LFY, LFY + LFT, -4.4, 4.4, "lf");
BOX("dieAttach", "lfA", X0 - 3.6, X0 + 3.6, LFY + LFT, DIEY0, -3.6, 3.6, "epoxy");
BOX("dieBody", "dieA", X0 - DH, X0 + DH, DIEY0, DIEY1 - 0.04, -DH, DH, "dieEdge");
BOX("dieTopA", "dieA", X0 - DH + 0.05, X0 + DH - 0.05, DIEY1 - 0.04, DIEY1, -DH + 0.05, DH - 0.05, "dieTop");
BOX("dieCoreA", "dieA", X0 - 1.8, X0 + 1.8, DIEY1, DIEY1 + 0.02, -1.8, 1.8, "die");     // 中央電路區（較亮的格紋）
P({ id: "dieSealA", layer: "dieA", shape: "tube", size: [DH - 0.1, DH - 0.16, 0.02], rot: V, pos: [X0, DIEY1 + 0.01, 0], mat: "alPad", scale: [1, 1, 1] });
const SIDES = [[0, 1], [1, 0], [0, -1], [-1, 0]];   // 外法向 (nx, nz)：S、E、N、W
const NPS = 7, PSTEP = 0.8, PAD_IN = DH - 0.5, LEAD_IN = 5.2, LEAD_MID = 6.6, LEAD_OUT = 9.0;
const padPt = (si, k) => { const [nx, nz] = SIDES[si], t = (k - (NPS - 1) / 2) * PSTEP; return [R2(X0 + nx * PAD_IN + (nz !== 0 ? t : 0)), DIEY1 + 0.03, R2(nz * PAD_IN + (nx !== 0 ? t : 0))]; };
const leadPt = (si, k) => { const [nx, nz] = SIDES[si], t = (k - (NPS - 1) / 2) * PSTEP; return [R2(X0 + nx * (LEAD_IN + 0.3) + (nz !== 0 ? t : 0)), LFY + LFT + 0.01, R2(nz * (LEAD_IN + 0.3) + (nx !== 0 ? t : 0))]; };
for (let si = 0; si < 4; si++) {
  const [nx, nz] = SIDES[si];
  for (let k = 0; k < NPS; k++) {
    const t = (k - (NPS - 1) / 2) * PSTEP, t2 = t * 1.45, [px, , pz] = padPt(si, k);
    P({ id: `padA${si}_${k}`, layer: "dieA", shape: "box", size: [0.5, 0.04, 0.5], pos: [px, DIEY1 + 0.02, pz], mat: "alPad" });
    P({ id: `padGA${si}_${k}`, layer: "padGlowA", shape: "box", size: [0.62, 0.03, 0.62], pos: [px, DIEY1 + 0.05, pz], mat: "spark" });
    // 引腳：內段（窄、間距 0.8）＋外段（間距 1.45）＋斜接段；內端鍍銀
    const seg = (id, r0, r1, tt, w, mat, y0 = LFY, y1 = LFY + LFT) => nx !== 0
      ? BOX(id, "lfA", X0 + nx * r0, X0 + nx * r1, y0, y1, tt - w / 2, tt + w / 2, mat)
      : BOX(id, "lfA", tt - w / 2, tt + w / 2, y0, y1, nz * r0, nz * r1, mat);
    const sx = (a, b) => (nx < 0 || nz < 0 ? [b, a] : [a, b]);
    seg(`ldIn${si}_${k}`, ...sx(LEAD_IN, LEAD_MID), t, 0.42, "lf");
    seg(`ldOut${si}_${k}`, ...sx(LEAD_MID + 0.9, LEAD_OUT), t2, 0.5, "lf");
    seg(`ldAg${si}_${k}`, ...sx(LEAD_IN, LEAD_IN + 0.75), t, 0.44, "lfAg", LFY + LFT, LFY + LFT + 0.012);
    { // 斜接段：同厚度的扁條（box 繞 y 轉），兩端跟內外段接上
      const p0 = [X0 + nx * LEAD_MID + (nz !== 0 ? t : 0), nz * LEAD_MID + (nx !== 0 ? t : 0)], p1 = [X0 + nx * (LEAD_MID + 0.9) + (nz !== 0 ? t2 : 0), nz * (LEAD_MID + 0.9) + (nx !== 0 ? t2 : 0)];
      const ddx = p1[0] - p0[0], ddz = p1[1] - p0[1], len = Math.hypot(ddx, ddz) + 0.42, ang = Math.atan2(-ddz, ddx) / D2R;
      P({ id: `ldJ${si}_${k}`, layer: "lfA", shape: "box", size: [R2(len), LFT, 0.44], rot: [0, R2(ang), 0], pos: [R2((p0[0] + p1[0]) / 2), LFY + LFT / 2, R2((p0[1] + p1[1]) / 2)], mat: "lf" }); }
    const [lx, , lz] = leadPt(si, k);
    P({ id: `ldG${si}_${k}`, layer: "leadGlowA", shape: "box", size: [0.56, 0.03, 0.56], pos: [lx, LFY + LFT + 0.04, lz], mat: "spark" });
  }
}
for (const [nx, nz] of SIDES) { const r = 8.1, w = 11.0; nx !== 0 ? BOX(`damBar${nx}`, "lfA", X0 + nx * r - 0.15, X0 + nx * r + 0.15, LFY, LFY + LFT, -w / 2, w / 2, "lf") : BOX(`damBarZ${nz}`, "lfA", X0 - w / 2, X0 + w / 2, LFY, LFY + LFT, nz * r - 0.15, nz * r + 0.15, "lf"); }
// 擋板（dam bar）與外框、兩側導軌與定位孔、四角連桿
for (const [id, x0, x1, z0, z1] of [["damS", -9.4, 9.4, 9.0, 9.4], ["damN", -9.4, 9.4, -9.4, -9.0], ["damE", 9.0, 9.4, -9.0, 9.0], ["damW", -9.4, -9.0, -9.0, 9.0]]) BOX(id, "lfA", X0 + x0, X0 + x1, LFY, LFY + LFT, z0, z1, "lf");
BOX("railS", "lfA", X0 - 15, X0 + 15, LFY, LFY + LFT, 9.4, 11.4, "lf"); BOX("railN", "lfA", X0 - 15, X0 + 15, LFY, LFY + LFT, -11.4, -9.4, "lf");
P({ id: "railHole", layer: "lfA", shape: "cyl", size: [0.35, 0.02], rot: V, pos: [0, LFY + LFT + 0.005, 0], at: [-12, -6, 0, 6, 12].flatMap((x) => [[X0 + x, 0, 10.4], [X0 + x, 0, -10.4]]), mat: "dark" });
for (const [i, sx, sz] of [[0, 1, 1], [1, -1, 1], [2, 1, -1], [3, -1, -1]]) SEG(`tieBar${i}`, "lfA", [X0 + sx * 4.2, LFY + LFT / 2, sz * 4.2], [X0 + sx * 9.1, LFY + LFT / 2, sz * 9.1], 0.22, "lf");
// 隔壁兩顆（導線架是一條連續的帶子）：只畫晶片與焊墊的輪廓
for (const [i, dx] of [[0, -20], [1, 20]]) { BOX(`nbPad${i}`, "lfA", X0 + dx - 4.4, X0 + dx + 4.4, LFY, LFY + LFT, -4.4, 4.4, "lf"); BOX(`nbDie${i}`, "lfA", X0 + dx - DH, X0 + dx + DH, DIEY0, DIEY1, -DH, DH, "dieEdge"); BOX(`nbRail${i}`, "lfA", X0 + dx - 5, X0 + dx + 5, LFY, LFY + LFT, 9.4, 11.4, "lf"); BOX(`nbRailN${i}`, "lfA", X0 + dx - 5, X0 + dx + 5, LFY, LFY + LFT, -11.4, -9.4, "lf"); }
// 打好的線（28 條，每 2 條一層，s7 依序快速出現）
const wireCtrl = (si, k) => { const a = padPt(si, k), b = leadPt(si, k), [nx, nz] = SIDES[si];
  const at = (r, y) => [R2(a[0] + nx * r), R2(y), R2(a[2] + nz * r)], span = LEAD_IN + 0.3 - PAD_IN;
  return [a, at(0, a[1] + 1.1), at(span * 0.3, a[1] + 1.45), at(span * 0.65, a[1] + 1.05), at(span * 0.9, b[1] + 0.35), b]; };
const WG = 14;
for (let g = 0; g < WG; g++) LAY(`wA${g}`, [20, 2, X0, 1.2]);
let wi = 0;
for (let si = 0; si < 4; si++) for (let k = 0; k < NPS; k++) {
  const g = Math.floor(wi / 2), pts = smooth(wireCtrl(si, k), 3), a = padPt(si, k), b = leadPt(si, k);
  WIRE(`wA${si}_${k}`, `wA${g}`, pts, 0.045, "au");
  P({ id: `bA${si}_${k}`, layer: `wA${g}`, shape: "sphere", size: [0.15], scale: [1, 0.5, 1], pos: [a[0], a[1] + 0.04, a[2]], mat: "auHi" });
  P({ id: `stA${si}_${k}`, layer: `wA${g}`, shape: "box", size: [0.26, 0.04, 0.26], pos: [b[0], b[1] + 0.02, b[2]], mat: "auHi" });
  wi++;
}
actions.padPulseA = { type: "pulse", _說明: "晶片的焊墊一圈亮起（示意）", parts: Array.from({ length: 4 * NPS }, (_, i) => `padGA${Math.floor(i / NPS)}_${i % NPS}`), color: "sparkC", glow: 0.9, freq: 1.2, halo: 0 };
actions.leadPulseA = { type: "pulse", _說明: "外面的引腳內端亮起（示意）", parts: Array.from({ length: 4 * NPS }, (_, i) => `ldG${Math.floor(i / NPS)}_${i % NPS}`), color: "sparkC", glow: 0.9, freq: 1.2, halo: 0 };
actions.currentA = { type: "flow", _說明: "電從晶片焊墊沿金線流到引腳（示意，一條）", layer: "wA0", path: smooth(wireCtrl(0, 0), 3), n: 6, size: 0.07, shape: "dot", rate: 0.5, color: "sparkC", track: false, free: true, drive: true };
Object.assign(anchors, { padA: A("dieA", padPt(1, 2), 150, -100), leadA: A("lfA", leadPt(1, 5), 150, 100), dieA: A("dieA", [X0 - 1.5, DIEY1, -1.5], -150, -100), wireA: A("wA0", wireCtrl(0, 0)[2], -150, -90) });

// ═════ B 站（X1＝60）：打線機（1＝10 cm）：機殼、工作台、導軌與料匣、XY 平台、焊頭（線軸、線夾、換能器、劈刀、打火棒、相機）、螢幕、警示燈 ═════
const X1 = 60, DK = 8.6;
LAY("bdBase", [13, 9, X1, 4.3]); LAY("bdDeck", [12, 2, X1, 9.2]); LAY("bdHood", [8, 5, X1, 11]); LAY("bdXY", [4, 1.5, X1, 9.2]); LAY("bdHead", [3, 4, X1, 11]);
LAY("bdSpool", [1.6, 1.6, X1, 13.6]); LAY("bdClamp", [1, 0.6, X1, 10.6]); LAY("bdHorn", [1, 2, X1, 10]); LAY("bdCap", [0.4, 1, X1, 9.6]); LAY("bdEfo", [1.4, 0.4, X1, 9.4]); LAY("bdCam", [0.8, 2.6, X1, 11.4]); LAY("bdLf", [10, 0.5, X1, 9.3]);
// 機殼：面板分塊＋接縫＋螺絲、踢腳板、側門與把手、百葉、銘牌、腳座
BOX("bdCab", "bdBase", X1 - 6.2, X1 + 6.2, 0.5, DK, -4.2, 4.2, "panel");
for (const [i, x] of [[0, -2.1], [1, 2.1]]) BOX(`bdSeam${i}`, "bdBase", X1 + x - 0.04, X1 + x + 0.04, 0.6, DK - 0.1, 4.2, 4.24, "seam");
BOX("bdKick", "bdBase", X1 - 6.2, X1 + 6.2, 0.15, 0.6, -4.0, 4.05, "dark");
P({ id: "bdFoot", layer: "bdBase", shape: "cyl", size: [0.3, 0.3], rot: V, pos: [0, 0.15, 0], at: [[X1 - 5.6, 0, 3.6], [X1 + 5.6, 0, 3.6], [X1 - 5.6, 0, -3.6], [X1 + 5.6, 0, -3.6]], mat: "rubber" });
BOX("bdDoorL", "bdBase", X1 - 6.0, X1 - 2.3, 1.0, DK - 0.4, 4.2, 4.28, "panel2"); BOX("bdDoorR", "bdBase", X1 + 2.3, X1 + 6.0, 1.0, DK - 0.4, 4.2, 4.28, "panel2");
for (const [i, x] of [[0, -2.7], [1, 2.7]]) BOX(`bdHandle${i}`, "bdBase", X1 + x - 0.08, X1 + x + 0.08, 3.6, 5.4, 4.28, 4.4, "steel");
P({ id: "bdVent", layer: "bdBase", shape: "box", size: [2.8, 0.08, 0.05], pos: [X1, 0, 4.24], at: Array.from({ length: 8 }, (_, i) => [0, R2(1.4 + i * 0.32), 0]), mat: "seam" });
BOX("bdPlate", "bdBase", X1 - 1.4, X1 + 1.4, 6.0, 6.8, 4.24, 4.28, "warnY"); BOX("bdPlateTx", "bdBase", X1 - 1.1, X1 + 1.1, 6.2, 6.6, 4.28, 4.3, "dark");
P({ id: "bdScrew", layer: "bdBase", shape: "cyl", size: [0.06, 0.04], pos: [0, 0, 4.3], at: [[X1 - 5.9, 1.2, 0], [X1 - 5.9, DK - 0.6, 0], [X1 + 5.9, 1.2, 0], [X1 + 5.9, DK - 0.6, 0], [X1 - 2.5, 1.2, 0], [X1 + 2.5, 1.2, 0]], mat: "steel" });
SPH("bdEstop", "bdBase", 0.28, X1 + 5.4, DK - 0.9, 4.3, "estop"); VC("bdEstopRing", "bdBase", 0.4, DK - 1.3, DK - 1.2, "warnY", { x: X1 + 5.4, z: 4.2 });
// 工作檯面＋導軌（左進右出）＋加熱台＋導線架帶＋料匣
BOX("bdDeckP", "bdDeck", X1 - 6.0, X1 + 6.0, DK, DK + 0.25, -4.0, 4.0, "steel2");
for (const [i, z] of [[0, 0.95], [1, -0.95]]) { BOX(`bdRail${i}`, "bdDeck", X1 - 5.2, X1 + 5.2, DK + 0.25, DK + 0.62, z - 0.12, z + 0.12, "steel"); P({ id: `bdRailBolt${i}`, layer: "bdDeck", shape: "cyl", size: [0.05, 0.05], rot: V, pos: [0, DK + 0.64, z], at: [-4.5, -3, -1.5, 1.5, 3, 4.5].map((x) => [X1 + x, 0, 0]), mat: "dark" }); }
BOX("bdHeater", "bdDeck", X1 - 1.4, X1 + 1.4, DK + 0.25, DK + 0.6, -0.8, 0.8, "heatPlate"); BOX("bdHeaterIns", "bdDeck", X1 - 1.5, X1 + 1.5, DK + 0.25, DK + 0.34, -0.85, 0.85, "dark");
P({ id: "bdHeatWire", layer: "bdDeck", shape: "cyl", size: [0.05, 2.2], rot: [0, 0, 0], pos: [X1 + 1.0, DK + 0.4, -1.9], mat: "rubber" });
BOX("bdWindow", "bdDeck", X1 - 0.9, X1 + 0.9, DK + 0.64, DK + 0.68, -0.5, 0.5, "steel2");   // 壓板開窗
BOX("bdLfStrip", "bdLf", X1 - 5.0, X1 + 5.0, DK + 0.6, DK + 0.63, -0.85, 0.85, "lf");
P({ id: "bdLfDie", layer: "bdLf", shape: "box", size: [0.34, 0.06, 0.34], pos: [0, DK + 0.66, 0], at: [-4, -3, -2, -1, 0, 1, 2, 3, 4].map((x) => [X1 + x, 0, 0]), mat: "dieTop" });
for (const [i, x] of [[0, -5.6], [1, 5.6]]) { BOX(`bdMag${i}`, "bdDeck", X1 + x - 0.6, X1 + x + 0.6, DK + 0.25, DK + 3.2, -1.3, 1.3, "cabDark"); P({ id: `bdMagSlot${i}`, layer: "bdDeck", shape: "box", size: [0.04, 0.04, 2.5], pos: [X1 + x + (x < 0 ? 0.62 : -0.62), 0, 0], at: Array.from({ length: 8 }, (_, j) => [0, R2(DK + 0.5 + j * 0.33), 0]), mat: "dark" }); }
// XY 平台：底座、兩組導軌與滑塊、馬達
BOX("bdXYBase", "bdXY", X1 - 2.6, X1 + 2.6, DK + 0.25, DK + 0.55, -3.8, -1.4, "dark");
for (const [i, z] of [[0, -3.4], [1, -1.8]]) BOX(`bdXRail${i}`, "bdXY", X1 - 2.4, X1 + 2.4, DK + 0.55, DK + 0.7, z - 0.1, z + 0.1, "steel2");
BOX("bdXSlide", "bdXY", X1 - 1.3, X1 + 1.3, DK + 0.7, DK + 0.95, -3.6, -1.6, "steel"); VC("bdXMotor", "bdXY", 0.35, DK + 0.55, DK + 1.2, "dark", { x: X1 + 2.2, z: -2.6 });
// 焊頭本體：Z 軸滑軌、音圈馬達、前板
BOX("bdHeadBody", "bdHead", X1 - 1.0, X1 + 1.0, DK + 0.95, DK + 3.6, -3.2, -1.4, "panel"); BOX("bdHeadSeam", "bdHead", X1 - 1.02, X1 + 1.02, DK + 2.2, DK + 2.25, -3.22, -1.38, "seam");
BOX("bdZRail", "bdHead", X1 - 0.35, X1 + 0.35, DK + 1.0, DK + 3.4, -1.4, -1.25, "steel2"); BOX("bdZCar", "bdHead", X1 - 0.6, X1 + 0.6, DK + 1.4, DK + 2.4, -1.25, -1.0, "steel");
VC("bdVcm", "bdHead", 0.5, DK + 3.6, DK + 4.4, "dark", { x: X1, z: -2.3 }); VT("bdVcmRing", "bdHead", 0.56, 0.48, DK + 4.0, DK + 4.1, "steel", { x: X1, z: -2.3 });
P({ id: "bdHeadLed", layer: "bdHead", shape: "sphere", size: [0.07], pos: [X1 + 0.7, DK + 3.2, -1.38], mat: "lampG" });
// 線軸（金線）：法蘭＋繞線＋軸＋支架；線從線軸經導管往下到線夾
const SPY = DK + 5.2, SPZ = -2.3;
HXC("bdSpoolW", "bdSpool", 0.55, X1 - 0.35, X1 + 0.35, SPY, SPZ, "au"); HXC("bdSpoolF0", "bdSpool", 0.8, X1 - 0.45, X1 - 0.35, SPY, SPZ, "steel2"); HXC("bdSpoolF1", "bdSpool", 0.8, X1 + 0.35, X1 + 0.45, SPY, SPZ, "steel2");
HXC("bdSpoolAx", "bdSpool", 0.12, X1 - 0.8, X1 + 0.6, SPY, SPZ, "steel"); BOX("bdSpoolArm", "bdSpool", X1 - 0.9, X1 - 0.7, DK + 4.4, SPY + 0.1, SPZ - 0.15, SPZ + 0.15, "dark");
SEG("bdTube", "bdSpool", [X1, SPY - 0.55, SPZ + 0.3], [X1, DK + 2.6, -0.4], 0.07, "pfaT");
// 線夾：兩片夾爪＋致動器
BOX("bdClampBody", "bdClamp", X1 - 0.45, X1 + 0.45, DK + 2.25, DK + 2.55, -0.65, -0.25, "dark");
BOX("bdJawL", "bdClamp", X1 - 0.32, X1 - 0.04, DK + 2.05, DK + 2.25, -0.2, 0.02, "steel"); BOX("bdJawR", "bdClamp", X1 + 0.04, X1 + 0.32, DK + 2.05, DK + 2.25, -0.2, 0.02, "steel");
// 換能器：壓電片疊（金／灰交錯）＋變幅桿（錐形，往前收細）＋法蘭
const HY = DK + 1.65;
// r1：換能器沿 x 擺（正面看得到壓電片疊與錐形變幅桿），經支架固定在焊頭前板；爆炸時沿軸線往左抽出
for (let i = 0; i < 6; i++) HXC(`bdPz${i}`, "bdHorn", 0.32, X1 - 2.8 + i * 0.14, X1 - 2.8 + (i + 1) * 0.14, HY, 0.05, i % 2 ? "piezoB" : "piezoA");
HXC("bdBackMass", "bdHorn", 0.34, X1 - 3.3, X1 - 2.8, HY, 0.05, "steel"); HXC("bdHornFl", "bdHorn", 0.46, X1 - 1.96, X1 - 1.86, HY, 0.05, "steel");
P({ id: "bdHornCone", layer: "bdHorn", shape: "cone", size: [0.09, 0.3, 1.86], rot: [0, 90, 0], pos: [X1 - 0.93, HY, 0.05], mat: "horn" });
P({ id: "bdHornBolt", layer: "bdHorn", shape: "cyl", size: [0.04, 0.06], rot: V, pos: [0, HY + 0.12, 0.05], at: [[X1 - 0.5, 0, 0], [X1 - 1.2, 0, 0]], mat: "dark" });
P({ id: "bdPzWire", layer: "bdHorn", shape: "cyl", size: [0.03, 1.2], pos: [X1 - 2.4, HY + 0.34, -0.55], mat: "rubber" });
BOX("bdHornMount", "bdHead", X1 - 2.1, X1 - 1.7, HY - 0.3, HY + 0.3, -1.4, -0.2, "steel2");
// 劈刀（陶瓷，尖端朝下）
P({ id: "bdCapB", layer: "bdCap", shape: "cyl", size: [0.07, 0.5], rot: V, pos: [X1, HY + 0.05, 0.05], mat: "cap" });
P({ id: "bdCapT", layer: "bdCap", shape: "cone", size: [0.025, 0.07, 0.62], rot: [90, 0, 0], pos: [X1, HY - 0.51, 0.05], mat: "capTip" });
SEG("bdWireIn", "bdCap", [X1, DK + 2.6, -0.4], [X1, HY + 0.3, 0.05], 0.02, "au");
// 打火棒（EFO）：絕緣座＋電極
BOX("bdEfoBase", "bdEfo", X1 + 0.9, X1 + 1.5, DK + 0.9, DK + 1.2, -0.2, 0.3, "dark"); SEG("bdEfoRod", "bdEfo", [X1 + 0.95, DK + 1.0, 0.05], [X1 + 0.12, DK + 0.96, 0.05], 0.03, "steel");
// 相機（影像定位）：鏡筒＋環形光＋線
VC("bdCamTube", "bdCam", 0.22, DK + 1.6, DK + 3.6, "dark", { x: X1 + 1.0, z: -0.7 }); VT("bdCamRing", "bdCam", 0.3, 0.2, DK + 1.5, DK + 1.62, "lampY", { x: X1 + 1.0, z: -0.7 });
BOX("bdCamBox", "bdCam", X1 + 0.75, X1 + 1.25, DK + 3.6, DK + 4.1, -0.95, -0.45, "steel"); SEG("bdCamCable", "bdCam", [X1 + 1.0, DK + 4.1, -0.7], [X1 + 1.0, DK + 4.6, -2.0], 0.05, "rubber");
// 透明護罩、螢幕與支臂、警示燈、鍵盤
BOX("bdHoodF", "bdHood", X1 - 4.2, X1 + 4.2, DK + 0.25, DK + 5.6, 3.6, 3.66, "glassDoor"); BOX("bdHoodT", "bdHood", X1 - 4.2, X1 + 4.2, DK + 5.6, DK + 5.66, -3.9, 3.66, "glassDoor");
for (const [i, x] of [[0, -4.2], [1, 4.2]]) BOX(`bdHoodPost${i}`, "bdHood", X1 + x - 0.08, X1 + x + 0.08, DK + 0.25, DK + 5.66, 3.5, 3.7, "steel2");
BOX("bdMonArm", "bdBase", X1 + 5.6, X1 + 5.8, DK, DK + 3.0, 2.6, 2.8, "steel"); BOX("bdMon", "bdBase", X1 + 4.6, X1 + 7.0, DK + 2.6, DK + 4.4, 2.8, 3.0, "dark"); BOX("bdMonS", "bdBase", X1 + 4.7, X1 + 6.9, DK + 2.7, DK + 4.3, 3.0, 3.02, "screen");
VC("bdTower", "bdBase", 0.08, DK, DK + 5.6, "steel", { x: X1 - 5.6, z: -3.4 });
for (const [i, m] of [[0, "lampG"], [1, "lampY"], [2, "lampR"]]) VC(`bdLamp${i}`, "bdBase", 0.22, DK + 5.6 + i * 0.42, DK + 6.0 + i * 0.42, m, { x: X1 - 5.6, z: -3.4 });
BOX("bdKey", "bdBase", X1 - 3.0, X1 + 1.0, DK - 0.4, DK - 0.25, 4.2, 5.2, "dark");
actions.bdUS = { type: "vibrate", _說明: "換能器與劈刀的超音波微振（示意，放大）", parts: ["bdHornCone", "bdCapB", "bdCapT"], axis: [0, 0, 1], amp: 0.02, freq: 14 };
actions.bdHeat = { type: "pulse", _說明: "加熱台發熱（示意）", parts: ["bdHeater"], color: "heatC", glow: 0.6, steady: true, halo: 0 };
actions.bdSpin = { type: "rotate", _說明: "線軸送線慢轉", parts: ["bdSpoolW", "bdSpoolF0", "bdSpoolF1"], axis: [1, 0, 0], pivot: [X1, SPY, SPZ], pivots: Object.fromEntries(["bdSpoolW", "bdSpoolF0", "bdSpoolF1"].map((k) => [k, [X1, SPY, SPZ]])), rps: 0.25, rampSpin: true };
actions.bdBob = { type: "vibrate", _說明: "焊頭上下打線（每秒十幾下，示意放慢）", parts: ["bdCapB", "bdCapT", "bdHornCone", "bdWireIn"], axis: [0, 1, 0], amp: 0.12, freq: 3 };
Object.assign(anchors, { spool: A("bdSpool", [X1 + 0.45, SPY + 0.5, SPZ], 150, -90), horn: A("bdHorn", [X1 - 2.4, HY + 0.3, 0.3], -150, -90), capB: A("bdCap", [X1 + 0.05, HY - 0.45, 0.12], 150, 90), heater: A("bdDeck", [X1 - 1.2, DK + 0.6, 0.8], -150, 100),
  efo: A("bdEfo", [X1 + 1.2, DK + 1.2, 0.05], 150, 90), clamp: A("bdClamp", [X1 - 0.3, DK + 2.4, -0.1], -150, -90), cam: A("bdCam", [X1 + 1.0, DK + 3.2, -0.7], 150, -90), bonder: A("bdBase", [X1 - 4.0, DK - 1.0, 4.3], -150, -100) });

// ═════ C 站（X2＝120）：劈刀特寫（1＝10 µm，示意縮短劈刀）：加熱台、晶片邊緣與兩顆焊墊（沿 x）、引腳、劈刀＋換能器桿（沿 x）＋線夾（一起走）、打火棒、線 ═════
// r1（機構 r0 必改 3、4、6、7、8；物理 r0 必改 3、6、7、9、10）：換能器沿 x 擺（振動同向）、劈刀縮短讓夾持環與線夾入鏡、尖端面比壓扁球寬、下一顆焊墊在畫面 x 方向、超音波圈跟著劈刀走
const X2 = 120;
LAY("cHeat", [30, 2, X2, 0.5]); LAY("cDie", [4, 1, X2 - 2, 5.3]); LAY("cDieBg", [18, 5, X2 - 6, 3]); LAY("cLead", [5, 1, X2 + 7, 2.5]); LAY("cLeadBg", [12, 2, X2 + 10, 1.7]); LAY("cEfo", [10, 2, X2 + 5, 9]);
LAY("cCap", [2, 2, X2 - 0.5, 9.4]); LAY("cCapUp", [12, 10, X2 - 4, 16]); LAY("cBall", [1.2, 1.2, X2 - 0.5, 9.2]); LAY("cTail", [0.6, 1.4, X2 - 0.5, 9]); LAY("cBallB", [2, 1, X2 - 0.5, 5.5]); LAY("cStitch", [2, 1, X2 + 7, 2.6]);
LAY("cSpark", [2, 2, X2 + 0.5, 8.8]); LAY("cUS", [6, 3, X2 - 0.5, 10]); LAY("cGlow", [4, 1, X2 - 0.5, 5.4]); LAY("cJawLl", [2, 2, X2 - 1.5, 18]); LAY("cJawRl", [2, 2, X2 + 0.5, 18]); LAY("cTail2", [0.6, 1.4, X2 + 7, 3.4]);
BOX("cHeatB", "cHeat", X2 - 16, X2 + 16, 0, 1.0, -6, 6, "heatPlate"); P({ id: "cHeatHole", layer: "cHeat", shape: "cyl", size: [0.25, 0.02], rot: V, pos: [0, 1.01, 0], at: [-12, -8, 8, 12].flatMap((x) => [[X2 + x, 0, -4], [X2 + x, 0, 4]]), mat: "dark" });
BOX("cHeatSide", "cHeat", X2 - 16, X2 + 16, 0, 1.0, 6, 6.08, "heatPlate"); BOX("cHeatFin", "cHeat", X2 + 3.0, X2 + 16, 0.2, 0.9, 6.08, 6.14, "dark");
const PADX = X2 - 0.5, PADY = 5.35, LEADX = X2 + 7.2, LEADY = 2.55, PAD2X = PADX - 2.6;
BOX("cPaddle", "cDieBg", X2 - 15, X2 + 2.6, 1.0, 2.5, -6, 6, "lf"); BOX("cEpoxy", "cDieBg", X2 - 14.5, X2 + 1.6, 2.5, 2.7, -5.5, 5.5, "epoxy");
BOX("cDieB", "cDieBg", X2 - 14, X2 + 1.4, 2.7, 5.1, -5, 5, "si"); BOX("cDieTop", "cDieBg", X2 - 14, X2 + 1.4, 5.1, 5.25, -5, 5, "dieTop"); BOX("cPas", "cDieBg", X2 - 14, X2 + 1.4, 5.25, 5.4, -5, 5, "pas");
P({ id: "cPad", layer: "cDie", shape: "box", size: [1.6, 0.14, 1.6], pos: [PADX, 5.32, 0], at: [[0, 0, 0], [PAD2X - PADX, 0, 0]], mat: "alPad" });
P({ id: "cPadN", layer: "cDieBg", shape: "box", size: [1.6, 0.14, 1.6], pos: [PADX, 5.32, 0], at: [[-5.2, 0, 0], [-7.8, 0, 0]], mat: "alPad" });
BOX("cLeadAg", "cLead", X2 + 5.0, X2 + 9.4, 2.5, 2.56, -0.95, 0.95, "lfAg"); BOX("cLeadB", "cLeadBg", X2 + 5.0, X2 + 16, 1.0, 2.5, -1.0, 1.0, "lf");
for (const [i, z] of [[0, -3.2], [1, 3.2]]) { BOX(`cLeadN${i}`, "cLeadBg", X2 + 5.0, X2 + 16, 1.0, 2.5, z - 1.0, z + 1.0, "lf"); BOX(`cLeadNAg${i}`, "cLeadBg", X2 + 5.0, X2 + 9.4, 2.5, 2.56, z - 0.95, z + 0.95, "lfAg"); }
// 劈刀（尖端面半徑 0.85＞壓扁球 0.6）＋筒身＋換能器桿（沿 −x 伸出去）＋夾持環與螺絲＋線夾兩爪＋上方的線；懸停時尖端在 HOVY
const HOVY = 9.6, CX = PADX, R_W = 0.16, CT = 4.0, CB = 7.6, CJ = 8.8;
P({ id: "cCapCone", layer: "cCapUp", shape: "cone", size: [0.85, 1.25, CT], rot: [90, 0, 0], pos: [CX, HOVY + CT / 2, 0], mat: "cap" });
VC("cCapBody", "cCapUp", 1.25, HOVY + CT, HOVY + CB, "cap", { x: CX }); VT("cCapChamf", "cCap", 0.86, 0.32, HOVY, HOVY + 0.1, "capTip", { x: CX });
P({ id: "cCapBore", layer: "cCap", shape: "cyl", size: [0.2, 0.06], rot: V, pos: [CX, HOVY + 0.02, 0], mat: "dark" });
VT("cHornRing", "cCapUp", 1.6, 1.26, HOVY + 5.8, HOVY + 7.4, "horn", { x: CX }); P({ id: "cHornScrew", layer: "cCapUp", shape: "cyl", size: [0.32, 0.9], pos: [CX, HOVY + 6.6, 1.8], mat: "dark" });
P({ id: "cHornTip", layer: "cCapUp", shape: "cone", size: [0.7, 1.1, 9.0], rot: [0, 90, 0], pos: [CX - 6.2, HOVY + 6.6, 0], mat: "horn" });   // +z 端（細）轉到 +x，接劈刀
for (let i = 0; i < 5; i++) P({ id: `cPz${i}`, layer: "cCapUp", shape: "cyl", size: [1.15, 0.36], rot: HX, pos: [CX - 11.0 - i * 0.36, HOVY + 6.6, 0], mat: i % 2 ? "piezoB" : "piezoA" });
P({ id: "cHornFl", layer: "cCapUp", shape: "cyl", size: [1.5, 0.3], rot: HX, pos: [CX - 10.6, HOVY + 6.6, 0], mat: "steel" });
VC("cWireUp", "cCapUp", R_W, HOVY + CB, HOVY + 15, "au", { x: CX });
BOX("cJawL", "cJawLl", CX - 1.3, CX - 0.2, HOVY + CJ, HOVY + CJ + 1.0, -0.7, 0.7, "steel"); BOX("cJawArmL", "cJawLl", CX - 3.6, CX - 1.3, HOVY + CJ + 0.25, HOVY + CJ + 0.75, -0.4, 0.4, "dark");
BOX("cJawR", "cJawRl", CX + 0.2, CX + 1.3, HOVY + CJ, HOVY + CJ + 1.0, -0.7, 0.7, "steel"); BOX("cJawArmR", "cJawRl", CX + 1.3, CX + 3.6, HOVY + CJ + 0.25, HOVY + CJ + 0.75, -0.4, 0.4, "dark");
VC("cTailW", "cTail", R_W, HOVY - 1.1, HOVY + 0.02, "au", { x: CX });
SPH("cFab", "cBall", 0.46, CX, HOVY - 0.44, 0, "auHi");
// 打火棒：絕緣座＋電極，電極尖端在線尾右邊（固定在機台上，劈刀回到這裡放電）
BOX("cEfoBase", "cEfo", X2 + 9.0, X2 + 13.0, HOVY - 1.8, HOVY + 0.2, -1.2, 1.2, "dark"); SEG("cEfoRod", "cEfo", [X2 + 9.0, HOVY - 0.8, 0], [CX + 1.4, HOVY - 0.8, 0], 0.22, "steel");
SPH("cEfoTip", "cEfo", 0.3, CX + 1.35, HOVY - 0.8, 0, "steel");
// 放電電弧：亮藍白鋸齒＋光暈（閃 3～4 幀）
const ARC = [[CX + 1.1, HOVY - 0.8, 0.35], [CX + 0.85, HOVY - 0.45, 0.35], [CX + 0.65, HOVY - 1.05, 0.35], [CX + 0.42, HOVY - 0.6, 0.35], [CX + 0.22, HOVY - 1.15, 0.35], [CX + 0.05, HOVY - 0.95, 0.35]];
for (let i = 0; i < ARC.length - 1; i++) { SEG(`cArc${i}`, "cSpark", ARC[i], ARC[i + 1], 0.075, "arc"); }

P({ id: "cBallFlat", layer: "cBallB", shape: "sphere", size: [0.6], scale: [1, 0.42, 1], pos: [CX, PADY + 0.22, 0], mat: "auHi" });
P({ id: "cStitchF", layer: "cStitch", shape: "box", size: [1.1, 0.12, 0.7], pos: [LEADX + 0.15, LEADY + 0.08, 0], mat: "auHi" }); P({ id: "cStitchT", layer: "cStitch", shape: "box", size: [0.5, 0.1, 0.3], pos: [LEADX + 0.85, LEADY + 0.07, 0], mat: "au" });
VC("cTailBreak", "cTail2", R_W, LEADY + 0.15, LEADY + 1.3, "au", { x: LEADX });   // 劈刀抬起 1.0 時，線從魚尾連到劈刀孔口
// 超音波圈：定義在懸停位置（尖端上方 0.75），跟著劈刀一起走
P({ id: "cUSWave", layer: "cUS", shape: "tube", size: [0.8, 0.7, 0.06], rot: [0, 90, 0], pos: [CX, HOVY + 0.75, 0], at: [[-1.6, 0, 0], [-2.4, 0, 0], [1.6, 0, 0], [2.4, 0, 0]], mat: "us" });
P({ id: "cBondGlow", layer: "cGlow", shape: "cyl", size: [1.0, 0.05], rot: V, pos: [CX, PADY + 0.08, 0], mat: "heat" });
// 線弧：高度不超過跨距三分之一；細分成小段（每段一層），劈刀走到才出現；沒有接點小球（不竹節）
const LOOP = smooth([[CX, PADY + 0.3, 0], [CX, PADY + 1.4, 0], [CX + 1.1, PADY + 1.95, 0], [CX + 3.4, PADY + 1.7, 0], [CX + 5.7, LEADY + 1.4, 0], [LEADX, LEADY + 0.2, 0]], 4);
const NL = LOOP.length - 1;
for (let i = 0; i < NL; i++) { LAY(`cW${i}`, [1, 1, (LOOP[i][0] + LOOP[i + 1][0]) / 2, (LOOP[i][1] + LOOP[i + 1][1]) / 2]); SEG(`cWs${i}`, `cW${i}`, LOOP[i], LOOP[i + 1], R_W, "au"); }
actions.cUSvib = { type: "vibrate", _說明: "超音波：劈刀尖端沿換能器方向（x）微振（示意，放大很多）", parts: ["cCapCone", "cCapChamf", "cBallFlat"], axis: [1, 0, 0], amp: 0.06, freq: 12 };
actions.cUSring = { type: "pulse", parts: ["cUSWave"], color: "usC", glow: 0.9, freq: 4, halo: 0 };
actions.cHeatOn = { type: "pulse", _說明: "加熱台發熱（約一百多度，示意）", parts: ["cHeatB", "cHeatSide"], color: "heatC", glow: 0.55, steady: true, halo: 0 };
actions.cBondHot = { type: "pulse", parts: ["cBondGlow"], color: "heatC", glow: 1, freq: 2, halo: 0.6 };
Object.assign(anchors, { cCapA: A("cCapUp", [CX + 1.0, HOVY + 2.5, 0], 150, -90), cFabA: A("cBall", [CX - 0.3, HOVY - 0.5, 0], -150, 90), cEfoA: A("cEfo", [CX + 4.5, HOVY - 0.8, 0.2], 150, 90),
  cPadA: A("cDie", [CX - 0.6, PADY + 0.05, 0.6], -150, 100), cBallA: A("cBallB", [CX - 0.4, PADY + 0.25, 0.3], -150, 100), cLoopA: A(`cW${Math.floor(NL / 2)}`, LOOP[Math.floor(NL / 2)], 150, -100),
  cStitchA: A("cStitch", [LEADX + 0.6, LEADY + 0.1, 0.3], 150, 100), cClampA: A("cJawLl", [CX - 0.8, HOVY + CJ + 0.5, 0.7], -150, -90), cHornA: A("cCapUp", [CX - 6.0, HOVY + 7.2, 0.6], -150, -90), cHeatA: A("cHeat", [X2 + 6, 1.0, 6], 150, 100) });

// ═════ D 站（X3＝170）：焊點剖面（1＝2 µm）：金球、鋁墊、鈍化層、細基底全部切半（剖面朝鏡頭 z＝0）；介面一條灰色氧化膜 → 搓碎往兩側擠出 → 紫色接合層＋原子只在介面薄帶互擠 ═════
const X3 = 170, DPY = 5.0, DZ = 5.0;   // 切面在 z＝0，實體在 z∈[−DZ, 0]
LAY("dSi", [26, 5, X3, 2.5]); LAY("dPad", [18, 1, X3, 4.6]); LAY("dOx", [12, 0.3, X3, 5.05]); LAY("dBall", [12, 3, X3, 6]); LAY("dNeckL", [3, 8, X3, 10]); LAY("dImc", [10, 0.5, X3, 5.1]); LAY("dArrow", [16, 3, X3, 8]); LAY("dHeat", [26, 1, X3, 0.4]); LAY("dAtom", [10, 1, X3, 5.1]);
BOX("dSiB", "dSi", X3 - 13, X3 + 13, 0.8, 4.2, -DZ, 0, "si"); BOX("dSiTop", "dSi", X3 - 13, X3 + 13, 4.2, 4.3, -DZ, 0, "dieTop");
BOX("dPasL", "dSi", X3 - 13, X3 - 7.0, 4.3, 5.4, -DZ, 0, "pas"); BOX("dPasR", "dSi", X3 + 7.0, X3 + 13, 4.3, 5.4, -DZ, 0, "pas");
BOX("dPadB", "dPad", X3 - 7.0, X3 + 7.0, 4.3, DPY, -DZ, 0, "alPad");
BOX("dOxL", "dOx", X3 - 6.8, X3 + 6.8, DPY, DPY + 0.14, -DZ, 0.01, "ox");   // 搓之前：介面一條連續的灰色氧化膜
// 金球剖面（壓扁的球＋頸）：外形用多邊形擠出
{ const N = 24, a = 5.0, b = 1.9, pts = [];
  for (let k = 0; k <= N; k++) { const t = (Math.PI * k) / N; pts.push([R2(a * Math.cos(t)), R2(b * Math.sin(t))]); }
  P({ id: "dBallS", layer: "dBall", shape: "poly", pts: [...pts.slice(0, 9), [1.3, 2.4], [-1.3, 2.4], ...pts.slice(16)], size: [10, 2.4, DZ], pos: [X3, DPY + 0.14, -DZ / 2], mat: "au" }); }
BOX("dNeck", "dNeckL", X3 - 1.3, X3 + 1.3, DPY + 2.5, DPY + 9, -DZ, 0, "au");
BOX("dImcB", "dImc", X3 - 4.8, X3 + 4.8, DPY - 0.08, DPY + 0.2, -DZ, 0.02, "imc");
// 碎掉的氧化膜（往兩側擠出去的碎片）
P({ id: "dOxFlake", layer: "dOx", shape: "box", size: [0.5, 0.12, 0.4], pos: [X3, DPY + 0.07, 0.2], at: [-6.6, -5.9, -5.3, 5.3, 5.9, 6.6].map((x, i) => [x, (i % 2) * 0.05, 0]), mat: "ox" });
// 超音波方向箭頭（左右來回）與加熱
for (const [i, s] of [[0, -1], [1, 1]]) { SEG(`dArr${i}`, "dArrow", [X3 + s * 3.0, DPY + 4.4, 0.3], [X3 + s * 5.4, DPY + 4.4, 0.3], 0.18, "us"); P({ id: `dArrH${i}`, layer: "dArrow", shape: "cone", size: [0.01, 0.45, 0.9], rot: [0, s * 90, 0], pos: [X3 + s * 5.8, DPY + 4.4, 0.3], mat: "us" }); }
BOX("dHeatB", "dHeat", X3 - 13, X3 + 13, 0, 0.8, -DZ, 0, "heatPlate");
actions.dScrub = { type: "vibrate", _說明: "超音波讓金球貼著焊墊左右來回搓（示意，放大很多）", parts: ["dBallS", "dNeck"], axis: [1, 0, 0], amp: 0.14, freq: 9 };
actions.dOxBreak = { type: "flow", _說明: "介面的氧化膜被搓碎，碎片從球的兩側邊緣被擠出去（灰色）", layer: "dOx", path: [[X3 - 2.5, DPY + 0.07, 0.25], [X3 - 5.2, DPY + 0.1, 0.25], [X3 - 7.2, DPY + 0.3, 0.25]], n: 10, size: 0.16, shape: "grit", rate: 0.6, color: "oxC", track: false, jitter: 0.25, free: true };
actions.dOxBreakR = { type: "flow", layer: "dOx", path: [[X3 + 2.5, DPY + 0.07, 0.25], [X3 + 5.2, DPY + 0.1, 0.25], [X3 + 7.2, DPY + 0.3, 0.25]], n: 10, size: 0.16, shape: "grit", rate: 0.6, color: "oxC", track: false, jitter: 0.25, free: true };
actions.dAuDown = { type: "flow", _說明: "金原子往下、鋁原子往上，只在介面上下一條薄帶裡互相擠進去（示意）", layer: "dAtom", path: [[X3 - 4.0, DPY + 0.45, 0.25], [X3 - 4.0, DPY - 0.3, 0.25]], n: 3, lanes: 9, laneDir: [1, 0, 0], laneGap: 1.0, size: 0.13, shape: "dot", rate: 0.5, color: "ballAtC", track: false, free: true };
actions.dAlUp = { type: "flow", layer: "dAtom", path: [[X3 - 3.5, DPY - 0.35, 0.25], [X3 - 3.5, DPY + 0.4, 0.25]], n: 3, lanes: 8, laneDir: [1, 0, 0], laneGap: 1.0, size: 0.13, shape: "dot", rate: 0.5, color: "alAtC", track: false, free: true };
actions.dHeatOn = { type: "pulse", parts: ["dHeatB"], color: "heatC", glow: 0.55, steady: true, halo: 0 };
actions.dImcGlow = { type: "pulse", parts: ["dImcB"], color: "imcC", glow: 0.9, steady: true, halo: 0 };
Object.assign(anchors, { dOxA: A("dOx", [X3 - 3.5, DPY + 0.08, 0.05], -150, 100), dBallA: A("dBall", [X3 + 2.5, DPY + 1.2, 0.05], 150, -90), dImcA: A("dImc", [X3 + 3.0, DPY + 0.05, 0.05], 150, 100), dPadA: A("dPad", [X3 - 6, DPY - 0.3, 0.05], -150, 100) });

// ═════ E 站（X5＝250）：三支劈刀：金線（亮）｜銅線沒吹保護氣（燒出來的球暗、氧化）｜銅線先開保護氣再放電（亮） ═════
const X5 = 250, EY = 9.0, EXS = [X5 - 11, X5, X5 + 11];
LAY("eBase", [40, 2, X5, 0.5]); LAY("eAu", [3, 2, EXS[0], EY]); LAY("eCu", [3, 2, EXS[1], EY]); LAY("eCu2", [3, 2, EXS[2], EY]); LAY("eGas", [8, 6, EXS[2], EY]); LAY("eCuOx", [2, 2, EXS[1], EY]); LAY("eCuOk", [2, 2, EXS[2], EY]); LAY("eCrack", [4, 1, EXS[1], 4.4]); LAY("eSpool", [36, 6, X5, 26]); LAY("eUp", [36, 14, X5, 18]);
LAY("eSpk1", [2, 2, EXS[1], EY]); LAY("eSpk2", [2, 2, EXS[2], EY]);
BOX("eHeat", "eBase", X5 - 20, X5 + 20, 0, 1.0, -6, 6, "heatPlate"); BOX("eDie", "eBase", X5 - 17, X5 + 17, 1.0, 4.2, -5, 5, "si"); BOX("eDieTop", "eBase", X5 - 17, X5 + 17, 4.2, 4.3, -5, 5, "dieTop");
P({ id: "ePad", layer: "eBase", shape: "box", size: [2, 0.12, 2], pos: [0, 4.36, 0], at: EXS.map((x) => [x, 0, 0]), mat: "alPad" });
for (const [i, lay, wm] of [[0, "eAu", "au"], [1, "eCu", "cuW"], [2, "eCu2", "cuW"]]) {
  const x = EXS[i];
  P({ id: `eCone${i}`, layer: "eUp", shape: "cone", size: [0.85, 1.25, 4.0], rot: [90, 0, 0], pos: [x, EY + 2.0, 0], mat: "cap" }); VC(`eBody${i}`, "eUp", 1.25, EY + 4, EY + 7, "cap", { x });
  VC(`eWire${i}`, "eUp", 0.16, EY + 7, EY + 22.6, wm, { x }); VT(`eTip${i}`, lay, 0.86, 0.3, EY, EY + 0.1, "capTip", { x });
  // 線軸在劈刀正上方支架，線從線軸往下進劈刀頂
  HXC(`eSpW${i}`, "eSpool", 1.6, x - 1.2, x + 1.2, EY + 24.2, 0, wm); HXC(`eSpFa${i}`, "eSpool", 2.2, x - 1.5, x - 1.2, EY + 24.2, 0, "steel2"); HXC(`eSpFb${i}`, "eSpool", 2.2, x + 1.2, x + 1.5, EY + 24.2, 0, "steel2");
  BOX(`eSpArm${i}`, "eSpool", x - 1.9, x - 1.6, EY + 21.5, EY + 24.4, -0.2, 0.2, "dark");
}
SPH("eAuFab", "eAu", 0.46, EXS[0], EY - 0.44, 0, "auHi");
P({ id: "eCuOxBall", layer: "eCuOx", shape: "sphere", size: [0.48], scale: [1.05, 0.9, 1], pos: [EXS[1], EY - 0.44, 0], mat: "cuOx" });
SPH("eCuOkBall", "eCuOk", 0.46, EXS[2], EY - 0.44, 0, "cuW");
for (const [lay, x] of [["eSpk1", EXS[1]], ["eSpk2", EXS[2]]]) { const z = [[x + 1.35, EY - 0.8, 0.35], [x + 1.05, EY - 0.45, 0.35], [x + 0.75, EY - 1.0, 0.35], [x + 0.45, EY - 0.6, 0.35], [x + 0.15, EY - 1.05, 0.35]]; for (let i = 0; i < 4; i++) SEG(`${lay}A${i}`, lay, z[i], z[i + 1], 0.075, "arc"); }
for (const [i, x] of [[1, EXS[1]], [2, EXS[2]]]) { SEG(`eEfoRod${i}`, "eBase", [x + 5.0, EY - 0.8, 0.35], [x + 1.4, EY - 0.8, 0.35], 0.18, "steel"); SPH(`eEfoTip${i}`, "eBase", 0.24, x + 1.38, EY - 0.8, 0.35, "steel"); BOX(`eEfoBase${i}`, "eBase", x + 5.0, x + 6.6, EY - 1.6, EY, -0.8, 0.8, "dark"); }
// 保護氣罩：環形噴口＋進氣管；氣流用大量細粒子從噴口錐狀散開、繞過劈刀尖
VT("eGasRing", "eGas", 2.6, 2.2, EY - 2.1, EY - 1.7, "steel", { x: EXS[2] }); SEG("eGasPipe", "eGas", [EXS[2] - 2.6, EY - 1.9, 0], [EXS[2] - 6.0, EY + 1.2, 0], 0.25, "steel");
P({ id: "eGasNozzle", layer: "eGas", shape: "cyl", size: [0.12, 0.3], rot: V, pos: [EXS[2], EY - 1.65, 0], at: [0, 60, 120, 180, 240, 300].map((d) => { const [x, z] = pol(d, 2.4); return [x, 0, z]; }), mat: "dark" });
SEG("eCr0", "eCrack", [EXS[1] - 0.7, 4.43, 0.3], [EXS[1], 4.43, -0.2], 0.05, "crack"); SEG("eCr1", "eCrack", [EXS[1], 4.43, -0.2], [EXS[1] + 0.7, 4.43, 0.4], 0.05, "crack");
for (const [k, sgn] of [["A", -1], ["B", 1]]) actions[`eGas${k}`] = { type: "flow", _說明: "保護氣（氮＋氫）從環形噴口錐狀往下散開、繞過劈刀尖與球（細粒子）", layer: "eGas", path: [[EXS[2] + sgn * 2.4, EY - 1.6, 0], [EXS[2] + sgn * 1.0, EY - 0.9, 0], [EXS[2] + sgn * 0.6, EY - 1.4, 0], [EXS[2] + sgn * 1.5, EY - 3.0, 0]], n: 26, lanes: 3, laneDir: [0, 0, 1], laneGap: 0.6, size: 0.07, shape: "dot", rate: 0.55, color: "gasC", track: false, jitter: 0.35, free: true };
actions.eGasIn = { type: "flow", layer: "eGas", path: [[EXS[2] - 6.0, EY + 1.2, 0], [EXS[2] - 2.6, EY - 1.9, 0]], n: 12, size: 0.07, shape: "dot", rate: 0.5, color: "gasC", track: false, jitter: 0.15, free: true };
Object.assign(anchors, { eAuA: A("eAu", [EXS[0] - 0.3, EY - 0.6, 0.4], -150, 90), eCuA: A("eCuOx", [EXS[1] - 0.3, EY - 0.6, 0.4], -150, 90), eGasA: A("eGas", [EXS[2] - 2.4, EY - 1.9, 0.5], -150, 90), eOkA: A("eCuOk", [EXS[2] + 0.3, EY - 0.6, 0.4], 150, 90) });

// ═════ A 站預告：封裝膠從上方蓋下來＋旁邊另一片小載板上的錫球（另一種封裝，下一集） ═════
LAY("moldA", [20, 2, X0, 3]); LAY("ballsA", [12, 1, X0 + 14, 0.4]);
P({ id: "moldTop", layer: "moldA", shape: "slab", size: [12.4, 1.6, 12.4], r: 0.3, pos: [X0, 2.2, 0], mat: "mold" }); P({ id: "moldDot", layer: "moldA", shape: "cyl", size: [0.4, 0.02], rot: V, pos: [X0 - 4.6, 3.01, -4.6], mat: "dark" });
BOX("bgaSub", "ballsA", X0 + 11.4, X0 + 16.6, 0.9, 1.15, 0.4, 5.6, "board");
P({ id: "sBall", layer: "ballsA", shape: "sphere", size: [0.35], pos: [X0 + 14, 0.6, 3], at: Array.from({ length: 25 }, (_, i) => [R2((i % 5 - 2) * 0.9), 0, R2((Math.floor(i / 5) - 2) * 0.9)]), mat: "solder" });
LAY("floorAll", [400, 1, 150, 0], true);
P({ id: "floorPlate", layer: "floorAll", shape: "box", size: [420, 0.05, 40], pos: [150, -0.03, 0], mat: "floor" });

const BGL = new Set(["cLead", "cEfo", "dSi", "dHeat", "cDieBg", "cLeadBg", "cJawLl", "cJawRl", "lfA", "bdBase", "bdHood", "bdLf", "bdXY", "cHeat", "cCapUp", "dHeat", "dNeckL", "eBase", "eSpool", "eUp"]);   // 背景層：支撐、機殼、往畫面外延伸的部分（版面檢查不算主素材）
for (const l of layers) if (BGL.has(l.id)) l.bg = true;
const model = {
  name: "示意 封裝打線：導線架上的晶片（焊墊、引腳、28 條金線）、打線機（機殼、導軌與料匣、加熱台、XY 平台、焊頭爆炸分解：線軸、線夾、換能器、劈刀、打火棒、相機）、劈刀特寫（打火成球→第一焊點→線弧→第二焊點→拉斷）、焊點剖面（超音波磨破氧化膜、原子接合）、金線與銅線（保護氣、氧化、壓裂）（示意，非特定廠牌）",
  unit: "示意（依站別）",
  size: { w: 40, h: 18, r: 0.6, t: 30 },
  palette, materials,
  partNames: { spool: "線軸", horn: "超音波換能器", capB: "劈刀", heater: "加熱台", efo: "打火棒", clamp: "線夾" },
  layers, parts, anchors, actions,
  pose: { yaw0: 0, yawIso: 0, drift: 0 },
  camera: { stand: { d: 40, elev: 24, y: 2 } },
  fx: { dpr: 1, srcPx: 30, shadows: 0, fog: false, dust: false, vaporSprites: false, shimmer: false },
  info: { X0, X1, X2, X3, X5, CX, HOVY, PADY, LEADX, LEADY, PAD2X, DK, HY, LOOP, DPY, EY, EXS },
};
const out = path.join(path.dirname(new URL(import.meta.url).pathname), "model.json");
fs.writeFileSync(out, JSON.stringify(model, null, 1) + "\n");
console.log(`✔ ${out}：${parts.length} 個零件、${parts.reduce((a, p) => a + Math.max(1, (p.at?.length ?? 0)), 0)} 個實體（含複製）、${layers.length} 層`);

// node videos/tech-chem/gen-model.mjs → 寫 videos/tech-chem/model.json（本檔前半沿用 tech-precursor 的零件與材質輔助函式，後半是濕式化學品專用）
// 單位：1＝10 cm，地板頂面 y＝0，x 向右、z 向觀眾。
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


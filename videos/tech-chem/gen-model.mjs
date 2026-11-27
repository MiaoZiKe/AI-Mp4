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


// ═════ 濕式化學品專用色票與材質 ═════
Object.assign(palette, {
  hdpeC: "#EEF2F6", drumC: "#2F6DB5", drumDarkC: "#1F4E86", pfaC: "#F2EFE6", pfaDarkC: "#CFC8B8", concC: "#B9B5AD", concDarkC: "#8E8A82", poolC: "#4FC3E8", tileC: "#E6F1F5", tileLineC: "#9FC4D0",
  cleanC: "#7FC8F0", etchC: "#F2C94C", slurryC: "#F1ECE2", silicaC: "#E3EAF5", ceriaC: "#EFD98A", dustC: "#3F444C", rustC: "#B5532B", rustDarkC: "#7E3318", padC: "#7186A6", padDarkC: "#4F5E78",
  acidC: "#D7E86A", oxidC: "#E5484D", ironC: "#98A1AF", ironDarkC: "#59616E", blueP: "#2F7FE0", lumpC: "#8A8F96", scratchC: "#E5484D", woodC: "#C9A66B", woodDarkC: "#9C7B45", lemonC: "#F5D948", n2mistC: "#DCE6F2", upwC: "#6CB6F0", wasteC: "#9AA1AB", pleatC: "#F7F4EC", oxFilmC: "#A89E92", steelC: "#5C6678",
});
Object.assign(materials, {
  hdpe: M("std", "hdpeC", { rough: 0.6, metal: 0.05, env: 0.3 }), hdpeT: M("phys", "hdpeC", { rough: 0.3, metal: 0, clearcoat: 1, opacity: 0.32, env: 0.5 }),
  drum: M("std", "drumC", { rough: 0.55, metal: 0.1, env: 0.35 }), drumDark: M("std", "drumDarkC", { rough: 0.6, metal: 0.1 }),
  pfa: M("std", "pfaC", { rough: 0.45, metal: 0, env: 0.4 }), pfaT: M("phys", "pfaC", { rough: 0.25, metal: 0, clearcoat: 1, opacity: 0.38, env: 0.5 }), pfaDark: M("std", "pfaDarkC", { rough: 0.5, metal: 0 }),
  conc: M("std", "concC", { rough: 0.95, metal: 0 }), concDark: M("std", "concDarkC", { rough: 0.95, metal: 0 }),
  pool: M("phys", "poolC", { rough: 0.05, metal: 0, clearcoat: 1, opacity: 0.7, env: 0.5 }), tile: M("std", "tileC", { rough: 0.4, metal: 0.1 }), tileLine: M("std", "tileLineC", { rough: 0.6, metal: 0 }),
  clean: M("phys", "cleanC", { rough: 0.05, metal: 0, clearcoat: 1, opacity: 0.6, env: 0.5 }), etch: M("phys", "etchC", { rough: 0.05, metal: 0, clearcoat: 1, opacity: 0.6, env: 0.5 }), slurry: M("phys", "slurryC", { rough: 0.2, metal: 0, clearcoat: 0.5, opacity: 0.62, env: 0.4 }),
  slurryS: M("std", "slurryC", { rough: 0.4, metal: 0, opacity: 0.9, env: 0.4 }), silica: M("phys", "silicaC", { rough: 0.15, metal: 0.05, clearcoat: 1, opacity: 0.92, env: 0.8 }), ceria: M("std", "ceriaC", { rough: 0.4, metal: 0.1, env: 0.6 }),
  dust: M("std", "dustC", { rough: 0.9, metal: 0 }), rust: M("std", "rustC", { rough: 0.9, metal: 0.1 }), rustDark: M("std", "rustDarkC", { rough: 0.95, metal: 0.1 }),
  pad: M("std", "padC", { rough: 0.9, metal: 0, env: 0.15 }), padDark: M("std", "padDarkC", { rough: 0.9, metal: 0 }),
  acid: M("phys", "acidC", { rough: 0.05, metal: 0, clearcoat: 1, opacity: 0.62, env: 0.5 }), oxid: glowM("oxidC", 0.95, 0.4), blueP: glowM("blueP", 0.95, 0.4),
  iron: M("std", "ironC", { rough: 0.55, metal: 0.8, env: 0.5, tex: "brushed", texScale: 2 }), ironDark: M("std", "ironDarkC", { rough: 0.6, metal: 0.7, env: 0.4 }), ironGhost: M("phys", "ironC", { rough: 0.4, metal: 0.6, clearcoat: 1, opacity: 0.22, env: 0.6 }),
  lump: M("std", "lumpC", { rough: 0.9, metal: 0.05 }), scratch: glowM("scratchC", 0.95, 0.5), wood: M("std", "woodC", { rough: 0.9, metal: 0 }), woodDark: M("std", "woodDarkC", { rough: 0.95, metal: 0 }),
  lemon: M("std", "lemonC", { rough: 0.55, metal: 0, emissive: "lemonC", ei: 0.15 }), n2mist: glowM("n2mistC", 0.5, 0.3), upw: M("std", "upwC", { rough: 0.35, metal: 0.4, env: 0.4 }), waste: M("std", "wasteC", { rough: 0.6, metal: 0.2, env: 0.3 }),
  dustGlow: glowM("warnC", 0.85, 0.9), sparkle: glowM("cleanC", 0.9, 0.8),
  pleat: M("std", "pleatC", { rough: 0.8, metal: 0, env: 0.2 }), oxFilmM: M("std", "oxFilmC", { rough: 0.5, metal: 0.2, opacity: 0.8, env: 0.4 }), slurryT: M("phys", "slurryC", { rough: 0.2, metal: 0, clearcoat: 0.5, opacity: 0.2, env: 0.4 }),
});
const FLUID = ["liqClean", "liqEtch", "liqSlurry"];
const V2 = [0, 0, 0];
const PIPEC = (id, layer, pts, r, mat, o = {}) => PIPE(id, layer, pts, r, mat, o);   // 同 PIPE
/** 裝在管上的管夾：每隔 gap 一個圓環＋立柱底座（避免一根直棒）。pts 同 PIPE */
const CLAMPS = (id, layer, x0, x1, y, z, r, gap, standTo = 0) => {
  const at = []; for (let x = x0; x <= x1 + 1e-6; x += gap) at.push([R2(x), 0, 0]);
  P({ id: `${id}Ring`, layer, shape: "tube", size: [r * 1.55, r * 1.12, 0.22], rot: HX, pos: [0, y, z], at, mat: "dark" });
  P({ id: `${id}Bolt`, layer, shape: "cyl", size: [0.05, 0.3], pos: [0, y + r * 1.5, z], rot: V, at, mat: "steel" });
  if (standTo > 0) { P({ id: `${id}Post`, layer, shape: "box", size: [0.2, y - r * 1.5 - standTo, 0.2], pos: [0, R2(standTo + (y - r * 1.5 - standTo) / 2), z], at, mat: "steel" }); P({ id: `${id}Foot`, layer, shape: "box", size: [0.9, 0.1, 0.9], pos: [0, R2(standTo + 0.05), z], at, mat: "dark" }); }
};
/** 雙層管：內管＋外套管（半透明灰）＋端部環與管夾 */
const DPIPE = (id, layer, pts, r, o = {}) => {
  PIPE(`${id}In`, layer, pts, r, "pfa");
  for (let i = 0; i < pts.length - 1; i++) {
    const [x0, y0, z0] = pts[i], [x1, y1, z1] = pts[i + 1], L = Math.hypot(x1 - x0, y1 - y0, z1 - z0), rot = Math.abs(x1 - x0) > 1e-6 ? HX : Math.abs(y1 - y0) > 1e-6 ? V : [0, 0, 0];
    P({ id: `${id}Out${i}`, layer, shape: "tube", size: [r * 1.75, r * 1.6, R2(L - 0.5)], rot, pos: [R2((x0 + x1) / 2), R2((y0 + y1) / 2), R2((z0 + z1) / 2)], mat: "pfaT" });
  }
};
const pt = (x, y, z) => [x, y, z];
/** 20 公升桶（carboy）：半透明桶身＋液體＋蓋＋把手＋標籤 */
const JUG = (id, layer, x, z, liqMat, labelMat) => {
  P({ id: `${id}Body`, layer, shape: "slab", size: [3.0, 4.2, 2.4], r: 0.4, pos: [x, 0.1 + 2.1, z - 1.2], mat: "hdpeT" });
  P({ id: `${id}Liq`, layer, shape: "slab", size: [2.7, 3.1, 2.1], r: 0.3, pos: [x, 0.25 + 1.55, z - 1.05], mat: liqMat });
  VC(`${id}Neck`, layer, 0.62, 4.2, 4.7, "hdpe", { x, z }); VC(`${id}Cap`, layer, 0.74, 4.7, 5.1, labelMat, { x, z });
  P({ id: `${id}Rib`, layer, shape: "tube", size: [0.78, 0.66, 0.05], rot: V, pos: [x, 4.9, z], at: [[0, 0.1, 0], [0, -0.1, 0]], mat: "dark" });
  BOX(`${id}Handle`, layer, x + 0.9, x + 1.4, 3.4, 4.2, z - 0.35, z + 0.35, "hdpe"); BOX(`${id}Label`, layer, x - 1.1, x + 1.1, 1.0, 2.6, z + 0.0, z + 0.04, labelMat);
  BOX(`${id}LabelTx`, layer, x - 0.8, x + 0.8, 1.5, 1.9, z + 0.04, z + 0.07, "dark"); BOX(`${id}Haz`, layer, x - 0.4, x + 0.4, 2.0, 2.4, z + 0.04, z + 0.07, "warnY");
};
/** 立式儲槽：槽身、底、頂蓋（扁球）、人孔蓋與螺栓圈、液位計視窗、爬梯、氮封呼吸閥、出口閥與手輪、銘牌 */
const TANK = (id, layerBody, layerFit, x, z, R, H, o = {}) => {
  VT(`${id}Wall`, layerBody, R, R - 0.1, 0.5, H, "hdpe", { x, z });
  VT(`${id}Rib`, layerBody, R + 0.06, R - 0.05, 0.5, H, "pfaDark", { x, z, at: [[0, 0, 0]] });
  P({ id: `${id}Hoop`, layer: layerBody, shape: "tube", size: [R + 0.12, R - 0.02, 0.2], rot: V, pos: [x, 0.5, z], at: [2, 5, 8, 11].filter((y) => y < H - 1).map((y) => [0, y, 0]), mat: "steel" });
  VC(`${id}Bot`, layerBody, R, 0.4, 0.6, "dark", { x, z });
  P({ id: `${id}Dome`, layer: layerBody, shape: "sphere", size: [R], scale: [1, 0.24, 1], pos: [x, H, z], mat: "hdpe" });
  VC(`${id}Man`, layerFit, 1.5, H + R * 0.24 - 0.05, H + R * 0.24 + 0.3, "steel2", { x, z });
  P({ id: `${id}ManBolt`, layer: layerFit, shape: "cyl", size: [0.09, 0.14], rot: V, pos: [x, H + R * 0.24 + 0.36, z], at: RING(10, 1.25).map(([a, , b]) => [a, 0, b]), mat: "steel" });
  VC(`${id}ManHand`, layerFit, 0.25, H + R * 0.24 + 0.3, H + R * 0.24 + 0.55, "dark", { x, z });
  PIPE(`${id}Vent`, layerFit, [[x + 2.6, H + R * 0.24 * 0.6, z], [x + 2.6, H + 2.2, z], [x + 3.4, H + 2.2, z]], 0.16, "pfa");
  VC(`${id}Breath`, layerFit, 0.34, H + 2.2, H + 2.7, "steel2", { x: x + 3.4, z });
  // 液位計：側面透明視窗＋刻度＋浮標
  BOX(`${id}Gauge`, layerFit, x + R - 0.05, x + R + 0.35, 2, H - 1.5, z - 0.3, z + 0.3, "window"); BOX(`${id}GaugeLiq`, layerFit, x + R + 0.02, x + R + 0.3, 2, 2 + (H - 3.5) * 0.65, z - 0.18, z + 0.18, "clean");
  P({ id: `${id}GaugeTick`, layer: layerFit, shape: "box", size: [0.2, 0.05, 0.05], pos: [x + R + 0.4, 0, z + 0.34], at: Array.from({ length: 9 }, (_, i) => [0, 2.2 + i * ((H - 4) / 8), 0]), mat: "dark" });
  // 爬梯（左側）
  P({ id: `${id}LadRail`, layer: layerFit, shape: "box", size: [0.12, H - 0.6, 0.12], pos: [x - R - 0.55, (H + 0.4) / 2, z], at: [[0, 0, -0.5], [0, 0, 0.5]], mat: "steel" });
  P({ id: `${id}LadRung`, layer: layerFit, shape: "cyl", size: [0.05, 1.0], pos: [x - R - 0.55, 0, z], at: Array.from({ length: Math.floor((H - 1.5) / 0.9) }, (_, i) => [0, 1.0 + i * 0.9, 0]), mat: "steel" });
  BOX(`${id}Plate`, layerFit, x - 1.2, x + 1.2, 6.4, 7.6, z + R - 0.02, z + R + 0.05, "steel2"); BOX(`${id}PlateTx`, layerFit, x - 0.9, x + 0.9, 6.7, 7.0, z + R + 0.05, z + R + 0.08, "dark"); BOX(`${id}PlateTx2`, layerFit, x - 0.9, x + 0.5, 7.1, 7.3, z + R + 0.05, z + R + 0.08, "dark");
  // 出口：短管＋球閥＋手輪
  HXC(`${id}Out`, layerFit, 0.26, x + R - 0.2, x + R + 1.5, 1.6, z, "pfa");
  P({ id: `${id}OutVal`, layer: layerFit, shape: "sphere", size: [0.5], pos: [x + R + 1.0, 1.6, z], mat: "steel2" });
  VC(`${id}OutStem`, layerFit, 0.08, 1.9, 2.5, "steel", { x: x + R + 1.0, z }); BOX(`${id}OutWheel`, layerFit, x + R + 0.4, x + R + 1.6, 2.5, 2.62, z - 0.12, z + 0.12, "estop");
  BOX(`${id}Skid`, layerFit, x - R - 0.3, x + R + 0.3, 0, 0.5, z - R - 0.3, z + R + 0.3, "conc");
};
/** 機櫃外殼（含前門、底座）：回傳常數，細節各站自己加 */
const CAB = (id, x, w, d, h, layerBase, layerWall, layerDoor) => {
  const x0 = x - w / 2, x1 = x + w / 2, z0 = -d / 2, z1 = d / 2, B = 0.6;
  BOX(`${id}Plinth`, layerBase, x0 - 0.2, x1 + 0.2, 0, B, z0 - 0.2, z1 + 0.2, "band");
  P({ id: `${id}Foot`, layer: layerBase, shape: "cyl", size: [0.28, 0.16], rot: V, pos: [x, 0.08, 0], at: [[-w / 2 + 0.4, 0, -d / 2 + 0.4], [w / 2 - 0.4, 0, -d / 2 + 0.4], [-w / 2 + 0.4, 0, d / 2 - 0.4], [w / 2 - 0.4, 0, d / 2 - 0.4]], mat: "dark" });
  BOX(`${id}FloorPl`, layerBase, x0 + 0.1, x1 - 0.1, B, B + 0.1, z0 + 0.1, z1 - 0.1, "cabDark");
  BOX(`${id}Back`, layerWall, x0, x1, B, h, z0, z0 + 0.14, "cab"); BOX(`${id}Left`, layerWall, x0, x0 + 0.14, B, h, z0, z1, "cab"); BOX(`${id}Right`, layerWall, x1 - 0.14, x1, B, h, z0, z1, "cab"); BOX(`${id}Top`, layerWall, x0, x1, h - 0.14, h, z0, z1, "cab");
  P({ id: `${id}Seam`, layer: layerWall, shape: "box", size: [0.04, h - B, 0.04], pos: [x, (h + B) / 2, z0 + 0.15], at: [[-w / 4, 0, 0], [w / 4, 0, 0]], mat: "seam" });
  P({ id: `${id}Screw`, layer: layerWall, shape: "cyl", size: [0.05, 0.03], pos: [x, 0, z0 + 0.16], at: grid(x0 + 0.5 - x, x1 - 0.5 - x, 5, B + 1.0, h - 1.0, 4, 0).map(([a, b]) => [a, b, 0]), mat: "steel" });
  P({ id: `${id}Louver`, layer: layerWall, shape: "box", size: [2.2, 0.06, 0.4], pos: [x1 - 1.6, 0, 0], at: Array.from({ length: 5 }, (_, i) => [0, h - 0.5 - i * 0.28, z0 + 1.4]), mat: "seam" });
  // 前門
  BOX(`${id}Door`, layerDoor, x0, x1, B, h, z1, z1 + 0.16, "cab");
  P({ id: `${id}Win`, layer: layerDoor, shape: "box", size: [w - 2.4, h * 0.38, 0.08], pos: [x, h * 0.62, z1 + 0.18], mat: "window" });
  const wy0 = h * 0.62 - h * 0.19, wy1 = h * 0.62 + h * 0.19;
  BOX(`${id}WinT`, layerDoor, x0 + 1.2, x1 - 1.2, wy1 - 0.08, wy1 + 0.08, z1 + 0.16, z1 + 0.26, "steel2"); BOX(`${id}WinB`, layerDoor, x0 + 1.2, x1 - 1.2, wy0 - 0.08, wy0 + 0.08, z1 + 0.16, z1 + 0.26, "steel2");
  BOX(`${id}WinL`, layerDoor, x0 + 1.12, x0 + 1.28, wy0, wy1, z1 + 0.16, z1 + 0.26, "steel2"); BOX(`${id}WinR`, layerDoor, x1 - 1.28, x1 - 1.12, wy0, wy1, z1 + 0.16, z1 + 0.26, "steel2");
  P({ id: `${id}Handle`, layer: layerDoor, shape: "box", size: [0.22, 1.6, 0.22], pos: [x0 + 0.55, h * 0.45, z1 + 0.3], mat: "steel2" });
  P({ id: `${id}Hinge`, layer: layerDoor, shape: "box", size: [0.3, 0.9, 0.2], pos: [x1 - 0.1, 0, z1 + 0.1], at: [[0, h * 0.2, 0], [0, h * 0.5, 0], [0, h * 0.8, 0]], mat: "dark" });
  BOX(`${id}Warn`, layerDoor, x1 - 4.2, x1 - 0.8, B + 0.7, B + 1.6, z1 + 0.16, z1 + 0.2, "warnY"); BOX(`${id}WarnTx`, layerDoor, x1 - 3.8, x1 - 1.2, B + 0.95, B + 1.3, z1 + 0.2, z1 + 0.22, "dark");
  VC(`${id}Estop`, layerDoor, 0.28, h - 1.5, h - 1.2, "estop", { x: x0 + 1.2, z: z1 + 0.3 }); P({ id: `${id}EstopRim`, layer: layerDoor, shape: "tube", size: [0.42, 0.3, 0.12], rot: V, pos: [x0 + 1.2, h - 1.55, z1 + 0.2], mat: "warnY" });
  P({ id: `${id}Led`, layer: layerDoor, shape: "sphere", size: [0.09], pos: [x0 + 2.6, h - 1.35, z1 + 0.2], at: [[0, 0, 0], [0.55, 0, 0], [1.1, 0, 0]], mat: "lampG" });
  return { x0, x1, z0, z1, B };
};

// ═════ 地板 ═════
LAY("floor", [360, 2, 100, FY], true);
P({ id: "floor", layer: "floor", shape: "slab", size: [380, 0.5, 60], r: 0.2, pos: [100, R2(FY - 0.25), -4], mat: "floor" });
P({ id: "floorSeam", layer: "floor", shape: "slab", size: [380, 0.04, 0.1], pos: [100, R2(FY + 0.01), 0], at: Array.from({ length: 9 }, (_, i) => [0, 0, -24 + i * 6]), mat: "seam" });
P({ id: "floorSeamX", layer: "floor", shape: "slab", size: [0.1, 0.04, 60], pos: [0, R2(FY + 0.01), -4], at: Array.from({ length: 24 }, (_, i) => [-80 + i * 16, 0, 0]), mat: "seam" });

// ═════ S1（x＝-90）：一桶藥水＋被放大的一粒灰 ═════
const X1 = -90;
LAY("drum", [7, 9.4, X1, 4.6]); LAY("dustS1", [3, 3, X1 + 5.6, 8.2]); LAY("magS1", [4, 4, X1 + 5.6, 8.2]);
BOX("drumPallet", "drum", X1 - 4.2, X1 + 4.2, 0, 0.9, -4.2, 4.2, "wood");
P({ id: "palletSlat", layer: "drum", shape: "box", size: [8.4, 0.14, 0.9], pos: [X1, 0.97, 0], at: [[0, 0, -3.3], [0, 0, -1.65], [0, 0, 0], [0, 0, 1.65], [0, 0, 3.3]], mat: "woodDark" });
P({ id: "palletFoot", layer: "drum", shape: "box", size: [1.1, 0.7, 8.4], pos: [X1, 0.4, 0], at: [[-3.4, 0, 0], [0, 0, 0], [3.4, 0, 0]], mat: "woodDark" });
VC("drumBody", "drum", 2.9, 1.1, 9.9, "drum", { x: X1, z: 0 });
VT("drumRib", "drum", 3.0, 2.82, 0.2, 0.5, "drumDark", { x: X1, z: 0, at: [[0, 2.2, 0], [0, 4.4, 0], [0, 6.6, 0], [0, 8.8, 0]] });
VT("drumChimeT", "drum", 3.02, 2.7, 9.9, 10.1, "drumDark", { x: X1, z: 0 }); VT("drumChimeB", "drum", 3.02, 2.7, 0.95, 1.15, "drumDark", { x: X1, z: 0 });
VC("drumLid", "drum", 2.8, 10.0, 10.12, "drumDark", { x: X1, z: 0 });
VT("bungL", "drum", 0.6, 0.42, 10.12, 10.42, "steel2", { x: X1 - 1.4, z: -0.9 }); VC("bungLCap", "drum", 0.46, 10.18, 10.5, "dark", { x: X1 - 1.4, z: -0.9 });
VT("bungS", "drum", 0.45, 0.32, 10.12, 10.36, "steel2", { x: X1 + 1.5, z: 0.6 }); VC("bungSCap", "drum", 0.34, 10.18, 10.44, "dark", { x: X1 + 1.5, z: 0.6 });
P({ id: "drumLabel", layer: "drum", shape: "box", size: [2.8, 3.0, 0.06], pos: [X1, 5.4, 2.93], mat: "panel" }); BOX("drumLabelBar", "drum", X1 - 1.3, X1 + 1.3, 6.4, 6.9, 2.96, 2.99, "dark"); BOX("drumLabelTx", "drum", X1 - 1.3, X1 + 0.6, 5.7, 5.95, 2.96, 2.99, "dark");
P({ id: "drumHaz", layer: "drum", shape: "box", size: [0.9, 0.9, 0.05], rot: [0, 0, 45], pos: [X1 - 0.6, 4.3, 3.0], mat: "warnY" }); P({ id: "drumHaz2", layer: "drum", shape: "box", size: [0.9, 0.9, 0.05], rot: [0, 0, 45], pos: [X1 + 0.7, 4.3, 3.0], mat: "oxid" });
// 灰塵：桶蓋大口附近的一小團深灰碎屑，旁邊放大鏡圈（放大後是明顯的灰塵團）
const DUST = [[0, 0, 0, 0.5], [0.45, 0.2, 0.15, 0.36], [-0.4, 0.3, -0.2, 0.4], [0.1, -0.35, 0.3, 0.3], [-0.2, 0.55, 0.3, 0.28], [0.55, -0.15, -0.3, 0.26], [-0.55, -0.2, 0.2, 0.3]];
const DXc = X1 + 5.6, DYc = 8.2;   // 灰塵與放大鏡放在桶子右側、標題下方（2026/11/27 r1：念到一粒灰時不被大字蓋住）
DUST.forEach(([dx, dy, dz, r], i) => SPH(`dust${i}`, "dustS1", r, DXc + dx, DYc + dy, -0.9 + dz, "dust"));
P({ id: "dustRing", layer: "dustS1", shape: "tube", size: [1.45, 1.3, 0.1], rot: [0, 0, 0], pos: [DXc, DYc, -0.9], mat: "dustGlow" });
P({ id: "magRim", layer: "magS1", shape: "tube", size: [1.9, 1.7, 0.22], pos: [DXc, DYc, -0.9 + 0.5], mat: "steel2" });
P({ id: "magGlass", layer: "magS1", shape: "cyl", size: [1.7, 0.06], pos: [DXc, DYc, -0.9 + 0.5], mat: "window" });
BOX("magHandle", "magS1", DXc + 1.2, DXc + 3.0, DYc - 2.3, DYc - 1.6, -0.9 + 0.35, -0.9 + 0.65, "dark"); P({ id: "magArm", layer: "magS1", shape: "box", size: [0.3, 3.2, 0.3], rot: [0, 0, -40], pos: [DXc + 1.95, DYc - 1.6, -0.4], mat: "dark" });
P({ id: "magRay", layer: "magS1", shape: "cyl", size: [0.05, 2.0], pos: [DXc, DYc - 1.0, -0.4], rot: [20, 0, 0], at: [[0.9, 0, 0], [-0.9, 0, 0]], mat: "edge" });
actions.dustGlow = { type: "pulse", _說明: "那一粒灰的警示光圈閃（示意）", parts: ["dustRing"], color: "warnC", glow: 1, freq: 1.5, halo: 1.0 };
actions.dustDrift = { type: "flow", _說明: "灰塵從空中緩緩落向桶口（受重力加速、微小飄動）", layer: "dustS1", path: [[DXc, DYc + 3.2, -0.9], [DXc, DYc + 0.4, -0.9]], n: 2, size: 0.18, shape: "dot", rate: 0.22, color: "dustC", track: false, accel: true, jitter: 0.3, free: true };

// ═════ S2（x＝-60）：三種藥水＋晶圓（洗、蝕刻、磨平） ═════
const X2 = -60;
LAY("jugs", [14, 5, X2, 2.6]); LAY("wfS2", [8, 3, X2 - 0.5, 1.4]); LAY("wfFilm", [7, 0.2, X2 - 0.5, 1.8]);
BOX("benchTop", "jugs", X2 - 11, X2 + 7, 0, 0.8, -6.2, -0.6, "cabDark"); BOX("benchBack", "jugs", X2 - 11, X2 + 7, 0.8, 1.2, -6.2, -5.9, "steel2");
JUG("jgA", "jugs", X2 - 8, -3.2, "clean", "blueP"); JUG("jgB", "jugs", X2 - 4.4, -3.2, "etch", "warnY"); JUG("jgC", "jugs", X2 - 0.8, -3.2, "slurry", "panel2");
P({ id: "jugTray", layer: "jugs", shape: "box", size: [3.4, 0.25, 3.0], pos: [0, 0.93, -3.2], at: [[X2 - 8, 0, 0], [X2 - 4.4, 0, 0], [X2 - 0.8, 0, 0]], mat: "dark" });
// 晶圓與吸盤：中心 (X2+4, 0)
const WX = X2 + 4.5;
VC("chuckBase", "wfS2", 3.6, 0.0, 0.9, "chuckM", { x: WX, z: 0.6 }); VC("chuckPost", "wfS2", 1.1, 0.9, 1.6, "steel2", { x: WX, z: 0.6 });
VT("chuckRim", "wfS2", 3.7, 3.45, 0.9, 1.05, "dark", { x: WX, z: 0.6 }); VC("chuckTop", "wfS2", 3.5, 1.6, 1.75, "chuckM", { x: WX, z: 0.6 });
VC("wafer2", "wfS2", 3.1, 1.75, 1.83, "steel2", { x: WX, z: 0.6 });
P({ id: "waferGrid2", layer: "wfS2", shape: "box", size: [4.8, 0.012, 0.03], pos: [WX, 1.84, 0.6], at: [[0, 0, -1.8], [0, 0, -0.9], [0, 0, 0], [0, 0, 0.9], [0, 0, 1.8]], mat: "tgtFace" });
P({ id: "waferGrid2b", layer: "wfS2", shape: "box", size: [0.03, 0.012, 4.8], pos: [WX, 1.84, 0.6], at: [[-1.8, 0, 0], [-0.9, 0, 0], [0, 0, 0], [0.9, 0, 0], [1.8, 0, 0]], mat: "tgtFace" });
VC("filmClean", "wfFilm", 3.05, 1.83, 1.97, "clean", { x: WX, z: 0.6 });
// 噴嘴臂：從後方伸到晶圓中心上方；三條 PFA 管接三種桶
BOX("nzPost", "wfS2", WX + 4.6, WX + 5.0, 1.2, 6.8, -1.2, -0.8, "steel2"); BOX("nzArm", "wfS2", WX - 0.2, WX + 5.0, 6.4, 6.8, -1.2, -0.8, "steel2");
VC("nzTip", "wfS2", 0.22, 5.3, 6.4, "steel", { x: WX, z: -1.0 }); VC("nzTip2", "wfS2", 0.12, 5.0, 5.3, "steel2", { x: WX, z: -1.0 });
PIPE("nzTube", "wfS2", [[X2 - 8, 5.1, -3.2], [X2 - 8, 7.6, -3.2], [WX, 7.6, -1.0], [WX, 6.6, -1.0]], 0.13, "pfa");
PIPE("nzTubeB", "wfS2", [[X2 - 4.4, 5.1, -3.2], [X2 - 4.4, 7.2, -3.2], [WX, 7.2, -1.0]], 0.13, "pfa"); PIPE("nzTubeC", "wfS2", [[X2 - 0.8, 5.1, -3.2], [X2 - 0.8, 6.8, -3.2], [WX, 6.8, -1.0]], 0.13, "pfa");
actions.pourA = { type: "flow", _說明: "清洗液：從噴嘴落到晶圓中心（重力加速、落點擴散）", layer: "wfS2", path: [[WX, 5.2, -1.0], [WX, 2.0, 0.2]], n: 5, size: 0.1, shape: "liquid", band: 0.08, bandO: 0.4, rate: 1.4, color: "cleanC", track: false, accel: true, free: true };
actions.pourB = { type: "flow", _說明: "蝕刻液：同上（淡黃）", layer: "wfS2", path: [[WX, 5.2, -1.0], [WX, 2.0, 0.2]], n: 5, size: 0.1, shape: "liquid", band: 0.08, bandO: 0.4, rate: 1.4, color: "etchC", track: false, accel: true, free: true };
actions.pourC = { type: "flow", _說明: "研磨液：較稠，落得慢（乳白）", layer: "wfS2", path: [[WX, 5.2, -1.0], [WX, 2.0, 0.2]], n: 4, size: 0.12, shape: "liquid", band: 0.1, bandO: 0.5, rate: 0.7, color: "slurryC", track: false, accel: true, free: true };
actions.spreadA = { type: "wave", _說明: "落到晶圓中心後向外擴散的液膜邊緣", from: { layer: "wfFilm", p: [WX, 2.0, 0.6] }, dir: [0, 1, 0], reach: 0.1, count: 2, r0: 0.4, spread: 3.0, rate: 0.9, color: "cleanC", width: 0.08 };
actions.waferSpin = { type: "rotate", _說明: "晶圓與吸盤慢轉（起轉有加速）", parts: ["waferGrid2", "waferGrid2b"], axis: [0, 1, 0], pivot: [WX, 1.84, 0.6], pivots: Object.fromEntries(["waferGrid2", "waferGrid2b"].map((k) => [k, [WX, 1.84, 0.6]])), rps: 0.25, rampSpin: true };
actions.capA = { type: "pulse", parts: ["jgACap", "jgALabel"], color: "blueP", glow: 1, steady: true, halo: 0 };
actions.capB = { type: "pulse", parts: ["jgBCap", "jgBLabel"], color: "etchC", glow: 1, steady: true, halo: 0 };
actions.capC = { type: "pulse", parts: ["jgCCap", "jgCLabel"], color: "ceriaC", glow: 1, steady: true, halo: 0 };

// ═════ S3（x＝-30）：游泳池一小匙；管內離子點密度 ═════
const X3 = -34, XQ = -14;
LAY("pool", [13, 3, X3, 1.2]); LAY("spoon", [3, 4, X3, 5]); LAY("pipeI", [18, 6, XQ, 3.2]);
BOX("poolRimF", "pool", X3 - 6.4, X3 + 6.4, 0, 1.4, 3.0, 3.8, "tile"); BOX("poolRimB", "pool", X3 - 6.4, X3 + 6.4, 0, 1.4, -3.8, -3.0, "tile"); BOX("poolRimL", "pool", X3 - 6.4, X3 - 5.6, 0, 1.4, -3.0, 3.0, "tile"); BOX("poolRimR", "pool", X3 + 5.6, X3 + 6.4, 0, 1.4, -3.0, 3.0, "tile");
BOX("poolWater", "pool", X3 - 5.6, X3 + 5.6, 0.1, 1.1, -3.0, 3.0, "pool"); BOX("poolFloorLine", "pool", X3 - 5.6, X3 + 5.6, 0.12, 0.14, -0.05, 0.05, "tileLine");
P({ id: "poolLane", layer: "pool", shape: "box", size: [11.2, 0.05, 0.05], pos: [X3, 1.12, 0], at: [[0, 0, -1.5], [0, 0, 1.5]], mat: "oxid" });
P({ id: "poolFloat", layer: "pool", shape: "sphere", size: [0.14], pos: [X3 - 5.4, 1.15, 0], at: Array.from({ length: 12 }, (_, i) => [i * 0.98, 0, i % 2 ? 1.5 : -1.5]), mat: "warnY" });
P({ id: "poolLadder", layer: "pool", shape: "tube", size: [0.2, 0.15, 2.0], rot: HX, pos: [X3 + 5.9, 1.9, 0], at: [[0, 0, -0.7], [0, 0, 0.7]], mat: "steel2" }); P({ id: "poolLadRung", layer: "pool", shape: "cyl", size: [0.05, 1.4], pos: [X3 + 5.9, 0, 0], at: [[0, 1.4, 0], [0, 1.9, 0], [0, 2.4, 0]], mat: "steel2" });
// 一小匙：匙＋一滴紅
P({ id: "spoonHead", layer: "spoon", shape: "sphere", size: [0.9], scale: [1, 0.35, 0.7], pos: [X3 + 1.6, 3.9, 0], mat: "steel2" });
BOX("spoonHandle", "spoon", X3 + 2.3, X3 + 6.3, 3.8, 4.1, -0.15, 0.15, "steel2"); P({ id: "spoonDrop", layer: "spoon", shape: "sphere", size: [0.3], pos: [X3 + 1.6, 4.25, 0], mat: "oxid" });
actions.spoonDrip = { type: "flow", _說明: "一滴紅色雜質從匙尖落進池水（極小一滴）", layer: "spoon", path: [[X3 + 1.6, 3.6, 0], [X3 + 1.6, 1.3, 0]], n: 1, size: 0.14, shape: "liquid", rate: 0.35, color: "oxidC", track: false, accel: true, free: true };
actions.poolRipple = { type: "wave", from: { layer: "pool", p: [X3 + 1.6, 1.12, 0] }, dir: [0, 1, 0], reach: 0.1, count: 2, r0: 0.2, spread: 3.2, rate: 0.5, color: "tileC", width: 0.06 };
// 管：ghost PFA 管體＋液體；點＝金屬離子（紅）極少、藥液分子（淡藍）極多
const IR = 2.5;
HXC("ghostPipe", "pipeI", IR, XQ - 8.5, XQ + 8.5, 3.4, 0, "pfaT"); HXC("ghostLiq", "pipeI", IR - 0.12, XQ - 8.3, XQ + 8.3, 3.4, 0, "clean");
P({ id: "pipeFlange", layer: "pipeI", shape: "tube", size: [IR + 0.7, IR - 0.05, 0.4], rot: HX, pos: [0, 3.4, 0], at: [[XQ - 8.5, 0, 0], [XQ + 8.5, 0, 0]], mat: "steel2" });
P({ id: "pipeFlBolt", layer: "pipeI", shape: "cyl", size: [0.12, 0.3], rot: HX, pos: [0, 3.4, 0], at: [XQ - 8.5, XQ + 8.5].flatMap((xx) => Array.from({ length: 8 }, (_, i) => { const [y, z] = pol(i * 45, IR + 0.4); return [xx, y, z]; })), mat: "steel" });
P({ id: "pipeBand", layer: "pipeI", shape: "tube", size: [IR + 0.3, IR - 0.05, 0.3], rot: HX, pos: [0, 3.4, 0], at: [[XQ - 4, 0, 0], [XQ + 4, 0, 0]], mat: "dark" });
BOX("pipeStand", "pipeI", XQ - 4.4, XQ - 3.6, 0, 3.4 - IR - 0.2, -0.8, 0.8, "steel"); BOX("pipeStand2", "pipeI", XQ + 3.6, XQ + 4.4, 0, 3.4 - IR - 0.2, -0.8, 0.8, "steel");
actions.ionsBlue = { type: "flow", _說明: "藥液裡的分子（淡藍，密）隨液體向右流（層流：中間快、靠壁慢，示意）", layer: "pipeI", path: [[XQ - 8, 3.4, 0], [XQ + 8, 3.4, 0]], n: 60, lanes: 3, laneDir: [0, 0, 1], laneGap: 0.7, size: 0.1, shape: "dot", rate: 0.12, color: "cleanC", track: false, jitter: 1.4, free: true, trail: 0 };
actions.ionsRed = { type: "flow", _說明: "混進去的金屬雜質（紅，只有極少幾顆）", layer: "pipeI", path: [[XQ - 8, 3.7, 0.4], [XQ + 8, 3.7, 0.4]], n: 3, size: 0.2, shape: "dot", rate: 0.12, color: "oxidC", track: false, jitter: 0.9, free: true, rim: "dark" };
Object.assign(anchors, { dust: A("dustS1", [DXc, DYc + 0.6, -0.9], 150, -90), drumA: A("drum", [X1 + 2.9, 6.2, 0.5], 150, 90), jugA: A("jugs", [X2 - 8, 3.8, -2.0], -150, -90), jugB: A("jugs", [X2 - 4.4, 3.8, -2.0], 150, -110), jugC: A("jugs", [X2 - 0.8, 3.8, -2.0], 150, -90), pool: A("pool", [X3 - 3.5, 1.2, 3.0], -150, 90), spoon: A("spoon", [X3 + 1.6, 4.3, 0], 150, -90), ionRed: A("pipeI", [XQ + 2, 4.1, 0.6], 150, -100) });

// ═════ S4：送液主線（儲槽 x0 → 管理櫃 x26 → 管路架 → 閥箱 x58 → 供液櫃 x76 → 使用點過濾器 x94 → 旋轉清洗腔 x110） ═════
const XT = 0, XC = 26, XV = 58, XD = 76, XP = 94, XS = 110, XW = 128, ZP = -6.5, YR = 11.0, YB = 9.6;
LAY("tank", [13, 15, XT, 7.5]); LAY("tankFit", [14, 16, XT, 8]); LAY("berm", [22, 1.6, XT, 0.8]); LAY("tport", [6, 5, -11, 2.5]);
TANK("tk", "tank", "tankFit", XT, 0, 6, 14);
// 防溢堤（槽下淺池）：四面矮牆＋底
BOX("bermFloor", "berm", XT - 11, XT + 11, 0, 0.12, -8, 8, "concDark");
BOX("bermF", "berm", XT - 11, XT + 11, 0, 1.4, 7.5, 8.0, "conc"); BOX("bermB", "berm", XT - 11, XT + 11, 0, 1.4, -8, -7.5, "conc"); BOX("bermL", "berm", XT - 11, XT - 10.5, 0, 1.4, -8, 8, "conc"); BOX("bermR", "berm", XT + 10.5, XT + 11, 0, 1.4, -8, 8, "conc");
P({ id: "bermSump", layer: "berm", shape: "box", size: [1.6, 0.06, 1.6], pos: [XT + 8, 0.14, 5.5], mat: "dark" });
// 槽車卸料口：快速接頭箱＋接地夾＋接頭防滴盤＋軟管
BOX("tpBox", "tport", -13.4, -9.4, 0.5, 4.6, -1.2, 1.2, "cab"); BOX("tpBoxDoor", "tport", -13.4, -9.4, 0.5, 4.6, 1.2, 1.3, "cabDark");
P({ id: "tpCoupling", layer: "tport", shape: "cyl", size: [0.5, 1.0], rot: HX, pos: [-9.0, 3.1, 0.6], mat: "steel2" });
P({ id: "tpCam", layer: "tport", shape: "tube", size: [0.75, 0.48, 0.3], rot: HX, pos: [-8.3, 3.1, 0.6], mat: "steel" });
P({ id: "tpCamLever", layer: "tport", shape: "box", size: [0.12, 0.9, 0.12], pos: [-8.3, 3.1, 0.6], at: [[0, 0.7, 0], [0, -0.7, 0]], mat: "estop" });
BOX("tpTray", "tport", -9.6, -6.8, 0.5, 0.9, -0.5, 2.6, "dark"); BOX("tpGround", "tport", -13.4, -13.0, 1.2, 1.8, -0.6, 0.0, "warnY"); P({ id: "tpGroundCable", layer: "tport", shape: "cyl", size: [0.05, 2.2], rot: [0, 0, 20], pos: [-12.6, 1.0, 0.2], mat: "rubber" });
PIPE("tpHose", "tport", [[-8.3, 3.1, 0.6], [-6.8, 2.4, 1.6], [-5.4, 1.0, 2.4], [-4.0, 0.7, 3.4], [-2.6, 0.7, 3.8]], 0.3, "rubber");
// 管路：槽出口 → 後方管路架 → 管理櫃入口
const W0 = XT + 6 + 1.3;
PIPE("pSup", "loopIn", [[W0, 1.6, 0], [W0 + 3, 1.6, 0], [W0 + 3, 1.6, ZP], [XC - 5.5, 1.6, ZP], [XC - 5.5, 3.6, ZP], [XC - 5.5, 3.6, -4.2]], 0.44, "pfaDark");   // r1：加粗、深一點的塑膠色，讓「塑膠管線」標籤指得到看得見的管子
LAY("loopIn", [26, 4, 14, 2]);
CLAMPS("pSupC", "loopIn", W0 + 5, XC - 7, 1.6, ZP, 0.28, 4.5);
P({ id: "pSupFl", layer: "loopIn", shape: "tube", size: [0.75, 0.4, 0.25], rot: HX, pos: [W0 + 1.2, 1.6, 0], at: [[0, 0, 0], [W0 + 3 - (W0 + 1.2) + 0, 0, 0]], mat: "steel2" });
P({ id: "pSupCollar", layer: "loopIn", shape: "tube", size: [0.7, 0.4, 0.3], rot: HX, pos: [0, 1.6, ZP], at: [[W0 + 5.5, 0, 0], [W0 + 8.5, 0, 0], [W0 + 11.5, 0, 0]], mat: "steel2" });
// ── 化學品管理櫃（CDS） ──
LAY("cdsBase", [15.2, 0.8, XC, 0.3]); LAY("cdsWall", [14, 20, XC, 10]); LAY("cdsDoor", [14, 19.4, XC, 10]); LAY("cdsPump", [6, 6, XC - 4, 4]); LAY("cdsValve", [6, 6, XC, 10]); LAY("cdsFilter", [3.4, 10, XC + 4.6, 7.5]); LAY("cdsCore", [2.4, 8, XC + 4.6, 7]); LAY("cdsMeas", [10, 4, XC, 15.5]); LAY("cdsPipe", [14, 18, XC, 9]);
const CDS = CAB("cds", XC, 16, 9, 20, "cdsBase", "cdsWall", "cdsDoor");
LAY("cdsFrame", [16.6, 20.4, XC, 10]);
{ const fx0 = CDS.x0 - 0.1, fx1 = CDS.x1 + 0.1, fz0 = CDS.z0 - 0.1, fz1 = CDS.z1 + 0.3, fy0 = 0.6, fy1 = 20.1, T = 0.22;
  for (const [i, x, z] of [[0, fx0, fz0], [1, fx1, fz0], [2, fx0, fz1], [3, fx1, fz1]]) BOX(`cdsFrV${i}`, "cdsFrame", x - T / 2, x + T / 2, fy0, fy1, z - T / 2, z + T / 2, "steel2");
  for (const [i, y] of [[0, fy0], [1, fy1]]) { BOX(`cdsFrX${i}a`, "cdsFrame", fx0, fx1, y - T / 2, y + T / 2, fz1 - T / 2, fz1 + T / 2, "steel2"); BOX(`cdsFrX${i}b`, "cdsFrame", fx0, fx1, y - T / 2, y + T / 2, fz0 - T / 2, fz0 + T / 2, "steel2"); BOX(`cdsFrZ${i}a`, "cdsFrame", fx0 - T / 2, fx0 + T / 2, y - T / 2, y + T / 2, fz0, fz1, "steel2"); BOX(`cdsFrZ${i}b`, "cdsFrame", fx1 - T / 2, fx1 + T / 2, y - T / 2, y + T / 2, fz0, fz1, "steel2"); } }
BOX("cdsNameplate", "cdsWall", XC - 3, XC + 3, 18.3, 19.1, CDS.z1 - 0.04, CDS.z1 + 0.01, "steel2");
// r2：外殼細節——門下緣百葉（通風）、左側三個鉸鍊、右上警示貼
for (let i = 0; i < 7; i++) BOX(`cdsLv${i}`, "cdsDoor", CDS.x1 - 4.4, CDS.x1 - 0.8, 3.2 + i * 0.42, 3.2 + i * 0.42 + 0.16, CDS.z1 + 0.02, CDS.z1 + 0.2, "cabDark");
for (const [i, y] of [[0, 3.4], [1, 10.0], [2, 16.6]]) { BOX(`cdsHg${i}`, "cdsDoor", CDS.x0 - 0.15, CDS.x0 + 0.35, y, y + 1.5, CDS.z1 - 0.1, CDS.z1 + 0.28, "steel2"); }
BOX("cdsCaution", "cdsDoor", CDS.x1 - 3.4, CDS.x1 - 0.8, 14.6, 16.6, CDS.z1 + 0.02, CDS.z1 + 0.08, "warnY"); BOX("cdsCautionTx", "cdsDoor", CDS.x1 - 3.0, CDS.x1 - 1.2, 15.0, 16.2, CDS.z1 + 0.08, CDS.z1 + 0.11, "dark");
P({ id: "cdsTower", layer: "cdsWall", shape: "cyl", size: [0.28, 0.5], rot: V, pos: [XC + 5.5, 20.25, -2], at: [[0, 0, 0]], mat: "lampG" }); P({ id: "cdsTowerB", layer: "cdsWall", shape: "cyl", size: [0.28, 0.5], rot: V, pos: [XC + 5.5, 20.8, -2], mat: "lampY" });
BOX("cdsLeakTray", "cdsBase", XC - 6.8, XC + 6.8, 0.7, 1.0, -4.2, 4.2, "cabDark"); BOX("cdsLeakSens", "cdsBase", XC - 0.5, XC + 0.5, 1.0, 1.15, 3.0, 3.6, "lampR");
// 泵：雙隔膜泵（兩個泵頭＋中間空氣室＋進氣閥＋脈衝緩衝球）
const PX = XC - 4.3;
BOX("pmpSkid", "cdsPump", PX - 2.4, PX + 2.4, 1.0, 1.5, -1.4, 1.4, "dark");
VC("pmpHeadL", "cdsPump", 1.35, 1.5, 4.4, "steel2", { x: PX - 1.4, z: 0 }); VC("pmpHeadR", "cdsPump", 1.35, 1.5, 4.4, "steel2", { x: PX + 1.4, z: 0 });
VT("pmpFlL", "cdsPump", 1.5, 1.2, 3.1, 3.4, "dark", { x: PX - 1.4, z: 0 }); VT("pmpFlR", "cdsPump", 1.5, 1.2, 3.1, 3.4, "dark", { x: PX + 1.4, z: 0 });
BOX("pmpMid", "cdsPump", PX - 0.55, PX + 0.55, 1.6, 4.0, -0.9, 0.9, "steel"); VC("pmpAir", "cdsPump", 0.24, 4.0, 4.8, "dark", { x: PX, z: 0 });
P({ id: "pmpBolt", layer: "cdsPump", shape: "cyl", size: [0.08, 0.18], rot: V, pos: [PX, 4.5, 0], at: [[-1.4, 0, 0.9], [-1.4, 0, -0.9], [1.4, 0, 0.9], [1.4, 0, -0.9], [-0.7, 0, 1.1], [0.7, 0, 1.1]], mat: "steel" });
SPH("pmpDamper", "cdsPump", 0.8, PX + 2.9, 3.4, 0.2, "pfaT"); VC("pmpDamperNeck", "cdsPump", 0.28, 2.5, 3.0, "steel2", { x: PX + 2.9, z: 0.2 });
VC("pmpTube", "cdsPump", 0.1, 4.8, 7.0, "rubber", { x: PX, z: 0 }); BOX("pmpTag", "cdsPump", PX - 0.4, PX + 0.4, 2.4, 3.0, 0.9, 0.95, "warnY");
// 閥島：歧管塊＋五個氣動閥（致動器＋電磁閥小盒＋氣管）＋壓力轉換器接口
const VX = XC - 0.3;
BOX("vlManifold", "cdsValve", VX - 2.8, VX + 2.8, 8.0, 9.0, -1.0, 1.0, "steel2"); P({ id: "vlPort", layer: "cdsValve", shape: "cyl", size: [0.22, 0.5], pos: [VX, 8.5, 0], at: [[-2.2, 0, 1.2], [-1.1, 0, 1.2], [0, 0, 1.2], [1.1, 0, 1.2], [2.2, 0, 1.2]], mat: "steel" });
P({ id: "vlBody", layer: "cdsValve", shape: "cyl", size: [0.5, 1.0], rot: V, pos: [VX, 9.5, 0], at: [[-2.2, 0, 0], [-1.1, 0, 0], [0, 0, 0], [1.1, 0, 0], [2.2, 0, 0]], mat: "pfa" });
P({ id: "vlAct", layer: "cdsValve", shape: "cyl", size: [0.44, 1.5], rot: V, pos: [VX, 10.8, 0], at: [[-2.2, 0, 0], [-1.1, 0, 0], [0, 0, 0], [1.1, 0, 0], [2.2, 0, 0]], mat: "dark" });
P({ id: "vlCap", layer: "cdsValve", shape: "cyl", size: [0.3, 0.2], rot: V, pos: [VX, 11.65, 0], at: [[-2.2, 0, 0], [-1.1, 0, 0], [0, 0, 0], [1.1, 0, 0], [2.2, 0, 0]], mat: "lampG" });
BOX("vlSolBox", "cdsValve", VX - 2.9, VX + 2.9, 10.2, 11.2, -1.5, -0.9, "cabDark"); P({ id: "vlSolLed", layer: "cdsValve", shape: "sphere", size: [0.06], pos: [VX, 10.9, -0.85], at: [[-2.2, 0, 0], [-1.1, 0, 0], [0, 0, 0], [1.1, 0, 0], [2.2, 0, 0]], mat: "lampG" });
PIPE("vlAir", "cdsValve", [[VX - 2.2, 11.0, -0.9], [VX - 2.2, 11.8, -1.2]], 0.05, "rubber");
// 過濾器殼（右後方，z＝-1.4）：圓筒殼＋上下蓋＋進出口接頭＋排氣閥＋壓差錶；褶疊濾芯另成一層
const FX = XC + 4.0, FZ = -1.4;
VT("cfShell", "cdsFilter", 1.4, 1.28, 2.0, 11.0, "pfaT", { x: FX, z: FZ }); VC("cfCapT", "cdsFilter", 1.55, 11.0, 11.5, "steel2", { x: FX, z: FZ }); VC("cfCapB", "cdsFilter", 1.55, 1.5, 2.0, "steel2", { x: FX, z: FZ });
P({ id: "cfBolt", layer: "cdsFilter", shape: "cyl", size: [0.09, 0.16], rot: V, pos: [FX, 11.55, FZ], at: RING(8, 1.35).map(([a, , b]) => [a, 0, b]), mat: "steel" });
VC("cfVent", "cdsFilter", 0.2, 11.5, 12.2, "steel2", { x: FX, z: FZ }); P({ id: "cfVentH", layer: "cdsFilter", shape: "sphere", size: [0.26], pos: [FX, 12.35, FZ], mat: "estop" });
VC("cfIn", "cdsFilter", 0.3, 1.2, 1.5, "steel2", { x: FX, z: FZ }); HXC("cfOut", "cdsFilter", 0.26, FX + 1.2, FX + 2.4, 10.0, FZ, "pfa"); HXC("cfOutFl", "cdsFilter", 0.4, FX + 2.4, FX + 2.7, 10.0, FZ, "steel2");
VC("cfGauge", "cdsFilter", 0.6, 11.7, 12.0, "steel2", { x: FX + 2.0, z: FZ + 0.8 }); VC("cfGaugeFace", "cdsFilter", 0.5, 12.0, 12.05, "gaugeF", { x: FX + 2.0, z: FZ + 0.8 }); P({ id: "cfNeedle", layer: "cdsFilter", shape: "box", size: [0.06, 0.4, 0.02], rot: [90, 0, 35], pos: [FX + 2.0, 12.08, FZ + 0.8], mat: "estop" });
BOX("cfBracket", "cdsFilter", FX - 0.15, FX + 0.15, 1.0, 11.5, FZ - 1.8, FZ - 1.4, "dark");
VC("cfCoreTube", "cdsCore", 0.5, 2.3, 10.7, "sinter", { x: FX, z: FZ });
P({ id: "cfPleat", layer: "cdsCore", shape: "box", size: [0.07, 8.0, 0.55], pos: [FX, 6.5, FZ], at: Array.from({ length: 20 }, (_, i) => { const [x, z] = pol(i * 18, 0.95); return [x, 0, z]; }), rot: [0, 0, 0], mat: "pleat" });
P({ id: "cfPleatB", layer: "cdsCore", shape: "box", size: [0.5, 8.0, 0.06], pos: [FX, 6.5, FZ], at: Array.from({ length: 20 }, (_, i) => { const [x, z] = pol(i * 18 + 9, 1.0); return [x, 0, z]; }), mat: "pleat" });
VT("cfCoreCapT", "cdsCore", 1.15, 0.45, 10.7, 10.9, "steel2", { x: FX, z: FZ }); VT("cfCoreCapB", "cdsCore", 1.15, 0.45, 2.1, 2.3, "steel2", { x: FX, z: FZ });
// 測量：流量計（本體、顯示、傳感管）＋壓力轉換器（六角、圓筒、接頭、纜線）
const MX = XC - 3.2;
BOX("mtFlow", "cdsMeas", MX - 1.6, MX + 1.6, 14.0, 15.6, -1.2, 1.2, "steel2"); BOX("mtFlowScr", "cdsMeas", MX - 1.0, MX + 1.0, 14.4, 15.2, 1.2, 1.28, "screen"); P({ id: "mtFlowTube", layer: "cdsMeas", shape: "cyl", size: [0.34, 1.5], rot: HX, pos: [MX, 14.8, -0.2], at: [[-2.4, 0, 0]], mat: "pfa" });
HXC("mtFlowIn", "cdsMeas", 0.3, MX - 3.0, MX - 1.6, 14.8, 0, "pfa"); HXC("mtFlowOut", "cdsMeas", 0.3, MX + 1.6, MX + 2.8, 14.8, 0, "pfa");
const NX = XC + 2.6;
VC("mtPtBody", "cdsMeas", 0.5, 14.0, 15.6, "steel2", { x: NX, z: 0 }); P({ id: "mtPtHex", layer: "cdsMeas", shape: "tube", size: [0.7, 0.35, 0.4], rot: V, pos: [NX, 14.4, 0], mat: "steel" }); VC("mtPtConn", "cdsMeas", 0.32, 15.6, 16.2, "conn", { x: NX, z: 0 }); PIPE("mtPtCable", "cdsMeas", [[NX, 16.2, 0], [NX + 0.8, 17.0, 0.4], [NX + 2.0, 17.0, 1.0]], 0.07, "rubber");
BOX("mtPtTag", "cdsMeas", NX - 0.45, NX + 0.45, 14.9, 15.2, 0.5, 0.55, "warnY");
// 管理櫃內部連接細管（不分解）
PIPE("cdsIn", "cdsPipe", [[XC - 5.5, 3.6, -4.2], [XC - 5.5, 3.6, -1.0], [PX - 1.4, 3.6, -1.0], [PX - 1.4, 4.4, -0.2]], 0.2, "pfa");
PIPE("cdsA", "cdsPipe", [[PX + 1.4, 4.4, 0], [PX + 1.4, 7.0, 0], [VX - 2.2, 7.0, 0], [VX - 2.2, 8.5, 0]], 0.18, "pfa");
PIPE("cdsB", "cdsPipe", [[VX + 2.2, 8.5, 0], [VX + 2.2, 6.0, 0], [FX, 6.0, 0], [FX, 1.5, FZ]], 0.18, "pfa");
PIPE("cdsC", "cdsPipe", [[FX + 2.7, 10.0, FZ], [XC + 7.4, 10.0, FZ], [XC + 7.4, 10.0, -4.2]], 0.2, "pfa");
// ── 管路架：迴路（供應＋回流），雙層管＋管夾＋支撐吊架＋彎頭 ──
LAY("rack", [76, 12, 62, 6]); LAY("loopOut", [72, 3, 62, YR]); LAY("loopRet", [72, 3, 62, YB]);
const XE = XS + 6;
DPIPE("lpS", "loopOut", [[XC + 7.4, 10.0, -4.2], [XC + 7.4, 10.0, ZP], [XC + 7.4, YR, ZP], [XE, YR, ZP]], 0.28);
DPIPE("lpR", "loopRet", [[XE, YB, ZP - 1.4], [XC + 5.4, YB, ZP - 1.4], [XC + 5.4, YB, -4.2]], 0.24);
DPIPE("lpU", "loopOut", [[XE, YR, ZP], [XE, YR, ZP - 1.4], [XE, YB, ZP - 1.4]], 0.26);
CLAMPS("lpSC", "loopOut", XC + 14, XE - 3, YR, ZP, 0.28, 6.5, 0.5); CLAMPS("lpRC", "loopRet", XC + 14, XE - 3, YB, ZP - 1.4, 0.24, 6.5, 0);
P({ id: "rackBeam", layer: "rack", shape: "box", size: [0.3, 0.3, 4.2], pos: [0, YR - 1.1, ZP - 0.7], at: Array.from({ length: 12 }, (_, i) => [XC + 14 + i * 6.5, 0, 0]), mat: "steel" });
P({ id: "rackPost", layer: "rack", shape: "box", size: [0.3, YR - 1.1, 0.3], pos: [0, (YR - 1.1) / 2, ZP + 1.1], at: Array.from({ length: 12 }, (_, i) => [XC + 14 + i * 6.5, 0, 0]), mat: "steel" });
P({ id: "rackPost2", layer: "rack", shape: "box", size: [0.3, YR - 1.1, 0.3], pos: [0, (YR - 1.1) / 2, ZP - 2.5], at: Array.from({ length: 12 }, (_, i) => [XC + 14 + i * 6.5, 0, 0]), mat: "steel" });
P({ id: "rackFoot", layer: "rack", shape: "box", size: [0.9, 0.1, 0.9], pos: [0, 0.05, 0], at: Array.from({ length: 12 }, (_, i) => [XC + 14 + i * 6.5, 0, ZP + 1.1]).concat(Array.from({ length: 12 }, (_, i) => [XC + 14 + i * 6.5, 0, ZP - 2.5])), mat: "dark" });
P({ id: "rackTag", layer: "loopOut", shape: "box", size: [1.2, 0.5, 0.05], pos: [0, YR + 0.55, ZP + 0.6], at: [[XC + 22, 0, 0], [XC + 40, 0, 0], [XC + 56, 0, 0]], mat: "warnY" });
// ── 閥箱（液體版）X＝XV ──
LAY("vmbBox", [10.4, 9, XV, 4.5]); LAY("vmbFront", [10.4, 8.6, XV, 4.5]); LAY("vmbIn", [8, 8, XV, 5]);
BOX("vmBase", "vmbBox", XV - 5.2, XV + 5.2, 0, 0.6, -3.0, 3.0, "band"); BOX("vmLeakPan", "vmbBox", XV - 4.8, XV + 4.8, 0.6, 1.0, -2.6, 2.6, "cabDark"); BOX("vmLeakLed", "vmbBox", XV - 0.4, XV + 0.4, 1.0, 1.1, 2.2, 2.6, "lampR");
BOX("vmBack", "vmbBox", XV - 5.2, XV + 5.2, 0.6, 9.0, -3.0, -2.86, "cab"); BOX("vmL", "vmbBox", XV - 5.2, XV - 5.06, 0.6, 9.0, -3.0, 3.0, "cab"); BOX("vmR", "vmbBox", XV + 5.06, XV + 5.2, 0.6, 9.0, -3.0, 3.0, "cab"); BOX("vmTop", "vmbBox", XV - 5.2, XV + 5.2, 8.86, 9.0, -3.0, 3.0, "cab");
VT("vmExhaust", "vmbBox", 0.7, 0.58, 9.0, 10.0, "steel2", { x: XV + 3, z: -1.5 });
BOX("vmFrontP", "vmbFront", XV - 5.2, XV + 5.2, 0.6, 9.0, 3.0, 3.14, "cab"); P({ id: "vmWin", layer: "vmbFront", shape: "box", size: [7.4, 5.6, 0.08], pos: [XV, 5.2, 3.18], mat: "window" });
BOX("vmWinFrT", "vmbFront", XV - 3.9, XV + 3.9, 8.0, 8.14, 3.14, 3.24, "steel2"); BOX("vmWinFrB", "vmbFront", XV - 3.9, XV + 3.9, 2.26, 2.4, 3.14, 3.24, "steel2");
P({ id: "vmHandle", layer: "vmbFront", shape: "box", size: [0.2, 1.4, 0.2], pos: [XV - 4.6, 4.6, 3.3], mat: "steel2" }); BOX("vmPlate", "vmbFront", XV + 2, XV + 4.8, 0.9, 1.7, 3.14, 3.18, "warnY");
P({ id: "vmHinge", layer: "vmbFront", shape: "box", size: [0.26, 0.8, 0.2], pos: [XV + 5.0, 0, 3.1], at: [[0, 2.2, 0], [0, 5.0, 0], [0, 7.8, 0]], mat: "dark" });
// 內部支路：隔離閥、過濾器（小）、壓力表、取樣口（各一排；直管之間有彎頭）
P({ id: "vmValve", layer: "vmbIn", shape: "cyl", size: [0.42, 0.9], rot: V, pos: [XV, 3.6, 0], at: [[-3, 0, 0], [-1, 0, 0], [1, 0, 0], [3, 0, 0]], mat: "pfa" }); P({ id: "vmAct", layer: "vmbIn", shape: "cyl", size: [0.38, 1.3], rot: V, pos: [XV, 4.7, 0], at: [[-3, 0, 0], [-1, 0, 0], [1, 0, 0], [3, 0, 0]], mat: "dark" });
P({ id: "vmFil", layer: "vmbIn", shape: "tube", size: [0.7, 0.6, 3.0], rot: V, pos: [XV, 5.2, -0.7], at: [[-2, 0, 0], [2, 0, 0]], mat: "pfaT" }); P({ id: "vmFilCap", layer: "vmbIn", shape: "cyl", size: [0.78, 0.2], rot: V, pos: [XV, 6.8, -0.7], at: [[-2, 0, 0], [2, 0, 0]], mat: "steel2" });
VC("vmGauge", "vmbIn", 0.5, 6.9, 7.1, "steel2", { x: XV - 3.6, z: 1.6 }); VC("vmGaugeF", "vmbIn", 0.42, 7.1, 7.14, "gaugeF", { x: XV - 3.6, z: 1.6 }); VC("vmSample", "vmbIn", 0.2, 2.2, 3.2, "steel2", { x: XV + 3.6, z: 1.6 }); P({ id: "vmSampleV", layer: "vmbIn", shape: "sphere", size: [0.3], pos: [XV + 3.6, 3.4, 1.6], mat: "estop" });
PIPE("vmHdr", "vmbIn", [[XV - 4.9, 2.7, 0], [XV + 4.9, 2.7, 0]], 0.28, "pfa"); PIPE("vmBr", "vmbIn", [[XV - 3, 2.7, 0], [XV - 3, 3.2, 0]], 0.2, "pfa");
PIPE("vmBrB", "vmbIn", [[XV - 1, 2.7, 0], [XV - 1, 3.2, 0]], 0.2, "pfa"); PIPE("vmBrC", "vmbIn", [[XV + 1, 2.7, 0], [XV + 1, 3.2, 0]], 0.2, "pfa"); PIPE("vmBrD", "vmbIn", [[XV + 3, 2.7, 0], [XV + 3, 3.2, 0]], 0.2, "pfa");
PIPE("vmTop", "loopOut", [[XV, YR - 0.4, ZP], [XV, 9.4, ZP], [XV, 9.4, 0], [XV, 5.0, 0]], 0.2, "pfa");
// ── 機台旁供液櫃／日用槽 X＝XD ──
LAY("dtBase", [13, 0.8, XD, 0.3]); LAY("dtWall", [12, 17, XD, 8.5]); LAY("dtTank", [9, 9, XD, 6]); LAY("dtStir", [4, 8, XD - 3, 6]); LAY("dtFloat", [6, 5, XD, 6]); LAY("dtPump", [3, 3, XD, 2.6]);
const DT = CAB("dt", XD, 12, 8, 17, "dtBase", "dtWall", "dtDoor"); LAY("dtDoor", [12, 16.4, XD, 8.5]);
VT("dtTankA", "dtTank", 1.9, 1.8, 2.2, 10.4, "pfaT", { x: XD - 3, z: 0 }); VC("dtLiqA", "dtTank", 1.78, 2.3, 8.2, "clean", { x: XD - 3, z: 0 }); VC("dtLidA", "dtTank", 2.0, 10.4, 10.7, "steel2", { x: XD - 3, z: 0 });
VT("dtTankB", "dtTank", 1.9, 1.8, 2.2, 10.4, "pfaT", { x: XD + 3, z: 0 }); VC("dtLiqB", "dtTank", 1.78, 2.3, 4.6, "clean", { x: XD + 3, z: 0 }); VC("dtLidB", "dtTank", 2.0, 10.4, 10.7, "steel2", { x: XD + 3, z: 0 });
P({ id: "dtLidBolt", layer: "dtTank", shape: "cyl", size: [0.08, 0.14], rot: V, pos: [0, 10.8, 0], at: RING(8, 1.7).map(([a, , b]) => [XD - 3 + a, 0, b]).concat(RING(8, 1.7).map(([a, , b]) => [XD + 3 + a, 0, b])), mat: "steel" });
VC("dtBaseA", "dtTank", 2.0, 2.0, 2.2, "dark", { x: XD - 3, z: 0 }); VC("dtBaseB", "dtTank", 2.0, 2.0, 2.2, "dark", { x: XD + 3, z: 0 });
P({ id: "dtN2", layer: "dtTank", shape: "cyl", size: [0.12, 2.0], rot: V, pos: [0, 11.6, 0], at: [[XD - 3, 0, 0], [XD + 3, 0, 0]], mat: "pfa" }); HXC("dtN2H", "dtTank", 0.12, XD - 3, XD + 3, 12.6, 0, "pfa");
VC("dtMotor", "dtStir", 0.7, 11.0, 12.8, "dark", { x: XD - 3, z: 0 }); P({ id: "dtMotorFin", layer: "dtStir", shape: "tube", size: [0.78, 0.66, 0.08], rot: V, pos: [XD - 3, 11.6, 0], at: [[0, 0, 0], [0, 0.35, 0], [0, 0.7, 0], [0, 1.05, 0]], mat: "steel" });
VC("dtShaft", "dtStir", 0.08, 4.4, 11.0, "steel", { x: XD - 3, z: 0 }); P({ id: "dtBlade", layer: "dtStir", shape: "box", size: [2.2, 0.08, 0.46], rot: [0, 0, 0], pos: [XD - 3, 4.5, 0], at: [[0, 0, 0]], mat: "steel2" }); P({ id: "dtBladeB", layer: "dtStir", shape: "box", size: [0.46, 0.08, 2.2], pos: [XD - 3, 4.5, 0], mat: "steel2" });
P({ id: "dtFloatRod", layer: "dtFloat", shape: "cyl", size: [0.06, 5.0], rot: V, pos: [XD + 3.9, 6.0, 0], at: [[0, 0, 0]], mat: "steel" }); P({ id: "dtFloatBall", layer: "dtFloat", shape: "sphere", size: [0.3], pos: [XD + 3.9, 4.6, 0], at: [[0, 0, 0], [0, 1.6, 0], [0, 3.0, 0]], mat: "lampY" });
P({ id: "dtOutPump", layer: "dtPump", shape: "cyl", size: [0.8, 1.2], rot: V, pos: [XD, 1.2, 1.8], mat: "steel2" }); VC("dtOutMotor", "dtPump", 0.9, 2.4, 3.4, "dark", { x: XD, z: 1.8 });
PIPE("dtIn", "dtPump", [[XD - 6.0, 3.0, -2.5], [XD - 3, 3.0, -2.5], [XD - 3, 2.4, -1.0]], 0.2, "pfa"); PIPE("dtOut", "dtPump", [[XD, 1.2, 1.8], [XD + 4.2, 1.2, 1.8], [XD + 4.2, 3.0, -2.5], [XD + 6.0, 3.0, -2.5]], 0.2, "pfa");
PIPE("dtN2Pipe", "dtTank", [[XD - 6.0, 12.6, -2.5], [XD - 3, 12.6, -2.5], [XD - 3, 12.6, 0]], 0.1, "dark");
// ── 使用點過濾器 X＝XP（ghost 外殼，內有褶疊濾芯與接頭） ──
LAY("pouShell", [4, 10, XP, 6]); LAY("pouCore", [3, 8, XP, 6]); LAY("pouFit", [8, 12, XP, 6]);
BOX("pouBracket", "pouFit", XP - 0.2, XP + 0.2, 1.0, 9.2, -2.2, -1.8, "dark"); BOX("pouBase", "pouFit", XP - 1.8, XP + 1.8, 0, 0.3, -2.4, 1.4, "dark");
VT("pouWall", "pouShell", 1.6, 1.5, 1.4, 9.0, "pfaT", { x: XP, z: 0 }); VC("pouCapB", "pouShell", 1.75, 1.0, 1.4, "steel2", { x: XP, z: 0 }); VC("pouCapT", "pouShell", 1.75, 9.0, 9.4, "steel2", { x: XP, z: 0 });
P({ id: "pouBolt", layer: "pouShell", shape: "cyl", size: [0.09, 0.16], rot: V, pos: [XP, 9.45, 0], at: RING(8, 1.5).map(([a, , b]) => [a, 0, b]), mat: "steel" });
VC("pouCoreTube", "pouCore", 0.5, 1.5, 8.9, "sinter", { x: XP, z: 0 }); P({ id: "pouPleat", layer: "pouCore", shape: "box", size: [0.07, 7.0, 0.5], pos: [XP, 5.2, 0], at: Array.from({ length: 18 }, (_, i) => { const [x, z] = pol(i * 20, 0.95); return [x, 0, z]; }), mat: "pleat" });
P({ id: "pouPleatB", layer: "pouCore", shape: "box", size: [0.5, 7.0, 0.06], pos: [XP, 5.2, 0], at: Array.from({ length: 18 }, (_, i) => { const [x, z] = pol(i * 20 + 10, 1.0); return [x, 0, z]; }), mat: "pleat" });
VC("pouVent", "pouFit", 0.2, 9.4, 10.1, "steel2", { x: XP, z: 0 }); P({ id: "pouVentH", layer: "pouFit", shape: "sphere", size: [0.26], pos: [XP, 10.25, 0], mat: "estop" });
HXC("pouIn", "pouFit", 0.26, XP - 3.0, XP - 1.5, 2.0, 0, "pfa"); HXC("pouOut", "pouFit", 0.26, XP + 1.5, XP + 3.0, 8.4, 0, "pfa");
VC("pouDp", "pouFit", 0.6, 7.0, 7.3, "steel2", { x: XP + 1.9, z: 1.2 }); VC("pouDpF", "pouFit", 0.5, 7.3, 7.34, "gaugeF", { x: XP + 1.9, z: 1.2 });
// 使用點供料管（z＝-2.5，y＝3.0）：供液櫃 → 過濾器 → 旋轉清洗腔
PIPE("feedA", "feedL", [[XV + 4.9, 2.7, 0], [XV + 6.0, 2.7, 0], [XV + 6.0, 3.0, -2.5], [XD - 6.0, 3.0, -2.5]], 0.2, "pfa");
PIPE("feedB", "feedL", [[XD + 6.0, 3.0, -2.5], [XP - 3.0, 3.0, -2.5], [XP - 3.0, 2.0, -2.5], [XP - 3.0, 2.0, 0]], 0.2, "pfa");
LAY("feedL", [40, 4, 80, 3]);
PIPE("feedC", "feedL", [[XP + 3.0, 8.4, 0], [XP + 3.0, 8.4, -2.5], [XS - 3.0, 8.4, -2.5], [XS - 3.0, 6.8, -2.5]], 0.2, "pfa");
CLAMPS("feedC1", "feedL", XD - 9, XD - 7.5, 3.0, -2.5, 0.2, 1.4, 0); CLAMPS("feedC2", "feedL", XP + 6, XS - 5, 8.4, -2.5, 0.2, 4, 0);
// UPW 純水管（淡藍，與藥液管相鄰）
PIPE("upwP", "feedL", [[XP + 3.0, 9.6, -3.4], [XS + 2.0, 9.6, -3.4], [XS + 2.0, 7.2, -3.4]], 0.2, "upw");
// ── 旋轉清洗腔一角 X＝XS ──
LAY("scBody", [10, 10, XS, 4]); LAY("scCup", [9, 5, XS, 4]); LAY("scChuck", [8, 4, XS, 3]); LAY("scArm", [8, 9, XS, 7]);
BOX("scPlinth", "scBody", XS - 5.4, XS + 5.4, 0, 1.0, -4.0, 4.0, "band"); BOX("scSkirt", "scBody", XS - 5.0, XS + 5.0, 1.0, 2.2, -3.6, 3.6, "cabDark");
BOX("scBack", "scBody", XS - 5.0, XS + 5.0, 2.2, 11.0, -3.6, -3.4, "panel2"); BOX("scLeft", "scBody", XS - 5.0, XS - 4.8, 2.2, 11.0, -3.6, 3.6, "panel2");
BOX("scTopFan", "scBody", XS - 4.0, XS + 4.0, 11.0, 11.8, -3.0, 3.0, "cabDark"); P({ id: "scFilterGrid", layer: "scBody", shape: "box", size: [7.6, 0.06, 0.12], pos: [XS, 11.82, 0], at: Array.from({ length: 6 }, (_, i) => [0, 0, -2.5 + i]), mat: "seam" });
VC("scExhaust", "scBody", 0.9, 0.9, 1.9, "steel2", { x: XS + 3.8, z: -2.2 }); PIPE("scExhaustP", "scBody", [[XS + 3.8, 1.9, -2.2], [XS + 3.8, 2.4, -3.4]], 0.7, "steel2");
VT("scCupWall", "scCup", 4.4, 4.2, 2.2, 7.4, "pfaT", { x: XS, z: 0 }); VT("scCupLip", "scCup", 4.7, 3.4, 7.4, 7.8, "steel2", { x: XS, z: 0 }); VC("scCupBot", "scCup", 4.2, 2.0, 2.3, "dark", { x: XS, z: 0 });
VT("scDrain", "scCup", 0.8, 0.5, 1.0, 2.1, "steel2", { x: XS + 2.6, z: 1.6 });
VC("scSpindle", "scChuck", 0.9, 2.2, 4.4, "steel2", { x: XS, z: 0 }); VC("scChuckD", "scChuck", 3.5, 4.4, 4.8, "chuckM", { x: XS, z: 0 }); P({ id: "scPin", layer: "scChuck", shape: "cyl", size: [0.12, 0.3], rot: V, pos: [XS, 5.0, 0], at: RING(6, 3.2).map(([a, , b]) => [a, 0, b]), mat: "steel" });
VC("scWafer", "scChuck", 3.1, 4.8, 4.88, "steel2", { x: XS, z: 0 }); P({ id: "scWaferGrid", layer: "scChuck", shape: "box", size: [5.0, 0.012, 0.03], pos: [XS, 4.9, 0], at: [[0, 0, -1.6], [0, 0, 0], [0, 0, 1.6]], mat: "tgtFace" }); P({ id: "scWaferGridB", layer: "scChuck", shape: "box", size: [0.03, 0.012, 5.0], pos: [XS, 4.9, 0], at: [[-1.6, 0, 0], [0, 0, 0], [1.6, 0, 0]], mat: "tgtFace" });
VC("scFilm", "scChuck", 3.05, 4.88, 5.0, "clean", { x: XS, z: 0 });
BOX("scArmPost", "scArm", XS - 4.9, XS - 4.3, 2.2, 8.4, -2.8, -2.2, "steel2"); BOX("scArmBar", "scArm", XS - 4.9, XS + 0.4, 8.0, 8.6, -2.8, -2.2, "steel2"); P({ id: "scArmCover", layer: "scArm", shape: "slab", size: [5.4, 0.3, 0.8], r: 0.1, pos: [XS - 2.2, 8.9, -2.5], mat: "cab" });
VC("scNozzle", "scArm", 0.22, 6.2, 8.0, "steel", { x: XS, z: -2.5 }); VC("scNozzle2", "scArm", 0.12, 5.8, 6.2, "steel2", { x: XS, z: -2.5 }); P({ id: "scNzLed", layer: "scArm", shape: "sphere", size: [0.1], pos: [XS - 4.6, 8.9, -2.1], mat: "lampG" });
PIPE("scNzTube", "scArm", [[XS - 3.0, 6.8, -2.5], [XS - 3.0, 8.4, -2.5], [XS, 8.4, -2.5], [XS, 8.0, -2.5]], 0.16, "pfa"); PIPE("scUpw", "scArm", [[XS + 2.0, 7.2, -3.4], [XS + 2.0, 8.9, -3.4], [XS, 8.9, -2.9], [XS, 8.4, -2.8]], 0.12, "upw");
// ── 廢液收集櫃 X＝XW ──
LAY("wsBase", [11, 0.8, XW, 0.3]); LAY("wsWall", [10, 12, XW, 6]); LAY("wsDoor", [10, 11.4, XW, 6]); LAY("wsTank", [8, 6, XW, 5]);
const WS = CAB("ws", XW, 10, 6.4, 12, "wsBase", "wsWall", "wsDoor");
P({ id: "wsTankA", layer: "wsTank", shape: "tube", size: [1.5, 1.4, 5.0], rot: V, pos: [XW, 4.0, 0], at: [[-2.6, 0, 0], [0, 0, 0], [2.6, 0, 0]], mat: "pfaT" });
P({ id: "wsLiq", layer: "wsTank", shape: "cyl", size: [1.38, 2.6], rot: V, pos: [XW, 3.3, 0], at: [[-2.6, 0, 0], [0, 0, 0], [2.6, 0, 0]], mat: "etch" });
P({ id: "wsTag", layer: "wsTank", shape: "box", size: [1.5, 0.5, 0.06], pos: [XW, 7.0, 1.7], at: [[-2.6, 0, 0], [0, 0, 0], [2.6, 0, 0]], mat: "warnY" }); P({ id: "wsTLed", layer: "wsTank", shape: "sphere", size: [0.14], pos: [XW, 7.7, 1.7], at: [[-2.6, 0, 0], [0, 0, 0], [2.6, 0, 0]], mat: "lampR" });
PIPE("wsDrain", "wsTank", [[XS + 2.6, 1.0, 1.6], [XS + 2.6, 0.9, 3.2], [XW - 2.6, 0.9, 3.2], [XW - 2.6, 5.8, 3.2], [XW - 2.6, 5.8, 0]], 0.16, "pfa");

// ═════ S5（x＝150）：鐵管 vs 塑膠管（半透明剖視）＋檸檬與鐵杯 ═════
const X5 = 152, Y5 = 3.6;
LAY("ironPipe", [24, 6, X5, 2.7]); LAY("ironAcid", [22, 4, X5, 2.7]); LAY("rustA", [3, 3, X5 - 6, 2]); LAY("rustB", [3, 3, X5, 2]); LAY("rustC", [3, 3, X5 + 6, 2]);
LAY("pfaPipe", [24, 6, X5, 10.4]); LAY("pfaAcid", [22, 4, X5, 10.4]); LAY("lemon", [8, 6, X5 - 17, 3]);
const Z5I = 0, Z5P = 0, R5 = 2.3, YI = 2.7, YP = 10.4;   // r1：兩根管上下分開（塑膠在上、鐵在下），不再前後重疊
// 鐵管：不透明金屬灰；中段留一段「剖開的透明視窗」看內壁，兩端是實心鐵管（2026/11/27 r1）
HXC("irWallL", "ironPipe", R5, X5 - 11, X5 - 5, YI, Z5I, "iron"); HXC("irWallR", "ironPipe", R5, X5 + 5, X5 + 11, YI, Z5I, "iron");
// r2：剖開窗＝鐵管只留後半（切掉前半），露出不透明灰色金屬內壁（不是半透明黃綠）；酸液只剩一窪（後半圓弓形）
{ const N = 18, arc = (r, a0, a1) => Array.from({ length: N + 1 }, (_, k) => { const t = a0 + (a1 - a0) * k / N; return [R2(r * Math.cos(t)), R2(r * Math.sin(t))]; });
  const mid = R2(X5), len = 10;
  P({ id: "irWall", layer: "ironPipe", shape: "poly", pts: [...arc(R5, -Math.PI / 2, Math.PI / 2), ...arc(R5 - 0.16, Math.PI / 2, -Math.PI / 2)], size: [1, 1, len], rot: HX, pos: [mid, YI, Z5I], mat: "iron" });   // r3：內壁用亮灰金屬（不是深藍、也不是黃綠半透明）
  const ra = R5 - 0.2, h0 = 0.3, t0 = Math.asin(h0 / ra);
  P({ id: "irAcid", layer: "ironAcid", shape: "poly", pts: [[0, -ra], ...arc(ra, -Math.PI / 2, t0), [0, h0]], size: [1, 1, len - 0.2], rot: HX, pos: [mid, YI, Z5I], mat: "acid" }); }
P({ id: "irWinFr", layer: "ironPipe", shape: "tube", size: [R5 + 0.18, R5 - 0.05, 0.3], rot: HX, pos: [0, YI, Z5I], at: [[X5 - 5, 0, 0], [X5 + 5, 0, 0]], mat: "ironDark" });
P({ id: "irFl", layer: "ironPipe", shape: "tube", size: [R5 + 0.7, R5 - 0.05, 0.45], rot: HX, pos: [0, YI, Z5I], at: [[X5 - 11, 0, 0], [X5 + 11, 0, 0], [X5 - 3.7, 0, 0], [X5 + 3.7, 0, 0]], mat: "iron" });
P({ id: "irBolt", layer: "ironPipe", shape: "cyl", size: [0.13, 0.3], rot: HX, pos: [0, YI, Z5I], at: [X5 - 11, X5 + 11, X5 - 3.7, X5 + 3.7].flatMap((xx) => Array.from({ length: 8 }, (_, i) => { const [y, z] = pol(i * 45, R5 + 0.45); return [xx, y, z]; })), mat: "ironDark" });
P({ id: "irStand", layer: "ironPipe", shape: "box", size: [0.5, YI - R5 - 0.1, 1.2], pos: [0, (YI - R5 - 0.1) / 2, Z5I], at: [[X5 - 7, 0, 0], [X5 + 7, 0, 0]], mat: "iron" });
HXC("pfWall", "pfaPipe", R5, X5 - 11, X5 + 11, YP, Z5P, "pfaT"); HXC("pfAcid", "pfaAcid", R5 - 0.15, X5 - 10.9, X5 + 10.9, YP, Z5P, "acid");
P({ id: "pfFl", layer: "pfaPipe", shape: "tube", size: [R5 + 0.7, R5 - 0.05, 0.45], rot: HX, pos: [0, YP, Z5P], at: [[X5 - 11, 0, 0], [X5 + 11, 0, 0], [X5 - 3.7, 0, 0], [X5 + 3.7, 0, 0]], mat: "pfa" });
P({ id: "pfBolt", layer: "pfaPipe", shape: "cyl", size: [0.13, 0.3], rot: HX, pos: [0, YP, Z5P], at: [X5 - 11, X5 + 11, X5 - 3.7, X5 + 3.7].flatMap((xx) => Array.from({ length: 8 }, (_, i) => { const [y, z] = pol(i * 45, R5 + 0.45); return [xx, y, z]; })), mat: "steel" });
BOX("pfRack", "pfaPipe", X5 - 11, X5 + 11, YP - 0.3, YP + 0.3, -3.4, -2.9, "steel2"); P({ id: "pfRackPost", layer: "pfaPipe", shape: "box", size: [0.4, YP, 0.4], pos: [0, YP / 2, -3.15], at: [[X5 - 10.4, 0, 0], [X5 + 10.4, 0, 0]], mat: "steel" }); P({ id: "pfRackArm", layer: "pfaPipe", shape: "box", size: [0.4, 0.25, 3.0], pos: [0, YP - 0.1, -1.4], at: [[X5 - 7, 0, 0], [X5 + 7, 0, 0]], mat: "steel2" });
// 鐵管內壁的腐蝕斑（三個位置，先後出現）：扁平的紅褐色塊貼在內壁底部＋剝落的鏽塊
for (const [id, dx] of [["rustA", -3.4], ["rustB", 0], ["rustC", 3.4]]) {
  P({ id: `${id}Patch`, layer: id, shape: "sphere", size: [0.9], scale: [1.4, 0.25, 0.9], pos: [X5 + dx, YI - R5 + 0.28, Z5I], mat: "rust" });
  // r3：剖開窗的後內壁（液面以上）也有鏽紅凹坑，一眼看出「金屬被咬」
  P({ id: `${id}Wpit`, layer: id, shape: "sphere", size: [0.32], scale: [1, 1, 0.3], pos: [X5 + dx, YI + 0.5, Z5I - R5 + 0.26], at: [[-0.5, 0.2, 0], [0.4, -0.3, 0], [0.1, 0.9, 0]], mat: "rustDark" });
  P({ id: `${id}Wstain`, layer: id, shape: "sphere", size: [0.7], scale: [1.3, 0.8, 0.2], pos: [X5 + dx, YI + 0.3, Z5I - R5 + 0.22], mat: "rust" });
  P({ id: `${id}Pit`, layer: id, shape: "sphere", size: [0.3], scale: [1, 0.3, 1], pos: [X5 + dx, YI - R5 + 0.32, Z5I], at: [[-0.7, 0, 0.2], [0.6, 0, -0.3], [0.1, 0, 0.5], [-0.2, 0, -0.5]], mat: "rustDark" });
}
actions.irBubbles = { type: "flow", _說明: "酸咬金屬：腐蝕斑冒出小氣泡，向上飄到液面（示意）", layer: "ironAcid", path: [[X5 - 3.4, YI - R5 + 0.5, Z5I], [X5 - 3.4, YI + 1.4, Z5I], [X5, YI - R5 + 0.5, Z5I], [X5, YI + 1.4, Z5I]], n: 8, size: 0.1, shape: "dot", rate: 0.9, color: "bubC", track: false, rise: true, jitter: 0.5, free: true };
actions.rustFlow = { type: "flow", _說明: "鏽紅色金屬粒子從管壁剝落，被液流帶往下游（示意）", layer: "ironAcid", path: [[X5 - 3.4, YI - R5 + 0.6, Z5I], [X5 - 1, YI - 0.6, Z5I], [X5 + 4, YI - 0.2, Z5I], [X5 + 10, YI - 0.2, Z5I]], n: 12, size: 0.17, shape: "dot", rate: 0.2, color: "rustC", track: false, jitter: 0.5, free: true, rim: "dark" };
actions.irFlow = { type: "flow", _說明: "鐵管內的酸液流向右（對照組，與塑膠管同速）", layer: "ironAcid", path: [[X5 - 4.6, YI, Z5I], [X5 + 4.6, YI, Z5I]], n: 18, lanes: 3, laneDir: [0, 0, 1], laneGap: 0.7, size: 0.1, shape: "dot", rate: 0.12, color: "acidC", track: false, jitter: 0.8, free: true };
actions.pfFlow = { type: "flow", _說明: "塑膠管內的酸液流向右：沒有雜質", layer: "pfaAcid", path: [[X5 - 10.5, YP, Z5P], [X5 + 10.5, YP, Z5P]], n: 18, lanes: 3, laneDir: [0, 0, 1], laneGap: 0.7, size: 0.1, shape: "dot", rate: 0.12, color: "acidC", track: false, jitter: 0.8, free: true };
actions.rustGlowA = { type: "pulse", parts: ["rustAPatch"], color: "rustC", glow: 0.6, steady: true, halo: 0 };
// 檸檬（半顆，果肉辨識）＋鐵杯（內壁生鏽）
const XL = X5 - 17;
P({ id: "lemHalf", layer: "lemon", shape: "sphere", size: [1.9], scale: [1, 0.9, 0.55], pos: [XL, 2.2, 3.0], mat: "lemon" }); P({ id: "lemRing", layer: "lemon", shape: "tube", size: [1.78, 1.5, 0.08], pos: [XL, 2.2, 3.52], mat: "slurryS" });
P({ id: "lemSeg", layer: "lemon", shape: "box", size: [0.06, 1.5, 0.06], pos: [XL, 2.2, 3.56], mat: "slurryS" });
P({ id: "lemSegB", layer: "lemon", shape: "box", size: [1.5, 0.06, 0.06], pos: [XL, 2.2, 3.57], mat: "slurryS" }); P({ id: "lemSegC", layer: "lemon", shape: "box", size: [1.5, 0.06, 0.06], rot: [0, 0, 45], pos: [XL, 2.2, 3.58], mat: "slurryS" }); P({ id: "lemSegD", layer: "lemon", shape: "box", size: [1.5, 0.06, 0.06], rot: [0, 0, -45], pos: [XL, 2.2, 3.59], mat: "slurryS" });
VT("cupWall", "lemon", 1.6, 1.45, 0.2, 3.6, "iron", { x: XL, z: -3.0 }); VC("cupBot", "lemon", 1.6, 0.1, 0.4, "ironDark", { x: XL, z: -3.0 }); VT("cupRim", "lemon", 1.7, 1.4, 3.5, 3.7, "steel2", { x: XL, z: -3.0 });
P({ id: "cupRust", layer: "lemon", shape: "sphere", size: [0.5], scale: [1, 0.5, 1], pos: [XL, 1.6, -3.0], at: [[0.9, 0.6, 0.7], [-0.7, 0.2, 0.9], [0.1, 1.1, -1.1]], mat: "rust" });
P({ id: "cupHandle", layer: "lemon", shape: "tube", size: [1.0, 0.8, 0.15], rot: [0, 0, 0], pos: [XL + 2.2, 2.3, -3.0], mat: "iron" });
actions.lemonDrip = { type: "flow", _說明: "檸檬汁滴進鐵杯", layer: "lemon", path: [[XL, 1.0, 3.0], [XL, 0.5, 1.0], [XL, 1.0, -2.6]], n: 3, size: 0.12, shape: "liquid", rate: 0.5, color: "lemonC", track: false, accel: true, free: true };
Object.assign(anchors, { ironP: A("ironPipe", [X5 - 8, YI + 2.3, Z5I], -150, -90), pfaP: A("pfaPipe", [X5 - 8, YP + 2.3, Z5P], -150, -90), rustP: A("rustA", [X5 - 3.4, YI - R5 + 0.5, Z5I], 150, 100), cup: A("lemon", [XL, 3.7, -3.0], -150, -90) });

// ═════ S6（x＝182）：研磨液放大剖面＋晶圓表面（磨粒機械磨＋藥劑溶出氧化層）— r1：凸起加大（約磨粒 5 倍高、圓角頂）、墊子有微孔、磨粒被夾在墊與凸起之間 ═════
const X6 = 182, XB = X6 + 1.0, HW = 7.0, PADY = 6.7;   // HW＝剖面半寬；PADY＝墊子下表面高度
LAY("slBlock", [14, 4.6, X6, 4.5]); LAY("wfSurf", [14, 3, X6, 1.2]); LAY("bumpHi", [4.6, 4.0, XB, 4.2]); LAY("bumpLo", [4.6, 2.4, XB, 3.4]); LAY("oxFilm", [14, 0.5, X6, 2.55]); LAY("slPad", [14, 2.2, X6, 7.6]);
LAY("grainFree", [13, 4, X6, 4.6]); LAY("grainPress", [5, 1.4, XB, 6.3]); LAY("oxMol", [13, 4, X6 - 3.5, 4.6]); LAY("debris", [4, 3, XB + 3, 4]);
BOX("sfSlab", "wfSurf", X6 - HW, X6 + HW, 0, 2.0, -3.4, 3.4, "sub"); BOX("sfSlabTop", "wfSurf", X6 - HW, X6 + HW, 2.0, 2.2, -3.4, 3.4, "steel2");
P({ id: "sfLat", layer: "wfSurf", shape: "sphere", size: [0.22], pos: [X6 - HW + 0.4, 1.0, 3.45], at: Array.from({ length: 19 }, (_, i) => [i * 0.7, 0, 0]).concat(Array.from({ length: 19 }, (_, i) => [i * 0.7 + 0.35, -0.5, 0])), mat: "subD" });
// 凸起：高處（磨前）高 3.4、頂部圓角；磨後（bumpLo）矮很多
BOX("bumpHiBox", "bumpHi", XB - 2.2, XB + 2.2, 2.2, 5.5, -2.2, 2.2, "steel2"); P({ id: "bumpHiCap", layer: "bumpHi", shape: "sphere", size: [2.2], scale: [1, 0.27, 1], pos: [XB, 5.5, 0], mat: "steel2" });
BOX("bumpLoBox", "bumpLo", XB - 2.2, XB + 2.2, 2.2, 3.7, -2.2, 2.2, "steel2"); P({ id: "bumpLoCap", layer: "bumpLo", shape: "sphere", size: [2.2], scale: [1, 0.2, 1], pos: [XB, 3.7, 0], mat: "steel2" });
BOX("oxFilmBox", "oxFilm", X6 - HW, XB - 2.2, 2.2, 2.55, -3.4, 3.4, "oxFilmM"); BOX("oxFilmBoxR", "oxFilm", XB + 2.2, X6 + HW, 2.2, 2.55, -3.4, 3.4, "oxFilmM");
BOX("slBox", "slBlock", X6 - HW, X6 + HW, 2.2, PADY, -3.4, 3.4, "slurryT");
// 研磨墊：有微孔的軟墊（下表面一排排小孔與纖維顆粒），壓在凸起上方
BOX("slPadBody", "slPad", X6 - HW, X6 + HW, PADY, PADY + 1.6, -3.4, 3.4, "pad"); P({ id: "slPadGroove", layer: "slPad", shape: "box", size: [0.2, 0.2, 6.8], pos: [X6, PADY + 1.62, 0], at: Array.from({ length: 7 }, (_, i) => [-6 + i * 2, 0, 0]), mat: "padDark" });
BOX("slPadPlaten", "slPad", X6 - HW, X6 + HW, PADY + 1.6, PADY + 2.0, -3.4, 3.4, "steel2");
const rnd = (() => { let s = 20261127; return () => { s = (s * 1664525 + 1013904223) % 4294967296; return s / 4294967296; }; })();
P({ id: "slPadPore", layer: "slPad", shape: "sphere", size: [0.2], scale: [1, 0.55, 1], pos: [0, PADY + 0.02, 0], at: Array.from({ length: 70 }, () => [R2(X6 - HW + 0.5 + rnd() * (2 * HW - 1)), 0, R2(-3.1 + rnd() * 6.2)]), mat: "padDark" });
P({ id: "slPadPoreF", layer: "slPad", shape: "sphere", size: [0.22], scale: [1, 1, 0.45], pos: [0, 0, 3.42], at: Array.from({ length: 44 }, (_, i) => [R2(X6 - HW + 0.5 + ((i % 22) / 21) * (2 * HW - 1) + (i >= 22 ? 0.3 : 0)), R2(PADY + 0.4 + (i >= 22 ? 0.7 : 0) + rnd() * 0.25), 0]), mat: "padDark" });
P({ id: "slPadFib", layer: "slPad", shape: "sphere", size: [0.11], pos: [0, PADY + 0.05, 0], at: Array.from({ length: 60 }, () => [R2(X6 - HW + 0.4 + rnd() * (2 * HW - 0.8)), 0, R2(-3.2 + rnd() * 6.4)]), mat: "padDark" });
// 磨粒：二氧化矽圓球（淡藍白）。自由漂浮的散在液體裡做布朗運動；受壓 3 顆夾在墊與凸起頂之間（略壓扁）
const inBump = ([x, y]) => x > XB - 2.7 && x < XB + 2.7 && y < 6.2;
const FREE = Array.from({ length: 40 }, () => [R2(X6 - HW + 0.6 + rnd() * (2 * HW - 1.2)), R2(3.0 + rnd() * 3.3), R2(-3 + rnd() * 6)]).filter((p) => !inBump(p));
P({ id: "gFree", layer: "grainFree", shape: "sphere", size: [0.36], pos: [0, 0, 0], at: FREE, mat: "silica" });
P({ id: "gFreeB", layer: "grainFree", shape: "sphere", size: [0.28], pos: [0, 0, 0], at: Array.from({ length: 24 }, () => [R2(X6 - HW + 0.6 + rnd() * (2 * HW - 1.2)), R2(2.9 + rnd() * 3.5), R2(-3 + rnd() * 6)]).filter((p) => !inBump(p)), mat: "silica" });
P({ id: "gPress", layer: "grainPress", shape: "sphere", size: [0.42], scale: [1, 0.8, 1], pos: [0, 0, 0], at: [[XB - 1.3, 6.24, 1.5], [XB + 0.4, 6.3, 1.4], [XB + 1.6, 6.22, 1.2]], mat: "silica" });
// 氧化劑小分子（紅白雙球）：游向表面
P({ id: "oxA", layer: "oxMol", shape: "sphere", size: [0.17], pos: [0, 0, 0], at: Array.from({ length: 20 }, () => [R2(X6 - HW + 0.6 + rnd() * 4.2), R2(3.2 + rnd() * 3), R2(-3 + rnd() * 6)]), mat: "ohO" });
P({ id: "oxB", layer: "oxMol", shape: "sphere", size: [0.1], pos: [0.22, 0.12, 0], at: Array.from({ length: 20 }, () => [R2(X6 - HW + 0.6 + rnd() * 4.2), R2(3.2 + rnd() * 3), R2(-3 + rnd() * 6)]), mat: "ohH" });
P({ id: "debrisS", layer: "debris", shape: "sphere", size: [0.14], pos: [0, 0, 0], at: [[XB + 2.6, 3.2, 0.3], [XB + 3.2, 3.6, -0.6], [XB + 2.9, 4.2, 0.8], [XB + 3.8, 3.4, 0.1]], mat: "silica" });
actions.brown = { type: "vibrate", _說明: "磨粒的布朗運動：微小隨機抖動（示意）", parts: ["gFree", "gFreeB", "oxA", "oxB"], axis: [0.6, 0.8, 0.4], amp: 0.1, freq: 3.2 };
actions.drift = { type: "flow", _說明: "磨粒隨液體緩緩流動", layer: "grainFree", path: [[X6 - 6, 4.2, 0], [X6 + 6, 4.8, 0]], n: 8, size: 0.3, shape: "dot", rate: 0.05, color: "silicaC", track: false, jitter: 1.6, free: true, rim: "steelC" };
actions.oxIn = { type: "flow", _說明: "氧化劑分子游向表面，把凸起處與表面的氧化層溶出（化學）", layer: "oxMol", path: [[X6 - 5, 6, 0], [X6 - 4.6, 2.9, 0.6]], n: 6, size: 0.16, shape: "mol", rate: 0.3, color: "oxidC", track: false, jitter: 1.0, free: true };
actions.grit = { type: "flow", _說明: "被磨下來的微小碎屑被液流帶走（機械）", layer: "debris", path: [[XB + 2.3, 3.4, 0], [XB + 4.6, 5.2, 0.8]], n: 6, size: 0.12, shape: "dot", rate: 0.4, color: "silicaC", track: false, jitter: 0.5, free: true };
actions.padPress = { type: "pulse", _說明: "墊子往下壓（被夾住的磨粒亮）", parts: ["gPress"], color: "silicaC", glow: 0.6, steady: true, halo: 0 };
// 刮傷示範（s7 前半）：結塊的大顆粒夾在墊與晶圓之間劃出一道紅線（只演一次）；線一段一段露出
LAY("lump", [3.4, 2.4, X6 - 5.2, 4.0]); BOX("lumpA", "lump", X6 - 6.4, X6 - 4.2, 2.2, 4.6, -1.0, 1.0, "lump"); P({ id: "lumpB", layer: "lump", shape: "sphere", size: [0.95], pos: [X6 - 4.4, 3.2, 0.6], mat: "lump" }); P({ id: "lumpC", layer: "lump", shape: "sphere", size: [0.8], pos: [X6 - 6.2, 4.3, -0.4], mat: "lump" }); P({ id: "lumpD", layer: "lump", shape: "sphere", size: [0.7], pos: [X6 - 5.4, 3.6, 0.9], mat: "silica" });
for (let i = 0; i < 6; i++) { LAY(`scr${i}`, [2, 0.4, X6 - 3.2 + i * 1.3, 2.4]); BOX(`scrBar${i}`, `scr${i}`, X6 - 5.8 + i * 1.3, X6 - 4.2 + i * 1.3, 2.2, 2.4, -0.18, 0.18, "scratch"); }
Object.assign(anchors, { slurry: A("slBlock", [X6 + 6, 6.2, 3.4], 150, -90), grain: A("grainPress", [XB + 0.4, 6.3, 1.4], 150, 100), ox: A("oxFilm", [X6 - 5.4, 2.5, 3.4], -150, 100), bump: A("bumpHi", [XB + 2.2, 4.4, 2.0], 150, 110), lumpL: A("lump", [X6 - 4.4, 4.3, 0.8], -150, -100), scratchL: A("scr3", [X6 + 0.6, 2.3, 0.2], 150, 100) });

// ═════ S7（x＝218）：研磨液混合／循環槽組 ═════
const X7 = 218;
LAY("slBase", [24, 0.8, X7, 0.3]); LAY("slWall", [22, 16, X7, 8]); LAY("slDoor", [22, 15.4, X7, 8]); LAY("slTankA", [7, 11, X7 - 5, 6]); LAY("slLiq", [6, 7, X7 - 5, 5]); LAY("slLid", [7, 1.2, X7 - 5, 11.6]); LAY("slStir", [4, 9, X7 - 5, 7]);
LAY("slTankB", [7, 11, X7 + 5, 6]); LAY("slSed", [6, 2.4, X7 - 5, 2.8]); LAY("slPump", [4, 3, X7 + 1, 2]); LAY("slFilter", [3.4, 9, X7 + 5, 6]); LAY("slFCore", [2.4, 6, X7 + 5, 6]); LAY("slTrap", [2.4, 2, X7 + 5, 4]); LAY("slPipe", [18, 12, X7, 6]); LAY("slN2", [8, 3, X7 - 5, 11.6]);
const SLC = CAB("sl", X7, 22, 9, 16, "slBase", "slWall", "slDoor");
// 混合槽 A（攪拌）：透明槽身＋液體＋蓋（可掀）＋攪拌軸與葉片；槽底沉積的結塊
const AX = X7 - 5, BX = X7 + 5;
VT("saWall", "slTankA", 3.0, 2.9, 1.6, 11.0, "pfaT", { x: AX, z: 0 }); VC("saBot", "slTankA", 3.0, 1.4, 1.65, "dark", { x: AX, z: 0 }); VC("saLiq", "slLiq", 2.88, 1.7, 8.6, "slurry", { x: AX, z: 0 });
VT("saFoot", "slTankA", 3.2, 2.9, 0.8, 1.4, "steel2", { x: AX, z: 0 });
VC("saLidD", "slLid", 3.1, 11.0, 11.35, "steel2", { x: AX, z: 0 }); P({ id: "saLidBolt", layer: "slLid", shape: "cyl", size: [0.09, 0.16], rot: V, pos: [AX, 11.42, 0], at: RING(10, 2.75).map(([a, , b]) => [a, 0, b]), mat: "steel" });
VC("saMotor", "slLid", 0.9, 11.35, 13.4, "dark", { x: AX, z: 0 }); P({ id: "saMotorFin", layer: "slLid", shape: "tube", size: [1.0, 0.86, 0.08], rot: V, pos: [AX, 11.9, 0], at: [[0, 0, 0], [0, 0.4, 0], [0, 0.8, 0], [0, 1.2, 0]], mat: "steel" });
VC("saPortN2", "slLid", 0.25, 11.35, 12.2, "steel2", { x: AX + 2.0, z: 0 }); VC("saPortIn", "slLid", 0.25, 11.35, 12.0, "steel2", { x: AX - 2.0, z: 0 });
VC("saShaft", "slStir", 0.1, 3.4, 11.4, "steel", { x: AX, z: 0 }); P({ id: "saProp", layer: "slStir", shape: "box", size: [2.4, 0.1, 0.55], rot: [0, 0, 0], pos: [AX, 3.6, 0], mat: "steel2" }); P({ id: "saPropB", layer: "slStir", shape: "box", size: [0.55, 0.1, 2.4], pos: [AX, 3.9, 0], mat: "steel2" }); P({ id: "saHub", layer: "slStir", shape: "sphere", size: [0.3], pos: [AX, 3.75, 0], mat: "steel" });
// 結塊：槽底幾塊灰色不規則塊（與正常磨粒對比）
P({ id: "sedLump", layer: "slSed", shape: "box", size: [0.7, 0.55, 0.6], pos: [AX, 1.95, 0], at: [[-1.4, 0, 0.6], [-0.6, 0.05, -0.9], [0.7, 0, 0.9], [1.3, 0.02, -0.4], [0.2, 0.0, 0.1], [-1.9, 0, -0.3]], rot: [10, 25, 15], mat: "lump" });
P({ id: "sedLumpB", layer: "slSed", shape: "sphere", size: [0.38], pos: [AX, 2.0, 0], at: [[-0.9, 0, 0.9], [1.0, 0, -0.9], [-0.2, 0.4, -0.5], [1.7, 0, 0.5]], mat: "lump" });
// 供應槽 B
VT("sbWall", "slTankB", 3.0, 2.9, 1.6, 11.0, "pfaT", { x: BX, z: 0 }); VC("sbBot", "slTankB", 3.0, 1.4, 1.65, "dark", { x: BX, z: 0 }); VC("sbLiq", "slTankB", 2.88, 1.7, 6.2, "slurry", { x: BX, z: 0 }); VT("sbFoot", "slTankB", 3.2, 2.9, 0.8, 1.4, "steel2", { x: BX, z: 0 }); VC("sbLid", "slTankB", 3.1, 11.0, 11.35, "steel2", { x: BX, z: 0 });
P({ id: "sbBolt", layer: "slTankB", shape: "cyl", size: [0.09, 0.16], rot: V, pos: [BX, 11.42, 0], at: RING(10, 2.75).map(([a, , b]) => [a, 0, b]), mat: "steel" }); VC("sbOut", "slTankB", 0.26, 11.35, 12.4, "steel2", { x: BX, z: 0 });
// 濕氮封：槽頂淡薄霧（flow）＋氮氣管
PIPE("n2Line", "slN2", [[AX + 2.0, 12.2, 0], [AX + 2.0, 13.4, 0], [AX + 8.0, 13.4, 0], [AX + 8.0, 12.4, 0]], 0.1, "dark");
// 循環迴路：A 槽底出口 → 泵 → 迴路過濾器（垂直）→ 回 A 槽頂。過濾器可上抽。
const PP = X7 + 0.6, FF = X7 + 5.0;
P({ id: "slPmpHead", layer: "slPump", shape: "cyl", size: [0.9, 1.1], rot: V, pos: [PP, 1.9, 2.4], mat: "steel2" }); VC("slPmpMotor", "slPump", 0.9, 2.45, 3.6, "dark", { x: PP, z: 2.4 }); P({ id: "slPmpFin", layer: "slPump", shape: "tube", size: [1.0, 0.86, 0.08], rot: V, pos: [PP, 3.0, 2.4], at: [[0, 0, 0], [0, 0.3, 0], [0, 0.6, 0]], mat: "steel" });
VT("sfShell", "slFilter", 1.5, 1.38, 1.8, 9.6, "pfaT", { x: FF, z: 2.4 }); VC("sfCapB", "slFilter", 1.65, 1.4, 1.8, "steel2", { x: FF, z: 2.4 }); VC("sfCapT", "slFilter", 1.65, 9.6, 10.0, "steel2", { x: FF, z: 2.4 });
P({ id: "sfBolt", layer: "slFilter", shape: "cyl", size: [0.09, 0.16], rot: V, pos: [FF, 10.05, 2.4], at: RING(8, 1.45).map(([a, , b]) => [a, 0, b]), mat: "steel" }); VC("sfVent", "slFilter", 0.2, 10.0, 10.7, "steel2", { x: FF, z: 2.4 }); P({ id: "sfVentH", layer: "slFilter", shape: "sphere", size: [0.26], pos: [FF, 10.85, 2.4], mat: "estop" });
BOX("sfTagB", "slFilter", FF + 1.45, FF + 1.6, 4.4, 5.6, 2.1, 2.7, "warnY");
VC("sfCoreTube", "slFCore", 0.5, 2.0, 9.4, "sinter", { x: FF, z: 2.4 }); P({ id: "sfPleat", layer: "slFCore", shape: "box", size: [0.07, 6.6, 0.5], pos: [FF, 5.7, 2.4], at: Array.from({ length: 18 }, (_, i) => { const [x, z] = pol(i * 20, 0.95); return [x, 0, z]; }), mat: "pleat" });
P({ id: "sfPleatB", layer: "slFCore", shape: "box", size: [0.5, 6.6, 0.06], pos: [FF, 5.7, 2.4], at: Array.from({ length: 18 }, (_, i) => { const [x, z] = pol(i * 20 + 10, 1.0); return [x, 0, z]; }), mat: "pleat" });
VT("sfCoreCapT", "slFCore", 1.2, 0.45, 9.4, 9.6, "steel2", { x: FF, z: 2.4 }); VT("sfCoreCapB", "slFCore", 1.2, 0.45, 1.9, 2.1, "steel2", { x: FF, z: 2.4 });
P({ id: "sfTrapL", layer: "slTrap", shape: "box", size: [0.55, 0.5, 0.5], pos: [FF, 3.6, 2.4], at: [[-1.2, 0, 0.3], [0.6, 0.9, 1.2], [1.1, 0.2, -0.5], [-0.3, 1.8, -1.1]], rot: [10, 30, 15], mat: "lump" });
PIPE("sloOut", "slPipe", [[AX, 1.7, 0], [AX, 1.2, 0], [AX, 1.2, 2.4], [PP - 0.9, 1.2, 2.4]], 0.24, "pfa"); PIPE("sloA", "slPipe", [[PP + 0.9, 1.9, 2.4], [PP + 2.4, 1.9, 2.4], [PP + 2.4, 1.2, 2.4], [FF, 1.2, 2.4], [FF, 1.8, 2.4]], 0.24, "pfa");
PIPE("sloB", "slPipe", [[FF, 9.6, 2.4], [FF, 12.0, 2.4], [AX - 2.0, 12.0, 2.4], [AX - 2.0, 12.0, 0]], 0.24, "pfa");
PIPE("sloSupply", "slPipe", [[BX, 12.4, 0], [BX, 14.2, 0], [BX + 7.0, 14.2, 0], [BX + 7.0, 13.4, 0]], 0.2, "pfa");
actions.stirSpin = { type: "rotate", _說明: "攪拌槳：起轉有加速、慢速穩轉（示意）", parts: ["saShaft", "saProp", "saPropB", "saHub"], axis: [0, 1, 0], pivot: [AX, 6, 0], pivots: Object.fromEntries(["saShaft", "saProp", "saPropB", "saHub"].map((k) => [k, [AX, 6, 0]])), rps: 0.55, rampSpin: true };
actions.suspend = { type: "flow", _說明: "槽內磨粒被攪起來、均勻懸浮（淡藍白）", layer: "slLiq", path: [[AX - 2.2, 2.6, 0.3], [AX - 2.2, 7.6, 0.3], [AX + 2.2, 7.6, 0.3], [AX + 2.2, 2.6, 0.3]], n: 14, size: 0.13, shape: "dot", rate: 0.3, color: "silicaC", track: false, jitter: 0.5, free: true, rim: "steelC" };
actions.sedFlow = { type: "flow", _說明: "結塊的大顆粒（灰）被迴路從槽底抽走", layer: "slSed", path: [[AX - 1.5, 2.1, 0.5], [AX, 1.3, 0.1], [AX, 1.2, 2.4]], n: 5, size: 0.2, shape: "dot", rate: 0.25, color: "lumpC", track: false, jitter: 0.2, free: true, rim: "dark" };
actions.loopA = { type: "flow", _說明: "研磨液沿迴路：槽底 → 泵 → 過濾器 → 回槽頂", layer: "slPipe", path: [[AX, 1.7, 0], [AX, 1.2, 0], [AX, 1.2, 2.4], [PP - 0.9, 1.2, 2.4], [PP + 0.9, 1.9, 2.4], [PP + 2.4, 1.9, 2.4], [PP + 2.4, 1.2, 2.4], [FF, 1.2, 2.4], [FF, 1.8, 2.4], [FF, 9.6, 2.4], [FF, 12.0, 2.4], [AX - 2.0, 12.0, 2.4], [AX - 2.0, 12.0, 0]], n: 18, size: 0.14, shape: "dot", rate: 0.17, color: "slurryC", track: false, free: true, rim: "steelC" };
actions.n2Mist = { type: "flow", _說明: "濕氮封：槽頂液面上方淡薄霧，緩慢聚集（不等速直飛）", layer: "slN2", path: [[AX + 2.0, 13.2, 0], [AX + 2.0, 12.4, 0], [AX + 1.0, 9.6, 0.4], [AX - 0.5, 9.0, 0.2]], n: 9, size: 0.2, shape: "dot", rate: 0.18, color: "n2mistC", track: false, jitter: 0.7, free: true };
actions.catchFx = { type: "pulse", _說明: "濾芯上卡住的大顆粒微亮", parts: ["sfTrapL"], color: "warnC", glow: 0.7, steady: true, halo: 0 };
actions.sedWarn = { type: "pulse", parts: ["sedLump", "sedLumpB"], color: "warnC", glow: 0.45, steady: true, halo: 0 };
Object.assign(anchors, { stir: A("slLid", [AX, 12.6, 0.5], -150, -90), loopP: A("slPump", [PP, 3.6, 2.4], -150, 90), filt: A("slFilter", [FF + 1.5, 5.4, 2.4], 150, -100), sed: A("slSed", [AX + 1.2, 2.3, 1.0], -150, 100), tankA: A("slTankA", [AX - 3.0, 8.0, 0.6], -150, -100), trap: A("slTrap", [FF + 0.6, 4.5, 2.9], 150, 100) });

// ═════ S8（x＝258）：供應商出貨棧板（三種容器）；S9（x＝296）：研磨墊一角（預告） ═════
const X8 = 258;
LAY("palletC", [26, 9, X8, 4.5]); LAY("co0", [8, 8, X8 - 8, 4]); LAY("co1", [8, 8, X8, 4]); LAY("co2", [8, 8, X8 + 8, 4]);
BOX("cpPallet", "palletC", X8 - 13, X8 + 13, 0, 1.0, -5, 5, "wood"); P({ id: "cpSlat", layer: "palletC", shape: "box", size: [26, 0.14, 0.9], pos: [X8, 1.07, 0], at: [[0, 0, -3.8], [0, 0, -1.9], [0, 0, 0], [0, 0, 1.9], [0, 0, 3.8]], mat: "woodDark" });
P({ id: "cpFoot", layer: "palletC", shape: "box", size: [1.4, 0.8, 10], pos: [X8, 0.4, 0], at: [[-11.6, 0, 0], [0, 0, 0], [11.6, 0, 0]], mat: "woodDark" });
// 容器一：塑膠桶（藍，英特格）；容器二：大桶（深藍，中華化）；容器三：方形 IBC 桶（白，三福化）
VC("coDrumBody", "co0", 2.6, 1.1, 8.6, "drum", { x: X8 - 8, z: 0 }); VT("coDrumRib", "co0", 2.7, 2.52, 0.2, 0.5, "drumDark", { x: X8 - 8, z: 0, at: [[0, 2.0, 0], [0, 4.0, 0], [0, 6.0, 0]] }); VC("coDrumLid", "co0", 2.5, 8.6, 8.72, "drumDark", { x: X8 - 8, z: 0 }); VC("coDrumBung", "co0", 0.45, 8.72, 9.1, "dark", { x: X8 - 8 - 1.2, z: -0.8 });
BOX("coDrumBand", "co0", X8 - 8 - 2.6, X8 - 8 + 2.6, 4.3, 5.3, 2.4, 2.62, "panel"); P({ id: "coDrumStripe", layer: "co0", shape: "box", size: [4.8, 0.2, 0.05], pos: [X8 - 8, 4.9, 2.64], mat: "blueP" });
VC("coTankBody", "co1", 2.6, 1.1, 8.6, "waste", { x: X8, z: 0 }); VT("coTankRib", "co1", 2.7, 2.52, 0.2, 0.5, "dark", { x: X8, z: 0, at: [[0, 2.0, 0], [0, 4.0, 0], [0, 6.0, 0]] }); VC("coTankLid", "co1", 2.5, 8.6, 8.72, "dark", { x: X8, z: 0 }); VC("coTankBung", "co1", 0.45, 8.72, 9.1, "steel2", { x: X8 + 1.2, z: -0.8 });
BOX("coTankBand", "co1", X8 - 2.6, X8 + 2.6, 4.3, 5.3, 2.4, 2.62, "panel"); P({ id: "coTankStripe", layer: "co1", shape: "box", size: [4.8, 0.2, 0.05], pos: [X8, 4.9, 2.64], mat: "oxid" });
BOX("coIbcBody", "co2", X8 + 8 - 3.6, X8 + 8 + 3.6, 1.4, 8.6, -3.4, 3.4, "hdpeT"); BOX("coIbcLiq", "co2", X8 + 8 - 3.4, X8 + 8 + 3.4, 1.5, 6.4, -3.2, 3.2, "clean");
P({ id: "coIbcCageH", layer: "co2", shape: "box", size: [7.4, 0.14, 0.14], pos: [X8 + 8, 0, 3.5], at: Array.from({ length: 6 }, (_, i) => [0, 1.6 + i * 1.4, 0]).concat(Array.from({ length: 6 }, (_, i) => [0, 1.6 + i * 1.4, -7])), mat: "steel" });
P({ id: "coIbcCageV", layer: "co2", shape: "box", size: [0.14, 7.2, 0.14], pos: [X8 + 8, 5.0, 3.5], at: Array.from({ length: 6 }, (_, i) => [-3.6 + i * 1.44, 0, 0]).concat(Array.from({ length: 6 }, (_, i) => [-3.6 + i * 1.44, 0, -7])), mat: "steel" });
VC("coIbcCap", "co2", 0.8, 8.6, 9.0, "hdpe", { x: X8 + 8 + 1.2, z: 0 }); VC("coIbcValve", "co2", 0.45, 1.4, 2.4, "steel2", { x: X8 + 8, z: 3.9 }); BOX("coIbcBand", "co2", X8 + 8 - 3.6, X8 + 8 - 0.6, 6.7, 7.9, 3.42, 3.5, "panel"); BOX("coIbcStripe", "co2", X8 + 8 - 3.6, X8 + 8 - 0.6, 6.5, 6.7, 3.5, 3.55, "lampG");
const X9 = 298, PR = 11, PY = 1.2;
LAY("pdBase", [26, 1.6, X9, 0.8]); LAY("pdPad", [22, 0.6, X9, 1.6]); LAY("pdRing", [22, 0.3, X9, 1.9]); LAY("pdArm", [16, 9, X9, 6]); LAY("pdPuddle", [10, 0.3, X9, 1.9]);
VC("pdPlaten", "pdBase", PR + 0.6, 0.2, 1.2, "steel2", { x: X9, z: 0 }); VT("pdSplash", "pdBase", PR + 1.4, PR + 1.1, 0.2, 2.4, "pfaT", { x: X9, z: 0 }); BOX("pdTable", "pdBase", X9 - 15, X9 + 15, 0, 0.2, -13, 13, "cabDark");
VC("pdPadD", "pdPad", PR, 1.2, 1.7, "pad", { x: X9, z: 0 }); P({ id: "pdPadMark", layer: "pdPad", shape: "box", size: [PR - 0.6, 0.02, 0.5], pos: [X9 + (PR - 0.6) / 2, 1.72, 0], mat: "oxid" });
for (const [rr, i] of [[3, 0], [5, 1], [7, 2], [9, 3]]) P({ id: `pdG${i}`, layer: "pdRing", shape: "tube", size: [rr, rr - 0.1, 0.06], rot: V, pos: [X9, 1.71, 0], mat: "padDark" });
P({ id: "pdRadial", layer: "pdRing", shape: "box", size: [PR - 1.4, 0.02, 0.08], pos: [X9 + (PR - 1.2) / 2 + 0.4, 1.71, 0], mat: "padDark" });
BOX("pdArmPost", "pdArm", X9 - 14.2, X9 - 13.4, 0.2, 7.6, -11.4, -10.6, "steel2"); BOX("pdArmBar", "pdArm", X9 - 14.2, X9 - 1.0, 7.0, 7.6, -11.4, -10.6, "steel2"); BOX("pdArmBar2", "pdArm", X9 - 1.4, X9 - 0.8, 7.0, 7.6, -11.4, -3.0, "steel2");
VC("pdNozzle", "pdArm", 0.22, 4.6, 7.2, "steel", { x: X9 - 1.1, z: -3.0 }); VC("pdNozzle2", "pdArm", 0.12, 4.2, 4.6, "steel2", { x: X9 - 1.1, z: -3.0 });
PIPE("pdTube", "pdArm", [[X9 - 14.0, 6.2, -11.0], [X9 - 14.0, 8.4, -11.0], [X9 - 4.0, 8.4, -11.0], [X9 - 4.0, 8.4, -3.0], [X9 - 1.1, 8.4, -3.0], [X9 - 1.1, 7.2, -3.0]], 0.22, "pfa");
P({ id: "pdPuddle", layer: "pdPuddle", shape: "cyl", size: [1.8, 0.06], rot: V, pos: [X9 - 1.1, 1.74, -3.0], mat: "slurryS" });
actions.padSpin = { type: "rotate", _說明: "研磨墊慢轉（起轉有加速）；紅色標記條讓人看得出在轉", parts: ["pdPadD", "pdPadMark", "pdG0", "pdG1", "pdG2", "pdG3", "pdRadial"], axis: [0, 1, 0], pivot: [X9, 1.5, 0], pivots: Object.fromEntries(["pdPadD", "pdPadMark", "pdG0", "pdG1", "pdG2", "pdG3", "pdRadial"].map((k) => [k, [X9, 1.5, 0]])), rps: 0.2, rampSpin: true };
actions.padDrip = { type: "flow", _說明: "研磨液從噴嘴滴到墊上（稠，落得慢）", layer: "pdArm", path: [[X9 - 1.1, 4.0, -3.0], [X9 - 1.1, 1.9, -3.0]], n: 3, size: 0.14, shape: "liquid", band: 0.1, bandO: 0.5, rate: 0.7, color: "slurryC", track: false, accel: true, free: true };
actions.padSpread = { type: "flow", _說明: "落在墊上的研磨液隨旋轉往外甩、沿弧線流向墊邊（離心）", layer: "pdPuddle", path: [[X9 - 1.1, 1.8, -3.0], [X9 - 3.4, 1.8, -4.0], [X9 - 6.6, 1.8, -3.0], [X9 - 9.4, 1.8, 0.6]], n: 14, size: 0.12, shape: "dot", rate: 0.3, color: "slurryC", track: false, jitter: 0.35, free: true, rim: "steelC" };
actions.padRipple = { type: "wave", from: { layer: "pdPuddle", p: [X9 - 1.1, 1.76, -3.0] }, dir: [0, 1, 0], reach: 0.1, count: 2, r0: 0.5, spread: 3.0, rate: 0.5, color: "slurryC", width: 0.08 };
Object.assign(anchors, { co0: A("co0", [X8 - 8, 5.0, 2.7], -150, -90), co1: A("co1", [X8, 5.0, 2.7], 150, -110), co2: A("co2", [X8 + 8, 5.0, 3.6], 150, -90), pad: A("pdPad", [X9 + 4, 1.8, 3.0], 150, -90), nz: A("pdArm", [X9 - 1.1, 5.8, -3.0], -150, -90) });

// ═════ S4 運作動畫（液體在管線流動） ═════
const FX2 = XC + 4.0, FZ2 = -1.4;
actions.supFlow = { type: "flow", _說明: "藥液從大宗儲槽出口，沿塑膠管流向管理櫃（泵啟動後才有；先慢後穩）", layer: "loopIn", path: [[W0, 1.6, 0], [W0 + 3, 1.6, 0], [W0 + 3, 1.6, ZP], [XC - 5.5, 1.6, ZP], [XC - 5.5, 3.6, ZP], [XC - 5.5, 3.6, -4.2]], n: 12, size: 0.13, shape: "dot", rate: 0.2, color: "cleanC", track: false, drive: true, jitter: 0.06, rim: "steelC" };
actions.cdsFlow = { type: "flow", _說明: "管理櫃內：泵 → 閥島 → 過濾器 → 出口（液體沿內部細管）", layer: "cdsPipe", path: [[XC - 5.5, 3.6, -4.2], [XC - 5.5, 3.6, -1.0], [PX - 1.4, 3.6, -1.0], [PX - 1.4, 4.4, -0.2], [PX + 1.4, 4.4, 0], [PX + 1.4, 7.0, 0], [VX - 2.2, 7.0, 0], [VX - 2.2, 8.5, 0], [VX + 2.2, 8.5, 0], [VX + 2.2, 6.0, 0], [FX2, 6.0, 0], [FX2, 1.5, FZ2], [FX2, 10.0, FZ2], [FX2 + 2.7, 10.0, FZ2], [XC + 7.4, 10.0, FZ2], [XC + 7.4, 10.0, -4.2]], n: 22, size: 0.12, shape: "dot", rate: 0.16, color: "cleanC", track: false, free: true, drive: true, rim: "steelC" };
actions.pumpBeat = { type: "vibrate", _說明: "雙隔膜泵：左右泵頭一左一右交替微微抖動（泵啟動有 0.3 秒延遲，示意）", parts: ["pmpHeadL", "pmpHeadR", "pmpMid"], axis: [1, 0, 0], amp: 0.05, freq: 2.2 };
actions.pumpLed = { type: "pulse", parts: ["vlCap"], color: "lampG", glow: 1, steady: true, halo: 0 };
actions.loopFlow = { type: "flow", _說明: "迴路：藥液沿雙層管（內管流動）走到遠端，一路都在循環", layer: "loopOut", path: [[XC + 7.4, 10.0, -4.2], [XC + 7.4, 10.0, ZP], [XC + 7.4, YR, ZP], [XE, YR, ZP]], n: 40, size: 0.13, shape: "dot", rate: 0.07, color: "cleanC", track: false, drive: true, rim: "steelC" };
actions.vmFlow = { type: "flow", _說明: "閥箱：藥液從迴路分支下來，經支路閥與過濾器", layer: "vmbIn", path: [[XV, 9.4, ZP], [XV, 9.4, 0], [XV, 2.7, 0], [XV + 4.9, 2.7, 0]], n: 10, size: 0.12, shape: "dot", rate: 0.16, color: "cleanC", track: false, free: true, drive: true, rim: "steelC" };
actions.feedFlow1 = { type: "flow", _說明: "從閥箱沿使用點供料管送到機台旁供液櫃", layer: "feedL", path: [[XV + 5.0, 2.7, 0], [XV + 6.0, 2.7, 0], [XV + 6.0, 3.0, -2.5], [XD - 6.0, 3.0, -2.5], [XD - 3, 3.0, -2.5], [XD - 3, 2.4, -1.0]], n: 12, size: 0.12, shape: "dot", rate: 0.14, color: "cleanC", track: false, free: true, drive: true, rim: "steelC" };
actions.dtFill = { type: "flow", _說明: "供液櫃：從日用槽 A 抽出，經輸出泵、再沿管送往使用點過濾器", layer: "dtPump", path: [[XD - 3, 2.4, -1.0], [XD, 1.2, 1.8], [XD + 4.2, 1.2, 1.8], [XD + 4.2, 3.0, -2.5], [XD + 6.0, 3.0, -2.5]], n: 10, size: 0.12, shape: "dot", rate: 0.16, color: "cleanC", track: false, free: true, drive: true, rim: "steelC" };
actions.feedFlow2 = { type: "flow", _說明: "供液櫃 → 使用點過濾器（由下進、上出，穿過褶疊濾芯）→ 管子 → 旋轉清洗腔的噴嘴", layer: "feedL", path: [[XD + 6.0, 3.0, -2.5], [XP - 3.0, 3.0, -2.5], [XP - 3.0, 2.0, -2.5], [XP - 3.0, 2.0, 0], [XP, 2.0, 0], [XP, 8.4, 0], [XP + 3.0, 8.4, 0], [XP + 3.0, 8.4, -2.5], [XS - 3.0, 8.4, -2.5], [XS - 3.0, 6.8, -2.5], [XS - 3.0, 8.4, -2.5], [XS, 8.4, -2.5], [XS, 6.3, -2.5]], n: 18, size: 0.12, shape: "dot", rate: 0.12, color: "cleanC", track: false, free: true, drive: true, rim: "steelC" };
actions.nozzleStream = { type: "flow", _說明: "噴嘴落下的藥液細流（重力加速、落點擴散），接晶圓", layer: "scArm", path: [[XS, 6.0, -2.5], [XS, 5.1, -1.6], [XS, 4.95, 0]], n: 5, size: 0.1, shape: "liquid", band: 0.08, bandO: 0.4, rate: 1.4, color: "cleanC", track: false, accel: true, free: true };
actions.waferSpread = { type: "wave", _說明: "液膜在旋轉的晶圓上向外擴散（離心）", from: { layer: "scChuck", p: [XS, 4.95, 0] }, dir: [0, 1, 0], reach: 0.1, count: 3, r0: 0.4, spread: 2.0, rate: 0.7, color: "cleanC", width: 0.08 };
actions.scSpin = { type: "rotate", _說明: "晶圓與吸盤旋轉（起轉有加速）", parts: ["scWaferGrid", "scWaferGridB", "scPin"], axis: [0, 1, 0], pivot: [XS, 4.9, 0], pivots: Object.fromEntries(["scWaferGrid", "scWaferGridB", "scPin"].map((k) => [k, [XS, 4.9, 0]])), rps: 0.3, rampSpin: true };
actions.retFlow = { type: "flow", _說明: "回流：沒用掉的藥液沿回流管回到管理櫃，繼續循環", layer: "loopRet", path: [[XE, YB, ZP - 1.4], [XC + 5.4, YB, ZP - 1.4], [XC + 5.4, YB, -4.2]], n: 36, size: 0.11, shape: "dot", rate: 0.06, color: "cleanC", track: false, drive: true, rim: "steelC" };
actions.upwFlow = { type: "flow", _說明: "旁邊的純水管（淡藍）：只有沖洗階段才流", layer: "feedL", path: [[XP + 3.0, 9.6, -3.4], [XS + 2.0, 9.6, -3.4], [XS + 2.0, 7.2, -3.4]], n: 8, size: 0.1, shape: "dot", rate: 0.14, color: "upwC", track: false, free: true, drive: true };
actions.dtStirSpin = { type: "rotate", parts: ["dtShaft", "dtBlade", "dtBladeB"], axis: [0, 1, 0], pivot: [XD - 3, 4.5, 0], pivots: Object.fromEntries(["dtShaft", "dtBlade", "dtBladeB"].map((k) => [k, [XD - 3, 4.5, 0]])), rps: 0.5, rampSpin: true };
actions.wsLedBlink = { type: "pulse", parts: ["wsTLed"], color: "lampR", glow: 0.9, freq: 0.8, halo: 0 };
actions.tankLevel = { type: "pulse", parts: ["tkGaugeLiq"], color: "cleanC", glow: 0.6, steady: true, halo: 0 };
actions.pouLed = { type: "pulse", parts: ["pouVentH"], color: "estop", glow: 0.7, freq: 0.5, halo: 0 };
Object.assign(anchors, {
  sup: A("loopIn", [XC - 10, 1.8, ZP], 150, -90), tank: A("tankFit", [XT + 3.4, 11.0, 5.9], 150, -90), tgauge: A("tankFit", [XT + 6.4, 8.0, 0.3], 150, 90), tladder: A("tankFit", [XT - 6.5, 8.0, 0.5], -150, -100), tcpl: A("tport", [-8.3, 3.4, 0.8], -150, -90), tbund: A("berm", [XT + 9, 1.0, 7.8], 150, 100),
  cds: A("cdsBase", [XC - 8.2, 0.4, 4.7], -150, -170), cdsDoorA: A("cdsDoor", [XC - 7.8, 12.5, 4.8], -190, -90), pump: A("cdsPump", [PX, 4.9, 0.5], -150, -100), valve: A("cdsValve", [VX, 10.8, 0.8], -150, -90), cfilter: A("cdsFilter", [FX2, 11.6, FZ2 + 1.4], 150, -100), meas: A("cdsMeas", [MX, 15.8, 1.2], -150, -90), pres: A("cdsMeas", [NX, 16.0, 0.4], 150, -100), pleats: A("cdsCore", [FX2 + 1.0, 7.5, FZ2 + 0.8], 150, 90),
  loop: A("loopOut", [XC + 22, YR + 0.3, ZP], 150, -90), loopR: A("loopRet", [XC + 36, YB, ZP - 1.4], 150, 100), vmb: A("vmbBox", [XV, 8.4, 3.0], -150, -90), dtank: A("dtTank", [XD - 3, 10.8, 0.0], -150, -90), dstir: A("dtStir", [XD - 3, 12.2, 0.4], -150, -100), pou: A("pouShell", [XP + 1.5, 8.0, 0.4], 150, -100), poup: A("pouCore", [XP, 5.5, 1.0], 150, 100),
  spin: A("scChuck", [XS, 5.0, 3.0], 150, 100), nozz: A("scArm", [XS, 6.4, -2.5], -150, -100), upw: A("feedL", [XS + 2.0, 8.8, -3.4], 150, -100), waste: A("wsTank", [XW, 6.8, 1.7], 150, -90),
});

const model = {
  name: "示意 濕式化學品與研磨液的輸送與循環（爆炸分解）：大宗儲槽與卸料口、化學品管理櫃（泵、閥島、過濾器、流量計與壓力轉換器）、雙層循環管路、閥箱、供液櫃日用槽、使用點過濾器、旋轉清洗腔一角、廢液櫃；鐵管與塑膠管對照；研磨液磨粒剖面、研磨液混合與循環槽組、研磨墊一角（示意，非特定廠牌）",
  unit: "示意（1＝10 cm）",
  size: { w: 40, h: 18, r: 0.6, t: 30 },
  palette, materials,
  partNames: { tank: "大宗儲槽", cds: "化學品管理櫃", pump: "泵", valve: "閥島", cfilter: "過濾器", meas: "測量", loop: "循環迴路" },
  layers, parts, anchors, actions,
  pose: { yaw0: 0, yawIso: 0, drift: 0 },
  camera: { stand: { d: 70, elev: 24, y: 7 } },
  fx: { dpr: 1, srcPx: 30, shadows: 0, fog: false, dust: false, vaporSprites: false, shimmer: false },
  info: { FY, XT, XC, XV, XD, XP, XS, XW, XE, X1, X2, X3, X5, X6, X7, X8, X9, XB, AX, BX, FF, PX, VX, FX2, FZ2, MX, NX, ZP, YR, YB, WX, XQ, XL },
};
const out = path.join(path.dirname(new URL(import.meta.url).pathname), "model.json");
fs.writeFileSync(out, JSON.stringify(model, null, 1) + "\n");
console.log(`✔ ${out}：${parts.length} 個零件、${parts.reduce((a, p) => a + Math.max(1, (p.at?.length ?? 0)), 0)} 個實體（含複製）、${layers.length} 層`);

// 科技片零件庫的共用色票與材質（取自 tech-packaging／tech-euv 的 gen-model.mjs；名稱統一加前綴 lp_／lib_，不跟各片自己的色票撞名）。
// 用法：零件裡寫短名（例如 "steel"），展開時換成 "lib_steel"，並把用到的色票與材質補進 model.json 的 palette／materials；
//   model.json 自己已經有同名鍵時以 model.json 為準（要換色就在 model.json 的 palette 寫 lp_steel 之類的鍵）。
const M = (color, o = {}) => ({ kind: "std", color, rough: 0.5, metal: 0, ...o });
/** 色票：短名 → 色碼 */
export const LIB_PALETTE = {
  chip: "#7D8BA6", chipTop: "#93A1BC", chipEdge: "#5C6984", gridLn: "#AAB6CC",
  hbm: "#1F6F78", hbm2: "#3A939C", hbmBase: "#56767F", hbmTop: "#2A7F88",
  interposer: "#BFD0EA", rdl: "#C98A3E", tsv: "#B8742E", pad: "#D9A35C", ubump: "#F2B57A", c4: "#F08A24", ball: "#B7BFCC",
  sub: "#D8D2A4", sub2: "#C2BC8A", copper: "#C98A3E", cap: "#9C8B6E", pcb: "#2F6E55", pcbCu: "#E0A84E",
  steel: "#9AA8BE", steel2: "#7D8AA1", dark: "#3F4E6B", rail: "#5D6A82", roller: "#8B97AD", bin: "#4E5A72", binEdge: "#E0472F", hose: "#3F4E6B",
  wafer: "#B4C2DA", die: "#7FA4E0", dieBad: "#E0472F", dieHot: "#FF5A1F", chuck: "#6B7891", glass: "#BFD3F2", fin: "#B8C4D8", silicon: "#C9D6EA",
  beam: "#E5484D", beamEuv: "#8B5CF6", sensor: "#2E3C5C", lens: "#9EC3E8", blade: "#D5DCE8", bladeEdge: "#E0472F",
  maskc: "#1F3A6B", stageC: "#8FA3C4", mirror: "#E8B04A", facet: "#F2C266", frame: "#F2A93B", water: "#7CD4FF",
  good: "#14A38B", bad: "#E0472F", proc: "#FF9F1C", sig: "#38B6FF", sigRim: "#1F6FEB", melt: "#FF5A1F", heat: "#FF7A2F",
};
/** 材質：短名 → 材質定義（color 是色票短名；展開時換成 lp_ 前綴） */
export const LIB_MAT = {
  chip: M("chip", { rough: 0.35, metal: 0.55, env: 0.5 }), chipTop: M("chipTop", { rough: 0.3, metal: 0.6, env: 0.6 }), chipEdge: M("chipEdge", { rough: 0.4, metal: 0.5 }),
  gridLn: { kind: "unlit", color: "gridLn" },
  hbm: M("hbm", { rough: 0.35 }), hbm2: M("hbm2", { rough: 0.35 }), hbmBase: M("hbmBase", { rough: 0.4 }), hbmTop: M("hbmTop", { rough: 0.3, metal: 0.3 }),
  interposer: { kind: "phys", color: "interposer", rough: 0.12, metal: 0, clearcoat: 0.8, opacity: 0.62, env: 0.6 },
  rdl: M("rdl", { rough: 0.3, metal: 0.9, env: 0.6 }), tsv: M("tsv", { rough: 0.3, metal: 0.9 }), pad: M("pad", { rough: 0.3, metal: 0.9 }),
  ubump: M("ubump", { rough: 0.3, metal: 0.7 }), c4: M("c4", { rough: 0.3, metal: 0.6 }), ball: M("ball", { rough: 0.18, metal: 0.95, env: 0.9 }),
  sub: M("sub", { rough: 0.7 }), sub2: M("sub2", { rough: 0.7 }), copper: M("copper", { rough: 0.3, metal: 0.9 }), cap: M("cap", { rough: 0.5 }),
  pcb: M("pcb", { rough: 0.6 }), pcbCu: M("pcbCu", { rough: 0.3, metal: 0.9 }),
  steel: M("steel", { rough: 0.3, metal: 0.85, env: 0.5 }), steel2: M("steel2", { rough: 0.35, metal: 0.8 }), dark: M("dark", { rough: 0.5, metal: 0.2 }),
  rail: M("rail", { rough: 0.5, metal: 0.3 }), roller: M("roller", { rough: 0.3, metal: 0.8 }), bin: M("bin", { rough: 0.6 }), binEdge: M("binEdge", { rough: 0.5 }), hose: M("hose", { rough: 0.6 }),
  wafer: { kind: "phys", color: "wafer", rough: 0.1, metal: 0.4, clearcoat: 1, env: 0.8 }, chuck: M("chuck", { rough: 0.5, metal: 0.4 }),
  die: M("die", { rough: 0.25, metal: 0.5, tex: "traces", texScale: 0.5, env: 0.8 }), dieBad: M("dieBad", { rough: 0.4, metal: 0.2 }),
  glass: { kind: "phys", color: "glass", rough: 0.15, metal: 0, clearcoat: 0.8, opacity: 0.3, env: 0.4 },
  fin: M("fin", { rough: 0.3, metal: 0.9, env: 0.7 }), silicon: M("silicon", { rough: 0.3, metal: 0.5 }),
  beam: { kind: "unlit", color: "beam", opacity: 0.55 }, beamEuv: { kind: "unlit", color: "beamEuv", opacity: 0.55 },
  sensor: M("sensor", { rough: 0.35, metal: 0.4 }), lens: { kind: "phys", color: "lens", rough: 0.05, metal: 0, clearcoat: 1, opacity: 0.55, env: 0.6 },
  mask: M("maskc", { rough: 0.2, metal: 0.7, tex: "traces", texScale: 1.2, env: 0.8 }), stage: M("stageC", { rough: 0.4, metal: 0.5 }),
  mirror: M("mirror", { rough: 0.12, metal: 0.95, env: 1.4 }), facet: M("facet", { rough: 0.15, metal: 0.9, env: 1.2 }),
  frame: { kind: "unlit", color: "frame" }, water: { kind: "unlit", color: "water", opacity: 0.8 },
  blade: M("blade", { rough: 0.2, metal: 0.9, env: 0.8 }), bladeEdge: M("bladeEdge", { rough: 0.4, metal: 0.3 }),
};
export const P_ = "lp_", M_ = "lib_";
/** 把用到的短名材質（含它們的色票）補進 model；model 自己已有的鍵不動 */
export const mergeLib = (model, used) => {
  model.palette ??= {}; model.materials ??= {};
  for (const short of used) {
    const def = LIB_MAT[short]; if (!def) continue;
    if (!model.materials[M_ + short]) model.materials[M_ + short] = { ...def, color: P_ + def.color };
    const pk = P_ + def.color;
    if (!model.palette[pk]) model.palette[pk] = LIB_PALETTE[def.color];
  }
  // 動作用到的色票（good／bad／proc／sig／sigRim／melt／heat）只在被引用時才補
  return model;
};
export const mergeColors = (model, names) => { model.palette ??= {}; for (const n of names) if (LIB_PALETTE[n] && !model.palette[P_ + n]) model.palette[P_ + n] = LIB_PALETTE[n]; };

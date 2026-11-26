// node videos/tech-tel/gen-model.mjs → 寫 videos/tech-tel/model.json
// 2026/11/26 tech-tel（設備五大-4：東京威力科創，主軸＝批次直立爐管；副軸＝塗佈顯影一段）。構造與物理照 physics-spec.md 第 1b／2B 節、模組清單照 visual-spec.md。
// 單位：1＝10 cm（晶圓直徑 300 mm＝3），地板 y＝0，x 向右、z 向觀眾。配置與比例是示意（立式爐通用專利構造），不仿特定機型；TELINDY PLUS 的管徑、分區數、溫度官方未公開。
// 爐管（x＝0、z＝0）：上半＝分區加熱器（左右兩半殼，爆炸分解往兩側掀開；剖開＝右半隱藏）＋外石英管（頂封）＋內石英管（頂開）＋側壁多孔噴氣管＋不鏽鋼歧管（進氣口、排氣口）；
//   下半＝裝載區：晶舟（石英三根支柱，100 格，片距示意）＋保溫座＋密封蓋＋晶舟旋轉馬達＋晶舟升降機（滾珠螺桿柱）＋爐口擋板；
//   晶圓搬運手臂（model.kin.rb：垂直升降 z → 旋轉 th → 直線伸出 ex，一次五支叉片）＋晶圓盒開門台（FOUP opener）＋晶圓盒儲存架；
//   外圍：氣體櫃（MFC 一排）、排氣管＋乾式真空泵、溫控器櫃（五區）、控制螢幕、塔燈、正面銘板（TEL LOGO 原檔）。
// 塗佈顯影（x＝30）：塗佈杯＋旋轉吸盤＋晶圓＋光阻噴嘴臂＋光阻滴下／鋪開／甩出、熱板堆疊、機櫃與觀察窗。
// 膜厚放大展示台（x＝−18）：三片晶圓剖面，上下兩面一層層長膜（放大示意）。
import fs from "node:fs";
import path from "node:path";

const R2 = (x) => Math.round(x * 1000) / 1000;
const R4 = (x) => Math.round(x * 10000) / 10000;
const D2R = Math.PI / 180;
const pol = (aDeg, r) => [R2(r * Math.cos(aDeg * D2R)), R2(r * Math.sin(aDeg * D2R))]; // (x, z)
const V = [90, 0, 0];

const palette = {
  floorC: "#C9D2DE", panel: "#F3F5F8", panel2: "#E2E8F0", seam: "#8E9BB0", band: "#24324C", steel: "#7D8CA6", steel2: "#A9B5C7", dark: "#3E4A60",
  heatC: "#D7DCE4", insul: "#F1E9D8", quartzC: "#D8ECF7", quartzE: "#9CC9E6", waferC: "#C9D1D9", injC: "#F4FAFF", coilHot: "#F08A3C", hotY: "#FFC247",
  lampY: "#F2B632", lampG: "#2FBF71", lampR: "#E5484D", screen: "#5B8DEF", pipeB: "#3E7BD6", pipeR: "#D9534F", foupC: "#D6DEE8",
  gasC: "#7FE3E6", exhC: "#A99BC4", heatP: "#F5873B", filmC: "#2FBF9F", resistC: "#C9772E", resistL: "#E7A65A", cupC: "#EEF1F5", rubber: "#2B2F36", rodC: "#9FB8C4", pcbC: "#1F7A4A", chipC: "#1B1E24", goldC: "#D4A537", connC: "#EDEDE6", cableC: "#7A7F88", ceramC: "#EFEBE2",
};
const M = (kind, color, o = {}) => ({ kind, color, ...o });
const materials = {
  floor: M("std", "floorC", { rough: 0.7, metal: 0.3, tex: "brushed", texScale: 3 }),
  panel: M("std", "panel", { rough: 0.55, metal: 0.05, env: 0.25 }), panel2: M("std", "panel2", { rough: 0.6, metal: 0.05, env: 0.2 }),
  seam: M("std", "seam", { rough: 0.6, metal: 0.3 }), band: M("std", "band", { rough: 0.4, metal: 0.3, env: 0.4 }),
  steel: M("std", "steel", { rough: 0.35, metal: 0.85, env: 0.5 }), steel2: M("std", "steel2", { rough: 0.3, metal: 0.8, env: 0.6, tex: "brushed", texScale: 2 }),
  dark: M("std", "dark", { rough: 0.5, metal: 0.4, env: 0.3 }),
  heater: M("std", "heatC", { rough: 0.45, metal: 0.5, env: 0.4, tex: "brushed", texScale: 2 }), insul: M("std", "insul", { rough: 0.9, metal: 0 }),
  zone: M("std", "coilHot", { emissive: "coilHot", ei: 0.3, rough: 0.6, metal: 0.2 }), inj: M("phys", "injC", { rough: 0.1, metal: 0, clearcoat: 1, opacity: 0.92, env: 0.6 }),
  quartz: M("phys", "quartzC", { rough: 0.05, metal: 0, clearcoat: 1, opacity: 0.22, env: 0.6 }),
  quartzE: M("phys", "quartzE", { rough: 0.05, metal: 0, clearcoat: 1, opacity: 0.55, env: 0.6 }),
  rod: M("phys", "rodC", { rough: 0.1, metal: 0, clearcoat: 1, opacity: 0.95, env: 0.7, emissive: "rodC", ei: 0.12 }),
  quartzRod: M("phys", "quartzC", { rough: 0.05, metal: 0, clearcoat: 1, opacity: 0.85, env: 0.7 }),
  wafer: M("phys", "waferC", { rough: 0.15, metal: 0.6, clearcoat: 0.9, env: 0.9 }), waferB: M("std", "waferC", { rough: 0.55, metal: 0.2, env: 0.25 }),
  lampY: M("std", "lampY", { emissive: "lampY", ei: 0.4, rough: 0.4, metal: 0 }), lampG: M("std", "lampG", { emissive: "lampG", ei: 0.3, rough: 0.4, metal: 0 }),
  lampR: M("std", "lampR", { emissive: "lampR", ei: 0.2, rough: 0.4, metal: 0 }),
  screen: M("std", "screen", { emissive: "screen", ei: 0.5, rough: 0.3, metal: 0 }), pipeB: M("std", "pipeB", { rough: 0.35, metal: 0.6, env: 0.4 }), pipeR: M("std", "pipeR", { rough: 0.35, metal: 0.6, env: 0.4 }),
  foup: M("phys", "foupC", { rough: 0.35, metal: 0, clearcoat: 0.4, env: 0.3 }), foupShell: M("phys", "foupC", { rough: 0.3, metal: 0, clearcoat: 0.4, opacity: 0.55, env: 0.3 }),
  film: M("std", "filmC", { rough: 0.5, metal: 0, emissive: "filmC", ei: 0.15 }), resist: M("phys", "resistC", { rough: 0.2, metal: 0, clearcoat: 0.9, env: 0.6 }),
  resistL: M("phys", "resistL", { rough: 0.2, metal: 0, clearcoat: 0.9, opacity: 0.85, env: 0.6 }), cup: M("std", "cupC", { rough: 0.4, metal: 0.1, env: 0.3 }),
  win: M("phys", "quartzC", { rough: 0.05, metal: 0, clearcoat: 1, opacity: 0.18, env: 0.4 }), rubber: M("std", "rubber", { rough: 0.9, metal: 0 }),
  pcb: M("std", "pcbC", { rough: 0.6, metal: 0.05 }), chip: M("std", "chipC", { rough: 0.4, metal: 0.2 }), gold: M("std", "goldC", { rough: 0.3, metal: 0.9, env: 0.6 }),
  conn: M("std", "connC", { rough: 0.5, metal: 0 }), cable: M("std", "cableC", { rough: 0.8, metal: 0 }), ceramic: M("std", "ceramC", { rough: 0.5, metal: 0, env: 0.2 }),
  ledG: M("std", "lampG", { emissive: "lampG", ei: 0.8, rough: 0.3, metal: 0 }), ledY: M("std", "lampY", { emissive: "lampY", ei: 0.8, rough: 0.3, metal: 0 }),
  t_tel: { kind: "unlit", color: "#FFFFFF", img: "tex/brand/sign-tel.png" },
};
const parts = [], layers = [], anchors = {}, actions = {};
const P = (o) => { parts.push(o); return o; };
const SEG = (o, ax, n) => {  // 長條拆段（關節鏈穿模檢查用包圍盒）
  const L = o.size[ax], l = L / n, base = o.at ?? [[0, 0, 0]], at = [];
  for (const b of base) for (let i = 0; i < n; i++) { const u = (i - (n - 1) / 2) * l; const d = [0, 0, 0]; d[ax] = u; at.push([R2((b[0] ?? 0) + d[0]), R2((b[1] ?? 0) + d[1]), R2((b[2] ?? 0) + d[2])]); }
  const size = [...o.size]; size[ax] = R2(l * 1.04);
  return P({ ...o, size, at });
};
const LAY = (id, outline, bg) => layers.push({ id, z: 0, k: 0, outline, ...(bg ? { bg: true } : {}) });
const ring = (n, r, a0 = 0, y = 0) => Array.from({ length: n }, (_, i) => { const [x, z] = pol(a0 + (i * 360) / n, r); return [x, y, z]; });
// 半環（俯視扇形環，poly 以 rot V 立起來：形狀的 v 對到世界 z）
const arcPts = (r0, r1, a0, a1, n = 24) => {
  const o = [], q = [];
  for (let i = 0; i <= n; i++) { const a = a0 + ((a1 - a0) * i) / n; o.push(pol(a, r1)); q.push(pol(a, r0)); }
  return [...o, ...q.reverse()];
};

// ═════ 地板 ═════
LAY("floor", [110, 2, 4, -0.3], true);
P({ id: "floor", layer: "floor", shape: "slab", size: [110, 0.5, 60], r: 0.2, pos: [6, -0.25, 0], mat: "floor" });
P({ id: "floorSeam", layer: "floor", shape: "slab", size: [110, 0.04, 0.1], pos: [6, 0.01, 0], at: Array.from({ length: 10 }, (_, i) => [0, 0, -27 + i * 6]), mat: "seam" });

// ═════ 爐管尺寸 ═════
const DECK = 13.0;                         // 裝載區頂板（爐體下緣）
const HY0 = 13.6, HY1 = 26.0, HR0 = 2.95, HR1 = 4.2;   // 加熱器
const OT = { r: 2.6, y0: 13.3, y1: 25.2 }, IT = { r: 2.15, y0: 13.4, y1: 24.3 };  // 外管（頂封）、內管（頂開）
const WT = 0.02, PITCH = 0.08, NSLOT = 125, BY0 = 2.8;  // 晶舟：125 格（physics-spec 1b，二手型錄），片距示意 8 mm（晶圓盒與叉片同片距）
const LIFT = 11.0;                         // 晶舟升降行程（裝載位置 → 製程位置）
const GAP = [105, 109];                      // 這次手臂要補進去的五格
const slotY = (k) => R2(BY0 + k * PITCH);
const ZONES = 5, ZH = (HY1 - HY0 - 0.8) / ZONES;
const zoneY = (i) => R2(HY0 + 0.4 + ZH * (i + 0.5));

// ── 裝載區機架（後牆、左牆、頂板四塊，正面敞開看得到裡面）──
LAY("lae", [18, 13, 2, 6.5]);
P({ id: "laeBack", layer: "lae", shape: "box", size: [21, 13, 0.3], pos: [3.2, 6.5, -5.6], mat: "panel2" });
P({ id: "laeBackRib", layer: "lae", shape: "box", size: [0.25, 13, 0.2], pos: [0, 6.5, -5.4], at: [[-6, 0, 0], [-2, 0, 0], [2, 0, 0], [8, 0, 0], [12, 0, 0]], mat: "seam" });
P({ id: "laeLeft", layer: "lae", shape: "box", size: [0.3, 13, 11.2], pos: [-7.2, 6.5, 0], mat: "panel" });
P({ id: "laePost", layer: "lae", shape: "box", size: [0.4, 13, 0.4], pos: [0, 6.5, 5.4], at: [[-7.2, 0, 0], [13.6, 0, 0]], mat: "steel" });
P({ id: "deckL", layer: "lae", shape: "box", size: [4.2, 0.5, 11.2], pos: [-5.1, DECK, 0], mat: "panel2" });
P({ id: "deckR", layer: "lae", shape: "box", size: [10.6, 0.5, 11.2], pos: [8.3, DECK, 0], mat: "panel2" });
P({ id: "deckB", layer: "lae", shape: "box", size: [6, 0.5, 2.6], pos: [0, DECK, -4.3], mat: "panel2" });
P({ id: "deckF", layer: "lae", shape: "box", size: [6, 0.5, 2.6], pos: [0, DECK, 4.3], mat: "panel2" });
P({ id: "deckEdge", layer: "lae", shape: "box", size: [21, 0.35, 0.3], pos: [3.2, DECK + 0.4, 5.55], mat: "band" });
P({ id: "laeBase", layer: "lae", shape: "box", size: [21, 0.4, 11.2], pos: [3.2, 0.2, 0], mat: "band" });
P({ id: "laeSeam", layer: "lae", shape: "box", size: [0.06, 12.6, 0.06], pos: [0, 6.5, -5.42], at: [-4, 0, 4, 10].map((x) => [x, 0, 0]), mat: "seam" });   // 大面板接縫
P({ id: "laeSeamH", layer: "lae", shape: "box", size: [20.6, 0.06, 0.06], pos: [3.2, 0, -5.42], at: [[0, 4.4, 0], [0, 8.8, 0]], mat: "seam" });
P({ id: "laeScrew", layer: "lae", shape: "cyl", size: [0.06, 0.04], rot: [0, 0, 0], pos: [0, 0, -5.42], at: [-6.8, -4, 0, 4, 10, 13.2].flatMap((x) => [0.5, 4.4, 8.8, 12.5].map((y) => [x, y, 0])), mat: "dark" });
P({ id: "laeLScrew", layer: "lae", shape: "cyl", size: [0.06, 0.04], rot: [0, 90, 0], pos: [-7.03, 0, 0], at: [0.6, 4.4, 8.8, 12.4].flatMap((y) => [-5, -2, 2, 5].map((z) => [0, y, z])), mat: "dark" });
P({ id: "laeFilter", layer: "lae", shape: "box", size: [0.25, 8, 6], pos: [-7.0, 6.5, -1], mat: "panel" });   // 側牆潔淨氣流過濾面（平面，不露風扇）
P({ id: "laeFilterGrid", layer: "lae", shape: "box", size: [0.1, 0.06, 5.8], pos: [-6.85, 0, -1], at: Array.from({ length: 9 }, (_, i) => [0, 2.9 + i * 0.9, 0]), mat: "seam" });

// ── 上半部機殼（包住加熱器與石英管；全景鏡頭才出現）──
const UY0 = DECK + 0.25, UY1 = 28.8, UH = UY1 - UY0, UC = (UY0 + UY1) / 2;
LAY("upper", [21, UH, 3.2, UC]);
P({ id: "upBack", layer: "upper", shape: "box", size: [21, UH, 0.3], pos: [3.2, UC, -5.6], mat: "panel2" });
P({ id: "upSide", layer: "upper", shape: "box", size: [0.3, UH, 11.2], pos: [0, UC, 0], at: [[-7.2, 0, 0], [13.6, 0, 0]], mat: "panel" });
P({ id: "upFront", layer: "upper", shape: "box", size: [21, UH, 0.3], pos: [3.2, UC, 5.6], mat: "panel" });
P({ id: "upSeam", layer: "upper", shape: "box", size: [0.12, UH, 0.08], pos: [0, UC, 5.78], at: [-2.0, 3.2, 8.4].map((x) => [x, 0, 0]), mat: "seam" });
P({ id: "upHandle", layer: "upper", shape: "box", size: [0.2, 2.4, 0.2], pos: [0, UC, 5.85], at: [[-2.5, 0, 0], [2.7, 0, 0], [8.0, 0, 0]], mat: "steel" });
P({ id: "upTop", layer: "upper", shape: "box", size: [21.4, 0.4, 11.6], pos: [3.2, UY1 + 0.2, 0], mat: "panel2" });
P({ id: "upDuct", layer: "upper", shape: "cyl", size: [0.9, 1.6], rot: V, pos: [0, UY1 + 1.2, -2.5], mat: "steel2" });
P({ id: "upBand", layer: "upper", shape: "box", size: [21.2, 0.5, 0.3], pos: [3.2, UY1 - 0.6, 5.8], mat: "band" });
P({ id: "upVent", layer: "upper", shape: "box", size: [3.2, 0.08, 0.1], pos: [10.6, 0, 5.8], at: Array.from({ length: 6 }, (_, i) => [0, R2(16 + i * 0.4), 0]), mat: "seam" });

// ── 加熱器：左右兩半殼（外殼＋保溫層內面＋五區加熱線圈帶＋分區接線盒＋冷卻夾套環）──
const HC = (HY0 + HY1) / 2, HH = HY1 - HY0;
const heaterHalf = (key, a0, a1, side) => {
  const lay = `heat${key}`; LAY(lay, [HR1 * 1.2, HH, side * 2, HC]);
  P({ id: `${lay}Shell`, layer: lay, shape: "poly", pts: arcPts(HR1 - 0.25, HR1, a0, a1), size: [1, 1, HH], rot: V, pos: [0, HC, 0], mat: "heater" });
  P({ id: `${lay}Ins`, layer: lay, shape: "poly", pts: arcPts(HR0 + 0.12, HR1 - 0.25, a0, a1), size: [1, 1, HH - 0.2], rot: V, pos: [0, HC, 0], mat: "insul" });
  P({ id: `${lay}Jkt`, layer: lay, shape: "poly", pts: arcPts(HR1, HR1 + 0.18, a0, a1), size: [1, 1, 0.45], rot: V, pos: [0, 0, 0], at: [[0, HY0 + 0.4, 0], [0, HY1 - 0.4, 0]], mat: "steel" });
  P({ id: `${lay}Seam`, layer: lay, shape: "poly", pts: arcPts(HR1, HR1 + 0.06, a0, a1), size: [1, 1, 0.08], rot: V, pos: [0, 0, 0], at: Array.from({ length: ZONES - 1 }, (_, i) => [0, R2(HY0 + 0.4 + ZH * (i + 1)), 0]), mat: "seam" });
  for (let i = 0; i < ZONES; i++)   // 加熱線圈帶（保溫層內面，五區各一段；剖開後看得到）
    P({ id: `${lay}Z${i}`, layer: lay, shape: "poly", pts: arcPts(HR0 - 0.08, HR0 + 0.12, a0 + 3, a1 - 3), size: [1, 1, R2(ZH - 0.25)], rot: V, pos: [0, zoneY(i), 0], mat: "zone" });
  P({ id: `${lay}Coil`, layer: lay, shape: "poly", pts: arcPts(HR0 - 0.16, HR0 - 0.06, a0 + 3, a1 - 3), size: [1, 1, 0.09], rot: V, pos: [0, 0, 0], at: Array.from({ length: 40 }, (_, i) => [0, R2(HY0 + 0.6 + i * ((HH - 1.2) / 39)), 0]), mat: "zone" });
};
heaterHalf("L", 90, 270, -1); heaterHalf("R", -90, 90, 1);
LAY("heatTop", [9, 1, 0, HY1 + 0.6]);
P({ id: "heatTop", layer: "heatTop", shape: "cyl", size: [HR1 + 0.1, 0.9], rot: V, pos: [0, HY1 + 0.45, 0], mat: "heater" });
P({ id: "heatTopVent", layer: "heatTop", shape: "cyl", size: [0.7, 0.6], rot: V, pos: [0, HY1 + 1.1, 0], mat: "steel" });
P({ id: "heatTopBolt", layer: "heatTop", shape: "cyl", size: [0.12, 0.25], rot: V, pos: [0, HY1 + 0.95, 0], at: ring(12, HR1 - 0.4), mat: "dark" });
// 分區接線盒（右半外側，五區各一個）＋熱電偶套管（沿管外側一根）
P({ id: "heatRBox", layer: "heatR", shape: "box", size: [0.8, 1.1, 1.2], pos: [HR1 + 0.55, 0, 0.6], at: Array.from({ length: ZONES }, (_, i) => [0, zoneY(i), 0]), mat: "band" });
P({ id: "heatRBoxLed", layer: "heatR", shape: "cyl", size: [0.12, 0.08], rot: [0, 90, 0], pos: [HR1 + 0.98, 0, 0.6], at: Array.from({ length: ZONES }, (_, i) => [0, zoneY(i) + 0.3, 0]), mat: "lampG" });
P({ id: "heatRCable", layer: "heatR", shape: "box", size: [0.18, HH - 1, 0.18], pos: [HR1 + 0.75, HC, 1.35], mat: "rubber" });
P({ id: "heatLTc", layer: "heatL", shape: "cyl", size: [0.1, HH - 0.6], rot: V, pos: [-(HR0 + 0.06), HC, -0.9], mat: "steel2" });

// ── 石英管＋歧管＋噴氣管 ──
LAY("otube", [OT.r * 2.2, OT.y1 - OT.y0 + 1, 0, (OT.y0 + OT.y1) / 2]);
P({ id: "otube", layer: "otube", shape: "tube", size: [OT.r, OT.r - 0.08, R2(OT.y1 - OT.y0)], rot: V, pos: [0, R2((OT.y0 + OT.y1) / 2), 0], mat: "quartz" });
P({ id: "otubeDome", layer: "otube", shape: "cyl", size: [OT.r, 0.14], rot: V, pos: [0, OT.y1 + 0.07, 0], mat: "quartz" });
P({ id: "otubeEdge", layer: "otube", shape: "tube", size: [OT.r + 0.02, OT.r - 0.1, 0.05], rot: V, pos: [0, 0, 0], at: [[0, OT.y0 + 0.4, 0], [0, OT.y1 - 0.1, 0]], mat: "quartzE" });
P({ id: "otubeFlange", layer: "otube", shape: "tube", size: [OT.r + 0.35, OT.r - 0.08, 0.2], rot: V, pos: [0, OT.y0 + 0.1, 0], mat: "quartzE" });
LAY("itube", [IT.r * 2.2, IT.y1 - IT.y0 + 1, 0, (IT.y0 + IT.y1) / 2]);
P({ id: "itube", layer: "itube", shape: "tube", size: [IT.r, IT.r - 0.07, R2(IT.y1 - IT.y0)], rot: V, pos: [0, R2((IT.y0 + IT.y1) / 2), 0], mat: "quartz" });
P({ id: "itubeEdge", layer: "itube", shape: "tube", size: [IT.r + 0.02, IT.r - 0.09, 0.05], rot: V, pos: [0, 0, 0], at: [[0, IT.y0 + 0.2, 0], [0, IT.y1 - 0.03, 0]], mat: "quartzE" });
const INJ = pol(145, 1.86);   // 噴氣管：內管與晶圓邊緣之間，前左方（爐管鏡頭看得到）
P({ id: "itubeInj", layer: "itube", shape: "cyl", size: [0.15, R2(IT.y1 - IT.y0 - 0.6)], rot: V, pos: [INJ[0], R2((IT.y0 + IT.y1) / 2 - 0.3), INJ[1]], mat: "inj" });
const HOLE0 = R2(BY0 + LIFT + PITCH * 8.5), HOLEP = R2(PITCH * 8);   // 小孔高度＝製程位置的晶圓間隙（每 8 片一孔）
P({ id: "itubeInjHole", layer: "itube", shape: "sphere", size: [0.06], pos: [R2(INJ[0] + 0.12), 0, R2(INJ[1] - 0.08)], at: Array.from({ length: 15 }, (_, i) => [0, R2(HOLE0 + i * HOLEP), 0]), mat: "dark" });
LAY("mani", [7, 0.8, 0, DECK + 0.2]);
P({ id: "mani", layer: "mani", shape: "tube", size: [3.05, OT.r - 0.1, 0.5], rot: V, pos: [0, DECK - 0.05, 0], mat: "steel2" });
P({ id: "maniBolt", layer: "mani", shape: "cyl", size: [0.1, 0.62], rot: V, pos: [0, DECK - 0.05, 0], at: ring(18, 2.85), mat: "dark" });
P({ id: "maniIn", layer: "mani", shape: "cyl", size: [0.16, 4.0], rot: [0, 90, 0], pos: [-3.69, DECK - 0.1, INJ[1]], mat: "steel" });           // 進氣口（左）
P({ id: "maniInV", layer: "mani", shape: "box", size: [0.4, 0.4, 0.5], pos: [-5.0, DECK - 0.1, INJ[1]], mat: "band" });
P({ id: "maniEx", layer: "mani", shape: "cyl", size: [0.32, 3.4], rot: [0, 0, 0], pos: [1.3, DECK - 0.1, -4.2], mat: "steel2" });   // 排氣口（往後）
// ── 爐口擋板（晶舟在下面時蓋住爐口，升起前滑開）──
LAY("shut", [6.4, 0.3, 0, DECK - 0.55]);
P({ id: "shut", layer: "shut", shape: "box", size: [6.2, 0.18, 6.2], pos: [0, DECK - 0.5, 0], mat: "steel" });
P({ id: "shutRail", layer: "shut", shape: "box", size: [0.2, 0.2, 6.6], pos: [0, DECK - 0.62, 0], at: [[-3.0, 0, 0], [3.0, 0, 0]], mat: "dark" });

// ── 晶舟＋保溫座＋密封蓋（裝載位置；升降時這幾層一起往上 LIFT）──
LAY("boat", [3.6, 10.4, 0, 7.8]); LAY("bgap", [3.2, 0.6, 0, slotY(87)]); LAY("cap", [6.2, 2, 0, 1.6]);
P({ id: "boatRod", layer: "boat", shape: "cyl", size: [0.22, R2(NSLOT * PITCH + 0.3)], rot: V, pos: [0, R2(BY0 + (NSLOT * PITCH) / 2 - 0.1), 0],
   at: [180, 90, 270].map((a) => { const [x, z] = pol(a, 1.8); return [x, 0, z]; }), mat: "rod" });
P({ id: "boatGroove", layer: "boat", shape: "tube", size: [0.27, 0.21, 0.03], rot: V, pos: [0, 0, 0], at: [180, 90, 270].flatMap((a) => { const [x, z] = pol(a, 1.8); return [0, 30, 60, 90, 120].map((k) => [x, slotY(k) - PITCH / 2, z]); }), mat: "quartzE" });
P({ id: "boatPlate", layer: "boat", shape: "cyl", size: [1.95, 0.14], rot: V, pos: [0, 0, 0], at: [[0, BY0 - 0.2, 0], [0, slotY(NSLOT - 1) + 0.2, 0]], mat: "quartzE" });
const filled = [...Array(NSLOT).keys()].filter((k) => k < GAP[0] || k > GAP[1]);
P({ id: "boatW", layer: "boat", shape: "cyl", size: [1.5, WT], rot: V, pos: [0, 0, 0], at: filled.map((k) => [0, slotY(k), 0]), mat: "waferB" });
P({ id: "boatWEdge", layer: "boat", shape: "tube", size: [1.5, 1.1, R2(WT + 0.006)], rot: V, pos: [0, 0, 0], at: filled.map((k) => [0, slotY(k), 0]), mat: "waferB" });   // 晶圓外圈（加熱時先亮，熱從邊緣往中心）
P({ id: "bgapW", layer: "bgap", shape: "cyl", size: [1.5, WT], rot: V, pos: [0, 0, 0], at: [...Array(5).keys()].map((i) => [0, slotY(GAP[0] + i), 0]), mat: "wafer" });
P({ id: "capIns", layer: "cap", shape: "cyl", size: [1.6, 1.0], rot: V, pos: [0, 2.05, 0], mat: "quartzE" });                     // 保溫座（石英鰭片）
P({ id: "capFin", layer: "cap", shape: "cyl", size: [1.7, 0.05], rot: V, pos: [0, 0, 0], at: Array.from({ length: 6 }, (_, i) => [0, R2(1.65 + i * 0.16), 0]), mat: "quartzRod" });
P({ id: "capSeal", layer: "cap", shape: "cyl", size: [3.0, 0.35], rot: V, pos: [0, 1.35, 0], mat: "steel2" });                     // 密封蓋
P({ id: "capOring", layer: "cap", shape: "tube", size: [2.9, 2.72, 0.06], rot: V, pos: [0, 1.55, 0], mat: "rubber" });
P({ id: "capMotor", layer: "cap", shape: "cyl", size: [0.7, 0.7], rot: V, pos: [0, 0.85, 0], mat: "dark" });                        // 晶舟旋轉馬達
// ── 晶舟升降機（左後方滾珠螺桿柱＋滑座＋托臂）──
LAY("elevCol", [1.4, 13, -5.2, 6.5]); LAY("elev", [6, 1, -2.6, 1.0]);
P({ id: "elevCol", layer: "elevCol", shape: "box", size: [0.9, 12.4, 0.9], pos: [-5.4, 6.6, -3.6], mat: "steel" });
P({ id: "elevScrew", layer: "elevCol", shape: "cyl", size: [0.2, 11.6], rot: V, pos: [-4.7, 7.0, -3.6], mat: "steel2" });
P({ id: "elevThread", layer: "elevCol", shape: "tube", size: [0.24, 0.19, 0.06], rot: V, pos: [-4.7, 0, -3.6], at: Array.from({ length: 36 }, (_, i) => [0, R2(1.6 + i * 0.32), 0]), mat: "dark" });   // 螺紋
P({ id: "elevMotor", layer: "elevCol", shape: "box", size: [0.9, 0.9, 0.9], pos: [-4.7, 0.5, -3.6], mat: "dark" });
P({ id: "elevMotorFin", layer: "elevCol", shape: "box", size: [0.95, 0.05, 0.95], pos: [-4.7, 0, -3.6], at: Array.from({ length: 5 }, (_, i) => [0, R2(0.2 + i * 0.15), 0]), mat: "steel" });
P({ id: "elevMotorPlug", layer: "elevCol", shape: "box", size: [0.22, 0.22, 0.2], pos: [-4.7, 0.6, -3.05], mat: "conn" });
P({ id: "elevSled", layer: "elev", shape: "box", size: [1.0, 1.0, 0.5], pos: [-5.1, 1.0, -2.95], mat: "band" });
P({ id: "elevArm", layer: "elev", shape: "box", size: [4.4, 0.4, 1.0], rot: [0, -40, 0], pos: [-2.2, 0.75, -1.8], mat: "steel2" });

// ── 晶圓盒開門台（FOUP opener）＋晶圓盒＋儲存架 ──
const FX = 11.6, FY = 7.0;                 // 晶圓盒中心 x、底面 y
const fslot = (k) => R2(FY + 0.3 + k * PITCH);   // 盒內 25 格
LAY("fop", [4, 7.2, FX, 3.5]); LAY("foup", [3.8, 3.2, FX, FY + 1.5]); LAY("wf5", [3.2, 0.6, FX, fslot(22)]);
P({ id: "fopStand", layer: "fop", shape: "box", size: [3.6, FY - 0.2, 3.6], pos: [FX + 0.3, (FY - 0.2) / 2, 0], mat: "panel2" });
P({ id: "fopTop", layer: "fop", shape: "box", size: [3.8, 0.2, 3.8], pos: [FX + 0.3, FY - 0.1, 0], mat: "band" });
P({ id: "fopPin", layer: "fop", shape: "cyl", size: [0.1, 0.12], rot: V, pos: [0, FY + 0.06, 0], at: [[FX - 0.6, 0, -0.9], [FX - 0.6, 0, 0.9], [FX + 1.2, 0, 0]], mat: "dark" });
P({ id: "fopDoor", layer: "fop", shape: "box", size: [0.25, 2.8, 3.1], pos: [FX - 1.95, FY - 1.8, 0], mat: "foup" });     // 開門後降下的盒門
P({ id: "fopPlate", layer: "fop", shape: "box", size: [0.3, 3.4, 3.6], pos: [FX - 2.25, 3.0, 0], mat: "panel" });
P({ id: "foupL", layer: "foup", shape: "box", size: [3.2, 3.0, 0.12], pos: [FX + 0.1, FY + 1.5, -1.72], mat: "foupShell" });
P({ id: "foupR", layer: "foup", shape: "box", size: [3.2, 3.0, 0.12], pos: [FX + 0.1, FY + 1.5, 1.72], mat: "foupShell" });
P({ id: "foupBack", layer: "foup", shape: "box", size: [0.14, 3.0, 3.5], pos: [FX + 1.72, FY + 1.5, 0], mat: "foup" });
P({ id: "foupTopB", layer: "foup", shape: "box", size: [3.3, 0.14, 3.56], pos: [FX + 0.1, FY + 3.05, 0], mat: "foup" });
P({ id: "foupBot", layer: "foup", shape: "box", size: [3.3, 0.14, 3.56], pos: [FX + 0.1, FY + 0.07, 0], mat: "foup" });
P({ id: "foupHandle", layer: "foup", shape: "box", size: [1.4, 0.35, 1.4], pos: [FX + 0.1, FY + 3.3, 0], mat: "band" });
P({ id: "foupRib", layer: "foup", shape: "box", size: [3.0, 0.05, 0.04], pos: [FX + 0.1, 0, 0], at: [0.6, 1.5, 2.4].flatMap((y) => [[0, FY + y, -1.79], [0, FY + y, 1.79]]), mat: "seam" });   // 外殼接縫
P({ id: "foupGrip", layer: "foup", shape: "box", size: [1.6, 0.22, 0.14], pos: [FX + 0.3, FY + 1.6, 0], at: [[0, 0, -1.86], [0, 0, 1.86]], mat: "band" });   // 側邊把手
P({ id: "foupLatch", layer: "foup", shape: "box", size: [0.12, 0.3, 0.18], pos: [FX - 1.52, 0, 0], at: [[0, FY + 0.6, -1.6], [0, FY + 0.6, 1.6], [0, FY + 2.5, -1.6], [0, FY + 2.5, 1.6]], mat: "dark" });   // 門框卡榫
P({ id: "foupLabel", layer: "foup", shape: "box", size: [0.06, 0.5, 1.1], pos: [FX + 1.8, FY + 2.2, 0], mat: "conn" });   // 背面標籤槽
P({ id: "foupFlange", layer: "foup", shape: "box", size: [1.0, 0.08, 1.0], pos: [FX + 0.1, FY + 3.5, 0], mat: "steel2" });   // 頂部吊掛法蘭
P({ id: "foupFrame", layer: "foup", shape: "box", size: [0.08, 3.0, 0.1], pos: [FX - 1.5, FY + 1.5, 0], at: [[0, 0, -1.72], [0, 0, 1.72]], mat: "band" });   // 前門框
P({ id: "foupW", layer: "foup", shape: "cyl", size: [1.5, WT], rot: V, pos: [FX, 0, 0], at: Array.from({ length: 20 }, (_, k) => [0, fslot(k), 0]), mat: "wafer" });
P({ id: "wf5", layer: "wf5", shape: "cyl", size: [1.5, WT], rot: V, pos: [FX, 0, 0], at: Array.from({ length: 5 }, (_, i) => [0, fslot(20 + i), 0]), mat: "wafer" });
LAY("stock", [5, 12, FX + 1, 6]);
P({ id: "stockFrame", layer: "stock", shape: "box", size: [0.3, 12.6, 0.3], pos: [0, 6.3, 0], at: [[FX - 1.6, 0, -2.3], [FX + 2.6, 0, -2.3], [FX - 1.6, 0, -5.3], [FX + 2.6, 0, -5.3]], mat: "steel" });
P({ id: "stockShelf", layer: "stock", shape: "box", size: [4.4, 0.15, 3.2], pos: [FX + 0.5, 0, -3.8], at: [[0, 2.2, 0], [0, 6.2, 0], [0, 10.2, 0]], mat: "panel2" });
P({ id: "stockFoup", layer: "stock", shape: "box", size: [3.1, 2.9, 2.8], pos: [FX + 0.5, 0, -3.8], at: [[0, 3.75, 0], [0, 7.75, 0], [0, 11.75, 0]], mat: "foup" });

// ── 晶圓搬運手臂（垂直升降 z → 旋轉 th → 直線伸出 ex；一次五支叉片）──
const RX = 5.6, RZ = 0, CZ = -4.2;
const FKT = 0.025, FG = 0.025;   // 叉片厚、叉片頂到晶圓底的間隙
const YW20 = fslot(20), YT0 = R4(YW20 - WT / 2 - FG - FKT / 2 - 0.5);
const R0 = 2.2;                                                        // 叉片中心到旋轉軸的距離（縮回）
LAY("rbCol", [1.2, 12.6, RX, 6.3]); LAY("rb", [7, 1.6, RX + 1, YT0]);
P({ id: "rbCol", layer: "rbCol", shape: "box", size: [0.8, 12.4, 0.6], pos: [RX, 6.4, CZ], mat: "steel" });
P({ id: "rbColRail", layer: "rbCol", shape: "box", size: [0.12, 12.0, 0.1], pos: [RX, 6.4, CZ + 0.35], at: [[-0.25, 0, 0], [0.25, 0, 0]], mat: "steel2" });
P({ id: "rbColBase", layer: "rbCol", shape: "box", size: [1.6, 0.4, 1.4], pos: [RX, 0.2, CZ], mat: "dark" });
P({ id: "rbSlider", layer: "rb", shape: "box", size: [0.2, 0.5, 0.06], pos: [RX, YT0 - 0.55, CZ + 0.44], at: [[-0.25, 0.22, 0], [0.25, 0.22, 0], [-0.25, -0.22, 0], [0.25, -0.22, 0]], mat: "steel2" });   // 導軌滑塊
P({ id: "rbCarrScrew", layer: "rb", shape: "cyl", size: [0.05, 0.04], rot: [0, 0, 0], pos: [RX, YT0 - 0.55, CZ + 0.95], at: [[-0.42, 0.38, 0], [0.42, 0.38, 0], [-0.42, -0.38, 0], [0.42, -0.38, 0]], mat: "dark" });
P({ id: "rbCarr", layer: "rb", shape: "box", size: [1.1, 1.0, 0.5], pos: [RX, YT0 - 0.55, CZ + 0.68], mat: "band" });
SEG({ id: "rbBracket", layer: "rb", shape: "box", size: [0.8, 0.3, 2.66], pos: [RX, YT0 - 0.75, -1.94], mat: "steel2" }, 2, 6);
P({ id: "rbBase", layer: "rb", shape: "cyl", size: [0.75, 0.4], rot: V, pos: [RX, YT0 - 0.4, RZ], mat: "dark" });
P({ id: "rbTurret", layer: "rb", shape: "cyl", size: [0.62, 0.3], rot: V, pos: [RX, YT0 - 0.05, RZ], mat: "steel" });
SEG({ id: "rbRail", layer: "rb", shape: "box", size: [2.4, 0.12, 0.5], pos: [RX + 0.9, YT0 + 0.15, RZ], mat: "steel2" }, 0, 4);
SEG({ id: "rbArm", layer: "rb", shape: "box", size: [1.5, 0.16, 0.42], pos: [RX - 0.45, YT0 + 0.29, RZ], mat: "panel" }, 0, 3);   // 滑座只在叉片根部後面（伸進晶舟時不碰下面的晶圓）
P({ id: "rbRoot", layer: "rb", shape: "box", size: [0.3, 0.58, 0.6], pos: [RX + R0 - 1.78, YT0 + 0.66, RZ], mat: "dark" });
SEG({ id: "rbFork", layer: "rb", shape: "box", size: [2.7, FKT, 0.36], pos: [RX + R0 - 0.2, 0, RZ], at: Array.from({ length: 5 }, (_, i) => [0, R4(YT0 + 0.5 + i * PITCH), 0]), mat: "ceramic" }, 0, 6);   // 五片分開的陶瓷薄叉
P({ id: "rbPad", layer: "rb", shape: "box", size: [0.12, 0.01, 0.3], pos: [RX + R0 + 1.0, 0, RZ], at: Array.from({ length: 5 }, (_, i) => [0, R4(YT0 + 0.5 + i * PITCH + FKT / 2 + 0.005), 0]), mat: "rubber" });   // 止滑墊
P({ id: "rbRootBolt", layer: "rb", shape: "cyl", size: [0.04, 0.04], rot: [0, 90, 0], pos: [RX + R0 - 1.62, 0, RZ], at: [[0, YT0 + 0.5, -0.2], [0, YT0 + 0.5, 0.2], [0, YT0 + 0.82, -0.2], [0, YT0 + 0.82, 0.2]], mat: "steel" });
const kinRb = {
  layer: "rb", tip: "ex", size: R0 + 4, grip: [RX + R0, R4(YT0 + 0.5 + 2 * PITCH + FKT / 2), RZ],
  joints: [
    { id: "z", type: "slide", axis: [0, 1, 0], parts: ["rbCarr", "rbBracket", "rbBase", "rbSlider", "rbCarrScrew"], min: -0.5, max: 4.5 },
    { id: "th", parent: "z", type: "rot", axis: [0, 1, 0], pivot: [RX, YT0 - 0.2, RZ], parts: ["rbTurret", "rbRail"], min: -200, max: 200 },
    { id: "ex", parent: "th", type: "slide", axis: [1, 0, 0], parts: ["rbArm", "rbRoot", "rbFork", "rbPad", "rbRootBolt"], min: 0, max: 4 },
  ],
  body: ["rbCarr", "rbSlider", "rbCarrScrew", "rbBracket", "rbBase", "rbTurret", "rbRail", "rbArm", "rbRoot", "rbFork", "rbPad", "rbRootBolt"],
  info: { R0, RX, YT0 },
};

// ── 氣體櫃（左側：MFC 一排、閥、管線接到歧管進氣口）──
const GX = -10.6;
LAY("gas", [3, 12, GX, 6]);
P({ id: "gasCab", layer: "gas", shape: "box", size: [2.6, 11.5, 3.4], pos: [GX, 5.75, -1.2], mat: "panel" });
P({ id: "gasWin", layer: "gas", shape: "box", size: [0.06, 6, 2.6], pos: [GX + 1.32, 7.4, -1.2], mat: "win" });
P({ id: "gasMfc", layer: "gas", shape: "box", size: [0.5, 0.8, 0.5], pos: [GX + 0.9, 0, -1.2], at: [5.4, 6.6, 7.8, 9.0].flatMap((y) => [[0, y, -0.7], [0, y, 0.7]]), mat: "steel2" });
P({ id: "gasMfcLed", layer: "gas", shape: "cyl", size: [0.07, 0.06], rot: [0, 90, 0], pos: [GX + 1.17, 0, -1.2], at: [5.4, 6.6, 7.8, 9.0].flatMap((y) => [[0, y + 0.25, -0.7], [0, y + 0.25, 0.7]]), mat: "lampG" });
P({ id: "gasPipeV", layer: "gas", shape: "cyl", size: [0.14, 8.2], rot: V, pos: [GX + 1.0, 8.6, 0.6], mat: "steel" });
P({ id: "gasPipeH", layer: "gas", shape: "cyl", size: [0.14, 4.5], rot: [0, 90, 0], pos: [GX + 3.05, DECK - 0.1, 0.6], mat: "steel" });
P({ id: "gasPipeZ", layer: "gas", shape: "cyl", size: [0.14, 1.4], rot: [0, 0, 0], pos: [-5.3, DECK - 0.1, R2((0.6 + INJ[1]) / 2)], mat: "steel" });
// ── 排氣（歧管排氣口 → 往後 → 下到乾式真空泵；壓力計）──
LAY("exh", [4, 14, 1, 6]);
P({ id: "exhV", layer: "exh", shape: "cyl", size: [0.32, 11.8], rot: V, pos: [1.3, 7.0, -6.1], mat: "steel2" });
P({ id: "exhGauge", layer: "exh", shape: "cyl", size: [0.32, 0.25], rot: [0, 0, 0], pos: [1.3, 10.8, -5.7], mat: "screen" });
P({ id: "exhValve", layer: "exh", shape: "box", size: [0.9, 0.9, 0.9], pos: [1.3, 9.0, -6.1], mat: "band" });
P({ id: "exhPump", layer: "exh", shape: "box", size: [3.0, 1.6, 2.0], pos: [1.3, 0.8, -7.4], mat: "dark" });
P({ id: "exhPumpFin", layer: "exh", shape: "box", size: [3.02, 0.08, 1.6], pos: [1.3, 0, -7.4], at: Array.from({ length: 6 }, (_, i) => [0, R2(0.3 + i * 0.22), 0]), mat: "steel" });
// ── 溫控器櫃＋控制螢幕＋塔燈＋正面銘板 ──
LAY("ctrl", [3, 12, 15.5, 6]);
P({ id: "tcCab", layer: "ctrl", shape: "box", size: [2.6, 12.6, 3.6], pos: [15.4, 6.3, -2.6], mat: "panel" });
P({ id: "tcCabZone", layer: "ctrl", shape: "box", size: [0.06, 0.7, 2.4], pos: [14.08, 0, -2.6], at: Array.from({ length: 5 }, (_, i) => [0, R2(5.0 + i * 1.0), 0]), mat: "screen" });
P({ id: "tcScreen", layer: "ctrl", shape: "box", size: [0.12, 2.4, 3.2], rot: [0, 20, 0], pos: [14.2, 11.4, 1.6], mat: "screen" });
P({ id: "tcArm", layer: "ctrl", shape: "box", size: [0.2, 0.2, 2.4], pos: [14.6, 11.4, 0.0], mat: "steel" });
P({ id: "tower", layer: "ctrl", shape: "cyl", size: [0.08, 1.4], rot: V, pos: [15.4, 13.3, -1.4], mat: "steel" });
P({ id: "towerR", layer: "ctrl", shape: "cyl", size: [0.24, 0.32], rot: V, pos: [15.4, 14.15, -1.4], mat: "lampR" });
P({ id: "towerY", layer: "ctrl", shape: "cyl", size: [0.24, 0.32], rot: V, pos: [15.4, 14.5, -1.4], mat: "lampY" });
P({ id: "towerG", layer: "ctrl", shape: "cyl", size: [0.24, 0.32], rot: V, pos: [15.4, 14.85, -1.4], mat: "lampG" });
LAY("sign", [5, 1.4, -2, DECK + 0.3]);
P({ id: "signPlate", layer: "sign", shape: "box", size: [3.4, 0.9, 0.08], pos: [-5.0, DECK + 0.95, 5.85], mat: "t_tel" });   // 正面銘板（LOGO 原檔，白底）

// ═════ 膜厚放大展示台（x＝FL）：三片晶圓剖面，上下兩面一層層長膜 ═════
const FL = -19, FLY = [4.0, 6.2, 8.4], FW = 9, FT = 0.5, NF = 6, FTH = 0.07;
LAY("film", [12, 9, FL, 6]);
P({ id: "filmBase", layer: "film", shape: "slab", size: [11, 0.6, 4.2], r: 0.15, pos: [FL, 0.3, 0], mat: "band" });
P({ id: "filmPost", layer: "film", shape: "box", size: [0.3, 9.6, 0.3], pos: [0, 4.8, -1.6], at: [[FL - 5.2, 0, 0], [FL + 5.2, 0, 0]], mat: "steel" });
P({ id: "filmWafer", layer: "film", shape: "box", size: [FW, FT, 2.2], pos: [FL, 0, 0], at: FLY.map((y) => [0, y, 0]), mat: "wafer" });
P({ id: "filmClip", layer: "film", shape: "box", size: [0.6, 0.9, 0.5], pos: [0, 0, -1.25], at: FLY.flatMap((y) => [[FL - 4.95, y, 0], [FL + 4.95, y, 0]]), mat: "dark" });
for (let n = 0; n < NF; n++) {
  const lay = `fl${n}`; LAY(lay, [FW, 0.1, FL, 6]);
  P({ id: lay, layer: lay, shape: "box", size: [FW, FTH, 2.2], pos: [FL, 0, 0], at: FLY.flatMap((y) => [[0, R2(y + FT / 2 + FTH * (n + 0.5)), 0], [0, R2(y - FT / 2 - FTH * (n + 0.5)), 0]]), mat: "film" });
}

// ═════ 晶舟中段放大（s7：剖開半邊，看氣體從噴氣管小孔水平穿過晶圓間隙；放大 2.5 倍示意）═════
const BZ = { x: FL, y: 15, k: 2.5 }, BZN = 7, BZP = R2(PITCH * BZ.k * 2.2), BZR = R2(1.5 * BZ.k);
const halfDisc = (r, a0 = 180, a1 = 360, n = 28) => Array.from({ length: n + 1 }, (_, i) => pol(a0 + ((a1 - a0) * i) / n, r));
LAY("bz", [10, 3.2, BZ.x, BZ.y]);
P({ id: "bzW", layer: "bz", shape: "poly", pts: halfDisc(BZR), size: [1, 1, 0.06], rot: V, pos: [BZ.x, 0, 0], at: Array.from({ length: BZN }, (_, i) => [0, R2(BZ.y - 1.2 + i * BZP), 0]), mat: "wafer" });   // 剖開半邊的晶圓（前半拿掉）
P({ id: "bzRod", layer: "bz", shape: "cyl", size: [0.4, 3.0], rot: V, pos: [BZ.x, BZ.y - 0.1, 0], at: [[0, 0, -BZR - 0.45]], mat: "rod" });
P({ id: "bzWall", layer: "bz", shape: "poly", pts: arcPts(BZR + 1.4, BZR + 1.55, 180, 360), size: [1, 1, 3.2], rot: V, pos: [BZ.x, BZ.y - 0.1, 0], mat: "quartz" });   // 內石英管壁（後半）
P({ id: "bzInj", layer: "bz", shape: "cyl", size: [0.38, 3.2], rot: V, pos: [BZ.x - BZR - 0.7, BZ.y - 0.1, 0], mat: "inj" });
P({ id: "bzHole", layer: "bz", shape: "sphere", size: [0.09], pos: [BZ.x - BZR - 0.32, 0, 0.05], at: Array.from({ length: BZN - 1 }, (_, i) => [0, R2(BZ.y - 1.2 + (i + 0.5) * BZP), 0]), mat: "dark" });
P({ id: "bzBase", layer: "bz", shape: "box", size: [10.5, 0.2, 0.2], pos: [BZ.x, BZ.y - 1.7, -BZR - 0.2], mat: "band" });
actions.bzGas = { type: "flow", layer: "bz", _說明: "放大：淡青氣體從噴氣管每個小孔水平噴出，穿過每兩片晶圓之間的間隙（示意）",
  path: [[R2(BZ.x - BZR - 0.3), R2(BZ.y - 1.2 + 2.5 * BZP), 0.1], [R2(BZ.x + BZR - 0.2), R2(BZ.y - 1.2 + 2.5 * BZP), 0.1]],
  n: 5, lanes: BZN - 1, laneGap: BZP, laneDir: [0, 1, 0], size: 0.08, shape: "dot", rate: 0.4, color: "gasC", trail: 3, trailGap: 0.03, trailColor: "gasC", free: true, track: false };
anchors.bz = { layer: "bz", p: [BZ.x - BZR - 0.7, BZ.y + 1.2, 0.2], dx: -120, dy: -200 };
anchors.bzGap = { layer: "bz", p: [BZ.x + 1.0, R2(BZ.y - 1.2 + 3.5 * BZP), 0.1], dx: 140, dy: -230 };

// ═════ 塗佈顯影（x＝CX）：機櫃（前觀察窗敞開）＋塗佈杯＋旋轉吸盤＋晶圓＋光阻噴嘴臂；旁邊熱板堆疊 ═════
const CX = 31, CY = 6.0;
LAY("coatCab", [6.6, 5.8, CX, CY + 1.2]); LAY("coat", [5.2, 2, CX, CY + 0.2]); LAY("noz", [4.4, 2, CX - 1.6, CY + 2.0]);
P({ id: "coatDeck", layer: "coatCab", shape: "box", size: [6.4, 0.4, 6.4], pos: [CX, CY - 1.4, 0], mat: "panel2" });
P({ id: "coatLeg", layer: "coatCab", shape: "box", size: [6.4, 1.2, 0.3], pos: [CX, CY - 2.2, 3.05], mat: "panel" });
P({ id: "coatSign", layer: "coatCab", shape: "box", size: [2.6, 0.7, 0.06], pos: [CX - 1.4, CY - 2.2, 3.23], mat: "t_tel" });
P({ id: "coatBack", layer: "coatCab", shape: "box", size: [6.4, 5.2, 0.2], pos: [CX, CY + 1.2, -3.1], mat: "panel" });
P({ id: "coatSide", layer: "coatCab", shape: "box", size: [0.2, 5.2, 4.2], pos: [0, CY + 1.2, -1.0], at: [[CX - 3.1, 0, 0], [CX + 3.1, 0, 0]], mat: "panel2" });
P({ id: "coatHood", layer: "coatCab", shape: "box", size: [6.6, 0.4, 4.4], pos: [CX, CY + 3.9, -1.0], mat: "panel2" });
P({ id: "coatHoodGrid", layer: "coatCab", shape: "box", size: [5.8, 0.05, 0.06], pos: [CX, CY + 3.68, -1.0], at: Array.from({ length: 6 }, (_, i) => [0, 0, R2(-1.8 + i * 0.72)]), mat: "seam" });
P({ id: "coatEdge", layer: "coatCab", shape: "box", size: [6.4, 0.12, 0.12], pos: [CX, CY - 1.15, 3.2], mat: "band" });
P({ id: "coatCup", layer: "coat", shape: "tube", size: [2.4, 2.15, 1.3], rot: V, pos: [CX, CY - 0.55, 0], mat: "cup" });
P({ id: "coatCupLip", layer: "coat", shape: "tube", size: [2.4, 1.8, 0.12], rot: V, pos: [CX, CY + 0.12, 0], mat: "cup" });
P({ id: "coatDrain", layer: "coat", shape: "cyl", size: [0.2, 1.6], rot: V, pos: [CX + 1.6, CY - 1.9, 0.8], mat: "steel" });
P({ id: "coatChuck", layer: "coat", shape: "cyl", size: [0.6, 0.5], rot: V, pos: [CX, CY - 0.4, 0], mat: "dark" });
P({ id: "coatWf", layer: "coat", shape: "cyl", size: [1.5, 0.04], rot: V, pos: [CX, CY - 0.13, 0], mat: "wafer" });
P({ id: "coatWfMark", layer: "coat", shape: "box", size: [0.42, 0.03, 0.08], pos: [CX, CY - 0.04, 0], at: [0, 90, 180, 270].map((a) => { const [x, z] = pol(a, 1.2); return [x, 0, z]; }), rot: [0, 0, 0], mat: "dark" });   // 邊緣四道記號（看得出轉速）
const RS = [0.35, 0.65, 0.95, 1.25, 1.5];
RS.forEach((r, i) => { LAY(`rs${i}`, [3, 0.2, CX, CY]); P({ id: `rs${i}`, layer: `rs${i}`, shape: "cyl", size: [r, i < 4 ? 0.07 : 0.025], rot: V, pos: [CX, i < 4 ? R2(CY - 0.075 + i * 0.002) : CY - 0.095, 0], mat: i < 4 ? "resist" : "resistL" }); });
LAY("rsT", [0.4, 1.8, CX, CY + 0.8]); LAY("rsB", [0.8, 0.3, CX, CY]);
P({ id: "rsThr", layer: "rsT", shape: "cone", size: [0.035, 0.05, 1.72], rot: V, pos: [CX, CY + 0.75, 0.15], mat: "resist" });     // 連續細絲（落下時略微變細）
P({ id: "rsBlob", layer: "rsB", shape: "cone", size: [0.42, 0.12, 0.2], rot: V, pos: [CX, CY - 0.01, 0.15], mat: "resist" });    // 落點堆起的一小坨（邊緣圓鈍）
P({ id: "nozCol", layer: "noz", shape: "cyl", size: [0.22, 2.6], rot: V, pos: [CX - 3.2, CY + 0.9, -2.2], mat: "steel" });
P({ id: "nozArm", layer: "noz", shape: "box", size: [0.3, 0.3, 2.4], pos: [CX - 3.2 + 0, CY + 2.2, -1.0], mat: "steel2" });
P({ id: "nozArm2", layer: "noz", shape: "box", size: [3.2, 0.3, 0.3], pos: [CX - 1.6, CY + 2.2, 0.15], mat: "steel2" });
P({ id: "nozTip", layer: "noz", shape: "cone", size: [0.05, 0.16, 0.5], rot: V, pos: [CX, CY + 1.85, 0.15], mat: "dark" });
P({ id: "nozLine", layer: "noz", shape: "cyl", size: [0.05, 2.6], rot: [0, 90, 0], pos: [CX - 1.6, CY + 2.42, 0.15], mat: "resist" });
// ═════ 表面細節（Andy 第 20 條：入鏡 >2 秒或被標籤指到的零件都要有接縫、螺絲、格柵、銘板、指示燈、電路板、導軌、管件）═════
const screws = (id, layer, pts, face = "z", r = 0.05) => P({ id, layer, shape: "cyl", size: [r, 0.04], rot: face === "z" ? [0, 0, 0] : face === "x" ? [0, 90, 0] : V, pos: [0, 0, 0], at: pts, mat: "dark" });
// 電路板（正面朝 +z）：板、晶片、被動元件、走線、連接器、排線、銅柱螺絲
const pcb = (key, layer, cx, cy, z, w, h) => {
  P({ id: `${key}Board`, layer, shape: "box", size: [w, h, 0.04], pos: [cx, cy, z], mat: "pcb" });
  P({ id: `${key}Chip`, layer, shape: "box", size: [0.34, 0.34, 0.05], pos: [cx, cy, z + 0.04], at: [[-w * 0.25, h * 0.18, 0], [w * 0.1, h * 0.2, 0], [-w * 0.05, -h * 0.12, 0]], mat: "chip" });
  P({ id: `${key}Pas`, layer, shape: "box", size: [0.07, 0.04, 0.04], pos: [cx, cy, z + 0.035], at: Array.from({ length: 14 }, (_, i) => [R2(-w * 0.4 + (i % 7) * w * 0.12), R2(-h * 0.36 + Math.floor(i / 7) * 0.14), 0]), mat: "ceramic" });
  P({ id: `${key}Cap`, layer, shape: "cyl", size: [0.06, 0.12], rot: [0, 0, 0], pos: [cx, cy, z + 0.08], at: [[w * 0.33, -h * 0.05, 0], [w * 0.33, -h * 0.2, 0]], mat: "steel2" });
  P({ id: `${key}Trace`, layer, shape: "box", size: [R2(w * 0.7), 0.012, 0.01], pos: [cx, cy, z + 0.025], at: Array.from({ length: 6 }, (_, i) => [0, R2(-h * 0.02 + i * 0.05 - 0.12), 0]), mat: "gold" });
  P({ id: `${key}Conn`, layer, shape: "box", size: [R2(w * 0.5), 0.14, 0.12], pos: [cx, R2(cy - h / 2 + 0.12), z + 0.08], mat: "conn" });
  P({ id: `${key}Led`, layer, shape: "box", size: [0.05, 0.05, 0.04], pos: [cx, cy, z + 0.04], at: [[w * 0.38, h * 0.38, 0], [w * 0.3, h * 0.38, 0]], mat: "ledG" });
  P({ id: `${key}Ribbon`, layer, shape: "box", size: [R2(w * 0.45), 0.9, 0.02], pos: [cx, R2(cy - h / 2 - 0.4), z + 0.13], mat: "cable" });
  screws(`${key}Stand`, layer, [[-w / 2 + 0.08, h / 2 - 0.08], [w / 2 - 0.08, h / 2 - 0.08], [-w / 2 + 0.08, -h / 2 + 0.08], [w / 2 - 0.08, -h / 2 + 0.08]].map(([x, y]) => [R2(cx + x), R2(cy + y), R2(z + 0.04)]), "z", 0.04);
};
// 開門台的控制箱（正面打開，看得到電路板）
const ebox = (key, layer, cx, cy, z0, w, h, d) => {   // 電控箱：背板＋四面框＋打開的門（門鉸在右邊，朝外打開約 100°）
  P({ id: `${key}Back`, layer, shape: "box", size: [w, h, 0.06], pos: [cx, cy, z0 + 0.03], mat: "steel" });
  P({ id: `${key}Wall`, layer, shape: "box", size: [0.06, h, d], pos: [0, cy, R2(z0 + d / 2)], at: [[R2(cx - w / 2), 0, 0], [R2(cx + w / 2), 0, 0]], mat: "panel2" });
  P({ id: `${key}Cap`, layer, shape: "box", size: [w, 0.06, d], pos: [cx, 0, R2(z0 + d / 2)], at: [[0, R2(cy - h / 2), 0], [0, R2(cy + h / 2), 0]], mat: "panel2" });
  P({ id: `${key}DoorV`, layer, shape: "box", size: [0.22, h, 0.06], pos: [0, cy, R2(z0 + d + 0.03)], at: [[R2(cx - w / 2 + 0.11), 0, 0], [R2(cx + w / 2 - 0.11), 0, 0]], mat: "panel" });   // 門關著：門框
  P({ id: `${key}DoorHz`, layer, shape: "box", size: [w, 0.22, 0.06], pos: [cx, 0, R2(z0 + d + 0.03)], at: [[0, R2(cy - h / 2 + 0.11), 0], [0, R2(cy + h / 2 - 0.11), 0]], mat: "panel" });
  P({ id: `${key}DoorWin`, layer, shape: "box", size: [R2(w - 0.4), R2(h - 0.4), 0.02], pos: [cx, cy, R2(z0 + d + 0.03)], mat: "win" });   // 壓克力觀察窗
  P({ id: `${key}DoorH`, layer, shape: "box", size: [0.08, 0.5, 0.1], pos: [R2(cx + w / 2 - 0.11), cy, R2(z0 + d + 0.1)], mat: "steel" });
  P({ id: `${key}Hinge`, layer, shape: "cyl", size: [0.05, 0.3], rot: V, pos: [R2(cx - w / 2 + 0.02), 0, R2(z0 + d + 0.05)], at: [[0, R2(cy - h / 3), 0], [0, R2(cy + h / 3), 0]], mat: "steel" });
  P({ id: `${key}Rail`, layer, shape: "box", size: [R2(w - 0.2), 0.08, 0.06], pos: [cx, R2(cy - h / 2 + 0.25), z0 + 0.09], mat: "steel2" });   // DIN 導軌
  P({ id: `${key}Term`, layer, shape: "box", size: [0.1, 0.22, 0.14], pos: [0, R2(cy - h / 2 + 0.25), z0 + 0.15], at: Array.from({ length: 8 }, (_, i) => [R2(cx - w / 2 + 0.3 + i * 0.16), 0, 0]), mat: "conn" });   // 端子台
};
ebox("fopE", "fop", FX + 0.3, 4.1, 1.8, 2.4, 2.4, 0.5);
pcb("fopPcb", "fop", FX + 0.3, 4.35, 1.9, 2.0, 1.4);
screws("fopScrew", "fop", [[-1.6, 6.5], [2.2, 6.5], [-1.6, 0.6], [2.2, 0.6]].map(([x, y]) => [R2(FX + x - 0.05), y, 1.84]));
P({ id: "fopLed", layer: "fop", shape: "box", size: [0.12, 0.12, 0.05], pos: [FX - 1.2, 5.8, 1.83], at: [[0, 0, 0], [0.25, 0, 0]], mat: "ledY" });
// 手臂立柱：滾珠螺桿、上下軸承座、拖鏈、馬達與接頭
P({ id: "rbColScrew", layer: "rbCol", shape: "cyl", size: [0.07, 11.6], rot: V, pos: [RX + 0.62, 6.4, CZ], mat: "steel2" });
P({ id: "rbColBear", layer: "rbCol", shape: "box", size: [0.45, 0.35, 0.45], pos: [RX + 0.62, 0, CZ], at: [[0, 0.7, 0], [0, 12.2, 0]], mat: "dark" });
P({ id: "rbColChain", layer: "rbCol", shape: "box", size: [0.2, 0.16, 0.26], pos: [RX - 0.75, 0, CZ], at: Array.from({ length: 30 }, (_, i) => [0, R2(1.0 + i * 0.36), 0]), mat: "rubber" });
P({ id: "rbColMotor", layer: "rbCol", shape: "cyl", size: [0.3, 0.6], rot: V, pos: [RX + 0.62, 12.75, CZ], mat: "dark" });
P({ id: "rbColPlug", layer: "rbCol", shape: "box", size: [0.18, 0.18, 0.18], pos: [RX + 0.92, 12.75, CZ], mat: "conn" });
// 晶舟升降機：導軌滑塊、軸承座、聯軸器
P({ id: "elevRail", layer: "elevCol", shape: "box", size: [0.18, 12.0, 0.16], pos: [-5.4, 6.6, -3.08], at: [[-0.3, 0, 0], [0.3, 0, 0]], mat: "steel2" });
P({ id: "elevBear", layer: "elevCol", shape: "box", size: [0.7, 0.45, 0.7], pos: [-4.7, 0, -3.6], at: [[0, 1.45, 0], [0, 12.9, 0]], mat: "band" });
P({ id: "elevCoup", layer: "elevCol", shape: "cyl", size: [0.28, 0.32], rot: V, pos: [-4.7, 1.1, -3.6], mat: "steel" });
P({ id: "elevCoupBolt", layer: "elevCol", shape: "cyl", size: [0.05, 0.36], rot: V, pos: [-4.7, 1.1, -3.6], at: ring(4, 0.24), mat: "dark" });
P({ id: "elevSlide", layer: "elev", shape: "box", size: [0.34, 0.6, 0.14], pos: [-5.4, 1.0, -2.93], at: [[-0.3, 0, 0], [0.3, 0, 0]], mat: "band" });
P({ id: "elevNut", layer: "elev", shape: "cyl", size: [0.34, 0.5], rot: V, pos: [-4.7, 1.0, -3.6], mat: "band" });   // 螺帽座（跟著托臂上升）
// 加熱器接線盒：蓋板螺絲、電纜固定頭、銘板
screws("heatRBoxScrew", "heatR", Array.from({ length: ZONES }, (_, i) => [[HR1 + 0.96, zoneY(i) + 0.45, 0.15], [HR1 + 0.96, zoneY(i) - 0.45, 1.05]]).flat(), "x", 0.045);
P({ id: "heatRGland", layer: "heatR", shape: "cyl", size: [0.09, 0.2], rot: [0, 0, 0], pos: [HR1 + 0.55, 0, 1.25], at: Array.from({ length: ZONES }, (_, i) => [0, zoneY(i), 0]), mat: "steel" });
P({ id: "heatJktBolt", layer: "heatL", shape: "cyl", size: [0.07, 0.12], rot: [0, 0, 0], pos: [0, 0, 0], at: [90, 120, 150, 180, 210, 240].flatMap((a) => { const [x, z] = pol(a, HR1 + 0.19); return [[x, HY0 + 0.4, z], [x, HY1 - 0.4, z]]; }), mat: "dark" });
P({ id: "heatRJktBolt", layer: "heatR", shape: "cyl", size: [0.07, 0.12], rot: [0, 0, 0], pos: [0, 0, 0], at: [-60, -30, 0, 30, 60].flatMap((a) => { const [x, z] = pol(a, HR1 + 0.19); return [[x, HY0 + 0.4, z], [x, HY1 - 0.4, z]]; }), mat: "dark" });
// 歧管：O 形環、快拆夾、接頭
P({ id: "maniOring", layer: "mani", shape: "tube", size: [OT.r + 0.25, OT.r + 0.12, 0.06], rot: V, pos: [0, DECK + 0.22, 0], mat: "rubber" });
P({ id: "maniClamp", layer: "mani", shape: "box", size: [0.3, 0.5, 0.3], pos: [0, DECK + 0.05, 0], at: [0, 90, 180, 270].map((a) => { const [x, z] = pol(a + 45, 3.15); return [x, 0, z]; }), mat: "steel" });
P({ id: "maniFit", layer: "mani", shape: "cyl", size: [0.22, 0.25], rot: [0, 90, 0], pos: [-5.6, DECK - 0.1, INJ[1]], mat: "steel2" });
// 氣體櫃：閥（本體＋手柄）、彎頭、管夾、VCR 接頭、觀察窗框
P({ id: "gasValve", layer: "gas", shape: "box", size: [0.4, 0.4, 0.4], pos: [GX + 1.0, 0, 0.6], at: [[0, 6.0, 0], [0, 8.4, 0]], mat: "steel2" });
P({ id: "gasValveH", layer: "gas", shape: "box", size: [0.5, 0.1, 0.1], pos: [GX + 1.0, 0, 0.9], at: [[0, 6.0, 0], [0, 8.4, 0]], mat: "lampR" });
P({ id: "gasElbow", layer: "gas", shape: "sphere", size: [0.2], pos: [0, DECK - 0.1, 0.6], at: [[GX + 1.0, 0, 0], [-5.3, 0, 0]], mat: "steel" });
P({ id: "gasClip", layer: "gas", shape: "tube", size: [0.22, 0.14, 0.12], rot: [0, 90, 0], pos: [0, DECK - 0.1, 0.6], at: [-9.0, -8.0, -7.0, -6.0].map((x) => [x, 0, 0]), mat: "dark" });
P({ id: "gasWinFrame", layer: "gas", shape: "box", size: [0.1, 6.2, 0.12], pos: [GX + 1.34, 7.4, -1.2], at: [[0, 0, -1.35], [0, 0, 1.35]], mat: "band" });
P({ id: "gasPlate", layer: "gas", shape: "box", size: [0.06, 0.5, 1.6], pos: [GX + 1.33, 10.9, -1.2], mat: "conn" });
// 排氣：管夾、壓力計表面、泵接頭
P({ id: "exhClip", layer: "exh", shape: "tube", size: [0.42, 0.33, 0.14], rot: V, pos: [1.3, 0, -6.1], at: [3, 5, 7, 11].map((y) => [0, y, 0]), mat: "dark" });
P({ id: "exhPumpPlug", layer: "exh", shape: "box", size: [0.4, 0.3, 0.2], pos: [2.3, 1.2, -6.35], mat: "conn" });
// 控制櫃：電源與控制電路板（門打開）＋接頭線纜
ebox("ctrlE", "ctrl", 15.4, 3.0, -0.8, 2.4, 3.0, 0.5);
pcb("ctrlPcb", "ctrl", 15.4, 3.6, -0.7, 2.0, 1.6);
P({ id: "ctrlPsu", layer: "ctrl", shape: "box", size: [1.0, 0.7, 0.4], pos: [15.0, 2.1, -0.55], mat: "steel2" });
P({ id: "ctrlPsuVent", layer: "ctrl", shape: "box", size: [0.8, 0.04, 0.02], pos: [15.0, 0, -0.34], at: Array.from({ length: 4 }, (_, i) => [0, R2(1.9 + i * 0.12), 0]), mat: "dark" });
P({ id: "ctrlCable", layer: "ctrl", shape: "box", size: [0.1, 0.9, 0.1], pos: [15.9, 2.3, -0.45], at: [[0, 0, 0], [0.2, 0, 0]], mat: "rubber" });
// 上半部機殼：觀察窗框、銘板螺絲、散熱格柵
P({ id: "upWin", layer: "upper", shape: "box", size: [3.0, 4.0, 0.08], pos: [-0.2, 20.5, 5.8], mat: "win" });
P({ id: "upWinFrame", layer: "upper", shape: "box", size: [3.2, 0.16, 0.12], pos: [-0.2, 0, 5.84], at: [[0, 18.5, 0], [0, 22.5, 0]], mat: "band" });
screws("upScrew", "upper", [-6.9, -2.2, 3.0, 8.2, 13.3].flatMap((x) => [[x, UY0 + 0.4, 5.78], [x, UY1 - 0.4, 5.78]]));
// 塗佈：馬達座螺絲、噴嘴臂軸承與管夾、杯緣螺絲
screws("coatCupScrew", "coat", ring(8, 2.3, 22.5, CY + 0.19).map(([x, y, z]) => [R2(CX + x), y, z]), "y", 0.05);
P({ id: "nozBear", layer: "noz", shape: "cyl", size: [0.32, 0.3], rot: V, pos: [CX - 3.2, CY + 2.2, -2.2], mat: "dark" });
P({ id: "nozClip", layer: "noz", shape: "box", size: [0.12, 0.14, 0.12], pos: [CX - 1.6, CY + 2.42, 0.15], at: [[-1.0, 0, 0], [0, 0, 0], [1.0, 0, 0]], mat: "dark" });
P({ id: "coatVent", layer: "coatCab", shape: "box", size: [1.6, 0.06, 0.04], pos: [CX + 1.8, 0, 3.22], at: Array.from({ length: 5 }, (_, i) => [0, R2(CY - 2.6 + i * 0.18), 0]), mat: "seam" });   // 台面散熱格柵（電路板在台面裡面）

// ═════ 動作 ═════
const lpt = (layer, p) => ({ layer, p });
const ZL = (i) => `heatLZ${i}`, ZR = (i) => `heatRZ${i}`;
for (let i = 0; i < ZONES; i++) actions[`zone${i}`] = { type: "pulse", _說明: `第 ${i + 1} 區加熱線圈通電發橙光（由下往上依序點亮，示意）`, parts: [ZL(i), ZR(i)], color: "coilHot", glow: 0.85, freq: 0.6, halo: 0 };
actions.coilGlow = { type: "pulse", _說明: "加熱線圈細線一起發光", parts: ["heatLCoil", "heatRCoil"], color: "hotY", glow: 0.7, steady: true, halo: 0 };
actions.tubeWarm = { type: "pulse", _說明: "石英管被加熱（熱從外往內傳的第二層，示意）", parts: ["otube", "itube"], color: "heatP", glow: 0.35, steady: true, halo: 0 };
actions.edgeWarm = { type: "pulse", _說明: "晶圓先從邊緣變熱（外圈先帶橘）", parts: ["boatWEdge"], color: "coilHot", glow: 0.55, steady: true, halo: 0 };
actions.waferWarm = { type: "pulse", _說明: "最後才輪到晶圓變熱（第三層，示意）：銀灰晶圓慢慢帶一點橘", parts: ["boatW", "bgapW"], color: "coilHot", glow: 0.4, steady: true, halo: 0 };
const PY0 = BY0 + LIFT, PY1 = slotY(NSLOT - 1) + LIFT;   // 製程位置的晶舟上下緣
[175, 215, 255].forEach((a, i) => {
  const [x0, z0] = pol(a, HR0 - 0.1), [x1, z1] = pol(a, 2.25), [x2, z2] = pol(a, 1.55);
  actions[`heatIn${i}`] = { type: "flow", layer: "itube", _說明: "熱從加熱線圈往內：先穿過外管、內管，再到晶圓邊緣（橙點往內走，示意）", path: [[x0, 0, z0], [x1, 0, z1], [x2, 0, z2]].map(([x, , z]) => [x, R2((PY0 + PY1) / 2), z]),
    n: 3, lanes: 6, laneGap: 1.6, laneDir: [0, 1, 0], size: 0.1, shape: "dot", rate: 0.35, phase: i * 0.3, color: "heatP", trail: 2, trailGap: 0.04, trailColor: "heatP", free: true, track: false };
});
actions.gasFeed = { type: "flow", _說明: "製程氣體從歧管進氣口進來，轉進噴氣管往上送（示意）",
  path: [lpt("mani", [-5.4, DECK - 0.1, INJ[1]]), lpt("mani", [INJ[0], DECK - 0.1, INJ[1]]), lpt("itube", [INJ[0], IT.y1 - 1.2, INJ[1]])],
  n: 6, size: 0.12, shape: "dot", rate: 0.4, color: "gasC", trail: 2, trailGap: 0.03, trailColor: "gasC", track: false };
actions.gasCross = { type: "flow", layer: "itube", _說明: "氣體從噴氣管的小孔橫向噴出，掃過每一片晶圓之間（一層一條，示意）",
  path: [[R2(INJ[0] + 0.15), R2(HOLE0 + 7 * HOLEP), R2(INJ[1] - 0.1)], [R2(-INJ[0] - 0.1), R2(HOLE0 + 7 * HOLEP), R2(-INJ[1] + 0.05)]],
  n: 4, lanes: 15, laneGap: HOLEP, laneDir: [0, 1, 0], size: 0.08, shape: "dot", rate: 0.45, color: "gasC", free: true, track: false };
actions.gasUp = { type: "flow", layer: "itube", _說明: "內管裡的氣體往上走到內管頂端", path: [[1.85, PY0 + 0.2, 0.6], [1.85, IT.y1 - 0.2, 0.6], [1.85, IT.y1 + 0.35, 0.6], [2.38, IT.y1 + 0.35, 0.6]],
  n: 5, lanes: 3, laneGap: 0.6, laneDir: [0, 0, 1], size: 0.09, shape: "dot", rate: 0.35, color: "gasC", free: true, track: false };
actions.gasDown = { type: "flow", layer: "itube", _說明: "越過內管頂端，從內外管之間的夾縫往下流到歧管排氣口（反應後的氣體偏紫灰，示意）",
  path: [[2.38, IT.y1 + 0.3, 0.6], [2.38, OT.y0 + 0.4, 0.6], [1.3, DECK - 0.1, -2.6]], n: 5, lanes: 3, laneGap: 0.6, laneDir: [0, 0, 1], size: 0.09, shape: "dot", rate: 0.35, color: "exhC", free: true, track: false };
actions.exhaust = { type: "flow", _說明: "排氣：歧管排氣口往後抽向排氣管與乾式真空泵",
  path: [lpt("mani", [1.3, DECK - 0.1, -2.6]), lpt("mani", [1.3, DECK - 0.1, -5.7])],
  n: 4, size: 0.14, shape: "dot", rate: 0.35, color: "exhC", trail: 2, trailGap: 0.03, trailColor: "exhC", track: false };
actions.pumpRun = { type: "pulse", _說明: "乾式真空泵運轉中", parts: ["exhGauge"], color: "screen", glow: 0.8, freq: 1.2, halo: 0 };
FLY.forEach((y, i) => {
  actions[`filmGas${i}`] = { type: "flow", _說明: "放大剖面：氣體分子落到晶圓上下兩面，反應後留下來成膜（示意）", layer: "film",
    path: [[FL - 4, R2(y + 1.05), 1.25], [FL + 4, R2(y + 0.55), 1.25]], n: 4, lanes: 2, laneGap: 0.5, laneDir: [0, 1, 0], size: 0.1, shape: "dot", rate: 0.4, phase: i * 0.2, color: "gasC", jitter: 0.06, free: true, track: false };
});
actions.spin = { type: "rotate", _說明: "旋轉吸盤：起轉、停轉有加減速（rampSpin），轉速示意", parts: ["coatWf", "coatWfMark", "coatChuck", ...RS.map((_, i) => `rs${i}`)], axis: [0, 1, 0], pivot: [CX, CY, 0],
  pivots: Object.fromEntries(["coatWf", "coatWfMark", "coatChuck", ...RS.map((_, i) => `rs${i}`)].map((p) => [p, [CX, CY, 0]])), rps: 1.4, rampSpin: true };
actions.drop = { type: "flow", _說明: "光阻（稠液體）從噴嘴滴下：受重力越落越快，細細一條（示意）", path: [lpt("noz", [CX, CY + 1.6, 0.15]), lpt("noz", [CX, CY - 0.05, 0.15])],
  n: 6, size: 0.09, shape: "dot", rate: 0.5, accel: true, color: "resistC", trail: 4, trailGap: 0.02, trailColor: "resistC", free: true, track: false };
[0, 72, 144, 216, 288].forEach((a, i) => {
  const [x0, z0] = pol(a, 1.45), [tx, tz] = pol(a + 90, 0.85), [rx, rz] = pol(a, 0.45), x1 = R2(x0 + tx + rx), z1 = R2(z0 + tz + rz);   // 沿切線飛出（加一點往外）
  actions[`fling${i}`] = { type: "flow", layer: "coat", _說明: "多的光阻從晶圓邊緣沿切線方向甩出去，打到塗佈杯內壁（示意）", path: [[R2(CX + x0), CY - 0.07, z0], [R2(CX + x1), CY - 0.25, z1]],
    n: 3, size: 0.08, shape: "dot", rate: 0.9, phase: i * 0.2, color: "resistL", free: true, track: false };
});
actions.tower = { type: "pulse", _說明: "製程中：塔燈綠燈", parts: ["towerG"], color: "lampG", glow: 0.9, steady: true, halo: 0 };
actions.status = { type: "pulse", _說明: "溫控器與 MFC 指示燈慢慢呼吸", parts: ["tcCabZone", "gasMfcLed", "heatRBoxLed"], color: "screen", glow: 0.6, freq: 0.5, halo: 0 };
actions.lae = { type: "flow", _說明: "裝載區側牆過濾面吹出的潔淨氣流（橫向，示意）", path: [lpt("lae", [-6.8, 6.5, -1]), lpt("lae", [-3.6, 6.5, -1])], n: 3, lanes: 5, laneGap: 1.6, laneDir: [0, 1, 0], size: 0.08, shape: "dot", rate: 0.35, color: "gasC", free: true, track: false };

// ── 標註點 ──
const A = (layer, p, dx, dy) => ({ layer, p, dx, dy });
Object.assign(anchors, {
  sign: A("sign", [-5.0, DECK + 0.95, 5.9], -140, 120), upper: A("upper", [8, 22, 5.8], 140, -120), heat: A("heatL", [-HR1, HC + 3, 1.2], -150, -100), otube: A("otube", [OT.r, OT.y1 - 2, 0.6], 150, -100),
  itube: A("itube", [IT.r, IT.y1 - 3, 0.6], 150, -60), boat: A("boat", [1.6, 8, 0.6], 150, -40), cap: A("cap", [2.6, 1.4, 1.6], 150, 60),
  fork: A("rb", [RX + R0 + 0.6, R2(YT0 + 0.6), 0.2], 120, -220), foup: A("foup", [FX, FY + 3.2, 1.6], 120, -130), elev: A("elevCol", [-5.4, 4, -3.2], -150, -60),
  shut: A("shut", [3.0, DECK - 0.5, 2.8], 150, 90), zone: A("heatL", [R2(pol(215, HR0 - 0.1)[0]), zoneY(3), R2(pol(215, HR0 - 0.1)[1])], -150, -80), otubeHot: A("otube", [R2(pol(200, OT.r)[0]), 20.5, R2(pol(200, OT.r)[1])], -150, 60), waferHot: A("boat", [1.2, 8.4, 0.8], 160, 60),
  inj: A("itube", [INJ[0], 20.5, INJ[1]], -120, -260), exh: A("mani", [1.3, DECK - 0.1, -4.6], 150, -140), gasBox: A("gas", [GX + 1.3, 9, 0.5], -120, -120),
  film: A("fl3", [FL + 3, FLY[2] + 0.6, 1.1], 150, -110), coat: A("coat", [CX + 2.0, CY + 0.2, 1.0], 190, -230), noz: A("noz", [CX, CY + 1.9, 0.2], 140, -120),
  coatSign: A("coatCab", [CX - 1.4, CY - 2.2, 3.26], -140, 60), tower: A("ctrl", [15.4, 14.5, -1.2], 140, -80),
});

const model = {
  name: "示意 直立式批次爐管（tech-tel）：五區加熱器（左右兩半殼、保溫層、加熱線圈帶、分區接線盒、冷卻夾套、熱電偶套管）、外石英管（頂封）、內石英管（頂開）、側壁多孔噴氣管、不鏽鋼歧管（進氣口、排氣口）、爐口擋板、晶舟（石英三柱、100 格）、保溫座、密封蓋、晶舟旋轉馬達、晶舟升降機（滾珠螺桿）、晶圓搬運手臂（垂直升降＋旋轉＋直線伸出、五支叉片，model.kin.rb）、晶圓盒開門台與儲存架、氣體櫃（MFC）、排氣管與乾式真空泵、溫控器櫃、控制螢幕、塔燈、正面銘板；另有膜厚放大展示台、塗佈顯影（塗佈杯、旋轉吸盤、光阻噴嘴臂、熱板堆疊）。配置與比例是示意，不仿特定機型。由 gen-model.mjs 產生，不要手改",
  unit: "示意（1＝10 cm；晶圓直徑 300 mm）",
  size: { w: 40, h: 30, r: 0.6, t: 30 },
  palette, materials,
  partNames: { heat: "加熱器", otube: "外石英管", itube: "內石英管", boat: "晶舟", bgap: "晶舟", cap: "保溫座與密封蓋", rb: "晶圓搬運手臂", foup: "晶圓盒", wf5: "晶圓", mani: "歧管", shut: "爐口擋板", elev: "晶舟升降機", gas: "氣體櫃", exh: "排氣", ctrl: "控制櫃", fl: "薄膜", film: "膜厚放大", coat: "塗佈杯", noz: "光阻噴嘴", rs: "光阻", lae: "裝載區" },
  layers, parts, anchors, actions,
  kin: { rb: kinRb },
  pose: { yaw0: 0, yawIso: 0, drift: 0 }, // 斜角由各鏡頭的 yaw 給（爐管 −0.35；塗佈區、放大台正對 0，遠離原點的區才不會因為深度偏移跑出畫面）,
  camera: { stand: { d: 110, elev: 18, y: 12 } },
  fx: { dpr: 1, srcPx: 30, shadows: 0, fog: false, dust: false, vaporSprites: false, shimmer: false },
  info: { HOLE0, FG, DECK, HY0, HY1, LIFT, BY0, PITCH, GAP, FX, FY, YW20, YT0, R0, RX, FL, FLY, CX, CY, NF, ZONES, slotGap0: slotY(GAP[0]), fslot20: fslot(20) },
};
const FREE = /^(bzGas|heatIn|gasCross|gasUp|gasDown|filmGas|drop|fling|lae)/;
for (const [k, d] of Object.entries(actions)) if (d.type === "flow" && d.path?.[0]?.p) { d.layer = d.path[0].layer; d.path = d.path.map((q) => q.p); if (FREE.test(k)) d.free = true; }
const out = path.join(path.dirname(new URL(import.meta.url).pathname), "model.json");
fs.writeFileSync(out, JSON.stringify(model, null, 1) + "\n");
console.log(`✔ ${out}：${parts.length} 個零件、${parts.reduce((a, p) => a + Math.max(1, p.at?.length ?? 0), 0)} 個實體（含複製）、${layers.length} 層`);

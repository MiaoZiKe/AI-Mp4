// node videos/tech-packaging/gen-model.mjs → 寫 videos/tech-packaging/model.json（改模型改這支，不要手改 json）
// 「先進封裝」示意模型（2026/11/16，device-spec.md 為準）：
//   P 站（原點）：2.5D 封裝。由上到下：運算晶片 ×2、HBM ×8（並排、面朝下）→ 微凸塊 → 矽中介層（上面 RDL 細線、裡面 TSV）→ C4 凸塊 → 有機基板（增層＋核心）→ BGA 錫球 → 主機板（示意）。
//   K 站（鏡頭往右平移）：已知良品挑選。輸送軌＋6 顆小晶片、探針頭（上→下：排線、電路板、兩片導板、朝下的探針）、吸嘴、頂針、廢料盒、中介層晶圓（局部，3 個站位）。
// 座標：x 向右、y 向上、z 向觀眾；水平 1 單位＝1 cm，厚度全部放大（示意，不是實際比例）。整個世界繞 y 轉 YAW（等角視角），
//   K 站放在轉完之後的 x'＝KX 上（鏡頭只要沿 x 平移）。中介層 8.1×5.2＝42.1 cm²＝4,210 mm² ≈ 858 mm² 的 4.9 倍（畫面只寫「約 5 倍」）。
import fs from "node:fs";
import path from "node:path";

const R2 = (x) => Math.round(x * 1000) / 1000;
export const YAW = (-30 * Math.PI) / 180;
export const KX = 40; // K 站中心在轉完之後的 x'
const rot = (x, z) => [x * Math.cos(YAW) + z * Math.sin(YAW), -x * Math.sin(YAW) + z * Math.cos(YAW)];
// K 站原點（世界座標）：轉完落在 (KX, 0)
const KO = [KX * Math.cos(YAW), KX * Math.sin(YAW)];

const palette = {
  pkChip: "#7D8BA6", pkChipTop: "#93A1BC", pkChipEdge: "#5C6984", pkGridLn: "#AAB6CC",
  pkHbm: "#1F6F78", pkHbm2: "#3A939C", pkHbmBase: "#56767F", pkHbmTop: "#2A7F88",
  pkIp: "#BFD0EA", pkRdl: "#C98A3E", pkTsv: "#B8742E", pkPad: "#D9A35C",
  pkUb: "#F2B57A", pkC4: "#F08A24", pkBall: "#B7BFCC", pkSub: "#D8D2A4", pkSub2: "#C2BC8A", pkSubCu: "#C98A3E", pkCap: "#9C8B6E",
  pkPcb: "#2F6E55", pkPcb2: "#4F9A79", pkPcbCu: "#E0A84E",
  pkGood: "#14A38B", pkBad: "#E0472F", pkProc: "#FF9F1C", pkSig: "#38B6FF", pkSigRim: "#1F6FEB", pkMelt: "#FF5A1F", pkFrame: "#FF9F1C",
  pkSteel: "#9AA8BE", pkSteel2: "#7D8AA1", pkDark: "#3F4E6B", pkRail: "#5D6A82", pkRoller: "#8B97AD", pkBin: "#4E5A72", pkBinEdge: "#E0472F",
  pkWafer: "#B4C2DA", pkWafer2: "#C9B8F0", pkChuck: "#6B7891", pkBridge: "#2E3C5C", pkBridgeLn: "#E0A84E", pkHose: "#3F4E6B", pkBoard: "#2F6E55",
  pkInk: "#0F1C3A", pkWhite: "#FFFFFF",
};
const M = (color, o = {}) => ({ kind: "std", color, rough: 0.5, metal: 0, ...o });
const materials = {
  chip: M("pkChip", { rough: 0.35, metal: 0.55, env: 0.5 }), chipTop: M("pkChipTop", { rough: 0.3, metal: 0.6, env: 0.6 }), chipEdge: M("pkChipEdge", { rough: 0.4, metal: 0.5 }), gridLn: { kind: "unlit", color: "pkGridLn" },
  hbm: M("pkHbm", { rough: 0.35 }), hbm2: M("pkHbm2", { rough: 0.35 }), hbmBase: M("pkHbmBase", { rough: 0.4 }), hbmTop: M("pkHbmTop", { rough: 0.3, metal: 0.3 }),
  ip: { kind: "phys", color: "pkIp", rough: 0.12, metal: 0, clearcoat: 0.8, opacity: 0.62, env: 0.6 },
  rdl: M("pkRdl", { rough: 0.3, metal: 0.9, env: 0.6 }), tsv: M("pkTsv", { rough: 0.3, metal: 0.9 }), pad: M("pkPad", { rough: 0.3, metal: 0.9 }),
  ub: M("pkUb", { rough: 0.3, metal: 0.7 }), c4: M("pkC4", { rough: 0.3, metal: 0.6 }), ball: M("pkBall", { rough: 0.18, metal: 0.95, env: 0.9 }),
  sub: M("pkSub", { rough: 0.7 }), sub2: M("pkSub2", { rough: 0.7 }), subCu: M("pkSubCu", { rough: 0.3, metal: 0.9 }), cap: M("pkCap", { rough: 0.5 }),
  pcb: M("pkPcb", { rough: 0.6 }), pcb2: M("pkPcb2", { rough: 0.6 }), pcbCu: M("pkPcbCu", { rough: 0.3, metal: 0.9 }),
  frame: { kind: "unlit", color: "pkFrame" }, frameFill: { kind: "unlit", color: "pkFrame", opacity: 0.22 }, align: { kind: "unlit", color: "pkFrame" },
  steel: M("pkSteel", { rough: 0.3, metal: 0.85, env: 0.5 }), steel2: M("pkSteel2", { rough: 0.35, metal: 0.8 }), dark: M("pkDark", { rough: 0.5, metal: 0.2 }),
  rail: M("pkRail", { rough: 0.5, metal: 0.3 }), roller: M("pkRoller", { rough: 0.3, metal: 0.8 }), bin: M("pkBin", { rough: 0.6 }), binEdge: M("pkBinEdge", { rough: 0.5 }),
  wafer: { kind: "phys", color: "pkWafer", rough: 0.1, metal: 0.4, clearcoat: 1, env: 0.8 }, chuck: M("pkChuck", { rough: 0.5, metal: 0.4 }),
  bridge: M("pkBridge", { rough: 0.35, metal: 0.4 }), bridgeLn: { kind: "unlit", color: "pkBridgeLn" }, hose: M("pkHose", { rough: 0.6 }), board: M("pkBoard", { rough: 0.6 }),
};
const parts = [], layers = [], anchors = {}, actions = {};
const P = (o) => { parts.push(o); return o; };
const L = (id, extra = {}) => { layers.push({ id, z: 0, k: 0, ...extra }); return id; };
const grid = (nx, nz, sx, sz) => { const a = []; for (let j = 0; j < nz; j++) for (let i = 0; i < nx; i++) a.push([R2((i - (nx - 1) / 2) * sx), 0, R2((j - (nz - 1) / 2) * sz)]); return a; };

// ── 高度（y，畫面厚度；device-spec 0.3 節） ──
const PCB_T = 0.3, BALL_R = 0.11, BALL_Y = PCB_T + BALL_R, SUB_Y0 = PCB_T + 2 * BALL_R, SUB_T = 0.55, SUB_TOP = SUB_Y0 + SUB_T;
const C4_T = 0.06, IP_Y0 = SUB_TOP + C4_T, IP_T = 0.08, IP_TOP = IP_Y0 + IP_T, UB_T = 0.03, DIE_Y0 = IP_TOP + UB_T, DIE_T = 0.32, DIE_TOP = DIE_Y0 + DIE_T;
export const H = { PCB_T, BALL_Y, SUB_Y0, SUB_TOP, IP_Y0, IP_TOP, DIE_Y0, DIE_TOP };
// 水平（cm）
const IPW = 8.1, IPD = 5.2, DW = 2.6, DD = 3.3, DGAP = 0.15, HB = 1.1, HGAP = 0.1, SUBW = 11.0, SUBD = 8.2;
export const DIEX = [R2(-(DW + DGAP) / 2), R2((DW + DGAP) / 2)];
export const HBMX = [R2(-(DW + DGAP / 2 + 0.15 + HB / 2)), R2(DW + DGAP / 2 + 0.15 + HB / 2)];
export const HBMZ = [-1.8, -0.6, 0.6, 1.8];

// ── 矽中介層（ip）：半透明矽本體＋上表面 RDL 細線＋靠邊一排 TSV＋晶片站位的銅墊＋下面的 C4 ──
L("ip", { outline: [IPW, IPD, 0, 0] });
P({ id: "ipBody", layer: "ip", shape: "box", size: [IPW, IP_T, IPD], pos: [0, R2(IP_Y0 + IP_T / 2), 0], mat: "ip" });
// RDL：晶片前後兩條空帶裡的細線（沿 x，從一側 HBM 走到另一側），晶片與 HBM 之間的縫裡沿 z 的短線（最密）
const rdlZ = []; for (let i = 0; i < 14; i++) rdlZ.push(R2(1.72 + i * 0.058)), rdlZ.push(R2(-1.72 - i * 0.058));
P({ id: "rdlX", layer: "ip", shape: "box", size: [R2(2 * HBMX[1] - HB), 0.006, 0.024], pos: [0, R2(IP_TOP + 0.002), 0], at: rdlZ.map((z) => [0, 0, z]), mat: "rdl" });
const gapX = []; for (const sx of [-1, 1]) for (let i = 0; i < 4; i++) gapX.push(R2(sx * (DW + DGAP / 2 + 0.03 + i * 0.03)));
P({ id: "rdlZ", layer: "ip", shape: "box", size: [0.02, 0.006, 4.7], pos: [0, R2(IP_TOP + 0.002), 0], at: gapX.map((x) => [x, 0, 0]), mat: "rdl" });
// 斜出去的扇出線（晶片角落 → HBM），讓「晶片與 HBM 之間尤其密」看得出來
const fan = []; for (const sx of [-1, 1]) for (const sz of [-1, 1]) for (let i = 0; i < 6; i++) fan.push([R2(sx * (DW + 0.1 - i * 0.12)), 0, R2(sz * (DD / 2 + 0.06 + i * 0.05))]);
P({ id: "rdlFan", layer: "ip", shape: "box", size: [0.5, 0.006, 0.02], pos: [0, R2(IP_TOP + 0.002), 0], at: fan, mat: "rdl" });
// TSV：前緣與兩側靠邊一排垂直細柱（透過半透明矽看得到）
const tsvAt = []; for (let i = 0; i < 70; i++) tsvAt.push([R2(-IPW / 2 + 0.12 + i * 0.114), 0, R2(IPD / 2 - 0.1)]);
for (let i = 0; i < 40; i++) for (const sx of [-1, 1]) tsvAt.push([R2(sx * (IPW / 2 - 0.1)), 0, R2(-IPD / 2 + 0.2 + i * 0.12)]);
P({ id: "tsv", layer: "ip", shape: "box", size: [0.022, IP_T * 0.96, 0.022], pos: [0, R2(IP_Y0 + IP_T / 2), 0], at: tsvAt, mat: "tsv" });
// 晶片站位的銅墊（晶片拿開時看得到；s2 對位）
const padAt = [];
for (const x of DIEX) for (const p of grid(13, 16, 0.19, 0.19)) padAt.push([R2(x + p[0]), 0, p[2]]);
for (const x of HBMX) for (const z of HBMZ) for (const p of grid(5, 5, 0.19, 0.19)) padAt.push([R2(x + p[0]), 0, R2(z + p[2])]);
P({ id: "ipPad", layer: "ip", shape: "box", size: [0.07, 0.004, 0.07], pos: [0, R2(IP_TOP + 0.002), 0], at: padAt, mat: "pad" });
// C4 凸塊：中介層下面，比微凸塊粗、間距寬
L("c4", { outline: [IPW, IPD, 0, 0] });
P({ id: "c4", layer: "c4", shape: "cyl", size: [0.075, C4_T], rot: [90, 0, 0], pos: [0, R2(SUB_TOP + C4_T / 2), 0], at: grid(27, 17, 0.295, 0.295), mat: "c4" });

// ── 運算晶片 ×2：面朝下，頂面（背面）細網格紋、一圈倒角；底下一整片微凸塊（跟著晶片走） ──
const die = (id, x) => {
  L(id, { outline: [DW, DD, x, 0] });
  P({ id: `${id}Body`, layer: id, shape: "box", size: [DW, DIE_T, DD], pos: [x, R2(DIE_Y0 + DIE_T / 2), 0], mat: "chip" });
  P({ id: `${id}Top`, layer: id, shape: "box", size: [DW - 0.16, 0.004, DD - 0.16], pos: [x, R2(DIE_TOP + 0.002), 0], mat: "chipTop" });
  const gl = []; for (let i = 1; i < 8; i++) gl.push([R2(-DW / 2 + 0.08 + i * ((DW - 0.16) / 8)), 0, 0]);
  P({ id: `${id}GridV`, layer: id, shape: "box", size: [0.008, 0.004, DD - 0.16], pos: [x, R2(DIE_TOP + 0.005), 0], at: gl, mat: "gridLn" });
  const gh = []; for (let i = 1; i < 10; i++) gh.push([0, 0, R2(-DD / 2 + 0.08 + i * ((DD - 0.16) / 10))]);
  P({ id: `${id}GridH`, layer: id, shape: "box", size: [DW - 0.16, 0.004, 0.008], pos: [x, R2(DIE_TOP + 0.005), 0], at: gh, mat: "gridLn" });
  P({ id: `${id}Ub`, layer: id, shape: "cyl", size: [0.045, UB_T], rot: [90, 0, 0], pos: [x, R2(IP_TOP + UB_T / 2), 0], at: grid(13, 16, 0.19, 0.19), mat: "ub" });
};
die("dieA", DIEX[0]); die("dieB", DIEX[1]);

// ── HBM ×8：底部邏輯晶片（稍大）＋12 層 DRAM 薄片（兩色交錯，側面看得到分層）＋頂蓋；底下微凸塊 ──
// 頂面與運算晶片共平面（DIE_TOP）。h7（右前那疊）每片各自一層：s10「往上疊」時拉高拆成 12 層
const NS = 12, HB_BASE = 0.044, SL = R2((DIE_T - HB_BASE) / NS);
export const SPLIT = 7;
let hk = 0;
for (const x of HBMX) for (const z of HBMZ) {
  const id = `hbm${hk}`;
  L(id, { outline: [HB, HB, x, z] });
  P({ id: `${id}Base`, layer: id, shape: "box", size: [HB + 0.06, HB_BASE, HB + 0.06], pos: [x, R2(DIE_Y0 + HB_BASE / 2), z], mat: "hbmBase" });
  P({ id: `${id}Ub`, layer: id, shape: "cyl", size: [0.045, UB_T], rot: [90, 0, 0], pos: [x, R2(IP_TOP + UB_T / 2), z], at: grid(5, 5, 0.19, 0.19), mat: "ub" });
  if (hk !== SPLIT) {
    P({ id: `${id}SlA`, layer: id, shape: "box", size: [HB, R2(SL * 0.86), HB], pos: [x, R2(DIE_Y0 + HB_BASE + SL / 2), z], at: Array.from({ length: NS / 2 }, (_, i) => [0, R2(i * 2 * SL), 0]), mat: "hbm" });
    P({ id: `${id}SlB`, layer: id, shape: "box", size: [HB, R2(SL * 0.86), HB], pos: [x, R2(DIE_Y0 + HB_BASE + SL * 1.5), z], at: Array.from({ length: NS / 2 }, (_, i) => [0, R2(i * 2 * SL), 0]), mat: "hbm2" });
    P({ id: `${id}Top`, layer: id, shape: "box", size: [HB - 0.12, 0.004, HB - 0.12], pos: [x, R2(DIE_TOP + 0.002), z], mat: "hbmTop" });
  } else {
    for (let i = 0; i < NS; i++) {
      const sid = `hs${i}`;
      L(sid, { outline: [HB, HB, x, z] });
      P({ id: `${sid}`, layer: sid, shape: "box", size: [HB, R2(SL * 0.86), HB], pos: [x, R2(DIE_Y0 + HB_BASE + SL * (i + 0.5)), z], mat: i % 2 ? "hbm2" : "hbm" });
      if (i === NS - 1) P({ id: `${sid}Top`, layer: sid, shape: "box", size: [HB - 0.12, 0.004, HB - 0.12], pos: [x, R2(DIE_TOP + 0.002), z], mat: "hbmTop" });
    }
  }
  hk++;
}
export const HBM_LAYERS = Array.from({ length: 8 }, (_, i) => `hbm${i}`);
export const SLICE_LAYERS = Array.from({ length: NS }, (_, i) => `hs${i}`);

// ── 對位框（s2：晶片站位的橘色細框）、光罩框（s1 掃描；s7 兩個套在晶片上） ──
const rectLines = (id, layer, w, d, y, x0, z0, t = 0.03, dash = 0) => {
  if (!dash) {
    P({ id: `${id}H`, layer, shape: "box", size: [w, 0.01, t], pos: [x0, y, z0], at: [[0, 0, R2(-d / 2)], [0, 0, R2(d / 2)]], mat: "frame" });
    P({ id: `${id}V`, layer, shape: "box", size: [t, 0.01, d], pos: [x0, y, z0], at: [[R2(-w / 2), 0, 0], [R2(w / 2), 0, 0]], mat: "frame" });
    return;
  }
  const nh = Math.round(w / dash / 2), nv = Math.round(d / dash / 2), sh = [], sv = [];
  for (let i = 0; i < nh; i++) { const x = R2(-w / 2 + (i + 0.5) * (w / nh)); sh.push([x, 0, R2(-d / 2)], [x, 0, R2(d / 2)]); }
  for (let i = 0; i < nv; i++) { const z = R2(-d / 2 + (i + 0.5) * (d / nv)); sv.push([R2(-w / 2), 0, z], [R2(w / 2), 0, z]); }
  P({ id: `${id}H`, layer, shape: "box", size: [R2((w / nh) * 0.55), 0.012, t], pos: [x0, y, z0], at: sh, mat: "frame" });
  P({ id: `${id}V`, layer, shape: "box", size: [t, 0.012, R2((d / nv) * 0.55)], pos: [x0, y, z0], at: sv, mat: "frame" });
};
L("align", { outline: [IPW, IPD, 0, 0] });
for (const [i, x] of DIEX.entries()) rectLines(`alD${i}`, "align", DW + 0.06, DD + 0.06, R2(IP_TOP + 0.01), x, 0, 0.025);
for (const x of HBMX) for (const z of HBMZ) rectLines(`alH${x}${z}`.replace(/[.-]/g, "_"), "align", HB + 0.06, HB + 0.06, R2(IP_TOP + 0.01), x, z, 0.02);
L("frame", { outline: [DW, DD, DIEX[0], 0] });
rectLines("fr", "frame", DW, DD, R2(DIE_TOP + 0.35), DIEX[0], 0, 0.05, 0.22);
P({ id: "frFill", layer: "frame", shape: "box", size: [DW, 0.004, DD], pos: [DIEX[0], R2(DIE_TOP + 0.35), 0], mat: "frameFill" });
for (const [i, x] of DIEX.entries()) { L(`frame${i}`, { outline: [DW, DD, x, 0] }); rectLines(`frD${i}`, `frame${i}`, DW, DD, R2(DIE_TOP + 0.03), x, 0, 0.05, 0.22); }

// ── 矽橋（CoWoS-L 的 LSI，只在 s7）：兩顆運算晶片之間、埋在中介層上層的一小條矽，上面一排極密短線 ──
L("bridge", { outline: [0.4, 2.6, 0, 0] });
P({ id: "bridge", layer: "bridge", shape: "box", size: [0.42, 0.05, 2.6], pos: [0, R2(IP_TOP - 0.025), 0], mat: "bridge" });
P({ id: "bridgeLn", layer: "bridge", shape: "box", size: [0.4, 0.004, 0.012], pos: [0, R2(IP_TOP + 0.002), 0], at: Array.from({ length: 40 }, (_, i) => [0, 0, R2(-1.25 + i * 0.064)]), mat: "bridgeLn" });

// ── 有機基板：上增層（3）→ 核心（厚）→ 下增層（3），側面看得到層；中央接 C4 的密點區、外圈去耦電容 ──
L("sub", { outline: [SUBW, SUBD, 0, 0] });
const subL = [["sub", 0.05], ["subCu", 0.012], ["sub", 0.05], ["subCu", 0.012], ["sub2", 0.2], ["subCu", 0.012], ["sub", 0.05], ["subCu", 0.012], ["sub", 0.05]];
const sumT = subL.reduce((a, [, t]) => a + t, 0);
let yy = SUB_Y0;
subL.forEach(([mat, t], i) => { const tt = R2((t * SUB_T) / sumT); P({ id: `subL${i}`, layer: "sub", shape: "box", size: [mat === "subCu" ? SUBW - 0.02 : SUBW, tt, mat === "subCu" ? SUBD - 0.02 : SUBD], pos: [0, R2(yy + tt / 2), 0], mat }); yy += tt; });
P({ id: "subPad", layer: "sub", shape: "box", size: [0.12, 0.006, 0.12], pos: [0, R2(SUB_TOP + 0.003), 0], at: grid(27, 17, 0.295, 0.295), mat: "pad" });
const capAt = []; for (let i = 0; i < 14; i++) { const x = R2(-4.9 + i * 0.75); capAt.push([x, 0, -3.65], [x, 0, 3.65]); } for (let i = 0; i < 9; i++) { const z = R2(-3.0 + i * 0.75); capAt.push([-5.05, 0, z], [5.05, 0, z]); }
P({ id: "subCap", layer: "sub", shape: "box", size: [0.3, 0.12, 0.16], pos: [0, R2(SUB_TOP + 0.06), 0], at: capAt, mat: "cap" });
P({ id: "subCapE", layer: "sub", shape: "box", size: [0.06, 0.124, 0.17], pos: [0, R2(SUB_TOP + 0.06), 0], at: capAt.flatMap((c) => [[R2(c[0] - 0.12), 0, c[2]], [R2(c[0] + 0.12), 0, c[2]]]), mat: "pad" });
// BGA 錫球：基板底面整片規則陣列（分前、中、後三排組，s10 依序出現）
for (let g = 0; g < 3; g++) {
  L(`balls${g}`, { outline: [SUBW, SUBD / 3, 0, 0] });
  const at = grid(22, 17, 0.47, 0.47).filter((p) => (g === 0 ? p[2] < -1.3 : g === 1 ? p[2] >= -1.3 && p[2] <= 1.3 : p[2] > 1.3));
  P({ id: `ball${g}`, layer: `balls${g}`, shape: "sphere", size: [BALL_R], pos: [0, R2(BALL_Y), 0], at, mat: "ball" });
}
// 主機板示意塊：深綠，幾條細線與接點區
L("pcb", { outline: [13, 10, 0, 0] });
P({ id: "pcb", layer: "pcb", shape: "box", size: [12.2, PCB_T, 9.4], pos: [0, R2(PCB_T / 2), 0], mat: "pcb" });
P({ id: "pcbPad", layer: "pcb", shape: "box", size: [0.2, 0.006, 0.2], pos: [0, R2(PCB_T + 0.003), 0], at: grid(22, 17, 0.47, 0.47), mat: "pcbCu" });
P({ id: "pcbTr", layer: "pcb", shape: "box", size: [1.3, 0.006, 0.05], pos: [0, R2(PCB_T + 0.003), 0], at: Array.from({ length: 10 }, (_, i) => [R2(i < 5 ? -5.7 : 5.7), 0, R2(-4.0 + (i % 5) * 0.5)]), mat: "pcbCu" });
P({ id: "pcbTr2", layer: "pcb", shape: "box", size: [0.05, 0.006, 0.9], pos: [0, R2(PCB_T + 0.003), 0], at: Array.from({ length: 12 }, (_, i) => [R2(-3 + i * 0.55), 0, R2(i % 2 ? 4.35 : -4.35)]), mat: "pcbCu" });
// s10：把整顆中介層模組拿起來再放到基板上的放置頭（平板吸頭＋升降臂）
L("head", { bg: true, outline: [IPW, IPD, 0, 0] }); // 工具，不算主素材
P({ id: "headPlate", layer: "head", shape: "box", size: [6.2, 0.18, 3.6], pos: [0, R2(DIE_TOP + 0.09), 0], mat: "steel" });
P({ id: "headBody", layer: "head", shape: "box", size: [2.2, 0.8, 1.6], pos: [0, R2(DIE_TOP + 0.58), 0], mat: "steel2" });
P({ id: "headArm", layer: "head", shape: "box", size: [0.5, 4.0, 0.5], pos: [0, R2(DIE_TOP + 2.95), 0], mat: "steel" });
P({ id: "headHose", layer: "head", shape: "box", size: [0.12, 2.2, 0.12], pos: [0.9, R2(DIE_TOP + 2.0), 0.5], mat: "hose" });

// ── K 站（已知良品挑選），本地座標再平移到 KO（轉完在 x'＝KX） ──
const KS = 0.5; // 小晶片＝cdie 等比例縮一半
export const KCW = R2(DW * KS), KCD = R2(DD * KS), KCT = 0.16, RAIL_Y = 1.6, PITCH = 1.9;
const K = (x, y, z) => [R2(KO[0] + x), R2(y), R2(KO[1] + z)];
export const KP = { probeX: -1.2, pickX: 0.7 }; // 探針站、吸取站（本地 x）
L("kRail", { outline: [16, 3, KO[0], 0] });
P({ id: "kRailBed", layer: "kRail", shape: "box", size: [15.5, 0.24, 2.1], pos: K(-5.2, RAIL_Y - 0.12, 0), mat: "rail" });
P({ id: "kRailSide", layer: "kRail", shape: "box", size: [15.5, 0.18, 0.12], pos: K(-5.2, RAIL_Y + 0.05, 0), at: [[0, 0, -1.08], [0, 0, 1.08]], mat: "steel2" });
P({ id: "kRoller", layer: "kRail", shape: "cyl", size: [0.12, 2.0], pos: K(-5.2, RAIL_Y - 0.26, 0), at: Array.from({ length: 14 }, (_, i) => [R2(-7.3 + i * 1.1), 0, 0]), mat: "roller" });
P({ id: "kLeg", layer: "kRail", shape: "box", size: [0.24, RAIL_Y - 0.36, 0.24], pos: K(-5.2, (RAIL_Y - 0.36) / 2, 0), at: [[-7.2, 0, -0.85], [-7.2, 0, 0.85], [2.6, 0, -0.85], [2.6, 0, 0.85], [-2.3, 0, -0.85], [-2.3, 0, 0.85]], mat: "steel2" });
// 6 顆小晶片：開場在探針站左邊一格一格排好（第 1 顆在探針站左一格）
export const KCH = 6;
for (let i = 0; i < KCH; i++) {
  const id = `kc${i}`, x = R2(KP.probeX - (i + 1) * PITCH);
  L(id, { outline: [KCW, KCD, KO[0] + x, 0] });
  P({ id: `${id}`, layer: id, shape: "box", size: [KCW, KCT, KCD], pos: K(x, RAIL_Y + KCT / 2, 0), mat: "chip" });
  P({ id: `${id}Top`, layer: id, shape: "box", size: [KCW - 0.1, 0.004, KCD - 0.1], pos: K(x, RAIL_Y + KCT + 0.002, 0), mat: "chipTop" });
  P({ id: `${id}Ln`, layer: id, shape: "box", size: [0.006, 0.004, KCD - 0.12], pos: K(x, RAIL_Y + KCT + 0.004, 0), at: [[-0.4, 0, 0], [-0.13, 0, 0], [0.13, 0, 0], [0.4, 0, 0]], mat: "gridLn" });
}
// 探針頭（由上往下）：排線 → 小電路板 → 兩片導板 → 朝下的探針（細線）
export const PROBE_TIP = R2(RAIL_Y + KCT + 0.38); // 待機時針尖離晶片頂面 0.38
L("probe", { outline: [2, 2, KO[0] + KP.probeX, 0] });
P({ id: "prCable", layer: "probe", shape: "box", size: [0.5, 0.9, 0.14], pos: K(KP.probeX, PROBE_TIP + 1.6, -0.3), mat: "hose" });
P({ id: "prBoard", layer: "probe", shape: "box", size: [1.9, 0.14, 2.2], pos: K(KP.probeX, PROBE_TIP + 1.08, 0), mat: "board" });
P({ id: "prCu", layer: "probe", shape: "box", size: [1.5, 0.006, 0.04], pos: K(KP.probeX, PROBE_TIP + 1.153, 0), at: Array.from({ length: 6 }, (_, i) => [0, 0, R2(-0.8 + i * 0.32)]), mat: "pcbCu" });
P({ id: "prGuide", layer: "probe", shape: "box", size: [1.5, 0.05, 1.8], pos: K(KP.probeX, PROBE_TIP + 0.72, 0), at: [[0, 0, 0], [0, -0.3, 0]], mat: "steel" });
P({ id: "prPin", layer: "probe", shape: "box", size: [0.018, 0.86, 0.018], pos: K(KP.probeX, PROBE_TIP + 0.43, 0), at: grid(6, 8, 0.2, 0.2), mat: "steel2" });
P({ id: "prPost", layer: "probe", shape: "box", size: [0.2, 1.4, 0.2], pos: K(KP.probeX, PROBE_TIP + 1.85, -1.25), mat: "steel2" });
// 吸嘴（從上方的吸取頭，細長升降臂＋真空軟管）
export const NOZ_TIP = R2(RAIL_Y + KCT + 1.9); // 待機時吸嘴底面高度
L("nozzle", { outline: [1, 1, KO[0] + KP.pickX, 0] });
P({ id: "nzTip", layer: "nozzle", shape: "cyl", size: [0.22, 0.16], rot: [90, 0, 0], pos: K(KP.pickX, NOZ_TIP + 0.08, 0), mat: "dark" });
P({ id: "nzBody", layer: "nozzle", shape: "cyl", size: [0.32, 0.6], rot: [90, 0, 0], pos: K(KP.pickX, NOZ_TIP + 0.46, 0), mat: "steel" });
P({ id: "nzArm", layer: "nozzle", shape: "box", size: [0.18, 1.3, 0.18], pos: K(KP.pickX, NOZ_TIP + 1.4, 0), mat: "steel2" });
P({ id: "nzHose", layer: "nozzle", shape: "box", size: [0.1, 0.9, 0.1], pos: K(KP.pickX + 0.35, NOZ_TIP + 1.1, 0.1), mat: "hose" });
// 頂針／擋板（壞的那顆被推出軌邊）
L("pusher", { outline: [1, 1, KO[0] + KP.probeX, 0] });
P({ id: "push", layer: "pusher", shape: "box", size: [0.9, 0.12, 0.14], pos: K(KP.probeX, RAIL_Y + 0.08, -1.25), mat: "binEdge" });
P({ id: "pushRod", layer: "pusher", shape: "box", size: [0.12, 0.08, 0.7], pos: K(KP.probeX, RAIL_Y + 0.08, -1.6), mat: "steel2" });
// 廢料盒（軌道前方下面，敞口淺盒）
export const BIN = { x: KP.probeX, z: 2.6, y: 0.1 };
L("bin", { outline: [2.4, 1.8, KO[0] + BIN.x, BIN.z] });
P({ id: "binFloor", layer: "bin", shape: "box", size: [2.4, 0.1, 1.8], pos: K(BIN.x, BIN.y - 0.05, BIN.z), mat: "bin" });
P({ id: "binWallX", layer: "bin", shape: "box", size: [2.4, 0.5, 0.08], pos: K(BIN.x, BIN.y + 0.2, BIN.z), at: [[0, 0, -0.86], [0, 0, 0.86]], mat: "bin" });
P({ id: "binWallZ", layer: "bin", shape: "box", size: [0.08, 0.5, 1.8], pos: K(BIN.x, BIN.y + 0.2, BIN.z), at: [[-1.16, 0, 0], [1.16, 0, 0]], mat: "bin" });
P({ id: "binRim", layer: "bin", shape: "box", size: [2.5, 0.06, 0.1], pos: K(BIN.x, BIN.y + 0.48, BIN.z), at: [[0, 0, -0.88], [0, 0, 0.88]], mat: "binEdge" });
// 中介層晶圓（局部）：吸盤上一片晶圓，3 個站位（每個＝一顆中介層面積，縮一半），站位 0 已貼 1 顆好晶片＋8 顆 HBM 的站位
export const WAF = { x: 4.2, z: -1.9, r: 3.6 };
const SITE = { w: R2(IPW * KS), d: R2(IPD * KS) };
export const SITES = [[WAF.x - 0.2, WAF.z + 0.9], [WAF.x - 0.2, WAF.z - 2.0], [WAF.x + 4.1, WAF.z + 0.9]];
L("kWafer", { outline: [10, 10, KO[0] + WAF.x, WAF.z] });
P({ id: "kChuck", layer: "kWafer", shape: "box", size: [R2(1.5 * WAF.r), 0.16, R2(1.5 * WAF.r)], pos: K(WAF.x, RAIL_Y - 0.18, WAF.z), mat: "chuck" });
P({ id: "kChuckPost", layer: "kWafer", shape: "box", size: [1.2, RAIL_Y - 0.26, 1.2], pos: K(WAF.x, (RAIL_Y - 0.26) / 2, WAF.z), mat: "steel2" });
P({ id: "kWaf", layer: "kWafer", shape: "sphere", size: [WAF.r], scale: [1, 0.012, 1], pos: K(WAF.x, RAIL_Y - 0.05, WAF.z), mat: "wafer" });
for (const [si, [sx, sz]] of SITES.entries()) {
  rectLines(`ws${si}`, "kWafer", SITE.w, SITE.d, R2(RAIL_Y - 0.015), R2(KO[0] + sx), R2(KO[1] + sz), 0.03);
  for (const [i, x] of DIEX.entries()) if (!(si === 0 && i === 0)) rectLines(`wd${si}${i}`, "kWafer", KCW + 0.04, KCD + 0.04, R2(RAIL_Y - 0.012), R2(KO[0] + sx + x * KS), R2(KO[1] + sz), 0.018);
}
export const SLOT = [R2(SITES[0][0] + DIEX[1] * KS), R2(SITES[0][1])]; // 這次要放的站位（站位 0 的右邊那顆）
P({ id: "kPlaced", layer: "kWafer", shape: "box", size: [KCW, KCT, KCD], pos: K(SITES[0][0] + DIEX[0] * KS, RAIL_Y - 0.02 + KCT / 2, SITES[0][1]), mat: "chip" });
P({ id: "kPlacedTop", layer: "kWafer", shape: "box", size: [KCW - 0.1, 0.004, KCD - 0.1], pos: K(SITES[0][0] + DIEX[0] * KS, RAIL_Y - 0.02 + KCT + 0.002, SITES[0][1]), mat: "chipTop" });
P({ id: "kPlacedHbm", layer: "kWafer", shape: "box", size: [R2(HB * KS), KCT, R2(HB * KS)], pos: K(SITES[0][0] + HBMX[0] * KS, RAIL_Y - 0.02 + KCT / 2, SITES[0][1]), at: HBMZ.map((z) => [0, 0, R2(z * KS)]), mat: "hbm" });

// ── 標註點 ──
const KR = (x, y, z) => K(x, y, z);
Object.assign(anchors, {
  ip: { layer: "ip", p: [R2(-IPW / 2 + 0.3), IP_TOP, R2(IPD / 2 - 0.2)], dx: -120, dy: 80 },
  dieA: { layer: "dieA", p: [DIEX[0], DIE_TOP, -1.0], dx: -110, dy: -120 },
  dieB: { layer: "dieB", p: [DIEX[1], DIE_TOP, -1.0], dx: 100, dy: -130 },
  hbm: { layer: "hbm7", p: [HBMX[1] + HB / 2, DIE_TOP, HBMZ[3]], dx: 120, dy: 60 },
  hbmL: { layer: "hbm0", p: [HBMX[0], DIE_TOP, HBMZ[0]], dx: -100, dy: -110 },
  ub: { layer: "dieB", p: [DIEX[1] + DW / 2, IP_TOP + 0.02, 1.2], dx: 120, dy: 40 },
  rdl: { layer: "ip", p: [HBMX[1] - 0.7, IP_TOP, HBMZ[2]], dx: 120, dy: 90 },
  bridge: { layer: "bridge", p: [0, IP_TOP, 1.2], dx: 60, dy: 130 },
  sub: { layer: "sub", p: [R2(SUBW / 2), SUB_Y0 + 0.3, R2(SUBD / 2)], dx: 110, dy: 30 },
  ball: { layer: "balls2", p: [R2(SUBW / 2 - 0.5), BALL_Y, R2(SUBD / 2 - 0.4)], dx: 120, dy: 50 },
  c4: { layer: "c4", p: [R2(IPW / 2 - 0.3), SUB_TOP + 0.03, R2(IPD / 2 - 0.2)], dx: 120, dy: -40 },
  pcb: { layer: "pcb", p: [-6.1, PCB_T, 4.4], dx: -110, dy: 60 },
  hbmS: { layer: "hs11", p: [HBMX[1], DIE_TOP, HBMZ[3]], dx: 110, dy: -80 },
  kProbe: { layer: "probe", p: KR(KP.probeX - 0.95, PROBE_TIP + 1.08, 0), dx: -110, dy: -90 },
  kNozzle: { layer: "nozzle", p: KR(KP.pickX, NOZ_TIP + 1.0, 0), dx: 70, dy: -120 },
  kBin: { layer: "bin", p: KR(BIN.x + 1.2, BIN.y + 0.4, BIN.z + 0.9), dx: 110, dy: 60 },
  kWafer: { layer: "kWafer", p: KR(WAF.x + 2.5, RAIL_Y, WAF.z - 3.5), dx: 80, dy: -100 },
  kRail: { layer: "kRail", p: KR(-8, RAIL_Y, 1.0), dx: -60, dy: 110 },
});

// ── 運作動畫 ──
const dieTopP = (x, z) => ({ layer: "ip", p: [x, DIE_TOP + 0.05, z] });
Object.assign(actions, {
  scanF: { type: "vibrate", _說明: "s1：光罩框在中介層上方沿 x 掃描（一個框寬來回，約 1.2 秒一趟，不超過兩趟）", parts: ["frH", "frV", "frFill"], axis: [1, 0, 0], amp: 1.3, freq: 0.83 },
  ringH: { type: "pulse", _說明: "s2「一圈」：8 顆 HBM 同時閃一下", parts: HBM_LAYERS.flatMap((l, i) => (i === SPLIT ? [] : [`${l}SlA`, `${l}SlB`])).concat(SLICE_LAYERS), color: "pkProc", freq: 2.4, glow: 0.7, halo: 0 },
  landRip: { type: "wave", _說明: "s2：晶片落地時微凸塊層一圈小波紋", from: { layer: "ip", p: [0, IP_TOP + 0.02, 0] }, dir: [0, 1, 0], reach: 0.05, count: 2, r0: 0.9, spread: 28, rate: 1.6, color: "pkProc", width: 0.04 },
  ubGlow: { type: "pulse", _說明: "s3「接點變多」：晶片底下的微凸塊亮起", parts: ["dieAUb", "dieBUb"], color: "pkProc", steady: true, glow: 0.95, halo: 0 },
  sigDirect: { type: "flow", _說明: "s3：訊號從晶片 A 到晶片 B（還沒拆開時想像的直線）", path: [dieTopP(DIEX[0], -0.2), dieTopP(DIEX[1], -0.2)], n: 4, size: 0.12, shape: "dot", rate: 0.9, color: "pkSig", rim: "pkSigRim", rimScale: 1.6, rimO: 0.45, trail: 3, trailGap: 0.025, trailColor: "pkSig" },
  sigDetour: { type: "flow", _說明: "s3「多走一段」：先下到微凸塊、沿中介層走線、再上到另一顆晶片（路徑變長）", path: [dieTopP(DIEX[0], -0.2), { layer: "ip", p: [DIEX[0] + 0.9, IP_TOP + 0.01, -0.2] }, { layer: "ip", p: [DIEX[0] + 0.9, IP_TOP + 0.01, 2.0] }, { layer: "ip", p: [DIEX[1] - 0.9, IP_TOP + 0.01, 2.0] }, { layer: "ip", p: [DIEX[1] - 0.9, IP_TOP + 0.01, -0.2] }, dieTopP(DIEX[1], -0.2)], n: 6, size: 0.12, shape: "dot", rate: 0.55, color: "pkBad", rim: "pkBad", rimScale: 1.5, rimO: 0.35, trail: 3, trailGap: 0.02, trailColor: "pkBad" },
  rdlGlow: { type: "pulse", _說明: "s6「細很多」：RDL 細線由暗到亮（橘）", parts: ["rdlX", "rdlZ", "rdlFan"], color: "pkProc", steady: true, glow: 0.95, halo: 0 },
  memIn: { type: "flow", _說明: "運作 B：記憶體 → 微凸塊 → RDL 細線 → 晶片（密集、快）；2D 剖面讀同一份", path: [{ layer: "hbm6", p: [HBMX[1], DIE_TOP - 0.05, HBMZ[2]] }, { layer: "ip", p: [HBMX[1] - 0.3, IP_TOP + 0.01, HBMZ[2]] }, { layer: "ip", p: [DIEX[1] + 0.9, IP_TOP + 0.01, HBMZ[2]] }, { layer: "dieB", p: [DIEX[1] + 0.6, DIE_TOP - 0.05, HBMZ[2]] }], n: 5, lanes: 2, laneGap: 0.2, laneDir: [0, 0, 1], size: 0.075, shape: "dot", rate: 0.9, drive: true, color: "pkSig", rim: "pkSigRim", rimScale: 1.6, rimO: 0.45, trail: 3, trailGap: 0.022, trailColor: "pkSig", rest: 8, restO: 0.5, track: false },
  memOut: { type: "flow", _說明: "運作 B：晶片 → RDL → 記憶體（反方向，同時進行）", path: [{ layer: "dieB", p: [DIEX[1] + 0.6, DIE_TOP - 0.05, HBMZ[1]] }, { layer: "ip", p: [DIEX[1] + 0.9, IP_TOP + 0.01, HBMZ[1]] }, { layer: "ip", p: [HBMX[1] - 0.3, IP_TOP + 0.01, HBMZ[1]] }, { layer: "hbm5", p: [HBMX[1], DIE_TOP - 0.05, HBMZ[1]] }], n: 5, lanes: 2, laneGap: 0.2, laneDir: [0, 0, 1], size: 0.075, shape: "dot", rate: 0.9, phase: 0.3, drive: true, color: "pkSig", rim: "pkSigRim", rimScale: 1.6, rimO: 0.45, trail: 3, trailGap: 0.022, trailColor: "pkSig", rest: 8, restO: 0.5, track: false },
  tsvDown: { type: "flow", _說明: "運作 B（可選）：中介層邊緣沿 TSV 往下到 C4", path: [{ layer: "ip", p: [HBMX[1] + 0.2, IP_TOP, R2(IPD / 2 - 0.1)] }, { layer: "c4", p: [HBMX[1] + 0.2, SUB_TOP + 0.02, R2(IPD / 2 - 0.1)] }], n: 3, lanes: 4, laneGap: 0.34, laneDir: [1, 0, 0], size: 0.05, shape: "dot", rate: 0.9, color: "pkSig", trail: 2, trailGap: 0.05, trailColor: "pkSig", track: false },
  bridgeAB: { type: "flow", _說明: "s7：兩顆晶片之間走矽橋（雙向密集）", path: [{ layer: "dieA", p: [DIEX[0] + 0.8, IP_TOP + 0.03, 0] }, { layer: "bridge", p: [0, IP_TOP + 0.02, 0] }, { layer: "dieB", p: [DIEX[1] - 0.8, IP_TOP + 0.03, 0] }], n: 6, lanes: 5, laneGap: 0.42, laneDir: [0, 0, 1], size: 0.07, shape: "dot", rate: 1.4, color: "pkSig", rim: "pkSigRim", rimScale: 1.6, rimO: 0.45, trail: 3, trailGap: 0.02, trailColor: "pkSig", track: false },
  bridgeBA: { type: "flow", _說明: "s7：反方向", path: [{ layer: "dieB", p: [DIEX[1] - 0.8, IP_TOP + 0.03, 0.21] }, { layer: "bridge", p: [0, IP_TOP + 0.02, 0.21] }, { layer: "dieA", p: [DIEX[0] + 0.8, IP_TOP + 0.03, 0.21] }], n: 6, lanes: 5, laneGap: 0.42, laneDir: [0, 0, 1], size: 0.07, shape: "dot", rate: 1.4, phase: 0.4, color: "pkSig", rim: "pkSigRim", rimScale: 1.6, rimO: 0.45, trail: 3, trailGap: 0.02, trailColor: "pkSig", track: false },
  frameEdge: { type: "pulse", _說明: "s7「印到極限」：兩個光罩框邊亮", parts: ["frD0H", "frD0V", "frD1H", "frD1V"], color: "pkBad", freq: 2, glow: 0.8, halo: 0 },
  meltC4: { type: "pulse", _說明: "s10 回流焊①：模組放到基板上，C4 變橘紅發光（熔化）再冷卻", parts: ["c4"], color: "pkMelt", steady: true, glow: 1, halo: 0 },
  meltBall: { type: "pulse", _說明: "s10 回流焊②：整顆放到主機板上，錫球由銀灰變橘紅發光再冷卻", parts: ["ball0", "ball1", "ball2"], color: "pkMelt", steady: true, glow: 1, halo: 0 },
  okA: { type: "pulse", _說明: "運作 A：探針測完是好的 → 青綠", parts: ["kc0", "kc0Top"], color: "pkGood", steady: true, glow: 0.95, halo: 0 },
  ngA: { type: "pulse", _說明: "運作 A：探針測完是壞的 → 珊瑚紅", parts: ["kc1", "kc1Top"], color: "pkBad", steady: true, glow: 0.95, halo: 0 },
  ngBlink: { type: "pulse", _說明: "s5「只丟那一小顆」：廢料盒裡那顆閃紅", parts: ["kc1", "kc1Top"], color: "pkBad", freq: 2.4, glow: 1, halo: 1.2 },
  probeI: { type: "flow", _說明: "運作 A：測試電流從探針頭沿細針流進晶片（有拖尾）", path: [KR(KP.probeX, PROBE_TIP + 1.0, 0), KR(KP.probeX, PROBE_TIP + 0.05 - 0.38, 0)], layer: "probe", n: 4, lanes: 3, laneGap: 0.4, laneDir: [1, 0, 0], size: 0.06, shape: "dot", rate: 1.6, color: "pkSig", trail: 3, trailGap: 0.04, trailColor: "pkSig", track: false },
  placeRip: { type: "wave", _說明: "運作 A：好晶片放到中介層晶圓上，凸塊層一圈小波紋", from: { layer: "kWafer", p: KR(SLOT[0], RAIL_Y + 0.01, SLOT[1]) }, dir: [0, 1, 0], reach: 0.05, count: 2, r0: 0.5, spread: 30, rate: 1.8, color: "pkGood", width: 0.05 },
  binRip: { type: "wave", _說明: "運作 A：壞晶片落盒的小波紋", from: { layer: "bin", p: KR(BIN.x, BIN.y + 0.02, BIN.z) }, dir: [0, 1, 0], reach: 0.05, count: 2, r0: 0.4, spread: 26, rate: 1.8, color: "pkBad", width: 0.05 },
});

const model = {
  name: "先進封裝示意：2.5D 封裝（運算晶片 ×2、HBM ×8、微凸塊、矽中介層 RDL＋TSV、C4、有機基板、BGA、主機板）與已知良品挑選站（輸送軌、探針頭、吸嘴、廢料盒、中介層晶圓）。比例是示意（厚度放大），不仿任何公司產品。由 gen-model.mjs 產生，不要手改",
  unit: "1 cm（水平）",
  size: { w: IPW, h: 2, r: 0.1, t: IPD },
  palette, materials,
  partNames: { ip: "矽中介層", rdl: "重分佈層 RDL", tsv: "矽穿孔 TSV", ipPad: "中介層銅墊", c4: "C4 凸塊", die: "運算晶片", hbm: "HBM", hs: "HBM 薄片", al: "對位框", fr: "光罩框", bridge: "矽橋", sub: "有機基板", ball: "BGA 錫球", pcb: "主機板", head: "放置頭", kRail: "輸送軌", kRoller: "滾輪", kLeg: "支腳", kBase: "機台底座", kc: "小晶片", pr: "探針頭", nz: "吸嘴", push: "頂針", bin: "廢料盒", kChuck: "吸盤", kWaf: "中介層晶圓", ws: "站位", wd: "晶片站位", kPlaced: "已貼好的晶片" },
  layers, parts, anchors, actions,
  pose: { yaw0: YAW, yawIso: 0, drift: 0 },
  camera: { stand: { d: 40, elev: 35, y: 1.2 } },
  fx: { dpr: 1, srcPx: 30, shadows: 0, ghost: false, guides: false, fog: false, dust: false, vaporSprites: false, shimmer: false },
};
const out = path.join(path.dirname(new URL(import.meta.url).pathname), "model.json");
if (process.argv[1] && process.argv[1].endsWith("gen-model.mjs")) { fs.writeFileSync(out, JSON.stringify(model, null, 1) + "\n"); console.log(`✔ ${out}：${parts.length} 個零件、${layers.length} 層`); }
export { rot };

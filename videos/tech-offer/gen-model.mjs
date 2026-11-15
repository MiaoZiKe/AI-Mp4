// node videos/tech-offer/gen-model.mjs → 寫 videos/tech-offer/model.json
// 「兩份 offer 怎麼比」的示意桌面（2026/11/16）：一張長桌上五個工作站，鏡頭沿桌子平移（props.shot 的 x）。
//   P（x=0）年薪柱＋獲利儀表＋合約　S（x=−30）天平　C（x=30）月薪切 240 片＋時鐘＋硬幣堆　J（x=60）勞退專戶罐　D（x=90）三道章
// 顏色規則（visual-spec）：月薪＝藍、非經常（年終／分紅）＝橘、加成＝淺藍。全部是基本形狀，不畫任何公司的 LOGO、信封或薪資單版型。
// 比例是示意：12 塊月薪方塊的總高 ≈ 年終＋分紅（主計總處 2025 電子零組件業：經常性 5.7 萬 ×12＝68.5 萬，全年總薪資 133 萬）。
// 改模型改這支，不要手改 json。
import fs from "node:fs";
import path from "node:path";

const R2 = (x) => Math.round(x * 1000) / 1000;
const palette = {
  desk: "#E9D9BF", deskEdge: "#CDB591", grain: "#DCC8A6", mo: "#1F6FEB", moDark: "#174FB0", bonus: "#FF9F1C", bonusDark: "#D97E08", plus: "#8DB4F2",
  paper: "#FFFFFF", paperLine: "#C5D6F2", ink: "#0F1C3A", steel: "#9AA8BE", dark: "#3F4E6B", key: "#F7F9FC", mug: "#FFFFFF", coffee: "#6B4A2E",
  glassC: "#CFE0F7", water: "#5B9CF2", red: "#D4231A", cert: "#FFF4DC", green: "#2FA36B", folderA: "#BFD3F5", folderB: "#FFD9A8", brass: "#E0B04A",
};
const materials = {
  desk: { kind: "std", color: "desk", rough: 0.7, metal: 0 },
  deskEdge: { kind: "std", color: "deskEdge", rough: 0.6, metal: 0 },
  grain: { kind: "std", color: "grain", rough: 0.8, metal: 0 },
  mo: { kind: "phys", color: "mo", rough: 0.3, metal: 0, clearcoat: 0.6 },
  moDark: { kind: "std", color: "moDark", rough: 0.5, metal: 0 },
  bonus: { kind: "phys", color: "bonus", rough: 0.3, metal: 0, clearcoat: 0.6 },
  bonusDark: { kind: "std", color: "bonusDark", rough: 0.5, metal: 0 },
  plus: { kind: "phys", color: "plus", rough: 0.3, metal: 0, clearcoat: 0.5 },
  paper: { kind: "std", color: "paper", rough: 0.9, metal: 0 },
  paperLine: { kind: "unlit", color: "paperLine" },
  ink: { kind: "std", color: "ink", rough: 0.6, metal: 0 },
  steel: { kind: "std", color: "steel", rough: 0.35, metal: 0.85, env: 0.5 },
  dark: { kind: "std", color: "dark", rough: 0.5, metal: 0.2 },
  key: { kind: "std", color: "key", rough: 0.6, metal: 0 },
  mug: { kind: "phys", color: "mug", rough: 0.2, metal: 0, clearcoat: 0.8 },
  coffee: { kind: "std", color: "coffee", rough: 0.3, metal: 0 },
  glass: { kind: "phys", color: "glassC", rough: 0.08, metal: 0, clearcoat: 1, opacity: 0.32, env: 0.5 },
  water: { kind: "phys", color: "water", rough: 0.1, metal: 0, clearcoat: 0.8, opacity: 0.78 },
  red: { kind: "std", color: "red", rough: 0.5, metal: 0 },
  cert: { kind: "std", color: "cert", rough: 0.85, metal: 0 },
  green: { kind: "std", color: "green", rough: 0.5, metal: 0 },
  folderA: { kind: "std", color: "folderA", rough: 0.8, metal: 0 },
  folderB: { kind: "std", color: "folderB", rough: 0.8, metal: 0 },
  brass: { kind: "std", color: "brass", rough: 0.3, metal: 0.9, env: 0.7 },
};
const parts = [], layers = [], anchors = {}, actions = {};
const P = (o) => { parts.push(o); return o; };
const L = (id, extra = {}) => { layers.push({ id, z: 0, k: 0, ...extra }); return id; };

// ── 桌面（背景層，不算主素材）：長木桌、木紋、桌緣、配件（鍵盤、筆、咖啡杯、筆記本） ──
L("desk", { bg: true, outline: [190, 30, 30, 0] });
P({ id: "deskTop", layer: "desk", shape: "slab", size: [190, 1.2, 30], r: 0.4, bevel: 0.15, pos: [30, -0.6, -2], mat: "desk" });
P({ id: "deskGrain", layer: "desk", shape: "box", size: [190, 0.02, 0.12], pos: [30, 0.01, -2], at: Array.from({ length: 15 }, (_, i) => [0, 0, R2(-13 + i * 1.9 + ((i * 37) % 7) * 0.12)]), mat: "grain" });
P({ id: "deskLip", layer: "desk", shape: "box", size: [190, 0.5, 0.4], pos: [30, -1.0, 13.0], mat: "deskEdge" });
const kb = (x, z) => {
  P({ id: `kb${x}`, layer: "desk", shape: "slab", size: [7.2, 0.35, 2.6], r: 0.12, pos: [x, 0.18, z], mat: "dark" });
  P({ id: `kbKeys${x}`, layer: "desk", shape: "box", size: [0.42, 0.14, 0.42], pos: [x, 0.42, z], grid: { n: [13, 4], step: [0.52, 0.55] }, mat: "key" });
};
kb(-14.5, 7.5); kb(46, 8.5);
const pen = (x, z, rz) => { P({ id: `pen${x}`, layer: "desk", shape: "cyl", size: [0.12, 4.2], rot: [0, 90 + rz, 0], pos: [x, 0.13, z], mat: "mo" }); P({ id: `penTip${x}`, layer: "desk", shape: "cyl", size: [0.13, 0.5], rot: [0, 90 + rz, 0], pos: [R2(x + 2.3 * Math.cos((rz * Math.PI) / 180)), 0.13, R2(z - 2.3 * Math.sin((rz * Math.PI) / 180))], mat: "steel" }); };
pen(14, 7, 20); pen(75, 7.5, -15); pen(-44, 6, 10);
const mug = (x, z) => {
  P({ id: `mug${x}`, layer: "desk", shape: "cyl", size: [1.1, 2.2], rot: [90, 0, 0], pos: [x, 1.1, z], mat: "mug" });
  P({ id: `coffee${x}`, layer: "desk", shape: "cyl", size: [0.98, 0.05], rot: [90, 0, 0], pos: [x, 2.05, z], mat: "coffee" });
  P({ id: `mugH${x}`, layer: "desk", shape: "tube", size: [0.6, 0.38, 0.22], pos: [x + 1.2, 1.2, z], mat: "mug" });
};
mug(15, -6); mug(-17, -5); mug(76, -6); mug(104, -4);
const pad = (x, z) => { P({ id: `pad${x}`, layer: "desk", shape: "slab", size: [4.5, 0.12, 6], r: 0.1, pos: [x, 0.06, z], mat: "paper" }); P({ id: `padL${x}`, layer: "desk", shape: "box", size: [3.6, 0.02, 0.06], pos: [x, 0.13, z], at: Array.from({ length: 9 }, (_, i) => [0, 0, R2(-2.4 + i * 0.6)]), mat: "paperLine" }); };
pad(-45, -4); pad(46, -6); pad(106, 6);

// ── P：年薪柱（12 塊月薪方塊＋年終＋分紅）。每塊一層，開場一塊塊疊上；每塊正面貼一張小薪資單紙條（紙紋） ──
const PX = -3.4, BW = 4.2, BD = 3, BH = 0.5, GAP = 0.06;
for (let i = 0; i < 12; i++) {
  const id = L(`m${i + 1}`, { outline: [BW, BD, PX, 0] }), y = R2(BH / 2 + i * (BH + GAP));
  P({ id: `mBlk${i + 1}`, layer: id, shape: "slab", size: [BW, BH, BD], r: 0.08, bevel: 0.04, pos: [PX, y, 0], mat: "mo" });
  P({ id: `mSlip${i + 1}`, layer: id, shape: "plane", size: [1.6, 0.26], pos: [PX - 0.9, y, BD / 2 + 0.01], mat: "paper" });
  P({ id: `mSlipL${i + 1}`, layer: id, shape: "plane", size: [0.9, 0.04], pos: [PX - 1.15, y, BD / 2 + 0.02], at: [[0, 0.06], [0, -0.04]], mat: "paperLine" });
}
const TOP12 = 12 * (BH + GAP) - GAP; // 6.66
const YH = 3.55, DH = 2.6; // 年終、分紅（合計 ≈ 12 塊月薪：64.5 對 68.5 萬）
L("bonY", { outline: [BW, BD, PX, 0] });
P({ id: "bonYBlk", layer: "bonY", shape: "slab", size: [BW, YH, BD], r: 0.1, bevel: 0.05, pos: [PX, R2(TOP12 + GAP + YH / 2), 0], mat: "bonus" });
P({ id: "bonYBand", layer: "bonY", shape: "box", size: [BW + 0.04, 0.16, BD + 0.04], pos: [PX, R2(TOP12 + GAP + YH * 0.72), 0], mat: "bonusDark" });
P({ id: "bonYTag", layer: "bonY", shape: "plane", size: [2.2, 0.9], r: 0.12, pos: [PX, R2(TOP12 + GAP + YH * 0.42), BD / 2 + 0.01], mat: "paper" });
const DY0 = TOP12 + GAP + YH + GAP;
L("bonD", { outline: [BW, BD, PX, 0] });
P({ id: "bonDBlk", layer: "bonD", shape: "slab", size: [BW, DH, BD], r: 0.1, bevel: 0.05, pos: [PX, R2(DY0 + DH / 2), 0], mat: "bonus" });
P({ id: "bonDTag", layer: "bonD", shape: "plane", size: [2.2, 0.9], r: 0.12, pos: [PX, R2(DY0 + DH / 2), BD / 2 + 0.01], mat: "paper" });
// 分紅可能發股票：一疊股票憑證從分紅塊旁邊滑出來（s6）
L("certs", { outline: [3, 3, PX + 4, 0] });
P({ id: "cert", layer: "certs", shape: "slab", size: [2.6, 0.08, 1.9], r: 0.06, pos: [PX + 0.2, R2(DY0 + 0.3), 0.4], at: [[0, 0, 0], [0.12, 0.1, -0.08], [-0.08, 0.2, 0.06], [0.05, 0.3, -0.02]], mat: "cert" });
P({ id: "certBand", layer: "certs", shape: "box", size: [2.62, 0.02, 0.18], pos: [PX + 0.25, R2(DY0 + 0.66), 0.4], mat: "green" });
P({ id: "certSeal", layer: "certs", shape: "cyl", size: [0.28, 0.03], rot: [90, 0, 0], pos: [PX + 1.0, R2(DY0 + 0.66), 0.9], mat: "red" });
// 獲利儀表（右後）：底座、半圓錶盤、色階刻度（藍→橘）、指針（來回擺，和分紅塊伸縮同一個正弦）
const GX = 4.9, GY = 3.2, GZ = -1.2, GR = 2.5;
L("gauge", { outline: [6, 3, GX, 0] });
P({ id: "gBase", layer: "gauge", shape: "slab", size: [5.6, 0.7, 2.2], r: 0.2, pos: [GX, 0.35, GZ], mat: "dark" });
P({ id: "gStem", layer: "gauge", shape: "box", size: [0.6, GY - 0.7, 0.5], pos: [GX, R2(0.7 + (GY - 0.7) / 2 - 0.3), GZ - 0.3], mat: "steel" });
P({ id: "gFace", layer: "gauge", shape: "cyl", size: [GR, 0.3], pos: [GX, GY, GZ], mat: "paper" });
P({ id: "gRim", layer: "gauge", shape: "tube", size: [GR + 0.22, GR - 0.02, 0.45], pos: [GX, GY, GZ], mat: "steel" });
P({ id: "gHide", layer: "gauge", shape: "box", size: [2 * GR + 0.6, GR * 0.95, 0.5], pos: [GX, R2(GY - GR * 0.5), GZ + 0.02], mat: "dark" });
for (let i = 0; i <= 10; i++) { const a = Math.PI * (1 - i / 10), x = GX + Math.cos(a) * (GR - 0.45), y = GY + Math.sin(a) * (GR - 0.45);
  P({ id: `gTick${i}`, layer: "gauge", shape: "box", size: [0.16, i % 5 ? 0.42 : 0.7, 0.06], rot: [0, 0, R2(((a - Math.PI / 2) * 180) / Math.PI)], pos: [R2(x), R2(y), GZ + 0.18], mat: i < 4 ? "mo" : i < 7 ? "plus" : "bonus" }); }
P({ id: "gNeedle", layer: "gauge", shape: "box", size: [0.16, GR - 0.5, 0.08], pos: [GX, R2(GY + (GR - 0.5) / 2), GZ + 0.26], mat: "red" });
P({ id: "gHub", layer: "gauge", shape: "cyl", size: [0.3, 0.2], pos: [GX, GY, GZ + 0.32], mat: "ink" });
// 合約（右前，平放）：紙、條文線、空白的「保障」欄（被橘色螢光筆框起來＝這一欄有沒有寫）
const CX0 = 1.6, CZ = 2.4;
L("contract", { outline: [4, 5, CX0, 0] });
P({ id: "cPaper", layer: "contract", shape: "slab", size: [3.2, 0.08, 3.6], r: 0.06, pos: [CX0, 0.05, CZ], mat: "paper" });
P({ id: "cLines", layer: "contract", shape: "box", size: [2.4, 0.02, 0.07], pos: [CX0 - 0.1, 0.11, CZ], at: Array.from({ length: 6 }, (_, i) => [0, 0, R2(-1.3 + i * 0.32)]), mat: "paperLine" });
P({ id: "cHead", layer: "contract", shape: "box", size: [2.0, 0.02, 0.22], pos: [CX0 - 0.5, 0.11, CZ - 1.5], mat: "ink" });
P({ id: "cBlank", layer: "contract", shape: "box", size: [2.6, 0.02, 0.45], pos: [CX0, 0.12, CZ + 0.95], mat: "bonus" });
P({ id: "cSign", layer: "contract", shape: "box", size: [1.2, 0.02, 0.05], pos: [CX0 + 0.8, 0.11, CZ + 1.5], mat: "ink" });

// ── S：天平（x=−30）。s3 左盤＝offer 上寫的 12 個月、右盤＝一年實拿（12 個月＋年終分紅）；s12 換成兩個資料夾 A（月薪高）／B（分紅高） ──
const SX = -30, SB = 8.6, SW = 6.2;
L("scale", { outline: [16, 3, SX, 0] });
P({ id: "sBase", layer: "scale", shape: "slab", size: [6, 0.6, 3.4], r: 0.25, bevel: 0.08, pos: [SX, 0.3, 0], mat: "dark" });
P({ id: "sCol", layer: "scale", shape: "cyl", size: [0.32, SB - 0.6], rot: [90, 0, 0], pos: [SX, R2(0.6 + (SB - 0.6) / 2), 0], mat: "brass" });
P({ id: "sHub", layer: "scale", shape: "cyl", size: [0.55, 0.8], pos: [SX, SB, 0], mat: "brass" });
P({ id: "sTop", layer: "scale", shape: "sphere", size: [0.35], pos: [SX, SB + 0.75, 0], mat: "brass" });
P({ id: "sPointer", layer: "scale", shape: "box", size: [0.12, 1.6, 0.1], pos: [SX, SB - 1.1, 0.45], mat: "red" });
P({ id: "sDial", layer: "scale", shape: "box", size: [1.8, 0.12, 0.08], pos: [SX, SB - 2.0, 0.4], mat: "steel" });
P({ id: "sBeam", layer: "scale", shape: "slab", size: [2 * SW + 1, 0.32, 0.45], r: 0.12, pos: [SX, SB, 0.2], mat: "brass" });
P({ id: "sHang", layer: "scale", shape: "box", size: [0.08, 2.0, 0.08], pos: [SX, SB - 1.0, 0.2], at: [[-SW, 0, 0], [SW, 0, 0]], mat: "steel" });
P({ id: "sPan", layer: "scale", shape: "cyl", size: [2.2, 0.18], rot: [90, 0, 0], pos: [SX, SB - 2.1, 0.2], at: [[-SW, 0, 0], [SW, 0, 0]], mat: "brass" });
const PANY = SB - 2.0;
// s3 的內容：左右各 12 片薄月薪板；右邊再加一塊橘色（年終＋分紅，高度≈12 片）
L("scaleA", { outline: [3, 2, SX - SW, 0] });
P({ id: "sMoL", layer: "scaleA", shape: "slab", size: [2.4, 0.16, 1.6], r: 0.04, pos: [SX - SW, R2(PANY + 0.08), 0.2], at: Array.from({ length: 12 }, (_, i) => [0, R2(i * 0.19), 0]), mat: "mo" });
P({ id: "sMoR", layer: "scaleA", shape: "slab", size: [2.4, 0.16, 1.6], r: 0.04, pos: [SX + SW, R2(PANY + 0.08), 0.2], at: Array.from({ length: 12 }, (_, i) => [0, R2(i * 0.19), 0]), mat: "mo" });
L("scaleB", { outline: [3, 2, SX + SW, 0] });
P({ id: "sBon", layer: "scaleB", shape: "slab", size: [2.4, 2.2, 1.6], r: 0.08, pos: [SX + SW, R2(PANY + 12 * 0.19 + 1.12), 0.2], mat: "bonus" });
// s12 的內容：兩個資料夾（厚紙夾＋金屬夾、紙張錯開 3 張）
const folder = (lay, x, mat, idp) => {
  P({ id: `${idp}F`, layer: lay, shape: "slab", size: [2.6, 0.12, 2.0], r: 0.06, pos: [x, R2(PANY + 0.06), 0.2], mat });
  P({ id: `${idp}S`, layer: lay, shape: "slab", size: [2.3, 0.05, 1.8], r: 0.03, pos: [x, R2(PANY + 0.16), 0.2], at: [[0, 0, 0], [0.08, 0.05, -0.05], [-0.06, 0.1, 0.04]], mat: "paper" });
  P({ id: `${idp}Clip`, layer: lay, shape: "box", size: [0.9, 0.1, 0.3], pos: [x, R2(PANY + 0.32), -0.6], mat: "steel" });
};
L("scaleF", { outline: [16, 2, SX, 0] });
folder("scaleF", SX - SW, "folderA", "fa"); folder("scaleF", SX + SW, "folderB", "fb");
P({ id: "faStack", layer: "scaleF", shape: "slab", size: [1.6, 2.2, 1.2], r: 0.08, pos: [SX - SW, R2(PANY + 0.4 + 1.1), 0.2], mat: "mo" });
P({ id: "faBon", layer: "scaleF", shape: "slab", size: [1.6, 0.8, 1.2], r: 0.08, pos: [SX - SW, R2(PANY + 0.4 + 2.2 + 0.45), 0.2], mat: "bonus" });
P({ id: "fbStack", layer: "scaleF", shape: "slab", size: [1.6, 1.5, 1.2], r: 0.08, pos: [SX + SW, R2(PANY + 0.4 + 0.75), 0.2], mat: "mo" });
P({ id: "fbBon", layer: "scaleF", shape: "slab", size: [1.6, 1.5, 1.2], r: 0.08, pos: [SX + SW, R2(PANY + 0.4 + 1.5 + 0.8), 0.2], mat: "bonus" });
const beamParts = ["sBeam", "sHang", "sPan", "sMoL", "sMoR", "sBon", "faF", "faS", "faClip", "fbF", "fbS", "fbClip", "faStack", "faBon", "fbStack", "fbBon", "sPointer"];

// ── C：加班費（x=30）。左：大月薪方塊，正面 30×8＝240 格（每排一個 pulse，逐排亮）；中：時鐘；右：A、B 兩堆硬幣 ──
const C0 = 30, BKX = C0 - 5.0, BKY = 2.2;
L("slab240", { outline: [6, 3, BKX, 0] });
P({ id: "bigMo", layer: "slab240", shape: "slab", size: [5.6, 4.4, 2.4], r: 0.12, bevel: 0.05, pos: [BKX, BKY, 0], mat: "mo" });
for (let r = 0; r < 8; r++) P({ id: `cellRow${r}`, layer: "slab240", shape: "plane", size: [0.15, 0.44], pos: [BKX, R2(BKY + 1.68 - r * 0.48), 1.21], grid: { n: [30, 1], step: [0.178, 0.48] }, mat: "plus" });
// 時鐘：錶面、外框、12 刻度、時針與分針（s8 一起轉）
const CK = [C0 + 1.6, 4.6, -2.2], CKR = 2.5;
L("clock", { outline: [6, 3, CK[0], 0] });
P({ id: "ckFoot", layer: "clock", shape: "slab", size: [3.4, 0.5, 2], r: 0.2, pos: [CK[0], 0.25, CK[2]], mat: "dark" });
P({ id: "ckLeg", layer: "clock", shape: "box", size: [0.5, CK[1] - CKR, 0.4], pos: [CK[0], R2((CK[1] - CKR) / 2 + 0.2), CK[2] - 0.2], mat: "steel" });
P({ id: "ckFace", layer: "clock", shape: "cyl", size: [CKR, 0.3], pos: CK, mat: "paper" });
P({ id: "ckRim", layer: "clock", shape: "tube", size: [CKR + 0.25, CKR - 0.02, 0.5], pos: CK, mat: "mo" });
for (let i = 0; i < 12; i++) { const a = (i / 12) * Math.PI * 2; P({ id: `ckT${i}`, layer: "clock", shape: "box", size: [0.14, i % 3 ? 0.36 : 0.62, 0.05], rot: [0, 0, R2((-a * 180) / Math.PI)], pos: [R2(CK[0] + Math.sin(a) * (CKR - 0.42)), R2(CK[1] + Math.cos(a) * (CKR - 0.42)), CK[2] + 0.18], mat: "ink" }); }
P({ id: "ckHour", layer: "clock", shape: "box", size: [0.2, 1.4, 0.06], pos: [CK[0], R2(CK[1] + 0.7), CK[2] + 0.24], mat: "ink" });
P({ id: "ckMin", layer: "clock", shape: "box", size: [0.12, 2.1, 0.06], pos: [CK[0], R2(CK[1] + 1.05), CK[2] + 0.3], mat: "bonus" });
P({ id: "ckHub", layer: "clock", shape: "cyl", size: [0.22, 0.2], pos: [CK[0], CK[1], CK[2] + 0.36], mat: "ink" });
// 硬幣堆：A（月薪高，硬幣大）、B（月薪低，硬幣小）；每枚一層，s8 一枚枚落下。上面那圈淺藍＝加成（前 2 小時 +1/3）
const CA = [C0 + 2.4, 2.8], CB = [C0 + 5.4, 2.8], NC = 8;
const coin = (lay, id, x, z, y, r, plus) => {
  P({ id, layer: lay, shape: "cyl", size: [r, 0.2], rot: [90, 0, 0], pos: [x, y, z], mat: "brass" });
  P({ id: `${id}p`, layer: lay, shape: "tube", size: [r + 0.02, r * 0.62, 0.22], rot: [90, 0, 0], pos: [x, y, z], mat: plus ? "plus" : "brass" });
};
for (let i = 0; i < NC; i++) {
  L(`coinA${i}`, { outline: [2, 2, CA[0], 0] }); coin(`coinA${i}`, `cnA${i}`, CA[0], CA[1], R2(0.12 + i * 0.22), 0.95, true);
  L(`coinB${i}`, { outline: [2, 2, CB[0], 0] }); coin(`coinB${i}`, `cnB${i}`, CB[0], CB[1], R2(0.12 + i * 0.22), 0.62, true);
}
P({ id: "trayAB", layer: "clock", shape: "slab", size: [6.4, 0.1, 2.8], r: 0.1, pos: [C0 + 3.9, 0.05, 2.8], mat: "paper" });
P({ id: "trayDiv", layer: "clock", shape: "box", size: [0.06, 0.04, 2.6], pos: [C0 + 3.9, 0.11, 2.8], mat: "paperLine" });

// ── J：勞退專戶罐（x=60）。A、B 兩罐；上方各懸一塊月薪方塊（A 大 B 小），切下 6% 一滴滴流進罐子；水位從桌面下升上來 ──
const J0 = 60, JA = J0 - 3.2, JB = J0 + 3.2, JR = 1.7, JH = 5.2;
for (const [k, x, wH, bw] of [["A", JA, 4.0, 3.4], ["B", JB, 2.7, 2.4]]) {
  L(`jar${k}`, { outline: [4, 4, x, 0] });
  P({ id: `jar${k}`, layer: `jar${k}`, shape: "cyl", size: [JR, JH], rot: [90, 0, 0], pos: [x, JH / 2, 0], mat: "glass" });
  P({ id: `jarLid${k}`, layer: `jar${k}`, shape: "cyl", size: [JR + 0.12, 0.35], rot: [90, 0, 0], pos: [x, JH + 0.17, 0], mat: "steel" });
  P({ id: `jarBase${k}`, layer: `jar${k}`, shape: "cyl", size: [JR + 0.05, 0.12], rot: [90, 0, 0], pos: [x, 0.06, 0], mat: "steel" });
  P({ id: `jarMark${k}`, layer: `jar${k}`, shape: "box", size: [0.5, 0.05, 0.05], pos: [x - JR * 0.55, 0, JR * 0.85], at: Array.from({ length: 5 }, (_, i) => [0, R2(1 + i * 0.9), 0]), mat: "ink" });
  L(`water${k}`, { outline: [3, 3, x, 0] });
  P({ id: `water${k}`, layer: `water${k}`, shape: "cyl", size: [JR - 0.12, wH], rot: [90, 0, 0], pos: [x, R2(wH / 2 + 0.1), 0], mat: "water" });
  L(`feed${k}`, { outline: [4, 2, x, 0] });
  P({ id: `feedBlk${k}`, layer: `feed${k}`, shape: "slab", size: [bw, 0.9, 1.8], r: 0.08, pos: [x, JH + 2.6, 0], mat: "mo" });
  P({ id: `feedCut${k}`, layer: `feed${k}`, shape: "slab", size: [R2(bw * 0.06 + 0.1), 0.92, 1.82], r: 0.02, pos: [R2(x + bw / 2 - (bw * 0.06 + 0.1) / 2), JH + 2.6, 0], mat: "plus" });
  P({ id: `feedArm${k}`, layer: `feed${k}`, shape: "box", size: [0.12, 1.6, 0.12], pos: [x, JH + 3.85, 0], mat: "steel" });
}
P({ id: "feedRail", layer: "jarA", shape: "box", size: [10.5, 0.2, 0.2], pos: [J0, JH + 4.65, 0], mat: "steel" });
P({ id: "feedPost", layer: "jarA", shape: "box", size: [0.25, JH + 4.65, 0.25], pos: [J0, R2((JH + 4.65) / 2), -1.2], mat: "steel" });
// 年終塊：從罐子旁邊經過、不切（s9：只看每月工資）
L("skipBon", { outline: [3, 2, J0, 0] });
P({ id: "skipBon", layer: "skipBon", shape: "slab", size: [2.2, 1.3, 1.6], r: 0.08, pos: [J0, 1.0, 3.6], mat: "bonus" });

// ── D：責任制三道章（x=90）。文件沿虛線往右走，依序經過「核定」「書面」「核備」三個章；每道章壓下去，文件上就多一個章印 ──
const D0 = 90, ST = [D0 - 5, D0, D0 + 5], DOC0 = D0 - 10;
L("track", { outline: [24, 3, D0, 0] });
P({ id: "dash", layer: "track", shape: "box", size: [0.7, 0.03, 0.12], pos: [D0, 0.02, 1.4], at: Array.from({ length: 22 }, (_, i) => [R2(-12 + i * 1.15), 0, 0]), mat: "mo" });
ST.forEach((x, i) => {
  P({ id: `gantry${i}`, layer: "track", shape: "box", size: [0.3, 6.2, 0.3], pos: [x, 3.1, -1.4], mat: "steel" });
  P({ id: `gantryArm${i}`, layer: "track", shape: "box", size: [0.3, 0.3, 3.0], pos: [x, 6.1, -0.05], mat: "steel" });
  P({ id: `gate${i}`, layer: "track", shape: "slab", size: [2.6, 0.06, 2.6], r: 0.08, pos: [x, 0.04, 1.4], mat: i === 2 ? "folderB" : "folderA" });
  const lay = L(`stamp${i}`, { outline: [2, 2, x, 0] });
  P({ id: `stKnob${i}`, layer: lay, shape: "sphere", size: [0.5], pos: [x, 5.25, 1.4], mat: "ink" });
  P({ id: `stHandle${i}`, layer: lay, shape: "cyl", size: [0.24, 1.8], rot: [90, 0, 0], pos: [x, 4.2, 1.4], mat: "dark" });
  P({ id: `stBody${i}`, layer: lay, shape: "slab", size: [1.6, 0.9, 1.6], r: 0.12, pos: [x, 2.9, 1.4], mat: i === 2 ? "bonus" : "mo" });
  P({ id: `stFace${i}`, layer: lay, shape: "slab", size: [1.4, 0.18, 1.4], r: 0.1, pos: [x, 2.36, 1.4], mat: "red" });
  const mk = L(`mark${i}`, { outline: [2, 2, x, 0] });
  P({ id: `mark${i}`, layer: mk, shape: "tube", size: [0.55, 0.38, 0.03], rot: [90, 0, 0], pos: [R2(DOC0 - 0.9 + i * 0.9), 0.14, 1.4], mat: "red" });
});
L("doc", { outline: [3, 3, DOC0, 0] });
P({ id: "docPaper", layer: "doc", shape: "slab", size: [3.0, 0.1, 3.6], r: 0.06, pos: [DOC0, 0.06, 1.4], mat: "paper" });
P({ id: "docLines", layer: "doc", shape: "box", size: [2.2, 0.02, 0.06], pos: [DOC0, 0.12, 1.4], at: Array.from({ length: 5 }, (_, i) => [0, 0, R2(-1.4 + i * 0.34)]), mat: "paperLine" });
P({ id: "docHead", layer: "doc", shape: "box", size: [1.4, 0.02, 0.2], pos: [DOC0 - 0.3, 0.12, -0.25 + 1.4 - 1.4], mat: "ink" });

// ── 標註點與運作動畫 ──
Object.assign(anchors, {
  pillar: { layer: "m6", p: [PX - BW / 2, 3.2, 0], dx: -120, dy: 0 },
  bonY: { layer: "bonY", p: [PX + BW / 2, TOP12 + YH / 2, 0], dx: 120, dy: 0 },
  bonD: { layer: "bonD", p: [PX + BW / 2, DY0 + DH / 2, 0], dx: 120, dy: -40 },
  gauge: { layer: "gauge", p: [GX, GY + GR, GZ], dx: 60, dy: -110 },
  contract: { layer: "contract", p: [CX0, 0.1, CZ + 0.95], dx: 120, dy: 40 },
  certs: { layer: "certs", p: [PX + 1.5, DY0 + 0.4, 0.4], dx: 120, dy: -80 },
  sL: { layer: "scale", p: [SX - SW, PANY + 2.6, 0.2], dx: -40, dy: -150 },
  sR: { layer: "scale", p: [SX + SW, PANY + 2.6, 0.2], dx: 40, dy: -150 },
  big: { layer: "slab240", p: [BKX, BKY + 2.2, 0], dx: -60, dy: -110 },
  clock: { layer: "clock", p: [CK[0], CK[1] + CKR, CK[2]], dx: 40, dy: -110 },
  coinA: { layer: "clock", p: [CA[0], 0.4, CA[1] + 1], dx: -40, dy: 110 },
  coinB: { layer: "clock", p: [CB[0], 0.4, CB[1] + 1], dx: 60, dy: 110 },
  jarA: { layer: "jarA", p: [JA - JR, 2.5, 0], dx: -110, dy: 0 },
  jarB: { layer: "jarB", p: [JB + JR, 2.5, 0], dx: 110, dy: 0 },
  st0: { layer: "track", p: [ST[0], 6.2, 0], dx: -40, dy: -100 },
  st1: { layer: "track", p: [ST[1], 6.2, 0], dx: 0, dy: -100 },
  st2: { layer: "track", p: [ST[2], 6.2, 0], dx: 40, dy: -100 },
});
Object.assign(actions, {
  growD: { type: "vibrate", grow: true, _說明: "運作 ①：分紅塊跟著獲利伸縮（±35%）；和儀表指針 swingG 同頻率、同相位（全片時間），是同一份數值", parts: ["bonDBlk", "bonDTag"], axis: [0, 1, 0], amp: 0.35, freq: 0.7 },
  swingG: { type: "rotate", swing: 62, _說明: "運作 ①：獲利儀表的指針左右擺（示意，不標數字）", parts: ["gNeedle"], axis: [0, 0, -1], freq: 0.7, pivot: [GX, GY] },
  meterD: { type: "meter", _說明: "分紅讀數條：source＝growD（和 3D 同一份數值）", anchor: "gauge", source: "growD", label: "今年分紅（示意）", lo: "少", hi: "多", accent: "amber", x: 650, y: 380, w: 340 },
  blinkY: { type: "pulse", _說明: "s6：沒寫進合約的年終＝不一定有，閃兩下", parts: ["bonYBlk"], color: "plus", freq: 1.6, glow: 0.8, halo: 0 },
  hiBlank: { type: "pulse", _說明: "s6：合約上「保障幾個月」那一欄亮起來", parts: ["cBlank"], color: "bonus", freq: 1.6, glow: 0.9, halo: 0 },
  tiltS3: { type: "rotate", angle: -9, _說明: "s3：右盤（一年實拿）比左盤（offer 上寫的月薪）重，天平往右倒", parts: beamParts, axis: [0, 0, 1], pivot: [SX, SB] },
  swingS: { type: "rotate", swing: 5, _說明: "s12：兩份 offer 在天平上來回擺（還沒決定）", parts: beamParts, axis: [0, 0, 1], freq: 0.55, pivot: [SX, SB] },
  ...Object.fromEntries(Array.from({ length: 8 }, (_, r) => [`row${r}`, { type: "pulse", _說明: `運作 ②：240 格的第 ${r + 1} 排亮起（30 天 × 8 小時）`, parts: [`cellRow${r}`], color: "bonus", steady: true, glow: 0.95, halo: 0 }])),
  slice: { type: "flow", _說明: "運作 ②：切下一格（1 小時的工資）飛到硬幣盤", path: [{ layer: "slab240", p: [BKX + 2.4, BKY, 1.3] }, { layer: "clock", p: [C0 + 2.6, 6.5, 1.5] }, { layer: "clock", p: [CA[0], 2.4, CA[1]] }], n: 3, size: 0.32, shape: "dot", rate: 0.7, color: "plus", rim: "moDark", rimScale: 1.6, rimO: 0.5, trail: 3, trailGap: 0.02, trailColor: "plus", track: true },
  hands: { type: "rotate", _說明: "運作 ②：時鐘走（分針快、時針慢）", parts: ["ckMin"], axis: [0, 0, -1], rps: 0.9, pivot: [CK[0], CK[1]] },
  handsH: { type: "rotate", _說明: "時針", parts: ["ckHour"], axis: [0, 0, -1], rps: 0.075, pivot: [CK[0], CK[1]] },
  dropA: { type: "flow", _說明: "運作 ②：每走一格掉一枚（A，月薪高）", path: [{ layer: "clock", p: [CK[0] + 1.4, CK[1] + 1.4, CK[2] + 0.5] }, { layer: "clock", p: [CA[0], 3.6, CA[1]] }, { layer: "clock", p: [CA[0], 1.9, CA[1]] }], n: 2, size: 0.42, shape: "dot", rate: 0.9, color: "brass", rim: "moDark", rimScale: 1.4, rimO: 0.5, trail: 2, trailGap: 0.03, trailColor: "plus", track: false },
  dropB: { type: "flow", _說明: "B（月薪低）硬幣比較小", path: [{ layer: "clock", p: [CK[0] + 1.6, CK[1] + 1.0, CK[2] + 0.5] }, { layer: "clock", p: [CB[0], 3.6, CB[1]] }, { layer: "clock", p: [CB[0], 1.9, CB[1]] }], n: 2, size: 0.28, shape: "dot", rate: 0.9, phase: 0.25, color: "brass", rim: "moDark", rimScale: 1.4, rimO: 0.5, trail: 2, trailGap: 0.03, trailColor: "plus", track: false },
  dripA: { type: "flow", _說明: "運作 ③：A 的月薪切下 6% 滴進勞退罐", path: [{ layer: "feedA", p: [JA + 1.4, JH + 2.1, 0] }, { layer: "jarA", p: [JA, JH - 0.3, 0] }, { layer: "jarA", p: [JA, 3.6, 0] }], n: 4, size: 0.34, shape: "dot", rate: 0.9, color: "plus", rim: "moDark", rimScale: 1.5, rimO: 0.5, trail: 3, trailGap: 0.02, trailColor: "plus", track: false },
  dripB: { type: "flow", _說明: "B 的月薪比較少，滴下來的也小", path: [{ layer: "feedB", p: [JB + 1.0, JH + 2.1, 0] }, { layer: "jarB", p: [JB, JH - 0.3, 0] }, { layer: "jarB", p: [JB, 2.4, 0] }], n: 4, size: 0.24, shape: "dot", rate: 0.9, phase: 0.2, color: "plus", rim: "moDark", rimScale: 1.5, rimO: 0.5, trail: 3, trailGap: 0.02, trailColor: "plus", track: false },
  docGo: { type: "flow", _說明: "運作 ④：文件要走的路（三道章）", path: [[DOC0, 0.3, 1.4], [D0 + 9, 0.3, 1.4]], layer: "track", n: 5, size: 0.24, shape: "arrow", rate: 0.5, color: "mo", track: false },
  ...Object.fromEntries([0, 1, 2].map((i) => [`press${i}`, { type: "pulse", _說明: `運作 ④：第 ${i + 1} 道章蓋下去時亮一下`, parts: [`stFace${i}`, `stBody${i}`], color: "bonus", steady: true, glow: 0.8, halo: 0 }])),
  pulseD: { type: "pulse", _說明: "s11：明年的分紅＝還不知道（閃）", parts: ["bonDBlk"], color: "plus", freq: 1.2, glow: 0.7, halo: 0 },
});

const model = {
  name: "示意辦公桌：年薪柱（12 塊月薪＋年終＋分紅）、獲利儀表、合約、天平、240 格月薪方塊、時鐘與硬幣堆、勞退專戶罐、三道章。比例與物件是示意，不仿任何公司的文件。由 gen-model.mjs 產生，不要手改",
  unit: "示意",
  size: { w: 20, h: 2.4, r: 0.4, t: 12 },
  palette, materials,
  partNames: { desk: "桌面", kb: "鍵盤", pen: "筆", mug: "咖啡杯", pad: "便條本", mBlk: "月薪方塊", mSlip: "薪資單紙條", bon: "年終／分紅", cert: "股票憑證", g: "獲利儀表", c: "合約", s: "天平", fa: "資料夾 A", fb: "資料夾 B", bigMo: "月薪方塊（240 格）", cellRow: "格子列", ck: "時鐘", cn: "硬幣", tray: "硬幣盤", jar: "勞退專戶罐", water: "水位", feed: "月薪方塊（提撥）", skipBon: "年終（不提撥）", dash: "虛線", gantry: "章架", gate: "關卡", st: "公文章", mark: "章印", doc: "文件" },
  layers, parts, anchors, actions,
  pose: { yaw0: 0, yawIso: 0, drift: 0 },
  camera: { stand: { d: 50, elev: 15, y: 6.4 } },
  fx: { dpr: 1, srcPx: 30, shadows: 0, ghost: false, guides: false, fog: false, dust: false, vaporSprites: false, shimmer: false },
};
const out = path.join(path.dirname(new URL(import.meta.url).pathname), "model.json");
fs.writeFileSync(out, JSON.stringify(model, null, 1) + "\n");
console.log(`✔ ${out}：${parts.length} 個零件、${layers.length} 層`);

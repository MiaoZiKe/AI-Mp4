// CaffAIne LOGO 動畫（C 款白卡杯）的純計算：時間表、卡片飛行矩陣、震動、各東西的框（版面檢查共用）。
import TL from "./caffaineTimeline.json";
import { CAFF } from "./caffaineMark";

export const TIMELINE = TL;
export const W = 1080, H = 1920;
export const CX = 0.866, SY = 0.5;
export type M6 = [number, number, number, number, number, number];
export const mul = (m: M6, n: M6): M6 => [m[0] * n[0] + m[2] * n[1], m[1] * n[0] + m[3] * n[1], m[0] * n[2] + m[2] * n[3], m[1] * n[2] + m[3] * n[3], m[0] * n[4] + m[2] * n[5] + m[4], m[1] * n[4] + m[3] * n[5] + m[5]];
export const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
export const hash = (n: number) => { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
export const easeOut = (t: number) => 1 - Math.pow(1 - clamp(t), 3);
export const easeInOut = (t: number) => { t = clamp(t); return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; };
/** 過衝的彈出（c 越大過衝越多） */
export const backOut = (t: number, c = 1.7) => { t = clamp(t); return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2); };
/** 配色（THEME_ISO 的值，這裡只放幾何用不到顏色） */

// ───────── 版面（1080×1920）─────────
export const CARD = { w: 520, h: 580 }, CARD_C = { x: 540, y: 676 };
export const WORD = { px: 104, base: 1190 };
export const WORD_W = 8 * 0.6 * WORD.px, WORD_X0 = (W - WORD_W) / 2;
export const TAG_BOX = { x: 70, y: 1250, w: 940, h: 64 };
export const KW_BOX = { x: 130, y: 1352, w: 820, h: 104 };
export const LOGO_BOX = { x: 64, y: 214, w: 330, h: 88 };
export const PROGRESS_BOX = { x: 64, y: 304, w: 952, h: 8 };
export const DESK = { cx: 540, top: 640, S: 1300 };
/** 桌上的小東西（世界座標 → 螢幕框；在 kw 列下面） */
export const PROPS = [{ name: "鍵盤", x: 880, y: 1000, w: 260, h: 110 }, { name: "盆栽", x: 1150, y: 900, w: 60, h: 60 }];

// ───────── 卡片飛行：桌面上平躺 → 翻起轉正 ─────────
const K_LY = 0.6;
export const lyMat = (cx: number, cy: number): M6 => { const a = K_LY * CX, b = K_LY * SY; return [a, b, -a, b, cx - ((CARD.w - CARD.h) * a) / 2, cy - ((CARD.w + CARD.h) * b) / 2]; };
export const rot = (deg: number): M6 => { const r = (deg * Math.PI) / 180, c = Math.cos(r), s = Math.sin(r); return [c, s, -s, c, 0, 0]; };
export const at2 = (x: number, y: number, k = 1): M6 => [k, 0, 0, k, x, y];
const mix = (a: M6, b: M6, t: number): M6 => a.map((v, i) => v + (b[i] - v) * t) as M6;
/** 三張卡：0＝後面紫、1＝後面黃、2＝白色主卡；dx dy 偏移、deg 轉角、delay 晚幾幀出發、lying 桌上平躺的位置 */
export const CARDS = [
  { dx: -28, dy: 36, deg: -6, delay: 5, lying: [470, 1190], bg: "plum" },
  { dx: 36, dy: -10, deg: 5, delay: 3, lying: [610, 1215], bg: "note" },
  { dx: 0, dy: 0, deg: 0, delay: 0, lying: [540, 1200], bg: "white" },
] as const;
export const cardMat = (i: number, f: number): M6 => {
  const c = CARDS[i], t = clamp((f - TL.flip[0] - c.delay) / (TL.flip[1] - TL.flip[0])), e = easeInOut(Math.pow(t, 0.85));
  const up = mul(at2(CARD_C.x + c.dx, CARD_C.y + c.dy), mul(rot(c.deg), at2(-CARD.w / 2, -CARD.h / 2)));
  const m = mix(lyMat(c.lying[0], c.lying[1]), up, e);
  m[5] -= 190 * Math.sin(Math.PI * e);       // 往上的弧
  return m;
};
/** 落地後的彈性縮放（以卡片中心） */
export const landScale = (f: number) => { const t = f - (TL.flip[1] - 2 + 0); if (t < 0) return 1; return 1 + 0.07 * Math.exp(-t / 5.5) * Math.cos(t * 0.85); };
/** 鎖定那一下整張卡再彈一次 */
export const lockScale = (f: number) => { const t = f - TL.lock; if (t < -4) return 1; if (t < 0) return 1 - 0.03 * ((t + 4) / 4); return 1 + 0.075 * Math.exp(-t / 5) * Math.cos(t * 0.8); };
export const shakeAt = (f: number) => {
  let dx = 0, dy = 0;
  for (const h of TL.hits) { const t = f - h.f; if (t >= 0 && t < 10) { const d = 1 - t / 10; dx += h.amp * 20 * d * Math.sin(t * 2.4 + 0.9); dy += h.amp * 15 * d * Math.cos(t * 3.1); } }
  return { dx: Math.round(dx), dy: Math.round(dy) };
};
export const applyM = (m: M6, x: number, y: number): [number, number] => [m[0] * x + m[2] * y + m[4], m[1] * x + m[3] * y + m[5]];

// ───────── 卡片內容（卡片局部座標 520×580）─────────
export const CUP_K = 2.2, CUP_OX = 260, CUP_OY = 96;                 // 杯子圖（LOGO 格子 8 單位）→ 卡片座標：(x-100)*K + OX, (y-12)*K + OY
export const cupX = (x: number) => (x - 100) * CUP_K + CUP_OX, cupY = (y: number) => (y - 12) * CUP_K + CUP_OY;
export const CELL = 8.2 * CUP_K;
/** 杯子格：由下往上長出來，每格有小抖動 */
export const CUPCELLS = ([...(CAFF.cup as unknown as number[][]).map((p) => ({ p, k: "cup" })), ...(CAFF.handle as unknown as number[][]).map((p) => ({ p, k: "handle" }))]).map(({ p, k }, i) => {
  const row = (p[1] - 92) / 8;
  return { x: p[0], y: p[1], k, at: TL.cupStart + (10 - row) * TL.cupRowStep + hash(i * 3.3) * 2.2 };
});
export const AICELLS = (CAFF.ai as unknown as number[][]).map(([x, y]) => ({ x, y }));
/** 掃描光的位置（卡片局部 y）：由杯頂掃到杯底 */
export const scanY = (f: number) => { const [a, b] = TL.scan; return cupY(60) + (cupY(176) - cupY(60)) * easeInOut((f - a) / (b - a)); };
export const cupCenter = () => [cupX(100), cupY(132)] as const;

// ───────── 各東西的框（版面檢查）─────────
export type Box = { name: string; x: number; y: number; w: number; h: number };
export const wordBoxes = (f: number, hasKw: boolean): Box[] => {
  const out: Box[] = [], cw = 0.6 * WORD.px, top = WORD.base - 0.8 * WORD.px;
  TL.letters.forEach((lf, i) => { if (f >= lf) { const idx = i < 4 ? i : i + 2, t = backOut((f - lf) / 6, 2), dy = Math.round(46 * (1 - t)); out.push({ name: `字${"Caffne"[i]}`, x: WORD_X0 + idx * cw + 6, y: top + dy, w: cw - 12, h: 0.9 * WORD.px }); } });
  if (f >= TL.stamp) out.push({ name: "AI色塊", x: WORD_X0 + 4 * cw + 1, y: top - 10, w: 2 * cw - 2, h: WORD.px * 1.1 });
  return out;
};
export const cardBox = (f: number): Box => {
  // 三張卡的聯集（含放大與震動）
  const sc = landScale(f) * lockScale(f), sh = shakeAt(f);
  let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
  for (let i = 0; i < 3; i++) {
    const m = cardMat(i, f);
    for (const [x, y] of [[0, 0], [CARD.w, 0], [0, CARD.h + 16], [CARD.w, CARD.h + 16]]) {
      let [px, py] = applyM(m, x, y);
      px = CARD_C.x + (px - CARD_C.x) * sc + sh.dx; py = CARD_C.y + (py - CARD_C.y) * sc + sh.dy;
      x0 = Math.min(x0, px); x1 = Math.max(x1, px); y0 = Math.min(y0, py); y1 = Math.max(y1, py);
    }
  }
  return { name: "卡片", x: x0, y: y0, w: x1 - x0, h: y1 - y0 };
};
const wo = (a: { x: number; y: number }) => [(a.x - a.y) * CX + DESK.cx, (a.x + a.y) * SY + DESK.top];
export const propBoxes = (): Box[] => PROPS.map((p) => { const pts = [wo({ x: p.x, y: p.y }), wo({ x: p.x + p.w, y: p.y }), wo({ x: p.x, y: p.y + p.h }), wo({ x: p.x + p.w, y: p.y + p.h })]; const xs = pts.map((q) => q[0]), ys = pts.map((q) => q[1]); const x = Math.min(...xs), y = Math.min(...ys); return { name: p.name, x, y: y - (p.name === "盆栽" ? 110 : 12), w: Math.max(...xs) - x, h: Math.max(...ys) - y + 24 + (p.name === "盆栽" ? 110 : 0) }; });
export const boxesAt = (f: number, hasKw = true, header = true): Box[] => {
  const out: Box[] = [];
  if (header) out.push({ name: "頁首LOGO", ...LOGO_BOX }, { name: "進度條", ...PROGRESS_BOX });
  out.push(cardBox(f), ...wordBoxes(f, hasKw));
  if (f >= TL.tagline) out.push({ name: "標語", ...TAG_BOX });
  if (hasKw && f > TL.keyword) { const dy = Math.round(40 * (1 - backOut((f - TL.keyword) / 7, 1.4))); out.push({ name: "留言列", ...KW_BOX, y: KW_BOX.y + dy }); }
  return out;
};

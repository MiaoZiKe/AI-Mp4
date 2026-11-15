// CaffAIne 片尾卡的「純計算」：位置、時間、震動、方塊飛行。畫面（CaffEnd.tsx）與版面檢查（scripts/caffaine/layout-check.mjs）共用同一份，
// 所以檢查看到的框就是畫面上畫的框。時間表在 caffaineTimeline.json（招牌音也讀它）。
import TL from "./caffaineTimeline.json";
import { CAFF } from "./caffaineMark";

export const W = 1080, H = 1920;
export const TIMELINE = TL;
/** 配色（取自 LOGO 定稿 SVG） */
export const CC = { cocoa: "#3B281F", caramel: "#C77A3A", accent: "#E9A25D", cream: "#FFF6E8", bg: "#F4ECDF", glow: "#F5B873", ink2: "#6A5445" } as const;

/** 圖形：mark 座標（x 22–178、y 12–182）→ 螢幕 */
export const S = 4.8, MARK_CX = 540, MARK_TOP = 384;
export const mx = (u: number) => MARK_CX + (u - 100) * S;
export const my = (v: number) => MARK_TOP + (v - 12) * S;
export const MARK_BOX = { x: mx(18), y: my(10), w: 164 * S, h: 176 * S };
export const MARK_CENTER = { x: 540, y: my(97) };

/** 字標：8 個字母的 x（字標單位，C 的左緣＝0）；高 91、基線在 91；整排放大 K 倍置中 */
export const K = 1.3, WORD_BASE = 1372, WORD_W = 644;
export const WORD_X0 = (W - WORD_W * K) / 2;
export const LETTERS = ["C", "a", "f", "f", "A", "I", "n", "e"] as const;
export const LX = [0, 74.4, 148.8, 223.2, 305, 409, 495.7, 570.1];
export const LW = [70, 70, 70, 70, 78, 78, 70, 70]; // 等寬字母實際字面比 74.4 的字距窄一點
export const letterBox = (i: number) => ({ x: WORD_X0 + LX[i] * K, y: WORD_BASE - 91 * K, w: LW[i] * K, h: 91 * K });

/** 標語與留言列 */
export const TAG_BOX = { x: 70, y: 1430, w: 940, h: 92 };
export const KW_BOX = { x: 90, y: 1580, w: 900, h: 110 };
export const TAG_TEXT = "一杯咖啡的時間，看懂一個 AI 新知";
/** 頁首左上角 LOGO（每幕同位置同大小） */
export const LOGO_BOX = { x: 64, y: 222, w: 368, h: 72 };
export const PROGRESS_BOX = { x: 64, y: 304, w: 952, h: 8 };
/** 上下兩條「音量條」裝飾帶：最高 200px（不碰頁首 LOGO 與留言列） */
export const BAR_N = 27, BAR_W = 40, BAR_MAX = 200;

export const hash = (n: number) => { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
export const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const easeOut = (t: number) => 1 - Math.pow(1 - clamp(t), 3);

// ───────── 拼圖方塊：框線（可可）、杯身（焦糖）、杯把 ─────────
export type Piece = { id: number; kind: "frame" | "cup" | "handle"; x: number; y: number; w: number; h: number; arrive: number; sx: number; sy: number; color: string };
const buildPieces = (): Piece[] => {
  const out: Piece[] = [];
  const poly = CAFF.frame as unknown as number[][];
  let id = 0;
  const [fa, fb] = TL.frameArrive, [ca, cb] = TL.cupArrive;
  const far = (i: number) => {
    const ang = ((Math.floor(hash(i * 3.7) * 8) + hash(i * 1.3) * 0.7) / 8) * Math.PI * 2, d = 1300 + hash(i * 5.1) * 500;
    return { sx: Math.cos(ang) * d, sy: Math.sin(ang) * d };
  };
  for (let s = 0; s < poly.length - 1; s++) {
    const [x0, y0] = poly[s], [x1, y1] = poly[s + 1];
    const horiz = y0 === y1, len = Math.abs(horiz ? x1 - x0 : y1 - y0), dir = horiz ? Math.sign(x1 - x0) : Math.sign(y1 - y0);
    const ext0 = s === 0 ? 0 : 3.5, ext1 = s === poly.length - 2 ? 0 : 3.5;
    const a = -ext0, total = len + ext0 + ext1, n = Math.max(1, Math.ceil(total / 8)), step = total / n;
    for (let k = 0; k < n; k++) {
      const t0 = a + k * step, t1 = t0 + step;
      const p0 = (horiz ? x0 : y0) + dir * t0, p1 = (horiz ? x0 : y0) + dir * t1, lo = Math.min(p0, p1), l = Math.abs(p1 - p0);
      const piece = horiz ? { x: lo, y: y0 - 3.5, w: l, h: 7 } : { x: x0 - 3.5, y: lo, w: 7, h: l };
      out.push({ id, kind: "frame", ...piece, arrive: fa + hash(id * 2.9) * (fb - fa), ...far(id), color: CC.cocoa }); id++;
    }
  }
  for (const [x, y] of CAFF.cup as unknown as number[][]) { out.push({ id, kind: "cup", x, y, w: 8, h: 8, arrive: ca + hash(id * 2.9) * (cb - ca), ...far(id), color: CC.caramel }); id++; }
  for (const [x, y] of CAFF.handle as unknown as number[][]) { out.push({ id, kind: "handle", x, y, w: 8, h: 8, arrive: TL.handleArrive, ...far(id), color: CC.accent }); id++; }
  return out;
};
export const PIECES = buildPieces();
/** 方塊在第 f 幀的進度 0–1（0＝還在遠處、1＝到位）；飛行時位置貼齊 8px 格（八位元感） */
export const pieceProgress = (p: Piece, f: number) => clamp(f / p.arrive);
export const piecePos = (p: Piece, f: number, back = 0) => {
  const t = clamp(pieceProgress(p, f) - back), e = easeOut(t);
  const tx = mx(p.x), ty = my(p.y);
  let x = tx + p.sx * (1 - e) * S / 4.8, y = ty + p.sy * (1 - e) * S / 4.8;
  if (t < 1) { x = Math.round(x / 8) * 8; y = Math.round(y / 8) * 8; }
  return { x, y, w: p.w * S, h: p.h * S, done: t >= 1 };
};

// ───────── 震動、縮放、撞擊 ─────────
export const HITS = TL.hits as { f: number; amp: number; kind: string }[];
/** 整個圖形組的震動位移（每次撞擊的第一幀就有位移，和撞擊音同一幀） */
export const shakeAt = (f: number) => {
  let dx = 0, dy = 0;
  for (const h of HITS) { const t = f - h.f; if (t >= 0 && t < 9) { const d = 1 - t / 9; dx += h.amp * 22 * d * Math.sin(t * 2.4 + 0.9); dy += h.amp * 16 * d * Math.cos(t * 3.1); } }
  return { dx: Math.round(dx), dy: Math.round(dy) };
};
/** 鎖定前先縮一點（蓄力），鎖定瞬間彈大、阻尼回彈 */
export const lockScale = (f: number) => {
  const L0 = TL.lock;
  if (f < L0 - 5) return 1;
  if (f < L0) return 1 - 0.035 * ((f - (L0 - 5)) / 5);
  const t = f - L0;
  return 1 + 0.08 * Math.exp(-t / 5) * Math.cos(t * 0.8);
};
export const markBoxAt = (f: number) => {
  const s = lockScale(f), { dx, dy } = shakeAt(f);
  const w = MARK_BOX.w * s, h = MARK_BOX.h * s;
  return { x: MARK_CENTER.x - (MARK_CENTER.x - MARK_BOX.x) * s + dx, y: MARK_CENTER.y - (MARK_CENTER.y - MARK_BOX.y) * s + dy, w, h };
};
export const wordShake = (f: number) => shakeAt(f);

// ───────── 逐項時間 ─────────
/** 字母 i 的彈出幀 */
export const letterAt = (i: number) => TL.letters[i];
/** 字母彈出：由下往上跳進來（只過衝一點點位置，不放大過頭，所以鄰字不會互相碰到）；scale 0.6→1 */
export const letterPop = (i: number, f: number) => {
  const t = clamp((f - letterAt(i)) / 6);
  const c1 = i === 4 || i === 5 ? 2.6 : 1.7, back = 1 + (c1 + 1) * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
  return { on: f >= letterAt(i), scale: 0.6 + 0.4 * Math.min(1, back), dy: Math.round(46 * (1 - back)) };
};
/** 蒸氣方塊：由下往上依序長出 */
export const STEAM = ([...(CAFF.steam as unknown as number[][])].sort((a, b) => b[1] - a[1] || a[0] - b[0])).map(([x, y], j) => ({ x, y, j, at: TL.steamStart + j * TL.steamStep }));
/** AI 像素：鎖定後依序閃亮 */
export const AICELLS = (CAFF.ai as unknown as number[][]).map(([x, y], j) => ({ x, y, j, at: TL.aiFlicker + Math.floor(hash(j * 4.1) * 6) }));

/** 此刻畫面上每個「主要東西」的框（版面檢查用；特效粒子、背景、音量條不算主要東西，另外檢查） */
export const boxesAt = (f: number) => {
  const out: { name: string; x: number; y: number; w: number; h: number }[] = [];
  out.push({ name: "頁首LOGO", ...LOGO_BOX }, { name: "進度條", ...PROGRESS_BOX });
  const sh = wordShake(f);
  out.push({ name: "圖形", ...markBoxAt(f) });
  for (let i = 0; i < 8; i++) if (f >= letterAt(i)) { const b = letterBox(i), q = letterPop(i, f), sc = q.scale; out.push({ name: `字${LETTERS[i]}${i}`, x: b.x + b.w / 2 - (b.w * sc) / 2 + sh.dx, y: b.y + b.h / 2 - (b.h * sc) / 2 + sh.dy + q.dy, w: b.w * sc, h: b.h * sc }); }
  if (f >= TL.tagline) out.push({ name: "標語", ...TAG_BOX, y: TAG_BOX.y + tagDy(f) });
  if (f > TL.keyword) out.push({ name: "留言列", ...KW_BOX, y: KW_BOX.y + kwDy(f) });
  return out;
};
export const backOut = (f: number, at: number, dur: number, c = 1.7) => { const t = clamp((f - at) / dur); return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2); };
/** 標語、留言列進場時往下偏多少 px（0＝到位；過衝時為負＝微微往上） */
export const tagDy = (f: number) => Math.round(18 * (1 - backOut(f, TL.tagline, 8, 1.2)));
export const kwDy = (f: number) => Math.round(40 * (1 - backOut(f, TL.keyword, 7, 1.4)));
export const hitFrames = () => HITS.map((h) => h.f);

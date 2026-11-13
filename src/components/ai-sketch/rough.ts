// 手繪線條產生器：把「線、框、圈、箭頭、叉、勾、波浪、塗色、小圖」變成一筆一筆的 SVG path（座標有固定 seed 的手抖）。
// 每一筆帶長度，畫的時候依長度分配時間。不用 Math.random。
import { seeded } from "../anim";
import { THEME_SKETCH as T } from "../../theme";

export type P = [number, number];
export type Stroke = { d: string; len: number };
const r1 = (n: number) => Math.round(n * 10) / 10;
const dist = (a: P, b: P) => Math.hypot(a[0] - b[0], a[1] - b[1]);
const polyLen = (ps: P[]) => ps.slice(1).reduce((s, p, i) => s + dist(ps[i], p), 0);

/** 筆：base 決定這個形狀固定的手抖，boil 是每隔幾幀換一次的小抖動（線條像重描） */
export type Pen = { j: (amp?: number) => number };
export const makePen = (seed: number, phase: number): Pen => {
  const base = seeded(seed * 7919 + 13), boil = seeded(seed * 104729 + phase * 331 + 7);
  for (let i = 0; i < 3; i++) { base(); boil(); }
  return { j: (amp = T.wobble.jitter) => (base() - 0.5) * 2 * amp + (boil() - 0.5) * 2 * T.motion.boilAmp };
};

/** 平滑曲線（Catmull-Rom → 三次貝茲） */
const smooth = (ps: P[]): Stroke => {
  let d = `M${r1(ps[0][0])} ${r1(ps[0][1])}`;
  for (let i = 0; i < ps.length - 1; i++) {
    const p0 = ps[i - 1] ?? ps[i], p1 = ps[i], p2 = ps[i + 1], p3 = ps[i + 2] ?? p2;
    d += ` C${r1(p1[0] + (p2[0] - p0[0]) / 6)} ${r1(p1[1] + (p2[1] - p0[1]) / 6)} ${r1(p2[0] - (p3[0] - p1[0]) / 6)} ${r1(p2[1] - (p3[1] - p1[1]) / 6)} ${r1(p2[0])} ${r1(p2[1])}`;
  }
  return { d, len: polyLen(ps) };
};
/** 折線（每一段微微彎） */
const poly = (ps: P[], pen: Pen, amp?: number): Stroke => {
  const q = ps.map((p) => [p[0] + pen.j(amp), p[1] + pen.j(amp)] as P);
  let d = `M${r1(q[0][0])} ${r1(q[0][1])}`;
  for (let i = 1; i < q.length; i++) {
    const a = q[i - 1], b = q[i], L = dist(a, b) || 1, bow = pen.j(1) * L * T.wobble.bow;
    const mx = (a[0] + b[0]) / 2 - ((b[1] - a[1]) / L) * bow, my = (a[1] + b[1]) / 2 + ((b[0] - a[0]) / L) * bow;
    d += ` Q${r1(mx)} ${r1(my)} ${r1(b[0])} ${r1(b[1])}`;
  }
  return { d, len: polyLen(q) };
};
const curve = (ps: P[], pen: Pen, amp?: number): Stroke => smooth(ps.map((p) => [p[0] + pen.j(amp), p[1] + pen.j(amp)] as P));
const rect = (x: number, y: number, w: number, h: number, pen: Pen): Stroke => poly([[x, y], [x + w, y], [x + w, y + h], [x, y + h], [x + pen.j(2), y - 5]], pen);
/** 圈：多繞一點、頭尾不對齊，像人手圈的 */
const ellipse = (cx: number, cy: number, rx: number, ry: number, pen: Pen, start = -2.4, turns = 1.09): Stroke => {
  const n = 30, ps: P[] = [];
  for (let i = 0; i <= n; i++) {
    const u = i / n, a = start + u * turns * Math.PI * 2, k = 0.97 + 0.06 * u;
    ps.push([cx + Math.cos(a) * rx * k + pen.j(1.6), cy + Math.sin(a) * ry * k + pen.j(1.6)]);
  }
  return smooth(ps);
};
const head = (tip: P, from: P, size: number, pen: Pen): Stroke => {
  const a = Math.atan2(tip[1] - from[1], tip[0] - from[0]);
  const w = (s: number): P => [tip[0] - Math.cos(a + s * 0.5) * size, tip[1] - Math.sin(a + s * 0.5) * size];
  return poly([w(1), tip, w(-1)], pen, 1.5);
};
const squiggle = (x: number, y: number, w: number, amp: number, period: number, pen: Pen): Stroke => {
  const ps: P[] = [];
  const n = Math.max(2, Math.round(w / (period / 2)));
  for (let i = 0; i <= n; i++) ps.push([x + (w * i) / n, y + (i % 2 ? -amp : amp) + pen.j(1.5)]);
  return smooth(ps);
};
/** 螢光筆塗色：斜的來回塗滿一個框 */
const hatch = (x: number, y: number, w: number, h: number, gap: number, pen: Pen): Stroke => {
  const ps: P[] = [[x, y + h]];
  const n = Math.max(1, Math.round(w / gap));
  for (let i = 0; i <= n; i++) { const px = x + (w * i) / n; ps.push([px + gap * 0.35, y], [Math.min(x + w, px + gap), y + h]); }
  return poly(ps, pen, 2.5);
};

export type ShapeSpec = { type: string; box?: number[]; pts?: number[][]; [k: string]: any };
/** 形狀 → 筆畫清單（座標已加上 origin） */
export const strokesOf = (s: ShapeSpec, pen: Pen): Stroke[] => {
  const b = s.box ?? [0, 0, 0, 0];
  const [x, y, w, h] = b;
  const pts = (s.pts ?? []).map((p) => [p[0], p[1]] as P);
  switch (s.type) {
    case "line": return [poly([[x, y], [w, h]], pen)];
    case "rect": return [rect(x, y, w, h, pen)];
    case "ellipse": return [ellipse(x, y, w, h, pen, s.start, s.turns)];
    case "curve": return [curve(pts, pen)];
    case "poly": return [poly(pts, pen)];
    case "arrow": { const c = curve(pts, pen, 2); const n = pts.length; return [c, head(pts[n - 1], pts[n - 2], s.head ?? 34, pen)]; }
    case "cross": return [poly([[x, y], [x + w, y + h]], pen), poly([[x + w, y], [x, y + h]], pen)];
    case "check": return [poly([[x, y + h * 0.55], [x + w * 0.36, y + h], [x + w, y]], pen)];
    case "squiggle": return [squiggle(x, y, w, s.amp ?? 9, s.period ?? 44, pen)];
    case "underline": return s.double ? [curve([[x, y], [x + w / 2, y + 4], [x + w, y - 2]], pen), curve([[x + w - 10, y + 16], [x + w / 2, y + 20], [x + 14, y + 15]], pen)] : [curve([[x, y], [x + w / 2, y + 4], [x + w, y - 2]], pen)];
    case "hatch": return [hatch(x, y, w, h, s.gap ?? 34, pen)];
    case "brace": { // 右大括號：box＝[x, y, 寬, 高]
      const m = y + h / 2;
      return [curve([[x, y], [x + w * 0.45, y + 14], [x + w * 0.5, m - 40], [x + w, m], [x + w * 0.5, m + 40], [x + w * 0.45, y + h - 14], [x, y + h]], pen, 1.5)];
    }
    case "bubble": { // 對話框：尾巴在左邊
      const t = y + h * 0.5;
      return [poly([[x, y], [x + w, y], [x + w, y + h], [x, y + h], [x, t + 26], [x - 42, t + 8], [x, t - 20], [x + pen.j(2), y - 5]], pen)];
    }
    case "send": return [poly([[x, y], [x + w, y + h / 2], [x, y + h], [x + w * 0.22, y + h / 2], [x, y]], pen, 1.5)];
    case "book": return [
      poly([[x + w / 2, y + h * 0.12], [x, y], [x, y + h * 0.86], [x + w / 2, y + h], [x + w, y + h * 0.86], [x + w, y], [x + w / 2, y + h * 0.12], [x + w / 2, y + h]], pen, 1.8),
      poly([[x + w * 0.12, y + h * 0.32], [x + w * 0.38, y + h * 0.42]], pen, 1), poly([[x + w * 0.12, y + h * 0.52], [x + w * 0.38, y + h * 0.62]], pen, 1),
      poly([[x + w * 0.62, y + h * 0.42], [x + w * 0.88, y + h * 0.32]], pen, 1), poly([[x + w * 0.62, y + h * 0.62], [x + w * 0.88, y + h * 0.52]], pen, 1),
    ];
    case "robot": { // 機器人頭：天線、頭、耳朵、眼睛、嘴（mood: flat｜smile）
      const hx = x + w * 0.1, hy = y + h * 0.26, hw = w * 0.8, hh = h * 0.74, ey = hy + hh * 0.4, er = w * 0.07;
      const mouth = s.mood === "smile"
        ? curve([[hx + hw * 0.28, hy + hh * 0.66], [hx + hw * 0.5, hy + hh * 0.82], [hx + hw * 0.72, hy + hh * 0.66]], pen, 1)
        : poly([[hx + hw * 0.32, hy + hh * 0.74], [hx + hw * 0.68, hy + hh * 0.74]], pen, 1);
      return [
        rect(hx, hy, hw, hh, pen),
        poly([[x + w / 2, hy], [x + w / 2, y + h * 0.1]], pen, 1), ellipse(x + w / 2, y + h * 0.055, w * 0.05, w * 0.05, pen),
        poly([[hx, hy + hh * 0.35], [x, hy + hh * 0.35], [x, hy + hh * 0.65], [hx, hy + hh * 0.65]], pen, 1.2),
        poly([[hx + hw, hy + hh * 0.35], [x + w, hy + hh * 0.35], [x + w, hy + hh * 0.65], [hx + hw, hy + hh * 0.65]], pen, 1.2),
        ellipse(hx + hw * 0.3, ey, er, er, pen), ellipse(hx + hw * 0.7, ey, er, er, pen), mouth,
      ];
    }
    case "spark": { // 三條小短線（強調）
      const out: Stroke[] = [];
      for (const a of s.angles ?? [-70, -35, 0]) { const r = (a * Math.PI) / 180; out.push(poly([[x + Math.cos(r) * w * 0.45, y + Math.sin(r) * w * 0.45], [x + Math.cos(r) * w, y + Math.sin(r) * w]], pen, 1)); }
      return out;
    }
    default: return [];
  }
};

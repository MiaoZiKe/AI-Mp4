// 2026/11/16 tech-yield（科技透明圈 第 4 支「晶圓良率」）的 2D 圖層：hud.levels[].art = "yield"。
// 整支片的畫面都在這裡（不掛 3D 畫布）：用固定的斜視投影（cabinet 式 2.5D，只有仰角、沒有偏航，所以晶片格投影後仍是矩形）
// 畫晶圓、晶片格、缺陷雨、探針台（吸盤 XY 步進＋Z 升降、探針卡固定不動）、晶圓地圖、缺陷特寫、面積對照、晶片放大與雷射熔絲、良率曲線、拆小再拼。
// 規格：videos/tech-yield/device-spec.md。數字全部由程式算（真實格線實排、固定亂數的 71 個缺陷、泊松曲線），三處（3D 晶圓、2D 地圖、計數器）同一份資料。
// 物理：缺陷與晶片塊受重力落下（位移 ∝ t²）、落地回彈（恢復係數 e）、撞擊壓扁；吸盤升降用阻尼；碎塊飛出走拋物線。
// 時間：script.json 那一級的 cues（「幕_cue」→ 絕對幀，Hud.tsx 換好）；沒對到的 cue 是 1e9（那段不出現）。
// 版面檢查：每個字與卡片都登記到 YB（scripts/three/yield-check.mjs 逐幀檢查重疊）；顏色只讀 H 與 H.art（theme-hud-skins.json 的 y* 鍵）。
import React from "react";
import { FONT_EN, FONT_ZH } from "../../theme";
import { H, L } from "./hudSkin";
import { artRegion, textW, type Rect } from "./hudLayout";
import { EASE, tween } from "../anim";

// ───────── 版面登記（給 yield-check） ─────────
export type YBox = { k: string; r: Rect; g?: string; t?: string };
export const YB: { on: boolean; list: YBox[] } = { on: false, list: [] };
const reg = (k: string, r: Rect, g?: string, t?: string) => { if (YB.on) YB.list.push({ k, r, g, t }); };

const A = new Proxy({} as Record<string, string>, { get: (_, k) => ((H.art as any)[k] ?? H.line) as string });
const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
const mix = (a: number, b: number, t: number) => a + (b - a) * t;
const range = (n: number) => Array.from({ length: n }, (_, i) => i);
const zhS = (px: number, c: string, w = 800): React.CSSProperties => ({ fontFamily: FONT_ZH, fontSize: px, fill: c, fontWeight: w, whiteSpace: "pre" });
const monoS = (px: number, c: string, w = 700): React.CSSProperties => ({ fontFamily: `${H.font.mono}, ${FONT_EN}`, fontSize: px, fill: c, fontWeight: w, fontVariantNumeric: "tabular-nums" });

// ───────── 資料：格線實排與 71 個缺陷（seed 38；條件見 device-spec 0.4） ─────────
type Die = { x0: number; y0: number; x1: number; y1: number; full: boolean; hit: number; i: number };
const RU = 147, RW = 150;
const mulberry = (a: number) => () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
export const DEFECTS: [number, number][] = (() => { const r = mulberry(38), p: [number, number][] = []; while (p.length < 71) { const x = r() * 300 - 150, y = r() * 300 - 150; if (x * x + y * y <= RW * RW) p.push([x, y]); } return p; })();
const makeGrid = (w: number, h: number, ox: number, oy: number): Die[] => {
  const out: Die[] = [];
  for (let j = -20; j < 20; j++) for (let i = -20; i < 20; i++) {
    const x0 = ox + i * w, y0 = oy + j * h, x1 = x0 + w, y1 = y0 + h, cs = [[x0, y0], [x1, y0], [x0, y1], [x1, y1]];
    const full = cs.every(([x, y]) => x * x + y * y <= RU * RU);
    // 邊緣不完整的格（和 150 mm 圓有交集但不全在 147 mm 內）畫灰色、不計
    const nx = Math.max(x0, Math.min(0, x1)), ny = Math.max(y0, Math.min(0, y1));
    if (!full && nx * nx + ny * ny > RW * RW) continue;
    const hit = full ? DEFECTS.findIndex(([x, y]) => x >= x0 && x < x1 && y >= y0 && y < y1) : -1;
    out.push({ x0, y0, x1, y1, full, hit, i: out.length });
  }
  return out;
};
export const GS = makeGrid(10, 10, 4, 5), GL = makeGrid(25, 32, 0, 12);
/** 每個缺陷打壞的第一格（同一格被兩點打中只算一次）：hitAt[g][d] = 被第 d 個缺陷「第一次」打壞的格 */
const firstHits = (g: Die[]) => { const m: Record<number, number[]> = {}; for (const d of g) if (d.full && d.hit >= 0) { const k = d.hit; (m[k] ??= []).push(d.i); } return m; };
const FH = { S: firstHits(GS), L: firstHits(GL) };
export const STATS = (() => { const f = (g: Die[]) => { const full = g.filter((d) => d.full), bad = full.filter((d) => d.hit >= 0).length; return { all: full.length, bad, good: full.length - bad }; }; return { S: f(GS), L: f(GL) }; })();
/** 記憶體列壞掉的那一顆（s11 拉出來修）：缺陷落在晶片下方記憶體區（局部 u 0.22–0.78、v 0.2–0.4），挑離中心近的 */
const MEM = { u0: 0.2, u1: 0.8, v0: 0.18, v1: 0.42, rows: 8, s0: 0.1, s1: 0.16 };
export const REPAIR = (() => {
  let best: { d: Die; u: number; v: number } | null = null, bd = 1e9;
  for (const d of GS) {
    if (!d.full || d.hit < 0) continue;
    const [x, y] = DEFECTS[d.hit], u = (x - d.x0) / 10, v = (y - d.y0) / 10;
    if (u < 0.24 || u > 0.76 || v < 0.2 || v > 0.4) continue;
    const r = Math.hypot((d.x0 + d.x1) / 2 + 40, (d.y0 + d.y1) / 2 - 10);
    if (r < bd) { bd = r; best = { d, u, v }; }
  }
  if (best) return best;
  const d = GS.find((x) => x.full && x.hit >= 0) as Die; return { d, u: 0.5, v: 0.3 };
})();
/** s13 拉出來的大晶片：被打壞、離中心近的一顆；壞的那一塊＝缺陷所在的四分之一 */
export const BIG = (() => { const c = GL.filter((d) => d.full && d.hit >= 0).sort((a, b) => Math.hypot(a.x0 + 12.5, a.y0 + 16) - Math.hypot(b.x0 + 12.5, b.y0 + 16))[0]; const [x, y] = DEFECTS[c.hit]; return { d: c, q: (x - c.x0 < 12.5 ? 0 : 1) + (y - c.y0 < 16 ? 2 : 0), u: (x - c.x0) / 25, v: (y - c.y0) / 32 }; })();

// ───────── 投影（世界座標單位＝cm；x 右、y 往畫面裡、z 上） ─────────
type V = { cx: number; cy: number; s: number; E: number };
const P = (v: V, x: number, y: number, z = 0): [number, number] => { const e = (v.E * Math.PI) / 180; return [v.cx + v.s * x, v.cy - v.s * (y * Math.sin(e) + z * Math.cos(e))]; };
const sinE = (v: V) => Math.sin((v.E * Math.PI) / 180), cosE = (v: V) => Math.cos((v.E * Math.PI) / 180);
const lerpV = (a: V, b: V, t: number): V => ({ cx: mix(a.cx, b.cx, t), cy: mix(a.cy, b.cy, t), s: mix(a.s, b.s, t), E: mix(a.E, b.E, t) });

// ───────── 物理 ─────────
const FALL = 12, Z0 = 9, REST = 0.32;
/** 自由落體落到 z=0（第 land 幀著地）＋一次回彈（恢復係數 REST）：回傳高度（cm）與壓扁量（0–1） */
export const dropZ = (f: number, land: number, z0 = Z0, T = FALL) => {
  const tau = f - (land - T);
  if (tau < 0) return { z: z0, vis: false, sq: 0 };
  if (f <= land) return { z: z0 * (1 - (tau / T) ** 2), vis: true, sq: 0 };
  const g = (2 * z0) / (T * T), v1 = REST * g * T, Tb = (2 * v1) / g, t = f - land;
  const z = t < Tb ? v1 * t - 0.5 * g * t * t : 0;
  const sq = t < 3 ? 1 - t / 3 : t >= Tb && t < Tb + 2 ? 0.35 * (1 - (t - Tb) / 2) : 0;
  return { z: Math.max(0, z), vis: true, sq };
};
/** 阻尼振盪（過衝後收斂）：0→1 */
const damp = (t: number, w = 0.55, tau = 4) => (t <= 0 ? 0 : 1 - Math.exp(-t / tau) * Math.cos(w * t));

// ───────── 小元件 ─────────
type TxtP = { x: number; y: number; t: string; px: number; c?: string; w?: number; a?: "start" | "middle" | "end"; o?: number; g?: string; mono?: boolean; k?: string };
const Txt: React.FC<TxtP> = ({ x, y, t, px, c = H.text, w = 800, a = "middle", o = 1, g, mono, k = "txt" }) => {
  if (o <= 0.02) return null;
  const tw = textW(t, px, mono ? 0.06 : 0.02), x0 = a === "middle" ? x - tw / 2 : a === "end" ? x - tw : x;
  reg(k, { x0, x1: x0 + tw, y0: y - px * 0.9, y1: y + px * 0.22 }, g, t);
  return <text x={x} y={y} textAnchor={a} opacity={o} style={mono ? monoS(px, c, w) : zhS(px, c, w)}>{t}</text>;
};
/** 小標（細框白底）：狀態標籤用 */
const Tag: React.FC<{ x: number; y: number; t: string; c?: string; px?: number; o: number; g?: string }> = ({ x, y, t, c = H.line, px = 32, o, g }) => {
  if (o <= 0.02) return null;
  const w = textW(t, px) + 40, h = px * 1.3 + 14, gg = g ?? `tag:${t}`;
  reg("tag", { x0: x - w / 2, x1: x + w / 2, y0: y - h / 2, y1: y + h / 2 }, gg, t);
  return (
    <g opacity={o} transform={`translate(0 ${(1 - o) * 10})`}>
      <rect x={x - w / 2} y={y - h / 2} width={w} height={h} fill={H.panel} stroke={c} strokeWidth={2.5} />
      <text x={x} y={y + px * 0.36} textAnchor="middle" style={zhS(px, c, 700)}>{t}</text>
    </g>
  );
};
/** 蓋章（實心色塊、先大後小、微歪）：≤8 字 */
const Stamp: React.FC<{ x: number; y: number; t: string; f: number; at: number; until?: number; c?: string; px?: number; rot?: number }> = ({ x, y, t, f, at, until = 1e9, c = H.amber, px = 60, rot = -5 }) => {
  const k = tween(f, at, 5, EASE.enter) * (1 - tween(f, until, 6, EASE.exit));
  if (k <= 0.02) return null;
  const slam = 1 + 0.6 * (1 - tween(f, at, 6, EASE.enter)) + 0.05 * Math.sin(Math.PI * tween(f, at + 6, 8, EASE.move));
  const w = textW(t, px) + px * 0.72 + 8, h = px * 1.32 + 10, ext = Math.abs(Math.sin((rot * Math.PI) / 180));
  reg("stamp", { x0: x - (w + h * ext) / 2 - 8, x1: x + (w + h * ext) / 2 + 8, y0: y - (h + w * ext) / 2 - 8, y1: y + (h + w * ext) / 2 + 8 }, `stamp:${t}`, t);
  const fg = c === H.amber ? ((H as any).onAmber ?? H.onAccent) : H.onAccent;
  return (
    <g opacity={k} transform={`translate(${x} ${y}) rotate(${rot}) scale(${slam})`}>
      <rect x={-w / 2 - 8} y={-h / 2 - 8} width={w + 16} height={h + 16} fill="none" stroke={c} strokeWidth={3} />
      <rect x={-w / 2} y={-h / 2} width={w} height={h} fill={c} />
      <text x={0} y={px * 0.36} textAnchor="middle" style={zhS(px, fg, 900)}>{t}</text>
    </g>
  );
};
/** 卡片（白底細框＋頂端色條） */
const Card: React.FC<{ x: number; y: number; w: number; h: number; o: number; g: string; c?: string; children?: React.ReactNode; dy?: number }> = ({ x, y, w, h, o, g, c = H.line, children, dy = 0 }) => {
  if (o <= 0.02) return null;
  reg("card", { x0: x, x1: x + w, y0: y + dy, y1: y + h + dy }, g);
  return (
    <g opacity={o} transform={`translate(0 ${dy})`}>
      <rect x={x} y={y} width={w} height={h} rx={14} fill={H.panel} stroke={H.lineSoft} strokeWidth={2.5} />
      <rect x={x} y={y} width={w} height={7} rx={3} fill={c} />
      {children}
    </g>
  );
};
/** 數字翻牌：from→to，dur 幀內滾完（每換一個數字，那一格往上翻一下） */
const roll = (f: number, at: number, to: number, dur = 16, from = 0) => Math.round(from + (to - from) * EASE.count(clamp01((f - at) / dur)));
const flipY = (f: number, at: number, dur = 16) => { const t = clamp01((f - at) / dur); return t > 0 && t < 1 ? 4 * Math.sin(f * 2.1) : 0; };

// ───────── 晶圓 ─────────
type DieSt = (d: Die) => { c: string; o?: number; lift?: number; ring?: boolean } | null;
type DefDraw = { x: number; y: number; z: number; sq: number; rip: number; o?: number }[];
const Wafer: React.FC<{ id: string; v: V; g: Die[]; w: number; h: number; o: number; st: DieSt; defs?: DefDraw; tex?: boolean; main?: boolean; shadow?: boolean }> = ({ id, v, g, w, h, o, st, defs = [], tex = true, main = true, shadow = true }) => {
  if (o <= 0.01) return null;
  const R = 15, se = sinE(v), ce = cosE(v), rx = v.s * R, ry = v.s * R * se, th = Math.max(4, v.s * 0.6 * ce);
  const [cx, cy] = P(v, 0, 0, 0), street = Math.max(1, v.s * 0.1);
  if (main) reg("main", { x0: cx - rx, x1: cx + rx, y0: cy - ry, y1: cy + ry + th }, `wafer:${id}`);
  const clip = `wclip-${id}`;
  // 缺口（6 點鐘）：在近端邊緣切一個小 V
  const nW = v.s * 0.55, nH = v.s * 0.45 * se;
  const notch = `M ${cx - nW} ${cy + ry - 0.5} L ${cx} ${cy + ry - nH} L ${cx + nW} ${cy + ry - 0.5} Z`;
  const pw = (v.s * w) / 10, ph = (v.s * h * se) / 10;
  const ox = P(v, g[0] ? g[0].x0 / 10 : 0, 0)[0], oy = P(v, 0, g[0] ? g[0].y1 / 10 : 0)[1];
  return (
    <g opacity={o}>
      <defs>
        <clipPath id={clip}><ellipse cx={cx} cy={cy} rx={rx} ry={ry} /></clipPath>
        {tex ? <pattern id={`wtex-${id}`} width={pw} height={ph} patternUnits="userSpaceOnUse" x={ox} y={oy}>
          <rect x={street * 0.5 + pw * 0.12} y={street * 0.5 + ph * 0.12} width={pw * 0.76 - street} height={ph * 0.76 - street} fill="none" stroke={A.yTex} strokeWidth={Math.max(0.6, v.s * 0.03)} />
          {range(3).map((i) => <line key={i} x1={pw * 0.2} x2={pw * 0.8} y1={ph * (0.35 + i * 0.15)} y2={ph * (0.35 + i * 0.15)} stroke={A.yTex} strokeWidth={Math.max(0.5, v.s * 0.02)} />)}
          <line x1={pw * 0.5} x2={pw * 0.5} y1={ph * 0.25} y2={ph * 0.75} stroke={A.yTex} strokeWidth={Math.max(0.5, v.s * 0.02)} />
        </pattern> : null}
      </defs>
      {shadow ? <ellipse cx={cx + rx * 0.03} cy={cy + th + ry * 0.06} rx={rx * 1.01} ry={ry * 1.02} fill={H.text} opacity={0.08} /> : null}
      {/* 側邊（厚度示意，倒角＝上緣一條亮線） */}
      <ellipse cx={cx} cy={cy + th} rx={rx} ry={ry} fill={A.yEdge} />
      <rect x={cx - rx} y={cy} width={rx * 2} height={th} fill={A.yEdge} />
      <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill={A.yStreet} />
      <g clipPath={`url(#${clip})`}>
        {g.map((d) => {
          const s = d.full ? st(d) : null;
          const [x0, y0] = P(v, d.x0 / 10, d.y1 / 10), [x1, y1] = P(v, d.x1 / 10, d.y0 / 10);
          const lift = s?.lift ?? 0;
          return <rect key={d.i} x={x0 + street / 2} y={y0 + street / 2 - lift} width={Math.max(0.5, x1 - x0 - street)} height={Math.max(0.5, y1 - y0 - street)} fill={d.full ? (s?.c ?? A.yFace) : A.yGray} opacity={d.full ? s?.o ?? 1 : 0.85} />;
        })}
        {tex ? <rect x={cx - rx} y={cy - ry} width={rx * 2} height={ry * 2} fill={`url(#wtex-${id})`} opacity={0.55} /> : null}
        {/* 干涉光澤（淡紫一道斜帶） */}
        <path d={`M ${cx - rx * 0.9} ${cy - ry * 0.2} L ${cx - rx * 0.35} ${cy - ry} L ${cx - rx * 0.1} ${cy - ry} L ${cx - rx * 0.75} ${cy + ry * 0.1} Z`} fill={A.yIri} opacity={0.16} />
        {/* 邊緣 3 mm 不放格：最外一圈 */}
        <ellipse cx={cx} cy={cy} rx={rx * (147 / 150)} ry={ry * (147 / 150)} fill="none" stroke={A.yRim} strokeWidth={Math.max(1, v.s * 0.12)} opacity={0.7} />
      </g>
      <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill="none" stroke={H.panel} strokeWidth={2} opacity={0.9} />
      <path d={notch} fill={A.yEdge} />
      {/* 缺陷：落下中（高度＋地面影子）、著地（壓扁＋波紋） */}
      {defs.map((p, i) => {
        const [sx, sy] = P(v, p.x / 10, p.y / 10, 0), [, hy] = P(v, p.x / 10, p.y / 10, p.z), r = Math.max(3.2, v.s * 0.2);
        return (
          <g key={i} opacity={p.o ?? 1}>
            {p.z > 0.05 ? <ellipse cx={sx} cy={sy} rx={r * (1 - p.z / (Z0 * 1.6))} ry={r * se * 0.7 * (1 - p.z / (Z0 * 1.6))} fill={H.text} opacity={0.22} /> : null}
            {p.rip > 0 && p.rip < 1 ? <ellipse cx={sx} cy={sy} rx={r * (1 + 4 * p.rip)} ry={r * se * (1 + 4 * p.rip)} fill="none" stroke={A.yDefect} strokeWidth={2} opacity={0.75 * (1 - p.rip)} /> : null}
            <ellipse cx={sx} cy={hy - r * (1 - p.sq * 0.4) * 0.2} rx={r * (1 + 0.35 * p.sq)} ry={r * (1 - 0.4 * p.sq)} fill={A.yDefect} stroke={A.yDefRim} strokeWidth={1.6} />
          </g>
        );
      })}
    </g>
  );
};
/** 缺陷雨：第 i 個缺陷第 land(i) 幀著地；回傳要畫的缺陷與「這一幀已打壞的格」 */
const rain = (f: number, land: (i: number) => number, z0 = Z0): { defs: DefDraw; hitF: (i: number) => number } => {
  const defs: DefDraw = [];
  DEFECTS.forEach(([x, y], i) => { const lf = land(i), d = dropZ(f, lf, z0); if (!d.vis) return; defs.push({ x, y, z: d.z, sq: d.sq, rip: f >= lf ? (f - lf) / 14 : 0 }); });
  return { defs, hitF: land };
};
/** 格子在第 f 幀的顏色：被打中那一幀起變紅（前 4 幀亮一點） */
const rainSt = (f: number, land: (i: number) => number, extra?: (d: Die) => any): DieSt => (d) => {
  const e = extra?.(d); if (e) return e;
  if (d.hit < 0) return null;
  const lf = land(d.hit); if (f < lf) return null;
  return { c: A.yBad, o: f - lf < 4 ? 0.7 : 1 };
};
const landedDefs = (o = 1): DefDraw => DEFECTS.map(([x, y]) => ({ x, y, z: 0, sq: 0, rip: 0, o }));

// ───────── 版面常數（畫面 px） ─────────
const VL: V = { cx: 292, cy: 790, s: 440 / 30, E: 62 }, VR: V = { cx: 788, cy: 790, s: 440 / 30, E: 62 };
const VS: V = { cx: 540, cy: 778, s: 620 / 30, E: 60 }, VD: V = { cx: 540, cy: 640, s: 600 / 30, E: 60 };
const VP: V = { cx: 470, cy: 618, s: 15, E: 28 };

/** 一段畫面的出現程度：a 起 6 幀進場，b 前 6 幀退場（換段時先退後進，不疊） */
const seg = (f: number, a: number, b: number, d = 6) => (f < a || f >= b ? 0 : Math.min(tween(f, a, d, EASE.enter), 1 - tween(f, b - d, d, EASE.exit)));

// ───────── 各段 ─────────
type C = Record<string, number>;

/** 兩片並排（s1、s9–s11）：rain 是這一段的缺陷雨；counters 是計數器內容 */
const Pair: React.FC<{ f: number; o: number; land: ((i: number) => number) | null; faint?: number; lines: { a: [string, string]; b: [string, string]; aAt: [number, number]; bAt: [number, number] }; bracket: number; boxAt?: number; slideR?: number; vl?: V; fadeR?: number; hide?: number }> = ({ f, o, land, faint = 0, lines, bracket, boxAt, slideR = 0, vl = VL, fadeR = 1, hide = -1 }) => {
  if (o <= 0.01) return null;
  const rs = land ? rain(f, land) : null, defs = rs ? rs.defs : faint > 0 ? landedDefs(faint) : [];
  const stS = land ? rainSt(f, land, hide >= 0 ? (d) => (d.i === hide ? { c: A.yBad, o: 0 } : null) : undefined) : () => null, stL = land ? rainSt(f, land) : () => null;
  const vr = { ...VR, cx: VR.cx + slideR };
  // 框選（螢光框，不是手繪圈）：兩片各框一顆已變紅的格
  const pick = (g: Die[], v: V) => { const d = g.filter((x) => x.full && x.hit >= 0 && x.hit < 20).sort((a, b) => Math.hypot(a.x0 - 10, a.y0 + 20) - Math.hypot(b.x0 - 10, b.y0 + 20))[0]; if (!d) return null; const [x0, y0] = P(v, d.x0 / 10, d.y1 / 10), [x1, y1] = P(v, d.x1 / 10, d.y0 / 10); return { x0, y0, x1, y1 }; };
  const kb = boxAt !== undefined ? tween(f, boxAt, 5, EASE.enter) : 0;
  const bxS = kb > 0 ? pick(GS, vl) : null, bxL = kb > 0 ? pick(GL, vr) : null;
  const lineSet = (cx: number, l: [string, string], at: [number, number], g: string) => (
    <g>
      <g transform={`translate(0 ${flipY(f, at[0])})`}><Txt x={cx} y={1068} t={l[0]} px={56} c={H.text} w={900} o={tween(f, at[0], 5, EASE.enter)} g={g} /></g>
      <g transform={`translate(0 ${flipY(f, at[1])})`}><Txt x={cx} y={1120} t={l[1]} px={36} c={H.text2} w={800} o={tween(f, at[1], 5, EASE.enter)} g={g} /></g>
    </g>
  );
  const kBr = tween(f, bracket, 8, EASE.move);
  return (
    <g opacity={o}>
      <Wafer id="pS" v={vl} g={GS} w={10} h={10} o={1} st={stS} defs={defs} />
      <Wafer id="pL" v={vr} g={GL} w={25} h={32} o={fadeR} st={stL} defs={defs} />
      <Txt x={vl.cx} y={570} t="小晶片 10×10 mm" px={34} c={H.text2} w={800} g="pairlab" />
      <Txt x={vr.cx} y={570} t="大晶片 25×32 mm" px={34} c={H.text2} w={800} o={fadeR} g="pairlab2" />
      {[bxS, bxL].map((b, i) => b ? <rect key={i} x={b.x0 - 4} y={b.y0 - 4} width={b.x1 - b.x0 + 8} height={b.y1 - b.y0 + 8} fill={H.amber} fillOpacity={0.22} stroke={H.amber} strokeWidth={4} opacity={kb} /> : null)}
      {lineSet(vl.cx, lines.a, lines.aAt, "cntA")}
      {fadeR > 0.5 ? lineSet(vr.cx, lines.b, lines.bAt, "cntB") : null}
      {/* 「同樣的缺陷分布」括號：兩片晶圓下方連起來 */}
      {kBr > 0.02 && fadeR > 0.5 ? (
        <g opacity={kBr}>
          <path d={`M ${vl.cx - 120} 1146 V 1160 H ${vr.cx + 120} V 1146`} fill="none" stroke={H.line} strokeWidth={3} strokeDasharray={`${2000 * kBr} 2000`} />
          <rect x={540 - 165} y={1166} width={330} height={52} fill={H.line} />
          <Txt x={540} y={1205} t="同樣的缺陷分布" px={36} c={H.onAccent} w={900} g="bracket" />
        </g>
      ) : null}
    </g>
  );
};

/** 放大鏡（s2）：鏡圈內才看得到缺陷 */
const Magnifier: React.FC<{ f: number; at: number; v: V; o: number }> = ({ f, at, v, o }) => {
  const t = clamp01((f - at) / 40);
  if (f < at - 2 || o <= 0.02) return null;
  const ex = EASE.move(t), mx = mix(170, 920, ex), my = mix(560, 980, ex), r = 118, k = tween(f, at - 2, 4) * (1 - tween(f, at + 40, 6));
  if (k <= 0.01) return null;
  reg("lens", { x0: mx - r, x1: mx + r, y0: my - r, y1: my + r }, "wafer:sB:lens");
  return (
    <g opacity={k * o}>
      <defs><clipPath id="lensclip"><circle cx={mx} cy={my} r={r} /></clipPath></defs>
      <circle cx={mx} cy={my} r={r} fill={A.yGlass} opacity={0.35} />
      <g clipPath="url(#lensclip)">
        <g transform={`translate(${mx} ${my}) scale(1.5) translate(${-mx} ${-my})`}>
          {DEFECTS.map(([x, y], i) => { const [sx, sy] = P(v, x / 10, y / 10); return <ellipse key={i} cx={sx} cy={sy} rx={5} ry={4} fill={A.yDefect} stroke={A.yDefRim} strokeWidth={1.4} />; })}
        </g>
      </g>
      <circle cx={mx} cy={my} r={r} fill="none" stroke={A.yChuck3} strokeWidth={10} />
      <circle cx={mx} cy={my} r={r - 7} fill="none" stroke={H.panel} strokeWidth={2} opacity={0.8} />
      <line x1={mx + r * 0.72} y1={my + r * 0.72} x2={mx + r * 1.35} y2={my + r * 1.35} stroke={A.yChuck3} strokeWidth={22} strokeLinecap="round" />
    </g>
  );
};

/** 缺陷特寫（s3）：左＝微粒落在兩條線之間（短路）；右＝一條線斷一截（斷路） */
const DefectCard: React.FC<{ f: number; o: number; c: C }> = ({ f, o, c }) => {
  if (o <= 0.02) return null;
  const cardY = 300, pH = 640, pW = 400;
  const panel = (x: number, kind: "p" | "l") => {
    const lx = [x + 70, x + 170, x + 270, x + 330].slice(0, 3), on = kind === "p" ? c.s3_particle : c.s3_line;
    const y0 = cardY + 70, y1 = y0 + pH - 150;
    const k = tween(f, on - 4, 6);
    // 微粒：從上方落下（重力＋回彈），著地在第 1、2 條線之間並把兩條線接起來
    const land = on + 6, d = dropZ(f, land, 1, 10), py = (y0 + y1) / 2 + 20, pz = d.z * 260;
    const gapFlash = kind === "l" && f >= on ? 0.5 + 0.5 * Math.cos((f - on) * 0.6) : 0;
    return (
      <g>
        <rect x={x} y={y0} width={pW} height={y1 - y0} fill={A.board} stroke={H.lineSoft} strokeWidth={2} />
        {range(9).map((i) => <line key={i} x1={x} x2={x + pW} y1={y0 + 20 + i * 42} y2={y0 + 20 + i * 42} stroke={A.yTex} strokeWidth={1} opacity={0.5} />)}
        {lx.map((xx, i) => kind === "l" && i === 1
          ? <g key={i}><rect x={xx - 18} y={y0 + 16} width={36} height={py - 46 - y0 - 16} fill={A.edge} /><rect x={xx - 18} y={py + 40} width={36} height={y1 - 16 - py - 40} fill={A.edge} />
              <rect x={xx - 24} y={py - 50} width={48} height={94} fill="none" stroke={H.coral} strokeWidth={4} strokeDasharray="8 6" opacity={k * (0.4 + 0.6 * gapFlash)} /></g>
          : <rect key={i} x={xx - 18} y={y0 + 16} width={36} height={y1 - y0 - 32} fill={A.edge} />)}
        {kind === "p" && d.vis ? (
          <g>
            {f >= land ? <rect x={lx[0] + 18} y={py - 14} width={lx[1] - lx[0] - 36} height={28} fill={H.coral} opacity={0.35 + 0.25 * Math.sin((f - land) * 0.5)} /> : null}
            <ellipse cx={(lx[0] + lx[1]) / 2} cy={py - pz} rx={58 * (1 + 0.25 * d.sq)} ry={52 * (1 - 0.3 * d.sq)} fill={A.yDefect} stroke={A.yDefRim} strokeWidth={4} />
            <ellipse cx={(lx[0] + lx[1]) / 2 - 18} cy={py - pz - 16} rx={14} ry={9} fill={A.yDefRim} opacity={0.35} />
          </g>
        ) : null}
        <Txt x={x + pW / 2} y={y1 + 66} t={kind === "p" ? "微粒" : "線沒印好"} px={48} c={H.text} w={900} o={k} g={`dc-${kind}`} />
        {f >= on + (kind === "p" ? 8 : 2) ? <Txt x={x + pW / 2} y={y1 + 112} t={kind === "p" ? "兩條線被接起來（短路）" : "線斷了一截（斷路）"} px={32} c={H.coral} w={800} o={tween(f, on + (kind === "p" ? 8 : 2), 5)} g={`dc-${kind}2`} /> : null}
      </g>
    );
  };
  return (
    <Card x={64} y={cardY} w={952} h={pH + 160} o={o} g="defcard">
      <Txt x={540} y={cardY + 52} t="一格晶片表面（放大畫，非實際比例）" px={32} c={H.text2} w={800} g="defcard" />
      {panel(104, "p")}{panel(576, "l")}
    </Card>
  );
};

// ───────── 探針台（s6–s7） ─────────
type Site = { x: number; y: number; row: number; dies: number[] };
const SITES: Site[] = (() => {
  // 站點＝2×2 顆，對齊晶片格（小晶片格偏移 4、5 mm）；只留有完整晶片的站點，蛇行排序（逐列來回）
  const full = GS.filter((d) => d.full), out: Site[] = [];
  const xs = [...new Set(full.map((d) => d.x0))].sort((a, b) => a - b), ys = [...new Set(full.map((d) => d.y0))].sort((a, b) => b - a);
  const rows: Site[][] = [];
  for (let r = 0; r < ys.length; r += 2) {
    const row: Site[] = [];
    for (let q = 0; q < xs.length; q += 2) {
      const dies = full.filter((d) => (d.x0 === xs[q] || d.x0 === xs[q + 1]) && (d.y0 === ys[r] || d.y0 === ys[r + 1])).map((d) => d.i);
      if (dies.length) row.push({ x: (xs[q] + 10) / 10, y: (ys[r] + (ys[r + 1] !== undefined ? 0 : 10)) / 10, row: r / 2, dies });
    }
    rows.push(row);
  }
  // 從第一列「有 5 個以上整站（4 顆都完整）」的列開始蛇行往下，最上面那幾列（邊緣站點只有 1–2 顆）最後快轉補測：慢動作那 5 站每站都是 4 顆
  const k0 = Math.max(0, rows.findIndex((r) => r.filter((x) => x.dies.length === 4).length >= 6));
  const order = [...rows.slice(k0), ...rows.slice(0, k0).reverse()];
  order.forEach((row, i) => { const r2 = i % 2 ? [...row].reverse() : row; const first = r2.findIndex((x) => x.dies.length === 4); out.push(...(i === 0 && first > 0 ? [...r2.slice(first), ...r2.slice(0, first)] : r2)); });
  return out;
})();
const SLOW = 5, CYC = 12;
/** 第 f 幀的探針狀態：吸盤偏移（ox, oy）、升降 dz（cm）、電流強度、每顆晶片的受測幀 */
const probePlan = (c: C) => {
  const t0 = c.s6_test - 3, end = Math.min(c.s7_map - 4, c.v8 - 10);
  const rows = Math.max(...SITES.map((s) => s.row)) + 1, firstFast = SITES[SLOW]?.row ?? rows;
  const fastRows = [...new Set(SITES.slice(SLOW).map((x) => x.row))], ft0 = t0 + SLOW * CYC;
  const step = Math.max(1, Math.min(2, Math.floor((end - ft0) / Math.max(1, fastRows.length))));
  const testedAt: Record<number, number> = {};
  SITES.forEach((s, k) => { const tf = k < SLOW ? t0 + k * CYC + 3 : ft0 + (fastRows.indexOf(s.row) + (s.row === SITES[SLOW - 1].row ? 0 : 0)) * step; for (const d of s.dies) testedAt[d] = tf; });
  return { t0, ft0, step, fastRows, testedAt, firstFast, endFast: ft0 + fastRows.length * step };
};
const probeAt = (f: number, pl: ReturnType<typeof probePlan>) => {
  const ctr = (s: Site) => [-s.x, -s.y];
  if (f < pl.t0) { const [ox, oy] = ctr(SITES[0]); return { ox, oy, dz: -1.2, cur: 0, fast: false, k: -1 }; }
  if (f < pl.ft0) {
    const k = Math.floor((f - pl.t0) / CYC), u = f - pl.t0 - k * CYC, s = SITES[k], n = SITES[k + 1] ?? s;
    const [ax, ay] = ctr(s), [bx, by] = ctr(n);
    // Z：0–3 升（阻尼到過壓 +0.12）、3–7 通電、7–9 降、9–12 平移（S 曲線）
    const dz = u < 7 ? -1.2 + 1.32 * damp(u * 1.2, 0.9, 1.6) : u < 9 ? mix(0.12, -1.2, EASE.move((u - 7) / 2)) : -1.2;
    const m = u < 9 ? 0 : EASE.move((u - 9) / 3);
    const cur = u >= 3 && u < 7 ? 1 : u >= 7 && u < 11 ? 1 - (u - 7) / 4 : 0;
    return { ox: mix(ax, bx, m), oy: mix(ay, by, m), dz, cur, fast: false, k };
  }
  // 快轉：每 step 幀整列一起測；吸盤在列中間附近快步移動、不下壓
  const r = Math.min(pl.fastRows.length - 1, Math.floor((f - pl.ft0) / pl.step)), row = SITES.filter((s) => s.row === pl.fastRows[r]);
  const s = row[Math.floor(row.length / 2)] ?? SITES[SITES.length - 1], [ox, oy] = ctr(s);
  const done = f >= pl.endFast;
  return { ox: done ? 0 : ox, oy: done ? 0 : oy, dz: -1.2, cur: 0, fast: !done, k: 99 };
};
const box3 = (v: V, x0: number, x1: number, y0: number, y1: number, z0: number, z1: number, top: string, front: string, key: string, stroke?: string) => {
  const [ax, ay] = P(v, x0, y1, z1), [bx, by] = P(v, x1, y0, z1), [, cy2] = P(v, x0, y0, z0);
  return <g key={key}><rect x={ax} y={ay} width={bx - ax} height={by - ay} fill={top} stroke={stroke} strokeWidth={stroke ? 1.5 : 0} /><rect x={ax} y={by} width={bx - ax} height={cy2 - by} fill={front} stroke={stroke} strokeWidth={stroke ? 1.5 : 0} /></g>;
};
const cyl3 = (v: V, x: number, y: number, r: number, z0: number, z1: number, top: string, side: string, key: string, extra?: React.ReactNode) => {
  const [cx, cyT] = P(v, x, y, z1), [, cyB] = P(v, x, y, z0), rx = v.s * r, ry = v.s * r * sinE(v);
  return <g key={key}><ellipse cx={cx} cy={cyB} rx={rx} ry={ry} fill={side} /><rect x={cx - rx} y={cyT} width={rx * 2} height={cyB - cyT} fill={side} /><ellipse cx={cx} cy={cyT} rx={rx} ry={ry} fill={top} />{extra}</g>;
};
/** 橢圓弧上的點（世界座標圓，半徑 r、角度 a 度） */
const ringPts = (v: V, r: number, z: number, a0: number, a1: number, n = 36) => range(n + 1).map((i) => { const a = ((a0 + ((a1 - a0) * i) / n) * Math.PI) / 180; return P(v, r * Math.cos(a), r * Math.sin(a), z); });
const pathOf = (pts: [number, number][]) => pts.map((p, i) => `${i ? "L" : "M"} ${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(" ");
/** 沿折線走的光點（拖尾）：u＝0–1 的位置 */
const along = (pts: [number, number][], u: number): [number, number] => {
  const seg = pts.slice(1).map((p, i) => Math.hypot(p[0] - pts[i][0], p[1] - pts[i][1])), tot = seg.reduce((a, b) => a + b, 0);
  let d = clamp01(u) * tot;
  for (let i = 0; i < seg.length; i++) { if (d <= seg[i]) { const t = seg[i] ? d / seg[i] : 0; return [mix(pts[i][0], pts[i + 1][0], t), mix(pts[i][1], pts[i + 1][1], t)]; } d -= seg[i]; }
  return pts[pts.length - 1];
};

/** 晶圓地圖（2D 俯視，和 3D 同一份格線與受測幀） */
const WaferMap: React.FC<{ cx: number; cy: number; D: number; f: number; st: (d: Die) => string | null; g?: string }> = ({ cx, cy, D, f, st, g = "map" }) => {
  const s = D / 300;
  reg("map", { x0: cx - D / 2, x1: cx + D / 2, y0: cy - D / 2, y1: cy + D / 2 }, g);
  return (
    <g>
      <defs><clipPath id={`mclip-${g}`}><circle cx={cx} cy={cy} r={D / 2} /></clipPath></defs>
      <circle cx={cx} cy={cy} r={D / 2 + 3} fill={A.yEdge} />
      <g clipPath={`url(#mclip-${g})`}>
        <rect x={cx - D / 2} y={cy - D / 2} width={D} height={D} fill={A.yStreet} />
        {GS.map((d) => { const c = d.full ? st(d) ?? A.yFace : A.yGray; return <rect key={d.i} x={cx + d.x0 * s + 0.6} y={cy - d.y1 * s + 0.6} width={10 * s - 1.2} height={10 * s - 1.2} fill={c} />; })}
      </g>
      <path d={`M ${cx - 8} ${cy + D / 2 + 3} L ${cx} ${cy + D / 2 - 7} L ${cx + 8} ${cy + D / 2 + 3} Z`} fill={H.panel} />
    </g>
  );
};

const Probe: React.FC<{ f: number; o: number; c: C }> = ({ f, o, c }) => {
  if (o <= 0.01) return null;
  const pl = probePlan(c), st = probeAt(f, pl), v = VP;
  const kCard = mix(0.35, 1, tween(f, c.s6_probecard, 8, EASE.move));
  const kMap = tween(f, c.s7_map + 2, 10, EASE.move), kCardOut = tween(f, c.s7_map, 4, EASE.exit), stationO = 1 - 0.85 * kMap;
  const tested = (d: Die) => { const t = pl.testedAt[d.i]; if (t === undefined || f < t) return null; return d.hit >= 0 ? A.yBad : A.yGood; };
  const zW = st.dz + 0.6;
  // 吸盤上的晶圓（晶片格顏色＝受測結果，同一幀和地圖一起變）
  const vw: V = { ...v, cx: P(v, st.ox, st.oy, zW)[0], cy: P(v, st.ox, st.oy, zW)[1] };
  const head = { x: 1.2, z0: 3.6, z1: 6.2 }, tipRest = 0.62, comp = Math.max(0, zW - tipRest);
  // 探針：每顆晶片沿四邊 3 根，共 48 根（示意）
  const probes: [number, number][] = [];
  for (const [dx, dy] of [[-0.5, 0.5], [0.5, 0.5], [-0.5, -0.5], [0.5, -0.5]]) for (const q of [-0.28, 0, 0.28]) probes.push([dx + q, dy + 0.4], [dx + q, dy - 0.4], [dx + 0.4, dy + q], [dx - 0.4, dy + q]);
  probes.sort((a, b) => b[1] - a[1]);
  const curPath: [number, number][] = [P(v, 20, 11, 7.5), P(v, 18.4, 6, 9.6), P(v, 16.2, 3.2, 9.4), P(v, 7, 1.2, 9.4), P(v, 0, 0, 8.6), P(v, 0, 0, head.z0)];
  const nDots = 10, cur = st.cur;
  const labO = tween(f, c.s6_probecard, 6) * (1 - tween(f, c.s7_map, 4));
  const fastO = st.fast ? 1 : 0;
  const nTested = GS.filter((d) => d.full && pl.testedAt[d.i] !== undefined && f >= pl.testedAt[d.i]).length;
  // 地圖卡：下方 → 飛到畫面中前方
  const mapC = { cx: mix(240, 540, kMap), cy: mix(1170, 700, kMap), D: mix(320, 600, kMap) };
  const pcbBack = (z: number, r0: number, r1: number) => [...ringPts(v, r1, z, 0, 180), ...ringPts(v, r0, z, 180, 0)] as [number, number][];
  if (kMap <= 0) reg("main", { x0: P(v, -24, 0)[0], x1: P(v, 30, 0)[0], y0: P(v, 0, 17.25, 9.4)[1], y1: P(v, 0, -18, -9)[1] }, "station");
  return (
    <g opacity={o}>
      <g opacity={stationO}>
        {/* 機台底座、X 軌與 X 台、Y 軌與 Y 台（吸盤下面兩層滑台） */}
        {box3(v, -24, 24, -18, 18, -9, -7.5, A.yBase, A.yBase2, "base")}
        {[-10, 10].map((y) => box3(v, -23, 23, y - 0.6, y + 0.6, -7.5, -7, A.yRail, A.yChuck3, `xr${y}`))}
        {box3(v, st.ox - 17, st.ox + 17, -14, 14, -7, -6, A.yChuck2, A.yChuck, "xplate")}
        {[-12, 12].map((x) => box3(v, st.ox + x - 0.6, st.ox + x + 0.6, -13.5, 13.5, -6, -5.6, A.yRail, A.yChuck3, `yr${x}`))}
        {box3(v, st.ox - 15, st.ox + 15, st.oy - 12, st.oy + 12, -5.6, -4.8, A.yChuck2, A.yChuck, "yplate")}
        {cyl3(v, st.ox, st.oy, 5, -4.8, st.dz - 2.5, A.yChuck2, A.yChuck3, "zcol")}
        {cyl3(v, st.ox, st.oy, 16, st.dz - 2.5, st.dz, A.yChuck2, A.yChuck, "chuck", <g>{[15.4, 14.6].map((r) => <ellipse key={r} cx={P(v, st.ox, st.oy, st.dz)[0]} cy={P(v, st.ox, st.oy, st.dz)[1]} rx={v.s * r} ry={v.s * r * sinE(v)} fill="none" stroke={A.yChuck3} strokeWidth={1.5} />)}</g>)}
        <Wafer id="probeW" v={vw} g={GS} w={10} h={10} o={1} st={(d) => { const c2 = tested(d); return c2 ? { c: c2 } : null; }} tex={false} main={false} shadow={false} />
        {/* 探針卡（固定不動）：電路板剖開一半（看得到中央的空間轉換器與探針頭）、外圈接點、排線接到測試機 */}
        <g opacity={kCard}>
          <path d={pathOf(pcbBack(8.6, 6, 17.25))} fill={A.yPcb} />
          <path d={pathOf(pcbBack(9.4, 6, 17.25))} fill={A.yPcb2} stroke={A.yPcb} strokeWidth={1.5} />
          {range(17).map((i) => { const a = 5 + i * 10.6, [x1, y1] = P(v, 16.4 * Math.cos((a * Math.PI) / 180), 16.4 * Math.sin((a * Math.PI) / 180), 9.4), [x2, y2] = P(v, 7 * Math.cos((a * Math.PI) / 180), 7 * Math.sin((a * Math.PI) / 180), 9.4); return <g key={i}><line x1={x1} y1={y1} x2={x2} y2={y2} stroke={A.yPcbCu} strokeWidth={1.4} opacity={0.75} /><rect x={x1 - 4} y={y1 - 2} width={8} height={4} fill={A.yPcbCu} /></g>; })}
          <path d={pathOf(ringPts(v, 7.2, 9.4, 0, 180))} fill="none" stroke={A.yChuck2} strokeWidth={6} />
          {/* 剖面（y=0 的切口）：板子的層 */}
          {[[-17.25, -6], [6, 17.25]].map(([a, b], i) => { const [x0, y0] = P(v, a, 0, 9.4), [x1, y1] = P(v, b, 0, 8.6); return <g key={i}><rect x={x0} y={y0} width={x1 - x0} height={y1 - y0} fill={A.yPcb} />{[0.3, 0.55, 0.8].map((q) => <line key={q} x1={x0} x2={x1} y1={mix(y0, y1, q)} y2={mix(y0, y1, q)} stroke={A.yPcbCu} strokeWidth={1.2} />)}</g>; })}
          {box3(v, -1.5, 1.5, -1.5, 1.5, 6.2, 8.6, A.yCeram, A.yCeram2, "st", A.yCeram2)}
          {box3(v, -head.x, head.x, -head.x, head.x, head.z0, head.z1, A.yChuck2, A.yChuck, "ph")}
          {[3.9, 5.7].map((z) => { const [x0, y] = P(v, -head.x, -head.x, z), [x1] = P(v, head.x, -head.x, z); return <line key={z} x1={x0} x2={x1} y1={y} y2={y} stroke={A.yChuck3} strokeWidth={2} />; })}
          {probes.map(([px, py], i) => { const [hx, hy] = P(v, px * 0.85, py * 0.85, head.z0), tipZ = Math.max(tipRest, zW), [tx, ty] = P(v, px, py, tipZ), bow = (0.12 + comp * 2.8) * v.s * (px >= 0 ? 1 : -1); return <path key={i} d={`M ${hx} ${hy} Q ${(hx + tx) / 2 + bow} ${(hy + ty) / 2} ${tx} ${ty}`} fill="none" stroke={A.yProbe} strokeWidth={1.6} />; })}
          {/* 排線（板子外緣 → 測試機）與測試機 */}
          {[0, 1, 2].map((i) => <path key={i} d={`M ${P(v, 16.6, 3 + i * 0.5, 9.4).join(" ")} Q ${P(v, 19, 6 + i * 0.4, 11).join(" ")} ${P(v, 21, 10 + i * 0.4, 7.5 + i * 0.6).join(" ")}`} fill="none" stroke={A.yChuck3} strokeWidth={5} />)}
          {box3(v, 21, 30, 8, 16, 2, 12.5, A.yAte, A.yBase, "ate", A.yBase2)}
          {range(3).map((i) => { const [x, y] = P(v, 22.5 + i * 2.4, 8, 10.4); return <rect key={i} x={x} y={y} width={22} height={8} fill={i === 0 ? H.amber : A.yGood} opacity={0.9} />; })}
          {/* 電流：測試機 → 排線 → 板子 → 空間轉換器 → 探針 → 焊墊（往下流；關的時候變慢變淡，不是瞬間消失） */}
          {cur > 0.02 ? (
            <g>
              <path d={pathOf(curPath)} fill="none" stroke={A.yCur} strokeWidth={3} opacity={0.35 * cur} />
              {range(nDots).map((i) => { const u = ((f - pl.t0) * 0.06 * (0.4 + 0.6 * cur) + i / nDots) % 1, out: React.ReactNode[] = []; for (let tr = 0; tr < 4; tr++) { const [x, y] = along(curPath, u - tr * 0.018); out.push(<circle key={tr} cx={x} cy={y} r={6 - tr * 1.2} fill={A.yCur} opacity={cur * (1 - tr * 0.22)} />); } return <g key={i}>{out}</g>; })}
              {probes.filter((_, i) => i % 4 === 0).map(([px, py], i) => { const [hx, hy] = P(v, px * 0.85, py * 0.85, head.z0), [tx, ty] = P(v, px, py, Math.max(tipRest, zW)), u = ((f * 0.18 + i * 0.3) % 1); return <circle key={`p${i}`} cx={mix(hx, tx, u)} cy={mix(hy, ty, u)} r={3.6} fill={A.yCur} opacity={cur} />; })}
            </g>
          ) : null}
        </g>
        {/* 標籤（引線拉到機台外） */}
        {labO > 0.02 ? (
          <g opacity={labO}>
            {([["探針卡", P(v, -12, 6, 9.4), [150, 330]], ["測試機", P(v, 25.5, 12, 12.5), [905, 330]], ["晶圓", P(v, st.ox + 9, st.oy - 7, zW), [950, 770]]] as [string, [number, number], [number, number]][]).map(([t, p, q]) => (
              <g key={t}>
                <line x1={p[0]} y1={p[1]} x2={q[0]} y2={q[1] + (q[1] > 600 ? -40 : 14)} stroke={H.text2} strokeWidth={2} />
                <circle cx={p[0]} cy={p[1]} r={5} fill={H.line} />
                <rect x={q[0] - textW(t, 38) / 2 - 16} y={q[1] - 34} width={textW(t, 38) + 32} height={56} fill={H.panel} stroke={H.line} strokeWidth={2.5} />
                <Txt x={q[0]} y={q[1] + 7} t={t} px={38} c={H.text} w={900} g={`plab:${t}`} />
              </g>
            ))}
          </g>
        ) : null}
        {fastO ? <Tag x={850} y={946} t="快轉 ▸▸" c={H.amber} px={34} o={fastO} /> : null}
      </g>
      {/* 晶圓地圖卡（同一份資料、同一幀變色） */}
      <Card x={64} y={1004} w={952} h={348} o={1 - kCardOut} g="mapcard">
        <Txt x={430} y={1066} t="晶圓地圖（示意）" px={36} c={H.text} w={900} a="start" g="mapcard" />
        {([[A.yGood, "好的"], [A.yBad, "壞的"], [A.yGray, "邊緣不計"]] as [string, string][]).map(([cc, t], i) => <g key={t}><rect x={430} y={1104 + i * 52} width={30} height={30} fill={cc} /><Txt x={474} y={1130 + i * 52} t={t} px={32} c={H.text2} w={800} a="start" g="mapcard" /></g>)}
        <Txt x={640} y={1302} t={`已測 ${nTested}／${STATS.S.all}`} px={34} c={H.text} w={900} a="start" g="mapcard" mono={false} />
      </Card>
      <WaferMap cx={mapC.cx} cy={mapC.cy} D={mapC.D} f={f} st={tested} g="pmap" />
      {f >= c.s7_map + 12 ? (
        <g opacity={tween(f, c.s7_map + 12, 6)}>
          {([[A.yGood, `好的 ${STATS.S.good}`], [A.yBad, `壞的 ${STATS.S.bad}`], [A.yGray, "邊緣不計"]] as [string, string][]).map(([cc, t], i) => <g key={t}><rect x={150 + i * 290} y={1036} width={34} height={34} fill={cc} /><Txt x={196 + i * 290} y={1066} t={t} px={36} c={H.text} w={900} a="start" g={`leg${i}`} /></g>)}
          <Tag x={540} y={1150} t="壞的不會被封裝" c={H.coral} px={36} o={tween(f, c.s7_map + 14, 6)} />
          <Tag x={540} y={1250} t="已確定・晶圓測試流程" c={H.line} px={32} o={tween(f, c.s7_map + 16, 6)} />
        </g>
      ) : null}
    </g>
  );
};

/** s8：1 cm² 方框＋10 個方塊，其中 1 個有缺陷 */
const D0View: React.FC<{ f: number; o: number; c: C }> = ({ f, o, c }) => {
  if (o <= 0.01) return null;
  const v = VD, d = GS.filter((x) => x.full && x.hit < 0).sort((a, b) => Math.hypot(a.x0 - 24, a.y0 + 5) - Math.hypot(b.x0 - 24, b.y0 + 5))[0];
  const [bx0, by0] = P(v, d.x0 / 10, d.y1 / 10), [bx1, by1] = P(v, d.x1 / 10, d.y0 / 10), kB = tween(f, c.s8_cm2 - 2, 6);
  const sq = 80, gap = 10, x0 = 540 - (10 * sq + 9 * gap) / 2, y0 = 1010;
  const kd = (i: number) => tween(f, c.s8_d0 + i * 3, 4);
  return (
    <g opacity={o}>
      <Wafer id="d0" v={v} g={GS} w={10} h={10} o={1} st={() => null} />
      {kB > 0.02 ? <g opacity={kB}><rect x={bx0 - 3} y={by0 - 3} width={bx1 - bx0 + 6} height={by1 - by0 + 6} fill={H.amber} fillOpacity={0.35} stroke={H.amber} strokeWidth={4} />
        <path d={`M ${(bx0 + bx1) / 2} ${by1 + 4} V ${y0 - 60} H ${x0 + sq / 2} V ${y0 - 6}`} fill="none" stroke={H.amber} strokeWidth={3} strokeDasharray="10 7" />
        <Tag x={790} y={y0 - 64} t="1 cm²（約一顆小晶片）" c={H.amber} px={32} o={kB} /></g> : null}
      {range(10).map((i) => { const k = kd(i), x = x0 + i * (sq + gap); return (
        <g key={i} opacity={0.35 + 0.65 * kB}>
          <rect x={x} y={y0} width={sq} height={sq} fill={k > 0 ? A.yFace : H.panel} stroke={k > 0 ? H.line : H.lineSoft} strokeWidth={k > 0 ? 3 : 2} />
          {i === 6 && k > 0 ? (() => { const dz = dropZ(f, c.s8_d0 + 18 + 10, 1, 10); return dz.vis ? <g><ellipse cx={x + sq * 0.55} cy={y0 + sq * 0.55 - dz.z * 120} rx={11 * (1 + 0.3 * dz.sq)} ry={10 * (1 - 0.3 * dz.sq)} fill={A.yDefect} stroke={A.yDefRim} strokeWidth={2} /></g> : null; })() : null}
        </g>
      ); })}
      {(() => { reg("row", { x0, x1: x0 + 10 * sq + 9 * gap, y0, y1: y0 + sq }, "d0row"); return null; })()}
      <Card x={140} y={1150} w={800} h={130} o={tween(f, c.s8_d0 + 30, 6)} g="d0card" c={H.amber}>
        <Txt x={540} y={1216} t="≈ 0.1 個缺陷／cm²" px={48} c={H.text} w={900} g="d0card" />
        <Txt x={540} y={1262} t="5 奈米量產初期（不是現在的數字）" px={30} c={H.text2} w={800} g="d0card" />
      </Card>
      <Stamp x={826} y={290} t="廠商公布" f={f} at={Math.max(c.s8_vendor, c.v8 + 2)} px={54} c={H.line} />
      <Tag x={826} y={394} t="2020 年技術論壇" c={H.line} px={30} o={tween(f, Math.max(c.s8_vendor, c.v8 + 2) + 6, 6)} />
    </g>
  );
};

/** s9：面積 ×8（大晶片切成 8 條 25×4 mm，每條變形成 10×10 mm；面積不變） */
const AreaView: React.FC<{ f: number; o: number; c: C }> = ({ f, o, c }) => {
  if (o <= 0.01) return null;
  // 1 mm = 10 px：小晶片 100×100、大晶片 250×320；8 條 250×40（各 100 mm²）變形成 100×100（面積不變）
  const k = 10, sm = { x: 90, y: 660 }, bg = { x: 250, y: 520 }, gx = 560, gy = 570, at0 = c.s9_eight + 2;
  const strips = range(8).map((i) => {
    const t = EASE.move(clamp01((f - (at0 + i * 2)) / 9));
    const fx = bg.x + 125, fy = bg.y + 20 + i * 40, tx = gx + (i % 4) * 112 + 50, ty = gy + Math.floor(i / 4) * 112 + 50;
    const w = mix(250, 100, t), h = mix(40, 100, t);
    return { x: mix(fx, tx, t) - w / 2, y: mix(fy, ty, t) - h / 2, w, h };
  });
  reg("main", { x0: 90, x1: 996, y0: 520, y1: 840 }, "area");
  const doneAt = at0 + 14 + 9, done = tween(f, doneAt, 6);
  return (
    <g opacity={o}>
      <rect x={sm.x} y={sm.y} width={10 * k} height={10 * k} fill={A.yFace} stroke={H.line} strokeWidth={3} />
      <rect x={bg.x} y={bg.y} width={25 * k} height={32 * k} fill="none" stroke={H.text3} strokeWidth={2} strokeDasharray="8 6" />
      {strips.map((s, i) => <rect key={i} x={s.x} y={s.y} width={s.w} height={s.h} fill={A.yFace} stroke={H.line} strokeWidth={2} />)}
      <Txt x={sm.x + 50} y={sm.y + 150} t="100 mm²" px={36} c={H.text} w={900} mono g="ar1" />
      <Txt x={sm.x + 50} y={sm.y + 192} t="10 × 10 mm" px={30} c={H.text2} w={800} mono g="ar1b" />
      <Txt x={bg.x + 125} y={bg.y + 372} t="800 mm²" px={36} c={H.text} w={900} mono g="ar2" />
      <Txt x={bg.x + 125} y={bg.y + 414} t="25 × 32 mm" px={30} c={H.text2} w={800} mono g="ar3" />
      <Stamp x={780} y={900} t="面積 ×8" f={f} at={doneAt} px={56} c={H.amber} />
      <Txt x={540} y={1080} t="平均每顆被打中：0.1 個 → 0.8 個" px={40} c={H.text} w={900} o={done} g="ar4" />
      <Tag x={540} y={1166} t="估算・示意比例" c={H.amber} px={30} o={done} />
    </g>
  );
};

/** s11：一顆壞晶片放大（邏輯、記憶體、備用列、熔絲組、解碼）＋雷射切熔絲＋2D 方塊圖改道 */
const DieView: React.FC<{ f: number; o: number; c: C; fromV: V }> = ({ f, o, c, fromV }) => {
  if (o <= 0.01) return null;
  const d = REPAIR.d, X = 100, Y = 290, S = 560, gT = EASE.move(clamp01((f - c.s11_rescue) / 12));
  const [fx0, fy0] = P(fromV, d.x0 / 10, d.y1 / 10), [fx1] = P(fromV, d.x1 / 10, d.y0 / 10);
  const sx = mix(fx0, X, gT), sy = mix(fy0, Y, gT), ss = mix(fx1 - fx0, S, gT);
  const U = (u: number) => sx + ss * u, Vv = (vv: number) => sy + ss * (1 - vv);
  const inner = tween(f, c.s11_rescue + 8, 6);
  const row = Math.min(MEM.rows - 1, Math.floor(((REPAIR.v - MEM.v0) / (MEM.v1 - MEM.v0)) * MEM.rows));
  const rowV = (r: number) => MEM.v1 - ((r + 1) * (MEM.v1 - MEM.v0)) / MEM.rows;
  const laserAt = c.s11_broke, cut = (i: number) => f >= laserAt + i * 6 + 3, swapK = tween(f, c.s11_swap, 9, EASE.move);
  const fused = cut(2);
  const spareK = tween(f, c.s11_spare, 5) * (1 - 0.6 * tween(f, c.s11_spare + 14, 8));
  const dieCol = f >= c.s11_swap + 6 ? A.yGood : A.yBad, dieMix = tween(f, c.s11_swap + 6, 9);
  const beamOn = f >= laserAt && f < laserAt + 18;
  const fuseX = U(0.865), fuseY = (i: number) => Vv(MEM.v1 - 0.03 - i * 0.05);
  reg("main", { x0: sx, x1: sx + ss, y0: sy, y1: sy + ss }, "die");
  // 方塊圖：位址 → 比較電路 → 壞列／備用列
  const bY = 920, bx = { a: [96, 300], c: [390, 610], bad: [720, 980], spr: [720, 980] };
  const toBad: [number, number][] = [[300, bY + 150], [390, bY + 150], [610, bY + 150], [660, bY + 150], [660, bY + 90], [720, bY + 90]];
  const toSpr: [number, number][] = [[300, bY + 150], [390, bY + 150], [610, bY + 150], [660, bY + 150], [660, bY + 250], [720, bY + 250]];
  const dots = (pts: [number, number][], k: number, col: string) => range(6).map((i) => { const u = ((f * 0.035 + i / 6) % 1); const [x, y] = along(pts, u); return <circle key={i} cx={x} cy={y} r={8} fill={col} opacity={k} />; });
  const kDiag = tween(f, c.s11_spare, 6);
  return (
    <g opacity={o}>
      {/* 晶片本體 */}
      <rect x={sx} y={sy} width={ss} height={ss} fill={A.die} stroke={H.line} strokeWidth={mix(1, 4, gT)} />
      <rect x={sx} y={sy} width={ss} height={ss} fill={dieCol} opacity={(1 - inner) * 0.9 + (f >= c.s11_swap + 6 ? 0.18 * dieMix : 0.1 * inner)} />
      <g opacity={inner}>
        {/* 焊墊（四周） */}
        {range(14).flatMap((i) => [[0.04 + i * 0.0705, 0.025], [0.04 + i * 0.0705, 0.975], [0.025, 0.04 + i * 0.0705], [0.975, 0.04 + i * 0.0705]]).map(([u, vv], i) => <rect key={i} x={U(u) - 8} y={Vv(vv) - 8} width={16} height={16} fill={A.solder} />)}
        {/* 邏輯區：細格紋 */}
        <rect x={U(0.1)} y={Vv(0.9)} width={ss * 0.8} height={ss * 0.42} fill={A.yLogic} stroke={H.line} strokeWidth={2} />
        {range(19).map((i) => <line key={`lx${i}`} x1={U(0.1 + i * 0.04)} x2={U(0.1 + i * 0.04)} y1={Vv(0.9)} y2={Vv(0.48)} stroke={A.trace} strokeWidth={1.2} opacity={0.7} />)}
        {range(10).map((i) => <line key={`ly${i}`} y1={Vv(0.48 + i * 0.042)} y2={Vv(0.48 + i * 0.042)} x1={U(0.1)} x2={U(0.9)} stroke={A.trace} strokeWidth={1.2} opacity={0.7} />)}
        {/* 解碼與比較電路（記憶體左邊窄條） */}
        <rect x={U(0.08)} y={Vv(MEM.v1)} width={ss * 0.09} height={ss * (MEM.v1 - MEM.s0)} fill={A.yDec} />
        {/* 記憶體列 */}
        {range(MEM.rows).map((r) => { const y = Vv(MEM.v1 - (r * (MEM.v1 - MEM.v0)) / MEM.rows) + 3, h = (ss * (MEM.v1 - MEM.v0)) / MEM.rows - 6, bad = r === row && f >= c.s11_rescue + 10;
          return <rect key={r} x={U(MEM.u0)} y={y} width={ss * (MEM.u1 - MEM.u0)} height={h} fill={bad ? H.coral : A.yMem} opacity={bad ? 0.9 : 1} />; })}
        {/* 備用列（淡色虛線框，切換後亮） */}
        {[0, 1].map((r) => { const y = Vv(MEM.s1 - r * 0.03), h = ss * 0.026, on = r === 0 ? swapK : 0; return <rect key={r} x={U(MEM.u0)} y={y} width={ss * (MEM.u1 - MEM.u0)} height={h} fill={on > 0 ? A.yGood : A.ySpare} fillOpacity={0.55 + 0.45 * Math.max(on, spareK)} stroke={A.yGood} strokeWidth={2} strokeDasharray={on > 0.5 ? undefined : "8 5"} />; })}
        {/* 熔絲組：6 個小橋（銅色），被雷射切斷的有缺口 */}
        {range(6).map((i) => { const y = fuseY(i), cutI = i < 3 && cut(i); return <g key={i}><rect x={fuseX - 22} y={y - 6} width={16} height={12} fill={A.yCopper} /><rect x={fuseX + 6} y={y - 6} width={16} height={12} fill={A.yCopper} />{cutI ? null : <rect x={fuseX - 7} y={y - 3} width={14} height={6} fill={A.yCopper} />}{cutI ? <rect x={fuseX - 7} y={y - 5} width={14} height={10} fill={A.die} /> : null}</g>; })}
        {/* 缺陷點落在那一列 */}
        <ellipse cx={U(REPAIR.u)} cy={Vv(rowV(row) + (MEM.v1 - MEM.v0) / MEM.rows / 2)} rx={12} ry={11} fill={A.yDefect} stroke={A.yDefRim} strokeWidth={2.5} />
      </g>
      {/* 雷射：從上方打到熔絲，火花往外噴（拋物線） */}
      {beamOn ? (() => { const i = Math.min(2, Math.floor((f - laserAt) / 6)), y = fuseY(i), tt = (f - laserAt) % 6; return (
        <g>
          <rect x={fuseX - 6} y={224} width={30} height={22} fill={A.yChuck3} transform={`translate(-9 0)`} />
          <line x1={fuseX} y1={246} x2={fuseX} y2={y} stroke={A.yLaser} strokeWidth={5} />
          <line x1={fuseX} y1={246} x2={fuseX} y2={y} stroke={H.panel} strokeWidth={1.5} />
          {range(7).map((j) => { const a = -Math.PI / 2 + (j - 3) * 0.45, vv = 9, t2 = tt + 1; return <circle key={j} cx={fuseX + Math.cos(a) * vv * t2} cy={y + Math.sin(a) * vv * t2 + 0.9 * t2 * t2} r={3} fill={A.yLaser} opacity={1 - tt / 6} />; })}
        </g>); })() : null}
      {/* 標籤（右側欄，引線接到各區） */}
      {inner > 0.02 ? (
        <g>
          {([["邏輯", 0.7, 0.9, c.s11_rescue + 10], ["記憶體", 0.32, MEM.u1, c.s11_mem], ["備用列", 0.13, MEM.u1, c.s11_spare], ["熔絲組", 0.27, 0.9, c.s11_broke]] as [string, number, number, number][]).map(([t, vv, u, at], i) => {
            const k = tween(f, at, 6), ly = [360, 560, 760, 660][i]; if (k <= 0.02) return null;
            return <g key={t} opacity={k}><line x1={U(u)} y1={Vv(vv)} x2={720} y2={ly - 12} stroke={H.text2} strokeWidth={2} /><circle cx={U(u)} cy={Vv(vv)} r={5} fill={H.line} /><Txt x={730} y={ly} t={t} px={40} c={i === 2 ? A.yGood : H.text} w={900} a="start" g={`dl:${t}`} /></g>;
          })}
          <Tag x={850} y={856} t={f >= c.s11_swap + 6 ? "救回 1 顆（示意）" : "雷射熔絲（示意）"} c={f >= c.s11_swap + 6 ? A.yGood : H.amber} px={30} o={tween(f, laserAt, 6)} />
        </g>
      ) : null}
      {/* 2D 方塊圖（同一份狀態） */}
      <Card x={64} y={bY} w={952} h={420} o={kDiag} g="diag">
        <Txt x={540} y={bY + 50} t="記憶體修補（示意）：位址 → 比較電路 → 哪一列" px={30} c={H.text2} w={800} g="diag" />
        {([[bx.a, bY + 110, "位址訊號", A.yDec], [bx.c, bY + 110, "比較電路", A.yDec]] as [number[], number, string, string][]).map(([xx, y, t, cc]) => <g key={t}><rect x={xx[0]} y={y} width={xx[1] - xx[0]} height={80} rx={10} fill={cc} opacity={0.35} stroke={H.line} strokeWidth={2.5} /><Txt x={(xx[0] + xx[1]) / 2} y={y + 52} t={t} px={36} c={H.text} w={900} g="diag" /></g>)}
        {range(3).map((i) => <rect key={i} x={450 + i * 40} y={bY + 200} width={26} height={12} fill={A.yCopper} opacity={fused && i < 3 ? 0.35 : 1} />)}
        <Txt x={500} y={bY + 254} t={fused ? "熔絲已切：記住壞列" : "熔絲組"} px={30} c={H.text2} w={800} g="diag" />
        <rect x={bx.bad[0]} y={bY + 52} width={260} height={76} rx={10} fill={H.coral} opacity={0.18} stroke={H.coral} strokeWidth={3} />
        <Txt x={850} y={bY + 104} t="壞掉的列" px={36} c={H.coral} w={900} g="diag" />
        <rect x={bx.spr[0]} y={bY + 212} width={260} height={76} rx={10} fill={A.yGood} opacity={0.12 + 0.3 * swapK} stroke={A.yGood} strokeWidth={3} strokeDasharray={swapK > 0.5 ? undefined : "9 6"} />
        <Txt x={850} y={bY + 264} t="備用列" px={36} c={A.yGood} w={900} g="diag" />
        <path d={pathOf(toBad)} fill="none" stroke={H.coral} strokeWidth={3} opacity={1 - 0.7 * swapK} />
        <path d={pathOf(toSpr)} fill="none" stroke={A.yGood} strokeWidth={3} opacity={0.25 + 0.75 * swapK} strokeDasharray={swapK > 0.5 ? undefined : "8 6"} />
        {dots(toBad, 1 - swapK, A.yCur)}{dots(toSpr, swapK, A.yCur)}
        <Txt x={540} y={bY + 370} t={swapK > 0.5 ? "改用備用列：同一個位址，讀寫備用那一排" : "切換前：位址還是指到壞掉的那一列"} px={32} c={swapK > 0.5 ? A.yGood : H.text2} w={800} g="diag" />
      </Card>
    </g>
  );
};

/** s12：良率－面積曲線（泊松，D0＝0.1／cm²）＋三家「良率 —」＋查不到公布 */
const ChartView: React.FC<{ f: number; o: number; c: C }> = ({ f, o, c }) => {
  if (o <= 0.01) return null;
  const x0 = 200, x1 = 950, y0 = 820, y1 = 360, X = (a: number) => x0 + ((x1 - x0) * a) / 900, Y = (p: number) => y0 - ((y0 - y1) * p) / 100;
  const g = EASE.move(clamp01((f - c.s12_estimate) / 24)), amax = 900 * g;
  const pts: [number, number][] = range(91).map((i) => i * 10).filter((a) => a <= amax).map((a) => [X(a), Y(100 * Math.exp(-a / 1000))]);
  reg("main", { x0: x0, x1: x1, y0: y1, y1: y0 }, "chart");
  return (
    <g opacity={o}>
      <Card x={64} y={250} w={952} h={720} o={1} g="chart">
        <Txt x={540} y={306} t="良率 vs 晶片面積（缺陷 0.1 個／cm²）" px={34} c={H.text} w={900} g="chart" />
        {[0, 50, 100].map((p) => <g key={p}><line x1={x0} x2={x1} y1={Y(p)} y2={Y(p)} stroke={H.lineSoft} strokeWidth={2} /><Txt x={x0 - 14} y={Y(p) + 11} t={`${p}%`} px={30} c={H.text3} w={700} a="end" mono g="chart" /></g>)}
        {[0, 300, 600, 900].map((a) => <Txt key={a} x={X(a)} y={y0 + 44} t={`${a}`} px={30} c={H.text3} w={700} mono g="chart" />)}
        <Txt x={x1} y={y0 + 84} t="晶片面積（mm²）" px={30} c={H.text3} w={700} a="end" g="chart" />
        {pts.length > 1 ? <path d={pathOf(pts)} fill="none" stroke={H.line} strokeWidth={6} strokeLinecap="round" /> : null}
        {([[100, "100 mm² ≈ 91%", 1, -26], [800, "800 mm² ≈ 45%", -1, 58]] as [number, string, number, number][]).map(([a, t, side, dy]) => { if (amax < a) return null; const k = tween(f, c.s12_estimate + (a / 900) * 24, 5), px = X(a), py = Y(100 * Math.exp(-a / 1000)); return <g key={a} opacity={k}><circle cx={px} cy={py} r={12} fill={a === 100 ? A.yGood : H.coral} stroke={H.panel} strokeWidth={3} /><Txt x={px + side * 20} y={py + dy} t={t} px={36} c={H.text} w={900} a={side > 0 ? "start" : "end"} mono={false} g={`chart:cp${a}`} /></g>; })}
        <Txt x={x0} y={y0 + 136} t="估算（簡化模型）・成群時良率會好一些" px={30} c={H.amber} w={800} a="start" o={tween(f, c.s12_estimate + 8, 6)} g="chart" />
      </Card>
      {["A", "B", "C"].map((n, i) => { const k = tween(f, c.s12_now + i * 4, 6), x = 64 + i * 328; return (
        <Card key={n} x={x} y={1000} w={296} h={150} o={k} g={`ven${n}`} c={H.text3}>
          <Txt x={x + 148} y={1060} t={`廠商 ${n}`} px={34} c={H.text2} w={800} g={`ven${n}`} />
          <Txt x={x + 148} y={1124} t="良率 —" px={44} c={H.text} w={900} g={`ven${n}`} />
        </Card>); })}
      <Stamp x={540} y={1236} t="查不到公布" f={f} at={c.s12_unpub} px={56} c={H.coral} rot={-4} />
      <Txt x={540} y={1334} t="查證截至 2026/11/17" px={30} c={H.text2} w={800} o={tween(f, c.s12_unpub + 6, 6)} g="asof" />
    </g>
  );
};

/** s13–s14：大晶片拉出來 → 提問卡 → 裂成 4 塊、壞的那塊飛走換好的、4 塊落到底板（重力＋回彈） */
const SplitView: React.FC<{ f: number; o: number; c: C; landL: (i: number) => number }> = ({ f, o, c, landL }) => {
  if (o <= 0.01) return null;
  const vw: V = { cx: 540, cy: 430, s: 300 / 30, E: 60 }, b = BIG.d, K = 8;
  const pull = EASE.move(clamp01((f - (c.v13 + 6)) / 14)), wO = 1 - tween(f, c.v13 + 14, 8);
  const [fx0, fy0] = P(vw, b.x0 / 10, b.y1 / 10), [fx1, fy1] = P(vw, b.x1 / 10, b.y0 / 10);
  const W = 25 * K, Hh = 32 * K, cx = 540, top0 = 600;
  const dx0 = mix(fx0, cx - W / 2, pull), dy0 = mix(fy0, top0, pull), dw = mix(fx1 - fx0, W, pull), dh = mix(fy1 - fy0, Hh, pull);
  const sp = c.s13_split, crack = tween(f, sp, 4), shake = f >= sp && f < sp + 14 ? 6 * Math.exp(-(f - sp) / 4) * Math.sin((f - sp) * 2.4) : 0;
  const sep = 14 * tween(f, sp + 4, 6, EASE.move);
  // 落到底板：sp+30 起自由落體 60px（10 幀）＋回彈
  const subY = top0 + Hh + 90, fall = dropZ(f, sp + 40, 1, 10), drop = 90 * (1 - fall.z) * (f >= sp + 30 ? 1 : 0);
  const press = f >= sp + 40 && f < sp + 52 ? 5 * Math.exp(-(f - sp - 40) / 3) * Math.cos((f - sp - 40) * 0.9) : 0;
  reg("main", { x0: cx - W / 2 - 20, x1: cx + W / 2 + 20, y0: top0, y1: subY + 50 }, "big");
  const piece = (q: number) => {
    const qx = q % 2, qy = q < 2 ? 0 : 1; // q 0,1＝上排（y 大＝遠端＝畫面上方）；2,3＝下排
    const x = cx - W / 2 + qx * (W / 2) + (qx ? sep / 2 : -sep / 2) + shake, y = top0 + qy * (Hh / 2) + (qy ? sep / 2 : -sep / 2) + drop;
    // 壞的那塊：拋物線飛走（水平等速、垂直先上後落）；好的那塊從上方落進來
    const isBad = q === BIG.q, t = clamp01((f - (sp + 10)) / 18), inT = sp + 30;
    if (isBad) {
      if (f < sp + 10) return { x, y, c: A.yBad, o: 1 };
      if (f < sp + 28) return { x: x + 520 * t, y: y - 360 * t + 520 * t * t, c: A.yBad, o: 1 - tween(f, sp + 24, 4) };
      const dz = dropZ(f, inT, 1, 12); return dz.vis ? { x, y: y - dz.z * 420, c: A.yGood, o: 1, sq: dz.sq } : null;
    }
    return { x, y, c: q === BIG.q ? A.yGood : A.yGood, o: 1 };
  };
  return (
    <g opacity={o}>
      <Wafer id="sp" v={vw} g={GL} w={25} h={32} o={wO} st={rainSt(f, landL, (d) => (d.i === b.i ? { c: A.yBad, o: 0 } : null))} main={false} />
      {f < sp + 4 ? <g transform={`translate(${shake} 0)`}><rect x={dx0} y={dy0} width={dw} height={dh} fill={A.yBad} stroke={H.panel} strokeWidth={3} />
        {pull > 0.5 ? <ellipse cx={dx0 + dw * BIG.u} cy={dy0 + dh * (1 - BIG.v)} rx={10} ry={9} fill={A.yDefect} stroke={A.yDefRim} strokeWidth={2} /> : null}
        {crack > 0 ? <g stroke={H.text} strokeWidth={3}><line x1={cx} x2={cx} y1={top0} y2={top0 + Hh * crack} /><line y1={top0 + Hh / 2} y2={top0 + Hh / 2} x1={cx - W / 2} x2={cx - W / 2 + W * crack} /></g> : null}</g>
        : range(4).map((q) => { const p = piece(q); if (!p) return null; return <g key={q} opacity={p.o}><rect x={p.x} y={p.y} width={W / 2 - 2} height={Hh / 2 - 2} fill={q === BIG.q && f < sp + 28 ? A.yBad : A.yGood} stroke={H.panel} strokeWidth={3} /></g>; })}
      {/* 底板（米白，4 個凹槽），落地時被壓一下 */}
      <g opacity={tween(f, sp + 20, 8)} transform={`translate(0 ${press})`}>
        <rect x={cx - W / 2 - 60} y={subY + 10} width={W + 120} height={40} rx={8} fill={A.ySub} stroke={A.ySub2} strokeWidth={3} />
        {range(4).map((q) => <rect key={q} x={cx - W / 2 + (q % 2) * (W / 2) + (q % 2 ? 7 : -7) + 4} y={subY + 10} width={W / 2 - 10} height={8} fill={A.ySub2} />)}
      </g>
      <Card x={64} y={1060} w={952} h={260} o={tween(f, c.s13_whole - 4, 6)} g="qcard" c={H.amber}>
        <Txt x={540} y={1132} t="二選一" px={34} c={H.amber} w={900} g="qcard" />
        <Txt x={540} y={1210} t="一整顆　還是　拆小再拼？" px={56} c={H.text} w={900} g="qcard" />
        <rect x={190} y={1240} width={50} height={60} fill={A.yFace} stroke={H.line} strokeWidth={2.5} />
        <Txt x={256} y={1284} t="整顆" px={30} c={H.text2} w={800} a="start" g="qcard" />
        {range(4).map((q) => <rect key={q} x={700 + (q % 2) * 28} y={1240 + Math.floor(q / 2) * 32} width={24} height={28} fill={A.yFace} stroke={H.line} strokeWidth={2} />)}
        <Txt x={772} y={1284} t="四塊拼" px={30} c={H.text2} w={800} a="start" g="qcard" />
      </Card>
      <Tag x={880} y={subY + 30} t="外形示意" c={H.text3} px={30} o={tween(f, sp + 20, 8)} />
      <Stamp x={540} y={330} t="下一支：先進封裝" f={f} at={c.s14_next} px={50} c={H.line} rot={-3} />
    </g>
  );
};

// ───────── 主程式 ─────────
export const YieldArt: React.FC<{ f: number; cues: C }> = ({ f, cues }) => {
  const c0 = new Proxy(cues, { get: (t, k: string) => (t[k] ?? 1e9) }) as C;
  // 換段的幀（每段的狀態標籤落定後至少停 0.8 秒，所以有些段延到下一幕開頭幾幀）
  const v = { v2: c0.s2_printed - 2, v3: c0.s3_particle - 10, v4: c0.s4_start + 12, v6: c0.s6_probecard - 12, v8: c0.s8_start + 12, v9: c0.s9_dense, vH: c0.s9_hit + 10, v12: c0.s12_start + 16, v13: c0.s13_start + 14 };
  const c = new Proxy({ ...cues, ...v }, { get: (t, k: string) => ((t as any)[k] ?? 1e9) }) as C;
  const R = artRegion(L as any), CY = (R.y0 + R.y1) / 2, u = (L.INNER_W * (L.ART_FIT ?? 1)) / 1000;
  // 缺陷雨的時刻表
  const landA = (i: number) => 4 + Math.floor(i / 2);                                     // s1：第 0 幀已在落，每幀 2 點
  const landD = (i: number) => c.v4 + 10 + (i < 10 ? i * 3 : 30 + (i - 10));         // s4：前 10 點每 3 幀、其餘每幀 1 點
  const landH = (i: number) => c.vH + 6 + Math.floor(i / 2);                            // s9：兩片同時、同一組
  const b2 = c.v2, b3 = c.v3, b4 = c.v4, b6 = c.v6, b8 = c.v8, b9 = c.v9, bR = c.s11_rescue, b12 = c.v12, b13 = c.v13;
  // 第一段（s1）→ 第二段（s2）：大晶片那片往右滑走，小晶片那片移到中央（換鏡，10 幀）
  const tr = EASE.move(clamp01((f - b2) / 10));
  const vS = lerpV(VL, VS, tr);
  const oA = f < b2 ? 1 : 0;
  const oB = f >= b2 && f < b3 ? 1 - tween(f, b3 - 6, 6, EASE.exit) : 0;
  const oC = seg(f, b3, b4), oD = seg(f, b4, b6), oE = seg(f, b6, b8), oF = seg(f, b8, b9);
  const oG1 = seg(f, b9, c.s9_eight), oG2 = seg(f, c.s9_eight, c.vH), oH = f >= c.vH && f < b12 ? Math.min(tween(f, c.vH, 6), f >= bR ? 1 - tween(f, bR, 8) : 1) : 0;
  const oI = seg(f, bR, b12), oJ = seg(f, b12, b13), oK = f >= b13 ? tween(f, b13, 6) : 0;
  const S = STATS;
  const pctS = Math.round((100 * S.S.good) / S.S.all), pctL = Math.round((100 * S.L.good) / S.L.all);
  const badCount = (g: "S" | "L", land: (i: number) => number) => { let n = 0; for (const [k, list] of Object.entries(FH[g])) if (f >= land(Number(k))) n += list.length; return n; };
  const landedN = (land: (i: number) => number) => DEFECTS.filter((_, i) => f >= land(i)).length;
  return (
    <g transform={`scale(${1 / u}) translate(${-L.W / 2} ${-CY})`}>
      {/* s1：兩片並排，同一組缺陷 */}
      <Pair f={f} o={oA} land={landA} bracket={c.s1_same} boxAt={22}
        lines={{ a: [`能用 ≈${roll(f, c.s1_hook, pctS)}%`, `好的 ≈${roll(f, c.s1_half + 8, S.S.good, 18)}／${S.S.all}`], b: [`能用 ≈${roll(f, c.s1_half, pctL)}%`, `好的 ≈${roll(f, c.s1_half + 12, S.L.good, 18)}／${S.L.all}`], aAt: [c.s1_hook, c.s1_half + 8], bAt: [c.s1_half, c.s1_half + 12] }} />
      {oA > 0 ? <g><Stamp x={840} y={1294} t="估算" f={f} at={c.s1_half + 4} px={58} /><Tag x={380} y={1294} t="估算（簡化模型）" c={H.amber} px={32} o={tween(f, c.s1_half + 8, 6)} /></g> : null}
      {/* s2：單片（大晶片那片滑走）＋放大鏡 */}
      {oB > 0 ? <g opacity={oB}>
        <Wafer id="pL2" v={{ ...VR, cx: VR.cx + 520 * tr }} g={GL} w={25} h={32} o={1 - tr} st={() => null} main={false} />
        <Wafer id="sB" v={vS} g={GS} w={10} h={10} o={1} st={() => null} />
        <Magnifier f={f} at={c.s2_invisible} v={VS} o={tr} />
        <Tag x={540} y={330} t="肉眼看不到" c={H.text} px={36} o={tween(f, c.s2_invisible, 6)} />
        <Tag x={540} y={1170} t="已確定" c={H.line} px={32} o={tween(f, c.s2_invisible, 6)} />
      </g> : null}
      <DefectCard f={f} o={oC} c={c} />
      {oC > 0 ? <Tag x={540} y={1214} t="已確定" c={H.line} px={32} o={oC} /> : null}
      {/* s4–s5：缺陷雨 → 良率定義 */}
      {oD > 0 ? <g opacity={oD}>
        <Wafer id="sD" v={VS} g={GS} w={10} h={10} o={1} st={(d) => { const s0 = rainSt(f, landD)(d); if (s0) { const lf = landD(d.hit); const hop = f >= c.s4_scrap && f < c.s4_scrap + 8 ? Math.max(0, 6 * Math.sin((Math.PI * (f - c.s4_scrap)) / 8)) : 0; return { ...s0, lift: hop, o: f >= c.s5_ratio ? mix(1, 0.45, tween(f, c.s5_ratio, 6)) : s0.o }; } return f >= c.s5_ratio && f < c.s5_ratio + 12 && d.hit < 0 ? { c: A.yGood, o: 0.9 } : f >= c.s5_ratio + 12 && d.hit < 0 ? { c: A.yGood, o: 0.55 } : null; }} defs={rain(f, landD).defs} />
        <Txt x={300} y={330} t={`缺陷 ${landedN(landD)}`} px={50} c={H.text} w={900} g="cD1" />
        <Txt x={780} y={330} t={`報廢 ${badCount("S", landD)} 格`} px={50} c={H.coral} w={900} g="cD2" />
        <Txt x={540} y={410} t={`同一片 ${S.S.all} 顆小晶片・缺陷位置為示意`} px={30} c={H.text2} w={800} g="cD3" />
        <Card x={140} y={1100} w={800} h={196} o={tween(f, c.s5_yield - 2, 6)} g="formula" c={H.line}>
          <Txt x={540} y={1170} t="良率 ＝ 好的 ÷ 全部" px={52} c={H.text} w={900} g="formula" />
          <Txt x={540} y={1250} t={`${roll(f, c.s5_yield + 2, S.S.good, 16)} ÷ ${S.S.all} ≈ ${roll(f, c.s5_yield + 2, pctS, 16)}%`} px={46} c={A.yGood} w={900} g="formula" />
        </Card>
        <Tag x={540} y={1326} t="已確定（定義）" c={H.line} px={30} o={tween(f, c.s5_yield + 8, 6)} />
      </g> : null}
      <Probe f={f} o={oE} c={c} />
      <D0View f={f} o={oF} c={c} />
      {/* s9：缺陷一樣密（兩片回來，缺陷位置淡淡的）→ 面積 ×8 → 同一場缺陷雨 */}
      <Pair f={f} o={oG1} land={null} faint={0.45} bracket={c.s9_dense} lines={{ a: ["", ""], b: ["", ""], aAt: [1e9, 1e9], bAt: [1e9, 1e9] }} />
      <AreaView f={f} o={oG2} c={c} />
      <Pair f={f} o={oH} land={landH} bracket={c.vH} hide={f >= bR ? REPAIR.d.i : -1}
        lines={{ a: [`報廢 ${badCount("S", landH)} 格`, `好的 ≈${roll(f, c.s10_s500, S.S.good, 18)}／${S.S.all}`], b: [`報廢 ${badCount("L", landH)} 格`, `好的 ≈${roll(f, c.s10_l20, S.L.good, 16)}／${S.L.all}`], aAt: [c.vH, c.s10_s500], bAt: [c.vH, c.s10_l20] }} />
      {oH > 0 ? <g opacity={oH}><Stamp x={840} y={1294} t="估算" f={f} at={c.s10_est} px={58} /><Tag x={380} y={1294} t="估算（簡化模型）・邊緣扣 3 mm" c={H.amber} px={30} o={tween(f, c.s10_est + 4, 6)} /></g> : null}
      <DieView f={f} o={oI} c={c} fromV={VL} />
      <ChartView f={f} o={oJ} c={c} />
      <SplitView f={f} o={oK} c={c} landL={landH} />
    </g>
  );
};

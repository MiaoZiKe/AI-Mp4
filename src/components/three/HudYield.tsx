// 2026/11/16 tech-yield（科技透明圈 第 4 支「晶圓良率」）的 2D 圖層：hud.levels[].art = "yield"。
// 整支片的畫面都在這裡（不掛 3D 畫布）：固定的斜視投影（cabinet 式 2.5D，只有仰角，晶片格投影後仍是矩形）。
// v2（念稿依 video_logic 第六節改寫）：兩片並排鉤子 → 晶圓切成一顆一顆 → 看不見的缺陷（放大鏡＋缺陷特寫卡）→ 缺陷雨與良率定義
// → 同一場缺陷雨打在小格與大格（＋放大一格對照）→ 面積 ×8 與能用比例長條 → 良率曲線與「查不到公布」→ 大晶片拆小再拼。
// 數字全部由程式算（真實格線實排、固定亂數的 71 個缺陷、泊松曲線），晶圓、計數器、長條同一份資料。
// 物理：缺陷與晶片塊受重力落下（位移 ∝ t²）、多次落地回彈（恢復係數 0.45）、撞擊壓扁；碎塊與跳出的晶片走拋物線；底板被壓一下（阻尼）。
// 換段不淡入淡出（硬切＋新段上滑 24px），晶圓與標籤一律實色。
// 時間：script.json 那一級的 cues（「幕_cue」→ 絕對幀，Hud.tsx 換好）；沒對到的 cue 是 1e9（那段不出現）。
// 版面檢查：每個字、標籤、蓋章、卡片、主素材、填色區、線段都登記到 YB（scripts/three/yield-check.mjs 逐幀檢查重疊、空白橫條、線條穿字）；顏色只讀 H 與 H.art。
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
const FALL = 12, Z0 = 9, REST = 0.45;
/** 自由落體落到 z=0（第 land 幀著地）＋多次回彈（恢復係數 REST，每次彈起高度 ×REST²，低於 2% 就停）：回傳高度（cm）與壓扁量（0–1，撞擊越重壓越扁） */
export const dropZ = (f: number, land: number, z0 = Z0, T = FALL) => {
  const tau = f - (land - T);
  if (tau < 0) return { z: z0, vis: false, sq: 0 };
  if (f <= land) return { z: z0 * (1 - (tau / T) ** 2), vis: true, sq: 0 };
  const g = (2 * z0) / (T * T);
  let t = f - land, v = REST * g * T, k = 1;
  while (v > 0) {
    const Tb = (2 * v) / g;
    if (t < Tb) { const sq = t < 3 ? (1 - t / 3) * k : 0; return { z: Math.max(0, v * t - 0.5 * g * t * t), vis: true, sq }; }
    t -= Tb; v *= REST; k *= REST;
    if ((v * v) / (2 * g) < 0.02 * z0) break;
  }
  return { z: 0, vis: true, sq: t < 3 ? (1 - t / 3) * k : 0 };
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
          {range(Math.max(3, Math.round(h / 4))).map((i, _, arr) => <line key={i} x1={pw * 0.18} x2={pw * 0.82} y1={ph * (0.22 + (0.56 * i) / Math.max(1, arr.length - 1))} y2={ph * (0.22 + (0.56 * i) / Math.max(1, arr.length - 1))} stroke={A.yTex} strokeWidth={Math.max(0.6, v.s * 0.025)} />)}
          {range(Math.max(1, Math.round(w / 6))).map((i, _, arr) => <line key={`v${i}`} x1={pw * (0.25 + (0.5 * i) / Math.max(1, arr.length - 1 || 1))} x2={pw * (0.25 + (0.5 * i) / Math.max(1, arr.length - 1 || 1))} y1={ph * 0.2} y2={ph * 0.8} stroke={A.yTex} strokeWidth={Math.max(0.5, v.s * 0.02)} />)}
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
        const [sx, sy] = P(v, p.x / 10, p.y / 10, 0), [, hy] = P(v, p.x / 10, p.y / 10, p.z), r = Math.max(3.6, v.s * 0.24);
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


/** 放大鏡（s2）：鏡圈內才看得到缺陷 */
const Magnifier: React.FC<{ f: number; at: number; v: V; o: number }> = ({ f, at, v, o }) => {
  const t = clamp01((f - at) / 40);
  if (f < at - 2 || o <= 0.02) return null;
  const ex = EASE.move(t), mx = mix(170, 900, ex), my = mix(430, 700, ex), r = 118, k = tween(f, at - 2, 4) * (1 - tween(f, at + 40, 6));
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


const pathOf = (pts: [number, number][]) => pts.map((p, i) => `${i ? "L" : "M"} ${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(" ");
/** 沿折線走的光點（拖尾）：u＝0–1 的位置 */
const along = (pts: [number, number][], u: number): [number, number] => {
  const seg = pts.slice(1).map((p, i) => Math.hypot(p[0] - pts[i][0], p[1] - pts[i][1])), tot = seg.reduce((a, b) => a + b, 0);
  let d = clamp01(u) * tot;
  for (let i = 0; i < seg.length; i++) { if (d <= seg[i]) { const t = seg[i] ? d / seg[i] : 0; return [mix(pts[i][0], pts[i + 1][0], t), mix(pts[i][1], pts[i + 1][1], t)]; } d -= seg[i]; }
  return pts[pts.length - 1];
};



// ───────── 換段（v2：不淡入淡出；硬切＋新段往上滑 24px 就位，晶圓與標籤一律實色） ─────────
const on = (f: number, a: number, b: number) => (f >= a && f < b ? 1 : 0);
const slideIn = (f: number, a: number) => 24 * (1 - tween(f, a, 6, EASE.enter));
/** 線段登記（給 yield-check 的「線條穿字」）：只登記直線段的外框 */
const regLine = (x1: number, y1: number, x2: number, y2: number, g: string) => reg("line", { x0: Math.min(x1, x2) - 1, x1: Math.max(x1, x2) + 1, y0: Math.min(y1, y2) - 1, y1: Math.max(y1, y2) + 1 }, g);
/** 實心填色區（給 yield-check 的「連續空白橫條」）：不參與重疊檢查 */
const regFill = (r: Rect, g: string) => reg("fill", r, g);
type C = Record<string, number>;

/** 兩片並排：s1–s2（鉤子）、s7（同一場缺陷雨）。y0＝晶圓上方標籤的基線 */
const Pair: React.FC<{ f: number; land: (i: number) => number; vl: V; vr: V; labY: number; cnt?: { a: string; b: string; at: [number, number]; y: number; sub?: { a: string; b: string; at: [number, number] } }; bracket?: { at: number; y: number }; boxAt?: number }> = ({ f, land, vl, vr, labY, cnt, bracket, boxAt }) => {
  const rs = rain(f, land);
  const pick = (g: Die[], v: V) => { const d = g.filter((x) => x.full && x.hit >= 0 && x.hit < 20).sort((a, b) => Math.hypot(a.x0 - 10, a.y0 + 20) - Math.hypot(b.x0 - 10, b.y0 + 20))[0]; if (!d) return null; const [x0, y0] = P(v, d.x0 / 10, d.y1 / 10), [x1, y1] = P(v, d.x1 / 10, d.y0 / 10); return { x0, y0, x1, y1 }; };
  const kb = boxAt !== undefined ? tween(f, boxAt, 4, EASE.enter) : 0;
  const bxs = kb > 0 ? [pick(GS, vl), pick(GL, vr)] : [];
  const kBr = bracket ? tween(f, bracket.at, 8, EASE.move) : 0;
  return (
    <g>
      <Wafer id="pS" v={vl} g={GS} w={10} h={10} o={1} st={rainSt(f, land)} defs={rs.defs} />
      <Wafer id="pL" v={vr} g={GL} w={25} h={32} o={1} st={rainSt(f, land)} defs={rs.defs} />
      <Txt x={vl.cx} y={labY} t="小晶片 10×10 mm" px={34} c={H.text2} w={800} g="pairlab" />
      <Txt x={vr.cx} y={labY} t="大晶片 25×32 mm" px={34} c={H.text2} w={800} g="pairlab2" />
      {bxs.map((b, i) => (b ? <rect key={i} x={b.x0 - 4} y={b.y0 - 4} width={b.x1 - b.x0 + 8} height={b.y1 - b.y0 + 8} fill={H.amber} fillOpacity={0.22} stroke={H.amber} strokeWidth={4} transform={`translate(${((b.x0 + b.x1) / 2) * (1 - (0.6 + 0.4 * kb))} ${((b.y0 + b.y1) / 2) * (1 - (0.6 + 0.4 * kb))}) scale(${0.6 + 0.4 * kb})`} /> : null))}
      {cnt ? <g>
        <g transform={`translate(0 ${flipY(f, cnt.at[0])})`}><Txt x={vl.cx} y={cnt.y} t={cnt.a} px={56} c={H.text} w={900} o={f >= cnt.at[0] ? 1 : 0} g="cntA" /></g>
        <g transform={`translate(0 ${flipY(f, cnt.at[1])})`}><Txt x={vr.cx} y={cnt.y} t={cnt.b} px={56} c={H.text} w={900} o={f >= cnt.at[1] ? 1 : 0} g="cntB" /></g>
        {cnt.sub ? <g><Txt x={vl.cx} y={cnt.y + 50} t={cnt.sub.a} px={32} c={H.text2} w={800} o={f >= cnt.sub.at[0] ? 1 : 0} g="cntA2" /><Txt x={vr.cx} y={cnt.y + 50} t={cnt.sub.b} px={32} c={H.text2} w={800} o={f >= cnt.sub.at[1] ? 1 : 0} g="cntB2" /></g> : null}
      </g> : null}
      {bracket && f >= bracket.at ? (regFill({ x0: 375, x1: 705, y0: bracket.y, y1: bracket.y + 72 }, "bracketfill"), null) : null}
      {bracket && kBr > 0.02 ? (
        <g>
          <path d={`M ${vl.cx - 120} ${bracket.y} V ${bracket.y + 14} H ${vr.cx + 120} V ${bracket.y}`} fill="none" stroke={H.line} strokeWidth={3} strokeDasharray={`${2000 * kBr} 2000`} />
          <rect x={540 - 165} y={bracket.y + 20} width={330} height={52} fill={H.line} />
          <Txt x={540} y={bracket.y + 59} t="同樣的缺陷分布" px={36} c={H.onAccent} w={900} g="bracket" />
        </g>
      ) : null}
    </g>
  );
};

/** s3：晶圓是什麼、切成一顆一顆（切割刀沿切割道走、晶片散開、其中一顆跳出來落在下方＝「一顆晶片」） */
const DiceView: React.FC<{ f: number; c: C; v: V }> = ({ f, c, v }) => {
  const se = sinE(v), [cx, cy] = P(v, 0, 0);
  const xs = [...new Set(GS.map((d) => d.x0))].sort((a, b) => a - b), ys = [...new Set(GS.map((d) => d.y0))].sort((a, b) => a - b);
  // 切割：c.s3_cut 起 18 幀橫向切割道依序切開、再 18 幀直向；c.s3_each 起晶片往外散開（間距放大 6%）
  const tH = clamp01((f - c.s3_cut) / 16), tV = clamp01((f - c.s3_cut - 16) / 16), ex = 1 + 0.06 * EASE.move(clamp01((f - c.s3_each) / 10));
  const nH = Math.floor(tH * ys.length), nV = Math.floor(tV * xs.length);
  const pick = REPAIR.d, pk = f >= c.s3_each + 4;
  const vx: V = { ...v };
  // 跳出來那一顆：往上彈（初速）再受重力落到下方的槽（拋物線＋落地回彈）
  const t0 = c.s3_each + 4, T = 18, u = clamp01((f - t0) / T);
  const [ax, ay] = P(v, ((pick.x0 + pick.x1) / 2 / 10) * ex, ((pick.y0 + pick.y1) / 2 / 10) * ex), bx = 540, by = 1145;
  const px = mix(ax, bx, u), py = mix(ay, by, u) - 260 * 4 * u * (1 - u), sz = mix(v.s, 150, EASE.move(u));
  const land = dropZ(f, t0 + T + 8, 0.25, 8), bounce = f > t0 + T ? -land.z * 300 : 0;
  // 刀：一個小圓盤，沿目前那一條切割道走
  const blade = tH < 1 ? { x: mix(cx - v.s * 15, cx + v.s * 15, (tH * ys.length) % 1), y: P(v, 0, (ys[Math.min(ys.length - 1, nH)] ?? 0) / 10)[1] } : tV < 1 && f >= c.s3_cut ? { x: P(v, (xs[Math.min(xs.length - 1, nV)] ?? 0) / 10, 0)[0], y: mix(cy - v.s * 15 * se, cy + v.s * 15 * se, (tV * xs.length) % 1) } : null;
  regFill({ x0: 340, x1: 740, y0: 1050, y1: 1240 }, "slot");
  return (
    <g>
      <g transform={`translate(${cx} ${cy}) scale(${ex}) translate(${-cx} ${-cy})`}>
        <Wafer id="dice" v={vx} g={GS} w={10} h={10} o={1} st={(d) => (pk && d.i === pick.i ? { c: H.bg, o: 1 } : null)} />
        <g clipPath="url(#wclip-dice)">
        {ys.slice(0, nH).map((y) => { const yy = P(v, 0, y / 10)[1]; return <line key={`h${y}`} x1={cx - v.s * 15} x2={cx + v.s * 15} y1={yy} y2={yy} stroke={A.yChuck3} strokeWidth={2} opacity={0.75} />; })}
        {xs.slice(0, nV).map((x) => { const xx = P(v, x / 10, 0)[0]; return <line key={`v${x}`} y1={cy - v.s * 15 * se} y2={cy + v.s * 15 * se} x1={xx} x2={xx} stroke={A.yChuck3} strokeWidth={2} opacity={0.75} />; })}
        </g>
      </g>
      {blade ? <g><circle cx={blade.x} cy={blade.y} r={22} fill={A.yChuck2} stroke={A.yChuck3} strokeWidth={3} /><circle cx={blade.x} cy={blade.y} r={6} fill={A.yChuck3} /></g> : null}
      <Tag x={540} y={300} t={f >= c.s3_wafer ? "晶圓＝整片圓形矽板（直徑 300 mm）" : "圓形的矽板"} c={H.line} px={32} o={1} />
      {/* 下方的槽：切出來的一小格＝一顆晶片 */}
      <rect x={465} y={1070} width={150} height={150} rx={6} fill="none" stroke={H.lineSoft} strokeWidth={3} strokeDasharray="10 8" opacity={pk ? 1 : 0} />
      <Txt x={540} y={1300} t="晶片＝切出來的一小格（10×10 mm）" px={32} c={H.text2} w={800} g="slotlab" />
      {pk ? (
        <g transform={`translate(${px} ${py + bounce})`}>
          <rect x={-sz / 2} y={-sz / 2 - (land.sq * sz * 0.08)} width={sz} height={sz * (1 - land.sq * 0.08)} fill={A.yFace} stroke={H.line} strokeWidth={3} />
          {sz > 60 ? <g opacity={clamp01((sz - 60) / 60)}>{range(4).map((i) => <line key={i} x1={-sz * 0.38} x2={sz * 0.38} y1={-sz * 0.3 + i * sz * 0.2} y2={-sz * 0.3 + i * sz * 0.2} stroke={A.yTex} strokeWidth={2} />)}<rect x={-sz * 0.4} y={-sz * 0.4} width={sz * 0.8} height={sz * 0.8} fill="none" stroke={A.yTex} strokeWidth={2} /></g> : null}
        </g>
      ) : null}
    </g>
  );
};

/** s4：缺陷特寫卡（下方）：左＝微粒落在兩條線之間（短路）；右＝一條線斷一截（斷路） */
const DefectCard: React.FC<{ f: number; c: C; y: number }> = ({ f, c, y: cardY }) => {
  const pW = 420, y0 = cardY + 64, y1 = cardY + 300;
  const panel = (x: number, kind: "p" | "l") => {
    const lx = [x + 90, x + 210, x + 330], at = kind === "p" ? c.s4_particle : c.s4_line;
    const k = f >= at - 4 ? 1 : 0;
    const land = at + 6, d = dropZ(f, land, 1, 10), py = (y0 + y1) / 2 + 6, pz = d.z * 150;
    const gapFlash = kind === "l" && f >= at ? 0.5 + 0.5 * Math.cos((f - at) * 0.6) : 0;
    return (
      <g>
        <rect x={x} y={y0} width={pW} height={y1 - y0} fill={A.board} stroke={H.lineSoft} strokeWidth={2} />
        {range(5).map((i) => <line key={i} x1={x} x2={x + pW} y1={y0 + 20 + i * 48} y2={y0 + 20 + i * 48} stroke={A.yTex} strokeWidth={1} opacity={0.5} />)}
        {lx.map((xx, i) => kind === "l" && i === 1
          ? <g key={i}><rect x={xx - 18} y={y0 + 14} width={36} height={py - 36 - y0 - 14} fill={A.edge} /><rect x={xx - 18} y={py + 34} width={36} height={y1 - 14 - py - 34} fill={A.edge} />
              <rect x={xx - 26} y={py - 42} width={52} height={80} fill="none" stroke={H.coral} strokeWidth={4} strokeDasharray="8 6" opacity={k * (0.4 + 0.6 * gapFlash)} /></g>
          : <rect key={i} x={xx - 18} y={y0 + 14} width={36} height={y1 - y0 - 28} fill={A.edge} />)}
        {kind === "p" && d.vis && f >= at - 4 ? (
          <g>
            {f >= land ? <rect x={lx[0] + 18} y={py - 12} width={lx[1] - lx[0] - 36} height={24} fill={H.coral} opacity={0.35 + 0.25 * Math.sin((f - land) * 0.5)} /> : null}
            <ellipse cx={(lx[0] + lx[1]) / 2} cy={py - pz} rx={44 * (1 + 0.3 * d.sq)} ry={40 * (1 - 0.35 * d.sq)} fill={A.yDefect} stroke={A.yDefRim} strokeWidth={4} />
          </g>
        ) : null}
        <Txt x={x + pW / 2} y={y1 + 56} t={kind === "p" ? "一顆微粒" : "一段沒做好的線路"} px={42} c={H.text} w={900} o={k} g={`dc-${kind}`} />
        <Txt x={x + pW / 2} y={y1 + 100} t={kind === "p" ? "兩條線被接起來（短路）" : "線斷了一截（斷路）"} px={30} c={H.coral} w={800} o={f >= at + (kind === "p" ? 8 : 2) ? 1 : 0} g={`dc-${kind}2`} />
      </g>
    );
  };
  return (
    <Card x={64} y={cardY} w={952} h={y1 + 128 - cardY} o={1} g="defcard">
      <Txt x={540} y={cardY + 46} t="一格晶片表面放大（示意，非實際比例）" px={30} c={H.text2} w={800} g="defcard" />
      {panel(84, "p")}{panel(576, "l")}
    </Card>
  );
};

/** s7：放大一顆小晶片和一顆大晶片，同一場缺陷雨（大的被打中、小的沒中） */
const ZoomCells: React.FC<{ f: number; c: C; y: number }> = ({ f, c, y }) => {
  const k = 6.4, sw = 10 * k, bw = 25 * k, bh = 32 * k, sx = 250, bx = 640, at = c.s7_big, hitAt = c.s7_hit;
    const d = dropZ(f, hitAt + 6, 1, 10), dz = d.z * 170, red = f >= hitAt + 6;
  regFill({ x0: sx - sw / 2, x1: bx + bw / 2, y0: y, y1: y + bh }, "zoom");
  return (
    <g>
      <rect x={sx - sw / 2} y={y + bh - sw} width={sw} height={sw} fill={A.yFace} stroke={H.line} strokeWidth={3} />
      <rect x={bx - bw / 2} y={y} width={bw} height={bh} fill={red ? A.yBad : A.yFace} stroke={H.line} strokeWidth={3} />
      {range(5).map((i) => <line key={i} x1={bx - bw / 2 + 10} x2={bx + bw / 2 - 10} y1={y + 20 + i * 36} y2={y + 20 + i * 36} stroke={A.yTex} strokeWidth={2} opacity={0.8} />)}
      {range(3).map((i) => <line key={`v${i}`} y1={y + 10} y2={y + bh - 10} x1={bx - bw / 2 + 35 + i * 35} x2={bx - bw / 2 + 35 + i * 35} stroke={A.yTex} strokeWidth={2} opacity={0.8} />)}
      {d.vis ? <ellipse cx={bx + 18} cy={y + bh * 0.45 - dz} rx={14 * (1 + 0.35 * d.sq)} ry={13 * (1 - 0.4 * d.sq)} fill={A.yDefect} stroke={A.yDefRim} strokeWidth={2.5} /> : null}
      <Txt x={sx} y={y + bh + 44} t="小晶片 1 顆" px={32} c={H.text2} w={800} g="zc1" />
      <Txt x={bx} y={y + bh + 44} t="大晶片 1 顆（面積 ×8）" px={32} c={H.text2} w={800} g="zc2" />
      <Txt x={(sx + bx) / 2 - 20} y={y + bh / 2} t="越大越容易中" px={34} c={H.coral} w={900} o={f >= hitAt + 6 ? 1 : 0} g="zc3" />
    </g>
  );
};

/** s8：面積 ×8（大晶片切成 8 條 25×4 mm，每條變形成 10×10 mm；面積不變）＋能用比例長條 */
const AreaBars: React.FC<{ f: number; c: C }> = ({ f, c }) => {
  const k = 9, sm = { x: 80, y: 330 }, bg = { x: 230, y: 250 }, gx = 556, gy = 290, at0 = c.s8_eight;
  const strips = range(8).map((i) => {
    const t = EASE.move(clamp01((f - (at0 + i * 2)) / 9));
    const fx = bg.x + 112.5, fy = bg.y + 18 + i * 36, tx = gx + (i % 4) * 100 + 45, ty = gy + Math.floor(i / 4) * 100 + 45;
    const w = mix(225, 90, t), h = mix(36, 90, t);
    return { x: mix(fx, tx, t) - w / 2, y: mix(fy, ty, t) - h / 2, w, h };
  });
  regFill({ x0: 80, x1: 960, y0: 250, y1: 538 }, "area");
  const doneAt = at0 + 14 + 9;
  const rows: [string, number, string, string, number][] = [["小晶片 100 mm²", 0.905, "≈ 9 成", A.yGood, c.s8_from], ["大晶片 800 mm²", 0.449, "不到一半", A.yBad, c.s8_drop]];
  return (
    <g>
      <rect x={sm.x} y={sm.y} width={10 * k} height={10 * k} fill={A.yFace} stroke={H.line} strokeWidth={3} />
      <rect x={bg.x} y={bg.y} width={25 * k} height={32 * k} fill="none" stroke={H.text3} strokeWidth={2} strokeDasharray="8 6" />
      {strips.map((s, i) => <rect key={i} x={s.x} y={s.y} width={s.w} height={s.h} fill={A.yFace} stroke={H.line} strokeWidth={2} />)}
      <Txt x={sm.x + 45} y={sm.y + 134} t="100 mm²" px={34} c={H.text} w={900} mono g="ar1" />
      <Txt x={bg.x + 112} y={bg.y + 330} t="800 mm²（25×32）" px={30} c={H.text} w={800} g="ar2" />
      <Stamp x={756} y={530} t="面積 ×8" f={f} at={doneAt} px={50} c={H.amber} />
      <Tag x={540} y={668} t="缺陷數字：廠商公布 ≈0.1 個／cm²（2020）" c={H.line} px={30} o={1} />
      <Card x={64} y={730} w={952} h={500} o={1} g="bars" c={H.amber}>
        <Txt x={540} y={790} t="能用的比例（估算）" px={36} c={H.text} w={900} g="bars" />
        {rows.map(([lab, v, txt, col, at], i) => { const y = 860 + i * 170, g = EASE.move(clamp01((f - at) / 16)), W = 600; return (
          <g key={lab}>
            <Txt x={110} y={y + 34} t={lab} px={32} c={H.text2} w={800} a="start" g="bars" />
            <rect x={110} y={y + 56} width={W} height={50} fill={A.yGray} opacity={0.35} />
            <rect x={110} y={y + 56} width={W * v * g} height={50} fill={col} />
            <Txt x={110 + W + 30} y={y + 98} t={g > 0.02 ? `${txt}` : ""} px={46} c={col} w={900} a="start" g="bars" />
          </g>); })}
      </Card>
      <Stamp x={820} y={1292} t="估算" f={f} at={c.s8_drop + 10} px={52} />
      <Tag x={360} y={1292} t="簡化模型（泊松）" c={H.amber} px={30} o={1} />
    </g>
  );
};


/** s10–s11：大晶片拉出來 → 提問卡 → 裂成 4 塊、壞的那塊飛走換好的、4 塊落到底板（重力＋回彈＋底板被壓） */
const SplitView: React.FC<{ f: number; c: C; landL: (i: number) => number; a0: number }> = ({ f, c, landL, a0 }) => {
  const vw: V = { cx: 540, cy: 470, s: 300 / 30, E: 60 }, b = BIG.d, K = 11;
  const pull = EASE.move(clamp01((f - (a0 + 4)) / 14)), wO = 1 - tween(f, a0 + 12, 6);
  const [fx0, fy0] = P(vw, b.x0 / 10, b.y1 / 10), [fx1, fy1] = P(vw, b.x1 / 10, b.y0 / 10);
  const W = 25 * K, Hh = 32 * K, cx = 540, top0 = 280;
  const dx0 = mix(fx0, cx - W / 2, pull), dy0 = mix(fy0, top0, pull), dw = mix(fx1 - fx0, W, pull), dh = mix(fy1 - fy0, Hh, pull);
  const sp = c.s10_split, crack = tween(f, sp, 4), shake = f >= sp && f < sp + 14 ? 7 * Math.exp(-(f - sp) / 4) * Math.sin((f - sp) * 2.4) : 0;
  const sep = 16 * tween(f, sp + 4, 6, EASE.move);
  const subY = top0 + Hh + 70, fall = dropZ(f, sp + 40, 1, 10), drop = 62 * (1 - fall.z) * (f >= sp + 30 ? 1 : 0);
  const press = f >= sp + 40 && f < sp + 54 ? 6 * Math.exp(-(f - sp - 40) / 3) * Math.cos((f - sp - 40) * 0.9) : 0;
  reg("main", { x0: cx - W / 2 - 20, x1: cx + W / 2 + 20, y0: top0, y1: subY + 72 }, "big");
  const tex = (x: number, y: number, w: number, h: number, key: string) => (
    <g key={key}>
      {range(Math.floor(h / 30)).map((i) => <line key={i} x1={x + 10} x2={x + w - 10} y1={y + 18 + i * 30} y2={y + 18 + i * 30} stroke={A.yTex} strokeWidth={1.6} opacity={0.75} />)}
      {range(Math.floor(w / 40)).map((i) => <line key={`v${i}`} y1={y + 10} y2={y + h - 10} x1={x + 24 + i * 40} x2={x + 24 + i * 40} stroke={A.yTex} strokeWidth={1.6} opacity={0.75} />)}
      <rect x={x + w * 0.12} y={y + h * 0.1} width={w * 0.34} height={h * 0.26} fill={A.yLogic} opacity={0.55} />
    </g>
  );
  const piece = (q: number) => {
    const qx = q % 2, qy = q < 2 ? 0 : 1;
    const x = cx - W / 2 + qx * (W / 2) + (qx ? sep / 2 : -sep / 2) + shake, y = top0 + qy * (Hh / 2) + (qy ? sep / 2 : -sep / 2) + drop;
    const isBad = q === BIG.q, t = clamp01((f - (sp + 10)) / 18), inT = sp + 30;
    if (isBad) {
      if (f < sp + 10) return { x, y, c: A.yBad };
      if (f < sp + 28) return { x: x + 560 * t, y: y - 380 * t + 560 * t * t, c: A.yBad, rot: 200 * t };
      const dz = dropZ(f, inT, 1, 12); return dz.vis ? { x, y: y - dz.z * 420, c: A.yGood } : null;
    }
    return { x, y, c: A.yGood };
  };
  return (
    <g>
      <Wafer id="sp" v={vw} g={GL} w={25} h={32} o={wO} st={rainSt(f, landL, (d) => (d.i === b.i && pull > 0 ? { c: H.bg, o: 1 } : null))} main={false} />
      {f < sp + 4 ? <g transform={`translate(${shake} 0)`}>
        <rect x={dx0} y={dy0} width={dw} height={dh} fill={A.yBad} stroke={H.panel} strokeWidth={3} />
        {pull > 0.6 ? tex(dx0, dy0, dw, dh, "big") : null}
        {pull > 0.5 ? <ellipse cx={dx0 + dw * BIG.u} cy={dy0 + dh * (1 - BIG.v)} rx={13} ry={12} fill={A.yDefect} stroke={A.yDefRim} strokeWidth={2.5} /> : null}
        {crack > 0 ? <g stroke={H.text} strokeWidth={3}><line x1={cx} x2={cx} y1={top0} y2={top0 + Hh * crack} /><line y1={top0 + Hh / 2} y2={top0 + Hh / 2} x1={cx - W / 2} x2={cx - W / 2 + W * crack} /></g> : null}
      </g> : range(4).map((q) => { const p = piece(q); if (!p) return null; return <g key={q} transform={(p as any).rot ? `rotate(${(p as any).rot} ${p.x + W / 4} ${p.y + Hh / 4})` : undefined}><rect x={p.x} y={p.y} width={W / 2 - 2} height={Hh / 2 - 2} fill={p.c === A.yBad && f < sp + 28 && q === BIG.q ? A.yBad : A.yGood} stroke={H.panel} strokeWidth={3} />{tex(p.x, p.y, W / 2 - 2, Hh / 2 - 2, `t${q}`)}</g>; })}
      {/* 底板（示意）：兩層＋接點，晶片落上去時被壓一下 */}
      <g transform={`translate(0 ${press})`}>
        <rect x={cx - W / 2 - 70} y={subY} width={W + 140} height={30} fill={A.ySub} stroke={A.ySub2} strokeWidth={3} />
        <rect x={cx - W / 2 - 70} y={subY + 30} width={W + 140} height={22} fill={A.ySub2} />
        {range(18).map((i) => <circle key={i} cx={cx - W / 2 - 50 + i * ((W + 100) / 17)} cy={subY + 60} r={6} fill={A.solder} />)}
        {range(16).map((i) => <rect key={`b${i}`} x={cx - W / 2 + 6 + i * ((W - 12) / 15) - 3} y={subY - 6} width={6} height={6} fill={A.yCopper} />)}
      </g>
      <Txt x={cx + W / 2 + 90} y={subY + 40} t="底板（示意）" px={30} c={H.text2} w={800} a="start" o={f >= sp + 20 ? 1 : 0} g="sublab" />
      <Txt x={cx - W / 2 - 90} y={top0 + 60} t={f >= sp + 4 ? "拆成 4 顆" : "大晶片"} px={34} c={H.text} w={900} a="end" o={pull > 0.6 ? 1 : 0} g="biglab" />
      <Card x={64} y={830} w={952} h={390} o={1} g="qcard" c={H.amber}>
        <Txt x={540} y={900} t="二選一" px={34} c={H.amber} w={900} g="qcard" />
        <Txt x={540} y={1000} t="硬做一整顆　還是　拆小再拼？" px={54} c={H.text} w={900} g="qcard" />
        <rect x={210} y={1080} width={64} height={80} fill={A.yFace} stroke={H.line} strokeWidth={2.5} />
        <Txt x={292} y={1134} t="一整顆" px={32} c={H.text2} w={800} a="start" g="qcard" />
        {range(4).map((q) => <rect key={q} x={660 + (q % 2) * 36} y={1080 + Math.floor(q / 2) * 42} width={32} height={38} fill={A.yFace} stroke={H.line} strokeWidth={2} />)}
        <Txt x={750} y={1134} t="拆成四顆再拼" px={32} c={H.text2} w={800} a="start" g="qcard" />
      </Card>
      <Tag x={540} y={1290} t="外形示意：拆開、各自測好、再拼回去" c={H.text3} px={30} o={f < c.s11_next + 1 ? 1 : 0} />
      <Stamp x={540} y={1290} t="下一支：先進封裝" f={f} at={c.s11_next} px={50} c={H.line} rot={-3} />
    </g>
  );
};

/** s12：良率－面積曲線（泊松，D0＝0.1／cm²）＋三家「良率 —」＋查不到公布 */
const ChartView: React.FC<{ f: number; o: number; c: C }> = ({ f, o, c }) => {
  if (o <= 0.01) return null;
  const x0 = 200, x1 = 950, y0 = 820, y1 = 360, X = (a: number) => x0 + ((x1 - x0) * a) / 900, Y = (p: number) => y0 - ((y0 - y1) * p) / 100;
  const g = EASE.move(clamp01((f - c.s9_simple) / 24)), amax = 900 * g;
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
        {([[100, "100 mm² ≈ 91%", 1, -26], [800, "800 mm² ≈ 45%", -1, 58]] as [number, string, number, number][]).map(([a, t, side, dy]) => { if (amax < a) return null; const k = tween(f, c.s9_simple + (a / 900) * 24, 5), px = X(a), py = Y(100 * Math.exp(-a / 1000)); return <g key={a} opacity={k}><circle cx={px} cy={py} r={12} fill={a === 100 ? A.yGood : H.coral} stroke={H.panel} strokeWidth={3} /><Txt x={px + side * 20} y={py + dy} t={t} px={36} c={H.text} w={900} a={side > 0 ? "start" : "end"} mono={false} g={`chart:cp${a}`} /></g>; })}
        <Txt x={x0} y={y0 + 136} t="估算（簡化模型）・成群時良率會好一些" px={30} c={H.amber} w={800} a="start" o={tween(f, c.s9_simple + 8, 6)} g="chart" />
      </Card>
      {["A", "B", "C"].map((n, i) => { const k = 1, x = 64 + i * 328; return (
        <Card key={n} x={x} y={1000} w={296} h={180} o={k} g={`ven${n}`} c={H.text3}>
          <Txt x={x + 148} y={1072} t={`廠商 ${n}`} px={34} c={H.text2} w={800} g={`ven${n}`} />
          <Txt x={x + 148} y={1146} t={f >= c.s9_each2 + i * 4 ? "良率 —" : "良率 ？"} px={44} c={H.text} w={900} g={`ven${n}`} />
        </Card>); })}
      <Tag x={540} y={1240} t="簡化估算（泊松模型）" c={H.amber} px={30} o={f < c.s9_unpub + 1 ? 1 : 0} />
      <Stamp x={540} y={1240} t="查不到公布" f={f} at={c.s9_unpub} px={50} c={H.coral} rot={-4} />
      <Txt x={540} y={1345} t="查證截至 2026/11/17" px={30} c={H.text2} w={800} o={1} g="asof" />
    </g>
  );
};


// ───────── 主程式 ─────────
export const YieldArt: React.FC<{ f: number; cues: C }> = ({ f, cues }) => {
  const c0 = new Proxy(cues, { get: (t, k: string) => (t[k] ?? 1e9) }) as C;
  // 換段的幀（狀態標籤落定後至少停 0.8 秒，所以有些段延到下一幕開頭幾幀）
  const v = { v3: c0.s3_start, v4: c0.s4_start + 4, v5: c0.s5_start, v7: Math.max(c0.s7_start, c0.s6_ratio < 1e8 ? c0.s6_ratio + 8 + 12 + 24 : 0), v8: c0.s8_start, v9: c0.s9_start + 6, v10: c0.s10_start + 4 };
  const c = new Proxy({ ...cues, ...v }, { get: (t, k: string) => ((t as any)[k] ?? 1e9) }) as C;
  const R = artRegion(L as any), CY = (R.y0 + R.y1) / 2, u = (L.INNER_W * (L.ART_FIT ?? 1)) / 1000;
  const S = STATS, pctS = Math.round((100 * S.S.good) / S.S.all), pctL = Math.round((100 * S.L.good) / S.L.all);
  // 缺陷雨的時刻表
  const landA = (i: number) => 4 + Math.floor(i / 2);                                     // s1：第 0 幀已在落，每幀 2 點
  const landD = (i: number) => c.v5 + 8 + (i < 10 ? i * 3 : 30 + (i - 10));                // s5：前 10 點每 3 幀、其餘每幀 1 點
  const landE = (i: number) => c.s7_random + Math.floor(i / 2);                            // s7：兩片同時、同一組
  const badCount = (g: "S" | "L", land: (i: number) => number) => { let n = 0; for (const [k, list] of Object.entries(FH[g])) if (f >= land(Number(k))) n += list.length; return n; };
  const landedN = (land: (i: number) => number) => DEFECTS.filter((_, i) => f >= land(i)).length;
  const VA: [V, V] = [{ cx: 285, cy: 800, s: 470 / 30, E: 62 }, { cx: 795, cy: 800, s: 470 / 30, E: 62 }];
  const VE: [V, V] = [{ cx: 285, cy: 560, s: 470 / 30, E: 62 }, { cx: 795, cy: 560, s: 470 / 30, E: 62 }];
  const VB: V = { cx: 540, cy: 700, s: 760 / 30, E: 58 }, VC: V = { cx: 540, cy: 560, s: 640 / 30, E: 58 }, VDw: V = { cx: 540, cy: 640, s: 760 / 30, E: 58 };
  const views: [number, number, React.ReactNode][] = [
    [0, c.v3, <g key="A">
      <Pair f={f} land={landA} vl={VA[0]} vr={VA[1]} labY={560} boxAt={20} bracket={{ at: c.s2_fab, y: 1130 }}
        cnt={{ a: `能用 ≈${roll(f, c.s2_hook, pctS)}%`, b: `能用 ≈${roll(f, c.s2_half - 18, pctL)}%`, at: [c.s2_hook, c.s2_half - 18], y: 1090 }} />
      <Tag x={540} y={1066} t="晶圓＝整片圓盤・晶片＝切出來的一小格" c={H.line} px={32} o={f < c.s2_hook ? 1 : 0} />
      <Tag x={540} y={1170} t="■ 紅格＝被缺陷打中、做壞的晶片" c={H.coral} px={30} o={f < c.s2_fab + 2 ? 1 : 0} />
      <Stamp x={840} y={1270} t="估算" f={f} at={c.s2_half + 4} px={56} />
      <Tag x={380} y={1270} t="估算（簡化模型）" c={H.amber} px={32} o={1} />
    </g>],
    [c.v3, c.v4, <g key="B"><DiceView f={f} c={c} v={VB} /></g>],
    [c.v4, c.v5, <g key="C">
      <Wafer id="sC" v={VC} g={GS} w={10} h={10} o={1} st={() => null} />
      <Magnifier f={f} at={c.s4_invisible} v={VC} o={1} />
      <Tag x={876} y={254} t="肉眼看不到" c={H.text} px={32} o={f >= c.s4_invisible ? 1 : 0} />
      <Tag x={204} y={254} t="已確定" c={H.line} px={30} o={1} />
      <DefectCard f={f} c={c} y={872} />
    </g>],
    [c.v5, c.v7, <g key="D">
      <Tag x={540} y={262} t="● 缺陷　■ 報廢的晶片　■ 能用的晶片" c={H.text2} px={30} o={1} />
      <Wafer id="sD" v={VDw} g={GS} w={10} h={10} o={1} st={(d) => { const s0 = rainSt(f, landD)(d); if (s0) { const hop = f >= c.s5_scrap && f < c.s5_scrap + 10 ? 14 * Math.max(0, Math.sin((Math.PI * (f - c.s5_scrap)) / 10)) : 0; return { ...s0, lift: hop }; } return f >= c.s6_ratio && d.hit < 0 ? { c: A.yGood, o: f < c.s6_ratio + 10 ? 1 : 0.7 } : null; }} defs={rain(f, landD).defs} />
      <Card x={140} y={1010} w={800} h={270} o={1} g="formula" c={H.line}>
        <Txt x={540} y={1074} t={`這一片：缺陷 ${landedN(landD)} 個・報廢 ${badCount("S", landD)} 顆`} px={40} c={H.text} w={900} g="formula" />
        <Txt x={540} y={1160} t="良率 ＝ 能用的 ÷ 全部" px={50} c={H.text} w={900} o={f >= c.s6_ratio + 4 ? 1 : 0} g="formula" />
        <Txt x={540} y={1240} t={`這一片 ≈ ${roll(f, c.s6_ratio + 8, pctS, 12)}%`} px={50} c={A.yGood} w={900} o={f >= c.s6_ratio + 8 ? 1 : 0} g="formula" />
      </Card>
      <Tag x={540} y={1326} t={f >= c.s6_ratio + 12 ? "已確定（定義）" : "缺陷位置為示意"} c={f >= c.s6_ratio + 12 ? H.line : H.text3} px={30} o={1} />
    </g>],
    [c.v7, c.v8, <g key="E">
      <Tag x={540} y={262} t="同一組缺陷，隨機落下" c={H.line} px={32} o={1} />
      <Pair f={f} land={landE} vl={VE[0]} vr={VE[1]} labY={330} bracket={{ at: c.v7, y: 790 }}
        cnt={{ a: `報廢 ${badCount("S", landE)} 顆`, b: `報廢 ${badCount("L", landE)} 顆`, at: [c.v7, c.v7], y: 935 }} />
      <ZoomCells f={f} c={c} y={1000} />
      <Tag x={540} y={1320} t="示意：兩片缺陷位置相同" c={H.text3} px={30} o={1} />
    </g>],
    [c.v8, c.v9, <g key="F"><AreaBars f={f} c={c} /></g>],
    [c.v9, c.v10, <g key="G"><ChartView f={f} o={1} c={c} /></g>],
    [c.v10, 1e9, <g key="H"><SplitView f={f} c={c} landL={landE} a0={c.v10} /></g>],
  ];
  return (
    <g transform={`scale(${1 / u}) translate(${-L.W / 2} ${-CY})`}>
      {views.map(([a, b, node]) => (on(f, a, b) ? <g key={a} transform={a > 0 ? `translate(0 ${slideIn(f, a)})` : undefined}>{node}</g> : null))}
    </g>
  );
};

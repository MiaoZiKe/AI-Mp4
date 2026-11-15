// 亮色 2.5D 小場景（script.json 頂層 styleVersion: 3 ＋ stage: "iso"）：粉彩等距小桌面，卡片從桌面飛起來、轉正給觀眾看。
// 只用 SVG 與 CSS 2D 矩陣（沒有 three.js／WebGL）。顏色、厚度、動作幀數全部讀 THEME_ISO／LAYOUT_ISO；時間全部由 engine 的 at() 從 cue 換算。
import React, { useMemo } from "react";
import { AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame } from "remotion";
import type { Script, TimelineV2 } from "../../types";
import { FONT_EN, FONT_ZH, FPS, LAYOUT_ISO as L, THEME_ISO as T } from "../../theme";
import { EASE, pop, springAccent, tween, typeChars } from "../anim";
import { buildIso, type Panel } from "./engine";
import { CaffHeaderLogo } from "./CaffLogoV2";
import { CoverFilm, FilmIso } from "./IsoFilm";
import { CoverShort, ShortIso } from "./IsoShort";
import { AgentIso, CoverAgent } from "./IsoAgent";
import { CoverMeeting, MeetingIso } from "./IsoMeeting";

const M = T.motion;
export const col = (name?: string) => T.color[name ?? "primary"] ?? T.color.primary;
const zh: React.CSSProperties = { fontFamily: FONT_ZH, whiteSpace: "nowrap", lineHeight: 1.16 };
const en: React.CSSProperties = { fontFamily: FONT_EN, whiteSpace: "nowrap", lineHeight: 1 };

// ───────── 等距投影與 2D 矩陣 ─────────
export type M6 = [number, number, number, number, number, number];
const CX = 0.866, SY = 0.5;
/** 世界座標（x 往右下、y 往左下、z 往上）→ 畫面座標 */
export const iso = (x: number, y: number, z = 0): [number, number] => [(x - y) * CX, (x + y) * SY - z];
export const mul = (m: M6, n: M6): M6 => [m[0] * n[0] + m[2] * n[1], m[1] * n[0] + m[3] * n[1], m[0] * n[2] + m[2] * n[3], m[1] * n[2] + m[3] * n[3], m[0] * n[4] + m[2] * n[5] + m[4], m[1] * n[4] + m[3] * n[5] + m[5]];
/** 平躺在高度 z 的平面（原點＝x,y 最小的那一角） */
export const ground = (x: number, y: number, z = 0): M6 => [CX, SY, -CX, SY, ...iso(x, y, z)];
/** 朝右前方（+x）的直立面；原點＝畫面上的左上角（x, y 最大, z 最高） */
export const wallX = (x: number, y: number, z: number): M6 => [CX, -SY, 0, 1, ...iso(x, y, z)];
export const at2 = (x: number, y: number, k = 1): M6 => [k, 0, 0, k, x, y];
export const mix = (a: M6, b: M6, t: number): M6 => a.map((v, i) => v + (b[i] - v) * t) as M6;
export const css = (m: M6) => `matrix(${m.map((v) => v.toFixed(4)).join(",")})`;
export const ap = (m: M6, p: [number, number]): [number, number] => [m[0] * p[0] + m[2] * p[1] + m[4], m[1] * p[0] + m[3] * p[1] + m[5]];
/** 從 a 飛到 b：矩陣內插＋一個往上的弧 */
export const fly = (a: M6, b: M6, t: number, arc: number = M.arc): M6 => { const m = mix(a, b, t); m[5] -= arc * Math.sin(Math.PI * t); return m; };
/** 以 (x,y,w,h) 的中心縮放 k 倍 */
export const popM = (x: number, y: number, w: number, h: number, k: number): M6 => at2(x + (w / 2) * (1 - k), y + (h / 2) * (1 - k), k);

// ───────── 鏡頭 ─────────
export type Key = { frame: number; look: [number, number, number]; zoom: number; sy: number };
export const camKeys = (panels: Panel[]): Key[] => panels.flatMap((x) => ([] as any[]).concat(x.p.camera ?? []).map((c, i) => ({ frame: i === 0 && !c.at ? x.in : x.at(c.at, x.in), look: c.look, zoom: c.zoom, sy: c.sy }))).sort((a, b) => a.frame - b.frame);
export const camAt = (keys: Key[], f: number): M6 => {
  if (!keys.length) return at2(L.W / 2, 900, 0.6);
  let [lx, ly] = iso(...keys[0].look), s = keys[0].zoom, sy = keys[0].sy;
  for (const k of keys.slice(1)) {
    const t = tween(f, k.frame, M.cam, EASE.move), [tx, ty] = iso(...k.look);
    lx += (tx - lx) * t; ly += (ty - ly) * t; s += (k.zoom - s) * t; sy += (k.sy - sy) * t;
  }
  return [s, 0, 0, s, L.W / 2 - s * lx, sy - s * ly];
};

// ───────── 世界裡的實體（SVG） ─────────
export type Tone = { top: string; l: string; r: string };
/** 圓角薄板：頂面＋往下的厚度（左前面受光、右前面背光） */
export const Slab: React.FC<{ id: string; x: number; y: number; z?: number; w: number; h: number; t: number; r?: number; c: Tone; children?: React.ReactNode }> = ({ id, x, y, z = 0, w, h, t, r = 0, c, children }) => {
  const Lp = iso(x, y + h, z), Rp = iso(x + w, y, z), Fp = iso(x + w, y + h, z), k = 0.507 * r, g = ground(x, y, z);
  const side = (fill: string) => (
    <>
      <rect width={w} height={h} rx={r} transform={css([g[0], g[1], g[2], g[3], g[4], g[5] + t])} fill={fill} />
      <polygon points={`${Lp[0] + k},${Lp[1]} ${Rp[0] - k},${Rp[1]} ${Rp[0] - k},${Rp[1] + t} ${Lp[0] + k},${Lp[1] + t}`} fill={fill} />
    </>
  );
  return (
    <g>
      <clipPath id={id}><rect x={Fp[0]} y={-6000} width={6000} height={12000} /></clipPath>
      {side(c.l)}
      <g clipPath={`url(#${id})`}>{side(c.r)}</g>
      <g transform={css(g)}><rect width={w} height={h} rx={r} fill={c.top} />{children}</g>
    </g>
  );
};
/** 直立方塊：頂面、左前面（+y）、右前面（+x） */
export const Box: React.FC<{ x: number; y: number; z?: number; dx: number; dy: number; dz: number; c: Tone }> = ({ x, y, z = 0, dx, dy, dz, c }) => {
  const P = (a: number, b: number, h: number) => iso(a, b, h).join(","), X = x + dx, Y = y + dy, Z = z + dz;
  const face = (pts: string, fill: string) => <polygon points={pts} fill={fill} stroke={fill} strokeWidth={3} strokeLinejoin="round" />;
  return (
    <g>
      {face(`${P(x, Y, Z)} ${P(X, Y, Z)} ${P(X, Y, z)} ${P(x, Y, z)}`, c.l)}
      {face(`${P(X, Y, Z)} ${P(X, y, Z)} ${P(X, y, z)} ${P(X, Y, z)}`, c.r)}
      {face(`${P(x, y, Z)} ${P(X, y, Z)} ${P(X, Y, Z)} ${P(x, Y, Z)}`, c.top)}
    </g>
  );
};
export const Shade: React.FC<{ x: number; y: number; w: number; h: number; r?: number; z?: number; a?: number }> = ({ x, y, w, h, r = 12, z = 0, a = T.shadowAlpha }) => (
  <rect width={w} height={h} rx={r} transform={css(ground(x, y, z))} fill={T.floor} opacity={a} />
);

/** 桌上物件的位置（世界座標；桌面 640×640、頂面 z＝0） */
const DESK = 640;
export const MON = { x: 64, y: 100, z: 44, dx: 26, dy: 420, dz: 270 };
export const SCR_W = MON.dy, SCR_H = MON.dz;
/** 螢幕面的矩陣（局部座標 420×270） */
export const SCR: M6 = wallX(MON.x + MON.dx, MON.y + MON.dy, MON.z + MON.dz);
const NEWS = { x: 396, y: 56, w: 210, h: 150 };
const LENS = { x: 340, y: 500 };

export type ScreenMode = "num" | "idle" | "think" | "done" | "ok";
export type WorldState = { f: number; cam: M6; mode: ScreenMode; flash: number; num?: { label: string; value: string; size?: number }; lensOnDesk: boolean; sheet: boolean; news: { x: number; y: number; z: number; k: number; o: number }; trail?: string | null };

export const ScreenFace: React.FC<{ st: WorldState }> = ({ st }) => {
  const { mode, f, flash } = st, S = T.screen;
  return (
    <g transform={css(SCR)}>
      <rect x={14} y={14} width={SCR_W - 28} height={SCR_H - 28} rx={20} fill={S.face} />
      {flash > 0 ? <rect x={14} y={14} width={SCR_W - 28} height={SCR_H - 28} rx={20} fill={S.glow} opacity={flash} /> : null}
      {mode === "num" && st.num ? (
        <>
          <text x={38} y={100} fontFamily={FONT_ZH} fontWeight={T.weight.title} fontSize={62} fill={S.on}>{st.num.label}</text>
          <text x={36} y={216} fontFamily={FONT_EN} fontWeight={T.weight.title} fontSize={st.num.size ?? 116} fill={S.on}>{st.num.value}</text>
        </>
      ) : null}
      {mode === "idle" ? (
        <>
          <path d="M120 135 C120 105 130 95 160 95 C130 95 120 85 120 55 C120 85 110 95 80 95 C110 95 120 105 120 135 Z" transform="translate(-4 40) scale(1.25)" fill={S.on} />
          <text x={212} y={174} fontFamily={FONT_EN} fontWeight={T.weight.title} fontSize={104} fill={S.on}>AI</text>
        </>
      ) : null}
      {mode === "think" ? [0, 1, 2].map((i) => <circle key={i} cx={150 + i * 60} cy={135 - 16 * Math.max(0, Math.sin((f - i * 3) / 2.2))} r={18} fill={S.on} />) : null}
      {mode === "done" ? [300, 250, 320, 180].map((w, i) => <rect key={i} x={46} y={54 + i * 46} width={w} height={22} rx={11} fill={i === 0 ? S.on : S.bar} />) : null}
      {mode === "ok" ? (
        <>
          <circle cx={210} cy={135} r={78} fill={S.on} />
          <path d="M172 136 L200 164 L250 108" fill="none" stroke={T.color.right.fill} strokeWidth={22} strokeLinecap="round" strokeLinejoin="round" />
        </>
      ) : null}
    </g>
  );
};

const World: React.FC<{ st: WorldState }> = ({ st }) => {
  const S = T.solid, n = st.news;
  return (
    <svg width={L.W} height={L.H} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
      <defs>
        <pattern id="isoDots" width={80} height={80} patternUnits="userSpaceOnUse" patternTransform={css(mul(st.cam, ground(0, 0, -60)))}><circle cx={10} cy={10} r={5} fill={T.dot} /></pattern>
      </defs>
      <rect x={0} y={L.HEADER_TOP + 90} width={L.W} height={L.CAP_TOP - L.HEADER_TOP - 90} fill="url(#isoDots)" />
      <g transform={css(st.cam)}>
        <Shade x={50} y={50} w={DESK} h={DESK} r={56} z={-110} />
        <Slab id="isoDesk" x={0} y={0} w={DESK} h={DESK} t={40} r={48} c={S.desk} />
        {/* 螢幕：影子、底座、支架、機身、螢幕面 */}
        <Shade x={MON.x} y={MON.y} w={190} h={MON.dy} />
        <Slab id="isoBase" x={44} y={250} z={10} w={120} h={120} t={10} r={16} c={S.white} />
        <Box x={68} y={296} z={10} dx={14} dy={28} dz={40} c={S.white} />
        <Box {...MON} c={S.white} />
        <ScreenFace st={st} />
        {/* 盆栽 */}
        <Shade x={540} y={300} w={86} h={56} />
        <Box x={540} y={300} dx={56} dy={56} dz={50} c={S.mint} />
        {[[-16, -64, -24], [14, -70, 16], [0, -92, 0]].map(([dx, dy, rot], i) => { const [px, py] = iso(568, 328, 50); return <ellipse key={i} cx={px + dx} cy={py + dy + 30} rx={15} ry={34} transform={`rotate(${rot} ${px + dx} ${py + dy + 30})`} fill={i === 2 ? S.mint.l : S.mint.r} />; })}
        {/* 鍵盤 */}
        <Shade x={216} y={206} w={104} h={260} />
        <Slab id="isoKb" x={210} y={200} z={12} w={96} h={260} t={12} r={12} c={S.lav}>
          {Array.from({ length: 21 }, (_, i) => <rect key={i} x={10 + (i % 3) * 27} y={12 + Math.floor(i / 3) * 34} width={21} height={26} rx={5} fill={T.card} opacity={0.82} />)}
        </Slab>
        {/* 便條（空白的，裝飾）與鉛筆 */}
        <Slab id="isoNote" x={420} y={400} z={5} w={120} h={120} t={5} r={6} c={S.yellow}><rect x={16} y={24} width={70} height={10} rx={5} fill={S.yellow.r} /><rect x={16} y={48} width={50} height={10} rx={5} fill={S.yellow.r} /></Slab>
        <Shade x={156} y={556} w={150} h={18} r={6} />
        <Box x={150} y={548} dx={150} dy={14} dz={12} c={S.coral} />
        {/* 答案紙落回桌上 */}
        {st.sheet ? <Slab id="isoSheet" x={350} y={236} z={5} w={170} h={120} t={5} r={8} c={S.white}>{[110, 130, 90].map((w, i) => <rect key={i} x={18} y={22 + i * 28} width={w} height={12} rx={6} fill={i === 0 ? T.color.wrong.fill : T.cardSide} />)}</Slab> : null}
        {/* 放大鏡 */}
        {st.lensOnDesk ? (
          <g>
            {[0, 10].map((z) => (
              <g key={z} transform={css(ground(LENS.x, LENS.y, z))}>
                <line x1={34} y1={34} x2={92} y2={92} stroke={z ? S.lav.l : S.lav.r} strokeWidth={18} strokeLinecap="round" />
                <circle r={44} fill={z ? T.card : S.lav.r} fillOpacity={z ? 0.7 : 1} stroke={z ? S.lav.top : S.lav.r} strokeWidth={14} />
              </g>
            ))}
          </g>
        ) : null}
        {/* 新聞紙：飛起來的時候在桌上留影子，沿虛線飛進螢幕 */}
        {st.trail ? <polyline points={st.trail} fill="none" stroke={T.color.primary.fill} strokeWidth={6} strokeDasharray="4 16" strokeLinecap="round" /> : null}
        {n.o > 0 ? (
          <g opacity={n.o}>
            <Shade x={n.x + 6} y={n.y + 6} w={NEWS.w * n.k} h={NEWS.h * n.k} a={T.shadowAlpha * (n.z > 20 ? 0.7 : 1)} />
            <g transform={`translate(${iso(n.x, n.y, n.z).join(" ")}) scale(${n.k})`}>
              <Slab id="isoNews" x={0} y={0} w={NEWS.w} h={NEWS.h} t={6} r={8} c={S.white}>
                <rect x={14} y={14} width={64} height={24} rx={6} fill={T.color.wrong.fill} />
                <rect x={14} y={50} width={150} height={16} rx={6} fill={T.ink} />
                {[0, 1, 2].map((i) => <rect key={i} x={14} y={80 + i * 20} width={i === 2 ? 70 : 110} height={9} rx={4.5} fill={T.cardSide} />)}
                <rect x={140} y={78} width={54} height={54} rx={8} fill={S.mint.top} />
              </Slab>
            </g>
          </g>
        ) : null}
      </g>
    </svg>
  );
};

// ───────── 轉正的卡片（HTML，畫面座標） ─────────
export const Bb: React.FC<{ m: M6; w: number; h?: number; o?: number; children?: React.ReactNode; style?: React.CSSProperties }> = ({ m, w, h, o = 1, children, style }) => (
  o <= 0.001 ? null : <div style={{ position: "absolute", left: 0, top: 0, width: w, height: h, transformOrigin: "0 0", transform: css(m), opacity: o, ...style }}>{children}</div>
);
export const face = (bg: string = T.card, side: string = T.cardSide, d: number = T.depth.card, r: number = T.radius.card): React.CSSProperties => ({ width: "100%", height: "100%", boxSizing: "border-box", background: bg, borderRadius: r, boxShadow: `0 ${d}px 0 ${side}, ${T.depth.soft}` });
export const Chip: React.FC<{ text: string; bg: string; fg: string; px?: number; side?: string; style?: React.CSSProperties }> = ({ text, bg, fg, px = 30, side, style }) => (
  <div style={{ ...zh, display: "inline-block", fontWeight: T.weight.strong, fontSize: px, color: fg, background: bg, borderRadius: T.radius.chip, padding: `${Math.round(px * 0.34)}px ${Math.round(px * 0.8)}px`, boxShadow: side ? `0 6px 0 ${side}` : undefined, ...style }}>{text}</div>
);
/** 螢光標記：色塊從左往右抹到字的後面 */
export const Mark: React.FC<{ f: number; at: number; bg: string; fg?: string; children: React.ReactNode; style?: React.CSSProperties }> = ({ f, at, bg, fg, children, style }) => {
  const p = tween(f, at, M.mark, EASE.move);
  return <span style={{ color: p > 0.5 ? fg : undefined, backgroundImage: `linear-gradient(${bg},${bg})`, backgroundRepeat: "no-repeat", backgroundSize: `${(100 * p).toFixed(1)}% 84%`, backgroundPosition: "0 60%", borderRadius: T.radius.mark, padding: "0 0.08em", ...style }}>{children}</span>;
};
export const marked = (text: string, target: string | undefined, f: number, at: number, bg: string, fg?: string) => {
  const i = target ? text.indexOf(target) : -1;
  if (i < 0 || !target) return text;
  return <>{text.slice(0, i)}<Mark f={f} at={at} bg={bg} fg={fg}>{target}</Mark>{text.slice(i + target.length)}</>;
};
export const Strike: React.FC<{ f: number; at: number; color: string; h?: number }> = ({ f, at, color, h = 12 }) => (
  <div style={{ position: "absolute", left: "-3%", top: "52%", height: h, marginTop: -h / 2, borderRadius: h, background: color, width: `${(106 * tween(f, at, M.strike, EASE.move)).toFixed(1)}%` }} />
);
/** 蓋章：從大縮到定位（M.slam 幀），蓋下去之前看不到 */
export const slam = (f: number, at: number, rot = 0, from = 2.2): React.CSSProperties => ({ opacity: f < at ? 0 : 1, transform: `rotate(${rot}deg) scale(${(1 + (from - 1) * (1 - tween(f, at, M.slam, EASE.exit))).toFixed(4)})` });
export const bounce = (f: number, at: number, rot = 0): React.CSSProperties => ({ opacity: tween(f, at, 3), transform: `scale(${(f < at ? 0.4 : pop(f, at, 0.4)).toFixed(4)}) rotate(${rot}deg)` });
export const riseIn = (f: number, at: number, dist = 90): React.CSSProperties => ({ opacity: tween(f, at, 6), transform: `translateY(${Math.round((1 - springAccent(f, at)) * dist)}px)` });
export const Check: React.FC<{ size: number; color: string }> = ({ size, color }) => (
  <svg width={size} height={size} viewBox="0 0 48 48"><path d="M10 25 L20 35 L38 14" fill="none" stroke={color} strokeWidth={7} strokeLinecap="round" strokeLinejoin="round" /></svg>
);

/** 版面上固定的位置（畫面座標） */
const POS = {
  title: { y: 408 }, pin: { x: 676, y: 790, w: 340, h: 196 },
  ask: { x: L.X, y: 950, w: L.INNER_W, h: 274 }, note: { x: 610, y: 600, w: 400, h: 176 },
  ans: { x: L.X, y: 716, w: L.INNER_W, h: 520 },
  wrong: { x: 330, y: 436, w: 420, h: 250, toX: 70, toY: 800, toK: 0.56 }, right: { x: 190, y: 432, w: 700, h: 336 },
} as const;

const Stage: React.FC<{ panels: Panel[]; f: number }> = ({ panels, f }) => {
  const keys = useMemo(() => camKeys(panels), [panels]);
  const cam = camAt(keys, f);
  const P = Object.fromEntries(panels.map((x) => [x.kind, x])) as Record<string, Panel | undefined>;
  const hk = P.hook, ak = P.ask, an = P.answer, cp = P.compare, nx = P.next;
  const FAR = 1e9;
  // 各段的關鍵時刻（全部從 cue 來）
  const askIn = ak?.in ?? FAR, tSend = ak ? ak.at(ak.p.sendAt, FAR) : FAR, arrive = tSend + M.fly;
  const ansIn = an?.in ?? FAR, tOut = an ? an.at(an.p.outAt, ansIn) : FAR, settled = tOut + M.fly;
  const cpIn = cp?.in ?? FAR, tDrop = cp ? cp.at(cp.p.right?.at, cpIn + 30) : FAR, land = tDrop + 8;
  const nxIn = nx?.in ?? FAR, tGo = nx ? nx.at(nx.p.flyAt, nxIn + 20) : FAR, arrive2 = tGo + M.cam;
  const scrCard = (w: number) => mul(cam, mul(SCR, at2(0, 40, SCR_W / w)));

  // 世界狀態
  const mode: ScreenMode = f >= arrive2 ? "ok" : f >= tOut ? "done" : f >= arrive ? "think" : f >= askIn + 4 ? "idle" : "num";
  const flashAt = [arrive, tOut, arrive2].filter((t) => f >= t).pop();
  const flash = flashAt === undefined ? 0 : 0.85 * (1 - tween(f, flashAt, 10, EASE.enter));
  const g = tween(f, tGo, M.cam, EASE.move), hover = nx ? 34 * tween(f, nxIn + 6, 8) : 0;
  const newsAt = (t: number) => ({ x: NEWS.x + (120 - NEWS.x) * t, y: NEWS.y + (230 - NEWS.y) * t, z: 6 + hover + (150 - 6 - hover) * t + 90 * Math.sin(Math.PI * t), k: 1 - 0.45 * t });
  const trail = g > 0 && g < 1 ? Array.from({ length: Math.max(2, Math.round(g * 20)) }).map((_, i, a) => { const q = newsAt((g * i) / (a.length - 1)); return iso(q.x + (NEWS.w * q.k) / 2, q.y + (NEWS.h * q.k) / 2, q.z).map((v) => v.toFixed(1)).join(","); }).join(" ") : null;
  const st: WorldState = { f, cam, mode, flash, num: hk?.p.screen, lensOnDesk: !an || f < an.at(an.p.lens?.at, FAR), sheet: f >= cpIn + M.fly - 2, news: { ...newsAt(g), o: 1 - tween(f, arrive2 - 3, 3) }, trail };

  const out: React.ReactNode[] = [];
  // ── 鉤子：大字主張＋螢幕上的錯數字＋今年的數字卡 ──
  if (hk && f < askIn + M.exit) {
    const p = hk.p, e = tween(f, askIn, M.exit, EASE.exit), o = 1 - e, up = -70 * e;
    const size = p.size ?? 128;
    out.push(
      <div key="hk-title" style={{ position: "absolute", left: L.X, top: L.MAIN_TOP + 6, width: L.INNER_W, opacity: o, transform: `translateY(${up}px)` }}>
        <Chip text={p.kicker} bg={T.card} fg={T.ink2} side={T.cardSide} />
        <div style={{ marginTop: 22 }}>{(p.title as string[]).map((t, i) => <div key={i} style={{ ...zh, fontWeight: T.weight.title, fontSize: size, color: T.ink, letterSpacing: "-0.01em" }}>{marked(t, p.mark?.text, f, hk.at(p.mark?.at, 0), col(p.mark?.color).soft, col(p.mark?.color).text)}</div>)}</div>
      </div>,
    );
    if (p.stamp) {
      const [sx, sy] = ap(cam, iso(MON.x + MON.dx, MON.y + 150, MON.z + 70)), c = col("wrong");
      out.push(<div key="hk-stamp" style={{ position: "absolute", left: sx + 10, top: sy + 64, opacity: o }}><div style={slam(f, hk.at(p.stamp.at, 10), -7)}><div style={{ ...zh, fontWeight: T.weight.title, fontSize: 46, color: c.text, background: T.card, border: `6px solid ${c.fill}`, borderRadius: 16, padding: "8px 22px", boxShadow: T.depth.soft }}>{p.stamp.text}</div></div></div>);
    }
    if (p.pin) {
      const c = col("right"), q = POS.pin, bAt = hk.at(p.pin.bumpAt, FAR), k = f >= bAt ? pop(f, bAt, 0.9) : 1;
      out.push(
        <Bb key="hk-pin" m={popM(q.x, q.y + up, q.w, q.h, k)} w={q.w} h={q.h} o={o}>
          <div style={{ ...face(c.fill, c.side, T.depth.tile, T.radius.tile), padding: "22px 30px" }}>
            <div style={{ ...zh, fontWeight: T.weight.strong, fontSize: 34, color: c.on }}>{p.pin.label}</div>
            <div style={{ ...en, fontWeight: T.weight.title, fontSize: p.pin.size ?? 92, color: c.on, marginTop: 12 }}>{p.pin.value}</div>
          </div>
          {p.pin.tag ? <div style={{ position: "absolute", right: -6, top: q.h + 30, ...bounce(f, hk.at(p.pin.tagAt, FAR), -3), transformOrigin: "100% 0" }}><Chip text={p.pin.tag} bg={T.card} fg={c.text} px={32} side={T.cardSide} /></div> : null}
        </Bb>,
      );
    }
  }
  // ── 只打一句話：提示卡打字 → 沿虛線飛進螢幕 ──
  if (ak && f >= askIn && f < Math.max(arrive, ansIn) + M.exit) {
    const p = ak.p, q = POS.ask, c = col("primary"), t = tween(f, tSend, M.fly, EASE.move);
    const lines = p.lines as string[], total = lines.join("").length, shown = typeChars(f, ak.at(p.typeAt, askIn), total, M.step);
    const ent = springAccent(f, askIn + 3), home = at2(q.x, q.y + Math.round((1 - ent) * 160));
    const m = fly(home, scrCard(q.w), t);
    let used = 0;
    out.push(
      <Bb key="ak-card" m={m} w={q.w} h={q.h} o={tween(f, askIn + 3, 5) * (1 - tween(f, arrive - 3, 3))}>
        <div style={{ ...face(), padding: "26px 40px" }}>
          <Chip text={p.label} bg={c.soft} fg={c.text} px={30} />
          <div style={{ marginTop: 14 }}>{lines.map((ln, i) => { const n = Math.max(0, Math.min(ln.length, shown - used)); used += ln.length; const caret = shown < total ? n > 0 && n < ln.length || (n === ln.length && shown === used) : false; return <div key={i} style={{ ...zh, fontWeight: T.weight.title, fontSize: p.size ?? 68, color: T.ink, height: Math.round((p.size ?? 68) * 1.2) }}>{ln.slice(0, n)}{caret || (i === lines.length - 1 && shown >= total && Math.floor(f / 8) % 2 === 0 && t === 0) ? <span style={{ display: "inline-block", width: 8, height: "0.9em", background: c.fill, marginLeft: 6, verticalAlign: "-0.08em", borderRadius: 4 }} /> : null}</div>; })}</div>
        </div>
      </Bb>,
    );
    if (t > 0 && f < arrive + 6) {
      const pts = Array.from({ length: Math.max(2, Math.round(t * 18)) }).map((_, i, a) => ap(fly(home, scrCard(q.w), (t * i) / (a.length - 1)), [q.w / 2, q.h / 2]).map((v) => v.toFixed(1)).join(",")).join(" ");
      out.push(<svg key="ak-trail" width={L.W} height={L.H} style={{ position: "absolute", left: 0, top: 0, opacity: 1 - tween(f, arrive, 6) }}><polyline points={pts} fill="none" stroke={c.fill} strokeWidth={7} strokeDasharray="5 18" strokeLinecap="round" /></svg>);
    }
    const ex = 1 - tween(f, Math.max(ansIn, arrive), M.exit, EASE.exit);
    if (p.tag) out.push(<div key="ak-tag" style={{ position: "absolute", left: L.X, top: L.MAIN_TOP + 8, opacity: ex }}><div style={{ ...bounce(f, ak.at(p.tag.at, askIn)), transformOrigin: "0 50%" }}><Chip text={p.tag.text} bg={T.card} fg={T.ink2} px={30} side={T.cardSide} /></div></div>);
    if (p.note) {
      const nq = POS.note, nc = col("note"), nAt = ak.at(p.note.at, askIn);
      out.push(
        <div key="ak-note" style={{ position: "absolute", left: nq.x, top: nq.y, width: nq.w, height: nq.h, opacity: ex }}>
          <div style={{ width: "100%", height: "100%", ...bounce(f, nAt, 3) }}>
            <div style={{ ...face(nc.fill, nc.side, T.depth.card, 18), padding: "22px 28px" }}>
              <div style={{ ...zh, fontWeight: T.weight.title, fontSize: 60, color: nc.on }}>{p.note.text}</div>
              <div style={{ ...zh, fontWeight: T.weight.body, fontSize: 30, color: nc.text, marginTop: 12 }}>{p.note.sub}</div>
            </div>
          </div>
        </div>,
      );
    }
  }
  // ── 螢幕吐出回答卡（實測節錄）→ 後面還有一大疊 → 放大鏡找到 1.69% ──
  if (an && f >= tOut && f < cpIn + M.fly) {
    const p = an.p, q = POS.ans, c = col("primary"), w = col("wrong");
    const t = tween(f, tOut, M.fly, EASE.move), b = tween(f, cpIn, M.fly, EASE.move);
    const back = mul(cam, mul(ground(350, 236, 12), at2(0, 0, 170 / q.w)));
    const m = b > 0 ? fly(at2(q.x, q.y), back, b, 40) : fly(scrCard(q.w), at2(q.x, q.y), t);
    const o = tween(f, tOut, 3) * (1 - tween(f, cpIn + M.fly - 4, 4));
    const tStack = Math.max(an.at(p.stackAt, settled), settled), tLens = an.at(p.lens?.at, FAR), target = p.lens?.text as string | undefined;
    let first = true;
    const line = (ln: string, key: number) => {
      const segs = target ? ln.split(target) : [ln];
      return (
        <div key={key} style={{ fontFamily: FONT_ZH, fontWeight: T.weight.body, fontSize: 40, lineHeight: 1.5, color: T.ink, marginTop: key ? 14 : 0 }}>
          {segs.map((s, i) => {
            const host = i > 0 && first; if (i > 0) first = false;
            return (
              <React.Fragment key={i}>
                {i > 0 ? (
                  <Mark f={f} at={tLens} bg={w.soft} fg={w.text} style={{ position: "relative", fontWeight: T.weight.title, whiteSpace: "nowrap" }}>
                    {target}
                    {host ? <Lens f={f} at={tLens} text={target as string} dx={p.lens?.dx} dy={p.lens?.dy} /> : null}
                  </Mark>
                ) : null}
                {s}
              </React.Fragment>
            );
          })}
        </div>
      );
    };
    if (b === 0) [1, 0].forEach((i) => { const s = tween(f, tStack + i * M.stagger, 8); if (s > 0) out.push(<div key={`an-st${i}`} style={{ position: "absolute", left: q.x + 22 * (i + 1), top: q.y + Math.round(17 * (i + 1) * s), width: q.w - 44 * (i + 1), height: q.h, borderRadius: T.radius.card, background: T.card, boxShadow: `0 ${T.depth.card}px 0 ${T.cardSide}`, opacity: s }} />); });
    out.push(
      <Bb key="an-card" m={m} w={q.w} h={q.h} o={o}>
        <div style={{ ...face(), padding: "30px 40px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
            <Chip text={p.label} bg={c.fill} fg={c.on} px={30} />
            <div style={{ ...zh, fontWeight: T.weight.body, fontSize: L.MIN_PX, color: T.ink3 }}>{p.by}</div>
          </div>
          {(p.lines as string[]).map(line)}
          {p.more ? <div style={{ ...zh, fontWeight: T.weight.body, fontSize: L.MIN_PX, color: T.ink3, marginTop: 14, opacity: tween(f, tStack, 6) }}>{p.more}</div> : null}
        </div>
      </Bb>,
    );
  }
  // ── 錯的數字被彈開、對的蓋章 ──
  if (cp && f >= cpIn && f < nxIn + M.exit) {
    const p = cp.p, wq = POS.wrong, rq = POS.right, wc = col("wrong"), rc = col("right");
    const e = tween(f, nxIn, M.exit, EASE.exit), o = 1 - e, up = -80 * e;
    const a = tween(f, cpIn + 2, 10, EASE.move), k = tween(f, land, 16, EASE.enter);
    const tStamp = cp.at(p.wrong.stampAt, cpIn + 10);
    // 錯的：從放大鏡的位置長出來 → 被撞開，滾到左下角
    const wk = (0.3 + 0.7 * a) * (1 + (wq.toK - 1) * k);
    const wx = 640 + (wq.x - 640) * a + (wq.toX - wq.x) * k, wy = 860 + (wq.y - 860) * a + (wq.toY - wq.y) * k - 150 * Math.sin(Math.PI * k) + up;
    out.push(
      <Bb key="cp-wrong" m={at2(wx, wy, wk)} w={wq.w} h={wq.h} o={tween(f, cpIn + 2, 3) * o}>
        <div style={{ width: "100%", height: "100%", transform: `rotate(${(-14 * k).toFixed(2)}deg)` }}>
          <div style={{ ...face(wc.soft, wc.fill, T.depth.tile, T.radius.tile), padding: "22px 34px" }}>
            <div style={{ ...zh, fontWeight: T.weight.strong, fontSize: 34, color: wc.text }}>{p.wrong.label}</div>
            <div style={{ position: "relative", display: "inline-block", ...en, fontWeight: T.weight.title, fontSize: p.wrong.size ?? 124, color: wc.text, marginTop: 10 }}>{p.wrong.value}<Strike f={f} at={tStamp} color={T.ink} /></div>
          </div>
          <div style={{ position: "absolute", right: -70, bottom: -34, ...slam(f, tStamp + 3, -6), transformOrigin: "50% 50%" }}><div style={{ ...zh, fontWeight: T.weight.title, fontSize: 46, color: wc.text, background: T.card, border: `6px solid ${wc.fill}`, borderRadius: 16, padding: "8px 22px" }}>{p.wrong.stamp}</div></div>
        </div>
      </Bb>,
    );
    // 對的：從上面掉下來，落地壓一下
    if (f >= tDrop) {
      const d = tween(f, tDrop, 8, EASE.exit), sq = f < land ? 1 : 0.9 + 0.1 * springAccent(f, land);
      const y = -500 + (rq.y + 500) * d + up, tSeal = cp.at(p.right.sealAt, land + 10);
      out.push(
        <Bb key="cp-right" m={[1, 0, 0, sq, rq.x, y + rq.h * (1 - sq)]} w={rq.w} h={rq.h} o={o}>
          <div style={{ ...face(rc.fill, rc.side, T.depth.tile, T.radius.tile), padding: "30px 44px" }}>
            <div style={{ ...zh, fontWeight: T.weight.strong, fontSize: 40, color: rc.on }}>{p.right.label}</div>
            <div style={{ ...en, fontWeight: T.weight.title, fontSize: p.right.size ?? 190, color: rc.on, marginTop: 14 }}>{p.right.value}</div>
          </div>
          {p.right.seal ? (
            <div style={{ position: "absolute", right: -34, top: -70, width: 196, height: 196, ...slam(f, tSeal, 12, 2.6) }}>
              <div style={{ width: "100%", height: "100%", boxSizing: "border-box", borderRadius: "50%", background: T.card, border: `8px solid ${rc.fill}`, outline: `4px solid ${T.card}`, boxShadow: T.depth.soft, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 2 }}>
                <Check size={74} color={rc.fill} />
                <div style={{ ...zh, fontWeight: T.weight.title, fontSize: 32, color: rc.text }}>{p.right.seal}</div>
              </div>
            </div>
          ) : null}
        </Bb>,
      );
      if (p.right.sub) out.push(<div key="cp-sub" style={{ position: "absolute", left: L.X, width: L.INNER_W, top: rq.y + rq.h + 40 + up, textAlign: "center", opacity: o }}><div style={{ display: "inline-block", ...bounce(f, land + 8) }}><Chip text={p.right.sub} bg={T.card} fg={T.ink2} px={30} side={T.cardSide} /></div></div>);
    }
  }
  // ── 所以換個問法：新聞紙沿虛線飛進螢幕 ──
  if (nx && f >= nxIn) {
    const p = nx.p, c = col("primary"), a0 = nxIn + 7, tMark = nx.at(p.mark?.at, a0), tStrike = nx.at(p.old?.strikeAt, a0);
    out.push(
      <div key="nx-title" style={{ position: "absolute", left: L.X, top: L.MAIN_TOP + 6, width: L.INNER_W, ...riseIn(f, a0) }}>
        <Chip text={p.kicker} bg={c.fill} fg={c.on} px={40} side={c.side} />
        <div style={{ ...zh, fontWeight: T.weight.title, fontSize: p.size ?? 176, color: T.ink, marginTop: 16, letterSpacing: "-0.01em" }}>{marked(p.title, p.mark?.text, f, tMark, c.soft, c.text)}</div>
        {p.old ? (
          <div style={{ display: "flex", alignItems: "center", gap: 16, marginTop: 14, opacity: tween(f, a0 + 6, 6) }}>
            <span style={{ ...zh, fontWeight: T.weight.body, fontSize: 30, color: T.ink3 }}>{p.old.label}</span>
            <span style={{ position: "relative", ...zh, fontWeight: T.weight.strong, fontSize: 44, color: T.ink2 }}>{p.old.text}<Strike f={f} at={tStrike} color={col("wrong").fill} h={8} /></span>
          </div>
        ) : null}
      </div>,
    );
    if (p.label && g < 1) {
      const q = newsAt(g), [sx, sy] = ap(cam, iso(q.x + (NEWS.w * q.k) / 2, q.y + (NEWS.h * q.k) / 2, q.z));
      out.push(<div key="nx-label" style={{ position: "absolute", left: sx, top: sy - 96, opacity: 1 - tween(f, arrive2 - 5, 4) }}><div style={{ transform: "translateX(-50%)" }}><div style={bounce(f, nxIn + 8)}><Chip text={p.label} bg={T.ink} fg={T.card} px={32} /></div></div></div>);
    }
    const chips = (p.chips ?? []) as string[], tChips = nx.at(p.chipsAt, tGo + 8), tones = ["right", "primary", "note"], tPulse = p.pulseAt ? nx.at(p.pulseAt, FAR) : FAR;
    out.push(
      <div key="nx-chips" style={{ position: "absolute", left: L.X, width: L.INNER_W, top: L.MAIN_BOTTOM - 96, display: "flex", justifyContent: "space-between" }}>
        {chips.map((t, i) => { const cc = col(tones[i % 3]); return (
          <div key={i} style={{ ...bounce(f, tChips + i * M.stagger) }}>
            <div style={{ transform: i === chips.length - 1 && f >= tPulse ? `scale(${pop(f, tPulse, 1.3).toFixed(4)})` : undefined, transformOrigin: "100% 50%", display: "flex", alignItems: "center", gap: 10, background: T.card, borderRadius: 24, padding: "16px 24px 16px 18px", boxShadow: `0 8px 0 ${cc.fill}, ${T.depth.soft}` }}>
              <div style={{ width: 44, height: 44, borderRadius: 14, background: cc.soft, display: "flex", alignItems: "center", justifyContent: "center", ...en, fontWeight: T.weight.title, fontSize: 30, color: cc.text }}>{i + 1}</div>
              <div style={{ ...zh, fontWeight: T.weight.title, fontSize: 44, color: T.ink }}>{t}</div>
            </div>
          </div>
        ); })}
      </div>,
    );
  }
  return (
    <>
      <World st={st} />
      {out}
    </>
  );
};

/** 放大鏡：從桌面飛到被標記的字上面，鏡片裡是放大的同一個字 */
export const Lens: React.FC<{ f: number; at: number; text: string; dx?: number; dy?: number }> = ({ f, at, text, dx: ox = 150, dy: oy = 8 }) => {
  if (f < at) return null;
  const t = tween(f, at, 12, EASE.move), c = col("wrong"), D = 232;
  const dx = ox + (1 - t) * -330, dy = oy + (1 - t) * -250 - 70 * Math.sin(Math.PI * t), k = 0.45 + 0.55 * t;
  return (
    <span style={{ position: "absolute", left: "50%", top: "50%", width: 0, height: 0, zIndex: 5, opacity: tween(f, at, 3) }}>
      <span style={{ position: "absolute", left: -D / 2, top: -D / 2, width: D, height: D, transform: `translate(${dx.toFixed(1)}px,${dy.toFixed(1)}px) scale(${k.toFixed(4)})` }}>
        <span style={{ position: "absolute", left: D * 0.78, top: D * 0.78, width: 112, height: 30, borderRadius: 15, background: T.solid.lav.r, transform: "rotate(45deg)", transformOrigin: "0 50%", boxShadow: `0 6px 0 ${T.cardSide}` }} />
        <span style={{ position: "absolute", inset: 0, boxSizing: "border-box", borderRadius: "50%", background: T.card, border: `14px solid ${T.solid.lav.r}`, boxShadow: T.depth.soft, display: "flex", alignItems: "center", justifyContent: "center", ...en, fontWeight: T.weight.title, fontSize: text.length > 5 ? Math.round(300 / text.length) : 62, color: c.text }}>{text}</span>
      </span>
    </span>
  );
};

export const Backdrop: React.FC = () => <AbsoluteFill style={{ background: `linear-gradient(180deg, ${T.bg} 0%, ${T.bg2} 100%)` }} />;
export const HeaderIso: React.FC<{ name: string; tag: string; right?: string; progress: number; logo?: boolean }> = ({ name, tag, right, progress, logo }) => (
  <>
    {/* 頻道 LOGO（script.json 頂層 channelLogo: "caffaine"）：固定左上、每幕同位置同大小；沒開的片照舊畫小牌子加標籤 */}
    {logo ? <CaffHeaderLogo /> : null}
    <div style={{ position: "absolute", left: L.X, right: L.X, top: L.HEADER_TOP, height: L.HEADER_H, display: "flex", alignItems: "center", justifyContent: logo ? "flex-end" : "space-between" }}>
      <div style={{ display: logo ? "none" : "flex", alignItems: "center", gap: 18 }}>
        <div style={{ width: 60, height: 54, borderRadius: 16, background: T.color.primary.fill, boxShadow: `0 6px 0 ${T.color.primary.side}`, display: "flex", alignItems: "center", justifyContent: "center", ...en, fontWeight: T.weight.strong, fontSize: 30, color: T.color.primary.on }}>{name}</div>
        <div style={{ ...zh, fontWeight: T.weight.strong, fontSize: 36, color: T.ink }}>{tag}</div>
      </div>
      {right ? <div style={{ ...zh, fontWeight: T.weight.body, fontSize: logo ? 30 : L.MIN_PX, color: T.ink3 }}>{right}</div> : null}
    </div>
    <div data-ov="進度條" style={{ position: "absolute", left: L.X, top: L.PROGRESS_TOP, width: L.INNER_W, height: 8, borderRadius: 8, background: T.line, overflow: "hidden" }}>
      <div style={{ width: `${(100 * progress).toFixed(2)}%`, height: 8, borderRadius: 8, background: T.color.primary.fill }} />
    </div>
  </>
);

export type Cap = { en: string; window: [number, number]; phrases: { text: string; start: number }[]; keywords: string[]; kw: Record<string, string> };
const enSplit = (s: string) => String(s ?? "").split("|").map((x) => x.trim()).filter(Boolean);
/** 字幕卡：一次一段中文大字（關鍵詞上色），下面一行英文跟著換 */
export const Caption: React.FC<{ cues: Cap[]; f: number }> = ({ cues, f }) => {
  const act = cues.filter((c) => c.phrases.length);
  if (!act.length) return null;
  const cue = [...act].reverse().find((c) => f >= c.window[0]) ?? act[0];
  const ps = cue.phrases, es = enSplit(cue.en);
  let k = 0; for (let i = 0; i < ps.length; i++) if (f >= ps[i].start) k = i;
  const enText = es.length > ps.length ? es.filter((_, i) => Math.floor((i * ps.length) / es.length) === k).join(" ") : es[Math.min(es.length - 1, Math.floor((k * es.length) / ps.length))];
  const text = ps[k].text, st = k === 0 ? cue.window[0] : ps[k].start;
  const parts: { t: string; c?: string }[] = [];
  let rest = text;
  while (rest) {
    const hit = cue.keywords.map((w) => ({ w, i: rest.indexOf(w) })).filter((x) => x.i >= 0).sort((x, y) => x.i - y.i)[0];
    if (!hit) { parts.push({ t: rest }); break; }
    if (hit.i > 0) parts.push({ t: rest.slice(0, hit.i) });
    parts.push({ t: hit.w, c: col(cue.kw[hit.w]).text });
    rest = rest.slice(hit.i + hit.w.length);
  }
  const p = st <= 0 ? 1 : tween(f, st, 5);
  return (
    <div data-ov="字幕卡" style={{ position: "absolute", left: L.X, top: L.CAP_TOP, width: L.INNER_W, height: L.CAP_H }}>
      <div style={{ ...face(), display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 18 }}>
        <div style={{ ...zh, fontWeight: T.weight.title, fontSize: L.CAP_ZH_PX, color: T.ink, opacity: 0.35 + 0.65 * p, transform: `translateY(${Math.round(12 * (1 - p))}px)` }}>{parts.map((x, i) => <span key={i} style={{ color: x.c }}>{x.t}</span>)}</div>
        <div style={{ ...en, fontWeight: 600, fontSize: L.CAP_EN_PX, color: T.ink2 }}>{enText}</div>
      </div>
    </div>
  );
};
export const SourceLine: React.FC<{ cues: { sources: string[]; window: [number, number] }[]; f: number }> = ({ cues, f }) => {
  const cur = cues.find((c) => c.sources?.length && f >= c.window[0] && f < c.window[1]);
  if (!cur) return null;
  const j = cur.sources.join("、");
  return <div data-ov="出處" style={{ position: "absolute", left: L.X, width: L.INNER_W, top: L.SRC_TOP, textAlign: "center", ...zh, fontWeight: T.weight.body, fontSize: L.SRC_PX, color: T.ink3 }}>{/^(資料)?來源/.test(j) ? j : `來源：${j}`}</div>;
};

const VideoIso1: React.FC<Script & { timeline: TimelineV2 }> = ({ scenes, timeline, channel }) => {
  const f = useCurrentFrame();
  const panels = useMemo(() => buildIso(scenes, timeline), [scenes, timeline]);
  const by = Object.fromEntries(timeline.scenes.map((x) => [x.id, x]));
  const ordered = scenes.filter((s) => by[s.id]);
  const caps: Cap[] = ordered.filter((s) => by[s.id].subtitleWindow).map((s) => ({ en: s.subtitle.en, window: by[s.id].subtitleWindow as [number, number], phrases: by[s.id].lines.map((l) => ({ ...l, text: l.text.replace(/[，、；：。]+$/, "") })), keywords: s.keywords ?? [], kw: ((s.props as any)?.kw ?? {}) as Record<string, string> }));
  const srcs = ordered.map((s) => ({ sources: s.sources, window: by[s.id].sourceWindow }));
  return (
    <AbsoluteFill style={{ background: T.bg }}>
      <Backdrop />
      <Stage panels={panels} f={f} />
      <HeaderIso name={channel?.name ?? "AI"} tag={channel?.tag ?? "AI 動手做"} right={channel?.slogan} progress={Math.min(1, f / Math.max(1, timeline.totalFrames - 1))} />
      <Caption cues={caps} f={f} />
      <SourceLine cues={srcs} f={f} />
      {timeline.voice ? <Audio src={staticFile(timeline.voice.file)} /> : timeline.scenes.filter((t) => t.audio).map((t) => (
        <Sequence key={`${t.id}-audio`} from={t.audioFrame} durationInFrames={Math.ceil(t.audioSec * FPS) + 1} name={`${t.id}-audio`} layout="none"><Audio src={staticFile(t.audio as string)} /></Sequence>
      ))}
    </AbsoluteFill>
  );
};

/** 封面：鉤子那一鏡的落定畫面（大字＋桌面＋兩個數字） */
const CoverIso1: React.FC<Script & { coverCrop?: number }> = ({ scenes, channel, coverCrop }) => {
  const p = (scenes[0]?.props ?? {}) as Record<string, any>;
  const shift = coverCrop ? (L.H - coverCrop) / 2 - 150 : 0;
  const panel: Panel = { kind: "hook", sid: "cover", in: 0, out: 1e9, p, at: () => 0 };
  return (
    <AbsoluteFill style={{ background: T.bg }}>
      <Backdrop />
      <Stage panels={[panel]} f={9999} />
      <div style={{ position: "absolute", inset: 0, transform: `translateY(${shift}px)` }}><HeaderIso name={channel?.name ?? "AI"} tag={channel?.tag ?? "AI 動手做"} right={channel?.slogan} progress={0} /></div>
    </AbsoluteFill>
  );
};

/** isoVersion: 2＝完整片引擎（IsoFilm.tsx：同一張桌面演完 20 鏡）；3＝短片引擎（IsoShort.tsx：每鏡不同構圖、物件會動）；沒寫的照舊是 5 鏡試片 */
export const VideoIso: React.FC<Script & { timeline: TimelineV2 }> = (props) => ((props as any).isoVersion === 2 ? <FilmIso {...props} /> : (props as any).isoVersion === 5 ? <MeetingIso {...props} /> : (props as any).isoVersion === 4 ? <AgentIso {...props} /> : (props as any).isoVersion === 3 ? <ShortIso {...props} /> : <VideoIso1 {...props} />);
export const CoverIso: React.FC<Script & { coverCrop?: number }> = (props) => ((props as any).isoVersion === 2 ? <CoverFilm {...props} /> : (props as any).isoVersion === 5 ? <CoverMeeting {...props} /> : (props as any).isoVersion === 4 ? <CoverAgent {...props} /> : (props as any).isoVersion === 3 ? <CoverShort {...props} /> : <CoverIso1 {...props} />);

// 等距 2.5D 短片引擎（script.json 頂層 stage: "iso" ＋ isoVersion: 3）：和 5 鏡試片（IsoVideo.tsx）同一張桌面、同一套色票，
// 但每一鏡有自己的構圖（推近桌面→鍵盤特寫→跟拍卡片→螢幕特寫→拉遠全景→新聞紙特寫→跟拍→全景），鏡頭 ease-in-out、可以微微轉一點角度；
// 物件會動（按鍵下沉、游標、進度條、放大鏡掃過、新聞紙翻頁、數字翻牌、落地回彈、蓋章震動、被彈飛、發光一下），沒事件的時候也有呼吸與光點。
// 只用 SVG 與 CSS 2D 矩陣。顏色、厚度讀 THEME_ISO；時間全部由 engine 的 at() 從 cue 換算（元件不手填秒數）。
// 2026/11/14 為 videos/short-ai/ 新增（使用者：「動畫不夠豐富，同樣風格但變化可以多點」）；沒寫 isoVersion: 3 的片不會走到這裡。
import React, { useMemo } from "react";
import { AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame } from "remotion";
import type { Script, TimelineV2 } from "../../types";
import { FONT_EN, FONT_ZH, FPS, LAYOUT_ISO as L, THEME_ISO as T } from "../../theme";
import { EASE, pop, springAccent, tween, typeChars } from "../anim";
import { buildIso, type Panel } from "./engine";
import { ap, at2, Backdrop, Bb, bounce, Box, Caption, type Cap, Check, Chip, col, css, face, fly, ground, HeaderIso, iso, type M6, MON, mul, popM, SCR, SCR_H, SCR_W, Shade, Slab, slam, SourceLine, Strike } from "./IsoVideo";

const M = T.motion;
const zh: React.CSSProperties = { fontFamily: FONT_ZH, whiteSpace: "nowrap", lineHeight: 1.16 };
const en: React.CSSProperties = { fontFamily: FONT_EN, whiteSpace: "nowrap", lineHeight: 1 };
const FAR = 1e9;
/** 0→1，ease-in-out */
const eio = (f: number, at: number, dur: number) => tween(f, at, dur, EASE.move);
/** 一下就過去的脈衝：at 之後 dur 幀內 1→0 */
const fade = (f: number, at: number, dur: number) => (f < at ? 0 : 1 - tween(f, at, dur, EASE.enter));
/** 固定 seed 的雜湊（0–1） */
const hash = (n: number) => { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };

// ───────── 鏡頭：每個關鍵格可寫 dur（幀）與 rot（度）；全部 ease-in-out；另有震動與呼吸 ─────────
type Key = { frame: number; dur: number; look: [number, number, number]; zoom: number; sy: number; rot: number };
const camKeys = (panels: Panel[]): Key[] => panels.flatMap((x) => ([] as any[]).concat(x.p.camera ?? []).map((c, i) => ({ frame: i === 0 && !c.at ? x.in : x.at(c.at, x.in), dur: c.dur ?? M.cam, look: c.look, zoom: c.zoom, sy: c.sy, rot: c.rot ?? 0 }))).sort((a, b) => a.frame - b.frame);
const camAt = (keys: Key[], f: number, shakes: number[]): M6 => {
  if (!keys.length) return at2(L.W / 2, 900, 0.6);
  let [lx, ly] = iso(...keys[0].look), s = keys[0].zoom, sy = keys[0].sy, rot = keys[0].rot;
  for (const k of keys.slice(1)) {
    const t = eio(f, k.frame, k.dur), [tx, ty] = iso(...k.look);
    lx += (tx - lx) * t; ly += (ty - ly) * t; s += (k.zoom - s) * t; sy += (k.sy - sy) * t; rot += (k.rot - rot) * t;
  }
  // 呼吸：很小的漂移，沒有事件時畫面也不是死的
  s *= 1 + 0.006 * Math.sin(f / 23); sy += 3 * Math.sin(f / 19);
  let dx = 2.5 * Math.sin(f / 27), dy = 0;
  for (const a of shakes) if (f >= a && f < a + 9) { const d = 1 - (f - a) / 9; dx += 11 * d * Math.sin((f - a) * 2.4); dy += 9 * d * Math.cos((f - a) * 3.1); }
  const r = (rot * Math.PI) / 180, c = Math.cos(r), n = Math.sin(r);
  const base: M6 = [s, 0, 0, s, -s * lx, -s * ly];
  return mul([c, n, -n, c, L.W / 2 + dx, sy + dy], base);
};

// ───────── 桌上的東西 ─────────
const DESK = 640;
const NEWS = { x: 396, y: 56, w: 210, h: 150 };
const LENS = { x: 340, y: 500 };
const KB = { x: 210, y: 200, w: 96, h: 260 };
type Mode = "num" | "chat" | "think" | "doc" | "ok";
type St = {
  f: number; cam: M6; mode: Mode; modeAt: number; flash: number; num?: { label: string; value: string; size?: number }; numStrike: number;
  keyDown: number; enter: number; ripple: number; typed: number; lensOnDesk: boolean; sheet: number;
  news: { x: number; y: number; z: number; k: number; o: number; flip: number }; trail: string | null; teaser: number; think: number;
};

const Screen: React.FC<{ st: St }> = ({ st }) => {
  const { mode, f, flash, modeAt } = st, S = T.screen, a = f - modeAt;
  const inn = tween(f, modeAt, 6);
  return (
    <g transform={css(SCR)}>
      <rect x={14} y={14} width={SCR_W - 28} height={SCR_H - 28} rx={20} fill={S.face} />
      {/* 螢幕上緣一條慢慢掃過的光 */}
      <rect x={14 + ((f * 3) % (SCR_W + 120)) - 120} y={14} width={90} height={SCR_H - 28} fill={S.glow} opacity={0.16} clipPath="url(#isoScrClip)" />
      {mode === "num" && st.num ? (
        <>
          <text x={38} y={100} fontFamily={FONT_ZH} fontWeight={T.weight.title} fontSize={62} fill={S.on}>{st.num.label}</text>
          <text x={36} y={216} fontFamily={FONT_EN} fontWeight={T.weight.title} fontSize={st.num.size ?? 116} fill={S.on} opacity={1 - 0.45 * st.numStrike}>{st.num.value}</text>
          {st.numStrike > 0 ? <rect x={30} y={172} width={(SCR_W - 70) * st.numStrike} height={14} rx={7} fill={T.color.wrong.fill} /> : null}
          {Math.floor(f / 8) % 2 === 0 ? <rect x={SCR_W - 62} y={150} width={14} height={66} rx={5} fill={S.on} /> : null}
        </>
      ) : null}
      {mode === "chat" ? (
        <g opacity={inn}>
          {/* 四角星會慢慢轉、呼吸 */}
          <g transform={`translate(112 110) rotate(${(a * 2.2).toFixed(1)}) scale(${(0.95 + 0.12 * Math.sin(a / 5)).toFixed(3)})`}><path d="M0 50 C0 12 -12 0 -50 0 C-12 0 0 -12 0 -50 C0 -12 12 0 50 0 C12 0 0 12 0 50 Z" fill={S.on} /></g>
          <text x={186} y={146} fontFamily={FONT_EN} fontWeight={T.weight.title} fontSize={104} fill={S.on}>AI</text>
          {/* 輸入列：打字時橫條跟著長，後面游標閃 */}
          <rect x={36} y={196} width={SCR_W - 72} height={44} rx={22} fill={S.bar} opacity={0.55} />
          <rect x={52} y={210} width={Math.max(0, 250 * st.typed)} height={16} rx={8} fill={S.on} />
          {Math.floor(f / 7) % 2 === 0 ? <rect x={58 + 250 * st.typed} y={204} width={8} height={28} rx={4} fill={S.on} /> : null}
        </g>
      ) : null}
      {mode === "think" ? (
        <>
          {[0, 1, 2].map((i) => <circle key={i} cx={150 + i * 60} cy={118 - 18 * Math.max(0, Math.sin((f - i * 3) / 2.2))} r={18} fill={S.on} />)}
          <rect x={60} y={186} width={SCR_W - 120} height={18} rx={9} fill={S.bar} opacity={0.6} />
          <rect x={60} y={186} width={(SCR_W - 120) * st.think} height={18} rx={9} fill={S.on} />
        </>
      ) : null}
      {mode === "doc" ? [300, 250, 320, 180].map((w, i) => <rect key={i} x={46} y={54 + i * 46} width={w * tween(f, modeAt + i * 3, 8)} height={22} rx={11} fill={i === 0 ? S.on : S.bar} />) : null}
      {mode === "ok" ? (
        <g transform={`translate(210 135) scale(${pop(f, modeAt, 0.5).toFixed(3)})`}>
          <circle r={78 + 26 * fade(f, modeAt, 14)} fill={S.on} opacity={0.35} />
          <circle r={78} fill={S.on} />
          <path d="M-38 1 L-10 29 L40 -27" fill="none" stroke={T.color.right.fill} strokeWidth={22} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={130} strokeDashoffset={130 * (1 - tween(f, modeAt + 2, 8))} />
        </g>
      ) : null}
      {flash > 0 ? <rect x={14} y={14} width={SCR_W - 28} height={SCR_H - 28} rx={20} fill={T.card} opacity={flash} /> : null}
    </g>
  );
};

const World: React.FC<{ st: St }> = ({ st }) => {
  const S = T.solid, n = st.news, f = st.f;
  const sway = 4 * Math.sin(f / 11);
  return (
    <svg width={L.W} height={L.H} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
      <defs>
        {/* 地面圓點：跟著鏡頭，另外自己慢慢漂 */}
        <pattern id="isoDots3" width={80} height={80} patternUnits="userSpaceOnUse" patternTransform={css(mul(st.cam, ground((f * 0.5) % 80, (f * 0.25) % 80, -60)))}><circle cx={10} cy={10} r={5} fill={T.dot} /></pattern>
        <clipPath id="isoScrClip"><rect x={14} y={14} width={SCR_W - 28} height={SCR_H - 28} rx={20} /></clipPath>
      </defs>
      <rect x={0} y={L.HEADER_TOP + 90} width={L.W} height={L.CAP_TOP - L.HEADER_TOP - 90} fill="url(#isoDots3)" />
      <g transform={css(st.cam)}>
        <Shade x={50} y={50} w={DESK} h={DESK} r={56} z={-110} />
        <Slab id="isoDesk3" x={0} y={0} w={DESK} h={DESK} t={40} r={48} c={S.desk} />
        {/* Enter 之後桌面上擴散一圈 */}
        {st.ripple > 0 && st.ripple < 1 ? <g transform={css(ground(258, 430, 1))}><circle r={30 + 190 * st.ripple} fill="none" stroke={T.color.primary.fill} strokeWidth={10 * (1 - st.ripple)} opacity={1 - st.ripple} /></g> : null}
        <Shade x={MON.x} y={MON.y} w={190} h={MON.dy} />
        <Slab id="isoBase3" x={44} y={250} z={10} w={120} h={120} t={10} r={16} c={S.white} />
        <Box x={68} y={296} z={10} dx={14} dy={28} dz={40} c={S.white} />
        <Box {...MON} c={S.white} />
        <Screen st={st} />
        {/* 盆栽：葉子輕輕晃 */}
        <Shade x={540} y={300} w={86} h={56} />
        <Box x={540} y={300} dx={56} dy={56} dz={50} c={S.mint} />
        {[[-16, -64, -24], [14, -70, 16], [0, -92, 0]].map(([dx, dy, rot], i) => { const [px, py] = iso(568, 328, 50); return <ellipse key={i} cx={px + dx} cy={py + dy + 30} rx={15} ry={34} transform={`rotate(${rot + sway * (i === 2 ? 1 : 0.6)} ${px + dx} ${py + 30})`} fill={i === 2 ? S.mint.l : S.mint.r} />; })}
        {/* 鍵盤：打字時按鍵一顆一顆下沉 */}
        <Shade x={KB.x + 6} y={KB.y + 6} w={KB.w + 8} h={KB.h} />
        <Slab id="isoKb3" x={KB.x} y={KB.y} z={12} w={KB.w} h={KB.h} t={12} r={12} c={S.lav}>
          {Array.from({ length: 21 }, (_, i) => {
            const down = i === 20 ? st.enter : i === st.keyDown ? 1 : 0, d = 5 * down;
            return <rect key={i} x={10 + (i % 3) * 27 + d} y={12 + Math.floor(i / 3) * 34 + d} width={21} height={26} rx={5} fill={i === 20 && st.enter > 0 ? T.color.primary.fill : down ? T.color.primary.soft : T.card} opacity={down ? 1 : 0.82} />;
          })}
        </Slab>
        <Slab id="isoNote3" x={420} y={400} z={5} w={120} h={120} t={5} r={6} c={S.yellow}><rect x={16} y={24} width={70} height={10} rx={5} fill={S.yellow.r} /><rect x={16} y={48} width={50} height={10} rx={5} fill={S.yellow.r} /></Slab>
        <Shade x={156} y={556} w={150} h={18} r={6} />
        <Box x={150} y={548} dx={150} dy={14} dz={12} c={S.coral} />
        {/* 回答紙落回桌上（落地壓一下） */}
        {st.sheet > 0 ? <Slab id="isoSheet3" x={350} y={236} z={5 + 26 * (1 - st.sheet)} w={170} h={120} t={5} r={8} c={S.white}>{[110, 130, 90].map((w, i) => <rect key={i} x={18} y={22 + i * 28} width={w} height={12} rx={6} fill={i === 0 ? T.color.wrong.fill : T.cardSide} />)}</Slab> : null}
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
        {/* 下一招：桌角一張蓋著的卡，最後跳起來 */}
        {st.teaser > 0 ? <g opacity={Math.min(1, st.teaser * 3)}><Shade x={436} y={516} w={130} h={90} a={T.shadowAlpha * (1 - 0.4 * st.teaser)} /><Slab id="isoTease3" x={430} y={510} z={6 + 46 * Math.sin(Math.PI * Math.min(1, st.teaser))} w={130} h={90} t={8} r={12} c={S.plum}><rect x={20} y={20} width={90} height={50} rx={10} fill={S.plum.r} opacity={0.5} /></Slab></g> : null}
        {/* 新聞紙：第一頁翻開 → 飛起來在桌上留影子 → 沿虛線飛進螢幕 */}
        {st.trail ? <polyline points={st.trail} fill="none" stroke={T.color.primary.fill} strokeWidth={6} strokeDasharray="4 16" strokeLinecap="round" /> : null}
        {n.o > 0 ? (
          <g opacity={n.o}>
            <Shade x={n.x + 6 + n.z * 0.3} y={n.y + 6 + n.z * 0.3} w={NEWS.w * n.k} h={NEWS.h * n.k} a={T.shadowAlpha * (n.z > 20 ? 0.6 : 1)} />
            <g transform={`translate(${iso(n.x, n.y, n.z).join(" ")}) scale(${n.k})`}>
              <Slab id="isoNews3" x={0} y={0} w={NEWS.w} h={NEWS.h} t={6} r={8} c={S.white}>
                <rect x={14} y={14} width={64} height={24} rx={6} fill={T.color.wrong.fill} />
                <rect x={14} y={50} width={150} height={16} rx={6} fill={T.ink} />
                <rect x={8} y={74} width={126} height={66} rx={8} fill={T.color.primary.soft} opacity={n.flip} />
                {[0, 1, 2].map((i) => <rect key={i} x={14} y={80 + i * 20} width={i === 2 ? 70 : 110} height={9} rx={4.5} fill={n.flip > 0.5 ? T.color.primary.fill : T.cardSide} />)}
                <rect x={140} y={78} width={54} height={54} rx={8} fill={S.mint.top} />
              </Slab>
              {/* 翻過去的那一頁：以左邊為軸變窄、抬高，再不見 */}
              {n.flip > 0 && n.flip < 1 ? (() => { const c = Math.cos(Math.PI * n.flip), g = ground(c < 0 ? NEWS.w * c : 0, 0, 6 + 70 * Math.sin(Math.PI * n.flip)); return <rect width={NEWS.w * Math.abs(c)} height={NEWS.h} rx={8} transform={css(g)} fill={c < 0 ? S.white.l : T.card} stroke={T.cardSide} strokeWidth={2} />; })() : null}
            </g>
          </g>
        ) : null}
      </g>
    </svg>
  );
};

// ───────── 小零件 ─────────
/** 螢光標記：色塊從左抹過去，抹完外面再閃一圈色塊（強調不只變色） */
const Hi: React.FC<{ f: number; at: number; bg: string; fg?: string; ring?: string; children: React.ReactNode; style?: React.CSSProperties }> = ({ f, at, bg, fg, ring, children, style }) => {
  const p = eio(f, at, M.mark), g = fade(f, at + M.mark - 2, 12);
  return <span style={{ color: p > 0.5 ? fg : undefined, backgroundImage: `linear-gradient(${bg},${bg})`, backgroundRepeat: "no-repeat", backgroundSize: `${(100 * p).toFixed(1)}% 84%`, backgroundPosition: "0 60%", borderRadius: T.radius.mark, padding: "0 0.08em", boxShadow: g > 0 && f >= at + M.mark - 2 ? `0 0 0 ${Math.round(22 * (1 - g))}px ${ring ?? bg}${Math.round(200 * g).toString(16).padStart(2, "0")}` : undefined, ...style }}>{children}</span>;
};
const hi = (text: string, target: string | undefined, f: number, at: number, bg: string, fg?: string, ring?: string) => {
  const i = target ? text.indexOf(target) : -1;
  if (i < 0 || !target) return text;
  return <>{text.slice(0, i)}<Hi f={f} at={at} bg={bg} fg={fg} ring={ring}>{target}</Hi>{text.slice(i + target.length)}</>;
};
/** 放射短線：蓋章、落地、發光那一下 */
const Burst: React.FC<{ x: number; y: number; f: number; at: number; color: string; n?: number; r0?: number; r1?: number; w?: number; dur?: number }> = ({ x, y, f, at, color, n = 10, r0 = 60, r1 = 190, w = 10, dur = 12 }) => {
  if (f < at || f > at + dur) return null;
  const t = tween(f, at, dur), a = r0 + (r1 - r0) * t, b = a + 46 * (1 - t);
  return (
    <svg width={L.W} height={L.H} style={{ position: "absolute", left: 0, top: 0, pointerEvents: "none", opacity: 1 - t * t }}>
      {Array.from({ length: n }).map((_, i) => { const q = (i / n) * Math.PI * 2 + 0.3; return <line key={i} x1={x + a * Math.cos(q)} y1={y + a * Math.sin(q)} x2={x + b * Math.cos(q)} y2={y + b * Math.sin(q)} stroke={color} strokeWidth={w} strokeLinecap="round" />; })}
    </svg>
  );
};
/** 往外擴散的圈（發光一下） */
const Ring: React.FC<{ x: number; y: number; f: number; at: number; color: string; r0?: number; r1?: number; dur?: number }> = ({ x, y, f, at, color, r0 = 80, r1 = 420, dur = 16 }) => {
  if (f < at || f > at + dur) return null;
  const t = tween(f, at, dur), r = r0 + (r1 - r0) * t;
  return <div style={{ position: "absolute", left: x - r, top: y - r, width: r * 2, height: r * 2, boxSizing: "border-box", borderRadius: "50%", border: `${Math.max(1, 26 * (1 - t))}px solid ${color}`, opacity: 0.7 * (1 - t) }} />;
};
/** 數字翻牌：until 之前每 2 幀換一次亂數，從左到右一位一位停下來 */
const roll = (value: string, f: number, from: number, until: number) => {
  const digits = [...value].filter((c) => /\d/.test(c)).length;
  let k = 0;
  return [...value].map((c) => {
    if (!/\d/.test(c)) return c;
    const stop = until - (digits - 1 - k) * 3; k++;
    return f >= stop || f < from ? c : String(Math.floor(hash(k * 13 + Math.floor(f / 2) * 7) * 10));
  }).join("");
};
/** 前景漂浮的小東西（視差：比桌面動得多一點），只在主畫面區 */
const Floaters: React.FC<{ f: number; cam: M6 }> = ({ f, cam }) => {
  const items = [[-520, -80, "plus", "primary"], [520, 40, "dot", "note"], [-430, 520, "dot", "right"], [470, 560, "plus", "wrong"], [40, -230, "spark", "note"], [-260, 700, "spark", "primary"]] as const;
  return (
    <div style={{ position: "absolute", left: 0, top: L.MAIN_TOP, width: L.W, height: L.MAIN_BOTTOM - L.MAIN_TOP, overflow: "hidden", pointerEvents: "none" }}>
      {items.map(([x, y, kind, c], i) => {
        const px = cam[4] + (cam[4] - L.W / 2) * 0.25 + cam[0] * x * 1.2 + 14 * Math.sin(f / 17 + i * 2), py = cam[5] + cam[3] * y * 1.2 + 18 * Math.sin(f / 13 + i) - L.MAIN_TOP;
        const cc = col(c), s = 30 + 8 * (i % 3), tw = 0.55 + 0.35 * Math.sin(f / 9 + i * 1.7);
        return (
          <div key={i} style={{ position: "absolute", left: px, top: py, width: s, height: s, opacity: tw, transform: `rotate(${(f * (i % 2 ? 1.2 : -0.9) + i * 40).toFixed(1)}deg)` }}>
            {kind === "dot" ? <div style={{ width: "100%", height: "100%", borderRadius: "50%", background: cc.fill }} /> : kind === "plus" ? (
              <><div style={{ position: "absolute", left: "38%", top: 0, width: "24%", height: "100%", borderRadius: 6, background: cc.fill }} /><div style={{ position: "absolute", top: "38%", left: 0, height: "24%", width: "100%", borderRadius: 6, background: cc.fill }} /></>
            ) : <svg viewBox="-50 -50 100 100" width={s} height={s}><path d="M0 50 C0 12 -12 0 -50 0 C-12 0 0 -12 0 -50 C0 -12 12 0 50 0 C12 0 0 12 0 50 Z" fill={cc.fill} /></svg>}
          </div>
        );
      })}
    </div>
  );
};
/** 背景兩團慢慢移動的光暈 */
const Glow: React.FC<{ f: number }> = ({ f }) => (
  <AbsoluteFill style={{ pointerEvents: "none" }}>
    {[[260, 700, T.color.primary.soft, 31], [820, 1000, T.color.note.soft, 43]].map(([x, y, c, p], i) => (
      <div key={i} style={{ position: "absolute", left: (x as number) + 90 * Math.sin(f / (p as number) + i) - 330, top: (y as number) + 70 * Math.cos(f / (p as number)) - 330, width: 660, height: 660, borderRadius: "50%", background: `radial-gradient(closest-side, ${c}, ${c}00)`, opacity: 0.85 }} />
    ))}
  </AbsoluteFill>
);

/** 放大鏡：從桌面飛上來 → 先掃過上面那一行 → 停在被標記的字旁邊，停住後輕輕浮動 */
const Lens3: React.FC<{ f: number; from: number; at: number; text: string; dx: number; dy: number }> = ({ f, from, at, text, dx: ox, dy: oy }) => {
  if (f < from) return null;
  const c = col("wrong"), D = 232, mid = from + (at - from) * 0.45;
  const a = eio(f, from, mid - from), b = eio(f, mid, at - mid);
  const P0 = [-140, 420], P1 = [-330, -150], P2 = [ox, oy];
  const x = P0[0] + (P1[0] - P0[0]) * a + (P2[0] - P1[0]) * b, y = P0[1] + (P1[1] - P0[1]) * a + (P2[1] - P1[1]) * b - 60 * Math.sin(Math.PI * a) + (f > at ? 7 * Math.sin((f - at) / 7) : 0);
  const k = (0.5 + 0.5 * a) * (f >= at ? pop(f, at, 0.86) : 1), found = f >= at - 1;
  return (
    <span style={{ position: "absolute", left: "50%", top: "50%", width: 0, height: 0, zIndex: 5, opacity: tween(f, from, 3) }}>
      <span style={{ position: "absolute", left: -D / 2, top: -D / 2, width: D, height: D, transform: `translate(${x.toFixed(1)}px,${y.toFixed(1)}px) scale(${k.toFixed(4)}) rotate(${(-10 * (1 - b)).toFixed(1)}deg)` }}>
        <span style={{ position: "absolute", left: D * 0.78, top: D * 0.78, width: 112, height: 30, borderRadius: 15, background: T.solid.lav.r, transform: "rotate(45deg)", transformOrigin: "0 50%", boxShadow: `0 6px 0 ${T.cardSide}` }} />
        <span style={{ position: "absolute", inset: 0, boxSizing: "border-box", borderRadius: "50%", background: found ? T.card : `${T.card}B0`, border: `14px solid ${T.solid.lav.r}`, boxShadow: T.depth.soft, display: "flex", alignItems: "center", justifyContent: "center", ...en, fontWeight: T.weight.title, fontSize: text.length > 5 ? Math.round(300 / text.length) : 62, color: c.text }}>{found ? text : ""}</span>
      </span>
    </span>
  );
};

const POS = {
  pin: { x: 676, y: 790, w: 340, h: 196 },
  ask: { x: L.X, y: 950, w: L.INNER_W, h: 274 }, note: { x: 600, y: 596, w: 416, h: 176 },
  ans: { x: L.X, y: 716, w: L.INNER_W, h: 520 },
  wrong: { x: 330, y: 436, w: 420, h: 250, toX: 60, toY: 792, toK: 0.56 }, right: { x: 190, y: 432, w: 700, h: 336 },
  res: { x: L.X, y: 964, w: L.INNER_W, h: 262 }, tease: { x: 600, y: 742, w: 416, h: 214 },
} as const;

const Stage: React.FC<{ panels: Panel[]; f: number }> = ({ panels, f }) => {
  const P = Object.fromEntries(panels.map((x) => [x.kind, x])) as Record<string, Panel | undefined>;
  const hk = P.hook, ak = P.ask, an = P.answer, cp = P.compare, nx = P.next;
  // 各段的關鍵時刻（全部從 cue 來）
  const askIn = ak?.in ?? FAR, tType = ak ? ak.at(ak.p.typeAt, askIn) : FAR, tSend = ak ? ak.at(ak.p.sendAt, FAR) : FAR, arrive = tSend + M.fly;
  const ansIn = an?.in ?? FAR, tOut = an ? an.at(an.p.outAt, ansIn) : FAR, settled = tOut + M.fly;
  const tLens = an ? an.at(an.p.lens?.at, FAR) : FAR, tLensFrom = an ? Math.max(settled - 4, tLens - 22) : FAR;
  const cpIn = cp?.in ?? FAR, tStamp = cp ? cp.at(cp.p.wrong?.stampAt, cpIn + 10) : FAR, tDrop = cp ? cp.at(cp.p.right?.at, cpIn + 30) : FAR, land = tDrop + 8;
  const tNow = cp ? cp.at(cp.p.right?.landAt, land + 14) : FAR, tSeal = cp ? cp.at(cp.p.right?.sealAt, tNow + 10) : FAR;
  const nxIn = nx?.in ?? FAR, tFlip = nx ? nx.at(nx.p.flipAt, nxIn + 6) : FAR, tGo = nx ? nx.at(nx.p.flyAt, nxIn + 20) : FAR, arrive2 = tGo + 20;
  const tRes = nx ? nx.at(nx.p.result?.at, arrive2 + 4) : FAR, tTease = nx ? nx.at(nx.p.teaser?.at, FAR) : FAR;
  const tHkStamp = hk ? hk.at(hk.p.stamp?.at, 10) : FAR, tBump = hk ? hk.at(hk.p.pin?.bumpAt, FAR) : FAR;

  const keys = useMemo(() => camKeys(panels), [panels]);
  const shakes = [tHkStamp + M.slam - 1, tStamp + 3 + M.slam - 1, land, tSeal + M.slam - 1].filter((t) => t < FAR / 2);
  const cam = camAt(keys, f, shakes);
  const scrCard = (w: number) => mul(cam, mul(SCR, at2(0, 40, SCR_W / w)));

  // 世界狀態
  const modes: [number, Mode][] = [[-1, "num"], [askIn + 4, "chat"], [arrive, "think"], [tOut, "doc"], [arrive2, "ok"]];
  const cur = [...modes].reverse().find(([t]) => f >= t) ?? modes[0];
  const flashAt = [arrive, tOut, arrive2].filter((t) => f >= t).pop();
  const lines = (ak?.p.lines ?? []) as string[], total = lines.join("").length, shown = ak ? typeChars(f, tType, total, ak?.p.step ?? M.step) : 0;
  const typing = ak && f >= tType && shown < total;
  const g = eio(f, tGo, 20), hover = nx ? 30 * tween(f, tFlip + 10, 10) + (f > tFlip + 20 && g === 0 ? 5 * Math.sin(f / 6) : 0) : 0;
  const newsAt = (t: number) => ({ x: NEWS.x + (120 - NEWS.x) * t, y: NEWS.y + (230 - NEWS.y) * t, z: 6 + hover + (150 - 6 - hover) * t + 90 * Math.sin(Math.PI * t), k: 1 - 0.45 * t });
  const trail = g > 0 && g < 1 ? Array.from({ length: Math.max(2, Math.round(g * 20)) }).map((_, i, a) => { const q = newsAt((g * i) / (a.length - 1)); return iso(q.x + (NEWS.w * q.k) / 2, q.y + (NEWS.h * q.k) / 2, q.z).map((v) => v.toFixed(1)).join(","); }).join(" ") : null;
  const st: St = {
    f, cam, mode: cur[1], modeAt: cur[0], flash: flashAt === undefined ? 0 : 0.9 * fade(f, flashAt, 10), num: hk?.p.screen, numStrike: eio(f, tBump, 8),
    keyDown: typing && f % 2 === 0 ? Math.floor(hash(shown + 3) * 20) : -1, enter: f >= tSend - 3 && f < tSend + 6 ? 1 : 0, ripple: tSend < FAR / 2 ? tween(f, tSend, 16) : 0, typed: total ? shown / total : 0,
    lensOnDesk: !an || f < tLensFrom, sheet: cp ? tween(f, cpIn + M.fly - 2, 6) : 0, think: tween(f, arrive, Math.max(4, tOut - arrive)),
    news: { ...newsAt(g), o: 1 - tween(f, arrive2 - 3, 3), flip: nx ? eio(f, tFlip, 14) : 0 }, trail, teaser: tTease < FAR / 2 ? tween(f, tTease - 8, 14) : 0,
  };

  const out: React.ReactNode[] = [];
  // ── 鉤子：第 0 幀就是完整主張＋兩個數字；蓋章（震一下）→ 螢光抹過去 → 數字卡跳一下、螢幕上的舊數字被劃掉 ──
  if (hk && f < askIn + 14) {
    const p = hk.p, size = p.size ?? 128, title = p.title as string[];
    out.push(
      <div key="hk-title" style={{ position: "absolute", left: L.X, top: L.MAIN_TOP + 6, width: L.INNER_W }}>
        <div style={{ opacity: 1 - tween(f, askIn, 6), transform: `translateY(${-40 * eio(f, askIn, 8)}px)` }}><Chip text={p.kicker} bg={T.card} fg={T.ink2} side={T.cardSide} /></div>
        {/* 退場：兩行一前一後往左滑出去（被下一鏡的桌面帶走） */}
        <div style={{ marginTop: 22 }}>{title.map((t, i) => { const e = tween(f, askIn + i * 3, 9, EASE.exit); return <div key={i} style={{ ...zh, fontWeight: T.weight.title, fontSize: size, color: T.ink, letterSpacing: "-0.01em", opacity: 1 - e, transform: `translateX(${Math.round(-520 * e)}px)` }}>{hi(t, p.mark?.text, f, hk.at(p.mark?.at, 0), col(p.mark?.color).soft, col(p.mark?.color).text, col(p.mark?.color).fill)}</div>; })}</div>
      </div>,
    );
    const o = 1 - tween(f, askIn, 6);
    if (p.stamp) {
      const [sx, sy] = ap(cam, iso(MON.x + MON.dx, MON.y + 150, MON.z + 70)), c = col("wrong");
      out.push(<div key="hk-stamp" style={{ position: "absolute", left: sx + 10, top: sy + 64, opacity: o }}><div style={slam(f, tHkStamp, -7, 2.6)}><div style={{ ...zh, fontWeight: T.weight.title, fontSize: 46, color: c.text, background: T.card, border: `6px solid ${c.fill}`, borderRadius: 16, padding: "8px 22px", boxShadow: T.depth.soft }}>{p.stamp.text}</div></div></div>);
      out.push(<Burst key="hk-burst" x={sx + 120} y={sy + 100} f={f} at={tHkStamp + M.slam - 1} color={c.fill} n={9} r0={110} r1={210} />);
    }
    if (p.pin) {
      const c = col("right"), q = POS.pin, k = f >= tBump ? pop(f, tBump, 0.82) : 1, e = tween(f, askIn, 10, EASE.exit);
      out.push(<Ring key="hk-ring" x={q.x + q.w / 2} y={q.y + q.h / 2} f={f} at={tBump} color={c.fill} r0={120} r1={330} />);
      out.push(
        <Bb key="hk-pin" m={popM(q.x + 520 * e, q.y + 5 * Math.sin(f / 8), q.w, q.h, k)} w={q.w} h={q.h} o={1 - tween(f, askIn + 4, 6)}>
          <div style={{ ...face(c.fill, c.side, T.depth.tile, T.radius.tile), padding: "22px 30px", position: "relative", overflow: "hidden" }}>
            <div style={{ ...zh, fontWeight: T.weight.strong, fontSize: 34, color: c.on }}>{p.pin.label}</div>
            <div style={{ ...en, fontWeight: T.weight.title, fontSize: p.pin.size ?? 92, color: c.on, marginTop: 12 }}>{p.pin.value}</div>
            <div style={{ position: "absolute", inset: 0, background: T.card, opacity: 0.75 * fade(f, tBump, 10) }} />
          </div>
          {p.pin.tag ? <div style={{ position: "absolute", right: -6, top: q.h + 30, ...bounce(f, hk.at(p.pin.tagAt, FAR), -3), transformOrigin: "100% 0" }}><Chip text={p.pin.tag} bg={T.card} fg={c.text} px={32} side={T.cardSide} /></div> : null}
        </Bb>,
      );
    }
  }
  // ── 只打一句：鍵盤特寫，提示卡打字（按鍵跟著沉）→ 按 Enter → 卡片沿虛線飛進螢幕，鏡頭跟過去 ──
  if (ak && f >= askIn && f < Math.max(arrive, ansIn) + M.exit) {
    const p = ak.p, q = POS.ask, c = col("primary"), t = eio(f, tSend, M.fly);
    const ent = springAccent(f, askIn + 3), home = at2(q.x, q.y + Math.round((1 - ent) * 220));
    const m = fly(home, scrCard(q.w), t);
    let used = 0;
    out.push(
      <Bb key="ak-card" m={m} w={q.w} h={q.h} o={tween(f, askIn + 3, 5) * (1 - tween(f, arrive - 3, 3))}>
        <div style={{ ...face(), padding: "26px 40px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <Chip text={p.label} bg={c.soft} fg={c.text} px={30} />
            {/* 送出鍵：按下去那一下變色、縮一下 */}
            {p.send ? <div style={{ transform: `scale(${(f >= tSend - 3 && f < tSend + 5 ? 0.86 : 1).toFixed(2)})` }}><Chip text={p.send} bg={f >= tSend - 3 ? c.fill : T.line} fg={f >= tSend - 3 ? c.on : T.ink3} px={30} /></div> : null}
          </div>
          <div style={{ marginTop: 14 }}>{lines.map((ln, i) => { const n = Math.max(0, Math.min(ln.length, shown - used)); used += ln.length; const caret = shown < total ? (n > 0 && n < ln.length) || (n === ln.length && shown === used) : false; return <div key={i} style={{ ...zh, fontWeight: T.weight.title, fontSize: p.size ?? 68, color: T.ink, height: Math.round((p.size ?? 68) * 1.2) }}>{ln.slice(0, n)}{caret || (i === lines.length - 1 && shown >= total && Math.floor(f / 8) % 2 === 0 && t === 0) || (i === 0 && shown === 0 && Math.floor(f / 6) % 2 === 0) ? <span style={{ display: "inline-block", width: 8, height: "0.9em", background: c.fill, marginLeft: 6, verticalAlign: "-0.08em", borderRadius: 4 }} /> : null}</div>; })}</div>
        </div>
      </Bb>,
    );
    if (t > 0 && f < arrive + 6) {
      const pts = Array.from({ length: Math.max(2, Math.round(t * 18)) }).map((_, i, a) => ap(fly(home, scrCard(q.w), (t * i) / (a.length - 1)), [q.w / 2, q.h / 2]).map((v) => v.toFixed(1)).join(",")).join(" ");
      out.push(<svg key="ak-trail" width={L.W} height={L.H} style={{ position: "absolute", left: 0, top: 0, opacity: 1 - tween(f, arrive, 6) }}><polyline points={pts} fill="none" stroke={c.fill} strokeWidth={7} strokeDasharray="5 18" strokeLinecap="round" /></svg>);
    }
    const ex = 1 - tween(f, Math.max(ansIn, arrive) - 4, M.exit, EASE.exit);
    if (p.tag) {
      // 工具名稱的牌子：彈出來，念到名字時一道光掃過去、星星轉一圈
      const tT = ak.at(p.tag.at, askIn), tS = ak.at(p.tag.shineAt, FAR), sh = tween(f, tS, 12);
      out.push(
        <div key="ak-tag" style={{ position: "absolute", left: L.X, top: L.MAIN_TOP + 8, opacity: ex }}>
          <div style={{ ...bounce(f, tT), transformOrigin: "0 50%" }}>
            <div style={{ position: "relative", overflow: "hidden", display: "flex", alignItems: "center", gap: 12, background: f >= tS ? c.fill : T.card, borderRadius: T.radius.chip, padding: "12px 28px 12px 20px", boxShadow: `0 6px 0 ${f >= tS ? c.side : T.cardSide}`, transform: `scale(${(f >= tS ? pop(f, tS, 0.88) : 1).toFixed(3)})`, transformOrigin: "0 50%" }}>
              <svg viewBox="-50 -50 100 100" width={40} height={40} style={{ transform: `rotate(${(f >= tS ? 180 * eio(f, tS, 16) : 0).toFixed(1)}deg)` }}><path d="M0 50 C0 12 -12 0 -50 0 C-12 0 0 -12 0 -50 C0 -12 12 0 50 0 C12 0 0 12 0 50 Z" fill={f >= tS ? c.on : c.fill} /></svg>
              <div style={{ ...zh, fontWeight: T.weight.strong, fontSize: 32, color: f >= tS ? c.on : T.ink2 }}>{p.tag.text}</div>
              {sh > 0 && sh < 1 ? <div style={{ position: "absolute", top: 0, bottom: 0, width: 90, left: `${-20 + 130 * sh}%`, background: T.card, opacity: 0.55, transform: "skewX(-20deg)" }} /> : null}
            </div>
          </div>
        </div>,
      );
    }
    if (p.note) {
      const nq = POS.note, nc = col("note"), nAt = ak.at(p.note.at, askIn), wob = f >= nAt ? 5 * Math.exp(-(f - nAt) / 9) * Math.cos((f - nAt) / 1.6) : 0;
      out.push(
        <div key="ak-note" style={{ position: "absolute", left: nq.x, top: nq.y, width: nq.w, height: nq.h, opacity: ex }}>
          <div style={{ width: "100%", height: "100%", ...slam(f, nAt, 3 + wob, 1.5) }}>
            <div style={{ ...face(nc.fill, nc.side, T.depth.card, 18), padding: "22px 28px" }}>
              <div style={{ ...zh, fontWeight: T.weight.title, fontSize: 58, color: nc.on }}>{p.note.text}</div>
              <div style={{ ...zh, fontWeight: T.weight.body, fontSize: 30, color: nc.text, marginTop: 12 }}>{p.note.sub}</div>
            </div>
          </div>
        </div>,
      );
    }
  }
  // ── 螢幕特寫 → 回答卡從螢幕面放大成正面大卡（鏡頭同時往下拉）→ 字一行一行出來 → 放大鏡掃過去找到那個數字 ──
  if (an && f >= tOut && f < cpIn + M.fly) {
    const p = an.p, q = POS.ans, c = col("primary"), w = col("wrong");
    const t = eio(f, tOut, M.fly), b = eio(f, cpIn, M.fly);
    const back = mul(cam, mul(ground(350, 236, 12), at2(0, 0, 170 / q.w)));
    const m = b > 0 ? fly(at2(q.x, q.y), back, b, 40) : fly(scrCard(q.w), at2(q.x, q.y + 4 * Math.sin(f / 9)), t, 60);
    const o = tween(f, tOut, 3) * (1 - tween(f, cpIn + M.fly - 4, 4));
    const tStack = Math.max(an.at(p.stackAt, settled), settled), target = p.lens?.text as string | undefined;
    const all = p.lines as string[], lens = an.p.lens ?? {};
    let first = true, before = 0;
    const line = (ln: string, key: number) => {
      // 串流：每幀多 3 個字
      const n = Math.max(0, Math.min(ln.length, Math.floor((f - tOut - 4) * 4) - before)); before += ln.length;
      const vis = ln.slice(0, n), hit = target && vis.includes(target), segs = hit ? vis.split(target as string) : [vis];
      return (
        <div key={key} style={{ fontFamily: FONT_ZH, fontWeight: T.weight.body, fontSize: 40, lineHeight: 1.5, color: T.ink, marginTop: key ? 14 : 0, minHeight: 60 }}>
          {segs.map((s, i) => {
            const host = i > 0 && first; if (i > 0) first = false;
            return (
              <React.Fragment key={i}>
                {i > 0 ? (
                  <Hi f={f} at={tLens} bg={w.soft} fg={w.text} ring={w.fill} style={{ position: "relative", fontWeight: T.weight.title, whiteSpace: "nowrap", display: "inline-block", transform: `scale(${(f >= tLens ? pop(f, tLens, 1.25) : 1).toFixed(3)})` }}>
                    {target}
                    {host ? <Lens3 f={f} from={tLensFrom} at={tLens} text={target as string} dx={lens.dx ?? 150} dy={lens.dy ?? 8} /> : null}
                  </Hi>
                ) : null}
                {p.mark2 ? hi(s, p.mark2.text, f, an.at(p.mark2.at, FAR), col(p.mark2.color ?? "note").soft, col(p.mark2.color ?? "note").text, col(p.mark2.color ?? "note").fill) : s}
              </React.Fragment>
            );
          })}
          {n < ln.length && n > 0 ? <span style={{ display: "inline-block", width: 14, height: "0.8em", background: c.fill, marginLeft: 4, verticalAlign: "-0.06em", borderRadius: 4 }} /> : null}
        </div>
      );
    };
    if (b === 0) [1, 0].forEach((i) => { const s = eio(f, tStack + i * M.stagger, 10); if (s > 0) out.push(<div key={`an-st${i}`} style={{ position: "absolute", left: q.x + 22 * (i + 1), top: q.y + Math.round(17 * (i + 1) * s), width: q.w - 44 * (i + 1), height: q.h, borderRadius: T.radius.card, background: T.card, boxShadow: `0 ${T.depth.card}px 0 ${T.cardSide}`, opacity: s }} />); });
    out.push(
      <Bb key="an-card" m={m} w={q.w} h={q.h} o={o}>
        <div style={{ ...face(), padding: "30px 40px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
            <Chip text={p.label} bg={c.fill} fg={c.on} px={30} />
            <div style={{ ...zh, fontWeight: T.weight.body, fontSize: L.MIN_PX, color: T.ink3 }}>{p.by}</div>
          </div>
          {all.map(line)}
          {p.more ? <div style={{ ...zh, fontWeight: T.weight.body, fontSize: L.MIN_PX, color: T.ink3, marginTop: 14, opacity: tween(f, tStack, 6) }}>{p.more}</div> : null}
        </div>
      </Bb>,
    );
  }
  // ── 拉遠全景：錯數字從放大鏡跳出來 → 蓋章（震）→ 新數字邊翻牌邊掉下來，把錯的撞飛 → 落定發光、蓋印 ──
  if (cp && f >= cpIn && f < nxIn + 14) {
    const p = cp.p, wq = POS.wrong, rq = POS.right, wc = col("wrong"), rc = col("right");
    const e = tween(f, nxIn, 10, EASE.exit), o = 1 - tween(f, nxIn + 3, 7);
    const a = eio(f, cpIn + 2, 12), k = tween(f, land, 18, EASE.enter), gray = tween(f, tStamp + 3, 6);
    const wk = (0.3 + 0.7 * a) * (1 + (wq.toK - 1) * k), bob = k === 0 ? 5 * Math.sin(f / 7) : 0;
    const wx = 640 + (wq.x - 640) * a + (wq.toX - wq.x) * k, wy = 860 + (wq.y - 860) * a + (wq.toY - wq.y) * k - 190 * Math.sin(Math.PI * k) + bob - 700 * e;
    out.push(
      <Bb key="cp-wrong" m={at2(wx, wy, wk)} w={wq.w} h={wq.h} o={tween(f, cpIn + 2, 3) * o}>
        <div style={{ width: "100%", height: "100%", transform: `rotate(${(-374 * k).toFixed(2)}deg)` }}>
          <div style={{ ...face(gray > 0.5 ? T.line : wc.soft, gray > 0.5 ? T.cardSide : wc.fill, T.depth.tile, T.radius.tile), padding: "22px 34px" }}>
            <div style={{ ...zh, fontWeight: T.weight.strong, fontSize: 34, color: gray > 0.5 ? T.ink3 : wc.text }}>{p.wrong.label}</div>
            <div style={{ position: "relative", display: "inline-block", ...en, fontWeight: T.weight.title, fontSize: p.wrong.size ?? 124, color: gray > 0.5 ? T.ink3 : wc.text, marginTop: 10 }}>{p.wrong.value}<Strike f={f} at={tStamp} color={T.ink} /></div>
          </div>
          <div style={{ position: "absolute", right: -70, bottom: -34, ...slam(f, tStamp + 3, -6, 3), transformOrigin: "50% 50%" }}><div style={{ ...zh, fontWeight: T.weight.title, fontSize: 46, color: wc.text, background: T.card, border: `6px solid ${wc.fill}`, borderRadius: 16, padding: "8px 22px" }}>{p.wrong.stamp}</div></div>
        </div>
      </Bb>,
    );
    out.push(<Burst key="cp-b1" x={wq.x + wq.w} y={wq.y + wq.h} f={f} at={tStamp + 3 + M.slam - 1} color={wc.fill} r0={120} r1={250} />);
    if (f >= tDrop) {
      const d = tween(f, tDrop, 8, EASE.exit), sq = f < land ? 1.06 : 0.86 + 0.14 * springAccent(f, land);
      const punchK = f >= tNow ? pop(f, tNow, 0.9) : 1, y = -500 + (rq.y + 500) * d - 900 * e + (f > land + 12 ? 4 * Math.sin(f / 8) : 0);
      const shadowW = 0.5 + 0.5 * d;
      // 影子：卡還在高處時小而淡，落地變大變深
      out.push(<div key="cp-shadow" style={{ position: "absolute", left: rq.x + (rq.w * (1 - shadowW)) / 2, top: rq.y + rq.h + 6, width: rq.w * shadowW, height: 34, borderRadius: "50%", background: T.floor, opacity: 0.16 * d * o, filter: "blur(10px)" }} />);
      out.push(<Ring key="cp-ring" x={rq.x + rq.w / 2} y={rq.y + rq.h / 2} f={f} at={tNow} color={rc.fill} r0={200} r1={560} dur={18} />);
      out.push(<Burst key="cp-b2" x={rq.x + rq.w / 2} y={rq.y + rq.h / 2} f={f} at={tNow} color={T.color.note.fill} n={14} r0={380} r1={520} w={12} dur={14} />);
      out.push(
        <Bb key="cp-right" m={mul(popM(rq.x, y, rq.w, rq.h, punchK), [1, 0, 0, sq, 0, rq.h * (1 - sq)])} w={rq.w} h={rq.h} o={o}>
          <div style={{ ...face(rc.fill, rc.side, T.depth.tile, T.radius.tile), padding: "30px 44px", position: "relative", overflow: "hidden" }}>
            <div style={{ ...zh, fontWeight: T.weight.strong, fontSize: 40, color: rc.on }}>{p.right.label}</div>
            <div style={{ ...en, fontWeight: T.weight.title, fontSize: p.right.size ?? 190, color: rc.on, marginTop: 14, fontVariantNumeric: "tabular-nums" }}>{roll(p.right.value, f, tDrop, tNow)}</div>
            <div style={{ position: "absolute", inset: 0, background: T.card, opacity: 0.8 * fade(f, tNow, 12) }} />
          </div>
          {p.right.seal ? (
            <div style={{ position: "absolute", right: -34, top: -70, width: 196, height: 196, ...slam(f, tSeal, 12, 2.8) }}>
              <div style={{ width: "100%", height: "100%", boxSizing: "border-box", borderRadius: "50%", background: T.card, border: `8px solid ${rc.fill}`, outline: `4px solid ${T.card}`, boxShadow: T.depth.soft, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 2 }}>
                <Check size={74} color={rc.fill} />
                <div style={{ ...zh, fontWeight: T.weight.title, fontSize: 32, color: rc.text }}>{p.right.seal}</div>
              </div>
            </div>
          ) : null}
        </Bb>,
      );
      if (p.right.sub) out.push(<div key="cp-sub" style={{ position: "absolute", left: L.X, width: L.INNER_W, top: rq.y + rq.h + 40 - 900 * e, textAlign: "center", opacity: o }}><div style={{ display: "inline-block", ...bounce(f, tSeal + 8) }}><Chip text={p.right.sub} bg={T.card} fg={T.ink2} px={30} side={T.cardSide} /></div></div>);
    }
  }
  // ── 新聞紙特寫（翻開）→ 大字「先貼新聞」→ 新聞紙沿虛線飛進螢幕（跟拍）→ 新回答從螢幕出來 → 拉遠，下一招的卡跳出來 ──
  if (nx && f >= nxIn) {
    const p = nx.p, c = col("primary"), a0 = nxIn + 7, tMark = nx.at(p.mark?.at, a0), tStrike = nx.at(p.old?.strikeAt, a0);
    const sp = springAccent(f, a0);
    out.push(
      <div key="nx-title" style={{ position: "absolute", left: L.X, top: L.MAIN_TOP + 6, width: L.INNER_W, opacity: tween(f, a0, 6), transform: `translateY(${Math.round((1 - sp) * 120)}px)` }}>
        <Chip text={p.kicker} bg={c.fill} fg={c.on} px={40} side={c.side} />
        <div style={{ ...zh, fontWeight: T.weight.title, fontSize: p.size ?? 176, color: T.ink, marginTop: 16, letterSpacing: "-0.01em" }}>{hi(p.title, p.mark?.text, f, tMark, c.soft, c.text, c.fill)}</div>
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
      out.push(<div key="nx-label" style={{ position: "absolute", left: sx, top: sy - 130, opacity: 1 - tween(f, arrive2 - 5, 4) }}><div style={{ transform: "translateX(-50%)" }}><div style={bounce(f, tFlip + 8)}><Chip text={p.label} bg={T.ink} fg={T.card} px={32} /></div></div></div>);
    }
    // 貼新聞之後的回答（實測節錄）：從螢幕面放大成正面卡；「只看這段」＝四個角框住這一行
    if (p.result && f >= tRes) {
      const r = p.result, q = POS.res, rc = col("right"), t = eio(f, tRes, M.fly), z = eio(f, tTease - 10, 12);
      const tM = nx.at(r.markAt, tRes + M.fly), br = eio(f, tM, 10);
      const dock = at2(q.x + q.w * 0.5 * 0.3, L.MAIN_BOTTOM + 60, 0.7);
      const m = z > 0 ? fly(at2(q.x, q.y), dock, z, 0) : fly(scrCard(q.w), at2(q.x, q.y + 4 * Math.sin(f / 9)), t, 50);
      out.push(
        <Bb key="nx-res" m={m} w={q.w} h={q.h} o={tween(f, tRes, 3) * (1 - z)}>
          <div style={{ ...face(), padding: "26px 36px", position: "relative" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 22 }}>
              <Chip text={r.label} bg={rc.fill} fg={rc.on} px={30} />
              <div style={{ ...zh, fontWeight: T.weight.body, fontSize: L.MIN_PX, color: T.ink3 }}>{r.by}</div>
            </div>
            <div style={{ position: "relative", display: "inline-block", padding: "10px 14px" }}>
              {(r.lines as string[]).map((ln, i) => <div key={i} style={{ ...zh, fontWeight: T.weight.strong, fontSize: r.size ?? 38, lineHeight: 1.45, color: T.ink }}>{hi(ln.slice(0, Math.max(0, Math.floor((f - tRes - M.fly + 4) * 3))), r.mark, f, tM + 4, rc.soft, rc.text, rc.fill)}</div>)}
              {/* 四個角：只看這段 */}
              {[[0, 0], [1, 0], [0, 1], [1, 1]].map(([x, y], i) => <div key={i} style={{ position: "absolute", [x ? "right" : "left"]: -6 - 30 * (1 - br), [y ? "bottom" : "top"]: -6 - 30 * (1 - br), width: 34, height: 34, opacity: br, [`border${y ? "Bottom" : "Top"}`]: `8px solid ${c.fill}`, [`border${x ? "Right" : "Left"}`]: `8px solid ${c.fill}`, borderRadius: 6 } as React.CSSProperties} />)}
            </div>
          </div>
        </Bb>,
      );
    }
    // 收尾：三顆步驟膠囊依序彈出，最後一顆是問號，會一直跳
    const chips = (p.chips ?? []) as string[], tChips = nx.at(p.chipsAt, tGo + 8), tones = ["right", "primary", "note"];
    if (chips.length) out.push(
      <div key="nx-chips" style={{ position: "absolute", left: L.X, width: L.INNER_W, top: L.MAIN_BOTTOM - 96, display: "flex", justifyContent: "space-between" }}>
        {chips.map((t, i) => { const cc = col(tones[i % 3]), last = i === chips.length - 1, at = last ? tTease : tChips + i * 6; return (
          <div key={i} style={{ ...bounce(f, at) }}>
            <div style={{ transform: last && f > tTease + 10 ? `translateY(${(-8 * Math.abs(Math.sin((f - tTease) / 6))).toFixed(1)}px)` : undefined, display: "flex", alignItems: "center", gap: 10, background: T.card, borderRadius: 24, padding: "16px 24px 16px 18px", boxShadow: `0 8px 0 ${cc.fill}, ${T.depth.soft}` }}>
              <div style={{ width: 44, height: 44, borderRadius: 14, background: cc.soft, display: "flex", alignItems: "center", justifyContent: "center", ...en, fontWeight: T.weight.title, fontSize: 30, color: cc.text }}>{i + 1}</div>
              <div style={{ ...zh, fontWeight: T.weight.title, fontSize: 44, color: T.ink }}>{t}</div>
            </div>
          </div>
        ); })}
      </div>,
    );
    // 下一招：從桌角那張蓋著的卡翻出來，問號一直晃
    if (p.teaser && f >= tTease) {
      const q = POS.tease, pc = col("plum"), [sx, sy] = ap(cam, iso(495, 555, 30)), t = eio(f, tTease, 14);
      const m = fly(at2(sx - 40, sy - 20, 0.2), at2(q.x, q.y + 6 * Math.sin(f / 7)), t, 150);
      out.push(<Ring key="nx-ring" x={q.x + q.w / 2} y={q.y + q.h / 2} f={f} at={tTease + 12} color={pc.fill} r0={120} r1={380} />);
      out.push(
        <Bb key="nx-tease" m={m} w={q.w} h={q.h} o={tween(f, tTease, 3)}>
          <div style={{ width: "100%", height: "100%", transform: `rotate(${(3 * Math.sin((f - tTease) / 5) * (0.4 + 0.6 * Math.exp(-(f - tTease) / 40))).toFixed(2)}deg)` }}>
            <div style={{ ...face(pc.fill, pc.side, T.depth.tile, T.radius.tile), padding: "24px 30px", display: "flex", alignItems: "center", gap: 22 }}>
              <div style={{ width: 120, height: 120, flex: "none", borderRadius: 30, background: T.card, display: "flex", alignItems: "center", justifyContent: "center", ...en, fontWeight: T.weight.title, fontSize: 96, color: pc.text, transform: `scale(${(1 + 0.12 * Math.sin((f - tTease) / 4)).toFixed(3)})` }}>?</div>
              <div>
                <div style={{ ...zh, fontWeight: T.weight.body, fontSize: 30, color: pc.on }}>{p.teaser.label}</div>
                <div style={{ ...zh, fontWeight: T.weight.title, fontSize: 46, color: pc.on, marginTop: 8 }}>{p.teaser.text}</div>
              </div>
            </div>
          </div>
        </Bb>,
      );
    }
  }
  return (
    <>
      <Glow f={f} />
      <World st={st} />
      <Floaters f={f} cam={cam} />
      {out}
    </>
  );
};

// ───────── 上下兩條色帶（2026/11/15 版面規則：上下不留死白；平台介面區不放要讀的字，只放裝飾） ─────────
/** 一顆等距小方塊（top／左／右三面），中心在 (0,0)，邊長 a */
const Cube: React.FC<{ a: number; tone: string }> = ({ a, tone }) => {
  const c = T.solid[tone] ?? T.solid.lav, h = a * 0.5;
  return (
    <g>
      <path d={`M0 ${-h} L${a} 0 L0 ${h} L${-a} 0 Z`} fill={c.top} />
      <path d={`M${-a} 0 L0 ${h} L0 ${h + a} L${-a} ${a} Z`} fill={c.l} />
      <path d={`M${a} 0 L0 ${h} L0 ${h + a} L${a} ${a} Z`} fill={c.r} />
    </g>
  );
};
const BAND_TONES = ["lav", "sky", "mint", "yellow", "coral", "plum"];
const Bands: React.FC<{ f: number }> = ({ f }) => {
  const top = L.HEADER_TOP - 22, bot = L.BAND_TOP;
  return (
    <svg width={L.W} height={L.H} style={{ position: "absolute", left: 0, top: 0 }}>
      <defs>
        <linearGradient id="isoBandTop" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={T.solid.lav.top} stopOpacity={0.55} /><stop offset="1" stopColor={T.bg} stopOpacity={0} /></linearGradient>
        <linearGradient id="isoBandBot" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={T.solid.desk.top} stopOpacity={0.9} /><stop offset="1" stopColor={T.solid.desk.l} stopOpacity={0.95} /></linearGradient>
      </defs>
      <rect x={0} y={0} width={L.W} height={top} fill="url(#isoBandTop)" />
      {/* 上方：一排慢慢上下浮的小方塊 */}
      {Array.from({ length: 9 }, (_, i) => { const x = 60 + i * 120, y = 120 + 12 * Math.sin(f / 17 + i * 0.9); return <g key={i} transform={`translate(${x} ${y.toFixed(1)})`} opacity={0.55}><Cube a={14 + (i % 3) * 4} tone={BAND_TONES[i % 6]} /></g>; })}
      {/* 下方：桌緣色帶（像桌面延伸出畫面）＋一排方塊慢慢往左滑 */}
      <path d={`M0 ${bot + 26} Q ${L.W / 2} ${bot - 14} ${L.W} ${bot + 26} L ${L.W} ${L.H} L 0 ${L.H} Z`} fill="url(#isoBandBot)" />
      <path d={`M0 ${bot + 26} Q ${L.W / 2} ${bot - 14} ${L.W} ${bot + 26}`} fill="none" stroke={T.solid.desk.r} strokeWidth={6} />
      {Array.from({ length: 11 }, (_, i) => { const x = ((i * 118 - f * 1.2) % 1298 + 1298) % 1298 - 100, y = bot + 120 + (i % 2) * 34; return <g key={i} transform={`translate(${x.toFixed(1)} ${y})`} opacity={0.75}><Cube a={20 + (i % 3) * 5} tone={BAND_TONES[(i + 2) % 6]} /></g>; })}
    </svg>
  );
};

// ───────── 片尾卡：小方塊從上面掉下來疊成底座 → LOGO 方塊落地回彈 → 對話泡泡彈出、游標把頻道名打出來 → slogan ─────────
const EndIso: React.FC<{ f: number; at: number; p: Record<string, any>; name: string }> = ({ f, at, p, name }) => {
  const a = f - at, c = col("primary"), cx = L.W / 2, cy = 860;
  const wipe = eio(f, at, 10); // 圓形擴開蓋住桌面
  const word = String(p.word ?? "AI 動手做"), chars = [...word], tType = at + 34, typed = Math.max(0, Math.min(chars.length, Math.floor((f - tType) / 3) + 1));
  const tLogo = at + 20, land = f >= tLogo ? tween(f, tLogo, 7, EASE.enter) : 0;
  const squash = f < tLogo + 7 ? 1 : 1 + 0.16 * Math.exp(-(f - tLogo - 7) / 4) * Math.cos((f - tLogo - 7) / 1.6);
  const cubes = [-3, -2, -1, 0, 1, 2, 3];
  return (
    <AbsoluteFill style={{ clipPath: `circle(${(wipe * 125).toFixed(2)}% at 50% 46%)`, background: `linear-gradient(180deg, ${T.bg} 0%, ${T.bg2} 100%)` }}>
      <Bands f={f} />
      <svg width={L.W} height={L.H} style={{ position: "absolute", left: 0, top: 0 }}>
        {/* 底座：七顆方塊依序掉下來，落地彈一下 */}
        {cubes.map((k, i) => {
          const t0 = at + 6 + i * 2, t = tween(f, t0, 8, EASE.enter), bob = f > t0 + 8 ? 6 * Math.exp(-(f - t0 - 8) / 5) * Math.sin((f - t0 - 8) / 1.4) : 0;
          if (f < t0) return null;
          const x = cx + k * 66, y = cy + 210 + Math.abs(k) * -0 - (1 - t) * 520 - bob;
          return <g key={i} transform={`translate(${x} ${y.toFixed(1)})`}><Cube a={36} tone={BAND_TONES[(i + 1) % 6]} /></g>;
        })}
        {/* 落地時的擴散圈 */}
        {f >= tLogo + 7 ? <ellipse cx={cx} cy={cy + 205} rx={120 + 260 * tween(f, tLogo + 7, 16)} ry={(120 + 260 * tween(f, tLogo + 7, 16)) * 0.42} fill="none" stroke={c.fill} strokeWidth={6} opacity={1 - tween(f, tLogo + 7, 16)} /> : null}
      </svg>
      {/* LOGO 方塊（和左上角的同一個圖形，放大） */}
      <div style={{ position: "absolute", left: cx - 150, top: cy - 120 - (1 - land) * 700, width: 300, height: 270, transformOrigin: "50% 100%", transform: `scale(${(1 / squash).toFixed(4)}, ${squash.toFixed(4)})`, opacity: f >= tLogo ? 1 : 0 }}>
        <div style={{ ...face(c.fill, c.side, 26, 78), display: "flex", alignItems: "center", justifyContent: "center", ...en, fontWeight: T.weight.strong, fontSize: 150, color: c.on }}>{name}</div>
        {/* 四角星：落地後轉半圈 */}
        <svg width={90} height={90} viewBox="-50 -50 100 100" style={{ position: "absolute", right: -30, top: -36, transform: `rotate(${(180 * eio(f, tLogo + 8, 16)).toFixed(1)}deg) scale(${(f < tLogo + 8 ? 0 : pop(f, tLogo + 8, 0.6)).toFixed(3)})` }}><path d="M0 50 C0 12 -12 0 -50 0 C-12 0 0 -12 0 -50 C0 -12 12 0 50 0 C12 0 0 12 0 50 Z" fill={T.color.note.fill} /></svg>
      </div>
      {/* 對話泡泡：彈出，先三個點，再由游標打出頻道名 */}
      <div style={{ position: "absolute", left: 0, width: L.W, top: cy - 420, display: "flex", justifyContent: "center" }}>
        <div style={{ ...bounce(f, at + 26) }}>
          <div style={{ position: "relative", background: T.card, borderRadius: 40, padding: "28px 52px", boxShadow: `0 10px 0 ${T.cardSide}, ${T.depth.soft}`, minWidth: 220, display: "flex", alignItems: "center", justifyContent: "center", height: 112 }}>
            {f < tType ? [0, 1, 2].map((i) => <span key={i} style={{ width: 22, height: 22, borderRadius: 11, margin: "0 9px", background: c.fill, transform: `translateY(${(-12 * Math.max(0, Math.sin((a - i * 3) / 2.2))).toFixed(1)}px)` }} />) : (
              <span style={{ ...zh, fontWeight: T.weight.title, fontSize: 84, color: T.ink }}>{chars.slice(0, typed).join("")}<span style={{ display: "inline-block", width: 8, height: 76, marginLeft: 6, verticalAlign: "-8px", background: c.fill, opacity: typed < chars.length || Math.floor(a / 7) % 2 === 0 ? 1 : 0 }} /></span>
            )}
            <span style={{ position: "absolute", left: "50%", bottom: -26, marginLeft: -20, width: 0, height: 0, borderLeft: "20px solid transparent", borderRight: "20px solid transparent", borderTop: `28px solid ${T.card}` }} />
          </div>
        </div>
      </div>
      {p.slogan ? <div style={{ position: "absolute", left: 0, width: L.W, top: cy + 330, textAlign: "center", ...riseInS(f, at + 52) }}><span style={{ ...zh, fontWeight: T.weight.strong, fontSize: 52, color: T.ink2 }}>{p.slogan}</span></div> : null}
    </AbsoluteFill>
  );
};
const riseInS = (f: number, at: number): React.CSSProperties => ({ opacity: tween(f, at, 6), transform: `translateY(${Math.round((1 - springAccent(f, at)) * 40)}px)` });

export const ShortIso: React.FC<Script & { timeline: TimelineV2 }> = ({ scenes, timeline, channel }) => {
  const f = useCurrentFrame();
  const all = useMemo(() => buildIso(scenes, timeline), [scenes, timeline]);
  // 片尾卡（panel: "end"，silent）不進桌面舞台：它是蓋在最上面的一張整頁卡，桌面在底下停在最後一鏡
  const panels = useMemo(() => all.filter((x) => x.kind !== "end"), [all]);
  const endP = all.find((x) => x.kind === "end");
  const by = Object.fromEntries(timeline.scenes.map((x) => [x.id, x]));
  const ordered = scenes.filter((s) => by[s.id]);
  const caps: Cap[] = ordered.filter((s) => by[s.id].subtitleWindow).map((s) => ({ en: s.subtitle.en, window: by[s.id].subtitleWindow as [number, number], phrases: by[s.id].lines.map((l) => ({ ...l, text: l.text.replace(/[，、；：。]+$/, "") })), keywords: s.keywords ?? [], kw: ((s.props as any)?.kw ?? {}) as Record<string, string> }));
  const srcs = ordered.map((s) => ({ sources: s.sources, window: by[s.id].sourceWindow }));
  return (
    <AbsoluteFill style={{ background: T.bg }}>
      <Backdrop />
      <Stage panels={panels} f={f} />
      <Bands f={f} />
      {endP && f >= endP.in ? <EndIso f={f} at={endP.in} p={endP.p} name={channel?.name ?? "AI"} /> : null}
      <HeaderIso name={channel?.name ?? "AI"} tag={channel?.tag ?? "AI 動手做"} right={channel?.slogan} progress={Math.min(1, f / Math.max(1, timeline.totalFrames - 1))} />
      {endP && f >= endP.in + 6 ? null : <Caption cues={caps} f={f} />}
      {endP && f >= endP.in + 6 ? null : <SourceLine cues={srcs} f={f} />}
      {timeline.voice ? <Audio src={staticFile(timeline.voice.file)} /> : timeline.scenes.filter((t) => t.audio).map((t) => (
        <Sequence key={`${t.id}-audio`} from={t.audioFrame} durationInFrames={Math.ceil(t.audioSec * FPS) + 1} name={`${t.id}-audio`} layout="none"><Audio src={staticFile(t.audio as string)} /></Sequence>
      ))}
    </AbsoluteFill>
  );
};

/** 封面：鉤子那一鏡在第 0 幀的樣子（大字＋桌面＋兩個數字） */
export const CoverShort: React.FC<Script & { coverCrop?: number }> = ({ scenes, channel, coverCrop }) => {
  const p = (scenes[0]?.props ?? {}) as Record<string, any>;
  const shift = coverCrop ? (L.H - coverCrop) / 2 - 150 : 0;
  const panel: Panel = { kind: "hook", sid: "cover", in: 0, out: 1e9, p: { ...p, camera: ([] as any[]).concat(p.camera ?? []).slice(-1) }, at: () => -40 };
  return (
    <AbsoluteFill style={{ background: T.bg }}>
      <Backdrop />
      <Stage panels={[panel]} f={0} />
      <div style={{ position: "absolute", inset: 0, transform: `translateY(${shift}px)` }}><HeaderIso name={channel?.name ?? "AI"} tag={channel?.tag ?? "AI 動手做"} right={channel?.slogan} progress={0} /></div>
    </AbsoluteFill>
  );
};

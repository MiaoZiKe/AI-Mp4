// 談晴說礙頻道貼文風格（styleVersion 3 ＋ stage: "tanqing"）：把頻道的靜態輪播圖卡「動起來」。
// 暖米紙底、左上太陽雲朵字標、襯線粗體大標、線稿圓角圖形一筆一筆長出來、只有一個橘色強調、
// 左下「資料：來源」、右下小太陽加圓點當頁碼。一幕＝一頁，換頁是紙面平移加淡入；每頁極慢推近。
// 參考圖：docs/channels/tanqing-ref/；時間全部來自 timeline（engine.ts）；顏色與版面讀 THEME_TANQING／LAYOUT_TANQING。
import React, { useEffect, useMemo, useState } from "react";
import { AbsoluteFill, Audio, Sequence, continueRender, delayRender, staticFile, useCurrentFrame } from "remotion";
import type { Script, TimelineV2 } from "../../types";
import { FONT_EN, FONT_TANQING_SERIF as SERIF, FONT_ZH, FPS, LAYOUT_TANQING as L, THEME_TANQING as T } from "../../theme";
import { EASE, linear, tween } from "../anim";
import { buildTanqing, staticPage, type TqFigure, type TqPage } from "./engine";
import { FILM_FIGURES } from "./Figures";

const r1 = (v: number) => Math.round(v * 10) / 10;
const M = T.motion;

// ── 襯線字型（public/fonts/tanqing/，scripts/tanqing/fetch-fonts.mjs 下載的子集）；只有這個舞台掛上來時才載入 ──
let fontJob: Promise<unknown> | null = null;
const loadFonts = () => {
  if (!fontJob) fontJob = Promise.all(([[String(T.weight.title), "fonts/tanqing/serif-900.woff2"], [String(T.weight.mark), "fonts/tanqing/serif-500.woff2"]] as const).map(([weight, file]) =>
    new FontFace("TanqingSerif", `url(${staticFile(file)}) format("woff2")`, { weight }).load().then((ff) => { document.fonts.add(ff); })));
  return fontJob;
};
const useSerif = () => {
  const [h] = useState(() => delayRender("tanqing-fonts"));
  useEffect(() => { loadFonts().then(() => continueRender(h), (e) => { console.error("tanqing fonts", e); continueRender(h); }); }, [h]);
};

// ── 一筆畫出來的線（pathLength 正規化成 1，用 dashoffset 長出來） ──
export const pen = (p: number) => ({ pathLength: 1, strokeDasharray: 1, strokeDashoffset: r1(1000 * (1 - p)) / 1000, strokeLinecap: "round" as const, strokeLinejoin: "round" as const });
export const drawP = (f: number, at: number, dur: number = M.draw) => tween(f, at, dur, EASE.move);
export const fadeP = (f: number, at: number, dur: number = M.fade) => tween(f, at, dur, EASE.enter);

/** 太陽雲朵（頻道字標的圖形；logo-wordmark-day.svg 的兩筆，加貼文上的三道光） */
const CLOUD = "M -120 120 H 110 A 40 40 0 0 0 110 40 A 67.5 67.5 0 0 0 -25 35 A 55 55 0 0 0 -120 120 Z";
const SUN_ARC = "M -26.3 -78.5 A 110 110 0 0 1 170.1 13.1";
const RAYS = [-128, -86, -44].map((deg) => { const a = (deg * Math.PI) / 180, c = [61, -8]; return `M ${r1(c[0] + 142 * Math.cos(a))} ${r1(c[1] + 142 * Math.sin(a))} L ${r1(c[0] + 176 * Math.cos(a))} ${r1(c[1] + 176 * Math.sin(a))}`; });
const SunCloud: React.FC<{ size: number; cloud?: number; sun?: number; rays?: number }> = ({ size, cloud = 1, sun = 1, rays = 1 }) => (
  <svg width={size} height={size} viewBox="-150 -200 340 340" style={{ display: "block", overflow: "visible" }}>
    {cloud > 0 ? <path d={CLOUD} fill="none" stroke={T.line} strokeWidth={22} {...pen(cloud)} /> : null}
    {sun > 0 ? <path d={SUN_ARC} fill="none" stroke={T.orange} strokeWidth={22} {...pen(sun)} /> : null}
    {RAYS.map((d, k) => { const p = Math.min(1, Math.max(0, rays * 3 - k)); return p > 0 ? <path key={k} d={d} fill="none" stroke={T.orange} strokeWidth={18} {...pen(p)} /> : null; })}
  </svg>
);

/** 左上字標：太陽雲朵＋「談晴說礙」（晴、礙兩字帶橘棕色） */
const Wordmark: React.FC<{ name: string }> = ({ name }) => (
  <div style={{ position: "absolute", left: L.X, top: L.MARK_TOP, height: L.MARK_ICON, display: "flex", alignItems: "center", gap: 26 }}>
    <SunCloud size={L.MARK_ICON} />
    <div style={{ fontFamily: SERIF, fontWeight: T.weight.mark, fontSize: L.MARK_PX, letterSpacing: "0.14em", color: T.ink, lineHeight: 1 }}>
      {[...name].map((c, i) => <span key={i} style={{ color: c === "晴" ? T.qing : c === "礙" ? T.ai : T.ink }}>{c}</span>)}
    </div>
  </div>
);

/** 地面線＋下面一排淡斜紋（貼文圖表的底） */
export const Ground: React.FC<{ y: number; p: number; x0?: number; x1?: number }> = ({ y, p, x0 = 0, x1 = L.INNER_W }) => p <= 0 ? null : (
  <g>
    <g opacity={p}>{Array.from({ length: Math.floor((x1 - x0 - 16) / 12) }, (_, k) => <line key={k} x1={x0 + 14 + k * 12} y1={y + 4} x2={x0 + 6 + k * 12} y2={y + 16} stroke={T.hair} strokeWidth={T.stroke.hair} />)}</g>
    <line x1={x0} y1={y} x2={x0 + (x1 - x0) * p} y2={y} stroke={T.line} strokeWidth={T.stroke.line} strokeLinecap="round" />
  </g>
);

export const Svg: React.FC<{ children: React.ReactNode }> = ({ children }) => <svg width={L.INNER_W} height={L.FIG_H} viewBox={`0 0 ${L.INNER_W} ${L.FIG_H}`} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>{children}</svg>;
export const figText = (px: number, weight: number, color: string): React.CSSProperties => ({ position: "absolute", fontFamily: FONT_ZH, fontWeight: weight, fontSize: px, lineHeight: 1.25, color, whiteSpace: "pre" });

/** 十個圓角人形膠囊：第 0 幀先有淡線輪廓（ghost），再一個一個描出來；mark 個再描成空心橘框，其餘填米色。左上是大數字；標籤接在橘色虛線的右端 */
const People: React.FC<{ fig: TqFigure; f: number }> = ({ fig, f }) => {
  const n = fig.count ?? 10, mark = fig.mark ?? 0, t = fig.times;
  const bw = 68, bh = 230, hr = 27, pitch = 88, ground = 600;
  const x0 = (L.INNER_W - ((n - 1) * pitch + bw)) / 2, top = ground - 3 - bh, headCy = top - 10 - hr;
  const markAt = t.markAt ?? fig.at, lineAt = t.labelAt ?? markAt;
  const lineY = headCy - hr - 20, lineX1 = x0 + (mark - 1) * pitch + bw + 12;
  const lp = drawP(f, lineAt, M.draw * 2);
  const restP = fadeP(f, markAt + mark * M.markStagger);
  return (
    <>
      <Svg>
        <Ground y={ground} p={drawP(f, t.groundAt ?? fig.at, M.draw)} />
        {fig.ghost === false ? null : Array.from({ length: n }, (_, k) => {
          const x = x0 + k * pitch;
          return (
            <g key={`g${k}`} fill="none" stroke={T.hair} strokeWidth={T.stroke.hair}>
              <circle cx={x + bw / 2} cy={headCy} r={hr} />
              <rect x={x} y={top} width={bw} height={bh} rx={bw / 2} />
            </g>
          );
        })}
        {Array.from({ length: n }, (_, k) => {
          const x = x0 + k * pitch, p = drawP(f, fig.at + k * (fig.stagger ?? M.stagger)), op = k < mark ? drawP(f, markAt + k * M.markStagger, M.mark) : 0;
          if (p <= 0) return null;
          const shape = (stroke: string, w: number, q: number, fill: string, fo: number) => (
            <>
              <circle cx={x + bw / 2} cy={headCy} r={hr} fill={fill} fillOpacity={fo} stroke={stroke} strokeWidth={w} {...pen(q)} transform={`rotate(-90 ${x + bw / 2} ${headCy})`} />
              <rect x={x} y={top} width={bw} height={bh} rx={bw / 2} fill={fill} fillOpacity={fo} stroke={stroke} strokeWidth={w} {...pen(q)} />
            </>
          );
          return (
            <g key={k}>
              {shape(T.line, T.stroke.line, p, T.fill, p)}
              {k >= mark && restP > 0 ? shape(T.line, T.stroke.line, 1, T.fillB, restP) : null}
              {op > 0 ? shape(T.orange, T.stroke.accent + 1, op, T.fill, 1) : null}
            </g>
          );
        })}
        {lp > 0 ? <line x1={x0 - 12} y1={lineY} x2={x0 - 12 + (lineX1 - x0 + 12) * lp} y2={lineY} stroke={T.orange} strokeWidth={T.stroke.line} strokeDasharray="16 12" /> : null}
      </Svg>
      {fig.number ? (
        <div style={{ position: "absolute", left: 0, top: 0, display: "flex", alignItems: "center", gap: 34 }}>
          <div style={{ fontFamily: FONT_EN, fontWeight: T.weight.num, fontSize: L.NUM_PX, lineHeight: 1, letterSpacing: "-0.02em", color: T.ink }}>{fig.number.text}</div>
          {fig.number.note ? <div style={{ ...figText(L.NUM_NOTE_PX, T.weight.body, T.ink2), position: "relative", lineHeight: 1.4 }}>{fig.number.note}</div> : null}
        </div>
      ) : null}
      {fig.label ? <div style={{ ...figText(L.LABEL_PX, T.weight.bold, T.ink), left: lineX1 + 18, top: lineY - L.LABEL_PX, opacity: fadeP(f, lineAt + M.draw) }}>{fig.label}</div> : null}
    </>
  );
};

/** 圓角表單框：一格有字的題目、一格虛線的空格；空格外面描一圈橘框，旁邊一句粗體 */
const Form: React.FC<{ fig: TqFigure; f: number }> = ({ fig, f }) => {
  const t = fig.times, x = 104, w = 560, y = 86, h = 400, head = 70, rx = 16;
  const cp = drawP(f, fig.at, M.draw * 1.5), qp = drawP(f, t.askAt ?? fig.at), ap = fadeP(f, t.blankAt ?? fig.at), fp = drawP(f, t.frameAt ?? fig.at, M.draw * 1.4);
  const row = (ry: number) => ({ x: x + 30, y: ry, width: w - 60, height: 92, rx: 12 });
  const ra = row(y + head + 42), rb = row(y + head + 42 + 92 + 46);
  return (
    <>
      <Svg>
        {cp > 0 ? (
          <>
            <rect x={x} y={y} width={w} height={h} rx={rx} fill={T.fillB} fillOpacity={cp} stroke={T.line} strokeWidth={T.stroke.line} {...pen(cp)} />
            <rect x={x} y={y} width={w} height={head} rx={rx} fill={T.fill} fillOpacity={cp} stroke={T.line} strokeWidth={T.stroke.line} {...pen(cp)} />
            <line x1={x + 28} y1={y + head / 2} x2={x + 28 + 200 * cp} y2={y + head / 2} stroke={T.hair} strokeWidth={T.stroke.hair} />
          </>
        ) : null}
        {qp > 0 ? (<><rect {...ra} fill={T.fill} fillOpacity={qp} stroke={T.line} strokeWidth={T.stroke.line} {...pen(qp)} /><line x1={ra.x + ra.width - 150} y1={ra.y + 46} x2={ra.x + ra.width - 30} y2={ra.y + 46} stroke={T.hair} strokeWidth={T.stroke.hair} opacity={qp} /></>) : null}
        {ap > 0 ? (<g opacity={ap}><rect {...rb} fill="none" stroke={T.line} strokeWidth={T.stroke.hair + 1} strokeDasharray="12 9" /><line x1={rb.x + 30} y1={rb.y + 46} x2={rb.x + rb.width - 30} y2={rb.y + 46} stroke={T.hair} strokeWidth={T.stroke.hair} /></g>) : null}
        {fp > 0 ? <rect x={rb.x - 16} y={rb.y - 14} width={rb.width + 32} height={rb.height + 28} rx={18} fill="none" stroke={T.orange} strokeWidth={T.stroke.accent} {...pen(fp)} /> : null}
      </Svg>
      {fig.ask ? <div style={{ ...figText(L.FIELD_PX, T.weight.body, T.ink), left: ra.x + 28, top: ra.y + 18, opacity: fadeP(f, (t.askAt ?? fig.at) + 4) }}>{fig.ask}</div> : null}
      {fig.side ? <div style={{ ...figText(L.LABEL_PX, T.weight.bold, T.ink), left: x + w + 28, top: rb.y - 6, opacity: fadeP(f, (t.frameAt ?? fig.at) + 6) }}>{fig.side}</div> : null}
    </>
  );
};

/** 一碗麵：碗、麵、筷子的線稿依序描出來，熱氣慢慢往上，辣椒是橘色的點 */
const Bowl: React.FC<{ fig: TqFigure; f: number }> = ({ fig, f }) => {
  const t = fig.times, cx = L.INNER_W / 2, rim = 330, rxr = 214, ground = 540;
  const bp = drawP(f, fig.at, M.draw * 1.6), np = drawP(f, fig.at + M.draw, M.draw * 1.6), sp = drawP(f, t.steamAt ?? fig.at, M.draw * 2.4), chAt = t.chiliAt ?? fig.at;
  const body = `M ${cx - rxr} ${rim} C ${cx - rxr + 8} ${rim + 112}, ${cx - 150} ${rim + 178}, ${cx - 104} ${rim + 178} L ${cx + 104} ${rim + 178} C ${cx + 150} ${rim + 178}, ${cx + rxr - 8} ${rim + 112}, ${cx + rxr} ${rim}`;
  const noodle = (dy: number, amp: number) => `M ${cx - 150} ${rim + dy} C ${cx - 90} ${rim + dy - amp}, ${cx - 50} ${rim + dy + amp}, ${cx} ${rim + dy} S ${cx + 100} ${rim + dy - amp}, ${cx + 150} ${rim + dy}`;
  const drift = Math.sin((f - (t.steamAt ?? fig.at)) / 26) * 5; // 熱氣很慢地左右晃（固定函式，不是隨機）
  const steam = (sx: number, k: number) => `M ${sx} ${rim - 62} c ${-20 + drift * (k % 2 ? -1 : 1)} -34, ${22 - drift} -62, 0 -96 s ${-18 + drift} -58, 4 -92`;
  const chili: [number, number, number][] = [[-70, 2, -24], [10, -10, 18], [84, 4, -12]];
  return (
    <Svg>
      <Ground y={ground} p={drawP(f, fig.at, M.draw)} x0={120} x1={L.INNER_W - 120} />
      {bp > 0 ? (
        <>
          <rect x={cx - 84} y={rim + 178} width={168} height={ground - rim - 181} rx={8} fill={T.fillB} fillOpacity={bp} stroke={T.line} strokeWidth={T.stroke.line} {...pen(bp)} />
          <path d={`${body} Z`} fill={T.fill} fillOpacity={bp} stroke="none" />
          <path d={body} fill="none" stroke={T.line} strokeWidth={T.stroke.line} {...pen(bp)} />
          <ellipse cx={cx} cy={rim} rx={rxr} ry={40} fill={T.fillB} fillOpacity={bp} stroke={T.line} strokeWidth={T.stroke.line} {...pen(bp)} />
        </>
      ) : null}
      {np > 0 ? (
        <>
          {[[-12, 12], [4, -12], [18, 10]].map(([dy, amp], k) => <path key={k} d={noodle(dy, amp)} fill="none" stroke={T.line} strokeWidth={T.stroke.hair + 1} {...pen(Math.min(1, Math.max(0, np * 1.6 - k * 0.3)))} />)}
          <path d={`M ${cx + 96} ${rim - 4} L ${cx + 292} ${rim - 132}`} fill="none" stroke={T.line} strokeWidth={T.stroke.line + 2} {...pen(np)} />
          <path d={`M ${cx + 120} ${rim + 8} L ${cx + 316} ${rim - 116}`} fill="none" stroke={T.line} strokeWidth={T.stroke.line + 2} {...pen(np)} />
        </>
      ) : null}
      {sp > 0 ? [-88, -8, 72].map((dx, k) => <path key={k} d={steam(cx + dx, k)} fill="none" stroke={T.hair} strokeWidth={T.stroke.line} {...pen(Math.min(1, Math.max(0, sp * 1.5 - k * 0.25)))} />) : null}
      {chili.map(([dx, dy, rot], k) => { const p = fadeP(f, chAt + k * M.markStagger, M.mark); return p > 0 ? <rect key={k} x={cx + dx - 17} y={rim + dy - 7} width={34} height={14} rx={7} fill={T.orange} opacity={p} transform={`rotate(${rot} ${cx + dx} ${rim + dy})`} /> : null; })}
    </Svg>
  );
};

/** 結尾：大的太陽雲朵（雲先描、太陽再出來），下面一行小字加箭頭 */
/** 片尾 LOGO 動畫（figure.rise: true）：雲先一筆描出來（雲內填紙色）→ 太陽從雲後面慢慢升起 → 三道光一道一道畫出來 → 「談晴說礙」一個字一個字寫上去 → 太陽很輕地呼吸。安靜、不閃 */
const RiseMark: React.FC<{ fig: TqFigure; f: number; name: string }> = ({ fig, f, name }) => {
  const t = fig.times, size = 400, sunAt = t.sunAt ?? fig.at, wordAt = t.wordAt ?? sunAt + 26, lineAt = t.lineAt ?? wordAt + 20;
  const cloud = drawP(f, fig.at, M.draw * 2), rise = tween(f, sunAt, M.draw * 2.2, EASE.move), sunP = drawP(f, sunAt, M.draw * 1.4);
  const rays = drawP(f, sunAt + M.draw * 1.6, M.draw * 1.6), breath = f > sunAt + 40 ? 1 + 0.018 * Math.sin((f - sunAt - 40) / 9) : 1;
  return (
    <>
      <div style={{ position: "absolute", left: (L.INNER_W - size) / 2 - 20, top: 0 }}>
        <svg width={size} height={size} viewBox="-150 -200 340 340" style={{ display: "block", overflow: "visible" }}>
          <defs><clipPath id="tqRiseClip"><rect x={-200} y={-300} width={500} height={410} /></clipPath></defs>
          <g clipPath="url(#tqRiseClip)">
            <g transform={`translate(0 ${(150 * (1 - rise)).toFixed(1)}) translate(61 -8) scale(${breath.toFixed(4)}) translate(-61 8)`}>
              {sunP > 0 ? <path d={SUN_ARC} fill="none" stroke={T.orange} strokeWidth={22} {...pen(sunP)} /> : null}
              {RAYS.map((d, k) => { const p = Math.min(1, Math.max(0, rays * 3 - k)); return p > 0 ? <path key={k} d={d} fill="none" stroke={T.orange} strokeWidth={18} {...pen(p)} /> : null; })}
            </g>
          </g>
          {cloud > 0 ? <path d={CLOUD} fill={T.fill} fillOpacity={Math.min(1, cloud * 1.5)} stroke={T.line} strokeWidth={22} {...pen(cloud)} /> : null}
        </svg>
      </div>
      <div style={{ position: "absolute", left: 0, width: L.INNER_W, top: 392, display: "flex", justifyContent: "center", fontFamily: SERIF, fontWeight: T.weight.mark, fontSize: 84, letterSpacing: "0.16em", lineHeight: 1 }}>
        {[...name].map((c, i) => { const p = fadeP(f, wordAt + i * 5, 10); return <span key={i} style={{ opacity: p, transform: `translateY(${r1(14 * (1 - p))}px)`, display: "inline-block", color: c === "晴" ? T.qing : c === "礙" ? T.ai : T.ink }}>{c}</span>; })}
      </div>
      {fig.line ? <div style={{ position: "absolute", left: 0, width: L.INNER_W, top: 512, textAlign: "center", opacity: fadeP(f, lineAt) }}><span style={{ ...figText(L.LABEL_PX, T.weight.body, T.ink2), position: "relative" }}>{fig.line}</span></div> : null}
    </>
  );
};

const Mark: React.FC<{ fig: TqFigure; f: number }> = ({ fig, f }) => {
  if (fig.rise) return <RiseMark fig={fig} f={f} name={String(fig.name ?? "談晴說礙")} />;
  const t = fig.times, size = 420;
  const lineAt = t.lineAt ?? fig.at;
  return (
    <>
      <div style={{ position: "absolute", left: (L.INNER_W - size) / 2 - 20, top: 20 }}>
        <SunCloud size={size} cloud={drawP(f, fig.at, M.draw * 2.4)} sun={drawP(f, t.sunAt ?? fig.at, M.draw * 2)} rays={drawP(f, (t.sunAt ?? fig.at) + M.draw * 1.6, M.draw * 1.6)} />
      </div>
      {fig.line ? (
        <div style={{ position: "absolute", left: 0, width: L.INNER_W, top: 500, display: "flex", justifyContent: "center", alignItems: "center", gap: 18, opacity: fadeP(f, lineAt) }}>
          <div style={{ ...figText(L.LABEL_PX, T.weight.body, T.ink2), position: "relative" }}>{fig.line}</div>
          {fig.arrow === false ? null : <svg width={44} height={28} viewBox="0 0 44 28"><path d="M 3 14 H 39 M 28 4 L 39 14 L 28 24" fill="none" stroke={T.ink2} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" /></svg>}
        </div>
      ) : null}
    </>
  );
};

const Figure: React.FC<{ fig?: TqFigure; f: number }> = ({ fig, f }) => {
  if (!fig) return null;
  const el = fig.type === "people" ? <People fig={fig} f={f} /> : fig.type === "form" ? <Form fig={fig} f={f} /> : fig.type === "bowl" ? <Bowl fig={fig} f={f} /> : fig.type === "mark" ? <Mark fig={fig} f={f} /> : FILM_FIGURES[fig.type] ? React.createElement(FILM_FIGURES[fig.type], { fig, f }) : null;
  // figure.scale（選填，預設 1）：9:16 比貼文高，圖可以整個放大（以圖區中心為準）
  const sc = typeof fig.scale === "number" ? fig.scale : 1;
  return sc === 1 ? el : <div style={{ position: "absolute", left: 0, top: 0, width: L.INNER_W, height: L.FIG_H, transform: `scale(${sc})`, transformOrigin: "50% 50%" }}>{el}</div>;
};

/** 一頁：圖區＋襯線大標＋橘色一句。換頁＝舊頁往左平移淡出、新頁從右邊平移淡入；整頁極慢推近 */
type Lay = { FIG_TOP: number; FIG_H: number; FIG_SCALE: number; TITLE_TOP: number; TITLE_PX: number; CAP_TOP: number; CAP_ZH_PX: number; CAP_EN_PX: number; SRC_TOP: number; PAGER_Y: number };
const LAY0: Lay = { FIG_TOP: L.FIG_TOP, FIG_H: L.FIG_H, FIG_SCALE: 1, TITLE_TOP: L.TITLE_TOP, TITLE_PX: L.TITLE_PX, CAP_TOP: L.CAP_TOP, CAP_ZH_PX: L.CAP_ZH_PX, CAP_EN_PX: L.CAP_EN_PX, SRC_TOP: L.SRC_TOP, PAGER_Y: L.PAGER_Y };
/** script.json 頂層 tanqing.fill: true（2026/11/15 版面規則「不留大片空白」）：圖放大、大標加大往下、字幕與出處往下，底部加一條紙帶；沒寫的片（short-talk）照舊 */
const LAY_FILL: Lay = { ...LAY0, ...L.FILL };
const Page: React.FC<{ pg: TqPage; f: number; first: boolean; last: boolean; lay?: Lay }> = ({ pg, f, first, last, lay = LAY0 }) => {
  if (f < pg.start || f >= pg.end + M.panOut) return null;
  // 舊頁先淡出（panOut 幀），新頁等它走完才進來，兩頁的字不會疊在一起
  const pin = first ? 1 : tween(f, pg.start + M.panOut, M.pan, EASE.enter), pout = last ? 0 : tween(f, pg.end - 2, M.panOut, EASE.exit);
  const dx = (1 - pin) * M.panPx - pout * M.panPx;
  const life = Math.max(1, pg.end - pg.start), s = 1 + M.push * linear(f, pg.start, life);
  const tp = pg.titleAt <= pg.start ? 1 : fadeP(f, pg.titleAt);
  const titleH = pg.title.length * lay.TITLE_PX * L.TITLE_LH;
  return (
    <div style={{ position: "absolute", left: 0, top: 0, width: L.W, height: L.H, opacity: Math.min(pin, 1 - pout), transform: `translateX(${r1(dx)}px) scale(${s.toFixed(4)})`, transformOrigin: "50% 42%" }}>
      <div style={{ position: "absolute", left: L.X, top: lay.FIG_TOP, width: L.INNER_W, height: L.FIG_H, transform: lay.FIG_SCALE !== 1 ? `scale(${lay.FIG_SCALE})` : undefined, transformOrigin: "50% 40%" }}><Figure fig={pg.figure} f={f} /></div>
      <div style={{ position: "absolute", left: L.X, top: lay.TITLE_TOP, width: L.INNER_W, opacity: tp, fontFamily: SERIF, fontWeight: T.weight.title, fontSize: lay.TITLE_PX, lineHeight: L.TITLE_LH, color: T.ink, whiteSpace: "nowrap" }}>
        {pg.title.map((line, i) => <div key={i}>{[...line].map((c, j) => <span key={j} style={c === "晴" ? { color: T.qing } : c === "礙" ? { color: T.ai } : undefined}>{c}</span>)}</div>)}
      </div>
      {pg.note ? <div style={{ position: "absolute", left: L.X, top: lay.TITLE_TOP + titleH + L.NOTE_GAP, fontFamily: FONT_ZH, fontWeight: T.weight.bold, fontSize: L.NOTE_PX, lineHeight: 1.3, color: T.orangeText, whiteSpace: "nowrap", opacity: fadeP(f, pg.note.at) }}>{pg.note.text}</div> : null}
    </div>
  );
};

type Cap = { en: string; zh: boolean; window: [number, number]; phrases: { text: string; start: number }[] };
const enSplit = (en: string) => String(en ?? "").split("|").map((x) => x.trim()).filter(Boolean);
/** 字幕：照貼文內文的樣式（黑體、靠左），中文一次一段、英文跟著換 */
const Caption: React.FC<{ cues: Cap[]; f: number; lay?: Lay }> = ({ cues, f, lay = LAY0 }) => {
  const cue = cues.find((c) => f >= c.window[0] && f < c.window[1]);
  if (!cue || !cue.phrases.length) return null;
  let k = 0; cue.phrases.forEach((p, i) => { if (f >= p.start) k = i; });
  const zh = cue.phrases[k].text.replace(/[，、；：]$/, "");
  const en = enSplit(cue.en); const ek = Math.min(en.length - 1, Math.floor((k * en.length) / cue.phrases.length));
  const from = Math.max(cue.window[0], cue.phrases[k].start);
  const o = from === 0 ? 1 : tween(f, from, M.cap, EASE.enter); // 第 0 幀的字幕直接在
  return (
    <div style={{ position: "absolute", left: L.X, width: L.INNER_W, top: lay.CAP_TOP, opacity: o }}>
      {cue.zh ? <div style={{ fontFamily: FONT_ZH, fontWeight: T.weight.body, fontSize: lay.CAP_ZH_PX, lineHeight: 1.3, color: T.ink, whiteSpace: "nowrap" }}>{zh}</div> : null}
      {en[ek] ? <div style={{ marginTop: cue.zh ? 12 : 0, fontFamily: FONT_EN, fontWeight: T.weight.en, fontSize: lay.CAP_EN_PX, color: T.ink2, whiteSpace: "nowrap" }}>{en[ek]}</div> : null}
    </div>
  );
};

/** 左下資料來源（兩行以內） */
const SourceLine: React.FC<{ pages: TqPage[]; f: number; lay?: Lay }> = ({ pages, f, lay = LAY0 }) => (
  <>
    {pages.map((pg, i) => {
      if (!pg.sources.length || f < pg.start || f >= pg.end + M.fade) return null;
      const o = (i === 0 ? 1 : fadeP(f, pg.start + M.panOut)) * (i === pages.length - 1 ? 1 : 1 - tween(f, pg.end - 2, M.panOut, EASE.exit));
      return <div key={pg.id} style={{ position: "absolute", left: L.X, width: L.SRC_W, top: lay.SRC_TOP, opacity: o, fontFamily: FONT_ZH, fontWeight: T.weight.body, fontSize: L.SRC_PX, lineHeight: 1.4, color: T.ink2, whiteSpace: "pre" }}>{pg.sources.slice(0, 2).join("\n")}</div>;
    })}
  </>
);

/** 右下頁碼：小太陽在目前這一頁，其他是圓點；不是最後一頁時右邊有箭頭 */
const Pager: React.FC<{ pages: TqPage[]; f: number; lay?: Lay }> = ({ pages, f, lay = LAY0 }) => {
  const n = pages.length, gap = n > 8 ? Math.max(14, Math.floor(300 / (n - 1))) : L.PAGER_GAP, dotR = n > 8 ? 4.5 : 7; // 頁數多（完整片）時把間距與圓點縮小，不壓到左下的出處
  let pos = 0; pages.forEach((pg, i) => { if (i > 0) pos += tween(f, pg.start, M.pan, EASE.move); });
  const w = (n - 1) * gap + 80, x0 = 22, cy = 22, sx = x0 + pos * gap;
  const arrow = 1 - Math.max(0, pos - (n - 2));
  return (
    <svg width={w} height={44} viewBox={`0 0 ${w} 44`} style={{ position: "absolute", left: L.W - L.X - w, top: lay.PAGER_Y - cy, overflow: "visible" }}>
      {pages.map((_, k) => <circle key={k} cx={x0 + k * gap} cy={cy} r={dotR} fill={T.dot} opacity={Math.min(1, Math.abs(pos - k))} />)}
      <g transform={`translate(${r1(sx)} ${cy}) rotate(${r1(pos * 45)})`}>
        <circle r={9} fill={T.orange} />
        {Array.from({ length: 8 }, (_, k) => { const a = (k * Math.PI) / 4; return <line key={k} x1={r1(13 * Math.cos(a))} y1={r1(13 * Math.sin(a))} x2={r1(19 * Math.cos(a))} y2={r1(19 * Math.sin(a))} stroke={T.orange} strokeWidth={3} strokeLinecap="round" />; })}
      </g>
      {arrow > 0 ? <path d={`M ${x0 + (n - 1) * gap + 26} ${cy} h 24 m -9 -8 l 9 8 l -9 8`} fill="none" stroke={T.line} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" opacity={arrow} /> : null}
    </svg>
  );
};

/** 上下紙帶（fill 模式）：上方淡淡的橫格線紙、下方一條米色厚紙帶＋一排小圓點慢慢往右走（平台介面區只放裝飾） */
const Bands: React.FC<{ f: number }> = ({ f }) => {
  const b = L.FILL.BAND_TOP;
  return (
    <svg width={L.W} height={L.H} style={{ position: "absolute", left: 0, top: 0 }}>
      {[60, 100, 140, 180].map((y) => <line key={y} x1={L.X} y1={y} x2={L.W - L.X} y2={y} stroke={T.hair} strokeWidth={T.stroke.hair} opacity={0.55} />)}
      <path d={`M0 ${b} ${Array.from({ length: 28 }, (_, k) => `L ${((k + 1) * L.W) / 28} ${b + (k % 2 ? 5 : -3)}`).join(" ")} L ${L.W} ${L.H} L 0 ${L.H} Z`} fill={T.fillB} />
      <line x1={L.X} y1={b + 34} x2={L.W - L.X} y2={b + 34} stroke={T.hair} strokeWidth={T.stroke.hair} strokeDasharray="10 12" strokeDashoffset={-f * 0.4} />
      {Array.from({ length: 9 }, (_, k) => <circle key={k} cx={L.X + 60 + k * 96 + 6 * Math.sin(f / 30 + k)} cy={b + 96 + (k % 2) * 26} r={k % 3 === 1 ? 7 : 5} fill={k === 4 ? T.orange : T.dot} opacity={0.8} />)}
    </svg>
  );
};

const Paper: React.FC = () => <AbsoluteFill style={{ background: `radial-gradient(ellipse 80% 62% at 50% 42%, ${T.bgCenter} 0%, ${T.bg} 55%, ${T.bgEdge} 100%)` }} />;

export const VideoTanqing: React.FC<Script & { timeline: TimelineV2 }> = (props) => {
  const { scenes, timeline, channel } = props;
  const fill = (props as any).tanqing?.fill === true, lay = fill ? LAY_FILL : LAY0;
  useSerif();
  const f = useCurrentFrame();
  const m = useMemo(() => buildTanqing(scenes, timeline), [scenes, timeline]);
  const by = Object.fromEntries(timeline.scenes.map((x) => [x.id, x]));
  const ordered = scenes.filter((s) => by[s.id]);
  const caps: Cap[] = ordered.filter((s) => by[s.id].subtitleWindow).map((s) => ({ en: s.subtitle.en, zh: (s.props as any)?.caption !== "en", window: by[s.id].subtitleWindow as [number, number], phrases: by[s.id].lines }));
  return (
    <AbsoluteFill style={{ background: T.bg }}>
      <Paper />
      {fill ? <Bands f={f} /> : null}
      {m.pages.map((pg, i) => <Page key={pg.id} pg={pg} f={f} first={i === 0} last={i === m.pages.length - 1} lay={lay} />)}
      <Wordmark name={channel?.name ?? "談晴說礙"} />
      <Caption cues={caps} f={f} lay={lay} />
      <SourceLine pages={m.pages} f={f} lay={lay} />
      <Pager pages={m.pages} f={f} lay={lay} />
      {timeline.voice ? <Audio src={staticFile(timeline.voice.file)} /> : timeline.scenes.filter((t) => t.audio).map((t) => (
        <Sequence key={`${t.id}-audio`} from={t.audioFrame} durationInFrames={Math.ceil(t.audioSec * FPS) + 1} name={`${t.id}-audio`} layout="none"><Audio src={staticFile(t.audio as string)} /></Sequence>
      ))}
    </AbsoluteFill>
  );
};

/** 封面：第一頁畫完的樣子（字標、圖、大標）＋頻道 slogan */
export const CoverTanqing: React.FC<Script> = (props) => {
  const { scenes, cover, channel } = props;
  const fill = (props as any).tanqing?.fill === true, lay = fill ? LAY_FILL : LAY0;
  useSerif();
  const c = (cover ?? {}) as { title?: string[]; sub?: string };
  const pg = staticPage(scenes[0]);
  if (c.title?.length) pg.title = c.title;
  const pages = scenes.map((s, i) => staticPage(s, i));
  return (
    <AbsoluteFill style={{ background: T.bg }}>
      <Paper />
      {fill ? <Bands f={0} /> : null}
      <Page pg={pg} f={0} first last lay={lay} />
      <Wordmark name={channel?.name ?? "談晴說礙"} />
      {c.sub ? <div style={{ position: "absolute", left: L.X, top: lay.CAP_TOP, fontFamily: FONT_ZH, fontWeight: T.weight.body, fontSize: lay.CAP_ZH_PX, color: T.ink2, whiteSpace: "nowrap" }}>{c.sub}</div> : null}
      <SourceLine pages={[pg]} f={0} lay={lay} />
      <Pager pages={pages.map((p) => ({ ...p, start: -9999 }))} f={-99999} lay={lay} />
    </AbsoluteFill>
  );
};

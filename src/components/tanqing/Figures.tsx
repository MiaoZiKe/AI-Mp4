// 談晴說礙完整片（script.json 頂層 tanqing.film: true，第一支 videos/talk-ep01/）多出來的線稿圖形。
// 都照頻道貼文的畫法：灰線稿、白／米兩種填色、一個橘色重點；一筆一筆描、字用淡入，不彈跳。
// 圖區是 888×620（LAYOUT_TANQING.INNER_W × FIG_H）；時間來自 engine.ts 解析好的 fig.times（cue id ± 幀）。
// 圖表只畫 script.json 寫的資料點（每張資料圖都有 claim 指到 research.md）；縱軸不是從 0 開始的折線一定標刻度。
import React from "react";
import { FONT_EN, FONT_ZH, LAYOUT_TANQING as L, THEME_TANQING as T } from "../../theme";
import type { TqFigure } from "./engine";
import { Ground, Svg, backOut, countText, drawP, fadeP, figText, pen, useV5 } from "./TanqingVideo";

const M = T.motion;
const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const numStyle = (px: number, color: string = T.ink): React.CSSProperties => ({ position: "absolute", fontFamily: FONT_EN, fontWeight: T.weight.num, fontSize: px, lineHeight: 1, letterSpacing: "-0.02em", color, whiteSpace: "pre" });
const SMALL = L.MIN_PX;

/** 左上的大數字＋旁邊兩行說明（和 people 的寫法一樣） */
/** v5：數字從 0 往上數（count 從 at 開始、countDur 幀；第 0 頁 at≤0 時直接是完整數字） */
const BigNum: React.FC<{ number?: { text: string; note?: string }; f?: number; at?: number }> = ({ number, f = 0, at = -9999 }) => { const v5 = useV5(); return !number ? null : (
  <div style={{ position: "absolute", left: 0, top: 0, display: "flex", alignItems: "center", gap: 34 }}>
    <div style={{ fontFamily: FONT_EN, fontWeight: T.weight.num, fontSize: L.NUM_PX, lineHeight: 1, letterSpacing: "-0.02em", color: T.ink, fontVariantNumeric: "tabular-nums" }}>{v5 && at > 0 ? countText(number.text, 1 - Math.pow(1 - clamp01((f - at) / 28), 3)) : number.text}</div>
    {number.note ? <div style={{ ...figText(L.NUM_NOTE_PX, T.weight.body, T.ink2), position: "relative", lineHeight: 1.4 }}>{number.note}</div> : null}
  </div>
); };

/** 一扇窗：sky "night"＝玻璃暗下來、橘色的月亮、窗外幾棟亮燈的樓；"dusk"＝橘色的太陽還在山線上面 */
const Window: React.FC<{ fig: TqFigure; f: number }> = ({ fig, f }) => {
  const t = fig.times, has = !!fig.number;
  const ww = 460, wh = has ? 300 : 400, wx = (L.INNER_W - ww) / 2, wy = has ? 262 : 96, cx = wx + ww / 2, my = wy + wh * 0.46;
  const fp = drawP(f, fig.at, M.draw * 1.6), skyAt = t.skyAt ?? fig.at, sp = fadeP(f, skyAt, M.fade * 1.5), mp = drawP(f, skyAt + 4, M.draw * 1.6), lp = t.lightAt ?? skyAt;
  const night = fig.sky !== "dusk";
  const frame = (stroke: string, w: number, q: number, fo: number) => (
    <>
      <rect x={wx} y={wy} width={ww} height={wh} rx={20} fill={T.fill} fillOpacity={fo} stroke={stroke} strokeWidth={w} {...pen(q)} />
      <path d={`M ${cx} ${wy} V ${wy + wh} M ${wx} ${my} H ${wx + ww}`} fill="none" stroke={stroke} strokeWidth={w} {...pen(q)} />
    </>
  );
  const moon = { x: wx + ww * 0.76, y: wy + (my - wy) * 0.5 };
  const blds: [number, number, number][] = [[wx + 44, 84, 96], [wx + 150, 60, 70], [cx + 40, 70, 110], [cx + 132, 76, 78]]; // x、寬、高（窗外的樓）
  const sun = { x: cx - 70, y: wy + wh * 0.6, r: 64 };
  const hill = `M ${wx + 4} ${wy + wh * 0.72} C ${wx + 120} ${wy + wh * 0.56}, ${cx - 20} ${wy + wh * 0.64}, ${cx + 40} ${wy + wh * 0.7} S ${wx + ww - 90} ${wy + wh * 0.6}, ${wx + ww - 4} ${wy + wh * 0.68}`;
  return (
    <>
      <Svg>
        <defs><clipPath id={`tqw-${fig.sky}`}><rect x={wx + 2} y={wy + 2} width={ww - 4} height={wh - 4} rx={18} /></clipPath></defs>
        <Ground y={wy + wh + 34} p={drawP(f, fig.at, M.draw)} x0={wx - 90} x1={wx + ww + 90} />
        {fig.ghost === false ? null : frame(T.hair, T.stroke.hair, 1, 0)}
        {fp > 0 ? frame(T.line, T.stroke.line, fp, fp) : null}
        <g clipPath={`url(#tqw-${fig.sky})`}>
          {night ? (
            <>
              {sp > 0 ? <rect x={wx} y={wy} width={ww} height={wh} fill={T.fillB} opacity={sp} /> : null}
              {blds.map(([bx, bw, bh], k) => {
                const p = drawP(f, lp + k * M.stagger, M.draw);
                return p <= 0 ? null : (
                  <g key={k}>
                    <rect x={bx} y={wy + wh - bh} width={bw} height={bh + 8} rx={8} fill={T.fill} fillOpacity={p} stroke={T.line} strokeWidth={T.stroke.hair + 1} {...pen(p)} />
                    {Array.from({ length: Math.floor((bh - 20) / 26) * 2 }, (_, j) => <rect key={j} x={bx + 14 + (j % 2) * (bw - 44)} y={wy + wh - bh + 16 + Math.floor(j / 2) * 26} width={16} height={12} rx={3} fill={T.hair} opacity={fadeP(f, lp + k * M.stagger + M.draw + j * 2)} />)}
                  </g>
                );
              })}
              {mp > 0 ? <path d={`M ${moon.x} ${moon.y - 46} A 46 46 0 1 0 ${moon.x} ${moon.y + 46} A 60 60 0 0 1 ${moon.x} ${moon.y - 46} Z`} fill={T.fill} fillOpacity={mp} stroke={T.orange} strokeWidth={T.stroke.accent} {...pen(mp)} /> : null}
              {[[0.16, 0.2], [0.34, 0.3], [0.6, 0.14]].map(([ax, ay], k) => <circle key={k} cx={wx + ww * ax} cy={wy + wh * ay} r={4} fill={T.line} opacity={fadeP(f, skyAt + 10 + k * 5)} />)}
            </>
          ) : (
            <>
              {mp > 0 ? <circle cx={sun.x} cy={sun.y} r={sun.r} fill={T.fill} fillOpacity={mp} stroke={T.orange} strokeWidth={T.stroke.accent} {...pen(mp)} transform={`rotate(-90 ${sun.x} ${sun.y})`} /> : null}
              {[-150, -120, -90, -60, -30].map((deg, k) => { const a = (deg * Math.PI) / 180, p = drawP(f, skyAt + M.draw + k * 3, M.draw); return p > 0 ? <path key={k} d={`M ${sun.x + 84 * Math.cos(a)} ${sun.y + 84 * Math.sin(a)} L ${sun.x + 112 * Math.cos(a)} ${sun.y + 112 * Math.sin(a)}`} fill="none" stroke={T.orange} strokeWidth={T.stroke.line} {...pen(p)} /> : null; })}
              {fp > 0 ? (<><path d={`${hill} V ${wy + wh} H ${wx + 4} Z`} fill={T.fillB} fillOpacity={fp} stroke="none" /><path d={hill} fill="none" stroke={T.line} strokeWidth={T.stroke.line} {...pen(fp)} /></>) : null}
            </>
          )}
        </g>
        {fp > 0 ? (
          <>
            <path d={`M ${cx} ${wy} V ${wy + wh} M ${wx} ${my} H ${wx + ww}`} fill="none" stroke={T.line} strokeWidth={T.stroke.line} {...pen(fp)} />
            <rect x={wx} y={wy} width={ww} height={wh} rx={20} fill="none" stroke={T.line} strokeWidth={T.stroke.line} {...pen(fp)} />
            <rect x={wx - 34} y={wy + wh + 6} width={ww + 68} height={20} rx={10} fill={T.fill} fillOpacity={fp} stroke={T.line} strokeWidth={T.stroke.line} {...pen(fp)} />
          </>
        ) : null}
      </Svg>
      <BigNum number={fig.number} f={f} at={fig.at} />
    </>
  );
};

/** 十二個月的膠囊一個一個描出來，下面一條橘色虛線把它們加起來：年總工時＝每月平均總工時 × 12 */
const Months: React.FC<{ fig: TqFigure; f: number }> = ({ fig, f }) => {
  const t = fig.times, pitch = 72, pw = 54, ph = 170, x0 = (L.INNER_W - (11 * pitch + pw)) / 2, top = 150, sumAt = t.sumAt ?? fig.at;
  const lp = drawP(f, sumAt, M.draw * 2.2);
  return (
    <>
      <Svg>
        <Ground y={top + ph + 3} p={drawP(f, fig.at, M.draw)} x0={x0 - 20} x1={x0 + 11 * pitch + pw + 20} />
        {Array.from({ length: 12 }, (_, k) => {
          const x = x0 + k * pitch, p = drawP(f, fig.at + k * (fig.stagger ?? 2));
          return (
            <g key={k}>
              <rect x={x} y={top} width={pw} height={ph} rx={pw / 2} fill="none" stroke={T.hair} strokeWidth={T.stroke.hair} />
              {p > 0 ? <rect x={x} y={top} width={pw} height={ph} rx={pw / 2} fill={k % 2 ? T.fillB : T.fill} fillOpacity={p} stroke={T.line} strokeWidth={T.stroke.line} {...pen(p)} /> : null}
            </g>
          );
        })}
        {lp > 0 ? <path d={`M ${x0 - 6} ${top + ph + 86} v 22 H ${x0 + 11 * pitch + pw + 6} v -22`} fill="none" stroke={T.orange} strokeWidth={T.stroke.line} {...pen(lp)} /> : null}
        {useV5() && lp > 0 ? <MonthFlow f={f} at={sumAt} x0={x0} x1={x0 + 11 * pitch + pw} y={top + ph + 108} /> : null}
      </Svg>
      {Array.from({ length: 12 }, (_, k) => <div key={k} style={{ ...figText(SMALL, T.weight.body, T.ink2), left: x0 + k * pitch, width: pw, textAlign: "center", top: top + ph + 26, opacity: fadeP(f, fig.at + k * (fig.stagger ?? 2) + 4) }}>{k + 1}</div>)}
      {fig.head ? <div style={{ ...figText(L.LABEL_PX, T.weight.bold, T.ink), left: x0, top: top - 86, opacity: fadeP(f, fig.at) }}>{fig.head}</div> : null}
      {fig.sum ? <div style={{ ...figText(L.FIELD_PX, T.weight.bold, T.ink), left: 0, width: L.INNER_W, textAlign: "center", top: top + ph + 132, opacity: fadeP(f, sumAt + M.draw) }}>{fig.sum}</div> : null}
    </>
  );
};

/** v5：十二個月沿著橘色括號往右「加進去」的光點流：密集、有拖尾、有方向；開始快，2 秒內慢慢減速停在右端（不是瞬間停） */
const MonthFlow: React.FC<{ f: number; at: number; x0: number; x1: number; y: number }> = ({ f, at, x0, x1, y }) => {
  const t = Math.max(0, f - at), run = 64, speed = (u: number) => (u >= run ? 0 : 1 - u / run); // 速度線性降到 0
  const travel = (u: number) => { const c = Math.min(u, run); return c - (c * c) / (2 * run); }; // 速度的積分
  const d = travel(t) * 26, W = x1 - x0, n = 14, gap = W / n;
  return (
    <g>
      {Array.from({ length: n }, (_, k) => {
        const x = x0 + ((k * gap + d) % W), sp = speed(t), tail = 10 + 46 * sp;
        const a = Math.min(1, t / 8) * (0.35 + 0.65 * sp) + (sp === 0 ? 0 : 0);
        return a <= 0.02 ? null : (
          <g key={k} opacity={a.toFixed(2)}>
            <line x1={Math.max(x0, x - tail)} y1={y} x2={x} y2={y} stroke={T.orange} strokeWidth={6} strokeLinecap="round" opacity={0.35} />
            <circle cx={x} cy={y} r={6} fill={T.orange} />
          </g>
        );
      })}
    </g>
  );
};

/** 一格一格的小方塊（一格＝一天）：先整片淡入，念到時前 mark 格依序轉成橘色，下面的數字跟著數 */
const Grid: React.FC<{ fig: TqFigure; f: number }> = ({ fig, f }) => {
  const n = fig.count as number, mark = fig.mark as number, cols = (fig.cols as number) ?? 28, rows = Math.ceil(n / cols);
  const pitch = Math.floor((L.INNER_W - 24) / cols), cell = pitch - 7, x0 = (L.INNER_W - ((cols - 1) * pitch + cell)) / 2, y0 = 6;
  const markAt = fig.times.markAt ?? fig.at, mp = clamp01((f - markAt) / 40), shown = Math.round(mp * mark);
  const by = y0 + rows * pitch + 18;
  return (
    <>
      <Svg>
        {Array.from({ length: n }, (_, k) => {
          const r = Math.floor(k / cols), c = k % cols, p = fadeP(f, fig.at + r * 2 + c * 0.4, 8), on = k < shown;
          return p <= 0 ? null : <rect key={k} x={x0 + c * pitch} y={y0 + r * pitch} width={cell} height={cell} rx={7} fill={on ? T.orange : k < mark ? T.fill : T.fillB} stroke={on ? T.orange : T.line} strokeWidth={T.stroke.hair} opacity={p} />;
        })}
      </Svg>
      <div style={{ position: "absolute", left: x0, top: by, display: "flex", alignItems: "baseline", gap: 18, opacity: fadeP(f, markAt) }}>
        <div style={{ fontFamily: FONT_EN, fontWeight: T.weight.num, fontSize: 112, lineHeight: 1, letterSpacing: "-0.02em", color: T.ink, minWidth: 196, fontVariantNumeric: "tabular-nums" }}>{shown}</div>
        <div style={{ ...figText(L.FIELD_PX, T.weight.bold, T.ink), position: "relative" }}>{fig.unit}</div>
      </div>
      {fig.note ? <div style={{ ...figText(SMALL, T.weight.body, T.ink2), right: L.INNER_W - (x0 + (cols - 1) * pitch + cell), top: by + 70, opacity: fadeP(f, fig.at + 10) }}>{fig.note}</div> : null}
    </>
  );
};

type Bar = { label: string; v: number; val?: string; mark?: boolean };
/** 直的線稿長條（從 0 開始畫）：一根一根長出來，標出來的那根填橘色；diff＝從第一根的頂畫一條橘色虛線到最後一根，旁邊兩行字 */
const Bars: React.FC<{ fig: TqFigure; f: number }> = ({ fig, f }) => {
  const bars = fig.bars as Bar[], n = bars.length, max = fig.max ?? Math.max(...bars.map((b) => b.v));
  const ground = 500, maxH = 372, bw = n > 2 ? 150 : 170, pitch = n > 2 ? 200 : 250, x0 = fig.diff ? (n > 2 ? 30 : 50) : (L.INNER_W - ((n - 1) * pitch + bw)) / 2;
  const v5 = useV5(), h = (b: Bar) => (b.v / max) * maxH, grow = (k: number) => v5 ? (f < fig.at + k * 9 ? 0 : backOut(clamp01((f - fig.at - k * 9) / 24), 0.9)) : drawP(f, fig.at + k * 9, 26);
  const diffAt = fig.times.diffAt ?? fig.at, dp = drawP(f, diffAt, M.draw * 1.8), yA = ground - h(bars[0]), yB = ground - h(bars[n - 1]), xr = x0 + (n - 1) * pitch + bw + 26;
  const lines = String(fig.diff?.text ?? "").split("\n");
  return (
    <>
      <Svg>
        <Ground y={ground} p={drawP(f, fig.at, M.draw)} x0={x0 - 30} x1={x0 + (n - 1) * pitch + bw + 30} />
        {bars.map((b, k) => { const g = grow(k), hh = h(b) * g, x = x0 + k * pitch; return g <= 0 ? null : <path key={k} d={`M ${x} ${ground - 2} V ${ground - hh + 16} a 16 16 0 0 1 16 -16 H ${x + bw - 16} a 16 16 0 0 1 16 16 V ${ground - 2} Z`} fill={b.mark ? T.orange : T.fill} stroke={b.mark ? T.orange : T.line} strokeWidth={T.stroke.line} strokeLinejoin="round" />; })}
        {fig.diff && dp > 0 ? (
          <>
            <line x1={x0 + bw + 8} y1={yA} x2={x0 + bw + 8 + (xr - x0 - bw - 8) * dp} y2={yA} stroke={T.orange} strokeWidth={T.stroke.line} strokeDasharray="16 12" />
            {dp >= 1 ? <path d={`M ${xr - 12} ${yA} H ${xr} V ${Math.max(yB, yA + 14)} H ${xr - 12}`} fill="none" stroke={T.orange} strokeWidth={T.stroke.line} strokeLinecap="round" strokeLinejoin="round" /> : null}
          </>
        ) : null}
      </Svg>
      {bars.map((b, k) => {
        const x = x0 + k * pitch, o = fadeP(f, fig.at + k * 9 + 16);
        return (
          <React.Fragment key={k}>
            {b.val ? <div style={{ ...numStyle(n > 2 ? 44 : 52), left: x - 40, width: bw + 80, textAlign: "center", top: ground - h(b) * (v5 ? Math.min(1, grow(k)) : 1) + 22, opacity: o, fontVariantNumeric: "tabular-nums" }}>{v5 ? countText(b.val, Math.min(1, grow(k))) : b.val}</div> : null}
            <div style={{ ...figText(L.LABEL_PX, T.weight.body, T.ink2), left: x - 40, width: bw + 80, textAlign: "center", top: ground + 28, opacity: fadeP(f, fig.at + k * 9) }}>{b.label}</div>
          </React.Fragment>
        );
      })}
      {fig.diff ? (
        <div style={{ position: "absolute", left: xr + 20, top: Math.max(0, (yA + yB) / 2 - 20), opacity: fadeP(f, diffAt + M.draw) }}>
          {lines.map((x, i) => <div key={i} style={{ ...figText(i ? 32 : L.LABEL_PX, i ? T.weight.body : T.weight.bold, i ? T.ink2 : T.ink), position: "relative", lineHeight: 1.4 }}>{x}</div>)}
        </div>
      ) : null}
    </>
  );
};

type Pt = { x: number; v: number; val?: string; mark?: boolean; tag?: string; dx?: number };
/** 線稿折線：只畫 points 寫的那幾個資料點；縱軸不從 0 開始，所以刻度（ticks）一定標出來。線描到哪裡，點和數字就出現到哪裡；標出來的點描一圈橘框 */
const Line: React.FC<{ fig: TqFigure; f: number }> = ({ fig, f }) => {
  const pts = fig.points as Pt[], px0 = 124, px1 = 800, py0 = 70, py1 = 440;
  const xMin = pts[0].x, xMax = pts[pts.length - 1].x;
  const X = (x: number) => px0 + ((x - xMin) / (xMax - xMin)) * (px1 - px0), Y = (v: number) => py1 - ((v - fig.yMin) / (fig.yMax - fig.yMin)) * (py1 - py0);
  const xy = pts.map((p) => [X(p.x), Y(p.v)] as const);
  const seg = xy.slice(1).map((p, i) => Math.hypot(p[0] - xy[i][0], p[1] - xy[i][1])), total = seg.reduce((a, b) => a + b, 0);
  const frac = xy.map((_, i) => seg.slice(0, i).reduce((a, b) => a + b, 0) / total);
  const dur = fig.dur ?? 44, lp = drawP(f, fig.at + 6, dur), markAt = fig.times.markAt ?? fig.at;
  const hit = (i: number) => fig.at + 6 + frac[i] * dur; // 線大約在這一幀碰到第 i 個點（ease 過，差幾幀沒關係）
  return (
    <>
      <Svg>
        {(fig.ticks as number[] ?? []).map((v) => <line key={v} x1={px0 - 24} y1={Y(v)} x2={px1 + 40} y2={Y(v)} stroke={T.hair} strokeWidth={T.stroke.hair} strokeDasharray="6 8" opacity={fadeP(f, fig.at)} />)}
        <Ground y={py1 + 40} p={drawP(f, fig.at, M.draw)} x0={px0 - 24} x1={px1 + 40} />
        {lp > 0 ? <path d={`M ${xy.map((p) => `${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(" L ")}`} fill="none" stroke={T.line} strokeWidth={T.stroke.line + 1} {...pen(lp)} /> : null}
        {xy.map((p, i) => { const o = fadeP(f, hit(i) - 2, 6); return o > 0 ? <circle key={i} cx={p[0]} cy={p[1]} r={10} fill={T.fill} stroke={T.line} strokeWidth={T.stroke.line} opacity={o} /> : null; })}
        {xy.map((p, i) => { const q = pts[i].mark ? drawP(f, Math.max(markAt, hit(i)), M.draw * 1.4) : 0; return q > 0 ? <circle key={`m${i}`} cx={p[0]} cy={p[1]} r={24} fill="none" stroke={T.orange} strokeWidth={T.stroke.accent} {...pen(q)} transform={`rotate(-90 ${p[0]} ${p[1]})`} /> : null; })}
      </Svg>
      {(fig.ticks as number[] ?? []).map((v) => <div key={v} style={{ ...figText(SMALL, T.weight.body, T.ink2), left: 0, width: px0 - 34, textAlign: "right", top: Y(v) - 18, opacity: fadeP(f, fig.at) }}>{v.toLocaleString("en-US")}</div>)}
      {(fig.xTicks as number[] ?? []).map((x) => <div key={x} style={{ ...figText(30, T.weight.body, T.ink2), left: X(x) - 60, width: 120, textAlign: "center", top: py1 + 60, opacity: fadeP(f, fig.at) }}>{x}</div>)}
      {pts.map((p, i) => p.val ? <div key={i} style={{ ...numStyle(42), left: Math.min(xy[i][0] - 100 + (p.dx ?? 0), L.INNER_W - 200), width: 200, textAlign: "center", top: xy[i][1] - 76, opacity: fadeP(f, hit(i)) }}>{p.val}</div> : null)}
      {pts.map((p, i) => p.tag ? <div key={`t${i}`} style={{ ...figText(L.LABEL_PX, T.weight.bold, T.ink), left: Math.min(xy[i][0] - 120, L.INNER_W - 240), width: 240, textAlign: "center", top: xy[i][1] + 36, opacity: fadeP(f, Math.max(markAt, hit(i)) + 8) }}>{p.tag}</div> : null)}
      {fig.note ? <div style={{ ...figText(SMALL, T.weight.body, T.ink2), left: px0 - 24, top: py1 + 116, opacity: fadeP(f, fig.at + 6) }}>{fig.note}</div> : null}
    </>
  );
};

/** 一週七格：上班的幾天是實線膠囊，其他是虛線；上面一條橘色虛線把上班日框起來 */
const Week: React.FC<{ fig: TqFigure; f: number }> = ({ fig, f }) => {
  const days = (fig.days as number) ?? 5, pitch = 116, pw = 88, x0 = (L.INNER_W - (6 * pitch + pw)) / 2, top = 170, ph = 290, labelAt = fig.times.labelAt ?? fig.at;
  const lp = drawP(f, labelAt, M.draw * 2), lx1 = x0 + (days - 1) * pitch + pw + 10;
  return (
    <>
      <Svg>
        <Ground y={top + ph + 3} p={drawP(f, fig.at, M.draw)} x0={x0 - 20} x1={x0 + 6 * pitch + pw + 20} />
        {Array.from({ length: 7 }, (_, k) => {
          const x = x0 + k * pitch, p = k < days ? drawP(f, fig.at + k * (fig.stagger ?? M.stagger)) : 0;
          return (
            <g key={k}>
              <rect x={x} y={top} width={pw} height={ph} rx={pw / 2} fill="none" stroke={T.hair} strokeWidth={T.stroke.hair} strokeDasharray={k < days ? undefined : "10 9"} />
              {p > 0 ? (
                <>
                  <rect x={x} y={top} width={pw} height={ph} rx={pw / 2} fill={T.fill} fillOpacity={p} stroke={T.line} strokeWidth={T.stroke.line} {...pen(p)} />
                  {[0.3, 0.5, 0.7].map((q) => <line key={q} x1={x + 24} y1={top + ph * q} x2={x + pw - 24} y2={top + ph * q} stroke={T.hair} strokeWidth={T.stroke.hair} opacity={p} />)}
                </>
              ) : null}
            </g>
          );
        })}
        {lp > 0 ? <line x1={x0 - 10} y1={top - 38} x2={x0 - 10 + (lx1 - x0 + 10) * lp} y2={top - 38} stroke={T.orange} strokeWidth={T.stroke.line} strokeDasharray="16 12" /> : null}
      </Svg>
      {[..."一二三四五六日"].map((c, k) => <div key={k} style={{ ...figText(L.LABEL_PX, T.weight.body, T.ink2), left: x0 + k * pitch, width: pw, textAlign: "center", top: top + ph + 28, opacity: fadeP(f, fig.at + k * 2) }}>{c}</div>)}
      {fig.label ? <div style={{ ...figText(L.LABEL_PX, T.weight.bold, T.ink), left: lx1 + 18, top: top - 38 - L.LABEL_PX * 0.66, opacity: fadeP(f, labelAt + M.draw) }}>{fig.label}</div> : null}
    </>
  );
};

type Side = { name: string; mark: number; half?: number; val: string; note?: string };
/** 兩塊 10×10 的小格子並排（一格＝一百人裡的一個）：各自把 mark 格填成橘色，half 格是橘色虛線（不滿一格） */
const Pair: React.FC<{ fig: TqFigure; f: number }> = ({ fig, f }) => {
  const pitch = 33, cell = 25, gw = 9 * pitch + cell, y0 = 96, t = fig.times;
  const side = (s: Side, x0: number, markAt: number, key: string) => {
    const mp = clamp01((f - markAt) / Math.max(10, Math.min(30, s.mark * 2))), shown = Math.round(mp * s.mark), hp = fadeP(f, markAt + 12);
    return (
      <React.Fragment key={key}>
        <Svg>
          {Array.from({ length: 100 }, (_, k) => {
            const r = Math.floor(k / 10), c = k % 10, p = fadeP(f, fig.at + r * 2 + c, 8), on = k < shown, half = !on && k >= s.mark && k < s.mark + (s.half ?? 0) && hp > 0;
            return p <= 0 ? null : <rect key={k} x={x0 + c * pitch} y={y0 + r * pitch} width={cell} height={cell} rx={8} fill={on ? T.orange : T.fill} stroke={on || half ? T.orange : T.line} strokeWidth={half ? T.stroke.hair + 1 : T.stroke.hair} strokeDasharray={half ? "5 4" : undefined} opacity={p} />;
          })}
        </Svg>
        <div style={{ ...figText(L.FIELD_PX, T.weight.bold, T.ink), left: x0, top: y0 - 78, opacity: fadeP(f, fig.at) }}>{s.name}</div>
        {s.note ? <div style={{ ...figText(L.LABEL_PX, T.weight.body, T.ink2), left: x0 + L.FIELD_PX * s.name.length + 18, top: y0 - 78 + (L.FIELD_PX - L.LABEL_PX) * 0.7, whiteSpace: "nowrap", opacity: fadeP(f, fig.at + 4) }}>{s.note}</div> : null}
        <div style={{ ...numStyle(78), left: x0, top: y0 + gw + 24, opacity: fadeP(f, markAt + 6) }}>{s.val}</div>
      </React.Fragment>
    );
  };
  return (
    <>
      {side(fig.a as Side, fig.b ? 60 : (L.INNER_W - gw) / 2, t.markAt ?? fig.at, "a")}
      {fig.b ? side(fig.b as Side, L.INNER_W - 60 - gw, t.markBAt ?? t.markAt ?? fig.at, "b") : null}
      {fig.sub ? <div style={{ ...figText(SMALL, T.weight.body, T.ink2), left: 60, top: y0 + gw + 128, opacity: fadeP(f, fig.at + 8) }}>{fig.sub}</div> : null}
    </>
  );
};

/** 橫的長條（貼文第二張的畫法）：左邊是名字，標出來的那一條填橘色，其他是白底線稿；數字在長條右邊 */
const HBars: React.FC<{ fig: TqFigure; f: number }> = ({ fig, f }) => {
  const bars = fig.bars as Bar[], ax = 150, maxW = 540, bh = 96, gap = 46, top = 70, st = fig.stagger ?? 9;
  const bottom = top + bars.length * bh + (bars.length - 1) * gap;
  return (
    <>
      <Svg>
        {[0.25, 0.5, 0.75, 1].map((q) => <line key={q} x1={ax + maxW * q} y1={top - 30} x2={ax + maxW * q} y2={bottom + 30} stroke={T.hair} strokeWidth={T.stroke.hair} strokeDasharray="6 8" opacity={fadeP(f, fig.at)} />)}
        {bars.map((b, k) => { const g = drawP(f, fig.at + 4 + k * st, 26), w = Math.max(0, (b.v / fig.max) * maxW * g); return g <= 0 ? null : <path key={k} d={`M ${ax} ${top + k * (bh + gap)} H ${ax + w - 12} a 12 12 0 0 1 12 12 V ${top + k * (bh + gap) + bh - 12} a 12 12 0 0 1 -12 12 H ${ax} Z`} fill={b.mark ? T.orange : T.fill} stroke={b.mark ? T.orange : T.line} strokeWidth={T.stroke.line} strokeLinejoin="round" />; })}
        <line x1={ax} y1={top - 30} x2={ax} y2={top - 30 + (bottom - top + 60) * drawP(f, fig.at, M.draw)} stroke={T.line} strokeWidth={T.stroke.line} strokeLinecap="round" />
      </Svg>
      {bars.map((b, k) => (
        <React.Fragment key={k}>
          <div style={{ ...figText(L.LABEL_PX, T.weight.bold, T.ink), left: 0, width: ax - 22, textAlign: "right", top: top + k * (bh + gap) + bh / 2 - 24, opacity: fadeP(f, fig.at + k * st) }}>{b.label}</div>
          {b.val ? <div style={{ ...numStyle(46), fontFamily: `${FONT_EN}, ${FONT_ZH}`, left: ax + (b.v / fig.max) * maxW + 20, top: top + k * (bh + gap) + bh / 2 - 24, opacity: fadeP(f, fig.at + 4 + k * st + 18) }}>{b.val}</div> : null}
        </React.Fragment>
      ))}
      {fig.note ? <div style={{ ...figText(SMALL, T.weight.body, T.ink2), left: ax, top: bottom + 46, opacity: fadeP(f, fig.at + 6) }}>{fig.note}</div> : null}
    </>
  );
};

type Row = { text: string; dashed?: boolean; tail?: "up" | "down" };
/** 表單式的說明卡（貼文第三張）：一格一格的項目（rowNAt 各自出現），橘框把其中幾格框在一起，旁邊一句粗體；tail＝格子右邊的上下箭頭（往上的是橘色） */
const Rows: React.FC<{ fig: TqFigure; f: number }> = ({ fig, f }) => {
  const rows = fig.rows as Row[], t = fig.times, x = 104, w = 560, y = 56, head = 70, rx = 16, rh = 96, gap = 40;
  const h = head + 44 + rows.length * rh + (rows.length - 1) * gap + 44;
  const cp = drawP(f, fig.at, M.draw * 1.5), ry = (i: number) => y + head + 44 + i * (rh + gap);
  const fr = fig.frame as [number, number] | undefined, fp = drawP(f, t.frameAt ?? fig.at, M.draw * 1.5);
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
        {rows.map((r, i) => {
          const at = t[`row${i}At`] ?? fig.at, p = r.dashed ? fadeP(f, at) : drawP(f, at), bx = x + 30, bw = w - 60, ax = bx + bw - 62, cy = ry(i) + rh / 2;
          if (p <= 0) return null;
          return (
            <g key={i}>
              {r.dashed ? <rect x={bx} y={ry(i)} width={bw} height={rh} rx={12} fill="none" stroke={T.line} strokeWidth={T.stroke.hair + 1} strokeDasharray="12 9" opacity={p} />
                : <rect x={bx} y={ry(i)} width={bw} height={rh} rx={12} fill={T.fill} fillOpacity={p} stroke={T.line} strokeWidth={T.stroke.line} {...pen(p)} />}
              {r.tail ? <path d={r.tail === "up" ? `M ${ax} ${cy + 24} V ${cy - 24} M ${ax - 16} ${cy - 8} L ${ax} ${cy - 24} L ${ax + 16} ${cy - 8}` : `M ${ax} ${cy - 24} V ${cy + 24} M ${ax - 16} ${cy + 8} L ${ax} ${cy + 24} L ${ax + 16} ${cy + 8}`} fill="none" stroke={r.tail === "up" ? T.orange : T.line} strokeWidth={T.stroke.accent} {...pen(drawP(f, at + 8, M.draw))} />
                : <line x1={bx + bw - 150} y1={cy} x2={bx + bw - 30} y2={cy} stroke={T.hair} strokeWidth={T.stroke.hair} opacity={p} />}
            </g>
          );
        })}
        {fr && fp > 0 ? <rect x={x + 14} y={ry(fr[0]) - 15} width={w - 28} height={ry(fr[1]) + rh - ry(fr[0]) + 30} rx={18} fill="none" stroke={T.orange} strokeWidth={T.stroke.accent} {...pen(fp)} /> : null}
      </Svg>
      {rows.map((r, i) => <div key={i} style={{ ...figText(L.FIELD_PX, T.weight.body, r.dashed ? T.ink2 : T.ink), left: x + 58, top: ry(i) + rh / 2 - 28, opacity: fadeP(f, (t[`row${i}At`] ?? fig.at) + 4) }}>{r.text}</div>)}
      {fig.side ? <div style={{ ...figText(L.LABEL_PX, T.weight.bold, T.ink), left: x + w + 28, top: fr ? (ry(fr[0]) + ry(fr[1]) + rh) / 2 - String(fig.side).split("\n").length * L.LABEL_PX * 0.625 : y, opacity: fadeP(f, (t.frameAt ?? fig.at) + 6) }}>{fig.side}</div> : null}
    </>
  );
};

/** 左邊一排小人（count 個裡標出 mark 個）加一個百分比，右邊一支手機：訊息一則一則冒出來，第一則的角上有一個橘點 */
const Phone: React.FC<{ fig: TqFigure; f: number }> = ({ fig, f }) => {
  const t = fig.times, n = (fig.count as number) ?? 4, mark = (fig.mark as number) ?? 1, bw = 50, bh = 130, hr = 20, pitch = 68, x0 = 6, top = 372, headCy = top - 8 - hr, ground = top + bh + 3;
  const px = 470, pw = 300, py = 20, ph = 570, markAt = t.markAt ?? fig.at;
  const pp = drawP(f, fig.at, M.draw * 1.8);
  const msg = (at: number, y: number, w: number, h: number, dot: boolean) => {
    const p = fadeP(f, at, M.fade), dy = (1 - p) * 18;
    return p <= 0 ? null : (
      <g opacity={p} transform={`translate(0 ${dy.toFixed(1)})`}>
        <rect x={px + 28} y={y} width={w} height={h} rx={22} fill={T.fillB} stroke={T.line} strokeWidth={T.stroke.line} />
        {[0.38, 0.64].map((q, i) => <line key={i} x1={px + 52} y1={y + h * q} x2={px + 28 + w - (i ? 70 : 28)} y2={y + h * q} stroke={T.line} strokeWidth={T.stroke.hair} strokeLinecap="round" />)}
        {dot ? <circle cx={px + 28 + w} cy={y + 4} r={15} fill={T.orange} /> : null}
      </g>
    );
  };
  return (
    <>
      <Svg>
        <Ground y={ground} p={drawP(f, fig.at, M.draw)} x0={x0 - 6} x1={x0 + (n - 1) * pitch + bw + 30} />
        {Array.from({ length: n }, (_, k) => {
          const x = x0 + k * pitch, p = drawP(f, fig.at + k * M.stagger), op = k < mark ? drawP(f, markAt, M.mark * 1.4) : 0;
          const shape = (stroke: string, w: number, q: number, fill: string, fo: number) => (
            <>
              <circle cx={x + bw / 2} cy={headCy} r={hr} fill={fill} fillOpacity={fo} stroke={stroke} strokeWidth={w} {...pen(q)} transform={`rotate(-90 ${x + bw / 2} ${headCy})`} />
              <rect x={x} y={top} width={bw} height={bh} rx={bw / 2} fill={fill} fillOpacity={fo} stroke={stroke} strokeWidth={w} {...pen(q)} />
            </>
          );
          return p <= 0 ? null : <g key={k}>{shape(T.line, T.stroke.line, p, k < mark ? T.fill : T.fillB, p)}{op > 0 ? shape(T.orange, T.stroke.accent, op, T.fill, 1) : null}</g>;
        })}
        {pp > 0 ? (
          <>
            <rect x={px} y={py} width={pw} height={ph} rx={44} fill={T.fill} fillOpacity={pp} stroke={T.line} strokeWidth={T.stroke.line} {...pen(pp)} />
            <line x1={px + pw / 2 - 40} y1={py + 34} x2={px + pw / 2 + 40} y2={py + 34} stroke={T.hair} strokeWidth={T.stroke.line} strokeLinecap="round" opacity={pp} />
            <line x1={px + pw / 2 - 54} y1={py + ph - 28} x2={px + pw / 2 + 54} y2={py + ph - 28} stroke={T.hair} strokeWidth={T.stroke.line} strokeLinecap="round" opacity={pp} />
          </>
        ) : null}
        {msg(t.msgAt ?? fig.at, py + 96, 222, 104, true)}
        {msg(t.msg2At ?? t.msgAt ?? fig.at, py + 232, 180, 84, false)}
      </Svg>
      {fig.val ? <div style={{ ...numStyle(92), left: 0, top: 36, opacity: fadeP(f, markAt) }}>{fig.val}</div> : null}
      {fig.sub ? <div style={{ ...figText(L.LABEL_PX, T.weight.bold, T.ink), left: 2, top: 150, lineHeight: 1.35, opacity: fadeP(f, markAt + 4) }}>{fig.sub}</div> : null}
    </>
  );
};

/** 一個便當：盒子、三格、白飯的點、一顆蛋（蛋黃是橘色）、熱氣慢慢往上 */
const Bento: React.FC<{ fig: TqFigure; f: number }> = ({ fig, f }) => {
  const t = fig.times, x = 224, w = 440, y = 262, h = 250, vx = x + 250, hy = y + 128, ground = 548;
  const bp = drawP(f, fig.at, M.draw * 1.8), ip = drawP(f, fig.at + M.draw, M.draw * 1.6), sp = drawP(f, t.steamAt ?? fig.at, M.draw * 2.4), ep = fadeP(f, t.eggAt ?? fig.at, M.mark * 1.4);
  const drift = Math.sin((f - (t.steamAt ?? fig.at)) / 26) * 5;
  const steam = (sx: number, k: number) => `M ${sx} ${y - 34} c ${-20 + drift * (k % 2 ? -1 : 1)} -34, ${22 - drift} -62, 0 -96 s ${-18 + drift} -58, 4 -92`;
  const egg = { x: vx + (x + w - vx) / 2, y: y + 66 };
  return (
    <Svg>
      <Ground y={ground} p={drawP(f, fig.at, M.draw)} x0={120} x1={L.INNER_W - 120} />
      {bp > 0 ? (
        <>
          <rect x={x - 14} y={y + h - 6} width={w + 28} height={ground - (y + h) + 3} rx={10} fill={T.fillB} fillOpacity={bp} stroke={T.line} strokeWidth={T.stroke.line} {...pen(bp)} />
          <rect x={x} y={y} width={w} height={h} rx={30} fill={T.fill} fillOpacity={bp} stroke={T.line} strokeWidth={T.stroke.line} {...pen(bp)} />
        </>
      ) : null}
      {ip > 0 ? (
        <>
          <path d={`M ${vx} ${y + 6} V ${y + h - 6} M ${vx} ${hy} H ${x + w - 6}`} fill="none" stroke={T.line} strokeWidth={T.stroke.line} {...pen(ip)} />
          {Array.from({ length: 15 }, (_, k) => { const r = Math.floor(k / 5), c = k % 5; return <line key={k} x1={x + 44 + c * 42 + (r % 2) * 14} y1={y + 62 + r * 58} x2={x + 62 + c * 42 + (r % 2) * 14} y2={y + 62 + r * 58} stroke={T.hair} strokeWidth={T.stroke.line} strokeLinecap="round" opacity={clamp01(ip * 2 - k / 15)} />; })}
          <ellipse cx={egg.x} cy={egg.y} rx={62} ry={40} fill={T.fillB} fillOpacity={ip} stroke={T.line} strokeWidth={T.stroke.hair + 1} {...pen(ip)} />
          {[0, 1, 2].map((k) => <path key={k} d={`M ${vx + 26} ${hy + 34 + k * 26} c 22 -16, 44 16, 66 0 s 44 -16, 66 0`} fill="none" stroke={T.line} strokeWidth={T.stroke.hair + 1} {...pen(clamp01(ip * 1.6 - k * 0.3))} />)}
          <path d={`M ${x + w - 60} ${y - 10} L ${x + w + 150} ${y - 130} M ${x + w - 36} ${y + 2} L ${x + w + 174} ${y - 114}`} fill="none" stroke={T.line} strokeWidth={T.stroke.line + 2} {...pen(ip)} />
        </>
      ) : null}
      {ep > 0 ? <circle cx={egg.x} cy={egg.y} r={20} fill={T.orange} opacity={ep} /> : null}
      {sp > 0 ? [-120, -30, 60].map((dx, k) => <path key={k} d={steam(x + w / 2 + dx, k)} fill="none" stroke={T.hair} strokeWidth={T.stroke.line} {...pen(clamp01(sp * 1.5 - k * 0.25))} />) : null}
    </Svg>
  );
};

/** 一把鑰匙掛著一個房子形狀的吊牌（門是橘色）；下面一行小字加箭頭（下一集） */
const Key: React.FC<{ fig: TqFigure; f: number }> = ({ fig, f }) => {
  const t = fig.times, cx = 250, cy = 180, kp = drawP(f, fig.at, M.draw * 2), tp = drawP(f, fig.at + M.draw, M.draw * 2), dp = drawP(f, t.tagAt ?? fig.at, M.draw * 1.4), lineAt = t.lineAt ?? fig.at;
  return (
    <>
      <Svg>
        {kp > 0 ? (
          <>
            <path d={`M ${cx + 78} ${cy - 20} H 690 a 20 20 0 0 1 0 40 H 660 v 52 h -34 v -26 h -30 v 40 h -34 v -66 H ${cx + 78}`} fill={T.fill} fillOpacity={kp} stroke={T.line} strokeWidth={T.stroke.line} {...pen(kp)} />
            <circle cx={cx} cy={cy} r={92} fill={T.fill} fillOpacity={kp} stroke={T.line} strokeWidth={T.stroke.line} {...pen(kp)} />
            <circle cx={cx} cy={cy} r={40} fill={T.fillB} fillOpacity={kp} stroke={T.line} strokeWidth={T.stroke.line} {...pen(kp)} />
          </>
        ) : null}
        {tp > 0 ? (
          <>
            <path d={`M ${cx} ${cy + 40} V ${cy + 170}`} fill="none" stroke={T.line} strokeWidth={T.stroke.hair + 1} strokeDasharray="8 7" opacity={tp} />
            <path d={`M ${cx - 84} ${cy + 240} L ${cx} ${cy + 168} L ${cx + 84} ${cy + 240} V ${cy + 356} H ${cx - 84} Z`} fill={T.fillB} fillOpacity={tp} stroke={T.line} strokeWidth={T.stroke.line} {...pen(tp)} />
          </>
        ) : null}
        {dp > 0 ? <path d={`M ${cx - 22} ${cy + 356} V ${cy + 290} a 22 22 0 0 1 44 0 V ${cy + 356}`} fill={T.fill} fillOpacity={dp} stroke={T.orange} strokeWidth={T.stroke.accent} {...pen(dp)} /> : null}
      </Svg>
      {fig.line ? (
        <div style={{ position: "absolute", left: 400, top: cy + 250, display: "flex", alignItems: "center", gap: 18, opacity: fadeP(f, lineAt) }}>
          <div style={{ ...figText(L.FIELD_PX, T.weight.bold, T.ink), position: "relative" }}>{fig.line}</div>
          <svg width={44} height={28} viewBox="0 0 44 28"><path d="M 3 14 H 39 M 28 4 L 39 14 L 28 24" fill="none" stroke={T.ink} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" /></svg>
        </div>
      ) : null}
    </>
  );
};

export const FILM_FIGURES: Record<string, React.FC<{ fig: TqFigure; f: number }>> = { window: Window, months: Months, grid: Grid, bars: Bars, line: Line, week: Week, pair: Pair, hbars: HBars, rows: Rows, phone: Phone, bento: Bento, key: Key };

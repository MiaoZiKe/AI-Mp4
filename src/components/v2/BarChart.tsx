// styleVersion 2：BarChart 三種模式（填滿主視覺區）
//  flat：直條（≤6 類短標籤），繪圖區 952×780、y 400–1180、條寬 110–140；全負值時從上方基準線往下長
//  iso ：2D 斜切三面（正面／頂面往右上 30° 斜切／側面），三階明度，地面 45° 長陰影；柱子從主視覺區上緣附近長到底
//  race：橫條排名賽跑（5–7 類），每列 110–150px，依 frames 關鍵幀（cue）內插數值與名次
// 重點條主色、其餘 35%；1 條參考線＋1 個註解。顏色一律讀 THEME_V2。
import React from "react";
import { useCurrentFrame } from "remotion";
import { FONT_EN, FONT_ZH, LAYOUT_V2 as L, THEME_V2 as T, accentV2, mixHex } from "../../theme";
import { DUR, EASE, STAGGER, bump, tween } from "../anim";
import { cueAt, cueIn, useCue } from "../../cue";
import { EN, IconV2, fmtNum, reveal, PanStage } from "./base";

type Bar = { label: string; value: number; color?: string; at?: string; highlight?: boolean; icon?: string; text?: string };
type Frame = { at?: string; frame?: number; label: string; values: Record<string, number> };
export type BarChartProps = {
  mode?: "flat" | "iso" | "race"; title: string; titleEn?: string; unit?: string; decimals?: number; color?: string;
  bars: Bar[]; refLine?: { value: number; label: string; at?: string }; note?: { text: string; bar: number; at?: string };
  frames?: Frame[]; max?: number; footnote?: string;
};

const H = L.CONTENT_BOTTOM - L.CONTENT_TOP;
const ly = (y: number) => y - L.CONTENT_TOP;
const P0 = ly(L.BAR_TOP), P1 = ly(L.PLOT_BOTTOM);

const Title: React.FC<{ f: number; title: string; titleEn?: string }> = ({ f, title, titleEn }) => (
  <div style={{ ...reveal(f, 0), position: "absolute", left: 0, right: 0, top: 0 }}>
    <div style={{ fontFamily: FONT_ZH, fontSize: 52, fontWeight: T.weight.title, color: T.text, whiteSpace: "nowrap", lineHeight: 1.1 }}>{title}</div>
    {titleEn && <div style={{ ...EN, marginTop: 2 }}>{titleEn}</div>}
  </div>
);

/** 刻度：1／2／5 × 10^n，3–4 格 */
const niceTicks = (vmax: number) => {
  const raw = vmax / 4, p = 10 ** Math.floor(Math.log10(raw));
  const step = [10, 5, 2.5, 2, 1].map((k) => k * p).find((k) => k <= raw) ?? raw;
  return Array.from({ length: Math.floor(vmax / step) }, (_, i) => (i + 1) * step);
};
/** 每條的進場幀：有 cue 用 cue；沒有就依序 */
const barStarts = (c: ReturnType<typeof useCue>, bars: Bar[]) => {
  let fixed = 6;
  return bars.map((b) => { if (b.at && c.cues[b.at] !== undefined) return cueIn(c, b.at, 0); const v = fixed; fixed += STAGGER * 2; return v; });
};

/** 引線註解：錨點 (x, ay) → 垂直到 y → 水平到註解框（ay 省略＝同高） */
const Callout: React.FC<{ x: number; y: number; ay?: number; text: string; f: number; t: number; side?: "left" | "right" }> = ({ x, y, ay, text, f, t, side = "left" }) => {
  const w = Math.min(600, text.length * 38 + 48);
  const bx = side === "left" ? Math.max(0, x - 60 - w) : Math.min(952 - w, x + 60);
  const r = reveal(f, t, 1, 12);
  const a = ay ?? y;
  return (
    <>
      <svg width={952} height={H} style={{ position: "absolute", left: 0, top: 0, overflow: "visible", opacity: tween(f, t, DUR.s) }}>
        <path d={`M${x} ${a} L${x} ${y} L${side === "left" ? bx + w : bx} ${y}`} fill="none" stroke={T.text} strokeWidth={3} pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - tween(f, t, DUR.m, EASE.enter)} />
        <circle cx={x} cy={a} r={8} fill={T.text} />
      </svg>
      <div style={{ ...r, position: "absolute", left: bx, top: y - 40, width: w, boxSizing: "border-box", padding: "10px 18px", background: T.card, border: `2px solid ${T.cardBorder}`, borderLeft: `8px solid ${T.accent.yellow.fill}`, borderRadius: T.radiusTag, fontFamily: FONT_ZH, fontSize: 36, fontWeight: 700, color: T.text, lineHeight: 1.3 }}>{text}</div>
    </>
  );
};

const Flat: React.FC<BarChartProps> = ({ title, titleEn, unit = "", decimals = 0, bars, refLine, note, max, footnote }) => {
  const f = useCurrentFrame();
  const c = useCue();
  const st = barStarts(c, bars);
  const neg = bars.every((b) => b.value <= 0);
  const vmax = max ?? Math.max(...bars.map((b) => Math.abs(b.value))) * 1.08;
  const base = neg ? P0 + 130 : P1 - 70; // 基準線（全負值：上方，標籤與圖示在基準線上）
  const span = neg ? P1 - 120 - base : base - (P0 + 170);
  const Yv = (v: number) => base + (neg ? 1 : -1) * (Math.abs(v) / vmax) * span;
  const slot = 952 / bars.length;
  const bw = Math.max(110, Math.min(140, slot * 0.4));
  const cx = (i: number) => slot * i + slot / 2;
  const step = vmax > 8 ? 2 : 1;
  const ticks = Array.from({ length: Math.floor(vmax / step) }, (_, k) => (k + 1) * step);
  return (
    <PanStage><div style={{ position: "relative", width: 952, height: H }}>
      <Title f={f} title={title} titleEn={titleEn} />
      <svg width={952} height={H} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
        {ticks.map((v) => (
          <g key={v}>
            <line x1={70} x2={952} y1={Yv(v)} y2={Yv(v)} stroke={T.chart.grid} strokeWidth={2} strokeDasharray="6 10" />
            <text x={0} y={Yv(v) + 10} fontFamily={FONT_EN} fontSize={28} fontWeight={600} fill={T.chart.label}>{neg ? "−" : ""}{fmtNum(v, v % 1 ? 1 : 0)}</text>
          </g>
        ))}
        <line x1={0} x2={952} y1={base} y2={base} stroke={T.chart.axis} strokeWidth={T.chart.axisW} />
        {bars.map((b, i) => {
          const a = accentV2(b.color);
          const p = tween(f, st[i], DUR.l + 6, EASE.move);
          const y = Yv(b.value * p);
          return <rect key={i} x={cx(i) - bw / 2} y={Math.min(base, y)} width={bw} height={Math.abs(y - base)} fill={a.fill} opacity={b.highlight === false ? T.chart.mute : 1} />;
        })}
        {refLine && (() => {
          const t = cueIn(c, refLine.at, 30);
          return <line x1={0} x2={952 * tween(f, t, DUR.l, EASE.move)} y1={Yv(refLine.value)} y2={Yv(refLine.value)} stroke={T.accent.pink.text} strokeWidth={5} strokeDasharray="16 10" opacity={tween(f, t, DUR.xs)} />;
        })()}
      </svg>
      {bars.map((b, i) => {
        const a = accentV2(b.color);
        const p = tween(f, st[i], DUR.l + 6, EASE.move);
        const hi = b.highlight !== false;
        const land = st[i] + DUR.l + 6;
        const lab = neg ? { top: base - 104 } : { top: base + 12 };
        return (
          <React.Fragment key={i}>
            <div style={{ ...reveal(f, Math.min(st[i], 6 + i * STAGGER), 1, 12), position: "absolute", left: cx(i) - slot / 2, width: slot, ...lab, display: "flex", flexDirection: neg ? "row" : "column", justifyContent: "center", alignItems: "center", gap: 14 }}>
              {neg && b.icon && <IconV2 name={b.icon} color={b.color} size={88} draw={tween(f, 0, DUR.l)} />}
              <div style={{ fontFamily: FONT_ZH, fontSize: 48, fontWeight: T.weight.title, color: T.text, whiteSpace: "nowrap" }}>{b.label}</div>
            </div>
            <div style={{ position: "absolute", left: cx(i) - slot / 2, width: slot, top: neg ? Yv(b.value * p) + 14 : Yv(b.value * p) - (hi ? 118 : 74), textAlign: "center", opacity: tween(f, st[i], DUR.s), fontFamily: FONT_EN, fontWeight: T.weight.num, fontSize: hi ? 100 : 60, whiteSpace: "nowrap", color: hi ? a.text : T.text2, fontVariantNumeric: "tabular-nums", lineHeight: 1, transform: `scale(${bump(f, cueAt(c, b.at, land), 0.06).toFixed(4)})` }}>
              {b.text && p >= 1 ? b.text : `${fmtNum(b.value * p, decimals)}${unit}`}
            </div>
          </React.Fragment>
        );
      })}
      {refLine && (
        <div style={{ ...reveal(f, cueIn(c, refLine.at, 30) + 4, 1, 8), position: "absolute", right: 0, top: Yv(refLine.value) - 50, fontFamily: FONT_ZH, fontSize: 34, fontWeight: 900, color: T.accent.pink.text, whiteSpace: "nowrap" }}>{refLine.label}</div>
      )}
      {note && <Callout x={cx(note.bar) - bw / 2} y={Yv(bars[note.bar].value) - 40} text={note.text} f={f} t={cueIn(c, note.at, 40)} side="left" />}
      {footnote && <div style={{ position: "absolute", left: 0, right: 0, top: P1 + 12, fontFamily: FONT_ZH, fontSize: 28, color: T.text3, whiteSpace: "nowrap", opacity: tween(f, 8, DUR.s) }}>{footnote}</div>}
    </div></PanStage>
  );
};

const Iso: React.FC<BarChartProps> = ({ title, titleEn, unit = "", decimals = 1, bars, note, max, footnote }) => {
  const f = useCurrentFrame();
  const c = useCue();
  const st = barStarts(c, bars);
  const floor = P1 - 70, top = P0 + 150;
  const vmax = max ?? Math.max(...bars.map((b) => b.value));
  const slot = 952 / bars.length;
  const bw = Math.max(110, Math.min(140, slot - T.iso.depth - 40));
  const dx = T.iso.depth, dy = dx * Math.tan((T.iso.skew * Math.PI) / 180);
  const x0 = (i: number) => slot * i + (slot - bw - dx) / 2;
  const pts = (q: number[][]) => q.map((p) => p.map((v) => v.toFixed(1)).join(",")).join(" ");
  const GROW = DUR.l + 6;
  const hOf = (i: number) => (bars[i].value / vmax) * (floor - top) * tween(f, st[i], GROW, EASE.move);
  return (
    <PanStage><div style={{ position: "relative", width: 952, height: H }}>
      <Title f={f} title={title} titleEn={titleEn} />
      <svg width={952} height={H} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
        {/* 背牆格線（量級刻度） */}
        {niceTicks(vmax).map((v) => {
          const y = floor - (v / vmax) * (floor - top) - dy;
          return (
            <g key={v}>
              <line x1={0} x2={952} y1={y} y2={y} stroke={T.chart.grid} strokeWidth={2} strokeDasharray="6 10" />
              <text x={952} y={y - 10} textAnchor="end" fontFamily={FONT_EN} fontSize={28} fontWeight={600} fill={T.chart.label}>{fmtNum(v)}</text>
            </g>
          );
        })}
        {/* 地面 */}
        <polygon points={pts([[0, floor], [952, floor], [952, floor - dy], [dx, floor - dy]])} fill={T.track} />
        <line x1={0} x2={952} y1={floor} y2={floor} stroke={T.chart.axis} strokeWidth={T.chart.axisW} />
        {bars.map((b, i) => {
          const a = accentV2(b.color);
          const h = Math.max(hOf(i), b.value > 0 && f >= st[i] ? 3 : 0);
          const l = x0(i), r = l + bw, yt = floor - h;
          const op = b.highlight === false ? T.chart.mute : 1;
          const sl = Math.min(T.depth.shadowLen + 12, h * 0.4);
          return (
            <g key={i} opacity={op * tween(f, st[i], DUR.xs)}>
              <polygon points={pts([[r, floor], [r + dx, floor - dy], [r + dx + sl, floor - dy + sl], [r + sl, floor + sl]])} fill={T.depth.shadowInk} />
              <rect x={l} y={yt} width={bw} height={h} fill={a.fill} />
              <polygon points={pts([[r, yt], [r + dx, yt - dy], [r + dx, floor - dy], [r, floor]])} fill={mixHex(a.fill, T.text, T.iso.side)} />
              <polygon points={pts([[l, yt], [l + dx, yt - dy], [r + dx, yt - dy], [r, yt]])} fill={mixHex(a.fill, T.card, T.iso.top)} />
            </g>
          );
        })}
      </svg>
      {bars.map((b, i) => {
        const a = accentV2(b.color);
        const hi = b.highlight !== false;
        const p = tween(f, st[i], GROW, EASE.move);
        const yt = floor - hOf(i) - dy;
        const land = st[i] + GROW;
        return (
          <React.Fragment key={i}>
            <div style={{ position: "absolute", left: x0(i) - 40, width: bw + dx + 80, top: yt - (hi ? 96 : 70), textAlign: "center", opacity: tween(f, st[i], DUR.s) * (hi ? 1 : 0.8), fontFamily: FONT_EN, fontSize: hi ? 80 : 60, fontWeight: T.weight.num, color: hi ? a.text : T.text2, lineHeight: 1, whiteSpace: "nowrap", fontVariantNumeric: "tabular-nums", transform: `scale(${bump(f, land, 0.05).toFixed(4)})` }}>
              {fmtNum(b.value * p, decimals)}{unit && <span style={{ fontSize: 30, fontFamily: FONT_ZH, marginLeft: 4 }}>{unit}</span>}
            </div>
            <div style={{ ...reveal(f, Math.min(st[i], 6 + i * STAGGER), 1, 8), position: "absolute", left: x0(i) - 30, width: bw + dx + 60, top: floor + 16, textAlign: "center", fontFamily: FONT_ZH, fontSize: 40, fontWeight: T.weight.title, color: T.text, whiteSpace: "nowrap" }}>{b.label}</div>
          </React.Fragment>
        );
      })}
      {note && (() => {
        const b = note.bar;
        const t = cueIn(c, note.at, 60);
        const x = x0(b) + bw / 2 + dx / 2, ay = floor - hOf(b) - dy - (bars[b].highlight === false ? 80 : 104);
        return <Callout x={x} ay={ay} y={Math.min(ay - 120, floor - 300)} text={note.text} f={f} t={t} side={x > 476 ? "left" : "right"} />;
      })()}
      {footnote && <div style={{ position: "absolute", left: 0, right: 0, top: P1 + 12, fontFamily: FONT_ZH, fontSize: 28, color: T.text3, whiteSpace: "nowrap", opacity: tween(f, 8, DUR.s) }}>{footnote}</div>}
    </div></PanStage>
  );
};

const Race: React.FC<BarChartProps> = ({ title, titleEn, unit = "", decimals = 0, bars, frames = [], max, footnote }) => {
  const f = useCurrentFrame();
  const c = useCue();
  const keys = frames.map((k, i) => ({ ...k, fr: k.at ? cueAt(c, k.at, k.frame ?? 20 + i * 40) : k.frame ?? 20 + i * 40 }));
  for (let i = 1; i < keys.length; i++) keys[i].fr = Math.max(keys[i].fr, keys[i - 1].fr + DUR.l);
  const names = bars.map((b) => b.label);
  const rankOf = (vals: Record<string, number>) => { const o = [...names].sort((a, b) => (vals[b] ?? 0) - (vals[a] ?? 0)); return Object.fromEntries(o.map((n, i) => [n, i])); };
  const ranks = keys.map((k) => rankOf(k.values));
  // 目前數值與名次（相鄰關鍵幀之間 EASE.move 內插；第一個關鍵幀之前從 0 長出來）
  let seg = 0;
  while (seg < keys.length - 1 && f >= keys[seg + 1].fr) seg++;
  const k0 = keys[seg], k1 = keys[Math.min(seg + 1, keys.length - 1)];
  const u = f < keys[0].fr ? 0 : k1 === k0 ? 1 : tween(f, k0.fr, k1.fr - k0.fr, EASE.move);
  const grow = tween(f, 4, Math.max(DUR.l, keys[0].fr - 4), EASE.move);
  const vOf = (n: string) => (f < keys[0].fr ? (k0.values[n] ?? 0) * grow : (k0.values[n] ?? 0) + ((k1.values[n] ?? 0) - (k0.values[n] ?? 0)) * u);
  const rOf = (n: string) => ranks[seg][n] + (ranks[Math.min(seg + 1, keys.length - 1)][n] - ranks[seg][n]) * u;
  const vmax = max ?? Math.max(...keys.flatMap((k) => Object.values(k.values)));
  const rowH = Math.max(110, Math.min(150, (P1 - P0 - 40) / names.length));
  const LW = 230, BW = 952 - LW - 190;
  const label = u > 0.5 ? k1.label : k0.label;
  return (
    <PanStage><div style={{ position: "relative", width: 952, height: H }}>
      <div style={{ position: "absolute", right: -40, bottom: 20, fontFamily: FONT_EN, fontWeight: T.weight.num, fontSize: 200, color: T.watermark, opacity: L.WATERMARK_OPACITY + 0.03, whiteSpace: "nowrap" }}>{label}</div>
      <Title f={f} title={title} titleEn={titleEn} />
      {bars.map((b, i) => {
        const a = accentV2(b.color);
        const y = P0 + 30 + rOf(b.label) * rowH;
        const v = vOf(b.label);
        return (
          <div key={i} style={{ ...reveal(f, i * STAGGER, 1, 12), position: "absolute", left: 0, right: 0, top: y, height: rowH - 22, display: "flex", alignItems: "center" }}>
            <div style={{ width: LW, fontFamily: FONT_ZH, fontSize: 42, fontWeight: T.weight.title, color: T.text, whiteSpace: "nowrap" }}>{b.label}</div>
            <div style={{ width: Math.max(4, (v / vmax) * BW), height: "100%", background: a.fill, opacity: b.highlight === false ? T.chart.mute : 1, borderRadius: 4 }} />
            <div style={{ marginLeft: 16, fontFamily: FONT_EN, fontSize: 56, fontWeight: T.weight.num, color: a.text, fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" }}>{fmtNum(v, decimals)}{unit}</div>
          </div>
        );
      })}
      {footnote && <div style={{ position: "absolute", left: 0, right: 0, top: P1 + 12, fontFamily: FONT_ZH, fontSize: 28, color: T.text3, whiteSpace: "nowrap" }}>{footnote}</div>}
    </div></PanStage>
  );
};

export const BarChart: React.FC<BarChartProps> = (p) => (p.mode === "iso" ? <Iso {...p} /> : p.mode === "race" ? <Race {...p} /> : <Flat {...p} />);

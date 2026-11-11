// styleVersion 2：LineChart 描線＋跟隨數值點＋終點數字徽章＋1–3 個引線註解＋參考線＋重點期間色帶
// 版面：標題 y 340–420；繪圖區 x 64–1016、y 440–1180（docs/layout-rules.md）。y 軸一律從 0 開始（誠實度）。
// 描線進度用 draw 關鍵幀：[{at: cueId, t}]＝念到該 cue 時線頭剛好畫到 t；沒有 cue 的關鍵幀用 frame。
import React from "react";
import { useCurrentFrame } from "remotion";
import { FONT_EN, FONT_ZH, LAYOUT_V2 as L, THEME_V2 as T, accentV2 } from "../../theme";
import { DUR, EASE, bump, tween } from "../anim";
import { cueAt, cueIn, useCue } from "../../cue";
import { EN, KwText, fmtNum, reveal, PanStage } from "./base";

type Pt = { t: number; v: number };
type Series = { label?: string; color?: string; points: Pt[] };
type Note = { t: number; text: string; at?: string; side?: "up" | "down" | "right"; series?: number };
export type LineChartProps = {
  title: string; titleEn?: string; unit?: string; decimals?: number; color?: string;
  series: Series[]; xTicks: { t: number; label: string }[]; yMax?: number; yTicks?: number[];
  refLine?: { value: number; label: string; at?: string };
  band?: { from: number; to: number; label: string; sub?: string; at?: string; color?: string };
  notes?: Note[]; draw?: { at?: string; frame?: number; t: number }[]; watermark?: string; footnote?: string; badgeLabel?: string;
};

const ly = (y: number) => y - L.CONTENT_TOP;
export const PLOT = { x0: 84, x1: 900, y0: ly(L.PLOT_TOP) + 24, y1: ly(L.PLOT_BOTTOM) - 56 };

/** 折線在 t 的值（線性內插） */
const valueAt = (pts: Pt[], t: number) => {
  if (t <= pts[0].t) return pts[0].v;
  for (let i = 1; i < pts.length; i++) if (t <= pts[i].t) { const a = pts[i - 1], b = pts[i]; return a.v + ((b.v - a.v) * (t - a.t)) / (b.t - a.t || 1); }
  return pts[pts.length - 1].v;
};

export const LineChart: React.FC<LineChartProps> = ({ title, titleEn, unit = "", decimals = 2, color, series, xTicks, yMax, yTicks, refLine, band, notes = [], draw, watermark, footnote, badgeLabel }) => {
  const f = useCurrentFrame();
  const c = useCue();
  const acc = accentV2(color);
  const all = series.flatMap((s) => s.points);
  const tMin = Math.min(...all.map((p) => p.t)), tMax = Math.max(...all.map((p) => p.t));
  const vMax = yMax ?? Math.max(...all.map((p) => p.v)) * 1.12;
  const X = (t: number) => PLOT.x0 + ((t - tMin) / (tMax - tMin || 1)) * (PLOT.x1 - PLOT.x0);
  const Y = (v: number) => PLOT.y1 - (v / vMax) * (PLOT.y1 - PLOT.y0);
  // 描線關鍵幀 → 線頭的 t
  const keys = [{ frame: 6, t: tMin }, ...(draw ?? [{ frame: 70, t: tMax }]).map((k) => ({ frame: k.at ? cueAt(c, k.at, k.frame ?? 60) : k.frame ?? 60, t: k.t }))];
  for (let i = 1; i < keys.length; i++) keys[i].frame = Math.max(keys[i].frame, keys[i - 1].frame + 6);
  let headT = keys[0].t;
  for (let i = 1; i < keys.length; i++) headT += (keys[i].t - keys[i - 1].t) * tween(f, keys[i - 1].frame, keys[i].frame - keys[i - 1].frame, EASE.move);
  const land = keys[keys.length - 1].frame;
  const ticks = yTicks ?? [0, vMax / 2, vMax].map((v) => Number(v.toFixed(1)));
  const bandIn = band ? cueIn(c, band.at, 20) : 0;
  const refIn = refLine ? cueIn(c, refLine.at, 12) : 0;
  const bc = accentV2(band?.color ?? "yellow");
  return (
    <PanStage><div style={{ position: "relative", width: 952, height: L.CONTENT_BOTTOM - L.CONTENT_TOP }}>
      {watermark && (
        <div style={{ position: "absolute", right: -150, top: ly(L.PLOT_TOP) + 60, fontFamily: FONT_EN, fontWeight: T.weight.num, fontSize: L.WATERMARK_PX, lineHeight: 1, color: T.watermark, opacity: L.WATERMARK_OPACITY, whiteSpace: "nowrap" }}>{watermark}</div>
      )}
      <div style={{ ...reveal(f, 0), position: "absolute", left: 0, right: 0, top: ly(L.CHART_TITLE_TOP), height: L.PLOT_TOP - L.CHART_TITLE_TOP - 10 }}>
        <div style={{ fontFamily: FONT_ZH, fontSize: 54, fontWeight: T.weight.title, color: T.text, lineHeight: 1.1, whiteSpace: "nowrap" }}><KwText text={title} /></div>
        {titleEn && <div style={{ ...EN, marginTop: 4 }}>{titleEn}</div>}
      </div>
      <svg width={952} height={L.CONTENT_BOTTOM - L.CONTENT_TOP} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
        <defs>
          <linearGradient id="lc-area" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={acc.fill} stopOpacity={T.chart.areaTop} />
            <stop offset="1" stopColor={acc.fill} stopOpacity={T.chart.areaBottom} />
          </linearGradient>
        </defs>
        {/* 重點期間色帶（整高） */}
        {band && (() => {
          const p = tween(f, bandIn, DUR.l, EASE.move);
          const x0 = X(band.from), x1 = X(band.to);
          return (
            <g opacity={tween(f, bandIn, DUR.s)}>
              <rect x={x0} y={PLOT.y0 - 20} width={(x1 - x0) * p} height={PLOT.y1 - PLOT.y0 + 20} fill={bc.soft} opacity={T.chart.bandOpacity + 0.3} />
              <text x={x0 + 16} y={PLOT.y0 + 22} fontFamily={FONT_ZH} fontSize={34} fontWeight={700} fill={bc.text}>{band.label}</text>
              {band.sub && <text x={x0 + 16} y={PLOT.y0 + 72} fontFamily={FONT_ZH} fontSize={40} fontWeight={900} fill={T.text} opacity={tween(f, bandIn + DUR.s, DUR.s)}>{band.sub}</text>}
            </g>
          );
        })()}
        {/* y 格線與標籤 */}
        {ticks.map((v) => (
          <g key={v}>
            <line x1={PLOT.x0} x2={PLOT.x1 + 40} y1={Y(v)} y2={Y(v)} stroke={v === 0 ? T.chart.axis : T.chart.grid} strokeWidth={v === 0 ? T.chart.axisW : 2} strokeDasharray={v === 0 ? undefined : "6 10"} />
            <text x={PLOT.x0 - 16} y={Y(v) + 10} textAnchor="end" fontFamily={FONT_EN} fontSize={32} fontWeight={600} fill={T.chart.label}>{fmtNum(v, v % 1 ? 1 : 0)}</text>
          </g>
        ))}
        {/* x 標籤（≤6） */}
        {xTicks.slice(0, 6).map((x) => (
          <text key={x.t} x={X(x.t)} y={PLOT.y1 + 44} textAnchor="middle" fontFamily={FONT_EN} fontSize={32} fontWeight={600} fill={T.chart.label}>{x.label}</text>
        ))}
        {/* 參考線 */}
        {refLine && (
          <g opacity={tween(f, refIn, DUR.s)}>
            <line x1={PLOT.x0} x2={PLOT.x0 + (PLOT.x1 + 40 - PLOT.x0) * tween(f, refIn, DUR.l, EASE.move)} y1={Y(refLine.value)} y2={Y(refLine.value)} stroke={T.accent.pink.text} strokeWidth={5} strokeDasharray="16 10" />
          </g>
        )}
        {series.map((s, si) => {
          const a = accentV2(s.color ?? color);
          const pts = s.points.filter((p) => p.t <= headT).map((p) => [X(p.t), Y(p.v)]);
          const hv = valueAt(s.points, headT);
          pts.push([X(headT), Y(hv)]);
          const d = "M" + pts.map((q) => `${q[0].toFixed(1)},${q[1].toFixed(1)}`).join("L");
          const area = `${d}L${X(headT).toFixed(1)},${PLOT.y1}L${PLOT.x0},${PLOT.y1}Z`;
          return (
            <g key={si}>
              {si === 0 && <path d={area} fill="url(#lc-area)" />}
              <path d={d} fill="none" stroke={a.fill} strokeWidth={T.chart.lineW} strokeLinejoin="round" strokeLinecap="round" />
              {s.points.filter((p) => p.t <= headT).map((p) => <circle key={p.t} cx={X(p.t)} cy={Y(p.v)} r={9} fill={T.card} stroke={a.fill} strokeWidth={5} />)}
              <circle cx={X(headT)} cy={Y(hv)} r={18} fill={a.fill} stroke={T.card} strokeWidth={6} />
            </g>
          );
        })}
        {/* 引線註解：線頭經過該點（或念到 cue）時出現 */}
        {notes.slice(0, 3).map((n, k) => {
          const s = series[n.series ?? 0];
          const passT = keys.findIndex((q) => q.t >= n.t);
          const passF = passT <= 0 ? keys[0].frame : keys[passT - 1].frame + (keys[passT].frame - keys[passT - 1].frame) * ((n.t - keys[passT - 1].t) / (keys[passT].t - keys[passT - 1].t || 1));
          const t0 = cueIn(c, n.at, Math.round(passF) - 2);
          const op = tween(f, t0, DUR.s);
          if (op <= 0) return null;
          const px = X(n.t), py = Y(valueAt(s.points, n.t));
          const w = n.text.length * 34 + 40;
          if (n.side === "right") {
            // 註解框放在點的右上方：短引線斜向右上
            const bx = Math.min(px + 40, 952 - w), by = py - 96;
            return (
              <g key={k} opacity={op}>
                <line x1={px + 14} y1={py - 10} x2={bx} y2={by + 31} stroke={T.text} strokeWidth={3} />
                <rect x={bx} y={by} width={w} height={62} rx={T.radiusTag} fill={T.card} stroke={T.cardBorder} strokeWidth={2} />
                <text x={bx + w / 2} y={by + 43} textAnchor="middle" fontFamily={FONT_ZH} fontSize={34} fontWeight={700} fill={T.text}>{n.text}</text>
              </g>
            );
          }
          const up = (n.side ?? "up") === "up";
          const len = 70 * tween(f, t0, DUR.m, EASE.enter);
          const ty = up ? py - 24 - len : py + 24 + len;
          const bx = Math.min(Math.max(px - w / 2, 0), 952 - w);
          return (
            <g key={k} opacity={op}>
              <line x1={px} y1={up ? py - 20 : py + 20} x2={px} y2={ty} stroke={T.text} strokeWidth={3} />
              <rect x={bx} y={up ? ty - 62 : ty} width={w} height={62} rx={T.radiusTag} fill={T.card} stroke={T.cardBorder} strokeWidth={2} />
              <text x={bx + w / 2} y={up ? ty - 19 : ty + 43} textAnchor="middle" fontFamily={FONT_ZH} fontSize={34} fontWeight={700} fill={T.text}>{n.text}</text>
            </g>
          );
        })}
      </svg>
      {/* 參考線標籤 */}
      {refLine && (
        <div style={{ ...reveal(f, refIn + 4, 1, 12), position: "absolute", left: PLOT.x0 + 16, top: Y(refLine.value) + 14, fontFamily: FONT_ZH, fontSize: 36, fontWeight: 900, color: T.accent.pink.text, background: T.card, border: `2px solid ${T.accent.pink.fill}`, borderRadius: T.radiusTag, padding: "4px 14px", transform: `${reveal(f, refIn + 4, 1, 12).transform} scale(${bump(f, cueAt(c, refLine.at, refIn + 4), 0.06).toFixed(4)})`, transformOrigin: "0% 0%" }}>{refLine.label}</div>
      )}
      {/* 終點數字徽章：跟著線頭走，數字跟著變 */}
      {(() => {
        const s = series[0];
        const hv = valueAt(s.points, headT);
        const hx = X(headT), hy = Y(hv);
        const bw = 250;
        const left = Math.min(Math.max(hx - bw / 2, 0), 952 - bw);
        const top = hy - 170 < PLOT.y0 - 60 ? hy + 40 : hy - 170;
        return (
          <div style={{ position: "absolute", left, top, width: bw, height: 124, borderRadius: T.radius, background: acc.fill, color: T.onAccent, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", boxShadow: T.shadow, opacity: tween(f, 4, DUR.s), transform: `scale(${bump(f, land, 0.06).toFixed(4)})` }}>
            <div style={{ fontFamily: FONT_EN, fontSize: 84, fontWeight: T.weight.num, lineHeight: 1, fontVariantNumeric: "tabular-nums" }}>{fmtNum(hv, decimals)}<span style={{ fontSize: 40, marginLeft: 6, fontFamily: FONT_ZH }}>{unit}</span></div>
            {badgeLabel && <div style={{ fontFamily: FONT_ZH, fontSize: 32, fontWeight: 700, opacity: f >= land ? 1 : 0 }}>{badgeLabel}</div>}
          </div>
        );
      })()}
      {footnote && <div style={{ ...reveal(f, 10, 1, 8), position: "absolute", left: 0, right: 0, top: ly(L.PLOT_BOTTOM) + 14, fontFamily: FONT_ZH, fontSize: 32, color: T.text3, whiteSpace: "nowrap" }}>{footnote}</div>}
    </div></PanStage>
  );
};

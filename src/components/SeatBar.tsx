import React from "react";
import { useCurrentFrame } from "remotion";
import { lin, sp } from "../anim";
import { C, FONT_MONO, FONT_ZH } from "../theme";

export type Seg = { label: string; value: number; color: string; pending?: boolean };

/** 席次條：遞增動畫 + 過半門檻線 + 尺寸標註線 */
export const SeatBar: React.FC<{
  title: string; titleEn: string; total: number; threshold: number; segs: Seg[]; width: number; delay?: number; note?: string;
}> = ({ title, titleEn, total, threshold, segs, width, delay = 0, note }) => {
  const frame = useCurrentFrame();
  const grow = sp(frame, delay + 8, 26, 40);
  const barH = 76;
  const tx = (threshold / total) * width;
  const thr = lin(frame, delay + 30, delay + 44);
  let acc = 0;
  return (
    <div style={{ position: "relative", width, height: 350 }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 16 }}>
        <span style={{ fontFamily: FONT_ZH, fontWeight: 900, fontSize: 46, color: C.line }}>{title}</span>
        <span style={{ fontFamily: FONT_MONO, fontSize: 22, color: C.cyan, letterSpacing: 2 }}>{titleEn}</span>
      </div>
      <svg width={width} height={210} style={{ position: "absolute", top: 96, left: 0, overflow: "visible" }}>
        {/* 外框 */}
        <rect x={0} y={40} width={width} height={barH} fill="none" stroke={C.line} strokeWidth={2.5} />
        {segs.map((s, i) => {
          const w = (s.value / total) * width * grow;
          const x = acc;
          acc += w;
          return (
            <g key={i}>
              <rect x={x} y={40} width={Math.max(0, w)} height={barH} fill={s.color} fillOpacity={s.pending ? 0.12 : 0.85} />
              {s.pending && (
                <>
                  <defs>
                    <pattern id={`hatch-${title}`} width={14} height={14} patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                      <line x1={0} y1={0} x2={0} y2={14} stroke={C.line} strokeOpacity={0.45} strokeWidth={3} />
                    </pattern>
                  </defs>
                  <rect x={x} y={40} width={Math.max(0, w)} height={barH} fill={`url(#hatch-${title})`} />
                </>
              )}
            </g>
          );
        })}
        {/* 門檻線 */}
        <line x1={tx} y1={40 - 34 * thr} x2={tx} y2={40 + barH + 34 * thr} stroke={C.yellow} strokeWidth={4} strokeDasharray="10 6" opacity={thr} />
        <g opacity={thr}>
          <rect x={tx - 92} y={-26} width={184} height={36} rx={6} fill={C.yellow} />
          <text x={tx} y={-1} textAnchor="middle" fontFamily={FONT_ZH} fontWeight={700} fontSize={24} fill="#0A1F45">過半門檻 {threshold}</text>
        </g>
        {/* 尺寸標註線 */}
        <g stroke={C.line} strokeOpacity={0.6} strokeWidth={1.5}>
          <line x1={0} y1={40 + barH + 8} x2={0} y2={40 + barH + 40} />
          <line x1={width} y1={40 + barH + 8} x2={width} y2={40 + barH + 40} />
          <line x1={0} y1={40 + barH + 30} x2={width} y2={40 + barH + 30} />
          <path d={`M0 ${40 + barH + 30} l12 -6 v12 z M${width} ${40 + barH + 30} l-12 -6 v12 z`} fill={C.line} />
        </g>
        <rect x={width / 2 - 70} y={40 + barH + 18} width={140} height={24} fill={C.bgBottom} />
        <text x={width / 2} y={40 + barH + 37} textAnchor="middle" fontFamily={FONT_MONO} fontSize={20} fill={C.dim}>{total} SEATS</text>
      </svg>
      {/* 圖例數字 */}
      <div style={{ position: "absolute", top: 262, left: 0, width, display: "flex", justifyContent: "space-between" }}>
        {segs.map((s, i) => (
          <div key={i} style={{ display: "flex", alignItems: "baseline", gap: 8, opacity: grow }}>
            <span style={{ width: 18, height: 18, background: s.pending ? "transparent" : s.color, border: `2px ${s.pending ? "dashed" : "solid"} ${s.pending ? C.line : s.color}`, display: "inline-block" }} />
            <span style={{ fontFamily: FONT_ZH, fontWeight: 700, fontSize: 28, color: s.pending ? C.dim : C.line }}>{s.label}</span>
            <span style={{ fontFamily: FONT_MONO, fontWeight: 700, fontSize: 36, color: s.pending ? C.dim : s.color }}>{Math.round(s.value * grow)}</span>
          </div>
        ))}
      </div>
      {note && (
        <div style={{ position: "absolute", top: 310, left: 0, width, textAlign: "left", fontFamily: FONT_ZH, fontWeight: 500, fontSize: 22, color: C.dim }}>{note}</div>
      )}
    </div>
  );
};

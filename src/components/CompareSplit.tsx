import React from "react";
import { useCurrentFrame } from "remotion";
import { lin, sp } from "../anim";
import { C, FONT_MONO, FONT_ZH } from "../theme";
import { Icon } from "./icons";

export type Side = { title: string; titleEn: string; icon: string; color?: string; stat?: string; points: string[]; hl?: number };

const Panel: React.FC<{ side: Side; delay: number; width: number; height: number }> = ({ side, delay, width, height }) => {
  const frame = useCurrentFrame();
  const p = sp(frame, delay, 16);
  const draw = lin(frame, delay, delay + 30);
  const color = side.color ?? C.line;
  return (
    <div
      style={{
        width, height, border: `2.5px solid ${color}`, borderRadius: 10, background: "rgba(10,31,69,0.55)", padding: 26,
        boxSizing: "border-box", opacity: p, transform: `translateY(${(1 - p) * 40}px)`, display: "flex", flexDirection: "column",
        alignItems: "center",
      }}
    >
      <div style={{ fontFamily: FONT_MONO, fontSize: 20, color: C.cyan, letterSpacing: 3 }}>{side.titleEn}</div>
      <div style={{ fontFamily: FONT_ZH, fontWeight: 900, fontSize: 54, color, marginTop: 4 }}>{side.title}</div>
      <div style={{ margin: "18px 0" }}>
        <Icon name={side.icon} size={170} progress={draw} color={color} />
      </div>
      {side.stat && <div style={{ fontFamily: FONT_MONO, fontWeight: 700, fontSize: 30, color: C.yellow, marginBottom: 12 }}>{side.stat}</div>}
      <div style={{ width: "100%", borderTop: `1.5px dashed ${C.gray}`, paddingTop: 14 }}>
        {side.points.map((pt, i) => {
          const q = sp(frame, delay + 18 + i * 8, 18);
          const isHl = side.hl === i;
          return (
            <div
              key={i}
              style={{
                fontFamily: FONT_ZH, fontWeight: 700, fontSize: 31, color: isHl ? C.yellow : C.line, lineHeight: 1.35, marginBottom: 10,
                opacity: q, transform: `translateX(${(1 - q) * -20}px)`, display: "flex", gap: 10,
              }}
            >
              <span style={{ fontFamily: FONT_MONO, color: C.cyan, fontSize: 24, paddingTop: 6 }}>{String(i + 1).padStart(2, "0")}</span>
              <span>{pt}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

/** 左右對比 */
export const CompareSplit: React.FC<{ left: Side; right: Side; width: number; height: number; delay?: number; vs?: string }> = ({
  left, right, width, height, delay = 0, vs = "VS",
}) => {
  const gap = 36;
  const pw = (width - gap) / 2;
  return (
    <div style={{ position: "relative", width, height, display: "flex", gap }}>
      <Panel side={left} delay={delay} width={pw} height={height} />
      <Panel side={right} delay={delay + 8} width={pw} height={height} />
      <div
        style={{
          position: "absolute", left: width / 2 - 34, top: 120, width: 68, height: 68, borderRadius: 34, background: C.bgBottom,
          border: `2.5px solid ${C.yellow}`, color: C.yellow, fontFamily: FONT_MONO, fontWeight: 700, fontSize: 24,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}
      >
        {vs}
      </div>
    </div>
  );
};

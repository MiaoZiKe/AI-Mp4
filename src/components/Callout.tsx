import React from "react";
import { useCurrentFrame } from "remotion";
import { lin, sp, typewriter } from "../anim";
import { C, FONT_MONO, FONT_ZH } from "../theme";

/** 引出線 + 標籤卡：虛線先延伸，標籤再彈出（標籤文字打字機） */
export const Callout: React.FC<{
  from: [number, number]; to: [number, number]; title: string; sub?: string; delay?: number; color?: string;
  align?: "left" | "right"; width?: number; children?: React.ReactNode;
}> = ({ from, to, title, sub, delay = 0, color = C.cyan, align = "left", width = 360, children }) => {
  const frame = useCurrentFrame();
  const p = lin(frame, delay, delay + 12);
  const pop = sp(frame, delay + 10, 12);
  const x = from[0] + (to[0] - from[0]) * p;
  const y = from[1] + (to[1] - from[1]) * p;
  const left = align === "left" ? to[0] : to[0] - width;
  return (
    <>
      <svg style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }} width={1} height={1}>
        <circle cx={from[0]} cy={from[1]} r={7} fill={color} opacity={p > 0 ? 1 : 0} />
        <circle cx={from[0]} cy={from[1]} r={14} fill="none" stroke={color} strokeWidth={2} opacity={p > 0 ? 0.6 : 0} />
        <line x1={from[0]} y1={from[1]} x2={x} y2={y} stroke={color} strokeWidth={2.5} strokeDasharray="10 8" />
      </svg>
      <div
        style={{
          position: "absolute", left, top: to[1] - 34, width, transform: `scale(${0.6 + pop * 0.4})`,
          transformOrigin: align === "left" ? "left center" : "right center", opacity: pop,
          border: `2px solid ${color}`, background: "rgba(10,31,69,0.92)", borderRadius: 8, padding: "10px 16px",
        }}
      >
        <div style={{ fontFamily: FONT_ZH, fontWeight: 700, fontSize: 32, color: C.line, lineHeight: 1.25 }}>
          {typewriter(title, frame, delay + 12, 22)}
        </div>
        {sub && <div style={{ fontFamily: FONT_MONO, fontSize: 20, color, marginTop: 4, letterSpacing: 1 }}>{sub}</div>}
        {children && <div style={{ marginTop: 8 }}>{children}</div>}
      </div>
    </>
  );
};

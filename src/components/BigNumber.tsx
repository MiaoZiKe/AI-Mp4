import React from "react";
import { useCurrentFrame } from "remotion";
import { sp } from "../anim";
import { C, FONT_MONO, FONT_ZH } from "../theme";

/** 大數字強調：數字遞增動畫；value 為字串時（例如日期）則彈出 */
export const BigNumber: React.FC<{
  value: number | string; prefix?: string; suffix?: string; label: string; sub?: string; delay?: number; color?: string;
  size?: number; decimals?: number; thousands?: boolean;
}> = ({ value, prefix = "", suffix = "", label, sub, delay = 0, color = C.yellow, size = 150, decimals = 0, thousands = false }) => {
  const frame = useCurrentFrame();
  const p = sp(frame, delay, 22, 36);
  let shown: string;
  if (typeof value === "number") {
    const v = value * p;
    shown = thousands ? Math.round(v).toLocaleString("en-US") : v.toFixed(decimals);
  } else shown = value;
  return (
    <div style={{ textAlign: "center", opacity: Math.min(1, p * 2), transform: `translateY(${(1 - p) * 30}px)` }}>
      <div style={{ fontFamily: FONT_MONO, fontWeight: 700, fontSize: size, color, lineHeight: 1, letterSpacing: -2 }}>
        {prefix}{shown}{suffix}
      </div>
      <div style={{ fontFamily: FONT_ZH, fontWeight: 700, fontSize: 36, color: C.line, marginTop: 14 }}>{label}</div>
      {sub && <div style={{ fontFamily: FONT_MONO, fontSize: 20, color: C.cyan, marginTop: 6, letterSpacing: 2 }}>{sub}</div>}
    </div>
  );
};

import React from "react";
import { useCurrentFrame } from "remotion";
import { lin } from "../anim";
import { C } from "../theme";

/** 黃框框選 / 圓圈圈選，描線出現後脈衝 */
export const HighlightBox: React.FC<{
  x: number; y: number; w: number; h: number; delay?: number; shape?: "rect" | "circle"; color?: string; label?: string;
}> = ({ x, y, w, h, delay = 0, shape = "rect", color = C.yellow }) => {
  const frame = useCurrentFrame();
  const p = lin(frame, delay, delay + 14);
  const pulseT = Math.max(0, frame - delay - 14);
  const pulse = p >= 1 ? (Math.sin(pulseT / 6) + 1) / 2 : 0;
  const pad = 8 + pulse * 6;
  const common = {
    fill: "none", stroke: color, strokeWidth: 4, pathLength: 1, strokeDasharray: 1, strokeDashoffset: 1 - p,
    strokeLinecap: "round" as const,
  };
  return (
    <svg style={{ position: "absolute", left: 0, top: 0, overflow: "visible", pointerEvents: "none" }} width={1} height={1}>
      {shape === "rect" ? (
        <>
          <rect x={x} y={y} width={w} height={h} rx={10} {...common} />
          <rect x={x - pad} y={y - pad} width={w + pad * 2} height={h + pad * 2} rx={14} fill="none" stroke={color} strokeWidth={2} opacity={p >= 1 ? 0.55 * (1 - pulse) : 0} />
        </>
      ) : (
        <>
          <ellipse cx={x + w / 2} cy={y + h / 2} rx={w / 2} ry={h / 2} {...common} transform={`rotate(-4 ${x + w / 2} ${y + h / 2})`} />
          <ellipse cx={x + w / 2} cy={y + h / 2} rx={w / 2 + pad} ry={h / 2 + pad} fill="none" stroke={color} strokeWidth={2} opacity={p >= 1 ? 0.55 * (1 - pulse) : 0} />
        </>
      )}
    </svg>
  );
};

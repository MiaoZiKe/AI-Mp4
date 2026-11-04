import React from "react";
import { useCurrentFrame } from "remotion";
import { lin, sp } from "../anim";
import { C, FONT_MONO, FONT_ZH } from "../theme";

export type Step = { text: string; en?: string; color?: string; blocked?: boolean };

/** 流程箭頭：節點依序彈出、箭頭描線；blocked 的箭頭顯示 ✕ */
export const FlowRow: React.FC<{ steps: Step[]; width: number; delay?: number; boxH?: number; stagger?: number }> = ({
  steps, width, delay = 0, boxH = 130, stagger = 12,
}) => {
  const frame = useCurrentFrame();
  const arrowW = 62;
  const n = steps.length;
  const bw = (width - arrowW * (n - 1)) / n;
  return (
    <div style={{ display: "flex", alignItems: "center", width }}>
      {steps.map((s, i) => {
        const p = sp(frame, delay + i * stagger, 14);
        const a = lin(frame, delay + i * stagger + 6, delay + i * stagger + 14);
        const color = s.color ?? C.line;
        return (
          <React.Fragment key={i}>
            {i > 0 && (
              <svg width={arrowW} height={boxH} style={{ overflow: "visible" }}>
                <line x1={6} y1={boxH / 2} x2={6 + (arrowW - 16) * a} y2={boxH / 2} stroke={steps[i].blocked ? "#FF9F6B" : C.cyan} strokeWidth={3} strokeDasharray={steps[i].blocked ? "8 6" : undefined} />
                {a >= 1 && <path d={`M${arrowW - 10} ${boxH / 2} l-14 -9 v18 z`} fill={steps[i].blocked ? "#FF9F6B" : C.cyan} />}
                {steps[i].blocked && a >= 1 && (
                  <g stroke="#FF9F6B" strokeWidth={4}>
                    <line x1={arrowW / 2 - 12} y1={boxH / 2 - 12} x2={arrowW / 2 + 12} y2={boxH / 2 + 12} />
                    <line x1={arrowW / 2 + 12} y1={boxH / 2 - 12} x2={arrowW / 2 - 12} y2={boxH / 2 + 12} />
                  </g>
                )}
              </svg>
            )}
            <div
              style={{
                width: bw, height: boxH, boxSizing: "border-box", border: `2.5px ${s.blocked ? "dashed" : "solid"} ${s.blocked ? "#FF9F6B" : color}`,
                borderRadius: 10, background: "rgba(10,31,69,0.7)", display: "flex", flexDirection: "column", alignItems: "center",
                justifyContent: "center", textAlign: "center", padding: 8, opacity: p, transform: `scale(${0.7 + 0.3 * p})`,
              }}
            >
              <div style={{ fontFamily: FONT_ZH, fontWeight: 700, fontSize: 30, color: s.blocked ? "#FF9F6B" : color, lineHeight: 1.25, whiteSpace: "pre-line" }}>{s.text}</div>
              {s.en && <div style={{ fontFamily: FONT_MONO, fontSize: 17, color: C.cyan, marginTop: 6, letterSpacing: 1 }}>{s.en}</div>}
            </div>
          </React.Fragment>
        );
      })}
    </div>
  );
};

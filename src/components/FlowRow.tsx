import React from "react";
import { useCurrentFrame } from "remotion";
import { C, FONT_ZH, accent, glow } from "../theme";
import { Card } from "./Card";
import { Icon } from "./Icons";
import { progress, riseFor } from "./anim";
import { useV2 } from "../style";

type Step = { icon: string; label: string; note?: string; color?: string };
/** 直向流程：卡片 → 描線箭頭 → 卡片 */
export const FlowRow: React.FC<{ title?: string; steps: Step[] }> = ({ title, steps }) => {
  const f = useCurrentFrame();
  const v2 = useV2();
  const R = riseFor(v2);
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: 900 }}>
      {title && <div style={{ ...R(f, 0), fontFamily: FONT_ZH, fontSize: 52, fontWeight: 900, color: C.white, marginBottom: 24 }}>{title}</div>}
      {steps.map((s, i) => {
        const d = 8 + i * 22;
        const col = accent(s.color);
        return (
          <React.Fragment key={i}>
            {i > 0 && (
              <svg width={60} height={70} style={{ filter: glow(C.cyan, 6) }}>
                <path d="M30 4v50M16 42l14 16 14-16" fill="none" stroke={C.cyan} strokeWidth={3} strokeLinecap="round"
                  {...(v2 ? { pathLength: 1, strokeDasharray: "1 1", strokeDashoffset: 1 - progress(f, d - 10, 12) } : { strokeDasharray: 100, strokeDashoffset: 100 * (1 - progress(f, d - 10, 12)) })} />
              </svg>
            )}
            <Card color={col} style={{ ...R(f, d), width: "100%", padding: "22px 32px", display: "flex", alignItems: "center", gap: 26 }}>
              <Icon name={s.icon} color={col} size={96} />
              <div>
                <div style={{ fontFamily: FONT_ZH, fontSize: 46, fontWeight: 900, color: col }}>{s.label}</div>
                {s.note && <div style={{ fontFamily: FONT_ZH, fontSize: 34, color: "rgba(255,255,255,0.85)", marginTop: 6 }}>{s.note}</div>}
              </div>
            </Card>
          </React.Fragment>
        );
      })}
    </div>
  );
};

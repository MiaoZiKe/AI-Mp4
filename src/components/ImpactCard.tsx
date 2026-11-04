import React from "react";
import { useCurrentFrame } from "remotion";
import { lin, sp } from "../anim";
import { C, Certainty, CERT_COLOR, FONT_MONO, FONT_ZH } from "../theme";
import { CertTag } from "./CertTag";
import { Icon } from "./icons";

/** 影響卡：圖示 + 標題 + 說明 + 確定度標籤 */
export const ImpactCard: React.FC<{
  title: string; body: string; cert: Certainty; icon?: string; delay?: number; width: number; index?: number;
}> = ({ title, body, cert, icon, delay = 0, width, index }) => {
  const frame = useCurrentFrame();
  const p = sp(frame, delay, 16);
  const draw = lin(frame, delay + 4, delay + 26);
  const color = CERT_COLOR[cert];
  return (
    <div
      style={{
        width, boxSizing: "border-box", display: "flex", gap: 22, alignItems: "center", padding: "20px 24px",
        border: `2px solid rgba(255,255,255,0.6)`, borderLeft: `8px solid ${color}`, borderRadius: 10,
        background: "rgba(10,31,69,0.72)", opacity: p, transform: `translateX(${(1 - p) * 60}px)`,
      }}
    >
      {icon && (
        <div style={{ width: 110, flexShrink: 0, display: "flex", justifyContent: "center" }}>
          <Icon name={icon} size={100} progress={draw} />
        </div>
      )}
      <div style={{ flex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
          {index !== undefined && <span style={{ fontFamily: FONT_MONO, fontSize: 22, color: C.cyan }}>#{String(index).padStart(2, "0")}</span>}
          <CertTag cert={cert} size={24} />
        </div>
        <div style={{ fontFamily: FONT_ZH, fontWeight: 900, fontSize: 38, color: C.line, marginTop: 10, lineHeight: 1.25 }}>{title}</div>
        <div style={{ fontFamily: FONT_ZH, fontWeight: 500, fontSize: 28, color: C.dim, marginTop: 6, lineHeight: 1.4 }}>{body}</div>
      </div>
    </div>
  );
};

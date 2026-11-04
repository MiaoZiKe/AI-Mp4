import React from "react";
import { Certainty, CERT_COLOR, CERT_EN, FONT_MONO, FONT_ZH } from "../theme";

/** 確定度標籤：已確定／分析預期／尚未確定 */
export const CertTag: React.FC<{ cert: Certainty; size?: number; note?: string }> = ({ cert, size = 24, note }) => {
  const color = CERT_COLOR[cert];
  return (
    <span
      style={{
        display: "inline-flex", alignItems: "center", gap: 8, border: `2px ${cert === "尚未確定" ? "dashed" : "solid"} ${color}`,
        color, borderRadius: 6, padding: `${size * 0.18}px ${size * 0.45}px`, fontFamily: FONT_ZH, fontWeight: 700, fontSize: size,
        lineHeight: 1.1, background: "rgba(10,31,69,0.6)", whiteSpace: "nowrap",
      }}
    >
      {cert}
      <span style={{ fontFamily: FONT_MONO, fontSize: size * 0.62, opacity: 0.85, letterSpacing: 1 }}>{note ?? CERT_EN[cert]}</span>
    </span>
  );
};

import React from "react";
import { useCurrentFrame } from "remotion";
import { C, FONT_ZH, FONT_EN, accent, glow } from "../theme";
import { Icon } from "./Icons";
import { rise, progress } from "./anim";

/** 大數字（遞增動畫） */
export const BigNumber: React.FC<{ icon?: string; label: string; value: number; decimals?: number; prefix?: string; suffix?: string; note?: string; color?: string; tag?: string }> = ({ icon, label, value, decimals = 0, prefix = "", suffix = "", note, color, tag }) => {
  const f = useCurrentFrame();
  const col = accent(color);
  const v = value * (1 - Math.pow(1 - progress(f, 10, 40), 3));
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: 900, textAlign: "center" }}>
      {icon && <div style={rise(f, 0)}><Icon name={icon} color={col} size={150} draw={progress(f, 0, 30)} /></div>}
      <div style={{ ...rise(f, 4), fontFamily: FONT_ZH, fontSize: 48, fontWeight: 700, color: C.white, marginTop: 16 }}>{label}</div>
      <div style={{ fontFamily: FONT_EN, fontWeight: 800, fontSize: 150, color: col, filter: glow(col, 14), marginTop: 8 }}>
        {prefix}{v.toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}{suffix}
      </div>
      {note && <div style={{ ...rise(f, 30), fontFamily: FONT_ZH, fontSize: 36, color: "rgba(255,255,255,0.85)", lineHeight: 1.45 }}>{note}</div>}
      {tag && <div style={{ ...rise(f, 36), marginTop: 22 }}><StatusTag status={tag} /></div>}
    </div>
  );
};

export const STATUS: Record<string, { zh: string; color: string }> = {
  fact: { zh: "已確定", color: C.cyan },
  expected: { zh: "分析預期", color: C.yellow },
  pending: { zh: "尚未確定", color: C.pink },
};
export const StatusTag: React.FC<{ status: string; text?: string }> = ({ status, text }) => {
  const s = STATUS[status] ?? STATUS.expected;
  return (
    <span style={{ fontFamily: FONT_ZH, fontSize: 30, fontWeight: 700, color: s.color, border: `1.5px solid ${s.color}`, borderRadius: 999, padding: "6px 22px", boxShadow: `0 0 12px ${s.color}44`, whiteSpace: "nowrap" }}>
      {text ?? s.zh}
    </span>
  );
};

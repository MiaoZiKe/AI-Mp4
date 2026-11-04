import React from "react";
import { C, FONT_MONO, FONT_ZH, SAFE, W } from "../theme";
import { Logo } from "./icons";

/** 左上 logo + 頻道名；右上系列膠囊標籤 */
export const Header: React.FC<{ channel: string; series: string; channelEn?: string }> = ({ channel, series, channelEn = "BAIHUA INTL" }) => (
  <div
    style={{
      position: "absolute", top: SAFE.top + 4, left: SAFE.left, width: W - SAFE.left - SAFE.right,
      display: "flex", alignItems: "center", justifyContent: "space-between",
    }}
  >
    <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
      <Logo size={64} />
      <div>
        <div style={{ fontFamily: FONT_ZH, fontWeight: 900, fontSize: 38, color: C.line, lineHeight: 1.05 }}>{channel}</div>
        <div style={{ fontFamily: FONT_MONO, fontSize: 16, color: C.cyan, letterSpacing: 3 }}>{channelEn}</div>
      </div>
    </div>
    <div
      style={{
        border: `2px solid ${C.yellow}`, borderRadius: 999, padding: "8px 26px", fontFamily: FONT_ZH, fontWeight: 700,
        fontSize: 30, color: C.yellow, background: "rgba(255,200,61,0.08)",
      }}
    >
      {series}
    </div>
  </div>
);

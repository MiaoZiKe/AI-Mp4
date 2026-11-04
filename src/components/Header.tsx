import React from "react";
import { C, FONT_ZH, SAFE, glow } from "../theme";
export const Header: React.FC = () => (
  <div style={{ position: "absolute", top: SAFE.top, left: SAFE.x, right: SAFE.x, display: "flex", justifyContent: "space-between", alignItems: "center", fontFamily: FONT_ZH }}>
    <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
      <svg width={64} height={64} viewBox="0 0 64 64" style={{ filter: glow(C.cyan, 8) }}>
        <circle cx="32" cy="32" r="26" fill="none" stroke={C.cyan} strokeWidth={3} />
        <ellipse cx="32" cy="32" rx="10" ry="26" fill="none" stroke={C.cyan} strokeWidth={3} />
        <path d="M6 32h52" stroke={C.pink} strokeWidth={3} />
      </svg>
      <span style={{ color: C.white, fontSize: 40, fontWeight: 900, letterSpacing: 2 }}>白話國際</span>
    </div>
    <div style={{ border: `1.5px solid ${C.pink}`, color: C.pink, borderRadius: 999, padding: "10px 26px", fontSize: 30, fontWeight: 700, boxShadow: `0 0 14px ${C.pink}55` }}>
      國際白話講
    </div>
  </div>
);

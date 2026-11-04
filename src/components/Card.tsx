import React from "react";
import { C, boxGlow } from "../theme";
export const Card: React.FC<{ color?: string; style?: React.CSSProperties; children: React.ReactNode }> = ({ color = C.cyan, style, children }) => (
  <div style={{ background: C.card, borderRadius: 20, border: `1.5px solid ${color}`, boxShadow: boxGlow(color), padding: 36, ...style }}>{children}</div>
);

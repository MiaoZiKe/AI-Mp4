import React from "react";
import { useCurrentFrame } from "remotion";
import { C, FONT_ZH, FONT_EN, accent } from "../theme";
import { Card } from "./Card";
import { Icon } from "./Icons";
import { rise } from "./anim";

type Side = { title: string; titleEn?: string; icon: string; color?: string; items: string[] };
/** 左右對照 */
export const CompareSplit: React.FC<{ left: Side; right: Side; footer?: string }> = ({ left, right, footer }) => {
  const f = useCurrentFrame();
  const side = (s: Side, d: number) => {
    const col = accent(s.color);
    return (
      <Card color={col} style={{ ...rise(f, d), flex: 1, padding: 30, display: "flex", flexDirection: "column", alignItems: "center" }}>
        <Icon name={s.icon} color={col} size={110} />
        <div style={{ fontFamily: FONT_ZH, fontSize: 54, fontWeight: 900, color: col, marginTop: 10 }}>{s.title}</div>
        {s.titleEn && <div style={{ fontFamily: FONT_EN, fontSize: 26, color: "rgba(255,255,255,0.7)" }}>{s.titleEn}</div>}
        <div style={{ marginTop: 20, alignSelf: "stretch" }}>
          {s.items.map((it, i) => (
            <div key={i} style={{ ...rise(f, d + 12 + i * 7, 16), fontFamily: FONT_ZH, fontSize: 34, lineHeight: 1.4, color: C.white, padding: "12px 0", borderTop: i ? "1px solid rgba(255,255,255,0.12)" : "none" }}>{it}</div>
          ))}
        </div>
      </Card>
    );
  };
  return (
    <div style={{ width: 952 }}>
      <div style={{ display: "flex", gap: 24 }}>{side(left, 0)}{side(right, 8)}</div>
      {footer && <div style={{ ...rise(f, 45), fontFamily: FONT_ZH, fontSize: 34, color: C.yellow, textAlign: "center", marginTop: 26 }}>{footer}</div>}
    </div>
  );
};

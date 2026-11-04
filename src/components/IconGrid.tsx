import React from "react";
import { useCurrentFrame } from "remotion";
import { C, FONT_ZH, accent } from "../theme";
import { Card } from "./Card";
import { Icon } from "./Icons";
import { rise } from "./anim";

type Item = { icon: string; label: string; note?: string; color?: string };
export const IconGrid: React.FC<{ title?: string; items: Item[]; columns?: number }> = ({ title, items, columns = 2 }) => {
  const f = useCurrentFrame();
  return (
    <div style={{ width: 952 }}>
      {title && <div style={{ ...rise(f, 0), fontFamily: FONT_ZH, fontSize: 56, fontWeight: 900, color: C.white, textAlign: "center", marginBottom: 30 }}>{title}</div>}
      <div style={{ display: "grid", gridTemplateColumns: `repeat(${columns}, 1fr)`, gap: 24 }}>
        {items.map((it, i) => {
          const col = accent(it.color);
          return (
            <Card key={i} color={col} style={{ ...rise(f, 8 + i * 7), padding: 26, display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
              <Icon name={it.icon} color={col} size={100} />
              <div style={{ fontFamily: FONT_ZH, fontSize: 40, fontWeight: 900, color: col, marginTop: 10 }}>{it.label}</div>
              {it.note && <div style={{ fontFamily: FONT_ZH, fontSize: 30, color: "rgba(255,255,255,0.85)", marginTop: 6, lineHeight: 1.35 }}>{it.note}</div>}
            </Card>
          );
        })}
      </div>
    </div>
  );
};

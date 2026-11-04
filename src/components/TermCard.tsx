import React from "react";
import { useCurrentFrame } from "remotion";
import { C, FONT_ZH, FONT_EN, accent } from "../theme";
import { Card } from "./Card";
import { Icon } from "./Icons";
import { rise, progress } from "./anim";

/** 名詞解釋卡：圖示 + 名詞 + 打字機效果的解釋 */
export const TermCard: React.FC<{ icon: string; term: string; termEn?: string; definition: string; points?: string[]; color?: string }> = ({ icon, term, termEn, definition, points = [], color }) => {
  const f = useCurrentFrame();
  const col = accent(color);
  const n = Math.floor(progress(f, 18, 45) * definition.length);
  return (
    <Card color={col} style={{ ...rise(f, 0), width: 900 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
        <Icon name={icon} color={col} size={130} draw={progress(f, 0, 30)} />
        <div>
          <div style={{ fontFamily: FONT_ZH, fontSize: 68, fontWeight: 900, color: col }}>{term}</div>
          {termEn && <div style={{ fontFamily: FONT_EN, fontSize: 30, color: "rgba(255,255,255,0.7)" }}>{termEn}</div>}
        </div>
      </div>
      <div style={{ fontFamily: FONT_ZH, fontSize: 44, lineHeight: 1.5, color: C.white, marginTop: 28, minHeight: 132 }}>
        {definition.slice(0, n)}<span style={{ opacity: n < definition.length ? 1 : 0, color: col }}>▍</span>
      </div>
      {points.map((p, i) => (
        <div key={i} style={{ ...rise(f, 50 + i * 8, 20), fontFamily: FONT_ZH, fontSize: 38, color: "rgba(255,255,255,0.88)", marginTop: 14 }}>
          <span style={{ color: col }}>● </span>{p}
        </div>
      ))}
    </Card>
  );
};

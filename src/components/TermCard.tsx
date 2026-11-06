import React from "react";
import { useCurrentFrame } from "remotion";
import { C, FONT_ZH, FONT_EN, accent } from "../theme";
import { Card } from "./Card";
import { Icon } from "./Icons";
import { progress, riseFor, typeChars } from "./anim";
import { useV2 } from "../style";

/** 名詞解釋卡：圖示 + 名詞 + 打字機效果的解釋 */
export const TermCard: React.FC<{ icon: string; term: string; termEn?: string; definition: string; points?: string[]; color?: string }> = ({ icon, term, termEn, definition, points = [], color }) => {
  const f = useCurrentFrame();
  const v2 = useV2();
  const R = riseFor(v2);
  const col = accent(color);
  // v1：固定 45 幀打完（長短句速度不同）；v2：依字數（每字 2 幀）
  const n = v2 ? typeChars(f, 18, definition.length) : Math.floor(progress(f, 18, 45) * definition.length);
  return (
    <Card color={col} style={{ ...R(f, 0), width: 900 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
        <Icon name={icon} color={col} size={130} draw={progress(f, 0, 30)} />
        <div>
          <div style={{ fontFamily: FONT_ZH, fontSize: 68, fontWeight: 900, color: col }}>{term}</div>
          {termEn && <div style={{ fontFamily: FONT_EN, fontSize: 30, color: "rgba(255,255,255,0.7)" }}>{termEn}</div>}
        </div>
      </div>
      <div style={{ fontFamily: FONT_ZH, fontSize: 44, lineHeight: 1.5, color: C.white, marginTop: 28, minHeight: 132 }}>
        {definition.slice(0, n)}<span style={{ opacity: n < definition.length ? 1 : 0, color: col }}>▍</span>
        {/* v2：未打出的字先佔位（透明），卡片高度從第一幀就固定，換行時不會整張卡片跳動 */}
        {v2 && n < definition.length ? <span style={{ opacity: 0 }}>{definition.slice(n)}</span> : null}
      </div>
      {points.map((p, i) => (
        <div key={i} style={{ ...R(f, 50 + i * 8, 20), fontFamily: FONT_ZH, fontSize: 38, color: "rgba(255,255,255,0.88)", marginTop: 14 }}>
          <span style={{ color: col }}>● </span>{p}
        </div>
      ))}
    </Card>
  );
};

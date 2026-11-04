import React from "react";
import { useCurrentFrame } from "remotion";
import { C, FONT_ZH, FONT_EN, accent } from "../theme";
import { Card } from "./Card";
import { Icon } from "./Icons";
import { rise, progress } from "./anim";
import { StatusTag } from "./BigNumber";

type Row = { status: "fact" | "expected" | "pending"; text: string };
/** 影響卡：每條附「已確定／分析預期／尚未確定」標籤 */
export const ImpactCard: React.FC<{ icon: string; title: string; titleEn?: string; color?: string; rows: Row[]; taiwan?: string }> = ({ icon, title, titleEn, color, rows, taiwan }) => {
  const f = useCurrentFrame();
  const col = accent(color);
  return (
    <Card color={col} style={{ ...rise(f, 0), width: 952, padding: "32px 40px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
        <Icon name={icon} color={col} size={110} draw={progress(f, 0, 30)} />
        <div>
          <div style={{ fontFamily: FONT_ZH, fontSize: 58, fontWeight: 900, color: col }}>{title}</div>
          {titleEn && <div style={{ fontFamily: FONT_EN, fontSize: 26, color: "rgba(255,255,255,0.7)" }}>{titleEn}</div>}
        </div>
      </div>
      {rows.map((r, i) => (
        <div key={i} style={{ ...rise(f, 14 + i * 9, 18), display: "flex", alignItems: "flex-start", gap: 18, marginTop: 24 }}>
          <StatusTag status={r.status} />
          <div style={{ fontFamily: FONT_ZH, fontSize: 36, lineHeight: 1.42, color: C.white }}>{r.text}</div>
        </div>
      ))}
      {taiwan && (
        <div style={{ ...rise(f, 14 + rows.length * 9 + 6, 18), marginTop: 28, padding: "18px 24px", borderRadius: 14, background: "rgba(255,213,74,0.08)", border: `1px solid ${C.yellow}66`, fontFamily: FONT_ZH, fontSize: 34, lineHeight: 1.42, color: C.yellow }}>
          台灣視角：{taiwan}
        </div>
      )}
    </Card>
  );
};

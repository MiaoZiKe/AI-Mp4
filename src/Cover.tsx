import React from "react";
import { AbsoluteFill } from "remotion";
import type { Script } from "./types";
import { C, FONT_ZH, FONT_EN, SAFE, glow } from "./theme";
import { Background, Header, Icon, StatusTag } from "./components";

/** 封面：大標 + 霓虹圖示 */
export const Cover: React.FC<Script & { cover?: { title: string[]; sub: string; en: string } }> = ({ cover, asOf }) => {
  const c = cover ?? { title: ["期中選舉"], sub: "", en: "" };
  return (
    <AbsoluteFill>
      <Background />
      <Header />
      <div style={{ position: "absolute", left: SAFE.x, right: SAFE.x, top: 420, display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
        <div style={{ display: "flex", gap: 40 }}>
          <Icon name="capitol" color={C.cyan} size={200} />
          <Icon name="chip" color={C.pink} size={200} />
        </div>
        {c.title.map((t, i) => (
          <div key={i} style={{ fontFamily: FONT_ZH, fontWeight: 900, fontSize: 132, lineHeight: 1.18, marginTop: i ? 0 : 60, color: i === 1 ? C.yellow : C.white, filter: i === 1 ? glow(C.yellow, 10) : undefined }}>{t}</div>
        ))}
        <div style={{ fontFamily: FONT_ZH, fontWeight: 700, fontSize: 56, color: C.cyan, marginTop: 40 }}>{c.sub}</div>
        <div style={{ fontFamily: FONT_EN, fontSize: 32, color: "rgba(255,255,255,0.7)", marginTop: 16 }}>{c.en}</div>
        <div style={{ marginTop: 70, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, width: 820 }}>
          {[["container", "關稅", C.cyan], ["chip", "晶片", C.pink], ["shield", "台海", C.yellow], ["chart", "台股", C.purple]].map(([ic, t, col]) => (
            <div key={t} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 18, background: C.card, border: `1.5px solid ${col}`, borderRadius: 20, padding: "18px 0", boxShadow: `0 0 18px ${col}55` }}>
              <Icon name={ic} color={col} size={70} />
              <span style={{ fontFamily: FONT_ZH, fontWeight: 900, fontSize: 52, color: col }}>{t}</span>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 56, display: "flex", gap: 20 }}>
          <StatusTag status="fact" text={`資料截至 ${asOf}`} />
          <StatusTag status="pending" text="眾院最終席次尚未確定" />
        </div>
      </div>
    </AbsoluteFill>
  );
};

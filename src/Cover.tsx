import React from "react";
import { AbsoluteFill } from "remotion";
import { BlueprintBackground, Header, HighlightBox, Icon } from "./components";
import { C, FONT_MONO, FONT_ZH, SAFE } from "./theme";
import { VideoProps } from "./types";

/** 封面：大字問句 + 主視覺（國會 ↔ 台灣） */
export const Cover: React.FC<VideoProps> = ({ script }) => {
  const { lines, highlight, kicker, badge } = script.cover;
  return (
    <AbsoluteFill>
      <BlueprintBackground sheet="COVER" />
      <Header channel={script.channel} series={script.series} />
      <div style={{ position: "absolute", left: SAFE.left, top: 380 }}>
        <div style={{ fontFamily: FONT_MONO, fontSize: 26, color: C.cyan, letterSpacing: 4, marginBottom: 18 }}>US MIDTERMS 2026 // TAIWAN</div>
        {lines.map((l, i) => {
          const parts = l.split(highlight);
          return (
            <div key={i} style={{ fontFamily: FONT_ZH, fontWeight: 900, fontSize: 132, lineHeight: 1.18, color: C.line }}>
              {parts.length > 1 ? (<>{parts[0]}<span style={{ color: C.yellow }}>{highlight}</span>{parts[1]}</>) : l}
            </div>
          );
        })}
      </div>
      <div style={{ position: "absolute", left: SAFE.left + 10, top: 1010 }}>
        <Icon name="capitol" size={400} />
      </div>
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        <path d="M480 1180 C 600 1100, 700 1110, 790 1160" stroke={C.cyan} strokeWidth={3} strokeDasharray="12 10" fill="none" />
        <path d="M790 1160 l-20 -4 l8 18 z" fill={C.cyan} />
      </svg>
      <div style={{ position: "absolute", left: 800, top: 960 }}>
        <Icon name="taiwan" size={170} color={C.yellow} fill="rgba(255,200,61,0.15)" />
      </div>
      <HighlightBox x={770} y={930} w={230} h={420} shape="circle" delay={-30} />
      <div style={{ position: "absolute", left: SAFE.left, right: SAFE.right, top: 1420, textAlign: "center" }}>
        <div style={{ display: "inline-block", background: C.yellow, color: "#0A1F45", fontFamily: FONT_ZH, fontWeight: 900, fontSize: 52, padding: "14px 34px", borderRadius: 10 }}>{kicker}</div>
        <div style={{ marginTop: 28, fontFamily: FONT_MONO, fontSize: 28, color: C.cyan, letterSpacing: 2 }}>{badge}</div>
      </div>
    </AbsoluteFill>
  );
};

import React from "react";
import { AbsoluteFill } from "remotion";
import type { Script } from "../../types";
import { FONT_EN, FONT_ZH, LAYOUT_V2 as L, THEME_V2 as T, accentV2 } from "../../theme";
import { BackgroundV2, CardV2, HeaderV2, IconV2, KickerV2, markerBg } from "./base";

/** 封面插圖：先升（飛輪）後跌（反轉），頂點放圖示；標籤文字由 cover.illus 決定 */
const RiseFall: React.FC<{ up?: string; down?: string; icon?: string }> = ({ up, down, icon = "bitcoin" }) => {
  const pts = [[40, 520], [140, 470], [230, 430], [320, 330], [410, 300], [500, 190], [590, 170], [670, 250], [760, 300], [850, 420], [910, 450]];
  const path = (a: number[][]) => a.map((p, i) => `${i ? "L" : "M"}${p[0]} ${p[1]}`).join(" ");
  return (
    <svg width={952} height={600} viewBox="0 -60 952 680">
      {[120, 240, 360, 480, 600].map((y) => <line key={y} x1={20} x2={932} y1={y} y2={y} stroke={T.divider} strokeWidth={2} />)}
      <path d={`${path(pts)} L910 600 L40 600 Z`} fill={T.accent.yellow.soft} />
      <path d={path(pts.slice(0, 7))} fill="none" stroke={T.accent.cyan.fill} strokeWidth={10} strokeLinecap="square" strokeLinejoin="round" />
      <path d={path(pts.slice(6))} fill="none" stroke={T.accent.pink.fill} strokeWidth={10} strokeLinecap="square" strokeLinejoin="round" />
      <path d="M870 380 L912 452 L830 456" fill="none" stroke={T.accent.pink.fill} strokeWidth={10} strokeLinecap="square" strokeLinejoin="round" />
      <foreignObject x={490} y={-60} width={200} height={200}><IconV2 name={icon} color="yellow" size={190} /></foreignObject>
      {up && <g><rect x={70} y={254} width={250} height={64} rx={T.radiusTag} fill={T.card} /><text x={195} y={298} textAnchor="middle" fontFamily="Noto Sans TC" fontWeight={900} fontSize={34} fill={T.text}>{up}</text></g>}
      {down && <g><rect x={670} y={514} width={240} height={64} rx={T.radiusTag} fill={T.accent.pink.fill} /><text x={790} y={558} textAnchor="middle" fontFamily="Noto Sans TC" fontWeight={900} fontSize={34} fill={T.onAccent}>{down}</text></g>}
    </svg>
  );
};

/** 封面（v2，A-1 版型）：kicker、≤10 字大標（第 mark 行螢光筆）、副標、插圖、三格重點、來源列 */
export const CoverV2: React.FC<Script> = ({ cover, asOf, scenes }) => {
  const c: any = cover ?? { title: ["—"], sub: "" };
  const srcs = [...new Set(scenes.flatMap((s) => s.sources))].filter((x) => !/綜合/.test(x)).slice(0, 3);
  return (
    <AbsoluteFill>
      <BackgroundV2 />
      <HeaderV2 progress={false} />
      <div style={{ position: "absolute", left: L.X, right: L.X, top: L.CONTENT_TOP + 4, display: "flex", flexDirection: "column" }}>
        {c.kicker && <KickerV2 text={c.kicker} style={{ alignSelf: "flex-start" }} />}
        <div style={{ marginTop: 22, fontFamily: FONT_ZH, fontWeight: T.weight.title, fontSize: 148, lineHeight: 1.1, letterSpacing: "-0.01em", color: T.text }}>
          {c.title.map((t: string, i: number) => <div key={i} style={{ whiteSpace: "nowrap" }}><span style={i === (c.mark ?? 1) ? { ...markerBg(1), paddingRight: 6 } : undefined}>{t}</span></div>)}
        </div>
        {c.sub && <div style={{ marginTop: 26, fontFamily: FONT_ZH, fontSize: 46, fontWeight: 700, color: T.text2 }}>{c.sub}</div>}
        {c.en && <div style={{ marginTop: 6, fontFamily: FONT_EN, fontSize: 28, color: T.text3 }}>{c.en}</div>}
        <div style={{ marginTop: 10, display: "flex", justifyContent: "center" }}><RiseFall {...(c.illus ?? {})} /></div>
        {c.chips?.length > 0 && (
          <div style={{ display: "grid", gridTemplateColumns: `repeat(${c.chips.length}, 1fr)`, gap: 20, marginTop: 6 }}>
            {c.chips.map((ch: any, i: number) => (
              <CardV2 key={i} topBar={ch.color} style={{ padding: "22px 22px", display: "flex", flexDirection: "column", gap: 8 }}>
                <b style={{ fontFamily: FONT_ZH, fontSize: 42, fontWeight: T.weight.title, color: T.text, whiteSpace: "nowrap" }}>{ch.value}</b>
                <span style={{ fontFamily: FONT_ZH, fontSize: 24, color: T.text2, lineHeight: 1.35 }}>{ch.label}</span>
              </CardV2>
            ))}
          </div>
        )}
      </div>
      <div style={{ position: "absolute", left: L.X, right: L.X, top: 1660, borderTop: `2px solid ${T.divider}`, paddingTop: 12, fontFamily: FONT_ZH, fontSize: 24, color: T.text3, whiteSpace: "nowrap", overflow: "hidden" }}>
        資料來源：{srcs.join("、")}｜截至 {asOf}
      </div>
    </AbsoluteFill>
  );
};

export const coverAccent = accentV2;

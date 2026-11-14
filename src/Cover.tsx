import React from "react";
import { AbsoluteFill } from "remotion";
import type { Script } from "./types";
import { C, FONT_ZH, FONT_EN, SAFE, accent, glow } from "./theme";
import { Background, Header, Icon, StatusTag } from "./components";
import { CoverV2 } from "./components/v2/Cover";
import { CoverV3 } from "./components/v3/Cover";
import { CoverUI } from "./components/ui/UiVideo";
import { CoverChat } from "./components/chat/ChatVideo";
import { CoverChart } from "./components/chartlead/ChartVideo";
import { CoverThree } from "./components/three/ThreeVideo";
import { CoverType } from "./components/ai-type/TypeVideo";
import { CoverSplit } from "./components/ai-split/SplitVideo";
import { CoverSketch } from "./components/ai-sketch/SketchVideo";
import { CoverBright } from "./components/ai-bright/BrightVideo";
import { CoverIso } from "./components/ai-iso/IsoVideo";
import { CoverEditorial } from "./components/ai-editorial/EditorialVideo";
import { CoverTalk } from "./components/talk/TalkVideo";

/** 封面：大標 + 霓虹圖示 + 四格重點 + 狀態標籤；全部由 script.json 的 cover 決定 */
export const Cover: React.FC<Script> = (props) => (props.stage === "talk" ? <CoverTalk {...props} /> : props.stage === "iso" ? <CoverIso {...props} /> : props.stage === "editorial" ? <CoverEditorial {...props} /> : props.stage === "bright" ? <CoverBright {...props} /> : props.stage === "sketch" ? <CoverSketch {...props} /> : props.stage === "split" ? <CoverSplit {...props} /> : props.stage === "type" ? <CoverType {...props} /> : props.stage === "chart" ? <CoverChart {...props} /> : props.stage === "three" ? <CoverThree {...props} /> : props.stage === "ui" ? <CoverUI {...props} /> : props.stage === "chat" ? <CoverChat {...props} /> : props.styleVersion === 3 ? <CoverV3 {...props} /> : props.styleVersion === 2 ? <CoverV2 {...props} /> : <CoverV1 {...props} />);
const CoverV1: React.FC<Script> = ({ cover, asOf }) => {
  const c = { title: ["—"], sub: "", en: "", ...(cover ?? {}) };
  const icons = c.icons?.length ? c.icons : [{ name: "globe", color: "cyan" }, { name: "chart", color: "pink" }];
  const tiles = c.tiles ?? [];
  const tags = c.tags?.length ? c.tags : [{ status: "fact", text: `資料截至 ${asOf}` }];
  return (
    <AbsoluteFill>
      <Background />
      <Header />
      <div style={{ position: "absolute", left: SAFE.x, right: SAFE.x, top: 420, display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
        <div style={{ display: "flex", gap: 40 }}>
          {icons.map((ic, i) => <Icon key={i} name={ic.name} color={accent(ic.color)} size={200} />)}
        </div>
        {c.title.map((t, i) => (
          <div key={i} style={{ fontFamily: FONT_ZH, fontWeight: 900, fontSize: 132, lineHeight: 1.18, marginTop: i ? 0 : 60, color: i === 1 ? C.yellow : C.white, filter: i === 1 ? glow(C.yellow, 10) : undefined }}>{t}</div>
        ))}
        <div style={{ fontFamily: FONT_ZH, fontWeight: 700, fontSize: 56, color: C.cyan, marginTop: 40 }}>{c.sub}</div>
        <div style={{ fontFamily: FONT_EN, fontSize: 32, color: "rgba(255,255,255,0.7)", marginTop: 16 }}>{c.en}</div>
        {tiles.length > 0 && (
          <div style={{ marginTop: 70, display: "grid", gridTemplateColumns: `repeat(${tiles.length === 3 ? 3 : 2}, 1fr)`, gap: 24, width: 820 }}>
            {tiles.map((t, i) => {
              const col = accent(t.color);
              return (
                <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 18, background: C.card, border: `1.5px solid ${col}`, borderRadius: 20, padding: "18px 0", boxShadow: `0 0 18px ${col}55` }}>
                  <Icon name={t.icon} color={col} size={70} />
                  <span style={{ fontFamily: FONT_ZH, fontWeight: 900, fontSize: 52, color: col }}>{t.label}</span>
                </div>
              );
            })}
          </div>
        )}
        <div style={{ marginTop: 56, display: "flex", gap: 20 }}>
          {tags.map((t, i) => <StatusTag key={i} status={t.status} text={t.text} />)}
        </div>
      </div>
    </AbsoluteFill>
  );
};

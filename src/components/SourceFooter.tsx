import React from "react";
import { useCurrentFrame } from "remotion";
import { FONT_ZH, SAFE } from "../theme";
import { tween, EASE } from "./anim";

const footerText = (sources: string[], asOf?: string) => `資料來源：${sources.join("、")}${asOf ? `｜截至 ${asOf}` : ""}`;
const style: React.CSSProperties = { position: "absolute", left: SAFE.x, right: SAFE.x, bottom: SAFE.bottom, textAlign: "center", fontFamily: FONT_ZH, fontSize: 22, color: "rgba(255,255,255,0.5)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" };

export const SourceFooter: React.FC<{ sources: string[]; asOf?: string }> = ({ sources, asOf }) =>
  // v1：保持原本的 JSX 結構（多個文字節點），像素與舊片完全相同
  sources.length ? <div style={style}>資料來源：{sources.join("、")}{asOf ? `｜截至 ${asOf}` : ""}</div> : null;

// styleVersion 2：全片來源列軌道。相鄰幕來源相同就合併（不閃）；換內容時舊的 2 幀淡出、新的 3 幀淡入
export type SourceCue = { sources: string[]; window: [number, number] };
export const SourceTrack: React.FC<{ cues: SourceCue[]; asOf?: string }> = ({ cues, asOf }) => {
  const f = useCurrentFrame();
  const merged: { text: string; window: [number, number] }[] = [];
  for (const c of cues) {
    if (!c.sources.length) continue;
    const text = footerText(c.sources, asOf);
    const last = merged[merged.length - 1];
    if (last && last.text === text && last.window[1] === c.window[0]) last.window = [last.window[0], c.window[1]];
    else merged.push({ text, window: [c.window[0], c.window[1]] });
  }
  const cur = merged.find((c) => f >= c.window[0] && f < c.window[1]);
  if (!cur) return null;
  const [a, b] = cur.window;
  const opacity = Math.min(a === 0 ? 1 : tween(f, a, 3, EASE.enter), 1 - tween(f, b - 2, 2, EASE.exit));
  return <div style={{ ...style, opacity }}>{cur.text}</div>;
};

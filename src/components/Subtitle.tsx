import React from "react";
import { useCurrentFrame } from "remotion";
import { C, FONT_ZH, FONT_EN, SAFE } from "../theme";
import { rise } from "./anim";

const colors = [C.yellow, C.cyan, C.pink, C.purple];

/** 關鍵詞上色；active(k) 為 false 時先維持白色（配音還沒唸到） */
export const highlight = (text: string, keywords: string[], active: (k: string) => boolean = () => true) => {
  if (!keywords.length) return [text];
  const esc = keywords.map((k) => k.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  const parts = text.split(new RegExp(`(${esc.join("|")})`, "g"));
  return parts.map((p, i) => {
    const k = keywords.indexOf(p);
    if (k < 0) return <span key={i}>{p}</span>;
    const on = active(p);
    const col = colors[k % colors.length];
    return <span key={i} style={{ color: on ? col : C.white, whiteSpace: "nowrap", textShadow: on ? `0 0 18px ${col}99, 0 4px 18px rgba(0,0,0,0.8)` : undefined }}>{p}</span>;
  });
};

/** 斷行：有 \n 就照用；否則在最接近中間的「，」後斷行，避免詞被拆開（scripts/validate.mjs 與 align.mjs 有同一份邏輯） */
export const splitLines = (zh: string) => {
  if (zh.includes("\n")) return zh.split("\n");
  if (zh.length <= 14) return [zh];
  const mid = zh.length / 2;
  let best = -1;
  for (let i = 0; i < zh.length - 1; i++) if ("，；：、".includes(zh[i]) && (best < 0 || Math.abs(i + 1 - mid) < Math.abs(best - mid))) best = i + 1;
  return best > 0 ? [zh.slice(0, best), zh.slice(best)] : [zh];
};

/**
 * 字幕：中文粗體 64px（關鍵詞上色），英文 28px 70% 透明度；固定在下方安全區內。
 * lineStarts / keywordStarts（幀，相對本幕開始）由配音時間軸提供：每行在唸到時才淡入，關鍵詞在唸到時才上色。
 */
export const Subtitle: React.FC<{ zh: string; en: string; keywords: string[]; lineStarts?: number[]; keywordStarts?: Record<string, number> }> = ({ zh, en, keywords, lineStarts, keywordStarts }) => {
  const f = useCurrentFrame();
  const lines = splitLines(zh);
  const active = (k: string) => (keywordStarts && k in keywordStarts ? f >= keywordStarts[k] : true);
  const startOf = (i: number) => (lineStarts && lineStarts[i] !== undefined ? lineStarts[i] : 4);
  return (
    <div style={{ position: "absolute", left: SAFE.x, right: SAFE.x, bottom: SAFE.bottom + 70, textAlign: "center" }}>
      <div style={{ fontFamily: FONT_ZH, fontWeight: 900, fontSize: 64, lineHeight: 1.3, color: C.white, textShadow: "0 4px 18px rgba(0,0,0,0.8)" }}>
        {lines.map((line, i) => <div key={i} style={rise(f, startOf(i), 20)}>{highlight(line, keywords, active)}</div>)}
      </div>
      <div style={{ ...rise(f, startOf(0), 20), fontFamily: FONT_EN, fontSize: 28, lineHeight: 1.35, color: "rgba(255,255,255,0.7)", marginTop: 14 }}>{en}</div>
    </div>
  );
};

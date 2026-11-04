import React from "react";
import { useCurrentFrame } from "remotion";
import { C, FONT_ZH, FONT_EN, SAFE } from "../theme";
import { rise } from "./anim";

const colors = [C.yellow, C.cyan, C.pink, C.purple];

export const highlight = (text: string, keywords: string[]) => {
  if (!keywords.length) return [text];
  const esc = keywords.map((k) => k.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  const parts = text.split(new RegExp(`(${esc.join("|")})`, "g"));
  return parts.map((p, i) => {
    const k = keywords.indexOf(p);
    return k >= 0 ? <span key={i} style={{ color: colors[k % colors.length], whiteSpace: "nowrap" }}>{p}</span> : <span key={i}>{p}</span>;
  });
};

/** 斷行：有 \n 就照用；否則在最接近中間的「，」後斷行，避免詞被拆開 */
export const splitLines = (zh: string) => {
  if (zh.includes("\n")) return zh.split("\n");
  if (zh.length <= 14) return [zh];
  const mid = zh.length / 2;
  let best = -1;
  for (let i = 0; i < zh.length - 1; i++) if ("，；：、".includes(zh[i]) && (best < 0 || Math.abs(i + 1 - mid) < Math.abs(best - mid))) best = i + 1;
  return best > 0 ? [zh.slice(0, best), zh.slice(best)] : [zh];
};

/** 字幕：中文粗體 64px（關鍵詞上色），英文 28px 70% 透明度；固定在下方安全區內 */
export const Subtitle: React.FC<{ zh: string; en: string; keywords: string[] }> = ({ zh, en, keywords }) => {
  const f = useCurrentFrame();
  return (
    <div style={{ position: "absolute", left: SAFE.x, right: SAFE.x, bottom: SAFE.bottom + 70, textAlign: "center", ...rise(f, 4, 20) }}>
      <div style={{ fontFamily: FONT_ZH, fontWeight: 900, fontSize: 64, lineHeight: 1.3, color: C.white, textShadow: "0 4px 18px rgba(0,0,0,0.8)" }}>
        {splitLines(zh).map((line, i) => <div key={i}>{highlight(line, keywords)}</div>)}
      </div>
      <div style={{ fontFamily: FONT_EN, fontSize: 28, lineHeight: 1.35, color: "rgba(255,255,255,0.7)", marginTop: 14 }}>{en}</div>
    </div>
  );
};

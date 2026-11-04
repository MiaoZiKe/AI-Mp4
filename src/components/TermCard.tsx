import React from "react";
import { useCurrentFrame } from "remotion";
import { sp, typewriter } from "../anim";
import { C, FONT_MONO, FONT_ZH } from "../theme";

/** 名詞卡：名詞 + 英文 + 一句白話解釋（輸入框打字機效果） */
export const TermCard: React.FC<{ term: string; en: string; def: string; width: number; delay?: number }> = ({ term, en, def, width, delay = 0 }) => {
  const frame = useCurrentFrame();
  const p = sp(frame, delay, 16);
  const shown = typewriter(def, frame, delay + 14, 16);
  const caret = Math.floor(frame / 8) % 2 === 0;
  return (
    <div style={{ width, boxSizing: "border-box", opacity: p, transform: `translateY(${(1 - p) * 30}px)` }}>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 18 }}>
        <div style={{ fontFamily: FONT_ZH, fontWeight: 900, fontSize: 96, color: C.yellow, lineHeight: 1 }}>{term}</div>
        <div style={{ fontFamily: FONT_MONO, fontSize: 26, color: C.cyan, letterSpacing: 3, paddingBottom: 10 }}>/ {en}</div>
      </div>
      <div style={{ fontFamily: FONT_MONO, fontSize: 18, color: C.dim, margin: "18px 0 8px", letterSpacing: 2 }}>DEFINITION ▾ 白話解釋</div>
      <div
        style={{
          border: `2px solid ${C.line}`, borderRadius: 8, padding: "20px 24px", background: "rgba(10,31,69,0.75)", minHeight: 96,
          fontFamily: FONT_ZH, fontWeight: 700, fontSize: 40, color: C.line, lineHeight: 1.4, boxSizing: "border-box",
        }}
      >
        {shown}
        <span style={{ color: C.yellow, opacity: caret ? 1 : 0 }}>▍</span>
      </div>
    </div>
  );
};

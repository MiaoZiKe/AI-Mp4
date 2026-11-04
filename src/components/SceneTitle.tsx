import React from "react";
import { useCurrentFrame } from "remotion";
import { sp, typewriter } from "../anim";
import { C, CONTENT, FONT_MONO, FONT_ZH, SAFE } from "../theme";

/** 每幕標題：章節編號（打字機）+ 中文主題 + 細線 */
export const SceneTitle: React.FC<{ no: number; zh: string; en: string; right?: React.ReactNode }> = ({ no, zh, en, right }) => {
  const frame = useCurrentFrame();
  const p = sp(frame, 0, 16);
  return (
    <div style={{ position: "absolute", left: SAFE.left, right: SAFE.right, top: CONTENT.top + 14 }}>
      <div style={{ fontFamily: FONT_MONO, fontSize: 22, color: C.cyan, letterSpacing: 3, height: 28 }}>
        {typewriter(`SEC.${String(no).padStart(2, "0")} // ${en}`, frame, 0, 40)}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 4 }}>
        <div style={{ fontFamily: FONT_ZH, fontWeight: 900, fontSize: 60, color: C.line, opacity: p, transform: `translateX(${(1 - p) * -30}px)` }}>{zh}</div>
        {right}
      </div>
      <svg width={952} height={10} style={{ display: "block", marginTop: 8 }}>
        <line x1={0} y1={5} x2={952 * p} y2={5} stroke={C.line} strokeOpacity={0.6} strokeWidth={1.5} />
        <line x1={0} y1={5} x2={120 * p} y2={5} stroke={C.yellow} strokeWidth={4} />
      </svg>
    </div>
  );
};

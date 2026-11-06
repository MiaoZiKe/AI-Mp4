import React from "react";
import { useCurrentFrame } from "remotion";
import { FONT_ZH, THEME_V2 as T } from "../../theme";
import { DUR, EASE, bump, tween } from "../anim";
import { cueAt, cueIn, useCue } from "../../cue";
import { CardV2, KickerV2, StatusTagV2, markerBg, reveal } from "./base";

/**
 * P0-10 鉤子：第 0 幀就是完整構圖（≤10 字主張＋數字，≥120px），不做進場淡入。
 * 第 1–4 幀整體 punch 一次（bump，第 0 幀＝1）；念到 slamAt 時主張第 mark 行 slam（放大 8% 回彈＋螢光筆畫過去）；
 * sub（例如「2022 說…，2026/5 起…」）與狀態標籤在 subAt 進場。
 */
export const HookTitle: React.FC<{ kicker?: string; lines: string[]; mark?: number; slamAt?: string; sub?: string; subAt?: string; tag?: string }> = ({ kicker, lines, mark = 1, slamAt, sub, subAt, tag }) => {
  const f = useCurrentFrame();
  const c = useCue();
  const whole = bump(f, 0, 0.03);
  const slam = cueAt(c, slamAt, 40);
  const subIn = cueIn(c, subAt, 50);
  return (
    <div style={{ width: 952, display: "flex", flexDirection: "column", alignItems: "flex-start", justifyContent: "space-evenly", gap: 10, transform: `scale(${whole})`, transformOrigin: "0% 50%" }}>
      {kicker && <KickerV2 text={kicker} />}
      <div style={{ marginTop: 34, fontFamily: FONT_ZH, fontWeight: T.weight.title, fontSize: 168, lineHeight: 1.12, letterSpacing: "-0.01em", color: T.text }}>
        {lines.map((l, i) => {
          const isMark = i === mark;
          const s = isMark ? bump(f, slam - 2, 0.08) : 1;
          // 第 mark 行：第 0 幀先有一半的螢光筆（構圖完整），slam 時畫滿並轉成珊瑚字
          const p = isMark ? 0.5 + 0.5 * tween(f, slam - 2, DUR.m, EASE.enter) : 0;
          return (
            <div key={i} style={{ display: "block", transform: `scale(${s})`, transformOrigin: "0% 60%", whiteSpace: "nowrap" }}>
              <span style={{ ...(isMark ? markerBg(p) : {}), paddingRight: 6 }}>{l}</span>
            </div>
          );
        })}
      </div>
      {sub && (
        <div style={{ ...reveal(f, subIn), marginTop: 44, alignSelf: "stretch", display: "flex", alignItems: "stretch", gap: 18 }}>
          {sub.split(/[，,]/).map((part, i, arr) => (
            <React.Fragment key={i}>
              <CardV2 topBar={i === arr.length - 1 ? "pink" : "cyan"} style={{ flex: 1, padding: "24px 26px", fontFamily: FONT_ZH, fontSize: 40, lineHeight: 1.35, fontWeight: 700, color: T.text }}>{part.trim()}</CardV2>
              {i < arr.length - 1 && <div style={{ alignSelf: "center", fontFamily: FONT_ZH, fontSize: 56, fontWeight: 900, color: T.accent.pink.text }}>→</div>}
            </React.Fragment>
          ))}
        </div>
      )}
      {tag && <div style={{ ...reveal(f, subIn + 4), marginTop: 26 }}><StatusTagV2 status={tag} size={34} /></div>}
    </div>
  );
};

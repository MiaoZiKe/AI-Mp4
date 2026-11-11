import React from "react";
import { interpolateColors, useCurrentFrame } from "remotion";
import { FONT_EN, FONT_ZH, THEME_V2 as T, accentV2 } from "../../theme";
import { DUR, EASE, countUp, tween } from "../anim";
import { cueAt, cueIn, useCue } from "../../cue";
import { CardV2, KickerV2, StatusTagV2, markerBg, reveal } from "./base";

type Count = { from: number; to: number; line?: number; start?: number; land?: number };
type Reverse = { from: string; to: string; fromAt?: string; toAt?: string; fromColor?: string; toColor?: string };

/**
 * P0-10／v3 鉤子：第 0 幀就是完整構圖（≤10 字主張＋數字，≥120px），不做進場淡入、不整體縮放、不漂移。
 * 0–2 秒內兩個語意動作（亞里：前 2 秒抓人）：
 *  ① count：主張裡的 {n} 從 from 計數到 to（例：67→85 萬枚）
 *  ② reverse：「囤幣 → 賣幣」反轉列——念到 fromAt 時左塊填色，箭頭畫過去，右塊由左往右填色（反轉在念到 toAt 前完成）
 * 念到 slamAt 時主張第 mark 行轉珊瑚字、螢光筆畫滿；sub 與狀態標籤在 subAt 進場。
 */
export const HookTitle: React.FC<{ kicker?: string; lines: string[]; mark?: number; slamAt?: string; sub?: string; subAt?: string; tag?: string; count?: Count; reverse?: Reverse }> = ({ kicker, lines, mark = 1, slamAt, sub, subAt, tag, count, reverse }) => {
  const f = useCurrentFrame();
  const c = useCue();
  const slam = cueAt(c, slamAt, 58);
  // sub：有 subAt 就照 cue；有 reverse 而沒有 subAt 時，接在箭頭之後依序進場（第 1 張 r0+16、每張再 +12 幀，補滿 0–2 秒的變化）
  const subIn = subAt ? cueIn(c, subAt, 50) : reverse ? cueAt(c, reverse.fromAt, 8) + 14 : 50;
  const n = count ? Math.round(count.from + (count.to - count.from) * countUp(f, count.start ?? 2, count.land ?? 44)) : 0;
  // 反轉列時間：左塊在 fromAt 填色（8 幀）、箭頭接著畫（16 幀）、右塊在 toAt 前 4 幀填滿（22 幀 wipe）
  const r0 = reverse ? cueAt(c, reverse.fromAt, 8) - 2 : 0;
  const r2end = reverse ? Math.max(r0 + 44, cueAt(c, reverse.toAt, 62) - 4) : 0;
  const fillL = reverse ? tween(f, r0, DUR.m, EASE.enter) : 0;
  const arrow = reverse ? tween(f, r0 + 10, 16, EASE.move) : 0;
  const fillR = reverse ? tween(f, r2end - 22, 22, EASE.move) : 0;
  const slamT = tween(f, slam - 2, DUR.m, EASE.enter);
  return (
    <div style={{ width: 952, display: "flex", flexDirection: "column", alignItems: "flex-start", justifyContent: "space-evenly", gap: 6 }}>
      {kicker && <KickerV2 text={kicker} />}
      <div style={{ marginTop: 18, fontFamily: FONT_ZH, fontWeight: T.weight.title, fontSize: 168, lineHeight: 1.1, letterSpacing: "-0.01em", color: T.text }}>
        {lines.map((l, i) => {
          const isMark = i === mark;
          // 第 mark 行：第 0 幀先有一半的螢光筆（構圖完整），slam 時畫滿並轉成珊瑚字
          const p = isMark ? 0.5 + 0.5 * slamT : 0;
          const col = isMark ? interpolateColors(slamT, [0, 1], [T.text, T.accent.pink.text]) : T.text;
          const parts = count && (count.line ?? 0) === i ? l.split("{n}") : [l];
          return (
            <div key={i} style={{ display: "block", whiteSpace: "nowrap", color: col }}>
              <span style={{ ...(isMark ? markerBg(p) : {}), paddingRight: 6 }}>
                {parts.map((part, k) => (
                  <React.Fragment key={k}>{part}{k < parts.length - 1 && <span style={{ fontFamily: FONT_EN, fontVariantNumeric: "tabular-nums", color: accentV2("pink").text }}>{n}</span>}</React.Fragment>
                ))}
              </span>
            </div>
          );
        })}
      </div>
      {reverse && (() => {
        const a = accentV2(reverse.fromColor ?? "cyan"), b = accentV2(reverse.toColor ?? "pink");
        const chip = (text: string, acc: typeof a, p: number): React.ReactNode => (
          <div style={{ position: "relative", width: 340, height: 150, borderRadius: T.radius, border: `5px solid ${acc.fill}`, background: T.card, overflow: "hidden", boxSizing: "border-box" }}>
            <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: `${(p * 100).toFixed(1)}%`, background: acc.fill }} />
            <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FONT_ZH, fontSize: 92, fontWeight: T.weight.title, color: interpolateColors(p, [0.4, 0.6], [acc.text, T.onAccent]) }}>{text}</div>
          </div>
        );
        return (
          <div style={{ marginTop: 22, display: "flex", alignItems: "center", gap: 0 }}>
            {chip(reverse.from, a, fillL)}
            <svg width={272} height={150} style={{ overflow: "visible" }}>
              <path d="M22 75 H232 M200 43 L242 75 L200 107" fill="none" stroke={T.rule} strokeWidth={12} strokeLinecap="square" strokeLinejoin="miter" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - arrow} />
            </svg>
            {chip(reverse.to, b, fillR)}
          </div>
        );
      })()}
      {sub && (
        <div style={{ marginTop: 30, alignSelf: "stretch", display: "flex", alignItems: "stretch", gap: 18 }}>
          {sub.split(/[，,]/).map((part, i, arr) => (
            <React.Fragment key={i}>
              <CardV2 topBar={i === arr.length - 1 ? "pink" : "cyan"} style={{ ...reveal(f, subIn + i * 14, 1, 20), flex: 1, padding: "22px 26px", fontFamily: FONT_ZH, fontSize: 38, lineHeight: 1.35, fontWeight: 700, color: T.text }}>{part.trim()}</CardV2>
              {i < arr.length - 1 && <div style={{ ...reveal(f, subIn + 8, 1, 20), alignSelf: "center", fontFamily: FONT_ZH, fontSize: 56, fontWeight: 900, color: T.accent.pink.text }}>→</div>}
            </React.Fragment>
          ))}
        </div>
      )}
      {tag && <div style={{ ...reveal(f, subIn + 4), marginTop: 18 }}><StatusTagV2 status={tag} size={34} /></div>}
    </div>
  );
};

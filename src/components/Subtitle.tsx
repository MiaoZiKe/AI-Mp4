import React from "react";
import { interpolateColors, useCurrentFrame } from "remotion";
import { C, FONT_ZH, FONT_EN, SAFE } from "../theme";
import { pop, riseFor, enter, tween, punch, EASE, DUR } from "./anim";
import { useV2 } from "../style";

const colors = [C.yellow, C.cyan, C.pink, C.purple];

/** 把一行切成「關鍵詞／非關鍵詞」片段 */
export const splitParts = (text: string, keywords: string[]) => {
  if (!keywords.length) return [{ text, k: -1 }];
  const esc = keywords.map((k) => k.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  return text.split(new RegExp(`(${esc.join("|")})`, "g")).filter((p) => p.length).map((p) => ({ text: p, k: keywords.indexOf(p) }));
};

/** 舊介面：關鍵詞上色（靜態） */
export const highlight = (text: string, keywords: string[], active: (k: string) => boolean = () => true) =>
  splitParts(text, keywords).map((p, i) => {
    if (p.k < 0) return <span key={i}>{p.text}</span>;
    const on = active(p.text);
    const col = colors[p.k % colors.length];
    return <span key={i} style={{ color: on ? col : C.white, whiteSpace: "nowrap" }}>{p.text}</span>;
  });

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
 * 配音時間軸（幀，相對本幕開始）：lineStarts 每行淡入時間；charTimes 每個字被唸到的時間（唸到才點亮，像 KTV）；
 * keywordStarts 關鍵詞被唸到時上色並彈一下。沒有時間軸時全部直接顯示。
 */
export const Subtitle: React.FC<{ zh: string; en: string; keywords: string[]; lineStarts?: number[]; keywordStarts?: Record<string, number>; charTimes?: (number[] | undefined)[] }> =
  ({ zh, en, keywords, lineStarts, keywordStarts, charTimes }) => {
  const f = useCurrentFrame();
  const v2 = useV2();
  const R = riseFor(v2);
  const lines = splitLines(zh);
  const startOf = (i: number) => (lineStarts && lineStarts[i] !== undefined ? lineStarts[i] : 4);
  return (
    <div style={{ position: "absolute", left: SAFE.x, right: SAFE.x, bottom: SAFE.bottom + 70, textAlign: "center" }}>
      <div style={{ fontFamily: FONT_ZH, fontWeight: 900, fontSize: 64, lineHeight: 1.3, color: C.white, textShadow: "0 3px 8px rgba(0,0,0,0.85)" }}>
        {lines.map((line, li) => {
          const times = charTimes?.[li];
          let ci = 0;
          return (
            <div key={li} style={{ ...R(f, startOf(li), 20), whiteSpace: "nowrap" }}>
              {splitParts(line, keywords).map((p, pi) => {
                const start = ci;
                ci += [...p.text].length;
                const col = p.k >= 0 ? colors[p.k % colors.length] : C.white;
                const timed = p.k >= 0 && keywordStarts !== undefined && p.text in keywordStarts;
                const kwOn = p.k >= 0 && (timed ? f >= keywordStarts![p.text] : true);
                const scale = timed ? pop(f, keywordStarts![p.text], 0.86) : 1;
                const chars = [...p.text].map((ch, i) => {
                  const t = times?.[start + i];
                  const on = t === undefined || f >= t;
                  return <span key={i} style={{ opacity: on ? 1 : 0.42 }}>{ch}</span>;
                });
                return (
                  <span key={pi} style={{ display: "inline-block", whiteSpace: "nowrap", color: kwOn ? col : C.white, textShadow: kwOn ? `0 0 10px ${col}99` : undefined, transform: `scale(${scale})`, transformOrigin: "50% 60%" }}>
                    {chars}
                  </span>
                );
              })}
            </div>
          );
        })}
      </div>
      <div style={{ ...R(f, startOf(0), 20), fontFamily: FONT_EN, fontSize: 28, lineHeight: 1.35, color: "rgba(255,255,255,0.7)", marginTop: 14 }}>{en}</div>
    </div>
  );
};

// ───────────────────────── styleVersion 2：全片字幕軌 ─────────────────────────
export type SubtitleCue = {
  id: string; zh: string; en: string; keywords: string[];
  /** 絕對幀：[in, out) */
  window: [number, number];
  lines: { text: string; start: number; chars: number[] }[];
  keywords_at: { text: string; start: number }[];
};
const SUB_IN = 3, SUB_OUT = 2; // 換句：舊句最後 2 幀淡出、新句 3 幀淡入（不同時出現兩組）
const DIM = 0.42;

const CueView: React.FC<{ cue: SubtitleCue; f: number }> = ({ cue, f }) => {
  const [a, b] = cue.window;
  const groupOpacity = Math.min(a === 0 ? 1 : tween(f, a, SUB_IN, EASE.enter), 1 - tween(f, b - SUB_OUT, SUB_OUT, EASE.exit));
  const kwAt = Object.fromEntries(cue.keywords_at.map((k) => [k.text, k.start]));
  return (
    <div style={{ position: "absolute", left: SAFE.x, right: SAFE.x, bottom: SAFE.bottom + 70, textAlign: "center", opacity: groupOpacity }}>
      <div style={{ fontFamily: FONT_ZH, fontWeight: 900, fontSize: 64, lineHeight: 1.3, color: C.white, textShadow: "0 3px 8px rgba(0,0,0,0.85)" }}>
        {splitLines(cue.zh).map((line, li) => {
          const L = cue.lines[li];
          const start = L?.start ?? a;
          let ci = 0;
          return (
            <div key={li} style={{ ...enter(f, start, 12), whiteSpace: "nowrap" }}>
              {splitParts(line, cue.keywords).map((p, pi) => {
                const s0 = ci;
                ci += [...p.text].length;
                const col = p.k >= 0 ? colors[p.k % colors.length] : C.white;
                const at = p.k >= 0 ? kwAt[p.text] : undefined;
                // 關鍵詞上色：3 幀漸變（不硬切），被唸到時 accent 彈一下（過衝 ≤3%）
                const kwT = p.k < 0 ? 0 : at === undefined ? 1 : tween(f, at - 1, DUR.xs - 1, EASE.enter);
                const color = p.k >= 0 ? interpolateColors(kwT, [0, 1], [C.white, col]) : C.white;
                const scale = at !== undefined ? punch(f, at, 0.9) : 1;
                const chars = [...p.text].map((ch, i) => {
                  const t = L?.chars?.[s0 + i];
                  // 字點亮：t−2 → t+1 共 3 幀漸變
                  const op = t === undefined ? 1 : DIM + (1 - DIM) * tween(f, t - 2, 3, EASE.enter);
                  return <span key={i} style={{ opacity: op }}>{ch}</span>;
                });
                return (
                  <span key={pi} style={{ display: "inline-block", whiteSpace: "nowrap", color, textShadow: p.k >= 0 && kwT > 0 ? `0 0 10px ${col}${Math.round(kwT * 0x99).toString(16).padStart(2, "0")}` : undefined, transform: `scale(${scale})`, transformOrigin: "50% 60%" }}>
                    {chars}
                  </span>
                );
              })}
            </div>
          );
        })}
      </div>
      <div style={{ ...enter(f, cue.lines[0]?.start ?? a, 12), fontFamily: FONT_EN, fontSize: 28, lineHeight: 1.35, color: "rgba(255,255,255,0.7)", marginTop: 14 }}>{cue.en}</div>
    </div>
  );
};

/** 全片字幕軌：跟絕對時間軸走，不受換幕轉場影響；任一幀最多一組字幕 */
export const SubtitleTrack: React.FC<{ cues: SubtitleCue[] }> = ({ cues }) => {
  const f = useCurrentFrame();
  const cue = cues.find((c) => f >= c.window[0] && f < c.window[1]);
  return cue ? <CueView cue={cue} f={f} /> : null;
};

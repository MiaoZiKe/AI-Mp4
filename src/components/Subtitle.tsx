import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { C, FONT_MONO, FONT_ZH, SAFE, W, H } from "../theme";

export const SUB_TOP = 1370;

const charCount = (s: string) => Array.from(s.replace(/[\s，。、：；！？「」（）,.:;!?()]/g, "")).length;

/** 依字數比例分配每行字幕出現時間 */
export const lineTimings = (lines: string[], duration: number) => {
  const counts = lines.map((l) => Math.max(1, charCount(l)));
  const total = counts.reduce((a, b) => a + b, 0);
  let acc = 0;
  return counts.map((c) => {
    const start = Math.round((acc / total) * duration);
    acc += c;
    return { start, end: Math.round((acc / total) * duration) };
  });
};

/** 中文 64px 一行約 14 字；過長時在最接近中間的「，、：」後換行，避免斷在詞中間 */
export const smartBreak = (text: string, max = 14): string[] => {
  const chars = Array.from(text);
  if (chars.length <= max) return [text];
  let best = -1;
  chars.forEach((ch, i) => {
    if ("，、：；".includes(ch) && i + 1 <= max + 1 && chars.length - i - 1 <= max + 1) {
      if (best < 0 || Math.abs(i - chars.length / 2) < Math.abs(best - chars.length / 2)) best = i;
    }
  });
  if (best < 0) return [text];
  return [chars.slice(0, best + 1).join(""), chars.slice(best + 1).join("")];
};

const highlight = (text: string, keywords: string[]) => {
  if (!keywords.length) return [text];
  const esc = keywords.map((k) => k.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).sort((a, b) => b.length - a.length);
  const re = new RegExp(`(${esc.join("|")})`, "g");
  return text.split(re).map((part, i) =>
    keywords.includes(part) ? (
      <span key={i} style={{ color: C.yellow }}>{part}</span>
    ) : (
      <React.Fragment key={i}>{part}</React.Fragment>
    ),
  );
};

/** 字幕底板：中文 64px 粗體（關鍵詞黃色）+ 英文 Mono 28px 70% + 工程刻度線 */
export const Subtitle: React.FC<{ zh: string[]; en: string[]; keywords: string[]; duration: number }> = ({ zh, en, keywords, duration }) => {
  const frame = useCurrentFrame();
  const t = lineTimings(zh, duration);
  let idx = t.findIndex((x) => frame >= x.start && frame < x.end);
  if (idx < 0) idx = frame < 0 ? 0 : zh.length - 1;
  const local = frame - t[idx].start;
  const appear = interpolate(local, [0, 6], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const panelH = H - SAFE.bottom - SUB_TOP;
  return (
    <div style={{ position: "absolute", left: 0, top: SUB_TOP, width: W, height: panelH }}>
      <div style={{ position: "absolute", inset: `0 ${SAFE.left - 24}px`, background: C.panel, borderTop: `2px solid ${C.line}` }} />
      <div
        style={{
          position: "absolute", left: SAFE.left, right: SAFE.right, top: 22, bottom: 46,
          display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", textAlign: "center",
          opacity: appear, transform: `translateY(${(1 - appear) * 10}px)`,
        }}
      >
        <div style={{ fontFamily: FONT_ZH, fontWeight: 700, fontSize: 64, lineHeight: 1.28, color: C.line }}>
          {smartBreak(zh[idx]).map((seg, k) => (
            <div key={k}>{highlight(seg, keywords)}</div>
          ))}
        </div>
        <div style={{ fontFamily: FONT_MONO, fontSize: 28, lineHeight: 1.3, color: "rgba(255,255,255,0.7)", marginTop: 12 }}>{en[idx] ?? ""}</div>
      </div>
      <svg width={W - SAFE.left * 2} height={24} style={{ position: "absolute", left: SAFE.left, bottom: 12 }}>
        <line x1={0} y1={2} x2={W - SAFE.left * 2} y2={2} stroke={C.line} strokeOpacity={0.5} strokeWidth={1.5} />
        {Array.from({ length: 96 }, (_, i) => {
          const x = i * ((W - SAFE.left * 2) / 95);
          const h = i % 10 === 0 ? 18 : i % 5 === 0 ? 12 : 6;
          return <line key={i} x1={x} y1={2} x2={x} y2={2 + h} stroke={i % 10 === 0 ? C.cyan : C.line} strokeOpacity={0.6} strokeWidth={1.5} />;
        })}
      </svg>
    </div>
  );
};

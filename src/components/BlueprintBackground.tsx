import React from "react";
import { AbsoluteFill } from "remotion";
import { C, FONT_MONO, H, W } from "../theme";

const INSET = 32;

const Cross: React.FC<{ x: number; y: number }> = ({ x, y }) => (
  <g stroke={C.line} strokeWidth={2} opacity={0.85}>
    <line x1={x - 18} y1={y} x2={x + 18} y2={y} />
    <line x1={x} y1={y - 18} x2={x} y2={y + 18} />
    <circle cx={x} cy={y} r={7} fill="none" />
  </g>
);

/** 藍圖背景：漸層 + 40px 細格線 + 每 5 格粗線 + 內縮外框與十字對位標記 */
export const BlueprintBackground: React.FC<{ sheet?: string }> = ({ sheet }) => (
  <AbsoluteFill style={{ background: `linear-gradient(180deg, ${C.bgTop} 0%, ${C.bgBottom} 100%)` }}>
    <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
      <defs>
        <pattern id="g-small" width={40} height={40} patternUnits="userSpaceOnUse">
          <path d="M40 0 H0 V40" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={1} />
        </pattern>
        <pattern id="g-big" width={200} height={200} patternUnits="userSpaceOnUse">
          <path d="M200 0 H0 V200" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth={1.5} />
        </pattern>
        <radialGradient id="vig" cx="50%" cy="45%" r="75%">
          <stop offset="60%" stopColor="rgba(0,0,0,0)" />
          <stop offset="100%" stopColor="rgba(0,8,30,0.45)" />
        </radialGradient>
      </defs>
      <rect width={W} height={H} fill="url(#g-small)" />
      <rect width={W} height={H} fill="url(#g-big)" />
      <rect width={W} height={H} fill="url(#vig)" />
      <rect x={INSET} y={INSET} width={W - INSET * 2} height={H - INSET * 2} fill="none" stroke={C.line} strokeWidth={2} opacity={0.75} />
      <rect x={INSET + 8} y={INSET + 8} width={W - INSET * 2 - 16} height={H - INSET * 2 - 16} fill="none" stroke={C.line} strokeWidth={1} opacity={0.3} />
      <Cross x={INSET} y={INSET} />
      <Cross x={W - INSET} y={INSET} />
      <Cross x={INSET} y={H - INSET} />
      <Cross x={W - INSET} y={H - INSET} />
      {/* 外框刻度 */}
      {Array.from({ length: 26 }, (_, i) => (
        <line key={i} x1={INSET + 40 + i * 40} y1={INSET} x2={INSET + 40 + i * 40} y2={INSET + (i % 5 === 4 ? 14 : 7)} stroke={C.line} opacity={0.5} />
      ))}
    </svg>
    <div
      style={{
        position: "absolute", right: 56, bottom: 48, fontFamily: FONT_MONO, fontSize: 18,
        color: "rgba(255,255,255,0.45)", letterSpacing: 2,
      }}
    >
      {sheet ?? "DWG. BH-INTL"}
    </div>
  </AbsoluteFill>
);

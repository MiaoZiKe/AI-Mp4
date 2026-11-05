import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { C } from "../theme";
import { seeded } from "./anim";

const rnd = seeded(20261103);
const STARS = Array.from({ length: 40 }, () => ({ x: rnd() * 1080, y: rnd() * 1920, r: 1 + rnd() * 2, p: rnd() * 6 }));
/** 緩慢上飄的霓虹光點（固定 seed） */
const PARTS = Array.from({ length: 22 }, () => ({
  x: rnd() * 1080, y: rnd() * 1920, r: 2 + rnd() * 4, v: 0.25 + rnd() * 0.6, sway: 10 + rnd() * 30, p: rnd() * 6.28,
  c: [C.cyan, C.pink, C.purple, C.yellow][Math.floor(rnd() * 4)],
}));

/** 背景：深藍 + 6% 細格線 + 緩慢漂移的藍紫光暈 + 星點 + 上飄光點 */
export const Background: React.FC = () => {
  const f = useCurrentFrame();
  const gx = 50 + 6 * Math.sin(f / 90), gy = 48 + 4 * Math.cos(f / 110);
  return (
    <AbsoluteFill style={{ background: C.bg }}>
      <AbsoluteFill
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />
      <AbsoluteFill style={{ background: `radial-gradient(ellipse 60% 40% at ${gx}% ${gy}%, rgba(110,100,255,0.24), rgba(34,229,212,0.06) 55%, transparent 75%)` }} />
      <AbsoluteFill style={{ background: `radial-gradient(ellipse 42% 28% at ${100 - gx}% ${gy + 32}%, rgba(255,79,163,0.10), transparent 70%)` }} />
      <svg width={1080} height={1920} style={{ position: "absolute" }}>
        {STARS.map((s, i) => (
          <circle key={i} cx={s.x} cy={s.y} r={s.r} fill="#fff" opacity={0.15 + 0.15 * Math.sin(f / 20 + s.p)} />
        ))}
        {PARTS.map((p, i) => {
          const y = (((p.y - f * p.v) % 1920) + 1920) % 1920;
          const x = p.x + Math.sin(f / 60 + p.p) * p.sway;
          return <circle key={`p${i}`} cx={x} cy={y} r={p.r} fill={p.c} opacity={0.10 + 0.10 * Math.sin(f / 15 + p.p)} style={{ filter: `blur(${p.r / 2}px)` }} />;
        })}
      </svg>
    </AbsoluteFill>
  );
};

import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { C } from "../theme";
import { seeded } from "./anim";

const rnd = seeded(20261103);
const STARS = Array.from({ length: 40 }, () => ({ x: rnd() * 1080, y: rnd() * 1920, r: 1 + rnd() * 2, p: rnd() * 6 }));

export const Background: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: C.bg }}>
      <AbsoluteFill
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(ellipse 60% 40% at 50% 48%, rgba(110,100,255,0.22), rgba(34,229,212,0.06) 55%, transparent 75%)",
        }}
      />
      <svg width={1080} height={1920} style={{ position: "absolute" }}>
        {STARS.map((s, i) => (
          <circle key={i} cx={s.x} cy={s.y} r={s.r} fill="#fff" opacity={0.15 + 0.15 * Math.sin(f / 20 + s.p)} />
        ))}
      </svg>
    </AbsoluteFill>
  );
};

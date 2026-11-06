import React from "react";
import { AbsoluteFill, Img, staticFile, useCurrentFrame } from "remotion";
import { C } from "../theme";
import { seeded, AMBIENT } from "./anim";

const rnd = seeded(20261103);
const STARS = Array.from({ length: 40 }, () => ({ x: rnd() * 1080, y: rnd() * 1920, r: 1 + rnd() * 2, p: rnd() * 6 }));
/** 緩慢上飄的霓虹光點（固定 seed） */
const PARTS = Array.from({ length: 22 }, () => ({
  x: rnd() * 1080, y: rnd() * 1920, r: 2 + rnd() * 4, v: 0.25 + rnd() * 0.6, sway: 10 + rnd() * 30, p: rnd() * 6.28,
  c: [C.cyan, C.pink, C.purple, C.yellow][Math.floor(rnd() * 4)],
}));

/**
 * 全幅漸層在軟體渲染下每格要 ~0.7 秒，所以靜態部分（格線＋中央光暈）預先渲染成 public/bg/base.png（scripts/make-bg.mjs），
 * 漂移光暈用 public/bg/blob.png 位移，動態只剩星點與光點。
 */
export const BackgroundStatic: React.FC = () => (
  <AbsoluteFill style={{ background: C.bg }}>
    <AbsoluteFill
      style={{
        backgroundImage:
          "linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px)",
        backgroundSize: "60px 60px",
      }}
    />
    <AbsoluteFill style={{ background: "radial-gradient(ellipse 60% 40% at 50% 48%, rgba(110,100,255,0.16), rgba(34,229,212,0.05) 55%, transparent 75%)" }} />
  </AbsoluteFill>
);
/** 漂移光暈（透明底，900×700） */
export const GlowBlob: React.FC = () => (
  <AbsoluteFill style={{ background: "transparent" }}>
    <div style={{ position: "absolute", left: 0, top: 0, width: 900, height: 700, background: "radial-gradient(ellipse at center, rgba(110,100,255,0.22), rgba(255,79,163,0.06) 55%, transparent 72%)" }} />
  </AbsoluteFill>
);

export const Background: React.FC = () => {
  const fr = useCurrentFrame();
  const f = AMBIENT ? fr : 0; // AUDIT=1：背景凍結
  const gx = 540 + 70 * Math.sin(f / 90), gy = 920 + 60 * Math.cos(f / 110);
  return (
    <AbsoluteFill style={{ background: C.bg }}>
      <Img src={staticFile("bg/base.png")} style={{ position: "absolute", left: 0, top: 0, width: 1080, height: 1920 }} />
      <Img src={staticFile("bg/blob.png")} style={{ position: "absolute", left: gx - 450, top: gy - 350, width: 900, height: 700 }} />
      <svg width={1080} height={1920} style={{ position: "absolute" }}>
        <defs>
          {[C.cyan, C.pink, C.purple, C.yellow].map((c) => (
            <radialGradient key={c} id={`pg${c.slice(1)}`}><stop offset="0%" stopColor={c} stopOpacity={0.9} /><stop offset="100%" stopColor={c} stopOpacity={0} /></radialGradient>
          ))}
        </defs>
        {STARS.map((s, i) => (
          <circle key={i} cx={s.x} cy={s.y} r={s.r} fill="#fff" opacity={0.15 + 0.15 * Math.sin(f / 20 + s.p)} />
        ))}
        {PARTS.map((p, i) => {
          const y = (((p.y - f * p.v) % 1920) + 1920) % 1920;
          const x = p.x + Math.sin(f / 60 + p.p) * p.sway;
          return <circle key={`p${i}`} cx={x} cy={y} r={p.r * 2} fill={`url(#pg${p.c.slice(1)})`} opacity={0.18 + 0.14 * Math.sin(f / 15 + p.p)} />;
        })}
      </svg>
    </AbsoluteFill>
  );
};

import React from "react";
import { useCurrentFrame } from "remotion";
import { C, FONT_ZH, FONT_EN, glow } from "../theme";
import { rise, progress } from "./anim";

export const EndCard: React.FC<{ next?: string; disclaimer?: string }> = ({ next, disclaimer }) => {
  const f = useCurrentFrame();
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", width: 952 }}>
      <svg width={240} height={240} viewBox="0 0 64 64" style={{ filter: glow(C.cyan, 16), ...rise(f, 0) }}>
        <circle cx="32" cy="32" r="26" fill="none" stroke={C.cyan} strokeWidth={2} strokeDasharray={170} strokeDashoffset={170 * (1 - progress(f, 0, 30))} />
        <ellipse cx="32" cy="32" rx="10" ry="26" fill="none" stroke={C.cyan} strokeWidth={2} />
        <path d="M6 32h52" stroke={C.pink} strokeWidth={2} />
      </svg>
      <div style={{ ...rise(f, 8), fontFamily: FONT_ZH, fontSize: 110, fontWeight: 900, color: C.white, marginTop: 30, letterSpacing: 6 }}>白話國際</div>
      <div style={{ ...rise(f, 14), fontFamily: FONT_ZH, fontSize: 56, fontWeight: 700, color: C.cyan, marginTop: 10 }}>一支講透一件事</div>
      <div style={{ ...rise(f, 20), fontFamily: FONT_EN, fontSize: 30, color: "rgba(255,255,255,0.7)", marginTop: 8 }}>One video, one topic, explained.</div>
      <div style={{ ...rise(f, 28), marginTop: 50, display: "flex", gap: 24 }}>
        {["追蹤", "分享", "留言"].map((t, i) => (
          <span key={t} style={{ fontFamily: FONT_ZH, fontSize: 38, fontWeight: 700, color: [C.pink, C.yellow, C.purple][i], border: `1.5px solid ${[C.pink, C.yellow, C.purple][i]}`, borderRadius: 999, padding: "10px 34px" }}>{t}</span>
        ))}
      </div>
      {next && <div style={{ ...rise(f, 36), fontFamily: FONT_ZH, fontSize: 34, color: "rgba(255,255,255,0.85)", marginTop: 44 }}>{next}</div>}
      {disclaimer && <div style={{ ...rise(f, 40), fontFamily: FONT_ZH, fontSize: 26, color: "rgba(255,255,255,0.55)", marginTop: 24 }}>{disclaimer}</div>}
    </div>
  );
};

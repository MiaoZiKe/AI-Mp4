import React from "react";
import { useCurrentFrame } from "remotion";
import { lin, sp } from "../anim";
import { C, CONTENT, FONT_MONO, FONT_ZH, W } from "../theme";
import { Logo } from "./icons";

/** 品牌片尾卡 */
export const EndCard: React.FC<{ channel: string; series: string; slogan: string; notes: string[]; asOf: string }> = ({
  channel, series, slogan, notes, asOf,
}) => {
  const frame = useCurrentFrame();
  const p = sp(frame, 0, 14);
  const ring = lin(frame, 0, 24);
  const s2 = sp(frame, 12, 16);
  const s3 = sp(frame, 22, 16);
  const cx = W / 2;
  return (
    <div style={{ position: "absolute", left: 0, top: CONTENT.top, width: W, height: CONTENT.bottom - CONTENT.top }}>
      <svg width={W} height={520} style={{ position: "absolute", top: 0, left: 0 }}>
        <circle cx={cx} cy={250} r={200} fill="none" stroke={C.line} strokeWidth={2} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - ring} opacity={0.6} />
        <circle cx={cx} cy={250} r={228} fill="none" stroke={C.cyan} strokeWidth={1.5} strokeDasharray="6 10" opacity={0.6 * ring} />
        <line x1={cx - 260} y1={250} x2={cx + 260} y2={250} stroke={C.line} strokeOpacity={0.25} />
        <line x1={cx} y1={0} x2={cx} y2={500} stroke={C.line} strokeOpacity={0.25} />
      </svg>
      <div style={{ position: "absolute", left: cx - 120, top: 130, transform: `scale(${p})` }}>
        <Logo size={240} />
      </div>
      <div style={{ position: "absolute", top: 540, width: W, textAlign: "center", opacity: s2, transform: `translateY(${(1 - s2) * 30}px)` }}>
        <div style={{ fontFamily: FONT_ZH, fontWeight: 900, fontSize: 104, color: C.line, letterSpacing: 8 }}>{channel}</div>
        <div style={{ fontFamily: FONT_ZH, fontWeight: 700, fontSize: 52, color: C.yellow, marginTop: 10 }}>{slogan}</div>
        <div style={{ display: "inline-block", marginTop: 26, border: `2px solid ${C.cyan}`, color: C.cyan, borderRadius: 999, padding: "6px 26px", fontFamily: FONT_ZH, fontWeight: 700, fontSize: 30 }}>
          {series}
        </div>
      </div>
      <div style={{ position: "absolute", top: 860, left: 64, right: 64, textAlign: "center", opacity: s3 }}>
        {notes.map((n, i) => (
          <div key={i} style={{ fontFamily: FONT_ZH, fontWeight: 500, fontSize: 28, color: C.dim, lineHeight: 1.6 }}>{n}</div>
        ))}
        <div style={{ fontFamily: FONT_MONO, fontSize: 20, color: C.cyan, marginTop: 8, letterSpacing: 2 }}>DATA AS OF {asOf}</div>
      </div>
    </div>
  );
};

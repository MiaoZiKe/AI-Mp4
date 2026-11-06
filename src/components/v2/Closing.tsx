// styleVersion 2：CTA 幕（具體提問）與片尾卡
import React from "react";
import { useCurrentFrame } from "remotion";
import { FONT_EN, FONT_ZH, THEME_V2 as T, accentV2 } from "../../theme";
import { STAGGER, bump } from "../anim";
import { cueAt, cueIn, useCue } from "../../cue";
import { CardV2, KickerV2, LogoV2, markerBg, reveal } from "./base";

/** P1-9：EndCard 前 3–4 秒的具體提問。question 第 0 幀就在；options 在 optionsAt 依序出現，prompt（留言）在 promptAt 出現 */
export const CtaCard: React.FC<{ kicker?: string; question: string[]; options?: { label: string; color?: string }[]; optionsAt?: string; prompt?: string; promptAt?: string; episode?: string }> =
  ({ kicker, question, options = [], optionsAt, prompt, promptAt, episode }) => {
  const f = useCurrentFrame();
  const c = useCue();
  const o0 = cueIn(c, optionsAt, 14);
  const pIn = cueIn(c, promptAt, o0 + 20);
  return (
    <div style={{ width: 952, display: "flex", flexDirection: "column", alignItems: "flex-start", justifyContent: "center" }}>
      {kicker && <div style={reveal(f, 0)}><KickerV2 text={kicker} /></div>}
      <div style={{ ...reveal(f, 0), marginTop: 30, fontFamily: FONT_ZH, fontWeight: T.weight.title, fontSize: 140, lineHeight: 1.14, color: T.text }}>
        {question.map((q, i) => <div key={i}><span style={i === 0 ? markerBg(0.35 + 0.65 * Math.min(1, Math.max(0, (f - cueAt(c, optionsAt, 10)) / 10))) : undefined}>{q}</span></div>)}
      </div>
      <div style={{ display: "flex", gap: 22, marginTop: 44, alignSelf: "stretch" }}>
        {options.map((o, i) => (
          <CardV2 key={i} topBar={o.color} style={{ ...reveal(f, o0 + i * STAGGER * 2, 1, 16), flex: 1, padding: "34px 28px", fontFamily: FONT_ZH, fontSize: 44, fontWeight: 700, color: accentV2(o.color).text, lineHeight: 1.3 }}>
            {o.label}
          </CardV2>
        ))}
      </div>
      {prompt && (
        <div style={{ ...reveal(f, pIn, 1, 16), marginTop: 36, display: "inline-flex", alignItems: "center", gap: 16, padding: "14px 28px", borderRadius: T.radiusTag, background: T.accent.pink.fill, color: T.onAccent, fontFamily: FONT_ZH, fontSize: 46, fontWeight: 900, transform: `${reveal(f, pIn, 1, 16).transform} scale(${bump(f, pIn + 4, 0.05)})` }}>
          <svg width={44} height={44} viewBox="0 0 48 48"><path d="M6 8h36v24H20l-10 8v-8H6z" fill="none" stroke={T.onAccent} strokeWidth={4} strokeLinejoin="miter" /></svg>
          {prompt}
        </div>
      )}
      {episode && <div style={{ ...reveal(f, 6), marginTop: 40, fontFamily: FONT_ZH, fontSize: 34, fontWeight: 700, color: T.text3, letterSpacing: "0.06em" }}>{episode}</div>}
    </div>
  );
};

/** 片尾卡（v2）：不寫「分享」，改「追蹤／收藏／留言」 */
export const EndCardV2: React.FC<{ next?: string; disclaimer?: string }> = ({ next, disclaimer }) => {
  const f = useCurrentFrame();
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "space-evenly", textAlign: "center", width: 952, paddingBottom: 40 }}>
      <div style={reveal(f, 0)}><LogoV2 size={240} /></div>
      <div style={{ ...reveal(f, 6), fontFamily: FONT_ZH, fontSize: 112, fontWeight: T.weight.title, color: T.text, marginTop: 24, letterSpacing: "0.06em" }}>白話國際</div>
      <div style={{ ...reveal(f, 12), fontFamily: FONT_ZH, fontSize: 56, fontWeight: 700, color: T.accent.pink.text, marginTop: 6 }}><span style={markerBg(1)}>一支講透一件事</span></div>
      <div style={{ ...reveal(f, 16), fontFamily: FONT_EN, fontSize: 30, color: T.text2, marginTop: 10 }}>One video, one topic, explained.</div>
      <div style={{ ...reveal(f, 22), marginTop: 46, display: "flex", gap: 22 }}>
        {["追蹤", "收藏", "留言"].map((t, i) => (
          <span key={t} style={{ fontFamily: FONT_ZH, fontSize: 38, fontWeight: 700, color: T.text, background: T.card, border: `2px solid ${T.cardBorder}`, borderTop: `6px solid ${[T.accent.pink.fill, T.accent.yellow.fill, T.accent.cyan.fill][i]}`, borderRadius: T.radiusTag, padding: "10px 34px", boxShadow: T.shadow }}>{t}</span>
        ))}
      </div>
      {next && <CardV2 topBar="yellow" style={{ ...reveal(f, 30), marginTop: 50, alignSelf: "stretch", padding: "26px 30px", fontFamily: FONT_ZH, fontSize: 38, lineHeight: 1.4, color: T.text, fontWeight: 700 }}>{next}</CardV2>}
      {disclaimer && <div style={{ ...reveal(f, 34), fontFamily: FONT_ZH, fontSize: 26, color: T.text3, marginTop: 20 }}>{disclaimer}</div>}
    </div>
  );
};

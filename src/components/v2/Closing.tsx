// styleVersion 2：CTA 幕（具體提問）與片尾卡
import React from "react";
import { useCurrentFrame } from "remotion";
import { FONT_EN, FONT_ZH, THEME_V2 as T, accentV2 } from "../../theme";
import { EASE, STAGGER, bump, tween } from "../anim";
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
    <div style={{ width: 952, display: "flex", flexDirection: "column", alignItems: "flex-start", justifyContent: "space-evenly" }}>
      {kicker && <div style={reveal(f, 0)}><KickerV2 text={kicker} /></div>}
      {/* 大字提問：整幕由右往左緩慢漂移 40px（2.5D 前景層，不縮放） */}
      <div style={{ opacity: reveal(f, 0).opacity, transform: `translateX(${(40 * (1 - tween(f, 0, Math.max(1, c.exit), EASE.move))).toFixed(2)}px)`, marginTop: 30, fontFamily: FONT_ZH, fontWeight: T.weight.title, fontSize: 140, lineHeight: 1.14, color: T.text }}>
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

/** 片尾卡（v2）：不寫「分享」，改「追蹤／收藏／留言」。recap＝本集三個重點（同封面 chips），撐滿主視覺區到出處帶 */
export const EndCardV2: React.FC<{ next?: string; disclaimer?: string; recap?: { value: string; label: string; color?: string }[]; recapTitle?: string }> = ({ next, disclaimer, recap = [], recapTitle = "這集重點" }) => {
  const f = useCurrentFrame();
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "space-between", textAlign: "center", width: 952, boxSizing: "border-box", padding: "34px 34px 28px", border: `${T.ruleW}px solid ${T.rule}`, borderRadius: T.radius }}>
      <div style={{ ...reveal(f, 0), display: "flex", alignItems: "center", gap: 30 }}>
        <LogoV2 size={190} />
        <div style={{ textAlign: "left" }}>
          <div style={{ fontFamily: FONT_ZH, fontSize: 112, fontWeight: T.weight.title, color: T.text, letterSpacing: "0.06em", lineHeight: 1.1 }}>白話國際</div>
          <div style={{ fontFamily: FONT_ZH, fontSize: 56, fontWeight: 700, color: T.accent.pink.text, marginTop: 6 }}><span style={markerBg(1)}>一支講透一件事</span></div>
        </div>
      </div>
      <div style={{ ...reveal(f, 8), fontFamily: FONT_EN, fontSize: 30, color: T.text2 }}>One video, one topic, explained.</div>
      {recap.length > 0 && (
        <div style={{ alignSelf: "stretch" }}>
          <div style={{ ...reveal(f, 10), display: "flex", justifyContent: "flex-start" }}><KickerV2 text={recapTitle} /></div>
          <div style={{ display: "flex", gap: 20, marginTop: 20 }}>
            {recap.map((r, i) => (
              <CardV2 key={i} topBar={r.color} style={{ ...reveal(f, 12 + i * STAGGER, 1, 16), flex: 1, padding: "24px 18px", display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                <div style={{ fontFamily: FONT_ZH, fontSize: 50, fontWeight: T.weight.title, color: accentV2(r.color).text, whiteSpace: "nowrap" }}>{r.value}</div>
                <div style={{ fontFamily: FONT_ZH, fontSize: 30, fontWeight: 700, color: T.text2, lineHeight: 1.3 }}>{r.label}</div>
              </CardV2>
            ))}
          </div>
        </div>
      )}
      <div style={{ ...reveal(f, 22), display: "flex", gap: 22 }}>
        {["追蹤", "收藏", "留言"].map((t, i) => (
          <span key={t} style={{ fontFamily: FONT_ZH, fontSize: 38, fontWeight: 700, color: T.text, background: T.card, border: `2px solid ${T.cardBorder}`, borderTop: `6px solid ${[T.accent.pink.fill, T.accent.yellow.fill, T.accent.cyan.fill][i]}`, borderRadius: T.radiusTag, padding: "10px 34px", boxShadow: T.shadow }}>{t}</span>
        ))}
      </div>
      {next && <CardV2 topBar="yellow" style={{ ...reveal(f, 30), alignSelf: "stretch", padding: "26px 30px", fontFamily: FONT_ZH, fontSize: 38, lineHeight: 1.4, color: T.text, fontWeight: 700 }}>{next}</CardV2>}
      {disclaimer && <div style={{ ...reveal(f, 34), fontFamily: FONT_ZH, fontSize: 28, color: T.text3 }}>{disclaimer}</div>}
    </div>
  );
};

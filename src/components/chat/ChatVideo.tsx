// 對話泡泡（stage: "chat"）：整個畫面是一個自製的中性聊天介面，訊息跟著配音 cue 一則一則跳出來，中段升起一張統計卡。
// 顏色與版面讀 THEME_CHAT／LAYOUT_CHAT（src/theme.ts）；時間由 engine.ts 從 timeline 的 cue 算出，這裡不寫死幀數與色碼。
// 介面是自己畫的：不仿任何真實通訊軟體、不放商標、不出現真人頭像。畫面上固定標示「情境示意」。
import React from "react";
import { AbsoluteFill, Audio, Freeze, staticFile, useCurrentFrame } from "remotion";
import type { Script, TimelineV2 } from "../../types";
import { FONT_EN, FONT_ZH, LAYOUT_CHAT as L, THEME_CHAT as T, W, H } from "../../theme";
import { DUR, EASE, countUp, springAccent, tween } from "../anim";
import { splitParts } from "../Subtitle";
import { planChat, type ChatPlan, type Compose, type Stat, type ThreadItem } from "./engine";

const lin = (t: number) => t;
const fmt = (n: number) => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
const zh = (size: number, weight: number = T.weight.body): React.CSSProperties => ({ fontFamily: FONT_ZH, fontSize: size, fontWeight: weight, letterSpacing: "0.01em" });

/** 中性的人形（圓頭＋圓角身體）：頭像與統計卡共用，不是任何真實人物 */
const Person: React.FC<{ w: number; color: string }> = ({ w, color }) => (
  <svg width={w} height={Math.round(w * 1.34)} viewBox="0 0 40 54" style={{ display: "block" }}>
    <circle cx="20" cy="12" r="11" fill={color} />
    <rect x="4" y="26" width="32" height="28" rx="13" fill={color} />
  </svg>
);
const Avatar: React.FC<{ size: number }> = ({ size }) => (
  <div style={{ width: size, height: size, borderRadius: size, background: T.lilac, overflow: "hidden", display: "flex", alignItems: "flex-end", justifyContent: "center", flex: "none" }}>
    <Person w={Math.round(size * 0.62)} color={T.bar} />
  </div>
);
const Heart: React.FC<{ size: number }> = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 24 24"><path d="M12 21s-7.5-4.6-9.6-9.3C.9 8.300 3 4.500 6.600 4.500c2.100 0 3.700 1.100 5.400 3.100 1.700-2 3.300-3.100 5.400-3.100 3.600 0 5.700 3.800 4.200 7.200C19.500 16.400 12 21 12 21z" fill={T.accent} /></svg>
);

// ───────── 聯絡人列 ─────────
const TopBar: React.FC<{ contact: string; status: string; note: string }> = ({ contact, status, note }) => (
  <div style={{ position: "absolute", left: 0, top: 0, width: W, height: L.BAR_H, background: T.bar, borderBottom: `2px solid ${T.barLine}`, boxSizing: "border-box" }}>
    <div style={{ position: "absolute", left: 64, right: 64, top: L.BAR_MID - 48, height: 96, display: "flex", alignItems: "center", gap: 22 }}>
      <svg width="28" height="48" viewBox="0 0 28 48"><path d="M22 6 L6 24 L22 42" stroke={T.ink} strokeWidth="6" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
      <Avatar size={92} />
      <div style={{ flex: 1 }}>
        <div style={{ ...zh(52, T.weight.zh), color: T.ink, lineHeight: 1.1 }}>{contact}</div>
        <div style={{ ...zh(28), color: T.ink2, marginTop: 6, display: "flex", alignItems: "center", gap: 10 }}><i style={{ width: 14, height: 14, borderRadius: 7, background: T.mint, display: "block" }} />{status}</div>
      </div>
      <div style={{ ...zh(28), color: T.ink2, border: `2px solid ${T.ink3}`, borderRadius: 999, padding: "8px 22px", whiteSpace: "nowrap" }}>{note}</div>
    </div>
  </div>
);

// ───────── 對話串 ─────────
const Dots: React.FC<{ f: number }> = ({ f }) => (
  <div style={{ display: "flex", gap: 12, alignItems: "center", height: L.BUBBLE_LH }}>
    {[0, 1, 2].map((i) => <i key={i} style={{ width: 18, height: 18, borderRadius: 9, background: T.ink3, display: "block", transform: `translateY(${Math.round(-9 * Math.max(0, Math.sin(f / 3.2 - i * 0.9)))}px)` }} />)}
  </div>
);
const bubbleBox = (side: "me" | "them"): React.CSSProperties => ({
  ...zh(L.BUBBLE_PX), lineHeight: `${L.BUBBLE_LH}px`, whiteSpace: "pre", padding: `${L.BUBBLE_PAD_Y}px ${L.BUBBLE_PAD_X}px`, position: "relative",
  background: side === "me" ? T.me : T.them, color: side === "me" ? T.meText : T.themText,
  borderRadius: side === "me" ? `${L.BUBBLE_R}px ${L.BUBBLE_R}px 12px ${L.BUBBLE_R}px` : `${L.BUBBLE_R}px ${L.BUBBLE_R}px ${L.BUBBLE_R}px 12px`,
  boxShadow: side === "me" ? undefined : T.shadow,
});
const SurveyCard: React.FC<{ it: ThreadItem; f: number }> = ({ it, f }) => {
  const c0 = (it.countAt ?? it.at) - 8, land = (it.countAt ?? it.at) + 5;
  const show = tween(f, c0, DUR.xs);
  return (
    <div style={{ width: L.CARD_W, height: L.CARD_H, boxSizing: "border-box", background: T.them, borderRadius: 36, boxShadow: T.shadow, padding: "30px 36px", borderTop: `10px solid ${T.accent}` }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: 46 }}>
        <span style={{ ...zh(28, T.weight.zh), color: T.meText, background: T.accent, borderRadius: 999, padding: "4px 20px" }}>{it.kicker}</span>
        <span style={{ ...zh(30), color: T.ink2 }}>{it.meta}</span>
      </div>
      <div style={{ ...zh(50, T.weight.zh), color: T.ink, lineHeight: "64px", whiteSpace: "pre", marginTop: 14 }}>{it.title}</div>
      <div style={{ height: 2, background: T.barLine, margin: "18px 0 10px" }} />
      <div style={{ display: "flex", alignItems: "baseline", gap: 6, opacity: show, transform: `translateY(${Math.round(12 * (1 - show))}px)` }}>
        <span style={{ ...zh(40), color: T.ink2 }}>{it.prefix}</span>
        <span style={{ fontFamily: FONT_EN, fontWeight: 800, fontSize: 96, lineHeight: "104px", color: T.accent, fontVariantNumeric: "tabular-nums" }}>{fmt((it.value ?? 0) * countUp(f, c0, land))}</span>
        <span style={{ ...zh(40), color: T.ink2 }}>{it.unit}</span>
      </div>
    </div>
  );
};
const Thread: React.FC<{ plan: ChatPlan }> = ({ plan }) => {
  const f = useCurrentFrame();
  // 版面進度：每一則佔的高度在 8 幀內長出來（輸入中的點點被下一則取代時，同一個位置接上），整串貼齊底部往上推
  let y = 0;
  const rows = plan.items.map((it) => {
    const p = tween(f, it.at, DUR.s, EASE.move) - (it.until !== undefined ? tween(f, it.until, DUR.s, EASE.move) : 0);
    const top = y + it.gap * p;
    y += (it.h + it.gap) * p;
    return { it, top, p };
  });
  const base = L.VIEW_H - L.PAD_BOTTOM - y;
  return (
    <div style={{ position: "absolute", left: 0, top: L.VIEW_TOP, width: W, height: L.VIEW_H, overflow: "hidden", background: T.screen, backgroundImage: `radial-gradient(${T.wall} 3px, transparent 3.5px)`, backgroundSize: "46px 46px" }}>
      {rows.map(({ it, top, p }, i) => {
        if (f < it.at || (it.until !== undefined && f >= it.until + DUR.xs)) return null;
        const yy = Math.round(base + top);
        if (yy + it.h < -40) return null;
        const pop = springAccent(f, it.at), op = tween(f, it.at, DUR.xs) * (it.until !== undefined ? 1 - tween(f, it.until - 1, DUR.xs) : 1);
        if (it.kind === "date") return <div key={i} style={{ position: "absolute", left: 0, right: 0, top: yy, height: it.h, display: "flex", alignItems: "center", justifyContent: "center" }}><span style={{ ...zh(28), color: T.ink2, background: T.wall, borderRadius: 999, padding: "8px 26px" }}>{it.text}</span></div>;
        const me = it.side === "me";
        const firstOfGroup = !me && plan.items[i - 1]?.side !== "them";
        const read = it.readAt !== undefined ? tween(f, it.readAt, DUR.s) : 0;
        const react = it.reactAt !== undefined && f >= it.reactAt ? springAccent(f, it.reactAt) : 0;
        return (
          <div key={i} style={{ position: "absolute", top: yy, ...(me ? { right: L.PAD_X } : { left: L.PAD_X }), display: "flex", flexDirection: me ? "row-reverse" : "row", alignItems: "flex-end", gap: 14, opacity: op }}>
            {!me && <div style={{ width: L.AVATAR, alignSelf: "flex-start", opacity: firstOfGroup ? 1 : 0 }}><Avatar size={L.AVATAR} /></div>}
            <div style={{ transform: `scale(${(0.7 + 0.3 * pop).toFixed(4)})`, transformOrigin: me ? "100% 100%" : "0% 100%" }}>
              {it.kind === "card" ? <SurveyCard it={it} f={f} /> : (
                <div style={bubbleBox(me ? "me" : "them")}>
                  {it.kind === "typing" ? <Dots f={f} /> : it.text}
                  {react > 0 && <div style={{ position: "absolute", right: -20, bottom: -26, width: 68, height: 68, borderRadius: 34, background: T.bar, boxShadow: T.shadow, display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${react.toFixed(4)})` }}><Heart size={42} /></div>}
                </div>
              )}
            </div>
            {read > 0 && <div style={{ ...zh(28), color: T.ink2, opacity: read, paddingBottom: 8 }}>已讀</div>}
          </div>
        );
      })}
    </div>
  );
};

// ───────── 輸入框 ─────────
const InputBar: React.FC<{ composes: Compose[]; sends: number[] }> = ({ composes, sends }) => {
  const f = useCurrentFrame();
  const c = composes.find((x) => f >= x.at && f < x.until);
  const n = c ? Math.min(c.text.length, c.pre + Math.floor((c.text.length - c.pre + 0.999) * tween(f, c.at, Math.max(2, c.until - c.at - 5), lin))) : 0;
  const last = sends.filter((s) => s <= f).pop();
  const press = last === undefined ? 0 : tween(f, last, DUR.xs - 1) - tween(f, last + DUR.xs - 1, DUR.s, EASE.move);
  const caret = Math.floor(f / 8) % 2 === 0;
  return (
    <div style={{ position: "absolute", left: 0, top: L.INPUT_TOP, width: W, height: L.INPUT_H, background: T.bar, borderTop: `2px solid ${T.barLine}`, boxSizing: "border-box", display: "flex", alignItems: "center", gap: 18, padding: `0 ${L.PAD_X}px` }}>
      <div style={{ flex: 1, height: 80, borderRadius: 40, background: T.field, display: "flex", alignItems: "center", padding: "0 34px", ...zh(44), color: c ? T.ink : T.ink3, whiteSpace: "pre" }}>
        {c ? c.text.slice(0, n) : "輸入訊息"}
        {c && <i style={{ display: "block", width: 4, height: 50, marginLeft: 6, background: T.accent, opacity: caret ? 1 : 0 }} />}
      </div>
      <div style={{ width: 80, height: 80, borderRadius: 40, background: c && n > 0 ? T.accent : T.ink3, display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${(1 + 0.16 * press).toFixed(4)})`, flex: "none" }}>
        <svg width="40" height="40" viewBox="0 0 40 40"><path d="M20 33 V9 M9 19 L20 8 L31 19" stroke={T.meText} strokeWidth="5.5" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
      </div>
    </div>
  );
};

// ───────── 統計卡（從下面升起，蓋住對話串與輸入框） ─────────
const StatSheet: React.FC<{ s: Stat }> = ({ s }) => {
  const f = useCurrentFrame();
  const q = tween(f, s.until, DUR.s, EASE.exit);
  if (f < s.at || q >= 1) return null;
  const p = tween(f, s.at, DUR.m, EASE.enter);
  const hit = f >= s.fillAt;
  const punch = hit ? 0.6 + 0.4 * springAccent(f, s.fillAt) : 1;
  const lab = tween(f, s.labelAt, DUR.s, EASE.enter), mark = tween(f, s.labelAt + 2, DUR.m, EASE.move), foot = tween(f, s.labelAt + DUR.m, DUR.s);
  const pw = 64;
  return (
    <div style={{ position: "absolute", left: 0, top: L.VIEW_TOP, width: W, height: L.SHEET_TOP - L.VIEW_TOP, overflow: "hidden" }}>
      <div style={{ position: "absolute", inset: 0, background: T.scrim, opacity: p * (1 - q) }} />
      <div style={{ position: "absolute", left: L.STAT_X, top: L.STAT_TOP - L.VIEW_TOP, width: W - 2 * L.STAT_X, height: L.STAT_H, boxSizing: "border-box", background: T.bar, borderRadius: 48, boxShadow: T.shadowCard, padding: "42px 60px", transform: `translateY(${Math.round(980 * (1 - p) + 980 * q)}px)` }}>
        <div style={{ ...zh(30), color: T.ink2, display: "flex", alignItems: "center", gap: 14, height: 40 }}><i style={{ display: "block", width: 16, height: 16, borderRadius: 8, background: T.accent }} />{s.kicker}</div>
        <div style={{ ...zh(70, T.weight.zh), color: T.ink, lineHeight: "92px", marginTop: 6 }}>{s.head}</div>
        <div style={{ display: "grid", gridTemplateColumns: `repeat(${s.cols}, ${pw}px)`, justifyContent: "space-between", rowGap: 16, marginTop: 28 }}>
          {Array.from({ length: s.total }, (_, i) => {
            const on = i < s.on ? tween(f, s.fillAt + i, DUR.xs) : 0;
            return (
              <div key={i} style={{ position: "relative", width: pw, transform: `translateY(${Math.round(-8 * (on - tween(f, s.fillAt + i + DUR.xs, DUR.s, EASE.move)))}px)` }}>
                <Person w={pw} color={T.dotOff} />
                {on > 0 && <div style={{ position: "absolute", left: 0, top: 0, opacity: on }}><Person w={pw} color={T.accent} /></div>}
              </div>
            );
          })}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 34, marginTop: 30, height: 200 }}>
          <div style={{ fontFamily: FONT_EN, fontWeight: 800, fontSize: 196, lineHeight: "200px", color: hit ? T.accent : T.ink3, transform: `scale(${punch.toFixed(4)})`, transformOrigin: "0% 60%", minWidth: 300 }}>{hit ? s.big : "?"}</div>
          <div style={{ position: "relative", opacity: lab, transform: `translateX(${Math.round(24 * (1 - lab))}px)` }}>
            <div style={{ position: "absolute", left: -8, right: -8, bottom: 6, height: 34, background: T.gold, borderRadius: 8, transform: `scaleX(${mark.toFixed(4)})`, transformOrigin: "0% 50%" }} />
            <div style={{ ...zh(78, T.weight.zh), color: T.ink, lineHeight: "100px", position: "relative", whiteSpace: "nowrap" }}>{s.label}</div>
          </div>
        </div>
        {s.foot && <div style={{ ...zh(38), color: T.ink2, marginTop: 14, opacity: foot }}>{s.foot}</div>}
      </div>
    </div>
  );
};

// ───────── 下方旁白面板：頻道標籤、字幕（一次一段）、出處 ─────────
const Sheet: React.FC<{ script: Script; tl: TimelineV2 }> = ({ script, tl }) => {
  const f = useCurrentFrame();
  const ch = script.channel ?? {};
  const rows = script.scenes.flatMap((sc) => {
    const t = tl.scenes.find((x) => x.id === sc.id);
    if (!t?.subtitleWindow) return [];
    const [a, b] = t.subtitleWindow, ps = t.lines;
    const en = String(sc.subtitle.en ?? "").split("|").map((x) => x.trim()).filter(Boolean);
    const kwAt = Object.fromEntries(t.keywords.map((k) => [k.text, k.start]));
    const start = (k: number) => (k === 0 ? a : ps[k].start);
    return ps.map((ph, k) => ({ text: ph.text.replace(/\n/g, "").replace(/[，、；：。]+$/, ""), from: start(k), to: k + 1 < ps.length ? start(k + 1) : b, keywords: sc.keywords, kwAt,
      en: en[Math.min(en.length - 1, Math.floor((k * en.length) / ps.length))] ?? "" }));
  });
  const k = Math.max(0, rows.findIndex((r, i) => f >= r.from && (f < r.to || i === rows.length - 1)));
  const cur = rows[k];
  const p = cur.from <= 0 ? 1 : tween(f, cur.from, DUR.s - 2, EASE.enter);
  const src = [...script.scenes].reverse().map((sc) => ({ sc, t: tl.scenes.find((x) => x.id === sc.id) })).find((x) => x.t && f >= x.t.sourceWindow[0])?.sc.sources.join("、") ?? "";
  return (
    <div style={{ position: "absolute", left: 0, top: L.SHEET_TOP, width: W, height: H - L.SHEET_TOP, background: T.sheet, borderRadius: `${L.SHEET_R}px ${L.SHEET_R}px 0 0` }}>
      <div style={{ position: "absolute", left: 64, right: 64, top: L.TAG_Y - L.SHEET_TOP, height: 44, display: "flex", alignItems: "center", gap: 14, ...zh(28), color: T.sheetText2 }}>
        <Heart size={30} /><span style={{ color: T.sheetText, fontWeight: T.weight.zh }}>{ch.name}</span><i style={{ display: "block", width: 2, height: 24, background: T.sheetLine }} /><span>{ch.tag}</span>
      </div>
      <div style={{ position: "absolute", left: 40, right: 40, top: L.ZH_Y - L.SHEET_TOP, height: 110, display: "flex", alignItems: "center", justifyContent: "center", ...zh(L.ZH_PX, T.weight.zh), color: T.sheetText, whiteSpace: "nowrap", transform: `translateY(${Math.round(10 * (1 - p))}px)` }}>
        <span>{splitParts(cur.text, cur.keywords).map((s, i) => (s.k < 0 ? <span key={i}>{s.text}</span> : <span key={i} style={{ color: f >= (cur.kwAt[s.text] ?? 0) - 1 ? T.gold : T.sheetText }}>{s.text}</span>))}</span>
      </div>
      <div style={{ position: "absolute", left: 40, right: 40, top: L.EN_Y - L.SHEET_TOP, textAlign: "center", fontFamily: FONT_EN, fontWeight: T.weight.en, fontSize: L.EN_PX, color: T.sheetText2, whiteSpace: "nowrap" }}>{cur.en}</div>
      <div style={{ position: "absolute", left: 64, right: 64, top: L.SRC_Y - L.SHEET_TOP - 22, height: 2, background: T.sheetLine }} />
      <div style={{ position: "absolute", left: 64, right: 64, top: L.SRC_Y - L.SHEET_TOP, ...zh(L.SRC_PX, 400), color: T.sheetText2, whiteSpace: "nowrap" }}>{src}</div>
    </div>
  );
};

export const VideoChat: React.FC<Script & { timeline: TimelineV2; mute?: boolean }> = (props) => {
  const tl = props.timeline;
  const plan = React.useMemo(() => planChat(props, tl), [props, tl]);
  const chat = (props as any).chat ?? {};
  return (
    <AbsoluteFill style={{ background: T.screen }}>
      <Thread plan={plan} />
      <InputBar composes={plan.composes} sends={plan.sends} />
      {plan.stats.map((s, i) => <StatSheet key={i} s={s} />)}
      <TopBar contact={chat.contact ?? ""} status={chat.status ?? ""} note={chat.note ?? "情境示意"} />
      <Sheet script={props} tl={tl} />
      {!props.mute && tl.voice ? <Audio src={staticFile(tl.voice.file)} /> : null}
    </AbsoluteFill>
  );
};

/** 封面：直接停在統計卡落定的那一幀（chat.coverFrame 可指定；預設＝最後一張統計卡的標籤落定後 20 幀） */
export const CoverChat: React.FC<Script> = (props) => {
  const tl = props.timeline as TimelineV2;
  const plan = planChat(props, tl);
  const fr = (props as any).chat?.coverFrame ?? (plan.stats.length ? plan.stats[plan.stats.length - 1].labelAt + 20 : tl.totalFrames - 1);
  return <Freeze frame={fr}><VideoChat {...props} timeline={tl} mute /></Freeze>;
};

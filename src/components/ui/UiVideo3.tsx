// 仿介面動畫第 3 版（script.json 頂層 styleVersion: 3 ＋ stage: "ui" ＋ uiVersion: 3）：AI 教學頻道的完整長片（45–75 秒、有片尾卡）。
// 第 2 版（UiVideo2.tsx）一支片只放得下一個回答與一張結果卡；這一版把全片切成依序接力的段落（engine3.ts），
// 多了：第二次送出的回答＋為什麼、五個欄位的編輯器、結果卡逐行長出來、AI 也會錯的那一行（黃色框）、提醒卡、下一集預告、片尾卡。
// 手繪記號、對照卡、範本卡的畫法沿用第 2 版匯出的零件；視窗、游標、頭像、圖示都是自己畫的，沒有任何真實產品的商標或介面截圖。顏色只讀 THEME_UI。
import React, { useMemo } from "react";
import { AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame } from "remotion";
import type { Script, TimelineV2 } from "../../types";
import { FONT_ZH, FPS, LAYOUT_UI as L, THEME_UI as T, accentUI } from "../../theme";
import { EASE, tween } from "../anim";
import { mix } from "./engine";
import { typedCount } from "./engine2";
import { buildModel3, type Model3 } from "./engine3";
import { Avatar, Caret, Cursor, DocIcon, Ripple, SendIcon, Window, px, rise, slam } from "./parts";
import { CaptionUI, HeaderUI, SourceUI } from "./Tracks";
import { Backdrop, By, CompareCard, Dots, G, HandCheck, Rich, draw, tplLine, zh } from "./UiVideo2";

type P = { m: Model3; f: number };
/** 段落的進退場：上一段從 at 起退（motion.out＋2 幀），這一段等它退完再進；回傳 null＝這一幀不用畫 */
const stage = (f: number, at: number, out: number): React.CSSProperties | null => {
  if (f < at) return null;
  const o = tween(f, out, T.motion.out + 2, EASE.exit);
  if (o >= 1) return null;
  const i = at <= 0 ? 1 : tween(f, at + T.motion.out, T.motion.in + 2, EASE.enter);
  return { opacity: i * (1 - o), transform: `translateY(${px(44 * (1 - i) - 40 * o)}px)` };
};
/** 工具名稱與測試日期的小標籤（視窗標題列右邊；出現之後整支片都留著） */
const ToolTag: React.FC<P> = ({ m, f }) => {
  if (!m.toolTag || f < m.toolTag.at) return null;
  const s = slam(f, m.toolTag.at, 1.25), b = accentUI("blue");
  return <div style={{ ...zh(G.MIN_PX, T.weight.body, b.text), background: b.soft, border: `2px solid ${b.fill}`, borderRadius: T.radius.pill, padding: "4px 20px", opacity: s.opacity, transform: `scale(${s.scale.toFixed(3)})`, transformOrigin: "100% 50%" }}>{m.toolTag.text}</div>;
};
const card = (color?: string): React.CSSProperties => ({ position: "absolute", boxSizing: "border-box", background: T.panel, border: `2px solid ${T.line}`, ...(color ? { borderTop: `8px solid ${color}` } : {}), borderRadius: T.radius.card, boxShadow: T.shadow });
/** 灰色假文字列（新聞卡、文件卡用；不是任何真實內容） */
const Bars: React.FC<{ widths: number[]; h?: number; gap?: number; color?: string }> = ({ widths, h = 16, gap = 20, color = T.line }) => <>{widths.map((w, i) => <div key={i} style={{ width: `${w}%`, height: h, borderRadius: h / 2, background: color, marginTop: i ? gap : 0 }} />)}</>;

// ── 第一段：大字鉤子＋聊天視窗（隨便問 → 真的回答，紅筆圈 → 蓋章 → 對答案的小卡） ──
const CHAT = { x: L.X, w: L.INNER_W, top0: 846, bar: 72 };
const INPUT = { x: 24, h: 112, bottom: 24 };
const SEND = { cx: CHAT.x + CHAT.w - INPUT.x - 14 - 42, cy: G.BOTTOM - INPUT.bottom - INPUT.h / 2, r: 42 };
const ChatStage: React.FC<P> = ({ m, f }) => {
  const c = m.chat, st = stage(f, 0, c.out);
  if (!st) return null;
  const d = c.draft, v = accentUI("violet"), coral = accentUI("coral"), green = accentUI("green");
  const sent = f >= c.send;
  const chars = d ? [...d.text] : [];
  const typed = d ? typedCount(d.text, d.pauses, d.t0, d.t1, f) : 0;
  const typing = d ? f >= d.t0 && typed < chars.length : false;
  const press = tween(f, c.send - 3, 3, EASE.enter) - tween(f, c.send, 5, EASE.move);
  const go = tween(f, c.send - T.motion.cursor - 4, T.motion.cursor, EASE.move), away = tween(f, c.send + 6, T.motion.cursor + 6, EASE.move);
  const cx = mix(mix(800, SEND.cx - 6, go), 860, away), cy = mix(mix(1120, SEND.cy - 4, go), 1150, away);
  const curO = tween(f, c.send - T.motion.cursor - 10, 6, EASE.enter) * (1 - tween(f, c.send + 14, 8, EASE.exit));
  // 送出後：大字退場，視窗往上長到整個主視覺區
  const grow = tween(f, c.send, T.motion.camera, EASE.move), top = px(mix(c.hook ? CHAT.top0 : G.TOP, G.TOP, grow)), h = G.BOTTOM - top;
  const hookOut = tween(f, c.send - 2, T.motion.out, EASE.exit);
  const h2 = c.hook2 && f >= c.hook2.at ? c.hook2 : undefined, h2In = h2 ? slam(f, h2.at + 3, 1.08) : null, h1Out = c.hook2 ? tween(f, c.hook2.at - 2, 5, EASE.exit) : 0;
  const r = c.reply, lines = (c.hook?.title ?? "").split("\n"), hs = c.hook?.size ?? 176, nm = c.hook?.nums;
  const cut = nm ? tween(f, nm.at - 4, 5, EASE.move) : 0, nmS = nm ? slam(f, nm.at, 1.9) : null;
  const CPF = 2.5;   // 回覆每幀出幾個字
  const starts = r ? r.lines.reduce<number[]>((acc, _t, i) => [...acc, i === 0 ? r.at + 2 : acc[i - 1] + Math.ceil([...r.lines[i - 1].replace(/\*\*/g, "")].length / CPF) + 3], []) : [];
  const lastEnd = r && r.lines.length ? starts[starts.length - 1] + Math.ceil([...r.lines[r.lines.length - 1]].length / CPF) : 0;
  const stampS = r?.stamp ? slam(f, r.stamp.at, 1.7) : null;
  const dotsAt = Math.min(c.typing, r?.at ?? Infinity);
  return (
    <AbsoluteFill style={st}>
      {c.hook && hookOut < 1 ? (
        <div style={{ position: "absolute", left: L.X + 4, top: G.TOP + 6, opacity: 1 - hookOut, transform: `translateY(${px(-30 * hookOut)}px)` }}>
          <div style={{ opacity: 1 - h1Out, position: h2 && h1Out >= 1 ? "absolute" : "relative", visibility: h1Out >= 1 ? "hidden" : "visible" }}>
            {c.hook.kicker ? <div style={{ display: "inline-block", ...zh(34, T.weight.body, T.onAccent), background: v.fill, borderRadius: T.radius.pill, padding: "8px 28px", letterSpacing: "0.08em" }}>{c.hook.kicker}</div> : null}
            {lines.map((t, i) => <div key={i} style={{ ...zh(hs, T.weight.zh, i === lines.length - 1 ? v.text : T.text), lineHeight: 1.16, letterSpacing: "0.01em", marginTop: i === 0 ? 10 : 0 }}>{t}</div>)}
            {/* 數字列：第 0 幀就在；一秒內把錯的數字劃掉、蓋章 */}
            {nm && nmS ? (
              <div style={{ display: "flex", alignItems: "center", gap: 22, marginTop: 12, height: 96 }}>
                <div style={{ position: "relative", ...zh(78, T.weight.zh, cut > 0.5 ? T.text2 : T.text), fontFamily: FONT_ZH }}>
                  {nm.wrong}
                  <div style={{ position: "absolute", left: -8, top: "52%", height: 9, borderRadius: 5, background: coral.fill, width: `calc(${(100 * cut).toFixed(1)}% + ${px(16 * cut)}px)`, transform: "rotate(-5deg)", transformOrigin: "0 50%" }} />
                </div>
                <div style={{ ...zh(42, T.weight.zh, coral.text), background: coral.soft, border: `5px solid ${coral.fill}`, borderRadius: T.radius.chip, padding: "2px 22px", letterSpacing: "0.04em", opacity: f >= nm.at ? nmS.opacity : 0, transform: `rotate(-4deg) scale(${nmS.scale.toFixed(3)})` }}>{nm.tag}</div>
                <div style={{ ...zh(50, T.weight.zh, green.text), background: green.soft, border: `4px solid ${green.fill}`, borderRadius: T.radius.chip, padding: "4px 24px" }}>{nm.right}</div>
              </div>
            ) : null}
          </div>
          {h2 && h2In ? (
            <div style={{ opacity: h2In.opacity, transform: `scale(${h2In.scale.toFixed(3)})`, transformOrigin: "0 40%" }}>
              {h2.kicker ? <div style={{ display: "inline-block", ...zh(34, T.weight.body, T.onAccent), background: v.fill, borderRadius: T.radius.pill, padding: "8px 28px", letterSpacing: "0.08em" }}>{h2.kicker}</div> : null}
              {h2.title.split("\n").map((t, i, a) => <div key={i} style={{ ...zh(hs, T.weight.zh, i === a.length - 1 ? v.text : T.text), lineHeight: 1.16, letterSpacing: "0.01em", marginTop: i === 0 ? 10 : 0 }}>{t}</div>)}
            </div>
          ) : null}
        </div>
      ) : null}
      <Window x={CHAT.x} y={top} w={CHAT.w} h={h} bar={CHAT.bar} title="新對話" right={<ToolTag m={m} f={f} />}>
        {d?.empty && f < c.send ? (
          <div style={{ position: "absolute", left: 0, right: 0, top: CHAT.bar + 30, display: "flex", flexDirection: "column", alignItems: "center", gap: 22, opacity: 1 - tween(f, c.send - 7, 6, EASE.exit) }}>
            <div style={{ display: "flex", alignItems: "center", gap: 18 }}><Avatar size={64} /><div style={zh(44, T.weight.body, T.text2)}>{d.empty.title}</div></div>
            <div style={{ display: "flex", gap: 18 }}>
              {(d.empty.chips ?? []).map((t, i) => <div key={i} style={{ ...zh(34, T.weight.light, T.text2), height: 72, padding: "0 30px", display: "flex", alignItems: "center", border: `2px solid ${T.line}`, borderRadius: T.radius.pill, background: T.field }}>{t}</div>)}
            </div>
          </div>
        ) : null}
        {sent && d ? <div style={{ position: "absolute", right: 28, top: CHAT.bar + 24, height: 84, padding: "0 32px", display: "flex", alignItems: "center", background: v.fill, borderRadius: 30, borderBottomRightRadius: 8, ...zh(42, T.weight.body, T.onAccent), ...rise(f, c.send, 28) }}>{d.text}</div> : null}
        {sent && f >= dotsAt ? (
          <div style={{ position: "absolute", left: 28, top: CHAT.bar + 132, display: "flex", gap: 16, alignItems: "flex-start", ...rise(f, dotsAt, 16) }}>
            <Avatar size={64} />
            {!r || f < r.at ? (
              <div style={{ height: 64, padding: "0 28px", display: "flex", alignItems: "center", gap: 12, background: T.panel2, borderRadius: 26 }}><Dots f={f - c.send} /></div>
            ) : (
              <div style={{ width: 812, display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
                <div style={{ width: 812, boxSizing: "border-box", padding: "20px 30px 22px", background: T.panel2, border: `2px solid ${T.lineSoft}`, borderRadius: 26, borderTopLeftRadius: 8, ...rise(f, r.at, 12) }}>
                  <By text={r.by} />
                  {r.lines.map((t, i) => {
                    const n = Math.max(0, Math.floor((f - starts[i]) * CPF)), first = i === 0;
                    return (
                      <React.Fragment key={i}>
                        {i > 0 ? <div style={{ ...zh(G.MIN_PX, T.weight.body, T.text3), letterSpacing: "0.3em", lineHeight: 1, margin: "10px 0 6px", opacity: f >= starts[i] ? 1 : 0 }}>⋯</div> : null}
                        <div style={{ ...zh(first ? 46 : 38, first ? T.weight.body : T.weight.light, first ? T.text : T.text2), lineHeight: first ? 1.45 : 1.4, whiteSpace: "normal", marginTop: first ? 10 : 0 }}>
                          <Rich text={t} n={n} size={first ? 46 : 38} mark={first ? r.mark : undefined} markP={r.mark ? draw(f, r.mark.at) : 0} markColor={coral.fill} />
                        </div>
                      </React.Fragment>
                    );
                  })}
                  {r.more ? <div style={{ ...zh(30, T.weight.body, T.text2), marginTop: 12, paddingTop: 10, borderTop: `2px dashed ${T.line}`, opacity: tween(f, lastEnd, 6, EASE.enter) }}>{r.more}</div> : null}
                </div>
                {r.stamp && stampS && f >= r.stamp.at ? <div style={{ marginTop: 4, marginRight: 10, opacity: stampS.opacity, transform: `rotate(-4deg) scale(${stampS.scale.toFixed(3)})`, ...zh(50, T.weight.zh, coral.text), background: coral.soft, border: `5px solid ${coral.fill}`, borderRadius: T.radius.chip, padding: "4px 28px", letterSpacing: "0.04em" }}>{r.stamp.text}</div> : null}
              </div>
            )}
          </div>
        ) : null}
        {/* 輸入框 */}
        <div style={{ position: "absolute", left: INPUT.x, right: INPUT.x, bottom: INPUT.bottom, height: INPUT.h, background: T.field, border: `3px solid ${typed > 0 && !sent ? v.fill : T.line}`, borderRadius: T.radius.pill, display: "flex", alignItems: "center", paddingLeft: 44 }}>
          {d && !sent && typed > 0 ? <span style={zh(46)}>{chars.slice(0, typed).join("")}</span> : <span style={zh(42, T.weight.light, T.text3)}>{d?.placeholder}</span>}
          {!sent ? <Caret f={f} h={56} color={v.fill} solid={typing} /> : null}
          <div style={{ position: "absolute", right: 14, top: (INPUT.h - 6 - 2 * SEND.r) / 2, width: 2 * SEND.r, height: 2 * SEND.r, borderRadius: T.radius.pill, background: typed > 0 && !sent ? v.fill : T.line, display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${(1 - 0.1 * press).toFixed(3)})` }}>
            <SendIcon size={46} color={typed > 0 && !sent ? T.onAccent : T.text3} />
          </div>
        </div>
        {/* 對答案的小卡：蓋在輸入框上 */}
        {c.fact && f >= c.fact.at ? (
          <div style={{ position: "absolute", left: 24, right: 24, bottom: 24, height: 156, boxSizing: "border-box", background: green.soft, border: `4px solid ${green.fill}`, borderRadius: T.radius.card, boxShadow: T.shadow, display: "flex", flexDirection: "column", justifyContent: "center", paddingLeft: 40, ...rise(f, c.fact.at, 40) }}>
            <div style={{ ...zh(66, T.weight.zh, T.text), lineHeight: 1.15 }}>{c.fact.text}</div>
            {c.fact.sub ? <div style={{ ...zh(34, T.weight.body, green.text), marginTop: 4 }}>{c.fact.sub}</div> : null}
          </div>
        ) : null}
      </Window>
      <Ripple f={f} at={c.send} x={SEND.cx} y={SEND.cy} color={v.fill} />
      {curO > 0 ? <Cursor x={cx} y={cy} press={press} opacity={curO} /> : null}
    </AbsoluteFill>
  );
};

// ── 第二段：再送一次的回答（節錄）＋為什麼（兩個標籤依序亮） ──
const WHY = { cardH: 544, rowTop: 890, rowH: 150, rowGap: 16, footH: 92 };
const OffIcon: React.FC<{ kind: number; size: number; color: string }> = ({ kind, size, color }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" style={{ flexShrink: 0 }}>
    {kind === 0 ? <><circle cx={21} cy={21} r={11} fill="none" stroke={color} strokeWidth={4} /><path d="M29.5 29.5 L40 40" stroke={color} strokeWidth={4.5} strokeLinecap="round" /></>
      : <path d="M13 6 H28 L36 14 V42 H13 Z M28 6 V14 H36 M19 24 H30 M19 31 H27" fill="none" stroke={color} strokeWidth={3.6} strokeLinecap="round" strokeLinejoin="round" />}
    <path d="M6 42 L42 6" stroke={color} strokeWidth={4.5} strokeLinecap="round" />
  </svg>
);
const WhyStage: React.FC<P> = ({ m, f }) => {
  const w = m.why;
  if (!w) return null;
  const st = stage(f, w.at, w.out);
  if (!st) return null;
  const blue = accentUI("blue"), coral = accentUI("coral");
  const tIn = tween(f, w.tagsAt - 4, T.motion.in, EASE.enter);
  const cp = Boolean(w.compact), cardH = cp ? 236 : WHY.cardH, rowTop = cp ? G.TOP + cardH + 24 : WHY.rowTop, rowGap = cp ? 24 : WHY.rowGap, rowH = cp ? Math.floor((G.BOTTOM - WHY.footH - 24 - rowTop - rowGap) / 2) : WHY.rowH;
  return (
    <AbsoluteFill style={st}>
      <div style={{ ...card(blue.fill), left: L.X, top: G.TOP, width: L.INNER_W, height: cardH, padding: "22px 30px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ ...zh(cp ? 34 : 40, T.weight.zh, blue.text), background: blue.soft, border: `3px solid ${blue.fill}`, borderRadius: T.radius.chip, padding: "2px 20px" }}>{w.tag}</div>
          <By text={w.by} />
        </div>
        {cp ? null : <div style={{ marginTop: 18, height: 76, boxSizing: "border-box", display: "flex", alignItems: "center", padding: "0 30px", background: T.field, border: `2px solid ${T.line}`, borderRadius: T.radius.pill, ...zh(36, T.weight.light, T.text2) }}>{w.prompt}</div>}
        <div style={{ display: "flex", gap: 16, marginTop: 20, alignItems: "flex-start" }}>
          <Avatar size={60} />
          <div style={{ flex: 1 }}>
            {(cp ? w.lines.slice(0, 1) : w.lines).map((t, i) => (
              <React.Fragment key={i}>
                {i > 0 ? <div style={{ ...zh(G.MIN_PX, T.weight.body, T.text3), letterSpacing: "0.3em", lineHeight: 1, margin: "8px 0 4px" }}>⋯</div> : null}
                <div style={{ ...zh(cp ? 36 : i ? 38 : 44, i ? T.weight.light : T.weight.body, i || cp ? T.text2 : T.text), lineHeight: cp ? 1.5 : i ? 1.42 : 1.62, whiteSpace: "normal" }}>
                  <Rich text={t} size={cp ? 36 : 44} mark={i === 0 ? w.mark : undefined} markP={w.mark ? draw(f, w.mark.at) : 0} markColor={coral.fill} />
                </div>
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
      {w.items.map((it, i) => {
        const a = accentUI(it.color), on = f >= it.at, s = slam(f, it.at, 1.08), p = tween(f, it.at, T.motion.in, EASE.enter);
        return (
          <div key={i} style={{ position: "absolute", left: L.X, top: rowTop + i * (rowH + rowGap), width: L.INNER_W, height: rowH, boxSizing: "border-box", display: "flex", alignItems: "center", gap: 30, paddingLeft: 44, borderRadius: T.radius.card,
            background: on ? a.soft : T.field, border: on ? `4px solid ${a.fill}` : `3px dashed ${T.line}`, opacity: tIn, transform: `translateY(${px(20 * (1 - tIn))}px) scale(${(on ? s.scale : 1).toFixed(3)})` }}>
            <OffIcon kind={i} size={cp ? 112 : 88} color={on ? a.fill : T.text3} />
            <div style={{ ...zh(cp ? 104 : 80, T.weight.zh, on ? a.text : T.text3), letterSpacing: "0.03em" }}>{it.label}</div>
            <div style={{ position: "absolute", right: 36, ...zh(cp ? 84 : 64, T.weight.zh, a.fill), opacity: p }}>✕</div>
          </div>
        );
      })}
      {w.foot ? <div style={{ position: "absolute", left: L.X, top: G.BOTTOM - WHY.footH, width: L.INNER_W, height: WHY.footH, boxSizing: "border-box", display: "flex", alignItems: "center", justifyContent: "center", background: T.panel, border: `2px solid ${T.line}`, borderRadius: T.radius.card, ...zh(32, T.weight.body, T.text2), opacity: tIn }}>{w.foot}</div> : null}
    </AbsoluteFill>
  );
};

// ── 第三段：「這樣問」編輯器（五塊逐塊亮）→ 送出 → 真的回答逐行長出來（打勾、亮起、底線） ──
const ED = { x: L.X, y: G.TOP, w: L.INNER_W, h: G.BOTTOM - G.TOP, bar: 84 };
const ROW = { top: 100, h: 132, step: 148, chipW: 220, chipH: 92, fieldX: 260 };
const CHIP = { y: ED.y + ED.bar + 24, w: 170, h: 76, gap: 12 };
const RES = { top: ED.bar + 24 + 76 + 24, pad: 24 };
const RUN_BTN = { w: 228, h: 88, right: 28, bottom: 28 };
const EditorStage: React.FC<P> = ({ m, f }) => {
  const ed = m.editor;
  if (!ed) return null;
  const st = stage(f, ed.at, ed.out);
  if (!st) return null;
  const slots = ed.slots, res = ed.result, runAt = ed.run;
  const morph = tween(f, runAt + 2, 12, EASE.move), fieldsOut = tween(f, runAt + 1, 7, EASE.exit);
  const filled = slots.filter((s) => f >= s.at).length, full = slots.length > 0 && filled >= slots.length;
  const active = slots.reduce((k, s, i) => (f >= s.at ? i : k), -1);
  const violet = accentUI("violet"), green = accentUI("green"), amber = accentUI("amber");
  const chipX0 = (L.W - (slots.length * CHIP.w + (slots.length - 1) * CHIP.gap)) / 2;
  const slotIn = (i: number) => ed.slotsAt + i * 3;
  const btn = { cx: ED.x + ED.w - RUN_BTN.right - RUN_BTN.w / 2, cy: ED.y + ED.h - RUN_BTN.bottom - RUN_BTN.h / 2 };
  const press = tween(f, runAt - 3, 3, EASE.enter) - tween(f, runAt, 5, EASE.move);
  const resAt = res?.at ?? Infinity, cardAt = Math.min(resAt - 2, runAt + 10);
  return (
    <AbsoluteFill style={st}>
      <Window x={ED.x} y={ED.y} w={ED.w} h={ED.h} bar={ED.bar} title={ed.title} right={<ToolTag m={m} f={f} />}>
        {fieldsOut < 1 ? slots.map((s, i) => {
          if (f < slotIn(i)) return null;
          const a = accentUI(s.color), on = f >= s.at, focus = on && active === i;
          const chars = [...s.text], n = Math.max(0, Math.min(chars.length, Math.floor((f - s.at - 1) * 1.5) + 1));
          return (
            <div key={i} style={{ position: "absolute", left: ROW.fieldX, right: 24, top: ROW.top + i * ROW.step, height: ROW.h, boxSizing: "border-box", background: T.field, border: `3px solid ${focus ? a.fill : on ? a.soft : T.line}`, borderRadius: T.radius.card, padding: "0 26px", display: "flex", alignItems: "center", opacity: (1 - fieldsOut) * tween(f, slotIn(i), T.motion.in, EASE.enter) }}>
              {!on ? <div style={{ height: 16, width: 320 - i * 36, borderRadius: 8, background: T.line }} />
                : s.parts ? (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "10px 12px" }}>
                    {s.parts.map((q, k) => { const lit = f >= q.at, e = slam(f, q.at, 1.2); return <div key={k} style={{ ...zh(34, T.weight.body, lit ? a.text : T.text3), height: 50, padding: "0 16px", display: "flex", alignItems: "center", borderRadius: T.radius.chip, background: lit ? a.soft : "transparent", border: lit ? `2px solid ${a.fill}` : `2px dashed ${T.line}`, transform: `scale(${(lit ? e.scale : 1).toFixed(3)})` }}>{k + 1}. {q.t}</div>; })}
                  </div>
                ) : <div style={{ ...zh(40, T.weight.body), lineHeight: 1.35, whiteSpace: "normal" }}>{chars.slice(0, n).join("")}{n < chars.length ? <Caret f={f} h={42} color={a.fill} solid /> : null}<span style={{ opacity: 0 }}>{chars.slice(n).join("")}</span></div>}
            </div>
          );
        }) : null}
        {fieldsOut < 1 ? (
          <>
            <div style={{ position: "absolute", left: 28, bottom: RUN_BTN.bottom + 12, ...zh(34, T.weight.body, full ? green.text : T.text2), opacity: 1 - fieldsOut }}>{filled}／{slots.length || 5} 塊</div>
            <div style={{ position: "absolute", right: RUN_BTN.right, bottom: RUN_BTN.bottom, width: RUN_BTN.w, height: RUN_BTN.h, borderRadius: T.radius.pill, background: full ? violet.fill : T.line, display: "flex", alignItems: "center", justifyContent: "center", gap: 10, opacity: 1 - fieldsOut, transform: `scale(${(1 - 0.08 * press).toFixed(3)})`, ...zh(38, T.weight.zh, full ? T.onAccent : T.text3) }}>
              送出<SendIcon size={40} color={full ? T.onAccent : T.text3} />
            </div>
          </>
        ) : null}
        {/* 真的回答（節錄）：同一張卡，後面的行念到才長出來 */}
        {res && f >= cardAt ? (
          <div style={{ position: "absolute", left: RES.pad, right: RES.pad, top: RES.top, bottom: RES.pad, boxSizing: "border-box", background: T.panel2, border: `2px solid ${T.line}`, borderRadius: T.radius.card, padding: "24px 28px", ...rise(f, cardAt, 30) }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 14 }}><Avatar size={56} /><By text={res.by} />{f < resAt + 2 ? <div style={{ display: "flex", gap: 10, marginLeft: 8 }}><Dots f={f - cardAt} /></div> : null}</div>
            {res.lines.map((l, i) => {
              const a = accentUI(l.color), mk = l.mark, mp = mk ? draw(f, Math.max(mk.at, l.at + 6)) : 0;
              const lit = mk?.kind === "check" && mp > 0, fo = l.focusAt !== undefined ? tween(f, l.focusAt, T.motion.in, EASE.enter) : 0;
              // 還沒念到的行先放灰色假文字列（看得出下面還有），念到才換成真的字
              if (f < l.at) return (
                <div key={i} style={{ position: "relative", marginTop: l.head ? (i ? 18 : 0) : 4, padding: l.head ? 0 : "6px 100px 6px 18px", marginLeft: l.head ? 0 : -6, opacity: 0.6 * tween(f, resAt + 8, 8, EASE.enter) }}>
                  <div style={{ ...zh(l.head ? 40 : 46, T.weight.body), lineHeight: 1.4, whiteSpace: "normal", opacity: 0 }}>{l.t.replace(/\*\*/g, "")}</div>
                  <div style={{ position: "absolute", left: l.head ? 0 : 18, top: l.head ? 20 : 30, width: l.head ? 240 : "78%" }}><Bars widths={l.head ? [100] : [100, 46]} h={16} gap={l.head ? 0 : 46} /></div>
                </div>
              );
              return (
                <div key={i} style={{ position: "relative", marginTop: l.head ? (i ? 18 : 0) : 4, padding: l.head ? 0 : "6px 100px 6px 18px", marginLeft: l.head ? 0 : -6, borderRadius: T.radius.chip, background: lit ? green.soft : fo > 0 ? amber.soft : "transparent", boxShadow: fo > 0 ? `inset 8px 0 0 ${amber.fill}` : undefined, ...rise(f, l.at, 14) }}>
                  {l.head ? <div style={{ ...zh(40, T.weight.zh, a.text), lineHeight: 1.4 }}>{l.t}</div>
                    : <div style={{ ...zh(46, T.weight.body), lineHeight: 1.4, whiteSpace: "normal" }}><Rich text={l.t} size={46} mark={mk} markP={mp} markColor={amber.fill} /></div>}
                  {mk?.kind === "check" ? <HandCheck size={84} p={mp} color={green.fill} style={{ position: "absolute", right: 8, top: "50%", marginTop: -42 }} /> : null}
                </div>
              );
            })}
          </div>
        ) : null}
      </Window>
      {/* 欄位標籤：編輯器裡在每列左邊；送出後排到上面一列 */}
      {slots.map((s, i) => {
        if (f < slotIn(i)) return null;
        const a = accentUI(s.color), on = f >= s.at;
        const e = tween(f, slotIn(i), T.motion.in, EASE.enter), hit = slam(f, s.at, 1.14);
        const x = mix(ED.x + 24, chipX0 + i * (CHIP.w + CHIP.gap), morph), y = mix(ED.y + ROW.top + i * ROW.step + (ROW.h - ROW.chipH) / 2, CHIP.y, morph) + 22 * (1 - e);
        return (
          <div key={i} style={{ position: "absolute", left: px(x), top: px(y), width: px(mix(ROW.chipW, CHIP.w, morph)), height: px(mix(ROW.chipH, CHIP.h, morph)), boxSizing: "border-box", opacity: e, transform: `scale(${(on ? hit.scale : 1).toFixed(3)})`, borderRadius: T.radius.chip, display: "flex", alignItems: "center", justifyContent: "center",
            background: on ? a.fill : "transparent", border: on ? `3px solid ${a.fill}` : `3px dashed ${T.text3}`, ...zh(px(mix(46, 36, morph)), T.weight.zh, on ? T.onAccent : T.text2), letterSpacing: "0.02em" }}>{on ? s.label : i + 1}</div>
        );
      })}
      <Ripple f={f} at={runAt} x={btn.cx} y={btn.cy} color={violet.fill} />
    </AbsoluteFill>
  );
};

// ── 第四段：上下並排對照（兩個回答同時停在畫面上；卡片沿用第 2 版） ──
const CMP = { h: 452 };
const CompareStage: React.FC<P> = ({ m, f }) => {
  const c = m.compare;
  if (!c) return null;
  const st = stage(f, c.at, c.out);
  if (!st) return null;
  const y2 = G.BOTTOM - CMP.h, b = c.badge ? slam(f, c.badge.at, 1.3) : null, on = c.badge ? f >= c.badge.at : false;
  return (
    <AbsoluteFill style={st}>
      <CompareCard s={c.top} by={c.by} color="coral" y={G.TOP} />
      <CompareCard s={c.bottom} by={c.by} color="green" y={y2} />
      {c.badge ? (
        <div style={{ position: "absolute", left: 0, right: 0, top: G.TOP + CMP.h, height: y2 - G.TOP - CMP.h, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14, height: 72, padding: "0 34px", borderRadius: T.radius.pill, background: on ? T.text : T.panel2, border: `2px solid ${T.line}`, ...zh(40, T.weight.zh, on ? T.onAccent : T.text2), transform: `scale(${(on && b ? b.scale : 1).toFixed(3)})` }}><Avatar size={44} />{c.badge.text}</div>
        </div>
      ) : null}
    </AbsoluteFill>
  );
};

// ── 第五段：AI 也會錯的那一行（黃色框＋說明；不用紅筆，紅筆全片只用一次） ──
const FlagStage: React.FC<P> = ({ m, f }) => {
  const g = m.flag;
  if (!g) return null;
  const st = stage(f, g.at, g.out);
  if (!st) return null;
  const a = accentUI(g.color), hc = accentUI(g.headColor);
  const k = g.line.indexOf(g.target), pre = k < 0 ? g.line : g.line.slice(0, k), post = k < 0 ? "" : g.line.slice(k + g.target.length);
  const on = f >= g.flagAt, s = slam(f, g.flagAt, 1.12), p = tween(f, g.flagAt, T.motion.in + 2, EASE.enter), lab = tween(f, g.flagAt + 4, T.motion.in, EASE.enter);
  return (
    <AbsoluteFill style={st}>
      <Window x={ED.x} y={ED.y} w={ED.w} h={ED.h} bar={ED.bar} title={g.title} right={<ToolTag m={m} f={f} />}>
        <div style={{ position: "absolute", left: RES.pad, right: RES.pad, top: ED.bar + 24, bottom: RES.pad, boxSizing: "border-box", background: T.panel2, border: `2px solid ${T.line}`, borderRadius: T.radius.card, padding: "28px 34px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}><Avatar size={56} /><By text={g.by} /></div>
          {g.head ? <div style={{ display: "inline-block", ...zh(48, T.weight.zh, hc.text), background: hc.soft, border: `3px solid ${hc.fill}`, borderRadius: T.radius.chip, padding: "4px 24px", marginTop: 26 }}>{g.head}</div> : null}
          <div style={{ marginTop: 22 }}>{g.before.map((t, i) => <div key={i} style={{ ...zh(40, T.weight.light, T.text2), lineHeight: "64px" }}>{t}</div>)}</div>
          <div style={{ ...zh(58, T.weight.body), lineHeight: 1.6, whiteSpace: "normal", marginTop: 10 }}>
            {pre}
            {k >= 0 ? (
              <span style={{ position: "relative", display: "inline-block", whiteSpace: "nowrap", color: on ? a.text : undefined, fontWeight: T.weight.zh }}>
                {g.target}
                <span style={{ position: "absolute", left: -10, right: -10, top: 4, bottom: 4, border: `6px solid ${a.fill}`, borderRadius: T.radius.chip, opacity: p, transform: `scale(${s.scale.toFixed(3)})` }} />
              </span>
            ) : null}
            {post}
          </div>
          {/* 說明：從框往下拉一條線到說明卡 */}
          <div style={{ position: "absolute", left: 34, right: 34, bottom: 30, height: 290, opacity: lab, transform: `translateY(${px(24 * (1 - lab))}px)` }}>
            <div style={{ position: "absolute", left: 150, top: -14, width: 8, height: 64, borderRadius: 4, background: a.fill }} />
            <div style={{ position: "absolute", left: 0, right: 0, top: 50, bottom: 0, boxSizing: "border-box", background: a.soft, border: `5px solid ${a.fill}`, borderRadius: T.radius.card, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10 }}>
              <div style={{ ...zh(72, T.weight.zh, a.text), letterSpacing: "0.02em" }}>{g.text}</div>
              {g.sub ? <div style={zh(44, T.weight.body, T.text)}>{g.sub}</div> : null}
            </div>
          </div>
        </div>
      </Window>
    </AbsoluteFill>
  );
};

// ── 第六段：提醒卡（AI 的回答 ⇄ 原文） ──
const RemindStage: React.FC<P> = ({ m, f }) => {
  const r = m.remind;
  if (!r) return null;
  const st = stage(f, r.at, r.out);
  if (!st) return null;
  const am = accentUI("amber"), on = f >= r.pulseAt, s = slam(f, r.pulseAt, 1.06), p = tween(f, r.pulseAt, T.motion.in + 2, EASE.enter);
  const doc = (label: string, hot: boolean, widths: number[]): React.ReactNode => (
    <div style={{ width: 356, height: 380, boxSizing: "border-box", background: T.field, border: `3px solid ${hot && on ? am.fill : T.line}`, borderRadius: T.radius.card, padding: "26px 30px", transform: `scale(${(hot && on ? s.scale : 1).toFixed(3)})` }}>
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 30 }}>{hot ? <DocIcon size={56} color={on ? am.fill : T.text2} /> : <Avatar size={56} />}<div style={zh(44, T.weight.zh, hot && on ? am.text : T.text)}>{label}</div></div>
      <Bars widths={widths.slice(0, 2)} h={18} gap={24} />
      <div style={{ height: 30, width: "62%", borderRadius: 10, background: am.fill, opacity: hot ? 1 : 0.55, margin: "24px 0" }} />
      <Bars widths={widths.slice(2)} h={18} gap={24} />
    </div>
  );
  return (
    <AbsoluteFill style={st}>
      <div style={{ ...card(am.fill), left: L.X, top: G.TOP, width: L.INNER_W, height: G.BOTTOM - G.TOP, display: "flex", flexDirection: "column", alignItems: "center", padding: "70px 40px 0" }}>
        <div style={{ ...zh(164, T.weight.zh), lineHeight: 1.15, letterSpacing: "0.01em" }}>{r.text}</div>
        <div style={{ display: "flex", alignItems: "center", gap: 28, marginTop: 70 }}>
          {doc(r.left ?? "AI 回答", false, [92, 70, 84, 56])}
          <svg width={100} height={100} viewBox="0 0 48 48"><path d="M6 17 H40 M32 9 L40 17 L32 25 M42 31 H8 M16 23 L8 31 L16 39" fill="none" stroke={on ? am.fill : T.text3} strokeWidth={4.4} strokeLinecap="round" strokeLinejoin="round" /></svg>
          {doc(r.right ?? "原文", true, [88, 76, 90, 48])}
        </div>
        {r.sub ? <div style={{ marginTop: 76, height: 128, padding: "0 44px", display: "flex", alignItems: "center", borderRadius: T.radius.pill, background: p > 0.5 ? am.fill : am.soft, border: `4px solid ${am.fill}`, ...zh(60, T.weight.zh, p > 0.5 ? T.onAccent : am.text), transform: `scale(${(on ? s.scale : 1).toFixed(3)})` }}>{r.sub}</div> : null}
      </div>
    </AbsoluteFill>
  );
};

// ── 第七段：可以截圖的範本卡＋提問 ──
const TPL = { h: 836, askH: 120 };
const TPL_TALL = G.BOTTOM - G.TOP - 120 - 16;   // 有 foot 的範本卡：拉高到提問列上緣，不放空的輸入框
const TemplateStage: React.FC<P> = ({ m, f }) => {
  const t = m.template;
  if (!t) return null;
  const st = stage(f, t.at, t.out);
  if (!st) return null;
  const v = accentUI("violet");
  const pulse = f >= t.pulseAt ? slam(f, t.pulseAt, 1.035).scale : 1;
  const hint = slam(f, t.hintAt, 1.3), ask = m.ask && f >= m.ask.at ? slam(f, m.ask.at, 1.15) : null;
  return (
    <AbsoluteFill style={st}>
      <div style={{ position: "absolute", left: L.X, top: G.TOP, width: L.INNER_W, height: t.foot ? TPL_TALL : TPL.h, boxSizing: "border-box", background: T.panel, border: `3px solid ${v.fill}`, borderRadius: T.radius.window, boxShadow: T.shadow, padding: "30px 44px", transform: `scale(${pulse.toFixed(4)})` }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingBottom: 20, borderBottom: `2px dashed ${T.line}` }}>
          <div style={zh(56, T.weight.zh)}>{t.title}</div>
          {t.hint && f >= t.hintAt ? <div style={{ ...zh(32, T.weight.zh, T.onAccent), background: v.fill, borderRadius: T.radius.pill, padding: "6px 24px", opacity: hint.opacity, transform: `scale(${hint.scale.toFixed(3)})`, transformOrigin: "100% 50%" }}>{t.hint}</div> : null}
        </div>
        <div style={{ marginTop: 16 }}>
          {t.lines.map((l, i) => <div key={i} style={{ ...zh(t.linePx ?? 44, T.weight.body), lineHeight: `${t.lineH ?? 72}px`, paddingLeft: /^\d\./.test(l) ? 30 : 0 }}>{tplLine(l)}</div>)}
        </div>
      </div>
      {/* 提問列：先是一個空的留言框，念到才填滿 */}
      {t.foot && !ask ? <div style={{ position: "absolute", left: L.X, top: G.BOTTOM - TPL.askH, width: L.INNER_W, height: TPL.askH, display: "flex", alignItems: "center", justifyContent: "center", ...zh(34, T.weight.body, T.text2) }}>{t.foot}</div> : null}
      {m.ask && !ask && !t.foot ? <div style={{ position: "absolute", left: L.X, top: G.BOTTOM - TPL.askH, width: L.INNER_W, height: TPL.askH, boxSizing: "border-box", background: T.field, border: `3px solid ${T.line}`, borderRadius: T.radius.card, display: "flex", alignItems: "center", paddingLeft: 36 }}><Caret f={f} h={56} color={v.fill} /></div> : null}
      {m.ask && ask ? (
        <div style={{ position: "absolute", left: L.X, top: G.BOTTOM - TPL.askH, width: L.INNER_W, height: TPL.askH, boxSizing: "border-box", background: v.fill, borderRadius: T.radius.card, display: "flex", alignItems: "center", justifyContent: "center", ...zh(56, T.weight.zh, T.onAccent), letterSpacing: "0.02em", opacity: ask.opacity, transform: `scale(${ask.scale.toFixed(3)})` }}>{m.ask.text}</div>
      ) : null}
    </AbsoluteFill>
  );
};

// ── 第八段：下一集預告（兩張新聞卡分開，中間冒出問號） ──
const NEXT = { cardW: 440, cardH: 452, cardY: 846 };
const NextStage: React.FC<P> = ({ m, f }) => {
  const n = m.next;
  if (!n) return null;
  const st = stage(f, n.at, n.out);
  if (!st) return null;
  const v = accentUI("violet"), am = accentUI("amber"), bl = accentUI("blue");
  const sp = tween(f, n.splitAt, 12, EASE.move), q = slam(f, n.askAt, 1.5), lines = n.title.split("\n");
  const news = (label: string, a: { fill: string; text: string; soft: string }, x: number, rot: number, up: boolean) => (
    <div style={{ ...card(a.fill), left: px(x), top: NEXT.cardY, width: NEXT.cardW, height: NEXT.cardH, padding: "24px 30px", transform: `rotate(${rot.toFixed(2)}deg)` }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ ...zh(46, T.weight.zh, T.onAccent), background: a.fill, borderRadius: T.radius.chip, padding: "2px 22px" }}>{label}</div>
        <svg width={84} height={84} viewBox="0 0 48 48"><path d={up ? "M24 42 V8 M10 22 L24 8 L38 22" : "M24 6 V40 M10 26 L24 40 L38 26"} fill="none" stroke={a.fill} strokeWidth={5.5} strokeLinecap="round" strokeLinejoin="round" /></svg>
      </div>
      <div style={{ marginTop: 30 }}><Bars widths={[94, 78]} h={20} gap={26} /></div>
      <div style={{ height: 34, width: up ? "70%" : "52%", borderRadius: 10, background: a.soft, border: `3px solid ${a.fill}`, boxSizing: "border-box", margin: "26px 0" }} />
      <Bars widths={[88, 60, 74]} h={20} gap={26} />
    </div>
  );
  const cx = (L.W - NEXT.cardW) / 2;
  return (
    <AbsoluteFill style={st}>
      <div style={{ position: "absolute", left: L.X + 4, top: G.TOP + 6 }}>
        {n.kicker ? <div style={{ display: "inline-block", ...zh(40, T.weight.zh, T.onAccent), background: v.fill, borderRadius: T.radius.pill, padding: "8px 32px", letterSpacing: "0.08em" }}>{n.kicker}</div> : null}
        {lines.map((t, i) => <div key={i} style={{ ...zh(146, T.weight.zh, i === lines.length - 1 ? v.text : T.text), lineHeight: 1.18, letterSpacing: "0.01em", marginTop: i === 0 ? 14 : 0 }}>{t}</div>)}
      </div>
      {news(n.left, am, mix(cx - 22, L.X, sp), mix(-5, -2, sp), true)}
      {news(n.right, bl, mix(cx + 22, L.W - L.X - NEXT.cardW, sp), mix(5, 2, sp), false)}
      {f >= n.askAt ? <div style={{ position: "absolute", left: L.W / 2 - 84, top: NEXT.cardY + NEXT.cardH / 2 - 84, width: 168, height: 168, borderRadius: T.radius.pill, background: v.fill, border: `8px solid ${T.bg}`, boxSizing: "border-box", display: "flex", alignItems: "center", justifyContent: "center", ...zh(110, T.weight.zh, T.onAccent), opacity: q.opacity, transform: `scale(${q.scale.toFixed(3)})` }}>？</div> : null}
    </AbsoluteFill>
  );
};

// ── 片尾卡：頻道名、標籤、slogan、片名、工具與測試日期 ──
const EndStage: React.FC<P & { name: string; tag: string; slogan?: string }> = ({ m, f, name, tag, slogan }) => {
  const e = m.end;
  if (!e || f < e.at) return null;
  const v = accentUI("violet"), p = tween(f, e.at + T.motion.out, T.motion.in + 2, EASE.enter);
  return (
    <AbsoluteFill style={{ opacity: p, transform: `translateY(${px(36 * (1 - p))}px)` }}>
      <div style={{ ...card(v.fill), left: L.X, top: G.TOP + 60, width: L.INNER_W, height: 1180, display: "flex", flexDirection: "column", alignItems: "center", padding: "84px 40px 0" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 30 }}>
          <div style={{ width: 150, height: 150, borderRadius: 44, background: v.fill, display: "flex", alignItems: "center", justifyContent: "center" }}><div style={{ width: 62, height: 62, borderRadius: 18, background: T.bg }} /></div>
          <div style={{ ...zh(190, T.weight.zh), lineHeight: 1, letterSpacing: "0.04em" }}>{name}</div>
        </div>
        <div style={{ ...zh(48, T.weight.zh, v.text), background: v.soft, borderRadius: T.radius.pill, padding: "10px 40px", letterSpacing: "0.1em", marginTop: 44 }}>{tag}</div>
        {slogan ? <div style={{ ...zh(64, T.weight.zh), marginTop: 36, letterSpacing: "0.04em" }}>{slogan}</div> : null}
        <div style={{ width: "100%", borderTop: `2px dashed ${T.line}`, margin: "64px 0 56px" }} />
        <div style={zh(34, T.weight.body, T.text2)}>這一集</div>
        <div style={{ ...zh(116, T.weight.zh, v.text), lineHeight: 1.25, marginTop: 6 }}>{e.title}</div>
        {e.sub ? <div style={{ ...zh(48, T.weight.body), marginTop: 18 }}>{e.sub}</div> : null}
        {e.note ? <div style={{ position: "absolute", left: 0, right: 0, bottom: 44, textAlign: "center", ...zh(G.MIN_PX, T.weight.body, T.text2), letterSpacing: "0.02em" }}>{e.note}</div> : null}
      </div>
    </AbsoluteFill>
  );
};

export const VideoUI3: React.FC<Script & { timeline: TimelineV2 }> = ({ scenes, timeline, channel }) => {
  const f = useCurrentFrame();
  const m = useMemo(() => buildModel3(scenes, timeline), [scenes, timeline]);
  const by = Object.fromEntries(timeline.scenes.map((x) => [x.id, x]));
  const ordered = scenes.filter((s) => by[s.id]);
  const subCues = ordered.filter((s) => by[s.id].subtitleWindow).map((s) => ({ id: s.id, en: s.subtitle.en, keywords: s.keywords, window: by[s.id].subtitleWindow as [number, number], phrases: by[s.id].lines, keywords_at: by[s.id].keywords, kwColors: (s.props as Record<string, any> | undefined)?.capColors as string[] | undefined }));
  const srcCues = ordered.map((s) => ({ sources: s.sources, window: by[s.id].sourceWindow, plain: Boolean(s.props?.sourcePlain) }));
  const ch = channel as { name?: string; tag?: string; slogan?: string } | undefined;
  const tracks = m.end ? 1 - tween(f, m.end.at, T.motion.out + 2, EASE.exit) : 1;   // 片尾卡進來時字幕列與出處一起退
  return (
    <AbsoluteFill>
      <Backdrop />
      <ChatStage m={m} f={f} />
      <WhyStage m={m} f={f} />
      <EditorStage m={m} f={f} />
      <CompareStage m={m} f={f} />
      <FlagStage m={m} f={f} />
      <RemindStage m={m} f={f} />
      <TemplateStage m={m} f={f} />
      <NextStage m={m} f={f} />
      <EndStage m={m} f={f} name={ch?.name ?? "AI"} tag={ch?.tag ?? "AI 動手做"} slogan={ch?.slogan} />
      {tracks > 0 ? <AbsoluteFill style={{ opacity: tracks }}><CaptionUI cues={subCues} top={G.CAP_TOP} /><SourceUI cues={srcCues} top={G.SRC_TOP} size={30} weight={T.weight.body} /></AbsoluteFill> : null}
      <HeaderUI name={ch?.name ?? "AI"} tag={ch?.tag ?? "AI 動手做"} total={timeline.totalFrames} tagPx={G.MIN_PX} />
      {timeline.voice ? <Audio src={staticFile(timeline.voice.file)} /> : timeline.scenes.filter((t) => t.audio).map((t) => (
        <Sequence key={`${t.id}-audio`} from={t.audioFrame} durationInFrames={Math.ceil(t.audioSec * FPS) + 1} name={`${t.id}-audio`} layout="none"><Audio src={staticFile(t.audio as string)} /></Sequence>
      ))}
    </AbsoluteFill>
  );
};

// 仿介面動畫第 2 版（script.json 頂層 styleVersion: 3 ＋ stage: "ui" ＋ uiVersion: 2）：AI 教學搭配時事。
// 和第 1 版（UiVideo.tsx，sample-ai-ui）的差別：第 0 幀實心大字鉤子、打字有快慢、工具名稱與測試日期標籤、真實回答（節錄）可換行、
// 紅筆圈／打勾／底線、上下並排對照、可截圖的範本卡、字幕與出處往下移讓主視窗變大。每一段只有一個會動的重點，打字時鏡頭不動。
// 視窗、游標、頭像都是自己畫的，沒有任何真實產品的商標或介面截圖。顏色只讀 THEME_UI。
import React, { useMemo } from "react";
import { AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame } from "remotion";
import type { Script, TimelineV2 } from "../../types";
import { FONT_ZH, FPS, LAYOUT_UI as L, THEME_UI as T, accentUI } from "../../theme";
import { EASE, tween } from "../anim";
import { mix } from "./engine";
import { buildModel2, typedCount, type CmpSide, type Mark, type Model2 } from "./engine2";
import { Avatar, Caret, Cursor, Ripple, SendIcon, Window, px, rise, slam } from "./parts";
import { CaptionUI, HeaderUI, SourceUI } from "./Tracks";

/** 第 2 版版面：主視覺 330–1330（比第 1 版多 80px），字幕 1352–1588，出處 1612 起；安全區上下 220、左右 64 */
export const G = { TOP: L.MAIN_TOP, BOTTOM: 1330, CAP_TOP: 1352, SRC_TOP: 1612, MIN_PX: 28 };
export const zh = (size: number, weight: number = T.weight.body, color: string = T.text): React.CSSProperties => ({ fontFamily: FONT_ZH, fontWeight: weight, fontSize: size, color, whiteSpace: "nowrap" });
export const Backdrop: React.FC = () => <AbsoluteFill style={{ background: T.bg, backgroundImage: `radial-gradient(${T.dot} 2px, transparent 2.5px)`, backgroundSize: "48px 48px", backgroundPosition: "16px 10px" }} />;
/** 估字寬（em）：全形 1、英數 0.6、空白 0.3 */
export const emW = (s: string) => [...s].reduce((w, ch) => w + (/\s/.test(ch) ? 0.3 : /[\x21-\x7e]/.test(ch) ? 0.6 : 1), 0);

// ── 手繪記號：紅筆圈、打勾、底線（描線進場 motion.in＋2 幀） ──
export const draw = (f: number, at: number) => tween(f, at, T.motion.in + 2, EASE.move);
const stroke = (p: number, color: string, w: number) => ({ fill: "none", stroke: color, strokeWidth: w, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, pathLength: 1, strokeDasharray: "1", strokeDashoffset: 1 - p, opacity: p > 0 ? 1 : 0 });
export const HandCircle: React.FC<{ w: number; h: number; p: number; color: string }> = ({ w, h, p, color }) => {
  const W = w + 44, H = h + 20, x = (k: number) => (k * W).toFixed(1), y = (k: number) => (k * H).toFixed(1);
  return (
    <svg width={W} height={H} style={{ position: "absolute", left: -22, top: -10, overflow: "visible" }}>
      <path d={`M${x(0.62)} ${y(0.07)} C${x(0.3)} ${y(-0.02)} ${x(0.02)} ${y(0.16)} ${x(0.03)} ${y(0.52)} C${x(0.04)} ${y(0.9)} ${x(0.32)} ${y(0.99)} ${x(0.56)} ${y(0.96)} C${x(0.84)} ${y(0.93)} ${x(0.99)} ${y(0.74)} ${x(0.97)} ${y(0.44)} C${x(0.95)} ${y(0.14)} ${x(0.7)} ${y(0.03)} ${x(0.4)} ${y(0.1)}`} {...stroke(p, color, 7)} />
    </svg>
  );
};
export const HandUnderline: React.FC<{ w: number; p: number; color: string }> = ({ w, p, color }) => (
  <svg width={w + 12} height={20} style={{ position: "absolute", left: -6, bottom: -14, overflow: "visible" }}>
    <path d={`M3 12 Q${(w * 0.25).toFixed(1)} 3 ${(w * 0.5).toFixed(1)} 10 T${(w + 8).toFixed(1)} 8`} {...stroke(p, color, 7)} />
  </svg>
);
export const HandCheck: React.FC<{ size: number; p: number; color: string; style?: React.CSSProperties }> = ({ size, p, color, style }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" style={{ overflow: "visible", ...style }}><path d="M7 26 L19 39 L43 9" {...stroke(p, color, 6.5)} /></svg>
);

/** 一段文字：**粗體**、只顯示前 n 個字（其餘佔位不顯示，版面不跳）、指定字串上畫圈或底線 */
export const Rich: React.FC<{ text: string; n?: number; size: number; mark?: { kind: Mark["kind"]; target?: string }; markP?: number; markColor?: string; boldColor?: string }> = ({ text, n = Infinity, size, mark, markP = 1, markColor = T.text, boldColor }) => {
  const parts = text.split("**"), chars: { ch: string; b: boolean }[] = [];
  parts.forEach((seg, k) => [...seg].forEach((ch) => chars.push({ ch, b: k % 2 === 1 })));
  const plain = chars.map((c) => c.ch).join("");
  const tgt = mark?.target && mark.kind !== "check" ? mark.target : undefined;
  const a = tgt ? [...plain.slice(0, Math.max(0, plain.indexOf(tgt)))].length : -1, b = tgt && plain.includes(tgt) ? a + [...tgt].length : -1;
  const range = (lo: number, hi: number) => {
    const out: React.ReactNode[] = [];
    for (let i = lo; i < hi;) {
      let j = i;
      while (j < hi && chars[j].b === chars[i].b && (j < n) === (i < n)) j++;
      out.push(<span key={i} style={{ fontWeight: chars[i].b ? T.weight.zh : undefined, color: chars[i].b ? boldColor : undefined, opacity: i < n ? 1 : 0 }}>{chars.slice(i, j).map((c) => c.ch).join("")}</span>);
      i = j;
    }
    return out;
  };
  if (b < 0) return <>{range(0, chars.length)}</>;
  const w = emW(tgt as string) * size;
  return (
    <>
      {range(0, a)}
      <span style={{ position: "relative", display: "inline-block", whiteSpace: "nowrap" }}>
        {range(a, b)}
        {mark?.kind === "circle" ? <HandCircle w={w} h={size * 1.2} p={markP} color={markColor} /> : <HandUnderline w={w} p={markP} color={markColor} />}
      </span>
      {range(b, chars.length)}
    </>
  );
};
/** 工具名稱與測試日期的小標籤（視窗標題列右邊） */
const ToolTag: React.FC<{ m: Model2; f: number }> = ({ m, f }) => {
  if (!m.toolTag || f < m.toolTag.at) return null;
  const s = slam(f, m.toolTag.at, 1.25), b = accentUI("blue");
  return <div style={{ ...zh(G.MIN_PX, T.weight.body, b.text), background: b.soft, border: `2px solid ${b.fill}`, borderRadius: T.radius.pill, padding: "4px 20px", opacity: s.opacity, transform: `scale(${s.scale.toFixed(3)})`, transformOrigin: "100% 50%" }}>{m.toolTag.text}</div>;
};
export const By: React.FC<{ text?: string }> = ({ text }) => (text ? <div style={zh(G.MIN_PX, T.weight.body, T.text2)}>{text}</div> : null);
export const Dots: React.FC<{ f: number; size?: number }> = ({ f, size = 14 }) => <>{[0, 1, 2].map((i) => <div key={i} style={{ width: size, height: size, borderRadius: T.radius.pill, background: T.text2, opacity: Math.floor(f / 4) % 3 === i ? 1 : 0.35 }} />)}</>;

// ── 第一段：大字鉤子＋聊天視窗（隨便問 → 真的回答，紅筆圈） ──
const CHAT = { x: L.X, w: L.INNER_W, top0: 846, bar: 72 };
const INPUT = { x: 24, h: 112, bottom: 24 };
const SEND = { cx: CHAT.x + CHAT.w - INPUT.x - 14 - 42, cy: G.BOTTOM - INPUT.bottom - INPUT.h / 2, r: 42 };

const ChatStage: React.FC<{ m: Model2; f: number }> = ({ m, f }) => {
  const d = m.draft, v = accentUI("violet"), coral = accentUI("coral"), green = accentUI("green");
  const out = m.editor ? tween(f, m.editor.at, T.motion.out + 2, EASE.exit) : 0;
  if (out >= 1) return null;
  const sent = f >= m.send;
  const chars = d ? [...d.text] : [];
  const typed = d ? typedCount(d.text, d.pauses, d.t0, d.t1, f) : 0;
  const typing = d ? f >= d.t0 && typed < chars.length : false;
  const press = tween(f, m.send - 3, 3, EASE.enter) - tween(f, m.send, 5, EASE.move);
  const go = tween(f, m.send - T.motion.cursor - 4, T.motion.cursor, EASE.move), away = tween(f, m.send + 6, T.motion.cursor + 6, EASE.move);
  const cx = mix(mix(800, SEND.cx - 6, go), 860, away), cy = mix(mix(1120, SEND.cy - 4, go), 1150, away);
  const curO = tween(f, m.send - T.motion.cursor - 10, 6, EASE.enter) * (1 - tween(f, m.send + 14, 8, EASE.exit));
  // 送出後：大字退場，視窗往上長到整個主視覺區
  const grow = tween(f, m.send, T.motion.camera, EASE.move), top = px(mix(m.hook ? CHAT.top0 : G.TOP, G.TOP, grow)), h = G.BOTTOM - top;
  const hookOut = tween(f, m.send - 2, T.motion.out, EASE.exit);
  const r = m.reply, lines = (m.hook?.title ?? "").split("\n");
  const CPF = 2.5;   // 回覆每幀出幾個字
  const starts = r ? r.lines.reduce<number[]>((acc, t, i) => [...acc, i === 0 ? r.at + 2 : acc[i - 1] + Math.ceil([...r.lines[i - 1].replace(/\*\*/g, "")].length / CPF) + 3], []) : [];
  const stampS = r?.stamp ? slam(f, r.stamp.at, 1.7) : null;
  return (
    <AbsoluteFill style={{ opacity: 1 - out, transform: `translateY(${px(-40 * out)}px)` }}>
      {m.hook && hookOut < 1 ? (
        <div style={{ position: "absolute", left: L.X + 4, top: G.TOP + 6, opacity: 1 - hookOut, transform: `translateY(${px(-30 * hookOut)}px)` }}>
          {m.hook.kicker ? <div style={{ display: "inline-block", ...zh(34, T.weight.body, T.onAccent), background: v.fill, borderRadius: T.radius.pill, padding: "8px 28px", letterSpacing: "0.08em" }}>{m.hook.kicker}</div> : null}
          {lines.map((t, i) => <div key={i} style={{ ...zh(176, T.weight.zh, i === lines.length - 1 ? v.text : T.text), lineHeight: 1.16, letterSpacing: "0.01em", marginTop: i === 0 ? 10 : 0 }}>{t}</div>)}
        </div>
      ) : null}
      <Window x={CHAT.x} y={top} w={CHAT.w} h={h} bar={CHAT.bar} title="新對話" right={<ToolTag m={m} f={f} />}>
        {d?.empty && f < m.send ? (
          <div style={{ position: "absolute", left: 0, right: 0, top: CHAT.bar + 30, display: "flex", flexDirection: "column", alignItems: "center", gap: 22, opacity: 1 - tween(f, m.send - 7, 6, EASE.exit) }}>
            <div style={{ display: "flex", alignItems: "center", gap: 18 }}><Avatar size={64} /><div style={zh(44, T.weight.body, T.text2)}>{d.empty.title}</div></div>
            <div style={{ display: "flex", gap: 18 }}>
              {(d.empty.chips ?? []).map((t, i) => <div key={i} style={{ ...zh(34, T.weight.light, T.text2), height: 72, padding: "0 30px", display: "flex", alignItems: "center", border: `2px solid ${T.line}`, borderRadius: T.radius.pill, background: T.field }}>{t}</div>)}
            </div>
          </div>
        ) : null}
        {sent && d ? <div style={{ position: "absolute", right: 28, top: CHAT.bar + 24, height: 84, padding: "0 32px", display: "flex", alignItems: "center", background: v.fill, borderRadius: 30, borderBottomRightRadius: 8, ...zh(42, T.weight.body, T.onAccent), ...rise(f, m.send, 28) }}>{d.text}</div> : null}
        {sent && f >= Math.min(m.typing, r?.at ?? Infinity) ? (
          <div style={{ position: "absolute", left: 28, top: CHAT.bar + 132, display: "flex", gap: 16, alignItems: "flex-start", ...rise(f, Math.min(m.typing, r?.at ?? Infinity), 16) }}>
            <Avatar size={64} />
            {!r || f < r.at ? (
              <div style={{ height: 64, padding: "0 28px", display: "flex", alignItems: "center", gap: 12, background: T.panel2, borderRadius: 26 }}><Dots f={f - m.send} /></div>
            ) : (
              <div style={{ width: 812, display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
                <div style={{ width: 812, padding: "20px 30px 24px", background: T.panel2, border: `2px solid ${T.lineSoft}`, borderRadius: 26, borderTopLeftRadius: 8, ...rise(f, r.at, 12) }}>
                  <By text={r.by} />
                  {r.lines.map((t, i) => {
                    const n = Math.max(0, Math.floor((f - starts[i]) * CPF)), first = i === 0;
                    return (
                      <React.Fragment key={i}>
                        {i > 0 ? <div style={{ ...zh(G.MIN_PX, T.weight.body, T.text3), letterSpacing: "0.3em", lineHeight: 1, margin: "10px 0 6px", opacity: f >= starts[i] ? 1 : 0 }}>⋯</div> : null}
                        <div style={{ ...zh(first ? 46 : 38, first ? T.weight.body : T.weight.light, first ? T.text : T.text2), lineHeight: first ? 1.45 : 1.5, whiteSpace: "normal", marginTop: first ? 10 : 0 }}>
                          <Rich text={t} n={n} size={first ? 46 : 38} mark={first ? r.mark : undefined} markP={r.mark ? draw(f, r.mark.at) : 0} markColor={coral.fill} />
                        </div>
                      </React.Fragment>
                    );
                  })}
                </div>
                {r.stamp && stampS && f >= r.stamp.at ? <div style={{ marginTop: 10, marginRight: 10, opacity: stampS.opacity, transform: `rotate(-4deg) scale(${stampS.scale.toFixed(3)})`, ...zh(50, T.weight.zh, coral.text), background: coral.soft, border: `5px solid ${coral.fill}`, borderRadius: T.radius.chip, padding: "4px 28px", letterSpacing: "0.04em" }}>{r.stamp.text}</div> : null}
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
        {m.fact && f >= m.fact.at ? (
          <div style={{ position: "absolute", left: 24, right: 24, bottom: 24, height: 184, background: green.soft, border: `4px solid ${green.fill}`, borderRadius: T.radius.card, boxShadow: T.shadow, display: "flex", flexDirection: "column", justifyContent: "center", paddingLeft: 40, ...rise(f, m.fact.at, 40) }}>
            <div style={{ ...zh(72, T.weight.zh, T.text), lineHeight: 1.2 }}>{m.fact.text}</div>
            {m.fact.sub ? <div style={{ ...zh(38, T.weight.body, green.text), marginTop: 6 }}>{m.fact.sub}</div> : null}
          </div>
        ) : null}
      </Window>
      <Ripple f={f} at={m.send} x={SEND.cx} y={SEND.cy} color={v.fill} />
      {curO > 0 ? <Cursor x={cx} y={cy} press={press} opacity={curO} /> : null}
    </AbsoluteFill>
  );
};

// ── 第二段：「這樣問」編輯器（四塊逐塊亮）→ 送出 → 真的回答（打勾、底線） ──
const ED = { x: L.X, y: G.TOP, w: L.INNER_W, h: G.BOTTOM - G.TOP, bar: 84 };
const ROW = { top: 112, h: 160, step: 180, chipW: 220, chipH: 96, fieldX: 260 };
const CHIP = { y: ED.y + ED.bar + 24, w: 208, h: 76, gap: 16 };
const RES = { top: ED.bar + 24 + 76 + 24, pad: 24 };
const RUN_BTN = { w: 228, h: 88, right: 28, bottom: 28 };

const EditorStage: React.FC<{ m: Model2; f: number }> = ({ m, f }) => {
  const ed = m.editor;
  if (!ed || f < ed.at) return null;
  const out = m.compare ? tween(f, m.compare.at, T.motion.out + 2, EASE.exit) : 0;
  if (out >= 1) return null;
  const slots = m.slots, res = m.result, runAt = m.run;
  const inP = tween(f, ed.at + T.motion.out, T.motion.in + 2, EASE.enter);   // 等聊天視窗退完再進來
  const morph = tween(f, runAt + 2, 12, EASE.move), fieldsOut = tween(f, runAt + 1, 7, EASE.exit);
  const filled = slots.filter((s) => f >= s.at).length, full = slots.length > 0 && filled >= slots.length;
  const active = slots.reduce((k, s, i) => (f >= s.at ? i : k), -1);
  const violet = accentUI("violet"), green = accentUI("green");
  const chipX0 = (L.W - (slots.length * CHIP.w + (slots.length - 1) * CHIP.gap)) / 2;
  const slotIn = (i: number) => ed.slotsAt + i * 4;
  const btn = { cx: ED.x + ED.w - RUN_BTN.right - RUN_BTN.w / 2, cy: ED.y + ED.h - RUN_BTN.bottom - RUN_BTN.h / 2 };
  const press = tween(f, runAt - 3, 3, EASE.enter) - tween(f, runAt, 5, EASE.move);
  const resAt = res?.at ?? Infinity, cardAt = Math.min(resAt - 2, runAt + 10);
  return (
    <AbsoluteFill style={{ opacity: inP * (1 - out), transform: `translateY(${px(48 * (1 - inP) - 40 * out)}px)` }}>
      <Window x={ED.x} y={ED.y} w={ED.w} h={ED.h} bar={ED.bar} title={ed.title} right={<ToolTag m={m} f={f} />}>
        {fieldsOut < 1 ? slots.map((s, i) => {
          if (f < slotIn(i)) return null;
          const a = accentUI(s.color), on = f >= s.at, focus = on && active === i;
          const chars = [...s.text], n = Math.max(0, Math.min(chars.length, Math.floor((f - s.at - 1) * 1.5) + 1));
          return (
            <div key={i} style={{ position: "absolute", left: ROW.fieldX, right: 24, top: ROW.top + i * ROW.step, height: ROW.h, boxSizing: "border-box", background: T.field, border: `3px solid ${focus ? a.fill : on ? a.soft : T.line}`, borderRadius: T.radius.card, padding: "0 28px", display: "flex", alignItems: "center", opacity: (1 - fieldsOut) * tween(f, slotIn(i), T.motion.in, EASE.enter) }}>
              {on ? <div style={{ ...zh(40, T.weight.body), lineHeight: 1.35, whiteSpace: "normal" }}>{chars.slice(0, n).join("")}{n < chars.length ? <Caret f={f} h={42} color={a.fill} solid /> : null}<span style={{ opacity: 0 }}>{chars.slice(n).join("")}</span></div>
                : <div style={{ height: 16, width: 320 - i * 40, borderRadius: 8, background: T.line }} />}
            </div>
          );
        }) : null}
        {fieldsOut < 1 ? (
          <>
            <div style={{ position: "absolute", left: 28, bottom: RUN_BTN.bottom + 12, ...zh(34, T.weight.body, full ? green.text : T.text2), opacity: 1 - fieldsOut }}>{filled}／{slots.length || 4} 塊</div>
            <div style={{ position: "absolute", right: RUN_BTN.right, bottom: RUN_BTN.bottom, width: RUN_BTN.w, height: RUN_BTN.h, borderRadius: T.radius.pill, background: full ? violet.fill : T.line, display: "flex", alignItems: "center", justifyContent: "center", gap: 10, opacity: 1 - fieldsOut, transform: `scale(${(1 - 0.08 * press).toFixed(3)})`, ...zh(38, T.weight.zh, full ? T.onAccent : T.text3) }}>
              送出<SendIcon size={40} color={full ? T.onAccent : T.text3} />
            </div>
          </>
        ) : null}
        {/* 真的回答（節錄） */}
        {res && f >= cardAt ? (
          <div style={{ position: "absolute", left: RES.pad, right: RES.pad, top: RES.top, bottom: RES.pad, boxSizing: "border-box", background: T.panel2, border: `2px solid ${T.line}`, borderRadius: T.radius.card, padding: "24px 28px", ...rise(f, cardAt, 30) }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 14 }}><Avatar size={56} /><By text={res.by} />{f < resAt + 2 ? <div style={{ display: "flex", gap: 10, marginLeft: 8 }}><Dots f={f - cardAt} /></div> : null}</div>
            {res.lines.map((l, i) => {
              const start = resAt + 2 + i * 5;
              const a = accentUI(l.color), mk = l.mark, mp = mk ? draw(f, Math.max(mk.at, start + 6)) : 0;
              const lit = mk?.kind === "check" && mp > 0;
              return (
                <div key={i} style={{ position: "relative", marginTop: l.head ? (i ? 16 : 0) : 4, padding: l.head ? 0 : "6px 100px 6px 18px", marginLeft: l.head ? 0 : -6, borderRadius: T.radius.chip, background: lit ? green.soft : "transparent", ...rise(f, start, 14) }}>
                  {l.head ? <div style={{ ...zh(40, T.weight.zh, a.text), lineHeight: 1.4 }}>{l.t}</div>
                    : <div style={{ ...zh(46, T.weight.body), lineHeight: 1.4, whiteSpace: "normal" }}><Rich text={l.t} size={46} mark={mk} markP={mp} markColor={accentUI("amber").fill} /></div>}
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
            background: on ? a.fill : "transparent", border: on ? `3px solid ${a.fill}` : `3px dashed ${T.text3}`, ...zh(px(mix(46, 40, morph)), T.weight.zh, on ? T.onAccent : T.text2), letterSpacing: "0.04em" }}>{on ? s.label : i + 1}</div>
        );
      })}
      <Ripple f={f} at={runAt} x={btn.cx} y={btn.cy} color={violet.fill} />
    </AbsoluteFill>
  );
};

// ── 第三段：上下並排對照（兩個回答同時停在畫面上） ──
const CMP = { h: 452, gap: 96 };
export const CompareCard: React.FC<{ s: CmpSide; by?: string; color: string; y: number }> = ({ s, by, color, y }) => {
  const a = accentUI(color);
  return (
    <div style={{ position: "absolute", left: L.X, top: y, width: L.INNER_W, height: CMP.h, boxSizing: "border-box", background: T.panel, border: `2px solid ${T.line}`, borderTop: `8px solid ${a.fill}`, borderRadius: T.radius.card, boxShadow: T.shadow, padding: "22px 30px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ ...zh(44, T.weight.zh, T.onAccent), background: a.fill, borderRadius: T.radius.chip, padding: "4px 24px", letterSpacing: "0.04em" }}>{s.label}</div>
        <By text={by} />
      </div>
      <div style={{ marginTop: 18, height: 76, boxSizing: "border-box", display: "flex", alignItems: "center", padding: "0 30px", background: T.field, border: `2px solid ${T.line}`, borderRadius: T.radius.pill, ...zh(s.promptPx ?? 36, T.weight.light, T.text2) }}>{s.prompt}</div>
      <div style={{ display: "flex", gap: 16, marginTop: 20, alignItems: "flex-start" }}>
        <Avatar size={60} />
        <div style={{ flex: 1, position: "relative", paddingRight: s.mark?.kind === "check" ? 92 : 0 }}>
          <div style={{ ...zh(44, T.weight.body), lineHeight: 1.42, whiteSpace: "normal" }}><Rich text={s.answer} size={44} mark={s.mark} markColor={a.fill} /></div>
          {s.mark?.kind === "check" ? <HandCheck size={80} p={1} color={a.fill} style={{ position: "absolute", right: 0, top: 22 }} /> : null}
        </div>
      </div>
      <div style={{ position: "absolute", right: 30, bottom: 22, ...zh(36, T.weight.zh, a.text), background: a.soft, border: `3px solid ${a.fill}`, borderRadius: T.radius.chip, padding: "2px 22px" }}>{s.tag}</div>
    </div>
  );
};
const CompareStage: React.FC<{ m: Model2; f: number }> = ({ m, f }) => {
  const c = m.compare;
  if (!c || f < c.at) return null;
  const out = tween(f, c.out, T.motion.out + 2, EASE.exit);
  if (out >= 1) return null;
  const inP = tween(f, c.at + T.motion.out, T.motion.in, EASE.enter), y2 = G.BOTTOM - CMP.h;
  const b = c.badge ? slam(f, c.badge.at, 1.3) : null;
  return (
    <AbsoluteFill style={{ opacity: inP * (1 - out), transform: `translateY(${px(40 * (1 - inP) - 40 * out)}px)` }}>
      <CompareCard s={c.top} by={c.by} color="coral" y={G.TOP} />
      <CompareCard s={c.bottom} by={c.by} color="green" y={y2} />
      {c.badge ? (
        <div style={{ position: "absolute", left: 0, right: 0, top: G.TOP + CMP.h, height: y2 - G.TOP - CMP.h, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14, height: 72, padding: "0 34px", borderRadius: T.radius.pill, background: f >= c.badge.at ? T.text : T.panel2, border: `2px solid ${T.line}`, ...zh(40, T.weight.zh, f >= c.badge.at ? T.onAccent : T.text2), transform: `scale(${(f >= c.badge.at && b ? b.scale : 1).toFixed(3)})` }}><Avatar size={44} />{c.badge.text}</div>
        </div>
      ) : null}
    </AbsoluteFill>
  );
};

// ── 第四段：可以截圖的範本卡＋提問 ──
const TPL = { h: 836, askH: 120 };
export const tplLine = (t: string) => {
  const v = accentUI("violet"), am = accentUI("amber"), bl = accentUI("blue"), gr = accentUI("green");
  const num = /^(\d\.)\s*(.*)$/.exec(t);
  if (num) return <><span style={{ color: gr.text, fontWeight: T.weight.zh, marginRight: 14 }}>{num[1]}</span>{num[2]}</>;
  return t.split(/(「[^」]+」|＿+|【[^】]+】|只根據這段文字)/).map((s, i) => <span key={i} style={{ color: /^「/.test(s) ? am.text : /^＿/.test(s) ? T.text3 : /^【/.test(s) ? bl.text : s === "只根據這段文字" ? v.text : undefined, fontWeight: /^[「【只]/.test(s) ? T.weight.zh : undefined }}>{s}</span>);
};
const TemplateStage: React.FC<{ m: Model2; f: number }> = ({ m, f }) => {
  const t = m.template;
  if (!t || f < t.at) return null;
  const v = accentUI("violet");
  const tIn = t.at + T.motion.out;   // 等上下對照退完再進來
  const pulse = f >= t.pulseAt ? slam(f, t.pulseAt, 1.035).scale : 1;
  const ask = m.ask && f >= m.ask.at ? slam(f, m.ask.at, 1.15) : null;
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: L.X, top: G.TOP, width: L.INNER_W, height: TPL.h, boxSizing: "border-box", background: T.panel, border: `3px solid ${v.fill}`, borderRadius: T.radius.window, boxShadow: T.shadow, padding: "30px 44px", ...rise(f, tIn, 40), transform: `translateY(${px(40 * (1 - tween(f, tIn, T.motion.in, EASE.enter)))}px) scale(${pulse.toFixed(4)})` }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingBottom: 20, borderBottom: `2px dashed ${T.line}` }}>
          <div style={zh(56, T.weight.zh)}>{t.title}</div>
          {t.hint ? <div style={{ ...zh(30, T.weight.body, v.text), background: v.soft, borderRadius: T.radius.pill, padding: "6px 22px" }}>{t.hint}</div> : null}
        </div>
        <div style={{ marginTop: 16 }}>
          {t.lines.map((l, i) => <div key={i} style={{ ...zh(44, T.weight.body), lineHeight: "72px", paddingLeft: /^\d\./.test(l) ? 30 : 0 }}>{tplLine(l)}</div>)}
        </div>
      </div>
      {/* 提問列：先是一個空的留言框，念到才填滿 */}
      {m.ask && !ask ? <div style={{ position: "absolute", left: L.X, top: G.BOTTOM - TPL.askH, width: L.INNER_W, height: TPL.askH, boxSizing: "border-box", background: T.field, border: `3px solid ${T.line}`, borderRadius: T.radius.card, display: "flex", alignItems: "center", paddingLeft: 36, opacity: tween(f, tIn, T.motion.in, EASE.enter) }}><Caret f={f} h={56} color={v.fill} /></div> : null}
      {m.ask && ask ? (
        <div style={{ position: "absolute", left: L.X, top: G.BOTTOM - TPL.askH, width: L.INNER_W, height: TPL.askH, boxSizing: "border-box", background: v.fill, borderRadius: T.radius.card, display: "flex", alignItems: "center", justifyContent: "center", ...zh(56, T.weight.zh, T.onAccent), letterSpacing: "0.02em", opacity: ask.opacity, transform: `scale(${ask.scale.toFixed(3)})` }}>{m.ask.text}</div>
      ) : null}
    </AbsoluteFill>
  );
};

export const VideoUI2: React.FC<Script & { timeline: TimelineV2 }> = ({ scenes, timeline, channel }) => {
  const f = useCurrentFrame();
  const m = useMemo(() => buildModel2(scenes, timeline), [scenes, timeline]);
  const by = Object.fromEntries(timeline.scenes.map((x) => [x.id, x]));
  const ordered = scenes.filter((s) => by[s.id]);
  const subCues = ordered.filter((s) => by[s.id].subtitleWindow).map((s) => ({ id: s.id, en: s.subtitle.en, keywords: s.keywords, window: by[s.id].subtitleWindow as [number, number], phrases: by[s.id].lines, keywords_at: by[s.id].keywords }));
  const srcCues = ordered.map((s) => ({ sources: s.sources, window: by[s.id].sourceWindow, plain: Boolean(s.props?.sourcePlain) }));
  return (
    <AbsoluteFill>
      <Backdrop />
      <ChatStage m={m} f={f} />
      <EditorStage m={m} f={f} />
      <CompareStage m={m} f={f} />
      <TemplateStage m={m} f={f} />
      <CaptionUI cues={subCues} top={G.CAP_TOP} />
      <SourceUI cues={srcCues} top={G.SRC_TOP} />
      <HeaderUI name={channel?.name ?? "AI"} tag={channel?.tag ?? "AI 動手做"} total={timeline.totalFrames} tagPx={G.MIN_PX} />
      {timeline.voice ? <Audio src={staticFile(timeline.voice.file)} /> : timeline.scenes.filter((t) => t.audio).map((t) => (
        <Sequence key={`${t.id}-audio`} from={t.audioFrame} durationInFrames={Math.ceil(t.audioSec * FPS) + 1} name={`${t.id}-audio`} layout="none"><Audio src={staticFile(t.audio as string)} /></Sequence>
      ))}
    </AbsoluteFill>
  );
};

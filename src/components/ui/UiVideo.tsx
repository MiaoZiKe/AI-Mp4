// 仿介面動畫（styleVersion 3 ＋ stage: "ui"）：自製的聊天視窗、輸入框、游標、欄位與流程節點，全片一個連續的畫面。
// 時間全部來自 timeline（engine.ts 把 script.json 的 at 換成絕對幀）；顏色與版面讀 THEME_UI／LAYOUT_UI。純 HTML/CSS＋SVG，沒有 3D。
import React, { useMemo } from "react";
import { AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame } from "remotion";
import type { Script, TimelineV2 } from "../../types";
import { FONT_EN, FONT_ZH, FPS, LAYOUT_UI as L, THEME_UI as T, accentUI } from "../../theme";
import { EASE, tween } from "../anim";
import { bez, buildModel, mix, type UiModel } from "./engine";
import { Avatar, Caret, CheckIcon, Cursor, DocIcon, Ripple, SendIcon, Window, px, rise, slam, typedN } from "./parts";
import { CaptionUI, HeaderUI, SourceUI } from "./Tracks";
import { VideoUI2 } from "./UiVideo2";
import { VideoUI3 } from "./UiVideo3";

const zh = (size: number, weight: number = T.weight.body, color: string = T.text): React.CSSProperties => ({ fontFamily: FONT_ZH, fontWeight: weight, fontSize: size, color, whiteSpace: "nowrap" });
/** 背景：深色＋圓點格（每格 48px） */
const Backdrop: React.FC = () => <AbsoluteFill style={{ background: T.bg, backgroundImage: `radial-gradient(${T.dot} 2px, transparent 2.5px)`, backgroundSize: "48px 48px", backgroundPosition: "16px 10px" }} />;

// ── 第一段：聊天視窗（只打一句話 → 很普通的回覆） ──
const CHAT = { x: L.X, y: 584, w: L.INNER_W, h: 666, bar: 72 };
const INPUT = { x: 24, h: 112, bottom: 24 };
const SEND = { cx: CHAT.x + CHAT.w - INPUT.x - 14 - 42, cy: CHAT.y + CHAT.h - INPUT.bottom - INPUT.h / 2, r: 42 };

const ChatStage: React.FC<{ m: UiModel; f: number }> = ({ m, f }) => {
  const d = m.draft, v = accentUI("violet"), coral = accentUI("coral");
  const out = m.editor ? tween(f, m.editor.at, T.motion.out + 2, EASE.exit) : 0;
  if (out >= 1) return null;
  const sent = f >= m.send;
  const n = d ? [...d.text].length : 0;
  const typed = d ? Math.max(0, Math.min(n, Math.ceil(n * tween(f, d.t0, d.t1 - d.t0, (t) => t)))) : 0;
  const typing = d ? f >= d.t0 && f < d.t1 : false;
  // 鏡頭：打字時往輸入框推近一點，送出後退回（像錄影軟體的自動放大）
  const zoom = d ? 1 + 0.05 * (tween(f, d.t0, T.motion.camera, EASE.move) - tween(f, m.send + 2, T.motion.camera, EASE.move)) : 1;
  const press = tween(f, m.send - 3, 3, EASE.enter) - tween(f, m.send, 5, EASE.move);
  // 游標：從視窗中間移到送出鍵，點一下，再移開
  const go = tween(f, m.send - T.motion.cursor - 4, T.motion.cursor, EASE.move), away = tween(f, m.send + 6, T.motion.cursor + 6, EASE.move);
  const cx = mix(mix(900, SEND.cx - 6, go), 860, away), cy = mix(mix(1034, SEND.cy - 4, go), 1040, away);
  const r = m.reply;
  const stampS = r?.stamp ? slam(f, r.stamp.at, 1.7) : null;
  return (
    <AbsoluteFill style={{ opacity: 1 - out, transform: `translateY(${px(-40 * out)}px)` }}>
      {m.hook ? (
        <div style={{ position: "absolute", left: L.X + 8, top: 340 }}>
          {m.hook.kicker ? <div style={{ display: "inline-block", ...zh(30, T.weight.body, v.text), background: v.soft, borderRadius: T.radius.pill, padding: "10px 26px", letterSpacing: "0.08em" }}>{m.hook.kicker}</div> : null}
          <div style={{ ...zh(128, T.weight.zh), lineHeight: 1.2, marginTop: 14, letterSpacing: "0.02em" }}>
            {m.hook.title}
            <div style={{ height: 12, width: `${(100 * tween(f, d ? d.t1 - 8 : 0, 10, EASE.move)).toFixed(1)}%`, background: sent && stampS && f >= (r?.stamp?.at ?? 0) ? coral.fill : v.fill, borderRadius: 6, marginTop: 2 }} />
          </div>
        </div>
      ) : null}
      <div style={{ position: "absolute", inset: 0, transform: `scale(${zoom.toFixed(4)})`, transformOrigin: `${L.W / 2}px ${CHAT.y}px` }}>
        <Window x={CHAT.x} y={CHAT.y} w={CHAT.w} h={CHAT.h} bar={CHAT.bar} title="新對話">
          {/* 還沒送出前的空白狀態：頭像＋一句招呼＋幾個建議（灰階），送出時淡出 */}
          {d?.empty && f < m.send ? (
            <div style={{ position: "absolute", left: 0, right: 0, top: CHAT.bar + 44, display: "flex", flexDirection: "column", alignItems: "center", gap: 26, opacity: 1 - tween(f, m.send - 7, 6, EASE.exit) }}>
              <Avatar size={112} />
              <div style={zh(48, T.weight.body, T.text2)}>{d.empty.title}</div>
              <div style={{ display: "flex", gap: 18, marginTop: 6 }}>
                {(d.empty.chips ?? []).map((t, i) => <div key={i} style={{ ...zh(36, T.weight.light, T.text2), height: 76, padding: "0 30px", display: "flex", alignItems: "center", border: `2px solid ${T.line}`, borderRadius: T.radius.pill, background: T.field }}>{t}</div>)}
              </div>
            </div>
          ) : null}
          {/* 使用者訊息 */}
          {sent && d ? (
            <div style={{ position: "absolute", right: 28, top: CHAT.bar + 24, height: 88, padding: "0 34px", display: "flex", alignItems: "center", background: v.fill, borderRadius: 30, borderBottomRightRadius: 8, ...zh(44, T.weight.body, T.onAccent), ...rise(f, m.send, 28) }}>{d.text}</div>
          ) : null}
          {/* AI：先輸入中的三個點，再出現回覆 */}
          {sent && r ? (
            <div style={{ position: "absolute", left: 28, top: CHAT.bar + 140, display: "flex", gap: 16, alignItems: "flex-start", ...rise(f, m.send + 5, 16) }}>
              <Avatar size={68} />
              {f < r.at ? (
                <div style={{ height: 68, padding: "0 28px", display: "flex", alignItems: "center", gap: 12, background: T.panel2, borderRadius: 26 }}>
                  {[0, 1, 2].map((i) => <div key={i} style={{ width: 14, height: 14, borderRadius: T.radius.pill, background: T.text2, opacity: Math.floor((f - m.send) / 4) % 3 === i ? 1 : 0.35 }} />)}
                </div>
              ) : (
                <div style={{ width: 760, padding: "22px 30px", background: T.panel2, border: `2px solid ${T.lineSoft}`, borderRadius: 26, borderTopLeftRadius: 8, ...rise(f, r.at, 12) }}>
                  {r.lines.map((t, i) => <div key={i} style={{ ...zh(38, T.weight.light, T.text2), lineHeight: 1.5, whiteSpace: "normal" }}>{[...t].slice(0, typedN(f, r.at + 2 + i * 6, [...t].length, 1)).join("")}</div>)}
                </div>
              )}
            </div>
          ) : null}
          {r?.stamp && stampS && f >= r.stamp.at ? (
            <div style={{ position: "absolute", right: 36, top: CHAT.bar + 326, opacity: stampS.opacity, transform: `rotate(-7deg) scale(${stampS.scale.toFixed(3)})`, ...zh(64, T.weight.zh, coral.text), background: coral.soft, border: `5px solid ${coral.fill}`, borderRadius: T.radius.chip, padding: "6px 30px", letterSpacing: "0.06em" }}>{r.stamp.text}</div>
          ) : null}
          {/* 輸入框 */}
          <div style={{ position: "absolute", left: INPUT.x, right: INPUT.x, bottom: INPUT.bottom, height: INPUT.h, background: T.field, border: `3px solid ${typing || (typed > 0 && !sent) ? v.fill : T.line}`, borderRadius: T.radius.pill, display: "flex", alignItems: "center", paddingLeft: 44 }}>
            {d && !sent && typed > 0 ? <span style={zh(48)}>{[...d.text].slice(0, typed).join("")}</span> : <span style={zh(44, T.weight.light, T.text3)}>{d?.placeholder}</span>}
            {!sent ? <Caret f={f} h={56} color={v.fill} solid={typing} /> : null}
            <div style={{ position: "absolute", right: 14, top: (INPUT.h - 6 - 2 * SEND.r) / 2, width: 2 * SEND.r, height: 2 * SEND.r, borderRadius: T.radius.pill, background: typed > 0 && !sent ? v.fill : T.line, display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${(1 - 0.1 * press).toFixed(3)})` }}>
              <SendIcon size={46} color={typed > 0 && !sent ? T.onAccent : T.text3} />
            </div>
          </div>
        </Window>
        <Ripple f={f} at={m.send} x={SEND.cx} y={SEND.cy} color={v.fill} />
        <Cursor x={cx} y={cy} press={press} opacity={1 - tween(f, m.send + 14, 8, EASE.exit)} />
      </div>
    </AbsoluteFill>
  );
};

// ── 第二段：提示詞編輯器（四個欄位）→ 第三段：四塊流進 AI 節點 → 回覆 ──
const ED = { x: L.X, y: L.MAIN_TOP, w: L.INNER_W, h: L.MAIN_BOTTOM - L.MAIN_TOP, bar: 84 };
const ROW = { top: 216, h: 132, step: 148, chipX: 24, chipW: 188, chipH: 84, fieldX: 232 };
const CHIP = { y: 352, w: 200, h: 76, gap: 24 };
const NODE = { cx: 540, cy: 612, w: 380, h: 136, spread: 88 };
const RES = { x: L.X, y: 760, w: L.INNER_W, h: 490 };
const RUN_BTN = { w: 228, h: 84, right: 28, bottom: 26 };

const EditorStage: React.FC<{ m: UiModel; f: number }> = ({ m, f }) => {
  const ed = m.editor;
  if (!ed || f < ed.at) return null;
  const run = m.run, res = m.result, slots = m.slots;
  const runAt = run?.at ?? Infinity;
  const inP = tween(f, ed.at + 2, T.motion.in + 2, EASE.enter);
  const morph = tween(f, runAt + 3, 12, EASE.move);          // 欄位標籤飛到上方排成一列
  const frameOut = tween(f, runAt + 2, 8, EASE.exit);        // 編輯器外框與欄位內容淡出
  const filled = slots.filter((s) => f >= s.at).length;
  const active = slots.reduce((k, s, i) => (f >= s.at ? i : k), -1);
  const green = accentUI("green"), violet = accentUI("violet");
  const chipX0 = (L.W - (slots.length * CHIP.w + (slots.length - 1) * CHIP.gap)) / 2;
  const rowY = (i: number) => ED.y + ROW.top + i * ROW.step;
  const slotIn = (i: number) => ed.slotsAt + i * 6;
  // 游標：移到「送出」鍵點一下
  const btn = { cx: ED.x + ED.w - RUN_BTN.right - RUN_BTN.w / 2, cy: ED.y + ED.h - RUN_BTN.bottom - RUN_BTN.h / 2 };
  const go = tween(f, runAt - T.motion.cursor - 3, T.motion.cursor, EASE.move), press = tween(f, runAt - 3, 3, EASE.enter) - tween(f, runAt, 5, EASE.move);
  const cur = { x: mix(640, btn.cx - 8, go), y: mix(1010, btn.cy - 6, go), o: tween(f, runAt - T.motion.cursor - 8, 6, EASE.enter) * (1 - tween(f, runAt + 5, 6, EASE.exit)) };
  const paths = slots.map((_, i) => { const x = chipX0 + i * (CHIP.w + CHIP.gap) + CHIP.w / 2; const xi = NODE.cx + (i - (slots.length - 1) / 2) * NODE.spread; return [[x, CHIP.y + CHIP.h + 6], [x, CHIP.y + CHIP.h + 64], [xi, NODE.cy - NODE.h / 2 - 64], [xi, NODE.cy - NODE.h / 2 - 6]]; });
  const nodeP = run ? slam(f, run.node.at, 0.7) : null;
  const resAt = res?.at ?? Infinity;
  const cardAt = Math.min(resAt - 2, (run?.node.at ?? resAt) + 8);   // 回覆卡先出現（生成中的三個點），念到才出字
  return (
    <AbsoluteFill style={{ opacity: inP, transform: `translateY(${px(48 * (1 - inP))}px)` }}>
      {/* 編輯器視窗（外框、出處列、欄位） */}
      {frameOut < 1 ? (
        <Window x={ED.x} y={ED.y} w={ED.w} h={ED.h} bar={ED.bar} title={ed.title} style={{ opacity: 1 - frameOut }}
          right={<div style={{ ...zh(30, T.weight.zh, filled >= slots.length && slots.length ? T.onAccent : T.text2), fontFamily: FONT_EN, background: filled >= slots.length && slots.length ? green.fill : T.panel2, borderRadius: T.radius.pill, padding: "6px 22px", transform: `scale(${(f >= ed.pulseAt ? slam(f, ed.pulseAt, 1.35).scale : 1).toFixed(3)})` }}>{filled}/{slots.length || 4}</div>}>
          {ed.guide && f >= ed.guide.at - 4 ? (
            <div style={{ position: "absolute", left: 24, right: 24, top: ED.bar + 22, height: 88, display: "flex", alignItems: "center", gap: 18, padding: "0 24px", background: T.field, border: `2px solid ${T.lineSoft}`, borderRadius: T.radius.card, ...rise(f, ed.guide.at - 4, 18) }}>
              <DocIcon size={48} color={violet.text} />
              <div style={{ ...zh(36, T.weight.body), fontFamily: FONT_EN }}>{ed.guide.text}</div>
              {ed.guide.by ? <div style={{ marginLeft: "auto", ...zh(26, T.weight.light, T.text2), fontFamily: FONT_EN }}>{ed.guide.by}</div> : null}
            </div>
          ) : null}
          {slots.map((s, i) => {
            if (f < slotIn(i)) return null;
            const a = accentUI(s.color), on = f >= s.at, focus = on && active === i;
            const chars = [...s.text], n = typedN(f, s.at + 2, chars.length, 1);
            return (
              <div key={i} style={{ position: "absolute", left: 24, right: 24, top: ROW.top + i * ROW.step, height: ROW.h, ...rise(f, slotIn(i), 22) }}>
                <div style={{ position: "absolute", left: ROW.fieldX - 24, right: 0, top: 0, bottom: 0, background: T.field, border: `3px solid ${focus ? a.fill : on ? a.soft : (f >= ed.sweepAt + i * 6 && f < ed.sweepAt + i * 6 + 9) || f >= ed.pulseAt + i * 3 ? T.text3 : T.line}`, borderRadius: T.radius.card, padding: "16px 26px" }}>
                  <div style={{ ...zh(22, T.weight.body, on ? a.text : T.text3), fontFamily: FONT_EN, letterSpacing: "0.12em", textTransform: "uppercase" }}>{on ? s.en : `0${i + 1}`}</div>
                  {on ? <div style={{ ...zh(40, T.weight.body), marginTop: 8 }}>{chars.slice(0, n).join("")}{n < chars.length ? <Caret f={f} h={42} color={a.fill} solid /> : null}</div>
                    : <div style={{ marginTop: 26, height: 16, width: 300 - i * 36, borderRadius: 8, background: T.line }} />}
                </div>
              </div>
            );
          })}
          <div style={{ position: "absolute", right: RUN_BTN.right, bottom: RUN_BTN.bottom, width: RUN_BTN.w, height: RUN_BTN.h, borderRadius: T.radius.pill, background: filled >= slots.length && slots.length ? violet.fill : T.line, display: "flex", alignItems: "center", justifyContent: "center", gap: 10, transform: `scale(${(1 - 0.08 * press).toFixed(3)})`, ...zh(38, T.weight.zh, filled >= slots.length && slots.length ? T.onAccent : T.text3) }}>
            送出<SendIcon size={40} color={filled >= slots.length && slots.length ? T.onAccent : T.text3} />
          </div>
        </Window>
      ) : null}
      {/* 連線：四塊 → AI → 回覆 */}
      {run ? (
        <svg width={L.W} height={L.H} style={{ position: "absolute", left: 0, top: 0 }}>
          {paths.map((p, i) => {
            const dp = tween(f, runAt + 13 + i * 2, 10, EASE.move), a = accentUI(slots[i].color);
            const loop = ((f - runAt - 24 - i * 5) % 26) / 26, dot = f >= runAt + 24 + i * 5 ? bez(p, loop) : null;
            return (
              <g key={i}>
                <path d={`M${p[0]} C${p[1]} ${p[2]} ${p[3]}`} fill="none" stroke={a.fill} strokeWidth={6} strokeLinecap="round" pathLength={1} strokeDasharray="1" strokeDashoffset={1 - dp} opacity={dp > 0 ? 0.85 : 0} />
                {dp >= 1 ? <circle cx={p[3][0]} cy={p[3][1]} r={10} fill={a.fill} /> : null}
                {dot ? <circle cx={dot[0]} cy={dot[1]} r={10} fill={a.fill} /> : null}
              </g>
            );
          })}
          {res ? (() => { const dp = tween(f, cardAt - 8, 10, EASE.move); return <path d={`M${NODE.cx} ${NODE.cy + NODE.h / 2 + 6} V${RES.y - 4}`} stroke={T.text2} strokeWidth={5} strokeLinecap="round" pathLength={1} strokeDasharray="1" strokeDashoffset={1 - dp} opacity={dp > 0 ? 1 : 0} />; })() : null}
        </svg>
      ) : null}
      {/* 欄位標籤：在編輯器裡是每列左邊的標籤，送出後飛到上方排成一列 */}
      {slots.map((s, i) => {
        if (f < slotIn(i)) return null;
        const a = accentUI(s.color), on = f >= s.at;
        const e = tween(f, slotIn(i), T.motion.in, EASE.enter), hit = slam(f, s.at, 1.14);
        const pAt = ed.pulseAt + i * 3, pulsed = f >= pAt, pop = pulsed ? slam(f, pAt, 1.2).scale : 1;
        const x = mix(ED.x + 24, chipX0 + i * (CHIP.w + CHIP.gap), morph), y = mix(rowY(i) + (ROW.h - ROW.chipH) / 2, CHIP.y, morph) + 22 * (1 - e);
        const w = mix(ROW.chipW, CHIP.w, morph), h = mix(ROW.chipH, CHIP.h, morph);
        return (
          <div key={i} style={{ position: "absolute", left: px(x), top: px(y), width: px(w), height: px(h), opacity: e, transform: `scale(${(on ? hit.scale : pop).toFixed(3)})`, borderRadius: T.radius.chip, display: "flex", alignItems: "center", justifyContent: "center",
            background: on ? a.fill : "transparent", border: on ? `3px solid ${a.fill}` : `3px dashed ${pulsed ? T.text2 : T.text3}`, ...zh(on ? 46 : 44, T.weight.zh, on ? T.onAccent : pulsed ? T.text : T.text2), letterSpacing: "0.08em" }}>{on ? s.label : "?"}</div>
        );
      })}
      {/* AI 節點 */}
      {run && nodeP && f >= run.node.at ? (
        <>
          <div style={{ position: "absolute", left: NODE.cx - NODE.w / 2, top: NODE.cy - NODE.h / 2, width: NODE.w, height: NODE.h, borderRadius: 40, background: T.panel2, border: `4px solid ${violet.fill}`, opacity: nodeP.opacity, transform: `scale(${nodeP.scale.toFixed(3)})`, display: "flex", alignItems: "center", justifyContent: "center", ...zh(72, T.weight.zh), fontFamily: FONT_EN }}>{run.node.text}</div>
          {run.node.sub ? <div style={{ position: "absolute", left: NODE.cx + NODE.w / 2 + 20, top: NODE.cy - 36, height: 72, padding: "0 24px", display: "flex", alignItems: "center", ...zh(38, T.weight.zh, T.onAccent), background: violet.fill, borderRadius: T.radius.pill, ...rise(f, run.node.at + 3, 0), transform: `translateX(${px(-20 * (1 - tween(f, run.node.at + 3, T.motion.in, EASE.enter)))}px)` }}>{run.node.sub}</div> : null}
        </>
      ) : null}
      {/* 回覆卡 */}
      {res && f >= cardAt ? (
        <div style={{ position: "absolute", left: RES.x, top: RES.y, width: RES.w, height: RES.h, background: T.panel, border: `2px solid ${T.line}`, borderRadius: T.radius.window, boxShadow: T.shadow, ...rise(f, cardAt, 36) }}>
          {f < resAt + 2 ? <div style={{ position: "absolute", left: 34, top: 130, display: "flex", gap: 14 }}>{[0, 1, 2].map((i) => <div key={i} style={{ width: 18, height: 18, borderRadius: T.radius.pill, background: T.text2, opacity: Math.floor((f - cardAt) / 4) % 3 === i ? 1 : 0.35 }} />)}</div> : null}
          <div style={{ position: "absolute", left: 30, top: 26, display: "flex", alignItems: "center", gap: 16 }}><Avatar size={60} /><div style={zh(32, T.weight.body, T.text2)}>回覆</div>
            {res.format && f >= resAt + 2 ? (() => { const a = accentUI(slots[res.format.slot]?.color); return <div style={{ ...zh(32, T.weight.zh, T.onAccent), background: a.fill, borderRadius: T.radius.chip, padding: "6px 18px", marginLeft: 6, ...rise(f, resAt + 2, 0) }}>{slots[res.format.slot]?.label}｜{res.format.text}</div>; })() : null}</div>
          {res.badge && f >= res.badge.at ? (() => { const b = slam(f, res.badge.at, 1.35); return (
            <div style={{ position: "absolute", right: 26, top: 24, height: 64, padding: "0 26px 0 18px", display: "flex", alignItems: "center", gap: 8, background: green.fill, borderRadius: T.radius.pill, opacity: b.opacity, transform: `scale(${b.scale.toFixed(3)})`, transformOrigin: "100% 50%", ...zh(34, T.weight.zh, T.onAccent) }}><CheckIcon size={38} color={T.onAccent} />{res.badge.text}</div>
          ); })() : null}
          {[{ t: res.title, slot: res.titleSlot, title: true }, ...res.lines.map((l) => ({ ...l, title: false }))].map((l, i) => {
            const start = resAt + 2 + i * 7, chars = [...l.t], n = typedN(f, start, chars.length, 1);
            const s = l.slot !== undefined ? slots[l.slot] : undefined, a = accentUI(s?.color);
            const tagAt = (res.badge?.at ?? resAt + 20) + 2 + i * 3;
            if (f < start) return null;
            return (
              <div key={i} style={{ position: "absolute", left: 30, right: 26, top: 104 + i * 94, height: 86, display: "flex", alignItems: "center", gap: 20 }}>
                <div style={{ width: 8, height: l.title ? 64 : 52, borderRadius: 4, background: s ? a.fill : T.line }} />
                <div style={zh(l.title ? 50 : 42, l.title ? T.weight.zh : T.weight.body, l.title ? T.text : T.text)}>{chars.slice(0, n).join("")}{n < chars.length ? <Caret f={f} h={44} color={T.text2} solid /> : null}</div>
                {s && f >= tagAt ? <div style={{ marginLeft: "auto", ...zh(34, T.weight.zh, T.onAccent), background: a.fill, borderRadius: T.radius.chip, padding: "6px 20px", letterSpacing: "0.06em", ...rise(f, tagAt, 0) }}>{s.label}</div> : null}
              </div>
            );
          })}
        </div>
      ) : null}
      <Ripple f={f} at={runAt} x={btn.cx} y={btn.cy} color={violet.fill} />
      {run && cur.o > 0 ? <Cursor x={cur.x} y={cur.y} press={press} opacity={cur.o} /> : null}
    </AbsoluteFill>
  );
};

/** script.json 頂層 uiVersion: 2 → 第 2 版（UiVideo2.tsx）；3 → 第 3 版（UiVideo3.tsx，完整長片）；沒寫＝第 1 版，畫面不變 */
export const VideoUI: React.FC<Script & { timeline: TimelineV2 }> = (props) => ((props as { uiVersion?: number }).uiVersion === 3 ? <VideoUI3 {...props} /> : (props as { uiVersion?: number }).uiVersion === 2 ? <VideoUI2 {...props} /> : <VideoUI1 {...props} />);
const VideoUI1: React.FC<Script & { timeline: TimelineV2 }> = ({ scenes, timeline, channel }) => {
  const f = useCurrentFrame();
  const m = useMemo(() => buildModel(scenes, timeline), [scenes, timeline]);
  const by = Object.fromEntries(timeline.scenes.map((x) => [x.id, x]));
  const ordered = scenes.filter((s) => by[s.id]);
  const subCues = ordered.filter((s) => by[s.id].subtitleWindow).map((s) => ({ id: s.id, en: s.subtitle.en, keywords: s.keywords, window: by[s.id].subtitleWindow as [number, number], phrases: by[s.id].lines, keywords_at: by[s.id].keywords }));
  const srcCues = ordered.map((s) => ({ sources: s.sources, window: by[s.id].sourceWindow }));
  return (
    <AbsoluteFill>
      <Backdrop />
      <ChatStage m={m} f={f} />
      <EditorStage m={m} f={f} />
      <CaptionUI cues={subCues} />
      <SourceUI cues={srcCues} />
      <HeaderUI name={channel?.name ?? "AI"} tag={channel?.tag ?? "AI 動手做"} total={timeline.totalFrames} />
      {timeline.voice ? <Audio src={staticFile(timeline.voice.file)} /> : timeline.scenes.filter((t) => t.audio).map((t) => (
        <Sequence key={`${t.id}-audio`} from={t.audioFrame} durationInFrames={Math.ceil(t.audioSec * FPS) + 1} name={`${t.id}-audio`} layout="none"><Audio src={staticFile(t.audio as string)} /></Sequence>
      ))}
    </AbsoluteFill>
  );
};

/** 封面：大標＋一個打好字的輸入框＋四個欄位標籤（script.json 的 cover.title／sub 與 slots） */
export const CoverUI: React.FC<Script & { coverCrop?: number }> = ({ cover, scenes, channel, coverCrop }) => {
  const c = (cover ?? {}) as { title?: string[]; sub?: string };
  const slots = scenes.flatMap((s) => (s.props?.slots ?? []) as { label: string; color: string }[]);
  const draft = scenes.map((s) => s.props?.draft?.text).find(Boolean) as string | undefined;
  const v = accentUI("violet");
  const shift = coverCrop ? (L.H - coverCrop) / 2 - 150 : 0;   // 裁切版：把頁首移進裁切範圍
  return (
    <AbsoluteFill>
      <Backdrop />
      <div style={{ position: "absolute", inset: 0, transform: `translateY(${shift}px)` }}><HeaderUI name={channel?.name ?? "AI"} tag={channel?.tag ?? "AI 動手做"} total={1} /></div>
      <div style={{ position: "absolute", left: L.X + 8, top: 520 }}>
        {(c.title ?? []).map((t, i) => <div key={i} style={{ ...zh(150, T.weight.zh, i === 1 ? v.text : T.text), lineHeight: 1.2 }}>{t}</div>)}
        <div style={{ ...zh(52, T.weight.body, T.text2), marginTop: 26 }}>{c.sub}</div>
      </div>
      {draft ? (
        <div style={{ position: "absolute", left: L.X, top: 1040, width: L.INNER_W, height: 124, background: T.field, border: `3px solid ${v.fill}`, borderRadius: T.radius.pill, display: "flex", alignItems: "center", paddingLeft: 48 }}>
          <span style={zh(52)}>{draft}</span><Caret f={0} h={60} color={v.fill} solid />
          <div style={{ position: "absolute", right: 16, width: 92, height: 92, borderRadius: T.radius.pill, background: v.fill, display: "flex", alignItems: "center", justifyContent: "center" }}><SendIcon size={50} color={T.onAccent} /></div>
        </div>
      ) : null}
      <div style={{ position: "absolute", left: L.X, top: 1220, width: L.INNER_W, display: "flex", gap: slots.length > 4 ? 12 : 24 }}>
        {slots.map((s, i) => <div key={i} style={{ flex: 1, height: 96, borderRadius: T.radius.chip, background: accentUI(s.color).fill, display: "flex", alignItems: "center", justifyContent: "center", ...zh(slots.length > 4 ? 38 : 50, T.weight.zh, T.onAccent), letterSpacing: slots.length > 4 ? "0.02em" : "0.08em" }}>{s.label}</div>)}
      </div>
    </AbsoluteFill>
  );
};

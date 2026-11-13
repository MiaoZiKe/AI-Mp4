// 前後對照分割畫面（styleVersion 3 ＋ stage: "split"）：上半「隨便問」、下半「這樣問」同時播放，中間分隔線跟著旁白滑動，最後好的那一半推滿。
// 時間全部來自 timeline（engine.ts）；顏色與版面讀 THEME_SPLIT／LAYOUT_SPLIT。純 HTML/CSS＋少量 SVG 圖示，沒有 3D、漸層、發光。
import React, { useMemo } from "react";
import { AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame } from "remotion";
import type { Scene, Script, TimelineV2 } from "../../types";
import { FONT_EN, FONT_ZH, FPS, LAYOUT_SPLIT as L, THEME_SPLIT as T, accentSplit } from "../../theme";
import { EASE, linear, tween } from "../anim";
import { buildSplit, mix, mixRect, type Rect, type SplitModel } from "./engine";

const PW = L.INNER_W, IN = PW - 2 * L.PAD, STAGE_H = L.STAGE_BOTTOM - L.STAGE_TOP;
const r1 = (v: number) => Math.round(v * 10) / 10;
const cut = (t: string, p: number) => { const c = [...t]; return c.slice(0, Math.floor(c.length * p + 1e-6)).join(""); };
const zh = (size: number, weight: number = T.weight.body): React.CSSProperties => ({ fontFamily: FONT_ZH, fontWeight: weight, fontSize: r1(size), lineHeight: 1.2, whiteSpace: "nowrap" });
const box = (r: Rect): React.CSSProperties => ({ position: "absolute", left: r1(r[0]), top: r1(r[1]), width: r1(r[2]), height: r1(r[3]), boxSizing: "border-box" });
/** 進場後落回原位的一下（0→1→0） */
const blip = (f: number, at: number, up = 5, down = 9) => tween(f, at, up, EASE.enter) - tween(f, at + up, down, EASE.move);

const Caret: React.FC<{ on: boolean; color: string }> = ({ on, color }) => <span style={{ display: "inline-block", width: "0.07em", height: "1em", marginLeft: "0.06em", verticalAlign: "-0.14em", background: color, opacity: on ? 1 : 0 }} />;
const Dots: React.FC<{ f: number; color: string; size?: number }> = ({ f, color, size = 14 }) => (
  <span style={{ display: "inline-flex", gap: size * 0.6, alignItems: "center", height: size * 2 }}>
    {[0, 1, 2].map((k) => <span key={k} style={{ width: size, height: size, borderRadius: size, background: color, opacity: Math.floor(f / 5) % 3 === k ? 1 : 0.35 }} />)}
  </span>
);
const Pill: React.FC<{ text: string; bg: string; color: string; size: number; h: number; style?: React.CSSProperties }> = ({ text, bg, color, size, h, style }) => (
  <div style={{ ...zh(size, T.weight.zh), height: r1(h), padding: `0 ${r1(h * 0.42)}px`, borderRadius: T.radius.pill, background: bg, color, display: "inline-flex", alignItems: "center", letterSpacing: "0.04em", ...style }}>{text}</div>
);
const Arrow: React.FC<{ size: number; color: string }> = ({ size, color }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round"><path d="M12 19V5M5.5 11.5 12 5l6.5 6.5" /></svg>
);
const Check: React.FC<{ size: number; color: string }> = ({ size, color }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={3.4} strokeLinecap="round" strokeLinejoin="round"><path d="M4.5 12.5 10 18 19.5 6.5" /></svg>
);
const Doc: React.FC<{ size: number; color: string }> = ({ size, color }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round"><path d="M6 3h8l4 4v14H6zM14 3v4h4M9 12h6M9 16h6" /></svg>
);

/** 上半：隨便問（灰階）。big＝佔大半時的版面，mini＝被擠小之後只留一行提示詞＋一行回覆 */
const BadPanel: React.FC<{ f: number; m: SplitModel }> = ({ f, m }) => {
  const B = T.bad;
  const pe = tween(f, m.expandAt, T.motion.slide, EASE.move);
  const up = tween(f, m.send, 10, EASE.move);
  const hookOp = 1 - tween(f, m.send - 2, 6, EASE.exit);
  const d = m.draft, r = m.reply;
  const cardY = mix(mix(318, 110, up), 84, pe), cardH = mix(124, 76, pe);
  const tp = d ? linear(f, d.t0, d.t1 - d.t0) : 0;
  const sent = f >= m.send;
  const press = Math.max(blip(f, m.send, 4, 8), blip(f, m.runAt, 4, 8));
  const replayAt = m.result?.at ?? Infinity, rerun = f >= m.runAt;
  const btn = cardH - mix(32, 20, pe);
  return (
    <>
      <Pill text={m.labels.bad} bg={B.pill} color={T.onInk} size={mix(32, 28, pe)} h={mix(56, 46, pe)} style={{ position: "absolute", left: L.PAD, top: r1(mix(30, 22, pe)) }} />
      {m.hook && hookOp > 0 ? (
        <div style={{ position: "absolute", left: L.PAD, top: 104, opacity: hookOp, transform: `translateY(${r1(-24 * (1 - hookOp))}px)` }}>
          <div style={{ ...zh(34), color: B.text2, letterSpacing: "0.08em" }}>{m.hook.kicker}</div>
          <div style={{ ...zh(132, T.weight.zh), color: T.ink, marginTop: 6, letterSpacing: "-0.01em" }}>{m.hook.title}</div>
        </div>
      ) : null}
      {d ? (
        <div style={{ ...box([L.PAD, cardY, IN, cardH]), background: B.card, border: `2px solid ${B.line}`, borderRadius: T.radius.card, display: "flex", alignItems: "center", padding: `0 ${r1(mix(16, 10, pe))}px 0 ${r1(mix(32, 24, pe))}px`, justifyContent: "space-between" }}>
          <div style={{ ...zh(mix(52, 38, pe)), color: B.text }}>{cut(d.text, tp)}<Caret on={!sent && (tp < 1 ? f >= d.t0 : Math.floor(f / 8) % 2 === 0)} color={B.text} /></div>
          <div style={{ width: r1(btn), height: r1(btn), borderRadius: T.radius.pill, background: sent ? B.pill : B.line, display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${(1 - 0.14 * press).toFixed(3)})` }}><Arrow size={r1(btn * 0.5)} color={T.onInk} /></div>
        </div>
      ) : null}
      {r && f >= r.at ? (() => {
        const en = tween(f, r.at, T.motion.in, EASE.enter);
        const [l1, l2] = r.lines, n1 = [...l1].length, n2 = [...l2].length;
        const c = Math.floor((n1 + n2) * linear(f, r.at + 3, 22));
        const p2 = rerun ? linear(f, replayAt, 24) : Math.max(0, c - n1) / n2;
        const typing = rerun ? f >= replayAt && p2 < 1 : c < n1 + n2;
        const st = r.stamp, stAt = st ? (rerun ? replayAt + 24 : st.at) : Infinity;
        const sp = tween(f, stAt, 6, EASE.enter);
        return (
          <div style={{ ...box([L.PAD, mix(262, 172, pe), IN, mix(290, 92, pe)]), background: B.card, borderRadius: T.radius.card, padding: `${r1(mix(26, 0, pe))}px ${r1(mix(32, 24, pe))}px`, opacity: en, transform: `translateY(${r1(16 * (1 - en))}px)`, display: "flex", flexDirection: "column", justifyContent: "center", overflow: "hidden" }}>
            <div style={{ height: r1(mix(52, 0, pe)), opacity: 1 - pe, overflow: "hidden" }}><Pill text={r.head} bg={B.line} color={B.text} size={24} h={40} /></div>
            <div style={{ ...zh(40, T.weight.light), color: B.text2, height: r1(mix(62, 0, pe)), opacity: 1 - pe, overflow: "hidden" }}>{cut(l1, Math.min(1, c / n1))}</div>
            <div style={{ ...zh(mix(44, 34, pe), T.weight.light), color: B.text }}>{rerun && f < replayAt ? <Dots f={f} color={B.text2} size={12} /> : <>{cut(l2, p2)}<Caret on={typing} color={B.text} /></>}</div>
            {st && sp > 0 ? (
              <div style={{ ...zh(mix(40, 28, pe), T.weight.zh), position: "absolute", right: r1(mix(28, 18, pe)), bottom: r1(mix(22, 20, pe)), color: B.stamp, border: `${r1(mix(4, 3, pe))}px solid ${B.stamp}`, borderRadius: 10, padding: `${r1(mix(8, 5, pe))}px ${r1(mix(18, 12, pe))}px`, background: B.card, letterSpacing: "0.1em", opacity: sp, transform: `rotate(-6deg) scale(${(1.5 - 0.5 * sp).toFixed(3)})` }}>{st.text}</div>
            ) : null}
          </div>
        );
      })() : null}
    </>
  );
};

/** 下半：這樣問。四個欄位先是 2×2 的空格 → 展開成四列逐一填上 → 送出後縮成一排標籤，下面是 AI 的回覆；推滿後回覆放大並標出每一行用到哪一塊 */
const GoodPanel: React.FC<{ f: number; h: number; m: SplitModel }> = ({ f, h, m }) => {
  const G = T.good;
  const pe = tween(f, m.expandAt, T.motion.slide, EASE.move), pr = tween(f, m.runAt, T.motion.morph, EASE.move), q = tween(f, m.fullAt, T.motion.full, EASE.move);
  const g = m.guide, res = m.result;
  const gp = g ? tween(f, g.at, T.motion.in, EASE.enter) * (1 - pr) : 0;
  const filled = m.slots.filter((s) => f >= s.at).length;
  return (
    <>
      <Pill text={m.labels.good} bg={G.pill} color={T.onInk} size={32} h={56} style={{ position: "absolute", left: L.PAD, top: 30 }} />
      {/* 進度：填了幾塊 */}
      <div style={{ ...zh(30, T.weight.zh), fontFamily: FONT_EN, position: "absolute", left: L.PAD + 168, top: 30, height: 56, display: "flex", alignItems: "center", color: filled ? G.text : G.ghost, opacity: 1 - gp * 0 }}>{filled}<span style={{ color: G.ghost }}>&nbsp;/&nbsp;{m.slots.length}</span></div>
      {g && gp > 0 ? (
        <div style={{ position: "absolute", right: L.PAD, top: 26, height: 64, display: "flex", alignItems: "center", gap: 12, padding: "0 20px 0 16px", borderRadius: T.radius.chip, border: `2px solid ${G.line}`, background: G.card, opacity: gp, transform: `translateX(${r1(20 * (1 - gp))}px)` }}>
          <Doc size={36} color={G.text} />
          <div>
            <div style={{ fontFamily: FONT_EN, fontWeight: T.weight.en, fontSize: 26, color: G.text, lineHeight: 1.15, whiteSpace: "nowrap" }}>{g.text}</div>
            <div style={{ fontFamily: FONT_EN, fontWeight: 600, fontSize: 19, color: G.text2, lineHeight: 1.15, whiteSpace: "nowrap" }}>{g.by}</div>
          </div>
        </div>
      ) : null}
      {m.slots.map((s, i) => {
        const a = accentSplit(s.color);
        const grid: Rect = [L.PAD + (i % 2) * 452, 104 + Math.floor(i / 2) * 100, 428, 84], rows: Rect = [L.PAD, 112 + i * 134, IN, 118], chips: Rect = [L.PAD + i * 224, 112, 208, 72];
        const r = mixRect(mixRect(grid, rows, pe), chips, pr);
        const fill = tween(f, s.at - 2, T.motion.in, EASE.enter), pulse = blip(f, m.pulseAt + i * 3), land = blip(f, s.at - 2, 4, 8);
        const tp = linear(f, s.at + 3, 15);
        const pillH = mix(mix(52, 66, pe), 50, pr), pillW = 128;
        return (
          <div key={i} style={{ ...box(r), borderRadius: T.radius.card, background: fill > 0 ? a.soft : pulse > 0 ? G.card : "transparent", border: fill > 0 ? `3px solid ${a.fill}` : `3px dashed ${pulse > 0.3 ? G.text : G.ghost}`, transform: `scale(${(1 + 0.025 * Math.max(pulse, land)).toFixed(4)})`, overflow: "hidden" }}>
            {fill > 0 ? (
              <>
                <div style={{ ...zh(mix(38, 32, pr), T.weight.zh), position: "absolute", left: r1(mix(20, (208 - pillW) / 2 - 3, pr)), top: r1((r[3] - 6 - pillH) / 2), width: pillW, height: r1(pillH), borderRadius: T.radius.chip, background: a.fill, color: a.on, display: "flex", alignItems: "center", justifyContent: "center", letterSpacing: "0.06em", opacity: fill, transform: `scale(${(0.8 + 0.2 * fill).toFixed(3)})` }}>{s.label}</div>
                {pr < 1 ? (
                  <div style={{ position: "absolute", left: 174, top: 14, opacity: 1 - pr }}>
                    <div style={{ fontFamily: FONT_EN, fontWeight: T.weight.en, fontSize: 21, color: a.text, letterSpacing: "0.12em", textTransform: "uppercase", lineHeight: 1.2 }}>{s.en}</div>
                    <div style={{ ...zh(44), color: G.text, marginTop: 4 }}>{cut(s.text, tp)}<Caret on={tp < 1} color={a.fill} /></div>
                  </div>
                ) : null}
              </>
            ) : (
              <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", gap: 18, paddingLeft: 20 }}>
                <div style={{ width: 44, height: 44, borderRadius: T.radius.pill, border: `3px solid ${pulse > 0.3 ? G.text : G.ghost}`, boxSizing: "border-box", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FONT_EN, fontWeight: T.weight.en, fontSize: 24, color: pulse > 0.3 ? G.text : G.ghost }}>{i + 1}</div>
                <div style={{ width: r1(mix(200, 420, pe)), height: 14, borderRadius: 7, background: G.line }} />
              </div>
            )}
          </div>
        );
      })}
      {res && f >= m.runAt + 6 ? (() => {
        const en = tween(f, m.runAt + 6, T.motion.in, EASE.enter);
        const tt = linear(f, res.at, 10);
        const tagOf = (k?: number) => (k === undefined ? undefined : m.slots[k]);
        const ks = mix(1, 1.3, q), kl = mix(1, 1.42, q);
        const bd = res.badge, bp = bd ? tween(f, bd.at + 6, T.motion.in, EASE.enter) : 0;
        const ta = tagOf(res.titleSlot), fm = res.format ? tagOf(res.format.slot) : undefined;
        return (
          <div style={{ ...box([L.PAD, 208, IN, h - 208 - L.PAD]), background: G.card, border: `2px solid ${G.line}`, borderRadius: T.radius.card, padding: "26px 30px", opacity: en, transform: `translateY(${r1(18 * (1 - en))}px)`, overflow: "hidden" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14, height: 44 }}>
              <Pill text={res.head} bg={G.line} color={G.text} size={24} h={40} />
              {f < res.at ? <Dots f={f} color={G.text2} size={12} /> : null}
              {fm && res.format && q > 0 ? <div style={{ ...zh(26), marginLeft: "auto", height: 44, padding: "0 16px", borderRadius: T.radius.chip, background: accentSplit(fm.color).soft, color: accentSplit(fm.color).text, display: "flex", alignItems: "center", opacity: q }}>{fm.label}｜{res.format.text}</div> : null}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 18, marginTop: r1(mix(12, 30, q)), height: r1(66 * ks) }}>
              <div style={{ width: 8, alignSelf: "stretch", margin: "8px 0", borderRadius: 4, background: ta ? accentSplit(ta.color).fill : G.line, opacity: tt > 0 ? 1 : 0 }} />
              <div style={{ ...zh(48 * ks, T.weight.zh), color: G.text }}>{cut(res.title, tt)}<Caret on={f >= res.at && tt < 1} color={G.text} /></div>
            </div>
            {res.lines.map((ln, k) => {
              const t0 = res.at + 10 + k * 8, lp = linear(f, t0, 8), tg = tagOf(ln.slot);
              return (
                <div key={k} style={{ display: "flex", alignItems: "center", gap: 18, height: r1(mix(58, 104, q)) }}>
                  <div style={{ width: 8, alignSelf: "stretch", margin: `${r1(mix(10, 22, q))}px 0`, borderRadius: 4, background: tg ? accentSplit(tg.color).fill : G.line, opacity: lp > 0 ? 1 : 0 }} />
                  <div style={{ ...zh(40 * kl, T.weight.light), color: G.text }}>{cut(ln.t, lp)}<Caret on={f >= t0 && lp < 1} color={G.text} /></div>
                  {tg && q > 0 ? <div style={{ ...zh(28, T.weight.zh), marginLeft: "auto", height: 48, padding: "0 16px", borderRadius: T.radius.chip, background: accentSplit(tg.color).fill, color: accentSplit(tg.color).on, display: "flex", alignItems: "center", opacity: q, transform: `translateX(${r1(16 * (1 - q))}px)` }}>{tg.label}</div> : null}
                </div>
              );
            })}
            {bd && bp > 0 ? (
              <div style={{ position: "absolute", left: 30, bottom: 34, height: 100, padding: "0 40px 0 30px", borderRadius: T.radius.pill, background: T.ink, display: "flex", alignItems: "center", gap: 16, opacity: bp, transform: `scale(${(0.86 + 0.14 * bp).toFixed(3)})`, transformOrigin: "0 100%" }}>
                <Check size={48} color={T.key} />
                <div style={{ ...zh(50, T.weight.zh), color: T.onInk, letterSpacing: "0.03em" }}>{bd.text}</div>
              </div>
            ) : null}
          </div>
        );
      })() : null}
    </>
  );
};

/** 頁首：兩色方塊＋頻道名、右邊標籤、底下進度線 */
export const HeaderSplit: React.FC<{ name: string; tag: string; progress: number }> = ({ name, tag, progress }) => (
  <>
    <div style={{ position: "absolute", left: L.X, right: L.X, top: L.HEADER_TOP, height: L.HEADER_H, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <div style={{ width: 40, height: 40, borderRadius: 10, overflow: "hidden", border: `3px solid ${T.ink}`, boxSizing: "border-box" }}><div style={{ height: "50%", background: T.bad.panel }} /><div style={{ height: "50%", background: T.ink }} /></div>
        <div style={{ fontFamily: FONT_EN, fontWeight: T.weight.en, fontSize: 44, color: T.ink, letterSpacing: "0.02em" }}>{name}</div>
      </div>
      <div style={{ ...zh(28), color: T.ink2, letterSpacing: "0.1em" }}>{tag}</div>
    </div>
    <div style={{ position: "absolute", left: L.X, top: L.PROGRESS_TOP, width: L.INNER_W, height: 4, borderRadius: 2, background: T.bad.panel }}><div style={{ width: `${(100 * progress).toFixed(2)}%`, height: 4, borderRadius: 2, background: T.ink }} /></div>
  </>
);

const enSplit = (en: string) => String(en ?? "").split("|").map((x) => x.trim()).filter(Boolean);
/** 字幕：一次一段（timeline 的短語），關鍵詞墊螢光筆底；英文跟著中文的句換 */
const Caption: React.FC<{ scenes: Scene[]; tl: TimelineV2; f: number }> = ({ scenes, tl, f }) => {
  const by = Object.fromEntries(tl.scenes.map((x) => [x.id, x]));
  const act = scenes.filter((s) => by[s.id]?.subtitleWindow && by[s.id].lines?.length);
  const sc = [...act].reverse().find((s) => f >= (by[s.id].subtitleWindow as number[])[0]) ?? act[0];
  if (!sc) return null;
  const t = by[sc.id], ps = t.lines, w0 = (t.subtitleWindow as number[])[0];
  let li = 0; ps.forEach((p, k) => { if (f >= p.start) li = k; });
  const text = ps[li].text.replace(/[、，。：？]+$/, "");
  const kw = (sc.keywords ?? []).filter((k) => text.includes(k)).sort((a, b) => text.indexOf(a) - text.indexOf(b));
  const parts: { t: string; k: boolean }[] = []; let rest = text;
  for (const k of kw) { const i = rest.indexOf(k); if (i < 0) continue; if (i) parts.push({ t: rest.slice(0, i), k: false }); parts.push({ t: k, k: true }); rest = rest.slice(i + k.length); }
  if (rest) parts.push({ t: rest, k: false });
  const en = enSplit(sc.subtitle.en);
  const startOf = (k: number) => (k === 0 ? w0 : ps[Math.ceil((k * ps.length) / en.length)]?.start ?? w0);
  let ei = 0; for (let i = 0; i < en.length; i++) if (f >= startOf(i)) ei = i;
  const inP = tween(f, li === 0 ? w0 : ps[li].start, 5, EASE.enter);
  return (
    <>
      <div style={{ position: "absolute", left: 0, right: 0, top: L.CAP_ZH_TOP, display: "flex", justifyContent: "center" }}>
        <div style={{ ...zh(L.CAP_ZH_PX, T.weight.zh), color: T.ink, transform: `translateY(${r1(10 * (1 - inP))}px)`, opacity: 0.4 + 0.6 * inP }}>
          {parts.map((p, k) => p.k ? <span key={k} style={{ position: "relative", display: "inline-block" }}><span style={{ position: "absolute", left: "-0.06em", right: "-0.06em", bottom: "0.04em", height: "0.42em", background: T.key, borderRadius: 4 }} /><span style={{ position: "relative" }}>{p.t}</span></span> : <span key={k}>{p.t}</span>)}
        </div>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: L.CAP_EN_TOP, textAlign: "center", fontFamily: FONT_EN, fontWeight: 600, fontSize: L.CAP_EN_PX, color: T.ink2, whiteSpace: "nowrap" }}>{en[ei]}</div>
    </>
  );
};
const SourceLine: React.FC<{ scenes: Scene[]; tl: TimelineV2; f: number }> = ({ scenes, tl, f }) => {
  const by = Object.fromEntries(tl.scenes.map((x) => [x.id, x]));
  const cur = scenes.find((s) => s.sources?.length && by[s.id] && f >= by[s.id].sourceWindow[0] && f < by[s.id].sourceWindow[1]);
  if (!cur) return null;
  const j = cur.sources.join("、");
  return <div style={{ ...zh(L.SRC_PX, T.weight.light), position: "absolute", left: 0, right: 0, top: L.SRC_TOP, textAlign: "center", color: T.ink3, letterSpacing: "0.02em" }}>{/^(資料)?來源/.test(j) ? j : `來源：${j}`}</div>;
};

export const VideoSplit: React.FC<Script & { timeline: TimelineV2 }> = ({ scenes, timeline, channel }) => {
  const f = useCurrentFrame();
  const m = useMemo(() => buildSplit(scenes, timeline), [scenes, timeline]);
  const ordered = scenes.filter((s) => timeline.scenes.some((x) => x.id === s.id));
  // 分隔線位置：依步驟一段一段滑過去；to: 0＝下半推滿（上半高度 0）
  const fracOf = (to: number) => (to <= 0 ? -L.GAP / 2 / STAGE_H : to);
  let frac = fracOf(m.steps[0]?.to ?? 0.5);
  for (const s of m.steps.slice(1)) frac = mix(frac, fracOf(s.to), tween(f, s.at, s.mode === "full" ? T.motion.full : T.motion.slide, EASE.move));
  const divY = L.STAGE_TOP + frac * STAGE_H;
  const topH = Math.max(0, divY - L.GAP / 2 - L.STAGE_TOP), botTop = divY + L.GAP / 2, botH = L.STAGE_BOTTOM - botTop;
  const q = tween(f, m.fullAt, T.motion.full, EASE.move);
  const n = m.node, np = n ? tween(f, n.at, T.motion.in, EASE.enter) : 0;
  const good = f >= m.expandAt;
  const panel: React.CSSProperties = { position: "absolute", left: L.X, width: PW, borderRadius: T.radius.panel, overflow: "hidden" };
  return (
    <AbsoluteFill style={{ background: T.bg }}>
      <HeaderSplit name={channel?.name ?? "AI"} tag={channel?.tag ?? "AI 動手做"} progress={Math.min(1, f / Math.max(1, timeline.totalFrames - 1))} />
      {topH > 1 ? <div style={{ ...panel, top: L.STAGE_TOP, height: r1(topH), background: T.bad.panel, opacity: 1 - q }}><BadPanel f={f} m={m} /></div> : null}
      <div style={{ ...panel, top: r1(botTop), height: r1(botH), background: T.good.panel, boxShadow: good ? T.shadow : undefined }}><GoodPanel f={f} h={botH} m={m} /></div>
      {/* 分隔線＋把手；念到「同一個」時把手換成 AI 節點，上下各送一顆點進兩邊 */}
      {q < 1 ? (
        <div style={{ position: "absolute", left: L.X, width: PW, top: r1(divY), height: 0, opacity: 1 - q }}>
          <div style={{ position: "absolute", left: 0, right: 0, top: -2, height: 4, borderRadius: 2, background: T.ink }} />
          <div style={{ position: "absolute", left: PW / 2 - 66, top: -14, width: 132, height: 28, borderRadius: T.radius.pill, background: T.ink, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, opacity: 1 - np }}>
            {[0, 1, 2].map((k) => <div key={k} style={{ width: 6, height: 6, borderRadius: 3, background: T.onInk }} />)}
          </div>
          {n && np > 0 ? (
            <>
              {[-1, 1].map((dir) => { const tp = ((f - n.at) % 16) / 16; return <div key={dir} style={{ position: "absolute", left: PW / 2 - 7, top: r1(dir * (50 + 70 * tp) - 7), width: 14, height: 14, borderRadius: 7, background: T.ink, opacity: np * (1 - tp) }} />; })}
              <div style={{ position: "absolute", left: PW / 2 - 50, top: -50, width: 100, height: 100, borderRadius: T.radius.pill, background: T.ink, border: `5px solid ${T.bg}`, boxSizing: "border-box", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FONT_EN, fontWeight: T.weight.en, fontSize: 38, color: T.onInk, transform: `scale(${(0.5 + 0.5 * np + 0.06 * blip(f, n.at + 6)).toFixed(3)})`, opacity: np }}>{n.text}</div>
              {n.sub ? <div style={{ ...zh(30, T.weight.zh), position: "absolute", left: PW / 2 + 66, top: -28, height: 56, padding: "0 22px", borderRadius: T.radius.pill, background: T.key, color: T.ink, display: "flex", alignItems: "center", opacity: np, transform: `translateX(${r1(-14 * (1 - np))}px)` }}>{n.sub}</div> : null}
            </>
          ) : null}
        </div>
      ) : null}
      <Caption scenes={ordered} tl={timeline} f={f} />
      <SourceLine scenes={ordered} tl={timeline} f={f} />
      {timeline.voice ? <Audio src={staticFile(timeline.voice.file)} /> : timeline.scenes.filter((t) => t.audio).map((t) => (
        <Sequence key={`${t.id}-audio`} from={t.audioFrame} durationInFrames={Math.ceil(t.audioSec * FPS) + 1} name={`${t.id}-audio`} layout="none"><Audio src={staticFile(t.audio as string)} /></Sequence>
      ))}
    </AbsoluteFill>
  );
};

/** 封面：上半灰色「隨便問」的一句話、下半白色「這樣問」的四塊，中間是標題 */
export const CoverSplit: React.FC<Script & { coverCrop?: number }> = ({ cover, channel, coverCrop }) => {
  const c = (cover ?? {}) as { title?: string[]; sub?: string; bad?: string; good?: string; chips?: { label: string; color: string }[] };
  const shift = coverCrop ? (L.H - coverCrop) / 2 - 150 : 0;
  return (
    <AbsoluteFill style={{ background: T.bg }}>
      <div style={{ position: "absolute", inset: 0, transform: `translateY(${shift}px)` }}><HeaderSplit name={channel?.name ?? "AI"} tag={channel?.tag ?? "AI 動手做"} progress={0} /></div>
      <div style={{ position: "absolute", left: L.X, top: 520, width: PW, height: 470, borderRadius: T.radius.panel, background: T.bad.panel, padding: L.PAD, boxSizing: "border-box" }}>
        <Pill text={c.bad ?? ""} bg={T.bad.pill} color={T.onInk} size={32} h={56} />
        {(c.title ?? []).map((t, i) => <div key={i} style={{ ...zh(i === 0 ? 96 : 150, T.weight.zh), color: T.ink, marginTop: i === 0 ? 22 : 0 }}>{t}</div>)}
      </div>
      <div style={{ position: "absolute", left: L.X, top: 1004, width: PW, height: 4, borderRadius: 2, background: T.ink }} />
      <div style={{ position: "absolute", left: L.X, top: 1018, width: PW, height: 330, borderRadius: T.radius.panel, background: T.good.panel, boxShadow: T.shadow, padding: L.PAD, boxSizing: "border-box" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}><Pill text={c.good ?? ""} bg={T.good.pill} color={T.onInk} size={32} h={56} /><div style={{ ...zh(44), color: T.ink2 }}>{c.sub}</div></div>
        <div style={{ display: "flex", gap: 16, marginTop: 34 }}>
          {(c.chips ?? []).map((s, i) => <div key={i} style={{ ...zh(54, T.weight.zh), flex: 1, height: 120, borderRadius: T.radius.card, background: accentSplit(s.color).fill, color: accentSplit(s.color).on, display: "flex", alignItems: "center", justifyContent: "center" }}>{s.label}</div>)}
        </div>
      </div>
    </AbsoluteFill>
  );
};

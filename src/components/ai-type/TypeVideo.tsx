// 動態大字（styleVersion 3 ＋ stage: "type"）：全螢幕大字跟著旁白逐字出現、放大、換色、被劃掉重寫；只搭配少量幾何色塊。
// 時間全部來自 timeline（engine.ts）；顏色與版面讀 THEME_TYPE／LAYOUT_TYPE。純 HTML/CSS，沒有 3D、漸層、發光。
import React, { useMemo } from "react";
import { AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame } from "remotion";
import type { Script, TimelineV2 } from "../../types";
import { FONT_EN, FONT_ZH, FPS, LAYOUT_TYPE as L, THEME_TYPE as T } from "../../theme";
import { EASE, tween } from "../anim";
import { buildType, mix, type Rect, type TypeItem, type TypeLayer } from "./engine";

type Ground = (typeof T.grounds)[string];
const groundOf = (g: string): Ground => T.grounds[g] ?? T.grounds.ink;
/** 字的顏色：fg／fg2／fg3＝底色的字；on:色名＝色塊上的字；色名＝直接放在底上的強調字 */
const inkOf = (role: string, g: string): string => {
  const gr = groundOf(g) as Record<string, string>;
  if (role.startsWith("on:")) return (T.accent[role.slice(3)] ?? T.accent.hot).on;
  if (T.accent[role]) return T.accent[role].text[g] ?? T.accent[role].fill;
  return gr[role] ?? gr.fg;
};
const fillOf = (role: string, g: string): string => T.accent[role]?.fill ?? (groundOf(g) as Record<string, string>)[role] ?? groundOf(g).fg;
const r1 = (v: number) => Math.round(v * 10) / 10;

/** 依 set 步驟算出這一幀的位置、縮放、顏色、矩形 */
const stateAt = (it: TypeItem, f: number) => {
  let x = it.x, y = it.y, scale = 1, color = it.color, rect: Rect = it.rect;
  for (const s of it.set) {
    if (f < s.at) break;
    const p = tween(f, s.at, s.dur, EASE.move);
    if (s.x !== undefined) x = mix(x, s.x, p);
    if (s.y !== undefined) y = mix(y, s.y, p);
    if (s.scale !== undefined) scale = mix(scale, s.scale, p);
    if (s.color !== undefined) color = s.color;
    if (s.rect) rect = rect.map((v, k) => mix(v, (s.rect as Rect)[k], p)) as Rect;
  }
  return { x, y, scale, color, rect };
};

const Block: React.FC<{ it: TypeItem; f: number }> = ({ it, f }) => {
  if (f < it.born || f >= it.die + T.motion.exit) return null;
  const st = stateAt(it, f);
  const p = tween(f, it.born, T.motion.slam, EASE.enter), e = tween(f, it.die, T.motion.exit, EASE.exit);
  const [x, y, w, h] = st.rect;
  const ww = it.enter === "wipe-r" ? w * p * (1 - e) : w, hh = it.enter === "wipe-u" ? h * p : h;
  const sc = it.enter === "pop" ? 0.4 + 0.6 * p : 1;
  return <div style={{ position: "absolute", left: r1(x), top: r1(y + (h - hh)), width: r1(ww), height: r1(hh), background: fillOf(st.color, it.ground), transform: sc === 1 ? undefined : `scale(${sc.toFixed(3)})` }} />;
};

const Text: React.FC<{ it: TypeItem; f: number }> = ({ it, f }) => {
  if (f < it.born || f >= it.die + T.motion.exit) return null;
  const st = stateAt(it, f), g = groundOf(it.ground);
  const col = inkOf(st.color, it.ground);
  const e = tween(f, it.die, T.motion.exit, EASE.exit);
  const chars = [...it.t];
  const whole = it.mode === "slam" || it.mode === "rise";
  const wp = whole ? tween(f, it.frames[0], it.mode === "slam" ? T.motion.slam : T.motion.char + 2, EASE.enter) : 1;
  const shown = chars.filter((_, k) => f >= it.frames[k]).length;
  const typing = shown > 0 && shown < chars.length;
  const lh = it.w ? 1.32 : 1;
  const outer: React.CSSProperties = {
    position: "absolute", left: r1(st.x), top: r1(st.y), width: it.w, whiteSpace: it.w ? "normal" : "nowrap", lineHeight: lh,
    fontFamily: it.font === "en" ? FONT_EN : FONT_ZH, fontWeight: it.weight ?? (it.font === "en" ? T.weight.en : T.weight.zh), fontSize: it.size, letterSpacing: it.ls, color: col,
    overflow: e > 0 && it.exit === "up" ? "hidden" : undefined, transformOrigin: "0 50%",
    transform: st.scale !== 1 ? `scale(${st.scale.toFixed(4)})` : undefined,
  };
  const inner: React.CSSProperties = {
    display: "inline-block", position: "relative", transformOrigin: "0 60%",
    opacity: it.mode === "rise" ? wp : it.exit === "fade" ? 1 - e : 1,
    transform: e > 0 ? (it.exit === "up" ? `translateY(${r1(-112 * e)}%)` : it.exit === "drop" ? `translateY(${r1(40 * e)}%) rotate(${r1(5 * e)}deg)` : undefined)
      : it.mode === "slam" ? `scale(${(1 + 0.6 * (1 - wp)).toFixed(4)})` : it.mode === "rise" ? `translateY(${Math.round(it.size * 0.4 * (1 - wp))}px)` : undefined,
  };
  if (it.exit === "drop" && e > 0) inner.opacity = 1 - e;
  const sk = it.strike ? tween(f, it.strike.at, T.motion.strike, EASE.move) : 0;
  const ul = it.underline ? tween(f, it.underline.at, T.motion.strike + 2, EASE.move) : 0;
  return (
    <div style={outer}>
      <span style={inner}>
        {it.caret ? (
          <>
            {chars.slice(0, shown).join("")}
            {f < it.caret.until ? <span style={{ display: "inline-block", width: "0.46em", height: "0.92em", marginLeft: "0.08em", verticalAlign: "-0.08em", background: fillOf(it.caret.color, it.ground), opacity: typing || Math.floor(f / 8) % 2 === 0 ? 1 : 0 }} /> : null}
          </>
        ) : whole ? it.t : chars.map((c, k) => {
          const on = f >= it.frames[k];
          const p = tween(f, it.frames[k], T.motion.char, EASE.enter);
          const ghost = it.mode === "ghost" && !on;
          const sty: React.CSSProperties = c === " " ? { display: "inline-block", width: "0.26em" } : {
            display: "inline-block", transformOrigin: "0 100%",
            visibility: on || (ghost && f >= it.ghostAt) ? "visible" : "hidden",
            // 空心字：先描邊再用底色填回去，筆畫交疊處的內部線才不會露出來
            color: ghost ? g.bg : undefined, WebkitTextStroke: ghost ? `${2 * T.stroke}px ${g.fg3}` : undefined, paintOrder: ghost ? "stroke fill" : undefined,
            transform: on && p < 1 ? `translateY(${r1(0.16 * (1 - p))}em) scale(${(1 + 0.22 * (1 - p)).toFixed(4)})` : undefined,
          };
          return <span key={k} style={sty}>{c === " " ? "" : c}</span>;
        })}
        {it.strike && sk > 0 ? <span style={{ position: "absolute", left: "-3%", top: "50%", width: `${r1(106 * sk)}%`, height: Math.max(8, Math.round(it.size * 0.085)), marginTop: -Math.max(4, Math.round(it.size * 0.04)), background: fillOf(it.strike.color, it.ground) }} /> : null}
        {it.underline && ul > 0 ? <span style={{ position: "absolute", left: 0, bottom: Math.round(-it.size * 0.06), width: `${r1(100 * ul)}%`, height: Math.max(8, Math.round(it.size * 0.06)), background: fillOf(it.underline.color, it.ground) }} /> : null}
      </span>
    </div>
  );
};

const Item: React.FC<{ it: TypeItem; f: number }> = ({ it, f }) => (it.kind === "block" ? <Block it={it} f={f} /> : <Text it={it} f={f} />);

/** 頁首：頻道名（前面一個小色塊）＋標籤＋進度線。顏色跟著底色 */
export const HeaderType: React.FC<{ name: string; tag: string; ground: string; progress: number }> = ({ name, tag, ground, progress }) => {
  const g = groundOf(ground);
  return (
    <>
      <div style={{ position: "absolute", left: L.X, right: L.X, top: L.HEADER_TOP, height: L.HEADER_H, display: "flex", alignItems: "center", justifyContent: "space-between", fontFamily: FONT_ZH }}>
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div style={{ width: 30, height: 30, background: T.accent.hot.fill }} />
          <div style={{ fontFamily: FONT_EN, fontWeight: T.weight.en, fontSize: 44, color: g.fg, letterSpacing: "0.02em" }}>{name}</div>
        </div>
        <div style={{ fontWeight: T.weight.body, fontSize: 28, color: g.fg2, letterSpacing: "0.12em" }}>{tag}</div>
      </div>
      <div style={{ position: "absolute", left: L.X, top: L.PROGRESS_TOP, width: L.INNER_W, height: 4, background: g.rule }}>
        <div style={{ width: `${(100 * progress).toFixed(2)}%`, height: 4, background: g.fg }} />
      </div>
    </>
  );
};

type Cap = { en: string; window: [number, number]; phrases: { text: string; start: number }[] };
const enSplit = (en: string) => String(en ?? "").split("|").map((x) => x.trim()).filter(Boolean);
/** 英文副字幕：左下角一行小字，跟著中文的句換（中文就是畫面上的大字，不另外放中文字幕） */
const CaptionEn: React.FC<{ cues: Cap[]; f: number; ground: string }> = ({ cues, f, ground }) => {
  const act = cues.filter((c) => c.phrases.length);
  if (!act.length) return null;
  const cue = [...act].reverse().find((c) => f >= c.window[0]) ?? act[0];
  const en = enSplit(cue.en), ps = cue.phrases;
  const startOf = (k: number) => (k === 0 ? cue.window[0] : ps[Math.ceil((k * ps.length) / en.length)]?.start ?? cue.window[0]);
  let k = 0; for (let i = 0; i < en.length; i++) if (f >= startOf(i)) k = i;
  return <div style={{ position: "absolute", left: L.X, top: L.EN_TOP, fontFamily: FONT_EN, fontWeight: T.weight.enBody, fontSize: L.EN_PX, color: groundOf(ground).fg2, whiteSpace: "nowrap", letterSpacing: "0.01em" }}>{en[k]}</div>;
};
const SourceLine: React.FC<{ cues: { sources: string[]; window: [number, number] }[]; f: number; ground: string }> = ({ cues, f, ground }) => {
  const cur = cues.find((c) => c.sources?.length && f >= c.window[0] && f < c.window[1]);
  if (!cur) return null;
  const j = cur.sources.join("、");
  return <div style={{ position: "absolute", left: L.X, top: L.SRC_TOP, fontFamily: FONT_ZH, fontWeight: 500, fontSize: L.SRC_PX, color: groundOf(ground).fg3, whiteSpace: "nowrap", letterSpacing: "0.02em" }}>{/^(資料)?來源/.test(j) ? j : `來源：${j}`}</div>;
};

/** 換底：新的一層從下往上（或從左往右）蓋上來，硬邊、不淡入 */
const clipOf = (l: TypeLayer, f: number) => {
  if (l.enter === "cut") return undefined;
  const p = tween(f, l.at, T.motion.wipe, EASE.move);
  if (p >= 1) return undefined;
  return l.enter === "wipe-left" ? `inset(0 ${r1(100 * (1 - p))}% 0 0)` : `inset(${r1(100 * (1 - p))}% 0 0 0)`;
};

export const VideoType: React.FC<Script & { timeline: TimelineV2 }> = ({ scenes, timeline, channel }) => {
  const f = useCurrentFrame();
  const m = useMemo(() => buildType(scenes, timeline), [scenes, timeline]);
  const by = Object.fromEntries(timeline.scenes.map((x) => [x.id, x]));
  const ordered = scenes.filter((s) => by[s.id]);
  const caps: Cap[] = ordered.filter((s) => by[s.id].subtitleWindow).map((s) => ({ en: s.subtitle.en, window: by[s.id].subtitleWindow as [number, number], phrases: by[s.id].lines }));
  const srcs = ordered.map((s) => ({ sources: s.sources, window: by[s.id].sourceWindow }));
  const progress = Math.min(1, f / Math.max(1, timeline.totalFrames - 1));
  // 已經被後面的層完全蓋住的層不畫
  const live = m.layers.filter((l, i) => f >= l.at && !(m.layers[i + 1] && f >= m.layers[i + 1].at + (m.layers[i + 1].enter === "cut" ? 0 : T.motion.wipe)));
  return (
    <AbsoluteFill style={{ background: groundOf(m.layers[0]?.ground ?? "ink").bg }}>
      {live.map((l) => (
        <AbsoluteFill key={l.at} style={{ background: groundOf(l.ground).bg, clipPath: clipOf(l, f) }}>
          <HeaderType name={channel?.name ?? "AI"} tag={channel?.tag ?? "AI 動手做"} ground={l.ground} progress={progress} />
          {l.items.map((it, k) => <Item key={k} it={it} f={f} />)}
          <CaptionEn cues={caps} f={f} ground={l.ground} />
          <SourceLine cues={srcs} f={f} ground={l.ground} />
        </AbsoluteFill>
      ))}
      {m.top.map((it, k) => <Item key={k} it={it} f={f} />)}
      {timeline.voice ? <Audio src={staticFile(timeline.voice.file)} /> : timeline.scenes.filter((t) => t.audio).map((t) => (
        <Sequence key={`${t.id}-audio`} from={t.audioFrame} durationInFrames={Math.ceil(t.audioSec * FPS) + 1} name={`${t.id}-audio`} layout="none"><Audio src={staticFile(t.audio as string)} /></Sequence>
      ))}
    </AbsoluteFill>
  );
};

/** 封面：兩行大字＋副標＋四個欄位色塊（script.json 的 cover.title／sub／chips） */
export const CoverType: React.FC<Script & { coverCrop?: number }> = ({ cover, channel, coverCrop }) => {
  const c = (cover ?? {}) as { title?: string[]; sub?: string; chips?: { label: string; color: string }[] };
  const g = groundOf("ink");
  const shift = coverCrop ? (L.H - coverCrop) / 2 - 150 : 0;
  const zh: React.CSSProperties = { fontFamily: FONT_ZH, fontWeight: T.weight.zh, whiteSpace: "nowrap", lineHeight: 1.12 };
  return (
    <AbsoluteFill style={{ background: g.bg }}>
      <div style={{ position: "absolute", inset: 0, transform: `translateY(${shift}px)` }}><HeaderType name={channel?.name ?? "AI"} tag={channel?.tag ?? "AI 動手做"} ground="ink" progress={0} /></div>
      <div style={{ position: "absolute", left: L.X, top: 560 }}>
        {(c.title ?? []).map((t, i) => <div key={i} style={{ ...zh, fontSize: i === 0 ? 250 : 186, color: i === 1 ? inkOf("hot", "ink") : g.fg }}>{t}</div>)}
        <div style={{ ...zh, fontWeight: T.weight.body, fontSize: 56, color: g.fg2, marginTop: 36 }}>{c.sub}</div>
      </div>
      <div style={{ position: "absolute", left: L.X, top: 1180, width: L.INNER_W, display: "flex", gap: 24 }}>
        {(c.chips ?? []).map((s, i) => <div key={i} style={{ flex: 1, height: 120, background: fillOf(s.color, "ink"), display: "flex", alignItems: "center", justifyContent: "center", ...zh, fontSize: 60, color: inkOf(`on:${s.color}`, "ink") }}>{s.label}</div>)}
      </div>
    </AbsoluteFill>
  );
};

// 夜窗（styleVersion 3 ＋ stage: "talk"；談晴說礙頻道）：全螢幕實拍照片慢慢推近、底片顆粒、暗角，
// 礙的幕是冷的夜色、晴的幕換成暖燈色；畫面上只有一個大數字、一兩句字、一排十格窗（亮幾格）。
// 時間全部來自 timeline（engine.ts）；顏色與版面讀 THEME_TALK／LAYOUT_TALK。沒有 3D、霓虹發光。
// 照片：public/talk/<slug>/<name>.jpg（不 commit；原圖在 out/<slug>/assets-raw/photos/，來源記在 videos/<slug>/assets.md）。
// 照片用 Remotion 的 Img（等載入完才截幀）；照片沒放好時渲染會報錯，先把照片放到 public/talk/<slug>/。
import React, { useMemo } from "react";
import { AbsoluteFill, Audio, Img, Sequence, staticFile, useCurrentFrame } from "remotion";
import type { Script, TimelineV2 } from "../../types";
import { FONT_EN, FONT_ZH, FPS, LAYOUT_TALK as L, THEME_TALK as T } from "../../theme";
import { EASE, tween } from "../anim";
import { buildTalk, type TalkModel, type TalkPhoto, type TalkWord } from "./engine";

const r1 = (v: number) => Math.round(v * 10) / 10;

const Photo: React.FC<{ ph: TalkPhoto; slug: string; f: number; first: boolean }> = ({ ph, slug, f, first }) => {
  if (f < ph.at || f >= ph.until + T.motion.cross) return null;
  const life = Math.max(1, ph.until - ph.at);
  const k = Math.min(1, Math.max(0, (f - ph.at) / life));
  const s = ph.push === "out" ? 1 + T.motion.push * (1 - k) : ph.push === "drift" ? 1 + T.motion.push * 0.5 : 1 + T.motion.push * k;
  const dx = ph.push === "drift" ? (k - 0.5) * 30 : 0;
  const op = first ? 1 : tween(f, ph.at, T.motion.cross, EASE.move);
  return (
    <AbsoluteFill style={{ opacity: op, overflow: "hidden" }}>
      {/* Img（不是 CSS 背景）：Remotion 會等照片載入才截這一幀，第 0 幀不會是黑的 */}
      <Img src={staticFile(`talk/${slug}/${ph.name}.jpg`)} style={{
        position: "absolute", width: "100%", height: "100%", objectFit: "cover",
        objectPosition: `${ph.focus[0] * 100}% ${ph.focus[1] * 100}%`,
        transform: `translateX(${r1(dx)}px) scale(${s.toFixed(4)})`, transformOrigin: `${ph.focus[0] * 100}% ${ph.focus[1] * 100}%`,
      }} />
    </AbsoluteFill>
  );
};

/** 調色：兩種 grade 之間交疊 */
const gradeAt = (m: TalkModel, f: number) => {
  let cur = m.grades[0], prev = m.grades[0];
  for (const g of m.grades) if (f >= g.at) { prev = cur; cur = g; }
  const p = cur === prev ? 1 : tween(f, cur.at, T.motion.grade, EASE.move);
  const a = T.grade[prev.grade] ?? T.grade.night, b = T.grade[cur.grade] ?? T.grade.night;
  return { a, b, p };
};
const Grade: React.FC<{ m: TalkModel; f: number }> = ({ m, f }) => {
  const { a, b, p } = gradeAt(m, f);
  return (
    <>
      <AbsoluteFill style={{ background: a.tint, opacity: a.tintAlpha * (1 - p), mixBlendMode: "multiply" }} />
      <AbsoluteFill style={{ background: b.tint, opacity: b.tintAlpha * p, mixBlendMode: "multiply" }} />
      <AbsoluteFill style={{ background: T.black, opacity: 1 - (a.brightness + (b.brightness - a.brightness) * p) }} />
    </>
  );
};

/** 底片顆粒：每 2 幀換一次 seed（固定、可重現） */
const Grain: React.FC<{ f: number }> = ({ f }) => (
  <AbsoluteFill style={{ opacity: T.grain, mixBlendMode: "overlay" }}>
    <svg width={L.W} height={L.H}>
      <filter id="talk-grain"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={2} seed={Math.floor(f / 2) % 97} stitchTiles="stitch" /></filter>
      <rect width={L.W} height={L.H} filter="url(#talk-grain)" />
    </svg>
  </AbsoluteFill>
);
const Vignette: React.FC = () => <AbsoluteFill style={{ opacity: T.vignette, background: `radial-gradient(ellipse at 50% 45%, transparent 45%, ${T.black} 100%)` }} />;

const fadeOf = (w: TalkWord, f: number) => (w.at === 0 ? 1 : tween(f, w.at, T.motion.in, EASE.enter)) * (1 - tween(f, w.until, T.motion.out, EASE.exit));

/** 十格窗：亮 lit 格，從 litAt 起一格一格亮 */
const Windows: React.FC<{ w: TalkWord; f: number; top: number }> = ({ w, f, top }) => {
  const n = w.count ?? 10, lit = w.lit ?? 0, from = w.litAt ?? w.at;
  const cols = 5, cw = L.WIN_CELL, gap = L.WIN_GAP;
  return (
    <div style={{ position: "absolute", left: L.X, top, display: "grid", gridTemplateColumns: `repeat(${cols}, ${cw}px)`, gap }}>
      {Array.from({ length: n }, (_, k) => {
        const on = k < lit && (w.at === 0 && from === 0 ? true : f >= from + k * T.motion.lit);
        return <div key={k} style={{ width: cw, height: cw * 1.25, border: `2px solid ${T.window.frame}`, background: on ? T.window.lit : T.window.dark }} />;
      })}
    </div>
  );
};

const Word: React.FC<{ w: TalkWord; f: number; slot: number }> = ({ w, f, slot }) => {
  if (f < w.at || f >= w.until + T.motion.out) return null;
  const o = fadeOf(w, f);
  const lift = w.at === 0 ? 0 : 18 * (1 - tween(f, w.at, T.motion.in, EASE.enter));
  const base: React.CSSProperties = { position: "absolute", left: L.X, width: L.INNER_W, opacity: o, transform: `translateY(${r1(lift)}px)`, fontFamily: FONT_ZH, whiteSpace: "pre-line" };
  switch (w.kind) {
    case "number":
      return <div style={{ ...base, top: L.NUM_TOP, fontFamily: FONT_EN, fontWeight: T.weight.num, fontSize: L.NUM_PX, lineHeight: 1, color: T.cold, letterSpacing: "-0.02em" }}>{w.text}</div>;
    case "windows":
      return <div style={{ opacity: o }}><Windows w={w} f={f} top={L.WIN_TOP} /></div>;
    case "sunny":
      return <div style={{ ...base, top: L.LINE_TOP + slot * 110, fontWeight: T.weight.zh, fontSize: L.LINE_PX, lineHeight: 1.3, color: T.warm }}>
        <span style={{ background: T.scrim, boxDecorationBreak: "clone", WebkitBoxDecorationBreak: "clone", padding: "0 12px" }}>{w.text}</span>
      </div>;
    case "ask":
      return <div style={{ ...base, top: L.WIN_TOP + 40, fontWeight: T.weight.body, fontSize: 52, lineHeight: 1.35, color: T.fg }}>{w.text}</div>;
    default:
      return <div style={{ ...base, top: L.LINE_TOP + slot * 110, fontWeight: T.weight.zh, fontSize: L.LINE_PX, lineHeight: 1.3, color: T.fg }}>
        <span style={{ background: T.scrim, boxDecorationBreak: "clone", WebkitBoxDecorationBreak: "clone", padding: "0 12px" }}>{w.text}</span>
      </div>;
  }
};

const Header: React.FC<{ name: string; tag: string; progress: number }> = ({ name, tag, progress }) => (
  <>
    <div style={{ position: "absolute", left: L.X, right: L.X, top: L.HEADER_TOP, height: L.HEADER_H, display: "flex", alignItems: "center", justifyContent: "space-between", fontFamily: FONT_ZH }}>
      <div style={{ fontWeight: T.weight.zh, fontSize: 40, color: T.fg, letterSpacing: "0.08em" }}>{name}</div>
      <div style={{ fontWeight: T.weight.body, fontSize: 28, color: T.fg2, letterSpacing: "0.12em" }}>{tag}</div>
    </div>
    <div style={{ position: "absolute", left: L.X, top: L.HEADER_TOP + L.HEADER_H + 10, width: L.INNER_W, height: 2, background: T.rule }}>
      <div style={{ width: `${(100 * progress).toFixed(2)}%`, height: 2, background: T.fg2 }} />
    </div>
  </>
);

type Cap = { en: string; window: [number, number]; phrases: { text: string; start: number }[] };
const enSplit = (en: string) => String(en ?? "").split("|").map((x) => x.trim()).filter(Boolean);
/** 字幕：中文一次一段（timeline 的短語），英文跟著句換 */
const Caption: React.FC<{ cues: Cap[]; f: number }> = ({ cues, f }) => {
  const cue = cues.find((c) => f >= c.window[0] && f < c.window[1]);
  if (!cue || !cue.phrases.length) return null;
  let k = 0; cue.phrases.forEach((p, i) => { if (f >= p.start) k = i; });
  const zh = cue.phrases[k].text.replace(/[，、；：。]$/, "");
  const en = enSplit(cue.en); const ek = Math.min(en.length - 1, Math.floor((k * en.length) / cue.phrases.length));
  const o = cue.window[0] === 0 ? 1 : tween(f, cue.window[0], 6, EASE.enter); // 第 0 幀的字幕直接在（鉤子幀不淡入）
  return (
    <div style={{ position: "absolute", left: L.X, width: L.INNER_W, top: L.CAP_TOP, opacity: o }}>
      <div style={{ fontFamily: FONT_ZH, fontWeight: T.weight.zh, fontSize: L.CAP_ZH_PX, color: T.fg, whiteSpace: "nowrap", textShadow: T.capShadow }}>{zh}</div>
      {en[ek] ? <div style={{ marginTop: 14, fontFamily: FONT_EN, fontWeight: T.weight.en, fontSize: L.CAP_EN_PX, color: T.fg2, whiteSpace: "nowrap" }}>{en[ek]}</div> : null}
    </div>
  );
};
const SourceLine: React.FC<{ cues: { sources: string[]; window: [number, number] }[]; f: number }> = ({ cues, f }) => {
  const cur = cues.find((c) => c.sources?.length && f >= c.window[0] && f < c.window[1]);
  if (!cur) return null;
  return <div style={{ position: "absolute", left: L.X, width: L.INNER_W, top: L.SRC_TOP, fontFamily: FONT_ZH, fontWeight: T.weight.body, fontSize: L.SRC_PX, color: T.fg3, lineHeight: 1.4 }}>{cur.sources[0]}</div>;
};

export const VideoTalk: React.FC<Script & { timeline: TimelineV2 }> = ({ slug, scenes, timeline, channel }) => {
  const f = useCurrentFrame();
  const m = useMemo(() => buildTalk(scenes, timeline), [scenes, timeline]);
  const by = Object.fromEntries(timeline.scenes.map((x) => [x.id, x]));
  const ordered = scenes.filter((s) => by[s.id]);
  const caps: Cap[] = ordered.filter((s) => by[s.id].subtitleWindow).map((s) => ({ en: s.subtitle.en, window: by[s.id].subtitleWindow as [number, number], phrases: by[s.id].lines }));
  const srcs = ordered.map((s) => ({ sources: s.sources, window: by[s.id].sourceWindow }));
  const progress = Math.min(1, f / Math.max(1, timeline.totalFrames - 1));
  // 同時在畫面上的句子依出現順序排第幾行（一個畫面最多兩句）
  const live = m.words.filter((w) => f >= w.at && f < w.until + T.motion.out);
  const lines = live.filter((w) => w.kind === "line" || w.kind === "sunny");
  return (
    <AbsoluteFill style={{ background: T.bg }}>
      {m.photos.map((ph, k) => <Photo key={`${ph.name}-${ph.at}`} ph={ph} slug={slug} f={f} first={k === 0} />)}
      <Grade m={m} f={f} />
      <Vignette />
      <Grain f={f} />
      <div style={{ position: "absolute", left: 0, right: 0, top: L.BAND_TOP, bottom: 0, background: T.capBand }} />
      <Header name={channel?.name ?? "談晴說礙"} tag={channel?.tag ?? "夜窗"} progress={progress} />
      {live.map((w, k) => <Word key={k} w={w} f={f} slot={Math.max(0, lines.indexOf(w))} />)}
      <Caption cues={caps} f={f} />
      <SourceLine cues={srcs} f={f} />
      {timeline.voice ? <Audio src={staticFile(timeline.voice.file)} /> : timeline.scenes.filter((t) => t.audio).map((t) => (
        <Sequence key={`${t.id}-audio`} from={t.audioFrame} durationInFrames={Math.ceil(t.audioSec * FPS) + 1} name={`${t.id}-audio`} layout="none"><Audio src={staticFile(t.audio as string)} /></Sequence>
      ))}
    </AbsoluteFill>
  );
};

/** 封面：第一幕的照片（夜色）＋大數字＋兩行標題（script.json 的 cover.title／sub） */
export const CoverTalk: React.FC<Script> = ({ slug, scenes, cover, channel }) => {
  const c = (cover ?? {}) as { title?: string[]; sub?: string };
  const p0 = (scenes[0]?.props ?? {}) as Record<string, any>;
  const ph = (Array.isArray(p0.photos) ? p0.photos[0] : p0.photo) as { name: string; focus?: [number, number] } | undefined;
  const num = (scenes.flatMap((s) => ((s.props ?? {}) as Record<string, any>).words ?? []) as { kind: string; text: string }[]).find((w) => w.kind === "number");
  const g = T.grade.night;
  return (
    <AbsoluteFill style={{ background: T.bg }}>
      {ph ? <Img src={staticFile(`talk/${slug}/${ph.name}.jpg`)} style={{ position: "absolute", width: "100%", height: "100%", objectFit: "cover", objectPosition: `${(ph.focus?.[0] ?? 0.5) * 100}% ${(ph.focus?.[1] ?? 0.5) * 100}%` }} /> : null}
      <AbsoluteFill style={{ background: g.tint, opacity: g.tintAlpha, mixBlendMode: "multiply" }} />
      <AbsoluteFill style={{ background: T.black, opacity: 1 - g.brightness }} />
      <Vignette />
      <Header name={channel?.name ?? "談晴說礙"} tag={channel?.tag ?? "夜窗"} progress={0} />
      {num ? <div style={{ position: "absolute", left: L.X, top: L.NUM_TOP, fontFamily: FONT_EN, fontWeight: T.weight.num, fontSize: L.NUM_PX, lineHeight: 1, color: T.cold }}>{num.text}</div> : null}
      <div style={{ position: "absolute", left: L.X, top: L.LINE_TOP, width: L.INNER_W }}>
        {(c.title ?? []).map((t, i) => <div key={i} style={{ fontFamily: FONT_ZH, fontWeight: T.weight.zh, fontSize: 84, lineHeight: 1.3, color: i === 1 ? T.warm : T.fg }}>{t}</div>)}
        {c.sub ? <div style={{ fontFamily: FONT_ZH, fontWeight: T.weight.body, fontSize: 40, color: T.fg2, marginTop: 28 }}>{c.sub}</div> : null}
      </div>
    </AbsoluteFill>
  );
};

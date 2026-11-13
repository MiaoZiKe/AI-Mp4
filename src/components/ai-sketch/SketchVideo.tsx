// 白板手繪（stage: "sketch"）：一塊點點方格紙的大板子，線條依配音 cue 一筆一筆描出來、字一個一個寫出來，鏡頭在板子上移動。
// 色票、線寬、手抖、動作都讀 theme.ts 的 THEME_SKETCH／LAYOUT_SKETCH。
import React, { useEffect, useMemo, useState } from "react";
import { AbsoluteFill, Audio, Sequence, continueRender, delayRender, staticFile, useCurrentFrame } from "remotion";
import type { Script, TimelineV2 } from "../../types";
import { FONT_SKETCH_EN, FONT_SKETCH_ZH, FPS, LAYOUT_SKETCH as L, THEME_SKETCH as T, markerSketch, penSketch } from "../../theme";
import { EASE, seeded, tween } from "../anim";
import { splitParts } from "../Subtitle";
import { buildSketch, type CamKey, type SketchItem } from "./engine";
import { makePen, strokesOf, type ShapeSpec } from "./rough";

// ── 手寫字型（public/fonts/sketch/，scripts/ai-sketch/fetch-fonts.mjs 下載的子集）；只有這個舞台掛上來時才載入 ──
let fontJob: Promise<unknown> | null = null;
const loadFonts = () => {
  if (!fontJob) fontJob = Promise.all([["SketchKai", "fonts/sketch/kai.woff2"], ["SketchHand", "fonts/sketch/hand.woff2"]].map(([fam, file]) =>
    new FontFace(fam, `url(${staticFile(file)}) format("woff2")`, { weight: "700" }).load().then((ff) => { document.fonts.add(ff); })));
  return fontJob;
};
const useSketchFonts = () => {
  const [h] = useState(() => delayRender("sketch-fonts"));
  useEffect(() => { loadFonts().then(() => continueRender(h), (e) => { console.error("sketch fonts", e); continueRender(h); }); }, [h]);
};

const r1 = (n: number) => Math.round(n * 10) / 10;
const HOLD = 1e6;

/** 一個手繪形狀：依進度一筆一筆描出來；畫完後每隔幾幀輕微重描（螢光筆塗色不重描） */
const Shape: React.FC<{ spec: ShapeSpec; seed: number; color: string; width: number; marker?: boolean; at: number; dur: number; f: number; still?: boolean }> = ({ spec, seed, color, width, marker, at, dur, f, still }) => {
  const phase = marker || still ? 0 : Math.floor(f / T.motion.boilEvery) % T.motion.boilPhases;
  const strokes = useMemo(() => strokesOf(spec, makePen(seed, phase)), [spec, seed, phase]);
  if (f < at) return null;
  const p = tween(f, at, dur, EASE.count);
  const total = strokes.reduce((a, s) => a + s.len, 0) || 1;
  let acc = 0;
  return (
    <svg width={1} height={1} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
      {strokes.map((s, i) => {
        const a = acc / total; acc += s.len; const b = acc / total;
        const q = Math.min(1, Math.max(0, (p - a) / Math.max(1e-6, b - a)));
        if (q <= 0) return null;
        return <path key={i} d={s.d} fill="none" stroke={marker ? markerSketch(color) : penSketch(color)} strokeOpacity={marker ? T.markerOpacity : 1} strokeWidth={width} strokeLinecap="round" strokeLinejoin="round"
          pathLength={q < 1 ? 1 : undefined} strokeDasharray={q < 1 ? "1 1" : undefined} strokeDashoffset={q < 1 ? r1(1000 * (1 - q)) / 1000 : undefined} />;
      })}
    </svg>
  );
};

/** 手寫字：一個字一個字由左到右寫出來；每個字有固定的小角度與上下位移 */
const Hand: React.FC<{ t: string; x: number; y: number; size: number; color: string; font?: "zh" | "en"; rot?: number; seed: number; at: number; per: number; f: number }> = ({ t, x, y, size, color, font, rot, seed, at, per, f }) => {
  const chars = useMemo(() => { const r = seeded(seed * 4391 + 5); return [...t].map((c) => ({ c, rot: (r() - 0.5) * 2 * T.wobble.charRot, dy: (r() - 0.5) * 2 * T.wobble.charDy })); }, [t, seed]);
  if (f < at) return null;
  const col = penSketch(color);
  return (
    <div style={{ position: "absolute", left: x, top: y, fontFamily: font === "en" ? FONT_SKETCH_EN : FONT_SKETCH_ZH, fontWeight: 700, fontSize: size, lineHeight: 1, color: col, whiteSpace: "nowrap", WebkitTextStroke: `${r1(size * T.textStroke)}px ${col}`, transform: rot ? `rotate(${rot}deg)` : undefined, transformOrigin: "0 50%" }}>
      {chars.map((ch, i) => {
        const q = Math.min(1, Math.max(0, (f - (at + i * per)) / Math.max(1, per)));
        return <span key={i} style={{ display: "inline-block", whiteSpace: "pre", transform: `translateY(${r1(ch.dy * size / 80)}px) rotate(${r1(ch.rot)}deg)`, visibility: q <= 0 ? "hidden" : undefined, clipPath: q < 1 ? `inset(-20% ${r1(100 * (1 - q))}% -20% -20%)` : undefined }}>{ch.c}</span>;
      })}
    </div>
  );
};

const Item: React.FC<{ it: SketchItem; f: number; still?: boolean }> = ({ it, f, still }) => it.kind === "text"
  ? <Hand t={it.t} x={it.x} y={it.y} size={it.size} color={it.color} font={it.font} rot={it.rot} seed={it.seed} at={it.at} per={it.per} f={f} />
  : <Shape spec={it.spec} seed={it.seed} color={it.color} width={it.width} marker={it.marker} at={it.at} dur={it.dur} f={f} still={still} />;

/** 鏡頭：[板子上的左上角 x, y, 縮放]，在關鍵幀之間用 EASE.move 移動 */
const camAt = (keys: CamKey[], f: number) => {
  let c = { x: keys[0].x, y: keys[0].y, z: keys[0].z };
  for (const k of keys.slice(1)) {
    const p = tween(f, k.at, k.dur, EASE.move);
    if (p <= 0) break;
    c = { x: c.x + (k.x - c.x) * p, y: c.y + (k.y - c.y) * p, z: c.z + (k.z - c.z) * p };
  }
  return c;
};

/** 板子：底色＋點點方格 */
const Board: React.FC = () => (
  <AbsoluteFill style={{ background: T.board }}>
    <svg width={L.W} height={L.H} style={{ position: "absolute", left: 0, top: 0 }}>
      <defs><pattern id="sk-dots" width={L.GRID} height={L.GRID} patternUnits="userSpaceOnUse" x={L.X - L.GRID / 2} y={L.MAIN_TOP - L.GRID / 2}><circle cx={L.GRID / 2} cy={L.GRID / 2} r={2.2} fill={T.dot} /></pattern></defs>
      <rect width={L.W} height={L.H} fill="url(#sk-dots)" />
    </svg>
  </AbsoluteFill>
);

/** 頁首：手寫頻道名＋手繪框的標籤＋一條畫出來的進度線 */
const HeaderSketch: React.FC<{ name: string; tag: string; f: number; progress: number }> = ({ name, tag, f, progress }) => {
  const tagW = [...tag].reduce((a, c) => a + (/[ -~]/.test(c) ? 0.55 : 1), 0) * 34 + 44;
  return (
    <>
      <Shape spec={{ type: "rect", box: [L.X + 4, L.HEADER_TOP + 8, 54, 54] }} seed={901} color="ink" width={T.stroke.pen} at={-HOLD} dur={1} f={f} />
      <Shape spec={{ type: "check", box: [L.X + 16, L.HEADER_TOP + 14, 50, 34] }} seed={902} color="red" width={T.stroke.pen} at={-HOLD} dur={1} f={f} />
      <Hand t={name} x={L.X + 80} y={L.HEADER_TOP + 6} size={58} color="ink" seed={903} at={-HOLD} per={1} f={f} />
      <Shape spec={{ type: "rect", box: [L.X + L.INNER_W - tagW, L.HEADER_TOP + 6, tagW - 4, 58] }} seed={904} color="ink2" width={4} at={-HOLD} dur={1} f={f} />
      <Hand t={tag} x={L.X + L.INNER_W - tagW + 20} y={L.HEADER_TOP + 18} size={34} color="ink2" seed={905} at={-HOLD} per={1} f={f} />
      <Shape spec={{ type: "line", box: [L.X, L.PROGRESS_TOP, L.X + L.INNER_W, L.PROGRESS_TOP] }} seed={906} color="ink3" width={3} at={-HOLD} dur={1} f={f} still />
      <Shape spec={{ type: "line", box: [L.X, L.PROGRESS_TOP, L.X + Math.max(8, L.INNER_W * progress), L.PROGRESS_TOP] }} seed={906} color="ink" width={T.stroke.pen} at={-HOLD} dur={1} f={f} still />
    </>
  );
};

type Cap = { en: string; keywords: string[]; colors?: string[]; window: [number, number]; phrases: { text: string; start: number }[]; kwAt: { text: string; start: number }[] };
const display = (p: string) => p.replace(/\n/g, "").replace(/[，、；：。]+$/, "");
const enSplit = (en: string) => String(en ?? "").split("|").map((x) => x.trim()).filter(Boolean);
/** 字幕：板子下緣一條手繪線以下。中文一次一段單行，關鍵詞念到時螢光筆刷過去並換色；英文手寫體跟著中文的句 */
const CaptionSketch: React.FC<{ cues: Cap[]; f: number }> = ({ cues, f }) => {
  const act = cues.filter((c) => c.phrases.length);
  if (!act.length) return null;
  const cue = [...act].reverse().find((c) => f >= c.window[0]) ?? act[0];
  const a = cue.window[0], ps = cue.phrases;
  const startOf = (k: number) => (k === 0 ? a : ps[k].start);
  let k = 0; for (let i = 0; i < ps.length; i++) if (f >= startOf(i)) k = i;
  const en = enSplit(cue.en);
  const enStart = (e: number) => (e === 0 ? a : ps[Math.ceil((e * ps.length) / en.length)]?.start ?? a);
  let e = 0; for (let i = 0; i < en.length; i++) if (f >= enStart(i)) e = i;
  const kwAt = Object.fromEntries(cue.kwAt.map((x) => [x.text, x.start]));
  // 整句很短（四個詞用頓號隔開）就整句同列，念到哪個詞哪個詞上色
  const whole = ps.map((x) => x.text).join("");
  const joined = ps.length > 1 && [...display(whole)].length <= 11;
  const text = joined ? display(whole) : display(ps[k].text);
  return (
    <>
      <div style={{ position: "absolute", left: 0, width: L.W, top: L.CAP_TOP, textAlign: "center", fontFamily: FONT_SKETCH_ZH, fontWeight: 700, fontSize: L.CAP_ZH_PX, lineHeight: 1.2, color: penSketch("ink"), WebkitTextStroke: `${r1(L.CAP_ZH_PX * T.textStroke)}px ${penSketch("ink")}`, whiteSpace: "nowrap" }}>
        {splitParts(text, cue.keywords).map((s, i) => {
          if (s.k < 0) return <span key={i}>{s.text}</span>;
          const q = kwAt[s.text] === undefined ? 1 : tween(f, kwAt[s.text] - 1, 7, EASE.move);
          const role = cue.colors?.[s.k % cue.colors.length];
          const col = penSketch(q > 0.5 ? role ?? "red" : joined ? "ink3" : "ink");
          return (
            <span key={i} style={{ position: "relative", display: "inline-block", color: col, WebkitTextStroke: `${r1(L.CAP_ZH_PX * T.textStroke)}px ${col}` }}>
              <span style={{ position: "absolute", left: "-3%", top: "16%", height: "76%", width: `${r1(106 * q)}%`, background: markerSketch(role ?? "yellow"), opacity: T.markerOpacity, borderRadius: 10, transform: "rotate(-1.2deg)" }} />
              <span style={{ position: "relative" }}>{s.text}</span>
            </span>
          );
        })}
      </div>
      <div style={{ position: "absolute", left: 0, width: L.W, top: L.CAP_EN_TOP, textAlign: "center", fontFamily: FONT_SKETCH_EN, fontWeight: 700, fontSize: L.CAP_EN_PX, lineHeight: 1.2, color: penSketch("ink2"), whiteSpace: "nowrap" }}>{joined ? en.join(" ") : en[e]}</div>
    </>
  );
};
const SourceSketch: React.FC<{ cues: { sources: string[]; window: [number, number] }[]; f: number }> = ({ cues, f }) => {
  const cur = cues.find((c) => c.sources?.length && f >= c.window[0] && f < c.window[1]);
  if (!cur) return null;
  const j = cur.sources.join("、");
  return <div style={{ position: "absolute", left: 0, width: L.W, top: L.SRC_TOP, textAlign: "center", fontFamily: FONT_SKETCH_ZH, fontWeight: 700, fontSize: L.SRC_PX, color: penSketch("ink3"), whiteSpace: "nowrap" }}>{/^(資料)?來源/.test(j) ? j : `來源：${j}`}</div>;
};

export const VideoSketch: React.FC<Script & { timeline: TimelineV2 }> = ({ scenes, timeline, channel }) => {
  useSketchFonts();
  const f = useCurrentFrame();
  const m = useMemo(() => buildSketch(scenes, timeline), [scenes, timeline]);
  const by = Object.fromEntries(timeline.scenes.map((x) => [x.id, x]));
  const ordered = scenes.filter((s) => by[s.id]);
  const caps: Cap[] = ordered.filter((s) => by[s.id].subtitleWindow).map((s) => ({ en: s.subtitle.en, keywords: s.keywords, colors: (s.props as any)?.kwColors, window: by[s.id].subtitleWindow as [number, number], phrases: by[s.id].lines, kwAt: by[s.id].keywords }));
  const srcs = ordered.map((s) => ({ sources: s.sources, window: by[s.id].sourceWindow }));
  const c = camAt(m.cam, f);
  return (
    <AbsoluteFill>
      <Board />
      <div style={{ position: "absolute", left: L.X, top: L.MAIN_TOP, width: 1, height: 1, transformOrigin: "0 0", transform: `scale(${c.z.toFixed(4)}) translate(${r1(-c.x)}px, ${r1(-c.y)}px)` }}>
        {m.items.map((it, k) => <Item key={k} it={it} f={f} />)}
      </div>
      <Shape spec={{ type: "line", box: [L.X, L.RULE_Y, L.X + L.INNER_W, L.RULE_Y] }} seed={911} color="ink3" width={3} at={-HOLD} dur={1} f={f} still />
      <HeaderSketch name={channel?.name ?? "AI"} tag={channel?.tag ?? "AI 動手做"} f={f} progress={Math.min(1, f / Math.max(1, timeline.totalFrames - 1))} />
      <CaptionSketch cues={caps} f={f} />
      <SourceSketch cues={srcs} f={f} />
      {timeline.voice ? <Audio src={staticFile(timeline.voice.file)} /> : timeline.scenes.filter((t) => t.audio).map((t) => (
        <Sequence key={`${t.id}-audio`} from={t.audioFrame} durationInFrames={Math.ceil(t.audioSec * FPS) + 1} name={`${t.id}-audio`} layout="none"><Audio src={staticFile(t.audio as string)} /></Sequence>
      ))}
    </AbsoluteFill>
  );
};

/** 封面：兩行手寫大字、第二行用紅筆圈起來、副標、四個塗色欄位（script.json 的 cover.title／sub／chips） */
export const CoverSketch: React.FC<Script & { coverCrop?: number }> = ({ cover, channel, coverCrop }) => {
  useSketchFonts();
  const c = (cover ?? {}) as { title?: string[]; sub?: string; chips?: { label: string; color: string }[] };
  const shift = coverCrop ? (L.H - coverCrop) / 2 - 150 : 0;
  const [t1, t2] = [c.title?.[0] ?? "", c.title?.[1] ?? ""];
  const s1 = 210, s2 = Math.min(190, Math.floor(860 / Math.max(1, [...t2].length)));
  const w2 = [...t2].length * s2, chips = c.chips ?? [], cw = (L.INNER_W - 24 * (chips.length - 1)) / Math.max(1, chips.length);
  const F = HOLD;
  return (
    <AbsoluteFill>
      <Board />
      <div style={{ position: "absolute", inset: 0, transform: `translateY(${shift}px)` }}><HeaderSketch name={channel?.name ?? "AI"} tag={channel?.tag ?? "AI 動手做"} f={F} progress={0} /></div>
      <Hand t={t1} x={L.X + 10} y={560} size={s1} color="ink" seed={921} at={0} per={1} f={F} />
      <Shape spec={{ type: "hatch", box: [L.X + 4, 838, w2 + 12, s2 * 0.92], gap: 60 }} seed={922} color="yellow" width={T.stroke.marker * 1.6} marker at={0} dur={1} f={F} />
      <Hand t={t2} x={L.X + 10} y={830} size={s2} color="ink" seed={923} at={0} per={1} f={F} />
      <Shape spec={{ type: "underline", box: [L.X + 10, 838 + s2 + 14, w2, 0], double: true }} seed={924} color="red" width={T.stroke.bold} at={0} dur={1} f={F} />
      <Hand t={c.sub ?? ""} x={L.X + 14} y={1100} size={70} color="ink2" seed={925} at={0} per={1} f={F} />
      {chips.map((s, i) => {
        const x = L.X + i * (cw + 24);
        return (
          <React.Fragment key={i}>
            <Shape spec={{ type: "hatch", box: [x + 10, 1262, cw - 20, 116], gap: 38 }} seed={930 + i} color={s.color} width={T.stroke.marker} marker at={0} dur={1} f={F} />
            <Shape spec={{ type: "rect", box: [x, 1250, cw, 140] }} seed={940 + i} color={s.color} width={T.stroke.pen} at={0} dur={1} f={F} />
            <Hand t={s.label} x={x + (cw - [...s.label].length * 76) / 2} y={1282} size={76} color={s.color} seed={950 + i} at={0} per={1} f={F} />
          </React.Fragment>
        );
      })}
    </AbsoluteFill>
  );
};

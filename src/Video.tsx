import React from "react";
import { AbsoluteFill, Audio, Easing, Sequence, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { TransitionSeries } from "@remotion/transitions";
import type { TransitionPresentation, TransitionPresentationComponentProps, TransitionTiming } from "@remotion/transitions";
import type { Scene, SceneTiming, SceneTimingV2, Script, TimelineV2, TransitionSpec } from "./types";
import { C, FPS, SAFE } from "./theme";
import { isV2, sceneFrames, sceneStarts } from "./timing";
import { StyleV2Context } from "./style";
import {
  Background, Header, Subtitle, SourceFooter, EndCard, TermCard, FlowRow, CompareSplit,
  BigNumber, SeatBar, IconGrid, ImpactCard, SubtitleTrack, SourceTrack,
} from "./components";
import { EASE } from "./components/anim";
import { CueContext } from "./cue";
import { BackgroundV2, HeaderV2, SceneBackdropV2 } from "./components/v2/base";
import { HookTitle } from "./components/v2/HookTitle";
import { BigNumberV2 } from "./components/v2/BigNumber";
import { CompareSplitV2, FlowRowV2, IconGridV2, ImpactCardV2, TermCardV2 } from "./components/v2/Cards";
import { CtaCard, EndCardV2 } from "./components/v2/Closing";
import { SubtitleTrackV2, SourceTrackV2 } from "./components/v2/Tracks";
import { LAYOUT_V2 } from "./theme";

const REGISTRY: Record<string, React.FC<any>> = {
  TermCard, FlowRow, CompareSplit, BigNumber, SeatBar, IconGrid, ImpactCard, EndCard,
};

/** styleVersion 2（A 奶油編輯）元件；SeatBar 尚無 v2 版（validate 會擋） */
const REGISTRY_V2: Record<string, React.FC<any>> = {
  HookTitle, TermCard: TermCardV2, FlowRow: FlowRowV2, CompareSplit: CompareSplitV2, BigNumber: BigNumberV2, IconGrid: IconGridV2, ImpactCard: ImpactCardV2, EndCard: EndCardV2, CtaCard,
};

const IN = 10, OUT = 9; // 換幕：進場 0.33 秒（淡入＋上移＋縮放），出場 0.3 秒

const SceneView: React.FC<{ scene: Scene; asOf: string; timing?: SceneTiming }> = ({ scene, asOf, timing }) => {
  const f = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const tIn = interpolate(f, [0, IN], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });
  const tOut = interpolate(f, [durationInFrames - OUT, durationInFrames], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.in(Easing.cubic) });
  const opacity = tIn * (1 - tOut);
  const y = (1 - tIn) * 36 - tOut * 20;
  const sc = 1.03 - 0.03 * tIn - 0.015 * tOut;
  const kb = 1 + 0.025 * (f / durationInFrames); // 整幕緩慢推近（Ken Burns）
  const Comp = REGISTRY[scene.component];
  if (!Comp) throw new Error(`Unknown component: ${scene.component}`);
  const isEnd = scene.component === "EndCard";
  // 配音時間軸：字幕每行、每個字、關鍵詞在被唸到時才出現／上色
  const lineStarts = timing ? timing.lines.map((l) => Math.round(l.start * FPS)) : undefined;
  const charTimes = timing ? timing.lines.map((l) => (l.chars ? l.chars.map((t) => Math.round(t * FPS)) : undefined)) : undefined;
  const keywordStarts = timing ? Object.fromEntries(timing.keywords.map((k) => [k.text, Math.round(k.start * FPS)])) : undefined;
  return (
    <AbsoluteFill style={{ opacity, transform: `translateY(${y}px) scale(${sc})` }}>
      <div style={{ position: "absolute", left: SAFE.x, right: SAFE.x, top: 330, height: isEnd ? 1370 : 1030, display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${kb})`, transformOrigin: "50% 50%" }}>
        <Comp {...scene.props} />
      </div>
      {!isEnd && <Subtitle zh={scene.subtitle.zh} en={scene.subtitle.en} keywords={scene.keywords} lineStarts={lineStarts} keywordStarts={keywordStarts} charTimes={charTimes} />}
      {!isEnd && <SourceFooter sources={scene.sources} asOf={asOf} />}
    </AbsoluteFill>
  );
};

/** 全片進度條：標題列下方，青→粉漸層 */
const ProgressBar: React.FC = () => {
  const f = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const p = Math.min(1, f / Math.max(1, durationInFrames - 1));
  return (
    <div style={{ position: "absolute", left: SAFE.x, right: SAFE.x, top: SAFE.top + 86, height: 4, borderRadius: 2, background: "rgba(255,255,255,0.10)" }}>
      <div style={{ width: `${p * 100}%`, height: "100%", borderRadius: 2, background: `linear-gradient(90deg, ${C.cyan}, ${C.pink})`, boxShadow: `0 0 10px ${C.cyan}88` }} />
    </div>
  );
};

// ───────────────────────── styleVersion 2 ─────────────────────────

/** 內容層（不含字幕、來源列）：沒有整幕縮放、沒有 Ken Burns；進出場由轉場負責 */
/** 有轉場的幕：元件時間比 Sequence 快 ENTER_LEAD 幀，讓元件第一批元素在進場淡入（轉場第 3–8 幀）時就已經在動，不會只剩背景 */
const ENTER_LEAD = 6;
const SceneBodyV2: React.FC<{ scene: Scene; lead: number; timing: SceneTimingV2; exitAbs: number }> = ({ scene, lead, timing, exitAbs }) => {
  const Comp = REGISTRY_V2[scene.component];
  if (!Comp) throw new Error(`Unknown component (styleVersion 2): ${scene.component}`);
  const isEnd = scene.component === "EndCard";
  // P0-8：cue 絕對幀 → 元件本地幀（元件時間比 Sequence 快 lead 幀）
  const loc = (abs: number) => abs - timing.startFrame + lead;
  const cue = {
    cues: Object.fromEntries((timing.cues ?? []).filter((c) => c.frame !== null).map((c) => [c.id, loc(c.frame as number)])),
    exit: loc(exitAbs), voiceStart: loc(timing.voiceStartFrame), voiceEnd: loc(timing.voiceEndFrame),
  };
  const top = LAYOUT_V2.CONTENT_TOP, bottom = isEnd ? LAYOUT_V2.SUB_BOTTOM : LAYOUT_V2.CONTENT_BOTTOM;
  const frame = useCurrentFrame();
  const bg = scene.bg ?? {};
  const mark = bg.mark ?? (isEnd ? undefined : scene.keywords?.[0]);
  return (
    <AbsoluteFill>
      {/* 背景層：色塊＋出血色帶＋大字水印（視差 0.2） */}
      <SceneBackdropV2 mark={mark} color={bg.color ?? scene.props?.color ?? "pink"} drift={Math.min(1, frame / Math.max(1, timing.durationFrames))} />
      {/* 主視覺：撐滿主視覺區（952×920），元件自行把內容分布到整個高度 */}
      <div style={{ position: "absolute", left: LAYOUT_V2.X, right: LAYOUT_V2.X, top, height: bottom - top, display: "flex", alignItems: "stretch", justifyContent: "center" }}>
        <Sequence from={-lead} layout="none" name={`${scene.id}-content`}>
          <CueContext.Provider value={cue}>
            <Comp {...scene.props} />
          </CueContext.Provider>
        </Sequence>
      </div>
    </AbsoluteFill>
  );
};

/** 轉場進度＝幀 / 總幀數（線性），曲線在 presentation 裡依 exit／enter 幀區間計算 */
const frameTiming = (frames: number): TransitionTiming => ({
  getDurationInFrames: () => frames,
  getProgress: ({ frame }) => Math.min(1, Math.max(0, frame / frames)),
});
const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const outQuad = (u: number) => 1 - (1 - u) * (1 - u);
// 位移：fade 走垂直、slide 走水平；出場 ease-in、進場 ease-out(quad)，每幀位移 ≤ 24px（5 幀：出 40px 最大 16px/幀、進 48px 最大 19px/幀）
const DIST = { fade: { exit: -24, enter: 32 }, slide: { exit: -40, enter: 48 } } as const;

/** 錯位轉場：出場在 exit 幀區間快速淡出＋位移，進場在 enter 幀區間才淡入（兩者不同時 >40% 不透明 → 沒有雙重曝光；也不會整片只剩背景） */
const Stagger: React.FC<TransitionPresentationComponentProps<TransitionSpec>> = ({ children, presentationDirection, presentationProgress, passedProps }) => {
  const k = presentationProgress * passedProps.frames;
  const d = DIST[passedProps.type] ?? DIST.fade;
  let opacity: number, shift: number;
  if (presentationDirection === "exiting") {
    const [a, b] = passedProps.exit;
    const u = clamp01((k - a) / Math.max(1, b - a));
    opacity = 1 - u;
    shift = d.exit * EASE.exit(u);
  } else {
    const [a, b] = passedProps.enter;
    const u = clamp01((k - a) / Math.max(1, b - a));
    opacity = outQuad(u);
    shift = d.enter * (1 - outQuad(u));
  }
  const px = Math.round(shift);
  const transform = passedProps.type === "slide" ? `translateX(${px}px)` : `translateY(${px}px)`;
  return <AbsoluteFill style={{ opacity, transform }}>{children}</AbsoluteFill>;
};
const stagger = (spec: TransitionSpec): TransitionPresentation<TransitionSpec> => ({ component: Stagger, props: spec });

const VideoV2: React.FC<Script & { timeline: TimelineV2 }> = ({ scenes, asOf, timeline }) => {
  const byId = Object.fromEntries(timeline.scenes.map((x) => [x.id, x]));
  const ordered = scenes.filter((s) => byId[s.id]);
  const subCues = ordered.filter((s) => byId[s.id].subtitleWindow).map((s) => {
    const t = byId[s.id];
    return { id: s.id, en: s.subtitle.en, keywords: s.keywords, window: t.subtitleWindow as [number, number], phrases: t.lines, keywords_at: t.keywords };
  });
  const srcCues = ordered.filter((s) => s.component !== "EndCard").map((s) => ({ sources: s.sources, window: byId[s.id].sourceWindow }));
  return (
    <StyleV2Context.Provider value>
      <AbsoluteFill>
        <BackgroundV2 />
        <TransitionSeries>
          {ordered.flatMap((s, i) => {
            const t = byId[s.id];
            const nt = byId[ordered[i + 1]?.id];
            const exitAbs = nt ? nt.startFrame : t.startFrame + t.durationFrames;
            const seq = (
              <TransitionSeries.Sequence key={s.id} durationInFrames={t.durationFrames} name={s.id}>
                <SceneBodyV2 scene={s} lead={i === 0 ? 0 : ENTER_LEAD} timing={t} exitAbs={exitAbs} />
              </TransitionSeries.Sequence>
            );
            if (i === 0 || !t.transitionFrames) return [seq];
            const spec: TransitionSpec = t.transition ?? { type: "fade", frames: t.transitionFrames, exit: [0, 5], enter: [3, 8] };
            return [<TransitionSeries.Transition key={`${s.id}-tr`} timing={frameTiming(t.transitionFrames)} presentation={stagger(spec)} />, seq];
          })}
        </TransitionSeries>
        <SubtitleTrackV2 cues={subCues} />
        <SourceTrackV2 cues={srcCues} asOf={asOf} />
        {/* 人聲：最外層，依絕對幀擺放（不受轉場重疊影響）。有 voice.wav（整條 loudnorm 的人聲軌）就只播這一條 */}
        {timeline.voice ? <Audio src={staticFile(timeline.voice.file)} /> : timeline.scenes.filter((t) => t.audio).map((t) => (
          <Sequence key={`${t.id}-audio`} from={t.audioFrame} durationInFrames={Math.ceil(t.audioSec * FPS) + 1} name={`${t.id}-audio`} layout="none">
            <Audio src={staticFile(t.audio as string)} />
          </Sequence>
        ))}
        <HeaderV2 />
      </AbsoluteFill>
    </StyleV2Context.Provider>
  );
};

export const Video: React.FC<Script> = (props) => {
  if (isV2(props)) return <VideoV2 {...props} timeline={props.timeline as TimelineV2} />;
  return <VideoV1 {...props} />;
};

const VideoV1: React.FC<Script> = ({ scenes, asOf, audio, timeline }) => {
  const starts = sceneStarts(scenes, timeline);
  return (
    <AbsoluteFill>
      <Background />
      {scenes.map((s, i) => {
        const tl = (timeline?.scenes as SceneTiming[] | undefined)?.find((x) => x.id === s.id);
        return (
          <Sequence key={s.id} from={starts[i]} durationInFrames={sceneFrames(s, timeline)} name={s.id}>
            <SceneView scene={s} asOf={asOf} timing={tl} />
            {tl?.audio ? (
              <Sequence from={Math.round(tl.leadSec * FPS)} name={`${s.id}-audio`}>
                <Audio src={staticFile(tl.audio)} />
              </Sequence>
            ) : null}
          </Sequence>
        );
      })}
      <Header />
      <ProgressBar />
      {audio && !timeline ? <Audio src={staticFile(audio)} /> : null}
    </AbsoluteFill>
  );
};

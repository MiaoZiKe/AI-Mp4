import React from "react";
import { AbsoluteFill, Audio, Easing, Sequence, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { TransitionSeries } from "@remotion/transitions";
import type { TransitionPresentation, TransitionPresentationComponentProps, TransitionTiming } from "@remotion/transitions";
import type { Scene, SceneTiming, SceneTimingV2, Script, TimelineV2, TransitionSpec } from "./types";
import { C, FPS, SAFE } from "./theme";
import { isV2, isV3, sceneFrames, sceneStarts } from "./timing";
import { VideoV3 } from "./components/v3/Stage";
import { VideoUI } from "./components/ui/UiVideo";
import { VideoChat } from "./components/chat/ChatVideo";
import { VideoChart } from "./components/chartlead/ChartVideo";
import { VideoThree } from "./components/three/ThreeVideo";
import { VideoType } from "./components/ai-type/TypeVideo";
import { VideoSplit } from "./components/ai-split/SplitVideo";
import { VideoSketch } from "./components/ai-sketch/SketchVideo";
import { VideoBright } from "./components/ai-bright/BrightVideo";
import { VideoIso } from "./components/ai-iso/IsoVideo";
import { VideoEditorial } from "./components/ai-editorial/EditorialVideo";
import { VideoTalk } from "./components/talk/TalkVideo";
import { VideoTanqing } from "./components/tanqing/TanqingVideo";
import { StyleV2Context } from "./style";
import {
  Background, Header, Subtitle, SourceFooter, EndCard, TermCard, FlowRow, CompareSplit,
  BigNumber, SeatBar, IconGrid, ImpactCard, SubtitleTrack, SourceTrack,
} from "./components";
import { EASE, tween } from "./components/anim";
import { CueContext, cameraMove, type CameraSpec } from "./cue";
import { BackgroundV2, HeaderV2, SceneBackdropV2 } from "./components/v2/base";
import { HookTitle } from "./components/v2/HookTitle";
import { BigNumberV2 } from "./components/v2/BigNumber";
import { CompareSplitV2, FlowRowV2, IconGridV2, ImpactCardV2, TermCardV2 } from "./components/v2/Cards";
import { CtaCard, EndCardV2 } from "./components/v2/Closing";
import { KineticText } from "./components/v2/KineticText";
import { LineChart } from "./components/v2/LineChart";
import { UnitGrid } from "./components/v2/UnitGrid";
import { DepthStage } from "./components/v2/DepthStage";
import { BarChart } from "./components/v2/BarChart";
import { SubtitleTrackV2, SourceTrackV2 } from "./components/v2/Tracks";
import { LAYOUT_V2, THEME_V2, FONT_ZH, accentV2 } from "./theme";

const REGISTRY: Record<string, React.FC<any>> = {
  TermCard, FlowRow, CompareSplit, BigNumber, SeatBar, IconGrid, ImpactCard, EndCard,
};

/** styleVersion 2（A 奶油編輯）元件；SeatBar 尚無 v2 版（validate 會擋） */
const REGISTRY_V2: Record<string, React.FC<any>> = {
  HookTitle, TermCard: TermCardV2, FlowRow: FlowRowV2, CompareSplit: CompareSplitV2, BigNumber: BigNumberV2, IconGrid: IconGridV2, ImpactCard: ImpactCardV2, EndCard: EndCardV2, CtaCard,
  KineticText, LineChart, UnitGrid, DepthStage, BarChart,
};
/** 自帶背景面板（背景層不放米色色塊）的元件 */
const OWN_BLOCK = new Set(["DepthStage"]);

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
const ENTER_LEAD = 12; // v3：6→12，轉場進場段（第 3–8 幀）時元件已排好版，轉場每一幀內容區不掉空
const SceneBodyV2: React.FC<{ scene: Scene; lead: number; timing: SceneTimingV2; exitAbs: number }> = ({ scene, lead, timing, exitAbs }) => {
  const Comp = REGISTRY_V2[scene.component];
  if (!Comp) throw new Error(`Unknown component (styleVersion 2): ${scene.component}`);
  const isEnd = scene.component === "EndCard";
  // P0-8：cue 絕對幀 → 元件本地幀（元件時間比 Sequence 快 lead 幀）
  const loc = (abs: number) => abs - timing.startFrame + lead;
  const cue = {
    // 關鍵詞被唸到的幀也當成 beat（id 以 kw: 開頭，只給鏡頭推拉用，元件的 at 不會引用到）
    cues: Object.fromEntries([...(timing.cues ?? []).filter((c) => c.frame !== null).map((c) => [c.id, loc(c.frame as number)]), ...(timing.keywords ?? []).map((k) => [`kw:${k.text}`, loc(k.start)])]),
    exit: loc(exitAbs), voiceStart: loc(timing.voiceStartFrame), voiceEnd: loc(timing.voiceEndFrame),
    // 關鍵詞微節拍：念到關鍵詞／cue 詞時，主視覺裡同一個詞（KwText）螢光筆劃過
    words: [...(timing.keywords ?? []).map((k) => ({ text: k.text, frame: loc(k.start) })), ...(timing.cues ?? []).filter((q) => q.frame !== null && q.text).map((q) => ({ text: q.text as string, frame: loc(q.frame as number) }))]
      .filter((w) => w.text.replace(/\s/g, "").length >= 2),
  };
  // 片尾卡沒有字幕與出處：主視覺一路撐到出處帶底（SOURCE_BOTTOM）
  const top = LAYOUT_V2.CONTENT_TOP, bottom = isEnd ? LAYOUT_V2.SOURCE_BOTTOM : LAYOUT_V2.CONTENT_BOTTOM;
  const frame = useCurrentFrame();
  const bg = scene.bg ?? {};
  // v3：大字水印只在鉤子幕（kinetic 幕自帶水印）；其他幕不放，避免穿過內容區、佔掉「同屏三樣」的名額
  const mark = scene.component === "HookTitle" ? bg.mark ?? scene.keywords?.[0] : undefined;
  return (
    <AbsoluteFill>
      {/* 背景層：色塊＋出血色帶＋大字水印（視差 0.2） */}
      <SceneBackdropV2 mark={mark} block={!OWN_BLOCK.has(scene.component)} color={bg.color ?? scene.props?.color ?? "pink"} fadeOut={tween(frame + lead, cue.exit - 12, 12, EASE.exit)} />
      {/* 主視覺：撐滿主視覺區（952×920），元件自行把內容分布到整個高度 */}
      <div style={{ position: "absolute", left: LAYOUT_V2.X, right: LAYOUT_V2.X, top, height: bottom - top, display: "flex", alignItems: "stretch", justifyContent: "center" }}>
        <Sequence from={-lead} layout="none" name={`${scene.id}-content`}>
          <CueContext.Provider value={cue}>
            <CameraV2 cue={cue} cam={scene.camera}><Comp {...scene.props} /></CameraV2>
          </CueContext.Provider>
        </Sequence>
      </div>
    </AbsoluteFill>
  );
};

/** 主視覺鏡頭（v3 分級）：預設不動；scene.camera 指定的幕在 cue 推／拉／橫移一次（cameraMove），本地幀由外層 Sequence 提供 */
const CameraV2: React.FC<{ cue: React.ContextType<typeof CueContext>; cam?: CameraSpec; children: React.ReactNode }> = ({ cue, cam, children }) => {
  const f = useCurrentFrame();
  const m = cameraMove(f, cue, cam);
  return <div style={{ display: "flex", alignItems: "stretch", justifyContent: "center", transform: m.scale !== 1 || m.x ? `translateX(${m.x.toFixed(1)}px) scale(${m.scale.toFixed(4)})` : undefined, transformOrigin: "50% 45%" }}>{children}</div>;
};

/** 轉場進度＝幀 / 總幀數（線性），曲線在 presentation 裡依 exit／enter 幀區間計算 */
const frameTiming = (frames: number): TransitionTiming => ({
  getDurationInFrames: () => frames,
  getProgress: ({ frame }) => Math.min(1, Math.max(0, frame / frames)),
});
const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const outQuad = (u: number) => 1 - (1 - u) * (1 - u);
/**
 * v3 語意轉場（type 寫在 script.json，由內容決定，不輪替）：
 *  fade／carry：出場上移 40px 加速淡出（EASE.exit）、進場從下方 20px 升起淡入（亞里：進 0.3 秒 20px、退上移 40px）
 *  push：上推（整幕往上推走 120px 先淡出，新幕從下方 120px 推上來）
 *  slide：水平版上推
 *  flip：反轉＝明暗翻轉：海軍藍色塊由下往上蓋過主視覺區（出場），再由下往上掀開（進場）
 */
const DIST: Record<string, { exit: number; enter: number }> = { fade: { exit: -40, enter: 20 }, carry: { exit: -40, enter: 20 }, push: { exit: -120, enter: 120 }, slide: { exit: -120, enter: 120 }, flip: { exit: -24, enter: 24 } };

/** flip 用的海軍藍色塊：只蓋主視覺區（330–1250），上下緣位置 0→1 */
const FlipBlock: React.FC<{ top: number; bottom: number }> = ({ top, bottom }) => {
  const y0 = LAYOUT_V2.CONTENT_TOP, y1 = LAYOUT_V2.CONTENT_BOTTOM, h = y1 - y0;
  const t = Math.round(y0 + h * top), b = Math.round(y0 + h * bottom);
  if (b - t < 1) return null;
  return <div style={{ position: "absolute", left: LAYOUT_V2.X, right: 1080 - LAYOUT_V2.X_RIGHT, top: t, height: b - t, background: THEME_V2.text, borderRadius: LAYOUT_V2.BLOCK_RADIUS / 2 }} />;
};

const Stagger: React.FC<TransitionPresentationComponentProps<TransitionSpec>> = ({ children, presentationDirection, presentationProgress, passedProps }) => {
  const k = presentationProgress * passedProps.frames;
  const d = DIST[passedProps.type] ?? DIST.fade;
  let opacity: number, shift: number, block: React.ReactNode = null;
  if (presentationDirection === "exiting") {
    const [a, b] = passedProps.exit;
    const u = clamp01((k - a) / Math.max(1, b - a));
    opacity = 1 - u * u * u; // v3：出場 ease-in(cubic)（先撐住再走），轉場中段內容區不掉空
    shift = d.exit * EASE.exit(u);
    // flip：色塊上緣從底部升到頂部（蓋住出場畫面）
    if (passedProps.type === "flip") { opacity = 1; shift = 0; block = <FlipBlock top={1 - EASE.move(u)} bottom={1} />; }
  } else {
    const [a, b] = passedProps.enter;
    const u = clamp01((k - a) / Math.max(1, b - a));
    opacity = outQuad(u);
    shift = d.enter * (1 - outQuad(u));
    // flip：新畫面在色塊後面，色塊下緣從底部升到頂部（掀開）
    if (passedProps.type === "flip") { opacity = k >= a ? 1 : 0; shift = 0; block = k >= a ? <FlipBlock top={0} bottom={1 - EASE.move(u)} /> : null; }
  }
  const px = Math.round(shift);
  const transform = passedProps.type === "slide" ? `translateX(${px}px)` : `translateY(${px}px)`;
  return <AbsoluteFill><AbsoluteFill style={{ opacity, transform }}>{children}</AbsoluteFill>{block}</AbsoluteFill>;
};
const stagger = (spec: TransitionSpec): TransitionPresentation<TransitionSpec> => ({ component: Stagger, props: spec });

/**
 * carry（版面對位 match cut）：上一幕的主體以貼紙形式出現在主視覺區右上（固定座標），跨過切點時完全不透明、座標不變，
 * 進入下一幕 hold 幀後才上移 40px 淡出。依絕對幀畫在 TransitionSeries 外層（不受兩幕淡入淡出影響）。
 */
export const CARRY_BOX = { right: 1080 - LAYOUT_V2.X_RIGHT + 8, top: LAYOUT_V2.CONTENT_TOP + 6 } as const;
const CarryLayer: React.FC<{ items: { text: string; color?: string; inAt: number; outAt: number }[] }> = ({ items }) => {
  const f = useCurrentFrame();
  return (
    <>
      {items.map((c, i) => {
        if (f < c.inAt - 1 || f > c.outAt + 16) return null;
        const ein = tween(f, c.inAt, 9, EASE.enter), eout = tween(f, c.outAt, 15, EASE.exit);
        const a = accentV2(c.color);
        return (
          <div key={i} style={{ position: "absolute", right: CARRY_BOX.right, top: CARRY_BOX.top, opacity: ein * (1 - eout), transform: `translateY(${Math.round(20 * (1 - ein) - 40 * eout)}px) rotate(2deg)`,
            background: a.fill, color: THEME_V2.onAccent, fontFamily: FONT_ZH, fontSize: 44, fontWeight: 900, padding: "10px 26px", borderRadius: THEME_V2.radiusTag, boxShadow: THEME_V2.shadow, whiteSpace: "nowrap", zIndex: 20 }}>{c.text}</div>
        );
      })}
    </>
  );
};

const VideoV2: React.FC<Script & { timeline: TimelineV2 }> = ({ scenes, asOf, timeline }) => {
  const byId = Object.fromEntries(timeline.scenes.map((x) => [x.id, x]));
  const ordered = scenes.filter((s) => byId[s.id]);
  const subCues = ordered.filter((s) => byId[s.id].subtitleWindow).map((s) => {
    const t = byId[s.id];
    return { id: s.id, en: s.subtitle.en, keywords: s.keywords, window: t.subtitleWindow as [number, number], phrases: t.lines, keywords_at: t.keywords };
  });
  // carry：貼紙在上一幕 at 的 cue（預設最後一個 cue）出現，本幕 hold 幀（預設 45）後退場
  const carries = ordered.flatMap((s, i) => {
    const t = byId[s.id], p = byId[ordered[i - 1]?.id];
    const spec = t.transition?.type === "carry" ? t.transition.carry : undefined;
    if (!spec || !p) return [];
    const pc = (p.cues ?? []).filter((q) => q.frame !== null);
    const at = pc.find((q) => q.id === spec.at)?.frame ?? pc[pc.length - 1]?.frame ?? t.startFrame - 30;
    return [{ text: spec.text, color: spec.color, inAt: Math.min(at as number, t.startFrame - 12), outAt: t.startFrame + t.transitionFrames + (spec.hold ?? 45) }];
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
        <CarryLayer items={carries} />
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
  if (isV3(props) && props.stage === "chart") return <VideoChart {...props} timeline={props.timeline as TimelineV2} />;
  if (isV3(props) && props.stage === "chat") return <VideoChat {...props} timeline={props.timeline as TimelineV2} />;
  if (isV3(props) && props.stage === "three") return <VideoThree {...props} timeline={props.timeline as TimelineV2} />;
  if (isV3(props) && props.stage === "sketch") return <VideoSketch {...props} timeline={props.timeline as TimelineV2} />;
  if (isV3(props) && props.stage === "type") return <VideoType {...props} timeline={props.timeline as TimelineV2} />;
  if (isV3(props) && props.stage === "split") return <VideoSplit {...props} timeline={props.timeline as TimelineV2} />;
  if (isV3(props) && props.stage === "editorial") return <VideoEditorial {...props} timeline={props.timeline as TimelineV2} />;
  if (isV3(props) && props.stage === "iso") return <VideoIso {...props} timeline={props.timeline as TimelineV2} />;
  if (isV3(props) && props.stage === "bright") return <VideoBright {...props} timeline={props.timeline as TimelineV2} />;
  if (isV3(props) && props.stage === "ui") return <VideoUI {...props} timeline={props.timeline as TimelineV2} />;
  if (isV3(props) && props.stage === "tanqing") return <VideoTanqing {...props} timeline={props.timeline as TimelineV2} />;
  if (isV3(props) && props.stage === "talk") return <VideoTalk {...props} timeline={props.timeline as TimelineV2} />;
  if (isV3(props)) return <VideoV3 {...props} timeline={props.timeline as TimelineV2} />;
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

import React from "react";
import { AbsoluteFill, Audio, Easing, Sequence, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import type { Scene, SceneTiming, Script } from "./types";
import { C, FPS, SAFE } from "./theme";
import { sceneFrames, sceneStarts } from "./timing";
import {
  Background, Header, Subtitle, SourceFooter, EndCard, TermCard, FlowRow, CompareSplit,
  BigNumber, SeatBar, IconGrid, ImpactCard,
} from "./components";

const REGISTRY: Record<string, React.FC<any>> = {
  TermCard, FlowRow, CompareSplit, BigNumber, SeatBar, IconGrid, ImpactCard, EndCard,
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

export const Video: React.FC<Script> = ({ scenes, asOf, audio, timeline }) => {
  const starts = sceneStarts(scenes, timeline);
  return (
    <AbsoluteFill>
      <Background />
      {scenes.map((s, i) => {
        const tl = timeline?.scenes?.find((x) => x.id === s.id);
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

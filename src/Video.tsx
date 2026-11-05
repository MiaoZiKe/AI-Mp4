import React from "react";
import { AbsoluteFill, Audio, Sequence, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import type { Scene, SceneTiming, Script } from "./types";
import { FPS, SAFE } from "./theme";
import { sceneFrames, sceneStarts } from "./timing";
import {
  Background, Header, Subtitle, SourceFooter, EndCard, TermCard, FlowRow, CompareSplit,
  BigNumber, SeatBar, IconGrid, ImpactCard,
} from "./components";

const REGISTRY: Record<string, React.FC<any>> = {
  TermCard, FlowRow, CompareSplit, BigNumber, SeatBar, IconGrid, ImpactCard, EndCard,
};

const FADE = Math.round(0.3 * FPS);

const SceneView: React.FC<{ scene: Scene; asOf: string; timing?: SceneTiming }> = ({ scene, asOf, timing }) => {
  const f = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const opacity = interpolate(f, [0, FADE, durationInFrames - FADE, durationInFrames], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const Comp = REGISTRY[scene.component];
  if (!Comp) throw new Error(`Unknown component: ${scene.component}`);
  const isEnd = scene.component === "EndCard";
  // 配音時間軸：字幕每行、關鍵詞在被唸到時才出現／上色
  const lineStarts = timing ? timing.lines.map((l) => Math.round(l.start * FPS)) : undefined;
  const keywordStarts = timing ? Object.fromEntries(timing.keywords.map((k) => [k.text, Math.round(k.start * FPS)])) : undefined;
  return (
    <AbsoluteFill style={{ opacity }}>
      <div style={{ position: "absolute", left: SAFE.x, right: SAFE.x, top: 330, height: isEnd ? 1370 : 1030, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Comp {...scene.props} />
      </div>
      {!isEnd && <Subtitle zh={scene.subtitle.zh} en={scene.subtitle.en} keywords={scene.keywords} lineStarts={lineStarts} keywordStarts={keywordStarts} />}
      {!isEnd && <SourceFooter sources={scene.sources} asOf={asOf} />}
    </AbsoluteFill>
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
      {audio && !timeline ? <Audio src={staticFile(audio)} /> : null}
    </AbsoluteFill>
  );
};

import React from "react";
import { AbsoluteFill, Audio, Sequence, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import type { Scene, Script } from "./types";
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

const SceneView: React.FC<{ scene: Scene; asOf: string }> = ({ scene, asOf }) => {
  const f = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const opacity = interpolate(f, [0, FADE, durationInFrames - FADE, durationInFrames], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const Comp = REGISTRY[scene.component];
  if (!Comp) throw new Error(`Unknown component: ${scene.component}`);
  const isEnd = scene.component === "EndCard";
  return (
    <AbsoluteFill style={{ opacity }}>
      <div style={{ position: "absolute", left: SAFE.x, right: SAFE.x, top: 330, height: isEnd ? 1370 : 1030, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Comp {...scene.props} />
      </div>
      {!isEnd && <Subtitle zh={scene.subtitle.zh} en={scene.subtitle.en} keywords={scene.keywords} />}
      {!isEnd && <SourceFooter sources={scene.sources} asOf={asOf} />}
    </AbsoluteFill>
  );
};

export const Video: React.FC<Script> = ({ scenes, asOf, audio }) => {
  const starts = sceneStarts(scenes);
  return (
    <AbsoluteFill>
      <Background />
      {scenes.map((s, i) => (
        <Sequence key={s.id} from={starts[i]} durationInFrames={sceneFrames(s)} name={s.id}>
          <SceneView scene={s} asOf={asOf} />
        </Sequence>
      ))}
      <Header />
      {audio ? <Audio src={staticFile(audio)} /> : null}
    </AbsoluteFill>
  );
};

import React from "react";
import { Composition } from "remotion";
import { Video } from "./Video";
import { Cover } from "./Cover";
import { BackgroundStatic, GlowBlob } from "./components/Background";
import { BackgroundStaticV2 } from "./components/v2/base";
import { FPS, H, W } from "./theme";
import { totalFrames } from "./timing";
import type { Script } from "./types";
import { CaffAnim } from "./components/ai-iso/CaffAnim";
import { useCurrentFrame } from "remotion";
import { CaffLogoStill } from "./components/ai-iso/CaffLogoV2";
import { CpiVideo, type CpiProps } from "./components/cpi/CpiVideo";

const placeholder: Script = {
  slug: "demo", title: "Demo", asOf: "—",
  scenes: [{ id: "end", narration: "一支講透一件事", subtitle: { zh: "一支講透一件事", en: "" }, keywords: [], component: "EndCard", props: {}, sources: [] }],
};

export const Root: React.FC = () => (
  <>
    <Composition id="Video" component={Video as any} width={W} height={H} fps={FPS} durationInFrames={150}
      defaultProps={placeholder as any}
      calculateMetadata={({ props }) => { const p = props as unknown as Script; return { durationInFrames: totalFrames(p.scenes, p.timeline) }; }} />
    <Composition id="Cover" component={Cover as any} width={W} height={H} fps={FPS} durationInFrames={1} defaultProps={placeholder as any} />
    <Composition id="CaffLogoStill" component={CaffLogoStill as any} width={1080} height={1920} fps={FPS} durationInFrames={1} defaultProps={{ variant: "A", layout: "square" } as any} />
    <Composition id="CaffLogoClipTall" component={(() => { const C: React.FC = () => <CaffAnim f={useCurrentFrame()} kw={false} format="tall" />; return C; })()} width={1080} height={1920} fps={FPS} durationInFrames={116} />
    <Composition id="CaffLogoClipSquare" component={(() => { const C: React.FC = () => <CaffAnim f={useCurrentFrame()} kw={false} format="square" />; return C; })()} width={1080} height={1080} fps={FPS} durationInFrames={116} />
    <Composition id="BackgroundStatic" component={BackgroundStatic} width={W} height={H} fps={FPS} durationInFrames={1} />
    <Composition id="BackgroundStaticV2" component={BackgroundStaticV2} width={W} height={H} fps={FPS} durationInFrames={1} />
    {/* CPI 實測短片：使用者自備旁白，props 由 scripts/cpi/run.mjs 對齊後產生；長度＝props.durationInFrames（音檔長度） */}
    <Composition id="CpiVideo" component={CpiVideo as any} width={W} height={H} fps={FPS} durationInFrames={600}
      defaultProps={{ durationInFrames: 600, segs: [], lines: [] } as CpiProps as any}
      calculateMetadata={({ props }) => ({ durationInFrames: (props as unknown as CpiProps).durationInFrames })} />
    <Composition id="GlowBlob" component={GlowBlob} width={900} height={700} fps={FPS} durationInFrames={1} />
  </>
);

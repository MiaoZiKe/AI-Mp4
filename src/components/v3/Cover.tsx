// v3 封面：和正片同一張桌面、同一套紙片。script.json 的 cover＝{ camera, items }，寫法和 PaperScene 的 props 一樣
// （不需要 at／cue：封面只有第 0 幀，全部紙片都已貼好、麥克筆底全畫）。個人頁 3:4（y 240–1680）與 1:1（y 420–1500）裁切要都看得到主標。
import React, { useMemo } from "react";
import { AbsoluteFill } from "remotion";
import type { Script } from "../../types";
import { AssetContext, makeCtx } from "./assets";
import { buildStage, type PaperSceneProps } from "./engine";
import { PaperStage } from "./Stage";
import { HeaderV3 } from "./Tracks";

export const CoverV3: React.FC<Script> = (props) => {
  const { cover, slug, v3, skin, channel } = props;
  // coverCrop＝裁切後的高度（still.mjs 渲 3:4／1:1 版時傳入）：頁首移到裁切範圍的上緣內 28px
  const crop = (props as any).coverCrop as number | undefined;
  const stage = useMemo(() => {
    const props = (cover ?? {}) as PaperSceneProps;
    const scene = { id: "cover", component: "PaperScene", props: { camera: { to: [540, 960, 1] }, ...props, items: (props.items ?? []).map((it) => ({ until: "end", ...it })) } } as any;
    const t = { id: "cover", startFrame: 0, durationFrames: 1, voiceStartFrame: 0, voiceEndFrame: 0, cues: [] } as any;
    return buildStage([scene], { scenes: [t], totalFrames: 1 } as any);
  }, [cover]);
  const ctx = useMemo(() => makeCtx({ slug, v3, skin, channel }, false), [slug, v3, skin, channel]);
  return (
    <AssetContext.Provider value={ctx}>
      <AbsoluteFill>
        <PaperStage stage={stage} />
        <HeaderV3 dark={ctx.theme.deskDark} top={crop ? (1920 - crop) / 2 + 28 : undefined} />
      </AbsoluteFill>
    </AssetContext.Provider>
  );
};

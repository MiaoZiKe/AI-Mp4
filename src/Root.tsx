import React from "react";
import { Composition } from "remotion";
import { Video } from "./Video";
import { Cover } from "./Cover";
import { FPS, H, W } from "./theme";
import { totalFrames } from "./timing";
import type { Script } from "./types";

const placeholder: Script = {
  slug: "demo", title: "Demo", asOf: "—",
  scenes: [{ id: "end", narration: "一支講透一件事", subtitle: { zh: "一支講透一件事", en: "" }, keywords: [], component: "EndCard", props: {}, sources: [] }],
};

export const Root: React.FC = () => (
  <>
    <Composition id="Video" component={Video as any} width={W} height={H} fps={FPS} durationInFrames={150}
      defaultProps={placeholder as any}
      calculateMetadata={({ props }) => ({ durationInFrames: totalFrames((props as unknown as Script).scenes) })} />
    <Composition id="Cover" component={Cover as any} width={W} height={H} fps={FPS} durationInFrames={1} defaultProps={placeholder as any} />
  </>
);

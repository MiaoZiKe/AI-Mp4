import React from "react";
import { Composition, Still } from "remotion";
import script from "../videos/us-midterm-2026/script.json";
import { Cover } from "./Cover";
import { FPS, H, W } from "./theme";
import { totalFrames } from "./timing";
import { Script, VideoProps } from "./types";
import { Video } from "./Video";

const defaultProps: VideoProps = { script: script as unknown as Script };

export const Root: React.FC = () => (
  <>
    <Composition
      id="Main"
      component={Video}
      width={W}
      height={H}
      fps={FPS}
      durationInFrames={totalFrames(defaultProps)}
      defaultProps={defaultProps}
      calculateMetadata={({ props }) => ({ durationInFrames: totalFrames(props) })}
    />
    <Still id="Cover" component={Cover} width={W} height={H} defaultProps={defaultProps} />
  </>
);

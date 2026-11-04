import React from "react";
import { AbsoluteFill, Audio, interpolate, Sequence, staticFile, useCurrentFrame } from "remotion";
import { BlueprintBackground, Header, SourceFooter, Subtitle } from "./components";
import { FOCUS, SCENES } from "./scenes/Scenes";
import { FADE, sceneFrames } from "./timing";
import { Scene, Script, VideoProps } from "./types";

const SceneShell: React.FC<{ scene: Scene; script: Script; no: number; duration: number; voice?: string }> = ({ scene, script, no, duration, voice }) => {
  const frame = useCurrentFrame();
  const Comp = SCENES[scene.component];
  const fade = interpolate(frame, [0, FADE, duration - FADE, duration], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  // 推鏡：整幕緩慢推近焦點
  const zoom = interpolate(frame, [0, duration], [1, 1.04], { extrapolateRight: "clamp" });
  const [fx, fy] = FOCUS[scene.component] ?? [540, 800];
  const src = scene.sources.length ? `${scene.sources.join("、")} ｜ 資料截至 ${script.asOf}` : "";
  return (
    <AbsoluteFill style={{ opacity: fade }}>
      <AbsoluteFill style={{ transform: `scale(${zoom})`, transformOrigin: `${fx}px ${fy}px` }}>
        {Comp ? <Comp scene={scene} script={script} no={no} duration={duration} /> : null}
      </AbsoluteFill>
      {src && <SourceFooter text={src} />}
      <Subtitle zh={scene.subtitle_zh} en={scene.subtitle_en} keywords={scene.keywords} duration={duration} />
      {voice && <Audio src={staticFile(voice)} />}
    </AbsoluteFill>
  );
};

export const Video: React.FC<VideoProps> = (props) => {
  const { script } = props;
  const frames = sceneFrames(props);
  let from = 0;
  return (
    <AbsoluteFill>
      <BlueprintBackground sheet={`DWG. ${script.slug.toUpperCase()}`} />
      <Header channel={script.channel} series={script.series} />
      {script.scenes.map((s, i) => {
        const start = from;
        from += frames[i];
        return (
          <Sequence key={s.id} from={start} durationInFrames={frames[i]} name={s.id}>
            <SceneShell scene={s} script={script} no={i + 1} duration={frames[i]} voice={props.voice?.[s.id]} />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};

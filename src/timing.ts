import { FPS } from "./theme";
import { Scene, VideoProps } from "./types";

export const FADE = 9; // 0.3 秒淡入淡出

const countChars = (s: string) => Array.from(s.replace(/[\s，。、：；！？「」（）,.:;!?()%\/]/g, "")).length;

/** 無配音：每秒約 5 字 + 1 秒，夾在 5–10 秒 */
export const estimateFrames = (scene: Scene) => {
  const n = scene.subtitle_zh.map(countChars).reduce((a, b) => a + b, 0);
  const sec = Math.min(10, Math.max(5, n / 5 + 1));
  return Math.round(sec * FPS);
};

export const sceneFrames = (props: VideoProps) =>
  props.script.scenes.map((s) => props.durations?.[s.id] ?? estimateFrames(s));

export const totalFrames = (props: VideoProps) => sceneFrames(props).reduce((a, b) => a + b, 0);

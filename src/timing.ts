import type { Scene } from "./types";
import { FPS } from "./theme";
/** 無配音時：每秒約 5 字再加 1 秒，限制在 5–10 秒 */
export const sceneSeconds = (s: Scene) => {
  if (s.durationSec) return s.durationSec;
  const chars = s.narration.replace(/[\s，。、！？：；「」（）,.!?]/g, "").length;
  return Math.min(10, Math.max(5, Math.ceil(chars / 5) + 1));
};
export const sceneFrames = (s: Scene) => Math.round(sceneSeconds(s) * FPS);
export const sceneStarts = (scenes: Scene[]) => {
  let t = 0;
  return scenes.map((s) => { const st = t; t += sceneFrames(s); return st; });
};
export const totalFrames = (scenes: Scene[]) => scenes.reduce((a, s) => a + sceneFrames(s), 0);

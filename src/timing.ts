import type { Scene, Timeline } from "./types";
import { FPS } from "./theme";

const findTiming = (s: Scene, t?: Timeline | null) => t?.scenes?.find((x) => x.id === s.id);

/** 有 timeline（配音）→ 用配音長度；否則 durationSec；否則每秒約 5 字再加 1 秒，限制在 5–10 秒 */
export const sceneSeconds = (s: Scene, t?: Timeline | null) => {
  const tl = findTiming(s, t);
  if (tl) return tl.durationSec;
  if (s.durationSec) return s.durationSec;
  const chars = s.narration.replace(/[\s，。、！？：；「」（）,.!?]/g, "").length;
  return Math.min(10, Math.max(5, Math.ceil(chars / 5) + 1));
};
export const sceneFrames = (s: Scene, t?: Timeline | null) => Math.round(sceneSeconds(s, t) * FPS);
export const sceneStarts = (scenes: Scene[], t?: Timeline | null) => {
  let acc = 0;
  return scenes.map((s) => { const st = acc; acc += sceneFrames(s, t); return st; });
};
export const totalFrames = (scenes: Scene[], t?: Timeline | null) => scenes.reduce((a, s) => a + sceneFrames(s, t), 0);

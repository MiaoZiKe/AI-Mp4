import { spring, interpolate } from "remotion";
import { FPS } from "../theme";
/** 淡入 + 上移（spring） */
export const rise = (frame: number, delay = 0, dist = 40) => {
  const s = spring({ frame: frame - delay, fps: FPS, config: { damping: 200, mass: 0.8 } });
  return { opacity: s, transform: `translateY(${(1 - s) * dist}px)` } as const;
};
export const progress = (frame: number, delay: number, dur: number) =>
  interpolate(frame, [delay, delay + dur], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
/** 固定 seed 的偽隨機 */
export const seeded = (seed: number) => {
  let s = seed >>> 0;
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
};

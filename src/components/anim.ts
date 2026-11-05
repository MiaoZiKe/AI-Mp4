import { spring, interpolate, Easing } from "remotion";
import { FPS } from "../theme";

/** 淡入 + 上移（spring，帶一點過衝，元素像「彈」進來） */
export const rise = (frame: number, delay = 0, dist = 40) => {
  const s = spring({ frame: frame - delay, fps: FPS, config: { damping: 14, stiffness: 110, mass: 0.7 } });
  return { opacity: Math.min(1, s * 1.15), transform: `translateY(${(1 - s) * dist}px)` } as const;
};

/** 彈出：從 from 放大、過衝後回到 1（給關鍵詞、數字、圖示用） */
export const pop = (frame: number, delay = 0, from = 0.6) => {
  const s = spring({ frame: frame - delay, fps: FPS, config: { damping: 10, stiffness: 160, mass: 0.6 } });
  return from + (1 - from) * s;
};

/** 0→1 進度（ease-out，開頭快、收尾慢，看起來比線性滑順） */
export const progress = (frame: number, delay: number, dur: number) =>
  interpolate(frame, [delay, delay + dur], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });

/** 0→1 線性進度 */
export const linear = (frame: number, delay: number, dur: number) =>
  interpolate(frame, [delay, delay + dur], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

/** 固定 seed 的偽隨機 */
export const seeded = (seed: number) => {
  let s = seed >>> 0;
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
};

import { interpolate, spring } from "remotion";
import { FPS } from "./theme";

export const sp = (frame: number, delay = 0, damping = 18, durationInFrames?: number) =>
  spring({ frame: frame - delay, fps: FPS, config: { damping, mass: 0.8 }, durationInFrames });

export const lin = (frame: number, from: number, to: number) =>
  interpolate(frame, [from, to], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

/** 固定 seed 的偽隨機（mulberry32） */
export const seeded = (seed: number) => {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

/** 打字機：回傳目前應顯示的字串 */
export const typewriter = (text: string, frame: number, delay = 0, cps = 18) => {
  const chars = Array.from(text);
  const n = Math.max(0, Math.floor(((frame - delay) / FPS) * cps));
  return chars.slice(0, Math.min(n, chars.length)).join("");
};

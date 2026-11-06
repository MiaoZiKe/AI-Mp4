import type { Scene, SceneTiming, Script, Timeline, TimelineV2 } from "./types";
import { FPS } from "./theme";

type AnyTimeline = Timeline | TimelineV2 | null | undefined;
/** 時間軸 v2（styleVersion 2）：timeline.json 是單一時間來源，只讀不算 */
export const isV2Timeline = (t: AnyTimeline): t is TimelineV2 => Boolean(t && (t as TimelineV2).version === 2);
export const isV2 = (s: Pick<Script, "styleVersion" | "timeline">) => s.styleVersion === 2 && isV2Timeline(s.timeline);

const findTiming = (s: Scene, t?: AnyTimeline) => (isV2Timeline(t) ? undefined : (t?.scenes as SceneTiming[] | undefined)?.find((x) => x.id === s.id));

/** v1：有 timeline（配音）→ 用配音長度；否則 durationSec；否則每秒約 5 字再加 1 秒，限制在 5–10 秒 */
export const sceneSeconds = (s: Scene, t?: AnyTimeline) => {
  const tl = findTiming(s, t);
  if (tl) return tl.durationSec;
  if (s.durationSec) return s.durationSec;
  const chars = s.narration.replace(/[\s，。、！？：；「」（）,.!?]/g, "").length;
  return Math.min(10, Math.max(5, Math.ceil(chars / 5) + 1));
};
export const sceneFrames = (s: Scene, t?: AnyTimeline) => Math.round(sceneSeconds(s, t) * FPS);
export const sceneStarts = (scenes: Scene[], t?: AnyTimeline) => {
  let acc = 0;
  return scenes.map((s) => { const st = acc; acc += sceneFrames(s, t); return st; });
};
/** 全片幀數：v2 直接用 timeline.totalFrames；v1 各幕相加 */
export const totalFrames = (scenes: Scene[], t?: AnyTimeline) =>
  isV2Timeline(t) ? t.totalFrames : scenes.reduce((a, s) => a + sceneFrames(s, t), 0);

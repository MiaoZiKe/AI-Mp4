// 亮色產品發表風（stage: "bright"）的時間模型：每幕 props.panel 是一塊「畫面」，下一塊進來時上一塊退場。
// 所有時間都寫 cue id 或 start｜voice｜end｜exit ±N 幀（可加「幕id:」前綴），這裡換成絕對幀；元件不手填秒數。
import type { Scene, TimelineV2 } from "../../types";

export type At = (spec: unknown, fb?: number) => number;
export type Panel = { kind: string; sid: string; in: number; out: number; p: Record<string, any>; at: At };

export const buildBright = (scenes: Scene[], tl: TimelineV2): Panel[] => {
  const by = Object.fromEntries(tl.scenes.map((x) => [x.id, x]));
  const ordered = scenes.filter((s) => by[s.id]);
  const resolve = (spec: unknown, sceneId: string, fb: number): number => {
    const r = /^(?:([\w-]+):)?([^\s+:-]+)([+-]\d+)?$/.exec(String(spec ?? ""));
    if (!r) return fb;
    const sid = r[1] ?? sceneId, t = by[sid];
    if (!t) return fb;
    const k = ordered.findIndex((s) => s.id === sid), next = ordered[k + 1] && by[ordered[k + 1].id];
    const base = r[2] === "start" ? t.startFrame : r[2] === "voice" ? t.voiceStartFrame : r[2] === "end" ? t.voiceEndFrame : r[2] === "exit" ? (next ? next.startFrame : tl.totalFrames) : (t.cues ?? []).find((q) => q.id === r[2])?.frame;
    return base === undefined || base === null ? fb : base + Number(r[3] ?? 0);
  };
  const panels: Panel[] = ordered.filter((s) => (s.props as any)?.panel).map((s, i) => {
    const p = s.props as Record<string, any>, t = by[s.id];
    return { kind: String(p.panel), sid: s.id, in: i === 0 ? 0 : resolve(p.in ?? "start", s.id, t.startFrame), out: 0, p, at: (spec, fb) => resolve(spec, s.id, fb ?? t.startFrame) };
  });
  panels.forEach((x, i) => { x.out = panels[i + 1]?.in ?? tl.totalFrames + 999; });
  return panels;
};

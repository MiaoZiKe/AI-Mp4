// 亮色雜誌編排（stage: "editorial"）的時間模型：每幕 props.page 是一頁版面，下一頁進來時上一頁退場。
// 所有時間都寫 cue id 或 start｜voice｜end｜exit ±N 幀（可加「幕id:」前綴），這裡換成絕對幀；元件不手填秒數。
import type { Scene, TimelineV2 } from "../../types";

export type At = (spec: unknown, fb?: number) => number;
export type Page = { kind: string; sid: string; in: number; out: number; p: Record<string, any>; at: At };

export const buildEditorial = (scenes: Scene[], tl: TimelineV2): Page[] => {
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
  const pages: Page[] = ordered.filter((s) => (s.props as any)?.page).map((s, i) => {
    const p = s.props as Record<string, any>, t = by[s.id];
    return { kind: String(p.page), sid: s.id, in: i === 0 ? 0 : resolve(p.in ?? "start+6", s.id, t.startFrame), out: 0, p, at: (spec, fb) => resolve(spec, s.id, fb ?? t.startFrame) };
  });
  pages.forEach((x, i) => { x.out = pages[i + 1]?.in ?? tl.totalFrames + 999; });
  return pages;
};

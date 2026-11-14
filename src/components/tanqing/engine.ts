// 談晴說礙頻道貼文風格（stage: "tanqing"）的時間模型：把各幕 props 攤平成「一頁一頁」的絕對幀。
// 一幕＝一頁（像輪播貼文的一張）：title（襯線大標）、figure（線稿圖形）、note（橘色一句）。
// 時間只寫 cue id 或 start｜voice｜end｜exit ±N 幀（可加「幕id:」前綴）；元件不手填秒數。
import type { Scene, TimelineV2 } from "../../types";

export type TqFigure = { type: string; at: number; times: Record<string, number>; [k: string]: any };
export type TqPage = {
  id: string; index: number; start: number; end: number;
  title: string[]; titleAt: number; note?: { text: string; at: number }; figure?: TqFigure; sources: string[];
};
export type TqModel = { total: number; pages: TqPage[] };

/** figure 裡以 At 結尾的欄位都是時間 */
const isAt = (k: string) => k === "at" || /At$/.test(k);

export const buildTanqing = (scenes: Scene[], tl: TimelineV2): TqModel => {
  const by = Object.fromEntries(tl.scenes.map((x) => [x.id, x]));
  const ordered = scenes.filter((s) => by[s.id]);
  const resolve = (spec: unknown, sceneId: string, fb: number): number => {
    if (spec === undefined || spec === null) return fb;
    const r = /^(?:([\w-]+):)?([^\s+:-]+)([+-]\d+)?$/.exec(String(spec));
    if (!r) return fb;
    const sid = r[1] ?? sceneId, t = by[sid];
    if (!t) return fb;
    const k = ordered.findIndex((s) => s.id === sid), next = ordered[k + 1] && by[ordered[k + 1].id];
    const base = r[2] === "start" ? t.startFrame : r[2] === "voice" ? t.voiceStartFrame : r[2] === "end" ? t.voiceEndFrame
      : r[2] === "exit" ? (next ? next.startFrame : tl.totalFrames) : (t.cues ?? []).find((q: any) => q.id === r[2])?.frame;
    return base === undefined || base === null ? fb : base + Number(r[3] ?? 0);
  };
  const pages: TqPage[] = ordered.map((s, i) => {
    const t = by[s.id], p = (s.props ?? {}) as Record<string, any>;
    const start = i === 0 ? 0 : t.startFrame;
    const next = ordered[i + 1] && by[ordered[i + 1].id];
    const fig = p.figure as Record<string, any> | undefined;
    const times: Record<string, number> = {};
    if (fig) for (const [k, v] of Object.entries(fig)) if (isAt(k)) times[k] = resolve(v, s.id, start);
    return {
      id: s.id, index: i, start, end: next ? next.startFrame : tl.totalFrames,
      title: Array.isArray(p.title) ? p.title : p.title ? [String(p.title)] : [],
      titleAt: resolve(p.titleAt, s.id, start),
      note: p.note ? { text: String(p.note.text ?? ""), at: resolve(p.note.at, s.id, start) } : undefined,
      figure: fig ? { ...fig, type: String(fig.type), at: times.at ?? start, times } : undefined,
      sources: s.sources ?? [],
    };
  });
  return { total: tl.totalFrames, pages };
};

/** 封面／靜態用：所有動作都已經做完的一頁 */
export const staticPage = (s: Scene, index = 0): TqPage => {
  const p = (s.props ?? {}) as Record<string, any>;
  const fig = p.figure as Record<string, any> | undefined;
  const times: Record<string, number> = {};
  if (fig) for (const k of Object.keys(fig)) if (isAt(k)) times[k] = -9999;
  return { id: s.id, index, start: -9999, end: 1e9, title: Array.isArray(p.title) ? p.title : [], titleAt: -9999, note: p.note ? { text: String(p.note.text ?? ""), at: -9999 } : undefined, figure: fig ? { ...fig, type: String(fig.type), at: -9999, times } : undefined, sources: s.sources ?? [] };
};

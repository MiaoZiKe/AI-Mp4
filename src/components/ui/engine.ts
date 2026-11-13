// 仿介面動畫的時間模型：把各幕 props 裡的 at（cue id 或 start｜voice｜end｜exit，可加 ±N 幀）換成絕對幀。
// 內容（要打什麼字、欄位名稱、回覆文字）全部來自 script.json；元件不手填秒數。
import type { Scene, TimelineV2 } from "../../types";

export type Slot = { label: string; en?: string; color: string; text: string; at: number };
export type UiModel = {
  total: number;
  hook?: { title: string; kicker?: string };
  draft?: { text: string; placeholder: string; t0: number; t1: number; empty?: { title: string; chips?: string[] } };
  send: number;
  reply?: { at: number; lines: string[]; stamp?: { text: string; at: number } };
  editor?: { at: number; title: string; guide?: { text: string; by?: string; at: number }; slotsAt: number; sweepAt: number; pulseAt: number };
  slots: Slot[];
  run?: { at: number; node: { text: string; sub?: string; at: number } };
  result?: { at: number; title: string; titleSlot?: number; lines: { t: string; slot?: number }[]; badge?: { text: string; at: number }; format?: { text: string; slot: number } };
};

export const buildModel = (scenes: Scene[], tl: TimelineV2): UiModel => {
  const by = Object.fromEntries(tl.scenes.map((x) => [x.id, x]));
  const m: UiModel = { total: tl.totalFrames, send: Infinity, slots: [] };
  scenes.forEach((s, i) => {
    const t = by[s.id];
    if (!t) return;
    const next = scenes[i + 1] && by[scenes[i + 1].id];
    const at = (spec: unknown, fb: number) => {
      const r = /^([^\s+-]+)([+-]\d+)?$/.exec(String(spec ?? ""));
      if (!r) return fb;
      const base = r[1] === "start" ? t.startFrame : r[1] === "voice" ? t.voiceStartFrame : r[1] === "end" ? t.voiceEndFrame : r[1] === "exit" ? (next ? next.startFrame : tl.totalFrames) : (t.cues ?? []).find((q) => q.id === r[1])?.frame;
      return base === undefined || base === null ? fb : base + Number(r[2] ?? 0);
    };
    const p = (s.props ?? {}) as Record<string, any>;
    if (p.hook) m.hook = p.hook;
    if (p.draft) m.draft = { text: p.draft.text, placeholder: p.draft.placeholder ?? "", t0: at(p.draft.typeAt, t.startFrame), t1: at(p.draft.typeEnd, t.voiceEndFrame), empty: p.draft.empty };
    if (p.send) m.send = at(p.send.at, t.startFrame);
    if (p.reply) m.reply = { at: at(p.reply.at, t.voiceStartFrame), lines: p.reply.lines ?? [], stamp: p.reply.stamp ? { text: p.reply.stamp.text, at: at(p.reply.stamp.at, t.voiceEndFrame) } : undefined };
    if (p.editor) m.editor = { at: at(p.editor.at, t.startFrame), title: p.editor.title ?? "", guide: p.editor.guide ? { ...p.editor.guide, at: at(p.editor.guide.at, t.voiceStartFrame) } : undefined, slotsAt: at(p.editor.slotsAt, t.voiceStartFrame), sweepAt: at(p.editor.sweepAt, Infinity), pulseAt: at(p.editor.pulseAt, Infinity) };
    for (const sl of p.slots ?? []) m.slots.push({ ...sl, at: at(sl.at, t.voiceStartFrame) });
    if (p.run) m.run = { at: at(p.run.at, t.voiceStartFrame), node: { ...p.run.node, at: at(p.run.node?.at, t.voiceStartFrame) } };
    if (p.result) m.result = { ...p.result, at: at(p.result.at, t.voiceStartFrame), badge: p.result.badge ? { text: p.result.badge.text, at: at(p.result.badge.at, t.voiceEndFrame) } : undefined };
  });
  return m;
};

export const mix = (a: number, b: number, t: number) => a + (b - a) * t;
/** 三次貝茲曲線上的點 */
export const bez = (p: number[][], t: number) => { const u = 1 - t; return [0, 1].map((k) => u * u * u * p[0][k] + 3 * u * u * t * p[1][k] + 3 * u * t * t * p[2][k] + t * t * t * p[3][k]); };

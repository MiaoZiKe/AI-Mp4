// 前後對照分割畫面（stage: "split"）的時間模型：把各幕 props 裡的 at（cue id 或 start｜voice｜end｜exit，可加 ±N 幀）換成絕對幀。
// 內容（要打什麼字、欄位名稱、回覆文字）全部來自 script.json；元件不手填秒數。
import type { Scene, TimelineV2 } from "../../types";

export type Slot = { label: string; en?: string; color: string; text: string; at: number };
export type Step = { at: number; to: number; mode?: string };
export type SplitModel = {
  total: number;
  labels: { bad: string; good: string };
  hook?: { title: string; kicker?: string };
  draft?: { text: string; t0: number; t1: number };
  send: number;
  reply?: { at: number; head: string; lines: string[]; stamp?: { text: string; at: number } };
  /** 分隔線：to＝上半佔舞台的比例（0＝下半推滿）；mode good＝下半展開、run＝兩邊同時送出、full＝推滿 */
  steps: Step[];
  expandAt: number; runAt: number; fullAt: number;
  guide?: { text: string; by?: string; at: number };
  pulseAt: number; sweepAt: number;
  slots: Slot[];
  node?: { text: string; sub?: string; at: number };
  result?: { at: number; head: string; title: string; titleSlot?: number; lines: { t: string; slot?: number }[]; format?: { text: string; slot: number }; badge?: { text: string; at: number } };
};

export const buildSplit = (scenes: Scene[], tl: TimelineV2): SplitModel => {
  const by = Object.fromEntries(tl.scenes.map((x) => [x.id, x]));
  const m: SplitModel = { total: tl.totalFrames, labels: { bad: "", good: "" }, send: Infinity, steps: [], expandAt: Infinity, runAt: Infinity, fullAt: Infinity, pulseAt: Infinity, sweepAt: Infinity, slots: [] };
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
    if (p.labels) m.labels = p.labels;
    if (p.hook) m.hook = p.hook;
    if (p.draft) m.draft = { text: p.draft.text, t0: at(p.draft.typeAt, t.startFrame), t1: at(p.draft.typeEnd, t.voiceEndFrame) };
    if (p.send) m.send = at(p.send.at, t.startFrame);
    if (p.reply) m.reply = { at: at(p.reply.at, t.voiceStartFrame), head: p.reply.head ?? "", lines: p.reply.lines ?? [], stamp: p.reply.stamp ? { text: p.reply.stamp.text, at: at(p.reply.stamp.at, t.voiceEndFrame) } : undefined };
    for (const d of p.divider ?? []) {
      const st = { at: at(d.at, t.startFrame), to: d.to, mode: d.mode };
      m.steps.push(st);
      if (d.mode === "good") m.expandAt = st.at; else if (d.mode === "run") m.runAt = st.at; else if (d.mode === "full") m.fullAt = st.at;
    }
    if (p.guide) m.guide = { ...p.guide, at: at(p.guide.at, t.voiceStartFrame) };
    if (p.pulseAt) m.pulseAt = at(p.pulseAt, Infinity);
    if (p.sweepAt) m.sweepAt = at(p.sweepAt, Infinity);
    for (const sl of p.slots ?? []) m.slots.push({ ...sl, at: at(sl.at, t.voiceStartFrame) });
    if (p.node) m.node = { ...p.node, at: at(p.node.at, t.voiceStartFrame) };
    if (p.result) m.result = { ...p.result, at: at(p.result.at, t.voiceStartFrame), badge: p.result.badge ? { text: p.result.badge.text, at: at(p.result.badge.at, t.voiceEndFrame) } : undefined };
  });
  m.steps.sort((a, b) => a.at - b.at);
  return m;
};

export const mix = (a: number, b: number, t: number) => a + (b - a) * t;
export type Rect = [number, number, number, number];
export const mixRect = (a: Rect, b: Rect, t: number): Rect => [mix(a[0], b[0], t), mix(a[1], b[1], t), mix(a[2], b[2], t), mix(a[3], b[3], t)];

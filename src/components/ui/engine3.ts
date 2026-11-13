// 仿介面動畫第 3 版（script.json 頂層 uiVersion: 3；AI 教學完整長片）的時間模型。第 1、2 版（engine.ts／engine2.ts）不動。
// 第 2 版一支片只放得下一個回答、一張結果卡；這一版把全片切成依序接力的段落：
// chat（鉤子＋隨便問＋真的回答）→ why（再送一次＋為什麼）→ editor（這樣問＋結果卡逐行長出來）→ compare（上下並排）
// → flag（AI 也會錯的那一行）→ remind（提醒卡）→ template（範本卡＋提問）→ next（下一集）→ end（片尾卡）。
// 每一段的 out＝下一段的 at。所有 at 都是 cue id 或 start｜voice｜end｜exit ±N 幀，這裡換成絕對幀；元件不手填秒數。
import type { Scene, TimelineV2 } from "../../types";
import { FPS, THEME_UI as T } from "../../theme";
import type { CmpSide, Mark } from "./engine2";

export type Line3 = { t: string; head?: boolean; color?: string; at: number; mark?: Mark; focusAt?: number };
export type Slot3 = { label: string; color: string; text: string; at: number; parts?: { t: string; at: number }[] };
export type Model3 = {
  total: number;
  toolTag?: { text: string; at: number };
  chat: {
    /** size＝大字字級（不給 176）；nums＝第 0 幀就在的數字列（錯的數字劃掉＋蓋章＋對的數字）；hook2＝念到指定時刻換成第二個大標 */
    hook?: { title: string; kicker?: string; size?: number; nums?: { wrong: string; tag: string; right: string; at: number } };
    hook2?: { title: string; kicker?: string; at: number };
    draft?: { text: string; placeholder: string; t0: number; t1: number; pauses: number[]; empty?: { title: string; chips?: string[] } };
    send: number; typing: number; out: number;
    reply?: { at: number; by?: string; lines: string[]; more?: string; mark?: Mark; stamp?: { text: string; at: number } };
    fact?: { text: string; sub?: string; at: number };
  };
  why?: { at: number; out: number; tagsAt: number; prompt?: string; tag?: string; by?: string; lines: string[]; mark?: Mark; items: { label: string; color: string; at: number }[]; foot?: string; compact?: boolean };
  editor?: { at: number; out: number; title: string; slotsAt: number; slots: Slot3[]; run: number; result?: { at: number; by?: string; lines: Line3[] } };
  compare?: { at: number; out: number; by?: string; top: CmpSide; bottom: CmpSide; badge?: { text: string; at: number } };
  flag?: { at: number; out: number; title: string; by?: string; head?: string; headColor?: string; before: string[]; line: string; target: string; text: string; sub?: string; color: string; flagAt: number };
  remind?: { at: number; out: number; text: string; sub?: string; left?: string; right?: string; pulseAt: number };
  template?: { at: number; out: number; title: string; hint?: string; hintAt: number; lines: string[]; pulseAt: number; linePx?: number; lineH?: number; foot?: string };
  ask?: { text: string; at: number };
  next?: { at: number; out: number; kicker?: string; title: string; left: string; right: string; splitAt: number; askAt: number };
  end?: { at: number; title: string; sub?: string; note?: string };
};

export const buildModel3 = (scenes: Scene[], tl: TimelineV2): Model3 => {
  const by = Object.fromEntries(tl.scenes.map((x) => [x.id, x]));
  const m: Model3 = { total: tl.totalFrames, chat: { send: Infinity, typing: Infinity, out: Infinity } };
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
    const mark = (k: any, fb: number): Mark | undefined => (k ? { kind: k.kind, target: k.target, at: at(k.at, fb) } : undefined);
    const p = (s.props ?? {}) as Record<string, any>;
    if (p.hook) m.chat.hook = { title: p.hook.title, kicker: p.hook.kicker, size: p.hook.size, nums: p.hook.nums ? { wrong: p.hook.nums.wrong, tag: p.hook.nums.tag, right: p.hook.nums.right, at: at(p.hook.nums.at, t.startFrame + 10) } : undefined };
    if (p.hook2) m.chat.hook2 = { title: p.hook2.title, kicker: p.hook2.kicker, at: at(p.hook2.at, t.voiceStartFrame) };
    if (p.draft) m.chat.draft = { text: p.draft.text, placeholder: p.draft.placeholder ?? "", t0: at(p.draft.typeAt, t.startFrame), t1: at(p.draft.typeEnd, t.voiceEndFrame), pauses: p.draft.pauses ?? [], empty: p.draft.empty };
    if (p.toolTag) m.toolTag = { text: p.toolTag.text, at: at(p.toolTag.at, t.voiceStartFrame) };
    if (p.typing) m.chat.typing = at(p.typing.at, t.voiceStartFrame);
    if (p.send) { if (m.editor) m.editor.run = at(p.send.at, t.startFrame); else m.chat.send = at(p.send.at, t.startFrame); }
    if (p.reply) m.chat.reply = { at: at(p.reply.at, t.voiceStartFrame), by: p.reply.by, lines: p.reply.lines ?? [], more: p.reply.more, mark: mark(p.reply.mark, t.voiceEndFrame), stamp: p.reply.stamp ? { text: p.reply.stamp.text, at: at(p.reply.stamp.at, t.voiceEndFrame) } : undefined };
    if (p.stamp && m.chat.reply) m.chat.reply.stamp = { text: p.stamp.text, at: at(p.stamp.at, t.voiceEndFrame) };
    if (p.fact) m.chat.fact = { text: p.fact.text, sub: p.fact.sub, at: at(p.fact.at, t.voiceEndFrame) };
    if (p.reply2 || p.why) {
      const r = p.reply2 ?? {}, w = p.why ?? {}, a = at(r.at, t.startFrame);
      m.why = { at: a, out: Infinity, tagsAt: at(w.at, t.voiceStartFrame), prompt: r.prompt ?? m.chat.draft?.text, tag: r.tag, by: r.by, lines: r.lines ?? [], mark: mark(r.mark, a + 12),
        items: (w.items ?? []).map((x: any) => ({ label: x.label, color: x.color, at: at(x.at, t.voiceEndFrame) })), foot: w.foot, compact: Boolean(r.compact) };
    }
    if (p.editor) m.editor = { at: at(p.editor.at, t.startFrame), out: Infinity, title: p.editor.title ?? "", slotsAt: at(p.editor.slotsAt, t.startFrame), slots: [], run: Infinity };
    if (m.editor) for (const sl of p.slots ?? []) m.editor.slots.push({ label: sl.label, color: sl.color, text: sl.text, at: at(sl.at, t.voiceStartFrame), parts: sl.parts ? sl.parts.map((x: any) => ({ t: x.t, at: at(x.at, t.voiceEndFrame) })) : undefined });
    const lineOf = (l: any, a: number): Line3 => ({ t: l.t, head: l.head, color: l.color, at: a, mark: mark(l.mark, t.voiceEndFrame), focusAt: l.focusAt ? at(l.focusAt, t.voiceEndFrame) : undefined });
    if (p.result && m.editor && !m.editor.result) {
      const r0 = at(p.result.at, t.voiceStartFrame);
      const raw = [...(p.result.title ? [{ t: p.result.title, head: true, color: p.result.titleColor }] : []), ...(p.result.lines ?? [])];
      m.editor.result = { at: r0, by: p.result.by, lines: raw.map((l: any, k: number) => lineOf(l, r0 + 2 + k * 5)) };
    } else if (p.result) {
      // 第二張結果卡：只留一行，把其中一段框起來（AI 也會錯的例子）。上下對照落定後至少停 holdSec 秒才進來
      const hold = m.compare ? m.compare.at + T.motion.out + T.motion.in + Math.ceil(Number(scenes.map((x) => x.props?.compare?.holdSec).find(Boolean) ?? 1.5) * FPS) : -Infinity;
      const all = (p.result.lines ?? []) as any[], l = all.find((x) => x.flag) ?? all[all.length - 1] ?? { t: "" }, fl = l.flag ?? {}, a = Math.max(at(p.result.at, t.voiceStartFrame), hold);
      m.flag = { at: a, out: Infinity, title: p.result.window ?? m.editor?.title ?? "", by: p.result.by, head: p.result.title, headColor: p.result.titleColor, before: all.filter((x) => x !== l).map((x) => x.t), line: l.t, target: fl.target ?? "", text: fl.text ?? "", sub: fl.sub, color: fl.color ?? "amber", flagAt: Math.max(at(fl.at, t.voiceEndFrame), a + T.motion.out + T.motion.in) };
    }
    if (p.resultAdd && m.editor?.result) { const a0 = at(p.resultAdd.at, t.voiceStartFrame); (p.resultAdd.lines ?? []).forEach((l: any, k: number) => m.editor!.result!.lines.push(lineOf(l, a0 + k * 5))); }
    if (p.compare) m.compare = { at: at(p.compare.at, t.startFrame), out: Infinity, by: p.compare.by, top: p.compare.top, bottom: p.compare.bottom, badge: p.compare.badge ? { text: p.compare.badge.text, at: at(p.compare.badge.at, t.voiceStartFrame) } : undefined };
    if (p.remind) { const a = at(p.remind.at, t.startFrame); m.remind = { at: a, out: Infinity, text: p.remind.text, sub: p.remind.sub, left: p.remind.left, right: p.remind.right, pulseAt: Math.max(at(p.remind.pulseAt, t.voiceEndFrame), a + T.motion.out + T.motion.in) }; }
    if (p.template) { const a = at(p.template.at, t.startFrame); m.template = { at: a, out: Infinity, title: p.template.title, hint: p.template.hint, hintAt: at(p.template.hintAt, a), lines: p.template.lines ?? [], pulseAt: Math.max(at(p.template.pulseAt, Infinity), a + T.motion.out + T.motion.in), linePx: p.template.linePx, lineH: p.template.lineH, foot: p.template.foot }; }
    if (p.ask) m.ask = { text: p.ask.text, at: Math.max(at(p.ask.at, t.voiceEndFrame), (m.template?.at ?? 0) + T.motion.in) };
    if (p.next) { const a = at(p.next.at, t.startFrame); m.next = { at: a, out: Infinity, kicker: p.next.kicker, title: p.next.title, left: p.next.left, right: p.next.right, splitAt: Math.max(at(p.next.splitAt, t.voiceEndFrame), a + T.motion.out + T.motion.in), askAt: at(p.next.askAt, t.voiceEndFrame) }; }
    if (p.endCard) m.end = { at: at(p.endCard.at, t.startFrame), title: p.endCard.title, sub: p.endCard.sub, note: p.endCard.note };
  });
  // 每一段在下一段進來時退場
  const order = [m.chat, m.why, m.editor, m.compare, m.flag, m.remind, m.template, m.next].filter(Boolean) as { at?: number; out: number }[];
  order.forEach((x, k) => { x.out = (order[k + 1]?.at as number | undefined) ?? m.end?.at ?? Infinity; });
  return m;
};

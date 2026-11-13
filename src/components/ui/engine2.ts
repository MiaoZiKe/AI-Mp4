// 仿介面動畫第 2 版（script.json 頂層 uiVersion: 2；AI 教學＋時事）的時間模型。第 1 版（engine.ts／sample-ai-ui）不動。
// 多出來的區塊：toolTag（工具名稱與測試日期）、typing、reply 的 by／mark、fact、result 每行的 head／mark、compare（上下並排）、template（範本卡）、ask。
// 所有 at 都是 cue id 或 start｜voice｜end｜exit ±N 幀，這裡換成絕對幀；元件不手填秒數。
import type { Scene, TimelineV2 } from "../../types";
import { FPS, THEME_UI as T } from "../../theme";

export type Mark = { kind: "circle" | "check" | "underline"; target?: string; at: number };
export type Slot2 = { label: string; color: string; text: string; at: number };
export type CmpSide = { label: string; prompt: string; answer: string; mark?: { kind: Mark["kind"]; target?: string }; tag: string };
export type Model2 = {
  total: number;
  hook?: { title: string; kicker?: string };
  draft?: { text: string; placeholder: string; t0: number; t1: number; pauses: number[]; empty?: { title: string; chips?: string[] } };
  send: number;
  toolTag?: { text: string; at: number };
  typing: number;
  reply?: { at: number; by?: string; lines: string[]; mark?: Mark; stamp?: { text: string; at: number } };
  fact?: { text: string; sub?: string; at: number };
  editor?: { at: number; title: string; slotsAt: number };
  slots: Slot2[];
  run: number;
  result?: { at: number; by?: string; lines: { t: string; head?: boolean; color?: string; mark?: Mark }[] };
  compare?: { at: number; out: number; by?: string; top: CmpSide; bottom: CmpSide; badge?: { text: string; at: number } };
  template?: { at: number; title: string; hint?: string; lines: string[]; pulseAt: number };
  ask?: { text: string; at: number };
};

export const buildModel2 = (scenes: Scene[], tl: TimelineV2): Model2 => {
  const by = Object.fromEntries(tl.scenes.map((x) => [x.id, x]));
  const m: Model2 = { total: tl.totalFrames, send: Infinity, typing: Infinity, run: Infinity, slots: [] };
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
    if (p.hook) m.hook = p.hook;
    if (p.draft) m.draft = { text: p.draft.text, placeholder: p.draft.placeholder ?? "", t0: at(p.draft.typeAt, t.startFrame), t1: at(p.draft.typeEnd, t.voiceEndFrame), pauses: p.draft.pauses ?? [], empty: p.draft.empty };
    if (p.send) { if (m.editor) m.run = at(p.send.at, t.startFrame); else m.send = at(p.send.at, t.startFrame); }
    if (p.toolTag) m.toolTag = { text: p.toolTag.text, at: at(p.toolTag.at, t.voiceStartFrame) };
    if (p.typing) m.typing = at(p.typing.at, t.voiceStartFrame);
    if (p.reply) m.reply = { at: at(p.reply.at, t.voiceStartFrame), by: p.reply.by, lines: p.reply.lines ?? [], mark: mark(p.reply.mark, t.voiceEndFrame), stamp: p.reply.stamp ? { text: p.reply.stamp.text, at: at(p.reply.stamp.at, t.voiceEndFrame) } : undefined };
    if (p.fact) m.fact = { text: p.fact.text, sub: p.fact.sub, at: at(p.fact.at, t.voiceEndFrame) };
    if (p.editor) m.editor = { at: at(p.editor.at, t.startFrame), title: p.editor.title ?? "", slotsAt: at(p.editor.slotsAt, t.startFrame) };
    for (const sl of p.slots ?? []) m.slots.push({ ...sl, at: at(sl.at, t.voiceStartFrame) });
    if (p.result) {
      const r0 = at(p.result.at, t.voiceStartFrame);
      const lines = [...(p.result.title ? [{ t: p.result.title, head: true, color: p.result.titleColor }] : []), ...(p.result.lines ?? [])];
      m.result = { at: r0, by: p.result.by, lines: lines.map((l: any) => ({ ...l, mark: mark(l.mark, t.voiceEndFrame) })) };
    }
    if (p.compare) m.compare = { at: at(p.compare.at, t.startFrame), out: Infinity, by: p.compare.by, top: p.compare.top, bottom: p.compare.bottom, badge: p.compare.badge ? { text: p.compare.badge.text, at: at(p.compare.badge.at, t.voiceStartFrame) } : undefined };
    if (p.template) {
      // 上下對照落定後至少停 holdSec 秒，範本卡才進來（配音比較短時自動往後讓）
      const hold = m.compare ? m.compare.at + T.motion.out + T.motion.in + Math.ceil(Number(scenes.map((x) => x.props?.compare?.holdSec).find(Boolean) ?? 1.5) * FPS) : -Infinity;
      const a = Math.max(at(p.template.at, t.startFrame), hold);
      m.template = { at: a, title: p.template.title, hint: p.template.hint, lines: p.template.lines ?? [], pulseAt: Math.max(at(p.template.pulseAt, Infinity), a + T.motion.in) };
      if (m.compare) m.compare.out = a;
    }
    if (p.ask) m.ask = { text: p.ask.text, at: Math.max(at(p.ask.at, t.voiceEndFrame), (m.template?.at ?? 0) + T.motion.in) };
  });
  return m;
};

/** 打字的快慢：英數比較快、中文比較慢，pauses（打完第幾個字之後）停一拍；每個字再加一點固定的不規則。回傳 f 幀時打到第幾個字 */
export const typedCount = (text: string, pauses: number[], t0: number, t1: number, f: number) => {
  const chars = [...text], PAUSE = 3.2;
  if (f < t0) return 0;
  const base = chars.map((ch, i) => (/[A-Za-z0-9]/.test(ch) ? 0.55 : 1) * (0.8 + 0.4 * (((i * 7919) % 13) / 12)));
  const starts: number[] = [];
  let acc = 0;
  chars.forEach((_, i) => { if (pauses.includes(i)) acc += PAUSE; starts.push(acc); acc += base[i]; });
  const now = ((f - t0) / Math.max(1, t1 - t0)) * acc;
  return starts.filter((x) => now >= x).length;
};

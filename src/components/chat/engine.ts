// 對話泡泡（stage: "chat"）的時間軸引擎：把各幕 props.events 的 at（cue id 或 start｜voice｜end｜exit，可加減幾幀；別幕寫「幕id:cue」）
// 換成絕對幀，再排出對話串每一則的高度與順序。畫面元件只讀這裡算好的結果，不自己算時間。
import type { Script, TimelineV2 } from "../../types";
import { LAYOUT_CHAT as L } from "../../theme";

/** 畫面比聲音早到幾幀（念到那個詞時東西已經看得到） */
export const CUE_LEAD = 3;
const PAST = -9999;

export type ThreadItem = {
  kind: "date" | "bubble" | "card" | "typing";
  side: "me" | "them" | "mid";
  id?: string;
  text?: string;
  at: number;
  until?: number;
  h: number;
  gap: number;
  /** card */
  kicker?: string; title?: string; value?: number; prefix?: string; unit?: string; meta?: string; countAt?: number;
  /** 已讀、愛心 */
  readAt?: number; reactAt?: number;
};
export type Compose = { text: string; pre: number; at: number; until: number };
export type Stat = { at: number; until: number; kicker?: string; head: string; big: string; label: string; total: number; on: number; cols: number; fillAt: number; labelAt: number; foot?: string };
export type ChatPlan = { items: ThreadItem[]; composes: Compose[]; stats: Stat[]; sends: number[] };

const bubbleH = (text: string) => text.split("\n").length * L.BUBBLE_LH + 2 * L.BUBBLE_PAD_Y;

export function planChat(script: Script, tl: TimelineV2): ChatPlan {
  const by = Object.fromEntries(tl.scenes.map((t, i) => [t.id, { t, exit: tl.scenes[i + 1]?.startFrame ?? tl.totalFrames }]));
  const frameOf = (at: string, sceneId: string): number => {
    const m = /^(?:([^:\s]+):)?([^\s+-]+)([+-]\d+)?$/.exec(at);
    if (!m) throw new Error(`chat: at「${at}」格式不對`);
    const s = by[m[1] ?? sceneId];
    if (!s) throw new Error(`chat: at「${at}」找不到幕`);
    const off = Number(m[3] ?? 0);
    if (m[2] === "start") return s.t.startFrame + off;
    if (m[2] === "voice") return s.t.voiceStartFrame + off;
    if (m[2] === "end") return s.t.voiceEndFrame + off;
    if (m[2] === "exit") return s.exit + off;
    const c = (s.t.cues ?? []).find((q) => q.id === m[2]);
    if (!c || c.frame === null) throw new Error(`chat: at「${at}」的 cue 沒對到時間`);
    return c.frame - CUE_LEAD + off;
  };
  const items: ThreadItem[] = [], composes: Compose[] = [], stats: Stat[] = [], sends: number[] = [];
  const push = (it: Omit<ThreadItem, "gap">) => {
    const prev = items[items.length - 1];
    items.push({ ...it, gap: !prev ? 0 : prev.side === it.side && it.side !== "mid" ? L.GAP_SAME : L.GAP_TURN });
  };
  // 開場前就在畫面上的訊息（chat.history）
  const chat = (script as any).chat ?? {};
  for (const hst of chat.history ?? []) {
    if (hst.type === "date") push({ kind: "date", side: "mid", text: hst.text, at: PAST, h: L.DATE_H });
    else push({ kind: "bubble", side: hst.side, text: hst.text, at: PAST, h: bubbleH(hst.text) });
  }
  for (const sc of script.scenes) {
    for (const ev of (sc.props?.events ?? []) as any[]) {
      const at = frameOf(ev.at, sc.id);
      const until = ev.until ? frameOf(ev.until, sc.id) : undefined;
      if (ev.type === "bubble") { push({ kind: "bubble", side: ev.side, id: ev.id, text: ev.text, at, h: bubbleH(ev.text) }); if (ev.side === "me") sends.push(at); }
      else if (ev.type === "typing") push({ kind: "typing", side: ev.side, at, until: until ?? at + 30, h: bubbleH("…") });
      else if (ev.type === "card") push({ kind: "card", side: ev.side, at, h: L.CARD_H, kicker: ev.kicker, title: ev.title, value: ev.value, prefix: ev.prefix, unit: ev.unit, meta: ev.meta, countAt: ev.countAt ? frameOf(ev.countAt, sc.id) + CUE_LEAD : at + 12 });
      else if (ev.type === "compose") composes.push({ text: ev.text, pre: ev.pre ?? 0, at, until: until ?? at + 30 });
      else if (ev.type === "read") { const me = [...items].reverse().find((x) => x.kind === "bubble" && x.side === "me"); if (me) me.readAt = at; }
      else if (ev.type === "react") { const tg = items.find((x) => x.id === ev.ref) ?? items[items.length - 1]; if (tg) tg.reactAt = at; }
      else if (ev.type === "stat") stats.push({ at, until: until ?? tl.totalFrames + 99, kicker: ev.kicker, head: ev.head, big: ev.big, label: ev.label, total: ev.total, on: ev.on, cols: ev.cols ?? 10,
        fillAt: ev.fillAt ? frameOf(ev.fillAt, sc.id) : at + 20, labelAt: ev.labelAt ? frameOf(ev.labelAt, sc.id) : at + 40, foot: ev.foot });
    }
  }
  return { items, composes, stats, sends };
}

import { createContext, useContext } from "react";
import { DUR, EASE, tween } from "./components/anim";
import { THEME_V2 } from "./theme";

/**
 * P0-8／P0-9：cue 驅動進場與 beat 編舞（只用在 styleVersion 2）。
 * 幀一律是「元件的本地幀」（SceneBodyV2 已換算：絕對幀 − 本幕 startFrame + lead）。
 *  - cues：script.json 每幕 cues[].id → 念到該詞的幀（align.mjs 由逐字時間算出）
 *  - exit：下一幕轉場開始（本幕開始出場）的幀；voiceStart／voiceEnd：本幕實際開口／收聲
 */
export type CueInfo = { cues: Record<string, number>; exit: number; voiceStart: number; voiceEnd: number };
export const CueContext = createContext<CueInfo>({ cues: {}, exit: 1e9, voiceStart: 0, voiceEnd: 1e9 });
export const useCue = () => useContext(CueContext);

/** 畫面比聲音早到：進場從 cue − 4 幀開始（淡入 8 幀，cue 當下約 50%，−6～0 幀內可辨識） */
export const CUE_LEAD = 4;
export const hasCue = (c: CueInfo, at?: string) => Boolean(at && c.cues[at] !== undefined);
/** 進場幀：at 有對應 cue → cue − CUE_LEAD；否則用 fallback（舊的固定延遲） */
export const cueIn = (c: CueInfo, at: string | undefined, fallback: number) => (at && c.cues[at] !== undefined ? c.cues[at] - CUE_LEAD : fallback);
/** cue 本身的幀（數字落定、punch 用） */
export const cueAt = (c: CueInfo, at: string | undefined, fallback: number) => (at && c.cues[at] !== undefined ? c.cues[at] : fallback);

/**
 * 讀秒保護：最後一個 beat 之後，至少留 0.6 秒（18 幀）不再變化才出場。
 * release（focus 解除、全部恢復不透明）放在 max(最後事件 + 20, 出場 − 30)；若會落在出場前 18 幀內就不放。
 */
export const releaseFrame = (c: CueInfo, lastEvent: number) => {
  const r = Math.max(lastEvent + 20, c.exit - 30);
  return r <= c.exit - 18 ? r : null;
};

/**
 * focus：多個項目依 cue 依序出現時，念到的那一項保持 1，其他降到 THEME_V2.dim（0.35），每次切換 DUR.s 幀平滑過渡。
 * starts[i]＝第 i 項進場幀；cued[i]＝是否由 cue 觸發（只有 cue 觸發的項目會搶 focus）。只有一個 cue 項目時不做 focus。
 */
export const focusLevel = (f: number, c: CueInfo, starts: number[], cued: boolean[], i: number) => {
  const order = starts.map((s, k) => ({ s, k })).filter((x) => cued[x.k]).sort((a, b) => a.s - b.s);
  if (order.length < 2) return 1;
  const events: { t: number; focus: number }[] = order.slice(1).map((x) => ({ t: x.s, focus: x.k }));
  // 第二項出現時，第一項也算被「讓位」：focus 交給第二項
  const rel = releaseFrame(c, events[events.length - 1].t);
  if (rel !== null) events.push({ t: rel, focus: -1 });
  let v = 1;
  for (let e = 0; e < events.length; e++) {
    const ev = events[e];
    if (f < ev.t) break;
    const target = ev.focus < 0 || ev.focus === i ? 1 : THEME_V2.dim;
    const nextT = events[e + 1]?.t;
    const ff = nextT !== undefined ? Math.min(f, nextT) : f;
    v = v + (target - v) * tween(ff, ev.t, DUR.s, EASE.move);
  }
  return v;
};

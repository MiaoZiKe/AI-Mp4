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

/** focus 切換時長（幀）：5 幀內完成，明暗變化清楚但不閃 */
export const FOCUS_DUR = DUR.xs + 1;
/** 第一個出場的項目不等 cue：最晚在本幕第 FIRST_MAX 幀進場（避免開場 1–2 秒內容區只剩空白） */
export const FIRST_MAX = 10;
export const firstEarly = (starts: number[]) => { const m = Math.min(...starts); const k = starts.indexOf(m); return starts.map((v, i) => (i === k ? Math.min(v, FIRST_MAX) : v)); };

/** 畫面比聲音早到：進場從 cue − 4 幀開始（淡入 8 幀，cue 當下約 50%，−6～0 幀內可辨識） */
export const CUE_LEAD = 4;
export const hasCue = (c: CueInfo, at?: string) => Boolean(at && c.cues[at] !== undefined);
/**
 * 讀秒保護：資訊落定後至少留 READ_HOLD 幀（0.8 秒）才出場。cue 太靠近句尾時，畫面提早出現（最多比聲音早到出場前 0.8 秒），
 * 寧可畫面先到、不讓觀眾來不及讀。
 */
export const READ_HOLD = 24;
/** 進場幀：at 有對應 cue → cue − CUE_LEAD（且不晚於 出場 − READ_HOLD − 8）；否則用 fallback（舊的固定延遲） */
export const cueIn = (c: CueInfo, at: string | undefined, fallback: number) => (at && c.cues[at] !== undefined ? Math.min(c.cues[at] - CUE_LEAD, c.exit - READ_HOLD - 8) : fallback);
/** cue 本身的幀（數字落定、punch 用；不晚於 出場 − READ_HOLD） */
export const cueAt = (c: CueInfo, at: string | undefined, fallback: number) => (at && c.cues[at] !== undefined ? Math.min(c.cues[at], c.exit - READ_HOLD) : fallback);

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
    v = v + (target - v) * tween(ff, ev.t, FOCUS_DUR, EASE.move);
  }
  return v;
};

/**
 * 2.5D 鏡頭推拉（P2-3 縮小版）：每個 cue 落定時，主視覺整體在 PULL_SCALE 與 1.00 之間交替推近／拉回（開場略遠），
 * DUR.m 幀 ease-in-out 到位後固定（不連續縮放、不回彈）；最後 READ_HOLD 幀內不再推拉。
 */
/** 推拉在 [PULL_SCALE, 1] 之間：1 時寬 952（剛好貼齊安全區），不會出界 */
export const PULL_SCALE = 0.965;
export const cameraScale = (f: number, c: CueInfo) => {
  const ts = Object.values(c.cues).map((t) => Math.min(t, c.exit - READ_HOLD - DUR.m)).filter((t) => t > 6).sort((a, b) => a - b)
    .filter((t, i, a) => i === 0 || t - a[i - 1] >= DUR.m + 6);
  let v = PULL_SCALE;
  ts.forEach((t, i) => { const target = i % 2 === 0 ? 1 : PULL_SCALE; v = v + (target - v) * tween(f, t - 2, DUR.m, EASE.move); });
  return v;
};

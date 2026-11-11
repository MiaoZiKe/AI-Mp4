import { createContext, useContext } from "react";
import { DUR, EASE, tween } from "./components/anim";
import { THEME_V2 } from "./theme";

/**
 * P0-8／P0-9：cue 驅動進場與 beat 編舞（只用在 styleVersion 2）。
 * 幀一律是「元件的本地幀」（SceneBodyV2 已換算：絕對幀 − 本幕 startFrame + lead）。
 *  - cues：script.json 每幕 cues[].id → 念到該詞的幀（align.mjs 由逐字時間算出）
 *  - exit：下一幕轉場開始（本幕開始出場）的幀；voiceStart／voiceEnd：本幕實際開口／收聲
 */
export type CueInfo = { cues: Record<string, number>; exit: number; voiceStart: number; voiceEnd: number; words?: { text: string; frame: number }[] };
export const CueContext = createContext<CueInfo>({ cues: {}, exit: 1e9, voiceStart: 0, voiceEnd: 1e9 });
export const useCue = () => useContext(CueContext);

/** focus 切換時長（幀）：5 幀內完成，明暗變化清楚但不閃 */
export const FOCUS_DUR = DUR.xs + 1;
/** 第一個出場的項目不等 cue：最晚在本幕第 FIRST_MAX 幀進場（避免開場 1–2 秒內容區只剩空白） */
export const FIRST_MAX = 10;
export const firstEarly = (starts: number[], max: number = FIRST_MAX) => { const m = Math.min(...starts); const k = starts.indexOf(m); return starts.map((v, i) => (i === k ? Math.min(v, max) : v)); };

/** 畫面比聲音早到：進場從 cue − 4 幀開始（淡入 8 幀，cue 當下約 50%，−6～0 幀內可辨識） */
export const CUE_LEAD = 4;
export const hasCue = (c: CueInfo, at?: string) => Boolean(at && c.cues[at] !== undefined);
/**
 * 讀秒保護（v3 幕尾編舞）：主體在上一幕收聲後才出場（align 把出場起點放在收聲 −2 幀之後），
 * 所以句尾才念到的 cue 只需留 READ_HOLD 幀（0.4 秒）就能出場；畫面最多比聲音早到 CUE_EARLY_MAX 幀（validate／align 會報）。
 */
export const READ_HOLD = 12;
export const CUE_EARLY_MAX = 4;
/** 進場幀：at 有對應 cue → cue − CUE_LEAD（且不晚於 出場 − READ_HOLD − CUE_LEAD）；否則用 fallback（舊的固定延遲） */
export const cueIn = (c: CueInfo, at: string | undefined, fallback: number) => (at && c.cues[at] !== undefined ? Math.min(c.cues[at] - CUE_LEAD, c.exit - READ_HOLD - CUE_LEAD) : fallback);
/** cue 本身的幀（數字落定、punch 用；不晚於 出場 − READ_HOLD） */
export const cueAt = (c: CueInfo, at: string | undefined, fallback: number) => (at && c.cues[at] !== undefined ? Math.min(c.cues[at], c.exit - READ_HOLD) : fallback);

/** 幕尾編舞：release（focus 解除、全部恢復）＝ min(最後事件 + 18, 出場 − 24)，一定釋放；切換 RELEASE_DUR 幀，出場前 9 幀全部 ≥0.95 */
export const RELEASE_DUR = 10;
export const releaseFrame = (c: CueInfo, lastEvent: number) => Math.min(lastEvent + 18, c.exit - 24);

/**
 * 靜止態先完整排版：多項目元件的每一項最晚在 FIRST_MAX + i×STAGGER 幀就排上版（dim＝灰階＋淡），
 * 念到（cue）時才填入顏色、轉成 focus。回傳每項的「排版進場幀」。
 */
export const layoutStarts = (starts: number[], step = 4) => starts.map((s, i) => Math.min(s, FIRST_MAX + i * step));

/**
 * focus：多個項目依 cue 依序被念到時，念到的那一項保持 1，其他降到 THEME_V2.dim（以 dimStyle 換成灰階＋淡色，對比仍 ≥3:1）。
 * starts[i]＝第 i 項的 cue 進場幀；cued[i]＝是否由 cue 觸發。staged＝true 時，cue 之前的項目先以 dim 排版（靜止態完整排版）。
 * 最後一個 cue 之後 release：全部恢復 1。
 */
export const focusLevel = (f: number, c: CueInfo, starts: number[], cued: boolean[], i: number, staged = false) => {
  const order = starts.map((s, k) => ({ s, k })).filter((x) => cued[x.k]).sort((a, b) => a.s - b.s);
  if (!cued[i]) return 1;
  if (order.length < 2 && !staged) return 1;
  const rel = releaseFrame(c, order[order.length - 1].s);
  const events: { t: number; focus: number; dur: number }[] = order.slice(staged || order.length < 2 ? 0 : 1).map((x) => ({ t: x.s, focus: x.k, dur: FOCUS_DUR })).filter((e) => e.t < rel);
  events.push({ t: rel, focus: -1, dur: RELEASE_DUR });
  // 起始值：排版態（staged）一律 dim；否則第一項念到前是 1（它就是第一個 focus）
  let v = staged ? THEME_V2.dim : (order[0].k === i ? 1 : THEME_V2.dim);
  if (!staged && order.length >= 2 && f < order[0].s) v = 1;
  for (let e = 0; e < events.length; e++) {
    const ev = events[e];
    if (f < ev.t) break;
    const target = ev.focus < 0 || ev.focus === i ? 1 : THEME_V2.dim;
    const nextT = events[e + 1]?.t;
    const ff = nextT !== undefined ? Math.min(f, nextT) : f;
    v = v + (target - v) * tween(ff, ev.t, ev.dur, EASE.move);
  }
  return v;
};

/**
 * 鏡頭分級（v3）：預設不動。只有 script.json 的 camera 指定的那一幕在指定 cue 動一次：
 *  push＝0.97→1（推近）、pull＝1→0.97（拉回）、pan＝橫移 −16px；DUR.m 幀 ease-in-out 到位後固定（不連續縮放、不回彈）。
 * validate／storyboard lint：推拉類 ≤ 幕數 1/3、不可連續兩幕都推。
 */
export const PULL_SCALE = 0.97;
export type CameraSpec = { move: "push" | "pull" | "pan"; at?: string };
export const cameraMove = (f: number, c: CueInfo, cam?: CameraSpec) => {
  if (!cam) return { scale: 1, x: 0 };
  const t0 = Math.min(cueAt(c, cam.at, 12), c.exit - READ_HOLD - DUR.m);
  const p = tween(f, t0 - 2, DUR.m, EASE.move);
  if (cam.move === "push") return { scale: PULL_SCALE + (1 - PULL_SCALE) * p, x: 0 };
  if (cam.move === "pull") return { scale: 1 - (1 - PULL_SCALE) * p, x: 0 };
  return { scale: 1, x: -16 * p };
};

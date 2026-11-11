import { spring, interpolate, Easing, getInputProps } from "remotion";
import { FPS } from "../theme";

/** 淡入 + 上移（spring，帶一點過衝，元素像「彈」進來） */
export const rise = (frame: number, delay = 0, dist = 40) => {
  const s = spring({ frame: frame - delay, fps: FPS, config: { damping: 14, stiffness: 110, mass: 0.7 } });
  return { opacity: Math.min(1, s * 1.15), transform: `translateY(${(1 - s) * dist}px)` } as const;
};

/** 彈出：從 from 放大、過衝後回到 1（給關鍵詞、數字、圖示用） */
export const pop = (frame: number, delay = 0, from = 0.6) => {
  const s = spring({ frame: frame - delay, fps: FPS, config: { damping: 10, stiffness: 160, mass: 0.6 } });
  return from + (1 - from) * s;
};

/** 0→1 進度（ease-out，開頭快、收尾慢，看起來比線性滑順） */
export const progress = (frame: number, delay: number, dur: number) =>
  interpolate(frame, [delay, delay + dur], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });

/** 0→1 線性進度 */
export const linear = (frame: number, delay: number, dur: number) =>
  interpolate(frame, [delay, delay + dur], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

/** 固定 seed 的偽隨機 */
export const seeded = (seed: number) => {
  let s = seed >>> 0;
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
};

// ───────────────────────── styleVersion 2：motion tokens ─────────────────────────
// 元件一律用下列 token，不寫字面的 spring／interpolate 參數（validate 會 grep 檢查）。

/** 時長（幀）：xs 4、s 8、m 12、l 18 */
export const DUR = { xs: 4, s: 8, m: 12, l: 18 } as const;
/** 錯開間隔（幀） */
export const STAGGER = 4;
/** 出場時長＝進場的 65% */
export const exitDur = (enterFrames: number) => Math.max(2, Math.round(enterFrames * 0.65));
/** easing：enter 減速進場、exit 加速離場、move 位移／數值 */
export const EASE = {
  enter: Easing.out(Easing.cubic),
  exit: Easing.in(Easing.quad),
  move: Easing.inOut(Easing.cubic),
  count: Easing.out(Easing.quad),
} as const;
/**
 * spring 只留兩組：ui（臨界阻尼以上，無過衝）、accent（阻尼比約 0.77，過衝約 2.4% ≤ 3%）
 * 過衝 = exp(−πζ/√(1−ζ²))，ζ = damping / (2√(stiffness·mass))
 */
export const SPRING = {
  ui: { damping: 24, stiffness: 120, mass: 1 },
  accent: { damping: 15, stiffness: 160, mass: 0.6 },
} as const;

/** ambient 動作（背景星點、光點、光暈漂移、圖示呼吸光）：AUDIT=1 render 時關掉，讓量測只看結構變化 */
const readAudit = () => { if (typeof window === "undefined") return false; try { return Boolean((getInputProps() as { audit?: boolean }).audit); } catch { return false; } };
export const AMBIENT = !readAudit();

/** 夾在 [0,1] 的補間 */
export const tween = (frame: number, start: number, dur: number, ease: (t: number) => number = EASE.enter) =>
  interpolate(frame, [start, start + Math.max(1, dur)], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease });

/** ui spring 0→1 */
export const springUi = (frame: number, delay = 0) => spring({ frame: frame - delay, fps: FPS, config: SPRING.ui });
/** accent spring 0→1（帶 ≤3% 過衝） */
export const springAccent = (frame: number, delay = 0) => spring({ frame: frame - delay, fps: FPS, config: SPRING.accent });

/** v2 進場：淡入（DUR.s）＋上移（ui spring，無過衝），位移取整數 px */
export const enter = (frame: number, delay = 0, dist = 24) => {
  const s = springUi(frame, delay);
  return { opacity: tween(frame, delay, DUR.s), transform: `translateY(${Math.round((1 - s) * dist)}px)` } as const;
};

/** v2 強調彈出（accent spring）：from → 1，過衝 ≤3% */
export const punch = (frame: number, delay = 0, from = 0.9) => from + (1 - from) * springAccent(frame, delay);

/**
 * 數字遞增進度：從 start 幀開始，到 landAt 幀剛好 =1（Easing.out(quad)，只緩動一次）。
 * p(25%) = 1 − 0.75² = 0.4375；p(landAt) = 1。
 */
export const countUp = (frame: number, start: number, landAt: number) => tween(frame, start, landAt - start, EASE.count);

/** 打字機：依字數決定時長（每字 2 幀，介於 DUR.l 與 75 幀），線性；回傳已顯示字數 */
export const typeChars = (frame: number, start: number, n: number, framesPerChar = 2) => {
  const dur = Math.min(75, Math.max(DUR.l, n * framesPerChar));
  return Math.floor(interpolate(frame, [start, start + dur], [0, n], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
};

/** v3：scale 脈衝上限（亞里：不彈跳）；強調改用顏色／螢光筆，bump 只留給每幕 ≤2 個關鍵數字 */
export const BUMP_MAX = 0.02;
/** 落定強調：at 幀起 DUR.s 幀放大到 1+amt（≤BUMP_MAX），再 DUR.m 幀回到 1（平滑，不硬跳） */
export const bump = (frame: number, at: number, amt = BUMP_MAX) => {
  const a = Math.min(amt, BUMP_MAX);
  return 1 + a * (tween(frame, at, DUR.s, EASE.enter) - tween(frame, at + DUR.s, DUR.m, EASE.move));
};

/** 元件用：v1 保持 rise（彈性過衝）；v2 改 enter（無過衝、位移 ≤24px） */
export const riseFor = (v2: boolean) => (v2 ? (frame: number, delay = 0, dist = 40) => enter(frame, delay, Math.min(dist, 24)) : rise);

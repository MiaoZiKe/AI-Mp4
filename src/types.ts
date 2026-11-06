export type Scene = {
  id: string;
  narration: string;
  /** 念稿版：數字、縮寫改成唸法；沒有就用 narration */
  tts?: string;
  subtitle: { zh: string; en: string };
  keywords: string[];
  component: string;
  props: Record<string, any>;
  sources: string[];
  /** 無配音時可指定；有 timeline 時以 timeline 為準 */
  durationSec?: number;
  /** styleVersion 2：進入本幕的轉場（預設 fade） */
  transition?: TransitionType;
};

export type TransitionType = "fade" | "slide";
/** 轉場曲線（幀，相對轉場開始）：出場在 exit 區間淡出，進場在 enter 區間淡入；兩者錯開避免雙重曝光 */
export type TransitionSpec = { type: TransitionType; frames: number; exit: [number, number]; enter: [number, number] };

export type Word = { text: string; start: number; end: number };

/** 由 scripts/align.mjs 產生，時間單位秒 */
export type SceneTiming = {
  id: string;
  /** public/ 底下的相對路徑 */
  audio?: string | null;
  audioSec: number;
  /** 幕開始到音檔開始 */
  leadSec: number;
  durationSec: number;
  /** 相對音檔開始 */
  words: Word[];
  /** 相對幕開始：字幕每行出現時間 */
  lines: { text: string; start: number; chars?: number[] }[];
  /** 相對幕開始：關鍵詞被唸到的時間 */
  keywords: { text: string; start: number }[];
};
export type Timeline = { slug: string; fps: number; totalSec: number; scenes: SceneTiming[] };

/**
 * 時間軸 v2（styleVersion 2）：單一時間來源，全部是「絕對幀」，由 scripts/align.mjs 算好；
 * Video.tsx、still.mjs、render、audit 只讀不算。
 * 版面：第 i 幕 = [startFrame, startFrame + durationFrames)；與前一幕重疊 transitionFrames 幀（轉場期間）。
 */
export type SceneTimingV2 = {
  id: string;
  audio?: string | null;
  /** 音檔放在哪一幀（絕對） */
  audioFrame: number;
  audioSec: number;
  startFrame: number;
  durationFrames: number;
  /** 從前一幕轉進本幕的重疊幀數（第一幕 0） */
  transitionFrames: number;
  transition?: TransitionSpec | null;
  /** 實際開口／收聲（扣掉音檔頭尾靜音）的絕對幀 */
  voiceStartFrame: number;
  voiceEndFrame: number;
  /** 截圖用：本幕畫面完全落定、字幕全亮的幀 */
  stillFrame: number;
  /** 字幕軌視窗 [in, out)（絕對幀）；片尾卡為 null */
  subtitleWindow: [number, number] | null;
  /** 來源列視窗 [in, out)（絕對幀） */
  sourceWindow: [number, number];
  /** 相對音檔開始（秒） */
  words: Word[];
  /** 絕對幀：字幕每行出現、每個字點亮 */
  lines: { text: string; start: number; chars: number[] }[];
  /** 絕對幀：關鍵詞被唸到 */
  keywords: { text: string; start: number }[];
  [k: string]: unknown;
};
export type TimelineV2 = { version: 2; slug: string; fps: number; totalFrames: number; totalSec: number; gapSec?: number; scenes: SceneTimingV2[] };

export type CoverSpec = {
  title: string[];
  sub: string;
  en: string;
  icons?: { name: string; color?: string }[];
  tiles?: { icon: string; label: string; color?: string }[];
  tags?: { status: string; text: string }[];
};

export type Voice = { voiceName: string; candidates?: string[]; style?: string; model?: string };

export type Script = {
  slug: string;
  title: string;
  asOf: string;
  cover?: CoverSpec;
  voice?: Voice;
  scenes: Scene[];
  /** 2 = 新引擎（時間軸 v2、錯位轉場、全片字幕軌、motion token）；沒有 = v1 舊片 */
  styleVersion?: 1 | 2;
  /** 量測用（AUDIT=1）：關掉 ambient 動作 */
  audit?: boolean;
  /** 舊版：整段音檔 */
  audio?: string | null;
  timeline?: Timeline | TimelineV2 | null;
};

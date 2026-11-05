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
};

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
  /** 舊版：整段音檔 */
  audio?: string | null;
  timeline?: Timeline | null;
};

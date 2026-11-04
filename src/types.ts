import { Certainty } from "./theme";

export type Scene = {
  id: string;
  component: string;
  narration: string;
  subtitle_zh: string[];
  subtitle_en: string[];
  keywords: string[];
  props: any;
  sources: string[];
  certainty: Certainty;
};

export type Script = {
  slug: string;
  title: string;
  titleEn: string;
  asOf: string;
  channel: string;
  series: string;
  slogan: string;
  cover: { lines: string[]; highlight: string; kicker: string; badge: string };
  scenes: Scene[];
};

export type VideoProps = {
  script: Script;
  /** 每幕時長（frames）；有配音時由 tts 腳本依音檔長度 + 0.4 秒寫入 */
  durations?: Record<string, number>;
  /** 每幕配音檔（public/ 下相對路徑） */
  voice?: Record<string, string>;
};

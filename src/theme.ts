import { MONO_FAMILY, NOTO_FAMILY } from "./fonts";

export const FONT_ZH = `"${NOTO_FAMILY}", sans-serif`;
// 英文/標籤：JetBrains Mono，中文字元自動 fallback 到 Noto Sans TC
export const FONT_MONO = `"${MONO_FAMILY}", "${NOTO_FAMILY}", monospace`;

export const W = 1080;
export const H = 1920;
export const FPS = 30;

export const SAFE = { top: 220, bottom: 220, left: 64, right: 64 };
// 內容區：Header 之下、字幕底板之上
export const CONTENT = { top: 330, bottom: 1340, left: SAFE.left, right: W - SAFE.right };
export const CONTENT_W = CONTENT.right - CONTENT.left;

export const C = {
  bgTop: "#0E2A5C",
  bgBottom: "#0A1F45",
  line: "#FFFFFF",
  yellow: "#FFC83D",
  cyan: "#5EE6FF",
  red: "#E07A7A",
  blue: "#7AA8E0",
  gray: "rgba(255,255,255,0.35)",
  panel: "rgba(8,24,56,0.78)",
  dim: "rgba(255,255,255,0.7)",
};

export const STROKE = 2.5;

export type Certainty = "已確定" | "分析預期" | "尚未確定";
export const CERT_COLOR: Record<Certainty, string> = {
  已確定: C.cyan,
  分析預期: C.yellow,
  尚未確定: "#FF9F6B",
};
export const CERT_EN: Record<Certainty, string> = {
  已確定: "CONFIRMED",
  分析預期: "EXPECTED",
  尚未確定: "PENDING",
};

// 「鉤子提問」解說片的視覺系統（本集從零設計）。
// 依市場研究：深色新聞科技感、主色青、數字用琥珀黃、風險/未定用珊瑚、門檻與中性用紫；
// 兩黨只用低飽和藍/紅並列且必附文字，不做強烈紅藍對立。
export { FONT_ZH, FONT_EN, W, H, FPS } from "../theme";

export const K = {
  ink: "#070B1A",
  ink2: "#0E1430",
  card: "rgba(20, 26, 58, 0.82)",
  line: "rgba(255,255,255,0.08)",
  text: "#F4F6FF",
  dim: "rgba(244,246,255,0.62)",
  cyan: "#22E5D4",
  amber: "#FFC93C",
  coral: "#FF6B5A",
  violet: "#8B7CFF",
  dem: "#6F8FC7",
  rep: "#C77C7C",
  pending: "#5B6280",
};

/** 字幕與重要元素的安全範圍：上 220、下 300、左 64、右 120（避開 Shorts/Reels 右側按鈕） */
export const SAFE2 = { top: 220, bottom: 300, left: 64, right: 120 };

export const glow = (c: string, r = 12) => `drop-shadow(0 0 ${r / 2}px ${c}) drop-shadow(0 0 ${r}px ${c}88)`;
export const ring = (c: string) => `0 0 0 1.5px ${c}, 0 0 22px ${c}44, inset 0 0 18px ${c}1f`;

export type Status = "fact" | "expect" | "pending";
export const STATUS: Record<Status, { label: string; color: string }> = {
  fact: { label: "已確定", color: K.cyan },
  expect: { label: "分析預期", color: K.amber },
  pending: { label: "尚未確定", color: K.coral },
};

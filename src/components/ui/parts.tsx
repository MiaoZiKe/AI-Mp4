// 仿介面動畫的小零件：游標、點擊波紋、打字文字、視窗外框、圖示。顏色只讀 THEME_UI。
import React from "react";
import { Easing } from "remotion";
import { FONT_ZH, THEME_UI as T } from "../../theme";
import { EASE, tween } from "../anim";

export const px = (n: number) => Math.round(n);

/** 滑鼠游標（自繪箭頭）；press＝按下的程度 0–1 */
export const Cursor: React.FC<{ x: number; y: number; press?: number; opacity?: number }> = ({ x, y, press = 0, opacity = 1 }) => (
  <svg width={80} height={100} viewBox="0 0 32 40" style={{ position: "absolute", left: px(x), top: px(y), opacity, transform: `scale(${(1 - 0.12 * press).toFixed(3)})`, transformOrigin: "0 0", overflow: "visible" }}>
    <path d="M2 2 L2 30 L9.5 23.5 L14.5 35 L19.5 33 L14.5 21.5 L24.5 21.5 Z" fill={T.text} stroke={T.bg} strokeWidth={2.4} strokeLinejoin="round" />
  </svg>
);

/** 點擊波紋：at 幀起 motion.click 幀，圓環放大淡出 */
export const Ripple: React.FC<{ f: number; at: number; x: number; y: number; color: string }> = ({ f, at, x, y, color }) => {
  const p = tween(f, at, T.motion.click + 4, Easing.out(Easing.quad));
  if (f < at || p >= 1) return null;
  const r = 30 + 70 * p;
  return <div style={{ position: "absolute", left: px(x - r), top: px(y - r), width: px(2 * r), height: px(2 * r), borderRadius: T.radius.pill, border: `5px solid ${color}`, opacity: 1 - p }} />;
};

/** 打到第幾個字：start 起每 per 幀一個字 */
export const typedN = (f: number, start: number, n: number, per: number = T.motion.perChar) => Math.max(0, Math.min(n, Math.floor((f - start) / per) + 1));
/** 輸入游標（直線），打字中常亮，其餘每 8 幀閃一次 */
export const Caret: React.FC<{ f: number; h: number; color: string; solid?: boolean }> = ({ f, h, color, solid }) => (
  <span style={{ display: "inline-block", width: 4, height: h, marginLeft: 6, verticalAlign: "middle", background: color, opacity: solid || Math.floor(f / 8) % 2 === 0 ? 1 : 0 }} />
);

/** 視窗外框：標題列三個中性小圓點＋標題＋右側插槽 */
export const Window: React.FC<{ x: number; y: number; w: number; h: number; title: string; right?: React.ReactNode; bar?: number; style?: React.CSSProperties; children?: React.ReactNode }> = ({ x, y, w, h, title, right, bar = 76, style, children }) => (
  <div style={{ position: "absolute", left: x, top: y, width: w, height: h, background: T.panel, border: `2px solid ${T.line}`, borderRadius: T.radius.window, boxShadow: T.shadow, overflow: "hidden", ...style }}>
    <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: bar, borderBottom: `2px solid ${T.lineSoft}`, display: "flex", alignItems: "center", padding: "0 28px", gap: 12 }}>
      {[0, 1, 2].map((i) => <div key={i} style={{ width: 16, height: 16, borderRadius: T.radius.pill, background: T.line }} />)}
      <div style={{ marginLeft: 14, fontFamily: FONT_ZH, fontWeight: T.weight.body, fontSize: 30, color: T.text2, letterSpacing: "0.04em" }}>{title}</div>
      <div style={{ marginLeft: "auto" }}>{right}</div>
    </div>
    {children}
  </div>
);

export const SendIcon: React.FC<{ size: number; color: string }> = ({ size, color }) => (
  <svg width={size} height={size} viewBox="0 0 24 24"><path d="M12 19 V6 M6 11.5 L12 5.5 L18 11.5" fill="none" stroke={color} strokeWidth={2.8} strokeLinecap="round" strokeLinejoin="round" /></svg>
);
export const DocIcon: React.FC<{ size: number; color: string }> = ({ size, color }) => (
  <svg width={size} height={size} viewBox="0 0 24 24"><path d="M6 3 H14 L19 8 V21 H6 Z M14 3 V8 H19 M9 13 H16 M9 17 H14" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" /></svg>
);
export const CheckIcon: React.FC<{ size: number; color: string }> = ({ size, color }) => (
  <svg width={size} height={size} viewBox="0 0 24 24"><path d="M5 12.5 L10 17.5 L19 7" fill="none" stroke={color} strokeWidth={3.2} strokeLinecap="round" strokeLinejoin="round" /></svg>
);

/** AI 頭像：中性圓角方塊＋兩個字母，不是任何產品的標誌 */
export const Avatar: React.FC<{ size: number; text?: string }> = ({ size, text = "AI" }) => (
  <div style={{ width: size, height: size, borderRadius: size * 0.3, background: T.panel2, border: `2px solid ${T.line}`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FONT_ZH, fontWeight: T.weight.zh, fontSize: size * 0.4, color: T.text, letterSpacing: "0.02em", flexShrink: 0 }}>{text}</div>
);

/** 進場：淡入＋上移 dist px（motion.in 幀） */
export const rise = (f: number, at: number, dist = 20): React.CSSProperties => { const p = tween(f, at, T.motion.in, EASE.enter); return { opacity: p, transform: `translateY(${px(dist * (1 - p))}px)` }; };
/** 落定：scale from→1（motion.in 幀） */
export const slam = (f: number, at: number, from = 1.3) => { const p = tween(f, at, T.motion.in, EASE.enter); return { opacity: Math.min(1, p * 2), scale: from + (1 - from) * p }; };

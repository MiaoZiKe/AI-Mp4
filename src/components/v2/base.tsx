// styleVersion 2（A 奶油編輯）共用零件。顏色、陰影、圓角一律讀 THEME_V2；版面讀 LAYOUT_V2。
import React from "react";
import { AbsoluteFill, Img, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { FONT_EN, FONT_ZH, LAYOUT_V2 as L, THEME_V2 as T, accentV2 } from "../../theme";
import { iconShapeV2 } from "../Icons";
import { AMBIENT, DUR, EASE, enter, tween } from "../anim";
import { useCue } from "../../cue";

/** 卡片：暖白紙、2px 邊框、紙張陰影；topBar 傳色名時頂端加 6px 色條 */
export const CardV2: React.FC<{ topBar?: string; style?: React.CSSProperties; children: React.ReactNode }> = ({ topBar, style, children }) => (
  <div style={{ background: T.card, border: `${T.cardBorderW}px solid ${T.cardBorder}`, borderTop: topBar ? `${T.topBar}px solid ${accentV2(topBar).fill}` : undefined, borderRadius: T.radius, boxShadow: T.shadow, padding: 36, ...style }}>{children}</div>
);

/** 圖示：海軍藍方角線稿＋錯位色塊（套印風），不發光。draw 0→1 描線 */
export const IconV2: React.FC<{ name: string; color?: string; size?: number; draw?: number }> = ({ name, color, size = 110, draw = 1 }) => {
  const a = accentV2(color);
  const d = Math.min(1, Math.max(0, draw));
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" style={{ overflow: "visible", flex: "0 0 auto" }}>
      <circle cx={70} cy={68} r={34} fill={a.fill} opacity={T.icon.blobOpacity * d} />
      <g fill="none" stroke={T.icon.stroke} strokeWidth={T.icon.strokeW} strokeLinecap="square" strokeLinejoin="miter" strokeDasharray="1 1" strokeDashoffset={1 - d}>
        {iconShapeV2(name)}
      </g>
    </svg>
  );
};

/** 狀態標籤：淡底深字、8px 圓角 */
export const StatusTagV2: React.FC<{ status: string; text?: string; size?: number }> = ({ status, text, size = 28 }) => {
  const s = T.status[status] ?? T.status.expected;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", flex: "0 0 auto", minWidth: 150, height: size * 1.9, padding: "0 18px", borderRadius: T.radiusTag, background: s.bg, color: s.fg, fontFamily: FONT_ZH, fontSize: size, fontWeight: 700, letterSpacing: "0.04em", whiteSpace: "nowrap" }}>
      {text ?? s.zh}
    </span>
  );
};

/** 地球 logo（套印風） */
export const LogoV2: React.FC<{ size?: number }> = ({ size = 60 }) => (
  <svg width={size} height={size} viewBox="0 0 100 100">
    <circle cx={58} cy={56} r={32} fill={T.accent.yellow.fill} opacity={T.icon.blobOpacity} />
    <g fill="none" stroke={T.icon.stroke} strokeWidth={5} strokeLinecap="square">
      <circle cx={50} cy={50} r={36} /><ellipse cx={50} cy={50} rx={15} ry={36} /><path d="M14 50h72M20 32h60M20 68h60" />
    </g>
  </svg>
);

/** 背景：米白＋極淡圓點紙紋（靜態圖 public/bg/base-v2.png，scripts/make-bg.mjs 產生）；沒有任何漂移動畫 */
export const BackgroundV2: React.FC = () => (
  <AbsoluteFill style={{ background: T.bg }}>
    <Img src={staticFile(T.bgImage)} style={{ position: "absolute", left: 0, top: 0, width: 1080, height: 1920 }} />
  </AbsoluteFill>
);
/** 預先渲染用：米白底＋圓點 */
export const BackgroundStaticV2: React.FC = () => (
  <AbsoluteFill style={{ background: T.bg, backgroundImage: `radial-gradient(${T.dot.color} ${T.dot.r}px, transparent ${T.dot.r + 0.1}px)`, backgroundSize: `${T.dot.gap}px ${T.dot.gap}px` }} />
);

/** 固定元素：左上 logo＋白話國際、右上「國際白話講」方角膠囊、下方 4px 報頭線（兼全片進度：珊瑚色隨片長延伸） */
export const HeaderV2: React.FC<{ progress?: boolean }> = ({ progress = true }) => {
  const f = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const p = progress ? Math.min(1, f / Math.max(1, durationInFrames - 1)) : 0;
  return (
    <>
      <div style={{ position: "absolute", top: L.HEADER_TOP, left: L.X, right: L.X, height: 72, display: "flex", justifyContent: "space-between", alignItems: "center", fontFamily: FONT_ZH }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <LogoV2 />
          <span style={{ color: T.text, fontSize: 42, fontWeight: 900, letterSpacing: "0.04em" }}>白話國際</span>
        </div>
        <div style={{ border: `3px solid ${T.accent.pink.text}`, color: T.accent.pink.text, borderRadius: T.radiusTag, padding: "8px 24px", fontSize: 28, fontWeight: 700, letterSpacing: "0.06em" }}>國際白話講</div>
      </div>
      <div style={{ position: "absolute", top: L.RULE_Y, left: L.X, right: L.X, height: T.ruleW, background: T.rule }}>
        {progress && <div style={{ width: `${p * 100}%`, height: "100%", background: T.accent.pink.fill }} />}
      </div>
    </>
  );
};

/** kicker：大寫、粗、黃色底線 */
export const KickerV2: React.FC<{ text: string; style?: React.CSSProperties }> = ({ text, style }) => (
  <div style={{ display: "inline-flex", alignItems: "center", gap: 14, fontFamily: FONT_ZH, fontSize: 30, fontWeight: 700, color: T.text, letterSpacing: "0.08em", textTransform: "uppercase", borderBottom: `4px solid ${T.accent.yellow.fill}`, paddingBottom: 8, ...style }}>
    <span style={{ width: 14, height: 14, borderRadius: 2, background: T.accent.pink.fill }} />{text}
  </div>
);

/** 螢光筆底：p 0→1 從左畫到右（底部 34% 高） */
export const markerBg = (p: number) => {
  const w = Math.round(Math.min(1, Math.max(0, p)) * 100);
  return { backgroundImage: `linear-gradient(${T.marker}, ${T.marker})`, backgroundRepeat: "no-repeat", backgroundPosition: "0 88%", backgroundSize: `${w}% 34%` } as const;
};

/** 提示框（台灣視角、footer 結論）：淡黃底、左 8px 黃條 */
export const NoteBoxV2: React.FC<{ style?: React.CSSProperties; children: React.ReactNode }> = ({ style, children }) => (
  <div style={{ background: T.noteBg, borderLeft: `8px solid ${T.accent.yellow.fill}`, borderRadius: 4, padding: "18px 24px", fontFamily: FONT_ZH, fontSize: 32, lineHeight: 1.45, fontWeight: T.weight.body, color: T.text, ...style }}>{children}</div>
);

/** focus 值（THEME_V2.dim～1）→ 換色：灰階＋淡（dim 時對比仍 ≥3:1），focus=1 時不加 filter */
export const dimStyle = (focus: number): React.CSSProperties => {
  const g = Math.min(1, Math.max(0, (1 - focus) / (1 - T.dim)));
  return g > 0.001 ? { filter: `grayscale(${g.toFixed(3)})` } : {};
};
/** 進場＋focus 合成：opacity 乘上 focus 值、灰階換色（focus 不移動文字） */
export const reveal = (f: number, start: number, focus = 1, dist = 40) => {
  const e = enter(f, start, dist);
  return { opacity: e.opacity * focus, transform: e.transform, ...dimStyle(focus) };
};
/** 數字格式：負號用 U+2212 */
export const fmtNum = (v: number, decimals = 0) => {
  const s = Math.abs(v).toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
  return v < 0 && Number(s.replace(/,/g, "")) !== 0 ? `−${s}` : s;
};
export const EN: React.CSSProperties = { fontFamily: FONT_EN, color: T.text3, fontSize: 26, fontWeight: 400 };
export const drawIn = (f: number, start: number) => tween(f, start, DUR.l, EASE.enter);

/**
 * 每幕背景層（docs/layout-rules.md 四層的第 1 層）：紙紋（全片 BackgroundV2）之上加
 *  ① 深一階米色大色塊：在主視覺後方右下偏移 40px（2.5D 層次）
 *  ② 主色淡底出血色帶：安全區外 1700–1920（不搶內容）
 *  ③ 大字水印（4–7% 透明、480px、右側出血），背景層視差：整幕緩慢漂移 12px（速度比 0.2）
 * 顏色、尺寸全部讀 THEME_V2／LAYOUT_V2；隨場景一起轉場。
 */
export const SceneBackdropV2: React.FC<{ mark?: string; color?: string; fadeOut?: number; block?: boolean }> = ({ mark, color, fadeOut = 0, block = true }) => {
  const a = accentV2(color);
  const dx = 0; // v3：拿掉整幕漂移（運動層只留元素與 cue 鏡頭兩層）
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {block && <div style={{ position: "absolute", left: L.X + 40, top: L.CONTENT_TOP + 40, width: L.X_RIGHT - L.X, height: L.CONTENT_BOTTOM - L.CONTENT_TOP, borderRadius: L.BLOCK_RADIUS, background: T.block }} />}
      <div style={{ position: "absolute", left: 0, right: 0, top: L.SAFE_BOTTOM, bottom: 0, background: a.fill, opacity: T.blockTint }} />
      {mark && (
        <div style={{ position: "absolute", right: -120 + dx, top: L.CONTENT_TOP + 180, fontFamily: FONT_ZH, fontWeight: T.weight.title, fontSize: L.WATERMARK_PX, lineHeight: 1, color: T.watermark, opacity: L.WATERMARK_OPACITY * (1 - fadeOut), whiteSpace: "nowrap" }}>{mark}</div>
      )}
    </AbsoluteFill>
  );
};

/**
 * 2.5D 平移（圖表用）：整張圖表隨整幕由下往上緩慢漂移 THEME_V2.depth.panY px（EASE.move，不回彈、不縮放），
 * 從 +panY 漂回 0（最後對齊格線）：標題不碰報頭線（310），圖表底（約 1222＋36）不碰字幕區（1270）。
 */
export const PanStage: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // v3：拿掉整幕漂移（漂移會被量成「變化」卻不帶資訊；變化改由 cue 與關鍵詞微節拍提供）
  return <div>{children}</div>;
};

/**
 * 關鍵詞微節拍（v3 P0-2）：文字裡出現本幕的關鍵詞／cue 詞時，念到那一刻螢光筆從左劃過（DUR.m，之後保持）。
 * 填補 cue 之間 1.3–2.8 秒的靜止段；沒有命中時就是純文字。每段文字只標第一次出現。
 */
export const KwText: React.FC<{ text: string }> = ({ text }) => {
  const f = useCurrentFrame();
  const c = useCue();
  const words = (c.words ?? []).slice().sort((a, b) => b.text.length - a.text.length);
  if (!words.length || !text) return <>{text}</>;
  type Seg = { s: string; at?: number };
  let segs: Seg[] = [{ s: text }];
  for (const w of words) {
    const next: Seg[] = [];
    for (const g of segs) {
      if (g.at !== undefined) { next.push(g); continue; }
      const k = g.s.indexOf(w.text);
      const len = w.text.length;
      if (k < 0) { next.push(g); continue; }
      if (k > 0) next.push({ s: g.s.slice(0, k) });
      next.push({ s: g.s.slice(k, k + len), at: w.frame });
      if (k + len < g.s.length) next.push({ s: g.s.slice(k + len) });
    }
    segs = next;
  }
  return <>{segs.map((g, i) => (g.at === undefined ? <React.Fragment key={i}>{g.s}</React.Fragment> : <span key={i} style={{ ...markerBg(tween(f, g.at - 1, DUR.m, EASE.enter)) }}>{g.s}</span>))}</>;
};

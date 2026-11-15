// CaffAIne 頻道：左上角 LOGO（每幕同位置同大小）＋片尾卡（約 3.3 秒、無旁白）。
// 片尾卡的意思：像素方塊從四面八方飛進來拼成 LOGO 的框與杯 → 鎖定瞬間回彈、像素迸開、畫面震一下 → 杯裡冒出像素蒸氣
// → 「CaffAIne」八個字一個一個彈出（AI 兩字最亮）→ 標語 → 留言關鍵字。不是轉圈圈的載入圖示。
// 時間全部在 caffaineTimeline.json（招牌音 scripts/caffaine/sfx-caffaine.py 讀同一份）；位置與框在 caffaineEnd.ts（版面檢查共用）。
import React from "react";
import { AbsoluteFill } from "remotion";
import { Easing } from "remotion";
import { FONT_ZH } from "../../theme";
import { tween } from "../anim";
import { CAFF } from "./caffaineMark";
import { AICELLS, backOut, kwDy, tagDy, BAR_MAX, BAR_N, BAR_W, CC, hash, H, HITS, K, KW_BOX, LETTERS, LOGO_BOX, LX, MARK_CENTER, PIECES, S, STEAM, TAG_BOX, TAG_TEXT, TIMELINE as TL, W, WORD_BASE, WORD_X0, clamp, letterAt, letterBox, letterPop, lockScale, mx, my, piecePos, shakeAt } from "./caffaineEnd";

const MONO = "'JetBrains Mono', 'DejaVu Sans Mono', monospace";
const crisp = { shapeRendering: "crispEdges" } as const;
const px4 = (v: number) => Math.round(v / 4) * 4;

// ───────── 左上角 LOGO：圖形（框＋杯＋AI＋蒸氣）＋字標，靜態、每幕一樣 ─────────
const FramePath: React.FC<{ color?: string }> = ({ color = CC.cocoa }) => <polyline points={(CAFF.frame as unknown as number[][]).map((p) => p.join(",")).join(" ")} fill="none" stroke={color} strokeWidth={7} strokeLinejoin="miter" />;
export const CaffMark: React.FC = () => (
  <g {...crisp}>
    <FramePath />
    {(CAFF.cup as unknown as number[][]).map(([x, y], i) => <rect key={`c${i}`} x={x} y={y} width={8} height={8} fill={CC.caramel} />)}
    {(CAFF.ai as unknown as number[][]).map(([x, y], i) => <rect key={`a${i}`} x={x} y={y} width={8} height={8} fill={CC.cream} />)}
    {(CAFF.handle as unknown as number[][]).map(([x, y], i) => <rect key={`h${i}`} x={x} y={y} width={8} height={8} fill={CC.accent} />)}
    {(CAFF.steam as unknown as number[][]).map(([x, y], i) => <rect key={`s${i}`} x={x} y={y} width={8} height={8} fill={CC.accent} />)}
  </g>
);
/** 字標（字標單位：高 91，C 的左緣＝0）；litAI＝AI 的顏色 */
const GlyphAI: React.FC<{ which: "wordA" | "wordI"; x: number; fill: string }> = ({ which, x, fill }) => <g {...crisp} transform={`translate(${x} 0)`}>{(CAFF[which] as unknown as number[][]).map(([a, b], i) => <rect key={i} x={a} y={b} width={13} height={13} fill={fill} />)}</g>;
export const CaffWordmark: React.FC = () => (
  <g>
    {([0, 1, 2, 3, 6, 7] as const).map((i) => <text key={i} x={LX[i]} y={91} fontFamily={MONO} fontWeight={700} fontSize={124} fill={CC.cocoa}>{LETTERS[i]}</text>)}
    <GlyphAI which="wordA" x={LX[4]} fill={CC.caramel} />
    <GlyphAI which="wordI" x={LX[5]} fill={CC.caramel} />
  </g>
);
/** 頁首 LOGO：高 72px（含蒸氣），寬約 368px，放在 left 64 / top 222（和其他頻道的頁首同一列） */
export const CaffHeaderLogo: React.FC = () => {
  const ms = 72 / 176, wk = 40 / 91;
  return (
    <svg width={LOGO_BOX.w} height={LOGO_BOX.h} viewBox={`0 0 ${LOGO_BOX.w} ${LOGO_BOX.h}`} style={{ position: "absolute", left: LOGO_BOX.x, top: LOGO_BOX.y, overflow: "visible" }}>
      <g transform={`translate(${-18 * ms} ${-10 * ms}) scale(${ms})`}><CaffMark /></g>
      <g transform={`translate(${164 * ms + 14} ${LOGO_BOX.h / 2 - (91 * wk) / 2 + 2}) scale(${wk})`}><CaffWordmark /></g>
    </svg>
  );
};

// ───────── 片尾卡 ─────────
const BEATS: { f: number; a: number }[] = [{ f: TL.lock, a: 1 }, ...TL.letters.map((f, i) => ({ f, a: i === 4 || i === 5 ? 0.7 : 0.35 })), { f: TL.tagline, a: 0.5 }, { f: TL.tagline2, a: 0.5 }];
/** 上下兩條音量條：高度跟著招牌音的每一拍跳（只是裝飾，最高 200px） */
const Bars: React.FC<{ f: number; top: boolean }> = ({ f, top }) => {
  const bars = Array.from({ length: BAR_N }, (_, i) => {
    let h = 60 + Math.floor(hash(i * 2.3 + (top ? 0 : 9)) * 4) * 20 + 12 * Math.sin(f / 9 + i);
    for (const b of BEATS) { const t = f - b.f; if (t >= 0 && t < 14) h += b.a * 80 * (1 - t / 14) * (0.5 + 0.5 * hash(i * 1.7 + b.f)); }
    h = Math.min(BAR_MAX, Math.round(h / 10) * 10);
    const on = f > 4 ? 1 : 0;
    return <rect key={i} x={i * (BAR_W + 0) + 4} y={top ? 0 : H - h} width={BAR_W - 8} height={h * on} fill={hash(i * 6.1) > 0.6 ? CC.cocoa : CC.caramel} opacity={hash(i * 6.1) > 0.6 ? 0.14 : 0.26} />;
  });
  return <svg width={W} height={H} style={{ position: "absolute", left: 0, top: 0 }} {...crisp}>{bars}</svg>;
};

const Sparkle: React.FC<{ x: number; y: number; f: number; at: number; size?: number }> = ({ x, y, f, at, size = 16 }) => {
  const t = f - at; if (t < 0 || t > 12) return null;
  const k = t < 4 ? t / 4 : 1 - (t - 4) / 8, u = size * k;
  return <g {...crisp} fill={CC.glow}><rect x={x - u / 2} y={y - u * 2.2} width={u} height={u * 4.4} /><rect x={x - u * 2.2} y={y - u / 2} width={u * 4.4} height={u} /></g>;
};

export const CaffEnd: React.FC<{ f: number; keyword: string; fadeIn?: boolean }> = ({ f, keyword, fadeIn = false }) => {
  const sh = shakeAt(f), sc = lockScale(f), bgO = fadeIn ? tween(f, 0, 6) : 1;
  const L = TL.lock;
  const mc = MARK_CENTER;
  return (
    <AbsoluteFill style={{ opacity: bgO }}>
      <AbsoluteFill style={{ background: CC.bg }} />
      {/* 淡淡的像素點格 */}
      <svg width={W} height={H} style={{ position: "absolute", left: 0, top: 0 }} {...crisp}><defs><pattern id="cdots" width={40} height={40} patternUnits="userSpaceOnUse"><rect x={18} y={18} width={4} height={4} fill={CC.cocoa} opacity={0.08} /></pattern></defs><rect width={W} height={H} fill="url(#cdots)" /></svg>
      <Bars f={f} top />
      <Bars f={f} top={false} />
      {/* 飛入的方塊、迸開的像素、擴散框都只畫在 y≥320（頁首 LOGO 與進度條那一帶不被任何特效蓋到） */}
      <AbsoluteFill style={{ clipPath: "inset(320px 0 0 0)" }}>
      {/* 鎖定那一下：四方形的擴散框 */}
      {f >= L && f < L + 14 ? (() => { const t = (f - L) / 14, r = 380 + 560 * (1 - Math.pow(1 - t, 3)); return <svg width={W} height={H} style={{ position: "absolute", left: 0, top: 0 }} {...crisp}><rect x={mc.x - r} y={mc.y - r} width={2 * r} height={2 * r} fill="none" stroke={CC.caramel} strokeWidth={Math.max(2, 14 * (1 - t))} opacity={0.6 * (1 - t)} /></svg>; })() : null}
      <svg width={W} height={H} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }} {...crisp}>
        {/* 圖形：飛入 → 到位 → 鎖定回彈（整組一起震） */}
        <g transform={`translate(${sh.dx} ${sh.dy}) translate(${mc.x} ${mc.y}) scale(${sc}) translate(${-mc.x} ${-mc.y})`}>
          {PIECES.map((p) => {
            const a = piecePos(p, f);
            const ghosts = !a.done && f > 0 ? [0.07, 0.14, 0.21].map((b, k) => { const g = piecePos(p, f, b); return <rect key={k} x={g.x} y={g.y} width={g.w} height={g.h} fill={p.color} opacity={0.34 - k * 0.1} />; }) : null;
            return <g key={p.id}>{ghosts}<rect x={a.x} y={a.y} width={a.w} height={a.h} fill={p.color} /></g>;
          })}
          {/* AI：鎖定後一格一格閃亮進來 */}
          {AICELLS.map((c) => { const t = f - c.at; if (t < 0) return null; const on = t > 5 || Math.floor(t / 2) % 2 === 0; return on ? <rect key={c.j} x={mx(c.x)} y={my(c.y)} width={8 * S} height={8 * S} fill={t < 7 ? "#FFFFFF" : CC.cream} /> : null; })}
          {/* 蒸氣：由下往上長出來，長完以後一格一格輕輕上下飄 */}
          {STEAM.map((c) => { const t = f - c.at; if (t < 0) return null; const s = t < 5 ? 0.3 + 0.7 * Math.min(1, backOut(f, c.at, 5, 2.2)) : 1, drift = t > 8 ? (Math.sin(f * 0.2 - c.j * 0.8) > 0.2 ? -20 : 0) : 0, w = 8 * S * s; return <rect key={c.j} x={mx(c.x) + (8 * S - w) / 2} y={my(c.y) + (8 * S - w) / 2 + drift} width={w} height={w} fill={CC.accent} opacity={0.55 + 0.45 * (1 - c.j / STEAM.length)} />; })}
        </g>
        {/* 鎖定迸開的像素 */}
        {f >= L && f < L + 22 ? Array.from({ length: 36 }, (_, k) => {
          const t = (f - L) / (14 + 8 * hash(k * 3.3)); if (t >= 1) return null;
          const ang = hash(k * 7.7) * Math.PI * 2, r = (170 + 360 * (0.4 + 0.6 * hash(k * 2.1))) * (1 - Math.pow(1 - t, 3)) + 60, size = px4(12 + hash(k * 5.5) * 16);
          return <rect key={k} x={px4(mc.x + Math.cos(ang) * r * 1.0)} y={px4(mc.y + Math.sin(ang) * r * 1.05)} width={size} height={size} fill={[CC.caramel, CC.accent, CC.cocoa, CC.glow][k % 4]} opacity={1 - t * t} />;
        }) : null}
        {/* 字標：八個字一個一個彈出，AI 最亮 */}
        <g transform={`translate(${sh.dx} ${sh.dy})`}>
          {LETTERS.map((ch, i) => {
            const q = letterPop(i, f); if (!q.on) return null;
            const b = letterBox(i), isAI = i === 4 || i === 5, cx = b.x + b.w / 2, cy = b.y + b.h / 2;
            const t = f - letterAt(i), lit = isAI ? (Math.floor((f - letterAt(i)) / 4) % 2 === 0 ? CC.caramel : "#DE8A3E") : CC.cocoa;
            return (
              <g key={i} transform={`translate(${cx} ${cy + q.dy}) scale(${q.scale}) translate(${-cx} ${-cy})`}>
                <g transform={`translate(${WORD_X0 + LX[i] * K} ${WORD_BASE}) scale(${K})`}>
                  {isAI ? <g transform="translate(0 -91)"><g transform="translate(5 5)" opacity={t < 14 ? 1 : 0.9}><GlyphAI which={i === 4 ? "wordA" : "wordI"} x={0} fill={CC.glow} /></g><GlyphAI which={i === 4 ? "wordA" : "wordI"} x={0} fill={lit} /></g>
                    : <text x={0} y={0} fontFamily={MONO} fontWeight={700} fontSize={124} fill={lit}>{ch}</text>}
                </g>
              </g>
            );
          })}
          {/* AI 彈出時各迸一圈小像素＋星光 */}
          {[4, 5].map((i) => { const at = letterAt(i), t = f - at; if (t < 0 || t > 12) return null; const b = letterBox(i), cx = b.x + b.w / 2, cy = b.y + b.h / 2; return <g key={i}>{Array.from({ length: 8 }, (_, k) => { const a = (k / 8) * Math.PI * 2, r = 70 + 90 * (t / 12); return <rect key={k} x={px4(cx + Math.cos(a) * r)} y={px4(cy + Math.sin(a) * r * 0.9)} width={12} height={12} fill={k % 2 ? CC.glow : CC.caramel} opacity={1 - t / 12} />; })}<Sparkle x={cx + b.w * 0.45} y={b.y + 8} f={f} at={at + 2} size={14} /></g>; })}
        </g>
      </svg>
      </AbsoluteFill>
      {/* 標語：像素式一格一格抹出來（8 階），叮叮兩下各閃一顆星 */}
      {f >= TL.tagline ? (() => {
        const w = Math.min(1, Math.ceil(8 * clamp((f - TL.tagline) / 8)) / 8), up = tagDy(f);
        return (
          <div style={{ position: "absolute", left: TAG_BOX.x, top: TAG_BOX.y + up, width: TAG_BOX.w, height: TAG_BOX.h }}>
            <div style={{ width: `${w * 100}%`, height: "100%", overflow: "hidden", background: CC.cocoa, borderRadius: 4, boxShadow: `0 8px 0 ${CC.caramel}` }}>
              <div style={{ width: TAG_BOX.w, height: TAG_BOX.h, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FONT_ZH, fontWeight: 800, fontSize: 54, color: CC.cream, whiteSpace: "nowrap" }}>
                一杯咖啡的時間，看懂一個 <span style={{ color: CC.glow, margin: "0 12px" }}>AI</span> 新知
              </div>
            </div>
          </div>
        );
      })() : null}
      <svg width={W} height={H} style={{ position: "absolute", left: 0, top: 0, pointerEvents: "none" }}>
        <Sparkle x={TAG_BOX.x + TAG_BOX.w - 40} y={TAG_BOX.y - 6} f={f} at={TL.tagline} size={12} />
        <Sparkle x={TAG_BOX.x + 52} y={TAG_BOX.y - 6} f={f} at={TL.tagline2} size={12} />
      </svg>
      {/* 留言列 */}
      {f >= TL.keyword ? (() => {
        const t = clamp((f - TL.keyword) / 6), y = kwDy(f);
        return (
          <div style={{ position: "absolute", left: KW_BOX.x, top: KW_BOX.y + y, width: KW_BOX.w, height: KW_BOX.h, opacity: Math.min(1, t * 2) }}>
            <div style={{ width: "100%", height: "100%", boxSizing: "border-box", background: CC.cream, border: `6px solid ${CC.cocoa}`, borderRadius: 4, boxShadow: `0 8px 0 ${CC.cocoa}`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FONT_ZH, fontWeight: 800, fontSize: 58, color: CC.cocoa, whiteSpace: "nowrap" }}>
              留言「<span style={{ color: "#B35F1E", margin: "0 4px" }}>{keyword}</span>」拿完整資料
            </div>
          </div>
        );
      })() : null}
    </AbsoluteFill>
  );
};

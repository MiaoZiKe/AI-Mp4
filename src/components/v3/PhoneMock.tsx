// v3 手機：剪下來的實物照片（白邊貼紙）＋ HTML 排的螢幕內容。螢幕是自製的中性介面，不是任何真實軟體、不放商標。
// 自然尺寸＝機身 600×1164；螢幕內容以 LAYOUT_V3.SCREEN_W（526px）設計，字級在機身寬 600 時是原尺寸。
import React from "react";
import { Easing } from "remotion";
import { FONT_ZH, LAYOUT_V3 as L, THEME_V3 as T } from "../../theme";
import { DUR, EASE, tween } from "../anim";
import { Paper, useAssets } from "./assets";
import type { PieceProps } from "./Pieces";

const S = T.screen;
const Bar: React.FC<{ title?: string }> = ({ title }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "22px 26px 16px", height: 90, boxSizing: "border-box" }}>
    <div style={{ width: 50, height: 50, borderRadius: 25, background: S.ph3 }} />
    {title ? <div style={{ fontFamily: FONT_ZH, fontWeight: T.weight.en, fontSize: 40, color: S.text, letterSpacing: "0.02em" }}>{title}</div> : (
      <div style={{ flex: 1 }}><div style={{ height: 14, borderRadius: 7, background: S.ph, width: "46%" }} /><div style={{ height: 14, borderRadius: 7, background: S.ph, width: "28%", marginTop: 10, opacity: 0.7 }} /></div>
    )}
  </div>
);
const Spinner: React.FC<{ deg: number; size?: number }> = ({ deg, size = 50 }) => (
  <div style={{ width: size, height: size, borderRadius: size, border: `${Math.round(size * 0.12)}px solid ${S.ph3}`, borderTopColor: S.spin, margin: "6px auto 0", boxSizing: "border-box", transform: `rotate(${deg.toFixed(0)}deg)` }} />
);

/** 錯誤畫面：「無法載入／請再試一次」。state.pull 每設定一次＝螢幕內容被往下拉一次（拉慢、彈快），只在螢幕裡動 */
const ErrorScreen: React.FC<{ f: number; since: Record<string, number>; state: Record<string, any>; compact?: boolean }> = ({ f, since, state, compact }) => {
  const t0 = state.pull ? since.pull : -1e9;
  const pull = 100 * (tween(f, t0, DUR.m, EASE.enter) - tween(f, t0 + DUR.m + 2, DUR.xs + 1, EASE.exit));
  const deg = 38 + 320 * tween(f, t0, DUR.l, Easing.linear) + Math.floor(f / 2) * 14;   // 載入圈一直在轉（每 2 幀一格）
  if (compact) return (
    <div style={{ paddingTop: 150, textAlign: "center", fontFamily: FONT_ZH }}>
      <Spinner deg={deg} size={110} />
      <div style={{ fontWeight: 900, fontSize: 104, lineHeight: 1.2, color: S.text, marginTop: 50 }}>無法<br />載入</div>
    </div>
  );
  return (
    <div style={{ transform: `translateY(${Math.round(pull)}px)` }}>
      {/* 下拉時上方露出的重新整理帶（跟著內容一起被拉下來） */}
      <div style={{ position: "absolute", left: 0, right: 0, top: -400, height: 400, background: S.ph3, display: "flex", alignItems: "flex-end", justifyContent: "center", paddingBottom: 30, boxSizing: "border-box" }}><Spinner deg={deg * 2} size={64} /></div>
      <Bar />
      <Spinner deg={deg} />
      <div style={{ margin: "24px 30px 0", padding: "30px 20px 32px", background: S.card, borderRadius: 22, textAlign: "center", boxShadow: `0 2px 0 ${S.cardEdge}`, fontFamily: FONT_ZH }}>
        <div style={{ fontWeight: 900, fontSize: 58, lineHeight: 1.2, color: S.text, letterSpacing: "0.02em" }}>無法載入</div>
        <div style={{ fontWeight: 700, fontSize: 34, color: T.ink2, marginTop: 8 }}>請再試一次</div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 6, marginTop: 30 }}>{Array.from({ length: 12 }, (_, i) => <i key={i} style={{ display: "block", aspectRatio: "1", background: S.ph2 }} />)}</div>
    </div>
  );
};

/** 照片牆：三格照片（紙片 photo）。state.photos＝[1,1,1]，0＝被抽走只剩空框；state.scroll 每設定一次往上捲一小段 */
export const TILE = { top: 90, h: 266, photoW: 280 } as const;
const GridScreen: React.FC<{ f: number; since: Record<string, number>; state: Record<string, any> }> = ({ f, since, state }) => {
  const n = Number(state.scroll ?? 0);
  const sc = n ? -64 * (n - 1 + tween(f, since.scroll, DUR.s, EASE.move)) : 0;
  const photos: number[] = state.photos ?? [1, 1, 1];
  return (
    <div>
      <Bar />
      <div style={{ transform: `translateY(${Math.round(sc)}px)` }}>
        {photos.map((on, i) => (
          <div key={i} style={{ height: TILE.h, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ width: TILE.photoW + 16, height: 250, background: S.ph2, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", boxSizing: "border-box" }}>
              {on ? <Paper asset="photo" w={TILE.photoW} /> : <div style={{ marginTop: -6 }}><Spinner deg={(f * 12) % 360} size={64} /></div>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * 聊天畫面：灰色泡泡＋最後一則「傳送中…」。state.title＝螢幕上方小標（純文字）；
 * state.msgs＝已出現幾則（1–4，每設定一次多冒一則，由下往上 4 幀；沒寫＝4 則都在）；state.fail＝true 時轉圈停住、最後一則變成紅字「傳送失敗」。
 */
const ChatScreen: React.FC<{ f: number; state: Record<string, any>; since: Record<string, number> }> = ({ f, state, since }) => {
  const n = state.msgs === undefined ? 4 : Number(state.msgs);
  const bub = (i: number, w: number, me = false, child?: React.ReactNode, bg?: string) => {
    if (i >= n) return null;
    const p = state.msgs !== undefined && i === n - 1 ? tween(f, since.msgs, DUR.xs, EASE.enter) : 1;
    return (
      <div style={{ display: "flex", justifyContent: me ? "flex-end" : "flex-start", padding: "0 26px", marginTop: 22, transform: `translateY(${Math.round(26 * (1 - p))}px)` }}>
        <div style={{ width: w, minHeight: 84, borderRadius: 30, background: bg ?? (me ? S.bubbleMe : S.bubble), boxShadow: bg ? `inset 0 0 0 4px ${S.fail}` : undefined, display: "flex", alignItems: "center", justifyContent: "center", gap: 14, fontFamily: FONT_ZH, fontWeight: 700, fontSize: 40, color: S.text2 }}>{child}</div>
      </div>
    );
  };
  const fail = Boolean(state.fail);
  return (
    <div>
      <Bar title={state.title} />
      {bub(0, 300)}{bub(1, 220)}{bub(2, 260, true)}
      {bub(3, 330, true, fail
        ? <span style={{ color: S.fail, fontWeight: 900 }}>傳送失敗</span>
        : <><div style={{ margin: "-6px 0 0" }}><Spinner deg={(f * 14) % 360} size={40} /></div><span style={{ color: S.text }}>傳送中…</span></>, fail ? S.failBg : undefined)}
    </div>
  );
};

/**
 * 留言框：三個沒有圖案的圓角方塊（state.hop 每設定一次依序跳一次，隔 3 幀，跳 64px）＋留言框。
 * state.typing＝要打的字（設定的那一刻起每 4 幀打一個字，游標跟在字後面）；打完後字尾的「…」每 8 幀多一點、三點後重來。
 */
const CommentScreen: React.FC<{ f: number; since: Record<string, number>; state: Record<string, any> }> = ({ f, since, state }) => {
  const t0 = state.hop ? since.hop : 1e9;
  const rise = tween(f, since.screen ?? -1e9, DUR.s - 2, EASE.enter);
  const txt = String(state.typing ?? ""), tt = txt ? f - since.typing : -1;
  const shown = txt ? txt.slice(0, Math.max(0, Math.min(txt.length, Math.floor(tt / 4) + 1))) : "";
  const dots = txt && tt >= txt.length * 4 ? "・".repeat(1 + (Math.floor((tt - txt.length * 4) / 8) % 3)) : "";
  return (
    <div>
      <Bar />
      <div style={{ display: "flex", justifyContent: "center", gap: 34, marginTop: 70 }}>
        {[0, 1, 2].map((i) => { const a = t0 + i * 3; const up = tween(f, a, DUR.xs, EASE.enter) - tween(f, a + DUR.xs, DUR.s, EASE.move); return <div key={i} style={{ width: 124, height: 124, borderRadius: 30, background: [S.ph3, S.bubbleMe, S.ph][i], transform: `translateY(${Math.round(-64 * up)}px)` }} />; })}
      </div>
      <div style={{ margin: "90px 26px 0", height: 330, background: S.card, borderRadius: 26, boxShadow: `0 2px 0 ${S.cardEdge}`, padding: "34px 30px", boxSizing: "border-box", transform: `translateY(${Math.round(260 * (1 - rise))}px)` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {txt ? <div style={{ fontFamily: FONT_ZH, fontWeight: 700, fontSize: 44, color: S.text, whiteSpace: "nowrap" }}>{shown}<span style={{ color: S.text2 }}>{dots}</span></div> : null}
          <div style={{ width: 6, height: 64, background: T.ink, opacity: txt && tt < txt.length * 4 ? 1 : Math.floor(f / 12) % 2 ? 0 : 1 }} />
          {txt ? null : <div style={{ fontFamily: FONT_ZH, fontWeight: 700, fontSize: 44, color: S.ph3 }}>{state.placeholder ?? "留言…"}</div>}
        </div>
        <div style={{ height: 14, borderRadius: 7, background: S.ph2, width: "70%", marginTop: 60 }} /><div style={{ height: 14, borderRadius: 7, background: S.ph2, width: "44%", marginTop: 22 }} />
      </div>
    </div>
  );
};

const screenOf = (name: string, p: { f: number; state: Record<string, any>; since: Record<string, number> }) => {
  if (name === "error") return <ErrorScreen {...p} />;
  if (name === "error-big") return <ErrorScreen {...p} compact />;
  if (name === "grid") return <GridScreen {...p} />;
  if (name === "chat") return <ChatScreen {...p} />;
  if (name === "comment") return <CommentScreen {...p} />;
  return null;
};
export const PHONE_SCREENS = ["error", "error-big", "grid", "chat", "comment", "blank"];

/**
 * state.screen："error"｜"error-big"（小手機用，只有大字）｜"grid"｜"chat"｜"comment"｜"blank"。
 * 換畫面：新畫面由螢幕下緣推上來 6 幀；state.swap === "cut" 時同一幀切換（s11 三支同時出錯）。
 */
export const PhoneMock: React.FC<PieceProps> = ({ f, state, since, prev }) => {
  const { assets } = useAssets();
  const [, , bw, bh] = assets["phone"].body;
  const [l, t, r, b] = L.SCREEN_BOX;
  const sw = (r - l) * bw, sh = (b - t) * bh, k = sw / L.SCREEN_W;
  const cur = state.screen ?? "blank";
  const p = state.swap === "cut" || since.screen < -1e8 ? 1 : tween(f, since.screen, DUR.s - 2, EASE.enter);
  const args = { f, state, since };
  return (
    <Paper asset="phone">
      <div style={{ position: "absolute", left: l * bw, top: t * bh, width: sw, height: sh, background: S.bg, borderRadius: 10, overflow: "hidden" }}>
        <div style={{ width: L.SCREEN_W, height: sh / k, transform: `scale(${k})`, transformOrigin: "0 0", position: "relative" }}>
          {p < 1 && prev.screen ? <div style={{ position: "absolute", inset: 0 }}>{screenOf(prev.screen, args)}</div> : null}
          <div style={{ position: "absolute", inset: 0, background: S.bg, transform: `translateY(${Math.round((sh / k) * (1 - p))}px)` }}>{screenOf(cur, args)}</div>
        </div>
      </div>
    </Paper>
  );
};

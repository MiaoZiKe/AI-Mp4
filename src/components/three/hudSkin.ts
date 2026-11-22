// 深色 HUD 目前用哪一套頻道皮膚（script.json 頂層 hudSkin；沒寫＝"deep"）。Hud.tsx／HudArt.tsx 的顏色都讀這裡的 H。
// VideoHud／CoverHud 每次渲染一開始呼叫 setHudSkin；一次渲染只有一支片，所以用模組變數就夠。
// 2026/11/15：版面也放在這裡（hud.layout: "fill"＝撐滿版面，見 theme.ts 的 LAYOUT_3D_FILL）；setHudLayout 同時把 3D 舞台框告訴 engine（標籤投影用）。
import { hudTheme, LAYOUT_3D, LAYOUT_3D_DEFAULT_HUD, LAYOUT_3D_FILL, type HudTheme } from "../../theme";
import { setStage } from "./engine";
import type React from "react";
export let H: HudTheme = hudTheme();
/** 小字的下限（hud.smallPx；沒寫＝0＝照原本的字級） */
export let SMALL = 0;
export const setHudSkin = (name?: string, small?: number) => { H = hudTheme(name); SMALL = small ?? 0; return H; };
/** 小字：原本的字級和 hud.smallPx 取大的 */
export const sm = (px: number) => Math.max(px, SMALL);

type Lay = { -readonly [K in keyof typeof LAYOUT_3D]: number } & { -readonly [K in keyof typeof LAYOUT_3D_DEFAULT_HUD]: number };
const layoutOf = (name?: string): Lay => ({ ...LAYOUT_3D, ...LAYOUT_3D_DEFAULT_HUD, ...(name === "fill" ? LAYOUT_3D_FILL : {}) }) as Lay;
/** HUD 片的版面（hud.layout；沒寫＝原本的 LAYOUT_3D） */
export let L: Lay = layoutOf();
/** 3D 畫布框：CANVAS_H 有寫就是「置中在主素材區中心、固定高度」的框（舞台變高時透視比例不變）；沒寫＝整個舞台 */
export const canvasBox = (l: Lay = L) => { if (!l.CANVAS_H) return { top: l.STAGE_TOP, h: l.STAGE_H }; const cy = (l.STAGE_TOP + l.BAND_TOP + l.STAGE_TOP + l.STAGE_H - l.BAND_BOTTOM) / 2; return { top: Math.round(cy - l.CANVAS_H / 2), h: l.CANVAS_H }; };
export const setHudLayout = (name?: string) => { L = layoutOf(name); const c = canvasBox(L); setStage(c.top, c.h); return L; };

// 示意卡（section）左上標題色塊的幾何：所有 Hud*.tsx 的 Card 共用。行高寫成明確的像素（不靠瀏覽器的 normal），
// 標題下緣才算得出來；卡片內容的第一列一律從 CARD_CONTENT_TOP 以下開始，不准貼著或蓋到標題。
// 2026/11/22 Andy 看 tech-icdesign「台灣誰在做」標題壓到「設計服務」膠囊：「這邊發生重疊 需要避免以後繼續發生」。
export const CARD_HEAD = { top: 10, px: 30, padT: 2, padB: 4, lh: 42, gap: 8 } as const;
/** 標題色塊下緣（卡片內座標，和 svg inset:0 同一個原點） */
export const CARD_HEAD_BOTTOM = CARD_HEAD.top + CARD_HEAD.padT + CARD_HEAD.lh + CARD_HEAD.padB;
/** 卡片內容（膠囊、色塊、圖）最上緣的下限 */
export const CARD_CONTENT_TOP = CARD_HEAD_BOTTOM + CARD_HEAD.gap;
/** 標題色塊的位置與盒子（字型、顏色另外疊上） */
export const cardTitleBox = (left = 16): React.CSSProperties => ({ position: "absolute", left, top: CARD_HEAD.top, padding: `${CARD_HEAD.padT}px 14px ${CARD_HEAD.padB}px`, lineHeight: `${CARD_HEAD.lh}px` });

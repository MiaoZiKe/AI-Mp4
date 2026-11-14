// 深色 HUD 目前用哪一套頻道皮膚（script.json 頂層 hudSkin；沒寫＝"deep"）。Hud.tsx／HudArt.tsx 的顏色都讀這裡的 H。
// VideoHud／CoverHud 每次渲染一開始呼叫 setHudSkin；一次渲染只有一支片，所以用模組變數就夠。
import { hudTheme, type HudTheme } from "../../theme";
export let H: HudTheme = hudTheme();
/** 小字的下限（hud.smallPx；沒寫＝0＝照原本的字級） */
export let SMALL = 0;
export const setHudSkin = (name?: string, small?: number) => { H = hudTheme(name); SMALL = small ?? 0; return H; };
/** 小字：原本的字級和 hud.smallPx 取大的 */
export const sm = (px: number) => Math.max(px, SMALL);

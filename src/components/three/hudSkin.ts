// 深色 HUD 目前用哪一套頻道皮膚（script.json 頂層 hudSkin；沒寫＝"deep"）。Hud.tsx／HudArt.tsx 的顏色都讀這裡的 H。
// VideoHud／CoverHud 每次渲染一開始呼叫 setHudSkin；一次渲染只有一支片，所以用模組變數就夠。
// 2026/11/15：版面也放在這裡（hud.layout: "fill"＝撐滿版面，見 theme.ts 的 LAYOUT_3D_FILL）；setHudLayout 同時把 3D 舞台框告訴 engine（標籤投影用）。
import { hudTheme, LAYOUT_3D, LAYOUT_3D_DEFAULT_HUD, LAYOUT_3D_FILL, type HudTheme } from "../../theme";
import { setStage } from "./engine";
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
export const setHudLayout = (name?: string) => { L = layoutOf(name); setStage(L.STAGE_TOP, L.STAGE_H); return L; };

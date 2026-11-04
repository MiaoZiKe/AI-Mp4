import { continueRender, delayRender, staticFile } from "remotion";
import { loadFont as loadTC, getInfo as tcInfo } from "@remotion/google-fonts/NotoSansTC";
import { loadFont as loadInter, getInfo as interInfo } from "@remotion/google-fonts/Inter";

/**
 * 字型：Noto Sans TC + Inter（@remotion/google-fonts）。
 * 若 public/fonts/manifest.json 存在（npm run fonts 產生的本地鏡像），改從本地載入同一批子集，
 * 以支援 Chrome 無法直連 fonts.gstatic.com 的環境；否則直接用 Google Fonts。
 */
const loadFonts = () => {
  const handle = delayRender("fonts");
  const google = () => {
    const fams = [
      loadTC("normal", { weights: ["400", "700", "900"] }),
      loadInter("normal", { weights: ["400", "600", "800"], subsets: ["latin", "latin-ext"] }),
    ];
    Promise.all(fams.map((f) => f.waitUntilDone())).finally(() => continueRender(handle));
  };
  fetch(staticFile("fonts/manifest.json"))
    .then((r) => (r.ok ? r.json() : Promise.reject(new Error("no manifest"))))
    .then((list: { family: string; weight: string; unicodeRange: string; file: string }[]) =>
      Promise.all(list.map((f) => {
        const ff = new FontFace(f.family, `url(${staticFile(f.file)}) format("woff2")`, { weight: f.weight, unicodeRange: f.unicodeRange });
        document.fonts.add(ff);
        return ff.load();
      })).then(() => continueRender(handle)))
    .catch(google);
};
if (typeof document !== "undefined") loadFonts();

export const FONT_ZH = `"${interInfo().fontFamily}", "${tcInfo().fontFamily}", sans-serif`;
export const FONT_EN = `"${interInfo().fontFamily}", sans-serif`;

export const W = 1080;
export const H = 1920;
export const FPS = 30;
export const SAFE = { top: 220, bottom: 220, x: 64 };

export const C = {
  bg: "#0B1026",
  cyan: "#22E5D4",
  pink: "#FF4FA3",
  yellow: "#FFD54A",
  purple: "#8B7CFF",
  white: "#FFFFFF",
  // 政治中立：低飽和紅藍，只在需要區分兩黨時使用，且一律附文字標示
  dem: "#6F8FC9",
  rep: "#C9807A",
  undecided: "#5B6280",
  card: "rgba(18, 26, 60, 0.72)",
};

export type Accent = "cyan" | "pink" | "yellow" | "purple";
export const accent = (a?: string) => (C as Record<string, string>)[a ?? "cyan"] ?? C.cyan;

export const glow = (color: string, r = 12) => `drop-shadow(0 0 ${r / 2}px ${color}) drop-shadow(0 0 ${r}px ${color}88)`;
export const boxGlow = (color: string) => `0 0 18px ${color}55, inset 0 0 12px ${color}22`;

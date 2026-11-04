import { continueRender, delayRender, staticFile } from "remotion";
import { getInfo as notoInfo } from "@remotion/google-fonts/NotoSansTC";
import { getInfo as monoInfo } from "@remotion/google-fonts/JetBrainsMono";

/**
 * 以 @remotion/google-fonts 的字型資訊（family、unicode-range、分片）為準，
 * 從本地 public/fonts 載入（由 scripts/fonts.mjs 預先下載），避免渲染時大量網路請求。
 */
type Info = { fontFamily: string; unicodeRanges: unknown; fonts: unknown };
const load = (info: Info, dir: string, weights: string[], only?: string[]) => {
  if (typeof FontFace === "undefined") return;
  const handle = delayRender(`Loading ${info.fontFamily}`, { timeoutInMilliseconds: 120000 });
  const ranges = info.unicodeRanges as Record<string, string>;
  const fonts = info.fonts as Record<string, Record<string, Record<string, string>>>;
  const ps: Promise<unknown>[] = [];
  for (const w of weights) {
    for (const key of Object.keys(fonts.normal[w])) {
      if (only && !only.includes(key)) continue;
      const file = staticFile(`fonts/${dir}/${w}-${key.replace(/[[\]]/g, "")}.woff2`);
      const ff = new FontFace(info.fontFamily, `url(${file}) format('woff2')`, { weight: w, style: "normal", unicodeRange: ranges[key] });
      (document.fonts as unknown as { add: (f: FontFace) => void }).add(ff);
      ps.push(ff.load().catch((e) => console.error("font", file, e)));
    }
  }
  Promise.all(ps).then(() => continueRender(handle));
};

export const NOTO_FAMILY = notoInfo().fontFamily;
export const MONO_FAMILY = monoInfo().fontFamily;
load(notoInfo(), "NotoSansTC", ["500", "700", "900"]);
load(monoInfo(), "JetBrainsMono", ["400", "700"], ["latin"]);

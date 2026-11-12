// v3 紙材：public/v3/<slug>/*.png＋meta.json（scripts/make-paper.py 產生；lib.mjs 讀進 inputProps.v3.assets）
import React, { createContext, useContext } from "react";
import { Img, staticFile } from "remotion";

export type AssetMeta = { w: number; h: number; body: [number, number, number, number]; [k: string]: any };
export type AssetCtx = { slug: string; assets: Record<string, AssetMeta>; ambient: boolean };
export const AssetContext = createContext<AssetCtx>({ slug: "", assets: {}, ambient: true });
export const useAssets = () => useContext(AssetContext);
export const useAsset = (name: string) => {
  const c = useAssets();
  const m = c.assets[name];
  if (!m) throw new Error(`v3 紙材不存在：${name}（先 python3 scripts/make-paper.py ${c.slug}，或檢查 asset 名稱）`);
  return { ...m, src: staticFile(`v3/${c.slug}/${name}.png`) } as AssetMeta & { src: string };
};

/**
 * 一張紙材圖：w＝「紙本體」要顯示的寬度（px）。回傳的盒子大小＝紙本體，落影留白往外溢出，
 * 所以排版、定位都以紙本體為準。children 疊在紙本體上（文字、膠帶）。
 */
export const Paper: React.FC<{ asset: string; w?: number; style?: React.CSSProperties; children?: React.ReactNode }> = ({ asset, w, style, children }) => {
  const a = useAsset(asset);
  const [bx, by, bw, bh] = a.body;
  const k = (w ?? bw) / bw;
  return (
    <div style={{ position: "relative", width: bw * k, height: bh * k, ...style }}>
      <Img src={a.src} style={{ position: "absolute", left: -bx * k, top: -by * k, width: a.w * k, height: a.h * k, maxWidth: "none" }} />
      {children}
    </div>
  );
};

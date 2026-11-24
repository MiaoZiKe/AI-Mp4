// 2026/11/24 矽晶圓-1／-2：在共用的 Brand.tsx 表裡登記晶圓廠 LOGO 與韓國國旗（不另寫一套元件；import 這個檔就會加進 LOGOS／FLAGS）。
//   Andy 11/24：「有國家就標上國旗，有公司就附上 LOGO」。LOGO 只用 Wikimedia Commons 原檔（官網這台機器連不到），不重畫、不改色；
//   來源同時寫在 videos/tech-wafer1/assets.md、videos/tech-wafer2/assets.md。
import React from "react";
import { FLAGS, LOGOS } from "./Brand";

const add = (id: string, spec: (typeof LOGOS)[string]) => { if (!LOGOS[id]) LOGOS[id] = spec; };
// w:h＝原檔 viewBox 比例（抓檔時量）
add("shinetsu", { file: "logos/shinetsu.svg", w: 179, h: 39.425, name: "信越化學 Shin-Etsu", source: "https://commons.wikimedia.org/wiki/File:Shin-Etsu_Chemical_logo.svg" });
// 世創：原檔只寫 width／height 沒有 viewBox（縮放時會被裁切），只補上同尺寸的 viewBox，圖形與顏色不動
add("siltronic", { file: "logos/siltronic.svg", w: 744.09448, h: 288.4252, name: "世創 Siltronic", source: "https://commons.wikimedia.org/wiki/File:Siltronic_Logo.svg" });

// 韓國（太極旗）：3:2；太極直徑＝旗高 1/2；卦長＝旗高 1/4、卦線寬 1/24、間距 1/48；紅 #CD2E3A、藍 #0047A0、黑 #000000
// （대한민국 국기법 시행령；畫法同 Wikimedia Commons「Flag of South Korea.svg」的幾何，以 72×48 繪製）
if (!FLAGS.KR) FLAGS.KR = { name: "韓國", w: 72, h: 48, draw: () => (
  <g transform="translate(36 24)">
    <rect x={-36} y={-24} width={72} height={48} fill="#FFFFFF" />
    <g transform="rotate(-56.3099325)">
      <path d="M-6-25H6M-6-22H6M-6-19H6" stroke="#000000" strokeWidth={2} />
      <path d="M-6 19H6M-6 22H6M-6 25H6" stroke="#000000" strokeWidth={2} />
      <path d="M0,17v10" stroke="#FFFFFF" strokeWidth={1} />
      <circle r={12} fill="#CD2E3A" />
      <path d="M0-12A6,6 0 0 0 0,0A6,6 0 0 1 0,12A12,12 0 0,1 0-12Z" fill="#0047A0" />
    </g>
    <g transform="rotate(-123.6900675)">
      <path d="M-6-25H6M-6-22H6M-6-19H6" stroke="#000000" strokeWidth={2} />
      <path d="M-6 19H6M-6 22H6M-6 25H6" stroke="#000000" strokeWidth={2} />
      <path d="M0-23.5v3M0,17v3.5M0,23.5v3" stroke="#FFFFFF" strokeWidth={1} />
    </g>
  </g>
) };
export {};

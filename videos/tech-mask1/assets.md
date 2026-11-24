# tech-mask1 素材來源（2026/11/24 v2）

## 公司 LOGO（官方原檔，不重畫、不改色；檔案在 `public/logos/`，登記在 `src/components/three/Brand.tsx` 的 LOGOS）
| 公司 | 出現在 | 檔案 | 來源 | 授權標示 |
|---|---|---|---|---|
| 豪雅 HOYA | s10 3D 標籤、mk1-co 卡 | `public/logos/hoya.png`（960×273） | Wikimedia Commons〈File:Hoya_Corporation_logo.svg〉，作者 Hoya Corporation；用 Commons 自己的 thumb.php 由原檔 SVG 轉出 960px PNG | PD-textlogo（商標） |
| 旭硝子 AGC | s10 3D 標籤、mk1-co 卡 | `public/logos/agc.png`（960×332） | Wikimedia Commons〈File:AGC_Logo.svg〉（Commons 頁註明 2018 起現行版；舊版 File:AGC_logo.svg 是 2015 前的，不用），作者 AGC Inc.；thumb.php 轉出 960px PNG | PD-textlogo（商標） |
| ASML | s4 mk1-x4 卡右上（出處「光罩設計手冊」旁） | `public/logos/asml.svg`（原檔 SVG，色 #0f238c） | Wikimedia Commons〈File:ASML_Holding_N.V._logo.svg〉 | PD-textlogo（商標） |

- HOYA、AGC 沒有直接存 SVG 原檔：2026/11/24 抓取時 upload.wikimedia.org 對本機 IP 連續回 429（限流），官網 hoya.com、agc.com 在這個環境連不到（代理拒絕）；改用 Commons 官方縮圖服務（commons.wikimedia.org/w/thumb.php）由同一個原檔轉出的 PNG，外觀與原檔一致。之後能連上時可換回 SVG（只改 Brand.tsx 的 file 與 w/h）。
- 片中其他出現的名稱是研究機構與資料來源（IC Knowledge、IBS、SemiAnalysis、QYResearch、Morningstar、USPTO、Wikipedia），只在出處列，沒放 LOGO。

## 國旗（程式繪製，`Brand.tsx` 的 FLAGS）
| 國旗 | 出現在 | 規格 |
|---|---|---|
| 日本 JP | s10 豪雅、旭硝子標籤；mk1-co 卡「幾乎都來自日本這兩家」 | 2:3、日章直徑＝旗高 3/5 置中、紅 #BC002D（國旗國歌法） |
| 荷蘭 NL | s4 mk1-x4 卡 ASML LOGO 旁 | 2:3 紅白藍三等分、#AE1C28／#21468B |

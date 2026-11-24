# tech-mask2 素材來源（LOGO、國旗、地圖）

Andy 2026/11/24：「有國家就標上國旗，有公司就順把 LOGO 附上」。LOGO 一律官網或 Wikimedia Commons 原檔，未重畫、未改色；商標權屬各公司，片中只作辨識。
3D 廠牌與旗子貼圖：`node scripts/three/make-brand-tex.mjs`（genmodel.py 自動跑）把下列原檔放到白色廠牌上轉成 PNG（`public/tex/brand/`，不進 git），只縮放不改色。

## 公司 LOGO（`public/logos/`，登記在 `src/components/three/Brand.tsx` 的 LOGOS）
| 公司 | 檔案 | 來源網址（抓取日 2026/11/24） | 授權／備註 |
|---|---|---|---|
| 台積電 | tsmc.svg | https://commons.wikimedia.org/wiki/File:Tsmc-text.svg（複製自 tw-rotation site/articles/logos/2330.svg） | Commons：Public domain（商標） |
| 英特爾 | intel.svg | https://commons.wikimedia.org/wiki/File:Intel_logo_2023.svg | Commons：Public domain（商標） |
| 三星 | samsung.svg | https://commons.wikimedia.org/wiki/File:Samsung_wordmark.svg | Commons：Public domain（商標） |
| 大日本印刷 DNP | dnp.svg | https://www.global.dnp/content/dam/dnp-global/common/img/logo.svg | 官網。Commons 的 File:Dai_Nippon_Printing_logo.svg 連續 429 限流抓不到，改官網 |
| Tekscend Photomask（原凸版光罩） | tekscend.svg | https://www.photomask.com/assets/img/common/header_logo.svg | 官網（Commons 沒有這個新品牌的檔） |
| Photronics | photronics.svg | https://www.photronics.com/wp-content/uploads/2018/11/logo.svg | 官網。Commons 的 File:Photronics_Inc_logo.svg 連續 429 抓不到 |
| 英特格 Entegris | entegris.svg | https://www.entegris.com/content/dam/web/ux/global/header/logo-header-desktop.svg | 官網 |
| 家登 Gudeng | gudeng.svg | https://www.gudeng.com/img/logo.svg（複製自 tw-rotation site/articles/logos/3680.svg） | 官網 |
| 艾司摩爾 ASML | asml.svg（共用，先前已在 Brand.tsx） | https://commons.wikimedia.org/wiki/File:ASML_Holding_N.V._logo.svg | Commons：Public domain |

## 抓不到原檔的（改用文字名牌）
- **台灣光罩（2338）**：試過 3 個來源都失敗 →
  1. 官網 https://www.tmcnet.com.tw/ ：伺服器沒有送中繼憑證（GoDaddy G2），TLS 驗證失敗（curl 60）；中繼憑證來源 certs.godaddy.com 不在允許清單，不關驗證。
  2. Wikimedia Commons：搜尋「Taiwan Mask」「Taiwan Mask Corporation」沒有 LOGO 檔。
  3. WebSearch「台灣光罩 2338 logo」：只找到公司網址，沒有原檔。
  片中 3D 廠牌與 2D 卡用「台灣光罩／2338」文字名牌（白底深藍字，不仿商標）。之後網路能連官網再換成原檔。

## 國旗（程式繪製，`Brand.tsx` 的 FLAGS；韓國在 `BrandWafer.tsx`）
日本（2:3、日章直徑＝旗高 3/5、#BC002D）、美國（10:19、#B22234／#3C3B6E、50 星）、台灣（2:3、#FE0000／#000095、白日 12 道光芒）、韓國（3:2、#CD2E3A／#0047A0）。不用 emoji。

## 地圖
`map.json`：Natural Earth 1:50m 國界（world-atlas@2.0.2 的 countries-50m，公有領域），取韓國、日本、台灣、美國本土，RDP 簡化。亞洲一個比例（台灣再放大 1.8 倍才放得下廠區）、美國另一個比例，中間虛線表示比例不同；畫面標「示意圖，非實際比例」。據點位置：台積電新竹、英特爾奧勒岡、三星華城、DNP／Tekscend 東京周邊（埼玉）、Photronics 康乃狄克、台灣光罩新竹（往南偏一點讓兩座廠區分得開，示意）；客戶晶圓廠（台灣南部、韓國東南、美國德州）是灰色無 LOGO 的示意。

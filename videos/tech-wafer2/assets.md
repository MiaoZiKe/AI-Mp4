# 素材來源（國旗、公司 LOGO）

2026/11/24 Andy：「有國家就標上國旗，有公司就附上 LOGO」。規則見 `docs/channels/tech-andy-fixes.md` 第 4 條。

## 國旗（程式繪製，`src/components/three/Brand.tsx`、`BrandWafer.tsx`）
- 日本 JP、台灣 TW、德國 DE：Brand.tsx（官方比例與色碼，出處寫在程式註解）
- 韓國 KR：BrandWafer.tsx（3:2，太極直徑＝旗高 1/2、卦長＝旗高 1/4；#CD2E3A／#0047A0／#000000；幾何同 Wikimedia Commons「Flag of South Korea.svg」）

## 公司 LOGO（只用原檔，不重畫、不改色；放 `public/logos/`）
這台機器連不到各公司官網（代理拒絕連線），只能從 Wikimedia Commons 取原檔；Commons 這段時間大量回 429（請求過多），抓取持續重試中。

| 公司 | 檔案 | 來源 | 狀態 |
|---|---|---|---|
| 信越化學 Shin-Etsu | `public/logos/shinetsu.svg` | https://commons.wikimedia.org/wiki/File:Shin-Etsu_Chemical_logo.svg（原檔來源 shinetsu.co.jp） | ✅ 已用 |
| 世創 Siltronic | `public/logos/siltronic.svg` | https://commons.wikimedia.org/wiki/File:Siltronic_Logo.svg（原檔沒有 viewBox，只補上同尺寸 viewBox，圖形與顏色不動） | ✅ 已用 |
| 勝高 SUMCO | — | ① 官網 sumcosi.com：代理拒絕連線 ② Wikimedia Commons：有原檔 File:Sumco_Logo.svg，但 11/24 10:30–11:40 下載 upload.wikimedia.org 連續 50 次以上回 429（請求過多）③ Wikipedia（en/zh）：代理拒絕（403） | ⚠ 三個來源都沒拿到，3D 廠牌用文字名牌「勝高 SUMCO」、2D 卡用文字；Commons 恢復後補 |
| 台勝科 FST | — | ① 官網 fstech.com.tw：代理拒絕 ② Commons：有原檔 File:Formosa_Sumco_Technology_logo.svg，下載連續回 429 ③ Wikipedia：代理拒絕 | ⚠ 用文字名牌，Commons 恢復後補 |
| 環球晶 GlobalWafers | — | ① 官網 sas-globalwafers.com：代理拒絕（403）② Commons 搜尋「GlobalWafers」「環球晶圓」：沒有 LOGO 檔 ③ Wikipedia（en/zh）：代理拒絕 | ✖ 三個來源都失敗，保留文字 |
| SK Siltron | — | ① 官網：代理拒絕 ② Commons 搜尋「SK Siltron」「SK실트론」：只有活動照片，沒有 LOGO ③ Wikipedia：代理拒絕 | ✖ 三個來源都失敗，保留文字 |
| 合晶 Wafer Works | — | ① 官網：代理拒絕 ② Commons 搜尋「Wafer Works Corporation」「合晶科技」：沒有 ③ Wikipedia：代理拒絕 | ✖ 三個來源都失敗，保留文字 |
| 嘉晶 Episil | — | ① 官網：代理拒絕 ② Commons 搜尋「Episil」「嘉晶電子」：沒有 ③ Wikipedia：代理拒絕 | ✖ 三個來源都失敗，保留文字 |

3D 廠牌（`public/tex/brand/sign-*.png`，genmodel.py 每次用 `scripts/three/make-brand-tex.mjs` 重產）：有原檔的貼原檔（白底置中，只縮放不改色）；沒有原檔的是白底深藍字的公司名牌（不仿商標）。國旗貼圖 `flag-*.png` 由 Brand.tsx 程式繪製。

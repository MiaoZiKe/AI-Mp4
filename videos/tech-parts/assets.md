# tech-parts 素材來源（2026/11/27 查）
| 素材 | 來源 | 備註 |
|---|---|---|
| 東陶 TOTO 官方 LOGO | Wikimedia Commons 原檔 `File:TOTO_logo.svg`（upload.wikimedia.org 下載，未重畫、未改色）→ `public/logos/toto.svg`，Brand.tsx `LOGOS.toto` | 官網 toto.com 本機代理連不上（HTTP 000），改用 Commons 原檔 |
| 翔名 Feedback Technology 官方 LOGO | 官網原檔 `https://www.feedback.com.tw/archive/system/company/logo2023.svg`（未重畫、未改色）→ `public/logos/feedback.svg`，Brand.tsx `LOGOS.feedback` | 英文名 FEEDBACK TECHNOLOGY CORP.（TechNews 公司資料、Stock Analysis TPEX:8091） |
| 台灣精材 Forcera 官方 LOGO | 三類來源都試過，沒拿到 → 白底深色文字名牌「台灣精材 3467」＋國旗（不是商標） | ①官網 forcera.com.tw 本機代理連不上（HTTP 000）；②Wikimedia Commons 檔案搜尋「Forcera」「台灣精材」0 筆相關；③維基百科 zh／en（wikipedia.org HTTP 000，環境白名單沒有）。英文名 FORCERA MATERIALS CO., LTD.（TechNews 公司資料）。**不是精材科技 3374** |
| 日本、台灣國旗 | Brand.tsx FLAGS 程式繪製（JP 2:3、TW 2:3，官方比例與色碼） | 2D 卡 100% 不透明（未輪到＝細灰框）；3D 旗桿貼圖 `make-brand-tex.mjs flag:JP flag:TW` |
| 台灣輪廓 | Brand.tsx `twPath`（經緯度投影 27 點） | 公司卡右上 |
| 3D 模型（蝕刻腔體剖面、陶瓷內襯、靜電吸盤、邊緣環、晶圓、電漿、邊緣環剖面站、吸盤爆炸站、新舊環對照、陶瓷／金屬表面、真空泵、閥門、射頻電源、供應商展台、無塵室） | `gen-model.mjs` 自建 | 依 physics-spec.md、供應商型錄與通識，示意，非特定廠牌／型號；不標壽命、市占、營收 |
| 文獻 | research.md [1]–[7]（CoorsTek、Market Publishers、TechNews、Money Weekly） | 出處列只放這些 |

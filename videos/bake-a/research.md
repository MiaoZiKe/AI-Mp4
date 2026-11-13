# 無線耳機裡面有什麼？（bake-a）研究筆記

查證日期：2026/11/13（WebSearch 搜尋摘要；以下網址只看到搜尋結果摘要，沒有逐頁讀完原文）

## 已確定（多個來源一致）

1. **主動降噪（ANC）的原理是「相位相反的聲波互相抵消」**：耳機產生一個和噪音振幅相同、相位差 180 度（反相）的聲波，兩者疊加後抵消。
   - Explain That Stuff：https://explainthatstuff.com/noisecancellingheadphones.html
   - TechRadar：https://www.techradar.com/audio/headphones/what-is-active-noise-cancellation-everything-you-wanted-to-know-about-anc-headphones-but-were-too-afraid-to-ask
2. **麥克風位置分三種做法**：
   - 前饋（feedforward）：外側麥克風先收外面的噪音，處理器算出反相訊號。
   - 回饋（feedback）：耳道那一側的麥克風量「抵消後還剩多少」，再修正。
   - 混合式（hybrid）：兩種都用，現在多數降噪耳機是這種。
   - 來源同上，另見美國專利 11978429／11626097（Active noise cancelling earbud devices）：https://image-ppubs.uspto.gov/dirsearch-public/print/downloadPdf/11978429
3. **真無線耳機拆開常見的零件**（各品牌拆解報告一致）：藍牙音訊晶片（SoC）、藍牙天線（有的做在外殼上、有的是電路板上蛇形走線）、小型鈕扣或軟包電池（單耳約幾十到一百多 mAh）、MEMS 麥克風（通話用＋降噪用，通常不只一顆）、喇叭單體、充電接點、電源管理晶片。
   - TechInsights（Sennheiser Momentum True Wireless 2 拆解）：https://www.techinsights.com/ko/node/54794
   - Electronics360 摘要：https://electronics360.globalspec.com/article/21158/techinsights-teardown-sennheiser-momentum-true-wireless-2
   - iFixit（Fairphone True Wireless Earbuds 拆解）：https://ifixit.com/Guide/edit/146449/299177
   - qucox 拆解（OnePlus、Beats Solo Buds 的鈕扣電池 58／105 mAh 等，二手翻譯資料）：https://www.qucox.com/beats-solo-buds-teardown

## 分析預期（不寫進畫面數字）

- 降噪對低頻、穩定的噪音（引擎、冷氣）效果較好，對突然的高頻聲音較弱；配戴是否密合會影響效果（TechRadar、Explain That Stuff 都這樣說）。

## 片中怎麼用

- 旁白只講「麥克風聽到噪音 → 晶片算出相反的聲波 → 喇叭放出來 → 一疊就抵消」，不講百分比、不講特定品牌。
- 「好幾顆麥克風」：依來源 2、3，降噪耳機通常不只一顆麥克風；不寫確切數量（各機型不同）。
- 3D 模型是示意：零件形狀、位置、層次順序都不對應任何機型，沒有商標；畫面上的兩道波形是示意圖，不是量測波形。

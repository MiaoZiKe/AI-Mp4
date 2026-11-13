# 降噪耳機怎麼把噪音抵消掉？（sample-tech-anc）研究筆記

沿用 `videos/bake-a/research.md`（同一天查證），最後一節「sample-tech-anc 補充」是這支片另外查的。

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


## sample-tech-anc 補充（2026/11/13 WebSearch；只看到搜尋結果摘要，沒有逐頁讀完原文）

### 已確定（多個來源一致）

4. **訊號路徑是「外側麥克風 → 處理晶片（DSP）→ 喇叭單體」**：前饋式降噪用外側麥克風量環境噪音，晶片依耳機的聲學轉移函數算出「會傳進耳朵的那一部分」，再讓喇叭發出反相的聲音。
   - audioXpress（麥克風規格對降噪表現的影響）：https://audioxpress.com/article/development-design-the-impact-of-microphone-specifications-on-active-noise-cancellation-performance
   - Wikipedia（Active noise control）：https://en.wikipedia.org/wiki/Active_noise_control
   - MDPI Applied Sciences 12(11):5300（FPGA 前饋式入耳降噪原型）：https://www.mdpi.com/2076-3417/12/11/5300
5. **只能抵消一部分，而且以低頻為主**：量測結果大多落在低頻 15–20 dB 左右，約 1–2 kHz 以上效果變差；配戴密不密合會影響結果。
   - 同上 MDPI（300 Hz 以下 >20 dB）、ResearchGate「Adaptive feedforward control for ANC in-ear headphones」（100–1000 Hz 自適應濾波約 20 dB、固定濾波約 10 dB）：https://www.researchgate.net/publication/230860398_Adaptive_feedforward_control_for_active_noise_cancellation_in-ear_headphones
   - 這些是各自實驗條件下的數字，不是通用規格，所以**片中不放任何 dB 數字**。

### 片中怎麼用（sample-tech-anc）

- 旁白只講定性的流程：噪音 → 麥克風收到 → 訊號進晶片 → 算出相反的波形 → 振膜振動發出反相聲波 → 兩道波疊加抵消。全部對應上面第 1、2、4 點。
- 畫面上的波形、聲波圈、訊號光點、「耳內音量」條都是示意動畫，不是量測資料。動畫裡兩道波完全抵消是理想化的畫法，實際只能抵消一部分（第 5 點），所以第 3–7 幕的出處列都寫「示意動畫：波形是示意，不是量測；實際只能抵消一部分噪音」。
- 「耳內音量」條不標數字、不標 dB。
- 片中只畫前饋式（外側麥克風）這一條路；回饋式麥克風（模型裡喇叭旁邊那一顆）沒有演，旁白也沒提。
- 模型是示意的單耳真無線耳機，不是特定機型，沒有商標；零件位置各家不同（第 2 幕出處列有寫）。

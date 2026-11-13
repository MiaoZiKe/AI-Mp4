# 研究：無線耳機裡面有什麼？（查證日 2026/11/13）

題材是通用原理，不涉及時事價格；以下是已查證的點，以及畫面上怎麼處理。

## 已確定（多個來源一致）
- 真無線耳機每一顆裡面有：喇叭單體（多數是動圈式：永久磁鐵加音圈）、電池（常見是鋼殼鈕扣電池，也有軟包電池）、處理訊號的晶片（DSP／藍牙晶片）、麥克風、藍牙天線、電路板與充電接點。
  - Soundcore 的 how-do-earbuds-work：動圈單體由磁鐵與音圈組成，每顆耳機有小型處理器，電池多為鋰離子。
  - allpcb 的 YOBYBO Card20 Pro 拆解：13 mm 動圈單體、0.1295 Wh 軟包電池。
  - Qucox 的拆解整理：Beats Solo Buds 用 105 mAh 鋼殼鈕扣電池；Huawei FreeBuds 6 用 39.5 mAh 鋼殼鈕扣電池，並有三顆 MEMS 麥克風（一顆通話、兩顆降噪）與雷射成型天線。
  - TechInsights／EE Asia 的 Sennheiser Momentum True Wireless 2 拆解：MEMS 麥克風、每顆一支藍牙天線。
- 主動降噪（ANC）原理：麥克風收外面的聲音，晶片算出反相（相位差 180 度）的聲波，由喇叭單體播出，兩個聲波在耳道裡相消（破壞性干涉）。
  - Wikipedia「Active noise control」：加入第二個聲音去抵消第一個，通常是反相波；最適合低頻，約 1000 Hz 以上就不可靠。
  - Avantree、Soundcore 說明：前饋麥克風在外側先收噪音，回饋麥克風在耳道內監聽實際聽到什麼，混合式兩種都用。
## 分析預期／各家不同
- 麥克風數量、位置（前饋／回饋／混合）、電池種類、單體種類、天線位置都因機型而異。本片的模型是示意，非特定機型，所以出處列「各家耳機的內部配置不同」。
## 不使用的說法
- 廠商部落格的具體百分比（例如灰塵讓降噪準確度降 40%）屬行銷說法，沒有獨立驗證，不用。
- 沒有查到的東西不寫：不講降噪能消除幾 dB。
## 對旁白的限制
- 「抵消」只說「兩邊抵消就安靜了」，不說「完全消除」。高頻靠耳塞的密封，片中不展開（秒數不夠），在 script.md 備註。
## 來源
- https://en.wikipedia.org/wiki/Active_noise_control
- https://www.soundcore.com/uk/blogs/earbuds/how-do-earbuds-work
- https://us.soundcore.com/blogs/earbuds/how-does-active-noise-cancelling-work
- https://avantree.com/blogs/knowledge/how-does-active-noise-cancelling-work-in-earbuds
- https://www.allpcb.com/allelectrohub/yobybo-card20-pro-true-wireless-earbuds-teardown
- https://www.techinsights.com/ko/node/54794
- https://www.qucox.com/huawei-freebuds-6-teardown/

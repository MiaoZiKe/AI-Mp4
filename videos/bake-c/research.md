# 無線耳機裡面有什麼？ 查證紀錄（截至 2026/11/13）

## 已確定（有來源）
- 真無線耳機的每一顆耳機裡，常見的零件是：動圈式喇叭單體（driver）、一顆或多顆 MEMS 麥克風、電池、主晶片（藍牙音訊 SoC）與藍牙天線。這是多份拆解報告的共同結論，機型不同規格會不同。來源：HiFiGo 等拆解網站、TechInsights 對某品牌機型的拆解（https://www.techinsights.com/blog/deep-dive-teardown-sennheiser-momentum-true-wireless-2-m3ietw2-wireless-earbuds）、Allpcb 的拆解整理（https://www.allpcb.com/allelectrohub/yobybo-card20-pro-true-wireless-earbuds-teardown）。
- 喇叭單體尺寸：入門與中階機型常見 13 或 14.2 毫米動圈單體，也有 7 毫米的機型（同上拆解整理）。影片寫「喇叭單體」，不寫固定尺寸。
- 電池：單顆耳機的電池容量很小，拆解中某機型一顆約 55 mAh（3.7 V）；機型差異大（同上）。影片不寫容量數字。
- 藍牙天線通常是印在電路板或外殼邊緣的細金屬線路（同上拆解整理）。
- 主動降噪（ANC）的基本原理：外部麥克風收下環境噪音，處理器產生相位相反的「反噪聲波」，由喇叭播出，與噪音在耳道內互相抵消（來源：LG 技術說明 https://www.lg.com/ae/lg-story/helpful-guide/how-does-noise-cancelling-work；Interesting Engineering https://interestingengineering.com/science/how-do-noise-canceling-headphones-work-and-why-are-they-so-popular）。
- 常見做法是混合式（hybrid）：外側麥克風收外面噪音（前饋 feedforward），內側誤差麥克風量到耳道裡剩下的噪音再校正（回授 feedback）。來源：ACC 2004 混合式主動降噪論文（http://congres.cran.univ-lorraine.fr/2004/ACC2004/Papers/0511_ThM09.1.pdf）與 NATO STO 會議論文（https://publications.sto.nato.int/publications/STO%20Meeting%20Proceedings/RTO-MP-HFM-123/MP-HFM-123-16.pdf）。
- 主動降噪的限制：對穩定、低頻的噪音（約 1 kHz 以下）效果最好；突然的聲音與高頻較難消除，所以耳塞的貼合（被動隔音）仍然重要（LG 技術說明）。

## 分析預期（未確定，影片不當成事實）
- 降噪效果好壞取決於耳塞貼合度與噪音頻率；影片不給「降噪多少分貝」的數字。
- 各家實際的麥克風數量與位置不同，影片的「外側麥克風在耳柄」只是示意。

## 尚未確定／不寫進影片
- 某一顆特定品牌的零件配置與晶片型號：本片不指定品牌、不仿特定機型，模型是示意。
- Avantree 等廠商部落格的「相位同步」等數字，沒有獨立驗證，不採用。

## 影片用語與來源對照
| 影片說法 | 依據 |
|---|---|
| 外殼裡塞著電池、晶片和天線 | 拆解共同結論 |
| 喇叭單體負責把聲音送進耳朵 | 拆解共同結論（動圈單體） |
| 主動降噪靠麥克風先收外面的噪音 | ANC 原理（LG；混合式論文） |
| 再發出反相的聲波，把它抵消掉 | ANC 原理（相位相反、干涉抵消） |

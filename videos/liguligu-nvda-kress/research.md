# research.md — 一個簽名、三個頭銜：輝達財報換人交（liguligu-nvda-kress）

查證時間：台灣時間 2026/11/15 15:00–15:30。以下「截至」都指 2026/11/15。**發布當天（11/16）要重查一次**，畫面「查證截至」改成發布日。

## 0. 疑點一句話

黃仁勳 11/12 辭職後，財務長 Colette Kress 兼任臨時執行長；8-K 上同一個人簽了三個頭銜。5 天後（美西 11/17）的財報照原訂日期公布，財測是他在任時（8/26）給的。媒體說董事會已接觸接班人選，公司說還沒正式接洽。她是過渡還是接班，截至 11/15 沒有答案。

## 1. 查證方式

- **原文逐字讀過**（curl 取回網頁原文，2026/11/15）：
  - 輝達新聞稿〈NVIDIA Announces CEO Transition〉2026/11/12 https://nvidianews.nvidia.com/news/nvidia-announces-ceo-transition
  - 8-K（2026/11/12 申報，事件日 11/11）https://www.sec.gov/Archives/edgar/data/1045810/000104581026000082/nvda-20261111.htm
  - 董事會聲明 2026/11/8 https://nvidianews.nvidia.com/news/statement-from-nvidia-board-of-directors
  - 獨立董事聲明 2026/11/10 https://nvidianews.nvidia.com/news/statement-from-the-independent-members-of-the-nvidia-board
  - 財報說明會通知 2026/10/28 https://nvidianews.nvidia.com/news/nvidia-sets-conference-call-for-third-quarter-financial-results-6928873
  - 第二季財報新聞稿 2026/8/26（8-K 附件）https://www.sec.gov/Archives/edgar/data/1045810/000104581026000073/q2fy27pr.htm
- **只看到搜尋摘要**（網站在這個環境被擋）：金融時報 11/13 報導與輝達對它的回應（經 RTÉ、Japan Times、The Star、Benzinga 轉述，摘要一致）。
- 主控 11/15 的疑慮「Kress 仍是財務長、查不到臨時執行長」：原文顯示兩者同時成立（兼任），疑慮來自搜尋摘要不完整。

## 2. 事實表

| # | 事實 | 狀態 | 來源 | 用在 |
|---|---|---|---|---|
| F1 | 11/11 董事會接受黃仁勳辭去總裁、執行長、董事，即刻生效 | 已確定（原文） | 8-K Item 5.02 | s02（畫面「執行長辭職・即刻生效」） |
| F2 | 財務長 Colette M. Kress（59 歲）擔任臨時執行長，並「繼續擔任」執行副總裁暨財務長 | 已確定（原文） | 8-K；新聞稿 | s02 |
| F3 | 8-K 簽名欄只有 Kress 一人，頭銜寫 Interim Chief Executive Officer, Executive Vice President and Chief Financial Officer（三個頭銜） | 已確定（原文） | 8-K 簽名頁 | s01 |
| F4 | 第三季財報 11/17（美西）約下午 1:20 公布、「as previously scheduled」，2 點說明會 | 已確定（原文） | 新聞稿 11/12；通知 10/28 | s02、s07 |
| F5 | 10/28 的通知：業績書面說明由財務長 Kress 提供；說明會問答只限分析師與機構投資人 | 已確定（原文） | 通知 10/28 | 背景（沒放進旁白） |
| F6 | 第三季營收財測 1080 億美元 ±2%，8/26 公布（當時黃仁勳是執行長，新聞稿有他的引述） | 已確定（原文） | 第二季財報新聞稿 | s04 |
| F7 | 董事會開始遴選正式執行長，考慮內部與外部人選 | 已確定（原文） | 新聞稿 11/12 | s05 |
| F8 | 金融時報 11/13：引述知情人士，董事會已接觸一位外部執行長人選 | 媒體報導（金融時報，引述知情人士；只看到轉述） | RTÉ https://www.rte.ie/news/business/2026/1113/1599163-nvidia-approached-arm-ceo-haas-to-succeed-huang-ft/ 等 | s03 |
| F9 | 輝達回應：正在挑選獵才公司，尚未正式接洽任何人選 | 公司說法（經媒體轉述，原文未讀） | Benzinga https://www.benzinga.com/markets/tech/26/11/63273340/nvidia-rene-haas-jensen-huang 等 | s03 |
| F10 | 董事會 11/8 啟動獨立調查；11/10 聘前紐約南區代理檢察官與 Wachtell 律所 | 已確定（原文） | 董事會聲明 | s06（「調查還沒結論」） |
| F11 | 調查結論、正式執行長人選 | 截至 2026/11/15 尚未確定 | 搜尋未見公告 | s06 |
| F12 | Harvey C. Jones 任首位董事長（自 1993 年任董事） | 已確定（原文） | 8-K | 沒放進旁白 |

## 3. 刻意沒用的

- 被接觸的人選姓名：只有單一來源（金融時報引述知情人士），畫面不寫名字、不放公司名。
- 「一人兼兩職負擔太重」等治理疑慮：只在評論文章與部落格看到，沒有可靠來源，不放。
- 分析師對財報的預估（營收約 1089 億、每股盈餘約 2.47）：各家數字不一，且接近投資建議，不放。
- 個人私事細節：與這支片的題目無關，不寫。
- 股價：這支不談。

## 4. 發布前重查清單（11/16）

1. 輝達新聞室有沒有新公告（接班人、調查結論、財報日期變動）。
2. 金融時報那則有沒有更新或被否認。
3. `asOf`、s06 的「截至」、跑馬燈日期改成發布日；重新 render。

# 23 萬星的檔案，只有 65 行（CaffAIne GitHub 清單：andrej-karpathy-skills）

- 查證日：2026/11/17（台北）。狀態：**可做（標註「社群整理，非 Karpathy 官方」）**。
- 一句話主旨：把 Karpathy 公開抱怨過的四種 AI 寫程式壞習慣，整理成一份 65 行的 `CLAUDE.md`，社群拿它當「AI 行為守則」用。

## 開頭 3 秒（playbook 十七）
- 第 0 秒大字：「23 萬星的檔案，只有 65 行」；旁白第一句同一件事。
- 要回答的疑問：這 65 行寫了什麼，值得 23 萬人收藏？（中段逐條揭曉，結尾回扣「四句話，其實是你也能對 AI 說的話」。）

## 事實表
| 事實 | 狀態 | 內容與出處（讀取日） |
|---|---|---|
| 檔案行數 | **已確定（親數原檔）** | 2026/11/17 讀 raw `CLAUDE.md`：`wc -l`＝**65 行**（其中 44 行有字、2,357 位元組、約 352 個英文詞）。https://raw.githubusercontent.com/multica-ai/andrej-karpathy-skills/main/CLAUDE.md |
| 星數／分叉 | 已確定（倉庫頁，單日單來源）| **233.8k 星、23.3k 分叉**，2026/11/17 讀 https://github.com/multica-ai/andrej-karpathy-skills （頁面只給進位數字，API 被擋）。 |
| 星數趨勢 | 媒體／第三方（各站快照，口徑不一）| 2026/9/10 約 211,974；2026/10/23 約 222,612（搜尋摘要所引第三方頁）；今 233.8k。→ 約 25 天 +1.1 萬。單篇用「截至 11/17」即可，不講成長率。 |
| 授權 | 已確定（README）＋有疑點 | README 寫 MIT；raw 讀 `LICENSE` 檔回 404（main 分支沒有 LICENSE 檔）。片中不談授權細節。 |
| 作者／位置 | 已確定 | 原在 `forrestchang/andrej-karpathy-skills`，現頁面在 `multica-ai/andrej-karpathy-skills`（兩個路徑 raw 都讀得到、內容相同）。README 開頭有 Multica 的自家專案宣傳。 |
| 四條規則 | 已確定（原檔）| 1 Think Before Coding（先想再寫，不確定就問）、2 Simplicity First（最少程式碼，200 行能 50 行就重寫）、3 Surgical Changes（只改該改的）、4 Goal-Driven Execution（先定可驗收的成功標準，迴圈到驗證通過）。 |
| 出處＝Karpathy | **媒體報導（二手）** | README 寫「derived from Andrej Karpathy's observations」並連到 x.com/karpathy/status/2015883857489522876；多家報導日期為 2026/1/26。**原貼文本環境讀不到**，且多篇指出此專案「不是 Karpathy 寫的或背書的」。→ 片中一律說「社群整理自 Karpathy 的公開說法」。 |
| 安裝 | 已確定（README）| Claude Code：`/plugin marketplace add forrestchang/andrej-karpathy-skills`；或 curl 下載 CLAUDE.md 放專案根目錄。 |

## 我們能不能實測
- 能：Gemini API 可做「同一個模糊需求，有無這四句」的前後對照（與 E1「先問三個問題」要分開講，避免重複：本支只展示規則本身＋一個示意，不做 A/B 數據）。OpenAI 無額度。
- 不能：不能宣稱「裝了就變好」；倉庫沒有對照實驗。

## 建議畫面（與相鄰支不同）
清單卡四張（每條「壞習慣→規則」），結尾放一個「65 行」捲動原檔的操作示意；不放真人肖像、不放商標。與 G8（前後對照）、G7（操作示意）錯開。

## 留言關鍵字
「四條」（回覆四條規則的白話版與安裝一行指令）。

## 還不知道的事
- 23 萬星是否包含大量收藏後沒用過的人（無法驗證）。
- 規則實際讓 AI 改善多少：無獨立測試。
- Karpathy 原貼文逐字內容（本環境讀不到 x.com）。
- 精確星數（頁面只給 233.8k）。上片當天重讀。

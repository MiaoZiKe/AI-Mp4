# Claude 官方的 19 萬星技能庫，裡面到底有什麼（CaffAIne GitHub 清單：anthropics/skills）

- 查證日：2026/11/17。狀態：**可做（方案說法有衝突，片中不講哪個方案能用）**。
- 一句話主旨：Anthropic 官方公開的「技能」範例倉庫：每個技能是一個資料夾＋SKILL.md，教 Claude 用固定方法做事。

## 開頭 3 秒
- 第 0 秒：「19.6 萬星，Claude 官方放了 19 個技能」。
- 要回答的疑問：技能到底是什麼？跟貼一段提示詞差在哪？（中段：資料夾＋SKILL.md、需要時才載入；結尾回扣：你也能自己寫一個。）

## 事實表
| 事實 | 狀態 | 內容與出處 |
|---|---|---|
| 星數／分叉 | 已確定（倉庫頁，單來源）| **196.3k 星、23.0k 分叉**，2026/11/17 讀 https://github.com/anthropics/skills 。（11/10 有站寫 191,742，約 7 天 +4.6k；上片只講截至 11/17。）|
| 技能數 | 已確定（頁面）| `skills/` 目錄列出 **19 個資料夾**：academy-guide、algorithmic-art、brand-guidelines、canvas-design、claude-api、discernment-nudge、doc-coauthoring、docx、frontend-design、internal-comms、mcp-builder、pdf、pptx、skill-creator、slack-gif-creator、theme-factory、web-artifacts-builder、webapp-testing、xlsx（頁面註明可能未列完）。另有 spec、template 目錄。 |
| 授權 | 已確定（README）| README：「Many skills in this repo are open source (Apache 2.0)」，並寫 docx／pdf／pptx／xlsx 也是 Apache 2.0（有第三方文章稱這四個是「可看原始碼但非開源」，與 README 不符；片中只說「README 寫 Apache 2.0」或乾脆不講授權）。 |
| 官方聲明 | 已確定（README）| 「provided for demonstration and educational purposes only」；實際在 Claude 的行為可能不同。片中要放這句的白話版。 |
| 安裝（Claude Code）| 已確定（README）| `/plugin marketplace add anthropics/skills`，再選 document-skills 或 example-skills 外掛。 |
| 方案 | **兩個官方說法不一致** | README：這些範例技能在 Claude.ai「已提供給付費方案」；support.claude.com 說明頁（2026/11/17 讀）：「Skills are available for users on Free, Pro, Max, Ultra, Team, and Enterprise plans」，且**需開啟程式碼執行**；API 為 beta。→ 片中只講「要在設定開啟程式碼執行」，不講方案，除非上片前重核。 |
| 台灣可用 | 查不到 | 說明頁未提地區限制。 |
| 背景 | 媒體報導（多家）| Anthropic 於 2025/12/18 把 Agent Skills 發布成開放標準（agentskills.io；the-decoder、VentureBeat、unite.ai 等，日期有 12/16、12/19 說法）。 |

## 我們能不能實測
- 部分：技能格式（資料夾＋SKILL.md＋兩個欄位 name／description）是 README 原文，可以用 Gemini 或純示意做「一個技能長什麼樣」。無法實測 Claude 載入行為。

## 建議畫面
清單卡輪播（6～8 個代表技能，每張「名稱＋一句話＋你會在什麼時候用」）＋最後一張「SKILL.md 長這樣」（只有兩欄 front-matter）。與 G7（操作示意）錯開，與 G1（清單卡）手法相近，排程時不要相鄰。

## 留言關鍵字
「技能」（回覆如何自己做第一個技能）。

## 還不知道的事
- 各技能實際品質與維護頻率（無獨立評測）。
- 官方「方案」說法衝突，待上片前以 support 頁為準重讀。
- 台灣使用者可用性。

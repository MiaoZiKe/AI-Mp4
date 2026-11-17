# 不知道有什麼技能？叫 AI 自己去找（CaffAIne GitHub 清單：vercel-labs/skills 的 find-skills）

- 查證日：2026/11/17。狀態：**可做**（find-skills 內容已讀原檔；安裝量數字不引用）。
- 一句話主旨：Vercel Labs 的 Skills CLI 能 `npx skills find` 搜技能；其中 `find-skills` 這個「元技能」教 AI 代理自己去搜尋、評估、安裝其他技能。

## 開頭 3 秒
- 第 0 秒：「這個技能的工作，是幫你找別的技能」。
- 要回答的疑問：AI 自己找技能，怎麼確定它找的是可信的？（中段揭曉：它檔案裡有三道檢查——安裝量、來源信譽、星數；結尾回扣：最後一道檢查還是你自己讀一遍。）

## 事實表
| 事實 | 狀態 | 內容與出處 |
|---|---|---|
| 倉庫 | 已確定（倉庫頁）| vercel-labs/skills：**39.7k 星、3.5k 分叉、MIT、681 次提交**，2026/11/17 讀 https://github.com/vercel-labs/skills 。（舊清單寫 3.6～4 萬各站不一，以頁面為準。）|
| find-skills 內容 | **已確定（讀原檔）** | `skills/find-skills/SKILL.md`（141 行）：何時用（「how do I do X」「find a skill for X」）、`npx skills find [query] [--owner <owner>]`、先看 skills.sh 排行榜、**驗證品質：安裝量 1K+ 優先、<100 要小心；官方來源（vercel-labs、anthropics、microsoft）較可信；倉庫星數 <100 要懷疑**；找不到就直接協助並建議用 `npx skills init` 自己做。 https://raw.githubusercontent.com/vercel-labs/skills/main/skills/find-skills/SKILL.md |
| CLI 指令 | 已確定（README）| `npx skills find [query]`、`add`、`list`、`use`、`check`、`update`、`remove`、`init`；需 Node.js 22.20+；支援 OpenCode、Claude Code、Codex、Cursor 等「另有 75 個」代理。 |
| 安裝 find-skills | 媒體／目錄站（多站一致）| `npx skills add vercel-labs/skills --skill find-skills`（llmbase、claude-codex 等目錄站；README 範例是 `npx skills add vercel-labs/agent-skills`，**兩者不同，片中用目錄站寫法並標「依各站說明」，上片前自己跑一次確認**）。 |
| 遙測 | 已確定（README）| 預設收集匿名使用資料；`DISABLE_TELEMETRY=1` 或 `DO_NOT_TRACK=1` 可關。→ 提醒卡可用。 |
| 安裝量 | **查不到可靠數字** | 目錄站寫 3M～3.9M 安裝，彼此不一致、無法交叉驗證。**不引用。** |
| 台灣可用 | 不適用（開源 CLI）| 無地區限制。 |

## 我們能不能實測
- 部分：可在本環境跑 `npx skills find <關鍵字>` 看輸出（本環境需有 npm 網路許可；先試，被擋就改示意並標註）。OpenAI 無關。

## 建議畫面
操作示意：終端機三行（find→選→add），旁邊提醒卡「三道檢查＋你自己讀一次」。與 G5（清單卡）錯開。

## 留言關鍵字
「找技能」（回覆三道檢查與一行指令）。

## 還不知道的事
- find-skills 實際安裝量。
- 搜尋結果排序規則（skills.sh 依安裝量排行，是否會被灌水無資料）。
- 裝上別人寫的技能的風險：技能能讓代理執行指令，必須先讀 SKILL.md（片中提醒）。

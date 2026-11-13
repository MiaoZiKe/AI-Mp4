# sample-ai-split（AI 教學頻道風格試片：前後對照分割畫面）

這是一支 13.9 秒的風格試片，不是完整影片（沒有片尾卡）。旁白、配音音檔、時間軸都和 `sample-ai-ui`（仿介面動畫）一模一樣，只有畫面不同，方便直接比畫面。

| 項目 | 內容 |
|---|---|
| 成片 | `out/sample-ai-split.mp4`（1080×1920、30fps、H.264，13.9 秒、417 幀） |
| 九格關鍵畫面 | `out/sample-ai-split-review.png` |
| 截圖 | `out/sample-ai-split-overview.png`（每幕一張）、`out/sample-ai-split-cover.png`（封面） |
| 旁白（63 字，沒改） | 你問 AI，是不是都只打一句話？難怪它回得很普通。Google 的官方指南說，好的提示詞有四塊：角色、任務、背景、格式。四塊補上去，同一個 AI，回答更貼近你要的。 |

## 風格一句話

畫面上下切兩半：上半是灰色的「隨便問」，下半是白底彩色的「這樣問」，中間一條分隔線跟著旁白上下滑，最後好的那一半推滿整個畫面。

## 畫面怎麼跟旁白走

| 旁白念到 | 畫面 |
|---|---|
| 你問 AI，是不是都只打一句話？ | 上半佔六成：大字「只打一句話？」，輸入框逐字打出「幫我寫一篇貼文」。下半是四個空格（0／4） |
| 難怪它回得很普通 | 送出，分隔線往下滑一點；上半的 AI 回覆逐字出現，念到「很普通」蓋上章 |
| Google 的官方指南說 | 分隔線往上滑到三成，下半變大；四個空格從 2×2 變成四列，右上出現指南名稱（純文字，沒有商標） |
| 好的提示詞有四塊 | 四列的底線依序拉長；念到「四塊」四列依序閃一下 |
| 角色、任務、背景、格式 | 念到哪一塊，那一列就上色並逐字填入內容，計數 1／4 → 4／4 |
| 四塊補上去 | 兩邊同時送出；下半的四列縮成一排色標籤，下面出現回覆卡 |
| 同一個 AI | 分隔線中間的把手變成「AI」圓點，上下各送一顆點進兩邊 |
| 回答 | 兩邊同時逐字打出回覆（上半是原本那句普通的，下半是新的） |
| 更貼近你要的 | 下半往上推滿，上半被擠出去；回覆放大，每一行右邊標出用到哪一塊，最後跳出「更貼近你要的」 |

## 和另外兩種的差別

- 仿介面版（sample-ai-ui）：深色、像在看軟體操作錄影。這一支是淺色、兩塊面板並排比較，沒有游標和視窗外框。
- 紙拼貼（ai-make-video）：有紙紋、膠帶、照片。這一支是平面色塊加圓角卡片，沒有任何紙材。

## 怎麼做的

- script.json 頂層 `styleVersion: 3` 加 `stage: "split"`；每幕 `component: "SplitScene"`。配音、對齊、字幕檔、混音沿用 v3 流程，不需要 `make-paper.py`。
- 元件：`src/components/ai-split/engine.ts`（把 props 的 `at` 換成絕對幀）、`SplitVideo.tsx`（上半 BadPanel、下半 GoodPanel、分隔線、頁首、字幕、封面）。
- 色票與版面：`src/theme.ts` 的 `THEME_SPLIT`、`LAYOUT_SPLIT`；元件沒有寫死色碼。
- props 用到的區塊：`labels`（兩半的名字）、`hook`、`draft`（要打的字）、`send`、`reply`（含 `stamp`）、`divider`（分隔線步驟：`to`＝上半佔的比例，0＝下半推滿；`mode: good｜run｜full`）、`guide`、`sweepAt`、`pulseAt`、`slots`、`node`、`result`（含 `badge`）。時間都寫 cue id 或 `start｜voice｜end｜exit` 加減幾幀。
- 檢查規則：`scripts/ai-split/validate-split.mjs`。
- 音檔：`public/audio/sample-ai-split/` 是從 `sample-ai-ui` 複製過來的同一段錄音（音色 Sulafat）；`timeline.json`、`tts-*.json` 也是複製後只把 slug 換掉。這次沒有送任何 TTS 請求。要重配音請從 `sample-ai-ui` 那邊的流程做，再複製過來。
- 指令（都要包 `flock /tmp/aimp4-render.lock`）：`node scripts/validate.mjs sample-ai-split`、`node scripts/still.mjs sample-ai-split`、`node scripts/render.mjs sample-ai-split`。不要對這個 slug 跑 `tts-take.mjs` 或 `align.mjs`。

## 渲染

- 全片渲染加混音約 30 秒（417 幀、每幀 49 毫秒）；每幕截圖加封面約 40 秒。
- 混音和仿介面版相同：背景音樂加 1 個轉場音效，整體 −14.3 LUFS。

## 已知問題

1. 配音還是原本那一版，使用者說的「太像演講」這支沒有處理（今天 TTS 額度用完，而且這支的目的是只換畫面）。
2. 第四幕字幕一次只顯示一個詞（角色／任務／背景／格式），和仿介面版一樣。
3. 「很普通」的章是照旁白念到的時間蓋上去的，那時回覆的第二行還沒打完。
4. 字幕下方到安全區底部（約 1500–1700px）只有出處一行，比較空。
5. `out/sample-ai-split/stills/` 的每幕截圖是第一次渲染前拍的，之後有兩個小修正（回覆卡排版、等待中的三個點），成片與九格圖是最新的。
6. 沒有跑 audit 與 selfcheck，也沒有請沒參與製作的人評分。

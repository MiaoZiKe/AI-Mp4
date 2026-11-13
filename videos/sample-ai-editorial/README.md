# sample-ai-editorial：AI 教學風格試片（亮色雜誌編排）

無聲試片：`out/sample-ai-editorial.mp4`，1080×1920、30fps、H.264，17.3 秒（519 幀），5 頁，沒有片尾卡。
九格圖：`out/sample-ai-editorial-review.png`；每頁截圖 `out/sample-ai-editorial/stills/`；封面 `out/sample-ai-editorial-cover.png`。

這是使用者看完深色仿介面版（`sample-ai-news`）後說「需要亮色、想看看其他風格」做的替代風格之一。

## 風格一句話

米白底、粗黑大標、只有一個番茄紅，像設計雜誌的版面一頁一頁翻：線長出來、字從遮罩後面升起、重點用紅筆劃線，AI 的回答是一塊被剪下來的引文。沒有視窗、游標、卡片陰影，也沒有紙紋。

## 色票（`src/theme.ts` 的 `THEME_EDITORIAL`）

| 用途 | 色碼 |
|---|---|
| 底（米白） | `#F3EFE6` |
| 引文底 | `#FFFFFF` |
| 主字與粗線 | `#111111` |
| 次要字／輔助字 | `#4A4741`／`#6A665E` |
| 細欄線 | `#CFC8B8` |
| 強調色（番茄紅）色塊與筆線 | `#E5351B` |
| 強調色的字（米白底上） | `#C22A12` |

版面在 `LAYOUT_EDITORIAL`：報頭 228–300、主版面 336–1250、字幕 1284 起（中文 68px、英文 30px、靠左）、出處 1590；最小字 28px。

## 五頁

1. 鉤子（s01）：第 0 幀就是實心大標「問 AI 物價／給我兩年前的」＋兩欄數字 1.69%、2.33%；0.3 秒把 1.69% 劃掉、標「2024 年的」，念到「物價」紅筆劃「兩年前」，念到「抓重點」長出一行說明。
2. 提問（s02）：紅色大 Q＋條件表（工具、日期、條件）；那一句話逐字排出來，再劃線、跳出「1 句話」。
3. 回答（s03）：大引號＋剪下的引文（有裁切記號）；念到 1.69 時紅筆劃線、拉一條標註線、底下跳出大數字。
4. 對答案（s04）：1.69% 被劃掉、旁邊標 2024；下面的數字從 1.69 跳到 2.33%（全片最大的數字）。
5. 轉折（s05）：整塊番茄紅從左邊蓋進來，白色特大字「換個問法」，下面五個欄位依序出現。

## 內容與查證

- 旁白、字幕、cue 取自 `videos/sample-ai-news/script.json` 的 s01–s04、s06（2026/11/13 當時的版本；那邊之後改稿不會自動同步過來）。
- AI 回答是 `videos/sample-ai-news/tests/01-casual.json` 的原文，只刪節不改字，標「Gemini 實測・2026/11/13（節錄）」；validate 會逐行比對原文。
- 第 1 頁的「同一句話問兩次，兩次都拿到 2024 年的數字」依據 `tests/01-casual.json` 與 `tests/03-casual-repeat.json`。第 5 頁的五個欄位名稱取自完整版 s14 的摘要。
- 沒有真人、商標、產品介面截圖，也沒有 AI 標示。

## 怎麼做的

- `script.json` 頂層 `styleVersion: 3` 加 `stage: "editorial"`，每幕 `component: "EditorialScene"`，`props.page`＝`hook｜ask｜quote｜versus｜turn`。時間只寫 cue id 或 `start｜voice｜end｜exit` ±幀。
- 元件：`src/components/ai-editorial/EditorialVideo.tsx`（版面、報頭、字幕、封面）、`engine.ts`（cue 換成絕對幀；每頁預設在該幕開始後 6 幀進場，上一頁在那之前 6 幀由下往上裁掉）。
- 檢查：`scripts/ai-editorial/validate-editorial.mjs`。
- 無聲時間軸：`ALIGN_TAIL_END_F=40 node scripts/ui/silent-timeline.mjs sample-ai-editorial`（每秒 4.9 音節估算；片尾多留 40 幀讓最後一頁看得完）。配音後跑 tts-take → align 會整份覆蓋，畫面自動對上。

```bash
node scripts/validate.mjs sample-ai-editorial
flock /tmp/aimp4-render.lock node scripts/still.mjs sample-ai-editorial
flock /tmp/aimp4-render.lock node scripts/render.mjs sample-ai-editorial
python3 scripts/ui/review9.py sample-ai-editorial 0,s01:key+20,s02:test+4,s02:one+10,s03:long+20,s03:old+16,s04:two+16,s04:now+14,s05:change+30
```

## 已知問題

- 沒有配音，時間是估的；17.3 秒比目標 15 秒長一點。
- 換頁時有 1–2 幀主版面幾乎是空的（上一頁裁掉、下一頁的線剛開始長）。
- 第 4 頁在念到「2.33」之前，下半部是淺色的佔位數字「–.––%」，大約停 2 秒。
- 第 5 頁大標右邊留白很大（刻意的留白，但也可以說偏空）。
- 字型還是 Noto Sans TC＋Inter，沒有加襯線字；要更像雜誌可以再加一套襯線標題字（要動字型鏡像，這次沒做）。
- 第 3 頁標註線的位置是照這句引文手調的（`props.note.x`／`len`），換引文要重調。
- 番茄紅底上的白字對比約 4:1，只用在 30px 以上的粗字。
- 沒有 research.md（validate 有一則提醒）；查證資料在 `videos/sample-ai-news/research.md`。
- 沒有請獨立評審打分數。

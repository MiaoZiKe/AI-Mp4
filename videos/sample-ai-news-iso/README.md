# sample-ai-news-iso：AI 教學頻道第一支等距 2.5D 完整片（無聲版）

成片是**無聲版**：`out/sample-ai-news-iso.mp4`，1080×1920、30fps、H.264，65.9 秒（1978 幀），20 鏡（19 鏡有旁白＋3.6 秒片尾卡）。
時間軸是照念稿音節數估的（`timeline.json` 有 `estimated` 標記）；畫面的時間全部寫 cue id，配音後重跑對齊就會自動對上。**沒有送任何 TTS 請求。**

- 九格圖：`out/sample-ai-news-iso-review.png`
- 每鏡截圖：`out/sample-ai-news-iso/stills/`、總覽 `out/sample-ai-news-iso-overview.png`、封面 `out/sample-ai-news-iso-cover.png`
- 字幕檔：`out/sample-ai-news-iso.srt`（中英）、`.zh.srt`、`.en.srt`

腳本、旁白（2026/11/13 親和專業版）、實測都和 `videos/sample-ai-news/` 一樣，只有畫面從深色仿介面換成等距 2.5D。實測原始回答沒有複製，`script.json` 用相對路徑指到 `../sample-ai-news/tests/*.json`；validate 會逐行比對，畫面上的回答只刪節、沒改字，都標「Gemini 實測・2026/11/13（節錄）」。旁白稿與逐句根據見 `videos/sample-ai-news/script.md`，查證見本資料夾 `research.md`（複製自 sample-ai-news）。

和 sample-ai-news 的 script.json 只有一處字幕不同：s11 的中文字幕斷點從「送出／你看，2.33%／這次數字對了」改成「送出。你看／2.33%／這次數字對了」（原本的斷法在這個引擎會顯示成「送出你看，」）。旁白和念稿沒動。

## 這個風格

等距 2.5D 插畫（isometric 2.5D），AI 教學頻道的固定風格（使用者 2026/11/14 決定）。規則、可用的畫面種類與色票角色寫在 `docs/channels/ai-tutorial.md` 第 3.1 節。

- 開關：`script.json` 頂層 `styleVersion: 3`＋`stage: "iso"`＋`isoVersion: 2`＋`sample: false`，每幕 `component: "IsoScene"`
- 畫面：`src/components/ai-iso/IsoFilm.tsx`（完整片引擎）；基本零件 `IsoVideo.tsx`；時間換算 `engine.ts`
- token：`src/theme.ts` 的 `THEME_ISO`／`LAYOUT_ISO`；檢查：`scripts/ai-iso/validate-iso.mjs`

同一張桌面演完全片，鏡頭只平移縮放。桌上的東西各有意思：螢幕＝AI、新聞紙＝原文、放大鏡＝搜尋／核對、五格托盤＝提示機、回答紙＝落回桌上的回答。

## 20 鏡在演什麼

| 鏡 | 畫面 |
|---|---|
| s01 | 第 0 幀就是實心大字「問 AI 物價／給我兩年前的」，螢幕寫「AI 回答 1.69%」、旁邊綠卡「今年 10 月 2.33%」；0.3 秒蓋章「2024 年的」，念到物價標紅「兩年前」。 |
| s02 | 鏡頭推到螢幕，提示卡逐字打出「10月CPI的新聞幫我抓重點」，黃便條「只打一句話」，提示卡沿虛線飛進螢幕。 |
| s03 | 螢幕吐出回答卡（實測節錄），後面疊出兩張紙表示一大篇，放大鏡飛到 1.69% 上。 |
| s04 | 回答卡落回桌上；1.69% 被劃掉蓋章「2024 年 10 月的」，綠色 2.33% 大卡掉下來把它彈開，再蓋圓章「今年的」。 |
| s05 | 螢幕再吐一張「再問一次」的回答（節錄），標出「2024年10月」、蓋章「第 2 次，還是 2024 年」；桌上的放大鏡跳一下冒出「✕ 沒開搜尋」，新聞紙跳一下冒出「✕ 沒給它新聞」；下面一行測試條件。 |
| s06 | 大字「換個問法」，「只打一句話」被劃掉；桌上彈出五格托盤，上面排出五個欄位名。 |
| s07 | 第 1 格「貼原文」、第 2 格「只看這段」：字在正面大卡上，講完飛進托盤變成色塊，欄位名跟著亮。 |
| s08 | 第 3 格「沒寫就說」，念到時「原文沒寫」抹上螢光底。 |
| s09 | 第 4 格「我是誰」，念到租房、外食時各抹一段螢光底。 |
| s10 | 第 5 格「分三段」，三個小標念到哪個跳出哪個。 |
| s11 | 念「送出」五個色塊依序飛進螢幕，螢幕閃一下；回答卡飛出來，「1. 已經確定的事」＋第一行，2.33% 標綠、蓋打勾章。 |
| s12 | 同一張卡往下長出「2. 還不確定的事」與十一月那一行，念到時整行抹黃。 |
| s13 | 再長出「…原文沒寫。」，念到時那四個字標藍加底線。 |
| s14 | 上下兩張卡同時停在畫面上約 2.5 秒：上「隨便問／2024 年的數字」，下「這樣問／和貼上的文字一致」，中間膠囊「同一個模型」。 |
| s15 | 回答卡再飛出來（已經確定的事三行），念到看法時「無輸入型通膨」被黃框框住，貼上黃便條「這是主計總處的看法／不是統計出來的數字」。 |
| s16 | 回答卡落回桌上變成回答紙；黃色大卡「AI 也會錯／數字、誰說的，回去對原文」；放大鏡飛到新聞紙上，兩張紙之間畫虛線，冒出「AI 的回答」「原文」。 |
| s17 | 正面平視的範本卡（11 行、42px），念到截圖時閃一下、四角出現截圖框、跳出「截圖存起來」。 |
| s18 | 範本卡縮到 0.78 倍讓位（字約 33px），下面跳出藍色提問卡「你最想丟哪一則新聞？」。 |
| s19 | 大字「兩篇新聞／講的不一樣？」；桌上兩份報導浮起來分開，標「報導 A」「報導 B」，念到怎麼辦時中間跳出問號。 |
| end | 無聲 3.6 秒片尾卡：鏡頭拉回整張桌面、螢幕打勾，卡片寫頻道名、「看新聞問 AI」、一句重點與實測標示。 |

## 配音設定

`voice.voiceName` 寫的是 **Iapetus（男）**：CLAUDE.md「各頻道音色（使用者 2026/11/14 決定）」寫 AI 教學＝Iapetus。其餘沿用 sample-ai-news：`gemini-2.5-flash-preview-tts`、`mode: "take"`、`cmn-TW`、`profile` 用 `ai` 預設（`delivery: "warm-pro"`、茶水間場景；`gender` 改成 male、場景句的「她」改成「他」）、同一組 arc 與 englishTerms。

sample-ai-news 原本用的是 Sulafat（女）。如果使用者試聽後要 Sulafat，把 `script.json` 的 `voice.voiceName` 改成 `"Sulafat"`、`voice.profile.gender` 改成 `"female"`、`voice.profile.voices` 改成 `["Sulafat"]`、`voice.profile.scene` 的「他」改回「她」，再跑下面的指令。

試聽由使用者在 Google AI Studio 的語音生成頁做（不花 API 額度）；同意之前不要跑下面第 2 步。

## 使用者同意後的正式配音（照順序）

```bash
cd /home/user/AI-Mp4
TZ=Asia/Taipei date                                               # 停工線檢查
node scripts/validate.mjs sample-ai-news-iso                      # 1. 要 0 error
NODE_USE_ENV_PROXY=1 node scripts/tts-take.mjs sample-ai-news-iso # 2. 整篇配音（1 次 TTS 請求）
NODE_USE_ENV_PROXY=1 node scripts/align.mjs sample-ai-news-iso    # 3. 強制對齊，整份覆蓋估算的 timeline.json
node scripts/validate.mjs sample-ai-news-iso                      # 4. 檢查每個 cue 都對到時間
.venv/bin/python scripts/voice-retro.py public/audio/sample-ai-news-iso/voice.wav '<整篇念稿文字>'   # 5. 捲舌指標（Iapetus 曾被聽成中國口音，偏高要照實回報）
df -h /                                                           # 可用不到 700MB 先清 out/sample-ai-news-iso/ 的中間檔
flock /tmp/aimp4-render.lock node scripts/still.mjs sample-ai-news-iso    # 6. 每鏡截圖，逐張看
flock /tmp/aimp4-render.lock node scripts/render.mjs sample-ai-news-iso   # 7. 成片＋字幕檔＋storyboard.json
ffprobe -v error -show_entries format=duration:stream=codec_name,width,height,r_frame_rate out/sample-ai-news-iso.mp4
python3 scripts/ui/review9.py sample-ai-news-iso 14,s03:old+18,s04:now+20,s09:eat+10,s11:go+12,s13:none+16,s14:ask+10,s16:check+16,s18:which+20   # 8. 重做九格圖
```

- 第 3 步**不要帶 `ALIGN_GAP_MAX`**（親和專業的旁白不把句間停頓壓成等距）。錄出來超過 72 秒先刪字（建議見 `videos/sample-ai-news/script.md` 開頭），後製加速上限 1.08。
- 第 5 步的音檔路徑是照 align 的慣例寫的（`public/audio/<slug>/voice.wav`），這支片還沒有音檔、沒有實際跑過；用法以 `scripts/voice-retro.py` 開頭的說明為準，念稿文字＝各幕 `tts`（沒有就用 `narration`）接起來。
- 只想重出無聲版：`node scripts/ui/silent-timeline.mjs sample-ai-news-iso`，再跑第 6、7 步（已經有真的配音時間軸時它不會覆蓋）。
- 看指定時刻：`flock /tmp/aimp4-render.lock node scripts/v3/peek.mjs sample-ai-news-iso <out.png> s11:go+12,s14:ask+10,1700 --scale 0.5`
- 改畫面參數：這支片的 props 是用暫存資料夾的 `build-script.py` 產生的（一次性的工具，沒有放進 repo）；之後直接改 `script.json` 就好。

## 配音後要重看的地方

1. **s07 第 1 格**：「貼原文」的大卡在念到「只看」前約 0.5 秒就飛進托盤，無聲版只停了 0.8 秒；配音如果念得更快會更短。
2. **s11**：色塊飛進螢幕要 0.9 秒，回答卡最早在色塊到齊後 2 幀才出來；「你看」念得很早時卡片會比聲音晚一點。
3. **s14**：無聲版兩張卡同時在畫面上約 2.5 秒；配音後確認仍有 1.5 秒以上。
4. **s17–s18**：範本卡從出現到離開無聲版約 5.5 秒；s18 縮小後字約 33px。
5. **s19 的問號**到片尾卡進來約 0.5 秒，偏短。

## 已知問題

- **還沒有配音、沒有背景音樂與音效**。sample-ai-news 的 `audio: { bgm, sfx }` 沒有搬過來（沒確認混音在這個畫面下的效果）。
- 每鏡 2.3–5.1 秒，多數低於 CLAUDE.md 一般規範的 5–10 秒；這是照 AI 教學頻道規則（18–24 鏡、每鏡 2–4 秒）。validate 用較慢的語速估配音版約 75 秒，在上限邊緣。
- s01 從 0.5 秒到 2.6 秒只有螢光標記與字幕在動；s04 從蓋章到綠卡掉下來約 1.8 秒只有鏡頭慢推；s09 的大卡停 3 秒多（中間有兩次螢光標記）；片尾卡 3 秒不動。
- s11–s13 的回答卡只佔主畫面上半（字 40–42px），下半是桌面；s14 兩張卡裡「我打的／我寫了」那一行是 30px，是全片要讀的字裡最小的。
- 卡片飛行途中（約 0.5 秒）字會跟著縮小，那幾格看不清楚；s03 的放大鏡會蓋住第一行開頭幾個字（和試片一樣）。
- 「這樣問」那幾鏡鏡頭推近托盤，螢幕被切到畫面左邊，只露出一角。托盤裡的色塊上沒有字（斜著的字會小於 28px），欄位名看上面那排。
- 九格圖左上角的幕名是照幕的起點算的，s16 那一格會標成 s17（兩幕交接處有 10 幀重疊）。
- 桌上物件的位置寫在 `IsoFilm.tsx` 的 `D` 與 `POS`，不是資料；換題目要換道具時得改元件。五格托盤固定五格。
- 封面直接用鉤子那一鏡的落定畫面，沒有另外設計。
- 沒有請沒參與製作的評審打分；`npm run selfcheck`、`npm run audit` 沒有跑。
- 新聞原文仍沒有親眼看到（沿用 sample-ai-news 的查證，數字取自搜尋摘要、多家互相對過）；上片前要對一次主計總處新聞稿。「這樣問」只測了 1 次、隨便問測了 2 次，沒有做開搜尋的對照。

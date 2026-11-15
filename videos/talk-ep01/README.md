# talk-ep01：一年工作 2,027 小時，為什麼降不下來（談晴說礙第一支完整片）

使用者看完 short-talk 說：「談晴說礙的旁白先暫用這個，給我完整影片吧，並且是要有題材的，不是這樣的影片」。所以這支是有題材、有資料、有口徑提醒、有出處的完整片，畫面照頻道貼文的風格。

**目前是第 4 版（2026/11/15）**：旁白＝`audio/worktime_sulafat.wav`（切掉被念出來的設定句），去掉晴與提問，53.37 秒。見下方「第 4 版」與 voice.md。

## 成片

- `out/talk-ep01.mp4`：**66.7 秒**（2,002 幀）、1080×1920、30fps、H.264，沒有人聲。
- 字幕檔 `out/talk-ep01.srt`、`.zh.srt`、`.en.srt`；封面 `out/talk-ep01-cover.png`；每鏡截圖 `out/talk-ep01/stills/`、總覽 `out/talk-ep01-overview.png`；九格圖 `out/talk-ep01-review.png`。
- 自查抽格：`out/talk-ep01/check/first3s.png`（前 3 秒每 2 幀）、`q1.png`–`q4.png`（全片每 0.25 秒）。
- 渲染約 1.5 分鐘（每幀 44 毫秒）。

## 內容

- 題目與理由、每個數字的來源與狀態：`research.md`。旁白全文（290 字）：`script.md`。每鏡：`storyboard.md`。貼文文案：`caption.md`。
- script.json 是用 `out/talk-ep01/gen-script.mjs` 產生的（out/ 不 commit；直接改 script.json 也可以）。

## 引擎加了什麼（都向下相容；short-talk 的 validate 0 error、畫面沒有動）

- script.json 頂層 `tanqing.film: true`＝完整片。validate 放寬成：可以有多個數字但每張資料圖都要寫 `claim`、旁白 230–290 字、18–24 鏡、要有提問（`kind: "ask"`）、下一集（`"next"`）、片尾卡（`"end"`，最後一幕 `silent: true`＋`durationSec`）。沒寫 `film` 的短片規則完全照舊。
- 新圖形在 `src/components/tanqing/Figures.tsx`（12 種）：`window`（窗，`sky: night｜dusk`，可帶大數字）、`months`（十二個月膠囊）、`grid`（日格陣列，跟著數數）、`bars`（直條，從 0 畫，`diff` 橘色虛線）、`line`（折線，縱軸不從 0 開始就一定要寫 `ticks`）、`week`（一週七格）、`pair`（兩塊 10×10 比例格）、`hbars`（橫條）、`rows`（表單式說明卡，`rowNAt`、`frame`、`tail` 箭頭）、`phone`（小人加手機訊息）、`bento`（便當）、`key`（鑰匙與房子吊牌）。舊的 `mark` 多一個 `arrow: false`。
- 頁碼：超過 8 頁時圓點自動縮小、變密，不壓到左下的出處。
- `scripts/tanqing/fetch-fonts.mjs`：襯線字型子集改成累加（保留已經抓過的字），換一支片重抓不會讓別支片缺字。

## 已知問題

1. **沒有聲音**。語速、停頓、口音、加速 1.2 倍都還沒做；現在每鏡的長度是用 5.0 音節/秒估的，配音後會變。
2. **每個數字都只對過搜尋結果的摘要**，沒讀到原始統計表（這個環境連不到政府與新聞網站）。上片前照 `research.md` 最後一節核對，尤其 2014 年的 2,135（只知道「約」）。
3. 第 13 鏡（只看全職）是 2023 年的數字，第 12 鏡的國際比較是 2024 年，主數字是 2025 年。畫面各自有標年份，旁白沒有念年份。
4. 第 9 鏡「正常工時變少、加班變多」只查到方向和 1–8 月的數字，沒有全年的確切時數，所以畫面只有箭頭。
5. 第 5、6 鏡的折線縱軸不是從 0 開始（有標刻度與「縱軸從…開始」小字），而且只畫查到的年份（2015、2016、2020、2022、2023 沒畫）。
6. 第 1 鏡：1.8 秒窗外的樓畫完之後，到 3.7 秒月亮出來之前約 1.9 秒沒有新事件（在等旁白念到「黑了」）。
7. 第 3 鏡橘色格子佔了一大片，比頻道平常「一個小小的橘色重點」重。
8. 版面下方三分之一（字幕以下）照貼文留白；覆蓋率檢查有 8 個警告（s04 33%、s11、s12、s14、s15、s17、s18 低於 40%；s18 空白帶 300px）。
9. 18 鏡，是要求範圍 18–24 的下限。
10. 「下一集，我們看房租」是預告，房租的資料還沒查。
11. 頻道口吻文件說長片「開頭有進場的字、句尾語助詞」；這支照使用者「正常說話」與短片留存做法，第一句就是數字，沒有加語助詞。

## 2026/11/15 版面規則修改（第 2 版，仍是無聲版）

使用者 2026/11/15「所有影片都是」的四條版面規則套用到這支：
- 字標：原本就固定在左上（太陽雲朵＋談晴說礙），全片不動，沒改。
- 填滿：script.json 頂層 `tanqing.fill: true` 開啟新版面（`LAYOUT_TANQING.FILL`；沒寫的 short-talk 版面不變）：圖區放大 1.06 倍、大標 88→96px 並下移到 1062、字幕 48/28→54/32px 移到 1372、出處 1588、頁碼 1610；1716 以下加一條米色厚紙帶（鋸齒上緣、虛線慢慢走、一排小圓點，中間一顆橘點），上方 0–200 加四條淡橫格線。只放裝飾，不放要讀的字。覆蓋率警告 8 個→4 個（s04、s14、s17、s18 在 32–39%），最長空白帶 300→198px。
- 片尾 LOGO 動畫（s18，`figure.rise: true`，片尾卡 2.6→3.0 秒）：雲一筆描出來（雲裡填紙色）→ 太陽從雲後面慢慢升起 → 三道光一道一道畫出來 → 「談晴說礙」一個字一個字寫上去 → 太陽很輕地呼吸。不閃、不彈。
- 片尾音效：程式合成的溫和卡林巴琴（`out/talk-ep01/sfx/end-chime.wav`）：太陽升起時一個很輕的 C＋G 長音，四個字寫上去時各一個音（C5–E5–G5–C6，招牌旋律），加一點短殘響；在成片最後混進去（片尾卡起點對齊）。
- 時間軸：改了片尾長度，重跑 `SILENT_RATE=5.0 SILENT_GAP=0.3 node scripts/ui/silent-timeline.mjs talk-ep01`，全片 67.1 秒（2014 幀）。畫面事件仍全部寫 cue，配音後 align 會自動重排。
- 上一版成片備份：`out/talk-ep01.v1.mp4`。
- **配音沒有做**：這次的 TTS 請求被權限檢查擋下，沒有送出（0 次）；還是無聲版。

## 2026/11/15 配音版（第 3 版）

- 有配音了：Sulafat，兩次請求分段生成（整篇一次的請求回 502 兩次），接起來後 `tts-take.mjs --resplit`，`atempo=1.15`。細節與數字見 voice.md「第 3 版」。
- 成片 `out/talk-ep01.mp4`：67.37 秒（2021 幀），影音軌一樣長；整片約 −14 LUFS（人聲 −16 LUFS 加上 BGM），片尾卡林巴琴在 64.37 秒混入、峰值約 −6.5 dB。字幕檔 `out/talk-ep01.srt`／`.zh.srt`／`.en.srt`。
- 語速扣掉幕間停頓 5.08 音節/秒（原始 4.41）；對齊最低 s04 0.334、s03 0.622。
- 無聲第 2 版備份 `out/talk-ep01.v2-silent.mp4`，第 1 版 `out/talk-ep01.v1.mp4`。
- 檢查圖 `out/talk-ep01-review.png`（每 0.25 秒一格；`review-sheet.py` 需要 review.md 評分表，這支沒有，所以用 ffmpeg 直接排）。

## 人耳／人眼確認清單（秒數是無聲版的位置，配音版會差幾秒）

- [ ] 0.0–5.0 秒：第一句「兩千零二十七」念得順不順；有沒有氣音。
- [ ] 8.4–12.4 秒：「兩百五十三個工作天」數字有沒有念錯。
- [ ] 12.1–15.9 秒：「二零一四年」「兩千一百三十五」。
- [ ] 18.5–23.3 秒：「三點六小時」；「假變多」會不會聽成別的字。
- [ ] 26.2–30.7 秒：「百分之三到四」「四個有一個」。
- [ ] 43.4–48.2 秒：「多上將近四百小時的班」斷句。
- [ ] 47.9–52.8 秒：「四十一點五」。
- [ ] 52.5 秒（轉到晴）與 58.8 秒（提問）之前的停頓夠不夠、會不會太長。
- [ ] 全片語速（目標扣掉停頓約 5.0 音節/秒）、口音像不像台灣人平常講話。
- [ ] 人眼：38.9–52.8 秒的口徑提醒三鏡看不看得懂；58.8–62.6 秒的提問格截圖起來像不像一張貼文。

## 重做指令

```
node scripts/tanqing/fetch-fonts.mjs talk-ep01          # 改了大標才要
SILENT_RATE=5.0 SILENT_GAP=0.3 node scripts/ui/silent-timeline.mjs talk-ep01   # 無聲時間軸（有真的配音後不要跑）
npm run validate talk-ep01
flock /tmp/aimp4-render.lock npm run still talk-ep01
flock /tmp/aimp4-render.lock npm run render talk-ep01
```

## 2026/11/15 第 4 版（worktime 旁白、介紹完就好）

- 成片 `out/talk-ep01.mp4`：**53.37 秒**（1601 幀），15 鏡（s01–s13 內容、s14 下一集、s15 片尾卡）；影音軌等長、無黑幀、−14.4 LUFS。第 3 版備份 `out/talk-ep01.v3.mp4`、舊稿 `script.v3.json`。
- 檢查圖：`out/talk-ep01-review.png`（每 2.2 秒一格）、`out/talk-ep01/check/q1–q4.png`（每 0.25 秒）、`first3s.png`（前 3 秒每 2 幀）。
- 之後的集數：script.json 寫 `voice: { voiceName: "Sulafat", mode: "take", profile: "tanqing-report" }`，`npm run tts <slug>` 自動配音（1 次請求；設定句被念出來會自動切掉）。
- 人耳待確認：s02「二零二五」（聽寫曾聽成二零二三）、s04 對齊信心 0.31、所有數字念法。

## 2026/11/15 第 5 版（無聲審稿版、跨頻道版面規則、片尾 B 版）

- 成片 `out/talk-ep01-v5-silent.mp4`：53.57 秒（1607 幀），**沒有旁白**（時間軸沿用 v4 的配音時間軸、voiceLeadIn 0.2 不變），音軌只有片尾招牌音。`out/talk-ep01.mp4` 仍是 v4（備份 `out/talk-ep01.v4.mp4`）。
- 開關：script.json 頂層 `tanqing.layout: "v5"`（新版面與動畫）、`tanqing.silentVoice: true`（畫面不掛旁白；有正式配音版時拿掉）。沒寫的片（short-talk）照舊。
- 版面（`LAYOUT_TANQING.V5`）：字標左上 y40–124、圖 168 起放大 1.08、大標 100px、大標下面是情境插畫帶（到 1450）、字幕卡 1474–1692、出處 1712、頁尾細帶 1806 起。量測在 `out/talk-ep01-v5/layout-check.md`（頂端 42、底端 54–55 px）。
- 動畫：每頁兩層＝情境線稿（`props.scene`：desk／city／commute／calendar／home／cafe，`src/components/tanqing/Scenery.tsx`，遠近兩層視差＋時鐘、熱氣、窗燈、公車、翻頁等小動作）＋資料圖；換頁用擦入（新頁實心蓋舊頁）；大標逐行擦出帶回彈；大數字與長條數值往上數；長條帶回彈依序長；s02 年總工時括號上有減速停下的光點流。
- 片尾卡（B 版）：雲描線 → 太陽從雲後升起、落定回彈暈開 → 三道光 → 四個字由左往右寫上 → 字幕卡換成「留言『工時』拿完整資料」。關鍵字在 s15 `props.endCard.keyword`（**「工時」是暫定，等使用者確認**），句型在 `props.endCard.text`。
- 片尾招牌音：`python3 scripts/tanqing/endcard-sound.py talk-ep01 <out.wav> --gain -5`（純正弦／卡林巴式泛音、短回音、無雜訊），再 `alimiter=limit=0.84:level=disabled:attack=5:release=60:latency=1`。拍點（太陽落定、三道光、四個字、關鍵字）和畫面同一幀，讀同一組 script.json 欄位；片尾段 −11.5 LUFS、峰值 −1.6 dB（混進 mp4 後 −11.7 LUFS）。單獨 MP3：`out/talk-ep01-v5/endcard-sound.mp3`。
- 檢查圖：`out/talk-ep01-v5/before-after.png`（v4｜v5 同時間點）、`endcard-strip.png`（片尾每 0.1 秒）、`peek1.png`。
- 重做：`npm run validate talk-ep01` → `RENDER_CONCURRENCY=2 flock /tmp/aimp4-render.lock npm run render talk-ep01`（平行 4 時 Chrome 曾 ERR_INSUFFICIENT_RESOURCES 當掉）→ 用 ffmpeg 把 `out/talk-ep01.video.mp4` 的畫面接上片尾音軌。render 會覆蓋 `out/talk-ep01.mp4`，做完要從 `.v4.mp4` 還原。

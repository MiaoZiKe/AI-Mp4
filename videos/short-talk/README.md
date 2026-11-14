# short-talk：三十出頭，十個有六個還沒結婚（談晴說礙・夜窗）

## 成片

- `out/short-talk.mp4`：13.9 秒（418 幀）、1080×1920、30fps、H.264。**目前是無聲版**：還沒有送正式配音（TTS 請求 0 次），時間軸是 `node scripts/ui/silent-timeline.mjs short-talk` 依字數估的（每秒 4.9 音節、幕間 0.3 秒）。配音後跑 `tts-take` → `align` 會整份蓋掉 `timeline.json`，畫面的時間全部寫 cue id，會自動對上真的聲音。
- 字幕檔：`out/short-talk.srt`、`.zh.srt`、`.en.srt`；分鏡表 `videos/short-talk/storyboard.json`。
- 九格圖：`out/short-talk-review.png`（ffmpeg 抽第 0、62、92、150、215、250、330、360、410 幀；`scripts/v3/review-sheet.py` 要有獨立評審填的 review.md，這支還沒有，所以沒用它）。
- 渲染時間：418 幀約 2 分鐘（每幀約 0.12 秒，平行數 4）。

## 風格（stage: "talk"，夜窗）

一句話：全螢幕實拍照片慢慢推近、加底片顆粒和暗角，礙的段落是冷夜色，念到「不過」整個畫面轉成暖燈色，最後回到第一鏡同一扇窗。全片只有一個大數字（62%），配一排十格窗亮六格。設計理由與另外四種做法的比較在 `docs/channels/tanqing-visual-research.md`。

- 元件：`src/components/talk/`（`engine.ts` 把各幕 props 攤平成絕對幀；`TalkVideo.tsx` 的 `VideoTalk`／`CoverTalk`）。token：`src/theme.ts` 的 `THEME_TALK`／`LAYOUT_TALK`。檢查：`scripts/talk/validate-talk.mjs`。
- 每幕 `component: "TalkScene"`，props＝`photo`（`name`、`at`、`push: in｜out｜drift`、`focus`）、`grade`（`night｜warm`）＋`gradeAt`、`words`（`number｜line｜windows｜sunny｜ask`，`at`／`until`／`litAt` 只寫 cue id）。
- 照片放 `public/talk/<slug>/<name>.jpg`（不 commit），原圖在 `out/short-talk/assets-raw/photos/`，來源與授權見 `assets.md`。照片用 Remotion 的 `Img`，會等載入完才截幀。

## 每鏡

| 鏡 | 時間（無聲估算） | 畫面 |
|---|---|---|
| s01 | 0.0–3.7 秒 | 第 0 幀就是夜裡公寓窗＋「62%」＋「30–34 歲・還沒結婚」；念到「十個」出現十格窗，念到「六個」一格一格亮到第六格 |
| s02 | 3.4–7.7 秒 | 換成雨窗；念到「那一題」出現「過年被問的那一題」，念到「答案」出現「還沒有答案」 |
| s03 | 7.4–11.5 秒 | 念到「不過」換成加辣湯麵、整個畫面轉暖；依序出現「今天的一小段晴」「阿姨記得我要加辣」 |
| s04 | 11.1–13.9 秒 | 回到第一鏡的窗、慢慢拉遠；「明天・下一個數字」，再停在「你今天的一小段晴／是什麼？」 |

## 這一輪改了什麼（出片時的自查修正）

- 第 0 幀原本是黑的（照片用 CSS 背景，渲染不等載入）→ 改用 `Img`；第 0 幀的字幕原本會淡入 → 鉤子幀直接顯示。
- 湯麵照片太亮，英文字幕和出處讀不到 → 加字幕區暗帶 `THEME_TALK.capBand`（y 1180 以下）、warm 調色亮度 0.82→0.74、暖色字也加暗底。
- s03 的兩句暖色字會和 s04 的「明天・下一個數字」疊在一起再跳位 → s03 的字改成 `until: "exit-10"`。
- s04 的提問原本在「數字」才出現，只停約 1.2 秒 → 改成 `tomorrow+20`，停約 1.8 秒。

## 已知問題

- **沒有聲音**：配音還沒做（等使用者同意用 Sulafat 正式配音，每支 1 次請求）。目前的音軌是靜音（−91 dB），`audio.bgm` 沒有實際音檔。
- 畫面上的「62%」截至 2026/11/14 尚未確定（只有華視一則報導），上片前要到戶政司核對，步驟在 `research.md` 最後一節；旁白的「十個有六個」有兩個獨立來源。
- s04 的暖色和 s01 的夜色差別不大（city-night 原圖本來就偏橘），冷轉暖主要靠 s03 那一下。
- s02 畫面上的「過年被問的那一題」和字幕同一句，重複；要的話可以改成更短的「那一題」。
- s01 開頭 0–1.6 秒只有慢推鏡和顆粒在動（字已經在），第一個事件在「十個」。
- 提問字 52px、字重 500，在手機上可讀但不搶眼。

## 人耳確認清單（配音後）

- 0.2 秒「欸」：進場的字要輕，不是喊人。
- 1.7–2.3 秒「十個有六個」：窗格亮起要對上「六個」，數字處有一點停頓。
- 3.7–7.4 秒 s02：聲音再小一點，「啊」不要拖。
- 7.7 秒「不過」：畫面轉暖的瞬間要對上這個詞；語氣鬆下來、帶一點笑意。
- 11.5–13.4 秒 s04：「吧」輕收，不要像節目結尾。
- 全片：有沒有念出設定說明、有沒有漏句；用 `scripts/voice-retro.py` 量語速（目標 4.6–5.0 音節/秒）與捲舌指標。

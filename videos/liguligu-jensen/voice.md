# liguligu-jensen 旁白紀錄

更新：台灣時間 2026/11/14 21:50。

## 結論：這份錄音不能當全片旁白

使用者 2026/11/14 上傳、說「哩股哩股使用這旁白」的音檔：
`public/audio/liguligu-jensen/user-recording.orig.wav`（原檔名 `Generated_Audio_November_14_2026_-_9_11PM.wav`，24kHz 單聲道、25.04 秒，md5 `4413fff7c26f9a492247841f54f6e3c4`；原檔沒有改動，這裡是複本，`public/audio/` 不 commit）。

- **音色名稱與提示詞：使用者尚未告知。**（檔名是 Google AI Studio 匯出的預設格式；內容和 `docs/prompts/liguligu-男聲試聽.txt` 的「短版」念稿相同。）
- **錄到的內容只有前 3 句（s01–s03），而且念了兩遍；s04–s07 四句沒有錄到。**

| 位置 | 念的內容 |
|---|---|
| 0.17–12.35 秒（第一遍） | 三十三年的執行長，辭職即刻生效。公告沒寫原因。／四天前董事會才說，沒理由相信機密外洩。／文件寫辭職，媒體卻說董事會要他走。 |
| 12.35–13.24 秒 | 靜音 |
| 13.24–24.76 秒（第二遍） | 同樣三句再念一次 |

怎麼確認的（都在本機，沒有送任何請求）：
1. 用對齊模型（MMS-300M）不給稿子直接聽寫成拼音，兩段都是 `…nian de zhixingzhang / cizhi / jike shengxiao / gonggao mei xie yuanyin / …tian qian dongshihui cai shuo / mei liyou xiangxin jimi waixie / wenjian xie cizhi / meiti que shuo dongshihui yao ta zou`。
2. 拿全片 7 句的念稿去強制對齊整個檔：s01–s03 信心 0.81／0.96／0.97，s04–s07 只有 0.28／0.31／0.39／0.31（對不上）。
3. 把檔案從 12.80 秒切成兩段，各自對前 3 句的念稿：信心 0.90 與 0.91，52 個字都對上。前 3 句和稿子一字不差，沒有多字、少字或換詞。

## 量測（兩遍分開量）

| 項目 | 第一遍（0–12.80 秒） | 第二遍（12.80–25.04 秒） | 目標或參考 |
|---|---|---|---|
| 字數 | 52 | 52 | |
| 說話長度（去頭尾靜音） | 12.24 秒 | 11.53 秒 | |
| 語速（含句間停頓） | 4.25 音節/秒 | 4.51 音節/秒 | `liguligu` 設定檔 4.4–4.9 |
| 語速（扣掉停頓） | 5.4 | 5.7 | |
| 句間停頓（秒） | 0.30、0.25、0.66、0.37、0.74、0.29 | 0.19、0.63、0.51、0.23、0.56、0.25 | 句號比逗號長：有做到 |
| 音高中位數（F0 估算） | 89 Hz | 114 Hz | 男聲約 90–160 |
| 捲舌指標（ㄓㄔㄕ 與 ㄗㄘㄙ 擦音重心差） | 4.3 kHz（9 字／7 字） | 4.7 kHz（10 字／7 字） | what-is-server 0.9、tech-cowos 0.5、stock-jensen 4.4（被聽成中國口音） |
| 對齊信心 | 0.90 | 0.91 | ≥0.5 |
| 響度 | 整檔 −16.5 LUFS、真峰值 +2.7 dBTP（偏高，混音時要壓） | | |

要注意的：
- 兩遍聽起來不是同一種念法：第二遍音高高了大約 25 Hz、也比較快。要用哪一遍的感覺，需要使用者指定。
- 捲舌指標 4.3–4.7 kHz，落在專案裡量過最高的一級（和被聽成中國口音的 stock-jensen 同級）。樣本只有 7–10 個字，數字只是輔助，口音要人耳判斷。
- 工具：`scripts/voice-measure.py`（長度、停頓、音高）、`scripts/voice-retro.py`（捲舌，內部用 `scripts/fa.py`）。

## 接錄音的步驟（拿到 7 句完整錄音之後）

1. 音檔轉成 24kHz 單聲道 16-bit WAV，放 `public/audio/liguligu-jensen/`。
2. `script.json` 的 `voice` 改成 `{ "voiceName": "user-recording", "model": "user-recording", "mode": "take" }`（拿掉 `profile` 與 `languageCode`）。
3. `node scripts/tts-take.mjs liguligu-jensen --resplit` 會說找不到 `.take-<雜湊>.raw.wav`，把音檔複製成那個檔名再跑一次（不送 TTS 請求；念稿沒改的話雜湊是 `2da0d48922`）。
4. 每幕信心都 ≥0.5 才 `npm run align` → `still` → `render`。liguligu-cpi 那次記下的注意事項：第一幕音檔要補回開頭靜音，時間軸才和原始錄音一致；`render` 會自動混背景音樂，只要旁白的話要另外合成。

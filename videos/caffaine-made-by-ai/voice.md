# 配音（2026/11/16，Andy：「用 API 配旁白」）

- 音色 Sulafat（女）、`voice.profile: "ai-report-v5"`、`gemini-2.5-flash-preview-tts`、`languageCode: cmn-TW`、`mode: "take"`。念稿不改字，`tts` 欄位只把 AI 寫成「A I」。
- **TTS 請求 1 次**（`TTS_NO_RETRY=1`，HTTP 200、有音訊、沒重送；見 `tts-requests.json`）。整篇一次送出，實際送出全文＝script.json 各幕 `tts`（沒有就用 narration）依序接成。
- 後製：`TAKE_ATEMPO=1.15`（上限，重切不花請求）、`ALIGN_GAP_MAX=0.35`、不寫 pauseAfter。
- 語速（約 178 音節）：說話 33.51 秒 → 扣停頓 **5.31**、含停頓 **5.42** 音節/秒（目標 ≥5.4／≥4.9）。整篇對齊信心 0.896。
- 捲舌指標：ㄓㄔㄕ 6.21 kHz、ㄗㄘㄙ 9.48 kHz，差距 3.27 kHz（n = 29／10；樣本少，只是輔助，要人耳判斷）。
- 人耳確認：整體口吻是否正常報導、有沒有中國口音、加速 1.15 自不自然、「A I」念法、數字與專有名詞。

## 2026/11/16 重配（Andy：兩支音調要一致、s07 念好）
- 兩支念稿合進同一次 TTS 請求（暫時合併 slug `caffaine-pair-tmp`：made-by-ai 在前、two-answers 在後，16 幕），切完各自放回 `public/audio/<slug>/`，再各自 `npm run align`。請求 1 次（先前兩次 400 是 node 沒走代理、金鑰沒注入，沒有生成；要用 `NODE_USE_ENV_PROXY=1`）。
- s07 只改 `tts`：「檢查程式就會把它抓出來，再叫它改」（字幕不動）。
- 量測：音高中位數 made-by-ai 210.5 Hz、two-answers 208.7 Hz（差 0.9%）；語速扣停頓 5.60／5.59、含停頓 5.12／5.24；s07 信心 0.905；s07 小檔 `out/check-s07.wav`（`scripts/caffaine/pitch-median.py` 量音高）。

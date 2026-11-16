# 配音（2026/11/16，Andy：「用 API 配旁白」）

- 音色 Sulafat（女）、`voice.profile: "ai-report-v5"`、`gemini-2.5-flash-preview-tts`、`languageCode: cmn-TW`、`mode: "take"`。念稿不改字，`tts` 欄位只把 AI 寫成「A I」。
- **TTS 請求 1 次**（`TTS_NO_RETRY=1`，HTTP 200、有音訊、沒重送；見 `tts-requests.json`）。整篇一次送出，實際送出全文＝script.json 各幕 `tts`（沒有就用 narration）依序接成。
- 後製：`TAKE_ATEMPO=1.15`（上限，重切不花請求）、`ALIGN_GAP_MAX=0.35`、不寫 pauseAfter。
- 語速（約 143 音節）：說話 28.66 秒 → 扣停頓 **4.99**、含停頓 **5.19** 音節/秒（目標 ≥5.4／≥4.9）。整篇對齊信心 0.915。
- 捲舌指標：ㄓㄔㄕ 5.49 kHz、ㄗㄘㄙ 8.77 kHz，差距 3.28 kHz（n = 21／16；樣本少，只是輔助，要人耳判斷）。
- 人耳確認：整體口吻是否正常報導、有沒有中國口音、加速 1.15 自不自然、「A I」念法、數字與專有名詞。

# 配音（2026/11/17，Andy：6 支無聲版都 OK，配上旁白）

- 音色 Sulafat（女）、`voice.profile: "ai-report-v5"`、`gemini-2.5-flash-preview-tts`、`languageCode: cmn-TW`、`mode: "take"`。念稿不改字（`tts` 欄位照 script.json）。
- 六支（screenshot-ask、pdf-cite、excel-formula、two-ai-duel、say-idk、menu-translate，共 61 幕）放進同一次 TTS 請求（暫時合併 slug `voice-batch-tmp`，原始整篇錄音與請求紀錄留在 `videos/voice-batch-tmp/`），**請求 1 次**（HTTP 200、有音訊、沒重送；見 `videos/voice-batch-tmp/tts-requests.json` 第 2 筆）。實際送出全文＝`out/tts-final-1117b.txt`（各幕念稿依序接成；送前 `tts-precheck.py` 0 個 ⚠）。
- 後製：**不加速**（沒設 TAKE_ATEMPO）；`ALIGN_GAP_MIN=0.3`（句間至少 0.3 秒）、`ALIGN_BEAT_GAP=0.7`（beat 換段至少 0.7 秒）。
- 量測：成片 53.3 秒，不含片尾卡 49.7 秒；語速（中文音節數÷秒）扣停頓約 4.30、含停頓約 3.82 音節/秒（沒有加速，模型自然語速比 11/16 那批慢，沒有硬加速）；整篇對齊信心 0.937，沒有對齊信心 < 0.5 的幕。
- 捲舌指標：ㄓㄔㄕ 與 ㄗㄘㄙ 差距 1.64 kHz（樣本少，只是輔助，要人耳判斷）。
- 人耳確認：整體口吻是否正常報導、有沒有中國口音、語速是否偏慢、「AI」念法、數字與專有名詞。

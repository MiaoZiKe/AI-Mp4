# 配音（2026/11/16，Andy：「用 API 配旁白」）

- 音色 Sulafat（女）、`voice.profile: "ai-report-v5"`、`gemini-2.5-flash-preview-tts`、`languageCode: cmn-TW`、`mode: "take"`。念稿不改字，`tts` 欄位只把 AI 寫成「A I」。
- **TTS 請求 1 次**（`TTS_NO_RETRY=1`，HTTP 200、有音訊、沒重送；見 `tts-requests.json`）。整篇一次送出，實際送出全文＝script.json 各幕 `tts`（沒有就用 narration）依序接成。
- 後製：`TAKE_ATEMPO=1.15`（上限，重切不花請求）、`ALIGN_GAP_MAX=0.35`、不寫 pauseAfter。
- 語速（約 143 音節）：說話 28.66 秒 → 扣停頓 **4.99**、含停頓 **5.19** 音節/秒（目標 ≥5.4／≥4.9）。整篇對齊信心 0.915。
- 捲舌指標：ㄓㄔㄕ 5.49 kHz、ㄗㄘㄙ 8.77 kHz，差距 3.28 kHz（n = 21／16；樣本少，只是輔助，要人耳判斷）。
- 人耳確認：整體口吻是否正常報導、有沒有中國口音、加速 1.15 自不自然、「A I」念法、數字與專有名詞。

## 2026/11/16 重配（Andy：音調要跟第一支一致）
- 與 `caffaine-made-by-ai` 合在同一次 TTS 請求生成（做法見該片 voice.md），音高中位數 208.7 Hz vs 第一支 210.5 Hz；語速扣停頓 5.59、含停頓 5.24；念稿不變。

## 2026/11/16（深夜）四支合併重配（Andy：虛線空位改掉、四支一起配旁白，不後製加速、停頓拉長）
- 四支念稿（made-by-ai、two-answers、same-look、sketch-game，41 幕）放進同一次 TTS 請求（暫時合併 slug `caffaine-quad-tmp`），Sulafat、`ai-report-v5`、cmn-TW、`NODE_USE_ENV_PROXY=1`、`TTS_NO_RETRY=1`；**請求 1 次**（沒重送）。實際送出全文＝`out/tts-final-1116.txt` 各幕念稿依序接成（送前 `tts-precheck.py` 0 個 ⚠；same-look s05 補成「的 AI」前後空白）。切回各支用 `scripts/caffaine/split-quad.py`。
- 後製：**不加速**（沒設 TAKE_ATEMPO）；`ALIGN_GAP_MIN=0.3`（句間至少 0.3 秒）、`ALIGN_BEAT_GAP=0.7`（beat 換段至少 0.7 秒），兩個環境變數是這次加進 `scripts/align.mjs` 的（預設 0＝不影響其他片）；換幕人聲間隔實測 0.27–0.70 秒。
- 量測：音高中位數 212.4 Hz（四支 222.2／212.4／218.2／208.7，最大差約 6.3%，超過 5% 目標，原因是同一請求內各支語氣起伏不同；沒有再送請求）；語速扣停頓 5.04、含停頓 4.44 音節/秒；正片 48.2 秒（不含片尾卡）；各幕對齊信心全部 ≥0.5（沒有低信心幕）。
- 人耳確認：整體口吻、有沒有急促、段落停頓是否夠、AI 念法、前 5 秒。

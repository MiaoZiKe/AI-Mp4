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

## 2026/11/16（深夜）四支合併重配（Andy：虛線空位改掉、四支一起配旁白，不後製加速、停頓拉長）
- 四支念稿（made-by-ai、two-answers、same-look、sketch-game，41 幕）放進同一次 TTS 請求（暫時合併 slug `caffaine-quad-tmp`），Sulafat、`ai-report-v5`、cmn-TW、`NODE_USE_ENV_PROXY=1`、`TTS_NO_RETRY=1`；**請求 1 次**（沒重送）。實際送出全文＝`out/tts-final-1116.txt` 各幕念稿依序接成（送前 `tts-precheck.py` 0 個 ⚠；same-look s05 補成「的 AI」前後空白）。切回各支用 `scripts/caffaine/split-quad.py`。
- 後製：**不加速**（沒設 TAKE_ATEMPO）；`ALIGN_GAP_MIN=0.3`（句間至少 0.3 秒）、`ALIGN_BEAT_GAP=0.7`（beat 換段至少 0.7 秒），兩個環境變數是這次加進 `scripts/align.mjs` 的（預設 0＝不影響其他片）；換幕人聲間隔實測 0.27–0.70 秒。
- 量測：音高中位數 222.2 Hz（四支 222.2／212.4／218.2／208.7，最大差約 6.3%，超過 5% 目標，原因是同一請求內各支語氣起伏不同；沒有再送請求）；語速扣停頓 5.14、含停頓 4.49 音節/秒；正片 46.8 秒（不含片尾卡）；各幕對齊信心全部 ≥0.5（沒有低信心幕）。
- 人耳確認：整體口吻、有沒有急促、段落停頓是否夠、AI 念法、前 5 秒。

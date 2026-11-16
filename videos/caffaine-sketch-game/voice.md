
## 2026/11/16（深夜）四支合併重配（Andy：虛線空位改掉、四支一起配旁白，不後製加速、停頓拉長）
- 四支念稿（made-by-ai、two-answers、same-look、sketch-game，41 幕）放進同一次 TTS 請求（暫時合併 slug `caffaine-quad-tmp`），Sulafat、`ai-report-v5`、cmn-TW、`NODE_USE_ENV_PROXY=1`、`TTS_NO_RETRY=1`；**請求 1 次**（沒重送）。實際送出全文＝`out/tts-final-1116.txt` 各幕念稿依序接成（送前 `tts-precheck.py` 0 個 ⚠；same-look s05 補成「的 AI」前後空白）。切回各支用 `scripts/caffaine/split-quad.py`。
- 後製：**不加速**（沒設 TAKE_ATEMPO）；`ALIGN_GAP_MIN=0.3`（句間至少 0.3 秒）、`ALIGN_BEAT_GAP=0.7`（beat 換段至少 0.7 秒），兩個環境變數是這次加進 `scripts/align.mjs` 的（預設 0＝不影響其他片）；換幕人聲間隔實測 0.27–0.70 秒。
- 量測：音高中位數 208.7 Hz（四支 222.2／212.4／218.2／208.7，最大差約 6.3%，超過 5% 目標，原因是同一請求內各支語氣起伏不同；沒有再送請求）；語速扣停頓 4.84、含停頓 4.33 音節/秒；正片 48.0 秒（不含片尾卡）；各幕對齊信心全部 ≥0.5（沒有低信心幕）。
- 人耳確認：整體口吻、有沒有急促、段落停頓是否夠、AI 念法、前 5 秒。

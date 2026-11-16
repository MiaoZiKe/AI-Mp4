# 同批配音（voice-batch）：給各頻道看的短說明

目的：Gemini TTS 免費額度四個頻道共用，一天約 10 次請求。把同一批的多支片念稿合成**一次請求**，一週 50～100 支才撐得住。

## 指令
```
scripts/caffaine/voice-batch.sh [--dry] <slug1> <slug2> ... <slugN>
```
流程：念稿預檢（`tts-precheck.py`，有 ⚠ 就停）→ 合併成 `videos/voice-batch-tmp/script.json`（幕 id 加 `p1_`、`p2_` 前綴，段落編號各隔 100）→ `tts-take.mjs` 送 1 次 → 依前綴切回各支（`public/audio/<slug>/`、各自的 `tts-manifest.json`）→ 各支 `align --force`。`--dry` 只合併檢查、不送請求。

## 前置
1. 每支都有 `videos/<slug>/script.json`，旁白寫在 `narration`（要改念法的寫 `tts`），每幕有 `para`。
2. 音色與設定檔讀各片 `script.json` 的 `voice`（`voiceName`、`profile`、`languageCode`）；沒寫才用 CaffAIne 預設（Sulafat＋`ai-report-v5`、`cmn-TW`）。別的頻道照自己的 `voice` 寫就行，腳本沒有寫死 CaffAIne。
3. 停頓：句間 ≥0.3、段落 0.7 秒；要改，在第一支的 `voice` 加 `gapMin`、`beatGap`，或臨時用環境變數 `ALIGN_GAP_MIN`、`ALIGN_BEAT_GAP`。不加速（不設 `TAKE_ATEMPO`）。
4. 要有 `NODE_USE_ENV_PROXY=1` 的網路環境（腳本已自動帶）。

## 限制
- **同一批一定同音色、同 profile、同 languageCode**，不一致腳本直接報錯。不同頻道若音色不同，就分批各送一次。
- 一批的總字數別太長（建議 ≤ 8 支、約 2000 字內）；太長模型會變慢或失真，分兩批。
- 合併檔 `videos/voice-batch-tmp/` 留著（含原始整篇錄音），要重切用 `tts-take.mjs voice-batch-tmp --resplit`，不要重送。
- 任何一支改稿＝整批重配（要先說明原因與次數）。只想改一支就把它單獨做成新的一批。
- 配完先聽每支前幾句，口音、語速不對再回報，不要自行重送。

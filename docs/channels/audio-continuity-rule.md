# 音訊不斷續（全頻道規則，2026/11/21；可直接貼給主控）

1. 根因：旁白補停頓插的是樣本值全 0 的數位靜音＋5ms 接縫，切點又常落在兩字連音中間（數字前後、對齊間隔 0），聽起來像字被切斷、聲音斷電；Gemini 3.x 回的是完整 WAV，把整包當 PCM 會在旁白最後多 0.16 秒 −8 dBFS 雜訊（C2PA 區塊）。
2. 停頓只能補「這條錄音自己的底噪」（−90～−60 dBFS），不補純 0；接縫用 10–20ms 等功率交叉淡化。
3. 切點那 10ms 要 ≤ −50 dBFS、連續安靜 ≥30ms；沒有氣口的地方不加停頓（不硬切），要停就改稿加逗號重配。
4. TTS 回應只取 WAV 的 data 區塊（丟掉 RIFF 檔頭與 C2PA 區塊）；切說明句後 20–30ms 淡入。
5. 首字起音 ≥0.3 秒（不夠就在前面補底噪），成片片頭 0.3 秒淡入（不超過首字前 0.03 秒）；全片疊 −90 dBFS dither，成品不得有數位靜音。
6. 交件前必跑 `python3 scripts/dossier/audio-check.py <slug> [--file 成品] [--end 片尾卡秒]`，exit 1 不交：數位靜音 ≥30ms、斷音（≥ −40 dBFS 在 10ms 內掉 ≥40 dB）、死寂起音（≤ −85 dBFS 在 10ms 內升 ≥35 dB）、wav 夾 C2PA。
7. 工具：哩股哩股 `scripts/dossier/`（insert-pauses.py、voice-take.mjs、voice-prep.py、mix-final.sh、make.mjs 已接）；其他頻道自己插靜音或接段的腳本照 2–5 條改，`scripts/tts-take.mjs` 原本就只取 data 區塊。
8. 已發的片不重做；證據與量測表：`docs/channels/audio-dropout-report.md`。
9. 2026/11/22 修訂（取代「數字前後插停頓」）：不准在句中插停頓（不用 `insert-pauses.py --nums`／`--sentence`），只允許換幕處 `--scene`（0.6–0.8 秒、最多 6 處）；語速靠念稿字數（≤190 字）與 TTS 提示控制。交件前除了 audio-check 還要過 `pause-density.py`（句內不得有 ≥0.25 秒停頓、總數 ≤ 句數＋2）、`listen-check.mjs`（Gemini 聽感，CER ≤3%）、`frame-check.py`；完整規則見 liguligu-daily-playbook.md「交件四關」。
10. 2026/11/22 再修訂（聲音先定、畫面後排，取代第 9 條的 `--scene` 補停頓）：新流程不呼叫 `insert-pauses.py`（`--nums`／`--sentence`／`--scene` 全停用，只剩 `--legacy-pauses` 給舊片重跑），也不拉伸（atempo／rubberband）、不剪句內靜音；只允許整段前後裁切與片頭 0.3 秒淡入（首字前補 ±1 LSB 底噪、不是 0）。聲音階段先過 audio-check／停頓密度／聽感驗證，音檔 sha256 記進 `out/<slug>/voice-gate.json`，畫面階段不准改音檔。見 `docs/channels/liguligu-daily-playbook.md`「聲音先定、畫面後排」。

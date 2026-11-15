# caffaine-agent-loop 配音（2026/11/15，Andy：「以後都用呼叫 API 方式生成旁白」）

- 音色 Sulafat，模型 gemini-2.5-flash-preview-tts，languageCode cmn-TW，旁白設定檔 `ai-report-v4`（delivery `report-ai`，說明就是 Andy 在 AI Studio 驗收過的 short-ai 第 4 版那一句，`scripts/voice-profile.mjs` 的 REPORT_AI_LINE）。
- 送出次數：**1 次**（整篇一次生成，HTTP 200，有音訊，沒有重送；`tts-requests.json` 有紀錄：prompt 195 tokens、音訊 830 tokens）。
- 實際送出的提示全文：

```
用台灣人平常講話的口音，不特別捲舌、不兒化，像平常跟人報告一件事那樣，語速比平常再快一點點，語氣跟著內容有起伏，問句上揚、講到答案肯定一點，不拖尾音、不演，直接說：

聊天 A I 答完就停。A I 代理不會停。

聊天 A I，你問它答。代理，你交代，它自己動手。

代理做事，繞一個圈：看、做、檢查。

先看：讀你的檔案，搞清楚狀況。

再做：用工具改檔案、跑指令。

用哪個工具，都要先過權限這一關。

最後檢查結果。不對，就再繞一圈。

每一步都問你，還是放手讓它做？

下一集，講四種權限模式。想要完整步驟，留言代理。
```
（說明那一句之後接各幕念稿，幕與幕之間空一行；念稿來自 script.json 各幕的 `tts`，AI 寫成「A I」。）

- 結果：原始音檔 33.21 秒（`public/audio/caffaine-agent-loop/.take-*.raw.wav`），強制對齊整篇信心 0.898；開口前 0.26 秒、收聲後 0.27 秒。
- 沒有 atempo，沒有壓停頓；換幕停頓 0.43–0.70 秒是錄音本來的。
- 錄音接法：`node scripts/tts-take.mjs caffaine-agent-loop`（有金鑰時才會送出）→ 失敗在對齊時用 `--resplit` 只重切、不再送請求 → `node scripts/align.mjs caffaine-agent-loop --force`。
- 對齊需要 .venv：`python3 -m venv .venv && .venv/bin/pip install -r scripts/fa-requirements.txt`（約 3 分鐘；模型第一次從 huggingface.co 下載）。

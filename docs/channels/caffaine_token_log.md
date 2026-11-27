# CaffAIne（③）：每支影片花費紀錄

格式照②（tw-rotation `docs/marketing/channels/tc/token_log.md`「2026-11-25 起」一節，Andy 11-27：「到下週之前需要紀錄所有產生的影片花費，如消耗 Token、時間、費用等等」「其他頻道也要」）。

量法：
- 時間＝開工到交件（台北時間）。
- 子 agent token＝`python3 scripts/ops/token-by-agent.py <子 agent id…>` 加總（含快取讀取）；換算美元＝session cost_usd ÷ 加權 token。
- 主聊天室分攤＝這支片開工與交件時 get_session 的 cost_usd 差，扣掉子 agent 部分；同時段有別的工作就按工作量拆，備註寫明。
- GitHub Actions 分鐘＝render-chunks.yml 各次執行的計費分鐘加總（11-27 起渲染一律走 Actions）。
- 配音請求次數＝送 Gemini TTS 的整篇請求次數（試聽不花 API，不算）。
- 每支交件當天記一列。

| 影片 | 開工 | 交件 | 花費時間 | 子 agent token | 子 agent 美元 | 主聊天室分攤（美元） | Actions 分鐘 | 渲染次數 | 配音請求 | 審片分數 | 備註 |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 本期無（11-25～11-27） | — | — | — | — | — | — | — | — | — | — | ③照主控排序（②科技→③→①）待命中，11-25 起沒有開新片、沒有渲染、沒有送配音請求；手上的規則檔、對話太長、費曼都是 11-24 前做的，等 Andy 確認 |

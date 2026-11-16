# caffaine-made-by-ai：這支影片的動畫，是我叫 AI 做的（CaffAIne 無聲版，未配旁白）

引擎 `isoVersion: 5`（IsoMeeting.tsx，新增 talk／code／steps／pick 畫面）。念稿與作用見 script.md，查證見 research.md。無聲時間軸約 42.4 秒（含片尾 3.6 秒）。留言關鍵字：動畫。

## 狀態（2026/11/16）
- 已完成：script.json、validate 0 error、tsc、版面檢查（ov-check 每 24 幀，只有片尾動畫幀的上下緣空白被標，與既有片相同）、九格圖。
- 進行中：`npm run render caffaine-made-by-ai`（背景跑，預估 15 分鐘以上）；若 out/caffaine-made-by-ai.mp4 不存在，重跑該指令。
- 下一步：① 每 6 幀跑 `node scripts/caffaine/ov-check.mjs caffaine-made-by-ai 6` ② freezedetect ③ Andy 通過後 API 配旁白（ai-report-v5）④ 發布前把「兩句交代 AI 範本」補完整。
- 已知問題：s02、s06 的交代句是示意；各鏡開頭約 0.5 秒卡片還沒進場；片尾卡上下空白是既有片尾動畫行為。

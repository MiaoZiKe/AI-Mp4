# caffaine-two-answers：同一句話問 AI 兩次，答案為什麼不一樣（CaffAIne 無聲版，未配旁白）

引擎 `isoVersion: 5`（IsoMeeting.tsx，新增 pick「AI 抽字」示意）。念稿見 script.md，查證見 research.md。無聲時間軸約 34.7 秒（含片尾 3.6 秒）。留言關鍵字：兩次。

## 狀態（2026/11/16）
- 已完成：script.json、validate 0 error、tsc、版面檢查（每 24 幀，只有片尾動畫幀被標）、九格圖。
- 進行中：`npm run render caffaine-two-answers`（接在第一支後面背景跑）；若 out/caffaine-two-answers.mp4 不存在，重跑。
- 下一步：每 6 幀 ov-check、freezedetect、Andy 通過後配旁白；s03 pick 示意的候選字長短是舉例，已標示意。
- 已知問題：沒有「還不知道」一鏡（片長取捨，寫在 s06 出處）；s03 旁白 36 字偏長（兩句）；片尾卡上下空白是既有行為。

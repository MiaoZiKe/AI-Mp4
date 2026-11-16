# caffaine-invite-page：一句話做出生日邀請網頁，還能收回覆（CaffAIne 無聲版，未配旁白）

結構一（做出一個東西，Andy 2026/11/17 改題）。引擎 `isoVersion: 6`（IsoVariety.tsx，沒有改引擎）。念稿與畫面由 `scripts/caffaine/make-three-scripts.py` 產生，素材圖由 `scripts/caffaine/make-three-display.py` 產生。留言關鍵字：邀請。

## 狀態（2026/11/17）
- 無聲時間軸：`SILENT_RATE=4.5 SILENT_GAP=0.7 node scripts/ui/silent-timeline.mjs caffaine-invite-page --force`；渲染日誌 `out/render-stock-caffaine-invite-page.log`，成品 `out/caffaine-invite-page.mp4`（媒體不進 git）。
- 驗收：tts-precheck 0 ⚠、validate 0 error、tsc 0、ov-check 每 6 幀內容幀 0 筆（見交件回報）。
- 下一步：獨立審查打分（docs/channels/caffaine-scores.md）→ Andy 通過 → API 配旁白（ai-report-v5，整篇 1 次）。
- 已知：實測用 Gemini 3.5 Flash-Lite（額度原因）；詳見 research.md。

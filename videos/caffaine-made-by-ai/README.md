# caffaine-made-by-ai：這支影片的動畫，是我叫 AI 做的（CaffAIne 無聲版，未配旁白）

引擎 `isoVersion: 5`（IsoMeeting.tsx，新增 talk／code／steps／pick 畫面）。念稿與作用見 script.md，查證見 research.md。無聲時間軸約 58.5 秒（含片尾 3.6 秒）。留言關鍵字：動畫。

## 狀態（2026/11/16 加長版）
- 念稿加長：原句全保留（s03 句首補「接著」避免英文開頭），新增兩鏡：第一版開頭「只丟結果」（playbook 第十三節第 2 點的真實紀錄）、重做成八句（git commit dc481b4）。
- 規則（Andy 2026/11/16，playbook 第八節）：旁白 253 字、無聲版估長 54.9 秒（不含片尾 3.6 秒）、不後製加速、段落停頓 0.7 秒；`tts-precheck` 0 個 ⚠。
- 無聲時間軸：`SILENT_RATE=4.5 SILENT_GAP=0.7 node scripts/ui/silent-timeline.mjs caffaine-made-by-ai --force`（每秒 4.5 字、段落停頓 0.7 秒）。
- 驗收（2026/11/16）：validate 0 error、tsc 0；ov-check 每 6 幀 293 幀，內容幀 0 筆（已修一處卡片字超出框後複查）（只有片尾動畫幀的上下緣空白被標，與既有片相同）；人工抽格看過。
- 舊配音作廢：先前的配音與 timeline 是舊念稿的，念稿加長後要重配（ai-report-v5、整篇 1 次請求），不配就維持無聲版。
- 渲染：背景依序 render 四支無聲版，日誌 `out/render-long-caffaine-made-by-ai.log`，成品 `out/caffaine-made-by-ai.mp4`（媒體不進 git）。
- 下一步：Andy 通過後 API 配旁白；發布前把「兩句交代 AI 範本」補完整。
- 已知問題：s02、s07 的交代句是示意；片尾卡上下空白是既有片尾動畫行為。

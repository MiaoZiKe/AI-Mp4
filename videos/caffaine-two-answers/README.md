# caffaine-two-answers：同一句話問 AI 兩次，答案為什麼不一樣（CaffAIne 無聲版，未配旁白）

引擎 `isoVersion: 5`（IsoMeeting.tsx，新增 pick「AI 抽字」示意）。念稿見 script.md，查證見 research.md。無聲時間軸約 58.7 秒（含片尾 3.6 秒）。留言關鍵字：兩次。

## 狀態（2026/11/16 加長版）
- 念稿加長：原句全保留，新增四鏡：兩次都是同一句（提示詞原文）、對照原文（還沒指派，第二次對、第一次是猜的）、抽籤之外的日常例子（丟骰子，示意）、還不知道（只測一份紀錄、別份未測）。
- 規則（Andy 2026/11/16，playbook 第八節）：旁白 254 字、無聲版估長 55.1 秒（不含片尾 3.6 秒）、不後製加速、段落停頓 0.7 秒；`tts-precheck` 0 個 ⚠。
- 無聲時間軸：`SILENT_RATE=4.5 SILENT_GAP=0.7 node scripts/ui/silent-timeline.mjs caffaine-two-answers --force`（每秒 4.5 字、段落停頓 0.7 秒）。
- 驗收（2026/11/16）：validate 0 error、tsc 0；ov-check 每 6 幀 294 幀，內容幀 0 筆（只有片尾動畫幀的上下緣空白被標，與既有片相同）；人工抽格看過。
- 舊配音作廢：先前的配音與 timeline 是舊念稿的，念稿加長後要重配（ai-report-v5、整篇 1 次請求），不配就維持無聲版。
- 渲染：背景依序 render 四支無聲版，日誌 `out/render-long-caffaine-two-answers.log`，成品 `out/caffaine-two-answers.mp4`（媒體不進 git）。
- 下一步：Andy 通過後 API 配旁白。
- 已知問題：骰子比喻是示意，畫面已標；片尾卡上下空白是既有行為。

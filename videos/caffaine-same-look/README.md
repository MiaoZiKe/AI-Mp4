# caffaine-same-look：為什麼 AI 做的網頁都長一個樣（CaffAIne 無聲版，未配旁白）

支柱②去 AI 味、結構二。引擎 `isoVersion: 5`（IsoMeeting.tsx）。念稿見 script.md，查證見 research.md，實測原文與截圖在 tests/。留言關鍵字：網頁。

## 狀態（2026/11/16 加長版）
- 念稿加長並照 Andy 點名修正：新增兩鏡（只打了一句、沒指定風格；還不知道：只試咖啡店首頁與一個模型）；各鏡開頭 0.3 秒內上方卡片進場（第一個項目 `start+4`；`limit` 加 `early`、`cta` 加 `kwAt`）。
- 規則（Andy 2026/11/16，playbook 第八節）：旁白 254 字、無聲版估長 54.8 秒（不含片尾 3.6 秒）、不後製加速、段落停頓 0.7 秒；`tts-precheck` 0 個 ⚠。
- 無聲時間軸：`SILENT_RATE=4.5 SILENT_GAP=0.7 node scripts/ui/silent-timeline.mjs caffaine-same-look --force`（每秒 4.5 字、段落停頓 0.7 秒）。
- 驗收（2026/11/16）：validate 0 error、tsc 0；ov-check 每 6 幀 293 幀，內容幀 0 筆（只有片尾動畫幀的上下緣空白被標，與既有片相同）；人工抽格看過。
- 渲染：背景依序 render 四支無聲版，日誌 `out/render-long-caffaine-same-look.log`，成品 `out/caffaine-same-look.mp4`（媒體不進 git）。
- 已知問題：只測一個題目、一個模型，原因標「分析推測」；s03 的「深色按鈕」是 Playwright 截圖目視確認（compare.txt 沒量到，已在 research.md 註明）。

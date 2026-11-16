# caffaine-excel-chart：Excel 表格丟給 AI，變成會動的圖表（CaffAIne 無聲版，未配旁白）

策略表 #8（P1）。isoVersion 6（kinetic／chat／browser／lens／split／flow／claim 共 7 種 view）。實測、截圖在 tests/，影片用圖在 public/caffaine-excel-chart/。留言關鍵字：圖表。文案 caption.md。
- 照實講：表格是虛構示意資料；翻車＝空白格被畫成 0；只試兩份小表格、一個模型；模型因額度中途換成 gemini-3-flash-preview。
- 渲染日誌 out/render-stock-caffaine-excel-chart.log。

## 驗收（2026/11/17）
- 念稿 tts-precheck 0 個 ⚠；validate 0 error；tsc 0；片長正片 53.3 秒＋片尾 3.6 秒＝56.9 秒（45–60 秒規定以正片計）；無聲版時間軸 `SILENT_RATE=4.5 SILENT_GAP=0.7 node scripts/ui/silent-timeline.mjs caffaine-excel-chart --force`。
- 重疊檢查：程式每 6 幀（分批 `scripts/caffaine/ov-chunks.sh`，改動後以 `ov-ranges.sh` 重跑受影響幕）內容幀 0 筆（只有片尾動畫幀上下緣空白被標，與既有片相同）；人工抽格每 2 秒一格縮圖（成片 ffmpeg 擷取）全部看過 0 筆重疊。⚠ 不是 0.5 秒全解析度，尚缺。
- 片尾招牌音已疊（片尾段 −14.0 LUFS、峰值約 −2.7 dBFS）。成品 out/caffaine-excel-chart.mp4（不進 git）。
- 獨立驗證打分：待非製作者審查角色填 docs/channels/caffaine-scores.md（本片製作者沒有自填分數）。
- 已知：split／browser 的實測截圖在畫面中偏小；旁白尚未配音，字幕時間為估算。

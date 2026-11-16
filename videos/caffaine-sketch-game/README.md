# caffaine-sketch-game：手繪草圖拍一張，AI 變成能玩的小遊戲（CaffAIne 無聲版，未配旁白）

支柱①、結構一。引擎 `isoVersion: 5`（IsoMeeting.tsx，新增 `shot` 實測截圖畫面：1–3 張手機截圖＋圖說＋蓋章；2026/11/16 新增 `size: "big"` 放大版與 `zoom`／`note` 側欄）。念稿 script.md，查證 research.md，實測與截圖在 tests/，影片用圖在 public/caffaine-sketch-game/。留言關鍵字：遊戲。

## 狀態（2026/11/16 加長版）
- 念稿加長並照 Andy 點名修正：① 遊戲截圖放大成主畫面（shot `size: big`，354×630）；② 翻車鏡出現「星星疊字」真實截圖（bug.png）並在右側放大圈出（bug-zoom.png，由 tests/make-display.py 切出放大）；③ 鉤子照實講「程式畫的手繪風草圖」；④ 各鏡開頭 0.3 秒內上方卡片進場；新增兩鏡：手機大小也試了（tests/phone.py 截圖）、還不知道（只試一張草圖、一個模型）。
- 規則（Andy 2026/11/16，playbook 第八節）：旁白 254 字、無聲版估長 53.3 秒（不含片尾 3.6 秒）、不後製加速、段落停頓 0.7 秒；`tts-precheck` 0 個 ⚠。
- 無聲時間軸：`SILENT_RATE=4.5 SILENT_GAP=0.7 node scripts/ui/silent-timeline.mjs caffaine-sketch-game --force`（每秒 4.5 字、段落停頓 0.7 秒）。
- 驗收（2026/11/16）：validate 0 error、tsc 0；ov-check 每 6 幀 285 幀，內容幀 0 筆（只有片尾動畫幀的上下緣空白被標，與既有片相同）；人工抽格看過。
- 渲染：背景依序 render 四支無聲版，日誌 `out/render-long-caffaine-sketch-game.log`，成品 `out/caffaine-sketch-game.mp4`（媒體不進 git）。
- 已知問題：草圖由程式畫、非人手畫（片中已講明）；放大圖是原圖 540 像素寬放大，略軟。

## 2026/11/16 畫面多樣化（isoVersion 6）
引擎 `src/components/ai-iso/IsoVariety.tsx`：每幕 `props.view`（split／chat／browser／device／lens／kinetic／flow／claim）＋`props.tone`（色票 THEME_ISO.tones），換幕圓形擦開；念稿未動（僅 s03 的 cue id start 改 strt，避免和「幕開頭」撞名）。規劃：docs/channels/caffaine-visual-plan-1116.md。重疊檢查：程式 285 幀，內容幀 0 筆（只剩片尾動畫幀上下緣空白）。

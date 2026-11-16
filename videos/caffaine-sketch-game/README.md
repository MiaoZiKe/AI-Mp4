# caffaine-sketch-game：手繪草圖拍一張，AI 變成能玩的小遊戲（CaffAIne 無聲版，未配旁白）

支柱①、結構一。引擎 `isoVersion: 5`（IsoMeeting.tsx，新增 `shot` 實測截圖畫面：1–3 張手機截圖＋圖說＋蓋章）。念稿 script.md，查證 research.md，實測與截圖在 tests/，影片用圖在 public/caffaine-sketch-game/。留言關鍵字：遊戲。

## 狀態（2026/11/16）
- 已完成：實測、script.json、validate 0 error。
- 進行中／下一步：見下方最後一行狀態。
- 已知問題：草圖由程式畫、非人手畫（片中已講明）。
- 2026/11/16 16:40 台北：tsc 0、ov-check 每 12 幀 106 幀 0 筆（只有片尾動畫幀被標；新增 shot 畫面已修標籤與截圖重疊，單獨抽 9 幀 0 筆）、九格圖看過。尚未 render。片尾招牌音配音版才疊。

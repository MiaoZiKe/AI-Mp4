# caffaine-same-look：為什麼 AI 做的網頁都長一個樣（CaffAIne 無聲版，未配旁白）

支柱②去 AI 味、結構二。引擎 `isoVersion: 5`（IsoMeeting.tsx）。念稿見 script.md，查證見 research.md，實測原文與截圖在 tests/。留言關鍵字：網頁。

## 狀態（2026/11/16）
- 已完成：實測 3 次、script.json、validate 0 error。
- 進行中／下一步：見下方最後一行狀態（tsc、ov-check、九格圖、render 結果）。
- 已知問題：片長估 47 秒（含片尾 3.6）；s03 的「深色按鈕」是 Playwright 截圖目視確認（compare.txt 的按鈕欄位沒量到，已在 research.md 註明）。
- 2026/11/16 16:40 台北：tsc 0、ov-check 每 6 幀 209 幀 0 筆（只有片尾動畫幀 f1141 之後被標空白）、九格圖看過。尚未 render（無聲版未渲染；Andy 通過後配旁白再 render）。片尾招牌音配音版才疊（playbook 第八節）。

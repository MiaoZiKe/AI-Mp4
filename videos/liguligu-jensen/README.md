# liguligu-jensen — 33 年的執行長即刻辭職，公告為什麼沒寫原因？

更新：台灣時間 2026/11/14 20:50。哩股哩股頻道「追問式」第一支（規則：`docs/channels/liguligu.md`）。`styleVersion: 3`、`skin: newsprint`。**目前是無聲版**。

| 項目 | 內容 |
|---|---|
| 影片 | `out/liguligu-jensen.mp4`（1080×1920、30fps、H.264，772 幀＝25.7 秒，音軌是靜音） |
| 九格圖 | `out/liguligu-jensen-review.png`；每鏡總覽 `out/liguligu-jensen-overview.png`；封面 `out/liguligu-jensen-cover.png` |
| 字幕 | `out/liguligu-jensen.srt`（中英）、`.zh.srt`、`.en.srt` |
| 旁白 | 110 字、7 鏡；音色未定（`docs/prompts/liguligu-男聲試聽.txt`） |

## 檢查結果

- `npm run validate`：1 error、10 warning。error 是「最後一幕必須是 EndCard」——短片沒有片尾卡，和 liguligu-cpi 一樣照實留著，沒有為了過關硬加；warning 是總長（短片）、同屏元素數（把鏡頭外的也算進去）、兩處畫面字超過 10 字（都是日期）。
- `npm run still`：覆蓋率佔用率最低 79%、中位 89%，最長空白帶 0px。
- `npm run render`：ffprobe 幀數 772＝時間軸。
- `npx tsc --noEmit`：通過。
- 沒有跑 audit／selfcheck，也沒有獨立評審的分數（九格圖只有畫面）。

## 已知問題

1. 原文都沒有逐字讀過（`www.sec.gov`、`techcrunch.com`、`www.pbs.org` 等在這個環境打不開）。s04 依賴《華盛頓郵報》的二手轉述，s03 依賴 8-K 與 CNBC 的摘要，上片前要有人讀原文。
2. 事件還在進行，上片當天要重查（清單在 `research.md` 第 7 節），並把畫面上的日期改掉。
3. 長度是估算：每秒 4.75 字時 25.7 秒，比 20–25 秒的目標多不到 1 秒；實際長度要等配音。超過的話先刪字（例如 s07 的「下集看」改短），不硬加速。
4. s04 大字出現後約 1.3 秒才有下一樣東西；s06、s07 開頭約 1 秒畫面偏空。
5. 鏡頭往下移的兩次（s02→s03、s04→s05），上一幕的紙片會短暫從頁首後面經過。
6. 沒有背景音樂與音效（配音後一起做）。
7. 照片授權與作者未核對（`assets.md`）。

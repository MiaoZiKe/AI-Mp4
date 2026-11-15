# liguligu-nvda-kress — 一個簽名、三個頭銜：輝達財報換人交

哩股哩股第一週週一（預定 2026/11/16 發布）。照 `docs/channels/liguligu-daily-playbook.md` 與範本 `videos/liguligu-jensen-pro/` 做：`styleVersion: 3`、`stage: "dossier"`＋`news`。

| 項目 | 現況（2026/11/15 15:35 台北） |
|---|---|
| 狀態 | **無聲預覽**，等使用者上傳旁白 wav |
| 無聲預覽 | `out/liguligu-nvda-kress.mp4`（估算時間軸 23.9 秒、716 幀；每秒 5.2 音節、幕間 0.12 秒） |
| 九格圖 | `out/liguligu-nvda-kress-review.png`；每鏡總覽 `out/liguligu-nvda-kress-overview.png` |
| 念稿 | `script.md`（7 句、約 120 字） |
| 查證 | `research.md`（官方原文 6 份逐字讀過；金融時報那則只看到轉述） |

## 每鏡

| 鏡 | 欄目 | 旁白 | 畫面 | 狀態 |
|---|---|---|---|---|
| s01 | 事件 | 一個簽名，三個頭銜。簽字的是同一個人。 | 「1 個簽名／三個頭銜」大字；8-K 簽名欄摹本，紅框裡打出「同一人・三個頭銜」 | 已確定 |
| s02 | 發生了什麼 | 她是財務長，暫代執行長，5 天後就要交財報。 | 時間軸 11/12→11/17「只隔 5 天」；公告摹本「財務長／兼執行長」；右卡「照常 原訂日期」 | 已確定 |
| s03 | 兩種說法 | 金融時報說已接觸人選，公司說還沒正式接洽。 | 左「公司說法：未接洽」、右「金融時報 11/13：已接觸人選」、中間紅問號 | 公司說法／公司未證實 |
| s04 | 對照 | 這季財測 1080 億美元，是他還在任時給的。 | 「成績單換人交」；第二季財報 8/26 報頭、「1080 億美元 ±2%」 | 已確定 |
| s05 | 查證 | 但暫代，不等於接班，人選還在找。 | 「暫代 ≠ 接班」；現在暫代—已確定、正式接班—尚未確定 | 已確定／尚未確定 |
| s06 | 還不知道 | 調查還沒結論，正式人選也還沒定。 | 資料夾照片＋「正式執行長（未定）」紅框 | 截至 2026/11/15 尚未確定 |
| s07 | 提問 | 她是過渡，還是接班？下集看財報數字。 | 大標＋留言＋下一集「財報數字說了什麼？」 | — |

## 改到的共用程式

`src/components/dossier/DossierVideo.tsx`（向下相容，舊片不受影響）：
- versus 左欄可用 `bigPx` 指定大字字級（「未接洽」三個字放不下 160px）。
- hook 的文件摹本可用 `doc.fill`／`fillPx`／`fillAt` 在紅框欄位打字（沒有 `fill` 時照舊是閃動游標）。這支用它，避免空白簽名欄被看成「沒有簽名」。

## 接旁白之後

    cp <上傳的 wav> public/audio/liguligu-nvda-kress/take1.wav
    node scripts/dossier/recording-timeline.mjs liguligu-nvda-kress audio/liguligu-nvda-kress/take1.wav 7
    npm run validate liguligu-nvda-kress && node scripts/dossier/events.mjs liguligu-nvda-kress
    flock /tmp/aimp4-render.lock npm run render liguligu-nvda-kress
    # 合音：−16 LUFS、真峰值 ≤ −1.5 dBTP（指令見 videos/liguligu-jensen-pro/voice.md）

## 檢查結果（無聲版）

- `npm run validate`：1 error（短片沒有片尾卡，已知狀況）、1 warning（總長）。
- `node scripts/dossier/events.mjs`：前 3 秒 11 個事件；每鏡最大間隔 0.70–1.23 秒（s04 最長）。
- `npm run still`：佔用率最低 61%、中位 73%，最長空白帶 102px。
- `npx tsc --noEmit` 通過；ffprobe 1080×1920、30fps、716 幀。

## 已知問題

1. 金融時報報導與輝達回應只看到轉述（ft.com、benzinga 在這個環境被擋），上片前要有人讀原文。
2. 照片授權與作者未核對。
3. s04 事件間隔 1.23 秒是全片最長；s05 只有 2.6 秒，接上真錄音後要看「尚未確定」停得夠不夠久（不夠就加 `cutDelayF`）。
4. 下一集題目＝11/17 財報數字（已確定會公布），不預告內容。

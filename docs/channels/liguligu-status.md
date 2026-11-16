# 哩股哩股：進度與決定（給子 agent 讀；2026/11/16 15:25 台北）

工作方式（使用者 11/16「照做」省 Token）：主工作階段只當指揮；寫稿、渲染、抽格、改字重渲染都派一次性子 agent（預設 sonnet；審片、看圖判斷、念稿邏輯審查才用 opus），回報 ≤10 行。改字先收齊再渲染一次。截圖拼成一張看。進度寫這個檔，不靠聊天紀錄。

## Token 預算（使用者 11/16，規則全文 tw-rotation docs/marketing/channels/token_budget.md）
- 這個工作階段每天上限 0.6 億 token；用到 80% 後當天只做已排程要發的和維修，新企劃、重做延到隔天。品質不降。
- 子 agent 不長時間等渲染或 TTS：超過 5 分鐘就先結束、把狀態寫進本檔「進行中」，完成後再派新的子 agent 接手（渲染／TTS 用背景指令跑，輸出寫到 out/<slug>/run.log）。
- 每天 15:17 跑統計腳本：不建排程，由網站主控傳訊息來，收到再跑。

## 固定設定
- 畫面：`stage: "dossier"`＋`news.layout: "fill"`、`news.mark: "LIGULIGU"`；片尾卡固定版（`DOSSIER_END`，3.6 秒）；招牌音 `python3 scripts/dossier/sfx-logo-ligu.py out.wav`；混音 `bash scripts/dossier/mix-final.sh <旁白|none> <sting> <片尾開始秒> <總長秒> <out.wav>`（G=4.9）。
- 旁白：API，Gemini TTS，音色 **Charon**，模型 gemini-3.8-flash-tts（失敗才 2.5）；說明句＝`docs/prompts/liguligu-男聲試聽-短說明.txt` 那一句；Node 送請求要 `NODE_USE_ENV_PROXY=1 NODE_EXTRA_CA_CERTS=/root/.ccr/ca-bundle.crt`；免費額度每模型每天 10 次、每分鐘 3 次（和其他頻道共用，約台北 16:00 重置）。
- 交件：Artifact 頁（成片 1080×1920、網站用版本 ≤20MiB＋cover.jpg、只有旁白的音檔、主旨＋八條自檢），網址回主控 session_018gakVR9LpeawrULpFdnTw4。

## 進行中（11/16）
| 片 | 狀態 | 下一步 |
|---|---|---|
| liguligu-nvda-kress | 新稿無聲版已給 Andy（Artifact CygwGtvfEKSUC4smMQRdMx v4） | 16:10 後 Charon 整篇配音 1 次 → recording-timeline → render → mix-final → 驗證 → 交件 |
| liguligu-power-bill | 同上；第 3 鏡標籤「官方原則（監察報告轉述）」 | 同上；真錄音若讓片長 >30 秒，回報主控請 Andy 決定砍句 |
| liguligu-jensen-pro | 網站用版本與 cover 已備（out/web/liguligu-jensen-pro/），文章 JSON 在 Artifact 9jqsf4gBgTZRuZSM7eT45R | 主控放網站 |
| 文章 JSON | jensen、power-bill 已交（power-bill 念稿是舊版） | 配音後更新 power-bill、補 nvda-kress 新稿版 |
| 11/17 題目 | 財長對聯準會喊話：原文讀不到（CNBC 擋），暫定 | 11/17 09:00 子 agent 重查；找不到原文就換備選 |

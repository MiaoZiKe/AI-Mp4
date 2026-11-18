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
| liguligu-nvda-kress | **11/16 停頓檢查：段落 ≥0.70、句間 ≥0.32 秒，已達標，沒插靜音、成片不變**；有聲完整版已做（25.4 秒，Charon／gemini-3.8-flash-tts，API 1 次請求）；網站用版本在 out/web/liguligu-nvda-kress/（mp4、cover.jpg、voice.mp3，2.5MB）；文章 JSON 念稿已更新為現行 5 句 | 主控放網站；人耳確認口音（捲舌指標差距 4.3 kHz 偏高）與語速 |
| liguligu-power-bill | **第 4 版（11/17 砍字重配）：139→128 字、API 共第 3 次請求（本次 1 次）、含停頓語速 4.82→4.21 字/秒、段落／句間最小 1.00／0.45 秒、落定最短 1.5 秒、35.5 秒（<45 秒：只有 7 個事實，不灌水）、片尾 −11.7 LUFS／−1.2 dBTP、捲舌 3.5 kHz、結尾拿掉下一集預告；網站版 3.11MB**；以下為第 3 版：（11/16 17:30 台北）：段落間插靜音（insert-pauses.py，共加 1.48 秒，沒重配）→ 28.9 秒，片尾卡 25.3 秒起；網站版 out/web/ 已重出（4.8MB）；最小段落／句間 0.70／0.30 秒**；以下為第 2 版紀錄：有聲完整版第 2 版已做（11/16 重配：第 1 句改「現在 AI 資料中心…」，原「A I」被念成「欸」；27.4 秒，片尾卡 23.8 秒起；Charon／gemini-3.8-flash-tts，重配 API 1 次請求，共 2 次）；網站用版本在 out/web/liguligu-power-bill/（mp4、cover.jpg、voice.mp3，4.8MB）；文章 JSON 念稿已同步；念稿全文與對齊在 voice.md | 主控放網站；**請人耳聽前 5 秒**確認「現在 AI」兩個字母都有念（對齊只量到 AI 約 0.18 秒）；口音（捲舌指標差距 3.3 kHz）與語速（4.9 音節/秒）|
| liguligu-jensen-pro | 網站用版本與 cover 已備（out/web/liguligu-jensen-pro/），文章 JSON 在 Artifact 9jqsf4gBgTZRuZSM7eT45R | 主控放網站 |
| 文章 JSON | jensen、power-bill、nvda-kress 念稿都是現行版 | — |
| **liguligu-2008-check（Andy 11/16 17:50 交辦，要做成影片）** | 題材與查證素材已備：`videos/liguligu-2008-check/research.md`（日本 7–9 月 GDP 年率 ▲0.1%、11/5 全球股市大跌、像不像 2008、2027 機構預測） | 照標準流程做：先補讀標「待讀原文」的來源 → 規劃主旨＋念稿 → 交主控給 Andy 看；排在 11/17 題目之後或依主控安排 |
| **liguligu-2008-check（有聲版 11/16 晚）** | Andy 說「可以配旁白」→ 已配：Charon／gemini-3.8-flash-tts，API 1 次；成片 51.9 秒，片尾 −11.5 LUFS／真峰值 −1.1 dBTP，語速 4.9，捲舌指標差距 3.5 kHz，對齊信心 0.80（最低 s04 0.70）；第 1 鏡大字改「−0.1%」；網站版 out/web/liguligu-2008-check/（4.9MB）；仍沒有「已確定」，德銀、內閣府原文未讀；前 5 秒聽寫失敗（503／逾時），只有對齊結果 | 交件頁（scratchpad ligu-2008）；**請 Andy 聽前 5 秒、口音、s03→s04 停頓（剪過）**；上片前重查並改「查證截至」；**網站版 11/16 晚（Andy：「可以放上網站」）**：文章 JSON 已做，`videos/liguligu-2008-check/site-article.json`（目標 `site/articles/ligu/2026-11-17-ligu-2008-check.json`；影片 4.6 MiB、封面放 `site/media/ligu/20261117v_2008_check/`），待 Andy 放進網站並發布 |
| 11/17 題目 | 財長對聯準會喊話：原文讀不到（CNBC 擋），暫定 | 11/17 09:00 子 agent 重查；找不到原文就換備選 |

## 11/16 決定
- nvda-kress、power-bill 照現在版本定案（nvda-kress 口音 OK，捲舌指標 4.3 kHz 當基準）；加照片取消、不重渲。
- 下一支起加「相關公司」卡（規則在 liguligu-daily-playbook.md 第三節、liguligu.md 第 3 節第 10 條）。

## liguligu-2008-check 待改清單（已完成 11/16 晚）
- [完成] 第 1 鏡大字改「−0.1%」（U+2212，字級不變；字型子集已重跑）。
- 設備投資、德銀各 1 源：主控決定保留，標法照現在（「路透報導」「分析推測（只看摘要）」）。
- 照片：Pexels 不要求標攝影者，交件紀錄寫原圖編號（159888、357514）即可。

## liguligu-2008-check 版面修正（11/17 03:50 台北，不重配音）
- s06 右欄大字加 `bigPx: 84`（DossierVideo.tsx Versus 右欄新增選填欄位，預設 112，其他片不受影響）、出處縮成「11/3 研究報告（摘要）」；s05 標籤改「ABC、CNN 報導」不再壓字；s04 引言改「像 2007 到」。
- overlap-check error 0／warn 0；片長 51.86 秒（上一版 51.90）；片尾 −11.4 LUFS／真峰值 −1.1 dBTP；網站版 6.5 MB（舊檔備份 out/liguligu-2008-check.prev.mp4）；未發布，等主控換檔。

## liguligu-dotcom-ai（歷史對照系列第 1 支：2000 網路泡沫 vs 現在 AI；11/17）
- 第 3 版有聲完成（最後一輪改版，不再改）：62.1 秒、9 幕（含片尾卡）、旁白 251 字；Charon、gemini-3.8-flash-tts，TTS 2 次請求（第 1 次失敗、等 120 秒重試成功）；語速說話區間 5.0 音節/秒（含停頓 4.3）、捲舌指標 4.07 kHz（基準 4.3）、對齊信心最低 s01 0.69；overlap 0 error／0 warn；片尾 −11.3 LUFS／−1.2 dBTP；網站版 3.5 MiB；make 總耗時 467 秒（含 TTS 324 秒）。
- 官方原文全未讀（WebFetch 擋 nasdaq.com 等），沒有任何一句標為確定；尚未發布，等 Andy 聽過。事件間隔 >1.2 秒的鏡仍有 7 鏡（warn，不擋）。
- 第 4 版（11/17）：依使用者新規則（歷史題目要跟平常主題真的有關才做，不先預告下一集）刪「下一集，日本泡沫。」；剪原錄音靜音 2.32 秒、沒送 TTS；59.7 秒、片尾 −11.3 LUFS／−1.1 dBTP、overlap 0 error；s08 下方卡改「想看更多／完整對照」，片尾卡不顯示下一集。

## 11/17 用量檢查
- 11/16 07:19Z–11/17 07:19Z 合計約 1.28 億（主 0.56、子 0.72），超過日上限 0.6 億 → 11/17 剩餘時間只做已排程與維修，新企劃、重做延到隔天。
- 已知缺口：mix-auto 在 dotcom-ai 只收斂到 −12.2 LUFS（手動 G=4.4 補救），下次動工前修。

## 11/17 語速自查（Andy：「語速太快，根本沒有時間停頓」）
- liguligu-power-bill：沒有 atempo；錄音本身含停頓 5.52 字／秒。用 `insert-pauses.py --scene-map／--nums` 補停頓（段落最小 0.67→0.77、句間 0.27→0.37 秒，重點數字前後 0.35）、cutDelayF 補畫面落定（最短 0.0→1.5 秒），含停頓降到 4.82 字／秒，**仍 >4.3，需砍約 15 字重配（未送 TTS，等同意）**；34.03 秒、片尾 −11.7 LUFS／−1.3 dBTP；網站版 3.12 MiB。`make.mjs` 新增 `--keep-timeline`。細節在該片 voice.md。
- liguligu-dotcom-ai：沒有 atempo；含停頓 4.36→4.18 字／秒（≤4.3 達標）、段落最小 0.84→0.89、句間最小 0.35→0.38、重點數字前補 0.35 秒、落定到出場最短 0.43→1.53 秒；片長 59.83→63.38 秒；片尾 −11.7 LUFS／−1.3 dBTP；網站版 3.53 MiB；不用砍字重配（沒送 TTS）。
- mix-auto 缺口更新：dotcom-ai、power-bill 這次都一次收斂（−11.7 LUFS，在 ±0.3 內），先前只到 −12.2 的原因沒再重現；若再出現仍手動調 G。

## 11/18 停工
- 使用者 11/18：Token 快到上限，正在做的做完，其餘延到 11/21（五）之後。power-bill（11/19）、dotcom-ai（11/20）已交件不動；新片／企劃／備用／重做／工具建置一律暫停；只有主控轉排程發文失敗要修檔時才動；子 agent 一律 sonnet。
- 待辦（11/21 後）：mix-auto 收斂問題追蹤、overlap 範本字數上限擴到所有鏡型、事件間隔自動補事件。

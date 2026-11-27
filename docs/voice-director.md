# 配音導演流程（科技透明圈，2026-11-27 起）

目的：讓程式配出的旁白穩定接近 Andy 的基準＝**兩奈米**（`tw-rotation/social/tc/queue/20261115_2nm/tech-2nm.mp4`；Andy 在 AI Studio 用 Iapetus、Style 欄放說明 B、文字框只放念稿錄的；f0 131.1、IQR 63.5、含停頓 4.71 字/秒、純說話 5.46）。
背景：`docs/prompts/tech-旁白金手指.md`（最上方鎖定表）、`docs/voice-consistency-1127.md`（每次不同的原因）、`docs/channels/tech-andy-fixes.md` 第 21～31 條。

Andy 的硬規矩（11-27）：語氣要像兩奈米「很有信心在介紹」；**不准移調**；**不合格的不准給他聽**；說明句要改先問他。

## 工具

```
bash scripts/three/voice-candidates.sh <slug> <upto幕> <N> [--line=current|2nm] [--mode=prefix|parts] [--seed=N|--seeds=a,b] [--temp=0.5] [--max-req=4] [--send] [--import=a.json,b.json] [--top=2] [--andy=<wav>] [--target=2nm|andy]
```

- 不加 `--send`＝**不送請求**：只印計畫與說明句全文，把這支已有的候選（加上 `--import` 的別處試聽）重新評分。
- 加 `--send`：送 min(N, --max-req) 次試聽請求（一次一份，走 `flock out/.tts.lock`、`TTS_NO_RETRY=1`，失敗就停、不重試）。送之前先印 `tts-budget.py` 的已用次數。
- 說明句：`current`＝現行 `TECH_B_LINE`（11-27 Andy 定案的 confident-3：聲音明亮、有精神、講得很有把握、語速偏快、節奏緊湊；程式直接讀 voice-profile.mjs）；`2nm`＝兩奈米原句說明 B（只留作對照）。confident-1／2 作廢不提供。
- 送法：`prefix`＝說明句＋換行＋念稿一段（＝正式整篇配音 tts-take 的 tech-b 送法）；`parts`＝說明句和念稿分成兩個 part（較像 AI Studio 的 Style 欄）。都不送 languageCode（比照 AI Studio）。
- 輸出：`out/voice-cand/<slug>/report.md`（排名表）、`report.json`、`wav/<候選>.wav`、**合格的**前 2 名 `第1名-<候選>.m4a`、`第2名-<候選>.m4a`。候選名＝`說明句-送法-s<seed>-t<temperature>-<月日時分>-<序號>`。
- 評分程式：`scripts/three/voice-cand-score.py`（只量本機檔）。

### 五個數字（和兩奈米同一套量法）
| 項目 | 量法 | 目標 | 容忍 | 權重 |
|---|---|---|---|---|
| f0 中位數 | `voice-measure.py` | 131.1 Hz | 5 | 30 |
| f0 IQR（起伏） | 同上 | 63.5 | 10 | 25 |
| 含停頓字/秒 | 中文字數 ÷（第一個字起音→最後一個字結束），字的位置用 `fa.py` 對齊 | 4.71 | 0.4 | 20 |
| 純說話字/秒 | 中文字數 ÷ 各幕（念稿空一行＝一幕）自己首字到末字的長度加總 | 5.46 | 0.5 | 15 |
| 捲舌 gapHz | `voice-retro.py` 同法（ㄗㄘㄙ − ㄓㄔㄕ 擦音重心） | 兩奈米成片音軌實測值 | 1500 | 10 |

每項得分＝權重×max(0, 1−|差|/容忍)，滿分 100。權重改 `voice-cand-score.py` 檔頭。
關卡（不過就不轉 m4a、不給 Andy 聽）：f0 126–136、IQR ≥55、含停頓 ≥4.4 字/秒（太慢直接淘汰）、對齊信心 ≥0.5（低於代表可能念錯）。
注意：試聽只有前幾幕，句子比整篇少，語速和整篇會有一點差；數字是「比較用」，最後仍由 Andy 人耳挑。

## 流程（每支片）

1. **候選**：`voice-candidates.sh <slug> s3 4 --send`（前 3 幕、4 份，設定照下方實驗定案的那組）。
2. **篩選**：程式自動過關卡、排序；只拿合格的前 2 名。沒有合格的 → 再抽（當天總請求要留整篇配音的份），不准拿不合格的給 Andy。
3. **Andy 挑一次**：傳 `第1名`、`第2名` 兩個 m4a，附 report.md 那兩列的數字（f0／IQR／含停頓字/秒 vs 兩奈米）。
4. **鎖定**：Andy 選中的那份的設定（說明句、送法、seed、temperature）與五個數字，寫進 `videos/<slug>/voice.md` 當這支的基準；script.json 的 `voice` 照它設（`styleText`／`styleMode`），seed／temperature 記在 voice.md。
5. **整篇配音用同參數**：`TTS_SEED=<同一個> TTS_TEMPERATURE=<同一個> bash scripts/three/tts-pitch-take.sh <slug>`（會帶 `--force`；tts-take 的快取雜湊不含 seed／temperature，所以一定要 force）。配完量五個數字，和第 4 步的鎖定值比：f0 差 >5 Hz 或 IQR <55 就重配（tts-pitch-take 最多 3 次），不移調。
6. 交件附「音高中位數、IQR、含停頓字/秒 vs 兩奈米」三個數字（鎖定表要求）。

## 16:00（台北，額度重置）實驗計畫：總請求 ≤6（留額度給正式配音）

說明句已定案（11-27 Andy：confident-3 就是金手指，已寫進 `TECH_B_LINE`、金手指鎖定表、tech-andy-fixes 第 31 條），**不再比說明句**；這輪只測「穩定度與送法」。confident-1／2 作廢（Andy：「比原本聲音更低，語速更慢」），`2nm` 原句只留作對照、不送。
念稿固定用 `tech-twequip` 前 3 幕（`s3`，106 字）。三組都累積在 `out/voice-cand/tech-twequip/`，排名表一起排。

| 順序 | 組 | 指令 | 請求 | 要回答的問題 |
|---|---|---|---|---|
| 1 | confident-3 prefix ×3（不設 seed） | `bash scripts/three/voice-candidates.sh tech-twequip s3 3 --send` | 3 | 正式送法下隨機落差多大（三份 f0／IQR／含停頓字/秒的最大差）；幾份能過關卡 |
| 2 | prefix＋固定 TTS_SEED ×2 | `bash scripts/three/voice-candidates.sh tech-twequip s3 2 --seed=20261127 --send` | 2 | 同 seed 同稿兩次是否幾乎一樣：f0 差 <2 Hz、IQR 差 <3、秒數差 <0.3 秒＝seed 有效，之後鎖 seed（Andy 挑中的那份的 seed 直接用在整篇）；差得和第 1 組一樣大＝seed 沒用，只能靠多抽＋篩選 |
| 3 | confident-3 parts ×1 | `bash scripts/three/voice-candidates.sh tech-twequip s3 1 --mode=parts --send` | 1 | 拆 part（較像 AI Studio Style 欄）有沒有比 prefix 更接近兩奈米；11-27 前一輪 parts 音高偏高，要看是否仍偏高 |

合計 6 次。temperature（0.5 vs 預設）這輪不做；若第 2 組顯示 seed 沒用，下一輪額度再做 `--temp=0.5 ×2`，看差距是否縮小、IQR 會不會掉到 55 以下（溫度低可能變平板）。
評分照舊：f0 126–136、IQR ≥55、**含停頓 ≥4.4 字/秒**（太慢直接淘汰）、對齊信心 ≥0.5；只把合格前 2 名（`第1名`、`第2名` m4a）給 Andy。

**Andy 傳他在網站（AI Studio）配的那份時**：念稿要和這支前 3 幕相同，跑
`bash scripts/three/voice-candidates.sh tech-twequip s3 0 --andy=<他的檔.wav|m4a>`（不送請求，列成「Andy網站配」基準一起量）；
要改用它當新的對照基準，加 `--target=andy`（五個目標數字全改用它的實測值；關卡數字不變）。結論寫回本檔「實驗結果」。

## 2026-11-27 用現有本機檔驗證評分程式（沒送請求）

`bash scripts/three/voice-candidates.sh tech-twequip s3 2 --import=out/voice-audition-lock/audition.json,out/voice-audition-twequip/audition.json`
結果見 `out/voice-cand/tech-twequip/report.md`（排名摘要寫在下方）。

評分程式驗證：兩奈米成片音軌用同一套量法量到 f0 131.1、IQR 64.3、含停頓 4.72 字/秒，和鎖定值（131.1／63.5／4.71）對得上，自評 97.5 分；純說話用 fa 首字→末字量是 5.74（鎖定表 5.46 是 timeline 人聲區間算的），所以純說話與捲舌的目標改用兩奈米同量法實測（5.74、gap 4725）。

| 名次 | 候選 | 說明句／送法 | f0 | IQR | 含停頓 | 純說話 | 分數 | 結果 |
|---|---|---|---|---|---|---|---|---|
| 1 | lock/pt4 | 兩奈米說明B／parts | 130.4 | 45.5 | 4.11 | 4.39 | 32.3 | ✖ 太平板、太慢 |
| 2 | twequip/s6 | 沉穩專業／prefix（Andy 說 OK 那份） | 127.0 | 62.6 | 3.62 | 3.88 | 29.6 | ✖ 太慢 |
| 3 | lock/st-parts | 說明B／parts | 145.5 | 63.6 | 3.49 | 3.75 | 24.7 | ✖ 音高太高、太慢 |
| 4 | lock/lock3 | 說明B／prefix | 148.1 | 64.6 | 4.09 | 4.36 | 22.3 | ✖ 音高太高、太慢 |
| 5 | lock/lock2 | 說明B／prefix | 126.3 | 68.4 | 3.80 | 4.20 | 14.8 | ✖ 太慢 |
| 6 | lock/pt2 | 說明B／parts | 137.9 | 54.7 | 3.29 | 3.66 | 13.0 | ✖ 三項都不過 |
| 7 | twequip/t1 | 溫和親切／prefix（Andy：像 GAY） | 126.3 | 45.8 | 3.48 | 4.19 | 7.3 | ✖ 太平板、太慢 |
| 8 | lock/pt3 | 說明B／parts | 136.8 | 53.8 | 3.62 | 3.97 | 3.8 | ✖ 三項都不過 |
| 9 | lock/lock1 | 說明B／prefix | 115.4 | 46.9 | 3.74 | 4.13 | 0.0 | ✖ 三項都不過 |

合格 0／9，不輸出 m4a。看得出來的事：
1. **語速是最大的落差**：現有 9 份原始錄音含停頓 3.29–4.11 字/秒，全部比兩奈米（4.72）慢 13～30%，沒有一份過 4.4；兩奈米是 Andy 在 AI Studio 錄、沒加速的。confident-3 寫了「語速偏快、節奏緊湊」，16:00 要看它能不能把原始錄音拉到 4.4 以上。
2. **同一句說明、同一種送法，音高照樣跳**：說明 B＋prefix 三次是 115／126／148 Hz，＋parts 四次是 130／137／138／146 Hz（四次裡有三次高於 136）——隨機落差比說明句的影響大，所以要靠「多抽＋篩選」或確認 seed 有沒有用。
3. parts 送法這 4 份音高平均比 prefix 高，和 11-27 的觀察一致；16:00 只排 1 份 parts 看 confident-3 是否仍偏高。

# 哩股哩股「開頭聲音斷斷續續」根因報告（2026/11/21）

Andy 11/21：「全部影片 前面聲音斷斷續續 需要避免後續發生 請先找原因 再把方法寫近規則」。
範圍：liguligu-jensen-pro、nvda-kress、2008-check、power-bill、dotcom-ai、hike2022。已發的片不重做、不重渲染、沒有送 TTS。
量法：ffmpeg 解成 48 kHz 浮點，5ms／10ms 短時 RMS（dBFS）；「0 值段」＝連續樣本兩聲道都等於 0。量測腳本最後收成 `scripts/dossier/audio-check.py`。

## 結論

1. **斷斷續續的主因在 `insert-pauses.py`**：補停頓插的是 `np.zeros`（純數位靜音），接縫只有 5ms 淡出／淡入；更糟的是 `--nums`（數字前後補停頓，11/17 加）與對齊間隔 0.00 的句界，兩字之間根本沒有氣口，舊版切點照切，**等於在字中間切斷、塞 0.3–0.45 秒死寂再硬接回來**（切點兩側 −20～−39 dBFS）。片頭幾秒正好是鉤子幕、數字最密，所以「前面」最明顯：hike2022 0.44 秒（s01 數字後「二零二二」｜年）、dotcom-ai 2.69 秒、power-bill 3.74 秒（s01 數字前「十一倍」）。
2. **第二個問題（全部 API 配音片都有）**：Gemini 3.x 的 `inlineData` 是完整 WAV（RIFF 檔頭＋data＋尾端「C2PA」憑證區塊 7,664 bytes），舊版 `voice-take.mjs` 把整包當 PCM。檔頭變成原始錄音第 1 個 5ms 的 −16 dBFS 喀聲（被切說明句切掉，沒進成片）；**C2PA 區塊變成旁白最後 0.16 秒、−8～−11 dBFS 的雜訊**，跟著進了成片（power-bill 30.75 秒、dotcom-ai 59.18 秒在片尾卡前露出；kress、2008、hike2022 疊在片尾招牌音下）。
3. **開頭硬起音**：切說明句的切點在首字起音前 0.07–0.15 秒、沒有淡入，混音也沒有片頭淡入，成片第一個字在 0.07–0.25 秒就起音（播放器起播時常吃掉這一段）。切點本身落在 −75～−86 dBFS，不是喀聲；−70 → −11 dB 的陡升是第一個字本身的起音。

## 逐項證實／排除

| 懷疑 | 結果 | 證據 |
|---|---|---|
| (a) 0 值段哪一步產生 | **證實：insert-pauses.py** | dotcom-ai：orig 0 段、切後 0 段、paused4 **12 段**、成片 11 段；power-bill：orig 0、切後 0、paused（預設參數）0、paused5（`--nums`＋`--scene-map`）**13 段**、成片 14 段（只算 ≥10ms，orig／切後唯一一段在尾端 C2PA 區塊內）。程式：`pieces.append(np.zeros(...))`。loudnorm／alimiter／amix 沒有新增 0 段（成片的 0 段位置與 paused 一一對應，長度被 AAC 略縮） |
| (a′) 切點落在字中間 | **證實** | 重跑 power-bill 原參數：「s01 數字前『十一倍』原間隔 0.00 → 0.35（切點 3.737 秒）」「s04 數字前『兩百九十四億美元』原間隔 0.00」「s05 數字前『十一倍』0.00」「s06 數字前／後『十二月』0.00」。paused 檔 0 段兩側 20ms 音量：power-bill 3.74 秒 −26｜−25 dBFS、15.60 秒 −22｜−24、22.76 秒 −22｜−26；dotcom-ai 2.69 秒 −39｜−33、28.51 秒 −19｜−23；hike2022 0.44 秒 −20｜−23、4.01 秒 −25｜−30。兩側任一邊 ≥ −35 dBFS（＝切在字裡）的：power-bill 5 處、dotcom-ai 4 處、hike2022 12 處（真的落在靜音裡的切點兩側是 −60～−80） |
| (b) 開頭硬起音 | **證實（來源＝切說明句沒淡入、沒留空）**；loudnorm 排除 | 成片首字起音（10ms RMS > −40 dBFS）：jensen 0.25、kress 0.10、2008 0.16、power-bill 0.12、dotcom 0.07、hike 0.10 秒；第 0 幀 −79～−86 dBFS。loudnorm 增益在前 8 秒是平的（power-bill −1.4 → −0.3 dB、dotcom +2.6～+3.1 dB，每 0.25 秒量），沒有抽吸 |
| (c) BGM ducking／側鏈 | **排除** | 哩股哩股沒有 BGM：`build-script.mjs` 寫死 `audio: { bgm: false, sfx: false }`；`mix-final.sh` 只有旁白＋招牌音兩路，沒有 sidechaincompress |
| (d) 開場音效疊旁白 | **排除** | 招牌音只有一個輸入，`adelay` ＝片尾卡開始秒（power-bill 31.97、dotcom 59.83…）；sting.wav 3.6 秒，前 6 秒不存在 |
| (e) TTS 原檔開頭雜音／斷續 | **原聲乾淨；容器處理錯** | 沒動過的 TTS（切後 voice-api.wav，5 支）：斷音 0 次、死寂起音 0 次、0 值段 0（扣掉 C2PA 區）。雜音全來自把 WAV 當 PCM：開頭 44 bytes 檔頭（−16 dBFS，5ms）與尾端 C2PA（`C2PA`＋size 7655＋`jumb`…「Google LLC」「SynthID watermark」字樣） |
| (f) Remotion 多段 `<Audio>` 接縫 | **排除** | dossier 的 timeline.json 沒有 `voice` 也沒有各幕 `audio`，render 出來的 silent.mp4 音軌整條是 0；成片音軌是 mix-auto 用 `-map 1:a` 換上的混音 |
| (f′) 接縫太短的喀聲 | **證實（附帶）** | 5ms 淡出接 0、0 接 5ms 淡入：speech −26 dBFS 在 10ms 內掉到 −120（斷音）、−120 在 10ms 內升回 −25（死寂起音）；連在靜音裡的切點也是底噪 −70 突然變純 0 |

## audio-check 對 6 支成品（現有片預期被擋）

`python3 scripts/dossier/audio-check.py <slug>`（片尾卡起點讀 storyboard.json）：

| 片 | 檔案 | Z 數位靜音 | C 斷音 | R 死寂起音 | 前 6 秒 | 首字起音 | exit |
|---|---|---|---|---|---|---|---|
| jensen-pro | out/web/…/liguligu-jensen-pro.mp4（使用者自錄，沒插停頓） | 0 | 0 | 0 | 0 | 0.25 秒 | 0 |
| nvda-kress | out/liguligu-nvda-kress.mp4（timeline 用 voice-api.wav，沒插停頓） | 0 | 0 | 0 | 0 | 0.10 秒 | 0 |
| 2008-check | out/liguligu-2008-check.mp4 | 1（46.10 秒 147ms） | 0 | 1 | 0 | 0.16 秒 | 1 |
| power-bill | out/liguligu-power-bill.mp4 | 12 | 7 | 12 | 5（3.73 C、3.74 Z、4.07 R、4.65 Z、4.77 R） | 0.12 秒 | 1 |
| dotcom-ai | out/liguligu-dotcom-ai.mp4 | 9 | 4 | 12 | 2（2.73 Z、3.01 R） | 0.07 秒 | 1 |
| hike2022 | out/liguligu-hike2022.mp4 | 23 | 11 | 24 | 8（0.435 C、0.49 Z、0.875 R、4.00 C…） | 0.10 秒 | 1 |

kress 與 jensen 過關，但 kress 的 C2PA 雜訊落在片尾卡之後（22.3 秒，片尾卡 21.8 秒起），被招牌音蓋住、檢查不算；三支沒插停頓／插得少的片前 6 秒量不到斷音，Andy 聽到的「前面」若也包括它們，最可能是首字 0.1 秒內就起音（播放器吃字），這一點量不到，只能靠新規則的 0.3 秒留空排除。

門檻怎麼訂：字面上的「50ms 內 >20 dB」會擋到正常人聲：沒動過的 TTS 原音光是「50ms 內掉 >35 dB」每支就有 93–164 處（Gemini 的字尾衰減本來就快），會把正常人聲全擋掉；改用量過的兩條：斷音＝≥ −40 dBFS 在 10ms 內掉 ≥40 dB（原音最大 36 dB，2008 第 7.44 秒），死寂起音＝≤ −85 dBFS 在 10ms 內升 ≥35 dB（原音 0 次，Gemini 底噪約 −65～−80）。

## 修了什麼（向下相容；已排程片的成品、錄音、時間軸都沒動）

- `scripts/dossier/insert-pauses.py`：停頓補這條錄音量到的底噪（安靜段中位數，夾在 −90～−60 dBFS，固定 seed）；接縫 15ms 等功率交叉淡化（`--xfade`）；切點要 ≤ −50 dBFS 且連續 ≥30ms 安靜，沒有就跳過並印 ⚠（`--force-cut` 才照舊）；尾端 C2PA 區塊先剪掉；`--lead 0.3` 片頭補底噪到首字 ≥0.3 秒，檔頭 25ms 淡入、檔尾 20ms 淡出（`--lead 0` 關掉）。
- `scripts/dossier/voice-take.mjs`：TTS 回應是 RIFF 就只取 data 區塊；`--from` 讀到「外層檔頭包內層 WAV」的舊 orig.wav 會自動拆開；切說明句後 20ms 淡入。
- `scripts/dossier/voice-prep.py`（新）＋`scripts/dossier/mix-final.sh`：混音前剪掉 wav 裡的 C2PA 區塊、量首字起音；片頭淡入 0.3 秒（不超過首字前 0.03 秒，舊錄音不吃字）；全片疊 −90 dBFS 粉紅噪音 dither（`DITHER_A`）。`mix-auto.sh` 沿用 mix-final，不用改。
- `scripts/dossier/audio-check.py`（新）＋`scripts/dossier/make.mjs`：混音後（5c）與網站版（6a2）各跑一次，error 就停（`--no-audio-fail` 只警告），結果 `out/<slug>/audio-check.json`／`audio-check-web.json`。
- `scripts/tts-worktime.mjs`：同樣只取 data 區塊。`scripts/tts-take.mjs` 原本就有 `readWav`，不受影響。

## 驗證（只寫到 scratchpad，不動正式檔）

- power-bill 用原參數重插（`--nums 十一倍,兩百九十四億美元,十二月`）：5 處連音跳過、7 處照插，0 值段 0、底噪 −65 dBFS；新 mix-final＋AAC 320k、再轉網站版 128k：audio-check 都是 Z 0／C 0／R 0，首字 0.32 秒。
- 舊 paused5 過新 mix-final：dither 把 0 值段蓋掉（Z 0），但斷音 5、死寂起音 6 仍被抓到——dither 不會把切斷的字藏起來；C2PA 雜訊（30.75 秒）已被 voice-prep 剪掉。
- hike2022 用原參數重插：0.44 秒那處（s01 數字後「二零二二」）與另外 11 處數字前後連音都跳過，`--scene-max` 剪靜音照常，audio-check 通過、首字 0.30 秒。
- 影響：數字前後的停頓以後只會加在原本有氣口的地方，片長會比舊做法短一點；要停就改稿（加逗號）再配音。

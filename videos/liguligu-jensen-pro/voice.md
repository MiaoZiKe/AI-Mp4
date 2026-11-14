# liguligu-jensen-pro 旁白紀錄

更新：台灣時間 2026/11/14 22:45。

## 結論：這份錄音 7 句都有、只念一遍、和稿子一致，已接成正式旁白

使用者 2026/11/14 上傳、說「這個是哩股哩股以後的旁白音檔」的音檔：

- 原檔名 `Generated_Audio_November_14_2026_-_10_23PM.wav`（24kHz 單聲道 16-bit、**23.16 秒**，md5 `6275704d64a6992c44b657d9d6aaa448`）；原檔沒有改動。
- 複本：`public/audio/liguligu-jensen-pro/user-take2.orig.wav`（成片用）、`out/voice-refs/liguligu-reference.wav`（之後的音色參考）。兩處都不進 git。
- **音色名稱與提示詞：使用者尚未告知。**（檔名是 Google AI Studio 匯出的預設格式。）在使用者告知之前，哩股哩股的新片由使用者自己生成錄音上傳。
- 沒有送任何 TTS 請求。

## 內容怎麼確認的（都在本機）

1. 不給稿子，用對齊模型（MMS-300M）直接聽寫成拼音，照停頓分段：
   `…nian de zhixingzhang cizhi jike shengxiao / gonggao mei xie yuanyin / …tian qian dongshihui cai shuo / mei liyou xiangxin jimi waixie / wenjian xie cizhi meiti que shuo dongshihui yao ta zou / shi zhengzhi caozuo ma / huasheng(dun) youbao shuo / dui zhong qiangyingpai lejian ta xiatai / dan lejian bu deng yu sheju / diaocha hai mei jielun ta ye hai mei kaikou / qingci haishi bei qingzou / xiaji kan guohui xiang wen shenme`
   7 句依序各出現一次，沒有重念、沒有多出來的句子。
2. 拿 7 句念稿強制對齊整個檔：110 個字全部對上，整體信心 0.92。

| 幕 | 錄音裡的位置（秒） | 對齊信心 | 信心低於 0.5 的字 |
|---|---|---|---|
| s01 | 0.30–3.84 | 0.83 | 開頭「三十三」（0.01／0.25／0.04） |
| s02 | 4.46–7.56 | 0.95 | 四（0.37） |
| s03 | 8.18–10.70 | 0.92 | 體（0.50） |
| s04 | 11.02–15.52 | 0.95 | 頓（0.49） |
| s05 | 15.88–17.40 | 0.87 | 沒有 |
| s06 | 17.94–19.62 | 0.93 | 沒有 |
| s07 | 20.06–22.90 | 0.98 | 沒有 |

- 停頓後第一個字的起音誤差：中位數 20 毫秒、最大 60 毫秒。
- **要人耳確認的一處：開頭「三十三年」。** 模型對這三個字沒把握（聽寫也只抓到「…年的」）。能量上 0.25–0.74 秒有三個音節的起伏，長度也對，判斷是有念、只是開頭念得快；上一段錄音同一處也是這樣。其他差異是聽寫模型的雜訊（例如「頓」聽成 leng），不是換詞。
- 字幕沒有需要改的地方（旁白、念稿、字幕和 liguligu-jensen 仍一字不差）。

## 量測

工具：`scripts/voice-measure.py`（長度、停頓、音高）、`scripts/voice-retro.py`（捲舌，內部用 `scripts/fa.py`）。語速＝念稿音節數 ÷ 說話長度（去頭尾靜音）。

| 項目 | 這段錄音（10:23PM） | 上一段使用者錄音 第一遍 | 第二遍 | what-is-server（Iapetus） |
|---|---|---|---|---|
| 內容 | 7 句、110 個音節 | 前 3 句、52 字 | 前 3 句、52 字 | 全片 274 個音節 |
| 說話長度 | 22.75 秒 | 12.24 秒 | 11.53 秒 | 61.26 秒（依時間軸排過的 voice.wav） |
| 語速（含停頓） | **4.84 音節/秒** | 4.25 | 4.51 | 4.47 |
| 語速（扣掉 ≥0.15 秒的停頓） | **5.9** | 5.4 | 5.7 | 5.8 |
| 停頓（秒） | 0.31、0.51、0.24、0.57、0.27、0.53、0.18、0.29、0.43、0.43、0.24（共 4.0） | 0.30、0.25、0.66、0.37、0.74、0.29 | 0.19、0.63、0.51、0.23、0.56、0.25 | 35 處、共 13.9 |
| 音高中位數（F0 估算） | **約 123 Hz**（四分位距 85 Hz，偏寬，數字只當參考） | 89 Hz | 114 Hz | 122 Hz（四分位距 37 Hz） |
| 捲舌指標（ㄓㄔㄕ 與 ㄗㄘㄙ 擦音重心差） | **5.8 kHz**（20 字／11 字） | 4.3 kHz（9／7） | 4.7 kHz（10／7） | 0.9 kHz |
| 對齊信心 | 0.92 | 0.90 | 0.91 | — |
| 響度（原檔） | −17.3 LUFS、真峰值 −1.2 dBTP | 整檔 −16.5 LUFS、+2.7 dBTP | | — |

怎麼讀這張表：
- 語速 4.84 音節/秒，落在 `liguligu` 設定檔的 4.4–4.9 之內，比上一段快；句號的停頓（0.4–0.6 秒）比逗號（0.2–0.3 秒）長。
- 這一段沒有削波問題（上一段真峰值 +2.7 dBTP）。
- **捲舌指標 5.8 kHz，是專案裡量過最高的**（stock-jensen 4.4 被聽成中國口音、what-is-server 0.9）。這只是輔助數字，口音要人耳判斷；使用者是聽過才指定這段錄音的，所以照用，只把數字照實記下來。
- 音高的四分位距 85 Hz 太寬，估算裡可能混了倍頻；中位數和上一段第二遍（114 Hz）、what-is-server（122 Hz）相近。
- what-is-server 那一欄量的是成片用的 `public/audio/what-is-server/voice.wav`，幕間停頓是對齊時排過的，不是原始錄音的停頓；音高與捲舌可以直接比，語速只當參考。

## 成片裡怎麼用

- 時間軸：`ALIGN_TAIL_END_F=14 node scripts/dossier/recording-timeline.mjs liguligu-jensen-pro audio/liguligu-jensen-pro/user-take2.orig.wav 7`。影片時間＝錄音時間，不搬動、不加速、句間停頓照原樣。
- 成片的聲音：`public/audio/liguligu-jensen-pro/voice-take2.norm.wav`（原檔 +1.5 dB、限幅器、尾端補靜音到 23.37 秒；**−16.3 LUFS、真峰值 −2.0 dBTP**）。只有這一條，沒有背景音樂與音效。
  ```
  ffmpeg -i user-take2.orig.wav -af "aresample=96000,volume=1.5dB,alimiter=limit=0.794:attack=2:release=40:level=disabled,aresample=48000,apad=whole_dur=23.3667" -ar 48000 -ac 1 voice-take2.norm.wav
  ffmpeg -i <無聲畫面.mp4> -i voice-take2.norm.wav -map 0:v -map 1:a -c:v copy -c:a aac -b:a 192k out/liguligu-jensen-pro.mp4
  ```
- 上一段錄音（`user-upload.orig.wav`、`take1.wav`，只有前 3 句念兩遍）沒有再用，檔案留著。

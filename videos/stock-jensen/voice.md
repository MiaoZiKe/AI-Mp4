# voice.md — stock-jensen 配音（重做版，2026/11/13 凌晨）

- 音色 **Iapetus**、模型 `gemini-2.5-flash-preview-tts`、`voice.mode: "take"`（整篇一次念完）。**這一版 TTS 請求 1 次，HTTP 200，沒有重送。**（上一版另花過 1 次，已作廢。）
- 提示（`voice.style`，程式自動接「說：」）：`用台灣人平常講話的口音，語氣沉穩認真一點，語速比平常稍快，咬字清楚`
- 模型原始錄音 67.89 秒、279 個音節＝每秒 4.11 音節，低於 4.6。照 `videos/love-stats/voice.md` 的做法整條加速 **1.14 倍**（`ffmpeg atempo`，只變速不變調）→ 59.57 秒＝**每秒 4.68 音節**。
- 成品：`public/audio/stock-jensen/voice.wav`（−16 LUFS），另存 `out/stock-jensen/voice-final.wav` 給人試聽。時間軸 1848 幀＝**61.6 秒**（規範 45–75 秒）。
- 聽寫校驗（文字模型 1 次，`gemini-3.5-transcribe`，聽的是加速後的成品）：18 句都在、順序相同、沒有多字漏字、提示沒有被念出來；差異只有簡體字與阿拉伯數字寫法。全文在 `tts-take-asr.json`。
- 整篇對齊信心 0.933。各鏡 0.73–0.99；最低是 s12（0.738）與 s08（0.803），低分的字是「三十三」「一」這類數字，是對齊模型的老毛病，聽寫都有聽到。
- **我聽不到音檔。** 加速 14% 有沒有機械感、語氣是不是「沉穩認真」，要人耳確認。

## 檔案

| 檔案 | 說明 |
|---|---|
| `public/audio/stock-jensen/.take-f18a477348.orig.wav` | 模型原始錄音（67.89 秒），沒動過 |
| `public/audio/stock-jensen/.take-f18a477348.raw.wav` | 加速 1.14 倍後（59.57 秒）；切鏡與對齊讀這個 |
| `NN-sNN.wav`、`voice.wav` | 每鏡切檔、整條人聲軌 |

重做後製（不花請求）：

```
cd public/audio/stock-jensen
ffmpeg -y -i .take-f18a477348.orig.wav -af atempo=1.14 -ar 24000 -ac 1 -c:a pcm_s16le .take-f18a477348.raw.wav
cd ../../.. && flock /tmp/aimp4-render.lock node scripts/tts-take.mjs stock-jensen --resplit
flock /tmp/aimp4-render.lock npm run align stock-jensen
```

改任何一個字、音色或提示都會整篇重新生成（花 1 次 TTS 請求），而且新的錄音不會自動加速。

## 人耳必聽（秒數是 `out/stock-jensen/voice-final.wav`）

1. 整體：加速後有沒有金屬聲、字尾被吃。
2. 開頭「黃仁勳」的「勳」。
3. 約 11–14 秒 句 4「十一月八號」「不忠」：句尾有沒有掉音、有沒有被加重。
4. 約 18–22 秒 句 6「總裁、執行長和董事」三個詞分不分得開。
5. 約 26–29 秒 句 8「盤中一度跌超過一成」兩個「一」。
6. 約 39–42 秒 句 12「三十三年」。
7. 句 11 結尾「誰接」會不會太短促。

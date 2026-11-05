# 音色選擇：us-midterm-tech-2026

**一句話：** 本集講「選後科技政策走向」，一半內容是分析預期與尚未確定、還有股市重挫，需要聽起來可信、冷靜、資訊密度高但不煽動——Charon 的「資訊感」最接近財經新聞解說口吻，數字多也不顯急躁，所以選 **Charon**。

## 候選比較（Gemini TTS 音色清單）

| 音色 | 清單描述 | 聽感與適合度 | 建議 |
|---|---|---|---|
| **Charon** | 資訊感 | 低沉穩定、像晚間財經新聞主播；念「54：44」「35%」這類數字段落清楚不趕 ★★★★★ | 首選（`voice.voiceName`） |
| Iapetus | 清晰 | 咬字分明、較中性；若 Charon 在手機喇叭上顯得太低沉就換它 ★★★★ | 備選 1 |
| Sadaltager | 博學 | 上一集 `us-midterm-2026` 的音色，知性、節奏稍慢；本集主題延續上一集，若要維持系列聲音一致可改用 ★★★★ | 備選 2（系列一致性） |
| Kore | 堅定 | 女聲、果斷、宣告感強；本集「尚未確定」很多，語氣偏硬會像在下結論 ★★★ | 想換女聲時 |

## 語速目標

- 每秒 4–5 字。`scripts/validate.mjs` 以 4.3 字／秒＋每幕 0.9 秒間隔估算：本集 15 幕、`tts` 合計約 331 字，估 **92 秒**（目標 75–95 秒內）。
- 單幕 4.9–6.9 秒；最長三幕是 09（26 字）、06（25 字）、11（25 字）。若實配音超過 100 秒，先縮這三幕。
- 第 1 幕（鉤子）17 字、約 4.9 秒，問句要在 3–4 秒內落地，語速可比其他幕略快。

## 風格指示句（TTS style prompt）

```
用資訊感、清晰、中立、語速中等偏快的台灣國語科技新聞口吻
```

- 與 `script.json` 的 `voice.style` 相同。`scripts/tts.mjs` 在 gemini-2.5 系列會組成「…口吻說：＜旁白＞」送出；gemini-3.x 系列只送純文字，語氣靠音色本身與 `tts` 欄位的斷句（預設模型與覆寫方式見 `scripts/tts.mjs` 開頭註解：`TTS_MODEL` 或 `script.voice.model`）。
- 語氣禁區：不要「驚訝」「下結論」「推銷」；市場段（12）維持與其他幕相同的平穩語速，不加重「重挫」。

## 試聽與產出

```bash
npm run voices us-midterm-tech-2026   # 用第 1 幕對 Charon / Iapetus / Sadaltager / Kore 各產一段 → out/us-midterm-tech-2026/voice-samples/
npm run tts us-midterm-tech-2026      # 逐幕配音 → public/audio/us-midterm-tech-2026/、videos/.../tts-manifest.json
npm run align us-midterm-tech-2026    # 逐字時間戳 → timeline.json（字幕逐字點亮、關鍵詞彈出）
```

批次模式會把全片旁白一次合成、再用靜音偵測切成每幕，所以每幕 `tts` 都以「。」或「？」收尾（已確認），幕與幕之間才切得乾淨。

## 聽審重點（對照 pronunciation.md）

1. 「AI」要唸成 A、I 兩個字母，不是「愛」（01、03、05）。
2. 「35%／55%」唸「三十五趴／五十五趴」，全片一致。
3. 多音字：重挫（ㄓㄨㄥˋ）、行政（ㄒㄧㄥˊ）、州長（ㄓㄤˇ）、延長（ㄔㄤˊ）、否決（ㄈㄡˇ）、認為（ㄨㄟˊ）。
4. 只有第 1 幕是問句可上揚，其餘句尾平收；「尚未確定／延後而非取消」不要唸得像結論。
5. 若 Charon 試聽後覺得太低沉，依序換 Iapetus → Sadaltager，改 `voice.voiceName` 後重跑 `npm run tts`（文字沒變的幕會因 hash 含 voiceName 而全部重做，屬預期）。

# short-ai：問 AI 明年基本工資，它給去年的（AI 教學短片）

成片：`out/short-ai.mp4`，1080×1920、30fps、H.264＋AAC，**14.87 秒（446 幀）**，5 鏡，沒有片尾卡（短片）。
配音：**Sulafat（女）**（gemini-2.5-flash-preview-tts，cmn-TW；使用者 2026/11/14 聽過 Iapetus 版後改回女聲）。後製 atempo 1.08（上限）＋幕間停頓壓到約 0.3 秒。細節見 `voice.md`。上一版 Iapetus 的稿、時間軸、音檔在 `_iapetus/` 與 `public/audio/short-ai/_iapetus/`。

- 九格圖：`out/short-ai-review.png`
- 每鏡截圖：`out/short-ai/stills/`、總覽 `out/short-ai-overview.png`、封面 `out/short-ai-cover.png`
- 字幕檔：`out/short-ai.srt`（中英）、`.zh.srt`、`.en.srt`
- 人聲：`out/short-ai/voice-final.wav`
- 混音：`videos/short-ai/mix.json`（−14 LUFS、TP −4.5 dBFS；BGM 講話時比人聲低 24 LU；whoosh 2 個）

## 風格

AI 教學頻道的固定風格：等距 2.5D 插畫（`stage: "iso"`，引擎 `src/components/ai-iso/IsoVideo.tsx` 的 5 鏡試片版，和 `videos/sample-ai-iso/` 同一套）。
粉彩亮色的斜角小桌面，螢幕＝AI、新聞紙＝原文、放大鏡＝核對；要讀的字放在飛起來轉正的白色厚卡上。只用 SVG 與 CSS 2D，每幀約 0.055 秒。

## 每鏡

畫面內容和上一版相同，只有旁白變短、時間跟著新配音走。

| 鏡 | 時間 | 旁白 |
|---|---|---|
| s01 鉤子 | 0.0–1.8 秒 | 明年基本工資多少？ |
| s02 只打一句 | 1.5–3.9 秒 | Gemini 實測，只打一句。 |
| s03 它的回答 | 3.6–7.1 秒 | 它說，28,590。 |
| s04 反轉 | 6.8–10.6 秒 | 那是去年的，明年是 30,900。 |
| s05 做法＋下一次 | 10.2–14.9 秒 | 先貼新聞，請它只看這段。下次再教一招。 |

## 這次動到的共用引擎（`src/components/ai-iso/IsoVideo.tsx`，都向下相容）

1. 數字字級 `size`（前製時加）：`screen.size`、`pin.size`、`wrong.size`、`right.size`，6 位數字才不會超出螢幕與卡片。
2. 放大鏡位置 `lens.dx`／`lens.dy`（不寫＝原本的 150／8）：本片數字在行首，預設位置會蓋住「（月薪）」，改放到右下空白處。
3. 放大鏡裡的字超過 5 個字元時自動縮小（`300 / 字數`），5 個字元以內照舊 62px；原本 28,590 會超出鏡框。
4. 試片版字幕去掉每段結尾的逗號、句號（和 `IsoFilm.tsx` 的做法一樣），原本會出現「下一支，」。
5. `next` 鏡新增可選的 `pulseAt`：最後一個膠囊在那個 cue 再彈一下（以右緣為中心放大，不超出安全區），用來補結尾 2 秒多沒有事件的空檔。

`npx tsc --noEmit` 通過；sample-ai-iso、sample-tech-3d validate 0 error，sample-tech-anc 0 error 2 warning（原本就有）。

另外（Sulafat 版）：`scripts/tts-take.mjs` 新增環境變數 `TTS_NO_RETRY=1`（任何錯誤都不自動重送；不設＝行為不變）。

## 渲染

- still 約 42 秒；render 約 46–76 秒（55 ms/幀，和別的工作搶 CPU 時較慢），全部用 `flock /tmp/aimp4-render.lock` 包住。
- 自查：每 0.25 秒抽格（前 3 秒每 2 幀）看過，修了上面 2–5 點後重渲。

## 已知問題

- **語速仍低於設定**：原始錄音扣掉停頓約 4.0 音節/秒（目標 4.6–5.0）；加速 1.08 後約 4.3。片長靠壓幕間停頓（0.65–0.79 → 約 0.3 秒）才到 14.87 秒；不壓的話約 16.2 秒。
- **捲舌指標偏高**：ㄓㄔㄕ 與 ㄗㄘㄙ 差距 4.6 kHz（stock-jensen 4.4 曾被聽成中國口音）；樣本很少，要人耳判斷。
- s03 對齊信心 0.394（數字整段低），s04 0.704；放大鏡與紅底照對齊時間出現，可能早晚幾幀。
- 聽寫把「下次再教一招」聽成「下次再討價還價」（對齊分數高，比較像聽寫誤判）。
- 每鏡 1.8–4.7 秒，都低於 CLAUDE.md 的 5 秒（短片的短鏡）；s02 只有 2.4 秒，提示卡飛進螢幕的動作和換鏡淡出疊在一起。
- s03、s04 旁白不念「元」（為了縮短），畫面與字卡仍有「元」「月薪」。
- s04 被彈開的錯卡縮到角落，字很小（當成看過的東西）。
- 「行政院已核定」沒讀到新聞稿原文，上片前要再確認（見 `research.md`）。
- 沒有請沒參與製作的評審打分。

## 人耳確認清單（秒數是成片時間）

1. 約 4.6–6.9 秒：s03「兩萬八千五百九十」念得對不對（對齊分數最低）。
2. 約 8.7–10.2 秒：s04「三萬零九百」。
3. 約 13.2–14.3 秒：s05「下次再教一招」有沒有念清楚。
4. 約 1.7–3.6 秒：Gemini 的發音、「只打一句」。
5. 全片：有沒有中國口音；加速 1.08 後聲音自不自然；鏡與鏡之間只停 0.3 秒會不會太趕。

## 重做

```bash
cd /home/user/AI-Mp4
node scripts/validate.mjs short-ai        # 要 0 error
df -h /
flock /tmp/aimp4-render.lock node scripts/still.mjs short-ai
flock /tmp/aimp4-render.lock node scripts/render.mjs short-ai
python3 scripts/ui/review9.py short-ai 0,s01:much+10,s02:test+20,s02:one+14,s03:old+20,s04:last+8,s04:now+20,s05:only+10,s05:next+2
```
注意：不要再跑 `tts-take.mjs short-ai`（含 `--resplit`、`--asr`），會用原始錄音重切、蓋掉 atempo 1.08 的版本；align 要帶 `ALIGN_GAP_MAX=0.3`。

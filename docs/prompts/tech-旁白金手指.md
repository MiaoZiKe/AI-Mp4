# 科技透明圈旁白「金手指」（2026/11/21 Andy 定案，蓋掉 11/20 的 3.8 版）

Andy 原話（11/21 01:xx）：聽完量測檢測三種旁白比較後指定「量測-原來規則-整篇.m4a　以後這個當金手指」。
基準音檔：`out/voice-compare/量測-原來規則-整篇.m4a`（= `out/old-tech-metrology-take-2.5/.take-e1796e78d6.raw.wav`，原檔 `.raw.orig.wav`，不進 git）。
11/20 的 3.8 版（平穩中性 Style）已停用，全文留在 `tech-旁白金手指-3.8版-已停用.md`。

| 項目 | 固定值 |
|---|---|
| 模型 | gemini-2.5-flash-preview-tts（不用 3.8） |
| 音色 | Iapetus |
| 送法 | API 整篇 1 次請求；script.json `voice: { voiceName: "Iapetus", model: "gemini-2.5-flash-preview-tts", mode: "take", languageCode: "cmn-TW", profile: "tech-b" }`，**不寫 styleMode** |
| 說明（＝說明 B，程式自動接念稿） | 用台灣人平常講話的口音，不特別捲舌、不兒化，語氣溫和親切，像在跟一個好奇的朋友解說，問句自然上揚，講到答案時肯定一點，語速稍快、不拖尾音，直接說： |
| 念稿 | 原封不動；「矽」在念稿版寫「細」（2026/11/22 改；寫「夕」會被念成一聲 xī，見 tech-daily-playbook「念法：矽」）；數字、縮寫寫成唸法 |
| 後製 | 只准整篇 atempo，不改音高、不等化、不剪停頓。目標＝基準音檔的語速：扣掉 ≥0.16 秒靜音（−40 dB）後純說話約 **5.75 字/秒**（5.6–5.9 都可）；基準檔是原始錄音 ×1.20。上限 1.25 |
| 停頓 | 照錄音原本的停頓（跟著 atempo 一起縮），不另外加長或壓短 |
| 音高關卡（2026/11/24；11/26 改 **120–135 Hz**，Andy：「131 這音頻OK 以後可以120～135 Hz」，下方舊數字作廢） | **基準音高 121.5 Hz**（光罩-1／光罩-2 原始錄音實測，`.venv/bin/python -I scripts/voice-measure.py <wav>` 的 f0Median），允許 **112–126 Hz**。一律用 `bash scripts/three/tts-pitch-take.sh <slug>` 配音（不合格自動重配，最多共 3 次請求，結果寫 `videos/<slug>/tts-pitch.json`）；`make-tech.sh` 渲染前也會擋超出範圍的 `--take`（`--allow-pitch` 才放行）。原因：Andy 11/24 聽出矽晶圓與光罩的旁白音色差很多——同一套設定，矽晶圓-1／-2、光阻-1 量到 135–138 Hz，光罩-1／-2 是 121.5 Hz，是每次生成的隨機落差，Andy 要求之後旁白都是同一個音色 |

量語速：`ffmpeg -i X.wav -af silencedetect=n=-40dB:d=0.16 -f null -` 加總靜音，念稿中文字數 ÷（總長 − 靜音）。

## 確認紀錄
- 2026/11/21 Andy 比較 4 種（3.8 金手指／原來規則 ×1.20／2 奈米速度 ×1.17／曝光機 ×1.23／良率規則加停頓）後選「原來規則」。

## 語速步調基準（2026/11/26 起）
Andy 11/26：「全部OK，特別是東京威力，他的語速步調我很滿意，80分大概」。以後語速、停頓以 **東京威力 v3**（out/tech-tel.v3.mp4）為準：成片 含停頓 4.22、純說話 5.23 字/秒、停頓 29 處平均 0.50 秒。
做法：說明句＝ASML／應材／科林那句（scripts/voice-profile.mjs 的 TECH_B_LINE）；音高 120–135 Hz（東京威力 131 Hz）；整篇 atempo 1.12（上限）；不移調、不剪停頓。

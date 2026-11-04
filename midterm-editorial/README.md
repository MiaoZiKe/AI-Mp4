# midterm-editorial｜2026 美國期中選舉 選後 8 件事

1080×1920 / 30fps / 約 76 秒的直式財經短影片，全部內容由 `script.json` 驅動。

| 檔案 | 內容 |
|---|---|
| `research.md` | 研究筆記（每個數字 ≥2 來源、查詢時間、未採用資料） |
| `script.json` | 每頁 narration（TTS 口語稿）/ subtitle_zh / subtitle_en / keys / kpis / cues / visual |
| `voice_timing.json` | 每頁開始結束時間、每句、每個字的時間戳記（動畫唯一時間來源） |
| `audio/` | 分頁配音、voice_dry、mix.wav（-14 LUFS）、asr_report.json（whisper-small 比對） |
| `src/index.html` | HTML/SVG/CSS + GSAP；`window.seek(t)` 決定性畫面 |
| `tools/` | voice.py（TTS+對齊）、asr.py、mix.py、render.js（Playwright 逐格）、make_srt.py、qa_cues.js |
| `output/` | midterm-editorial.mp4、cover.png、subtitles.srt、caption.txt |

重建：先把 sherpa-onnx 模型下載到 `models/`（kokoro-multi-lang-v1_1、sherpa-onnx-whisper-small、sherpa-onnx-sense-voice-zh-en-ja-ko-yue-2024-07-17、sherpa-onnx-paraformer-zh-2024-03-09），`npm i`，然後執行 `./build.sh`。

# 2026 美國期中選舉：結果與影響（程式逐格繪製短影片）

- 規格：1080×1920、30fps、67.4 秒、H.264 CRF 18 yuv420p、AAC 192k、−14.0 LUFS／−1.4 dBTP
- 畫面：numpy + Pillow 逐格繪製（無 AI 生圖／影片模型、無外部圖片素材）
- 聲音：配樂與轉場音效以 numpy 合成；旁白為離線 TTS（見下方說明）
- 資料：`research.md`（查詢時間、來源網址、計票中項目）；`timeline.json`（每段秒數、字幕／旁白對齊幀）

## 產出
- `output/midterm-2026.mp4`、`output/cover.png`、`output/caption.txt`

## 重建
```bash
pip install numpy pillow scipy pyloudnorm pypinyin tensorflow-cpu==2.20.0 edge-tts
pip install --no-deps zhtts
# 字型：Noto Sans TC / Noto Serif TC（Google Fonts）放到 assets/fonts/
python src/patch_tts_model.py <site-packages>/zhtts/asset/fastspeech2_quan.tflite assets/fastspeech2_noflex.tflite
python src/build_timeline.py     # 旁白合成 + 量測 → timeline.json
python src/render.py all build/frames --jobs 4
python src/audio.py              # 配樂、音效、ducking、響度
ffmpeg -framerate 30 -i build/frames/f%05d.png -i build/mix.wav -c:v libx264 -preset slow -crf 18 -pix_fmt yuv420p -c:a aac -b:a 192k -shortest output/midterm-2026.mp4
python src/cover.py
```

旁白：優先使用 edge-tts（zh-TW-YunJheNeural, +5%）；本次製作環境無法連線 speech.platform.bing.com，
自動改用離線 zhtts（FastSpeech2 + MB-MelGAN，女聲、普通話口音），並以 `patch_tts_model.py`
移除模型中兩個推論時 dropout 的 Flex 運算以便在標準 TFLite 執行。

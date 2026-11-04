# midterm-2026-video

2026 美國期中選舉短影音（9:16、1080×1920、30fps）。內容全部由 `script.json` 驅動，配音時間軸由實際音檔長度自動產生（`timeline.json`）。

## 檔案結構
| 路徑 | 用途 |
|---|---|
| `research.md` | 研究筆記：數字、交叉比對、來源網址、查詢時間 |
| `script.json` | 9 格腳本：主字幕、旁白字幕／配音稿、畫面元素、卡片類型、秒數 |
| `timeline.json` | 由 `tools/timeline.mjs` 依配音長度產生，記錄每格與每句的起訖時間 |
| `template/` | HTML/CSS/JS＋GSAP 模板（`index.html`、`style.css`、`main.js`、`cover.html`、`assets/usmap.json`） |
| `tools/` | 產製流程腳本 |
| `output/` | `midterm-2026.mp4`、`cover.png`、`caption.txt` |

## 產製流程
```bash
npm install                      # gsap, us-atlas, topojson-client, d3-geo
pip install sherpa-onnx soundfile numpy scipy pyloudnorm
./tools/fetch_fonts.sh           # Noto Serif TC / Noto Sans TC / JetBrains Mono
# Kokoro TTS 模型（sherpa-onnx 版 kokoro-multi-lang-v1_0）放在 $KOKORO_DIR
./tools/build.sh all             # 檢查腳本 → TTS → 時間軸 → 逐格渲染 → 混音 → 合成 MP4 → 封面
```
- `tools/check_script.py`：檢查字幕長度（≤14 個中文字）、TTS 詞典有沒有缺字
- `tools/tts.py`：每句各自生成一個 wav 檔，並裁掉頭尾靜音
- `tools/timeline.mjs`：每格時長＝前導 0.2s＋各句長度＋句間 0.1s＋結尾 0.3s；轉場 0.4s，前後場景重疊
- `tools/render.mjs`：Playwright 逐格呼叫 `window.seek(t)` 再截圖；4 個瀏覽器平行渲染，用 ffmpeg 合成
- `tools/audio.py`：配音、合成 BGM（pad 和弦，-22 LUFS；有旁白時 ducking -6 dB）、印章與 whoosh 音效
- `tools/build.sh`：limiter → 兩段式 loudnorm（-14 LUFS）→ H.264 CRF18 yuv420p＋AAC 192k
- `tools/asr_check.py`：用離線 ASR 轉錄每句配音，檢查發音
- `tools/motion_check.py`：偵測靜止幀、跳幀、空白幀
- `tools/contrast.py`：WCAG 對比度檢查

## 改內容
只要改 `script.json`（文字、資料、highlight），再執行 `./tools/build.sh all` 即可。畫面版型依照 `card` 欄位對應到 `template/main.js` 裡的 builder：breaking / seats / balance / list / chart / trio / taiwan / stat / summary。

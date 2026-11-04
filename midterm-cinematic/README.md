# 選後的世界：2026 美國期中選舉（66 秒程序化資料短片）

這部 1920×804（2.39:1）、24fps、66.0 秒的短片，畫面與聲音全部由本資料夾中的 Python 程式生成，沒有使用 AI 生圖、AI 影片模型、AI 音樂模型或任何外部圖片、音訊素材。字型使用開源的 Noto Serif TC。

| 檔案 | 內容 |
|---|---|
| `research.md` | 選舉結果、政策與市場影響的研究筆記，附來源網址與查詢時間 |
| `timeline.json` | 分幕、字卡、旁白的逐格時間表（由 `src/tts.py` 依旁白實際長度產生） |
| `src/script_data.py` | 腳本：字卡與旁白文字 |
| `src/film.py` | 共用工具：easing、fBm noise、星空、月亮、圖示、文字繪製 |
| `src/scenes.py` | 六個鏡頭的合成、轉場、後製（bloom、暗角、底片顆粒）與字卡 |
| `src/render.py` | multiprocessing 平行逐格輸出 PNG |
| `src/audio.py` | numpy 合成配樂（和弦進行、旋律、琶音、reverb）、音效、旁白壓低、響度正規化 |
| `src/tts.py` | 旁白：優先使用 edge-tts，連不上時改用本機 Kokoro TTS |
| `src/make_html.py` | 單檔 HTML 播放器 |
| `build.sh` | 一鍵重建 |
| `output/` | `midterm-cinematic.mp4`、`midterm-cinematic.html`、`poster.png`、`caption.txt` |

重建方式：

```bash
bash build.sh
```

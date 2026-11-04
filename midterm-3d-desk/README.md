# 美國期中選舉 8 件事影響你的錢包（9:16 短影片）

2026 美國期中選舉選後重點，1080×1920／30fps／約 58.6 秒，繁中配音＋字幕。
所有內容由 `script.json` 驅動；數據來源見 `research.md`。

## 視覺設計：資料長廊（Data Corridor）
深海軍藍暗場（#10141C）中一條反光地面的長廊，沿金色導引線排列 9 座純幾何的資料雕塑，鏡頭逐站平移（0.5 秒 power3.inOut，跨切點重疊），每站內做 3–5 度緩慢環繞＋推軌。沒有角色或吉祥物。

| 段落 | 雕塑 |
|---|---|
| 開場 | 立體「2026」＋ 8 根依序升起的預告柱 |
| 01 參議院 | 100 根座位柱半圓，依資料上色（民主 54／共和 44／計票中 2），由內圈向外升起 |
| 02 眾議院 | 435 個座位方塊半圓（民主 228／共和 139／其餘計票中） |
| 03 分裂政府 | 兩塊等大石碑：白宮（紅）與國會（藍），中間金色光縫 |
| 04 預算與稅務 | 硬幣堆落入後被玻璃方塊封住＋暫停符號（財政僵局） |
| 05 關稅與貿易 | 三塊石板依序亮起兩塊（推翻否決需 2/3）＋貨櫃 |
| 06 科技與晶片 | 晶片＋旋轉檢查環（出口管制） |
| 07 市場反應 | 上升柱狀圖＋向右上箭頭 |
| 08 對台灣 | 台灣輪廓金色立牌（由經緯度點繪製）＋環繞晶片 |
| 結尾 | 沿長廊回望全部雕塑 |

紅 #C8423B／藍 #2F5DA8 只用在資料上（座位、石碑、圖例），兩色同彩度、同尺寸；其他一律金黃 #E0B33A 與石板灰。

## 技術流程
```
script.json ──► tools/build_audio.py ──► build/timeline.json（段落／字幕時間、音效點、逐格頻譜）
                     │                    build/mix.wav（配音＋BGM＋音效，-14 LUFS）
                     ▼
web/index.html + main.js（Three.js 場景、BokehPass 景深）+ overlay.js（HTML 疊層、GSAP 時間軸）
                     ▼
tools/render.js（Playwright，window.renderAt(frame) 固定時間步進逐格截圖）
                     ▼
tools/encode.sh（ffmpeg：H.264 CRF18 yuv420p＋AAC 192k）→ output/midterm-3d.mp4
```

- 配音：`zhtts`（FastSpeech2＋MB-MelGAN，離線神經 TTS，模型內建於 PyPI 套件），語速 ×1.05。每個字幕句單獨合成，字幕時間直接取自音檔長度（誤差 0），段落長度＝實際音檔＋0.3 秒。
- BGM：程式合成的 Dm9–B♭maj7–F–C 柔和 pad＋84 BPM 輕節拍，-22 dBFS RMS，旁白時自動壓低 6 dB。
- 音效：換格「嗶」＋打字聲、雕塑升起「啵」、數字到位「叮」，全部以正弦／濾波雜訊合成。
- 波形條：由旁白音檔逐格 FFT（28 頻帶）資料驅動。
- 3D 以 80% 內部解析度渲染後放大（景深模糊下無明顯差異），文字疊層維持 1080p 原生清晰度。

## 重建
```bash
python3.11 -m venv .venv && .venv/bin/pip install "tensorflow-cpu==2.12.1" "numpy<1.24" scipy pypinyin && .venv/bin/pip install --no-deps zhtts
npm install
bash tools/build_all.sh
```
（Playwright 使用環境預裝的 Chromium；`tools/sheet.sh` 用於自我檢查的截圖拼版。）

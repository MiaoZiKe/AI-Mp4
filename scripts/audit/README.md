# 流暢度量測（`npm run audit <slug>`）

```
npm run audit <slug>                         # 量 out/<slug>.mp4 → videos/<slug>/motion.json
npm run audit <slug> -- --baseline           # 寫 videos/<slug>/baseline-motion.json（基準，入庫）
npm run audit <slug> -- --video out/x.mp4    # 指定影片（例如 AUDIT=1 的 render）
npm run audit <slug> -- --bench              # 另跑 scripts/bench.mjs（第 300–359 幀）記錄 ms/幀
```

依賴：python3、numpy、ffmpeg/ffprobe。一支 80 秒的片約 1.5–2 分鐘。`render.mjs` 會把整片的 ms/幀寫到 `out/<slug>.render.json`，audit 會一起收進 `bench`。

## 版面來源

- `styleVersion: 2`：一律讀 `timeline.json`（`version: 2`）的 `startFrame / durationFrames / transitionFrames / voiceStartFrame / voiceEndFrame / subtitleWindow`，不自行計算。
- v1：幕長 = `round(durationSec × 30)`，相鄰兩幕不重疊；字幕行、關鍵詞時間是「相對幕開始」的秒數。

## 遮罩與門檻（全解析度 1080×1920 座標）

| 名稱 | 範圍 | 用途 |
|---|---|---|
| 內容區 | x 64–1016，y 330–1360 | 元件（`Video.tsx` 內容框 top 330、高 1030） |
| 字幕區 | x 64–1016，y 1340–1700 | 中英字幕＋來源列 |
| `DIFF_T` | 20 | 相鄰兩幀灰階差 > 20 才算「這個像素變了」；背景星點、光暈漂移、圖示呼吸光都在門檻以下或面積極小 |
| `ACTIVE_T` | 1.5% | 內容區變化像素 > 1.5% 才算「結構變化」；≤ 1.5% ＝只有微動（ambient） |
| `COVER_T` | 40 | 與 `public/bg/base.png` 灰階差 > 40 的像素算「有內容」 |
| `BLACK_RATIO` | 0.15 | 換幕邊界 ±12 幀內，覆蓋率 < 兩側幕穩定段中位數較小者 × 15% → 黑場幀 |

## 指標

**像素層**（解碼 MP4 的 y 330–1700 灰階）
- `ambientOnlyPct`：舊 an3 算法。每幕 body（v1：幕開始到出場前 9 幀；v2：本幕開始到下一幕轉場開始）中，內容區變化 ≤ `ACTIVE_T` 的幀比例。us-midterm-tech v1 重現 86.1%（計畫基準 86%）。
- `holdSec`（每幕）：最後一次結構變化到出場的秒數。
- `blackFramesTotal / blackFramesMaxPerCut`：見上表。
- `maxDisplacementPx / p99DisplacementPx / framesOver24px`：半解析度 16×16 區塊比對，只沿水平或垂直方向搜尋 ±24（全解析度 ±48px）；區塊須有紋理、殘差 < 0 位移的 35%、平均殘差 < 6，且至少 3 個區塊位移相近才採計，避免淡入淡出和新字出現造成誤配。能抓到「排版跳動」（例如 v1 TermCard 打字機換行時整張卡片上移 ~32px）。
- `subtitleStaticPct`：字幕區完全不變（≤0.05%）的幀比例，參考用。

**事件層**（timeline）
- 每幕 `beats`（字幕行出現、關鍵詞、cue、本幕進場完成）、`maxBeatGapSec`、`holdSec`（最後一個 beat 到出場）。
- `doubleExposureFrames`：v2 轉場依 timeline 記錄的曲線（出場 `exit` 幀區間線性淡出、進場 `enter` 幀區間 ease-out 淡入）解析計算兩幕同時 > 40% 不透明度的幀數；v1 不重疊為 0。
- `maxSubtitleGroupsPerFrame`：字幕軌視窗同時存在的最大組數（目標 1）。
- `voiceGapsSec / voiceOverlaps`：相鄰兩幕「實際說話區間」的間隔（v2 用切檔頭尾靜音校正後的 voiceStart/End）。

**聲音層**（MP4 音軌；目前沒有 BGM，音軌就是人聲 stem）
- `silencedetect=noise=-40dB:d=0.3`：`silencePct`（≥0.3 秒靜音總和 / 全長；us-midterm-tech v1 重現 21.7%）、`headSilenceSec`、每個換幕點的停頓 `cutPausesSec`。

## AUDIT=1

`AUDIT=1 npm run render <slug>` 會關掉背景星點／光點／光暈漂移與圖示呼吸光（`src/components/anim.ts` 的 `AMBIENT`），讓像素層只剩結構變化。日常量測用一般 render 即可（`DIFF_T` 已濾掉大部分 ambient）。

## legacy/

`an.py`、`an2.py`、`an3.py` 是第一次診斷時用的原始腳本（讀 ffmpeg signalstats 輸出），原樣保留以便對照；`audit.py` 的像素層是 an3 的 numpy 版。原始量法：

```
ffmpeg -i out/us-midterm-tech-2026.mp4 -an -filter_complex "[0:v]format=gray,tblend=all_mode=difference,lutyuv=y='if(gt(val,20),255,0)',split=2[a][b];[a]crop=952:1030:64:330,signalstats,metadata=print:key=lavfi.signalstats.YAVG:file=content.txt[o1];[b]crop=952:360:64:1340,signalstats,metadata=print:key=lavfi.signalstats.YAVG:file=sub.txt[o2]" -map "[o1]" -f null - -map "[o2]" -f null -
```

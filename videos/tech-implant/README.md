# tech-implant：離子佈植（科技透明圈系列 1 第 8 支；接量測與檢測，下一支清洗；預定 11/30 週一 20:00）
- 狀態：前製（11/20 Sonnet）＋建模與成片（11/20 Opus）。**建模與 props 完成、尚未渲染**（11/20 CEO 通知：配音有爆音、正在重處理音檔並可能重跑對齊，等音檔與時間軸定版再渲）。
- 建模：`python3 videos/tech-implant/genmodel.py` → model.json，並自動先跑 genscript.py、再把 3D 動作（zoom／shot／shift／run／labels／overlay）併進 script.json（改畫面改 genmodel.py，不手改 json）。所有動作的 at 都寫成「幕id:cue±幀」（由 timeline.json 的 cue 換算）。
- 2D 卡：`src/components/three/HudImplant.tsx`（kind 以 imp- 開頭：hook／np／mask／src／acc／sel／scan／cmp／co／next），Hud.tsx 只加一行分派。
- 主素材框：機台各層都標 bg，另放看不見的 `px_*` 框（用實際零件範圍算，每一幕只亮鏡頭對準的那一個）給 layout-check 判斷「卡片有沒有蓋到主體中央」；理由：近景時整台機台的層外框會投影到鏡頭後面變成無限大。
- 成品音軌：`sfx-logo-tech.py` → `mix-endsting.sh voice.wav sting 68.17 70.30 73.43` → `out/tech-implant.v1.wav`；渲染 `AUDIO=out/tech-implant.v1.wav bash scripts/three/chunk-render.sh tech-implant v1`。
- 產生：`python3 videos/tech-implant/genscript.py` → script.json（只含旁白、cue、字幕、hook、片尾卡、hud；改稿改這支再重跑 align，不手改 json）。
- 念稿：`docs/prompts/tech-implant-旁白.txt`（Iapetus＋tech-b，整篇 1 次請求；TTS 只送 1 次）。
- 配音處理（11/20 v2，Fable 重做；舊版 rubberband 降 4.5 半音造成爆音，已停用）：`.venv/bin/python scripts/three/voice-normalize.py tech-implant --tempo=1.22 --pause-ratio=0.4`——從原始錄音（85.3 秒、音高中位數 123.9 Hz、起伏 15.5 半音）做 PSOLA 降 1.98 半音並把起伏縮成 0.80 倍（共振峰不動）→ atempo 1.22 → 停頓超過 0.3 秒的部分留 0.4 倍 → 70Hz 高通＋對曝光機頻譜等化 → −16 LUFS、限幅 −2 dBFS。結果（同一把尺，曝光機在括號）：音高 110.4 Hz（110.5）、起伏 12.3 半音（12.3）、扣停頓 5.53 字/秒（5.44）、含停頓 4.61（4.87）、70Hz 以下 −30.5 dB（−31.8；舊版 −15.8）、峰值 −1.9 dBFS。驗收 15 項全過，報告 `out/tech-implant-voice-normalize.json`；解析與流程 `docs/voice-normalize.md`。舊的處理後音檔備份在 `out/old-tech-implant-take/`。沒有送 TTS。待人耳確認。
- 長度：timeline 73.43 秒（2203 幀，含片尾卡 3.2 秒；舊版 72.1 秒／2163 幀），在 75 秒內；換幕人聲間隔 0.67–0.70 秒。cue 相對舊版：幕內位移 −1～+4 幀，絕對位移最多 +38 幀（s10）。
- validate：只剩 `stage three 需要 model.json`（模型還沒建）；其餘 0 error。
- 比對音檔：scratchpad `離子佈植配音比對_曝光機_離子佈植_v2.mp3`（曝光機 12 秒＋嗶＋本片 12 秒）。
- 待人耳確認：「亞舍立」「兆捷」「恩型／皮型」讀音；降調自然度。

## 音檔／時間軸定版後怎麼出片（Opus 交接）
1. `python3 videos/tech-implant/genmodel.py`（讀新的 timeline.json 重算所有 cue 幀；不動 timeline／storyboard／音檔）
2. `node scripts/three/layout-check.mjs tech-implant`、`node scripts/three/flow-check.mjs tech-implant`、`npm run validate tech-implant`、`node scripts/three/kinematics-check.mjs tech-implant` 都要 0 error（11/20 舊時間軸：全部 0 error）
3. 片尾招牌音：`python3 scripts/three/sfx-logo-tech.py out/tech-implant.sting.wav`；用 storyboard 算 AT＝s10:kw−8 幀÷30、FADE＝最後人聲結束÷30、DUR＝總幀÷30，再 `G=28 bash scripts/three/mix-endsting.sh public/audio/tech-implant/voice.wav out/tech-implant.sting.wav $AT $FADE $DUR out/tech-implant.v1.wav`（舊時間軸：66.9 68.97 72.1）
4. `AUDIO=out/tech-implant.v1.wav bash scripts/three/chunk-render.sh tech-implant v1`

## v2（2026/11/21，旁白金手指：2.5＋Iapetus＋說明 B＋整篇 atempo）
- 配音：`voice` 改回 2.5＋Iapetus＋tech-b（雜湊 b6555c277d）；原始錄音 `.take-b6555c277d.raw.orig.wav`（備份 `out/old-tech-implant-take-2.5/`）只做整篇 `atempo=1.25` → `.raw.wav`，不改音高、不剪停頓。0 次 TTS 請求。
- **佈植原始錄音偏慢，×1.25 只到 5.42 字/秒**（同一把尺：扣掉 ≥0.16 秒、−40 dB 靜音；原始 4.43、×1.20＝5.26、×1.25＝5.42、×1.30＝5.64；要到金手指目標 5.75 約需 ×1.33，超過上限 1.25，Andy／CEO 11/21 決定照上限 ×1.25）。含停頓 4.64 字/秒。
- `tts-take --resplit` → `ALIGN_PROVIDER=fa align --force`（整篇信心 0.922）→ `python3 genmodel.py`（依新時間軸重算 cue，只差 ±1–2 幀；genscript.py 的 voice 也改回 2.5）→ validate／layout-check／card-overlap／flow-check／kinematics-check 全 0 error。時間軸 2162 幀（72.07 秒）。
- 片尾音：`G=28 bash scripts/three/mix-endsting.sh public/audio/tech-implant/voice.wav out/tech-implant.sting.wav 66.8667 68.9333 72.0667 out/tech-implant.v2.wav`。
- 成片 `out/tech-implant.v2.mp4`（`AUDIO=out/tech-implant.v2.wav bash scripts/three/chunk-render.sh tech-implant v2`）；3.8 金手指版 `out/tech-implant.gold.mp4` 保留，其分段在 `out/chunks/tech-implant-gold/`。
- 磁鐵分選卡「狹縫」改放在狹縫左邊（新時間軸下太重離子撞壁的火花會壓到右邊的字，card-overlap 抓到）。
- 11/21 成片：`out/tech-implant.v2.mp4`（2162 幀、72.07 秒），九格 `out/tech-implant.v2-grid9.jpg`；s3／s7／s9 標籤用 `xy` 固定位置（引線不穿過別張卡，layout-check 0）。

## 11/22 重配 v3（「矽」念錯，Andy 11/22 18:45 同意重配）
- 根因：念稿寫「夕」被念成一聲 xī（大陸讀音）。改成念稿寫「細」（兩岸都念第四聲 xì），字幕維持「矽」；genscript.py 的自動替換改 `.replace("矽","細")`。
- 配音：旁白金手指（2.5＋Iapetus＋tech-b），TTS 請求 1 次（`.take-495f048a8d`，原始 82.85 秒，備份 `.raw.orig.wav`）。原始音高中位數 114.7 Hz（金手指 113.7，+0.9%）、純說話 4.65 字/秒；整篇 atempo 1.237 → 純說話 5.66、含停頓 4.73。align 整篇信心 0.90；時間軸 70.27 秒（2108 幀）。
- 片尾音：`G=28 mix-endsting.sh voice.wav out/tech-implant.sting.wav 65.2333 67.1333 70.2667 out/tech-implant.v3.wav`（片尾段 −10.9 LUFS、峰值 −1.2 dBFS；audio-check 全 0）。
- 渲染：`AUDIO=out/tech-implant.v3.wav CONC=2 bash scripts/three/chunk-render.sh tech-implant v3` → `out/tech-implant.v3.mp4`（舊檔不動）。
- 試聽：`out/voice-compare/1122/離子佈植-重配-前20秒.m4a`、`離子佈植-矽-修正後.m4a`（四處「矽」接在一起）。
- 成片：`out/tech-implant.v3.mp4`（70.27 秒，11/22 23:35 渲完）。四道驗證：1、3 過（句中停頓 0、停頓 16／上限 22、audio-check 全 0）；2 的「矽」相關差異全部消失，其餘 ASR 差異（N/P 刻意寫法、同音字、公司名、片頭聽寫幻覺）經本機 whisper 交叉確認為誤判；4 只標片尾卡轉場。結論在 `out/tech-implant/verify4/human.md`。

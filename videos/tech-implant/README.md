# tech-implant：離子佈植（科技透明圈系列 1 第 8 支；接量測與檢測，下一支清洗；預定 11/30 週一 20:00）
- 狀態：前製（11/20 Sonnet）＋建模與成片（11/20 Opus）。**建模與 props 完成、尚未渲染**（11/20 CEO 通知：配音有爆音、正在重處理音檔並可能重跑對齊，等音檔與時間軸定版再渲）。
- 建模：`python3 videos/tech-implant/genmodel.py` → model.json，並自動先跑 genscript.py、再把 3D 動作（zoom／shot／shift／run／labels／overlay）併進 script.json（改畫面改 genmodel.py，不手改 json）。所有動作的 at 都寫成「幕id:cue±幀」（由 timeline.json 的 cue 換算）。
- 2D 卡：`src/components/three/HudImplant.tsx`（kind 以 imp- 開頭：hook／np／mask／src／acc／sel／scan／cmp／co／next），Hud.tsx 只加一行分派。
- 主素材框：機台各層都標 bg，另放看不見的 `px_*` 框（用實際零件範圍算，每一幕只亮鏡頭對準的那一個）給 layout-check 判斷「卡片有沒有蓋到主體中央」；理由：近景時整台機台的層外框會投影到鏡頭後面變成無限大。
- 成品音軌：`sfx-logo-tech.py` → `mix-endsting.sh voice.wav sting 66.9 68.97 72.1` → `out/tech-implant.v1.wav`；渲染 `AUDIO=out/tech-implant.v1.wav bash scripts/three/chunk-render.sh tech-implant v1`。
- 產生：`python3 videos/tech-implant/genscript.py` → script.json（只含旁白、cue、字幕、hook、片尾卡、hud；改稿改這支再重跑 align，不手改 json）。
- 念稿：`docs/prompts/tech-implant-旁白.txt`（Iapetus＋tech-b，整篇 1 次請求；TTS 只送 1 次）。
- 配音處理（#56）：原始 85.3 秒（含停頓 3.73 字/秒、音高中位數 134 Hz）→ 段落停頓 ≥0.7 的 9 處修到 0.65（共去掉 0.95 秒）→ ffmpeg `rubberband=tempo=1.25:pitch=0.77:formant=preserved`（變速不變調後單獨降調，atempo 等效 1.25，剛好在上限）。成片音軌（含片尾卡 72.1 秒）：首字到末字含停頓 4.59 字/秒（基準 4.7，−2.3%）；音高中位數 114.0 Hz（曝光機 114.6，−0.5%）。降調幅度約 4.5 半音，超過 #56 的「1～2 半音」，因為這次 Gemini 的原始音高偏高（134 Hz）；待人耳確認有沒有失真或變悶。
- 長度：timeline 72.1 秒（含片尾卡 3.2 秒），在 75 秒內；換幕人聲間隔 0.67–0.70 秒。
- validate：只剩 `stage three 需要 model.json`（模型還沒建）；其餘 0 error。
- 比對音檔：scratchpad `離子佈植配音比對_曝光機_離子佈植.mp3`（曝光機 12 秒＋嗶＋本片 12 秒）。
- 待人耳確認：「亞舍立」「兆捷」「恩型／皮型」讀音；降調自然度。

## 音檔／時間軸定版後怎麼出片（Opus 交接）
1. `python3 videos/tech-implant/genmodel.py`（讀新的 timeline.json 重算所有 cue 幀；不動 timeline／storyboard／音檔）
2. `node scripts/three/layout-check.mjs tech-implant`、`node scripts/three/flow-check.mjs tech-implant`、`npm run validate tech-implant`、`node scripts/three/kinematics-check.mjs tech-implant` 都要 0 error（11/20 舊時間軸：全部 0 error）
3. 片尾招牌音：`python3 scripts/three/sfx-logo-tech.py out/tech-implant.sting.wav`；用 storyboard 算 AT＝s10:kw−8 幀÷30、FADE＝最後人聲結束÷30、DUR＝總幀÷30，再 `G=28 bash scripts/three/mix-endsting.sh public/audio/tech-implant/voice.wav out/tech-implant.sting.wav $AT $FADE $DUR out/tech-implant.v1.wav`（舊時間軸：66.9 68.97 72.1）
4. `AUDIO=out/tech-implant.v1.wav bash scripts/three/chunk-render.sh tech-implant v1`

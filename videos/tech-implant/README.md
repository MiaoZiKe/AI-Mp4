# tech-implant：離子佈植（科技透明圈系列 1 第 8 支；接量測與檢測，下一支清洗；預定 11/30 週一 20:00）
- 狀態：前製完成（11/20 Sonnet）：研究、腳本、畫面規格、配音、對齊。**尚未建 3D 模型、未渲染**；下一棒 Opus 依 `visual-spec.md` 複製 `test-ion-opus/gen.py` 建 `model.json` 並補 script.json 的 props（zoom／shot／shift／run／labels／overlay），再 `bash scripts/three/make-tech.sh`／`chunk-render.sh`。
- 產生：`python3 videos/tech-implant/genscript.py` → script.json（只含旁白、cue、字幕、hook、片尾卡、hud；改稿改這支再重跑 align，不手改 json）。
- 念稿：`docs/prompts/tech-implant-旁白.txt`（Iapetus＋tech-b，整篇 1 次請求；TTS 只送 1 次）。
- 配音處理（#56）：原始 85.3 秒（含停頓 3.73 字/秒、音高中位數 134 Hz）→ 段落停頓 ≥0.7 的 9 處修到 0.65（共去掉 0.95 秒）→ ffmpeg `rubberband=tempo=1.25:pitch=0.77:formant=preserved`（變速不變調後單獨降調，atempo 等效 1.25，剛好在上限）。成片音軌（含片尾卡 72.1 秒）：首字到末字含停頓 4.59 字/秒（基準 4.7，−2.3%）；音高中位數 114.0 Hz（曝光機 114.6，−0.5%）。降調幅度約 4.5 半音，超過 #56 的「1～2 半音」，因為這次 Gemini 的原始音高偏高（134 Hz）；待人耳確認有沒有失真或變悶。
- 長度：timeline 72.1 秒（含片尾卡 3.2 秒），在 75 秒內；換幕人聲間隔 0.67–0.70 秒。
- validate：只剩 `stage three 需要 model.json`（模型還沒建）；其餘 0 error。
- 比對音檔：scratchpad `離子佈植配音比對_曝光機_離子佈植.mp3`（曝光機 12 秒＋嗶＋本片 12 秒）。
- 待人耳確認：「亞舍立」「兆捷」「恩型／皮型」讀音；降調自然度。

# tech-waferflow：一片晶圓要經過哪些流程（科技透明圈 第 11 支，11/25（三）20:00）

## 做到哪（2026/11/18）
- 配音：Iapetus＋tech-b，整篇 1 次請求（`out/voice-waferflow/waferflow-a.wav`，67.37 秒，念稿 260 字）。語速：純說話 4.80 字/秒（在 4.3–5.0 內）、含停頓 3.86 字/秒；atempo 取上限 1.12（4.7÷3.86＝1.22 超過上限）→ 成片含停頓約 4.3 字/秒。音高中位數 142 Hz、p90 195 Hz（基準 110–125／≤185，偏高，見回報）。
- 成片：`out/tech-waferflow.v1.mp4`（63.7 秒，含 3.2 秒片尾卡；正片 -15.9 LUFS、片尾 -11.2 LUFS）。格子圖 `out/tech-waferflow.v1-grid.jpg`、逐句截圖 `out/tech-waferflow.v1-sync1～4.jpg`、近景 `out/tech-waferflow.v1-closeup-explode.png`（四層爆炸剖析）／`-closeup-etch.png`（蝕刻機）。
- v2（排隊中，`nohup bash make-tech 後半段 --ver=v2`，輸出 `out/tech-waferflow.v2.mp4`）：只改外觀細節——爆炸標名引線不交叉、2D 剖面卡三個層名不再重疊、步驟清單不切到右邊、光罩盒移到光罩台旁、下一支卡片在片尾卡前退場。配音、時間軸、旁白與 v1 相同。
- 流程：沉積→塗光阻（含四層爆炸剖析標名）→曝光→顯影→蝕刻→去光阻→離子佈植＋研磨→疊 12 層重複→誰做哪一步→預告蝕刻機。
- 運作動畫 7 段：沉積粒子、曝光光柱穿過光罩縫、顯影藥水、電漿離子蝕刻、去光阻藥水、離子佈植、CMP（轉盤／研磨頭／研磨液／鑽石碟）；每段都有 2D 剖面卡同步。
- 公司：艾司摩爾（曝光機，公司公布）、科林研發（蝕刻機，公司公布）、家登（光罩盒，媒體報導）、三福化（去光阻藥水，媒體報導）、中砂（修整研磨墊的鑽石碟，媒體報導）；引線指到 3D 對應部位。
- 產生程式：`genmodel.py`、`genscript.py`（念稿／字幕／cue 在 `narr.py`）；2D 卡 `src/components/three/HudWafer.tsx`（`wf-ring／wf-sec／wf-count／wf-who／wf-next`）。逐句對照表 `sync-table.md`（`gensync.py` 產生）。

## 已知限制
- 音高偏高（142 Hz）：Gemini 這次的語氣比曝光機基準高，未重配（每支只准 1 次 TTS，重配要 CEO 同意）。
- 各設備尺寸、層厚、圖形皆示意。v1 的缺點（v2 已修）：爆炸標名引線交叉、2D 層名重疊、光罩盒在鏡頭邊緣被切、片尾卡出現前下一支卡片殘影。

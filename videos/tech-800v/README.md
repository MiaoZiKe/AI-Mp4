# tech-800v：八百伏特（科技透明圈 第 9 支，11/22（日）20:00）

## v1 成片（2026/11/18，Andy 11/17 回饋版）：out/tech-800v.v1.mp4（不進 git），格子圖 out/tech-800v.v1-grid.jpg
- 片長 60.37 秒（含片尾卡 3.2 秒）；正片 -16.0 LUFS、片尾 -10.9 LUFS；TTS 只送 1 次（out/voice-800v/800v-a.wav，63.85 秒）。
- 語速：原始 249 字÷63.85 秒＝3.90 字/秒（含停頓）；atempo＝4.7÷3.90＝1.205，超過上限取 1.12；實測成片含停頓約 4.35 字/秒、純說話約 5.25 字/秒；段落停頓 pauseAfter 0.7 秒。音高中位數 127.7 Hz（基準 112，略高，已做曝光機對照 mp3：scratchpad「八百伏特配音比對_曝光機_800v.mp3」）。
- 畫面：倍率讀數（機櫃×1／銅排對照×2／降壓路徑×2／電路板×9）；2.5D 爆炸剖析三處（s2 電源架：整流模組＋風扇拉開，s6 降壓電路板：銅走線／功率元件／晶片逐層拉開，s7–s8 電源側櫃：前蓋／整流模組／背面銅排拉開），全部用 shift 分層，材質不透明；電流光點、銅排漸紅＋熱波、氣流箭頭、風扇轉、2D 剖面卡（pw-compare、pw-vrm、pw-chain、pw-unk、pw-sum）與 3D 同步；公司（台達電、光寶科）用引線指到電源櫃／電源架。
- 逐句對照表：videos/tech-800v/sync-table.md（產生程式 sync-table.py）＋拼圖 out/tech-800v-sync.jpg；近景：out/tech-800v-closeup-board.png、-shelf.png、-sidecar.png。
- 改片尾與兩張卡時用 render-range 只重渲第 370–525、1270–1435、1620–1810 幀再接回（音訊沿用）；全片的 layout-check 0 error、validate 0 error。
- ⚠ 還差一小段：第 1401–1435 幀（0:46.7–0:47.8，s8 後半）仍是舊的「？空框」卡畫面；新版 pw-unk（兩條長條）已進 script.json，該段 35 幀已排進渲染鎖（job：render-range 1401 1435 → out/tech-800v.r4.mp4，被其他支排隊擠住）。渲完後執行 `bash /tmp/claude-0/-home-user/1662701f-8abb-57a6-b66d-4e0b4e90dd73/scratchpad/splice800.sh`（把 r1–r4 接回 out/tech-800v.video.orig.mp4 並混回 v1.wav）再 `python3 videos/tech-800v/sync-table.py`。
- 已知：s6（降壓）旁白很密，cue 間隔 1～2 秒，畫面事件已合併但讀秒仍偏短（旁白已定稿，要拉長得刪字重配）；機櫃兩側銅排為示意（真實在背面中央）；水冷沒有畫（本題不涉及）。

## 進度（2026/11/17）
- [x] research.md 複查（第二來源、信心度、台灣公司）
- [x] 念稿改寫（九段、249 字、結尾預告 11/23「IC 設計為什麼沒有工廠」、留言「供電」）
- [x] device-spec.md（每一步怎麼動、物理現象清單）
- [x] model.json／script.json（genmodel.py、genscript.py 產生）＋ HudPower.tsx 四張 2D 卡（pw-compare、pw-chain、pw-unk、pw-sum）
- [x] validate 0 error、layout-check 0 error、kinematics-check 0 error
- [x] 配音 1 次請求（out/voice-800v/800v-a.wav，63.85 秒）
- [ ] make-tech 渲染 v1、抽格自查（見下）

## 配音量測
- 原始 249 字，純說話 53.1 秒＝4.69 字/秒（基準 4.3–5.0 內）；atempo ＝ 5.46÷4.69 ＝ 1.165。
- 音高（同一支自寫自相關估計，曝光機基準 112 Hz／p90 170 Hz）：本次中位數 127.7 Hz、p90 202 Hz，**比基準高約 15 Hz，略超出 110–125 範圍**。依指示只送 1 次、沒有重配；比對 mp3 已做，等人耳確認。

## 查證與已知限制
- 銅排 200 kg 是廠商估算（NVIDIA；Tom's Hardware、Converge Digest 同寫）；18,519／1,250 A 與 219 倍是自己算的式子；光寶科時程兩說不一，念稿不講；華城等本輪查不到 800 V 直流的公開來源，不放。
- 機櫃兩側銅排是示意（真實在背面中央）；降壓路徑 800→50→12→約 1 V 是常見路徑之一。
- 水冷沒有畫（本題不涉及）。

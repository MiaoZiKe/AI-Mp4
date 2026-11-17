# tech-deposition：薄膜沉積（科技透明圈，接蝕刻機之後，下一支化學機械研磨）
- v1：`out/tech-deposition.v1.mp4`（64.7 秒，1941 幀）。配音 Iapetus＋tech-b 整篇 1 次請求（`out/voice-deposition/dep-a.wav`，原始含停頓 4.26 字/秒，F0 約 104 Hz，atempo 1.104 → 約 4.7）。
- 產生：`genmodel.py`→model.json、`genscript.py`→script.json、`gensync.py`→sync-table.md；2D 卡 `src/components/three/HudDep.tsx`（kind 以 dep- 開頭）。
- 檢查：validate 0 error、layout-check 0 error（頂端空白 0、底端 46px）、kinematics 0 error；對照表 sync-table.md；格子圖 out/tech-deposition.v1-sync1～4.jpg。
- 待人耳確認：「ASM」是否念成英文字母；開頭 5 秒。

# tech-deposition：薄膜沉積（科技透明圈，接蝕刻機之後，下一支化學機械研磨）
- v1：`out/tech-deposition.v1.mp4`（64.7 秒，1941 幀）。配音 Iapetus＋tech-b 整篇 1 次請求（`out/voice-deposition/dep-a.wav`，原始含停頓 4.26 字/秒，F0 約 104 Hz，atempo 1.104 → 約 4.7）。
- 產生：`genmodel.py`→model.json、`genscript.py`→script.json、`gensync.py`→sync-table.md；2D 卡 `src/components/three/HudDep.tsx`（kind 以 dep- 開頭）。
- 檢查：validate 0 error、layout-check 0 error（頂端空白 0、底端 46px）、kinematics 0 error；對照表 sync-table.md；格子圖 out/tech-deposition.v1-sync1～4.jpg。
- 待人耳確認：「ASM」是否念成英文字母；開頭 5 秒。

## v2（退回修改後）：out/tech-deposition.v2.mp4（64.7 秒，同一份音軌與時間軸，TTS 0 次新增）
1. 2D 卡常駐完整：反應腔剖面、濺鍍剖面（靶材→電漿→晶圓溝槽，離子往上、原子往下、溝槽長膜）一開始就畫出，念到時加亮；濺鍍原子與離子顆粒放大。
2. 公司卡改不透明 6 列大字（名稱 30px、說明 28px），念到誰誰亮；3D 各公司引線指到機台不同部位，光洋科指金色靶材，京鼎指機台本體。
3. 結尾「所以這層膜／一層層長」膜一層層長出，「凹凸不平」才換成凹凸膜。
4. 研磨墊改深藍，與青綠膜區分。5. 開場第 0 幀即有腔頂燈閃、氣體往下噴。6. ALD 卡溝槽放大，四步驟跟旁白亮起、循環快轉。7. 矽塊改藍灰分色＋前剖面矽晶格原子點。

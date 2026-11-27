# tech-abfsub：ABF-2：ABF 載板（科技透明圈 系列 3 第 8 集）
- 狀態（2026/11/27 台北）：r0 無聲完整版，待雙審。**未配音、未送 TTS、未渲染整片**。留言關鍵字「載板」。前一集 3-7 ABF 膜；下一集 3-9 BT 載板。
- 念稿 `script.md`（232 字，10 幕＋片尾卡）；查證 `research.md`；物理 `physics-spec.md`；畫面 `visual-spec.md`；素材 `assets.md`。
- 產生：`python3 videos/tech-abfsub/genscript.py` → `node scripts/three/silent-timeline.mjs tech-abfsub` → 再跑一次 genscript。
- 第 39 條：每幕念完留 0.6 秒＋下一幕開口前 ≤0.3 秒；無聲估計 58.3 秒（1749 幀）；旁白間最長無聲 0.9 秒，>1 秒 0 個（timeline.json 量）。
- 第 40 條：公司卡（s9，三家）只有 4.1 秒不夠 → 卡片與 s9 鏡頭延到 s10 開頭（延長期間 s10 鏡頭不動），延長幀數依 timeline.json 自動算（目前延 32 幀，卡片完整顯示 5.3 秒）；念完「景碩」後還有「跟日本大廠搶單」。
- 檢查：precheck 0 error 0 warning；validate、layout-check、card-overlap、kinematics-check、flow-check 0 error。

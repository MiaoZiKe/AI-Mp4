# tech-bt：BT 載板與 T-glass 缺料（科技透明圈 系列 3 第 9 集）
- 狀態（2026/11/28 台北）：無聲完整版建模完成。**未配音、未送 TTS、未渲染整片**。留言關鍵字「BT」。前一集 3-8 ABF 載板；下一集 3-10 玻璃基板。
- 念稿 `script.md`（260 字，11 幕＋片尾卡，頻道負責人已核准，未改字）；查證 `research.md`（61 條＋上片前待查）；物理 `physics-spec.md`；畫面 `visual-spec.md`；素材 `assets.md`。
- 產生：`python3 videos/tech-bt/genscript.py` → `node scripts/three/silent-timeline.mjs tech-bt` → 再跑一次 genscript。
- 第 38 條：不加運作音效。第 39 條：每幕念完留 0.6 秒＋下一幕開口前 ≤0.3 秒；無聲估計 64.7 秒（1941 幀）；旁白間最長無聲 0.9 秒，>1 秒 0 個（timeline.json 量）。
- 第 40 條：s6 日東紡卡 6.6 秒（念完日東紡後 1.1 秒，卡片延到 s7 開頭 9 幀，延長期間 s7 鏡頭不動）；s8 日東紡＋台玻卡 4.7 秒（需 3.9）；s9 景碩、南電、欣興卡 5.9 秒（需 5.1），念完欣興後還有「手機和記憶體多靠它們」。
- 檢查：precheck、validate、layout-check、card-overlap、kinematics-check、flow-check 0 error（kinematics 這支沒有關節鏈，0 幀）。

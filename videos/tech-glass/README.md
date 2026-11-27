# tech-glass：玻璃基板（科技透明圈 系列 3 第 10 集）
- 狀態（2026/11/28 台北）：無聲完整版建模完成，檢查 0 error；雙審：物理 r1 8.4 通過（出處已補數位時代）；機構 r2 總分 7.9／元件細節 8.1；r3 已收窄 s7 時程站並拉近鏡頭，複審中。第一段「上一集說布還是會脹，那整片換玻璃呢？看玻璃基板。」頻道負責人 11/28 同意。前一集 3-9 BT 載板；下一集 3-11 銅箔基板。留言關鍵字「玻璃基板」。
- 念稿 `script.md`（260 字，8 幕＋片尾卡，頻道負責人 11/27 定稿，未改字）；查證 `research.md`（截至 2026/11/28：沒有任何一家確定量產）；物理 `physics-spec.md`；畫面 `visual-spec.md`；素材 `assets.md`。
- 產生：`python3 videos/tech-glass/genscript.py` → `node scripts/three/silent-timeline.mjs tech-glass` → 再跑一次 genscript。2D 卡 `src/components/three/HudGlass.tsx`。
- 第 38 條：不加運作音效。第 39 條：每幕念完留 0.6 秒＋下一幕開口前 0.3 秒＝0.9 秒。第 40 條：s6 公司卡 3 家需 5.1 秒（自動延長機制 EXTN 保留）。第 27 條⑤：公司卡最多 3 家（頻道負責人 11/28 不開例外）——英特爾、三星電機、Absolics；台灣只寫不具名「台灣廠商：送樣中（媒體報導，截至 2026/11/28）」，欣興、群創不上卡，3D 實驗室招牌也改成「台灣廠商」。
- 配音：`NODE_USE_ENV_PROXY=1 bash scripts/three/tts-pitch-take.sh tech-glass`（第 43 條）。

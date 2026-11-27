# tech-glass：玻璃基板（科技透明圈 系列 3 第 10 集）
- 狀態（2026/11/28 台北）：無聲完整版建模完成，檢查 0 error；雙審進行中。前一集 3-9 BT 載板；下一集 3-11 銅箔基板。留言關鍵字「玻璃基板」。
- 念稿 `script.md`（260 字，8 幕＋片尾卡，頻道負責人 11/27 定稿，未改字）；查證 `research.md`（截至 2026/11/28：沒有任何一家確定量產）；物理 `physics-spec.md`；畫面 `visual-spec.md`；素材 `assets.md`。
- 產生：`python3 videos/tech-glass/genscript.py` → `node scripts/three/silent-timeline.mjs tech-glass` → 再跑一次 genscript。2D 卡 `src/components/three/HudGlass.tsx`。
- 第 38 條：不加運作音效。第 39 條：每幕念完留 0.6 秒＋下一幕開口前 0.3 秒＝0.9 秒。第 40 條：s6 公司卡 5 家需 7.5 秒，卡片自動延到 s7 開頭（EXTN，延長期間 s7 鏡頭不動）。
- 配音：`NODE_USE_ENV_PROXY=1 bash scripts/three/tts-pitch-take.sh tech-glass`（第 43 條）。

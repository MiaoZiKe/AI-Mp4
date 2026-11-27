# tech-cufoil：銅箔與玻纖布（科技透明圈 系列 3 第 12 集）
- 前一集 3-11 銅箔基板；下一集 3-13 電路板怎麼做（壓合、鑽孔、電鍍）。留言關鍵字「玻纖布」。
- 念稿 `script.md`（260 字，10 幕＋片尾卡，0 個數字）；查證 `research.md`；物理 `physics-spec.md`；畫面 `visual-spec.md`；素材 `assets.md`。
- 產生：`python3 videos/tech-cufoil/genscript.py` → `node scripts/three/silent-timeline.mjs tech-cufoil` → 再跑一次 genscript（配音後改用 timeline.json）。
- 2D 卡：`src/components/three/HudCufoil.tsx`（cuf-*）。
- 檢查：precheck、validate、layout-check、card-overlap、kinematics-check、flow-check 0 error（2026/11/28）。

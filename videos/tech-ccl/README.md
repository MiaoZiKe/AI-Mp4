# tech-ccl：銅箔基板 CCL（科技透明圈 系列 3 第 11 集）
- 前一集 3-10 玻璃基板；下一集 3-12 銅箔與玻纖布。留言關鍵字「銅箔基板」。
- 念稿 `script.md`（256 字，10 幕＋片尾卡）；查證 `research.md`（含第七節三家公司出處）；物理 `physics-spec.md`；畫面 `visual-spec.md`；素材 `assets.md`。
- 產生：`python3 videos/tech-ccl/genscript.py` → `node scripts/three/silent-timeline.mjs tech-ccl` → 再跑一次 genscript。
- 2D 卡：`src/components/three/HudCcl.tsx`（ccl-*）。
- 檢查：precheck、validate、layout-check、card-overlap、kinematics-check、flow-check 0 error（2026/11/28）。

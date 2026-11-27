# tech-dicing：晶圓切割與薄化（科技透明圈 系列 3 第 1 集）
- 狀態（2026/11/27 台北）：r0 無聲完整版，待雙審。**未配音、未送 TTS、未渲染整片**。留言關鍵字「切割」。前一集 2-22 探針卡-2；下一集 3-2 封裝打線。
- 念稿 `script.md`（260 字，12 幕＋片尾卡）；查證 `research.md`；物理 `physics-spec.md`；畫面 `visual-spec.md`；素材 `assets.md`。
- 產生：`python3 videos/tech-dicing/genscript.py`（先跑 gen-model.mjs）→ `node scripts/three/silent-timeline.mjs tech-dicing` → 再跑一次 genscript。2D 卡 `src/components/three/HudDicing.tsx`（Hud.tsx 只加 import 與一行 `dc-` 分派）。
- 無聲估計 84.9 秒（2547 幀）。
- 檢查：precheck 0 error 0 warning；validate、layout-check、card-overlap、kinematics-check、flow-check 0 error。

# tech-mature：成熟與特殊製程代工（中游補充篇 M1；系列 2 結束後、系列 3 之前；前一集 2-22 探針卡-2；下一集 M2 記憶體製造）
- 狀態（2026/11/28 台北）：無聲完整版（子聊天室製作）。留言關鍵字「成熟製程」。
- 產生：`python3 videos/tech-mature/genscript.py`（自動先跑 gen-model.mjs）→ `node scripts/three/silent-timeline.mjs tech-mature` → 再跑一次 genscript。配音後：align 產生新 timeline.json，再跑 genscript。
- 9 幕＋片尾卡；念稿 259 字（script.md）；2D 卡 `src/components/three/HudMature.tsx`（mature-*），Hud.tsx 只加 import 與一行登記；Brand.tsx 新增 umc、vis LOGO 與 CN 國旗。
- 規格：visual-spec.md、physics-spec.md；來源 research.md、assets.md。

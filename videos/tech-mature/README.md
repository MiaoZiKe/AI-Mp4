# tech-mature：成熟與特殊製程代工（中游補充篇 M1；系列 2 結束後、系列 3 之前；前一集 2-22 探針卡-2；下一集 M2 記憶體製造）
- 狀態（2026/11/28 台北）：已配音、對齊（make-tech.sh --dry，未渲染）。留言關鍵字「成熟製程」。
- 配音：Iapetus＋tech-b，API 整篇 1 次（tts-requests.json）；原始 66.17 秒、f0 中位 131.1 Hz；atempo 1.22 後 voice.wav f0 中位 135.6 Hz、起伏（IQR）66.5；人聲 9→1714 幀（56.8 秒），念稿 260 字：含停頓 4.6 字／秒、純說話約 5.2 字／秒；幕間無聲 0.77～0.90 秒，>1.0 秒只有片尾卡（57.1–60.9 秒）。
- 雙審：機構 r4 8.0／元件細節 8.1（docs/reviews/2026-11-28-mature-mech.md）、物理 r1 8.4（-physics.md）；六項檢查 0 error（配音後重跑）。
- 產生：`python3 videos/tech-mature/genscript.py`（自動先跑 gen-model.mjs）→ `node scripts/three/silent-timeline.mjs tech-mature` → 再跑一次 genscript。配音後：align 產生新 timeline.json，再跑 genscript。
- 9 幕＋片尾卡；念稿 259 字（script.md）；2D 卡 `src/components/three/HudMature.tsx`（mature-*），Hud.tsx 只加 import 與一行登記；Brand.tsx 新增 umc、vis LOGO 與 CN 國旗。
- 規格：visual-spec.md、physics-spec.md；來源 research.md、assets.md。

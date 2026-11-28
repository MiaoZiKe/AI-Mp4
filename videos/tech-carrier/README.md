# tech-carrier：光罩盒與晶圓載具（科技透明圈 中游補充篇 M5）
- 前一集 M4 再生晶圓；下一集 M6 材料分析與故障分析。12/29 18:00 發，留言關鍵字「晶圓盒」。
- 念稿 `script.md`（260 字，10 幕＋片尾卡，頻道負責人 2026/11/28 核准改三處）；查證 `research.md`；物理 `physics-spec.md`；畫面 `visual-spec.md`；素材 `assets.md`。
- 產生：`python3 videos/tech-carrier/genscript.py` → `node scripts/three/silent-timeline.mjs tech-carrier` → 再跑一次 genscript。2D 卡：`src/components/three/HudCarrier.tsx`（carrier-*）。
- 雙審：機構 r1 8.2／8.1／8.1（r0 7.1／6.6／6.8）、物理 r1 8.2（r0 7.1）；docs/reviews/2026-11-28-carrier-*.md。六項檢查 0 error。
- 配音：API 3 次（140.4／142.0／125.0 Hz），採第 3 次（IQR 53.3）；原始含停頓 4.03 字/秒 → atempo 1.116；成片人聲段含停頓 4.17 字/秒（頻道負責人裁示 holdSec 不動）。
- 成片 v1：render-chunks run 46134527159（jobs 8）→ renders/series2 `renders/tech-carrier.v1.mp4`；66.5 秒、1080×1920 H.264、−15.6 LUFS；silencedetect（−40dB、1.0 秒）0 段；blackdetect 0 段。
- 中勤 LOGO：官網經代理 403，用白底文字名牌、不寫代號。

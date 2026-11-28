# tech-reclaim：再生晶圓（中游補充篇 M4；前一集 M3 化合物半導體；下一集 M5 光罩盒與晶圓載具）
- 狀態（2026/11/28 台北）：已出片 v1（render-chunks run 46126348333，成品在 renders/series2 的 renders/tech-reclaim.v1.mp4）。留言關鍵字「再生晶圓」。
- 念稿 script.md（260 字，9 幕＋片尾卡；頻道負責人核准，s1 因開場鉤子 4 秒規則再調一次，已獲同意）。
- 雙審 r1：機構 機台擬真 8.3／爆炸分解 8.2／元件細節 8.1；物理 8.4（docs/reviews/2026-11-28-reclaim-mech.md、-physics.md）。六項檢查 0 error。
- 配音：API 整篇 1 次，原始 f0 134.1 Hz、IQR 59.8、68.69 秒；**atempo 1.19（超過第 13／24 條上限 1.12，頻道負責人知悉，待 Andy 決定）**；成品人聲 59.3 秒、含停頓 4.38 字/秒；成片 62.5 秒、−15.6 LUFS、>1.0 秒無聲 0 段。
- 已知未做（評審建議）：s4 第四張「矽晶圓」標籤、研磨液滴點內移、斜射光角度 41°→65°。昇陽半 LOGO 三源抓不到，用文字名牌（assets.md）。
- 產生：`python3 videos/tech-reclaim/genscript.py`（先跑 gen-model.mjs）→ silent-timeline → genscript；配音後 make-tech --take=out/tech-reclaim-take.orig.wav --atempo=1.19 --dry → genscript。2D 卡 src/components/three/HudReclaim.tsx。

# tech-precursor：前驅物（系列 2 第 14 集；上一集 2-13 靶材；下一集 2-15 特用氣體）
- 狀態（2026/11/27 台北）：雙審前的完整無聲版，未配音、未渲染、未審片。12/16（三）18:00 發，留言關鍵字「前驅物」。
- 產生：`python3 videos/tech-precursor/genscript.py`（先跑 gen-model.mjs）→ `node scripts/three/silent-timeline.mjs tech-precursor` → 再跑一次 genscript。2D 卡 HudPrecursor.tsx（11 張）。
- 11 幕＋片尾；念稿 233 字；無聲估 79.6 秒。檢查：validate 0、layout 0、card-overlap 0、kinematics 0、flow 0。
- 爆炸 9 步：①門滑開 ②蓋與進出氣閥上升 ③加熱套上升（②③對調，否則加熱套穿過出氣管）④插管抽出 ⑤外殼半透明看液體與頂部空間 ⑥載氣流量控制與濾器往左 ⑦保溫套逐段剝開 ⑧閥塊上抬、隔膜彈簧分開 ⑨遠景一起組回；固體安瓿短版（s2，蓋與四層托盤升起）。
- 運作：氣泡上升帶走蒸氣（s5，Ops.tsx 新增 flow `rise`）、有加熱對沒加熱凝結（s6）、脈衝閥一開一關（s7）、ALD 一圈（s8，位置用完就停）、雜質落下（s9）。
- 比喻：醬料（前驅物）、飲料吹泡泡（起泡器）、冷杯子凝水珠（冷點）、刷油漆（ALD）。
- 未完成／待做：幕界前後各 15 幀抽格未做；16 格 keyframes 只抽了 8 格；LOGO 抓不到；Andy 1～29 條逐條自查見下。

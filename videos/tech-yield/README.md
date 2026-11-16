# tech-yield：晶圓良率，大晶片為什麼比較吃虧（科技透明圈 第 4 支）

- 預定 2026/11/17（二）20:00 發；留言關鍵字「良率」；片尾「下一支 ▸ 先進封裝」；`logoAnim: "transparent"`＋招牌音。
- 規格：`device-spec.md`（以它為準；畫面常駐日期照 CEO 指示改成發布日「查證截至 2026/11/17」）。念稿：`docs/prompts/tech-yield-旁白.txt`（9 段，沒改）。

## v1（2026/11/16）

- 成片 `out/tech-yield.v1.mp4`（不進 git）：57.6 秒、1728 幀、1080×1920 30fps。
- 配音：API 整篇 1 次請求（Iapetus、tech-b、cmn-TW），原始 67.69 秒；純說話 4.40 字／秒 → 整篇 atempo 1.241（原檔 `.take-e6be07d06c.raw.orig.wav`）→ 純說話 270 字／48.8 秒＝5.53 字／秒、含停頓 4.96 字／秒；`tts-take --resplit`＋`align --force`。整篇對齊信心 0.911，每幕 0.81–0.95（沒有 <0.7 的幕；最低 s10 0.81、s7 0.85）。捲舌指標（voice-retro）ㄓㄔㄕ 5800 Hz、和ㄗㄘㄙ差 2488 Hz。
- 響度：正片 −16.0 LUFS（峰值 −4.5）；片尾段 −11.5 LUFS、true peak −1.3 dBTP（`G=28 mix-endsting.sh`，片尾卡從 s14:cm−8＝第 1606 幀＝53.53 秒開始，背景淡出點＝最後一句結束 54.47 秒）。音源用 `out/tech-yield.video.mp4`（純人聲 −16），不用 render 的 BGM 混音版。
- 畫面做法：整支畫在 2D 圖層 `art: "yield"`（`src/components/three/HudYield.tsx`，cabinet 式 2.5D 投影，不掛 3D 畫布，181 ms／幀）。腳本由 `gen-script.mjs` 產生；每幕 cue 自動放進 `hud.levels[0].cues`。
- 資料：小晶片 10×10 mm 實排 625 顆、大晶片 25×32 mm 直立矩形實排 62 顆（邊緣扣 3 mm）；71 個缺陷（mulberry32 seed 38，半徑 150 mm 均勻）→ 小晶片壞 59／好 566（≈91%）、大晶片壞 34／好 28（≈45%）；3D 晶圓、2D 地圖、計數器、缺陷雨同一份資料。
- 運作動畫（都跟旁白 cue）：①s4 缺陷雨（前 10 點每 3 幀、其餘每幀 1 點，自由落體＋恢復係數 0.32 回彈＋壓扁＋波紋，當幀變紅）；②s6–s7 針測（探針卡固定，吸盤 XY 步進＋Z 升降阻尼過壓 0.12、探針受壓彎曲、電流測試機→排線→板→空間轉換器→探針，關的時候 4 幀變慢變淡；前 5 站慢動作每站 4 顆，之後整列快轉並標「快轉」；2D 地圖同一幀變色）；③s9 兩片同一場缺陷雨；④s11 雷射切 3 個熔絲（火花拋物線）→ 方塊圖訊號改道備用列 → 救回 1 顆（示意，不改大數字）。另有 s13 大晶片裂成 4 塊、壞塊拋物線飛走、好塊重力落入、4 塊落到底板回彈並壓一下。
- 2D 剖面／圖表：s3 缺陷特寫（微粒短路、線斷路）、s6–s7 晶圓地圖、s11 修補方塊圖、s12 良率－面積曲線（e^(−A/1000)，100 mm² 90.5%、800 mm² 44.9%）。
- 檢查：`npm run validate tech-yield` 0 error（layout-check 通過）；`node scripts/three/yield-check.mjs tech-yield`（新：逐幀用 SSR 畫 art，所有字／標籤／蓋章／卡片兩兩不重疊、不蓋主素材中央、不出舞台、不壓鉤子、沒有 NaN）＝**程式 1612 幀 0 筆**；人工看 12 格＋4 組運作抽格（各 4 格）0 筆。
- 抽格：`out/tech-yield-v1-12grid.png`、`out/tech-yield-ops-1..4.png`。

## 已知不足（v1）

- 驗收：這一版是製作者自己照 device-spec 驗收清單 A–D 逐條自查；美編（art-director）與結構工程師（mechanical-engineer）的獨立驗收還沒做（這個子工作階段沒有派 agent 的工具），要由 CEO 派。
- 探針台是 cabinet 式斜視（只有仰角），探針卡電路板畫成剖開的後半圈（才看得到空間轉換器與探針頭）；探針每站 48 根是示意。
- 針測慢動作從第一列「有 6 個以上整站」的列開始蛇行，最上面幾列（邊緣站只有 1–2 顆）放到最後快轉補測。
- 主素材下方部分畫面（面積對照、1 cm² 那一段）下半部留白偏多。
- 電流一站只亮 4 幀、關閉淡出 4 幀（每站 12 幀），沒有到 playbook 第 8 條的 0.3–0.5 秒。

## v2（2026/11/16，新念稿 8 段，成片完成）

- 成片 `out/tech-yield.v2.mp4`（不進 git）：53.23 秒、1597 幀；正片 −16.3 LUFS；片尾段 −11.5 LUFS、峰值 −1.3（G=28，AT 49.2、FADE 50.1）。已傳 Andy 待核准；美編與機構審查進行中。

- 配音：API 整篇 1 次（Iapetus、tech-b），原始說話 50.45 秒、246 字、純說話 4.74 字／秒 → 整篇 atempo 1.151（目標 5.46）；原檔 `public/audio/tech-yield/.take-7f1daeabc2.raw.orig.wav`；已 `tts-take --resplit`＋`align --force`。整篇信心 0.922；時間軸 1597 幀（53.23 秒）。
- 檢查：validate 0 error（5 warning，s8 旁白 33 字）；yield-check 程式 1482 幀 0 筆。
- 渲染：背景執行 `flock out/.render.lock env THREE_CONCURRENCY=4 node scripts/render.mjs tech-yield`，log 在 `out/tech-yield.render.log`。
- 下一步：渲染完成後做片尾音：`python3 scripts/three/sfx-logo-tech.py`＋`mix-endsting.sh`，G=28，AT＝(s11 的 cm cue 第 1484 幀 − 8)÷30＝49.2 秒；音源用 `out/tech-yield.video.mp4`；輸出 `out/tech-yield.v2.mp4`；量正片 −16 LUFS、片尾約 −11.5；人工抽格看重疊。

## v3（2026/11/16，Andy 選定配音 yield-t10）
- 配音：Andy 選定試聽檔 `out/voice-yield/yield-t10.wav`（整篇 1 次生成，念稿同現行 script.json），轉成 `.take-9f7b19174a.raw.orig.wav` 後 atempo 1.23（同曝光機）成 `.raw.wav`；`--resplit` 沿用原始音檔（0 次 TTS 請求）。舊檔備份 `out/tech-yield.take4-unused.wav`。
- 停頓（Andy 11-16：段落 0.6～0.8 秒、句間至少 0.3 秒）：s2、s6、s9、s10 設 `pauseAfter` 0.7（共 4 處，已超過舊規則「每支最多 3 處」，以 Andy 新規則為準；validate 未擋）；其餘幕間 0.40 秒以上。
- 總長 56.37 秒（1691 幀）；說話 52.47 秒。對齊整篇信心 0.913。已知：第一個字前約 0.5 秒有起頭呼吸聲（對齊警告），「現在的 AI 晶片」從 0.5 秒開口，建議人耳確認。
- 版面：`估算（簡化模型）` 標籤與「估算」章下移 12px，消除 62px 連續空白橫條（yield-check 0 筆）。
- 響度：正片 −16.1 LUFS；片尾段 −11.1 LUFS、峰值 −1.3（G=28，AT 52.10、FADE 53.23）。
- 成片：`out/tech-yield.v3.mp4`（不進 git）。公式卡 91% 約 26.8–27.6 秒停住。

## v4（2026/11/16，只修音軌，0 次 TTS 請求、不重渲畫面）
- 開頭「欸」：成片人聲軌 0～0.53 秒（「現」0.56 秒前 30 毫秒）整段換成靜音，時間不動。
- s11「先進封裝」：取備用配音 `out/tech-yield.take4-unused.wav` 的 54.66～55.55 秒（0.89 秒，邊界由 `fa.py` 與靜音點定出），atempo 1.23 → 0.727 秒，再 rubberband tempo 1.038 對齊成 0.70 秒（原位 50.04～50.74 秒），增益 ×0.64 對齊原區段 RMS，前後各 10 毫秒交叉淡化貼回。
- 片尾音：`G=28 bash scripts/three/mix-endsting.sh … 52.10 53.23 56.37`；畫面沿用 `out/tech-yield.mp4`（`-c:v copy`）。
- 響度：正片 −16.1 LUFS、片尾段 −11.1 LUFS、峰值 −1.3；成片 `out/tech-yield.v4.mp4`（不進 git）。待人耳確認這兩處。

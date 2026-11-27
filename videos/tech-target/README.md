# tech-target：濺鍍靶材（科技透明圈 系列 2 第 13 集；上一集 2-12 台灣自己的設備廠；下一集 2-14 前驅物）
- 狀態（2026/11/27 台北）：雙審前的完整無聲版。**未配音、未渲染、未審片**。12/15（二）18:00 發，留言關鍵字「靶材」。
- 產生：`python3 videos/tech-target/genscript.py`（先跑 gen-model.mjs）→ model.json＋script.json；無聲時間軸 `node scripts/three/silent-timeline.mjs tech-target` 後再跑一次 genscript。2D 卡 HudTarget.tsx（12 張）；Hud.tsx 已掛 `target-` 前綴；3D 貼圖 `node scripts/three/make-brand-tex.mjs tech-target flag:JP flag:US flag:TW "text:jx=JX 金屬|日本" "text:solstice=Solstice|美國" "text:solar=光洋科|1785"`。
- 12 幕＋片尾卡；念稿 302 字；無聲估 89 秒（配音後 atempo 約 78–80 秒）。開場 s1 第一個問號第 38 幀（約 1.3 秒）接上集。
- 運作動畫：s1 開場即在動（磁鐵轉、水流、離子）；s2 磁鐵旋轉；s3 冷卻水沿水路；s5 氬氣擴散＋離子加速＋原子飛出；s6 原子餘弦散開＋薄膜三階段；s7 電子跑道＋磁場線；s8 侵蝕溝四階段＋換靶；s9–s10 精煉、真空爐抽錠、軋機、車床、壓合。
- 檢查：validate 0 error；layout-check 0 error；card-overlap 0／0；kinematics-check 0；flow-check 0。keyframes：out/tech-target/rounds/keyframes-r0.png（不 commit）。
- 已知：公司 LOGO 三家抓不到（見 assets.md）；軋機板厚變化用兩段淡換（時間快轉示意）；電漿輝光顏色為示意；氬、軋、前驅物讀音待配音後人耳確認。
## Andy 修正清單自查（第 1～24 條）
| # | 結果 |
|---|---|
| 1,3,12,14,21–24 | 不適用（未配音）；配音前先讀金手指並先給試聽 |
| 2 | 念稿避開上、量測；JX 念 J X；validate 替身字表 0 |
| 4 | 國旗程式繪製；LOGO 抓不到，改文字名牌並已說明 |
| 5,16,17,20 | 符合：陰極 14 模組＋5 站，每項 ≥4 細節、爆炸分解（待審片評分） |
| 6,8 | 待審片人評分（未達 8 分不渲染） |
| 7 | 不適用 |
| 9 | 渲染後先給 Andy |
| 10 | 符合：s1 接上集＋問號 |
| 11 | 本集無地圖（未畫台灣輪廓） |
| 13 | 每幕 ≥4.6 秒；標籤 ≥1.5 秒且不重疊；鏡頭 ≥2 秒（腳本檢查） |
| 15 | 氣體、離子加速、原子餘弦、稠焊料、液體冷卻已照規格 |
| 18 | 念稿無縮寫術語 |
| 19 | 已讀扣分紀錄：標籤錨點綁零件、組回停住、細節密度 |

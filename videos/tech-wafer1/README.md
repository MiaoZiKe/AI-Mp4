# tech-wafer1：矽晶圓-1：一塊砂怎麼變成晶圓（科技透明圈 系列 2「代工的供應商」第 1 集；下一集矽晶圓-2：台灣誰在做）
- 狀態（11/24）：樣片。研究、腳本、建模、2D 卡完成；配音 07:00 後做。
- 產生：`python3 videos/tech-wafer1/genmodel.py`（自動先跑 genscript.py）→ model.json＋script.json。改稿只改 genscript.py；改畫面只改 genmodel.py／HudSi.tsx。
- 2D 卡：`src/components/three/HudSi.tsx`（si-hook／mg／pure／siem／melt／cz／saw／pol／size／co／next），Hud.tsx 只加 import 與一行分派。
- 主素材框：所有層 bg，另放看不見的 px_arc／px_lat／px_sie／px_czm／px_czc／px_saw／px_pol／px_k／px_all（每段只亮鏡頭對準的那一個）。標籤多數手動定位（labels[].xy）。
- 留言關鍵字「拉晶」（schedule_1203.md；蓋掉 lessons 77 的通用「透明圈」）。

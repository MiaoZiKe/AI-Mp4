# tech-mask1：光罩-1：晶片的底片（科技透明圈 系列 2「代工的供應商」第 3 集；下一集光罩-2：誰做光罩、怎麼運送）
- 狀態（11/23）：前段完成（研究、腳本、建模、2D 卡、無聲時間軸 layout 0 error、card-overlap 0/0）；配音、渲染等通知再做。
- 產生：`python3 videos/tech-mask1/genmodel.py`（自動先跑 genscript.py）→ model.json＋script.json。改稿只改 genscript.py；改畫面只改 genmodel.py／HudMask1.tsx。
- 2D 卡：`src/components/three/HudMask1.tsx`（mk1-hook／cr／duv／x4／euv／ml／abs／pel／cost／co／next），Hud.tsx 只加 import 與一行分派。
- 鏡頭：`fit()` 依主素材框 px_d／px_dm／px_g／px_e／px_h／px_l／px_b 自動算距離與高度；配音後重跑 align → genmodel.py 即可對上。
- 留言關鍵字「光罩」（schedule_1203.md）。

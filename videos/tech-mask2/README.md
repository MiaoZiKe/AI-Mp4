# tech-mask2：光罩-2：誰做光罩、怎麼運送（科技透明圈 系列「代工的供應商」第 4 集；上一集光罩-1；下一集光阻-1：照到光就會變的膠）
- 狀態（11/24）：前段完成（研究、腳本、建模、11 張 2D 卡、無聲時間軸）。**配音與渲染等通知才做**。12/6（日）20:00 發。
- 產生：`python3 videos/tech-mask2/genmodel.py`（自動先跑 genscript.py）→ model.json＋script.json。改稿只改 genscript.py；改畫面只改 genmodel.py／HudMask2.tsx。
- 2D 卡：`src/components/three/HudMask2.tsx`（mk2-hook／cap／mer／tw／eb／mb／ins／pod／vac／co／next），Hud.tsx 只加 import 與一行分派。
- 檢查（無聲時間軸）：layout-check 0 error（1 warning＝全片共用的「IG 底部出處列」）、card-overlap 0 error 0 warning。
- 留言關鍵字「光罩盒」（依本集交辦）。

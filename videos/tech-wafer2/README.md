# tech-wafer2：矽晶圓-2：台灣誰在做（科技透明圈 系列 2「代工的供應商」第 2 集；上一集矽晶圓-1；下一集光罩-1：晶片的底片）
- 狀態（11/23）：前段完成（研究、腳本、建模、2D 卡、無聲時間軸）。配音與渲染等通知（渲染機同時只跑一支）。
- 產生：`python3 videos/tech-wafer2/genmodel.py`（自動先跑 genscript.py）→ model.json＋script.json。改稿只改 genscript.py；改畫面只改 genmodel.py／HudEpi.tsx。
- 2D 卡：`src/components/three/HudEpi.tsx`（w2-hook／pol／cvd／grow／dope／size／co／next），Hud.tsx 只加 import 與一行分派（kind 以 w2- 開頭），不動 HudSi.tsx。
- 主素材框：px_ew（磊晶爐）／px_ec（晶圓近景）／px_kp（拋光晶圓）／px_kall（晶圓桌）／px_lat（原子）／px_m（光罩），每段只亮一個。標籤手動定位（labels[].xy）。
- 驗證（無聲時間軸）：layout-check 0 error（1 warning＝IG 底部出處列，規則允許）；card-overlap 0 error、0 warning；validate 0 error。
- 留言關鍵字「磊晶」（Andy 本集指定）。

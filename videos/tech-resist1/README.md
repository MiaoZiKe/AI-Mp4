# tech-resist1：光阻-1：照到光就會變的膠（科技透明圈 系列 2「代工的供應商」第 5 集；下一集光阻-2：塗佈顯影機）
- 狀態（11/23）：前段完成（研究、腳本、建模、14 張 2D 卡、無聲時間軸）；**不配音、不渲染**，等通知做後段。
- 產生：`python3 videos/tech-resist1/genscript.py` → `node scripts/ui/silent-timeline.mjs tech-resist1 --force`（配音後改跑 tts-take --resplit＋align --force）→ `python3 videos/tech-resist1/genmodel.py`（自動再跑 genscript、把各幕 props 併進 script.json）。改稿只改 genscript.py；改畫面只改 genmodel.py／HudResist.tsx。
- 2D 卡：`src/components/three/HudResist.tsx`（kind 以 pr1- 開頭，14 張），Hud.tsx 只加 import 與一行分派。
- 主素材框：所有層 bg，另放看不見的 px_a／px_a2／px_b／px_br／px_bn／px_c／px_d／px_e／px_f／px_t（每段只亮鏡頭對準的那一個）。標籤一律手動放頂端兩格（xy [300,300]／[780,300]），鏡頭用 `S()` 把主體放在 y≈380–910。
- 檢查（11/23）：layout-check 0 error、1 warning（IG 底部出處列，固定版面每支都有）；card-overlap 0 error、0 warning；validate 0 error。
- 留言關鍵字「光阻」（派工指定；lessons 77 寫 11/27 後新片一律「透明圈」，待 CEO 確認）。

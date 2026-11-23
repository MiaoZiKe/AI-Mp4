# tech-resist2：光阻-2：塗上去、洗出來的機器（科技透明圈 系列「代工的供應商」第 6 集；上一集光阻-1；下一集設備五大-1：ASML）
- 狀態（11/24）：前段完成（研究、腳本、建模、12 張 2D 卡、無聲時間軸檢查）。**未配音、未渲染**，等通知再做後段。12/8（二）20:00 發。
- 產生：`python3 videos/tech-resist2/genmodel.py`（自動先跑 genscript.py）→ model.json＋script.json。改稿只改 genscript.py；改畫面只改 genmodel.py／HudTrk.tsx。配音後：tts-take --resplit → align --force → 重跑 genmodel.py（cue 自動對上）→ 再跑 layout-check／kinematics-check（手臂搬運的時程跟著 cue，語速變了要確認夾取不撞到還在轉的晶圓）。
- 2D 卡：`src/components/three/HudTrk.tsx`（trk-hook／flow／coat／thick／sb／exp／peb／dev／wait／co／tw／next），Hud.tsx 只加 import 與一行分派。
- 手臂：零件庫 arm＋自算反運動學（genmodel.py 的 ik/leg），每一趟一個被夾的晶圓圖層，放下那一幀換成下一站的同樣晶圓。杯子、蓋子用板子拼（不用 tube），因為 kinematics-check 用包圍盒判斷穿模。
- 主素材框：所有層 bg（含零件庫手臂的 a_arm、rb_grip），另放看不見的 px_all／px_c／px_cw／px_h1／px_if／px_h2／px_d（8 個角的小方塊，手臂不會撞到）。
- 留言關鍵字「顯影」（派工指定）。

# tech-mask1：光罩-1：晶片的底片（科技透明圈 系列 2「代工的供應商」第 3 集；下一集光罩-2：誰做光罩、怎麼運送）
- 狀態（11/24）：成片 v1 完成（57.0 秒），見文末「11/24 配音與成片」。
- 產生：`python3 videos/tech-mask1/genmodel.py`（自動先跑 genscript.py）→ model.json＋script.json。改稿只改 genscript.py；改畫面只改 genmodel.py／HudMask1.tsx。
- 2D 卡：`src/components/three/HudMask1.tsx`（mk1-hook／cr／duv／x4／euv／ml／abs／pel／cost／co／next），Hud.tsx 只加 import 與一行分派。
- 鏡頭：`fit()` 依主素材框 px_d／px_dm／px_g／px_e／px_h／px_l／px_b 自動算距離與高度；配音後重跑 align → genmodel.py 即可對上。
- 留言關鍵字「光罩」（schedule_1203.md）。

## 11/24 配音與成片
- 配音前刪字（念稿 268→254 字，無聲估算 64.0→60.7 秒；事實與來源標示不變）：s2「是一片石英玻璃」→「是石英玻璃」、「電路就刻在」→「電路刻在」；s3「圖案就被光帶下去」→「圖案就帶下去」；s4「接著」→「再」；s5 刪「根本」；s6「四十對左右」→「約四十對」；s7「圖案就留在」→「圖案留在」；s8 刪「還」；s9 刪「一顆」、「一整套」→「一套」；s10「就是」→「是」、「日本的」→「日本」。
- 配音：gemini-2.5-flash-preview-tts＋Iapetus＋說明 B（tech-b），整篇 1 次請求（tts-requests.json 1 筆，TTS_NO_RETRY=1）。原始 65.45 秒（`out/tech-mask1-take.orig.wav`），靜音（−40 dB、≥0.16 秒）11.09 秒 → 純說話 254÷54.36＝4.67 字/秒；倍數 5.75÷4.67＝1.23（未超過上限 1.25）→ 純說話約 5.75 字/秒。音高中位數 121.5 Hz（voice-measure.py）。對齊整篇信心 0.945。
- 一條龍：`bash scripts/three/make-tech.sh tech-mask1 --take=out/tech-mask1-take.orig.wav --atempo=1.23 --ver=v1` → `out/tech-mask1.v1.mp4`（57.03 秒、正片 −15.8 LUFS、片尾 −11.2 LUFS），複製成 `out/tech-mask1.mp4`。第一次渲染遇容器重啟中斷，清掉殘留鎖檔後同參數重跑（不送 TTS），渲染 08:57–09:30。配音後重跑 genmodel.py（script.json／model.json 無變化）。
- 檢查：layout-check 0 error（1 warning＝IG 底部出處列）、card-overlap 0/0、flow-check 0（16 條）、kinematics 0；verify4：1、3 過，2（ASR 各→鉻、目→鉬＝替身字；Gemini 輕微「套」偏濁）與 4（52、53 秒片尾 LOGO 動畫）經人工判讀為誤判（out/tech-mask1/verify4/human.md）。
- 預覽：out/preview/tech-mask1-sheet.png、tech-mask1-close-duv／euv／pellicle.png。

## 11/24 v2 畫面優化（旁白、配音、時間軸不動）
- 依據：Andy「光罩-1 聲音 OK，但影片也需要優化」＋光罩-2 回饋（國旗、LOGO、動畫要專業）＋審片報告 docs/reviews/2026-11-24-wafer-mask-review.md（必改 5 條）。
- s1 鉤子大字：第 0 幀「一套上千萬美元」（kicker「晶片的底片＝光罩」；s9 的數字提前，旁白不改）。
- s2–s3 等：hud.readoutPlate＝讀數與尺標墊底板（原本被機架與晶圓台吃掉）。
- s4：mk1-x4 卡右上 ASML 官方 LOGO＋荷蘭國旗（出處「光罩設計手冊」）。
- s6：加標籤「極紫外光源」。s8：灰塵放大一倍。
- s9：L 站重做：三座光罩架（每座 14 片同款光罩：石英板＋鉻圖樣＋護膜框、插槽留縫）依序出現；前面缺陷檢查機（花崗岩底座、XY 平台、龍門、光學頭帶檢查光掃過、螢幕缺陷地圖）；念「不能有缺陷」光罩上與螢幕上紅點同步閃；念「上千萬美元」三座架子依序亮；標籤「×60–100 (est.)」；鏡頭拉近（框寬 16.4→13.8）。
- s10：B 站重做：兩個透明運送盒（插槽、各 8 片空白光罩，側面看得到玻璃／多層膜／吸收層）；前面一片拆開距離加大；念「極紫外光用的」紫光打進縫裡在多層膜上彈回；念「日本」兩盒輕跳、念「豪雅」「旭硝子」各自再跳＋亮；標籤加官方 LOGO＋日本國旗；mk1-co 卡兩家改白框＋官方 LOGO、底列加日本國旗；鏡頭拉近。
- s11 出處列「series_plan 系列 2 第 4 集」→「下一集：光罩-2」。
- LOGO／國旗來源：assets.md；共用元件 src/components/three/Brand.tsx。

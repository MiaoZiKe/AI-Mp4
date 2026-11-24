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

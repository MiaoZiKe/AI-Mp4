# tech-mask2：光罩-2：誰做光罩、怎麼運送（科技透明圈 系列「代工的供應商」第 4 集；上一集光罩-1；下一集光阻-1：照到光就會變的膠）
- 狀態（11/24）：成片 v1 完成（60.1 秒），見文末「11/24 配音與成片」。12/6（日）20:00 發。
- 產生：`python3 videos/tech-mask2/genmodel.py`（自動先跑 genscript.py）→ model.json＋script.json。改稿只改 genscript.py；改畫面只改 genmodel.py／HudMask2.tsx。
- 2D 卡：`src/components/three/HudMask2.tsx`（mk2-hook／cap／mer／tw／eb／mb／ins／pod／vac／co／next），Hud.tsx 只加 import 與一行分派。
- 檢查（無聲時間軸）：layout-check 0 error（1 warning＝全片共用的「IG 底部出處列」）、card-overlap 0 error 0 warning。
- 留言關鍵字「光罩盒」（依本集交辦）。

## 11/24 配音與成片
- 配音前刪字（念稿 263→253 字，無聲估算 63.0→60.9 秒；事實與來源標示不變）：s1「上一集」→「上集」、「晶片的底片」→「晶片底片」；s4「成熟製程的光罩」→「成熟製程光罩」；s5「鍍鉻的石英板」→「鍍鉻石英板」；s7「因為光罩上一個瑕疵」→「因為一個瑕疵」；s9「真空機台裡」→「真空機台」；s10「美國的英特格和台灣的家登」→「美國英特格和台灣家登」。2D 卡文字未改。
- 配音：gemini-2.5-flash-preview-tts＋Iapetus＋說明 B（tech-b），整篇 1 次請求（tts-requests.json 1 筆，TTS_NO_RETRY=1）。原始 70.89 秒（`out/tech-mask2-take.orig.wav`），靜音（−40 dB、≥0.16 秒）13.96 秒 → 純說話 253÷56.93＝4.44 字/秒；倍數 5.75÷4.44＝1.29 → 取上限 1.25 → 純說話約 5.56 字/秒。音高中位數 121.8 Hz（voice-measure.py）。對齊整篇信心 0.912。
- 一條龍：`bash scripts/three/make-tech.sh tech-mask2 --take=out/tech-mask2-take.orig.wav --atempo=1.25 --ver=v1` → `out/tech-mask2.v1.mp4`（60.13 秒、1804 幀、正片 −15.9 LUFS、片尾 −10.8 LUFS），複製成 `out/tech-mask2.mp4`。渲染 09:36–10:06（清掉殘留鎖檔後跑）。配音後重跑 genmodel.py（script.json／model.json 無變化）。
- 檢查：layout-check 0 error（1 warning＝IG 底部出處列）、card-overlap 0/0、flow-check 0（20 條）、kinematics 0；verify4：1、3 過，2（ASR 各→鉻替身字、上集→上期、一筆一筆、還得要；Gemini 0 處）與 4（55 秒片尾 LOGO 動畫）經人工判讀為誤判（out/tech-mask2/verify4/human.md）。
- 預覽：out/preview/tech-mask2-sheet.png、tech-mask2-close-ebeam／inspect／vacuum.png。

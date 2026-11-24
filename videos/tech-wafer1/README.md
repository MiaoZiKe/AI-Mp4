# tech-wafer1：矽晶圓-1：一塊砂怎麼變成晶圓（科技透明圈 系列 2「代工的供應商」第 1 集；下一集矽晶圓-2：台灣誰在做）
- 狀態（11/24）：樣片。研究、腳本、建模、2D 卡完成；配音 07:00 後做。
- 產生：`python3 videos/tech-wafer1/genmodel.py`（自動先跑 genscript.py）→ model.json＋script.json。改稿只改 genscript.py；改畫面只改 genmodel.py／HudSi.tsx。
- 2D 卡：`src/components/three/HudSi.tsx`（si-hook／mg／pure／siem／melt／cz／saw／pol／size／co／next），Hud.tsx 只加 import 與一行分派。
- 主素材框：所有層 bg，另放看不見的 px_arc／px_lat／px_sie／px_czm／px_czc／px_saw／px_pol／px_k／px_all（每段只亮鏡頭對準的那一個）。標籤多數手動定位（labels[].xy）。
- 留言關鍵字「拉晶」（schedule_1203.md；蓋掉 lessons 77 的通用「透明圈」）。

## 11/24 配音與成片
- 配音（旁白金手指）：gemini-2.5-flash-preview-tts＋Iapetus＋說明 B（tech-b），整篇 1 次請求（tts-requests.json 1 筆）。原始 68.69 秒（備份 `.take-5b2c67d682.raw.orig.wav`），靜音（−40 dB、≥0.16 秒）16.04 秒 → 純說話 258÷52.65＝4.90 字/秒；整篇 atempo 1.173 → 純說話約 5.75 字/秒。音高中位數 135.6 Hz（voice-measure.py；金手指基準檔不在這台機器，沒同工具比）。對齊整篇信心 0.898。
- 一條龍：`bash scripts/three/make-tech.sh tech-wafer1 --take=<orig> --atempo=1.173` → `out/tech-wafer1.v1.mp4`（61.77 秒、正片 −15.9 LUFS、片尾 −11.0 LUFS），複製成 `out/tech-wafer1.mp4`。渲染約 42 分鐘（07:06–07:48）。
- 檢查：layout-check 0 error、card-overlap 0/0、flow-check 0；verify4：1、3 過，2、4 程式標記經人工判讀為誤判（out/tech-wafer1/verify4/human.md）。
- 環境：這台機器沒有 .venv，已建（torch 2.6.0 CPU 版＋transformers 等，scripts/fa-requirements.txt）。

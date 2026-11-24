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

## 11/24 v2：重配（音高關卡）＋審片必改（渲染待審片人 ≥8 分）
- 原因：Andy 11/24 聽出矽晶圓與光罩旁白音色差很多（v1 音高 137 Hz，基準 121.5 Hz）。
- 配音：`bash scripts/three/tts-pitch-take.sh tech-wafer1`，3 次請求：137.1 ✖、140.4 ✖、123.7 ✔（`videos/tech-wafer1/tts-pitch.json`；退件檔 out/tech-wafer1-take-reject-1／2.wav）。純說話 258 字 ÷（63.97−7.96）＝4.61 字/秒 → atempo 1.248 → 片長約 56.2 秒。
- 審片必改（docs/reviews/2026-11-24-wafer-mask-review.md）：s10 主畫面換成五棟晶圓廠（後排信越、環球晶、世創；前排勝高、SK），念到哪家落下哪棟、窗帶亮，念「超過八成」晶圓盒沿路送到集貨台；標籤加國旗；2D 卡每列國旗＋官方 LOGO（信越、世創；其他抓不到見 assets.md）；s11 晶圓慢轉＋後方台灣三棟廠（台灣旗）；s1 鉤子標題「純度 11 個 9」、標籤延到 how 才進；s5 鏡頭對準爐體；出處拿掉 series_plan。晶格站移到 x=-26、五家廠在 x=125（免得鏡頭橫移時掃過晶格）。
- 檢查：layout-check 0 error、card-overlap 0/0、validate 0 error。國旗／LOGO 全程不透明（未輪到細灰框、輪到粗框＋放大）。
- 成片 v2（11/24 13:33）：`out/tech-wafer1.v2.mp4`（56.23 秒、正片 −16.0 LUFS、片尾 −11.0 LUFS），複製成 `out/tech-wafer1.mp4`。無聲版審片三輪 7.6 → 7.9 → 8.3（docs/reviews/2026-11-24-tech-wafer1.md）。2D 卡勝高 LOGO 已用上（3D 廠牌仍是文字名牌，下次重產 genmodel 會換成原檔）。
- verify4：1、3 過；2 聽感請求兩次「回應無法解析」未驗，ASR 4 處需人耳確認（0:02、0:04.6 砂→沙；0:26.3 浸→進；0:52.7 資料→字卡）；4 標 52 秒＝片尾卡 LOGO 動畫誤判。見 out/tech-wafer1/verify4/human.md。
- 預覽：out/preview/tech-wafer1-sheet.png（每秒一格）、tech-wafer1-close-puller／saw／fabs.png。

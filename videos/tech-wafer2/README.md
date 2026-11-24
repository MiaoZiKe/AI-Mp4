# tech-wafer2：矽晶圓-2：台灣誰在做（科技透明圈 系列 2「代工的供應商」第 2 集；上一集矽晶圓-1；下一集光罩-1：晶片的底片）
- 狀態（11/24）：成片 v1 完成（58.4 秒），見文末「11/24 配音與成片」。
- 產生：`python3 videos/tech-wafer2/genmodel.py`（自動先跑 genscript.py）→ model.json＋script.json。改稿只改 genscript.py；改畫面只改 genmodel.py／HudEpi.tsx。
- 2D 卡：`src/components/three/HudEpi.tsx`（w2-hook／pol／cvd／grow／dope／size／co／next），Hud.tsx 只加 import 與一行分派（kind 以 w2- 開頭），不動 HudSi.tsx。
- 主素材框：px_ew（磊晶爐）／px_ec（晶圓近景）／px_kp（拋光晶圓）／px_kall（晶圓桌）／px_lat（原子）／px_m（光罩），每段只亮一個。標籤手動定位（labels[].xy）。
- 驗證（無聲時間軸）：layout-check 0 error（1 warning＝IG 底部出處列，規則允許）；card-overlap 0 error、0 warning；validate 0 error。
- 留言關鍵字「磊晶」（Andy 本集指定）。

## 11/24 配音與成片
- 配音（旁白金手指）：gemini-2.5-flash-preview-tts＋Iapetus＋說明 B（tech-b），整篇 1 次請求（tts-requests.json 1 筆）。原始 69.05 秒（備份 `out/tech-wafer2-take.orig.wav`），靜音（−40 dB、≥0.16 秒）8.83 秒 → 純說話 274÷60.22＝4.55 字/秒；倍數 5.75÷4.55＝1.264 超過上限，用 atempo 1.25 → 純說話約 5.69 字/秒。音高中位數 135.6 Hz（voice-measure.py）。對齊整篇信心 0.889。
- 一條龍：`bash scripts/three/make-tech.sh tech-wafer2 --take=out/tech-wafer2-take.orig.wav --atempo=1.25 --ver=v1` → `out/tech-wafer2.v1.mp4`（58.43 秒、正片 −16.1 LUFS、片尾 −10.5 LUFS），複製成 `out/tech-wafer2.mp4`。渲染約 32 分鐘（08:05–08:37）。配音後重跑 genmodel.py（script.json／model.json 無變化）。
- 檢查：layout-check 0 error（1 warning＝IG 底部出處列）、card-overlap 0/0、flow-check 0、kinematics 0；verify4：1、3 過，2（ASR 再→在、占→佔同音異體）與 4（53、54 秒片尾 LOGO 轉場）經人工判讀為誤判（out/tech-wafer2/verify4/human.md）。
- 預覽：out/preview/tech-wafer2-sheet.png、tech-wafer2-close-reactor／atoms／table.png。

## 11/24 v2：重配（音高關卡）＋審片必改（渲染待審片人 ≥8 分）
- 配音：`tts-pitch-take.sh`，1 次請求 122.8 Hz ✔。純說話 274 字 ÷（70.69−4.68）＝4.15 字/秒 → 倍數上限 1.25（純說話約 5.2 字/秒，低於 5.75）→ 片長 62.8 秒。
- 審片必改：s7–s10 改成台灣四棟晶圓廠（x=138），每棟門口放主力產品（環球晶 12 吋晶圓疊、台勝科晶圓盒、合晶 6／8 吋晶圓疊、嘉晶矽／碳化矽／氮化鎵三片），念到哪家鏡頭推過去、廠房落下；標籤加台灣旗，台勝科另標「日本勝高（合資）」日本旗；合晶只留一個公司標籤（另一個改成「6 吋＋8 吋」）；2D 卡每列國旗（台勝科台＋日）＋LOGO 位置（四家都抓不到原檔，見 assets.md）；s11 光罩預告照比例重做（6 吋方形光罩在曝光機光罩台上、光往下穿過鏡筒打到晶圓）；s1 標題「1100°C 長一層矽」、沉積粒子第 0 幀就在動；s2 拋光晶圓先遠後近、加倒角環與雷射刻號；s6 8／6 吋加開放式晶圓匣；s3 溫度數字提早 1 秒；出處拿掉 series_plan。
- 檢查：layout-check 0 error、card-overlap 0/0。

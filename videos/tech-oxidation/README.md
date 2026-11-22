# tech-oxidation：氧化與熱處理（科技透明圈系列 1 第 10 支；接清洗，下一支光阻塗佈與顯影）
- 狀態（11/21）：研究、腳本、配音（新金手指）、對齊、建模、2D 卡完成，成片 `out/tech-oxidation.mp4`（70.9 秒、2127 幀、1080×1920、整片 −15.6 LUFS）、每 4.5 秒縮圖 `out/tech-oxidation-grid.jpg`（16 格，不進 git）；11/21 09:57 渲完（9 段，每段約 8 分鐘）。
- 片長：時間軸 70.9 秒（2127 幀，含 3.2 秒片尾卡 s12）。留言關鍵字「氧化」。
- 產生：`python3 videos/tech-oxidation/genmodel.py`（自動先跑 genscript.py）→ model.json＋script.json。改稿只改 genscript.py；改畫面只改 genmodel.py／HudOx.tsx。
- 2D 卡：`src/components/three/HudOx.tsx`（ox-hook／grow／dw／batch／dmg／act／diff／spike／laser／co／next），Hud.tsx 只加 import 與一行分派。
- 配音（旁白金手指 2026/11/21 版）：gemini-2.5-flash-preview-tts＋Iapetus＋說明 B（profile tech-b，不寫 styleMode），念稿 `docs/prompts/tech-oxidation-旁白.txt`。TTS 請求 1 次（`TTS_NO_RETRY=1`；tts-requests.json 1 筆）；另用 `--asr` 做 1 次整篇聽寫（文字模型，不是 TTS）。
- 後製：只整篇 atempo 1.25（上限；原檔 `.take-b836ca9ffe.raw.orig.wav` 80.97 秒）。silencedetect（−40 dB、≥0.16 秒）量：原始純說話 334÷(80.97−5.37)＝4.42 字/秒 → 334÷(64.77−4.04)＝5.50 字/秒（目標 5.6–5.9，被 1.25 上限卡住，差 0.1）。
- 對齊：整篇信心 0.897；低信心字在 s1、s2、s4、s8（最低字 <0.01），聽寫是對的。聽寫疑似念錯：s5「佈植」聽成「不值」、s7「電晶體」聽成「晶體」、「迪恩士」聽成 DNS、「雷射」聽成「激光」（聽寫模型偏中國用語）。要人耳確認。
- 片尾音：`G=22 mix-endsting.sh public/audio/tech-oxidation/voice.wav out/tech-oxidation.sting.wav 65.8667 67.7667 70.9 out/tech-oxidation.final.wav`（片尾段 −11.5 LUFS、峰值 −1.1 dBFS）。
- 渲染：`AUDIO=out/tech-oxidation.final.wav CONC=2 bash scripts/three/chunk-render.sh tech-oxidation final`，再複製成 out/tech-oxidation.mp4。
- 檢查：validate 0 error；layout-check 0 error；card-overlap 0 error 0 warning（11 張、72 個時間點）；flow-check 10 條 0 error。
- 主素材框：所有層 bg，另放看不見的 px_furn／px_rtp／px_laser／px_lat／px_all（每段只亮鏡頭對準的那一個）。標籤手動定位（labels[].xy）：s2 晶舟、s6 兩張、s10 兩張。
- 台灣相關：查不到台灣自製量產的爐管或雷射退火設備（research.md 第 13 組），只寫台積電是國際電氣的客戶（科技新報）。ASM 中文名只查到一則，不念，卡片寫英文。

## 11/22 重配 v2（「矽」念錯，Andy 11/22 18:45 同意重配）
- 根因：念稿寫「夕」被念成一聲 xī（大陸讀音）。改成念稿寫「細」（表面的細、二氧化細；兩岸都念第四聲 xì），字幕維持「矽」；genscript.py 改 `.replace("矽", "細")`。
- 配音：旁白金手指（2.5＋Iapetus＋tech-b），TTS 請求 2 次：第 1 次錄音結尾「解說」被截斷（最後 0.2 秒仍 −14 dBFS 就斷，audio-check 斷音 1），作廢（備份 `out/new-tech-oxidation-take1-1122/`）；第 2 次（`.take-4c3cc53338`，原始 90.81 秒，備份 `.raw.orig.wav`）原始音高中位數 106.5 Hz（金手指 113.7，−6.3%）、純說話 4.87 字/秒；整篇 atempo 1.181 → 純說話 5.75、含停頓 4.34。align 整篇信心 0.90；時間軸 80.53 秒（2416 幀，比舊版長 9.6 秒：這次錄音停頓較多，照規則不剪停頓）。
- 片尾音：`G=22 mix-endsting.sh voice.wav out/tech-oxidation.sting.wav 75.2667 77.4 80.5333 out/tech-oxidation.v2.wav`（片尾段 −11.1 LUFS、峰值 −1.3 dBFS；audio-check 全 0）。
- 渲染：`AUDIO=out/tech-oxidation.v2.wav CONC=2 bash scripts/three/chunk-render.sh tech-oxidation v2` → `out/tech-oxidation.v2.mp4`（舊檔不動）。
- 試聽：`out/voice-compare/1122/氧化-重配-前20秒.m4a`、`氧化-矽-修正後.m4a`。
- 成片：`out/tech-oxidation.v2.mp4`（80.53 秒，11/23 03:25 渲完）。四道驗證第 1 道抓到 41.8 秒逗號停頓 0.50 秒（上限 0.45）：成品音軌剪 0.07 秒、補進 45.4 秒的換幕停頓，時間軸不變，只重 mux（修前 `out/tech-oxidation.v2.pre-pausefix.wav`）。修後 1、3 過、audio-check 全 0；2 的「矽」差異消失，其餘誤判；4 只標片尾卡轉場。結論在 `out/tech-oxidation/verify4/human.md`。

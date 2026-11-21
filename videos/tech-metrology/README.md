# tech-metrology：量測與檢測（科技透明圈，接化學機械研磨；預定 11/29 日 18:00）
前製（Sonnet）：研究、腳本、畫面規格、配音、對齊。建模與成片（Opus，2026/11/20）：`genmodel.py`→model.json（六站：T 量測島 x=0、F 膜厚 x=60、E 電子束線寬 x=120、O 疊對 x=180、D 缺陷檢測 x=240、P 線路疊層 x=300）、`genscript.py`→script.json（旁白／字幕／cue 未改，只補各幕 props）、`gensync.py`→sync-table.md；2D 卡 `src/components/three/HudMet.tsx`（kind 以 met- 開頭，9 張）。成片 `out/tech-metrology.v1.mp4`（分段渲染，音軌＝voice.wav＋片尾招牌音 `out/tech-metrology.v1.wav`）。
- 片長：時間軸 67.9 秒（2038 幀，含 3.2 秒片尾卡）；旁白 9 幕＋片尾卡 s10。留言關鍵字「量測」；片尾預告系列下一支「離子佈植」。
- 配音：Iapetus＋tech-b，整篇 1 次請求（tts-requests.json 1 筆，原始 76.53 秒、含停頓 4.00 字/秒）。
- 聲音統一（#56）：以 `.take-e1796e78d6.raw.orig.wav`（未動原檔）為源，先把 ≥0.7 秒的句中停頓（2 處，0.73）修到 0.65，再 `asetrate=0.895 倍,aresample=24000,atempo=1.3408`（音高約 −1.9 半音、整體 ×1.20）。成片音軌 `voice.wav` 量測：含停頓 4.72 字/秒（基準 4.7，+0.4%）、音高中位數 116.5 Hz（基準 114.6，+1.7%）；段落間停頓最長 0.70 秒。整體加速 1.20（未超過 1.25）。
- 對齊：整篇信心 0.95，不合格幕 0；s9「矽」念稿寫「夕」，字幕維持「矽」，所以字幕對字有 1 字未對上，屬預期。
- 驗證：validate 只剩「缺 model.json」1 個 error（3D 相關，待建模）；layout-check 需 model.json 才能跑。
- 檔案：`research.md`（查證 2026/11/20）、`script.json`（genscript.py 產生）、`visual-spec.md`、`pronunciation.md`、念稿 `docs/prompts/tech-metrology-旁白.txt`。
- 待人耳確認：「量量看」「疊對」「科磊」「曝光機」。
- 前製復盤：①鉤子用「兩奈米」＋問句，接 CMP 片尾；②科磊、艾司摩爾的中文名只有 WebSearch 摘要出處，審稿時請再看一眼；③稿子 306 字，原始 4.0 字/秒，後製只要 1.20 倍，比 tech-cmp（1.30）順；④公司只列有來源的 6 家，台灣華洋精機（光罩）與牧德（晶圓外觀）要在畫面分清楚。

## v2（2026/11/21，旁白金手指＝本片「原來規則」版）
- Andy 11/21 聽完比較後指定「量測-原來規則-整篇」當科技頻道旁白金手指（`docs/prompts/tech-旁白金手指.md`）；3.8 版（gold）停用，成片 `out/tech-metrology.gold.mp4` 保留。
- 配音：`voice` 改回 2.5＋Iapetus＋tech-b（雜湊 e1796e78d6，與 be791b6 相同）；原始錄音 `.take-e1796e78d6.raw.orig.wav`、成品 `.raw.wav`（×1.20）沿用，`tts-take --resplit` → `ALIGN_PROVIDER=fa align --force`，0 次 TTS 請求。語速（≥0.16 秒、−40 dB 靜音扣掉）：純說話 5.77 字/秒、含停頓 4.81。
- 時間軸 2038 幀（與 v1 相同），音軌沿用 `out/tech-metrology.v1.wav`（voice.wav＋片尾招牌音，voice.wav 與 v1 位元相同）。
- 2D 示意卡（11/20 重疊修正後）card-overlap 0 error、layout-check 0 error；met-co 卡 y955／h310 已寫進 genscript.py。
- 成片 `out/tech-metrology.v2.mp4`（整支分段重渲，`AUDIO=out/tech-metrology.v1.wav bash scripts/three/chunk-render.sh tech-metrology v2`）；gold 的分段移到 `out/chunks/tech-metrology-gold/`。
- 11/21 標籤退件修正（Andy：s3 兩框貼在一起、表面反射壓光束；s8 日立／應用材料互疊；s4 邊緣框蓋 3D 方塊）：genscript.py 的 `lab(..., xy=[...])` 固定位置；「邊緣：電子特別多」→「邊緣最亮」、s8 改公司名並排（細節在「誰在做」卡）。layout-check 新增標籤間距與引線穿過檢查，本片 0。只重渲 0–1679 幀（7 段），接回 `out/tech-metrology.v2.mp4`，前一版備份 `out/tech-metrology.v2.prev.mp4`。

# tech-metrology：量測與檢測（科技透明圈，接化學機械研磨；預定 11/29 日 18:00）
前製完成（Sonnet）：研究、腳本、畫面規格、配音、對齊。**尚未建 3D 模型、未渲染**——下一棒（Opus）照 `visual-spec.md` 建 `model.json` 並補 script.json 各幕 props（鏡頭、shift、run、labels、overlay）。
- 片長：時間軸 67.9 秒（2038 幀，含 3.2 秒片尾卡）；旁白 9 幕＋片尾卡 s10。留言關鍵字「量測」；片尾預告系列下一支「離子佈植」。
- 配音：Iapetus＋tech-b，整篇 1 次請求（tts-requests.json 1 筆，原始 76.53 秒、含停頓 4.00 字/秒）。
- 聲音統一（#56）：以 `.take-e1796e78d6.raw.orig.wav`（未動原檔）為源，先把 ≥0.7 秒的句中停頓（2 處，0.73）修到 0.65，再 `asetrate=0.895 倍,aresample=24000,atempo=1.3408`（音高約 −1.9 半音、整體 ×1.20）。成片音軌 `voice.wav` 量測：含停頓 4.72 字/秒（基準 4.7，+0.4%）、音高中位數 116.5 Hz（基準 114.6，+1.7%）；段落間停頓最長 0.70 秒。整體加速 1.20（未超過 1.25）。
- 對齊：整篇信心 0.95，不合格幕 0；s9「矽」念稿寫「夕」，字幕維持「矽」，所以字幕對字有 1 字未對上，屬預期。
- 驗證：validate 只剩「缺 model.json」1 個 error（3D 相關，待建模）；layout-check 需 model.json 才能跑。
- 檔案：`research.md`（查證 2026/11/20）、`script.json`（genscript.py 產生）、`visual-spec.md`、`pronunciation.md`、念稿 `docs/prompts/tech-metrology-旁白.txt`。
- 待人耳確認：「量量看」「疊對」「科磊」「曝光機」。
- 前製復盤：①鉤子用「兩奈米」＋問句，接 CMP 片尾；②科磊、艾司摩爾的中文名只有 WebSearch 摘要出處，審稿時請再看一眼；③稿子 306 字，原始 4.0 字/秒，後製只要 1.20 倍，比 tech-cmp（1.30）順；④公司只列有來源的 6 家，台灣華洋精機（光罩）與牧德（晶圓外觀）要在畫面分清楚。

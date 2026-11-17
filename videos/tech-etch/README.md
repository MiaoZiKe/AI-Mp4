# tech-etch：蝕刻機，把圖形刻進晶圓（科技透明圈）

## 做到哪（2026/11/18）
- 研究 research.md；念稿 docs/prompts/tech-etch-旁白.txt；device-spec.md；genmodel.py／genscript.py（改程式再重產 model.json、script.json）；2D 卡 src/components/three/HudEtch.tsx（etch-dim／gas／sect／cold／next）。
- 配音：Iapetus＋tech-b，整篇 1 次請求（280 字，原始含停頓 73.4 秒＝3.82 字/秒）；片長會超過 65 秒，所以把「低溫蝕刻（零下七十度）」那一句從錄音剪掉（不另送 TTS，out/voice-etch/etch-a.wav＝剪過的版本，等於 257 字），atempo 1.12（上限）。成片 63.5 秒（含片尾卡 3.2 秒）。
- 站別：M 蝕刻機（群集式）x=0、C 反應腔剖開 x=60、W 晶圓剖面 x=120；倍率 ×1→×10→×10⁶。
- 運作動畫：抽真空（幫浦轉子）、氣體進→射頻→電漿、離子往下打＋孔一點一點刻深（3D 塞子與 2D 剖面同一份時間）、洞壁保護膜＋副產物往上。
- 台灣供應鏈（媒體報導，不寫占比）：京鼎（應材設備模組代工）、瑞耘（腔體零件）、翔名（耗材）；國際：科林研發、東京威力科創、應用材料（自由時報報導三大廠）。

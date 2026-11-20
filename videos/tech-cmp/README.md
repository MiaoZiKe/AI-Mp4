# tech-cmp：化學機械研磨（科技透明圈，接薄膜沉積；預定 11/28 六 20:00）
- 成片：`out/tech-cmp.v1.mp4`（66.5 秒，1994 幀）。配音 Iapetus＋tech-b 整篇 1 次請求（原始 81.7 秒、含停頓 3.59 字/秒）。
- 聲音統一（#56）：原始音檔先把段落停頓（≥0.7 秒的 9 處）修到 0.65 秒，再用 ffmpeg `asetrate=25361,aresample=24000,atempo=1.2302` 做「音高＋0.96 半音、整體 ×1.30」。成片音軌量測：含停頓（首字到末字）4.63 字/秒；音高中位數 115.7 Hz（曝光機 114.6 Hz／基準 113.7 Hz）。atempo 等效 1.30，超過 #56 的 1.25 上限 4%，因為 Gemini 這次在段落間停得比曝光機長；要不要接受由 Andy／CEO 決定。
- 產生：`genmodel.py`→model.json、`genscript.py`→script.json、`gensync.py`→sync-table.md；2D 卡 `src/components/three/HudCmp.tsx`（kind 以 cmp- 開頭）。
- 新增流動物形狀（Ops.tsx，只在 shape 寫新值時走新分支）：`liquid` 水滴＋連續液體帶、`grit` 磨粒小方塊、`mol` 雙球分子、`flake` 碎屑薄片。
- 物件清單與實物參考：`visual-spec.md`；研究：`research.md`；念稿：`docs/prompts/tech-cmp-旁白.txt`。
- 待人耳確認：「荏原」「朝下」「曝光」讀音。

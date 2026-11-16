# caffaine-made-by-ai 查證（2026/11/16，數字都從本 repo 算出）

- videos/caffaine-meeting-todo/script.json：604 行（`wc -l`）；畫面引用第 169–173 行，validate 逐行比對原文。
- src/components/ai-iso/*.tsx：12 個檔（含 .ts／.json），其中 .tsx 合計超過 3,000 行（前次量 3,263，之後又增加）；validate 以「至少 3,000」檢查。
- 作者：repo 可見的 48 個 commit，作者全部是 Claude（本機是淺層 clone，只代表可見範圍，不寫成「全部歷史」）。
- 翻車 1：會議紀錄那支第一版被退件，評語原文在 tests/feedback.txt（出自 docs/channels/ai-daily-playbook.md 第十三節）。
- 翻車 2 的證據：commit 17cfb42「s04 小標殘影與 s01 章重疊修正」；檢查程式 scripts/caffaine/ov-check.mjs 預設每 6 幀量一次。
- 「交代句」畫面為示意範例，不是實際對話紀錄。

# caffaine-two-answers 查證（2026/11/16）

- 現象：tests/01-casual.json（第一次：行銷經理）、tests/01b-casual-run2.json（第二次：待指派）、tests/02-better.json（加規定：未指定），均為 Gemini API 實測，複製自 caffaine-meeting-todo/tests；validate 逐字比對畫面文字。
- 原理：大型語言模型逐字（token）生成，每一步從候選字的機率分布取樣，所以同一輸入可有不同輸出；這是公認的一般說法。畫面的候選字與長短標「示意」，不是任何模型的實際機率。
- 不寫：temperature 數值、特定模型的內部細節。

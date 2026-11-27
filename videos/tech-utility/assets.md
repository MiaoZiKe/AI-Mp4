# tech-utility 素材來源
| 素材 | 來源 | 備註 |
|---|---|---|
| 台積電 LOGO | `public/logos/tsmc.svg`（Brand.tsx LOGOS 表既有原檔，Wikimedia Commons File:Tsmc-text.svg） | 2D 卡（s4、s7）與 T 站廠房牌，不改色、100% 不透明 |
| Organo、聯華林德、三福氣體 LOGO | （沒拿到原檔，改白底深色文字名牌＋國旗） | 2026/11/27：Wikimedia Commons API 與 Special:FilePath 回 429（流量限制）／404；organo.co.jp、聯華林德、三福氣體官網本機代理連線失敗（HTTP 000）。聯華林德是合資公司，不能拿 Linde 母公司 LOGO 代替。3D 站牌用 `make-brand-tex.mjs text:`（白底深藍字，不仿商標） |
| 台灣、日本國旗 | Brand.tsx FLAGS 程式繪製（官方比例與色碼）；3D 旗面用 make-brand-tex.mjs 轉 PNG | 100% 不透明 |
| 電阻率表頭「18.2 MΩ·cm」、UPS 名牌、N₂ 管牌 | make-brand-tex.mjs text: | 示意文字牌 |
| 3D 模型（各站） | gen-model.mjs 自建 | 依 physics-spec 與公開通則，示意，非特定廠牌／型號 |
| 數字 | research.md：18.2 MΩ·cm（Xylem、SEMI F63）；2024 全年用水 1.29 億立方公尺（台積電年報，每天約 35 萬噸與 140 座泳池為換算）；2024 約 9%（自由財經）、2025 約 10%（鉅亨推算）；製程設備約 46.1%（數位時代，單一來源） | 沒查證的不標 |

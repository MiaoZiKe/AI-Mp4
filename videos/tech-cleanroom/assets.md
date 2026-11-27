# tech-cleanroom 素材來源
| 素材 | 來源 | 備註 |
|---|---|---|
| 漢唐集成、亞翔工程、洋基工程 官方 LOGO | （三類來源都試過，沒拿到原檔，改用白底深色文字名牌） | 2026/11/27：①官網 uisco.com.tw、lkeng.com.tw、yankey.com.tw：本機代理回 HTTP 403（connect_rejected，網路白名單沒有這些網域）；②Wikimedia Commons：API 連續回 429（限流），換英文關鍵字「Yankey Engineering」只搜到無關檔案，沒有任何一家的 LOGO；③維基百科條目：同 tech-pad 紀錄，這個環境連不到。→ 不仿商標。畫面：2D 卡白底深色字名牌＋台灣國旗；3D 模組正面貼文字貼紙（`make-brand-tex.mjs text:`，漢唐 2404／亞翔 6139／洋基工程 6691） |
| 台灣國旗 | Brand.tsx FLAGS 程式繪製（2:3，官方色碼）；3D 旗桿用 `make-brand-tex.mjs flag:TW` 轉 PNG | 100% 不透明（2D 卡 FlagBox 在 opacity 群組外） |
| 台灣輪廓 | Brand.tsx twPath（27 個海岸點經緯度投影） | 不標各公司據點（未查證） |
| 3D 模型（廠房、風扇濾網、濾網褶疊、孔板地板、回風豎井、衣櫃、纖維、假人與無塵衣、氣閘、溫濕度表、晶圓台、無塵室模組） | gen-model.mjs 自建 | 依 ASHRAE ch.18、Wikipedia Cleanroom／Fan filter unit、USPTO 9115910 的構造描述與通識；示意，非特定廠房；不畫真人臉 |

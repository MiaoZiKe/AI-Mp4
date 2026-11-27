# tech-flipchip 素材來源（2026/11/27）

## 公司 LOGO（三類來源）
| 公司 | Wikimedia Commons | 官網 | 維基百科 | 結果 |
|---|---|---|---|---|
| 日月光投控 ASE（台灣，3711） | 未抓（同 tech-probe2 經驗：Commons 有限流；本片時間內沒有成功取得原檔） | ase.aseglobal.com：本環境網路代理擋（研究 agent 實測 403） | 代理擋（403） | **文字名牌「日月光 ASE」** |
| 安靠 Amkor（美國，AMKR） | 同上 | amkor.com：代理擋（403） | 代理擋 | **文字名牌「安靠 Amkor」** |
| Besi（荷蘭） | 同上 | besi.com：代理擋（403） | 代理擋 | **文字名牌「Besi」** |
- 名牌不仿商標，只寫公司名；3D 廠牌貼圖由 make-brand-tex.mjs 產生（public/tex/brand/sign-fc*.png，不進 git）。要換官方 LOGO 需頻道負責人放原檔並在 Brand.tsx 登記。

## 國旗
- 台灣、美國、荷蘭：Brand.tsx 的 FLAGS 程式繪製；2D 卡國旗與名牌不放進 opacity 群組（100% 不透明）。

## 地圖
- 台灣、美國本土：Natural Earth 1:50m（公有領域），沿用 videos/tech-mask2/map.json（只讀）。據點：日月光高雄（120.30E, 22.62N；研究稿 #43 高雄楠梓擴廠）、安靠總部亞利桑那 Tempe（111.94W, 33.43N；研究稿 #41）。

## 其他
- 沒有照片、沒有 AI 生圖；全部程式建模。

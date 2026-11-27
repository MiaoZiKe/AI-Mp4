# tech-probe2 素材來源（2026/11/27）

## 公司 LOGO（Andy 第 4 條：官網、Wikimedia Commons、維基百科三類來源）
| 公司 | Wikimedia Commons | 官網 | 維基百科 | 結果 |
|---|---|---|---|---|
| FormFactor（美國） | API 檔名搜尋 `intitle:"FormFactor"`：只找到無關檔案（Focusrite 麥克風前級照片），沒有公司 LOGO | formfactor.com：本環境網路代理拒絕連線（HTTP 403，主機不在允許清單） | en.wikipedia.org：本環境網路代理拒絕連線（HTTP 403） | **抓不到 → 白底深藍字文字名牌「FormFactor」** |
| 旺矽 MPI（台灣，6223） | `intitle:"MPI Corporation"`、`intitle:"旺矽"`：0 筆 | mpi.com.tw：代理拒絕（403） | zh／en.wikipedia.org：代理拒絕（403） | **文字名牌「旺矽 MPI」** |
| 中華精測 CHPT（台灣，6510） | `intitle:"中華精測"`、`intitle:"Chunghwa Precision"`：0 筆 | chpt.com：代理拒絕（403） | 代理拒絕（403） | **文字名牌「中華精測 CHPT」** |

- 名牌不仿商標（不用公司字體、顏色、圖形），只寫公司名；3D 廠牌貼圖由 `scripts/three/make-brand-tex.mjs tech-probe2 text:p2ff=… text:p2mpi=… text:p2chpt=…` 產生（public/tex/brand/sign-p2*.png，不進 git，gen-model.mjs 每次重產）。
- 要補官方 LOGO：環境允許清單加官網網域（或由 Andy 提供原檔），放 public/logos/ 並在 Brand.tsx 的 LOGOS 登記（共用檔，需頻道負責人處理），再把 HudProbe2.tsx 的 NamePlate 換成 LogoSvg。

## 國旗
- 美國、台灣：`Brand.tsx` 的 `FLAGS` 程式繪製（官方比例與色碼），2D 卡用 `<Flag asSvg>`、3D 旗桿用 make-brand-tex 轉的 flag-US／flag-TW 貼圖。2D 卡上國旗與名牌不放進任何 opacity 群組（100% 不透明，未輪到＝細灰框、輪到＝粗橘框）。

## 地圖
- 美國本土、台灣本島輪廓：Natural Earth 1:50m（公有領域），沿用 `videos/tech-mask2/map.json`（tech-mask2 已整理、RDP 簡化），本片只讀不改。
- 2D 卡的台灣輪廓：HudTrk.tsx trk-tw 同一組 27 點經緯度投影；新竹（120.97E, 24.80N）、平鎮（121.21E, 24.94N）照經緯度換算位置。
- 廠房位置是示意：FormFactor 標在加州 Livermore（研究稿「既有知識待核」，畫面只寫「美國探針卡廠」、不寫城市名）；旺矽標新竹（研究稿「既有知識待核」，標籤寫「旺矽（新竹）」）、精測標桃園平鎮（研究稿已查到）。

## 其他
- 沒有實拍照片、沒有 AI 生圖；所有 3D 零件程式建模（gen-model.mjs）。

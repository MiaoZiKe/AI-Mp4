# tech-asml 畫面規格（v2，2026/11/26，Andy 第 16 條：機台擬真＋爆炸分解）

## 一、真實模組清單（建模依據）
查證：WebSearch 2026/11/26（台北）。只寫公開資料講得到的「有哪些模組、彼此在哪」；尺寸比例是示意。

| # | 模組 | 真實機台的位置與外觀特徵 | 模型怎麼做（gen-model.mjs 的 layer） | 來源 |
|---|---|---|---|---|
| 1 | CO2 驅動雷射（放大器） | 不在潔淨室裡：放在**地板下的次層廠房（subfab）**，雷射光由光束傳輸管往上送進光源艙 | `laser`：架高地板（格柵）下方一排四級放大器機櫃（散熱鰭片、指示燈、冷卻水管）＋直立光束管穿過地板 | ASML／EUVL 研討會簡報（Stoeldraijer 2009：「CO2 laser amplifiers in subfab」）；EUV Sources 簡報（Scribd） |
| 2 | 光源艙（source vessel） | 掃描機本體旁邊一個獨立的真空艙；錫滴產生器從上方往下滴、下方錫回收；雷射每顆錫滴打兩發（預脈衝＋主脈衝） | `src`：橫躺的真空腔（法蘭、螺栓、補強環、觀察窗）＋上方錫滴產生器（加熱環）＋下方回收口＋碗形收集鏡＋中間焦點錐；`hullS` 是它自己的外殼 | ASML 產品頁（tin-based plasma source）；EUV Sources 簡報（pre-pulse、main-pulse） |
| 3 | 收集鏡＋中間焦點（IF） | 收集鏡把電漿四散的光聚到中間焦點，IF 是光源艙與掃描機的交界 | `src` 的碗形鏡（9 圈金色環）＋IF 錐形隔板 | USPTO 8873025／9316918（EUV collector、intermediate focal plane） |
| 4 | 照明系統（illuminator） | IF 之後：場鏡面陣列（field facet）→ 瞳鏡面陣列（pupil facet）→ 掠射鏡，把光整形後打到光罩；NXE 可調照明（sigma 0.06–1） | `illum`：兩片鏡面陣列（方格小鏡）＋掠射鏡＋斜立的照明鏡筒外殼 | USPTO 8643825／7990520（field／pupil facet mirror）；ASML NXE:3400C 產品頁 |
| 5 | 光罩台（reticle stage）＋光罩交換 | 掃描機**最上層**；反射式光罩朝下，光從下面斜打上去；磁浮長行程台＋光罩搬運 | `mask`：上層的長導軌、線性馬達磁鐵列、移動台、朝下的光罩與夾具 | USPTO 12572080（reflective reticle、synchronous scan）；2009 ASML 簡報（reticle stage／handler） |
| 6 | 投影鏡組（projection optics box，蔡司） | 光罩與晶圓之間的大鏡筒；全反射、4 倍縮小、NA 0.33；鏡面在鏡筒內上下折返 | `optics`（6 面反射鏡）＋`po`（鏡筒：法蘭環、立柱、冷卻管） | ASML NXE:3400C 產品頁（Zeiss all-reflective 4x）；research.md #1 |
| 7 | 晶圓台（雙台 TWINSCAN） | 掃描機**最下層**；兩座晶圓台：一座在量測位置量晶圓，另一座同時在曝光位置曝光 | `wafer`（曝光位置那座：移動台、吸盤、晶圓、晶粒格、感測頭）＋`frame` 的第二座（量測位置，量測頭在上方） | ASML 產品頁（metrology position 與曝光同時進行）；2009 ASML 簡報（Dual stages） |
| 8 | 晶圓搬運（wafer handler） | 晶圓台旁的前端搬運口，晶圓盒從這裡送進去 | `hull` 前端的搬運口模組（晶圓盒座、門） | 2009 ASML 簡報（wafer handler） |
| 9 | 真空與管線 | 整條光路在真空裡（EUV 會被空氣吸掉）；艙體掛渦輪分子泵、冷卻水管、氫氣管 | `pipes`：腔體上方的渦輪泵（圓柱＋法蘭）、沿機身走的冷卻水管束 | Wikipedia〈EUVL〉；research.md #5 |
| 10 | 外殼 | 白／淺灰分塊面板、深色腰帶、側面掛廠牌；整機約一台巴士大、約 150–180 噸、出貨要約 40 個貨櫃 | `hullF`（前面板，分塊＋縫線＋散熱格柵＋操作面板）、`hullR`（頂板）、`hullE`（右側板）、`hullS`（光源艙外殼）、`hull`（背板與框） | Reuters／Yahoo Finance〈The $250 million ASML 'printer'〉；Tom's Hardware（High-NA 出貨） |

配置（側視，左→右）：地板下雷射 → 左側光源艙 → 斜上的照明 → 最上層光罩台 → 中間投影鏡筒 → 最下層晶圓台（右邊量測台）→ 右前搬運口。光路照 research.md：電漿 → 收集鏡 → IF → 場鏡面 → 瞳鏡面 → 掠射鏡 → 光罩 → 6 面投影鏡 → 晶圓。

## 二、爆炸分解（s2「它像一台投影機」～s3「這一步叫曝光」）
- s2:proj：外殼面板掀開（前板往上前方掀走、頂板往上、右側板往右、光源艙外殼往左）→ 各模組沿軸線分開：光源艙往左、雷射往下、光罩台往上、照明往左上、晶圓台往下、投影鏡組留在原位當中心。
- 一次亮一張標籤（每張約 1.5 秒）：光罩台（s2:mask）→ 投影鏡組（s2:x4，縮小 4 倍）→ 晶圓台（s2:wafer 後）→ 光源艙（s3:layer）→ 照明系統（s3:lit）→ s3:expo 前組回去，外殼不回（後面看內部運作）。
- s8 起外殼蓋回，看完整機台＋廠牌。

## 三、光路與光錐
等 `optics-spec.md`（光學專家另寫）定稿後照它調：每段光錐方向、收斂／發散、亮度衰減，畫面標「示意，極紫外光肉眼看不見」。

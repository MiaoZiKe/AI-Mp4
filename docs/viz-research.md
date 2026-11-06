# 「不只是圖卡」：畫面變化研究與 Remotion 可行性（2026/11/6）

原型與量測：`/tmp/claude-0/-home-user/afb8d066-6931-561b-9e7e-f3557dd82fd7/scratchpad/viz-research/`（scratchpad，session 結束會消失；原始碼要保留時再搬進 repo）。

## 結論
- 爆紅知識短影音每 2–3 秒換一種畫面形式（大字、圖表長出來、物件比喻、鏡頭推近），卡片只是其中一種。mstr-bitcoin-v2 的 15 幕有 13 幕是卡片類。
- 業界：Illustrator＋After Effects（地圖 GEOlayers、3D 用 C4D/Blender）；資料驅動團隊用 Cavalry、Flourish、D3。可模板化又吃資料的類型（圖表、格子、等角、大字）最適合用 Remotion 做。
- 軟體渲染（swiftshader）實測：SVG 與 CSS 3D transform 幾乎不加成本；`filter: blur` 很貴（全幅 +66 ms/幀）。
- 即時 3D（@remotion/three）只能在 swangle 跑，每幀 0.8–2.3 秒，且整片變慢 1.84 倍 → 不用。3D 一律預渲染成透明 PNG 再疊回。

## 實測（單執行緒、90 幀，含約 25 ms 啟動開銷）
| 原型 | ms/幀 |
|---|---|
| 基準（背景＋標題＋卡片） | 100 |
| 線圖描線＋跟隨數值＋事件標註＋鏡頭微推 | 128 |
| 2.5D 景深堆疊（背景層 blur）／不加 blur | 145／125 |
| waffle 人形格子 100 格 | 108 |
| 等角柱狀圖（SVG＋長陰影） | 102 |
| 全畫面 blur | 166 |
| @remotion/three（swangle）／輕量版 | 2316／798 |
| 3D 預渲染 PNG 疊回主片 | 134（另加一次性 666 ms/幀） |

## 先做的 5 個元件（約 5–6 人日）
1. **KineticText**：全螢幕大字（鉤子、轉折、金句），`{lines, emphasis, style: punch|stack|typewriter, accent, bgWord, beats}`。
2. **LineChart**：描線＋跟隨數值＋事件標註＋參考線，`{series, unit, refLine, events, camera}`。
3. **UnitGrid**：waffle／人形格子，`{total, cols, icon, groups, order, seed}`。
4. **DepthStage**：把現有卡片放進 2.5D 景深舞台加鏡頭推拉，`{camera, back, mid, front, dof}`。
5. **BarChart**：flat／iso／race 三模式，`{mode, unit, bars, frames, sort, longShadow}`。

下一批：ZoomThrough 轉場、MapFocus（Natural Earth＋d3-geo 預投影）、Donut／Bubble／Timeline／Odometer、隱喻系列（Flywheel、Balance、Pipe、Stack）、Object3D 預渲染管線。

## 60 秒（15 幕）配方
大字 3、圖表 4、2.5D 或隱喻 3、卡片類 ≤4、片尾 1；同一類別不連續出現。
MSTR 套用：849,327 枚→KineticText＋翻牌；三種募資工具→DepthStage(FlowRow)；mNAV 3.4→0.9→LineChart（參考線 1）；飛輪→Flywheel；募 212 億／買 143 億→等角 BarChart；幣 +26% 對股數 +31%→排名賽跑或比例泡泡。

## validate 規則（元件加類別 card/chart/kinetic/depth/metaphor/end）
1. card ≤ 總幕數÷3（DepthStage 包的卡片算 depth）。
2. 相鄰同類別警告；連續三幕同類別錯誤。
3. 第一幕不能是 card。
4. ≥45 秒時至少 chart 3、kinetic 2、depth／metaphor 2（警告）。
5. 超過 5 秒的幕，beats 間距 ≤3 秒，`beats.at` 要出現在 timeline 字詞中。
6. 旁白含 ≥2 個數字且是比較語氣卻用卡片 → 警告建議改圖表。
7. 資料合法性：UnitGrid 總數 ≤ total；LineChart ≥3 點且事件在範圍內；race 每格標籤一致；圖表都要有 source。
8. 效能：元件不得對全幅容器用 filter；dof 只能在 back 層；主片 bundle 不得出現 ThreeCanvas。
9. card 類畫面文字（不含字幕）≤45 字。
10. 用 props 算圖表外框，檢查 220／64 安全區。

## 授權與誠實度
- Noto Sans TC、Inter 為 OFL（可商用）；Natural Earth 公有領域（爭議國界加「國界示意」）；Kenney、Poly Haven 為 CC0；不用 Google Earth Studio（署名條款）。
- Remotion：個人或 ≤3 人營利團隊免費，4 人以上需 Company License。
- 不畫真實人物；圖表 y 軸從 0；面積比較用半徑平方根；等角柱只表量級。

## 限制
- remotion.dev、premiumbeat.com、rosetta.to 在此環境連不到，相關內容只看過搜尋摘要或鏡像。Vox、Economist、志祺七七沒有公開完整製作流程，相關描述屬二手。未登入或爬取 IG、TikTok。

## 主要來源
- Visual Capitalist 影片：https://www.visualcapitalist.com/tag/video/
- Flourish bar chart race：https://flourish.studio/visualisations/bar-chart-race/
- Johnny Harris 地圖（aescripts）：https://aescripts.com/learn/making-maps-for-johnny-harris---volcanoes/
- 2.5D 視差教學：https://blog.motionarray.com/learn/after-effects/animate-flat-2d-images-after-effects/
- 等角教學：https://prod.schoolofmotion.com/blog/secret-to-isometric-mograph-in-after-effects
- Kurzgesagt 製作：https://www.lingq.com/en/learn-english-online/courses/689474/how-to-make-a-kurzgesagt-video-in-120-4887128/
- 志祺七七製作：https://www.bnext.com.tw/article/79220/shasha77-youtuber-howto
- Cavalry：https://superrendersfarm.com/article/cavalry-motion-design-review-2026
- Remotion three：https://v4.remotion.dev/docs/three
- Natural Earth：https://www.naturalearthdata.com/about/
- Remotion 授權：https://www.remotion.dev/docs/license/faq

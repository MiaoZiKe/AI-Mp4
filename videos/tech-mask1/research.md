# tech-mask1 研究紀錄：光罩-1：晶片的底片（科技透明圈，系列 2「代工的供應商」第 3 集；下一集光罩-2：誰做光罩、怎麼運送）

查證截至 2026/11/23（WebSearch，台北時間 2026/11/23 晚間）。狀態標籤：【確】已確定（原理、教科書、專利、設備手冊寫明）｜【廠】廠商公布｜【媒】媒體／研究機構報導（標誰報的）｜【示】示意。
規則：數字要兩個獨立來源對得上才寫；對不上的不寫（見第五節）。不給投資建議。本集不講曝光機本身（已在 tech-euv），也不講誰做光罩、光罩盒（留給光罩-2）。

## 一、這是什麼、負責哪一步
光罩（photomask／reticle）是晶片電路的「底片」：曝光機用光照過（或照在）光罩上，把光罩上的圖案縮小投影到晶圓的光阻上；一層電路用一片（或幾片）光罩。它屬於代工廠向外採購／自製的關鍵耗材，上游是「空白光罩」（mask blank，還沒畫圖案的基板）。

## 二、光罩的構造與運作（影片內容依據）
| # | 內容 | 狀態 | 來源（查詢日 2026/11/23） |
|---|---|---|---|
| 1 | 傳統（DUV、穿透式）光罩：高純度石英（熔融石英）平板，上面濺鍍一層鉻（Cr／CrO）當遮光層，電路圖案就是把鉻蝕刻出來的形狀；鉻擋光、石英透光（二元光罩）。進階做法也有用 MoSi 衰減相移膜取代鉻 | 【確】 | USPTO 7767365（chrome-on-glass：石英板＋濺鍍鉻）；Wikipedia〈Photomask〉；Zeiss／SPIE BACUS Newsletter 2013/05（鉻遮光膜部分改用 MoSi 衰減膜，片中只說鉻） |
| 2 | 標準光罩是 6 吋見方的石英板、厚約 0.25 吋（6.35 mm） | 【確】 | USPTO 7767365（6 吋方形、約 0.25 吋厚）；另一專利石英板 0.25 吋（6.35 mm）。片中不念，卡片小字「6 吋見方」 |
| 3 | 曝光機用投影鏡頭把光罩圖案縮小 4 倍（4:1）投到晶圓上；所以光罩上的線條是晶圓上的 4 倍大 | 【確】 | ASML《Reticle Design Manual, 6 inch reticles for 4x and 5x demagnification》（UCSB 存檔）；Wikipedia〈Photomask〉（光罩圖形為晶圓上 4 倍） |
| 4 | 深紫外光（DUV）波長 193 nm（ArF）；極紫外光（EUV）13.5 nm | 【確】 | Wikipedia〈Extreme ultraviolet lithography〉；tech-euv research.md |
| 5 | EUV 會被幾乎所有材料（包括玻璃）強烈吸收，穿不過光罩，所以 EUV 光罩改成反射式 | 【確】 | Wikipedia〈Extreme ultraviolet lithography〉；USPTO 12353120 等台積電 EUV 光罩專利（EUV 少有材料可穿透，光罩為反射式）；vocus〈EUV pellicle 的極限與未來材料戰〉（EUV 幾乎所有材料都強烈吸收） |
| 6 | EUV 光罩構造：低熱膨脹玻璃基板＋鉬／矽（Mo/Si）交錯多層膜（布拉格反射鏡）約 40 對（專利寫 30～60 對、典型 40～50）＋保護蓋層（Ru）＋圖案化的吸收層（鉭系，例：TaBN）；背面導電層讓靜電吸盤夾住 | 【確】 | USPTO 11846881、11448956、12181797（Mo/Si 多層膜、約 40 對可達最高反射率九成以上、吸收層鉭合金）；USPTO 12353120（40～50 層對、吸收層反射率 <3–5%） |
| 7 | 多層膜對 13.5 nm 的反射率約 60～75%（不是 100%） | 【確】 | USPTO 11846881（30～60 對、約 60～75%）；另專利例 70%。片中不念數字 |
| 8 | 吸收層：有吸收層的地方幾乎不反射（<3–5%），沒蓋到的地方多層膜把光反射出去，於是反射光帶著圖案 | 【確】 | USPTO 12353120；USPTO 12181797 |
| 9 | 護膜（pellicle）：繃在框上、架在光罩圖案面上方的一層薄膜；灰塵落在膜上而不是光罩上，因為膜不在焦平面，灰塵的影子是模糊的，不會被印到晶圓上 | 【確】 | USPTO 11635681（ASML，mask assembly：顆粒落在 pellicle 上因失焦不成像）；Brouns 等〈EUV pellicles〉Advanced Optical Technologies 2017（aot-2017-0023）；vocus 同上 |
| 10 | EUV 護膜必須極薄（約 50 nm 等級，多晶矽／氮化矽等），光穿過兩次會損失能量、受熱可達數百度 | 【確】 | Brouns 等 2017；vocus 同上（約七成能量通過）。片中不念，卡片不寫數字 |

## 三、一顆晶片要幾片光罩、一套多少錢
| # | 內容 | 狀態 | 來源 |
|---|---|---|---|
| 11 | 先進製程一顆晶片要幾十片光罩：5 奈米用 EUV 約 70 層光罩（不用 EUV 要 111 層）；7 奈米（7FF）約 90～95 片；3 奈米一套 60～100 片 | 【媒】 | IC Knowledge 成本模型（Scotten Jones，ISS 2018 簡報，SemiWiki）；AnandTech（台積電 16FFC／10FF／7FF 光罩數估計）；gcn.com 報導（3 奈米 60～100 片）。三者口徑不同但都是「幾十片～上百片」→ 片中只念「幾十片」，卡片寫「約 60～100 片（估計）」 |
| 12 | 一整套先進製程光罩的費用：7 奈米約 1,500 萬美元（IBS）、7 奈米起超過 1,000 萬美元（SemiAnalysis）；3 奈米 2,000～3,000 萬美元（gcn）／往 4,000 萬美元靠近（SemiAnalysis） | 【媒】 | IBS（經 futunn 轉載）；SemiAnalysis〈The dark side of the semiconductor〉；gcn.com。兩來源都 ≥1,000 萬美元 → 片中念「動輒上千萬美元」，卡片寫「7 奈米起 > 1,000 萬美元（估計）」，不寫 3 奈米精確數字 |
| 13 | 貴的原因：片數多；EUV 光罩每片 30～50 萬美元（單一來源，片中不念）；EUV 空白光罩要做到多層膜「無缺陷」 | 【媒】 | gcn.com（每片 EUV 光罩 30～50 萬美元，僅一來源→不寫數字）；DigitalToday 2026（Hoya 以無缺陷多層膜鍍膜領先） |

## 四、上游：空白光罩（mask blank）誰做
| # | 內容 | 狀態 | 來源 |
|---|---|---|---|
| 14 | 空白光罩＝還沒畫圖案的基板（石英＋鉻／或 EUV 的玻璃＋多層膜＋吸收層），光罩廠買進後再用電子束畫圖案 | 【確】 | USPTO 8133643、8828627（Reflective mask blank for EUV lithography，AGC 專利）；Wikipedia〈Photomask〉 |
| 15 | EUV 空白光罩幾乎由日本兩家供應：HOYA（豪雅）、AGC（原旭硝子） | 【媒】 | QYResearch／GII〈EUV Mask Blanks Global Market Share〉（前兩大合計約 93%～96%）；Morningstar 對 Hoya 的報告（Hoya EUV 空白光罩市占 >75%）；DigitalToday 2026（Hoya 領先）；dqindia 2026 |
| 16 | 兩家誰第一：QYResearch 稱 AGC >59%、Morningstar 稱 Hoya >75%——兩來源對不上，**片中不寫個別市占、不排名次**，只說「幾乎都來自兩家日本廠」 | — | 同上（不採用個別數字） |
| 17 | 擴產動態：Hoya 2023 年初擴充新加坡 EUV 空白光罩廠；AGC 擴充福島廠產能 | 【廠】 | Hoya IR 2023〈Information Technology Domain〉；animeanime.jp 轉載 AGC 新聞稿 2026/09。片中不念 |

## 五、沒查到、不寫的
- 護膜離光罩的確切距離（只有一篇中文摘要寫「幾毫米」，無第二來源）→ 不念、不寫數字。
- 單片 EUV 光罩價格（只有 gcn 一個來源）→ 不寫。
- AGC／Hoya 個別市占與名次（兩來源矛盾）→ 不寫。
- 台灣誰做光罩（台積電自製、台灣光罩）、光罩盒（家登）→ 留給光罩-2，本集只預告。

## 六、搜尋過的關鍵字
EUV mask blank market share Hoya AGC｜photomask quartz chrome 4x reduction DUV EUV reflective multilayer｜advanced node mask set cost million dollars number of masks｜EUV pellicle purpose particle out of focus｜photomask reticle 4:1 reduction 6 inch quartz chromium｜number of mask layers 5nm EUV｜光罩 縮小4倍 石英 鉻 光罩護膜｜EUV 40 layers Mo/Si reflectivity｜空白光罩 供應商 HOYA AGC 市占｜先進製程 光罩 層數 費用。

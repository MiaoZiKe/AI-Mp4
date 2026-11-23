# tech-mask2 研究紀錄：光罩-2：誰做光罩、怎麼運送（科技透明圈，系列「代工的供應商」第 4 集；上一集光罩-1 光罩是什麼；下一集光阻-1 照到光就會變的膠）

查證截至 2026/11/24（WebSearch，台北時間 03:00～03:30）。狀態標籤：【確】已確定（原理、專利、規格書、教科書）｜【廠】廠商公布／公司說法｜【媒】媒體報導（標誰報的）｜【示】示意。
規則：公司角色與數字要兩個獨立來源才寫；公司自己講的標「公司說法」；查不到的不寫。不給投資建議。

## 一、誰做光罩
| # | 內容 | 狀態 | 來源（查詢日 2026/11/24） |
|---|---|---|---|
| 1 | 晶圓廠自有光罩廠（captive）：英特爾、三星、台積電自己做最先進（16/14 nm 以下）的光罩；理由之一是自己做改版（turnaround）較快 | 【媒】 | Semiconductor Engineering〈Merchant Photomask Makers Remain Relevant〉；台灣光罩總經理陳立惇受訪（遠見／鏡週刊 2023/10/31）：「過去只有台積電、英特爾這類大廠有能力自己垂直整合生產光罩」 |
| 2 | 專業光罩廠（merchant）最大的三家：日本大日本印刷（DNP）、美國 Photronics、日本凸版（Toppan）光罩事業；其他還有 Hoya、Compugraphics、台灣光罩 | 【媒】【廠】 | Semiconductor Engineering 同上；Photronics FY2024 10-K（SEC，競爭者列 DNP、Toppan）|
| 3 | 凸版光罩 2024/11/1 改名 Tekscend Photomask（台灣子公司：Tekscend Photomask Chunghwa，原中華凸版電子） | 【廠】【媒】 | photomask.com 新聞稿 2024/10/1；eeNews Europe〈Toppan Photomask changes name to Tekscend Photomask〉 |
| 4 | 市占：自有光罩廠占產值多數（SEMI 2018 年部落格寫 64%）；Photronics 10-K 說近年有更多產量轉給專業光罩廠 → 年份舊、口徑不同，**片中不念市占** | — | SEMI blog〈Renaissance in the photomask market〉；Photronics 10-K |
| 5 | 各家個別市占：研究機構付費報告數字互相對不上（前三約 36%／前五約 39%，口徑不同）→ 不寫 | — | APO Research、QYResearch 摘要（不採用） |

## 二、台灣光罩（2338）
| # | 內容 | 狀態 | 來源 |
|---|---|---|---|
| 6 | 台灣光罩：1988 年成立、1995 年上市，業務是光罩研發、製造與銷售 | 【確】 | 鉅亨網公司基本資料；TechNews 公司資料 |
| 7 | 主力是成熟製程光罩（公司說法：聚焦 65／55／80 奈米，推 40 奈米試量產），也談晶圓廠成熟製程光罩外包 | 【廠】公司說法 | Money Weekly（財訊）專訪；遠見／鏡週刊 2023/10/31 陳立惇受訪。片中只說「主力是成熟製程」，卡片標「公司說法」，奈米數字只放卡片小字 |
| 8 | 12 吋光罩比重約六成、14 吋產線投資 4.35 億元 → 只有一個來源，**不寫** | — | Money Weekly |

## 三、怎麼做（電子束寫入、檢測）
| # | 內容 | 狀態 | 來源 |
|---|---|---|---|
| 9 | 光罩基板：石英玻璃上鍍鉻（遮光層），塗上電子束光阻；電子束照到的地方顯影後，再把鉻蝕刻掉，留下圖案 | 【確】 | USPTO 7220531（電子束光阻與光罩製程）；Wikipedia〈Photomask〉 |
| 10 | 傳統單束寫一片光罩要 6～24 小時（專利寫法，年代較舊）→ 片中不念，卡片寫「好幾個小時」 | 【確】 | USPTO 8518611（6–24 h）；USPTO 8227774（6–15 h 以上） |
| 11 | 多束電子束寫入（multi-beam）：IMS（英特爾旗下）MBMW-101 用 512×512＝262,144 道可程式化電子束、50 keV；NuFlare 有 MBM-2000 系列。兩家是主要供應商；業界認為極紫外光光罩需要多束 | 【廠】【媒】 | IMS 官網產品頁與 BACUS 2016 論文；Semiconductor Engineering〈Multi-Beam Market Heats Up〉；Jpn. J. Appl. Phys. doi:10.35848/1347-4065/acb65d（NuFlare MBM-2000）|
| 12 | 檢測：光罩上的瑕疵會在每一次曝光重複印出；極紫外光光罩用同波長（actinic）檢測機，Lasertec ACTIS 2019 年上市，可抓到所有會印出來的瑕疵；另有光學檢測機（KLA、Applied Materials、Lasertec、NuFlare） | 【確】【廠】 | SPIE Proc. 12751〈Actinic pattern mask inspection for high-NA EUV〉（Lasertec）；Semiconductor Engineering〈Finding Defects In EUV Masks〉 |

## 四、怎麼運送（光罩盒）
| # | 內容 | 狀態 | 來源 |
|---|---|---|---|
| 13 | 極紫外光光罩盒是「雙層盒」（dual pod）：外盒（多為高分子材料）在機台外保護；內盒（金屬、低釋氣材料）帶著光罩進曝光機的真空環境，只在機台裡面才打開；內盒靠兩片金屬面密合擋微粒；規格 SEMI E152 | 【確】 | Entegris 1010 Series EUV Pod 產品頁；SEMATECH／ASML／Entegris 2009 EUVL Symposium 海報 P091；USPTO 12730371（inner pod seal gap） |
| 14 | 為什麼：極紫外光會被所有材料吸收，反射式光罩用保護膜（pellicle）光要穿兩次、損失加倍，所以長期很難加保護膜；內盒等於一片「可拿掉的硬保護膜」，從最後清洗到曝光前要做到零微粒增加 | 【確】 | USPTO 7477358（EUV reticle handling，穿過保護膜兩次）；SPIE 摘要（TNO／SUSS dual pod：inner pod acts as a removable hard pellicle）。片中說「很難加保護膜」，不說「不能」（近年已有極紫外光保護膜） |
| 15 | 一粒灰塵落在光罩圖案上，會像瑕疵一樣每次曝光都印出來 | 【確】 | 同第 12、14 列（光罩重複使用＝固定缺陷每次都印） |
| 16 | 艾司摩爾（ASML）認證的極紫外光光罩盒：Entegris EUV 1010 是第一家通過（2018/8，NXE:3400B）；家登 2018/12 宣布新一代 EUV 光罩傳送盒通過認證；2019 年報導兩家都通過量產認證、競爭主要晶片廠訂單 | 【廠】【媒】 | Entegris 新聞稿 2018/8/2（Business Wire）；中央社 2018/12/11〈家登EUV光罩盒獲認證 接單滿載〉；Digitimes 2019/9/23 |
| 17 | 家登「七成市占」「全球唯二」＝董事長受訪說法（數位時代），單一來源且年代不明 → **不寫市占** | — | 數位時代 |
| 18 | 家登 High-NA 光罩盒已通過認證、送樣（聯合報 2026/9）→ 單一來源，不寫 | — | 經濟日報 |

## 五、沒查到、不寫的
- 台積電光罩廠的產能、位置、人數（無公開一手資料）。
- 專業光罩廠與自有光罩廠的最新產值比例、各家市占。
- 光罩盒內部的真空度、氮氣吹淨規格（產品頁未寫）。

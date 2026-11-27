# tech-flipchip 研究紀錄：覆晶（flip chip）（系列 3；前兩集＝打線 tech-wirebond；下一集 3-5「扇出型與晶圓級封裝」）

查證截至 2026/11/27。方法：WebSearch（standard）為主。
**限制**：這次雲端環境的 WebFetch 連不到 seas.ucla.edu、ase.aseglobal.com、besi.com、amkor.com（DNS 不在允許網域），所以這些網站只看到搜尋摘要、沒開原文。只靠單一摘要的條目信心最多「中」；兩個以上獨立來源摘要一致才給「高」。要升級，請在環境網路設定放行上述網域後重開原文。
狀態：已確定／廠商說法／媒體報導／分析推測／查不到。信心：高／中／低。
**不重複**：打線（線材、劈刀、EFO、超音波）見 tech-wirebond；中介層、微凸塊 30–60 µm、CoWoS 層別、C4 接中介層見 tech-packaging（11/18）。本集只講「一顆晶片翻過來接到載板」這一層。
**不上片的數字**：任何市占（Hanmi 71.2% 是 HBM TC 接合機，不是覆晶接合機）、OSAT 營收、機台 UPH、I/O 上限的舊專利數字。

## 一、定義與歷史
| # | 內容 | 狀態／信心 | 來源 |
|---|---|---|---|
| 1 | 覆晶＝晶片有電路的正面朝下翻過來，靠正面一顆顆凸塊（bump）直接接到下面的載板（或基板），中間沒有線 | 已確定；高（Wikipedia、IEEE、多篇專利定義一致） | en.wikipedia.org/wiki/Flip_chip；technav.ieee.org/topic/flip-chip/ |
| 2 | IBM 在 1962 年夏天做出第一批錫凸塊覆晶電晶體原型；早期每顆只有 **3 顆凸塊**，凸塊裡包一顆銅球當支撐 | 已確定（IBM 工程師 Paul Totta 回顧文）；中（只看到摘要） | seas.ucla.edu/ethinfilm/Pb-freeWorkshop/abs/totta.html |
| 3 | 1964 年正式用在產品：IBM System/360 大型主機的 SLT（Solid Logic Technology）混成模組 | 已確定；高（Totta 回顧＋Area Array Packaging Handbook 章節＋Wikipedia 一致；1962＝原型、1964＝產品，不衝突） | globalspec.com/reference/53539/203279/chapter-18-flip-chip-assembly-and-underfilling；Wikipedia Flip chip |
| 4 | 名稱 C4＝controlled collapse chip connection（受控塌陷晶片連接）：回焊時錫球會被晶片重量壓得「塌一點」，和熔錫的表面張力平衡，高度就停在固定值 | 已確定；高（Handbook＋Totta） | 同 #2、#3 |
| 5 | 後來發現凸塊可以安全地放在主動電路正上方、不必只排在晶片邊緣 → 才有「整面陣列（area array）」的想法 | 已確定（Totta）；中 | 同 #2 |
| 6 | 「覆晶」這個中文名就是「翻過來（覆）的晶片」；台灣業界與日月光中文頁都用「覆晶」 | 已確定；高 | ase.aseglobal.com/ch/（FCCSP 中文頁，摘要）；頎邦簡介「玻璃覆晶 COG／薄膜覆晶 COF」 |

## 二、跟打線比的好處（與代價）
| # | 內容 | 狀態／信心 | 來源 |
|---|---|---|---|
| 7 | **電感**：打線約每毫米 1 nH；一顆凸塊約幾十 pH（Fermilab 論文寫約 50 pH；RF Essentials 寫 0.01–0.05 nH，另一篇 0.03–0.1 nH）。單一連接差約 **幾十倍**（依線長） | 已確定（物理）；數字中高（三個來源同數量級）。**畫面只講「短很多、干擾小很多」，不上倍數** | arxiv.org/pdf/0911.0021；rfessentials.com/resources/rf-glossary/bond-wire/；USPTO 10014276 |
| 8 | 電感低 → 訊號跑得快、電源與接地雜訊（同時切換雜訊、地彈）小；IEEE 條目說覆晶原本就是為了減少長線圈的寄生電感與電阻 | 已確定；高 | technav.ieee.org/topic/flip-chip/；electronicdesign.com「package interconnects can make or break performance」 |
| 9 | **腳數**：打線只能排在晶片邊緣一圈，腳數隨「周長」增加；覆晶整面都能放凸塊，腳數隨「面積」增加 | 已確定；高（IEEE CAS 簡報、Electronic Design、Totta 一致） | ewh.ieee.org/soc/cas/dallas/documents/flip_chip_ieee_cas.PDF；同 #8 |
| 10 | 舉例：I/O 數 100 時，周邊排列的間距是面積陣列的約 2.5 倍；I/O 1600 時差到約 10 倍（腳越多、覆晶越划算） | 分析（舊專利／簡報計算）；中。**不上片** | 搜尋摘要（ISQED 2003 簡報、專利），原文未開 |
| 11 | 打線 I/O 上限的數字（約 250 或 900 個）來自不同年代專利，彼此差很大 | 低，**不用** | USPTO 摘要 |
| 12 | **省面積**：打線要在晶片外圍留出拉線和焊點的空間，載板面積較大；覆晶封裝可以只比晶片大一點 | 已確定；中高 | electronicdesign.com；JLCPCB blog（次級） |
| 13 | **散熱**：覆晶正面朝下，晶片「背面」朝上、上面沒有線，可直接塗導熱介面材料（TIM）貼散熱蓋（lid／heat spreader）或散熱器；裸晶版本少一層 TIM | 已確定（構造）；高（多篇專利＋Electronics Cooling 2012） | USPTO 7005320；electronics-cooling.com/2012/06/lidded-versus-bare-die-flip-chip-package-impact-on-thermal-performance/ |
| 14 | 注意：沒有找到「覆晶散熱比打線好幾倍」的量化比較；覆晶最大的好處是電性，散熱是「背面空出來好貼散熱片」 | 查不到（量化）；念稿不給倍數 | 同上 |
| 15 | **代價**：低到中腳數的晶片，打線便宜很多；覆晶要先在晶圓上做凸塊、載板要配合設計，還要處理熱膨脹不匹配 | 已確定；高（與 tech-wirebond #74 一致） | jlcpcb.com/blog/wire-bonding-vs-flip-chip；tech-wirebond research |

## 三、凸塊怎麼做（晶圓級凸塊 wafer bumping）
| # | 內容 | 狀態／信心 | 來源 |
|---|---|---|---|
| 16 | 凸塊是在**整片晶圓還沒切開前**一次做好（晶圓級），不是一顆晶片一顆做 | 已確定；高 | 多篇專利（USPTO 6846719「Process for fabricating wafer bumps」等）；Amkor 2019 覆晶技術文件摘要（200mm／300mm 晶圓凸塊線） |
| 17 | 步驟 1：濺鍍**凸塊下金屬層（UBM, under bump metallurgy）**當種子層，常見鈦／銅或鈦鎢／銅；作用是讓錫黏得住、又擋住錫和鋁焊墊互相反應 | 已確定；高（多篇專利一致） | USPTO 6930032、6743707、11329018 |
| 18 | 步驟 2：塗光阻、曝光顯影，在每個焊墊上方開孔 | 已確定；高 | 同上 |
| 19 | 步驟 3：電鍍銅柱（copper pillar）長進孔裡；步驟 4：在銅柱頂端再鍍一層錫（錫帽 solder cap，常見錫銀） | 已確定；高 | USPTO 11329018、8823166；indium.com/blog/reflow-of-copper-pillar-microbumps/ |
| 20 | 步驟 5：去光阻，再把孔以外多餘的種子層蝕刻掉（不去掉會讓凸塊彼此短路） | 已確定；高 | 同上 |
| 21 | 步驟 6：上助焊劑後回焊，錫帽熔化成圓頂（舊式全錫凸塊回焊後變成一顆圓球）；可在氮氣中進行 | 已確定；高 | 同上；USPTO 6930031 |
| 22 | **舊式錫凸塊 vs 銅柱**：錫凸塊回焊會變成球形或桶形，越密越容易兩顆熔在一起短路；銅柱不熔、維持柱狀，只有頂端那點錫會熔，所以可以排更密；銅柱另一個原因是減少錫內電流擁擠造成的電遷移 | 已確定；高（Ansys 白皮書、多篇專利、Semiengineering） | ansys.com/resource-center/white-paper/the-benefits-and-risks-of-copper-pillar-bumped-flip-chips；USPTO 7829380 |
| 23 | 間距數字：傳統覆晶（錫凸塊或銅柱）2011 年報導常見 **150–200 µm**；錫凸塊大約在 125–130 µm 以下就到極限，再細改用銅柱（Ansys：約 125 µm；Amkor 主管：130 µm 以下用銅柱；Promex：100 µm 以下）；Amkor／TI 2011 年驗證過 **50 µm** 間距銅柱 | 已確定（範圍）；中高（三個來源數量級一致，彼此門檻差 30 µm）。**畫面若要寫數字，只寫「一兩百微米 → 細到幾十微米」** | sst.semiconductor-digest.com（IFTLE 53, 2011/6）；semiengineering.com/challenges-grow-for-creating-smaller-bumps-for-flip-chips；ansys 同上 |
| 24 | 銅柱的缺點：要電鍍兩種金屬，設備與製程管理貴 | 廠商／專利說法；中 | USPTO 8820612（IMS 專利背景） |
| 25 | 凸塊材料的種類：銅柱、共晶錫銀、無鉛錫凸塊；台灣頎邦另做金凸塊（主要用在面板驅動 IC 的 COG／COF） | 已確定；中 | Amkor 2019 文件摘要；semi.org 頎邦會員頁；bnext 92654 |

## 四、接合：放上去、熔、冷卻
| # | 內容 | 狀態／信心 | 來源 |
|---|---|---|---|
| 26 | 晶圓切開後，接合機用吸嘴把晶片吸起、**翻面**、沾助焊劑（或載板先上助焊劑），用相機對位後放到載板的焊墊上 | 已確定；高（接合機產品說明＋專利流程一致） | Besi Datacon 8800 FC 產品頁（摘要）；USPTO 6713318 |
| 27 | **質量回流焊（mass reflow）**：一整盤放好晶片的載板一起進回焊爐，錫熔化後冷卻凝固，一次接好全部凸塊 | 已確定；高 | Besi 產品頁「mass reflow flip chip」；ASMPT 新聞稿（MR FC） |
| 28 | **自我對位（self-alignment）**：放歪一點也沒關係，熔化的錫有表面張力，會把晶片拉回焊墊正上方 | 已確定（焊接通識＋專利明寫）；高 | USPTO 8115319、10014272（摘要）；tech-packaging #98 同 |
| 29 | 但銅柱上的錫帽很少，自我對位的力氣變小甚至消失 → 細間距銅柱多改用**熱壓接合（TCB, thermocompression bonding）**：接合頭壓著晶片、局部加熱加壓，一次接一顆，全程夾平對準，不靠表面張力 | 已確定；高（多篇專利＋會議摘要一致） | 同上；USPTO 8967452；katalog.lib.cas.cz（micro-bump joining 摘要） |
| 30 | TCB 的代價：一次一顆、週期長，產量比質量回流焊低很多（例：Besi 8800 TC advanced 標最高約 1,000 顆／小時；Besi 回流焊型 8800 FC QUANTUM hS 標最高約 16,000 顆／小時） | 廠商說法；中。**不上片數字，只講「慢很多」** | besi.com 產品頁（搜尋摘要） |
| 31 | 冷卻：錫冷卻凝固才算接好；之後若用需清洗的助焊劑，要清洗殘留，否則會擋住底部填充膠流動；也有免洗助焊劑 | 已確定；中高 | polymerinnovationblog.com/?p=6302；USPTO 5988485 |
| 32 | 「接合時晶片被壓塌一點、高度穩定」＝C4 名稱由來（見 #4），可以接到畫面「塌一下」 | 已確定；高 | 同 #4 |

## 五、底部填充（underfill）
| # | 內容 | 狀態／信心 | 來源 |
|---|---|---|---|
| 33 | 為什麼要：矽晶片熱膨脹很小（約 3 ppm/°C），有機載板大很多（專利寫約 16 ppm/°C，另一篇 12–18）；一熱一冷，兩邊伸縮量不同，夾在中間的凸塊被來回扭，久了疲勞裂開 | 已確定；高（多篇專利一致） | USPTO 6724091、7470564、5710071（摘要） |
| 34 | CTE 數字：矽室溫約 2.6 ppm/K 是常見引用值，NIST 把矽當熱膨脹標準參考材料，但**本輪沒有開到 NIST 表格原文確認 2.6**；專利用「約 3」。**念稿可說「矽大約 3、載板大約 16，差五倍左右」**，或不說數字只說「差好幾倍」 | 矽「約 3」＝高；「2.6」＝中（只有通識，未見原表）；載板「約 16（12–18）」＝中高 | trc.nist.gov/cryogenics/materials/Silicon/Silicon.htm；USPTO 同上 |
| 35 | 作法：用針頭沿著晶片邊緣點膠，膠靠**毛細作用**自己被吸進晶片與載板之間的縫，填滿後進烘箱固化 | 已確定；高 | polymerinnovationblog.com/?p=6302；hoenle.com flip chip underfill；USPTO 5710071 |
| 36 | 固化溫度約 150–165°C（烘箱）；一篇專利例子 145–155°C、1 小時 | 廠商／專利；中。**不上片** | polymerinnovationblog；日本專利摘要 |
| 37 | 作用：膠把晶片和載板黏成一體，熱脹冷縮的力分散到整片膠上，焊點受力變小、壽命變長；邊緣要有完整的膠邊（fillet） | 已確定；高 | ansys.com/blog/enhancing-solder-joint-reliability-with-underfill；USPTO 5710071 |
| 38 | 膠裡加大量二氧化矽顆粒，把膠的熱膨脹拉到 20–30 ppm 區間；但顆粒越多越黏、越難流 | 廠商說法（Ansys blog）；中。不上片 | 同上 |
| 39 | 間距越細、縫越矮，毛細流越容易留氣泡，所以另有「免流動（no-flow）」、模封一起填（MUF）等作法 | 已確定；中 | USPTO 7279359 摘要 |

## 六、公司
| # | 內容 | 狀態／信心 | 來源 |
|---|---|---|---|
| 40 | 日月光投控（ASE Technology Holding，台股 **3711**）：TrendForce 2024 年封測（OSAT）營收排名第一，184.5 億美元，約占前十大合計 45% | 媒體報導（研究機構）；高（TrendForce 新聞稿＋evertiq＋iconnect007 一致）；代號 3711 由中時等台媒寫「日月光投控(3711)」 | trendforce.com/presscenter/news/20250513-12577.html；evertiq.com/news/2025-05-23-chinese-firms-gain-ground-in-2024-top-10-osat-ranking |
| 41 | 安靠（Amkor Technology，美國，總部亞利桑那州 Tempe，那斯達克 AMKR）：2024 排第二，63.2 億美元；自稱全球最大的美國總部封測廠 | 媒體報導＋廠商說法；高 | 同上；en.wikipedia.org/wiki/Amkor_Technology；ir.amkor.com |
| 42 | 安靠 2019 年覆晶技術文件：韓國、台灣、葡萄牙、中國都有晶圓凸塊產線，做銅柱、共晶錫銀、無鉛凸塊 | 廠商說法（舊文件）；中 | amkor.com/cn/wp-content/uploads/2019/08/Flip-Chip-TS102-CN.pdf（摘要） |
| 43 | 日月光 2026/5 與楠梓電子合作在高雄楠梓擴廠（約 352 億元），鎖定 AI 先進封裝與高階覆晶（FoCoS、FCBGA），預計 2029/9 啟用；另曾購 K18 廠房布局晶圓凸塊與覆晶 | 媒體報導；中。念稿不用 | wantrich.chinatimes.com/news/20260508900739-420101；…/20251020900338-420101 |
| 44 | 日月光 2025 全年合併營收約新台幣 6,453.88 億元；封測 3,802 億元（年增 20.2%） | 媒體轉述法說；中。念稿不用 | wantrich 2026/2/5 等（搜尋摘要） |
| 45 | 力成（6239，代號憑既有知識、本輪未查，研究稿用）：法人看好 2027–28 年 FCBGA 與 FOPLP 新訂單 | 分析推測；低中。不用 | ctee 2026/7/28、wantrich 2026/7/29 |
| 46 | 京元電（2449，代號憑既有知識、本輪未查，研究稿用）：核心是**測試**（AI GPU 燒機與成品測試），不是覆晶封裝廠，**不要放進覆晶公司名單** | 媒體報導；中 | wantrich 2026/7、ctee |
| 47 | 頎邦（6147，bnext／cnyes 網址含代號，研究稿用）：凸塊起家（金凸塊、錫鉛、銅柱），2025 凸塊業務約占營收 27% | 媒體報導；中。不用 | bnext 92654；cnyes 6147 |
| 48 | **Besi（荷蘭）**：Datacon 8800 FC QUANTUM 系列＝回焊型覆晶接合機，自稱「回焊型覆晶的無可爭議市場領導者」；另有 8800 TC advanced 熱壓接合機 | 廠商說法；中（產品存在＝高，「領導者」＝廠商自稱，不上片） | besi.com/products-technology/product-details/productgroup/flip-chip/（摘要） |
| 49 | **ASMPT（AMICRA 系列）**：AFC Plus、NOVA Pro 等可做覆晶與 TCB；2021 年宣布出貨第 250 台 TCB；自稱 TCB 全球裝機量最大（**自家內部評估**）；說「傳統回焊型覆晶已接近極限」 | 廠商說法；中 | asmpt.com/en/news/asmpt-250-tcb；semi.asmpt.com AMICRA 頁 |
| 50 | **K&S 庫力索法**：2014 推 APAMA 熱壓接合機（晶片對載板 C2S），2015 推晶片對晶圓 C2W；APAMA 系列涵蓋 TCB、高精度覆晶；2022/10 出貨第一台免助焊劑 TCB | 廠商說法；中高 | businesswire 2014/9/2、2015/9/1；eenewseurope；circuitsassembly 38131 |
| 51 | **Hanmi 韓美半導體（韓國）**：以 HBM 用 TC 接合機為主，也推覆晶接合機（FC Bonder 3.5，針對 AI 用大尺寸載板）；引用 TechInsights：2025 前三季 **HBM 用 TC 接合機**營收市占 71.2%（SEMES 13.1%、ASMPT 5.6%、Yamaha Robotics 5.6%） | 廠商引述研究機構；中。**這是 HBM 堆疊用 TC 接合機，不是覆晶接合機市占，念稿不用** | view.asiae.co.kr/en/article/2025122209224722092；biz.heraldcorp.com/article/10789060 |
| 52 | **Shinkawa 新川**：2024 報導美光向新川與韓美買 HBM3e 用 TC 接合機；新川 2025/7/1 併入 Yamaha Robotics（見 tech-wirebond） | 媒體報導；中 | trendforce.com/news/?p=10891（摘要）；tech-wirebond research |
| 53 | 其他 TC 接合機廠（市調摘要列名）：Shibaura、Toray Engineering、SEMES、Hanwha Semitech | 媒體；中低。不用 | marketpublishers 摘要；TrendForce 2025/12 |
| 54 | 覆晶接合機（不分回焊／TCB）整體市占 | **查不到**（只有市調摘要「前四大約 70%」，口徑不明，**不用**） | — |

## 七、用在哪
| # | 內容 | 狀態／信心 | 來源 |
|---|---|---|---|
| 55 | FCBGA（覆晶球柵陣列）：電腦與伺服器 CPU、GPU、晶片組；各大廠都用；可加散熱蓋（日月光 HFCBGA） | 已確定；高 | en.wikichip.org/wiki/FCBGA；ase.aseglobal.com/?p=41（摘要）；amkor.com/applications/computing |
| 56 | FCCSP（覆晶晶片尺寸封裝）：手機處理器、基頻、穿戴；比 FCBGA 小很多（TI 2011 年論文：約 FCBGA 的 25–35% 大小）；日月光頁寫適合約 200 個以下 I/O | 已確定（用途）；高；尺寸比例＝中（舊論文，不上片） | ase.aseglobal.com/ch/?p=286；amkor.com/packaging/laminate/fccsp；JCET fcFBGA 文件 |
| 57 | AI 晶片的先進封裝（晶片面朝下以微凸塊接到中介層）也是覆晶的延伸——**只講這一句，細節見 11/18 tech-packaging** | 已確定；高 | tech-packaging research #S2、#S4 |

## 八、銜接下一集（3-5 扇出型與晶圓級封裝）
| # | 內容 | 狀態／信心 | 來源 |
|---|---|---|---|
| 58 | 覆晶的晶片還要接在一塊「載板」上，線路靠載板往外拉；扇出型（fan-out）改成把線路用重布線層（RDL）直接做在晶片周圍，**不一定需要載板**；日月光列出扇出型相對覆晶的好處含「無載板（substrate-less）」、更薄、電性與散熱更好 | 已確定；高（日月光＋Semiengineering＋晶圓級運算綜述一致） | ase.aseglobal.com/?p=45（摘要）；semiengineering.com/fan-out-packaging-gets-competitive；arxiv.org/pdf/2310.09568 |
| 59 | 注意：高階扇出型常常**還是**會再接一塊載板（Semiengineering），所以念稿不要說「扇出型完全不用載板」，要說「把一部分載板的工作搬到晶圓上做」 | 已確定；中高 | semiengineering 同上 |
| 60 | 建議結尾句：「覆晶還得靠一塊載板把線拉出去。所以下一集看，怎麼把線直接做在晶圓上——扇出型與晶圓級封裝。」 | 念稿建議 | #58、#59 |

## 九、查不到
- 覆晶接合機（回焊型＋TCB）的整體全球市占；Besi「市場領導者」只有廠商自稱。
- 覆晶與打線散熱的量化比較（熱阻差幾倍）。
- 矽 CTE 2.6 ppm/K 的 NIST 原表（本輪只見通識，NIST 頁未開）。
- 2025 全年 OSAT 排名（只有 2024 年 TrendForce 版）。
- 現在主流 FCBGA 的最小凸塊間距官方數字（Amkor、日月光 datasheet 未開）。
- IBM 1964 SLT 的凸塊數與尺寸（只知 1962 原型 3 顆）。
- ASMPT 的 TCB 機台目前型號與出貨台數（只有 2021 年第 250 台）。

## 十、比喻清單
| 比喻 | 對應的物理動作 | 一致嗎／會不會誤導 | 建議 |
|---|---|---|---|
| **蓋印章**：印章面朝下、一次整面蓋到紙上（打線像一針一線縫） | 晶片翻面、整面凸塊一次接上 | 一致（翻面＋整面同時接觸）；印章是轉印墨水、不留連接物，旁白要接「每個點都留一顆小錫球連著」 | **推薦**（開場對比打線） |
| **水珠把東西拉正**：桌上一顆水珠上放一片小玻璃，放歪會自己滑回中間 | 熔錫的表面張力自我對位 | 一致（就是同一個表面張力）；小心別讓人以為錫是液體一直留著，畫面要接「冷卻變硬」 | **推薦**（回焊幕） |
| **磁磚縫補縫劑**：磁磚貼好後，縫裡灌填縫劑，整片才不會一踩就裂 | 底部填充把晶片與載板黏成一體、分散應力 | 大致一致（填縫、分散受力）；但填縫劑是從上面抹進去，底部填充是從邊緣「自己被吸進去」（毛細）。畫面補一個「紙巾一角碰水、水自己爬上去」演毛細 | **推薦**（底部填充幕），毛細用紙巾吸水補 |
| **紙巾吸水**：紙巾一角碰到水，水自己往上爬 | 毛細流動 | 一致（同一物理） | **推薦**（搭配上一個） |
| **一顆顆錫做的小釘子／圖釘** | 凸塊 | **半誤導**：釘子會刺穿；凸塊是「熔了黏住」，不刺穿。改說「一顆顆小錫珠」或「頂端沾錫的小銅柱」 | 改說法後可用 |
| **翻過來的吸盤** | 晶片翻面朝下貼上 | 誤導：吸盤靠真空吸住，覆晶靠焊錫 | 不用 |
| **夏天鐵軌熱脹冷縮、留縫** | 矽與載板熱膨脹不同 | 一致（熱脹冷縮）；但鐵軌是留縫解決，覆晶是灌膠黏住，方向相反，只能用來講「為什麼會有問題」 | 備用（只講問題） |
| **雙金屬片／一起烤的兩種餅乾一個膨一個不膨，中間的果醬被扯** | CTE 不匹配、焊點受剪力 | 一致（剪力來源） | 備用 |

## 十一、沒問到但撞到的錯誤與缺漏
1. **「覆晶比打線散熱好很多」不要給倍數**：查不到量化比較；有專利甚至寫覆晶的散熱設計反而更麻煩（要同時密封散熱蓋與載板）。念稿只說「背面朝上，可以直接貼散熱蓋」。
2. **Hanmi 71.2% 不是覆晶接合機市占**，是 HBM 用 TC 接合機；搜尋結果很容易被混寫成「TC bonder 市占」。本集不用。
3. **TCB 不等於 HBM**：TCB 是一般細間距覆晶也在用的接合法，HBM 只是最大的用途；念稿講 TCB 時不要扯 HBM（那是另一集）。
4. **京元電是測試廠**，不是覆晶封裝廠；力成、京元電只放研究稿（照任務要求）。
5. **「C4」在 tech-packaging 裡是「中介層底面接基板的凸塊」**；本集講 C4 是 IBM 覆晶的原始名稱，兩者一致（同一種受控塌陷錫凸塊），但字幕不要寫成「C4 是中介層用的」。
6. **1962 vs 1964**：1962＝原型、1964＝System/360 產品；不要寫「IBM 1960 年發明」，要寫「1960 年代」或「1964 年用在 IBM 大型主機」。
7. **銅柱上的錫帽還是會熔**（只是錫很少），不要說「銅柱不用焊錫」。
8. **自我對位在銅柱細間距上會變弱**，不要說「所有覆晶都會自己對正」；念稿說「錫比較多的凸塊，熔了會自己把晶片拉正」。
9. **扇出型不一定沒有載板**（見 #59）。
10. 矽 CTE「2.6」與「約 3」兩種寫法：片中用「約 3」較安全。

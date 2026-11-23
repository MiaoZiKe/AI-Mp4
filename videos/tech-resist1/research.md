# 光阻-1：照到光就會變的膠｜研究筆記（可直接改成文章）

- 系列：科技透明圈 系列 2「代工的供應商」第 5 集（上一集光罩-2；下一集光阻-2：塗佈顯影機）
- 發布：2026/12/7（一）18:00；留言關鍵字「光阻」
- 查證日期：2026/11/23（WebSearch，只讀得到摘要；引用只取摘要寫到的內容）。發布當天再查一次 JSR 台灣廠進度並更新日期。
- 範圍：只講「光阻這種材料」。塗佈、曝光、顯影的機台留給光阻-2；晶圓流程片（tech-waferflow）已講過「塗光阻→曝光→顯影」的流程順序，本集不重複流程，只拆材料本身。

## 一句話主旨
光阻是照到光就會變的感光高分子；正型洗掉照光處、負型留下照光處；線越細越要靠化學放大，到 EUV 光子太少，材料成了新難題，供應以日本廠為主。

## 一、光阻是什麼（已確定）
| 說法 | 狀態 | 來源（查證 2026/11/23） |
|---|---|---|
| 光阻是感光材料（高分子樹脂＋感光成分），塗在晶圓上，照光後在顯影液裡的溶解度改變，用來把光罩圖案轉到晶圓上 | 已確定（教科書、大學無塵室教材） | EPFL CMi「Introduction to Photolithography」；Wevolver「Positive vs. Negative Photoresist」 |
| 傳統 g/i 線正型光阻＝酚醛樹脂（novolac）＋重氮萘醌（DNQ）；沒照光的 DNQ 抑制溶解，照光後 DNQ 放出氮氣、變成可溶於鹼性水溶液的產物 | 已確定 | USPTO 專利說明（DNQ／novolac 機制）；Wevolver |
| 顯影液常用氫氧化四甲基銨（TMAH）水溶液（鹼性） | 已確定 | USPTO 11016386 等專利說明 |

## 二、正型與負型（已確定）
| 類型 | 照到光的地方 | 顯影後留下 | 來源 |
|---|---|---|---|
| 正型 | 變得容易溶解（分子斷鏈或保護基脫落） | 沒照到的部分（圖案和光罩擋光處相同） | Wevolver；EPFL CMi |
| 負型 | 分子交聯（連成網）變得不溶 | 照到的部分（圖案和光罩相反） | Wevolver；EPFL CMi |
- 同一種化學放大光阻，用鹼性水溶液顯影是正型圖案、用有機溶劑顯影可得負型圖案（專利說明，USPTO 11016386）。片中不展開，只講基本正負型。

## 三、化學放大型光阻（CAR，已確定）
| 說法 | 狀態 | 來源 |
|---|---|---|
| 曝光不直接改變溶解度，而是由光酸產生劑（PAG）產生穩定的酸（催化劑），溶解度的改變發生在之後的曝後烘烤（PEB） | 已確定 | IBM Research Report RJ10223（dominoweb.draco.res.ibm.com） |
| 一個酸分子的催化鏈長可達「數百次」反應事件，造成大幅的曝光放大 | 已確定（IBM 研究報告原文 "up to several hundred reaction events"） | IBM RJ10223 |
| 「化學放大」一詞由 IBM 提出；第一個成功的 CAR 是 poly(t-BOC-styrene)＋三苯基鋶鹽 PAG | 已確定 | NIST／Schmid 等 SPIE 5376（2004）；IBM 報告 |
| 代價：烘烤時酸會擴散，線越細越容易糊邊 | 已確定 | IBM 同系列報告 |
- 片中「線越畫越細，光不夠用」：指深紫外光世代需要更高感光度，CAR 用一個酸觸發多次反應換來感光度。旁白不念年份與人名（人名來源未能雙重確認）。

## 四、EUV 光阻為什麼難
| 說法 | 狀態 | 來源 |
|---|---|---|
| EUV（13.5 nm）每顆光子約 92 eV，ArF（193 nm）約 6.5 eV；同樣吸收能量下，EUV 光子數約只有 ArF 的 1/14 | 已確定（物理計算，兩來源一致） | arXiv 2405.11717（2024）；USPTO 11940728 等專利「EUV 光子數為 ArF 的 1/14」 |
| 光子少 → 光子散粒雜訊（shot noise）變大 → 線邊粗糙、橋接（黏在一起）與斷線等隨機缺陷 | 已確定（學術期刊） | JM3 17(4) 041003「Stochastics in EUV lithography」；SemiEngineering「New Challenges Emerge With High-NA EUV」 |
| 新方向：金屬氧化物光阻（MOR），金屬氧化物核心吸收 EUV 更多、抗蝕刻好；目前多為負型 | 媒體／期刊報導 | SemiEngineering；RSC Chemical Science 2026 |
| JSR 在 2021 年收購 Inpria（EUV 金屬氧化物光阻）；2025/9 JSR／Inpria 與科林研發（Lam Research）簽交叉授權與合作，含 Lam 的乾式光阻 Aether | 已確定（公司新聞稿） | JSR 2025/9/16 新聞稿（jsr.co.jp）；iConnect007、Nasdaq 轉載 |
- 1/12～1/14 的差異：2004 年 EUV 研討會簡報寫 12 倍（依吸收假設不同）；片中念「十四分之一」，條件是「同樣能量」，和物理計算一致。

## 五、供應商（市占不寫數字）
| 說法 | 狀態 | 來源 |
|---|---|---|
| 主要供應商：JSR（捷時雅）、東京應化（TOK）、信越化學、富士軟片、住友化學、杜邦，韓國東進世美肯等 | 媒體報導／研究機構 | Mizuho 產業報告 msif 215；GMI；TechNews 轉日經（2026/5/5） |
| 日本廠占全球「約八成」／「75%」／「91% 以上」 | **各家說法不一**（日經約 80%、Intel Market Research 75%、另一篇 91%），片中只說「以日本廠為主」 | TechNews 2026/5/5；Intel Market Research；商周轉載 |
| 個別公司市占（JSR 19% 或 22%、TOK 25.1%） | 兩來源對不上，不寫 | 同上 |

## 六、台灣在地化（媒體報導＋公司公告）
| 說法 | 狀態 | 來源 |
|---|---|---|
| JSR 與台灣夥伴（華立／萬歲、李長榮化工 LCY）成立合資公司「台灣捷時雅先進製造」，JSR 持股過半，在雲林建台灣首座光阻廠，最快 2028 年投產，直接供應台積電 | 媒體報導（日經；Tom's Hardware）；兩個獨立來源一致 | TechNews 轉日經 2026/5/5；Tom's Hardware「JSR builds first Taiwan photoresist plant」 |
| 過去 JSR 給台積電的樣品要從日本海運、耗時數週 | 媒體報導（日經） | TechNews 2026/5/5 |
| 東京應化、信越化學已在台設有生產據點 | 媒體報導（日經） | TechNews 2026/5/5 |
| 東京應化子公司台灣東應化把苗栗廠讓渡給長春石油化學（2023/2） | 已確定（公司公告） | tok.co.jp 230213 公告 |
- 片中只念「捷時雅找夥伴合資，在雲林蓋光阻廠，最快 2028 年投產」（媒體報導，畫面標「媒體報導」）；其餘放卡片與文章。

## 七、不做的事
- 不給投資建議、不放「非投資建議」字樣（lessons 第 6 條）、不放公司商標。
- 塗佈顯影機台（旋轉塗佈、軟烤、顯影噴頭）留給光阻-2，本集 s14 只用一台示意的旋轉台預告。

## 來源清單（查證 2026/11/23）
- EPFL CMi：https://www.epfl.ch/research/facilities/cmi/process/photolithography/introductiontophotolithography/
- Wevolver：https://www.wevolver.com/article/positive-vs-negative-photoresist-a-comprehensive-guide-to-photolithography-in-semiconductor-fabrication
- IBM Research Report RJ10223：https://dominoweb.draco.res.ibm.com/reports/RJ10223.pdf
- NIST／Schmid SPIE 5376（2004）：https://webarchive.library.unt.edu/eot2008/20080916043752/http://polymers.msel.nist.gov/staff/images/photos/2004_SchmidSPIE5376.pdf
- arXiv 2405.11717：https://arxiv.org/pdf/2405.11717
- USPTO 11940728：https://image-ppubs.uspto.gov/dirsearch-public/print/downloadPdf/11940728
- JM3 17(4) 041003：https://spiedigitallibrary.org/journals/journal-of-micro-nanolithography-mems-and-moems/volume-17/issue-4/041003/
- SemiEngineering：https://semiengineering.com/new-challenges-emerge-with-high-na-euv
- JSR 新聞稿 2025/9/16：https://jsr.co.jp/jsr_e/news/2025/20250916.html
- TechNews（轉日經）2026/5/5：https://finance.technews.tw/2026/05/05/nikkei-jsr-plans-taiwan-plant-supply-tsmc-photoresists/
- Tom's Hardware：https://www.tomshardware.com/tech-industry/jsr-builds-first-taiwan-photoresist-plant-as-japanese-materials-makers-race-to-embed-next-to-tsmc
- 東京應化公告 2023/2/13：https://www.tok.co.jp/application/files/1816/7953/7991/230213_4.pdf
- Mizuho msif 215：https://www.mizuhobank.co.jp/corporate/industry/pdf/msif_215_en.pdf
- Intel Market Research：https://www.intelmarketresearch.com/photoresists-market-36263

# tech-deposition 研究紀錄：薄膜沉積（科技透明圈，接在蝕刻機之後，下一支化學機械研磨）

查證截至 2026/11/18。狀態標籤：【確】已確定（物理原理、設備通則）｜【廠】廠商公布｜【估】研究機構估計｜【媒】媒體報導（標誰報的）｜【示】示意。
搜尋關鍵字（WebSearch，共 7 組，三類來源：技術文／廠商與年報／媒體）：
1. ALD atomic layer deposition vs CVD vs PVD sputtering how they work advanced nodes
2. 薄膜沉積設備 市占 應用材料 科林研發 東京威力科創 ASM 2025
3. 台灣 濺鍍靶材 前驅物 薄膜沉積 供應鏈 台積電 光洋科 崇越 帆宣 家登
4. Applied Materials Lam Research Tokyo Electron ASM International deposition equipment market share TechInsights
5. 京鼎 應用材料 設備 模組 零組件 光洋科 靶材 台積電 先進製程
6. ALD 原子層沉積 一個循環 約0.1奈米 前驅物 吹淨 GAA 閘極氧化層 high-k
7. ASM International ALD leader …（官方年報）／ ASM 原子層沉積 市占 龍頭 GAA 科技新報

## 原理（影片內容依據）
| # | 內容 | 狀態 | 來源 |
|---|---|---|---|
| 1 | CVD：氣態前驅物在晶圓表面反應或分解，生成固體薄膜；副產物氣體被抽走 | 【確】 | semiengineering「Enabling advanced devices with atomic layer processes」；Wevolver「PVD vs CVD」 |
| 2 | PVD（濺鍍）：真空腔內，氬離子撞擊靶材，靶材原子被打出來，沿直線飛到晶圓上；視線直進，深溝槽側壁與底部鋪不到 | 【確】 | Wevolver；Kindle-Tech 沉積方法整理（皆為二手說明，原理為教科書通則） |
| 3 | ALD：自我限制的兩段式反應，通入前驅物 A 只貼滿一層、吹掉多餘，再通 B 與其反應成一層膜；一個循環只長一層原子，非常貼合（conformal）但慢 | 【確】 | semiengineering；Beneq 技術頁；科技新報專訪 ASM 技術副總 Glen Wilk（2 奈米以下 GAA／CFET 深寬比高、需要沉積覆蓋性與厚度控制） |
| 4 | 先進製程（GAA 等）立體結構、深寬比高，所以越來越靠 ALD | 【媒】科技新報／優分析（ASM 說法）；ASM 官方年報 2020 提到 ALD 新應用占設備營收一半以上 | https://technews.tw/?p=1440339 ；asm.com 年報 |
| 5 | 反應腔構造：氣體由頂部噴氣頭（showerhead）均勻灑下、晶圓放在加熱座（heater/pedestal）上、用過的氣體由底部抽氣口被真空幫浦抽走 | 【確】設備通則（CVD／ALD 單片腔的標準構造） | 通用教材；Lam/ASM 單片腔機型說明 |
| 6 | 沉積後晶圓表面因底下溝槽而高低不平，需要平坦化（CMP）才能接著做下一層 | 【確】製程通則 | 下一支主題 |
| 7 | 「幾個原子厚」：原子間距約 0.2～0.3 奈米，1 奈米約 3～5 層原子；高介電閘極膜為奈米等級（清大博士論文：高 k 薄膜 4 奈米時 EOT 可到 1.08 奈米） | 【確】物理換算，畫面標示意 | nthu 博士論文（scholars.nthu.edu.tw）；影片不寫具體製程節點厚度數字 |

## 公司（只列查得到、有來源的）
| 公司 | 做什麼 | 狀態 | 來源 |
|---|---|---|---|
| 應用材料（Applied Materials） | 沉積設備大廠（PVD、CVD 等） | 【廠】/【媒】 | TechInsights 2025 設備供應商排名列名；SemiconductorX 描述其為最大沉積設備商（定性，無數字，不寫市占） |
| 科林研發（Lam Research） | 沉積設備（ALD、鎢 CVD 等） | 【媒】 | SemiconductorX、Tech Investments（定性）；TechInsights 排名列名 |
| 東京威力科創（Tokyo Electron） | 沉積設備（CVD 等） | 【媒】 | 同上 |
| ASM（ASM International；台灣為先藝科技） | ALD 與磊晶設備 | 【廠】官方年報／【媒】科技新報、優分析、中時報導「ALD 與磊晶設備龍頭」（媒體說法，不是市占統計） | asm.com 年報；technews.tw/?p=1440339；uanalyze；chinatimes |
| 光洋科（1785） | 台灣供應半導體前段製程高階靶材 | 【媒】經濟部／科技新報、聯合報（udn 9498827）報導 | technews.tw/?p=650769；udn.com/news/story/7240/9498827 |
| 京鼎（3413） | 應用材料設備供應鏈（最大客戶為美系半導體設備商） | 【媒】聯合報／經濟日報報導 | udn.com/news/story/7240/9498827；udn 9504402 |
- 沒找到可靠資料、不寫進片中：崇越、帆宣、家登在靶材／前驅物／沉積的具體角色；各家沉積設備市占數字（付費報告，不引用）；前驅物台灣供應商。
- 不寫「非投資建議」字樣；不寫市占、客戶占比數字。

## 注意（WebSearch 摘要陷阱）
- 搜尋摘要未出現「中文名（英文名）」亂對應；公司中文名採常用譯名：應用材料、科林研發、東京威力科創、ASM（艾司姆，台灣子公司先藝科技）。
- 市占數字全是付費報告或舊資料（VLSI 2017 為整體設備非沉積），不採用。

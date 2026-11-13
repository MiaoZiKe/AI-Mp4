# 影片風格參考總表（給你挑風格用）

整理日期：2026/11/13。這份文件回答四件事：現在的風格叫什麼、去哪裡看參考片、四個頻道各有哪兩個方向可選、有哪些事要你決定。

## 先講最重要的

1. **現在四支樣片的風格叫「紙拼貼動畫」**（英文 paper collage／mixed-media collage，網路上常直接叫「Vox 風格解說片」）。你覺得它偏新聞類，這個判斷是對的，原因寫在第 1 節。
2. **產品介紹要用 3D，這台機器做得到，但只做得出「乾淨、風格化」的 3D**（爆炸圖、轉盤、等距小場景）。它沒有顯示卡，做不出手機發表會那種金屬反光、玻璃折射的擬真質感。三條路線的取捨寫在第 3 節。
3. **AI 教學頻道建議改成「仿介面動畫」**（自製的聊天框、輸入框、游標、流程節點圖）。這種不需要 3D，用現有工具就能做，成本最低。
4. **這份文件裡的參考網站，絕大多數我沒有親眼看過。** 這個環境的網路只放行少數網站，實際打開過的只有 GitHub 專案頁和 PyPI。其他都只看到搜尋結果的摘要，表格裡每一列都有標示。請你用自己的瀏覽器點開，看到喜歡的截圖或貼網址給我。
5. **做 3D 和做新風格都要你先點頭**，因為現行製作規範（CLAUDE.md）寫了 v2、v3 不用 3D，也寫了不用 AI 生圖。要你決定的事列在第 4 節。

配音的口音、男女聲、情緒設定不在這份文件裡，另外整理在 `docs/voice-profiles.md`。

---

## 1. 現在這種風格叫什麼、適合什麼

| 項目 | 說明 |
|---|---|
| 中文叫法 | 紙拼貼動畫、混合媒材拼貼、剪紙動畫 |
| 英文關鍵字（搜尋用） | paper collage animation、mixed-media collage、cutout animation、paper stop-motion（逐格抖動那種）、scrapbook／newsprint collage（剪報感那種）、Vox style explainer |
| 我們 repo 裡的名字 | styleVersion 3「桌面紙拼貼」，有五套外觀：desk、blueprint、newsprint、notebook、sticky |
| 畫面長相 | 一張桌面上放剪報、拍立得照片、便條、膠帶、螢光筆。紙片貼上、滑動、被撕走，邊緣不整齊、有紙紋。 |
| 為什麼像新聞 | 主體是剪報和照片，看起來像記者桌上整理的證據。紙片只需要貼上和移動，製作快，所以時事解說片最常用。 |
| 適合 | 時事、國際新聞、公司事件、人物故事（股票頻道的時事題材最合） |
| 不適合當主力 | 產品介紹（看不到產品本體）、AI 工具教學（看不到操作畫面） |
| 風險 | 四個頻道都用這一套，看起來會像同一個頻道，而且每支都像新聞 |

代表頻道是 Vox（<https://www.youtube.com/@Vox>）。這個頻道頁我沒有打開過；拆解它做法的文章（<https://www.premiumbeat.com/blog/replicating-vox-motion-graphic/>）也只看到搜尋摘要。

---

## 2. 去哪裡找參考片

「有沒有實際打開過」一欄的三種寫法：

- **打開過**：我實際讀到頁面內容。
- **只看到摘要**：網站在這個環境打不開，或我沒有去開，內容來自搜尋結果的摘要，沒有親自確認。
- **未開**：網址是搜尋結果或既有技能文件給的，我連摘要都只有很少資訊。

「要不要登入」一欄，凡是標「只看到摘要」的網站，登入規定也是摘要說的，請以你實際點開為準。

### 2.1 綜合靈感（各種類型都翻得到）

| 名稱 | 網址 | 看得到什麼 | 要不要登入 | 有沒有實際打開過 |
|---|---|---|---|---|
| Remotion 官方作品牆 | <https://www.remotion.dev/showcase> | 用和我們同一套工具做出來的成品：產品發表片、年度回顧、教學片 | 不用 | 只看到摘要（網站被擋） |
| Remotion 範本頁 | <https://www.remotion.dev/templates> | 官方範本清單，可以看每種範本的畫面 | 不用 | 只看到摘要（網站被擋） |
| Vimeo Staff Picks | <https://vimeo.com/channels/staffpicks> | Vimeo 編輯精選的高品質動畫。偏橫式、偏藝術短片，不是短影音格式 | 不用 | 只看到摘要（網站被擋） |
| Motionographer | <https://motionographer.com/> | 動態設計業界的作品展示，附製作訪談 | 不用 | 只看到摘要（網站被擋） |
| Stash Media | <https://www.stashmedia.tv/> | 商業動畫、3D 產品廣告的大型片庫 | 完整片庫要付費訂閱 | 只看到摘要（網站被擋） |
| Behance（動態設計分類） | <https://www.behance.net/search/projects?field=motion+graphics> | 完整專案，常附分鏡和過程圖。可搜 product animation、explainer、collage animation | 瀏覽不用 | 只看到摘要（網站被擋） |
| Dribbble（動態設計標籤） | <https://dribbble.com/tags/motion-graphics> | 短小的設計片段，偏介面和插畫 | 瀏覽不用，翻多了會要求註冊 | 只看到摘要（網站被擋） |
| School of Motion 靈感網站清單 | <https://www.schoolofmotion.com/blog/motion-design-inspiration-sites> | 一篇整理文，列出更多靈感網站，可當延伸入口 | 不用 | 只看到摘要 |
| Art of the Title | <https://www.artofthetitle.com/> | 電影影集的片頭設計，適合參考開頭 2 秒的標題排版 | 不用 | 只看到摘要（網站被擋） |

### 2.2 產品介紹／3D 動畫

| 名稱 | 網址 | 看得到什麼 | 要不要登入 | 有沒有實際打開過 |
|---|---|---|---|---|
| Animagraffs | <https://animagraffs.com/about/> | 「東西怎麼運作」的 3D 拆解動畫（引擎、直升機傳動），零件會真的動 | 不用 | 只看到摘要（網站被擋） |
| Branch Education | <https://www.youtube.com/channel/UCdp4_l1vPmpN-gDbUwhaRUQ> | 擬真 3D 講晶片、CPU、GPU 怎麼製造與運作 | 不用 | 只看到摘要。頻道代號取自搜尋結果，請點開確認是不是這個頻道 |
| Jared Owen 專訪 | <https://www.blendernation.com/2018/11/19/meet-the-artist-jared-owen/> | 乾淨、不追求擬真的 3D 解說動畫，最接近我們做得到的質感 | 不用 | 只看到摘要。他的 YouTube 頻道網址我沒有確認到，所以只列專訪 |
| Moonb：12 個 3D 產品動畫案例 | <https://www.moonb.io/blog/3d-product-animation> | Samsung、PlayStation、IKEA 等品牌的產品動畫，依「這支片要證明什麼」分類 | 不用 | 只看到摘要。是動畫公司的行銷文 |
| Moonb：22 支 3D 解說影片 | <https://moonb.io/blog/3d-explainer-videos> | 剖面透視與爆炸拆解的案例（Dyson 馬達、Nokian 輪胎） | 不用 | 只看到摘要 |
| Advids：30 支爆炸圖影片 | <https://advids.co/blog/30-creative-3d-exploded-view-video-examples-to-showcase-technical-insights> | 工業產品的爆炸圖合輯，可大量看不同做法 | 不用 | 只看到摘要。行銷公司合輯，品質參差 |
| Advids：SaaS 產品發表片 | <https://advids.co/blog/saas-product-launch-videos> | 30 支軟體產品發表片，含 3D、等距、裝置展示 | 不用 | 只看到摘要 |
| XO3D：爆炸動畫指南 | <https://xo3d.co.uk/resources/3d-animation/product-animation/exploded-animations/> | 爆炸動畫的做法規則：沿同一軸分離、依序揭露 | 不用 | 只看到摘要 |
| Motion The Agency：產品 3D 類型 | <https://www.motiontheagency.com/blog/3d-animation-for-product-videos> | 把產品 3D 分成轉盤、爆炸、剖面、機構運作並附實例 | 不用 | 只看到摘要 |
| Advids：等距設計說明 | <https://advids.co/insights/isometric-design-in-motion-why-this-style-is-perfect-for-visualizing-systems-and-processes> | 為什麼等距視角適合講系統與流程 | 不用 | 只看到摘要 |
| GarageFarm：等距動畫介紹 | <https://garagefarm.net/blog/isometric-animation-breathing-life-into-stylized-worlds> | 等距風格怎麼做（完整 3D 建模加正交相機） | 不用 | 只看到摘要 |
| Sketchfab | <https://sketchfab.com/features/gltf> | 線上 3D 模型庫，可以轉動檢視別人的產品模型 | 瀏覽不用；下載要你的帳號，每個模型授權不同 | 只看到摘要（網站被擋）。我不會繞過登入 |
| 免費 3D 素材比較 | <https://app.cinevva.com/guides/sketchfab-polyhaven-kenney> | 比較 Kenney、Quaternius、Poly Haven 等免費素材的授權 | 不用 | 只看到摘要。第三方整理，授權要到各站官方頁確認 |
| Remotion 3D 手機範本 | <https://github.com/remotion-dev/template-three> | 官方範本：一支可換螢幕畫面的 3D 手機 | 不用 | 未開（網址來自搜尋結果） |
| Remotion 載入模型範例 | <https://github.com/remotion-dev/glb-example> | 官方範例：怎麼載入 GLB 模型 | 不用 | 未開（網址來自搜尋結果） |

### 2.3 AI 教學／工具教學（介面、螢幕錄影、流程圖）

| 名稱 | 網址 | 看得到什麼 | 要不要登入 | 有沒有實際打開過 |
|---|---|---|---|---|
| 60fps.design | <https://60fps.design/> | 真實 App 介面動畫的短片資料庫，看「介面怎麼動才好看」 | 部分功能要付費 | 只看到摘要（網站被擋） |
| Screen Studio | <https://screen.studio/> | 「錄影後自動放大到游標位置」這種教學片外觀的代表產品 | 付費的 Mac 軟體 | 只看到摘要（網站被擋） |
| OpenScreen（社群接手版） | <https://github.com/getopenscreen/openscreen> | 免費開源的螢幕錄影工具，有自動放大、游標平滑、字幕，三個平台都能用 | 不用 | 打開過 |
| Cap | <https://github.com/CapSoftware/Cap> | 另一個開源錄影工具，錄完可加背景、放大、字幕 | 不用 | 打開過 |
| claude-code-video-toolkit | <https://github.com/digitalsamba/claude-code-video-toolkit> | 用程式自動操作瀏覽器並錄影的做法 | 不用 | 打開過首頁；自動錄影的細節只看到摘要 |
| remotion-fireship | <https://github.com/wcandillon/remotion-fireship> | 用和我們同一套工具重做 Fireship 那種快節奏科技解說 | 不用 | 打開過 |
| Fireship | <https://www.youtube.com/@Fireship> | 「100 秒講完一個技術」的快節奏格式：大字、圖示、程式碼快切 | 不用 | 只看到摘要 |
| 亞里 YaRi 資源頁 | <https://yari.lol/resources/> | 用 AI 寫程式做影片的提示詞與資源，和我們是同一條技術路線 | 不用 | 未開（網站被擋；網址來自已安裝的技能文件） |
| claude-motion-playbook | <https://github.com/PHY041/claude-motion-playbook> | 動效做法整理 | 不用 | 未開 |
| remotion-readme-kit | <https://github.com/ofershap/remotion-readme-kit> | 終端機打字、前後對照分割畫面的小範本 | 不用 | 打開過。很小的專案 |
| Remotion 程式碼動畫範本 | <https://github.com/remotion-dev/template-code-hike> | 程式碼或提示詞「一步步變化」的動畫 | 不用 | 打開過。沿用 Remotion 授權，不是完全免費 |
| Motion Canvas | <https://github.com/motion-canvas/motion-canvas> | 配旁白的向量解說動畫（流程圖、示意圖）。只參考畫面，不換引擎 | 不用 | 打開過 |
| React Flow | <https://github.com/xyflow/xyflow> | 節點流程圖的外觀（節點卡片、連線） | 不用 | 打開過 |
| Magic UI | <https://github.com/magicuidesign/magicui> | 動畫介面元件庫，看仿介面元件的外觀 | 不用 | 打開過 GitHub；個別元件沒確認 |
| Rough.js | <https://github.com/rough-stuff/rough> | 把圖形畫成手繪草稿感，白板手繪風的技術基礎 | 不用 | 打開過 |
| excalidraw-animate | <https://github.com/dai-shi/excalidraw-animate> | 手繪圖「一筆一筆畫出來」的效果 | 不用 | 打開過 |
| 3Blue1Brown／Manim | <https://github.com/3b1b/manim> | 深色底、線條圖形平滑變形的數學圖解，適合講 AI 原理 | 不用 | 只看到摘要 |
| HyperFrames | <https://github.com/heygen-com/hyperframes> | 另一套用 HTML 出片的框架，有現成的片頭與動態文字組件 | 不用 | 只看到摘要 |

### 2.4 股票／財經

| 名稱 | 網址 | 看得到什麼 | 要不要登入 | 有沒有實際打開過 |
|---|---|---|---|---|
| Vox | <https://www.youtube.com/@Vox> | 紙拼貼新聞解說的代表，現有風格的對照標竿 | 不用 | 未開 |
| 柴鼠兄弟 ZRBros | <https://www.youtube.com/@zrbro> | 台灣理財頻道，用比喻講投資觀念。摘要沒有證實它的畫面形式，主要參考白話寫法 | 不用 | 未開；背景資料來自媒體報導的摘要 |
| 志祺七七的短影音策略（數位時代報導） | <https://www.bnext.com.tw/article/76920/youtuber-shorts-audience> | 台灣時事短影音的節奏與選題。該頻道曾有政治立場爭議，只參考形式 | 不用 | 只看到摘要 |

游庭皓的財經皓角在搜尋摘要裡有出現，但我沒有確認到網址，所以沒有列。

### 2.5 感情／社會觀察

| 名稱 | 網址 | 看得到什麼 | 要不要登入 | 有沒有實際打開過 |
|---|---|---|---|---|
| Kapwing 訊息故事教學 | <https://kapwing.com/resources/how-to-make-a-fake-texting-story-video> | 手機聊天畫面、訊息一則一則跳出來的影片怎麼做 | 不用 | 只看到摘要 |
| The School of Life 設計案例 | <https://creativemoment.co/case-study-school-of-life-and-natalka-design> | 極簡手繪畫面加一兩個重點色的做法 | 不用 | 只看到摘要 |
| Psych2Go | <https://www.youtube.com/@Psych2go> | 柔和手繪插畫講心理與感情 | 不用 | 未開 |
| 臺灣吧 Taiwan Bar | <https://www.youtube.com/@TaiwanBar> | 台灣知識型角色動畫，台灣口吻與幽默節奏 | 不用 | 未開；背景資料來自媒體報導的摘要 |

### 2.6 短影音廣告（看前 3 秒怎麼抓人）

| 名稱 | 網址 | 看得到什麼 | 要不要登入 | 有沒有實際打開過 |
|---|---|---|---|---|
| TikTok Creative Center 熱門廣告 | <https://ads.tiktok.com/business/creativecenter/inspiration/topads/pc/en> | 官方的熱門直式廣告庫，可依產業、地區篩選 | 不登入只能看幾支，免費帳號登入後看全部 | 只看到摘要（網站被擋） |
| Meta 廣告檔案庫 | <https://www.facebook.com/ads/library/> | Facebook、Instagram 投放中的廣告，可查特定品牌現在用什麼影片 | 摘要說不用 | 只看到摘要（網站被擋） |
| YouTube Charts | <https://charts.youtube.com/> | YouTube 的分類排行榜。幫助有限：我沒有找到「依國家看 Shorts 熱門」的官方頁面 | 不用 | 未開 |

### 2.7 這次打不開的網站

以下網站在這個環境連不上，原因是網路設定沒有放行，不是網站壞掉：remotion.dev、vimeo.com、motionographer.com、stashmedia.tv、artofthetitle.com、behance.net、dribbble.com、ads.tiktok.com、facebook.com、yari.lol、screen.studio、60fps.design、codehike.org、remotion-bits.pages.dev、sketchfab.com、higgsfield.ai、animagraffs.com，以及 YouTube。

要我直接看這些網站再拆解，需要你在環境的網路設定把對應網域加進允許清單。我不會繞過登入或反爬蟲機制。

---

## 3. 四個頻道各兩個方向

時間與金額說明：下面的「多花多少」都是**我的估算，沒有實測**，除非特別寫「量過」。「第一次」指第一支片要先做一套新元件的一次性工作；「之後每支」指元件做好後每支片比現在多出來的部分。

### 3.1 科技頻道

現有紙拼貼（blueprint 外觀）建議**只留給科技新聞題材**，產品介紹換成下面其中一個。

| | 方向 A：風格化 3D 產品台 | 方向 B：等距 3D 小場景 |
|---|---|---|
| 長什麼樣 | 乾淨的單色背景，產品在中間轉一圈，然後零件沿同一個方向一層一層分開、懸在空中，旁邊貼標籤，念到哪一層哪一層亮起來，最後合回去。 | 從斜上方往下看的迷你模型世界，沒有透視變形，顏色少、形狀圓潤。小機器、小方塊沿著路線移動，像桌遊的棋盤。 |
| 適合的題材 | 單一產品：手機、伺服器、晶片封裝怎麼一層一層疊 | 系統與流程：供應鏈、資料中心怎麼運作、晶片從設計到出貨 |
| 技術路線 | Remotion 加 Three.js（@remotion/three）。零件用基本形狀自己建，動作由配音時間點驅動。標籤和字幕沿用現有的 2D 元件。 | 同樣用 Three.js，改用正交相機、不反光的單色材質，物件少於 30 個。素材自己建或用免費授權的低多邊形素材包。 |
| 多花多少 | 不花錢。第一次要做模型與燈光設定，估計比現在一支片多一到兩倍工作量。算圖：60 秒的片估計 15–30 分鐘。 | 不花錢。第一次的工作量和 A 差不多，之後每支因為模型可重複用，比 A 省。算圖是 3D 裡最快的。 |
| 風險 | 模型太簡陋會像積木。真實產品的商標不能畫。零件結構畫錯會變成事實錯誤，要有資料來源。 | 容易看起來像遊戲素材拼湊，要先訂好一套色票與光線。看不到單一產品的細節。 |
| 參考 | Animagraffs、XO3D 爆炸動畫指南、Advids 爆炸圖合輯 | Advids 等距設計說明、GarageFarm 等距動畫介紹、Jared Owen |

#### 產品 3D 的限制與三條路線（重要）

這台機器是 4 核心處理器、沒有顯示卡。以下是實際量到的和估算的，分開寫：

**量過的：**
- repo 目前的算圖設定開不出 3D 畫面，Three.js 會直接報錯。要改一個設定（改用 swangle）才能畫。
- 改了之後，用 Three.js 在無畫面的瀏覽器裡畫一張 1080×1920 的圖：15 個物件加陰影約 0.15 秒；60 個物件加柔和陰影約 0.39 秒；再換成金屬清漆材質約 0.41 秒。
- 磁碟只剩大約 2GB。

**沒量過、只是估算的：**
- 上面是瀏覽器裸跑的時間，還沒有接進 Remotion 實測。估一支 60 秒（1800 張圖）的 3D 片要 15–30 分鐘。
- 環境反射、光暈、玻璃折射沒有測。這些在沒有顯示卡的情況下通常會再慢好幾倍。

| 路線 | 做得出什麼 | 花費 | 主要限制 | 建議 |
|---|---|---|---|---|
| 1. Three.js 直接在 Remotion 裡算 | 乾淨、風格化的 3D：爆炸圖、轉盤、剖面、等距場景、零件運作 | 不花錢 | 沒有擬真反光與景深，質感偏平。現行規範禁止 3D，要新開一個風格版本（styleVersion 4）。Remotion 文件的摘要說沒有顯示卡時「可能很慢」，而且多工算圖可能出現畫面錯位，所以 3D 片要單工算。 | **先走這條** |
| 2. Blender 預先算好再貼進片子 | 擬真質感（金屬、玻璃、攝影棚光） | 軟體免費，但很花時間 | 機器上沒有裝 Blender。安裝檔 428MB（我實際在 PyPI 上確認過），磁碟只剩 2GB，現在裝有風險，所以沒有裝也沒有測速。一般經驗是純處理器算擬真畫面每張要幾十秒到幾分鐘，整支片不實際。 | 只在需要少數幾個 3–5 秒的主鏡頭時考慮，最好在有顯示卡的機器上做 |
| 3. 影片生成 API（Higgsfield 等） | 用一張產品圖生成運鏡片段 | 付費，另外儲值、按秒計費。第三方文章說最低儲值 5 美元、一段 5 秒約 0.5–1.5 美元，**官方價目我沒有看到**，要以官網為準。 | 產品外觀可能變形、商標文字會亂掉、每次結果不同、很難對準配音。和現行規範「AI 生圖不用」衝突。 | 暫時不建議，除非你確定要擬真質感又沒有顯示卡機器 |

建議的第一步：先做一支 10–15 秒的 3D 試片（一個產品的轉盤加爆炸圖），量出接進 Remotion 後真正的算圖時間，再決定要不要整支片用 3D。

### 3.2 股票頻道

現有紙拼貼（newsprint 外觀）**建議保留**，它本來就是新聞感，和時事題材最合。

| | 方向 A：紙拼貼只做時事（保留現有） | 方向 B：資料圖表主導 |
|---|---|---|
| 長什麼樣 | 現在 stock-jensen 那樣：軟木板、報紙色紙、黑白照片、剪報。 | 整個畫面就是一張會動的圖：折線邊畫邊標註、長條互相超車、數字滾動，只配少量圖示和重點字。 |
| 適合的題材 | 公司事件、人物、政策、財報新聞 | 常態題材：某檔股票五年走勢、ETF 比較、利率與匯率 |
| 技術路線 | 已經做好，不用動。 | repo 的 v2 已經有折線圖、長條圖（含賽跑）、方格圖、大數字、動態大字，重新配一套財經色票即可。 |
| 多花多少 | 零。 | 不花錢。第一次要配色票和調版面，估計比現在一支片多半倍工作量；之後每支和現在差不多。 |
| 風險 | 每支都像新聞；和其他頻道撞風格（如果其他頻道也留紙拼貼）。 | 風險在內容：數字要上片當天重查，不能有投資建議。漲跌的紅綠色台灣和美國相反，一定要加文字標示。 |
| 參考 | Vox | 柴鼠兄弟（比喻寫法） |

兩個方向可以並存：時事用 A、常態題材用 B。

### 3.3 感情頻道

現有紙拼貼（notebook 外觀）**可以留作備用**，但建議主力換成下面其中一個，和股票頻道拉開差異。

| | 方向 A：對話泡泡（訊息故事） | 方向 B：柔和手繪插畫加大字金句 |
|---|---|---|
| 長什麼樣 | 手機聊天畫面，訊息一則一則跳出來，有「輸入中」的點點，最後一則是轉折。觀眾像在看別人的對話。 | 簡單線條的無臉人物與場景，配色少而柔和，只用一兩個顏色點出重點，畫面常停在一句大字上。 |
| 適合的題材 | 情境題：已讀不回、曖昧、吵架怎麼收尾 | 觀念題：依附類型、統計數字背後的意思 |
| 技術路線 | repo 的 v3 已經有中性的自製手機畫面，加聊天泡泡與輸入中動畫即可，泡泡跟著配音跳出。 | 用 SVG 手繪線條加描線動畫。人物用無臉的簡化造型。 |
| 多花多少 | 不花錢。第一次工作量小（估計多不到半倍），之後每支很省。 | 不花錢，但每支都要新畫插畫，是所有方向裡人力最高的，估計每支比現在多一倍以上。 |
| 風險 | 平台上很多這類影片是捏造的假對話。我們要明講是情境示意，介面用中性樣式，不仿冒真實通訊軟體。 | 畫得不好會顯得廉價。現行規範不用 AI 生圖，所以只能程式畫或用授權圖庫。 |
| 參考 | Kapwing 訊息故事教學 | The School of Life、Psych2Go、臺灣吧 |

### 3.4 AI 教學頻道

現有紙拼貼（sticky 外觀）**建議不再當主力**，你已經說要改成其他方式。

| | 方向 A：仿介面動畫 | 方向 B：真實螢幕錄影加自動放大 |
|---|---|---|
| 長什麼樣 | 自己畫的簡化介面：聊天視窗、輸入框、按鈕。提示詞一個字一個字打出來，游標滑過去點下去，AI 的回覆逐行冒出來。中間穿插方塊與連線的流程圖，鉤子用動態大字。 | 錄下真的工具操作畫面，放在圓角框裡。鏡頭自動推近到游標點擊的地方，游標放大、點擊有波紋。 |
| 適合的題材 | 教提示詞怎麼寫、工具怎麼串、AI 怎麼運作 | 一步一步跟著做的工具教學 |
| 技術路線 | 全部用現有工具（Remotion 加 HTML、CSS、SVG），不需要 3D。新做一組元件：視窗框、假游標、打字輸入、聊天泡泡、節點連線、前後對照。 | 需要錄影素材。兩條路：你自己錄好給我（OpenScreen 免費）；或用程式自動操作網頁並錄影，這條我還沒在這個環境試過。 |
| 多花多少 | 不花錢。第一次要做元件庫，估計比現在一支片多一倍工作量；之後每支成本很低。 | 錄影工具免費。每支都要重新錄，是 AI 頻道裡成本最高的；需要你花時間錄，或先做自動錄影的小測試。 |
| 風險 | 做得太像某個真實產品會有商標問題。畫面上的 AI 回覆必須是真的用該工具跑出來再照抄，不能編造，而且要記下是哪個模型、哪一天跑的。 | 需要登入的工具無法在這個環境自動錄。畫面可能錄到個人資料與帳號名稱，要先遮蔽。工具改版後畫面就過時。橫式錄影放進直式畫面字會很小，要放大局部。 |
| 參考 | 60fps.design、Magic UI、remotion-fireship、Fireship | Screen Studio、OpenScreen、claude-code-video-toolkit |

兩個方向可以混用：以 A 為主，需要證明「真的做得到」時插 5–10 秒的 B。講原理的單元（例如模型怎麼學習）可以另外考慮 Manim 那種線條圖解，但節奏偏慢，不建議當主力。

### 3.5 我推薦的組合

| 頻道 | 推薦 | 紙拼貼去留 |
|---|---|---|
| 科技 | 方向 A：風格化 3D 產品台 | 只留給科技新聞題材 |
| 股票 | 時事用紙拼貼、常態題材用圖表 | 保留 |
| 感情 | 方向 A：對話泡泡 | 備用 |
| AI 教學 | 方向 A：仿介面動畫，必要時插真實錄影 | 不再當主力 |

理由：

- 四個頻道一眼就分得出來（3D、紙與圖表、手機對話、介面）。
- 除了科技頻道的 3D，其他三個都能用 repo 已經有的元件延伸，不花錢、算圖速度不變。
- 3D 是唯一有技術不確定性的，所以先做 10–15 秒試片量時間，不會一次投入整支。
- 建議的製作順序：AI 教學的仿介面（最確定、你也明講要改）→ 感情的對話泡泡 → 科技的 3D 試片 → 股票的圖表版。

---

## 4. 需要你決定的事

| # | 要決定什麼 | 我的建議 |
|---|---|---|
| 1 | 每個頻道選哪個方向（第 3 節各兩個） | 照 3.5 的組合 |
| 2 | 要不要開放 3D。現行規範寫 v2、v3 不用 3D | 同意新開一個風格版本（styleVersion 4）專門放 3D，舊片與舊規則不動 |
| 3 | 3D 走哪條路線 | 先走路線 1（Three.js），做一支 10–15 秒試片量時間再說 |
| 4 | 要不要擬真質感（發表會那種） | 先不要。真的需要時，再考慮在有顯示卡的機器上用 Blender 算少數鏡頭 |
| 5 | 要不要用付費的影片生成 API。現行規範寫不用 AI 生圖 | 先不要。會花錢、產品外觀會變形、很難對準配音 |
| 6 | 產品模型怎麼來 | 用基本形狀自己建中性造型，不畫真實商標。要用現成模型時，由你用自己的帳號下載並確認授權 |
| 7 | AI 教學要不要用真實螢幕錄影 | 以仿介面為主。要示範真實工具時由你錄 5–10 秒給我；自動錄影要先做小測試 |
| 8 | 紙拼貼留給誰 | 股票的時事題材保留當主力；科技新聞可用；感情備用；AI 教學不用 |
| 9 | 要不要放行參考網站，讓我能實際看片 | 建議至少放行 remotion.dev（技術文件）和 YouTube。不放行也可以，改由你截圖或貼網址給我 |
| 10 | 磁碟空間。現在只剩大約 2GB | 做 3D 之前先清掉 `out/` 裡的舊中間檔。裝 Blender 之前一定要先清 |
| 11 | 參考別人的程式碼時的授權 | Remotion 官方範本沿用 Remotion 授權（達一定規模的公司要付費），參考寫法可以、直接搬程式前要確認。Cap 是 AGPL 授權，只當工具用，不併進 repo |

你挑好之後，請告訴我：每個頻道選 A 或 B、有沒有看到特別喜歡的參考片（截圖或網址都可以）、先做哪一個頻道。

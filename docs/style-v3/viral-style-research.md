# 爆紅科技／知識短影音的畫面風格研究（不用 3D、不用 SVG 圖卡）

日期：2026/11/12（台灣時間）｜用途：`what-is-server` 前製，給使用者選方向用。這份只談畫面，旁白與配音另案。

## 0. 先講結論

- 2025–2026 表現好的知識短影音，畫面主流不是「向量圖卡」，而是**有實物質感的點陣素材**：實拍或照片、剪下來的紙片與貼紙、手寫筆跡、螢幕畫面，再加大字。
- 留人的共通做法有三個：第 0 秒就有完整畫面和一句主張；畫面每 2–4 秒有一次變化（換圖、推近、新元素貼上來）；字幕短、大、跟著聲音走。
- 推薦兩個方向，差異在「畫的」對「拍的」：
  - **A 桌面紙拼貼**：米色桌面上的剪紙插畫、便條紙、紙膠帶、手寫字，逐格感。親切、像有人在桌上擺給你看，最貼近「小知識介紹」。
  - **B 實拍照片大字報**：滿版真實照片（機房、網路線、手上的手機）、深色調、超大字、螢光筆標記。像紀錄片預告，最貼近「專業級」。
- 兩個方向 Remotion 都做得到，都不需要 3D 或 SVG 圖。成本差別在素材：A 要 12–16 張風格一致的插畫去背圖；B 要 10–14 張授權乾淨的照片。

## 1. 這份研究的可信度（先看）

- 這個雲端環境**只能用搜尋，打不開網頁**：`www.opus.pro`、`videoai.me`、`www.thenewslens.com`、`recapio.com`、`blog.youtube` 都被網路設定擋下（要看原文得在 session 的網路設定放行這些主機）。所以下面的描述來自搜尋摘要，加上對這些頻道的既有認識，**沒有逐支影片看過，也沒有登入或爬 IG／TikTok**。
- 搜到的趨勢文章大多是賣剪輯工具的廠商部落格（Opus、videoai.me、Fluxnote、paperanimation.ai 等），它們有推銷動機。文中的留存數字（例如「2–3 秒換鏡留存 82%」）只有單一廠商來源、沒公開方法，**只能當方向參考**。
- 沒找到平台官方的畫面風格數據。Instagram 方面，多個二手來源轉述 Mosseri 說 Reels 排序看觀看時間、每觸及按讚數、私訊分享，以及「動態裡大約一半時間是靜音」；原話沒查到。
- 頻道網址是頻道首頁，憑既有認識填寫，本次連線無法點開驗證，標「未驗證」。

## 2. 風格拆解

每種風格的「做得到嗎」是指我們的管線：Remotion 逐幀渲染，素材用點陣圖（AI 生成圖、免授權照片與影片、自製紙紋），不用 3D、不用 SVG 圖卡。

### 2.1 紙拼貼／剪紙（Vox 式）
- 代表：Vox（https://www.youtube.com/@Vox ，未驗證）；Common Craft 的剪紙解說是這一路的原型（https://www.commoncraft.com ，未驗證）。2026 年廠商文章把它叫 "Vox-style／paper-collage explainer"：https://videoai.me/blog/what-is-vox-style-video-explained-2026 、https://paperanimation.ai/blog/the-oldest-aesthetic-online-is-getting-creators-more-views-right-now
- 畫面：牛皮紙或方格紙底，撕邊色紙塊、剪下來的插畫或照片（白邊、落影）、剪字標籤、手繪箭頭，一幕一個重點。
- 節奏：一幕 4–8 秒，幕內每 1.5–3 秒貼上一個新紙片；動作常是 12fps 的逐格感。
- 字幕：下方短句，或直接做成紙條標籤貼在畫面裡。
- 為什麼留人：滑到時跟一般螢幕感的畫面不一樣，手作感讓人停一下；一次一個物件進場，等於幫旁白指路。
- 做得到嗎：**做得到**。紙片是 PNG，進場用位移加旋轉，逐格感用「每 2–3 幀才更新一次位置」。
- 成本與風險：要一整套風格一致的去背圖；AI 生圖風格容易漂；不規則落影要先烤進 PNG（管線實測 `filter` 很貴）。

### 2.2 實拍／照片＋大字（紀錄片式）
- 代表：Johnny Harris（https://www.youtube.com/@johnnyharris ）、Cleo Abram（https://www.youtube.com/@CleoAbram ）、Phil Edwards（https://www.youtube.com/@PhilEdwardsInc ），皆未驗證。Phil Edwards 的做法訪談：https://theexplainers.substack.com/p/making-the-trivialnontrivial-how （他把稿子寫成兩欄：左旁白、右畫面）。
- 畫面：滿版實拍或資料照片，慢推近；大字壓在畫面上；文件、螢幕截圖、地圖做圈點和螢光筆。搜尋摘要對 Johnny Harris 的描述是「地圖動畫、文字效果、圖層疊加」。
- 節奏：2–4 秒換一張圖，重點字跟著重音打出來。
- 字幕：大字本身就是字幕的一部分；另有小字逐句。
- 為什麼留人：真實畫面帶來可信度；「看到實物」比看圖示更有現場感。
- 做得到嗎：**做得到**（照片加 Ken Burns 推拉、色調統一、大字）。影片素材也能用 `<OffthreadVideo>`，但渲染變慢。
- 成本與風險：授權要逐張記錄；不能有可辨識的真人和商標；免費圖庫的機房照片容易跟別人撞圖。

### 2.3 迷因快剪（Fireship 式）
- 代表：Fireship「100 Seconds」系列（https://www.youtube.com/@Fireship ，未驗證）。分析：https://www.wisp.blog/blog/how-to-create-video-content-like-fireship-hyperplexed-and-juxtoposed 、https://outlierkit.com/channel/fireship
- 畫面：迷因圖、截圖、程式碼、商標快速輪播，每句一張圖。
- 節奏：0.5–2 秒一張。
- 字幕：少量大字，靠旁白。
- 為什麼留人：資訊密度高加冷面幽默。分析文也提醒，光抄剪輯沒用，靠的是主持人的技術可信度和笑點。
- 做得到嗎：技術上可以，但**不建議**。迷因圖和商標有版權風險，語氣跟「親切說明」不合，受眾是非工程師。

### 2.4 螢幕錄影＋圈點
- 代表：一般科技教學類 Reels；ByteByteGo（https://www.youtube.com/@ByteByteGo ，未驗證）的系統圖解屬近親，但它是向量圖，不合本次限制。
- 畫面：手機或電腦畫面，放大鏡推近、手繪圈、箭頭。
- 節奏：每 2–3 秒移動一次焦點。
- 為什麼留人：「這就是你每天在用的畫面」，代入感強。
- 做得到嗎：**部分**。真實 App 畫面有商標和著作權問題，建議自己用 HTML 做一個「像聊天 App」的假畫面，或拍手持手機的照片。適合當 A、B 兩個方向裡的一兩鏡，不適合當整支風格。

### 2.5 手繪／白板
- 代表：minutephysics（https://www.youtube.com/@MinutePhysics ）、Casually Explained（https://www.youtube.com/@CasuallyExplained ），皆未驗證；中文圈常見白板加貼紙的財經解說。本次搜尋沒找到這幾個頻道的製作訪談。
- 畫面：白底、麥克筆線條一筆一筆畫出來，火柴人。
- 節奏：跟著講話畫，約 2–5 秒完成一個圖。
- 為什麼留人：看著東西被畫出來，會想等它畫完。
- 做得到嗎：**勉強**。「描線」在程式裡最自然的做法就是 SVG path，剛好是使用者不要的；改用點陣圖加遮罩擦出也行，但每張圖都要手工或 AI 生成線稿，質感不穩。當 A 方向裡的手寫註記用就好。

### 2.6 AI 生成插畫輪播（faceless 頻道）
- 代表：2026 年大量 faceless 頻道。台灣 2025 Q2 YouTube 教育類短影音觸及第一名是「AI Ani」（ShareParty 數據，The News Lens 報導 https://www.thenewslens.com/article/267369 ，原文打不開，只看到摘要）。
- 畫面：一句旁白配一張 AI 圖，慢推近。
- 節奏：3–5 秒一張。
- 為什麼留人：便宜、量大、題材獵奇。
- 做得到嗎：做得到，但**風險最高**：YouTube 2025/7 把「重複內容」改名「不真實內容（inauthentic content）」，鎖定大量模板化、低加工的影片；多個來源說 2026 年初又加強執行（二手來源：https://air.io/en/youtube-hacks/youtube-ai-disclosure-in-2026-label-it-yourself-or-youtube-will ）。純 AI 圖輪播也是觀眾最容易認出「這是 AI 片」的形式。AI 圖可以當素材，但要經過剪貼、排版、加手寫註記的二次加工。

### 2.7 定格實物／桌面俯拍
- 代表：桌面俯拍、用手移動紙道具的解說；Descript 的文章提到 Vsauce 式俯拍比投影片吸引人：https://descript.com/blog/article/5-ways-to-make-your-howto-video-more-visual
- 畫面：真的桌面、真的手、真的紙。
- 做得到嗎：**做不到真拍**（我們沒有攝影）。但可以用方向 A 模擬它的觀感：桌面紋理底圖加紙片 PNG 加逐格位移。不放手（避免生成真人肢體的怪異感）。

### 2.8 動態排版（大字為主）
- 代表：語錄、觀點類 Reels。字幕趨勢文章說 Hormozi 式黃字逐字彈跳已經飽和，轉向同樣逐字、但去掉黃色和音效的「動態極簡」：https://blitzcutai.com/blog/tiktok-caption-trends-2026 ；也有文章認為它只是變成標準配備：https://joyspace.ai/hormozi-editing-style-2026-analysis
- 做得到嗎：做得到，現有 KineticText 就是。但整支只有字會回到「圖卡感」，只當鉤子和轉折用。

### 2.9 3D 寫實解說（Zack D. Films 式）——排除
- vidIQ 追蹤顯示約 2,930 萬訂閱（2026/10）。這是目前最紅的知識短片形式之一，但它是 3D，使用者明確不要，管線也跑不動即時 3D。列出來只是說明：我們放棄的是流量最大的那一型，所以更要靠質感和旁白取勝。

## 3. 共通規則（兩個方向都適用）

1. 第 0 幀就要有完整畫面和一句主張，不做淡入黑場。
2. 畫面變化間隔 2–4 秒（一幕 5–10 秒，幕內靠 `cues` 進新元素或換圖）。變化要對到旁白的詞，不是固定節拍。
3. 字幕維持 v2 的「短語模式」：一次一段、單行、≤11 個全形字。中文不做逐字彈跳（中文逐字跳會碎）；重音詞放大或換色即可。英文副字幕保留。
4. 靜音也要看得懂：每幕畫面裡至少有一個字詞標籤說明這是什麼。
5. 英文單字（Server、App、IG、LINE）出現在畫面時用清楚的無襯線字，跟旁白念到的時間對齊，幫聽的人確認聽到的是哪個字。
6. 禁：真實人物、真實商標圖案（IG、LINE 只用文字提到，不放 logo）、片中 AI 標示、3D、SVG 圖卡、霓虹發光。

## 4. 推薦方向 A：桌面紙拼貼

一句話：像有人把剪好的紙片一張一張擺在桌上，講給你聽。

- 參考：2.1 加 2.7。
- 適合：把 Server 比喻成「一間不打烊的店」「幫你保管東西的櫃檯」這類生活比喻。
- 色表：
  - 桌面底 `#EFE6D4`（米色紙板）；深色備用底 `#2F4A3A`（切割墊綠，只用在轉折幕）
  - 紙片白 `#FFFDF7`；牛皮紙 `#C9A66B`；方格紙線 `#B9C7D6`
  - 強調：番茄紅 `#D9482B`、芥末黃 `#F2B632`、墨水藍 `#1F3A5F`、薄荷綠 `#7DB7A0`
  - 文字：墨黑 `#1E1B16`；次要 `#5B5245`
- 字體：
  - 標題與字幕：Noto Sans TC 900（已有）
  - 手寫註記：Iansui（芫荽，Google Fonts，繁中手寫體；要新增到字型鏡像，需確認抓得到）
  - 英文與數字：Inter 800（已有）；英文手寫註記用 Caveat 700
- 圖片素材：
  - 類型：去背 PNG 的單一物件插畫，每張 1024–1536px，全片 12–16 張；另有紙紋、撕邊紙條、紙膠帶、麥克筆圈和箭頭（都是 PNG，不用 SVG）。
  - 生成提示詞風格（英文，固定前綴）：`cut-paper collage illustration of {物件}, gouache and colored paper texture, visible paper grain, slightly uneven scissor-cut edges, flat front view, single object centered, limited palette of tomato red, mustard yellow, ink blue, mint green, cream, plain solid white background, no text, no logo, no people`
  - 物件清單範例：手機、一排機櫃、一台打開的伺服器、便利商店櫃檯、置物櫃、信封、網路線、雲、時鐘、電風扇、插頭、鎖。
  - 後製：去背後加 10–14px 白邊（貼紙感）和烤好的落影；全部圖過同一個色調校正，壓到色表內。
- 每鏡畫面構成（依骨架）：
  - hook（3 秒）：桌面上一支手機紙片加一張大紙條寫主張，第 0 幀就全部在；紙條被紙膠帶貼著，輕微晃一下。
  - you（5–7 秒）：手機紙片居中，旁邊依旁白貼上 2–3 張便條紙（傳訊息、看影片、付款），每張用手寫字。
  - mechanism（每幕 6–9 秒，共 2–3 幕）：左邊手機、右邊機櫃紙片，中間一條紙做的虛線路徑，信封紙片沿路徑逐格跳過去再跳回來。念到名詞時貼上撕邊標籤「Server＝伺服器」。
  - twist（5–7 秒）：底換成深綠切割墊，機櫃紙片放大，貼上時鐘、電風扇、鎖三張小紙片，說明它跟一般電腦哪裡不一樣。
  - payoff（5–7 秒）：回米色桌面，所有紙片排成一張「小地圖」，鏡頭從局部拉遠到全貌。
  - cta（3 秒）：一張大便條紙寫提問，旁邊留一張空白便條紙。
- 動態：
  - 紙片進場：從畫面外滑入加 3–6 度旋轉，6–8 幀落定，落定時縮放 1.04→1。
  - 逐格感：位置和旋轉每 2 幀更新一次（等於 15fps），落定後每 8–10 幀抖 1px、0.3 度（用固定 seed）。
  - 鏡頭：整個桌面在 cue 時推拉 0.96↔1，不連續縮放。
- 轉場：桌面橫移到「旁邊的桌面」（整張底圖平移 1080px，8 幀），或一張色紙從上蓋下來再掀開。不用淡入淡出。
- 字幕：畫面下方一張白色紙條（撕邊 PNG），中文 72px 900 墨黑，重點詞用芥末黃麥克筆底；英文 30px 在紙條下緣。位置沿用 v2 的 1270–1560。
- 禁忌：不用漸層、發光、玻璃質感；紙片不超過同時 5 張；不放人手、人臉；AI 圖不得直接滿版當背景；不放真實商標。
- 管線需求：新增一組 v3 元件（PaperStage、Cutout、TapeLabel、StickyNote、PaperCaption）；`public/v3/paper/` 放紋理與插畫（不 commit）；落影預先烤進 PNG。
- 成本：插畫生成加去背加調色，估 12–16 張；元件約 2–3 人日。
- 風險：AI 圖風格不一致（對策：固定前綴、同一批生成、統一調色、不合格就重生或換成色紙剪形）；生圖額度（只用現有金鑰與額度，不夠就減張數或改用照片去背）；做太可愛會不夠專業（對策：字體和排版保持克制）。

## 5. 推薦方向 B：實拍照片大字報

一句話：真實照片鋪滿畫面，上面壓大字和螢光筆，像紀錄片的預告。

- 參考：2.2 加 2.4 的一兩鏡。
- 適合：強調「Server 是真的存在的機器，放在真的房子裡」這個角度。
- 色表：
  - 底色（照片壓暗後）：近黑藍 `#0E1320`；照片統一做雙色調，暗部 `#0E1320`、亮部 `#E9E4D8`
  - 強調只用一個：螢光黃 `#F4E04D`（標記底）；輔助警示橘 `#FF6B35`（全片最多 2 次）
  - 文字：紙白 `#F6F2E8`；次要 `#B8B2A4`；標記底上的字用 `#0E1320`
- 字體：
  - 大字：Noto Sans TC 900，140–220px，字距收緊
  - 內文與字幕：Noto Sans TC 700
  - 英文與數字：Inter 800，全大寫小標用 Inter 600 加寬字距
  - 引用或感性句（最多 1 處）：Noto Serif TC 700（要新增到字型鏡像）
- 圖片素材：
  - 類型：直式或可裁成直式的真實照片 10–14 張，至少 1620×2880（留推近空間）。機房走道、機櫃特寫、閃燈、網路線束、海底電纜上岸站外觀、冷氣管線、手拿手機（只到手，不到臉）、深夜的辦公桌。
  - 來源：Pexels、Unsplash、Pixabay 這類可商用、免署名的圖庫（授權條款以官網為準；`pexels.com` 等主機目前不在這個環境的可連線名單，要先放行）。每張記在 `videos/what-is-server/assets.md`：網址、作者、授權、下載日。
  - 拿不到照片時的替代：AI 生成寫實照片，提示詞風格 `documentary photograph of {場景}, 35mm, available light, shallow depth of field, muted colors, no people, no text, no logo, vertical 9:16`。注意：寫實 AI 圖在 YouTube 屬於要揭露的類型（見第 6 節），優先用真照片。
  - 螢幕畫面：不用真實 App 截圖，用 HTML 自製一個中性的聊天畫面。
- 每鏡畫面構成：
  - hook（3 秒）：滿版機房走道照片，第 0 幀大字主張壓在中間，關鍵詞有螢光黃底；照片慢推近 1→1.06。
  - you（5–7 秒）：手拿手機的照片，畫面裡疊一個自製聊天畫面，念到「按下送出」時畫面裡的訊息飛出框外。
  - mechanism（每幕 6–9 秒，共 2–3 幕）：畫面上下分割，上半手機照片、下半機櫃照片，中間一條白線；念到哪邊，哪邊變亮、另一邊壓暗。名詞出現時打出大字「SERVER」加小字「伺服器：專門服務別人的電腦」。
  - twist（5–7 秒）：連續三張特寫快切（冷氣、電源、門鎖），每張 1.5–2 秒，各一個大字：不關機、不斷電、不讓人進。
  - payoff（5–7 秒）：從機櫃特寫拉遠到整排機房，大字收成一句話。
  - cta（3 秒）：純色底 `#0E1320` 加一句提問，是全片唯一沒有照片的一幕。
- 動態：
  - 照片：每張都在動，推近或橫移，速度固定（每秒 1–1.5%），不來回。
  - 大字：整行從遮罩下方推上來，6 幀；重音詞的螢光底從左擦到右，8 幀。
  - 圈點：螢光筆筆觸是 PNG，用遮罩擦出。
- 轉場：硬切為主，切點對在旁白的詞頭；段落轉換用 2 幀白閃，或前一張推近到模糊再接下一張。不用溶接。
- 字幕：畫面下方不加底板，中文 68px 900 紙白加細黑描邊和小陰影，重點詞螢光黃底配深色字；英文 28px。因為照片亮度不一，字幕區下方先壓一層由下往上的暗漸層。
- 禁忌：不放可辨識的人臉和商標；不用圖庫裡「戴耳機的工程師對鏡頭笑」這類擺拍；一幕最多一個大字句；不用超過兩種強調色；不用貼紙、表情符號。
- 管線需求：新增 v3 元件（PhotoStage 含推拉與雙色調、BigType、MarkerSwipe、SplitPhoto、PhoneMock）；雙色調預先用 sharp 或 ffmpeg 處理成檔案，不在渲染時用 `filter`。
- 成本：找圖加授權記錄加調色 10–14 張；元件約 2 人日。
- 風險：圖庫主機連不到（要放行或改由使用者提供照片）；撞圖；深色畫面跟頻道現有的米白 v2 差距大，等於換品牌色（要使用者點頭）。

## 6. 兩個方向對照與待確認

| | A 桌面紙拼貼 | B 實拍照片大字報 |
|---|---|---|
| 感覺 | 親切、手作、小知識 | 專業、紀實、有份量 |
| 素材 | 插畫去背圖（AI 生成加後製） | 真實照片（圖庫） |
| 底色 | 米色、亮 | 近黑藍、暗 |
| 動態 | 逐格、紙片貼上來 | 慢推近、硬切、大字 |
| 跟現有 v2 的距離 | 近（同為暖色紙感） | 遠（要換色調） |
| 主要風險 | AI 圖風格漂、太可愛 | 授權、圖庫連線、撞圖 |
| 對使用者原話 | 「親切、小知識、淺顯易懂」 | 「專業級的影片介紹」 |

我的建議：先做 A。它直接回應「親切的小知識介紹」，素材可控，跟頻道現有色調接得上；B 的照片可以在 A 裡借一兩鏡（把照片印成「拍立得」貼在桌上），補上真實感。

要請使用者決定的事：
1. 選 A、選 B，或 A 為主借 B 的照片。
2. 片中不加 AI 標示沒問題；但上傳時平台的揭露開關是另一回事。YouTube 的規定是「會被誤認為真實的寫實 AI 內容」要揭露，2026/5 起會自動偵測補標（二手來源，細節互有出入）。A 的插畫風通常不在此列；B 若用寫實 AI 圖就會碰到。Instagram 的規定這次沒查到。
3. B 要放行圖庫主機，或由使用者提供照片。

## 7. 沒做到的事

- 沒有逐支看影片、沒有量實際換鏡秒數；節奏數字是依搜尋摘要和既有認識估的。
- 台灣創作者的個案幾乎沒查到可用資料：只查到 2025 Q2 排行的頻道名稱（AI Ani、四方異聞、好奇萬花筒、環球趣聞等），查不到它們的畫面描述。志祺七七、泛科學、啾啾鞋的短影音做法這次沒有可引用的來源。
- 沒有做樣張圖（關鍵幀），這份只到規格。
- 沒有實測生圖額度，也沒有確認 Iansui、Noto Serif TC 能否抓進字型鏡像。

## 8. 來源

- 2026 短影音剪輯美學（廠商，僅摘要）：https://www.opus.pro/blog/editing-aesthetics-dominating-short-form-2026
- Vox 式紙拼貼解說（廠商，僅摘要）：https://videoai.me/blog/what-is-vox-style-video-explained-2026
- 紙拼貼與報紙剪字鉤子（廠商，僅摘要）：https://paperanimation.ai/blog/the-oldest-aesthetic-online-is-getting-creators-more-views-right-now
- Canva 做 Vox 式開場的教學摘要：https://recapio.com/digest/how-to-make-killer-vox-style-intros-in-canva-by-lilly-s-tech-tips
- After Effects 做 Vox 式動畫的教學摘要：https://recapio.com/digest/how-to-create-vox-style-animations-in-after-effects-by-seiji-yushin
- Phil Edwards 製作方法訪談：https://theexplainers.substack.com/p/making-the-trivialnontrivial-how
- Fireship 風格分析：https://www.wisp.blog/blog/how-to-create-video-content-like-fireship-hyperplexed-and-juxtoposed 、https://outlierkit.com/channel/fireship
- 換鏡頻率與留存（單一廠商數據）：https://fluxnote.io/guides/faceless-shorts-retention-tips-2026
- 字幕樣式趨勢：https://blitzcutai.com/blog/tiktok-caption-trends-2026 、https://joyspace.ai/hormozi-editing-style-2026-analysis
- 台灣 2025 Q2 YouTube 短影音排行（ShareParty，The News Lens）：https://www.thenewslens.com/article/267369 、https://www.thenewslens.com/article/267388
- Zack D. Films 數據（vidIQ）：https://vidiq.com/pt/youtube-stats/channel/UCvz84_Q0BbvZThy75mbd-Dg/
- 俯拍比投影片吸引人（Descript）：https://descript.com/blog/article/5-ways-to-make-your-howto-video-more-visual
- YouTube AI 揭露與不真實內容政策（二手）：https://air.io/en/youtube-hacks/youtube-ai-disclosure-in-2026-label-it-yourself-or-youtube-will
- Reels 排序訊號（二手轉述）：https://blog.hootsuite.com/instagram-algorithm/
- Pexels 使用規則：https://help.pexels.com/hc/en-us/articles/360042332714-What-are-the-rules-for-using-Pexels-photos-or-videos

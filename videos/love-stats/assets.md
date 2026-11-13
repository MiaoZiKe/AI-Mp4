# assets.md — love-stats 素材紀錄

更新：2026/11/13。風格是 styleVersion 3 桌面紙拼貼，外觀 `notebook`（橫線筆記本＋粉橘便條）。素材只有兩種：本機程式做的紙材、Pexels 照片。**沒有 AI 生成的圖。** 圖檔都不 commit。

## 照片（6 張）

原圖在 `out/love-stats/assets-raw/photos/`。下載日 2026/11/13，取得方式：`huggingface.co` 上的資料集 `opendiffusionai/pexels-photos-janpf`（Pexels 照片鏡像），用 `python3 scripts/styleframes/find_pexels.py` 找、`--fetch love-stats 名稱=md5` 抓。六張原圖都用 Read 工具看過：沒有人、沒有人臉、沒有手、沒有商標或可讀的字。

| 代號 | 原檔 | 尺寸 | Pexels 編號與網址 | 內容 | 作者 | 用在 |
|---|---|---|---|---|---|---|
| `envelopes` | envelopes.jpg | 5680×3787 | 190295 https://www.pexels.com/photo/190295/ | 一疊米色信封的特寫，沒有字、沒有人 | 未核對 | `print-envelopes`：s01–s03（兩張疊放，上面那張被抽走）、封面 |
| `rings` | rings.jpg | 2048×1447 | 445986 https://www.pexels.com/photo/445986/ | 兩只金色戒指放在反光桌面，背景是散景，沒有手 | 未核對 | `polaroid-rings`：s03–s04「登記結婚」 |
| `survey` | survey.jpg | 4961×3508 | 265013 https://www.pexels.com/photo/265013/ | 木夾板夾一張空白紙，旁邊一杯咖啡和一盆小植物，俯拍；紙上沒有字 | 未核對 | `polaroid-survey`：s10–s14「萬人調查」 |
| `cup` | cup.jpg | 4608×3072 | 374147 https://www.pexels.com/photo/374147/ | 木桌上一杯拉花咖啡，俯拍；杯子上沒有標誌 | 未核對 | `print-cup`：s12–s15（同一張貼三次，代表「三個沒結婚的人」） |
| `chairs` | chairs.jpg | 3264×4928 | 1795510 https://www.pexels.com/photo/1795510/ | 兩張並排的空躺椅，沒有人 | 未核對 | `polaroid-chairs`：s15–s17「位子還空著」 |
| `rings-wood` | rings-wood.jpg | 3168×4752 | 265916 https://www.pexels.com/photo/265916/ | 兩只戒指放在木頭上，沒有手 | 未核對 | `polaroid-rings-wood`：s18–s20「離婚對數」（「近 3 年最低」另貼一張黃色便條） |

網址是用編號推的短網址格式，沒有實際打開確認過。編號是從下載當時 `find_pexels.py --fetch` 印出的表格列對回來的（用尺寸比對）。

### 和分鏡表不一樣的地方

- 分鏡寫「紅色喜帖信封」，鏡像裡找不到沒有字、沒有人的紅信封，改用米色信封；畫面上不寫「喜帖」兩個字，只當「一疊信封變薄」的意象。
- 分鏡寫「咖啡桌和兩張空椅子」，找到的是兩張空躺椅；意思一樣（位子空著），所以拍立得上寫「位子還空著」。
- 分鏡寫「兩只戒指分開放」，找到的是兩只戒指靠在一起放在木頭上；拍立得只寫「離婚對數」、旁邊另貼黃色便條「近 3 年最低」，不用照片暗示任何人的婚姻狀況。

### 裁切與調整（`videos/love-stats/assets.json`）

| 代號 | 調整 | 為什麼 |
|---|---|---|
| `rings` | `focus: [0.55, 0.55]` | 裁成 4:3 時讓戒指在中間 |
| `survey` | `crop: [0.05, 0, 1, 1]` | 裁掉左邊的空白 |
| `cup` | `crop: [0.2, 0, 1, 1]`、`focus: [0.42, 0.5]`、`lift: 0.4`，方形 | 讓杯子在正中間；原圖偏暗，提亮後手機上才看得清 |
| `chairs` | `lift: 0.6`，直式 | 原圖很暗，提亮 |
| `rings-wood` | `crop: [0, 0.3, 1, 1]`、`lift: 0.5`，直式 | 裁掉上面一片模糊的背景；提亮 |

沒有需要糊掉的地方（六張都沒有字或標誌）。調色跟著 `notebook` 外觀的 `soft`（柔和粉暖）。

### 授權與作者：未核對

- Pexels 官網在這個環境被 Cloudflare 的機器人驗證擋住（`videos/what-is-server/assets.md` 記過同樣的狀況），**沒有繞過**。所以目前的狀態是：「可商用、免標示」沒有對到 Pexels 官網原文；六張的作者都沒查到。
- 上片前要請人用一般瀏覽器確認：
  1. https://www.pexels.com/license/ 的現行授權條款。
  2. 上表六個照片網址都還在 Pexels 上、是 Pexels 授權，並把作者姓名補進表格。
- 任何一張對不上，就把那張拍立得拿掉或換成色紙便條；六張都只是配圖，拿掉不影響旁白和數字。

## 紙材（本機產生）

`python3 scripts/make-paper.py love-stats`（讀頂層 `skin: "notebook"`，固定 seed）→ `public/v3/love-stats/*.png`＋`meta.json`，不進 git。

- 通用紙片：便條 `note-*`、重點卡 `card-*`、紙條 `strip-*`、標籤 `label-s`、紅標 `tag-red`、膠帶 `tape-*`、圖釘 `pin-red`、麥克筆底線 `underline`、叉 `cross-0`、蓋場紙 `sheet-kraft`／`sheet-cream`、紙手機 `phone`。
- 這支片另外做的（`assets.json` 的 `papers`）：`cell-white`、`cell-red`（50×50 的小方塊，排成 10×10 的百格圖）。
- 圖表：紙條長條（s03）、紙條折線（s04）、大數字紙片（s03、s07、s08、s11、s16、s18）都是引擎用紙材拼的，不是圖片。

## 沒有用的東西

- 沒有 AI 生圖、沒有真人照片、沒有任何公司或交友軟體的畫面、沒有商標。
- 手機是紙手機（引擎內建的中性樣式），留言框是自製畫面，不是任何真實 App。

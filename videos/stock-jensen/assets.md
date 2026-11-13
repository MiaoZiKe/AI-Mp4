# assets.md — stock-jensen 素材紀錄

更新：2026/11/13（台灣時間凌晨，重做版：照片沒有重抓，只改了用在哪一鏡）。外觀 `newsprint`（軟木板＋報紙色紙）。素材只有兩種：本機程式做的紙材、Pexels 照片。**沒有 AI 生成的圖。** 圖檔都不 commit。

## 照片（8 張）

原圖在 `out/stock-jensen/assets-raw/photos/`。下載日 2026/11/13，取得方式：Hugging Face 上的 Pexels 鏡像 `opendiffusionai/pexels-photos-janpf`，用 `scripts/styleframes/find_pexels.py --fetch` 抓。每張都用縮圖看過：沒有人、沒有可辨識的商標。黑白報紙調色由 skin 自動套用。

| 代號 | 原檔 | 尺寸 | Pexels 編號與網址 | 內容 | 作者 | 用在 |
|---|---|---|---|---|---|---|
| `screen` | screen.jpg | 4608×3456 | 159888 https://www.pexels.com/photo/159888/ | 螢幕上的 K 線圖特寫，無人；左側小字欄已裁掉（crop 0.2–0.84），剩下的字在黑白縮圖裡讀不出來 | 未核對 | s08 |
| `papers` | papers.jpg | 6000×4000 | 167538 https://www.pexels.com/photo/167538/ | 用繩子綁起來的一大疊舊報紙，報頭看不到、內文讀不出 | 未核對 | s03 |
| `binders` | binders.jpg | 2592×1728 | 357514 https://www.pexels.com/photo/357514/ | 一疊裝滿文件的資料夾，無字 | 未核對 | s05 |
| `cabinet` | cabinet.jpg | 5457×3643 | 1370294 https://www.pexels.com/photo/1370294/ | 一整面金屬檔案櫃；上方書架的書背已裁掉（crop 上緣 0.2） | 未核對 | s13 |
| `chair` | chair.jpg | 5090×3393 | 2976970 https://www.pexels.com/photo/2976970/ | 會議桌旁的空皮椅，無人；只留下半部（牆上的電視與擺飾裁掉） | 未核對 | s01、s12、封面 |
| `kitchen` | kitchen.jpg | 3424×2752 | 187083 https://www.pexels.com/photo/187083/ | 掛滿鍋具的木架，無人、無字 | 未核對 | 這一版沒用 |
| `room` | room.jpg | 5184×3456 | 416320 https://www.pexels.com/photo/416320/ | 空的會議室，白色長桌與空椅，無人 | 未核對 | s07 |
| `calc` | calc.jpg | 5472×3648 | 209224 https://www.pexels.com/photo/209224/ | 計算機、原子筆與印出來的圖表，無公司名 | 未核對 | 這一版沒用 |

網址是用編號推的短網址格式，沒有實際打開確認過。

- 找不到貼切的：醬汁鍋／醬汁瓶（s11 改用「掛滿鍋具的廚房」，圖說寫「老店的醬汁」）、上鎖的掛鎖檔案櫃（s06 用一整面檔案櫃）、單張主管椅（s07 用會議桌旁的空椅）。
- 抓了但沒用的候選（已刪）：另一張看盤螢幕、另一疊報紙、兩張鐵鍊掛鎖、另一間會議室。

### 授權與作者：未核對

和 what-is-server 一樣：Pexels 官網在這個環境會被機器人驗證擋住，沒有繞過。所以作者欄都是「未核對」，授權條款也沒有對到官網原文。**上片前要請人用瀏覽器打開上表八個網址**，確認照片還在、授權是 Pexels License、記下作者。

- 示意照片：`chair`（封面、s01、s12）與 `room`（s07）的圖說「執行長的位子」是示意，不是輝達的辦公室；`screen`（s08）圖說已改「看盤畫面（示意）」，不是當天的輝達走勢。

## 自製紙材

`python3 scripts/make-paper.py stock-jensen`（讀 `assets.json`）。除了通用紙材，這支片自訂了：紅印 `stamp-red`／`stamp-s`、綠標 `stamp-mint`、牛皮標籤 `tagk`、日期籤 `datetag`、公文紙 `doc`、信封 `env`、信紙 `letter`、木條 `pole`、桌牌 `plate`、公司價值長條 `val-main`＋撕下的一段 `val-cut`、月曆 `cal`、兩欄表頭 `colhead-mint`／`colhead-yellow`、欄內紙條 `row`、配方紙 `recipe`、舊剪報 `oldclip`。全部是純色紙加字，沒有任何商標、報頭或人像。


## 重做版備註

- 八張照片沿用上一版抓的，這一版用了六張（`screen`、`papers`、`binders`、`cabinet`、`chair`、`room`），`kitchen`、`calc` 沒用到。
- 沒有任何黃仁勳本人的照片，也沒有皮衣之類的替代物；「人」用空椅子、空會議室與桌牌表示。
- `assets.json` 的自訂紙材裡，`stamp-mint`、`val-main`、`val-cut`、`cal`、`recipe` 這一版沒用到（留著不影響）。

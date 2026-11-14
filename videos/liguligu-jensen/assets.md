# assets.md — liguligu-jensen 素材紀錄

更新：2026/11/14。外觀 `newsprint`。素材只有本機程式做的紙材與 Pexels 照片，**沒有 AI 生成的圖**；圖檔都不 commit。

## 照片（4 張，沿用 stock-jensen 抓過的原檔，沒有重新下載）

從 `out/stock-jensen/assets-raw/photos/` 複製到 `out/liguligu-jensen/assets-raw/photos/`。原始來源：Hugging Face 上的 Pexels 鏡像 `opendiffusionai/pexels-photos-janpf`，2026/11/13 用 `scripts/styleframes/find_pexels.py --fetch` 抓。這次在成片畫面上再看過：沒有人、沒有可辨識的商標。

| 代號 | 原檔 | Pexels 編號與網址 | 內容 | 作者 | 用在 |
|---|---|---|---|---|---|
| `room` | room.jpg | 416320 https://www.pexels.com/photo/416320/ | 空的會議室，白色長桌與空椅，無人 | 未核對 | s02「董事會（示意照片）」 |
| `papers` | papers.jpg | 167538 https://www.pexels.com/photo/167538/ | 用繩子綁起來的一疊舊報紙，報頭看不到 | 未核對 | s04「華盛頓郵報報導（示意）」 |
| `binders` | binders.jpg | 357514 https://www.pexels.com/photo/357514/ | 一疊裝滿文件的資料夾，無字 | 未核對 | s06「董事會的獨立調查」 |
| `cabinet` | cabinet.jpg | 1370294 https://www.pexels.com/photo/1370294/ | 一整面金屬檔案櫃（上方書架已裁掉） | 未核對 | s07「國會想問他什麼？」 |

- 都是情境示意：不是輝達的會議室、不是那一天的《華盛頓郵報》、不是調查的真實卷宗。s02、s04 的圖說有寫「示意」；s06、s07 的圖說沒寫，要更保守可以補上。
- 沒有當事人的照片，也沒有用空椅子、皮衣、剪影這類替代物；「本人」只用一張寫著（空白）的紙表示。
- 授權與作者：未核對（Pexels 官網在這個環境被機器人驗證擋住，沒有繞過）。上片前請人用瀏覽器打開上表四個網址，確認照片還在、授權是 Pexels License、記下作者。網址是用編號推的短網址，沒有實際打開過。

## 紙材

`python3 scripts/make-paper.py liguligu-jensen`（讀 `assets.json`，固定 seed）。自訂：`notice`（公告紙，灰色橫條代表內文、不寫字，留一行給「辭職原因：」或（空白））、`doc`（聲明紙）、紅章 `stamp-red`／`stamp-s`、綠章 `stamp-mint`、黃章 `stamp-yellow`、牛皮標 `tagk`、日期籤 `datetag`、兩欄表頭 `colhead-mint`／`colhead-yellow`、欄內紙條 `row`、底部常駐紙條 `footer`（`rowwide` 沒用到）。全部是純色紙加字，沒有商標、報頭或人像；公司與媒體名稱只出現文字。

## 旁白

還沒有配音。`voice.voiceName` 是 "TBD"，等使用者用 `docs/prompts/liguligu-男聲試聽.txt` 試聽選定男聲後再配。現在的 `timeline.json` 是 `SILENT_RATE=4.75 node scripts/ui/silent-timeline.mjs liguligu-jensen` 的估算時間軸。

# assets.md — tech-cowos 素材紀錄

更新：2026/11/13（台灣時間）。風格是 styleVersion 3 桌面紙拼貼、skin `blueprint`。素材只有三種：本機程式做的紙材、色紙疊的物件、Pexels 照片。**沒有 AI 生成的圖。** 圖檔都不 commit（`out/`、`public/v3/` 在 .gitignore）。

## 照片（5 張）

原圖在 `out/tech-cowos/assets-raw/photos/`。下載日 2026/11/13，取得方式：Hugging Face 上的 Pexels 鏡像 `opendiffusionai/pexels-photos-janpf`，用 `scripts/styleframes/find_pexels.py` 依關鍵字找、`--fetch` 只抓指定的幾張。`aisle.jpg` 是從 `out/what-is-server/assets-raw/photos/` 複製過來的同一張。

| 代號 | 原檔 | 尺寸 | Pexels 編號與網址 | 內容 | 作者 | 用在 |
|---|---|---|---|---|---|---|
| `aisle` | aisle.jpg | 4000×1400 | 325229 https://www.pexels.com/photo/325229/ | 機房走道兩排機櫃，無人、無品牌銘板 | 未核對 | s01 拍立得「AI 伺服器機房」、s13 拍立得「AI 伺服器」 |
| `board` | board.jpg | 4656×3084 | 326461 https://www.pexels.com/photo/326461/ | 綠色電路板的線路特寫，無字樣、無商標 | 未核對 | s07 拍立得「主機板」 |
| `chip` | chip.jpg | 3132×2202 | 51165 https://www.pexels.com/photo/51165/ | 一顆封裝好的處理器，針腳那一面朝上，白底，看不到型號與商標 | 未核對 | s04 拍立得「包起來，有腳可以接」 |
| `chip2` | chip2.jpg | 3825×2550 | 40879 https://www.pexels.com/photo/40879/ | 同類處理器的另一個角度，針腳面朝上，看不到型號與商標 | 未核對 | s03 拍立得「封裝好的晶片」、s15 拍立得「一顆封裝」 |
| `tower` | tower.jpg | 5093×3395 | 1669787 https://www.pexels.com/photo/1669787/ | 灰色住宅大樓仰拍，無人、無招牌 | 未核對 | s19 拍立得「像蓋大樓」 |

網址是用編號推的短網址格式，沒有實際打開確認過。

### 抓了但沒用的（已從資料夾刪掉）

| Pexels 編號 | 為什麼不用 |
|---|---|
| 1010487 | 一疊處理器，底下那顆看得到品牌字樣與產地字，不符合「不出現真實商標」 |
| 1646330 | 圖說寫 microchip，實際是聖誕樹吊飾，和內容無關 |
| 558630 | 大樓仰拍，但畫面裡有監視器，構圖也不像「一層一層」 |

### 沒找到的

`silicon wafer`、`semiconductor`、`cleanroom` 在這份鏡像都是 0 張（`wafer` 搜到的是餅乾）。所以分鏡表原本要的「晶圓特寫」「無塵室」兩種照片沒有，s08 的「矽」改用紙標籤、s12 的「十幾年前」改用會倒數的年份紙片。沒有硬湊不相關的照片。

### 授權與作者：未核對

- Pexels 官網在這個環境被機器人驗證擋住（what-is-server 那次已試過，見該片 assets.md），這次沒有再試，也沒有繞過。
- 所以照實寫：**作者未核對、授權條款沒有對到官網原文**。上片前請人用瀏覽器打開上表五個網址，確認照片還在、授權仍是 Pexels License、記下作者名。
- 照片本身沒有 EXIF 作者欄位。

### 裁切與調色（`videos/tech-cowos/assets.json` 的 `photos`）

| 代號 | 做了什麼 | 為什麼 |
|---|---|---|
| `aisle` | 提亮 0.55，裁成橫式 | 原圖很暗，手機上看不清機櫃 |
| `board` | 提亮 0.2 | 讓線路清楚一點 |
| `chip`、`chip2` | 裁掉四周大片白底 | 讓晶片在拍立得裡夠大 |
| `tower` | 左右各裁 15%、做成直式、提亮 0.25 | 直式比較像「大樓」，也比較好塞在堆疊旁邊 |

沒有需要糊掉的區塊（五張都沒有人臉、商標、車牌、招牌）。調色跟著 skin（blueprint 偏冷、略去飽和）。

## 自訂色紙（`assets.json` 的 `papers`）

三層剖面圖全部是色紙：

| 紙材名 | 尺寸 | 顏色 | 是什麼 |
|---|---|---|---|
| `sub` | 900×130 | 綠 `#57B881` | 基板 |
| `ip` | 800×80 | 銀灰 `#DCE4EA` | 中介層 |
| `chipb` | 320×130 | 黃 | 運算晶片 |
| `mem` | 68×130 | 青 | 記憶體（一邊三顆） |
| `dot-s`／`dot-l` | 18／40 圓 | 白 | 上面那排密的接點／下面那排疏的接點 |
| `dot-stub`、`dot-leg`、`dot-fine`、`dot-thick` | 細長條 | 白、綠 | 對不到點的短線、晶片的腳、細線與粗線的對照 |
| `seg-bridge` | 150×16 | 橘紅 | 中介層上連接晶片與記憶體的短線 |
| `die` | 230×230 | 黃 | 還沒封裝的晶片（s04、s13） |
| `slip` | 260×330 | 白 | 訂單紙 |
| `sq1`／`sq2`／`sq3` | 150／250／360 方 | 青／淺藍／白 | 封裝面積由小到大（s15）；`sq1` 也當 s13 的記憶體小方塊 |
| `mini-sub`／`mini-ip`／`mini-chip` | 小長條 | 同三層 | 三層的縮小版（s16 一個月疊幾份） |
| `hbm-l` | 260×44 | 青 | HBM 的一層（s19 往上疊八層） |

其餘（標題紙條、標籤、便條、膠帶、紅圈、叉叉、問號、長條圖的紙條）都是 `make-paper.py` 的通用紙材。

## 重產方式

```
python3 scripts/make-paper.py tech-cowos
```

產出 141 項到 `public/v3/tech-cowos/`（含 `meta.json`）。換 skin 或改 `assets.json` 都要重跑。

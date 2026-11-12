# assets.md — what-is-server 素材紀錄

更新：2026/11/12。風格定案是方向 A 桌面紙拼貼。素材只有三種：本機程式做的紙材、色紙疊的物件、Pexels 照片。**沒有 AI 生成的圖**（只送過 1 次 OpenAI 生圖請求，回 `credit_balance_exhausted`，0 張）。圖檔都不 commit。

## 照片（4 張）

原圖在 `out/what-is-server/assets-raw/photos/`。下載日 2026/11/12，取得方式：`huggingface.co` 上的資料集 `opendiffusionai/pexels-photos-janpf`（約 13 萬張 Pexels 照片的鏡像），用 `scripts/styleframes/fetch_pexels.py` 只抓這四張。

| 代號 | 原檔 | 尺寸 | Pexels 編號與網址 | 內容 | 作者 | 用在 |
|---|---|---|---|---|---|---|
| `ph-phone` | phone-desk.jpg | 5456×3064 | 358627 https://www.pexels.com/photo/358627/ | 桌上的手機俯拍，無人 | 未核對 | 去背成手機貼紙 `a01-phone`（s01–s03、s08、s09、s11、s13、s14、s17–s19） |
| `ph-rack` | rack-close.jpg | 6016×4016 | 1148820 https://www.pexels.com/photo/1148820/ | 機櫃硬碟特寫 | 未核對 | s20 拍立得 |
| `ph-kitchen` | kitchen.jpg | 4000×6000 | 2881725 https://www.pexels.com/photo/2881725/ | 掛著鍋具的廚房，無人 | 未核對 | 出餐口窗內（s07–s11）；鍋柄品牌小字要糊掉 |
| `ph-aisle` | aisle.jpg | 4000×1400 | 325229 https://www.pexels.com/photo/325229/ | 機房走道，無人 | 未核對 | s13 拍立得（中央裁成 4:3，約 1867×1400） |

網址是用編號推的短網址格式，沒有實際打開確認過。

### 授權與作者：未核對

2026/11/12 晚上（台灣時間 19:37 前後）試過，結果如下：

| 試了什麼 | 結果 |
|---|---|
| `curl https://www.pexels.com/license/` | 連得到主機，回 HTTP 403，標頭 `cf-mitigated: challenge`，內容是 Cloudflare 的「Just a moment...」機器人驗證頁 |
| `curl https://www.pexels.com/photo/<編號>/`（四張） | 同上，四張都是 403 驗證頁 |
| WebFetch 工具開授權頁 | `getaddrinfo ENOTFOUND www.pexels.com`（那個工具走的網路還沒放行這個主機） |
| 讀四張 JPG 的 EXIF／內嵌文字 | 沒有作者、版權欄位 |
| 資料集的 README | 只寫圖片「borrowed from pexels.com」，授權欄填 `other`，沒有逐張作者 |

- 機器人驗證是網站的反爬機制，沒有繞過（不偽裝瀏覽器、不解驗證）。
- 所以目前的狀態：**「可商用、免標示」沒有對到 Pexels 官網原文；四張的作者都沒查到。** 這個判斷只來自資料集說明和一般對 Pexels 授權的認知。
- 上片前要做：請人用一般瀏覽器開 https://www.pexels.com/license/ 和上面四個網址，確認 (1) 授權條款現行內容，(2) 四張照片確實還在 Pexels 上、是 Pexels 授權，(3) 把作者姓名補進上表。任何一張對不上，就換成本機色紙疊的版本（s13、s20 的拍立得可以直接拿掉，不影響旁白）。
- Pexels 授權一般不允許把照片中可辨識的人、商標用成像在背書；這四張沒有人，廚房照片的品牌小字會糊掉。

## 色紙疊的物件（本機產生）

`scripts/styleframes/make_assets.py`（Pillow＋numpy，固定 seed）。正式檔放 `public/assets/what-is-server/`。

| 代號 | 內容 | 狀態 |
|---|---|---|
| `a01-phone` | 手機貼紙：`ph-phone` 去背＋白邊＋落影 | 樣張版已有（`out/what-is-server/styleframes/assets/a-phone.png`） |
| `a02-rack` | 機櫃 | 樣張版已有（`a-rack.png`） |
| `a03-pass` | 出餐口（中空窗框） | 樣張版已有（`a-pass.png`） |
| `a05-photo` | 沖印照片紙片（色紙疊的山和太陽） | 待做 |
| `a07-envelope` | 信封 | 待做 |
| `a08-lock` | 掛鎖 | 待做，先打樣 |
| `a10-cloud` | 紙雲 | 待做，先打樣 |

## 紙材（本機產生）

`p-strip`、`p-tape`、`p-label`、`p-ticket`、`p-dash`、`p-spinner`、`p-marker`、`p-shutter`、`p-disc`、`p-heart`、`p-polaroid`、`p-bg`。內容見 `storyboard.md`「本機自製紙材」。樣張版在 `out/what-is-server/styleframes/assets/`（桌面、切割墊、紙條、標籤、膠帶、麥克筆、虛線）；鐵捲門、小單、圓紙片、愛心、拍立得白框、載入圈還沒做。

## 字型

Noto Sans TC、Inter，讀 `public/fonts/` 的本地鏡像（SIL Open Font License）。

## 沒有用的

- AI 生圖：0 張。
- 方向 B 還缺的三張照片（鐵捲門、三支手機、天空）：不找了，方向 B 不做。

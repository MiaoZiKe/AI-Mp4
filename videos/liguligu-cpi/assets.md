# assets.md — liguligu-cpi 素材紀錄

更新：2026/11/14。外觀 `newsprint`（軟木板＋報紙色紙）。素材只有兩種：本機程式做的紙材、Pexels 照片。**沒有 AI 生成的圖。** 圖檔都不 commit。

## 照片（5 張）

原圖在 `out/liguligu-cpi/assets-raw/photos/`。下載日 2026/11/14，取得方式：Hugging Face 上的 Pexels 鏡像 `opendiffusionai/pexels-photos-janpf`，用 `scripts/styleframes/find_pexels.py --fetch` 抓。每張都用縮圖看過：沒有人臉、沒有可辨識的商標。黑白報紙調色由 skin 自動套用。

| 代號 | 原檔 | 尺寸 | Pexels 編號與網址 | 內容 | 作者 | 用在 |
|---|---|---|---|---|---|---|
| `veg` | veg.jpg | 6000×4000 | 701970 https://www.pexels.com/photo/701970/ | 市場的蔬菜攤，有手寫價格牌（外文、歐元），無人、無商標 | 未核對 | s01、封面 |
| `keyboard` | keyboard.jpg | 6000×3375 | 2506947 https://www.pexels.com/photo/2506947/ | 木地板上一台打開的筆電，螢幕全黑、看不到商標；左側空地板已裁掉 | 未核對 | s02、s05 |
| `news` | news.jpg | 6000×4000 | 518543 https://www.pexels.com/photo/518543/ | 桌上一疊摺起來的報紙，字讀不出來 | 未核對 | s05 |
| `papers` | papers.jpg | 6000×4000 | 167538 https://www.pexels.com/photo/167538/ | 用繩子綁起來的一大疊舊報紙，報頭看不到 | 未核對 | s06 |
| `carts` | carts.jpg | 3000×2000 | 264699 https://www.pexels.com/photo/264699/ | 一排超市推車，無人、無商標 | 未核對 | 這一版沒用 |

網址是用編號推的短網址格式，沒有實際打開確認過。

- 抓了但沒用的候選（已刪）：歐元硬幣、古董收銀機、水果攤（木箱上有看得出的字）。
- `veg` 是外國市場的示意照片，不是台灣的菜價；圖說只寫「十月的菜價」當情境。

### 授權與作者：未核對

Pexels 官網在這個環境會被機器人驗證擋住，沒有繞過。作者欄都是「未核對」，授權條款也沒有對到官網原文。**上片前要請人用瀏覽器打開上表的網址**，確認照片還在、授權是 Pexels License、記下作者。

## 紙材

`python3 scripts/make-paper.py liguligu-cpi`（固定 seed）。自訂紙材在 `assets.json` 的 `papers`：`printout`（AI 回覆的列印紙，內文是灰色橫條、不寫字，只留一行給「CPI 年增率是 1.69%」）、`stamp-red`、`tagk`、`datetag`。手機是紙手機＋自製中性畫面，不是任何真實軟體；「Gemini」只出現文字，沒有商標。

## 旁白

`out/liguligu-cpi/narration_iapetus.wav`（Iapetus，19.38 秒，另外配好的；原始未加速檔 `iapetus.orig.wav`）。複製成 `public/audio/liguligu-cpi/.take-96034b5d83.raw.wav` 後用 `node scripts/tts-take.mjs liguligu-cpi --resplit` 切幕（不送 TTS 請求）；第一幕的音檔另外補回開頭 0.26 秒的靜音，讓影片時間軸和原始錄音完全一致。

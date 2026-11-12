# v3 實拍照片怎麼找、放哪、怎麼記

給做 styleVersion 3（紙拼貼）影片的人用。照片只有一個來源：Hugging Face 上的 Pexels 照片鏡像 `opendiffusionai/pexels-photos-janpf`（約 13 萬張）。Pexels 官網和其他圖庫在這個環境連不到；不用 AI 生圖。

## 1. 依關鍵字找圖

```
python3 scripts/styleframes/find_pexels.py "circuit board" --limit=20
python3 scripts/styleframes/find_pexels.py wedding ring --not=hand,finger
python3 scripts/styleframes/find_pexels.py laptop desk --any
```

- 關鍵字用英文（索引裡的圖說是英文），可以寫片語。預設每個字都要出現，`--any` 是任一個。
- 預設會**排除圖說裡提到人的照片**（person、woman、face、hands…）。除非真的需要，不要加 `--people`。
- 每一行印出：md5、Pexels 編號、圖說開頭。圖說是模型寫的，會錯，只能拿來初篩。
- 第一次用會下載 49MB 的索引到 `out/_pexels/index.jsonl.gz`（已經有人下載過就直接用，不 commit）。
- 找不到貼切的圖很正常（這份鏡像偏生活、風景、物件）。找不到就改用色紙疊的物件或紙片圖表，不要硬湊一張不相關的照片。

## 2. 抓圖

```
python3 scripts/styleframes/find_pexels.py --fetch <slug> board=17176b2a2e925ed5616ad70254beec54 ring=<md5>
```

- 存到 `out/<slug>/assets-raw/photos/<名稱>.jpg`。`名稱` 用小寫英文加連字號，它就是之後紙材名的後半。
- 只抓指定的那幾張（從 3GB 的壓縮檔裡用範圍請求讀），一張大約幾秒到幾十秒。
- 指令最後會印出可以直接貼進 `assets.md` 的表格列。

## 3. 抓下來一定要自己看過

用 Read 工具打開每一張原圖，確認：

- **沒有可辨識的人臉**。背影、手、遠到看不出是誰的剪影可以；看得出五官的一律不用，換一張。
- 沒有看得清楚的商標、品牌字、車牌、招牌、螢幕上的真實軟體畫面。小範圍的可以在 `assets.json` 用 `blur` 糊掉，大範圍的就換一張。
- 內容真的是旁白在講的東西（圖說常常認錯）。
- 股票片不要用「看起來像某家公司、某個人」的照片去暗示；感情片不要用會讓人對號入座的人物照。

## 4. 變成紙片

```
python3 scripts/make-paper.py <slug>
```

`out/<slug>/assets-raw/photos/` 裡每一張照片會自動變成：

| 紙材名 | 樣子 | 用法 |
|---|---|---|
| `polaroid-<名稱>` | 拍立得：白框，下方留白可寫字 | `{ "type": "strip", "paper": "polaroid-<名稱>", "caption": true, "lines": [{ "t": "一行字", "size": 46 }] }` |
| `print-<名稱>` | 沖印照片：細白邊、比較大 | `{ "asset": "print-<名稱>", "x": …, "y": …, "w": … }`，可加 `tape` |
| `clip-<名稱>` | 撕下來的剪報（只有 skin 是 newsprint 時自動產生） | 同拍立得，`caption: true` 的字寫在照片下方 |

形狀依原圖比例自動選橫（4:3）、直、方。調色跟著 skin：desk 暖調沖印、blueprint 偏冷、newsprint 黑白報紙、notebook 柔和、sticky 幾乎不動。

要調整就在 `videos/<slug>/assets.json`（可以 commit）寫：

```json
{
  "photos": {
    "board": {
      "crop": [0.1, 0.0, 0.9, 1.0],
      "focus": [0.5, 0.3],
      "shape": "land",
      "frames": ["polaroid", "print"],
      "tone": "cool",
      "lift": 0.4,
      "blur": [[0.62, 0.70, 0.80, 0.82]]
    }
  }
}
```

- `crop`：先裁掉不要的部分，左、上、右、下，都是 0–1 的比例。
- `focus`：裁成固定比例時要保留哪裡（0–1；預設正中央）。
- `shape`：`land`｜`port`｜`sq`。`frames`：要產生哪幾種。`tone`：`warm`｜`cool`｜`news`｜`soft`｜`plain`。
- `lift`：提亮（0.3–1；原圖偏暗、手機上看不清時用）。
- `blur`：要糊掉的區塊，可以好幾塊。

改完重跑 `make-paper.py`，再用 `npm run still <slug>` 看實際畫面。照片在手機上至少要 380px 寬，否則看不出內容。

## 5. 記在 `videos/<slug>/assets.md`

照 `videos/what-is-server/assets.md` 的格式，每張照片一列：

| 代號 | 原檔 | 尺寸 | Pexels 編號與網址 | 內容 | 作者 | 用在 |
|---|---|---|---|---|---|---|

另外要寫清楚：

- 下載日期、取得方式（這份鏡像＋`find_pexels.py`）。
- 授權與作者的狀態。Pexels 官網在這個環境被機器人驗證擋住，**不要繞過**；所以照實寫「作者未核對、授權條款未對到官網原文」，並列出上片前要請人用瀏覽器確認的網址。
- 有沒有裁切、糊掉哪裡、為什麼。
- 沒有用 AI 生圖。

## 6. 不 commit 的東西

`out/`（原圖）、`public/v3/`（紙材）都在 `.gitignore`。可以 commit 的只有 `videos/<slug>/assets.md` 和 `assets.json`。

# assets.md — ai-make-video 素材紀錄

更新：2026/11/13。外觀 `sticky`（白板＋彩色便利貼）。素材只有三種：本機程式做的紙材、紙手機（程式畫的，沒有實拍原圖）、Pexels 照片 7 張。**沒有 AI 生成的圖。** 圖檔都不 commit。

## 照片（7 張）

原圖在 `out/ai-make-video/assets-raw/photos/`。下載日 2026/11/13，取得方式：Hugging Face 上的 Pexels 鏡像 `opendiffusionai/pexels-photos-janpf`，用 `scripts/styleframes/find_pexels.py` 搜尋圖說後只抓這幾張。每一張原圖都打開看過。

| 代號 | 原檔 | 尺寸 | Pexels 編號與網址 | 內容 | 作者 | 用在 |
|---|---|---|---|---|---|---|
| `mic` | mic.jpg | 5472×3648 | 194985 https://www.pexels.com/photo/194985/ | 錄音用麥克風特寫，後面是防噴罩；沒有人，看不到品牌字 | 未核對 | s01、s18–s19 拍立得、封面 |
| `notebook` | notebook.jpg | 1920×1336 | 602900 https://www.pexels.com/photo/602900/ | 木桌上的空白線圈筆記本；沒有人、沒有字 | 未核對 | s04 拍立得 |
| `timer` | timer.jpg | 3979×2574 | 1209998 https://www.pexels.com/photo/1209998/ | 逆光的沙漏；沒有人、沒有字 | 未核對 | s06 拍立得（找不到乾淨的碼錶，照分鏡表的備案改用沙漏） |
| `street` | street.jpg | 5472×3356 | 800789 https://www.pexels.com/photo/800789/ | 石牆巷道，黑白；沒有人、沒有招牌 | 未核對 | s09 拍立得 |
| `food` | food.jpg | 2565×2328 | 699953 https://www.pexels.com/photo/699953/ | 一碗湯麵俯拍；沒有人、沒有包裝 | 未核對 | s09 拍立得 |
| `desk` | desk.jpg | 5760×3840 | 42408 https://www.pexels.com/photo/42408/ | 書桌一角：盆栽、杯子、闔到一半的筆電（螢幕全黑，看不到商標） | 未核對 | s09 拍立得 |
| `scissors` | scissors.jpg | 6000×4000 | 322345 https://www.pexels.com/photo/322345/ | 金色小剪刀特寫；沒有人、沒有字 | 未核對 | s10 拍立得 |

網址是用編號推的短網址格式，沒有實際打開確認過。

抓了又刪掉、沒有用的：耳機那張（356006，畫面裡有一張印著人臉的專輯封面）、舞台麥克風（164960，握柄上有品牌字）、日本巷弄（1633795，有看得清楚的店家招牌）、另一張筆電書桌、另一碗麵、另一本筆記本、另一個沙漏。分鏡表原本要的耳機（s07）和放大鏡（s13）找不到合格的照片，改用紙片（s07 只留稿紙和配音工具卡；s13 用紅圈和「真的嗎？」紙條）。

### 裁切與調色

- 都沒有糊掉任何區塊（沒有需要糊的東西）。
- `videos/ai-make-video/assets.json`：`street` 提亮 0.35（原圖偏暗）；`mic`、`timer` 調了裁切焦點；`food` 裁成方形，其餘橫式 4:3。
- 調色跟著 sticky 外觀（`plain`，幾乎不動）。s09 的旁白是「自己拍的照片」，這三張是示意，正式上片可以換成使用者自己拍的（放進同一個資料夾、檔名不變，重跑 `make-paper.py` 就好）。

### 授權與作者：未核對

- Pexels 官網在這個環境會回機器人驗證頁，沒有繞過，所以**作者未核對、授權條款沒有對到官網原文**。
- 上片前要請人用一般瀏覽器開 https://www.pexels.com/license/ 和上表七個網址，確認照片還在、是 Pexels 授權，並把作者補進表格。任何一張對不上就拿掉那張拍立得（都不影響旁白）。

## 本機產生的紙材

`python3 scripts/make-paper.py ai-make-video` → `public/v3/ai-make-video/`（137 項，固定 seed，不 commit）。除了通用紙片，另外在 `assets.json` 的 `papers` 訂了 12 張：

| 紙材 | 用途 |
|---|---|
| `strip-hook2` | s01 鉤子大紙條、封面標題 |
| `script` | 稿紙（s02、s07；上面的灰線是破折號排的，不是可讀內文） |
| `copy` | s15 一張一張疊上去的灰色複製紙 |
| `wavestrip` | s08–s09 橫向長聲波條的深色底 |
| `tag-blue`／`tag-mint`／`tag-kraft` | 小標籤 |
| `strip-blue` | s16「AI 動手」 |
| `slip`／`slip-long` | s04 三張題目小紙條、s15「不管是不是 AI 做的」 |
| `patch-y`／`patch-wide` | s10 改字「幕」、s13 改字「12」 |

手機是紙手機（沒有實拍原圖時自動產生），螢幕內容是引擎內建的中性聊天／留言畫面，沒有任何真實服務的名稱或介面。

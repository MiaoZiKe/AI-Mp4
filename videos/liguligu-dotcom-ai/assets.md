# assets.md — liguligu-dotcom-ai

沒有照片、沒有 AI 生成圖；Pexels 與其他圖庫這台機器連不到。三張素材都是用 PIL 畫的灰階資料圖（`/tmp` 外的腳本在 session scratchpad，輸出到 `out/liguligu-dotcom-ai/assets-raw/photos/`，再由 `make-photos.py` 轉黑白低對比），**每張都標示資料來源與「示意」**，不重用前幾支的照片。

| 代號 | 內容 | 資料點（來源） | 用在 |
|---|---|---|---|
| nasdaq00 | 那斯達克綜合指數 2000/3/10 高點 5,048.62 → 2002/10/9 低點 1,114.11，約 −78%（示意連線，非逐日資料） | Kiplinger、DQYDJ／Wikipedia 摘要 | s08 下一集預告（輔助） |
| capex | 四大雲端公司資本支出長條：2025 約 4,100 億、2026 計畫約 7,250 億美元 | Yahoo Finance、AI Weekly、Silicon Canals、Motley Fool 摘要 | s03 主素材 |
| nasdaq26 | 那斯達克綜合指數 10/6 紀錄高點 27,599.89 → 11/5 單日 −5.5%、較高點跌逾 10%（走勢為示意，只有兩個日期是查證數據） | CNBC（經 FourWeekMBA）、Star-Advertiser | s07 主素材 |

文件框（hook、pending）都標「示意，非文件原件」。無人物、無商標。
已知問題：capex 圖內的小字在成片縮小後看不清，主資訊靠旁邊的大字「7200 億美元」。

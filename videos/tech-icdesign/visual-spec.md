# tech-icdesign 物件清單與最低細節（依 lessons #53、#55，2026/11/18 Andy：晶片不能只有色塊）

## 參考 die shot（公開）
- WikiChip：Intel Ivy Bridge 四核心晶粒註解圖 https://en.wikichip.org/wiki/File:ivy_bridge_die_(quad-core)_(annotated).png（4 個 CPU 核心＋快取、GPU、系統代理與 I/O 在周邊；版權 Intel，只當構圖參考，不轉貼）。
- TechPowerUp：AMD Zen 5 CCD 註解 die shot https://www.techpowerup.com/327388/amd-granite-ridge-zen-5-processor-annotated（核心排成兩列、中間一整條 L3 快取、四周是介面）。
- CPU Graveyard（happytrees.org/dieshots）的 IBM POWER8、Sun UltraSPARC T2 版圖（核心、快取、I/O 分區）。
- 這台機器出口被擋（HTTPS 403），抓不到圖檔，所以「並排比對」是依上面圖的特徵逐條對（見下），不是貼圖並排；Andy 若要圖並排，需要有人幫忙抓一張放進 repo 外的資料夾。

## 晶片（2D 縮放第一級 `ic-die`、3D 站 Z、電腦螢幕）最低細節
| # | 項目 | 做法 | 對照 die shot |
|---|---|---|---|
| 1 | 晶粒外框 | 密封環（雙線）＋四周一圈焊墊（每邊 30 個，各有焊球與往內的走線） | 邊緣一圈焊墊、最外圈密封環 |
| 2 | CPU | 四個核心（取指解碼條、三個運算單元、暫存器格）＋下方二級快取格 | 核心＋快取成對 |
| 3 | NPU | 8×6 乘加陣列（每格內有小方塊）＋緩衝格 | 整齊重複的運算陣列 |
| 4 | SRAM | 密集小格陣列分四個子陣列＋右側感測放大器 | 記憶體是最細密的格紋 |
| 5 | I/O | 手指狀介面電路條＋下方收發器方塊 | 介面電路成排條紋 |
| 6 | 區塊之間 | 標準元件列細紋（底紋）＋橫、直各五條不同顏色的金屬走線（M1–M5 色），轉角 45 度 | 區塊間有走線通道 |
| 7 | 供電 | 粗的紅藍交替電源帶橫跨區塊 | 供電網格 |
| 8 | 3D 版本 | 同樣的密封環、焊墊＋焊球、核心／MAC／SRAM 格陣列、走線束、電源帶（`genmodel.py` 站 Z） | — |
| 9 | 螢幕上的版圖 | 晶粒框、焊墊、四區塊（各有小格紋）、走線 | — |

## 其他物件（不變）
金屬層堆疊（M1–M5、通孔、電晶體）、設計流程五塊板、曝光機柱（光源、光罩、三段鏡組、晶圓與晶粒陣列）。

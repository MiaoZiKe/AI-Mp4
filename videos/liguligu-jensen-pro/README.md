# liguligu-jensen-pro — 專業嚴肅版（檔案室式）

更新：台灣時間 2026/11/14 21:30。`videos/liguligu-jensen/`（貼紙式）的另一種畫面，給使用者比較風格用。`styleVersion: 3`、`stage: "dossier"`。
**內容沒有改**：旁白、念稿、字幕、cue、出處、查證狀態都和 liguligu-jensen 一字不差（`contentFrom: "liguligu-jensen"`，validate 會逐幕比對）；`research.md` 是原樣複製。沒有送任何 TTS 請求。

| 項目 | 內容 |
|---|---|
| 成片（部分有聲） | `out/liguligu-jensen-pro.mp4`（1080×1920、30fps、H.264，815 幀＝27.2 秒）。**只有前 3 鏡（0–12.4 秒）有旁白**，後 4 鏡沒有聲音，原因見下面「旁白」 |
| 無聲版 | `out/liguligu-jensen-pro-silent.mp4`（772 幀＝25.7 秒，時間軸和貼紙版完全一樣） |
| 九格圖 | `out/liguligu-jensen-pro-review.png`；每鏡總覽 `out/liguligu-jensen-pro-overview.png`；封面 `out/liguligu-jensen-pro-cover.png` |
| 兩種風格對照 | `out/liguligu-jensen-style-compare.png`（上排貼紙式、下排檔案室式，同一時刻各 4 格；下排取自無聲版，兩支時間軸相同才能對齊） |
| 字幕 | `out/liguligu-jensen-pro.srt`（中英）、`.zh.srt`、`.en.srt` |
| 自查抽格 | `out/liguligu-jensen-pro/first3s.png`（前 3 秒每 2 幀）、`quarter-1.png`／`quarter-2.png`（全片每 0.25 秒） |

## 旁白（重要）

使用者 2026/11/14 上傳的錄音 `Generated_Audio_November_14_2026_-_9_11PM.wav`（男聲，25.04 秒；原檔沒動，複本在 `public/audio/liguligu-jensen-pro/user-upload.orig.wav`）**不是 7 句的完整念稿，而是前 3 句（s01–s03）念了兩遍**：

- 第一遍 0.16–12.35 秒、第二遍 13.24–24.76 秒；s04–s07（政治操作、樂見不等於設局、還沒結論、提問與下一集）**完全沒有念到**。
- 怎麼確認的（都在本機，沒有花任何請求）：(1) 用對齊模型直接聽寫成拼音，兩段都是「…nian de zhixingzhang / cizhi / jike shengxiao / gonggao mei xie yuanyin / …tian qian dongshihui cai shuo / mei liyou xiangxin jimi waixie / wenjian xie cizhi / meiti que shuo dongshihui yao ta zou」；(2) 拿「前 3 句念稿 ×2」對整個檔做強制對齊，信心 0.90；拿 7 句完整念稿去對，s04–s07 的信心只有 0.28–0.39。
- 念到的 3 句和稿子一致，字幕不用改。只有開頭「三十三」三個字模型認不出來（分數 0.003；0.16–0.76 秒有聲音），**要人耳確認開頭的「33」有沒有念清楚**。
- 這一版的做法：前 3 鏡用第一遍的真時間（影片時間＝錄音時間，沒有搬動、加速或調音量，12.55–12.75 秒淡出），後 4 鏡維持估算時間、沒有聲音；第二遍沒有用。沒有背景音樂與音效。
- 等拿到 7 句完整的錄音：`node scripts/dossier/recording-timeline.mjs liguligu-jensen-pro audio/liguligu-jensen-pro/<檔名>.wav 7` → `npm run render` → 用 ffmpeg 把錄音合進去（指令在下面）。

## 重做指令

```
python3 scripts/dossier/make-photos.py liguligu-jensen-pro      # 黑白低對比照片 → public/dossier/<slug>/
node scripts/dossier/fetch-fonts.mjs liguligu-jensen-pro        # Noto Serif TC 子集（只抓用到的字）→ public/fonts/dossier/
# 無聲版：SILENT_RATE=4.75 node scripts/ui/silent-timeline.mjs liguligu-jensen-pro
# 這一版（前 3 鏡真時間）：
ffmpeg -i public/audio/liguligu-jensen-pro/user-upload.orig.wav -t 12.80 public/audio/liguligu-jensen-pro/take1.wav
SILENT_RATE=4.75 SILENT_GAP=0.5 node scripts/dossier/recording-timeline.mjs liguligu-jensen-pro audio/liguligu-jensen-pro/take1.wav 3
npm run validate liguligu-jensen-pro
flock /tmp/aimp4-render.lock npm run still liguligu-jensen-pro
flock /tmp/aimp4-render.lock npm run render liguligu-jensen-pro   # 沒有 timeline.voice，所以不會自動混音樂；輸出是無聲畫面
mv out/liguligu-jensen-pro.mp4 out/liguligu-jensen-pro.video.mp4
ffmpeg -i out/liguligu-jensen-pro.video.mp4 -i public/audio/liguligu-jensen-pro/user-upload.orig.wav -filter_complex "[1:a]atrim=0:12.75,afade=t=out:st=12.55:d=0.2,apad=whole_dur=27.167,aresample=48000[a]" -map 0:v -map "[a]" -c:v copy -c:a aac -b:a 192k -shortest out/liguligu-jensen-pro.mp4
python3 scripts/ui/review9.py liguligu-jensen-pro "0,s01:start+40,s01:why+24,s02:leak+18,s03:out+16,s04:glad+22,s05:setup+6,s06:quiet+20,s07:ask+24"
```

## 風格

一句話：國際財經媒體的調查專題／紀錄片檔案室——深色底上只有白灰字、一個深紅、一個冷色，文件是淺色紙面摹本，重點用細紅框和引線標，不用手繪圈、印章、便利貼。

- 色票（`src/theme.ts` 的 `THEME_DOSSIER`）：底 墨藍炭灰 `#0D1118`（中央 `#161D29`、60px 細格線 3.5% 白）；字 白 `#ECEEF1`／灰 `#AEB6C2`／淡灰 `#8A93A1`；唯一強調色 深紅 `#D8483A`（深底上的紅字 `#F06A5A`、紙面上 `#B3261B`）；「已確定」冷色 `#6FB7C6`；紙面 `#E8E4D8`（字 `#1A1E26`）；深色卡 `#151B26`。
- 字：大標 Noto Serif TC 900（文件標題與字標 600）；內文、字幕 Noto Sans TC；數字 Inter（小字的日期、鏡號用等寬數字 tabular-nums；大字級用比例寬，等寬的「1」放大後太鬆）。
- 查證狀態＝單色小標（方點＋字＋細框）：已確定（冷色）、媒體報導／公司未證實（灰）、查不到證據（紅、實心點）、截至 2026/11/14 尚未確定（紅、空心點）。
- 動作（`THEME_DOSSIER.motion`）：遮罩擦入 14 幀、描線 16 幀、打字每字 2 幀、淡入 10 幀、紅框描完閃一下、每鏡慢推 3%、照片慢推 5%；換鏡是舊鏡淡出、新鏡擦入。沒有彈跳、搖晃、旋轉。
- 版面（`LAYOUT_DOSSIER`）：頁首 232–304（左上小字標、右上欄目名、細線兼進度）｜主舞台 340–1260（左右各留 80）｜字幕 1300 起（左邊一條紅線、中文 64px、關鍵詞紅底線）｜出處 1556｜常駐「查證截至 2026/11/14」與鏡號 1636。最小字 28px。

## 每鏡

| 鏡 | 畫面 | 事件順序 |
|---|---|---|
| s01 鉤子 | 「33 年執行長／辭職即刻生效」襯線大字（33 是紅色數字）；下面一張「董事會公告 2026/11/12」紙面摹本，「辭職原因：」後面是空的，游標在閃 | 第 0 幀大字與文件都在、掃描線正在往下掃 → 0.3 秒紅框框住原因欄並閃一下 → 0.9 秒引線拉出「公告：沒寫原因」→「即刻生效」畫紅底線 → 念到公告再掃一次 → 紅框再閃、「已確定」 |
| s02 四天的缺口 | 上面一條黑白會議室照片（示意）；時間線 11/8–11/12 五個刻度，中間紅線段「只隔 4 天」；左「董事會聲明 11/8」紙面（本人致歉・啟動調查／沒理由相信 機密外洩），右「董事會公告 11/12 辭職 即刻生效」深色卡 | 照片擦入 → 時間線描出 → 兩張卡 → 紅線段與「4」→ 打字「沒理由相信／機密外洩」→ 紅底線 →「已確定」→ 紅線段閃一下 |
| s03 兩種說法 | 左欄「官方文件」（冷色）8-K 紙面「辭職」＋「送證管會的 8-K 文件」＋已確定；右欄「媒體報導」（灰）「董事會要他走」＋「CNBC 引述知情人士」＋公司未證實；中間一個紅色問號 | 左欄 → 打字「辭職」→ 出處、已確定 → 右欄（先是空的虛線框）→「董事會／要他走」→ 出處、公司未證實 → 問號 |
| s04 外界的懷疑 | 大標「是政治操作嗎？」；左黑白報紙照片（華盛頓郵報報導，示意照片）＋「11/14」；右「華盛頓郵報 11/14｜對中強硬派 樂見 他下台」＋媒體報導 | 大標 → 照片 → 紅底線 → 日期與報名 → 對中強硬派 → 樂見（紅底線）→ 媒體報導 |
| s05 樂見 ≠ 設局 | 「樂見 ≠ 設局」（不等號是紅的）；下面兩列：有人樂見—媒體報導、有人設局—查不到證據 | 樂見 → 第一列 → ≠ → 設局與第二列 → 查不到證據 |
| s06 還不知道的 | 左黑白資料夾照片（董事會的獨立調查，示意照片）＋「還沒結論」；右「本人的公開說明」紙面，欄位寫（空白）被紅框框住＋「還沒開口」；下面「截至 2026/11/14 尚未確定」 | 照片、空白文件 → 還沒結論 → 打字文件標題 → 紅框 → 還沒開口 → 尚未確定 |
| s07 提問＋下一集 | 大標「是請辭／還是被請走？」；「留言說你的看法」；「下一集」＋黑白檔案櫃寬幅照片（示意照片），照片上打字「國會想問他什麼？」 | 大標 → 兩處紅底線 → 留言 → 下一集 → 照片 → 打字 → 細紅框 |

## 和貼紙版的差別

- 底：軟木板 → 墨藍炭灰加細格線。顏色從紅黃綠多色紙 → 白灰加一個紅、一個冷色。
- 字：全部黑體粗字 → 襯線大標配黑體內文。
- 標註：手繪紅圈、卡通問號、斜貼的章 → 細紅框、引線、紅底線、單色小標；不歪斜。
- 文件：橫條紙片 → 有標題、日期、欄位的紙面摹本，都標「示意，非文件原件」。
- 照片：拍立得 → 黑白低對比、方角細框；四張圖說都標了「示意照片」（原版 s06、s07 沒標）。
- 動作：貼上、砸下、抖動、鏡頭在大桌面上平移 → 擦入、描線、打字、淡入、慢推；每鏡各自一個畫面。
- 修掉的問題：紙片被切到畫面外（s05 原版左邊被切）、頁首蓋到內容、照片圖說沒標示意、s04 大字後 1.3 秒沒東西、s06／s07 開頭偏空。

## 檢查結果

- `npm run validate`：**1 error、1 warning**。error 是「最後一幕必須是 EndCard」——短片沒有片尾卡，和 liguligu-jensen 一樣照實留著（`docs/channels/liguligu.md` 第 2 節），沒有為了過關硬加；warning 是總長（短片）。
- `npm run still`：7 張逐張看過，沒有溢出、缺字方框；覆蓋率佔用率最低 49%、最長空白帶 124px。
- `npm run render`：ffprobe 815 幀＝時間軸；blackdetect 沒有黑幀；音軌 AAC 48kHz，12.4 秒之後是靜音；響度 −18.8 LUFS（原錄音沒有調整）。
- `npx tsc --noEmit`：通過。
- 沒有跑 audit／selfcheck，沒有獨立評審的分數；口音與咬字沒有人聽過。

## 已知問題

1. **旁白只有前 3 鏡**（見上）。後 4 鏡的長度是估算，完整錄音來了要重排。
2. 換鏡時約有 0.2–0.3 秒畫面上只有很少東西（舊鏡淡出、新鏡正在擦入），是這個風格的轉場方式，但比貼紙版的一鏡到底「斷」一點。
3. s01 的「1993–2026」是原版畫面沒有的小字（依據 research.md F2：1993 年成立）；不要的話刪掉 `props.span`。
4. s01 多了一個「已確定」小標、文件摹本多了「示意，非文件原件」，也是原版沒有的標示（依據 research.md 第 5 節）。
5. 下方 1700–1920 與上方 0–220 是安全區，只有底色與格線。
6. 原文都沒有逐字讀過、上片當天要重查、照片授權未核對——這三項和 liguligu-jensen 一樣（照片是同樣四張，來源見 `videos/liguligu-jensen/assets.md`；這裡只是轉成黑白，`assets.json` 記了裁切）。
7. `CLAUDE.md` 還沒有寫進這個新的 `stage: "dossier"`（等使用者決定要不要採用再補）。

## 新增與改到的檔案

- 新增：`src/components/dossier/`（`engine.ts`、`DossierVideo.tsx`）、`scripts/dossier/`（`validate-dossier.mjs`、`fetch-fonts.mjs`、`make-photos.py`、`recording-timeline.mjs`）、`src/theme.ts` 最後的 `THEME_DOSSIER`／`LAYOUT_DOSSIER`／`FONT_DOSSIER_SERIF`。
- 共用檔只加了幾行（向下相容）：`src/Video.tsx`、`src/Cover.tsx`（各加一個 `stage === "dossier"` 的分支）、`scripts/validate.mjs`（import、一行分派、時間軸檢查清單加 dossier）、`.gitignore`（`public/dossier/`）。

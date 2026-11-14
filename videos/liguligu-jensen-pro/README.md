# liguligu-jensen-pro — 專業嚴肅版（檔案室＋國際新聞）

更新：台灣時間 2026/11/14 22:20。`videos/liguligu-jensen/`（貼紙式）的另一種畫面。`styleVersion: 3`、`stage: "dossier"`，加上頂層 `news`（國際新聞版）。
使用者看完第 1 版（檔案室式，27.2 秒）的原話：「**帶點新聞、國際風格，語速要調整快點**」。這一版（第 2 版）照這句話改：畫面加國際新聞的語彙、節奏加快。
**內容沒有改**：旁白、念稿、字幕、cue、出處、查證狀態都和 liguligu-jensen 一字不差（`contentFrom: "liguligu-jensen"`，validate 會逐幕比對）。沒有送任何 TTS 請求。

| 項目 | 內容 |
|---|---|
| 成片（**無聲**） | `out/liguligu-jensen-pro.mp4`（1080×1920、30fps、H.264，681 幀＝**22.7 秒**；音軌是靜音） |
| 第 1 版（保留） | `out/liguligu-jensen-pro.v1.mp4`（27.2 秒，前 3 鏡有使用者上傳的錄音）；`out/liguligu-jensen-pro-silent.mp4`（第 1 版無聲，25.7 秒） |
| 九格圖 | `out/liguligu-jensen-pro-review.png`；每鏡總覽 `out/liguligu-jensen-pro-overview.png`；封面 `out/liguligu-jensen-pro-cover.png` |
| 新舊對照 | `out/liguligu-jensen-pro-before-after.png`（上排第 1 版、下排這一版，同樣四句話念完的時刻） |
| 貼紙式對照（舊圖） | `out/liguligu-jensen-style-compare.png`（貼紙式對第 1 版檔案室式；沒有重做） |
| 字幕 | `out/liguligu-jensen-pro.srt`（中英）、`.zh.srt`、`.en.srt` |
| 自查抽格 | `out/liguligu-jensen-pro/first3s.png`（前 3 秒每 2 幀）、`quarter-1.png`／`quarter-2.png`（全片每 0.25 秒） |
| 男聲試聽提示詞（短說明） | `docs/prompts/liguligu-男聲試聽-短說明.txt`（說明只有一句；`node scripts/dossier/short-voice-prompt.mjs` 產生） |

## 這一版加了什麼（國際新聞語彙）

開關是 script.json 頂層的 `news`；拿掉它就是第 1 版的樣子（元件向下相容）。顏色在 `THEME_DOSSIER.news`、版面在 `LAYOUT_DOSSIER_NEWS`（`src/theme.ts`）。

| 元素 | 做法 | 在 script.json 哪裡 |
|---|---|---|
| 頂部新聞條 | 紅底白字頻道字標「哩股哩股」＋「國際｜INTERNATIONAL」＋右邊「查到底」；下緣細線兼全片進度 | `news.section`／`sectionEn` |
| 電頭 | 新聞條下面一行「SANTA CLARA, CALIF.・2026/11/12」這類地點＋日期，換鏡時重新打字、紅點閃一下；右邊是鏡號 | 每鏡 `props.news.dateline` |
| 下三分之一標題條 | 取代原本「左邊一條紅線」的字幕：紅色欄目籤（事件／四天前／兩種說法／外界懷疑／查證／還不知道／提問）＋深色條、左邊紅色粗邊，中英字幕在裡面，換段時從左擦出 | 每鏡 `props.news.lt` |
| 點陣世界地圖 | 標題條以下到畫面底的淡背景（點陣陸地＋經緯線，美洲到大西洋那一段）；標出「加州 SANTA CLARA」「華盛頓 D.C.」，目前這一鏡的地點有往外擴的紅圈；念到 8-K 文件時描出兩地連線，之後有光點沿線走 | `news.places`、`news.link`、每鏡 `props.news.place` |
| 底部跑馬燈 | 左邊固定紅籤「查證截至 2026/11/14」，右邊全片的出處一直往左走；跑馬燈上面仍有這一鏡自己的出處一行 | 自動取各鏡 `sources` |
| 新聞時間軸（s02） | 兩端改成日期籤（11/8 白底、11/12 紅底）＋軸上方形節點，照片左上角「時間軸 TIMELINE」 | `props.axis.label`／`labelEn` |
| 報頭式小標 | 引述媒體時：上粗下細兩條線，中間媒體名（襯線字）＋日期。s03「CNBC 11/12」、s04「華盛頓郵報 11/14」。**只有文字，不是商標** | `right.masthead`、`quote.masthead` |
| 橫向擦切 | 換鏡不再淡出淡入：一條紅線帶暗影從左掃到右（8 幀），新鏡跟著露出來；新鏡的底圖用 `start-N` 提早做完，擦進來時畫面就是滿的 | `THEME_DOSSIER.news.motion` |

地圖資料：Natural Earth 1:110m 陸地（公有領域），用 `scripts/dossier/make-worldmap.mjs` 取樣成 2° 一點，存在 `src/components/dossier/worldDots.json`。
電頭的地點不在 `research.md` 裡：公司的事寫 SANTA CLARA（公司總部所在地），華盛頓郵報報導與國會的事寫 WASHINGTON, D.C.；日期是該鏡事件或報導的日期（s06、s07 是查證截止日）。8-K 連到華盛頓是因為證管會在華盛頓；s03 的 CNBC 日期 11/12 取自 research.md F7 的網址日期。

## 節奏怎麼加快

| | 第 1 版 | 這一版 |
|---|---|---|
| 估算語速 | 每秒 4.75 個音節、幕間停 0.3–0.5 秒 | **每秒 5.2 個音節、幕間停 0.12 秒**（s05 結論句後 0.3 秒） |
| 全片 | 27.2 秒（無聲估算版 25.7 秒） | **22.7 秒** |
| 換鏡 | 舊鏡淡出、新鏡擦入，約 0.2–0.3 秒幾乎空 | 橫向擦切 8 幀，新鏡底圖已經在 |
| 事件間隔 | 沒有量過（事件跟著較慢的旁白走） | 每鏡最長 0.5–1.0 秒（`node scripts/dossier/events.mjs liguligu-jensen-pro` 列出每鏡事件落在第幾幀）；前 3 秒 7 個事件 |
| 查證小標 | 多半在該鏡最後 0.3 秒才出現 | 往前移，出現後至少留 0.5 秒 |

5.2 音節/秒是畫面的估算，不是配音結果。真的配音要念到這個速度，靠短說明（見下）與模型自己的語速；後製加速上限仍是 1.08。

## 旁白：這一版先不接聲音

- 使用者 2026/11/14 上傳的錄音（`public/audio/liguligu-jensen-pro/user-upload.orig.wav`，25.04 秒）**只有前 3 句、念了兩遍**（量測方法見 git 紀錄裡這份 README 的前一版），語速約每秒 4.4 個音節。第 1 版用它配了前 3 鏡；這一版使用者要求「語速調快」，所以先出無聲版，沒有硬把舊錄音加速接上。
- **拿到 7 句完整的錄音時**（用 `docs/prompts/liguligu-男聲試聽-短說明.txt` 在 Google AI Studio 生成、整段 21–24 秒為佳）：
  1. 檔案放 `public/audio/liguligu-jensen-pro/<檔名>.wav`。
  2. `node scripts/dossier/recording-timeline.mjs liguligu-jensen-pro audio/liguligu-jensen-pro/<檔名>.wav 7`（強制對齊，時間軸改成真的聲音；畫面的事件都寫 cue，會自動跟上）。
  3. `npm run validate` → `flock /tmp/aimp4-render.lock npm run still` → `npm run render` → 用 ffmpeg 把錄音合進去（指令照第 1 版：`-map 0:v -map 1:a -c:v copy -c:a aac`）。
  4. 錄音如果比 24 秒長（語速不到每秒 4.6 個音節），先告訴使用者，再決定重錄或加速（上限 1.08）。
- **只拿到音色名稱時**：`script.json` 的 `voice.voiceName` 改成那個名字、`voice.profile` 的說明改用短說明那一句（要在 `scripts/voice-profile.mjs` 加一個只有一句的 delivery，做法同 `report`），先說明會送 1 次請求、得到同意後再 `node scripts/tts-take.mjs liguligu-jensen-pro` → `npm run align` → render。

## 重做指令

```
python3 scripts/dossier/make-photos.py liguligu-jensen-pro      # 黑白低對比照片 → public/dossier/<slug>/
node scripts/dossier/fetch-fonts.mjs liguligu-jensen-pro        # Noto Serif TC 子集（含 A–Z）→ public/fonts/dossier/；改了畫面上的字要重跑
SILENT_RATE=5.2 SILENT_GAP=0.12 ALIGN_TAIL_END_F=14 node scripts/ui/silent-timeline.mjs liguligu-jensen-pro   # 無聲估算時間軸
npm run validate liguligu-jensen-pro
node scripts/dossier/events.mjs liguligu-jensen-pro             # 每鏡事件間隔
flock /tmp/aimp4-render.lock npm run still liguligu-jensen-pro
flock /tmp/aimp4-render.lock npm run render liguligu-jensen-pro
python3 scripts/ui/review9.py liguligu-jensen-pro "0,s01:start+40,s01:why+16,s02:leak+16,s03:out+10,s04:glad+20,s05:setup+8,s06:quiet+18,s07:ask+22"
node scripts/dossier/short-voice-prompt.mjs                     # 短說明的男聲試聽提示詞
```
第 1 版的時間軸（前 3 鏡是錄音的真時間）備份在 `out/liguligu-jensen-pro/timeline-v1-recording.json`（`out/` 不 commit；git 紀錄裡也有）。

## 風格

一句話：國際財經媒體的調查專題／紀錄片檔案室——深色底上只有白灰字、一個深紅、一個冷色，文件是淺色紙面摹本，重點用細紅框和引線標，不用手繪圈、印章、便利貼。

- 色票（`src/theme.ts` 的 `THEME_DOSSIER`）：底 墨藍炭灰 `#0D1118`（中央 `#161D29`、60px 細格線 3.5% 白）；字 白 `#ECEEF1`／灰 `#AEB6C2`／淡灰 `#8A93A1`；唯一強調色 深紅 `#D8483A`（深底上的紅字 `#F06A5A`、紙面上 `#B3261B`）；「已確定」冷色 `#6FB7C6`；紙面 `#E8E4D8`（字 `#1A1E26`）；深色卡 `#151B26`。
- 字：大標 Noto Serif TC 900（文件標題與字標 600）；內文、字幕 Noto Sans TC；數字 Inter（小字的日期、鏡號用等寬數字 tabular-nums；大字級用比例寬，等寬的「1」放大後太鬆）。
- 查證狀態＝單色小標（方點＋字＋細框）：已確定（冷色）、媒體報導／公司未證實（灰）、查不到證據（紅、實心點）、截至 2026/11/14 尚未確定（紅、空心點）。
- 動作（`THEME_DOSSIER.motion`）：遮罩擦入 14 幀、描線 16 幀、打字每字 2 幀、淡入 10 幀、紅框描完閃一下、照片慢推 5%；這一版每鏡慢推改成 1.2%（以左邊為準，內容才和新聞條對齊），換鏡是橫向擦切。沒有彈跳、搖晃、旋轉。
- 版面（這一版，`LAYOUT_DOSSIER_NEWS`）：新聞條 224–288｜電頭 294–330｜主舞台 352–1272（左右各留 80）｜標題條 1284–1498（中文 64px、關鍵詞紅底線、英文 30px）｜出處 1510｜地圖上的地點 1560–1636｜跑馬燈 1640–1696｜1700 以下只有地圖背景。新聞條與標題籤的紅底是 `#B8322A`（比強調紅深一階，白字才夠清楚）。最小字 28px。第 1 版的版面（`LAYOUT_DOSSIER`）還在，沒有 `news` 時使用。

## 每鏡（主舞台的內容；事件順序和第 1 版一樣，只是更早、更密）

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

- `npm run validate`：**1 error、1 warning**。error 是「最後一幕必須是 EndCard」——短片沒有片尾卡，和 liguligu-jensen 一樣照實留著（`docs/channels/liguligu.md` 第 2 節）；warning 是總長（短片）。
- `npm run still`：7 張逐張看過，沒有溢出、缺字方框；覆蓋率佔用率最低 60%、中位 77%、最長空白帶 102px（第 1 版 49%、124px）。
- `npm run render`：ffprobe 681 幀＝時間軸；blackdetect 沒有黑幀；音軌是靜音。
- 前 3 秒每 2 幀、全片每 0.25 秒抽格看過：換鏡沒有空畫面；每鏡最長靜止 1.0 秒以內（跑馬燈、地點脈衝一直在動）。
- `npx tsc --noEmit`：通過。
- 沒有跑 audit／selfcheck，沒有獨立評審的分數。

## 已知問題

1. **沒有聲音。** 5.2 音節/秒與各鏡長度都是估算，真的錄音來了會重排；s05 只有 1.7 秒，「查不到證據」小標出現後只留約 0.5 秒。
2. 地圖只是淡背景：美國本土那一段剛好在出處與地點名稱後面，看得出點陣但認不太出輪廓；兩個地點在畫面上只隔約 310px。1700 以下（平台介面會蓋到）只有地圖。
3. 資訊比第 1 版密：電頭、欄目籤、出處、跑馬燈同時在，手機上跑馬燈的字（28px）只當氣氛，讀不完整——每鏡的出處另外有固定的一行。
4. 電頭的地點（SANTA CLARA／WASHINGTON, D.C.）與 CNBC 的日期不是 research.md 事實表裡逐條查證的欄位（依據見上面「這一版加了什麼」）；上片前連同原文一起核對。
5. s01 的「1993–2026」、「已確定」小標、「示意，非文件原件」是貼紙版沒有的標示（依據 research.md F2 與第 5 節）。
6. 原文都沒有逐字讀過、上片當天要重查、照片授權未核對——這三項和 liguligu-jensen 一樣（來源見 `videos/liguligu-jensen/assets.md`）。
7. 封面（`out/liguligu-jensen-pro-cover.png`）也換成新聞版的樣子，沒有另外設計。
8. `CLAUDE.md` 還沒有寫進 `stage: "dossier"` 與 `news`（等使用者確定採用再補）。
9. 製作途中，別的工作階段的 commit（`ab35afa`、`c12c14d`）把這支片當時還沒做完的檔案一起收了進去；最後的狀態以工作目錄為準，還沒有另外 commit。

## 新增與改到的檔案（第 2 版）

- `src/components/dossier/DossierVideo.tsx`（國際新聞版的元件都在檔案後半；`Masthead`、時間軸日期籤、橫向擦切）、`engine.ts`（`opts.cut`、`time()`）、`worldDots.json`（新）。
- `src/theme.ts`：`THEME_DOSSIER.news`、`LAYOUT_DOSSIER_NEWS`（只有新增）。
- `scripts/dossier/`：`make-worldmap.mjs`、`events.mjs`、`short-voice-prompt.mjs`（新）；`validate-dossier.mjs`（`news` 的檢查）、`fetch-fonts.mjs`（多收 `news` 與 A–Z）。
- `videos/liguligu-jensen-pro/script.json`（頂層 `news`、每鏡 `props.news`、事件時間、s05 `pauseAfter`；旁白等內容欄位沒動）、`timeline.json`、`storyboard.json`。
- 第 1 版新增的檔案：`src/components/dossier/`、`scripts/dossier/`（`validate-dossier.mjs`、`fetch-fonts.mjs`、`make-photos.py`、`recording-timeline.mjs`）；共用檔 `src/Video.tsx`、`src/Cover.tsx`、`scripts/validate.mjs`、`.gitignore` 各加幾行。這一版沒有再動共用檔（除了 `src/theme.ts` 的新增）。

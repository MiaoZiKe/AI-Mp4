# ai-make-video — 用 AI 做一支短影音的五張便利貼（AI 頻道樣片）

styleVersion 3（桌面紙拼貼）、`skin: "sticky"`（白板＋彩色便利貼）、20 鏡。更新：2026/11/13（第二輪修正後出片）。

## 成片

| 項目 | 內容 |
|---|---|
| 成片 | `out/ai-make-video.mp4` |
| 長度 | 63.6 秒、1908 幀、30fps |
| 畫面 | 1080×1920、H.264 |
| 聲音 | AAC 48kHz 立體聲；整體 −14.1 LUFS、真峰值 −4.5 dBFS（人聲＋自合成背景音＋3 個音效，細節在 `mix.json`） |
| 字幕檔 | `out/ai-make-video.srt`（中英）、`.zh.srt`、`.en.srt` |
| 封面 | `out/ai-make-video-cover.png`（另有 `-cover-3x4.png`、`-cover-1x1.png`） |
| 每鏡截圖、總覽 | `out/ai-make-video/stills/`、`out/ai-make-video-overview.png` |
| 評分總表圖 | `out/ai-make-video-review.png` |

## 檢查數字（2026/11/13 最後一次全片）

| 檢查 | 結果 |
|---|---|
| validate | 0 error、21 個警告（19 個是「同屏超過 3 樣」的估算，把鏡頭外和逐格換圖的聲波也算進去；1 個是 s14「YouTube 營利政策」11 字；1 個是字數估算 76 秒，實際時間軸 63.6 秒） |
| ffprobe | 可播放；影像 1908 幀、63.6 秒；有音軌 |
| audit（`motion.json`） | 幀數一致；雙重曝光 0；同時字幕最多 1 組；人聲重疊 0；`blackFramesTotal` 14（是切割墊和蓋場紙，已知限制）；用 ffmpeg blackdetect 量真正黑幀＝0 |
| selfcheck 全片：確定性 | 過 |
| selfcheck：快動作比例 | 過（0.197） |
| selfcheck：中段空畫面 | 過（0 幀） |
| selfcheck：靜止超過 1.5 秒 | 過（0 段） |
| selfcheck：前 2 秒畫面差 | 過（最小 3.75） |
| selfcheck：轉場佔用率 | 過（最低比值 0.74） |
| selfcheck：單幀跳變 | **沒過**：35 幀，最大 39%。都是紙片貼上的那一幀，是 v3 的已知限制（CLAUDE.md 有寫） |
| selfcheck：評審六項分數 | **沒過**：前 2 秒 8、手機看得清 8、動作自然 8、畫面變化 8、**構圖 7**、聲畫匹配 8。這是修正「前」那一版的分數，修正後還沒有請評審重看 |
| still 覆蓋率（v3 門檻） | 佔用率最低 40.4%、中位 61.8%；1 個警告：s08 截圖最長空白帶 352px（門檻 260） |

所以 selfcheck 指令的總結果仍是「不通過」，原因就是上面兩項。

## 第二輪修了什麼

評審的必修和大部分建議都改了，細節在 `visual-spec.md` 第 7 節。

- **必修 s07 字幕斷錯**：改好了。現在是「第三張 聲音」→「把稿子貼進配音工具」→「讓電腦念出來」。
- s12 開頭空畫面：紙條開口就滑入。
- s04、s10、s17 落定後只剩一張便利貼：拍立得和手機提早進場。
- s16 中段空、s18 上半部空：便利貼先維持大張、s18 先貼一張白紙條。
- s09 拍立得壓到便利貼：往下移。
- s11、s17、s18 紙片退場壓過頁首：改往左右走。
- s12 出處緊貼錯話：出處移到 s13。
- s06 沙漏標籤改成「計時」；s20 片尾卡的紙雲拿掉；s17 底線在規格裡註明取消。
- 另外為了過自查，把 T 鏡位搬到 S5 旁邊（蓋切割墊時不再有整片空白的幀）、s10 加一張標籤、s13「真的嗎？」提早。

## 沒修的

1. **配音三處疑似念得和字幕不同**：沒辦法試聽，也沒有重配（take 模式要整篇重來）。見下面人耳清單。
2. **s09 旁白說「自己拍的照片」，畫面是 Pexels 示意照**（石造拱門巷子不是台灣）。要換成自己拍的三張：同檔名放進 `out/ai-make-video/assets-raw/photos/`，重跑 `make-paper.py` 和 render。
3. **YouTube 官方營利政策頁還是沒讀到**：`support.google.com` 不在這個環境的網路允許清單，這一輪又試了一次仍連不上。s14–s15「2025 年講明、大量複製的內容不能分潤」和畫面的「2025/7/15」只有四家二手報導一致。上片前要有人用瀏覽器讀官方頁。
4. **七張照片的授權與作者沒有核對**（清單在下面）。
5. s10 的剪刀是修容小剪刀，沒有找到更貼切的照片。
6. 修正後沒有請獨立評審重看，`review.md` 的分數沒有動。

## 人耳確認清單（上片前一定要有人聽過）

秒數是成片 `out/ai-make-video.mp4` 的時間。

- [ ] **約 17.3–17.7 秒，s06「我們實測」**：自動聽寫聽成「我們測試」，「測」字對齊信心是 0。如果真的念成「測試」，意思沒錯但和字幕不一樣，要整篇重配（念稿可改成「我們自己量過」），重配後要重跑 align、`props.gen.py`、still、render。
- [ ] **約 31 秒，s10「剪接」**：聽寫成「剪輯」。
- [ ] **約 40 秒，s12「跟真的一樣順」**：聽寫成「真的的一樣」，可能多念一個「的」。
- [ ] **約 44–46.5 秒，s14「YouTube 二零二五年」**：對齊信心 0.531（全片最低），確認念得清楚、日期紙條有跟上。
- [ ] **約 19.9–21.7 秒，s07「第三張，聲音」**：字幕這一段剛改過，確認字幕和聲音對得上。
- [ ] 整體音色偏低沉、高頻少，比 what-is-server 悶；和另外三支樣片放在一起聽像不像同一個頻道。
- [ ] `pronunciation.md`「人耳必聽」列的字：便利貼、稿子、分潤、攤開、念出來、講得、照著、還是你。

## 照片授權未核對清單

Pexels 官網在製作環境會回機器人驗證頁，沒有繞過。七張都要有人用一般瀏覽器打開，確認照片還在、是 Pexels 授權，並把作者補進 `assets.md`。任何一張對不上就拿掉那張拍立得（都不影響旁白）。原圖都看過，沒有人臉和商標。

| 代號 | 用在 | 網址 |
|---|---|---|
| mic | s01、s18–s19、封面 | https://www.pexels.com/photo/194985/ |
| notebook | s04 | https://www.pexels.com/photo/602900/ |
| timer | s06 | https://www.pexels.com/photo/1209998/ |
| street | s09 | https://www.pexels.com/photo/800789/ |
| food | s09 | https://www.pexels.com/photo/699953/ |
| desk | s09 | https://www.pexels.com/photo/42408/ |
| scissors | s10 | https://www.pexels.com/photo/322345/ |

授權條款頁：https://www.pexels.com/license/ 。網址是用編號推的短網址，沒有實際打開過。

## 怎麼重做畫面

```
python3 videos/ai-make-video/props.gen.py          # 改畫面只改這支，不直接改 script.json 的 props
python3 scripts/make-paper.py ai-make-video         # 改了 assets.json 或換照片才需要
npm run validate ai-make-video
flock /tmp/aimp4-render.lock npm run still ai-make-video
flock /tmp/aimp4-render.lock npm run render ai-make-video
flock /tmp/aimp4-render.lock npm run audit ai-make-video
flock /tmp/aimp4-render.lock npm run selfcheck ai-make-video -- --render
python3 scripts/v3/review-sheet.py ai-make-video
```

注意：`props.gen.py` 這一輪也會改 s07 的字幕、s12／s13 的出處、s20 的片尾卡設定。字幕改了要先跑 `npm run align`（只會重新對齊有改的那一幕）。

## 其他已知的事

- 耳機（s07）、放大鏡（s13）的照片沒找到合格的，改用紙片；`storyboard.md` 是配音前的版本，和成品的差異列在 `visual-spec.md` 第 5、7 節。
- 圖片和影片都不 commit。這一輪沒有 commit。

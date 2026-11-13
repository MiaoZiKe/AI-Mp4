# sample-ai-sketch（AI 教學頻道風格試片：白板手繪）

這是 AI 教學頻道的另一種風格試片，用來和 `sample-ai-ui`（仿介面動畫）比畫面。旁白、配音音檔、時間軸、背景音樂都和 `sample-ai-ui` 一模一樣，只有畫面不同。這支沒有重新配音，所以旁白還是使用者說「太像演講」的那一版；旁白要更像真人，是另外一件事，不在這支處理。

| 項目 | 內容 |
|---|---|
| 成片 | `out/sample-ai-sketch.mp4`（1080×1920、30fps、H.264，13.9 秒、417 幀） |
| 九格關鍵畫面 | `out/sample-ai-sketch-review.png` |
| 截圖 | `out/sample-ai-sketch-overview.png`（每幕一張）、`out/sample-ai-sketch-cover.png`（封面） |
| 旁白（63 字） | 你問 AI，是不是都只打一句話？難怪它回得很普通。Google 的官方指南說，好的提示詞有四塊：角色、任務、背景、格式。四塊補上去，同一個 AI，回答更貼近你要的。 |

## 風格說明

- 一句話：像有人拿麥克筆在一張點點方格紙的大板子上邊講邊畫，線一筆一筆描出來，字一個一個寫出來。
- 畫面上只有四種東西：手寫字、手繪線條（框、圈、箭頭、叉、勾、大括號、波浪線）、螢光筆塗色、簡單的小圖（機器人頭、書）。沒有視窗、沒有照片、沒有紙片。
- 整支片是同一塊板子，鏡頭只動兩次：第 3 幕往右橫移到新的一區，第 5 幕往後拉，把「四塊提示詞 → AI → 回答」一次看完。
- 每一幕的畫面：
  1. 第 0 幀就有手寫的「只打一句話？」和一個空的輸入框；旁白念的同時在框裡寫出「幫我寫一篇貼文」，念到「一句話」時螢光筆塗過標題、紅筆把輸入框圈起來。
  2. 箭頭往下畫到機器人頭，機器人吐出一個只有波浪線的對話框，念到「很普通」時紅筆打叉、寫上「很普通」。
  3. 鏡頭橫移到新的一區：畫一本書、寫「官方指南」，再寫「好的提示詞有四塊」，四個不同顏色的空框依序畫出來，「四塊」被紅筆圈起來。
  4. 念到哪一塊，那個框就用螢光筆塗上顏色、寫上欄位名稱和示範文字。
  5. 鏡頭往後拉：大括號把四塊收在一起，箭頭指向笑臉的機器人，再往下畫出回答的框，最後打一個綠色的勾、寫上「更貼近你要的」。
- 線條畫完以後每 6 幀會輕微重描一次（位移約 1px），讓畫面有手繪動畫的呼吸感，不會整張靜止。
- 和另外兩種風格的差別：仿介面版是深色的視窗、游標和打字；紙拼貼是有紙紋的桌面和紙片。這支是淺色的紙、純線條和手寫字。
- 沒有真人肖像、沒有真實商標或真實產品的介面。機器人頭是自己畫的；「Prompting guide 101」只是寫出文件名稱當出處。

## 字型

- 中文手寫感：LXGW WenKai TC（霞鶩文楷）700，SIL OFL 1.1 授權，再加一圈同色描邊讓它像麥克筆。
- 英文手寫：Caveat 700，SIL OFL 1.1 授權。
- 兩套都是從 Google Fonts 抓「只含這支片用到的字」的子集，存到 `public/fonts/sketch/`（這個資料夾不 commit）。改了畫面上的字就要重跑 `node scripts/ai-sketch/fetch-fonts.mjs sample-ai-sketch`，validate 會檢查有沒有缺字。
- 頁首、畫面、字幕都用這兩套手寫字；出處那一行也是。

## 怎麼做的

- script.json 頂層寫 `styleVersion: 3` 加 `stage: "sketch"`，每幕 `component: "SketchScene"`。配音、時間軸、字幕檔、混音都沿用 v3 的流程。
- script.json 是用 `node scripts/ai-sketch/gen-script.mjs` 從 `videos/sample-ai-ui/script.json` 產生的（旁白、字幕、cue、配音設定原樣帶過來，只換 `props`）。要改畫面就改這支產生器再重跑。
- `timeline.json` 和 `public/audio/sample-ai-sketch/` 的音檔是從 `sample-ai-ui` 複製過來的（只把路徑裡的 slug 換掉），沒有送任何 TTS 請求。
- 元件在 `src/components/ai-sketch/`：
  - `rough.ts`：把線、框、圈、箭頭、叉、勾、波浪、塗色、小圖變成一筆一筆的 SVG 路徑，手抖用固定 seed。
  - `engine.ts`：把各幕 `props.items` 換成絕對幀，鏡頭排成關鍵幀。
  - `SketchVideo.tsx`：板子、形狀描線、手寫字、頁首、字幕、出處、封面。
- 色票、線寬、手抖幅度、動作幀數是 `src/theme.ts` 的 `THEME_SKETCH`、`LAYOUT_SKETCH`，元件沒有寫死色碼。
- 每幕 props：
  - `origin: [x, y]`：這一幕的東西在板子上的左上角。
  - `camera: { to: [x, y, 縮放], at, dur }`：鏡頭移到板子上的哪裡（主畫面是 952×920）。第一幕不寫 `at` 就是起始位置。
  - `kwColors`：字幕關鍵詞依序用的顏色（不寫就是紅字加黃色螢光筆）。
  - `items`：畫面上的東西，順序就是上下層。
- 字：`{ type: "text", t, x, y, size, color, at, per（每個字幾幀）或 end（寫到哪個 cue 為止）, font: "en", rot }`。
- 形狀：`rect｜ellipse｜line｜cross｜check｜squiggle｜underline｜hatch（螢光筆塗色）｜brace｜bubble｜send｜book｜robot｜spark` 用 `box`；`arrow｜curve｜poly` 用 `pts`。`w: "bold"` 是粗筆，`dur` 不寫就依線的長度算。
- 筆的顏色：`ink｜ink2｜ink3｜red｜blue｜green｜amber｜violet`；螢光筆：`yellow｜red｜blue｜green｜amber｜violet`。
- 時間都寫 cue id 或 `start｜voice｜end｜exit` 加減幾幀，可以加「幕id:」前綴，沒有手填秒數。
- 檢查規則：`scripts/ai-sketch/validate-sketch.mjs`。
- 指令（吃 CPU 的都要包 `flock /tmp/aimp4-render.lock`）：
  - `node scripts/ai-sketch/gen-script.mjs`
  - `node scripts/ai-sketch/fetch-fonts.mjs sample-ai-sketch`
  - `node scripts/validate.mjs sample-ai-sketch`
  - `node scripts/still.mjs sample-ai-sketch`、`node scripts/render.mjs sample-ai-sketch`
  - 看指定時刻：`node scripts/v3/peek.mjs sample-ai-sketch <out.png> 0,52,97,...`

## 動到的共用檔（都只有新增，沒有改既有行為）

- `src/theme.ts`：檔尾新增 `THEME_SKETCH`、`LAYOUT_SKETCH`、`penSketch`、`markerSketch`、`FONT_SKETCH_ZH`、`FONT_SKETCH_EN`。
- `src/Video.tsx`：多一行 import、多一行 `stage === "sketch"` 的分支。
- `src/Cover.tsx`：多一行 import、多一個 `stage === "sketch"` 的分支。
- `scripts/validate.mjs`：多一行 import、多一行 `stage === "sketch"` 的分支，時間軸檢查那一行多一個 `"sketch"`。
- `src/types.ts`、`package.json`、其他 `scripts/*.mjs` 沒有動。

## 已知問題

1. 旁白沒有重配，還是原本那一版。
2. `still` 的覆蓋率檢查對這支沒有意義：點點方格紙鋪滿整個畫面，量出來一定是 100%。
3. 第 5 幕鏡頭拉遠後，上面四塊的示範文字在手機上約 31px，只當作背景看；主角是下面的回答框。
4. 字幕下方到畫面底部（約 1700–1920）是空的，和其他風格一樣只留底色。
5. 手寫字是字型加描邊，每個字有固定的小角度和上下位移，但同一個字長得一樣，仔細看得出來不是真的手寫。
6. 第 4 幕字幕是四個詞同一列、念到哪個哪個上色（和 `sample-ai-ui` 後來的做法相同）。

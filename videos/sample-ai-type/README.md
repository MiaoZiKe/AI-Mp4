# sample-ai-type（AI 教學頻道風格試片：動態大字）

這是 AI 教學頻道的第二種風格試片，用來和 `sample-ai-ui`（仿介面動畫）比畫面。旁白、配音音檔、時間軸、背景音樂都和 `sample-ai-ui` 一模一樣，只有畫面不同。這支沒有重新配音，所以旁白還是使用者說「太像演講」的那一版。

| 項目 | 內容 |
|---|---|
| 成片 | `out/sample-ai-type.mp4`（1080×1920、30fps、H.264，13.9 秒、417 幀） |
| 九格關鍵畫面 | `out/sample-ai-type-review.png` |
| 截圖 | `out/sample-ai-type-overview.png`（每幕一張）、`out/sample-ai-type-cover.png`（封面） |
| 旁白（63 字） | 你問 AI，是不是都只打一句話？難怪它回得很普通。Google 的官方指南說，好的提示詞有四塊：角色、任務、背景、格式。四塊補上去，同一個 AI，回答更貼近你要的。 |

## 風格說明

- 一句話：整個畫面只有大字，旁白念到哪個字，那個字就出現，像歌詞影片。
- 沒有視窗、圖示、卡片、照片。中文旁白就是畫面上的大字，所以不另外放中文字幕；左下角只有一行英文副字幕和出處。
- 只有兩種底色（墨黑、紙白）、一個主強調色（橘紅）、四個欄位色（橘紅／藍／綠／黃）。所有字靠左對齊在 x＝64。
- 每一幕的畫面：
  1. 第 0 幀就有空心的「只打一句話？」，念到才填滿；下面打出提示詞「幫我寫一篇貼文」。
  2. 提示詞移到上面，灰色的「很普通」出現，提示詞被橘紅線劃掉。
  3. 底色由下往上換成紙白；「四塊」是全片最大的字，下面長出四個小色塊。
  4. 四個小色塊各自放大成一條橫帶，帶上是欄位名稱和示範文字。
  5. 四條橫帶縮成上面一排標籤；「很普通」被劃掉，換成橘紅色的「更貼近」。
- 和另外兩種風格的差別：仿介面版是深藍紫色的視窗和游標；紙拼貼是有紙紋的桌面和紙片。這支是平塗的黑白底加大字，沒有任何擬物的東西。

## 怎麼做的

- script.json 頂層寫 `styleVersion: 3` 加 `stage: "type"`，每幕 `component: "TypeScene"`。配音、時間軸、字幕檔、混音都沿用 v3 的流程。
- script.json 是用 `node scripts/ai-type/gen-script.mjs` 從 `videos/sample-ai-ui/script.json` 產生的（旁白、字幕、cue、配音設定原樣帶過來，只換 `props`）。要改畫面就改這支產生器再重跑。
- 元件在 `src/components/ai-type/`：`engine.ts`（把 `props.items` 換成絕對幀）、`TypeVideo.tsx`（字、色塊、頁首、英文副字幕、封面）。色票與版面是 `src/theme.ts` 的 `THEME_TYPE`、`LAYOUT_TYPE`，元件沒有寫死色碼。
- 每幕 props：`ground`（`ink`｜`paper`，寫了就換底）、`enter`／`enterAt`（換底方式與時間）、`items`。
- 字（預設）：`t`、`x`（預設 64）、`y`、`size`、`color`（`fg｜fg2｜fg3｜hot｜blue｜green｜yellow｜on:色名`）、`font: "en"`、`w`（要換行時的寬度）。
  - 不寫 `at`：跟著配音逐字出現（讀 timeline 的逐字幀）。寫 `at`：從那一幀起打字。
  - `mode`：`type`（逐字，預設）、`ghost`（先空心、念到才填滿）、`slam`（整個詞砸下來）、`rise`（整行浮上來）。
  - `set: [{ at, x, y, color }]`（移動、換色）、`strike`（劃掉）、`underline`（底線）、`caret`（打字游標）、`until`＋`exit`（`up｜fade｜drop`）。
- 色塊：`kind: "block"`、`rect: [x, y, w, h]`、`color`、`at`、`enter`（`wipe-r｜wipe-u｜pop`）、`set: [{ at, rect }]`（變形）。
- `layer: "top"` 的東西畫在所有底色上面，換底時不會被蓋掉（四個色塊用這個）。
- 時間都寫 cue id 或 `start｜voice｜end｜exit` 加減幾幀，可以加「幕id:」前綴指到別的幕（例如 `s2:plain+2`），沒有手填秒數。
- 檢查規則：`scripts/ai-type/validate-type.mjs`（時間寫法、顏色名稱、字有沒有超出安全區、跟著配音的字在不在字幕裡）。
- 指令（都要包 `flock /tmp/aimp4-render.lock`）：
  - `node scripts/validate.mjs sample-ai-type`
  - `node scripts/still.mjs sample-ai-type`
  - `node scripts/render.mjs sample-ai-type`
- 不要對這個 slug 跑 `tts-take.mjs` 或 `align.mjs`：音檔和 `timeline.json` 是從 `sample-ai-ui` 複製來的（只把路徑裡的 slug 換掉）。`sample-ai-ui` 之後如果重新配音，這支要重新複製音檔與 timeline，再重跑產生器。

## 渲染

- 全片渲染 18 秒（417 幀、每幀 43 毫秒、concurrency 4）。加上混音不到 1 分鐘。
- 混音和 `sample-ai-ui` 相同：背景音樂加 1 個轉場音效，整體 −14.3 LUFS。
- ffprobe：H.264、1080×1920、30fps、13.9 秒，幀數 417 和時間軸一致。ffmpeg blackdetect 沒有偵測到黑幀。

## 已知問題

1. 第四幕最後一條橫帶（格式）的示範文字「標題加三行，口吻輕鬆」只停留約 0.3 秒就收起來，來不及讀完。原因是旁白念完「格式」馬上接下一句。
2. 第二幕「很普通」打完到換底只有約 0.4 秒，停留偏短。
3. 第二幕截圖下方有 316px 空白帶，覆蓋率檢查有一個警告（門檻 260px）。
4. 第五幕畫面上的「很普通」被劃掉再換成「更貼近」，這三個字那時旁白沒有念，是畫面自己加的回扣。
5. 逐字時間來自強制對齊。第一幕的「句」和「話」對到同一幀，程式自動錯開 2 幀。
6. 沒有做 selfcheck 和 audit，只有每 0.25 秒抽格自己看過一次。
7. 旁白是舊的那一版，還沒有照 `docs/voice-natural.md` 的聊天口吻重配（今天的 TTS 額度已用完）。

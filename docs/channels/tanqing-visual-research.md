# 談晴說礙：適合「觀察者、帶點安慰又有點絕望」的短影音畫面（2026/11/14）

使用者要求：「找一個適合觀察者、探討目前境況的風格，以及帶點安慰、又有點絕望感覺」。
這份比較五種做法，選一種做成 `stage: "talk"`（夜窗，`src/components/talk/`），第一支是 `videos/short-talk/`。
前一種試片 `stage: "notes"`（觀察者筆記：照片＋手寫字，`videos/sample-talk-notes/`）只做了前製骨架，這份不取代它，兩種都留給使用者挑。

## 查了什麼（WebSearch，3 次，都是摘要）

- 「憂鬱感」短影音（TikTok／Reels 上常標 melancholic）：35mm／16mm 底片顆粒、靜態鏡頭上很慢的推近（例如 5 秒內從 100% 放大到 105%）、夜裡的城市、雨窗、燈光散景、配合音樂的慢剪接、深藍調色。來源多是工具廠商與提示詞範例頁，不是編輯或研究者的分析，只拿來看「長什麼樣」。
  - https://resources.oreateai.com/resources/why-the-lonely-men-movie-edit-is-the-new-language-of-digital-melancholy
  - https://www.neuralframes.com/styles/melancholic-aesthetic
- 單一數字的版面：一個大字、置中或靠一邊、大量留白，只配一句說明；在影片裡可以用計數往上跳；把數字換成小而整的比例（例如「八個裡面一個」）會讓人自己想像一群人。
  - https://www.mauriziolacava.com/en/faq/design-a-slide-that-focuses-on-a-single-powerful-statistic/
  - https://figuresandfigures.substack.com/p/lesson-from-mcdonalds
  - https://onlinejournalismblog.com/2026/06/23/showing-charts-on-video-here-are-two-essential-techniques-to-make-them-effective/
- 窗景與時間流逝的短片：固定鏡頭、窗裡靜止、窗外一直在變；用光線的變化講孤單和時間，幾乎不說話。
  - 片目摘要（例如 Days End、The Window 2025、Dag Buurvrouw 2）：https://iffr.com/en/iffr/2009/films/dag-buurvrouw-2 、https://flicklist.tv/movies/the-window-2025

## 五種做法比較

這台機器能做的：實拍照片（Pexels 鏡像，`find_pexels.py`，無可辨識人臉）、2D 動態、SVG、CSS。不能用 AI 生圖、沒有 GPU、不做 3D。

| 做法 | 情緒對不對 | 觀察者感 | 安慰 vs 絕望 | 這台機器做不做得到 | 風險 |
|---|---|---|---|---|---|
| A. 電影感慢推實拍照片＋大字幕 | 對：慢、安靜 | 中：鏡頭在看，但沒有「誰在看」的位置 | 只能靠旁白切換 | 做得到（CSS transform；每幀成本低） | 容易像勵志語錄影片；照片挑不好就廉價 |
| B. 底片顆粒＋安靜的城市夜景 | 很對：夜晚＝下班後一個人 | 強：從窗外看很多窗，就是觀察者 | 夜景本身偏絕望，安慰要另外給 | 做得到（SVG feTurbulence 顆粒、CSS 調色） | 全片都暗會悶；夜景照片偏少 |
| C. 手寫日記加照片（＝已有的 `notes`） | 對：私人、溫柔 | 中：比較像「我的日記」 | 偏安慰，絕望感弱 | 做得到，但手寫筆跡動畫要另外做字型與描線 | 已經有一支前製；手寫字在手機上易糊 |
| D. 極簡排版＋單一數字 | 冷、清楚 | 強：只陳述數字 | 偏絕望，沒有溫度 | 很容易做（純 CSS） | 和 AI 頻道的 `type` 動態大字太像；沒有生活感 |
| E. 窗景時間流逝（同一扇窗從夜到亮燈） | 很對：時間過去、什麼都沒變，但燈亮了 | 強 | 兩者都有：同一扇窗，冷→暖 | 半做得到：沒有縮時影片素材，只能用同一張照片換調色假裝 | 只靠調色撐不了太多鏡 |

## 選擇：B＋D＋E 合成的「夜窗」

- **底**：B 的夜景實拍照片＋底片顆粒＋暗角，鏡頭只做 A 的很慢推近（每鏡 4%，一鏡一次方向，不連續縮放）。
- **數字**：D 的單一大數字（全片只有一個，260px），旁邊一行說明；下面一排十格窗，念到「六個」時亮六格——把比例換成「十個人裡面幾個」（單一數字研究裡「小而整的比例」那一條），窗也是這支片的畫面母題。
- **安慰與絕望的切換**：E 的做法，不換風格只換光。礙的鏡頭是冷的夜色（藍、壓暗、降飽和），到「不過」那一刻整個畫面在 24 幀內轉成暖燈色；最後回到第一鏡的同一扇窗，這次是暖的。絕望不用說出口（窗還是那些窗、數字沒變），安慰也不用說出口（燈亮了、有人記得你要加辣）。
- **為什麼不是 C**：已經有 `notes` 的前製，再做一次手寫就變成兩支一樣的試片；而且手寫的私人感比較偏「我」，這次使用者要的是「觀察者看境況」。
- **為什麼不只用 D**：只有排版會太冷，也會和 AI 頻道的動態大字撞型。

## 規則（寫進 `scripts/talk/validate-talk.mjs`）

- 一鏡一張實拍照片，一幕最多換兩張；沒有人臉、商標、門牌、車牌、招牌字。
- 全片只有一個 `kind: "number"`，要有 `claim` 指到 research.md。
- 第一幕要有 `at: "start"` 的數字或句子（第 0 幀就是後果或數字）。
- 一個畫面最多兩句（`line`／`sunny`）；結尾一定有 `sunny`，晴那一段 `grade: "warm"`。
- 字的 `at` 只寫 cue id 或 start｜voice｜end｜exit ±幀。
- 口吻與禁用語沿用 `docs/channels/tanqing-shuoai.md`（和 `notes` 共用 `TANQING_BANNED`／`TANQING_SOFT`）；「你」只出現在提問裡。
- 可以用淡入淡出（`stage` 的共同規則）；不用 3D、霓虹發光。

## 元件（骨架，2026/11/14）

- `src/components/talk/engine.ts`：把各幕 `photo`／`photos`、`grade`、`words` 攤平成絕對幀。
- `src/components/talk/TalkVideo.tsx`：`VideoTalk`（照片慢推與交疊、調色、顆粒、暗角、頁首、數字／句子／十格窗／提問、字幕、出處、人聲）與 `CoverTalk`。
- token：`src/theme.ts` 的 `THEME_TALK`／`LAYOUT_TALK`。
- 照片放 `public/talk/<slug>/<name>.jpg`（不 commit，`.gitignore` 已加）；原圖留在 `out/<slug>/assets-raw/photos/`。
- 還沒做：配音後用 still 實際看照片裁切、字在亮處的可讀性、顆粒強度；`CoverTalk` 沒看過成品。

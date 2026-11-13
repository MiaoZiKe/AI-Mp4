# sample-ai-bright（AI 教學頻道風格試片：亮色產品發表風）

使用者看完 `sample-ai-news`（深色仿介面）後說「需要亮色，這風格可能不太好，想看看其他的」。這支是替代風格之一，只做 15 秒左右的**無聲**試片，讓使用者比畫面。沒有配音、沒有片尾卡、沒有背景音樂。

| 項目 | 內容 |
|---|---|
| 成片 | `out/sample-ai-bright.mp4`（1080×1920、30fps、H.264，16.6 秒、497 幀，5 鏡） |
| 九格圖 | `out/sample-ai-bright-review.png` |
| 截圖 | `out/sample-ai-bright/stills/`（每鏡一張）、`out/sample-ai-bright-overview.png`、封面 `out/sample-ai-bright-cover.png`（另有 3:4、1:1） |
| 內容 | `sample-ai-news` 的前半段：s01、s02、s03、s04、s06（跳過 s05「這不能怪它」，不然會超過 15 秒太多） |
| 旁白文字 | 直接用 `videos/sample-ai-news/script.json` 在 2026/11/13 21:55 的那一版（另一位正在改語氣；這支只用到字幕與時間） |

## 風格

- 一句話：像新創產品發表影片——暖白底上放圓角大卡片，卡片滑進來、數字跳上來、重點用色塊螢光標出來。
- 提示詞和 AI 的回答都是**大字卡**，不是聊天視窗；沒有游標、視窗列、頭像。
- 色票（都在 `src/theme.ts` 的 `THEME_BRIGHT`）：

| 角色 | 顏色 |
|---|---|
| 底 | 暖白 `#F7F5F0`；卡片白 `#FFFFFF`；細線 `#E4E0D6` |
| 主色（靛藍） | 色塊 `#4F46FF`、白底上的字 `#3A31E0`、淡底 `#E3E1FF` |
| 輔色（珊瑚橘） | 色塊 `#FF5C39`、白底上的字 `#D63A14`、淡底 `#FFDACF` |
| 字 | 主字 `#14162B`、次要 `#4E526B`、輔助 `#6C7088` |
| 光暈 | 主色在右上（20%）、輔色在左下（16%），慢慢漂 |

- 顏色的意思固定：珊瑚橘＝AI 給錯的那個數字；靛藍＝我們這邊（提示詞、今年實際的數字、新做法）。
- 最小的字 28px（出處、節錄標示、頁首右邊的小字）。安全區上下 220、左右 64。

## 每一鏡

1. **s01 鉤子**：第 0 幀就是實心大字「問 AI 物價／給我兩年前的」加兩張數字卡（AI 回答 1.69%、今年 10 月 2.33%）。0.3 秒把 1.69% 劃掉、跳出「2024 年的」；念到「物價」時「兩年前」抹上螢光；念到「抓重點」時右卡彈一下並跳出「連 6 個月高於 2%」。
2. **s02 只打一句話**：靛藍大卡，提示詞一個字一個字打出來；跳出「Gemini 實測・2026/11/13」標籤；下面滑進一張小卡，念到「一句話」時圓圈裡的 1 彈出來。
3. **s03 AI 的回答**：提示詞縮成上面一條膠囊，白色大字卡滑進來（右上標「Gemini 實測・2026/11/13（節錄）」）；念到「一大篇」卡片後面疊出兩層；念到「1.69」時原文裡的 1.69% 抹上螢光，同時跳出一張橘色數字卡。
4. **s04 對答案**：上面白卡是 AI 的 1.69%，念到「兩年前」劃掉並蓋上「2024 年 10 月的」；下面原本是虛線框和問號，念到「2.33」時填成靛藍卡，數字從 1.69 跳到 2.33。
5. **s06 換個問法**：小白卡「只打一句話」被劃掉 → 箭頭 → 靛藍大卡「換個問法」，「問法」抹上橘色色塊，跳出三個標籤（貼原文／只看這段／沒寫就說）。

畫面上 AI 的回答是 `videos/sample-ai-news/tests/01-casual.json` 的原文，只刪節、不改字（只拿掉 Markdown 的星號）；validate 會逐行比對原始檔，改了字就報錯。

## 怎麼做的

- script.json 頂層 `styleVersion: 3` 加 `stage: "bright"`，每幕 `component: "BrightScene"`，`props.panel`＝`hook｜ask｜answer｜compare｜next`。所有時間寫 cue id 或 `start｜voice｜end` 加減幾幀，沒有手填秒數。
- 元件：`src/components/ai-bright/engine.ts`（cue 換成絕對幀）、`BrightVideo.tsx`（五種畫面、頁首、字幕卡、出處、封面）。token：`THEME_BRIGHT`／`LAYOUT_BRIGHT`，元件沒有寫死色碼。
- 檢查：`scripts/ai-bright/validate-bright.mjs`。
- 無聲時間軸：`node scripts/ui/silent-timeline.mjs sample-ai-bright`（每秒 4.9 個音節估的；`timeline.json` 有 `estimated` 標記）。之後要配音，照 `sample-ai-news/README.md` 的順序跑 tts-take → align，畫面會自動對上。

```bash
cd /home/user/AI-Mp4
node scripts/ui/silent-timeline.mjs sample-ai-bright
node scripts/validate.mjs sample-ai-bright
df -h /
flock /tmp/aimp4-render.lock node scripts/still.mjs sample-ai-bright
flock /tmp/aimp4-render.lock node scripts/render.mjs sample-ai-bright
python3 scripts/ui/review9.py sample-ai-bright 0,s01:key+14,s02:test+6,s02:one+14,s03:long+14,s03:old+14,s04:two+16,s04:now+22,s06:change+26
```

## 動到的共用檔（都只是新增）

- `src/theme.ts`：檔尾新增 `THEME_BRIGHT`、`LAYOUT_BRIGHT`。
- `src/Video.tsx`：一行 import、一行 `stage === "bright"`。
- `src/Cover.tsx`：一行 import、封面判斷最前面多一個 `stage === "bright"`。
- `scripts/validate.mjs`：一行 import、一行轉給 `validateBright`、時間軸檢查的 stage 名單加 `"bright"`。

## 已知問題

- 16.6 秒，比 15 秒多一點（五句旁白 71 個音節，照每秒 4.9 個估）。配音後長度會跟著真的聲音變。
- 這是估算時間軸，還沒有配音；卡點（念到哪個字、哪個東西出現）要等配音後再看一次。
- s01 在 1.0–2.7 秒之間只有字幕換行，主畫面沒有新東西；s04 開頭約 0.8 秒只有虛線框和問號在等。
- 「2.33%」「連 6 個月高於 2%」「11/5 公布」沿用 `sample-ai-news/research.md`（多家媒體一致）；主計總處原文在這個環境連不上，還沒有人工對過。
- 旁白是 21:55 當時的版本；語氣改寫完成後，這支的字幕要跟著換再重渲染。
- 背景光暈是大範圍的淡漸層，壓成 H.264 後在某些手機上可能看得到一點色階。
- 只做了五種畫面（鉤子、提問、回答、對答案、換問法）；要做成完整片，還要補「這樣問」五個欄位、結果卡、上下對照、提醒、片尾卡。
- 沒有請沒參與製作的評審評分。

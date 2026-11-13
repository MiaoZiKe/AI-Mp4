# sample-ai-iso：亮色 2.5D 小場景（AI 教學頻道的替代風格試片）

成片是**無聲版**：`out/sample-ai-iso.mp4`，1080×1920、30fps、H.264，16.6 秒（497 幀），5 鏡，沒有片尾卡（風格試片）。
時間軸是照念稿音節數估的（`timeline.json` 有 `estimated` 標記）；畫面的時間全部寫 cue id，配音後重跑對齊就會自動對上。今天沒有送任何 TTS 請求。

- 九格圖：`out/sample-ai-iso-review.png`
- 每鏡截圖：`out/sample-ai-iso/stills/`、總覽 `out/sample-ai-iso-overview.png`、封面 `out/sample-ai-iso-cover.png`

## 這個風格是什麼

一張粉彩的等距（isometric）小桌面：螢幕、鍵盤、新聞紙、放大鏡、便條、鉛筆、盆栽都是有厚度的扁平積木。重點內容是「從桌面飛起來、轉正給觀眾看」的白色厚卡片，鏡頭在桌面上平移縮放。
只用 SVG 與 CSS 2D 矩陣，沒有 three.js／WebGL（每幀約 0.05 秒，和一般畫面一樣快）。

- 開關：`script.json` 頂層 `styleVersion: 3` ＋ `stage: "iso"`，每幕 `component: "IsoScene"`
- 畫面：`src/components/ai-iso/IsoVideo.tsx`；時間換算：`src/components/ai-iso/engine.ts`
- token：`src/theme.ts` 的 `THEME_ISO`／`LAYOUT_ISO`（元件不寫死色碼）
- 檢查：`scripts/ai-iso/validate-iso.mjs`（AI 回答每一行都要是實測原文裡找得到的字、要標「實測…（節錄）」；第 0 幀要有數字；時間只能寫 cue；每幕要有鏡頭）

## 色票

| 用途 | 顏色 |
|---|---|
| 背景（上到下） | `#EEF3FF` → `#F8F3FF`，地面圓點 `#C7D3EF` |
| 字 | 主 `#1B2545`、次 `#465074`、輔 `#5E6889` |
| 主色（螢幕、標題標記） | 長春花藍 `#5566F0`（字 `#3D4BD1`、淡底 `#E1E5FF`） |
| 錯的 | 珊瑚 `#FF7A5C`（字 `#C2381B`、淡底 `#FFE3DB`） |
| 對的 | 青綠 `#19A88A`（字 `#0E775F`、淡底 `#D8F4EB`） |
| 便條 | 暖黃 `#FFD766`（字 `#765300`） |
| 桌面與積木 | 奶油 `#FFF3DC`、薰衣草 `#CFC9FB`、薄荷 `#B2EAD9`、白 `#FFFFFF`（各有兩個側面色） |

## 五鏡在演什麼

1. s01 鉤子：第 0 幀就是實心大字「問 AI 物價／給我兩年前的」，桌上螢幕寫「AI 回答 1.69%」，旁邊綠卡「今年 10 月 2.33%」。0.3 秒蓋章「2024 年的」，念到「物價」標紅「兩年前」，念到「抓重點」鏡頭推近、跳出「連 6 個月高於 2%」。
2. s02 只打一句話：鏡頭推到螢幕，提示卡打字，黃便條「只打一句話」，然後提示卡沿虛線飛進螢幕。
3. s03 螢幕吐出回答卡（Gemini 實測・2026/11/13（節錄），原文只刪節不改字），後面再疊出兩張紙表示「一大篇」，放大鏡飛到 1.69% 上面。
4. s04 回答卡落回桌上，1.69% 被劃掉、蓋「2024 年 10 月的」；念到 2.33% 時綠色大卡從上面掉下來把錯的彈開，再蓋圓章「今年的」。
5. s06 所以換個問法：鏡頭移到新聞紙，新聞紙沿虛線飛進螢幕、螢幕打勾，跳出三個做法「貼原文／只看這段／沒寫就說」。

旁白文字是 `videos/sample-ai-news/script.json` 2026/11/13 當時的 s01–s04、s06（另一位在改語氣；那邊改了之後這裡要重新複製字幕並重跑 `silent-timeline.mjs`）。數字與來源見 `videos/sample-ai-news/research.md`。

## 已知問題

- 每鏡 2.6–4.4 秒，低於 CLAUDE.md 的 5–10 秒（和其他風格試片一樣是短鏡）。
- 螢幕上斜著寫的「AI 回答」因為等距變形，實際看起來的字高大約 28–30px，剛好在下限；螢幕上的字不適合再放更小的。
- 卡片飛行途中（約 0.5 秒）字會跟著縮小，那幾格看不清楚，落定後才是正常大小。
- s03 的放大鏡會蓋住第一行開頭幾個字（鏡片放在 1.69% 的右邊）；回答卡換行是瀏覽器自動排的，換了節錄內容要重看位置。
- s04 被彈開的錯數字卡縮到 56%，上面的章「2024 年 10 月的」實際約 26px（當成已經看過的東西留在角落，不是要再讀一次）。
- s04 從蓋章到綠卡掉下來中間約 1.8 秒只有鏡頭慢推和字幕換段。
- 封面直接用鉤子那一鏡的落定畫面，下面三分之一是空的，沒有另外設計。
- 桌上物件的位置寫在元件裡（`MON`、`NEWS`、`LENS` 與 `POS`），不是資料；換題目要換道具時得改元件。只做了這 5 種鏡頭（hook／ask／answer／compare／next），沒有片尾卡。
- 沒有請沒參與製作的評審打分。主計總處原文在這個環境連不上，沿用 sample-ai-news 的查證。

## 重做

```bash
cd /home/user/AI-Mp4
node scripts/ui/silent-timeline.mjs sample-ai-iso     # 無聲估算時間軸（已有真的配音時間軸時不會覆蓋）
node scripts/validate.mjs sample-ai-iso               # 要 0 error
df -h /
flock /tmp/aimp4-render.lock node scripts/still.mjs sample-ai-iso
flock /tmp/aimp4-render.lock node scripts/render.mjs sample-ai-iso
python3 scripts/ui/review9.py sample-ai-iso 0,s01:key+14,s02:test+20,s02:one+16,s03:long+12,s03:old+16,s04:two+14,s04:now+16,s06:change+30
```

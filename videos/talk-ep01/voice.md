# talk-ep01 配音紀錄

## 現況：無聲版（TTS 請求 1 次，失敗，沒有重送）

- 2026/11/14 22:32（台北）送出唯一的 1 次正式配音請求：`TTS_NO_RETRY=1 NODE_USE_ENV_PROXY=1 node scripts/tts-take.mjs talk-ep01`（Sulafat、gemini-2.5-flash-preview-tts、`languageCode: cmn-TW`、17 幕 7 段）。
- 結果：約 30 秒後回 **HTTP 502「upstream request failed」**，沒有拿到音訊。紀錄在 `tts-requests.json`。這個 502 是代理轉述上游失敗，不確定有沒有算進當天額度。
- 照指示沒有重送，改交無聲版。成片 `out/talk-ep01.mp4` 沒有人聲。
- 所以這一輪**沒有**：聽寫確認、voice-retro 量測、加速 1.2 倍、幕間停頓調整。下面是拿到聲音之後要照做的步驟。

## 原本要送的提示（一字不差；要在 Google AI Studio 自己生成也用這一段，音色 Sulafat）

```
用台灣人平常講話的口音，不特別捲舌、不兒化，用平常說話的音量和聲音，正常語速、不拖尾音、不用氣音、不演，直接說：
一年工作兩千零二十七小時。下班的時候，天早就黑了。

這是勞動部算的，二零二五年的年總工時。換成一天八小時，是兩百五十三個工作天。二零一四年更長，兩千一百三十五小時。後來一路降，疫情那年不到兩千。之後又回升。去年假變多，全年只少了三點六小時。

為什麼降不下來？我們幾乎都是全職。兼職只有百分之三到四，日本大約四個有一個。再來是加班。去年正常工時變少，加班卻變多。還有下班以後。四個人有一個，收過交辦工作的訊息。

只是這個數字要小心讀。全職和兼職，是一起平均的。所以不能說，我們比日本人多上將近四百小時的班。只看全職，台灣一週四十一點五小時，比日本還少。

不過有些傍晚，走出公司，天還亮著。我們多走一站，買一份熱的晚餐。

你上一次天還亮著下班，是什麼時候？

下一集，我們看房租。
```

## 無聲版的時間軸怎麼來的

`SILENT_RATE=5.0 SILENT_GAP=0.3 node scripts/ui/silent-timeline.mjs talk-ep01`：每幕照字數用 5.0 音節/秒估（就是 short-talk 第 3 版成片的語速），幕與幕之間 0.3 秒，換段的地方用 script.json 的 `pauseAfter`（s01、s06、s10、s16 之後 0.45 秒；轉到晴之前的 s13、晴之後的 s15 是 0.6 秒）。全片 66.7 秒。

## 拿到聲音之後（使用者同意再送 1 次，或自己生成後上傳）

1. `TTS_NO_RETRY=1 NODE_USE_ENV_PROXY=1 node scripts/tts-take.mjs talk-ep01`（1 次請求）。聽寫看有沒有漏句、說明有沒有被念出來；`python3 scripts/voice-retro.py` 量語速與捲舌指標。
2. 照 `videos/short-talk/voice.md`「第 3 版」的做法加速：先把 `tts-manifest.json` 複製成 `tts-manifest.raw-pace.json`；17 個切檔各做 `ffmpeg -af atempo=1.2`（原始語速若已經到 4.2 左右，1.2 倍後扣掉停頓約 5.0 音節/秒；差很多就照實際調整倍率）；manifest 的 sec／headSec／tailSec 除以同一個倍率、記 `atempo`；`gapAfter` 同段內照原始間隔除以倍率、上限 0.45，換段處 0.45，s13→s14（轉到晴）與 s15→s16（提問前）可留 0.6。
3. `ALIGN_GAP_MAX=0.6 flock /tmp/aimp4-render.lock npm run align talk-ep01 -- --force`（會整份蓋掉無聲的 timeline.json；畫面的事件都寫 cue，會自動對上）→ `npm run validate talk-ep01` → still → render。
4. script.json 的 `pauseAfter` 是給無聲版用的；align 會拿它當每處停頓的下限（0.45／0.6），和上面的目標一致，可以留著。

## 第 3 版：配音完成（2026/11/15，兩次請求分段生成）

- **為什麼分兩次**：整篇一次的請求在 11/14、11/15 各回 502 一次（tts-requests.json）。改成兩次請求，提示詞同上（Sulafat、`delivery: "plain"`、cmn-TW），A＝s01–s06（第 0–1 段，26.73 秒）、B＝s07–s17（第 2–6 段，48.65 秒），都成功（tts-requests.json 的 `audition:splitA`／`audition:splitB`，docs/tts-usage-manual.json 也記了）。兩段的原檔：`public/audio/talk-ep01/splitA.wav`、`splitB.wav`。這一輪沒有再送任何 TTS 或文字模型請求（沒有聽寫）。
- **接起來**：A＋0.45 秒靜音＋B（24 kHz 單聲道）＝`public/audio/talk-ep01/.take-7ae26340ab.raw.wav`（75.83 秒），再 `node scripts/tts-take.mjs talk-ep01 --resplit`（讀快取，0 次請求）。manifest 的 `take.requests` 改成 2，另加 `take.split` 說明。
- **逐段檢查（fa.py，兩段各自對念稿）**：A 105/105 字、信心 0.687；B 185/185 字、信心 0.883。每句都在、順序對、沒有重複；A 開口在 0.20 秒、B 在 0.32 秒，提示沒有被念出來；沒有長段雜音。B 比較長是因為句間停頓多（0.5–0.94 秒，多數在句號後），不是多念。A 的數字字（兩千零二十七、二零二五、兩百五十三、二零一四、兩千一百三十五、三點六）對齊分數很低，可能只是對齊模型對數字念法不敏感，**要人耳確認有沒有念錯**。
- **語速與加速**：原始 扣掉幕間停頓 4.41 音節/秒（含停頓 3.84）→ `atempo=1.15`（17 個切檔各做一次；未加速的切點備份在 `tts-manifest.raw-pace.json`）→ 扣掉停頓 **5.08**、含停頓 4.50。manifest sec 用實際長度、headSec／tailSec 除以 1.15、記 `atempo`；`gapAfter`：同段內＝原始間隔÷1.15、上限 0.45（原值記在 `gapRawScaled`），換段 0.45，s13→s14、s15→s16 是 0.6。
- **捲舌指標**（voice-retro.py，原始錄音）：ㄓㄔㄕ 6330 Hz、ㄗㄘㄙ 8765 Hz，差距 2435 Hz（不是偏高的樣子；口音仍要人耳聽）。
- **對齊（align，加速後）**：s04 0.334（< 0.5，要試聽：「二零一四年更長，兩千一百三十五小時」）、s03 0.622、s02 0.745（起音誤差中位 580 ms，畫面事件可能早或晚約半秒）、s01 0.767、s13 0.763、s08 0.774；其他 ≥ 0.83。
- 後製：`ALIGN_GAP_MAX=0.6 npm run align talk-ep01 -- --force` → validate 0 error → render。人聲整條 loudnorm −16 LUFS；片尾卡（s18，64.37 秒起）的卡林巴琴音效拉高 9 dB 再混（片尾段峰值約 −6.5 dB），音軌補齊到和畫面一樣長（67.367 秒）。

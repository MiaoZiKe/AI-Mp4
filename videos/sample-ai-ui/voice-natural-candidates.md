# sample-ai-ui 旁白口語化候選（輕／中／重）

為什麼做：使用者說這支的旁白「音色很好，但太演講、有點 AI」。原因判斷與規則在 `docs/voice-natural.md`。這裡是同一段內容的三個口語化程度，明天各錄一次來聽。**今天（2026/11/13）沒有送任何 TTS 請求，三段都還沒有錄音。**

三版的事實都和原稿一樣（出處見 `research.md`）：Google 官方指南說好的提示詞有四塊——角色、任務、背景、格式；補上去之後回答「更貼近你要的」（官方建議，不是量測數字，所以三版都沒有寫成「一定更好」或給倍數）。

## 原稿（現在成片用的，63 個音節）

> 你問 AI，是不是都只打一句話？
> 難怪它回得很普通。
> Google 的官方指南說，好的提示詞有四塊：
> 角色、任務、背景、格式。
> 四塊補上去，同一個 AI，回答更貼近你要的。

## 輕（69 個音節）——只加進場的字和句尾語助詞，句型不動

> 欸，你問 AI，是不是都只打一句話？
> 難怪它回得很普通啊。
> Google 的官方指南有寫，好的提示詞有四塊：
> 角色、任務、背景，還有格式。
> 四塊補上去，同一個 AI，回答就更貼近你要的。

改了什麼：開頭加「欸」；「很普通」後面加「啊」；「說」改「有寫」；條列最後一項前加「還有」；「回答更」改「回答就更」。

## 中（72 個音節）——加自問自答、半句話、丟回去問對方

> 欸，你問 AI 都只打一句話，對不對？
> 難怪啦，回得那麼普通。
> 其實 Google 官方指南有寫，好的提示詞有四塊。
> 哪四塊？角色、任務、背景，還有格式。
> 補上去，一樣的 AI 喔，回答會更貼近你要的。

改了什麼：第一句改成「…，對不對？」；「難怪啦」單獨成半句；冒號拿掉，改成「哪四塊？」自問自答；「同一個」改「一樣的」並加「喔」。

## 重（77 個音節）——再加墊字、想一下的停頓、找對方附和

> 欸我問你，你問 AI 是不是都……只打一句話？
> 對啊，難怪齁，回得超普通。
> Google 官方指南就有寫啦，好的提示詞，有四塊。
> 哪四塊？角色、任務、背景，然後格式。
> 補上去齁，一樣的 AI，回答就比較貼近你要的。

改了什麼：開頭「欸我問你」；句子中間一個「……」；「對啊」「難怪齁」；「就有寫啦」；「還有」改「然後」；「更貼近」改「比較貼近」。這一版有可能太刻意，放進來是為了知道上限在哪。

## 字數與長度（照實寫）

| 版本 | 音節 | 比原稿多 | 照 4.7 音節/秒估的長度 |
|---|---|---|---|
| 原稿 | 63 | — | 13.4 秒 |
| 輕 | 69 | +10% | 約 14.7 秒 |
| 中 | 72 | +14% | 約 15.3 秒 |
| 重 | 77 | +22% | 約 16.4 秒 |

語助詞一定會多幾個字，沒辦法做到和原稿一樣長；三版都會超過這支試片 13–15 秒的目標一點點。選定之後如果要放回成片，請刪字，不要用加速或壓停頓去趕時間。

## 三版共用的設定

- 音色 Sulafat、`gemini-2.5-flash-preview-tts`、`cmn-TW`、整篇一次生成。
- 旁白設定檔：`{ preset: "ai", gender: "female", pace: [4.5, 5.0], delivery: "chat", scene: "咖啡店裡兩個人並肩坐著，筆電開著，她湊過去看朋友的螢幕，一邊指一邊講" }`，也就是新改寫的 `ai` 預設檔加上聊天版的固定句（`docs/voice-natural.md` 第四節）。
- 念稿版只把 AI 寫成「A I」。
- 三份試聽稿：`videos/sample-ai-ui/voice-natural/light.json`、`mid.json`、`heavy.json`（只給試聽用，不是成片的 script.json）。
- 注意：這三段同時換了稿子和提示。如果想知道「只換提示、稿子不動」有沒有用，要另外多花 1 次請求（指令在最下面，預設不跑）。

## 明天要跑的指令（每版 1 次請求，共 3 次；不要今天跑）

先確認時間與額度（停工線是台灣時間 07:00，照 CLAUDE.md 的規定）：

```bash
cd /home/user/AI-Mp4
TZ=Asia/Taipei date
```

三次請求，一次跑一行，前一行成功再跑下一行；出現 429 就停，不重試：

```bash
NODE_USE_ENV_PROXY=1 node scripts/tts-take.mjs sample-ai-ui --audition=ai-ui-Sulafat-nat-light --script=videos/sample-ai-ui/voice-natural/light.json --out=out/voice-audition-v3
NODE_USE_ENV_PROXY=1 node scripts/tts-take.mjs sample-ai-ui --audition=ai-ui-Sulafat-nat-mid   --script=videos/sample-ai-ui/voice-natural/mid.json   --out=out/voice-audition-v3
NODE_USE_ENV_PROXY=1 node scripts/tts-take.mjs sample-ai-ui --audition=ai-ui-Sulafat-nat-heavy --script=videos/sample-ai-ui/voice-natural/heavy.json --out=out/voice-audition-v3
```

結果：

- `out/voice-audition-v3/ai-ui-Sulafat-nat-light.wav`、`…-mid.wav`、`…-heavy.wav`
- `out/voice-audition-v3/audition.json`（每段實際送出的全文）
- 每次請求會在 `videos/sample-ai-ui/tts-requests.json` 多一筆紀錄；成片的音檔、`script.json`、`timeline.json` 都不會被動到。

對照用的現有錄音（不用重錄）：`out/sample-ai-ui/voice-final.wav`。

（選做，第 4 次請求）稿子不動、只換成聊天版提示：目前沒有準備這份稿，需要時把 `light.json` 複製一份、五句換回原稿即可。

## 試聽時請聽

- [ ] 哪一版最像真人在跟朋友講話？
- [ ] 「欸」念成什麼聲調、會不會太重？「齁」「啦」「喔」有沒有念怪？
- [ ] 重版的「……」會不會停太久？
- [ ] 有沒有哪一版變得刻意、裝可愛？
- [ ] 說明文字（咖啡店、筆電…）有沒有被念出來？
- [ ] 「Google」「A I」念得對不對？台灣口音有沒有跑掉？

## 選定之後要做的事

1. 把選中的版本寫回 `script.json` 的 `narration`／`tts`（字幕要不要帶語助詞另外決定），`voice.profile` 加 `delivery` 與 `scene`。
2. 畫面的 cue 要跟著對。現在成片的 cue 字：s1 問／只打／一句話、s2 回得／很普通、s3 官方指南／好的／四塊、s4 角色／任務／背景／格式、s5 補上去／同一個／回答／更貼近。輕版全部都還在；中版少了「很普通」（變成「那麼普通」）和「同一個」（變成「一樣的」）；重版少了「很普通」「同一個」「更貼近」。選中版或重版要改這幾個 cue 的字。
3. 改稿就要從 TTS 重跑（配音是時鐘），對齊時不要再設 `ALIGN_GAP_MAX=0.3`。

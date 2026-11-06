# 白話國際短影音升級計畫（最終版 v1.0）

> 版本：2026/11/6（台北 16:16 定稿）｜狀態：**等使用者拍板「第 6 節」的事項後才開工**
> 範圍：`/home/user/AI-Mp4`（Remotion 4.0.250 + TypeScript，1080×1920／30fps）
> 依據：草案 v0.1，以及 motion-designer、growth、remotion-eng、editor-audio 四位專家的審查。總編另外核對了程式碼和 research.md，結果記在第 5 節。

## 0. 摘要

- **發現 1｜「卡」主要是時間軸造成的，不是幀率。** 每次換幕都會黑場約 0.3 秒（`Video.tsx` 的 IN/OUT 沒有重疊），加上約 1 秒的人聲空白（`align.mjs:27` 的 `LEAD=0.3/TAIL=0.5`），us-midterm-tech 全片有 21.7% 是靜音。幕內動畫用固定延遲進場，沒有跟配音走，所以 86% 的幀只有微動。
- **發現 2｜最強的素材被埋在後段，沒拿來當鉤子。** mstr 的反轉在第 12 幕，少子化的反轉在第 9 幕。三支片都用問句開頭、重述標題，第 2–3 幕馬上上名詞課。這對完播率的影響，和動畫一樣大。
- **發現 3｜草案的幾條驗收會把方向帶歪。** 全畫面幀差靠漂移效果就能刷過；「出場前 ≤0.5 秒」會吃掉閱讀時間；「第一句 ≤1.5 秒」在中文語速下做不到；Whisper 中文的時間戳達不到 ≤2 幀。另外，鉤子範例有事實錯誤：mstr 賣幣是拿去付**優先股股息**，不是付利息。
- **先做 1｜「時間軸 v2」單一時間來源。** 由 timeline.json 統一給出每幕的 start、重疊量和人聲絕對位置；改用 TransitionSeries 做錯位轉場（鎖定 4.0.250）；字幕和來源列抽成獨立的軌道；停頓依敘事 beat 設定。
- **先做 2、3｜強制對齊＋cue 驅動動畫，以及新的鉤子骨架。** 用 CTC forced alignment 取代 Whisper，元件改由 `cues` 觸發進場；試點 mstr 直接用「新骨架稿＋新引擎」一次做完，不先用舊稿調一輪。量測工具和基準數字當天就收進 repo。

---

## 1. 爆紅知識短影音共通點總表

證據強度：★＝官方或一手資料；☆＝工具商或創作者的經驗談，只當方向參考。我們的驗收一律用**自己量得到的指標**。研究全程沒有登入、也沒有爬 IG／TikTok。標「未讀原文」的來源，這次連不到網域，只根據搜尋摘要。

| 面向 | 結論（已依專家意見修正） | 強度 | 主要來源 |
|---|---|---|---|
| 平台訊號 | IG 最看重觀看時間、按讚率、轉發率（sends per reach），轉發是觸及非追蹤者的關鍵。知識類內容的**收藏**也很重要。 | ★（轉述） | https://www.socialmediatoday.com/news/instagram-shares-algorithm-insights-2025/738034/ （未讀原文）、https://www.dataslayer.ai/blog/instagram-algorithm-2025-complete-guide-for-marketers |
| 原創 | 平台會降權搬運內容，改推原始版本；2026/4 起擴及圖片和輪播。 | ★（媒體報導） | https://www.engadget.com/instagrams-algorithm-overhaul-will-reward-original-content-and-penalize-aggregators-130018977.html 、https://petapixel.com/2026/04/30/new-instagram-policies-target-reposted-content/ |
| 主題 | 反常識、跟生活切身相關、一支只講一件事。 | ☆ | https://www.managertoday.com.tw/articles/view/70654 、https://zackdfilms.recruitee.com/o/3d-generalist/c/new 、https://ir.lib.nycu.edu.tw/bitstream/11536/159941/1/18244.pdf |
| 開頭鉤子 | TikTok 官方：點擊率高的影片，超過 63% 在**前 3 秒**講出核心訊息。畫面和文字本身就是鉤子，靜音也要看得懂。 | ★ | https://ads.tiktok.com/business/en-US/blog/9-creative-tips-to-drive-auction-ad-performance 、https://www.opus.pro/blog/instagram-reels-hook-formulas 、https://dev.to/bulkdl/hook-engineering-the-science-of-the-first-3-seconds-in-short-form-video-2026-2jp9 |
| 敘事 | 鉤子 → 鋪陳 → 揭曉 → 第二個鉤子 → 第二次揭曉；中段再鉤一次，結尾兌現開頭的承諾。 | ☆ | https://subscribr.ai/p/scripting-youtube-shorts-engagement 、https://www.bnext.com.tw/article/76920/youtuber-shorts-audience （未讀原文）、https://www.dcard.tw/f/social_media_editors/p/258634540 |
| 長度 | 15–60 秒完播較高；知識片可到 45–90 秒，但節奏要撐得住。 | ☆（未驗證） | https://www.opus.pro/blog/tiktok-length-format-retention-data 、https://www.bytecap.io/research/youtube-shorts-retention-benchmarks 、https://www.renderforest.com/blog/how-long-should-instagram-reel-be |
| 結尾 | 用具體的提問帶留言，讓內容本身值得轉發。**不要寫「傳給／分享給／標記」**，Meta 會把這種寫法當 engagement bait 降權（editor-audio 指正）。 | ☆ | https://vidiq.com/es/blog/post/double-youtube-watch-time-looping-shorts 、https://creatorsagency.co/blog/youtube-creator-audience-retention-finance-sponsors |
| 排版 | 一個畫面一個主視覺，畫面文字只留關鍵詞（Mayer 重複效應），用箭頭和強調色引導視線（提示原則）；字幕要避開 IG 底部 UI；個人頁網格是 3:4 裁切。 | ★（學術）＋☆ | https://cloud.wikis.utexas.edu/wiki/x/2wJqAw 、https://www.clipspeed.ai/blog/instagram-reels-captions.html 、https://www.kapwing.com/video-editor/instagram-reels/safe-zone |
| 字幕 | 短語逐段亮起、關鍵詞強調；逐字亂跳已經氾濫，教育內容要克制。 | ☆ | https://www.submagic.co/blog/how-to-make-alex-hormozi-captions 、https://joyspace.ai/hormozi-editing-style-2026-analysis |
| 動畫 | 畫面每 2–3 秒要有一次**有資訊的**變化；動作要有 easing、元素錯開；資訊落定後要留閱讀時間；補間方式會影響吸收。 | ★（2024 論文）＋☆ | https://www.grid.uns.ac.rs/symposium/download/2024/89.pdf 、https://clipflip.io/resources/how-to-make-viral-clips 、https://playbooks.com/skills/dylantarre/animation-principles/video-motion-graphics |
| 色調 | 一幕一個主色加一個強調色，顏色有固定意義，風格一致才認得出是你。 | ☆ | https://www.thedataschool.co.uk/johann-shin/visual-storytelling-done-right-5-lessons-from-the-economist |
| 素材 | Vox 式素材：地圖推近、會「畫出來」的圖表、人形格子圖、時間軸，一張圖講一件事。 | ☆ | https://rizzle.com/blog/post/top-10-youtubers-tips-for-making-the-most-of-animated-maps |
| 旁白 | 中文 4–5 字/秒是舒適區；語流要連續、口吻像在聊天，但數字和反轉前要留語意停頓。 | ☆ | https://www.163.com/dy/article/HMSD2JPK055605ZU.html 、https://www.tubefilter.com/2026/01/06/adam-mosseri-instagram-warning-generative-ai-deepfakes/ |
| AI 配音 | 盲測時多數人聽不出是 AI，但知道後信任會下降（「19% 接受」這個數字未驗證，不拿來當依據）。Meta 要求寫實的 AI 內容使用**平台的 AI 標示**。 | ★（規範） | https://help.instagram.com/761121959519495 、https://radioink.com/2026/07/07/radio-listeners-cant-detect-ai-voice-but-dont-trust-it-either/ |
| 聲音設計 | 音效和畫面動作一對一、要克制；BGM 在講話時壓低約 15–25 LU。 | ☆ | https://fish.audio/blog/using-sound-effects-for-short-form-content 、https://www.overseeros.com/blog/background-music-volume-under-voiceover 、https://ffmpeg-cookbook.pages.dev/en/articles/audio-ducking/ |
| 音樂授權 | IG 音樂庫有商業使用的限制，**是否適用要看帳號類型**；我們自混的 BGM 要留授權紀錄。 | ★ | https://help.instagram.com/ipad-app/402084904469945 |
| Hashtag／搜尋 | 2025/12 起每則限 5 個 hashtag；caption 和畫面文字會被索引，第一行要放搜尋關鍵詞。 | ★（報導） | https://www.businesstoday.in/technology/news/story/no-more-hashtag-stuffing-instagram-limits-hashtag-usage-to-just-5-per-reel-and-post-507444-2025-12-19 |
| 可信度／法遵 | FinTok 常過度簡化。我們「中立＋標示未定事項」的做法可以當品牌差異化；台灣金融網紅有自律規範，不推介個股。 | ★（報導） | https://finance.technews.tw/2025/10/12/tiktok-flooded-with-investment-tips-a-financial-blessing-or-a-minefield-for-young-people/ 、https://finance.technews.tw/2024/05/22/influencer-marketing-etf/ |

---

## 2. 差距診斷（摘要，細節保留在草案 §2）

| 類別 | 關鍵證據 | 根因 |
|---|---|---|
| 換幕黑場 | `Video.tsx:15,20-24` 寫的是 IN=10、OUT=9，兩幕沒有重疊；us-midterm 第 144、145 幀只剩背景 | 換幕算法 |
| 人聲空白 | 14 個換幕點各停 0.95–1.01 秒；≥0.3 秒的靜音佔 21.7% | `align.mjs:27` 的 LEAD+TAIL＝0.8 秒，加上切檔留下的頭尾靜音（`tts.mjs:95` silenceremove 保留 0.08／0.12 秒） |
| 響度跳動 | 每段音檔各自 `loudnorm=I=-16:LRA=11`（`tts.mjs:95`） | 逐段做響度標準化（**TTS 本身已經是 BATCH=20 批次合成**） |
| 幕內靜止 | 86% 的幀只有微動；各幕最後一次明顯動作之後靜止 3.3–5.0 秒 | 元件拿不到時間軸，用固定延遲進場 |
| 對齊不準 | 45 幕全部是 `gemini+silence`，字是平均分配的 | 沒有真實的逐字時間戳 |
| 元件 bug | BigNumber、SeatBar 疊了兩次緩動；描線 dasharray 固定 420；打字機固定 45 幀；字幕點亮硬切 | 實作 |
| 版型與色彩 | 每幕三層文字、26–36px 小字；字幕關鍵詞依 index 4 色輪替 | 設計規範不足 |
| 敘事 | 問句鉤子、第 2–3 幕上名詞課、反轉埋在後段、us-midterm 講了 8 個子題、結尾沒有 CTA | 腳本模板 |
| 發布面 | caption 沒有 AI 標示、沒有搜尋首句、hashtag 沒控管、封面沒考慮 3:4 裁切 | 交付流程 |

---

## 3. 最終任務清單

**通用規則**
- 每項都要過 `npm run validate`（0 error）、截圖總覽、ffprobe。
- 每個耗時步驟前先跑 `TZ=Asia/Taipei date`，遵守 07:00 停工線。
- 凡是「對齊誤差 ≤N 幀」的驗收，**前提都是 P0-6（強制對齊）已完成**。
- 對齊方向：**畫面可以比聲音早 0–200ms，不能晚**。
- 所有新規則只對 `styleVersion: 2` 生效；三支舊片保持 v1，可重現。

### P0：下一支影片前完成（對流暢度和完播率影響最大）

| # | 做什麼 | 改哪些檔案 | 驗收標準（可量化） | 工時 |
|---|---|---|---|---|
| P0-1 | **量測工具和基準入庫**（第一天第一件事）：把 an.py、an2.py、an3.py 原樣搬進 repo，寫 README 說明遮罩座標、門檻和算法；包成 `npm run audit <slug>`。輸出兩層指標：①事件層，讀 timeline 的 cue 清單，算 beat 間距、尾段 hold；②像素層，只算結構變化，用 `AUDIT=1` 關掉 ambient 動作，排除字幕區，並遮掉 float／dashFlow 區域。其他指標：黑場幀、雙重曝光幀、每幀最大位移、人聲 stem 的靜音段、ms/幀 | 新增 `scripts/audit/`、`package.json`、`videos/<slug>/baseline-motion.json`（只放 JSON） | 在 us-midterm-tech 上重現 86%（±2%）和 21.7%（±2%）；三支片的 baseline 已 commit；bench 記錄 ms/幀 | 4h |
| P0-2 | **時間軸 v2（單一時間來源）**：align.mjs 產出 timeline.json，每幕寫好 `startFrame`、`durationFrames`、`transitionFrames`、`voiceStartFrame`、`voiceEndFrame`、`stillFrame`；`timing.ts`、`lib.mjs`、`still.mjs`、audit 都只讀這份，不再各自計算。`<Audio>` 移到最外層，依絕對幀擺放。限制條件：轉場秒數 ≤ 上一幕 TAIL＋下一幕 LEAD＋殘留靜音 − 0.08 秒 | `scripts/align.mjs`、`scripts/lib.mjs`、`scripts/still.mjs`、`src/timing.ts`、`src/Video.tsx`、`src/types.ts`、`scripts/validate.mjs` | still 階段就能檢查：`durationInFrames` ＝ timeline 最後一幕的 end ＝ ffprobe 幀數；validate 檢查相鄰兩幕人聲區間重疊時報 error；人聲間隔 ≥0.08 秒 | 6h |
| P0-3 | **錯位轉場＋獨立字幕軌**：改用 `@remotion/transitions@4.0.250`（`--save-exact`），所有 `@remotion/*` 和 remotion 一起鎖成同一個確切版本；先只做 fade 和 slide 兩種，8–10 幀。出場在 0–5 幀快速淡出加位移，進場在 3–8 幀才淡入。Subtitle 和 SourceFooter 抽成全片層，跟絕對時間軸走，換句做 3–4 幀的交叉淡化。一般位移每幀 ≤24px | `package.json`、`src/Video.tsx`、`src/components/Subtitle.tsx`、`SourceFooter.tsx` | audit：內容覆蓋率 <15% 的幀 ≤2 幀／次換幕；同一區域兩幕各 >40% 不透明度的幀 ＝0；任何一幀最多一組中文字幕；每幀最大位移 ≤24px | 6h |
| P0-4 | **停頓依 beat 設定＋人聲軌整合**：LEAD 和 TAIL 由 P0-2 的限制條件反推，預設換幕間隔約 0.15 秒；script.json 每幕可加 `pauseAfter`（hook 後 0.25 秒；twist 前、payoff 後 0.5 秒），validate 限制每支 ≤3 處、每處 ≤0.7 秒。切檔後去掉頭尾靜音，各保留 30–50ms，字時間要跟著扣掉位移。每段不再各做 loudnorm，改成整條人聲軌做一次兩段式 loudnorm，輸出 `voice.wav` stem。**不花 TTS 額度**（`--resplit`） | `scripts/align.mjs`、`scripts/tts.mjs`（切檔和 loudnorm）、`src/Video.tsx`、`scripts/validate.mjs` | 用人聲 stem 跑 silencedetect −40dB：非預期換幕停頓 ≤0.3 秒；標了 pauseAfter 的照設定值 ±0.05 秒；片頭靜音 ≤0.05 秒；靜音總占比 8–12%；相鄰兩幕短期響度差 ≤2 LU | 5h |
| P0-5 | **讀音審聽定稿**：先審 CER >20% 的幕，修 pronunciation.md，統一 MSTR、mNAV、STRC、數字的唸法；音檔定稿之後才做對齊和綁 cue | `videos/<slug>/tts-check.md`、`pronunciation.md`、CLAUDE.md 檢查清單 | 每個高 CER 幕都有「已聽／原因（聽寫誤差或真錯）／處置」三欄 | 每支 1h |
| P0-6 | **CTC 強制對齊**：首選 ctc-forced-aligner，或 torchaudio 的 MMS_FA，輸入念稿版 tts 文字；再用 LCS 把念稿字映射回字幕字（「百分之三十五」對「35%」，這一步不需要網路，先做）。Whisper 降為備案，均分當最後退路 | `scripts/align.mjs`、新增 `scripts/fa.py`、CLAUDE.md 流程 | provider 不能是 `gemini+silence`；抽 10 個關鍵詞，跟 onset／頻譜手標起點比對，誤差中位數 ≤50ms、最大 ≤100ms | 8h（不含等網域放行） |
| P0-7 | **motion token＋元件節奏修正**：anim.ts 定義 duration {xs4, s8, m12, l18} 幀；easing 分 enter、exit、move 三種；spring 只留兩組（ui 無過衝、accent 過衝 ≤3%）；出場時長＝進場的 60–70%；錯開間隔 3–4 幀。新增 `countUp(frame,start,end,landAt)`，用 `Easing.out(Easing.quad)`。描線改用 `pathLength=1`，畫完保留虛線設定；字幕點亮做 3 幀漸變。禁用 Math.random、Date.now | `src/components/anim.ts`、`BigNumber.tsx`、`SeatBar.tsx`、`Icons.tsx`、`Subtitle.tsx`、`validate.mjs`（grep 檢查） | 函式單元檢查：countUp 的 p(0.25)∈[0.4,0.6]、p(landAt)=1；所有圖示描線起點一致；元件裡沒有字面的 spring／interpolate 參數；同一幀用 renderStill 和 renderMedia 輸出相同 | 4h |
| P0-8 | **cue 驅動進場（A3 縮小版）**：script.json 每幕新增 `cues:[{id,text,occurrence?}]`，跟 keywords 分開；align 輸出 `cueFrames`；元件的 item 用 `at:"cueId"` 引用，進場時間＝cue − 4 幀；沒有 `at` 就退回現在的固定延遲。先做 IconGrid、FlowRow、ImpactCard、BigNumber、SeatBar；TermCard 的打字機改用定義句的起訖時間做線性插值 | `src/Video.tsx`、`src/types.ts`、上述元件、`scripts/align.mjs`、`validate.mjs` | 有 `at` 的元素，進場和 cue 的誤差在 −6 到 0 幀之間（畫面先到）；validate 檢查 `at` 引用：0 error | 12h |
| P0-9 | **beat 編舞＋閱讀保護**：念到 cue 時對對應元素做 `focus`（其他項目降到 0.35 透明度），可選 `punch`（8 幀內到 1.05，之後固定倍率）。float 和 dashFlow **只用在圖示和裝飾層**；文字節點不做連續縮放，位移取整數 px。Ken Burns 拿掉 | `anim.ts`、各元件、`src/Video.tsx` | 事件層：每幕 ≥2 個 beat，相鄰 beat 間隔 ≤2.5 秒；最後一個 beat 到出場 0.6–1.2 秒；數字或關鍵詞落定後靜止 ≥0.8 秒。像素層（AUDIT=1）：靜止段文字區相鄰幀差 ≤0.2% | 8h |
| P0-10 | **鉤子＋敘事骨架＋片長**：①`HookTitle`：第 0 幀就是完整構圖（≤10 字主張＋數字，≥120px），第 1–4 幀做一次整體 punch，關鍵數字依 cue 做 slam。②骨架：每幕加 `beat: hook｜you｜mechanism｜twist｜payoff｜cta`。③鉤子用直述句；validate 規則：鉤子裡每個數字都要附 `claim` 欄位，指向 research.md 的那一列；第一句以「？」結尾就給警告。④第 2–3 幕不能是 TermCard | 新增 `src/components/HookTitle.tsx`、`script.json`、CLAUDE.md（鉤子規則、骨架、幕長例外）、`validate.mjs` | frame 0 截圖可讀；**第一個關鍵詞或數字在 1.5 秒內出聲，核心衝突在 3.0 秒內講完**；hook 幕 3–5 秒；hook、you、twist、cta 各至少 1 幕，twist 落在 40–70% 的位置；鉤子數字 100% 有 claim | 5h＋每支 1h |
| P0-11 | **合規與 AI 揭露**：①caption 加「旁白為 AI 合成語音，內容經人工查證」；②上傳時開啟平台的 AI 標示，截圖存到 `publish.md`；③片尾卡加小字「AI 配音｜人工查證」；④談個股或加密貨幣的片，畫面要有 ≥1.5 秒「本片僅為知識說明，不構成投資建議」；⑤validate 禁用詞：分享給、傳給、標記、買進、賣出、目標價；CTA 不出現股票代號 | `caption.md` 模板、`EndCard.tsx`、新增 `videos/<slug>/publish.md`、`validate.mjs`、CLAUDE.md | 三項揭露都有證據；禁用詞 0 命中 | 2h |
| P0-12 | **審片產物＋上線量測表**：`npm run motionsheet <slug>`：每幕每 0.25 秒抽一幀拼成 filmstrip，轉場前後 ±10 幀逐幀拼一張，另外輸出 50% 速度的低解析 preview。`videos/<slug>/metrics.md` 記錄上線後 24h、72h、7d 的觀看數、非追蹤者比例、3 秒留存／略過率、平均觀看時長與比例、轉發／觸及、收藏、留言 | 新增 `scripts/motionsheet.mjs`、`metrics.md` 模板 | 每個里程碑交付時同時附「motion.json 前後對照＋filmstrip」；上線後 72h 的欄位都填齊 | 3h |

**P0 小計：約 64h，相當於 9–11 個工作天（每天約 6h，含 07:00 停工線和人工審聽緩衝 20%）。** 草案寫 45h 和「1.5–2 天」是低估。

### P1：試點上線後的第一波

| # | 做什麼 | 改哪些檔案 | 驗收標準 | 工時 |
|---|---|---|---|---|
| P1-1 | **統一後製混音**：Remotion 只輸出畫面加參考人聲；新增 `mix.mjs`，用 adelay+amix 疊人聲、音效、BGM，sidechaincompress 做 ducking，兩段式 loudnorm，最後 `-c:v copy` 合成 | 新增 `scripts/mix.mjs`、`render.mjs`、script.json 頂層 `audio:{}` | 量最終 MP4 解碼後的音訊：−14±1 LUFS、TP ≤−1.5 dBTP、LRA ≤8 LU；講話段 BGM 比人聲低 ≥15 LU；AAC ≥256kbps、48kHz；改音效不需重 render 畫面 | 6h |
| P1-2 | **克制的音效層**：ffmpeg 合成 whoosh、pop、impact、chime，記錄 `peakOffsetMs`。密度平均 ≤1 個/3 秒；whoosh 只用在章節切換（hook→you、twist、cta）；不加打字聲；音量一律相對人聲（pop 低 18 LU，峰值 ≤ 人聲峰值 −8dB）；音效 EQ 避開 2–4kHz。政治片只留換章節和片尾兩種音效 | 新增 `scripts/make-sfx.mjs`、`public/sfx/`、`LICENSES.md` | whoosh 峰值落在事件幀 −2～0 幀，pop／slam 在 0～+1 幀；密度符合上限 | 4h |
| P1-3 | **BGM**：首選使用者提供、授權明確涵蓋商業使用的曲目（保存授權證明）；自己合成只當政治題材的中性底噪 | `LICENSES.md`、`validate.mjs` | 循環點沒有爆音；測試帳號上傳後沒有跳版權提示；每個檔案都有授權紀錄 | 2h |
| P1-4 | **字幕短語模式＋版面格線**：A9a：theme.ts 新增 CONTENT_TOP、CONTENT_H、SUB_BOTTOM 常數，所有元件改讀常數，validate 改寫字幕規則（3h）。A9b：字幕 72–80px、每段 4–8 字，底緣 y ≤1470，避開右側 120px；各元件在新格線下重排（10h）。關鍵詞顏色改讀該幕的 accent；英文跟著中文的「句」顯示，每段 ≤42 字元 | `theme.ts`、`Subtitle.tsx`、各元件、CLAUDE.md（**需要拍板**） | 截圖：字幕框 y ≤1470、x 在 64–960 之間；短語出現時間誤差 −6 到 0 幀；關鍵詞不拆行 | 13h |
| P1-5 | **色彩紀律**：一幕最多 1 個主色加 1 個強調色，語意固定（青＝事實、粉＝風險、黃＝數字、紫＝背景輔助）；validate 合併計算字幕和元件的實際用色 | `theme.ts`、各元件、`Subtitle.tsx`、`validate.mjs` | 試點 0 警告 | 3h |
| P1-6 | **資訊密度瘦身**：CompareSplit 每側最多 2 條；ImpactCard 一次只放大一列；卡片內文字 ≥40px；畫面文字（不含字幕）≤25 字；每個含數字的幕角落放小字來源（≥24px、60% 透明度）；Header 顯示「資料截至 YYYY/M/D」 | `CompareSplit.tsx`、`ImpactCard.tsx`、`SourceFooter.tsx`、`Header.tsx`、`validate.mjs` | validate 限制 v2 稿：超過上限報 error | 4h |
| P1-7 | **數據素材**：`LineChart`（線頭帶發光點、可標事件點）、`WaffleGrid`（10×10 抽象符號），時間對齊 cue | 新增兩個元件 | 到達事件點的時間誤差 −6 到 0 幀；數據和 research.md 一致 | 8h |
| P1-8 | **版型輪替**：HookTitle／BigNumber、圖表類、卡片類輪流出現 | `validate.mjs` | 同一種版型不能連續超過 2 幕 | 1h |
| P1-9 | **CTA 幕＋caption 模板**：EndCard 前加一幕 3–4 秒的討論題（例如「你覺得公司該不該賣幣補股息？」）加集數「國際白話講 #N」；caption 第一行 ≤40 字、含主關鍵詞，接著是三點摘要、提問、AI 與投資聲明、來源；hashtag 3–5 個 | `EndCard.tsx`、`caption.md` 模板、`validate.mjs` | 每支都有 cta 幕；hashtag ≤5；caption 最後一段含「？」 | 2h |
| P1-10 | **封面與網格**：still 多輸出一張 1080×1440 的裁切預覽；封面 ≤10 字、≥120px，集數徽章固定位置 | `scripts/still.mjs` | 主標題在 3:4 區域內，也在 1080×1080 內 | 1.5h |
| P1-11 | **輸出畫質**：render.mjs 設 `imageFormat:'png'`（或 jpegQuality 95）、`crf:17`；base.png 加 1–2% 固定 seed 顆粒做抖色 | `scripts/render.mjs`、Background 預渲染 | 位元率 ≥8 Mbps；用 ffmpeg 模擬 3.5Mbps 二次轉碼後，暗部沒有明顯色帶；ms/幀 ≤ 基準 1.3 倍 | 1.5h |
| P1-12 | **Trial Reels 鉤子 A/B**：`hookVariants` 只重跑第 1 幕的 TTS，後面的幕共用 | `script.json`、`render.mjs --variant` | 能輸出 2 個只有開頭不同的 MP4；72h 後記錄 3 秒留存和略過率的差異 | 3h |
| P1-13 | **styleVersion 與回歸檢查**：v1 保持現狀，audit 加回歸模式 | 各元件、`validate.mjs`、`scripts/audit/` | 三支舊片的 v1 still 像素完全相同 | 2h |
| P1-14 | **局部動態模糊**：只在 slide 轉場和 slam 的幾幀內，加 2–3 幀殘影或方向性 blur | `anim.ts`、`Video.tsx` | 大位移段肉眼看不到 strobing（filmstrip 審查）；ms/幀 ≤ 基準 1.3 倍 | 3h |
| P1-15 | **發片 SOP 與產能**：固定時段實測（12:00–13:00 和 21:00–23:00）；置頂留言放提問；前 60 分鐘回覆留言；更正置頂；同步發到 Shorts 和 TikTok（自己渲染、無浮水印）；訂每週目標支數 | CLAUDE.md、`publish.md` 模板 | 每支 publish.md 都有發片時間和互動紀錄 | 1h |
| P1-16 | **選題評分卡**：切身度、反常識、能否一句話講完、搜尋熱度、時效，各 1–5 分，≥18 分才做 | CLAUDE.md、`videos/<slug>/research.md` 模板 | 每支都有評分紀錄 | 1h |
| P1-17 | **一支只留一條主線**：每支子題 ≤3 個（us-midterm-tech 要不要拆，待拍板） | `videos/` | validate 檢查 mechanism 幕 ≤3 個子題 | 每支 4–6h |

**P1 小計：約 56h。**

### P2：之後再做

| # | 做什麼 | 改哪些檔案 | 驗收標準 | 工時 |
|---|---|---|---|---|
| P2-1 | 轉場種類輪替加 `match`、`zoomThrough`（只用在章節切換） | `Video.tsx` | 同一種轉場不連續超過 3 次 | 3h |
| P2-2 | 每個元件第 2 種進場編舞 | 各元件 | 連續兩幕不用同一種「元件＋編舞」組合 | 4h |
| P2-3 | 推鏡到重點卡：元件導出純函式 `layout(props)` 提供 bbox，先做 IconGrid、FlowRow、ImpactCard | 這三個元件、`Video.tsx` | 8–12 幀到位後固定；文字不閃爍（靜止段幀差 ≤0.2%） | 8h |
| P2-4 | `MapFocus`（使用 Natural Earth 公有領域資料）、`Timeline` 元件 | 新元件、`src/assets/maps/`、`LICENSES.md` | 推近期間沒有跳格；節點出現時間誤差 −6 到 0 幀；授權有紀錄 | 10h |
| P2-5 | 語氣演出試驗：用 `--only=hook,twist` 單獨合成，不覆蓋正式的 manifest；切檔後長度比的離群值超過 ±35% 報 error | `tts.mjs`、`voice.md` | 指示文字被念出的次數 ＝0；使用者盲聽 A/B 選出偏好版本 | 4h |
| P2-6 | 可信度品牌句「只講查得到的」，搭配標籤的印章式 slam | `ImpactCard.tsx`、腳本模板 | 每支至少出現 1 次 | 1h |
| P2-7 | 英文術語表 `glossary.md`，交付清單加英文字幕人工審閱 | 新增檔案、CLAUDE.md | 每支都有審閱紀錄 | 1h |
| P2-8 | validate 依 cue 自動提議 `at`，減少手寫 | `validate.mjs` | 試點有 ≥60% 的 `at` 由提議產生 | 3h |
| — | **不做**：全片 60fps 和全片動態模糊 | — | — | 0 |

**另外每支新片都有編排成本：** 寫 cues 和 at、beat 編舞約 3–4h，加上 3 輪局部 render（frameRange 加 scale 0.5；整片 render 只在里程碑做）。

### 里程碑（只用 mstr 試點，新稿和新引擎一次做到位）

1. **M0（第 1 天，半天）**：P0-1 入庫；把第 6 節的拍板事項 1、2、3 交給使用者。
2. **M1 純引擎（約 4 天）**：P0-2 → P0-3 → P0-7 → P0-4（用現有音檔 `--resplit` 驗證，不花額度）。交付：舊稿 mstr 的 motion.json 前後對照和 filmstrip。
3. **M2 新稿（2–3 天，受每天 TTS 額度限制）**：P0-10 重寫 mstr，加上 P0-11 → 一次 TTS → P0-5 審聽定稿 → P0-6 強制對齊。
4. **M3 綁動畫（約 3 天）**：P0-8 → P0-9 → P0-12 → 整片 render。交付總覽圖、MP4、motion.json、filmstrip，上線後填 metrics.md。
5. **M4（P1）**：依試點 72h 的數據排優先順序，先做 P1-1、P1-2、P1-4、P1-12。

---

## 4. 專家意見

### 4.1 採納

| 來源 | 意見 | 落在哪裡 |
|---|---|---|
| motion、eng | 重疊 8 幀和 C1 的數字互相衝突，人聲會撞在一起。改成用絕對時間軸排音軌，並加上「人聲不得重疊」的 validate 規則 | P0-2 |
| motion、eng | A1 和 A7 合併，一次用 TransitionSeries 做對；`@remotion/*` 全部鎖成確切版本（現在 package.json 是 `^4.0.250`，總編已核實） | P0-3 |
| eng | 幕長算法從「三處一致」改成「單一來源 timeline.json」；stillFrame 由 timeline 給出 | P0-2 |
| motion、eng | 用錯位轉場取代 crossfade，避免雙重曝光；Subtitle 和 SourceFooter 抽成獨立軌道（Header 本來就在 Sequence 外面） | P0-3 |
| 全部四位 | A5 的全畫面幀差驗收會被刷分。改成事件層加上關掉 ambient 層後的像素層 | P0-1、P0-9 |
| 全部四位 | 「出場前 ≤0.5 秒」改成 0.6–1.2 秒的 hold；落定後靜止 ≥0.8 秒 | P0-9 |
| motion | 統一的 motion token；出場時長是進場的 60–70% | P0-7 |
| motion、eng | 連續縮放文字會閃爍：float 只用在裝飾層，推鏡快速到位後固定，位移取整數 px | P0-9、P2-3 |
| 全部四位 | C2 改用 CTC 強制對齊；驗收改成 onset 比對，誤差中位數 ≤50ms、最大 ≤100ms | P0-6 |
| eng、audio | 畫面可以比聲音早，不能晚；對齊容許範圍統一成 −6 到 0 幀 | 通用規則 |
| motion、growth、audio | 所有「對齊 ≤N 幀」的驗收都排在對齊完成之後；試點不先用舊稿綁 at | 里程碑 |
| growth、audio | 「第一句 ≤1.5 秒」拆成兩條：視覺鉤子（第 0 幀）和聽覺鉤子（1.5 秒內念到關鍵詞，3 秒內講完衝突） | P0-10 |
| eng | A2 只改 tIn 沒用：HookTitle 第 0 幀就必須是完整的落定狀態 | P0-10 |
| eng | A6 的驗收數學上矛盾：改用 `Easing.out(quad)` 加 `countUp`，用函式取樣驗收 | P0-7 |
| eng、audio | 停頓的另一部分來源是切檔殘留的靜音和逐段 loudnorm：改成整條人聲軌做一次兩段式 loudnorm，再去頭尾靜音 | P0-4 |
| motion、audio | 停頓依 beat 設定（`pauseAfter`），靜音目標 8–12%；量測用人聲 stem | P0-4 |
| audio | 讀音審聽升到 P0，排在對齊之前 | P0-5 |
| eng、audio、growth | 鉤子範例的事實錯誤：股息不是利息；「地方」和「限制或否決」不能拿掉；鉤子數字要有 claim 欄位 | P0-10、第 5 節 |
| audio、growth | CTA 不寫「傳給／分享給」，不點名個股；片中要有投資聲明；validate 禁用詞清單 | P0-11、P1-9 |
| eng、audio | AI 標示要用平台功能，再加片尾小字，並截圖存證 | P0-11 |
| growth、eng、audio | 量測腳本當天就收進 repo，baseline 要 commit | P0-1 |
| growth | 上線成效量測表和回饋迴路 | P0-12 |
| motion | 需要能審流暢度的 filmstrip 和慢速預覽 | P0-12 |
| eng | 統一後製混音（mix.mjs），loudnorm 做兩段式 | P1-1 |
| motion、audio | 音效依 peakOffset 對齊；降低密度、不加打字聲；音量用相對人聲的基準 | P1-2 |
| eng、audio | BGM 首選有授權的曲目，不靠自己合成 | P1-3 |
| eng | A9 拆成格線常數和元件重排，工時改成 13h | P1-4 |
| motion | 字幕關鍵詞顏色納入色彩紀律 | P1-4、P1-5 |
| eng | 用 png 中間幀加抖色治色帶，用模擬二次轉碼驗收 | P1-11 |
| eng | styleVersion 加回歸檢查 | P1-13 |
| motion、eng | 大位移段做局部動態模糊或殘影，並量每幀最大位移 | P1-14、P0-3 |
| growth、audio | 封面考慮 3:4 網格；caption 首句放搜尋關鍵詞；hashtag ≤5 | P1-9、P1-10 |
| growth | Trial Reels 升到 P1；發片 SOP；選題評分卡；收藏也是平台訊號 | P1-12、P1-15、P1-16、總表 |
| growth | A7、A8 的花式轉場降級，工時移給數據圖表 | P1-7、P2-1、P2-2 |
| audio | 片內顯示日期戳，含數字的幕都要有角落來源 | P1-6 |
| eng | render 成本預算（ms/幀 ≤ 基準 1.3 倍），迭代時用局部 render | P0-1、通用規則 |
| eng | 禁用 Math.random、Date.now；用 renderStill 對 renderMedia 做一致性驗收 | P0-7 |
| eng | cues 和 keywords 分開，支援 occurrence；A3 工時改成 12h | P0-8 |
| 全部四位 | 工時重估、加 20% 人工審聽緩衝 | 第 3 節小計 |

### 4.2 不採納或部分採納

| 來源 | 意見 | 處理 | 理由 |
|---|---|---|---|
| editor-audio | C0「改成多幕合併 TTS，取代逐幕 TTS」 | **部分採納** | 總編核對過：`tts.mjs:27` 已經是 `BATCH=20`，整支片一次合成，所以「逐幕分別 TTS 導致語調重置」這個前提不成立。只採納其中「整條人聲軌做一次 loudnorm」的部分（P0-4）。 |
| editor-audio | hook 幕 3–5 秒，要修改 CLAUDE.md 的幕長下限 | 採納，**列入拍板** | 這會改到既有規範，需要使用者同意。 |
| growth | 鉤子驗收加「3 人關聲音看完，說出重點正確率 ≥80%」 | 不列為硬性驗收 | 沒有固定的受測者，無法每支片重複做。改成上線後用 3 秒留存和略過率校正；有人力時可以當選配。 |
| growth | 「快版」模板：30–45 秒、≤4 小時從立項到 MP4 | 暫不做 | 時事要求「上網查證、區分已確定／未定」，4 小時目標和查證品質會衝突。等 P0 穩定、產能數據出來再評估。 |
| growth | 英文副字幕可關閉或 A/B | 列入拍板，不主動移除 | CLAUDE.md 規定要有英文副字幕，屬於頻道定位，由使用者決定。 |
| growth | IG App 內音樂可能帶來探索流量，不要直接放棄 | 列入拍板 | 要先確認帳號類型（創作者還是商業）；渲染時就混好 BGM 仍是預設，因為片子要同步發到 Shorts 和 TikTok。 |
| eng | 萬一片長不改，C1 用 LEAD 0.15／TAIL 0.25 折衷 | 保留為備案 | 預設走 P0-2 的反推公式；使用者不同意改片長時，用補 CTA 幕和 pauseAfter 補足，不靠拉長空白。 |
| motion | `layout(props)` bbox 介面放在 P1 | 降到 P2-3 | 推鏡對流暢度的貢獻小於 focus 加 cue；先把 P0 做穩。 |
| motion | 用 eslint 檢查 token | 改成 validate 用 grep | 專案沒有 eslint，不為此新增工具鏈。 |
| growth | 「三支舊片先當對照組上線」 | 不由我們執行 | 上線是使用者的操作，列入拍板第 6 項。 |
| 草案 | 「每 1.5–2.5 秒一次畫面變化」、「beat ≥0.5 次/秒」 | 刪除 | 用 beat 間隔 ≤2.5 秒、每幕 ≥2 個 beat 取代，避免為動而動。 |
| 草案 | B1 鉤子範例原句 | 刪除 | 有事實錯誤和誇大，改成第 5 節的版本。 |

---

## 5. 總編核實紀錄

- `videos/mstr-bitcoin/research.md:96`：賣出約 4.318 億美元比特幣，「用於支付部分**優先股股息**與回購 STRC」，標示【已確定】。草案寫「付利息」是錯的。
- `videos/us-midterm-tech-2026/research.md:185`：「10 州共 41 項**地方**資料中心公投案，選民在 40 案選擇**限制或否決**開發」（CNBC 引 Ballotpedia；Reuters 11/5）。
- 修正後的鉤子候選，數字仍需在 P0-10 用 claim 欄位逐一綁定：
  - 「說過永不賣幣的公司，今年賣了四億多美元比特幣付股息。」
  - 「41 個地方資料中心公投，40 個投給限制或否決。」
  - 少子化：用 research.md 的非婚生占比改寫成講數據的句子，不寫個人層級的斷言。
- `scripts/tts.mjs:27` 是 `BATCH=20`；`:95` 每段做 silenceremove 加 `loudnorm=I=-16:LRA=11`。
- `scripts/align.mjs:27` 是 `LEAD=0.3, TAIL=0.5, TAIL_END=1.2`。
- `package.json` 的 `@remotion/*` 和 remotion 都是 `^4.0.250`，需要改成確切版本。

---

## 6. 需要使用者決定或提供的事

1. **片長規範（阻斷 M1）**：要不要把 CLAUDE.md 的總長 70–100 秒改成 45–75 秒？依 remotion-eng 的估算，mstr 套用新停頓和重疊之後約 69.5 秒，會低於現行下限。另外，hook／cta 幕可不可以短到 3 秒（現行規範是每幕 5–10 秒）？
2. **對齊工具的網路放行（阻斷 P0-6）**：ctc-forced-aligner 或 MMS_FA 的模型權重要從 huggingface.co 或 download.pytorch.org 下載。可以放行嗎？備案是把 OpenAI 金鑰設成 api.openai.com 的網路秘密，走 Whisper。
3. **Gemini 計費**：免費額度是每個模型每天約 10 次。M2 重寫 mstr 和之後的 Trial Reels 變體都要重跑 TTS。要不要開計費？不開的話，每支新稿至少要跨 1–2 天。
4. **AI 配音標示**：是否接受三處揭露：caption 一行、上傳時勾選平台 AI 標示、片尾小字「AI 配音｜人工查證」？
5. **字幕與安全區**：字幕要不要從 64px、每行 ≤14 字，改成 72–80px 短語模式，並上移到底緣 y ≤1470？這等於下方安全區從 220px 加大到約 450px。英文副字幕要保留、縮小，還是 A/B 測試？
6. **BGM 授權來源**：要提供有商業授權的音樂庫或曲目（請一併提供授權證明），還是只用自己合成的中性底噪？要不要放行 pixabay、mixkit？另外，IG 帳號是創作者還是商業帳號？這會決定 App 內音樂能不能用。
7. **舊片處理**：三支舊片保持 v1、照原樣上線當對照組嗎？還是等 mstr 試點的 72h 數據出來，再決定另外兩支要不要重做？
8. **系列化**：us-midterm-tech 要不要拆成上下集或系列（P1-17）？集數要從 #1 重新編號嗎？
9. **上線數據**：可以在每支上線後 24h、72h、7d，提供 IG Insights 的數字（或截圖）讓我們填 metrics.md 嗎？
10. **發片產能目標**：每週要發幾支？這會影響要不要做 P2 的自動化項目。

---

## 7. 不做的事（維持）

- 不爬 IG／TikTok：不抓 GraphQL、不偽造 header、不繞過登入。
- 不用真實人物肖像，也不模仿真人聲音。
- 不用未授權素材；每個音效、BGM、地圖資料都記到 `LICENSES.md`。
- 不搬運或改剪別人的影片。
- 不給投資建議，CTA 不點名個股。
- 政治題材不用情緒化的音樂和音效。
- 不用標題黨鉤子；鉤子裡每個數字都必須在 research.md 有來源。
- 全片不做 60fps 和動態模糊（只在轉場局部處理）。

## 相關檔案

- 程式：`/home/user/AI-Mp4/src/Video.tsx`、`/home/user/AI-Mp4/src/timing.ts`、`/home/user/AI-Mp4/src/components/anim.ts`、`/home/user/AI-Mp4/src/components/Subtitle.tsx`、`/home/user/AI-Mp4/src/components/BigNumber.tsx`、`/home/user/AI-Mp4/src/components/SeatBar.tsx`、`/home/user/AI-Mp4/src/components/Icons.tsx`、`/home/user/AI-Mp4/src/components/TermCard.tsx`
- 腳本：`/home/user/AI-Mp4/scripts/align.mjs`、`/home/user/AI-Mp4/scripts/tts.mjs`、`/home/user/AI-Mp4/scripts/render.mjs`、`/home/user/AI-Mp4/scripts/lib.mjs`、`/home/user/AI-Mp4/scripts/still.mjs`、`/home/user/AI-Mp4/scripts/validate.mjs`、`/home/user/AI-Mp4/package.json`
- 研究資料：`/home/user/AI-Mp4/videos/mstr-bitcoin/research.md`、`/home/user/AI-Mp4/videos/us-midterm-tech-2026/research.md`
- 量測腳本（待入庫）：`/tmp/claude-0/-home-user/afb8d066-6931-561b-9e7e-f3557dd82fd7/scratchpad/audit/`

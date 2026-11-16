# CaffAIne 畫面多樣化規劃（2026/11/16）

Andy 原話：「AI 頻道為何都是同一個畫面背景，需要更豐富點，先規劃好內容，再依據內容去生成對應素材及動畫效果、移動、排版、色調等等，再依據旁白放上對應時間點」。
範圍：`caffaine-made-by-ai`、`two-answers`、`same-look`、`sketch-game` 四支。念稿一字不改，cue 沿用各片 script.json。

## 0. 診斷與原則
- 現況：每鏡都是同一張等距桌面（`IsoMeeting.tsx`）加上方卡片加下方字幕，只換卡片內容，所以四支看起來是同一支。
- 參考其他頻道的做法：科技（`tech-2nm`）每段換一種 HUD 構圖與 overlay；哩股（`liguligu-*`）靠撕紙、蓋章、換紙材切段；談晴（`talk-ep01`、`docs/channels/tanqing-shuoai.md`）靠線稿圖表與大字。共通點是「畫面類型跟內容走，不是跟頻道走」。
- 原則：一鏡一種畫面類型；同類型不連續超過 2 鏡；每支至少 6 種；等距桌面（T1）每支最多 2 鏡，只放片尾（再加至多一鏡開場）；一律 2D（SVG＋CSS 2D 矩陣），不用 three.js。
- 固定不動（CaffAIne 識別）：LOGO 左上、主色長春花藍 `THEME_ISO.color.primary`、下方字幕與「查證截至」、狀態標籤（已確定／分析預期／尚未確定）、片尾卡 `caffend`、版面不重疊檢查。
- 色調依段落換（底色皆取自 `THEME_ISO.color.*.soft`，主字色不變）：

| 段落 | 底色 | 重點色 | 用在 |
|---|---|---|---|
| 事件／開場 | 淡天藍 `#EEF3FF` 到淡紫 `#F8F3FF` | primary `#5566F0` | 鉤子、做了什麼 |
| 原理／機制 | 薄荷 right.soft `#D8F4EB` | right `#19A88A` | 為什麼、怎麼運作 |
| 翻車／問題 | 珊瑚淡 wrong.soft `#FFE3DB` | wrong `#FF7A5C` | 錯在哪、被退件 |
| 解法／做法 | 淡天藍加青綠點 sky.soft `#DCEFFC` | sky `#2F9BE0`、right | 怎麼修、三步 |
| 未知／限制 | 灰紫 `#ECE7F3` | plum `#C290E0`、note | 還不知道 |
| 領取／結尾 | 暖黃 note.soft `#FFF2C6` | note `#FFD766` | 留言關鍵字、片尾 |

## 1. 畫面類型庫（12 種）
每種都有自己的背景紋理（不是只換色）：T3 瀏覽器＝淺灰桌布＋視窗陰影；T4＝深藍灰編輯器底（唯一深色段，配 `THEME_ISO.ink` 系）；T5＝對話軟體米白底加泡泡；其餘為淡色底加不同圓點／斜線／方格紋。

| 代號 | 類型 | 版面 | 主要素材 | 動作（進場／移動／強調） | 適合內容 |
|---|---|---|---|---|---|
| T1 | 等距桌面 | 現有 IsoMeeting，卡片在上、字幕在下 | 桌面、螢幕、新聞紙 | 卡片飛入轉正、鏡頭 look 微移 | 只給片尾前後與一鏡開場，每支 ≤2 鏡 |
| T2 | 大字動態 | 滿版單一大字或數字（≥120px），角落放小圖示 | KineticText：翻牌、count、環形、sparkline | 第 0 幀就有字；cue 時數字翻牌或換字，字落下回彈 | 鉤子、數字、轉折、「還不知道」 |
| T3 | 瀏覽器視窗 | 滿版瀏覽器框（網址列、三圓點），內容撐滿主視覺區 | 真實截圖 png 或 HTML 截圖 | 先全景、cue 推近到某區塊、緩慢捲動、圈選框畫出 | 網頁成品、遊戲畫面、實測結果 |
| T4 | 程式編輯器 | 深色編輯器視窗，左行號、右捲軸、底部狀態列 | repo 真實程式或 json 片段 | 逐行打字、行號跑到總行數、游標閃、高亮行 | 腳本檔、提示詞、程式行數 |
| T5 | 對話輸入 | 對話軟體樣式，下方輸入框，上方泡泡 | 使用者交代的原話（念稿同句）、附件縮圖 | 輸入框打字、按送出、泡泡彈出、AI 回覆泡泡「已完成」 | 「我只對 AI 說…」「多交代一句」 |
| T6 | 左右對照 | 左右兩張同大視窗，中間 VS 或箭頭，各有標籤 | 兩份真實截圖或兩份輸出 | 左先進、右後進（對齊 first／second cue）、差異處高亮、相同處打灰 | 兩次答案、前後版本、第一版與修正版 |
| T7 | 抽籤／骰子 | 中央抽籤箱或骰子，旁邊字籤飛出 | 新做 SVG：籤筒、字籤、骰子（平面骰） | 籤搖晃、一支籤跳出、再搖再抽出另一支；骰子丟兩次點數不同（定格） | 「一個字一個字挑，像抽籤」 |
| T8 | 流程路徑 | 三到四個節點沿虛線連接，節點為圓角卡 | 新做 SVG：節點圖示（檔案、齒輪、手機、勾） | 光點沿路徑移動，到站節點彈亮，其餘降到 0.7 | 做法三步、管線、迴圈（退回再做） |
| T9 | 放大鏡圈出 | 一張大圖，局部被放大鏡圈出並放大成側欄 | 真實截圖加圈選 overlay（參考 `bug-zoom.png`） | 放大鏡掃過、紅／黃圈畫出、側欄放大、蓋「錯」章 | 抓錯、原文對照、重疊檢查 |
| T10 | 清單／時間軸 | 縱向或橫向清單，逐項打勾或逐格亮起 | 新做 SVG：核取方塊、時間軸刻度 | 依 cue 一格一格亮起打勾，未到的灰階；末項標狀態 | 八句、三項要求、多條要點 |
| T11 | 手機框 | 置中的手機外框加畫面，旁邊留註解 | 手機截圖 | 手指點擊圓圈、畫面切換、輕微上下浮動 | 手機大小測試、點一下開始 |
| T12 | 領取卡 | 暖黃底，中央大留言關鍵字卡，下方範本預覽 | 新做 SVG：留言泡泡、關鍵字膠囊 | 關鍵字逐字蓋章、泡泡彈出、範本卡由下滑入 | 留言「動畫／兩次／網頁／遊戲」 |
| T13 | 資料圖 | 一張簡單圖表撐滿主視覺 | UnitGrid（waffle）、BarChart | 方格逐列填色、長條依 cue 長高、框選一組 | 示意機率、數量對比（標「示意」） |

## 2. 逐鏡分鏡表
欄位：鏡｜類型｜素材｜動作與對齊 cue｜色調。素材路徑：`public/…` 已存在；`tests/` 在各片 `videos/<slug>/tests/`，實作時複製到 `public/<slug>/`；「新 SVG」＝要新做。

### 2.1 caffaine-made-by-ai（用到 9 種：T2 T5 T4 T8 T10 T9 T6 T12 T1；T1 共 1 鏡）
| 鏡 | 類型 | 素材 | 動作與 cue | 色調 |
|---|---|---|---|---|
| s01 | T2 | 新 SVG：大字「0 行」＋小圖示（播放鍵） | ai：「AI」字蓋章；zero：數字 0 翻牌停住 | 事件藍 |
| s02 | T5 | 新 SVG：對話框；輸入的中文為念稿同句 | how：游標出現；say：打字；send：送出；done：回覆泡泡 | 事件藍 |
| s03 | T4 | `videos/caffaine-meeting-todo/script.json`（真實腳本檔，實作時量實際行數對照念稿「六百多行」） | file：檔名分頁；num：行號跑到末行；all：整檔縮成一條捲軸 | 深編輯器 |
| s04 | T8 | 新 SVG：腳本檔→程式→畫面三節點；`src/components/ai-iso/IsoMeeting.tsx` 行數當標示 | draw：光點沿路徑；num：「三千多行」翻牌；ai：AI 章 | 原理薄荷 |
| s05 | T10 | 新 SVG：退件單；評語文字取自 `videos/caffaine-made-by-ai/tests/feedback.txt` | fail：退件章；why：評語逐行出現 | 翻車珊瑚 |
| s06 | T9 | 新 SVG：第一版開頭六項待辦示意卡 | open：卡進；res：六項列出；guess：放大鏡圈出「AI 猜的」那一項 | 翻車珊瑚 |
| s07 | T5 | 同 s02 對話框 | add：加一句；send：送出；one：「一句話寫出重點」高亮；done：回覆 | 解法天藍 |
| s08 | T10 | 新 SVG：八格時間軸 | eight：八格亮；one：第一格放大一句；link：格與格連線 | 解法天藍 |
| s09 | T9 | 新 SVG：兩張字卡重疊示意加紅框 | also：字卡疊；catch：檢查框圈出；fix：錯開後打勾 | 翻車轉解法（珊瑚到天藍） |
| s10 | T8 | 新 SVG：講清楚→AI 做→退回 的迴圈 | a／clear／back：光點走一圈，退回那段用珊瑚虛線 | 解法天藍 |
| s11 | T12 | 新 SVG：關鍵字「動畫」留言泡泡、範本兩句卡 | kw：關鍵字蓋章；all：範本卡滑入 | 領取暖黃 |
| end | T1 | 現有 caffend | 不改 | 事件藍 |

### 2.2 caffaine-two-answers（10 種：T2 T5 T6 T9 T7 T13 T8 T4 T12 T1）
| 鏡 | 類型 | 素材 | 動作與 cue | 色調 |
|---|---|---|---|---|
| s01 | T2 | 新 SVG：大字「同一句 ×2」→「答案 ≠」 | same：同一句；twice：×2 翻牌；diff：≠ 蓋章 | 事件藍 |
| s02 | T5 | 新 SVG：對話框，同一句送兩次（上下兩個泡泡） | same：兩泡泡同字；say：打字 | 事件藍 |
| s03 | T6 | `videos/caffaine-meeting-todo/tests/01-casual.json` 與 `01b-casual-run2.json`（負責人欄）做成兩份表格 | first：左進，寫「行銷經理」；second：右進，寫「待指派」；diff：差異格黃色高亮 | 翻車珊瑚 |
| s04 | T9 | `videos/caffaine-meeting-todo/tests/source-text.txt` 原文「還沒指派」那句 | src：原文卡；ok：右邊打勾；guess：左邊蓋「猜的」章 | 翻車珊瑚 |
| s05 | T7 | 新 SVG：籤筒、字籤（行銷經理／待指派） | why：「一個字一個字」逐字出；pickw：籤搖；lot：抽出「行銷經理」；r1：再抽可能是「待指派」 | 原理薄荷 |
| s06 | T7 | 新 SVG：平面骰子 | dice：骰子落；twice：第二次；diff：兩次點數不同 | 原理薄荷 |
| s07 | T13 | 新 SVG：UnitGrid 方格（常見字格子多，標「示意」） | common：大格填色；easy：框選；no：旁邊標「不保證」 | 原理薄荷 |
| s08 | T2 | 新 SVG：大問號＋「只測 1 份」（狀態標籤：尚未確定） | known：「1 份」翻牌；q：問號彈入 | 未知灰紫 |
| s09 | T8 | 新 SVG：問兩次→對一對→一致打勾，不同則標紅 | imp／ask／cmp：光點三站 | 解法天藍 |
| s10 | T4 | 要加進去的提示詞原句；結果取 `videos/caffaine-meeting-todo/tests/02-better.json`「未指定」 | only：只根據資料那行高亮；unk：沒寫填「未指定」；try／tried：右側結果出現「未指定」並打勾 | 深編輯器 |
| s11 | T12 | 新 SVG：關鍵字「兩次」泡泡＋兩招卡 | kw、all | 領取暖黃 |
| end | T1 | caffend | 不改 | 事件藍 |

### 2.3 caffaine-same-look（9 種：T6 T5 T3 T9 T13 T2 T10 T12 T1）
| 鏡 | 類型 | 素材 | 動作與 cue | 色調 |
|---|---|---|---|---|
| s01 | T6 | `videos/caffaine-same-look/tests/01-plain-hero.png` 與 `01b-plain-run2-hero.png` | ask：打句子；twice：左右兩份依序進；same：中間蓋「≈」章 | 事件藍 |
| s02 | T5 | 新 SVG：對話框，一句話、沒指定風格 | one：打字；say：送出；nos：「沒指定風格」高亮 | 事件藍 |
| s03 | T3 | `…/tests/01-plain-full.png` 全頁，推近標題區 | bg：推近米白底、顯示色票圓點；sec：圈出「我們的堅持」；one：換第二份同位置圈出 | 翻車珊瑚 |
| s04 | T9 | `…/tests/01-plain-full.png` 加版面框線 overlay | left：圈左文右圖；card：三欄框；btn：右上深色按鈕 | 翻車珊瑚 |
| s05 | T13 | 新 SVG：UnitGrid（最常見樣式佔大多數，標「示意，一般認為」） | why：方格填滿；common：最大一群框選；safe：標「最保險」 | 原理薄荷 |
| s06 | T6 | `…/tests/01-plain-hero.png` 對 `…/tests/02-styled-hero.png` | add：中間浮出新增那句；ref：右進；again：再做一次；diff：差異處高亮，標「只試一次」 | 解法天藍 |
| s07 | T2 | 新 SVG：「1 個題目 · 1 個模型」，問號，狀態「尚未確定」 | known：數字 1 翻牌；q：問號 | 未知灰紫 |
| s08 | T10 | 新 SVG：三項清單（參考哪裡／要什麼／不要什麼） | so：標題；ref／want／not：三項逐一打勾 | 解法天藍 |
| s09 | T12 | 新 SVG：關鍵字「網頁」泡泡＋風格提示詞卡 | kw、all | 領取暖黃 |
| end | T1 | caffend | 不改 | 事件藍 |

### 2.4 caffaine-sketch-game（9 種：T6 T5 T3 T11 T9 T2 T8 T12 T1）
| 鏡 | 類型 | 素材 | 動作與 cue | 色調 |
|---|---|---|---|---|
| s01 | T6 | `public/caffaine-sketch-game/sketch.png` 對 `first-play.png` | sketch：草圖進；min：角落計時「<1 分」；play：右側遊戲畫面擦入 | 事件藍 |
| s02 | T5 | 新 SVG：對話框＋附件縮圖用 `sketch.png` | give：圖飛進附件；say：打字；fin：「已完成」 | 事件藍 |
| s03 | T3 | `first-start.png`，`videos/caffaine-sketch-game/tests/01-first-c-left.png`、`01-first-d-right.png` | file：檔名標籤；open：視窗開；start：開始畫面；catch：左右畫面切換、星星圈出 | 事件藍轉原理薄荷 |
| s04 | T11 | `public/caffaine-sketch-game/first-phone.png` | phone：手機框進；tap：手指點擊圈、畫面變遊戲 | 原理薄荷 |
| s05 | T9 | `bug.png` 與 `bug-zoom.png` | but：結束畫面；scr：星星掉；lap：放大圈出疊字，蓋「疊」章 | 翻車珊瑚 |
| s06 | T5 | 新 SVG：對話框 | say：打「照實說」；fix：請它修；keep：「其他不要動」高亮 | 解法天藍 |
| s07 | T3 | `fix-end.png`、`fix-score.png` | again：重新開始；clear：字清楚、圈出；six：分數翻到 6 | 解法天藍 |
| s08 | T2 | 新 SVG：「1 張草圖 · 1 個模型」＋問號（尚未確定） | known：翻牌；q：問號 | 未知灰紫 |
| s09 | T8 | 新 SVG：畫草圖→交給 AI→玩一下，下方迴圈箭頭「有毛病就說」 | so／a／b／c：光點三站、第三站回圈 | 解法天藍 |
| s10 | T12 | 新 SVG：關鍵字「遊戲」泡泡＋提示詞卡 | kw、all | 領取暖黃 |
| end | T1 | caffend | 不改 | 事件藍 |

自查：四支皆 ≥6 種（9／10／9／9）；同類型最長連續 2 鏡（two-answers s05、s06）；T1 每支 1 鏡；沒有真人與真實商標；數字皆取念稿與 research.md，示意圖標「示意」。

## 3. 實作清單（給工程師）
新增 `isoVersion: 6`，引擎 `src/components/ai-iso/IsoVariety.tsx`：每幕 `component: "IsoScene"`，`props.view` 選下列元件，`props.tone` 選底色（`event｜principle｜bug｜fix｜unknown｜claim`），`props.bg` 選紋理；共用字幕、LOGO、查證截至、狀態標籤、cue 解析沿用 IsoMeeting。寫在 `src/components/ai-iso/views/`。

| 元件 | 主要 props | 工時 |
|---|---|---|
| ToneBg（色調與紋理底，6 色 × 紋理） | tone, texture | 0.5 天 |
| BrowserView（T3） | src, frame, zoom:[{at,x,y,s}], scroll, circles:[{at,x,y,r}], tag | 1 天 |
| EditorView（T4） | lines[], typeAt, typeDur, hlLines, total(行號) | 1 天 |
| ChatView（T5） | typed, sendAt, replyAt, attach, repeat(2) | 0.75 天 |
| SplitView（T6） | left, right, labels, enterAt, diffMarks | 0.75 天 |
| DrawView（T7，含籤筒與骰子兩個 SVG 與動作） | mode: lots｜dice, items, pickAt | 1.5 天 |
| FlowView（T8） | nodes[{icon,label}], loop, lightAt | 0.75 天 |
| LensView（T9） | src, rings, sideZoom, stamp, overlay | 1 天 |
| CheckView（T10） | items[], litAt[], mode: list｜timeline | 0.5 天 |
| DeviceView（T11） | src, tapAt | 0.5 天 |
| ClaimView（T12） | keyword, cards[] | 0.5 天 |
| KineticView（T2，包 v2 KineticText） | text, num, from, ring | 0.5 天 |
| ChartView（T13，包 UnitGrid／BarChart） | kind, rows, markAt | 0.5 天 |

另需：
1. SVG 素材：籤筒、字籤、骰子、退件單、檔案／齒輪／手機節點圖示、留言泡泡，放 `src/components/ai-iso/views/icons.tsx`（0.5 天）。
2. 截圖複製與縮圖：把 tests/ 的 png／json 複製到 `public/<slug>/`，`tests/make-display.py` 風格裁切（0.5 天）。
3. `scripts/ai-iso/validate-iso.mjs`：新增規則——每支 ≥6 種 view、同 view 不連續 >2、T1 ≤2、每幕 view 與 tone 必填；跑現有重疊檢查（0.5 天）。
4. 四支 script.json 改寫（只改 component props，不改 narration；cue 沿用）：每支 0.5 天，共 2 天；每支渲染前跑 `npm run still`＋人工每 0.5 秒抽格。
5. 驗收：逐幀重疊檢查、色調對比 ≥4.5:1、四支各 `npm run render`，不重新配音（念稿與音檔不動，時間軸沿用）。

合計約 12 工作天（元件 9.5、素材與驗證 1.5、改四支 2 天含部分重疊可壓到約 10 天）；若要先出一支驗證手感，建議先做 `sketch-game`（截圖素材最齊，需 T2、T3、T5、T6、T8、T9、T11、T12，約 6 天）。

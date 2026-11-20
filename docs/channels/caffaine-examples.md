# CaffAIne 範例庫（物件／場景／動作）

規則見 `ai-daily-playbook.md` 第二十一節。下一支開工先從這裡挑，沿用後再加細節。
狀態：✅ Andy 核准｜⏳ 已交件、等 Andy 打分。秒數指成片（有聲版以有聲版為準）。
元件都在 `src/components/ai-iso/IsoMetaphor.tsx`（view 名稱在括號），套版 `scripts/caffaine/metaphor_build.py`。

| 用途（比喻什麼） | 物件／動作 | 出處（片／秒） | 狀態 |
|---|---|---|---|
| 對照「沒做 vs 有做」 | 兩條輸送帶並排，上面亂紙堆、下面過閘門出整齊卡（belts） | caffaine-rules-file s01，0–5 秒 | ⏳ |
| 寫下一份規矩 | 紙逐行寫出、蓋章「只寫一次」、釘圖釘、小卡飛給機器人（paper） | caffaine-rules-file s03 | ⏳ |
| 一份設定套到多個工具 | 卡片複製進三個槽口，新請求信封掉入、三格打勾（slots） | caffaine-rules-file s04 | ⏳ |
| 實測分數比較 | 兩塊計分牌跳數字、星星依分數亮（scoreboard） | caffaine-rules-file s05 | ⏳ |
| 東西越積越重 | 機器人背包、文件一份份堆高、越來越喘（pack） | caffaine-new-chat s01 | ⏳ |
| 大量 vs 精簡 | 九張紙疊成的大箱子對一張小紙條、重讀轉圈箭頭（volume） | caffaine-new-chat s02 | ⏳ |
| 長度造成中段變差 | 方塊越拉越長抖動、表現曲線凹成 U 形、中段變暗（lostmid） | caffaine-new-chat s03 | ⏳ |
| 交接到新環境 | 便條從亂桌飛到乾淨新桌、機器人變開心、一排勾（carry） | caffaine-new-chat s07 | ⏳ |
| 兩件事不等價 | 天平一邊壓下、蓋「≠」章（balance） | caffaine-feynman s01 | ⏳ |
| 你講、AI 挑錯 | 黑板兩行字、粉筆／紅筆圈錯（board） | caffaine-feynman s03、s06 | ⏳ |
| 累積成長對比 | 八年長條單利 vs 複利、紅筆圈多出段、掃光＋金幣跳動（compound） | caffaine-feynman s04 | ⏳ |

## 已知要改進（下一支直接套用）
- 落定後至少停 1.5 秒：三支多數幕只有 0.2–1 秒，因為最後一個動作落在最後一個關鍵詞；下一支把每幕最後動作提前到倒數第二個 cue。
- 長條圖段容易靜止 >1.2 秒：一開始就給掃光／呼吸環境動作（feynman 21.8 秒那段的修法）。

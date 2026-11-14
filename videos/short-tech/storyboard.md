# short-tech 分鏡

> 第二版（2026/11/14 晚，7 鏡、22 秒）的每鏡表在 README.md「第二版（現行）」；寫法以 script.json 為準。下面是第一版（5 鏡）的分鏡，留作紀錄。

## 第一版（5 鏡，目標 13–15 秒，無聲版）

風格（使用者指定）：Powers of Ten 式無限縮放＋3D 爆炸圖＋深色科技 HUD。
- 前段（s1–s2）全是 2D：深色底、HUD 角框、掃描線、尺標、倍率讀數，縮放圖層是 SVG（手機 → 主機板 → 晶片 → 電晶體陣列），不掛 3D，每幀成本和一般畫面一樣。
- 縮到最後一級（一顆電晶體，畫面寬 150 nm）時交棒給 3D 模型（`stage: "three"`，`videos/short-tech/model.json` 的奈米片電晶體），之後在 3D 上拆開、量尺寸；HUD 仍是 2D SVG 疊在 3D 上。
- 顏色：深底，青藍＝奈米片／尺標，琥珀＝閘極／警示；HUD 是細線 UI，不做霓虹外發光。token 在 `src/theme.ts` 的 `THEME_3D_HUD`，元件骨架 `src/components/three/Hud.tsx`（`HudBackdrop`、`ZoomArt`、`HudFrame`、`zoomKeys`／`zoomAt`），**還沒接進 ThreeVideo.tsx**。
- 每級縮放的 HUD：左下尺標（5 cm → 5 mm → 500 µm → 5 µm → 50 nm）、右上倍率（×1 → ×10 → ×100 → ×10⁴ → ×10⁶）、中間層級名稱（手機 PHONE／主機板 LOGIC BOARD／晶片 DIE／電晶體陣列 CELLS／一顆電晶體 NANOSHEET FET）。縮放是對數尺度補間，看起來是等速往裡鑽。
- 時間全部用 cue id（`script.json` 的 `cues`），不手填秒數。3D 只出現在 s3–s5（約 8 秒、240 幀）；dpr 1。

| 鏡 | 旁白 | 對到的詞（cue） | 畫面 | 轉場／鏡頭 |
|---|---|---|---|---|
| s1 鉤子 | 兩奈米，到底量的是哪裡？ | two＝兩奈米、where＝哪裡 | 第 0 幀：實心大字「手機晶片的／2奈米不是尺寸」（128px），背後一支自繪的中性手機線稿已經在緩慢推近（drift），HUD 角框、掃描線、尺標「5 cm」、倍率「×1」都在。念到「兩奈米」蓋琥珀章「≠ 2 nm」；念到「哪裡」前 6 幀開始縮放進主機板，倍率跳到 ×10、尺標換 5 mm | 一鏡到底的縮放，不切 |
| s2 放大 | 放大晶片，裡頭上百億個電晶體。 | zoom＝放大、chip＝晶片、count＝上百億 | 念「放大」前 4 幀鑽進晶片（DIE，×100、500 µm），晶片上是區塊格；念「上百億」前 6 幀繼續鑽進電晶體陣列（×10⁴、5 µm），密密麻麻的格子；藍章「上百億個」 | 繼續縮放 |
| s3 拆開 | 拆開一個，是三片疊起的薄片。 | open＝拆開、three＝三片、thin＝薄片 | 一開始縮到最後一級（×10⁶、50 nm），2D 閘極格淡出、3D 奈米片電晶體淡入（交棒）；念「拆開」前 4 幀 3D 爆炸圖展開；念「三片」標籤「奈米薄片 nanosheet」；念「薄片」後琥珀標籤「閘極 gate」（兩張標籤都在 s4「五奈米」前 4 幀撤掉，讓位給尺寸線，同畫面標籤＋尺寸線 ≤2），薄片裡開始有光點流過（示意電流） | 縮放交棒給 3D，鏡頭轉到爆炸視角 |
| s4 數字 | 一片五奈米厚，間距四十四奈米。 | five＝五奈米、pitch＝間距、ff＝四十四 | 念「五奈米」前 6 幀鏡頭推近薄片邊緣，HUD 尺寸線「5 nm」（青藍，量片厚）；念「間距」鏡頭拉高、閘極脈衝；念「四十四」前 4 幀第二條尺寸線「44 nm」（琥珀，量兩個閘極中心） | 鏡頭兩段移動 |
| s5 下一支 | 都不是二。這麼小，怎麼印？ | none＝都不是、small＝這麼小、how＝怎麼印 | 念「都不是」前 2 幀珊瑚章「都不是 2」（衝突點，蓋在兩條尺寸線上）；鏡頭拉遠俯看整顆電晶體；念「怎麼印」前 2 幀卡片「下一支／這麼小／怎麼印上去？」，「怎麼印」念到時上色，底部小字「曝光機」 | 拉遠收尾（短片不放片尾卡） |

出處列：s1「節點名稱是世代名，不是實際尺寸（IBM、WikiChip）」；s2「某款 3 奈米世代手機晶片官方公布約 190 億個電晶體」；s3「示意模型；比例照 IBM 2021 公開的 2 奈米試作晶片」；s4「IBM 2 奈米試作晶片公開數字；台積電 N2 尺寸未公開」；s5「IBM 試作晶片數字；台積電 N2 尺寸截至 2026/11/14 未公開」。

## 使用者技能（docs/skills/3d-industry-explainer-video.md）對照
- 分鏡五段縮成 15 秒：遠景推近＝s1–s2 的 Powers of Ten 縮放（手機→主機板→晶片→陣列）｜爆炸拆解＝s3｜剖面發光看原理＝s3 尾–s4（薄片裡光點流過、閘極脈衝、尺寸線）｜新舊方案對比＝縮成「名稱 2 vs 實測 5／44」的數字對比（15 秒放不下 FinFET 對奈米片的流速對比，照實記下）｜拉遠總結＝s5。
- 右上角固定「Schematic – not to scale 示意圖，非實際比例」：資料在 script.json `hud.schematic`，接 HudFrame 時畫在倍率讀數下方。
- 同畫面標籤 ≤2（`hud.maxLabels`）；鏡頭 ease-in-out（Hud.tsx 用 EASE）；深色背景、金／銅＝閘極琥珀金屬；bloom 用便宜的假光暈（2D 疊層或 pulse halo），先 bench 再開。
- 開頭 3 秒提問式鉤子：旁白問句＋第 0 幀結果大字（見 script.md）。
- 交付另需：`out/short-tech/scene.html`（OrbitControls，讀同一份 model.json）與旁白稿 `videos/short-tech/narration.txt`（已寫）。

## 還沒做的（給做畫面的人）
- `Hud.tsx` 只是骨架：要在 `ThreeVideo.tsx` 的 `VideoThree` 裡，`script.hud` 存在時改畫 `HudBackdrop`、在交棒前不掛 3D `Stage`、疊 `ZoomArt` 與 `HudFrame`（只做向下相容的新增，沒寫 hud 的舊片不受影響）；`props.zoom`、`props.measure` 目前 validate 不擋，但畫面還不會動。
- 沒有配音也沒有時間軸：styleVersion 3 的 still／render 需要 `timeline.json`（version 2），現在的 `align.mjs` 沒有「無聲估算」模式。拿到使用者的聲音後走正常流程（tts-take → align）；若要先看無聲版，需要另外做一個依字數估算的時間軸產生器。
- 3D 渲染估時：3D 只在 s3–s5，約 240 幀；dpr 1 每幀約 2.7 秒（平行數 1）。接好後先跑 `node scripts/three/bench30.mjs short-tech`，整支要 ≤ 15 分鐘。

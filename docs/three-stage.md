# 3D 產品台（`stage: "three"`）：資料格式、可用的東西、渲染成本

科技頻道專用。畫面中間是一個 3D 舞台（`@remotion/three`），外面一圈（大標、標籤、字幕、出處）是 HTML。
**產品模型是資料**：零件清單寫在 `videos/<slug>/model.json`（或 `script.json` 的 `model`），引擎讀資料建模。換產品只寫一份新的 `model.json`，不用改 `src/components/three/`。

- 樣片：`videos/sample-tech-3d/`（手機均熱板；`model.json` 有 65 個零件）、`videos/sample-tech-anc/`（耳機主動降噪；示範第五節的「運作動畫」）
- 程式：`src/components/three/model.ts`（資料 → 幾何、材質、紋理）、`engine.ts`（時間與姿態）、`Scene.tsx`（3D 畫面）、`Ops.tsx`（運作動畫的 3D 部分）、`ThreeVideo.tsx`（HTML 外圈、2D 特效、儀表）
- 檢查：`npm run validate <slug>`（`scripts/three/validate-three.mjs`，會檢查 model.json 的形狀、材質、層、標註點）
- 量成本：`node scripts/three/bench-fx.mjs <slug>`（逐項開關特效，量每幀毫秒）

## 一、model.json

```jsonc
{
  "size": { "w": 7.2, "h": 15, "r": 1.05, "t": 0.84 },   // 產品外形（寬、高、圓角、厚）；單位自訂，手機用「約 1 公分」
  "palette": { "navy": "#27324A", "copper": "#CF7F42" },   // 色票：名字 → 色碼（材質與特效都寫名字）
  "materials": { "alu": { "kind": "std", "color": "alu", "rough": 0.3, "metal": 0.92, "tex": "brushed", "texScale": 2.4 } },
  "layers": [ { "id": "back", "z": -0.36, "k": -2 }, { "id": "plate", "z": 0.1, "k": 0, "outline": [5.4, 9.6, 0, 1.7] } ],
  "parts": [ { "id": "frame", "layer": "frame", "shape": "ring", "size": [7.2, 15, 0.84], "r": 1.05, "wall": 0.28, "bevel": 0.07, "mat": "alu" } ],
  "anchors": { "chip": { "layer": "inner", "p": [-1.45, 4.3, 0.3], "dx": -150, "dy": -40 } },
  "thermal": { "layer": "plate", "center": [0, 1.7], "size": [4.6, 8.6], "hot": [-0.6, 2.6] },
  "actions": { },                                           // 可省略：運作動畫的定義（第五節）
  "camera": {}, "pose": {}, "fx": {}                        // 都可省略：蓋掉 THEME_3D 的鏡頭、姿態、特效開關
}
```

座標：x 向右、y 向上、z 朝正面（螢幕那一面）。產品立著時正面朝鏡頭。

### layers（層）
分解時整個產品沿 z 方向一層層分開。`z`＝組裝時的位置；`k`＝分解時往哪邊移幾個「層距」（`THEME_3D.pose.gap`，負的往背面）。
`outline: [寬, 高, 中心x, 中心y]`＝這一層的外形（畫殘影與地面陰影用；沒寫就用產品外形）。
聚焦（`focus`）某一層時：比它前面的層往鏡頭飛走並淡出、正後面那層靠近一點、更後面的往後退並淡出。這是規則，不用逐層寫。

### parts（零件）
| 欄位 | 說明 |
|---|---|
| `layer` | 屬於哪一層（跟著那一層移動、淡出） |
| `shape` | 見下表 |
| `size` | 依形狀不同 |
| `r`／`bevel`／`wall` | 圓角半徑／邊緣倒角／框的邊寬 |
| `pos` | `[x, y, z]`，z 是相對於那一層 |
| `rot` | `[rx, ry, rz]` 度；`scale` `[sx, sy, sz]`（例如把球壓扁成鏡片） |
| `at` | 複製到多個位置：`[[x, y], [x, y, z], …]`（加在 `pos` 上；鏡頭兩顆、螺絲七顆這種） |
| `grid` | 排成陣列：`{ "n": [4, 8], "step": [1.1, 1.1] }`（以 `pos` 為中心；均熱板裡的支撐柱） |
| `mat` | 材質名 |
| `role` | 會動的角色：`lid` 掀蓋時滑開、`heatFloor` 依熱度逐點變色、`heatSource` 發熱變紅、`xray` 念到「燙」時變透明 |
| `shadow` | `false`＝不投陰影（只在 `fx.shadows ≥ 2` 有差） |

| `shape` | `size` | 用途 |
|---|---|---|
| `slab` | `[寬, 高, 厚]`＋`r`、`bevel` | 圓角板：背蓋、電池、晶片、電路板、排線、按鍵（轉 90 度） |
| `ring` | `[寬, 高, 厚]`＋`r`、`wall`、`bevel` | 圓角框：中框、均熱板外框、螢幕膠圈 |
| `plane` | `[寬, 高]`＋`r` | 沒有厚度的圓角面：螢幕畫面、標籤紙、晶片上的印字區 |
| `box` | `[寬, 高, 厚]` | 方塊：電容、天線斷點、螺絲的一字槽 |
| `cyl` | `[半徑, 長]` | 圓柱（軸朝 z；要朝別的方向用 `rot`）：螺絲、喇叭孔、支撐柱、閃光燈 |
| `tube` | `[外半徑, 內半徑, 長]`＋`bevel` | 圓環：鏡頭外圈、光圈 |
| `sphere` | `[半徑]`＋`scale` | 球：鏡片（壓扁）、水滴 |

同一個零件的複製品會合併成一份幾何（一次繪製）。零件超過 120 個 validate 會提醒先量時間。

### materials（材質）
| 欄位 | 說明 |
|---|---|
| `kind` | `std` 一般（金屬、塑膠）／`phys` 有清漆層（玻璃、烤漆、拋光面）／`screen` 自發光畫面／`unlit` 不受光 |
| `color` | 色票名或色碼 |
| `rough` | 0 鏡面 – 1 粗糙（決定高光多銳利） |
| `metal` | ≥0.5 當金屬：反光帶底色（銅就是銅色的反光）；<0.5 是塑膠／玻璃：反光是白的 |
| `clearcoat` | 清漆強度（`phys`） |
| `emissive`／`ei` | 自發光顏色與強度（閃光燈；`screen` 的 `ei` 是畫面亮度） |
| `env` | 環境反光倍率（鏡片寫 1.8） |
| `tex`／`texScale` | 程式產生的紋理：`wick` 毛細網、`traces` 線路、`brushed` 髮絲紋；`texScale`＝一格紋理多大 |
| `opacity` | 半透明 |

常用的四類：**金屬**（`std`、`metal` 0.9、`rough` 0.25–0.4，可加 `brushed`）、**玻璃／烤漆**（`phys`、`rough` 0.05–0.2、`clearcoat` 1）、**塑膠**（`std`、`metal` 0、`rough` 0.6–0.8）、**銅**（`std`／`phys`、`metal` 0.95–1、銅色）。

反光怎麼來的：程式畫一張 256×128 的攝影棚全景（上亮下暗、幾塊柔光箱與黑旗；顏色在 `THEME_3D.env`），金屬把它「乘」在底色上、玻璃把它「加」上去。每個像素只多查一次貼圖。
真正的物理材質（`fx.pbr: true`：MeshStandard／Physical＋PMREM 環境貼圖）也做了，但這台沒有顯示卡的機器一幀要多二十幾秒，只留著比較。

### anchors（標註點）
`script.json` 的 `labels[].part` 寫這裡的鍵。`layer`＋`p`＝釘在哪一層的哪一點；`dx`／`dy`＝標籤往哪邊放（px，負的 dx 放左邊）。標籤位置用和 3D 同一台相機投影，會跟著模型走。

### thermal（熱循環，可省略）
水滴↔蒸氣、熱擴散這一組特效要的資料：`layer`（在哪一層）、`center`＋`size`（腔體範圍）、`floorZ`、`hot`（熱點，相對於 center）、`lanes`（回流走的兩條邊）、`lidTravel`（掀蓋滑多遠）、`particles`／`shimmer`（水滴／熱浪顆數）、`ramp`（色溫階：由涼到熱的色票名）、`water`／`vapor`／`shimmerColor`／`glow`／`sourceHot`／`sourceWarm`（色票名）。
沒有 `thermal` 的產品不能用 `peek｜cutaway｜heat｜vapor｜spread｜condense｜flowBack`（validate 會擋），其他動作都能用。

## 二、script.json 每幕的 props（`component: "ThreeScene"`）

每個 `at` 只寫 cue id 或 `start｜voice｜end｜exit`，可加減幾幀；要指到別幕的 cue 寫 `幕id:cue±N`（例如標籤的 `until: "s4:vapor-6"`）。

| props | 作用 |
|---|---|
| `hook: { title }` | 第 0 幀的大標（第一幕必填） |
| `spin: { at, until }` | 立著轉一圈 |
| `drop: { at }` | 大標旁的水滴圖示 |
| `explode: { at }` | 躺下、沿厚度一層層分開（同時畫殘影與導引線） |
| `labels: [{ part, text, color, at, until? }]` | 零件標籤（圓點波紋 → 引線畫出去 → 標籤卡＋一道光掃過）；沒寫 `until` 的，聚焦後不在主角層的自動退場 |
| `focus: { layer, at }` | 鏡頭推近某一層，其他層讓開；背景格線放大、兩側壓暗、遠處起霧 |
| `rename: { part, text, en, at }` | 把那張標籤換字（「金屬板」→「均熱板」） |
| `sweep: { at }` | 一道光掃過主角零件（可以寫陣列掃多次） |
| `orbit: { at }`／`settle: { at }` | 鏡頭繞開拉遠／推回去（增量在 `THEME_3D.camera`） |
| `peek｜cutaway｜heat｜vapor｜spread｜condense｜flowBack: { at }` | 熱循環：上蓋微抬｜掀蓋｜發熱（晶片變紅、底板短暫透視）｜水滴變蒸氣｜蒸氣與熱擴散到整片｜冷卻凝結｜沿邊緣流回熱點 |

| `run: [{ id, at, until?, speed?, gain?, ramp? }]` | 觸發運作動畫（`model.json` 的 `actions`；見第五節） |
| `shot: { at, d?, elev?, y?, x?, yaw?, dur? }` | 鏡頭關鍵格（可寫陣列）：距離、仰角、看向的高度／左右是絕對值，`yaw` 是增量；`dur` 幀內補間過去（預設 34）。用來「跟著訊號走」 |
| `shift: { layer, at, until?, opacity?, dx?, dy?, dz?, dur? }` | 把某一層變透明或移開（露出下面的零件），`until` 之後回來（可寫陣列） |

收尾（最後 20 幀鏡頭慢慢後退、光斑變亮）是自動的。

## 三、特效清單與成本

特效開關在 `THEME_3D.fx`，`model.json` 的 `fx` 可以蓋掉；量測時用 `THREE_FX="dpr=1,shadows=0"` 或 `bench-fx.mjs`。

量法：`node scripts/three/bench-fx.mjs sample-tech-3d --frames 4 --base dpr=1`（2026/11/13；平行數 1、畫布倍率 1、每項渲 4 幀取後 3 幀平均，不含開瀏覽器）。
基準（成片的特效全開、倍率 1）：**分解段每幀約 2.7 秒、熱循環段約 3.2 秒**。只有 3 幀平均，**±0.2 秒以內都算誤差**。「成本」＝開著比關掉多幾秒。

| 特效 | 對到什麼 | 開關（`fx`） | 每幀成本（倍率 1） | 成片 |
|---|---|---|---|---|
| 環境反光（金屬、玻璃映出攝影棚） | 全片 | `env` | 約 0.5 秒 | 開 |
| 清漆層（玻璃、烤漆的銳利高光＋白色反光） | 全片 | `clearcoat` | 約 0.2 秒 | 開 |
| 程式紋理（毛細網、線路、髮絲紋） | 全片 | `textures` | 量不出來（<0.1 秒） | 開 |
| 霧（遠的零件往背景色靠，景深感的替代品） | 分解、聚焦 | `fog` | 量不出來 | 開 |
| 地面柔和陰影（每層外形壓到地面的模糊貼圖） | 全片 | `shadows: 1` | 約 0.5 秒 | 開 |
| 陰影貼圖，只落在地面 | — | `shadows: 2` | 約 1.2 秒 | 關 |
| 陰影貼圖，零件之間也互相投影 | — | `shadows: 3` | 約 1.6 秒 | 關 |
| 分層殘影＋導引虛線 | 「拆開」 | `ghost`、`guides` | 約 0.1 秒 | 開 |
| 微塵光斑 | 開場、收尾 | `dust` | 量不出來 | 開 |
| 標籤引線動畫（圓點波紋、引線畫出去） | 每張標籤的 cue | 內建 | 量不出來 | 開 |
| 光掃（聚光燈掃過主角＋標籤上一道亮帶） | 「金屬板」「均熱板」 | `sweep`、`sheen` | 量不出來 | 開 |
| 鏡頭推近時背景格線放大、兩側壓暗 | 「均熱板」 | `vignette` | 量不出來 | 開 |
| 背景模糊（CSS blur 6px） | 聚焦 | `backdropBlur: 6` | 量不出來（約 0.1 秒） | 關（看不太出差別） |
| 色溫漸變（底板逐點變色：銅 → 琥珀 → 橘 → 紅） | 「燙」「整片」「涼了」 | 內建（`heatFloor`） | 量不出來 | 開 |
| 熱點點光（附近零件被照成橘紅） | 「燙」 | `glow` | 約 0.2 秒 | 開 |
| 熱浪粒子（暖色柔光點往上飄） | 「燙」到「涼了」 | `shimmer` | 約 0.1 秒 | 開 |
| 蒸氣柔邊貼圖（水滴縮小、蒸氣團長大） | 「蒸氣」「變回水」 | `vaporSprites` | 量不出來 | 開 |
| MSAA 反鋸齒 | — | `msaa` | 約 2.0 秒 | 關（改用倍率縮小） |
| 水滴折射（transmission） | — | `transmission` | 約 5.7 秒 | 關 |
| 物理材質＋PMREM 環境貼圖 | — | `pbr` | 約 3.7 秒（倍率 2＋MSAA 時量到多 24 秒） | 關 |
| 環境光遮蔽（SSAO） | — | 沒做 | 沒量（要另外接後製管線，而且光是 MSAA 就已經吃掉預算） | — |
| 地面鏡面反射 | — | 沒做 | 沒量（立著時手機底部緊貼字幕卡，版面上沒有位置放倒影） | — |

畫布倍率（`fx.dpr`）：倍率 1＝2.7 秒、1.5＝5.4 秒、2＝8.3 秒（同一段、平行數 1）。成片用 **1.35**。

第一版的做法（物理材質＋PMREM＋陰影貼圖＋MSAA＋倍率 2）量到每幀 36 秒，整支要 4 個多小時，所以換成上面這套便宜的做法。

## 四、渲染

- `THREE_CONCURRENCY=4 npm run render <slug>`（預設平行數 1）。這台 4 核心、沒有顯示卡，3D 是 CPU 算的（Chrome 的 `swangle`）。
- 成本幾乎和「3D 畫布的像素數」成正比，所以最有效的旋鈕是 `fx.dpr`（畫布倍率，渲完縮回 1080 寬）。不開 MSAA（很貴），靠倍率縮小來抗鋸齒。
- 正式長片先 `node scripts/three/bench30.mjs <slug>` 估時間。

## 五、運作動畫怎麼寫（`actions`＋`run`）

拆解之外，讓產品「動起來給你看它怎麼運作」。做法分兩半：
**動作的定義是資料**，寫在 `model.json` 的 `actions`（哪個零件、哪條路徑、什麼顏色、多快）；**什麼時候動**寫在 `script.json` 每幕的 `props.run`（由 cue 觸發）。
引擎（`engine.ts` 算每一幀的強度與相位、`Ops.tsx` 畫 3D、`ThreeVideo.tsx` 畫儀表）不知道產品是什麼，換產品只換資料。樣片：`videos/sample-tech-anc/`（耳機主動降噪）。

```jsonc
// model.json
"actions": {
  "cone":     { "type": "vibrate", "parts": ["drvDome", "drvCoil"], "axis": [0, 0, 1], "amp": 0.16, "freq": 5 },
  "fan":      { "type": "rotate",  "parts": ["blade"], "axis": [0, 0, 1], "rps": 1.5, "pivot": [0, 3] },
  "chipPulse":{ "type": "pulse",   "parts": ["soc", "socLid"], "color": "anti", "freq": 3.5, "glow": 0.85, "halo": 2.3 },
  "sigOut":   { "type": "flow",    "path": [{ "layer": "board", "p": [0.3, 3, 0.34] }, { "layer": "driver", "p": [2.38, 3, 0.05] }], "n": 5, "size": 0.2, "shape": "arrow", "rate": 0.75, "color": "anti" },
  "antiWave": { "type": "wave",    "from": { "layer": "driver", "p": [0, 3, -0.4] }, "dir": [0, 0, -1], "reach": 7.4, "count": 5, "r0": 1.25, "spread": 0.04, "rate": 0.3, "phase": 0, "color": "anti" },
  "tNoise":   { "type": "trace",   "layer": "ear", "from": [-2.8, 3, 0.9], "to": [2.8, 3, 0.9], "up": [0, 0, 1], "amp": 0.75, "cycles": 2.2, "rate": 0.8, "harmonics": [[1, 1], [2, 0.38]], "color": "noise" },
  "tAnti":    { "type": "trace",   "…同一條線…": 0, "invert": true, "color": "anti" },
  "tSum":     { "type": "sum",     "of": ["tNoise", "tAnti"], "layer": "ear", "from": [-2.8, 3, -1.5], "to": [2.8, 3, -1.5], "build": 26, "buildDelay": 8, "color": "quiet" },
  "earLevel": { "type": "meter",   "anchor": "earMeter", "kind": "bar", "source": "tSum", "label": "耳內音量", "accent": "mint" }
}
// script.json 某一幕的 props
"run": [ { "id": "cone", "at": "cone-2" }, { "id": "antiWave", "at": "wave-6", "until": "s6:stack" }, { "id": "tAnti", "at": "ear-8", "ramp": 14 } ]
```

### run（觸發）
`id`＝`actions` 的鍵；`at`／`until`＝cue（寫法和其他 props 一樣，沒寫 `until` 就一直動到片尾）；`speed`＝速度倍率（預設 1）；`gain`＝強度倍率（預設 1）；`ramp`＝進出場幾幀（預設 `THEME_3D.ops.ramp`＝8）。同一個動作可以在不同幕再觸發一次（後面的蓋掉前面的）。

### 八種 type
點的寫法：`[x, y, z]`（在該動作 `layer` 那一層裡）或 `{ "layer": "…", "p": [x, y, z] }`（每個點可以在不同層，分解後路徑會跟著拉長）。顏色寫色票名。

| `type` | 用途 | 欄位 |
|---|---|---|
| `vibrate` | 零件振動／往復（振膜、馬達、活塞） | `parts`（零件 id 陣列）、`axis` 方向、`amp` 幅度（模型單位）、`freq` 每秒幾下 |
| `rotate` | 旋轉件（風扇、齒輪、轉盤） | `parts`、`axis`（預設 z）、`rps` 每秒幾圈、`pivot: [x, y]` 轉軸位置（預設零件自己的 `pos`）；`until` 之後停在原地 |
| `pulse` | 零件發光／脈衝（晶片運算、麥克風收到聲音） | `parts`、`color`、`freq` 每秒閃幾下、`glow` 發光強度 0–1、`halo` 光暈大小（0＝不要）、`at` 光暈位置（預設第一個零件）。會發光的零件自動有自己的材質 |
| `flow` | 沿路徑流動的光點或箭頭（電流、氣流、訊號） | `path`（≥2 點）、`n` 顆數、`size`、`shape: "dot"｜"arrow"`、`rate` 每秒跑幾趟、`track: false` 不畫軌道線。觸發後第一顆從起點出發 |
| `wave` | 往外擴散的波紋／聲波圈 | `from` 起點、`dir` 方向、`reach` 走多遠、`count` 同時幾圈、`r0` 起始半徑、`spread` 每走 1 單位半徑多多少、`rate` 每秒走幾趟、`phase` 相位（0–1，兩組波錯開半拍寫 0.5）、`width` 線寬（相對半徑）、`arc`／`arcStart` 只畫一段弧（度） |
| `trace` | 一條線上的行進波形 | `from`、`to`、`up` 振幅方向、`amp`、`cycles` 線上幾個波長、`rate` 每秒走幾個波長、`phase`、`invert: true` 反相、`harmonics: [[倍頻, 相對振幅], …]`（讓波形不是單純正弦）、`radius` 線粗、`axisLine: false` 不畫基準線、`hidden: true` 不畫在 3D 裡（只給儀表用） |
| `sum` | 兩道（或多道）波疊加的結果 | `of`（trace 的 id 陣列）、`from`／`to`／`up`、`build`＝先畫第一道，再用幾幀把其他幾道加進來（看得到振幅縮小歸零的過程）、`buildDelay` |
| `meter` | 跟著數值動的小儀表（HTML 小卡，釘在標註點旁邊） | `anchor`（`anchors` 的鍵）、`kind: "bar"`（音量條，跟著 `source` 的大小）｜`"wave"`（小波形，畫 `traces` 列的幾道）、`label`、`accent`（amber／blue／coral／mint）、`w` 寬度 |

要點：
- 波形的相位用「全片時間」算，所以兩道 `cycles`、`rate`、`harmonics` 相同的 trace 一道寫 `invert` 就剛好相消；`sum` 與 `meter` 讀的是同一份數值（`engine.ts` 的 `signalVal`／`signalLevel`），不是另外畫的假動畫。
- `flow`、`wave`、`trace`、`sum`、光暈預設畫在最上層（不被零件擋住，像透視圖）；要被零件擋住就在該動作寫 `"depth": true`。
- 這些都是**示意動畫**：出處列要寫明「波形是示意，不是量測」，儀表不要標沒有查證過的數字。
- 熱循環（`thermal`）是另一組專用特效，和 `actions` 可以並存。

### 每種的渲染成本
量法：`node scripts/three/bench-fx.mjs sample-tech-anc --ops --rotate drvFrame --frames 4`（平行數 1、畫布倍率 1；每種找它正在動的一段，全開與拿掉這一種各渲一次，取差）。
結果（2026/11/13，`out/sample-tech-anc/bench-ops.json`；每種渲 5 幀取後 4 幀平均）：

| type | 量的那一段 | 全開（毫秒/幀） | 拿掉這一種 | 差 |
|---|---|---|---|---|
| `vibrate` 零件振動 | 第 381 幀起（振膜） | 2716 | 2569 | +147 |
| `rotate` 旋轉件 | 第 221 幀起（臨時加的，轉喇叭外框） | 2241 | 2040 | +201 |
| `pulse` 發光／脈衝＋光暈 | 第 254 幀起（麥克風） | 1992 | 1966 | +26 |
| `flow` 流動的光點／箭頭 | 第 293 幀起（板子特寫） | 3354 | 3733 | −379 |
| `wave` 聲波圈 | 第 235 幀起 | 2029 | 1972 | +57 |
| `trace` 行進波形 | 第 412 幀起 | 1966 | 1921 | +45 |
| `sum` 疊加相消 | 第 484 幀起 | 2148 | 1772 | +376 |
| `meter` 小儀表 | 第 322 幀起（板子特寫） | 3548 | 3740 | −192 |

怎麼讀：**八種都量不出穩定的成本**。差值從 −379 到 +376 毫秒，有正有負（拿掉反而變慢是不可能的），代表這次量測的雜訊就有 ±0.4 秒左右（量的時候機器上還有別的工作在跑）。
合理的結論是「每種每幀最多多零點幾秒，和基準的 2–3.5 秒比起來不是重點」，而不是表上的個別數字。這些動作畫的東西都很少（幾個圈、幾顆球、一條管子、一張 HTML 小卡），沒有額外的光源或貼圖。
真正決定時間的是**鏡頭離多近**：同樣的設定，全景約 2.0 秒/幀，推到板子特寫（零件佔滿畫面）約 3.5 秒/幀，因為軟體渲染的成本跟「有東西的像素數」成正比。`shot` 推太近、推太久會直接拉長渲染時間。

## 六、2D 疊層（`props.overlay`）與留存用的小開關

2026/11/14 加的（專家評估後，見 `docs/tech-3d-expert-review.md`、檢查清單 `docs/channels/tech-3d.md`）。全部是 HTML／SVG，畫在 3D 畫布上面，**不增加 3D 渲染時間**；程式在 `src/components/three/Overlays.tsx`，顏色只讀 `THEME_3D`。沒有寫 `overlay` 的舊片畫面不變。

每幕 `props.overlay: [ { type, at, until?, … } ]`。`at`／`until` 和其他地方一樣寫 cue（可以指到別幕，疊層可以跨幕留著）；巢狀的 `anti.at`、`items[].at`、`keys[].at` 也是 cue。位置寫畫面像素 `x`、`y`，或 `part`（`model.anchors` 的標註點，跟著 3D 投影走）加 `dx`、`dy`。

| type | 作用 | 主要欄位 |
|---|---|---|
| `scope` | 波形面板（開場鉤子用）：粗線＝耳朵聽到的；`anti.at` 之後第二道波加進來，粗線是兩道**逐點相加**的結果 | `y`、`h`、`title`、`wave: "low"｜"fast"`、`anti: { at, match（抵消幾成，預設 0.75）, lag（慢多少，>0＝對不準）, label }` |
| `stamp` | 蓋章：有顏色的標籤拍上去（先大後小、微歪） | `text`、`color`、`rot`、`size` |
| `cross` | 紅色叉叉，兩筆依序畫出 | `size`、`color` |
| `circle` | 圈起一個標註點（下一集鉤子） | `part`、`r`、`color` |
| `steps` | 步驟列：幾個零件依序揭曉（還沒講到的是「？」），講到的亮起來並留著 | `y`、`title`、`items: [{ text, at, color }]` |
| `card` | 蓋在舞台上的提問卡 | `y`、`kicker`、`lines`、`hi`（上色的詞）、`hiAt`（念到這個 cue 才上色畫底線）、`size`、`foot` |
| `ribbon` | 字幕下面的底部波帶（背景裝飾，填下方空白） | `keys: [{ at, v（0–1 大小）, fast? }]` |

其他向下相容的小開關：
- `props.spin.turns`：開場轉幾圈（預設 1）；寫 0.07 這種小數＝只轉一點點就停，躺下時就近轉到分解角度。
- 開場就要在動的動作：`run` 的 `at` 寫 `start-30`（第 0 幀已經進場完）；開場鏡頭用 `shot: { at: "start-30", dur: 1, … }`，拆開時再用一個 `shot` 回到分解的鏡位。
- `props.hook.size`：鉤子大標字級（預設 132）；`hook.kicker` 是大標上面的小標。
- `model.fx.srcPx`：這支片出處列的字級（預設 `LAYOUT_3D.SRC_PX`＝24；留存清單要求 ≥28）。
- `meter` 動作可寫 `h`（小波形卡的高度，預設 104）。
- `cover.frame`：封面的模型停在第幾幀（預設照舊停在聚焦前一幀）。

範例：`videos/sample-tech-anc/script.json`（s1 的 scope＋兩張 stamp＋ribbon、s3 的 steps、s7／s8 的 cross、s9 的 card、s10 的 circle）。validate 會檢查 type、`at`、位置欄位。

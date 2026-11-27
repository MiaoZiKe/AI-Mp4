# 3D 產品台（`stage: "three"`）：資料格式、可用的東西、渲染成本

科技頻道專用。畫面中間是一個 3D 舞台（`@remotion/three`），外面一圈（大標、標籤、字幕、出處）是 HTML。
**產品模型是資料**：零件清單寫在 `videos/<slug>/model.json`（或 `script.json` 的 `model`），引擎讀資料建模。換產品只寫一份新的 `model.json`，不用改 `src/components/three/`。

- 樣片：`videos/sample-tech-3d/`（手機均熱板；`model.json` 有 65 個零件）、`videos/sample-tech-anc/`（耳機主動降噪；示範第五節的「運作動畫」）
- **零件與動作庫（2026/11/16）**：晶圓、晶片、凸塊、TSV、中介層、基板、HBM、吸嘴、手臂、探針、光束、腔體、管線、散熱片、刀片、檢測頭等 20 種零件，和取放／下壓接合／逐層堆疊／切割／掃描／電流／熱擴散等動作預設，寫成資料就能引用（`{ "part": "wafer", … }`、`props.motion`），不用再寫 gen-model／gen-script。見 `docs/three-parts.md`、總表 `docs/three-parts-sheet.png`、示範 `videos/sample-parts/`。
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

## 七、2026/11/14 為 short-tech 第二版加的（都向下相容，沒寫就不作用）

- `props.assemble: { at }`：分解之後再組回去（`explode` 的反向；鏡頭仍是躺下的角度）。運作動畫要在「組好的樣子」上演時用，通常搭配 `shift` 把外層變半透明。
- `pulse` 動作可寫 `steady: true`：不閃，穩定亮著，強度只跟著 `run` 的 `ramp` 進出場（例如電壓維持在高的那段時間）。
- `flow` 動作可寫 `phase`（0–1）：晚一點出發，幾條並排的路徑才不會同時起跑。
- 只在運作時出現的示意層：放在自己的 layer，用 `shift: { layer, at: "start-30", until: "<幕>:<cue>", opacity: 0 }` 先藏起來，到 cue 才浮現；之後再寫一個 `shift` 收掉。
- 深色 HUD 片（頂層 `hud`，`Hud.tsx`）：
  - `meter` 動作寫了 `x`、`y`（畫面像素）就畫成固定在畫面上的讀數條（`sym` 符號、`lo`／`hi` 兩端的字）；長度＝`source` 那個動作這一幀的強度，不標數值。
  - `overlay` 多兩種：`legend`（圖例；`items: [{ text, swatch }]`，`swatch` 寫 `model.palette` 的色名；`x`、`y`、`cols`、`colW`、`size`）、`compare`（左右對照卡；`y`、`h`、`title`、`tag`、`sides: [{ kind: "fin"｜"gaa", title, sub, wrap, leak, note, color }]`，`leak`＝漏電小點的顆數，不要寫 0）。
  - 2D 縮放圖層搬到 `HudArt.tsx`（每一級一張 SVG）；新增的顏色在 `THEME_3D_HUD.art`。
- `scripts/three/scene-html.mjs`：`model.partNames`（零件 id 的開頭 → 名稱）、`model.viewer.hide`（檢視器裡不畫的層）。

## 八、2026/11/14 為 tech-2nm（科技透明圈第一支完整片）加的（都向下相容，沒寫就不作用）

- **頻道皮膚 `hudSkin`**（script.json 頂層）：深色 HUD 片的所有顏色集中在 `src/theme-hud-skins.json`，一套一個鍵；`src/theme.ts` 的 `hudTheme(name)` 把它疊在 `THEME_3D_HUD` 上，`Hud.tsx`／`HudArt.tsx` 透過 `src/components/three/hudSkin.ts` 的 `H` 讀。目前兩套：`deep`（深海青藍＋琥珀，short-tech 原本的樣子；沒寫 `hudSkin` 就是它）、`glass`（「科技透明圈」提案：近黑底、冰藍與白、單一強調色螢光萊姆）。每套可寫的鍵：`bg／grid／line／lineSoft／amber／coral／text／text2／text3／panel／onAccent／glow／hookPlate／card／cardCompare／caption／plateO`、`art`（2D 縮放圖與對照卡）、`parts`（3D 零件色，蓋掉 model.json `palette` 同名的色）。**換色只改 `hudSkin` 一個欄位；要新增一套就在 JSON 加一個鍵**（validate 自動認得）。`scripts/three/scene-html.mjs` 讀同一份。
- `hud.smallPx`：小字下限（圖例、對照卡的副標與註記、儀表的低／高），tech-2nm 寫 30。
- `props.reexplode: { at }`：`assemble` 組回去之後再拆開一次（運作完回頭量尺寸）。
- `props.overlay` 的 `type: "bars"`：橫條對照卡，`rows: [{ label, v（0–1）, v2?（範圍另一端，斜線段）, color?, text, at?, textAt? }]`、`title`、`tag`、`y`。`compare` 的每一邊可寫自己的 `at`（念到才出現）。
- 片尾卡：最後一幕 `silent: true`＋`durationSec`＋`props.endCard: { next?, kicker? }`（只有寫了頂層 `hud` 的片會畫；字讀 `channel.name`／`slogan`）。
- 縮完再拉回去：`props.zoom` 可以 `to` 比較前面的一級（tech-2nm 的 s15 拉回手機），離開 `handoff3D` 那一級後 3D 畫布就不掛，後面每幀回到 2D 的成本。
- 配音：`voice.profile: "tech-report"`（`delivery: "report-tech"`，只送一句：「…語速稍快、語氣沉穩、不拖尾音、不演，直接說：」）。

## 九、2026/11/15 使用者回饋後加的（都向下相容，沒寫就不作用）

- **`hud.layout: "fill"`**（撐滿版面）：數字在 `src/theme.ts` 的 `LAYOUT_3D_FILL`（頁首 228、LOGO 80px、頻道名 64px、舞台 356–1356、字幕框 1372–1628（中文 76px、英文 36px）、出處 1648 起 34px）。`src/components/three/hudSkin.ts` 的 `setHudLayout` 切換，同時把 3D 舞台框告訴 `engine.ts`（`setStage`，標籤投影用）。沒寫＝原本的 `LAYOUT_3D`。
- **版面計算拆到 `src/components/three/hudLayout.ts`**（純計算，不畫）：縮放級數、模型投影範圍（`modelRect`、`modelUnion`）、疊層整理（`arrangeOverlays`：蓋章自動避開模型／HUD 讀數／標籤／儀表，換幕重疊的自動延後進場）、標籤放置（`placeLabels`：整段固定在模型外的空位，只有引線跟著零件）、片尾卡時間表（`ENDCARD`）。疊層寫 `avoid: false` 就不自動挪。
- **`scripts/three/layout-check.mjs <slug>`**：用 esbuild 把上面同一份程式打包到 node 裡逐幀檢查（不開瀏覽器，約 1 秒），validate 對有 `hud` 的片自動跑；寫了 `layout: "fill"` 的片 error 會擋，舊片只出 warning。
- **片尾卡** `endCard.at`（提早開始的 cue）、`endCard.nextAt`（「下一支」最早出現的 cue；一律不早於 LOGO 落定）；中間大標誌的動畫照「圈子打開，你走進來」：圓環從缺口對面往兩邊長（不轉）→ 橘點從缺口外側沿短弧線進來、小回彈 → 圓環線條微粗＋淡色細線外擴（接住）→ 頻道名、底線、slogan、軌跡 → 下一支（規則與時間表見 `docs/channels/tech-daily-playbook.md` 第九節「片尾 LOGO 動畫」）；頁首 LOGO 在片尾卡上也照畫。`endCard.comment`（2～4 字）＝留言關鍵字，片尾卡在「下一支」下方顯示「留言「關鍵字」拿完整資料」（`LAYOUT_3D_FILL.ENDCARD_COMMENT_PX`＝46）。
- **`flow` 動作的電流效果**（`src/components/three/Ops.tsx`，資料寫在 `model.json` 的 `actions`）：
  - `drive: true`：位置用強度的積分（`engine.ts` 的 `op.u`），所以 `run` 的 `ramp` 就是加速／減速的幀數（tech-2nm 寫 13＝約 0.43 秒慢下來停住）；同時密度跟著強度（`minVisible`＝最慢時剩幾成，按固定亂數順序收掉）。
  - `lanes`／`laneGap`／`laneDir`：同一條路徑並排幾道（一片薄片三道＝看起來是一片電子流）；`jitter`：垂直方向的小抖動。
  - `trail`／`trailGap`／`trailColor`：每顆後面的拖尾，間距乘上當下速度（慢下來拖尾縮短、停住收成一點）。
  - `rim`／`rimScale`／`rimO`：每顆外圈的淡光圈（實色球，不是發光濾鏡）。
  - `rest`／`restO`：從開始減速起至少保持 `restO` 不透明度，停住後留 `rest` 幀再淡出。
  - 成本：tech-2nm 第 600–629 幀（三片 × 三道 × 7 顆，各 3 格拖尾）每幀 1696 ms（平行數 1），原本稀疏版同一段 1188 ms；只在電流那 4 秒左右。
  - 儀表的 `source` 指同一個 flow，讀數條和光點用同一份強度。
- **對照卡的漏電**（`compare` 的 `leak`）：改成斷斷續續的小光點（每秒約 leak×0.75 顆、固定亂數間隔、帶 3 格拖尾往基板方向走、出生時一圈小波紋）；鰭式從鰭底部兩側漏，奈米片從最下面那片底下漏。`leak` 不要寫 0。

## 十、2026/11/15 主素材不准被遮（Andy：「避免中間重要的素材被遮擋」）

- `LAYOUT_3D_FILL` 改成：舞台 356–1330，上下讀數帶 `BAND_TOP: 104`／`BAND_BOTTOM: 88`，字幕框 1344–1592（IG／Reels 底部介面 `IG_SAFE_BOTTOM: 1600` 之上），出處 1612 起。
- `HudFrame`：有讀數帶時，層級名、倍率、FIELD 在上帶，尺標與示意圖標示在下帶；`ZoomArt` 只畫在 `artRegion`（兩條帶子中間），中心是那一塊的中心。
- `hudLayout.ts`：`ART_BOX`（2D 圖外框）、`artMainRect`／`modelRect`＝主素材框；`makeYield`＝主素材讓位（觸發物：鉤子、compare／bars／card、固定儀表、找不到空位的蓋章與標籤；出現前 20 幀開始縮小平移到最大空白，±6 幀平滑）；`planHud` 把主素材框、讓位、標籤、蓋章串成一套，Hud.tsx 和 layout-check 共用。讓位的變形同時套在 2D 圖（SVG matrix）、3D 畫布（CSS transform）、標籤引線與尺寸線的錨點。
- layout-check 新規則「主素材遮擋」：任何疊層（含 HUD 讀數帶、鉤子大字、儀表）和主素材框重疊超過主素材框面積 5% → error（寫了 fill 的片）；另查字幕卡下緣 ≤1600。

## 十一、2026/11/15 v6（Andy：「物件非必要不用一直移動」「上下都太多」「2.5D 圖在運作時…搭配 2D 剖析圖」「結尾的 LOGO 動畫使用這個…需要有音效」）

- 撤回第十節的「主素材讓位」：`planHud` 不再縮放、移動主素材，只套全片固定的 `ART_FIT`（2D 圖 `ZoomArt` 乘在倍率上；3D 畫布用 CSS 放大、`dpr` 同步提高避免變糊；標籤引線、尺寸線的錨點跟著同一個變形）。卡片、蓋章、標籤用 `freeSpot` 找空位：主素材外圈是軟障礙（可以蓋到一點，warning），中央區域與其他東西是硬障礙。放不下的卡片最後退路是 `_backdrop`（主素材降到半透明）。
- `LAYOUT_3D_FILL`（v6）：頁首 110、舞台 236–1340（讀數帶上 96、下 80）、字幕框 1352–1600、出處 1634 起、`ART_FIT: 1.14`、`SAFE_TOP: 100`。
- `hud.logoCorner: "left"｜"right"`：頁首 LOGO 放哪一角（預設左上）。
- `props.zoom` 可寫 `out`：停在那一級再往外幾分之一級（例如 s15 拉回手機 `out: 0.75`，手機變小、下方留空白放卡片）。
- overlay `bars` 可寫 `compact: true`：一列一行（名稱｜橫條｜數字），卡片矮約一半。
- **overlay `section`（運作時的 2D 剖面圖）**：`{ type: "section", at, until, x, y, w, h, title, flows: [flow 動作 id…（由下到上一片一個）], gate: "閘極 pulse 的 id", channel: "通道 pulse 的 id", meters: [meter 動作 id…（畫在右側）], labels: { src, drn, gate } }`。畫沿電流方向切開的剖面：左源極、右汲極、中間幾片通道、閘極包住通道（亮度跟 gate 的強度）；電子光點用 3D 那幾個 flow 的同一份數值（`op.u`、`op.k`、drive 的密度與停住規則），2D 路徑是「源極上方往下 → 沿通道 → 汲極往上」，三段長度比照 3D 路徑。剖面圖當卡片排版（不蓋主體中央）。HUD 片才有（`Hud.tsx` 的 `HudSection`）。
- 片尾 `endCard.logoAnim`：`LogoAnims.tsx`（10 種，tech-2nm 用 `transparent`；移植時拿掉了 `transparent` 的繞圈待機動作）。用了 `logoAnim` 時文字照 `ENDCARD_TC`（頻道名逐字、光掃、底線、slogan、軌跡、下一支、留言關鍵字），右下角加淡淡的開口圈浮水印。音效：`scripts/three/sfx-logo-tech.py`（見 playbook 第九節）。

## 十二、2026/11/15 tech-euv v2（Andy：「素材部分需要多點，在更細緻」「運作部分也不能忽略」；都向下相容，沒寫就不作用）

- **新動作 `lpp`**（雷射打錫滴成電漿的循環，`Ops.tsx`）：`{ type: "lpp", layer, at（焦點）, size（錫滴半徑）, halo（電漿閃光大小）, color（錫滴色）, lpp: { drop（錫滴從哪裡掉）, beam（雷射光束起點）, period（一輪幾秒，預設 1.1）, queue（排隊的錫滴數）, pancake（壓扁後半徑）, burst（電漿球半徑）, spray（碎點噴多遠）, pre／main／glow（預脈衝、主脈衝、電漿的色票名）, preR／mainR（光束粗細） } }`。一輪：錫滴排隊落到焦點 → 預脈衝（細）打到、錫滴沿光束方向壓扁成餅 → 主脈衝（粗）→ 電漿膨脹發光、碎點往四周噴、慢慢暗下。時刻在 `Ops.tsx` 的 `LPP`（預脈衝 0.32、主脈衝 0.58），相位 `lppPhase` 由 3D 和 2D 剖面共用。
- **`flow` 的反射衰減**：`keep`（每經過一個反射點剩幾成）、`bounces`（path 的哪幾個點算反射，索引）、`lossFloor`（最暗時的不透明度下限，預設 0.16）。光點過了第 n 個反射點，不透明度與大小照 keep 的 n 次方縮（tech-euv：0.7、11 個反射點，終點約 2%，畫面最暗但看得到）。
- **overlay `section` 的新 `kind`**（`Hud.tsx`，都當卡片排版，避開主素材中央）：
  - `lpp`：雷射打錫滴的 2D 側視（噴嘴、碗形收集鏡、雷射、錫滴→錫餅→電漿），`source`＝lpp 動作 id（同一份相位）；`items: [{ text, at }]` 右側步驟列，現在演到哪一步就亮哪一列（4 列＝落下／預脈衝／主脈衝／發光）。
  - `multilayer`：鉬／矽多層膜剖面。`pairs`（畫幾對）、`stack: { at }`（一對一對由下往上疊，每 2 幀一對，疊完光才打進來）、`legend`、`note`（可換行）、`base`（基板字）、`result`＋`textAt`（右下大字，念到才跳出）、`mo`／`si`／`light`（色票名）。每個交界面反射回一小部分、越深越淡，是示意，tag 寫「示意，不是量測」。
  - `scan`：掃描曝光側視。`mask`／`wafer`＝兩個 vibrate 動作 id（位移用同一個式子），`px`（模型單位換像素）、`ratio`（縮小倍率）、`mirrors`（中間那塊的字）、`labels: { mask, wafer }`、`note`。光從左下斜打到反射式光罩、反射往右下經投影鏡、縮小照到晶圓上的光縫；光縫掃過的地方圖案才印上去，箭頭跟著移動方向。
  - `air`：空氣 vs 真空。灰色粒子讓光走沒多遠就暗掉；`textAt`（例如「真空」）時粒子往上被抽走，光走到底。`labels: { air, vac }`。
  - `path`（第十一節加的光路剖面）新增：節點 `kind: "focus"`（中間焦點：上下兩片隔板中間留孔，不算反射）、`count: { at }`（從 at 起每 3 幀在每個反射點旁跳出 1、2、3…）。
  - 巢狀 cue 一律寫成 `{ at: … }`（engine 只換 `at`／`textAt`／`hiAt` 這幾個鍵；自訂鍵名寫 cue 字串會讓畫面當掉）。
- **HUD 2D 圖**：`hud.levels[].art` 可寫 `litho`（光與線，照真實比例：1 單位＝0.6 nm，193 nm 與 13.5 nm 的波、40 nm 的線、分四次畫的細線）、`none`（不畫；3D 交棒那一級用）。level 可寫 `cues: { 名字: "幕id:cue" }`（Hud.tsx 換成幀交給圖，念到才畫出來）與 `hideInside: true`（外面這一級不是放大鏡，裡面那一級不疊在它正中央）。新圖要在 `hudLayout.ts` 的 `ART_BOX` 加外框。
- **模型產生器**：要算座標的零件（螺栓圈、晶粒格、照鏡面的入射／出射方向算朝向）用一支小程式產生 `model.json`（`videos/tech-euv/gen-model.mjs`，`node videos/tech-euv/gen-model.mjs`）；改模型改產生器，不要手改 json。

### 2026/11/15 tech-euv v3（驗收退件後補的；都向下相容）

- HUD 2D 圖 `wafer`：一片晶圓＋晶粒格（約 90 格）＋右邊「晶片的層」。cues：`tsmc`（標年份與名稱）、`key`（只亮幾層關鍵層）、`small`（掃描線一列列掃過晶粒）、`every`（掃過的格子裡少數變灰打叉，示意，不代表比例）。
- path 剖面的 `count: { at, step, readout: true, note }`：每 `step` 幀跳一個反射編號，右邊讀數跟著乘一次 keep（100%→70%→49%→…→約 2%）並多一根遞減長條；`note` 寫在長條下（例如「估算」）。
- multilayer 的 `split: [{ label, v, color }]`：念到 textAt 長出「入射 100／反射 70／吸收 30」三條長條（取代 result 大字）。
- scan 的 `cmp: { at }`：卡片左邊接回前面的「193 nm 要畫 4 次（四色）／極紫外光 1 次」；note 改放在右上那一列。
- 蓋章 `countTo`＋`countDur`（可加 `countFrom`）：text 裡的 `{n}` 從 countFrom（預設 0）跳到 countTo（例如「每秒 {n} 顆」、「{n} nm」從 40 數到 13）。
- 蓋章想固定在指定位置（例如機台和卡片之間的空帶）就寫 `avoid: false`；freeSpot 會把蓋章挪到「主素材外圈」也算可以，所以要確定不壓機台時用固定位置。

## 十三、運作音效（2026/11/27 Andy：「以後產出所有內容，Claude 這邊都需要在影片上配對應運作上的音效」）

只做後製、不重渲畫面。三支檔：`scripts/three/sfx-synth.py`（通用合成器，吃 cue 表 JSON，不依賴專案檔，別的頻道可單獨用）、`scripts/three/sfx-ops.py`（科技片轉接層，從 storyboard／script／model 自動排 cue 表）、`scripts/three/add-sfx.sh`（混進成片）。依賴只有 python3＋numpy＋ffmpeg；全部程式合成、固定 seed、不用外部音檔。

**流程：雲端渲染完 → 抓成片 → `add-sfx.sh` → 交件**（`make-tech.sh` 先不改）：

```bash
bash scripts/three/add-sfx.sh --tech <slug> out/<slug>.mp4 out/<slug>-sfx.mp4          # 科技片：自動排
bash scripts/three/add-sfx.sh <in.mp4> <cues.json 或 sfx.wav> <out.mp4> [--end 片尾卡秒]   # 通用（其他頻道）
```

混音規則：旁白講話時 sfx 自動壓低 −8 dB；sfx 比旁白低約 10 dB（講話時約 18 dB、整體約 17 dB）；整條 loudnorm 回 −16 LUFS，再接 −4 dBFS 限幅（吃掉 AAC 過衝，成片峰值 ≤ −1 dBFS）；影像串流 copy；片尾卡之後沒有運作音效。成品旁產出 `out/<slug>/sfx-cues.json`（每個音效的時間、類型、來源）與 `sfx-table.json`（cue 表）。

| 聲音 | 對應的動作 |
|---|---|
| motor 低頻嗡聲（隨轉速） | `rotate` 動作（轉軸、輥輪、轉盤），`cut` 刀片 |
| servo 伺服 whir | motion：`pick-place`、`arm-transfer`、`arm-reach`、`scan` |
| hiss 濾波白噪＋開閥／關閥 click | `flow` 顏色 argonC、名稱含 gas／spray／air／cool（氣流、吹淨、噴氣） |
| liquid 粉紅噪＋水滴 | `flow` 顏色 waterD、cuBright（液體噴灑與流動） |
| plasma 電流嗡＋細微劈啪 | plasma 層的 `flow`、`pulse` plasmaC（電漿、高壓） |
| sputter 細碎撞擊 | hitL 層的 `flow`、`pulse` hitC（原子被打出） |
| heat 低頻爐火聲 | `pulse` hotC／moltenC |
| chips 碎屑點擊 | `flow` chipFlake |
| clunk＋slide 金屬撞擊與滑軌 | `explode`／`assemble`／`reexplode`、`shift` 有位移、`press-bond`、`stack-up`（同時動的多層合成一聲） |
| valve 氣動 click | 氣流開關、`press-bond` 壓下放開、`pick-place` 吸附破真空 |
| whoosh 很輕的氣流掃過 | `props.shot` 鏡頭大移動（超過 `SHOT_MIN`；硬切不加） |
| 不加 | 標籤出現、字卡、overlay、reveal、片尾卡 |

生活類（給沒有 3D 模型的頻道，只能手寫 cue 表）：`footstep` 腳步、`door` 開關門、`cup` 杯子、`keyboard` 打字、`pageturn` 翻書、`rain` 雨聲。加新種類：在 `sfx-synth.py` 寫 `fn(dur, **params)` 再 `register("名字", fn, 預設dB)`。cue 表格式：`[{"t": 3.2, "dur": 1.5, "kind": "rain", "gain": 0, "pan": 0.5, "params": {}}]`，格式說明在 `sfx-synth.py` 檔頭。

### 13.1 三種混音取向（2026/11/27 Andy 聽完區段壓低版：「改完之後沒有比較好，幫我找人優化」）

診斷：區段壓低版講話時壓 −19～−29 dB、停頓回到原音量，變成「講話時音效幾乎消失、停頓時冒出來」的另一種斷續；合成音色也偏假。
新檔 `scripts/three/sfx-styles.py`（三種風格＋逐版量測＋對照圖）、`sfx-synth.py` 加「擬真模式」（`REAL`，只在 `--style` 時開，預設音色不變）。
`add-sfx.sh --style A|B|C` 任何位置都能加；不加 ＝ 舊混音（向下相容）。Andy 選定後再改預設。

```bash
bash scripts/three/add-sfx.sh --tech <slug> --style A out/<slug>.mp4 out/<slug>-sfx-A.mp4   # B、C 同理
python3 scripts/three/sfx-styles.py plot <旁白.wav> out/<slug>/sfx-ABC.png A=<A解碼.wav> B=<B解碼.wav> C=<C解碼.wav> --end <片尾卡秒>
```

| 風格 | 做法 | 關卡 |
|---|---|---|
| A 頻段分離 | 音效拆低（<300 Hz）／中（300～4k）／高（>4k）；中頻永遠挖 −13 dB、1～4 kHz 再挖 −22 dB；講話時整體只再輕壓 −5 dB（攻 0.18 s、放 0.9 s）；1～4 kHz 與全頻段各有一道只動最差窗的護欄 | 人聲頻段 1～4 kHz ≥14 dB |
| B 底噪＋重點 | 整片一條穩定機房底噪（棕噪低頻轟＋60／120／180 Hz 風扇泛音＋>5.5 kHz 空氣，1～4 kHz 清空，不隨旁白起伏）；事件音只留 clunk／閥門／thump，自動搬進旁白停頓（可前移 0.3 s、後移 0.9 s；停頓不夠就縮短、降音量保留） | 人聲頻段 1～4 kHz ≥14 dB |
| C 上一版改良 | 講話區段固定壓 −12 dB、放開 1.3 s（停頓多半 <0.8 s，所以實際上整段講話連續壓著，不再冒出來）；不再逐區段變動壓低量，只剩零星尖峰護欄（快壓、0.4 s 放開） | 全頻段 ≥14 dB（同舊版） |

人聲頻段關卡的理由：A、B 把音效推到旁白不用的頻段（低頻嗡聲、高頻嘶聲），旁白清晰度更好，但「全頻段 RMS 差距」會被低頻嗡聲拉低而達不到 14 dB；
清晰度是由 1～4 kHz（子音與可懂度）決定，所以改量這段。只看「旁白在 1～4 kHz 有聲音」的窗（比該頻段最大值低 26 dB 以內）；沒有人聲能量的窗沒東西可遮。
全頻段差距另外當資訊回報（A 另有 8 dB 的次要護欄，不讓低頻蓋到小聲的字）。

擬真音色（三版共用）：①多層疊合（clunk 加低頻本體＋失諧金屬環＋回彈碎片；閥門加低頻「噗」；馬達加失諧雙層拍頻＋抖動；氣流、液體、電漿、爐火加低頻本體）
②隨機微變化（每個 cue 播放速度 ±3%、音量 ±1 dB、左右 ±0.05）③輕微空間殘響（RT 約 0.35 s、濕度 12%）。全部程式合成、固定 seed。

## 十四、念完留白 `holdSec`／`headSec`（2026/11/27 Andy 規範 27：少講多停；選用，沒寫的片完全不變）
- **script.json 每幕可寫**：`headSec`＝開口前只有畫面的秒數；`holdSec`＝本幕念完後只有畫面的秒數（關鍵畫面念完要留 ≥1.2 秒；非爆炸幕上限 2.0 秒）。`genscript.py` 用「整幕秒數 DUR − HEAD − 字數÷4.7」算出 holdSec。
- **無聲估計**：`scripts/three/silent-timeline.mjs` 依這兩欄位排：人聲區間＝[headSec, 幕長 − holdSec]，cue 只在人聲區間內平均分配。
- **有 AI Studio 整篇配音（tts-take → align）**：`scripts/align.mjs` 在 v3 take 模式下，若該幕有 `holdSec`，兩幕人聲間隔＝max(原始間隔, 本幕 holdSec ＋ 下一幕 headSec)（不受 `ALIGN_GAP_MAX` 限制；補的是靜音，不加速不移調）；本幕提早 `headSec` 秒進場。沒寫 holdSec 的片：行為與以前完全相同。
- **有使用者錄音（一幕一段，recording-timeline，影片時間＝錄音時間）**：錄音本身不會有那麼長的停頓，所以多一個選用步驟先補靜音：
  1. `node scripts/three/pad-recording.mjs <slug> audio/<slug>/take.wav <涵蓋幕數>`：強制對齊（本機、不花請求）量出各幕人聲 → 在每段靜音正中間補足 holdSec＋下一幕 headSec 的差額 → 輸出 `take-padded.wav`，並寫 `videos/<slug>/pad-recording.json`（每幕補幾秒、新的人聲區間）。`--bounds <json>` 可直接給 `[{vs,ve},…]`（跳過對齊，測試用）。
  2. `node scripts/dossier/recording-timeline.mjs <slug> audio/<slug>/take-padded.wav <涵蓋幕數>`（已認 `headSec`：本幕提早 headSec 秒進場）。
  3. 之後照原流程渲染，旁白合成用補好的檔。
- 驗證：合成 10 秒正弦波＋三幕假邊界，補完 15.80 秒＝原 10 秒＋補的 5.80 秒（s1＋1.14、s2＋4.2、s3＋0.46），與公式相符。
- 第一支使用：`videos/tech-twequip/`（無聲估計總長 84.9 秒；爆炸幕 s2／s6／s8 的 holdSec 較長，這三幕錄音末尾請留白或交給 pad-recording 補）。

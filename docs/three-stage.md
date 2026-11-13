# 3D 產品台（`stage: "three"`）：資料格式、可用的東西、渲染成本

科技頻道專用。畫面中間是一個 3D 舞台（`@remotion/three`），外面一圈（大標、標籤、字幕、出處）是 HTML。
**產品模型是資料**：零件清單寫在 `videos/<slug>/model.json`（或 `script.json` 的 `model`），引擎讀資料建模。換產品只寫一份新的 `model.json`，不用改 `src/components/three/`。

- 樣片：`videos/sample-tech-3d/`（手機均熱板；`model.json` 有 65 個零件）
- 程式：`src/components/three/model.ts`（資料 → 幾何、材質、紋理）、`engine.ts`（時間與姿態）、`Scene.tsx`（3D 畫面）、`ThreeVideo.tsx`（HTML 外圈與 2D 特效）
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

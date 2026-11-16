# 科技片零件與動作庫（`scripts/three/parts/`）

目的：之後每支科技片（`stage: "three"`）**只寫資料**（`model.json`＋`script.json`），不再逐支寫 `gen-model.mjs`／`gen-script.mjs`。
零件的細節（倒角、網格線、微凸塊、螺栓圈、層疊）與動作（取放、下壓、電流、熱擴散…）已經抽進庫裡，**素材細緻度與「每支 ≥3 段跟旁白同步的運作動畫」不降**。
總表圖：`docs/three-parts-sheet.png`（上 20 種零件，下 5 格動作畫面）。示範片：`videos/sample-parts/`（14.4 秒無聲，只有 model.json＋script.json 兩份資料）。

## 運作方式（不改引擎）

- 庫在 Node 端把資料「展開」成引擎本來就認得的 `parts／layers／anchors／actions` 與 `props.shift／run`，**`src/components/three/` 完全沒動**，舊片不受影響（沒用到庫的資料原樣通過）。
- 展開點（已接好）：`scripts/lib.mjs`（render／still／peek）、`validate-three.mjs`、`layout-check.mjs`、`rect-probe.mjs`、`scene-html.mjs`。
- 程式：`parts.mjs`（零件）、`motions.mjs`（動作）、`materials.mjs`（共用色票與材質）、`index.mjs`（展開）、`sheet.mjs`＋`sheet-compose.py`（做總表圖）。

## 一、model.json 怎麼寫零件

```json
{ "parts": [ { "part": "wafer", "id": "wf", "pos": [-6, 0, 0], "r": 3, "bad": 6, "pick": [2, 0] } ],
  "actions": { "cur": { "preset": "current", "layer": "bp", "path": [[4, 0.9, 0], [4, 0.5, 0]] } } }
```

- 每個零件：`part`（名稱）＋`id`（實例名，預設＝名稱）＋`pos`（原點＝**底面中心**，x 向右、y 向上、z 向觀眾）＋該零件的參數。可與一般 `{ shape: … }` 零件混著寫。
- 共通參數：`layer`（層 id，預設＝id）、`z`／`k`（層的組裝位置與分解位移，預設 0）、`bg: true`（背景層）、`label: { dx, dy }`（標註線偏移）、`mats: { 短名: "自己的材質鍵" }`（換材質）。
- 展開後：零件 id＝`<id>_<名稱>`（例 `wf_body`）、層 id＝`<id>`、標註點鍵＝`<id>`（以及 `<id>_<名>`）、零件自帶動作＝`<id>_<名稱>`（例 `nz_suck`）。
- 色票／材質：庫的短名展開成 `lp_`／`lib_` 前綴並自動補進 `palette`／`materials`；`model.json` 自己有同名鍵就以自己的為準。
- `"@id"`、`"@id:名稱"`：寫在 actions 的 `parts` 裡，展開成該實例（開頭符合名稱）的所有零件 id，例 `"parts": ["@wf:dies"]`。

## 二、零件參數（單位跟著該片，慣例 1＝1 cm；括號內是預設）

| 零件 | 參數 | 自帶動作（`<id>_…`） |
|---|---|---|
| `wafer` 晶圓 | `r`(3.6) `t`(.06) `step`(.62 晶粒間距) `gap` `bad`(壞晶粒顆數，固定亂數) `pick`([i,j] 被吸走那顆，獨立層 `<id>_pick`) `pickT` `chuck`(true) `postH` | `badGlow`（壞晶粒閃紅） |
| `die` 晶片 | `w`(2.6) `d`(3.3) `t`(.32) `kind`("hbm" 換記憶體配色) `grid` `bumps` `pitch` | `hot`（發熱閃橘） |
| `bumps` 凸塊陣列 | `kind`(micro／c4／ball) `n`([10,8]) `pitch` | `melt`（回流熔化發光） |
| `tsv` 矽穿孔 | `line`([x0,z0,x1,z1]) `n`(40) `h`(.08) `w` 或 `grid`([nx,nz])＋`pitch` | `glow` |
| `interposer` 中介層 | `w`(8.1) `d`(5.2) `t`(.08) `rdl`(28 條) `tsv` `tsvN` | `rdlGlow` |
| `substrate` 基板 | `w`(11) `d`(8.2) `t`(.55) `pads`([27,17] 或 false) `pitch` `caps` | — |
| `pcb` 主機板 | `w`(12.2) `d`(9.4) `t`(.3) `pads` | — |
| `hbm` 記憶體堆疊 | `w`(1.1) `t`(.32) `n`(12) `slices`(每片一層 `<id>_s0…`) | `glow` |
| `stack` 逐層堆疊 | `layers`([{ t, mat, w, d }] 由下到上，每層一個層 `<id>_l0…`) `w` `d` `gap` | — |
| `nozzle` 吸嘴 | `scale`(1)（原點＝嘴底） | `suck`（嘴尖亮綠） |
| `arm` 機械手臂 | `h` `l1` `l2` `drop` `reach`(28°)（夾爪獨立層 `<id>_grip`） | `reach`（吊臂轉動） |
| `probe` 探針頭 | （原點＝針尖） | `test`（測試電流流下） |
| `beam` 光束 | `from`／`to`（**絕對座標**）`r`(.06) `color`(beam／beamEuv) `halo` | `glow`、`ray`（光點沿光束跑） |
| `chamber` 腔體 | `r`(2.6) `len`(6) `bolts`(14)（沿 x 躺著，原點＝圓筒中心） | — |
| `pipe` 管線 | `path`（**絕對座標**折線）`r`(.14) `mat` `flowColor` | `flow` |
| `heatsink` 散熱片 | `w` `d` `base` `fins`(9) `finH` `finT` | `heat`（鰭片發橘）、`waves`（熱浪） |
| `rail` 輸送軌 | `len`(12) `w`(2.1) `legH`（原點＝軌面中心） | — |
| `bin` 廢料盒 | `w` `d` `h` | — |
| `blade` 切割刀片 | `r`(1.2) `t` `rps`(3)（立在 xy 平面，原點＝圓心） | `spin` |
| `sensor` 檢測頭 | `ray`(0＝不要光束) `sweepAmp`(2.2) `sweepFreq`(.6)（原點＝鏡頭底面） | `sweep`（左右掃）、`glow` |

要新增零件：在 `parts.mjs` 的 `PARTS` 加一個 `(o, c) => {…}`（用 `c.P(名稱, 零件定義)`、`c.anchor`、`c.act`、`c.ids`、`c.outline`），然後把它補進 `sheet.mjs` 的清單重跑總表。

## 三、動作預設

### 模型層（model.json 的 `actions`，寫 `{ "preset": … }`）

| preset | 參數 | 展開成 |
|---|---|---|
| `current` 電流流動 | `layer` `path`(絕對座標折線) `n` `lanes` `laneGap` `laneDir` `size` `rate` `color` `drive` | flow（帶拖尾與外圈） |
| `stream` 流體／資料 | `layer` `path` `n` `shape`(arrow) `color` | flow |
| `heat-spread` 熱擴散 | `from` `reach` `count` `parts`（同時發橘光） `color` | wave（＋`<鍵>_glow` pulse） |
| `glow` 發光 | `parts` `color` `steady` `glow` | pulse |
| `spin`／`shake` | `parts` `axis` `rps`／`amp` `freq` | rotate／vibrate |

### 腳本層（script.json 某一幕 `props.motion: [ … ]`，展開成 `props.shift`＋`props.run`）

`at`／`until` 一律是 cue（`"cue"`、`"cue+8"`、`"s4:cue-4"`）；內部偏移是幀（30 fps），參數 `k` 可整體放慢。

| preset | 做什麼 | 參數 |
|---|---|---|
| `pick-place` 取放 | 吸嘴下 → 吸住 → 抬 → 平移 → 對位下降 → 放開回彈（約 52 幀） | `tool`(吸嘴層) `item`(被吸的層) `at` `to`([dx,dz]) `down` `lift`(1.5) `dyEnd`(放下後高度差) `suck` `k` |
| `press-bond` 下壓接合 | 工具受力下壓回彈、下面的層被壓一下、凸塊熔化發光、電流通過（約 40 幀） | `tool` `at` `down` `press`[層] `melt`[動作 id] `current`[動作 id] |
| `stack-up` 逐層堆疊 | layers 由下到上依序落下（重力、小回彈、壓下層） | `layers` `at` `gap`(4) `from`(1.4) `hide`(start-2) `base` |
| `cut` 切割 | 刀片沿 dx／dz 切過去並旋轉；切完 `after` 的層分開 | `blade` `at` `len`(60) `dx` `dz` `after`[{layer,dx,dz,dy}] |
| `scan` 掃描檢測 | 檢測頭沿 dz 掃過、左右掃、發光；掃到一半 `flag` 動作亮起 | `tool` `at` `len`(90) `dz` `dx` `flag` |
| `advance` 輸送前進 | layers 整排前進一格 | `layers` `at` `dx` `dz` `dur` |
| `reveal` 出現／消失 | 藏到 `at` 才浮現；`off` 再藏 | `layers` `at` `hide` `off` |
| `arm-reach` 手臂取放 | 吊臂轉（`<arm>_reach`）、夾爪下伸 | `arm` `at` `until` `grab` `item` `dx` `dz` |
| `run` 一次觸發多個動作 | 例如熱擴散＝`die_hot`＋`hs_heat`＋`hs_waves` | `ids` `at` `until` `stagger` `ramp` |

新增動作預設：在 `motions.mjs` 的 `MOTIONS`（腳本層）或 `ACTION_PRESETS`（模型層）加一個函式即可。

## 四、新片的最短流程

1. `videos/<slug>/model.json`：`parts`（零件實例）＋`actions`（preset）＋`pose`／`camera`／`fx`（照 `videos/sample-parts/model.json`）。
2. `videos/<slug>/script.json`：每幕 `props.motion` 叫動作預設、`shot` 排鏡頭、`labels`／`overlay` 照原本寫法。
3. `node scripts/validate.mjs <slug>`、`node scripts/three/layout-check.mjs <slug>`，之後走原本的配音／渲染流程（不用跑任何 gen 程式）。
4. 看展開後的完整資料：`node -e "import('./scripts/three/parts/index.mjs').then(async m=>console.log(JSON.stringify(m.expandModel(JSON.parse(require('fs').readFileSync('videos/<slug>/model.json','utf8'))),null,1)))"`。

## 五、已知限制與還沒做的

- 展開在 Node 端；`script.json` 內嵌 `model` 時也會展開，但**不認 `parts` 裡以外的位置**寫 `part`。
- `rotate` 動作的 `pivot` 引擎只吃 x、y（繞 z 軸轉），所以 `arm` 是上下擺（不是水平迴轉）、`blade` 是立著轉。
- 合併複製（`at`）的零件旋轉時繞整組的原點轉，所以輸送軌滾輪沒有自帶轉動動作。
- 還沒抽的（packaging／euv 專用）：光罩台、反射鏡面陣列、雷射打錫滴（lpp 已是引擎動作，只差零件）、對位框／光罩框（`rectLines`）。需要時照第二節末段加進 `PARTS`。
- tech-packaging／tech-euv／tech-yield 的 gen 程式**沒有改**（另有人在用）；要搬進庫時逐支把 gen-model 換成 parts 資料即可，座標與 id 要核對。

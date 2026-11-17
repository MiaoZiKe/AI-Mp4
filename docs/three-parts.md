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
| `nozzle` 吸嘴／熱壓頭 | `scale`(1)（原點＝嘴底） | `suck`（嘴尖亮綠）、`heat`（嘴尖、嘴身、升降臂發橘，熱壓接合用） |
| `arm` 水平多關節手臂（SCARA） | `h` `l1` `l2` `drop` `gw`(.5 要夾的東西寬度) `to`([dx,dz] 放料位相對取料位，解析式兩連桿反運動學算 j1、j2；超出可達範圍或關節上下限直接報錯) 或 `j1` `j2`(度) `elbow`(1／-1 肘朝哪折)（原點＝底座底面，伸直時夾爪在 x＝l1＋l2＝取料位） | 不是 actions，是**關節鏈** `model.kin.<id>`：肩 `j1` → 肘 `j2` → 腕 `j3`（抵消，夾爪方向不變）→ 升降 `lift` → 兩指 `claw`，每節是上一節的子物件（見第六節）。由 `arm-transfer`／`arm-reach` 驅動 |
| `probe` 探針頭 | （原點＝針尖） | `test`（測試電流流下） |
| `beam` 光束 | `from`／`to`（**絕對座標**）`r`(.06) `color`(beam／beamEuv) `halo` | `glow`、`ray`（光點沿光束跑） |
| `chamber` 腔體 | `r`(2.6) `len`(6) `bolts`(14)（沿 x 躺著，原點＝圓筒中心） | — |
| `pipe` 管線 | `path`（**絕對座標**折線）`r`(.14) `mat` `flowColor` | `flow` |
| `heatsink` 散熱片 | `w` `d` `base` `fins`(9) `finH` `finT` | `heat`（鰭片發橘）、`waves`（熱浪） |
| `rail` 輸送軌 | `len`(12) `w`(2.1) `legH` `rps`(1.1)（原點＝軌面中心）。每支滾輪是獨立零件（`<id>_r0…`，上面一條紅標記 `rmark`） | `roll`（全部滾輪各繞自己的軸轉，起轉加速、停轉減速；rps ≈ 帶速 ÷ 滾輪周長 0.82） |
| `bin` 廢料盒 | `w` `d` `h` | — |
| `blade` 切割刀片 | `r`(1.2) `t` `rps`(3)（立在 xy 平面，原點＝圓心；兩側各一支冷卻水管 `jet0／jet1`） | `spin`（起轉加速、停轉減速）、`coolant`（水珠沿水管流向刀口，跟著刀片的層移動） |
| `maskstage` 光罩台（抽自 tech-euv） | `w`(15 移動台寬) `len`(24 導軌長) `mw`(6.4 光罩邊長)（原點＝光罩下表面中心；上方導軌＋成排磁鐵＋移動台＋馬達，下方護膜框） | `scan`（移動台沿 x 來回，amp／freq）、`drive`（磁鐵與馬達通電發光） |
| `mirrorarray` 反射鏡面陣列（抽自 tech-euv 場鏡面／瞳鏡面） | `w`(4.2) `n`(4) `fs`(.9 每片邊長) `tilt`(度，整片繞 z 傾斜) `freq`（原點＝鏡面板中心） | `glint`（鏡面亮起） |
| `alignframe` 對位框（抽自 tech-packaging 的 rectLines） | `w` `d` `t`(.03 線寬) `dash`(0＝實線，>0＝虛線每段長)（水平放，原點＝框中心） | `glow`（框閃） |
| `sensor` 檢測頭 | `ray`(0＝不要光束) `sweepAmp`(2.2) `sweepFreq`(.6)（原點＝鏡頭底面） | `sweep`（左右掃）、`glow` |

`c.P(名稱, { …, at: […], split: true })`：`at` 的每一份各自成為獨立零件（`<名稱>0、<名稱>1…`），旋轉時各繞自己的位置（輸送軌滾輪就是這樣）；沒寫 `split` 的 `at` 照舊合併成一個零件（繞整組原點）。

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

引擎 `rotate`（2026/11/17 擴充，沒用到新欄位的舊動作一律走原路，畫面不變）：`pivot` 可寫 `[x,y,z]`（3D 轉軸）、`axis` 任意軸；`pivots`＝`{零件id: [x,y,z]}`（每個零件自己的轉軸，優先於 `pivot`）；`chain`＝同一零件有多個 rotate 時依動作順序（先寫的在外層）串成關節鏈、各繞自己的轉軸（肩→肘→腕）；`hold`＝`angle` 轉到後 `until` 也不轉回來（被搬走的零件）；`rampSpin`＝`rps` 的轉速跟著進出場強度（起轉加速、停轉減速）。

### 腳本層（script.json 某一幕 `props.motion: [ … ]`，展開成 `props.shift`＋`props.run`）

`at`／`until` 一律是 cue（`"cue"`、`"cue+8"`、`"s4:cue-4"`）；內部偏移是幀（30 fps），參數 `k` 可整體放慢。

| preset | 做什麼 | 參數 |
|---|---|---|
| `pick-place` 取放 | 下降 → 真空吸附（嘴尖亮、停）→ 上升 → 平移 → 停住（視覺定位）→ 微調對位 → 下降 → 破真空放開（零件落下、被壓一下）→ 上升 → 回原位（約 126 幀） | `tool` `item` `at` `to`([dx,dz]) `down` `lift`(1.5) `dyEnd` `press`[被壓的層] `align`([ex,ez]｜false) `suck` `k` |
| `press-bond` 熱壓接合 | 壓頭先加熱（橘光漸亮）→ 緩降接觸（被壓一下）→ 保壓（被壓的層微微下沉、凸塊熔化）→ 冷卻（橘光慢退）→ 才抬起 → 通電（約 100 幀） | `tool` `at` `down` `press`[層] `sink`(.015) `hold`(54 幀) `melt`[動作 id] `current`[動作 id] `heat`(預設 `<tool>_heat`) |
| `stack-up` 逐層堆疊 | 每層：從上方落下、帶橫向偏差在著地前修正（對位）→ 著地、前一層被壓一下 → 接合動作亮起 | `layers` `at` `gap`(16) `from`(1.4) `align`([ex,ez]｜false) `bond`[每層的動作 id] `hide` `base` |
| `cut` 切割 | 刀片先空轉升速、冷卻水先開 → 下刀 → 沿切割道走（緩入緩出）→ 抬刀 → 退回、降速；切完 `after` 的層分開 | `blade` `at` `len`(60) `dx` `dz` `depth`(.35) `coolant`(預設 `<blade>_coolant`) `after`[{layer,dx,dz,dy}] |
| `scan` 掃描檢測 | 檢測頭沿 dz 掃，左右掃描；掃到缺陷就停下、標記亮起，停後繼續掃到底 | `tool` `at` `len`(90) `dz` `dx` `stops`([.5] 停在全程幾成) `stop`(12 幀) `flag`[每個停點亮起的動作 id] |
| `arm-transfer` 手臂搬運 | 夾爪下伸 → 兩指夾緊（此刻物件掛到夾爪上）→ 抬起再多抬 `raise` → 肩肘腕同時水平迴轉（緩入緩出）→ 下放到放料面 → 兩指張開（此刻放下、被壓一下）→ 抬起 → 手臂轉回（約 108 幀） | `arm` `at` `item`(被夾的層) `grab`(預設依手指底與物件底自動算) `put`(0) `raise`(.15) `press` `k` |
| `advance` 輸送前進 | layers 整排前進一格 | `layers` `at` `dx` `dz` `dur` |
| `reveal` 出現／消失 | 藏到 `at` 才浮現；`off` 再藏 | `layers` `at` `hide` `off` |
| `arm-reach` 手臂擺動 | 肩轉 `angle` 度、夾爪下伸再抬起、轉回（不夾東西） | `arm` `at` `angle`(28) `grab`(.5) `k` |
| `run` 一次觸發多個動作 | 例如熱擴散＝`die_hot`＋`hs_heat`＋`hs_waves` | `ids` `at` `until` `stagger` `ramp` |

新增動作預設：在 `motions.mjs` 的 `MOTIONS`（腳本層）或 `ACTION_PRESETS`（模型層）加一個函式即可。

## 三之一、動作的「真實機台怎麼做」與來源（2026/11/17 查證，節拍照這個寫）

每個動作的位移都是緩入緩出（加速、減速）、中間有停頓、碰到東西有反作用；幀數是影片節奏，不是機台實際秒數。

| 動作 | 真實機台怎麼做 | 來源 |
|---|---|---|
| 取放 `pick-place` | 吸嘴（collet）用真空吸起晶片，視覺系統先量晶片姿態、再用向下看的相機算出 X／Y 要補多少，放下時要控制力道；一輪是「拾取 → 放置 → 固化」 | [Mycronic 光電封裝 die bonding](https://www.mycronic.com/globalassets/pdf/product-areas/die-bonding/technical-articles/high-precision-die-bonding-for-photonics-packaging.pdf)、[SemiconductorX 晶片黏著](https://semiconductorx.com/mfg-back-end-die-attach.html)、USPTO 12027403 |
| 熱壓接合 `press-bond` | 壓頭真空吸住晶片、下降到接觸，加熱同時加壓並**保持（dwell）**，典型 275–300°C、數十秒；到時間後壓頭先降溫到焊料熔點以下、焊點凝固，才放掉真空抬起。壓力約 0.05–1000 N 視晶片大小，畫面只標示意、不標數字 | [Wikipedia 熱壓接合](https://en.wikipedia.org/wiki/Thermocompression_bonding)、[Intel／ASM TCB（Semiconductor Digest）](https://sst.semiconductor-digest.com/insights-from-leading-edge/2015/07/iftle-247-ectc-part-3-more-thermo-compression-bonding-from-intel-and-asm)、[iConnect007 TCB](https://iconnect007.com/article/129475/zulkis-pcb-nuggets-thermal-compression-bonding-for-extra-fine-pitch-flip-chips/129478/pcb)、USPTO 8163598 |
| 逐層堆疊 `stack-up` | HBM 等堆疊是一顆一顆用 TCB 疊：每顆都要對位、加熱加壓接合，下一顆才上；單顆能壓平、疊上去的下一顆不容易壓平（翹曲）；一台 TCB 約 500–1000 顆／小時 | [Semiconductor Digest：HBM 堆疊接合](https://sst.semiconductor-digest.com/insights-from-leading-edge/2018/02/iftle-370-3d-asip-part-3-bonding-and-assembly-in-hbm-memory-stacks)、[SemiEngineering：HBM4 仍用微凸塊](https://semiengineering.com/hbm4-sticks-with-microbumps-postponing-hybrid-bonding/) |
| 切割 `cut` | 刀片主軸高速旋轉（約 1.5–6 萬 rpm，依材料），**一定要有 DI 純水冷卻**（降溫、沖走碎屑、延長刀壽命）；刀片下刀切進切割道、沿道走（進給約 5–120 mm/s），深度要切穿晶圓並略入膠膜 | [UKAM 晶圓切割實務](https://ukam.com/practical-guide-to-semiconductor-wafer-dicing-materials-blades-and-process-optimization/)、[Semiconductor Digest 切割](https://sst.semiconductor-digest.com/?p=34110)、[DISCO DFD6342](https://disco.co.jp/eg/products/dicer/dfd6342.html) |
| 掃描檢測 `scan` | 載台連續移動、相機與閃光同步拍每一區，與標準晶粒比對找異常，建立缺陷圖；缺陷之後送複檢（載台把缺陷移到相機下）；已標記（inked）的壞晶粒不再檢 | USPTO 9464992、6826298（自動晶圓缺陷檢測） |
| 手臂搬運 `arm-transfer` | 晶圓搬運機器人是水平多關節（SCARA）：三個旋轉關節軸都垂直、各有馬達，手端的末端執行器水平移動；手以真空（負壓）吸住晶圓 | USPTO 11427412、12434378（水平多關節基板搬運機器人） |
| 輸送滾輪 `roll` | 滾輪表面速度＝輸送帶速度，起停有加減速 | 一般輸送機原理（無單一來源；rps ≈ 帶速 ÷ 滾輪周長） |

## 四、新片的最短流程

1. `videos/<slug>/model.json`：`parts`（零件實例）＋`actions`（preset）＋`pose`／`camera`／`fx`（照 `videos/sample-parts/model.json`）。
2. `videos/<slug>/script.json`：每幕 `props.motion` 叫動作預設、`shot` 排鏡頭、`labels`／`overlay` 照原本寫法。
3. `node scripts/validate.mjs <slug>`、`node scripts/three/layout-check.mjs <slug>`，之後走原本的配音／渲染流程（不用跑任何 gen 程式）。
4. 看展開後的完整資料：`node -e "import('./scripts/three/parts/index.mjs').then(async m=>console.log(JSON.stringify(m.expandModel(JSON.parse(require('fs').readFileSync('videos/<slug>/model.json','utf8'))),null,1)))"`。

## 五、已知限制與還沒做的

- 展開在 Node 端；`script.json` 內嵌 `model` 時也會展開，但**不認 `parts` 裡以外的位置**寫 `part`。
- `split` 的零件每份各是一個網格（滾輪 n 支＝2n 個零件），數量很大時渲染會慢，輸送軌預設約 0.7 間距一支。
- 手臂的 `to` 超出可達範圍或關節上下限會直接報錯；搬運路徑是「關節空間內插」（三個關節同時緩入緩出），夾爪走的是一段弧線，不是直線；路上有東西擋著要靠 `raise` 抬高，`kinematics-check` 會抓到穿模。
- 穿模檢查用包圍盒（每個零件、每一份 `at` 各一個盒子），斜著的長桿盒子會比實物大一點，偶爾會把「很近但沒碰到」判成穿模；遇到時把東西挪開一點，不要調門檻。
- 零件總表圖 `docs/three-parts-sheet.png` 還是 20 種零件的舊版，新零件（光罩台、鏡面陣列、對位框）尚未補進 `sheet.mjs` 重跑。
- tech-packaging／tech-euv／tech-yield 的 gen 程式**沒有改**（另有人在用）；要搬進庫時逐支把 gen-model 換成 parts 資料即可，座標與 id 要核對。雷射打錫滴（lpp）已是引擎動作，只差零件。
- 這次引擎改動的相容策略：只有動作寫了 `pivots`／`chain`／3D `pivot`（長度 3）／`hold`／`rampSpin` 才走新路，其餘與舊版逐行相同（舊片 tech-offer 的 rotate 也不受影響）。

## 六、旋轉為什麼容易出錯、現在怎麼防（2026/11/17，回答 Andy：「旋轉部分沒做好 請確實查證，另外 旋轉是不是很容易出錯?」）

**是，很容易錯，而且這次真的錯了。** 我逐幀把每一節的位置算出來對過，sample-parts 手臂段（舊版約 15.5～21.5 秒）有三個錯：

1. **前臂脫節、飄在空中**：程式裡一個「同一個物件被兩個地方共用」的錯（`Ops.tsx` 把第一個關節的轉動直接拿來當累積轉動，下一個關節乘上去時，把第一個關節的角度也一起改掉），結果大臂以後的零件被轉了兩次肩關節的角度。肩轉 35 度、肘轉 30 度時，前臂的位置差了約 1.7 公分（畫面上就是整段離開手肘）。
2. **晶粒沒有跟著夾爪走**：被夾的晶粒是用「自己繞同樣的轉軸再轉一次」去模仿跟著走，可是它在輸送帶上已經往前移了 3 公分，那段位移沒算進轉動，所以轉到的地方和夾爪差一截，留在輸送帶附近；夾爪本身也只是整層往下移，不在關節鏈裡。
3. **看起來穿過綠板子、晶粒像長條**：其實是第 1 點的前臂被甩到板子那邊；晶粒本身也太薄太扁（0.44×0.5、厚 0.16，旁邊又有脫節的長桿），一眼看不出是一顆晶粒。

**為什麼旋轉特別容易錯（白話）**：
- 轉動有順序，先轉肩再轉肘，和先轉肘再轉肩，結果不一樣；平移就沒有這個問題。只要順序或「繞哪一點轉」差一點，末端就差很多（臂越長差越多）。
- 一節接一節的東西，子節應該「坐在」父節上跟著走。如果每一節各自算自己的轉動，只要有一節算錯，畫面上就是斷開，而且**靜止時完全看不出來**（角度 0 時怎麼算都對），只有轉起來才露餡。這次就是這樣：截圖第一格是對的。
- 被夾的東西在夾住前屬於輸送帶、夾住後屬於夾爪、放開後屬於板子，「屬於誰」換了三次，每次換手都要接得上，不然會跳一下或留在原地。

**現在怎麼做**：
- **真正的父子階層**（`src/components/three/kin.ts`）：肩 → 肘 → 腕 → 升降 → 兩指，每一節的位置＝上一節的位置 × 自己的轉動（等同 three.js 的群組一層包一層），角度只在自己的座標裡轉。子節是「掛」在父節上，數學上不可能脫開。
- **夾取就是換掛**：兩指夾緊那一幀，把晶粒當下的位置記成「相對夾爪」的位置，之後晶粒＝夾爪位置 × 這個相對位置；兩指張開那一幀起停在原地。世界座標連續，不會跳。
- **反向運動學**用解析式兩連桿公式（給放料位置自動算肩、肘角度，腕自動抵消），每個關節有上下限，超出就在展開時報錯；搬運時夾爪多抬 `raise` 避開路上的東西。
- **畫面和檢查用同一份算法**（`src/components/three/pose.ts`）：檢查看到的位置就是畫面上的位置。
- **自動檢查** `node scripts/three/kinematics-check.mjs <slug>`（`npm run validate` 會自動跑）：每 2 幀算每一節，① 父節端點和子節基點距離要 <0.5% 臂長、轉軸點要真的落在兩節上；② 夾住到放開之間，夾持點要在晶粒上（≈0）；③ 手臂各節（含正被夾著的晶粒）的包圍盒不能和其他零件交叉；④ 關節不能超出上下限。
- **檢查真的抓得到**：`node scripts/three/kinematics-check.mjs --selftest` 用 6 個故意做壞的模型測：轉軸點放錯、放料板太高（穿模）、晶粒不在夾爪下面（沒夾住）、關節各自轉沒有父子階層、11/17 之前的舊算法，全部都要被抓到；好的模型要 0 error。
- **舊片不受影響**：tech-euv、tech-yield、tech-packaging、sample-tech-anc、tech-offer 五支每 3 幀把所有零件的位置、轉向算出來，和改之前逐一比對，差異 0。

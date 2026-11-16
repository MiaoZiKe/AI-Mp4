// node videos/tech-packaging/gen-script.mjs → 寫 videos/tech-packaging/script.json（畫面、疊層、鏡頭、物理都在這支；改腳本改這支）
// 規格：videos/tech-packaging/device-spec.md（以它為準）；念稿：docs/prompts/tech-packaging-旁白.txt（不改）。
// 鏡頭（整個世界固定轉 −30°、俯角約 35°，主素材不轉、不縮放）：PK＝封裝（s1–s4、s7–s9）；KG＝已知良品挑選站（s5）；XS＝晶片與 HBM 交界（s6）；FULL＝全貌（s10）。
import fs from "node:fs";
import { DIEX, HBM_LAYERS, SLICE_LAYERS, SPLIT, KCH, KP, PITCH, SLOT, BIN, RAIL_Y, KCT, PROBE_TIP, NOZ_TIP, H } from "./gen-model.mjs";
const R = new URL(".", import.meta.url).pathname;
const S = (id, beat, para, narration, zh, en, keywords, cues, props, sources, extra = {}) => ({ id, beat, para, narration, tts: narration, subtitle: { zh, en }, keywords, cues: cues.map(([id, text]) => ({ id, text })), component: "ThreeScene", props, sources, ...extra });
const tag = (at, until, text, x, y, color = "blue", size = 30, more = {}) => ({ type: "stamp", style: "tag", at, until, text, x, y, color, size, ...more });
const stamp = (at, until, text, x, y, color = "amber", size = 64, rot = -5, more = {}) => ({ type: "stamp", at, until, text, x, y, color, size, rot, ...more });
const hide = (layer, at, until, dur = 2) => ({ layer, at, until, opacity: 0, dur });
const R3 = (x) => Math.round(x * 1000) / 1000;

// 鏡頭
const PK = { x: 0, y: -1.15, d: 31, elev: 35 }, KG = { x: 41.0, y: -2.3, d: 35, elev: 40 }, XS = { x: 2.2, y: -0.9, d: 18, elev: 36 }, FULL = { x: 0, y: -3.3, d: 46, elev: 32 };
const shot = (at, c, dur = 16) => ({ at, dur, ...c });

const MOD = ["ip", "c4", "dieA", "dieB", ...HBM_LAYERS, ...SLICE_LAYERS]; // 中介層模組（s10 一起拿起來、放下）
const HBM_ALL = (i) => (i === SPLIT ? [`hbm${i}`, ...SLICE_LAYERS] : [`hbm${i}`]);
// 「一開始就藏起來」：s1 開場前就是 0 透明度
const H0 = (layer, until) => hide(layer, "s1:start-40", until, 2);

// ── s2 組裝：晶片拿起（往上、淡出）→ 念到「平放」受重力落下、回彈、下面被壓一下；HBM 依序落 ──
const fall = (layer, until, dy, bounce, press = ["ip", "c4"], pressAmt = 0.012) => ({ layer, at: "s2:start-2", until, dy, opacity: 0, dur: 9, fallIn: true, bounce, press, pressAmt });
const s2Shift = [
  fall("dieA", "flat-2", 1.4, 0.03), fall("dieB", "flat+2", 1.4, 0.03),
  ...Array.from({ length: 8 }, (_, i) => HBM_ALL(i).map((l) => fall(l, `mem+${i * 4}`, 1.0, 0.06, ["ip", "c4"], 0.006))).flat(),
  H0("align", "s2:start"), hide("align", "mem+44", "s11:end+400", 6),
];

// ── s5 運作 A：已知良品挑選（物理：輸送等速、探針受力下壓＋彈簧回彈、吸嘴梯形速度、壞的推出去走拋物線掉進盒子） ──
// kc0＝這次測到好的那顆、kc1＝壞的那顆。先前進一格（kc0 到探針下）→ 測（綠）→ 再前進一格（kc0 到吸取站、kc1 到探針下）→ 吸起放到中介層晶圓；kc1 測（紅）→ 推出去掉進廢料盒
const adv = (at) => Array.from({ length: KCH }, (_, i) => ({ layer: `kc${i}`, at, dx: PITCH, dur: 10 })); // 輸送軌整排前進一格
const pickDy = R3(NOZ_TIP - (RAIL_Y + KCT)); // 吸嘴往下多少才碰到晶片頂面
const toSlot = [R3(SLOT[0] - KP.pickX), R3(SLOT[1])];
const LIFT = 1.5;
const s5Shift = [
  ...adv("start+2"), ...adv("test+12"),
  // 探針：念到「先測過」受力下壓（加速）、碰到晶片後彈簧壓縮回彈，測完抬起；壞的那顆再壓一次
  { layer: "probe", at: "test-6", until: "test+8", dy: -0.4, dur: 6, fallOut: true, bounce: 0.12 },
  { layer: "probe", at: "bad-6", until: "bad+8", dy: -0.4, dur: 6, fallOut: true, bounce: 0.12 },
  // 吸嘴：下降 → 吸住（晶片微微往上貼）→ 上升 → 平移（梯形速度）→ 對位下降 → 放開 → 抬起回原位
  { layer: "nozzle", at: "test+24", until: "test+31", dy: -pickDy, dur: 6 },
  { layer: "nozzle", at: "test+31", until: "test+76", dy: LIFT, dur: 8 },
  { layer: "nozzle", at: "test+40", until: "test+76", dx: toSlot[0], dz: toSlot[1], dur: 14 },
  { layer: "nozzle", at: "test+56", until: "test+66", dy: -LIFT + 0.05, dur: 7 },
  { layer: "nozzle", at: "test+66", until: "test+76", dy: 0.6, dur: 6 },
  { layer: "kc0", at: "test+30", dy: 0.03, dur: 2 },
  { layer: "kc0", at: "test+31", dy: LIFT - 0.03, dur: 8 },
  { layer: "kc0", at: "test+40", dx: toSlot[0], dz: toSlot[1], dur: 14 },
  { layer: "kc0", at: "test+56", dy: -LIFT + 0.07, dur: 7 },
  { layer: "kc0", at: "test+63", dy: -0.07 - 0.02, dur: 4, fallOut: true, bounce: 0.25 }, // 放開：落 0.07 到晶圓上＋小回彈
  // 壞的：頂針把它推出軌邊 → 水平等速、垂直受重力（throw＝−dy/4 → 位移∝t²）掉進廢料盒 → 落盒回彈一次
  { layer: "pusher", at: "bad+10", until: "bad+18", dz: 0.95, dur: 4 },
  { layer: "kc1", at: "bad+10", dz: 0.95, dur: 4 },
  { layer: "kc1", at: "bad+14", dz: R3(BIN.z - 1.0 - 0.95 + 0.0), dy: R3(BIN.y - RAIL_Y), throw: R3((RAIL_Y - BIN.y) / 4), dur: 12 },
  { layer: "kc1", at: "bad+26", until: "bad+29", dy: 0.12, dur: 3, fallIn: true, bounce: 0.25 },
];

const scenes = [
  S("s1", "hook", 1, "一次曝光，最多印八百多平方毫米。現在最大的 AI 晶片封裝，是這個的五倍以上。", "一次曝光\n最多印八百多平方毫米\n最大的 AI 晶片封裝\n是這個的五倍以上", "One exposure prints at most | about 858 mm². | Today's biggest AI chip package | is over five times that.", ["八百多", "五倍以上"], [["once", "一次曝光"], ["limit", "八百多"], ["x5", "五倍以上"]],
    { hook: { kicker: "封裝面積", title: "≈ 5 倍光罩", size: 132, top: 136 }, zoom: [{ to: "pk", at: "start-30", dur: 1 }], shot: [shot("start-30", PK, 1)],
      shift: [H0("frame0", "s7:two"), H0("frame1", "s7:two+5"), H0("bridge", "s7:bw-4"), H0("sub", "s10:start+8"), H0("pcb", "s10:start+10"), ...[0, 1, 2].map((g) => H0(`balls${g}`, `s10:start+${52 + g * 3}`)), H0("head", "s10:start-4"),
        hide("frame", "s2:start-2", "s11:end+400", 2)],
      run: [{ id: "scanF", at: "start-30", until: "start+70", ramp: 6 }],
      overlay: [
        { type: "section", kind: "pkg-frames", at: "start-30", until: "s2:start-2", avoid: false, x: 64, y: 905, w: 952, h: 330, cols: 5, fw: 130, title: "光罩框＝一次曝光的面積", items: [{ at: "start-30" }, ...[0, 1, 2, 3].map((i) => ({ at: `start+${3 + i * 4}` }))], flash: [{ at: "x5" }], note: { at: "limit+4", text: "單顆晶片仍受 858 mm² 限制，變大的是封裝" } },
        stamp("start+22", "limit-2", "廠商公布", 850, 862, "amber", 44, -4, { avoid: false }),
        tag("limit", "s2:start-2", "已確定：一次曝光約 858 mm²", 320, 862, "blue", 30, { avoid: false }),
        stamp("x5", "s2:start-2", "≥ 5 倍", 540, 1292, "coral", 52, -4, { avoid: false })] },
    ["台積電 2026/10 法說、2026/8 OCP；SemiEngineering"]),
  S("s2", "you", 2, "做法是把好幾顆晶片，平放在一片矽中介層上，旁邊再圍一圈記憶體。", "做法是把好幾顆晶片\n平放在一片矽中介層上\n旁邊再圍一圈記憶體", "The trick: lay several chips flat | on one silicon interposer, | ringed by memory.", ["平放", "矽中介層", "記憶體"], [["flat", "平放"], ["ip", "矽中介層"], ["mem", "記憶體"], ["ring", "一圈"]],
    { zoom: [{ to: "pk", at: "start-2", dur: 1 }], shift: s2Shift,
      run: [{ id: "landRip", at: "flat+8", until: "flat+30", ramp: 4 }, { id: "ringH", at: "ring", until: "ring+16", ramp: 3 }],
      labels: [{ part: "dieA", text: "運算晶片", en: "Compute die", color: "blue", at: "flat+8", until: "s3:start" }, { part: "ip", text: "矽中介層", en: "Interposer", color: "blue", at: "ip", until: "s3:start" }, { part: "hbm", text: "記憶體", en: "HBM", color: "amber", at: "mem+12", until: "s3:start" }],
      overlay: [tag("start+4", "s3:start", "已確定・以 CoWoS-S 示意", 540, 1300, "blue", 30, { avoid: false })] },
    ["台積電 CoWoS；WikiChip"]),
  S("s3", "twist", 3, "拆開再拼，接點變多，訊號也要多走一段，為什麼反而划算？", "拆開再拼\n接點變多\n訊號也要多走一段\n為什麼反而划算？", "Split and rejoin: more joints, | a longer trip for signals. | So why is it cheaper?", ["接點變多", "多走一段", "划算"], [["joints", "接點變多"], ["detour", "多走一段"], ["why", "為什麼"]],
    { run: [{ id: "ubGlow", at: "joints-2", until: "s4:start", ramp: 4 }, { id: "sigDirect", at: "start", until: "detour-2", ramp: 4 }, { id: "sigDetour", at: "detour", until: "s4:start", ramp: 4 }],
      overlay: [{ type: "section", kind: "pkg-detour", at: "start", until: "s4:start-2", avoid: false, x: 556, y: 875, w: 460, h: 470, title: "代價", joints: { at: "joints" }, detour: { at: "detour" } },
        tag("joints+2", "s4:start-2", "已確定（代價）", 290, 960, "coral", 30, { avoid: false }), stamp("why", "s4:start-2", "為什麼划算？", 290, 1120, "amber", 52, -4, { avoid: false })] },
    ["The Register 2024/4；WikiChip"]),
  S("s4", "mechanism", 4, "上一支估算過，晶片越大越容易被缺陷打中，大晶片好的不到一半。", "上一支估算過\n晶片越大越容易被缺陷打中\n大晶片好的不到一半", "Last time we estimated: | the bigger the chip, the likelier a defect hits. | Under half of big chips come out good.", ["缺陷", "不到一半"], [["prev", "上一支"], ["defect", "缺陷"], ["half", "不到一半"]],
    { overlay: [{ type: "section", kind: "pkg-wafers", at: "start", until: "s5:start-10", avoid: false, x: 64, y: 905, w: 952, h: 430, title: "同一組缺陷", tag: "估算，簡化模型", defect: { at: "defect-6" }, half: { at: "half", text: "≈45%" } },
      tag("prev+4", "s5:start-10", "估算（簡化模型，非實測）", 760, 858, "amber", 30, { avoid: false })] },
    ["tech-yield：D0 0.1/cm²、泊松模型（估算）"]),
  S("s5", "mechanism", 5, "拆成小顆，每顆先測過，只挑好的封裝。壞一顆，只丟那一小顆。", "拆成小顆，每顆先測過\n只挑好的封裝\n壞一顆\n只丟那一小顆", "Split into small dies, test each first, | package only the good ones. | One bad die? Toss just that one.", ["先測過", "只挑好的", "只丟那一小顆"], [["small", "拆成小顆"], ["test", "先測過"], ["pick", "只挑好的"], ["bad", "壞一顆"], ["drop", "只丟那一小顆"]],
    { shot: [shot("start-4", KG, 14)], shift: s5Shift,
      run: [{ id: "probeI", at: "test", until: "test+8", ramp: 2 }, { id: "okA", at: "test+1", until: "s6:start", ramp: 2 },
        { id: "placeRip", at: "test+67", until: "test+90", ramp: 3 }, { id: "ngA", at: "bad+1", until: "drop-2", ramp: 2 }, { id: "ngBlink", at: "drop-2", until: "s6:start", ramp: 3 }, { id: "binRip", at: "bad+26", until: "bad+46", ramp: 3 }],
      
      overlay: [tag("start+4", "s6:start-2", "已確定（作法：已知良品挑選）", 540, 1300, "blue", 30, { avoid: false }), tag("start+4", "s6:start-2", "探針測試（示意）→ 吸嘴 → 中介層晶圓", 540, 1070, "blue", 30, { avoid: false }), stamp("test+4", "bad-4", "好 ✓", 270, 1175, "blue", 56, -4, { avoid: false }), stamp("bad+4", "s6:start-2", "壞 ✕", 270, 1175, "coral", 56, -4, { avoid: false }), stamp("drop", "s6:start-2", "只丟這一顆", 760, 1175, "coral", 52, -4, { avoid: false })] },
    ["WikiChip；Teradyne；SemiEngineering"]),
  S("s6", "mechanism", 6, "中介層的線比電路板細很多，晶片跟記憶體貼得近，資料來回才夠快。", "中介層的線比電路板細很多\n晶片跟記憶體貼得近\n資料來回才夠快", "Interposer wiring is far finer than a circuit board's. | Chip and memory sit close, | so data moves fast both ways.", ["細很多", "貼得近", "來回"], [["thin", "細很多"], ["near", "貼得近"], ["fast", "來回"]],
    { shot: [shot("start-8", XS, 14)], shift: ["dieB", "hbm5", "hbm6"].map((l) => ({ layer: l, at: "start+4", until: "s7:start-6", opacity: 0.32, dur: 8 })),
      run: [{ id: "rdlGlow", at: "thin-2", until: "s7:start", ramp: 6 }, { id: "memIn", at: "thin+6", until: "s7:start-6", ramp: 12, gain: 0.45 }, { id: "memOut", at: "thin+6", until: "s7:start-6", ramp: 12, gain: 0.45 }, { id: "memIn", at: "fast-4", until: "s7:start-6", ramp: 10 }, { id: "memOut", at: "fast-4", until: "s7:start-6", ramp: 10 }, { id: "tsvDown", at: "fast", until: "s7:start-6", ramp: 6 }],
      labels: [{ part: "rdl", text: "重分佈層 RDL", en: "redistribution layer", color: "amber", at: "thin", until: "fast-6" }, { part: "ub", text: "微凸塊", en: "Micro-bump", color: "blue", at: "near", until: "s7:start-12" }],
      overlay: [{ type: "section", kind: "pkg-xsec", at: "start+2", until: "s7:start-2", avoid: false, x: 64, y: 958, w: 952, h: 400, title: "剖面（示意）", tag: "相對示意，非實際線寬", flows: ["memIn", "memOut"], thin: { at: "thin" }, near: { at: "near" } },
        tag("fast", "s7:start-2", "晶片與記憶體之間：數千條訊號線", 600, 912, "blue", 30, { avoid: false })] },
    ["ECTC 2023；Rambus；示意，非實際線寬"]),
  S("s7", "payoff", 7, "廠商公布的大晶片，就是兩顆印到極限的晶片並排，每秒互傳十兆位元組。", "廠商公布的大晶片\n就是兩顆印到極限的晶片並排\n每秒互傳十兆位元組", "The vendor's big chip: | two dies, each printed to the limit, side by side, | trading 10 TB every second.", ["印到極限", "十兆位元組"], [["maker", "廠商公布"], ["two", "兩顆"], ["edge", "印到極限"], ["bw", "十兆位元組"]],
    { shot: [shot("start-8", PK, 14)],
      shift: [{ layer: "frame0", at: "s1:start-40", until: "two", dy: 1.8, dur: 8, fallIn: true, bounce: 0.05 }, { layer: "frame1", at: "s1:start-40", until: "two+5", dy: 1.8, dur: 8, fallIn: true, bounce: 0.05 },
        hide("frame0", "s8:start-2", "s11:end+400", 4), hide("frame1", "s8:start-2", "s11:end+400", 4), hide("bridge", "s8:start-2", "s11:end+400", 4),
        { layer: "dieA", at: "bw-6", until: "s8:start-2", opacity: 0.28, dur: 6 }, { layer: "dieB", at: "bw-6", until: "s8:start-2", opacity: 0.28, dur: 6 }],
      run: [{ id: "frameEdge", at: "edge", until: "bw-6", ramp: 3 }, { id: "bridgeAB", at: "bw", until: "s8:start-2", ramp: 6 }, { id: "bridgeBA", at: "bw", until: "s8:start-2", ramp: 6 }],
      labels: [{ part: "dieA", text: "各自印到上限", en: "1 reticle each", color: "coral", at: "edge", until: "bw-6" }],
      overlay: [stamp("bw+2", "s8:start-2", "每秒 {n} TB", 760, 1010, "amber", 76, -4, { avoid: false, countTo: 10, countDur: 18 }), tag("maker", "s8:start-2", "廠商公布（NVIDIA 2024/3 發表）", 540, 1290, "amber", 30, { avoid: false }), tag("bw+8", "s8:start-2", "晶片之間走矽橋（CoWoS-L）", 540, 1180, "blue", 30, { avoid: false })] },
    ["Electronic Design；All About Circuits"]),
  S("s8", "payoff", 8, "代價是封裝變難。廠商說，這種大封裝的良率已經超過九成八。", "代價是封裝變難\n廠商說\n這種大封裝的良率已經超過九成八", "The cost: packaging gets harder. | The vendor says yield for these big packages | is already above 98%.", ["封裝變難", "九成八"], [["hard", "封裝變難"], ["maker2", "廠商說"], ["rate", "九成八"]],
    { overlay: [{ type: "section", kind: "pkg-warp", at: "hard-4", until: "s9:start-2", avoid: false, x: 64, y: 930, w: 470, h: 260, title: "大面積易翹曲（示意）", flash: { at: "hard+2" }, uf: { at: "hard+14" } },
      stamp("rate", "s9:start-2", "> 98%", 800, 1040, "amber", 96, -4, { avoid: false }), tag("rate+4", "s9:start-2", "廠商公布，封裝良率，非第三方實測", 540, 1270, "amber", 30, { avoid: false })] },
    ["台積電 2026/8 OCP（媒體轉述）"]),
  S("s9", "twist", 9, "十四倍的更大版本，廠商排在二零二八年，做不做得到還要再看。", "十四倍的更大版本\n廠商排在二零二八年\n做不做得到還要再看", "A 14× version is on the vendor's 2028 roadmap. | Whether it works out | remains to be seen.", ["十四倍", "二零二八年", "還要再看"], [["x14", "十四倍"], ["y28", "二零二八年"], ["see", "還要再看"]],
    { overlay: [{ type: "section", kind: "pkg-frames", at: "start", until: "s10:start-8", avoid: false, x: 64, y: 905, w: 952, h: 430, title: "光罩框＝一次曝光的面積", unit: "個光罩面積", note: { at: "y28", text: "虛線＝廠商目標（2028），非實測" }, items: [...[0, 1, 2, 3, 4].map(() => ({ at: "start-30" })), ...Array.from({ length: 9 }, (_, i) => ({ at: `x14-${12 - i * 3 > 0 ? 12 - i * 3 : 0}${12 - i * 3 < 0 ? "" : ""}`, dashed: true }))].map((it, i) => (i >= 5 ? { ...it, at: `start+${2 + (i - 5) * 3}` } : it)), marks: [] },
      tag("x14+6", "s10:start-8", "廠商目標值（非實測）", 540, 860, "amber", 30, { avoid: false }), stamp("see", "s10:start-8", "尚未確定", 830, 405, "coral", 52, -5, { avoid: false })] },
    ["台積電 2026/4 北美技術論壇"]),
  S("s10", "cta", 10, "往旁邊拼，還是往上疊？下一支，來看記憶體為什麼疊十二層。想要完整解說，留言封裝。", "往旁邊拼，還是往上疊？\n下一支，來看記憶體\n為什麼疊十二層\n想要完整解說，留言封裝", "Spread sideways, or stack up? | Next: why memory stacks 12 layers high. | Comment \"封裝\" for the full notes.", ["往旁邊拼", "往上疊", "十二層"], [["side", "往旁邊拼"], ["stack", "往上疊"], ["next", "下一支"], ["twelve", "疊十二層"], ["kw", "留言封裝"]],
    { shot: [shot("start-2", FULL, 14)],
      // 組裝全貌（運作 C）：放置頭壓下吸住模組 → 抬起 → 基板滑進來 → 模組受重力放下（偏一點）→ 回流焊：凸塊熔化發光、表面張力拉回正中（阻尼彈簧）→ 錫球 → 主機板滑進來
      shift: [
        { layer: "head", at: "start-4", until: "start+6", dy: 1.2, opacity: 0, dur: 6 },
        ...MOD.map((l) => ({ layer: l, at: "start+8", until: "start+22", dy: 1.3, dur: 8, fallIn: true, bounce: 0.02 })),
        { layer: "head", at: "start+8", until: "start+22", dy: 1.3, dur: 8 }, { layer: "head", at: "start+76", until: "s11:end+400", dy: 3, opacity: 0, dur: 8 },
        // 回流焊之後整顆（模組＋基板）再拿起來、植好錫球、受重力放到主機板上
        ...[...MOD, "sub", "head", "balls0", "balls1", "balls2"].map((l) => ({ layer: l, at: "start+46", until: "start+64", dy: 0.9, dur: 8, fallIn: true, bounce: 0.02 })),
        { layer: "sub", at: "s1:start-40", until: "start+10", dx: -14, dur: 10 },
        ...MOD.map((l) => ({ layer: l, at: "start+20", until: "start+31", dx: 0.12, dz: -0.08, dur: 2, spring: { tau: 4, period: 11 } })),
        ...SLICE_LAYERS.map((l, i) => ({ layer: l, at: `twelve-${10 - Math.round(i * 0.6)}`, until: "s11:end+400", dy: R3(1.6 + i * 0.14), dur: 12 })),
        { layer: `hbm${SPLIT}`, at: "twelve-10", until: "s11:end+400", dy: 1.6, dur: 12 }],
      run: [{ id: "meltC4", at: "start+30", until: "start+44", ramp: 7 }, { id: "meltBall", at: "start+72", until: "start+88", ramp: 6 }],
      labels: [{ part: "sub", text: "有機基板", en: "Substrate", color: "blue", at: "start+16", until: "stack" }, { part: "ball", text: "錫球", en: "BGA", color: "blue", at: "start+56", until: "next+10" }, { part: "hbmS", text: "12 層", en: "12-high", color: "amber", at: "twelve+4", until: "s11:start+10" }],
      overlay: [{ type: "section", kind: "pkg-choice", at: "side-4", until: "s11:start+2", avoid: false, x: 64, y: 1050, w: 952, h: 290, title: "二選一", left: { at: "side" }, right: { at: "stack" } },
        tag("start+30", "start+92", "回流焊（示意）：凸塊熔化，把晶片拉回正中", 540, 312, "amber", 30, { avoid: false })] },
    ["下一支：11/19（四）20:00 HBM（已排定）"]),
  { id: "s11", beat: "end", silent: true, durationSec: 3.2, subtitle: { zh: "", en: "" }, keywords: [], cues: [], component: "ThreeScene",
    props: { endCard: { next: "HBM 為什麼疊 12 層", trail: ["光罩上限", "中介層", "已知良品", "HBM"], at: "s10:kw-8", comment: "封裝", logoAnim: "transparent" } }, sources: [] },
];
// s1–s10 的預估長度（device-spec 第 3 節；無聲時間軸用，配音後以 timeline 為準）
const EST = [6.1, 5.8, 4.6, 5.3, 5.0, 5.6, 6.1, 5.2, 5.3, 6.8];
scenes.forEach((s, i) => { if (EST[i]) s.durationSec = EST[i]; });
const script = {
  slug: "tech-packaging", title: "先進封裝：晶片太大做不好，拆小再拼回去（科技透明圈 第 5 支）", asOf: "2026/11/18", styleVersion: 3, stage: "three",
  channel: { name: "科技透明圈", tag: "放大來看", slogan: "一支講透一件事" }, hudSkin: "light",
  voice: { voiceName: "Iapetus", model: "gemini-2.5-flash-preview-tts", mode: "take", languageCode: "cmn-TW", profile: "tech-b", _說明: "念稿定版：docs/prompts/tech-packaging-旁白.txt（不改）；API 整篇 1 次請求" },
  hud: {
    levels: [{ id: "pk", label: "先進封裝", en: "PACKAGE", field: "10 cm", ruler: "1 cm", art: "none", handoff3D: true, readout: false, note: "查證截至 2026/11/18" }],
    theme: "dark", schematic: { text: "Schematic – not to scale", zh: "示意圖，非實際比例・運作為示意" }, maxLabels: 4, smallPx: 30, layout: "fill", scanBand: 0.3,
  },
  cover: { title: ["拆小", "再拼回去"], sub: "先進封裝", frame: 40 },
  sample: false, scenes,
};
fs.writeFileSync(R + "script.json", JSON.stringify(script, null, 2) + "\n");
console.log("ok", scenes.length);

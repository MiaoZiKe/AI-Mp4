// node videos/tech-packaging/gen-script.mjs → 寫 videos/tech-packaging/script.json（畫面、疊層、鏡頭、物理都在這支；改腳本改這支）
// 規格：videos/tech-packaging/device-spec.md（以它為準）；念稿：docs/prompts/tech-packaging-旁白.txt（不改）。
// 念稿 2026/11/16 依 video_logic 第六節改寫（commit 78a91a5，9 段）。鏡頭（整個世界固定轉 −30°、俯角約 35°，主素材不轉、不縮放）：PK＝封裝（s1–s3、s5）；KG＝已知良品挑選站（s4）；XS＝晶片與 HBM 交界（s6）；FULL＝全貌（s7–s9）。
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

const MOD = ["ip", "ipPad", "c4", "dieA", "dieB", ...HBM_LAYERS, ...SLICE_LAYERS]; // 中介層模組（s10 一起拿起來、放下）
const HBM_ALL = (i) => (i === SPLIT ? [`hbm${i}`, ...SLICE_LAYERS] : [`hbm${i}`]);
// 「一開始就藏起來」：s1 開場前就是 0 透明度
const H0 = (layer, until) => hide(layer, "s1:start-40", until, 2);

// ── s5 組裝（拼回去）：晶片拿起（往上、淡出）→ 念到「平放」受重力落下、回彈、下面被壓一下；HBM 依序落 ──
const fall = (layer, until, dy, bounce, press = ["ip", "c4"], pressAmt = 0.012) => ({ layer, at: "s5:start-2", until, dy, opacity: 0, dur: 9, fallIn: true, bounce, press, pressAmt });
const s5Shift = [
  fall("dieA", "flat-2", 1.4, 0.03), fall("dieB", "flat+2", 1.4, 0.03),
  ...Array.from({ length: 8 }, (_, i) => HBM_ALL(i).map((l) => fall(l, `mem+${i * 4}`, 1.0, 0.06, ["ip", "c4"], 0.006))).flat(),
  H0("align", "s5:start"), hide("align", "mem+44", "s10:end+400", 6), H0("ipPad", "s5:start"), hide("ipPad", "mem+44", "s10:end+400", 6),
];
// ── s4 運作 A：已知良品挑選（物理：輸送等速、探針受力下壓＋彈簧回彈、吸嘴梯形速度、壞的推出去走拋物線掉進盒子） ──
// kc0＝這次測到好的那顆、kc1＝壞的那顆。先前進一格（kc0 到探針下）→ 測（綠）→ 再前進一格（kc0 到吸取站、kc1 到探針下）→ 吸起放到中介層晶圓；kc1 測（紅）→ 推出去掉進廢料盒
const adv = (at) => Array.from({ length: KCH }, (_, i) => ({ layer: `kc${i}`, at, dx: PITCH, dur: 10 })); // 輸送軌整排前進一格
const pickDy = R3(NOZ_TIP - (RAIL_Y + KCT)); // 吸嘴往下多少才碰到晶片頂面
const toSlot = [R3(SLOT[0] - KP.pickX), R3(SLOT[1])];
const LIFT = 1.5;
const s4Shift = [
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
  S("s1", "hook", 1, "一顆晶片能做多大，其實有上限。現在最大的 AI 晶片，整組做到上限的五倍以上。怎麼做到的？", "一顆晶片能做多大\n其實有上限\n最大的 AI 晶片\n整組做到上限的五倍以上\n怎麼做到的？", "How big can one chip be? | There's a limit. | Today's biggest AI chips | reach over five times that, as a set. | How?", ["上限", "五倍以上"], [["limit", "有上限"], ["x5", "五倍以上"], ["how", "怎麼做到"]],
    { hook: { kicker: "最大的 AI 晶片", title: "上限的 5 倍以上", size: 112, top: 136 }, zoom: [{ to: "pk", at: "start-30", dur: 1 }], shot: [shot("start-30", PK, 1)],
      shift: [H0("frame0", "s10:end+300"), H0("frame1", "s10:end+300"), H0("bridge", "s10:end+300"), H0("sub", "s7:start+8"), H0("pcb", "s7:start+10"), ...[0, 1, 2].map((g) => H0(`balls${g}`, `s7:start+${52 + g * 3}`)), H0("head", "s7:start-4"),
        hide("frame", "s3:start-2", "s10:end+400", 2)],
      run: [{ id: "scanF", at: "start-30", until: "start+70", ramp: 6 }],
      overlay: [
        { type: "section", kind: "pkg-frames", at: "start-30", until: "s3:start-2", avoid: false, x: 64, y: 905, w: 952, h: 290, cols: 5, fw: 130, total: 5, title: "光罩框＝一次能印的上限", items: [{ at: "start-30" }, ...[0, 1, 2, 3].map((i) => ({ at: `start+${3 + i * 4}` }))], flash: [{ at: "x5" }], note: { at: "s2:n800+4", text: "單顆晶片仍受約 858 mm² 限制，變大的是整組" } },
        stamp("start+22", "s2:start-2", "廠商公布", 850, 862, "amber", 44, -4, { avoid: false }),
        stamp("x5", "s2:start-2", "≥ 5 倍", 540, 1268, "coral", 60, -4, { avoid: false })] },
    ["台積電 2026/10 法說、2026/8 OCP；SemiEngineering"]),
  S("s2", "you", 2, "上限來自製造。電路是用光印上去的，一次最多印八百多平方毫米。", "上限來自製造\n電路是用光印上去的\n一次最多印八百多平方毫米", "The limit comes from manufacturing. | Circuits are printed with light — | at most about 858 mm² per shot.", ["用光印", "八百多"], [["make", "製造"], ["light", "用光印"], ["n800", "八百多"]],
    { zoom: [{ to: "pk", at: "start-2", dur: 1 }], run: [{ id: "scanF", at: "light-4", until: "s3:start-4", ramp: 6 }],
      labels: [{ part: "dieA", text: "一次能印的範圍", en: "one exposure", color: "amber", at: "light+2", until: "s3:start-2" }],
      overlay: [tag("n800", "s3:start-2", "已確定：一次最多約 858 mm²", 320, 862, "blue", 30, { avoid: false }), stamp("n800+4", "s3:start-2", "上限", 540, 1268, "blue", 56, -4, { avoid: false })] },
    ["SemiEngineering；Tom's Hardware（26×33 mm）"]),
  S("s3", "mechanism", 3, "而且晶片越大，越容易被缺陷打中。上一支估算過，好的可能不到一半。", "而且晶片越大\n越容易被缺陷打中\n上一支估算過\n好的可能不到一半", "And the bigger the chip, | the likelier a defect hits it. | Last time we estimated: | maybe under half come out good.", ["缺陷", "不到一半"], [["defect", "缺陷"], ["prev", "上一支"], ["half", "不到一半"]],
    { overlay: [{ type: "section", kind: "pkg-wafers", at: "start", until: "s4:start-10", avoid: false, x: 64, y: 900, w: 952, h: 450, title: "同一組缺陷", tag: "估算，簡化模型", defect: { at: "defect-6" }, half: { at: "half", text: "≈45%" } },
      tag("prev+4", "s4:start-10", "估算（簡化模型，非實測）", 760, 858, "amber", 30, { avoid: false })] },
    ["tech-yield：D0 0.1/cm²、泊松模型（估算）"]),
  S("s4", "mechanism", 4, "所以反過來，拆成幾顆小晶片，每顆先測過，只挑好的用。壞一顆，只丟那一小顆。", "所以反過來\n拆成幾顆小晶片，每顆先測過\n只挑好的用\n壞一顆，只丟那一小顆", "So flip it: split into small dies, | test each one first, | use only the good ones. | One bad die? Toss just that one.", ["小晶片", "先測過", "只丟那一小顆"], [["small", "小晶片"], ["test", "先測過"], ["pick", "只挑好的"], ["bad", "壞一顆"], ["drop", "只丟那一小顆"]],
    { shot: [shot("start-4", KG, 14)], shift: s4Shift,
      run: [{ id: "probeI", at: "test", until: "test+8", ramp: 2 }, { id: "okA", at: "test+1", until: "s5:start", ramp: 2 },
        { id: "placeRip", at: "test+67", until: "test+90", ramp: 3 }, { id: "ngA", at: "bad+1", until: "drop-2", ramp: 2 }, { id: "ngBlink", at: "drop-2", until: "s5:start", ramp: 3 }, { id: "binRip", at: "bad+26", until: "bad+46", ramp: 3 }],
      overlay: [tag("start+4", "s5:start-2", "已確定（作法：已知良品挑選）", 540, 1300, "blue", 30, { avoid: false }), tag("start+4", "s5:start-2", "探針測試（示意）→ 吸嘴 → 中介層晶圓", 540, 1070, "blue", 30, { avoid: false }), stamp("test+4", "bad-4", "好 ✓", 270, 1175, "blue", 56, -4, { avoid: false }), stamp("bad+4", "s5:start-2", "壞 ✕", 270, 1175, "coral", 56, -4, { avoid: false }), stamp("drop", "s5:start-2", "只丟這一顆", 760, 1175, "coral", 52, -4, { avoid: false })] },
    ["WikiChip；Teradyne；SemiEngineering"]),
  S("s5", "mechanism", 5, "挑好的，平放到一片很薄的矽板上拼回去。這片叫中介層，旁邊再圍一圈記憶體。", "挑好的，平放到\n一片很薄的矽板上拼回去\n這片叫中介層\n旁邊再圍一圈記憶體", "Lay the good ones flat | on a thin silicon slab. | It's called an interposer, | ringed by memory.", ["很薄的矽板", "中介層", "記憶體"], [["flat", "平放"], ["ip", "中介層"], ["mem", "記憶體"], ["ring", "一圈"]],
    { shot: [shot("start-4", PK, 14)], shift: s5Shift,
      run: [{ id: "landRip", at: "flat+8", until: "flat+30", ramp: 4 }, { id: "ringH", at: "ring", until: "ring+16", ramp: 3 }],
      labels: [{ part: "dieA", text: "運算晶片", en: "Compute die", color: "blue", at: "flat+8", until: "s6:start" }, { part: "ip", text: "矽中介層", en: "Interposer", color: "blue", at: "ip", until: "s6:start" }, { part: "hbm", text: "記憶體", en: "HBM", color: "amber", at: "mem+12", until: "s6:start" }],
      overlay: [tag("start+4", "s6:start", "已確定・以 CoWoS-S 示意", 540, 1300, "blue", 30, { avoid: false }),
        { type: "legend", at: "flat+4", until: "s6:start-2", avoid: false, x: 90, y: 990, cols: 2, colW: 440, size: 38, items: [{ text: "運算晶片 ×2", swatch: "pkChip" }, { text: "記憶體 HBM ×8", swatch: "pkHbm" }, { text: "矽中介層（薄矽板）", swatch: "pkIp" }, { text: "微凸塊（底下接點）", swatch: "pkUb" }] }] },
    ["台積電 CoWoS；WikiChip"]),
  S("s6", "mechanism", 6, "為什麼不直接裝在電路板上？中介層的線細很多、排得更密，資料來回才夠快。", "為什麼不直接裝在電路板上？\n中介層的線細很多\n排得更密\n資料來回才夠快", "Why not mount them on a circuit board? | Interposer wiring is far finer | and denser, | so data moves fast both ways.", ["細很多", "更密", "來回"], [["why", "電路板"], ["thin", "細很多"], ["dense", "更密"], ["fast", "來回"]],
    { shot: [shot("start-8", XS, 14)], shift: ["dieB", "hbm5", "hbm6"].map((l) => ({ layer: l, at: "start+4", until: "s7:start-6", opacity: 0.32, dur: 8 })),
      run: [{ id: "rdlGlow", at: "thin-2", until: "s7:start", ramp: 6 }, { id: "memIn", at: "thin+6", until: "s7:start-6", ramp: 12, gain: 0.45 }, { id: "memOut", at: "thin+6", until: "s7:start-6", ramp: 12, gain: 0.45 }, { id: "memIn", at: "fast-4", until: "s7:start-6", ramp: 10 }, { id: "memOut", at: "fast-4", until: "s7:start-6", ramp: 10 }, { id: "tsvDown", at: "fast", until: "s7:start-6", ramp: 6 }],
      labels: [{ part: "rdl", text: "重分佈層 RDL", en: "redistribution layer", color: "amber", at: "thin", until: "fast-6" }, { part: "ub", text: "微凸塊", en: "Micro-bump", color: "blue", at: "dense", until: "s7:start-12" }],
      overlay: [{ type: "section", kind: "pkg-xsec", at: "start+2", until: "s7:start-2", avoid: false, x: 64, y: 958, w: 952, h: 400, title: "剖面（示意）", tag: "相對示意，非實際線寬", flows: ["memIn", "memOut"], thin: { at: "thin" }, near: { at: "dense" } },
        tag("fast", "s7:start-2", "晶片與記憶體之間：數千條訊號線", 600, 912, "blue", 30, { avoid: false })] },
    ["ECTC 2023；Rambus；示意，非實際線寬"]),
  S("s7", "payoff", 7, "拼好再整個包起來，這一步就叫先進封裝。", "拼好再整個包起來\n這一步就叫先進封裝", "Assemble, then package the whole thing: | that step is called advanced packaging.", ["先進封裝"], [["wrap", "包起來"], ["name", "先進封裝"]],
    { shot: [shot("start-2", FULL, 14)],
      // 組裝全貌（運作 C）：放置頭壓下吸住模組 → 抬起 → 基板滑進來 → 模組受重力放下（偏一點）→ 回流焊：凸塊熔化發光、表面張力拉回正中（阻尼彈簧）→ 整顆拿起、錫球 → 放到主機板、錫球回流
      shift: [
        { layer: "head", at: "start-4", until: "start+6", dy: 1.2, opacity: 0, dur: 6 },
        ...MOD.map((l) => ({ layer: l, at: "start+8", until: "start+22", dy: 1.3, dur: 8, fallIn: true, bounce: 0.02 })),
        { layer: "head", at: "start+8", until: "start+22", dy: 1.3, dur: 8 }, { layer: "head", at: "start+76", until: "s10:end+400", dy: 3, opacity: 0, dur: 8 },
        ...[...MOD, "sub", "head", "balls0", "balls1", "balls2"].map((l) => ({ layer: l, at: "start+46", until: "start+64", dy: 0.9, dur: 8, fallIn: true, bounce: 0.02 })),
        { layer: "sub", at: "s1:start-40", until: "start+10", dx: -14, dur: 10 },
        ...MOD.map((l) => ({ layer: l, at: "start+20", until: "start+31", dx: 0.12, dz: -0.08, dur: 2, spring: { tau: 4, period: 11 } }))],
      run: [{ id: "meltC4", at: "start+30", until: "start+44", ramp: 7 }, { id: "meltBall", at: "start+72", until: "start+88", ramp: 6 }],
      labels: [{ part: "sub", text: "有機基板", en: "Substrate", color: "blue", at: "start+16", until: "name-8" }, { part: "ball", text: "錫球", en: "BGA", color: "blue", at: "start+56", until: "name-8" }],
      overlay: [tag("start+30", "start+92", "回流焊（示意）：凸塊熔化，把晶片拉回正中", 540, 312, "amber", 30, { avoid: false }), stamp("name", "s8:start-2", "先進封裝", 540, 1040, "blue", 84, -4, { avoid: false }), tag("name+4", "s8:start-2", "晶片 → 中介層 → 基板 → 錫球 → 主機板", 540, 1190, "blue", 30, { avoid: false })] },
    ["台積電 CoWoS 流程（專利、Amkor 教學簡報）；示意"]),
  S("s8", "twist", 8, "代價是接點變多、封裝變難。廠商說，這種大封裝良率已超過九成八，還沒有第三方實測。", "代價是接點變多、封裝變難\n廠商說，這種大封裝\n良率已超過九成八\n還沒有第三方實測", "The cost: more joints, harder packaging. | The vendor says yield for these big packages | is above 98% — | not yet independently tested.", ["接點變多", "九成八", "第三方實測"], [["joints", "接點變多"], ["hard", "封裝變難"], ["rate", "九成八"], ["unk", "第三方實測"]],
    { run: [{ id: "jointGlow", at: "joints-2", until: "hard+6", ramp: 4 }],
      overlay: [{ type: "section", kind: "pkg-warp", at: "hard-4", until: "s9:start-2", avoid: false, x: 64, y: 930, w: 470, h: 260, title: "大面積易翹曲（示意）", flash: { at: "hard+2" }, uf: { at: "hard+14" } },
        tag("joints", "hard+6", "接點：微凸塊＋C4＋錫球", 540, 312, "coral", 30, { avoid: false }),
        stamp("rate", "s9:start-2", "> 98%", 800, 1040, "amber", 96, -4, { avoid: false }), tag("rate+4", "s9:start-2", "廠商公布，封裝良率", 540, 1240, "amber", 30, { avoid: false }), tag("unk", "s9:start-2", "查不到第三方實測（截至 2026/11/18）", 540, 1300, "coral", 30, { avoid: false })] },
    ["台積電 2026/8 OCP（媒體轉述）"]),
  S("s9", "cta", 9, "晶片往旁邊拼，記憶體則往上疊。下一支，來看記憶體為什麼疊十二層。想要完整解說，留言封裝。", "晶片往旁邊拼\n記憶體則往上疊\n下一支，來看記憶體為什麼疊十二層\n想要完整解說，留言封裝", "Chips spread sideways; | memory stacks up. | Next: why memory stacks 12 layers high. | Comment \"封裝\" for the full notes.", ["往旁邊拼", "往上疊", "十二層"], [["side", "往旁邊拼"], ["stack", "往上疊"], ["next", "下一支"], ["twelve", "疊十二層"], ["kw", "留言封裝"]],
    { shift: [...SLICE_LAYERS.map((l, i) => ({ layer: l, at: `stack-${10 - Math.round(i * 0.6)}`, until: "s10:end+400", dy: R3(1.6 + i * 0.14), dur: 12 })), { layer: `hbm${SPLIT}`, at: "stack-10", until: "s10:end+400", dy: 1.6, dur: 12 }],
      labels: [{ part: "hbmS", text: "12 層", en: "12-high", color: "amber", at: "twelve", until: "s10:start+10" }],
      overlay: [{ type: "section", kind: "pkg-choice", at: "side-4", until: "s10:start+2", avoid: false, x: 64, y: 1050, w: 952, h: 290, title: "兩個方向", left: { at: "side" }, right: { at: "stack" } }] },
    ["下一支：11/19（四）20:00 HBM（已排定）"]),
  { id: "s10", beat: "end", silent: true, durationSec: 3.2, subtitle: { zh: "", en: "" }, keywords: [], cues: [], component: "ThreeScene",
    props: { endCard: { next: "HBM 為什麼疊 12 層", trail: ["上限", "已知良品", "中介層", "先進封裝"], at: "s9:kw-8", comment: "封裝", logoAnim: "transparent" } }, sources: [] },
];
// 各幕預估長度（無聲時間軸用，配音後以 timeline 為準）
const EST = [6.8, 5.4, 5.6, 6.6, 6.0, 6.0, 3.8, 6.8, 7.3];
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

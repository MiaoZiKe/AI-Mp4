
// ═════ S4 運作動畫（液體在管線流動） ═════
const FX2 = XC + 4.0, FZ2 = -1.4;
actions.supFlow = { type: "flow", _說明: "藥液從大宗儲槽出口，沿塑膠管流向管理櫃（泵啟動後才有；先慢後穩）", layer: "loopIn", path: [[W0, 1.6, 0], [W0 + 3, 1.6, 0], [W0 + 3, 1.6, ZP], [XC - 5.5, 1.6, ZP], [XC - 5.5, 3.6, ZP], [XC - 5.5, 3.6, -4.2]], n: 12, size: 0.13, shape: "dot", rate: 0.2, color: "cleanC", track: false, drive: true, jitter: 0.06, rim: "steelC" };
actions.cdsFlow = { type: "flow", _說明: "管理櫃內：泵 → 閥島 → 過濾器 → 出口（液體沿內部細管）", layer: "cdsPipe", path: [[XC - 5.5, 3.6, -4.2], [XC - 5.5, 3.6, -1.0], [PX - 1.4, 3.6, -1.0], [PX - 1.4, 4.4, -0.2], [PX + 1.4, 4.4, 0], [PX + 1.4, 7.0, 0], [VX - 2.2, 7.0, 0], [VX - 2.2, 8.5, 0], [VX + 2.2, 8.5, 0], [VX + 2.2, 6.0, 0], [FX2, 6.0, 0], [FX2, 1.5, FZ2], [FX2, 10.0, FZ2], [FX2 + 2.7, 10.0, FZ2], [XC + 7.4, 10.0, FZ2], [XC + 7.4, 10.0, -4.2]], n: 22, size: 0.12, shape: "dot", rate: 0.16, color: "cleanC", track: false, free: true, drive: true, rim: "steelC" };
actions.pumpBeat = { type: "vibrate", _說明: "雙隔膜泵：左右泵頭一左一右交替微微抖動（泵啟動有 0.3 秒延遲，示意）", parts: ["pmpHeadL", "pmpHeadR", "pmpMid"], axis: [1, 0, 0], amp: 0.05, freq: 2.2 };
actions.pumpLed = { type: "pulse", parts: ["vlCap"], color: "lampG", glow: 1, steady: true, halo: 0 };
actions.loopFlow = { type: "flow", _說明: "迴路：藥液沿雙層管（內管流動）走到遠端，一路都在循環", layer: "loopOut", path: [[XC + 7.4, 10.0, -4.2], [XC + 7.4, 10.0, ZP], [XC + 7.4, YR, ZP], [XE, YR, ZP]], n: 40, size: 0.13, shape: "dot", rate: 0.07, color: "cleanC", track: false, drive: true, rim: "steelC" };
actions.vmFlow = { type: "flow", _說明: "閥箱：藥液從迴路分支下來，經支路閥與過濾器", layer: "vmbIn", path: [[XV, 9.4, ZP], [XV, 9.4, 0], [XV, 2.7, 0], [XV + 4.9, 2.7, 0]], n: 10, size: 0.12, shape: "dot", rate: 0.16, color: "cleanC", track: false, free: true, drive: true, rim: "steelC" };
actions.feedFlow1 = { type: "flow", _說明: "從閥箱沿使用點供料管送到機台旁供液櫃", layer: "feedL", path: [[XV + 5.0, 2.7, 0], [XV + 6.0, 2.7, 0], [XV + 6.0, 3.0, -2.5], [XD - 6.0, 3.0, -2.5], [XD - 3, 3.0, -2.5], [XD - 3, 2.4, -1.0]], n: 12, size: 0.12, shape: "dot", rate: 0.14, color: "cleanC", track: false, free: true, drive: true, rim: "steelC" };
actions.dtFill = { type: "flow", _說明: "供液櫃：從日用槽 A 抽出，經輸出泵、再沿管送往使用點過濾器", layer: "dtPump", path: [[XD - 3, 2.4, -1.0], [XD, 1.2, 1.8], [XD + 4.2, 1.2, 1.8], [XD + 4.2, 3.0, -2.5], [XD + 6.0, 3.0, -2.5]], n: 10, size: 0.12, shape: "dot", rate: 0.16, color: "cleanC", track: false, free: true, drive: true, rim: "steelC" };
actions.feedFlow2 = { type: "flow", _說明: "供液櫃 → 使用點過濾器（由下進、上出，穿過褶疊濾芯）→ 管子 → 旋轉清洗腔的噴嘴", layer: "feedL", path: [[XD + 6.0, 3.0, -2.5], [XP - 3.0, 3.0, -2.5], [XP - 3.0, 2.0, -2.5], [XP - 3.0, 2.0, 0], [XP, 2.0, 0], [XP, 8.4, 0], [XP + 3.0, 8.4, 0], [XP + 3.0, 8.4, -2.5], [XS - 3.0, 8.4, -2.5], [XS - 3.0, 6.8, -2.5], [XS - 3.0, 8.4, -2.5], [XS, 8.4, -2.5], [XS, 6.3, -2.5]], n: 18, size: 0.12, shape: "dot", rate: 0.12, color: "cleanC", track: false, free: true, drive: true, rim: "steelC" };
actions.nozzleStream = { type: "flow", _說明: "噴嘴落下的藥液細流（重力加速、落點擴散），接晶圓", layer: "scArm", path: [[XS, 6.0, -2.5], [XS, 5.1, -1.6], [XS, 4.95, 0]], n: 5, size: 0.1, shape: "liquid", band: 0.08, bandO: 0.4, rate: 1.4, color: "cleanC", track: false, accel: true, free: true };
actions.waferSpread = { type: "wave", _說明: "液膜在旋轉的晶圓上向外擴散（離心）", from: { layer: "scChuck", p: [XS, 4.95, 0] }, dir: [0, 1, 0], reach: 0.1, count: 3, r0: 0.4, spread: 2.0, rate: 0.7, color: "cleanC", width: 0.08 };
actions.scSpin = { type: "rotate", _說明: "晶圓與吸盤旋轉（起轉有加速）", parts: ["scWaferGrid", "scWaferGridB", "scPin"], axis: [0, 1, 0], pivot: [XS, 4.9, 0], pivots: Object.fromEntries(["scWaferGrid", "scWaferGridB", "scPin"].map((k) => [k, [XS, 4.9, 0]])), rps: 0.3, rampSpin: true };
actions.retFlow = { type: "flow", _說明: "回流：沒用掉的藥液沿回流管回到管理櫃，繼續循環", layer: "loopRet", path: [[XE, YB, ZP - 1.4], [XC + 5.4, YB, ZP - 1.4], [XC + 5.4, YB, -4.2]], n: 36, size: 0.11, shape: "dot", rate: 0.06, color: "cleanC", track: false, drive: true, rim: "steelC" };
actions.upwFlow = { type: "flow", _說明: "旁邊的純水管（淡藍）：只有沖洗階段才流", layer: "feedL", path: [[XP + 3.0, 9.6, -3.4], [XS + 2.0, 9.6, -3.4], [XS + 2.0, 7.2, -3.4]], n: 8, size: 0.1, shape: "dot", rate: 0.14, color: "upwC", track: false, free: true, drive: true };
actions.dtStirSpin = { type: "rotate", parts: ["dtShaft", "dtBlade", "dtBladeB"], axis: [0, 1, 0], pivot: [XD - 3, 4.5, 0], pivots: Object.fromEntries(["dtShaft", "dtBlade", "dtBladeB"].map((k) => [k, [XD - 3, 4.5, 0]])), rps: 0.5, rampSpin: true };
actions.wsLedBlink = { type: "pulse", parts: ["wsLed"], color: "lampR", glow: 0.9, freq: 0.8, halo: 0 };
actions.tankLevel = { type: "pulse", parts: ["tkGaugeLiq"], color: "cleanC", glow: 0.6, steady: true, halo: 0 };
actions.pouLed = { type: "pulse", parts: ["pouVentH"], color: "estop", glow: 0.7, freq: 0.5, halo: 0 };
Object.assign(anchors, {
  tank: A("tankFit", [XT + 3.4, 11.0, 5.9], 150, -90), tgauge: A("tankFit", [XT + 6.4, 8.0, 0.3], 150, 90), tladder: A("tankFit", [XT - 6.5, 8.0, 0.5], -150, -100), tcpl: A("tport", [-8.3, 3.4, 0.8], -150, -90), tbund: A("berm", [XT + 9, 1.0, 7.8], 150, 100),
  cds: A("cdsWall", [XC, 18.6, 4.8], -150, -90), cdsDoorA: A("cdsDoor", [XC - 2, 11, 4.8], -150, -80), pump: A("cdsPump", [PX, 4.9, 0.5], -150, -100), valve: A("cdsValve", [VX, 10.8, 0.8], -150, -90), cfilter: A("cdsFilter", [FX2, 11.6, FZ2 + 1.4], 150, -100), meas: A("cdsMeas", [MX, 15.8, 1.2], -150, -90), pres: A("cdsMeas", [NX, 16.0, 0.4], 150, -100), pleats: A("cdsCore", [FX2 + 1.0, 7.5, FZ2 + 0.8], 150, 90),
  loop: A("loopOut", [XC + 22, YR + 0.3, ZP], 150, -90), loopR: A("loopRet", [XC + 36, YB, ZP - 1.4], 150, 100), vmb: A("vmbBox", [XV, 8.4, 3.0], -150, -90), dtank: A("dtTank", [XD - 3, 10.8, 0.0], -150, -90), dstir: A("dtStir", [XD - 3, 12.2, 0.4], -150, -100), pou: A("pouShell", [XP + 1.5, 8.0, 0.4], 150, -100), poup: A("pouCore", [XP, 5.5, 1.0], 150, 100),
  spin: A("scChuck", [XS, 5.0, 3.0], 150, 100), nozz: A("scArm", [XS, 6.4, -2.5], -150, -100), upw: A("feedL", [XS + 2.0, 8.8, -3.4], 150, -100), waste: A("wsTank", [XW, 6.8, 1.7], 150, -90),
});

const model = {
  name: "示意 濕式化學品與研磨液的輸送與循環（爆炸分解）：大宗儲槽與卸料口、化學品管理櫃（泵、閥島、過濾器、流量計與壓力轉換器）、雙層循環管路、閥箱、供液櫃日用槽、使用點過濾器、旋轉清洗腔一角、廢液櫃；鐵管與塑膠管對照；研磨液磨粒剖面、研磨液混合與循環槽組、研磨墊一角（示意，非特定廠牌）",
  unit: "示意（1＝10 cm）",
  size: { w: 40, h: 18, r: 0.6, t: 30 },
  palette, materials,
  partNames: { tank: "大宗儲槽", cds: "化學品管理櫃", pump: "泵", valve: "閥島", cfilter: "過濾器", meas: "測量", loop: "循環迴路" },
  layers, parts, anchors, actions,
  pose: { yaw0: 0, yawIso: 0, drift: 0 },
  camera: { stand: { d: 70, elev: 24, y: 7 } },
  fx: { dpr: 1, srcPx: 30, shadows: 0, fog: false, dust: false, vaporSprites: false, shimmer: false },
  info: { FY, XT, XC, XV, XD, XP, XS, XW, XE, X1, X2, X3, X5, X6, X7, X8, X9, XB, AX, BX, FF, PX, VX, FX2, FZ2, MX, NX, ZP, YR, YB, WX, XQ, XL },
};
const out = path.join(path.dirname(new URL(import.meta.url).pathname), "model.json");
fs.writeFileSync(out, JSON.stringify(model, null, 1) + "\n");
console.log(`✔ ${out}：${parts.length} 個零件、${parts.reduce((a, p) => a + Math.max(1, (p.at?.length ?? 0)), 0)} 個實體（含複製）、${layers.length} 層`);

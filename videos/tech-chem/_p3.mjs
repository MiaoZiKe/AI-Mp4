
// ═════ S4：送液主線（儲槽 x0 → 管理櫃 x26 → 管路架 → 閥箱 x58 → 供液櫃 x76 → 使用點過濾器 x94 → 旋轉清洗腔 x110） ═════
const XT = 0, XC = 26, XV = 58, XD = 76, XP = 94, XS = 110, XW = 128, ZP = -6.5, YR = 11.0, YB = 9.6;
LAY("tank", [13, 15, XT, 7.5]); LAY("tankFit", [14, 16, XT, 8]); LAY("berm", [22, 1.6, XT, 0.8], true); LAY("tport", [6, 5, -11, 2.5]);
TANK("tk", "tank", "tankFit", XT, 0, 6, 14);
// 防溢堤（槽下淺池）：四面矮牆＋底
BOX("bermFloor", "berm", XT - 11, XT + 11, 0, 0.12, -8, 8, "concDark");
BOX("bermF", "berm", XT - 11, XT + 11, 0, 1.4, 7.5, 8.0, "conc"); BOX("bermB", "berm", XT - 11, XT + 11, 0, 1.4, -8, -7.5, "conc"); BOX("bermL", "berm", XT - 11, XT - 10.5, 0, 1.4, -8, 8, "conc"); BOX("bermR", "berm", XT + 10.5, XT + 11, 0, 1.4, -8, 8, "conc");
P({ id: "bermSump", layer: "berm", shape: "box", size: [1.6, 0.06, 1.6], pos: [XT + 8, 0.14, 5.5], mat: "dark" });
// 槽車卸料口：快速接頭箱＋接地夾＋接頭防滴盤＋軟管
BOX("tpBox", "tport", -13.4, -9.4, 0.5, 4.6, -1.2, 1.2, "cab"); BOX("tpBoxDoor", "tport", -13.4, -9.4, 0.5, 4.6, 1.2, 1.3, "cabDark");
P({ id: "tpCoupling", layer: "tport", shape: "cyl", size: [0.5, 1.0], rot: HX, pos: [-9.0, 3.1, 0.6], mat: "steel2" }); VT("tpCamlock", "tport", 0.72, 0.5, 0, 0, "steel", {}); // placeholder removed below
P({ id: "tpCam", layer: "tport", shape: "tube", size: [0.75, 0.48, 0.3], rot: HX, pos: [-8.3, 3.1, 0.6], mat: "steel" });
P({ id: "tpCamLever", layer: "tport", shape: "box", size: [0.12, 0.9, 0.12], pos: [-8.3, 3.1, 0.6], at: [[0, 0.7, 0], [0, -0.7, 0]], mat: "estop" });
BOX("tpTray", "tport", -9.6, -6.8, 0.5, 0.9, -0.5, 2.6, "dark"); BOX("tpGround", "tport", -13.4, -13.0, 1.2, 1.8, -0.6, 0.0, "warnY"); P({ id: "tpGroundCable", layer: "tport", shape: "cyl", size: [0.05, 2.2], rot: [0, 0, 20], pos: [-12.6, 1.0, 0.2], mat: "rubber" });
PIPE("tpHose", "tport", [[-8.3, 3.1, 0.6], [-6.8, 2.4, 1.6], [-5.4, 1.0, 2.4], [-4.0, 0.7, 3.4], [-2.6, 0.7, 3.8]], 0.3, "rubber");
// 管路：槽出口 → 後方管路架 → 管理櫃入口
const W0 = XT + 6 + 1.3;
PIPE("pSup", "loopIn", [[W0, 1.6, 0], [W0 + 3, 1.6, 0], [W0 + 3, 1.6, ZP], [XC - 5.5, 1.6, ZP], [XC - 5.5, 3.6, ZP], [XC - 5.5, 3.6, -4.2]], 0.28, "pfa");
LAY("loopIn", [26, 4, 14, 2]);
CLAMPS("pSupC", "loopIn", W0 + 5, XC - 7, 1.6, ZP, 0.28, 4.5);
P({ id: "pSupFl", layer: "loopIn", shape: "tube", size: [0.5, 0.26, 0.22], rot: HX, pos: [W0 + 1.2, 1.6, 0], at: [[0, 0, 0]], mat: "steel2" });
// ── 化學品管理櫃（CDS） ──
LAY("cdsBase", [15.2, 0.8, XC, 0.3]); LAY("cdsWall", [14, 20, XC, 10]); LAY("cdsDoor", [14, 19.4, XC, 10]); LAY("cdsPump", [6, 6, XC - 4, 4]); LAY("cdsValve", [6, 6, XC, 10]); LAY("cdsFilter", [3.4, 10, XC + 4.6, 7.5]); LAY("cdsCore", [2.4, 8, XC + 4.6, 7]); LAY("cdsMeas", [10, 4, XC, 15.5]); LAY("cdsPipe", [14, 18, XC, 9]);
const CDS = CAB("cds", XC, 14, 9, 20, "cdsBase", "cdsWall", "cdsDoor");
BOX("cdsNameplate", "cdsWall", XC - 3, XC + 3, 18.3, 19.1, CDS.z1 - 0.04, CDS.z1 + 0.01, "steel2");
P({ id: "cdsTower", layer: "cdsWall", shape: "cyl", size: [0.28, 0.5], rot: V, pos: [XC + 5.5, 20.25, -2], at: [[0, 0, 0]], mat: "lampG" }); P({ id: "cdsTowerB", layer: "cdsWall", shape: "cyl", size: [0.28, 0.5], rot: V, pos: [XC + 5.5, 20.8, -2], mat: "lampY" });
BOX("cdsLeakTray", "cdsBase", XC - 6.8, XC + 6.8, 0.7, 1.0, -4.2, 4.2, "cabDark"); BOX("cdsLeakSens", "cdsBase", XC - 0.5, XC + 0.5, 1.0, 1.15, 3.0, 3.6, "lampR");
// 泵：雙隔膜泵（兩個泵頭＋中間空氣室＋進氣閥＋脈衝緩衝球）
const PX = XC - 4.3;
BOX("pmpSkid", "cdsPump", PX - 2.4, PX + 2.4, 1.0, 1.5, -1.4, 1.4, "dark");
VC("pmpHeadL", "cdsPump", 1.35, 1.5, 4.4, "steel2", { x: PX - 1.4, z: 0 }); VC("pmpHeadR", "cdsPump", 1.35, 1.5, 4.4, "steel2", { x: PX + 1.4, z: 0 });
VT("pmpFlL", "cdsPump", 1.5, 1.2, 3.1, 3.4, "dark", { x: PX - 1.4, z: 0 }); VT("pmpFlR", "cdsPump", 1.5, 1.2, 3.1, 3.4, "dark", { x: PX + 1.4, z: 0 });
BOX("pmpMid", "cdsPump", PX - 0.55, PX + 0.55, 1.6, 4.0, -0.9, 0.9, "steel"); VC("pmpAir", "cdsPump", 0.24, 4.0, 4.8, "dark", { x: PX, z: 0 });
P({ id: "pmpBolt", layer: "cdsPump", shape: "cyl", size: [0.08, 0.18], rot: V, pos: [PX, 4.5, 0], at: [[-1.4, 0, 0.9], [-1.4, 0, -0.9], [1.4, 0, 0.9], [1.4, 0, -0.9], [-0.7, 0, 1.1], [0.7, 0, 1.1]], mat: "steel" });
SPH("pmpDamper", "cdsPump", 0.8, PX + 2.9, 3.4, 0.2, "pfaT"); VC("pmpDamperNeck", "cdsPump", 0.28, 2.5, 3.0, "steel2", { x: PX + 2.9, z: 0.2 });
VC("pmpTube", "cdsPump", 0.1, 4.8, 7.0, "rubber", { x: PX, z: 0 }); BOX("pmpTag", "cdsPump", PX - 0.4, PX + 0.4, 2.4, 3.0, 0.9, 0.95, "warnY");
// 閥島：歧管塊＋五個氣動閥（致動器＋電磁閥小盒＋氣管）＋壓力轉換器接口
const VX = XC - 0.3;
BOX("vlManifold", "cdsValve", VX - 2.8, VX + 2.8, 8.0, 9.0, -1.0, 1.0, "steel2"); P({ id: "vlPort", layer: "cdsValve", shape: "cyl", size: [0.22, 0.5], pos: [VX, 8.5, 0], at: [[-2.2, 0, 1.2], [-1.1, 0, 1.2], [0, 0, 1.2], [1.1, 0, 1.2], [2.2, 0, 1.2]], mat: "steel" });
P({ id: "vlBody", layer: "cdsValve", shape: "cyl", size: [0.5, 1.0], rot: V, pos: [VX, 9.5, 0], at: [[-2.2, 0, 0], [-1.1, 0, 0], [0, 0, 0], [1.1, 0, 0], [2.2, 0, 0]], mat: "pfa" });
P({ id: "vlAct", layer: "cdsValve", shape: "cyl", size: [0.44, 1.5], rot: V, pos: [VX, 10.8, 0], at: [[-2.2, 0, 0], [-1.1, 0, 0], [0, 0, 0], [1.1, 0, 0], [2.2, 0, 0]], mat: "dark" });
P({ id: "vlCap", layer: "cdsValve", shape: "cyl", size: [0.3, 0.2], rot: V, pos: [VX, 11.65, 0], at: [[-2.2, 0, 0], [-1.1, 0, 0], [0, 0, 0], [1.1, 0, 0], [2.2, 0, 0]], mat: "lampG" });
BOX("vlSolBox", "cdsValve", VX - 2.9, VX + 2.9, 10.2, 11.2, -1.5, -0.9, "cabDark"); P({ id: "vlSolLed", layer: "cdsValve", shape: "sphere", size: [0.06], pos: [VX, 10.9, -0.85], at: [[-2.2, 0, 0], [-1.1, 0, 0], [0, 0, 0], [1.1, 0, 0], [2.2, 0, 0]], mat: "lampG" });
PIPE("vlAir", "cdsValve", [[VX - 2.2, 11.0, -0.9], [VX - 2.2, 11.8, -1.2]], 0.05, "rubber");
// 過濾器殼（右後方，z＝-1.4）：圓筒殼＋上下蓋＋進出口接頭＋排氣閥＋壓差錶；褶疊濾芯另成一層
const FX = XC + 4.6, FZ = -1.4;
VT("cfShell", "cdsFilter", 1.4, 1.28, 2.0, 11.0, "pfaT", { x: FX, z: FZ }); VC("cfCapT", "cdsFilter", 1.55, 11.0, 11.5, "steel2", { x: FX, z: FZ }); VC("cfCapB", "cdsFilter", 1.55, 1.5, 2.0, "steel2", { x: FX, z: FZ });
P({ id: "cfBolt", layer: "cdsFilter", shape: "cyl", size: [0.09, 0.16], rot: V, pos: [FX, 11.55, FZ], at: RING(8, 1.35).map(([a, , b]) => [a, 0, b]), mat: "steel" });
VC("cfVent", "cdsFilter", 0.2, 11.5, 12.2, "steel2", { x: FX, z: FZ }); P({ id: "cfVentH", layer: "cdsFilter", shape: "sphere", size: [0.26], pos: [FX, 12.35, FZ], mat: "estop" });
VC("cfIn", "cdsFilter", 0.3, 1.2, 1.5, "steel2", { x: FX, z: FZ }); HXC("cfOut", "cdsFilter", 0.26, FX + 1.2, FX + 2.4, 10.0, FZ, "pfa"); HXC("cfOutFl", "cdsFilter", 0.4, FX + 2.4, FX + 2.7, 10.0, FZ, "steel2");
VC("cfGauge", "cdsFilter", 0.6, 11.7, 12.0, "steel2", { x: FX + 2.0, z: FZ + 0.8 }); VC("cfGaugeFace", "cdsFilter", 0.5, 12.0, 12.05, "gaugeF", { x: FX + 2.0, z: FZ + 0.8 }); P({ id: "cfNeedle", layer: "cdsFilter", shape: "box", size: [0.06, 0.4, 0.02], rot: [90, 0, 35], pos: [FX + 2.0, 12.08, FZ + 0.8], mat: "estop" });
BOX("cfBracket", "cdsFilter", FX - 0.15, FX + 0.15, 1.0, 11.5, FZ - 1.8, FZ - 1.4, "dark");
VC("cfCoreTube", "cdsCore", 0.5, 2.3, 10.7, "sinter", { x: FX, z: FZ });
P({ id: "cfPleat", layer: "cdsCore", shape: "box", size: [0.07, 8.0, 0.55], pos: [FX, 6.5, FZ], at: Array.from({ length: 20 }, (_, i) => { const [x, z] = pol(i * 18, 0.95); return [x, 0, z]; }), rot: [0, 0, 0], mat: "pleat" });
P({ id: "cfPleatB", layer: "cdsCore", shape: "box", size: [0.5, 8.0, 0.06], pos: [FX, 6.5, FZ], at: Array.from({ length: 20 }, (_, i) => { const [x, z] = pol(i * 18 + 9, 1.0); return [x, 0, z]; }), mat: "pleat" });
VT("cfCoreCapT", "cdsCore", 1.15, 0.45, 10.7, 10.9, "steel2", { x: FX, z: FZ }); VT("cfCoreCapB", "cdsCore", 1.15, 0.45, 2.1, 2.3, "steel2", { x: FX, z: FZ });
// 測量：流量計（本體、顯示、傳感管）＋壓力轉換器（六角、圓筒、接頭、纜線）
const MX = XC - 3.2;
BOX("mtFlow", "cdsMeas", MX - 1.6, MX + 1.6, 14.0, 15.6, -1.2, 1.2, "steel2"); BOX("mtFlowScr", "cdsMeas", MX - 1.0, MX + 1.0, 14.4, 15.2, 1.2, 1.28, "screen"); P({ id: "mtFlowTube", layer: "cdsMeas", shape: "cyl", size: [0.34, 1.5], rot: HX, pos: [MX, 14.8, -0.2], at: [[-2.4, 0, 0]], mat: "pfa" });
HXC("mtFlowIn", "cdsMeas", 0.3, MX - 3.0, MX - 1.6, 14.8, 0, "pfa"); HXC("mtFlowOut", "cdsMeas", 0.3, MX + 1.6, MX + 2.8, 14.8, 0, "pfa");
const NX = XC + 2.6;
VC("mtPtBody", "cdsMeas", 0.5, 14.0, 15.6, "steel2", { x: NX, z: 0 }); P({ id: "mtPtHex", layer: "cdsMeas", shape: "tube", size: [0.7, 0.35, 0.4], rot: V, pos: [NX, 14.4, 0], mat: "steel" }); VC("mtPtConn", "cdsMeas", 0.32, 15.6, 16.2, "conn", { x: NX, z: 0 }); PIPE("mtPtCable", "cdsMeas", [[NX, 16.2, 0], [NX + 0.8, 17.0, 0.4], [NX + 2.0, 17.0, 1.0]], 0.07, "rubber");
BOX("mtPtTag", "cdsMeas", NX - 0.45, NX + 0.45, 14.9, 15.2, 0.5, 0.55, "warnY");
// 管理櫃內部連接細管（不分解）
PIPE("cdsIn", "cdsPipe", [[XC - 5.5, 3.6, -4.2], [XC - 5.5, 3.6, -1.0], [PX - 1.4, 3.6, -1.0], [PX - 1.4, 4.4, -0.2]], 0.2, "pfa");
PIPE("cdsA", "cdsPipe", [[PX + 1.4, 4.4, 0], [PX + 1.4, 7.0, 0], [VX - 2.2, 7.0, 0], [VX - 2.2, 8.5, 0]], 0.18, "pfa");
PIPE("cdsB", "cdsPipe", [[VX + 2.2, 8.5, 0], [VX + 2.2, 6.0, 0], [FX, 6.0, 0], [FX, 1.5, FZ]], 0.18, "pfa");
PIPE("cdsC", "cdsPipe", [[FX + 2.7, 10.0, FZ], [FX + 4.0, 10.0, FZ], [FX + 4.0, 12.0, -3.2], [FX + 4.0, 12.0, -4.2]], 0.2, "pfa");
// ── 管路架：迴路（供應＋回流），雙層管＋管夾＋支撐吊架＋彎頭 ──
LAY("rack", [76, 12, 62, 6]); LAY("loopOut", [72, 3, 62, YR]); LAY("loopRet", [72, 3, 62, YB]);
const XE = XS + 6;
DPIPE("lpS", "loopOut", [[XC + 8.6, 12.0, -4.2], [XC + 8.6, 12.0, ZP], [XC + 8.6, YR, ZP], [XD, YR, ZP], [XD, YR, ZP], [XE, YR, ZP]], 0.28);
DPIPE("lpR", "loopRet", [[XE, YB, ZP - 1.4], [XC + 10.6, YB, ZP - 1.4], [XC + 10.6, YB, -4.2]], 0.24);
CLAMPS("lpSC", "loopOut", XC + 12, XE - 2, YR, ZP, 0.28, 6.5, 0.5); CLAMPS("lpRC", "loopRet", XC + 14, XE - 3, YB, ZP - 1.4, 0.24, 6.5, 0);
P({ id: "rackBeam", layer: "rack", shape: "box", size: [0.3, 0.3, 4.2], pos: [0, YR - 1.1, ZP - 0.7], at: Array.from({ length: 12 }, (_, i) => [XC + 14 + i * 6.5, 0, 0]), mat: "steel" });
P({ id: "rackPost", layer: "rack", shape: "box", size: [0.3, YR - 1.1, 0.3], pos: [0, (YR - 1.1) / 2, ZP + 1.1], at: Array.from({ length: 12 }, (_, i) => [XC + 14 + i * 6.5, 0, 0]), mat: "steel" });
P({ id: "rackPost2", layer: "rack", shape: "box", size: [0.3, YR - 1.1, 0.3], pos: [0, (YR - 1.1) / 2, ZP - 2.5], at: Array.from({ length: 12 }, (_, i) => [XC + 14 + i * 6.5, 0, 0]), mat: "steel" });
P({ id: "rackFoot", layer: "rack", shape: "box", size: [0.9, 0.1, 0.9], pos: [0, 0.05, 0], at: Array.from({ length: 12 }, (_, i) => [XC + 14 + i * 6.5, 0, ZP + 1.1]).concat(Array.from({ length: 12 }, (_, i) => [XC + 14 + i * 6.5, 0, ZP - 2.5])), mat: "dark" });
P({ id: "rackFlow", layer: "rack", shape: "box", size: [0.1, 0.1, 0.4], pos: [0, 0, 0], at: [], mat: "dark" });
parts.pop();
P({ id: "rackArrow", layer: "loopOut", shape: "cone", size: [0.5, 0.0, 1.0], rot: [0, 90, 0], pos: [0, YR + 0.62, ZP], at: [[XC + 22, 0, 0], [XC + 40, 0, 0], [XC + 56, 0, 0]], mat: "warnY" });
// ── 閥箱（液體版）X＝XV ──
LAY("vmbBox", [10.4, 9, XV, 4.5]); LAY("vmbFront", [10.4, 8.6, XV, 4.5]); LAY("vmbIn", [8, 8, XV, 5]);
BOX("vmBase", "vmbBox", XV - 5.2, XV + 5.2, 0, 0.6, -3.0, 3.0, "band"); BOX("vmLeakPan", "vmbBox", XV - 4.8, XV + 4.8, 0.6, 1.0, -2.6, 2.6, "cabDark"); BOX("vmLeakLed", "vmbBox", XV - 0.4, XV + 0.4, 1.0, 1.1, 2.2, 2.6, "lampR");
BOX("vmBack", "vmbBox", XV - 5.2, XV + 5.2, 0.6, 9.0, -3.0, -2.86, "cab"); BOX("vmL", "vmbBox", XV - 5.2, XV - 5.06, 0.6, 9.0, -3.0, 3.0, "cab"); BOX("vmR", "vmbBox", XV + 5.06, XV + 5.2, 0.6, 9.0, -3.0, 3.0, "cab"); BOX("vmTop", "vmbBox", XV - 5.2, XV + 5.2, 8.86, 9.0, -3.0, 3.0, "cab");
VT("vmExhaust", "vmbBox", 0.7, 0.58, 9.0, 10.0, "steel2", { x: XV + 3, z: -1.5 });
BOX("vmFrontP", "vmbFront", XV - 5.2, XV + 5.2, 0.6, 9.0, 3.0, 3.14, "cab"); P({ id: "vmWin", layer: "vmbFront", shape: "box", size: [7.4, 5.6, 0.08], pos: [XV, 5.2, 3.18], mat: "window" });
BOX("vmWinFrT", "vmbFront", XV - 3.9, XV + 3.9, 8.0, 8.14, 3.14, 3.24, "steel2"); BOX("vmWinFrB", "vmbFront", XV - 3.9, XV + 3.9, 2.26, 2.4, 3.14, 3.24, "steel2");
P({ id: "vmHandle", layer: "vmbFront", shape: "box", size: [0.2, 1.4, 0.2], pos: [XV - 4.6, 4.6, 3.3], mat: "steel2" }); BOX("vmPlate", "vmbFront", XV + 2, XV + 4.8, 0.9, 1.7, 3.14, 3.18, "warnY");
P({ id: "vmHinge", layer: "vmbFront", shape: "box", size: [0.26, 0.8, 0.2], pos: [XV + 5.0, 0, 3.1], at: [[0, 2.2, 0], [0, 5.0, 0], [0, 7.8, 0]], mat: "dark" });
// 內部支路：隔離閥、過濾器（小）、壓力表、取樣口（各一排；直管之間有彎頭）
P({ id: "vmValve", layer: "vmbIn", shape: "cyl", size: [0.42, 0.9], rot: V, pos: [XV, 3.6, 0], at: [[-3, 0, 0], [-1, 0, 0], [1, 0, 0], [3, 0, 0]], mat: "pfa" }); P({ id: "vmAct", layer: "vmbIn", shape: "cyl", size: [0.38, 1.3], rot: V, pos: [XV, 4.7, 0], at: [[-3, 0, 0], [-1, 0, 0], [1, 0, 0], [3, 0, 0]], mat: "dark" });
P({ id: "vmFil", layer: "vmbIn", shape: "tube", size: [0.7, 0.6, 3.0], rot: V, pos: [XV, 5.2, -0.7], at: [[-2, 0, 0], [2, 0, 0]], mat: "pfaT" }); P({ id: "vmFilCap", layer: "vmbIn", shape: "cyl", size: [0.78, 0.2], rot: V, pos: [XV, 6.8, -0.7], at: [[-2, 0, 0], [2, 0, 0]], mat: "steel2" });
VC("vmGauge", "vmbIn", 0.5, 6.9, 7.1, "steel2", { x: XV - 3.6, z: 1.6 }); VC("vmGaugeF", "vmbIn", 0.42, 7.1, 7.14, "gaugeF", { x: XV - 3.6, z: 1.6 }); VC("vmSample", "vmbIn", 0.2, 2.2, 3.2, "steel2", { x: XV + 3.6, z: 1.6 }); P({ id: "vmSampleV", layer: "vmbIn", shape: "sphere", size: [0.3], pos: [XV + 3.6, 3.4, 1.6], mat: "estop" });
PIPE("vmHdr", "vmbIn", [[XV - 4.9, 2.7, 0], [XV + 4.9, 2.7, 0]], 0.28, "pfa"); PIPE("vmBr", "vmbIn", [[XV - 3, 2.7, 0], [XV - 3, 3.2, 0]], 0.2, "pfa");
PIPE("vmBrB", "vmbIn", [[XV - 1, 2.7, 0], [XV - 1, 3.2, 0]], 0.2, "pfa"); PIPE("vmBrC", "vmbIn", [[XV + 1, 2.7, 0], [XV + 1, 3.2, 0]], 0.2, "pfa"); PIPE("vmBrD", "vmbIn", [[XV + 3, 2.7, 0], [XV + 3, 3.2, 0]], 0.2, "pfa");
PIPE("vmTop", "loopOut", [[XV, YR - 0.4, ZP], [XV, 9.4, ZP], [XV, 9.4, 0], [XV, 5.0, 0]], 0.2, "pfa");
// ── 機台旁供液櫃／日用槽 X＝XD ──
LAY("dtBase", [13, 0.8, XD, 0.3]); LAY("dtWall", [12, 17, XD, 8.5]); LAY("dtTank", [9, 9, XD, 6]); LAY("dtStir", [4, 8, XD - 3, 6]); LAY("dtFloat", [6, 5, XD, 6]); LAY("dtPump", [3, 3, XD, 2.6]);
const DT = CAB("dt", XD, 12, 8, 17, "dtBase", "dtWall", "dtDoor"); LAY("dtDoor", [12, 16.4, XD, 8.5]);
VT("dtTankA", "dtTank", 1.9, 1.8, 2.2, 10.4, "pfaT", { x: XD - 3, z: 0 }); VC("dtLiqA", "dtTank", 1.78, 2.3, 8.2, "clean", { x: XD - 3, z: 0 }); VC("dtLidA", "dtTank", 2.0, 10.4, 10.7, "steel2", { x: XD - 3, z: 0 });
VT("dtTankB", "dtTank", 1.9, 1.8, 2.2, 10.4, "pfaT", { x: XD + 3, z: 0 }); VC("dtLiqB", "dtTank", 1.78, 2.3, 4.6, "clean", { x: XD + 3, z: 0 }); VC("dtLidB", "dtTank", 2.0, 10.4, 10.7, "steel2", { x: XD + 3, z: 0 });
P({ id: "dtLidBolt", layer: "dtTank", shape: "cyl", size: [0.08, 0.14], rot: V, pos: [0, 10.8, 0], at: RING(8, 1.7).map(([a, , b]) => [XD - 3 + a, 0, b]).concat(RING(8, 1.7).map(([a, , b]) => [XD + 3 + a, 0, b])), mat: "steel" });
VC("dtBaseA", "dtTank", 2.0, 2.0, 2.2, "dark", { x: XD - 3, z: 0 }); VC("dtBaseB", "dtTank", 2.0, 2.0, 2.2, "dark", { x: XD + 3, z: 0 });
P({ id: "dtN2", layer: "dtTank", shape: "cyl", size: [0.12, 2.0], rot: V, pos: [0, 11.6, 0], at: [[XD - 3, 0, 0], [XD + 3, 0, 0]], mat: "pfa" }); HXC("dtN2H", "dtTank", 0.12, XD - 3, XD + 3, 12.6, 0, "pfa");
VC("dtMotor", "dtStir", 0.7, 11.0, 12.8, "dark", { x: XD - 3, z: 0 }); P({ id: "dtMotorFin", layer: "dtStir", shape: "tube", size: [0.78, 0.66, 0.08], rot: V, pos: [XD - 3, 11.6, 0], at: [[0, 0, 0], [0, 0.35, 0], [0, 0.7, 0], [0, 1.05, 0]], mat: "steel" });
VC("dtShaft", "dtStir", 0.08, 4.4, 11.0, "steel", { x: XD - 3, z: 0 }); P({ id: "dtBlade", layer: "dtStir", shape: "box", size: [2.2, 0.08, 0.46], rot: [0, 0, 0], pos: [XD - 3, 4.5, 0], at: [[0, 0, 0]], mat: "steel2" }); P({ id: "dtBladeB", layer: "dtStir", shape: "box", size: [0.46, 0.08, 2.2], pos: [XD - 3, 4.5, 0], mat: "steel2" });
P({ id: "dtFloatRod", layer: "dtFloat", shape: "cyl", size: [0.06, 5.0], rot: V, pos: [XD + 3.9, 6.0, 0], at: [[0, 0, 0]], mat: "steel" }); P({ id: "dtFloatBall", layer: "dtFloat", shape: "sphere", size: [0.3], pos: [XD + 3.9, 4.6, 0], at: [[0, 0, 0], [0, 1.6, 0], [0, 3.0, 0]], mat: "lampY" });
P({ id: "dtOutPump", layer: "dtPump", shape: "cyl", size: [0.8, 1.2], rot: V, pos: [XD, 1.2, 1.8], mat: "steel2" }); VC("dtOutMotor", "dtPump", 0.9, 2.4, 3.4, "dark", { x: XD, z: 1.8 });
PIPE("dtIn", "dtPump", [[XD - 6.0, 3.0, -2.5], [XD - 3, 3.0, -2.5], [XD - 3, 2.4, -1.0]], 0.2, "pfa"); PIPE("dtOut", "dtPump", [[XD, 1.2, 1.8], [XD + 4.2, 1.2, 1.8], [XD + 4.2, 3.0, -2.5], [XD + 6.0, 3.0, -2.5]], 0.2, "pfa");
PIPE("dtN2Pipe", "dtTank", [[XD - 6.0, 12.6, -2.5], [XD - 3, 12.6, -2.5], [XD - 3, 12.6, 0]], 0.1, "dark");
// ── 使用點過濾器 X＝XP（ghost 外殼，內有褶疊濾芯與接頭） ──
LAY("pouShell", [4, 10, XP, 6]); LAY("pouCore", [3, 8, XP, 6]); LAY("pouFit", [8, 12, XP, 6]);
BOX("pouBracket", "pouFit", XP - 0.2, XP + 0.2, 1.0, 9.2, -2.2, -1.8, "dark"); BOX("pouBase", "pouFit", XP - 1.8, XP + 1.8, 0, 0.3, -2.4, 1.4, "dark");
VT("pouWall", "pouShell", 1.6, 1.5, 1.4, 9.0, "pfaT", { x: XP, z: 0 }); VC("pouCapB", "pouShell", 1.75, 1.0, 1.4, "steel2", { x: XP, z: 0 }); VC("pouCapT", "pouShell", 1.75, 9.0, 9.4, "steel2", { x: XP, z: 0 });
P({ id: "pouBolt", layer: "pouShell", shape: "cyl", size: [0.09, 0.16], rot: V, pos: [XP, 9.45, 0], at: RING(8, 1.5).map(([a, , b]) => [a, 0, b]), mat: "steel" });
VC("pouCoreTube", "pouCore", 0.5, 1.5, 8.9, "sinter", { x: XP, z: 0 }); P({ id: "pouPleat", layer: "pouCore", shape: "box", size: [0.07, 7.0, 0.5], pos: [XP, 5.2, 0], at: Array.from({ length: 18 }, (_, i) => { const [x, z] = pol(i * 20, 0.95); return [x, 0, z]; }), mat: "pleat" });
P({ id: "pouPleatB", layer: "pouCore", shape: "box", size: [0.5, 7.0, 0.06], pos: [XP, 5.2, 0], at: Array.from({ length: 18 }, (_, i) => { const [x, z] = pol(i * 20 + 10, 1.0); return [x, 0, z]; }), mat: "pleat" });
VC("pouVent", "pouFit", 0.2, 9.4, 10.1, "steel2", { x: XP, z: 0 }); P({ id: "pouVentH", layer: "pouFit", shape: "sphere", size: [0.26], pos: [XP, 10.25, 0], mat: "estop" });
HXC("pouIn", "pouFit", 0.26, XP - 3.0, XP - 1.5, 2.0, 0, "pfa"); HXC("pouOut", "pouFit", 0.26, XP + 1.5, XP + 3.0, 8.4, 0, "pfa");
VC("pouDp", "pouFit", 0.6, 7.0, 7.3, "steel2", { x: XP + 1.9, z: 1.2 }); VC("pouDpF", "pouFit", 0.5, 7.3, 7.34, "gaugeF", { x: XP + 1.9, z: 1.2 });
// 使用點供料管（z＝-2.5，y＝3.0）：供液櫃 → 過濾器 → 旋轉清洗腔
PIPE("feedA", "loopOut", [[XV + 5.0, 3.0, -2.5], [XD - 6.0, 3.0, -2.5]], 0.2, "pfa");
PIPE("feedB", "feedL", [[XD + 6.0, 3.0, -2.5], [XP - 3.0, 3.0, -2.5], [XP - 3.0, 2.0, -2.5], [XP - 3.0, 2.0, 0]], 0.2, "pfa");
LAY("feedL", [40, 4, 80, 3]);
PIPE("feedC", "feedL", [[XP + 3.0, 8.4, 0], [XP + 3.0, 8.4, -2.5], [XS - 3.0, 8.4, -2.5], [XS - 3.0, 6.8, -2.5]], 0.2, "pfa");
CLAMPS("feedC1", "feedL", XD - 9, XD - 7.5, 3.0, -2.5, 0.2, 1.4, 0); CLAMPS("feedC2", "feedL", XP + 6, XS - 5, 8.4, -2.5, 0.2, 4, 0);
// UPW 純水管（淡藍，與藥液管相鄰）
PIPE("upwP", "feedL", [[XP + 3.0, 9.6, -3.4], [XS + 2.0, 9.6, -3.4], [XS + 2.0, 7.2, -3.4]], 0.2, "upw");
// ── 旋轉清洗腔一角 X＝XS ──
LAY("scBody", [10, 10, XS, 4]); LAY("scCup", [9, 5, XS, 4]); LAY("scChuck", [8, 4, XS, 3]); LAY("scArm", [8, 9, XS, 7]);
BOX("scPlinth", "scBody", XS - 5.4, XS + 5.4, 0, 1.0, -4.0, 4.0, "band"); BOX("scSkirt", "scBody", XS - 5.0, XS + 5.0, 1.0, 2.2, -3.6, 3.6, "cabDark");
BOX("scBack", "scBody", XS - 5.0, XS + 5.0, 2.2, 11.0, -3.6, -3.4, "panel2"); BOX("scLeft", "scBody", XS - 5.0, XS - 4.8, 2.2, 11.0, -3.6, 3.6, "panel2");
BOX("scTopFan", "scBody", XS - 4.0, XS + 4.0, 11.0, 11.8, -3.0, 3.0, "cabDark"); P({ id: "scFilterGrid", layer: "scBody", shape: "box", size: [7.6, 0.06, 0.12], pos: [XS, 11.82, 0], at: Array.from({ length: 6 }, (_, i) => [0, 0, -2.5 + i]), mat: "seam" });
VC("scExhaust", "scBody", 0.9, 0.9, 1.9, "steel2", { x: XS + 3.8, z: -2.2 }); PIPE("scExhaustP", "scBody", [[XS + 3.8, 1.9, -2.2], [XS + 3.8, 2.4, -3.4]], 0.7, "steel2");
VT("scCupWall", "scCup", 4.4, 4.2, 2.2, 7.4, "pfaT", { x: XS, z: 0 }); VT("scCupLip", "scCup", 4.7, 3.4, 7.4, 7.8, "steel2", { x: XS, z: 0 }); VC("scCupBot", "scCup", 4.2, 2.0, 2.3, "dark", { x: XS, z: 0 });
VT("scDrain", "scCup", 0.8, 0.5, 1.0, 2.1, "steel2", { x: XS + 2.6, z: 1.6 });
VC("scSpindle", "scChuck", 0.9, 2.2, 4.4, "steel2", { x: XS, z: 0 }); VC("scChuckD", "scChuck", 3.5, 4.4, 4.8, "chuckM", { x: XS, z: 0 }); P({ id: "scPin", layer: "scChuck", shape: "cyl", size: [0.12, 0.3], rot: V, pos: [XS, 5.0, 0], at: RING(6, 3.2).map(([a, , b]) => [a, 0, b]), mat: "steel" });
VC("scWafer", "scChuck", 3.1, 4.8, 4.88, "steel2", { x: XS, z: 0 }); P({ id: "scWaferGrid", layer: "scChuck", shape: "box", size: [5.0, 0.012, 0.03], pos: [XS, 4.9, 0], at: [[0, 0, -1.6], [0, 0, 0], [0, 0, 1.6]], mat: "tgtFace" }); P({ id: "scWaferGridB", layer: "scChuck", shape: "box", size: [0.03, 0.012, 5.0], pos: [XS, 4.9, 0], at: [[-1.6, 0, 0], [0, 0, 0], [1.6, 0, 0]], mat: "tgtFace" });
VC("scFilm", "scChuck", 3.05, 4.88, 5.0, "clean", { x: XS, z: 0 });
BOX("scArmPost", "scArm", XS - 4.9, XS - 4.3, 2.2, 8.4, -2.8, -2.2, "steel2"); BOX("scArmBar", "scArm", XS - 4.9, XS + 0.4, 8.0, 8.6, -2.8, -2.2, "steel2"); P({ id: "scArmCover", layer: "scArm", shape: "slab", size: [5.4, 0.3, 0.8], r: 0.1, pos: [XS - 2.2, 8.9, -2.5], mat: "cab" });
VC("scNozzle", "scArm", 0.22, 6.2, 8.0, "steel", { x: XS, z: -2.5 }); VC("scNozzle2", "scArm", 0.12, 5.8, 6.2, "steel2", { x: XS, z: -2.5 }); P({ id: "scNzLed", layer: "scArm", shape: "sphere", size: [0.1], pos: [XS - 4.6, 8.9, -2.1], mat: "lampG" });
PIPE("scNzTube", "scArm", [[XS - 3.0, 6.8, -2.5], [XS - 3.0, 8.4, -2.5], [XS, 8.4, -2.5], [XS, 8.0, -2.5]], 0.16, "pfa"); PIPE("scUpw", "scArm", [[XS + 2.0, 7.2, -3.4], [XS + 2.0, 8.9, -3.4], [XS, 8.9, -2.9], [XS, 8.4, -2.8]], 0.12, "upw");
// ── 廢液收集櫃 X＝XW ──
LAY("wsBase", [11, 0.8, XW, 0.3]); LAY("wsWall", [10, 12, XW, 6]); LAY("wsDoor", [10, 11.4, XW, 6]); LAY("wsTank", [8, 6, XW, 5]);
const WS = CAB("ws", XW, 10, 6.4, 12, "wsBase", "wsWall", "wsDoor");
P({ id: "wsTankA", layer: "wsTank", shape: "tube", size: [1.5, 1.4, 5.0], rot: V, pos: [XW, 4.0, 0], at: [[-2.6, 0, 0], [0, 0, 0], [2.6, 0, 0]], mat: "pfaT" });
P({ id: "wsLiq", layer: "wsTank", shape: "cyl", size: [1.38, 2.6], rot: V, pos: [XW, 3.3, 0], at: [[-2.6, 0, 0], [0, 0, 0], [2.6, 0, 0]], mat: "etch" });
P({ id: "wsTag", layer: "wsTank", shape: "box", size: [1.5, 0.5, 0.06], pos: [XW, 7.0, 1.7], at: [[-2.6, 0, 0], [0, 0, 0], [2.6, 0, 0]], mat: "warnY" }); P({ id: "wsLed", layer: "wsTank", shape: "sphere", size: [0.14], pos: [XW, 7.7, 1.7], at: [[-2.6, 0, 0], [0, 0, 0], [2.6, 0, 0]], mat: "lampR" });
PIPE("wsDrain", "wsTank", [[XS + 2.6, 1.0, 1.6], [XS + 2.6, 0.9, 3.2], [XW - 2.6, 0.9, 3.2], [XW - 2.6, 5.8, 3.2], [XW - 2.6, 5.8, 0]], 0.16, "pfa");

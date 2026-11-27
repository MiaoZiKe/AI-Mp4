
// ═════ S5（x＝150）：鐵管 vs 塑膠管（半透明剖視）＋檸檬與鐵杯 ═════
const X5 = 152, Y5 = 3.6;
LAY("ironPipe", [24, 6, X5, Y5]); LAY("ironAcid", [22, 4, X5, Y5]); LAY("rustA", [3, 3, X5 - 6, 2]); LAY("rustB", [3, 3, X5, 2]); LAY("rustC", [3, 3, X5 + 6, 2]);
LAY("pfaPipe", [24, 6, X5, Y5]); LAY("pfaAcid", [22, 4, X5, Y5]); LAY("lemon", [8, 6, X5 - 17, 3]);
const Z5I = -4.6, Z5P = 4.6, R5 = 2.3;
HXC("irWall", "ironPipe", R5, X5 - 11, X5 + 11, Y5, Z5I, "ironGhost"); HXC("irAcid", "ironAcid", R5 - 0.15, X5 - 10.9, X5 + 10.9, Y5, Z5I, "acid");
P({ id: "irFl", layer: "ironPipe", shape: "tube", size: [R5 + 0.7, R5 - 0.05, 0.45], rot: HX, pos: [0, Y5, Z5I], at: [[X5 - 11, 0, 0], [X5 + 11, 0, 0], [X5 - 3.7, 0, 0], [X5 + 3.7, 0, 0]], mat: "iron" });
P({ id: "irBolt", layer: "ironPipe", shape: "cyl", size: [0.13, 0.3], rot: HX, pos: [0, Y5, Z5I], at: [X5 - 11, X5 + 11, X5 - 3.7, X5 + 3.7].flatMap((xx) => Array.from({ length: 8 }, (_, i) => { const [y, z] = pol(i * 45, R5 + 0.45); return [xx, y, z]; })), mat: "ironDark" });
P({ id: "irStand", layer: "ironPipe", shape: "box", size: [0.5, Y5 - R5 - 0.1, 1.2], pos: [0, (Y5 - R5 - 0.1) / 2, Z5I], at: [[X5 - 7, 0, 0], [X5 + 7, 0, 0]], mat: "iron" });
HXC("pfWall", "pfaPipe", R5, X5 - 11, X5 + 11, Y5, Z5P, "pfaT"); HXC("pfAcid", "pfaAcid", R5 - 0.15, X5 - 10.9, X5 + 10.9, Y5, Z5P, "acid");
P({ id: "pfFl", layer: "pfaPipe", shape: "tube", size: [R5 + 0.7, R5 - 0.05, 0.45], rot: HX, pos: [0, Y5, Z5P], at: [[X5 - 11, 0, 0], [X5 + 11, 0, 0], [X5 - 3.7, 0, 0], [X5 + 3.7, 0, 0]], mat: "pfa" });
P({ id: "pfBolt", layer: "pfaPipe", shape: "cyl", size: [0.13, 0.3], rot: HX, pos: [0, Y5, Z5P], at: [X5 - 11, X5 + 11, X5 - 3.7, X5 + 3.7].flatMap((xx) => Array.from({ length: 8 }, (_, i) => { const [y, z] = pol(i * 45, R5 + 0.45); return [xx, y, z]; })), mat: "steel" });
P({ id: "pfStand", layer: "pfaPipe", shape: "box", size: [0.5, Y5 - R5 - 0.1, 1.2], pos: [0, (Y5 - R5 - 0.1) / 2, Z5P], at: [[X5 - 7, 0, 0], [X5 + 7, 0, 0]], mat: "steel2" });
// 鐵管內壁的腐蝕斑（三個位置，先後出現）：扁平的紅褐色塊貼在內壁底部＋剝落的鏽塊
for (const [id, dx] of [["rustA", -6], ["rustB", 0], ["rustC", 6]]) {
  P({ id: `${id}Patch`, layer: id, shape: "sphere", size: [0.9], scale: [1.4, 0.25, 0.9], pos: [X5 + dx, Y5 - R5 + 0.28, Z5I], mat: "rust" });
  P({ id: `${id}Pit`, layer: id, shape: "sphere", size: [0.3], scale: [1, 0.3, 1], pos: [X5 + dx, Y5 - R5 + 0.32, Z5I], at: [[-0.7, 0, 0.2], [0.6, 0, -0.3], [0.1, 0, 0.5], [-0.2, 0, -0.5]], mat: "rustDark" });
}
actions.irBubbles = { type: "flow", _說明: "酸咬金屬：腐蝕斑冒出小氣泡，向上飄到液面（示意）", layer: "ironAcid", path: [[X5 - 6, Y5 - R5 + 0.5, Z5I], [X5 - 6, Y5 + 1.4, Z5I], [X5, Y5 - R5 + 0.5, Z5I], [X5, Y5 + 1.4, Z5I]], n: 8, size: 0.1, shape: "dot", rate: 0.9, color: "bubC", track: false, rise: true, jitter: 0.5, free: true };
actions.rustFlow = { type: "flow", _說明: "鏽紅色金屬粒子從管壁剝落，被液流帶往下游（示意）", layer: "ironAcid", path: [[X5 - 6, Y5 - R5 + 0.6, Z5I], [X5 - 2, Y5 - 0.6, Z5I], [X5 + 6, Y5 - 0.2, Z5I], [X5 + 10, Y5 - 0.2, Z5I]], n: 12, size: 0.17, shape: "dot", rate: 0.2, color: "rustC", track: false, jitter: 0.5, free: true, rim: "dark" };
actions.irFlow = { type: "flow", _說明: "鐵管內的酸液流向右（對照組，與塑膠管同速）", layer: "ironAcid", path: [[X5 - 10.5, Y5, Z5I], [X5 + 10.5, Y5, Z5I]], n: 18, lanes: 3, laneDir: [0, 0, 1], laneGap: 0.7, size: 0.1, shape: "dot", rate: 0.12, color: "acidC", track: false, jitter: 0.8, free: true };
actions.pfFlow = { type: "flow", _說明: "塑膠管內的酸液流向右：沒有雜質", layer: "pfaAcid", path: [[X5 - 10.5, Y5, Z5P], [X5 + 10.5, Y5, Z5P]], n: 18, lanes: 3, laneDir: [0, 0, 1], laneGap: 0.7, size: 0.1, shape: "dot", rate: 0.12, color: "acidC", track: false, jitter: 0.8, free: true };
actions.rustGlowA = { type: "pulse", parts: ["rustAPatch"], color: "rustC", glow: 0.6, steady: true, halo: 0 };
// 檸檬（半顆，果肉辨識）＋鐵杯（內壁生鏽）
const XL = X5 - 17;
P({ id: "lemHalf", layer: "lemon", shape: "sphere", size: [1.9], scale: [1, 0.9, 0.55], pos: [XL, 2.2, 3.0], mat: "lemon" }); P({ id: "lemRing", layer: "lemon", shape: "tube", size: [1.78, 1.5, 0.08], pos: [XL, 2.2, 3.52], mat: "slurryS" });
P({ id: "lemSeg", layer: "lemon", shape: "box", size: [0.06, 1.5, 0.06], pos: [XL, 2.2, 3.56], at: Array.from({ length: 8 }, (_, i) => [0, 0, 0]), rot: [0, 0, 0], mat: "slurryS" });
P({ id: "lemSegB", layer: "lemon", shape: "box", size: [1.5, 0.06, 0.06], pos: [XL, 2.2, 3.57], mat: "slurryS" }); P({ id: "lemSegC", layer: "lemon", shape: "box", size: [1.5, 0.06, 0.06], rot: [0, 0, 45], pos: [XL, 2.2, 3.58], mat: "slurryS" }); P({ id: "lemSegD", layer: "lemon", shape: "box", size: [1.5, 0.06, 0.06], rot: [0, 0, -45], pos: [XL, 2.2, 3.59], mat: "slurryS" });
VT("cupWall", "lemon", 1.6, 1.45, 0.2, 3.6, "iron", { x: XL, z: -3.0 }); VC("cupBot", "lemon", 1.6, 0.1, 0.4, "ironDark", { x: XL, z: -3.0 }); VT("cupRim", "lemon", 1.7, 1.4, 3.5, 3.7, "steel2", { x: XL, z: -3.0 });
P({ id: "cupRust", layer: "lemon", shape: "sphere", size: [0.5], scale: [1, 0.5, 1], pos: [XL, 1.6, -3.0], at: [[0.9, 0.6, 0.7], [-0.7, 0.2, 0.9], [0.1, 1.1, -1.1]], mat: "rust" });
P({ id: "cupHandle", layer: "lemon", shape: "tube", size: [1.0, 0.8, 0.15], rot: [0, 0, 0], pos: [XL + 2.2, 2.3, -3.0], mat: "iron" });
actions.lemonDrip = { type: "flow", _說明: "檸檬汁滴進鐵杯", layer: "lemon", path: [[XL, 1.0, 3.0], [XL, 0.5, 1.0], [XL, 1.0, -2.6]], n: 3, size: 0.12, shape: "liquid", rate: 0.5, color: "lemonC", track: false, accel: true, free: true };
Object.assign(anchors, { ironP: A("ironPipe", [X5 - 8, Y5 + 2.3, Z5I], -150, -90), pfaP: A("pfaPipe", [X5 - 8, Y5 + 2.3, Z5P], -150, -90), rustP: A("rustA", [X5 - 6, 1.6, Z5I], 150, 100), cup: A("lemon", [XL, 3.7, -3.0], -150, -90) });

// ═════ S6（x＝182）：研磨液放大剖面＋晶圓表面（磨粒機械磨＋藥劑溶出氧化層） ═════
const X6 = 182, XB = X6 + 1.0;
LAY("slBlock", [20, 9, X6, 7]); LAY("wfSurf", [20, 3, X6, 1.2]); LAY("bumpHi", [4.4, 1.8, XB, 3.0]); LAY("bumpLo", [4.4, 0.8, XB, 2.4]); LAY("oxFilm", [16, 0.5, X6, 2.55]); LAY("slPad", [20, 1.6, X6, 12.6]);
LAY("grainFree", [18, 7, X6, 7.5]); LAY("grainPress", [5, 3, XB, 4.4]); LAY("oxMol", [18, 7, X6, 7.5]); LAY("debris", [4, 3, XB + 3, 4]);
BOX("sfSlab", "wfSurf", X6 - 10, X6 + 10, 0, 2.0, -3.4, 3.4, "sub"); BOX("sfSlabTop", "wfSurf", X6 - 10, X6 + 10, 2.0, 2.2, -3.4, 3.4, "steel2");
P({ id: "sfLat", layer: "wfSurf", shape: "sphere", size: [0.22], pos: [X6 - 9.6, 1.0, 3.45], at: Array.from({ length: 28 }, (_, i) => [i * 0.7, 0, 0]).concat(Array.from({ length: 28 }, (_, i) => [i * 0.7 + 0.35, -0.5, 0])), mat: "subD" });
BOX("bumpHiBox", "bumpHi", XB - 2.0, XB + 2.0, 2.2, 3.9, -2.0, 2.0, "steel2"); BOX("bumpLoBox", "bumpLo", XB - 2.0, XB + 2.0, 2.2, 3.0, -2.0, 2.0, "steel2");
BOX("oxFilmBox", "oxFilm", X6 - 10, X6 - 2.0, 2.2, 2.55, -3.4, 3.4, "oxFilmM"); BOX("oxFilmBoxR", "oxFilm", XB + 2.0, X6 + 10, 2.2, 2.55, -3.4, 3.4, "oxFilmM");
BOX("slBox", "slBlock", X6 - 10, X6 + 10, 2.2, 12.4, -3.4, 3.4, "slurryT");
BOX("slPadBody", "slPad", X6 - 10, X6 + 10, 12.4, 14.0, -3.4, 3.4, "pad"); P({ id: "slPadGroove", layer: "slPad", shape: "box", size: [0.2, 0.2, 6.8], pos: [X6, 14.02, 0], at: Array.from({ length: 9 }, (_, i) => [-8 + i * 2, 0, 0]), mat: "padDark" });
BOX("slPadPlaten", "slPad", X6 - 10, X6 + 10, 14.0, 14.4, -3.4, 3.4, "steel2");
// 磨粒：二氧化矽圓球（淡藍白）。自由漂浮 40 顆（散在液體裡，每顆各自做布朗運動），受壓 4 顆（夾在凸起與墊之間）
const rnd = (() => { let s = 20261127; return () => { s = (s * 1664525 + 1013904223) % 4294967296; return s / 4294967296; }; })();
const FREE = Array.from({ length: 44 }, () => [R2(X6 - 9 + rnd() * 18), R2(4.0 + rnd() * 7.6), R2(-3 + rnd() * 6)]).filter(([x, y]) => !(x > XB - 2.6 && x < XB + 2.6 && y < 8.4));
P({ id: "gFree", layer: "grainFree", shape: "sphere", size: [0.36], pos: [0, 0, 0], at: FREE, mat: "silica" });
P({ id: "gFreeB", layer: "grainFree", shape: "sphere", size: [0.28], pos: [0, 0, 0], at: Array.from({ length: 26 }, () => [R2(X6 - 9 + rnd() * 18), R2(3.6 + rnd() * 8), R2(-3 + rnd() * 6)]).filter(([x, y]) => !(x > XB - 2.6 && x < XB + 2.6 && y < 8.4)), mat: "silica" });
P({ id: "gPress", layer: "grainPress", shape: "sphere", size: [0.42], pos: [0, 0, 0], at: [[XB - 1.2, 4.35, -0.8], [XB + 0.4, 4.4, 0.6], [XB + 1.4, 4.35, -0.4], [XB - 0.3, 4.4, -1.5]], mat: "silica" });
P({ id: "gPressStem", layer: "grainPress", shape: "cyl", size: [0.05, 8.0], rot: V, pos: [0, 8.4, 0], at: [[XB - 1.2, 0, -0.8], [XB + 0.4, 0, 0.6], [XB + 1.4, 0, -0.4], [XB - 0.3, 0, -1.5]], mat: "edge" });
// 氧化劑小分子（紅白雙球）：游向表面
P({ id: "oxA", layer: "oxMol", shape: "sphere", size: [0.17], pos: [0, 0, 0], at: Array.from({ length: 22 }, () => [R2(X6 - 9 + rnd() * 7), R2(5 + rnd() * 6), R2(-3 + rnd() * 6)]), mat: "ohO" });
P({ id: "oxB", layer: "oxMol", shape: "sphere", size: [0.1], pos: [0.22, 0.12, 0], at: Array.from({ length: 22 }, () => [R2(X6 - 9 + rnd() * 7), R2(5 + rnd() * 6), R2(-3 + rnd() * 6)]), mat: "ohH" });
P({ id: "debrisS", layer: "debris", shape: "sphere", size: [0.14], pos: [0, 0, 0], at: [[XB + 2.6, 3.2, 0.3], [XB + 3.2, 3.6, -0.6], [XB + 2.9, 4.2, 0.8], [XB + 3.8, 3.4, 0.1]], mat: "silica" });
actions.brown = { type: "vibrate", _說明: "磨粒的布朗運動：微小隨機抖動（示意）", parts: ["gFree", "gFreeB", "oxA", "oxB"], axis: [0.6, 0.8, 0.4], amp: 0.1, freq: 3.2 };
actions.drift = { type: "flow", _說明: "磨粒隨液體緩緩流動", layer: "grainFree", path: [[X6 - 9, 8, 0], [X6 + 9, 8.6, 0]], n: 10, size: 0.3, shape: "dot", rate: 0.05, color: "silicaC", track: false, jitter: 2.4, free: true, rim: "steelC" };
actions.oxIn = { type: "flow", _說明: "氧化劑分子游向表面，把凸起處與表面的氧化層溶出（化學）", layer: "oxMol", path: [[X6 - 7, 10, 0], [X6 - 6, 3.2, 0.6]], n: 6, size: 0.16, shape: "mol", rate: 0.3, color: "oxidC", track: false, jitter: 1.4, free: true };
actions.grit = { type: "flow", _說明: "被磨下來的微小碎屑被液流帶走（機械）", layer: "debris", path: [[XB + 2.3, 3.4, 0], [XB + 5.5, 6.0, 0.8]], n: 6, size: 0.12, shape: "dot", rate: 0.4, color: "silicaC", track: false, jitter: 0.5, free: true };
actions.padPress = { type: "pulse", _說明: "墊子往下壓（受壓處亮）", parts: ["gPress"], color: "silicaC", glow: 0.6, steady: true, halo: 0 };
// 刮傷示範：結塊的大顆粒夾在墊與晶圓之間劃出一道紅線（只演一次）；線一段一段露出
LAY("lump", [3.4, 2.4, X6 - 6, 4.0]); BOX("lumpA", "lump", X6 - 7.4, X6 - 5.2, 2.2, 4.6, -1.0, 1.0, "lump"); P({ id: "lumpB", layer: "lump", shape: "sphere", size: [0.95], pos: [X6 - 5.4, 3.2, 0.6], mat: "lump" }); P({ id: "lumpC", layer: "lump", shape: "sphere", size: [0.8], pos: [X6 - 7.2, 4.3, -0.4], mat: "lump" }); P({ id: "lumpD", layer: "lump", shape: "sphere", size: [0.7], pos: [X6 - 6.4, 3.6, 0.9], mat: "silica" });
for (let i = 0; i < 6; i++) { LAY(`scr${i}`, [2, 0.4, X6 - 4 + i * 1.9, 2.4]); BOX(`scrBar${i}`, `scr${i}`, X6 - 6.8 + i * 1.9, X6 - 4.8 + i * 1.9, 2.2, 2.4, -0.18, 0.18, "scratch"); }
Object.assign(anchors, { slurry: A("slBlock", [X6 + 7, 10.4, 3.4], 150, -90), grain: A("grainPress", [XB + 1.4, 4.4, 0.0], 150, 100), ox: A("oxFilm", [X6 - 7.4, 2.5, 3.4], -150, 100), bump: A("bumpHi", [XB + 1.8, 3.5, 2.0], 150, 110), lumpL: A("lump", [X6 - 5.4, 4.3, 0.8], -150, -100), scratchL: A("scr3", [X6 - 0.4, 2.3, 0.2], 150, 100) });

// ═════ S7（x＝218）：研磨液混合／循環槽組 ═════
const X7 = 218;
LAY("slBase", [24, 0.8, X7, 0.3]); LAY("slWall", [22, 16, X7, 8]); LAY("slDoor", [22, 15.4, X7, 8]); LAY("slTankA", [7, 11, X7 - 5, 6]); LAY("slLiq", [6, 7, X7 - 5, 5]); LAY("slLid", [7, 1.2, X7 - 5, 11.6]); LAY("slStir", [4, 9, X7 - 5, 7]);
LAY("slTankB", [7, 11, X7 + 5, 6]); LAY("slSed", [6, 2.4, X7 - 5, 2.8]); LAY("slPump", [4, 3, X7 + 1, 2]); LAY("slFilter", [3.4, 9, X7 + 5, 6]); LAY("slFCore", [2.4, 6, X7 + 5, 6]); LAY("slTrap", [2.4, 2, X7 + 5, 4]); LAY("slPipe", [18, 12, X7, 6]); LAY("slN2", [8, 3, X7 - 5, 11.6]);
const SLC = CAB("sl", X7, 22, 9, 16, "slBase", "slWall", "slDoor");
// 混合槽 A（攪拌）：透明槽身＋液體＋蓋（可掀）＋攪拌軸與葉片；槽底沉積的結塊
const AX = X7 - 5, BX = X7 + 5;
VT("saWall", "slTankA", 3.0, 2.9, 1.6, 11.0, "pfaT", { x: AX, z: 0 }); VC("saBot", "slTankA", 3.0, 1.4, 1.65, "dark", { x: AX, z: 0 }); VC("saLiq", "slLiq", 2.88, 1.7, 8.6, "slurry", { x: AX, z: 0 });
VT("saFoot", "slTankA", 3.2, 2.9, 0.8, 1.4, "steel2", { x: AX, z: 0 });
VC("saLidD", "slLid", 3.1, 11.0, 11.35, "steel2", { x: AX, z: 0 }); P({ id: "saLidBolt", layer: "slLid", shape: "cyl", size: [0.09, 0.16], rot: V, pos: [AX, 11.42, 0], at: RING(10, 2.75).map(([a, , b]) => [a, 0, b]), mat: "steel" });
VC("saMotor", "slLid", 0.9, 11.35, 13.4, "dark", { x: AX, z: 0 }); P({ id: "saMotorFin", layer: "slLid", shape: "tube", size: [1.0, 0.86, 0.08], rot: V, pos: [AX, 11.9, 0], at: [[0, 0, 0], [0, 0.4, 0], [0, 0.8, 0], [0, 1.2, 0]], mat: "steel" });
VC("saPortN2", "slLid", 0.25, 11.35, 12.2, "steel2", { x: AX + 2.0, z: 0 }); VC("saPortIn", "slLid", 0.25, 11.35, 12.0, "steel2", { x: AX - 2.0, z: 0 });
VC("saShaft", "slStir", 0.1, 3.4, 11.4, "steel", { x: AX, z: 0 }); P({ id: "saProp", layer: "slStir", shape: "box", size: [2.4, 0.1, 0.55], rot: [0, 0, 0], pos: [AX, 3.6, 0], mat: "steel2" }); P({ id: "saPropB", layer: "slStir", shape: "box", size: [0.55, 0.1, 2.4], pos: [AX, 3.9, 0], mat: "steel2" }); P({ id: "saHub", layer: "slStir", shape: "sphere", size: [0.3], pos: [AX, 3.75, 0], mat: "steel" });
// 結塊：槽底幾塊灰色不規則塊（與正常磨粒對比）
P({ id: "sedLump", layer: "slSed", shape: "box", size: [0.7, 0.55, 0.6], pos: [AX, 1.95, 0], at: [[-1.4, 0, 0.6], [-0.6, 0.05, -0.9], [0.7, 0, 0.9], [1.3, 0.02, -0.4], [0.2, 0.0, 0.1], [-1.9, 0, -0.3]], rot: [10, 25, 15], mat: "lump" });
P({ id: "sedLumpB", layer: "slSed", shape: "sphere", size: [0.38], pos: [AX, 2.0, 0], at: [[-0.9, 0, 0.9], [1.0, 0, -0.9], [-0.2, 0.4, -0.5], [1.7, 0, 0.5]], mat: "lump" });
// 供應槽 B
VT("sbWall", "slTankB", 3.0, 2.9, 1.6, 11.0, "pfaT", { x: BX, z: 0 }); VC("sbBot", "slTankB", 3.0, 1.4, 1.65, "dark", { x: BX, z: 0 }); VC("sbLiq", "slTankB", 2.88, 1.7, 6.2, "slurry", { x: BX, z: 0 }); VT("sbFoot", "slTankB", 3.2, 2.9, 0.8, 1.4, "steel2", { x: BX, z: 0 }); VC("sbLid", "slTankB", 3.1, 11.0, 11.35, "steel2", { x: BX, z: 0 });
P({ id: "sbBolt", layer: "slTankB", shape: "cyl", size: [0.09, 0.16], rot: V, pos: [BX, 11.42, 0], at: RING(10, 2.75).map(([a, , b]) => [a, 0, b]), mat: "steel" }); VC("sbOut", "slTankB", 0.26, 11.35, 12.4, "steel2", { x: BX, z: 0 });
// 濕氮封：槽頂淡薄霧（flow）＋氮氣管
PIPE("n2Line", "slN2", [[AX + 2.0, 12.2, 0], [AX + 2.0, 13.4, 0], [AX + 8.0, 13.4, 0], [AX + 8.0, 12.4, 0]], 0.1, "dark");
// 循環迴路：A 槽底出口 → 泵 → 迴路過濾器（垂直）→ 回 A 槽頂。過濾器可上抽。
const PP = X7 + 0.6, FF = X7 + 5.0;
P({ id: "slPmpHead", layer: "slPump", shape: "cyl", size: [0.9, 1.1], rot: V, pos: [PP, 1.9, 2.4], mat: "steel2" }); VC("slPmpMotor", "slPump", 0.9, 2.45, 3.6, "dark", { x: PP, z: 2.4 }); P({ id: "slPmpFin", layer: "slPump", shape: "tube", size: [1.0, 0.86, 0.08], rot: V, pos: [PP, 3.0, 2.4], at: [[0, 0, 0], [0, 0.3, 0], [0, 0.6, 0]], mat: "steel" });
VT("sfShell", "slFilter", 1.5, 1.38, 1.8, 9.6, "pfaT", { x: FF, z: 2.4 }); VC("sfCapB", "slFilter", 1.65, 1.4, 1.8, "steel2", { x: FF, z: 2.4 }); VC("sfCapT", "slFilter", 1.65, 9.6, 10.0, "steel2", { x: FF, z: 2.4 });
P({ id: "sfBolt", layer: "slFilter", shape: "cyl", size: [0.09, 0.16], rot: V, pos: [FF, 10.05, 2.4], at: RING(8, 1.45).map(([a, , b]) => [a, 0, b]), mat: "steel" }); VC("sfVent", "slFilter", 0.2, 10.0, 10.7, "steel2", { x: FF, z: 2.4 }); P({ id: "sfVentH", layer: "slFilter", shape: "sphere", size: [0.26], pos: [FF, 10.85, 2.4], mat: "estop" });
VC("sfTag", "slFilter", 0.0001, 5.0, 5.0001, "warnY", { x: FF, z: 2.4 }); parts.pop();
BOX("sfTagB", "slFilter", FF + 1.45, FF + 1.6, 4.4, 5.6, 2.1, 2.7, "warnY");
VC("sfCoreTube", "slFCore", 0.5, 2.0, 9.4, "sinter", { x: FF, z: 2.4 }); P({ id: "sfPleat", layer: "slFCore", shape: "box", size: [0.07, 6.6, 0.5], pos: [FF, 5.7, 2.4], at: Array.from({ length: 18 }, (_, i) => { const [x, z] = pol(i * 20, 0.95); return [x, 0, z]; }), mat: "pleat" });
P({ id: "sfPleatB", layer: "slFCore", shape: "box", size: [0.5, 6.6, 0.06], pos: [FF, 5.7, 2.4], at: Array.from({ length: 18 }, (_, i) => { const [x, z] = pol(i * 20 + 10, 1.0); return [x, 0, z]; }), mat: "pleat" });
VT("sfCoreCapT", "slFCore", 1.2, 0.45, 9.4, 9.6, "steel2", { x: FF, z: 2.4 }); VT("sfCoreCapB", "slFCore", 1.2, 0.45, 1.9, 2.1, "steel2", { x: FF, z: 2.4 });
P({ id: "sfTrapL", layer: "slTrap", shape: "box", size: [0.55, 0.5, 0.5], pos: [FF, 3.6, 2.4], at: [[-1.2, 0, 0.3], [0.6, 0.9, 1.2], [1.1, 0.2, -0.5], [-0.3, 1.8, -1.1]], rot: [10, 30, 15], mat: "lump" });
PIPE("sloOut", "slPipe", [[AX, 1.7, 0], [AX, 1.2, 0], [AX, 1.2, 2.4], [PP - 0.9, 1.2, 2.4]], 0.24, "pfa"); PIPE("sloA", "slPipe", [[PP + 0.9, 1.9, 2.4], [PP + 2.4, 1.9, 2.4], [PP + 2.4, 1.2, 2.4], [FF, 1.2, 2.4], [FF, 1.8, 2.4]], 0.24, "pfa");
PIPE("sloB", "slPipe", [[FF, 9.6, 2.4], [FF, 12.0, 2.4], [AX - 2.0, 12.0, 2.4], [AX - 2.0, 12.0, 0]], 0.24, "pfa");
PIPE("sloSupply", "slPipe", [[BX, 12.4, 0], [BX, 14.2, 0], [BX + 7.0, 14.2, 0], [BX + 7.0, 13.4, 0]], 0.2, "pfa");
LAY("slFlowGuide", [1, 1, X7, 0.5], true);
actions.stirSpin = { type: "rotate", _說明: "攪拌槳：起轉有加速、慢速穩轉（示意）", parts: ["saShaft", "saProp", "saPropB", "saHub"], axis: [0, 1, 0], pivot: [AX, 6, 0], pivots: Object.fromEntries(["saShaft", "saProp", "saPropB", "saHub"].map((k) => [k, [AX, 6, 0]])), rps: 0.55, rampSpin: true };
actions.suspend = { type: "flow", _說明: "槽內磨粒被攪起來、均勻懸浮（淡藍白）", layer: "slLiq", path: [[AX - 2.2, 2.6, 0.3], [AX - 2.2, 7.6, 0.3], [AX + 2.2, 7.6, 0.3], [AX + 2.2, 2.6, 0.3]], n: 14, size: 0.13, shape: "dot", rate: 0.3, color: "silicaC", track: false, jitter: 0.5, free: true, rim: "steelC" };
actions.sedFlow = { type: "flow", _說明: "結塊的大顆粒（灰）被迴路從槽底抽走", layer: "slSed", path: [[AX - 1.5, 2.1, 0.5], [AX, 1.3, 0.1], [AX, 1.2, 2.4]], n: 5, size: 0.2, shape: "dot", rate: 0.25, color: "lumpC", track: false, jitter: 0.2, free: true, rim: "dark" };
actions.loopA = { type: "flow", _說明: "研磨液沿迴路：槽底 → 泵 → 過濾器 → 回槽頂", layer: "slPipe", path: [[AX, 1.7, 0], [AX, 1.2, 0], [AX, 1.2, 2.4], [PP - 0.9, 1.2, 2.4], [PP + 0.9, 1.9, 2.4], [PP + 2.4, 1.9, 2.4], [PP + 2.4, 1.2, 2.4], [FF, 1.2, 2.4], [FF, 1.8, 2.4], [FF, 9.6, 2.4], [FF, 12.0, 2.4], [AX - 2.0, 12.0, 2.4], [AX - 2.0, 12.0, 0]], n: 18, size: 0.14, shape: "dot", rate: 0.17, color: "slurryC", track: false, free: true, rim: "steelC" };
actions.n2Mist = { type: "flow", _說明: "濕氮封：槽頂液面上方淡薄霧，緩慢聚集（不等速直飛）", layer: "slN2", path: [[AX + 2.0, 13.2, 0], [AX + 2.0, 12.4, 0], [AX + 1.0, 9.6, 0.4], [AX - 0.5, 9.0, 0.2]], n: 9, size: 0.2, shape: "dot", rate: 0.18, color: "n2mistC", track: false, jitter: 0.7, free: true };
actions.catchFx = { type: "pulse", _說明: "濾芯上卡住的大顆粒微亮", parts: ["sfTrapL"], color: "warnC", glow: 0.7, steady: true, halo: 0 };
actions.sedWarn = { type: "pulse", parts: ["sedLump", "sedLumpB"], color: "warnC", glow: 0.45, steady: true, halo: 0 };
Object.assign(anchors, { stir: A("slLid", [AX, 12.6, 0.5], -150, -90), loopP: A("slPump", [PP, 3.6, 2.4], -150, 90), filt: A("slFilter", [FF + 1.5, 5.4, 2.4], 150, -100), sed: A("slSed", [AX + 1.2, 2.3, 1.0], -150, 100), tankA: A("slTankA", [AX - 3.0, 8.0, 0.6], -150, -100), trap: A("slTrap", [FF + 0.6, 4.5, 2.9], 150, 100) });

// ═════ S8（x＝258）：供應商出貨棧板（三種容器）；S9（x＝296）：研磨墊一角（預告） ═════
const X8 = 258;
LAY("palletC", [26, 9, X8, 4.5]); LAY("co0", [8, 8, X8 - 8, 4]); LAY("co1", [8, 8, X8, 4]); LAY("co2", [8, 8, X8 + 8, 4]);
BOX("cpPallet", "palletC", X8 - 13, X8 + 13, 0, 1.0, -5, 5, "wood"); P({ id: "cpSlat", layer: "palletC", shape: "box", size: [26, 0.14, 0.9], pos: [X8, 1.07, 0], at: [[0, 0, -3.8], [0, 0, -1.9], [0, 0, 0], [0, 0, 1.9], [0, 0, 3.8]], mat: "woodDark" });
P({ id: "cpFoot", layer: "palletC", shape: "box", size: [1.4, 0.8, 10], pos: [X8, 0.4, 0], at: [[-11.6, 0, 0], [0, 0, 0], [11.6, 0, 0]], mat: "woodDark" });
// 容器一：塑膠桶（藍，英特格）；容器二：大桶（深藍，中華化）；容器三：方形 IBC 桶（白，三福化）
VC("coDrumBody", "co0", 2.6, 1.1, 8.6, "drum", { x: X8 - 8, z: 0 }); VT("coDrumRib", "co0", 2.7, 2.52, 0.2, 0.5, "drumDark", { x: X8 - 8, z: 0, at: [[0, 2.0, 0], [0, 4.0, 0], [0, 6.0, 0]] }); VC("coDrumLid", "co0", 2.5, 8.6, 8.72, "drumDark", { x: X8 - 8, z: 0 }); VC("coDrumBung", "co0", 0.45, 8.72, 9.1, "dark", { x: X8 - 8 - 1.2, z: -0.8 });
BOX("coDrumBand", "co0", X8 - 8 - 2.6, X8 - 8 + 2.6, 4.3, 5.3, 2.4, 2.62, "panel"); P({ id: "coDrumStripe", layer: "co0", shape: "box", size: [4.8, 0.2, 0.05], pos: [X8 - 8, 4.9, 2.64], mat: "blueP" });
VC("coTankBody", "co1", 2.6, 1.1, 8.6, "waste", { x: X8, z: 0 }); VT("coTankRib", "co1", 2.7, 2.52, 0.2, 0.5, "dark", { x: X8, z: 0, at: [[0, 2.0, 0], [0, 4.0, 0], [0, 6.0, 0]] }); VC("coTankLid", "co1", 2.5, 8.6, 8.72, "dark", { x: X8, z: 0 }); VC("coTankBung", "co1", 0.45, 8.72, 9.1, "steel2", { x: X8 + 1.2, z: -0.8 });
BOX("coTankBand", "co1", X8 - 2.6, X8 + 2.6, 4.3, 5.3, 2.4, 2.62, "panel"); P({ id: "coTankStripe", layer: "co1", shape: "box", size: [4.8, 0.2, 0.05], pos: [X8, 4.9, 2.64], mat: "oxid" });
BOX("coIbcBody", "co2", X8 + 8 - 3.6, X8 + 8 + 3.6, 1.4, 8.6, -3.4, 3.4, "hdpeT"); BOX("coIbcLiq", "co2", X8 + 8 - 3.4, X8 + 8 + 3.4, 1.5, 6.4, -3.2, 3.2, "clean");
P({ id: "coIbcCageH", layer: "co2", shape: "box", size: [7.4, 0.14, 0.14], pos: [X8 + 8, 0, 3.5], at: Array.from({ length: 6 }, (_, i) => [0, 1.6 + i * 1.4, 0]).concat(Array.from({ length: 6 }, (_, i) => [0, 1.6 + i * 1.4, -7])), mat: "steel" });
P({ id: "coIbcCageV", layer: "co2", shape: "box", size: [0.14, 7.2, 0.14], pos: [X8 + 8, 5.0, 3.5], at: Array.from({ length: 6 }, (_, i) => [-3.6 + i * 1.44, 0, 0]).concat(Array.from({ length: 6 }, (_, i) => [-3.6 + i * 1.44, 0, -7])), mat: "steel" });
VC("coIbcCap", "co2", 0.8, 8.6, 9.0, "hdpe", { x: X8 + 8 + 1.2, z: 0 }); VC("coIbcValve", "co2", 0.45, 1.4, 2.4, "steel2", { x: X8 + 8, z: 3.9 }); BOX("coIbcBand", "co2", X8 + 8 - 3.6, X8 + 8 - 0.6, 6.7, 7.9, 3.42, 3.5, "panel"); BOX("coIbcStripe", "co2", X8 + 8 - 3.6, X8 + 8 - 0.6, 6.5, 6.7, 3.5, 3.55, "lampG");
const X9 = 298, PR = 11, PY = 1.2;
LAY("pdBase", [26, 1.6, X9, 0.8]); LAY("pdPad", [22, 0.6, X9, 1.6]); LAY("pdRing", [22, 0.3, X9, 1.9]); LAY("pdArm", [16, 9, X9, 6]); LAY("pdPuddle", [10, 0.3, X9, 1.9]);
VC("pdPlaten", "pdBase", PR + 0.6, 0.2, 1.2, "steel2", { x: X9, z: 0 }); VT("pdSplash", "pdBase", PR + 1.4, PR + 1.1, 0.2, 2.4, "pfaT", { x: X9, z: 0 }); BOX("pdTable", "pdBase", X9 - 15, X9 + 15, 0, 0.2, -13, 13, "cabDark");
VC("pdPadD", "pdPad", PR, 1.2, 1.7, "pad", { x: X9, z: 0 }); P({ id: "pdPadMark", layer: "pdPad", shape: "box", size: [PR - 0.6, 0.02, 0.5], pos: [X9 + (PR - 0.6) / 2, 1.72, 0], mat: "oxid" });
P({ id: "pdGroove", layer: "pdRing", shape: "tube", size: [4, 3.88, 0.06], rot: V, pos: [X9, 1.71, 0], at: [[0, 0, 0]], mat: "padDark" });
for (const [rr, i] of [[3, 0], [5, 1], [7, 2], [9, 3]]) P({ id: `pdG${i}`, layer: "pdRing", shape: "tube", size: [rr, rr - 0.1, 0.06], rot: V, pos: [X9, 1.71, 0], mat: "padDark" });
parts.splice(parts.findIndex((p) => p.id === "pdGroove"), 1);
P({ id: "pdSlot", layer: "pdRing", shape: "box", size: [PR - 1.2, 0.02, 0.08], pos: [X9, 1.71, 0], at: [], rot: V2, mat: "padDark" }); parts.pop();
P({ id: "pdRadial", layer: "pdRing", shape: "box", size: [PR - 1.4, 0.02, 0.08], pos: [X9 + (PR - 1.2) / 2 + 0.4, 1.71, 0], mat: "padDark" });
BOX("pdArmPost", "pdArm", X9 - 14.2, X9 - 13.4, 0.2, 7.6, -11.4, -10.6, "steel2"); BOX("pdArmBar", "pdArm", X9 - 14.2, X9 - 1.0, 7.0, 7.6, -11.4, -10.6, "steel2"); BOX("pdArmBar2", "pdArm", X9 - 1.4, X9 - 0.8, 7.0, 7.6, -11.4, -3.0, "steel2");
VC("pdNozzle", "pdArm", 0.22, 4.6, 7.2, "steel", { x: X9 - 1.1, z: -3.0 }); VC("pdNozzle2", "pdArm", 0.12, 4.2, 4.6, "steel2", { x: X9 - 1.1, z: -3.0 });
PIPE("pdTube", "pdArm", [[X9 - 14.0, 6.2, -11.0], [X9 - 14.0, 8.4, -11.0], [X9 - 4.0, 8.4, -11.0], [X9 - 4.0, 8.4, -3.0], [X9 - 1.1, 8.4, -3.0], [X9 - 1.1, 7.2, -3.0]], 0.22, "pfa");
P({ id: "pdPuddle", layer: "pdPuddle", shape: "cyl", size: [1.8, 0.06], rot: V, pos: [X9 - 1.1, 1.74, -3.0], mat: "slurryS" });
actions.padSpin = { type: "rotate", _說明: "研磨墊慢轉（起轉有加速）；紅色標記條讓人看得出在轉", parts: ["pdPadD", "pdPadMark", "pdG0", "pdG1", "pdG2", "pdG3", "pdRadial"], axis: [0, 1, 0], pivot: [X9, 1.5, 0], pivots: Object.fromEntries(["pdPadD", "pdPadMark", "pdG0", "pdG1", "pdG2", "pdG3", "pdRadial"].map((k) => [k, [X9, 1.5, 0]])), rps: 0.2, rampSpin: true };
actions.padDrip = { type: "flow", _說明: "研磨液從噴嘴滴到墊上（稠，落得慢）", layer: "pdArm", path: [[X9 - 1.1, 4.0, -3.0], [X9 - 1.1, 1.9, -3.0]], n: 3, size: 0.14, shape: "liquid", band: 0.1, bandO: 0.5, rate: 0.7, color: "slurryC", track: false, accel: true, free: true };
actions.padSpread = { type: "flow", _說明: "落在墊上的研磨液隨旋轉往外甩、沿弧線流向墊邊（離心）", layer: "pdPuddle", path: [[X9 - 1.1, 1.8, -3.0], [X9 - 3.4, 1.8, -4.0], [X9 - 6.6, 1.8, -3.0], [X9 - 9.4, 1.8, 0.6]], n: 14, size: 0.12, shape: "dot", rate: 0.3, color: "slurryC", track: false, jitter: 0.35, free: true, rim: "steelC" };
actions.padRipple = { type: "wave", from: { layer: "pdPuddle", p: [X9 - 1.1, 1.76, -3.0] }, dir: [0, 1, 0], reach: 0.1, count: 2, r0: 0.5, spread: 3.0, rate: 0.5, color: "slurryC", width: 0.08 };
Object.assign(anchors, { co0: A("co0", [X8 - 8, 5.0, 2.7], -150, -90), co1: A("co1", [X8, 5.0, 2.7], 150, -110), co2: A("co2", [X8 + 8, 5.0, 3.6], 150, -90), pad: A("pdPad", [X9 + 4, 1.8, 3.0], 150, -90), nz: A("pdArm", [X9 - 1.1, 5.8, -3.0], -150, -90) });

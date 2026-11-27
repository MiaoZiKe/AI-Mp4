
// ═════ 地板 ═════
LAY("floor", [360, 2, 100, FY], true);
P({ id: "floor", layer: "floor", shape: "slab", size: [380, 0.5, 60], r: 0.2, pos: [100, R2(FY - 0.25), -4], mat: "floor" });
P({ id: "floorSeam", layer: "floor", shape: "slab", size: [380, 0.04, 0.1], pos: [100, R2(FY + 0.01), 0], at: Array.from({ length: 9 }, (_, i) => [0, 0, -24 + i * 6]), mat: "seam" });
P({ id: "floorSeamX", layer: "floor", shape: "slab", size: [0.1, 0.04, 60], pos: [0, R2(FY + 0.01), -4], at: Array.from({ length: 24 }, (_, i) => [-80 + i * 16, 0, 0]), mat: "seam" });

// ═════ S1（x＝-90）：一桶藥水＋被放大的一粒灰 ═════
const X1 = -90;
LAY("drum", [7, 9.4, X1, 4.6]); LAY("dustS1", [3, 3, X1, 11]); LAY("magS1", [4, 4, X1, 11]);
BOX("drumPallet", "drum", X1 - 4.2, X1 + 4.2, 0, 0.9, -4.2, 4.2, "wood");
P({ id: "palletSlat", layer: "drum", shape: "box", size: [8.4, 0.14, 0.9], pos: [X1, 0.97, 0], at: [[0, 0, -3.3], [0, 0, -1.65], [0, 0, 0], [0, 0, 1.65], [0, 0, 3.3]], mat: "woodDark" });
P({ id: "palletFoot", layer: "drum", shape: "box", size: [1.1, 0.7, 8.4], pos: [X1, 0.4, 0], at: [[-3.4, 0, 0], [0, 0, 0], [3.4, 0, 0]], mat: "woodDark" });
VC("drumBody", "drum", 2.9, 1.1, 9.9, "drum", { x: X1, z: 0 });
VT("drumRib", "drum", 3.0, 2.82, 0.2, 0.5, "drumDark", { x: X1, z: 0, at: [[0, 2.2, 0], [0, 4.4, 0], [0, 6.6, 0], [0, 8.8, 0]] });
VT("drumChimeT", "drum", 3.02, 2.7, 9.9, 10.1, "drumDark", { x: X1, z: 0 }); VT("drumChimeB", "drum", 3.02, 2.7, 0.95, 1.15, "drumDark", { x: X1, z: 0 });
VC("drumLid", "drum", 2.8, 10.0, 10.12, "drumDark", { x: X1, z: 0 });
VT("bungL", "drum", 0.6, 0.42, 10.12, 10.42, "steel2", { x: X1 - 1.4, z: -0.9 }); VC("bungLCap", "drum", 0.46, 10.18, 10.5, "dark", { x: X1 - 1.4, z: -0.9 });
VT("bungS", "drum", 0.45, 0.32, 10.12, 10.36, "steel2", { x: X1 + 1.5, z: 0.6 }); VC("bungSCap", "drum", 0.34, 10.18, 10.44, "dark", { x: X1 + 1.5, z: 0.6 });
P({ id: "drumLabel", layer: "drum", shape: "box", size: [2.8, 3.0, 0.06], pos: [X1, 5.4, 2.93], mat: "panel" }); BOX("drumLabelBar", "drum", X1 - 1.3, X1 + 1.3, 6.4, 6.9, 2.96, 2.99, "dark"); BOX("drumLabelTx", "drum", X1 - 1.3, X1 + 0.6, 5.7, 5.95, 2.96, 2.99, "dark");
P({ id: "drumHaz", layer: "drum", shape: "box", size: [0.9, 0.9, 0.05], rot: [0, 0, 45], pos: [X1 - 0.6, 4.3, 3.0], mat: "warnY" }); P({ id: "drumHaz2", layer: "drum", shape: "box", size: [0.9, 0.9, 0.05], rot: [0, 0, 45], pos: [X1 + 0.7, 4.3, 3.0], mat: "oxid" });
// 灰塵：桶蓋大口附近的一小團深灰碎屑，旁邊放大鏡圈（放大後是明顯的灰塵團）
const DUST = [[0, 0, 0, 0.5], [0.45, 0.2, 0.15, 0.36], [-0.4, 0.3, -0.2, 0.4], [0.1, -0.35, 0.3, 0.3], [-0.2, 0.55, 0.3, 0.28], [0.55, -0.15, -0.3, 0.26], [-0.55, -0.2, 0.2, 0.3]];
DUST.forEach(([dx, dy, dz, r], i) => SPH(`dust${i}`, "dustS1", r, X1 - 1.4 + dx, 12.2 + dy, -0.9 + dz, "dust"));
P({ id: "dustRing", layer: "dustS1", shape: "tube", size: [1.45, 1.3, 0.1], rot: [0, 0, 0], pos: [X1 - 1.4, 12.2, -0.9], mat: "dustGlow" });
P({ id: "magRim", layer: "magS1", shape: "tube", size: [1.9, 1.7, 0.22], pos: [X1 - 1.4, 12.2, -0.9 + 0.5], mat: "steel2" });
P({ id: "magGlass", layer: "magS1", shape: "cyl", size: [1.7, 0.06], pos: [X1 - 1.4, 12.2, -0.9 + 0.5], mat: "window" });
BOX("magHandle", "magS1", X1 - 0.2, X1 + 1.6, 9.9, 10.6, -0.9 + 0.35, -0.9 + 0.65, "dark"); P({ id: "magArm", layer: "magS1", shape: "box", size: [0.3, 3.2, 0.3], rot: [0, 0, -40], pos: [X1 + 0.55, 10.6, -0.4], mat: "dark" });
P({ id: "magRay", layer: "magS1", shape: "cyl", size: [0.05, 2.0], pos: [X1 - 1.4, 11.2, -0.4], rot: [20, 0, 0], at: [[0.9, 0, 0], [-0.9, 0, 0]], mat: "edge" });
actions.dustGlow = { type: "pulse", _說明: "那一粒灰的警示光圈閃（示意）", parts: ["dustRing"], color: "warnC", glow: 1, freq: 1.5, halo: 1.0 };
actions.dustDrift = { type: "flow", _說明: "灰塵從空中緩緩落向桶口（受重力加速、微小飄動）", layer: "dustS1", path: [[X1 - 1.4, 15.2, -0.9], [X1 - 1.4, 12.4, -0.9]], n: 2, size: 0.18, shape: "dot", rate: 0.22, color: "dustC", track: false, accel: true, jitter: 0.3, free: true };

// ═════ S2（x＝-60）：三種藥水＋晶圓（洗、蝕刻、磨平） ═════
const X2 = -60;
LAY("jugs", [14, 5, X2, 2.6]); LAY("wfS2", [8, 3, X2 - 0.5, 1.4]); LAY("wfFilm", [7, 0.2, X2 - 0.5, 1.8]);
BOX("benchTop", "jugs", X2 - 11, X2 + 7, 0, 0.8, -6.2, -0.6, "cabDark"); BOX("benchBack", "jugs", X2 - 11, X2 + 7, 0.8, 1.2, -6.2, -5.9, "steel2");
JUG("jgA", "jugs", X2 - 8, -3.2, "clean", "blueP"); JUG("jgB", "jugs", X2 - 4.4, -3.2, "etch", "warnY"); JUG("jgC", "jugs", X2 - 0.8, -3.2, "slurry", "panel2");
P({ id: "jugTray", layer: "jugs", shape: "box", size: [3.4, 0.25, 3.0], pos: [0, 0.93, -3.2], at: [[X2 - 8, 0, 0], [X2 - 4.4, 0, 0], [X2 - 0.8, 0, 0]], mat: "dark" });
// 晶圓與吸盤：中心 (X2+4, 0)
const WX = X2 + 4.5;
VC("chuckBase", "wfS2", 3.6, 0.0, 0.9, "chuckM", { x: WX, z: 0.6 }); VC("chuckPost", "wfS2", 1.1, 0.9, 1.6, "steel2", { x: WX, z: 0.6 });
VT("chuckRim", "wfS2", 3.7, 3.45, 0.9, 1.05, "dark", { x: WX, z: 0.6 }); VC("chuckTop", "wfS2", 3.5, 1.6, 1.75, "chuckM", { x: WX, z: 0.6 });
VC("wafer2", "wfS2", 3.1, 1.75, 1.83, "steel2", { x: WX, z: 0.6 });
P({ id: "waferGrid2", layer: "wfS2", shape: "box", size: [4.8, 0.012, 0.03], pos: [WX, 1.84, 0.6], at: [[0, 0, -1.8], [0, 0, -0.9], [0, 0, 0], [0, 0, 0.9], [0, 0, 1.8]], mat: "tgtFace" });
P({ id: "waferGrid2b", layer: "wfS2", shape: "box", size: [0.03, 0.012, 4.8], pos: [WX, 1.84, 0.6], at: [[-1.8, 0, 0], [-0.9, 0, 0], [0, 0, 0], [0.9, 0, 0], [1.8, 0, 0]], mat: "tgtFace" });
VC("filmClean", "wfFilm", 3.05, 1.83, 1.97, "clean", { x: WX, z: 0.6 });
// 噴嘴臂：從後方伸到晶圓中心上方；三條 PFA 管接三種桶
BOX("nzPost", "wfS2", WX + 4.6, WX + 5.0, 1.2, 6.8, -1.2, -0.8, "steel2"); BOX("nzArm", "wfS2", WX - 0.2, WX + 5.0, 6.4, 6.8, -1.2, -0.8, "steel2");
VC("nzTip", "wfS2", 0.22, 5.3, 6.4, "steel", { x: WX, z: -1.0 }); VC("nzTip2", "wfS2", 0.12, 5.0, 5.3, "steel2", { x: WX, z: -1.0 });
PIPE("nzTube", "wfS2", [[X2 - 8, 5.1, -3.2], [X2 - 8, 7.6, -3.2], [WX, 7.6, -1.0], [WX, 6.6, -1.0]], 0.13, "pfa");
PIPE("nzTubeB", "wfS2", [[X2 - 4.4, 5.1, -3.2], [X2 - 4.4, 7.2, -3.2], [WX, 7.2, -1.0]], 0.13, "pfa"); PIPE("nzTubeC", "wfS2", [[X2 - 0.8, 5.1, -3.2], [X2 - 0.8, 6.8, -3.2], [WX, 6.8, -1.0]], 0.13, "pfa");
actions.pourA = { type: "flow", _說明: "清洗液：從噴嘴落到晶圓中心（重力加速、落點擴散）", layer: "wfS2", path: [[WX, 5.2, -1.0], [WX, 2.0, 0.2]], n: 5, size: 0.1, shape: "liquid", band: 0.08, bandO: 0.4, rate: 1.4, color: "cleanC", track: false, accel: true, free: true };
actions.pourB = { type: "flow", _說明: "蝕刻液：同上（淡黃）", layer: "wfS2", path: [[WX, 5.2, -1.0], [WX, 2.0, 0.2]], n: 5, size: 0.1, shape: "liquid", band: 0.08, bandO: 0.4, rate: 1.4, color: "etchC", track: false, accel: true, free: true };
actions.pourC = { type: "flow", _說明: "研磨液：較稠，落得慢（乳白）", layer: "wfS2", path: [[WX, 5.2, -1.0], [WX, 2.0, 0.2]], n: 4, size: 0.12, shape: "liquid", band: 0.1, bandO: 0.5, rate: 0.7, color: "slurryC", track: false, accel: true, free: true };
actions.spreadA = { type: "wave", _說明: "落到晶圓中心後向外擴散的液膜邊緣", from: { layer: "wfFilm", p: [WX, 2.0, 0.6] }, dir: [0, 1, 0], reach: 0.1, count: 2, r0: 0.4, spread: 3.0, rate: 0.9, color: "cleanC", width: 0.08 };
actions.waferSpin = { type: "rotate", _說明: "晶圓與吸盤慢轉（起轉有加速）", parts: ["waferGrid2", "waferGrid2b"], axis: [0, 1, 0], pivot: [WX, 1.84, 0.6], pivots: Object.fromEntries(["waferGrid2", "waferGrid2b"].map((k) => [k, [WX, 1.84, 0.6]])), rps: 0.25, rampSpin: true };
actions.capA = { type: "pulse", parts: ["jgACap", "jgALabel"], color: "blueP", glow: 1, steady: true, halo: 0 };
actions.capB = { type: "pulse", parts: ["jgBCap", "jgBLabel"], color: "etchC", glow: 1, steady: true, halo: 0 };
actions.capC = { type: "pulse", parts: ["jgCCap", "jgCLabel"], color: "ceriaC", glow: 1, steady: true, halo: 0 };

// ═════ S3（x＝-30）：游泳池一小匙；管內離子點密度 ═════
const X3 = -34, XQ = -14;
LAY("pool", [13, 3, X3, 1.2]); LAY("spoon", [3, 4, X3, 5]); LAY("pipeI", [18, 6, XQ, 3.2]); LAY("ionsS3", [16, 5, XQ, 3.2]);
BOX("poolRimF", "pool", X3 - 6.4, X3 + 6.4, 0, 1.4, 3.0, 3.8, "tile"); BOX("poolRimB", "pool", X3 - 6.4, X3 + 6.4, 0, 1.4, -3.8, -3.0, "tile"); BOX("poolRimL", "pool", X3 - 6.4, X3 - 5.6, 0, 1.4, -3.0, 3.0, "tile"); BOX("poolRimR", "pool", X3 + 5.6, X3 + 6.4, 0, 1.4, -3.0, 3.0, "tile");
BOX("poolWater", "pool", X3 - 5.6, X3 + 5.6, 0.1, 1.1, -3.0, 3.0, "pool"); BOX("poolFloorLine", "pool", X3 - 5.6, X3 + 5.6, 0.12, 0.14, -0.05, 0.05, "tileLine");
P({ id: "poolLane", layer: "pool", shape: "box", size: [11.2, 0.05, 0.05], pos: [X3, 1.12, 0], at: [[0, 0, -1.5], [0, 0, 1.5]], mat: "oxid" });
P({ id: "poolFloat", layer: "pool", shape: "sphere", size: [0.14], pos: [X3 - 5.4, 1.15, 0], at: Array.from({ length: 12 }, (_, i) => [i * 0.98, 0, i % 2 ? 1.5 : -1.5]), mat: "warnY" });
P({ id: "poolLadder", layer: "pool", shape: "tube", size: [0.2, 0.15, 2.0], rot: HX, pos: [X3 + 5.9, 1.9, 0], at: [[0, 0, -0.7], [0, 0, 0.7]], mat: "steel2" }); P({ id: "poolLadRung", layer: "pool", shape: "cyl", size: [0.05, 1.4], pos: [X3 + 5.9, 0, 0], at: [[0, 1.4, 0], [0, 1.9, 0], [0, 2.4, 0]], mat: "steel2" });
// 一小匙：匙＋一滴紅
P({ id: "spoonHead", layer: "spoon", shape: "sphere", size: [0.9], scale: [1, 0.35, 0.7], pos: [X3 + 1.6, 6.2, 0], mat: "steel2" });
BOX("spoonHandle", "spoon", X3 + 2.3, X3 + 6.3, 6.1, 6.4, -0.15, 0.15, "steel2"); P({ id: "spoonDrop", layer: "spoon", shape: "sphere", size: [0.3], pos: [X3 + 1.6, 6.55, 0], mat: "oxid" });
actions.spoonDrip = { type: "flow", _說明: "一滴紅色雜質從匙尖落進池水（極小一滴）", layer: "spoon", path: [[X3 + 1.6, 5.9, 0], [X3 + 1.6, 1.3, 0]], n: 1, size: 0.14, shape: "liquid", rate: 0.35, color: "oxidC", track: false, accel: true, free: true };
actions.poolRipple = { type: "wave", from: { layer: "pool", p: [X3 + 1.6, 1.12, 0] }, dir: [0, 1, 0], reach: 0.1, count: 2, r0: 0.2, spread: 3.2, rate: 0.5, color: "tileC", width: 0.06 };
// 管：ghost PFA 管體＋液體；點＝金屬離子（紅）極少、藥液分子（淡藍）極多
const IR = 2.5;
HXC("ghostPipe", "pipeI", IR, XQ - 8.5, XQ + 8.5, 3.4, 0, "pfaT"); HXC("ghostLiq", "pipeI", IR - 0.12, XQ - 8.3, XQ + 8.3, 3.4, 0, "clean");
P({ id: "pipeFlange", layer: "pipeI", shape: "tube", size: [IR + 0.7, IR - 0.05, 0.4], rot: HX, pos: [0, 3.4, 0], at: [[XQ - 8.5, 0, 0], [XQ + 8.5, 0, 0]], mat: "steel2" });
P({ id: "pipeFlBolt", layer: "pipeI", shape: "cyl", size: [0.12, 0.3], rot: HX, pos: [0, 3.4, 0], at: [XQ - 8.5, XQ + 8.5].flatMap((xx) => Array.from({ length: 8 }, (_, i) => { const [y, z] = pol(i * 45, IR + 0.4); return [xx, y, z]; })), mat: "steel" });
P({ id: "pipeBand", layer: "pipeI", shape: "tube", size: [IR + 0.3, IR - 0.05, 0.3], rot: HX, pos: [0, 3.4, 0], at: [[XQ - 4, 0, 0], [XQ + 4, 0, 0]], mat: "dark" });
BOX("pipeStand", "pipeI", XQ - 4.4, XQ - 3.6, 0, 3.4 - IR - 0.2, -0.8, 0.8, "steel"); BOX("pipeStand2", "pipeI", XQ + 3.6, XQ + 4.4, 0, 3.4 - IR - 0.2, -0.8, 0.8, "steel");
actions.ionsBlue = { type: "flow", _說明: "藥液裡的分子（淡藍，密）隨液體向右流（層流：中間快、靠壁慢，示意）", layer: "pipeI", path: [[XQ - 8, 3.4, 0], [XQ + 8, 3.4, 0]], n: 60, lanes: 3, laneDir: [0, 0, 1], laneGap: 0.7, size: 0.1, shape: "dot", rate: 0.12, color: "cleanC", track: false, jitter: 1.4, free: true, trail: 0 };
actions.ionsRed = { type: "flow", _說明: "混進去的金屬雜質（紅，只有極少幾顆）", layer: "pipeI", path: [[XQ - 8, 3.7, 0.4], [XQ + 8, 3.7, 0.4]], n: 3, size: 0.2, shape: "dot", rate: 0.12, color: "oxidC", track: false, jitter: 0.9, free: true, rim: "dark" };
Object.assign(anchors, { dust: A("dustS1", [X1 - 1.4, 12.6, -0.9], 150, -90), drumA: A("drum", [X1 + 2.9, 6.2, 0.5], 150, 90), jugA: A("jugs", [X2 - 8, 3.8, -2.0], -150, -90), jugB: A("jugs", [X2 - 4.4, 3.8, -2.0], 150, -110), jugC: A("jugs", [X2 - 0.8, 3.8, -2.0], 150, -90), pool: A("pool", [X3 - 3.5, 1.2, 3.0], -150, 90), spoon: A("spoon", [X3 + 1.6, 6.5, 0], 150, -90), ionRed: A("pipeI", [XQ + 2, 4.1, 0.6], 150, -100) });

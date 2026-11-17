// node scripts/three/parts/sheet.mjs [--build-only]：產生「零件總表」docs/three-parts-sheet.png。
//   ① 把每種零件各排一個範例（videos/parts-sheet/model.json，全部用零件庫寫）＋逐一對焦的鏡頭（script.json），
//   ② 渲染每個零件一張靜態圖（out/parts-sheet/NN.png，先搶 out/.render.lock）、再從 videos/sample-parts 抽 5 格動作畫面，
//   ③ 交給 sheet-compose.py 拼成一張圖（加標題、零件名與參數）。零件庫改了、要更新總表時重跑這支。
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { renderStill, selectComposition } from "@remotion/renderer";

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "../../..");
const D = path.join(ROOT, "videos", "parts-sheet"), OUT = path.join(ROOT, "out", "parts-sheet");
const SP = 12, COS = Math.cos((30 * Math.PI) / 180); // 零件沿 x 每隔 SP 放一個；世界轉 -30°，鏡頭 x ＝ pos.x × cos30
const COSV = Number(process.env.COSV ?? COS);
const X = (i) => R2((i - 9.5) * SP), R2 = (x) => Math.round(x * 1000) / 1000;
// [名稱, 標題, 說明, 參數（pos 由程式排）, 鏡頭 { d 距離, y 看的高度, elev }, 位置修正函式]
const L = [
  ["wafer", "晶圓 wafer", "r、step、bad、pick", { r: 3, step: 0.6, bad: 6, pick: [2, 0] }, { d: 14, y: 0.3 }],
  ["die", "晶片 die", "w、d、t、kind", { w: 2.6, d: 3.3 }, { d: 7, y: 0.2 }],
  ["bumps", "凸塊 bumps", "kind(micro/c4/ball)、n、pitch", { kind: "c4", n: [12, 8] }, { d: 6, y: 0.1 }],
  ["tsv", "矽穿孔 tsv", "line、n、h", { line: [-2, 0, 2, 0], n: 30, h: 0.9 }, { d: 6, y: 0.4 }],
  ["interposer", "中介層 interposer", "w、d、t、rdl、tsv", { w: 7, d: 4.6 }, { d: 11, y: 0.1 }],
  ["substrate", "基板 substrate", "w、d、t、pads、caps", { w: 7, d: 5, t: 0.5, pads: [16, 10] }, { d: 11, y: 0.2 }],
  ["pcb", "主機板 pcb", "w、d、t、pads", { w: 8, d: 6 }, { d: 13, y: 0.1 }],
  ["hbm", "HBM 堆疊 hbm", "w、t、n、slices", { w: 1.6, t: 0.9, n: 12 }, { d: 4.5, y: 0.4 }],
  ["stack", "逐層堆疊 stack", "layers[{t,mat}]、w、d", { w: 3, d: 3, layers: [{ t: 0.15, mat: "silicon" }, { t: 0.1, mat: "pad" }, { t: 0.15, mat: "chip" }, { t: 0.1, mat: "pad" }, { t: 0.15, mat: "hbm" }] }, { d: 7, y: 0.4 }],
  ["nozzle", "吸嘴 nozzle", "scale", { scale: 1.3 }, { d: 6, y: 1.0 }],
  ["arm", "機械手臂 arm", "h、l1、l2、drop、to、gw", {}, { d: 11, y: 1.8, dx: 2 }],
  ["probe", "探針頭 probe", "（固定尺寸）", {}, { d: 6, y: 0.9 }],
  ["beam", "光束 beam", "from、to、r、color", { _beam: true }, { d: 8, y: 1.6 }],
  ["chamber", "腔體 chamber", "r、len、bolts", { r: 2.2, len: 6 }, { d: 14, y: 0 }],
  ["pipe", "管線 pipe", "path、r、flowColor", { _pipe: true }, { d: 8, y: 0.8 }],
  ["heatsink", "散熱片 heatsink", "w、d、fins、finH", { w: 4.4, d: 3.6, fins: 11, finH: 1.4 }, { d: 7, y: 0.7 }],
  ["rail", "輸送軌 rail", "len、w、legH", { len: 8, w: 2.1 }, { d: 11, y: -0.4 }],
  ["bin", "廢料盒 bin", "w、d、h", { w: 2.6, d: 2 }, { d: 5, y: 0.3 }],
  ["blade", "切割刀片 blade", "r、t、rps", { r: 1.4 }, { d: 5.5, y: 1.4, lift: 1.5 }],
  ["sensor", "檢測頭 sensor", "ray、sweepAmp", { ray: 1.5 }, { d: 7, y: 0.7, lift: 1.6 }],
];
if (process.argv.includes("--list")) { console.log(JSON.stringify(L.map(([n, t, s]) => [n, t, s]))); process.exit(0); }
fs.mkdirSync(D, { recursive: true });
const parts = L.map(([name, , , o, , ], i) => {
  const x = X(i), p = { part: name, id: name === "die" ? "dd" : name, pos: [x, o.lift ?? 0, 0], ...o }; delete p.lift;
  if (o._beam) { delete p._beam; Object.assign(p, { from: [x, 3, 0], to: [x, 0.2, 0], r: 0.1, pos: undefined }); delete p.pos; }
  if (o._pipe) { delete p._pipe; Object.assign(p, { path: [[x - 3, 0.2, 0], [x, 0.2, 0], [x, 1.6, 0], [x + 3, 1.6, 0]], r: 0.2 }); delete p.pos; }
  return p;
});
const model = { name: "parts-sheet：零件總表（每種零件一個範例，全部用零件庫）", unit: "1 cm", size: { w: 14, h: 2, r: 0.1, t: 6 }, palette: {}, materials: {}, layers: [], anchors: {}, parts,
  actions: {}, pose: { yaw0: -0.5236, yawIso: 0, drift: 0 }, camera: { stand: { d: 14, elev: 36, y: 0.4 } }, fx: { dpr: 1, srcPx: 30, shadows: 0, ghost: false, guides: false, fog: false, dust: false, vaporSprites: false, shimmer: false } };
const shots = L.map(([, , , o, c], i) => ({ at: `start+${i * 30}`, dur: 1, x: R2((X(i) + (c.dx ?? 0)) * COSV), y: c.y, d: c.d, elev: 34 }));
const script = { slug: "parts-sheet", title: "零件總表", asOf: "2026/11/16", styleVersion: 3, stage: "three", channel: { name: "科技透明圈", tag: "放大來看", slogan: "一支講透一件事" }, hudSkin: "light",
  voice: { voiceName: "Iapetus", model: "gemini-2.5-flash-preview-tts", mode: "take", languageCode: "cmn-TW", profile: "tech-b" },
  hud: { levels: [{ id: "pk", label: "零件總表", en: "PARTS", field: "12 cm", ruler: "1 cm", art: "none", handoff3D: true, readout: false }], theme: "dark", schematic: { text: "", zh: "" }, maxLabels: 4, smallPx: 30, layout: "fill", scanBand: 0.3 },
  cover: { title: ["零件", "總表"], sub: "", frame: 40 }, sample: true,
  scenes: [{ id: "s1", beat: "mechanism", narration: "零件總表", tts: "零件總表", subtitle: { zh: "零件總表", en: "Parts sheet" }, keywords: [], cues: [], component: "ThreeScene", props: { shot: shots, zoom: [{ to: "pk", at: "start-30", dur: 1 }] }, sources: [], durationSec: L.length + 1 }] };
fs.writeFileSync(path.join(D, "model.json"), JSON.stringify(model, null, 1) + "\n"); fs.writeFileSync(path.join(D, "script.json"), JSON.stringify(script, null, 1) + "\n");
fs.writeFileSync(path.join(D, "research.md"), "# parts-sheet\n零件總表用的內部素材，不發布。由 scripts/three/parts/sheet.mjs 產生。\n");
execFileSync("node", ["scripts/three/silent-timeline.mjs", "parts-sheet"], { cwd: ROOT, stdio: "ignore" });
if (process.argv.includes("--build-only")) process.exit(0);

// 渲染：每個零件單獨放在原點、固定鏡頭各渲一張（同一個 composition，只換 inputProps 的 model；鏡頭 x 對不準遠處零件，所以不用總表場景的移動鏡頭）
fs.mkdirSync(OUT, { recursive: true });
const { BROWSER, loadScript, makeBundle, chromiumOptions } = await import(path.join(ROOT, "scripts/lib.mjs"));
const { expandModel } = await import("./index.mjs");
await import(path.join(ROOT, "scripts/fetch-fonts.mjs"));
const sc = loadScript("parts-sheet"), serveUrl = await makeBundle();
const opts = { serveUrl, inputProps: sc, browserExecutable: BROWSER, chromiumOptions, logLevel: "error" };
const comp = await selectComposition({ ...opts, id: "Video" });
for (let i = 0; i < L.length; i++) {
  const [name, , , o, c] = L[i], p = { ...parts[i] }, x0 = X(i);
  if (p.pos) p.pos = [0, p.pos[1], 0];
  if (name === "beam") Object.assign(p, { from: [0, 3, 0], to: [0, 0.2, 0] });
  if (name === "pipe") p.path = [[-3, 0.2, 0], [0, 0.2, 0], [0, 1.6, 0], [3, 1.6, 0]];
  const m1 = expandModel({ ...model, parts: [p] });
  const s1 = JSON.parse(JSON.stringify(sc)); s1.model = m1; s1.scenes[0].props.zoom = [{ to: "pk", at: "start-30", dur: 1 }]; s1.scenes[0].props.shot = [{ at: "start-30", dur: 1, x: c.dx ?? 0, y: c.y, d: R2(c.d * 2.3), elev: 36 }];
  const c1 = await selectComposition({ ...opts, inputProps: s1, id: "Video" }); await renderStill({ ...opts, inputProps: s1, composition: c1, frame: 12, output: path.join(OUT, `${String(i).padStart(2, "0")}.png`) }); process.stdout.write(`${name} `);
}
console.log("\n✔ 零件靜態圖 →", OUT);
// 動作畫面：從 videos/sample-parts 抽 5 格（掃描、吸起、移動、下壓熔化、通電）
const MO = [[50, "scan 掃描檢測"], [214, "pick-place 吸住"], [238, "pick-place 平移"], [326, "press-bond 下壓熔化"], [338, "current 電流流動"]];
const sc2 = loadScript("sample-parts"), comp2 = await selectComposition({ ...opts, inputProps: sc2, id: "Video" });
for (let i = 0; i < MO.length; i++) await renderStill({ ...opts, inputProps: sc2, composition: comp2, frame: MO[i][0], output: path.join(OUT, `m${i}.png`) });
fs.writeFileSync(path.join(OUT, "motions.json"), JSON.stringify(MO));
fs.writeFileSync(path.join(OUT, "labels.json"), JSON.stringify(L.map(([n, t, s]) => [n, t, s])));

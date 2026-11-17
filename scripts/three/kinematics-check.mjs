// node scripts/three/kinematics-check.mjs <slug> [--json]：關節鏈（機械手臂）逐幀檢查，不開瀏覽器、不渲染（幾秒）。
//   用和畫面同一份的 engine.ts／pose.ts／kin.ts，每 2 幀檢查：關節脫節（父端點≠子基點，容許 0.5% 臂長）、夾爪沒夾住、手臂穿過其他零件、關節超出上下限。
//   結果寫 out/<slug>/kinematics-check.json；有 error 時結束碼 1。validate-three.mjs 對有 model.kin 或舊式關節鏈的片自動跑這支。
// node scripts/three/kinematics-check.mjs --selftest：用幾個故意做壞的小模型證明檢查抓得到（脫節、2026/11/17 之前的舊算法、穿模、沒夾住），好的模型要 0 error。
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { build } from "esbuild";
import { expandModel, expandScript } from "./parts/index.mjs";

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "../..");
const args = process.argv.slice(2), asJson = args.includes("--json"), selftest = args.includes("--selftest"), slug = args.find((a) => !a.startsWith("--"));
if (!slug && !selftest) { console.error("用法：node scripts/three/kinematics-check.mjs <slug> [--json]｜--selftest"); process.exit(2); }

const outDir = path.join(ROOT, "out", ".bundle", `kin-${process.pid}`);
fs.mkdirSync(outDir, { recursive: true });
process.on("exit", () => fs.rmSync(outDir, { recursive: true, force: true }));
const outfile = path.join(outDir, "check.mjs");
await build({
  entryPoints: [path.join(ROOT, "scripts/three/kinematics-check-entry.ts")], bundle: true, platform: "node", format: "esm", outfile, logLevel: "error",
  jsx: "automatic", loader: { ".json": "json" },
  plugins: [{ name: "stub-fonts", setup(b) { b.onResolve({ filter: /^@remotion\/google-fonts\// }, () => ({ path: "fonts", namespace: "stub" })); b.onLoad({ filter: /.*/, namespace: "stub" }, () => ({ contents: "export const loadFont = () => ({ fontFamily: 'x', waitUntilDone: () => Promise.resolve() }); export const getInfo = () => ({ fontFamily: 'x' });", loader: "js" })); } }],
  banner: { js: "import { createRequire as __cr } from 'module'; const require = __cr(import.meta.url);" },
});
const { check, buggyPose, flatPose } = await import(pathToFileURL(outfile).href);

const prep = (script) => { script.model = expandModel(script.model); script.scenes = expandScript(script, script.model).scenes; return script; };
const fr = (r) => (r ? `（第 ${r[0]}–${r[1]} 幀，${(r[0] / 30).toFixed(2)}–${(r[1] / 30).toFixed(2)} 秒）` : "");

if (selftest) {
  const clone = (x) => JSON.parse(JSON.stringify(x));
  const TL = { totalFrames: 150, scenes: [{ id: "s1", startFrame: 0, voiceStartFrame: 0, voiceEndFrame: 150, cues: [] }] };
  const base = () => ({
    slug: "kin-selftest", timeline: clone(TL),
    model: { size: { w: 8, h: 2, r: 0.1, t: 4 }, palette: {}, materials: {}, layers: [], anchors: {}, parts: [
      { part: "arm", id: "ar", pos: [0, 0, 0], h: 1.6, l1: 2.4, l2: 2.0, drop: 0.5, gw: 0.5, to: [-1.6, -3.2] },
      { part: "pcb", id: "rs", pos: [4.4, -0.3, 0], w: 2, d: 2, t: 0.3, pads: false },
      { part: "die", id: "dc", pos: [4.4, 0, 0], w: 0.5, d: 0.5, t: 0.12, bumps: false, grid: false },
      { part: "pcb", id: "tp", pos: [2.8, -0.3, -3.2], w: 3, d: 2.4, t: 0.3, pads: false },
    ] },
    scenes: [{ id: "s1", props: { motion: [{ preset: "arm-transfer", arm: "ar", item: "dc", at: "start+10", press: ["tp"] }] } }],
  });
  // 舊式關節鏈（2026/11/17 之前 arm 展開出來的寫法）：兩節，j1 帶兩節、j2 只帶第二節
  const legacy = () => ({
    slug: "kin-selftest-legacy", timeline: clone(TL),
    model: { size: { w: 6, h: 2, r: 0.1, t: 4 }, palette: {}, materials: { m: { color: "#888888" } }, layers: [{ id: "a", z: 0, k: 0 }], anchors: {}, parts: [
      { id: "l1", layer: "a", shape: "box", size: [2.4, 0.3, 0.4], pos: [1.2, 1, 0], mat: "m" },
      { id: "l2", layer: "a", shape: "box", size: [2.0, 0.26, 0.34], pos: [3.4, 1, 0], mat: "m" },
    ], actions: {
      j1: { layer: "a", type: "rotate", parts: ["l1", "l2"], axis: [0, 1, 0], pivot: [0, 1, 0], angle: 40, chain: true },
      j2: { layer: "a", type: "rotate", parts: ["l2"], axis: [0, 1, 0], pivot: [2.4, 1, 0], angle: 30, chain: true },
    } },
    scenes: [{ id: "s1", props: { run: [{ id: "j1", at: "start+10", ramp: 20 }, { id: "j2", at: "start+10", ramp: 20 }] } }],
  });
  const cases = [
    ["好的手臂（應該 0 error）", () => prep(base()), {}, []],
    ["轉軸點放錯（肘的轉軸往外移 0.9）", () => { const s = prep(base()); s.model.kin.ar.joints[1].pivot[0] += 0.9; return s; }, {}, ["連接"]],
    ["放料板太高（手臂和晶粒會穿過去）", () => { const s = base(); s.model.parts[3].pos[1] = 0.1; return prep(s); }, {}, ["穿模"]],
    ["晶粒不在夾爪下面（偏 0.45）", () => { const s = base(); s.model.parts[2].pos[2] = 0.45; return prep(s); }, {}, ["夾取"]],
    ["關節各自轉、子節不跟父節走（沒有階層）", () => prep(base()), { pose: flatPose }, ["連接"]],
    ["舊式關節鏈＋現在的算法（應該 0 error）", () => prep(legacy()), {}, []],
    ["舊式關節鏈＋2026/11/17 之前有 bug 的算法", () => prep(legacy()), { pose: buggyPose }, ["連接"]],
  ];
  let bad = 0;
  for (const [name, mk, opt, want] of cases) {
    const r = check(mk(), opt), kinds = [...new Set(r.issues.filter((i) => i.level === "error").map((i) => i.kind))];
    const ok = want.length ? want.every((k) => kinds.includes(k)) : kinds.length === 0;
    if (!ok) bad++;
    console.log(`${ok ? "✔" : "✖"} ${name}：抓到 ${kinds.length ? kinds.join("、") : "0 error"}${want.length ? `（要抓到 ${want.join("、")}）` : ""}`);
    if (!ok || process.env.KIN_VERBOSE) for (const i of r.issues.slice(0, 6)) console.log(`    ${i.kind}：${i.msg}${fr(i.frames)}`);
  }
  console.log(bad ? `✖ 自我測試 ${bad} 項不通過` : "✔ 自我測試全部通過");
  process.exit(bad ? 1 : 0);
}

const script = JSON.parse(fs.readFileSync(path.join(ROOT, "videos", slug, "script.json"), "utf8"));
const tp = path.join(ROOT, "videos", slug, "timeline.json"), mp = path.join(ROOT, "videos", slug, "model.json");
script.timeline = fs.existsSync(tp) ? JSON.parse(fs.readFileSync(tp, "utf8")) : null;
if (!script.model && fs.existsSync(mp)) script.model = JSON.parse(fs.readFileSync(mp, "utf8"));
if (!script.model) { console.log(asJson ? JSON.stringify({ issues: [], skipped: "沒有 model" }) : "略過：沒有 model"); process.exit(0); }
prep(script);
const res = check(script);
fs.mkdirSync(path.join(ROOT, "out", slug), { recursive: true });
fs.writeFileSync(path.join(ROOT, "out", slug, "kinematics-check.json"), JSON.stringify(res, null, 1));
if (asJson) console.log(JSON.stringify(res));
else {
  for (const i of res.issues) console.log(`${i.level === "error" ? "✖" : "⚠"} [${i.kind}] ${i.msg}${fr(i.frames)}`);
  const ne = res.issues.filter((i) => i.level === "error").length;
  console.log(`${ne ? "✖" : "✔"} 關節鏈檢查 ${slug}：${ne} error（${res.stats.frames} 幀、${res.stats.arms} 支手臂、${res.stats.legacy} 組舊式關節${res.stats.skipped ? `；${res.stats.skipped}` : ""}）`);
}
process.exitCode = res.issues.some((i) => i.level === "error") ? 1 : 0;

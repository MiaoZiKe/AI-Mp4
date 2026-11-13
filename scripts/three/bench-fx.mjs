// node scripts/three/bench-fx.mjs <slug> [--frames 12] [--only 名稱,名稱]：逐項量每種特效的渲染成本。
// 打包一次，同一段畫面用不同的 fx 開關各渲一次（平行數 1），比較「每幀毫秒」（不含開瀏覽器，從第 1 幀渲完開始算）。
// 加 --ops [--rotate <零件id>]＝改量運作動畫（actions）每一種的成本，結果寫 out/<slug>/bench-ops.json。
// 三段畫面：A＝分解中（各層都在、殘影與導引線）、B＝熱循環（蒸氣、熱浪、熱點光）、C＝光掃＋標籤引線。結果寫 out/<slug>/bench-fx.json。
import path from "node:path";
import fs from "node:fs";
import { renderMedia, selectComposition } from "@remotion/renderer";
import { ROOT, BROWSER, loadScript, makeBundle, chromiumOptions } from "../lib.mjs";
const slug = process.argv[2];
const opt = (k, d) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : d; };
const seg = opt("--seg", "ABC"), n = Number(opt("--frames", 12)), only = opt("--only", "") ? opt("--only", "").split(",") : null;
const script = loadScript(slug);
const tl = script.timeline, by = Object.fromEntries(tl.scenes.map((x) => [x.id, x]));
const cue = (id) => { for (const s of tl.scenes) for (const c of s.cues ?? []) if (c.id === id) return c.frame; return null; };
const A = (script.scenes.find((s) => s.props?.explode) ? by[script.scenes.find((s) => s.props?.explode).id].voiceStartFrame : 60) + 14;
const C = (cue("plate") ?? A + 40) - 2;
const B = (cue("vapor") ?? Math.round(tl.totalFrames * 0.7)) + 8;
const V = [
  ["全開（成片設定）", {}, "ABC"],
  ["dpr 2", { dpr: 2 }, "A"], ["dpr 1.5", { dpr: 1.5 }, "A"], ["dpr 1", { dpr: 1 }, "A"], ["開：MSAA 反鋸齒", { msaa: true }, "A"],
  ["關：環境反光", { env: false }, "A"], ["關：清漆層（玻璃／烤漆）", { clearcoat: false }, "A"], ["關：程式紋理", { textures: false }, "A"], ["關：霧", { fog: false }, "A"],
  ["關：地面陰影", { shadows: 0 }, "A"], ["陰影貼圖（只落在地面）", { shadows: 2 }, "A"], ["陰影貼圖（零件也接陰影）", { shadows: 3 }, "A"], ["陰影貼圖不柔化", { shadows: 3, shadowSoft: false }, "A"],
  ["關：殘影＋導引線", { ghost: false, guides: false }, "A"], ["關：微塵光斑", { dust: false }, "A"],
  ["關：光掃聚光燈＋標籤光掃", { sweep: false, sheen: false }, "C"],
  ["開：背景模糊 6px", { backdropBlur: 6 }, "B"], ["關：聚焦時兩側壓暗", { vignette: false }, "B"],
  ["關：蒸氣柔邊貼圖（改實心球）", { vaporSprites: false }, "B"], ["關：熱浪粒子", { shimmer: false }, "B"], ["關：熱點點光", { glow: false }, "B"],
  ["開：水滴折射（transmission）", { transmission: true }, "B"],
  ["開：物理材質＋PMREM 環境貼圖（pbr）", { pbr: true }, "A"],
].filter((v) => !only || only.some((o) => v[0].includes(o)) || v[0].startsWith("全開"));
// --base dpr=1,shadows=1：所有組合都先套這組設定（想在低解析度下快速比較時用）
const baseFx = Object.fromEntries(String(opt("--base", "")).split(",").filter(Boolean).map((kv) => { const [k, v] = kv.split("="); return [k, v === "true" ? true : v === "false" ? false : Number(v)]; }));
// --ops：量「運作動畫」（model.json 的 actions）每一種的成本。每種 type 找它第一個 run 進行到一半的那一幀，
// 同一段畫面渲兩次（全開／把這一種的 run 拿掉），差多少就是這一種的成本。--rotate <零件id>：模型沒有旋轉件時，臨時加一個 rotate 動作來量。
const OPS = process.argv.includes("--ops");
const frameOf = (sc, spec) => {
  const r = /^(?:([^\s:+-]+):)?([^\s:+-]+)([+-]\d+)?$/.exec(String(spec ?? "")), i = tl.scenes.findIndex((x) => x.id === (r?.[1] ?? sc.id)), t = tl.scenes[i];
  if (!r || !t) return null;
  const base = r[2] === "start" ? t.startFrame : r[2] === "voice" ? t.voiceStartFrame : r[2] === "end" ? t.voiceEndFrame : r[2] === "exit" ? (tl.scenes[i + 1]?.startFrame ?? tl.totalFrames) : (t.cues ?? []).find((q) => q.id === r[2])?.frame;
  return base == null ? null : base + Number(r[3] ?? 0);
};
const opsPlan = () => {
  const acts = { ...(script.model.actions ?? {}) }, scenes = structuredClone(script.scenes);
  const rot = opt("--rotate", "");
  if (rot && !Object.values(acts).some((d) => d.type === "rotate")) {
    acts.__benchRotate = { type: "rotate", parts: [rot], rps: 1 };
    const sc = scenes.find((x) => x.props?.run) ?? scenes[scenes.length - 1];
    sc.props = { ...sc.props, run: [...[].concat(sc.props?.run ?? []), { id: "__benchRotate", at: "voice" }] };
  }
  const plan = [];
  for (const type of ["vibrate", "rotate", "pulse", "flow", "wave", "trace", "sum", "meter"]) {
    let hit = null;
    for (const sc of scenes) for (const r of [].concat(sc.props?.run ?? [])) if (!hit && acts[r.id]?.type === type && !acts[r.id].hidden) hit = { sc, r };
    if (!hit) continue;
    const a = frameOf(hit.sc, hit.r.at) ?? 0, b = hit.r.until ? frameOf(hit.sc, hit.r.until) ?? tl.totalFrames : tl.totalFrames;
    const from = Math.max(0, Math.min(tl.totalFrames - n - 1, a + Math.min(24, Math.floor((b - a) / 2))));
    const without = scenes.map((sc) => ({ ...sc, props: { ...sc.props, run: [].concat(sc.props?.run ?? []).filter((r) => acts[r.id]?.type !== type) } }));
    plan.push({ type, from, on: { scenes, actions: acts }, off: { scenes: without, actions: acts } });
  }
  return plan;
};
const serveUrl = await makeBundle();
const out = path.join(ROOT, "out", slug, "bench-fx.mp4");
fs.mkdirSync(path.dirname(out), { recursive: true });
const run = async (fx, from, over) => {
  const inputProps = { ...script, ...(over ? { scenes: over.scenes } : {}), model: { ...script.model, ...(over ? { actions: over.actions } : {}), fx: { ...(script.model.fx ?? {}), ...baseFx, ...fx } } };
  const opts = { serveUrl, inputProps, browserExecutable: BROWSER, chromiumOptions, logLevel: "error" };
  const comp = await selectComposition({ ...opts, id: "Video" });
  let t1 = 0;
  await renderMedia({ ...opts, composition: comp, codec: "h264", pixelFormat: "yuv420p", outputLocation: out, concurrency: 1, frameRange: [from, from + n - 1], muted: true, onProgress: (p) => { if (!t1 && p.renderedFrames >= 1) t1 = Date.now(); } });
  return Math.round((Date.now() - t1) / (n - 1));
};
const res = [];
if (OPS) {
  const NAMES = { vibrate: "零件振動／往復", rotate: "旋轉件", pulse: "零件發光／脈衝＋光暈", flow: "沿路徑流動的光點／箭頭", wave: "往外擴散的聲波圈", trace: "行進波形", sum: "兩道波疊加相消", meter: "小儀表（HTML）" };
  for (const p of opsPlan()) {
    const on = await run({}, p.from, p.on), off = await run({}, p.from, p.off);
    res.push({ type: p.type, name: NAMES[p.type], from: p.from, on, off, cost: on - off });
    console.log(`${NAMES[p.type]}（${p.type}，第 ${p.from} 幀起）：開 ${on} ms/幀、關 ${off} ms/幀，差 ${on - off} ms`);
    fs.writeFileSync(path.join(ROOT, "out", slug, "bench-ops.json"), JSON.stringify({ at: new Date().toISOString(), frames: n, base: baseFx, gl: chromiumOptions.gl, concurrency: 1, results: res }, null, 1));
  }
  fs.rmSync(out, { force: true });
  process.exit(0);
}
for (const [name, fx, where] of V) {
  const r = { name, fx };
  if (where.includes("A") && seg.includes("A")) r.A = await run(fx, A);
  if (where.includes("B") && seg.includes("B")) r.B = await run(fx, B);
  if (where.includes("C") && seg.includes("C")) r.C = await run(fx, C);
  res.push(r);
  console.log(`${name}：${r.A !== undefined ? `分解段 ${r.A} ms/幀` : ""}${r.B !== undefined ? `　熱循環段 ${r.B} ms/幀` : ""}${r.C !== undefined ? `　光掃段 ${r.C} ms/幀` : ""}`);
  fs.writeFileSync(path.join(ROOT, "out", slug, `bench-fx${opt("--tag", "") ? "-" + opt("--tag", "") : ""}.json`), JSON.stringify({ at: new Date().toISOString(), frames: n, base: baseFx, A, B, C, gl: chromiumOptions.gl, concurrency: 1, results: res }, null, 1));
}
fs.rmSync(out, { force: true });

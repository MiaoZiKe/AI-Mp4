// node scripts/three/layout-check.mjs <slug> [--json]：HUD 片（script.json 有 hud）的版面檢查，不開瀏覽器、不渲染（幾秒）。
// 用和畫面同一份的 engine.ts／hudLayout.ts 逐幀算：標籤或蓋章壓到 3D 模型、兩個疊層同時出現又重疊（換幕時字壓字）、超出安全區、壓到字幕框、
// 內容底部太高（下方空白太多）、小字 <30px、片尾卡 <3 秒或動畫落定後停不到 1 秒。結果寫 out/<slug>/layout-check.json；有 error 時結束碼 1。
// validate-three.mjs 對有 hud 的片會自動跑這支。2026/11/15 為使用者回饋（LOGO、空白、重疊、標籤壓模型）新增。
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { build } from "esbuild";

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "../..");
const slug = process.argv[2], asJson = process.argv.includes("--json");
if (!slug) { console.error("用法：node scripts/three/layout-check.mjs <slug>"); process.exit(2); }
const sp = path.join(ROOT, "videos", slug, "script.json");
const script = JSON.parse(fs.readFileSync(sp, "utf8"));
const tp = path.join(ROOT, "videos", slug, "timeline.json"), mp = path.join(ROOT, "videos", slug, "model.json");
script.timeline = fs.existsSync(tp) ? JSON.parse(fs.readFileSync(tp, "utf8")) : null;
if (!script.model && fs.existsSync(mp)) script.model = JSON.parse(fs.readFileSync(mp, "utf8"));
if (!script.hud || !script.timeline) { const r = { issues: [], skipped: !script.hud ? "沒有 hud" : "沒有 timeline.json" }; console.log(asJson ? JSON.stringify(r) : `略過：${r.skipped}`); process.exit(0); }
// 打包：字型模組在 node 裡不需要（換成空殼），其他照原樣
const outDir = path.join(ROOT, "out", ".bundle", `layout-${process.pid}`);
fs.mkdirSync(outDir, { recursive: true });
process.on("exit", () => fs.rmSync(outDir, { recursive: true, force: true }));
const outfile = path.join(outDir, "check.mjs");
await build({
  entryPoints: [path.join(ROOT, "scripts/three/layout-check-entry.ts")], bundle: true, platform: "node", format: "esm", outfile, logLevel: "error",
  jsx: "automatic", loader: { ".json": "json" },
  plugins: [{ name: "stub-fonts", setup(b) { b.onResolve({ filter: /^@remotion\/google-fonts\// }, () => ({ path: "fonts", namespace: "stub" })); b.onLoad({ filter: /.*/, namespace: "stub" }, () => ({ contents: "export const loadFont = () => ({ fontFamily: 'x', waitUntilDone: () => Promise.resolve() }); export const getInfo = () => ({ fontFamily: 'x' });", loader: "js" })); } }],
  banner: { js: "import { createRequire as __cr } from 'module'; const require = __cr(import.meta.url);" },
});
const { check } = await import(pathToFileURL(outfile).href);
const res = check(script);
fs.mkdirSync(path.join(ROOT, "out", slug), { recursive: true });
fs.writeFileSync(path.join(ROOT, "out", slug, "layout-check.json"), JSON.stringify(res, null, 1));
if (asJson) console.log(JSON.stringify(res));
else {
  const fr = (r) => (r ? `（第 ${r[0]}–${r[1]} 幀，${(r[0] / 30).toFixed(2)}–${(r[1] / 30).toFixed(2)} 秒）` : "");
  for (const i of res.issues) console.log(`${i.level === "error" ? "✖" : "⚠"} [${i.kind}] ${i.msg}${fr(i.frames)}`);
  const ne = res.issues.filter((i) => i.level === "error").length;
  console.log(`${ne ? "✖" : "✔"} 版面檢查 ${slug}：${ne} error、${res.issues.length - ne} warning（${res.stats.frames} 幀、${res.stats.labels} 張標籤、${res.stats.overlays} 個疊層）`);
}
process.exitCode = res.issues.some((i) => i.level === "error") ? 1 : 0;

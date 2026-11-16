// node scripts/three/yield-check.mjs <slug>：tech-yield 這種「整支畫在 art: yield」的片的逐幀重疊檢查（不開瀏覽器）。結果寫 out/<slug>/yield-check.json
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { build } from "esbuild";
const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "../..");
const slug = process.argv[2];
const script = JSON.parse(fs.readFileSync(path.join(ROOT, "videos", slug, "script.json"), "utf8"));
script.timeline = JSON.parse(fs.readFileSync(path.join(ROOT, "videos", slug, "timeline.json"), "utf8"));
const outDir = path.join(ROOT, "out", ".bundle", `ycheck-${process.pid}`);
fs.mkdirSync(outDir, { recursive: true });
process.on("exit", () => fs.rmSync(outDir, { recursive: true, force: true }));
const outfile = path.join(outDir, "check.mjs");
await build({ entryPoints: [path.join(ROOT, "scripts/three/yield-check-entry.tsx")], bundle: true, platform: "node", format: "esm", outfile, logLevel: "error", jsx: "automatic", loader: { ".json": "json" },
  plugins: [{ name: "stub", setup(b) { b.onResolve({ filter: /^@remotion\/google-fonts\// }, () => ({ path: "fonts", namespace: "stub" })); b.onLoad({ filter: /.*/, namespace: "stub" }, () => ({ contents: "export const loadFont = () => ({ fontFamily: 'x', waitUntilDone: () => Promise.resolve() }); export const getInfo = () => ({ fontFamily: 'x' });", loader: "js" })); } }],
  banner: { js: "import { createRequire as __cr } from 'module'; const require = __cr(import.meta.url);" } });
const { check } = await import(pathToFileURL(outfile).href);
const res = check(script);
fs.mkdirSync(path.join(ROOT, "out", slug), { recursive: true });
fs.writeFileSync(path.join(ROOT, "out", slug, "yield-check.json"), JSON.stringify(res, null, 1));
// 依種類＋對象合併成區間
const g = {};
for (const i of res.issues) { const k = `${i.kind}｜${i.a}${i.b ? "｜" + i.b : ""}`; (g[k] ??= []).push(i.f); }
for (const [k, fs2] of Object.entries(g)) console.log(`✖ ${k}（${fs2.length} 幀，第 ${fs2[0]}–${fs2[fs2.length - 1]} 幀）`);
console.log(`重疊檢查：程式 ${res.frames} 幀 ${res.issues.length} 筆（每幀最多 ${res.maxBoxes} 個框）`);
process.exitCode = res.issues.length ? 1 : 0;

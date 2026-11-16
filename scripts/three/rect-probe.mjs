// node scripts/three/rect-probe.mjs <slug> <幀,幀,…>：印主素材框（x0,y0,x1,y1）。開發用，不渲染
import fs from "node:fs"; import path from "node:path"; import { pathToFileURL } from "node:url"; import { build } from "esbuild";
import { expandModel, expandScript } from "./parts/index.mjs";
const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "../..");
const [slug, fl] = process.argv.slice(2), d = path.join(ROOT, "videos", slug);
const s = JSON.parse(fs.readFileSync(path.join(d, "script.json"), "utf8")); s.timeline = JSON.parse(fs.readFileSync(path.join(d, "timeline.json"), "utf8")); s.model = expandModel(JSON.parse(fs.readFileSync(path.join(d, "model.json"), "utf8"))); s.scenes = expandScript(s, s.model).scenes;
const out = path.join(ROOT, "out", ".bundle", `probe-${process.pid}`); fs.mkdirSync(out, { recursive: true }); process.on("exit", () => fs.rmSync(out, { recursive: true, force: true }));
await build({ entryPoints: [path.join(ROOT, "scripts/three/rect-probe-entry.ts")], bundle: true, platform: "node", format: "esm", outfile: path.join(out, "p.mjs"), logLevel: "error", jsx: "automatic", loader: { ".json": "json" },
  plugins: [{ name: "stub", setup(b) { b.onResolve({ filter: /^@remotion\/google-fonts\// }, () => ({ path: "f", namespace: "stub" })); b.onLoad({ filter: /.*/, namespace: "stub" }, () => ({ contents: "export const loadFont=()=>({fontFamily:'x',waitUntilDone:()=>Promise.resolve()});export const getInfo=()=>({fontFamily:'x'});", loader: "js" })); } }],
  banner: { js: "import { createRequire as __cr } from 'module'; const require = __cr(import.meta.url);" } });
const { probe, perLayer } = await import(pathToFileURL(path.join(out, "p.mjs")).href);
if (process.env.PER) { for (const r of perLayer(s, Number(fl))) console.log(r.join(" ")); process.exit(0); }
for (const [f, r] of probe(s, fl.split(",").map(Number))) console.log(f, JSON.stringify(r));

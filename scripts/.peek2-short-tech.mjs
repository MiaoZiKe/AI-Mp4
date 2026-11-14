// node peek2.mjs <slug> <outdir> <frames,...>
import fs from "node:fs"; import path from "node:path";
import { renderStill, selectComposition } from "@remotion/renderer";
import { BROWSER, loadScript, makeBundle, chromiumOptions } from "./lib.mjs";
const [slug, out, list] = process.argv.slice(2);
await import("./fetch-fonts.mjs");
const script = loadScript(slug);
const serveUrl = await makeBundle();
const opts = { serveUrl, inputProps: script, browserExecutable: BROWSER, chromiumOptions, logLevel: "error" };
const comp = await selectComposition({ ...opts, id: "Video" });
fs.mkdirSync(out, { recursive: true });
for (const fr of list.split(",").map(Number)) await renderStill({ ...opts, composition: comp, frame: fr, output: path.join(out, `f${String(fr).padStart(3, "0")}.png`), scale: 0.4 });
process.exit(0);

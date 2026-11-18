// node scripts/three/render-range.mjs <slug> <起始幀> <結束幀> <輸出.mp4>：只渲一段（無聲、和 render.mjs 同樣的編碼設定），給「只改了片尾幾秒」時接回成片用。
import { renderMedia, selectComposition } from "@remotion/renderer";
import { BROWSER, loadScript, makeBundle, chromiumOptions, renderTuning } from "../lib.mjs";
await import("../fetch-fonts.mjs");
const [slug, a, b, out] = process.argv.slice(2);
const script = loadScript(slug);
const serveUrl = await makeBundle();
const opts = { serveUrl, inputProps: script, browserExecutable: BROWSER, chromiumOptions, logLevel: "error" };
const comp = await selectComposition({ ...opts, id: "Video" });
await renderMedia({ ...opts, composition: comp, codec: "h264", pixelFormat: "yuv420p", colorSpace: "bt709", outputLocation: out, concurrency: renderTuning.concurrency, ...(process.env.RENDER_TIMEOUT_MS ? { timeoutInMilliseconds: Number(process.env.RENDER_TIMEOUT_MS) } : {}), frameRange: [Number(a), Number(b)], muted: true });
console.log(`✔ ${out}（第 ${a}–${b} 幀）`);

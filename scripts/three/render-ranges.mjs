// node scripts/three/render-ranges.mjs <slug> <輸出資料夾> <起-迄> [<起-迄> …]：一次打包、連續渲多段（無聲，和 render-range.mjs 同樣的編碼設定）。
// 給雲端分段渲染（.github/workflows/render-chunks.yml）用：每台 runner 分到幾段交錯的小段（第 k、k+16、k+32… 段），重場景平均分散，各台完工時間接近。
// 每段輸出 <輸出資料夾>/c<起幀五位數>.mp4；CHUNK_AUDIO=1 時改輸出 .mkv（h264＋pcm-16 音軌），PCM 接起來樣本不斷，雲端可以自己做音軌、不靠本機成品。
import fs from "node:fs";
import path from "node:path";
import { renderMedia, selectComposition } from "@remotion/renderer";
import { BROWSER, loadScript, makeBundle, chromiumOptions, renderTuning } from "../lib.mjs";
await import("../fetch-fonts.mjs");
const [slug, outDir, ...ranges] = process.argv.slice(2);
if (!slug || !outDir || !ranges.length) throw new Error("用法：node scripts/three/render-ranges.mjs <slug> <輸出資料夾> <起-迄> …");
fs.mkdirSync(outDir, { recursive: true });
const script = loadScript(slug);
const serveUrl = await makeBundle();
const opts = { serveUrl, inputProps: script, browserExecutable: BROWSER, chromiumOptions, logLevel: "error" };
const comp = await selectComposition({ ...opts, id: "Video" });
for (const r of ranges) {
  const [a, b] = r.split("-").map(Number);
  const withAudio = process.env.CHUNK_AUDIO === "1";
  const out = path.join(outDir, `c${String(a).padStart(5, "0")}.${withAudio ? "mkv" : "mp4"}`), t0 = Date.now();
  await renderMedia({ ...opts, composition: comp, codec: withAudio ? "h264-mkv" : "h264", ...(withAudio ? { audioCodec: "pcm-16" } : {}), pixelFormat: "yuv420p", colorSpace: "bt709", outputLocation: out, concurrency: renderTuning.concurrency, ...(process.env.RENDER_TIMEOUT_MS ? { timeoutInMilliseconds: Number(process.env.RENDER_TIMEOUT_MS) } : {}), frameRange: [a, b], muted: !withAudio });
  console.log(`✔ ${out}（第 ${a}–${b} 幀，${Math.round((Date.now() - t0) / 1000)} 秒）`);
}

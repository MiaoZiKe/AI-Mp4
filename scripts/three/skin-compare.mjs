// node scripts/three/skin-compare.mjs <slug> <幀,幀,…> [skinA,skinB,…]：同一支深色 HUD 片、同幾幀，各套頻道皮膚（script.json 頂層 hudSkin）各渲一排，
// 拼成 out/<slug>-skin-compare.png（每排左上標皮膚名）。不改 script.json，只在渲染時換 hudSkin。皮膚清單讀 src/theme-hud-skins.json。
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { execFileSync } from "node:child_process";
import { renderStill, selectComposition } from "@remotion/renderer";
import { ROOT, BROWSER, loadScript, makeBundle, chromiumOptions } from "../lib.mjs";
const [slug, list, skinArg] = process.argv.slice(2);
const SK = JSON.parse(fs.readFileSync(path.join(ROOT, "src/theme-hud-skins.json"), "utf8"));
const skins = skinArg ? skinArg.split(",") : Object.keys(SK).filter((k) => !k.startsWith("_"));
const frames = list.split(",").map(Number), scale = 0.5;
await import("../fetch-fonts.mjs");
const script = loadScript(slug);
const serveUrl = await makeBundle();
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "skin-"));
let n = 0;
for (const sk of skins) {
  const opts = { serveUrl, inputProps: { ...script, hudSkin: sk }, browserExecutable: BROWSER, chromiumOptions, logLevel: "error" };
  const comp = await selectComposition({ ...opts, id: "Video" });
  for (const [i, fr] of frames.entries()) {
    const f = path.join(tmp, `${String(n++).padStart(3, "0")}.png`);
    await renderStill({ ...opts, composition: comp, frame: fr, output: f, scale });
    if (i === 0) execFileSync("ffmpeg", ["-y", "-loglevel", "error", "-i", f, "-vf", `drawbox=x=0:y=0:w=iw:h=70:color=white@1:t=fill,drawtext=text='hudSkin\\: ${sk}':x=16:y=16:fontsize=40:fontcolor=black:fontfile=/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf`, f + ".l.png"]), fs.renameSync(f + ".l.png", f);
  }
}
const out = path.join(ROOT, "out", `${slug}-skin-compare.png`);
execFileSync("ffmpeg", ["-y", "-loglevel", "error", "-framerate", "1", "-pattern_type", "glob", "-i", path.join(tmp, "*.png"), "-vf", `tile=${frames.length}x${skins.length}:padding=8:color=0x202020`, "-frames:v", "1", out]);
fs.rmSync(tmp, { recursive: true, force: true });
console.log(`✔ ${path.relative(ROOT, out)}：${skins.join("／")} × 第 ${frames.join("、")} 幀`);

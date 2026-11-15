// node scripts/three/logo-anims.mjs <slug> [名字,名字,…]：只渲片尾卡（最後一幕 endCard），每種 logoAnim 各一支 3 秒 MP4，
// 再拼成 out/logo-anims/sheet.png（每排一種、6 格）與 out/logo-anims/all.mp4（半解析度、上方標名字）。不改 script.json，只在渲染時換 props.endCard.logoAnim。
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { renderMedia, selectComposition } from "@remotion/renderer";
import { ROOT, BROWSER, loadScript, makeBundle, chromiumOptions, renderTuning } from "../lib.mjs";
const [slug, listArg] = process.argv.slice(2);
const LABEL = { draw: "描線（現行）", circuit: "電路走線", scan: "掃描定位", neural: "神經網路", particles: "粒子聚合", glitch: "數位故障", loading: "載入進度", orbit: "電子軌道", blueprint: "藍圖作圖" };
const names = listArg ? listArg.split(",") : Object.keys(LABEL);
await import("../fetch-fonts.mjs");
const script = loadScript(slug);
const last = script.scenes[script.scenes.length - 1];
const sb = JSON.parse(fs.readFileSync(path.join(ROOT, "videos", slug, "storyboard.json"), "utf8"));
const st = sb.scenes.find((x) => x.id === last.id);
const a = st.startFrame, b = st.startFrame + st.durationFrames - 1;
const dir = path.join(ROOT, "out", "logo-anims");
fs.mkdirSync(dir, { recursive: true });
const serveUrl = await makeBundle();
const FONT = "/usr/share/fonts/opentype/unifont/unifont.otf";
for (const nm of names) {
  const sc = script.scenes.map((x) => (x.id === last.id ? { ...x, props: { ...x.props, endCard: { ...x.props.endCard, logoAnim: nm } } } : x));
  const opts = { serveUrl, inputProps: { ...script, scenes: sc }, browserExecutable: BROWSER, chromiumOptions, logLevel: "error" };
  const comp = await selectComposition({ ...opts, id: "Video" });
  const out = path.join(dir, `${nm}.mp4`);
  await renderMedia({ ...opts, composition: comp, codec: "h264", pixelFormat: "yuv420p", colorSpace: "bt709", outputLocation: out, concurrency: renderTuning.concurrency, frameRange: [a, b], muted: true, crf: 20 });
  console.log(`✔ ${path.relative(ROOT, out)}`);
}
// 每支：半解析度＋上方標籤 → 接成 all.mp4；同時抽 6 格拼 sheet
const lab = (nm) => `drawbox=x=0:y=0:w=iw:h=64:color=0x0F1C3A@1:t=fill,drawtext=fontfile=${FONT}:text='${nm}  ${LABEL[nm] ?? ""}':x=20:y=14:fontsize=36:fontcolor=white`;
const parts = [];
for (const nm of names) {
  const p = path.join(dir, `.r-${nm}.mp4`);
  execFileSync("ffmpeg", ["-y", "-loglevel", "error", "-i", path.join(dir, `${nm}.mp4`), "-vf", `scale=540:960,${lab(nm)}`, "-c:v", "libx264", "-crf", "23", "-pix_fmt", "yuv420p", p]);
  parts.push(p);
}
fs.writeFileSync(path.join(dir, ".list.txt"), parts.map((p) => `file '${p}'`).join("\n"));
execFileSync("ffmpeg", ["-y", "-loglevel", "error", "-f", "concat", "-safe", "0", "-i", path.join(dir, ".list.txt"), "-c", "copy", path.join(dir, "all.mp4")]);
const rows = [];
for (const nm of names) {
  const r = path.join(dir, `.row-${nm}.png`);
  // 6 格：第 4、14、24、36、50、80 幀（縮成 1/4）
  const sel = [8, 16, 24, 32, 44, 80].map((k) => `eq(n\\,${k})`).join("+");
  execFileSync("ffmpeg", ["-y", "-loglevel", "error", "-i", path.join(dir, `${nm}.mp4`), "-vf", `select='${sel}',crop=1080:1040:0:200,scale=270:260,tile=6x1:padding=4:color=0xCCCCCC`, "-frames:v", "1", "-vsync", "0", r]);
  const r2 = r + ".l.png";
  execFileSync("ffmpeg", ["-y", "-loglevel", "error", "-i", r, "-vf", `pad=iw:ih+48:0:48:color=0x0F1C3A,drawtext=fontfile=${FONT}:text='${nm}  ${LABEL[nm] ?? ""}   (f 8/16/24/32/44/80)':x=12:y=8:fontsize=32:fontcolor=white`, r2]);
  rows.push(r2);
}
execFileSync("ffmpeg", ["-y", "-loglevel", "error", ...rows.flatMap((r) => ["-i", r]), "-filter_complex", `vstack=inputs=${rows.length}`, path.join(dir, "sheet.png")]);
for (const f of fs.readdirSync(dir)) if (f.startsWith(".")) fs.rmSync(path.join(dir, f));
console.log(`✔ out/logo-anims/sheet.png、all.mp4（${names.join("／")}）`);

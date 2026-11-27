// node scripts/three/pad-recording.mjs <slug> <錄音.wav（public/ 底下的相對路徑）> <錄音涵蓋前幾幕> [--out <public/ 下的輸出路徑>] [--bounds <json>]
// 選用步驟（script.json 的 scenes[].holdSec／headSec；沒寫的片不變）：使用者自備的錄音是「一幕一段、保留原本句間停頓」，
// recording-timeline.mjs 的影片時間＝錄音時間，所以幕長會被壓成「人聲＋原本的停頓」。這支依 holdSec 在每幕人聲後補靜音，
// 讓「本幕念完只有畫面」≥ holdSec、「下一幕開口前只有畫面」≥ headSec（兩者合計補在兩幕人聲之間）；補的是靜音，聲音不加速、不移調、不重錄。
// 流程：強制對齊（scripts/fa.py，本機、不花請求）量出各幕人聲 [vs, ve] → 在每段靜音的正中間切開、補足差額 → 輸出 <原檔名>-padded.wav，
// 再對補好的檔跑 recording-timeline.mjs（它也認 headSec：本幕提早 headSec 秒進場）。--bounds 可直接給 [{vs,ve},…]（秒，跳過對齊；測試用）。
// 補完寫 videos/<slug>/pad-recording.json（每幕補了幾秒、新的人聲區間）。
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "../..");
const args = process.argv.slice(2), opt = (k) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : null; };
const [slug, recRel, nStr] = args.filter((a, i) => !a.startsWith("--") && !(i > 0 && args[i - 1].startsWith("--")));
const N = Number(nStr);
if (!slug || !recRel || !(N > 0)) { console.error("用法：node scripts/three/pad-recording.mjs <slug> <audio/<slug>/take.wav> <涵蓋幕數> [--out <路徑>] [--bounds <json>]"); process.exit(2); }
const script = JSON.parse(fs.readFileSync(path.join(ROOT, "videos", slug, "script.json"), "utf8"));
const scenes = script.scenes.slice(0, N), inFile = path.join(ROOT, "public", recRel);
const outRel = opt("--out") ?? recRel.replace(/\.wav$/i, "") + "-padded.wav", outFile = path.join(ROOT, "public", outRel);
let bounds;
if (opt("--bounds")) bounds = JSON.parse(fs.readFileSync(opt("--bounds"), "utf8"));
else {
  const texts = scenes.map((s) => s.tts ?? s.narration);
  const py = fs.existsSync(path.join(ROOT, ".venv/bin/python")) ? path.join(ROOT, ".venv/bin/python") : "python3";
  const fa = JSON.parse(execFileSync(py, [path.join(ROOT, "scripts/fa.py")], { input: JSON.stringify([{ id: "rec", file: path.join("public", recRel), text: texts.join("") }]), cwd: ROOT, stdio: ["pipe", "pipe", "ignore"], maxBuffer: 1 << 28 }).toString().trim().split("\n").pop())?.[0] ?? null;
  if (!fa?.ok) { console.error("✖ 強制對齊失敗"); process.exit(1); }
  bounds = []; let off = 0;
  for (const [k] of scenes.entries()) { const us = fa.units.filter((u) => u.i >= off && u.i < off + texts[k].length); off += texts[k].length; if (!us.length) { console.error(`✖ ${scenes[k].id} 沒對到字`); process.exit(1); } bounds.push({ vs: us[0].start, ve: us.at(-1).end }); }
}
const probe = (k) => execFileSync("ffprobe", ["-v", "error", "-select_streams", "a:0", "-show_entries", `stream=${k}`, "-of", "csv=p=0", inFile]).toString().trim();
const sr = Number(probe("sample_rate")), ch = Number(probe("channels")), total = Number(execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", inFile]).toString().trim());
// 計畫：切點＝各段靜音正中間；每個切點補 extra 秒靜音
const cuts = [], rep = [];
const head0 = Number(scenes[0].headSec ?? 0);
if (head0 > bounds[0].vs) cuts.push({ t: 0, extra: head0 - bounds[0].vs });
for (let i = 0; i < N; i++) {
  const hold = typeof scenes[i].holdSec === "number" ? scenes[i].holdSec : 0, headN = Number(script.scenes[i + 1]?.headSec ?? 0);
  const last = i === N - 1, gap = last ? total - bounds[i].ve : bounds[i + 1].vs - bounds[i].ve;
  const want = hold > 0 ? hold + (last ? 0 : headN) : 0, extra = Math.max(0, want - gap);
  rep.push({ id: scenes[i].id, gapBefore: +gap.toFixed(3), want: +want.toFixed(3), extra: +extra.toFixed(3) });
  if (extra > 0.001) cuts.push({ t: last ? total : bounds[i].ve + gap / 2, extra });
}
const inputs = ["-i", inFile], parts = [], seg = [];
let prev = 0, idx = 0, si = 0;
const addSeg = (a, b) => { if (b - a > 0.0005) { parts.push(`[0:a]atrim=start=${a.toFixed(4)}:end=${b.toFixed(4)},asetpts=PTS-STARTPTS[s${idx}]`); seg.push(`[s${idx}]`); idx++; } };
for (const c of cuts) {
  addSeg(prev, c.t); prev = c.t;
  inputs.push("-f", "lavfi", "-t", c.extra.toFixed(4), "-i", `anullsrc=r=${sr}:cl=${ch === 1 ? "mono" : "stereo"}`); si++;
  seg.push(`[${si}:a]`);
}
addSeg(prev, total);
fs.mkdirSync(path.dirname(outFile), { recursive: true });
execFileSync("ffmpeg", ["-y", "-v", "error", ...inputs, "-filter_complex", `${parts.join(";")};${seg.join("")}concat=n=${seg.length}:v=0:a=1[o]`, "-map", "[o]", "-c:a", "pcm_s16le", outFile]);
// 新的人聲區間（累加補的靜音）
let shift = cuts.find((c) => c.t === 0)?.extra ?? 0; const nb = [];
for (let i = 0; i < N; i++) { nb.push({ id: scenes[i].id, vs: +(bounds[i].vs + shift).toFixed(3), ve: +(bounds[i].ve + shift).toFixed(3) }); const c = cuts.find((x) => x.t > 0 && Math.abs(x.t - (i === N - 1 ? total : (bounds[i].ve + (bounds[i + 1].vs - bounds[i].ve) / 2))) < 1e-6); if (c) shift += c.extra; }
fs.writeFileSync(path.join(ROOT, "videos", slug, "pad-recording.json"), JSON.stringify({ input: recRel, output: outRel, plan: rep, bounds: nb }, null, 1));
const outDur = Number(execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", outFile]).toString().trim());
console.log(`✔ ${outRel}：${total.toFixed(2)} 秒 → ${outDur.toFixed(2)} 秒（共補 ${rep.reduce((a, r) => a + r.extra, 0).toFixed(2)} 秒靜音）；各幕補了幾秒：${rep.map((r) => `${r.id}+${r.extra}`).join(" ")}`);
console.log(`下一步：node scripts/dossier/recording-timeline.mjs ${slug} ${outRel} ${N}`);

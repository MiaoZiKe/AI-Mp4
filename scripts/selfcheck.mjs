// npm run selfcheck <slug> [-- --sample] [-- --video out/x.mp4] [-- --no-render]
// v3 自查管線（亞里自查＋huashu film_gate）：一個指令產出
//   ① 9 個關鍵時刻拼圖 out/<slug>/selfcheck/grid9.png（時間取 storyboard.json：第 30 幀＋各幕最後一個 cue 落定後 12 幀）
//   ② 逐幕縮圖帶 out/<slug>/selfcheck/strip.png（各幕 stillFrame）
//   ③ film_gate 移植版＋單幀跳變＋轉場佔用＋鉤子幀差（scripts/audit/selfcheck.py，量 AUDIT=1 渲染）
//   ④ 確定性：同一幀渲兩次，sha256 必須一致
//   ⑤ 樣片關口：--sample 只渲第 0–449 幀（15 秒）量③④，通過才該出全片
//   ⑥ 六項評分：videos/<slug>/review.md（由沒參與製作的 agent 依評分表打分）；任何一項 < 8 → 失敗；沒有 review.md 就寫評分表樣板
// 結果寫 videos/<slug>/selfcheck.json；任何一項不過 → 非零結束。
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { execFileSync, spawnSync } from "node:child_process";
import { renderMedia, renderStill, selectComposition } from "@remotion/renderer";
import { ROOT, BROWSER, loadScript, makeBundle, chromiumOptions } from "./lib.mjs";

const args = process.argv.slice(2);
const slug = args.find((a) => !a.startsWith("--"));
if (!slug) { console.error("用法：npm run selfcheck <slug> [-- --sample]"); process.exit(2); }
const sample = args.includes("--sample");
const vArg = args.includes("--video") ? args[args.indexOf("--video") + 1] : null;
const SAMPLE_FRAMES = 450;
await import("./fetch-fonts.mjs");
const script = loadScript(slug);
const vdir = path.join(ROOT, "videos", slug);
const odir = path.join(ROOT, "out", slug, "selfcheck");
fs.mkdirSync(odir, { recursive: true });
const sb = JSON.parse(fs.readFileSync(path.join(vdir, "storyboard.json"), "utf8"));
const rows = sb.scenes ?? sb.rows ?? sb;
const serveUrl = await makeBundle();
const auditProps = { ...script, audit: true };
const opts = { serveUrl, inputProps: auditProps, browserExecutable: BROWSER, chromiumOptions };
const comp = await selectComposition({ ...opts, id: "Video" });
const report = { slug, at: new Date().toISOString(), sample, gates: {} };

// ③ 量測用影片（AUDIT=1：關掉 ambient）
let video = vArg ? path.resolve(ROOT, vArg) : path.join(ROOT, "out", `${slug}${sample ? "-sample" : "-audit"}.mp4`);
if (!vArg && (sample || !fs.existsSync(video) || args.includes("--render"))) {
  const range = sample ? [0, Math.min(SAMPLE_FRAMES, comp.durationInFrames) - 1] : null;
  console.log(`render ${sample ? `樣片 0–${range[1]}` : "全片"}（AUDIT=1）→ ${path.relative(ROOT, video)}`);
  await renderMedia({ ...opts, composition: comp, codec: "h264", pixelFormat: "yuv420p", outputLocation: video, concurrency: 4, ...(range ? { frameRange: range } : {}) });
}

// ④ 確定性：同一幀渲兩次
const probeFrame = Math.min(comp.durationInFrames - 1, sample ? 300 : Math.floor(comp.durationInFrames / 2));
const hashes = [];
for (let k = 0; k < 2; k++) {
  const f = path.join(odir, `det-${k}.png`);
  await renderStill({ ...opts, composition: comp, frame: probeFrame, output: f, scale: 0.5 });
  hashes.push(crypto.createHash("sha256").update(fs.readFileSync(f)).digest("hex"));
}
report.determinism = { frame: probeFrame, same: hashes[0] === hashes[1] };
report.gates["determinism"] = hashes[0] === hashes[1];
console.log(`${report.determinism.same ? "✔" : "✖"} 確定性：第 ${probeFrame} 幀渲兩次 ${report.determinism.same ? "一致" : "不一致"}`);

// ①② 拼圖與縮圖帶（一般渲染，含 ambient）
const normal = { ...opts, inputProps: script };
const limit = sample ? SAMPLE_FRAMES : comp.durationInFrames;
const key = [30];
const cands = rows.filter((r) => r.startFrame < limit).map((r) => {
  const cues = (r.cues ?? []).filter((q) => q.frame != null).map((q) => q.frame);
  const end = r.startFrame + r.durationFrames - (r.transition?.frames ?? 10) - 2;
  return Math.min(limit - 1, cues.length ? Math.min(Math.max(...cues) + 12, end) : r.startFrame + Math.round(r.durationFrames / 2));
});
const pick = (arr, k) => (arr.length <= k ? arr : Array.from({ length: k }, (_, i) => arr[Math.round((i * (arr.length - 1)) / (k - 1))]));
for (const f of pick(cands.slice(1), 8)) if (!key.includes(f)) key.push(f);
const shot = async (frames, name, tile) => {
  const files = [];
  for (const fr of frames) {
    const f = path.join(odir, `${name}-${String(fr).padStart(5, "0")}.png`);
    await renderStill({ ...normal, composition: comp, frame: fr, output: f, scale: 1 / 3 });
    files.push(f);
  }
  const out = path.join(odir, `${name}.png`);
  execFileSync("ffmpeg", ["-y", "-loglevel", "error", ...files.flatMap((f) => ["-i", f]), "-filter_complex", `${files.map((_, i) => `[${i}]`).join("")}${tile ? `xstack=inputs=${files.length}:layout=${tile}` : `hstack=${files.length}`}`, out]);
  files.forEach((f) => fs.rmSync(f));
  return out;
};
const xs = (n) => Array.from({ length: n }, (_, i) => `${(i % 3) * 360}_${Math.floor(i / 3) * 640}`).join("|");
report.grid9 = { frames: key, file: path.relative(ROOT, await shot(key, "grid9", key.length === 9 ? xs(9) : null)) };
const stills = rows.filter((r) => r.stillFrame < limit).map((r) => Math.min(limit - 1, r.stillFrame));
report.strip = { frames: stills, file: path.relative(ROOT, await shot(stills, "strip", null)) };
console.log(`✔ ${report.grid9.file}（幀 ${key.join(",")}）＋ ${report.strip.file}`);

// ③ 像素指標
const pj = path.join(odir, "pixel.json");
const py = spawnSync("python3", [path.join(ROOT, "scripts", "audit", "selfcheck.py"), video, path.join(vdir, "timeline.json"), pj], { stdio: "inherit" });
const px = JSON.parse(fs.readFileSync(pj, "utf8"));
report.pixel = px;
Object.assign(report.gates, px.gates);
if (py.status !== 0 && py.status !== 1) report.gates["selfcheck.py"] = false;

// ⑥ 六項評分（review.md）
const ITEMS = ["前 2 秒抓人", "手機上看得清", "動作自然", "畫面變化", "構圖", "聲畫匹配"];
const rv = path.join(vdir, "review.md");
if (sample) {
  report.gates["review>=8"] = null; // 樣片關口不看主觀評分
} else if (fs.existsSync(rv)) {
  const txt = fs.readFileSync(rv, "utf8");
  const scores = Object.fromEntries(ITEMS.map((k) => { const m = txt.match(new RegExp(`\\|\\s*${k}\\s*\\|\\s*(\\d+(?:\\.\\d+)?)`)); return [k, m ? Number(m[1]) : null]; }));
  report.review = scores;
  report.gates["review>=8"] = ITEMS.every((k) => scores[k] !== null && scores[k] >= 8);
  console.log(`${report.gates["review>=8"] ? "✔" : "✖"} 六項評分：${ITEMS.map((k) => `${k} ${scores[k] ?? "?"}`).join("、")}`);
} else {
  fs.writeFileSync(rv, `# ${slug} 六項評分（亞里自查）\n\n由沒參與製作的 agent 看 out/${slug}/selfcheck/grid9.png、strip.png 與成片打分（1–10），任何一項 < 8 就再改一輪。\n\n| 項目 | 分數 | 理由 |\n|---|---|---|\n${ITEMS.map((k) => `| ${k} |  |  |`).join("\n")}\n`);
  report.gates["review>=8"] = null;
  console.log(`– 沒有 review.md：已寫評分表樣板 ${path.relative(ROOT, rv)}`);
}

report.pass = Object.values(report.gates).every((v) => v !== false);
fs.writeFileSync(path.join(vdir, "selfcheck.json"), JSON.stringify(report, null, 1));
console.log(`${report.pass ? "✔ 自查通過" : "✖ 自查不通過"}：videos/${slug}/selfcheck.json`);
process.exit(report.pass ? 0 : 1);

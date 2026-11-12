// npm run still <slug>：每幕截一張圖 + 封面 + 總覽圖（有 timeline 時用配音長度）
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { renderStill, selectComposition } from "@remotion/renderer";
import { ROOT, BROWSER, loadScript, makeBundle, chromiumOptions, stillFrames, assertFrames } from "./lib.mjs";

await import("./fetch-fonts.mjs");
const slug = process.argv[2];
const script = loadScript(slug);
const outDir = path.join(ROOT, "out", slug, "stills");
fs.rmSync(outDir, { recursive: true, force: true });
fs.mkdirSync(outDir, { recursive: true });
const serveUrl = await makeBundle();
const opts = { serveUrl, inputProps: script, browserExecutable: BROWSER, chromiumOptions };
const comp = await selectComposition({ ...opts, id: "Video" });

assertFrames(script, comp);
const frames = stillFrames(script); // v1：動畫結束、淡出前；v2：timeline 的 stillFrame
const files = [];
for (const [i, s] of script.scenes.entries()) {
  const frame = frames[i];
  const file = path.join(outDir, `${String(i + 1).padStart(2, "0")}-${s.id}.png`);
  await renderStill({ ...opts, composition: comp, frame, output: file });
  files.push(file);
  console.log(`✔ ${path.relative(ROOT, file)} (frame ${frame})`);
}
const cover = await selectComposition({ ...opts, id: "Cover" });
const coverFile = path.join(ROOT, "out", `${slug}-cover.png`);
await renderStill({ ...opts, composition: cover, frame: 0, output: coverFile });
console.log(`✔ ${path.relative(ROOT, coverFile)}`);
// P1-10：個人頁網格是 3:4（1080×1440，畫面中央）裁切；另附 1:1（1080×1080）預覽，確認主標題兩種裁切都看得到
for (const [tag, h] of [["3x4", 1440], ["1x1", 1080]]) {
  const f = path.join(ROOT, "out", `${slug}-cover-${tag}.png`);
  // v3：裁切版另外渲一張，把頁首移進裁切範圍（否則 3:4 切到一半、1:1 整個不見）；v1／v2 照舊直接裁
  let src = coverFile;
  if (script.styleVersion === 3) { src = path.join(outDir, `_cover-${tag}.png`); await renderStill({ ...opts, inputProps: { ...script, coverCrop: h }, composition: { ...cover, props: { ...cover.props, coverCrop: h } }, frame: 0, output: src }); }
  execFileSync("ffmpeg", ["-y", "-loglevel", "error", "-i", src, "-vf", `crop=1080:${h}:0:${(1920 - h) / 2}`, f]);
  if (src !== coverFile) fs.rmSync(src);
  console.log(`✔ ${path.relative(ROOT, f)}`);
}

// 總覽圖（ffmpeg tile）
const sheet = path.join(ROOT, "out", `${slug}-overview.png`);
const cols = 6, rows = Math.ceil(files.length / cols);
execFileSync("ffmpeg", ["-y", "-loglevel", "error", "-framerate", "1", "-pattern_type", "glob", "-i", path.join(outDir, "*.png"),
  "-vf", `scale=360:640,tile=${cols}x${rows}:padding=12:color=0x0B1026`, "-frames:v", "1", sheet], { stdio: "inherit", shell: false });
console.log(`✔ ${path.relative(ROOT, sheet)}`);

// ── styleVersion 2：覆蓋率檢查（docs/layout-rules.md「檢查」；scripts/audit/coverage/cov2.py） ──
// 佔用率 warn <55%、error <40%（鉤子／CTA warn <45%、error <35%）；墨水率 <10% 或 >35% warn；
// 主視覺框寬 <90% 或高 <55% warn、高 <40% error（鉤子／CTA 只看 45%）；最長空白帶 >120 warn、>200 error；背景存在率 <85% warn。
// ── styleVersion 3：同一支量測（cov2.py），門檻另訂、只看佔用率與空白帶（v3 沒有 v2 的主視覺框與背景色帶；紙紋桌面本來就滿版） ──
// 佔用率（安全區內有東西的比例）warn <40%、error <25%；最長空白帶 warn >260px、error >480px。片尾卡不檢查。
if (script.styleVersion === 3) {
  const res = JSON.parse(execFileSync("python3", [path.join(ROOT, "scripts", "audit", "coverage", "cov2.py"), "--json", ...files]).toString());
  const rows = [], errs = [], warns = [];
  res.forEach((r, i) => {
    const s = script.scenes[i], tag = `${String(i + 1).padStart(2, "0")}-${s.id}`;
    rows.push({ id: s.id, frame: frames[i], occ: r.occ, ink: r.ink, longest: r.longest, totalempty: r.totalempty });
    if (s.component === "EndCard") return;
    if (r.occ < 25) errs.push(`${tag}: 佔用率 ${r.occ}% < 25%`); else if (r.occ < 40) warns.push(`${tag}: 佔用率 ${r.occ}% < 40%`);
    if (r.longest > 480) errs.push(`${tag}: 最長空白帶 ${r.longest}px > 480`); else if (r.longest > 260) warns.push(`${tag}: 最長空白帶 ${r.longest}px > 260`);
  });
  const occ = rows.filter((r, i) => script.scenes[i].component !== "EndCard").map((r) => r.occ).sort((a, b) => a - b);
  const summary = { occMin: occ[0], occMedian: occ[Math.floor(occ.length / 2)], longestGapMax: Math.max(...rows.slice(0, -1).map((r) => r.longest)) };
  fs.writeFileSync(path.join(ROOT, "out", slug, "coverage.json"), JSON.stringify({ slug, styleVersion: 3, summary, scenes: rows, errors: errs, warns }, null, 1));
  console.log(`ℹ 覆蓋率（v3 門檻）：佔用率最低 ${summary.occMin}%、中位 ${summary.occMedian}%；最長空白帶 ${summary.longestGapMax}px → out/${slug}/coverage.json`);
  warns.forEach((w) => console.log(`⚠ 覆蓋率 ${w}`));
  errs.forEach((e) => console.log(`✖ 覆蓋率 ${e}`));
  if (errs.length) { console.error(`✖ 覆蓋率檢查 ${errs.length} 個 error`); process.exit(1); }
}
if (script.styleVersion === 2) {
  const res = JSON.parse(execFileSync("python3", [path.join(ROOT, "scripts", "audit", "coverage", "cov2.py"), "--json", ...files]).toString());
  const rows = [], errs = [], warns = [];
  res.forEach((r, i) => {
    const s = script.scenes[i];
    const loose = ["hook", "cta"].includes(s.beat);
    const tag = `${String(i + 1).padStart(2, "0")}-${s.id}`;
    const E = (m) => errs.push(`${tag}: ${m}`), W = (m) => warns.push(`${tag}: ${m}`);
    const [ow, oe] = loose ? [45, 35] : [55, 40];
    if (r.occ < oe) E(`佔用率 ${r.occ}% < ${oe}%`); else if (r.occ < ow) W(`佔用率 ${r.occ}% < ${ow}%`);
    if (r.ink < 10 || r.ink > 35) W(`墨水率 ${r.ink}%（建議 10–35%）`);
    if (r.mv_w < 90) W(`主視覺框寬 ${r.mv_w}% < 90%`);
    const hW = loose ? 45 : 55, hE = loose ? 35 : 40;
    if (r.mv_h < hE) E(`主視覺框高 ${r.mv_h}% < ${hE}%`); else if (r.mv_h < hW) W(`主視覺框高 ${r.mv_h}% < ${hW}%`);
    if (r.longest > 200) E(`最長空白帶 ${r.longest}px > 200`); else if (r.longest > 120) W(`最長空白帶 ${r.longest}px > 120`);
    if (r.bg !== null && r.bg < 85 && s.component !== "EndCard") W(`背景存在率 ${r.bg}% < 85%`);
    rows.push({ id: s.id, component: s.component, beat: s.beat, ...r });
  });
  const occ = rows.map((r) => r.occ).sort((a, b) => a - b);
  const summary = { occMin: occ[0], occMedian: occ[Math.floor(occ.length / 2)], longestGapMax: Math.max(...rows.map((r) => r.longest)) };
  fs.writeFileSync(path.join(ROOT, "out", slug, "coverage.json"), JSON.stringify({ slug, summary, scenes: rows, errors: errs, warns }, null, 1));
  console.log(`ℹ 覆蓋率：佔用率最低 ${summary.occMin}%、中位 ${summary.occMedian}%；最長空白帶 ${summary.longestGapMax}px → out/${slug}/coverage.json`);
  warns.forEach((w) => console.log(`⚠ 覆蓋率 ${w}`));
  errs.forEach((e) => console.log(`✖ 覆蓋率 ${e}`));
  if (errs.length) { console.error(`✖ 覆蓋率檢查 ${errs.length} 個 error`); process.exit(1); }
}

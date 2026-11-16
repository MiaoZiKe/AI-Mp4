// node scripts/dossier/overlap-check.mjs <slug> [--per=2]   → out/<slug>/overlap.json（不重渲成片）
// 哩股哩股 dossier 片的版面重疊／文字溢出檢查：每鏡取 2～3 個「已落定」的時刻，用 Remotion renderStill 渲一張，
// 由 DossierVideo.tsx 的 BoxProbe（輸入屬性 __probe）把帶 data-box 的元素框印出來。
//  ① tag／card／text 與 subtitle（字幕卡）、header（頁首）、source（出處）、ticker（跑馬燈）相交 → error
//  ② 文字／字幕／出處 scrollWidth>clientWidth 或 scrollHeight>clientHeight（溢出或被截）→ error
//  ③ 元素超出 1080×1920 或左右邊 40px（填滿版舞台放大 1.06，內容左緣約 52px，所以不用 64）→ warn；tag 壓到 text／card → warn
// 有 error 非零結束。
import fs from "node:fs";
import path from "node:path";
import { renderStill, selectComposition } from "@remotion/renderer";
import { ROOT, BROWSER, loadScript, makeBundle, chromiumOptions } from "../lib.mjs";
const slug = process.argv[2];
if (!slug) { console.error("用法：node scripts/dossier/overlap-check.mjs <slug> [--per=2]"); process.exit(2); }
const per = Number((process.argv.find((a) => a.startsWith("--per=")) ?? "--per=2").split("=")[1]);
const t0 = Date.now();
await import("../fetch-fonts.mjs");
const script = { ...loadScript(slug), __probe: true };
const tl = script.timeline;
const total = tl.totalFrames;
const sb = JSON.parse(fs.readFileSync(path.join(ROOT, "videos", slug, "storyboard.json"), "utf8")).scenes;
const CUT = 12; // 換鏡擦切約 12 幀，之後才算落定
const samples = [];
sb.forEach((s, i) => {
  const a = s.startFrame, b = (sb[i + 1]?.startFrame ?? total) - 1, isEnd = s.beat === "cta" && false;
  const first = (s.cues ?? []).map((q) => q.frame).filter((f) => f >= a)[0] ?? a;
  const cand = [Math.max(a + CUT, (s.voice?.startFrame ?? first) + 10), Math.round((a + b) / 2), b - 4];
  // cue 落定後：取最後一個 cue 後 12 幀
  const lastCue = (s.cues ?? []).map((q) => q.frame).filter((f) => f <= b).pop();
  if (lastCue !== undefined) cand.splice(1, 0, Math.min(b - 4, lastCue + 12));
  const picks = [...new Set(cand.map((f) => Math.max(a, Math.min(b, f))))].sort((x, y) => x - y);
  const keep = picks.length <= per ? picks : [picks[0], picks[Math.floor(picks.length / 2)], picks[picks.length - 1]].slice(0, per);
  keep.forEach((f) => samples.push({ scene: s.id, frame: f }));
});
const serveUrl = await makeBundle();
const opts = { serveUrl, inputProps: script, browserExecutable: BROWSER, chromiumOptions, logLevel: "error" };
const comp = await selectComposition({ ...opts, id: "Video" });
const SAFE = 40, W = 1080, H = 1920;
const rect = (b) => (["text", "subtitle", "source", "tag"].includes(b.kind) && b.tw > 0 && b.kind === "text" ? { x: b.tx, y: b.ty, w: b.tw, h: b.th } : { x: b.x, y: b.y, w: b.w, h: b.h });
const hit = (a, b) => a.x < b.x + b.w - 1 && b.x < a.x + a.w - 1 && a.y < b.y + b.h - 1 && b.y < a.y + a.h - 1;
const issues = [];
const add = (level, s, msg) => issues.push({ level, scene: s.scene, frame: s.frame, sec: +(s.frame / 30).toFixed(2), msg });
const FIXED = ["subtitle", "header", "source", "ticker"], FLOAT = ["tag", "card", "text"];
let nBox = 0;
for (const s of samples) {
  let got = null;
  await renderStill({ ...opts, composition: comp, frame: s.frame, output: path.join(ROOT, "out", ".overlap-tmp.png"), onBrowserLog: (l) => { if (l.text.startsWith("@@BOXES@@")) got = JSON.parse(l.text.slice(9)); } });
  if (!got) { add("error", s, "沒有取得版面量測（BoxProbe 沒輸出）"); continue; }
  const bx = got.boxes.filter((b) => b.op >= 0.5 && b.w > 0 && b.h > 0 && !(b.kind === "text" && b.tw === 0));
  nBox += bx.length;
  const fixed = bx.filter((b) => FIXED.includes(b.kind)), fl = bx.filter((b) => FLOAT.includes(b.kind));
  for (const a of fl) for (const z of fixed) if (hit(rect(a), rect(z))) add("error", s, `${a.kind}「${a.text}」(y ${Math.round(rect(a).y)}–${Math.round(rect(a).y + rect(a).h)}) 壓到 ${z.kind}「${z.text}」(y ${Math.round(z.y)}–${Math.round(z.y + z.h)})`);
  for (const a of bx.filter((b) => b.kind === "tag")) for (const z of fl.filter((b) => b.kind !== "tag")) if (hit(rect(a), rect(z))) add("warn", s, `tag「${a.text}」壓到 ${z.kind}「${z.text}」`);
  for (const b of bx) {
    // 寬度超出＝溢出；高度只看有裁切的框（大字行高會讓 scrollHeight 多十幾 px，不是溢出）
    if (b.kind !== "ticker" && b.kind !== "card" && b.cw > 0 && (b.sw > b.cw + 2 || (b.ov !== "visible" && b.sh > b.ch + 2))) add("error", s, `${b.kind}「${b.text}」溢出或被截：scroll ${b.sw}×${b.sh} > client ${b.cw}×${b.ch}`);
    const r = rect(b);
    if (r.x < -1 || r.y < -1 || r.x + r.w > W + 1 || r.y + r.h > H + 1) add("warn", s, `${b.kind}「${b.text}」超出畫面 (${Math.round(r.x)},${Math.round(r.y)} ${Math.round(r.w)}×${Math.round(r.h)})`);
    else if (b.kind !== "header" && b.kind !== "ticker" && (r.x < SAFE - 1 || r.x + r.w > W - SAFE + 1)) add("warn", s, `${b.kind}「${b.text}」超出左右邊 ${SAFE}px (x ${Math.round(r.x)}–${Math.round(r.x + r.w)})`);
  }
}
try { fs.rmSync(path.join(ROOT, "out", ".overlap-tmp.png")); } catch {}
const uniq = []; const seen = new Set();
for (const i of issues) { const k = `${i.level}|${i.scene}|${i.msg}`; if (seen.has(k)) { uniq.find((u) => `${u.level}|${u.scene}|${u.msg}` === k).frames.push(i.frame); continue; } seen.add(k); uniq.push({ ...i, frames: [i.frame] }); }
const errors = uniq.filter((i) => i.level === "error").length, warns = uniq.filter((i) => i.level === "warn").length;
const outDir = path.join(ROOT, "out", slug); fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, "overlap.json"), JSON.stringify({ slug, samples: samples.length, boxes: nBox, errors, warns, issues: uniq }, null, 1));
for (const i of uniq) console.log(`  ${i.level === "error" ? "✖" : "⚠"} ${i.scene} 幀 ${i.frames.join("/")}：${i.msg}`);
console.log(`${slug}: ${samples.length} 個取樣、${nBox} 個量測框；error ${errors}、warn ${warns}（${((Date.now() - t0) / 1000).toFixed(0)} 秒）→ out/${slug}/overlap.json`);
process.exit(errors ? 1 : 0);

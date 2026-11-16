// 哩股哩股 dossier 片「一支指令出片」：script.json（或 plan.json）→ 驗證 → 時間軸 → 版面檢查 → 渲染 → 混音 → 網站版 → 拼圖。
// 用法：node scripts/dossier/make.mjs <slug> [--silent] [--from-plan] [--from-audio=<orig.wav>] [--skip-render]
//        [--no-overlap-fail] [--no-edge-fail] [--force-scheduled]
//   --silent          無聲版：silent-timeline.mjs 估時間軸，混音旁白用 none，不做 voice.mp3
//   --from-plan       先用 build-script.mjs 由 plan.json 產 script.json
//   --from-audio=…    旁白已有（orig.wav），voice-take.mjs 帶 --from，不送 TTS；沒帶就送 TTS（花 1 次請求）
//   --skip-render     略過渲染與其後的混音／網站版／拼圖（測試用）
//   --no-overlap-fail overlap-check 有 error 只警告不停；--no-edge-fail 同理，edge-check 有 error 只警告
//   --force-scheduled 允許動已排程要發的片（liguligu-nvda-kress、liguligu-power-bill），預設拒絕
// 任何一步失敗就停下、exit 1，並把停在哪一步與錯誤訊息寫進 out/<slug>/make.json（派子 agent 接手時先讀它）。
// 旁白用哪條 wav：有聲版以 videos/<slug>/timeline.json 的 recording.file（public/ 底下，voice-take.mjs 產的 voice-api.paused.wav，
// 已補停頓）為準——時間軸就是照它對的，混音也用同一條；--silent 用 none。
// 子程序環境：NODE_USE_ENV_PROXY=1、NODE_EXTRA_CA_CERTS=/root/.ccr/ca-bundle.crt 由本程式替子程序設好。
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "../..");
const args = process.argv.slice(2);
const slug = args.find((a) => !a.startsWith("--"));
const flag = (k) => args.includes(`--${k}`);
const opt = (k) => args.find((a) => a.startsWith(`--${k}=`))?.slice(k.length + 3);
if (!slug) { console.error("用法：node scripts/dossier/make.mjs <slug> [--silent] [--from-plan] [--from-audio=<orig.wav>] [--skip-render] [--no-overlap-fail] [--no-edge-fail]"); process.exit(2); }

const SCHEDULED = ["liguligu-nvda-kress", "liguligu-power-bill"];
if (SCHEDULED.includes(slug) && !flag("force-scheduled")) {
  console.error(`✖ ${slug} 已排程要發，不准動（要動請加 --force-scheduled）`); process.exit(1);
}

const SILENT = flag("silent"), SKIP_RENDER = flag("skip-render");
const outDir = path.join(ROOT, "out", slug), webDir = path.join(ROOT, "out", "web", slug);
const vdir = path.join(ROOT, "videos", slug);
fs.mkdirSync(outDir, { recursive: true });
const makeJson = path.join(outDir, "make.json");
const rel = (p) => path.relative(ROOT, p);
const env = { ...process.env, NODE_USE_ENV_PROXY: "1", NODE_EXTRA_CA_CERTS: process.env.NODE_EXTRA_CA_CERTS ?? "/root/.ccr/ca-bundle.crt" };

const rec = { slug, startedAt: new Date().toISOString(), flags: args.filter((a) => a.startsWith("--")), steps: [], status: "running" };
const save = () => fs.writeFileSync(makeJson, JSON.stringify(rec, null, 2));
const T0 = Date.now();
const fail = (name, msg) => {
  rec.status = "failed"; rec.failedStep = name; rec.error = String(msg).slice(-1500); rec.totalSec = +((Date.now() - T0) / 1000).toFixed(1); save();
  console.error(`\n✖ 停在「${name}」：${String(msg).slice(-600)}\n  紀錄：${rel(makeJson)}`); process.exit(1);
};

/** 跑子程序；stdout/stderr 印末段，回傳 { code, out } */
const run = (cmd, argv, extra = {}) => {
  const r = spawnSync(cmd, argv, { cwd: ROOT, env: { ...env, ...(extra.env ?? {}) }, encoding: "utf8", maxBuffer: 1 << 28 });
  return { code: r.status ?? 1, out: (r.stdout ?? "") + (r.stderr ?? "") };
};
const NOISE = /UNDICI|trace-warnings|^\[chrome\]|^\s*$/;
const tail = (s, n = 6) => s.split("\n").filter((l) => !NOISE.test(l)).slice(-n).join("\n");

/** 一個步驟：fn 回傳 { ok, note?, data?, warn? }，或丟例外 */
const step = (name, fn) => {
  const t = Date.now(); let res;
  try { res = fn(); } catch (e) { res = { ok: false, note: e.message }; }
  const sec = +((Date.now() - t) / 1000).toFixed(1);
  const row = { name, sec, ok: !!res.ok, note: res.note ?? "", ...(res.data ?? {}) };
  rec.steps.push(row); save();
  console.log(`${res.ok ? "✔" : "✖"} ${name}（${sec} 秒）${res.note ? " — " + String(res.note).split("\n")[0].slice(0, 160) : ""}`);
  if (res.warn) console.log("  ⚠ " + res.warn);
  if (!res.ok) fail(name, res.note ?? "失敗");
  return res;
};

const ffprobeDur = (f) => Number(run("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", f]).out.trim());

// ── 0. plan → script ──
if (flag("from-plan")) {
  step("0 build-script（plan.json → script.json）", () => {
    if (!fs.existsSync(path.join(vdir, "plan.json"))) return { ok: false, note: `找不到 ${rel(path.join(vdir, "plan.json"))}` };
    const r = run("node", ["scripts/dossier/build-script.mjs", slug]);
    return { ok: r.code === 0, note: tail(r.out, 3) };
  });
}
if (!fs.existsSync(path.join(vdir, "script.json"))) fail("0 前置檢查", `找不到 ${rel(path.join(vdir, "script.json"))}（沒有 script.json 就加 --from-plan）`);

// 動手前備份可能被覆蓋的成片
const mp4 = path.join(ROOT, "out", `${slug}.mp4`), prev = path.join(ROOT, "out", `${slug}.prev.mp4`);

// ── 1. validate ＋ 字型 ──
step("1a validate", () => {
  const r = run("npm", ["run", "--silent", "validate", slug]);
  return { ok: r.code === 0, note: r.code === 0 ? (tail(r.out, 1)) : tail(r.out, 12) };
});
step("1b 字型子集", () => {
  const r = run("node", ["scripts/dossier/fetch-fonts.mjs", slug]);
  return { ok: r.code === 0, note: tail(r.out, 1) };
});

// ── 2. 時間軸 ──
if (SILENT) {
  step("2 時間軸（silent-timeline）", () => {
    const r = run("node", ["scripts/ui/silent-timeline.mjs", slug, "--force"], { env: { SILENT_RATE: "4.9", SILENT_GAP: "0.7", ALIGN_TAIL_END_F: "14" } });
    return { ok: r.code === 0, note: tail(r.out, 2) };
  });
} else {
  step("2 時間軸（voice-take）", () => {
    const from = opt("from-audio");
    const a = ["scripts/dossier/voice-take.mjs", slug]; if (from) a.push(`--from=${from}`);
    const r = run("node", a);
    return { ok: r.code === 0, note: r.code === 0 ? tail(r.out, 1) : tail(r.out, 12), data: { tts: from ? "from-audio（未送請求）" : "API" } };
  });
}

// 時間軸／分鏡讀回（後面步驟要用）
const readJson = (p) => JSON.parse(fs.readFileSync(p, "utf8"));
let tl, sb;
step("2b 讀時間軸與分鏡", () => {
  tl = readJson(path.join(vdir, "timeline.json"));
  // overlap-check／render 會重寫 storyboard；這裡先確認 timeline 存在
  return { ok: true, note: `${tl.totalFrames} 幀（${tl.totalSec} 秒）` };
});

// ── 3. overlap-check ──
step("3a overlap-check", () => {
  const r = run("node", ["scripts/dossier/overlap-check.mjs", slug]);
  let sum = {};
  try { const j = readJson(path.join(outDir, "overlap.json")); sum = { errors: j.errors, warns: j.warns, samples: j.samples }; } catch { /* 沒有 json 就看輸出 */ }
  rec.overlap = { exit: r.code, ...sum, tail: tail(r.out, 8) }; save();
  if (r.code !== 0 && flag("no-overlap-fail")) return { ok: true, note: `有 error，但 --no-overlap-fail 只警告`, warn: tail(r.out, 8) };
  return { ok: r.code === 0, note: r.code === 0 ? tail(r.out, 1) : tail(r.out, 10) };
});

// ── 4. render（無聲畫面）──
let silentMp4 = path.join(outDir, "silent.mp4");
if (SKIP_RENDER) {
  console.log("－ 略過 render／edge-check／混音／網站版／拼圖（--skip-render）");
  rec.status = "ok-skip-render"; rec.totalSec = +((Date.now() - T0) / 1000).toFixed(1); save();
  console.log(`\n完成（略過渲染），總耗時 ${rec.totalSec} 秒。紀錄：${rel(makeJson)}`); process.exit(0);
}
if (fs.existsSync(mp4)) { fs.copyFileSync(mp4, prev); console.log(`  已備份舊成片 → ${rel(prev)}`); }
step("4 render", () => {
  const r = run("npm", ["run", "--silent", "render", slug]);
  if (r.code !== 0) return { ok: false, note: tail(r.out, 12) };
  fs.copyFileSync(mp4, silentMp4);
  return { ok: true, note: tail(r.out, 1) };
});

// ── 3b. edge-check（量成片上下留白，要有 mp4 才能量，所以放在 render 之後；此時 out/<slug>.mp4 還是無聲渲染檔）──
step("3b edge-check", () => {
  const r = run("python3", ["scripts/dossier/edge-check.py", slug]);
  rec.edge = { exit: r.code, tail: tail(r.out, 6) }; save();
  if (r.code !== 0 && flag("no-edge-fail")) return { ok: true, note: "有 error，但 --no-edge-fail 只警告", warn: tail(r.out, 6) };
  return { ok: r.code === 0, note: r.code === 0 ? tail(r.out, 1) : tail(r.out, 8) };
});

// ── 5. 招牌音 ＋ 混音 ──
sb = readJson(path.join(vdir, "storyboard.json"));
const endScene = sb.scenes[sb.scenes.length - 1];
const endAt = endScene.startSec ?? endScene.startFrame / sb.fps, totalSec = sb.totalSec;
let voiceWav = "none";
if (!SILENT) {
  const f = tl.recording?.file;
  if (!f) fail("5 混音", "timeline.json 沒有 recording.file（有聲版要先跑 voice-take／recording-timeline）");
  voiceWav = path.join(ROOT, "public", f);
}
const sting = path.join(outDir, "sting.wav");
step("5a 招牌音", () => {
  const r = run("python3", ["scripts/dossier/sfx-logo-ligu.py", sting]);
  return { ok: r.code === 0 && fs.existsSync(sting), note: tail(r.out, 1) };
});
let mixInfo = {};
step("5b mix-auto → out/<slug>.mp4", () => {
  const r = run("bash", ["scripts/dossier/mix-auto.sh", voiceWav, sting, String(endAt), String(totalSec), silentMp4, mp4]);
  const m = /最終 G \/ LUFS \/ 真峰值\(dBTP\)：([\d.]+) ([-\d.]+) ([-\d.]+)/.exec(r.out);
  if (r.code !== 0 || !m) return { ok: false, note: tail(r.out, 8) };
  mixInfo = { gain: Number(m[1]), endLufs: Number(m[2]), endTruePeak: Number(m[3]) };
  return { ok: true, note: `片尾 ${m[2]} LUFS／真峰值 ${m[3]} dBTP`, data: mixInfo };
});
const finalDur = ffprobeDur(mp4);

// ── 6. 網站版 ──
fs.mkdirSync(webDir, { recursive: true });
const webMp4 = path.join(webDir, "video.mp4");
let webInfo = {};
step("6a 網站版 video.mp4（≤20MiB）", () => {
  const LIM = 20 * 1024 * 1024; let crf = 23, size = 0;
  for (; crf <= 35; crf += 3) {
    const r = run("ffmpeg", ["-loglevel", "error", "-y", "-i", mp4, "-c:v", "libx264", "-preset", "medium", "-crf", String(crf), "-pix_fmt", "yuv420p", "-profile:v", "high", "-c:a", "aac", "-b:a", "128k", "-movflags", "+faststart", webMp4]);
    if (r.code !== 0) return { ok: false, note: tail(r.out, 5) };
    size = fs.statSync(webMp4).size;
    if (size <= LIM) break;
  }
  if (size > LIM) return { ok: false, note: `CRF ${crf} 仍 ${(size / 1048576).toFixed(1)} MiB` };
  webInfo = { crf, mp4Bytes: size };
  return { ok: true, note: `CRF ${crf}，${(size / 1048576).toFixed(2)} MiB`, data: webInfo };
});
step("6b cover.jpg（第 0 幀）", () => {
  const r = run("ffmpeg", ["-loglevel", "error", "-y", "-i", mp4, "-frames:v", "1", "-q:v", "2", path.join(webDir, "cover.jpg")]);
  return { ok: r.code === 0, note: "" };
});
if (!SILENT) {
  step("6c voice.mp3（只有旁白）", () => {
    const r = run("ffmpeg", ["-loglevel", "error", "-y", "-i", voiceWav, "-af", "loudnorm=I=-16:TP=-1.5:LRA=11", "-ar", "44100", "-ac", "1", "-c:a", "libmp3lame", "-b:a", "128k", path.join(webDir, "voice.mp3")]);
    return { ok: r.code === 0, note: "" };
  });
}

// ── 7. 抽格拼圖 ──
step("7 sheet.jpg（每 3 秒一格、寬 270）", () => {
  const n = Math.ceil(finalDur / 3), cols = 6, rows = Math.ceil(n / cols);
  const r = run("ffmpeg", ["-loglevel", "error", "-y", "-i", mp4, "-vf", `fps=1/3,scale=270:-1,tile=${cols}x${rows}`, "-frames:v", "1", "-q:v", "3", path.join(outDir, "sheet.jpg")]);
  return { ok: r.code === 0, note: `${n} 格` };
});

// ── 8. make.json ──
rec.status = "ok"; rec.totalSec = +((Date.now() - T0) / 1000).toFixed(1);
rec.result = {
  durationSec: +finalDur.toFixed(2), endCardStartSec: +endAt.toFixed(2), ...mixInfo,
  overlap: rec.overlap?.exit === 0 ? "pass" : "error（--no-overlap-fail 放行）",
  web: { dir: rel(webDir), ...webInfo, files: fs.readdirSync(webDir) },
  outputs: [rel(mp4), rel(prev), rel(path.join(outDir, "sheet.jpg"))].filter((p) => fs.existsSync(path.join(ROOT, p))),
};
save();
console.log(`\n完成：${rec.result.durationSec} 秒；片尾 ${mixInfo.endLufs} LUFS／${mixInfo.endTruePeak} dBTP；網站版 ${(webInfo.mp4Bytes / 1048576).toFixed(2)} MiB；總耗時 ${rec.totalSec} 秒\n紀錄：${rel(makeJson)}`);

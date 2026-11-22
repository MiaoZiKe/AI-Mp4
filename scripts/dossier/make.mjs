// 哩股哩股 dossier 片「一支指令出片」：script.json（或 plan.json）→ 驗證 → 時間軸 → 版面檢查 → 渲染 → 混音 → 網站版 → 拼圖。
// 用法：node scripts/dossier/make.mjs <slug> [--silent] [--from-plan] [--from-audio=<orig.wav>] [--skip-render]
//        [--no-overlap-fail] [--no-edge-fail] [--force-scheduled] [--force-silent]
//   --silent          無聲版：silent-timeline.mjs 估時間軸，混音旁白用 none，不做 voice.mp3
//   --from-plan       先用 build-script.mjs 由 plan.json 產 script.json
//   --from-audio=…    旁白已有（orig.wav），voice-take.mjs 帶 --from，不送 TTS；沒帶就送 TTS（花 1 次請求）
//   --keep-timeline   沿用手動調好的 timeline.json 與 paused 錄音（insert-pauses --scene-map／cutDelayF 調過的），略過 voice-take
//   --skip-render     略過渲染與其後的混音／網站版／拼圖（測試用）
//   --no-overlap-fail overlap-check 有 error 只警告不停；--no-edge-fail 同理，edge-check 有 error 只警告
//   --no-audio-fail   網站版音軌的 audio-check 有 error 只警告；預設擋下
//   --no-gate-fail    交件四關（audio-check／pause-density／listen-check／frame-check，2026/11/22）有不過只警告，僅供除錯；預設任何一關不過就停
//   --stage voice|visual  （2026/11/22「聲音先定、畫面後排」，有聲版預設兩段串起來，聲音關不過就停）
//        voice：念稿檢查 → TTS 1 次 → 只裁前後切說明句 → 片頭 0.3 秒淡入 → 強制對齊寫 timeline 字時間 → audio-check／pause-density／listen-check
//               → out/<slug>/voice-gate.json（含音檔 sha256、語速、停頓量測）；不 render；絕不插停頓、不拉伸
//        visual：不碰音檔：讀定案音檔與字時間 → 排畫面（重算 timeline）→ render → mix → 四關＋0.5 秒抽格；音檔 hash 與 voice-gate.json 不同就拒絕
//        --legacy-voice  走舊流程（單階段、voice-take 照舊）；--keep-timeline／--silent 也維持舊的單階段
//   --force-scheduled 允許動已排程要發的片（liguligu-nvda-kress、liguligu-power-bill），預設拒絕
// 全新 slug 會自動處理：plan/script 預檢（cue 詞要在字幕裡、hook 字數上限、缺 pronunciation.md 自動建骨架）、字型缺字自動補抓、
// 時間軸後自動寫 storyboard.json、事件間隔 >1.2 秒列 warn（不擋）。--silent 重生無聲時間軸；若已有真配音時間軸會拒絕（要蓋掉加 --force-silent）。
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
const STAGE = opt("stage");
if (STAGE && !["voice", "visual"].includes(STAGE)) { console.error("✖ --stage 只能是 voice 或 visual"); process.exit(2); }
if (!STAGE && !SILENT && !flag("keep-timeline") && !flag("legacy-voice") && !flag("skip-render")) {
  // 預設＝兩段串起來：先聲音，關不過就停；過了才排畫面
  const self = process.argv[1];
  const common = args.filter((a) => !a.startsWith("--stage"));
  const r1 = spawnSync(process.execPath, [self, ...common, "--stage=voice"], { stdio: "inherit" });
  if ((r1.status ?? 1) !== 0) { console.error("\n✖ 聲音階段沒過，不排畫面。修聲音（換提示或砍字重配）後再跑。"); process.exit(r1.status ?? 1); }
  const r2 = spawnSync(process.execPath, [self, ...common.filter((a) => !a.startsWith("--from-audio")), "--stage=visual"], { stdio: "inherit" });
  process.exit(r2.status ?? 1);
}
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

const readJson = (p) => JSON.parse(fs.readFileSync(p, "utf8"));
const ffprobeDur = (f) => Number(run("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", f]).out.trim());

// 交件關卡小工具（voice 階段與交件四關共用）
const gateRows = [];
const gate = (name, fn) => {
  const t = Date.now(); let r;
  try { r = fn(); } catch (e) { r = { code: 1, out: e.message }; }
  const row = { gate: name, exit: r.code, pass: r.code === 0, tail: tail(r.out, 8), sec: +((Date.now() - t) / 1000).toFixed(1) };
  if (r.code === 2) row.note = "未完成（視為不通過）";
  gateRows.push(row); console.log(`${row.pass ? "✔" : "✖"} 關卡 ${name}（${row.sec} 秒）${row.pass ? "" : " — " + tail(r.out, 3).split("\n").join(" ｜ ").slice(0, 300)}`);
};

// ── 0. plan → script ──
if (flag("from-plan")) {
  step("0 build-script（plan.json → script.json）", () => {
    if (!fs.existsSync(path.join(vdir, "plan.json"))) return { ok: false, note: `找不到 ${rel(path.join(vdir, "plan.json"))}` };
    const r = run("node", ["scripts/dossier/build-script.mjs", slug]);
    return { ok: r.code === 0, note: tail(r.out, 3) };
  });
}
if (!fs.existsSync(path.join(vdir, "script.json"))) fail("0 前置檢查", `找不到 ${rel(path.join(vdir, "script.json"))}（沒有 script.json 就加 --from-plan）`);

const sha = (f) => { const r = run("sha256sum", [f]); return r.out.split(/\s+/)[0]; };
const spokenCount = () => { const sc = readJson(path.join(vdir, "script.json")); let n = 0; for (const x of sc.scenes) { if (x.silent || x.component === "EndCard") break; n++; } return n; };
const gatePath = path.join(outDir, "voice-gate.json");

// ── 聲音階段（--stage voice）：只做聲音，不 render ──
if (STAGE === "voice") {
  step("V1 配音（念稿檢查→TTS 1 次→只裁前後→0.3 秒淡入→強制對齊）", () => {
    const from = opt("from-audio");
    const a = ["scripts/dossier/voice-take.mjs", slug]; if (from) a.push(`--from=${from}`);
    const r = run("node", a);
    return { ok: r.code === 0, note: r.code === 0 ? tail(r.out, 1) : tail(r.out, 12), data: { tts: from ? "from-audio（未送請求）" : "API" } };
  });
  const tlv = readJson(path.join(vdir, "timeline.json"));
  const wavRel = path.join("public", tlv.recording.file), wavAbs = path.join(ROOT, wavRel);
  gate("1 audio-check（旁白 wav）", () => run("python3", ["scripts/dossier/audio-check.py", slug, "--file", wavRel, "--end", "9999", "--json", rel(path.join(outDir, "audio-check.json"))]));
  gate("2 pause-density", () => run("python3", ["scripts/dossier/pause-density.py", slug, "--file", wavRel]));
  gate("3 listen-check（Gemini 聽感，備援模型清單）", () => run("node", ["scripts/dossier/listen-check.mjs", slug, "--file", wavRel]));
  let pd = {}, lc = {};
  try { pd = readJson(path.join(outDir, "pause-density.json")); } catch { /* 沒有就留空 */ }
  try { lc = readJson(path.join(outDir, "listen-check.json")); } catch { /* 同上 */ }
  const ps = pd.pauses ?? [], span = (pd.lastSec ?? 0) - (pd.firstSec ?? 0), pauseSum = ps.reduce((t, q) => t + q.dur, 0);
  const sentP = ps.filter((q) => q.kind === "sentence_end").map((q) => q.dur);
  const pureRate = span > 0 ? +((pd.chars ?? 0) / (span - pauseSum)).toFixed(2) : null, withPause = span > 0 ? +((pd.chars ?? 0) / span).toFixed(2) : null;
  const counted = ps.filter((q) => !(q.kind === "comma" && q.dur <= 0.45)).length;
  const rateOk = pureRate !== null && pureRate <= 5.0;
  const gates = Object.fromEntries(gateRows.map((g) => [g.gate, g.pass ? "pass" : "FAIL"]));
  const pass = gateRows.every((g) => g.pass) && rateOk;
  const sc0 = readJson(path.join(vdir, "script.json"));
  const gj = {
    slug, at: new Date().toISOString(), wav: wavRel, sha256: sha(wavAbs), model: sc0.voice?.model, voiceName: sc0.voice?.voiceName,
    wavSec: +ffprobeDur(wavAbs).toFixed(2), firstOnsetSec: pd.firstSec, lastCharSec: pd.lastSec, chars: pd.chars,
    pureRate, rateWithPauses: withPause, rateLimit: 5.0, rateOk,
    pauses025: { total: ps.length, counted, notCountedComma: ps.length - counted, sentenceEndRange: sentP.length ? [Math.min(...sentP), Math.max(...sentP)] : null, list: ps },
    listen: { model: lc.model, status: lc.status, cer: lc.cer, issues: (lc.issues ?? []).length },
    gates, pass,
    verdict: pass ? "聲音定案：畫面依這條音檔的字時間排，之後不再改聲音" : (rateOk ? "有關卡沒過：看 out/<slug>/ 的 audio-check／pause-density／listen-check .json" : `純念稿語速 ${pureRate} > 5.0：砍字重配，不拉伸`),
  };
  fs.writeFileSync(gatePath, JSON.stringify(gj, null, 2));
  rec.voiceGate = { pass, pureRate, withPause, gates }; rec.status = pass ? "ok-voice" : "voice-gate-failed"; rec.totalSec = +((Date.now() - T0) / 1000).toFixed(1); save();
  console.log(`\n聲音階段：${pass ? "✔ 通過" : "✖ 未通過"}｜純念稿 ${pureRate} 音節/秒、含停頓 ${withPause}｜≥0.25 秒停頓 ${ps.length} 處（計入 ${counted}）｜聽感 ${lc.status ?? "?"}（${lc.model ?? "-"}，CER ${lc.cer !== undefined ? (lc.cer * 100).toFixed(2) + "%" : "?"}）\n紀錄：${rel(gatePath)}`);
  process.exit(pass ? 0 : 1);
}

// ── 畫面階段（--stage visual）：音檔不准動 ──
const guardVoice = (when) => {
  if (!fs.existsSync(gatePath)) fail(when, `找不到 ${rel(gatePath)}：先跑 --stage voice 並通過`);
  const g = readJson(gatePath), tlg = readJson(path.join(vdir, "timeline.json"));
  if (!g.pass) fail(when, "voice-gate.json 記錄聲音階段沒過，不排畫面");
  const cur = sha(path.join(ROOT, "public", tlg.recording.file));
  if (path.join("public", tlg.recording.file) !== g.wav || cur !== g.sha256) fail(when, `旁白音檔和 voice-gate.json 記的不同（${g.wav} ${String(g.sha256).slice(0, 10)} ≠ ${tlg.recording.file} ${cur.slice(0, 10)}）：畫面階段不准改聲音；要改聲音就重跑 --stage voice，畫面整個依新時間戳重排`);
  return g;
};
if (STAGE === "visual") step("V0 音檔 hash 與 voice-gate.json 一致", () => { const g = guardVoice("V0 音檔鎖定"); return { ok: true, note: `${g.wav} ${g.sha256.slice(0, 10)}…（純念稿 ${g.pureRate}）` }; });

// 動手前備份可能被覆蓋的成片
const mp4 = path.join(ROOT, "out", `${slug}.mp4`), prev = path.join(ROOT, "out", `${slug}.prev.mp4`);

// ── 0b. plan/script 預檢（在 validate 前，錯誤訊息直接說哪一幕、哪個欄位、怎麼改）──
const clean = (t) => String(t ?? "").replace(/[\s，。、？！：；「」『』（）()・｜|—–\-,.!?:;"'“”‘’…]/g, "");
step("0b 預檢（cue／hook 字數／pronunciation）", () => {
  const sc = readJson(path.join(vdir, "script.json"));
  const errs = [], notes = [];
  for (const [i, s] of (sc.scenes ?? []).entries()) {
    const zh = clean(s.subtitle?.zh);
    for (const q of s.cues ?? []) {
      const t = clean(q.text);
      let pos = -1; for (let k = 0; k < (q.occurrence ?? 1); k++) pos = zh.indexOf(t, pos + 1);
      if (!t || pos < 0) errs.push(`第 ${i + 1} 幕 ${s.id} 的 cue「${q.text}」不在 subtitle.zh 裡：cue 詞要逐字出現在字幕（標點與換行不算），到 plan.json 該幕的 cues 改成字幕裡真的有的詞，或改字幕`);
    }
  }
  const h = sc.scenes?.[0]?.props;
  if (h?.panel === "hook") {
    const chk = (field, v, max, why) => { const n = [...clean(v)].length; if (n > max) errs.push(`hook（第 1 幕）${field}「${v}」${n} 字，超過上限約 ${max} 字（${why}）：縮短 plan.json 第 1 幕 fields.${field}`); };
    chk("line2", h.line2, 7, "132px 襯線單行，寬 952px 放不下");
    chk("kicker", h.kicker, 22, "36px 加字距單行");
    chk("num", h.num, 4, "216px 大數字");
    if (h.mark && h.line2 && !String(h.line2).includes(h.mark)) errs.push(`hook 的 mark「${h.mark}」不在 line2「${h.line2}」裡：標記詞要是大字那行的一部分，改 fields.mark 或 fields.line2`);
  }
  const pron = path.join(vdir, "pronunciation.md");
  if (!fs.existsSync(pron)) {
    fs.writeFileSync(pron, `# pronunciation.md — ${slug}\n\n## 念法白名單\n\n- \`AI\`：念稿用「AI」，句中使用，不拆成 A I，句首不放。\n- \`GDP\`：確認 TTS 念得對再留；不確定就在念稿寫成中文。\n- \`ETF\`：同上。\n- \`CPI\`：同上。\n- 數字全部寫唸法（二零二六年、七成八、二十五倍）。\n`);
    notes.push("已建 pronunciation.md 骨架");
  }
  return { ok: !errs.length, note: errs.length ? errs.join("\n") : `cue 與 hook 字數 OK${notes.length ? "；" + notes.join("；") : ""}` };
});

// ── 0c. 字型子集（缺字就重抓，不等 render 才發現）──
step("0c 字型子集", () => {
  const c = run("node", ["scripts/dossier/fetch-fonts.mjs", slug, "--check"]);
  if (c.code === 0) return { ok: true, note: tail(c.out, 1) };
  const r = run("node", ["scripts/dossier/fetch-fonts.mjs", slug]);
  return { ok: r.code === 0, note: r.code === 0 ? `${tail(c.out, 1)} → 已重抓` : tail(r.out, 6) };
});

// ── 0d. 照片（原圖在 out/<slug>/assets-raw/photos/ 就自動做成黑白版；沒有原圖就略過，validate 會指出缺哪張）──
step("0d 照片 make-photos", () => {
  if (!fs.existsSync(path.join(outDir, "assets-raw", "photos"))) return { ok: true, note: "沒有 out/<slug>/assets-raw/photos/，略過（片裡有照片的話要先放原圖）" };
  const r = run("python3", ["scripts/dossier/make-photos.py", slug]);
  return { ok: r.code === 0, note: tail(r.out, 1) };
});

// ── 1. validate ──
step("1a validate", () => {
  const r = run("npm", ["run", "--silent", "validate", slug]);
  return { ok: r.code === 0, note: r.code === 0 ? (tail(r.out, 1)) : tail(r.out, 12) };
});

// ── 2. 時間軸 ──
if (SILENT) {
  step("2 時間軸（silent-timeline）", () => {
    const tp = path.join(vdir, "timeline.json");
    if (fs.existsSync(tp) && !readJson(tp).estimated && !flag("force-silent")) return { ok: false, note: `${rel(tp)} 是真配音時間軸，--silent 會把它蓋掉；確定要蓋加 --force-silent` };
    const r = run("node", ["scripts/ui/silent-timeline.mjs", slug, "--force"], { env: { SILENT_RATE: "4.9", SILENT_GAP: "0.7", ALIGN_TAIL_END_F: "14" } });
    return { ok: r.code === 0, note: tail(r.out, 2) };
  });
} else if (STAGE === "visual") {
  step("2 時間軸（recording-timeline：依定案音檔的字時間重算，不碰音檔）", () => {
    const g = readJson(gatePath);
    const r = run("node", ["scripts/dossier/recording-timeline.mjs", slug, g.wav.replace(/^public\//, ""), String(spokenCount())]);
    return { ok: r.code === 0, note: tail(r.out, 1), data: { tts: "不送（聲音階段已定案）" } };
  });
} else if (flag("keep-timeline")) {
  step("2 時間軸（沿用現有 timeline.json／paused 錄音，--keep-timeline）", () => ({ ok: fs.existsSync(path.join(vdir, "timeline.json")), note: "不送 TTS、不重插停頓" }));
} else {
  step("2 時間軸（voice-take）", () => {
    const from = opt("from-audio");
    const a = ["scripts/dossier/voice-take.mjs", slug]; if (from) a.push(`--from=${from}`); if (flag("legacy-voice")) a.push("--legacy-pauses");
    const r = run("node", a);
    return { ok: r.code === 0, note: r.code === 0 ? tail(r.out, 1) : tail(r.out, 12), data: { tts: from ? "from-audio（未送請求）" : "API" } };
  });
}

// 時間軸／分鏡讀回（後面步驟要用）
let tl, sb;
step("2b 讀時間軸與分鏡", () => {
  tl = readJson(path.join(vdir, "timeline.json"));
  // overlap-check／render 會重寫 storyboard；這裡先確認 timeline 存在
  return { ok: true, note: `${tl.totalFrames} 幀（${tl.totalSec} 秒）` };
});

step("2c 分鏡表 storyboard.json（全新 slug 才有）", () => {
  const r = run("node", ["scripts/subs.mjs", slug]);
  return { ok: r.code === 0 && fs.existsSync(path.join(vdir, "storyboard.json")), note: tail(r.out, 1) };
});
step("2d 事件間隔（>1.2 秒列 warn，不擋）", () => {
  const r = run("node", ["scripts/dossier/events.mjs", slug]);
  const bad = [...r.out.matchAll(/^(\S+)\s+\d+–\d+.*最大間隔 ([\d.]+) 秒/gm)].filter((m) => m[1] !== "end" && Number(m[2]) > 1.2).map((m) => `${m[1]} ${m[2]} 秒`);
  rec.eventGaps = bad; save();
  return { ok: r.code === 0, note: bad.length ? `${bad.length} 鏡最大間隔 >1.2 秒` : "每鏡最大間隔都 ≤1.2 秒", warn: bad.length ? `靜止偏久：${bad.join("、")}（到 plan.json 該幕加一個 at 事件）` : undefined };
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
if (STAGE === "visual") step("5-pre 混音前再驗音檔 hash", () => { guardVoice("5-pre 音檔鎖定"); return { ok: true, note: "未變" }; });
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
// ── 5c. 音訊不斷續檢查（docs/channels/audio-continuity-rule.md）──
const audioCheck = (name, file, jsonName) => step(name, () => {
  const r = run("python3", ["scripts/dossier/audio-check.py", slug, "--file", rel(file), "--end", String(endAt), "--json", rel(path.join(outDir, jsonName))]);
  rec[jsonName.replace(".json", "")] = { exit: r.code, tail: tail(r.out, 4) }; save();
  if (r.code !== 0 && flag("no-audio-fail")) return { ok: true, note: "有 error，但 --no-audio-fail 只警告", warn: tail(r.out, 6) };
  return { ok: r.code === 0, note: r.code === 0 ? tail(r.out, 1) : tail(r.out, 8) + "\n→ 找出是哪一步產生的（insert-pauses 的切點、TTS 回應的 C2PA 區塊、混音），修好重混；規則見 docs/channels/audio-continuity-rule.md" };
});
// ── 5c. 交件四關（2026/11/22）：audio-check → pause-density → listen-check（Gemini 聽感）→ frame-check（1 秒抽格）；
//    四關全跑完再一起報，任何一關不過就停（exit 1），寫進 make.json 的 gates。--no-gate-fail 只供除錯（照樣記錄但不停）。
const eStr = String(endAt);
gate("1 audio-check", () => run("python3", ["scripts/dossier/audio-check.py", slug, "--file", rel(mp4), "--end", eStr, "--json", rel(path.join(outDir, "audio-check.json"))]));
if (!SILENT) {
  gate("2 pause-density", () => run("python3", ["scripts/dossier/pause-density.py", slug, "--file", rel(mp4)]));
  gate("3 listen-check（Gemini 聽感）", () => run("node", ["scripts/dossier/listen-check.mjs", slug, "--file", rel(mp4)]));
} else console.log("－ 無聲版：略過 pause-density／listen-check");
gate(STAGE === "visual" ? "4 frame-check（0.5 秒抽格）" : "4 frame-check（1 秒抽格）", () => run("python3", ["scripts/dossier/frame-check.py", slug, "--file", rel(mp4), ...(STAGE === "visual" ? ["--step", "0.5"] : [])]));
rec.gates = gateRows; save();
const gateBad = gateRows.filter((g) => !g.pass);
if (gateBad.length && !flag("no-gate-fail")) {
  fail("5c 交件四關", gateBad.map((g) => `【${g.gate}】${g.note ?? ""}\n${g.tail}`).join("\n---\n") + "\n→ 細節：out/<slug>/{audio-check,pause-density,listen-check,frame-check}.json；frames-1s.jpg 給審查看。規則：docs/channels/liguligu-daily-playbook.md「交件四關」");
}
if (gateBad.length) console.log(`  ⚠ --no-gate-fail：${gateBad.length} 關未過仍繼續（僅供除錯，不可交件）`);
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
audioCheck("6a2 audio-check（網站版音軌）", webMp4, "audio-check-web.json");
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
  gates: Object.fromEntries((rec.gates ?? []).map((g) => [g.gate, g.pass ? "pass" : "FAIL"])),
  review: "frames-0.5s.jpg（新流程）或 frames-1s.jpg 要給非製作者審查（opus high ≥7）才交件",
  web: { dir: rel(webDir), ...webInfo, files: fs.readdirSync(webDir) },
  outputs: [rel(mp4), rel(prev), rel(path.join(outDir, "sheet.jpg"))].filter((p) => fs.existsSync(path.join(ROOT, p))),
};
save();
console.log(`\n完成：${rec.result.durationSec} 秒；片尾 ${mixInfo.endLufs} LUFS／${mixInfo.endTruePeak} dBTP；網站版 ${(webInfo.mp4Bytes / 1048576).toFixed(2)} MiB；總耗時 ${rec.totalSec} 秒\n紀錄：${rel(makeJson)}`);

// Gemini TTS 配音
//   npm run tts <slug>                 → public/audio/<slug>/NN-<id>.wav + videos/<slug>/tts-manifest.json（文字沒變就沿用）
//   npm run voices <slug>              → 用第 1 幕試聽所有候選音色 → out/<slug>/voice-samples/
//   npm run tts <slug> -- --force      → 全部重做；--only=id1,id2 只重做指定幕；--resplit 用留存的原始批次音檔重切（不花請求）
//   npm run tts -- --list-models       → 列出可用的 TTS 模型（順便測金鑰）
// 回讀校驗＋自動重生（預設開）：新做的幕合成完立刻校驗——CTC 對齊信心 < 0.5（--verify=fa，預設，本機不花請求）
//   或 Gemini 聽寫 CER > 15%（--verify=asr｜both，花 Gemini 文字模型請求）的幕，自動重生一次（等同 --only=那幾幕，
//   合併成一次 TTS 請求），每支最多 --regen-max=3 幕（TTS_REGEN_MAX）；重生後再校驗，比原本差就還原原音檔。
//   --no-regen 只校驗不重生；--verify=off 全關；--check 不合成，只校驗現有全部音檔（不合格的照樣自動重生）。
//   結果寫 videos/<slug>/tts-verify.json，並附在 tts-check.md 的「自動重生紀錄」一節（align 重寫報告時保留）。
// 批次：預設把整支影片的旁白合成成一次請求（各幕以空行分段），再用 ffmpeg 靜音偵測切成每幕；
//   免費方案每個模型每天只有 10 次請求，所以一支影片只花 1 次。TTS_BATCH=1 可改回逐幕。
// 模型：預設 gemini-3.8-flash-tts（3.x 系列只送純文字；2.5 系列可帶「語氣說：」指示）。TTS_MODEL 或 script.voice.model 可覆寫。
// 金鑰：雲端環境的網路秘密（generativelanguage.googleapis.com / x-goog-api-key）由代理注入；本機可設 GEMINI_API_KEY。
// Node 原生 fetch 要走代理需 NODE_USE_ENV_PROXY=1（package.json 已帶）。
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { execFileSync, spawnSync } from "node:child_process";
import { verifyScenes, writeVerify, verifySection, CONF_MIN, CER_MAX } from "./verify.mjs";

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const args = process.argv.slice(2);
const flags = new Set(args.filter((a) => a.startsWith("--") && !a.includes("=")));
const opt = Object.fromEntries(args.filter((a) => a.startsWith("--") && a.includes("=")).map((a) => a.slice(2).split("=")));
const slug = args.find((a) => !a.startsWith("--"));
const API = "https://generativelanguage.googleapis.com/v1beta";
const KEY = process.env.GEMINI_API_KEY || "injected-by-proxy";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const PUNCT = /[\s，。、！？：；「」『』（）,.!?:;()"'“”‘’…—\-–·]/g;
const nchars = (t) => t.replace(PUNCT, "").length;
const DELAY = Number(process.env.TTS_DELAY_MS ?? 6000);
const BATCH = Number(process.env.TTS_BATCH ?? 20);

const headers = { "Content-Type": "application/json", "x-goog-api-key": KEY };

if (flags.has("--list-models")) {
  const r = await fetch(`${API}/models?pageSize=200`, { headers });
  if (!r.ok) { console.error(`✖ ${r.status} ${(await r.text()).slice(0, 400)}`); process.exit(1); }
  const j = await r.json();
  const tts = (j.models ?? []).filter((m) => /tts/i.test(m.name));
  console.log(`共 ${j.models?.length ?? 0} 個模型，TTS 相關：`);
  for (const m of tts) console.log(`  ${m.name.replace("models/", "")}  —  ${m.displayName ?? ""}`);
  process.exit(0);
}
if (!slug) { console.error("用法：npm run tts <slug> [--force] [--only=id1,id2]｜npm run voices <slug>｜npm run tts -- --list-models"); process.exit(2); }

const dir = path.join(ROOT, "videos", slug);
const script = JSON.parse(fs.readFileSync(path.join(dir, "script.json"), "utf8"));
const voice = script.voice ?? {};
const V2 = script.styleVersion === 2;
if (!voice.voiceName) { console.error("script.json 缺 voice.voiceName"); process.exit(2); }
// 整篇一鏡到底模式（script.voice.mode === "take"，styleVersion 3 起用）：交給 tts-take.mjs，不走下面的逐幕切段
if (voice.mode === "take") {
  const r = spawnSync(process.execPath, [path.join(ROOT, "scripts", "tts-take.mjs"), ...args], { stdio: "inherit" });
  process.exit(r.status ?? 1);
}
const MODEL = process.env.TTS_MODEL || voice.model || "gemini-3.8-flash-tts";
// 語氣指示：2.5 系列 TTS 會把「XXX說：」當成指示而不唸出；3.x 會整段唸出，所以 3.x 一律只送純文字
const STYLE_DEFAULT = "用親切、清晰、語速稍快的台灣國語";
const styled = /gemini-2\.5/.test(MODEL);
const prompt = (text) => (styled ? `${(voice.style || STYLE_DEFAULT).replace(/[。：:]+$/, "")}說：\n${text}` : text);

let REQUESTS = 0; // 本次執行送出的 TTS 合成請求數（含重試前的那一次）
async function synth(text, voiceName) {
  REQUESTS++;
  const body = {
    contents: [{ parts: [{ text: prompt(text) }] }],
    generationConfig: { responseModalities: ["AUDIO"], speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName } } } },
  };
  let lastErr;
  for (let i = 0; i < 4; i++) {
    const r = await fetch(`${API}/models/${MODEL}:generateContent`, { method: "POST", headers, body: JSON.stringify(body) });
    if (r.ok) {
      const j = await r.json();
      const part = j.candidates?.[0]?.content?.parts?.find((p) => p.inlineData);
      if (!part) { lastErr = new Error("回應沒有音訊：" + JSON.stringify(j).slice(0, 400)); break; }
      const mime = part.inlineData.mimeType ?? "";
      const buf = Buffer.from(part.inlineData.data, "base64");
      if (/wav|wave/i.test(mime) || buf.subarray(0, 4).toString() === "RIFF") return { wav: buf };
      const rate = Number(/rate=(\d+)/.exec(mime)?.[1] ?? 24000);
      return { pcm: buf, rate };
    }
    const txt = await r.text();
    lastErr = new Error(`${r.status} ${txt.replace(/\s+/g, " ").slice(0, 400)}`);
    if (r.status === 429 && /PerDay/.test(txt)) { lastErr.daily = true; break; }
    if (r.status === 429 || r.status >= 500) {
      const wait = r.status === 429 ? 20000 * (i + 1) : 3000 * (i + 1);
      console.warn(`\n  ↻ ${r.status}，${wait / 1000}s 後重試`);
      await sleep(wait);
      continue;
    }
    break;
  }
  throw lastErr;
}

const wavHeader = (dataLen, rate) => {
  const b = Buffer.alloc(44);
  b.write("RIFF", 0); b.writeUInt32LE(36 + dataLen, 4); b.write("WAVE", 8); b.write("fmt ", 12);
  b.writeUInt32LE(16, 16); b.writeUInt16LE(1, 20); b.writeUInt16LE(1, 22); b.writeUInt32LE(rate, 24);
  b.writeUInt32LE(rate * 2, 28); b.writeUInt16LE(2, 32); b.writeUInt16LE(16, 34); b.write("data", 36); b.writeUInt32LE(dataLen, 40);
  return b;
};
const writeRaw = (file, res) => fs.writeFileSync(file, res.wav ?? Buffer.concat([wavHeader(res.pcm.length, res.rate), res.pcm]));
const dur = (file) => Number(execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "default=nw=1:nk=1", file]).toString().trim());
/**
 * 去頭尾靜音 → 24kHz mono；可指定 ss/to 只取一段。
 *  v1：頭尾各留 0.08/0.12 秒，每段各自 loudnorm（舊片保持原樣）
 *  v2（P0-4）：頭尾各留 0.04 秒，不逐段 loudnorm（批次合成本來就同一個音量），整條人聲軌在 align 時統一做兩段式 loudnorm → voice.wav
 */
const polish = (raw, out, ss, to) => execFileSync("ffmpeg", ["-y", "-loglevel", "error", ...(ss !== undefined ? ["-ss", String(ss), "-to", String(to)] : []), "-i", raw, "-af",
  V2 ? "silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.04,areverse,silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.04,areverse"
    : "silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.08,areverse,silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.12,areverse,loudnorm=I=-16:TP=-1.5:LRA=11",
  "-ar", "24000", "-ac", "1", out]);
/** 靜音清單 [{s,e,d}] */
const silences = (file) => {
  const out = spawnSync("ffmpeg", ["-i", file, "-af", "silencedetect=noise=-38dB:d=0.12", "-f", "null", "-"], { encoding: "utf8" }).stderr ?? "";
  const st = [...out.matchAll(/silence_start: ([\d.]+)/g)].map((m) => Number(m[1]));
  const en = [...out.matchAll(/silence_end: ([\d.]+)/g)].map((m) => Number(m[1]));
  return st.map((s, i) => ({ s, e: en[i] ?? s, d: (en[i] ?? s) - s }));
};
/**
 * 把一段合成音檔切成每幕：候選切點 = 所有停頓的中點；用動態規劃挑 n−1 個切點，
 * 讓每段長度最接近「該幕字數 × 整段平均語速」（同時偏好較長的停頓）。切不出來回傳 null（呼叫端會拆半重做）。
 */
const splitSegments = (raw, texts) => {
  const n = texts.length;
  const total = dur(raw);
  if (n === 1) return [[0, total]];
  const sil = silences(raw).filter((x) => x.s > 0.15 && x.e < total - 0.15).sort((a, b) => a.s - b.s);
  if (sil.length < n - 1) return null;
  const counts = texts.map(nchars);
  const sum = counts.reduce((a, b) => a + b, 0);
  const expect = counts.map((c) => (c / sum) * total);
  const mids = sil.map((x) => (x.s + x.e) / 2);
  const bonus = sil.map((x) => -0.25 * Math.min(x.d, 1.2));
  const segCost = (len, k) => Math.pow((len - expect[k]) / expect[k], 2);
  // dp[k][j]：第 k 個分界放在第 j 個停頓的最小成本；prev 記回溯
  const K = n - 1, J = mids.length;
  const dp = Array.from({ length: K }, () => new Array(J).fill(Infinity));
  const prev = Array.from({ length: K }, () => new Array(J).fill(-1));
  for (let j = 0; j < J; j++) dp[0][j] = segCost(mids[j], 0) + bonus[j];
  for (let k = 1; k < K; k++) for (let j = k; j < J; j++) {
    let best = Infinity, bi = -1;
    for (let i = k - 1; i < j; i++) { if (dp[k - 1][i] === Infinity) continue; const c = dp[k - 1][i] + segCost(mids[j] - mids[i], k) + bonus[j]; if (c < best) { best = c; bi = i; } }
    dp[k][j] = best; prev[k][j] = bi;
  }
  let bestJ = -1, bestC = Infinity;
  for (let j = K - 1; j < J; j++) { const c = dp[K - 1][j] + segCost(total - mids[j], K); if (c < bestC) { bestC = c; bestJ = j; } }
  if (bestJ < 0) return null;
  const cuts = [];
  for (let k = K - 1, j = bestJ; k >= 0; k--) { cuts.unshift(mids[j]); j = prev[k][j]; }
  const segs = [];
  let from = 0;
  for (const c of cuts) { segs.push([from, c]); from = c; }
  segs.push([from, total]);
  return segs;
};

/** 逐幕合成 */
const makeOne = async (text, voiceName, abs) => {
  const res = await synth(text, voiceName);
  const raw = abs.replace(/\.wav$/, ".raw.wav");
  writeRaw(raw, res); polish(raw, abs); fs.unlinkSync(raw);
  return dur(abs);
};
/** 批次合成：一次請求多幕，再切開。回傳每幕秒數；切不開就對半分再試 */
const makeBatch = async (items, voiceName) => {
  if (items.length === 1) {
    process.stdout.write(`▶ ${String(items[0].n).padStart(2, "0")} ${items[0].id}（${nchars(items[0].text)} 字）…`);
    const d = await makeOne(items[0].text, voiceName, items[0].abs);
    console.log(` ${d.toFixed(2)}s`);
    return [d];
  }
  process.stdout.write(`▶ 批次 ${items[0].n}–${items[items.length - 1].n}（${items.length} 幕，${items.reduce((a, x) => a + nchars(x.text), 0)} 字）…`);
  // 原始批次音檔留著（檔名含文字雜湊），--resplit 時直接重切不再花請求
  const bh = crypto.createHash("sha1").update([MODEL, voiceName, ...items.map((x) => x.text)].join("\u0001")).digest("hex").slice(0, 10);
  const raw = path.join(path.dirname(items[0].abs), `.batch-${bh}.raw.wav`);
  if (!(flags.has("--resplit") && fs.existsSync(raw))) writeRaw(raw, await synth(items.map((x) => x.text).join("\n\n"), voiceName));
  else process.stdout.write("（沿用原始音檔）");
  const segs = splitSegments(raw, items.map((x) => x.text));
  if (!segs) {
    console.log(` 停頓不夠，切不出 ${items.length} 段 → 拆半重試`);
    const mid = Math.ceil(items.length / 2);
    await sleep(DELAY);
    const a = await makeBatch(items.slice(0, mid), voiceName);
    await sleep(DELAY);
    return [...a, ...(await makeBatch(items.slice(mid), voiceName))];
  }
  console.log(` ${dur(raw).toFixed(1)}s → 切 ${segs.length} 段`);
  const secs = [];
  for (const [k, it] of items.entries()) {
    polish(raw, it.abs, segs[k][0], segs[k][1]);
    const d = dur(it.abs) || 0;
    const expect = nchars(it.text) / 4.2 + 0.3;
    const flag = d < expect * 0.5 || d > expect * 1.8 ? "  ⚠ 長度異常（預期約 " + expect.toFixed(1) + "s）" : "";
    console.log(`   ${String(it.n).padStart(2, "0")} ${it.id} ${d.toFixed(2)}s${flag}`);
    secs.push(d);
  }
  return secs;
};

if (flags.has("--samples")) {
  const cands = [...new Set([voice.voiceName, ...(voice.candidates ?? [])].filter(Boolean))];
  const first = script.scenes[0];
  const text = first.tts ?? first.narration;
  const sdir = path.join(ROOT, "out", slug, "voice-samples");
  fs.mkdirSync(sdir, { recursive: true });
  const rows = [];
  for (const v of cands) {
    const out = path.join(sdir, `${v}.wav`);
    try {
      const d = await makeOne(text, v, out);
      rows.push({ voice: v, sec: Number(d.toFixed(2)), charsPerSec: Number((nchars(text) / d).toFixed(1)), file: path.relative(ROOT, out) });
      console.log(`✔ ${v} ${d.toFixed(2)}s`);
      await sleep(DELAY);
    } catch (e) { rows.push({ voice: v, error: e.message }); console.warn(`✖ ${v}: ${e.message}`); if (e.daily) break; }
  }
  fs.writeFileSync(path.join(sdir, "samples.json"), JSON.stringify({ text, model: MODEL, rows }, null, 2));
  console.table(rows);
  process.exit(rows.some((r) => r.error) ? 1 : 0);
}

const only = opt.only ? new Set(opt.only.split(",")) : null;
const force = flags.has("--force");
const CHECK = flags.has("--check");
const outDir = path.join(ROOT, "public", "audio", slug);
fs.mkdirSync(outDir, { recursive: true });
const manifestPath = path.join(dir, "tts-manifest.json");
const manifest = fs.existsSync(manifestPath) ? JSON.parse(fs.readFileSync(manifestPath, "utf8")) : { scenes: [] };
const entries = [];
const todo = [];
const hashes = {}; // 每幕「現行」雜湊（模型、音色、style、念稿）：自動重生只重做跟現行設定一致的幕，避免一支片混兩種音色
for (const [i, s] of script.scenes.entries()) {
  const text = s.tts ?? s.narration;
  const hash = crypto.createHash("sha1").update([MODEL, voice.voiceName, styled ? voice.style ?? "" : "", text].join("\u0001")).digest("hex").slice(0, 12);
  const file = `audio/${slug}/${String(i + 1).padStart(2, "0")}-${s.id}.wav`;
  const abs = path.join(ROOT, "public", file);
  const prev = manifest.scenes.find((m) => m.id === s.id);
  hashes[s.id] = hash;
  const reusable = prev && fs.existsSync(abs) && prev.hash === hash;
  const wanted = !CHECK && (force || (only ? only.has(s.id) : !reusable));
  if (!wanted && prev && fs.existsSync(abs)) { entries.push({ ...prev, file }); console.log(`= ${s.id}（沿用${prev.hash === hash ? "" : "，但文字已改，建議重做"}）`); continue; }
  if (CHECK) { console.log(`- ${s.id}（沒有音檔，--check 略過）`); continue; }
  const entry = { id: s.id, file, sec: 0, text, hash, voice: voice.voiceName, model: MODEL };
  entries.push(entry);
  todo.push({ n: i + 1, id: s.id, text, abs, entry });
}
const save = () => fs.writeFileSync(manifestPath, JSON.stringify({ slug, model: MODEL, voiceName: voice.voiceName, style: styled ? voice.style ?? STYLE_DEFAULT : null, batch: BATCH, scenes: entries.filter((e) => e.sec > 0) }, null, 2));
try {
  for (let i = 0; i < todo.length; i += BATCH) {
    const chunk = todo.slice(i, i + BATCH);
    if (i) await sleep(DELAY);
    const secs = await makeBatch(chunk, voice.voiceName);
    chunk.forEach((it, k) => { it.entry.sec = Number(secs[k].toFixed(3)); });
    save();
  }
} catch (e) {
  save();
  console.error(`✖ ${e.message}${e.daily ? "\n  今日此模型免費額度用完；可換模型（TTS_MODEL=gemini-3.8-flash-lite-tts / gemini-3.1-flash-tts-preview）或開啟計費" : ""}`);
  process.exit(1);
}
const done = entries.filter((e) => e.sec > 0);
const total = done.reduce((a, e) => a + e.sec, 0);
console.log(`✔ ${done.length}/${entries.length} 幕（新做 ${todo.length}），配音合計 ${total.toFixed(1)} 秒 → ${path.relative(ROOT, manifestPath)}`);

// ── 回讀校驗＋自動重生 ──────────────────────────────────────────────
const VERIFY = opt.verify ?? process.env.TTS_VERIFY ?? "fa";
const REGEN_MAX = Number(opt["regen-max"] ?? process.env.TTS_REGEN_MAX ?? 3);
const NO_REGEN = flags.has("--no-regen") || !(REGEN_MAX > 0);
const targets = (CHECK ? done : done.filter((e) => todo.some((t) => t.id === e.id)));
if (VERIFY !== "off" && targets.length) {
  if (!["fa", "asr", "both"].includes(VERIFY)) { console.error(`✖ --verify=${VERIFY} 不合法（fa｜asr｜both｜off）`); process.exit(2); }
  const items = targets.map((e) => ({ id: e.id, file: path.join(ROOT, "public", e.file), text: e.text, n: script.scenes.findIndex((s) => s.id === e.id) + 1, entry: e }));
  console.log(`\n▶ 回讀校驗 ${items.length} 幕（${VERIFY}；門檻：信心 < ${CONF_MIN}${VERIFY === "fa" ? "" : `、CER > ${CER_MAX * 100}%`}）`);
  const before = await verifyScenes(items, VERIFY);
  const usable = Object.values(before).some((r) => r.confidence != null || r.cer != null);
  const score = (r) => (r.confidence ?? 1) - (r.cer ?? 0);
  const bad = items.filter((x) => before[x.id].bad).sort((a, b) => score(before[a.id]) - score(before[b.id]));
  const stale = (x) => x.entry.hash !== hashes[x.id]; // 這幕是用別的音色／模型／文字做的 → 不單獨重生
  const pick = NO_REGEN ? [] : bad.filter((x) => !stale(x)).slice(0, REGEN_MAX);
  const rec = { slug, at: new Date().toISOString(), method: VERIFY, confMin: CONF_MIN, cerMax: CER_MAX, regenMax: NO_REGEN ? 0 : REGEN_MAX, regenRequests: 0,
    note: usable ? "" : "校驗工具不可用（fa.py 失敗或聽寫無額度），本次未判定",
    scenes: items.map((x) => ({ id: x.id, before: before[x.id], regen: false, skipReason: before[x.id].bad ? (NO_REGEN ? "--no-regen" : stale(x) ? "音色／模型／念稿已改，請整支重做" : "超過重生上限") : undefined })) };
  for (const x of items) { const r = before[x.id]; console.log(`  ${r.bad ? "⚠" : "✔"} ${x.id}：${r.confidence != null ? `信心 ${r.confidence}` : "信心 —"}${r.cer != null ? `、CER ${(r.cer * 100).toFixed(0)}%` : ""}${r.bad ? `（${r.why.join("；")}）` : ""}`); }
  if (pick.length) {
    console.log(`▶ 自動重生 ${pick.length} 幕（等同 --only=${pick.map((x) => x.id).join(",")}，合併成一次請求）`);
    const bak = (x) => x.file.replace(/\.wav$/, ".prev.wav");
    for (const x of pick) fs.copyFileSync(x.file, bak(x));
    const req0 = REQUESTS;
    let ok = true;
    try {
      const secs = await makeBatch(pick.map((x) => ({ n: x.n, id: x.id, text: x.text, abs: x.file })), voice.voiceName);
      pick.forEach((x, k) => { x.newSec = Number(secs[k].toFixed(3)); });
    } catch (e) {
      ok = false;
      console.warn(`⚠ 重生失敗：${e.message.slice(0, 200)}${e.daily ? "（今日額度用完）" : ""} → 保留原音檔`);
      rec.note = `重生失敗：${e.daily ? "今日 TTS 額度用完" : e.message.slice(0, 80)}`;
      for (const x of pick) fs.copyFileSync(bak(x), x.file);
    }
    rec.regenRequests = REQUESTS - req0;
    const after = ok ? await verifyScenes(pick, VERIFY) : {};
    for (const x of pick) {
      const row = rec.scenes.find((r) => r.id === x.id);
      row.regen = ok; if (!ok) { row.skipReason = "重生請求失敗"; fs.unlinkSync(bak(x)); continue; }
      row.after = after[x.id];
      if (after[x.id].bad && score(after[x.id]) < score(before[x.id])) {
        fs.copyFileSync(bak(x), x.file); row.kept = "原音檔"; // 重生後更差 → 還原
      } else { row.kept = "重生"; x.entry.sec = x.newSec; }
      fs.unlinkSync(bak(x));
      console.log(`  ${after[x.id].bad ? "⚠" : "✔"} ${x.id} 重生後：${after[x.id].confidence != null ? `信心 ${after[x.id].confidence}` : "信心 —"}${after[x.id].cer != null ? `、CER ${(after[x.id].cer * 100).toFixed(0)}%` : ""} → 保留${row.kept}`);
    }
    save();
  }
  for (const r of rec.scenes) if (r.before.bad && (!r.after || r.after.bad || r.kept === "原音檔")) console.warn(`⚠ ${r.id} 仍未通過回讀校驗，請試聽並檢查 pronunciation.md`);
  writeVerify(slug, rec);
  const cp = path.join(dir, "tts-check.md");
  const old = fs.existsSync(cp) ? fs.readFileSync(cp, "utf8") : `# 回讀校驗：${slug}\n\n（npm run align ${slug} 會補上逐幕對齊表）\n`;
  const k = old.indexOf("\n## 自動重生紀錄");
  fs.writeFileSync(cp, (k < 0 ? old : old.slice(0, k + 1)).replace(/\n*$/, "\n") + verifySection(slug));
  console.log(`✔ 回讀校驗 → videos/${slug}/tts-verify.json、tts-check.md（不合格 ${bad.length}、重生 ${rec.scenes.filter((r) => r.regen).length}、TTS 請求 ${rec.regenRequests}）`);
}

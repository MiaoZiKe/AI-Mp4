// 整篇一鏡到底配音（script.voice.mode === "take"；styleVersion 3 起用）。npm run tts <slug> 會自動轉到這支。
//   node scripts/tts-take.mjs <slug>             → 1 次 TTS 請求念完整篇，再依 CTC 強制對齊切成每幕
//                                                   public/audio/<slug>/NN-<id>.wav ＋ videos/<slug>/tts-manifest.json
//   … --resplit                                   → 沿用留存的整篇原始音檔重切（不花請求）
//   … --force                                     → 即使念稿、音色、提示都沒變也重新生成（花 1 次請求）
//   … --audition=<tag> [--upto=<幕id>] [--voice=音色] [--profile=tech|stock|love|ai] [--style="…"] [--lang=cmn-TW|off] [--out=資料夾] [--script=另一份稿.json]
//                                                 → 只試聽：念到指定幕為止，存 out/<slug>/voice-samples/<tag>.wav（1 次請求，不切、不動 manifest）
// 提示：script.json 有 voice.profile（docs/voice-profiles.md）就用 scripts/voice-profile.mjs 組「導演筆記」說明並送 languageCode cmn-TW；
//       沒有的舊片照舊用 voice.style（`${voice.style}說：`），請求和以前完全一樣。
// 和 tts.mjs（逐幕切段、換幕固定間隔）的差別：
//   1. 送出的文字依 script.json 每幕的 para 分段：同一段的幕接成同一行，段與段之間空一行 → 句間換氣由模型決定，不會每句等距停頓
//   2. 不靠靜音偵測猜切點：整篇先做 CTC 強制對齊，切點＝相鄰兩幕之間能量最低的地方
//   3. 每幕在原始錄音裡的間隔寫進 manifest 的 gapAfter；align 用它排時間軸 → 成片的節奏就是原始錄音的節奏
// 提示格式和 tts.mjs 相同：`${voice.style}說：\n${text}`（2.5 系列）。提示裡不要放任何像台詞的句子，會被念出來。
// 不自動重試 429（免費額度每模型每天約 10 次）；5xx 只重試一次。每次請求都記在 videos/<slug>/tts-requests.json。
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { runFA, geminiTranscribe, writeVerify, CONF_MIN, CER_MAX } from "./verify.mjs";
import { resolveProfile, profileIssues, buildDirection, takePrompt, LANGUAGE_CODE } from "./voice-profile.mjs";

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const args = process.argv.slice(2);
const flags = new Set(args.filter((a) => a.startsWith("--") && !a.includes("=")));
const opt = Object.fromEntries(args.filter((a) => a.startsWith("--") && a.includes("=")).map((a) => { const i = a.indexOf("="); return [a.slice(2, i), a.slice(i + 1)]; }));
const slug = args.find((a) => !a.startsWith("--"));
if (!slug) { console.error("用法：node scripts/tts-take.mjs <slug> [--resplit] [--force] [--audition=tag --style=… --upto=id]"); process.exit(2); }
const API = "https://generativelanguage.googleapis.com/v1beta";
const headers = { "Content-Type": "application/json", "x-goog-api-key": process.env.GEMINI_API_KEY || "injected-by-proxy" };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const dir = path.join(ROOT, "videos", slug);
// --script=<檔>：只給試聽用，念另一份稿（同樣是 { voice, scenes:[{ id, narration, tts? }] }），不動該片的 script.json
if (opt.script && !opt.audition) { console.error("--script 只能和 --audition 一起用"); process.exit(2); }
const script = JSON.parse(fs.readFileSync(opt.script ? path.resolve(ROOT, opt.script) : path.join(dir, "script.json"), "utf8"));
const voice = { ...(script.voice ?? {}) };
if (opt.voice) voice.voiceName = opt.voice; // 只給試聽用：換音色不改 script.json
if (opt.profile) voice.profile = opt.profile; // 只給試聽用：套某個頻道預設檔
if ((opt.voice || opt.profile) && !opt.audition) { console.error("--voice／--profile 只能和 --audition 一起用（正式配音請改 script.json）"); process.exit(2); }
if (!voice.voiceName) { console.error("script.json 缺 voice.voiceName"); process.exit(2); }
const MODEL = process.env.TTS_MODEL || voice.model || "gemini-2.5-flash-preview-tts";
const styled = /gemini-2\.5/.test(MODEL);
// 旁白設定檔（voice.profile，docs/voice-profiles.md）：有就用它組「導演筆記」說明；沒有的舊片照舊用 voice.style（提示與快取雜湊都不變）
const profile = opt.style ? null : resolveProfile(voice);
if (profile) { const bad = profileIssues(profile); if (bad.length) { console.error("✖ voice.profile 有問題：\n  " + bad.join("\n  ")); process.exit(2); } }
const STYLE = profile ? buildDirection(profile) : (opt.style ?? voice.style ?? "").replace(/[。：:]+$/, "");
if (styled && !STYLE) { console.error("script.json 缺 voice.profile 或 voice.style（或用 --style=）"); process.exit(2); }
// 3.x 系列會把說明念出來 → 只送念稿，口音靠 languageCode；各段情緒在 3.x 目前不送（見 docs/voice-profiles.md）
const prompt = (text) => (!styled ? text : profile ? takePrompt(profile, text) : `${STYLE}說：\n${text}`);
// languageCode：有設定檔預設送 cmn-TW；舊片沒寫 voice.languageCode 就不送（請求和以前一樣）。--lang=off 關掉
let LANG = opt.lang === "off" ? null : opt.lang ?? voice.languageCode ?? (profile ? LANGUAGE_CODE : null);
const SR = 24000, KEEP = 0.04, FADE = 0.004, VOICE_DB = -40;

/** 有旁白的幕；同一個 para 接成同一行，換段空一行 */
let spoken = script.scenes.map((s, i) => ({ n: i + 1, id: s.id, text: (s.tts ?? s.narration ?? "").trim(), para: s.para ?? i })).filter((x) => x.text);
if (opt.upto) { const k = spoken.findIndex((x) => x.id === opt.upto); if (k < 0) { console.error(`--upto=${opt.upto} 不是有旁白的幕`); process.exit(2); } spoken = spoken.slice(0, k + 1); }
let full = "";
for (const [k, x] of spoken.entries()) { if (k) full += x.para === spoken[k - 1].para ? "" : "\n\n"; x.from = full.length; full += x.text; x.to = full.length; }

const reqLog = path.join(dir, "tts-requests.json");
const logReq = (row) => { const a = fs.existsSync(reqLog) ? JSON.parse(fs.readFileSync(reqLog, "utf8")) : []; a.push(row); fs.writeFileSync(reqLog, JSON.stringify(a, null, 1) + "\n"); };

async function synth(text, purpose) {
  const mk = () => ({ contents: [{ parts: [{ text: prompt(text) }] }], generationConfig: { responseModalities: ["AUDIO"], ...(process.env.TTS_TEMPERATURE ? { temperature: Number(process.env.TTS_TEMPERATURE) } : {}), speechConfig: { ...(LANG ? { languageCode: LANG } : {}), voiceConfig: { prebuiltVoiceConfig: { voiceName: voice.voiceName } } } } });
  for (let i = 0; i < 2; i++) {
    const body = mk();
    const r = await fetch(`${API}/models/${MODEL}:generateContent`, { method: "POST", headers, body: JSON.stringify(body) });
    const row = { at: new Date().toISOString(), purpose, model: MODEL, voice: voice.voiceName, languageCode: LANG ?? undefined, status: r.status };
    if (r.ok) {
      const j = await r.json();
      const part = j.candidates?.[0]?.content?.parts?.find((p) => p.inlineData);
      logReq({ ...row, usage: j.usageMetadata, audio: Boolean(part) });
      if (!part) throw new Error("回應沒有音訊：" + JSON.stringify(j).slice(0, 300));
      const buf = Buffer.from(part.inlineData.data, "base64");
      if (buf.subarray(0, 4).toString() === "RIFF") return readWav(buf);
      const rate = Number(/rate=(\d+)/.exec(part.inlineData.mimeType ?? "")?.[1] ?? SR);
      return { rate, pcm: new Int16Array(buf.buffer, buf.byteOffset, buf.length >> 1) };
    }
    const t = (await r.text()).replace(/\s+/g, " ");
    logReq({ ...row, error: t.slice(0, 300) });
    // 這個模型不收 languageCode（400）→ 拿掉再送一次（多花 1 次請求），並提醒把 voice.languageCode 設成 "off"
    if (process.env.TTS_NO_RETRY === "1") { const e = new Error(`${r.status} ${t.slice(0, 300)}`); e.quota = r.status === 429; throw e; } // 嚴格只送 1 次：任何錯誤都不重送
    if (r.status === 400 && LANG && /language/i.test(t) && i === 0) { console.warn(`  ⚠ ${MODEL} 不收 languageCode「${LANG}」（400）→ 拿掉重送一次`); LANG = null; continue; }
    if (r.status >= 500 && i === 0) { console.warn(`  ↻ ${r.status}，5 秒後重試一次`); await sleep(5000); continue; }
    const e = new Error(`${r.status} ${t.slice(0, 300)}`); e.quota = r.status === 429; throw e;
  }
}
function readWav(buf) {
  let p = 12, rate = SR;
  while (p + 8 <= buf.length) {
    const id = buf.subarray(p, p + 4).toString(), n = buf.readUInt32LE(p + 4);
    if (id === "fmt ") rate = buf.readUInt32LE(p + 12);
    if (id === "data") { const d = buf.subarray(p + 8, Math.min(buf.length, p + 8 + n)); return { rate, pcm: new Int16Array(d.buffer.slice(d.byteOffset, d.byteOffset + (d.length & ~1))) }; }
    p += 8 + n + (n & 1);
  }
  throw new Error("WAV 沒有 data 區塊");
}
function writeWav(file, pcm, rate) {
  const h = Buffer.alloc(44), n = pcm.length * 2;
  h.write("RIFF", 0); h.writeUInt32LE(36 + n, 4); h.write("WAVE", 8); h.write("fmt ", 12); h.writeUInt32LE(16, 16); h.writeUInt16LE(1, 20); h.writeUInt16LE(1, 22);
  h.writeUInt32LE(rate, 24); h.writeUInt32LE(rate * 2, 28); h.writeUInt16LE(2, 32); h.writeUInt16LE(16, 34); h.write("data", 36); h.writeUInt32LE(n, 40);
  fs.writeFileSync(file, Buffer.concat([h, Buffer.from(pcm.buffer, pcm.byteOffset, n)]));
}
/** 每 10ms 的 dBFS */
function levels(pcm, rate) {
  const hop = Math.round(rate * 0.01), n = Math.floor(pcm.length / hop), db = new Float32Array(n);
  for (let k = 0; k < n; k++) { let s = 0; for (let i = k * hop; i < (k + 1) * hop; i++) { const v = pcm[i] / 32768; s += v * v; } db[k] = 10 * Math.log10(s / hop + 1e-12); }
  return db;
}

const takeHash = crypto.createHash("sha1").update([MODEL, voice.voiceName, STYLE, full, ...(LANG ? [LANG] : [])].join("\u0001")).digest("hex").slice(0, 10);
// --hash：只印正式整篇原始音檔的相對路徑（make-tech.sh 用），不做任何事、不送請求
if (flags.has("--hash")) { console.log(`audio/${slug}/.take-${takeHash}.raw.wav`); process.exit(0); }

// ── 試聽 ──────────────────────────────────────────────────────────────
if (opt.audition) {
  const sdir = opt.out ? path.resolve(ROOT, opt.out) : path.join(ROOT, "out", slug, "voice-samples");
  fs.mkdirSync(sdir, { recursive: true });
  const file = path.join(sdir, `${opt.audition}.wav`);
  console.log(`▶ 試聽 ${opt.audition}：${voice.voiceName}／${MODEL}，${spoken.length} 幕（1 次請求）\n--- 送出的全文 ---\n${prompt(full)}\n---`);
  let a;
  try { a = await synth(full, `audition:${opt.audition}`); } catch (e) { console.error(`✖ ${e.message}${e.quota ? "\n  429：停止，不重試、不換帳號" : ""}`); process.exit(1); }
  writeWav(file, a.pcm, a.rate);
  const ap = path.join(sdir, "audition.json");
  const aj = fs.existsSync(ap) ? JSON.parse(fs.readFileSync(ap, "utf8")) : { requests: [], rows: {} };
  aj.rows[opt.audition] = { id: opt.audition, voice: voice.voiceName, model: MODEL, tag: "take-audition", profile: profile ? (profile.preset ?? "custom") : null, languageCode: LANG, style: STYLE, prompt: prompt(full), text: full, file, sec: +(a.pcm.length / a.rate).toFixed(2) };
  aj.requests.push({ at: new Date().toISOString(), id: opt.audition, model: MODEL, voice: voice.voiceName, tag: "take-audition", status: 200 });
  fs.writeFileSync(ap, JSON.stringify(aj, null, 2));
  console.log(`✔ ${path.relative(ROOT, file)}（${(a.pcm.length / a.rate).toFixed(2)}s）`);
  process.exit(0);
}

// ── 正式：生成（或沿用）整篇原始音檔 ───────────────────────────────────
const outDir = path.join(ROOT, "public", "audio", slug);
fs.mkdirSync(outDir, { recursive: true });
const rawRel = `audio/${slug}/.take-${takeHash}.raw.wav`, rawAbs = path.join(ROOT, "public", rawRel);
const manifestPath = path.join(dir, "tts-manifest.json");
const prevManifest = fs.existsSync(manifestPath) ? JSON.parse(fs.readFileSync(manifestPath, "utf8")) : null;
let requests = 0, take;
if (fs.existsSync(rawAbs) && !flags.has("--force")) {
  console.log(`= 沿用整篇原始音檔 public/${rawRel}（念稿、音色、提示都沒變${flags.has("--resplit") ? "；--resplit 重切" : ""}）`);
  take = readWav(fs.readFileSync(rawAbs));
} else {
  if (flags.has("--resplit")) { console.error(`✖ --resplit：找不到 public/${rawRel}（念稿、音色或提示改過了，要重新生成）`); process.exit(2); }
  console.log(`▶ 整篇一次生成：${voice.voiceName}／${MODEL}，${spoken.length} 幕、${[...new Set(spoken.map((x) => x.para))].length} 段（1 次請求）`);
  requests = 1;
  try { take = await synth(full, "take"); } catch (e) { console.error(`✖ ${e.message}${e.quota ? "\n  429：停止，不重試、不換帳號" : ""}`); process.exit(1); }
  writeWav(rawAbs, take.pcm, take.rate);
  console.log(`✔ public/${rawRel}（${(take.pcm.length / take.rate).toFixed(2)}s）`);
}
const { pcm, rate } = take;
const total = pcm.length / rate;

// ── 整篇 CTC 強制對齊 → 每幕的字 ───────────────────────────────────────
const fa = runFA([{ id: "take", file: rawAbs, text: full }]).take;
if (!fa) { console.error("✖ 整篇強制對齊失敗（fa.py）；原始音檔已留存，修好後用 --resplit 重切"); process.exit(1); }
for (const x of spoken) x.units = fa.units.filter((u) => u.i >= x.from && u.i < x.to);
const empty = spoken.filter((x) => !x.units.length);
if (empty.length) { console.error(`✖ 這些幕沒有對到任何字：${empty.map((x) => x.id).join(", ")}`); process.exit(1); }

// ── 切點：相鄰兩幕之間能量最低的安靜區中點 ─────────────────────────────
const db = levels(pcm, rate), F = (t) => Math.max(0, Math.min(db.length - 1, Math.round(t * 100)));
const cuts = [0];
for (let k = 0; k < spoken.length - 1; k++) {
  const e = spoken[k].units.at(-1).end, s = spoken[k + 1].units[0].start;
  const a = F(Math.min(e, s) - 0.06), b = F(Math.max(e, s) + 0.06);
  let m = a; for (let i = a; i <= b; i++) if (db[i] < db[m]) m = i;
  const thr = Math.max(db[m] + 6, -50);
  let l = m, r = m; while (l > a && db[l - 1] <= thr) l--; while (r < b && db[r + 1] <= thr) r++;
  cuts.push(((l + r + 1) / 2) / 100);
}
cuts.push(total);

// ── 每幕：說話區間（−40 dBFS）頭尾各留 40ms、4ms 淡入淡出；不逐段 loudnorm（align 整條做） ──
const entries = [];
for (const [k, x] of spoken.entries()) {
  const a = F(cuts[k]), b = Math.min(db.length, F(cuts[k + 1]) + (k === spoken.length - 1 ? 1 : 0));
  let vs = a, ve = b - 1;
  while (vs < ve && db[vs] < VOICE_DB) vs++;
  while (ve > vs && db[ve] < VOICE_DB) ve--;
  x.vs = vs / 100; x.ve = (ve + 1) / 100;
  const t0 = Math.max(cuts[k], x.vs - KEEP), t1 = Math.min(cuts[k + 1], x.ve + KEEP);
  const seg = pcm.slice(Math.round(t0 * rate), Math.round(t1 * rate));
  const nf = Math.min(Math.round(FADE * rate), seg.length >> 1);
  for (let i = 0; i < nf; i++) { seg[i] = Math.round(seg[i] * (i / nf)); seg[seg.length - 1 - i] = Math.round(seg[seg.length - 1 - i] * (i / nf)); }
  const file = `audio/${slug}/${String(x.n).padStart(2, "0")}-${x.id}.wav`;
  writeWav(path.join(ROOT, "public", file), seg, rate);
  const sc = x.units.map((u) => u.score);
  // hash 的算法和 tts.mjs 相同（模型、音色、style、念稿）→ align 的快取判斷共用
  const hash = crypto.createHash("sha1").update([MODEL, voice.voiceName, styled ? (profile ? STYLE : voice.style ?? "") : "", x.text].join("\u0001")).digest("hex").slice(0, 12);
  entries.push({ id: x.id, file, sec: +(seg.length / rate).toFixed(3), text: x.text, hash: `${hash}-${takeHash}`, voice: voice.voiceName, model: MODEL,
    takeStart: +x.vs.toFixed(3), takeEnd: +x.ve.toFixed(3), headSec: +(x.vs - Math.round(t0 * rate) / rate).toFixed(4), tailSec: +(x.ve - Math.round(t0 * rate) / rate).toFixed(4), confidence: +(sc.reduce((p, c) => p + c, 0) / sc.length).toFixed(3), minScore: Math.min(...sc) });
}
for (const [k, e] of entries.entries()) e.gapAfter = k < entries.length - 1 ? +Math.max(0, spoken[k + 1].vs - spoken[k].ve).toFixed(3) : null;
// 提示有沒有被念出來：第一個字之前、最後一個字之後不該有說話聲
const lead = spoken[0].vs, firstUnit = fa.units[0].start, tailExtra = total - spoken.at(-1).ve;
const speechSec = spoken.at(-1).ve - spoken[0].vs;
fs.writeFileSync(manifestPath, JSON.stringify({ slug, mode: "take", model: MODEL, voiceName: voice.voiceName, style: styled ? STYLE : null, profile: profile ? (profile.preset ?? "custom") : null, languageCode: LANG,
  take: { file: rawRel, hash: takeHash, sec: +total.toFixed(3), speechSec: +speechSec.toFixed(3), leadSec: +lead.toFixed(3), firstCharSec: firstUnit, confidence: fa.confidence, minScore: fa.minScore, requests, prompt: prompt(full) },
  scenes: entries }, null, 2));
console.log(`\n幕   秒    信心(最低)  之後停頓`);
for (const e of entries) console.log(`${e.id}  ${e.sec.toFixed(2).padStart(5)}  ${e.confidence.toFixed(3)}(${e.minScore.toFixed(2)})  ${e.gapAfter == null ? "—" : e.gapAfter.toFixed(2)}${e.confidence < CONF_MIN ? "  ⚠ 信心偏低，請試聽" : ""}`);
console.log(`✔ ${entries.length} 幕，說話 ${speechSec.toFixed(2)}s（原始 ${total.toFixed(2)}s，開口前 ${lead.toFixed(2)}s、收聲後 ${tailExtra.toFixed(2)}s），整篇信心 ${fa.confidence} → ${path.relative(ROOT, manifestPath)}`);
if (firstUnit - lead > 0.5) console.warn(`⚠ 第一個字（${firstUnit}s）之前有 ${(firstUnit - lead).toFixed(2)} 秒說話聲：提示可能被念出來了，請試聽`);
// 整篇聽寫（--asr；花 1 次文字模型請求，不是 TTS 額度）：確認提示沒被念出來、沒有漏句多句。沒帶 --asr 就沿用同一份原始音檔的上一次聽寫
const asrPath = path.join(dir, "tts-take-asr.json");
let asr = fs.existsSync(asrPath) ? JSON.parse(fs.readFileSync(asrPath, "utf8")) : null;
if (asr && asr.take !== takeHash) asr = null;
if (flags.has("--asr")) {
  const tr = await geminiTranscribe(rawAbs);
  asr = { at: new Date().toISOString(), take: takeHash, model: tr.model, text: tr.text };
  fs.writeFileSync(asrPath, JSON.stringify(asr, null, 1) + "\n");
  console.log(`聽寫（${tr.model ?? "無可用模型"}）：${tr.text}`);
}
// 回讀校驗紀錄（和 tts.mjs 同一個格式，align 會附在 tts-check.md 最後）。整篇模式不單幕重生：要重做就整篇重來（--force，1 次請求）
const bad = entries.filter((e) => e.confidence < CONF_MIN);
writeVerify(slug, { slug, at: new Date().toISOString(), method: "fa", confMin: CONF_MIN, cerMax: CER_MAX, regenMax: 0, regenRequests: 0,
  note: `整篇一鏡到底（tts-take.mjs，原始音檔 ${takeHash}，本次 TTS 請求 ${requests} 次）：信心取自整篇對齊；不單幕重生，要重做就整篇重來${asr?.text ? `；整篇聽寫（${asr.model}）共 ${[...asr.text].length} 字，全文見 tts-take-asr.json` : ""}`,
  scenes: entries.map((e) => ({ id: e.id, before: { confidence: e.confidence, minScore: e.minScore, cer: null, transcript: null, bad: e.confidence < CONF_MIN, why: e.confidence < CONF_MIN ? [`對齊信心 ${e.confidence} < ${CONF_MIN}`] : [] }, regen: false, skipReason: e.confidence < CONF_MIN ? "整篇模式不單幕重生" : undefined })) });
for (const e of bad) console.warn(`⚠ ${e.id} 對齊信心 ${e.confidence} < ${CONF_MIN}：請試聽；要重做用 --force 整篇重來`);
if (prevManifest && prevManifest.mode !== "take") console.log("ℹ 原本的 tts-manifest.json 是逐幕模式，已改寫成整篇模式");

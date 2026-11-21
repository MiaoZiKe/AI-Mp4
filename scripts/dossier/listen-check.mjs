// 聽感驗證（交件四關之一，2026/11/22）：把成品音訊送 Gemini 音訊理解，請它逐句回報斷續／卡頓／字被切／停頓不自然（含時間點），
// 並逐字轉寫，與 script.json 的 tts（去標點）比對算 CER，列出漏字／多字／錯字。
// 用法：node scripts/dossier/listen-check.mjs <slug> [--file out/xxx.mp4] [--models=a,b] [--cer=0.03]
// 結果寫 out/<slug>/listen-check.json。exit 0＝通過；1＝有被標的問題或 CER>3%；2＝模型都不可用（聽感驗證未完成，視為不通過）。
// 模型順序：gemini-3.8-flash → gemini-2.5-flash → gemini-2.5-flash-lite。每個模型 timeout 120 秒、重試 2 次。
// 金鑰由代理注入（header x-goog-api-key: injected-by-proxy）；需 NODE_USE_ENV_PROXY=1 NODE_EXTRA_CA_CERTS=/root/.ccr/ca-bundle.crt（沒設會自動補）。
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "../..");
const args = process.argv.slice(2);
const slug = args.find((a) => !a.startsWith("--"));
const opt = (k) => args.find((a) => a.startsWith(`--${k}=`))?.slice(k.length + 3) ?? (args.includes(`--${k}`) ? args[args.indexOf(`--${k}`) + 1] : undefined);
if (!slug) { console.error("用法：node scripts/dossier/listen-check.mjs <slug> [--file mp4] [--models=a,b] [--cer=0.03]"); process.exit(2); }
if (!process.env.NODE_USE_ENV_PROXY && !process.env.__LC_REEXEC) {
  const r = spawnSync(process.execPath, [process.argv[1], ...args], { stdio: "inherit", env: { ...process.env, NODE_USE_ENV_PROXY: "1", NODE_EXTRA_CA_CERTS: process.env.NODE_EXTRA_CA_CERTS ?? "/root/.ccr/ca-bundle.crt", __LC_REEXEC: "1" } });
  process.exit(r.status ?? 2);
}
const outDir = path.join(ROOT, "out", slug); fs.mkdirSync(outDir, { recursive: true });
const jsonOut = path.join(outDir, "listen-check.json");
const file = opt("file") ? path.resolve(ROOT, opt("file")) : [`out/${slug}.mp4`, `out/web/${slug}/video.mp4`].map((p) => path.join(ROOT, p)).find((p) => fs.existsSync(p));
if (!file || !fs.existsSync(file)) { console.error(`✖ 找不到 ${slug} 的成品`); process.exit(2); }
const CER_MAX = Number(opt("cer") ?? 0.03);
const MODELS = (opt("models") ?? "gemini-3.8-flash,gemini-2.5-flash,gemini-2.5-flash-lite").split(",");
const BASE = "https://generativelanguage.googleapis.com/v1beta/models";

const script = JSON.parse(fs.readFileSync(path.join(ROOT, "videos", slug, "script.json"), "utf8"));
const spoken = script.scenes.filter((s) => !s.silent).map((s) => s.tts ?? s.narration);
const clean = (t) => String(t ?? "").replace(/[\s，。、？！：；「」『』（）()・｜|—–\-,.!?:;"'“”‘’…%]/g, "").toLowerCase();
const ref = clean(spoken.join(""));

// 16kHz mono wav
const wav = path.join(outDir, "listen-check.wav");
const ff = spawnSync("ffmpeg", ["-loglevel", "error", "-y", "-i", file, "-vn", "-ac", "1", "-ar", "16000", wav]);
if (ff.status !== 0) { console.error("✖ ffmpeg 抽音訊失敗：" + ff.stderr); process.exit(2); }
const b64 = fs.readFileSync(wav).toString("base64");

const PROMPT = `你是嚴格的配音品檢員。下面是一支台灣華語短影音的旁白音訊（可能結尾有音效）。請「只聽、不要猜」，輸出 JSON：
{
 "transcript": "逐字轉寫，繁體中文，不加標點，數字一律照念出來的中文字寫（例如「二零二二年」「四趴」「十一倍」），英文字母照念的字母寫",
 "sentences": [{"text":"這句轉寫","start_sec":數字,"end_sec":數字,"ok":true或false,"problem":"沒問題就空字串"}],
 "issues": [{"time_sec":數字,"type":"斷續|卡頓|字被切|停頓不自然|重複|多念|漏念|雜音","description":"一句話說明聽到什麼"}]
}
判斷標準：同一句話中間不該有明顯停頓（逗號處的短氣口正常）；聲音像斷電、瞬間消失又回來、字被吃掉、卡一下、突然的雜音，都要列入 issues，並給準確到 0.1 秒的時間點。只列你清楚聽到的問題，聽不出問題就讓 issues 是空陣列。transcript 要是你真的聽到的字，不要依常理補字。`;

async function callModel(model) {
  let lastErr;
  for (let attempt = 0; attempt < 3; attempt++) {
    const ac = new AbortController(); const to = setTimeout(() => ac.abort(), 120000);
    try {
      const r = await fetch(`${BASE}/${model}:generateContent`, {
        method: "POST", signal: ac.signal,
        headers: { "content-type": "application/json", "x-goog-api-key": "injected-by-proxy" },
        body: JSON.stringify({ contents: [{ parts: [{ inlineData: { mimeType: "audio/wav", data: b64 } }, { text: PROMPT }] }], generationConfig: { temperature: 0, responseMimeType: "application/json" } }),
      });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) { lastErr = `HTTP ${r.status} ${JSON.stringify(j).slice(0, 200)}`; if (r.status === 404 || r.status === 400) break; await new Promise((s) => setTimeout(s, 2000 * (attempt + 1))); continue; }
      const text = j.candidates?.[0]?.content?.parts?.map((p) => p.text ?? "").join("") ?? "";
      const m = /\{[\s\S]*\}/.exec(text);
      if (!m) { lastErr = "回應不是 JSON：" + text.slice(0, 120); continue; }
      return JSON.parse(m[0]);
    } catch (e) { lastErr = e.name === "AbortError" ? "timeout 120s" : e.message; } finally { clearTimeout(to); }
  }
  throw new Error(lastErr);
}

// 字元層級 Levenshtein，回傳操作清單
function align(a, b) {
  const n = a.length, m = b.length, D = Array.from({ length: n + 1 }, (_, i) => { const r = new Int32Array(m + 1); r[0] = i; return r; });
  for (let j = 0; j <= m; j++) D[0][j] = j;
  for (let i = 1; i <= n; i++) for (let j = 1; j <= m; j++) D[i][j] = Math.min(D[i - 1][j] + 1, D[i][j - 1] + 1, D[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
  const ops = []; let i = n, j = m;
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && D[i][j] === D[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)) { if (a[i - 1] !== b[j - 1]) ops.push({ t: "錯字", ref: a[i - 1], hyp: b[j - 1], at: i - 1 }); i--; j--; }
    else if (i > 0 && D[i][j] === D[i - 1][j] + 1) { ops.push({ t: "漏字", ref: a[i - 1], at: i - 1 }); i--; }
    else { ops.push({ t: "多字", hyp: b[j - 1], at: i }); j--; }
  }
  return { dist: D[n][m], ops: ops.reverse() };
}

const rec = { slug, file: path.relative(ROOT, file), at: new Date().toISOString(), tried: [] };
let res = null, usedModel = null;
for (const model of MODELS) {
  try { res = await callModel(model); usedModel = model; rec.tried.push({ model, ok: true }); break; }
  catch (e) { rec.tried.push({ model, ok: false, error: String(e.message).slice(0, 200) }); console.error(`  ⚠ ${model} 失敗：${String(e.message).slice(0, 160)}`); }
}
if (!res) {
  rec.status = "incomplete"; rec.note = "聽感驗證未完成：所有模型都不可用"; fs.writeFileSync(jsonOut, JSON.stringify(rec, null, 2));
  console.error("✖ 聽感驗證未完成（所有模型都不可用），視為不通過。"); process.exit(2);
}
const hyp = clean(res.transcript);
const { dist, ops } = align([...ref], [...hyp]);
const cer = ref.length ? dist / ref.length : 0;
const flagged = [...(res.issues ?? []), ...(res.sentences ?? []).filter((s) => s.ok === false).map((s) => ({ time_sec: s.start_sec, type: "句子被標", description: `${s.text}：${s.problem}` }))];
const problems = [];
if (flagged.length) problems.push(`${flagged.length} 處被標問題`);
if (cer > CER_MAX) problems.push(`CER ${(cer * 100).toFixed(1)}% > ${(CER_MAX * 100).toFixed(0)}%`);
Object.assign(rec, { status: problems.length ? "fail" : "pass", model: usedModel, refChars: ref.length, cer: +cer.toFixed(4), cerOps: ops.slice(0, 60), issues: flagged, sentences: res.sentences, transcript: res.transcript, problems });
fs.writeFileSync(jsonOut, JSON.stringify(rec, null, 2));
console.log(`聽感驗證（${usedModel}）：CER ${(cer * 100).toFixed(1)}%（${dist}/${ref.length}）；被標問題 ${flagged.length} 處`);
for (const f of flagged.slice(0, 12)) console.log(`  ⚑ ${Number(f.time_sec).toFixed(1)}s ${f.type}：${f.description}`);
for (const o of ops.slice(0, 12)) console.log(`  ✎ ${o.t}「${o.ref ?? ""}${o.hyp ? "→" + o.hyp : ""}」第 ${o.at} 字附近`);
if (problems.length) { console.error(`✖ 聽感驗證不通過：${problems.join("；")}`); process.exit(1); }
console.log("✔ 聽感驗證通過");

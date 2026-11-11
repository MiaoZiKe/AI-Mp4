// 音色試聽（只為挑音色用，不產正式配音）
//   NODE_USE_ENV_PROXY=1 node scripts/voice-audition.mjs <slug> --voices=Achird,Sulafat,... [--model=gemini-2.5-flash-preview-tts] [--style=...] [--skip-tts] [--skip-asr]
// 每個音色只送 1 次請求、不自動重試（免費額度每模型每天約 10 次）；遇到當日額度用完立即停止。
// 流程（亞里挑音色法）：同一句（第 1 幕 tts）各生成一段 → 存檔 → 量長度／字每秒／平均音高 → 聽寫轉回文字算 CER → 人耳決定。
// 輸出：out/<slug>/voice-samples/<Voice>.wav、audition.json
import fs from "node:fs";
import path from "node:path";
import { execFileSync, spawnSync } from "node:child_process";

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const args = process.argv.slice(2);
const opt = Object.fromEntries(args.filter((a) => a.startsWith("--") && a.includes("=")).map((a) => { const i = a.indexOf("="); return [a.slice(2, i), a.slice(i + 1)]; }));
const flags = new Set(args.filter((a) => a.startsWith("--") && !a.includes("=")));
const slug = args.find((a) => !a.startsWith("--"));
if (!slug || !opt.voices) { console.error("用法：node scripts/voice-audition.mjs <slug> --voices=A,B,C"); process.exit(2); }
const API = "https://generativelanguage.googleapis.com/v1beta";
const KEY = process.env.GEMINI_API_KEY || "injected-by-proxy";
const headers = { "Content-Type": "application/json", "x-goog-api-key": KEY };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const script = JSON.parse(fs.readFileSync(path.join(ROOT, "videos", slug, "script.json"), "utf8"));
const MODEL = opt.model || "gemini-2.5-flash-preview-tts";
const STYLE = (opt.style || script.voice?.style || "用親切、清晰的台灣國語").replace(/[。：:]+$/, "");
const first = script.scenes[0];
const text = first.tts ?? first.narration;
const subtitle = first.narration;
const styled = /gemini-2\.5/.test(MODEL);
const promptText = styled ? `${STYLE}說：\n${text}` : text;
const voices = opt.voices.split(",").map((s) => s.trim()).filter(Boolean);
const sdir = path.join(ROOT, "out", slug, "voice-samples");
fs.mkdirSync(sdir, { recursive: true });
const jsonPath = path.join(sdir, "audition.json");
const prev = fs.existsSync(jsonPath) ? JSON.parse(fs.readFileSync(jsonPath, "utf8")) : { rows: [] };
let requests = prev.requests ?? { tts: 0, asr: 0 };

const wavHeader = (n, rate) => { const b = Buffer.alloc(44); b.write("RIFF", 0); b.writeUInt32LE(36 + n, 4); b.write("WAVE", 8); b.write("fmt ", 12); b.writeUInt32LE(16, 16); b.writeUInt16LE(1, 20); b.writeUInt16LE(1, 22); b.writeUInt32LE(rate, 24); b.writeUInt32LE(rate * 2, 28); b.writeUInt16LE(2, 32); b.writeUInt16LE(16, 34); b.write("data", 36); b.writeUInt32LE(n, 40); return b; };

async function synth(voiceName, out) {
  const body = { contents: [{ parts: [{ text: promptText }] }], generationConfig: { responseModalities: ["AUDIO"], speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName } } } } };
  requests.tts++;
  const r = await fetch(`${API}/models/${MODEL}:generateContent`, { method: "POST", headers, body: JSON.stringify(body) });
  if (!r.ok) { const t = await r.text(); const e = new Error(`${r.status} ${t.replace(/\s+/g, " ").slice(0, 300)}`); e.daily = r.status === 429 && /PerDay/.test(t); throw e; }
  const j = await r.json();
  const part = j.candidates?.[0]?.content?.parts?.find((p) => p.inlineData);
  if (!part) throw new Error("回應沒有音訊：" + JSON.stringify(j).slice(0, 300));
  const buf = Buffer.from(part.inlineData.data, "base64");
  const rate = Number(/rate=(\d+)/.exec(part.inlineData.mimeType ?? "")?.[1] ?? 24000);
  fs.writeFileSync(out, buf.subarray(0, 4).toString() === "RIFF" ? buf : Buffer.concat([wavHeader(buf.length, rate), buf]));
}

async function transcribe(file) {
  const data = fs.readFileSync(file).toString("base64");
  for (const model of ["gemini-3.5-transcribe", "gemini-3.5-flash-lite"]) {
    const body = { contents: [{ parts: [{ inlineData: { mimeType: "audio/wav", data } }, { text: "請逐字聽寫這段台灣國語語音。只輸出聽到的文字（繁體中文，可含標點），不要加任何說明或前綴。" }] }], generationConfig: { temperature: 0 } };
    requests.asr++;
    const r = await fetch(`${API}/models/${model}:generateContent`, { method: "POST", headers, body: JSON.stringify(body) });
    if (r.ok) { const j = await r.json(); return { model, text: (j.candidates?.[0]?.content?.parts ?? []).map((p) => p.audioTranscription?.text ?? p.text ?? "").join("").trim() }; }
    console.warn(`  ASR ${model} ${r.status} ${(await r.text()).slice(0, 160)}`);
  }
  return { model: null, text: "" };
}

const norm = (s) => s.toLowerCase().replace(/[\s，。、！？：；「」『』（）,.!?:;()"'“”‘’…—\-–·]/g, "");
function cer(ref, hyp) {
  const a = [...norm(ref)], b = [...norm(hyp)];
  const d = Array.from({ length: a.length + 1 }, (_, i) => [i, ...new Array(b.length).fill(0)]);
  for (let j = 1; j <= b.length; j++) d[0][j] = j;
  for (let i = 1; i <= a.length; i++) for (let j = 1; j <= b.length; j++) d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
  return a.length ? d[a.length][b.length] / a.length : 0;
}
// 語速用「音節當量」：每個漢字 1、每個英文單字依母音群估音節（Strategy ≈ 3）
const syllables = (t) => (t.match(/[一-鿿]/g) ?? []).length + (t.match(/[A-Za-z]+/g) ?? []).reduce((s, w) => s + Math.max(1, (w.toLowerCase().match(/[aeiouy]+/g) ?? []).length), 0);
const measure = (file) => JSON.parse(execFileSync(path.join(ROOT, ".venv/bin/python"), ["-I", path.join(ROOT, "scripts", "voice-measure.py"), file]).toString());

const rows = new Map(prev.rows.map((r) => [r.voice, r]));
for (const v of voices) {
  const out = path.join(sdir, `${v}.wav`);
  const row = rows.get(v) ?? { voice: v };
  if (!flags.has("--skip-tts") && !fs.existsSync(out)) {
    try { await synth(v, out); console.log(`✔ TTS ${v}`); await sleep(7000); }
    catch (e) { row.error = e.message; rows.set(v, row); console.warn(`✖ ${v}: ${e.message}`); if (e.daily) break; continue; }
  }
  if (!fs.existsSync(out)) continue;
  Object.assign(row, measure(out));
  row.syl = syllables(text);
  row.sylPerSec = Number((row.syl / row.speechSec).toFixed(2));
  if (!flags.has("--skip-asr") && !row.asr) {
    const t = await transcribe(out);
    row.asr = t.text; row.asrModel = t.model;
    await sleep(3000);
  }
  if (row.asr) { row.cerVsTts = Number(cer(text, row.asr).toFixed(3)); row.cerVsSub = Number(cer(subtitle, row.asr).toFixed(3)); }
  row.file = out;
  delete row.error;
  rows.set(v, row);
  fs.writeFileSync(jsonPath, JSON.stringify({ slug, model: MODEL, style: STYLE, prompt: promptText, text, requests, rows: [...rows.values()] }, null, 2));
}
fs.writeFileSync(jsonPath, JSON.stringify({ slug, model: MODEL, style: STYLE, prompt: promptText, text, requests, rows: [...rows.values()] }, null, 2));
console.table([...rows.values()].map(({ voice, totalSec, speechSec, sylPerSec, f0Median, f0Iqr, cerVsTts, asr, error }) => ({ voice, totalSec, speechSec, sylPerSec, f0Median, f0Iqr, cerVsTts, asr, error })));
console.log("requests", requests);

// Gemini TTS 逐幕配音
//   npm run tts <slug>                 → public/audio/<slug>/NN-<id>.wav + videos/<slug>/tts-manifest.json（文字沒變就沿用）
//   npm run voices <slug>              → 用第 1 幕試聽所有候選音色 → out/<slug>/voice-samples/
//   npm run tts <slug> -- --force      → 全部重做；--only=id1,id2 只重做指定幕
//   npm run tts -- --list-models       → 列出可用的 TTS 模型（順便測金鑰）
// 金鑰：雲端環境的網路秘密（generativelanguage.googleapis.com / x-goog-api-key）由代理注入；本機可設 GEMINI_API_KEY。
// Node 原生 fetch 要走代理需 NODE_USE_ENV_PROXY=1（package.json 已帶）。
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { execFileSync } from "node:child_process";

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const args = process.argv.slice(2);
const flags = new Set(args.filter((a) => a.startsWith("--") && !a.includes("=")));
const opt = Object.fromEntries(args.filter((a) => a.startsWith("--") && a.includes("=")).map((a) => a.slice(2).split("=")));
const slug = args.find((a) => !a.startsWith("--"));
const API = "https://generativelanguage.googleapis.com/v1beta";
const KEY = process.env.GEMINI_API_KEY || "injected-by-proxy";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const PUNCT = /[\s，。、！？：；「」『』（）,.!?:;()"'“”‘’…—\-–·]/g;

const headers = { "Content-Type": "application/json", "x-goog-api-key": KEY };

if (flags.has("--list-models")) {
  const r = await fetch(`${API}/models?pageSize=200`, { headers });
  if (!r.ok) { console.error(`✖ ${r.status} ${(await r.text()).slice(0, 400)}`); process.exit(1); }
  const j = await r.json();
  const tts = (j.models ?? []).filter((m) => /tts/i.test(m.name) || (m.supportedGenerationMethods ?? []).some((x) => /audio|speech/i.test(x)));
  console.log(`共 ${j.models?.length ?? 0} 個模型，TTS 相關：`);
  for (const m of tts) console.log(`  ${m.name.replace("models/", "")}  —  ${m.displayName ?? ""}`);
  process.exit(0);
}
if (!slug) { console.error("用法：npm run tts <slug> [--force] [--only=id1,id2]｜npm run voices <slug>｜npm run tts -- --list-models"); process.exit(2); }

const dir = path.join(ROOT, "videos", slug);
const script = JSON.parse(fs.readFileSync(path.join(dir, "script.json"), "utf8"));
const voice = script.voice ?? {};
if (!voice.voiceName) { console.error("script.json 缺 voice.voiceName"); process.exit(2); }
const MODEL = process.env.TTS_MODEL || voice.model || "gemini-2.5-flash-preview-tts";
const STYLE_DEFAULT = "用台灣口音的國語，語氣親切、清晰、自然，像新聞科普主播在跟朋友解釋，語速稍快但每個字都清楚";
const prompt = (text) => `${voice.style || STYLE_DEFAULT}。只朗讀冒號後面的內容，不要唸出這句指示：\n${text}`;

async function synth(text, voiceName) {
  const body = {
    contents: [{ parts: [{ text: prompt(text) }] }],
    generationConfig: { responseModalities: ["AUDIO"], speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName } } } },
  };
  let lastErr;
  for (let i = 0; i < 5; i++) {
    const r = await fetch(`${API}/models/${MODEL}:generateContent`, { method: "POST", headers, body: JSON.stringify(body) });
    if (r.ok) {
      const j = await r.json();
      const part = j.candidates?.[0]?.content?.parts?.find((p) => p.inlineData);
      if (!part) { lastErr = new Error("回應沒有音訊：" + JSON.stringify(j).slice(0, 400)); break; }
      const rate = Number(/rate=(\d+)/.exec(part.inlineData.mimeType ?? "")?.[1] ?? 24000);
      return { pcm: Buffer.from(part.inlineData.data, "base64"), rate };
    }
    const txt = await r.text();
    lastErr = new Error(`${r.status} ${txt.slice(0, 300)}`);
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
const writeWav = (file, pcm, rate) => fs.writeFileSync(file, Buffer.concat([wavHeader(pcm.length, rate), pcm]));
const dur = (file) => Number(execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "default=nw=1:nk=1", file]).toString().trim());
/** 去頭尾靜音（各留 0.08/0.12 秒）+ 響度正規化 → 24kHz mono */
const polish = (raw, out) => execFileSync("ffmpeg", ["-y", "-loglevel", "error", "-i", raw, "-af",
  "silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.08,areverse,silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.12,areverse,loudnorm=I=-16:TP=-1.5:LRA=11",
  "-ar", "24000", "-ac", "1", out]);
const make = async (text, voiceName, abs) => {
  const { pcm, rate } = await synth(text, voiceName);
  const raw = abs.replace(/\.wav$/, ".raw.wav");
  writeWav(raw, pcm, rate); polish(raw, abs); fs.unlinkSync(raw);
  return dur(abs);
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
      const d = await make(text, v, out);
      rows.push({ voice: v, sec: Number(d.toFixed(2)), charsPerSec: Number((text.replace(PUNCT, "").length / d).toFixed(1)), file: path.relative(ROOT, out) });
      console.log(`✔ ${v} ${d.toFixed(2)}s`);
      await sleep(Number(process.env.TTS_DELAY_MS ?? 1500));
    } catch (e) { rows.push({ voice: v, error: e.message }); console.warn(`✖ ${v}: ${e.message}`); }
  }
  fs.writeFileSync(path.join(sdir, "samples.json"), JSON.stringify({ text, model: MODEL, rows }, null, 2));
  console.table(rows);
  process.exit(rows.some((r) => r.error) ? 1 : 0);
}

const only = opt.only ? new Set(opt.only.split(",")) : null;
const force = flags.has("--force");
const outDir = path.join(ROOT, "public", "audio", slug);
fs.mkdirSync(outDir, { recursive: true });
const manifestPath = path.join(dir, "tts-manifest.json");
const manifest = fs.existsSync(manifestPath) ? JSON.parse(fs.readFileSync(manifestPath, "utf8")) : { scenes: [] };
const entries = [];
let made = 0;
for (const [i, s] of script.scenes.entries()) {
  const text = s.tts ?? s.narration;
  const hash = crypto.createHash("sha1").update([MODEL, voice.voiceName, voice.style ?? "", text].join("\u0001")).digest("hex").slice(0, 12);
  const file = `audio/${slug}/${String(i + 1).padStart(2, "0")}-${s.id}.wav`;
  const abs = path.join(ROOT, "public", file);
  const prev = manifest.scenes.find((m) => m.id === s.id);
  const reusable = prev && fs.existsSync(abs) && prev.hash === hash;
  const wanted = force || (only ? only.has(s.id) : !reusable);
  if (!wanted && prev && fs.existsSync(abs)) { entries.push({ ...prev, file }); console.log(`= ${s.id}（沿用${prev.hash === hash ? "" : "，但文字已改，建議重做"}）`); continue; }
  process.stdout.write(`▶ ${String(i + 1).padStart(2, "0")} ${s.id}（${text.replace(PUNCT, "").length} 字）…`);
  const sec = await make(text, voice.voiceName, abs);
  entries.push({ id: s.id, file, sec: Number(sec.toFixed(3)), text, hash, voice: voice.voiceName, model: MODEL });
  made++;
  console.log(` ${sec.toFixed(2)}s`);
  fs.writeFileSync(manifestPath, JSON.stringify({ slug, model: MODEL, voiceName: voice.voiceName, style: voice.style ?? null, scenes: [...entries, ...manifest.scenes.filter((m) => !entries.some((e) => e.id === m.id))] }, null, 2));
  await sleep(Number(process.env.TTS_DELAY_MS ?? 1500));
}
fs.writeFileSync(manifestPath, JSON.stringify({ slug, model: MODEL, voiceName: voice.voiceName, style: voice.style ?? null, scenes: entries }, null, 2));
const total = entries.reduce((a, e) => a + e.sec, 0);
console.log(`✔ ${entries.length} 幕（新做 ${made}），配音合計 ${total.toFixed(1)} 秒 → ${path.relative(ROOT, manifestPath)}`);

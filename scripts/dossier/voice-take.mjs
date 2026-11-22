// 哩股哩股 dossier 片的配音一條龍：檢查念稿 → 送 TTS（整篇 1 次）→ 切掉說明句（只裁前後）→ 片頭 0.3 秒淡入 → 強制對齊接時間軸。
// 2026/11/22「聲音先定、畫面後排」：新流程不插停頓、不拉伸、不剪句內靜音，聲音本身就是定案；插停頓的舊做法只剩 --legacy-pauses（給舊片重跑）。
// 用法：node scripts/dossier/voice-take.mjs <slug> [--dry] [--from=<既有 orig.wav>] [--legacy-pauses]
//   --dry   只做念稿檢查（不送請求、不動檔案）
//   --from  跳過送 TTS，直接用給的 orig.wav（測試用，不花請求）
// 送請求需要環境變數：NODE_USE_ENV_PROXY=1 NODE_EXTRA_CA_CERTS=/root/.ccr/ca-bundle.crt（金鑰由代理帶入，不寫進檔案）
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "../..");
const args = process.argv.slice(2);
const slug = args.find((a) => !a.startsWith("--"));
const DRY = args.includes("--dry");
const LEGACY = args.includes("--legacy-pauses");
const FROM = args.find((a) => a.startsWith("--from="))?.slice(7);
if (!slug) { console.error("用法：node scripts/dossier/voice-take.mjs <slug> [--dry] [--from=<既有 orig.wav>]"); process.exit(2); }

const dir = path.join(ROOT, "videos", slug), adir = path.join(ROOT, "public/audio", slug);
const scriptPath = path.join(dir, "script.json");
const script = JSON.parse(fs.readFileSync(scriptPath, "utf8"));
const spoken = []; // 念稿幕（到第一個 silent／EndCard 為止）
for (const s of script.scenes) { if (s.silent || s.component === "EndCard") break; spoken.push(s); }
const texts = spoken.map((s) => (s.tts ?? s.narration).trim());

// ── 1. 念稿檢查 ──
console.log(`念稿（${slug}，${spoken.length} 幕）：`);
const errs = [];
spoken.forEach((s, k) => {
  const t = texts[k];
  console.log(`  [${s.id}] ${t}`);
  if (t.includes("欸")) errs.push(`${s.id}：含「欸」`);
  if (/A\s+I(?![A-Za-z])/.test(t)) errs.push(`${s.id}：「A I」拆字，請寫成「AI」`);
  if (/[0-9]/.test(t)) errs.push(`${s.id}：有阿拉伯數字，請改成唸法（${t.match(/[0-9][0-9.,%]*/g).join("、")}）`);
  for (const m of t.matchAll(/(^|[。？！?!]\s*)([A-Za-z])/g)) errs.push(`${s.id}：句首是英文字母「${m[2]}」，句首要先放中文字`);
});
if (errs.length) { console.error("\n✖ 念稿檢查未過，不送請求：\n" + errs.map((e) => "  - " + e).join("\n")); process.exit(1); }
console.log("✔ 念稿檢查通過（無「欸」、無句首英文字母、無「A I」、無阿拉伯數字）");
// 說明句：docs/prompts/liguligu-男聲試聽-短說明.txt 的那一行；script.json 的 voice.styleExtra（選填，2026/11/22）會接在「直接說：」前面（沒填就是原本那一句）
const BASE_STYLE = fs.readFileSync(path.join(ROOT, "docs/prompts/liguligu-男聲試聽-短說明.txt"), "utf8").split("\n").map((l) => l.trim()).find((l) => l.startsWith("用台灣人平常講話"));
if (!BASE_STYLE) { console.error("✖ 找不到說明句（docs/prompts/liguligu-男聲試聽-短說明.txt 以「用台灣人平常講話」開頭的那一行）"); process.exit(1); }
const EXTRA = String(script.voice?.styleExtra ?? "").trim().replace(/[，。、,.\s]+$/, "");
if (EXTRA && /[0-9A-Za-z「」"]/.test(EXTRA)) { console.error("✖ voice.styleExtra 只寫說話方式，不放數字、英文或引號（會被念出來）"); process.exit(1); }
const BASE_OVR = String(script.voice?.styleBase ?? "").trim();
if (BASE_OVR && /[0-9A-Za-z「」"]/.test(BASE_OVR)) { console.error("✖ voice.styleBase 只寫說話方式，不放數字、英文或引號"); process.exit(1); }
const BASE_USED = BASE_OVR || BASE_STYLE; // voice.styleBase（選填）取代基礎說明句，須以「直接說：」結尾
const STYLE = EXTRA ? BASE_USED.replace(/，?直接說：$/, `，${EXTRA}，直接說：`) : BASE_USED;
console.log(`說明句${EXTRA ? "（含 voice.styleExtra）" : ""}：${STYLE}`);
console.log(`念稿總字數（不含標點）：${texts.join("").replace(/[\s，。？！、；：,.?!]/g, "").length}`);
if (DRY) process.exit(0);

if (!FROM && (process.env.NODE_USE_ENV_PROXY !== "1" || !process.env.NODE_EXTRA_CA_CERTS)) {
  console.error("✖ 送請求前請設：NODE_USE_ENV_PROXY=1 NODE_EXTRA_CA_CERTS=/root/.ccr/ca-bundle.crt（不然不走代理、金鑰不會帶入）"); process.exit(1);
}

// ── wav 小工具（16-bit PCM）──
// Gemini 3.x 的 inlineData 是完整 WAV（RIFF 檔頭＋data＋尾端「C2PA」憑證區塊），不是裸 PCM。
// 2026/11/21 以前這裡把整包當 PCM：檔頭 44 bytes 變成開頭 1ms 喀聲、C2PA 區塊（約 7.7KB）變成旁白最後 0.16 秒 −8 dBFS 雜訊。
// 現在只取 data 區塊；舊的 orig.wav（外層檔頭包著內層 WAV）也會自動拆開。
const parseWav = (b, label) => {
  let o = 12, fmt = null, data = null;
  while (o + 8 <= b.length) {
    const id = b.toString("ascii", o, o + 4); let sz = b.readUInt32LE(o + 4);
    if (id === "data") sz = Math.min(sz, b.length - o - 8);
    if (id === "fmt ") fmt = { ch: b.readUInt16LE(o + 10), rate: b.readUInt32LE(o + 12), bits: b.readUInt16LE(o + 22) };
    if (id === "data") { data = b.subarray(o + 8, o + 8 + sz); break; }
    o += 8 + sz + (sz & 1);
  }
  if (!fmt || !data || fmt.bits !== 16) throw new Error("只支援 16-bit PCM wav：" + label);
  if (data.length > 44 && data.toString("ascii", 0, 4) === "RIFF" && data.toString("ascii", 8, 12) === "WAVE") return parseWav(data, label + "（內層 WAV）");
  return { ...fmt, pcm: data.subarray(0, data.length & ~1) };
};
const readWav = (p) => parseWav(fs.readFileSync(p), p);
const isRiff = (b) => b.length > 12 && b.toString("ascii", 0, 4) === "RIFF" && b.toString("ascii", 8, 12) === "WAVE";
const wavBuf = (pcm, rate, ch = 1) => {
  const h = Buffer.alloc(44); h.write("RIFF", 0); h.writeUInt32LE(36 + pcm.length, 4); h.write("WAVEfmt ", 8); h.writeUInt32LE(16, 16); h.writeUInt16LE(1, 20); h.writeUInt16LE(ch, 22);
  h.writeUInt32LE(rate, 24); h.writeUInt32LE(rate * 2 * ch, 28); h.writeUInt16LE(2 * ch, 32); h.writeUInt16LE(16, 34); h.write("data", 36); h.writeUInt32LE(pcm.length, 40);
  return Buffer.concat([h, pcm]);
};

const origPath = path.join(adir, "voice-api.orig.wav"), cutPath = path.join(adir, "voice-api.wav"), pausedPath = path.join(adir, "voice-api.paused.wav");
fs.mkdirSync(adir, { recursive: true });
const voiceName = script.voice?.voiceName ?? "Charon";
const sendText = STYLE + "\n" + texts.join("\n\n");
let model = script.voice?.model ?? "gemini-3.8-flash-tts", requests = 0;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const keepOld = (p) => {
  if (!fs.existsSync(p)) return;
  const mk = (n) => p.replace(/\.orig\.wav$/, `.v${n}.orig.wav`); let n = 1; while (fs.existsSync(mk(n))) n++;
  fs.renameSync(p, mk(n)); console.log(`  舊檔改名 → ${path.basename(mk(n))}`);
};

// ── 2. 送 TTS ──
if (FROM) {
  const src = path.resolve(ROOT, FROM);
  if (src !== origPath) { keepOld(origPath); fs.copyFileSync(src, origPath); }
  console.log(`--from：使用 ${FROM}，不送請求（模型記錄沿用 script.json：${model}）`);
} else {
  const tryModel = async (m) => {
    for (let k = 1; k <= 3; k++) {
      requests++;
      const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${m}:generateContent`, {
        method: "POST", headers: { "Content-Type": "application/json", "x-goog-api-key": "injected-by-proxy" },
        body: JSON.stringify({ contents: [{ parts: [{ text: sendText }] }], generationConfig: { responseModalities: ["AUDIO"], speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName } } } } }),
      });
      const j = await r.json().catch(() => null);
      const p = j?.candidates?.[0]?.content?.parts?.find((x) => x.inlineData);
      if (r.status === 200 && p) {
        const buf = Buffer.from(p.inlineData.data, "base64");
        if (isRiff(buf)) { const w = parseWav(buf, "TTS 回應"); return { pcm: w.pcm, rate: w.rate }; } // 只取 data，丟掉檔頭與 C2PA
        return { pcm: buf, rate: Number(/rate=(\d+)/.exec(p.inlineData.mimeType ?? "")?.[1] ?? 24000) };
      }
      console.error(`  ${m} 第 ${k} 次失敗：${r.status} ${String(j?.error?.message ?? j?.candidates?.[0]?.finishReason ?? "").slice(0, 160)}`);
      if (k < 3) { console.error("  等 120 秒重試…"); await sleep(120000); }
    }
    return null;
  };
  model = "gemini-3.8-flash-tts";
  let res = await tryModel(model);
  if (!res) { model = "gemini-2.5-flash-tts"; console.error("3.8 連續失敗，改用 gemini-2.5-flash-tts"); res = await tryModel(model); }
  if (!res) { console.error(`✖ TTS 失敗（共 ${requests} 次請求），沒有產出`); process.exit(1); }
  keepOld(origPath);
  fs.writeFileSync(origPath, wavBuf(res.pcm, res.rate));
  console.log(`✔ 已存 ${path.relative(ROOT, origPath)}（${model}，${requests} 次請求）`);
}

// ── 3. 強制對齊，切掉說明句 ──
const py = fs.existsSync(path.join(ROOT, ".venv/bin/python")) ? path.join(ROOT, ".venv/bin/python") : "python3";
const align = (file, text) => JSON.parse(execFileSync(py, [path.join(ROOT, "scripts/fa.py")], { input: JSON.stringify([{ id: "rec", file, text }]), cwd: ROOT, stdio: ["pipe", "pipe", "ignore"], maxBuffer: 1 << 26 }).toString())[0];
const rel = (p) => path.relative(ROOT, p);
const fa = align(rel(origPath), STYLE + texts.join(""));
if (!fa?.ok) { console.error("✖ 強制對齊失敗"); process.exit(1); }
const first = fa.units.find((u) => u.i >= STYLE.length);
if (!first) { console.error("✖ 對齊結果找不到念稿第一字"); process.exit(1); }
const wav = readWav(origPath); const sr = wav.rate;
const sampleAbs = (i) => { let m = 0; for (let c = 0; c < wav.ch; c++) m += Math.abs(wav.pcm.readInt16LE((i * wav.ch + c) * 2)); return m / wav.ch; };
let cutSec = 0;
if (first.start > 0.3) {
  // 起音前 0.07–0.15 秒之間找最安靜的 10ms 窗，切點取窗中心
  const a = Math.max(0, Math.round((first.start - 0.15) * sr)), b = Math.round((first.start - 0.07) * sr), w = Math.round(sr * 0.01);
  let best = a, bv = Infinity;
  for (let i = a; i + w <= b; i += Math.round(sr * 0.005)) { let s = 0; for (let k = 0; k < w; k++) s += sampleAbs(i + k); if (s / w < bv) { bv = s / w; best = i; } }
  cutSec = (best + w / 2) / sr;
  console.log(`  念稿首字「${first.ch}」起音 ${first.start.toFixed(2)} 秒；切點 ${cutSec.toFixed(3)} 秒（起音前 ${(first.start - cutSec).toFixed(2)} 秒，窗內平均振幅約 ${(20 * Math.log10(Math.max(bv, 1) / 32768)).toFixed(0)} dBFS）`);
  if (bv > 330) console.warn("  ⚠ 切點窗內不夠安靜（> −40 dBFS），請人耳確認首字沒被吃掉或殘留說明句");
} else console.log(`  首字起音 ${first.start.toFixed(2)} 秒，模型沒念說明句，不切`);
const rngState = { v: 12345 };
const noise = () => { rngState.v = (rngState.v * 1103515245 + 12345) & 0x7fffffff; return ((rngState.v >> 16) % 3) - 1; }; // ±1 LSB，約 −90 dBFS，不是數位 0
const cutSmp = Math.round(cutSec * sr);
let cutPcm = Buffer.from(wav.pcm.subarray(cutSmp * wav.ch * 2));
let tailTrimSec = 0, leadPadSec = 0, fadeInSec = 0;
if (LEGACY) {
  // 舊做法（只給舊片重跑）：切點後 20ms 淡入，後面交給 insert-pauses.py
  const fin = Math.min(Math.round(sr * 0.02), cutPcm.length / 2 / wav.ch);
  for (let i = 0; i < fin; i++) { const g = Math.sin((Math.PI / 2) * (i / fin)); for (let c = 0; c < wav.ch; c++) { const o = (i * wav.ch + c) * 2; cutPcm.writeInt16LE(Math.round(cutPcm.readInt16LE(o) * g), o); } }
} else {
  // 新做法：只允許整段前後裁切＋片頭淡入。
  // 尾端：最後一字起音後留 0.8 秒，之後裁掉（30ms 淡出）。
  const lastU = fa.units[fa.units.length - 1];
  const keepEnd = Math.round((lastU.start + 0.8 - cutSec) * sr);
  if (keepEnd > 0 && keepEnd < cutPcm.length / 2 / wav.ch) { tailTrimSec = (cutPcm.length / 2 / wav.ch - keepEnd) / sr; cutPcm = cutPcm.subarray(0, keepEnd * wav.ch * 2); const fo = Math.round(sr * 0.03), n = cutPcm.length / 2 / wav.ch; for (let i = 0; i < fo; i++) { const g = Math.cos((Math.PI / 2) * (i / fo)); for (let c = 0; c < wav.ch; c++) { const o = ((n - fo + i) * wav.ch + c) * 2; cutPcm.writeInt16LE(Math.round(cutPcm.readInt16LE(o) * g), o); } } }
  // 頭端：首字起音不到 0.36 秒就在前面補底噪（±1 LSB，不是 0），再對前 0.3 秒做淡入（淡入不超過首字前 0.03 秒）
  let leadSec = first.start - cutSec;
  if (leadSec < 0.36) { leadPadSec = 0.36 - leadSec; const padN = Math.round(leadPadSec * sr) * wav.ch, pad = Buffer.alloc(padN * 2); for (let i = 0; i < padN; i++) pad.writeInt16LE(noise(), i * 2); cutPcm = Buffer.concat([pad, cutPcm]); leadSec += leadPadSec; }
  fadeInSec = Math.min(0.3, leadSec - 0.03);
  const fi = Math.round(fadeInSec * sr);
  for (let i = 0; i < fi; i++) { const g = Math.sin((Math.PI / 2) * (i / fi)); for (let c = 0; c < wav.ch; c++) { const o = (i * wav.ch + c) * 2; const v = Math.round(cutPcm.readInt16LE(o) * g); cutPcm.writeInt16LE(Math.abs(v) < 1 ? noise() : v, o); } } // 淡入起點以 ±1 LSB 取代 0
  console.log(`  新流程（不插停頓、不拉伸）：片頭補底噪 ${leadPadSec.toFixed(2)} 秒、淡入 ${fadeInSec.toFixed(2)} 秒、尾端裁掉 ${tailTrimSec.toFixed(2)} 秒`);
}
fs.writeFileSync(cutPath, wavBuf(cutPcm, sr, wav.ch));

// ── 4. 接時間軸 ──
let pauseOut = "", nIns = 0, totalSec = NaN, finalPath = cutPath;
if (LEGACY) {
  pauseOut = execFileSync("python3", [path.join(ROOT, "scripts/dossier/insert-pauses.py"), slug, rel(cutPath), "--scene", "0.7", "--sentence", "0", "--max-scene", "6", "--lead", "0.4", "--out", rel(pausedPath)], { cwd: ROOT, maxBuffer: 1 << 26 }).toString();
  console.log(pauseOut.trimEnd());
  nIns = (pauseOut.match(/^\s+\+[\d.]+ 秒/gm) ?? []).length;
  const durM = /（([\d.]+) → ([\d.]+) 秒）/.exec(pauseOut); totalSec = durM ? Number(durM[2]) : NaN; finalPath = pausedPath;
} else { totalSec = +(cutPcm.length / 2 / wav.ch / sr).toFixed(2); }
const tlOut = execFileSync("node", [path.join(ROOT, "scripts/dossier/recording-timeline.mjs"), slug, `audio/${slug}/${path.basename(finalPath)}`, String(spoken.length)], { cwd: ROOT, maxBuffer: 1 << 26 }).toString();
console.log(tlOut.trimEnd().split("\n").slice(0, 3).join("\n"));

// 對齊信心最低的幕
const fa2 = align(rel(finalPath), texts.join(""));
let lowId = "?", lowC = 2, off = 0;
spoken.forEach((s, k) => {
  const us = fa2.units.filter((u) => u.i >= off && u.i < off + texts[k].length); off += texts[k].length;
  if (us.length) { const c = us.reduce((p, u) => p + u.score, 0) / us.length; if (c < lowC) { lowC = c; lowId = s.id; } }
});

const today = new Date(Date.now() + 8 * 3600e3).toISOString().slice(0, 10).replace(/-/g, "/");
const md = `
## ${today} voice-take.mjs 配音（${FROM ? `--from=${FROM}，未送請求` : `API ${requests} 次請求`}）
- 設定：${model}、${voiceName}、說明句＋各幕念稿（空一行）；原始錄音 \`public/audio/${slug}/voice-api.orig.wav\`（不進 git）。
- 切說明句：首字「${first.ch}」起音 ${first.start.toFixed(2)} 秒，切點 ${cutSec.toFixed(3)} 秒 → \`${path.basename(finalPath)}\`（${LEGACY ? `舊做法：插停頓 ${nIns} 處` : `新流程：不插停頓、不拉伸；片頭補底噪 ${leadPadSec.toFixed(2)} 秒、淡入 ${fadeInSec.toFixed(2)} 秒、尾端裁 ${tailTrimSec.toFixed(2)} 秒`}）${totalSec} 秒；對齊信心最低 ${lowId} ${lowC.toFixed(3)}。
- 送出的全文：

\`\`\`
${sendText}
\`\`\`
`;
fs.appendFileSync(path.join(dir, "voice.md"), md);

const raw = fs.readFileSync(scriptPath, "utf8");
script.voice = { ...(script.voice ?? {}), voiceName, model, mode: "take", profile: "liguligu", note: `voice-take.mjs（${today}，${FROM ? "--from" : requests + " 次請求"}）整篇一次生成，切說明句${LEGACY ? "、段落插靜音" : "（只裁前後，不插停頓、不拉伸）"}` };
const ind = [2, 1, 0].find((n) => { try { return JSON.stringify(JSON.parse(raw), null, n) === raw.trimEnd(); } catch { return false; } });
fs.writeFileSync(scriptPath, JSON.stringify(script, null, ind ?? 2) + (raw.endsWith("\n") ? "\n" : ""));
if (ind === undefined) console.warn("  ⚠ script.json 原本的排版不是標準縮排，已改成 2 格縮排（git diff 會比較大）");

console.log(`\n摘要：模型 ${model}｜請求 ${requests} 次｜切點 ${cutSec.toFixed(3)}s｜${LEGACY ? `插停頓 ${nIns} 處` : "不插停頓"}｜總長 ${totalSec}s｜對齊信心最低 ${lowId} ${lowC.toFixed(3)}`);

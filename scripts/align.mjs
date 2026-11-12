// npm run align <slug>：逐字時間戳 → videos/<slug>/timeline.json；回讀校驗報告 videos/<slug>/tts-check.md
// 需要先 npm run tts <slug>。
// 時間戳來源（ALIGN_PROVIDER=auto|fa|openai|gemini）：
//   fa：CTC 強制對齊（scripts/fa.py，MMS-300M forced-aligner；輸入念稿 tts 文字，再用 LCS 把念稿字映射回字幕字）→ provider "ctc-fa"
//       需要 .venv（pip install -r scripts/fa-requirements.txt），模型第一次從 huggingface.co 下載；FA_PYTHON 可指定 python
//   openai：Whisper word timestamps（OpenAI 金鑰由代理注入，帳戶要有額度）
//   gemini：Gemini 聽寫做回讀校驗 + ffmpeg 靜音偵測算每個字的時間（字在「說話時段」內均勻分布，停頓自動對上逗號斷行）
//   auto（預設）：先用 fa；整批或單幕失敗才回退 gemini+silence（Whisper 只在 ALIGN_PROVIDER=openai 時使用）
// fa 成功時預設不花 Gemini 聽寫額度（ALIGN_TRANSCRIBE=1 才另外做回讀聽寫算 CER）；對齊信心記在 timeline 與 tts-check.md
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { splitLines, splitPhrases, SUB_MAX_EM_V2, clean } from "./validate.mjs";
import { writeStoryboard } from "./subs.mjs";
import { norm, lcsAlign, runFA, geminiTranscribe, verifySection, CER_MAX, CONF_MIN } from "./verify.mjs";

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const slug = process.argv.slice(2).find((a) => !a.startsWith("--"));
const force = process.argv.includes("--force");
if (!slug) { console.error("用法：npm run align <slug> [--force]"); process.exit(2); }
const dir = path.join(ROOT, "videos", slug);
const script = JSON.parse(fs.readFileSync(path.join(dir, "script.json"), "utf8"));
const mp = path.join(dir, "tts-manifest.json");
if (!fs.existsSync(mp)) { console.error(`找不到 ${mp}，請先 npm run tts ${slug}`); process.exit(2); }
const manifest = JSON.parse(fs.readFileSync(mp, "utf8"));
const tlPath = path.join(dir, "timeline.json");
const prev = fs.existsSync(tlPath) ? JSON.parse(fs.readFileSync(tlPath, "utf8")) : null;
const OPENAI_KEY = process.env.OPENAI_API_KEY || "injected-by-proxy";
let PROVIDER = process.env.ALIGN_PROVIDER || "auto";
const FPS = 30, LEAD = 0.3, TAIL = 0.5, TAIL_END = 1.2, MIN = 3;
// styleVersion 2（時間軸 v2）：換幕人聲間隔 GAP 秒；轉場 TRANS 幀＝前一幕出場與本幕進場重疊，轉場結束＝本幕開口
// styleVersion 3 沿用時間軸 v2 的格式（timeline.version 仍是 2），另外兩件事只在 v3 生效（v1／v2 舊片輸出不變）：
//   1. 整篇一鏡到底的配音（tts-take.mjs）：換幕人聲間隔＝原始錄音裡的間隔（manifest 的 gapAfter，上限 GAP_MAX 秒）；
//      pauseAfter 在 v3 是「至少停這麼久」（原始間隔比較短才拉長）
//   2. 最後一幕可以沒有旁白（script 該幕 silent: true ＋ durationSec）：接在上一幕收聲之後，不放音檔
const V3 = script.styleVersion === 3;
const V2 = script.styleVersion === 2 || V3;
const GAP_MAX = Number(process.env.ALIGN_GAP_MAX ?? 0.8);
const GAP = Number(process.env.ALIGN_GAP ?? 0.15), TRANS = 10, TAIL_END_F = 18, SUB_LEAD = 3, MIN_SCENE_F = 45;
// v3 語意轉場（type 由 script.json 每幕 transition 決定，不由 align 輪替）：exit／enter＝出場淡出、進場淡入的幀區間（相對轉場開始）
const TRANSITIONS = { fade: { exit: [0, 5], enter: [3, 8] }, carry: { exit: [0, 5], enter: [3, 8] }, push: { exit: [0, 6], enter: [4, 10] }, slide: { exit: [0, 6], enter: [4, 10] }, flip: { exit: [0, 5], enter: [5, 10] } };
/** 幕尾編舞：出場起點不早於上一幕收聲 − EXIT_AFTER_VOICE 幀（主體在收聲後才走）；cue 早到上限（cue.ts READ_HOLD 12、CUE_LEAD 4） */
const EXIT_AFTER_VOICE = 2, READ_HOLD = 12, CUE_EARLY_MAX = 4;
const SKIP_TRANSCRIBE = process.env.ALIGN_SKIP_TRANSCRIBE === "1";
const TRANSCRIBE_WITH_FA = process.env.ALIGN_TRANSCRIBE === "1";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** OpenAI Whisper（word timestamps） */
async function whisper(file) {
  let lastErr;
  for (let i = 0; i < 3; i++) {
    const fd = new FormData();
    fd.append("file", new Blob([fs.readFileSync(file)], { type: "audio/wav" }), path.basename(file));
    fd.append("model", "whisper-1");
    fd.append("response_format", "verbose_json");
    fd.append("timestamp_granularities[]", "word");
    fd.append("language", "zh");
    fd.append("prompt", "以下是繁體中文的台灣新聞科普旁白。");
    const r = await fetch("https://api.openai.com/v1/audio/transcriptions", { method: "POST", headers: { Authorization: `Bearer ${OPENAI_KEY}` }, body: fd });
    if (r.ok) return r.json();
    const t = await r.text();
    lastErr = new Error(`${r.status} ${t.slice(0, 200)}`);
    lastErr.quota = /insufficient_quota|credit/i.test(t);
    if (lastErr.quota || r.status === 401 || r.status === 403) break;
    if (r.status === 429 || r.status >= 500) { await sleep(4000 * (i + 1)); continue; }
    break;
  }
  throw lastErr;
}

/** ffmpeg 靜音偵測 → 說話時段 [{s,e}] */
function speechSegments(file, total) {
  const out = spawnSync("ffmpeg", ["-i", file, "-af", "silencedetect=noise=-35dB:d=0.16", "-f", "null", "-"], { encoding: "utf8" }).stderr ?? "";
  const starts = [...out.matchAll(/silence_start: ([\d.]+)/g)].map((m) => Number(m[1]));
  const ends = [...out.matchAll(/silence_end: ([\d.]+)/g)].map((m) => Number(m[1]));
  const segs = [];
  let cur = 0;
  for (let i = 0; i < starts.length; i++) {
    if (starts[i] - cur > 0.05) segs.push({ s: cur, e: starts[i] });
    cur = ends[i] ?? total;
  }
  if (total - cur > 0.05) segs.push({ s: cur, e: total });
  return segs.length ? segs : [{ s: 0, e: total }];
}
/** 把 n 個字均勻鋪在說話時段內（跳過停頓）→ 每個字的 {t,e} */
function spreadChars(n, segs) {
  const T = segs.reduce((a, g) => a + (g.e - g.s), 0);
  const at = (frac) => { let acc = frac * T; for (const g of segs) { const d = g.e - g.s; if (acc <= d) return g.s + acc; acc -= d; } return segs[segs.length - 1].e; };
  return Array.from({ length: n }, (_, i) => ({ t: at(i / n), e: at((i + 1) / n) }));
}

/** 詞 → 字元序列（每個字在詞內線性內插時間） */
const charsFromWords = (words) => {
  const out = [];
  for (const w of words) {
    const cs = norm(w.word);
    if (!cs.length) continue;
    const span = Math.max(0.02, w.end - w.start);
    cs.forEach((c, i) => out.push({ c, t: w.start + (span * i) / cs.length, e: w.start + (span * (i + 1)) / cs.length }));
  }
  return out;
};
/** 沒對上的字元用前後錨點線性內插 */
const interpolateTimes = (map, b, n, total) => {
  const t = new Array(n);
  const known = [];
  map.forEach((j, i) => { if (j !== null) known.push(i); });
  for (let i = 0; i < n; i++) {
    if (map[i] !== null) { t[i] = b[map[i]].t; continue; }
    const prevK = known.filter((k) => k < i).pop();
    const nextK = known.find((k) => k > i);
    const t0 = prevK === undefined ? 0 : b[map[prevK]].e, i0 = prevK === undefined ? -1 : prevK;
    const t1 = nextK === undefined ? total : b[map[nextK]].t, i1 = nextK === undefined ? n : nextK;
    t[i] = t0 + ((t1 - t0) * (i - i0)) / (i1 - i0);
  }
  return t;
};

/** v1 快取沒有 charTimes：gemini+silence 的 words 就是逐字；否則從字幕點亮時間反推（chars = t + LEAD − 0.05） */
function timesFromV1(c, subChars) {
  if (c.words?.length === subChars.length) return c.words.map((w) => w.start);
  const out = [];
  for (const l of c.lines ?? []) [...l.text].forEach((ch, k) => { if (clean(ch).length) out.push(Math.max(0, Number((l.chars[k] - LEAD + 0.05).toFixed(3)))); });
  return out;
}
/** 音檔頭尾靜音（−40dB）→ 實際開口、收聲時間（秒，相對音檔） */
function speechBounds(file, total) {
  const out = spawnSync("ffmpeg", ["-i", file, "-af", "silencedetect=noise=-40dB:d=0.02", "-f", "null", "-"], { encoding: "utf8" }).stderr ?? "";
  const st = [...out.matchAll(/silence_start: (-?[\d.e-]+)/g)].map((m) => Number(m[1]));
  const en = [...out.matchAll(/silence_end: ([\d.e-]+)/g)].map((m) => Number(m[1]));
  let head = 0, tail = total;
  if (st.length && st[0] <= 0.01 && en[0] !== undefined) head = en[0];
  const k = st.length - 1;
  if (k >= 0 && (en[k] === undefined || en[k] >= total - 0.02) && st[k] > head) tail = st[k];
  return { head: Number(head.toFixed(3)), tail: Number(tail.toFixed(3)) };
}
/**
 * 時間軸 v2：唯一的排版計算。全部輸出絕對幀。
 *  - 第一幕音檔從第 0 幀開始；之後每幕「開口」＝前一幕「收聲」＋ GAP 秒（扣掉音檔頭尾靜音後的實際說話區間）
 *  - 本幕 startFrame ＝ 開口 − TRANS（轉場剛好在開口時完成：畫面比聲音早 0–200ms）
 *  - 前一幕 durationFrames 延伸到本幕轉場結束（重疊 TRANS 幀）
 *  - 限制：TRANS/30 ≤ TAIL + LEAD + 殘留靜音 − 0.08 ⇔ 相鄰人聲間隔 ≥ 0.08 秒（validate 檢查）
 */
function buildV2(cs) {
  const out = [];
  let prevEnd = null, prevGap = GAP;
  for (const [i, c] of cs.entries()) {
    if (c.silent) { // v3：無旁白的最後一幕（片尾卡）
      const p = out[i - 1];
      const startFrame = Math.max(p.startFrame + MIN_SCENE_F, p.voiceEndFrame - EXIT_AFTER_VOICE);
      out.push({ id: c.id, audio: null, audioFrame: startFrame, audioSec: 0, headSilSec: 0, tailSilSec: 0, startFrame, durationFrames: Math.max(MIN_SCENE_F, Math.round(c.durationSec * FPS)),
        transitionFrames: TRANS, transition: { type: "fade", frames: TRANS, ...TRANSITIONS.fade }, voiceStartFrame: startFrame + TRANS, voiceEndFrame: startFrame + TRANS, stillFrame: 0, silent: true, // 沒有人聲：兩個值都放在轉場結束那一幀，讀的人不會拿到 null
        subtitleWindow: null, sourceWindow: [startFrame + Math.ceil(TRANS / 2), 0], lines: [], keywords: [], isEnd: true, cues: [], sub: "" });
      continue;
    }
    const abs = path.join(ROOT, "public", c.audio);
    // v3 整篇模式：開口／收聲用 tts-take 量好的值（和 gapAfter 同一把尺），不重新偵測 → 排出來的節奏和原始錄音一致
    const b = V3 && c.take ? c.take : speechBounds(abs, c.audioSec);
    const sc = script.scenes.find((x) => x.id === c.id);
    const pause = typeof sc?.pauseAfter === "number" ? sc.pauseAfter : 0;
    // P0-4：換幕人聲間隔＝上一幕的 pauseAfter（有設定時，是「整個間隔」秒數），否則預設 GAP（0.15 秒）
    const audioFrame = i === 0 ? 0 : Math.max(0, Math.round((prevEnd + prevGap - b.head) * FPS));
    const vs = audioFrame / FPS + b.head, ve = audioFrame / FPS + b.tail;
    // v3 整篇模式：下一幕從「沒有取整的」收聲時間往後排，取整誤差（≤ 半幀）不會一幕一幕累積
    prevEnd = V3 && c.take ? (i === 0 ? b.tail : prevEnd + prevGap + (b.tail - b.head)) : ve;
    prevGap = pause > 0 ? pause : GAP;
    if (V3 && typeof c.gapAfter === "number") prevGap = Math.max(Math.min(c.gapAfter, GAP_MAX), pause); // 原始錄音的間隔
    const voiceStartFrame = Math.floor(vs * FPS), voiceEndFrame = Math.ceil(ve * FPS);
    const ttype = TRANSITIONS[sc?.transition] ? sc.transition : "fade";
    const transition = i === 0 ? null : { type: ttype, frames: TRANS, ...TRANSITIONS[ttype], ...(ttype === "carry" && sc?.carry ? { carry: sc.carry } : {}) };
    const prevStart = out[i - 1]?.startFrame ?? -Infinity;
    // 幕尾編舞：轉場起點＝max(開口 − TRANS, 上一幕收聲 − 2)：上一幕最後一個字念完前，主體不走
    const startFrame = i === 0 ? 0 : Math.max(prevStart + MIN_SCENE_F, voiceStartFrame - TRANS, (out[i - 1]?.voiceEndFrame ?? 0) - EXIT_AFTER_VOICE);
    // 字幕：每行、每個字（絕對幀；比聲音早 0.05 秒點亮，下一行早 0.12 秒出現）
    const subIn = i === 0 ? 0 : voiceStartFrame - SUB_LEAD;
    const af = (t, lead) => audioFrame + Math.round((t - lead) * FPS);
    const lines = [];
    if (!c.isEnd) {
      let idx = 0;
      // P1-4：v2 字幕是短語模式（一次一段），每段從第一個字被唸到前 0.12 秒出現
      for (const [li, l] of splitPhrases(c.sub, sc?.keywords ?? [], SUB_MAX_EM_V2).entries()) {
        const start = li === 0 ? subIn : Math.max(subIn, af(c.charTimes[idx] ?? 0, 0.12));
        let last = start;
        const chars = [...l].map((ch) => { if (clean(ch).length) { last = Math.max(start, af(c.charTimes[idx] ?? 0, 0.05)); idx++; } return last; });
        lines.push({ text: l, start, chars });
      }
    }
    const cl = clean(c.sub);
    // P0-8：cue（念到某個詞的那一幀，絕對幀；元件據此進場／focus）。text 在字幕（去標點）裡找第 occurrence 次出現
    const cues = (sc?.cues ?? []).map((q) => {
      const t = clean(q.text);
      let p = -1;
      for (let k = 0; k < (q.occurrence ?? 1); k++) p = cl.indexOf(t, p + 1);
      return { id: q.id, text: q.text, frame: p < 0 || c.charTimes[p] === undefined ? null : af(c.charTimes[p], 0) };
    });
    for (const q of cues) if (q.frame === null) console.warn(`⚠ ${c.id}: cue「${q.text}」不在字幕裡`);
    const keywords = (sc?.keywords ?? []).map((k) => { const p = cl.indexOf(clean(k)); return { text: k, start: p < 0 ? subIn : Math.max(subIn, af(c.charTimes[p], 0.05)) }; });
    out.push({ id: c.id, audio: c.audio, audioFrame, audioSec: c.audioSec, headSilSec: b.head, tailSilSec: Number((c.audioSec - b.tail).toFixed(3)),
      startFrame, durationFrames: 0, transitionFrames: i === 0 ? 0 : TRANS, transition, voiceStartFrame, voiceEndFrame, stillFrame: 0,
      subtitleWindow: c.isEnd ? null : [subIn, 0], sourceWindow: [i === 0 ? 0 : startFrame + Math.ceil(TRANS / 2), 0], pauseAfter: pause || undefined,
      lines, keywords, isEnd: c.isEnd,
      cues, hash: c.hash, sub: c.sub, provider: c.provider, cer: c.cer, fa: c.fa, transcript: c.transcript, words: c.words, charTimes: c.charTimes });
  }
  for (const [i, x] of out.entries()) {
    const n = out[i + 1];
    if (!x.silent) x.durationFrames = n ? n.startFrame + n.transitionFrames - x.startFrame : Math.max(MIN_SCENE_F, x.voiceEndFrame + TAIL_END_F - x.startFrame);
    x.stillFrame = n ? n.startFrame : x.startFrame + x.durationFrames - 12; // 下一幕轉場第 0 幀：本幕仍完全不透明、字幕全亮
    if (x.subtitleWindow) x.subtitleWindow[1] = n ? (n.subtitleWindow ? n.subtitleWindow[0] : n.startFrame + n.transitionFrames) : x.startFrame + x.durationFrames;
    x.sourceWindow[1] = n ? n.sourceWindow[0] : x.startFrame + x.durationFrames;
    delete x.isEnd;
  }
  // 幕尾編舞檢查：cue 早到（畫面比聲音早幾幀，受讀秒保護夾住）與出場起點
  for (const [i, x] of out.entries()) {
    const n = out[i + 1];
    if (!n || x.silent) continue;
    if (n.startFrame < x.voiceEndFrame - EXIT_AFTER_VOICE) console.warn(`⚠ ${x.id}: 出場起點 ${n.startFrame} 早於收聲 ${x.voiceEndFrame} − ${EXIT_AFTER_VOICE}`);
    for (const q of x.cues) if (q.frame !== null) {
      const early = Math.max(0, q.frame - (n.startFrame - READ_HOLD));
      q.early = early;
      if (early > CUE_EARLY_MAX) console.warn(`⚠ ${x.id}: cue「${q.text}」離出場只剩 ${n.startFrame - q.frame} 幀，畫面會早到 ${early} 幀（上限 ${CUE_EARLY_MAX}）：把 cue 指向較早的詞`);
    }
  }
  const last = out[out.length - 1];
  const totalFrames = last.startFrame + last.durationFrames;
  return { version: 2, slug, fps: FPS, totalFrames, totalSec: Number((totalFrames / FPS).toFixed(2)), gapSec: GAP, transitionFrames: TRANS, scenes: out };
}

/**
 * P0-4：整條人聲軌 voice.wav（48kHz mono）。每段依 audioFrame 放到絕對時間，再做一次兩段式 loudnorm（I −16、TP −1.5、LRA 11），
 * 不再逐段標準化 → 相鄰兩幕沒有響度跳動。Video.tsx（v2）只播這一條；scripts/mix.mjs 以它為人聲 stem。
 */
function buildVoiceStem(tl) {
  const rel = `audio/${slug}/voice.wav`, out = path.join(ROOT, "public", rel);
  const segs = tl.scenes.filter((x) => x.audio);
  const dur = (tl.totalFrames / FPS).toFixed(3);
  const inputs = segs.flatMap((x) => ["-i", path.join(ROOT, "public", x.audio)]);
  const graph = segs.map((x, k) => `[${k}:a]aresample=48000,adelay=${Math.round((x.audioFrame / FPS) * 1000)}:all=1[a${k}]`).join(";") +
    `;${segs.map((_, k) => `[a${k}]`).join("")}amix=inputs=${segs.length}:normalize=0:dropout_transition=0,apad,atrim=0:${dur}`;
  const LN = "I=-16:TP=-1.5:LRA=11";
  const p1 = spawnSync("ffmpeg", ["-hide_banner", ...inputs, "-filter_complex", `${graph},loudnorm=${LN}:print_format=json`, "-f", "null", "-"], { encoding: "utf8", maxBuffer: 64 << 20 });
  const m = /\{[^{}]*"input_i"[^{}]*\}/s.exec(p1.stderr ?? "");
  if (!m) { console.warn("⚠ voice.wav：loudnorm 第一段量測失敗，改用逐段音檔"); return null; }
  const j = JSON.parse(m[0]);
  const ln2 = `loudnorm=${LN}:measured_I=${j.input_i}:measured_TP=${j.input_tp}:measured_LRA=${j.input_lra}:measured_thresh=${j.input_thresh}:offset=${j.target_offset}:linear=true`;
  const p2 = spawnSync("ffmpeg", ["-y", "-loglevel", "error", ...inputs, "-filter_complex", `${graph},${ln2},aresample=48000`, "-ac", "1", "-c:a", "pcm_s16le", out], { encoding: "utf8" });
  if (p2.status !== 0) { console.warn(`⚠ voice.wav 失敗：${(p2.stderr ?? "").slice(0, 200)}`); return null; }
  console.log(`✔ 人聲軌 public/${rel}（整條 loudnorm：輸入 ${j.input_i} LUFS → −16）`);
  return { file: rel, lufsIn: Number(j.input_i), lufs: -16, sec: Number(dur) };
}

const scenes = [];
const cores = []; // v2：每幕的音檔＋逐字時間（相對音檔），最後統一排版
const report = [];
let usedProvider = null;
// 先決定哪些幕要重新對齊（文字、音檔、字幕都沒變就沿用快取），一次送進 fa.py
const isCached = (s, m) => {
  const cached = prev?.scenes?.find((x) => x.id === s.id);
  if (force || !cached || cached.hash !== m.hash || cached.sub !== s.subtitle.zh || !cached.provider) return false;
  return V2 ? Boolean(cached.charTimes || cached.words) : Boolean(cached.lines?.[0]?.chars);
};
const faJobs = [];
if (PROVIDER === "auto" || PROVIDER === "fa") {
  for (const s of script.scenes) {
    const m = manifest.scenes.find((x) => x.id === s.id);
    if (!m || !fs.existsSync(path.join(ROOT, "public", m.file)) || isCached(s, m)) continue;
    faJobs.push({ id: s.id, file: path.join(ROOT, "public", m.file), text: m.text });
  }
}
const FA = runFA(faJobs);
if (PROVIDER === "fa" && faJobs.some((j) => !FA[j.id])) { console.error("✖ ALIGN_PROVIDER=fa 但有幕對齊失敗"); process.exit(1); }
for (const [i, s] of script.scenes.entries()) {
  const m = manifest.scenes.find((x) => x.id === s.id);
  if (!m && V3 && s.silent && s.durationSec > 0 && i === script.scenes.length - 1) { cores.push({ id: s.id, silent: true, durationSec: s.durationSec }); continue; }
  if (!m) { console.warn(`⚠ ${s.id} 沒有配音（tts-manifest 缺），跳過`); continue; }
  const abs = path.join(ROOT, "public", m.file);
  if (!fs.existsSync(abs)) { console.warn(`⚠ ${s.id} 音檔不存在：${m.file}`); continue; }
  const cached = prev?.scenes?.find((x) => x.id === s.id);
  const subChars = norm(s.subtitle.zh);
  const spoken = norm(m.text);
  let times, transcript, words, cer, provider, unmatched = 0;
  if (V2 && !force && cached && cached.hash === m.hash && cached.sub === s.subtitle.zh && cached.provider && (cached.charTimes || cached.words)) {
    console.log(`= ${s.id}（沿用時間戳）`);
    cores.push({ ...cached, isEnd: s.component === "EndCard", charTimes: cached.charTimes ?? timesFromV1(cached, subChars), ...(V3 && typeof m.gapAfter === "number" ? { gapAfter: m.gapAfter } : {}), ...(V3 && typeof m.headSec === "number" ? { take: { head: m.headSec, tail: m.tailSec } } : {}) });
    report.push({ id: s.id, spoken: m.text, transcript: cached.transcript ?? "", cer: cached.cer ?? null, unmatched: 0, n: subChars.length, provider: cached.provider, fa: cached.fa });
    continue;
  }
  if (!V2 && !force && cached && cached.hash === m.hash && cached.sub === s.subtitle.zh && cached.lines?.[0]?.chars && cached.provider) {
    console.log(`= ${s.id}（沿用時間戳）`);
    scenes.push(cached); report.push({ id: s.id, spoken: m.text, transcript: cached.transcript ?? "", cer: cached.cer ?? 0, unmatched: 0, n: subChars.length, provider: cached.provider });
    continue;
  }
  process.stdout.write(`▶ ${String(i + 1).padStart(2, "0")} ${s.id} `);
  let fa = null;
  if (FA[s.id]) {
    // 念稿字（含時間）→ LCS 映射回字幕字；沒對上的字（例如「4%」對「四趴」）用前後錨點線性內插
    const r = FA[s.id];
    fa = { confidence: r.confidence, minScore: r.minScore, onsetMedianMs: r.onsetMedianMs, onsetMaxMs: r.onsetMaxMs, onsetCheck: r.onsetCheck };
    const b = r.units.flatMap((u) => norm(u.ch).map((c) => ({ c, t: u.start, e: u.end })));
    words = r.units.map((u) => ({ text: u.ch, start: u.start, end: u.end, score: u.score }));
    const { map } = lcsAlign(subChars, b);
    unmatched = map.filter((x) => x === null).length;
    times = interpolateTimes(map, b, subChars.length, m.sec);
    provider = "ctc-fa";
    transcript = "";
    cer = null;
    if (TRANSCRIBE_WITH_FA) {
      try { const tr = await geminiTranscribe(abs); transcript = tr.text; const tb = norm(transcript).map((c) => ({ c })); cer = spoken.length && tb.length ? 1 - lcsAlign(spoken, tb).matched / spoken.length : null; }
      catch (e) { console.warn(`  ⚠ Gemini 聽寫失敗：${e.message.slice(0, 100)}`); }
    }
    console.log(`CTC 對齊 ${r.units.length} 字，信心 ${r.confidence}（最低 ${r.minScore}），起音誤差中位 ${r.onsetMedianMs ?? "—"}ms`);
  }
  if (!times && PROVIDER === "openai") {
    try {
      const j = await whisper(abs);
      words = (j.words ?? []).map((w) => ({ text: w.word, start: Number(w.start.toFixed(3)), end: Number(w.end.toFixed(3)) }));
      transcript = j.text ?? "";
      const b = charsFromWords(j.words ?? []);
      cer = spoken.length ? 1 - lcsAlign(spoken, b).matched / spoken.length : 0;
      const { map } = lcsAlign(subChars, b);
      unmatched = map.filter((x) => x === null).length;
      times = interpolateTimes(map, b, subChars.length, m.sec);
      provider = "openai";
      console.log(`Whisper ${words.length} 詞`);
    } catch (e) {
      if (PROVIDER === "openai") throw e;
      console.log(`Whisper 不可用（${e.message.slice(0, 80)}）→ 改用 gemini`);
      PROVIDER = "gemini";
    }
  }
  if (!times) {
    transcript = "";
    if (SKIP_TRANSCRIBE) console.log("  ℹ ALIGN_SKIP_TRANSCRIBE=1，略過回讀聽寫");
    else try { const tr = await geminiTranscribe(abs); transcript = tr.text; if (!tr.model) console.log("  ℹ 無可用聽寫模型，略過回讀");
    } catch (e) { console.warn(`  ⚠ Gemini 聽寫失敗：${e.message.slice(0, 100)}`); }
    const tb = norm(transcript).map((c) => ({ c }));
    cer = spoken.length && tb.length ? 1 - lcsAlign(spoken, tb).matched / spoken.length : (tb.length ? 0 : 1);
    const segs = speechSegments(abs, m.sec);
    const sp = spreadChars(subChars.length, segs);
    times = sp.map((x) => x.t);
    words = subChars.map((c, k) => ({ text: c, start: Number(sp[k].t.toFixed(3)), end: Number(sp[k].e.toFixed(3)) }));
    provider = "gemini+silence";
    console.log(`Gemini 聽寫 + 靜音偵測（${segs.length} 段）`);
  }
  usedProvider = provider;
  const lines = splitLines(s.subtitle.zh);
  let idx = 0;
  const lineStarts = lines.map((l, li) => {
    const start = li === 0 ? 0 : Math.max(0, (times[idx] ?? 0) + LEAD - 0.12);
    let last = start;
    const chars = [...l].map((ch) => {
      if (clean(ch).length) { last = Math.max(start, (times[idx] ?? last) + LEAD - 0.05); idx++; }
      return Number(last.toFixed(3));
    });
    return { text: l, start: Number(start.toFixed(3)), chars };
  });
  const cs = clean(s.subtitle.zh);
  const keywords = (s.keywords ?? []).map((k) => {
    const p = cs.indexOf(clean(k));
    return { text: k, start: p < 0 ? 0 : Number(Math.max(0, times[p] + LEAD - 0.05).toFixed(3)) };
  });
  const isEnd = s.component === "EndCard";
  if (V2) { report.push({ id: s.id, spoken: m.text, transcript, cer, unmatched, n: subChars.length, provider, fa });
    cores.push({ id: s.id, audio: m.file, audioSec: m.sec, hash: m.hash, sub: s.subtitle.zh, provider, cer: cer == null ? null : Number(cer.toFixed(3)), transcript, words, charTimes: times.map((t) => Number(t.toFixed(3))), isEnd, fa, ...(V3 && typeof m.gapAfter === "number" ? { gapAfter: m.gapAfter } : {}), ...(V3 && typeof m.headSec === "number" ? { take: { head: m.headSec, tail: m.tailSec } } : {}) });
    continue; }
  const durationSec = Number(Math.max(MIN, LEAD + m.sec + (isEnd ? TAIL_END : TAIL)).toFixed(3));
  scenes.push({ id: s.id, audio: m.file, audioSec: m.sec, leadSec: LEAD, durationSec, hash: m.hash, sub: s.subtitle.zh, provider, cer: cer == null ? null : Number(cer.toFixed(3)), transcript, words, lines: lineStarts, keywords });
  report.push({ id: s.id, spoken: m.text, transcript, cer, unmatched, n: subChars.length, provider, fa });
}
let totalSec;
if (V2) {
  const tl = buildV2(cores);
  totalSec = tl.totalSec;
  const voice = buildVoiceStem(tl);
  if (voice) tl.voice = voice;
  fs.writeFileSync(tlPath, JSON.stringify(tl, null, 1));
  const gaps = tl.scenes.slice(1).filter((x) => !x.silent).map((x, k) => (x.voiceStartFrame - tl.scenes[k].voiceEndFrame) / FPS);
  console.log(`ℹ 時間軸 v2：${tl.totalFrames} 幀；換幕人聲間隔 ${Math.min(...gaps).toFixed(2)}–${Math.max(...gaps).toFixed(2)}s（目標 ${V3 ? "原始錄音的間隔" : GAP + "s"}），轉場 ${TRANS} 幀`);
} else {
  totalSec = Number(scenes.reduce((a, x) => a + Math.round(x.durationSec * FPS) / FPS, 0).toFixed(2));
  fs.writeFileSync(tlPath, JSON.stringify({ slug, fps: FPS, totalSec, scenes }, null, 1));
}
writeStoryboard(slug, script, JSON.parse(fs.readFileSync(tlPath, "utf8")));
const flagged = report.filter((r) => r.cer != null && r.cer > CER_MAX);
const lowConf = report.filter((r) => r.fa && r.fa.confidence < CONF_MIN);
const onsetErr = report.flatMap((r) => (r.fa?.onsetCheck ?? []).map((o) => Math.abs(o.errMs)));
const med = (a) => { if (!a.length) return null; const b = [...a].sort((x, y) => x - y); return b[Math.floor(b.length / 2)]; };
const pct = (x) => (x == null ? "—" : `${(x * 100).toFixed(0)}%${x > CER_MAX ? " ⚠" : ""}`);
const md = [`# 回讀校驗：${slug}`, "", `- 時間戳來源：${[...new Set(report.map((r) => r.provider))].join(", ")}；CER = 1 − LCS/稿長（簡繁已正規化、標點不計；ctc-fa 預設不做 Gemini 回讀聽寫，CER 以「—」表示）`,
  `- 總長 ${totalSec}s，${(V2 ? cores : scenes).length} 幕，CER > ${CER_MAX * 100}% 的幕：${flagged.length}；對齊信心 < 0.5 的幕：${lowConf.length}`,
  `- CTC 對齊信心＝每個念稿字的 CTC 後驗機率平均（0–1）。起音誤差＝停頓（≥0.12 秒、−40 dBFS）後第一個字的對齊起點 − 能量起音點：共 ${onsetErr.length} 點，中位數 ${med(onsetErr) ?? "—"}ms、最大 ${onsetErr.length ? Math.max(...onsetErr) : "—"}ms`, "",
  "| 幕 | 念稿 | 聽寫 | CER | 對齊信心（最低字） | 起音誤差 ms | 字幕未對上字數 |", "|---|---|---|---|---|---|---|",
  ...report.map((r) => `| ${r.id} | ${r.spoken} | ${r.transcript ?? ""} | ${pct(r.cer)} | ${r.fa ? `${r.fa.confidence}（${r.fa.minScore}）${r.fa.confidence < 0.5 ? " ⚠" : ""}` : "—"} | ${r.fa?.onsetCheck?.length ? r.fa.onsetCheck.map((o) => `${o.ch}${o.errMs >= 0 ? "+" : ""}${o.errMs}`).join(" ") : "—"} | ${r.unmatched}/${r.n} |`)].join("\n");
fs.writeFileSync(path.join(dir, "tts-check.md"), md + "\n" + verifySection(slug));
for (const r of lowConf) console.warn(`⚠ ${r.id} 對齊信心 ${r.fa.confidence}（念稿與音檔可能不符，請試聽）`);
for (const r of flagged) console.warn(`⚠ ${r.id} CER ${(r.cer * 100).toFixed(0)}%：念「${r.spoken}」聽寫「${r.transcript}」`);
console.log(`✔ ${path.relative(ROOT, tlPath)}  總長 ${totalSec}s（${(V2 ? cores : scenes).length} 幕，${usedProvider ?? "cache"}）；報告 videos/${slug}/tts-check.md`);

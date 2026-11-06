// npm run align <slug>：逐字時間戳 → videos/<slug>/timeline.json；回讀校驗報告 videos/<slug>/tts-check.md
// 需要先 npm run tts <slug>。
// 時間戳來源（ALIGN_PROVIDER=auto|openai|gemini）：
//   openai：Whisper word timestamps（最準；OpenAI 金鑰由代理注入，帳戶要有額度）
//   gemini：Gemini 聽寫做回讀校驗 + ffmpeg 靜音偵測算每個字的時間（字在「說話時段」內均勻分布，停頓自動對上逗號斷行）
//   auto：先試 openai，沒額度／失敗就改 gemini
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { splitLines, clean } from "./validate.mjs";

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
const GEMINI_KEY = process.env.GEMINI_API_KEY || "injected-by-proxy";
const GEMINI_MODEL = process.env.ALIGN_GEMINI_MODEL || "gemini-3.5-transcribe"; // 退場就改 gemini-3.8-flash
let PROVIDER = process.env.ALIGN_PROVIDER || "auto";
const FPS = 30, LEAD = 0.3, TAIL = 0.5, TAIL_END = 1.2, MIN = 3;
// styleVersion 2（時間軸 v2）：換幕人聲間隔 GAP 秒；轉場 TRANS 幀＝前一幕出場與本幕進場重疊，轉場結束＝本幕開口
const V2 = script.styleVersion === 2;
const GAP = Number(process.env.ALIGN_GAP ?? 0.15), TRANS = 9, EXIT = [0, 5], ENTER = [3, 8], TAIL_END_F = 36, SUB_LEAD = 3, MIN_SCENE_F = 45;
const SKIP_TRANSCRIBE = process.env.ALIGN_SKIP_TRANSCRIBE === "1"; // 不花 Gemini 文字額度：跳過回讀聽寫（時間戳仍用靜音偵測）
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// 簡→繁（聽寫偶爾輸出簡體），只為了對齊比對用
const S2T = "台臺 湾灣 国國 会會 们們 这這 个個 说說 经經 济濟 选選 举舉 党黨 发發 时時 间間 为為 么麼 对對 后後 际際 币幣 买買 卖賣 价價 涨漲 亿億 万萬 点點 两兩 东東 产產 业業 关關 系係 还還 没沒 过過 从從 开開 长長 变變 来來 现現 实實 问問 题題 决決 议議 结結 层層 并並 连連 让讓 该該 将將 体體 应應 质質 术術 规規 则則 电電 车車 机機 构構 资資 费費 数數 据據 岁歲 养養 儿兒 难難 压壓 员員 众眾 参參 县縣 区區 总總 统統 领領 导導 计計 划劃 够夠 听聽 见見 觉覺 认認 识識 学學 习習 书書 读讀 写寫 门門 几幾 样樣 种種 类類 组組 织織 权權 义義 务務 场場 态態 势勢 热熱 处處 乐樂 药藥 医醫 疗療 护護 险險 税稅 贷貸 债債 储儲 备備 换換 转轉 输輸 运運 网網 络絡 线線 链鏈 块塊 锁鎖 钱錢 银銀 账賬 户戶 号號 单單 优優 级級 标標 准準 达達 预預 测測 报報 闻聞 调調 显顯 图圖 础礎 设設 环環 节節 约約 减減 龄齡 妇婦 爱愛 庆慶 园園 补補 贴貼 薪薪 贵貴 维維 诉訴 请請 届屆 办辦 临臨";
const s2t = Object.fromEntries(S2T.split(" ").map((p) => [p[0], p[1]]));
const norm = (s) => [...clean(s)].map((c) => s2t[c] ?? c);

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

/** Gemini 聽寫（只要文字，做回讀校驗）。免費額度每模型每天有限：某模型當日額度用完就換下一個，全部用完就跳過（不影響時間軸） */
const TRANSCRIBE_MODELS = [GEMINI_MODEL, "gemini-3.5-flash-lite", "gemini-flash-lite-latest", "gemini-3.1-flash-lite"].filter((m, i, a) => a.indexOf(m) === i);
const dead = new Set();
async function geminiTranscribe(file) {
  const data = fs.readFileSync(file).toString("base64");
  for (const model of TRANSCRIBE_MODELS) {
    if (dead.has(model)) continue;
    const body = {
      contents: [{ parts: [
        { inlineData: { mimeType: "audio/wav", data } },
        { text: "請逐字聽寫這段台灣國語語音。只輸出聽到的文字（繁體中文，可含標點），不要加任何說明或前綴。" },
      ] }],
      generationConfig: { temperature: 0 },
    };
    for (let i = 0; i < 3; i++) {
      const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, { method: "POST", headers: { "Content-Type": "application/json", "x-goog-api-key": GEMINI_KEY }, body: JSON.stringify(body) });
      if (r.ok) { const j = await r.json(); return { model, text: (j.candidates?.[0]?.content?.parts ?? []).map((p) => p.audioTranscription?.text ?? p.text ?? "").join("").trim() }; }
      const t = await r.text();
      if (r.status === 429 && /PerDay|quota/i.test(t) && !/PerMinute/.test(t)) { dead.add(model); console.log(`\n  ℹ ${model} 今日額度用完 → 換下一個`); break; }
      if (r.status === 404) { dead.add(model); break; }
      if (r.status === 429 || r.status >= 500) { await sleep(5000 * (i + 1)); continue; }
      dead.add(model); break;
    }
  }
  return { model: null, text: "" };
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
/** LCS 對齊：a = 稿子字元，b = 轉錄字元（含時間）；回傳每個稿子字元對應的 b 索引（或 null）與配對數 */
const lcsAlign = (a, b) => {
  const n = a.length, m = b.length;
  const dp = Array.from({ length: n + 1 }, () => new Int16Array(m + 1));
  for (let i = n - 1; i >= 0; i--) for (let j = m - 1; j >= 0; j--) dp[i][j] = a[i] === b[j].c ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
  const map = new Array(n).fill(null);
  let i = 0, j = 0;
  while (i < n && j < m) {
    if (a[i] === b[j].c) { map[i] = j; i++; j++; }
    else if (dp[i + 1][j] >= dp[i][j + 1]) i++;
    else j++;
  }
  return { map, matched: dp[0][0] };
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
  let prevEnd = null;
  for (const [i, c] of cs.entries()) {
    const abs = path.join(ROOT, "public", c.audio);
    const b = speechBounds(abs, c.audioSec);
    const sc = script.scenes.find((x) => x.id === c.id);
    const pause = typeof sc?.pauseAfter === "number" ? sc.pauseAfter : 0;
    const audioFrame = i === 0 ? 0 : Math.max(0, Math.round((prevEnd + GAP - b.head) * FPS));
    const vs = audioFrame / FPS + b.head, ve = audioFrame / FPS + b.tail;
    prevEnd = ve + pause;
    const voiceStartFrame = Math.floor(vs * FPS), voiceEndFrame = Math.ceil(ve * FPS);
    const transition = i === 0 ? null : { type: sc?.transition === "slide" ? "slide" : "fade", frames: TRANS, exit: EXIT, enter: ENTER };
    const prevStart = out[i - 1]?.startFrame ?? -Infinity;
    const startFrame = i === 0 ? 0 : Math.max(prevStart + MIN_SCENE_F, voiceStartFrame - TRANS);
    // 字幕：每行、每個字（絕對幀；比聲音早 0.05 秒點亮，下一行早 0.12 秒出現）
    const subIn = i === 0 ? 0 : voiceStartFrame - SUB_LEAD;
    const af = (t, lead) => audioFrame + Math.round((t - lead) * FPS);
    const lines = [];
    if (!c.isEnd) {
      let idx = 0;
      for (const [li, l] of splitLines(c.sub).entries()) {
        const start = li === 0 ? subIn : Math.max(subIn, af(c.charTimes[idx] ?? 0, 0.12));
        let last = start;
        const chars = [...l].map((ch) => { if (clean(ch).length) { last = Math.max(start, af(c.charTimes[idx] ?? 0, 0.05)); idx++; } return last; });
        lines.push({ text: l, start, chars });
      }
    }
    const cl = clean(c.sub);
    const keywords = (sc?.keywords ?? []).map((k) => { const p = cl.indexOf(clean(k)); return { text: k, start: p < 0 ? subIn : Math.max(subIn, af(c.charTimes[p], 0.05)) }; });
    out.push({ id: c.id, audio: c.audio, audioFrame, audioSec: c.audioSec, headSilSec: b.head, tailSilSec: Number((c.audioSec - b.tail).toFixed(3)),
      startFrame, durationFrames: 0, transitionFrames: i === 0 ? 0 : TRANS, transition, voiceStartFrame, voiceEndFrame, stillFrame: 0,
      subtitleWindow: c.isEnd ? null : [subIn, 0], sourceWindow: [i === 0 ? 0 : startFrame + Math.ceil(TRANS / 2), 0], pauseAfter: pause || undefined,
      lines, keywords, isEnd: c.isEnd,
      hash: c.hash, sub: c.sub, provider: c.provider, cer: c.cer, transcript: c.transcript, words: c.words, charTimes: c.charTimes });
  }
  for (const [i, x] of out.entries()) {
    const n = out[i + 1];
    x.durationFrames = n ? n.startFrame + n.transitionFrames - x.startFrame : Math.max(MIN_SCENE_F, x.voiceEndFrame + TAIL_END_F - x.startFrame);
    x.stillFrame = n ? n.startFrame : x.startFrame + x.durationFrames - 12; // 下一幕轉場第 0 幀：本幕仍完全不透明、字幕全亮
    if (x.subtitleWindow) x.subtitleWindow[1] = n ? (n.subtitleWindow ? n.subtitleWindow[0] : n.startFrame + n.transitionFrames) : x.startFrame + x.durationFrames;
    x.sourceWindow[1] = n ? n.sourceWindow[0] : x.startFrame + x.durationFrames;
    delete x.isEnd;
  }
  const last = out[out.length - 1];
  const totalFrames = last.startFrame + last.durationFrames;
  return { version: 2, slug, fps: FPS, totalFrames, totalSec: Number((totalFrames / FPS).toFixed(2)), gapSec: GAP, transitionFrames: TRANS, scenes: out };
}

const scenes = [];
const cores = []; // v2：每幕的音檔＋逐字時間（相對音檔），最後統一排版
const report = [];
let usedProvider = null;
for (const [i, s] of script.scenes.entries()) {
  const m = manifest.scenes.find((x) => x.id === s.id);
  if (!m) { console.warn(`⚠ ${s.id} 沒有配音（tts-manifest 缺），跳過`); continue; }
  const abs = path.join(ROOT, "public", m.file);
  if (!fs.existsSync(abs)) { console.warn(`⚠ ${s.id} 音檔不存在：${m.file}`); continue; }
  const cached = prev?.scenes?.find((x) => x.id === s.id);
  const subChars = norm(s.subtitle.zh);
  const spoken = norm(m.text);
  let times, transcript, words, cer, provider, unmatched = 0;
  if (V2 && !force && cached && cached.hash === m.hash && cached.sub === s.subtitle.zh && cached.provider && (cached.charTimes || cached.words)) {
    console.log(`= ${s.id}（沿用時間戳）`);
    cores.push({ ...cached, isEnd: s.component === "EndCard", charTimes: cached.charTimes ?? timesFromV1(cached, subChars) });
    report.push({ id: s.id, spoken: m.text, transcript: cached.transcript ?? "", cer: cached.cer ?? 0, unmatched: 0, n: subChars.length, provider: cached.provider });
    continue;
  }
  if (!V2 && !force && cached && cached.hash === m.hash && cached.sub === s.subtitle.zh && cached.lines?.[0]?.chars && cached.provider) {
    console.log(`= ${s.id}（沿用時間戳）`);
    scenes.push(cached); report.push({ id: s.id, spoken: m.text, transcript: cached.transcript ?? "", cer: cached.cer ?? 0, unmatched: 0, n: subChars.length, provider: cached.provider });
    continue;
  }
  process.stdout.write(`▶ ${String(i + 1).padStart(2, "0")} ${s.id} `);
  if (PROVIDER === "auto" || PROVIDER === "openai") {
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
  if (V2) { report.push({ id: s.id, spoken: m.text, transcript, cer, unmatched, n: subChars.length, provider });
    cores.push({ id: s.id, audio: m.file, audioSec: m.sec, hash: m.hash, sub: s.subtitle.zh, provider, cer: Number(cer.toFixed(3)), transcript, words, charTimes: times.map((t) => Number(t.toFixed(3))), isEnd });
    continue; }
  const durationSec = Number(Math.max(MIN, LEAD + m.sec + (isEnd ? TAIL_END : TAIL)).toFixed(3));
  scenes.push({ id: s.id, audio: m.file, audioSec: m.sec, leadSec: LEAD, durationSec, hash: m.hash, sub: s.subtitle.zh, provider, cer: Number(cer.toFixed(3)), transcript, words, lines: lineStarts, keywords });
  report.push({ id: s.id, spoken: m.text, transcript, cer, unmatched, n: subChars.length, provider });
}
let totalSec;
if (V2) {
  const tl = buildV2(cores);
  totalSec = tl.totalSec;
  fs.writeFileSync(tlPath, JSON.stringify(tl, null, 1));
  const gaps = tl.scenes.slice(1).map((x, k) => (x.voiceStartFrame - tl.scenes[k].voiceEndFrame) / FPS);
  console.log(`ℹ 時間軸 v2：${tl.totalFrames} 幀；換幕人聲間隔 ${Math.min(...gaps).toFixed(2)}–${Math.max(...gaps).toFixed(2)}s（目標 ${GAP}s），轉場 ${TRANS} 幀`);
} else {
  totalSec = Number(scenes.reduce((a, x) => a + Math.round(x.durationSec * FPS) / FPS, 0).toFixed(2));
  fs.writeFileSync(tlPath, JSON.stringify({ slug, fps: FPS, totalSec, scenes }, null, 1));
}
const flagged = report.filter((r) => r.cer > 0.2);
const md = [`# 回讀校驗：${slug}`, "", `- 時間戳來源：${[...new Set(report.map((r) => r.provider))].join(", ")}；CER = 1 − LCS/稿長（簡繁已正規化、標點不計）`, `- 總長 ${totalSec}s，${scenes.length} 幕，CER > 20% 的幕：${flagged.length}`, "",
  "| 幕 | 念稿 | 聽寫 | CER | 字幕未對上字數 |", "|---|---|---|---|---|",
  ...report.map((r) => `| ${r.id} | ${r.spoken} | ${r.transcript} | ${(r.cer * 100).toFixed(0)}% ${r.cer > 0.2 ? "⚠" : ""} | ${r.unmatched}/${r.n} |`)].join("\n");
fs.writeFileSync(path.join(dir, "tts-check.md"), md + "\n");
for (const r of flagged) console.warn(`⚠ ${r.id} CER ${(r.cer * 100).toFixed(0)}%：念「${r.spoken}」聽寫「${r.transcript}」`);
console.log(`✔ ${path.relative(ROOT, tlPath)}  總長 ${totalSec}s（${(V2 ? cores : scenes).length} 幕，${usedProvider ?? "cache"}）；報告 videos/${slug}/tts-check.md`);

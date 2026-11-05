// npm run align <slug>：OpenAI Whisper 逐字時間戳 → videos/<slug>/timeline.json；回讀校驗報告 videos/<slug>/tts-check.md
// 需要先 npm run tts <slug>。OpenAI 金鑰由代理注入（api.openai.com），本機可設 OPENAI_API_KEY。
import fs from "node:fs";
import path from "node:path";
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
const KEY = process.env.OPENAI_API_KEY || "injected-by-proxy";
const FPS = 30, LEAD = 0.3, TAIL = 0.5, TAIL_END = 1.2, MIN = 3;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// 簡→繁（Whisper 偶爾輸出簡體），只為了對齊比對用
const S2T = "台臺 湾灣 国國 会會 们們 这這 个個 说說 经經 济濟 选選 举舉 党黨 发發 时時 间間 为為 么麼 对對 后後 际際 币幣 买買 卖賣 价價 涨漲 亿億 万萬 点點 两兩 东東 产產 业業 关關 系係 还還 没沒 过過 从從 开開 长長 变變 来來 现現 实實 问問 题題 决決 议議 结結 层層 并並 连連 让讓 该該 将將 体體 应應 质質 术術 规規 则則 电電 车車 机機 构構 资資 费費 数數 据據 岁歲 养養 儿兒 难難 压壓 剩剩 议議 员員 众眾 参參 县縣 区區 总總 统統 领領 导導 应應 该該 计計 划劃 划劃 够夠 听聽 见見 觉覺 认認 识識 学學 习習 书書 读讀 写寫 门門 几幾 么麼 样樣 种種 类類 组組 织織 权權 利利 义義 务務 场場 态態 势勢 热熱 处處 乐樂 药藥 医醫 疗療 护護 险險 税稅 贷貸 债債 债債 储儲 备備 换換 转轉 输輸 运運 输輸 网網 络絡 线線 链鏈 块塊 锁鎖 钱錢 银銀 账賬 户戶 号號 单單 优優 级級 标標 准準 达達 预預 测測 估估 报報 导導 闻聞 调調 查查 显顯 示示 图圖 表表 础礎 设設 备備 环環 境境 节節 约約 减減 增增 龄齡 妇婦 婚婚 爱愛 庆慶 庭庭 园園 幼幼 托托 补補 贴貼 补補 助助 薪薪 资資 价價 房房 贵貴 买買 租租 维維 诉訴 请請 应應 届屆 办辦 届屆 临臨 时時 届屆";
const s2t = Object.fromEntries(S2T.split(" ").map((p) => [p[0], p[1]]));
const norm = (s) => [...clean(s)].map((c) => s2t[c] ?? c);

async function transcribe(file) {
  let lastErr;
  for (let i = 0; i < 4; i++) {
    const fd = new FormData();
    fd.append("file", new Blob([fs.readFileSync(file)], { type: "audio/wav" }), path.basename(file));
    fd.append("model", "whisper-1");
    fd.append("response_format", "verbose_json");
    fd.append("timestamp_granularities[]", "word");
    fd.append("language", "zh");
    fd.append("prompt", "以下是繁體中文的台灣新聞科普旁白。");
    const r = await fetch("https://api.openai.com/v1/audio/transcriptions", { method: "POST", headers: { Authorization: `Bearer ${KEY}` }, body: fd });
    if (r.ok) return r.json();
    const t = await r.text();
    lastErr = new Error(`${r.status} ${t.slice(0, 300)}`);
    if (r.status === 429 || r.status >= 500) { await sleep(4000 * (i + 1)); continue; }
    break;
  }
  throw lastErr;
}

/** Whisper 詞 → 字元序列（每個字在詞內線性內插時間） */
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

const scenes = [];
const report = [];
for (const [i, s] of script.scenes.entries()) {
  const m = manifest.scenes.find((x) => x.id === s.id);
  if (!m) { console.warn(`⚠ ${s.id} 沒有配音（tts-manifest 缺），跳過`); continue; }
  const abs = path.join(ROOT, "public", m.file);
  if (!fs.existsSync(abs)) { console.warn(`⚠ ${s.id} 音檔不存在：${m.file}`); continue; }
  const cached = prev?.scenes?.find((x) => x.id === s.id);
  let words, transcript;
  if (!force && cached && cached.hash === m.hash && cached.words) { words = cached.words.map((w) => ({ word: w.text, start: w.start, end: w.end })); transcript = cached.transcript ?? ""; console.log(`= ${s.id}（沿用時間戳）`); }
  else {
    process.stdout.write(`▶ ${String(i + 1).padStart(2, "0")} ${s.id} Whisper…`);
    const j = await transcribe(abs);
    words = j.words ?? [];
    transcript = j.text ?? "";
    console.log(` ${words.length} 詞`);
  }
  const b = charsFromWords(words);
  const spoken = norm(m.text);
  const { matched } = lcsAlign(spoken, b);
  const cer = spoken.length ? 1 - matched / spoken.length : 0;
  const subChars = norm(s.subtitle.zh);
  const { map } = lcsAlign(subChars, b);
  const times = interpolateTimes(map, b, subChars.length, m.sec);
  const lines = splitLines(s.subtitle.zh);
  let idx = 0;
  const lineStarts = lines.map((l, li) => {
    const start = li === 0 ? 0 : Math.max(0, (times[idx] ?? 0) + LEAD - 0.12);
    idx += clean(l).length;
    return { text: l, start: Number(start.toFixed(3)) };
  });
  const cs = clean(s.subtitle.zh);
  const keywords = (s.keywords ?? []).map((k) => {
    const p = cs.indexOf(clean(k));
    return { text: k, start: p < 0 ? 0 : Number(Math.max(0, times[p] + LEAD - 0.05).toFixed(3)) };
  });
  const isEnd = s.component === "EndCard";
  const durationSec = Number(Math.max(MIN, LEAD + m.sec + (isEnd ? TAIL_END : TAIL)).toFixed(3));
  scenes.push({ id: s.id, audio: m.file, audioSec: m.sec, leadSec: LEAD, durationSec, hash: m.hash, cer: Number(cer.toFixed(3)), transcript,
    words: words.map((w) => ({ text: w.word, start: Number(w.start.toFixed(3)), end: Number(w.end.toFixed(3)) })), lines: lineStarts, keywords });
  report.push({ id: s.id, spoken: m.text, transcript, cer, unmatched: map.filter((x) => x === null).length, n: subChars.length });
}
const totalSec = Number(scenes.reduce((a, x) => a + Math.round(x.durationSec * FPS) / FPS, 0).toFixed(2));
fs.writeFileSync(tlPath, JSON.stringify({ slug, fps: FPS, totalSec, scenes }, null, 1));
const flagged = report.filter((r) => r.cer > 0.2);
const md = [`# 回讀校驗：${slug}`, "", `- 工具：OpenAI whisper-1（word timestamps）；CER = 1 − LCS/稿長（簡繁已正規化、標點不計）`, `- 總長 ${totalSec}s，${scenes.length} 幕，CER > 20% 的幕：${flagged.length}`, "",
  "| 幕 | 念稿 | Whisper 轉錄 | CER | 字幕未對上字數 |", "|---|---|---|---|---|",
  ...report.map((r) => `| ${r.id} | ${r.spoken} | ${r.transcript} | ${(r.cer * 100).toFixed(0)}% ${r.cer > 0.2 ? "⚠" : ""} | ${r.unmatched}/${r.n} |`)].join("\n");
fs.writeFileSync(path.join(dir, "tts-check.md"), md + "\n");
for (const r of flagged) console.warn(`⚠ ${r.id} CER ${(r.cer * 100).toFixed(0)}%：念「${r.spoken}」轉錄「${r.transcript}」`);
console.log(`✔ ${path.relative(ROOT, tlPath)}  總長 ${totalSec}s（${scenes.length} 幕）；報告 videos/${slug}/tts-check.md`);

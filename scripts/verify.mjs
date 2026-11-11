// 配音回讀校驗（tts.mjs 與 align.mjs 共用）
//   fa：CTC 強制對齊信心（scripts/fa.py，本機跑、不花 Gemini 請求）——信心 < CONF_MIN 表示念稿與音檔可能不符（漏字、多字、念錯）
//   asr：Gemini 聽寫 → CER = 1 − LCS/稿長（花 Gemini 文字模型請求，不是 TTS 額度）——CER > CER_MAX 表示吐字不清或念錯
// 結果寫 videos/<slug>/tts-verify.json，align.mjs 產生 tts-check.md 時會附上「自動重生紀錄」一節。
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { clean } from "./validate.mjs";

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
export const CONF_MIN = 0.5, CER_MAX = 0.15;
export const FA_PY = process.env.FA_PYTHON || [path.join(ROOT, ".venv/bin/python")].find((p) => fs.existsSync(p)) || "python3";
const GEMINI_KEY = process.env.GEMINI_API_KEY || "injected-by-proxy";
const GEMINI_MODEL = process.env.ALIGN_GEMINI_MODEL || "gemini-3.5-transcribe";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// 簡→繁（聽寫偶爾輸出簡體），只為了對齊比對用
const S2T = "台臺 湾灣 国國 会會 们們 这這 个個 说說 经經 济濟 选選 举舉 党黨 发發 时時 间間 为為 么麼 对對 后後 际際 币幣 买買 卖賣 价價 涨漲 亿億 万萬 点點 两兩 东東 产產 业業 关關 系係 还還 没沒 过過 从從 开開 长長 变變 来來 现現 实實 问問 题題 决決 议議 结結 层層 并並 连連 让讓 该該 将將 体體 应應 质質 术術 规規 则則 电電 车車 机機 构構 资資 费費 数數 据據 岁歲 养養 儿兒 难難 压壓 员員 众眾 参參 县縣 区區 总總 统統 领領 导導 计計 划劃 够夠 听聽 见見 觉覺 认認 识識 学學 习習 书書 读讀 写寫 门門 几幾 样樣 种種 类類 组組 织織 权權 义義 务務 场場 态態 势勢 热熱 处處 乐樂 药藥 医醫 疗療 护護 险險 税稅 贷貸 债債 储儲 备備 换換 转轉 输輸 运運 网網 络絡 线線 链鏈 块塊 锁鎖 钱錢 银銀 账賬 户戶 号號 单單 优優 级級 标標 准準 达達 预預 测測 报報 闻聞 调調 显顯 图圖 础礎 设設 环環 节節 约約 减減 龄齡 妇婦 爱愛 庆慶 园園 补補 贴貼 薪薪 贵貴 维維 诉訴 请請 届屆 办辦 临臨";
const s2t = Object.fromEntries(S2T.split(" ").map((p) => [p[0], p[1]]));
export const norm = (s) => [...clean(s)].map((c) => s2t[c] ?? c);

/** LCS 對齊：a = 稿子字元，b = [{c, ...}]；回傳每個 a 字元對應的 b 索引（或 null）與配對數 */
export const lcsAlign = (a, b) => {
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
/** CER = 1 − LCS/稿長（簡繁正規化、標點不計）；沒有聽寫結果回傳 null */
export const cerOf = (spoken, transcript) => {
  const a = norm(spoken), b = norm(transcript).map((c) => ({ c }));
  return a.length && b.length ? Number((1 - lcsAlign(a, b).matched / a.length).toFixed(3)) : null;
};

/** CTC 強制對齊：一次呼叫 fa.py 處理多幕（模型只載入一次）→ { id: {units, confidence, ...} }；失敗回傳 {} */
export function runFA(jobs, { quiet = false } = {}) {
  if (!jobs.length) return {};
  if (!quiet) console.log(`▶ CTC 強制對齊 ${jobs.length} 幕（${path.relative(ROOT, FA_PY) || FA_PY} scripts/fa.py）…`);
  const r = spawnSync(FA_PY, [path.join(ROOT, "scripts/fa.py")], { input: JSON.stringify(jobs), encoding: "utf8", maxBuffer: 64 << 20, stdio: ["pipe", "pipe", "inherit"], env: { ...process.env, PYTHONNOUSERSITE: "1" } });
  if (r.status !== 0) { console.warn(`⚠ fa.py 失敗（exit ${r.status}${r.error ? "，" + r.error.message : ""}）`); return {}; }
  try { return Object.fromEntries(JSON.parse(r.stdout).filter((x) => x.ok).map((x) => [x.id, x])); }
  catch (e) { console.warn(`⚠ fa.py 輸出無法解析：${e.message}`); return {}; }
}

/** Gemini 聽寫（只要文字）。免費額度每模型每天有限：某模型當日額度用完就換下一個，全部用完回傳空字串 */
const TRANSCRIBE_MODELS = [GEMINI_MODEL, "gemini-3.5-flash-lite", "gemini-flash-lite-latest", "gemini-3.1-flash-lite"].filter((m, i, a) => a.indexOf(m) === i);
const dead = new Set();
export async function geminiTranscribe(file) {
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

/**
 * 校驗多幕：items = [{id, file(絕對路徑), text(念稿)}]；method = fa｜asr｜both
 * 回傳 { id: { confidence, minScore, cer, transcript, bad, why[] } }；fa 失敗時 confidence 為 null（不當成壞）
 */
export async function verifyScenes(items, method = "fa") {
  const out = Object.fromEntries(items.map((x) => [x.id, { confidence: null, minScore: null, cer: null, transcript: null, bad: false, why: [] }]));
  if (method === "fa" || method === "both") {
    const FA = runFA(items.map((x) => ({ id: x.id, file: x.file, text: x.text })));
    for (const x of items) if (FA[x.id]) { out[x.id].confidence = FA[x.id].confidence; out[x.id].minScore = FA[x.id].minScore; }
  }
  if (method === "asr" || method === "both") {
    for (const x of items) {
      try { const tr = await geminiTranscribe(x.file); out[x.id].transcript = tr.text; out[x.id].cer = cerOf(x.text, tr.text); }
      catch (e) { console.warn(`  ⚠ ${x.id} Gemini 聽寫失敗：${e.message.slice(0, 100)}`); }
    }
  }
  for (const r of Object.values(out)) {
    if (r.confidence != null && r.confidence < CONF_MIN) r.why.push(`對齊信心 ${r.confidence} < ${CONF_MIN}`);
    if (r.cer != null && r.cer > CER_MAX) r.why.push(`CER ${(r.cer * 100).toFixed(0)}% > ${CER_MAX * 100}%`);
    r.bad = r.why.length > 0;
  }
  return out;
}

const verifyPath = (slug) => path.join(ROOT, "videos", slug, "tts-verify.json");
export const readVerify = (slug) => { try { return JSON.parse(fs.readFileSync(verifyPath(slug), "utf8")); } catch { return null; } };
export const writeVerify = (slug, rec) => fs.writeFileSync(verifyPath(slug), JSON.stringify(rec, null, 1) + "\n");

/** tts-check.md 的「自動重生紀錄」一節（align.mjs 與 tts.mjs 都會寫） */
export function verifySection(slug) {
  const v = readVerify(slug);
  if (!v) return "";
  const f = (r) => (r ? [r.confidence != null ? `信心 ${r.confidence}` : null, r.cer != null ? `CER ${(r.cer * 100).toFixed(0)}%` : null].filter(Boolean).join("、") || "—" : "—");
  const rows = v.scenes.map((s) => `| ${s.id} | ${f(s.before)}${s.before?.bad ? " ⚠" : ""} | ${s.regen ? "是" : s.before?.bad ? `否（${s.skipReason ?? "—"}）` : "—"} | ${s.after ? f(s.after) + (s.after.bad ? " ⚠" : "") : "—"} | ${s.kept ?? "—"} |`);
  return ["", "## 自動重生紀錄（npm run tts 回讀校驗）", "",
    `- ${v.at}；方法 ${v.method}（fa＝CTC 對齊信心，本機；asr＝Gemini 聽寫 CER）；門檻：信心 < ${v.confMin} 或 CER > ${v.cerMax * 100}%`,
    `- 校驗 ${v.scenes.length} 幕，不合格 ${v.scenes.filter((s) => s.before?.bad).length} 幕，重生 ${v.scenes.filter((s) => s.regen).length} 幕（上限 ${v.regenMax}，${v.regenRequests ?? 0} 次 TTS 請求）${v.note ? "；" + v.note : ""}`,
    "- 重生後信心或 CER 比原本差時保留原音檔（「保留」欄）。仍不合格的幕要人耳試聽，並檢查 pronunciation.md 讀法規則。", "",
    "| 幕 | 第一次 | 重生 | 重生後 | 保留 |", "|---|---|---|---|---|", ...rows, ""].join("\n");
}

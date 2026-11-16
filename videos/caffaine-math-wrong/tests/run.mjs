// 實測（caffaine-math-wrong，2026/11/17）：同一批算術與數字母題目，「直接問」與「叫它用程式算／一步一步列」各測一輪。回答原樣存檔。
// 用法：NODE_USE_ENV_PROXY=1 node videos/caffaine-math-wrong/tests/run.mjs [--force]
import fs from "node:fs"; import path from "node:path";
const dir = path.dirname(new URL(import.meta.url).pathname);
const KEY = process.env.GEMINI_API_KEY || "injected-by-proxy";
const MODEL = process.env.TEST_MODEL || "gemini-3.5-flash";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function call(body) {
  for (let i = 0; i < 4; i++) {
    const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`, { method: "POST", headers: { "Content-Type": "application/json", "x-goog-api-key": KEY }, body: JSON.stringify(body) });
    const t = await r.text(); if (r.ok) return JSON.parse(t);
    console.error(r.status, t.slice(0, 100)); if (r.status === 404 || r.status === 400) return null; await sleep(8000 * (i + 1));
  } return null;
}
const Q = {
  mul7: { q: "4829173 乘以 9316482 等於多少？只回答最後的數字，不要解釋。", truth: String(4829173n * 9316482n) },
  mul5: { q: "48271 乘以 93614 等於多少？只回答最後的數字，不要解釋。", truth: String(48271n * 93614n) },
  cmp: { q: "9.11 和 9.9，哪一個比較大？只回答一個數字。", truth: "9.9" },
  cnt1: { q: "英文單字 strawberry 裡有幾個字母 r？只回答數字。", truth: "3" },
  cnt2: { q: "英文單字 bookkeeper 裡有幾個字母 e？只回答數字。", truth: "3" },
  mul12: { q: "123456789012 乘以 987654321098 等於多少？只回答最後的數字，不要解釋。", truth: String(123456789012n * 987654321098n) },
  str60: { q: "下面這串字母裡有幾個小寫字母 a？只回答數字。\nfcgabbfadabggbdbgabdagadacegcbecbdfbbadhgfhhfedcdbehfhebbgcf", truth: "8" },
  cnt3: { q: "英文單字 Mississippi 裡有幾個字母 s？只回答數字。", truth: "4" },
};
const MODES = {
  direct: (q) => q,
  steps: (q) => q.replace("只回答最後的數字，不要解釋。", "請一步一步列出算式，最後再寫答案。").replace("只回答一個數字。", "請逐位比較並說明，最後寫答案。").replace("只回答數字。", "請把單字一個字母一個字母列出來，標上編號，再數，最後寫答案。"),
  code: (q) => q.replace(/只回答.*?。/, "請寫一段 Python 程式碼來算，並寫出程式執行後會印出的結果。"),
};
const jobs = [];
for (const [k, v] of Object.entries(Q)) for (const m of (process.env.MODES||"direct").split(",")) for (const run of (process.env.RUNS||"1,2").split(",").map(Number)) jobs.push({ id: `${k}-${m}${process.env.NOTHINK ? "-nothink" : ""}-${run}`, k, m, run, prompt: MODES[m](v.q), truth: v.truth });
async function one(j) {
  const out = path.join(dir, j.id + ".json");
  if (fs.existsSync(out) && !process.argv.includes("--force")) return;
  const sentAt = new Date().toISOString(); const t0 = Date.now();
  const body = { contents: [{ role: "user", parts: [{ text: j.prompt }] }], ...(process.env.NOTHINK ? { generationConfig: { thinkingConfig: { thinkingBudget: 0 } } } : {}) };
  const jr = await call(body); if (!jr) { console.error(j.id, "沒回應"); return; }
  const answer = (jr.candidates?.[0]?.content?.parts ?? []).filter((p) => !p.thought).map((p) => p.text ?? "").join("");
  fs.writeFileSync(out, JSON.stringify({ ...j, tool: "Gemini（Gemini API，沒有開搜尋與程式執行工具）", model: MODEL, modelVersion: jr.modelVersion, sentAtUTC: sentAt, sentAtTaipei: new Date(sentAt).toLocaleString("sv-SE", { timeZone: "Asia/Taipei" }), elapsedSec: +((Date.now() - t0) / 1000).toFixed(1), request: body, answer, finishReason: jr.candidates?.[0]?.finishReason, usage: jr.usageMetadata }, null, 2));
  console.log("done", j.id);
}
const pool = 2; let idx = 0;
await Promise.all(Array.from({ length: pool }, async () => { while (idx < jobs.length) await one(jobs[idx++]); }));

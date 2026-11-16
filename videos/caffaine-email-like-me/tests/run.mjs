// 實測（caffaine-email-like-me，2026/11/17）：同一件事（出貨延遲三天），「沒給範例」對「給三封自己寫過的信當範例」。回答原樣存檔。
// 用法：NODE_USE_ENV_PROXY=1 node videos/caffaine-email-like-me/tests/run.mjs [--force]
import fs from "node:fs"; import path from "node:path";
const dir = path.dirname(new URL(import.meta.url).pathname);
const KEY = process.env.GEMINI_API_KEY || "injected-by-proxy";
const MODEL = process.env.TEST_MODEL || "gemini-3.5-flash";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function call(body) {
  for (let i = 0; i < 6; i++) {
    const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`, { method: "POST", headers: { "Content-Type": "application/json", "x-goog-api-key": KEY }, body: JSON.stringify(body) });
    const t = await r.text(); if (r.ok) return JSON.parse(t);
    console.error(r.status, t.slice(0, 100).replace(/\s+/g, " ")); if (r.status === 404 || r.status === 400) return null; await sleep(10000 * (i + 1));
  } return null;
}
const samples = fs.readFileSync(path.join(dir, "samples.txt"), "utf8").trim();
const task = "幫我寫一封信給客戶陳小姐：她訂的那批商品會晚三天出貨，新的出貨日是 11 月 24 日，要跟她道歉。";
const prompts = {
  "01-plain-run1": task,
  "01-plain-run2": task,
  "02-samples-run1": `${samples}\n\n以上是我自己寫過的三封信。請參考我的寫法和語氣。\n${task}`,
  "02-samples-run2": `${samples}\n\n以上是我自己寫過的三封信。請參考我的寫法和語氣。\n${task}`,
};
for (const [id, prompt] of Object.entries(prompts)) {
  const out = path.join(dir, id + ".json");
  if (fs.existsSync(out) && !process.argv.includes("--force")) continue;
  const sentAt = new Date().toISOString(); const t0 = Date.now();
  const body = { contents: [{ role: "user", parts: [{ text: prompt }] }] };
  const j = await call(body); if (!j) { console.error(id, "沒回應"); continue; }
  const answer = (j.candidates?.[0]?.content?.parts ?? []).filter((p) => !p.thought).map((p) => p.text ?? "").join("");
  fs.writeFileSync(out, JSON.stringify({ id, tool: "Gemini（Gemini API，沒有開搜尋工具）", model: MODEL, modelVersion: j.modelVersion, sentAtUTC: sentAt, sentAtTaipei: new Date(sentAt).toLocaleString("sv-SE", { timeZone: "Asia/Taipei" }), elapsedSec: +((Date.now() - t0) / 1000).toFixed(1), request: body, prompt, answer, finishReason: j.candidates?.[0]?.finishReason, usage: j.usageMetadata }, null, 2));
  console.log("done", id, "\n" + answer);
}

// 實測（caffaine-sketch-game，2026/11/16）：把程式畫的手繪風草圖（sketch.png）交給 Gemini，請它做成單檔 HTML 小遊戲。原文原樣存檔。
// 用法：NODE_USE_ENV_PROXY=1 node videos/caffaine-sketch-game/tests/run.mjs <id> "<提示詞>" [--with-previous <前一個id>]
import fs from "node:fs";
import path from "node:path";
const dir = path.dirname(new URL(import.meta.url).pathname);
const KEY = process.env.GEMINI_API_KEY || "injected-by-proxy";
const MODELS = ["gemini-3.8-flash", "gemini-3.5-flash", "gemini-flash-latest"];
const [id, prompt] = process.argv.slice(2);
const prevIdx = process.argv.indexOf("--with-previous");
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function call(model, body) {
  for (let i = 0; i < 4; i++) {
    const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, { method: "POST", headers: { "Content-Type": "application/json", "x-goog-api-key": KEY }, body: JSON.stringify(body) });
    const t = await r.text();
    if (r.ok) return JSON.parse(t);
    console.error(`  ${model} 第 ${i + 1} 次：${r.status} ${t.slice(0, 120).replace(/\s+/g, " ")}`);
    if (r.status === 404 || r.status === 400) return null;
    await sleep(8000 * (i + 1));
  }
  return null;
}
const img = fs.readFileSync(path.join(dir, "sketch.png")).toString("base64");
const contents = [];
let model = process.env.TEST_MODEL;
if (prevIdx > 0) {
  const prev = JSON.parse(fs.readFileSync(path.join(dir, process.argv[prevIdx + 1] + ".json"), "utf8"));
  model = process.env.TEST_MODEL || prev.model;
  const pc = JSON.parse(JSON.stringify(prev.request.contents).replace("(sketch.png)", img));
  contents.push(...pc, { role: "model", parts: [{ text: prev.answer }] });
  contents.push({ role: "user", parts: [{ text: prompt }] });
} else {
  contents.push({ role: "user", parts: [{ inline_data: { mime_type: "image/png", data: img } }, { text: prompt }] });
}
const body = { contents };
const sentAt = new Date().toISOString(); const t0 = Date.now();
let j = null;
for (const m of model ? [model] : MODELS) { j = await call(m, body); if (j) { model = m; break; } }
if (!j) { console.error("沒有模型回應"); process.exit(1); }
const answer = (j.candidates?.[0]?.content?.parts ?? []).filter((p) => !p.thought).map((p) => p.text ?? "").join("");
const reqSave = JSON.parse(JSON.stringify(body)); // 圖檔 base64 不重複存，改記檔名
for (const c of reqSave.contents) for (const p of c.parts) if (p.inline_data) p.inline_data.data = "(sketch.png)";
fs.writeFileSync(path.join(dir, id + ".json"), JSON.stringify({ id, tool: "Gemini（Gemini API，沒有開搜尋工具）", model, modelVersion: j.modelVersion, sentAtUTC: sentAt, elapsedSec: +((Date.now() - t0) / 1000).toFixed(1), sentAtTaipei: new Date(sentAt).toLocaleString("sv-SE", { timeZone: "Asia/Taipei" }), request: reqSave, prompt, answer, finishReason: j.candidates?.[0]?.finishReason, usage: j.usageMetadata, responseId: j.responseId }, null, 2));
fs.writeFileSync(path.join(dir, id + ".html"), answer.replace(/^[\s\S]*?```html\s*/i, "").replace(/```[\s\S]*$/, ""));
console.log("=====", id, model, answer.length, "字", j.candidates?.[0]?.finishReason);

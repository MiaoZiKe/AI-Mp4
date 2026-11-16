// 實測：Gemini API 生成單檔 HTML。用法：NODE_USE_ENV_PROXY=1 node videos/gen.mjs <slug> <id> "<提示詞>" [--file <檔名>] [--with-previous <id>]
import fs from "node:fs"; import path from "node:path";
const [slug, id, prompt] = process.argv.slice(2);
const dir = path.join(path.dirname(new URL(import.meta.url).pathname), "caffaine-" + slug, "tests");
const KEY = process.env.GEMINI_API_KEY || "injected-by-proxy"; const MODEL = process.env.TEST_MODEL || "gemini-3.5-flash";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function call(body) { for (let i = 0; i < 8; i++) { const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`, { method: "POST", headers: { "Content-Type": "application/json", "x-goog-api-key": KEY }, body: JSON.stringify(body) }); const t = await r.text(); if (r.ok) return JSON.parse(t); console.error(id, r.status, t.slice(0, 90).replace(/\s+/g, " ")); if (r.status === 404 || r.status === 400) return null; await sleep(12000 * (i + 1)); } return null; }
let text = prompt; const fi = process.argv.indexOf("--file"); if (fi > 0) text = fs.readFileSync(path.join(dir, process.argv[fi + 1]), "utf8").trim() + "\n\n" + prompt;
const contents = []; const pi = process.argv.indexOf("--with-previous");
if (pi > 0) { const prev = JSON.parse(fs.readFileSync(path.join(dir, process.argv[pi + 1] + ".json"), "utf8")); contents.push(...prev.request.contents, { role: "model", parts: [{ text: prev.answer }] }); }
contents.push({ role: "user", parts: [{ text }] });
const body = { contents }; const sentAt = new Date().toISOString(); const t0 = Date.now();
const j = await call(body); if (!j) { console.error(id, "沒回應"); process.exit(1); }
const answer = (j.candidates?.[0]?.content?.parts ?? []).filter((p) => !p.thought).map((p) => p.text ?? "").join("");
fs.writeFileSync(path.join(dir, id + ".json"), JSON.stringify({ id, tool: "Gemini（Gemini API，沒有開搜尋工具）", model: MODEL, modelVersion: j.modelVersion, sentAtUTC: sentAt, sentAtTaipei: new Date(sentAt).toLocaleString("sv-SE", { timeZone: "Asia/Taipei" }), elapsedSec: +((Date.now() - t0) / 1000).toFixed(1), request: body, prompt: text, answer, finishReason: j.candidates?.[0]?.finishReason, usage: j.usageMetadata }, null, 2));
fs.writeFileSync(path.join(dir, id + ".html"), answer.replace(/^[\s\S]*?```html\s*/i, "").replace(/```[\s\S]*$/, ""));
console.log("完成", id, answer.length, "字", j.candidates?.[0]?.finishReason, j.candidates?.[0]?.finishReason);

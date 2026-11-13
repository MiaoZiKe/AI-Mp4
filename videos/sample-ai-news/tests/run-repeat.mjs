// 穩定度檢查：「隨便問」同一句話、同一個模型再送一次，另存 03-casual-repeat.json（不蓋掉 01）。
// 用法：NODE_USE_ENV_PROXY=1 node videos/sample-ai-news/tests/run-repeat.mjs
import fs from "node:fs";
import path from "node:path";
const dir = path.dirname(new URL(import.meta.url).pathname);
const KEY = process.env.GEMINI_API_KEY || "injected-by-proxy";
const first = JSON.parse(fs.readFileSync(path.join(dir, "01-casual.json"), "utf8"));
const out = path.join(dir, "03-casual-repeat.json");
if (fs.existsSync(out)) { console.log("已有 03-casual-repeat.json，不重送"); process.exit(0); }
const body = first.request, sentAt = new Date().toISOString();
const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${first.model}:generateContent`, { method: "POST", headers: { "Content-Type": "application/json", "x-goog-api-key": KEY }, body: JSON.stringify(body) });
const t = await r.text();
if (!r.ok) { console.error(r.status, t.slice(0, 200)); process.exit(1); }
const j = JSON.parse(t);
const answer = (j.candidates?.[0]?.content?.parts ?? []).filter((p) => !p.thought).map((p) => p.text ?? "").join("");
fs.writeFileSync(out, JSON.stringify({ id: "03-casual-repeat", tool: first.tool, model: first.model, modelVersion: j.modelVersion, sentAtUTC: sentAt, sentAtTaipei: new Date(sentAt).toLocaleString("sv-SE", { timeZone: "Asia/Taipei" }), request: body, prompt: first.prompt, answer, finishReason: j.candidates?.[0]?.finishReason, usage: j.usageMetadata, responseId: j.responseId }, null, 2));
console.log(j.modelVersion, "\n" + answer);

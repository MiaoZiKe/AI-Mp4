// 實測：同一則新聞，「隨便問」與「這樣問」各送一次。回答原樣存檔，不改寫。
// 用法：NODE_USE_ENV_PROXY=1 node videos/sample-ai-news/tests/run.mjs [--force]
import fs from "node:fs";
import path from "node:path";
const dir = path.dirname(new URL(import.meta.url).pathname);
const KEY = process.env.GEMINI_API_KEY || "injected-by-proxy";
// gemini-2.5-flash 在 2026/11/13 回 404（不再開放給新使用者）；依序試下面的模型，兩題一定用同一個。
const MODELS = process.env.TEST_MODEL ? [process.env.TEST_MODEL] : ["gemini-3.8-flash", "gemini-3.5-flash", "gemini-flash-latest"];
let MODEL = null;
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
const src = fs.readFileSync(path.join(dir, "source-text.txt"), "utf8").trim();
const prompts = {
  "01-casual": "10月CPI的新聞幫我抓重點",
  "02-better": `下面是我貼的一段新聞整理。請只根據這段文字回答，不要加文字裡沒有的數字；文字裡沒寫的就說「原文沒寫」。

我是在台北租房子、三餐外食的上班族。請分三段，每段最多三點、每點不超過 25 個字：
1. 已經確定的事
2. 還不確定的事
3. 跟我最有關的一點

【新聞整理】
${src}`,
};
for (const [id, prompt] of Object.entries(prompts)) {
  const out = path.join(dir, id + ".json");
  if (fs.existsSync(out) && !process.argv.includes("--force")) { console.log("已有", id); MODEL ??= JSON.parse(fs.readFileSync(out, "utf8")).model; continue; }
  const sentAt = new Date().toISOString();
  const body = { contents: [{ role: "user", parts: [{ text: prompt }] }] };
  let j = null;
  for (const m of MODEL ? [MODEL] : MODELS) { j = await call(m, body); if (j) { MODEL = m; break; } }
  if (!j) { console.error(id, "沒有模型回應"); process.exit(1); }
  const answer = (j.candidates?.[0]?.content?.parts ?? []).filter((p) => !p.thought).map((p) => p.text ?? "").join("");
  fs.writeFileSync(out, JSON.stringify({ id, tool: "Gemini（Gemini API，沒有開搜尋工具）", model: MODEL, modelVersion: j.modelVersion, sentAtUTC: sentAt, sentAtTaipei: new Date(sentAt).toLocaleString("sv-SE", { timeZone: "Asia/Taipei" }), request: body, prompt, answer, finishReason: j.candidates?.[0]?.finishReason, usage: j.usageMetadata, responseId: j.responseId }, null, 2));
  console.log("=====", id, MODEL, "\n" + answer);
}

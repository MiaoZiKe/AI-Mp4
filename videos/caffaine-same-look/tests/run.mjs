// 實測（caffaine-same-look，2026/11/16）：同一句「幫我做一個咖啡店首頁」送兩次，再加「指定風格」送一次。原文原樣存檔。
// 用法：NODE_USE_ENV_PROXY=1 node videos/caffaine-same-look/tests/run.mjs [--force]
import fs from "node:fs";
import path from "node:path";
const dir = path.dirname(new URL(import.meta.url).pathname);
const KEY = process.env.GEMINI_API_KEY || "injected-by-proxy";
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
const SUF = "\n\n請只輸出一個完整的單檔 HTML（CSS 寫在 <style> 內，不要外部圖片），不要多餘說明。";
const prompts = {
  "01-plain": "幫我做一個咖啡店首頁。" + SUF,
  "01b-plain-run2": "幫我做一個咖啡店首頁。" + SUF,
  "02-styled": "幫我做一個咖啡店首頁。風格參考：日本咖啡館的手寫菜單看板。米色紙底、深棕色字、標題用襯線字體並靠左，不要漸層、不要紫色，內容用左右不對稱的版面，不要三欄卡片。" + SUF,
};
for (const [id, prompt] of Object.entries(prompts)) {
  const out = path.join(dir, id + ".json");
  if (fs.existsSync(out) && !process.argv.includes("--force")) { console.log("已有", id); MODEL ??= JSON.parse(fs.readFileSync(out, "utf8")).model; continue; }
  const sentAt = new Date().toISOString(); const t0 = Date.now();
  const body = { contents: [{ role: "user", parts: [{ text: prompt }] }] };
  let j = null;
  for (const m of MODEL ? [MODEL] : MODELS) { j = await call(m, body); if (j) { MODEL = m; break; } }
  if (!j) { console.error(id, "沒有模型回應"); process.exit(1); }
  const answer = (j.candidates?.[0]?.content?.parts ?? []).filter((p) => !p.thought).map((p) => p.text ?? "").join("");
  fs.writeFileSync(out, JSON.stringify({ id, tool: "Gemini（Gemini API，沒有開搜尋工具）", model: MODEL, modelVersion: j.modelVersion, sentAtUTC: sentAt, elapsedSec: +((Date.now() - t0) / 1000).toFixed(1), sentAtTaipei: new Date(sentAt).toLocaleString("sv-SE", { timeZone: "Asia/Taipei" }), request: body, prompt, answer, finishReason: j.candidates?.[0]?.finishReason, usage: j.usageMetadata, responseId: j.responseId }, null, 2));
  const html = answer.replace(/^[\s\S]*?```html\s*/i, "").replace(/```[\s\S]*$/, "");
  fs.writeFileSync(path.join(dir, id + ".html"), html);
  console.log("=====", id, MODEL, answer.length, "字");
}

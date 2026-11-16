// 實測（caffaine-confident-lie，2026/11/17）：沿用 caffaine-meeting-todo 的兩次「隨便問」（01、01b），新增「沒寫的填未知、附原文出處」一輪。回答原樣存檔。
// 用法：NODE_USE_ENV_PROXY=1 node videos/caffaine-confident-lie/tests/run.mjs [--force]
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
const src = fs.readFileSync(path.join(dir, "source-text.txt"), "utf8").trim();
const prompts = {
  "03-cite-run1": `下面是一份會議紀錄。請列出待辦清單，每項一行，格式：負責人｜事項｜期限｜原文出處（貼上紀錄裡那一句原文）。\n規則：紀錄裡沒寫的欄位一律填「未知」，不要自己推測或補上；找不到原文出處的項目不要列。\n\n${src}`,
  "03-cite-run2": `下面是一份會議紀錄。請列出待辦清單，每項一行，格式：負責人｜事項｜期限｜原文出處（貼上紀錄裡那一句原文）。\n規則：紀錄裡沒寫的欄位一律填「未知」，不要自己推測或補上；找不到原文出處的項目不要列。\n\n${src}`,
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

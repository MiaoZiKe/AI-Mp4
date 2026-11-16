// 把抓到的搜尋頁文字交給 Gemini 整理（2026/11/16）。3 次請求：兩站各一次「取前 15 筆」、一次「兩站比價表」。原始回答原樣存檔。
// 用法：NODE_USE_ENV_PROXY=1 node run_gemini.mjs [--force]
import fs from "node:fs"; import path from "node:path";
const dir = path.dirname(new URL(import.meta.url).pathname), KEY = process.env.GEMINI_API_KEY || "injected-by-proxy";
const MODELS = ["gemini-3.8-flash", "gemini-3.5-flash", "gemini-flash-latest"]; let MODEL = null;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function call(model, body) {
  for (let i = 0; i < 3; i++) {
    const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, { method: "POST", headers: { "Content-Type": "application/json", "x-goog-api-key": KEY }, body: JSON.stringify(body) });
    const t = await r.text(); if (r.ok) return JSON.parse(t);
    console.error(model, r.status, t.slice(0, 100)); if (r.status === 404 || r.status === 400) return null; await sleep(8000 * (i + 1));
  } return null;
}
const rd = (f) => fs.readFileSync(path.join(dir, f), "utf8");
const pc = rd("pchome-body.txt"), et = rd("etmall-body.txt");
const cut = (s, n) => s.split("\n").slice(0, n).join("\n");
const extract = (site, text) => `下面是「${site}」搜尋「行動電源 20000mAh」的結果頁文字（已去掉頁首選單）。請依畫面順序取前 15 筆商品，輸出 JSON 陣列，每筆：{"name": 商品名, "price_now": 現價（數字，元）, "price_original": 原價或劃線價（數字，沒有就 null）}。只根據這段文字，不要補文字裡沒有的資料。\n\n${text}`;
const prompts = {
  "01-extract-pchome": { p: extract("PChome 24h購物", cut(pc, 200)), json: true },
  "02-extract-etmall": { p: extract("ETMall東森購物網", cut(et, 200)), json: true },
  "03-compare": { p: `下面是兩個購物網站搜尋「行動電源 20000mAh」的結果頁文字（2026/11/16 抓取，已去掉頁首選單）。請整理成比價表：找出兩個網站都有的同款商品（同品牌、同型號、同容量），每款一列：商品、PChome 價格、ETMall 價格、哪邊便宜、差多少元、優惠資訊（折扣、贈品、滿額贈等頁面有寫的）。不確定是不是同款的，標「不確定」。最後用一兩句話說要注意什麼。只根據文字，沒寫的不要猜。\n\n【PChome 24h購物】\n${cut(pc, 200)}\n\n【ETMall東森購物網】\n${cut(et, 200)}` },
};
for (const [id, { p, json }] of Object.entries(prompts)) {
  const out = path.join(dir, id + ".json"); if (fs.existsSync(out) && !process.argv.includes("--force")) { console.log("已有", id); MODEL ??= JSON.parse(fs.readFileSync(out, "utf8")).model; continue; }
  const sentAt = new Date().toISOString(), t0 = Date.now(), body = { contents: [{ role: "user", parts: [{ text: p }] }], ...(json ? { generationConfig: { responseMimeType: "application/json" } } : {}) };
  let j = null; for (const m of MODEL ? [MODEL] : MODELS) { j = await call(m, body); if (j) { MODEL = m; break; } }
  if (!j) { console.error(id, "沒有模型回應"); process.exit(1); }
  const answer = (j.candidates?.[0]?.content?.parts ?? []).filter((x) => !x.thought).map((x) => x.text ?? "").join("");
  fs.writeFileSync(out, JSON.stringify({ id, tool: "Gemini（Gemini API，沒有開搜尋工具）", model: MODEL, modelVersion: j.modelVersion, sentAtUTC: sentAt, sentAtTaipei: new Date(sentAt).toLocaleString("sv-SE", { timeZone: "Asia/Taipei" }), elapsedSec: +((Date.now() - t0) / 1000).toFixed(1), prompt: p, answer, finishReason: j.candidates?.[0]?.finishReason, usage: j.usageMetadata }, null, 2));
  console.log("=====", id, MODEL, ((Date.now() - t0) / 1000).toFixed(1) + "s\n" + answer.slice(0, 3500));
}

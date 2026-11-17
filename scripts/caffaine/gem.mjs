#!/usr/bin/env node
// 用法：NODE_USE_ENV_PROXY=1 node scripts/caffaine/gem.mjs <輸出json> <模型> <提示檔.txt> [--temp 0.7]
// 把提示送 Gemini API（不開搜尋），原始請求與回應存成 json。金鑰由代理注入。
import fs from "node:fs";
const [out, model, pf] = process.argv.slice(2);
const ti = process.argv.indexOf("--temp"); const temp = ti > 0 ? Number(process.argv[ti + 1]) : undefined;
const text = fs.readFileSync(pf, "utf8");
const body = { contents: [{ role: "user", parts: [{ text }] }], ...(temp !== undefined ? { generationConfig: { temperature: temp } } : {}) };
const t0 = Date.now(), sent = new Date().toISOString();
const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, { method: "POST", headers: { "content-type": "application/json", "x-goog-api-key": "proxy-injected" }, body: JSON.stringify(body) });
const j = await r.json();
const reply = j?.candidates?.[0]?.content?.parts?.map((p) => p.text).join("") ?? "";
fs.writeFileSync(out, JSON.stringify({ id: out.split("/").pop().replace(".json", ""), tool: "Gemini（Gemini API，沒有開搜尋工具）", model, modelVersion: j.modelVersion, httpStatus: r.status, sentAtUTC: sent, elapsedSec: (Date.now() - t0) / 1000, request: body, response: j, replyText: reply }, null, 2));
console.log(r.status, j.modelVersion ?? j.error?.message?.slice(0, 120), reply.length + " 字");

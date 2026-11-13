// 彙整所有 TTS 請求紀錄，寫 docs/tts-usage.md。用法：npm run tts:usage
// 一天的界線用太平洋時間午夜（Google 額度重置時間，約台灣下午 3–4 點）。
import fs from "node:fs";
import path from "node:path";
import { ROOT } from "./lib.mjs";
const rows = new Map();
const add = (r, src) => { if (!r?.at) return; rows.set(`${r.at}|${r.model}|${r.status}`, { ...r, src }); };
for (const d of fs.readdirSync(path.join(ROOT, "videos"))) {
  const f = path.join(ROOT, "videos", d, "tts-requests.json");
  if (fs.existsSync(f)) for (const r of JSON.parse(fs.readFileSync(f, "utf8"))) add(r, d);
}
// 試聽請求也會記在各片的 tts-requests.json，所以不另外讀 out/ 的 audition.json（會重複計算）
const extra = path.join(ROOT, "docs/tts-usage-manual.json"); // 沒被程式記到的請求（手動補記）
if (fs.existsSync(extra)) for (const r of JSON.parse(fs.readFileSync(extra, "utf8"))) add(r, "manual");
const dayOf = (at) => new Intl.DateTimeFormat("en-CA", { timeZone: "America/Los_Angeles" }).format(new Date(at));
const days = new Map();
for (const r of [...rows.values()].sort((a, b) => a.at.localeCompare(b.at))) {
  const k = dayOf(r.at);
  const d = days.get(k) || { ok: 0, limited: 0, other: 0, audioTok: 0, textTok: 0, first429AfterOk: null };
  if (r.status === 200) { d.ok++; d.audioTok += r.usage?.candidatesTokenCount || 0; d.textTok += r.usage?.promptTokenCount || 0; }
  else if (r.status === 429) { d.limited++; if (d.first429AfterOk === null) d.first429AfterOk = d.ok; }
  else d.other++;
  days.set(k, d);
}
const list = [...days.entries()];
const okDays = list.filter(([, d]) => d.ok > 0);
const avg = okDays.length ? (okDays.reduce((s, [, d]) => s + d.ok, 0) / okDays.length).toFixed(1) : "0";
const hit = list.filter(([, d]) => d.first429AfterOk !== null && d.first429AfterOk > 0).map(([, d]) => d.first429AfterOk);
let md = `# 配音（TTS）請求用量紀錄\n\n由 \`npm run tts:usage\` 產生，不要手改。一天以 Google 額度重置時間（太平洋時間午夜，約台灣下午 3–4 點）為界。\n\n`;
md += `- 有成功請求的天數：${okDays.length} 天，平均每天成功 ${avg} 次，最多 ${Math.max(0, ...okDays.map(([, d]) => d.ok))} 次。\n`;
md += `- 撞到上限（429）前當天已成功的次數：${hit.length ? hit.join("、") : "還沒有紀錄"}。\n`;
md += `- 音訊 token 是計費依據之一；金額以 Google 後台帳單為準。\n\n`;
md += `| 日期（太平洋時間） | 成功 | 被擋（429） | 其他錯誤 | 撞到上限前已成功 | 輸出音訊 token | 輸入文字 token |\n|---|---|---|---|---|---|---|\n`;
for (const [k, d] of list) md += `| ${k} | ${d.ok} | ${d.limited} | ${d.other} | ${d.first429AfterOk ?? "—"} | ${d.audioTok} | ${d.textTok} |\n`;
fs.writeFileSync(path.join(ROOT, "docs/tts-usage.md"), md);
console.log(md);

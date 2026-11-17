// CaffAIne 字幕斷行（共用）：把「旁白（含標點）」切成 subtitle.zh 的 \n 分行。
// 規則：① 先在逗號句號等標點切；② 超過寬度的子句才再切，且只切在「語意點」：
//   英文單字、數字＋單位（0.3 GB、三點五版）、關鍵詞、短引號不拆；任何一段都不少於 3 個字（不會單獨剩一個字）；
//   偏好在「的／了」之後、「是／就／都／但…」之前斷，兩邊字數盡量接近。
// 用法：node scripts/caffaine/subtitle-breaks.mjs <slug>...  → 改寫 videos/<slug>/script.json 每幕 subtitle.zh（旁白、tts 不動）
import fs from "node:fs";
import path from "node:path";
import { emWidth } from "../validate.mjs";

const MAX_EM = 11.5, MIN_CH = 3;
const NUM = "零〇一二三四五六七八九十百千萬兩半點";
const UNIT = "元版題分格秒頁條張行句個次倍成種招步樣支塊筆道本天年月位項題秒";
const LEFT_BAD_END = "第從對把用在跟和比連向被讓給為與及或這那某每";
const RIGHT_BAD_START = "了的嗎呢吧啊著過們得地裡麼";
const LEFT_GOOD_END = "的了過說問後前時裡";
const RIGHT_GOOD_START = ["是", "就", "都", "還", "但", "可是", "而", "再", "又", "連", "把", "用", "在", "跟", "和", "比", "才", "也", "卻", "不過", "所以", "只", "沒", "全", "每", "兩", "一"];

/** 原子 token：不可拆的最小單位 */
function tokens(text, keywords) {
  const kws = [...keywords].filter(Boolean).sort((a, b) => b.length - a.length);
  const out = [];
  for (let i = 0; i < text.length;) {
    const kw = kws.find((k) => text.startsWith(k, i));
    if (kw) { out.push(kw); i += kw.length; continue; }
    const q = /^「[^」]{1,10}」/.exec(text.slice(i));
    if (q) { out.push(q[0]); i += q[0].length; continue; }
    // 英數連續段，後面接「空白＋英文單位」（0.3 GB）也算一個
    const m = /^[A-Za-z0-9%$.+/\-–]+( [A-Za-z]+(?![A-Za-z]))?/.exec(text.slice(i));
    if (m) { const base = /^[A-Za-z0-9%$.+/\-–]+/.exec(text.slice(i))[0]; const useUnit = /^\d/.test(base) && m[1]; const t = useUnit ? m[0] : base; out.push(t); i += t.length; continue; }
    // 中文數字＋單位字
    const c = /^[零〇一二三四五六七八九十百千萬兩半點]+/.exec(text.slice(i));
    if (c) { let t = c[0]; if (UNIT.includes(text[i + t.length] ?? "~")) t += text[i + t.length]; out.push(t); i += t.length; continue; }
    out.push(text[i]); i++;
  }
  return out;
}

const w = (a) => emWidth(a.join(""));
const nch = (a) => [...a.join("").replace(/\s/g, "")].length;

function splitClause(tk) {
  if (w(tk) <= MAX_EM) return [tk.join("")];
  let best = null;
  for (let k = 1; k < tk.length; k++) {
    const L = tk.slice(0, k), R = tk.slice(k);
    const ls = L.join("").trimEnd(), rs = R.join("").trimStart();
    if (nch(L) < MIN_CH || nch(R) < MIN_CH) continue;
    if (/^\s/.test(tk[k]) && false) continue;
    const last = [...ls].at(-1), first = [...rs][0];
    if (LEFT_BAD_END.includes(last) || RIGHT_BAD_START.includes(first)) continue;
    // 半形空白（中英交界）不是斷點的優先理由，但不禁止
    let s = -0.5 * Math.abs(w(L) - w(R));
    if (/[A-Za-z0-9]$/.test(ls) !== /^[A-Za-z0-9]/.test(rs) && (/[A-Za-z0-9]$/.test(ls) || /^[A-Za-z0-9]/.test(rs))) s += 3; // 英文詞前後是自然斷點
    if (LEFT_GOOD_END.includes(last)) s += 4;
    if (RIGHT_GOOD_START.some((g) => rs.startsWith(g))) s += 3;
    if (w(L) > MAX_EM || w(R) > MAX_EM * 2) s -= 6;       // 偏好兩邊都放得下
    if (w(L) > MAX_EM) s -= 20;
    if (!best || s > best.s) best = { s, k };
  }
  if (!best) { // 退而求其次：硬切在 MAX_EM 內最後一個 token 邊界
    let acc = 0, k = 1; for (; k < tk.length; k++) { acc += emWidth(tk[k - 1]); if (acc + emWidth(tk[k]) > MAX_EM) break; }
    best = { k };
  }
  return [...splitClause(tk.slice(0, best.k)), ...splitClause(tk.slice(best.k))].map((x) => x.trim()).filter(Boolean);
}

export function breakZh(narration, keywords = []) {
  const clauses = narration.split(/(?<=[，。？！：；、])/).map((x) => x.replace(/[，。？！：；、]$/g, "").trim()).filter(Boolean);
  return clauses.flatMap((c) => splitClause(tokens(c, keywords))).join("\n");
}

if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(new URL(import.meta.url).pathname)) {
  const dry = process.argv.includes("--dry");
  for (const slug of process.argv.slice(2).filter((a) => !a.startsWith("--"))) {
    const f = `videos/${slug}/script.json`;
    const d = JSON.parse(fs.readFileSync(f, "utf8"));
    for (const s of d.scenes) {
      if (!s.subtitle?.zh || s.component === "EndCard" || s.silent) continue;
      const nz = breakZh(s.narration, s.keywords ?? []);
      const chk = (x) => x.replace(/[\s，。、！？：；「」『』（）,.!?:;()"'“”‘’…—\-–·]/g, "");
      if (chk(nz) !== chk(s.subtitle.zh)) { console.warn(`⚠ ${slug} ${s.id} 文字不一致，略過`); continue; }
      if (nz !== s.subtitle.zh) console.log(`${slug} ${s.id}: ${s.subtitle.zh.replaceAll("\n", " | ")}  →  ${nz.replaceAll("\n", " | ")}`);
      s.subtitle.zh = nz;
    }
    if (!dry) fs.writeFileSync(f, JSON.stringify(d, null, 1) + "\n");
  }
}

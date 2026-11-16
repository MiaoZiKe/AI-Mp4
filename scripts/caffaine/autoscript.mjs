#!/usr/bin/env node
// 套版器：videos/<slug>/script.md 的逐句表 → videos/<slug>/script.json（isoVersion 6）。
// 用法：node scripts/caffaine/autoscript.mjs <slug> [--md <script.md 路徑>] [--out <script.json 路徑>] [--force]
// script.md 格式（見 docs/channels/ai-daily-playbook.md「量產指令」）：
//   開頭幾行「欄位：值」＝ 標題／查證日／留言關鍵字／封面（兩行用 | 隔開）／封面副標／追蹤（詞:色,詞:色,詞:色）
//   然後一張表，表頭要有：念稿｜view｜素材｜tone｜重點詞（選填：來源｜狀態｜tag｜英）
//   重點詞用「、」隔開，每個都必須出現在念稿裡；它們依序變成 cue k1、k2、k3…（動畫跟著念到那個詞觸發）。
// 規格來源 docs/channels/caffaine-visual-plan-1116.md（view 12 種、tone 6 種）。已有 script.json 時不覆蓋（--force 才寫）。
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "../..");
const a = process.argv.slice(2), slug = a.find((x) => !x.startsWith("--") && a[a.indexOf(x) - 1] !== "--md" && a[a.indexOf(x) - 1] !== "--out");
const opt = (k) => { const i = a.indexOf(k); return i >= 0 ? a[i + 1] : null; };
if (!slug) { console.error("用法：node scripts/caffaine/autoscript.mjs <slug> [--md 檔] [--out 檔] [--force]"); process.exit(2); }
const mdPath = opt("--md") ?? path.join(ROOT, "videos", slug, "script.md"), outPath = opt("--out") ?? path.join(ROOT, "videos", slug, "script.json");
if (fs.existsSync(outPath) && !a.includes("--force")) { console.error(`✖ ${outPath} 已存在，不覆蓋（要重產請加 --force）`); process.exit(2); }
const err = (m) => { console.error("✖ " + m); process.exit(1); };
const lines = fs.readFileSync(mdPath, "utf8").split("\n");
// ── 表頭欄位
const meta = {}; for (const l of lines) { const m = /^([^|:：#\s][^:：|]{0,8})[:：]\s*(.+)$/.exec(l.trim()); if (m && !l.trim().startsWith("|")) meta[m[1]] = m[2].trim(); }
const hi = lines.findIndex((l) => l.trim().startsWith("|") && l.includes("念稿") && /view/i.test(l)); if (hi < 0) err("找不到表頭（要有 念稿、view、素材、tone、重點詞 欄）");
const cells = (l) => l.trim().replace(/^\||\|$/g, "").replace(/\\\|/g, "\u0001").split("|").map((x) => x.trim().replaceAll("\u0001", "|")); // 儲存格內要放 | 就寫 \|
const head = cells(lines[hi]), col = (n) => head.findIndex((h) => h.toLowerCase() === n.toLowerCase());
const C = { id: 0, say: col("念稿"), view: col("view"), src: col("素材"), tone: col("tone"), kw: col("重點詞"), source: col("來源"), status: col("狀態"), tag: col("tag"), en: col("英") };
for (const k of ["say", "view", "tone", "kw"]) if (C[k] < 0) err(`表頭缺「${k === "say" ? "念稿" : k === "kw" ? "重點詞" : k}」欄`);
const rows = []; // 一列一句
 for (let i = hi + 2; i < lines.length && lines[i].trim().startsWith("|"); i++) rows.push(cells(lines[i]));
const asOf = meta["查證日"] ?? new Date().toISOString().slice(0, 10).replaceAll("-", "/"), keyword = meta["留言關鍵字"] ?? err("缺「留言關鍵字：」");
const COLOR = { event: "primary", principle: "right", bug: "wrong", fix: "sky", unknown: "plum", claim: "note" };
const TAG = { event: "事件", principle: "原理", bug: "對照", fix: "做法", unknown: "還不知道", claim: "領取" };
const BEAT = { event: "hook", principle: "mechanism", bug: "check", fix: "so", unknown: "unknown", claim: "cta" };
const COLS = ["primary", "right", "wrong", "note", "sky", "plum"];
const ks = (s) => (s ?? "").split(/[、,，]/).map((x) => x.trim()).filter(Boolean);
const split = (s) => (s ?? "").split("|").map((x) => x.trim()).filter(Boolean);
const clean = (t) => t.replace(/[\s，。？！：；、「」『』“”（）()]/g, "");
// 字幕：逐標點斷行，單行超過 10 字再硬切（不切進重點詞裡）
const subZh = (t, ws) => t.split(/(?<=[，。？！：；、])/).map((x) => x.replace(/[，。？！：；、]$/g, "").trim()).filter(Boolean).flatMap((ln) => { const out = []; while ([...ln].length > 10) { let i = 10; for (const w of ws) { const j = ln.indexOf(w); if (j >= 0 && j < i && j + [...w].length > i) i = j > 3 ? j : j + [...w].length; } out.push(ln.slice(0, i)); ln = ln.slice(i); } out.push(ln); return out; }).join("\n");
const imgSize = (p) => { try { return JSON.parse(execFileSync("python3", ["-c", `from PIL import Image;import json;print(json.dumps(Image.open('${p}').size))`]).toString()); } catch { return [1280, 800]; } };
const isImg = (s) => /\.(png|jpe?g|webp)$/i.test(s);
const at = (i, n) => `k${Math.min(i, n) || 1}`;

const scenes = rows.map((r, idx) => {
  const id = `s${String(idx + 1).padStart(2, "0")}`, say = r[C.say], view = r[C.view], tone = r[C.tone], ws = ks(r[C.kw]), mat = C.src >= 0 ? r[C.src] : "";
  const T = `${id}（${say.slice(0, 10)}…）`;
  if (!COLOR[tone]) err(`${T} tone「${tone}」不認得（${Object.keys(COLOR).join("／")}）`);
  if (!ws.length) err(`${T} 重點詞不能空（至少 1 個，cue 靠它切）`);
  for (const w of ws) if (!say.includes(w)) err(`${T} 重點詞「${w}」不在念稿裡`);
  if (C.en < 0 || !r[C.en]) err(`${T} 缺英文字幕（表要有「英」欄，每句一行英文，可用 | 斷成兩行）`);
  const n = ws.length, K = (i) => at(i, n), c0 = COLOR[tone];
  const cues = ws.map((w, i) => ({ id: `k${i + 1}`, text: w }));
  const p = { tag: (C.tag >= 0 && r[C.tag]) || TAG[tone], tagColor: c0, track: Math.min(2, Math.floor(idx / Math.max(1, rows.length / 3))), kw: { [ws[0]]: c0 }, view, tone };
  if (C.status >= 0 && r[C.status]) { p.status = r[C.status]; p.statusAt = `${K(1)}+6`; }
  const m = split(mat);
  switch (view) {
    case "kinetic": { const big = m[0] ?? ws[0], unit = m[1] ?? ""; p.rows = [{ big, unit, at: "start-10", color: c0, size: big.length > 4 ? 150 : 220, usize: 110 }]; if (n > 1) p.rows.push({ big: ws[n - 1], unit: "", at: K(n), color: "wrong", size: 150, usize: 110 }); if (tone === "unknown") p.q = { text: m[2] ?? `${ws[n - 1]}？`, at: K(n) }; break; }
    case "chat": p.title = "和 AI 對話"; p.msgs = [{ who: "me", text: mat || say, typeAt: "start+4", typeDur: 24, at: K(1) }]; p.chips = ws.slice(0, 2).map((w, i) => ({ text: w, at: `${K(i + 1)}+8`, color: COLS[i + 1], hot: i === 1 })); break;
    case "split": {
      p.layout = "stack";
      if (m.length === 2 && isImg(m[0])) { p.top = { src: m[0], label: ws[0], color: "note", at: "start-1" }; p.bottom = { src: m[1], label: ws[n - 1], color: c0, at: K(n) }; }
      else { const cs = (s) => (s ?? "").split(",").map((x) => x.trim()).filter(Boolean); p.top = { label: ws[0], by: "實測（節錄）", cells: cs(m[0] ?? ws[0]), at: "start-1", color: "wrong" }; p.bottom = { label: ws[n - 1], by: "實測（節錄）", cells: cs(m[1] ?? ws[n - 1]), at: K(n), color: "right" }; p.heads = cs(m[2]).length ? cs(m[2]) : p.top.cells.map((_, i) => `欄${i + 1}`); p.diffCell = 0; p.diffAt = K(n); if (!m[3] || !m[4]) err(`${T} split 文字表格要在素材第 4、5 段放實測檔（videos/<slug>/ 底下的 json，上下各一）`); p.top.verbatim = m[3]; p.bottom.verbatim = m[4]; p.badge = { text: ws.join("・"), at: K(n) }; }
      break; }
    case "browser": { const imgs = m.filter(isImg); if (!imgs.length) err(`${T} browser 的素材要是圖路徑（public/ 底下，可用 | 放多張）`); p.wide = true; p.shots = imgs.map((s, i) => ({ src: s, at: i ? K(Math.min(n, i + 1)) : "start-1", img: imgSize(path.join(ROOT, "public", s)), label: `${ws[Math.min(i, n - 1)]}` })); p.scroll = [0, 400]; p.scrollAt = K(1); p.items = ws.map((w, i) => ({ icon: "text", text: w, sub: "", at: K(i + 1), color: COLS[i % 6] })); break; }
    case "device": { if (!isImg(mat)) err(`${T} device 的素材要是圖路徑`); p.src = mat; p.at = "start-1"; p.tapAt = K(n); p.cards = ws.map((w, i) => ({ icon: i ? "tap" : "phone", text: w, sub: "", at: K(i + 1), color: COLS[i % 6] })); break; }
    case "lens": { if (!isImg(mat)) err(`${T} lens 的素材要是圖路徑`); const [w, h] = imgSize(path.join(ROOT, "public", mat)); p.src = mat; p.ring = [Math.round(w * 0.2), Math.round(h * 0.3), Math.round(w * 0.5), Math.round(h * 0.15)]; p.note = ws[0]; p.noteAt = K(1); p.scanAt = K(Math.min(2, n)); p.stampAt = K(n); p.stamp = ws[n - 1].slice(0, 2); p.zoom = { src: mat, w, h, cap: `放大看：${ws[n - 1]}` }; break; }
    case "flow": { const labels = m.length ? m : ws; p.nodes = labels.slice(0, 4).map((l, i) => ({ icon: ["redo", "mag", "text", "chip"][i], label: l, sub: "", color: COLS[i % 6], at: i ? K(Math.min(n, i + 1)) : "start-1" })); p.lights = p.nodes.slice(1).map((_, i) => ({ from: K(i + 1), to: K(Math.min(n, i + 2)) })); break; }
    case "claim": p.keyword = m[0] ?? keyword; p.kicker = m[1] ?? `想要${ws[0]}的提示詞`; p.kwAt = K(1); p.allAt = K(n); p.card = m[2] ?? "提示詞＋用法"; p.sub = "私訊給你"; break;
    case "draw": if (m.length > 1) { p.mode = "lots"; p.stem = m[0]; p.options = m.slice(1); p.rounds = ws.slice(0, 2).map((w, i) => ({ label: i ? "第二次" : "第一次", from: K(i + 1), at: K(Math.min(n, i + 2)), pick: i, color: i ? "right" : "wrong" })); } else { p.mode = "dice"; p.kicker = m[0] ?? ws[0]; p.rounds = [{ label: "第一次", at: K(1), face: 3, color: "primary" }, { label: "第二次", at: K(Math.min(2, n)), face: 5, color: "note" }]; p.diffAt = K(n); } p.note = "示意：字和點數是舉例，不是實際機率"; break;
    case "check": p.mode = "list"; p.head = { text: m[0] ?? ws[0], at: "start-1", color: c0 }; p.items = (m.length > 1 ? m.slice(1) : ws).map((t, i) => ({ text: t, sub: "", at: K(i + 1), color: COLS[i % 6] })); break;
    case "chart": p.kind = "bars"; p.items = ws.map((w, i) => ({ t: w, h: Math.max(0.25, 0.9 - i * 0.2), color: COLS[i % 6] })); p.growAt = "start+4"; p.chips = [{ text: ws[n - 1], at: K(n), color: "wrong" }]; p.note = "示意：長短是舉例，不是實際比例"; break;
    case "editor": {
      if (!mat) err(`${T} editor 的素材要是文字檔路徑（repo 內）`); const f = path.join(ROOT, m[0]); if (!fs.existsSync(f)) err(`${T} 找不到 ${m[0]}`);
      const all = fs.readFileSync(f, "utf8").split("\n"); let hit = all.map((t, i) => [t, i + 1]).filter(([t]) => ws.some((w) => t.includes(w))).slice(0, 3); if (!hit.length) hit = all.map((t, i) => [t, i + 1]).filter(([t]) => t.trim()).slice(0, 2);
      p.file = path.basename(m[0]); p.src = m[0]; p.wrap = true; p.before = 1; p.after = 0; p.lines = hit.map(([t, nn], i) => { const mk = ws.find((w) => t.includes(w)); return { t: t.trim(), n: nn, at: i ? `${K(1)}+${i * 10}` : "start-1", dur: 24, ...(mk ? { mark: mk, markAt: K(1) } : {}) }; }); p.hl = 0; p.hlAt = K(Math.min(2, n)); p.size = 48; break; }
    default: err(`${T} view「${view}」不認得`);
  }
  return { id, beat: BEAT[tone], narration: say, subtitle: { zh: subZh(say, ws), en: r[C.en] }, keywords: ws.slice(0, 1), cues, component: "IsoScene", props: p, sources: C.source >= 0 && r[C.source] ? [r[C.source]] : idx ? ["（待補來源）"] : [], para: 1 };
});
if (scenes.length) scenes[0].props.asOf = `查證截至 ${asOf}`;
scenes.push({ id: "end", narration: "", subtitle: { zh: "", en: "" }, keywords: [], component: "IsoScene", props: { panel: "caffend", keyword }, sources: [], silent: true, durationSec: 3.6 });
const cover = (meta["封面"] ?? meta["標題"] ?? slug).split("|").map((x) => x.trim());
const tracker = (meta["追蹤"] ?? "").split(",").filter(Boolean).map((x) => x.split(":").map((y) => y.trim()));
const out = { slug, title: meta["標題"] ?? slug, asOf, styleVersion: 3, stage: "iso", isoVersion: 6, sample: false, channelLogo: "caffaine", channel: { name: "CaffAIne", tag: "", slogan: "看懂一個 AI 新知" }, voice: { voiceName: "Sulafat", mode: "take", languageCode: "cmn-TW", profile: "ai-report-v5" }, cover: { title: cover, sub: meta["封面副標"] ?? "" }, tracker: tracker.length ? tracker : ws0(scenes), scenes };
function ws0(sc) { return sc.slice(0, 3).map((s, i) => [s.cues[0].text, COLS[i]]); }
fs.mkdirSync(path.dirname(outPath), { recursive: true }); fs.writeFileSync(outPath, JSON.stringify(out, null, 1));
console.log(`✔ ${path.relative(ROOT, outPath)}：${scenes.length} 幕（${scenes.filter((s) => s.props.view).map((s) => s.props.view).join("／")}）。素材路徑要補的：${scenes.filter((s) => s.sources[0] === "（待補來源）").length} 幕來源待補。下一步：npm run validate ${slug}`);

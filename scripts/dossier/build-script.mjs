#!/usr/bin/env node
// 哩股哩股 dossier 片：plan.json（精簡格式）→ script.json（完整格式）
// 用法：node scripts/dossier/build-script.mjs <slug> [--plan=<plan.json>] [--out=<script.json>]
//   預設讀 videos/<slug>/plan.json、寫 videos/<slug>/script.json。
// 鏡型範本在 scripts/dossier/templates/<type>.json；格式說明：docs/channels/liguligu-plan-format.md
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "../..");
const TPL_DIR = path.join(ROOT, "scripts/dossier/templates");
const args = process.argv.slice(2);
const opt = (k) => args.find((a) => a.startsWith(`--${k}=`))?.slice(k.length + 3);
const slug = args.find((a) => !a.startsWith("--"));
if (!slug && !opt("plan")) { console.error("用法：node scripts/dossier/build-script.mjs <slug> [--plan=…] [--out=…]"); process.exit(2); }
const planPath = opt("plan") ?? path.join(ROOT, "videos", slug, "plan.json");

const errors = [];
const E = (m) => errors.push(m);
const plan = JSON.parse(fs.readFileSync(planPath, "utf8"));
const outPath = opt("out") ?? path.join(ROOT, "videos", slug ?? plan.slug, "script.json");
const types = fs.readdirSync(TPL_DIR).filter((f) => f.endsWith(".json")).map((f) => f.replace(/\.json$/, ""));

for (const k of ["slug", "title", "asOf", "thesis"]) if (typeof plan[k] !== "string" || !plan[k]) E(`頂層缺少 ${k}`);
// 留言關鍵字改固定內容（2026/11/20）：Andy 給固定字之前 endCard.comment 可省略；有填就是 2–4 字
if (!plan.endCard || typeof plan.endCard !== "object") E("頂層要有 endCard（comment、next 都可省略）");
else if (plan.endCard.comment !== undefined && !(typeof plan.endCard.comment === "string" && plan.endCard.comment.length >= 2 && plan.endCard.comment.length <= 4)) E("endCard.comment 有填就要是 2–4 字（留言關鍵字）；沒有固定字就整個省略");
if (!Array.isArray(plan.scenes) || !plan.scenes.length) E("scenes 是空的");

const PH = /\{\{(\w+)(\?)?(?:\|([^}]*))?\}\}/g;
const REMOVE = Symbol("remove");
const builtin = { asOf: plan.asOf ?? "", comment: plan.endCard?.comment ?? "", slug: plan.slug ?? "" };

/** 把範本裡的 {{名稱}} 換成欄位值；整個字串只有一個佔位時保留原型別（陣列、數字） */
function fill(node, fields, where, used) {
  if (typeof node === "string") {
    const s = node.replace(/\{\{(asOf|comment|slug)\}\}/g, (_, k) => builtin[k]);
    const whole = /^\{\{(\w+)(\?)?(?:\|([^}]*))?\}\}$/.exec(s);
    const get = (name, opt, def) => {
      used.add(name);
      const v = fields[name];
      if (v === undefined || v === null || v === "" || (Array.isArray(v) && !v.length)) {
        if (opt) return REMOVE;
        if (def !== undefined) return def;
        E(`${where}: 欄位「${name}」沒填（不能留空，會變空卡）`);
        return "";
      }
      return v;
    };
    if (whole) return get(whole[1], whole[2], whole[3]);
    return s.replace(PH, (_, name, opt, def) => { const v = get(name, opt, def); return v === REMOVE ? "" : String(v); });
  }
  if (Array.isArray(node)) return node.map((x) => fill(x, fields, where, used));
  if (node && typeof node === "object") {
    const out = {}; let removed = false;
    for (const [k, v] of Object.entries(node)) {
      const r = fill(v, fields, where, used);
      if (r === REMOVE) removed = true; else out[k] = r;
    }
    // 選填欄位沒填：物件只剩時間欄位就整個拿掉（例如沒有 note 就不留 { at }）
    if (removed && Object.keys(out).every((k) => k === "at" || /At$/.test(k))) return REMOVE;
    return out;
  }
  return node;
}

/** 把 at 字串裡的 c1…c9 換成這一幕的 cue id（cue 詞依序編號） */
function mapCues(node, ids) {
  if (typeof node === "string") return /^c\d(?:[+-]\d+)?$/.test(node) ? ids[Number(node[1]) - 1] + node.slice(2) : node;
  if (Array.isArray(node)) return node.map((x) => mapCues(x, ids));
  if (node && typeof node === "object") return Object.fromEntries(Object.entries(node).map(([k, v]) => [k, (k === "at" || /Ats?$/.test(k)) ? mapCues(v, ids) : mapCues(v, ids)]));
  return node;
}

const scenes = [];
let hasFail = false;
for (const [i, sc] of (plan.scenes ?? []).entries()) {
  const id = `s${String(i + 1).padStart(2, "0")}`;
  const where = `第 ${i + 1} 幕 (${id}, ${sc.type})`;
  if (!types.includes(sc.type)) { E(`${where}: 鏡型「${sc.type}」不存在，可用：${types.join("｜")}`); continue; }
  const tpl = JSON.parse(fs.readFileSync(path.join(TPL_DIR, `${sc.type}.json`), "utf8"));
  const meta = tpl._meta;
  if (i === 0 && sc.type !== "hook") E(`${where}: 第一幕要是 hook`);
  if (i > 0 && sc.type === "hook") E(`${where}: hook 只能放第一幕`);
  for (const k of ["narration"]) if (typeof sc[k] !== "string" || !sc[k]) E(`${where}: 缺 ${k}`);
  if (!sc.subtitle?.zh || !sc.subtitle?.en) E(`${where}: 缺 subtitle.zh／en`);
  if (!Array.isArray(sc.sources) || !sc.sources.length) E(`${where}: 缺 sources（陣列，每鏡下面一行出處）`);
  const cueWords = sc.cues ?? [];
  if (cueWords.length !== meta.cues) E(`${where}: ${sc.type} 要 ${meta.cues} 個 cue 詞（依念稿順序），目前 ${cueWords.length}。${meta.cueHint}`);
  const spoken = String(sc.tts ?? sc.narration ?? "");
  const subZh = String(sc.subtitle?.zh ?? "").replace(/\n/g, "");
  for (const w of cueWords) if (!spoken.includes(w) && !String(sc.narration ?? "").includes(w)) E(`${where}: cue 詞「${w}」沒出現在念稿裡`);
  const ids = cueWords.map((_, k) => `c${k + 1}`);
  const used = new Set();
  const fields = sc.fields ?? {};
  let props = fill(tpl.props, fields, where, used);
  props = mapCues(props, ids);
  if (sc.hold !== undefined) props.hold = sc.hold;
  if (sc.type === "ask" && !plan.endCard?.comment) delete props.cta; // 沒有留言關鍵字：不放「留言「」拿完整資料」那一行
  for (const k of Object.keys(fields)) if (!used.has(k)) E(`${where}: 欄位「${k}」這個鏡型用不到（拼錯了嗎？）`);
  const kwFrom = (meta.kw ?? []).map((k) => fields[k]).flat().filter((x) => typeof x === "string" && x);
  const keywords = sc.keywords ?? kwFrom.filter((w) => subZh.includes(w) || spoken.includes(w));
  const scene = {
    id,
    narration: sc.narration,
    ...(sc.tts ? { tts: sc.tts } : {}),
    subtitle: sc.subtitle,
    keywords,
    cues: cueWords.map((text, k) => ({ id: ids[k], text })),
    beat: sc.beat ?? meta.beat,
    component: "DossierScene",
    props,
    sources: sc.sources,
  };
  scenes.push(scene);
}

if (plan.endCard) scenes.push({
  id: "end", narration: "", subtitle: { zh: "", en: "" }, keywords: [], cues: [], beat: "cta", component: "EndCard",
  silent: true, durationSec: 3.6, props: { panel: "end", endCard: { ...(plan.endCard.comment ? { comment: plan.endCard.comment } : {}), ...(plan.endCard.next ? { next: plan.endCard.next } : {}) } }, sources: [],
});

const script = {
  slug: plan.slug, title: plan.title, asOf: plan.asOf, styleVersion: 3, stage: "dossier",
  channel: plan.channel ?? { name: "哩股哩股", tag: "查到底", slogan: "數字，查過再信" },
  news: {
    layout: "fill", mark: "LIGULIGU", section: plan.news?.section ?? "國際", sectionEn: plan.news?.sectionEn ?? "INTERNATIONAL",
    places: plan.places ?? {}, ...(plan.link ? { link: plan.link } : {}), ...(plan.news?.tickerStatic ? { tickerStatic: plan.news.tickerStatic } : {}),
  },
  voice: plan.voice ?? { voiceName: "Charon", model: "gemini-3.8-flash-tts", mode: "take", profile: "liguligu", note: "API 整篇一次生成" },
  cover: plan.cover ?? { title: [plan.title], sub: "" },
  audio: { bgm: false, sfx: false },
  scenes,
  thesis: plan.thesis,
};

if (errors.length) { console.error(`build-script：${errors.length} 個問題\n- ` + errors.join("\n- ")); process.exit(1); }
fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, JSON.stringify(script, null, 2) + "\n");
console.log(`已寫入 ${path.relative(ROOT, outPath)}（${scenes.length} 幕）`);

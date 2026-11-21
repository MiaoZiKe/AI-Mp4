// 檔案室式（script.json 頂層 stage: "dossier"；哩股哩股的專業嚴肅版）的檢查。
// 由 scripts/validate.mjs 的 validate() 呼叫（helpers 由它傳入）。時間軸、配音、字幕沿用 styleVersion 3 的整篇配音流程。
// 畫面元件：src/components/dossier/（engine.ts、DossierVideo.tsx）；token：src/theme.ts 的 THEME_DOSSIER／LAYOUT_DOSSIER。
// 頻道規則：docs/channels/liguligu.md（事實紀律、查證狀態、照片標「示意」、常駐「查證截至」）。
import fs from "node:fs";
import path from "node:path";
import { resolveProfile, profileIssues, cnTermIssues } from "../voice-profile.mjs";

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "../..");
const AT_BASE = ["start", "voice", "end", "exit"];
const PANELS = ["hook", "timeline", "versus", "claim", "notequal", "pending", "ask"];
const STATUS = ["confirmed", "report", "none", "pending"];
/** 頻道禁用語（docs/channels/liguligu.md 第 4 節） */
const BANNED = ["驚爆", "內幕", "真相只有一個", "你絕對想不到", "細思極恐"];

export function validateDossier(script, h) {
  const errors = [], warns = [];
  const E = (m) => errors.push(m), W = (m) => warns.push(m);
  for (const k of ["slug", "title", "asOf"]) if (typeof script[k] !== "string" || !script[k]) E(`頂層缺少 ${k}`);
  if (script.asOf && !/^\d{4}\/\d{1,2}\/\d{1,2}$/.test(script.asOf)) E(`asOf 格式應為 YYYY/M/D：${script.asOf}（畫面底部常駐「查證截至」用它）`);
  if (script.styleVersion !== 3) E("stage: \"dossier\" 要搭配 styleVersion: 3（沿用整篇配音與時間軸 v2 的流程）");
  if (!script.voice || typeof script.voice.voiceName !== "string") E("頂層缺少 voice.voiceName");
  else if (script.voice.voiceName === "TBD") W("voice.voiceName 還是 TBD：男聲音色等使用者試聽選定，在那之前不送 TTS 請求（目前是無聲版）");
  const prof = resolveProfile(script.voice);
  if (!prof) E("沒有 voice.profile：配音前先定旁白設定檔（docs/voice-profiles.md）");
  else for (const m of profileIssues(prof)) E(m);
  const scenes = Array.isArray(script.scenes) ? script.scenes : [];
  if (!scenes.length) { E("scenes 是空的"); return { errors, warns, est: 0 }; }

  // 襯線字型子集：props、封面、頻道名裡的字都要在子集裡，缺字會掉回系統字
  const charsFile = path.join(ROOT, "public/fonts/dossier/chars.txt");
  const have = fs.existsSync(charsFile) ? new Set(fs.readFileSync(charsFile, "utf8")) : null;
  if (!have) W(`還沒有襯線字型：先跑 node scripts/dossier/fetch-fonts.mjs ${script.slug}`);
  const missing = new Set();
  const serif = (v) => { if (typeof v === "string") { if (have) for (const c of v) if (c !== "\n" && !have.has(c)) missing.add(c); } else if (v && typeof v === "object") Object.values(v).forEach(serif); };
  serif(script.cover); serif(script.channel); serif(script.news);
  // 「國際新聞」版（頂層 news，可省略）：欄目名、地點（經緯度）、連線；每鏡 props.news＝{ dateline, place, lt }
  const news = script.news;
  if (news !== undefined) {
    if (!news || typeof news.section !== "string" || !news.section) E("news.section 要是字串（新聞條上的欄目名，例如「國際」）");
    for (const [id, pl] of Object.entries(news?.places ?? {})) if (typeof pl?.zh !== "string" || typeof pl?.en !== "string" || !(Math.abs(pl?.lon) <= 180) || !(Math.abs(pl?.lat) <= 90)) E(`news.places.${id} 要有 zh、en、lon、lat`);
    if (news?.link && (!news.places?.[news.link.from] || !news.places?.[news.link.to] || typeof news.link.at !== "string" || !/^[^:\s]+:/.test(news.link.at))) E("news.link 要有 from、to（都在 news.places 裡）與 at（寫「幕id:cue」）");
    if (news?.layout !== undefined && news.layout !== "fill") E("news.layout 只能是 \"fill\"（填滿版：上下留白各 ≤60px）或省略");
    if (news && news.layout !== "fill") W("news 沒有 layout: \"fill\"：上方約 224px、1700 以下會留空（使用者 2026/11/15 要求上下留白 ≤60px，新片請加）");
  }

  const cueIds = new Map(scenes.map((s) => [s.id, new Set((s.cues ?? []).map((c) => c.id))]));
  const checkAt = (at, s, tag) => {
    if (typeof at !== "string") return E(`${tag}: 要是字串（cue id 或 start｜voice｜end｜exit，可加減幾幀；別幕的 cue 寫「幕id:cue」），不手填秒數`);
    const m = /^(?:([^:\s]+):)?([^\s+-]+)([+-]\d+)?$/.exec(at);
    if (!m) return E(`${tag}:「${at}」格式不對`);
    const sid = m[1] ?? s.id;
    if (!cueIds.has(sid)) return E(`${tag}:「${at}」指到不存在的幕「${sid}」`);
    if (!AT_BASE.includes(m[2]) && !cueIds.get(sid).has(m[2])) E(`${tag}:「${at}」找不到 cue「${m[2]}」（幕 ${sid}）`);
  };
  /** 走過 props：時間欄位（at／…At／…Ats）、狀態標籤、照片 */
  const walk = (v, s, tag, where, found) => {
    if (Array.isArray(v)) return v.forEach((x, k) => walk(x, s, tag, `${where}[${k}]`, found));
    if (!v || typeof v !== "object") return;
    if (typeof v.kind === "string" && typeof v.text === "string") { found.tags.push(v); if (!STATUS.includes(v.kind)) E(`${tag}: ${where} 的狀態 kind「${v.kind}」不在 ${STATUS.join("｜")}`); }
    if (typeof v.name === "string" && "caption" in v) found.photos.push(v);
    for (const [k, x] of Object.entries(v)) {
      if (k === "at" || /At$/.test(k)) { checkAt(x, s, `${tag}: ${where}.${k}`); found.ats += 1; }
      else if (/Ats$/.test(k)) { if (!Array.isArray(x)) E(`${tag}: ${where}.${k} 要是陣列`); else x.forEach((y, j) => { checkAt(y, s, `${tag}: ${where}.${k}[${j}]`); found.ats += 1; }); }
      else walk(x, s, tag, `${where}.${k}`, found);
    }
  };

  // 內容沿用另一支片（contentFrom）：旁白、念稿、字幕、cue、出處要一字不差
  const fromPath = script.contentFrom ? path.join(ROOT, "videos", script.contentFrom, "script.json") : null;
  const from = fromPath && fs.existsSync(fromPath) ? JSON.parse(fs.readFileSync(fromPath, "utf8")) : null;
  if (script.contentFrom && !from) E(`contentFrom 指到的 videos/${script.contentFrom}/script.json 不存在`);
  if (from) {
    if (from.asOf !== script.asOf) E(`asOf 和 ${script.contentFrom} 不同（${script.asOf} vs ${from.asOf}）`);
    if (from.scenes.length !== scenes.length) E(`幕數和 ${script.contentFrom} 不同`);
    for (const [i, s] of scenes.entries()) {
      const o = from.scenes[i]; if (!o) continue;
      for (const k of ["id", "narration", "tts", "subtitle", "keywords", "cues", "sources"]) if (JSON.stringify(o[k]) !== JSON.stringify(s[k])) E(`第 ${i + 1} 幕 (${s.id}): ${k} 和 ${script.contentFrom} 不一樣（這一版只換畫面，不改內容）`);
    }
  }

  const ids = new Set();
  let chars = 0;
  const allStatus = new Set();
  for (const [i, s] of scenes.entries()) {
    const tag = `第 ${i + 1} 幕 (${s.id ?? "?"})`;
    if (!s.id || ids.has(s.id)) E(`${tag}: id 缺少或重複`); ids.add(s.id);
    if (s.component === "EndCard") { // 片尾卡（2026/11/15 所有頻道規則：LOGO 動畫＋招牌音＋留言關鍵字）
      if (i !== scenes.length - 1) E(`${tag}: EndCard 只能是最後一幕`);
      if (s.silent !== true || !(s.durationSec >= 3)) E(`${tag}: 片尾卡要 silent: true、durationSec ≥ 3`);
      if (s.props?.panel !== "end") E(`${tag}: 片尾卡 props.panel 要是 "end"`);
      const c = s.props?.endCard?.comment;
      if (c === undefined) { /* 留言關鍵字改固定內容（2026/11/20）：Andy 給固定字之前可以不放 */ }
      else if (typeof c !== "string" || h.len(c) < 2 || h.len(c) > 4) E(`${tag}: props.endCard.comment 有填就要是 2–4 個字的留言關鍵字`);
      else if (!String(scenes[i - 1]?.tts ?? scenes[i - 1]?.narration ?? "").includes(c)) W(`${tag}: 最後一句念稿沒有念到留言關鍵字「${c}」`);
      continue;
    }
    if (s.component !== "DossierScene") E(`${tag}: stage "dossier" 的 component 只能是 DossierScene：${s.component}`);
    if (typeof s.narration !== "string" || !s.narration) E(`${tag}: 缺 narration`);
    chars += h.len(s.narration ?? "");
    if (!s.subtitle?.zh || !s.subtitle?.en) E(`${tag}: 缺 subtitle.zh／en`);
    for (const [k, t] of [["念稿", s.tts ?? s.narration], ["字幕", s.subtitle?.zh]]) {
      for (const m of cnTermIssues(t)) W(`${tag}: ${k}有${m}`);
      for (const w of BANNED) if (String(t ?? "").includes(w)) E(`${tag}: ${k}有頻道禁用語「${w}」（docs/channels/liguligu.md 第 4 節）`);
    }
    if (h.readingIssues) for (const m of h.readingIssues(s.tts ?? s.narration)) W(`${tag}: 念稿 ${m}`);
    // 字幕短語：一次一段單行，64px 時 ≤13 個全形字才不會超出安全區
    for (const ph of h.splitPhrases(s.subtitle?.zh ?? "", s.keywords ?? [], h.SUB_MAX_EM_V2)) if (h.emWidth(h.phraseDisplay ? h.phraseDisplay(ph) : ph) > 13) E(`${tag}: 字幕「${ph}」超過 13 個全形字`);
    for (const p of String(s.subtitle?.en ?? "").split("|")) if (p.trim().length > 46) W(`${tag}: 英文字幕「${p.trim()}」超過 46 字元`);
    if (!Array.isArray(s.sources) || !s.sources.length) E(`${tag}: 缺 sources（每鏡下面一行出處）`);
    else if (h.emWidth(`來源：${s.sources.join("；")}`) > (script.news?.layout === "fill" ? 30 : 32)) E(`${tag}: 出處一行超過 ${script.news?.layout === "fill" ? 30 : 32} 個全形字，會超出安全區（填滿版出處 30px）`);
    const p = s.props ?? {};
    if (!PANELS.includes(p.panel)) { E(`${tag}: props.panel 要是 ${PANELS.join("｜")}：${p.panel}`); continue; }
    if (i === 0 && p.panel !== "hook") E(`${tag}: 第一鏡要是 hook（第 0 幀就是完整大字加一個正在動的東西）`);
    if (p.hold !== undefined && !(Number.isInteger(p.hold) && p.hold >= 0 && p.hold <= 20)) E(`${tag}: hold 要是 0–20 的整數（下一鏡開始後多留幾幀）`);
    if (news !== undefined) {
      const n = p.news;
      if (!n || typeof n.dateline !== "string" || !n.dateline) E(`${tag}: 國際新聞版每鏡要有 props.news.dateline（電頭：地點・日期）`);
      else if (h.emWidth(n.dateline) > 22) E(`${tag}: 電頭「${n.dateline}」太長，會撞到右邊的鏡號`);
      if (n?.place !== undefined && !news?.places?.[n.place]) E(`${tag}: props.news.place「${n.place}」不在 news.places 裡`);
      if (typeof n?.lt !== "string" || !n.lt || h.len(n.lt) > 6) E(`${tag}: props.news.lt 要是 6 個字以內的欄目籤（這一鏡在講什麼）`);
    }
    const found = { tags: [], photos: [], ats: 0 };
    walk(p, s, tag, "props", found);
    serif(p);
    for (const t of found.tags) allStatus.add(t.kind);
    for (const ph of found.photos) {
      if (!/示意/.test(ph.caption ?? "")) E(`${tag}: 照片「${ph.name}」的圖說沒有「示意」（照片只當情境；docs/channels/liguligu.md 3-8）`);
      if (!fs.existsSync(path.join(ROOT, "public", "dossier", script.slug, `${ph.name}.jpg`))) E(`${tag}: 找不到 public/dossier/${script.slug}/${ph.name}.jpg：先 python3 scripts/dossier/make-photos.py ${script.slug}`);
      if (h.emWidth(ph.caption ?? "") > 15) W(`${tag}: 圖說「${ph.caption}」超過 15 個全形字，可能比照片寬`);
    }
    // 文件摹本要標「示意」（不是文件原件）
    for (const k of ["doc", "left", "right"]) { const d = p[k]; if (d && typeof d === "object" && "note" in d && !/示意/.test(d.note ?? "")) E(`${tag}: props.${k}.note 要標「示意」（文件摹本不是原件）`); }
    if (p.panel === "hook") {
      if (!/\d/.test(String(p.num ?? ""))) E(`${tag}: hook 要有數字（props.num）`);
      if (!p.doc?.scanAts?.includes("start")) E(`${tag}: hook 的掃描線要從 start 開始（第 0 幀就有東西在動）`);
      const early = (a) => /^start(\+\d+)?$/.test(String(a)) && Number(String(a).split("+")[1] ?? 0) <= 24;
      if (!early(p.doc?.frameAt) || !early(p.callout?.at)) E(`${tag}: hook 的紅框與引線標註要在 start+24 幀以內（1 秒內出現標註）`);
    }
    // 同屏主要東西 ≤3 樣；每鏡的事件數夠不夠密（每 2–3 秒至少一個）
    if (found.photos.length + found.tags.length > 4) W(`${tag}: 照片＋狀態標籤 ${found.photos.length + found.tags.length} 個，確認同屏主要東西 ≤3 樣`);
    const sec = h.len(s.narration ?? "") / 4.75;
    if (found.ats < Math.ceil(sec / 2.5) + 1) W(`${tag}: 只有 ${found.ats} 個畫面事件，約 ${sec.toFixed(1)} 秒的鏡頭偏少（每 2–3 秒要有事件）`);
  }
  if (missing.size) E(`襯線字型子集沒有「${[...missing].join("")}」：重跑 node scripts/dossier/fetch-fonts.mjs ${script.slug}`);
  if (!allStatus.size) E("全片沒有任何查證狀態標籤（每個說法都要有狀態；docs/channels/liguligu.md 3-2）");
  // 短片沒有片尾卡：和 liguligu-jensen 一樣照實留一個 error，不為了過關硬加片尾卡（docs/channels/liguligu.md 第 2 節）
  if (scenes[scenes.length - 1].component !== "EndCard") E("最後一幕必須是 EndCard（片尾卡）");
  const est = Math.round(chars / 4.75);
  if (est < 45 || est > 75) W(`配音版總長估算 ${est} 秒，正式片建議 45–75 秒（哩股哩股短片是 20–26 秒）`);
  return { errors, warns, est };
}

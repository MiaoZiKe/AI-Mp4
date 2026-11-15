// 談晴說礙頻道貼文風格（script.json 頂層 stage: "tanqing"）的檢查。
// 由 scripts/validate.mjs 的 validate() 呼叫（helpers 由它傳入）。時間軸、配音、字幕沿用 styleVersion 3 的整篇配音流程。
// 畫面元件：src/components/tanqing/（engine.ts、TanqingVideo.tsx）；token：src/theme.ts 的 THEME_TANQING／LAYOUT_TANQING。
// 風格依據：docs/channels/tanqing-ref/（頻道實際發的輪播圖）；口吻規則：docs/channels/tanqing-shuoai.md（禁用語與 stage "notes" 共用）。
import fs from "node:fs";
import path from "node:path";
import { resolveProfile, profileIssues, cnTermIssues } from "../voice-profile.mjs";
import { TANQING_BANNED, TANQING_SOFT } from "../notes/validate-notes.mjs";

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "../..");
const AT_BASE = ["start", "voice", "end", "exit"];
const FIGS = { people: ["count", "mark"], form: ["ask"], bowl: [], mark: [] };
const KINDS = ["ai", "qing", "ask"];
// 完整片（頂層 tanqing.film: true，第一支 videos/talk-ep01/）多出來的圖形與頁種；短片不寫 film 就完全照舊
const FIGS_FILM = { window: ["sky"], months: [], grid: ["count", "mark"], bars: ["bars"], line: ["points", "yMin", "yMax"], week: [], pair: ["a", "b"], hbars: ["bars", "max"], rows: ["rows"], phone: [], bento: [], key: [] };
const KINDS_FILM = ["next", "end"];

export function validateTanqing(script, h) {
  const errors = [], warns = [];
  const film = script.tanqing?.film === true;
  const figs = film ? { ...FIGS, ...FIGS_FILM } : FIGS, kinds = film ? [...KINDS, ...KINDS_FILM] : KINDS;
  const E = (m) => errors.push(m), W = (m) => warns.push(m);
  for (const k of ["slug", "title", "asOf"]) if (typeof script[k] !== "string" || !script[k]) E(`頂層缺少 ${k}`);
  if (script.asOf && !/^\d{4}\/\d{1,2}\/\d{1,2}$/.test(script.asOf)) E(`asOf 格式應為 YYYY/M/D：${script.asOf}`);
  if (script.styleVersion !== 3) E("stage: \"tanqing\" 要搭配 styleVersion: 3（沿用整篇配音與時間軸 v2 的流程）");
  if (!script.voice || typeof script.voice.voiceName !== "string") E("頂層缺少 voice.voiceName");
  else if (script.voice.voiceName !== "Sulafat") W(`談晴說礙的音色固定 Sulafat（CLAUDE.md 各頻道音色）：${script.voice.voiceName}`);
  const prof = resolveProfile(script.voice);
  if (!prof) E("沒有 voice.profile：配音前先定旁白設定檔（docs/voice-profiles.md）");
  else for (const m of profileIssues(prof)) E(m);
  const scenes = Array.isArray(script.scenes) ? script.scenes : [];
  if (!scenes.length) { E("scenes 是空的"); return { errors, warns, est: 0 }; }
  // 襯線字型子集：畫面上用襯線排的字（大標、字標）都要在子集裡，缺字會掉回系統字
  const charsFile = path.join(ROOT, "public/fonts/tanqing/chars.txt");
  const have = fs.existsSync(charsFile) ? new Set(fs.readFileSync(charsFile, "utf8")) : null;
  if (!have) W(`還沒有襯線字型：先跑 node scripts/tanqing/fetch-fonts.mjs ${script.slug}`);
  const serif = (t, tag) => { if (have) for (const c of String(t ?? "")) if (c !== "\n" && !have.has(c)) E(`${tag}: 襯線字型子集沒有「${c}」，重跑 node scripts/tanqing/fetch-fonts.mjs ${script.slug}`); };
  serif(script.channel?.name ?? "談晴說礙", "channel.name");
  for (const t of script.cover?.title ?? []) serif(t, "cover.title");
  const cueIds = new Map(scenes.map((s) => [s.id, new Set((s.cues ?? []).map((c) => c.id))]));
  const checkAt = (at, s, tag) => {
    if (typeof at !== "string") return E(`${tag}: 要是字串（cue id 或 start｜voice｜end｜exit，可加減幾幀；別幕的 cue 寫「幕id:cue」），不手填秒數`);
    const m = /^(?:([^:\s]+):)?([^\s+-]+)([+-]\d+)?$/.exec(at);
    if (!m) return E(`${tag}:「${at}」格式不對`);
    const sid = m[1] ?? s.id;
    if (!cueIds.has(sid)) return E(`${tag}:「${at}」指到不存在的幕「${sid}」`);
    if (!AT_BASE.includes(m[2]) && !cueIds.get(sid).has(m[2])) E(`${tag}:「${at}」找不到 cue「${m[2]}」（幕 ${sid}）`);
  };
  const tone = (t, tag, what) => {
    const x = String(t ?? "");
    for (const w of TANQING_BANNED) if (x.includes(w)) E(`${tag}: ${what}有頻道禁用語「${w}」（觀察者口吻，不說教、不灌雞湯；docs/channels/tanqing-shuoai.md）`);
    for (const w of TANQING_SOFT) if (x.includes(w)) W(`${tag}: ${what}有「${w}」，確認不是在說教或安慰`);
  };
  const ids = new Set();
  let chars = 0, numbers = 0, qing = 0;
  const seen = new Set();
  for (const [i, s] of scenes.entries()) {
    const tag = `第 ${i + 1} 幕 (${s.id ?? "?"})`;
    if (!s.id || ids.has(s.id)) E(`${tag}: id 缺少或重複`); ids.add(s.id);
    if (s.component !== "TanqingScene") E(`${tag}: stage "tanqing" 的 component 只能是 TanqingScene：${s.component}`);
    const silentEnd = film && s.silent === true && i === scenes.length - 1;
    if (silentEnd) { if (!(s.durationSec > 0)) E(`${tag}: 無旁白的片尾卡要寫 durationSec`); }
    else if (typeof s.narration !== "string" || !s.narration) E(`${tag}: 缺 narration`);
    chars += h.len(s.narration ?? "");
    if (!silentEnd && (!s.subtitle?.zh || !s.subtitle?.en)) E(`${tag}: 缺 subtitle.zh／en`);
    for (const [k, t] of [["念稿", s.tts ?? s.narration], ["字幕", s.subtitle?.zh]]) { for (const m of cnTermIssues(t)) W(`${tag}: ${k}有${m}`); tone(t, tag, k); }
    if (h.readingIssues) for (const m of h.readingIssues(s.tts ?? s.narration)) W(`${tag}: 念稿 ${m}`);
    if (/[：:；;]/.test(s.tts ?? s.narration ?? "")) W(`${tag}: 念稿有冒號或分號（會念成宣布；docs/voice-natural.md）`);
    if (/你/.test(s.narration ?? "") && !/[？?]/.test(s.narration ?? "")) W(`${tag}: 旁白有「你」但不是提問；這個頻道的「你」只出現在提問裡`);
    const zh = s.subtitle?.zh ?? "";
    // 字幕 48px、欄寬 888px：一段最多 18 個全形字
    for (const line of zh.split("\n")) if (h.emWidth(line) > 18) W(`${tag}: 字幕一段「${line}」> 18 個全形字，用 \\n 斷開`);
    for (const e of String(s.subtitle?.en ?? "").split("|").map((x) => x.trim())) if (e.length > 56) W(`${tag}: 英文副字幕「${e}」> 56 字元`);
    for (const k of s.keywords ?? []) if (!zh.includes(k)) E(`${tag}: 關鍵詞「${k}」不在字幕裡`);
    for (const c of s.cues ?? []) if (!h.clean(s.narration).includes(h.clean(c.text))) E(`${tag}: cue「${c.id}」的字「${c.text}」不在旁白裡`);
    if (!Array.isArray(s.sources) || !s.sources.length) E(`${tag}: 缺 sources（左下「資料：來源」；沒有數字的頁寫「觀察描寫，非統計」）`);
    else {
      if (s.sources.length > 2) W(`${tag}: sources 只會顯示前兩行`);
      for (const x of s.sources.slice(0, 2)) if (h.emWidth(x) > 22.5) W(`${tag}: 來源「${x}」一行超過 22 個全形字，會碰到右下頁碼；拆成兩行`);
    }
    const p = s.props ?? {};
    if (!kinds.includes(p.kind)) E(`${tag}: props.kind 要是 ${kinds.join("／")}（ai＝礙、qing＝晴、ask＝提問${film ? "、next＝下一集、end＝片尾卡" : ""}）`);
    if (p.kind === "qing") qing++;
    seen.add(p.kind);
    if (!Array.isArray(p.title) || !p.title.length || p.title.length > 2) E(`${tag}: props.title 要是 1–2 行的陣列（襯線大標）`);
    else for (const line of p.title) { if (h.emWidth(line) > 10) E(`${tag}: 大標一行「${line}」> 10 個全形字（88px 會超出版心）`); serif(line, `${tag}.title`); tone(line, tag, "大標"); }
    if (p.titleAt !== undefined) checkAt(p.titleAt, s, `${tag}.titleAt`);
    // 大標和字幕不要是同一句話出現兩次：大標就是旁白那一句的頁寫 caption: "en"（只留英文副字幕）
    if (p.caption !== undefined && p.caption !== "en") E(`${tag}: props.caption 只能是 "en"（不放中文字幕）或不寫`);
    if (Array.isArray(p.title) && p.caption !== "en" && h.clean(p.title.join("")) === h.clean(s.subtitle?.zh ?? "")) W(`${tag}: 大標和字幕是同一句話，畫面上會出現兩次；大標換一句，或寫 caption: "en"`);
    if (p.note?.text && h.clean(s.subtitle?.zh ?? "").includes(h.clean(p.note.text))) W(`${tag}: 橘色一句和字幕重複`);
    if (p.note) {
      if (typeof p.note.text !== "string" || !p.note.text) E(`${tag}.note: 缺 text`);
      else { if (h.emWidth(p.note.text) > 19) E(`${tag}.note:「${p.note.text}」> 19 個全形字`); tone(p.note.text, `${tag}.note`, "橘色一句"); }
      checkAt(p.note.at, s, `${tag}.note.at`);
      if (Array.isArray(p.title) && p.title.length > 1) W(`${tag}: 兩行大標再加橘色一句，會壓到字幕；大標改一行`);
    }
    const fig = p.figure;
    if (!fig || !(fig.type in figs)) E(`${tag}: props.figure.type 要是 ${Object.keys(figs).join("／")}（線稿圖形）`);
    else {
      for (const k of figs[fig.type]) if (fig[k] === undefined) E(`${tag}.figure(${fig.type}): 缺 ${k}`);
      for (const [k, v] of Object.entries(fig)) if (k === "at" || /At$/.test(k)) checkAt(v, s, `${tag}.figure.${k}`);
      if (fig.scale !== undefined && !(typeof fig.scale === "number" && fig.scale >= 1 && fig.scale <= 1.3)) E(`${tag}.figure.scale 要是 1–1.3（圖整個放大的倍率）`);
      if (fig.type === "people") {
        if (!(Number.isInteger(fig.count) && fig.count >= 2 && fig.count <= 10)) E(`${tag}.figure: count 要是 2–10`);
        if (!(Number.isInteger(fig.mark) && fig.mark >= 0 && fig.mark <= fig.count)) E(`${tag}.figure: mark 要是 0–count`);
        if (fig.number) { numbers++; if (!fig.number.text) E(`${tag}.figure.number: 缺 text`); if (!fig.number.claim) E(`${tag}.figure.number: 要有 claim（指到 research.md 的事實編號，例如 F1）`); }
      }
      if (fig.type !== "people" && fig.number) { numbers++; if (!fig.number.text) E(`${tag}.figure.number: 缺 text`); if (!fig.number.claim) E(`${tag}.figure.number: 要有 claim（指到 research.md 的事實編號，例如 F1）`); }
      // 完整片的圖表：畫面上每一組資料都要寫 claim（指到 research.md 的事實編號）
      if (film && ["grid", "bars", "line", "pair", "hbars", "phone"].includes(fig.type) && !fig.claim) E(`${tag}.figure(${fig.type}): 資料圖要有 claim（research.md 的事實編號）`);
      if (fig.type === "line" && fig.yMin !== 0 && !(Array.isArray(fig.ticks) && fig.ticks.length)) E(`${tag}.figure(line): 縱軸不是從 0 開始，要寫 ticks（把刻度標出來）`);
      for (const k of ["label", "ask", "side", "line"]) if (fig[k] !== undefined) { tone(fig[k], `${tag}.figure.${k}`, "圖上的字"); for (const line of String(fig[k]).split("\n")) if (h.emWidth(line) > 12) W(`${tag}.figure.${k}:「${line}」> 12 個全形字`); }
    }
  }
  // 第 0 幀：第一頁要有大標和數字（大標沒有 titleAt＝第 0 幀就在；number 一開始就在）
  const p0 = scenes[0].props ?? {};
  if (p0.titleAt !== undefined || !p0.figure?.number) E("第一幕要有 figure.number，大標不能寫 titleAt：第 0 幀就要有大標與數字");
  if (!film && numbers !== 1) E(`全片有 ${numbers} 個 figure.number；這個頻道一支片只放一個有來源的數字`);
  if (film && numbers < 1) E("全片沒有 figure.number");
  // 完整片 2026/11/15 起不要「晴」收尾與提問（使用者：「後面廢話有點多，介紹完就好」）→ 結尾＝介紹完 → 下一集 → 片尾卡；短片照舊要晴
  if (!qing && !film) E("全片沒有 kind: \"qing\" 的頁：結尾要留一小段「晴」");
  if (film) {
    for (const k of ["next", "end"]) if (!seen.has(k)) E(`完整片要有 kind: "${k}" 的頁（下一集／片尾卡）`);
    const last = scenes[scenes.length - 1];
    if (last.props?.kind !== "end") E("完整片最後一幕要是片尾卡（kind: \"end\"）");
    if (qing / scenes.length > 1 / 3) W(`「晴」佔 ${qing}/${scenes.length} 頁，超過三分之一`);
    if (scenes.length < 15 || scenes.length > 24) W(`完整片 ${scenes.length} 鏡，建議 15–24 鏡`);
    if (chars < 230 || chars > 290) W(`旁白共 ${chars} 字，完整片建議 230–290 字（45–75 秒）`);
  } else if (chars < 45 || chars > 60) W(`旁白共 ${chars} 字，短片建議 45–60 字（約 10–15 秒）`);
  const est = Math.round(chars / 4.7 + 1.5) + (film ? Number(scenes[scenes.length - 1].durationSec ?? 0) : 0);
  return { errors, warns, est };
}

// ── 旁白起音檢查（2026/11/15 使用者回饋「旁白剛開始的聲音被截一點點」）：
//    node scripts/tanqing/validate-tanqing.mjs --onset <mp4>：前 300ms 內要看到由靜轉響（第 1 個 20ms 區塊不能就是滿音量）
if (process.argv.includes("--onset")) {
  const f = process.argv[process.argv.indexOf("--onset") + 1];
  const { execFileSync } = await import("node:child_process");
  const raw = execFileSync("ffmpeg", ["-hide_banner", "-loglevel", "error", "-i", f, "-t", "0.4", "-ac", "1", "-ar", "1000", "-f", "s16le", "-"]);
  const a = new Int16Array(raw.buffer, raw.byteOffset, raw.length >> 1), blk = [];
  for (let i = 0; i + 20 <= a.length; i += 20) { let m = 0; for (let j = i; j < i + 20; j++) m = Math.max(m, Math.abs(a[j])); blk.push(m); }
  const peak = Math.max(...blk), first = blk[0], rise = blk.slice(0, 15).findIndex((v) => v > peak * 0.3);
  const ok = first < peak * 0.1 && rise >= 7; // 第一個字前至少留約 0.14 秒（使用者要 0.15–0.25 秒）
  console.log(`${ok ? "✔" : "✖"} 旁白起音：第 1 個 20ms 區塊 ${first}／峰值 ${peak}，起音在第 ${rise} 個區塊（${rise * 20} ms）`);
  if (!ok) process.exitCode = 1;
}

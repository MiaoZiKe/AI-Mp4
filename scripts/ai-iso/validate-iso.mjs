// 亮色 2.5D 小場景（script.json 頂層 styleVersion: 3 ＋ stage: "iso"）的檢查。由 scripts/validate.mjs 的 validate() 呼叫。
// 時間軸、配音、字幕沿用 v3 的流程；畫面是 src/components/ai-iso/。
// 規則：旁白字數、cue 在旁白裡、時間只能寫 cue id 或 start｜voice｜end｜exit ±N 幀（可加「幕id:」）、顏色只有 primary／wrong／right／note、鏡頭 camera 要有 look／zoom／sy、
//       第一幕是 hook（第 0 幀的大字主張要有數字卡）、AI 回答要標「實測…（節錄）」而且每一行都要是實測原文裡找得到的字。
import fs from "node:fs";
import path from "node:path";
import { resolveProfile, profileIssues, cnTermIssues } from "../voice-profile.mjs";

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "../..");
const AT_BASE = ["start", "voice", "end", "exit"];
const KINDS = ["hook", "ask", "answer", "compare", "next"];
/** isoVersion: 2（完整片引擎 IsoFilm.tsx）的畫面種類 */
const KINDS2 = ["hook", "ask", "answer", "bump", "why", "title", "slot", "result", "add", "compare", "remind", "template", "question", "next", "end"];
/** isoVersion 2：畫面上放了 AI 回答的種類（要標實測＋節錄，字要是實測原文） */
const QUOTES2 = ["answer", "why", "result", "add", "compare"];
const COLORS = ["primary", "wrong", "right", "note", "sky", "plum"];
/** 這些鍵的值是時間 */
const AT_KEYS = new Set(["at", "in", "from", "until", "typeAt", "stackAt", "restAt", "strikeAt", "stampAt", "tagAt", "popAt", "bumpAt", "chipsAt", "sendAt", "outAt", "sealAt", "flyAt", "trayAt", "lensAt", "linkAt", "hintAt", "splitAt", "askAt", "checkAt", "focusAt", "pulseAt", "shineAt", "landAt", "flipAt", "markAt"]);
const strip = (t) => String(t).replace(/[*\s]/g, "");

export function validateIso(script, h) {
  const errors = [], warns = [];
  const E = (m) => errors.push(m), W = (m) => warns.push(m);
  for (const k of ["slug", "title", "asOf"]) if (typeof script[k] !== "string" || !script[k]) E(`頂層缺少 ${k}`);
  if (script.styleVersion !== 3) E("stage: \"iso\" 要搭配 styleVersion: 3（沿用整篇配音與時間軸 v2 的流程）");
  if (!script.voice || typeof script.voice.voiceName !== "string") E("頂層缺少 voice.voiceName");
  const prof = resolveProfile(script.voice);
  if (!prof) E("沒有 voice.profile：配音前要先定旁白設定檔（docs/voice-profiles.md）");
  else for (const m of profileIssues(prof)) E(m);
  const scenes = Array.isArray(script.scenes) ? script.scenes : [];
  if (!scenes.length) { E("scenes 是空的"); return { errors, warns, est: 0 }; }
  const ids = scenes.map((s) => s.id);
  const cuesOf = Object.fromEntries(scenes.map((s) => [s.id, new Set((s.cues ?? []).map((c) => c.id))]));
  let total = 0;
  const film = script.isoVersion === 2;
  scenes.forEach((s, i) => {
    const tag = s.id ?? `#${i}`;
    if (!s.id || ids.indexOf(s.id) !== i) E(`${tag}: id 缺少或重複`);
    if (s.component !== "IsoScene") E(`${tag}: stage "iso" 的 component 只能是 IsoScene：${s.component}`);
    const n = h.len(s.narration); total += n;
    const caff = (script.isoVersion === 3 || script.isoVersion === 4 || script.isoVersion === 5) && s.silent === true && s.props?.panel === "caffend"; // CaffAIne 片尾卡（短片引擎，src/components/ai-iso/CaffEnd.tsx）
    const silent = (film && s.silent === true) || caff;
    if (silent) {
      if (i !== scenes.length - 1) E(`${tag}: silent 只能用在最後一幕（片尾卡）`);
      if (!(s.durationSec > 0)) E(`${tag}: silent 的幕要寫 durationSec`);
      if (caff) {
        if (script.channelLogo !== "caffaine") E(`${tag}: panel "caffend" 要搭配頂層 channelLogo: "caffaine"`);
        if (!String(s.props?.keyword ?? "").trim()) E(`${tag}: 片尾卡要有留言關鍵字 props.keyword`);
        if (!(s.durationSec >= 3 && s.durationSec <= 4)) W(`${tag}: 片尾卡 ${s.durationSec} 秒（建議 3–3.5）`);
      } else if (s.props?.panel !== "end") E(`${tag}: silent 的幕要是 panel: "end"（片尾卡）`);
    } else if (n < 4) E(`${tag}: 旁白太短（${n} 字）`); else if (n > 26) W(`${tag}: 旁白 ${n} 字 > 26（建議拆開）`);
    for (const [k, t] of [["念稿", s.tts ?? s.narration], ["字幕", s.subtitle?.zh]]) for (const m of cnTermIssues(t)) W(`${tag}: ${k}有${m}`);
    for (const m of h.readingIssues(s.tts ?? s.narration)) W(`${tag}: 念稿 ${m}`);
    if (!silent && (!s.subtitle?.zh || !s.subtitle?.en)) E(`${tag}: 缺字幕（subtitle.zh／en）`);
    for (const l of String(s.subtitle?.zh ?? "").split("\n")) if (h.emWidth(l) > 11.5) E(`${tag}: 字幕「${l}」超過 11.5 個字寬（字幕卡放不下）`);
    for (const l of String(s.subtitle?.en ?? "").split("|")) if (l.trim().length > 44) E(`${tag}: 英文字幕「${l.trim()}」超過 44 字元`);
    for (const c of s.cues ?? []) if (!h.clean(s.subtitle?.zh ?? "").includes(h.clean(c.text))) E(`${tag}: cue「${c.id}」的詞「${c.text}」不在字幕裡`);
    for (const k of s.keywords ?? []) if (!String(s.subtitle?.zh ?? "").includes(k)) W(`${tag}: 關鍵詞「${k}」不在字幕裡（或被換行拆開）`);
    const spec = (x, where) => {
      const m = /^(?:([\w-]+):)?([^\s+:-]+)([+-]\d+)?$/.exec(String(x));
      if (!m) return E(`${tag}: ${where}「${x}」格式不對（[幕id:]cueId｜start｜voice｜end｜exit，可加 ±N 幀）`);
      const sid = m[1] ?? s.id;
      if (!cuesOf[sid]) return E(`${tag}: ${where}「${x}」找不到幕「${sid}」`);
      if (!AT_BASE.includes(m[2]) && !cuesOf[sid].has(m[2])) E(`${tag}: ${where}「${x}」找不到 cue「${m[2]}」`);
      if (m[3] && Math.abs(Number(m[3])) > 30) W(`${tag}: ${where}「${x}」離觸發詞超過 30 幀（時間要跟著配音）`);
    };
    const p = s.props ?? {};
    const kinds = film ? KINDS2 : KINDS;
    if (script.channelLogo !== undefined && script.channelLogo !== "caffaine") E("頂層 channelLogo 目前只有 \"caffaine\"");
    const KINDS4 = ["hook", "vs", "loop", "look", "act", "gate", "check", "ask", "next"];
    const KINDS5 = ["hook", "orig", "guess", "run", "wrong", "vs", "rule", "limit", "ask", "cta"];
    if (script.isoVersion === 5 && !caff) {
      if (!KINDS5.includes(p.panel)) E(`${tag}: isoVersion 5 的 props.panel「${p.panel}」不存在（${KINDS5.join("／")}）`);
      // 會議紀錄片：放 AI 回答的地方（wrong｜vs｜rule）要標實測＋節錄，每一格文字都要是實測原文的一部分（只能刪節，不能改字）；來源紀錄與提示規則也逐字比對
      const rd = (fn) => (fn && fs.existsSync(path.join(ROOT, "videos", script.slug, fn))) ? fs.readFileSync(path.join(ROOT, "videos", script.slug, fn), "utf8") : null;
      const ansOf = (fn) => { const t = rd(fn); return t === null ? null : strip(JSON.parse(t).answer ?? ""); };
      const quote = (o, rows, where) => {
        if (!/實測/.test(o.by ?? "") || !/節錄/.test(o.by ?? "")) E(`${tag}: ${where} 要標示實測與節錄（by）`);
        const ans = ansOf(o.verbatim); if (ans === null) return E(`${tag}: ${where} 要寫 verbatim（實測原始回答的 JSON 檔）`);
        for (const c of rows.flatMap((r) => r.cells ?? r)) if (!ans.includes(strip(c))) E(`${tag}: ${where}「${c}」不是實測原文（只能刪節，不能改字）`);
      };
      if (p.panel === "wrong") { quote(p, p.rows ?? [], "props"); const sr = rd(p.src?.verbatim); if (sr === null || !strip(sr).includes(strip(p.src?.text ?? "\u0000"))) E(`${tag}: props.src.text 不是會議紀錄原文`); }
      if (p.panel === "orig") { const sr = rd(p.verbatim); if (sr === null || !strip(sr).includes(strip(p.text ?? "\u0000"))) E(`${tag}: props.text 不是會議紀錄原文`); if (!String(p.text ?? "").includes(p.mark ?? "\u0000")) E(`${tag}: props.mark 不在 props.text 裡`); }
      if (p.panel === "guess") { for (const [k, fn] of [["a", p.a?.verbatim], ["b", p.b?.verbatim]]) { const ans = ansOf(fn); if (ans === null || !ans.includes(strip(p[k]?.text ?? "\u0000"))) E(`${tag}: ${k}.text「${p[k]?.text}」不是實測原文`); } }
      if (p.panel === "vs") { quote(p.top ?? {}, [p.top?.cells ?? []], "top"); quote(p.bottom ?? {}, [p.bottom?.cells ?? []], "bottom"); }
      if (p.panel === "rule") { quote(p.result ?? {}, p.result?.rows ?? [], "result"); const pj = rd(p.promptVerbatim); const pr = pj ? strip(JSON.parse(pj).prompt ?? "") : null; for (const q of p.rules ?? []) if (pr === null || !pr.includes(strip(q.text))) E(`${tag}: 規則「${q.text}」不在實測提示裡`); }
    } else if (script.isoVersion === 4 && !caff) { if (!KINDS4.includes(p.panel)) E(`${tag}: isoVersion 4 的 props.panel「${p.panel}」不存在（${KINDS4.join("／")}）`); }
    else if (!caff && !kinds.includes(p.panel)) E(`${tag}: props.panel「${p.panel}」不存在（${kinds.join("／")}）`);
    // 走過整個 props：時間鍵檢查格式、color 檢查名稱
    const walk = (o, where) => {
      if (Array.isArray(o)) return o.forEach((v, k) => walk(v, `${where}[${k}]`));
      if (!o || typeof o !== "object") return;
      for (const [k, v] of Object.entries(o)) {
        if (AT_KEYS.has(k) && typeof v !== "object") spec(v, `${where}.${k}`);
        else if (k === "color" && !COLORS.includes(v)) E(`${tag}: ${where}.color「${v}」不存在（${COLORS.join("／")}）`);
        else if (k === "kw") { for (const c of Object.values(v)) if (!COLORS.includes(c)) E(`${tag}: props.kw 的顏色「${c}」不存在`); }
        else walk(v, `${where}.${k}`);
      }
    };
    walk(p, "props");
    const cams = [].concat(p.camera ?? []);
    if (!caff && !cams.length) E(`${tag}: 缺少 props.camera（鏡頭看哪裡：look [x,y,z]、zoom、sy）`);
    for (const c of cams) if (!Array.isArray(c.look) || c.look.length !== 3 || !(c.zoom > 0.3 && c.zoom < (script.isoVersion === 4 ? 2.4 : 1.6)) || !(c.sy > 300 && c.sy < (film ? 1500 : 1300))) E(`${tag}: props.camera 要有 look [x,y,z]、zoom（0.3–1.6）、sy（300–${film ? 1500 : 1300}）`);
    if (film && QUOTES2.includes(p.panel)) {
      // 完整片：每一塊放了 AI 回答的地方都要有 verbatim（實測原始回答的 JSON），字只能刪節不能改；卡片要標「實測…（節錄）」
      const check = (o, where) => {
        const fp = o.verbatim ? path.join(ROOT, "videos", script.slug, o.verbatim) : null;
        if (!fp || !fs.existsSync(fp)) return E(`${tag}: ${where} 要寫 verbatim（實測原始回答的 JSON 檔，相對於這支片的資料夾）`);
        const ans = strip(JSON.parse(fs.readFileSync(fp, "utf8")).answer ?? "");
        for (const l of [].concat(o.lines ?? [], o.line ?? [], o.answer ?? [], (o.rows ?? []).map((r) => r.t))) if (!ans.includes(strip(l))) E(`${tag}: 這一行不是實測原文（只能刪節，不能改字）：「${l}」`);
        for (const v of [o.lens?.text, o.mark?.text, typeof o.mark === "string" ? o.mark : null, ...(o.rows ?? []).map((r) => r.mark?.text)]) if (v && !ans.includes(strip(v))) E(`${tag}: 「${v}」不在實測原文裡`);
      };
      if (p.panel === "compare") { check(p.top ?? {}, "props.top"); check(p.bottom ?? {}, "props.bottom"); } else check(p, "props");
      if (p.panel !== "add" && (!/實測/.test(p.by ?? "") || !/節錄/.test(p.by ?? ""))) E(`${tag}: AI 回答要標示實測與節錄（props.by，例如「Gemini 實測・2026/11/13（節錄）」）`);
    } else if (p.panel === "answer") {
      if (!/實測/.test(p.by ?? "") || !/節錄/.test(p.by ?? "")) E(`${tag}: AI 回答要標示實測與節錄（props.by，例如「Gemini 實測・2026/11/13（節錄）」）`);
      const fp = p.verbatim ? path.join(ROOT, "videos", script.slug, p.verbatim) : null;
      if (!fp || !fs.existsSync(fp)) E(`${tag}: AI 回答要寫 props.verbatim（實測原始回答的 JSON 檔，相對於這支片的資料夾）`);
      else {
        const ans = strip(JSON.parse(fs.readFileSync(fp, "utf8")).answer ?? "");
        for (const l of p.lines ?? []) if (!ans.includes(strip(l))) E(`${tag}: 回答的這一行不是實測原文（只能刪節，不能改字）：「${l}」`);
        for (const v of [p.lens?.text, p.mark2?.text]) if (v && !ans.includes(strip(v))) E(`${tag}: 「${v}」不在實測原文裡`);
      }
    }
    // 短片引擎（isoVersion: 3，IsoShort.tsx）：最後一鏡如果放了「貼新聞之後的回答」，一樣要標實測＋節錄，字要是實測原文
    if (script.isoVersion === 3 && p.panel === "next" && p.result) {
      const r = p.result, fp = r.verbatim ? path.join(ROOT, "videos", script.slug, r.verbatim) : null;
      if (!/實測/.test(r.by ?? "") || !/節錄/.test(r.by ?? "")) E(`${tag}: props.result 要標示實測與節錄（result.by）`);
      if (!fp || !fs.existsSync(fp)) E(`${tag}: props.result 要寫 verbatim（實測原始回答的 JSON 檔）`);
      else { const ans = strip(JSON.parse(fs.readFileSync(fp, "utf8")).answer ?? ""); for (const l of [].concat(r.lines ?? [], r.mark ?? [])) if (!ans.includes(strip(l))) E(`${tag}: 這一行不是實測原文（只能刪節，不能改字）：「${l}」`); }
    }
    if (script.isoVersion === 3) for (const c of cams) { if (c.dur !== undefined && !(c.dur >= 6 && c.dur <= 60)) E(`${tag}: props.camera 的 dur 要在 6–60 幀`); if (c.rot !== undefined && Math.abs(c.rot) > 6) E(`${tag}: props.camera 的 rot 最多 ±6 度`); }
    if (film && p.panel === "compare" && !(p.top?.answer && p.bottom?.answer)) E(`${tag}: 對照要有 top.answer 與 bottom.answer（兩個回答同時在畫面上）`);
    if (film && p.panel === "template" && (p.linePx ?? 42) < 36) E(`${tag}: 範本卡的字 ${p.linePx}px 太小（提問那一鏡會縮到 0.78 倍，要 ≥36）`);
    if (silent) return;
    if ((s.sources ?? []).length) { const px = h.emWidth(`來源：${s.sources.join("、")}`) * 28; if (px > 940) E(`${tag}: 出處太長（約 ${Math.round(px)}px > 940）`); }
    else W(`${tag}: 沒有出處`);
  });
  const hk = scenes[0].props ?? {};
  if (scenes.length === 1 && hk.panel === "caffend") { /* 只有片尾卡的測試片：不用鉤子 */ }
  else if (script.isoVersion === 4 || script.isoVersion === 5) { if (hk.panel !== "hook") E("第一幕要是 panel: \"hook\"（第 0 幀就是實心大字）"); }
  else if (hk.panel !== "hook" || !Array.isArray(hk.title) || !hk.title.length) E("第一幕要是 panel: \"hook\"，而且有 title（第 0 幀就看得到的實心大字主張）");
  else {
    if (![hk.screen, hk.pin].some((n) => /\d/.test(n?.value ?? ""))) E("第一幕的 hook 要有數字（props.screen／props.pin 的 value）：第 0 幀放後果或數字，不能只有問句");
    if (hk.title.some((t) => /[？?]$/.test(t))) W("第一幕的大字是問句：第 0 幀要放後果或數字");
    for (const t of hk.title) if (h.emWidth(t) * (hk.size ?? 136) > 952) E(`第一幕大字「${t}」超出左右安全區`);
  }
  const est = Math.round(scenes.reduce((a, s) => a + (s.silent === true ? Number(s.durationSec) || 0 : h.voicedSeconds(s, true)), 0));
  if (film) {
    // 完整片：最後一幕片尾卡、要有對照／提醒／範本／提問／下一集，長度 45–75 秒
    const has = (k) => scenes.some((s) => s.props?.panel === k);
    if (scenes[scenes.length - 1].props?.panel !== "end" || scenes[scenes.length - 1].silent !== true) E("完整片（isoVersion: 2）最後一幕要是片尾卡（panel: \"end\"、silent: true、durationSec）");
    for (const k of ["compare", "remind", "template", "question", "next"]) if (!has(k)) E(`完整片缺少 panel: "${k}"（對照／提醒對原文／範本卡／提問／下一集）`);
    if (est < 45 || est > 78) W(`估算 ${est} 秒（旁白 ${total} 字）：完整片要 45–75 秒`);
  }
  if (!film && script.sample !== false && (est < 9 || est > 20)) W(`估算 ${est} 秒（旁白 ${total} 字）：風格試片建議 10–15 秒`);
  return { errors, warns, est };
}

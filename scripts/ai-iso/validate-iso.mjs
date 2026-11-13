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
const COLORS = ["primary", "wrong", "right", "note"];
/** 這些鍵的值是時間 */
const AT_KEYS = new Set(["at", "in", "from", "until", "typeAt", "stackAt", "restAt", "strikeAt", "stampAt", "tagAt", "popAt", "bumpAt", "chipsAt", "sendAt", "outAt", "sealAt", "flyAt"]);
const strip = (t) => String(t).replace(/[*\s]/g, "");

export function validateIso(script, h) {
  const errors = [], warns = [];
  const E = (m) => errors.push(m), W = (m) => warns.push(m);
  for (const k of ["slug", "title", "asOf"]) if (typeof script[k] !== "string" || !script[k]) E(`頂層缺少 ${k}`);
  if (script.styleVersion !== 3) E("stage: \"bright\" 要搭配 styleVersion: 3（沿用整篇配音與時間軸 v2 的流程）");
  if (!script.voice || typeof script.voice.voiceName !== "string") E("頂層缺少 voice.voiceName");
  const prof = resolveProfile(script.voice);
  if (!prof) E("沒有 voice.profile：配音前要先定旁白設定檔（docs/voice-profiles.md）");
  else for (const m of profileIssues(prof)) E(m);
  const scenes = Array.isArray(script.scenes) ? script.scenes : [];
  if (!scenes.length) { E("scenes 是空的"); return { errors, warns, est: 0 }; }
  const ids = scenes.map((s) => s.id);
  const cuesOf = Object.fromEntries(scenes.map((s) => [s.id, new Set((s.cues ?? []).map((c) => c.id))]));
  let total = 0;
  scenes.forEach((s, i) => {
    const tag = s.id ?? `#${i}`;
    if (!s.id || ids.indexOf(s.id) !== i) E(`${tag}: id 缺少或重複`);
    if (s.component !== "IsoScene") E(`${tag}: stage "iso" 的 component 只能是 IsoScene：${s.component}`);
    const n = h.len(s.narration); total += n;
    if (n < 4) E(`${tag}: 旁白太短（${n} 字）`); else if (n > 26) W(`${tag}: 旁白 ${n} 字 > 26（建議拆開）`);
    for (const [k, t] of [["念稿", s.tts ?? s.narration], ["字幕", s.subtitle?.zh]]) for (const m of cnTermIssues(t)) W(`${tag}: ${k}有${m}`);
    for (const m of h.readingIssues(s.tts ?? s.narration)) W(`${tag}: 念稿 ${m}`);
    if (!s.subtitle?.zh || !s.subtitle?.en) E(`${tag}: 缺字幕（subtitle.zh／en）`);
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
    if (!KINDS.includes(p.panel)) E(`${tag}: props.panel「${p.panel}」不存在（${KINDS.join("／")}）`);
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
    if (!cams.length) E(`${tag}: 缺少 props.camera（鏡頭看哪裡：look [x,y,z]、zoom、sy）`);
    for (const c of cams) if (!Array.isArray(c.look) || c.look.length !== 3 || !(c.zoom > 0.3 && c.zoom < 1.6) || !(c.sy > 300 && c.sy < 1300)) E(`${tag}: props.camera 要有 look [x,y,z]、zoom（0.3–1.6）、sy（300–1300）`);
    if (p.panel === "answer") {
      if (!/實測/.test(p.by ?? "") || !/節錄/.test(p.by ?? "")) E(`${tag}: AI 回答要標示實測與節錄（props.by，例如「Gemini 實測・2026/11/13（節錄）」）`);
      const fp = p.verbatim ? path.join(ROOT, "videos", script.slug, p.verbatim) : null;
      if (!fp || !fs.existsSync(fp)) E(`${tag}: AI 回答要寫 props.verbatim（實測原始回答的 JSON 檔，相對於這支片的資料夾）`);
      else {
        const ans = strip(JSON.parse(fs.readFileSync(fp, "utf8")).answer ?? "");
        for (const l of p.lines ?? []) if (!ans.includes(strip(l))) E(`${tag}: 回答的這一行不是實測原文（只能刪節，不能改字）：「${l}」`);
        for (const v of [p.lens?.text]) if (v && !ans.includes(strip(v))) E(`${tag}: 「${v}」不在實測原文裡`);
      }
    }
    if ((s.sources ?? []).length) { const px = h.emWidth(`來源：${s.sources.join("、")}`) * 28; if (px > 940) E(`${tag}: 出處太長（約 ${Math.round(px)}px > 940）`); }
    else W(`${tag}: 沒有出處`);
  });
  const hk = scenes[0].props ?? {};
  if (hk.panel !== "hook" || !Array.isArray(hk.title) || !hk.title.length) E("第一幕要是 panel: \"hook\"，而且有 title（第 0 幀就看得到的實心大字主張）");
  else {
    if (![hk.screen, hk.pin].some((n) => /\d/.test(n?.value ?? ""))) E("第一幕的 hook 要有數字（props.screen／props.pin 的 value）：第 0 幀放後果或數字，不能只有問句");
    if (hk.title.some((t) => /[？?]$/.test(t))) W("第一幕的大字是問句：第 0 幀要放後果或數字");
    for (const t of hk.title) if (h.emWidth(t) * (hk.size ?? 136) > 952) E(`第一幕大字「${t}」超出左右安全區`);
  }
  const est = Math.round(scenes.reduce((a, s) => a + h.voicedSeconds(s, true), 0));
  if (script.sample !== false && (est < 9 || est > 20)) W(`估算 ${est} 秒（旁白 ${total} 字）：風格試片建議 10–15 秒`);
  return { errors, warns, est };
}

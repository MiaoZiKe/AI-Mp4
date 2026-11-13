// 動態大字（script.json 頂層 styleVersion: 3 ＋ stage: "type"）的檢查。由 scripts/validate.mjs 的 validate() 呼叫。
// 時間軸、配音、字幕沿用 v3 的流程；畫面是 src/components/ai-type/。
// 規則：旁白字數、cue 在旁白裡、items 的時間只能寫 cue id 或 start｜voice｜end｜exit ±N 幀（可加「幕id:」）、字不超出安全區、跟著配音的字要在旁白裡、顏色名稱。
import { resolveProfile, profileIssues, cnTermIssues } from "../voice-profile.mjs";

const AT_BASE = ["start", "voice", "end", "exit"];
const ACCENTS = ["hot", "blue", "green", "yellow"];
const INKS = ["fg", "fg2", "fg3", "rule", ...ACCENTS, ...ACCENTS.map((c) => `on:${c}`)];
const SAFE = { x0: 64, x1: 1016, y0: 220, y1: 1700 };
/** 粗估字寬（em）：全形 1、空白 0.26、拉丁大寫 0.68、其他 0.56 */
const emW = (t) => [...String(t)].reduce((a, c) => a + (/[⺀-鿿＀-￯　-〿]/.test(c) ? 1 : c === " " ? 0.26 : /[A-Z—]/.test(c) ? 0.68 : 0.56), 0);

export function validateType(script, h) {
  const errors = [], warns = [];
  const E = (m) => errors.push(m), W = (m) => warns.push(m);
  for (const k of ["slug", "title", "asOf"]) if (typeof script[k] !== "string" || !script[k]) E(`頂層缺少 ${k}`);
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
    if (s.component !== "TypeScene") E(`${tag}: stage "type" 的 component 只能是 TypeScene：${s.component}`);
    const n = h.len(s.narration); total += n;
    if (n < 4) E(`${tag}: 旁白太短（${n} 字）`); else if (n > 26) W(`${tag}: 旁白 ${n} 字 > 26（建議拆開）`);
    for (const [k, t] of [["念稿", s.tts ?? s.narration], ["字幕", s.subtitle?.zh]]) for (const m of cnTermIssues(t)) W(`${tag}: ${k}有${m}`);
    for (const m of h.readingIssues(s.tts ?? s.narration)) W(`${tag}: 念稿 ${m}`);
    if (!s.subtitle?.zh || !s.subtitle?.en) E(`${tag}: 缺字幕（subtitle.zh／en）`);
    for (const c of s.cues ?? []) if (!h.clean(s.narration).includes(h.clean(c.text))) E(`${tag}: cue「${c.id}」的詞「${c.text}」不在旁白裡`);
    const spec = (x, where) => {
      const m = /^(?:([\w-]+):)?([^\s+:-]+)([+-]\d+)?$/.exec(String(x));
      if (!m) return E(`${tag}: ${where}「${x}」格式不對（[幕id:]cueId｜start｜voice｜end｜exit，可加 ±N 幀）`);
      const sid = m[1] ?? s.id;
      if (!cuesOf[sid]) return E(`${tag}: ${where}「${x}」找不到幕「${sid}」`);
      if (!AT_BASE.includes(m[2]) && !cuesOf[sid].has(m[2])) E(`${tag}: ${where}「${x}」找不到 cue「${m[2]}」`);
      if (m[3] && Math.abs(Number(m[3])) > 30) W(`${tag}: ${where}「${x}」離觸發詞超過 30 幀（時間要跟著配音）`);
    };
    const p = s.props ?? {};
    if (p.ground && !["ink", "paper"].includes(p.ground)) E(`${tag}: props.ground「${p.ground}」不存在（ink／paper）`);
    if (p.enterAt !== undefined) spec(p.enterAt, "props.enterAt");
    const items = Array.isArray(p.items) ? p.items : [];
    if (!items.length) E(`${tag}: props.items 是空的`);
    const narr = String(s.subtitle?.zh ?? "").replace(/\n/g, "");
    items.forEach((it, k) => {
      const w = `items[${k}]`;
      for (const key of ["at", "until", "ghostAt"]) if (it[key] !== undefined) spec(it[key], `${w}.${key}`);
      for (const q of it.set ?? []) { spec(q.at, `${w}.set.at`); if (q.color && !INKS.includes(q.color)) E(`${tag}: ${w}.set.color「${q.color}」不存在`); }
      for (const key of ["strike", "underline", "caret"]) if (it[key]) { if (it[key].at !== undefined) spec(it[key].at, `${w}.${key}.at`); if (it[key].until !== undefined) spec(it[key].until, `${w}.${key}.until`); if (it[key].color && !INKS.includes(it[key].color)) E(`${tag}: ${w}.${key}.color「${it[key].color}」不存在`); }
      if (it.color && !INKS.includes(it.color)) E(`${tag}: ${w}.color「${it.color}」不存在（${INKS.join("／")}）`);
      if (it.kind === "block") { if (!Array.isArray(it.rect) || it.rect.length !== 4) E(`${tag}: ${w} 色塊要有 rect [x, y, w, h]`); return; }
      if (typeof it.t !== "string" || !it.t) return E(`${tag}: ${w} 缺少 t（要顯示的字）`);
      if (typeof it.y !== "number" || typeof it.size !== "number") return E(`${tag}: ${w}「${it.t}」缺少 y 或 size`);
      if (it.mode && !["type", "slam", "ghost", "rise"].includes(it.mode)) E(`${tag}: ${w}.mode「${it.mode}」不存在`);
      const x = it.x ?? 64, wpx = it.w ?? emW(it.t) * it.size;
      const ys = [it.y, ...(it.set ?? []).map((q) => q.y).filter((v) => typeof v === "number")];
      if (x < SAFE.x0 || x + wpx > SAFE.x1 + 2) E(`${tag}: ${w}「${it.t}」約 ${Math.round(wpx)}px 寬，超出左右安全區（x ${x}–${Math.round(x + wpx)}）`);
      for (const y of ys) if (y < SAFE.y0 || y + it.size > SAFE.y1) E(`${tag}: ${w}「${it.t}」超出上下安全區（y ${y}–${y + it.size}）`);
      if (it.size < 24) E(`${tag}: ${w}「${it.t}」字級 ${it.size}px < 24`);
      if (it.at === undefined) { const key = String(it.sync ?? it.t).replace(/[，。？！、：]+$/, ""); if (!narr.includes(key)) E(`${tag}: ${w}「${key}」沒寫 at，要跟著配音出現，但這段字不在本幕字幕裡`); }
    });
    if ((s.sources ?? []).length) { const px = h.emWidth(`來源：${s.sources.join("、")}`) * 24; if (px > 900) E(`${tag}: 出處太長（約 ${Math.round(px)}px > 900）`); }
  });
  const first = scenes[0].props?.items ?? [];
  if (!first.some((it) => it.mode === "ghost" && (it.ghostAt === undefined || it.ghostAt === "start"))) E("第一幕要有一行 mode: \"ghost\" 的空心大字（第 0 幀就看得到的主張）");
  const est = Math.round(scenes.reduce((a, s) => a + h.voicedSeconds(s, true), 0));
  if (script.sample !== false && (est < 9 || est > 20)) W(`估算 ${est} 秒（旁白 ${total} 字）：風格試片建議 10–15 秒`);
  return { errors, warns, est };
}

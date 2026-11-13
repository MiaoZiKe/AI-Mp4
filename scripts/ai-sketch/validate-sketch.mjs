// 白板手繪（script.json 頂層 styleVersion: 3 ＋ stage: "sketch"）的檢查。由 scripts/validate.mjs 的 validate() 呼叫。
// 時間軸、配音、字幕沿用 v3 的流程。規則：旁白與字幕、cue 在旁白裡、items 的 at／end 寫法、顏色名稱、形狀種類、
// 手寫字型有沒有涵蓋畫面上的字、第一幕第 0 幀要有主張、鏡頭寫法。
import fs from "node:fs";
import path from "node:path";
import { resolveProfile, profileIssues, cnTermIssues } from "../voice-profile.mjs";

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "../..");
const AT_BASE = ["start", "voice", "end", "exit"];
const PENS = ["ink", "ink2", "ink3", "red", "blue", "green", "amber", "violet"];
const MARKERS = ["yellow", "red", "blue", "green", "amber", "violet"];
const BOX = ["line", "rect", "ellipse", "cross", "check", "squiggle", "underline", "hatch", "brace", "bubble", "send", "book", "robot", "spark"];
const PTS = ["curve", "poly", "arrow"];

export function validateSketch(script, h) {
  const errors = [], warns = [];
  const E = (m) => errors.push(m), W = (m) => warns.push(m);
  for (const k of ["slug", "title", "asOf"]) if (typeof script[k] !== "string" || !script[k]) E(`頂層缺少 ${k}`);
  if (script.styleVersion !== 3) E("stage: \"sketch\" 要搭配 styleVersion: 3（沿用整篇配音與時間軸 v2 的流程）");
  if (!script.voice || typeof script.voice.voiceName !== "string") E("頂層缺少 voice.voiceName");
  const prof = resolveProfile(script.voice);
  if (!prof) E("沒有 voice.profile：配音前要先定旁白設定檔（docs/voice-profiles.md）");
  else for (const m of profileIssues(prof)) E(m);
  const scenes = Array.isArray(script.scenes) ? script.scenes : [];
  if (!scenes.length) { E("scenes 是空的"); return { errors, warns, est: 0 }; }
  const cp = path.join(ROOT, "public/fonts/sketch/chars.txt");
  const have = fs.existsSync(cp) ? new Set(fs.readFileSync(cp, "utf8")) : null;
  if (!have) W(`沒有手寫字型（public/fonts/sketch/）：先 node scripts/ai-sketch/fetch-fonts.mjs ${script.slug}，否則會退回黑體`);
  const cuesOf = Object.fromEntries(scenes.map((s) => [s.id, new Set((s.cues ?? []).map((c) => c.id))]));
  const ids = scenes.map((s) => s.id);
  let total = 0;
  scenes.forEach((s, i) => {
    const tag = s.id ?? `#${i}`;
    if (!s.id || ids.indexOf(s.id) !== i) E(`${tag}: id 缺少或重複`);
    if (s.component !== "SketchScene") E(`${tag}: stage "sketch" 的 component 只能是 SketchScene：${s.component}`);
    const n = h.len(s.narration); total += n;
    if (n < 4) E(`${tag}: 旁白太短（${n} 字）`); else if (n > 26) W(`${tag}: 旁白 ${n} 字 > 26（一鏡 2–4 秒，建議拆開）`);
    for (const [k, t] of [["念稿", s.tts ?? s.narration], ["字幕", s.subtitle?.zh]]) for (const m of cnTermIssues(t)) W(`${tag}: ${k}有${m}`);
    for (const m of h.readingIssues(s.tts ?? s.narration)) W(`${tag}: 念稿 ${m}`);
    if (!s.subtitle?.zh || !s.subtitle?.en) E(`${tag}: 缺字幕（subtitle.zh／en）`);
    else h.splitPhrases(s.subtitle.zh, s.keywords ?? [], h.SUB_MAX_EM_V2).forEach((l, li) => { const w = h.emWidth(h.phraseDisplay(l)); if (w > h.SUB_MAX_EM_V2) E(`${tag}: 字幕短語 ${li + 1}「${l}」寬 ${w.toFixed(1)}em > ${h.SUB_MAX_EM_V2}`); });
    for (const k of s.keywords ?? []) if (!String(s.subtitle?.zh ?? "").replace(/\n/g, "").includes(k)) W(`${tag}: 關鍵詞「${k}」不在字幕裡`);
    for (const c of s.cues ?? []) if (!h.clean(s.narration).includes(h.clean(c.text))) E(`${tag}: cue「${c.id}」的詞「${c.text}」不在旁白裡`);
    if (!(s.cues ?? []).length) W(`${tag}: 沒有 cue（畫面要對到旁白念到的詞）`);
    const at = (x, where) => {
      const m = /^(?:([\w-]+):)?([^\s+:-]+)([+-]\d+)?$/.exec(String(x));
      if (!m) return E(`${tag}: ${where}「${x}」格式不對（cueId、start、voice、end、exit，可加 ±N 幀、可加「幕id:」前綴）`);
      const sid = m[1] ?? s.id;
      if (!cuesOf[sid]) return E(`${tag}: ${where}「${x}」找不到幕「${sid}」`);
      if (!AT_BASE.includes(m[2]) && !cuesOf[sid].has(m[2])) E(`${tag}: ${where}「${x}」找不到 cue「${m[2]}」`);
      if (m[3] && Math.abs(Number(m[3])) > 30 && !(i === 0 && m[2] === "start")) W(`${tag}: ${where}「${x}」離觸發詞超過 30 幀（時間要跟著配音）`);
    };
    const p = s.props ?? {};
    for (const c of p.camera ? (Array.isArray(p.camera) ? p.camera : [p.camera]) : []) {
      if (!Array.isArray(c.to) || c.to.length !== 3 || c.to.some((v) => typeof v !== "number")) E(`${tag}: camera.to 要是 [x, y, 縮放]`);
      else if (c.to[2] < 0.5 || c.to[2] > 1.4) W(`${tag}: camera 縮放 ${c.to[2]} 超出 0.5–1.4（字會太小或太糊）`);
      if (c.at !== undefined) at(c.at, "camera.at");
    }
    if (!Array.isArray(p.items) || !p.items.length) E(`${tag}: props.items 是空的`);
    (p.items ?? []).forEach((it, k) => {
      const where = `items[${k}]（${it.type}）`;
      if (it.at === undefined) E(`${tag}: ${where} 缺 at`); else at(it.at, `${where}.at`);
      if (it.end !== undefined) at(it.end, `${where}.end`);
      if (it.type === "text") {
        if (typeof it.t !== "string" || !it.t) E(`${tag}: ${where} 缺 t`);
        if (![it.x, it.y].every((v) => typeof v === "number")) E(`${tag}: ${where} 缺 x／y`);
        if (!PENS.includes(it.color ?? "ink")) E(`${tag}: ${where}.color「${it.color}」不存在（${PENS.join("／")}）`);
        if (have) { const miss = [...String(it.t ?? "")].filter((c) => !have.has(c)); if (miss.length) E(`${tag}: ${where} 的字「${miss.join("")}」不在手寫字型子集裡：重跑 node scripts/ai-sketch/fetch-fonts.mjs ${script.slug}`); }
      } else if (BOX.includes(it.type)) {
        if (!Array.isArray(it.box) || it.box.length !== 4) E(`${tag}: ${where} 要有 box: [4 個數字]`);
        if (!(it.type === "hatch" ? MARKERS : PENS).includes(it.color ?? "ink")) E(`${tag}: ${where}.color「${it.color}」不存在`);
      } else if (PTS.includes(it.type)) {
        if (!Array.isArray(it.pts) || it.pts.length < 2) E(`${tag}: ${where} 要有 pts（至少 2 點）`);
        if (!PENS.includes(it.color ?? "ink")) E(`${tag}: ${where}.color「${it.color}」不存在`);
      } else E(`${tag}: ${where} 不認得的種類（text／${[...BOX, ...PTS].join("／")}）`);
    });
    for (const c of p.kwColors ?? []) if (!MARKERS.includes(c)) E(`${tag}: kwColors「${c}」不存在（${MARKERS.join("／")}）`);
    if ((s.sources ?? []).length) { const px = h.emWidth(`來源：${s.sources.join("、")}`) * 30; if (px > 950) E(`${tag}: 出處太長（約 ${Math.round(px)}px > 950）`); }
  });
  const hook = (scenes[0].props?.items ?? []).filter((it) => it.type === "text" && it.hook);
  if (!hook.some((it) => (it.size ?? 0) >= 120)) E("第一幕要有一行 hook: true、字級 ≥120 的字（第 0 幀就看得到的主張）");
  for (const it of hook) if (!/^start-\d+$/.test(String(it.at))) E(`第一幕 hook 字「${it.t}」的 at 要寫 start-N（第 0 幀前就寫好）`);
  const est = Math.round(scenes.reduce((a, s) => a + h.voicedSeconds(s, true), 0));
  if (script.sample !== false && (est < 9 || est > 20)) W(`估算 ${est} 秒（旁白 ${total} 字）：風格試片建議 10–15 秒`);
  return { errors, warns, est };
}

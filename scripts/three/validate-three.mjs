// 3D 產品台（script.json 頂層 styleVersion: 3 ＋ stage: "three"；對外稱「v4 產品台」）的檢查。由 scripts/validate.mjs 的 validate() 呼叫。
// 時間軸、配音、字幕沿用 v3 的整篇配音流程；畫面用 @remotion/three，不用紙材。時間軸檢查共用 scripts/ui/validate-ui.mjs 的 validateTimelineUI。
import { resolveProfile, profileIssues, cnTermIssues } from "../voice-profile.mjs";

const AT_BASE = ["start", "voice", "end", "exit"];
const COLORS = ["amber", "blue", "coral", "mint"];
const PARTS = ["back", "battery", "board", "chip", "plate", "frame", "screen", "water", "vapor", "loop"];

export function validateThree(script, h) {
  const errors = [], warns = [];
  const E = (m) => errors.push(m), W = (m) => warns.push(m);
  for (const k of ["slug", "title", "asOf"]) if (typeof script[k] !== "string" || !script[k]) E(`頂層缺少 ${k}`);
  if (script.asOf && !/^\d{4}\/\d{1,2}\/\d{1,2}$/.test(script.asOf)) E(`asOf 格式應為 YYYY/M/D：${script.asOf}`);
  if (!script.voice || typeof script.voice.voiceName !== "string") E("頂層缺少 voice.voiceName");
  const prof = resolveProfile(script.voice);
  if (!prof) E("沒有 voice.profile：配音前要先定旁白設定檔（docs/voice-profiles.md）");
  else for (const m of profileIssues(prof)) E(m);
  const scenes = Array.isArray(script.scenes) ? script.scenes : [];
  if (!scenes.length) { E("scenes 是空的"); return { errors, warns, est: 0 }; }
  const ids = scenes.map((s) => s.id);
  let total = 0;
  scenes.forEach((s, i) => {
    const tag = s.id ?? `#${i}`;
    if (!s.id || ids.indexOf(s.id) !== i) E(`${tag}: id 缺少或重複`);
    if (s.component !== "ThreeScene") E(`${tag}: stage "three" 的 component 只能是 ThreeScene：${s.component}`);
    const n = h.len(s.narration); total += n;
    if (n < 4) E(`${tag}: 旁白太短（${n} 字）`); else if (n > 26) W(`${tag}: 旁白 ${n} 字 > 26（一鏡 2–4 秒，建議拆開）`);
    for (const [k, t] of [["念稿", s.tts ?? s.narration], ["字幕", s.subtitle?.zh]]) for (const m of cnTermIssues(t)) W(`${tag}: ${k}有${m}`);
    for (const m of h.readingIssues(s.tts ?? s.narration)) W(`${tag}: 念稿 ${m}`);
    if (!s.subtitle?.zh || !s.subtitle?.en) E(`${tag}: 缺字幕（subtitle.zh／en）`);
    else h.splitPhrases(s.subtitle.zh, s.keywords ?? [], h.SUB_MAX_EM_V2).forEach((l, li) => { const w = h.emWidth(h.phraseDisplay(l)); if (w > h.SUB_MAX_EM_V2) E(`${tag}: 字幕短語 ${li + 1}「${l}」寬 ${w.toFixed(1)}em > ${h.SUB_MAX_EM_V2} → 用 \\n 指定斷點或精簡`); });
    for (const k of s.keywords ?? []) if (!String(s.subtitle?.zh ?? "").replace(/\n/g, "").includes(k)) W(`${tag}: 關鍵詞「${k}」不在字幕裡`);
    const cueIds = new Set();
    for (const c of s.cues ?? []) { if (!h.clean(s.narration).includes(h.clean(c.text))) E(`${tag}: cue「${c.id}」的詞「${c.text}」不在旁白裡`); if (cueIds.has(c.id)) E(`${tag}: cue id「${c.id}」重複`); cueIds.add(c.id); }
    if (!(s.cues ?? []).length) W(`${tag}: 沒有 cue（畫面要對到旁白念到的詞）`);
    const walk = (v, where) => {
      if (Array.isArray(v)) return v.forEach((x, k) => walk(x, `${where}[${k}]`));
      if (!v || typeof v !== "object") return;
      for (const [k, x] of Object.entries(v)) {
        if (/^(at|until)$/.test(k)) {
          const m = /^([^\s+-]+)([+-]\d+)?$/.exec(String(x));
          if (!m) E(`${tag}: ${where}.${k}「${x}」格式不對（cueId、start、voice、end、exit，可加 ±N 幀）`);
          else { if (!AT_BASE.includes(m[1]) && !cueIds.has(m[1])) E(`${tag}: ${where}.${k}「${x}」找不到 cue「${m[1]}」`); if (m[2] && Math.abs(Number(m[2])) > 30) W(`${tag}: ${where}.${k}「${x}」離觸發詞超過 30 幀（時間要跟著配音）`); }
        } else if (k === "color") { if (!COLORS.includes(x)) E(`${tag}: ${where}.color「${x}」不存在（${COLORS.join("／")}）`); }
        else if (k === "part") { if (!PARTS.includes(x)) E(`${tag}: ${where}.part「${x}」不存在（${PARTS.join("／")}）`); }
        else if (typeof x === "string" && /^(text|title|kicker)$/.test(k)) { if (h.len(x) > 8) W(`${tag}: ${where}.${k}「${x}」${h.len(x)} 字 > 8（標籤要短）`); }
        else walk(x, `${where}.${k}`);
      }
    };
    walk(s.props ?? {}, "props");
    if ((s.props?.labels ?? []).length > 2) W(`${tag}: 一幕新增的標籤建議 ≤2 個`);
    if ((s.sources ?? []).length) { const px = h.emWidth(`來源：${s.sources.join("、")}`) * 24; if (px > 900) E(`${tag}: 出處太長（約 ${Math.round(px)}px > 900）`); }
  });
  if (!scenes[0].props?.hook?.title) E("第一幕要有 props.hook.title（第 0 幀就看得到的主張）");
  if (!scenes.some((s) => s.props?.explode)) W("沒有 explode（產品台的主動作是沿一個軸一層層分開）");
  const est = Math.round(scenes.reduce((a, s) => a + h.voicedSeconds(s, true), 0));
  if (script.sample !== false && (est < 9 || est > 20)) W(`估算 ${est} 秒（旁白 ${total} 字）：風格試片建議 10–15 秒`);
  return { errors, warns, est };
}

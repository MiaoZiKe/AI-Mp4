// 前後對照分割畫面（script.json 頂層 styleVersion: 3 ＋ stage: "split"）的檢查。由 scripts/validate.mjs 的 validate() 呼叫。
// 時間軸、配音、字幕沿用 v3 的流程；畫面是 src/components/ai-split/。時間軸檢查共用 scripts/ui/validate-ui.mjs 的 validateTimelineUI。
// 規則：旁白字數、字幕短語寬度、cue 在旁白裡、props 的 at 只能寫 cue id 或 start｜voice｜end｜exit ±N 幀、畫面字長度、欄位色、分隔線步驟。
import { resolveProfile, profileIssues, cnTermIssues } from "../voice-profile.mjs";

const AT_BASE = ["start", "voice", "end", "exit"];
const COLORS = ["violet", "blue", "green", "amber"];
const MODES = ["good", "run", "full"];

export function validateSplit(script, h) {
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
  let total = 0; const modes = [];
  scenes.forEach((s, i) => {
    const tag = s.id ?? `#${i}`;
    if (!s.id || ids.indexOf(s.id) !== i) E(`${tag}: id 缺少或重複`);
    if (s.component !== "SplitScene") E(`${tag}: stage "split" 的 component 只能是 SplitScene：${s.component}`);
    const n = h.len(s.narration); total += n;
    if (n < 4) E(`${tag}: 旁白太短（${n} 字）`); else if (n > 26) W(`${tag}: 旁白 ${n} 字 > 26（建議拆開）`);
    for (const [k, t] of [["念稿", s.tts ?? s.narration], ["字幕", s.subtitle?.zh]]) for (const m of cnTermIssues(t)) W(`${tag}: ${k}有${m}`);
    for (const m of h.readingIssues(s.tts ?? s.narration)) W(`${tag}: 念稿 ${m}`);
    if (!s.subtitle?.zh || !s.subtitle?.en) E(`${tag}: 缺字幕（subtitle.zh／en）`);
    else h.splitPhrases(s.subtitle.zh, s.keywords ?? [], h.SUB_MAX_EM_V2).forEach((l, li) => { const w = h.emWidth(h.phraseDisplay(l)); if (w > h.SUB_MAX_EM_V2) E(`${tag}: 字幕短語 ${li + 1}「${l}」寬 ${w.toFixed(1)}em > ${h.SUB_MAX_EM_V2}`); });
    const cueIds = new Set();
    for (const c of s.cues ?? []) { if (!h.clean(s.narration).includes(h.clean(c.text))) E(`${tag}: cue「${c.id}」的詞「${c.text}」不在旁白裡`); if (cueIds.has(c.id)) E(`${tag}: cue id「${c.id}」重複`); cueIds.add(c.id); }
    if (!(s.cues ?? []).length) W(`${tag}: 沒有 cue（畫面要對到旁白念到的詞）`);
    const walk = (v, where) => {
      if (Array.isArray(v)) return v.forEach((x, k) => walk(x, `${where}[${k}]`));
      if (!v || typeof v !== "object") return;
      for (const [k, x] of Object.entries(v)) {
        if (/^(at|typeAt|typeEnd|pulseAt|sweepAt)$/.test(k)) {
          const m = /^([^\s+-]+)([+-]\d+)?$/.exec(String(x));
          if (!m) E(`${tag}: ${where}.${k}「${x}」格式不對（cueId、start、voice、end、exit，可加 ±N 幀）`);
          else { if (!AT_BASE.includes(m[1]) && !cueIds.has(m[1])) E(`${tag}: ${where}.${k}「${x}」找不到 cue「${m[1]}」`); if (m[2] && Math.abs(Number(m[2])) > 30) W(`${tag}: ${where}.${k}「${x}」離觸發詞超過 30 幀`); }
        } else if (k === "color") { if (!COLORS.includes(x)) E(`${tag}: ${where}.color「${x}」不存在（${COLORS.join("／")}）`); }
        else if (typeof x === "string" && /^(text|title|label|t|kicker|sub|bad|good|head)$/.test(k)) { if (h.len(x) > 17) W(`${tag}: ${where}.${k}「${x}」${h.len(x)} 字 > 17（會溢出）`); }
        else walk(x, `${where}.${k}`);
      }
    };
    walk(s.props ?? {}, "props");
    for (const d of s.props?.divider ?? []) {
      if (typeof d.to !== "number" || d.to < 0 || d.to > 0.7 || (d.to > 0 && d.to < 0.28)) E(`${tag}: divider.to ${d.to} 要是 0（推滿）或 0.28–0.7`);
      if (d.mode) { if (!MODES.includes(d.mode)) E(`${tag}: divider.mode「${d.mode}」不存在（${MODES.join("／")}）`); modes.push(d.mode); }
    }
    if ((s.props?.slots ?? []).length > 4) E(`${tag}: slots 最多 4 個`);
    if ((s.props?.reply?.lines ?? []).length !== 2 && s.props?.reply) E(`${tag}: reply.lines 要剛好 2 行`);
    if ((s.sources ?? []).length) { const px = h.emWidth(`來源：${s.sources.join("、")}`) * 26; if (px > 900) E(`${tag}: 出處太長（約 ${Math.round(px)}px > 900）`); }
  });
  const p0 = scenes[0].props ?? {};
  if (!p0.hook?.title) E("第一幕要有 props.hook.title（第 0 幀就看得到的主張）");
  if (!p0.labels?.bad || !p0.labels?.good) E("第一幕要有 props.labels.bad／good（兩半的名字）");
  if (!(p0.divider ?? []).length) E("第一幕要有 props.divider（分隔線的起始位置）");
  if (modes.join() !== MODES.join()) E(`divider 的 mode 要依序各出現一次：${MODES.join(" → ")}（現在是 ${modes.join(" → ") || "沒有"}）`);
  const est = Math.round(scenes.reduce((a, s) => a + h.voicedSeconds(s, true), 0));
  if (script.sample !== false && (est < 9 || est > 20)) W(`估算 ${est} 秒（旁白 ${total} 字）：風格試片建議 10–15 秒`);
  return { errors, warns, est };
}

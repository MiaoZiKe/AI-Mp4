// 仿介面動畫（script.json 頂層 styleVersion: 3 ＋ stage: "ui"）的檢查。由 scripts/validate.mjs 的 validate() 呼叫。
// 時間軸、配音、字幕沿用 v3 的流程（tts-take → align → timeline v2）；畫面不用紙材，所以不檢查 public/v3/<slug>/。
// 規則：旁白字數、字幕短語寬度、cue 在旁白裡、props 的 at 只能寫 cue id 或 start｜voice｜end｜exit ±N 幀、畫面字長度、旁白設定檔。
import { resolveProfile, profileIssues, cnTermIssues } from "../voice-profile.mjs";

const AT_BASE = ["start", "voice", "end", "exit"];
const COLORS = ["violet", "blue", "green", "amber", "coral"];

export function validateUI(script, h) {
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
    if (s.component !== "UiScene") E(`${tag}: stage "ui" 的 component 只能是 UiScene：${s.component}`);
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
    // props 裡所有名為 at／typeAt／typeEnd／slotsAt 的值
    const walk = (v, where) => {
      if (Array.isArray(v)) return v.forEach((x, k) => walk(x, `${where}[${k}]`));
      if (!v || typeof v !== "object") return;
      for (const [k, x] of Object.entries(v)) {
        if (/^(at|typeAt|typeEnd|slotsAt|sweepAt|pulseAt)$/.test(k)) {
          const m = /^([^\s+-]+)([+-]\d+)?$/.exec(String(x));
          if (!m) E(`${tag}: ${where}.${k}「${x}」格式不對（cueId、start、voice、end、exit，可加 ±N 幀）`);
          else { if (!AT_BASE.includes(m[1]) && !cueIds.has(m[1])) E(`${tag}: ${where}.${k}「${x}」找不到 cue「${m[1]}」`); if (m[2] && Math.abs(Number(m[2])) > 30) W(`${tag}: ${where}.${k}「${x}」離觸發詞超過 30 幀（時間要跟著配音）`); }
        } else if (k === "color") { if (!COLORS.includes(x)) E(`${tag}: ${where}.color「${x}」不存在（${COLORS.join("／")}）`); }
        else if (typeof x === "string" && /^(text|title|label|t|kicker|sub)$/.test(k)) { if (h.len(x) > 16) W(`${tag}: ${where}.${k}「${x}」${h.len(x)} 字 > 16（手機上會太小或溢出）`); }
        else walk(x, `${where}.${k}`);
      }
    };
    walk(s.props ?? {}, "props");
    if ((s.props?.slots ?? []).length > 4) E(`${tag}: slots 最多 4 個`);
    if ((s.sources ?? []).length) { const px = h.emWidth(`來源：${s.sources.join("、")}`) * 28; if (px > 900) E(`${tag}: 出處太長（約 ${Math.round(px)}px > 900）`); }
  });
  if (!scenes[0].props?.hook?.title) E("第一幕要有 props.hook.title（第 0 幀就看得到的主張）");
  // 風格試片 10–20 秒；正式片 45–75 秒。兩種都不擋，只提醒
  const est = Math.round(scenes.reduce((a, s) => a + h.voicedSeconds(s, true), 0));
  if (script.sample !== false && (est < 9 || est > 20)) W(`估算 ${est} 秒（旁白 ${total} 字）：風格試片建議 10–15 秒`);
  return { errors, warns, est };
}

/** 時間軸檢查：存在、沒過期、每個 cue 都對到幀、相鄰事件間隔 */
export function validateTimelineUI(script, tl) {
  const errors = [], warns = [];
  if (!tl) { warns.push("尚無 timeline.json（先配音再 npm run align）"); return { errors, warns }; }
  if (tl.version !== 2) { errors.push("timeline.json 不是 version 2，請重跑 npm run align"); return { errors, warns }; }
  if (tl.scenes.map((x) => x.id).join() !== script.scenes.map((x) => x.id).join()) { errors.push("timeline.json 已過期（幕序與 script.json 不同）：重跑 tts／align"); return { errors, warns, stale: true }; }
  const pts = [0];
  for (const t of tl.scenes) { for (const c of t.cues ?? []) { if (c.frame === null || c.frame === undefined) errors.push(`timeline ${t.id}: cue「${c.id}」（${c.text}）沒對到時間`); else pts.push(c.frame); } pts.push(t.startFrame); }
  pts.push(tl.totalFrames); pts.sort((a, b) => a - b);
  const gap = Math.max(...pts.slice(1).map((v, k) => v - pts[k]));
  if (gap > 120) warns.push(`相鄰畫面事件最長間隔 ${(gap / tl.fps).toFixed(1)} 秒 > 4 秒（加 cue）`);
  return { errors, warns, sec: tl.totalSec };
}

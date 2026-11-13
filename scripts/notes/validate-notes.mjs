// 觀察者筆記風格（script.json 頂層 stage: "notes"；「談晴說礙」頻道）的檢查。
// 由 scripts/validate.mjs 的 validate() 呼叫（helpers 由它傳入）。時間軸、配音、字幕沿用 styleVersion 3 的整篇配音流程。
// 畫面元件還沒寫（2026/11/13 只做前製）；props 的寫法見 videos/sample-talk-notes/storyboard.md。口吻規則見 docs/channels/tanqing-shuoai.md。
import { resolveProfile, profileIssues, cnTermIssues } from "../voice-profile.mjs";

const AT_BASE = ["start", "voice", "end", "exit"];
const NOTE_KINDS = ["hand", "number", "tally", "source", "sunny", "ask"];
/** 頻道禁用語（docs/channels/tanqing-shuoai.md 第 3 節）。旁白、字幕、畫面手寫字都查 */
export const TANQING_BANNED = ["你應該", "你必須", "你一定要", "加油就好", "療癒", "諮商", "扎心", "正能量", "放過自己", "擁抱自己", "一切都會好", "會好起來", "別擔心", "不要難過", "相信自己"];
/** 只警告：容易寫成說教或雞湯的字，逐句看過再留 */
export const TANQING_SOFT = ["你要", "加油", "其實你", "記得要", "別忘了", "一定會", "值得", "努力就", "只要你", "躺平", "擺爛", "小確幸"];

export function validateNotes(script, h) {
  const errors = [], warns = [];
  const E = (m) => errors.push(m), W = (m) => warns.push(m);
  for (const k of ["slug", "title", "asOf"]) if (typeof script[k] !== "string" || !script[k]) E(`頂層缺少 ${k}`);
  if (script.asOf && !/^\d{4}\/\d{1,2}\/\d{1,2}$/.test(script.asOf)) E(`asOf 格式應為 YYYY/M/D：${script.asOf}`);
  if (script.styleVersion !== 3) E("stage: \"notes\" 要搭配 styleVersion: 3（沿用整篇配音與時間軸 v2 的流程）");
  if (!script.voice || typeof script.voice.voiceName !== "string") E("頂層缺少 voice.voiceName");
  const prof = resolveProfile(script.voice);
  if (!prof) E("沒有 voice.profile：配音前先定旁白設定檔（docs/voice-profiles.md）");
  else for (const m of profileIssues(prof)) E(m);
  const scenes = Array.isArray(script.scenes) ? script.scenes : [];
  if (!scenes.length) { E("scenes 是空的"); return { errors, warns, est: 0 }; }
  const cueIds = new Map(scenes.map((s) => [s.id, new Set((s.cues ?? []).map((c) => c.id))]));
  const checkAt = (at, s, tag) => {
    if (typeof at !== "string") return E(`${tag}: at 要是字串（cue id 或 start｜voice｜end｜exit，可加減幾幀；別幕的 cue 寫「幕id:cue」）`);
    const m = /^(?:([^:\s]+):)?([^\s+-]+)([+-]\d+)?$/.exec(at);
    if (!m) return E(`${tag}: at「${at}」格式不對`);
    const sid = m[1] ?? s.id;
    if (!cueIds.has(sid)) return E(`${tag}: at「${at}」指到不存在的幕「${sid}」`);
    if (!AT_BASE.includes(m[2]) && !cueIds.get(sid).has(m[2])) E(`${tag}: at「${at}」找不到 cue「${m[2]}」（幕 ${sid}）`);
  };
  const tone = (t, tag, what) => {
    const x = String(t ?? "");
    for (const w of TANQING_BANNED) if (x.includes(w)) E(`${tag}: ${what}有頻道禁用語「${w}」（觀察者口吻，不說教、不灌雞湯；docs/channels/tanqing-shuoai.md）`);
    for (const w of TANQING_SOFT) if (x.includes(w)) W(`${tag}: ${what}有「${w}」，確認不是在說教或安慰`);
  };
  const ids = new Set();
  let chars = 0, numbers = 0, sunny = 0;
  for (const [i, s] of scenes.entries()) {
    const tag = `第 ${i + 1} 幕 (${s.id ?? "?"})`;
    if (!s.id || ids.has(s.id)) E(`${tag}: id 缺少或重複`); ids.add(s.id);
    if (s.component !== "NoteScene") E(`${tag}: stage "notes" 的 component 只能是 NoteScene：${s.component}`);
    if (typeof s.narration !== "string" || !s.narration) E(`${tag}: 缺 narration`);
    chars += h.len(s.narration);
    if (!s.subtitle?.zh || !s.subtitle?.en) E(`${tag}: 缺 subtitle.zh／en`);
    for (const [k, t] of [["念稿", s.tts ?? s.narration], ["字幕", s.subtitle?.zh]]) { for (const m of cnTermIssues(t)) W(`${tag}: ${k}有${m}`); tone(t, tag, k); }
    if (h.readingIssues) for (const m of h.readingIssues(s.tts ?? s.narration)) W(`${tag}: 念稿 ${m}`);
    if (/[：:；;]/.test(s.tts ?? s.narration ?? "")) W(`${tag}: 念稿有冒號或分號（會念成宣布；docs/voice-natural.md）`);
    const zh = s.subtitle?.zh ?? "";
    for (const p of h.splitPhrases(zh, s.keywords ?? [], h.SUB_MAX_EM_V2)) if (h.emWidth(h.phraseDisplay(p)) > h.SUB_MAX_EM_V2) W(`${tag}: 字幕短語「${p}」超過 ${h.SUB_MAX_EM_V2} 個全形字`);
    for (const e of String(s.subtitle?.en ?? "").split("|").map((x) => x.trim())) if (e.length > 46) W(`${tag}: 英文副字幕「${e}」> 46 字元`);
    for (const k of s.keywords ?? []) if (!zh.includes(k)) E(`${tag}: 關鍵詞「${k}」不在字幕裡`);
    for (const c of s.cues ?? []) if (!h.clean(s.narration).includes(h.clean(c.text))) E(`${tag}: cue「${c.id}」的字「${c.text}」不在旁白裡`);
    if (!Array.isArray(s.sources) || !s.sources.length) E(`${tag}: 缺 sources（沒有數字的幕寫「觀察描寫，非統計」）`);
    const p = s.props ?? {};
    if (!p.photo || typeof p.photo.name !== "string" || !/^[a-z0-9-]+$/.test(p.photo.name)) E(`${tag}: props.photo.name 必填（小寫英文加連字號；對到 out/<slug>/assets-raw/photos/<name>.jpg）`);
    if (p.photo?.at !== undefined) checkAt(p.photo.at, s, `${tag}.photo`);
    if (!Array.isArray(p.notes) || !p.notes.length) { E(`${tag}: props.notes 要是非空陣列（手寫字）`); continue; }
    if (p.notes.length > 3) W(`${tag}: 手寫字 ${p.notes.length} 則 > 3（安靜的畫面，一鏡一件事）`);
    p.notes.forEach((n, j) => {
      const t = `${tag}.notes[${j}]`;
      if (!NOTE_KINDS.includes(n.kind)) E(`${t}: kind「${n.kind}」不認得（${NOTE_KINDS.join("／")}）`);
      if (typeof n.text !== "string" || !n.text) E(`${t}: 缺 text`);
      else for (const line of n.text.split("\n")) if (h.emWidth(line) > 12) W(`${t}: 手寫字一行「${line}」> 12 個全形字，用 \\n 斷行`);
      checkAt(n.at, s, t);
      tone(n.text, t, "手寫字");
      if (n.kind === "number") { numbers++; if (!n.claim) E(`${t}: number 要有 claim（指到 research.md 的事實編號，例如 F1）`); }
      if (n.kind === "sunny") sunny++;
    });
  }
  if (numbers !== 1) E(`全片 kind: "number" 的手寫字有 ${numbers} 個；這個風格一支片只放一個有來源的數字`);
  if (!sunny) E("全片沒有 kind: \"sunny\" 的手寫字：結尾要留一小段「晴」");
  else if (!(scenes[scenes.length - 1].props?.notes ?? []).some((n) => n.kind === "sunny")) W("「晴」（kind: sunny）不在最後一幕");
  // 風格試片：旁白 55–70 字（約 12–15 秒）
  if (chars < 55 || chars > 70) W(`旁白共 ${chars} 字，試片建議 55–70 字`);
  const est = Math.round(chars / 4.7 + 1.5);
  return { errors, warns, est };
}

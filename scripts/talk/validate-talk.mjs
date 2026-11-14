// 夜窗風格（script.json 頂層 stage: "talk"；「談晴說礙」頻道）的檢查。
// 由 scripts/validate.mjs 的 validate() 呼叫（helpers 由它傳入）。時間軸、配音、字幕沿用 styleVersion 3 的整篇配音流程。
// 畫面元件：src/components/talk/（engine.ts、TalkVideo.tsx）；token：src/theme.ts 的 THEME_TALK／LAYOUT_TALK。
// 口吻規則見 docs/channels/tanqing-shuoai.md（禁用語與 stage "notes" 共用）；風格理由見 docs/channels/tanqing-visual-research.md。
import { resolveProfile, profileIssues, cnTermIssues } from "../voice-profile.mjs";
import { TANQING_BANNED, TANQING_SOFT } from "../notes/validate-notes.mjs";

const AT_BASE = ["start", "voice", "end", "exit"];
const WORD_KINDS = ["number", "line", "windows", "sunny", "ask"];
const GRADES = ["night", "warm"];
const PUSH = ["in", "out", "drift"];

export function validateTalk(script, h) {
  const errors = [], warns = [];
  const E = (m) => errors.push(m), W = (m) => warns.push(m);
  for (const k of ["slug", "title", "asOf"]) if (typeof script[k] !== "string" || !script[k]) E(`頂層缺少 ${k}`);
  if (script.asOf && !/^\d{4}\/\d{1,2}\/\d{1,2}$/.test(script.asOf)) E(`asOf 格式應為 YYYY/M/D：${script.asOf}`);
  if (script.styleVersion !== 3) E("stage: \"talk\" 要搭配 styleVersion: 3（沿用整篇配音與時間軸 v2 的流程）");
  if (!script.voice || typeof script.voice.voiceName !== "string") E("頂層缺少 voice.voiceName");
  else if (script.voice.voiceName !== "Sulafat") W(`談晴說礙的音色固定 Sulafat（CLAUDE.md 各頻道音色）：${script.voice.voiceName}`);
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
  let chars = 0, numbers = 0, sunny = 0, warm = false;
  for (const [i, s] of scenes.entries()) {
    const tag = `第 ${i + 1} 幕 (${s.id ?? "?"})`;
    if (!s.id || ids.has(s.id)) E(`${tag}: id 缺少或重複`); ids.add(s.id);
    if (s.component !== "TalkScene") E(`${tag}: stage "talk" 的 component 只能是 TalkScene：${s.component}`);
    if (typeof s.narration !== "string" || !s.narration) E(`${tag}: 缺 narration`);
    chars += h.len(s.narration);
    if (!s.subtitle?.zh || !s.subtitle?.en) E(`${tag}: 缺 subtitle.zh／en`);
    for (const [k, t] of [["念稿", s.tts ?? s.narration], ["字幕", s.subtitle?.zh]]) { for (const m of cnTermIssues(t)) W(`${tag}: ${k}有${m}`); tone(t, tag, k); }
    if (h.readingIssues) for (const m of h.readingIssues(s.tts ?? s.narration)) W(`${tag}: 念稿 ${m}`);
    if (/[：:；;]/.test(s.tts ?? s.narration ?? "")) W(`${tag}: 念稿有冒號或分號（會念成宣布；docs/voice-natural.md）`);
    // 「你」只能出現在提問裡（docs/channels/tanqing-shuoai.md 第 2 節）
    if (/你/.test(s.narration ?? "") && !/[？?]/.test(s.narration ?? "")) W(`${tag}: 旁白有「你」但不是提問；這個頻道的「你」只出現在提問裡`);
    const zh = s.subtitle?.zh ?? "";
    for (const p of h.splitPhrases(zh, s.keywords ?? [], h.SUB_MAX_EM_V2)) if (h.emWidth(h.phraseDisplay(p)) > h.SUB_MAX_EM_V2) W(`${tag}: 字幕短語「${p}」超過 ${h.SUB_MAX_EM_V2} 個全形字`);
    for (const e of String(s.subtitle?.en ?? "").split("|").map((x) => x.trim())) if (e.length > 46) W(`${tag}: 英文副字幕「${e}」> 46 字元`);
    for (const k of s.keywords ?? []) if (!zh.includes(k)) E(`${tag}: 關鍵詞「${k}」不在字幕裡`);
    for (const c of s.cues ?? []) if (!h.clean(s.narration).includes(h.clean(c.text))) E(`${tag}: cue「${c.id}」的字「${c.text}」不在旁白裡`);
    if (!Array.isArray(s.sources) || !s.sources.length) E(`${tag}: 缺 sources（沒有數字的幕寫「觀察描寫，非統計」或「照片為情境示意」）`);
    const p = s.props ?? {};
    const shots = Array.isArray(p.photos) ? p.photos : p.photo ? [p.photo] : [];
    if (!shots.length) E(`${tag}: props.photo（或 photos）必填：一鏡一張實拍照片`);
    if (shots.length > 2) W(`${tag}: 一幕換 ${shots.length} 張照片，這個風格不快切`);
    shots.forEach((ph, j) => {
      const t = `${tag}.photo[${j}]`;
      if (typeof ph.name !== "string" || !/^[a-z0-9-]+$/.test(ph.name)) E(`${t}: name 必填（小寫英文加連字號；對到 public/talk/<slug>/<name>.jpg）`);
      if (ph.at !== undefined) checkAt(ph.at, s, t);
      if (ph.push !== undefined && !PUSH.includes(ph.push)) E(`${t}: push「${ph.push}」不認得（${PUSH.join("／")}）`);
      if (ph.focus !== undefined && !(Array.isArray(ph.focus) && ph.focus.length === 2 && ph.focus.every((v) => v >= 0 && v <= 1))) E(`${t}: focus 要是 [0–1, 0–1]`);
    });
    if (p.grade !== undefined && !GRADES.includes(p.grade)) E(`${tag}: grade「${p.grade}」不認得（${GRADES.join("／")}）`);
    if (p.gradeAt !== undefined) checkAt(p.gradeAt, s, `${tag}.gradeAt`);
    if (p.grade === "warm") warm = true;
    const words = Array.isArray(p.words) ? p.words : [];
    if (!words.length) W(`${tag}: props.words 是空的（這一鏡只有照片和字幕）`);
    if (words.filter((w) => w.kind === "line" || w.kind === "sunny").length > 2) W(`${tag}: 句子超過 2 句（一個畫面最多兩句）`);
    words.forEach((w, j) => {
      const t = `${tag}.words[${j}]`;
      if (!WORD_KINDS.includes(w.kind)) E(`${t}: kind「${w.kind}」不認得（${WORD_KINDS.join("／")}）`);
      if (w.kind !== "windows") {
        if (typeof w.text !== "string" || !w.text) E(`${t}: 缺 text`);
        else for (const line of w.text.split("\n")) if (h.emWidth(line) > 14) W(`${t}: 一行「${line}」> 14 個全形字，用 \\n 斷行`);
        tone(w.text, t, "畫面字");
      } else {
        if (!(Number.isInteger(w.count) && w.count > 0 && w.count <= 10)) E(`${t}: windows 要有 count（1–10）`);
        if (!(Number.isInteger(w.lit) && w.lit >= 0 && w.lit <= (w.count ?? 10))) E(`${t}: windows 要有 lit（0–count）`);
        if (w.litAt !== undefined) checkAt(w.litAt, s, `${t}.litAt`);
      }
      checkAt(w.at, s, t);
      if (w.until !== undefined) checkAt(w.until, s, `${t}.until`);
      if (w.kind === "number") { numbers++; if (!w.claim) E(`${t}: number 要有 claim（指到 research.md 的事實編號，例如 F1）`); }
      if (w.kind === "sunny") sunny++;
    });
  }
  // 鉤子：第 0 幀就要有大字（第一幕有 at: "start" 的 number 或 line）
  const hook = (scenes[0].props?.words ?? []).filter((w) => w.at === "start" && (w.kind === "number" || w.kind === "line"));
  if (!hook.length) E("第一幕沒有 at: \"start\" 的 number／line：第 0 幀就要有後果或數字的大字");
  if (numbers !== 1) E(`全片 kind: "number" 有 ${numbers} 個；這個風格一支片只放一個有來源的數字`);
  if (!sunny) E("全片沒有 kind: \"sunny\"：結尾要留一小段「晴」");
  if (!warm) W("沒有一幕 grade: \"warm\"：晴的那一段照片要換成暖色");
  if (chars < 50 || chars > 70) W(`旁白共 ${chars} 字，短片建議 50–70 字（約 10–15 秒）`);
  const est = Math.round(chars / 4.7 + 1.5);
  return { errors, warns, est };
}

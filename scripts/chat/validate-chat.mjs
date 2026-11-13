// 對話泡泡風格（script.json 頂層 stage: "chat"；時間軸沿用 styleVersion 3 的整篇配音流程）的檢查。
// 由 scripts/validate.mjs 的 validate() 呼叫（helpers 由它傳入）。元件在 src/components/chat/，說明見 videos/sample-love-chat/README.md。
import { resolveProfile, profileIssues, cnTermIssues } from "../voice-profile.mjs";

const TYPES = ["bubble", "compose", "read", "typing", "card", "stat", "react"];
const AT_BASE = ["start", "voice", "end", "exit"];

export function validateChat(script, h) {
  const errors = [], warns = [];
  const E = (m) => errors.push(m), W = (m) => warns.push(m);
  for (const k of ["slug", "title", "asOf"]) if (typeof script[k] !== "string" || !script[k]) E(`頂層缺少 ${k}`);
  if (script.asOf && !/^\d{4}\/\d{1,2}\/\d{1,2}$/.test(script.asOf)) E(`asOf 格式應為 YYYY/M/D：${script.asOf}`);
  if (script.styleVersion !== 3) E("stage: \"chat\" 要搭配 styleVersion: 3（沿用整篇配音與時間軸 v2 的流程）");
  if (!script.voice || typeof script.voice.voiceName !== "string") E("頂層缺少 voice.voiceName");
  const prof = resolveProfile(script.voice);
  if (!prof) E("沒有 voice.profile：配音前先定旁白設定檔（docs/voice-profiles.md）");
  else for (const m of profileIssues(prof)) E(m);
  if (!script.chat?.note) E("頂層 chat.note 必填：畫面上要標明是情境示意（例如「情境示意，非真實對話」）");
  const scenes = Array.isArray(script.scenes) ? script.scenes : [];
  if (!scenes.length) { E("scenes 是空的"); return { errors, warns, est: 0 }; }
  const cueIds = new Map(scenes.map((s) => [s.id, new Set((s.cues ?? []).map((c) => c.id))]));
  const ids = new Set();
  const checkAt = (at, s, tag) => {
    if (typeof at !== "string") return E(`${tag}: at 要是字串（cue id 或 start｜voice｜end｜exit，可加減幾幀；別幕的 cue 寫「幕id:cue」）`);
    const m = /^(?:([^:\s]+):)?([^\s+-]+)([+-]\d+)?$/.exec(at);
    if (!m) return E(`${tag}: at「${at}」格式不對`);
    const sid = m[1] ?? s.id;
    if (!cueIds.has(sid)) return E(`${tag}: at「${at}」指到不存在的幕「${sid}」`);
    if (!AT_BASE.includes(m[2]) && !cueIds.get(sid).has(m[2])) E(`${tag}: at「${at}」找不到 cue「${m[2]}」（幕 ${sid}）`);
  };
  let chars = 0;
  for (const [i, s] of scenes.entries()) {
    const tag = `第 ${i + 1} 幕 (${s.id ?? "?"})`;
    if (!s.id || ids.has(s.id)) E(`${tag}: id 缺少或重複`); ids.add(s.id);
    if (s.component !== "ChatScene") E(`${tag}: stage "chat" 的 component 只能是 ChatScene：${s.component}`);
    if (typeof s.narration !== "string" || !s.narration) E(`${tag}: 缺 narration`);
    chars += h.len(s.narration);
    if (!s.subtitle?.zh || !s.subtitle?.en) E(`${tag}: 缺 subtitle.zh／en`);
    for (const [k, t] of [["念稿", s.tts ?? s.narration], ["字幕", s.subtitle?.zh]]) for (const m of cnTermIssues(t)) W(`${tag}: ${k}有${m}`);
    const zh = s.subtitle?.zh ?? "";
    const phrases = h.splitPhrases(zh, s.keywords ?? [], h.SUB_MAX_EM_V2);
    for (const p of phrases) if (h.emWidth(h.phraseDisplay(p)) > h.SUB_MAX_EM_V2) W(`${tag}: 字幕短語「${p}」超過 ${h.SUB_MAX_EM_V2} 個全形字，會縮小或溢出`);
    const en = String(s.subtitle?.en ?? "").split("|").map((x) => x.trim());
    for (const e of en) if (e.length > 46) W(`${tag}: 英文副字幕「${e}」> 46 字元`);
    if (en.length > phrases.length) W(`${tag}: 英文分了 ${en.length} 段，中文短語只有 ${phrases.length} 段`);
    for (const k of s.keywords ?? []) if (!zh.includes(k)) E(`${tag}: 關鍵詞「${k}」不在字幕裡`);
    for (const c of s.cues ?? []) if (!h.clean(zh).includes(h.clean(c.text))) E(`${tag}: cue「${c.id}」的字「${c.text}」不在字幕裡`);
    if (!Array.isArray(s.sources) || !s.sources.length) E(`${tag}: 缺 sources（情境幕寫「情境示意，非真實對話」）`);
    const evs = s.props?.events;
    if (!Array.isArray(evs)) { E(`${tag}: props.events 要是陣列`); continue; }
    evs.forEach((ev, j) => {
      const t = `${tag}.events[${j}]`;
      if (!TYPES.includes(ev.type)) return E(`${t}: type「${ev.type}」不認得（${TYPES.join("／")}）`);
      checkAt(ev.at, s, t);
      for (const k of ["until", "countAt", "fillAt", "labelAt"]) if (ev[k] !== undefined) checkAt(ev[k], s, `${t}.${k}`);
      if (["bubble", "typing", "card"].includes(ev.type) && !["me", "them"].includes(ev.side)) E(`${t}: side 要是 me 或 them`);
      if (ev.type === "bubble" || ev.type === "compose") {
        if (typeof ev.text !== "string" || !ev.text) E(`${t}: 缺 text`);
        else for (const line of ev.text.split("\n")) if (h.emWidth(line) > 10) W(`${t}: 泡泡一行「${line}」> 10 個全形字，用 \\n 斷行`);
      }
      if (ev.type === "stat") { if (!(ev.total > 0) || !(ev.on >= 0) || ev.on > ev.total) E(`${t}: stat 要有 total 與 on（on ≤ total）`); if (!ev.big || !ev.label) E(`${t}: stat 要有 big 與 label`); }
      if (ev.type === "card" && (typeof ev.title !== "string" || typeof ev.value !== "number")) E(`${t}: card 要有 title 與 value（數字）`);
    });
  }
  // 風格試片：旁白 55–70 字（約 12–15 秒）
  if (chars < 55 || chars > 70) W(`旁白共 ${chars} 字，試片建議 55–70 字`);
  const est = Math.round(chars / 4.8 + 1.5);
  return { errors, warns, est };
}

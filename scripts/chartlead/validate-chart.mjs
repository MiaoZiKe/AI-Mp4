// 資料圖表主導（script.json 頂層 styleVersion: 3 ＋ stage: "chart"）的檢查。由 scripts/validate.mjs 的 validate() 呼叫。
// 時間軸、配音、字幕沿用 v3 的流程（tts-take → align → timeline v2）；畫面是 src/components/chartlead/ 的一張階梯圖＋長條，不用紙材。
// 規則：頂層 chart.steps（關卡、日期、收盤值）要完整且遞增；每幕要有出處；props 的時間只能寫 cue id 或 start｜voice｜end｜exit ±N 幀。
import { resolveProfile, profileIssues, cnTermIssues } from "../voice-profile.mjs";

const AT_BASE = ["start", "voice", "end", "exit"];
const AT_KEYS = /^(at|drawAt|targetAt|countAt|landAt|bracketAt)$/;
const isDate = (d) => /^\d{4}-\d{2}-\d{2}$/.test(String(d)) && !Number.isNaN(Date.parse(d));

export function validateChart(script, h) {
  const errors = [], warns = [];
  const E = (m) => errors.push(m), W = (m) => warns.push(m);
  for (const k of ["slug", "title", "asOf"]) if (typeof script[k] !== "string" || !script[k]) E(`頂層缺少 ${k}`);
  if (script.asOf && !/^\d{4}\/\d{1,2}\/\d{1,2}$/.test(script.asOf)) E(`asOf 格式應為 YYYY/M/D：${script.asOf}`);
  if (script.styleVersion !== 3) E("stage: \"chart\" 要搭配 styleVersion: 3（沿用整篇配音與時間軸 v2 的流程）");
  if (!script.voice || typeof script.voice.voiceName !== "string") E("頂層缺少 voice.voiceName");
  const prof = resolveProfile(script.voice);
  if (!prof) E("沒有 voice.profile：配音前要先定旁白設定檔（docs/voice-profiles.md）");
  else for (const m of profileIssues(prof)) E(m);
  // 圖表資料
  const c = script.chart ?? {};
  if (!c.title || !c.kicker) E("頂層 chart 要有 kicker 與 title（圖表一定要有標題，第 0 幀就看得到）");
  if (!c.note) E("頂層 chart.note 必填：說明這張圖畫的是什麼（例如「階梯＝收盤首次站上的整數關卡，不是每日走勢」）");
  const steps = Array.isArray(c.steps) ? c.steps : [];
  if (steps.length < 2 || steps.length > 5) E(`chart.steps 要 2–5 個關卡（現在 ${steps.length} 個）`);
  steps.forEach((s, i) => {
    if (!(s.level > 0) || !s.label || !isDate(s.date) || !(s.close > 0)) E(`chart.steps[${i}] 要有 level、label、date（YYYY-MM-DD）、close（當天收盤值，寫進 research.md）`);
    else if (s.close < s.level) E(`chart.steps[${i}]：收盤 ${s.close} 沒有站上 ${s.level}`);
    if (i && (s.level <= steps[i - 1].level || Date.parse(s.date) <= Date.parse(steps[i - 1].date))) E(`chart.steps[${i}]：關卡與日期都要比前一個大`);
  });
  const scenes = Array.isArray(script.scenes) ? script.scenes : [];
  if (!scenes.length) { E("scenes 是空的"); return { errors, warns, est: 0 }; }
  const ids = scenes.map((s) => s.id);
  let total = 0;
  const legs = new Set();
  scenes.forEach((s, i) => {
    const tag = s.id ?? `#${i}`;
    if (!s.id || ids.indexOf(s.id) !== i) E(`${tag}: id 缺少或重複`);
    if (s.component !== "ChartScene") E(`${tag}: stage "chart" 的 component 只能是 ChartScene：${s.component}`);
    const n = h.len(s.narration); total += n;
    if (n < 4) E(`${tag}: 旁白太短（${n} 字）`); else if (n > 26) W(`${tag}: 旁白 ${n} 字 > 26（一鏡 2–4 秒，建議拆開）`);
    for (const [k, t] of [["念稿", s.tts ?? s.narration], ["字幕", s.subtitle?.zh]]) for (const m of cnTermIssues(t)) W(`${tag}: ${k}有${m}`);
    for (const m of h.readingIssues(s.tts ?? s.narration)) W(`${tag}: 念稿 ${m}`);
    if (/買進|賣出|進場|出場|加碼|抄底|目標價|必漲|穩賺/.test(s.narration)) E(`${tag}: 旁白像投資建議（${s.narration}）`);
    if (!s.subtitle?.zh || !s.subtitle?.en) E(`${tag}: 缺字幕（subtitle.zh／en）`);
    else h.splitPhrases(s.subtitle.zh, s.keywords ?? [], h.SUB_MAX_EM_V2).forEach((l, li) => { const w = h.emWidth(h.phraseDisplay(l)); if (w > h.SUB_MAX_EM_V2) E(`${tag}: 字幕短語 ${li + 1}「${l}」寬 ${w.toFixed(1)}em > ${h.SUB_MAX_EM_V2} → 用 \\n 指定斷點或精簡`); });
    for (const e of String(s.subtitle?.en ?? "").split("|")) if (e.trim().length > 46) W(`${tag}: 英文副字幕「${e.trim()}」> 46 字元`);
    for (const k of s.keywords ?? []) if (!String(s.subtitle?.zh ?? "").replace(/\n/g, "").includes(k)) E(`${tag}: 關鍵詞「${k}」不在字幕裡`);
    const cueIds = new Set();
    for (const q of s.cues ?? []) { if (!h.clean(s.subtitle?.zh ?? "").includes(h.clean(q.text))) E(`${tag}: cue「${q.id}」的詞「${q.text}」不在字幕裡`); if (cueIds.has(q.id)) E(`${tag}: cue id「${q.id}」重複`); cueIds.add(q.id); }
    if (!(s.cues ?? []).length) W(`${tag}: 沒有 cue（畫面要對到旁白念到的詞）`);
    if (!Array.isArray(s.sources) || !s.sources.length) E(`${tag}: 缺 sources（圖表上的每個數字都要有出處）`);
    else { const px = h.emWidth(`來源：${s.sources.join("、")}`) * 24; if (px > 900) E(`${tag}: 出處太長（約 ${Math.round(px)}px > 900）`); }
    const walk = (v, where) => {
      if (Array.isArray(v)) return v.forEach((x, k) => walk(x, `${where}[${k}]`));
      if (!v || typeof v !== "object") return;
      for (const [k, x] of Object.entries(v)) {
        if (AT_KEYS.test(k)) {
          const m = /^([^\s+-]+)([+-]\d+)?$/.exec(String(x));
          if (!m) E(`${tag}: ${where}.${k}「${x}」格式不對（cueId、start、voice、end、exit，可加 ±N 幀）`);
          else { if (!AT_BASE.includes(m[1]) && !cueIds.has(m[1])) E(`${tag}: ${where}.${k}「${x}」找不到 cue「${m[1]}」`); if (m[2] && Math.abs(Number(m[2])) > 30) W(`${tag}: ${where}.${k}「${x}」離觸發詞超過 30 幀（時間要跟著配音）`); }
        } else walk(x, `${where}.${k}`);
      }
    };
    walk(s.props ?? {}, "props");
    const p = s.props ?? {};
    if (p.view && (!isDate(p.view.from) || !isDate(p.view.to) || Date.parse(p.view.to) <= Date.parse(p.view.from))) E(`${tag}: props.view 要有 from／to（YYYY-MM-DD，to 比 from 晚）`);
    if (p.leg) { if (!Number.isInteger(p.leg.i) || p.leg.i < 0 || p.leg.i >= steps.length - 1) E(`${tag}: props.leg.i 要是 0–${steps.length - 2}（第幾段：steps[i] → steps[i+1]）`); else if (legs.has(p.leg.i)) E(`${tag}: 第 ${p.leg.i} 段重複`); legs.add(p.leg.i); }
    if (p.gain && (!Array.isArray(p.gain.bars) || p.gain.bars.length !== steps.length - 1)) E(`${tag}: props.gain.bars 要剛好 ${steps.length - 1} 個（每一段一條）`);
    if (!p.view && !p.leg && !p.gain) W(`${tag}: 這一幕畫面沒有任何變化（props 要有 view／leg／gain）`);
  });
  if (!scenes[0].props?.view) E("第一幕要有 props.view（一開始的時間範圍）");
  if (total < 55 || total > 70) W(`旁白共 ${total} 字，風格試片建議 55–70 字`);
  const est = Math.round(total / 4.8 + 1.5);
  return { errors, warns, est };
}

/** 時間軸檢查：存在、沒過期、每個 cue 都對到幀、相鄰畫面事件間隔 */
export function validateTimelineChart(script, tl) {
  const errors = [], warns = [];
  if (!tl) { warns.push("尚無 timeline.json（先配音再 npm run align）"); return { errors, warns }; }
  if (tl.version !== 2) { errors.push("timeline.json 不是 version 2，請重跑 npm run align"); return { errors, warns }; }
  if (tl.scenes.map((x) => x.id).join() !== script.scenes.map((x) => x.id).join()) { errors.push("timeline.json 已過期（幕序與 script.json 不同）：重跑 tts／align"); return { errors, warns, stale: true }; }
  const pts = [0];
  for (const t of tl.scenes) { for (const q of t.cues ?? []) { if (q.frame === null || q.frame === undefined) errors.push(`timeline ${t.id}: cue「${q.id}」（${q.text}）沒對到時間`); else pts.push(q.frame); } pts.push(t.startFrame); }
  pts.push(tl.totalFrames); pts.sort((a, b) => a - b);
  const gap = Math.max(...pts.slice(1).map((v, k) => v - pts[k]));
  if (gap > 120) warns.push(`相鄰畫面事件最長間隔 ${(gap / tl.fps).toFixed(1)} 秒 > 4 秒（加 cue）`);
  return { errors, warns, sec: tl.totalSec };
}

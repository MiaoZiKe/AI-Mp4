// 3D 產品台（script.json 頂層 styleVersion: 3 ＋ stage: "three"；對外稱「v4 產品台」）的檢查。由 scripts/validate.mjs 的 validate() 呼叫。
// 時間軸、配音、字幕沿用 v3 的整篇配音流程；畫面用 @remotion/three，不用紙材。時間軸檢查共用 scripts/ui/validate-ui.mjs 的 validateTimelineUI。
import fs from "node:fs";
import path from "node:path";
import { resolveProfile, profileIssues, cnTermIssues } from "../voice-profile.mjs";

const SHAPES = ["slab", "ring", "plane", "box", "cyl", "tube", "sphere"];
const ROLES = ["lid", "heatFloor", "heatSource", "xray"];
const THERMAL_FX = ["peek", "cutaway", "heat", "vapor", "spread", "condense", "flowBack"];
/** 產品模型資料（script.json 的 model 或 videos/<slug>/model.json）的檢查；回傳可以標註的點（anchors 的鍵） */
function checkModel(script, E, W) {
  const mp = path.join(path.dirname(new URL(import.meta.url).pathname), "../../videos", String(script.slug), "model.json");
  const m = script.model ?? (fs.existsSync(mp) ? JSON.parse(fs.readFileSync(mp, "utf8")) : null);
  if (!m) { E(`stage "three" 需要產品模型資料：videos/${script.slug}/model.json（格式見 docs/three-stage.md）`); return null; }
  for (const k of ["size", "palette", "materials", "layers", "parts", "anchors"]) if (!m[k]) E(`model: 缺少 ${k}`);
  const layers = new Set((m.layers ?? []).map((l) => l.id)), mats = m.materials ?? {};
  (m.layers ?? []).forEach((l) => { if (typeof l.z !== "number" || typeof l.k !== "number") E(`model.layers「${l.id}」要有 z（組裝時的位置）與 k（分解時往哪邊移幾個層距）`); });
  for (const [k, d] of Object.entries(mats)) {
    if (!d.color) E(`model.materials「${k}」缺 color`);
    if (d.kind && !["std", "phys", "screen", "unlit"].includes(d.kind)) E(`model.materials「${k}」kind「${d.kind}」不存在（std／phys／screen／unlit）`);
    if (d.tex && !["wick", "traces", "brushed"].includes(d.tex)) E(`model.materials「${k}」tex「${d.tex}」不存在（wick／traces／brushed）`);
  }
  (m.parts ?? []).forEach((p, i) => {
    const tag = `model.parts「${p.id ?? i}」`;
    if (!SHAPES.includes(p.shape)) E(`${tag} shape「${p.shape}」不存在（${SHAPES.join("／")}）`);
    if (!layers.has(p.layer)) E(`${tag} layer「${p.layer}」不在 layers 裡`);
    if (!mats[p.mat]) E(`${tag} mat「${p.mat}」不在 materials 裡`);
    if (!Array.isArray(p.size) || p.size.some((x) => typeof x !== "number" || x <= 0)) E(`${tag} size 要是正數陣列`);
    if (p.role && !ROLES.includes(p.role)) E(`${tag} role「${p.role}」不存在（${ROLES.join("／")}）`);
  });
  for (const [k, a] of Object.entries(m.anchors ?? {})) if (!layers.has(a.layer)) E(`model.anchors「${k}」的 layer「${a.layer}」不在 layers 裡`);
  if (m.thermal && !layers.has(m.thermal.layer)) E(`model.thermal.layer「${m.thermal.layer}」不在 layers 裡`);
  if ((m.parts ?? []).length > 120) W(`model: 零件 ${m.parts.length} 個（軟體渲染下愈多愈慢，先 node scripts/three/bench-fx.mjs 量時間）`);
  return m;
}

const AT_BASE = ["start", "voice", "end", "exit"];
const COLORS = ["amber", "blue", "coral", "mint"];

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
  const model = checkModel(script, E, W);
  const PARTS = Object.keys(model?.anchors ?? {}), LAYERS = (model?.layers ?? []).map((l) => l.id);
  const cuesOf = Object.fromEntries(scenes.map((s) => [s.id, new Set((s.cues ?? []).map((c) => c.id))]));
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
          // 可以寫「幕id:cue±N」指到別幕的 cue（例如標籤的 until）
          const m0 = /^(?:([^\s:+-]+):)?([^\s:+-]+)([+-]\d+)?$/.exec(String(x));
          const m = m0 ? [m0[0], m0[2], m0[3]] : null;
          const pool = m0?.[1] ? cuesOf[m0[1]] : cueIds;
          if (!m) E(`${tag}: ${where}.${k}「${x}」格式不對（cueId、start、voice、end、exit，可加 ±N 幀；別幕的寫「幕id:cue」）`);
          else if (!pool) E(`${tag}: ${where}.${k}「${x}」找不到幕「${m0[1]}」`);
          else { if (!AT_BASE.includes(m[1]) && !pool.has(m[1])) E(`${tag}: ${where}.${k}「${x}」找不到 cue「${m[1]}」`); if (m[2] && Math.abs(Number(m[2])) > 30) W(`${tag}: ${where}.${k}「${x}」離觸發詞超過 30 幀（時間要跟著配音）`); }
        } else if (k === "color") { if (!COLORS.includes(x)) E(`${tag}: ${where}.color「${x}」不存在（${COLORS.join("／")}）`); }
        else if (k === "part") { if (!PARTS.includes(x)) E(`${tag}: ${where}.part「${x}」不在 model.anchors 裡（${PARTS.join("／")}）`); }
        else if (k === "layer") { if (!LAYERS.includes(x)) E(`${tag}: ${where}.layer「${x}」不在 model.layers 裡（${LAYERS.join("／")}）`); }
        else if (typeof x === "string" && /^(text|title|kicker)$/.test(k)) { if (h.len(x) > 8) W(`${tag}: ${where}.${k}「${x}」${h.len(x)} 字 > 8（標籤要短）`); }
        else walk(x, `${where}.${k}`);
      }
    };
    walk(s.props ?? {}, "props");
    for (const k of THERMAL_FX) if (s.props?.[k] && !model?.thermal) E(`${tag}: props.${k} 是熱循環特效，model 要有 thermal`);
    if ((s.props?.labels ?? []).length > 2) W(`${tag}: 一幕新增的標籤建議 ≤2 個`);
    if ((s.sources ?? []).length) { const px = h.emWidth(`來源：${s.sources.join("、")}`) * 24; if (px > 900) E(`${tag}: 出處太長（約 ${Math.round(px)}px > 900）`); }
  });
  if (!scenes[0].props?.hook?.title) E("第一幕要有 props.hook.title（第 0 幀就看得到的主張）");
  if (!scenes.some((s) => s.props?.explode)) W("沒有 explode（產品台的主動作是沿一個軸一層層分開）");
  const est = Math.round(scenes.reduce((a, s) => a + h.voicedSeconds(s, true), 0));
  if (script.sample !== false && (est < 9 || est > 20)) W(`估算 ${est} 秒（旁白 ${total} 字）：風格試片建議 10–15 秒`);
  return { errors, warns, est };
}

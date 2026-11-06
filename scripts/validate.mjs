// npm run validate <slug>：檢查 script.json 結構、字數、元件 props、來源列寬度、總長估算（配音版）
import fs from "node:fs";
import path from "node:path";
const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");

export const ICONS = ["capitol","ballot","scale","chip","container","globe","money","chart","shield","island","question","gavel","users",
  "house","baby","heart","clock","wallet","briefcase","bitcoin","building","bank","cycle","vault","warning","rocket","bulb","brain","bolt","flag","handshake","graduation","calendar","lock","trendUp","trendDown","percent","ring","document","server","robot","cloud","atom","medical","stroller","coins","megaphone","key"];
const COLORS = ["cyan","pink","yellow","purple"];
const STATUS = ["fact","expected","pending"];
const COMPONENTS = ["TermCard","FlowRow","CompareSplit","BigNumber","SeatBar","IconGrid","ImpactCard","EndCard"];
/** styleVersion 2 可用元件（SeatBar 尚未做 v2 版） */
const COMPONENTS_V2 = ["HookTitle","CtaCard","TermCard","FlowRow","CompareSplit","BigNumber","IconGrid","ImpactCard","EndCard","KineticText","LineChart","UnitGrid","DepthStage","BarChart"];
/**
 * v2 元件類別（docs/viz-research.md）：card／chart／kinetic／depth／metaphor／end。
 * DepthStage 包的卡片算 depth；HookTitle 是全螢幕大字主張，算 kinetic；CtaCard 有選項卡片，算 card。
 */
export const CATEGORY_V2 = { HookTitle: "kinetic", KineticText: "kinetic", CtaCard: "card", TermCard: "card", FlowRow: "card", CompareSplit: "card", BigNumber: "card", IconGrid: "card", ImpactCard: "card",
  LineChart: "chart", BarChart: "chart", UnitGrid: "chart", DepthStage: "depth", EndCard: "end" };
const DEPTH_FRONTS = ["CompareSplit","FlowRow","ImpactCard","IconGrid","TermCard","BigNumber"];
/** LAYOUT_V2（src/theme.ts）：以 regex 讀「名稱: 數字」，與 audit.py 相同 */
export const layoutV2 = () => {
  const src = fs.readFileSync(path.join(ROOT, "src", "theme.ts"), "utf8");
  const blk = src.slice(src.indexOf("export const LAYOUT_V2"));
  return Object.fromEntries([...blk.slice(0, blk.indexOf("} as const")).matchAll(/^\s*([A-Z_]+):\s*([\d.]+)/gm)].map((m) => [m[1], Number(m[2])]));
};
/** 規則 10：由元件與 props 算出主視覺宣告外框（全解析度 [x0, y0, x1, y1]）；chart＝繪圖區 */
export const mainBox = (s, Lt) => {
  const full = [Lt.X, Lt.CONTENT_TOP, Lt.X_RIGHT, Lt.CONTENT_BOTTOM];
  switch (s.component) {
    case "KineticText": return { box: [Lt.X, Lt.KT_TOP, Lt.X_RIGHT, Lt.KT_BOTTOM] };
    case "LineChart": return { box: full, plot: [Lt.X, Lt.PLOT_TOP, Lt.X_RIGHT, Lt.PLOT_BOTTOM] };
    case "BarChart": return { box: full, plot: [Lt.X, Lt.BAR_TOP, Lt.X_RIGHT, Lt.PLOT_BOTTOM] };
    case "UnitGrid": return { box: full, plot: [Lt.X, Lt.CONTENT_TOP + 210, Lt.X_RIGHT, Lt.CONTENT_TOP + 780] };
    case "DepthStage": { const fx = Lt.X + (952 - Lt.FRONT_W) / 2; return { box: [fx, Lt.DEPTH_TOP, fx + Lt.FRONT_W + 48, Lt.DEPTH_BOTTOM + 48], front: [fx, Lt.DEPTH_TOP, fx + Lt.FRONT_W, Lt.DEPTH_BOTTOM] }; }
    case "EndCard": return { box: [Lt.X, Lt.CONTENT_TOP, Lt.X_RIGHT, Lt.SOURCE_BOTTOM] };
    default: return { box: full };
  }
};
/** 規則 9：卡片畫面文字（不含字幕、英文副標、色名、圖示、cue id 等欄位）字數 */
const TEXT_SKIP = new Set(["icon", "color", "status", "at", "startAt", "noteAt", "footerAt", "subAt", "slamAt", "optionsAt", "promptAt", "taiwanAt", "titleAt", "component", "pos", "mode", "order", "source", "ref", "claims"]);
export const cardText = (o) => { let n = 0; const w = (v, k) => { if (k && (TEXT_SKIP.has(k) || /En$/.test(k))) return; if (typeof v === "string") n += clean(v).length; else if (Array.isArray(v)) v.forEach((x) => w(x)); else if (v && typeof v === "object") for (const [kk, vv] of Object.entries(v)) w(vv, kk); }; w(o); return n; };
const BEATS = ["hook","you","mechanism","twist","payoff","cta"];
/** v2 字幕：短語每段上限（em），與 src/theme.ts 的 LAYOUT_V2.SUB_MAX_EM 一致 */
export const SUB_MAX_EM_V2 = 11.5;
/** props 裡引用 cue 的欄位 */
const AT_KEYS = ["at","startAt","noteAt","footerAt","subAt","slamAt","optionsAt","promptAt","taiwanAt","titleAt"];
const FORBIDDEN_CTA = ["分享給","傳給","標記"];
const PUNCT = /[\s，。、！？：；「」『』（）,.!?:;()"'“”‘’…—\-–·]/g;
export const clean = (s) => String(s ?? "").replace(PUNCT, "");
const len = (s) => clean(s).length;
export const splitLines = (zh) => {
  if (zh.includes("\n")) return zh.split("\n");
  if (zh.length <= 14) return [zh];
  const mid = zh.length / 2; let best = -1;
  for (let i = 0; i < zh.length - 1; i++) if ("，；：、".includes(zh[i]) && (best < 0 || Math.abs(i + 1 - mid) < Math.abs(best - mid))) best = i + 1;
  return best > 0 ? [zh.slice(0, best), zh.slice(best)] : [zh];
};
/** 字幕一行的估算寬度（em）：全形字與全形標點 1、英數 0.6、半形標點 0.4、空白 0.3；字幕框 952px / 64px ≈ 14.9em；行內不換行，置中後最多可到 15.6em 仍在安全區 */
export const emWidth = (line) => [...line].reduce((w, ch) => w + (/\s/.test(ch) ? 0.3 : /[A-Za-z0-9%$.,:;!?()'"\-–]/.test(ch) ? 0.6 : 1), 0);
/**
 * v2 字幕短語模式（P1-4）：一次只顯示一個短語（單行，≤ maxEm 寬；76px 時約 11 個全形字）。
 * 先在「，。！？；：、」後切句，太長的句子依寬度平均切開（關鍵詞、英數連續段不拆），太短的（<3em）併入下一段。
 * 回傳的每段都是 zh 的連續子字串（含標點），align.mjs 依此算每段出現的幀；畫面顯示時去掉段尾的「，、；：。」。
 */
export function splitPhrases(zh, keywords = [], maxEm = 11) {
  const text = zh;
  const toks = [];
  const kws = [...keywords].filter(Boolean).sort((a, b) => b.length - a.length);
  for (let i = 0; i < text.length;) {
    if (text[i] === "\n") { toks.push("\n"); i++; continue; }
    const kw = kws.find((k) => text.startsWith(k, i));
    if (kw) { toks.push(kw); i += kw.length; continue; }
    const q = /^「[^」\n]{1,10}」/.exec(text.slice(i)); // 短引號整段不拆
    if (q) { toks.push(q[0]); i += q[0].length; continue; }
    const m = /^[A-Za-z0-9%$.+/\-–]+/.exec(text.slice(i));
    if (m) { toks.push(m[0]); i += m[0].length; continue; }
    toks.push(text[i]); i++;
  }
  const BREAK = "，。！？；：、";
  const clauses = [];
  let cur = [];
  for (const t of toks) {
    if (t === "\n") { if (cur.length) clauses.push(cur); cur = []; continue; } // \n＝指定斷點
    cur.push(t); if (t.length === 1 && BREAK.includes(t)) { clauses.push(cur); cur = []; }
  }
  if (cur.length) clauses.push(cur);
  // 句首的收尾引號、標點併回上一句
  for (let k = 1; k < clauses.length; k++) while (clauses[k].length && /^[」』）)]$/.test(clauses[k][0])) clauses[k - 1].push(clauses[k].shift());
  const out = [];
  for (const c of clauses.filter((x) => x.length)) {
    const em = emWidth(c.join(""));
    if (em <= maxEm) { out.push(c.join("")); continue; }
    const n = Math.ceil(em / maxEm), target = em / n;
    let acc = [], w = 0;
    for (const t of c) {
      const tw = emWidth(t);
      const isPunct = t.length === 1 && /[，。！？；：、」』）)]/.test(t);
      if (acc.length && !isPunct && w + tw > target + 0.5 && out.length < 99) { out.push(acc.join("")); acc = []; w = 0; }
      acc.push(t); w += tw;
    }
    if (acc.length) out.push(acc.join(""));
  }
  // 太短（<3em）併入下一段（併完仍 ≤ maxEm）
  for (let k = 0; k < out.length - 1; k++) {
    if (emWidth(out[k]) < 3 && emWidth(out[k] + out[k + 1]) <= maxEm) { out[k + 1] = out[k] + out[k + 1]; out.splice(k, 1); k--; }
  }
  return out;
}
/** 畫面顯示：去掉段尾的逗號類標點 */
export const phraseDisplay = (p) => p.replace(/[，、；：。]+$/, "");

/** 配音版每幕秒數估算：每秒約 4.3 字 + 0.9 秒間隔（v1）；v2 換幕間隔約 0.15 秒＋殘留靜音 → +0.35 秒 */
export const voicedSeconds = (s, v2 = false) => s.component === "EndCard" ? 4.5 : len(s.tts ?? s.narration) / 4.3 + (v2 ? 0.35 : 0.9);
/** 片長規範：v1 舊片 70–100 秒；styleVersion 2 為 45–75 秒（鉤子幕與 CTA 幕可短到 3 秒） */
export const LENGTH = { 1: { min: 70, max: 100, hardMin: 65, hardMax: 105 }, 2: { min: 45, max: 75, hardMin: 40, hardMax: 80 } };

/** P0-7：程式碼規則（grep）。src 內禁用 Math.random／Date.now；元件內不寫字面的 spring／interpolate（一律走 anim.ts 的 token） */
export function lintSource() {
  const errors = [];
  const walk = (d) => fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => e.isDirectory() ? walk(path.join(d, e.name)) : /\.(ts|tsx)$/.test(e.name) ? [path.join(d, e.name)] : []);
  for (const f of walk(path.join(ROOT, "src"))) {
    const rel = path.relative(ROOT, f);
    const src = fs.readFileSync(f, "utf8");
    src.split("\n").forEach((line, i) => {
      if (/^\s*(\/\/|\*)/.test(line)) return;
      if (/Math\.random\s*\(|Date\.now\s*\(/.test(line)) errors.push(`${rel}:${i + 1} 禁用 Math.random／Date.now（隨機要用固定 seed）`);
      if (/src\/components\/(?!anim\.ts)/.test(rel) && /\bspring\s*\(|\binterpolate\s*\(/.test(line)) errors.push(`${rel}:${i + 1} 元件內不要直接呼叫 spring／interpolate，改用 anim.ts 的 motion token`);
      // 規則 8（效能與 2.5D 上限）：v2 元件不得用 filter（只有 DepthStage 背景層的 dof 例外）；禁止 3D 引擎；rotateY ≤ 20°
      if (/src\/components\/v2\//.test(rel) && /\bfilter\s*:/.test(line) && !/\bdof\b/.test(line)) errors.push(`${rel}:${i + 1} 規則8：v2 元件不得用 CSS filter（軟體渲染很貴；景深只能用 DepthStage 背景層的 dof）`);
      if (/ThreeCanvas|@remotion\/three|from\s+["']three["']|WebGL|getContext\(\s*["']webgl/.test(line)) errors.push(`${rel}:${i + 1} 規則8：主片不得使用 3D 引擎（three.js／@remotion/three／WebGL）`);
      for (const m of line.matchAll(/rotateY\(\s*(-?[\d.]+)/g)) if (Math.abs(Number(m[1])) > 20) errors.push(`${rel}:${i + 1} 規則8：rotateY ${m[1]}° > 20°`);
    });
  }
  const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, "package.json"), "utf8"));
  for (const d of Object.keys({ ...pkg.dependencies, ...pkg.devDependencies })) if (/^(three|@remotion\/three|@react-three\/)/.test(d)) errors.push(`package.json 規則8：不得依賴 3D 引擎 ${d}`);
  return errors;
}

/** 時間軸 v2 檢查：幀數接續、人聲不重疊且間隔 ≥ 0.08 秒、總長 */
export function validateTimelineV2(script, tl) {
  const errors = [], warns = [];
  const E = (m) => errors.push(m), W = (m) => warns.push(m);
  if (!tl) { W("styleVersion 2 尚無 timeline.json（先 npm run tts && npm run align）"); return { errors, warns }; }
  if (tl.version !== 2) { E("styleVersion 2 但 timeline.json 不是 version 2，請重跑 npm run align"); return { errors, warns }; }
  const ids = script.scenes.map((x) => x.id), tids = tl.scenes.map((x) => x.id);
  if (ids.join() !== tids.join()) { W(`timeline.json 已過期（幕序與 script.json 不一致：script ${ids.length} 幕、timeline ${tids.length} 幕）→ npm run tts && npm run align 後再驗；still／render 前必須一致`); return { errors, warns, stale: true }; }
  tl.scenes.forEach((x, i) => {
    const n = tl.scenes[i + 1];
    const sec = x.durationFrames / 30;
    if (n && n.startFrame !== x.startFrame + x.durationFrames - n.transitionFrames) E(`timeline ${n.id}: startFrame ${n.startFrame} ≠ 前一幕結束 ${x.startFrame + x.durationFrames} − 轉場 ${n.transitionFrames}`);
    if (n && x.voiceEndFrame != null && n.voiceStartFrame != null) {
      const gap = (n.voiceStartFrame - x.voiceEndFrame) / 30;
      if (gap < 0) E(`timeline ${x.id} → ${n.id}: 人聲重疊 ${(-gap).toFixed(2)} 秒`);
      else if (gap < 0.08) E(`timeline ${x.id} → ${n.id}: 人聲間隔 ${gap.toFixed(2)} 秒 < 0.08（轉場太長或停頓太短）`);
      const want = script.scenes.find((s) => s.id === x.id)?.pauseAfter;
      if (typeof want === "number" && want > 0 && Math.abs(gap - want) > 0.08) W(`timeline ${x.id}: pauseAfter ${want} 秒，實際人聲間隔 ${gap.toFixed(2)} 秒（請重跑 npm run align）`);
      const tail = (x.startFrame + x.durationFrames - x.voiceEndFrame) / 30;
      if (n.transitionFrames / 30 > tail + (n.voiceStartFrame - n.startFrame) / 30 + 1e-6) E(`timeline ${n.id}: 轉場 ${n.transitionFrames} 幀超過 TAIL＋LEAD`);
    }
    const end = i === tl.scenes.length - 1;
    // 規則 5：cue 一定要在逐字時間軸裡找得到；超過 5 秒的幕，開口→各 cue→收聲 的間距 ≤ 3 秒
    const sc = script.scenes.find((s) => s.id === x.id);
    for (const q of x.cues ?? []) if (q.frame === null || q.frame === undefined) E(`規則5：timeline ${x.id}: cue「${q.text}」不在逐字時間軸裡`);
    if (sec > 5 && sc && sc.component !== "EndCard") {
      const pts = [x.voiceStartFrame, ...(x.cues ?? []).map((q) => q.frame).filter((v) => typeof v === "number"), x.voiceEndFrame].sort((a, b) => a - b);
      const gmax = Math.max(...pts.slice(1).map((v, k) => v - pts[k]));
      if (gmax > 90) W(`規則5：timeline ${x.id}: beat 間距最大 ${(gmax / 30).toFixed(1)} 秒 > 3 秒（加 cue 讓畫面跟著念）`);
    }
    if (sec > 10.5) W(`timeline ${x.id}: 幕長 ${sec.toFixed(1)} 秒 > 10`);
    if (sec < 3) E(`timeline ${x.id}: 幕長 ${sec.toFixed(1)} 秒 < 3`);
    else if (sec < 5 && i !== 0 && !end && !["hook", "cta"].includes(script.scenes.find((s) => s.id === x.id)?.beat)) W(`timeline ${x.id}: 幕長 ${sec.toFixed(1)} 秒 < 5（只有鉤子幕與 CTA 幕可短到 3 秒）`);
    if (i === 0 && script.scenes[0]?.beat === "hook" && (sec < 3 || sec > 5.2)) W(`timeline ${x.id}: 鉤子幕 ${sec.toFixed(1)} 秒（建議 3–5 秒）`);
  });
  const last = tl.scenes[tl.scenes.length - 1];
  if (last && last.startFrame + last.durationFrames !== tl.totalFrames) E(`timeline.totalFrames ${tl.totalFrames} ≠ 最後一幕結束 ${last.startFrame + last.durationFrames}`);
  const L = LENGTH[2], sec = tl.totalFrames / 30;
  if (sec < L.min || sec > L.max) E(`配音版實際總長 ${sec.toFixed(1)} 秒，應在 ${L.min}–${L.max} 秒`);
  return { errors, warns, sec };
}

export function validate(script) {
  const errors = [], warns = [];
  const E = (m) => errors.push(m), W = (m) => warns.push(m);
  const str = (v, what, max, min = 1, hard = max + 6) => {
    if (typeof v !== "string") return E(`${what} 必須是字串`);
    const n = len(v);
    if (n < min) E(`${what} 太短（${n} 字）`);
    if (n > hard) E(`${what} 太長（${n} 字 > ${hard}，會溢出）：「${v}」`);
    else if (n > max) W(`${what} 偏長（${n} 字 > ${max}）：「${v}」`);
  };
  const icon = (v, what) => { if (!ICONS.includes(v)) E(`${what} 圖示「${v}」不存在，可用：${ICONS.join(" ")}`); };
  const color = (v, what) => { if (v !== undefined && !COLORS.includes(v)) E(`${what} 顏色「${v}」不合法（${COLORS.join("/")}）`); };
  const arr = (v, what, min, max) => { if (!Array.isArray(v)) { E(`${what} 必須是陣列`); return false; } if (v.length < min || v.length > max) E(`${what} 數量 ${v.length}，應在 ${min}–${max}`); return true; };

  for (const k of ["slug", "title", "asOf"]) if (typeof script[k] !== "string" || !script[k]) E(`頂層缺少 ${k}`);
  if (script.asOf && !/^\d{4}\/\d{1,2}\/\d{1,2}$/.test(script.asOf)) E(`asOf 格式應為 YYYY/M/D：${script.asOf}`);
  if (!script.voice || typeof script.voice.voiceName !== "string") E("頂層缺少 voice.voiceName（Gemini 音色名）");
  if (script.styleVersion !== undefined && ![1, 2].includes(script.styleVersion)) E(`styleVersion 只能是 1 或 2：${script.styleVersion}`);
  const v2 = script.styleVersion === 2;
  const c = script.cover;
  if (!c) E("頂層缺少 cover");
  else {
    if (arr(c.title, "cover.title", 1, 2)) c.title.forEach((t, i) => str(t, `cover.title[${i}]`, 7, 2, 8));
    if (v2 && Array.isArray(c.title) && c.title.reduce((a, t) => a + len(t), 0) > 10) E(`cover.title 共 ${c.title.reduce((a, t) => a + len(t), 0)} 字 > 10（P1-10：封面 ≤10 字）`);
    if (v2 && c.chips && arr(c.chips, "cover.chips", 2, 3)) c.chips.forEach((ch, i) => { str(ch.value, `cover.chips[${i}].value`, 7, 1, 8); str(ch.label, `cover.chips[${i}].label`, 10, 1, 12); color(ch.color, `cover.chips[${i}]`); });
    str(c.sub ?? "", "cover.sub", 16, 0, 20);
    if (c.en !== undefined && String(c.en).length > 60) W("cover.en 偏長");
    if (c.icons && arr(c.icons, "cover.icons", 1, 3)) c.icons.forEach((ic, i) => { icon(ic.name, `cover.icons[${i}]`); color(ic.color, `cover.icons[${i}]`); });
    if (c.tiles && arr(c.tiles, "cover.tiles", 2, 4)) c.tiles.forEach((t, i) => { icon(t.icon, `cover.tiles[${i}]`); str(t.label, `cover.tiles[${i}].label`, 4, 1, 5); color(t.color, `cover.tiles[${i}]`); });
    if (c.tags && arr(c.tags, "cover.tags", 1, 2)) c.tags.forEach((t, i) => { if (!STATUS.includes(t.status)) E(`cover.tags[${i}].status 不合法`); str(t.text, `cover.tags[${i}].text`, 14, 1, 16); });
  }
  if (!Array.isArray(script.scenes) || !script.scenes.length) { E("scenes 必須是非空陣列"); return { errors, warns }; }
  const scenes = script.scenes;
  if (!v2 && (scenes.length < 11 || scenes.length > 18)) W(`幕數 ${scenes.length}，建議 12–16（含片尾）`);
  const ids = new Set();
  let total = 0;
  scenes.forEach((s, i) => {
    const tag = `scene[${i}] ${s.id ?? "?"}`;
    if (typeof s.id !== "string" || !/^[a-z0-9-]+$/.test(s.id)) E(`${tag}: id 必須是 kebab-case`);
    if (ids.has(s.id)) E(`${tag}: id 重複`); ids.add(s.id);
    if (!(v2 ? COMPONENTS_V2 : COMPONENTS).includes(s.component)) E(`${tag}: 未知元件 ${s.component}${v2 ? "（v2 可用：" + COMPONENTS_V2.join(" ") + "）" : ""}`);
    const isEnd = s.component === "EndCard";
    if (typeof s.narration !== "string") E(`${tag}: 缺 narration`);
    else { const n = len(s.narration); if (!isEnd) { if (n < 8 || n > 32) E(`${tag}: 旁白 ${n} 字（應 15–25）：${s.narration}`); else if (n < 13 || n > 26) W(`${tag}: 旁白 ${n} 字（建議 15–25）：${s.narration}`); } }
    if (s.tts !== undefined && typeof s.tts !== "string") E(`${tag}: tts 必須是字串`);
    if (!s.subtitle || typeof s.subtitle.zh !== "string" || typeof s.subtitle.en !== "string") E(`${tag}: subtitle 需有 zh/en`);
    else {
      const lines = v2 ? [] : splitLines(s.subtitle.zh);
      if (v2) {
        const ph = splitPhrases(s.subtitle.zh, s.keywords ?? [], SUB_MAX_EM_V2);
        ph.forEach((l, li) => { const w = emWidth(phraseDisplay(l)); if (w > SUB_MAX_EM_V2) E(`${tag}: 字幕短語 ${li + 1}「${l}」寬 ${w.toFixed(1)}em > ${SUB_MAX_EM_V2}（76px 字幕會超出 x 64–960）→ 用 \\n 指定斷點或精簡`); });
        if (ph.length > 6) W(`${tag}: 字幕切成 ${ph.length} 段，偏多`);
      }
      if (lines.length > 2) E(`${tag}: 中文字幕超過 2 行`);
      lines.forEach((l, li) => { const n = len(l), w = emWidth(l); if (n > 14) E(`${tag}: 字幕第 ${li + 1} 行 ${n} 字 > 14：「${l}」`); else if (w > 15.6) E(`${tag}: 字幕第 ${li + 1} 行含標點寬 ${w.toFixed(1)}em > 15.6（會超出安全區）：「${l}」→ 用 \\n 改斷行或精簡字幕`); else if (w > 15.0) W(`${tag}: 字幕第 ${li + 1} 行寬 ${w.toFixed(1)}em 略超出字幕框（置中後仍在安全區內）：「${l}」`); });
      if (clean(s.subtitle.zh) !== clean(s.narration)) W(`${tag}: 字幕與旁白文字不同（允許，但請確認是刻意的）`);
      if (s.subtitle.en.length > 110) E(`${tag}: 英文字幕太長（${s.subtitle.en.length}）`); else if (s.subtitle.en.length > 90) W(`${tag}: 英文字幕偏長（${s.subtitle.en.length}）`);
    }
    if (!Array.isArray(s.keywords)) E(`${tag}: keywords 必須是陣列`);
    else {
      if (s.keywords.length > 3) W(`${tag}: 關鍵詞超過 3 個`);
      s.keywords.forEach((k) => { if (!s.subtitle?.zh?.includes(k)) E(`${tag}: 關鍵詞「${k}」不在字幕裡`); if (k.length > (v2 ? 7 : 6)) W(`${tag}: 關鍵詞「${k}」偏長`); if (v2 ? /[，。！？；：、「」\n]/.test(k) : PUNCT.test(k)) E(`${tag}: 關鍵詞「${k}」含標點`); });
    }
    if (!Array.isArray(s.sources)) E(`${tag}: sources 必須是陣列`);
    else {
      if (!s.sources.length && !isEnd && i !== 0 && s.beat !== "cta") E(`${tag}: sources 不可為空`);
      // SourceFooter：22px、單行 nowrap、超出安全區寬 952px 會以「…」截斷（後面的來源與「截至」會消失）
      if (s.sources.length && !isEnd) {
        const footer = `資料來源：${s.sources.join("、")}${script.asOf ? `｜截至 ${script.asOf}` : ""}`;
        const px = Math.round(emWidth(footer) * 22);
        if (px > 952) E(`${tag}: 來源列估寬 ${px}px > 952，畫面會以「…」截斷：「${footer}」→ 縮短來源名稱（細節寫在卡片 note 或 research.md）`);
        else if (px > 900) W(`${tag}: 來源列估寬 ${px}px，接近 952px 上限：「${footer}」`);
      }
    }
    if (s.transition !== undefined && (!v2 || !["fade", "slide"].includes(s.transition))) E(`${tag}: transition 只能是 fade／slide，且只在 styleVersion 2 有效`);
    if (s.pauseAfter !== undefined && (!v2 || typeof s.pauseAfter !== "number" || s.pauseAfter < 0 || s.pauseAfter > 0.7)) E(`${tag}: pauseAfter 應為 0–0.7 秒，且只在 styleVersion 2 有效`);
    if (s.durationSec !== undefined && (typeof s.durationSec !== "number" || s.durationSec < 3 || s.durationSec > 15)) E(`${tag}: durationSec 應為 3–15`);
    if (i === scenes.length - 1 && !isEnd) E("最後一幕必須是 EndCard");
    if (isEnd && i !== scenes.length - 1) E(`${tag}: EndCard 只能是最後一幕`);
    total += voicedSeconds(s, v2);
    if (v2) {
      if (!BEATS.includes(s.beat)) E(`${tag}: v2 每幕要有 beat（${BEATS.join("｜")}）`);
      const cueIds = new Set();
      const cl = clean(s.subtitle?.zh);
      for (const q of s.cues ?? []) {
        if (!q.id || cueIds.has(q.id)) E(`${tag}: cue id 缺少或重複：${q.id}`); cueIds.add(q.id);
        let pos = -1; for (let k = 0; k < (q.occurrence ?? 1); k++) pos = cl.indexOf(clean(q.text), pos + 1);
        if (pos < 0) E(`${tag}: cue「${q.text}」不在字幕裡（第 ${q.occurrence ?? 1} 次）`);
      }
      const walk = (o, path) => { if (!o || typeof o !== "object") return; for (const [k, v] of Object.entries(o)) { if (AT_KEYS.includes(k) && typeof v === "string" && !cueIds.has(v)) E(`${tag}: ${path}${k}「${v}」不是本幕的 cue id`); else walk(v, `${path}${k}.`); } };
      walk(s.props, "props.");
      if ((i === 1 || i === 2) && s.component === "TermCard") E(`${tag}: 第 2–3 幕不能是 TermCard（名詞課往後放，先鉤住觀眾）`);
      const bad = FORBIDDEN_CTA.filter((w) => [s.narration, s.subtitle?.zh, JSON.stringify(s.props ?? {})].some((t) => String(t).includes(w)));
      if (bad.length) E(`${tag}: 不要用「${bad.join("／")}」（engagement bait 會被降權）`);
    }
    const p = s.props ?? {};
    if (typeof p !== "object") E(`${tag}: props 必須是物件`);
    const checkProps = (component, p, tag) => { switch (component) {
      case "KineticText": {
        if (arr(p.lines, `${tag}.lines`, 1, 3)) p.lines.forEach((l, j) => {
          str(String(l.text).replace("{n}", "0"), `${tag}.lines[${j}].text`, 8, 1, 10); color(l.color, `${tag}.lines[${j}]`);
          if (l.size !== undefined && (l.size < 100 || l.size > 200)) E(`${tag}.lines[${j}].size ${l.size}，應 100–200（關鍵詞 140–200）`);
          if (l.count && (typeof l.count.from !== "number" || typeof l.count.to !== "number")) E(`${tag}.lines[${j}].count 需要 from／to 數字`);
          if (l.count && !String(l.text).includes("{n}")) E(`${tag}.lines[${j}]：有 count 但 text 沒有 {n}`);
        });
        if (!(p.lines ?? []).some((l) => (l.size ?? 160) >= 140) && !p.flip) W(`${tag}: KineticText 至少要有一行 ≥140px 或翻牌數字`);
        if (p.flip && (typeof p.flip.value !== "number" || typeof p.flip.from !== "number")) E(`${tag}.flip 需要 value／from 數字`);
        if (p.flip && String(Math.round(p.flip.value)).length > 7) E(`${tag}.flip 數字超過 7 位，翻牌會超出 952px`);
        if (p.aux) { if (!["ring", "sparkline", "icon"].includes(p.aux.type)) E(`${tag}.aux.type 只能 ring／sparkline／icon`); if (p.aux.type === "icon") icon(p.aux.name, `${tag}.aux`); if (p.aux.type === "sparkline" && !(p.aux.values?.length >= 3)) E(`${tag}.aux.values 至少 3 點`); }
        if (p.kicker !== undefined) str(p.kicker, `${tag}.kicker`, 16, 1, 18);
        if (p.note !== undefined) str(p.note, `${tag}.note`, 24, 1, 28);
        break;
      }
      case "LineChart": {
        str(p.title, `${tag}.title`, 16, 1, 18); color(p.color, tag);
        if (arr(p.series, `${tag}.series`, 1, 3)) p.series.forEach((sr, j) => {
          if (!Array.isArray(sr.points) || sr.points.length < 3) E(`${tag}.series[${j}] 至少 3 點`);
          else if (sr.points.some((q, k) => typeof q.t !== "number" || typeof q.v !== "number" || (k && q.t <= sr.points[k - 1].t))) E(`${tag}.series[${j}].points 的 t 要是遞增數字、v 要是數字`);
          color(sr.color, `${tag}.series[${j}]`);
        });
        const pts = (p.series ?? []).flatMap((x) => x.points ?? []);
        const t0 = Math.min(...pts.map((q) => q.t)), t1 = Math.max(...pts.map((q) => q.t)), vM = Math.max(...pts.map((q) => q.v));
        if (pts.some((q) => q.v < 0)) W(`${tag}: LineChart y 軸從 0 起算，負值不會正確顯示`);
        if (p.yMax !== undefined && p.yMax < vM) E(`${tag}.yMax ${p.yMax} 小於資料最大值 ${vM}`);
        if (arr(p.xTicks, `${tag}.xTicks`, 2, 6)) p.xTicks.forEach((x) => { if (x.t < t0 || x.t > t1) E(`${tag}.xTicks t=${x.t} 超出資料範圍`); });
        if (p.notes && arr(p.notes, `${tag}.notes`, 0, 3)) p.notes.forEach((n, j) => { if (n.t < t0 || n.t > t1) E(`${tag}.notes[${j}] t=${n.t} 超出資料範圍 ${t0}–${t1}`); str(n.text, `${tag}.notes[${j}].text`, 9, 1, 11); });
        if (p.band && (p.band.from < t0 || p.band.to > t1 || p.band.from >= p.band.to)) E(`${tag}.band 範圍不合法`);
        if (p.refLine && (typeof p.refLine.value !== "number" || p.refLine.value > (p.yMax ?? vM * 1.12))) E(`${tag}.refLine 超出 y 軸`);
        for (const k of p.draw ?? []) if (k.t < t0 || k.t > t1) E(`${tag}.draw t=${k.t} 超出資料範圍`);
        break;
      }
      case "BarChart": {
        const mode = p.mode ?? "flat";
        if (!["flat", "iso", "race"].includes(mode)) E(`${tag}.mode 只能 flat／iso／race`);
        str(p.title, `${tag}.title`, 16, 1, 18);
        const maxN = mode === "race" ? 7 : 6;
        if (arr(p.bars, `${tag}.bars`, 2, maxN)) p.bars.forEach((b, j) => { if (typeof b.value !== "number") E(`${tag}.bars[${j}].value 必須是數字`); str(b.label, `${tag}.bars[${j}].label`, mode === "race" ? 6 : 5, 1, mode === "race" ? 7 : 6); color(b.color, `${tag}.bars[${j}]`); if (b.icon) icon(b.icon, `${tag}.bars[${j}]`); });
        const vals = (p.bars ?? []).map((b) => b.value);
        if (mode === "flat" && vals.some((v) => v > 0) && vals.some((v) => v < 0)) E(`${tag}: flat 不支援正負混合（全正或全負）`);
        if (mode === "iso" && vals.some((v) => v < 0)) E(`${tag}: iso 只能畫正值（等角柱只表量級）`);
        if (p.max !== undefined && p.max < Math.max(...vals.map(Math.abs))) E(`${tag}.max 小於資料最大值`);
        if (p.note && (p.note.bar < 0 || p.note.bar >= (p.bars ?? []).length)) E(`${tag}.note.bar 超出範圍`);
        if (mode === "race") {
          if (!Array.isArray(p.frames) || p.frames.length < 2) E(`${tag}: race 至少要 2 個 frames`);
          const names = (p.bars ?? []).map((b) => b.label).sort().join("|");
          (p.frames ?? []).forEach((fr, j) => { if (Object.keys(fr.values ?? {}).sort().join("|") !== names) E(`${tag}.frames[${j}] 的標籤與 bars 不一致`); });
        }
        break;
      }
      case "UnitGrid": {
        str(p.title, `${tag}.title`, 16, 1, 18);
        if (p.titleMark && !String(p.title).includes(p.titleMark)) E(`${tag}.titleMark 不在 title 裡`);
        if (typeof p.total !== "number" || typeof p.cols !== "number") E(`${tag}: 需要 total／cols 數字`);
        else { const rows = Math.ceil(p.total / p.cols); if (p.cols < 5 || p.cols > 12 || rows > 12) E(`${tag}: 格子 ${p.cols}×${rows} 超出 5–12 欄、≤12 列`); }
        if (arr(p.groups, `${tag}.groups`, 1, 4)) { const sum = p.groups.reduce((a, g) => a + (g.count ?? 0), 0); if (sum > p.total) E(`${tag}: groups 合計 ${sum} > total ${p.total}`); p.groups.forEach((g, j) => { color(g.color, `${tag}.groups[${j}]`); str(g.label, `${tag}.groups[${j}].label`, 10, 1, 12); }); }
        if (p.frame && (p.frame.group < 0 || p.frame.group >= (p.groups ?? []).length)) E(`${tag}.frame.group 超出範圍`);
        if (p.counters && arr(p.counters, `${tag}.counters`, 1, 2)) p.counters.forEach((k, j) => color(k.color, `${tag}.counters[${j}]`));
        if (!["coin", "person", "square", undefined].includes(p.icon)) E(`${tag}.icon 只能 coin／person／square`);
        break;
      }
      case "DepthStage": {
        if (!p.front || !DEPTH_FRONTS.includes(p.front.component)) E(`${tag}.front.component 只能是 ${DEPTH_FRONTS.join("／")}`);
        else checkProps(p.front.component, p.front.props ?? {}, `${tag}.front`);
        if (p.tilt !== undefined && (p.tilt < 4 || p.tilt > 8)) E(`${tag}.tilt ${p.tilt}°，應 4–8°`);
        if (p.dof !== undefined && (typeof p.dof !== "number" || p.dof < 0 || p.dof > 4)) E(`${tag}.dof 只能是 0–4（px，只套背景層）`);
        if (p.stack && arr(p.stack, `${tag}.stack`, 0, 2)) p.stack.forEach((x, j) => color(x.color, `${tag}.stack[${j}]`));
        if (p.badges && arr(p.badges, `${tag}.badges`, 0, 2)) p.badges.forEach((b, j) => { str(b.text, `${tag}.badges[${j}].text`, 8, 1, 10); color(b.color, `${tag}.badges[${j}]`); });
        if (p.back?.icons && arr(p.back.icons, `${tag}.back.icons`, 0, 5)) p.back.icons.forEach((n) => icon(n, `${tag}.back`));
        break;
      }
      case "HookTitle": {
        if (arr(p.lines, `${tag}.lines`, 1, 2)) {
          const n = p.lines.reduce((a, x) => a + len(x), 0);
          if (n > 10) E(`${tag}: 鉤子主張 ${n} 字 > 10（第 0 幀要一眼讀完）`);
          const nums = p.lines.join("").match(/\d[\d,.]*/g) ?? [];
          if (!nums.length) W(`${tag}: 鉤子主張最好帶一個數字`);
          for (const d of nums) if (!(p.claims ?? []).some((c) => String(c.text).includes(d) && /research\.md/.test(String(c.ref)))) E(`${tag}: 鉤子數字「${d}」要在 props.claims 附 {text, ref}，ref 指向 research.md 的那一列`);
        }
        if (p.sub !== undefined) str(p.sub, `${tag}.sub`, 26, 1, 32);
        for (const d of String(p.sub ?? "").match(/\d[\d,./]*/g) ?? []) if (!(p.claims ?? []).some((c) => String(c.text).includes(d) || String(d).includes(String(c.text)))) W(`${tag}: sub 的數字「${d}」沒有 claim`);
        if (p.tag !== undefined && !STATUS.includes(p.tag)) E(`${tag}.tag 不合法`);
        break;
      }
      case "CtaCard":
        if (arr(p.question, `${tag}.question`, 1, 2)) p.question.forEach((x, j) => str(x, `${tag}.question[${j}]`, 7, 1, 8));
        if (p.options && arr(p.options, `${tag}.options`, 2, 2)) p.options.forEach((o, j) => { str(o.label, `${tag}.options[${j}].label`, 10, 1, 12); color(o.color, `${tag}.options[${j}]`); });
        break;
      case "TermCard":
        icon(p.icon, tag); str(p.term, `${tag}.term`, 8, 1, 10); str(p.definition, `${tag}.definition`, 54, 6, 66); color(p.color, tag);
        if (p.points && arr(p.points, `${tag}.points`, 1, 3)) p.points.forEach((x, j) => str(x, `${tag}.points[${j}]`, 20, 1, 24));
        if (p.termEn !== undefined && String(p.termEn).length > 40) W(`${tag}.termEn 偏長`);
        break;
      case "FlowRow":
        if (p.title !== undefined) str(p.title, `${tag}.title`, 14, 1, 17);
        if (arr(p.steps, `${tag}.steps`, 2, 4)) p.steps.forEach((st, j) => { icon(st.icon, `${tag}.steps[${j}]`); str(st.label, `${tag}.steps[${j}].label`, 12, 1, 15); if (st.note !== undefined) str(st.note, `${tag}.steps[${j}].note`, 20, 1, 24); color(st.color, `${tag}.steps[${j}]`); });
        break;
      case "CompareSplit":
        for (const side of ["left", "right"]) {
          const sd = p[side]; if (!sd) { E(`${tag}: 缺 ${side}`); continue; }
          icon(sd.icon, `${tag}.${side}`); str(sd.title, `${tag}.${side}.title`, 6, 1, 7); color(sd.color, `${tag}.${side}`);
          if (sd.titleEn !== undefined && String(sd.titleEn).length > 22) W(`${tag}.${side}.titleEn 偏長`);
          if (arr(sd.items, `${tag}.${side}.items`, 2, 4)) sd.items.forEach((x, j) => str(x, `${tag}.${side}.items[${j}]`, 20, 1, 24));
        }
        if (p.footer !== undefined) str(p.footer, `${tag}.footer`, 22, 1, 26);
        break;
      case "BigNumber": {
        if (p.icon !== undefined) icon(p.icon, tag); str(p.label, `${tag}.label`, 16, 1, 18); color(p.color, tag);
        if (typeof p.value !== "number") E(`${tag}.value 必須是數字`);
        const shown = `${p.prefix ?? ""}${Number(p.value ?? 0).toLocaleString("en-US", { minimumFractionDigits: p.decimals ?? 0, maximumFractionDigits: p.decimals ?? 0 })}${p.suffix ?? ""}`;
        if (shown.length > 9) E(`${tag}: 大數字顯示「${shown}」超過 9 字元，會溢出（縮短 prefix/suffix 或改單位）`);
        if (p.bars && (!v2 || !arr(p.bars, `${tag}.bars`, 1, 3))) { if (!v2) E(`${tag}.bars 只在 styleVersion 2 有效`); }
        if (p.ref && (typeof p.ref.label !== "string" || typeof p.ref.text !== "string")) E(`${tag}.ref 需要 {label, text}`);
        if (p.note !== undefined) str(p.note, `${tag}.note`, 40, 1, 50);
        if (p.tag !== undefined && !STATUS.includes(p.tag)) E(`${tag}.tag 不合法`);
        break;
      }
      case "IconGrid": {
        if (p.title !== undefined) str(p.title, `${tag}.title`, 14, 1, 16);
        const cols = p.columns ?? 2; if (![2, 3].includes(cols)) E(`${tag}.columns 只能 2 或 3`);
        if (arr(p.items, `${tag}.items`, 2, 6)) p.items.forEach((it, j) => { icon(it.icon, `${tag}.items[${j}]`); str(it.label, `${tag}.items[${j}].label`, cols === 3 ? 5 : 9, 1, cols === 3 ? 6 : 10); if (it.note !== undefined) str(it.note, `${tag}.items[${j}].note`, cols === 3 ? 14 : 24, 1, cols === 3 ? 16 : 26); color(it.color, `${tag}.items[${j}]`); });
        if (cols === 2 && p.items?.length > 4) W(`${tag}: 2 欄超過 4 格可能超出高度`);
        break;
      }
      case "ImpactCard":
        icon(p.icon, tag); str(p.title, `${tag}.title`, 10, 1, 12); color(p.color, tag);
        if (arr(p.rows, `${tag}.rows`, 2, 4)) p.rows.forEach((r, j) => { if (!STATUS.includes(r.status)) E(`${tag}.rows[${j}].status 不合法（fact/expected/pending）`); str(r.text, `${tag}.rows[${j}].text`, 32, 1, 38); });
        if (p.taiwan !== undefined) str(p.taiwan, `${tag}.taiwan`, 34, 1, 40);
        break;
      case "SeatBar":
        if (arr(p.chambers, `${tag}.chambers`, 1, 2)) p.chambers.forEach((ch, j) => { if (!ch.segments?.length) E(`${tag}.chambers[${j}] 缺 segments`); if (typeof ch.total !== "number" || typeof ch.majority !== "number") E(`${tag}.chambers[${j}] 缺 total/majority`); });
        break;
      case "EndCard":
        if (p.next !== undefined) str(p.next, `${tag}.next`, 24, 1, 28);
        if (p.disclaimer !== undefined) str(p.disclaimer, `${tag}.disclaimer`, 30, 1, 36);
        if (p.recap && arr(p.recap, `${tag}.recap`, 2, 3)) p.recap.forEach((r, j) => { str(r.value, `${tag}.recap[${j}].value`, 7, 1, 8); str(r.label, `${tag}.recap[${j}].label`, 10, 1, 12); color(r.color, `${tag}.recap[${j}]`); });
        break;
    } };
    checkProps(s.component, p, tag);
  });
  if (v2 && scenes.filter((x) => typeof x.pauseAfter === "number" && x.pauseAfter > 0).length > 3) E("pauseAfter 每支最多 3 處");
  if (v2) {
    for (const b of ["hook", "you", "twist", "cta"]) if (!scenes.some((x) => x.beat === b)) E(`敘事骨架缺 ${b} 幕`);
    if (scenes[0]?.component !== "HookTitle") E("v2 第 1 幕要用 HookTitle（第 0 幀就是完整主張）");
    if (/[？?]\s*$/.test(scenes[0]?.narration ?? "")) W("第 1 句以問句結尾：鉤子請用直述句");
    const secs = scenes.map((x) => voicedSeconds(x, true)), tot = secs.reduce((a, b) => a + b, 0);
    const ti = scenes.findIndex((x) => x.beat === "twist");
    if (ti >= 0) { const at = secs.slice(0, ti).reduce((a, b) => a + b, 0) / tot; if (at < 0.4 || at > 0.7) W(`第一個 twist 幕落在 ${(at * 100).toFixed(0)}%（估算），建議 40–70%`); }
    const cta = scenes.filter((x) => x.beat === "cta" && x.component !== "EndCard");
    if (!cta.length) E("v2 片尾卡前要有一幕 cta（具體提問）");
    cta.forEach((x) => { if (!/[？?]/.test(x.narration)) E(`${x.id}: cta 幕要有具體提問（含「？」）`); });
    if (scenes.length < 8 || scenes.length > 15) W(`幕數 ${scenes.length}，v2 建議 9–14`);
    // ── 畫面類別規則（docs/viz-research.md validate 規則 1–4、6、7、9、10） ──
    const cats = scenes.map((x) => CATEGORY_V2[x.component] ?? "card");
    const n = scenes.length, cards = cats.filter((c) => c === "card").length;
    if (cards > Math.floor(n / 3)) E(`規則1：card 類 ${cards} 幕 > 總幕數÷3（${Math.floor(n / 3)}）；改用 chart／kinetic／depth，或用 DepthStage 包卡片`);
    for (let k = 1; k < n; k++) {
      if (cats[k] === "end" || cats[k] !== cats[k - 1]) continue;
      if (k >= 2 && cats[k - 2] === cats[k]) E(`規則2：${scenes[k - 2].id}、${scenes[k - 1].id}、${scenes[k].id} 連續三幕都是 ${cats[k]}`);
      else W(`規則2：${scenes[k - 1].id} → ${scenes[k].id} 相鄰同類別（${cats[k]}）`);
    }
    if (cats[0] === "card") E(`規則3：第一幕不能是 card（${scenes[0].component}）`);
    const estSec = scenes.reduce((a, x) => a + voicedSeconds(x, true), 0);
    const cnt = (c) => cats.filter((x) => x === c).length;
    if (estSec >= 45) {
      if (cnt("chart") < 3) W(`規則4：chart 只有 ${cnt("chart")} 幕（≥45 秒建議 ≥3）`);
      if (cnt("kinetic") < 2) W(`規則4：kinetic 只有 ${cnt("kinetic")} 幕（建議 ≥2）`);
      if (cnt("depth") + cnt("metaphor") < 2) W(`規則4：depth／metaphor 只有 ${cnt("depth") + cnt("metaphor")} 幕（建議 ≥2）`);
    }
    const Lt = layoutV2();
    scenes.forEach((x, k) => {
      const tg = `scene[${k}] ${x.id}`;
      const nums = String(x.narration).match(/\d[\d,.]*/g) ?? [];
      if (cats[k] === "card" && nums.length >= 2 && /比|對|卻|反而|更|多了|少了|vs/i.test(x.narration)) W(`規則6：${tg} 旁白有 ${nums.length} 個數字且是比較語氣，卻用卡片 → 建議改圖表`);
      if (cats[k] === "chart" && !(x.sources ?? []).length) E(`規則7：${tg} 圖表要有 sources`);
      if (cats[k] === "card") { const t = cardText(x.props); if (t > 45) E(`規則9：${tg} 卡片畫面文字 ${t} 字 > 45（不含字幕）`); }
      const mb = mainBox(x, Lt);
      const [x0, y0, x1, y1] = mb.box;
      if (x0 < Lt.X || x1 > Lt.X_RIGHT + 48 || y0 < Lt.SAFE_TOP || y1 > Lt.SAFE_BOTTOM) E(`規則10：${tg} 主視覺外框 [${mb.box}] 超出安全區 x ${Lt.X}–${Lt.X_RIGHT}、y ${Lt.SAFE_TOP}–${Lt.SAFE_BOTTOM}`);
      const loose = ["hook", "cta"].includes(x.beat);
      const minH = loose ? (Lt.SAFE_BOTTOM - Lt.SAFE_TOP) * 0.45 : Lt.MAIN_MIN_H;
      const fw = mb.front ? mb.front[2] - mb.front[0] : x1 - x0, fh = mb.front ? mb.front[3] - mb.front[1] : y1 - y0;
      if (fw < Lt.MAIN_MIN_W || fh < minH) E(`規則10：${tg} 主視覺 ${fw}×${fh} 小於下限 ${Lt.MAIN_MIN_W}×${Math.round(minH)}`);
      if (mb.plot && (mb.plot[2] - mb.plot[0] < Lt.CHART_MIN_W || mb.plot[3] - mb.plot[1] < Lt.CHART_MIN_H * (x.component === "UnitGrid" ? 0.85 : 1))) E(`規則10：${tg} 繪圖區 ${mb.plot[2] - mb.plot[0]}×${mb.plot[3] - mb.plot[1]} 小於 ${Lt.CHART_MIN_W}×${Lt.CHART_MIN_H}`);
    });
  }
  const est = Math.round(total);
  const L = LENGTH[v2 ? 2 : 1];
  if (est < L.hardMin || est > L.hardMax) E(`配音版總長估算 ${est} 秒，應在 ${L.min}–${L.max} 秒`); else if (est < L.min || est > L.max) W(`配音版總長估算 ${est} 秒，建議 ${L.min}–${L.max} 秒`);
  return { errors, warns, est };
}

if (process.argv[1] && import.meta.url.endsWith(path.basename(process.argv[1]))) {
  const slug = process.argv[2];
  if (!slug) { console.error("用法：npm run validate <slug>"); process.exit(2); }
  const p = path.join(ROOT, "videos", slug, "script.json");
  if (!fs.existsSync(p)) { console.error(`找不到 ${p}`); process.exit(2); }
  let script;
  try { script = JSON.parse(fs.readFileSync(p, "utf8")); } catch (e) { console.error(`JSON 解析失敗：${e.message}`); process.exit(1); }
  for (const f of ["research.md"]) if (!fs.existsSync(path.join(ROOT, "videos", slug, f))) console.warn(`⚠ 缺 ${f}`);
  const { errors, warns, est } = validate(script);
  // P1-9：caption.md 第一行放搜尋關鍵詞（≤40 字、含主關鍵詞），hashtag ≤5，要有提問；不用 engagement bait 用語
  const cp = path.join(ROOT, "videos", slug, "caption.md");
  if (script.styleVersion === 2 && fs.existsSync(cp)) {
    const cap = fs.readFileSync(cp, "utf8");
    const first = cap.split("\n").find((l) => l.trim()) ?? "";
    if (/^#|^\*\*|^貼文文案/.test(first.trim())) errors.push("caption.md 第一行要是搜尋關鍵詞句（不要放標題標記或粗體）");
    if (first.length > 40) errors.push(`caption.md 第一行 ${first.length} 字 > 40：「${first}」`);
    const tags = cap.match(/(^|\s)#[^\s#]+/g) ?? [];
    if (tags.length > 5) errors.push(`caption.md hashtag ${tags.length} 個 > 5`);
    if (!/[？?]/.test(cap)) warns.push("caption.md 沒有提問句（建議放一個具體問題）");
    for (const w of ["分享給", "傳給", "標記"]) if (cap.includes(w)) errors.push(`caption.md 不要用「${w}」`);
  }
  errors.push(...lintSource());
  errors.push(...(await (await import("./check-motion.mjs")).checkMotion()).errors);
  if (script.styleVersion === 2) {
    const tp = path.join(ROOT, "videos", slug, "timeline.json");
    const r = validateTimelineV2(script, fs.existsSync(tp) ? JSON.parse(fs.readFileSync(tp, "utf8")) : null);
    errors.push(...r.errors); warns.push(...r.warns);
    if (r.sec && !r.stale) {
      console.log(`ℹ 時間軸 v2 實際總長 ${r.sec.toFixed(1)} 秒（以實際時間軸為準，字數估算只當參考）`);
      for (let k = errors.length - 1; k >= 0; k--) if (errors[k].startsWith("配音版總長估算")) warns.push(errors.splice(k, 1)[0].replace("應在", "（估算）建議"));
    }
  }
  warns.forEach((w) => console.log(`⚠ ${w}`));
  errors.forEach((e) => console.log(`✖ ${e}`));
  console.log(`${errors.length} error(s), ${warns.length} warning(s)，${script.scenes?.length ?? 0} 幕，配音版估 ${est ?? "?"} 秒`);
  process.exit(errors.length ? 1 : 0);
}

// 3D 產品台（script.json 頂層 styleVersion: 3 ＋ stage: "three"；對外稱「v4 產品台」）的檢查。由 scripts/validate.mjs 的 validate() 呼叫。
// 時間軸、配音、字幕沿用 v3 的整篇配音流程；畫面用 @remotion/three，不用紙材。時間軸檢查共用 scripts/ui/validate-ui.mjs 的 validateTimelineUI。
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { resolveProfile, profileIssues, cnTermIssues } from "../voice-profile.mjs";
import { expandModel, expandScript } from "./parts/index.mjs";

const SHAPES = ["slab", "ring", "plane", "box", "cyl", "tube", "sphere", "poly"];
const ROLES = ["lid", "heatFloor", "heatSource", "xray"];
const ACTION_TYPES = ["vibrate", "rotate", "pulse", "flow", "wave", "trace", "sum", "meter", "lpp"]; // lpp＝雷射打錫滴成電漿的循環（tech-euv）
const COLORS = ["amber", "blue", "coral", "mint"];
const THERMAL_FX = ["peek", "cutaway", "heat", "vapor", "spread", "condense", "flowBack"];
/** 產品模型資料（script.json 的 model 或 videos/<slug>/model.json）的檢查；回傳可以標註的點（anchors 的鍵） */
function checkModel(script, E, W) {
  const mp = path.join(path.dirname(new URL(import.meta.url).pathname), "../../videos", String(script.slug), "model.json");
  const m = expandModel(script.model ?? (fs.existsSync(mp) ? JSON.parse(fs.readFileSync(mp, "utf8")) : null)); // 零件與動作庫先展開
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
  // 運作動畫（actions）：type、指到的零件／層／標註點／色票要存在
  const partIds = new Set((m.parts ?? []).map((p) => p.id).filter(Boolean)), acts = m.actions ?? {};
  const ptOk = (pt, d) => Array.isArray(pt) ? (d.layer ? layers.has(d.layer) : false) : pt && layers.has(pt.layer) && Array.isArray(pt.p);
  for (const [k, d] of Object.entries(acts)) {
    const tag = `model.actions「${k}」`;
    if (!ACTION_TYPES.includes(d.type)) { E(`${tag} type「${d.type}」不存在（${ACTION_TYPES.join("／")}）`); continue; }
    if (d.layer && !layers.has(d.layer)) E(`${tag} layer「${d.layer}」不在 layers 裡`);
    if (["vibrate", "rotate", "pulse"].includes(d.type)) { if (!Array.isArray(d.parts) || !d.parts.length) E(`${tag} 要有 parts（作用在哪些零件的 id）`); for (const pid of d.parts ?? []) if (!partIds.has(pid)) E(`${tag} parts「${pid}」不在 model.parts 的 id 裡`); }
    if (d.type === "flow") { if (!Array.isArray(d.path) || d.path.length < 2) E(`${tag} path 至少兩個點`); else d.path.forEach((pt, i) => { if (!ptOk(pt, d)) E(`${tag} path[${i}] 要是 [x, y, z]（加上動作的 layer）或 { layer, p }`); }); }
    if (d.type === "lpp") { if (!ptOk(d.at, d)) E(`${tag} at（焦點）要是 [x, y, z]（加上動作的 layer）或 { layer, p }`); for (const q of ["drop", "beam"]) if (!ptOk(d.lpp?.[q], d)) E(`${tag} lpp.${q} 要是 [x, y, z]（加上動作的 layer）或 { layer, p }`); for (const q of ["pre", "main", "glow"]) if (d.lpp?.[q] && !(m.palette ?? {})[d.lpp[q]] && !/^#/.test(d.lpp[q])) E(`${tag} lpp.${q}「${d.lpp[q]}」不在 palette 裡`); }
    if (d.type === "flow" && d.keep !== undefined) { if (!(d.keep > 0 && d.keep <= 1)) E(`${tag} keep 要在 0–1 之間`); for (const b of d.bounces ?? []) if (!(Number.isInteger(b) && b > 0 && b < (d.path ?? []).length)) E(`${tag} bounces「${b}」不是 path 的點的索引`); }
    if (d.type === "wave" && !ptOk(d.from, d)) E(`${tag} from 要是 [x, y, z]（加上動作的 layer）或 { layer, p }`);
    if ((d.type === "trace" || d.type === "sum") && !d.hidden) for (const q of ["from", "to"]) if (!ptOk(d[q], d)) E(`${tag} ${q} 要是 [x, y, z]（加上動作的 layer）或 { layer, p }；只給儀表用的波形寫 hidden: true`);
    if (d.type === "sum") { if (!Array.isArray(d.of) || d.of.length < 2) E(`${tag} of 要列至少兩道 trace`); for (const t of d.of ?? []) if (acts[t]?.type !== "trace") E(`${tag} of「${t}」不是 trace`); }
    if (d.type === "meter") {
      if (!(m.anchors ?? {})[d.anchor]) E(`${tag} anchor「${d.anchor}」不在 model.anchors 裡`);
      if (d.kind && !["bar", "wave"].includes(d.kind)) E(`${tag} kind「${d.kind}」不存在（bar／wave）`);
      if (d.source && !acts[d.source]) E(`${tag} source「${d.source}」不在 actions 裡`);
      for (const t of d.traces ?? []) if (!["trace", "sum"].includes(acts[t]?.type)) E(`${tag} traces「${t}」不是 trace／sum`);
      if (d.accent && !COLORS.includes(d.accent)) E(`${tag} accent「${d.accent}」不存在（${COLORS.join("／")}）`);
      if (d.label && [...d.label].length > 6) W(`${tag} label「${d.label}」超過 6 字（儀表的標題要短）`);
    } else if (d.color && !(m.palette ?? {})[d.color] && !/^#/.test(d.color)) E(`${tag} color「${d.color}」不在 palette 裡`);
  }
  if ((m.parts ?? []).length > 120) W(`model: 零件 ${m.parts.length} 個（軟體渲染下愈多愈慢，先 node scripts/three/bench-fx.mjs 量時間）`);
  return m;
}

const AT_BASE = ["start", "voice", "end", "exit"];
const OVERLAY_TYPES = ["scope", "stamp", "cross", "circle", "steps", "card", "ribbon", "legend", "compare", "bars", "section"]; // legend／compare＝深色 HUD 片（Hud.tsx）的圖例與左右對照卡

export function validateThree(script, h) {
  const errors = [], warns = [];
  const E = (m) => errors.push(m), W = (m) => warns.push(m);
  for (const k of ["slug", "title", "asOf"]) if (typeof script[k] !== "string" || !script[k]) E(`頂層缺少 ${k}`);
  if (script.asOf && !/^\d{4}\/\d{1,2}\/\d{1,2}$/.test(script.asOf)) E(`asOf 格式應為 YYYY/M/D：${script.asOf}`);
  if (!script.voice || typeof script.voice.voiceName !== "string") E("頂層缺少 voice.voiceName");
  const prof = resolveProfile(script.voice);
  if (!prof) E("沒有 voice.profile：配音前要先定旁白設定檔（docs/voice-profiles.md）");
  else for (const m of profileIssues(prof)) E(m);
  const scenes = Array.isArray(script.scenes) ? expandScript(script, (() => { try { const mp0 = path.join(path.dirname(new URL(import.meta.url).pathname), "../../videos", String(script.slug), "model.json"); return expandModel(script.model ?? (fs.existsSync(mp0) ? JSON.parse(fs.readFileSync(mp0, "utf8")) : null)); } catch { return null; } })()).scenes : [];
  if (!scenes.length) { E("scenes 是空的"); return { errors, warns, est: 0 }; }
  const ids = scenes.map((s) => s.id);
  const model = checkModel(script, E, W);
  const PARTS = Object.keys(model?.anchors ?? {}), LAYERS = (model?.layers ?? []).map((l) => l.id);
  const cuesOf = Object.fromEntries(scenes.map((s) => [s.id, new Set((s.cues ?? []).map((c) => c.id))]));
  let total = 0;
  scenes.forEach((s, i) => {
    const tag = s.id ?? `#${i}`;
    if (!s.id || ids.indexOf(s.id) !== i) E(`${tag}: id 缺少或重複`);
    // 正式片的片尾卡（深色 HUD 片）：最後一幕可以沒有旁白（silent: true ＋ durationSec ＋ props.endCard）；沒寫 silent 的片不受影響
    if (s.silent === true) {
      if (i !== scenes.length - 1) E(`${tag}: silent 只能用在最後一幕（片尾卡）`);
      if (!(s.durationSec > 0)) E(`${tag}: silent 的幕要寫 durationSec`);
      if (!s.props?.endCard) E(`${tag}: silent 的幕要有 props.endCard`);
      if (!script.hud) E(`${tag}: 片尾卡目前只有深色 HUD 片（頂層 hud）有畫`);
      return;
    }
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
    // 運作動畫的觸發：id 要在 model.actions 裡；speed／gain 是倍率
    for (const r of [].concat(s.props?.run ?? [])) {
      if (!model?.actions?.[r.id]) E(`${tag}: props.run 的 id「${r.id}」不在 model.actions 裡（${Object.keys(model?.actions ?? {}).join("／") || "model 沒有 actions"}）`);
      if (!r.at) E(`${tag}: props.run「${r.id}」要有 at（由哪個 cue 觸發）`);
      for (const k of ["speed", "gain", "ramp"]) if (r[k] !== undefined && !(typeof r[k] === "number" && r[k] >= 0)) E(`${tag}: props.run「${r.id}」的 ${k} 要是 ≥0 的數字`);
    }
    for (const c of [].concat(s.props?.shot ?? [])) { if (!c.at) E(`${tag}: props.shot 要有 at`); for (const k of ["d", "elev", "y", "x", "yaw", "dur"]) if (c[k] !== undefined && typeof c[k] !== "number") E(`${tag}: props.shot.${k} 要是數字`); }
    for (const c of [].concat(s.props?.shift ?? [])) { if (!c.at) E(`${tag}: props.shift 要有 at`); if (c.opacity !== undefined && !(c.opacity >= 0 && c.opacity <= 1)) E(`${tag}: props.shift.opacity 要在 0–1`); }
    // 深色 HUD＋Powers of Ten 縮放（頂層 hud；src/components/three/Hud.tsx）：沒寫 hud 的片不檢查這兩項
    const HUD_LV = (script.hud?.levels ?? []).map((l) => l.id);
    for (const z of [].concat(s.props?.zoom ?? [])) { if (!script.hud) E(`${tag}: props.zoom 要配頂層 hud.levels`); else if (!HUD_LV.includes(z.to)) E(`${tag}: props.zoom 的 to「${z.to}」不在 hud.levels 裡（${HUD_LV.join("／")}）`); if (!z.at) E(`${tag}: props.zoom 要有 at`); }
    for (const c of [].concat(s.props?.measure ?? [])) { if (!c.at) E(`${tag}: props.measure 要有 at`); for (const k of ["from", "to"]) if (!PARTS.includes(c[k])) E(`${tag}: props.measure.${k}「${c[k]}」不在 model.anchors 裡`); if (!c.text) E(`${tag}: props.measure 要有 text`); }
    // 2D 疊層（props.overlay；src/components/three/Overlays.tsx）
    for (const o of [].concat(s.props?.overlay ?? [])) {
      if (!OVERLAY_TYPES.includes(o.type)) E(`${tag}: props.overlay 的 type「${o.type}」不存在（${OVERLAY_TYPES.join("／")}）`);
      if (!o.at) E(`${tag}: props.overlay「${o.type}」要有 at`);
      if (["stamp", "cross", "circle"].includes(o.type) && !o.part && !(typeof o.x === "number" && typeof o.y === "number")) E(`${tag}: props.overlay「${o.type}」要有 part（標註點）或 x、y（畫面像素）`);
      if (["scope", "steps", "card"].includes(o.type) && typeof o.y !== "number") E(`${tag}: props.overlay「${o.type}」要有 y（上緣的畫面像素）`);
      if (o.type === "stamp" && !o.text) E(`${tag}: props.overlay 的 stamp 要有 text`);
    }
    if ((s.props?.labels ?? []).length > 2) W(`${tag}: 一幕新增的標籤建議 ≤2 個`);
    if ((s.sources ?? []).length) { const px = h.emWidth(`來源：${s.sources.join("、")}`) * 24; if (px > 900) E(`${tag}: 出處太長（約 ${Math.round(px)}px > 900）`); }
  });
  if (!scenes[0].props?.hook?.title) E("第一幕要有 props.hook.title（第 0 幀就看得到的主張）");
  if (!scenes.some((s) => s.props?.explode)) W("沒有 explode（產品台的主動作是沿一個軸一層層分開）");
  if (script.hudSkin !== undefined) { const sk = Object.keys(JSON.parse(fs.readFileSync(path.join(path.dirname(new URL(import.meta.url).pathname), "../../src/theme-hud-skins.json"), "utf8"))).filter((k) => !k.startsWith("_")); if (!sk.includes(String(script.hudSkin))) E(`hudSkin「${script.hudSkin}」不存在（${sk.join("／")}；src/theme-hud-skins.json）`); }
  // 深色 HUD 片的版面檢查（2026/11/15 使用者回饋：LOGO 固定左上、下方空白、換幕字壓字、標籤與蓋章壓模型、小字）：
  // 跑 scripts/three/layout-check.mjs（和畫面同一份的版面計算，逐幀），它的 error 算這裡的 error。沒有 timeline.json 時略過。
  if (script.hud) {
    // 念稿替身字表（2026/11/24 Andy 聽到光罩-2「上集」念成「喪集」、「光罩」念成「光掃」）：tts 出現原字就是 error；表在 scripts/three/tts-subst.json
    try {
      const ST = JSON.parse(fs.readFileSync(path.join(path.dirname(new URL(import.meta.url).pathname), "tts-subst.json"), "utf8"));
      const SE = ST.exempt?.[script.slug] ? W : E;
      for (const s of scenes) { const t = s.tts ?? s.narration ?? ""; for (const x of ST.subst) if (t.includes(x.from)) SE(`${s.id}: 念稿（tts）有「${x.from}」，要寫成「${x.to}」（${x.why}；scripts/three/tts-subst.json）${ST.exempt?.[script.slug] ? `［豁免：${ST.exempt[script.slug]}］` : ""}`); }
    } catch (e) { W(`替身字表讀不到：${e.message}`); }
    if (script.hud.layout !== "fill") W("hud.layout 不是 \"fill\"：頁首 LOGO 小、下方空白沒填滿（docs/channels/tech-daily-playbook.md 第九節）");
    // 11/15 之前做好的舊片（沒寫 layout: "fill"）只出 warning，不擋；新片一律照新規則
    const HE = script.hud.layout === "fill" ? E : W;
    if (!((script.hud.smallPx ?? 0) >= 30)) HE(`hud.smallPx 要 ≥30（目前 ${script.hud.smallPx ?? "沒寫"}）`);
    const r = spawnSync("node", [path.join(path.dirname(new URL(import.meta.url).pathname), "layout-check.mjs"), String(script.slug), "--json"], { encoding: "utf8" });
    try {
      const res = JSON.parse(String(r.stdout).trim().split("\n").pop());
      const fr = (x) => (x ? `（第 ${x[0]}–${x[1]} 幀）` : "");
      for (const i of res.issues ?? []) (i.level === "error" ? HE : W)(`版面［${i.kind}］${i.msg}${fr(i.frames)}`);
    } catch { W(`版面檢查沒跑成功（node scripts/three/layout-check.mjs ${script.slug}）：${String(r.stderr).slice(0, 300)}`); }
    // 2D 示意卡（疊層）的字與圖重疊（2026/11/20 使用者看量測檢測：「這邊會出現這樣覆蓋問題 修復並避免後續發生」）：
    // 跑 scripts/three/card-overlap.mjs（react-dom/server 輸出靜態 HTML＋Playwright 量實際字框，不開 3D），它的 error 算這裡的 error
    const r2 = spawnSync("node", [path.join(path.dirname(new URL(import.meta.url).pathname), "card-overlap.mjs"), String(script.slug), "--json"], { encoding: "utf8", maxBuffer: 64 << 20 });
    try {
      const res = JSON.parse(String(r2.stdout).trim().split("\n").pop());
      // asOf 在 2026/11/20 之前的舊片（這條規則之前就做好、已交件）只出 warning，不擋重驗；之後的片一律算 error
      const ymd = String(script.asOf ?? "").split(/[\/-]/).map(Number), old = ymd.length === 3 && ymd[0] * 10000 + ymd[1] * 100 + ymd[2] < 20261120, CE = old ? W : HE;
      // 11/22 新加的「字壓色條／字貼圖形」：asOf 2026/11/23 起的新片才擋；之前的片先列 warning（已排程的片由人照清單逐支修）
      const ymdN = ymd.length === 3 ? ymd[0] * 10000 + ymd[1] * 100 + ymd[2] : 0, NEW = new Set(["字壓色條", "字貼圖形"]);
      for (const i of res.issues ?? []) (i.level === "error" && !(NEW.has(i.kind) && ymdN < 20261123) ? CE : W)(`示意卡［${i.kind}］疊層 #${i.overlay} ${i.ovKind ?? i.type}${i.title ? `「${i.title}」` : ""}：${i.msg}（第 ${i.frames.join("、")} 幀）`);
    } catch { W(`示意卡重疊檢查沒跑成功（node scripts/three/card-overlap.mjs ${script.slug}）：${String(r2.stderr).slice(0, 300)}`); }
  }
  // 關節鏈（機械手臂等；2026/11/17 Andy：「旋轉部分沒做好」）：有 model.kin 或舊式關節鏈（rotate 寫 chain／3D pivot）就跑 scripts/three/kinematics-check.mjs，
  // 逐幀檢查脫節、夾爪沒夾住、穿模、關節上下限；它的 error 算這裡的 error
  if (model && (model.kin || Object.values(model.actions ?? {}).some((d) => d.type === "rotate" && (d.chain || (d.pivot && d.pivot.length > 2))))) {
    const r = spawnSync("node", [path.join(path.dirname(new URL(import.meta.url).pathname), "kinematics-check.mjs"), String(script.slug), "--json"], { encoding: "utf8" });
    try {
      const res = JSON.parse(String(r.stdout).trim().split("\n").pop());
      const fr = (x) => (x ? `（第 ${x[0]}–${x[1]} 幀）` : "");
      for (const i of res.issues ?? []) (i.level === "error" ? E : W)(`關節鏈［${i.kind}］${i.msg}${fr(i.frames)}`);
    } catch { E(`關節鏈檢查沒跑成功（node scripts/three/kinematics-check.mjs ${script.slug}）：${String(r.stderr).slice(0, 300)}`); }
  }
  // flow（光點流動）：每個光點可能出現的位置都要貼著零件、不准在路徑末端累積（scripts/three/flow-check.mjs；2026/11/18 tech-server 光點懸在機櫃下方半空）。
  // 暫時算警告（W）：其他科技片還在排程中，等各片修完把 W 改成 E（FLOW_STRICT=1 可先當 error 用）
  if (model && Object.values(model.actions ?? {}).some((d) => d.type === "flow")) {
    const r = spawnSync("node", [path.join(path.dirname(new URL(import.meta.url).pathname), "flow-check.mjs"), String(script.slug), "--json"], { encoding: "utf8" });
    try {
      const res = JSON.parse(String(r.stdout).trim().split("\n").slice(-1000).join("\n"))[0];
      for (const e of res?.detail ?? []) (process.env.FLOW_STRICT ? E : W)(`光點［flow-check］${e}`);
    } catch { W(`光點檢查沒跑成功（node scripts/three/flow-check.mjs ${script.slug}）：${String(r.stderr).slice(0, 200)}`); }
  }
  const est = Math.round(scenes.reduce((a, s) => a + (s.silent === true ? Number(s.durationSec) || 0 : h.voicedSeconds(s, true)), 0));
  if (script.sample !== false && (est < 9 || est > 20)) W(`估算 ${est} 秒（旁白 ${total} 字）：風格試片建議 10–15 秒`);
  return { errors, warns, est };
}

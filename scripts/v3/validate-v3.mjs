// styleVersion 3（桌面紙拼貼）的 script.json 檢查。由 scripts/validate.mjs 的 validate() 呼叫（helpers 由它傳入，避免循環 import）。
// 不套 v2 的元件類別規則；保留：字數、字幕短語寬度、出處寬度、同屏 ≤3 主要元素、畫面字 ≤10 字、禁「App」字樣、cue／ref／until／紙材是否存在。
import fs from "node:fs";
import path from "node:path";
import { resolveProfile, profileIssues, cnTermIssues, PRESET_NAMES } from "../voice-profile.mjs";

const LAYERS = ["desk", "mat", "near", "screen", "top"];
const TYPES = ["img", "strip", "phone", "path", "pass", "num", "stack", "bars", "line"];
const FROM = ["paste", "slam", "cut", "wipe", "left", "right", "top", "bottom"];
const TO = ["lift", "cut", "left", "right", "top", "bottom"];
const SCREENS = ["error", "error-big", "grid", "chat", "comment", "blank"];
const AT_BASE = ["start", "voice", "end", "exit"];
/** 不算「主要元素」的紙材：虛線、膠帶、筆觸、蓋場用的大色紙 */
const MINOR = /^(dash|tape|mark|underline|circle|cross|dot|sheet-|seg-|node-|rule|pin-|arrowhead-|arrow-)/;
const plain = (t) => String(t ?? "").replace(/[[\]{}]/g, "");

export function validateV3(script, h, ROOT) {
  const errors = [], warns = [];
  const E = (m) => errors.push(m), W = (m) => warns.push(m);
  for (const k of ["slug", "title", "asOf"]) if (typeof script[k] !== "string" || !script[k]) E(`頂層缺少 ${k}`);
  if (script.asOf && !/^\d{4}\/\d{1,2}\/\d{1,2}$/.test(script.asOf)) E(`asOf 格式應為 YYYY/M/D：${script.asOf}`);
  if (!script.voice || typeof script.voice.voiceName !== "string") E("頂層缺少 voice.voiceName（Gemini 音色名）");
  const scenes = Array.isArray(script.scenes) ? script.scenes : [];
  if (!scenes.length) { E("scenes 是空的"); return { errors, warns, est: 0 }; }
  const mp = path.join(ROOT, "public", "v3", script.slug ?? "", "meta.json");
  const meta = fs.existsSync(mp) ? JSON.parse(fs.readFileSync(mp, "utf8")) : null;
  if (!meta) W(`沒有 public/v3/${script.slug}/meta.json（先 python3 scripts/make-paper.py ${script.slug}），略過紙材名稱檢查`);
  const hasAsset = (a, tag) => { if (meta && a && !meta[a]) E(`${tag}: 紙材「${a}」不存在（public/v3/${script.slug}/）`); };
  // 旁白設定檔（docs/voice-profiles.md）：有配音的 v3 片要先定 voice.profile；舊片沒有只警告、不擋
  const hasVoice = scenes.some((x) => !x.silent && (x.tts ?? x.narration));
  const prof = resolveProfile(script.voice);
  if (hasVoice && !prof) W(`沒有 voice.profile：配音前先定旁白設定檔（預設檔 ${PRESET_NAMES.join("／")}，或整份自己寫；見 docs/voice-profiles.md）。舊片照舊用 voice.style`);
  if (prof) for (const m of profileIssues(prof)) E(m);
  for (const [i, x] of scenes.entries()) for (const [k, t] of [["念稿", x.tts ?? x.narration], ["字幕", x.subtitle?.zh]]) for (const m of cnTermIssues(t)) W(`第 ${i + 1} 幕 (${x.id ?? "?"}): ${k}有${m}`);
  // 外觀與頻道（頂層 skin／channel，都可省略）
  const skins = JSON.parse(fs.readFileSync(path.join(ROOT, "src", "theme-v3-skins.json"), "utf8"));
  const skin = script.skin ?? "desk";
  if (!skins[skin]) E(`skin「${skin}」不存在（${Object.keys(skins).join("／")}）`);
  if (meta && (meta._info?.skin ?? "desk") !== skin) E(`public/v3/${script.slug}/ 的紙材是用 skin「${meta._info?.skin ?? "desk"}」產生的，但 script.json 寫的是「${skin}」→ 重跑 python3 scripts/make-paper.py ${script.slug}`);
  if (script.channel !== undefined) {
    const c = script.channel;
    if (!c || typeof c !== "object" || Array.isArray(c)) E("channel 應為 { name, tag, slogan }");
    else {
      for (const k of Object.keys(c)) if (!["name", "tag", "slogan"].includes(k)) E(`channel.${k} 不認得（只有 name／tag／slogan）`);
      for (const [k, max] of [["name", 8], ["tag", 8], ["slogan", 12]]) if (c[k] !== undefined) { if (typeof c[k] !== "string" || !c[k]) E(`channel.${k} 要是非空字串`); else if (h.emWidth(c[k]) > max) W(`channel.${k}「${c[k]}」偏長（建議 ≤${max} 個全形字，頁首／片尾卡才放得下）`); }
    }
  }
  /** 通用紙片（num／stack／bars／line）的 props 與用到的紙材 */
  const piece = (it, tag) => {
    const type = it.type ?? "img";
    if (type === "num") { if (typeof it.value !== "number") E(`${tag}: num 要有 value（數字）`); hasAsset(it.paper ?? "card-white", tag); for (const t of it.tape ?? []) hasAsset(t.asset ?? "tape-y", tag); if (it.unit !== undefined) noApp(it.unit, tag); }
    if (type === "stack") {
      if (!Array.isArray(it.layers) || !it.layers.length) return E(`${tag}: stack 要有 layers（由下到上）`);
      for (const l of it.layers) for (const c of l.row ?? [l]) { hasAsset(c.asset ?? "block-blue", tag); if (c.t !== undefined) { noApp(c.t, tag); if (h.len(c.t) > 10) W(`${tag}: stack 的字「${c.t}」> 10 字`); } }
    }
    if (type === "bars") {
      if (!Array.isArray(it.bars) || !it.bars.length || it.bars.some((b) => typeof b.v !== "number")) return E(`${tag}: bars 要有 bars: [{ v（數字）, label }]`);
      if (it.bars.length > 6) W(`${tag}: bars 有 ${it.bars.length} 條 > 6（手機上看不清）`);
      if (it.dir !== undefined && !["up", "right"].includes(it.dir)) E(`${tag}: bars 的 dir 只能是 up／right`);
      for (const b of it.bars) hasAsset(`${(it.dir ?? "up") === "up" ? "barv" : "bar"}-${b.color ?? "blue"}`, tag);
      hasAsset("rule", tag);
    }
    if (type === "line") {
      if (!Array.isArray(it.vals) || it.vals.length < 2 || it.vals.some((v) => typeof v !== "number")) return E(`${tag}: line 要有 vals（至少 2 個數字）`);
      if (it.labels !== undefined && it.labels.length !== it.vals.length) E(`${tag}: line 的 labels 要和 vals 一樣長（不標的寫空字串）`);
      for (const m of it.marks ?? []) if (typeof m.i !== "number" || m.i < 0 || m.i >= it.vals.length) E(`${tag}: line 的 marks.i 超出範圍`);
      hasAsset(`seg-${it.color ?? "red"}`, tag); hasAsset("rule", tag);
    }
    if (type === "path" && it.head) hasAsset(typeof it.head === "string" ? it.head : "arrowhead-y", tag);
    if (type === "img") for (const t of it.tape ?? []) hasAsset(t.asset ?? "tape-y", tag);
    if (type === "phone" && meta && !meta.phone) E(`${tag}: 沒有 phone 紙材`);
    if (type === "pass" && meta && !meta.pass) E(`${tag}: 出餐口（pass）是 what-is-server 專用的紙材，這支片沒有`);
  };
  const noApp = (t, tag) => { if (/(^|[^A-Za-z])apps?([^A-Za-z]|$)/i.test(String(t ?? ""))) E(`${tag}: 出現「App」字樣（使用者要求旁白與畫面不出現 App，改中文說法）：「${t}」`); };
  // 封面：cover＝{ camera, items }（和 PaperScene 同一套寫法；只有第 0 幀，不寫 at）
  const cv = script.cover;
  if (!cv || !Array.isArray(cv.items) || !cv.items.length) E("頂層缺少 cover.items（v3 封面：和 PaperScene 一樣的紙片清單）");
  else cv.items.forEach((it, k) => {
    const type = it.type ?? "img", tag = `cover.items[${k}]`;
    if (!TYPES.includes(type)) E(`${tag}: type「${type}」不存在`);
    if (it.at !== undefined || it.ref !== undefined) E(`${tag}: 封面的紙片不寫 at／ref`);
    if (type === "img") hasAsset(it.asset, tag);
    if (type === "strip") { hasAsset(it.paper ?? it.asset ?? "strip-white", tag); for (const t of it.tape ?? []) hasAsset(t.asset ?? "tape-y", tag); }
    if (it.state?.screen !== undefined && !SCREENS.includes(it.state.screen)) E(`${tag}: 手機畫面「${it.state.screen}」不存在`);
    piece(it, tag);
    for (const l of it.lines ?? []) { noApp(l.t, tag); if (h.len(plain(l.t)) > 14) E(`${tag}: 畫面字「${plain(l.t)}」> 14 字`); }
  });
  const ids = new Set(), sceneIds = scenes.map((s) => s.id);
  const live = []; // { id, group, minor, from(index), until(index|Infinity) }
  let punches = 0, mat = false;
  if (scenes[scenes.length - 1].component !== "EndCard") E("最後一幕必須是 EndCard（片尾卡）");
  scenes.forEach((s, i) => {
    const tag = s.id ?? `#${i}`;
    if (!s.id || sceneIds.indexOf(s.id) !== i) E(`${tag}: id 缺少或重複`);
    const end = s.component === "EndCard";
    if (!end && s.component !== "PaperScene") E(`${tag}: styleVersion 3 的 component 只能是 PaperScene 或 EndCard：${s.component}`);
    if (end && i !== scenes.length - 1) E(`${tag}: EndCard 只能是最後一幕`);
    for (const t of [s.narration, s.tts, s.subtitle?.zh, s.subtitle?.en]) noApp(t, tag);
    if (!end) {
      const n = h.len(s.narration);
      if (n < 4) E(`${tag}: 旁白太短（${n} 字）`); else if (n > 26) W(`${tag}: 旁白 ${n} 字 > 26（一鏡 2–4 秒，建議拆鏡）`);
      if (!s.subtitle?.zh || !s.subtitle?.en) E(`${tag}: 缺字幕（subtitle.zh／en）`);
      else h.splitPhrases(s.subtitle.zh, s.keywords ?? [], h.SUB_MAX_EM_V2).forEach((l, li) => { const w = h.emWidth(h.phraseDisplay(l)); if (w > h.SUB_MAX_EM_V2) E(`${tag}: 字幕短語 ${li + 1}「${l}」寬 ${w.toFixed(1)}em > ${h.SUB_MAX_EM_V2}（72px 字幕紙條放不下）→ 用 \\n 指定斷點或精簡`); });
      for (const k of s.keywords ?? []) if (!String(s.subtitle?.zh ?? "").replace(/\n/g, "").includes(k)) W(`${tag}: 關鍵詞「${k}」不在字幕裡（不會有麥克筆底）`);
      for (const c of s.cues ?? []) if (!h.clean(s.narration).includes(h.clean(c.text))) E(`${tag}: cue「${c.id}」的詞「${c.text}」不在旁白裡`);
      if (s.pauseAfter !== undefined && (typeof s.pauseAfter !== "number" || s.pauseAfter < 0 || s.pauseAfter > 0.7)) E(`${tag}: pauseAfter 應為 0–0.7 秒`);
    }
    if ((s.sources ?? []).length) { const j = s.sources.join("、"), t = /^(資料)?來源/.test(j) ? j : `來源：${j}`; const px = h.emWidth(t) * 24 + 44; if (px > 670) E(`${tag}: 出處「${t}」約 ${Math.round(px)}px > 670px（出處紙條放不下）→ 縮短`); }
    const p = s.props ?? {};
    if (end) { if (meta && !meta["sheet-cream"]) E(`${tag}: 片尾卡需要紙材 sheet-cream`); for (const k of ["slogan", "next"]) if (p[k] !== undefined) { noApp(p[k], tag); if (h.len(p[k]) > 14) W(`${tag}: 片尾卡 ${k} ${h.len(p[k])} 字偏長`); } return; }
    const cueIds = new Set((s.cues ?? []).map((c) => c.id));
    const at = (a, what) => {
      if (a === undefined) return;
      const m = /^([^\s+]+?)([+-]\d+)?$/.exec(String(a));
      if (!m) return E(`${tag}: ${what} 的 at「${a}」格式不對（cueId、start、voice、end、exit，可加 +N／-N 幀）`);
      if (!AT_BASE.includes(m[1]) && !cueIds.has(m[1])) E(`${tag}: ${what} 的 at「${a}」找不到 cue「${m[1]}」（本幕 cues：${[...cueIds].join("、") || "無"}）`);
      if (m[2] && Math.abs(Number(m[2])) > 45) W(`${tag}: ${what} 的 at「${a}」離觸發詞超過 45 幀（時間要跟著配音，不要用大的固定位移）`);
    };
    if (s.still !== undefined) at(s.still, "still");
    const cams = p.camera ? (Array.isArray(p.camera) ? p.camera : [p.camera]) : [];
    if (i === 0 && !cams.length) E(`${tag}: 第一幕要有 camera（鏡頭起點）`);
    for (const c of cams) { if (!Array.isArray(c.to) || c.to.length !== 3 || c.to.some((v) => typeof v !== "number")) E(`${tag}: camera.to 應為 [cx, cy, scale]`); else if (c.to[2] < 0.3 || c.to[2] > 1.3) W(`${tag}: camera 縮放 ${c.to[2]} 超出 0.3–1.3（紙材會糊或太小）`); at(c.at, "camera"); }
    if (p.punch !== undefined) { punches++; at(p.punch, "punch"); }
    if (p.mat !== undefined) { const on = typeof p.mat === "boolean" ? p.mat : p.mat.on; if (on === mat) W(`${tag}: mat 已經是 ${mat ? "蓋上" : "掀開"} 的狀態`); mat = on; if (typeof p.mat === "object") at(p.mat.at, "mat"); }
    for (const [k, it] of (p.items ?? []).entries()) {
      const what = `items[${k}]${it.id ? `（${it.id}）` : it.ref ? `（→${it.ref}）` : ""}`;
      at(it.at, what);
      for (const mv of it.moves ?? []) at(mv.at, `${what}.moves`);
      for (const st of it.set ?? []) at(st.at, `${what}.set`);
      const scr = [it.state?.screen, ...(it.set ?? []).map((x) => x.screen)].filter((x) => x !== undefined);
      for (const x of scr) if (!SCREENS.includes(x)) E(`${tag}: ${what} 手機畫面「${x}」不存在（${SCREENS.join("／")}）`);
      for (const t of [it.state?.title, it.state?.placeholder, ...(it.set ?? []).flatMap((x) => [x.title, x.placeholder])]) noApp(t, tag);
      if (it.ref) {
        if (!ids.has(it.ref)) E(`${tag}: ${what} ref「${it.ref}」還沒宣告（要先在前面的幕用 id 宣告，且還在場上）`);
        if (it.exit) { const l = live.find((x) => x.id === it.ref); if (l) l.until = i + 0.5; }
        continue;
      }
      const type = it.type ?? "img";
      if (!TYPES.includes(type)) E(`${tag}: ${what} type「${type}」不存在（${TYPES.join("／")}）`);
      if (it.layer !== undefined && !LAYERS.includes(it.layer)) E(`${tag}: ${what} layer「${it.layer}」不存在（${LAYERS.join("／")}）`);
      if (it.from !== undefined && !FROM.includes(it.from)) E(`${tag}: ${what} from「${it.from}」不存在（${FROM.join("／")}）`);
      if (typeof it.to === "string" && !TO.includes(it.to)) E(`${tag}: ${what} to「${it.to}」不存在（${TO.join("／")}）`);
      if (type === "img") { if (!it.asset) E(`${tag}: ${what} 缺 asset`); hasAsset(it.asset, tag); }
      if (type === "strip") { hasAsset(it.paper ?? it.asset ?? "strip-white", tag); for (const t of it.tape ?? []) hasAsset(t.asset ?? "tape-y", tag); if (!Array.isArray(it.lines) || !it.lines.length) W(`${tag}: ${what} 沒有 lines（空白紙條）`); }
      if (type === "path" && (!Array.isArray(it.pts) || it.pts.length < 2)) E(`${tag}: ${what} path 要有 pts（至少兩點）`);
      piece(it, `${tag}: ${what}`);
      if (type !== "path" && (typeof it.x !== "number" || typeof it.y !== "number")) E(`${tag}: ${what} 缺 x／y（紙本體中心）`);
      for (const l of it.lines ?? []) { noApp(l.t, tag); const n = h.len(plain(l.t)); if (n > 14) E(`${tag}: ${what} 畫面字「${plain(l.t)}」${n} 字 > 14`); else if (n > 10) W(`${tag}: ${what} 畫面字「${plain(l.t)}」${n} 字 > 10`); }
      if (it.id) { if (ids.has(it.id)) E(`${tag}: id「${it.id}」重複`); ids.add(it.id); }
      let until = i + 0.9;
      if (it.until === "end") until = Infinity;
      else if (it.until !== undefined) { const [sid, cue] = String(it.until).split("."); const k2 = sceneIds.indexOf(sid); if (k2 < 0) E(`${tag}: ${what} until 指到不存在的幕「${sid}」`); else { if (k2 < i) E(`${tag}: ${what} until「${it.until}」在本幕之前`); until = k2 - 0.1 + (cue ? 0.5 : 0); } }
      const name = type === "img" ? it.asset : type === "strip" ? `strip:${it.id ?? k}:${tag}` : ["num", "stack", "bars", "line"].includes(type) ? `${type}:${it.id ?? k}:${tag}` : type;
      live.push({ id: it.id, group: type === "phone" ? "phone" : name, minor: type === "path" || (type === "img" && MINOR.test(it.asset ?? "")), from: i, until });
    }
    // 同屏主要元素：這一幕期間在場上的紙片（同一種紙材重複排列算一樣；虛線、膠帶、筆觸、蓋場色紙不算）。鏡頭外的也會被算進來，所以只警告
    const groups = [...new Set(live.filter((x) => !x.minor && x.from <= i && x.until > i + 0.2).map((x) => x.group))];
    if (groups.length > 4) W(`${tag}: 場上同時有 ${groups.length} 樣主要元素（${groups.map((g) => g.replace(/^strip:.*/, "紙條").replace(/^(num|stack|bars|line):.*/, "$1")).join("、")}）；同屏 ≤3 樣，請確認鏡頭外的不算、或讓前面的先退場（until）`);
  });
  if (punches > 4) W(`punch（重點推近）用了 ${punches} 次 > 4`);
  const est = Math.round(scenes.reduce((a, s) => a + (s.component === "EndCard" ? s.durationSec ?? 2.5 : h.voicedSeconds(s, true)), 0));
  const L = h.LENGTH[2];
  if (est < L.hardMin || est > L.hardMax) E(`配音版總長估算 ${est} 秒，應在 ${L.min}–${L.max} 秒`); else if (est < L.min || est > L.max) W(`配音版總長估算 ${est} 秒，建議 ${L.min}–${L.max} 秒`);
  return { errors, warns, est };
}

/** v3 的時間軸檢查（沿用時間軸 v2 的格式）：存在、沒過期、每個 cue 都對到幀、紙片的 at 落在本幕附近。一鏡 2–4 秒是正常的，不套 v2 的幕長下限 */
export function validateTimelineV3(script, tl) {
  const errors = [], warns = [];
  if (!tl) { warns.push("styleVersion 3 尚無 timeline.json（先配音再 npm run align）"); return { errors, warns }; }
  if (tl.version !== 2) { errors.push("timeline.json 不是 version 2（v3 沿用時間軸 v2 的格式），請重跑 npm run align"); return { errors, warns }; }
  if (tl.scenes.map((x) => x.id).join() !== script.scenes.map((x) => x.id).join()) { errors.push("timeline.json 已過期（幕序與 script.json 不同）：重跑 tts／align"); return { errors, warns, stale: true }; }
  tl.scenes.forEach((t, i) => {
    for (const c of t.cues ?? []) if (c.frame === null || c.frame === undefined) errors.push(`timeline ${t.id}: cue「${c.id}」（${c.text}）沒對到時間`);
    const n = tl.scenes[i + 1];
    const d = ((n ? n.startFrame : t.startFrame + t.durationFrames) - t.startFrame) / tl.fps;
    if (d < 1.2 && !t.silent) warns.push(`timeline ${t.id}: 這一鏡只有 ${d.toFixed(1)} 秒，畫面動作要簡單（只放一個動作）`);
    if (d > 5) warns.push(`timeline ${t.id}: 這一鏡 ${d.toFixed(1)} 秒 > 5，中間要有第二個變化（cue）`);
  });
  return { errors, warns, sec: tl.totalSec };
}

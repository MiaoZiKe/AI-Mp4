// npm run validate <slug>：檢查 script.json 結構、字數、元件 props、總長估算（配音版）
import fs from "node:fs";
import path from "node:path";
const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");

export const ICONS = ["capitol","ballot","scale","chip","container","globe","money","chart","shield","island","question","gavel","users",
  "house","baby","heart","clock","wallet","briefcase","bitcoin","building","bank","cycle","vault","warning","rocket","bulb","brain","bolt","flag","handshake","graduation","calendar","lock","trendUp","trendDown","percent","ring","document","server","robot","cloud","atom","medical","stroller","coins","megaphone","key"];
const COLORS = ["cyan","pink","yellow","purple"];
const STATUS = ["fact","expected","pending"];
const COMPONENTS = ["TermCard","FlowRow","CompareSplit","BigNumber","SeatBar","IconGrid","ImpactCard","EndCard"];
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
/** 配音版每幕秒數估算：每秒約 4.3 字 + 0.9 秒間隔 */
export const voicedSeconds = (s) => s.component === "EndCard" ? 4.5 : len(s.tts ?? s.narration) / 4.3 + 0.9;

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
  const c = script.cover;
  if (!c) E("頂層缺少 cover");
  else {
    if (arr(c.title, "cover.title", 1, 2)) c.title.forEach((t, i) => str(t, `cover.title[${i}]`, 7, 2, 8));
    str(c.sub ?? "", "cover.sub", 16, 0, 20);
    if (c.en !== undefined && String(c.en).length > 60) W("cover.en 偏長");
    if (c.icons && arr(c.icons, "cover.icons", 1, 3)) c.icons.forEach((ic, i) => { icon(ic.name, `cover.icons[${i}]`); color(ic.color, `cover.icons[${i}]`); });
    if (c.tiles && arr(c.tiles, "cover.tiles", 2, 4)) c.tiles.forEach((t, i) => { icon(t.icon, `cover.tiles[${i}]`); str(t.label, `cover.tiles[${i}].label`, 4, 1, 5); color(t.color, `cover.tiles[${i}]`); });
    if (c.tags && arr(c.tags, "cover.tags", 1, 2)) c.tags.forEach((t, i) => { if (!STATUS.includes(t.status)) E(`cover.tags[${i}].status 不合法`); str(t.text, `cover.tags[${i}].text`, 14, 1, 16); });
  }
  if (!Array.isArray(script.scenes) || !script.scenes.length) { E("scenes 必須是非空陣列"); return { errors, warns }; }
  const scenes = script.scenes;
  if (scenes.length < 11 || scenes.length > 18) W(`幕數 ${scenes.length}，建議 12–16（含片尾）`);
  const ids = new Set();
  let total = 0;
  scenes.forEach((s, i) => {
    const tag = `scene[${i}] ${s.id ?? "?"}`;
    if (typeof s.id !== "string" || !/^[a-z0-9-]+$/.test(s.id)) E(`${tag}: id 必須是 kebab-case`);
    if (ids.has(s.id)) E(`${tag}: id 重複`); ids.add(s.id);
    if (!COMPONENTS.includes(s.component)) E(`${tag}: 未知元件 ${s.component}`);
    const isEnd = s.component === "EndCard";
    if (typeof s.narration !== "string") E(`${tag}: 缺 narration`);
    else { const n = len(s.narration); if (!isEnd) { if (n < 8 || n > 32) E(`${tag}: 旁白 ${n} 字（應 15–25）：${s.narration}`); else if (n < 13 || n > 26) W(`${tag}: 旁白 ${n} 字（建議 15–25）：${s.narration}`); } }
    if (s.tts !== undefined && typeof s.tts !== "string") E(`${tag}: tts 必須是字串`);
    if (!s.subtitle || typeof s.subtitle.zh !== "string" || typeof s.subtitle.en !== "string") E(`${tag}: subtitle 需有 zh/en`);
    else {
      const lines = splitLines(s.subtitle.zh);
      if (lines.length > 2) E(`${tag}: 中文字幕超過 2 行`);
      lines.forEach((l, li) => { const n = len(l), w = emWidth(l); if (n > 14) E(`${tag}: 字幕第 ${li + 1} 行 ${n} 字 > 14：「${l}」`); else if (w > 15.6) E(`${tag}: 字幕第 ${li + 1} 行含標點寬 ${w.toFixed(1)}em > 15.6（會超出安全區）：「${l}」→ 用 \\n 改斷行或精簡字幕`); else if (w > 15.0) W(`${tag}: 字幕第 ${li + 1} 行寬 ${w.toFixed(1)}em 略超出字幕框（置中後仍在安全區內）：「${l}」`); });
      if (clean(s.subtitle.zh) !== clean(s.narration)) W(`${tag}: 字幕與旁白文字不同（允許，但請確認是刻意的）`);
      if (s.subtitle.en.length > 110) E(`${tag}: 英文字幕太長（${s.subtitle.en.length}）`); else if (s.subtitle.en.length > 90) W(`${tag}: 英文字幕偏長（${s.subtitle.en.length}）`);
    }
    if (!Array.isArray(s.keywords)) E(`${tag}: keywords 必須是陣列`);
    else {
      if (s.keywords.length > 3) W(`${tag}: 關鍵詞超過 3 個`);
      s.keywords.forEach((k) => { if (!s.subtitle?.zh?.includes(k)) E(`${tag}: 關鍵詞「${k}」不在字幕裡`); if (k.length > 6) W(`${tag}: 關鍵詞「${k}」偏長`); if (PUNCT.test(k)) E(`${tag}: 關鍵詞「${k}」含標點`); });
    }
    if (!Array.isArray(s.sources)) E(`${tag}: sources 必須是陣列`);
    else if (!s.sources.length && !isEnd && i !== 0) E(`${tag}: sources 不可為空`);
    if (s.durationSec !== undefined && (typeof s.durationSec !== "number" || s.durationSec < 3 || s.durationSec > 15)) E(`${tag}: durationSec 應為 3–15`);
    if (i === scenes.length - 1 && !isEnd) E("最後一幕必須是 EndCard");
    if (isEnd && i !== scenes.length - 1) E(`${tag}: EndCard 只能是最後一幕`);
    total += voicedSeconds(s);
    const p = s.props ?? {};
    if (typeof p !== "object") E(`${tag}: props 必須是物件`);
    switch (s.component) {
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
        break;
    }
  });
  const est = Math.round(total);
  if (est < 65 || est > 105) E(`配音版總長估算 ${est} 秒，應在 70–100 秒`); else if (est < 70 || est > 100) W(`配音版總長估算 ${est} 秒，建議 70–100 秒`);
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
  warns.forEach((w) => console.log(`⚠ ${w}`));
  errors.forEach((e) => console.log(`✖ ${e}`));
  console.log(`${errors.length} error(s), ${warns.length} warning(s)，${script.scenes?.length ?? 0} 幕，配音版估 ${est ?? "?"} 秒`);
  process.exit(errors.length ? 1 : 0);
}

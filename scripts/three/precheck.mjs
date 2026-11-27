// node scripts/three/precheck.mjs <slug> [--no-frames] [--json] [--scale 0.5]
// 交審前預檢：把審查員最常退件的項目（docs/channels/tech-review-deductions.md、docs/reviews/2026-11-27-*.md 統計）變成程式自動擋。
// 靜態判斷（script.json／timeline.json／model.json，不開瀏覽器，秒級）：
//   S1 出處列含內部名稱（tech-xxx、查證、series_plan、上一集／前一集／預告、「通例」「系列」等非來源字）        error
//   S2 英文字幕段數與中文短語數不一致（en 用 | 分段要和 zh 的行數相同；timeline 的字幕段 en 缺漏也算）        error
//   S3 字幕／念稿寫「上一集」但 tts 念「前一集」（或反過來）：看到與聽到不一致                              error
//   S4 單幕 >10 秒且最後一個畫面事件（鏡頭／動作／疊層／標籤）之後還有 >4 秒沒事件                         warning
//   S5 疊層、標籤、鉤子大字的 until 超過本幕結束 >4 幀（舊卡殘留進下一幕）                                  error（>4 幀）
//   S6 標籤 part 指到不存在的錨點或錨點的層／零件不存在（引線落空）                                           error
// 抽幀判斷（每個幕界最多 3 幀、預設 0.5 倍解析度，用 frames-dump.mjs，一次打包；--no-frames 略過）：
//   F1 換幕空景：幕首 start、start+2、start+4 三幀的主畫面區「有彩度／深色像素比例」都低於門檻 → 只有地板／格線   error（三幀都空）／warning（僅第 1 幀空）
// 輸出 error／warning 清單與證據幀路徑（out/<slug>/precheck/）；有 error 時結束碼 1。報告寫 out/<slug>/precheck.json。
// 不改 validate-three.mjs，獨立一支；2026/11/27 新增。
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { expandModel, expandScript } from "./parts/index.mjs";

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "../..");
const args = process.argv.slice(2);
const slug = args.find((a) => !a.startsWith("--"));
const asJson = args.includes("--json"), noFrames = args.includes("--no-frames");
const scale = args.includes("--scale") ? Number(args[args.indexOf("--scale") + 1]) : 0.5;
if (!slug) { console.error("用法：node scripts/three/precheck.mjs <slug> [--no-frames] [--json] [--scale 0.5]"); process.exit(2); }
const rd = (f) => { const p = path.join(ROOT, "videos", slug, f); return fs.existsSync(p) ? JSON.parse(fs.readFileSync(p, "utf8")) : null; };
const script = rd("script.json"), timeline = rd("timeline.json"), story = rd("storyboard.json");
if (!script) { console.error(`找不到 videos/${slug}/script.json`); process.exit(2); }
let model = script.model ?? rd("model.json");
let scenes = script.scenes;
if (model) { try { model = expandModel(model); scenes = expandScript({ ...script, model }, model).scenes; } catch { /* 沒有零件庫就用原樣 */ } }
const FPS = story?.fps ?? timeline?.fps ?? 30;
const issues = [];
const add = (level, rule, scene, msg, frame, evidence) => issues.push({ level, rule, scene, msg, ...(frame != null ? { frame } : {}), ...(evidence ? { evidence } : {}) });

// ---- 幕的絕對幀範圍與 cue ----
const tl = new Map((timeline?.scenes ?? story?.scenes ?? []).map((s) => [s.id, s]));
const range = new Map(); // id -> {start,end}
let acc = 0;
for (const s of scenes) {
  const t = tl.get(s.id);
  const start = t?.startFrame ?? acc;
  const dur = t?.durationFrames ?? Math.round((s.durationSec ?? 6) * FPS);
  range.set(s.id, { start, end: start + dur }); acc = start + dur;
}
const cueFrame = new Map(); // "sid:cueId" 與 cueId
for (const s of scenes) for (const c of tl.get(s.id)?.cues ?? []) { const f = c.frame ?? (range.get(s.id).start + (c.sceneFrame ?? 0)); cueFrame.set(`${s.id}:${c.id}`, f); if (!cueFrame.has(c.id)) cueFrame.set(c.id, f); }
// at／until 字串 → 絕對幀（解不出來回 null）
const resolve = (tok, sid) => {
  if (typeof tok === "number") return range.get(sid).start + tok;
  if (typeof tok !== "string") return null;
  const m = /^(?:(s\w+):)?(start|end|voice|exit)?([+-]\d+)?$/.exec(tok.trim());
  if (m && (m[2] || m[3])) {
    const sc = m[1] ?? sid, r = range.get(sc); if (!r) return null;
    const k = m[2] ?? "start", off = Number(m[3] ?? 0);
    const base = k === "end" || k === "exit" ? r.end : k === "voice" ? (tl.get(sc)?.voiceStartFrame != null ? r.start + tl.get(sc).voiceStartFrame : r.start) : r.start;
    return base + off;
  }
  const c = /^(?:(s\w+):)?([A-Za-z_]\w*)([+-]\d+)?$/.exec(tok.trim());
  if (c) { const f = cueFrame.get(c[1] ? `${c[1]}:${c[2]}` : `${sid}:${c[2]}`) ?? cueFrame.get(c[2]); if (f != null) return f + Number(c[3] ?? 0); }
  return null;
};

// ---- S1 出處列 ----
const BAD_SRC = [[/tech-[a-z0-9-]+/i, "內部片名"], [/查證/, "「查證」"], [/series_plan/i, "series_plan"], [/上一集|前一集|下一集|預告/, "集數／預告"], [/通例|系列|內部|第\s*\d+\s*集/, "非來源字"]];
for (const s of scenes) {
  const src = [...(s.sources ?? []), s.source ?? ""].join("、");
  for (const [re, name] of BAD_SRC) { const m = re.exec(src); if (m) add("error", "S1", s.id, `出處列含${name}「${m[0]}」（出處只放觀眾查得到的來源或「示意動畫，不是量測」）：${src}`); }
}

// ---- S2 英文字幕段數 ----
for (const s of scenes) {
  const zh = (s.subtitle?.zh ?? "").split("\n").map((x) => x.trim()).filter(Boolean);
  const en = (s.subtitle?.en ?? "").split("|").map((x) => x.trim()).filter(Boolean);
  if (zh.length && en.length !== zh.length) add("error", "S2", s.id, `英文字幕 ${en.length} 段、中文 ${zh.length} 行：en 用 | 分成與 zh 同數段（否則整幕錯位）`);
  const subs = tl.get(s.id)?.subtitles ?? story?.scenes?.find((x) => x.id === s.id)?.subtitles;
  if (subs) { const empty = subs.filter((x) => x.zh && !x.en); if (empty.length) add("error", "S2", s.id, `時間軸有 ${empty.length} 個中文短語沒有英文（「${empty[0].zh}」）`); }
}

// ---- S3 上一集／前一集 ----
for (const s of scenes) {
  const seen = [s.subtitle?.zh, s.narration].filter(Boolean).join("");
  const said = s.tts ?? s.narration ?? "";
  for (const [a, b] of [["上一集", "前一集"], ["前一集", "上一集"]]) if (seen.includes(a) && said.includes(b) && !said.includes(a)) add("error", "S3", s.id, `字幕寫「${a}」但念稿 tts 念「${b}」（聽到與看到不一致，統一用同一個詞）`);
}

// ---- S4 長幕後段無事件 ----
for (const s of scenes) {
  const r = range.get(s.id), dur = (r.end - r.start) / FPS; if (dur <= 10) continue;
  const p = s.props ?? {}; const ev = [];
  const push = (tok, extra = 0) => { const f = resolve(tok, s.id); if (f != null) ev.push(f + extra); };
  for (const k of p.shot ?? []) push(k.at, k.dur ?? 0);
  for (const k of p.run ?? []) push(k.at);
  for (const k of p.labels ?? []) push(k.at);
  for (const o of p.overlay ?? []) { push(o.at); for (const v of Object.values(o.t ?? {})) if (v?.at) push(v.at); }
  for (const k of p.kin ?? []) if (k?.at) push(k.at);
  const inScene = ev.filter((f) => f >= r.start && f <= r.end); if (!inScene.length) { add("warning", "S4", s.id, `${dur.toFixed(1)} 秒的幕解不出任何畫面事件`); continue; }
  const tail = (r.end - Math.max(...inScene)) / FPS;
  if (tail > 4) add("warning", "S4", s.id, `${dur.toFixed(1)} 秒的幕，最後一個畫面事件後還有 ${tail.toFixed(1)} 秒沒有事件（拆幕或補動作）`, Math.max(...inScene));
}

// ---- S5 疊層殘留進下一幕 ----
for (const s of scenes) {
  const r = range.get(s.id), p = s.props ?? {}, next = scenes[scenes.indexOf(s) + 1]; if (!next) continue;
  const chk = (what, tok) => { const f = resolve(tok, s.id); if (f != null && f > r.end + 4 && f < range.get(next.id).end - 12) add("error", "S5", s.id, `${what} 的 until「${tok}」比本幕結束晚 ${f - r.end} 幀（舊卡殘留進 ${next.id} 但沒撐滿整幕；有意跨幕就把 until 設到下一幕結束，否則淡出要在下一幕起點前收完）`, r.end); };
  for (const o of p.overlay ?? []) chk(`疊層 ${o.kind ?? o.type}`, o.until);
  for (const l of p.labels ?? []) chk(`標籤「${l.text}」`, l.until);
  if (p.hook?.until) chk("鉤子大字", p.hook.until);
}

// ---- S6 標籤錨點 ----
if (model) {
  const anchors = model.anchors ?? {};
  const ids = new Set([...(model.parts ?? []).flatMap((x) => [x.id, x.layer]), ...Object.keys(model.partNames ?? {})]);
  for (const s of scenes) for (const l of s.props?.labels ?? []) {
    if (!l.part) continue;
    const a = anchors[l.part];
    if (!a) { if (!ids.has(l.part)) add("error", "S6", s.id, `標籤「${l.text}」的 part「${l.part}」不是錨點也不是零件 id（引線無處可指）`); continue; }
    if (a.layer && !ids.has(a.layer)) add("error", "S6", s.id, `標籤「${l.text}」的錨點「${l.part}」綁在不存在的層「${a.layer}」`);
  }
}

// ---- F1 換幕空景（抽幀）----
const outDir = path.join(ROOT, "out", slug, "precheck");
const frameStats = [];
if (!noFrames) {
  const want = [];
  scenes.forEach((s, i) => { if (i === 0 || i === scenes.length - 1) return; const st = range.get(s.id).start; [0, 2, 4].forEach((d) => want.push(st + d)); });
  fs.mkdirSync(outDir, { recursive: true });
  const r = spawnSync("node", ["scripts/three/frames-dump.mjs", slug, outDir, want.join(","), "--scale", String(scale)], { cwd: ROOT, env: { ...process.env, FORCE: "1" }, stdio: ["ignore", "pipe", "pipe"], encoding: "utf8" });
  if (r.status !== 0) add("warning", "F1", "-", `抽幀失敗，略過換幕空景檢查：${(r.stderr || r.stdout || "").trim().split("\n").pop()}`);
  else {
    const py = `
import sys, json, numpy as np
from PIL import Image
out = {}
for p in sys.argv[1:]:
    im = np.asarray(Image.open(p).convert("RGB")).astype(int)
    h, w, _ = im.shape
    reg = im[int(h*0.17):int(h*0.66), int(w*0.04):int(w*0.96)]       # 主畫面區（頁首與字幕帶之間）
    chroma = (reg.max(2) - reg.min(2)) >= 30                           # 有彩度的像素（地板與格線是灰的）
    dark = reg.mean(2) < 90                                            # 深色零件（深藍機殼等）
    out[p] = float((chroma | dark).mean())
print(json.dumps(out))`;
    const files = want.map((f) => path.join(outDir, `f${String(f).padStart(4, "0")}.png`)).filter((f) => fs.existsSync(f));
    const pr = spawnSync("python3", ["-I", "-c", py, ...files], { encoding: "utf8" });
    let stats = {}; try { stats = JSON.parse(pr.stdout); } catch { add("warning", "F1", "-", `像素統計失敗：${(pr.stderr || "").trim().split("\n").pop()}`); }
    const TH = Number(process.env.PRECHECK_EMPTY ?? 0.012);          // 有彩度或深色的像素比例低於此值＝只剩灰色地板／格線（實測：真空景 <0.01，有主素材的幕首 ≥0.03）
    for (const s of scenes.slice(1, -1)) {              // 最後一幕是片尾卡，本來就只有平面底，不檢查
      const st = range.get(s.id).start;
      const rows = [0, 2, 4].map((d) => { const f = path.join(outDir, `f${String(st + d).padStart(4, "0")}.png`); return { f: st + d, file: f, v: stats[f] }; });
      frameStats.push({ scene: s.id, frames: rows.map((x) => ({ frame: x.f, ratio: x.v != null ? +x.v.toFixed(3) : null })) });
      const known = rows.filter((x) => x.v != null); if (!known.length) continue;
      const empty = known.filter((x) => x.v < TH);
      if (empty.length === known.length) add("error", "F1", s.id, `換幕空景：幕首 ${known.map((x) => x.f).join("／")} 三幀主畫面區有彩度／深色像素比例 ${known.map((x) => x.v.toFixed(2)).join("／")}（< ${TH}），主素材沒到位`, st, known[0].file);
      else if (empty[0] === known[0]) add("warning", "F1", s.id, `幕首第 1 幀（${known[0].f}）主畫面區有彩度／深色像素比例僅 ${known[0].v.toFixed(2)}（< ${TH}），可能閃一格空景；後面幀正常`, st, known[0].file);
    }
  }
}

// ---- 輸出 ----
const res = { slug, scale, issues, frameStats };
fs.mkdirSync(path.join(ROOT, "out", slug), { recursive: true });
fs.writeFileSync(path.join(ROOT, "out", slug, "precheck.json"), JSON.stringify(res, null, 1));
const ne = issues.filter((i) => i.level === "error").length, nw = issues.length - ne;
if (asJson) console.log(JSON.stringify(res));
else {
  for (const i of issues) console.log(`${i.level === "error" ? "✖" : "⚠"} [${i.rule}] ${i.scene}: ${i.msg}${i.frame != null ? `（第 ${i.frame} 幀）` : ""}${i.evidence ? `\n    證據：${path.relative(ROOT, i.evidence)}` : ""}`);
  console.log(`${ne ? "✖" : "✔"} precheck ${slug}：${ne} error、${nw} warning${noFrames ? "（未抽幀）" : ""}`);
}
process.exit(ne ? 1 : 0);

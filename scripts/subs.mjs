// 字幕檔與分鏡表（不必重新渲染）
//   npm run subs <slug>  → out/<slug>.srt（中英雙行）、out/<slug>.zh.srt、out/<slug>.en.srt＋videos/<slug>/storyboard.json
//   render.mjs 渲染完自動呼叫 writeSrt；align.mjs 寫完 timeline.json 自動呼叫 writeStoryboard
// 時間一律取 timeline.json（v2＝字幕短語 lines[].start 與 subtitleWindow；v1＝各幕 durationSec 與 lines[].start 秒），
// 文字一律用稿子原文（script.json 的 subtitle.zh／en），不用 ASR 聽寫結果。沒有 timeline（無聲版）時用字數估算的幕長。
import fs from "node:fs";
import path from "node:path";
import { splitLines } from "./validate.mjs";

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const FPS = 30;
/** 與 src/theme.ts LAYOUT_V2.SUB_EN_MAX 相同 */
const SUB_EN_MAX = 42;
/** 與 src/components/v2/Tracks.tsx 的 display() 相同：去掉手動斷點與段尾逗號類標點 */
const display = (p) => p.replace(/\n/g, "").replace(/[，、；：。]+$/, "");
/** 與 Tracks.tsx 的 enChunks 相同：英文副字幕依中文句顯示，每段 ≤42 字元 */
export const enChunks = (en, max = SUB_EN_MAX) => {
  const words = String(en ?? "").split(/\s+/).filter(Boolean);
  const out = [];
  let cur = "";
  for (const w of words) { if (cur && (cur + " " + w).length > max) { out.push(cur); cur = w; } else cur = cur ? `${cur} ${w}` : w; }
  if (cur) out.push(cur);
  if (out.length > 1 && out[out.length - 1].length < max * 0.35) {
    const all = (out[out.length - 2] + " " + out[out.length - 1]).split(" ");
    const half = Math.ceil(all.length / 2);
    out.splice(out.length - 2, 2, all.slice(0, half).join(" "), all.slice(half).join(" "));
  }
  return out.length ? out : [""];
};

const isV2 = (script, tl) => script.styleVersion === 2 && tl?.version === 2;
/** v1 幕長（秒），與 src/timing.ts sceneSeconds 相同 */
const v1Seconds = (s, tl) => {
  const t = tl?.scenes?.find((x) => x.id === s.id);
  if (t) return t.durationSec;
  if (s.durationSec) return s.durationSec;
  const chars = s.narration.replace(/[\s，。、！？：；「」（）,.!?]/g, "").length;
  return Math.min(10, Math.max(5, Math.ceil(chars / 5) + 1));
};

/**
 * 字幕事件（絕對幀，[start, end)）：{ sceneId, start, end, zh, en }
 *  v2：一個中文短語一個事件；英文段落依 Tracks.tsx 的比例對應（第 k 個短語顯示第 floor(k·nEn/nZh) 段英文）
 *  v1：每幕每行一個事件（第 2 行在被唸到時出現），英文整句跟著整幕
 */
export function subtitleEvents(script, tl) {
  const ev = [];
  if (isV2(script, tl)) {
    for (const t of tl.scenes) {
      const s = script.scenes.find((x) => x.id === t.id);
      if (!s || !t.subtitleWindow || !t.lines?.length) continue;
      const [a, b] = t.subtitleWindow;
      const en = enChunks(s.subtitle.en);
      t.lines.forEach((l, k) => {
        const start = Math.max(a, l.start), end = k + 1 < t.lines.length ? t.lines[k + 1].start : b;
        if (end <= start) return;
        ev.push({ sceneId: t.id, start, end, zh: display(l.text), en: en[Math.min(en.length - 1, Math.floor((k * en.length) / t.lines.length))] });
      });
    }
  } else {
    let acc = 0;
    for (const s of script.scenes) {
      const n = Math.round(v1Seconds(s, tl) * FPS);
      const t = tl?.scenes?.find((x) => x.id === s.id);
      if (s.component !== "EndCard" && s.subtitle?.zh) {
        const lines = splitLines(s.subtitle.zh);
        const starts = lines.map((_, k) => (t?.lines?.[k] ? Math.round(t.lines[k].start * FPS) : Math.round((k * n) / lines.length)));
        lines.forEach((l, k) => {
          const start = acc + starts[k], end = acc + (k + 1 < lines.length ? starts[k + 1] : n);
          if (end > start) ev.push({ sceneId: s.id, start, end, zh: display(l), en: s.subtitle.en });
        });
      }
      acc += n;
    }
  }
  // 同語言連續相同的英文合併由呼叫端處理；這裡保證時間遞增、不重疊
  for (let i = 1; i < ev.length; i++) if (ev[i].start < ev[i - 1].end) ev[i - 1].end = ev[i].start;
  return ev.filter((e) => e.end > e.start);
}

const ts = (frame) => {
  const ms = Math.round((frame / FPS) * 1000);
  const p = (n, w = 2) => String(n).padStart(w, "0");
  return `${p(Math.floor(ms / 3600000))}:${p(Math.floor(ms / 60000) % 60)}:${p(Math.floor(ms / 1000) % 60)},${p(ms % 1000, 3)}`;
};
const srt = (cues) => cues.map((c, i) => `${i + 1}\n${ts(c.start)} --> ${ts(c.end)}\n${c.text}\n`).join("\n");
/** 相鄰且文字相同的事件合併（英文一段常跨好幾個中文短語） */
const merge = (cues) => cues.reduce((o, c) => { const l = o[o.length - 1]; if (l && l.text === c.text && l.end === c.start) l.end = c.end; else o.push({ ...c }); return o; }, []);

export function buildSrt(script, tl) {
  const ev = subtitleEvents(script, tl);
  return {
    both: srt(ev.map((e) => ({ start: e.start, end: e.end, text: e.en ? `${e.zh}\n${e.en}` : e.zh }))),
    zh: srt(ev.map((e) => ({ start: e.start, end: e.end, text: e.zh }))),
    en: srt(merge(ev.filter((e) => e.en).map((e) => ({ start: e.start, end: e.end, text: e.en })))),
    count: ev.length,
  };
}

/** out/<slug>.srt、.zh.srt、.en.srt */
export function writeSrt(slug, script, tl) {
  const r = buildSrt(script, tl);
  const out = path.join(ROOT, "out");
  fs.mkdirSync(out, { recursive: true });
  for (const [k, suffix] of [["both", ""], ["zh", ".zh"], ["en", ".en"]]) fs.writeFileSync(path.join(out, `${slug}${suffix}.srt`), r[k]);
  console.log(`✔ 字幕檔 out/${slug}.srt（中英）＋ .zh.srt ＋ .en.srt，${r.count} 段（時間＝timeline${tl ? "" : "（無：字數估算）"}，文字＝稿子原文）`);
  return r;
}

/**
 * 分鏡表：每幕 id、startFrame、durationFrames、component、beat、轉場、人聲區間、cues（絕對幀＋幕內相對幀）、字幕短語時間。
 * 給人看、也給自查腳本（9 個關鍵時刻拼圖、聲畫匹配）用；時間來源只有 timeline.json。
 */
export function buildStoryboard(script, tl) {
  const v2 = isV2(script, tl);
  const ev = subtitleEvents(script, tl);
  const rows = [];
  if (v2) {
    for (const t of tl.scenes) {
      const s = script.scenes.find((x) => x.id === t.id) ?? {};
      rows.push({
        id: t.id, startFrame: t.startFrame, durationFrames: t.durationFrames, startSec: +(t.startFrame / FPS).toFixed(2), durationSec: +(t.durationFrames / FPS).toFixed(2),
        component: s.component, beat: s.beat ?? null,
        transition: t.transition ? { type: t.transition.type, frames: t.transition.frames ?? t.transitionFrames, ...(t.transition.carry ? { carry: t.transition.carry.text } : {}) } : { type: "none", frames: 0 },
        camera: s.camera ?? null,
        cueEarly: (t.cues ?? []).filter((q) => q.early).map((q) => ({ id: q.id, early: q.early })),
        voice: t.audio ? { startFrame: t.voiceStartFrame, endFrame: t.voiceEndFrame, pauseAfterSec: t.pauseAfter ?? null } : null,
        cues: (t.cues ?? []).map((q) => ({ id: q.id, text: q.text, frame: q.frame, sceneFrame: q.frame == null ? null : q.frame - t.startFrame })),
        stillFrame: t.stillFrame,
        subtitles: ev.filter((e) => e.sceneId === t.id).map((e) => ({ zh: e.zh, en: e.en, startFrame: e.start, endFrame: e.end })),
        narration: s.narration,
      });
    }
  } else {
    let acc = 0;
    for (const s of script.scenes) {
      const n = Math.round(v1Seconds(s, tl) * FPS);
      const t = tl?.scenes?.find((x) => x.id === s.id);
      rows.push({
        id: s.id, startFrame: acc, durationFrames: n, startSec: +(acc / FPS).toFixed(2), durationSec: +(n / FPS).toFixed(2), component: s.component, beat: s.beat ?? null,
        transition: acc ? { type: "fade-through", frames: 10 } : { type: "none", frames: 0 }, // v1 SceneView：進場 10 幀、出場 9 幀，不重疊
        voice: t?.audio ? { startFrame: acc + Math.round((t.leadSec ?? 0) * FPS), endFrame: acc + Math.round(((t.leadSec ?? 0) + t.audioSec) * FPS) } : null,
        cues: [], stillFrame: acc + n - 12,
        subtitles: ev.filter((e) => e.sceneId === s.id).map((e) => ({ zh: e.zh, en: e.en, startFrame: e.start, endFrame: e.end })),
        narration: s.narration,
      });
      acc += n;
    }
  }
  const last = rows[rows.length - 1];
  const totalFrames = last ? last.startFrame + last.durationFrames : 0;
  return { slug: script.slug, styleVersion: script.styleVersion ?? 1, fps: FPS, timeline: v2 ? "v2" : tl ? "v1" : "estimate", totalFrames, totalSec: +(totalFrames / FPS).toFixed(2), scenes: rows };
}

export function writeStoryboard(slug, script, tl) {
  const sb = buildStoryboard(script, tl);
  const p = path.join(ROOT, "videos", slug, "storyboard.json");
  fs.writeFileSync(p, JSON.stringify(sb, null, 1) + "\n");
  console.log(`✔ 分鏡表 ${path.relative(ROOT, p)}（${sb.scenes.length} 幕、${sb.totalFrames} 幀、${sb.scenes.reduce((a, x) => a + x.cues.length, 0)} 個 cue）`);
  return sb;
}

if (process.argv[1] && import.meta.url.endsWith(path.basename(process.argv[1]))) {
  const slug = process.argv[2];
  if (!slug) { console.error("用法：npm run subs <slug>"); process.exit(2); }
  const dir = path.join(ROOT, "videos", slug);
  const script = JSON.parse(fs.readFileSync(path.join(dir, "script.json"), "utf8"));
  const tp = path.join(dir, "timeline.json");
  const tl = fs.existsSync(tp) ? JSON.parse(fs.readFileSync(tp, "utf8")) : null;
  if (script.styleVersion === 2 && tl?.version === 2 && tl.scenes.map((x) => x.id).join() !== script.scenes.map((x) => x.id).join()) {
    console.error(`✖ ${slug} 的 timeline.json 已過期（幕序與 script.json 不同）：先 npm run tts && npm run align`); process.exit(1);
  }
  writeSrt(slug, script, tl);
  writeStoryboard(slug, script, tl);
}

import fs from "node:fs";
import path from "node:path";
import { bundle } from "@remotion/bundler";

export const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
export const BROWSER = process.env.REMOTION_BROWSER ||
  ["/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell"].find((p) => fs.existsSync(p));

/** 讀 script.json；若有 timeline.json（配音時間軸）一併掛上，並確認音檔都在 */
export const loadScript = (slug) => {
  if (!slug) throw new Error("用法：npm run still|render <slug>");
  const p = path.join(ROOT, "videos", slug, "script.json");
  if (!fs.existsSync(p)) throw new Error(`找不到 ${p}`);
  const s = JSON.parse(fs.readFileSync(p, "utf8"));
  const tp = path.join(ROOT, "videos", slug, "timeline.json");
  s.timeline = fs.existsSync(tp) ? JSON.parse(fs.readFileSync(tp, "utf8")) : null;
  if (s.styleVersion === 3) {
    // v3（桌面紙拼貼）：沿用時間軸 v2；紙材 meta 一併掛上（public/v3/<slug>/meta.json，scripts/make-paper.py 產生）
    const mp = path.join(ROOT, "public", "v3", slug, "meta.json");
    if (!fs.existsSync(mp)) throw new Error(`找不到 ${path.relative(ROOT, mp)}：先 python3 scripts/make-paper.py ${slug}`);
    s.v3 = { assets: JSON.parse(fs.readFileSync(mp, "utf8")) };
  }
  if ([2, 3].includes(s.styleVersion) && s.timeline?.version !== 2)
    throw new Error(`${slug} 是 styleVersion ${s.styleVersion}，需要時間軸 v2：先 npm run align ${slug}（timeline.json 要有 version: 2）`);
  if (s.timeline) {
    for (const sc of s.timeline.scenes) {
      if (sc.audio && !fs.existsSync(path.join(ROOT, "public", sc.audio))) throw new Error(`timeline 指到的音檔不存在：public/${sc.audio}（請先 npm run tts ${slug}）`);
    }
    if ([2, 3].includes(s.styleVersion) && s.timeline.scenes.map((x) => x.id).join() !== s.scenes.map((x) => x.id).join())
      throw new Error(`${slug} 的 timeline.json 已過期（幕序與 script.json 不同）：先 npm run tts ${slug} && npm run align ${slug}`);
    const ids = new Set(s.timeline.scenes.map((x) => x.id));
    const missing = s.scenes.filter((x) => !ids.has(x.id)).map((x) => x.id);
    if (missing.length) console.warn(`⚠ timeline 缺少幕：${missing.join(", ")}（這些幕會用字數估算長度、無聲）`);
  }
  return s;
};

export const makeBundle = () => bundle({ entryPoint: path.join(ROOT, "src/index.ts"), publicDir: path.join(ROOT, "public") });

// swiftshader 比預設的 swangle 快 2.5 倍（軟體渲染環境實測 194 vs 479 ms/frame）
export const chromiumOptions = { gl: "swiftshader" };
export const fps = 30;
/**
 * 每幕截圖用的絕對幀。v2：timeline.json 的 stillFrame（單一時間來源）；v1：各幕結束前 12 幀（舊算法）
 */
export const stillFrames = (script) => {
  if (script.timeline?.version === 2) {
    const by = Object.fromEntries(script.timeline.scenes.map((x) => [x.id, x]));
    // v3：一鏡到底，下一幕一開始紙片就動，所以截圖不晚於下一幕開始前 1 幀；幕可用 still: "cue+N"（或 start／end ±N）指定代表畫面（v2 不變）
    if (script.styleVersion === 3) return script.scenes.map((s, i) => {
      const t = by[s.id], n = script.scenes[i + 1] && by[script.scenes[i + 1].id], cap = n ? n.startFrame - 1 : Infinity;
      if (!t) return 0;
      const m = /^([^\s+-]+)([+-]\d+)?$/.exec(String(s.still ?? ""));
      if (m) {
        const base = m[1] === "start" ? t.startFrame : m[1] === "end" ? t.voiceEndFrame : (t.cues ?? []).find((q) => q.id === m[1])?.frame;
        if (base === undefined || base === null) throw new Error(`${s.id}: still「${s.still}」找不到 cue「${m[1]}」`);
        return Math.max(t.startFrame, Math.min(base + Number(m[2] ?? 0), cap));
      }
      return Math.min(t.stillFrame ?? 0, cap);
    });
    return script.scenes.map((s) => by[s.id]?.stillFrame ?? 0);
  }
  let t = 0;
  return script.scenes.map((s) => { const n = sceneFrames(s, script.timeline); const fr = t + n - 12; t += n; return fr; });
};
/** v2：Composition 幀數必須 ＝ timeline 最後一幕的結束幀 */
export const assertFrames = (script, comp) => {
  if (script.timeline?.version !== 2) return;
  const tl = script.timeline;
  const last = tl.scenes[tl.scenes.length - 1];
  const end = last.startFrame + last.durationFrames;
  if (comp.durationInFrames !== tl.totalFrames || end !== tl.totalFrames)
    throw new Error(`幀數不一致：composition ${comp.durationInFrames}、timeline.totalFrames ${tl.totalFrames}、最後一幕結束 ${end}`);
  console.log(`✔ 幀數一致：${comp.durationInFrames}（timeline v2）`);
};
export const sceneFrames = (s, timeline) => {
  const tl = timeline?.scenes?.find((x) => x.id === s.id);
  if (tl) return Math.round(tl.durationSec * fps);
  if (s.durationSec) return Math.round(s.durationSec * fps);
  const chars = s.narration.replace(/[\s，。、！？：；「」（）,.!?]/g, "").length;
  return Math.min(10, Math.max(5, Math.ceil(chars / 5) + 1)) * fps;
};

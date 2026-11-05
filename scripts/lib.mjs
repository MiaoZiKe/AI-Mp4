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
  if (s.timeline) {
    for (const sc of s.timeline.scenes) {
      if (sc.audio && !fs.existsSync(path.join(ROOT, "public", sc.audio))) throw new Error(`timeline 指到的音檔不存在：public/${sc.audio}（請先 npm run tts ${slug}）`);
    }
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
export const sceneFrames = (s, timeline) => {
  const tl = timeline?.scenes?.find((x) => x.id === s.id);
  if (tl) return Math.round(tl.durationSec * fps);
  if (s.durationSec) return Math.round(s.durationSec * fps);
  const chars = s.narration.replace(/[\s，。、！？：；「」（）,.!?]/g, "").length;
  return Math.min(10, Math.max(5, Math.ceil(chars / 5) + 1)) * fps;
};

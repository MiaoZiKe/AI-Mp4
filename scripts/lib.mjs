import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { bundle } from "@remotion/bundler";

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
export const FPS = 30;

const CANDIDATES = [
  process.env.REMOTION_BROWSER,
  "/opt/pw-browsers/chromium",
].filter(Boolean);
export const browserExecutable = CANDIDATES.find((p) => fs.existsSync(p)) ?? null;
export const chromiumOptions = { gl: "swangle" };

export const getSlug = () => {
  const slug = process.argv[2];
  if (!slug) {
    console.error("用法：npm run <still|render> <slug>");
    process.exit(1);
  }
  return slug;
};

export const loadScript = (slug) => {
  const p = path.join(ROOT, "videos", slug, "script.json");
  if (!fs.existsSync(p)) throw new Error(`找不到 ${p}`);
  return JSON.parse(fs.readFileSync(p, "utf8"));
};

/** 讀取 tts 腳本產生的配音時間表（若有） */
export const loadTiming = (slug) => {
  const p = path.join(ROOT, "public", slug, "timing.json");
  return fs.existsSync(p) ? JSON.parse(fs.readFileSync(p, "utf8")) : null;
};

const countChars = (s) => Array.from(s.replace(/[\s，。、：；！？「」（）,.:;!?()%\/]/g, "")).length;
export const estimateFrames = (scene) => {
  const n = scene.subtitle_zh.map(countChars).reduce((a, b) => a + b, 0);
  return Math.round(Math.min(10, Math.max(5, n / 5 + 1)) * FPS);
};

export const buildProps = (slug) => {
  const script = loadScript(slug);
  const timing = loadTiming(slug);
  const props = { script };
  if (timing) {
    props.durations = timing.durations;
    props.voice = timing.voice;
  }
  const frames = script.scenes.map((s) => props.durations?.[s.id] ?? estimateFrames(s));
  return { script, props, frames, voiced: !!timing };
};

export const makeBundle = async () => {
  const { ensureFonts } = await import("./fonts.mjs");
  await ensureFonts();
  console.log("▸ bundling…");
  return bundle({ entryPoint: path.join(ROOT, "src/index.ts"), publicDir: path.join(ROOT, "public") });
};

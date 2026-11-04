import fs from "node:fs";
import path from "node:path";
import { bundle } from "@remotion/bundler";

export const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
export const BROWSER = process.env.REMOTION_BROWSER ||
  ["/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell"].find((p) => fs.existsSync(p));

export const loadScript = (slug) => {
  if (!slug) throw new Error("用法：npm run still|render <slug>");
  const p = path.join(ROOT, "videos", slug, "script.json");
  if (!fs.existsSync(p)) throw new Error(`找不到 ${p}`);
  return JSON.parse(fs.readFileSync(p, "utf8"));
};

export const makeBundle = () => bundle({ entryPoint: path.join(ROOT, "src/index.ts"), publicDir: path.join(ROOT, "public") });

export const chromiumOptions = { gl: "swangle" };
export const fps = 30;
export const sceneFrames = (s) => {
  if (s.durationSec) return Math.round(s.durationSec * fps);
  const chars = s.narration.replace(/[\s，。、！？：；「」（）,.!?]/g, "").length;
  return Math.min(10, Math.max(5, Math.ceil(chars / 5) + 1)) * fps;
};

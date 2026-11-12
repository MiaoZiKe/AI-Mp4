// node scripts/v3/peek.mjs <slug> <out.png> <spec,spec,...> [--scale 0.4] [--cols 6]
// v3 檢查用：渲幾個指定時刻排成一張拼圖。spec＝絕對幀（"120"）、"s06"（該幕每 step 幀一張：--step 12）、"s06:serve+10"、"s06:start+5"、"s06:end"。
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { execFileSync } from "node:child_process";
import { renderStill, selectComposition } from "@remotion/renderer";
import { ROOT, BROWSER, loadScript, makeBundle, chromiumOptions } from "../lib.mjs";
const [slug, out, list] = process.argv.slice(2);
const opt = (k, d) => { const i = process.argv.indexOf(k); return i > 0 ? Number(process.argv[i + 1]) : d; };
const scale = opt("--scale", 0.4), cols = opt("--cols", 6), step = opt("--step", 12);
await import("../fetch-fonts.mjs");
const script = loadScript(slug);
const tl = script.timeline, by = Object.fromEntries(tl.scenes.map((x, i) => [x.id, { ...x, exit: tl.scenes[i + 1]?.startFrame ?? tl.totalFrames }]));
const frames = [];
for (const sp of list.split(",")) {
  if (/^\d+$/.test(sp)) { frames.push(Number(sp)); continue; }
  const [id, at] = sp.split(":"), t = by[id];
  if (!t) throw new Error(`沒有這一幕：${id}`);
  if (!at) { for (let f = t.startFrame; f < t.exit; f += step) frames.push(f); continue; }
  const m = /^([^+-]+)([+-]\d+)?$/.exec(at), off = Number(m[2] ?? 0);
  const base = m[1] === "start" ? t.startFrame : m[1] === "end" ? t.exit - 1 : m[1] === "voice" ? t.voiceStartFrame : (t.cues ?? []).find((q) => q.id === m[1])?.frame;
  if (base === undefined) throw new Error(`${id} 沒有 cue「${m[1]}」`);
  frames.push(base + off);
}
const serveUrl = await makeBundle();
const opts = { serveUrl, inputProps: script, browserExecutable: BROWSER, chromiumOptions, logLevel: "error" };
const comp = await selectComposition({ ...opts, id: "Video" });
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "peek-"));
const files = [];
for (const fr of frames) { const f = path.join(tmp, `${String(files.length).padStart(3, "0")}.png`); await renderStill({ ...opts, composition: comp, frame: Math.max(0, Math.min(tl.totalFrames - 1, fr)), output: f, scale }); files.push(f); }
const w = Math.round(1080 * scale), h = Math.round(1920 * scale), c = Math.min(cols, files.length);
execFileSync("ffmpeg", ["-y", "-loglevel", "error", "-framerate", "1", "-pattern_type", "glob", "-i", path.join(tmp, "*.png"), "-vf", `tile=${c}x${Math.ceil(files.length / c)}:padding=6:color=0x1E1B16`, "-frames:v", "1", out]);
fs.rmSync(tmp, { recursive: true, force: true });
console.log(`✔ ${out}：第 ${frames.join("、")} 幀（每張 ${w}×${h}）`);

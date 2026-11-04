// 混音：程序化 BGM + 每幕音效（script.json 的 sfx 欄位）+ 旁白（若有），輸出成片音軌並封裝進 MP4。
// - 有旁白：BGM 以 sidechain 壓到旁白下方約 20 dB
// - 無旁白：BGM 維持約 -14 LUFS 的背景量
// - 成品 loudnorm 到 -14 LUFS、峰值 -1 dBTP
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { synthBgm, synthSfx, writeWav } from "./audio-synth.mjs";
import { fps, sceneFrames } from "./lib.mjs";

export function mixAudio(script, silentMp4, outMp4, workDir, narration = null) {
  fs.mkdirSync(workDir, { recursive: true });
  const total = script.scenes.reduce((a, s) => a + sceneFrames(s), 0) / fps;
  const bgm = path.join(workDir, "bgm.wav");
  const [L, R] = synthBgm(total, script.music ?? {});
  writeWav(bgm, L, R);

  // 音效事件：每幕開始時間 + 相對秒數
  const events = [];
  let t = 0;
  for (const s of script.scenes) {
    for (const e of s.sfx ?? []) events.push({ at: t + e.t, name: e.name });
    t += sceneFrames(s) / fps;
  }
  const names = [...new Set(events.map((e) => e.name))];
  for (const n of names) writeWav(path.join(workDir, `sfx-${n}.wav`), synthSfx(n));

  const gain = { whoosh: 0.32, pop: 0.22, tick: 0.18, riser: 0.30, hit: 0.45, ding: 0.35 };
  const inputs = ["-i", silentMp4, "-i", bgm];
  const filters = [];
  let idx = 2;
  const voLabels = [];
  for (const [i, n] of (narration ?? []).entries()) {
    inputs.push("-i", n.file);
    const ms = Math.round(n.at * 1000);
    filters.push(`[${idx}:a]aformat=sample_rates=44100:channel_layouts=stereo,adelay=${ms}|${ms}[v${i}]`);
    voLabels.push(`[v${i}]`);
    idx++;
  }
  const sfxLabels = [];
  events.forEach((e, i) => {
    inputs.push("-i", path.join(workDir, `sfx-${e.name}.wav`));
    const ms = Math.max(0, Math.round(e.at * 1000));
    filters.push(`[${idx}:a]volume=${gain[e.name] ?? 0.25},adelay=${ms}|${ms}[s${i}]`);
    sfxLabels.push(`[s${i}]`);
    idx++;
  });
  filters.push(`${sfxLabels.join("")}amix=inputs=${sfxLabels.length}:normalize=0[sfx]`);
  if (voLabels.length) {
    filters.push(`${voLabels.join("")}amix=inputs=${voLabels.length}:normalize=0,asplit=2[vo][vokey]`);
    filters.push(`[1:a]volume=0.5[bgmv]`, `[bgmv][vokey]sidechaincompress=threshold=0.02:ratio=12:attack=15:release=350[bgmd]`);
    filters.push(`[bgmd][vo][sfx]amix=inputs=3:normalize=0[pre]`);
  } else {
    filters.push(`[1:a]volume=0.6[bgmv]`, `[bgmv][sfx]amix=inputs=2:normalize=0[pre]`);
  }
  filters.push(`[pre]loudnorm=I=-14:TP=-1:LRA=11,atrim=0:${total.toFixed(3)}[aout]`);
  execFileSync("ffmpeg", ["-y", "-loglevel", "error", ...inputs, "-filter_complex", filters.join(";"),
    "-map", "0:v", "-map", "[aout]", "-c:v", "copy", "-c:a", "aac", "-b:a", "192k", "-ar", "48000", "-movflags", "+faststart", outMp4], { stdio: "inherit" });
  return outMp4;
}

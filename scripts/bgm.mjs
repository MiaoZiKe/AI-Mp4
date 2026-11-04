// 合成低調 lo-fi 環境音（固定 seed），輸出 16-bit stereo WAV
import fs from "node:fs";

const SR = 44100;
const mulberry = (seed) => () => {
  seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};
const midi = (n) => 440 * Math.pow(2, (n - 69) / 12);

export const synthBgm = (seconds, outPath, seed = 20261103) => {
  const rnd = mulberry(seed);
  const N = Math.ceil(seconds * SR);
  const L = new Float32Array(N), R = new Float32Array(N);
  const bpm = 76, beat = 60 / bpm, bar = beat * 4;
  // Am9 – Fmaj7 – Cmaj7 – G6（每小節一和弦）
  const chords = [[57, 64, 67, 71, 74], [53, 60, 64, 69, 72], [48, 55, 59, 64, 67], [55, 59, 62, 64, 69]];
  const bass = [45, 41, 48, 43];
  let lp = 0, crackleLP = 0;
  for (let i = 0; i < N; i++) {
    const t = i / SR;
    const ci = Math.floor(t / bar) % 4;
    const tb = t % bar;
    const env = Math.min(1, tb / 0.6) * Math.min(1, (bar - tb) / 0.5);
    let pad = 0;
    chords[ci].forEach((n, k) => {
      const f = midi(n) * (1 + 0.0015 * Math.sin(2 * Math.PI * 0.3 * t + k));
      pad += Math.sin(2 * Math.PI * f * t) * 0.6 + Math.sin(2 * Math.PI * f * 2.001 * t) * 0.12;
    });
    pad *= (env * 0.06) * (0.85 + 0.15 * Math.sin(2 * Math.PI * 0.25 * t));
    lp += 0.08 * (pad - lp); // 低通，讓音色溫暖
    const tbeat = t % beat;
    const bi = Math.floor(t / beat) % 4;
    // 輕柔底鼓（第 1、3 拍）
    const kick = bi % 2 === 0 ? Math.sin(2 * Math.PI * (55 + 60 * Math.exp(-tbeat * 30)) * tbeat) * Math.exp(-tbeat * 9) * 0.22 : 0;
    // 貝斯
    const bs = Math.sin(2 * Math.PI * midi(bass[ci]) * t) * 0.08 * Math.min(1, tb / 0.05) * Math.exp(-(tb % (beat * 2)) * 0.8);
    // 刷刷聲 hi-hat（反拍）
    const th = (t + beat / 2) % beat;
    const hat = (rnd() * 2 - 1) * Math.exp(-th * 60) * 0.03;
    // 黑膠底噪
    crackleLP += 0.02 * ((rnd() * 2 - 1) - crackleLP);
    const crackle = crackleLP * 0.05 + (rnd() < 0.0004 ? (rnd() * 2 - 1) * 0.15 : 0);
    const fadeAll = Math.min(1, t / 2) * Math.min(1, (seconds - t) / 2.5);
    const m = (lp + kick + bs) * fadeAll;
    L[i] = (m + hat * 0.8 + crackle) * fadeAll;
    R[i] = (m + hat * 1.2 + crackle) * fadeAll;
  }
  const buf = Buffer.alloc(44 + N * 4);
  buf.write("RIFF", 0); buf.writeUInt32LE(36 + N * 4, 4); buf.write("WAVE", 8); buf.write("fmt ", 12);
  buf.writeUInt32LE(16, 16); buf.writeUInt16LE(1, 20); buf.writeUInt16LE(2, 22); buf.writeUInt32LE(SR, 24);
  buf.writeUInt32LE(SR * 4, 28); buf.writeUInt16LE(4, 32); buf.writeUInt16LE(16, 34); buf.write("data", 36); buf.writeUInt32LE(N * 4, 40);
  for (let i = 0; i < N; i++) {
    buf.writeInt16LE(Math.max(-1, Math.min(1, L[i])) * 32767 | 0, 44 + i * 4);
    buf.writeInt16LE(Math.max(-1, Math.min(1, R[i])) * 32767 | 0, 46 + i * 4);
  }
  fs.writeFileSync(outPath, buf);
};

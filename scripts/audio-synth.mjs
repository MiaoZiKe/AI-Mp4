// 程序化音訊：背景音樂（BGM）與音效（SFX）全部用程式合成，不使用外部音檔。
// 隨機皆用固定 seed，同一份 script 每次產出完全相同。
import fs from "node:fs";

export const SR = 44100;

const seeded = (seed) => {
  let s = seed >>> 0;
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296) * 2 - 1;
};

/** Float32 單聲道或雙聲道 → 16-bit PCM WAV */
export const writeWav = (file, L, R = L) => {
  const n = L.length;
  const buf = Buffer.alloc(44 + n * 4);
  buf.write("RIFF", 0); buf.writeUInt32LE(36 + n * 4, 4); buf.write("WAVE", 8);
  buf.write("fmt ", 12); buf.writeUInt32LE(16, 16); buf.writeUInt16LE(1, 20); buf.writeUInt16LE(2, 22);
  buf.writeUInt32LE(SR, 24); buf.writeUInt32LE(SR * 4, 28); buf.writeUInt16LE(4, 32); buf.writeUInt16LE(16, 34);
  buf.write("data", 36); buf.writeUInt32LE(n * 4, 40);
  for (let i = 0; i < n; i++) {
    buf.writeInt16LE(Math.max(-1, Math.min(1, L[i])) * 32767 | 0, 44 + i * 4);
    buf.writeInt16LE(Math.max(-1, Math.min(1, R[i])) * 32767 | 0, 46 + i * 4);
  }
  fs.writeFileSync(file, buf);
};

const normalize = (arrs, peak = 0.89) => {
  let m = 0;
  for (const a of arrs) for (let i = 0; i < a.length; i++) m = Math.max(m, Math.abs(a[i]));
  if (m > 0) for (const a of arrs) for (let i = 0; i < a.length; i++) a[i] *= peak / m;
};

const midi = (n) => 440 * Math.pow(2, (n - 69) / 12);

/**
 * 背景音樂：小調、緊湊但不搶旁白的新聞解說風。
 * - bpm 預設 100；和弦 Am – F – C – G（每和弦 1 小節）
 * - 層次：低頻脈衝（kick）、輕 hi-hat、柔和 pad、八分音符 pluck 琶音
 * - intensity 曲線：開頭（鉤子）較強、中段退後、結尾回升
 */
export function synthBgm(seconds, { bpm = 100, seed = 7 } = {}) {
  const n = Math.ceil(seconds * SR);
  const L = new Float32Array(n), R = new Float32Array(n);
  const rnd = seeded(seed);
  const beat = 60 / bpm, bar = beat * 4;
  const chords = [[57, 60, 64], [53, 57, 60], [48, 52, 55], [55, 59, 62]]; // Am F C G
  const roots = [45, 41, 36, 43];
  const intensity = (t) => {
    const fadeIn = Math.min(1, t / 0.6), fadeOut = Math.min(1, (seconds - t) / 2.5);
    return Math.max(0, Math.min(fadeIn, fadeOut));
  };
  // pad：每個和弦音 3 支微失諧鋸齒波，one-pole 低通
  let lpL = 0, lpR = 0;
  const phases = new Float64Array(18);
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    const ci = Math.floor(t / bar) % 4;
    const env = intensity(t);
    let sL = 0, sR = 0;
    chords[ci].forEach((note, k) => {
      for (let d = 0; d < 3; d++) {
        const idx = k * 3 + d;
        const f = midi(note) * (1 + (d - 1) * 0.004);
        phases[idx] = (phases[idx] + f / SR) % 1;
        const v = phases[idx] * 2 - 1;
        if (d === 0) sL += v; else if (d === 2) sR += v; else { sL += v * 0.5; sR += v * 0.5; }
      }
    });
    // 每小節的和弦交界做短交叉淡化，避免爆音
    const inBar = (t % bar) / bar;
    const xf = Math.min(1, inBar * 40, (1 - inBar) * 40);
    const cut = 0.035 + 0.02 * Math.sin(t * 0.25);
    lpL += cut * (sL - lpL); lpR += cut * (sR - lpR);
    L[i] += lpL * 0.05 * env * xf; R[i] += lpR * 0.05 * env * xf;
  }
  // 打擊與琶音：逐拍放入
  const addAt = (start, fn, len, pan = 0) => {
    const s0 = Math.floor(start * SR), m = Math.floor(len * SR);
    for (let j = 0; j < m && s0 + j < n; j++) {
      const rel = Math.min(1, (m - j) / (0.03 * SR), j / (0.003 * SR)); // 3ms 起音、30ms 收尾，避免爆音
      const v = fn(j / SR) * intensity(start) * rel;
      L[s0 + j] += v * (1 - pan); R[s0 + j] += v * (1 + pan);
    }
  };
  for (let t = 0, k = 0; t < seconds; t += beat / 2, k++) {
    const ci = Math.floor(t / bar) % 4;
    const onBeat = k % 2 === 0;
    // kick：每拍一下（sine 下滑）
    if (onBeat) addAt(t, (x) => Math.sin(2 * Math.PI * (48 + 70 * Math.exp(-x * 30)) * x) * Math.exp(-x * 9) * 0.32, 0.4);
    // hi-hat：反拍
    if (!onBeat) { let prev = 0; addAt(t, (x) => { const w = rnd(), v = w - prev; prev = w; return v * Math.exp(-x * 70) * 0.025; }, 0.08, k % 4 === 1 ? -0.4 : 0.4); }
    // bass：每拍根音
    if (onBeat) addAt(t, (x) => Math.sin(2 * Math.PI * midi(roots[ci]) * x) * Math.exp(-x * 3.5) * 0.16, beat * 0.95);
    // pluck 琶音（八分音符），音高在和弦內循環，高八度
    const note = chords[ci][k % 3] + 12 + (k % 8 === 7 ? 12 : 0);
    addAt(t, (x) => {
      const f = midi(note);
      return (Math.sin(2 * Math.PI * f * x) + 0.3 * Math.sin(4 * Math.PI * f * x)) * Math.exp(-x * 11) * 0.06;
    }, 0.35, (k % 3 - 1) * 0.5);
  }
  normalize([L, R], 0.8);
  return [L, R];
}

/** 音效：whoosh（換幕）、pop（元素出現）、tick（數字跳動）、riser（鉤子）、hit（重點揭曉）、ding（片尾） */
export function synthSfx(name, seed = 11) {
  const rnd = seeded(seed);
  const make = (sec, fn) => {
    const n = Math.floor(sec * SR), a = new Float32Array(n);
    for (let i = 0; i < n; i++) a[i] = fn(i / SR, i);
    normalize([a], 0.9);
    return a;
  };
  let bp1 = 0, bp2 = 0;
  switch (name) {
    case "whoosh": return make(0.55, (t) => {
      const x = t / 0.55, f = 300 + 3200 * Math.sin(Math.PI * x) ** 2, q = (2 * Math.PI * f) / SR;
      bp1 += q * (rnd() - bp1 - bp2 * 0.6); bp2 += q * bp1; // 簡易帶通掃頻
      return bp2 * Math.sin(Math.PI * x) ** 1.5;
    });
    case "pop": return make(0.14, (t) => Math.sin(2 * Math.PI * (900 - 2600 * t) * t) * Math.exp(-t * 32));
    case "tick": return make(0.04, (t) => (Math.sin(2 * Math.PI * 2400 * t) + rnd() * 0.3) * Math.exp(-t * 160));
    case "riser": return make(1.2, (t) => {
      const x = t / 1.2;
      return (Math.sin(2 * Math.PI * (200 + 900 * x * x) * t) * 0.5 + rnd() * 0.35 * x) * x * x * Math.min(1, (1.2 - t) * 30);
    });
    case "hit": return make(1.1, (t) => Math.sin(2 * Math.PI * (40 + 90 * Math.exp(-t * 12)) * t) * Math.exp(-t * 3.5) + rnd() * Math.exp(-t * 25) * 0.4);
    case "ding": return make(1.4, (t) => (Math.sin(2 * Math.PI * 1318.5 * t) + 0.5 * Math.sin(2 * Math.PI * 1975.5 * t)) * Math.exp(-t * 3));
    default: throw new Error(`unknown sfx ${name}`);
  }
}

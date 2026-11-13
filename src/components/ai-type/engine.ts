// 動態大字（stage: "type"）的時間模型：把各幕 props.items 攤平成絕對幀。
// 字的出現時間有兩種：不寫 at ＝跟著配音逐字出現（讀 timeline 每句字幕的逐字幀）；寫 at（cue id 或 start｜voice｜end｜exit ±N 幀，可加「幕id:」前綴）＝從那一幀起每 step 幀一個字。
// 內容全部來自 script.json；元件不手填秒數。
import type { Scene, TimelineV2 } from "../../types";
import { THEME_TYPE as T } from "../../theme";

export type Rect = [number, number, number, number];
export type SetStep = { at: number; dur: number; x?: number; y?: number; scale?: number; color?: string; rect?: Rect };
export type TypeItem = {
  kind: "text" | "block";
  ground: string;
  born: number;
  die: number;
  exit: string;
  set: SetStep[];
  // text
  t: string;
  x: number; y: number; size: number;
  color: string;
  font: "zh" | "en";
  weight?: number;
  ls?: string;
  w?: number;
  mode: "type" | "slam" | "ghost" | "rise";
  frames: number[];
  ghostAt: number;
  caret?: { color: string; until: number };
  strike?: { at: number; color: string };
  underline?: { at: number; color: string };
  // block
  rect: Rect;
  enter: string;
};
export type TypeLayer = { ground: string; at: number; enter: string; items: TypeItem[] };
export type TypeModel = { total: number; layers: TypeLayer[]; top: TypeItem[] };

const isCjk = (c: string) => /[⺀-鿿＀-￯　-〿]/.test(c);

export const buildType = (scenes: Scene[], tl: TimelineV2): TypeModel => {
  const by = Object.fromEntries(tl.scenes.map((x) => [x.id, x]));
  const ordered = scenes.filter((s) => by[s.id]);
  const resolve = (spec: unknown, sceneId: string, fb: number): number => {
    const r = /^(?:([\w-]+):)?([^\s+:-]+)([+-]\d+)?$/.exec(String(spec ?? ""));
    if (!r) return fb;
    const sid = r[1] ?? sceneId, t = by[sid];
    if (!t) return fb;
    const k = ordered.findIndex((s) => s.id === sid), next = ordered[k + 1] && by[ordered[k + 1].id];
    const base = r[2] === "start" ? t.startFrame : r[2] === "voice" ? t.voiceStartFrame : r[2] === "end" ? t.voiceEndFrame : r[2] === "exit" ? (next ? next.startFrame : tl.totalFrames) : (t.cues ?? []).find((q) => q.id === r[2])?.frame;
    return base === undefined || base === null ? fb : base + Number(r[3] ?? 0);
  };
  const m: TypeModel = { total: tl.totalFrames, layers: [], top: [] };
  ordered.forEach((s, i) => {
    const t = by[s.id];
    const p = (s.props ?? {}) as Record<string, any>;
    if (p.ground || !m.layers.length) m.layers.push({ ground: p.ground ?? "ink", at: i === 0 ? 0 : resolve(p.enterAt, s.id, t.startFrame), enter: i === 0 ? "cut" : p.enter ?? "wipe-up", items: [] });
    const layer = m.layers[m.layers.length - 1];
    // 這一幕旁白的逐字幀（字幕各句接起來）
    const full: string[] = [], fr: number[] = [];
    for (const l of t.lines ?? []) { const cs = [...l.text]; cs.forEach((c, k) => { full.push(c); fr.push((l as any).chars?.[k] ?? l.start); }); }
    const fullStr = full.join("");
    let ptr = 0;
    for (const it of (p.items ?? []) as Record<string, any>[]) {
      const at = (spec: unknown, fb: number) => resolve(spec, s.id, fb);
      const set: SetStep[] = (it.set ?? []).map((q: any) => ({ ...q, at: at(q.at, t.startFrame), dur: q.dur ?? T.motion.move })).sort((a: SetStep, b: SetStep) => a.at - b.at);
      const base = { ground: it.ground ?? layer.ground, die: it.until ? at(it.until, 1e9) : 1e9, exit: it.exit ?? "up", set };
      let item: TypeItem;
      if (it.kind === "block") {
        item = { ...base, kind: "block", born: at(it.at, t.startFrame), rect: it.rect, enter: it.enter ?? "wipe-r", color: it.color ?? "hot", t: "", x: 0, y: 0, size: 0, font: "zh", mode: "type", frames: [], ghostAt: 0 };
      } else {
        const chars = [...String(it.t)];
        let frames: number[];
        const mode = it.mode ?? "type";
        if (it.at !== undefined) {
          const a = at(it.at, t.voiceStartFrame), step = mode === "type" || mode === "ghost" ? it.step ?? T.motion.step : 0;
          frames = chars.map((_, k) => a + k * step);
        } else {
          // 跟著配音：在這一幕的旁白裡找這段字，逐字取幀；找不到的字（多加的標點）跟著前一個字
          const key = String(it.sync ?? it.t).replace(/[，。？！、：]+$/, "");
          let idx = fullStr.indexOf(key, ptr); if (idx < 0) idx = fullStr.indexOf(key);
          const kn = [...key].length;
          frames = chars.map((c, k) => (idx < 0 ? t.voiceStartFrame + k * 3 : fr[idx + Math.min(k, kn - 1)] - 2 + (k >= kn ? 2 * (k - kn + 1) : 0)));
          for (let k = 1; k < frames.length; k++) if (chars[k] !== " ") frames[k] = Math.max(frames[k], frames[k - 1] + (isCjk(chars[k]) ? 2 : 1));
          if (idx >= 0) ptr = idx + kn;
        }
        const ghostAt = mode === "ghost" ? at(it.ghostAt, t.startFrame) : 1e9;
        item = { ...base, kind: "text", t: String(it.t), x: it.x ?? 64, y: it.y, size: it.size, color: it.color ?? "fg", font: it.font ?? "zh", weight: it.weight, ls: it.ls, w: it.w, mode, frames, ghostAt, born: Math.min(frames[0] ?? 0, ghostAt), rect: [0, 0, 0, 0], enter: "",
          caret: it.caret ? { color: it.caret.color ?? "hot", until: at(it.caret.until, 1e9) } : undefined,
          strike: it.strike ? { at: at(it.strike.at, t.voiceEndFrame), color: it.strike.color ?? "hot" } : undefined,
          underline: it.underline ? { at: at(it.underline.at, t.voiceEndFrame), color: it.underline.color ?? "hot" } : undefined };
      }
      (it.layer === "top" ? m.top : layer.items).push(item);
    }
  });
  return m;
};

export const mix = (a: number, b: number, t: number) => a + (b - a) * t;

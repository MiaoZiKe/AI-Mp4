// 夜窗（stage: "talk"）的時間模型：把各幕 props 攤平成絕對幀。
// photo＝這一鏡的照片（name 對到 public/talk/<slug>/<name>.jpg；at 是換上的時間，沒寫＝幕開始）；
// grade＝調色（night｜warm）；words＝畫面上的字（number｜line｜windows｜sunny｜ask）。
// 時間只寫 cue id 或 start｜voice｜end｜exit ±N 幀（可加「幕id:」前綴）；元件不手填秒數。
import type { Scene, TimelineV2 } from "../../types";

export type TalkPhoto = { name: string; at: number; focus: [number, number]; push: "in" | "out" | "drift"; until: number };
export type TalkWord = { kind: string; text: string; at: number; until: number; lit?: number; count?: number; litAt?: number; claim?: string };
export type TalkGrade = { at: number; grade: string };
export type TalkModel = { total: number; photos: TalkPhoto[]; grades: TalkGrade[]; words: TalkWord[] };

export const buildTalk = (scenes: Scene[], tl: TimelineV2): TalkModel => {
  const by = Object.fromEntries(tl.scenes.map((x) => [x.id, x]));
  const ordered = scenes.filter((s) => by[s.id]);
  const resolve = (spec: unknown, sceneId: string, fb: number): number => {
    if (spec === undefined || spec === null) return fb;
    const r = /^(?:([\w-]+):)?([^\s+:-]+)([+-]\d+)?$/.exec(String(spec));
    if (!r) return fb;
    const sid = r[1] ?? sceneId, t = by[sid];
    if (!t) return fb;
    const k = ordered.findIndex((s) => s.id === sid), next = ordered[k + 1] && by[ordered[k + 1].id];
    const base = r[2] === "start" ? t.startFrame : r[2] === "voice" ? t.voiceStartFrame : r[2] === "end" ? t.voiceEndFrame
      : r[2] === "exit" ? (next ? next.startFrame : tl.totalFrames) : (t.cues ?? []).find((q: any) => q.id === r[2])?.frame;
    return base === undefined || base === null ? fb : base + Number(r[3] ?? 0);
  };
  const m: TalkModel = { total: tl.totalFrames, photos: [], grades: [], words: [] };
  ordered.forEach((s, i) => {
    const t = by[s.id];
    const p = (s.props ?? {}) as Record<string, any>;
    const exit = resolve("exit", s.id, tl.totalFrames);
    const shots = Array.isArray(p.photos) ? p.photos : p.photo ? [p.photo] : [];
    for (const ph of shots) {
      if (ph.hold) continue; // 沿用上一張，不換鏡
      m.photos.push({ name: ph.name, at: i === 0 && !ph.at ? 0 : resolve(ph.at, s.id, t.startFrame), focus: ph.focus ?? [0.5, 0.5], push: ph.push ?? "in", until: tl.totalFrames });
    }
    if (p.grade) m.grades.push({ at: i === 0 ? 0 : resolve(p.gradeAt, s.id, t.startFrame), grade: p.grade });
    for (const w of (p.words ?? []) as Record<string, any>[]) {
      m.words.push({ kind: w.kind, text: String(w.text ?? ""), at: resolve(w.at, s.id, t.startFrame), until: resolve(w.until, s.id, exit), lit: w.lit, count: w.count, litAt: w.litAt ? resolve(w.litAt, s.id, t.startFrame) : undefined, claim: w.claim });
    }
  });
  m.photos.sort((a, b) => a.at - b.at);
  m.photos.forEach((ph, k) => { ph.until = m.photos[k + 1]?.at ?? tl.totalFrames; });
  if (!m.grades.length || m.grades[0].at > 0) m.grades.unshift({ at: 0, grade: "night" });
  return m;
};

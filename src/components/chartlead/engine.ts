// 資料圖表主導的時間模型：把各幕 props 裡的時間（cue id 或 start｜voice｜end｜exit，可加 ±N 幀）換成絕對幀，
// 並從 script.json 頂層 chart.steps（關卡、日期、收盤值）算出每一段花的天數、年月與漲幅。元件不手填秒數、不手填數字。
import type { Scene, TimelineV2 } from "../../types";

export type Step = { level: number; label: string; date: string; close: number; t: number };
export type Leg = { i: number; days: number; gainPct: number; drawAt: number; targetAt: number; landAt: number };
export type ChartSpec = { kicker: string; title: string; note: string; barsTitle?: string; steps: Omit<Step, "t">[] };
export type ChartModel = {
  total: number; kicker: string; title: string; note: string; barsTitle: string;
  steps: Step[]; legs: Leg[];
  views: { at: number; from: number; to: number }[];
  gain?: { title: string; barsTitle: string; bracketAt: number; at: number; bars: number[] };
};

const DAY = 86400000;
export const ms = (d: string) => Date.parse(`${d}T00:00:00Z`);

export const buildModel = (scenes: Scene[], tl: TimelineV2, spec: ChartSpec): ChartModel => {
  const by = Object.fromEntries(tl.scenes.map((x) => [x.id, x]));
  const steps = spec.steps.map((s) => ({ ...s, t: ms(s.date) }));
  const m: ChartModel = { total: tl.totalFrames, kicker: spec.kicker, title: spec.title, note: spec.note, barsTitle: spec.barsTitle ?? "", steps, legs: [], views: [] };
  scenes.forEach((s, i) => {
    const t = by[s.id];
    if (!t) return;
    const next = scenes[i + 1] && by[scenes[i + 1].id];
    const at = (v: unknown, fb: number) => {
      const r = /^([^\s+-]+)([+-]\d+)?$/.exec(String(v ?? ""));
      if (!r) return fb;
      const base = r[1] === "start" ? t.startFrame : r[1] === "voice" ? t.voiceStartFrame : r[1] === "end" ? t.voiceEndFrame : r[1] === "exit" ? (next ? next.startFrame : tl.totalFrames) : (t.cues ?? []).find((q) => q.id === r[1])?.frame;
      return base === undefined || base === null ? fb : base + Number(r[2] ?? 0);
    };
    const p = (s.props ?? {}) as Record<string, any>;
    if (p.view) m.views.push({ at: m.views.length ? at(p.view.at, t.startFrame) : 0, from: ms(p.view.from), to: ms(p.view.to) });
    if (p.leg && steps[p.leg.i + 1]) {
      const a = steps[p.leg.i], b = steps[p.leg.i + 1];
      m.legs.push({ i: p.leg.i, days: Math.round((b.t - a.t) / DAY), gainPct: (100 * (b.level - a.level)) / a.level, drawAt: at(p.leg.drawAt, t.startFrame), targetAt: at(p.leg.targetAt, t.voiceStartFrame), landAt: at(p.leg.landAt, t.voiceEndFrame) });
    }
    if (p.gain) m.gain = { title: p.gain.title ?? "", barsTitle: p.gain.barsTitle ?? "", bracketAt: at(p.gain.bracketAt, t.voiceStartFrame), at: at(p.gain.at, t.voiceStartFrame), bars: (p.gain.bars ?? []).map((b: any) => at(b.at, t.voiceStartFrame)) };
  });
  m.legs.sort((a, b) => a.i - b.i);
  return m;
};

/** 兩個日期之間的整年、整月（日曆算法）與總天數 */
export const span = (a: number, b: number) => {
  const A = new Date(a), B = new Date(b);
  let mo = (B.getUTCFullYear() - A.getUTCFullYear()) * 12 + B.getUTCMonth() - A.getUTCMonth();
  if (B.getUTCDate() < A.getUTCDate()) mo -= 1;
  mo = Math.max(0, mo);
  return { y: Math.floor(mo / 12), m: mo % 12, days: Math.round((b - a) / DAY) };
};
/** 一段時間的讀法：滿一年寫「Y 年 M 個月」，不滿一年寫「N 天」 */
export const spanParts = (a: number, b: number, whole: number): { n: string; u: string }[] => {
  const s = span(a, b);
  if (Math.round((whole - a) / DAY) < 365) return [{ n: String(s.days), u: "天" }];
  return s.m ? [{ n: String(s.y), u: "年" }, { n: String(s.m), u: "個月" }] : [{ n: String(s.y), u: "年" }];
};
export const mix = (a: number, b: number, t: number) => a + (b - a) * t;
export const fmtDate = (t: number) => { const d = new Date(t); return `${d.getUTCFullYear()}/${d.getUTCMonth() + 1}/${d.getUTCDate()}`; };
export const comma = (n: number) => Math.round(n).toLocaleString("en-US");

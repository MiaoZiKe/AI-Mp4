// 檔案室式（stage: "dossier"）的時間模型：把各幕 props 裡的時間（cue id 或 start｜voice｜end｜exit ±N 幀）換成絕對幀。
// 一幕＝一鏡（panel）。props 裡名字是 at 或以 At 結尾的欄位都是時間；以 Ats 結尾的是時間陣列。元件不手填秒數。
// 換鏡：舊鏡在下一鏡開始後 hold 幀開始淡出（淡 out 幀）；新鏡的東西最早在舊鏡淡完前 2 幀進場（比這更早的時間會被往後夾）。
// 「國際新聞」版（頂層有 news）改用橫向擦切（opts.cut），見 DsOpts。
import type { Scene, TimelineV2 } from "../../types";
import { THEME_DOSSIER as T } from "../../theme";

export type DsShot = {
  id: string; index: number; start: number; inAt: number; outAt: number; end: number;
  panel: string; p: Record<string, any>; sources: string[];
};
export type DsModel = { total: number; shots: DsShot[]; /** 把頂層（不屬於某一幕）的時間寫法換成絕對幀，例如 "s03:res+4" */ time: (spec: unknown, fb?: number) => number };
/** cut＝「國際新聞」版的換鏡：舊鏡不淡出，下一鏡開始時一條橫向擦切把它換掉（outAt＝下一鏡開始）；
 *  新鏡的東西可以寫 start-N 提早做完（最多提早 news.motion.pre 幀），擦進來時畫面就是滿的。 */
export type DsOpts = { cut?: boolean };

const isAt = (k: string) => k === "at" || /At$/.test(k);
const isAts = (k: string) => /Ats$/.test(k);
const mapTimes = (v: any, time: (spec: unknown) => number): any => {
  if (Array.isArray(v)) return v.map((x) => mapTimes(x, time));
  if (v && typeof v === "object") return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, isAt(k) ? time(x) : isAts(k) && Array.isArray(x) ? x.map(time) : mapTimes(x, time)]));
  return v;
};

export const buildDossier = (scenes: Scene[], tl: TimelineV2, opts: DsOpts = {}): DsModel => {
  const by = Object.fromEntries(tl.scenes.map((x) => [x.id, x]));
  const ordered = scenes.filter((s) => by[s.id]);
  const M = T.motion;
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
  const shots: DsShot[] = [];
  ordered.forEach((s, i) => {
    const t = by[s.id], raw = (s.props ?? {}) as Record<string, any>;
    const next = ordered[i + 1] && by[ordered[i + 1].id];
    const start = i === 0 ? 0 : t.startFrame;
    const inAt = opts.cut ? start - T.news.motion.pre : i === 0 ? 0 : shots[i - 1].outAt + M.out - 2;
    const outAt = !next ? tl.totalFrames + 999 : opts.cut ? next.startFrame : next.startFrame + Number(raw.hold ?? M.hold);
    const p = mapTimes(raw, (spec) => Math.max(inAt, resolve(spec, s.id, start)));
    shots.push({ id: s.id, index: i, start, inAt, outAt, end: next ? next.startFrame : tl.totalFrames, panel: String(raw.panel), p, sources: s.sources ?? [] });
  });
  return { total: tl.totalFrames, shots, time: (spec, fb = 0) => resolve(spec, ordered[0]?.id ?? "", fb) };
};

/** 封面／靜態用：所有動作都已經做完的一鏡 */
export const staticShot = (s: Scene, index = 0): DsShot => {
  const raw = (s.props ?? {}) as Record<string, any>;
  return { id: s.id, index, start: -9999, inAt: -9999, outAt: 1e9, end: 1e9, panel: String(raw.panel), p: mapTimes(raw, () => -9999), sources: s.sources ?? [] };
};

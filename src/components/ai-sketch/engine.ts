// 白板手繪（stage: "sketch"）的時間模型：把各幕 props.items 攤平成絕對幀，鏡頭也排成關鍵幀。
// at 只寫 cue id 或 start｜voice｜end｜exit ±N 幀（可加「幕id:」前綴）；內容全部來自 script.json，元件不手填秒數。
import type { Scene, TimelineV2 } from "../../types";
import { THEME_SKETCH as T } from "../../theme";
import { makePen, strokesOf, type ShapeSpec } from "./rough";

export type SketchItem = {
  kind: "shape" | "text";
  at: number; dur: number; seed: number; color: string;
  // shape
  spec: ShapeSpec; width: number; marker: boolean;
  // text
  t: string; x: number; y: number; size: number; font: "zh" | "en"; rot: number; per: number;
};
export type CamKey = { at: number; dur: number; x: number; y: number; z: number };
export type SketchModel = { total: number; items: SketchItem[]; cam: CamKey[] };

export const buildSketch = (scenes: Scene[], tl: TimelineV2): SketchModel => {
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
  const m: SketchModel = { total: tl.totalFrames, items: [], cam: [] };
  let seed = 1;
  ordered.forEach((s) => {
    const t = by[s.id];
    const p = (s.props ?? {}) as Record<string, any>;
    const [ox, oy] = (p.origin ?? [0, 0]) as number[];
    for (const c of p.camera ? (Array.isArray(p.camera) ? p.camera : [p.camera]) : []) {
      const [x, y, z] = c.to as number[];
      m.cam.push({ at: c.at === undefined ? -1e6 : resolve(c.at, s.id, t.startFrame), dur: c.dur ?? T.motion.camera, x, y, z });
    }
    for (const it of (p.items ?? []) as Record<string, any>[]) {
      const at = resolve(it.at, s.id, t.startFrame);
      const base = { at, seed: seed++, color: String(it.color ?? "ink") };
      if (it.type === "text") {
        const n = [...String(it.t)].length;
        const per = it.end !== undefined ? Math.max(0.5, (resolve(it.end, s.id, at + n * T.motion.perChar) - at) / n) : it.per ?? T.motion.perChar;
        m.items.push({ ...base, kind: "text", dur: per * n, t: String(it.t), x: it.x + ox, y: it.y + oy, size: it.size ?? 64, font: it.font === "en" ? "en" : "zh", rot: it.rot ?? 0, per, spec: { type: "text" }, width: 0, marker: false });
        continue;
      }
      const b = it.box ? [...it.box] : undefined;
      if (b) { b[0] += ox; b[1] += oy; if (it.type === "line") { b[2] += ox; b[3] += oy; } }
      const spec: ShapeSpec = { ...it, type: String(it.type), box: b, pts: it.pts?.map((q: number[]) => [q[0] + ox, q[1] + oy]) };
      const marker = it.type === "hatch";
      const len = strokesOf(spec, makePen(base.seed, 0)).reduce((a, k) => a + k.len, 0);
      const dur = it.dur ?? (marker ? 8 : Math.max(T.motion.drawMin, Math.min(T.motion.drawMax, Math.round(len / T.motion.drawSpeed))));
      const width = typeof it.w === "number" ? it.w : marker ? T.stroke.marker : it.w === "bold" ? T.stroke.bold : T.stroke.pen;
      m.items.push({ ...base, kind: "shape", dur, spec, width, marker, t: "", x: 0, y: 0, size: 0, font: "zh", rot: 0, per: 0 });
    }
  });
  m.cam.sort((a, b) => a.at - b.at);
  if (!m.cam.length) m.cam.push({ at: -1e6, dur: 1, x: 0, y: 0, z: 1 });
  return m;
};

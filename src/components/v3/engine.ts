// styleVersion 3（桌面紙拼貼）引擎：把 script.json 各幕的 PaperScene props 攤平成「一張桌面上的絕對時間軸」。
// 純函式（不含 React）：鏡頭關鍵幀、切割墊開關、每張紙片的出生／移動／狀態／退場，全部換成絕對幀。
// 時間只從 timeline（配音對齊結果）來：at 寫 cue id 或 start／voice／end／exit，可加減幾幀（"cue+6"）。
import { Easing } from "remotion";
import type { Scene, SceneTimingV2, TimelineV2 } from "../../types";
import { CUE_LEAD } from "../../cue";
import { DUR, EASE, tween } from "../anim";
import { THEME_V3 as T } from "../../theme";

export type Layer = "desk" | "mat" | "near" | "screen" | "top";
export type Place = { x: number; y: number; w?: number; rot?: number };
export type EnterKind = "paste" | "slam" | "cut" | "wipe" | "left" | "right" | "top" | "bottom";
export type ExitKind = "lift" | "cut" | "left" | "right" | "top" | "bottom";
export type MoveSpec = { at?: string; to?: Partial<Place>; path?: [number, number][]; dur?: number; ease?: "move" | "enter" | "exit" | "linear" };
/** script.json 的一個項目：有 asset／type＝新紙片；只有 ref＝更新已在場上的紙片（移動、改狀態、退場） */
export type ItemSpec = Partial<Place> & {
  id?: string;
  ref?: string;
  type?: "img" | "strip" | "phone" | "path" | "pass" | "num" | "stack" | "bars" | "line";
  asset?: string;
  layer?: Layer;
  z?: number;
  at?: string;
  from?: EnterKind;
  /** 退場：這個項目是 ref 時寫 exit: true（在 at 退場）；新紙片寫 until："幕 id"（該幕開始時）、"幕 id.cue"、"end"（留到片尾）。沒寫 until＝本幕結束就退 */
  exit?: boolean;
  until?: string;
  to?: ExitKind | Partial<Place>;
  dur?: number;
  path?: [number, number][];
  ease?: MoveSpec["ease"];
  moves?: MoveSpec[];
  /** 狀態（type 自己解讀：手機螢幕、出餐口燈／鐵捲門…）；set＝之後依 cue 改狀態 */
  state?: Record<string, any>;
  set?: ({ at?: string } & Record<string, any>)[];
  /** false＝每幀更新（預設 desk／mat 的紙片每 2 幀更新一次，逐格感） */
  step?: boolean;
  /** 滑入／滑出（left｜right｜top｜bottom）的幀數與距離（px）：大色紙慢慢推進來、被抽走時用；沒寫＝THEME_V3.motion 的預設 */
  enterDur?: number;
  exitDur?: number;
  exitDist?: number;
  enterDist?: number;
  /** 滑入／滑出的緩動（預設：滑入 enter、有 enterDur 時 move；滑出 exit）。蓋場大紙用 "enter"：前快後慢，掃過主視覺約 6 幀 */
  enterEase?: MoveSpec["ease"];
  exitEase?: MoveSpec["ease"];
  [k: string]: any;
};
export type CameraKey = { to: [number, number, number]; at?: string; dur?: number };
export type PaperSceneProps = {
  /** 鏡頭：世界座標 (cx, cy) 對到畫面中心 (540, 960)，s＝縮放。陣列＝同一幕內多次移動 */
  camera?: CameraKey | CameraKey[];
  /** 重點推近：鏡頭進本幕時先停在 0.96 倍，念到這個 cue 推到 1（全片 ≤4 次） */
  punch?: string;
  /** true＝本幕頁首底下墊兩張小白紙（深色紙片從頁首後面經過時用，字才看得清） */
  headerPlate?: boolean | { at?: string; dur?: number; until?: string };
  /** 切割墊：true 蓋上（由上蓋下）、false 掀開（往上）；at 預設本幕開始 */
  mat?: boolean | { on: boolean; at?: string };
  items?: ItemSpec[];
};

export type Ev = { f: number; state: Record<string, any> };
export type StageItem = {
  key: string; idx: number; spec: ItemSpec; layer: Layer; z: number;
  born: number; from: EnterKind; die: number; to: ExitKind | Partial<Place>;
  base: Place; keys: { f: number; dur: number; to?: Partial<Place>; path?: [number, number][]; ease: (t: number) => number; step: boolean }[];
  events: Ev[]; step: boolean; sceneId: string;
};
export type Stage = {
  cam: { f: number; dur: number; cx: number; cy: number; s: number }[];
  punches: { start: number; camDur: number; at: number; end: number }[];
  mat: { f: number; on: boolean }[];
  items: StageItem[];
  total: number;
  warnings: string[];
};

const EASES = { move: EASE.move, enter: EASE.enter, exit: EASE.exit, linear: Easing.linear } as const;
const M = T.motion;

/** at 字串 → 絕對幀。cue 進場比聲音早 CUE_LEAD 幀；start＝本幕開始、voice＝開口、end＝收聲、exit＝下一幕開始 */
export const resolveAt = (at: string | undefined, t: SceneTimingV2, exitAbs: number, warn?: (m: string) => void, fallback?: number): number => {
  if (at === undefined || at === "") return fallback ?? t.startFrame;
  const m = /^([^\s+]+?)([+-]\d+)?$/.exec(String(at).trim());
  if (!m) { warn?.(`${t.id}: at 看不懂「${at}」`); return t.startFrame; }
  const off = m[2] ? Number(m[2]) : 0;
  const base = m[1];
  if (base === "start") return t.startFrame + off;
  if (base === "voice") return t.voiceStartFrame + off;
  if (base === "end") return t.voiceEndFrame + off;
  if (base === "exit") return exitAbs + off;
  const c = (t.cues ?? []).find((q) => q.id === base);
  if (!c || c.frame === null || c.frame === undefined) { warn?.(`${t.id}: 找不到 cue「${base}」（at: "${at}"），改用本幕開始`); return t.startFrame + off; }
  return (c.frame as number) - CUE_LEAD + off;
};

export const buildStage = (scenes: Scene[], timeline: TimelineV2): Stage => {
  const by = Object.fromEntries(timeline.scenes.map((x) => [x.id, x]));
  const ordered = scenes.filter((s) => by[s.id]);
  const warnings: string[] = [];
  const warn = (m: string) => warnings.push(m);
  const st: Stage = { cam: [], punches: [], mat: [], items: [], total: timeline.totalFrames, warnings };
  const byId: Record<string, StageItem> = {};
  const exitOf = (i: number) => (ordered[i + 1] ? by[ordered[i + 1].id].startFrame : timeline.totalFrames + 1);
  ordered.forEach((sc, i) => {
    const t = by[sc.id], exitAbs = exitOf(i);
    const p = (sc.component === "PaperScene" ? sc.props : {}) as PaperSceneProps;
    const at = (a?: string, fb?: number) => resolveAt(a, t, exitAbs, warn, fb);
    const cams = p.camera ? (Array.isArray(p.camera) ? p.camera : [p.camera]) : [];
    cams.forEach((c, k) => st.cam.push({ f: i === 0 && k === 0 && !c.at ? -1 : at(c.at), dur: i === 0 && k === 0 && !c.at ? 0 : c.dur ?? M.camera, cx: c.to[0], cy: c.to[1], s: c.to[2] }));
    if (p.punch) st.punches.push({ start: t.startFrame, camDur: cams[0]?.dur ?? M.camera, at: at(p.punch), end: exitAbs });
    if (p.mat !== undefined) { const m = typeof p.mat === "boolean" ? { on: p.mat } : p.mat; st.mat.push({ f: i === 0 && !("at" in m && m.at) ? -100 : at((m as any).at), on: m.on }); }
    for (const it of p.items ?? []) {
      const ease = EASES[it.ease ?? "move"];
      if (it.ref) {
        const tgt = byId[it.ref];
        if (!tgt) { warn(`${sc.id}: ref「${it.ref}」不存在（要先在前面的幕用 id 宣告）`); continue; }
        const f0 = at(it.at);
        const hasMove = it.path || ["x", "y", "w", "rot"].some((k) => it[k] !== undefined) || (it.to && typeof it.to === "object");
        const to: Partial<Place> = { ...(typeof it.to === "object" ? it.to : {}) };
        for (const k of ["x", "y", "w", "rot"] as const) if (it[k] !== undefined) to[k] = it[k];
        if (hasMove && !it.exit) tgt.keys.push({ f: f0, dur: it.dur ?? M.camera, to, path: it.path, ease, step: it.step ?? tgt.step });
        if (it.state) tgt.events.push({ f: f0, state: it.state });
        for (const s of it.set ?? []) { const { at: a, ...rest } = s; tgt.events.push({ f: at(a, f0), state: rest }); }
        for (const mv of it.moves ?? []) tgt.keys.push({ f: at(mv.at, f0), dur: mv.dur ?? M.camera, to: mv.to, path: mv.path, ease: EASES[mv.ease ?? "move"], step: tgt.step });
        if (it.exit) { tgt.die = f0; if (it.to !== undefined) tgt.to = it.to as any; }
        continue;
      }
      const layer: Layer = it.layer ?? "desk";
      const born = i === 0 && it.at === undefined ? -100 : at(it.at);
      let die = exitAbs;
      if (it.until === "end") die = Infinity;
      else if (it.until) {
        const [sid, cue] = it.until.split(".");
        const k = ordered.findIndex((x) => x.id === sid);
        if (k < 0) { warn(`${sc.id}: until 指到不存在的幕「${sid}」`); }
        else die = cue ? resolveAt(cue, by[sid], exitOf(k), warn) : by[sid].startFrame;
      }
      const step = it.step ?? (layer === "desk" || layer === "mat");
      const item: StageItem = {
        key: it.id ?? `${sc.id}#${st.items.length}`, idx: st.items.length, spec: it, layer, z: it.z ?? 0, sceneId: sc.id,
        born, from: it.from ?? (born < 0 ? "cut" : "paste"), die, to: (it.to as any) ?? "lift",
        base: { x: it.x ?? 540, y: it.y ?? 960, w: it.w, rot: it.rot ?? 0 }, keys: [], events: [{ f: -1e9, state: it.state ?? {} }], step,
      };
      for (const mv of it.moves ?? []) item.keys.push({ f: at(mv.at, born), dur: mv.dur ?? M.camera, to: mv.to, path: mv.path, ease: EASES[mv.ease ?? "move"], step });
      for (const s of it.set ?? []) { const { at: a, ...rest } = s; item.events.push({ f: at(a, born), state: rest }); }
      st.items.push(item);
      if (it.id) { if (byId[it.id]) warn(`${sc.id}: id「${it.id}」重複`); byId[it.id] = item; }
    }
  });
  for (const it of st.items) if (typeof it.to === "object" && Number.isFinite(it.die)) it.keys.push({ f: it.die, dur: M.camera, to: it.to, ease: EASE.move, step: it.step });
  st.cam.sort((a, b) => a.f - b.f);
  st.mat.sort((a, b) => a.f - b.f);
  for (const it of st.items) { it.keys.sort((a, b) => a.f - b.f); it.events.sort((a, b) => a.f - b.f); }
  if (!st.cam.length) st.cam.push({ f: -1, dur: 0, cx: 540, cy: 960, s: 1 });
  return st;
};

/** 鏡頭：依序折疊關鍵幀（EASE.move，不回彈）；punch＝進幕時退到 0.96、念到 cue 推回 1 */
export const cameraAt = (st: Stage, f: number) => {
  let { cx, cy, s } = st.cam[0];
  for (const k of st.cam.slice(1)) {
    if (f < k.f) break;
    const p = tween(f, k.f, k.dur, EASE.move);
    cx += (k.cx - cx) * p; cy += (k.cy - cy) * p; s += (k.s - s) * p;
  }
  let mult = 1;
  for (const p of st.punches) if (f >= p.start && f < p.end + DUR.s) mult *= 1 - (1 - M.punch) * (tween(f, p.start, p.camDur, EASE.move) - tween(f, p.at, DUR.s, EASE.enter));
  return { cx, cy, s: s * mult };
};
/** 切割墊蓋住的比例 0–1（由上蓋下／往上掀開各 12 幀）與目前方向 */
export const matAt = (st: Stage, f: number) => {
  let v = 0;
  for (const k of st.mat) { if (f < k.f) break; v += ((k.on ? 1 : 0) - v) * tween(f, k.f, DUR.m, EASE.move); }
  return v;
};

const lerp = (a: number, b: number, p: number) => a + (b - a) * p;
const along = (pts: [number, number][], p: number): [number, number] => {
  const seg = pts.slice(1).map((q, i) => Math.hypot(q[0] - pts[i][0], q[1] - pts[i][1]));
  const total = seg.reduce((a, b) => a + b, 0) || 1;
  let d = p * total;
  for (let i = 0; i < seg.length; i++) { if (d <= seg[i] || i === seg.length - 1) { const u = seg[i] ? Math.min(1, d / seg[i]) : 1; return [lerp(pts[i][0], pts[i + 1][0], u), lerp(pts[i][1], pts[i + 1][1], u)]; } d -= seg[i]; }
  return pts[pts.length - 1];
};
/** 逐格感：位置每 step 幀更新一次 */
export const stepped = (f: number, on: boolean) => (on ? Math.floor(f / M.step) * M.step : f);

/** 紙片在第 f 幀的位置（不含進退場位移）：折疊所有移動關鍵幀 */
export const placeAt = (it: StageItem, f: number): Required<Place> => {
  let cur = { x: it.base.x, y: it.base.y, w: it.base.w ?? 0, rot: it.base.rot ?? 0 };
  for (const k of it.keys) {
    const ff = stepped(f, k.step);
    if (ff < k.f) break;
    const p = tween(ff, k.f, k.dur, k.ease);
    const next = { ...cur };
    if (k.path) { const [x, y] = along([[cur.x, cur.y], ...k.path], p); next.x = x; next.y = y; }
    if (k.to) for (const key of ["x", "y", "w", "rot"] as const) if (k.to[key] !== undefined && !(k.path && (key === "x" || key === "y"))) next[key] = lerp(cur[key], k.to[key] as number, p);
    cur = next;
  }
  return cur;
};
/** 狀態：把 ≤f 的事件依序合併；since[key]＝該鍵最後一次被設定的幀 */
export const stateAt = (it: StageItem, f: number) => {
  const state: Record<string, any> = {}, since: Record<string, number> = {}, prev: Record<string, any> = {};
  for (const e of it.events) { if (e.f > f) break; for (const [k, v] of Object.entries(e.state)) { prev[k] = state[k]; state[k] = v; since[k] = e.f; } }
  return { state, since, prev };
};

const DIR: Record<string, [number, number]> = { left: [-1, 0], right: [1, 0], top: [0, -1], bottom: [0, 1] };
const rnd = (seed: number) => { const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
/**
 * 進退場與落定後抖動 → { dx, dy, rot, scale, opacity, wipe }（疊在 placeAt 之上）。
 *  paste：6 幀，從上方 14px、1.06 倍壓下來；slam：4 幀，1.14 倍重貼；left／right／top／bottom：8 幀滑入＋3–6 度旋轉落定、1.04→1
 *  wipe：遮罩由左擦出 8 幀；cut：直接在。退場 lift（4 幀由一側揭掉）或往某方向滑出（6 幀）。全部無過衝、不用透明度（沒有淡入淡出）。
 *  抖動：落定後每 9 幀換一次 ±1px、±0.3 度（固定 seed＝紙片序號）；ambient=false（AUDIT）時關掉。
 */
export const presence = (it: StageItem, f: number, ambient: boolean) => {
  const ff = stepped(f, it.step);
  let dx = 0, dy = 0, rot = 0, scale = 1, opacity = 1, wipe = 1, wipeOut = 0;
  const sign = rnd(it.idx + 1) > 0.5 ? 1 : -1;
  const dist = it.layer === "desk" || it.layer === "mat" ? M.slideDist * 1.6 : M.slideDist * 2.4;
  if (it.from === "paste") { const p = tween(ff, it.born, M.paste, EASE.enter); dy = -14 * (1 - p); scale = 1 + 0.06 * (1 - p); rot = sign * 2 * (1 - p); }
  else if (it.from === "slam") { const p = tween(ff, it.born, M.slam, EASE.exit); scale = 1 + 0.14 * (1 - p); rot = sign * 1.5 * (1 - p); }
  else if (it.from === "wipe") wipe = tween(f, it.born, M.wipe, EASE.move);
  else if (DIR[it.from]) { const p = tween(ff, it.born, it.spec.enterDur ?? M.slide, it.spec.enterEase ? EASES[it.spec.enterEase as keyof typeof EASES] : it.spec.enterDur ? EASE.move : EASE.enter); const [ux, uy] = DIR[it.from]; const d = it.spec.enterDist ?? dist; dx = ux * d * (1 - p); dy = uy * d * (1 - p); rot = sign * (3 + 3 * rnd(it.idx + 7)) * (1 - p); scale = 1 + 0.04 * (1 - p); }
  if (f >= it.die) {
    if (typeof it.to === "object") { /* 往指定位置退場：由 Cutout 另外處理 */ }
    else if (it.to === "lift") { const p = tween(f, it.die, 4, EASE.move); wipeOut = p; dy -= 8 * p; rot += sign * 2 * p; }   // 撕走：由一側揭掉（遮罩），不用透明度
    else if (DIR[it.to]) { const p = tween(ff, it.die, it.spec.exitDur ?? M.exit, it.spec.exitEase ? EASES[it.spec.exitEase as keyof typeof EASES] : EASE.exit); const [ux, uy] = DIR[it.to]; const d = it.spec.exitDist ?? dist; dx += ux * d * p; dy += uy * d * p; rot += sign * 4 * p; }
    else opacity = 0;
  }
  const settle = it.born + (it.spec.enterDur ?? M.slide);
  if (ambient && it.step && f > settle && f < it.die) {
    const k = Math.floor((f - settle) / M.jitterEvery);
    dx += Math.round((rnd(it.idx * 13 + k) - 0.5) * 2 * M.jitterPx); dy += Math.round((rnd(it.idx * 17 + k + 5) - 0.5) * 2 * M.jitterPx); rot += (rnd(it.idx * 19 + k + 9) - 0.5) * 2 * M.jitterDeg;
  }
  return { dx, dy, rot, scale, opacity, wipe, wipeOut };
};
/** 退場動畫長度（幀）：之後就不畫了 */
export const exitFrames = (it: StageItem) => (it.to === "cut" ? 0 : it.to === "lift" ? 4 : typeof it.to === "object" ? M.camera : (it.spec.exitDur ?? M.exit) + 2);
export const alive = (it: StageItem, f: number) => f >= it.born && f < it.die + exitFrames(it);

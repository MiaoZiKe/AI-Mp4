// HUD 片（Hud.tsx）的版面計算：縮放級數、模型在畫面上佔的範圍、標籤與蓋章避開模型、換幕時大卡片不重疊。
// 2026/11/15 從 Hud.tsx 拆出來（使用者回饋：「源極」「汲極」貼在模型底座上、「2 在哪？」壓在模型上、換幕時兩張卡半透明疊在一起）。
// 這裡只有純計算（不畫東西），所以 Hud.tsx 畫面與 scripts/three/layout-check.mjs（不開瀏覽器的版面檢查）用同一份：檢查到的就是畫出來的。
import { EASE, tween } from "../anim";
import { cameraFor, projectPoint, stateAt, type Label3D, type Model3D, type Overlay3D, type State3D } from "./engine";
import type { PartDef, ProductModel } from "./model";
import type { Scene, TimelineV2 } from "../../types";

export type Rect = { x0: number; y0: number; x1: number; y1: number };
export type Box = { W: number; X: number; INNER_W: number; STAGE_TOP: number; STAGE_H: number; HEADER_TOP?: number; CAP_TOP?: number };
export const hit = (a: Rect, b: Rect, pad = 0) => a.x0 < b.x1 + pad && b.x0 < a.x1 + pad && a.y0 < b.y1 + pad && b.y0 < a.y1 + pad;
export const area = (a: Rect, b: Rect) => Math.max(0, Math.min(a.x1, b.x1) - Math.max(a.x0, b.x0)) * Math.max(0, Math.min(a.y1, b.y1) - Math.max(a.y0, b.y0));
const clamp01 = (x: number) => Math.max(0, Math.min(1, x));

// ── 縮放（Powers of Ten） ──
export type HudLevel = { id: string; label: string; en?: string; field: string; ruler: string; art: string; handoff3D?: boolean };
export type HudSpec = { theme?: "dark"; levels: HudLevel[]; schematic?: { text?: string; zh?: string }; maxLabels?: number; layout?: string; smallPx?: number };
export type ZoomKey = { to: number; at: number; dur: number; drift?: boolean };
const UNIT: Record<string, number> = { m: 1, cm: 1e-2, mm: 1e-3, "µm": 1e-6, um: 1e-6, nm: 1e-9 };
/** "15 cm" → 0.15（公尺） */
export const meters = (s: string) => { const r = /^([\d.]+)\s*(m|cm|mm|µm|um|nm)$/.exec(s.trim()); return r ? Number(r[1]) * UNIT[r[2]] : NaN; };

/** at（cue id 或 start｜voice｜end｜exit ±N，可寫「幕id:cue」）→ 絕對幀；規則和 engine.ts 的 at 一樣 */
export const atOf = (tl: TimelineV2) => {
  const by = Object.fromEntries(tl.scenes.map((x, i) => [x.id, { ...x, exit: tl.scenes[i + 1]?.startFrame ?? tl.totalFrames }]));
  return (sceneId: string, spec: unknown, fb: number) => {
    const r = /^(?:([^\s:+-]+):)?([^\s:+-]+)([+-]\d+)?$/.exec(String(spec ?? ""));
    const t = r?.[1] ? by[r[1]] : by[sceneId];
    if (!r || !t) return fb;
    const base = r[2] === "start" ? t.startFrame : r[2] === "voice" ? t.voiceStartFrame : r[2] === "end" ? t.voiceEndFrame : r[2] === "exit" ? t.exit : (t.cues ?? []).find((q) => q.id === r[2])?.frame;
    return base === undefined || base === null ? fb : base + Number(r[3] ?? 0);
  };
};
export const zoomKeys = (scenes: Scene[], tl: TimelineV2, hud: HudSpec, zoomDur: number, drift: number): ZoomKey[] => {
  const at = atOf(tl), keys: ZoomKey[] = [];
  for (const s of scenes) for (const z of ([] as any[]).concat((s.props as any)?.zoom ?? [])) {
    const to = hud.levels.findIndex((l) => l.id === z.to), a = at(s.id, z.at, NaN);
    if (to < 0 || Number.isNaN(a)) continue;
    keys.push({ to, at: a, dur: z.dur ?? zoomDur, drift: !!z.drift });
  }
  keys.sort((a, b) => a.at - b.at);
  // drift：這一級慢慢推近（＋drift 級），一直推到下一個縮放開始
  return keys.flatMap((k, i) => (k.drift ? [{ to: k.to, at: k.at - 1, dur: 1 }, { to: k.to + drift, at: k.at, dur: Math.max(1, (keys[i + 1]?.at ?? k.at + 300) - k.at), drift: true }] : [k]));
};
/** 第 f 幀的縮放狀態：lv＝連續的級數，logField＝畫面寬度的 log10（公尺），mag＝相對第一級的倍率，handoff＝3D 出場的程度 */
export const zoomAt = (hud: HudSpec, keys: ZoomKey[], f: number) => {
  let lv = keys[0]?.to ?? 0;
  for (const k of keys) { const t = tween(f, k.at, k.dur, k.drift ? (x: number) => x : EASE.move); if (t <= 0) break; lv = lv + (k.to - lv) * t; }
  const lf = hud.levels.map((l) => Math.log10(meters(l.field)));
  const i = Math.max(0, Math.min(lf.length - 2, Math.floor(lv))), u = lv - i;
  const logField = lf.length > 1 ? lf[i] + (lf[i + 1] - lf[i]) * u : lf[0];
  const last = hud.levels.findIndex((l) => l.handoff3D);
  const handoff = last < 0 ? 0 : clamp01((lv - (last - 0.3)) / 0.3);
  return { lv, logField, mag: Math.pow(10, lf[0] - logField), handoff, level: hud.levels[Math.max(0, Math.min(hud.levels.length - 1, Math.round(lv)))] };
};

// ── 模型在畫面上的範圍 ──
/** 每一層的零件範圍（模型座標的半長；旋轉過的零件用外接球，保守） */
const boxCache = new WeakMap<ProductModel, Record<string, { min: number[]; max: number[] }>>();
const half = (p: PartDef): number[] => {
  const s = p.size, sc = p.scale ?? [1, 1, 1];
  let h: number[];
  if (p.shape === "cyl") h = [s[0], s[0], s[1] / 2];
  else if (p.shape === "tube") h = [s[0], s[0], (s[2] ?? 0.1) / 2];
  else if (p.shape === "sphere") h = [s[0], s[0], s[0]];
  else if (p.shape === "plane") h = [s[0] / 2, s[1] / 2, 0.01];
  else h = [s[0] / 2, s[1] / 2, (s[2] ?? 0.1) / 2];
  h = h.map((v, i) => v * (sc[i] ?? 1));
  if (p.rot && p.rot.some((r) => Math.abs(r) > 1)) { const m = Math.hypot(h[0], h[1], h[2]); h = [m, m, m]; }
  return h;
};
export const layerBoxes = (pr: ProductModel) => {
  const c = boxCache.get(pr);
  if (c) return c;
  const out: Record<string, { min: number[]; max: number[] }> = {};
  for (const p of pr.parts) {
    const h = half(p), pos = p.pos ?? [0, 0, 0];
    const offs = p.at?.length ? p.at : [[0, 0, 0]];
    const gx = p.grid ? ((p.grid.n[0] - 1) * p.grid.step[0]) / 2 : 0, gy = p.grid ? ((p.grid.n[1] - 1) * p.grid.step[1]) / 2 : 0;
    for (const o of offs) {
      const cx = pos[0] + (o[0] ?? 0), cy = pos[1] + (o[1] ?? 0), cz = (pos[2] ?? 0) + (o[2] ?? 0);
      const b = (out[p.layer] ??= { min: [1e9, 1e9, 1e9], max: [-1e9, -1e9, -1e9] });
      const lo = [cx - h[0] - gx, cy - h[1] - gy, cz - h[2]], hi = [cx + h[0] + gx, cy + h[1] + gy, cz + h[2]];
      for (let i = 0; i < 3; i++) { b.min[i] = Math.min(b.min[i], lo[i]); b.max[i] = Math.max(b.max[i], hi[i]); }
    }
  }
  boxCache.set(pr, out);
  return out;
};
/** 第 f 幀模型（不透明度 ≥ minO 的層）投影到畫面上的外接矩形；沒有可見的層回 null */
export const modelRect = (pr: ProductModel, s: State3D, minO = 0.3): Rect | null => {
  const cam = cameraFor(s), boxes = layerBoxes(pr);
  let r: Rect | null = null;
  for (const [id, b] of Object.entries(boxes)) {
    if ((s.layers[id]?.opacity ?? 1) < minO) continue;
    for (let i = 0; i < 8; i++) {
      const p = projectPoint(s, cam, id, [i & 1 ? b.max[0] : b.min[0], i & 2 ? b.max[1] : b.min[1], i & 4 ? b.max[2] : b.min[2]]);
      r = r ? { x0: Math.min(r.x0, p.x), y0: Math.min(r.y0, p.y), x1: Math.max(r.x1, p.x), y1: Math.max(r.y1, p.y) } : { x0: p.x, y0: p.y, x1: p.x, y1: p.y };
    }
  }
  return r;
};

// ── 文字與卡片的大小（估算；字型是 Noto Sans TC 粗體，全形字約 1em、半形約 0.58em） ──
export const textW = (t: string, px: number, spacing = 0.04) => [...String(t ?? "")].reduce((a, ch) => a + (/[⺀-￿]/.test(ch) && !/[▸·・]/.test(ch) ? 1 : ch === " " ? 0.3 : 0.6) * px + spacing * px, 0);
/** 蓋章（實心色塊＋外框）與小標（細框）的外接矩形，中心在 (x, y) */
export const stampRect = (o: Overlay3D, cx: number, cy: number): Rect => {
  const size = o.size ?? (o.style === "tag" ? 34 : 76);
  const w = o.style === "tag" ? textW(o.text, size) + 44 : textW(o.text, size) + size * 0.72 + 24, h = o.style === "tag" ? size * 1.3 + 18 : size * 1.42 + 24;
  // 微歪（rot）讓外接矩形大一點
  const k = o.style === "tag" ? 0 : Math.abs(Math.sin(((o.rot ?? -6) * Math.PI) / 180));
  const W = w + h * k, Hh = h + w * k;
  return { x0: cx - W / 2, y0: cy - Hh / 2, x1: cx + W / 2, y1: cy + Hh / 2 };
};
/** 大卡片（compare 對照卡、bars 橫條卡、card 提問卡）的外接矩形；其他型別回 null */
export const cardRect = (o: Overlay3D, b: Box): Rect | null => {
  const x0 = b.X, x1 = b.X + b.INNER_W;
  if (o.type === "compare") return { x0, x1, y0: o.y ?? 840, y1: (o.y ?? 840) + (o.h ?? 400) };
  if (o.type === "bars") { const n = (o.rows ?? []).length; return { x0, x1, y0: o.y ?? 640, y1: (o.y ?? 640) + 20 + 56 + n * (26 + 74 + 10 + 44) + 30 }; }
  if (o.type === "card") { const size = o.size ?? 100, lines = (o.lines ?? []).length; return { x0, x1, y0: o.y ?? 360, y1: (o.y ?? 360) + 36 + (o.kicker ? 66 : 0) + lines * size * 1.28 + (o.foot ? 58 : 0) + 44 }; }
  return null;
};

/** f0–f1 之間（每 3 幀取樣）模型範圍的聯集；3D 沒出場的幀不算 */
export const modelUnion = (m: Model3D, is3D: (f: number) => boolean, f0: number, f1: number): Rect | null => {
  let mr: Rect | null = null;
  for (let f = Math.max(0, f0); f <= Math.min(f1, m.total - 1); f += 3) {
    if (!is3D(f)) continue;
    const r = modelRect(m.product, stateAt(m, f));
    if (r) mr = mr ? { x0: Math.min(mr.x0, r.x0), y0: Math.min(mr.y0, r.y0), x1: Math.max(mr.x1, r.x1), y1: Math.max(mr.y1, r.y1) } : r;
  }
  return mr;
};
/** 在舞台裡找一個 w×h 的空位：中心點每 STEP px 掃一遍，不碰任何障礙（留 pad）的位置中選離 pref 最近的；全被擋就選重疊面積最小的 */
export const freeSpot = (w: number, h: number, pref: [number, number], obs: Rect[], area0: Rect, pad = 14): { c: [number, number]; cost: number } => {
  const STEP = 12, hw = w / 2, hh = h / 2;
  const cost = (cx: number, cy: number) => { const r = { x0: cx - hw, x1: cx + hw, y0: cy - hh, y1: cy + hh }; let c = 0; for (const q of obs) if (hit(r, q, pad)) c += 1 + area(r, { x0: q.x0 - pad, x1: q.x1 + pad, y0: q.y0 - pad, y1: q.y1 + pad }); return c; };
  const cl = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
  const px = cl(pref[0], area0.x0 + hw, area0.x1 - hw), py = cl(pref[1], area0.y0 + hh, area0.y1 - hh);
  let best: { c: [number, number]; cost: number; d: number } = { c: [px, py], cost: cost(px, py), d: 0 };
  if (best.cost === 0) return best;
  for (let cy = area0.y0 + hh; cy <= area0.y1 - hh; cy += STEP) for (let cx = area0.x0 + hw; cx <= area0.x1 - hw; cx += STEP) {
    const c = cost(cx, cy), d = Math.hypot(cx - pref[0], (cy - pref[1]) * 1.2);
    if (c < best.cost || (c === best.cost && d < best.d)) best = { c: [cx, cy], cost: c, d };
  }
  return best;
};

export const EXIT = 6;
/** HUD 外框常駐的讀數（Hud.tsx 的 HudFrame）：左上層級名、右上示意圖標示＋倍率＋FIELD、左下尺標。標籤與蓋章都要避開 */
export const hudReserved = (b: Box): Rect[] => {
  const x0 = b.X, x1 = b.W - b.X, y0 = b.STAGE_TOP + 14, y1 = b.STAGE_TOP + b.STAGE_H - 14;
  return [
    { x0: x0, y0: y0, x1: x0 + 350, y1: y0 + 110 },
    { x0: x1 - 470, y0: y0, x1: x1, y1: y0 + 206 },
    { x0: x0, y0: y1 - 92, x1: x0 + 300, y1: y1 },
  ];
};
/** 疊層的可見範圍（進場前一幀到退場完） */
export const visible = (o: Overlay3D, f: number) => f >= o.at - 1 && f < o.until + EXIT;

/**
 * 疊層的版面整理（畫面與檢查共用）：
 * 1. 避開模型與其他東西：3D 出場時（is3D）蓋章與小標若壓到模型（取它整段出現期間模型範圍的聯集）、標籤、或同時出現的其他蓋章，
 *    依序試「原位 → 模型下方 → 模型上方 → 右側 → 左側」（下方與上方再試左右對齊），用第一個不壓到任何東西的位置；都不行就用重疊最少的。
 *    位置整段固定，不跟著跳。疊層寫 avoid: false 就不挪（例如故意蓋在模型上的大卡片）。
 * 2. 換幕不疊：位置會重疊的兩個疊層（大卡片之間、蓋章之間），新的那個等舊的退場完才進場（at 往後挪，巢狀的 at 一起挪）。
 * obstacles(f0, f1)＝這段時間裡畫面上其他會擋到的框（標籤、儀表）。
 */
export const arrangeOverlays = (m: Model3D, b: Box, is3D: (f: number) => boolean, obstacles: (f0: number, f1: number) => Rect[] = () => []): Overlay3D[] => {
  const list = (m.overlays ?? []).map((o) => ({ ...o }));
  const rectOf = (o: Overlay3D) => (o.type === "stamp" ? stampRect(o, o.x ?? b.W / 2, o.y ?? b.STAGE_TOP + b.STAGE_H / 2) : cardRect(o, b));
  // 舞台下緣留 RULER_BAND（左下尺標與角框），蓋章不放進去
  const stage: Rect = { x0: b.X, x1: b.W - b.X, y0: b.STAGE_TOP + 16, y1: b.STAGE_TOP + b.STAGE_H - 16 };
  // 1. 避開模型與其他東西（照進場順序；已放好的蓋章也是障礙）
  const placed: Overlay3D[] = [];
  for (const o of [...list].sort((p, q) => p.at - q.at)) {
    if (o.type !== "stamp" || o.avoid === false) { placed.push(o); continue; }
    const f0 = o.at, f1 = Math.min(o.until + EXIT, m.total - 1);
    const mr = modelUnion(m, is3D, f0, f1);
    const obs: Rect[] = [...hudReserved(b), ...obstacles(f0, f1), ...placed.filter((p) => p.type === "stamp" && p.at < f1 && p.until > f0 + 4) /* 舊的幾幀內就退場的不算：第 2 步會讓新的等它退完 */.map((p) => rectOf(p) as Rect)];
    if (mr) obs.push(mr);
    const r0 = rectOf(o) as Rect, x = o.x ?? b.W / 2, y = o.y ?? (stage.y0 + stage.y1) / 2;
    const { c } = freeSpot(r0.x1 - r0.x0, r0.y1 - r0.y0, [x, y], obs, stage);
    if (Math.abs(c[0] - x) > 1 || Math.abs(c[1] - y) > 1) { o.x = c[0]; o.y = c[1]; o._moved = true; }
    placed.push(o);
  }
  // 2. 換幕不疊（依進場時間排）
  const order = [...list].sort((a, c) => a.at - c.at);
  for (let i = 0; i < order.length; i++) {
    const o = order[i], r = rectOf(o);
    if (!r) continue;
    for (let j = 0; j < i; j++) {
      const p = order[j], pr = rectOf(p);
      if (!pr || !hit(r, pr) || p.until >= o.until) continue; // 舊的比新的晚走（故意疊在一起的，例如蓋章疊在卡片上一直到一起退場）不動
      if (o.at < p.until + EXIT + 1 && o.at > p.at) {
        const d = p.until + EXIT + 1 - o.at;
        const bump = (v: any): any => Array.isArray(v) ? v.map(bump) : v && typeof v === "object" ? Object.fromEntries(Object.entries(v).map(([k, x]) => [k, (k === "at" || k === "hiAt" || k === "textAt") && typeof x === "number" ? Math.max(x, o.at + d) : bump(x)])) : v;
        Object.assign(o, bump({ ...o, at: undefined }), { at: o.at + d, _delayed: d });
      }
    }
  }
  return list;
};

/** 全片標籤的位置（畫面與檢查共用）：標籤卡整段固定不動（只有引線跟著零件走），位置用 freeSpot 找：
 *  避開它出現期間模型範圍的聯集、同時出現的其他標籤、obstacles（儀表），從 anchors 的 dx／dy 那一點往外找最近的空位。 */
export type PlacedLabel = { l: Label3D; an: { layer: string; p: number[]; dx: number; dy: number }; p0: { x: number; y: number }; x: number; y: number; left: boolean; rect: Rect };
export const placeLabels = (m: Model3D, b: Box, is3D: (f: number) => boolean, enPx: number, obstacles: (f0: number, f1: number) => Rect[] = () => []): PlacedLabel[] => {
  const A = m.product.anchors, out: PlacedLabel[] = [];
  const stage: Rect = { x0: b.X, x1: b.W - b.X, y0: b.STAGE_TOP + 16, y1: b.STAGE_TOP + b.STAGE_H - 16 };
  for (const l of [...m.labels].filter((l) => A[l.part]).sort((p, q) => p.at - q.at)) {
    const an = A[l.part], f0 = l.at + 8, s0 = stateAt(m, f0), p0 = projectPoint(s0, cameraFor(s0), an.layer, an.p);
    const f1 = Math.min(l.until + 6, m.total - 1), { w, h } = labelSize(l, enPx);
    const obs: Rect[] = [...hudReserved(b), ...obstacles(l.at, f1), ...out.filter((q) => q.l.at < f1 && q.l.until + 6 > l.at).map((q) => q.rect)];
    const mr = modelUnion(m, is3D, l.at, f1);
    if (mr) obs.push(mr);
    const pref: [number, number] = [p0.x + an.dx + (an.dx < 0 ? -w / 2 : w / 2), p0.y + an.dy];
    const { c } = freeSpot(w, h, pref, obs, stage, 18);
    const left = c[0] < p0.x, rect = { x0: c[0] - w / 2, x1: c[0] + w / 2, y0: c[1] - h / 2, y1: c[1] + h / 2 };
    out.push({ l, an, p0, x: left ? rect.x1 : rect.x0, y: c[1], left, rect });
  }
  return out;
};

/** 標籤卡的大小（中文 52px＋英文 30px） */
export const labelSize = (l: { text: string; en?: string }, enPx = 30) => ({ w: Math.max(textW(l.text, 52), textW(l.en ?? "", enPx, 0.06)) + 50, h: 52 * 1.25 + (l.en ? enPx * 1.3 : 0) + 22 });
/**
 * 標籤放在模型外面：先照 anchors 的 dx／dy 放，壓到模型就往同一側推出去；左右放不下就放到模型下方（再不行放上方），引線一路拉出去。
 * 回傳標籤卡的錨點（x＝靠模型那一側的邊，y＝中心）、left（卡片往左長）。
 */
export const placeLabel = (l: Label3D, p: { x: number; y: number }, an: { dx: number; dy: number }, mr: Rect | null, b: Box, enPx = 30) => {
  const { w, h } = labelSize(l, enPx), gap = 26;
  const top = b.STAGE_TOP + 24 + h / 2, bot = b.STAGE_TOP + b.STAGE_H - 16 - h / 2;
  let left = an.dx < 0;
  let x = left ? Math.max(b.X + w, p.x + an.dx) : Math.min(b.W - b.X - w, p.x + an.dx);
  let y = Math.max(top, Math.min(bot, p.y + an.dy));
  const rectAt = (x: number, y: number, left: boolean): Rect => (left ? { x0: x - w, x1: x, y0: y - h / 2, y1: y + h / 2 } : { x0: x, x1: x + w, y0: y - h / 2, y1: y + h / 2 });
  if (mr && hit(rectAt(x, y, left), mr, gap)) {
    const sx = left ? mr.x0 - gap : mr.x1 + gap;
    if (left ? sx - w >= b.X : sx + w <= b.W - b.X) x = sx;
    else {
      // 側邊放不下：放到模型下方（不夠就上方），水平位置照原本那一側但不超出畫面
      const below = mr.y1 + gap + h / 2, above = mr.y0 - gap - h / 2;
      y = below <= bot ? below : above >= top ? above : bot;
      x = left ? Math.max(b.X + w, Math.min(p.x + an.dx, b.W - b.X)) : Math.min(b.W - b.X - w, Math.max(b.X, p.x + an.dx));
    }
  }
  return { x, y, left, rect: rectAt(x, y, left), w, h };
};

/** 片尾卡動畫的時間表（片尾卡開始後第幾幀）。含義＝「圈子打開，你走進來」：
 *  draw 圓環從缺口對面往兩邊長、停在缺口（不轉）→ dot 橘點從缺口外側沿短弧線進來落定（[出發, 落定]，之後小回彈約 6 幀）→
 *  land 圓環接住的回應長度（線條微粗＋淡色細線往外擴一圈）→ name 頻道名 → line 底線 → slogan → trail 軌跡（每塊隔 2 幀）→ next「下一支」（LOGO 落定後才出）；
 *  settled＝全部落定（之後至少停 1 秒） */
export const ENDCARD = { draw: [2, 18], dot: [14, 27], land: 12, name: 30, line: 35, slogan: 38, trail: 42, next: 52, settled: 64 } as const;
export const ENDCARD_SETTLED = ENDCARD.settled;

/** 儀表（meter 動作寫了 x、y 的那種）的高度估算：標題列＋條＋低／高兩字 */
export const METER_H = 124;
/** 蓋章要避開的其他東西：這段時間裡出現的標籤（落定時的位置）與儀表 */
export const obstaclesOf = (m: Model3D, labels: PlacedLabel[]) => (f0: number, f1: number): Rect[] => {
  const out: Rect[] = labels.filter((p) => p.l.at < f1 && p.l.until + EXIT > f0).map((p) => p.rect);
  for (const [id, d] of Object.entries(m.product.actions ?? {})) {
    if (d.type !== "meter" || d.x === undefined || d.y === undefined) continue;
    if (m.runs.some((r) => r.id === id && r.at < f1 && r.until + r.ramp > f0)) out.push({ x0: d.x, y0: d.y, x1: d.x + (d.w ?? 330), y1: d.y + METER_H });
  }
  return out;
};

// HUD 片（Hud.tsx）的版面計算：縮放級數、模型在畫面上佔的範圍、標籤與蓋章避開模型、換幕時大卡片不重疊。
// 2026/11/15 從 Hud.tsx 拆出來（使用者回饋：「源極」「汲極」貼在模型底座上、「2 在哪？」壓在模型上、換幕時兩張卡半透明疊在一起）。
// 這裡只有純計算（不畫東西），所以 Hud.tsx 畫面與 scripts/three/layout-check.mjs（不開瀏覽器的版面檢查）用同一份：檢查到的就是畫出來的。
import { hasFlag, flagW, hasLogo, logoW, logoLabelH } from "./Brand";
import "./BrandWafer"; // 2026/11/24 韓國國旗等登記（標籤尺寸要算得到）
import { EASE, tween } from "../anim";
import { cameraFor, projectPoint, stateAt, type Label3D, type Model3D, type Overlay3D, type State3D } from "./engine";
import type { PartDef, ProductModel } from "./model";
import type { Scene, TimelineV2 } from "../../types";

export type Rect = { x0: number; y0: number; x1: number; y1: number; w?: number };
/** 主素材「中央區域」：中心不變、寬高各取一半（中間的 25%～75%）。2026/11/15 v6：蓋到這裡＝蓋到主體正中央（error），只蓋到外圈＝邊緣（warning） */
export const centerOf = (r: Rect): Rect => { const cx = (r.x0 + r.x1) / 2, cy = (r.y0 + r.y1) / 2, hw = (r.x1 - r.x0) / 4, hh = (r.y1 - r.y0) / 4; return { x0: cx - hw, x1: cx + hw, y0: cy - hh, y1: cy + hh }; };
/** 障礙物：主素材外圈是軟的（權重 0.001，真的放不下時可以蓋到邊緣），中央與其他東西是硬的（權重 HARD） */
export const HARD = 1e6;
export const mainObstacles = (r: Rect | null): Rect[] => (r ? [{ ...r, w: 0.001 }, { ...centerOf(r), w: HARD }] : []);
export type Box = { W: number; X: number; INNER_W: number; STAGE_TOP: number; STAGE_H: number; HEADER_TOP?: number; CAP_TOP?: number; BAND_TOP?: number; BAND_BOTTOM?: number; ART_FIT?: number };
export const hit = (a: Rect, b: Rect, pad = 0) => a.x0 < b.x1 + pad && b.x0 < a.x1 + pad && a.y0 < b.y1 + pad && b.y0 < a.y1 + pad;
export const area = (a: Rect, b: Rect) => Math.max(0, Math.min(a.x1, b.x1) - Math.max(a.x0, b.x0)) * Math.max(0, Math.min(a.y1, b.y1) - Math.max(a.y0, b.y0));
const clamp01 = (x: number) => Math.max(0, Math.min(1, x));

// ── 縮放（Powers of Ten） ──
export type HudLevel = { id: string; label: string; en?: string; field: string; ruler: string; art: string; handoff3D?: boolean; readout?: boolean; note?: string; noteAlways?: boolean; cues?: Record<string, string>; hideInside?: boolean };
/* readout: false（2026/11/15 tech-euv）：這一級不是「放大」出來的（例如整台曝光機的示意模型），不畫倍率、FIELD、尺標，改顯示 note（例如「整台約數公尺・示意」）；field 只用來排序與交棒 */
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
    // out＝停在這一級再往外拉幾分之一級（例如 0.75；圖變小、四周留出放卡片的空白），只用在最後一次拉回
    keys.push({ to: to - (z.out ?? 0), at: a, dur: z.dur ?? zoomDur, drift: !!z.drift });
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
  // 只繞 X 軸轉 90 度（圓柱立起來、圓環躺平）：y、z 對調，不用外接球（外接球會把磨輪這類零件的範圍估成 3.5 倍）
  if (p.rot && Math.abs(Math.abs(p.rot[0]) - 90) < 1 && Math.abs(p.rot[1] ?? 0) < 1 && Math.abs(p.rot[2] ?? 0) < 1) h = [h[0], h[2], h[1]];
  // 2026/11/17 tech-cooling：只繞 Y 軸轉 90 度（圓管橫躺沿 x 軸）：x、z 對調（長水管不再被估成一顆大球）
  else if (p.rot && Math.abs(Math.abs(p.rot[1] ?? 0) - 90) < 1 && Math.abs(p.rot[0] ?? 0) < 1 && Math.abs(p.rot[2] ?? 0) < 1) h = [h[2], h[1], h[0]];
  else if (p.rot && p.rot.some((r) => Math.abs(r) > 1)) { const m = Math.hypot(h[0], h[1], h[2]); h = [m, m, m]; }
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
  const bg = new Set(pr.layers.filter((l) => l.bg).map((l) => l.id));
  for (const [id, b] of Object.entries(boxes)) {
    if ((s.layers[id]?.opacity ?? 1) < minO || bg.has(id)) continue;
    // 2026/11/16 tech-offer（長桌上好幾個工作站、鏡頭沿桌子平移）：整層都在畫面外的不算，部分在畫面外的裁到畫面寬度
    let q: Rect | null = null;
    for (let i = 0; i < 8; i++) {
      const p = projectPoint(s, cam, id, [i & 1 ? b.max[0] : b.min[0], i & 2 ? b.max[1] : b.min[1], i & 4 ? b.max[2] : b.min[2]]);
      q = q ? { x0: Math.min(q.x0, p.x), y0: Math.min(q.y0, p.y), x1: Math.max(q.x1, p.x), y1: Math.max(q.y1, p.y) } : { x0: p.x, y0: p.y, x1: p.x, y1: p.y };
    }
    if (!q || q.x1 < 0 || q.x0 > 1080) continue;
    q = { ...q, x0: Math.max(0, q.x0), x1: Math.min(1080, q.x1) };
    r = r ? { x0: Math.min(r.x0, q.x0), y0: Math.min(r.y0, q.y0), x1: Math.max(r.x1, q.x1), y1: Math.max(r.y1, q.y1) } : q;
  }
  return r;
};

// ── 文字與卡片的大小（估算；字型是 Noto Sans TC 粗體，全形字約 1em、半形約 0.58em） ──
export const textW = (t: string, px: number, spacing = 0.04) => [...String(t ?? "")].reduce((a, ch) => a + (/[⺀-￿]/.test(ch) && !/[▸·・]/.test(ch) ? 1 : ch === " " ? 0.3 : 0.6) * px + spacing * px, 0);
/** 蓋章（實心色塊＋外框）與小標（細框）的外接矩形，中心在 (x, y) */
export const stampRect = (o: Overlay3D, cx: number, cy: number): Rect => {
  const size = o.size ?? (o.style === "tag" ? 34 : 76), tx = (o as any).countTo !== undefined ? String(o.text).replace("{n}", Math.max(Number((o as any).countTo), Number((o as any).countFrom ?? 0)).toLocaleString("en-US")) : o.text;
  const w = o.style === "tag" ? textW(tx, size) + 44 : textW(tx, size) + size * 0.72 + 24, h = o.style === "tag" ? size * 1.3 + 18 : size * 1.42 + 24;
  // 微歪（rot）讓外接矩形大一點
  const k = o.style === "tag" ? 0 : Math.abs(Math.sin(((o.rot ?? -6) * Math.PI) / 180));
  const W = w + h * k, Hh = h + w * k;
  return { x0: cx - W / 2, y0: cy - Hh / 2, x1: cx + W / 2, y1: cy + Hh / 2 };
};
/** 大卡片（compare 對照卡、bars 橫條卡、card 提問卡）的外接矩形；其他型別回 null */
export const cardRect = (o: Overlay3D, b: Box): Rect | null => {
  const x0 = b.X, x1 = b.X + b.INNER_W;
  if (o.type === "compare") return { x0, x1, y0: o.y ?? 840, y1: (o.y ?? 840) + (o.h ?? 400) };
  if (o.type === "section") return { x0: o.x ?? b.X, x1: (o.x ?? b.X) + (o.w ?? 600), y0: o.y ?? 900, y1: (o.y ?? 900) + (o.h ?? 300) };
  if (o.type === "bars" && o.compact) { const n = (o.rows ?? []).length; return { x0, x1, y0: o.y ?? 640, y1: (o.y ?? 640) + 4 + 16 + 54 + n * 70 + 20 }; }
  if (o.type === "bars") { const n = (o.rows ?? []).length; return { x0, x1, y0: o.y ?? 640, y1: (o.y ?? 640) + 4 + 20 + 64 + n * (26 + 80 + 10 + 44) + 30 }; }
  // 提問卡：上下內距 36＋44、小標約 90（含間距）、每行 size×1.28，再多留 30（字型行高比估的高；2026/11/15 實測 s18 的卡比估的高約 50px）
  if (o.type === "card") { const size = o.size ?? 100, lines = (o.lines ?? []).length; return { x0, x1, y0: o.y ?? 360, y1: (o.y ?? 360) + 4 + 36 + (o.kicker ? 90 : 0) + lines * size * 1.28 + (o.foot ? 58 : 0) + 44 + 30 }; }
  return null;
};

/** f0–f1 之間（每 3 幀取樣）模型範圍的聯集；3D 沒出場的幀不算 */
export const modelUnion = (m: Model3D, mainAt: (f: number) => Rect | null, f0: number, f1: number): Rect | null => {
  let mr: Rect | null = null;
  for (let f = Math.max(0, f0); f <= Math.min(f1, m.total - 1); f += 3) {
    const r = mainAt(f);
    if (r) mr = mr ? { x0: Math.min(mr.x0, r.x0), y0: Math.min(mr.y0, r.y0), x1: Math.max(mr.x1, r.x1), y1: Math.max(mr.y1, r.y1) } : r;
  }
  return mr;
};
/** 在舞台裡找一個 w×h 的空位：中心點每 STEP px 掃一遍，不碰任何障礙（留 pad）的位置中選離 pref 最近的；全被擋就選重疊面積最小的 */
export const freeSpot = (w: number, h: number, pref: [number, number], obs: Rect[], area0: Rect, pad = 14): { c: [number, number]; cost: number } => {
  // 成本＝Σ 權重×(1＋重疊面積)；0＝完全空白，<HARD＝只蓋到主素材外圈，≥HARD＝蓋到主體正中央或其他東西
  const STEP = 12, hw = w / 2, hh = h / 2;
  const cost = (cx: number, cy: number) => { const r = { x0: cx - hw, x1: cx + hw, y0: cy - hh, y1: cy + hh }; let c = 0; for (const q of obs) if (hit(r, q, pad)) c += (q.w ?? HARD) * (1 + area(r, { x0: q.x0 - pad, x1: q.x1 + pad, y0: q.y0 - pad, y1: q.y1 + pad })); return c; };
  const cl = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
  const px = cl(pref[0], area0.x0 + hw, area0.x1 - hw), py = cl(pref[1], area0.y0 + hh, area0.y1 - hh);
  // 排序：先比「有沒有蓋到硬的東西」（主體中央、讀數帶、其他標籤卡片），同一級再比「離原位多遠＋蓋到主素材外圈多少」：
  // 可以為了靠近零件蓋到一點主素材外圈，不要為了完全不碰而跑到畫面另一邊（引線會橫過模型）
  const score = (c: number, d: number) => Math.floor(c / HARD) * 1e9 + d + (c % HARD) * 20;
  const c0 = cost(px, py);
  let best: { c: [number, number]; cost: number; d: number; sc: number } = { c: [px, py], cost: c0, d: 0, sc: score(c0, 0) };
  if (best.cost === 0) return best;
  for (let cy = area0.y0 + hh; cy <= area0.y1 - hh; cy += STEP) for (let cx = area0.x0 + hw; cx <= area0.x1 - hw; cx += STEP) {
    const c = cost(cx, cy), d = Math.hypot(cx - pref[0], (cy - pref[1]) * 1.2), sc = score(c, d);
    if (sc < best.sc) best = { c: [cx, cy], cost: c, d, sc };
  }
  return best;
};

export const EXIT = 6;
/** HUD 外框常駐的讀數（Hud.tsx 的 HudFrame）：2026/11/15 起集中在舞台上下兩條讀數帶（上：層級名、倍率、FIELD；下：尺標、示意圖標示），
 *  主素材只畫在兩條帶子中間（artRegion）。沒有讀數帶的舊版面（BAND_TOP＝0）照舊用三個角落的框。 */
export const hudReserved = (b: Box): Rect[] => {
  const x0 = b.X, x1 = b.W - b.X, y0 = b.STAGE_TOP + 14, y1 = b.STAGE_TOP + b.STAGE_H - 14;
  if (b.BAND_TOP) return [{ x0, x1, y0: b.STAGE_TOP, y1: b.STAGE_TOP + b.BAND_TOP }, { x0, x1, y0: b.STAGE_TOP + b.STAGE_H - (b.BAND_BOTTOM ?? 0), y1: b.STAGE_TOP + b.STAGE_H }];
  return [
    { x0: x0, y0: y0, x1: x0 + 350, y1: y0 + 110 },
    { x0: x1 - 470, y0: y0, x1: x1, y1: y0 + 206 },
    { x0: x0, y0: y1 - 92, x1: x0 + 300, y1: y1 },
  ];
};
/** 主素材可以畫的範圍：舞台扣掉上下兩條讀數帶 */
export const artRegion = (b: Box): Rect => ({ x0: b.X, x1: b.W - b.X, y0: b.STAGE_TOP + (b.BAND_TOP ?? 0), y1: b.STAGE_TOP + b.STAGE_H - (b.BAND_BOTTOM ?? 0) });

// ── 主素材框（2026/11/15 Andy：「避免中間重要的素材被遮擋」） ──
/** 2D 縮放圖每一種的外框（HudArt.tsx 的座標，1000 單位＝舞台內寬 × 這一級的倍率） */
export const ART_BOX: Record<string, [number, number, number, number]> = { phone: [-220, -424, 220, 424], board: [-500, -330, 500, 330], die: [-500, -500, 500, 500], cells: [-500, -500, 500, 500], gates: [-453, -240, 453, 240], litho: [-450, -470, 450, 225], wafer: [-420, -433, 196, 183], none: [-1, -1, 1, 1] };
/** 2D 階段的主素材框：鏡頭現在對著的那一級（round(lv)）的圖，裁在舞台裡（沒有 yield 變形；畫面上看得到的部分另外再和 artRegion 取交集，見 visibleMain） */
export const artMainRect = (hud: HudSpec, z: { lv: number; logField: number }, b: Box): Rect | null => {
  const i = Math.max(0, Math.min(hud.levels.length - 1, Math.round(z.lv))), lvl = hud.levels[i], bx = ART_BOX[lvl.art];
  if (!bx) return null;
  const R = artRegion(b), cx = b.W / 2, cy = (R.y0 + R.y1) / 2, k = Math.pow(10, Math.log10(meters(lvl.field)) - z.logField), u = (b.INNER_W * k * (b.ART_FIT ?? 1)) / 1000;
  // 裁在整個舞台裡（不是 artRegion）：讓位時才會把整支手機放進空白，不會只放進被裁過的那一段
  const S0 = b.STAGE_TOP, S1 = b.STAGE_TOP + b.STAGE_H;
  const r = { x0: Math.max(0, cx + bx[0] * u), x1: Math.min(b.W, cx + bx[2] * u), y0: Math.max(S0, cy + bx[1] * u), y1: Math.min(S1, cy + bx[3] * u) };
  return r.x1 > r.x0 && r.y1 > r.y0 ? r : null;
};
/** 主素材讓位的變形：畫面上一點 p → p×s＋(ox, oy)（2D 圖與 3D 畫布用同一個） */
export type Yield = { s: number; ox: number; oy: number };
export const ID: Yield = { s: 1, ox: 0, oy: 0 };
export const applyY = (r: Rect, y: Yield): Rect => ({ x0: r.x0 * y.s + y.ox, x1: r.x1 * y.s + y.ox, y0: r.y0 * y.s + y.oy, y1: r.y1 * y.s + y.oy });
export type YieldTrigger = { at: number; until: number; rect: Rect; why: string };
/** 在 region 裡找一塊不碰任何 trigger 的最大空白（候選邊界＝各 trigger 的邊），讓主素材縮放平移進去；回傳變形 */
const fitInto = (main: Rect, region: Rect, trig: Rect[]): Yield => {
  const pad = 18, xs = [region.x0, region.x1], ys = [region.y0, region.y1];
  for (const t of trig) { xs.push(t.x0 - pad, t.x1 + pad); ys.push(t.y0 - pad, t.y1 + pad); }
  const X = [...new Set(xs)].filter((v) => v >= region.x0 && v <= region.x1).sort((a, b) => a - b), Y = [...new Set(ys)].filter((v) => v >= region.y0 && v <= region.y1).sort((a, b) => a - b);
  const mw = main.x1 - main.x0, mh = main.y1 - main.y0, mcx = (main.x0 + main.x1) / 2, mcy = (main.y0 + main.y1) / 2;
  let best = { s: 0, cx: mcx, cy: mcy, d: 1e9 };
  for (let a = 0; a < X.length; a++) for (let c = a + 1; c < X.length; c++) for (let e = 0; e < Y.length; e++) for (let g = e + 1; g < Y.length; g++) {
    const r = { x0: X[a], x1: X[c], y0: Y[e], y1: Y[g] };
    if (trig.some((t) => hit(r, t, pad - 1))) continue;
    const s = Math.min(1, (r.x1 - r.x0) / mw, (r.y1 - r.y0) / mh);
    // 放進這塊時離原位最近的中心
    const hw = (mw * s) / 2, hh = (mh * s) / 2, cx = Math.max(r.x0 + hw, Math.min(r.x1 - hw, mcx)), cy = Math.max(r.y0 + hh, Math.min(r.y1 - hh, mcy)), d = Math.hypot(cx - mcx, cy - mcy);
    if (s > best.s + 1e-3 || (Math.abs(s - best.s) <= 1e-3 && d < best.d)) best = { s, cx, cy, d };
  }
  if (best.s <= 0) return ID;
  return { s: best.s, ox: best.cx - mcx * best.s, oy: best.cy - mcy * best.s };
};
export const YIELD_LEAD = 20, YIELD_SMOOTH = 6;
/**
 * 主素材讓位：有東西（大卡片、鉤子大字、放不下的蓋章）要出現時，主素材先（at−20 幀起、at−8 幀到位，平滑後約 at−2 幀到位）縮小移到剩下的空白，東西退場後再回來。
 * rawMain(f)＝沒讓位時的主素材框；回傳 yieldAt(f)（已做 ±YIELD_SMOOTH 幀平滑）與 mainAt(f)（讓位後的主素材框）。
 */
export const makeYield = (b: Box, rawMain: (f: number) => Rect | null, triggers: YieldTrigger[], total: number) => {
  const R = artRegion(b), cache = new Map<number, Yield>(), sm = new Map<number, Yield>();
  const raw = (f: number): Yield => {
    if (cache.has(f)) return cache.get(f)!;
    let w = 0; const act: Rect[] = [];
    for (const t of triggers) { const k = tween(f, t.at - YIELD_LEAD, YIELD_LEAD - 8, EASE.move) * (1 - tween(f, t.until + EXIT + YIELD_SMOOTH, 12, EASE.move)); if (k > 0.001) { w = Math.max(w, k); act.push(t.rect); } }
    const main = w > 0 ? rawMain(f) : null;
    let y = ID;
    if (main && act.some((t) => hit(main, t))) { const t = fitInto(main, R, act); y = { s: 1 + (t.s - 1) * w, ox: t.ox * w, oy: t.oy * w }; }
    cache.set(f, y);
    return y;
  };
  const yieldAt = (f: number): Yield => {
    if (sm.has(f)) return sm.get(f)!;
    let s = 0, ox = 0, oy = 0, n = 0;
    for (let g = Math.max(0, f - YIELD_SMOOTH); g <= Math.min(total - 1, f + YIELD_SMOOTH); g++) { const y = raw(g); s += y.s; ox += y.ox; oy += y.oy; n++; }
    const y = n ? { s: s / n, ox: ox / n, oy: oy / n } : ID;
    sm.set(f, y);
    return y;
  };
  const mainAt = (f: number) => { const r = rawMain(f); return r ? applyY(r, yieldAt(f)) : null; };
  return { yieldAt, mainAt };
};
/** 畫面上真的看得到的主素材框：2D 圖畫在 artRegion（左右各放寬 40）裡，超出的被裁掉 */
export const visibleMain = (r: Rect | null, b: Box, is2D: boolean): Rect | null => {
  if (!r || !is2D || !b.BAND_TOP) return r;
  const R = artRegion(b), v = { x0: Math.max(R.x0 - 40, r.x0), x1: Math.min(R.x1 + 40, r.x1), y0: Math.max(R.y0, r.y0), y1: Math.min(R.y1, r.y1) };
  return v.x1 > v.x0 && v.y1 > v.y0 ? v : null;
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
export const arrangeOverlays = (m: Model3D, b: Box, mainAt: (f: number) => Rect | null, obstacles: (f0: number, f1: number) => Rect[] = () => [], fixed: Set<number> = new Set()): Overlay3D[] => {
  const list = (m.overlays ?? []).map((o, i) => ({ ...o, _i: i }) as Overlay3D);
  const rectOf = (o: Overlay3D) => (o.type === "stamp" ? stampRect(o, o.x ?? b.W / 2, o.y ?? b.STAGE_TOP + b.STAGE_H / 2) : cardRect(o, b));
  // 舞台下緣留 RULER_BAND（左下尺標與角框），蓋章不放進去
  const stage: Rect = b.BAND_TOP ? artRegion(b) : { x0: b.X, x1: b.W - b.X, y0: b.STAGE_TOP + 16, y1: b.STAGE_TOP + b.STAGE_H - 16 };
  // 1. 避開模型與其他東西（照進場順序；已放好的蓋章也是障礙）
  const placed: Overlay3D[] = [];
  for (const o of [...list].sort((p, q) => p.at - q.at)) {
    const isCard = ["compare", "bars", "card", "section"].includes(o.type);
    if ((o.type !== "stamp" && !isCard) || o.avoid === false || fixed.has(o._i)) { placed.push(o); continue; }
    const f0 = o.at, f1 = Math.min(o.until + EXIT, m.total - 1);
    const mr = modelUnion(m, mainAt, f0, f1);
    const others = [...placed, ...list.filter((p) => fixed.has(p._i) && p !== o && !placed.includes(p))];
    const obs: Rect[] = [...hudReserved(b), ...obstacles(f0, f1), ...others.filter((p) => (p.type === "stamp" || ["compare", "bars", "card", "section"].includes(p.type)) && p.at < f1 && p.until > f0 + 4) /* 舊的幾幀內就退場的不算：第 2 步會讓新的等它退完 */.map((p) => rectOf(p) as Rect), ...mainObstacles(mr)];
    const r0 = rectOf(o) as Rect;
    if (isCard) {
      // 卡片（全寬）：只上下找；主素材不動。找不到不蓋中央的位置時，卡片照原位、主素材在卡片出現期間退成背景（_backdrop）
      const y0 = r0.y0, hgt = r0.y1 - r0.y0, wid = r0.x1 - r0.x0;
      const { c, cost } = freeSpot(wid, hgt, [(r0.x0 + r0.x1) / 2, y0 + hgt / 2], obs, { ...stage, x0: r0.x0, x1: r0.x1 }, 10);
      if (cost >= HARD) o._backdrop = true;
      else { const ny = c[1] - hgt / 2; if (Math.abs(ny - y0) > 1) { if (o.type === "section") { o.y = (o.y ?? 0) + (ny - y0); o.x = (o.x ?? 0) + (c[0] - (r0.x0 + r0.x1) / 2); } else o.y = ny; o._moved = true; } if (cost > 0) o._edge = true; }
      placed.push(o);
      continue;
    }
    const x = o.x ?? b.W / 2, y = o.y ?? (stage.y0 + stage.y1) / 2;
    const { c, cost } = freeSpot(r0.x1 - r0.x0, r0.y1 - r0.y0, [x, y], obs, stage);
    if (Math.abs(c[0] - x) > 1 || Math.abs(c[1] - y) > 1) { o.x = c[0]; o.y = c[1]; o._moved = true; }
    if (cost >= HARD) o._center = true; else if (cost > 0) o._edge = true;
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
export type PlacedLabel = { l: Label3D; an: { layer: string; p: number[]; dx: number; dy: number }; p0: { x: number; y: number }; x: number; y: number; left: boolean; rect: Rect; cost?: number };
export const placeLabels = (m: Model3D, b: Box, mainAt: (f: number) => Rect | null, enPx: number, obstacles: (f0: number, f1: number) => Rect[] = () => []): PlacedLabel[] => {
  const A = m.product.anchors, out: PlacedLabel[] = [];
  const stage: Rect = b.BAND_TOP ? artRegion(b) : { x0: b.X, x1: b.W - b.X, y0: b.STAGE_TOP + 16, y1: b.STAGE_TOP + b.STAGE_H - 16 };
  for (const l of [...m.labels].filter((l) => A[l.part]).sort((p, q) => p.at - q.at)) {
    const an = A[l.part], f0 = l.at + 8, s0 = stateAt(m, f0), p0 = projectPoint(s0, cameraFor(s0), an.layer, an.p);
    const f1 = Math.min(l.until + 6, m.total - 1), { w, h } = labelSize(l, enPx);
    const obs: Rect[] = [...hudReserved(b), ...obstacles(l.at, f1), ...out.filter((q) => q.l.at < f1 && q.l.until + 6 > l.at).map((q) => q.rect)];
    obs.push(...mainObstacles(modelUnion(m, mainAt, l.at, f1)));
    const pref: [number, number] = [p0.x + an.dx + (an.dx < 0 ? -w / 2 : w / 2), p0.y + an.dy];
    // xy＝手動指定標籤卡中心（script.json 的 labels[].xy，2026/11/21：自動找的空位會蓋到 3D 光束／零件、引線穿過別張卡時用）
    const { c, cost } = (l as any).xy ? { c: (l as any).xy as [number, number], cost: 0 } : freeSpot(w, h, pref, obs, stage, 18);
    const left = c[0] < p0.x, rect = { x0: c[0] - w / 2, x1: c[0] + w / 2, y0: c[1] - h / 2, y1: c[1] + h / 2 };
    out.push({ l, an, p0, x: left ? rect.x1 : rect.x0, y: c[1], left, rect, cost });
  }
  return out;
};

/** 標籤卡的大小（中文 52px＋英文 30px） */
// 2026/11/24：標籤可帶公司 LOGO（多一列，高 LABEL_LOGO_H＋上下距 10）與國旗（英文前面，寬 flagW）——Brand.tsx
export const LABEL_LOGO_H = 46;
export const labelSize = (l: { text: string; en?: string; logo?: string; flag?: string }, enPx = 30) => {
  const fw = hasFlag(l.flag) ? flagW(l.flag as string, Math.round(enPx * 1.05)) + 12 : 0;
  const lh = hasLogo(l.logo) ? logoLabelH(l.logo as string, LABEL_LOGO_H) : 0, lw = lh ? logoW(l.logo as string, lh) + 12 : 0;
  return { w: Math.max(textW(l.text, 52), textW(l.en ?? "", enPx, 0.06) + fw, lw) + 50, h: 52 * 1.25 + (l.en || fw ? enPx * 1.3 : 0) + (lw ? lh + 16 : 0) + 22 };
};
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
export const ENDCARD = { draw: [2, 18], dot: [14, 27], land: 12, name: 30, line: 35, slogan: 38, trail: 42, next: 52, comment: 56, settled: 64 } as const;
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

/** 鉤子大字（第一幕 props.hook）的外接矩形（Hud.tsx 的 HudHook：小標＋大字底板） */
export const hookRect = (h: { title: string; kicker?: string; size?: number; top?: number }, b: Box): Rect => {
  const size = h.size ?? 128, w = textW(h.title, size, 0) + 44, top = h.top ?? 560, H = (h.kicker ? 40 + 14 + 14 : 0) + size * 1.18 + 26;
  return { x0: b.W / 2 - w / 2, x1: b.W / 2 + w / 2, y0: top, y1: top + H };
};
/**
 * 全套版面（Hud.tsx 與 layout-check 共用）：主素材框 → 第一輪讓位（鉤子、大卡片）→ 標籤 → 蓋章（找空位）→ 放不下的蓋章也加進讓位 → 第二輪讓位 → 其餘蓋章用新的主素材框重放。
 */
export const planHud = (m: Model3D, b: Box, hud: HudSpec, keys: ZoomKey[], enPx: number, hookOut: number) => {
  // 2026/11/15 v6（Andy：「物件非必要不用一直移動，原來那樣其實 OK 了，你這樣移動很奇怪」）：主素材不動、不縮放。
  // 2D 圖與 3D 畫布只套一個固定的放大（ART_FIT，繞 artRegion 中心），讓主素材撐滿舞台；卡片、蓋章、標籤找主素材旁的空白放。
  const total = m.total, is3D = (f: number) => zoomAt(hud, keys, f).handoff > 0.5;
  const fit = b.ART_FIT ?? 1, R = artRegion(b), cx = b.W / 2, cy = b.BAND_TOP ? (R.y0 + R.y1) / 2 : b.STAGE_TOP + b.STAGE_H / 2;
  const base3D: Yield = fit === 1 ? ID : { s: fit, ox: cx * (1 - fit), oy: cy * (1 - fit) };
  const mc = new Map<number, Rect | null>();
  const rawMain = (f: number) => { if (!mc.has(f)) { const r = is3D(f) ? modelRect(m.product, stateAt(m, f)) : artMainRect(hud, zoomAt(hud, keys, f), b); mc.set(f, r ? (is3D(f) ? applyY(r, base3D) : r) : null); } return mc.get(f) ?? null; };
  const hook = m.hook ? hookRect(m.hook as any, b) : null;
  const obsOf = (labels: PlacedLabel[]) => { const base = obstaclesOf(m, labels); return (f0: number, f1: number) => [...base(f0, f1), ...(hook && f0 < hookOut + EXIT ? [hook] : [])]; };
  // 標籤先讓出卡片（剖面圖、對照卡…）在腳本裡的位置
  const cardsAt = (f0: number, f1: number) => ((m.overlays ?? []) as Overlay3D[]).filter((o) => ["compare", "bars", "card", "section"].includes(o.type) && o.at < f1 && o.until + EXIT > f0).map((o) => cardRect(o, b)!).filter(Boolean);
  const labels = placeLabels(m, b, rawMain, enPx, (f0, f1) => [...obsOf([])(f0, f1), ...cardsAt(f0, f1)]);
  const overlays = arrangeOverlays(m, b, rawMain, obsOf(labels));
  // 卡片放不下（會蓋到主體正中央）時，主素材在卡片出現期間退成背景（不透明度降到 BACKDROP_O）
  const backs = overlays.filter((o) => o._backdrop);
  const dimAt = (f: number) => backs.reduce((a, o) => Math.max(a, tween(f, o.at - 8, 8, EASE.move) * (1 - tween(f, o.until, 8, EASE.move))), 0);
  return { overlays, labels, yieldAt: (f: number) => (is3D(f) ? base3D : ID), base3D, mainAt: rawMain, rawMain, is3D, dimAt, triggers: [] as YieldTrigger[] };
};
export const BACKDROP_O = 0.28;
/** 片尾卡的垂直配置（Hud.tsx 與 layout-check 共用）：v7 版面（有 FOOT_H）把整組 LOGO／名稱／slogan／下一支／留言等比拉開 15%，撐滿 y0（STAGE_TOP＋40）到字幕卡下緣 */
export const endcardGeom = (b: { STAGE_TOP: number; FOOT_H?: number }, tc: boolean) => {
  const sc = tc && b.FOOT_H ? 1.15 : 1, y0 = b.STAGE_TOP + 40, cy = tc && b.FOOT_H ? y0 + 334 : b.STAGE_TOP + (tc ? 330 : 300), dy = tc ? 40 : 0;
  const o = (v: number) => Math.round((v + (v >= 210 ? dy : 0)) * sc);
  return { sc, cy, o, logo: Math.round((tc ? 400 : 300) * (sc > 1 ? 1.1 : 1)), comment: cy + o(868) };
};

/** 片尾卡「透明圈」動畫（endCard.logoAnim: "transparent"，LogoAnims.tsx 的 Transparent）的時間表（片尾卡開始後第幾幀）：
 *  飛入 0–10、X 光掃描 11–25、各層撞合約 27／29／31／33、鎖定 lock＝34（橘點落進缺口＋粒子迸開，招牌音主音在這一幀）、橘點回彈約 39；
 *  頻道名從 34 起每 2 幀彈出一個字、光掃 40、底線與 slogan 44、軌跡 46 起每 2 幀、下一支 52、留言關鍵字 56；settled＝全部落定 */
export const ENDCARD_TC = { lock: 34, name: 34, nameStep: 2, sweep: 40, line: 44, slogan: 44, trail: 46, next: 52, comment: 56, settled: 64, dot: [34, 39] as [number, number] } as const;
export const endcardTimes = (logoAnim?: string) => (logoAnim === "transparent" ? ENDCARD_TC : ENDCARD);

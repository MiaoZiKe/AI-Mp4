// 深色科技 HUD ＋ Powers of Ten 縮放（2026/11/14 為 videos/short-tech 新增）。
// 只有 script.json 頂層寫了 hud 的片會走這裡（ThreeVideo.tsx 的 VideoThree／CoverThree 一開頭轉過來）；沒寫 hud 的舊片完全不受影響。
// 前段是 2D 縮放（SVG），縮到 handoff3D 那一級才掛 3D 畫布（同一個 ProductScene），所以前段每幀和一般畫面一樣便宜。
//
// 資料：
//   頂層 hud: { theme: "dark", levels: [{ id, label, en, field: "15 cm", ruler: "5 cm", art, handoff3D? }], schematic: { text, zh }, maxLabels }
//   每幕 props.zoom: [{ to: levelId, at, dur?, drift? }]：從 at 開始縮放到那一級（對數尺度補間＝看起來等速鑽進去）；drift＝在這一級慢慢推近，直到下一個縮放
//   每幕 props.measure: [{ from, to, text, color, at, until?, off? }]：HUD 尺寸線；from／to 是 model.anchors 的名字（跟著 3D 投影走）
//   每幕 props.overlay 的 type: "stamp"｜"card"（HUD 版的蓋章與下一支提問卡）；props.labels 與 3D 片相同（同畫面最多 hud.maxLabels 張）
// 顏色只讀 THEME_3D_HUD；鏡頭與 3D 狀態讀 engine.ts（和舊片同一套）。
import React, { useMemo } from "react";
import { AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import type { Scene, Script, TimelineV2 } from "../../types";
import { FONT_EN, FONT_ZH, FPS, LAYOUT_HUD as L, THEME_3D as T } from "../../theme";
import { H, setHudSkin, sm } from "./hudSkin";
import { EASE, tween } from "../anim";
import { splitParts } from "../Subtitle";
import { buildModel, setStageGeo, cameraFor, projectPoint, signalLevel, stateAt, type Model3D, type Overlay3D, type State3D } from "./engine";
import { col, fxOf, type ProductModel } from "./model";
import { Art } from "./HudArt";
import { ProductScene } from "./Scene";
import { LogoAnim, hasLogoAnim } from "./LogoAnims";

export type HudLevel = { id: string; label: string; en?: string; field: string; ruler: string; art: string; handoff3D?: boolean };
export type HudSpec = { theme?: "dark"; levels: HudLevel[]; schematic?: { text?: string; zh?: string }; maxLabels?: number };
export type ZoomKey = { to: number; at: number; dur: number; drift?: boolean };
export type Measure = { from: string; to: string; text: string; color?: string; at: number; until: number; off?: number };

const UNIT: Record<string, number> = { m: 1, cm: 1e-2, mm: 1e-3, "µm": 1e-6, um: 1e-6, nm: 1e-9 };
/** "15 cm" → 0.15（公尺） */
export const meters = (s: string) => { const r = /^([\d.]+)\s*(m|cm|mm|µm|um|nm)$/.exec(s.trim()); return r ? Number(r[1]) * UNIT[r[2]] : NaN; };
const clamp01 = (x: number) => Math.max(0, Math.min(1, x));

/** at（cue id 或 start｜voice｜end｜exit ±N，可寫「幕id:cue」）→ 絕對幀；規則和 engine.ts 的 at 一樣 */
const atOf = (tl: TimelineV2) => {
  const by = Object.fromEntries(tl.scenes.map((x, i) => [x.id, { ...x, exit: tl.scenes[i + 1]?.startFrame ?? tl.totalFrames }]));
  return (sceneId: string, spec: unknown, fb: number) => {
    const r = /^(?:([^\s:+-]+):)?([^\s:+-]+)([+-]\d+)?$/.exec(String(spec ?? ""));
    const t = r?.[1] ? by[r[1]] : by[sceneId];
    if (!r || !t) return fb;
    const base = r[2] === "start" ? t.startFrame : r[2] === "voice" ? t.voiceStartFrame : r[2] === "end" ? t.voiceEndFrame : r[2] === "exit" ? t.exit : (t.cues ?? []).find((q) => q.id === r[2])?.frame;
    return base === undefined || base === null ? fb : base + Number(r[3] ?? 0);
  };
};

export const zoomKeys = (scenes: Scene[], tl: TimelineV2, hud: HudSpec): ZoomKey[] => {
  const at = atOf(tl), keys: ZoomKey[] = [];
  for (const s of scenes) for (const z of ([] as any[]).concat((s.props as any)?.zoom ?? [])) {
    const to = hud.levels.findIndex((l) => l.id === z.to), a = at(s.id, z.at, NaN);
    if (to < 0 || Number.isNaN(a)) continue;
    keys.push({ to, at: a, dur: z.dur ?? H.motion.zoom, drift: !!z.drift });
  }
  keys.sort((a, b) => a.at - b.at);
  // drift：這一級慢慢推近（＋H.motion.drift 級），一直推到下一個縮放開始
  return keys.flatMap((k, i) => (k.drift ? [{ to: k.to, at: k.at - 1, dur: 1 }, { to: k.to + H.motion.drift, at: k.at, dur: Math.max(1, (keys[i + 1]?.at ?? k.at + 300) - k.at), drift: true }] : [k]));
};
export const measuresOf = (scenes: Scene[], tl: TimelineV2): Measure[] => {
  const at = atOf(tl), out: Measure[] = [];
  for (const s of scenes) for (const m of ([] as any[]).concat((s.props as any)?.measure ?? [])) out.push({ ...m, at: at(s.id, m.at, 1e9), until: m.until ? at(s.id, m.until, 1e9) : 1e9 });
  return out;
};

/** 第 f 幀的縮放狀態：lv＝連續的級數（2.5＝第 2 和第 3 級中間），logField＝畫面寬度的 log10（公尺），mag＝相對第一級的倍率 */
export const zoomAt = (hud: HudSpec, keys: ZoomKey[], f: number) => {
  let lv = keys[0]?.to ?? 0;
  for (const k of keys) { const t = tween(f, k.at, k.dur, k.drift ? (x: number) => x : EASE.move); if (t <= 0) break; lv = lv + (k.to - lv) * t; }
  const lf = hud.levels.map((l) => Math.log10(meters(l.field)));
  const i = Math.max(0, Math.min(lf.length - 2, Math.floor(lv))), u = lv - i;
  const logField = lf.length > 1 ? lf[i] + (lf[i + 1] - lf[i]) * u : lf[0];
  const last = hud.levels.findIndex((l) => l.handoff3D);
  // 交棒：縮到 handoff3D 那一級的最後一段，3D 模型淡入、2D 圖層淡出
  const handoff = last < 0 ? 0 : clamp01((lv - (last - 0.3)) / 0.3);
  return { lv, logField, mag: Math.pow(10, lf[0] - logField), handoff, level: hud.levels[Math.max(0, Math.min(hud.levels.length - 1, Math.round(lv)))] };
};
type Zoom = ReturnType<typeof zoomAt>;

/** 倍率讀數：×1、×10、×100、×10⁴…（≥10⁴ 用上標） */
const SUP = "⁰¹²³⁴⁵⁶⁷⁸⁹";
export const magText = (mag: number) => { const e = Math.round(Math.log10(Math.max(1, mag))); if (mag < 9500) { const v = Math.max(1, mag), p = Math.pow(10, Math.floor(Math.log10(v))); return `×${Math.round(v / p) * p}`; } return e < 4 ? `×${Math.round(Math.pow(10, e))}` : `×10${String(e).split("").map((d) => SUP[Number(d)]).join("")}`; };

const mono = (px: number, color: string = H.text, w = 600): React.CSSProperties => ({ fontFamily: `${H.font.mono}, ${FONT_EN}`, fontVariantNumeric: "tabular-nums", fontSize: px, color, fill: color, fontWeight: w, letterSpacing: "0.06em", whiteSpace: "nowrap" });
const zh = (px: number, color: string = H.text, w = 900): React.CSSProperties => ({ fontFamily: FONT_ZH, fontSize: px, color, fill: color, fontWeight: w, whiteSpace: "nowrap" });
/** 色塊上的字色：橘色塊可另用 onAmber（淺色皮膚：藍／紅塊上白字、橘塊上深字） */
const onC = (bg: string) => (bg === H.amber ? ((H as any).onAmber ?? H.onAccent) : H.onAccent);
export const hudAccent = (c?: string) => (c === "amber" ? H.amber : c === "coral" ? H.coral : c === "white" ? H.text : H.line);
const CX = L.W / 2, CY = L.STAGE_TOP + L.STAGE_H / 2;

/** 深色背景：底色＋細格線（每 60px，跟著縮放微微流動）＋舞台中心的柔光（3D 出場後加一點暖色） */
export const HudBackdrop: React.FC<{ f: number; lv: number; warm?: number }> = ({ f, lv, warm = 0 }) => {
  const g = 60, off = ((lv % 1) * g * 3 + f * 0.25) % g;
  return (
    <AbsoluteFill style={{ background: H.bg }}>
      <svg width={L.W} height={L.H} style={{ position: "absolute", inset: 0 }}>
        {Array.from({ length: Math.ceil(L.W / g) + 2 }, (_, i) => <line key={`v${i}`} x1={i * g - off} x2={i * g - off} y1={0} y2={L.H} stroke={H.grid} strokeWidth={1} />)}
        {Array.from({ length: Math.ceil(L.H / g) + 2 }, (_, i) => <line key={`h${i}`} y1={i * g - off} y2={i * g - off} x1={0} x2={L.W} stroke={H.grid} strokeWidth={1} />)}
      </svg>
      <div style={{ position: "absolute", left: 0, top: L.STAGE_TOP, width: L.W, height: L.STAGE_H, background: `radial-gradient(ellipse 60% 45% at 50% 50%, ${H.glow.center} 0%, rgba(0,0,0,0) 100%)` }} />
      {warm > 0.01 ? <div style={{ position: "absolute", left: 0, top: L.STAGE_TOP, width: L.W, height: L.STAGE_H, opacity: warm, background: `radial-gradient(ellipse 40% 30% at 50% 52%, ${H.glow.warm} 0%, rgba(0,0,0,0) 100%)` }} /> : null}
    </AbsoluteFill>
  );
};

/** 2D 縮放圖層：每一級一張圖，畫在舞台中心；大小＝那一級的 field ÷ 現在的 field。只畫在舞台框裡 */
export const ZoomArt: React.FC<{ hud: HudSpec; z: Zoom; f: number }> = ({ hud, z, f }) => {
  if (z.handoff >= 1) return null;
  return (
    <svg width={L.W} height={L.H} style={{ position: "absolute", inset: 0, opacity: 1 - z.handoff }}>
      <defs><clipPath id="hudStage"><rect x={0} y={L.STAGE_TOP} width={L.W} height={L.STAGE_H} /></clipPath></defs>
      <g clipPath="url(#hudStage)">
        {hud.levels.map((lvl, i) => {
          const k = Math.pow(10, Math.log10(meters(lvl.field)) - z.logField);
          // 裡面那一級（還很小）慢慢浮現；外面那一級等「下一級長到 0.4–0.9 倍畫面寬」才退掉（兩級差 100 倍以上時中間也不會空掉）
          const nx = hud.levels[i + 1], kin = nx ? Math.pow(10, Math.log10(meters(nx.field)) - z.logField) : k / 10;
          if (kin > 0.9 || k < 0.06) return null;
          const o = clamp01((k - 0.07) / 0.25) * clamp01((0.9 - kin) / 0.5);
          return <g key={lvl.id} transform={`translate(${CX} ${CY}) scale(${(L.INNER_W * k) / 1000})`} opacity={o}><Art kind={lvl.art} f={f} /></g>;
        })}
      </g>
    </svg>
  );
};

// 各級的圖在 HudArt.tsx（2026/11/14 第二版把每一級補細節）

/** HUD 外框：四角括號、掃描線（一道亮帶往下掃）、左下尺標、右上倍率讀數＋示意圖標示、中間十字準星、左上層級名 */
export const HudFrame: React.FC<{ f: number; hud: HudSpec; z: Zoom; camK?: number; quiet?: number }> = ({ f, hud, z, camK = 1, quiet = 0 }) => {
  const x0 = L.X, x1 = L.W - L.X, y0 = L.STAGE_TOP + 14, y1 = L.STAGE_TOP + L.STAGE_H - 14, b = H.bracket, s = H.stroke;
  const band = (f * (H.scan.sweep / 30)) % (y1 - y0 + H.scan.bandH);
  const lvl = z.level ?? hud.levels[0];
  // 尺標長度：ruler ÷ 目前 field × 畫面寬（縮放途中跟著伸縮）；3D 之後固定在那一級
  const rulerPx = Math.max(40, Math.min(L.INNER_W * 0.5, (meters(lvl.ruler) / Math.pow(10, z.logField)) * L.INNER_W * camK));
  // quiet＝提問卡出現時收掉層級名、倍率、FIELD（只留右上的示意圖標示，全片都在）
  const rq = 1 - quiet;
  // 讀數換級時閃一下（換字的那幾幀亮起來）
  const lvF = Math.abs(z.lv - Math.round(z.lv)) < 0.5 ? 1 : 0;
  const sc = hud.schematic;
  return (
    <svg width={L.W} height={L.H} style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
      {[[x0, y0, 1, 1], [x1, y0, -1, 1], [x0, y1, 1, -1], [x1, y1, -1, -1]].map(([x, y, sx, sy], i) => <path key={i} d={`M ${x} ${y + sy * b} V ${y} H ${x + sx * b}`} fill="none" stroke={H.line} strokeWidth={s.bold} />)}
      {Array.from({ length: Math.ceil((y1 - y0) / H.scan.gap) }, (_, i) => <line key={i} x1={x0} x2={x1} y1={y0 + i * H.scan.gap} y2={y0 + i * H.scan.gap} stroke={H.line} strokeOpacity={H.scan.opacity} strokeWidth={1} />)}
      <rect x={x0} y={y0 + band - H.scan.bandH} width={x1 - x0} height={Math.max(0, Math.min(H.scan.bandH, y1 - (y0 + band - H.scan.bandH)))} fill={H.line} opacity={H.scan.bandO} />
      {/* 右側刻度柱：縮放時往上流動 */}
      {Array.from({ length: 26 }, (_, i) => { const yy = y0 + 170 + ((i * 26 + z.lv * 260) % 676); return <line key={`r${i}`} x1={x1 - 16} x2={x1 - (i % 5 ? 26 : 40)} y1={yy} y2={yy} stroke={H.lineSoft} strokeWidth={2} />; })}
      <g stroke={H.line} strokeWidth={s.thin} opacity={0.8}>
        <line x1={CX - 30} x2={CX - 8} y1={CY} y2={CY} /><line x1={CX + 8} x2={CX + 30} y1={CY} y2={CY} />
        <line y1={CY - 30} y2={CY - 8} x1={CX} x2={CX} /><line y1={CY + 8} y2={CY + 30} x1={CX} x2={CX} />
      </g>
      <g transform={`translate(${x0 + 28} ${y1 - 34})`}>
        <line x1={0} x2={rulerPx} y1={0} y2={0} stroke={H.amber} strokeWidth={s.bold} />
        {Array.from({ length: H.ruler.ticks + 1 }, (_, i) => <line key={i} x1={(rulerPx * i) / H.ruler.ticks} x2={(rulerPx * i) / H.ruler.ticks} y1={0} y2={i % 5 ? -H.ruler.h / 2 : -H.ruler.h} stroke={H.amber} strokeWidth={s.mid} />)}
        <text x={0} y={-H.ruler.h - 12} style={mono(H.font.px.readout, H.amber)}>{lvl.ruler}</text>
      </g>
      {/* 讀數底板：縮放圖層從底下經過時字還讀得到 */}
      <rect x={x0 + 10} y={y0 + 10} width={340} height={100} fill={H.bg} opacity={H.plateO * rq} />
      <rect x={x1 - 470} y={y0 + 10} width={460} height={86 + 110 * rq} fill={H.bg} opacity={H.plateO} />
      {sc ? <text x={x1 - 24} y={y0 + 40} textAnchor="end" style={mono(28, H.text2, 500)}>{sc.text}</text> : null}
      {sc?.zh ? <text x={x1 - 24} y={y0 + 76} textAnchor="end" style={zh(28, H.text2, 500)}>{sc.zh}</text> : null}
      <text x={x1 - 24} y={y0 + 150} textAnchor="end" style={mono(H.font.px.big, H.text, 700)} opacity={(0.75 + 0.25 * lvF) * rq}>{magText(z.mag * camK)}</text>
      <text x={x1 - 24} y={y0 + 192} textAnchor="end" style={mono(H.font.px.readout, H.text2)} opacity={rq}>FIELD {lvl.field}</text>
      <text x={x0 + 28} y={y0 + 56} style={zh(H.font.px.label, H.line, 700)} opacity={rq}>{lvl.label}</text>
      <text x={x0 + 28} y={y0 + 96} style={mono(H.font.px.readout, H.text2)} opacity={rq}>{lvl.en ?? ""}</text>
    </svg>
  );
};

/** 3D 舞台（只在交棒之後掛上）；外圈 drop-shadow 當便宜的光暈（不是 3D bloom） */
const Stage3D: React.FC<{ s: State3D; model: ProductModel; o: number }> = ({ s, model, o }) => {
  const fx = fxOf(model);
  if (o <= 0.001) return null;
  return (
    <div style={{ position: "absolute", left: 0, top: L.STAGE_TOP, width: L.W, height: L.STAGE_H, opacity: o, filter: `drop-shadow(0 0 ${H.glow.rimPx}px ${H.glow.rim})` }}>
      <ThreeCanvas linear={false} shadows={false} width={L.W} height={L.STAGE_H} dpr={fx.dpr ?? 1} gl={{ antialias: !!fx.msaa, alpha: true }} camera={{ fov: T.camera.fov, near: 1, far: 600, position: [0, 0, 60] }}>
        <ProductScene model={model} s={s} />
      </ThreeCanvas>
    </div>
  );
};

/** 鉤子：第 0 幀就在的大字（深色底板），縮放開始時往上退場 */
const HudHook: React.FC<{ m: Model3D; f: number; out: number }> = ({ m, f, out }) => {
  if (!m.hook) return null;
  const k = tween(f, out, 8, EASE.exit);
  if (k >= 1) return null;
  const h = m.hook as { title: string; kicker?: string; size?: number; top?: number };
  return (
    <div style={{ position: "absolute", left: L.X, width: L.INNER_W, top: h.top ?? 560, opacity: 1 - k, transform: `translateY(${Math.round(-40 * k)}px)`, display: "flex", flexDirection: "column", alignItems: "center" }}>
      {h.kicker ? <div style={{ ...zh(40, onC(H.line), 900), background: H.line, padding: "6px 26px 8px", letterSpacing: "0.1em" }}>{h.kicker}</div> : null}
      <div style={{ ...zh(h.size ?? 128, H.text), lineHeight: 1.18, marginTop: 14, padding: "6px 22px 14px", background: H.hookPlate, borderTop: `3px solid ${H.line}`, borderBottom: `3px solid ${H.line}` }}>{h.title}</div>
    </div>
  );
};

/** 標籤：圓點釘在零件上、引線、深色小框（青藍或琥珀細框）。同畫面最多 max 張（多的照時間先後留最新的） */
const HudLabels: React.FC<{ m: Model3D; s: State3D; f: number; max: number }> = ({ m, s, f, max }) => {
  const cam = useMemo(() => cameraFor(s), [s]);
  const A = m.product.anchors;
  const on = m.labels.filter((l) => A[l.part] && f >= l.at - 2 && f < l.until + 6).slice(-max);
  return (
    <>
      {on.map((l, i) => {
        const an = A[l.part], p = projectPoint(s, cam, an.layer, an.p), c = hudAccent(l.color);
        const o = tween(f, l.at - 2, 5, EASE.enter) * (1 - tween(f, l.until, 6, EASE.exit));
        const left = an.dx < 0, estW = Math.max([...l.text].length * 52, (l.en ?? "").length * 17) + 56;
        const x = left ? Math.max(L.X + estW, p.x + an.dx) : Math.min(L.W - L.X - estW, p.x + an.dx), y = p.y + an.dy;
        const q = tween(f, l.at - 1, 9, EASE.move), kx = x + (left ? 30 : -30), len = Math.hypot(kx - p.x, y - p.y) + 30;
        return (
          <React.Fragment key={i}>
            <svg width={L.W} height={L.H} style={{ position: "absolute", inset: 0, opacity: o }}>
              <path d={`M${p.x.toFixed(1)} ${p.y.toFixed(1)} L${kx.toFixed(1)} ${y.toFixed(1)} L${x.toFixed(1)} ${y.toFixed(1)}`} fill="none" stroke={c} strokeWidth={3} strokeDasharray={`${len.toFixed(1)} ${len.toFixed(1)}`} strokeDashoffset={(len * (1 - q)).toFixed(1)} />
              <circle cx={p.x} cy={p.y} r={14 + 16 * tween(f, l.at - 2, 14, EASE.enter)} fill="none" stroke={c} strokeWidth={2} opacity={1 - tween(f, l.at + 8, 8, EASE.move)} />
              <circle cx={p.x} cy={p.y} r={7} fill={c} />
            </svg>
            <div style={{ position: "absolute", left: Math.round(x), top: Math.round(y), opacity: tween(f, l.at + 3, 6, EASE.enter) * (1 - tween(f, l.until, 6, EASE.exit)), transform: `translate(${left ? "-100%" : "0"}, -50%)`, background: H.panel, border: `3px solid ${c}`, padding: "6px 22px 10px", display: "flex", flexDirection: "column", alignItems: left ? "flex-end" : "flex-start" }}>
              <div style={{ ...zh(52, c), lineHeight: 1.25, letterSpacing: "0.04em" }}>{l.text}</div>
              {l.en ? <div style={mono(28, H.text2, 500)}>{l.en}</div> : null}
            </div>
          </React.Fragment>
        );
      })}
    </>
  );
};

/** HUD 尺寸線：兩個標註點投影到畫面，往旁邊（off，預設 70px）拉出延伸線，中間是兩頭有短擋的尺寸線，數字框貼在外側 */
const HudMeasures: React.FC<{ m: Model3D; s: State3D; f: number; list: Measure[] }> = ({ m, s, f, list }) => {
  const cam = useMemo(() => cameraFor(s), [s]);
  const A = m.product.anchors;
  return (
    <>
      {list.map((d, i) => {
        const a = A[d.from], b = A[d.to];
        if (!a || !b) return null;
        const o = tween(f, d.at, 5, EASE.enter) * (1 - tween(f, d.until, 6, EASE.exit));
        if (o <= 0) return null;
        const p = projectPoint(s, cam, a.layer, a.p), q = projectPoint(s, cam, b.layer, b.p), c = hudAccent(d.color);
        const dx = q.x - p.x, dy = q.y - p.y, len = Math.max(1, Math.hypot(dx, dy));
        // 往外推的方向：垂直於兩點連線；off 的正負決定哪一邊
        const nx = -dy / len, ny = dx / len, off = d.off ?? 70;
        const P = { x: p.x + nx * off, y: p.y + ny * off }, Q = { x: q.x + nx * off, y: q.y + ny * off };
        const g = tween(f, d.at, 10, EASE.move), E = { x: P.x + (Q.x - P.x) * g, y: P.y + (Q.y - P.y) * g };
        const tick = (X: { x: number; y: number }) => `M${(X.x - nx * 14 - (dx / len) * 0).toFixed(1)} ${(X.y - ny * 14).toFixed(1)} L${(X.x + nx * 14).toFixed(1)} ${(X.y + ny * 14).toFixed(1)}`;
        const mx = (P.x + Q.x) / 2 + nx * 64 * Math.sign(off), my = (P.y + Q.y) / 2 + ny * 64 * Math.sign(off);
        const pop = 1 + 0.12 * Math.sin(Math.PI * tween(f, d.at + 6, 10, EASE.move));
        return (
          <React.Fragment key={i}>
            <svg width={L.W} height={L.H} style={{ position: "absolute", inset: 0, opacity: o }}>
              <line x1={p.x} y1={p.y} x2={P.x + nx * 12 * Math.sign(off)} y2={P.y + ny * 12 * Math.sign(off)} stroke={c} strokeWidth={2} strokeDasharray="6 6" />
              <line x1={q.x} y1={q.y} x2={Q.x + nx * 12 * Math.sign(off)} y2={Q.y + ny * 12 * Math.sign(off)} stroke={c} strokeWidth={2} strokeDasharray="6 6" opacity={g} />
              <line x1={P.x} y1={P.y} x2={E.x} y2={E.y} stroke={c} strokeWidth={4} />
              <path d={tick(P)} stroke={c} strokeWidth={4} />
              {g > 0.98 ? <path d={tick(Q)} stroke={c} strokeWidth={4} /> : null}
              <circle cx={p.x} cy={p.y} r={5} fill={c} /><circle cx={q.x} cy={q.y} r={5} fill={c} opacity={g} />
            </svg>
            <div style={{ position: "absolute", left: Math.round(mx), top: Math.round(my), opacity: tween(f, d.at + 6, 5, EASE.enter) * o, transform: `translate(-50%, -50%) scale(${pop.toFixed(3)})`, ...mono(60, onC(c), 800), background: c, padding: "2px 18px 4px" }}>{d.text}</div>
          </React.Fragment>
        );
      })}
    </>
  );
};

/** 對照卡（示意）：左右各一張「順著電流方向看過去」的剖面，kind: "fin"＝鰭式（閘極包三面，底部連著基板）｜"gaa"＝奈米片（每一片四面都被閘極包住）。
 *  關閉時的漏電用幾顆小點表示（leak＝顆數；不畫成零）；字都來自 script.json。顏色讀 THEME_3D_HUD.art */
const HudCompare: React.FC<{ o: Overlay3D; f: number; k: number }> = ({ o, f, k }) => {
  const A = H.art, W = L.INNER_W, hgt = o.h ?? 400, sides = (o.sides ?? []) as { kind: string; title: string; sub?: string; wrap?: string; note?: string; leak?: number; color?: string }[];
  const cw = W / Math.max(1, sides.length), n = f - o.at;
  return (
    <div style={{ position: "absolute", left: L.X, top: o.y ?? 840, width: W, height: hgt, opacity: k, transform: `translateY(${Math.round(24 * (1 - k))}px)`, background: H.cardCompare, border: `2px solid ${H.lineSoft}`, boxSizing: "border-box" }}>
      {o.title ? <div style={{ position: "absolute", left: 20, top: 12, ...zh(30, onC(H.amber), 800), background: H.amber, padding: "2px 16px 4px", letterSpacing: "0.06em" }}>{o.title}</div> : null}
      {o.tag ? <div style={{ position: "absolute", right: 20, top: 16, ...zh(sm(26), H.text2, 500) }}>{o.tag}</div> : null}
      <svg width={W} height={hgt} style={{ position: "absolute", inset: 0 }}>
        <line x1={cw} x2={cw} y1={64} y2={hgt - 16} stroke={H.lineSoft} strokeWidth={2} strokeDasharray="8 8" />
        {sides.map((sd, i) => {
          const cx = cw * (i + 0.5), top = 150, base = hgt - 76, c = hudAccent(sd.color), show = tween(f, (sd as any).at ?? o.at + 4 + i * 8, 8, EASE.enter);
          const leak = sd.leak ?? 0;
          return (
            <g key={i} opacity={show}>
              {/* 基板與兩側的隔離氧化層 */}
              <rect x={cx - 150} y={base} width={300} height={30} fill={A.sub} />
              <rect x={cx - 150} y={base - 34} width={sd.kind === "fin" ? 132 : 100} height={34} fill={A.sti} /><rect x={cx + (sd.kind === "fin" ? 18 : 50)} y={base - 34} width={sd.kind === "fin" ? 132 : 100} height={34} fill={A.sti} />
              {sd.kind === "fin" ? (
                <>
                  {/* 鰭：一片直立的矽，底部直接連著基板；閘極只蓋住上面和兩側 */}
                  <rect x={cx - 18} y={top + 26} width={36} height={base - top - 26} fill={A.sheet} />
                  <path d={`M ${cx - 96} ${base - 34} V ${top} H ${cx + 96} V ${base - 34} H ${cx + 24} V ${top + 20} H ${cx - 24} V ${base - 34} Z`} fill={A.gate} />
                  <path d={`M ${cx - 21} ${base - 34} V ${top + 23} H ${cx + 21} V ${base - 34}`} fill="none" stroke={A.hk} strokeWidth={3} />
                </>
              ) : (
                <>
                  {/* 奈米片：三片橫躺的矽，每一片四面都被閘極包住；最下面那片和基板之間也隔著閘極 */}
                  <rect x={cx - 50} y={base - 34} width={100} height={34} fill={A.fin} />
                  <rect x={cx - 96} y={top} width={192} height={base - 34 - top} fill={A.gate} />
                  {[0, 1, 2].map((j) => { const y = top + 24 + j * ((base - 34 - top - 40) / 3); return <rect key={j} x={cx - 62} y={y} width={124} height={22} rx={5} fill={A.sheet} stroke={A.hk} strokeWidth={3} />; })}
                </>
              )}
              {/* 關閉時的漏電（示意）：沒被閘極包到的地方有幾顆小點一明一滅地漏過去 */}
              {range(leak).map((j) => { const ph = ((n + j * 9) % 30) / 30, yy = sd.kind === "fin" ? base - 30 + (j % 3) * 9 : base - 22, xx = sd.kind === "fin" ? cx - 10 + ((j * 7) % 20) : cx - 8 + j * 12; return <circle key={j} cx={xx} cy={yy} r={3 + 4 * Math.sin(Math.PI * ph)} fill={A.leak} opacity={(sd.kind === "fin" ? 0.95 : 0.45) * Math.sin(Math.PI * ph)} />; })}
              {leak > 0 && sd.note ? <><path d={`M ${cx + (sd.kind === "fin" ? 22 : 16)} ${base - 18} H ${cx + 108}`} stroke={A.leak} strokeWidth={2} strokeDasharray="5 5" opacity={0.9} /><text x={cx + 114} y={base - 9} style={zh(sm(26), A.leak, 700)}>{sd.note}</text></> : null}
              <text x={cx} y={98} textAnchor="middle" style={zh(40, c, 900)}>{sd.title}</text>
              {sd.sub ? <text x={cx} y={132} textAnchor="middle" style={mono(sm(24), H.text2, 500)}>{sd.sub}</text> : null}
              {sd.wrap ? <text x={cx} y={hgt - 14} textAnchor="middle" style={zh(32, H.text, 800)}>{sd.wrap}</text> : null}
            </g>
          );
        })}
      </svg>
    </div>
  );
};
const range = (n: number) => Array.from({ length: n }, (_, i) => i);

/** HUD 版的小儀表（model.actions 的 type: "meter"，由 props.run 觸發）：固定在畫面上的讀數條。條的長度＝source 那個動作這一幀的強度
 *  （和 3D 裡零件發光、光點流動讀同一份 engine 數值）；只標「低／高」這種字，不標數值 */
const HudMeters: React.FC<{ m: Model3D; s: State3D; f: number }> = ({ m, s }) => {
  const acts = m.product.actions ?? {};
  return (
    <>
      {Object.entries(acts).map(([id, d]) => {
        const op = s.ops[id];
        if (d.type !== "meter" || !op || op.k <= 0.01 || d.x === undefined || d.y === undefined) return null;
        const lv = d.source ? signalLevel(m.product, s, d.source) : op.g, c = hudAccent(d.accent), w = d.w ?? 330;
        return (
          <div key={id} style={{ position: "absolute", left: d.x, top: d.y, width: w, opacity: op.k, background: H.panel, border: `2px solid ${H.lineSoft}`, padding: "8px 14px 10px", boxSizing: "border-box" }}>
            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
              <div style={{ ...zh(30, H.text, 800) }}>{d.label}</div>
              {d.sym ? <div style={mono(28, c, 700)}>{d.sym}</div> : null}
            </div>
            <div style={{ position: "relative", height: 16, marginTop: 6, background: H.bg, border: `1.5px solid ${H.text3}` }}>
              <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: `${(100 * Math.max(0.03, lv)).toFixed(1)}%`, background: c }} />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 2 }}>
              <div style={{ ...zh(sm(24), lv < 0.5 ? H.text : H.text3, 700) }}>{d.lo ?? ""}</div>
              <div style={{ ...zh(sm(24), lv >= 0.5 ? c : H.text3, 700) }}>{d.hi ?? ""}</div>
            </div>
          </div>
        );
      })}
    </>
  );
};

/** 電流（model.actions 的 type: "stream"，由 props.run 觸發）：2D SVG 畫在 3D 投影位置上（每幀只多幾十個圓點，不增加 3D 成本）。
 *  電子沿每條 lane 由源極流到汲極；速度＝rate × drive（閘極電壓）的強度，位置是速度對時間的累加，所以電壓拿掉時電子會減速、停住，不會倒退或跳格。
 *  每顆電子＝實心圓（signal 色、底色描邊，淺色與深色皮膚都高對比）＋往後拖的短尾巴（長度跟速度成正比，看得出方向）；軌道是淡色虛線；
 *  field＝閘極到各片的電場線（虛線箭頭往下流動，強度跟著 drive）。示意，不是量測。 */
const runK = (r: { at: number; until: number; ramp: number; gain: number }, j: number) => tween(j, r.at, r.ramp, EASE.move) * (1 - tween(j, r.until, r.ramp, EASE.move)) * r.gain;
const HudStreams: React.FC<{ m: Model3D; s: State3D; f: number }> = ({ m, s, f }) => {
  const cam = useMemo(() => cameraFor(s), [s]);
  const acts = m.product.actions ?? {};
  const out: React.ReactNode[] = [];
  for (const [id, d] of Object.entries(acts)) {
    const op = s.ops[id];
    if (d.type !== "stream" || !op || op.k <= 0.01) continue;
    const run = m.runs.find((r) => r.id === id && f >= r.at - 1 && f <= r.until + r.ramp + 1);
    if (!run) continue;
    const drv = d.drive ? m.runs.filter((r) => r.id === d.drive) : [];
    const spd = (j: number) => (drv.length ? Math.max(...drv.map((r) => runK(r, j))) : runK(run, j));
    // 從觸發那一幀累加到現在：走了幾趟（速度 0 的幀不前進）
    let trips = 0;
    for (let j = run.at; j < f; j++) trips += (spd(j) * (d.rate ?? 0.8)) / FPS;
    const v = spd(f), c = col(m.product, d.color ?? "signal"), n = d.n ?? 6, sz = d.size ?? 9;
    const P = (pt: any) => { const lay = Array.isArray(pt) ? d.layer ?? "" : pt.layer ?? d.layer ?? ""; const p = Array.isArray(pt) ? pt : pt.p; return projectPoint(s, cam, lay, p); };
    (d.lanes ?? []).forEach((lane, li) => {
      const pts = lane.map(P);
      const seg = pts.slice(1).map((p, i) => Math.hypot(p.x - pts[i].x, p.y - pts[i].y)), total = seg.reduce((a, b) => a + b, 0);
      if (total < 1) return;
      const at = (u: number) => { let dd = Math.max(0, Math.min(1, u)) * total, k = 0; while (k < seg.length - 1 && dd > seg[k]) { dd -= seg[k]; k++; } const t = seg[k] ? dd / seg[k] : 0; return { x: pts[k].x + (pts[k + 1].x - pts[k].x) * t, y: pts[k].y + (pts[k + 1].y - pts[k].y) * t }; };
      out.push(<path key={`${id}-t${li}`} d={`M${pts.map((p) => `${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" L")}`} fill="none" stroke={c} strokeOpacity={0.35 * op.k} strokeWidth={3} strokeDasharray="4 10" />);
      for (let i = 0; i < n; i++) {
        const raw = trips - i / n - li * 0.13;
        if (raw < 0) continue;
        const u = raw - Math.floor(raw), e = Math.min(1, u * 12, (1 - u) * 12);
        const p = at(u), q = at(u - 0.05 - 0.09 * v);
        out.push(<line key={`${id}-q${li}-${i}`} x1={q.x.toFixed(1)} y1={q.y.toFixed(1)} x2={p.x.toFixed(1)} y2={p.y.toFixed(1)} stroke={c} strokeWidth={sz * 0.9} strokeLinecap="round" opacity={0.35 * op.k * e * Math.min(1, v * 3)} />);
        out.push(<circle key={`${id}-p${li}-${i}`} cx={p.x.toFixed(1)} cy={p.y.toFixed(1)} r={sz} fill={c} stroke={H.bg} strokeWidth={2.5} opacity={op.k * e} />);
      }
      if (d.field && v > 0.02) {
        const a = P(d.field.from), mid = at(0.5), len = Math.hypot(mid.x - a.x, mid.y - a.y), ux = (mid.x - a.x) / len, uy = (mid.y - a.y) / len;
        const ex = mid.x - ux * (sz + 6), ey = mid.y - uy * (sz + 6), o = 0.85 * v * op.k;
        out.push(<line key={`${id}-f${li}`} x1={a.x} y1={a.y} x2={ex} y2={ey} stroke={col(m.product, "vg")} strokeWidth={4} strokeDasharray="10 8" strokeDashoffset={(-f * 2).toFixed(0)} opacity={o} />);
        out.push(<path key={`${id}-fh${li}`} d={`M${ex} ${ey} L${ex - ux * 16 - uy * 9} ${ey - uy * 16 + ux * 9} L${ex - ux * 16 + uy * 9} ${ey - uy * 16 - ux * 9} Z`} fill={col(m.product, "vg")} opacity={o} />);
      }
    });
  }
  if (!out.length) return null;
  return <svg width={L.W} height={L.H} style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>{out}</svg>;
};

/** HUD 版的疊層：stamp 蓋章（實心色塊、微歪、先大後小）、card 下一支提問卡（深色框＋四角括號） */
const HudOverlays: React.FC<{ m: Model3D; f: number }> = ({ m, f }) => (
  <>
    {(m.overlays ?? []).map((o: Overlay3D, i) => {
      if (f < o.at - 1) return null;
      const k = tween(f, o.at, 5, EASE.enter) * (1 - tween(f, o.until, 6, EASE.exit));
      if (k <= 0) return null;
      const c = hudAccent(o.color);
      if (o.type === "stamp" && o.style === "tag") {
        // 小標：細框深底（不是蓋章），說明這個數字是量誰的
        return <div key={i} style={{ position: "absolute", left: o.x ?? CX, top: o.y ?? CY, opacity: k, transform: `translate(-50%, -50%) translateY(${Math.round(10 * (1 - k))}px)`, ...zh(o.size ?? 34, c, 700), background: H.panel, border: `2px solid ${c}`, padding: "6px 20px 8px", letterSpacing: "0.04em" }}>{o.text}</div>;
      }
      if (o.type === "stamp") {
        const size = o.size ?? 76, slam = 1 + 0.6 * (1 - tween(f, o.at, 6, EASE.enter)) + 0.05 * Math.sin(Math.PI * tween(f, o.at + 6, 8, EASE.move));
        return (
          <div key={i} style={{ position: "absolute", left: o.x ?? CX, top: o.y ?? CY, opacity: k, transform: `translate(-50%, -50%) rotate(${o.rot ?? -6}deg) scale(${slam.toFixed(3)})` }}>
            <div style={{ ...zh(size, onC(c)), background: c, outline: `3px solid ${c}`, outlineOffset: 8, padding: `${Math.round(size * 0.08)}px ${Math.round(size * 0.36)}px ${Math.round(size * 0.14)}px`, letterSpacing: "0.04em", lineHeight: 1.2 }}>{o.text}</div>
          </div>
        );
      }
      if (o.type === "legend") {
        // 圖例：色塊＋名稱（色塊顏色讀 model.palette 的名字，和 3D 零件同一份）
        const items = (o.items ?? []) as { text: string; swatch: string }[], cols = o.cols ?? 2, px = sm(o.size ?? 26), cw = o.colW ?? 222;
        return (
          <div key={i} style={{ position: "absolute", left: o.x ?? L.X, top: o.y ?? 1070, opacity: k, background: H.panel, border: `2px solid ${H.lineSoft}`, padding: "10px 14px 12px", display: "grid", gridTemplateColumns: `repeat(${cols}, ${cw}px)`, rowGap: 6, columnGap: 6 }}>
            {items.map((it, j) => (
              <div key={j} style={{ display: "flex", alignItems: "center", gap: 10, opacity: tween(f, o.at + j * 2, 5, EASE.enter) }}>
                <div style={{ width: px * 0.8, height: px * 0.8, background: col(m.product, it.swatch), border: `1.5px solid ${H.text3}`, flex: "none" }} />
                <div style={{ ...zh(px, H.text, 700), lineHeight: 1.2 }}>{it.text}</div>
              </div>
            ))}
          </div>
        );
      }
      if (o.type === "compare") return <HudCompare key={i} o={o} f={f} k={k} />;
      if (o.type === "bars") {
        // 橫條對照（示意或廠商公布值）：rows: [{ label, v（0–1）, v2?（範圍的另一端，畫成斜線段）, color?, text, at?, textAt? }]；字都來自 script.json
        const rows = (o.rows ?? []) as { label: string; v: number; v2?: number; color?: string; text?: string; at?: number; textAt?: number }[], W = L.INNER_W, bw = W - 88;
        return (
          <div key={i} style={{ position: "absolute", left: L.X, top: o.y ?? 640, width: W, opacity: k, transform: `translateY(${Math.round(24 * (1 - k))}px)`, background: H.cardCompare, border: `2px solid ${H.lineSoft}`, boxSizing: "border-box", padding: "20px 44px 30px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              {o.title ? <div style={{ ...zh(38, onC(H.line), 800), background: H.line, padding: "4px 20px 6px", letterSpacing: "0.04em" }}>{o.title}</div> : <div />}
              {o.tag ? <div style={{ ...zh(30, H.text2, 500) }}>{o.tag}</div> : null}
            </div>
            {rows.map((r, j) => {
              const at = r.at ?? o.at + 6 + j * 10, g = tween(f, at, 16, EASE.move), sh = tween(f, at - 2, 6, EASE.enter), cc = r.color ? hudAccent(r.color) : H.text2, tx = tween(f, r.textAt ?? at + 12, 6, EASE.enter);
              const pop = 1 + 0.14 * Math.sin(Math.PI * tween(f, r.textAt ?? at + 12, 10, EASE.move));
              return (
                <div key={j} style={{ marginTop: 26, opacity: sh }}>
                  <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
                    <div style={{ ...zh(40, H.text, 800) }}>{r.label}</div>
                    <div style={{ ...zh(r.color ? 60 : 44, cc, 900), opacity: tx, transform: `scale(${pop.toFixed(3)})`, transformOrigin: "right center" }}>{r.text ?? ""}</div>
                  </div>
                  <div style={{ position: "relative", width: bw, height: 44, marginTop: 10, background: H.bg, border: `2px solid ${H.text3}`, boxSizing: "border-box" }}>
                    <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: `${(100 * r.v * g).toFixed(1)}%`, background: cc }} />
                    {r.v2 !== undefined ? <div style={{ position: "absolute", left: `${(100 * r.v * g).toFixed(1)}%`, top: 0, bottom: 0, width: `${(100 * (r.v2 - r.v) * g).toFixed(1)}%`, background: `repeating-linear-gradient(135deg, ${cc} 0 6px, transparent 6px 12px)` }} /> : null}
                  </div>
                </div>
              );
            })}
          </div>
        );
      }
      if (o.type === "card") {
        const lines = (o.lines ?? []) as string[], size = o.size ?? 100, hiT = o.hiAt ?? o.at + 8, under = tween(f, hiT, 12, EASE.move);
        const W = L.INNER_W, bk = 44;
        return (
          <div key={i} style={{ position: "absolute", left: L.X, top: o.y ?? 360, width: W, opacity: k, transform: `translateY(${Math.round(30 * (1 - k))}px)`, background: H.card, border: `2px solid ${H.lineSoft}`, padding: "36px 44px 44px", boxSizing: "border-box" }}>
            <svg width={W} height={20} style={{ position: "absolute", left: -2, top: -2, overflow: "visible" }}>
              <path d={`M0 ${bk} V0 H${bk}`} fill="none" stroke={H.line} strokeWidth={4} /><path d={`M${W - bk} 0 H${W} V${bk}`} fill="none" stroke={H.line} strokeWidth={4} />
            </svg>
            {o.kicker ? <div style={{ display: "inline-block", ...zh(36, onC(H.amber), 800), background: H.amber, padding: "6px 24px 8px", letterSpacing: "0.1em", marginBottom: 16 }}>{o.kicker}</div> : null}
            {lines.map((ln, j) => {
              const hi = o.hi && ln.includes(o.hi) ? ln.split(o.hi) : null;
              return (
                <div key={j} style={{ ...zh(size, H.text), lineHeight: 1.28 }}>
                  {hi ? <>{hi[0]}<span style={{ position: "relative", color: under > 0.3 ? H.amber : H.text }}>{o.hi}<span style={{ position: "absolute", left: 0, bottom: 2, height: 10, width: `${(100 * under).toFixed(1)}%`, background: H.amber }} /></span>{hi[1]}</> : ln}
                </div>
              );
            })}
            {o.foot ? <div style={{ ...mono(32, H.line, 600), marginTop: 18, fontFamily: `${H.font.mono}, ${FONT_ZH}` }}>NEXT ▸ {o.foot}</div> : null}
          </div>
        );
      }
      return null;
    })}
  </>
);

/** 頁首：左＝方框標誌＋頻道名，右＝細框標籤，下面一條琥珀進度線 */
const HudHeader: React.FC<{ name: string; tag: string; total: number; f: number }> = ({ name, tag, total, f }) => (
  <>
    <div style={{ position: "absolute", left: L.X, right: L.X, top: L.HEADER_TOP, height: L.HEADER_H, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        {(H as any).mark === "ring" ? <svg width={46} height={46} viewBox="18 16 64 64"><path d={RING_ARC} fill="none" stroke={H.line} strokeWidth={9} strokeLinecap="round" /><circle cx={67.68} cy={32.32} r={6.6} fill={H.amber} /></svg> : <svg width={46} height={46} viewBox="0 0 46 46"><rect x={3} y={3} width={40} height={40} fill="none" stroke={H.line} strokeWidth={3} /><rect x={15} y={15} width={16} height={16} fill={H.amber} /></svg>}
        <div style={{ ...zh(40, H.text), letterSpacing: "0.04em" }}>{(H as any).light ? <>{name.slice(0, -1)}<span style={{ color: H.line }}>{name.slice(-1)}</span></> : name}</div>
      </div>
      <div style={{ ...zh(28, H.line, 700), ...((H as any).light ? { background: H.bg2, borderRadius: 14, padding: "8px 24px" } : { border: `2px solid ${H.line}`, padding: "6px 22px" }), letterSpacing: "0.08em" }}>{tag}</div>
    </div>
    {(H as any).light ? <div style={{ position: "absolute", left: 0, top: 0, width: L.W, height: 14, background: `linear-gradient(90deg, ${H.line} 0 84%, ${H.amber} 84% 100%)` }} /> : null}
    <div style={{ position: "absolute", left: L.X, top: L.PROGRESS_TOP - 8, width: L.INNER_W, height: 3, background: H.lineSoft }}>
      <div style={{ width: `${(100 * Math.min(1, f / Math.max(1, total - 1))).toFixed(2)}%`, height: 3, background: H.amber }} />
    </div>
  </>
);

/** 開口圈標誌（100×100 座標，圓心 50,50、半徑 25；圓點在 -45° 的缺口上） */
const RING_ARC = "M74.69 46.09 A25 25 0 1 1 53.91 25.31";
/** 片尾卡的標誌動畫（使用者 2026/11/15：片尾 LOGO 要有動畫）。n＝片尾卡第幾幀，全部只看幀數（可重現）：
 *  2–20 幀圓弧自己描出來 → 16–34 幀橘點從圓弧起點繞圓心轉進缺口、落定時回彈 → 34–52 幀一圈淡淡的脈衝往外擴 → 之後慢慢呼吸。 */
const RingMarkAnim: React.FC<{ n: number; size: number }> = ({ n, size }) => {
  const draw = tween(n, 2, 18, EASE.move);
  const orb = tween(n, 16, 18, EASE.move), ang = (-45 - 300 * (1 - orb)) * (Math.PI / 180);
  const land = n - 34, bounce = land < 0 ? 0.55 + 0.45 * tween(n, 16, 6, EASE.enter) : 1 + 0.28 * Math.exp(-land / 5) * Math.cos(land / 1.6);
  const pulse = tween(n, 34, 18, EASE.move), breathe = n > 52 ? 1 + 0.04 * Math.sin((n - 52) / 7) : 1;
  const dx = 50 + 25 * Math.cos(ang), dy = 50 + 25 * Math.sin(ang);
  return (
    <g transform={`scale(${size / 100}) translate(-50 -50)`}>
      {pulse > 0 && pulse < 1 ? <circle cx={50} cy={50} r={25 + 22 * pulse} fill="none" stroke={H.line} strokeWidth={3 * (1 - pulse) + 0.5} opacity={0.5 * (1 - pulse)} /> : null}
      <path d={RING_ARC} pathLength={1} fill="none" stroke={H.line} strokeWidth={9} strokeLinecap="round" strokeDasharray="1 1" strokeDashoffset={(1 - draw).toFixed(4)} opacity={draw > 0 ? 1 : 0} />
      {orb > 0 ? <circle cx={dx} cy={dy} r={6.6 * bounce * breathe} fill={H.amber} /> : null}
    </g>
  );
};

/** 片尾卡（最後一幕 silent: true ＋ props.endCard: { lines?, next? }）：整個畫面蓋上底色，四角括號、頻道標誌（動畫）與名稱、slogan、下一支預告。
 *  頁首（左上 LOGO）畫在片尾卡上面，全片不動。字來自 script.json 的 channel 與 endCard；沒寫 endCard 的片不會畫 */
const HudEndCard: React.FC<{ f: number; at: number; spec: { next?: string; kicker?: string; trail?: string[]; logoAnim?: string }; channel?: { name?: string; tag?: string; slogan?: string } }> = ({ f, at, spec, channel }) => {
  const k = tween(f, at, 8, EASE.enter);
  if (k <= 0) return null;
  const n = f - at, b = 120, x0 = L.X + 10, x1 = L.W - L.X - 10, y0 = L.STAGE_TOP + 90, y1 = L.BAND_TOP - 60;
  const draw = tween(f, at + 2, 14, EASE.move), name = tween(f, at + 28, 10, EASE.enter), line = tween(f, at + 36, 14, EASE.move), nx = tween(f, at + 48, 8, EASE.enter);
  const trail = spec?.trail ?? [], ring = (H as any).mark === "ring";
  return (
    <AbsoluteFill style={{ background: H.bg, opacity: k }}>
      <HudBackdrop f={f} lv={0} />
      <svg width={L.W} height={L.H} style={{ position: "absolute", inset: 0 }}>
        {[[x0, y0, 1, 1], [x1, y0, -1, 1], [x0, y1, 1, -1], [x1, y1, -1, -1]].map(([x, y, sx, sy], i) => <path key={i} d={`M ${x} ${y + sy * b * draw} V ${y} H ${x + sx * b * draw}`} fill="none" stroke={H.line} strokeWidth={5} />)}
        <g transform={`translate(${L.W / 2} 640)`}>
          {ring ? (hasLogoAnim(spec?.logoAnim) ? <LogoAnim name={spec.logoAnim as string} n={n} size={400} /> : <RingMarkAnim n={n} size={400} />) : <g transform={`scale(${(0.6 + 0.4 * tween(f, at + 6, 10, EASE.enter)).toFixed(3)})`} opacity={tween(f, at + 6, 10, EASE.enter)}>
          <rect x={-100} y={-100} width={200} height={200} fill="none" stroke={H.line} strokeWidth={8} />
          <rect x={-38} y={-38} width={76} height={76} fill={H.amber} transform={`rotate(${(n * 0.6).toFixed(1)})`} /></g>}
        </g>
      </svg>
      <div style={{ position: "absolute", left: 0, right: 0, top: 860, textAlign: "center", opacity: name, transform: `translateY(${Math.round(30 * (1 - name))}px)`, ...zh(148, H.text), letterSpacing: "0.06em" }}>{channel?.name ?? "科技"}</div>
      <div style={{ position: "absolute", left: (L.W - 760 * line) / 2, top: 1072, width: 760 * line, height: 5, background: H.amber }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 1106, textAlign: "center", opacity: line, ...zh(68, H.line, 700), letterSpacing: "0.12em" }}>{channel?.slogan ?? ""}</div>
      {trail.length ? <div style={{ position: "absolute", left: 0, right: 0, top: 1250, display: "flex", justifyContent: "center", gap: 14 }}>{trail.map((t, i) => <div key={i} style={{ ...zh(36, i === trail.length - 1 ? H.onAccent : H.text2, 700), background: i === trail.length - 1 ? H.line : "transparent", border: `2px solid ${H.lineSoft}`, padding: "6px 18px 8px", opacity: tween(f, at + 38 + i * 3, 5, EASE.enter) }}>{t}</div>)}</div> : null}
      {spec?.next ? <div style={{ position: "absolute", left: 0, right: 0, top: 1400, display: "flex", justifyContent: "center", opacity: nx, transform: `scale(${(1 + 0.08 * Math.sin(Math.PI * tween(f, at + 50, 8, EASE.move))).toFixed(3)})` }}><div style={{ ...zh(60, onC(H.amber), 800), background: H.amber, padding: "10px 44px 16px", letterSpacing: "0.06em" }}>{spec.kicker ?? "下一支"} ▸ {spec.next}</div></div> : null}
    </AbsoluteFill>
  );
};

/** 底部頻道色帶（BAND_TOP 到畫面底）：平台介面會蓋住的區域，不放要讀的字；淡底色＋一排會慢慢滑動的刻度＋全片進度，讓底部不是空白 */
const HudBand: React.FC<{ f: number; total: number }> = ({ f, total }) => {
  const top = L.BAND_TOP, h = L.H - top, g = 24, off = (f * 0.8) % g;
  return (
    <svg width={L.W} height={h} style={{ position: "absolute", left: 0, top }}>
      <rect x={0} y={0} width={L.W} height={h} fill={H.bg2} />
      <line x1={0} x2={L.W} y1={1} y2={1} stroke={H.lineSoft} strokeWidth={2} />
      {Array.from({ length: Math.ceil(L.W / g) + 2 }, (_, i) => { const x = i * g - off; return <line key={i} x1={x} x2={x} y1={14} y2={14 + (i % 5 ? 10 : 22)} stroke={H.lineSoft} strokeWidth={2} />; })}
      <rect x={0} y={h - 10} width={L.W} height={10} fill={H.lineSoft} />
      <rect x={0} y={h - 10} width={(L.W * Math.min(1, f / Math.max(1, total - 1))).toFixed(1)} height={10} fill={H.line} />
      {(H as any).mark === "ring" ? <g transform={`translate(${L.W - 150} ${h / 2 + 10}) scale(2.2) translate(-50 -50)`} opacity={0.18}><path d={RING_ARC} fill="none" stroke={H.line} strokeWidth={9} strokeLinecap="round" /><circle cx={67.68} cy={32.32} r={6.6} fill={H.amber} /></g> : null}
    </svg>
  );
};

/** 字幕：深色框、一次一段單行；關鍵詞念到時上色加底線；英文跟著中文的句 */
type Cue = { id: string; en: string; keywords: string[]; window: [number, number]; phrases: { text: string; start: number }[]; keywords_at: { text: string; start: number }[] };
const HudCaption: React.FC<{ cues: Cue[]; f: number }> = ({ cues, f }) => {
  const act = cues.filter((c) => c.phrases.length);
  if (!act.length) return null;
  const cue = [...act].reverse().find((c) => f >= c.window[0]) ?? act[0];
  const a = cue.window[0], ps = cue.phrases, startOf = (k: number) => (k === 0 ? a : ps[k].start);
  let k = 0; for (let i = 0; i < ps.length; i++) if (f >= startOf(i)) k = i;
  const en = String(cue.en ?? "").split("|").map((x) => x.trim()).filter(Boolean);
  const enStart = (e: number) => (e === 0 ? a : ps[Math.ceil((e * ps.length) / en.length)]?.start ?? a);
  let e = 0; for (let i = 0; i < en.length; i++) if (f >= enStart(i)) e = i;
  const kwAt = Object.fromEntries(cue.keywords_at.map((x) => [x.text, x.start]));
  const p = a <= 0 && k === 0 ? 1 : tween(f, startOf(k), 5, EASE.enter);
  const cols = [H.line, H.amber, H.coral];
  const text = ps[k].text.replace(/\n/g, "").replace(/[，、；：。]+$/, "");
  return (
    <div style={{ position: "absolute", left: L.X, top: L.CAP_TOP, width: L.INNER_W, height: L.CAP_H, background: H.caption, borderTop: `2px solid ${H.lineSoft}`, borderBottom: `2px solid ${H.lineSoft}` }}>
      <div style={{ position: "absolute", left: 0, right: 0, top: 30, height: 104, display: "flex", alignItems: "center", justifyContent: "center", ...zh(L.CAP_ZH_PX, H.text), letterSpacing: "0.02em", transform: `translateY(${Math.round(8 * (1 - p))}px)` }}>
        <span>
          {splitParts(text, cue.keywords).map((sp, i) => {
            if (sp.k < 0) return <span key={i}>{sp.text}</span>;
            const q = kwAt[sp.text] === undefined || kwAt[sp.text] <= 1 ? 1 : tween(f, kwAt[sp.text] - 1, 8, EASE.move), c = cols[sp.k % cols.length];
            return <span key={i} style={{ position: "relative", color: q > 0.5 ? c : H.text }}>{sp.text}<span style={{ position: "absolute", left: 0, bottom: -4, height: 6, width: `${(100 * q).toFixed(1)}%`, background: c }} /></span>;
          })}
        </span>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 156, textAlign: "center", ...mono(L.CAP_EN_PX, H.text2, 500), letterSpacing: "0.02em", fontFamily: FONT_EN }}>{en[e]}</div>
    </div>
  );
};

const HudSource: React.FC<{ cues: { sources: string[]; window: [number, number] }[]; f: number; px: number }> = ({ cues, f, px }) => {
  const cur = cues.find((c) => c.sources?.length && f >= c.window[0] && f < c.window[1]);
  if (!cur) return null;
  const j = cur.sources.join("、");
  return (
    <div style={{ position: "absolute", left: L.X + 4, top: L.SRC_TOP, display: "flex", alignItems: "center", gap: 12, ...zh(px, H.text2, 500), letterSpacing: "0.02em" }}>
      <div style={{ width: 10, height: 10, background: H.lineSoft }} />
      {/^(資料)?來源|示意/.test(j) ? j : `來源：${j}`}
    </div>
  );
};

/** 整支 HUD 片：背景 → 2D 縮放 → 3D（交棒後）→ 標籤／尺寸線／蓋章 → HUD 外框 → 頁首／字幕／出處 */
export const VideoHud: React.FC<Script & { timeline: TimelineV2 }> = (props) => {
  const { scenes, timeline, channel } = props;
  const hud = (props as any).hud as HudSpec;
  const skin = (props as any).hudSkin as string | undefined;
  setHudSkin(skin, (hud as any).smallPx);
  setStageGeo(L.STAGE_TOP, L.STAGE_H);
  // 皮膚的 parts 蓋掉 model.json palette 裡同名的色（"deep" 的 parts 和 short-tech 的 palette 相同）
  const model = useMemo(() => { const pm = props.model as ProductModel; return { ...pm, palette: { ...pm.palette, ...H.parts } }; }, [props.model, skin]);
  const f = useCurrentFrame();
  const m = useMemo(() => buildModel(scenes, timeline, model as ProductModel), [scenes, timeline, model]);
  const keys = useMemo(() => zoomKeys(scenes, timeline, hud), [scenes, timeline, hud]);
  const meas = useMemo(() => measuresOf(scenes, timeline), [scenes, timeline]);
  const z = zoomAt(hud, keys, f);
  const s = useMemo(() => stateAt(m, f), [m, f]);
  const by = Object.fromEntries(timeline.scenes.map((x) => [x.id, x]));
  const ordered = scenes.filter((x) => by[x.id]);
  const subCues = ordered.filter((x) => by[x.id].subtitleWindow).map((x) => ({ id: x.id, en: x.subtitle.en, keywords: x.keywords, window: by[x.id].subtitleWindow as [number, number], phrases: by[x.id].lines, keywords_at: by[x.id].keywords }));
  const srcCues = ordered.map((x) => ({ sources: x.sources, window: by[x.id].sourceWindow as [number, number] }));
  // 鉤子在第一次真正縮放（不是 drift）時退場
  const hookOut = keys.find((k) => !k.drift && k.at > 0)?.at ?? 1e9;
  // 3D 段鏡頭推近拉遠時，尺標與倍率跟著鏡頭距離伸縮（以交棒那一刻的距離為準）
  const hand = keys.find((k) => hud.levels[k.to]?.handoff3D);
  const d0 = useMemo(() => (hand ? stateAt(m, hand.at + hand.dur).cam.d : 0), [m, hand]);
  const camK = z.handoff > 0.99 && d0 > 0 ? d0 / s.cam.d : 1;
  const endScene = scenes.find((x) => (x as any).silent === true && (x.props as any)?.endCard);
  const card = (m.overlays ?? []).find((o) => o.type === "card");
  // 片尾卡完全蓋住畫面之後（進場 8 幀）不再掛 3D 畫布：畫面一模一樣，只是省下每幀幾秒的 3D 成本
  const endAt = endScene && by[endScene.id] ? by[endScene.id].startFrame + 8 : 1e9;
  const quiet = card ? tween(f, card.at - 4, 6, EASE.move) * (1 - tween(f, card.until, 6, EASE.exit)) : 0;
  return (
    <AbsoluteFill style={{ background: H.bg }}>
      <HudBackdrop f={f} lv={z.lv} warm={z.handoff * s.lay} />
      <ZoomArt hud={hud} z={z} f={f} />
      {f < endAt ? <Stage3D s={s} model={m.product} o={z.handoff} /> : null}
      <HudFrame f={f} hud={hud} z={z} camK={camK} quiet={quiet} />
      <HudHook m={m} f={f} out={hookOut} />
      <HudStreams m={m} s={s} f={f} />
      <HudLabels m={m} s={s} f={f} max={hud.maxLabels ?? 2} />
      <HudMeasures m={m} s={s} f={f} list={meas} />
      <HudMeters m={m} s={s} f={f} />
      <HudOverlays m={m} f={f} />
      <HudCaption cues={subCues as Cue[]} f={f} />
      <HudSource cues={srcCues} f={f} px={(m.product.fx as any)?.srcPx ?? 30} />
      {endScene && by[endScene.id] ? <HudEndCard f={f} at={by[endScene.id].startFrame} spec={(endScene.props as any).endCard} channel={channel} /> : null}
      <HudBand f={f} total={timeline.totalFrames} />
      <HudHeader name={channel?.name ?? "科技"} tag={channel?.tag ?? "放大來看"} total={timeline.totalFrames} f={f} />
      {timeline.voice ? <Audio src={staticFile(timeline.voice.file)} /> : timeline.scenes.filter((t) => t.audio).map((t) => (
        <Sequence key={`${t.id}-audio`} from={t.audioFrame} durationInFrames={Math.ceil(t.audioSec * FPS) + 1} name={`${t.id}-audio`} layout="none"><Audio src={staticFile(t.audio as string)} /></Sequence>
      ))}
    </AbsoluteFill>
  );
};

/** 封面：深色 HUD 底＋大字＋中間一張縮放圖（停在 cover.frame 那一幀的縮放狀態；不掛 3D） */
export const CoverHud: React.FC<Script & { coverCrop?: number }> = (props) => {
  const { cover, scenes, timeline, channel, coverCrop } = props;
  const hud = (props as any).hud as HudSpec;
  const c = (cover ?? {}) as { title?: string[]; sub?: string; frame?: number };
  setHudSkin((props as any).hudSkin, (hud as any).smallPx);
  setStageGeo(L.STAGE_TOP, L.STAGE_H);
  const keys = useMemo(() => (timeline ? zoomKeys(scenes, timeline as TimelineV2, hud) : []), [scenes, timeline, hud]);
  const cf = keys.find((k) => !k.drift && k.at > 0);
  const z = zoomAt(hud, keys, cf ? cf.at + Math.round(cf.dur * 0.7) : 0);
  const shift = coverCrop ? (L.H - coverCrop) / 2 - 150 : 0;
  return (
    <AbsoluteFill style={{ background: H.bg }}>
      <HudBackdrop f={0} lv={0} />
      <div style={{ position: "absolute", inset: 0, transform: "translateY(260px)" }}><ZoomArt hud={hud} z={z} f={0} /></div>
      <div style={{ position: "absolute", inset: 0, transform: `translateY(${shift}px)` }}><HudHeader name={channel?.name ?? "科技"} tag={channel?.tag ?? "放大來看"} total={1} f={0} /></div>
      <div style={{ position: "absolute", left: L.X, top: 360, width: L.INNER_W }}>
        {(c.title ?? []).map((t, i) => <div key={i} style={{ ...zh(150, i === 1 ? H.amber : H.text), lineHeight: 1.18 }}>{t}</div>)}
        {c.sub ? <div style={{ display: "inline-block", ...zh(46, onC(H.line), 800), background: H.line, padding: "8px 30px", marginTop: 22 }}>{c.sub}</div> : null}
      </div>
    </AbsoluteFill>
  );
};

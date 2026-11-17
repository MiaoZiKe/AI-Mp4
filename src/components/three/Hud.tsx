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
import { FONT_EN, FONT_ZH, FPS, THEME_3D as T } from "../../theme";
import { H, L, canvasBox, setHudLayout, setHudSkin, sm } from "./hudSkin";
import { LogoAnim, hasLogoAnim } from "./LogoAnims";
import { BACKDROP_O, ENDCARD, ENDCARD_TC, endcardGeom, textW, artRegion, applyY, planHud, ID, type Yield, arrangeOverlays, atOf, meters, modelRect, obstaclesOf, placeLabels, type PlacedLabel, zoomAt as zoomAtL, zoomKeys as zoomKeysL, type HudSpec, type Rect, type ZoomKey } from "./hudLayout";
import { EASE, tween } from "../anim";
import { splitParts } from "../Subtitle";
import { buildModel, cameraFor, projectPoint, signalLevel, stateAt, type Model3D, type Overlay3D, type State3D } from "./engine";
import { col, fxOf, type ProductModel } from "./model";
import { Art } from "./HudArt";
import { ProductScene } from "./Scene";
import { LPP, lppPhase } from "./Ops";
import { PkgSection } from "./HudPkg";
import { HbmSection } from "./HudHbm";
import { SrvSection } from "./HudServer";
import { CoolSection } from "./HudCool";
import { EtchSection } from "./HudEtch";
import { WfSection } from "./HudWafer";
import { DepSection } from "./HudDep";
import { PwSection } from "./HudPower";
import { FdySection } from "./HudFoundry";
import { FdySection } from "./HudFoundry";
import { IcSection } from "./HudIc";

export type { HudLevel, HudSpec, ZoomKey } from "./hudLayout";
export type Measure = { from: string; to: string; text: string; color?: string; at: number; until: number; off?: number };
const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
export const zoomKeys = (scenes: Scene[], tl: TimelineV2, hud: HudSpec): ZoomKey[] => zoomKeysL(scenes, tl, hud, H.motion.zoom, H.motion.drift);
export const zoomAt = zoomAtL;
export const measuresOf = (scenes: Scene[], tl: TimelineV2): Measure[] => {
  const at = atOf(tl), out: Measure[] = [];
  for (const s of scenes) for (const m of ([] as any[]).concat((s.props as any)?.measure ?? [])) out.push({ ...m, at: at(s.id, m.at, 1e9), until: m.until ? at(s.id, m.until, 1e9) : 1e9 });
  return out;
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
const cxy = () => ({ CX: L.W / 2, CY: L.STAGE_TOP + L.STAGE_H / 2 });

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
export const ZoomArt: React.FC<{ hud: HudSpec; z: Zoom; f: number; y?: Yield }> = ({ hud, z, f, y = ID }) => {
  if (z.handoff >= 1) return null;
  // 讀數帶版面：圖只畫在兩條讀數帶中間（artRegion），中心也是那一塊的中心；y＝主素材讓位的變形
  const R = L.BAND_TOP ? artRegion(L as any) : { x0: 0, x1: L.W, y0: L.STAGE_TOP, y1: L.STAGE_TOP + L.STAGE_H }, CX = L.W / 2, CY = L.BAND_TOP ? (R.y0 + R.y1) / 2 : cxy().CY;
  return (
    <svg width={L.W} height={L.H} style={{ position: "absolute", inset: 0, opacity: 1 - z.handoff }}>
      <defs><clipPath id="hudStage"><rect x={L.BAND_TOP ? R.x0 - 40 : 0} y={R.y0} width={L.BAND_TOP ? R.x1 - R.x0 + 80 : L.W} height={R.y1 - R.y0} /></clipPath></defs>
      <g clipPath="url(#hudStage)"><g transform={`matrix(${y.s} 0 0 ${y.s} ${y.ox} ${y.oy})`}>
        {hud.levels.map((lvl, i) => {
          const k = Math.pow(10, Math.log10(meters(lvl.field)) - z.logField);
          // 裡面那一級（還很小）慢慢浮現；外面那一級等「下一級長到 0.4–0.9 倍畫面寬」才退掉（兩級差 100 倍以上時中間也不會空掉）
          const nx = hud.levels[i + 1], kin = nx ? Math.pow(10, Math.log10(meters(nx.field)) - z.logField) : k / 10;
          if (kin > 0.9 || k < 0.06) return null;
          // hideInside（2026/11/15 tech-euv）：外面那一級的圖不是「放大鏡」（例如光與線的比例圖），裡面的級數不畫在它正中央；外面那一級長到畫面大小前就淡掉
          const outer = hud.levels.slice(0, i).filter((x) => x.hideInside).map((x) => Math.pow(10, Math.log10(meters(x.field)) - z.logField));
          const o = clamp01((k - 0.07) / 0.25) * clamp01((0.9 - kin) / 0.5) * outer.reduce((a, ko) => a * clamp01((ko - 1.3) / 1.5), 1);
          if (o <= 0.001) return null;
          return <g key={lvl.id} transform={`translate(${CX} ${CY}) scale(${(L.INNER_W * k * (L.ART_FIT ?? 1)) / 1000})`} opacity={o}><Art kind={lvl.art} f={f} cues={(lvl as any)._cf} /></g>;
        })}
      </g></g>
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
  const rulerPx = Math.max(40, Math.min(L.INNER_W * (L.BAND_TOP ? 0.4 : 0.5), (meters(lvl.ruler) / Math.pow(10, z.logField)) * L.INNER_W * camK));
  // quiet＝提問卡出現時收掉層級名、倍率、FIELD（只留右上的示意圖標示，全片都在）
  const rq = 1 - quiet;
  // 讀數換級時閃一下（換字的那幾幀亮起來）
  const lvF = Math.abs(z.lv - Math.round(z.lv)) < 0.5 ? 1 : 0;
  const sc = hud.schematic, { CX, CY } = cxy();
  // readout: false 的那一級（例如曝光機示意模型）不畫倍率、FIELD、尺標，FIELD 那一行改顯示 note
  const ro = lvl.readout !== false, roK = ro ? 1 : 0;
  return (
    <svg width={L.W} height={L.H} style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
      {[[x0, y0, 1, 1], [x1, y0, -1, 1], [x0, y1, 1, -1], [x1, y1, -1, -1]].map(([x, y, sx, sy], i) => <path key={i} d={`M ${x} ${y + sy * b} V ${y} H ${x + sx * b}`} fill="none" stroke={H.line} strokeWidth={s.bold} />)}
      {Array.from({ length: Math.ceil((y1 - y0) / H.scan.gap) }, (_, i) => <line key={i} x1={x0} x2={x1} y1={y0 + i * H.scan.gap} y2={y0 + i * H.scan.gap} stroke={H.line} strokeOpacity={H.scan.opacity} strokeWidth={1} />)}
      <rect x={x0} y={y0 + band - H.scan.bandH} width={x1 - x0} height={Math.max(0, Math.min(H.scan.bandH, y1 - (y0 + band - H.scan.bandH)))} fill={H.line} opacity={H.scan.bandO * ((hud as any).scanBand ?? 1)} />
      {/* 右側刻度柱：縮放時往上流動 */}
      {Array.from({ length: 26 }, (_, i) => { const yy = y0 + 170 + ((i * 26 + z.lv * 260) % 676); return <line key={`r${i}`} x1={x1 - 16} x2={x1 - (i % 5 ? 26 : 40)} y1={yy} y2={yy} stroke={H.lineSoft} strokeWidth={2} />; })}
      <g stroke={H.line} strokeWidth={s.thin} opacity={0.8}>
        <line x1={CX - 30} x2={CX - 8} y1={CY} y2={CY} /><line x1={CX + 8} x2={CX + 30} y1={CY} y2={CY} />
        <line y1={CY - 30} y2={CY - 8} x1={CX} x2={CX} /><line y1={CY + 8} y2={CY + 30} x1={CX} x2={CX} />
      </g>
      <g opacity={roK} transform={`translate(${x0 + 28} ${L.BAND_TOP ? L.STAGE_TOP + L.STAGE_H - 22 : y1 - 34})`}>
        <line x1={0} x2={rulerPx} y1={0} y2={0} stroke={H.amber} strokeWidth={s.bold} />
        {Array.from({ length: H.ruler.ticks + 1 }, (_, i) => <line key={i} x1={(rulerPx * i) / H.ruler.ticks} x2={(rulerPx * i) / H.ruler.ticks} y1={0} y2={i % 5 ? -H.ruler.h / 2 : -H.ruler.h} stroke={H.amber} strokeWidth={s.mid} />)}
        <text x={0} y={-H.ruler.h - 12} style={mono(H.font.px.readout, H.amber)}>{lvl.ruler}</text>
      </g>
      {L.BAND_TOP ? <>
        {/* 2026/11/15 讀數帶版面：上帶＝左邊層級名、右邊倍率＋FIELD；下帶＝左邊尺標、右邊示意圖標示。主素材只畫在兩條帶子中間，讀數不會壓到它 */}
        <text x={x0 + 28} y={L.STAGE_TOP + 50} style={zh(H.font.px.label, H.line, 700)} opacity={rq}>{lvl.label}</text>
        <text x={x0 + 28} y={L.STAGE_TOP + 90} style={mono(sm(H.font.px.readout), H.text2)} opacity={rq}>{lvl.en ?? ""}</text>
        {ro ? <text x={x1 - 24} y={L.STAGE_TOP + 62} textAnchor="end" style={mono(56, H.text, 700)} opacity={(0.75 + 0.25 * lvF) * rq}>{magText(z.mag * camK)}</text> : null}
        {ro ? <text x={x1 - 24} y={L.STAGE_TOP + 96} textAnchor="end" style={mono(sm(H.font.px.readout), H.text2)} opacity={rq}>FIELD {lvl.field}</text>
          : <text x={x1 - 24} y={L.STAGE_TOP + 62} textAnchor="end" style={zh(sm(34), H.text2, 700)} opacity={lvl.noteAlways ? 1 : rq}>{lvl.note ?? "示意"}</text>}
        {sc ? <text x={x1 - 24} y={L.STAGE_TOP + L.STAGE_H - 52 - ((sc as any).lift ?? 0)} textAnchor="end" style={mono(sm(28), H.text2, 500)}>{sc.text}</text> : null}
        {sc?.zh ? <text x={x1 - 24} y={L.STAGE_TOP + L.STAGE_H - 16 - ((sc as any).lift ?? 0)} textAnchor="end" style={zh(sm(28), H.text2, 500)}>{sc.zh}</text> : null}
      </> : <>
      {/* 讀數底板：縮放圖層從底下經過時字還讀得到 */}
      <rect x={x0 + 10} y={y0 + 10} width={340} height={100} fill={H.bg} opacity={H.plateO * rq} />
      <rect x={x1 - 470} y={y0 + 10} width={460} height={86 + 110 * rq} fill={H.bg} opacity={H.plateO} />
      {sc ? <text x={x1 - 24} y={y0 + 40} textAnchor="end" style={mono(sm(28), H.text2, 500)}>{sc.text}</text> : null}
      {sc?.zh ? <text x={x1 - 24} y={y0 + 76} textAnchor="end" style={zh(sm(28), H.text2, 500)}>{sc.zh}</text> : null}
      <text x={x1 - 24} y={y0 + 150} textAnchor="end" style={mono(H.font.px.big, H.text, 700)} opacity={(0.75 + 0.25 * lvF) * rq}>{magText(z.mag * camK)}</text>
      <text x={x1 - 24} y={y0 + 192} textAnchor="end" style={mono(H.font.px.readout, H.text2)} opacity={rq}>FIELD {lvl.field}</text>
      <text x={x0 + 28} y={y0 + 56} style={zh(H.font.px.label, H.line, 700)} opacity={rq}>{lvl.label}</text>
      <text x={x0 + 28} y={y0 + 96} style={mono(H.font.px.readout, H.text2)} opacity={rq}>{lvl.en ?? ""}</text>
      </>}
    </svg>
  );
};

/** 3D 舞台（只在交棒之後掛上）；外圈 drop-shadow 當便宜的光暈（不是 3D bloom） */
const Stage3D: React.FC<{ s: State3D; model: ProductModel; o: number; y?: Yield }> = ({ s, model, o, y = ID }) => {
  const fx = fxOf(model);
  if (o <= 0.001) return null;
  // 主素材讓位：整張 3D 畫布做同一個縮放平移（畫面點 p → p×s＋o；換成畫布自己的座標）
  const C = canvasBox(), T0 = C.top, tr = y.s === 1 && !y.ox && !y.oy ? undefined : `translate(${y.ox.toFixed(2)}px, ${(y.s * T0 + y.oy - T0).toFixed(2)}px) scale(${y.s.toFixed(4)})`;
  return (
    <div style={{ position: "absolute", left: 0, top: C.top, width: L.W, height: C.h, opacity: o, transform: tr, transformOrigin: "0 0", filter: `drop-shadow(0 0 ${H.glow.rimPx}px ${H.glow.rim})` }}>
      <ThreeCanvas linear={false} shadows={false} width={L.W} height={C.h} dpr={(fx.dpr ?? 1) * Math.max(1, y.s)} gl={{ antialias: !!fx.msaa, alpha: true }} camera={{ fov: T.camera.fov, near: 1, far: 600, position: [0, 0, 60] }}>
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

/** 標籤：圓點釘在零件上、引線、小框。同畫面最多 max 張（多的照時間先後留最新的）。
 *  2026/11/15：標籤一律放在模型外面（hudLayout.ts 的 placeLabel）：位置用標籤落定那一幀（at+8）的模型範圍算一次，之後跟著零件平移，引線拉到模型外 */
const HudLabels: React.FC<{ s: State3D; f: number; max: number; placed: PlacedLabel[]; enPx: number; y?: Yield }> = ({ s, f, max, placed, enPx, y: yv = ID }) => {
  const cam = useMemo(() => cameraFor(s), [s]);
  const on = placed.filter(({ l }) => f >= l.at - 2 && f < l.until + 6).slice(-max);
  return (
    <>
      {on.map(({ l, an, x: x0, y: y0, left }, i) => {
        const p0 = projectPoint(s, cam, an.layer, an.p), p = { x: p0.x * yv.s + yv.ox, y: p0.y * yv.s + yv.oy }, c = hudAccent(l.color);
        const o = tween(f, l.at - 2, 5, EASE.enter) * (1 - tween(f, l.until, 6, EASE.exit));
        // 標籤卡整段固定在模型外的空位（hudLayout.ts 的 placeLabels），只有引線跟著零件走
        const x = x0, y = y0;
        // 引線：先拐到標籤那一側的高度再水平接上（標籤放在模型下方時，引線往下拉出模型）
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
              {l.en ? <div style={mono(enPx, H.text2, 500)}>{l.en}</div> : null}
            </div>
          </React.Fragment>
        );
      })}
    </>
  );
};

/** HUD 尺寸線：兩個標註點投影到畫面，往旁邊（off，預設 70px）拉出延伸線，中間是兩頭有短擋的尺寸線，數字框貼在外側 */
const HudMeasures: React.FC<{ m: Model3D; s: State3D; f: number; list: Measure[]; y?: Yield }> = ({ m, s, f, list, y: yv = ID }) => {
  const cam = useMemo(() => cameraFor(s), [s]);
  const A = m.product.anchors;
  return (
    <>
      {list.map((d, i) => {
        const a = A[d.from], b = A[d.to];
        if (!a || !b) return null;
        const o = tween(f, d.at, 5, EASE.enter) * (1 - tween(f, d.until, 6, EASE.exit));
        if (o <= 0) return null;
        const Y = (r: { x: number; y: number }) => ({ x: r.x * yv.s + yv.ox, y: r.y * yv.s + yv.oy });
        const p = Y(projectPoint(s, cam, a.layer, a.p)), q = Y(projectPoint(s, cam, b.layer, b.p)), c = hudAccent(d.color);
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
              {/* 關閉時的漏電（示意，2026/11/15 改）：沒被閘極包到的地方，小光點斷斷續續地漏出去（帶短拖尾、往基板方向走）；
                  leak＝強度（每秒約 leak×0.75 顆，不是 0），鰭式從鰭底部兩側漏，奈米片從最下面那片底下偶爾漏一顆 */}
              <LeakDots kind={sd.kind} leak={leak} cx={cx} base={base} n={f - ((sd as any).at ?? o.at)} seed={i * 97 + 13} />
              {leak > 0 && sd.note ? <><path d={`M ${cx + (sd.kind === "fin" ? 22 : 16)} ${base - 18} H ${cx + 104}`} stroke={A.leak} strokeWidth={2} strokeDasharray="5 5" opacity={0.9} /><text x={cx + 110} y={base - 6} style={zh(sm(30), A.leak, 800)}>{sd.note}</text></> : null}
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
/** 固定 seed 的亂數（同一個 k 永遠同一個值） */
const hash01 = (k: number) => { const x = Math.sin(k * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
/** 漏電小光點：每秒約 leak×0.75 顆，出生時間有亂數間隔（斷斷續續），每顆活 LIFE 幀：從漏電處出現、帶 3 格短拖尾往基板方向走、淡出 */
const LeakDots: React.FC<{ kind: string; leak: number; cx: number; base: number; n: number; seed: number }> = ({ kind, leak, cx, base, n, seed }) => {
  if (leak <= 0 || n < 0) return null;
  const A = H.art, rate = leak * 0.75, gap = 30 / rate, LIFE = 26, out: React.ReactNode[] = [];
  const k1 = Math.floor(n / gap);
  for (let k = Math.max(0, k1 - Math.ceil(LIFE / gap) - 2); k <= k1; k++) {
    const born = k * gap + hash01(seed + k) * gap * 0.8, age = n - born;
    if (age < 0 || age > LIFE) continue;
    const u = age / LIFE, side = hash01(seed + k * 3.7) < 0.5 ? -1 : 1;
    // 起點：鰭式＝鰭底部（閘極沒包到的那段）左右兩側；奈米片＝最下面那片底下
    const x0 = kind === "fin" ? cx + side * 10 : cx + (hash01(seed + k * 5.1) - 0.5) * 30, y0 = kind === "fin" ? base - 40 + hash01(seed + k * 2.3) * 12 : base - 26;
    const x1 = x0 + side * (kind === "fin" ? 40 + 30 * hash01(seed + k) : 18), y1 = base + 22;
    const pos = (t: number) => { const e = 1 - Math.pow(1 - Math.max(0, t), 2); return [x0 + (x1 - x0) * e, y0 + (y1 - y0) * e]; };
    const o = Math.min(1, u * 6) * (1 - Math.pow(u, 3)) * (kind === "fin" ? 1 : 0.8);
    for (let tr = 3; tr >= 0; tr--) { const [x, y] = pos(u - tr * 0.06); out.push(<circle key={`${k}-${tr}`} cx={x} cy={y} r={tr ? 7 - tr * 1.5 : 8} fill={A.leak} opacity={o * (tr ? 0.5 - tr * 0.12 : 1)} />); }
    // 出生時一圈小波紋：看得出「漏了一顆」
    if (age < 10) out.push(<circle key={`${k}-r`} cx={x0} cy={y0} r={4 + age * 1.6} fill="none" stroke={A.leak} strokeWidth={2} opacity={(1 - age / 10) * 0.8} />);
  }
  return <>{out}</>;
};

/** 運作時的 2D 剖面圖（overlay type: "section"，2026/11/15 v6：Andy「2.5D 圖在運作時，若有空間，可以搭配 2D 剖析圖，讓讀者更清楚原理」）。
 *  沿電流方向切開：左源極、右汲極、中間 flows 列的幾片通道（由下到上）、閘極把通道包住；電子光點的位置、密度、停住都用 3D 那幾個 flow 動作的同一份數值
 *  （engine 的 op.u／op.k，和 Ops.tsx 同一套 drive 規則），閘極亮度跟 gate 動作、通道亮度跟 channel 動作；meters 列的儀表畫在右側。顏色只讀皮膚。 */
const hash01s = (k: number) => { const x = Math.sin(k * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
/** 光路剖面（overlay section 加 kind: "path"；2026/11/15 tech-euv）：側面看光走的路。nodes＝[{ x, y（0–1，在圖框內的位置）, kind: "src"｜"mirror"｜"mask"｜"wafer", rot?（鏡面角度，度）, label?, note? }]；
 *  flow＝model.json 的 flow 動作 id（光點的顆數、速度、出場都跟 3D 那一份一樣）；keep＝每經過一面鏡子（mirror／mask）剩下幾成（例如 0.7），光點越後面越淡、越小；endText＝終點旁的大字（例如「約 2%」） */
const HudSectionPath: React.FC<{ o: Overlay3D; f: number; k: number; m: Model3D; s: State3D }> = ({ o, f, k, m, s }) => {
  const W = o.w ?? 600, Hh = o.h ?? 300, A = H.art, top = 56, pad = 34, bw = W - pad * 2, bh = Hh - top - 28;
  const nodes = ((o as any).nodes ?? []) as { x: number; y: number; kind: string; rot?: number; label?: string; note?: string; textAt?: number }[];
  const P = nodes.map((n) => [pad + n.x * bw, top + n.y * bh]);
  const keep = (o as any).keep ?? 0.7, seg = P.slice(1).map((p, i) => Math.hypot(p[0] - P[i][0], p[1] - P[i][1])), tot = seg.reduce((a, b) => a + b, 0) || 1;
  // 第 i 段之前經過幾面反射（起點是光源，不算）
  const lossAt = (i: number) => Math.pow(keep, nodes.slice(1, i + 1).filter((n) => n.kind === "mirror" || n.kind === "mask").length);
  const at = (u: number) => { let d = u * tot; for (let i = 0; i < seg.length; i++) { if (d <= seg[i]) { const t = d / seg[i]; return { x: P[i][0] + (P[i + 1][0] - P[i][0]) * t, y: P[i][1] + (P[i + 1][1] - P[i][1]) * t, i }; } d -= seg[i]; } return { x: P[P.length - 1][0], y: P[P.length - 1][1], i: seg.length - 1 }; };
  const d = (m.product.actions ?? {})[(o as any).flow] as any, op = s.ops[(o as any).flow];
  const dots: React.ReactNode[] = [];
  if (d && op && op.k > 0.01) {
    const n = d.n ?? 8;
    for (let i = 0; i < n; i++) {
      const raw = op.u * (d.rate ?? 0.5) - i / n;
      if (raw < 0) continue;
      const u = raw - Math.floor(raw), q = at(u), l = lossAt(q.i), e = Math.min(1, u * 20, (1 - u) * 20) * op.k;
      dots.push(<circle key={i} cx={q.x} cy={q.y} r={4 + 7 * Math.sqrt(l)} fill={(H.parts as any).euv ?? "#8B5CF6"} opacity={e * (0.25 + 0.75 * l)} />);
    }
  }
  const euv = (m.product.palette as any)?.euv ?? "#8B5CF6";
  return (
    <div style={{ position: "absolute", left: o.x ?? L.X, top: o.y ?? 900, width: W, height: Hh, opacity: k, background: H.cardCompare, border: `2px solid ${H.lineSoft}`, boxSizing: "border-box" }}>
      {o.title ? <div style={{ position: "absolute", left: 16, top: 10, ...zh(30, onC(H.line), 800), background: H.line, padding: "2px 14px 4px" }}>{o.title}</div> : null}
      {o.tag ? <div style={{ position: "absolute", right: 16, top: 14, ...zh(sm(30), H.text2, 600) }}>{o.tag}</div> : null}
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        <polyline points={P.map((p) => p.join(",")).join(" ")} fill="none" stroke={euv} strokeOpacity={0.35} strokeWidth={3} strokeDasharray="10 8" />
        {nodes.map((n, i) => {
          const [x, y] = P[i];
          if (n.kind === "focus") return <g key={i}><rect x={x - 4} y={y - 46} width={8} height={36} fill={H.text2} /><rect x={x - 4} y={y + 10} width={8} height={36} fill={H.text2} /></g>;
          if (n.kind === "src") return <g key={i}><circle cx={x} cy={y} r={13} fill={euv} opacity={0.35 + 0.65 * (op?.k ?? 0)} /><circle cx={x} cy={y} r={22} fill="none" stroke={euv} strokeWidth={2} opacity={0.5} /></g>;
          const w = n.kind === "wafer" ? 120 : n.kind === "mask" ? 84 : 52, hgt = n.kind === "wafer" ? 12 : 10;
          return <rect key={i} x={x - w / 2} y={y - hgt / 2} width={w} height={hgt} rx={3} transform={`rotate(${n.rot ?? 0} ${x} ${y})`} fill={n.kind === "mask" ? A.edge : n.kind === "wafer" ? A.sd : A.gate} />;
        })}
        {dots}
        {(o as any).count ? (() => { let c = 0; return nodes.map((n, i) => { if (n.kind !== "mirror" && n.kind !== "mask") return null; c++; const [x, y] = P[i], sh = tween(f, ((o as any).count?.at ?? o.at) + c * ((o as any).count?.step ?? 3), 5, EASE.enter);
          return <g key={`c${i}`} opacity={sh}><circle cx={x} cy={y + (n.kind === "mask" ? 30 : 32)} r={17} fill={H.panel} stroke={H.text2} strokeWidth={2} /><text x={x} y={y + (n.kind === "mask" ? 30 : 32) + 10} textAnchor="middle" style={mono(sm(28), H.text, 800)}>{c}</text></g>; }); })() : null}
        {nodes.map((n, i) => {
          if (!n.label && !n.note) return null;
          const [x, y] = P[i], show = n.textAt === undefined ? 1 : tween(f, n.textAt, 6, EASE.enter);
          return <g key={`t${i}`} opacity={show}>
            {n.label ? <text x={x} y={y + (n.kind === "wafer" ? 44 : -22)} textAnchor="middle" style={zh(sm(30), H.text, 800)}>{n.label}</text> : null}
            {n.note ? <text x={x} y={y + (n.kind === "wafer" ? -20 : 46)} textAnchor="middle" style={mono(sm(30), H.text2, 700)}>{n.note}</text> : null}
          </g>;
        })}
      </svg>
      {(o as any).count?.readout ? (() => {
        // 逐面遞減讀數（2026/11/15 v3，結構驗收：「100→70→49→…→約 2%」）：跟編號同一個節奏，每跳一個編號，讀數乘一次 keep、右邊多一根長條
        const nR = nodes.filter((n) => n.kind === "mirror" || n.kind === "mask").length, c0 = (o as any).count?.at ?? o.at, stp = (o as any).count?.step ?? 3;
        const c = Math.max(0, Math.min(nR, Math.floor((f - c0) / stp))), v = Math.pow(keep, c), pct = c === nR ? `約 ${Math.round(v * 100)}%` : `${Math.round(v * 100)}%`, bw0 = 15, gap = 5, bx = W - 24 - nR * (bw0 + gap), maxH = 74;
        return <div style={{ position: "absolute", right: 0, top: 50, width: nR * (bw0 + gap) + 30, height: Hh - 56 }}>
          <div style={{ position: "absolute", right: 24, top: 2, ...zh(30, H.text2, 800) }}>剩下的光</div>
          <div style={{ position: "absolute", right: 24, top: 40, ...zh(c === nR ? 56 : 48, c === nR ? H.amber : H.text, 900), fontVariantNumeric: "tabular-nums" }}>{f >= c0 ? pct : "100%"}</div>
          <svg width={nR * (bw0 + gap) + 30} height={Hh - 56} style={{ position: "absolute", left: 0, top: 0 }}>
            {Array.from({ length: nR + 1 }, (_, j) => j).map((j) => { if (j > c && f >= c0) return null; const h = maxH * Math.pow(keep, j); return <rect key={j} x={6 + j * (bw0 + gap) - (bw0 + gap)} y={Hh - 70 - h} width={bw0} height={Math.max(2, h)} fill={j === nR ? H.amber : (H.parts as any).euv ?? "#8B5CF6"} opacity={0.35 + 0.65 * Math.pow(keep, j * 0.5)} />; })}
          </svg>
          {(o as any).count?.note ? <div style={{ position: "absolute", right: 24, bottom: 4, ...zh(sm(30), H.text2, 700) }}>{(o as any).count.note}</div> : null}
        </div>;
      })() : null}
      {(o as any).endText ? <div style={{ position: "absolute", right: 22, bottom: 18, ...zh(64, H.amber, 900), letterSpacing: "0.02em", opacity: tween(f, (o as any).textAt ?? o.at, 8, EASE.enter), transform: `scale(${(1 + 0.14 * Math.sin(Math.PI * tween(f, (o as any).textAt ?? o.at, 10, EASE.move))).toFixed(3)})` }}>{(o as any).endText}</div> : null}
    </div>
  );
};


/** 卡片外框（section 共用）：白底細框、左上藍底標題、右上小字標示 */
const SecCard: React.FC<{ o: Overlay3D; k: number; W: number; Hh: number; children: React.ReactNode }> = ({ o, k, W, Hh, children }) => (
  <div style={{ position: "absolute", left: o.x ?? L.X, top: o.y ?? 900, width: W, height: Hh, opacity: k, background: H.cardCompare, border: `2px solid ${H.lineSoft}`, boxSizing: "border-box", overflow: "hidden" }}>
    {o.title ? <div style={{ position: "absolute", left: 16, top: 10, ...zh(30, onC(H.line), 800), background: H.line, padding: "2px 14px 4px", zIndex: 2 }}>{o.title}</div> : null}
    {o.tag ? <div style={{ position: "absolute", right: 16, top: 14, ...zh(sm(30), H.text2, 600), zIndex: 2 }}>{o.tag}</div> : null}
    {children}
  </div>
);
/** 右側的步驟列（section 共用）：items＝[{ text, at? }]；active＝現在亮哪一列（-1＝都不亮）；念到 at 才出現 */
const SecSteps: React.FC<{ items: { text: string; at?: number }[]; f: number; active: number; x: number; y: number; w: number; gap?: number; px?: number }> = ({ items, f, active, x, y, w, gap = 64, px = 32 }) => (
  <>{items.map((it, j) => { const sh = it.at === undefined ? 1 : tween(f, it.at, 6, EASE.enter), on = j === active;
    return <div key={j} style={{ position: "absolute", left: x, top: y + j * gap, width: w, opacity: sh, display: "flex", alignItems: "center", gap: 12, padding: "6px 12px 8px", boxSizing: "border-box", background: on ? H.amber : "transparent", border: `2px solid ${on ? H.amber : H.lineSoft}` }}>
      <div style={zh(px, on ? onC(H.amber) : H.text, 800)}>{it.text}</div>
    </div>; })}</>
);

/** 雷射打錫滴的 2D 側視（overlay section 加 kind: "lpp"；2026/11/15 tech-euv）：錫滴往下掉 → 預脈衝（細）打扁 → 主脈衝（粗）打成電漿發光。
 *  source＝model.json 的 lpp 動作 id：相位、顏色、出場都和 3D 那一份相同（Ops.tsx 的 lppPhase／LPP）。items＝右側步驟列（[{ text, at }]），現在演到哪一步就亮哪一列 */
const HudSectionLpp: React.FC<{ o: Overlay3D; f: number; k: number; m: Model3D; s: State3D }> = ({ o, f, k, m, s }) => {
  const W = o.w ?? 952, Hh = o.h ?? 300, top = 58, d = (m.product.actions ?? {})[(o as any).source] as any, op = s.ops[(o as any).source];
  const on = d && op && op.k > 0.01, ph = on ? lppPhase(d, op.t) : 0, vk = on ? op.k : 0, Lp = d?.lpp ?? {};
  const vw = Math.round(W * 0.5), fx = Math.round(vw * 0.66), fy = Math.round(top + (Hh - top) * 0.56), y0 = top + 10, q = Lp.queue ?? 4, P = LPP;
  const C = (c: string | undefined, fb: string) => col(m.product, c ?? fb);
  const tin = C(d?.color, "#9AA6B8"), pre = C(Lp.pre, H.coral), main = C(Lp.main, H.coral), glow = C(Lp.glow, "#8B5CF6");
  const tri = (a: number, b: number) => (ph < a || ph > b ? 0 : Math.sin((Math.PI * (ph - a)) / (b - a)));
  const el: React.ReactNode[] = [];
  if (on) {
    for (let j = 0; j < q; j++) { if (j === 0 && ph >= P.pre) continue; const t = 1 - (P.pre - ph + j) / q; if (t < 0) continue; el.push(<circle key={`d${j}`} cx={fx} cy={y0 + (fy - y0) * t} r={20} fill={tin} stroke={H.text2} strokeWidth={2} opacity={vk * Math.min(1, t * 6)} />); }
    const a = tri(P.pre - 0.05, P.pre + 0.05), b = tri(P.main - 0.05, P.main + 0.06);
    if (a > 0.01) el.push(<line key="pre" x1={20} y1={fy} x2={fx} y2={fy} stroke={pre} strokeWidth={5 + 3 * a} opacity={vk * a} />);
    if (b > 0.01) el.push(<line key="main" x1={20} y1={fy} x2={fx} y2={fy} stroke={main} strokeWidth={12 + 8 * b} opacity={vk * b} />);
    if (ph >= P.pre && ph < P.main + 0.02) { const e = EASE.enter(Math.min(1, (ph - P.pre) / (P.main - P.pre))); el.push(<ellipse key="pan" cx={fx} cy={fy} rx={20 * (1 - 0.65 * e)} ry={20 + 46 * e} fill={tin} stroke={H.text2} strokeWidth={2} opacity={vk} />); }
    if (ph >= P.main) {
      const u = (ph - P.main) / (1 - P.main), fade = Math.pow(1 - u, 1.4), r = 22 + 52 * EASE.enter(Math.min(1, u * 3));
      el.push(<circle key="halo" cx={fx} cy={fy} r={r * 1.7} fill={glow} opacity={vk * fade * 0.18} />, <circle key="pl" cx={fx} cy={fy} r={r} fill={glow} opacity={vk * fade * 0.85} />);
      for (let j = 0; j < 8; j++) { const an = (j / 8) * Math.PI * 2 + 0.3, r0 = r + 6, r1 = r + 18 + 40 * EASE.enter(u); el.push(<line key={`ray${j}`} x1={fx + Math.cos(an) * r0} y1={fy + Math.sin(an) * r0} x2={fx + Math.cos(an) * r1} y2={fy + Math.sin(an) * r1} stroke={glow} strokeWidth={5} strokeLinecap="round" opacity={vk * fade} />); }
    }
  }
  const step = !on ? -1 : ph < P.pre ? 0 : ph < P.main ? 1 : ph < P.main + 0.1 ? 2 : 3;
  const items = ((o as any).items ?? []) as { text: string; at?: number }[];
  return (
    <SecCard o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        {/* 噴嘴、回收口、雷射進來的方向 */}
        <rect x={fx - 14} y={top - 4} width={28} height={16} fill={H.text3} />
        <rect x={fx - 22} y={Hh - 26} width={44} height={14} fill={H.text3} />
        <line x1={20} y1={fy} x2={fx - 30} y2={fy} stroke={main} strokeOpacity={0.25} strokeWidth={2} strokeDasharray="8 7" />
        <text x={24} y={fy - 16} style={zh(sm(30), H.text2, 800)}>雷射 →</text>
        {/* 收集鏡（碗形，側視）：中間留孔讓雷射穿過 */}
        <path d={`M ${fx - 70} ${top + 6} Q ${fx - 175} ${fy - 60} ${fx - 150} ${fy - 16}`} fill="none" stroke={C("mirror", H.amber)} strokeWidth={9} strokeLinecap="round" />
        <path d={`M ${fx - 150} ${fy + 16} Q ${fx - 175} ${fy + 60} ${fx - 70} ${Hh - 8}`} fill="none" stroke={C("mirror", H.amber)} strokeWidth={9} strokeLinecap="round" />
        <text x={fx - 215} y={Hh - 40} textAnchor="middle" style={zh(sm(30), H.text2, 800)}>收集鏡</text>
        {el}
      </svg>
      <SecSteps items={items} f={f} active={step} x={vw + 10} y={top + 6} w={W - vw - 30} gap={Math.max(60, Math.floor((Hh - top - 16) / Math.max(1, items.length)))} />
    </SecCard>
  );
};

/** 鉬／矽多層膜的 2D 剖面（overlay section 加 kind: "multilayer"；2026/11/15 tech-euv）：一層鉬（深）一層矽（淺）往下疊，
 *  光從上面斜斜打進來，每一個交界面都反射回一小部分（越深越淡），全部加起來就是鏡子反射的光。pairs＝畫幾對（示意，不是實際層數）；
 *  legend＝[{ text, swatch }]（swatch 寫 model.palette 的色名）；result＝右下大字（例如「最多約 70%」）、textAt＝念到才出現；note＝說明小字 */
const HudSectionMultilayer: React.FC<{ o: Overlay3D; f: number; k: number; m: Model3D }> = ({ o, f, k, m }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330, top = 60, n = (o as any).pairs ?? 12, tm = 6, ts = 10, sx0 = 24, sx1 = Math.round(W * 0.52), y0 = top + 64, hx = Math.round(sx0 + (sx1 - sx0) * 0.38), sl = 0.55;
  const mo = col(m.product, (o as any).mo ?? "mo"), si = col(m.product, (o as any).si ?? "si"), lt = col(m.product, (o as any).light ?? "euv");
  const layers: React.ReactNode[] = [], refl: React.ReactNode[] = [], dots: React.ReactNode[] = [];
  // 一對一對由下往上疊（每 2 幀一對），疊完光才打進來
  const stackAt = (o as any).stack?.at ?? o.at; // stack: { at }（巢狀的 at 會被 engine 換成幀）
  for (let i = 0; i < n; i++) { const y = y0 + i * (tm + ts), sh = tween(f, stackAt + (n - 1 - i) * 2, 4, EASE.enter), dy = Math.round(-30 * (1 - sh)); layers.push(<g key={`p${i}`} opacity={sh} transform={`translate(0 ${dy})`}><rect x={sx0} y={y} width={sx1 - sx0} height={tm} fill={mo} /><rect x={sx0} y={y + tm} width={sx1 - sx0} height={ts} fill={si} /></g>); }
  const yb = y0 + n * (tm + ts), lit = stackAt + n * 2 + 4;
  const inX0 = hx - sl * (y0 - top + 6), g = tween(f, lit, 16, EASE.move);
  // 每一個交界面反射回一小部分：越深越淡（只是示意衰減，不是計算值）
  const nr = Math.min(n, 9);
  for (let i = 0; i < nr; i++) {
    const y = y0 + i * (tm + ts), x = hx + sl * (y - y0), x1 = x + sl * (y - top + 6), w = Math.pow(0.78, i), gi = tween(f, o.at + 10 + i * 3, 10, EASE.move);
    refl.push(<line key={`r${i}`} x1={x} y1={y} x2={x + (x1 - x) * gi} y2={y - (y - top + 6) * gi} stroke={lt} strokeWidth={2 + 5 * w} strokeOpacity={0.25 + 0.75 * w} strokeLinecap="round" />);
    // 往回走的光點
    const u = ((f * 0.045 + i * 0.13) % 1);
    if (gi > 0.99) dots.push(<circle key={`p${i}`} cx={x + (x1 - x) * u} cy={y - (y - top + 6) * u} r={4 + 4 * w} fill={lt} opacity={(0.3 + 0.7 * w) * Math.min(1, u * 8, (1 - u) * 8)} />);
  }
  const deepX = hx + sl * (yb - y0);
  const uIn = (f * 0.045) % 1;
  const legend = ((o as any).legend ?? []) as { text: string; swatch: string }[];
  const res = (o as any).result as string | undefined, rAt = (o as any).textAt ?? o.at;
  return (
    <SecCard o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        {layers}
        <rect x={sx0} y={yb} width={sx1 - sx0} height={Hh - yb} fill={H.text3} opacity={0.35} />
        {(o as any).base ? <text x={sx0 + 12} y={Hh - 10} style={zh(sm(30), H.text, 800)}>{(o as any).base}</text> : null}
        {/* 打進來的光、往深處越走越弱（虛線） */}
        <line x1={inX0} y1={top - 6} x2={inX0 + (hx - inX0) * g} y2={top - 6 + (y0 - top + 6) * g} stroke={lt} strokeWidth={8} strokeLinecap="round" />
        {g > 0.99 ? <line x1={hx} y1={y0} x2={deepX} y2={yb} stroke={lt} strokeWidth={3} strokeDasharray="6 6" strokeOpacity={0.45} /> : null}
        {g > 0.99 ? <circle cx={inX0 + (hx - inX0) * uIn} cy={top - 6 + (y0 - top + 6) * uIn} r={7} fill={lt} /> : null}
        {refl}{dots}
      </svg>
      <div style={{ position: "absolute", left: sx1 + 26, top: top + 4, display: "flex", flexDirection: "column", gap: 10 }}>
        <div style={{ display: "flex", gap: 22 }}>{legend.map((it, j) => <div key={j} style={{ display: "flex", alignItems: "center", gap: 10 }}><div style={{ width: 34, height: 26, background: col(m.product, it.swatch), border: `1.5px solid ${H.text3}` }} /><div style={zh(32, H.text, 800)}>{it.text}</div></div>)}</div>
        {(o as any).note ? <div style={{ ...zh(sm(30), H.text2, 700), whiteSpace: "pre-line", width: W - sx1 - 50, lineHeight: 1.2 }}>{(o as any).note}</div> : null}
      </div>
      {(o as any).split ? (() => {
        // 入射 100／反射 70／吸收 30（2026/11/15 v3，結構驗收）：三條長條，念到 textAt 才長出來
        const g2 = tween(f, rAt, 14, EASE.move), rows = (o as any).split as { label: string; v: number; color?: string }[], bw = W - sx1 - 60 - 150;
        return <div style={{ position: "absolute", left: sx1 + 26, bottom: 12, display: "flex", flexDirection: "column", gap: 4 }}>
          {rows.map((r, j) => <div key={j} style={{ display: "flex", alignItems: "center", gap: 10, height: 32, opacity: Math.min(1, g2 * 2) }}>
            <div style={{ ...zh(30, H.text, 800), lineHeight: 1, width: 140, flex: "none" }}>{r.label}</div>
            <div style={{ width: bw, height: 22, background: H.bg, border: `1.5px solid ${H.text3}`, position: "relative" }}><div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: `${(100 * (r.v / 100) * g2).toFixed(1)}%`, background: hudAccent(r.color) }} /></div>
          </div>)}
        </div>;
      })() : null}
      {res ? <div style={{ position: "absolute", right: 20, bottom: 14, ...zh(52, H.amber, 900), opacity: tween(f, rAt, 8, EASE.enter), transform: `scale(${(1 + 0.14 * Math.sin(Math.PI * tween(f, rAt, 10, EASE.move))).toFixed(3)})`, transformOrigin: "right bottom" }}>{res}</div> : null}
    </SecCard>
  );
};

/** 空氣 vs 真空（overlay section 加 kind: "air"；2026/11/15 tech-euv）：一道光從左往右走。有空氣時（灰色粒子）光走沒多遠就被吸光；
 *  念到 textAt（例如「真空」）時粒子往上被抽走，同一道光就能走到右邊。labels: { air, vac }＝左上兩句說明。顏色讀皮膚＋model.palette */
const HudSectionAir: React.FC<{ o: Overlay3D; f: number; k: number; m: Model3D }> = ({ o, f, k, m }) => {
  const W = o.w ?? 952, Hh = o.h ?? 240, top = 64, y = Math.round(top + (Hh - top) * 0.55), x0 = 30, x1 = W - 40, lt = col(m.product, (o as any).light ?? "euv");
  const vt = (o as any).textAt ?? 1e9, pump = tween(f, vt, 18, EASE.move), lab = ((o as any).labels ?? {}) as { air?: string; vac?: string };
  const parts: React.ReactNode[] = [];
  for (let i = 0; i < 30; i++) {
    const hx = hash01s(i * 3.1 + 0.4), hy = hash01s(i * 7.7 + 2.1), sp = 0.6 + hash01s(i * 1.3) * 0.8;
    const px = x0 + hx * (x1 - x0) + Math.sin(f * 0.05 * sp + i) * 6, py0 = top + 8 + hy * (Hh - top - 16) + Math.cos(f * 0.04 * sp + i) * 5;
    const py = py0 - pump * (py0 + 40) * (0.7 + 0.6 * hx);
    parts.push(<circle key={i} cx={px} cy={py} r={11} fill={H.text3} opacity={0.75 * (1 - pump)} />);
  }
  // 光：有空氣時走到 reach 就暗掉；抽真空後一路走到底
  const reach = 0.3 + 0.7 * pump, dots: React.ReactNode[] = [];
  for (let i = 0; i < 7; i++) {
    const u = ((f - o.at) / 46 - i / 7) % 1; if (f - o.at < (i / 7) * 46 || u < 0) continue;
    const fade = u < reach ? 1 - (pump < 1 ? Math.max(0, (u - reach * 0.55) / (reach * 0.45)) * (1 - pump) : 0) : 0;
    if (fade <= 0.02) continue;
    dots.push(<circle key={`d${i}`} cx={x0 + u * (x1 - x0)} cy={y} r={9} fill={lt} opacity={fade} />);
  }
  return (
    <SecCard o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        <line x1={x0} y1={y} x2={x0 + reach * (x1 - x0)} y2={y} stroke={lt} strokeWidth={4} strokeOpacity={0.3} strokeDasharray="10 8" />
        {parts}{dots}
        {pump > 0.05 ? [0.2, 0.5, 0.8].map((u, i) => <path key={i} d={`M ${x0 + u * (x1 - x0)} ${top + 70} v -40 m -12 14 l 12 -14 l 12 14`} stroke={H.text2} strokeWidth={4} fill="none" opacity={Math.sin(Math.PI * pump)} />) : null}
      </svg>
      <div style={{ position: "absolute", left: 250, top: 8, ...zh(38, pump > 0.5 ? H.line : H.coral, 800) }}>{pump > 0.5 ? lab.vac ?? "真空：光能通過" : lab.air ?? "有空氣：光被吸掉"}</div>
    </SecCard>
  );
};

/** 掃描曝光的 2D 側視（overlay section 加 kind: "scan"；2026/11/15 tech-euv）：上面光罩、下面晶圓，中間一道固定的光縫；
 *  光罩和晶圓反方向移動（位移讀 model.json 的 vibrate 動作 mask／wafer 的同一份數值，px＝模型單位換成像素），光縫掃過的地方，光罩上的圖案縮小印到晶圓上。
 *  mirrors＝中間那一塊的字（例如「6 面反射鏡」）；labels: { mask, wafer } */
const HudSectionScan: React.FC<{ o: Overlay3D; f: number; k: number; m: Model3D; s: State3D }> = ({ o, f, k, m, s }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330, top = 58, acts = m.product.actions ?? {}, px = (o as any).px ?? 60, cx = Math.round(W * 0.56);
  const dm = acts[(o as any).mask] as any, dw = acts[(o as any).wafer] as any, om = s.ops[(o as any).mask], ow = s.ops[(o as any).wafer];
  // vibrate 的位移（和 Ops.tsx 的 partFxAt 同一個式子）；往回取樣時強度用「觸發後 8 幀內爬到 1」近似，當下這一幀用 engine 的 op.g
  const offAt = (d: any, op: any, fr: number) => { if (!d || !op) return 0; const n = fr - (f - op.n); if (n < 0) return 0; const g = fr === f ? op.g : Math.min(1, n / 8); return (d.axis?.[0] ?? 1) * (d.amp ?? 0.1) * g * Math.sin(Math.PI * 2 * (d.freq ?? 1) * (op.T - (f - fr) / FPS)); };
  const mOff = offAt(dm, om, f) * px, wOff = offAt(dw, ow, f) * px;
  // 光罩上的圖案（相對光罩中心，px）：幾組寬窄不同的線
  const pat: [number, number][] = [];
  for (let i = -14; i <= 14; i++) { const x = i * 26; if (Math.abs(i) % 5 === 4) continue; pat.push([x, i % 3 === 0 ? 14 : 8]); }
  const red = (o as any).ratio ?? 4, slitW = 30, ym = top + 40, yw = Hh - 54;
  // 印上去的：光罩上 x 的線，被光縫照到時印在晶圓的 -x/red 處；往回取樣到觸發那一幀，掃過光縫的才印
  const printed = new Set<number>();
  if (om && om.n >= 0) for (let fr = Math.max(f - om.n, f - 240); fr <= f; fr += 1) { const mo = offAt(dm, om, fr) * px; pat.forEach(([x], j) => { if (Math.abs(cx + mo + x - cx) < slitW / 2) printed.add(j); }); }
  const lt = col(m.product, (o as any).light ?? "euv"), lab = ((o as any).labels ?? {}) as { mask?: string; wafer?: string };
  const vm = dm && om ? Math.cos(Math.PI * 2 * (dm.freq ?? 1) * om.T) * (dm.axis?.[0] ?? 1) : 0, vwv = -vm;
  const arrow = (x: number, y: number, dir: number) => <path opacity={0.35 + 0.65 * Math.min(1, Math.abs(dir) * 1.5)} d={dir > 0 ? `M ${x - 26} ${y} H ${x + 22} M ${x + 10} ${y - 10} L ${x + 24} ${y} L ${x + 10} ${y + 10}` : `M ${x + 26} ${y} H ${x - 22} M ${x - 10} ${y - 10} L ${x - 24} ${y} L ${x - 10} ${y + 10}`} stroke={H.text} strokeWidth={4} fill="none" strokeLinecap="round" />;
  return (
    <SecCard o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        {/* 光罩（反射式）：上面是基板，朝下那一面是亮的多層膜鏡面，暗色方塊是吸收層（圖案）。光從左下斜斜打上來、反射往右下，不穿過光罩 */}
        <rect x={0} y={ym} width={W} height={30} fill={H.text3} opacity={0.55} />
        <rect x={0} y={ym + 30} width={W} height={10} fill={H.lineSoft} />
        {pat.map(([x, w], j) => <rect key={`m${j}`} x={cx + mOff + x - w / 2} y={ym + 30} width={w} height={12} fill={H.text} />)}
        <polygon points={`${cx - 150},${ym + 160} ${cx - 118},${ym + 160} ${cx + slitW / 2},${ym + 42} ${cx - slitW / 2},${ym + 42}`} fill={lt} opacity={0.32} />
        <polygon points={`${cx - slitW / 2},${ym + 42} ${cx + slitW / 2},${ym + 42} ${cx + 150},${ym + 110} ${cx + 120},${ym + 110}`} fill={lt} opacity={0.26} />
        <polygon points={`${cx + 120},${ym + 110} ${cx + 150},${ym + 110} ${cx + slitW / (2 * red) + 3},${yw} ${cx - slitW / (2 * red) - 3},${yw}`} fill={lt} opacity={0.3} />
        {[[cx + 135, ym + 110]].map(([x, y], i) => <rect key={i} x={x - 34} y={y - 6} width={68} height={12} rx={3} fill={(m.product.palette as any).mirror ?? H.amber} />)}
        <rect x={cx + 190} y={ym + 92} width={W - cx - 210} height={44} fill={H.panel} stroke={H.line} strokeWidth={2.5} />
        <text x={cx + 190 + (W - cx - 210) / 2} y={ym + 125} textAnchor="middle" style={zh(sm(30), H.text, 800)}>{(o as any).mirrors ?? "投影反射鏡"}</text>
        <path d={`M ${cx + 190} ${ym + 114} H ${cx + 160}`} stroke={H.line} strokeWidth={2.5} />
        {/* 晶圓：感光層＋已經印上去的線（縮小 red 倍、左右相反）；光縫是固定的一小段 */}
        <rect x={0} y={yw} width={W} height={22} fill={col(m.product, "resist")} />
        <rect x={0} y={yw + 22} width={W} height={18} fill={H.text3} opacity={0.6} />
        {pat.map(([x, w], j) => printed.has(j) ? <rect key={`w${j}`} x={cx + wOff - x / red - Math.max(2, w / red) / 2} y={yw} width={Math.max(2.5, w / red)} height={22} fill={H.line} /> : null)}
        <rect x={cx - slitW / (2 * red) - 3} y={yw - 4} width={slitW / red + 6} height={30} fill="none" stroke={lt} strokeWidth={2.5} />
        <text x={20} y={ym - 8} style={zh(sm(30), H.text, 800)}>{lab.mask ?? "光罩"}</text>
        {arrow(Math.round(textW(lab.mask ?? "光罩", 30, 0) + 70), ym - 18, vm)}
        <text x={20} y={Hh - 10} style={zh(sm(30), H.text, 800)}>{lab.wafer ?? "晶圓"}</text>
        {arrow(Math.round(textW(lab.wafer ?? "晶圓", 30, 0) + 70), Hh - 20, vwv)}
        {(o as any).note ? <text x={W - 20} y={ym - 8} textAnchor="end" style={zh(sm(30), H.text, 800)}>{(o as any).note}</text> : null}
        {(o as any).cmp ? (() => {
          // 接回 s4：以前 193 nm 同一層要畫 4 次、極紫外光 1 次（顏色和 s4 的四次一樣）
          const g3 = tween(f, (o as any).cmp.at ?? o.at, 8, EASE.enter), PASS = [H.art.sheet, H.amber, H.coral, H.art.fin], y1 = ym + 80, y2 = ym + 126;
          return <g opacity={g3}>
            <text x={20} y={y1} style={zh(sm(30), H.text2, 800)}>193 nm</text>
            {PASS.map((c, j) => <rect key={j} x={140 + j * 34} y={y1 - 24} width={24} height={28} fill={c} />)}
            <text x={284} y={y1} style={zh(sm(30), H.text2, 800)}>4 次</text>
            <text x={20} y={y2} style={zh(sm(30), H.text, 900)}>極紫外光</text>
            <rect x={160} y={y2 - 24} width={24} height={28} fill={lt} />
            <text x={196} y={y2} style={zh(32, H.amber, 900)}>1 次</text>
          </g>; })() : null}
      </svg>
    </SecCard>
  );
};
/** 矽穿孔（TSV）加工剖面（overlay section 加 kind: "tsv"；2026/11/17 tech-hbm v2）：一塊矽的側面剖開。
 *  依序：打孔（由上往下）→ 填銅（由下往上）→ 貼載板、翻面 → 磨輪從背面磨掉多餘的矽 → 銅柱頭露出。t＝{ holes, fill, car, flip, grind, end: { at } }（巢狀 at 會被 engine 換成幀）；
 *  磨輪連續磨 grindDur 幀（預設 60），磨輪轉動、矽變薄；items＝右側步驟列（沒寫就用預設五步）。示意，不是實際比例。 */
const HudSectionTsv: React.FC<{ o: Overlay3D; f: number; k: number; m: Model3D }> = ({ o, f, k, m }) => {
  const W = o.w ?? 952, Hh = o.h ?? 340, t = ((o as any).t ?? {}) as Record<string, { at: number }>, gd = (o as any).grindDur ?? 60;
  const A = (n: string) => t[n]?.at ?? o.at;
  const c = (n: string) => col(m.product, n);
  const si = c("si"), siDk = c("siDk"), cu = c("cu"), cuHi = c("cuHi"), liner = c("liner"), slot = c("slot"), car = c("carrier"), adh = c("adh"), tr = c("siTop"), steel = c("steel"), teeth = c("teeth");
  const bx = 30, bw = 440, oy = 196, py = 62, S = 150, CY0 = 12, HD = 100, REM = 42, NC = 8;
  const drill = tween(f, A("holes"), 36, EASE.move), fill = tween(f, A("fill"), 16, EASE.move);
  const carP = tween(f, A("car"), 8, EASE.enter), flP = tween(f, A("flip"), 14, EASE.move);
  const gr = Math.min(1, Math.max(0, (f - A("grind")) / gd)), grE = gr * gr * (3 - 2 * gr);
  const botY = S - REM * grE, flipped = flP > 0.5, ang = 180 * flP;
  const ysc = (y: number) => (flipped ? oy + py - y : oy + y - py);
  const hx = (i: number) => bx + 32 + i * 52;
  const cols: React.ReactNode[] = [];
  for (let i = 0; i < NC; i++) {
    const x = hx(i), dh = HD * drill, ch = (HD - 2) * fill;
    cols.push(<g key={i}>
      <rect x={x - 11} y={CY0} width={22} height={dh} fill={liner} />
      <rect x={x - 8} y={CY0} width={16} height={dh} fill={slot} />
      <rect x={x - 8} y={CY0 + HD - ch} width={16} height={ch} fill={cu} />
      {gr > 0.92 ? <rect x={x - 8} y={CY0 + HD - 1} width={16} height={6} fill={cuHi} /> : null}
    </g>);
  }
  const ex = Math.max(0, Math.min(1, (f - (A("grind") + gd)) / 8)); // 磨完：銅柱頭亮起
  const wOn = tween(f, A("grind") - 8, 8, EASE.move), wOff = tween(f, A("grind") + gd + 2, 8, EASE.move);
  const wTop = ysc(Math.min(botY, S)) ; // 磨輪底面＝矽的外表面
  const wy = wTop - 46 - 70 * (1 - wOn) - 90 * wOff, wcx = bx + bw / 2, spin = (f * 7) % 24;
  const items = ((o as any).items ?? ["打孔", "填銅", "翻面貼載板", "背面磨薄", "銅柱露出"]) as string[];
  const marks = [A("holes"), A("fill"), A("flip"), A("grind") - 8, A("end")];
  let act = -1; marks.forEach((a, j) => { if (f >= a) act = j; });
  const labA = flP < 0.02 ? 1 : flP > 0.98 ? 1 : 0;
  return (
    <SecCard o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        <g transform={`rotate(${ang.toFixed(2)} ${bx + bw / 2} ${oy})`}>
          <g transform={`translate(0 ${oy - py})`}>
            <rect x={bx} y={CY0} width={bw} height={botY - CY0} fill={si} />
            <rect x={bx} y={CY0 + HD} width={bw} height={Math.max(0, botY - (CY0 + HD))} fill={siDk} opacity={0.9} />
            <rect x={bx} y={0} width={bw} height={CY0} fill={tr} />
            {cols}
          </g>
        </g>
        {/* 載板與黏著層：翻面後貼在電路面那一側（畫面下方） */}
        <g opacity={carP} transform={`translate(0 ${(1 - carP) * 24})`}>
          <rect x={bx - 14} y={oy + py - 0} width={bw + 28} height={6} fill={adh} />
          <rect x={bx - 14} y={oy + py + 6} width={bw + 28} height={20} fill={car} stroke={H.text3} strokeWidth={1.5} />
        </g>
        {/* 磨輪（轉動）：從背面往下壓、把多餘的矽磨掉 */}
        {wOn > 0 && wOff < 1 ? <g>
          <rect x={wcx - 120} y={wy} width={240} height={26} fill={steel} stroke={H.text3} strokeWidth={1.5} />
          <rect x={wcx - 120} y={wy + 26} width={240} height={12} fill={teeth} />
          {Array.from({ length: 12 }, (_, j) => <rect key={j} x={wcx - 120 + ((j * 24 + spin) % 240)} y={wy + 26} width={8} height={12} fill={cuHi} opacity={0.9} />)}
          <rect x={wcx - 10} y={wy - 50} width={20} height={50} fill={steel} />
        </g> : null}
        {/* 標籤 */}
        {labA && fill > 0.98 && gr < 0.02 ? <text x={bx + bw + 10} y={ysc(CY0 + HD + REM / 2) + 8} style={zh(sm(30), H.text2, 800)}>磨掉</text> : null}
        {ex > 0 ? <text x={bx + bw + 10} y={ysc(CY0 + HD) + 8} style={zh(sm(30), H.amber, 900)} opacity={ex}>銅柱露出</text> : null}
        {ex > 0 ? Array.from({ length: NC }, (_, i) => <circle key={i} cx={hx(i)} cy={ysc(CY0 + HD + 3)} r={9 * ex} fill={cuHi} opacity={0.35 * ex} />) : null}
        <g>{[["矽", si], ["銅", cu], ["孔襯層", liner], ["載板", car]].map(([n, cl], j) => <g key={j}><rect x={24 + j * 150} y={Hh - 40} width={28} height={22} fill={cl as string} stroke={H.text3} strokeWidth={1.5} /><text x={60 + j * 150} y={Hh - 20} style={zh(sm(30), H.text, 800)}>{n as string}</text></g>)}</g>
      </svg>
      <SecSteps items={items.map((text, j) => ({ text: `${"①②③④⑤"[j]} ${text}`, at: marks[j] - 4 }))} f={f} active={act} x={bx + bw + 150} y={62} w={W - (bx + bw + 150) - 16} gap={50} px={28} />
    </SecCard>
  );
};
const HudSection: React.FC<{ o: Overlay3D; f: number; k: number; m: Model3D; s: State3D }> = ({ o, f, k, m, s }) => {
  if ((o as any).kind === "tsv") return <HudSectionTsv o={o} f={f} k={k} m={m} />;
  if (String((o as any).kind ?? "").startsWith("srv-")) return <SrvSection o={o} f={f} k={k} m={m} />; // 2026/11/17 tech-server（HudServer.tsx）
  if (String((o as any).kind ?? "").startsWith("pw-")) return <PwSection o={o} f={f} k={k} m={m} />; // 2026/11/17 tech-800v（HudPower.tsx）
  if (String((o as any).kind ?? "").startsWith("dep-")) return <DepSection o={o} f={f} k={k} m={m} />; // 2026/11/18 tech-deposition（HudDep.tsx）
  if (String((o as any).kind ?? "").startsWith("ic-")) return <IcSection o={o} f={f} k={k} m={m} />; // 2026/11/18 tech-icdesign（HudIc.tsx）
  if (String((o as any).kind ?? "").startsWith("fdy-")) return <FdySection o={o} f={f} k={k} m={m} />; // 2026/11/18 tech-foundry（HudFoundry.tsx）
  if (String((o as any).kind ?? "").startsWith("wf-")) return <WfSection o={o} f={f} k={k} m={m} />; // 2026/11/18 tech-waferflow（HudWafer.tsx）
  if (String((o as any).kind ?? "").startsWith("fdy-")) return <FdySection o={o} f={f} k={k} m={m} />; // 2026/11/18 tech-foundry（HudFoundry.tsx）
  if (String((o as any).kind ?? "").startsWith("cool-")) return <CoolSection o={o} f={f} k={k} m={m} />; // 2026/11/17 tech-cooling（HudCool.tsx）
  if (String((o as any).kind ?? "").startsWith("etch-")) return <EtchSection o={o} f={f} k={k} m={m} />; // 2026/11/18 tech-etch（HudEtch.tsx）
  if (String((o as any).kind ?? "").startsWith("hbm-")) return <HbmSection o={o} f={f} k={k} m={m} />; // 2026/11/17 tech-hbm v3（HudHbm.tsx）
  if (String((o as any).kind ?? "").startsWith("pkg-")) return <PkgSection o={o} f={f} k={k} m={m} s={s} />; // 2026/11/16 tech-packaging（HudPkg.tsx）
  if ((o as any).kind === "path") return <HudSectionPath o={o} f={f} k={k} m={m} s={s} />;
  if ((o as any).kind === "lpp") return <HudSectionLpp o={o} f={f} k={k} m={m} s={s} />;
  if ((o as any).kind === "multilayer") return <HudSectionMultilayer o={o} f={f} k={k} m={m} />;
  if ((o as any).kind === "scan") return <HudSectionScan o={o} f={f} k={k} m={m} s={s} />;
  if ((o as any).kind === "air") return <HudSectionAir o={o} f={f} k={k} m={m} />;
  const A = H.art, acts = m.product.actions ?? {}, W = o.w ?? 600, Hh = o.h ?? 300, meters = (o.meters ?? []) as string[];
  const mw = meters.length ? 300 : 0, dw = W - mw - 24, top = 58, bot = Hh - 44, flows = (o.flows ?? []) as string[];
  const g = clamp01(s.ops[o.gate]?.g ?? 0), ch = clamp01(s.ops[o.channel]?.g ?? 0);
  const sx0 = 24, sx1 = 24 + dw * 0.2, dx0 = 24 + dw * 0.8, dx1 = 24 + dw, gx0 = 24 + dw * 0.4, gx1 = 24 + dw * 0.6;
  const ys = flows.map((_, j) => bot - 18 - ((bot - 18 - top - 18) * (j + 0.5)) / flows.length);
  const sheetH = Math.max(10, ((bot - top) / flows.length) * 0.32);
  const lab = (o.labels ?? {}) as { src?: string; drn?: string; gate?: string };
  const dots: React.ReactNode[] = [];
  flows.forEach((id, j) => {
    const d = acts[id] as any, op = s.ops[id];
    if (!d || !op) return;
    const restK = d.rest && op.f >= op.until ? (d.restO ?? 0.55) * (1 - tween(op.f, op.end + d.rest, 8, EASE.move)) : 0, vis = Math.max(op.k, restK);
    if (vis <= 0.01) return;
    const speed = Math.min(1, op.g), keep = Math.max(d.minVisible ?? 0.35, speed), n = (d.n ?? 4) * Math.max(1, d.lanes ?? 1);
    // 2D 路徑：源極上方往下 → 沿通道 → 汲極往上；三段長度比照 3D 路徑（腿長 : 通道長）
    const P = (d.path ?? []).map((p: any) => (Array.isArray(p) ? p : p.p)), seg = P.slice(1).map((p: number[], i: number) => Math.hypot(p[0] - P[i][0], p[1] - P[i][1], (p[2] ?? 0) - (P[i][2] ?? 0))), tot = seg.reduce((a: number, b: number) => a + b, 0) || 1;
    const legF = seg.length === 3 ? seg[0] / tot : 0, y = ys[j], xa = (sx0 + sx1) / 2, xb = (dx0 + dx1) / 2;
    const at = (u: number) => (legF && u < legF ? [xa, top + (y - top) * (u / legF)] : legF && u > 1 - legF ? [xb, y - (y - top) * ((u - (1 - legF)) / legF)] : [xa + (xb - xa) * ((u - legF) / Math.max(1e-6, 1 - 2 * legF)), y]);
    for (let i = 0; i < n; i++) {
      const rk = hash01s((j * n + i) * 7.13 + 1.7), raw = op.u * (d.rate ?? 0.8) - (d.phase ?? 0) - i / n;
      if (raw < 0 || rk > keep) continue;
      const u = raw - Math.floor(raw), e = Math.min(1, u * 10, (1 - u) * 10) * vis * Math.min(1, (keep - rk) * 8);
      for (let t = 3; t >= 0; t--) { const uu = u - t * 0.025 * speed; if (uu <= 0 || (t && speed < 0.05)) continue; const [x, yy] = at(uu); dots.push(<circle key={`${id}-${i}-${t}`} cx={x} cy={yy} r={t ? 5 - t : 7} fill={t ? A.inner : H.panel} stroke={t ? "none" : H.line} strokeWidth={2.5} opacity={e * (t ? 0.55 - t * 0.12 : 1)} />); }
    }
  });
  return (
    <div style={{ position: "absolute", left: o.x ?? L.X, top: o.y ?? 900, width: W, height: Hh, opacity: k, background: H.cardCompare, border: `2px solid ${H.lineSoft}`, boxSizing: "border-box" }}>
      {o.title ? <div style={{ position: "absolute", left: 16, top: 10, ...zh(30, onC(H.line), 800), background: H.line, padding: "2px 14px 4px" }}>{o.title}</div> : null}
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        <rect x={sx0} y={top} width={sx1 - sx0} height={bot - top} fill={A.sd} opacity={0.85} />
        <rect x={dx0} y={top} width={dx1 - dx0} height={bot - top} fill={A.sd} opacity={0.85} />
        {/* 閘極（包住通道的那一段）：電壓越高越亮 */}
        <rect x={gx0} y={top - 6} width={gx1 - gx0} height={bot - top + 12} fill={A.gate} opacity={0.35 + 0.65 * g} />
        {ys.map((y, j) => <rect key={j} x={sx1} y={y - sheetH / 2} width={dx0 - sx1} height={sheetH} fill={ch > 0.05 ? (H.parts as any).inv ?? A.sheet : A.sheet} opacity={0.75 + 0.25 * ch} stroke={A.hk} strokeWidth={2} />)}
        {dots}
        {lab.src ? <text x={(sx0 + sx1) / 2} y={Hh - 10} textAnchor="middle" style={zh(sm(30), H.text, 800)}>{lab.src}</text> : null}
        {lab.drn ? <text x={(dx0 + dx1) / 2} y={Hh - 10} textAnchor="middle" style={zh(sm(30), H.text, 800)}>{lab.drn}</text> : null}
        {lab.gate ? <text x={(gx0 + gx1) / 2} y={top - 12} textAnchor="middle" style={zh(sm(30), g > 0.5 ? onC(H.amber) : H.text, 800)}>{lab.gate}</text> : null}
      </svg>
      {meters.length ? <div style={{ position: "absolute", right: 14, top: 14, width: mw - 10, display: "flex", flexDirection: "column", gap: 18, borderLeft: `2px solid ${H.lineSoft}`, paddingLeft: 14 }}>
        {meters.map((id) => { const d = acts[id] as any; if (!d) return null; const lv = d.source ? signalLevel(m.product, s, d.source) : clamp01(s.ops[id]?.g ?? 0), c = hudAccent(d.accent);
          return <div key={id}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}><div style={zh(30, H.text, 800)}>{d.label}</div><div style={mono(sm(28), c, 700)}>{d.sym ?? ""}</div></div>
            <div style={{ position: "relative", height: 16, marginTop: 4, background: H.bg, border: `1.5px solid ${H.text3}` }}><div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: `${(100 * Math.max(0.03, lv)).toFixed(1)}%`, background: c }} /></div>
            <div style={{ display: "flex", justifyContent: "space-between" }}><div style={zh(sm(24), lv < 0.5 ? H.text : H.text3, 700)}>{d.lo ?? ""}</div><div style={zh(sm(24), lv >= 0.5 ? c : H.text3, 700)}>{d.hi ?? ""}</div></div>
          </div>; })}
      </div> : null}
    </div>
  );
};

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
              {d.sym ? <div style={mono(sm(28), c, 700)}>{d.sym}</div> : null}
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

/** HUD 版的疊層：stamp 蓋章（實心色塊、微歪、先大後小）、card 下一支提問卡（深色框＋四角括號） */
const HudOverlays: React.FC<{ m: Model3D; f: number; list: Overlay3D[]; s: State3D }> = ({ m, f, list, s }) => {
  const { CX, CY } = cxy();
  return (
  <>
    {list.map((o: Overlay3D, i) => {
      if (f < o.at - 1) return null;
      const k = tween(f, o.at, 5, EASE.enter) * (1 - tween(f, o.until, 6, EASE.exit));
      if (k <= 0) return null;
      const c = hudAccent(o.color);
      if (o.type === "stamp" && o.style === "tag") {
        // 小標：細框深底（不是蓋章），說明這個數字是量誰的
        return <div key={i} style={{ position: "absolute", left: o.x ?? CX, top: o.y ?? CY, opacity: k, transform: `translate(-50%, -50%) translateY(${Math.round(10 * (1 - k))}px)`, ...zh(o.size ?? 34, c, 700), background: H.panel, border: `2px solid ${c}`, padding: "6px 20px 8px", letterSpacing: "0.04em" }}>{o.text}</div>;
      }
      if (o.type === "stamp") {
        // countTo（2026/11/15 tech-euv v3）：text 裡的 {n} 從 0 跳到 countTo（countDur 幀），例如「每秒 {n} 顆」
        if ((o as any).countTo !== undefined) { const c0 = (o as any).countFrom ?? 0, n = Math.round(c0 + (((o as any).countTo as number) - c0) * EASE.move(Math.min(1, Math.max(0, (f - o.at) / ((o as any).countDur ?? 24))))); o = { ...o, text: String(o.text).replace("{n}", n.toLocaleString("en-US")) }; }
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
      if (o.type === "section") return <HudSection key={i} o={o} f={f} k={k} m={m} s={s} />;
      if (o.type === "bars") {
        // 橫條對照（示意或廠商公布值）：rows: [{ label, v（0–1）, v2?（範圍的另一端，畫成斜線段）, color?, text, at?, textAt? }]；字都來自 script.json
        const rows = (o.rows ?? []) as { label: string; v: number; v2?: number; color?: string; text?: string; at?: number; textAt?: number }[], W = L.INNER_W, bw = W - 88;
        return (
          <div key={i} style={{ position: "absolute", left: L.X, top: o.y ?? 640, width: W, opacity: k, transform: `translateY(${Math.round(24 * (1 - k))}px)`, background: H.cardCompare, border: `2px solid ${H.lineSoft}`, boxSizing: "border-box", padding: o.compact ? "16px 36px 20px" : "20px 44px 30px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              {o.title ? <div style={{ ...zh(38, onC(H.line), 800), background: H.line, padding: "4px 20px 6px", letterSpacing: "0.04em" }}>{o.title}</div> : <div />}
              {o.tag ? <div style={{ ...zh(30, H.text2, 500) }}>{o.tag}</div> : null}
            </div>
            {rows.map((r, j) => {
              const at = r.at ?? o.at + 6 + j * 10, g = tween(f, at, 16, EASE.move), sh = tween(f, at - 2, 6, EASE.enter), cc = r.color ? hudAccent(r.color) : H.text2, tx = tween(f, r.textAt ?? at + 12, 6, EASE.enter);
              const pop = 1 + 0.14 * Math.sin(Math.PI * tween(f, r.textAt ?? at + 12, 10, EASE.move));
              // compact：一列一行（名稱｜橫條｜數字），卡片矮一半，放得進主素材下方的空白（2026/11/15 v6）
              if (o.compact) return (
                <div key={j} style={{ marginTop: 14, opacity: sh, display: "flex", alignItems: "center", gap: 18, height: 56 }}>
                  <div style={{ ...zh(36, H.text, 800), width: 300, flex: "none" }}>{r.label}</div>
                  <div style={{ position: "relative", flex: 1, height: 34, background: H.bg, border: `2px solid ${H.text3}`, boxSizing: "border-box" }}>
                    <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: `${(100 * r.v * g).toFixed(1)}%`, background: cc }} />
                    {r.v2 !== undefined ? <div style={{ position: "absolute", left: `${(100 * r.v * g).toFixed(1)}%`, top: 0, bottom: 0, width: `${(100 * (r.v2 - r.v) * g).toFixed(1)}%`, background: `repeating-linear-gradient(135deg, ${cc} 0 6px, transparent 6px 12px)` }} /> : null}
                  </div>
                  <div style={{ ...zh(r.color ? 46 : 38, cc, 900), width: 210, flex: "none", textAlign: "right", opacity: tx, transform: `scale(${pop.toFixed(3)})`, transformOrigin: "right center" }}>{r.text ?? ""}</div>
                </div>
              );
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
            {(o as any).rows ? (
              <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", columnGap: 36, rowGap: 6, alignItems: "center", marginTop: 6 }}>
                {((o as any).rows as string[][]).map((r, j) => { const on = !!o.hi && r[0].includes(o.hi), u = on ? under : 0, c0 = on && under > 0.3 ? H.amber : H.text;
                  return (<React.Fragment key={j}>
                    <div style={{ ...zh(size, c0, 900), lineHeight: 1.2, whiteSpace: "nowrap", borderBottom: `${on ? 6 : 0}px solid ${H.amber}`, opacity: 1 }}>{r[0]}</div>
                    <div style={{ ...zh(Math.round(size * 0.92), on && u > 0.3 ? H.amber : H.text2, 700), lineHeight: 1.2 }}>{r[1]}</div>
                  </React.Fragment>); })}
              </div>
            ) : null}
            {!(o as any).rows ? lines.map((ln, j) => {
              const hi = o.hi && ln.includes(o.hi) ? ln.split(o.hi) : null;
              return (
                <div key={j} style={{ ...zh(size, H.text), lineHeight: 1.28 }}>
                  {hi ? <>{hi[0]}<span style={{ position: "relative", color: under > 0.3 ? H.amber : H.text }}>{o.hi}<span style={{ position: "absolute", left: 0, bottom: 2, height: 10, width: `${(100 * under).toFixed(1)}%`, background: H.amber }} /></span>{hi[1]}</> : ln}
                </div>
              );
            }) : null}
            {o.foot ? <div style={{ ...mono(32, H.line, 600), marginTop: 18, fontFamily: `${H.font.mono}, ${FONT_ZH}` }}>{(o as any).rows ? "" : "NEXT ▸ "}{o.foot}</div> : null}
          </div>
        );
      }
      return null;
    })}
  </>
  );
};

/** 頻道標誌：開口圈（mark: "ring"）或方框；size＝外框邊長 px。頁首都用預設值（畫好、點在定位）。
 *  片尾卡動畫用的參數（2026/11/15 使用者：「Logo 需要符合頻道設計的含義去想」——開口圈＝圈子，缺口的暖色點＝進來的你）：
 *  draw（0–1）＝圓環從缺口對面（左下）同時往兩邊長，停在缺口兩端（不是沿一個方向繞，避免像載入圖示；圓環本身不轉）；
 *  dot＝{ x, y }（viewBox 單位，點的位置）、dotS＝點的大小倍率；ring（0–1）＝圓環「接住」的回應：線條微微變粗再恢復＋一圈淡色細線往外擴 */
const RING = { c: [50, 50], r: 25, dot: [67.68, 32.32], ends: [[74.69, 46.09], [53.91, 25.31]], far: [32.32, 67.68] } as const;
const HudMark: React.FC<{ size: number; draw?: number; dot?: { x: number; y: number }; dotS?: number; ring?: number; stroke?: number }> = ({ size, draw = 1, dot, dotS = 1, ring = 0, stroke = 9 }) => {
  if ((H as any).mark !== "ring") return <svg width={size} height={size} viewBox="0 0 46 46" style={{ display: "block" }}><rect x={3} y={3} width={40} height={40} fill="none" stroke={H.line} strokeWidth={3} pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - draw} /><rect x={15} y={15} width={16} height={16} fill={H.amber} transform={`scale(${dotS})`} transform-origin="23 23" /></svg>;
  const [fx, fy] = RING.far, [e1, e2] = RING.ends, sw = stroke * (1 + 0.28 * Math.sin(Math.PI * Math.min(1, ring)) * (ring > 0 && ring < 1 ? 1 : 0));
  const half = (d: string) => <path d={d} pathLength={1} strokeDasharray="1 1" strokeDashoffset={(1 - draw).toFixed(4)} fill="none" stroke={H.line} strokeWidth={sw} strokeLinecap="round" />;
  const d = dot ?? { x: RING.dot[0], y: RING.dot[1] };
  return (
    <svg width={size} height={size} viewBox="18 16 64 64" style={{ overflow: "visible", display: "block" }}>
      {draw >= 0.999 ? <path d={`M${e1[0]} ${e1[1]} A25 25 0 1 1 ${e2[0]} ${e2[1]}`} fill="none" stroke={H.line} strokeWidth={sw} strokeLinecap="round" /> : draw > 0.01 ? <>
        {half(`M${fx} ${fy} A25 25 0 0 0 ${e1[0]} ${e1[1]}`)}
        {half(`M${fx} ${fy} A25 25 0 0 1 ${e2[0]} ${e2[1]}`)}
      </> : null}
      {ring > 0 && ring < 1 ? <circle cx={RING.c[0]} cy={RING.c[1]} r={RING.r + 10 * ring} fill="none" stroke={H.line} strokeWidth={2.4 * (1 - ring) + 0.4} opacity={0.45 * (1 - ring)} /> : null}
      {dotS > 0.01 ? <circle cx={d.x} cy={d.y} r={6.6 * dotS} fill={H.amber} /> : null}
    </svg>
  );
};
/** 片尾卡的橘點路徑：從缺口外側沿一條短弧線進來，穿過缺口落在定稿位置；t＝落點前的進度（0–1，ease-out），after＝落定後幾秒（小回彈：沿進來的方向往圈內多走一點再回來） */
const dotPath = (t: number, after: number) => {
  const [Fx, Fy] = RING.dot, ux = 0.7071, uy = -0.7071, px = 0.7071, py = 0.7071; // u＝從圓心往缺口外、p＝順時針切線
  const S = [Fx + ux * 34 + px * 14, Fy + uy * 34 + py * 14], Q = [Fx + ux * 12 + px * 12, Fy + uy * 12 + py * 12];
  if (after <= 0) { const a = 1 - t; return { x: a * a * S[0] + 2 * a * t * Q[0] + t * t * Fx, y: a * a * S[1] + 2 * a * t * Q[1] + t * t * Fy }; }
  const dx = Fx - Q[0], dy = Fy - Q[1], n = Math.hypot(dx, dy), k = 3.2 * Math.exp(-6 * after) * Math.sin(14 * after);
  return { x: Fx + (dx / n) * k, y: Fy + (dy / n) * k };
};

/** 頁首：左＝頻道標誌＋頻道名（每一幕、包括片尾卡都在同一個位置、同樣大小；大小在 L.LOGO_PX／LOGO_NAME_PX），右＝標籤，下面一條進度線 */
/** corner＝"left"（預設，Andy 11-15 第一次指示：LOGO 固定左上）｜"right"（hud.logoCorner: "right"：LOGO 與頻道名換到右上、標籤換到左邊） */
const HudHeader: React.FC<{ name: string; tag: string; total: number; f: number; progress?: boolean; corner?: string }> = ({ name, tag, total, f, progress = true, corner = "left" }) => (
  <>
    <div style={{ position: "absolute", left: L.X, right: L.X, top: L.HEADER_TOP, height: L.HEADER_H, display: "flex", flexDirection: corner === "right" ? "row-reverse" : "row", alignItems: "center", justifyContent: "space-between" }}>
      <div style={{ display: "flex", alignItems: "center", gap: Math.round(L.LOGO_PX * 0.3) }}>
        <HudMark size={L.LOGO_PX} />
        <div style={{ ...zh(L.LOGO_NAME_PX, H.text), letterSpacing: "0.04em" }}>{(H as any).light ? <>{name.slice(0, -1)}<span style={{ color: H.line }}>{name.slice(-1)}</span></> : name}</div>
      </div>
      <div style={{ ...zh(L.TAG_PX, H.line, 700), ...((H as any).light ? { background: H.bg2, borderRadius: 14, padding: "8px 24px" } : { border: `2px solid ${H.line}`, padding: "6px 22px" }), letterSpacing: "0.08em" }}>{tag}</div>
    </div>
    {(H as any).light ? <div style={{ position: "absolute", left: 0, top: 0, width: L.W, height: 14, background: `linear-gradient(90deg, ${H.line} 0 84%, ${H.amber} 84% 100%)` }} /> : null}
    {progress ? <div style={{ position: "absolute", left: L.X, top: L.PROGRESS_TOP - 8, width: L.INNER_W, height: 3, background: H.lineSoft }}>
      <div style={{ width: `${(100 * Math.min(1, f / Math.max(1, total - 1))).toFixed(2)}%`, height: 3, background: H.amber }} />
    </div> : null}
  </>
);

/** 頁尾帶（v7，L.FOOT_H 有寫才畫）：細線＋左邊頻道名與 slogan 小字＋右邊播放時間，最底一條 8px 色條（和頂端色條呼應）。
 *  2026/11/15 Andy：「紅框處還有空間」——1700 以下 IG 介面會蓋住，只放出處與這條頁尾帶，不放要讀的內容 */
const HudFooter: React.FC<{ name: string; slogan?: string; total: number; f: number }> = ({ name, slogan, total, f }) => {
  if (!L.FOOT_H) return null;
  const t = (x: number) => { const s = Math.floor(x / FPS); return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`; };
  const y0 = L.FOOT_TOP, mid = y0 + (L.FOOT_H - 8) / 2, px = sm(30);
  return (
    <>
      <div style={{ position: "absolute", left: L.X, top: y0, width: L.INNER_W, height: 2, background: H.lineSoft }} />
      <div style={{ position: "absolute", left: L.X + 4, right: L.X + 4, top: mid - px * 0.7, height: px * 1.4, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ ...zh(px, H.text2, 700), letterSpacing: "0.06em" }}>{name}{slogan ? <span style={{ color: H.line, margin: "0 14px" }}>｜</span> : null}{slogan ?? ""}</div>
        <div style={{ ...mono(px, H.text2, 600) }}>{t(f)} / {t(total)}</div>
      </div>
      <div style={{ position: "absolute", left: 0, top: y0 + L.FOOT_H - 8, width: L.W, height: 8, background: `linear-gradient(90deg, ${H.line} 0 84%, ${H.amber} 84% 100%)` }} />
    </>
  );
};

/** 片尾卡（最後一幕 silent: true ＋ props.endCard: { next?, kicker?, trail?, at?, nextAt? }）：整個畫面蓋上底色；頁首 LOGO 照常留在左上。
 *  2026/11/15 使用者回饋「最後的結尾，我的 LOGO 需要有動畫特效」：中間的大標誌依序 ① 開口圈描線畫出來 ② 橘色圓點從上方彈進來落定（阻尼回彈）
 *  ③ 落定時一圈淡色光暈往外擴一次（細線，不發光）④ 頻道名、底線、slogan、軌跡、下一支依序進場。全部在 ENDCARD 幀內落定，之後至少停 1 秒。
 *  at（可省略）＝片尾卡提早開始的 cue（例如 "s19:litho-12"，讓片尾卡至少 3 秒而不動配音時間軸）；nextAt＝「下一支」標籤跳出來的 cue（對著旁白念到題目） */
const HudEndCard: React.FC<{ f: number; at: number; nextAt?: number; spec: { next?: string; kicker?: string; trail?: string[]; comment?: string; logoAnim?: string }; channel?: { name?: string; tag?: string; slogan?: string } }> = ({ f, at, nextAt, spec, channel }) => {
  const k = tween(f, at, 8, EASE.enter);
  if (k <= 0) return null;
  const E = ENDCARD, n = f - at, b = 120, x0 = L.X + 10, x1 = L.W - L.X - 10, y0 = L.STAGE_TOP + 40, y1 = L.CAP_TOP + L.CAP_H;
  const frame = tween(f, at + 2, 14, EASE.move);
  const draw = tween(f, at + E.draw[0], E.draw[1] - E.draw[0], EASE.move);
  // 橘點：E.dot[0] 從缺口外側出發，E.dot[1] 落定（ease-in-out，看得到它沿弧線移過來），之後小回彈；圓環在落定那一刻回應一次（E.land 幀）
  const travel = clamp01((n - E.dot[0]) / (E.dot[1] - E.dot[0])), tEase = travel < 0.5 ? 4 * travel ** 3 : 1 - Math.pow(-2 * travel + 2, 3) / 2, after = Math.max(0, (n - E.dot[1]) / FPS);
  const dotIn = n >= E.dot[0], dot = dotPath(tEase, after), dotS = dotIn ? (0.55 + 0.45 * tEase) * Math.min(1, (n - E.dot[0] + 1) / 3) : 0;
  const ring = n >= E.dot[1] ? clamp01((n - E.dot[1]) / E.land) : 0;
  // logoAnim（例如 "transparent"，LogoAnims.tsx）：中間的大標誌改用那套動畫，文字照它的時間表（hudLayout.ts 的 ENDCARD_TC）
  const TC = hasLogoAnim(spec?.logoAnim) ? ENDCARD_TC : null;
  const Et = TC ?? { name: E.name, line: E.line, slogan: E.slogan, trail: E.trail, next: E.next, comment: E.comment };
  const name = tween(f, at + Et.name, 8, EASE.enter), line = tween(f, at + Et.line, 12, EASE.move), slogan = tween(f, at + Et.slogan, 8, EASE.enter);
  // 「下一支」一律等 LOGO 落定之後（at＋E.next）才出現；nextAt 只能更晚，不能搶在 LOGO 前面
  const nAt = Math.max(at + Et.next, nextAt ?? 0), nx = tween(f, nAt, 7, EASE.enter), nxPop = 1 + 0.12 * Math.sin(Math.PI * tween(f, nAt + 4, 8, EASE.move));
  const trail = spec?.trail ?? [];
  const cm = tween(f, at + Et.comment, 8, EASE.enter);
  const G = endcardGeom(L as any, !!TC), LOGO = G.logo, cy = G.cy, o = G.o, nameStr = channel?.name ?? "科技", sweepX = TC ? tween(f, at + ENDCARD_TC.sweep, 12, EASE.move) : 0;
  return (
    <AbsoluteFill style={{ opacity: k }}>
      <HudBackdrop f={f} lv={0} />
      <svg width={L.W} height={L.H} style={{ position: "absolute", inset: 0 }}>
        {[[x0, y0, 1, 1], [x1, y0, -1, 1], [x0, y1, 1, -1], [x1, y1, -1, -1]].map(([x, y, sx, sy], i) => <path key={i} d={`M ${x} ${y + sy * b * frame} V ${y} H ${x + sx * b * frame}`} fill="none" stroke={H.line} strokeWidth={5} />)}
        {/* 右下角淡淡的開口圈浮水印（Andy 的片尾參考圖第 7 點） */}
        {(H as any).mark === "ring" ? <g transform={`translate(${L.W - 150} ${L.CAP_TOP + L.CAP_H - 62}) scale(1.6) translate(-50 -50)`} opacity={0.16 * frame}><path d="M74.69 46.09 A25 25 0 1 1 53.91 25.31" fill="none" stroke={H.line} strokeWidth={9} strokeLinecap="round" /><circle cx={67.68} cy={32.32} r={6.6} fill={H.amber} /></g> : null}
      </svg>
      {/* 2026/11/16 tech-offer 美編：飛入的圖層不准壓到出處與頁尾帶（fill 版面裁到片尾卡框下緣 y1 以上） */}
      {TC ? <svg width={L.W} height={L.H} style={{ position: "absolute", inset: 0, overflow: "hidden", clipPath: (L as any).FOOT_TOP ? `inset(0 0 ${L.H - y1}px 0)` : undefined }}><g transform={`translate(${L.W / 2} ${cy})`}><LogoAnim name={spec.logoAnim as string} n={n} size={LOGO} /></g></svg>
        : <div style={{ position: "absolute", left: (L.W - LOGO) / 2, top: cy - LOGO / 2, width: LOGO, height: LOGO }}><HudMark size={LOGO} draw={draw} dot={dot} dotS={dotS} ring={ring} /></div>}
      {TC ? <div style={{ position: "absolute", left: 0, right: 0, top: cy + o(210), height: 200, display: "flex", justifyContent: "center", overflow: "hidden", ...zh(148, H.text), letterSpacing: "0.06em" }}>
        {/* 頻道名逐字彈出（鎖定那一幀起每 2 幀一個字）＋一道白光掃過 */}
        {[...nameStr].map((ch, i) => { const q = tween(f, at + ENDCARD_TC.name + i * ENDCARD_TC.nameStep, 7, EASE.enter), pop = 1 + 0.25 * Math.sin(Math.PI * tween(f, at + ENDCARD_TC.name + i * ENDCARD_TC.nameStep, 9, EASE.move));
          return <span key={i} style={{ display: "inline-block", opacity: q, transform: `translateY(${Math.round(60 * (1 - q))}px) scale(${pop.toFixed(3)})` }}>{ch}</span>; })}
        {sweepX > 0 && sweepX < 1 ? <div style={{ position: "absolute", top: 0, bottom: 0, left: `${(-20 + 130 * sweepX).toFixed(1)}%`, width: 70, background: H.panel, opacity: 0.85, transform: "skewX(-20deg)" }} /> : null}
      </div>
        : <div style={{ position: "absolute", left: 0, right: 0, top: cy + o(210), textAlign: "center", opacity: name, transform: `translateY(${Math.round(24 * (1 - name))}px)`, ...zh(148, H.text), letterSpacing: "0.06em" }}>{nameStr}</div>}
      <div style={{ position: "absolute", left: (L.W - 760 * line) / 2, top: cy + o(418), width: 760 * line, height: 6, background: H.amber }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: cy + o(450), textAlign: "center", opacity: slogan, transform: `translateY(${Math.round(18 * (1 - slogan))}px)`, ...zh(72, H.line, 700), letterSpacing: "0.12em" }}>{channel?.slogan ?? ""}</div>
      {trail.length ? <div style={{ position: "absolute", left: 0, right: 0, top: cy + o(600), display: "flex", justifyContent: "center", gap: 16 }}>{trail.map((t, i) => <div key={i} style={{ ...zh(40, i === trail.length - 1 ? H.onAccent : H.text2, 700), background: i === trail.length - 1 ? H.line : "transparent", border: `2px solid ${H.lineSoft}`, padding: "6px 20px 8px", opacity: tween(f, at + Et.trail + i * 2, 5, EASE.enter), transform: `translateY(${Math.round(12 * (1 - tween(f, at + Et.trail + i * 2, 5, EASE.enter)))}px)` }}>{t}</div>)}</div> : null}
      {spec?.next ? <div style={{ position: "absolute", left: 0, right: 0, top: cy + o(708), display: "flex", justifyContent: "center", opacity: nx }}><div style={{ ...zh(68, onC(H.amber), 800), background: H.amber, padding: "10px 48px 16px", letterSpacing: "0.06em", transform: `scale(${nxPop.toFixed(3)})` }}>{spec.kicker ?? "下一支"} ▸ {spec.next}</div></div> : null}
      {/* 留言關鍵字（2026/11/15 Andy：「往後製作影片後面可以補上 留言『XXXX』我就把資訊傳給他，IG Thread 都是」）：LOGO 落定後才出現，在「下一支」下方 */}
      {spec?.comment ? <div style={{ position: "absolute", left: 0, right: 0, top: cy + o(868), display: "flex", justifyContent: "center", opacity: cm, transform: `translateY(${Math.round(14 * (1 - cm))}px)` }}><div style={{ ...zh(L.ENDCARD_COMMENT_PX ?? 46, H.text, 800), letterSpacing: "0.04em" }}>留言「<span style={{ color: H.line, borderBottom: `5px solid ${H.amber}` }}>{spec.comment}</span>」拿完整解說</div></div> : null}
    </AbsoluteFill>
  );
};

/** 字幕：深色框、一次一段單行；關鍵詞念到時上色加底線；英文跟著中文的句 */
type Cue = { id: string; en: string; keywords: string[]; mark?: string; window: [number, number]; phrases: { text: string; start: number }[]; keywords_at: { text: string; start: number }[] };
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
      <div style={{ position: "absolute", left: 0, right: 0, top: Math.round(L.CAP_H * 0.12), height: Math.round(L.CAP_ZH_PX * 1.45), display: "flex", alignItems: "center", justifyContent: "center", ...zh(L.CAP_ZH_PX, H.text), letterSpacing: "0.02em", transform: `translateY(${Math.round(8 * (1 - p))}px)` }}>
        <span>
          {splitParts(text, cue.keywords).map((sp, i) => {
            if (sp.k < 0) return <span key={i}>{sp.text}</span>;
            const q = kwAt[sp.text] === undefined || kwAt[sp.text] <= 1 ? 1 : tween(f, kwAt[sp.text] - 1, 8, EASE.move), c = cols[sp.k % cols.length];
            // props.kwMark（2026/11/16 tech-offer）：這個關鍵詞改成橘色螢光底、深色粗字、放大 1.25 倍
            if (cue.mark && sp.text === cue.mark) return <span key={i} style={{ position: "relative", display: "inline-block", color: H.text, fontSize: "1.25em", lineHeight: 1, padding: "0 6px", margin: "0 4px", background: `linear-gradient(transparent 38%, ${(H as any).amberSoft ?? H.amber} 38%)`, backgroundSize: `${(100 * q).toFixed(1)}% 100%`, backgroundRepeat: "no-repeat" }}>{sp.text}</span>;
            return <span key={i} style={{ position: "relative", color: q > 0.5 ? c : H.text }}>{sp.text}<span style={{ position: "absolute", left: 0, bottom: -4, height: 6, width: `${(100 * q).toFixed(1)}%`, background: c }} /></span>;
          })}
        </span>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: Math.round(L.CAP_H * 0.12 + L.CAP_ZH_PX * 1.45 + 18), textAlign: "center", ...mono(L.CAP_EN_PX, H.text2, 500), letterSpacing: "0.02em", fontFamily: FONT_EN }}>{en[e]}</div>
    </div>
  );
};

const HudSource: React.FC<{ cues: { sources: string[]; window: [number, number] }[]; f: number; px: number }> = ({ cues, f, px }) => {
  const cur = cues.find((c) => c.sources?.length && f >= c.window[0] && f < c.window[1]);
  if (!cur) return null;
  const j = cur.sources.join("、"), text = /^(資料)?來源|示意/.test(j) ? j : `來源：${j}`;
  // 一行放不下就縮字（下限 L.SMALL_MIN／30px；再放不下由 layout-check 報錯，要改短出處）
  const fit = Math.max(Math.min(px, L.SMALL_MIN || px), Math.min(px, Math.floor((px * (L.INNER_W - 30)) / Math.max(1, textW(text, px, 0.02)))));
  return (
    <div style={{ position: "absolute", left: L.X + 4, top: L.SRC_TOP + Math.round((px - fit) / 2), display: "flex", alignItems: "center", gap: 12, ...zh(fit, H.text2, 500), letterSpacing: "0.02em" }}>
      <div style={{ width: 10, height: 10, background: H.lineSoft }} />
      {text}
    </div>
  );
};

/** 整支 HUD 片：背景 → 2D 縮放 → 3D（交棒後）→ 標籤／尺寸線／蓋章 → HUD 外框 → 頁首／字幕／出處 */
export const VideoHud: React.FC<Script & { timeline: TimelineV2 }> = (props) => {
  const { scenes, timeline, channel } = props;
  const hud = (props as any).hud as HudSpec;
  const skin = (props as any).hudSkin as string | undefined;
  setHudSkin(skin, (hud as any).smallPx);
  setHudLayout(hud.layout);
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
  const subCues = ordered.filter((x) => by[x.id].subtitleWindow).map((x) => ({ id: x.id, en: x.subtitle.en, keywords: x.keywords, mark: (x.props as any)?.kwMark, window: by[x.id].subtitleWindow as [number, number], phrases: by[x.id].lines, keywords_at: by[x.id].keywords }));
  const srcCues = ordered.map((x) => ({ sources: x.sources, window: by[x.id].sourceWindow as [number, number] }));
  // 鉤子在第一次真正縮放（不是 drift）時退場
  const hookOut = keys.find((k) => !k.drift && k.at > 0)?.at ?? 1e9;
  // 3D 段鏡頭推近拉遠時，尺標與倍率跟著鏡頭距離伸縮（以交棒那一刻的距離為準）
  const hand = keys.find((k) => hud.levels[k.to]?.handoff3D);
  const d0 = useMemo(() => (hand ? stateAt(m, hand.at + hand.dur).cam.d : 0), [m, hand]);
  const camK = z.handoff > 0.99 && d0 > 0 ? d0 / s.cam.d : 1;
  const endScene = scenes.find((x) => (x as any).silent === true && (x.props as any)?.endCard);
  const ec = endScene ? ((endScene.props as any).endCard ?? {}) : null, atF = useMemo(() => atOf(timeline), [timeline]);
  // 2D 圖的 cue（hud.levels[].cues：{ 名字: "幕id:cue±N" }）換成絕對幀，給 HudArt 的動態圖用（例如 litho 念到才畫出波）
  const hudR = useMemo(() => ({ ...hud, levels: hud.levels.map((l) => (l.cues ? { ...l, _cf: Object.fromEntries(Object.entries(l.cues).map(([k, v]) => [k, atF(timeline.scenes[0]?.id ?? "", v, 1e9)])) } : l)) }), [hud, atF, timeline]);
  const ecAt = endScene && by[endScene.id] ? (ec.at ? atF(endScene.id, ec.at, by[endScene.id].startFrame) : by[endScene.id].startFrame) : null;
  const ecNext = endScene && ec?.nextAt ? atF(endScene.id, ec.nextAt, NaN) : undefined;
  // 版面整理（hudLayout.ts 的 planHud）：主素材框、主素材讓位（鉤子／大卡片／放不下的蓋章出現前先縮小移開）、標籤與蓋章找空位、換幕不疊
  const enPx = sm(28), plan = useMemo(() => planHud(m, L as any, hud, keys, enPx, hookOut), [m, hud, keys, enPx, hookOut]);
  const placed = plan.labels, overlays = plan.overlays, yy = plan.base3D, dim = 1 - (1 - BACKDROP_O) * plan.dimAt(f);
  const card = overlays.find((o) => o.type === "card");
  // 提問卡或鉤子大字出現時，讀數帶的層級名／倍率收起來（鉤子大字會經過上帶）
  const quiet = Math.max(card ? tween(f, card.at - 4, 6, EASE.move) * (1 - tween(f, card.until, 6, EASE.exit)) : 0, m.hook ? 1 - tween(f, hookOut, 8, EASE.move) : 0);
  return (
    <AbsoluteFill style={{ background: H.bg }}>
      <HudBackdrop f={f} lv={z.lv} warm={z.handoff * s.lay} />
      <div style={{ position: "absolute", inset: 0, opacity: dim }}>
        <ZoomArt hud={hudR} z={z} f={f} />
        <Stage3D s={s} model={m.product} o={z.handoff} y={yy} />
      </div>
      <HudFrame f={f} hud={hud} z={z} camK={camK} quiet={quiet} />
      <HudHook m={m} f={f} out={hookOut} />
      <HudLabels s={s} f={f} max={hud.maxLabels ?? 2} placed={placed} enPx={enPx} y={yy} />
      <HudMeasures m={m} s={s} f={f} list={meas} y={yy} />
      <HudMeters m={m} s={s} f={f} />
      <HudOverlays m={m} f={f} list={overlays} s={s} />
      <HudCaption cues={subCues as Cue[]} f={f} />
      <HudSource cues={srcCues} f={f} px={Math.max((m.product.fx as any)?.srcPx ?? 30, L.SRC_PX)} />
      {ecAt !== null ? <HudEndCard f={f} at={ecAt} nextAt={ecNext} spec={ec} channel={channel} /> : null}
      {/* 頁首（頻道 LOGO）畫在最上層：每一幕、包括片尾卡都在左上同一個位置 */}
      <HudHeader name={channel?.name ?? "科技"} tag={channel?.tag ?? "放大來看"} total={timeline.totalFrames} f={f} corner={(hud as any).logoCorner} />
      <HudFooter name={channel?.name ?? "科技"} slogan={channel?.slogan} total={timeline.totalFrames} f={f} />
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
  setHudLayout(hud.layout);
  const keys = useMemo(() => (timeline ? zoomKeys(scenes, timeline as TimelineV2, hud) : []), [scenes, timeline, hud]);
  const cf = keys.find((k) => !k.drift && k.at > 0);
  const z = zoomAt(hud, keys, cf ? cf.at + Math.round(cf.dur * 0.7) : 0);
  const shift = coverCrop ? (L.H - coverCrop) / 2 - 150 : 0;
  return (
    <AbsoluteFill style={{ background: H.bg }}>
      <HudBackdrop f={0} lv={0} />
      <div style={{ position: "absolute", inset: 0, transform: "translateY(260px)" }}><ZoomArt hud={hud} z={z} f={0} /></div>
      <div style={{ position: "absolute", inset: 0, transform: `translateY(${shift}px)` }}><HudHeader name={channel?.name ?? "科技"} tag={channel?.tag ?? "放大來看"} total={1} f={0} corner={(hud as any).logoCorner} /></div>
      <div style={{ position: "absolute", left: L.X, top: 360, width: L.INNER_W }}>
        {(c.title ?? []).map((t, i) => <div key={i} style={{ ...zh(150, i === 1 ? H.amber : H.text), lineHeight: 1.18 }}>{t}</div>)}
        {c.sub ? <div style={{ display: "inline-block", ...zh(46, onC(H.line), 800), background: H.line, padding: "8px 30px", marginTop: 22 }}>{c.sub}</div> : null}
      </div>
    </AbsoluteFill>
  );
};

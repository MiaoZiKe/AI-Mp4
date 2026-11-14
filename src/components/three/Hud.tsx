// 深色科技 HUD ＋ Powers of Ten 縮放（骨架，2026/11/14 為 videos/short-tech 新增；尚未接進 ThreeVideo.tsx）。
// 只有 script.json 頂層寫了 hud 的片會用到；沒寫 hud 的舊片完全不受影響。全部是 HTML／SVG，不增加 3D 成本。
//
// 資料：
//   頂層 hud: { theme: "dark", levels: [{ id, label, en, field: "15 cm", ruler: "5 cm", art, handoff3D? }] }（由遠到近）
//   每幕 props.zoom: [{ to: levelId, at: cue, dur? }]：念到 cue 時縮放到那一級（對數尺度補間，看起來是等速鑽進去）
//   每幕 props.measure: [{ from, to, axis, text, color, at, until? }]：HUD 尺寸線（from／to 是 model.anchors，接上後用 projectPoint 投影）
// 接法（之後做）：ThreeVideo 的 VideoThree 在 script.hud 存在時
//   1) 背景改畫 <HudBackdrop/>（取代淺色 Backdrop），
//   2) 3D <Stage/> 外包一層 opacity＝handoff(f)（縮到 handoff3D 那一級之前不掛 Stage，前段每幀省下 3D 成本），
//   3) 疊 <ZoomArt/>（2D 縮放圖層）與 <HudFrame/>（角框、掃描線、尺標、倍率讀數），
//   4) 頁首／字幕／標籤的顏色改讀 THEME_3D_HUD（深底淺字）。
import React from "react";
import type { Scene, TimelineV2 } from "../../types";
import { FONT_ZH, LAYOUT_3D as L, THEME_3D_HUD as H } from "../../theme";
import { EASE, tween } from "../anim";

export type HudLevel = { id: string; label: string; en?: string; field: string; ruler: string; art: string; handoff3D?: boolean };
export type HudSpec = { theme?: "dark"; levels: HudLevel[] };
export type ZoomKey = { to: number; at: number; dur: number };

const UNIT: Record<string, number> = { m: 1, cm: 1e-2, mm: 1e-3, "µm": 1e-6, um: 1e-6, nm: 1e-9 };
/** "15 cm" → 0.15（公尺） */
export const meters = (s: string) => { const r = /^([\d.]+)\s*(m|cm|mm|µm|um|nm)$/.exec(s.trim()); return r ? Number(r[1]) * UNIT[r[2]] : NaN; };

/** 各幕 props.zoom 的 at（cue id 或 start｜voice｜end｜exit ±N，可寫「幕id:cue」）→ 絕對幀；規則和 engine.ts 的 at 一樣 */
export const zoomKeys = (scenes: Scene[], tl: TimelineV2, hud: HudSpec): ZoomKey[] => {
  const by = Object.fromEntries(tl.scenes.map((x, i) => [x.id, { ...x, exit: tl.scenes[i + 1]?.startFrame ?? tl.totalFrames }]));
  const keys: ZoomKey[] = [];
  for (const s of scenes) {
    const own = by[s.id];
    if (!own) continue;
    for (const z of ([] as any[]).concat((s.props as any)?.zoom ?? [])) {
      const r = /^(?:([^\s:+-]+):)?([^\s:+-]+)([+-]\d+)?$/.exec(String(z.at ?? ""));
      const t = r?.[1] ? by[r[1]] : own;
      if (!r || !t) continue;
      const base = r[2] === "start" ? t.startFrame : r[2] === "voice" ? t.voiceStartFrame : r[2] === "end" ? t.voiceEndFrame : r[2] === "exit" ? t.exit : (t.cues ?? []).find((q) => q.id === r[2])?.frame;
      const to = hud.levels.findIndex((l) => l.id === z.to);
      if (base === undefined || base === null || to < 0) continue;
      keys.push({ to, at: base + Number(r[3] ?? 0), dur: z.dur ?? H.motion.zoom });
    }
  }
  return keys.sort((a, b) => a.at - b.at);
};

/** 第 f 幀的縮放狀態：lv＝連續的級數（2.5＝第 2 和第 3 級中間），logField＝畫面寬度的 log10（公尺），mag＝相對第一級的倍率 */
export const zoomAt = (hud: HudSpec, keys: ZoomKey[], f: number) => {
  let lv = keys[0]?.to ?? 0;
  for (const k of keys) { const t = tween(f, k.at, k.dur, EASE.move); if (t <= 0) break; lv = lv + (k.to - lv) * t; }
  const lf = hud.levels.map((l) => Math.log10(meters(l.field)));
  const i = Math.max(0, Math.min(lf.length - 2, Math.floor(lv))), u = Math.max(0, Math.min(1, lv - i));
  const logField = lf.length > 1 ? lf[i] + (lf[i + 1] - lf[i]) * u : lf[0];
  const last = hud.levels.findIndex((l) => l.handoff3D);
  // 交棒：縮到 handoff3D 那一級的最後一段，3D 模型淡入、2D 圖層淡出
  const handoff = last < 0 ? 0 : Math.max(0, Math.min(1, (lv - (last - 0.35)) / 0.35));
  return { lv, logField, mag: Math.pow(10, lf[0] - logField), handoff, level: hud.levels[Math.round(lv)] };
};

/** 倍率讀數：×1、×10、×100、×10⁴…（≥10⁴ 用上標） */
const SUP = "⁰¹²³⁴⁵⁶⁷⁸⁹";
export const magText = (mag: number) => { const e = Math.round(Math.log10(Math.max(1, mag))); return e < 4 ? `×${Math.round(Math.pow(10, e))}` : `×10${String(e).split("").map((d) => SUP[Number(d)]).join("")}`; };

const mono = (px: number, color: string = H.text): React.CSSProperties => ({ fontFamily: `${H.font.mono}, ${FONT_ZH}`, fontVariantNumeric: "tabular-nums", fontSize: px, color, fontWeight: 600, letterSpacing: "0.06em", whiteSpace: "nowrap" });

/** 深色背景：底色＋細格線（每 60px）；格線跟著縮放微微流動，靜止時也有東西在動 */
export const HudBackdrop: React.FC<{ f: number; lv: number }> = ({ f, lv }) => {
  const g = 60, off = ((lv % 1) * g * 3 + f * 0.2) % g;
  return (
    <svg width={L.W} height={L.H} style={{ position: "absolute", inset: 0, background: H.bg }}>
      {Array.from({ length: Math.ceil(L.W / g) + 2 }, (_, i) => <line key={`v${i}`} x1={i * g - off} x2={i * g - off} y1={0} y2={L.H} stroke={H.grid} strokeWidth={1} />)}
      {Array.from({ length: Math.ceil(L.H / g) + 2 }, (_, i) => <line key={`h${i}`} y1={i * g - off} y2={i * g - off} x1={0} x2={L.W} stroke={H.grid} strokeWidth={1} />)}
    </svg>
  );
};

/** 2D 縮放圖層：每一級一張圖，畫在畫面中心；大小＝那一級的 field ÷ 現在的 field。比畫面大 8 倍以上或小於 1/12 就不畫 */
export const ZoomArt: React.FC<{ hud: HudSpec; logField: number; handoff: number }> = ({ hud, logField, handoff }) => {
  const cx = L.W / 2, cy = L.STAGE_TOP + L.STAGE_H / 2, base = L.INNER_W;
  return (
    <svg width={L.W} height={L.H} style={{ position: "absolute", inset: 0, opacity: 1 - handoff }}>
      {hud.levels.map((lvl, i) => {
        const k = Math.pow(10, Math.log10(meters(lvl.field)) - logField);
        if (k > 8 || k < 1 / 12) return null;
        const w = base * k, o = Math.min(1, k * 4) * Math.min(1, (8 - k) / 4);
        return <g key={lvl.id} transform={`translate(${cx} ${cy}) scale(${w / 1000})`} opacity={o}><Art kind={lvl.art} /></g>;
      })}
    </svg>
  );
};

/** 各級的圖（座標：寬 1000、以中心為原點）。都是幾何示意：沒有商標、不仿特定機型 */
const Art: React.FC<{ kind: string }> = ({ kind }) => {
  const A = H.art, s = H.stroke;
  if (kind === "phone") return (
    <g>
      <rect x={-260} y={-520} width={520} height={1040} rx={70} fill={A.body} stroke={A.edge} strokeWidth={6} />
      <rect x={-230} y={-480} width={460} height={960} rx={44} fill={H.bg2} stroke={H.lineSoft} strokeWidth={3} />
      <rect x={-12} y={-12} width={24} height={24} fill={A.gate} />
    </g>
  );
  if (kind === "board") return (
    <g>
      <rect x={-500} y={-330} width={1000} height={660} rx={30} fill={A.board} stroke={A.trace} strokeWidth={4} />
      {Array.from({ length: 14 }, (_, i) => <path key={i} d={`M ${-480 + i * 70} 320 V ${120 - (i % 4) * 40} H ${-60 + (i % 5) * 30}`} fill="none" stroke={A.trace} strokeWidth={5} />)}
      {[[-400, -250, 150, 90], [260, -250, 180, 120], [-420, 120, 120, 160], [300, 160, 140, 100]].map(([x, y, w, h], i) => <rect key={i} x={x} y={y} width={w} height={h} rx={8} fill={A.part} />)}
      <rect x={-100} y={-100} width={200} height={200} rx={10} fill={A.die} stroke={H.line} strokeWidth={s.bold * 2} />
    </g>
  );
  if (kind === "die") return (
    <g>
      <rect x={-500} y={-500} width={1000} height={1000} fill={A.die} stroke={H.line} strokeWidth={6} />
      {[[-470, -470, 430, 420, A.block], [-10, -470, 480, 280, A.block2], [-470, -20, 300, 490, A.block], [-140, -160, 610, 630, A.block]].map(([x, y, w, h, c], i) => <rect key={i} x={x as number} y={y as number} width={w as number} height={h as number} fill={c as string} stroke={H.lineSoft} strokeWidth={3} />)}
      <rect x={-30} y={-30} width={60} height={60} fill="none" stroke={H.amber} strokeWidth={6} />
    </g>
  );
  if (kind === "cells") return (
    <g>
      {Array.from({ length: 12 }, (_, r) => <rect key={r} x={-500} y={-480 + r * 80} width={1000} height={60} fill={r % 2 ? A.block : A.die} />)}
      {Array.from({ length: 40 }, (_, c) => <rect key={c} x={-495 + c * 25} y={-480} width={6} height={960} fill={A.gate} opacity={0.75} />)}
    </g>
  );
  // gates：三條閘極（間距＝畫面寬 150nm 裡的 44nm）橫跨三片奈米片，交棒給 3D 之前的最後一張
  const p = (44 / 150) * 1000;
  return (
    <g>
      {[-1, 0, 1].map((j) => <rect key={`s${j}`} x={-480} y={j * 70 - 18} width={960} height={36} rx={8} fill={A.sheet} opacity={0.85} />)}
      {[-1, 0, 1].map((j) => <rect key={`g${j}`} x={j * p - 40} y={-200} width={80} height={400} rx={6} fill={A.gate} />)}
    </g>
  );
};

/** HUD 外框：四角括號、掃描線（一道亮帶往下掃）、左下尺標（刻度＋ruler 字）、右上倍率讀數、中間十字準星、左上層級名。 */
export const HudFrame: React.FC<{ f: number; hud: HudSpec; z: ReturnType<typeof zoomAt> }> = ({ f, hud, z }) => {
  const x0 = L.X, x1 = L.W - L.X, y0 = L.STAGE_TOP + 16, y1 = L.STAGE_TOP + L.STAGE_H - 16, b = H.bracket, s = H.stroke;
  const band = (f * (H.scan.sweep / 30)) % (y1 - y0 + H.scan.bandH);
  // 尺標長度：ruler ÷ field 的畫面寬度（縮放中途照目前的 field 算，所以刻度條會跟著伸縮，到下一級時跳回整數刻度）
  const lvl = z.level ?? hud.levels[0], rulerPx = Math.min(L.INNER_W * 0.6, (meters(lvl.ruler) / Math.pow(10, z.logField)) * L.INNER_W);
  return (
    <svg width={L.W} height={L.H} style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
      {[[x0, y0, 1, 1], [x1, y0, -1, 1], [x0, y1, 1, -1], [x1, y1, -1, -1]].map(([x, y, sx, sy], i) => <path key={i} d={`M ${x} ${y + sy * b} V ${y} H ${x + sx * b}`} fill="none" stroke={H.line} strokeWidth={s.bold} />)}
      {Array.from({ length: Math.ceil((y1 - y0) / H.scan.gap) }, (_, i) => <line key={i} x1={x0} x2={x1} y1={y0 + i * H.scan.gap} y2={y0 + i * H.scan.gap} stroke={H.line} strokeOpacity={H.scan.opacity} strokeWidth={1} />)}
      <rect x={x0} y={y0 + band - H.scan.bandH} width={x1 - x0} height={H.scan.bandH} fill={H.line} opacity={H.scan.bandO} />
      <g stroke={H.line} strokeWidth={s.thin} opacity={0.8}>
        <line x1={L.W / 2 - 30} x2={L.W / 2 - 8} y1={(y0 + y1) / 2} y2={(y0 + y1) / 2} /><line x1={L.W / 2 + 8} x2={L.W / 2 + 30} y1={(y0 + y1) / 2} y2={(y0 + y1) / 2} />
        <line y1={(y0 + y1) / 2 - 30} y2={(y0 + y1) / 2 - 8} x1={L.W / 2} x2={L.W / 2} /><line y1={(y0 + y1) / 2 + 8} y2={(y0 + y1) / 2 + 30} x1={L.W / 2} x2={L.W / 2} />
      </g>
      <g transform={`translate(${x0 + 24} ${y1 - 40})`}>
        <line x1={0} x2={rulerPx} y1={0} y2={0} stroke={H.amber} strokeWidth={s.bold} />
        {Array.from({ length: H.ruler.ticks + 1 }, (_, i) => <line key={i} x1={(rulerPx * i) / H.ruler.ticks} x2={(rulerPx * i) / H.ruler.ticks} y1={0} y2={i % 5 ? -H.ruler.h / 2 : -H.ruler.h} stroke={H.amber} strokeWidth={s.mid} />)}
        <text x={0} y={-H.ruler.h - 12} style={mono(H.font.px.readout, H.amber)}>{lvl.ruler}</text>
      </g>
      <text x={x1 - 24} y={y0 + 56} textAnchor="end" style={mono(H.font.px.big, H.text)}>{magText(z.mag)}</text>
      <text x={x1 - 24} y={y0 + 100} textAnchor="end" style={mono(H.font.px.readout, H.text2)}>FIELD {lvl.field}</text>
      <text x={x0 + 24} y={y0 + 56} style={{ ...mono(H.font.px.label, H.line), fontFamily: FONT_ZH }}>{lvl.label}</text>
      <text x={x0 + 24} y={y0 + 96} style={mono(H.font.px.readout, H.text3)}>{lvl.en ?? ""}</text>
    </svg>
  );
};

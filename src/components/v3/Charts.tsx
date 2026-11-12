// v3 通用紙片（不綁任何一支片）：大數字紙片 NumPiece、堆疊方塊 StackPiece、紙條長條圖 BarsPiece、紙條折線 LinePiece。
// 全部用 make-paper.py 的紙材 PNG 拼（不是 SVG 圖表）：長條＝一條紙從基線後面抽出來、折線＝細紙條一段一段貼上。
// 進場只有「貼上／抽出／擦出」，沒有透明度淡入；位置每 2 幀更新（逐格感）。顏色讀 useT()（跟著 skin 換）。
import React from "react";
import { Img } from "remotion";
import { FONT_EN, FONT_ZH } from "../../theme";
import { EASE, tween } from "../anim";
import { Paper, useAsset, useAssets, useT } from "./assets";
import { RichLine, type LineSpec, type PieceProps, type TapeSpec } from "./Pieces";

const step2 = (f: number) => Math.floor(f / 2) * 2;
/** 觸發時刻：state[key] 沒寫＝紙片出生就開始；0／false＝還沒；其他＝從設定的那一幀開始 */
const trigger = (state: Record<string, any>, since: Record<string, number>, key: string, born: number) => (state[key] === undefined ? born : state[key] ? since[key] : 1e9);
const fmt = (v: number, decimals = 0, comma = true) => { const s = v.toFixed(decimals); if (!comma) return s; const [a, b] = s.split("."); return a.replace(/\B(?=(\d{3})+(?!\d))/g, ",") + (b ? `.${b}` : ""); };
const Tapes: React.FC<{ tape?: TapeSpec[] }> = ({ tape }) => {
  const { assets } = useAssets();
  return <>{(tape ?? []).map((t, i) => { const name = t.asset ?? "tape-y", a = assets[name]; if (!a) return null; const w = t.w ?? a.body[2], h = (a.body[3] * w) / a.body[2]; return <div key={i} style={{ position: "absolute", left: t.x - w / 2, top: t.y - h / 2, transform: `rotate(${t.rot ?? 0}deg)` }}><Paper asset={name} w={w} /></div>; })}</>;
};

/**
 * 大數字紙片：一張紙（paper，預設 card-white）上一個會跳的數字。
 * spec：value（終值）、from（起值，預設 0）、decimals、prefix／unit（數字前後的小字，如「$」「%」「萬對」）、size（數字字級，預設 190）、
 *       color（色名，預設 red）、head／lines（數字上方一行、下方幾行；寫法同 strip 的 lines）、countDur（幀，預設 20）、tape、onDark。
 * state.count：沒寫＝貼上就開始跳；0＝先停在 from，之後 set: [{ at: "cue", count: 1 }] 才跳。
 */
export const NumPiece: React.FC<PieceProps> = ({ spec, f, state, since, born }) => {
  const T = useT();
  const paper = spec.paper ?? "card-white";
  const a = useAsset(paper);
  const [, , bw, bh] = a.body;
  const t0 = trigger(state, since, "count", born + 2);
  const p = tween(step2(f), t0, spec.countDur ?? 20, EASE.enter);
  const from = spec.fromValue ?? 0, v = from + (spec.value - from) * p;
  const size = spec.size ?? 190, col = T.color[spec.color ?? "red"] ?? T.red, base = spec.onDark ? T.onDark : T.ink;
  const pad: [number, number] = spec.pad ?? [36, 26];
  const lines: LineSpec[] = spec.lines ?? [];
  return (
    <Paper asset={paper}>
      <div style={{ position: "absolute", left: pad[0], top: pad[1], width: bw - 2 * pad[0], height: bh - 2 * pad[1], display: "flex", flexDirection: "column", justifyContent: "center", alignItems: spec.align === "left" ? "flex-start" : "center" }}>
        {spec.head ? <RichLine line={typeof spec.head === "string" ? { t: spec.head, size: 46 } : spec.head} n0={0} f={f} state={state} since={since} onDark={spec.onDark} /> : null}
        <div style={{ display: "flex", alignItems: "baseline", whiteSpace: "nowrap", lineHeight: 1.05, color: col, fontFamily: FONT_EN, fontWeight: T.weight.en, fontSize: size, letterSpacing: "-0.02em", fontVariantNumeric: "tabular-nums" }}>
          {spec.prefix ? <span style={{ fontFamily: FONT_ZH, fontWeight: T.weight.zh, fontSize: Math.round(size * 0.46), marginRight: 6, color: base }}>{spec.prefix}</span> : null}
          <span>{fmt(v, spec.decimals ?? 0, spec.comma !== false)}</span>
          {spec.unit ? <span style={{ fontFamily: FONT_ZH, fontWeight: T.weight.zh, fontSize: Math.round(size * (spec.unitScale ?? 0.4)), marginLeft: 8, letterSpacing: "0.02em", color: base }}>{spec.unit}</span> : null}
        </div>
        {lines.map((l, i) => <RichLine key={i} line={{ size: 46, ...l }} n0={i} f={f} state={state} since={since} onDark={spec.onDark} />)}
      </div>
      <Tapes tape={spec.tape} />
    </Paper>
  );
};

type StackCell = { asset?: string; w?: number; t?: string; size?: number; color?: string; onDark?: boolean; rot?: number };
type StackLayer = StackCell & { row?: StackCell[]; rowGap?: number; gap?: number; dx?: number };
const cellSize = (c: StackCell, assets: Record<string, { body: number[] }>): [number, number] => { const b = assets[c.asset ?? "block-blue"]?.body ?? [0, 0, 100, 40]; const w = c.w ?? b[2]; return [w, (b[3] * w) / b[2]]; };
const layerSize = (l: StackLayer, assets: Record<string, { body: number[] }>): [number, number] => {
  if (!l.row) return cellSize(l, assets);
  const cs = l.row.map((c) => cellSize(c, assets));
  return [cs.reduce((s, c) => s + c[0], 0) + (l.rowGap ?? 12) * (cs.length - 1), Math.max(...cs.map((c) => c[1]))];
};
export const stackSize = (spec: Record<string, any>, assets: Record<string, { body: number[] }>): [number, number] => {
  const ls = (spec.layers ?? []) as StackLayer[];
  const sz = ls.map((l) => layerSize(l, assets));
  return [Math.max(1, ...sz.map((s) => s[0])), Math.max(1, sz.reduce((s, c, i) => s + c[1] + (i ? ls[i].gap ?? spec.gap ?? 8 : 0), 0))];
};
/**
 * 堆疊方塊：一層一層的紙由下往上疊（晶片封裝的剖面、成本結構、步驟堆）。
 * spec.layers＝由下到上；每層 { asset（紙材，預設 block-blue；要特別的尺寸就在 videos/<slug>/assets.json 的 papers 自訂）、w（顯示寬 px）、
 *   t（紙上的字）、size、color、onDark、gap（和下面那層的間距，可為負＝壓上去）、dx（左右偏移）}，或 { row: [同樣的格子…], rowGap }＝同一層並排好幾塊（中介層上並排的晶片）。
 * state.n：沒寫＝出生後每 stagger 幀（預設 6）疊一層；寫了＝目前疊到第幾層（set: [{ at: "cue", n: 2 }]，新的那層在那一刻壓下來）。
 */
export const StackPiece: React.FC<PieceProps> = ({ spec, f, state, since, born }) => {
  const T = useT();
  const { assets } = useAssets();
  const ls = (spec.layers ?? []) as StackLayer[];
  const [W, H] = stackSize(spec, assets);
  const stagger = spec.stagger ?? 6;
  let y = H;
  const out: React.ReactNode[] = [];
  ls.forEach((l, i) => {
    const [lw, lh] = layerSize(l, assets);
    y -= lh + (i ? l.gap ?? spec.gap ?? 8 : 0);
    const prevN = Number(state.n ?? 0);
    const t0 = state.n === undefined ? born + i * stagger : i < prevN - 1 ? -1e9 : i === prevN - 1 ? since.n : 1e9;
    if (f < t0) return;
    const cells = l.row ?? [l];
    let x = (W - lw) / 2 + (l.dx ?? 0);
    cells.forEach((c, k) => {
      const [cw, ch] = cellSize(c, assets);
      const tk = t0 + k * 3;
      if (f >= tk) {
        const p = tween(step2(f), tk, 6, EASE.enter);
        out.push(
          <div key={`${i}-${k}`} style={{ position: "absolute", left: x, top: y + (lh - ch), zIndex: i, transform: `translateY(${Math.round(-18 * (1 - p))}px) rotate(${((c.rot ?? 0) + 1.5 * (1 - p) * (k % 2 ? -1 : 1)).toFixed(2)}deg) scale(${(1 + 0.06 * (1 - p)).toFixed(3)})` }}>
            <Paper asset={c.asset ?? "block-blue"} w={cw}>
              {c.t ? <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FONT_ZH, fontWeight: T.weight.zh, fontSize: c.size ?? Math.min(46, Math.round(ch * 0.5)), letterSpacing: "0.04em", whiteSpace: "nowrap", color: c.color ? T.color[c.color] ?? T.ink : c.onDark ? T.onDark : T.ink }}>{c.t}</div> : null}
            </Paper>
          </div>,
        );
      }
      x += cw + (l.rowGap ?? 12);
    });
  });
  return <div style={{ position: "relative", width: W, height: H }}>{out}</div>;
};

type Bar = { v: number; label?: string; color?: string; val?: string };
export const barsSize = (spec: Record<string, any>): [number, number] => [spec.w ?? 800, spec.h ?? 520];
/**
 * 紙條長條圖：每一條是一張色紙從基線後面抽出來（看得到紙的剪邊，不是色塊）。
 * spec：bars [{ v, label, color（色名，預設 blue）, val（顯示的字；沒寫＝數字跟著長、可加 unit）}]、dir "up"（直條，預設）｜"right"（橫條）、
 *       w／h（整張圖的大小，預設 800×520）、max（滿格的值，預設最大值）、barW（條寬）、unit、decimals、labelSize／valSize、labelW（橫條左邊標籤欄寬）、onDark（字用淺色；預設跟 skin 的桌面深淺）。
 * state.grow：沒寫＝出生就長；0＝先不長，之後 set: [{ at: "cue", grow: 1 }]。每條隔 stagger 幀（預設 5）。
 */
export const BarsPiece: React.FC<PieceProps> = ({ spec, f, state, since, born }) => {
  const T = useT();
  const { assets } = useAssets();
  const [W, H] = barsSize(spec);
  const bars = (spec.bars ?? []) as Bar[];
  const up = (spec.dir ?? "up") === "up";
  const onDark = spec.onDark ?? T.deskDark, txt = onDark ? T.onDark : T.ink, txt2 = onDark ? T.onDark2 : T.ink3;
  const max = spec.max ?? Math.max(1, ...bars.map((b) => b.v));
  const t0 = trigger(state, since, "grow", born + 2), stagger = spec.stagger ?? 5, dur = spec.growDur ?? 14;
  const labelSize = spec.labelSize ?? 36, valSize = spec.valSize ?? 50;
  const rule = onDark && assets["rule-w"] ? "rule-w" : "rule";
  const n = Math.max(1, bars.length);
  const val = (b: Bar, p: number) => (b.val !== undefined ? (p >= 1 ? b.val : "") : `${fmt(b.v * p, spec.decimals ?? 0)}${spec.unit ?? ""}`);
  if (up) {
    const labelH = Math.round(labelSize * 1.7), top = Math.round(valSize * 1.35), area = H - labelH - top;
    const slot = W / n, bw = spec.barW ?? Math.min(150, Math.round(slot * 0.56));
    return (
      <div style={{ position: "relative", width: W, height: H }}>
        {bars.map((b, i) => {
          const a = assets[`barv-${b.color ?? "blue"}`]; if (!a) throw new Error(`v3 紙材不存在：barv-${b.color ?? "blue"}`);
          const p = tween(step2(f), t0 + i * stagger, dur, EASE.enter), len = Math.round(area * Math.min(1, b.v / max) * p);
          const cx = slot * (i + 0.5);
          return (
            <React.Fragment key={i}>
              <div style={{ position: "absolute", left: cx - bw / 2, top, width: bw, height: area, clipPath: "inset(-60px -60px 0 -60px)" }}>
                <div style={{ position: "absolute", left: 0, top: area - len }}><Paper asset={`barv-${b.color ?? "blue"}`} w={bw} /></div>
              </div>
              <div style={{ position: "absolute", left: cx - slot / 2, width: slot, top: top + area - len - Math.round(valSize * 1.3), textAlign: "center", fontFamily: FONT_EN, fontWeight: T.weight.en, fontSize: valSize, color: txt, whiteSpace: "nowrap", fontVariantNumeric: "tabular-nums" }}>{f >= t0 + i * stagger ? val(b, p) : ""}</div>
              <div style={{ position: "absolute", left: cx - slot / 2, width: slot, top: H - labelH + 12, textAlign: "center", fontFamily: FONT_ZH, fontWeight: T.weight.body, fontSize: labelSize, color: txt2, whiteSpace: "nowrap" }}>{b.label}</div>
            </React.Fragment>
          );
        })}
        <div style={{ position: "absolute", left: 0, top: top + area - 5 }}><Paper asset={rule} w={W} /></div>
      </div>
    );
  }
  const labelW = spec.labelW ?? 220, valW = spec.valW ?? Math.round(valSize * 3.4), area = W - labelW - valW;
  const slot = H / n, bh = spec.barW ?? Math.min(110, Math.round(slot * 0.6));
  return (
    <div style={{ position: "relative", width: W, height: H }}>
      {bars.map((b, i) => {
        const a = assets[`bar-${b.color ?? "blue"}`]; if (!a) throw new Error(`v3 紙材不存在：bar-${b.color ?? "blue"}`);
        const k = bh / a.body[3], full = a.body[2] * k;
        const p = tween(step2(f), t0 + i * stagger, dur, EASE.enter), len = Math.round(area * Math.min(1, b.v / max) * p);
        const cy = slot * (i + 0.5);
        return (
          <React.Fragment key={i}>
            <div style={{ position: "absolute", left: labelW, top: cy - bh / 2, width: area, height: bh, clipPath: "inset(-60px -60px -60px 0)" }}>
              <div style={{ position: "absolute", left: len - full, top: 0 }}><Paper asset={`bar-${b.color ?? "blue"}`} w={full} /></div>
            </div>
            <div style={{ position: "absolute", left: 0, width: labelW - 18, top: cy - labelSize * 0.75, textAlign: "right", fontFamily: FONT_ZH, fontWeight: T.weight.body, fontSize: labelSize, color: txt2, whiteSpace: "nowrap" }}>{b.label}</div>
            <div style={{ position: "absolute", left: labelW + len + 16, top: cy - valSize * 0.68, fontFamily: FONT_EN, fontWeight: T.weight.en, fontSize: valSize, color: txt, whiteSpace: "nowrap", fontVariantNumeric: "tabular-nums" }}>{f >= t0 + i * stagger ? val(b, p) : ""}</div>
          </React.Fragment>
        );
      })}
      <div style={{ position: "absolute", left: labelW - 5, top: 0, width: 10, height: H, overflow: "hidden" }}><div style={{ position: "absolute", left: 10, top: 0, transform: "rotate(90deg)", transformOrigin: "0 0" }}><Paper asset={rule} w={H} /></div></div>
    </div>
  );
};

export const lineSize = (spec: Record<string, any>): [number, number] => [spec.w ?? 800, spec.h ?? 480];
/**
 * 紙條折線：細紙條一段一段貼出走勢，轉折點貼小圓紙片（不是 SVG 折線）。
 * spec：vals（數值，≥2 個）、min／max（縱軸範圍，預設資料範圍外擴 12%）、color（色名，預設 red）、w／h（預設 800×480）、
 *       labels（橫軸標籤，和 vals 一樣長，空字串＝不標）、marks [{ i, t, dy }]（第 i 個點旁邊的小字，如「2015：15.4 萬」）、thick（線粗，預設 14）、onDark。
 * state.grow：同 bars。每段隔 seg 幀（預設 4）。
 */
export const LinePiece: React.FC<PieceProps> = ({ spec, f, state, since, born }) => {
  const T = useT();
  const { assets } = useAssets();
  const [W, H] = lineSize(spec);
  const vals = (spec.vals ?? []) as number[];
  const color = spec.color ?? "red";
  const seg = useAsset(`seg-${color}`), node = assets[`node-${color}`] ? `node-${color}` : "dot";
  const onDark = spec.onDark ?? T.deskDark, txt = onDark ? T.onDark : T.ink, txt2 = onDark ? T.onDark2 : T.ink3;
  const rule = onDark && assets["rule-w"] ? "rule-w" : "rule";
  const lo0 = Math.min(...vals), hi0 = Math.max(...vals), span = hi0 - lo0 || 1;
  const lo = spec.min ?? lo0 - span * 0.12, hi = spec.max ?? hi0 + span * 0.12;
  const labelSize = spec.labelSize ?? 32, markSize = spec.markSize ?? 38;
  const padX = spec.padX ?? 36, top = Math.round(markSize * 1.6), bottom = H - Math.round(labelSize * 1.9);
  const X = (i: number) => padX + ((W - 2 * padX) * i) / Math.max(1, vals.length - 1), Y = (v: number) => bottom - ((bottom - top) * (v - lo)) / (hi - lo || 1);
  const t0 = trigger(state, since, "grow", born + 2), dt = spec.seg ?? 4, thick = spec.thick ?? 14, nodeW = spec.nodeW ?? 34;
  const [sx0, sy0, sbw, sbh] = seg.body;
  const out: React.ReactNode[] = [];
  vals.forEach((v, i) => {
    const ti = t0 + i * dt;
    if (i > 0 && f >= ti - dt) {
      const x0 = X(i - 1), y0 = Y(vals[i - 1]), x1 = X(i), y1 = Y(v);
      const len = Math.hypot(x1 - x0, y1 - y0) + thick * 0.5, ang = (Math.atan2(y1 - y0, x1 - x0) * 180) / Math.PI;
      const kx = len / sbw, ky = thick / sbh, p = tween(f, ti - dt, dt, EASE.move);
      out.push(
        <div key={`s${i}`} style={{ position: "absolute", left: x0, top: y0 - thick / 2, width: len, height: thick, transform: `rotate(${ang.toFixed(2)}deg)`, transformOrigin: `0 ${thick / 2}px`, clipPath: `inset(-30px ${(100 * (1 - p)).toFixed(1)}% -30px -30px)` }}>
          <Img src={seg.src} style={{ position: "absolute", left: -sx0 * kx, top: -sy0 * ky, width: seg.w * kx, height: seg.h * ky, maxWidth: "none" }} />
        </div>,
      );
    }
    if (f >= ti) {
      const p = tween(step2(f), ti, 4, EASE.enter);
      out.push(<div key={`n${i}`} style={{ position: "absolute", left: X(i) - nodeW / 2, top: Y(v) - nodeW / 2, zIndex: 2, transform: `scale(${(1 + 0.4 * (1 - p)).toFixed(3)})` }}><Paper asset={node} w={nodeW} /></div>);
    }
  });
  const marks = (spec.marks ?? []) as { i: number; t: string; dy?: number; dx?: number; color?: string }[];
  return (
    <div style={{ position: "relative", width: W, height: H }}>
      <div style={{ position: "absolute", left: 0, top: bottom + 8 }}><Paper asset={rule} w={W} /></div>
      {out}
      {marks.map((m, k) => (f >= t0 + m.i * dt ? <div key={`m${k}`} style={{ position: "absolute", left: X(m.i) + (m.dx ?? 0) - 300, width: 600, top: Y(vals[m.i]) + (m.dy ?? -markSize * 1.7), textAlign: "center", fontFamily: FONT_ZH, fontWeight: T.weight.zh, fontSize: markSize, color: m.color ? T.color[m.color] ?? txt : txt, whiteSpace: "nowrap", zIndex: 3 }}>{m.t}</div> : null))}
      {((spec.labels ?? []) as string[]).map((t, i) => (t ? <div key={`l${i}`} style={{ position: "absolute", left: X(i) - 150, width: 300, top: bottom + 26, textAlign: "center", fontFamily: FONT_ZH, fontWeight: T.weight.body, fontSize: labelSize, color: txt2, whiteSpace: "nowrap" }}>{t}</div> : null))}
    </div>
  );
};

// v3 紙片元件：MarkerHighlight、StripTitle（＝TapeLabel／Polaroid）、DashedPath、PassWindow。
// 每個元件都以「自然尺寸」（紙本體的原始 px）排版，由 Cutout 依 w 等比縮放；顏色讀 THEME_V3，動作用 anim.ts 的 token。
import React from "react";
import { Img } from "remotion";
import { FONT_ZH } from "../../theme";
import { DUR, EASE, tween } from "../anim";
import { Paper, useAsset, useAssets, useT } from "./assets";

/** 全形問號在 Noto Sans TC 是置中的，前面會像多一格空白：往左收，句尾再收掉右邊的空白 */
export const tidyQ = (t: string): React.ReactNode => {
  if (!t.includes("？")) return t;
  const parts = t.split("？");
  return parts.map((s, i) => <React.Fragment key={i}>{s}{i < parts.length - 1 ? <span style={{ marginLeft: "-0.22em", marginRight: "-0.2em" }}>？</span> : null}</React.Fragment>);
};

export type PieceProps = { spec: Record<string, any>; f: number; state: Record<string, any>; since: Record<string, number>; prev: Record<string, any>; born: number };

/** 麥克筆底：PNG 筆觸墊在字後面，用遮罩由左擦出（p 0→1）；不縮放筆觸本身 */
export const MarkerHighlight: React.FC<{ p: number; k?: number; children: React.ReactNode }> = ({ p, k = 0, children }) => {
  const a = useAsset(`mark-${k % 3}`);
  return (
    <span style={{ position: "relative", display: "inline-block", whiteSpace: "nowrap", padding: "0 0.06em", margin: "0 -0.03em" }}>
      <Img src={a.src} style={{ position: "absolute", left: "-2%", width: "104%", top: "36%", height: "62%", maxWidth: "none", clipPath: `inset(0 ${(100 * (1 - p)).toFixed(1)}% 0 0)` }} />
      <span style={{ position: "relative" }}>{children}</span>
    </span>
  );
};

type RichSeg = { s: string; kind: "plain" | "mark" | "accent"; n?: number };
/** 標記語法：[麥克筆底]、{強調色}。回傳片段與麥克筆段的序號 */
export const parseRich = (t: string, n0 = 0) => {
  const out: RichSeg[] = [];
  let n = n0;
  const re = /\[([^\]]+)\]|\{([^}]+)\}/g;
  let last = 0, m: RegExpExecArray | null;
  while ((m = re.exec(t))) {
    if (m.index > last) out.push({ s: t.slice(last, m.index), kind: "plain" });
    if (m[1] !== undefined) out.push({ s: m[1], kind: "mark", n: n++ }); else out.push({ s: m[2], kind: "accent" });
    last = m.index + m[0].length;
  }
  if (last < t.length) out.push({ s: t.slice(last), kind: "plain" });
  return { segs: out, n };
};
export const plainText = (t: string) => String(t ?? "").replace(/[[\]{}]/g, "");

export type LineSpec = { t: string; size?: number; color?: string; accent?: string; accentSize?: number; weight?: number; lh?: number; ls?: number; mt?: number };
/** 一行字：英數自動落到 Inter 800、中文 Noto Sans TC 900；麥克筆段依 state.mark（已畫幾段）與 since.mark 擦出 */
export const RichLine: React.FC<{ line: LineSpec; n0: number; f: number; state: Record<string, any>; since: Record<string, number>; onDark?: boolean }> = ({ line, n0, f, state, since, onDark }) => {
  const T = useT();
  const { segs } = parseRich(line.t, n0);
  const size = line.size ?? 72;
  const marked = state.mark as number | undefined;
  return (
    <div style={{ fontFamily: FONT_ZH, fontWeight: line.weight ?? T.weight.zh, fontSize: size, lineHeight: line.lh ?? 1.14, letterSpacing: `${line.ls ?? 0.01}em`, color: T.color[line.color ?? ""] ?? (onDark ? T.onDark : T.ink), whiteSpace: "nowrap", marginTop: line.mt ?? 0 }}>
      {segs.map((g, i) => {
        if (g.kind === "accent") return <span key={i} style={{ color: T.color[line.accent ?? "red"], fontSize: line.accentSize ?? size }}>{g.s}</span>;
        if (g.kind === "mark") {
          const p = marked === undefined ? 1 : (g.n as number) < marked - 1 ? 1 : (g.n as number) === marked - 1 ? tween(f, since.mark, DUR.s, EASE.move) : 0;
          return <MarkerHighlight key={i} p={p} k={g.n}>{g.s}</MarkerHighlight>;
        }
        return <span key={i}>{tidyQ(g.s)}</span>;
      })}
    </div>
  );
};

/** 膠帶：座標是紙本體內的 px（膠帶中心），可超出紙邊 */
export type TapeSpec = { asset?: string; x: number; y: number; rot?: number; w?: number };
const Tape: React.FC<{ t: TapeSpec }> = ({ t }) => {
  const a = useAsset(t.asset ?? "tape-y");
  const w = t.w ?? a.body[2], h = (a.body[3] * w) / a.body[2];
  return <div style={{ position: "absolute", left: t.x - w / 2, top: t.y - h / 2, transform: `rotate(${t.rot ?? 0}deg)` }}><Paper asset={t.asset ?? "tape-y"} w={w} /></div>;
};

/**
 * 撕邊紙條大字（StripTitle／TapeLabel／Polaroid 共用）：paper＝紙材名，lines＝一行一行的字（[..] 麥克筆底、{..} 強調色），
 * tape＝紙膠帶，box＝字的範圍（紙本體內 [x, y, w, h]；預設整張紙內縮 pad）。字級是紙本體原始 px，整張依 w 縮放。
 */
export const StripTitle: React.FC<PieceProps> = ({ spec, f, state, since }) => {
  const paper = spec.paper ?? spec.asset ?? "strip-white";
  const a = useAsset(paper);
  const [, , bw, bh] = a.body;
  const pad: [number, number] = spec.pad ?? [44, 24];
  const box: [number, number, number, number] = spec.box ?? (spec.box === undefined && a.caption && spec.caption ? a.caption : [pad[0], pad[1], bw - 2 * pad[0], bh - 2 * pad[1]]);
  const lines: LineSpec[] = spec.lines ?? [];
  let n = 0;
  return (
    <Paper asset={paper}>
      <div style={{ position: "absolute", left: box[0], top: box[1], width: box[2], height: box[3], display: "flex", flexDirection: "column", justifyContent: "center", alignItems: spec.align === "left" ? "flex-start" : "center" }}>
        {lines.map((l, i) => { const n0 = n; n = parseRich(l.t, n).n; return <RichLine key={i} line={l} n0={n0} f={f} state={state} since={since} onDark={spec.onDark} />; })}
      </div>
      {(spec.tape as TapeSpec[] | undefined)?.map((t, i) => <Tape key={i} t={t} />)}
    </Paper>
  );
};
export const TapeLabel = StripTitle;
export const Polaroid: React.FC<PieceProps> = (p) => <StripTitle {...p} spec={{ caption: true, ...p.spec }} />;
export const stripSize = (spec: Record<string, any>, assets: Record<string, { body: number[] }>) => { const b = assets[spec.paper ?? spec.asset ?? "strip-white"]?.body ?? [0, 0, 100, 100]; return [b[2], b[3]] as [number, number]; };

/** 一般紙片（PNG）。grid＝同一張排成 cols×rows（機櫃牆、手機排），一排一排貼上（隔 stagger 幀） */
export const ImgPiece: React.FC<PieceProps> = ({ spec, f, born }) => {
  const a = useAsset(spec.asset);
  const g = spec.grid as { cols: number; rows: number; dx: number; dy: number; stagger?: number; rev?: boolean } | undefined;   // rev＝由下排往上貼
  if (!g) return spec.tape ? <Paper asset={spec.asset}>{(spec.tape as TapeSpec[]).map((t, i) => <Tape key={i} t={t} />)}</Paper> : <Paper asset={spec.asset} />;
  const [, , bw, bh] = a.body;
  const cells = [];
  for (let r = 0; r < g.rows; r++) for (let c = 0; c < g.cols; c++) {
    const t0 = born + (g.rev ? g.rows - 1 - r : r) * (g.stagger ?? 4) + (c % 2);
    const p = tween(Math.floor(f / 2) * 2, t0, DUR.s - 2, EASE.enter);
    if (f < t0) continue;
    cells.push(<div key={`${r}-${c}`} style={{ position: "absolute", left: (c - (g.cols - 1) / 2) * g.dx, top: (r - (g.rows - 1) / 2) * g.dy, transform: `translateY(${Math.round(-14 * (1 - p))}px) scale(${(1 + 0.06 * (1 - p)).toFixed(3)})` }}><Paper asset={spec.asset} /></div>);
  }
  return <div style={{ position: "relative", width: bw, height: bh }}>{cells}</div>;
};
export const imgSize = (spec: Record<string, any>, assets: Record<string, { body: number[] }>) => { const b = assets[spec.asset]?.body ?? [0, 0, 100, 100]; return [b[2], b[3]] as [number, number]; };

const rnd = (seed: number) => { const x = Math.sin(seed * 91.7 + 13.1) * 43758.5453; return x - Math.floor(x); };
/**
 * 紙虛線：小紙條沿折線一格一格貼出來（PNG，不是 SVG）。pts＝世界座標折線；state.grow：沒寫＝全部在、0＝還沒長、1＝從那一刻開始長
 * （前慢後快：3 幀一格 → 1 幀一格）。每格依切線方向旋轉、加固定 seed 的小歪斜。
 */
export const DashedPath: React.FC<PieceProps> = ({ spec, f, state, since }) => {
  const { assets } = useAssets();
  const pts = spec.pts as [number, number][];
  const head = spec.head ? assets[typeof spec.head === "string" ? spec.head : "arrowhead-y"] : undefined;   // head: true｜"arrowhead-r"＝虛線長完後在終點貼一個紙箭頭
  const ds = spec.dash ?? 1, dashW = assets["dash-0"].body[2] * ds, gap = spec.gap ?? 30 * ds, pitch = dashW + gap;
  const segs = pts.slice(1).map((q, i) => ({ a: pts[i], b: q, len: Math.hypot(q[0] - pts[i][0], q[1] - pts[i][1]) }));
  const total = segs.reduce((s, g) => s + g.len, 0);
  const N = Math.max(1, Math.floor((total - dashW / 2) / pitch) + 1);
  const dashes = [];
  let t = 0;
  for (let i = 0; i < N; i++) {
    const appear = state.grow === undefined ? -1e9 : state.grow ? since.grow + Math.round(t) : 1e9;
    t += 3 - 2 * (i / Math.max(1, N - 1)) ** 0.7;
    if (f < appear) continue;
    let d = dashW / 2 + i * pitch, k = 0;
    while (k < segs.length - 1 && d > segs[k].len) { d -= segs[k].len; k++; }
    const g = segs[k], u = d / g.len;
    const x = g.a[0] + (g.b[0] - g.a[0]) * u, y = g.a[1] + (g.b[1] - g.a[1]) * u;
    const ang = (Math.atan2(g.b[1] - g.a[1], g.b[0] - g.a[0]) * 180) / Math.PI + (rnd(i) - 0.5) * 8;
    const p = tween(f, appear, 3, EASE.enter);
    dashes.push(<div key={i} style={{ position: "absolute", left: x - dashW / 2 + (rnd(i + 40) - 0.5) * 6, top: y - 11 * ds + (rnd(i + 80) - 0.5) * 6, transform: `rotate(${ang.toFixed(1)}deg) scale(${(1 + 0.25 * (1 - p)).toFixed(3)})` }}><Paper asset={`dash-${i % 6}`} w={dashW} /></div>);
  }
  if (head) {
    const done = state.grow === undefined ? -1e9 : state.grow ? since.grow + Math.round(t) : 1e9;
    if (f >= done) {
      const g = segs[segs.length - 1], hw = head.body[2] * ds, hh = head.body[3] * ds, p = tween(f, done, 4, EASE.enter);
      const ang = (Math.atan2(g.b[1] - g.a[1], g.b[0] - g.a[0]) * 180) / Math.PI;
      dashes.push(<div key="head" style={{ position: "absolute", left: g.b[0] - hw / 2, top: g.b[1] - hh / 2, transform: `rotate(${ang.toFixed(1)}deg) scale(${(1 + 0.3 * (1 - p)).toFixed(3)})` }}><Paper asset={typeof spec.head === "string" ? spec.head : "arrowhead-y"} w={hw} /></div>);
    }
  }
  return <>{dashes}</>;
};

/**
 * 出餐口（全片共用的那一個）：牆（窗洞透明）＋窗內＋鐵捲門＋前景（窗框、掛單、檯面、服務鈴、遮雨棚）。
 * state：inside "rack"｜"kitchen"（窗內透出機櫃／廚房實拍照片，換的時候照片像卡片一樣由上滑下）、
 *        lit false＝燈暗（6 幀）、shutter true＝鐵捲門分四格拉下（最後一格最重）。
 */
export const PassWindow: React.FC<PieceProps> = ({ f, state, since }) => {
  const T = useT();
  const { assets } = useAssets();
  const m = assets["pass"], [ox, oy, ow, oh] = m.window as number[];
  const kit = state.inside !== "rack";
  const kp = kit ? (since.inside > -1e8 ? tween(Math.floor(f / 2) * 2, since.inside, DUR.s - 2, EASE.enter) : 1) : 0;
  const dark = state.lit === false ? tween(f, since.lit, DUR.s - 2, EASE.move) : 0;
  const steps = [0.22, 0.48, 0.74, 1];
  let sy = 0;
  if (state.shutter) { const k = Math.min(steps.length, Math.floor((f - since.shutter) / 4) + 1); const prev = k > 1 ? steps[k - 2] : 0; sy = prev + (steps[k - 1] - prev) * tween(f, since.shutter + (k - 1) * 4, k === steps.length ? 2 : 3, EASE.exit); }
  const lit = useAsset("kitchen-lit"), drk = useAsset("kitchen-dark"), shut = useAsset("shutter"), hang = useAsset("pass-hang");
  return (
    <div style={{ position: "relative", width: m.w, height: m.h }}>
      <Paper asset="pass-wall" style={{ position: "absolute", left: 0, top: 0 }} />
      <div style={{ position: "absolute", left: ox, top: oy, width: ow, height: oh, overflow: "hidden", background: T.blue }}>
        <div style={{ position: "absolute", left: ow / 2 - 125, top: 4 }}><Paper asset="rack" w={250} /></div>
        {kp > 0 && <Img src={lit.src} style={{ position: "absolute", left: 0, top: Math.round(-oh * (1 - kp)), width: ow, height: oh }} />}
        {dark > 0 && kp > 0 && <Img src={drk.src} style={{ position: "absolute", left: 0, top: 0, width: ow, height: oh, opacity: dark }} />}
        {dark > 0 && kp === 0 && <div style={{ position: "absolute", inset: 0, background: T.ink, opacity: 0.55 * dark }} />}
        {/* 窗內掛的點餐單（在鐵捲門後面：門拉下來會蓋住） */}
        <Img src={hang.src} style={{ position: "absolute", left: -ox, top: -oy, width: m.w, height: m.h, maxWidth: "none" }} />
        {sy > 0 && <Img src={shut.src} style={{ position: "absolute", left: 0, top: Math.round(-shut.h * (1 - sy)), width: ow, height: shut.h }} />}
      </div>
      <Paper asset="pass-front" style={{ position: "absolute", left: 0, top: 0 }} />
    </div>
  );
};

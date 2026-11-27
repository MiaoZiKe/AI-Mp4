// 2026/11/28 tech-ccl：銅箔基板 CCL（系列 3 第 11 集）的 2D 示意卡（overlay `section` 的 kind 以 "ccl-" 開頭，Hud.tsx 的 HudSection 轉過來）。寫法照 HudBt.tsx。
//   ccl-hook 接前一集（載板→主機板）｜ccl-sand 夾心餅乾剖面｜ccl-fab 玻纖布＝紗窗｜ccl-pp 含浸：紙巾吸醬汁→半固化膠片｜ccl-press 熱壓：融了再變硬｜
//   ccl-etch 銅蝕刻成線路（走線、銲墊、過孔）｜ccl-mud 一般材料吃掉訊號（泥巴路）｜ccl-track 低損耗：約十分之一（依材料與頻率而異）｜ccl-co 台灣三家｜ccl-next 下一集＋留言關鍵字。
// 公司官方 LOGO 原檔抓不到（官網與 Wikimedia Commons 都連不到／沒有，同 tech-bt），用白底深色文字名牌（不仿商標）＋國旗，100% 不透明。
import React from "react";
import { FONT_ZH } from "../../theme";
import { H, L, CARD_HEAD, CARD_CONTENT_TOP, cardTitleBox } from "./hudSkin";
import { EASE, tween } from "../anim";
import type { Model3D, Overlay3D, State3D } from "./engine";
import { Flag } from "./Brand";

const zh = (px: number, color: string = H.text, w = 800): React.CSSProperties => ({ fontFamily: FONT_ZH, fontSize: px, fill: color, color, fontWeight: w, whiteSpace: "nowrap" });
const onC = (bg: string) => (bg === H.amber ? ((H as any).onAmber ?? H.onAccent) : H.onAccent);
type P = { o: Overlay3D; f: number; k: number; m: Model3D; s?: State3D };
const T = (o: Overlay3D, n: string) => ((o as any).t?.[n]?.at ?? o.at) as number;
const CT = CARD_CONTENT_TOP;
const Card: React.FC<{ o: Overlay3D; k: number; W: number; Hh: number; children: React.ReactNode }> = ({ o, k, W, Hh, children }) => (
  <div style={{ position: "absolute", left: o.x ?? L.X, top: o.y ?? 900, width: W, height: Hh, opacity: k, background: H.cardCompare, border: `2px solid ${H.lineSoft}`, boxSizing: "border-box", overflow: "hidden" }}>
    {o.title ? <div style={{ ...zh(CARD_HEAD.px, onC(H.line), 800), ...cardTitleBox(), background: H.line, zIndex: 2 }}>{o.title}</div> : null}
    {o.tag ? <div style={{ position: "absolute", right: 16, top: 14, ...zh(28, H.text2, 600), zIndex: 2 }}>{o.tag}</div> : null}
    {children}
  </div>
);
const on = (f: number, at: number, d = 10) => tween(f, at, d, EASE.enter);
const cl01 = (x: number) => Math.min(1, Math.max(0, x));
// 示意色（材料本身的顏色，不是頻道色票）：銅、膠片琥珀、玻纖白、綠漆、泥巴、跑道
const RED = "#E0472F", OK = "#14A38B", BLUE = "#2F7FE0", CU = "#C77B3C", CUH = "#E39A68", PP = "#E0A43A", PPD = "#B9822A", CORE = "#9C7A3C",
  YARN = "#EEF2F6", YARND = "#B8C4D2", RESIN = "#E9B85A", PCB = "#1E6B4E", PCBD = "#16523B", PAD = "#E0B84E", SI = "#5E6B82",
  COOK = "#8A5A35", CREAM = "#F6EBD5", MUD = "#7A5C3C", MUDD = "#5B4329", TRACK = "#3D7BD9", HOT = "#E5602B", SIG = "#2FB8C8";
const Sep: React.FC<{ x: number; y2?: number }> = ({ x, y2 = 316 }) => <line x1={x} y1={CT + 4} x2={x} y2={y2} stroke={H.lineSoft} strokeWidth={3} />;
const Row: React.FC<{ x: number; y: number; t: string; c: string; a: number; px?: number }> = ({ x, y, t, c, a, px = 30 }) => (
  <g opacity={0.35 + 0.65 * a}><rect x={x} y={y - px * 0.72} width={12} height={px * 0.72} fill={c} /><text x={x + 24} y={y} style={zh(px, H.text, 900)}>{t}</text></g>
);
const Cap: React.FC<{ x: number; y: number; t: string }> = ({ x, y, t }) => <text x={x} y={y} textAnchor="middle" style={zh(26, H.text2, 800)}>{t}</text>;
const Sv: React.FC<{ W: number; Hh: number; children: React.ReactNode }> = ({ W, Hh, children }) => <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>{children}</svg>;
const Arr: React.FC<{ x1: number; y: number; x2: number; c: string; w?: number }> = ({ x1, y, x2, c, w = 4 }) => { const d = Math.sign(x2 - x1) || 1; return (
  <g><line x1={x1} y1={y} x2={x2 - d * 8} y2={y} stroke={c} strokeWidth={w} /><path d={`M${x2},${y} L${x2 - d * 14},${y - 8} L${x2 - d * 14},${y + 8} Z`} fill={c} /></g>); };
const ArrV: React.FC<{ x: number; y1: number; y2: number; c: string; w?: number }> = ({ x, y1, y2, c, w = 4 }) => { const d = Math.sign(y2 - y1) || 1; return (
  <g><line x1={x} y1={y1} x2={x} y2={y2 - d * 8} stroke={c} strokeWidth={w} /><path d={`M${x},${y2} L${x - 8},${y2 - d * 14} L${x + 8},${y2 - d * 14} Z`} fill={c} /></g>); };
// 平織玻纖布：經紗（直）與緯紗（橫）一上一下交錯；a＝不透明度
const Weave: React.FC<{ x: number; y: number; w: number; h: number; p?: number; c?: string; d?: string; wet?: number }> = ({ x, y, w, h, p = 16, c = YARN, d = YARND, wet = 0 }) => {
  const nx = Math.floor(w / p), ny = Math.floor(h / p);
  return (<g>
    <rect x={x} y={y} width={w} height={h} fill={wet > 0 ? RESIN : "none"} opacity={wet} />
    {Array.from({ length: ny }, (_, j) => <rect key={`w${j}`} x={x} y={y + j * p + p * 0.18} width={w} height={p * 0.64} fill={c} stroke={d} strokeWidth={1} />)}
    {Array.from({ length: nx }, (_, i) => Array.from({ length: ny }, (_, j) => ((i + j) % 2 === 0 ?
      <rect key={`v${i}-${j}`} x={x + i * p + p * 0.18} y={y + j * p} width={p * 0.64} height={p} fill={c} stroke={d} strokeWidth={1} /> : null)))}
  </g>);
};
// 銅箔基板剖面：上銅／膠片（布紋點）／下銅
const Lam: React.FC<{ x: number; y: number; w: number; cu?: number; core?: number; n?: number; cc?: string }> = ({ x, y, w, cu = 10, core = 40, n = 2, cc = PP }) => (
  <g><rect x={x} y={y} width={w} height={cu} fill={CU} /><rect x={x} y={y + cu} width={w} height={core} fill={cc} stroke={H.text2} strokeWidth={1.2} />
    {Array.from({ length: n }, (_, r) => Array.from({ length: Math.floor(w / 14) }, (_, j) => <ellipse key={`${r}-${j}`} cx={x + 7 + j * 14} cy={y + cu + (core / (n + 1)) * (r + 1)} rx={5} ry={2.6} fill={YARN} />))}
    <rect x={x} y={y + cu + core} width={w} height={cu} fill={CU} /></g>
);
const FlagBox: React.FC<{ code: string; x: number; y: number; a: number }> = ({ code, x, y, a }) => (
  <g><rect x={x} y={y} width={50} height={36} fill="none" stroke={a > 0.5 ? H.amber : H.lineSoft} strokeWidth={a > 0.5 ? 4 : 1.5} /><Flag code={code} h={28} x={x + 4} y={y + 4} asSvg /></g>
);
const NamePlate: React.FC<{ x: number; y: number; w: number; h: number; t: string; a: number; px?: number }> = ({ x, y, w, h, t, a, px = 32 }) => (
  <g><rect x={x} y={y} width={w} height={h} fill="#FFFFFF" stroke={a > 0.5 ? H.amber : H.lineSoft} strokeWidth={a > 0.5 ? 4 : 1.5} />
    <text x={x + w / 2} y={y + h / 2 + px * 0.34} textAnchor="middle" style={zh(px, "#1F3A5F", 900)}>{t}</text></g>
);
// 小電路板（綠漆＋走線＋銲墊＋過孔）
const MiniPcb: React.FC<{ x: number; y: number; w: number; h: number }> = ({ x, y, w, h }) => (
  <g><rect x={x} y={y} width={w} height={h} rx={4} fill={PCB} stroke={PCBD} strokeWidth={2} />
    {[0.22, 0.42, 0.62, 0.82].map((r, i) => <path key={i} d={`M${x + 8},${y + h * r} L${x + w * 0.45},${y + h * r} L${x + w * 0.58},${y + h * (r - 0.1)} L${x + w - 10},${y + h * (r - 0.1)}`} fill="none" stroke={PAD} strokeWidth={2.5} />)}
    {[0.22, 0.42, 0.62, 0.82].map((r, i) => <g key={`p${i}`}><circle cx={x + 8} cy={y + h * r} r={4} fill={PAD} /><circle cx={x + w - 10} cy={y + h * (r - 0.1)} r={4.5} fill={PAD} /><circle cx={x + w - 10} cy={y + h * (r - 0.1)} r={1.8} fill={PCBD} /></g>)}
    <rect x={x + w * 0.3} y={y + h * 0.04} width={w * 0.34} height={h * 0.13} fill={SI} /></g>
);

// ── ccl-hook：載板看完了 → 主機板是什麼做的？ ──
const Hook: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330, sb = on(f, T(o, "sub")), q = on(f, T(o, "q")), pv = on(f, T(o, "prev")), cc = on(f, T(o, "ccl"));
  return (<Card o={o} k={k} W={W} Hh={Hh}><Sv W={W} Hh={Hh}>
    <g opacity={0.4 + 0.6 * Math.max(sb, pv)}><rect x={30} y={CT + 92} width={96} height={20} fill={CORE} stroke={H.text2} strokeWidth={1.5} /><rect x={54} y={CT + 70} width={48} height={22} fill={SI} />
      {Array.from({ length: 7 }, (_, j) => <circle key={j} cx={36 + j * 14} cy={CT + 118} r={4} fill="#B8BEC8" />)}</g>
    <Cap x={78} y={CT + 160} t="載板" />
    <Arr x1={136} y={CT + 100} x2={168} c={H.text2} />
    <g opacity={0.4 + 0.6 * Math.max(q, cc)}><MiniPcb x={176} y={CT + 40} w={140} h={120} /></g>
    <g opacity={q * (1 - cc)}><circle cx={246} cy={CT + 98} r={46} fill="#FFFFFF" stroke={RED} strokeWidth={3} /><text x={246} y={CT + 118} textAnchor="middle" style={zh(56, RED, 900)}>？</text></g>
    <Cap x={246} y={CT + 196} t="主機板" />
    <Sep x={334} />
    <Row x={360} y={CT + 48} t="載板看完了" c={H.text2} a={sb} />
    <Row x={360} y={CT + 108} t="主機板是什麼做的？" c={BLUE} a={q} />
    <Row x={360} y={CT + 168} t="前一集：玻璃基板" c={H.text2} a={pv} />
    <Row x={360} y={CT + 228} t="這集：銅箔基板" c={H.amber} a={cc} />
  </Sv></Card>);
};
// ── ccl-sand：夾心餅乾 ↔ 銅箔／膠片／銅箔 ──
const Sand: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330, ck = on(f, T(o, "cookie")), fb = on(f, T(o, "fab")), cu = on(f, T(o, "cu"));
  return (<Card o={o} k={k} W={W} Hh={Hh}><Sv W={W} Hh={Hh}>
    <g opacity={0.4 + 0.6 * ck}><rect x={30} y={CT + 50} width={120} height={22} rx={8} fill={COOK} /><rect x={36} y={CT + 72} width={108} height={24} fill={CREAM} /><rect x={30} y={CT + 96} width={120} height={22} rx={8} fill={COOK} />
      {[0, 1, 2, 3].map((j) => <circle key={j} cx={46 + j * 30} cy={CT + 61} r={3} fill="#5E3B20" />)}</g>
    <Cap x={90} y={CT + 160} t="夾心餅乾" />
    <text x={160} y={CT + 94} style={zh(36, H.text2, 900)}>＝</text>
    <g opacity={0.4 + 0.6 * Math.max(fb, cu)}><Lam x={212} y={CT + 46} w={106} cu={12 + 4 * cu} core={44} /></g>
    <Cap x={262} y={CT + 160} t="銅箔基板" />
    <text x={262} y={CT + 214} textAnchor="middle" style={zh(24, H.text2, 700)}>（厚度放大）</text>
    <Sep x={334} />
    <Row x={360} y={CT + 56} t="像夾心餅乾" c={BLUE} a={ck} />
    <Row x={360} y={CT + 122} t="中間：浸樹脂的玻纖布" c={PPD} a={fb} />
    <Row x={360} y={CT + 188} t="兩面：銅箔（之後做線路）" c={CU} a={cu} />
  </Sv></Card>);
};
// ── ccl-fab：玻璃絲 → 紗 → 平織＝紗窗 ──
const Fab: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330, gl = on(f, T(o, "glass")), sc = on(f, T(o, "screen")), hd = on(f, T(o, "hold"));
  const pull = hd * Math.sin(Math.min(1, Math.max(0, (f - T(o, "hold")) / 20)) * Math.PI) * 6;
  return (<Card o={o} k={k} W={W} Hh={Hh}><Sv W={W} Hh={Hh}>
    <g opacity={0.4 + 0.6 * gl}><circle cx={66} cy={CT + 90} r={40} fill="none" stroke={H.text2} strokeWidth={2} />
      {Array.from({ length: 19 }, (_, i) => { const a = i * 2.4, r = 6 + (i % 4) * 8; return <circle key={i} cx={66 + Math.cos(a) * Math.min(r, 32)} cy={CT + 90 + Math.sin(a) * Math.min(r, 32)} r={5} fill={YARN} stroke={YARND} />; })}</g>
    <Cap x={66} y={CT + 160} t="一根紗" />
    <Arr x1={112} y={CT + 90} x2={142} c={H.text2} />
    <g opacity={0.4 + 0.6 * Math.max(sc, hd)} transform={`translate(${-pull},0)`}><Weave x={152} y={CT + 30} w={160} h={128} p={16} /></g>
    {hd > 0 ? <g opacity={hd}><Arr x1={170} y={CT + 186} x2={146} c={OK} /><Arr x1={294} y={CT + 186} x2={318} c={OK} /></g> : null}
    <Cap x={232} y={CT + 220} t="平織：經緯交錯" />
    <Sep x={334} />
    <Row x={360} y={CT + 56} t="很多根玻璃絲捻成一根紗" c={H.text2} a={gl} />
    <Row x={360} y={CT + 122} t="經紗緯紗交錯，像紗窗" c={BLUE} a={sc} />
    <Row x={360} y={CT + 188} t="撐住形狀，不容易變形" c={OK} a={hd} />
  </Sv></Card>);
};
// ── ccl-pp：布泡樹脂（吸飽）→ 烘箱 → 半固化膠片 ──
const Pp: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330, so = on(f, T(o, "soak")), tw = on(f, T(o, "towel")), dr = on(f, T(o, "dry")), pp = on(f, T(o, "pp"));
  const wet = cl01((f - T(o, "soak")) / 40);
  return (<Card o={o} k={k} W={W} Hh={Hh}><Sv W={W} Hh={Hh}>
    <rect x={20} y={CT + 92} width={90} height={60} fill={RESIN} opacity={0.75} stroke={H.text2} strokeWidth={2} />
    <path d={`M20,${CT + 92} L20,${CT + 152} L110,${CT + 152} L110,${CT + 92}`} fill="none" stroke={H.text2} strokeWidth={3} />
    <g opacity={0.5 + 0.5 * Math.max(so, tw)}><Weave x={44} y={CT + 40} w={42} h={96} p={14} wet={wet} /></g>
    <Cap x={65} y={CT + 190} t="泡樹脂" />
    <Arr x1={116} y={CT + 88} x2={140} c={H.text2} />
    <g opacity={0.4 + 0.6 * dr}><rect x={146} y={CT + 46} width={80} height={90} fill="#F7E3D6" stroke={H.text2} strokeWidth={2} />
      {[0, 1, 2].map((j) => <path key={j} d={`M${160 + j * 24},${CT + 128} q6,-12 0,-24 q-6,-12 0,-24`} fill="none" stroke={HOT} strokeWidth={3} />)}</g>
    <Cap x={186} y={CT + 190} t="烘箱" />
    <Arr x1={232} y={CT + 88} x2={252} c={H.text2} />
    <g opacity={0.4 + 0.6 * pp}>{[0, 1, 2].map((j) => <g key={j}><rect x={258 + j * 4} y={CT + 64 + j * 16} width={58} height={12} fill={PP} stroke={PPD} strokeWidth={1.5} /></g>)}</g>
    <Cap x={287} y={CT + 190} t="膠片" />
    <Sep x={334} />
    <Row x={360} y={CT + 48} t="布整片泡進樹脂槽" c={H.text2} a={so} />
    <Row x={360} y={CT + 104} t="像紙巾吸飽醬汁" c={BLUE} a={tw} />
    <Row x={360} y={CT + 160} t="烘到半乾＝半固化" c={H.amber} a={dr} />
    <Row x={360} y={CT + 216} t="變成膠片，還能再融" c={PPD} a={pp} />
  </Sv></Card>);
};
// ── ccl-press：鋼板／銅箔／膠片×4／銅箔／鋼板，上下熱板夾住 → 融了流動 → 變硬 ──
const Press: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330, st = on(f, T(o, "stack")), fo = on(f, T(o, "foil")), pr = on(f, T(o, "press")), me = on(f, T(o, "melt")), gl = on(f, T(o, "glue"));
  const gap = 5 * (1 - pr), cx = 30, w = 280, y0 = CT + 30;
  const layers: [number, string][] = [[10, "#B8C2D0"], [7, CU], [14, PP], [14, PP], [14, PP], [14, PP], [7, CU], [10, "#B8C2D0"]];
  let y = y0 + 22;
  return (<Card o={o} k={k} W={W} Hh={Hh}><Sv W={W} Hh={Hh}>
    <rect x={cx - 6} y={y0 - 4 + 8 * (1 - pr)} width={w + 12} height={22} fill={HOT} opacity={0.4 + 0.6 * pr} />
    {pr > 0.3 ? <ArrV x={cx + w / 2} y1={y0 - 24} y2={y0 - 4} c={H.text} /> : null}
    {layers.map(([h, c], i) => { const isPP = c === PP, isCu = c === CU; const a = isPP ? st : isCu ? fo : Math.max(st, fo);
      const el = <rect key={i} x={cx} y={y + i * gap} width={w} height={h} fill={isPP && gl > 0 ? CORE : c} stroke={H.text2} strokeWidth={1} opacity={0.3 + 0.7 * a} />; y += h; return el; })}
    {me > 0 ? <g opacity={me}>{[0, 1].map((s) => <path key={s} d={`M${s ? cx + w : cx},${y0 + 60} q${s ? 14 : -14},6 ${s ? 10 : -10},20`} fill="none" stroke={PPD} strokeWidth={6} strokeLinecap="round" />)}</g> : null}
    <rect x={cx - 6} y={y + 7 * gap + 2} width={w + 12} height={22} fill={HOT} opacity={0.4 + 0.6 * pr} />
    <Cap x={cx + w / 2} y={CT + 240} t="熱板夾住整疊" />
    <Sep x={334} />
    <Row x={360} y={CT + 40} t="疊好膠片" c={PPD} a={st} />
    <Row x={360} y={CT + 92} t="兩面鋪好銅箔" c={CU} a={fo} />
    <Row x={360} y={CT + 144} t="上下熱板：又熱又壓" c={HOT} a={pr} />
    <Row x={360} y={CT + 196} t="樹脂融了，流進縫隙" c={H.amber} a={me} />
    <Row x={360} y={CT + 248} t="再變硬，黏成一整片" c={OK} a={gl} />
  </Sv></Card>);
};
// ── ccl-etch：整片銅 → 藥水吃掉多的銅 → 剩走線、銲墊、過孔；訊號沿線跑 ──
const Etch: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330, et = on(f, T(o, "etch")), ru = on(f, T(o, "run"));
  const g = cl01((f - T(o, "etch")) / 24);
  const ph = ((f - T(o, "run")) / 36) % 1;
  const tr = [CT + 70, CT + 116, CT + 162];
  return (<Card o={o} k={k} W={W} Hh={Hh}><Sv W={W} Hh={Hh}>
    <rect x={30} y={CT + 40} width={280} height={160} fill={CORE} stroke={H.text2} strokeWidth={1.5} />
    {tr.map((y, i) => <g key={i}><path d={`M58,${y} L170,${y} L196,${y + (i === 1 ? 0 : -14)} L282,${y + (i === 1 ? 0 : -14)}`} fill="none" stroke={CU} strokeWidth={8} />
      <circle cx={58} cy={y} r={10} fill={CU} /><circle cx={282} cy={y + (i === 1 ? 0 : -14)} r={11} fill={CU} /><circle cx={282} cy={y + (i === 1 ? 0 : -14)} r={4.5} fill={CORE} /></g>)}
    <rect x={30} y={CT + 40} width={280 * (1 - g)} height={160} fill={CUH} opacity={0.95} />
    {et > 0 && g < 1 ? <g>{[0, 1, 2, 3].map((j) => <path key={j} d={`M${30 + 280 * (1 - g) - 6},${CT + 50 + j * 40} l-14,-10`} stroke={BLUE} strokeWidth={4} />)}</g> : null}
    {ru > 0 && g >= 1 ? tr.map((y, i) => { const q = (ph + i * 0.3) % 1, xx = 58 + q * 224; const yy = xx < 170 ? y : xx < 196 ? y + (i === 1 ? 0 : -14) * (xx - 170) / 26 : y + (i === 1 ? 0 : -14);
      return <circle key={`s${i}`} cx={xx} cy={yy} r={7} fill={SIG} stroke="#FFFFFF" strokeWidth={2} opacity={ru} />; }) : null}
    <Cap x={170} y={CT + 236} t="走線、銲墊、過孔" />
    <Sep x={334} />
    <Row x={360} y={CT + 56} t="藥水把多的銅吃掉" c={BLUE} a={et} />
    <Row x={360} y={CT + 122} t="留下線路和銲墊" c={CU} a={g} />
    <Row x={360} y={CT + 188} t="訊號就沿著線路跑" c={SIG} a={ru} />
  </Sv></Card>);
};
// 訊號脈衝沿路衰減：amp(x)＝起始 × e^(−αx)
const Pulse: React.FC<{ x0: number; x1: number; y: number; alpha: number; a: number; ph: number; c: string }> = ({ x0, x1, y, alpha, a, ph, c }) => {
  const n = 3, pts: React.ReactNode[] = [];
  for (let i = 0; i < n; i++) { const q = (ph + i / n) % 1, x = x0 + q * (x1 - x0), amp = 30 * Math.exp(-alpha * q);
    pts.push(<path key={i} d={`M${x - 16},${y} L${x - 6},${y} L${x - 6},${y - amp} L${x + 6},${y - amp} L${x + 6},${y} L${x + 16},${y}`} fill="none" stroke={c} strokeWidth={4} opacity={a} />); }
  return <g>{pts}</g>;
};
// ── ccl-mud：一般材料：訊號越跑越弱（泥巴路） ──
const Mud: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330, ai = on(f, T(o, "ai")), fa = on(f, T(o, "fast")), ea = on(f, T(o, "eat")), mu = on(f, T(o, "mud"));
  const ph = ((f - T(o, "ai")) / 45) % 1;
  return (<Card o={o} k={k} W={W} Hh={Hh}><Sv W={W} Hh={Hh}>
    <rect x={26} y={CT + 130} width={290} height={30} fill={MUD} opacity={0.3 + 0.7 * mu} />
    {Array.from({ length: 9 }, (_, j) => <ellipse key={j} cx={44 + j * 32} cy={CT + 145 + (j % 2) * 5} rx={9} ry={4} fill={MUDD} opacity={mu} />)}
    <line x1={26} y1={CT + 126} x2={316} y2={CT + 126} stroke={CU} strokeWidth={5} />
    <Pulse x0={40} x1={300} y={CT + 120} alpha={2.3 * Math.max(ea, 0.2)} a={0.4 + 0.6 * fa} ph={ph} c={SIG} />
    <rect x={26} y={CT + 188} width={34} height={30} fill={SI} /><rect x={282} y={CT + 188} width={34} height={30} fill={SI} />
    <Cap x={43} y={CT + 250} t="送" /><Cap x={299} y={CT + 250} t="收" />
    <text x={300} y={CT + 70} textAnchor="end" style={zh(26, RED, 900)} opacity={ea}>到這只剩一點</text>
    <Sep x={334} />
    <Row x={360} y={CT + 48} t="人工智慧伺服器" c={BLUE} a={ai} />
    <Row x={360} y={CT + 104} t="訊號又快又多" c={SIG} a={fa} />
    <Row x={360} y={CT + 160} t="一般材料會吃掉訊號" c={RED} a={ea} />
    <Row x={360} y={CT + 216} t="像在泥巴路跑步" c={MUD} a={mu} />
  </Sv></Card>);
};
// ── ccl-track：低損耗樹脂：吃掉的約十分之一（長條比較，示意）──
const Track: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330, lo = on(f, T(o, "low")), te = on(f, T(o, "tenth")), tk = on(f, T(o, "track"));
  const g = cl01((f - T(o, "tenth")) / 20);
  return (<Card o={o} k={k} W={W} Hh={Hh}><Sv W={W} Hh={Hh}>
    <text x={30} y={CT + 40} style={zh(26, H.text2, 800)}>被吃掉的訊號（示意）</text>
    <rect x={30} y={CT + 62} width={260} height={40} fill={MUD} /><text x={30} y={CT + 132} style={zh(26, H.text2, 800)}>一般材料</text>
    <rect x={30} y={CT + 156} width={260 * (1 - 0.9 * g)} height={40} fill={TRACK} opacity={0.4 + 0.6 * lo} />
    <text x={30} y={CT + 226} style={zh(26, H.text2, 800)}>低損耗樹脂</text>
    <text x={182} y={CT + 228} style={zh(30, TRACK, 900)} opacity={te}>約 1/10</text>
    <Sep x={334} />
    <Row x={360} y={CT + 56} t="換成低損耗樹脂" c={TRACK} a={lo} />
    <Row x={360} y={CT + 122} t="吃掉的只剩約十分之一" c={H.amber} a={te} />
    <Row x={360} y={CT + 188} t="像把泥巴路鋪成跑道" c={OK} a={tk} />
  </Sv></Card>);
};
// ── ccl-co：台灣做高階銅箔基板的三家（念到的順序：台光電、聯茂、台燿；不排名） ──
const Co: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 392, a1 = on(f, T(o, "emc")), a2 = on(f, T(o, "iteq")), a3 = on(f, T(o, "tuc"));
  const rows: [string, string, string, number][] = [["TW", "台光電 2383", "高速伺服器用基板", a1], ["TW", "聯茂 6213", "伺服器平台用基板", a2], ["TW", "台燿 6274", "高速交換器用基板", a3]];
  return (<Card o={o} k={k} W={W} Hh={Hh}><Sv W={W} Hh={Hh}>
    {rows.map(([c, n, s, a], i) => <g key={n}><FlagBox code={c} x={30} y={CT + 36 + i * 96} a={a} /><NamePlate x={98} y={CT + 30 + i * 96} w={300} h={50} t={n} a={a} />
      <text x={418} y={CT + 66 + i * 96} style={zh(30, H.text2, 800)} opacity={0.4 + 0.6 * a}>{s}</text></g>)}
  </Sv></Card>);
};
// ── ccl-next：布要多平、銅要多光滑？下一集銅箔與玻纖布；留言關鍵字 ──
const Next: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330, up = on(f, T(o, "up")), fl = on(f, T(o, "flat")), sm = on(f, T(o, "smooth")), nx = on(f, T(o, "next")), kw = on(f, T(o, "kw"));
  return (<Card o={o} k={k} W={W} Hh={Hh}><Sv W={W} Hh={Hh}>
    <g opacity={0.4 + 0.6 * Math.max(fl, nx)}><Weave x={30} y={CT + 40} w={128} h={80} p={16} /></g>
    <Cap x={94} y={CT + 150} t="布：多平？" />
    <g opacity={0.4 + 0.6 * Math.max(sm, nx)}><path d={`M182,${CT + 100} ${Array.from({ length: 13 }, (_, i) => `L${182 + i * 10},${CT + 100 - (i % 2 ? 8 : 0) * (1 - sm * 0.7)}`).join(" ")} L302,${CT + 120} L182,${CT + 120} Z`} fill={CU} />
      <rect x={182} y={CT + 120} width={120} height={20} fill={PP} /></g>
    <Cap x={242} y={CT + 170} t="銅：多光滑？" />
    <Sep x={334} />
    <Row x={360} y={CT + 48} t="樹脂換了，布和銅也升級" c={H.text2} a={up} />
    <Row x={360} y={CT + 104} t="布要多平？銅要多光滑？" c={BLUE} a={Math.max(fl, sm)} />
    <Row x={360} y={CT + 160} t="下一集：銅箔與玻纖布" c={OK} a={nx} />
    <Row x={360} y={CT + 216} t="留言「銅箔基板」拿資料" c={H.amber} a={kw} />
  </Sv></Card>);
};

export const CclSection: React.FC<P> = (p) => {
  const kd = String((p.o as any).kind);
  const M: Record<string, React.FC<P>> = { "ccl-hook": Hook, "ccl-sand": Sand, "ccl-fab": Fab, "ccl-pp": Pp, "ccl-press": Press, "ccl-etch": Etch, "ccl-mud": Mud, "ccl-track": Track, "ccl-co": Co, "ccl-next": Next };
  const C2 = M[kd]; return C2 ? <C2 {...p} /> : null;
};

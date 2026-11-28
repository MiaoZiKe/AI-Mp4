// 2026/11/28 tech-compound：中游補充篇 M3「化合物半導體（碳化矽 SiC／氮化鎵 GaN）」的 2D 示意卡（overlay `section` 的 kind 以 "cp-" 開頭，Hud.tsx 轉過來）。
//   cp-hook 矽撐不住高壓→碳化矽、氮化鎵｜cp-gap 能帶示意（價帶、導帶、能隙＝門檻、漏電）｜cp-dam 能隙＝堤防高度（1.12／3.26／3.4 eV）與水位（電壓）
//   cp-ev 電動車：電池（直流）→功率模組→馬達（交流），發熱示意｜cp-gan 氮化鎵開關快→快充頭變小、AI 機房電源｜cp-pvt 碳化矽長晶爐剖面（昇華、像結霜、長得慢）
//   cp-epi 矽基板上磊晶長一層氮化鎵（原子照排列落下）｜cp-tw 台灣：基板→磊晶→元件代工（環球晶、嘉晶、漢磊）｜cp-next 再生晶圓循環＋留言關鍵字。
// 全部示意；數字只用查證過的（能隙三個值、長晶時間與長度為 2019 報導）。結構一開始就畫出，念到 cue 才亮起或動起來；時間全部來自 overlay 的 t。
// 排版原則（card-overlap.mjs 檢查）：內容從 CARD_CONTENT_TOP 以下；字 ≥30px（小字標 ≥28）；字不放進會動的圖形範圍；字離圖形 ≥6px。
// LOGO／國旗 100% 不透明（未輪到細灰框、輪到粗框）；沒有原檔 LOGO 的公司（嘉晶、漢磊）用白底深色文字名牌（不仿商標）。
import React from "react";
import { FONT_ZH } from "../../theme";
import { H, L, CARD_HEAD, CARD_CONTENT_TOP, cardTitleBox } from "./hudSkin";
import { EASE, tween } from "../anim";
import type { Model3D, Overlay3D, State3D } from "./engine";
import { Flag, LOGOS, LogoSvg } from "./Brand";

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
const fr = (x: number) => ((x % 1) + 1) % 1;
const lerp = (a: number, b: number, u: number) => a + (b - a) * u;
/** 兩個 #RRGGBB 顏色內插 */
const mix = (a: string, b: string, u: number) => {
  const p = (c: string, i: number) => parseInt(c.slice(1 + i * 2, 3 + i * 2), 16);
  return "#" + [0, 1, 2].map((i) => Math.round(lerp(p(a, i), p(b, i), cl01(u))).toString(16).padStart(2, "0")).join("");
};
// 示意色（材料本身的顏色，不是頻道色票）
const RED = "#E0472F", OK = "#14A38B", BLUE = "#2F7FE0", SI = "#5E6B82", SIL = "#A9B5C7", SICL = "#9ED9BC", SIC = "#3FA37A", SICD = "#2E7D5B", GANC = "#C3C9D2", GAND = "#7D8592",
  ELEC = "#F6D365", HEAT = "#E5602B", BOLT = "#F2B632", CU = "#D2793F", GRAPH = "#3B3F47", INSUL = "#E3DED6", POWDER = "#D9CBA8", CHIP = "#2E3442", WATER = "#4DA3FF";
const Sep: React.FC<{ x: number; y0?: number; y2?: number }> = ({ x, y0 = CT + 4, y2 = 316 }) => <line x1={x} y1={y0} x2={x} y2={y2} stroke={H.lineSoft} strokeWidth={3} />;
const Row: React.FC<{ x: number; y: number; t: string; c: string; a: number; px?: number }> = ({ x, y, t, c, a, px = 30 }) => (
  <g opacity={0.35 + 0.65 * a}><rect x={x} y={y - px * 0.72} width={12} height={px * 0.72} fill={c} /><text x={x + 24} y={y} style={zh(px, H.text, 900)}>{t}</text></g>
);
const Cap: React.FC<{ x: number; y: number; t: string; px?: number; c?: string; a?: number }> = ({ x, y, t, px = 30, c = H.text2, a = 1 }) => (
  <text x={x} y={y} textAnchor="middle" style={zh(px, c, 800)} opacity={0.35 + 0.65 * a}>{t}</text>
);
const Sv: React.FC<{ W: number; Hh: number; children: React.ReactNode }> = ({ W, Hh, children }) => <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>{children}</svg>;
const Arr: React.FC<{ x1: number; y: number; x2: number; c: string; w?: number }> = ({ x1, y, x2, c, w = 4 }) => { const d = Math.sign(x2 - x1) || 1; return (
  <g><line x1={x1} y1={y} x2={x2 - d * 8} y2={y} stroke={c} strokeWidth={w} /><path d={`M${x2},${y} L${x2 - d * 14},${y - 8} L${x2 - d * 14},${y + 8} Z`} fill={c} /></g>); };
/** 直向箭頭（頭的寬度跟著線寬放大） */
const ArrV: React.FC<{ x: number; y1: number; y2: number; c: string; w?: number }> = ({ x, y1, y2, c, w = 4 }) => { const d = Math.sign(y2 - y1) || 1, hw = 6 + w, hl = 10 + w * 1.4; return (
  <g><line x1={x} y1={y1} x2={x} y2={y2 - d * hl * 0.6} stroke={c} strokeWidth={w} /><path d={`M${x},${y2} L${x - hw},${y2 - d * hl} L${x + hw},${y2 - d * hl} Z`} fill={c} /></g>); };
const Check: React.FC<{ x: number; y: number; o?: number }> = ({ x, y, o = 1 }) => <path opacity={o} d={`M${x - 18} ${y} l12 12 l26 -28`} stroke={OK} strokeWidth={7} fill="none" />;
const FlagBox: React.FC<{ code: string; x: number; y: number; a: number }> = ({ code, x, y, a }) => (
  <g><rect x={x} y={y} width={50} height={36} fill="none" stroke={a > 0.5 ? H.amber : H.lineSoft} strokeWidth={a > 0.5 ? 4 : 1.5} /><Flag code={code} h={28} x={x + 4} y={y + 4} asSvg /></g>
);
// 公司：有原檔用 LOGO（白底、100% 不透明），沒有就白底深藍字名牌（不仿商標）
const Brand: React.FC<{ id?: string; name: string; x: number; y: number; w: number; h: number; a: number }> = ({ id, name, x, y, w, h, a }) => {
  const s = id ? LOGOS[id] : undefined; const lh = h - 14, lw = s ? Math.min(w - 16, (lh * s.w) / s.h) : 0, lh2 = s ? (lw * s.h) / s.w : 0;
  return (<g><rect x={x} y={y} width={w} height={h} fill="#FFFFFF" stroke={a > 0.5 ? H.amber : H.lineSoft} strokeWidth={a > 0.5 ? 4 : 1.5} />
    {s && id ? <LogoSvg id={id} x={x + (w - lw) / 2} y={y + (h - lh2) / 2} h={lh2} /> : <text x={x + w / 2} y={y + h / 2 + 12} textAnchor="middle" style={zh(34, "#1F3A5F", 900)}>{name}</text>}</g>);
};
// 晶圓俯視（圓＋晶粒格）：pat＝晶粒格的不透明度（0＝亮面空白晶圓）
const Wafer: React.FC<{ cx: number; cy: number; r: number; c?: string; d?: string; pat?: number; shine?: boolean }> = ({ cx, cy, r, c = SIL, d = "#4C5E86", pat = 1, shine }) => {
  const n = 6, g = (r * 2) / n, cells: React.ReactNode[] = [];
  if (pat > 0.01) for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) { const x = cx - r + i * g, y = cy - r + j * g; if (Math.hypot(Math.abs(x + g / 2 - cx) + g / 2, Math.abs(y + g / 2 - cy) + g / 2) < r * 0.97) cells.push(<rect key={`${i}-${j}`} x={x + 1.5} y={y + 1.5} width={g - 3} height={g - 3} fill={d} />); }
  return (<g><circle cx={cx} cy={cy} r={r} fill={c} stroke={H.text2} strokeWidth={2} /><g opacity={pat}>{cells}</g>
    {shine ? <ellipse cx={cx - r * 0.3} cy={cy - r * 0.35} rx={r * 0.38} ry={r * 0.16} fill="#FFFFFF" opacity={0.75} transform={`rotate(-30 ${cx - r * 0.3} ${cy - r * 0.35})`} /> : null}</g>);
};
/** 方波：x0→x1，高低兩個 y，週期 per，相位 ph（px，≥0） */
const sq = (x0: number, x1: number, yH: number, yL: number, per: number, ph: number) => {
  const h = per / 2, p = ((ph % per) + per) % per; let y = p >= h ? yL : yH, nx = x0 + (h - (p % h)), d = `M${x0},${y}`;
  while (nx < x1) { d += ` L${nx.toFixed(1)},${y}`; y = y === yH ? yL : yH; d += ` L${nx.toFixed(1)},${y}`; nx += h; }
  return d + ` L${x1},${y}`;
};
/** 正弦波 */
const sine = (x0: number, x1: number, yc: number, amp: number, periods: number, ph = 0) => {
  let d = ""; for (let i = 0; i <= 48; i++) { const u = i / 48, x = lerp(x0, x1, u), y = yc - amp * Math.sin(u * periods * Math.PI * 2 + ph); d += `${i ? " L" : "M"}${x.toFixed(1)},${y.toFixed(1)}`; } return d;
};

// ── cp-hook：矽（念到 prev 出現閃電與「撐不住高壓」）、碳化矽（sic 打勾）、氮化鎵（矽底＋銀灰膜，gan 打勾）；hv「專門扛高壓」 ──
const Hook: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330, pv = on(f, T(o, "prev")), q = on(f, T(o, "q")), sc = on(f, T(o, "sic")), gn = on(f, T(o, "gan")), hv = on(f, T(o, "hv"));
  const cy = CT + 100, r = 46, xs = [170, 476, 782];
  return (<Card o={o} k={k} W={W} Hh={Hh}><Sv W={W} Hh={Hh}>
    <Row x={30} y={CT + 34} t="前一集：矽撐不住" c={RED} a={pv} />
    <Row x={520} y={CT + 34} t="換什麼材料？" c={BLUE} a={q} />
    {/* 矽：灰色晶圓＋閃電 */}
    <circle cx={xs[0]} cy={cy} r={r} fill={SI} stroke={H.text2} strokeWidth={2} />
    <path opacity={pv} d={`M246,${CT + 52} L224,${CT + 102} L242,${CT + 102} L228,${CT + 148} L264,${CT + 88} L246,${CT + 88} L262,${CT + 52} Z`} fill={BOLT} stroke="#8A5E3A" strokeWidth={2} />
    <Cap x={xs[0]} y={CT + 188} t="矽" c={H.text} />
    <text x={xs[0]} y={CT + 240} textAnchor="middle" style={zh(30, RED, 900)} opacity={pv}>撐不住高壓</text>
    {/* 碳化矽：淡綠晶圓 */}
    <circle cx={xs[1]} cy={cy} r={r} fill={SICL} stroke={H.text2} strokeWidth={2} />
    <Check x={xs[1] + 74} y={CT + 70} o={sc} />
    <Cap x={xs[1]} y={CT + 188} t="碳化矽" c={H.text} a={sc} />
    {/* 氮化鎵：矽底＋銀灰膜 */}
    <circle cx={xs[2]} cy={cy} r={r} fill={SI} stroke={H.text2} strokeWidth={2} />
    <circle cx={xs[2]} cy={cy} r={r - 7} fill={GANC} />
    <Check x={xs[2] + 74} y={CT + 70} o={gn} />
    <Cap x={xs[2]} y={CT + 188} t="氮化鎵" c={H.text} a={gn} />
    <text x={629} y={CT + 240} textAnchor="middle" style={zh(30, H.amber, 900)} opacity={0.35 + 0.65 * hv}>碳化矽、氮化鎵：專門扛高壓</text>
  </Sv></Card>);
};
// ── cp-gap：能帶示意：下方價帶排滿電子、上方導帶空；中間＝能隙＝門檻；elec 一顆電子發亮；low 電壓箭頭變大；leak 電子跳過門檻沿導帶流走＝漏電 ──
const Gap: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330, gp = on(f, T(o, "gap")), el = on(f, T(o, "elec")), br = on(f, T(o, "bar")), lw = on(f, T(o, "low")), lk = on(f, T(o, "leak"));
  const vy = CT + 211, cy = CT + 37, hx = 402;
  const ju = EASE.move(cl01((f - T(o, "leak")) / 18)), fl = EASE.move(cl01((f - T(o, "leak") - 18) / 40));
  const ex = f < T(o, "leak") ? hx : lerp(hx, 64, fl), ey = f < T(o, "leak") ? vy : lerp(vy, cy, ju);
  const al = 50 + 70 * lw, aw = 4 + 6 * lw;
  return (<Card o={o} k={k} W={W} Hh={Hh}><Sv W={W} Hh={Hh}>
    {/* 導帶（空）與價帶（藍，排滿電子） */}
    <rect x={40} y={CT + 14} width={400} height={46} fill="#D5DCE8" />
    <rect x={40} y={CT + 188} width={400} height={46} fill={BLUE} />
    {Array.from({ length: 10 }, (_, i) => 60 + i * 38).map((x, i) => i === 9 ? null : <circle key={i} cx={x} cy={vy} r={9} fill={ELEC} />)}
    {f >= T(o, "leak") ? <circle cx={hx} cy={vy} r={9} fill="none" stroke={ELEC} strokeWidth={2} /> : null}
    {/* 能隙：雙箭頭＋標字 */}
    <g opacity={0.35 + 0.65 * gp}><line x1={70} y1={CT + 76} x2={70} y2={CT + 172} stroke={H.text2} strokeWidth={3} />
      <path d={`M70,${CT + 64} L62,${CT + 78} L78,${CT + 78} Z`} fill={H.text2} /><path d={`M70,${CT + 184} L62,${CT + 170} L78,${CT + 170} Z`} fill={H.text2} /></g>
    <text x={100} y={CT + 136} style={zh(30, H.text, 900)} opacity={0.35 + 0.65 * Math.max(gp, br)}>能隙＝門檻</text>
    {/* 跳躍路徑與漏電 */}
    <line x1={hx} y1={CT + 180} x2={hx} y2={CT + 66} stroke={RED} strokeWidth={3} strokeDasharray="8 6" opacity={lk} />
    <text x={300} y={CT + 136} style={zh(30, RED, 900)} opacity={lk}>漏電</text>
    {el > 0.01 ? <circle cx={ex} cy={ey} r={16} fill="none" stroke={H.amber} strokeWidth={3} opacity={el} /> : null}
    <circle cx={ex} cy={ey} r={9} fill={el > 0.5 ? H.amber : ELEC} />
    {/* 電壓箭頭（low 變大） */}
    <g opacity={0.35 + 0.65 * Math.max(br, lw)}><ArrV x={505} y1={CT + 200} y2={CT + 200 - al} c={RED} w={aw} /></g>
    <Cap x={505} y={CT + 240} t="電壓" a={Math.max(br, lw)} />
    <Sep x={566} />
    <Row x={590} y={CT + 40} t="中間空隙＝能隙" c={H.text2} a={gp} />
    <Row x={590} y={CT + 90} t="電子想跳上去導電" c={H.amber} a={el} />
    <Row x={590} y={CT + 140} t="門檻越高越難跳" c={BLUE} a={br} />
    <Row x={590} y={CT + 190} t="門檻低又加高壓" c={RED} a={lw} />
    <Row x={590} y={CT + 240} t="電子跳過＝漏電" c={RED} a={lk} />
  </Sv></Card>);
};
// ── cp-dam：能隙＝堤防高度（矽 1.12、碳化矽 3.26、氮化鎵 3.4 eV，按比例）；x3 約 3 倍；dam 水位（電壓）上漲淹過矽；hold 擋得住 ──
const Dam: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330, wd = on(f, T(o, "wide")), x3 = on(f, T(o, "x3")), dm = on(f, T(o, "dam")), hd = on(f, T(o, "hold"));
  const base = CT + 200, sc = 140 / 3.4, wh = 64 * EASE.move(cl01((f - T(o, "dam")) / 24));
  const bars: [string, number, string, number, number][] = [["矽", 1.12, SI, 90, CT + 120], ["碳化矽", 3.26, SIC, 230, 0], ["氮化鎵", 3.4, GANC, 370, 0]];
  return (<Card o={o} k={k} W={W} Hh={Hh}><Sv W={W} Hh={Hh}>
    {bars.map(([n, v, c, cx, ty]) => { const h = v * sc; return (<g key={n}>
      <rect x={cx - 40} y={base - h} width={80} height={h} fill={c} stroke={H.text2} strokeWidth={2} />
      <text x={cx} y={ty || base - h - 10} textAnchor="middle" style={zh(30, H.text, 900)} opacity={0.35 + 0.65 * Math.max(wd, x3)}>{`${v} eV`}</text>
      <Cap x={cx} y={CT + 240} t={n} c={H.text} />
    </g>); })}
    {/* 水位＝電壓 */}
    {wh > 0.5 ? <rect x={36} y={base - wh} width={394} height={wh} fill={WATER} opacity={0.45} /> : null}
    <Sep x={456} />
    <Row x={480} y={CT + 44} t="寬能隙＝門檻高" c={H.text2} a={wd} />
    <Row x={480} y={CT + 104} t="約矽的 3 倍" c={H.amber} a={x3} />
    <Row x={480} y={CT + 164} t="水位＝電壓：矽被淹過" c={WATER} a={dm} />
    <Row x={480} y={CT + 224} t="擋得住高電壓" c={OK} a={hd} />
    <Check x={712} y={CT + 214} o={hd} />
  </Sv></Card>);
};
// ── cp-ev：電池（直流平線）→ 功率模組（碳化矽開關）→ 馬達（交流正弦）；電流光點沿箭頭跑；loss 熱度條：矽長、碳化矽短（示意） ──
const Ev: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330, ev = on(f, T(o, "ev")), bt = on(f, T(o, "bat")), mt = on(f, T(o, "motor")), ls = on(f, T(o, "loss"));
  const by = CT + 6, bh = 100, ay = by + bh / 2, run = f >= T(o, "ev");
  const box = (x: number, w: number, a: number, c: string) => <rect x={x} y={by} width={w} height={bh} fill="#FFFFFF" stroke={a > 0.5 ? c : H.lineSoft} strokeWidth={a > 0.5 ? 4 : 2} />;
  const dots = (x0: number) => [0, 1, 2].map((j) => { const u = fr((f - T(o, "ev")) / 30 + j / 3); return <circle key={j} cx={x0 + 6 + u * 66} cy={ay} r={6} fill={H.amber} />; });
  return (<Card o={o} k={k} W={W} Hh={Hh}><Sv W={W} Hh={Hh}>
    {box(30, 220, bt, BLUE)}<text x={140} y={by + 40} textAnchor="middle" style={zh(30, H.text, 900)}>電池（直流）</text>
    <line x1={60} y1={by + 76} x2={220} y2={by + 76} stroke={BLUE} strokeWidth={4} opacity={0.35 + 0.65 * bt} />
    {box(340, 270, ev, SIC)}<text x={475} y={by + 40} textAnchor="middle" style={zh(30, H.text, 900)}>功率模組</text>
    <text x={475} y={by + 84} textAnchor="middle" style={zh(30, SICD, 900)} opacity={0.35 + 0.65 * ev}>碳化矽開關</text>
    {box(700, 222, mt, H.amber)}<text x={811} y={by + 40} textAnchor="middle" style={zh(30, H.text, 900)}>馬達（交流）</text>
    <path d={sine(730, 892, by + 76, 14, 2, run ? (f - T(o, "ev")) * 0.15 : 0)} fill="none" stroke={H.amber} strokeWidth={4} opacity={0.35 + 0.65 * mt} />
    <Arr x1={254} y={ay} x2={336} c={H.text2} /><Arr x1={614} y={ay} x2={696} c={H.text2} />
    {run ? <g opacity={ev}>{dots(254)}{dots(614)}</g> : null}
    {/* 發熱示意 */}
    <Cap x={30} y={CT + 150} t="矽" c={H.text} />
    <rect x={140} y={CT + 132} width={420} height={16} fill={H.lineSoft} /><rect x={140} y={CT + 132} width={420 * ls} height={16} fill={HEAT} />
    <text x={580} y={CT + 150} style={zh(30, H.text, 900)} opacity={0.35 + 0.65 * ls}>較熱</text>
    <text x={30} y={CT + 196} style={zh(30, H.text, 800)}>碳化矽</text>
    <rect x={140} y={CT + 178} width={420} height={16} fill={H.lineSoft} /><rect x={140} y={CT + 178} width={160 * ls} height={16} fill={HEAT} />
    <text x={580} y={CT + 196} style={zh(30, OK, 900)} opacity={0.35 + 0.65 * ls}>發熱較少</text>
    <text x={30} y={CT + 242} style={zh(28, H.text2, 800)} opacity={0.35 + 0.65 * ls}>發熱示意，不是量測</text>
  </Sv></Card>);
};
// ── cp-gan：左：開關波形（矽慢、氮化鎵密）｜中：快充頭（small：矽大虛線框縮成氮化鎵小框）｜右：AI 機房電源（伺服器） ──
const Gan: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330, fs = on(f, T(o, "fast")), cg = on(f, T(o, "chg")), ai = on(f, T(o, "ai")), sm = on(f, T(o, "small"), 20);
  const ph = f >= T(o, "fast") ? (f - T(o, "fast")) * 1.2 : 0;
  const bx = lerp(420, 460, sm), byy = lerp(CT + 14, CT + 62, sm), bw = lerp(180, 100, sm), bh = lerp(174, 126, sm);
  return (<Card o={o} k={k} W={W} Hh={Hh}><Sv W={W} Hh={Hh}>
    <text x={30} y={CT + 50} style={zh(30, H.text, 900)}>矽</text>
    <path d={sq(140, 360, CT + 22, CT + 58, 110, ph * 0.25)} fill="none" stroke={SI} strokeWidth={4} />
    <text x={30} y={CT + 130} style={zh(30, H.text, 900)} opacity={0.35 + 0.65 * fs}>氮化鎵</text>
    <path d={sq(140, 360, CT + 102, CT + 138, 28, ph)} fill="none" stroke={GAND} strokeWidth={4} opacity={0.35 + 0.65 * fs} />
    <Cap x={195} y={CT + 236} t="開關更快" a={fs} />
    {/* 快充頭＋體積框 */}
    <rect x={bx} y={byy} width={bw} height={bh} fill="none" stroke={sm > 0.5 ? GAND : SI} strokeWidth={3} strokeDasharray="10 6" opacity={0.35 + 0.65 * cg} />
    <g opacity={0.35 + 0.65 * cg}><rect x={488} y={CT + 74} width={8} height={24} fill={GAND} /><rect x={524} y={CT + 74} width={8} height={24} fill={GAND} />
      <rect x={474} y={CT + 96} width={72} height={82} rx={10} fill="#F4F6F9" stroke={H.text2} strokeWidth={2} />
      <path d={`M514,${CT + 112} L500,${CT + 140} L512,${CT + 140} L504,${CT + 164} L524,${CT + 132} L512,${CT + 132} L520,${CT + 112} Z`} fill={BOLT} /></g>
    <Cap x={510} y={CT + 236} t={sm > 0.5 ? "變小（體積示意）" : "快充頭"} a={cg} />
    {/* AI 機房電源（伺服器） */}
    <rect x={720} y={CT + 20} width={160} height={168} fill="#FFFFFF" stroke={ai > 0.5 ? H.amber : H.lineSoft} strokeWidth={ai > 0.5 ? 4 : 2} />
    {[0, 1, 2, 3].map((i) => <g key={i}><rect x={734} y={CT + 32 + i * 38} width={132} height={28} fill={CHIP} /><circle cx={850} cy={CT + 46 + i * 38} r={5} fill={ai > 0.5 ? "#3BD67A" : "#6B7280"} /></g>)}
    <Cap x={800} y={CT + 236} t="AI 機房電源" a={ai} />
  </Sv></Card>);
};
// ── cp-pvt：長晶爐剖面（保溫層、感應線圈、石墨坩堝、底部粉末、頂部晶種與晶錠）；hot 粉末轉紅；frost 粒子往上飄、晶錠變厚；slow 對照長條 ──
const Pvt: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 392, hd = on(f, T(o, "hard")), ht = on(f, T(o, "hot"), 20), fr2 = on(f, T(o, "frost")), sl = on(f, T(o, "slow"));
  const grow = cl01((f - T(o, "frost")) / 90), ingH = 6 + 40 * grow, ingBot = CT + 60 + ingH;
  const run = f >= T(o, "frost");
  return (<Card o={o} k={k} W={W} Hh={Hh}><Sv W={W} Hh={Hh}>
    <rect x={70} y={CT + 8} width={260} height={260} fill={INSUL} stroke={H.text2} strokeWidth={2} />
    {[0, 1, 2, 3, 4, 5].map((i) => <g key={i}><circle cx={52} cy={CT + 30 + i * 40} r={9} fill={mix(CU, RED, ht)} /><circle cx={348} cy={CT + 30 + i * 40} r={9} fill={mix(CU, RED, ht)} /></g>)}
    <rect x={116} y={CT + 34} width={168} height={212} fill={GRAPH} />
    <rect x={132} y={CT + 50} width={136} height={180} fill="#59606B" />
    <rect x={132} y={CT + 188} width={136} height={42} fill={mix(POWDER, RED, ht)} />
    <rect x={170} y={CT + 50} width={60} height={10} fill={SICD} />
    <rect x={164} y={CT + 60} width={72} height={ingH} fill={SIC} />
    {run ? Array.from({ length: 8 }, (_, i) => { const u = fr((f - T(o, "frost")) / 40 + i / 8), x = 150 + (i % 4) * 32 + (i > 3 ? 16 : 0); return <circle key={i} cx={x} cy={lerp(CT + 182, ingBot + 6, u)} r={5} fill={SICL} opacity={fr2 * (1 - u * 0.5)} />; }) : null}
    <text x={30} y={CT + 306} style={zh(30, H.text, 900)} opacity={0.35 + 0.65 * hd}>長晶爐（剖開示意）</text>
    <Sep x={396} y2={376} />
    <Row x={416} y={CT + 36} t="比煉鋼爐還熱" c={RED} a={ht} />
    <text x={440} y={CT + 72} style={zh(28, H.text2, 800)} opacity={0.35 + 0.65 * ht}>兩千多度（媒體報導）</text>
    <Row x={416} y={CT + 118} t="氣體直接凝成固體＝像結霜" c={SIC} a={fr2} />
    <g opacity={0.35 + 0.65 * sl}>
      <text x={416} y={CT + 170} style={zh(30, H.text, 900)}>矽晶棒：約 2.5 天、1～2 公尺</text>
      <rect x={416} y={CT + 182} width={380} height={14} fill={SI} />
      <text x={416} y={CT + 238} style={zh(30, H.text, 900)}>碳化矽：7～10 天、幾公分</text>
      <rect x={416} y={CT + 250} width={10} height={14} fill={SIC} />
      <text x={416} y={CT + 300} style={zh(28, H.text2, 800)}>長晶數字：報導（2019）</text>
    </g>
  </Sv></Card>);
};
// ── cp-epi：矽基板（厚）剖面；layer 原子一顆顆照底下排列落下，長出一層氮化鎵；epi 標「磊晶：照底下的排列鋪一層新晶體」 ──
const Epi: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330, si = on(f, T(o, "si")), ly = on(f, T(o, "film")), ep = on(f, T(o, "epi"));
  const cols = Array.from({ length: 18 }, (_, i) => 50 + i * 28), t0 = T(o, "film");
  const rowsY = [CT + 158, CT + 134];
  return (<Card o={o} k={k} W={W} Hh={Hh}><Sv W={W} Hh={Hh}>
    <text x={30} y={CT + 36} style={zh(30, H.amber, 900)} opacity={0.35 + 0.65 * ep}>磊晶：照底下的排列鋪一層新晶體</text>
    <rect x={36} y={CT + 174} width={504} height={78} fill={SI} />
    {[CT + 190, CT + 214, CT + 238].map((y) => cols.map((x) => <circle key={`${x}-${y}`} cx={x} cy={y} r={6} fill="#8C97AB" />))}
    <rect x={36} y={CT + 122} width={504} height={48} fill="none" stroke={GAND} strokeWidth={2} strokeDasharray="8 6" opacity={0.6 * (1 - ly) + 0.2} />
    {rowsY.map((y, r) => cols.map((x, i) => { const n = r * cols.length + i, u = cl01((f - t0 - n * 0.8) / 10); if (f < t0 || u <= 0) return null;
      return <circle key={`g${r}-${i}`} cx={x} cy={lerp(CT + 70, y, EASE.move(u))} r={9} fill={GANC} stroke={GAND} strokeWidth={1.5} />; }))}
    <Sep x={580} y0={CT + 60} />
    <Row x={600} y={CT + 110} t="底下：矽基板（厚）" c={SI} a={si} />
    <Row x={600} y={CT + 170} t="原子照排列落下" c={GAND} a={ly} />
    <Row x={600} y={CT + 230} t="長出一層氮化鎵" c={GANC} a={ep} />
  </Sv></Card>);
};
// ── cp-tw：基板 → 磊晶 → 元件代工；環球晶（LOGO）6488、嘉晶（名牌）3016、漢磊（名牌）3707；各段念到時亮（粗框），亮過保持 ──
const Tw: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 392, th = on(f, T(o, "three")), a1 = on(f, T(o, "gw")), a2 = on(f, T(o, "epw")), a3 = on(f, T(o, "hl"));
  const rows: [string, string | undefined, string, string, number][] = [["基板", "globalwafers", "環球晶", "6488", a1], ["磊晶", undefined, "嘉晶", "3016", a2], ["元件代工", undefined, "漢磊", "3707", a3]];
  return (<Card o={o} k={k} W={W} Hh={Hh}><Sv W={W} Hh={Hh}>
    {rows.map(([st, id, n, code, a], i) => { const y0 = CT + 14 + i * 98; return (<g key={n}>
      <g opacity={0.4 + 0.6 * Math.max(th, a)}><rect x={30} y={y0} width={200} height={56} fill={a > 0.5 ? "#FFF4DA" : "#FFFFFF"} stroke={a > 0.5 ? H.amber : H.lineSoft} strokeWidth={a > 0.5 ? 4 : 2} />
        <text x={130} y={y0 + 39} textAnchor="middle" style={zh(30, H.text, 900)}>{st}</text>
        {i < 2 ? <ArrV x={130} y1={y0 + 62} y2={y0 + 94} c={H.text2} w={3} /> : null}</g>
      <FlagBox code="TW" x={260} y={y0 + 10} a={a} />
      <Brand id={id} name={n} x={330} y={y0} w={260} h={56} a={a} />
      <text x={616} y={y0 + 40} style={zh(34, H.text, 900)} opacity={0.4 + 0.6 * a}>{code}</text>
    </g>); })}
    <text x={30} y={CT + 306} style={zh(28, H.text2, 800)}>代號：公開資訊；截至 2026/11/28</text>
  </Sv></Card>);
};
// ── cp-next：測機台用的晶圓 → 用過（有圖案）→ 研磨掉一層 → 回到亮面再用（循環）；next 大字下一集；kw 留言關鍵字 ──
const Next: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330, cs = on(f, T(o, "cost")), ts = on(f, T(o, "test")), gr = on(f, T(o, "grind")), nx = on(f, T(o, "next")), kw = on(f, T(o, "kw"));
  const cy = CT + 66, r = 36, xs = [80, 210, 340, 470], gu = cl01((f - T(o, "grind")) / 30);
  const rot = f >= T(o, "grind") ? (f - T(o, "grind")) * 8 : 0;
  return (<Card o={o} k={k} W={W} Hh={Hh}><Sv W={W} Hh={Hh}>
    <Wafer cx={xs[0]} cy={cy} r={r} pat={0} shine />
    <Wafer cx={xs[1]} cy={cy} r={r} pat={ts} />
    <Wafer cx={xs[2]} cy={cy} r={r} pat={1 - gu} shine={gu > 0.9} />
    {gr > 0.01 && gu < 1 ? <g opacity={gr} transform={`rotate(${rot} ${xs[2]} ${cy})`}>{[0, 1, 2].map((i) => <path key={i} d={`M${xs[2] - 26 + i * 6},${cy - 10 - i * 6} A30 30 0 0 1 ${xs[2] + 26 - i * 6},${cy - 10 - i * 6}`} fill="none" stroke={H.amber} strokeWidth={3} />)}</g> : null}
    <Wafer cx={xs[3]} cy={cy} r={r} pat={0} shine />
    {[0, 1, 2].map((i) => <g key={i} opacity={0.35 + 0.65 * [ts, gr, gr][i]}><Arr x1={xs[i] + r + 6} y={cy} x2={xs[i + 1] - r - 6} c={H.text2} /></g>)}
    <Cap x={xs[0]} y={CT + 150} t="測機用" c={H.text} a={cs} />
    <Cap x={xs[1]} y={CT + 150} t="用過" c={H.text} a={ts} />
    <Cap x={xs[2]} y={CT + 150} t="研磨" c={H.text} a={gr} />
    <Cap x={xs[3]} y={CT + 150} t="再用" c={H.text} a={gr} />
    {/* 回頭箭頭（循環） */}
    <g opacity={0.35 + 0.65 * gr}><path d={`M${xs[3]},${CT + 166} L${xs[3]},${CT + 190} L${xs[0]},${CT + 190} L${xs[0]},${CT + 180}`} fill="none" stroke={OK} strokeWidth={4} />
      <path d={`M${xs[0]},${CT + 164} L${xs[0] - 8},${CT + 180} L${xs[0] + 8},${CT + 180} Z`} fill={OK} /></g>
    <Cap x={275} y={CT + 236} t="回到亮面再用" c={OK} a={gr} />
    <Sep x={548} />
    <Row x={568} y={CT + 40} t="測機台也要用晶圓" c={H.text2} a={cs} />
    <text x={568} y={CT + 124} style={zh(40, BLUE, 900)} opacity={0.35 + 0.65 * nx}>下一集：再生晶圓</text>
    <Row x={568} y={CT + 186} t="留言「化合物」" c={H.amber} a={kw} />
    <text x={592} y={CT + 234} style={zh(30, H.text, 900)} opacity={0.35 + 0.65 * kw}>拿完整資料</text>
  </Sv></Card>);
};
export const CompoundSection: React.FC<P> = (p) => {
  const kd = String((p.o as any).kind);
  const M: Record<string, React.FC<P>> = { "cp-hook": Hook, "cp-gap": Gap, "cp-dam": Dam, "cp-ev": Ev, "cp-gan": Gan, "cp-pvt": Pvt, "cp-epi": Epi, "cp-tw": Tw, "cp-next": Next };
  const C2 = M[kd]; return C2 ? <C2 {...p} /> : null;
};

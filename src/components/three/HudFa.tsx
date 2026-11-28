// 2026/11/28 tech-fa：中游補充篇 M6「材料分析與故障分析」的 2D 示意卡（overlay `section` 的 kind 以 "fa-" 開頭，Hud.tsx 轉過來）。
//   fa-hook 前一集晶片會壞→壞在哪、誰來找→第三方實驗室＝看病的醫院｜fa-loc 通電→光和熱→熱像儀找發燒｜fa-fib 找到才動刀→離子束＝噴砂槍挖剖面
//   fa-lam 削成約 100 nm 薄片→電子穿得過去｜fa-tem 電子代替光→薄膜斷、歪一清二楚｜fa-eds X 光能譜＝指紋→混進的元素｜fa-out 機台貴、要專人→送出去做
//   fa-tw 宜特（故障分析＋可靠度）、閎康（材料分析為主、日本據點）｜fa-next 中游講完→切成晶片→下一集晶圓切割；留言關鍵字。
// LOGO：宜特、閎康官網從雲端連不上、Wikimedia Commons 查不到 → 白底深色文字名牌（不仿商標），見 videos/tech-fa/assets.md。國旗用 Brand.tsx FLAGS。
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
// 示意色（材料本身的顏色，不是頻道色票）
const RED = "#E0472F", OK = "#14A38B", BLUE = "#2F7FE0", SIL = "#A9B5C7", DIE = "#4C5E86", SUB = "#3B5A45", CU = "#C8794A", DI = "#9CC8E8", PT = "#B8C0CC",
  HOT = "#FF5A3C", PHOT = "#E8C22A", ION = "#9A62E0", EL = "#3F8FEA", XSI = "#2F7FE0", XCU = "#E8913C", XO = "#14A38B", BLD = "#C9D2DE";
const Sep: React.FC<{ x: number; y2?: number }> = ({ x, y2 = 316 }) => <line x1={x} y1={CT + 4} x2={x} y2={y2} stroke={H.lineSoft} strokeWidth={3} />;
const Row: React.FC<{ x: number; y: number; t: string; c: string; a: number; px?: number }> = ({ x, y, t, c, a, px = 30 }) => (
  <g opacity={0.35 + 0.65 * a}><rect x={x} y={y - px * 0.72} width={12} height={px * 0.72} fill={c} /><text x={x + 24} y={y} style={zh(px, H.text, 900)}>{t}</text></g>
);
const Cap: React.FC<{ x: number; y: number; t: string; px?: number }> = ({ x, y, t, px = 26 }) => <text x={x} y={y} textAnchor="middle" style={zh(px, H.text2, 800)}>{t}</text>;
const Sv: React.FC<{ W: number; Hh: number; children: React.ReactNode }> = ({ W, Hh, children }) => <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>{children}</svg>;
const Arr: React.FC<{ x1: number; y: number; x2: number; c: string; w?: number }> = ({ x1, y, x2, c, w = 4 }) => { const d = Math.sign(x2 - x1) || 1; return (
  <g><line x1={x1} y1={y} x2={x2 - d * 8} y2={y} stroke={c} strokeWidth={w} /><path d={`M${x2},${y} L${x2 - d * 14},${y - 8} L${x2 - d * 14},${y + 8} Z`} fill={c} /></g>); };
const FlagBox: React.FC<{ code: string; x: number; y: number; a: number }> = ({ code, x, y, a }) => (
  <g><rect x={x} y={y} width={50} height={36} fill="none" stroke={a > 0.5 ? H.amber : H.lineSoft} strokeWidth={a > 0.5 ? 4 : 1.5} /><Flag code={code} h={28} x={x + 4} y={y + 4} asSvg /></g>
);
const Brand: React.FC<{ id: string; name: string; x: number; y: number; w: number; h: number; a: number }> = ({ id, name, x, y, w, h, a }) => {
  const s = LOGOS[id]; const lh = h - 14, lw = s ? Math.min(w - 16, (lh * s.w) / s.h) : 0, lh2 = s ? (lw * s.h) / s.w : 0;
  return (<g><rect x={x} y={y} width={w} height={h} fill="#FFFFFF" stroke={a > 0.5 ? H.amber : H.lineSoft} strokeWidth={a > 0.5 ? 4 : 1.5} />
    {s ? <LogoSvg id={id} x={x + (w - lw) / 2} y={y + (h - lh2) / 2} h={lh2} /> : <text x={x + w / 2} y={y + h / 2 + 11} textAnchor="middle" style={zh(30, "#1F3A5F", 900)}>{name}</text>}</g>);
};
// 晶片（正面）：載板＋晶粒＋四邊接腳
const Chip: React.FC<{ cx: number; cy: number; s: number }> = ({ cx, cy, s }) => (
  <g>{[-1, 1].flatMap((sg) => [0, 1, 2, 3, 4].map((i) => <rect key={`${sg}h${i}`} x={cx - s * 0.4 + i * s * 0.2 - 3} y={sg < 0 ? cy - s / 2 - 10 : cy + s / 2} width={6} height={10} fill={SIL} />))}
    {[-1, 1].flatMap((sg) => [0, 1, 2, 3, 4].map((i) => <rect key={`${sg}v${i}`} y={cy - s * 0.4 + i * s * 0.2 - 3} x={sg < 0 ? cx - s / 2 - 10 : cx + s / 2} height={6} width={10} fill={SIL} />))}
    <rect x={cx - s / 2} y={cy - s / 2} width={s} height={s} fill={SUB} stroke={H.text2} strokeWidth={2} />
    <rect x={cx - s * 0.32} y={cy - s * 0.32} width={s * 0.64} height={s * 0.64} fill={DIE} />
    {[0, 1, 2].map((i) => <line key={i} x1={cx - s * 0.28} y1={cy - s * 0.16 + i * s * 0.16} x2={cx + s * 0.28} y2={cy - s * 0.16 + i * s * 0.16} stroke="#7F93BC" strokeWidth={2} />)}</g>
);
// 剖面（側視）：矽、電晶體、介電＋銅線
const Xsec: React.FC<{ x: number; y: number; w: number; h: number; cut?: number }> = ({ x, y, w, h, cut = 0 }) => {
  const hs = h * 0.35, ht = h * 0.15, hm = h * 0.5;
  return (<g><rect x={x} y={y + hm + ht} width={w} height={hs} fill={SIL} stroke={H.text2} strokeWidth={1.5} />
    <rect x={x} y={y + hm} width={w} height={ht} fill={DI} />
    {Array.from({ length: Math.floor(w / 18) }, (_, i) => <rect key={`g${i}`} x={x + 6 + i * 18} y={y + hm + 2} width={7} height={ht - 4} fill={PT} />)}
    <rect x={x} y={y} width={w} height={hm} fill={DI} stroke={H.text2} strokeWidth={1.5} />
    {[0, 1, 2].map((k) => Array.from({ length: Math.floor(w / [20, 30, 46][k]) }, (_, i) => <rect key={`m${k}-${i}`} x={x + 6 + i * [20, 30, 46][k]} y={y + hm - 14 - k * h * 0.15} width={[8, 12, 20][k]} height={7 + k * 2} fill={CU} />))}
    {cut > 0 ? <path d={`M${x + w / 2 - cut * 46},${y - 1} L${x + w / 2 - cut * 30},${y + h * 0.82 * cut} L${x + w / 2 + cut * 30},${y + h * 0.82 * cut} L${x + w / 2 + cut * 46},${y - 1} Z`} fill={H.cardCompare} stroke={H.text2} strokeWidth={1.5} /> : null}</g>);
};

// ── fa-hook：前一集晶片會壞 → 壞在哪、誰來找 → 第三方實驗室＝看病的醫院 ──
const Hook: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330, pv = on(f, T(o, "prev")), fl = on(f, T(o, "fail")), q = on(f, T(o, "q")), lb = on(f, T(o, "lab")), hp = on(f, T(o, "hosp"));
  const blink = fl * (0.6 + 0.4 * Math.sin(f * 0.25));
  return (<Card o={o} k={k} W={W} Hh={Hh}><Sv W={W} Hh={Hh}>
    <g opacity={0.5 + 0.5 * pv}><Chip cx={92} cy={CT + 104} s={92} /></g>
    <g opacity={blink}><line x1={58} y1={CT + 70} x2={126} y2={CT + 138} stroke={RED} strokeWidth={7} /><line x1={126} y1={CT + 70} x2={58} y2={CT + 138} stroke={RED} strokeWidth={7} /></g>
    <g opacity={q * (1 - lb)}><circle cx={92} cy={CT + 104} r={30} fill="#FFFFFF" stroke={RED} strokeWidth={3} /><text x={92} y={CT + 117} textAnchor="middle" style={zh(34, RED, 900)}>？</text></g>
    <g opacity={0.35 + 0.65 * Math.max(lb, hp)}>
      <rect x={186} y={CT + 70} width={120} height={98} fill={BLD} stroke={H.text2} strokeWidth={2} /><rect x={180} y={CT + 62} width={132} height={12} fill={H.text2} />
      {[0, 1, 2].map((i) => <rect key={i} x={198 + i * 36} y={CT + 88} width={24} height={18} fill={BLUE} />)}<rect x={232} y={CT + 128} width={28} height={40} fill={H.text2} />
      <g opacity={hp}><rect x={238} y={CT + 22} width={16} height={44} fill={OK} /><rect x={224} y={CT + 36} width={44} height={16} fill={OK} /></g></g>
    <g opacity={lb}><Arr x1={146} y={CT + 150} x2={180} c={OK} /></g>
    <Cap x={92} y={CT + 214} t="故障晶片" /><Cap x={246} y={CT + 214} t="實驗室" />
    <Sep x={334} />
    <Row x={360} y={CT + 52} t="前一集：晶片還是會壞" c={H.text2} a={Math.max(pv, fl)} />
    <Row x={360} y={CT + 114} t="壞在哪？誰來找？" c={RED} a={q} />
    <Row x={360} y={CT + 176} t="交給第三方實驗室" c={BLUE} a={lb} />
    <Row x={360} y={CT + 238} t="像幫晶片看病的醫院" c={H.amber} a={hp} />
  </Sv></Card>);
};
// ── fa-loc：通電 → 壞的地方發出微弱的光和熱 → 像熱像儀找發燒的人 ──
const Loc: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330, pw = on(f, T(o, "pow")), bd = on(f, T(o, "bad")), lt = on(f, T(o, "light")), cm = on(f, T(o, "cam")), fv = on(f, T(o, "fever"));
  const hx = 132, hy = CT + 96;
  return (<Card o={o} k={k} W={W} Hh={Hh}><Sv W={W} Hh={Hh}>
    <rect x={44} y={CT + 14} width={180} height={170} fill={DIE} stroke={H.text2} strokeWidth={2} />
    {Array.from({ length: 7 }, (_, i) => <line key={`h${i}`} x1={52} y1={CT + 34 + i * 22} x2={216} y2={CT + 34 + i * 22} stroke="#7F93BC" strokeWidth={2} />)}
    {Array.from({ length: 5 }, (_, i) => <line key={`v${i}`} x1={70 + i * 34} y1={CT + 20} x2={70 + i * 34} y2={CT + 178} stroke="#6A7FA8" strokeWidth={1.5} />)}
    <g opacity={pw}><line x1={20} y1={CT + 40} x2={52} y2={CT + 60} stroke={H.text2} strokeWidth={3} /><line x1={248} y1={CT + 40} x2={216} y2={CT + 60} stroke={H.text2} strokeWidth={3} /></g>
    {[0, 1, 2].map((i) => { const u = ((f * 0.02 + i / 3) % 1); return <circle key={i} cx={hx} cy={hy} r={10 + 50 * u} fill="none" stroke={HOT} strokeWidth={3} opacity={lt * (1 - u)} />; })}
    <circle cx={hx} cy={hy} r={9} fill={HOT} opacity={bd} />
    {[0, 1, 2, 3].map((i) => { const u = ((f * 0.05 + i / 4) % 1); return <circle key={`p${i}`} cx={hx + (i - 1.5) * 4} cy={hy - 12 - 70 * u} r={3.5} fill={PHOT} opacity={lt * (1 - u)} />; })}
    <g opacity={0.35 + 0.65 * Math.max(cm, fv)}><rect x={248} y={CT + 70} width={62} height={44} rx={6} fill={H.text2} /><circle cx={262} cy={CT + 92} r={12} fill={HOT} opacity={0.4 + 0.6 * fv} /><rect x={284} y={CT + 80} width={18} height={10} fill={SIL} /></g>
    <Cap x={134} y={CT + 220} t="晶片正面（示意）" />
    <Sep x={334} />
    <Row x={360} y={CT + 52} t="先通電" c={BLUE} a={pw} />
    <Row x={360} y={CT + 114} t="壞的地方：發出微弱的光" c={HOT} a={Math.max(bd, lt)} />
    <Row x={360} y={CT + 176} t="也會發熱" c={H.amber} a={lt} />
    <Row x={360} y={CT + 238} t="像熱像儀找發燒的人" c={OK} a={Math.max(cm, fv)} />
  </Sv></Card>);
};
// ── fa-fib：找到才動刀 → 聚焦離子束＝極細的噴砂槍 → 一點點挖出剖面 ──
const Fib: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330, lc = on(f, T(o, "loc")), ct = on(f, T(o, "cut")), fb = on(f, T(o, "fib")), sd = on(f, T(o, "sand")), dg = on(f, T(o, "dig"), 40);
  const x0 = 30, y0 = CT + 96, w = 280, ix = x0 + w / 2;
  return (<Card o={o} k={k} W={W} Hh={Hh}><Sv W={W} Hh={Hh}>
    <Xsec x={x0} y={y0} w={w} h={120} cut={0.2 + 0.8 * Math.max(dg, sd * 0.5)} />
    <g opacity={lc * (1 - ct)}><circle cx={ix} cy={y0 - 6} r={10} fill="none" stroke={HOT} strokeWidth={4} /></g>
    {[0, 1, 2, 3, 4].map((i) => { const u = ((f * 0.06 + i / 5) % 1); return <circle key={i} cx={ix - 70 + 70 * u * u} cy={y0 - 80 + 80 * u * u} r={4} fill={ION} opacity={fb} />; })}
    {[0, 1, 2, 3].map((i) => { const u = ((f * 0.045 + i / 4) % 1), sx = i % 2 ? 1 : -1; return <rect key={`s${i}`} x={ix + sx * (10 + 60 * u)} y={y0 - 4 - 50 * u + 60 * u * u} width={5} height={5} fill={H.text2} opacity={sd * (1 - u)} />; })}
    <Cap x={x0 + w / 2} y={CT + 246} t="側面剖開（示意）" />
    <Sep x={334} />
    <Row x={360} y={CT + 52} t="找到位置，才動刀" c={HOT} a={Math.max(lc, ct)} />
    <Row x={360} y={CT + 114} t="聚焦離子束：鎵離子" c={ION} a={fb} />
    <Row x={360} y={CT + 176} t="像極細的噴砂槍" c={H.amber} a={sd} />
    <Row x={360} y={CT + 238} t="一點點挖出剖面" c={OK} a={dg} />
  </Sv></Card>);
};
// ── fa-lam：兩側再削 → 約 100 nm 薄片 → 電子穿得過去 ──
const Lam: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330, tr = on(f, T(o, "trim"), 30), nm = on(f, T(o, "nm")), sl = on(f, T(o, "slice")), ps = on(f, T(o, "pass"));
  const cx = 170, th = 90 - 74 * tr, y0 = CT + 30, h = 170;
  return (<Card o={o} k={k} W={W} Hh={Hh}><Sv W={W} Hh={Hh}>
    <rect x={cx - th / 2} y={y0} width={th} height={h} fill={DI} stroke={H.text2} strokeWidth={2} />
    <rect x={cx - th / 2} y={y0 + h * 0.62} width={th} height={h * 0.38} fill={SIL} />
    {[0, 1, 2].map((i) => <rect key={i} x={cx - th / 2} y={y0 + 24 + i * 30} width={th} height={8} fill={CU} />)}
    <rect x={cx - th / 2 - 2} y={y0 - 10} width={th + 4} height={10} fill={PT} />
    <g opacity={nm}><line x1={cx - 8 - 40} y1={y0 + h + 14} x2={cx - 8} y2={y0 + h + 14} stroke={H.text2} strokeWidth={2} /><line x1={cx + 8 + 40} y1={y0 + h + 14} x2={cx + 8} y2={y0 + h + 14} stroke={H.text2} strokeWidth={2} />
      <path d={`M${cx - 8},${y0 + h + 14} l-10,-6 l0,12 Z M${cx + 8},${y0 + h + 14} l10,-6 l0,12 Z`} fill={H.text2} /></g>
    {[0, 1, 2, 3, 4].map((i) => { const u = ((f * 0.04 + i / 5) % 1), x = 40 + 260 * u, yy = y0 + 40 + i * 24, block = th > 40 && x > cx - th / 2;
      return <circle key={i} cx={block ? Math.min(x, cx - th / 2 - 4) : x} cy={yy} r={4} fill={EL} opacity={ps * (block ? 0.4 : 1)} />; })}
    <Cap x={cx} y={CT + 256} t="約 100 nm（放大示意）" />
    <Sep x={334} />
    <Row x={360} y={CT + 52} t="兩側再削" c={ION} a={tr} />
    <Row x={360} y={CT + 114} t="約一百奈米" c={H.amber} a={nm} />
    <Row x={360} y={CT + 176} t="變成一片薄片" c={BLUE} a={sl} />
    <Row x={360} y={CT + 238} t="薄到電子穿得過去" c={OK} a={ps} />
  </Sv></Card>);
};
// ── fa-tem：電子代替光 → 看到一層層薄膜 → 哪裡斷、哪裡歪 ──
const Tem: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330, tm = on(f, T(o, "tem")), el = on(f, T(o, "elec")), bk = on(f, T(o, "brk")), bn = on(f, T(o, "bend")), clr = on(f, T(o, "clear"));
  const x0 = 34, y0 = CT + 22, w = 270, h = 190, nl = 9;
  return (<Card o={o} k={k} W={W} Hh={Hh}><Sv W={W} Hh={Hh}>
    <rect x={x0} y={y0} width={w} height={h} fill="#20252E" />
    <g opacity={0.3 + 0.7 * Math.max(tm, el)}>{Array.from({ length: nl }, (_, i) => { const yy = y0 + 18 + i * 19, gap = i === 4;
      const bend = i === 6 ? bn : 0;
      return gap ? <g key={i}><line x1={x0 + 10} y1={yy} x2={x0 + 118} y2={yy} stroke="#D8DEE8" strokeWidth={6} /><line x1={x0 + 118 + 34 * bk} y1={yy} x2={x0 + w - 10} y2={yy} stroke="#D8DEE8" strokeWidth={6} /></g>
        : <path key={i} d={`M${x0 + 10},${yy} Q${x0 + w / 2},${yy + bend * 16} ${x0 + w - 10},${yy}`} fill="none" stroke={i % 2 ? "#9AA6B8" : "#D8DEE8"} strokeWidth={6} />; })}</g>
    <g opacity={bk}><circle cx={x0 + 135} cy={y0 + 94} r={22} fill="none" stroke={RED} strokeWidth={4} /></g>
    <g opacity={bn}><ellipse cx={x0 + w / 2} cy={y0 + 140} rx={60} ry={14} fill="none" stroke={H.amber} strokeWidth={4} /></g>
    <rect x={x0 + w - 74} y={y0 + h - 16} width={50} height={6} fill="#FFFFFF" />
    <Cap x={x0 + w / 2} y={CT + 246} t="電子影像（示意）" />
    <Sep x={334} />
    <Row x={360} y={CT + 52} t="用電子代替光" c={EL} a={el} />
    <Row x={360} y={CT + 114} t="看得到一層層薄膜" c={BLUE} a={tm} />
    <Row x={360} y={CT + 176} t="哪裡斷了" c={RED} a={bk} />
    <Row x={360} y={CT + 238} t="哪裡歪了：一清二楚" c={H.amber} a={Math.max(bn, clr)} />
  </Sv></Card>);
};
// ── fa-eds：每種元素的 X 光能量不同（能譜峰）＝指紋 → 混進的元素（紅） ──
const Eds: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330, cp = on(f, T(o, "comp")), em = on(f, T(o, "elem"), 24), df = on(f, T(o, "diff")), fg = on(f, T(o, "finger")), mx = on(f, T(o, "mix"), 18);
  const x0 = 40, yb = CT + 192, w = 270;
  const peaks: [number, number, string, string, number][] = [[0.14, 0.55, "O", XO, em], [0.36, 0.95, "Si", XSI, em], [0.6, 0.5, "Cl", RED, mx], [0.84, 0.7, "Cu", XCU, cl01(em * 1.4 - 0.2)]];
  const path = (p: number, hh: number, g: number) => { let d = `M${x0},${yb}`; for (let i = 0; i <= 60; i++) { const u = i / 60, y = yb - 150 * hh * g * Math.exp(-((u - p) ** 2) / 0.0012); d += ` L${x0 + u * w},${y}`; } return d; };
  return (<Card o={o} k={k} W={W} Hh={Hh}><Sv W={W} Hh={Hh}>
    <line x1={x0} y1={yb} x2={x0 + w} y2={yb} stroke={H.text2} strokeWidth={2} /><line x1={x0} y1={yb} x2={x0} y2={CT + 26} stroke={H.text2} strokeWidth={2} />
    <g opacity={0.4 + 0.6 * cp}>{peaks.map(([p, hh, n, c, g]) => <g key={n}><path d={path(p, hh, g)} fill="none" stroke={c} strokeWidth={4} />
      <text x={x0 + p * w} y={yb - 150 * hh * g - 10} textAnchor="middle" style={zh(24, c, 900)} opacity={g}>{n}</text></g>)}</g>
    <g opacity={fg}>{[0, 1, 2, 3].map((i) => <path key={i} d={`M${540 - i * 7},${CT + 176} a${10 + i * 7},${12 + i * 7} 0 1 1 ${2 * (10 + i * 7)},0`} fill="none" stroke={H.text2} strokeWidth={2.5} />)}</g>
    <Cap x={x0 + w / 2} y={CT + 226} t="X 光能量 →（示意）" px={24} />
    <Sep x={334} />
    <Row x={360} y={CT + 52} t="電子打到元素" c={EL} a={Math.max(cp, em)} />
    <Row x={360} y={CT + 114} t="放出的 X 光各不同" c={BLUE} a={df} />
    <Row x={360} y={CT + 176} t="像指紋" c={H.amber} a={fg} />
    <Row x={360} y={CT + 238} t="一比就知道混進什麼" c={RED} a={mx} />
  </Sv></Card>);
};
// ── fa-out：機台貴、要專人 → 晶圓廠和設計公司送出去做 ──
const Out: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330, cs = on(f, T(o, "cost")), st = on(f, T(o, "staff")), fb = on(f, T(o, "fab")), ds = on(f, T(o, "des")), sn = on(f, T(o, "send"), 30);
  const b = (x: number, y: number, w: number, h: number, c: string, a: number, key: string) => <g key={key} opacity={0.35 + 0.65 * a}><rect x={x} y={y} width={w} height={h} fill={c} stroke={H.text2} strokeWidth={2} />
    {Array.from({ length: Math.floor(h / 24) }, (_, i) => <rect key={i} x={x + 6} y={y + 8 + i * 24} width={w - 12} height={8} fill={BLUE} opacity={0.7} />)}</g>;
  const bx = 92 + 150 * sn;
  return (<Card o={o} k={k} W={W} Hh={Hh}><Sv W={W} Hh={Hh}>
    {b(26, CT + 104, 70, 80, BLD, fb, "fab")}{b(110, CT + 64, 44, 120, "#D8E4F2", ds, "des")}{b(226, CT + 84, 90, 100, BLD, Math.max(cs, st), "lab")}
    <g opacity={cs}><circle cx={300} cy={CT + 60} r={20} fill={H.amber} /><text x={300} y={CT + 69} textAnchor="middle" style={zh(26, "#FFFFFF", 900)}>貴</text></g>
    <g opacity={st}><circle cx={246} cy={CT + 60} r={20} fill={OK} /><text x={246} y={CT + 69} textAnchor="middle" style={zh(26, "#FFFFFF", 900)}>專</text></g>
    <line x1={20} y1={CT + 196} x2={320} y2={CT + 196} stroke={H.text2} strokeWidth={3} />
    <g opacity={sn > 0.02 && sn < 0.98 ? 1 : 0.6 * sn}><rect x={bx - 14} y={CT + 172} width={28} height={20} fill={SIL} stroke={H.text2} strokeWidth={2} /></g>
    <Cap x={62} y={CT + 236} t="晶圓廠" px={24} /><Cap x={132} y={CT + 236} t="設計" px={24} /><Cap x={270} y={CT + 236} t="實驗室" px={24} />
    <Sep x={334} />
    <Row x={360} y={CT + 52} t="機台貴" c={H.amber} a={cs} />
    <Row x={360} y={CT + 114} t="要專人操作" c={OK} a={st} />
    <Row x={360} y={CT + 176} t="晶圓廠和設計公司" c={BLUE} a={Math.max(fb, ds)} />
    <Row x={360} y={CT + 238} t="常送出去做" c={RED} a={sn} />
  </Sv></Card>);
};
// ── fa-tw：宜特（故障分析＋可靠度驗證）、閎康（材料分析為主、日本也有據點）──
const Tw: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 392, a1 = on(f, T(o, "ist")), fa = on(f, T(o, "fa")), rl = on(f, T(o, "rel")), a2 = on(f, T(o, "ma")), jp = on(f, T(o, "jp"));
  const r1 = CT + 30, r2 = CT + 170;
  return (<Card o={o} k={k} W={W} Hh={Hh}><Sv W={W} Hh={Hh}>
    <g opacity={0.5 + 0.5 * Math.max(a1, a2)}><Chip cx={110} cy={CT + 120} s={84} />
      <circle cx={190} cy={CT + 190} r={44} fill="none" stroke={H.text2} strokeWidth={6} /><line x1={222} y1={CT + 222} x2={262} y2={CT + 262} stroke={H.text2} strokeWidth={10} strokeLinecap="round" /></g>
    <Sep x={334} y2={376} />
    <FlagBox code="TW" x={360} y={r1 + 12} a={a1} /><Brand id="ist" name="宜特" x={428} y={r1} w={170} h={60} a={a1} />
    <text x={614} y={r1 + 30} style={zh(24, H.text2, 800)} opacity={0.4 + 0.6 * a1}>3289</text>
    <text x={428} y={r1 + 104} style={zh(28, H.text, 900)} opacity={0.35 + 0.65 * Math.max(fa, rl)}>故障分析＋可靠度驗證</text>
    <FlagBox code="TW" x={360} y={r2 + 12} a={a2} /><Brand id="matek" name="閎康" x={428} y={r2} w={170} h={60} a={a2} />
    <text x={614} y={r2 + 30} style={zh(24, H.text2, 800)} opacity={0.4 + 0.6 * a2}>3587</text>
    <text x={428} y={r2 + 104} style={zh(28, H.text, 900)} opacity={0.35 + 0.65 * a2}>材料分析為主</text>
    <FlagBox code="JP" x={700} y={r2 + 78} a={jp} /><text x={762} y={r2 + 104} style={zh(26, H.text, 900)} opacity={0.35 + 0.65 * jp}>日本也有據點</text>
  </Sv></Card>);
};
// ── fa-next：中游講完 → 晶圓做好、驗過 → 切成一顆顆晶片 → 下一集晶圓切割；留言關鍵字 ──
const Next: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330, md = on(f, T(o, "mid")), dn = on(f, T(o, "done")), ct = on(f, T(o, "cut"), 40), ch = on(f, T(o, "chips")), kw = on(f, T(o, "kw"));
  const cx = 150, cy = CT + 116, r = 96, g = 24;
  const lines: React.ReactNode[] = [];
  for (let i = -3; i <= 3; i++) { const x = cx + i * g + g / 2; const hh = Math.sqrt(Math.max(0, r * r - (x - cx) ** 2));
    lines.push(<line key={`v${i}`} x1={x} y1={cy - hh} x2={x} y2={cy - hh + 2 * hh * cl01(ct * 7 - (i + 3))} stroke={OK} strokeWidth={3} />);
    lines.push(<line key={`h${i}`} y1={x - cx + cy} x1={cx - hh} y2={x - cx + cy} x2={cx - hh + 2 * hh * cl01(ch * 7 - (i + 3))} stroke={OK} strokeWidth={3} />); }
  return (<Card o={o} k={k} W={W} Hh={Hh}><Sv W={W} Hh={Hh}>
    <circle cx={cx} cy={cy} r={r + 18} fill="none" stroke={SIL} strokeWidth={8} opacity={0.5 + 0.5 * md} />
    <circle cx={cx} cy={cy} r={r} fill="#C9D3E2" stroke={H.text2} strokeWidth={2} opacity={0.5 + 0.5 * Math.max(md, dn)} />
    {lines}
    <g opacity={dn}><circle cx={cx + 82} cy={cy - 82} r={18} fill={OK} /><path d={`M${cx + 73},${cy - 82} l6,7 l12,-14`} fill="none" stroke="#FFFFFF" strokeWidth={4} /></g>
    <Sep x={334} />
    <Row x={360} y={CT + 52} t="中游到這裡講完了" c={H.text2} a={md} />
    <Row x={360} y={CT + 114} t="晶圓做好、驗過" c={OK} a={dn} />
    <Row x={360} y={CT + 176} t="接著切成一顆顆晶片" c={BLUE} a={Math.max(ct, ch)} />
    <Row x={360} y={CT + 238} t="留言「故障分析」" c={H.amber} a={kw} />
  </Sv></Card>);
};
export const FaSection: React.FC<P> = (p) => {
  const kd = String((p.o as any).kind);
  const M: Record<string, React.FC<P>> = { "fa-hook": Hook, "fa-loc": Loc, "fa-fib": Fib, "fa-lam": Lam, "fa-tem": Tem, "fa-eds": Eds, "fa-out": Out, "fa-tw": Tw, "fa-next": Next };
  const C2 = M[kd]; return C2 ? <C2 {...p} /> : null;
};

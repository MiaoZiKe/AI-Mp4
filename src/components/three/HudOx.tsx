// 2026/11/21 tech-oxidation：氧化與熱處理的 2D 示意卡（overlay `section` 的 kind 以 "ox-" 開頭，Hud.tsx 的 HudSection 轉過來）。
//   ox-hook 接上一支＋破千度不到一毫秒｜ox-grow 熱氧化｜ox-dw 乾式 vs 濕式｜ox-batch 一管百片、表面乾淨才均勻｜ox-dmg 佈植後還不導電｜
//   ox-act 退火修晶格、活化｜ox-diff 加熱太久會擴散｜ox-spike 尖峰退火溫度曲線｜ox-laser 雷射只燒表面｜ox-co 誰在做｜ox-next 接下來
// 全部示意；結構一開始就畫出（不留空框），念到時該處亮起、動起來；時間全部來自 script.json 的 t（cue）。
// 排版原則（card-overlap.mjs 檢查）：標題下緣約 y60，內容從 y≥66；字不放進會動的圖形範圍；每欄之間留 ≥24px；分隔線不穿過字；字 ≥30px。
import React from "react";
import { FONT_ZH } from "../../theme";
import { H, L, sm, CARD_HEAD, cardTitleBox } from "./hudSkin";
import { EASE, tween } from "../anim";
import type { Model3D, Overlay3D } from "./engine";

const zh = (px: number, color: string = H.text, w = 800): React.CSSProperties => ({ fontFamily: FONT_ZH, fontSize: px, fill: color, color, fontWeight: w, whiteSpace: "nowrap" });
const onC = (bg: string) => (bg === H.amber ? ((H as any).onAmber ?? H.onAccent) : H.onAccent);
type P = { o: Overlay3D; f: number; k: number; m: Model3D };
const T = (o: Overlay3D, n: string) => ((o as any).t?.[n]?.at ?? o.at) as number;
const Card: React.FC<{ o: Overlay3D; k: number; W: number; Hh: number; children: React.ReactNode }> = ({ o, k, W, Hh, children }) => (
  <div style={{ position: "absolute", left: o.x ?? L.X, top: o.y ?? 900, width: W, height: Hh, opacity: k, background: H.cardCompare, border: `2px solid ${H.lineSoft}`, boxSizing: "border-box", overflow: "hidden" }}>
    {o.title ? <div style={{ ...zh(CARD_HEAD.px, onC(H.line), 800), ...cardTitleBox(), background: H.line, zIndex: 2 }}>{o.title}</div> : null}
    {o.tag ? <div style={{ position: "absolute", right: 16, top: 14, ...zh(sm(28), H.text2, 600), zIndex: 2 }}>{o.tag}</div> : null}
    {children}
  </div>
);
const ph = (f: number, sp: number, j: number, n: number, seed = 0) => (((f * sp + j / n + seed * 0.17) % 1) + 1) % 1;
const lit = (f: number, at: number, lo = 0.45) => lo + (1 - lo) * tween(f, at, 10, EASE.enter);
const on = (f: number, at: number, d = 10) => tween(f, at, d, EASE.enter);
const cl = (x: number) => Math.min(1, Math.max(0, x));
const SI = "#AFC0DA", SI_D = "#7F93B5", OX = "#8FA8E8", O2 = "#2F7FE0", H2O = "#3DB5E6", HEAT = "#FF7A2F", HOT = "#FFB23F", RED = "#E0472F", OK = "#14A38B",
  ION = "#E0572F", RES = "#D9822B", DIRT = "#5B4A3A", ATOM = "#7F93B5", GATE = "#4A5873", LASER = "#E8433A";
const Sep: React.FC<{ x: number }> = ({ x }) => <line x1={x} y1={70} x2={x} y2={316} stroke={H.lineSoft} strokeWidth={3} />;
const Arrow: React.FC<{ x1: number; y1: number; x2: number; y2: number; c: string; w?: number; o?: number }> = ({ x1, y1, x2, y2, c, w = 5, o = 1 }) => {
  const a = Math.atan2(y2 - y1, x2 - x1), s = w * 2.6;
  return <g opacity={o}><path d={`M${x1} ${y1} L${x2 - Math.cos(a) * s * 0.8} ${y2 - Math.sin(a) * s * 0.8}`} stroke={c} strokeWidth={w} />
    <path d={`M${x2} ${y2} L${x2 - Math.cos(a) * s - Math.sin(a) * s * 0.6} ${y2 - Math.sin(a) * s + Math.cos(a) * s * 0.6} L${x2 - Math.cos(a) * s + Math.sin(a) * s * 0.6} ${y2 - Math.sin(a) * s - Math.cos(a) * s * 0.6} Z`} fill={c} /></g>;
};
const Cross: React.FC<{ x: number; y: number; s?: number; o?: number }> = ({ x, y, s = 22, o = 1 }) => <path opacity={o} d={`M${x - s} ${y - s} L${x + s} ${y + s} M${x + s} ${y - s} L${x - s} ${y + s}`} stroke={RED} strokeWidth={7} />;
const Check: React.FC<{ x: number; y: number; o?: number }> = ({ x, y, o = 1 }) => <path opacity={o} d={`M${x - 20} ${y} l14 14 l28 -30`} stroke={OK} strokeWidth={8} fill="none" />;
/** 文字列（右欄條列）：念到才亮，前面加色點 */
const Row: React.FC<{ x: number; y: number; t: string; c: string; a: number; px?: number }> = ({ x, y, t, c, a, px = 32 }) => (
  <g opacity={0.35 + 0.65 * a}><rect x={x} y={y - px * 0.72} width={12} height={px * 0.72} fill={c} /><text x={x + 24} y={y} style={zh(px, H.text, 900)}>{t}</text></g>
);
const Stamp: React.FC<{ x: number; y: number; w: number; t: string; a: number; px?: number }> = ({ x, y, w, t, a, px = 34 }) => (
  <g opacity={a} transform={`translate(${x + w / 2} ${y + 26}) scale(${1 + 0.25 * (1 - a)}) translate(${-(x + w / 2)} ${-(y + 26)})`}>
    <rect x={x} y={y} width={w} height={52} fill={H.amber} /><text x={x + w / 2} y={y + 38} textAnchor="middle" style={zh(px, onC(H.amber), 900)}>{t}</text></g>
);

// ── ox-hook：上一支洗乾淨 → 接著加熱｜超過 1000°C｜不到 1 毫秒｜為什麼？ ──
const Hook: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330;
  const pv = on(f, T(o, "prev")), ht = on(f, T(o, "heat")), kk = on(f, T(o, "k1000")), ms = on(f, T(o, "ms")), wh = on(f, T(o, "why"));
  const deg = f < T(o, "k1000") ? 1000 : Math.round(600 + 400 * EASE.move(cl((f - T(o, "k1000")) / 20)));
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        <g opacity={0.35 + 0.65 * pv}>
          <text x={36} y={116} style={zh(32, H.text, 900)}>洗乾淨了</text>
          <Check x={210} y={104} o={pv} />
        </g>
        <g opacity={0.35 + 0.65 * ht}>
          <text x={36} y={178} style={zh(32, HEAT, 900)}>接著：加熱</text>
          <rect x={36} y={268} width={230} height={34} fill={SI} />
          {[0, 1, 2, 3].map((j) => <path key={j} d={`M${66 + j * 54} 256 q12 -12 0 -24 q-12 -12 0 -24`} stroke={HEAT} strokeWidth={5} fill="none" opacity={ht * (0.5 + 0.5 * Math.sin(f * 0.35 + j))} />)}
        </g>
        <Sep x={298} />
        <g opacity={lit(f, T(o, "k1000"), 0.3)}>
          <text x={470} y={186} textAnchor="middle" style={zh(78, HEAT, 900)}>{`${deg}°C`}</text>
          <text x={470} y={246} textAnchor="middle" style={zh(32, H.text, 900)} opacity={0.4 + 0.6 * kk}>超過一千度</text>
        </g>
        <Sep x={642} />
        <g opacity={lit(f, T(o, "ms"), 0.3)}>
          <text x={796} y={164} textAnchor="middle" style={zh(64, O2, 900)}>{"<1毫秒"}</text>
          <text x={796} y={216} textAnchor="middle" style={zh(30, H.text, 800)} opacity={0.4 + 0.6 * ms}>不到千分之一秒</text>
        </g>
        <Stamp x={706} y={250} w={180} t="為什麼？" a={wh} />
      </svg>
    </Card>
  );
};

// ── ox-grow：氧氣打到矽表面 → 長成二氧化矽（越長越厚）｜爐管、通氧氣、800–1200°C、矽→二氧化矽 ──
const Grow: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330;
  const tb = on(f, T(o, "tube")), o2 = on(f, T(o, "o2")), tp = on(f, T(o, "temp")), gr = cl((f - T(o, "grow")) / 60);
  const th = 6 + 52 * EASE.move(gr), top = 220 - th * 0.55;
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        <rect x={40} y={top + th} width={520} height={310 - top - th} fill={SI} />
        <rect x={40} y={top} width={520} height={th} fill={OX} />
        <rect x={40} y={312} width={520} height={4} fill={SI_D} />
        <rect x={40} y={74} width={520} height={14} fill={HEAT} opacity={0.2 + 0.7 * tp * (0.75 + 0.25 * Math.sin(f * 0.3))} />
        {Array.from({ length: 7 }, (_, j) => { const u = ph(f, 0.03, j, 7); const x = 70 + j * 74, y = 98 + u * Math.max(10, top - 118);
          return <g key={j} opacity={o2 * Math.min(1, (1 - u) * 4, u * 6)}><circle cx={x} cy={y} r={9} fill={O2} /><circle cx={x + 14} cy={y} r={9} fill={O2} /></g>; })}
        <Sep x={588} />
        <Row x={612} y={112} t="晶圓排進爐管" c={SI_D} a={tb} />
        <Row x={612} y={172} t="通進氧氣" c={O2} a={o2} />
        <Row x={612} y={232} t="800–1200°C" c={HEAT} a={tp} />
        <Row x={612} y={292} t="矽→二氧化矽" c={OX} a={on(f, T(o, "grow"))} />
      </svg>
    </Card>
  );
};

// ── ox-dw：乾式（只通氧氣，慢、緻密）｜濕式（加水氣，快很多） ──
const Dw: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330;
  const dr = on(f, T(o, "dry")), de = on(f, T(o, "dense")), we = on(f, T(o, "wet")), fa = on(f, T(o, "fast"));
  const tD = 8 + 22 * EASE.move(cl((f - T(o, "dry")) / 120)), tW = 8 + 70 * EASE.move(cl((f - T(o, "wet")) / 50));
  const side = (x0: number, t: number, mol: string, n: number, sp: number, a: number, dense: boolean) => (
    <g>
      <rect x={x0} y={262} width={380} height={48} fill={SI} />
      <rect x={x0} y={262 - t} width={380} height={t} fill={OX} />
      {dense ? Array.from({ length: 18 }, (_, j) => <line key={j} x1={x0 + 10 + j * 21} y1={262 - t + 2} x2={x0 + 10 + j * 21} y2={260} stroke="#6C86CC" strokeWidth={2} />) : null}
      {Array.from({ length: n }, (_, j) => { const u = ph(f, sp, j, n); const x = x0 + 24 + ((j * 53) % 340), y = 112 + u * Math.max(8, 150 - t);
        return <circle key={j} cx={x} cy={y} r={8} fill={mol} opacity={a * Math.min(1, (1 - u) * 4, u * 6)} />; })}
    </g>);
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        <g opacity={lit(f, T(o, "dry"))}>{side(40, tD, O2, 4, 0.02, dr, true)}
          <text x={40} y={102} style={zh(32, H.text, 900)}>乾式：只通氧氣</text>
          <text x={230} y={302} textAnchor="middle" style={zh(30, H.text, 900)} opacity={0.3 + 0.7 * de}>慢，但緻密</text></g>
        <Sep x={476} />
        <g opacity={lit(f, T(o, "wet"))}>{side(516, tW, H2O, 9, 0.05, we, false)}
          <text x={516} y={102} style={zh(32, H.text, 900)}>濕式：加水氣</text>
          <text x={706} y={302} textAnchor="middle" style={zh(30, H.text, 900)} opacity={0.3 + 0.7 * fa}>快很多</text></g>
      </svg>
    </Card>
  );
};

// ── ox-batch：一管一百多片｜表面乾淨→均勻 ✓、有髒→不均勻 ✗ ──
const Batch: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330;
  const ba = on(f, T(o, "batch")), di = on(f, T(o, "dirt")), un = on(f, T(o, "uneven")), clv = on(f, T(o, "clean"));
  const n = Math.round(100 * EASE.move(cl((f - T(o, "batch")) / 24)));
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        <g opacity={lit(f, T(o, "batch"))}>
          {Array.from({ length: 16 }, (_, j) => <rect key={j} x={44} y={86 + j * 14} width={130} height={6} fill={j < Math.round(16 * cl((f - T(o, "batch")) / 24)) ? H.amber : SI_D} />)}
          <text x={190} y={186} style={zh(56, H.text, 900)}>{`${n}+`}</text>
          <text x={190} y={232} style={zh(30, H.text2, 800)}>片／一管</text>
        </g>
        <Sep x={340} />
        <g opacity={lit(f, T(o, "dirt"))}>
          <rect x={372} y={250} width={250} height={40} fill={SI} />
          <path d={`M372 250 L460 250 Q470 ${250 - 20 * un} 480 250 L622 250 L622 ${238 + 6 * un} Q530 ${226 + 10 * un} 480 ${232 - 14 * un} Q450 ${236} 372 238 Z`} fill={OX} />
          <circle cx={470} cy={244} r={12} fill={DIRT} opacity={di} />
          <text x={372} y={110} style={zh(32, H.text, 900)}>有一點髒</text>
          <text x={372} y={156} style={zh(30, RED, 800)} opacity={0.3 + 0.7 * un}>長不均勻</text>
          <Cross x={596} y={114} s={16} o={un} />
        </g>
        <Sep x={650} />
        <g opacity={lit(f, T(o, "clean"))}>
          <rect x={676} y={250} width={250} height={40} fill={SI} />
          <rect x={676} y={234} width={250} height={16} fill={OX} />
          <text x={676} y={110} style={zh(32, H.text, 900)}>先洗乾淨</text>
          <text x={676} y={156} style={zh(30, OK, 800)} opacity={0.3 + 0.7 * clv}>長得均勻</text>
          <Check x={890} y={112} o={clv} />
        </g>
      </svg>
    </Card>
  );
};

// 晶格小圖：7×4 個原子；dmg＝被撞亂程度（1＝亂、0＝歸位），site＝離子補進程度（0＝卡在縫裡、1＝在原子位置），diff＝擴散
const Lattice: React.FC<{ x0: number; y0: number; dmg: number; site: number; f: number; jit?: number }> = ({ x0, y0, dmg, site, f, jit = 0 }) => {
  const sx = 70, sy = 56, ions = [[1, 0], [4, 1], [5, 0]], bad = [[2, 1, 18, -16], [3, 0, -20, 14], [5, 2, 16, 18], [0, 2, -14, -18]];
  const isIon = (i: number, j: number) => ions.some(([a, b]) => a === i && b === j), isBad = (i: number, j: number) => bad.find(([a, b]) => a === i && b === j);
  const jx = (j: number) => jit * 3 * Math.sin(f * 1.3 + j * 1.7);
  return (
    <g>
      {Array.from({ length: 7 }, (_, i) => <line key={`h${i}`} x1={x0 + i * sx} y1={y0} x2={x0 + i * sx} y2={y0 + 3 * sy} stroke={SI} strokeWidth={4} />)}
      {Array.from({ length: 4 }, (_, j) => <line key={`v${j}`} x1={x0} y1={y0 + j * sy} x2={x0 + 6 * sx} y2={y0 + j * sy} stroke={SI} strokeWidth={4} />)}
      {Array.from({ length: 28 }, (_, q) => { const i = q % 7, j = Math.floor(q / 7); if (isIon(i, j)) return null; const b = isBad(i, j);
        const x = x0 + i * sx + (b ? b[2] * dmg : 0) + jx(q), y = y0 + j * sy + (b ? b[3] * dmg : 0) + jx(q + 3);
        return <circle key={q} cx={x} cy={y} r={13} fill={ATOM} />; })}
      {ions.map(([i, j], q) => { const x = x0 + i * sx + 35 * (1 - site) + jx(q + 9), y = y0 + j * sy + 28 * (1 - site) + jx(q + 11);
        return <circle key={`i${q}`} cx={x} cy={y} r={14} fill={ION} stroke="#FFFFFF" strokeWidth={3} />; })}
    </g>);
};

// ── ox-dmg：佈植之後：離子卡在縫裡、晶格被撞亂 → 還不導電 ✗ ──
const Dmg: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330;
  const io = on(f, T(o, "ion")), ga = on(f, T(o, "gap")), me = on(f, T(o, "mess")), nc = on(f, T(o, "noc"));
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        <g opacity={lit(f, T(o, "anneal"))}><Lattice x0={80} y0={110} dmg={1} site={0} f={f} /></g>
        <Cross x={530} y={196} s={20} o={nc} />
        <Sep x={588} />
        <Row x={612} y={122} t="離子卡在縫裡" c={ION} a={Math.max(io * 0.6, ga)} />
        <Row x={612} y={202} t="晶格被撞亂" c={ATOM} a={me} />
        <Row x={612} y={282} t="還不會導電" c={RED} a={nc} />
      </svg>
    </Card>
  );
};

// ── ox-act：加熱 → 原子排回整齊、離子補進位置 → 開始導電＝活化 ──
const Act: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330;
  const mo = on(f, T(o, "move")), od = cl((f - T(o, "order")) / 30), st = cl((f - T(o, "site")) / 30), cd = on(f, T(o, "cond")), ac = on(f, T(o, "act"));
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        <rect x={60} y={292} width={460} height={12} fill={HEAT} opacity={0.25 + 0.6 * mo * (0.75 + 0.25 * Math.sin(f * 0.3))} />
        <Lattice x0={80} y0={110} dmg={1 - EASE.move(od)} site={EASE.move(st)} f={f} jit={mo * (1 - 0.5 * od)} />
        {cd > 0 ? Array.from({ length: 4 }, (_, j) => { const u = ph(f, 0.04, j, 4); return <Arrow key={j} x1={60 + u * 380} y1={86} x2={100 + u * 380} y2={86} c={O2} w={5} o={cd * Math.min(1, (1 - u) * 5, u * 8)} />; }) : null}
        <Sep x={588} />
        <Row x={612} y={112} t="原子排回整齊" c={ATOM} a={on(f, T(o, "order"))} />
        <Row x={612} y={172} t="離子補進位置" c={ION} a={on(f, T(o, "site"))} />
        <Row x={612} y={232} t="開始導電" c={O2} a={cd} />
        <Stamp x={624} y={256} w={180} t="＝活化" a={ac} />
      </svg>
    </Card>
  );
};

// ── ox-diff：加熱太久 → 離子往外擴散 → 兩邊界線糊在一起 → 關不起來 ✗ ──
const Diff: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330;
  const lg = on(f, T(o, "long")), df = EASE.move(cl((f - T(o, "diff")) / 70)), sm_ = on(f, T(o, "small")), bl = on(f, T(o, "blur"));
  const w = 120 + 70 * df, d = 50 + 50 * df;
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        <rect x={40} y={150} width={520} height={164} fill={SI} />
        <rect x={230} y={102} width={140} height={34} fill={GATE} />
        <rect x={230} y={136} width={140} height={14} fill={OX} />
        {[[40, 1], [560, -1]].map(([x, s], j) => <g key={j}>
          <rect x={s > 0 ? x : x - w} y={150} width={w} height={d} fill={ION} opacity={0.75 - 0.25 * df} />
          {df > 0 ? <rect x={s > 0 ? x + w : x - w - 30 * df} y={150} width={30 * df} height={d} fill={ION} opacity={0.3} /> : null}
        </g>)}
        <rect x={40} y={72} width={520} height={14} fill={HEAT} opacity={0.2 + 0.7 * lg * (0.75 + 0.25 * Math.sin(f * 0.3))} />
        <g opacity={sm_}><path d={`M230 252 H370 M230 240 V264 M370 240 V264`} stroke={H.amber} strokeWidth={5} /><text x={300} y={300} textAnchor="middle" style={zh(30, H.text, 900)}>通道很短</text></g>
        <Sep x={588} />
        <Row x={612} y={112} t="加熱太久" c={HEAT} a={lg} />
        <Row x={612} y={172} t="離子擴散出去" c={ION} a={on(f, T(o, "diff"))} />
        <Row x={612} y={232} t="電晶體很小" c={H.amber} a={sm_} />
        <Row x={612} y={292} t="界線糊了關不起來" c={RED} a={bl} px={30} />
      </svg>
    </Card>
  );
};

// ── ox-spike：溫度—時間曲線：燈管幾秒拉到一千度，到頂就降（尖峰）；爐管是慢慢升、停很久（灰色虛線對照） ──
const Spike: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330;
  const la = on(f, T(o, "lamp")), up = cl((f - T(o, "up")) / 30), pk = on(f, T(o, "peak")), sp = on(f, T(o, "spike"));
  const X0 = 80, X1 = 540, Y0 = 296, Y1 = 92;
  const xs = (t: number) => X0 + (X1 - X0) * t, ys = (v: number) => Y0 - (Y0 - Y1) * v;
  const curve = Array.from({ length: 41 }, (_, i) => { const t = i / 40; const v = t < 0.45 ? 0.08 + 0.92 * Math.pow(t / 0.45, 1.6) : 0.08 + 0.92 * Math.exp(-Math.pow((t - 0.45) / 0.16, 2) * 2.5); return [t, v]; });
  const nShow = Math.round(41 * Math.min(1, up * 1.4 + (pk > 0 ? 0.4 : 0)));
  const d = curve.slice(0, Math.max(2, nShow)).map(([t, v], i) => `${i ? "L" : "M"}${xs(t)} ${ys(v)}`).join(" ");
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        <path d={`M${X0} ${Y1 - 10} V${Y0} H${X1 + 20}`} stroke={H.text3} strokeWidth={4} fill="none" />
        <line x1={X0} y1={ys(1)} x2={X1} y2={ys(1)} stroke={HEAT} strokeWidth={2} strokeDasharray="8 8" opacity={0.6} />
        <text x={X0 + 10} y={ys(1) - 10} style={zh(30, HEAT, 900)} opacity={0.4 + 0.6 * la}>1000°C</text>
        <path d={`M${X0} ${ys(0.08)} C ${xs(0.3)} ${ys(0.08)} ${xs(0.3)} ${ys(0.72)} ${xs(0.5)} ${ys(0.72)} H ${X1}`} stroke={H.text3} strokeWidth={4} fill="none" strokeDasharray="10 8" opacity={0.5} />
        {up > 0 ? <path d={d} stroke={HEAT} strokeWidth={7} fill="none" /> : null}
        {pk > 0 ? <circle cx={xs(0.45)} cy={ys(1)} r={11} fill={HEAT} stroke="#FFFFFF" strokeWidth={3} opacity={pk} /> : null}
        <Sep x={588} />
        <Row x={612} y={112} t="燈管加熱" c={HOT} a={la} />
        <Row x={612} y={172} t="幾秒到一千度" c={HEAT} a={on(f, T(o, "up"))} />
        <Row x={612} y={232} t="到頂就降溫" c={O2} a={pk} />
        <Stamp x={624} y={256} w={220} t="＝尖峰退火" a={sp} />
      </svg>
    </Card>
  );
};

// ── ox-laser：雷射只燒表面幾層原子（紅亮薄層）、下面不熱；不到 1 毫秒；離子來不及跑遠 ──
const Laser: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330;
  const la = on(f, T(o, "laser")), tp = on(f, T(o, "top")), ms = on(f, T(o, "ms")), st = on(f, T(o, "stay"));
  const bx = 100 + 380 * (0.5 - 0.5 * Math.cos(Math.max(0, f - T(o, "laser")) * 0.05));
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        <rect x={40} y={196} width={520} height={118} fill={SI} />
        {Array.from({ length: 12 }, (_, j) => <circle key={j} cx={66 + j * 43} cy={214} r={8} fill={ION} opacity={0.4 + 0.6 * st} />)}
        <rect x={Math.max(40, bx - 50)} y={196} width={100} height={26} fill={HOT} opacity={tp * (0.7 + 0.3 * Math.sin(f * 0.8))} />
        <rect x={bx - 10} y={86} width={20} height={110} fill={LASER} opacity={la} />
        <text x={300} y={290} textAnchor="middle" style={zh(30, H.text, 900)} opacity={0.4 + 0.6 * tp}>下面不熱</text>
        <Sep x={588} />
        <Row x={612} y={112} t="只燒表面幾層" c={HOT} a={tp} />
        <text x={760} y={208} textAnchor="middle" style={zh(60, O2, 900)} opacity={0.35 + 0.65 * ms}>{"<1毫秒"}</text>
        <Row x={612} y={292} t="離子來不及跑遠" c={ION} a={st} />
      </svg>
    </Card>
  );
};

// ── ox-co：爐管（批次）：國際電氣、東京威力科創、ASM｜快速加熱、雷射退火：應用材料、迪恩士；台積電是國際電氣的客戶 ──
const Co: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330;
  const L1: [string, string, string][] = [["國際電氣", "日本", "koku"], ["東京威力科創", "日本", "tel"], ["ASM", "荷蘭", "tel"]];
  const L2: [string, string, string][] = [["應用材料", "美國", "amat"], ["迪恩士", "日本", "screen"]];
  const col = (x: number, head: string, rows: [string, string, string][], c: string, w: number) => (
    <g>
      <rect x={x} y={70} width={w} height={46} fill={c} /><text x={x + 16} y={104} style={zh(30, "#FFFFFF", 900)}>{head}</text>
      {rows.map(([n, cty, id], j) => { const a = on(f, T(o, id)); const y = 166 + j * 54;
        return <g key={j} opacity={0.3 + 0.7 * a}><text x={x + 16} y={y} style={zh(34, H.text, 900)}>{n}</text><text x={x + w - 16} y={y} textAnchor="end" style={zh(30, H.text2, 800)}>{cty}</text></g>; })}
    </g>);
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        {col(30, "爐管（一次一整批）", L1, O2, 430)}
        <Sep x={486} />
        <g opacity={lit(f, T(o, "rtp"), 0.35)}>{col(510, "快速加熱、雷射退火", L2, HEAT, 412)}</g>
        <g opacity={0.3 + 0.7 * on(f, T(o, "tsmc"))}><text x={526} y={274} style={zh(30, H.text, 900)}>台積電：國際電氣的客戶</text></g>
      </svg>
    </Card>
  );
};

// ── ox-next：氧化層長好 → 離子歸位 → 下一支：光阻塗佈與顯影；留言「氧化」 ──
const Next: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330;
  const items: [string, string, string, string][] = [["氧化層", "長好了", "done", OX], ["離子", "歸位了", "ions", ION], ["下一支", "光阻塗佈與顯影", "next", H.amber]];
  const kw = on(f, T(o, "kw"));
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        {items.map(([a, b, id, c], j) => { const x = 30 + j * 312, l = lit(f, T(o, id), 0.4), hl = f >= T(o, id) && (j === 2 || f < T(o, items[j + 1][2]));
          return <g key={j} opacity={l}>
            <rect x={x} y={76} width={262} height={140} fill={hl ? c : H.cardCompare} stroke={c} strokeWidth={hl ? 5 : 3} />
            <text x={x + 131} y={136} textAnchor="middle" style={zh(40, hl ? "#FFFFFF" : H.text, 900)}>{a}</text>
            <text x={x + 131} y={186} textAnchor="middle" style={zh(sm(30), hl ? "#FFFFFF" : H.text2, 800)}>{b}</text>
            {j < 2 ? <path d={`M${x + 270} 146 H${x + 300} m-14 -12 l14 12 l-14 12`} stroke={H.text3} strokeWidth={5} fill="none" /> : null}
          </g>; })}
        <g opacity={kw} transform={`translate(${W / 2} 270) rotate(-3) scale(${1 + 0.3 * (1 - kw)})`}>
          <rect x={-220} y={-32} width={440} height={64} fill={H.amber} /><text x={0} y={14} textAnchor="middle" style={zh(38, onC(H.amber), 900)}>留言「氧化」看完整解說</text>
        </g>
      </svg>
    </Card>
  );
};

export const OxSection: React.FC<P> = (p) => {
  const kd = String((p.o as any).kind);
  if (kd === "ox-hook") return <Hook {...p} />;
  if (kd === "ox-grow") return <Grow {...p} />;
  if (kd === "ox-dw") return <Dw {...p} />;
  if (kd === "ox-batch") return <Batch {...p} />;
  if (kd === "ox-dmg") return <Dmg {...p} />;
  if (kd === "ox-act") return <Act {...p} />;
  if (kd === "ox-diff") return <Diff {...p} />;
  if (kd === "ox-spike") return <Spike {...p} />;
  if (kd === "ox-laser") return <Laser {...p} />;
  if (kd === "ox-co") return <Co {...p} />;
  if (kd === "ox-next") return <Next {...p} />;
  return null;
};

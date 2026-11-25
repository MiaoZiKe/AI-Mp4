// 2026/11/26 tech-lam：設備五大-3 科林研發（蝕刻）的 2D 示意卡（overlay `section` 的 kind 以 "lam-" 開頭，Hud.tsx 的 HudSection 轉過來）。
//   lam-hook 接上集：鋪膜 → 照圖 → 刻掉，怎麼刻？｜lam-move 手臂速度曲線｜lam-stack 感應耦合腔拆開（線圈、介電窗、吸盤、邊緣環）｜
//   lam-plasma 射頻 → 線圈 → 電漿（窗下最亮、往下漸暗、鞘層暗區）｜lam-ion 鞘層電場把離子垂直加速（u²）｜lam-rad 自由基亂飛、產物被抽走｜
//   lam-wall 側壁保護膜（孔底被離子打掉）｜lam-har 記憶孔變深、越深越慢（ARDE）｜lam-cryo 室溫弓形 vs 低溫直孔（公司說法）｜
//   lam-ale 原子層蝕刻一圈四步｜lam-co 公司（LOGO、國旗、財報、真實輪廓台灣地圖＋四個據點）｜lam-next 下一集
// 全部示意；時間全部來自 script.json 的 t（cue）。排版原則同 HudAmat（card-overlap.mjs 檢查）：內容在 CARD_CONTENT_TOP 以下、字 ≥30px、字不碰圖形。
import React from "react";
import { FONT_ZH } from "../../theme";
import { H, L, CARD_HEAD, CARD_CONTENT_TOP, cardTitleBox } from "./hudSkin";
import { EASE, tween } from "../anim";
import type { Model3D, Overlay3D, State3D } from "./engine";
import { Flag, LogoSvg, hasLogo, logoW } from "./Brand";
import "./BrandWafer";

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
const cl = (x: number) => Math.min(1, Math.max(0, x));
const fr = (x: number) => ((x % 1) + 1) % 1;
const ease = (u: number) => EASE.move(cl(u));
const rnd = (i: number) => fr(Math.sin(i * 12.9898 + 4.1) * 43758.5453);
const RED = "#E0472F", OK = "#14A38B", BLUE = "#2F7FE0", WAF = "#B4C2DA", WAF_D = "#7F93B5", CU = "#D98A3D", ION = "#1E9BD7", RAD = "#E8950C", BYP = "#8E7DB3",
  PLI = "#5FD4F5", PLI_L = "#CFF4FF", STEEL = "#8E9BB0", OXI = "#BCD9F2", NIT = "#C9CDD3", MASK = "#6B4A2E", POLY = "#8C6B4F", HOLE = "#1B2233", CL2 = "#6DB33F", PG = "#B8C2D0", COLD = "#7CC4F5";
const Sep: React.FC<{ x: number; y0?: number; y1?: number }> = ({ x, y0 = CT + 4, y1 = 316 }) => <line x1={x} y1={y0} x2={x} y2={y1} stroke={H.lineSoft} strokeWidth={3} />;
const Arrow: React.FC<{ x1: number; y1: number; x2: number; y2: number; c: string; w?: number; o?: number }> = ({ x1, y1, x2, y2, c, w = 5, o = 1 }) => {
  const a = Math.atan2(y2 - y1, x2 - x1), s = w * 2.6;
  return <g opacity={o}><path d={`M${x1} ${y1} L${x2 - Math.cos(a) * s * 0.8} ${y2 - Math.sin(a) * s * 0.8}`} stroke={c} strokeWidth={w} />
    <path d={`M${x2} ${y2} L${x2 - Math.cos(a) * s - Math.sin(a) * s * 0.6} ${y2 - Math.sin(a) * s + Math.cos(a) * s * 0.6} L${x2 - Math.cos(a) * s + Math.sin(a) * s * 0.6} ${y2 - Math.sin(a) * s - Math.cos(a) * s * 0.6} Z`} fill={c} /></g>;
};
const Check: React.FC<{ x: number; y: number; o?: number }> = ({ x, y, o = 1 }) => <path opacity={o} d={`M${x - 18} ${y} l12 12 l26 -28`} stroke={OK} strokeWidth={7} fill="none" />;
const Row: React.FC<{ x: number; y: number; t: string; c: string; a: number; px?: number }> = ({ x, y, t, c, a, px = 32 }) => (
  <g opacity={0.35 + 0.65 * a}><rect x={x} y={y - px * 0.72} width={12} height={px * 0.72} fill={c} /><text x={x + 24} y={y} style={zh(px, H.text, 900)}>{t}</text></g>
);
const LogoBox: React.FC<{ id: string; x: number; y: number; h: number; a: number; maxW?: number }> = ({ id, x, y, h, a, maxW = 260 }) => {
  if (!hasLogo(id)) return null;
  const lw = Math.min(maxW, logoW(id, h)), lh = (h * lw) / logoW(id, h);
  return <g><rect x={x} y={y} width={lw + 16} height={h + 12} fill="#FFFFFF" stroke={a > 0.5 ? H.amber : H.lineSoft} strokeWidth={a > 0.5 ? 4 : 1.5} />
    <LogoSvg id={id} x={x + 8} y={y + 6 + (h - lh) / 2} h={lh} /></g>;
};
const FlagBox: React.FC<{ code: string; x: number; y: number; a: number }> = ({ code, x, y, a }) => (
  <g><rect x={x} y={y} width={50} height={36} fill="none" stroke={a > 0.5 ? H.amber : H.lineSoft} strokeWidth={a > 0.5 ? 4 : 1.5} /><Flag code={code} h={28} x={x + 4} y={y + 4} asSvg /></g>
);
const Wafer: React.FC<{ x: number; y: number; w: number }> = ({ x, y, w }) => <rect x={x} y={y} width={w} height={12} fill={WAF} stroke={WAF_D} strokeWidth={2} />;
/** 線圈截面：一排銅色小方塊（內外兩組） */
const Coil: React.FC<{ x: number; y: number; w: number; a: number; hot?: number }> = ({ x, y, w, a, hot = 0 }) => (
  <g opacity={0.4 + 0.6 * a}>{[0.08, 0.17, 0.26, 0.74, 0.83, 0.92].map((u, i) => <rect key={i} x={x + w * u - 9} y={y} width={18} height={14} fill={CU} stroke={hot > 0.3 ? "#F08A3C" : "none"} strokeWidth={hot > 0.3 ? 4 : 0} />)}</g>
);

// ── lam-hook ──
const Hook: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330;
  const pv = on(f, T(o, "prev")), how = on(f, T(o, "how")), lm = on(f, T(o, "lam")), dp = on(f, T(o, "deep"));
  const box = (x: number, t: string, hi: boolean) => (
    <g><rect x={x} y={CT + 70} width={118} height={74} fill={hi ? "#FFF4DA" : "#FFFFFF"} stroke={hi ? H.amber : H.lineSoft} strokeWidth={hi ? 4 : 2} />
      <text x={x + 59} y={CT + 118} textAnchor="middle" style={zh(30, H.text, 900)}>{t}</text></g>);
  const q = 1 + 0.12 * Math.sin(f * 0.3) * how;
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        <g opacity={0.45 + 0.55 * pv}>
          {box(24, "鋪薄膜", false)}<Arrow x1={146} y1={CT + 107} x2={172} y2={CT + 107} c={H.text2} w={4} />
          {box(176, "照圖案", false)}<Arrow x1={298} y1={CT + 107} x2={324} y2={CT + 107} c={H.text2} w={4} />
          {box(328, "刻掉", true)}
        </g>
        <g transform={`translate(83 ${CT + 214}) scale(${q})`} opacity={0.3 + 0.7 * how}><circle r={34} fill={H.amber} /><text y={16} textAnchor="middle" style={zh(46, onC(H.amber), 900)}>?</text></g>
        <text x={136} y={CT + 226} style={zh(30, H.text2, 800)}>上集：把多的刻掉</text>
        <Sep x={470} />
        <text x={500} y={CT + 52} style={zh(40, H.text, 900)} opacity={0.35 + 0.65 * how}>怎麼刻得又直又深？</text>
        <LogoBox id="lam" x={500} y={CT + 84} h={80} a={lm} maxW={260} />
        <g opacity={0.35 + 0.65 * Math.max(lm, dp)}><FlagBox code="US" x={500} y={CT + 200} a={lm} /><text x={566} y={CT + 230} style={zh(32, H.text, 900)}>美國・科林研發</text></g>
      </svg>
    </Card>
  );
};

// ── lam-move：速度曲線 sin²（兩端 0），點跟著時間走 ──
const Move: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330;
  const mid = on(f, T(o, "mid")), arm = on(f, T(o, "arm")), ac = on(f, T(o, "acc")), dc = on(f, T(o, "dec")), pt = on(f, T(o, "put"));
  const x0 = 44, x1 = 404, yb = CT + 200, hA = 150, v = (u: number) => Math.sin(Math.PI * u) ** 2;
  const path = Array.from({ length: 41 }, (_, i) => { const u = i / 40; return `${i ? "L" : "M"}${x0 + (x1 - x0) * u} ${yb - hA * v(u)}`; }).join(" ");
  const a0 = T(o, "acc") - 6, a1 = T(o, "put"), u = cl((f - a0) / Math.max(10, a1 - a0));
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        <line x1={x0} y1={yb} x2={x1 + 10} y2={yb} stroke={H.text2} strokeWidth={3} />
        <line x1={x0} y1={yb} x2={x0} y2={yb - hA - 14} stroke={H.text2} strokeWidth={3} />
        <path d={path} stroke={BLUE} strokeWidth={5} fill="none" opacity={0.4 + 0.6 * arm} />
        <circle cx={x0 + (x1 - x0) * u} cy={yb - hA * v(u)} r={12} fill={H.amber} stroke="#FFFFFF" strokeWidth={3} opacity={f >= a0 ? 1 : 0.3} />
        <text x={x0 + 10} y={yb + 44} style={zh(30, H.text2, 800)} opacity={0.4 + 0.6 * ac}>加速</text>
        <text x={x1 - 76} y={yb + 44} style={zh(30, H.text2, 800)} opacity={0.4 + 0.6 * dc}>減速</text>
        <text x={x0 + 140} y={yb + 44} style={zh(30, H.text2, 800)}>時間 →</text>
        <Sep x={470} />
        <Row x={500} y={CT + 44} t="中央：真空傳送腔" c={BLUE} a={mid * (1 - 0.6 * arm)} />
        <Row x={500} y={CT + 104} t="手臂從裝載閘取片" c={BLUE} a={arm * (1 - 0.6 * ac)} />
        <Row x={500} y={CT + 164} t="先加速、再減速" c={H.amber} a={Math.max(ac, dc) * (1 - 0.6 * pt)} />
        <Row x={500} y={CT + 224} t="停穩才放進蝕刻腔" c={OK} a={pt} />
      </svg>
    </Card>
  );
};

// ── lam-stack：腔體拆開（側視示意）：各層沿軸線分開，念到哪層哪層亮 ──
const Stack: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330;
  const op = on(f, T(o, "open"), 18), c = on(f, T(o, "coil")), w = on(f, T(o, "win")), e = on(f, T(o, "esc")), r = on(f, T(o, "ring"));
  const now = [T(o, "coil"), T(o, "win"), T(o, "esc"), T(o, "ring")].filter((t) => f >= t - 4).length - 1;
  const x = 40, ww = 340, sp = 26 * op;
  const hi = (i: number) => (now === i ? 1 : 0.35);
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        <g opacity={hi(0)}><Coil x={x} y={CT + 30 - sp} w={ww} a={1} /></g>
        <rect x={x} y={CT + 56 - sp * 0.4} width={ww} height={20} fill="#F4F1EA" stroke={STEEL} strokeWidth={now === 1 ? 4 : 2} opacity={hi(1)} />
        <rect x={x} y={CT + 80} width={6} height={150} fill={STEEL} opacity={0.5} /><rect x={x + ww - 6} y={CT + 80} width={6} height={150} fill={STEEL} opacity={0.5} />
        <g opacity={hi(3)}><rect x={x + 40} y={CT + 172 - sp * 0.5} width={36} height={14} fill="#5C6675" /><rect x={x + ww - 76} y={CT + 172 - sp * 0.5} width={36} height={14} fill="#5C6675" /></g>
        <Wafer x={x + 80} y={CT + 174} w={ww - 160} />
        <rect x={x + 70} y={CT + 188} width={ww - 140} height={34} fill="#E9ECEF" stroke={STEEL} strokeWidth={now === 2 ? 4 : 2} opacity={hi(2)} />
        <rect x={x + 90} y={CT + 202} width={ww - 180} height={4} fill={H.text2} opacity={hi(2)} />
        <Sep x={440} />
        <Row x={466} y={CT + 46} t="線圈：通射頻" c={CU} a={c * (now === 0 ? 1 : 0.5)} />
        <Row x={466} y={CT + 106} t="介電窗：讓磁場穿過" c={BLUE} a={w * (now === 1 ? 1 : 0.5)} />
        <Row x={466} y={CT + 166} t="靜電吸盤：吸住晶圓" c={OK} a={e * (now === 2 ? 1 : 0.5)} />
        <Row x={466} y={CT + 226} t="邊緣環：邊緣也均勻" c={STEEL} a={r * (now === 3 ? 1 : 0.5)} />
      </svg>
    </Card>
  );
};

// ── lam-plasma：射頻 → 線圈 → 電漿 ──
const Plasma: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330;
  const rf = on(f, T(o, "rf")), gs = on(f, T(o, "gas")), gl = on(f, T(o, "glow"), 16);
  const x = 40, ww = 340, fl = 0.85 + 0.15 * Math.sin(f * 0.9) * Math.sin(f * 0.37);
  const wave = Array.from({ length: 30 }, (_, i) => `${i ? "L" : "M"}${x + 10 + i * 4} ${CT + 26 + 8 * Math.sin(i * 0.9 - f * 0.5)}`).join(" ");
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        <defs><linearGradient id="lamPl" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={PLI} stopOpacity={0.95} /><stop offset="1" stopColor={PLI} stopOpacity={0.15} /></linearGradient></defs>
        <path d={wave} stroke={CU} strokeWidth={4} fill="none" opacity={rf} />
        <Coil x={x} y={CT + 46} w={ww} a={1} hot={rf} />
        <rect x={x} y={CT + 64} width={ww} height={16} fill="#F4F1EA" stroke={STEEL} strokeWidth={2} />
        <rect x={x + 6} y={CT + 82} width={ww - 12} height={96} fill="url(#lamPl)" opacity={gl * fl} />
        {Array.from({ length: 10 }, (_, i) => <circle key={i} cx={x + 30 + rnd(i) * (ww - 60) + 10 * Math.sin(f * 0.2 + i)} cy={CT + 92 + rnd(i + 9) * 70} r={4} fill={PG} opacity={gs * (1 - 0.7 * gl)} />)}
        <rect x={x + 6} y={CT + 178} width={ww - 12} height={12} fill={H.text2} opacity={0.25 * gl} />
        <Wafer x={x + 60} y={CT + 190} w={ww - 120} />
        <rect x={x + 50} y={CT + 202} width={ww - 100} height={26} fill="#E9ECEF" stroke={STEEL} strokeWidth={2} />
        <Sep x={440} />
        <Row x={466} y={CT + 46} t="① 射頻通進線圈" c={CU} a={rf} />
        <Row x={466} y={CT + 106} t="② 磁場穿過介電窗" c={BLUE} a={rf} />
        <Row x={466} y={CT + 166} t="③ 氣體被打成電漿" c={PLI} a={gl} />
        <text x={490} y={CT + 226} style={zh(30, H.text2, 800)} opacity={0.4 + 0.6 * gl}>窗下最亮，往下漸暗</text>
      </svg>
    </Card>
  );
};

// ── lam-ion：鞘層電場（箭頭）、離子垂直加速（位置 ∝ u²） ──
const Ion: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330;
  const bs = on(f, T(o, "bias")), io = on(f, T(o, "ion")), dn = on(f, T(o, "down")), ht = on(f, T(o, "hit"));
  const x = 40, ww = 340, y0 = CT + 40, y1 = CT + 196, t0 = T(o, "ion");
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        <rect x={x} y={y0 - 20} width={ww} height={60} fill={PLI} opacity={0.35} />
        <rect x={x} y={y0 + 40} width={ww} height={y1 - y0 - 40} fill={H.text2} opacity={0.08 + 0.1 * bs} />
        {[0.15, 0.4, 0.6, 0.85].map((u, i) => <Arrow key={i} x1={x + ww * u} y1={y0 + 60} x2={x + ww * u} y2={y1 - 8} c={H.text3 ?? H.text2} w={3} o={0.25 + 0.5 * bs} />)}
        {Array.from({ length: 7 }, (_, i) => { const p = fr((f - t0) / 34 + i / 7), yy = y0 + 20 + (y1 - y0 - 20) * p * p;
          return f >= t0 - 4 ? <g key={i}><line x1={x + 30 + i * 47} y1={yy - 4 - 22 * p} x2={x + 30 + i * 47} y2={yy} stroke={ION} strokeWidth={3} opacity={0.5} /><circle cx={x + 30 + i * 47} cy={yy} r={7} fill={ION} /></g> : null; })}
        <Wafer x={x} y={y1} w={ww} />
        {[0, 1, 2, 3, 4, 5, 6].map((i) => <circle key={i} cx={x + 30 + i * 47} cy={y1 + 2} r={10 * ht * fr((f - t0) / 34 + i / 7 + 0.95) ** 8} fill="#FFFFFF" opacity={0.8} />)}
        <rect x={x} y={y1 + 12} width={ww} height={26} fill="#E9ECEF" stroke={STEEL} strokeWidth={2} />
        <Sep x={440} />
        <Row x={466} y={CT + 46} t="偏壓加在下方吸盤" c={H.text2} a={bs} />
        <Row x={466} y={CT + 106} t="離子被電場往下拉" c={ION} a={io} />
        <Row x={466} y={CT + 166} t="越往下越快" c={H.amber} a={dn} />
        <Row x={466} y={CT + 226} t="幾乎垂直撞上晶圓" c={OK} a={ht} />
      </svg>
    </Card>
  );
};

// ── lam-rad：自由基亂飛（碰壁反彈）、產物往上冒再被抽走 ──
const Rad: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330;
  const rd = on(f, T(o, "rad")), re = on(f, T(o, "react")), gs = on(f, T(o, "gas")), pm = on(f, T(o, "pump"));
  const x = 40, ww = 300, y0 = CT + 20, y1 = CT + 200, tri = (u: number) => 1 - Math.abs(1 - 2 * fr(u));
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        <rect x={x} y={y0} width={ww} height={y1 - y0} fill="none" stroke={STEEL} strokeWidth={4} />
        <rect x={x + ww - 4} y={y1 - 70} width={8} height={56} fill={H.cardCompare} />
        <rect x={x + ww + 4} y={y1 - 70} width={56} height={56} fill={STEEL} opacity={0.5 + 0.5 * pm} />
        <text x={x + ww + 8} y={y1 + 30} style={zh(30, H.text2, 800)} opacity={0.4 + 0.6 * pm}>泵</text>
        {Array.from({ length: 9 }, (_, i) => <circle key={i} cx={x + 12 + (ww - 24) * tri(f * (0.006 + rnd(i) * 0.008) + rnd(i + 3))} cy={y0 + 12 + (y1 - y0 - 40) * tri(f * (0.007 + rnd(i + 5) * 0.007) + rnd(i + 7))} r={7} fill={RAD} opacity={0.3 + 0.7 * rd} />)}
        {Array.from({ length: 5 }, (_, i) => { const p = fr((f - T(o, "gas")) / 60 + i / 5), px = x + 40 + i * 50, py = y1 - 20 - 100 * Math.min(p, 0.5) * 2;
          const qx = p < 0.5 ? px : px + (x + ww + 30 - px) * (p - 0.5) * 2, qy = p < 0.5 ? py : y1 - 120 + 78 * (p - 0.5) * 2;
          return f >= T(o, "gas") - 4 ? <circle key={i} cx={qx} cy={qy} r={8} fill={BYP} opacity={0.85} /> : null; })}
        <Wafer x={x + 20} y={y1 - 14} w={ww - 40} />
        <Sep x={440} />
        <Row x={466} y={CT + 46} t="自由基：不帶電、亂飛" c={RAD} a={rd} />
        <Row x={466} y={CT + 106} t="碰到表面就起反應" c={RAD} a={re} />
        <Row x={466} y={CT + 166} t="產物變成氣體" c={BYP} a={gs} />
        <Row x={466} y={CT + 226} t="從底下被泵抽走" c={STEEL} a={pm} />
      </svg>
    </Card>
  );
};

// ── lam-wall：孔剖面：側壁長保護膜（棕），孔底被離子打掉，所以只往下 ──
const Wall: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330;
  const wl = on(f, T(o, "wall")), fm = on(f, T(o, "film"), 20), dn = on(f, T(o, "down")), sd = on(f, T(o, "side"));
  const cx = 200, hw = 34, top = CT + 30, depth = 120 + 70 * ease((f - T(o, "wall")) / 120), t0 = T(o, "wall");
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        {Array.from({ length: 9 }, (_, i) => <rect key={i} x={50} y={top + 18 + i * 24} width={300} height={24} fill={i % 2 ? NIT : OXI} />)}
        <rect x={50} y={top} width={300} height={18} fill={MASK} />
        <rect x={cx - hw} y={top} width={2 * hw} height={depth} fill={HOLE} />
        <rect x={cx - hw} y={top + 18} width={8 * fm} height={depth - 28} fill={POLY} /><rect x={cx + hw - 8 * fm} y={top + 18} width={8 * fm} height={depth - 28} fill={POLY} />
        {Array.from({ length: 4 }, (_, i) => { const p = fr((f - t0) / 26 + i / 4); return f >= t0 ? <circle key={i} cx={cx - 18 + i * 12} cy={top - 10 + (depth + 4) * p * p} r={5} fill={ION} /> : null; })}
        <g opacity={sd}><Arrow x1={cx + 50} y1={top + 110} x2={cx + 104} y2={top + 110} c={RED} w={5} /><path d={`M${cx + 64} ${top + 92} l36 36 M${cx + 100} ${top + 92} l-36 36`} stroke={RED} strokeWidth={6} /></g>
        <g opacity={dn}><Arrow x1={cx - 100} y1={top + 40} x2={cx - 100} y2={top + 150} c={OK} w={6} /></g>
        <Sep x={440} />
        <Row x={466} y={CT + 46} t="孔壁：長一層保護膜" c={POLY} a={Math.max(wl, fm)} />
        <Row x={466} y={CT + 106} t="孔底：離子把膜打掉" c={ION} a={fm} />
        <Row x={466} y={CT + 166} t="所以只往下刻" c={OK} a={dn} />
        <Row x={466} y={CT + 226} t="不往旁邊啃" c={RED} a={sd} />
      </svg>
    </Card>
  );
};

// ── lam-har：ONON 疊層中的細孔一點點變深；右邊深度－時間曲線越來越平（越深越慢） ──
const Har: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330;
  const hl = on(f, T(o, "hole")), ra = on(f, T(o, "ratio")), hd = on(f, T(o, "hard"));
  const t0 = T(o, "hole") - 10, span = Math.max(60, T(o, "hard") + 50 - t0), u = cl((f - t0) / span);
  const dep = (x: number) => 1 - Math.pow(1 - x, 2.2);   // 越深越慢（示意）
  const top = CT + 14, Hs = 236, d = Hs * dep(u);
  const gx0 = 470, gx1 = 760, gy0 = CT + 196, gh = 150;
  const curve = Array.from({ length: 31 }, (_, i) => { const x = i / 30; return `${i ? "L" : "M"}${gx0 + (gx1 - gx0) * x} ${gy0 - gh * dep(x)}`; }).join(" ");
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        {Array.from({ length: 24 }, (_, i) => <rect key={i} x={40} y={top + 8 + i * 10} width={160} height={10} fill={i % 2 ? NIT : OXI} />)}
        <rect x={40} y={top} width={160} height={8} fill={MASK} />
        {[70, 120, 170].map((cx) => <g key={cx}><rect x={cx - 2.5} y={top} width={5} height={d + 8} fill={HOLE} /><rect x={cx - 3.5} y={top + 8} width={1.4} height={d} fill={POLY} /><rect x={cx + 2.1} y={top + 8} width={1.4} height={d} fill={POLY} /></g>)}
        <g opacity={0.4 + 0.6 * ra}><line x1={222} y1={top} x2={222} y2={top + Hs + 8} stroke={H.text2} strokeWidth={3} />
          <text x={236} y={top + 120} style={zh(30, H.text, 900)}>深</text><text x={236} y={top + 160} style={zh(30, H.text2, 800)}>寬的</text><text x={236} y={top + 200} style={zh(30, H.amber, 900)}>百倍</text></g>
        <Sep x={440} />
        <line x1={gx0} y1={gy0} x2={gx1 + 10} y2={gy0} stroke={H.text2} strokeWidth={3} /><line x1={gx0} y1={gy0} x2={gx0} y2={gy0 - gh - 10} stroke={H.text2} strokeWidth={3} />
        <path d={curve} stroke={BLUE} strokeWidth={5} fill="none" opacity={0.3 + 0.7 * hl} />
        <circle cx={gx0 + (gx1 - gx0) * u} cy={gy0 - gh * dep(u)} r={11} fill={H.amber} stroke="#FFFFFF" strokeWidth={3} />
        <text x={gx0 + 14} y={gy0 + 38} style={zh(30, H.text2, 800)}>時間 →</text>
        <text x={gx0 + 14} y={gy0 - gh + 10} style={zh(30, H.text2, 800)}>深度</text>
        <g opacity={0.35 + 0.65 * hd}><text x={790} y={CT + 70} style={zh(30, H.text, 900)}>越深</text><text x={790} y={CT + 110} style={zh(30, RED, 900)}>越慢</text>
          <text x={790} y={CT + 180} style={zh(30, H.text2, 800)}>粒子</text><text x={790} y={CT + 220} style={zh(30, H.text2, 800)}>難到底</text></g>
      </svg>
    </Card>
  );
};

// ── lam-cryo：室溫（孔中段鼓起＝弓形，紅）vs 低溫（直，綠）；速度兩倍以上（公司說法） ──
const Cryo: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330;
  const sy = on(f, T(o, "say")), co = on(f, T(o, "cold")), st = on(f, T(o, "str")), fs = on(f, T(o, "fast"));
  const top = CT + 14, Hs = 170;
  const bow = (cx: number, b: number) => `M${cx - 8} ${top} C${cx - 8 - b} ${top + Hs * 0.35} ${cx - 8 - b} ${top + Hs * 0.6} ${cx - 6} ${top + Hs} L${cx + 6} ${top + Hs} C${cx + 8 + b} ${top + Hs * 0.6} ${cx + 8 + b} ${top + Hs * 0.35} ${cx + 8} ${top} Z`;
  const gT = T(o, "fast") - 6, g1 = cl((f - gT) / 30);
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        {[0, 1].map((j) => <g key={j}>{Array.from({ length: 10 }, (_, i) => <rect key={i} x={40 + j * 200} y={top + i * 17} width={150} height={17} fill={i % 2 ? NIT : OXI} />)}</g>)}
        <path d={bow(115, 26)} fill={HOLE} /><path d={bow(115, 26)} fill="none" stroke={RED} strokeWidth={4} opacity={st} />
        <path d={bow(315, 0)} fill={HOLE} opacity={0.35 + 0.65 * co} /><path d={bow(315, 0)} fill="none" stroke={OK} strokeWidth={4} opacity={st} />
        <rect x={240} y={top + Hs} width={150} height={10} fill={COLD} opacity={co} />
        <text x={62} y={top + Hs + 44} style={zh(30, H.text2, 800)}>室溫</text>
        <text x={240} y={top + Hs + 44} style={zh(30, COLD, 900)} opacity={0.4 + 0.6 * co}>低溫</text>
        <Sep x={440} />
        <Row x={466} y={CT + 46} t="零下數十度（示意）" c={COLD} a={co} />
        <Row x={466} y={CT + 98} t="孔壁更直" c={OK} a={st} />
        <text x={490} y={CT + 146} style={zh(30, H.text, 900)} opacity={0.35 + 0.65 * fs}>速度（相對室溫）</text>
        <rect x={490} y={CT + 160} width={150} height={22} fill={STEEL} opacity={0.35 + 0.65 * fs} />
        <rect x={490} y={CT + 190} width={300 * g1 + 1} height={22} fill={COLD} />
        <text x={652} y={CT + 181} style={zh(30, H.text2, 800)} opacity={0.35 + 0.65 * fs}>1 倍</text>
        <text x={802} y={CT + 212} style={zh(30, H.text, 900)} opacity={g1}>2 倍+</text>
        <text x={490} y={CT + 250} style={zh(30, H.amber, 900)} opacity={0.35 + 0.65 * sy}>科林的說法</text>
      </svg>
    </Card>
  );
};

// ── lam-ale：一圈四步（改質→沖洗→移除→沖洗），左邊原子格最上層變綠、被打掉；圈數累加 ──
const Ale: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330;
  const al = on(f, T(o, "ale")), one = on(f, T(o, "one"));
  const c0 = T(o, "mod") - 6, ph = Math.max(0, f - c0), cyc = Math.min(3, Math.floor(ph / 50)), st = f < c0 ? -1 : cyc >= 3 ? -1 : Math.min(3, Math.floor((ph % 50) / 12.5));
  const steps: [string, string][] = [["改質", CL2], ["沖洗", PG], ["移除", ION], ["沖洗", PG]];
  const rows = 6, removed = cyc + (st >= 3 ? 1 : 0);
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        {Array.from({ length: rows }, (_, r) => r < removed ? null : Array.from({ length: 9 }, (_, c) => {
          const topRow = r === removed, green = topRow && (st === 0 || st === 1 || st === 2);
          const gone = topRow && st === 2 ? cl(((ph % 50) - 25) / 12) : 0;
          return <circle key={`${r}-${c}`} cx={60 + c * 36} cy={CT + 60 + r * 34 - gone * 40} r={14} fill={green ? CL2 : "#AEB8C6"} stroke={WAF_D} strokeWidth={1.5} opacity={1 - gone} />;
        }))}
        {st === 2 ? Array.from({ length: 4 }, (_, i) => { const p = fr(ph / 10 + i / 4); return <circle key={i} cx={80 + i * 80} cy={CT + 20 + 30 * p} r={7} fill={ION} />; }) : null}
        <Sep x={440} />
        {steps.map(([t, c], i) => <g key={i}><rect x={470 + i * 118} y={CT + 40} width={108} height={64} fill={st === i ? c : "#FFFFFF"} stroke={c} strokeWidth={4} />
          <text x={524 + i * 118} y={CT + 84} textAnchor="middle" style={zh(30, st === i && i !== 1 && i !== 3 ? "#FFFFFF" : H.text, 900)}>{t}</text></g>)}
        <text x={470} y={CT + 160} style={zh(30, H.text2, 800)} opacity={0.4 + 0.6 * al}>第 {Math.max(1, Math.min(3, cyc + 1))} 圈（示意）</text>
        <g opacity={0.35 + 0.65 * one}><Check x={490} y={CT + 214} o={one} /><text x={530} y={CT + 226} style={zh(32, H.text, 900)}>一圈剝掉約一層原子</text></g>
      </svg>
    </Card>
  );
};

// ── lam-co：公司＋真實輪廓台灣地圖（新竹、台中、台南、高雄） ──
const TW_PATH = "M180.3 82.0 L192.0 91.6 L202.6 99.9 L207.3 100.6 L197.3 110.2 L199.1 127.4 L195.6 136.4 L185.0 166.5 L179.1 190.8 L170.9 222.8 L157.4 245.2 L142.8 271.4 L139.9 299.6 L132.8 297.7 L125.2 270.2 L116.4 263.8 L105.8 253.5 L98.8 229.8 L94.7 219.6 L98.8 204.9 L101.7 179.3 L113.5 162.0 L119.3 147.9 L129.3 133.2 L144.0 112.7 L153.3 99.3 L172.1 89.7Z";
const geo = (lat: number, lon: number) => [180.3 + (lon - 121.54) * 58.6, 82 + (25.30 - lat) * 64];
const Co: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 360;
  const us = on(f, T(o, "us")), n3 = on(f, T(o, "no3")), tw = on(f, T(o, "tw"));
  const S = 1.05, OX = 470, OY = 0, pt = (la: number, lo: number) => { const [x, y] = geo(la, lo); return [OX + x * S, OY + y * S]; };
  const sites: [string, number, number, number][] = [["新竹", 24.78, 121.0, CT + 60], ["台中", 24.21, 120.62, CT + 118], ["台南", 23.10, 120.27, CT + 176], ["高雄", 22.85, 120.27, CT + 234]];
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        <LogoBox id="lam" x={28} y={CT + 6} h={64} a={us} maxW={200} />
        <FlagBox code="US" x={272} y={CT + 20} a={us} /><text x={334} y={CT + 50} style={zh(32, H.text, 900)} opacity={0.4 + 0.6 * us}>美國</text>
        <g opacity={0.35 + 0.65 * n3}><text x={28} y={CT + 120} style={zh(30, H.text2, 800)}>全球半導體設備商</text>
          <text x={28} y={CT + 172} style={zh(46, H.amber, 900)}>第 3 大</text><text x={190} y={CT + 168} style={zh(30, H.text2, 800)}>（研究機構）</text>
          <text x={28} y={CT + 222} style={zh(30, H.text2, 800)}>2025 財年營收（財報）</text>
          <text x={28} y={CT + 270} style={zh(40, H.text, 900)}>約 184 億美元</text></g>
        <Sep x={500} y1={346} />
        <path d={TW_PATH} transform={`translate(${OX} ${OY}) scale(${S})`} fill={OK} opacity={0.3 + 0.35 * tw} stroke={OK} strokeWidth={3 / S} strokeLinejoin="round" />
        {sites.map(([n, la, lo, ty], i) => { const [x, y] = pt(la, lo), a = cl((f - T(o, "tw") - i * 6) / 8);
          return <g key={n} opacity={0.35 + 0.65 * a}><circle cx={x} cy={y} r={8 * (1 + 0.25 * a * Math.sin(f * 0.25 + i))} fill={H.amber} />
            <line x1={x + 10} y1={y} x2={714} y2={ty - 10} stroke={H.text2} strokeWidth={2} /><text x={722} y={ty} style={zh(30, H.text, 900)}>{n}</text></g>; })}
        <g opacity={0.4 + 0.6 * tw}><FlagBox code="TW" x={526} y={CT + 230} a={tw} /><text x={806} y={CT + 60} style={zh(30, H.text2, 800)}>訓練中心</text></g>
      </svg>
    </Card>
  );
};

// ── lam-next：塗光阻 → 顯影 →（科林）蝕刻；下一集東京威力科創＋日本國旗；留言關鍵字 ──
const Next: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330;
  const bf = on(f, T(o, "before")), ct = on(f, T(o, "coat")), nx = on(f, T(o, "next")), kw = on(f, T(o, "kw"), 8);
  const box = (x: number, t: string, c: string, a: number) => <g opacity={0.4 + 0.6 * a}><rect x={x} y={CT + 40} width={118} height={70} fill="#FFFFFF" stroke={c} strokeWidth={4} /><text x={x + 59} y={CT + 86} textAnchor="middle" style={zh(30, H.text, 900)}>{t}</text></g>;
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        {box(24, "塗光阻", H.amber, ct)}<Arrow x1={146} y1={CT + 75} x2={172} y2={CT + 75} c={H.text2} w={4} />
        {box(176, "顯影", H.amber, ct)}<Arrow x1={298} y1={CT + 75} x2={324} y2={CT + 75} c={H.text2} w={4} />
        {box(328, "蝕刻", OK, bf)}
        <text x={24} y={CT + 170} style={zh(30, H.text2, 800)} opacity={0.4 + 0.6 * bf}>刻之前要先做好的兩步</text>
        <Sep x={470} />
        <g opacity={0.35 + 0.65 * nx}><LogoBox id="tel" x={500} y={CT + 10} h={70} a={nx} maxW={150} />
          <FlagBox code="JP" x={690} y={CT + 26} a={nx} /><text x={752} y={CT + 56} style={zh(32, H.text, 900)}>日本</text>
          <text x={500} y={CT + 142} style={zh(40, H.text, 900)}>東京威力科創</text><text x={500} y={CT + 180} style={zh(30, H.text2, 800)}>下一集：設備五大-4</text></g>
        <g opacity={kw} transform={`translate(${W / 2 + 220} 290) rotate(-2) scale(${1 + 0.3 * (1 - kw)})`}>
          <rect x={-200} y={-30} width={400} height={60} fill={H.amber} /><text x={0} y={12} textAnchor="middle" style={zh(34, onC(H.amber), 900)}>留言「科林」拿資料</text>
        </g>
      </svg>
    </Card>
  );
};

export const LamSection: React.FC<P> = (p) => {
  const kd = String((p.o as any).kind);
  if (kd === "lam-hook") return <Hook {...p} />;
  if (kd === "lam-move") return <Move {...p} />;
  if (kd === "lam-stack") return <Stack {...p} />;
  if (kd === "lam-plasma") return <Plasma {...p} />;
  if (kd === "lam-ion") return <Ion {...p} />;
  if (kd === "lam-rad") return <Rad {...p} />;
  if (kd === "lam-wall") return <Wall {...p} />;
  if (kd === "lam-har") return <Har {...p} />;
  if (kd === "lam-cryo") return <Cryo {...p} />;
  if (kd === "lam-ale") return <Ale {...p} />;
  if (kd === "lam-co") return <Co {...p} />;
  if (kd === "lam-next") return <Next {...p} />;
  return null;
};

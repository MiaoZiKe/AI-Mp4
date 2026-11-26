// 2026/11/26 tech-tel：設備五大-4 東京威力科創（批次直立爐管＋塗佈顯影）的 2D 示意卡（overlay `section` 的 kind 以 "tel-" 開頭；Hud.tsx 的 HudSection 轉過來，由 CEO 掛）。
//   tel-hook 接上集：塗光阻 → 顯影 → 蝕刻，誰來塗？（LOGO＋日本國旗＋塗佈顯影約九成）｜tel-tool 批次 vs 單片｜tel-stack 爐管拆開（加熱器、兩層石英管、晶舟、保溫座）｜
//   tel-load 晶圓盒 → 五支叉片 → 晶舟空格｜tel-lift 升降速度曲線｜tel-heat 分區加熱、熱由外往內｜tel-gas 雙層管氣流（噴氣管橫噴 → 內管往上 → 夾縫往下 → 排氣）｜
//   tel-film 薄膜一層層長厚（上下兩面）｜tel-batch 批次的取捨｜tel-coat 旋轉塗佈（轉越快越薄）｜tel-co 公司（LOGO、國旗、財報、低溫蝕刻、台灣真實輪廓＋台南營運中心）｜tel-next 下一集科磊
// 全部示意；時間全部來自 script.json 的 t（cue）。排版原則同 HudLam（card-overlap.mjs 檢查）：內容在 CARD_CONTENT_TOP 以下、字 ≥30px、字不碰圖形。
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
const RED = "#E0472F", OK = "#14A38B", BLUE = "#2F7FE0", WAF = "#B4C2DA", WAF_D = "#7F93B5", HOT = "#F08A3C", QZ = "#7FB6DA", GAS = "#2AA7D6", EXH = "#8E7DB3", FILM = "#2FBF9F", RES = "#C9772E";
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
const Rows: React.FC<{ items: [string, string, number][]; y0?: number; dy?: number }> = ({ items, y0 = CT + 44, dy = 60 }) => (
  <g>{items.map(([t, c, a], i) => <Row key={i} x={500} y={y0 + i * dy} t={t} c={c} a={a} />)}</g>
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
/** 爐管剖面小圖：加熱器（橙）、外管（頂封）、內管（頂開）、晶舟上的晶圓；sp＝拆開距離 */
const Furnace: React.FC<{ x: number; y: number; w: number; h: number; n?: number; hot?: number; sp?: number; hi?: number }> = ({ x, y, w, h, n = 16, hot = 0, sp = 0, hi = -1 }) => {
  const cx = x + w / 2, a = (i: number) => (hi < 0 || hi === i ? 1 : 0.3);
  return (
    <g>
      <g opacity={a(0)}><rect x={x - sp} y={y} width={14} height={h} fill={HOT} opacity={0.35 + 0.65 * hot} /><rect x={x + w - 14 + sp} y={y} width={14} height={h} fill={HOT} opacity={0.35 + 0.65 * hot} /></g>
      <g opacity={a(1)}><path d={`M${x + 24} ${y + h - 6} L${x + 24} ${y + 10 - sp * 0.6} L${x + w - 24} ${y + 10 - sp * 0.6} L${x + w - 24} ${y + h - 6}`} stroke={QZ} strokeWidth={4} fill="none" />
        <line x1={x + 36} y1={y + h - 6} x2={x + 36} y2={y + 30} stroke={QZ} strokeWidth={3} /><line x1={x + w - 36} y1={y + h - 6} x2={x + w - 36} y2={y + 30} stroke={QZ} strokeWidth={3} /></g>
      <g opacity={a(2)}>{Array.from({ length: n }, (_, i) => <line key={i} x1={x + 46} x2={x + w - 46} y1={y + 40 + ((h - 56) * i) / (n - 1)} y2={y + 40 + ((h - 56) * i) / (n - 1)} stroke={WAF_D} strokeWidth={3} />)}</g>
      <g opacity={a(3)}><rect x={cx - (w - 60) / 2} y={y + h - 4 + sp * 0.5} width={w - 60} height={12} fill={H.text2} /></g>
    </g>
  );
};

// ── tel-hook ──
const Hook: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330;
  const pv = on(f, T(o, "prev")), who = on(f, T(o, "who")), tl = on(f, T(o, "tel")), nn = on(f, T(o, "nine"));
  const box = (x: number, t: string, hi: boolean) => (
    <g><rect x={x} y={CT + 40} width={118} height={70} fill={hi ? "#FFF4DA" : "#FFFFFF"} stroke={hi ? H.amber : H.lineSoft} strokeWidth={hi ? 4 : 2} />
      <text x={x + 59} y={CT + 86} textAnchor="middle" style={zh(30, H.text, 900)}>{t}</text></g>);
  const q = 1 + 0.12 * Math.sin(f * 0.3) * who;
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        <g opacity={0.45 + 0.55 * pv}>
          {box(24, "塗光阻", true)}<Arrow x1={146} y1={CT + 75} x2={172} y2={CT + 75} c={H.text2} w={4} />
          {box(176, "顯影", false)}<Arrow x1={298} y1={CT + 75} x2={324} y2={CT + 75} c={H.text2} w={4} />
          {box(328, "蝕刻", false)}
        </g>
        <g transform={`translate(83 ${CT + 184}) scale(${q})`} opacity={0.3 + 0.7 * who}><circle r={34} fill={H.amber} /><text y={16} textAnchor="middle" style={zh(46, onC(H.amber), 900)}>?</text></g>
        <text x={136} y={CT + 196} style={zh(30, H.text2, 800)}>上集：光阻要先塗好</text>
        <Sep x={470} />
        <g opacity={0.35 + 0.65 * tl}><LogoBox id="tel" x={500} y={CT + 6} h={70} a={tl} maxW={150} />
          <FlagBox code="JP" x={690} y={CT + 22} a={tl} /><text x={752} y={CT + 52} style={zh(32, H.text, 900)}>日本</text></g>
        <g opacity={0.35 + 0.65 * nn}><text x={500} y={CT + 156} style={zh(30, H.text2, 800)}>塗佈顯影機市占</text>
          <text x={730} y={CT + 160} style={zh(46, H.amber, 900)}>約九成</text>
          <text x={500} y={CT + 214} style={zh(30, H.text2, 800)}>91%（2025，引述 Gartner）</text></g>
      </svg>
    </Card>
  );
};

// ── tel-tool：批次（上百片）vs 單片 ──
const Tool: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330;
  const fu = on(f, T(o, "furn")), bt = on(f, T(o, "batch")), ht = on(f, T(o, "heat"));
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        <g opacity={0.4 + 0.6 * fu}><Furnace x={30} y={CT + 12} w={150} h={226} n={20} hot={ht} /></g>
        <g opacity={0.35 + 0.65 * bt}><text x={206} y={CT + 70} style={zh(40, H.amber, 900)}>批次</text><text x={206} y={CT + 116} style={zh(30, H.text, 800)}>一次上百片</text></g>
        <line x1={206} y1={CT + 196} x2={300} y2={CT + 196} stroke={WAF_D} strokeWidth={5} />
        <text x={206} y={CT + 244} style={zh(30, H.text2, 800)}>單片：一次一片</text>
        <Sep x={470} />
        <Rows items={[["直立式爐管", BLUE, fu * (1 - 0.6 * bt)], ["晶舟上疊上百片", H.amber, bt * (1 - 0.6 * ht)], ["整舟一起加熱", OK, ht]]} y0={CT + 64} dy={70} />
      </svg>
    </Card>
  );
};

// ── tel-stack：拆開（剖面示意），念到哪層哪層亮 ──
const Stack: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330;
  const op = on(f, T(o, "open"), 18), cuts = ["heat", "tube", "boat", "cap"].map((n) => T(o, n));
  const now = cuts.filter((t) => f >= t - 4).length - 1, a = (i: number) => (now === i ? 1 : now > i ? 0.55 : 0.3);
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        <Furnace x={150} y={CT + 26} w={170} h={196} n={12} sp={30 * op} hi={now} />
        <text x={24} y={CT + 46} style={zh(30, H.text2, 800)}>剖面</text><text x={24} y={CT + 86} style={zh(30, H.text2, 800)}>示意</text>
        <Sep x={470} />
        <Rows items={[["加熱器（分區）", HOT, a(0)], ["石英管（內外兩層）", QZ, a(1)], ["晶舟＋晶圓", BLUE, a(2)], ["保溫座＋密封蓋", H.text2, a(3)]]} />
      </svg>
    </Card>
  );
};

// ── tel-load：晶圓盒 → 五支叉片 → 晶舟空格 ──
const Load: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330;
  const ar = on(f, T(o, "arm")), fv = on(f, T(o, "five")), tn = on(f, T(o, "turn")), ins = on(f, T(o, "ins"));
  const u = cl((f - T(o, "five")) / Math.max(20, T(o, "ins") + 20 - T(o, "five")));
  const fx = 40, bx = 330, y0 = CT + 16;
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        <rect x={fx} y={y0} width={96} height={170} fill="none" stroke={H.text2} strokeWidth={3} />
        {Array.from({ length: 10 }, (_, i) => <line key={i} x1={fx + 10} x2={fx + 86} y1={y0 + 14 + i * 16} y2={y0 + 14 + i * 16} stroke={i < 5 ? (u > 0.05 ? H.lineSoft : H.amber) : WAF_D} strokeWidth={4} />)}
        <text x={fx} y={y0 + 214} style={zh(30, H.text2, 800)}>晶圓盒</text>
        <g transform={`translate(${158 + 110 * u} ${y0 + 40 - 10 * Math.sin(Math.PI * u)})`} opacity={0.35 + 0.65 * fv}>
          {Array.from({ length: 5 }, (_, i) => <line key={i} x1={0} x2={48} y1={i * 12} y2={i * 12} stroke={H.amber} strokeWidth={4} />)}</g>
        <rect x={bx} y={y0 - 10} width={100} height={210} fill="none" stroke={QZ} strokeWidth={3} />
        {Array.from({ length: 13 }, (_, i) => { const gap = i >= 2 && i < 5; return gap && ins < 0.5 ? null : <line key={i} x1={bx + 10} x2={bx + 90} y1={y0 + 4 + i * 15} y2={y0 + 4 + i * 15} stroke={gap ? H.amber : WAF_D} strokeWidth={4} />; })}
        <text x={bx} y={y0 + 234} style={zh(30, H.text2, 800)}>晶舟</text>
        <text x={160} y={y0 + 234} style={zh(30, H.amber, 900)} opacity={0.35 + 0.65 * fv}>五片一趟</text>
        <Sep x={470} />
        <Rows items={[["從晶圓盒取片", BLUE, ar * (1 - 0.6 * fv)], ["一次五片", H.amber, fv * (1 - 0.6 * tn)], ["轉身、升到那一格", BLUE, tn * (1 - 0.6 * ins)], ["插進晶舟空格", OK, ins]]} />
      </svg>
    </Card>
  );
};

// ── tel-lift：升降速度曲線 sin²（兩端 0），點跟著時間走 ──
const Lift: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330;
  const sh = on(f, T(o, "shut")), ac = on(f, T(o, "acc")), dc = on(f, T(o, "dec")), pu = on(f, T(o, "push"));
  const x0 = 44, x1 = 404, yb = CT + 190, hA = 140, v = (u: number) => Math.sin(Math.PI * u) ** 2;
  const path = Array.from({ length: 41 }, (_, i) => { const u = i / 40; return `${i ? "L" : "M"}${x0 + (x1 - x0) * u} ${yb - hA * v(u)}`; }).join(" ");
  const a0 = T(o, "acc") - 6, u = cl((f - a0) / 60);
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        <line x1={x0} y1={yb} x2={x1 + 10} y2={yb} stroke={H.text2} strokeWidth={3} />
        <line x1={x0} y1={yb} x2={x0} y2={yb - hA - 14} stroke={H.text2} strokeWidth={3} />
        <text x={x0 + 14} y={CT + 34} style={zh(30, H.text2, 800)}>上升速度</text>
        <path d={path} stroke={BLUE} strokeWidth={5} fill="none" opacity={0.4 + 0.6 * ac} />
        <circle cx={x0 + (x1 - x0) * u} cy={yb - hA * v(u)} r={12} fill={H.amber} stroke="#FFFFFF" strokeWidth={3} opacity={f >= a0 ? 1 : 0.3} />
        <text x={x0 + 10} y={yb + 44} style={zh(30, H.text2, 800)} opacity={0.4 + 0.6 * ac}>加速</text>
        <text x={x1 - 76} y={yb + 44} style={zh(30, H.text2, 800)} opacity={0.4 + 0.6 * dc}>減速</text>
        <text x={x0 + 140} y={yb + 44} style={zh(30, H.text2, 800)}>時間 →</text>
        <Sep x={470} />
        <Rows items={[["爐口擋板滑開", BLUE, sh * (1 - 0.6 * ac)], ["先加速", H.amber, ac * (1 - 0.6 * dc)], ["再減速、停穩", H.amber, dc * (1 - 0.6 * pu)], ["整舟進到爐管", OK, pu]]} />
      </svg>
    </Card>
  );
};

// ── tel-heat：分區溫度條往同一條線收斂；外 → 內 ──
const Heat: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330;
  const zn = on(f, T(o, "zone")), ot = on(f, T(o, "out")), wf = on(f, T(o, "wafer"));
  const u = cl((f - T(o, "zone")) / 70), tgt = 250, start = [120, 190, 210, 175, 95];
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        <text x={24} y={CT + 34} style={zh(30, H.text2, 800)}>各區溫度（示意）</text>
        {start.map((s0, i) => { const y = CT + 52 + i * 40, len = s0 + (tgt - s0) * EASE.move(u) * zn;
          return <g key={i} opacity={0.4 + 0.6 * zn}><text x={24} y={y + 20} style={zh(30, H.text, 900)}>{`第${5 - i}區`}</text>
            <rect x={140} y={y} width={len} height={24} fill={HOT} opacity={0.5 + 0.5 * wf} /></g>; })}
        <line x1={140 + tgt} y1={CT + 50} x2={140 + tgt} y2={CT + 290} stroke={OK} strokeWidth={3} strokeDasharray="8 6" opacity={0.3 + 0.7 * u} />
        <Sep x={470} />
        <Rows items={[["加熱器分好幾區", HOT, zn * (1 - 0.6 * ot)], ["熱從外往裡傳", H.amber, ot * (1 - 0.6 * wf)], ["最後才到晶圓", OK, wf]]} y0={CT + 64} dy={70} />
        <Check x={740} y={CT + 238} o={wf} /><text x={780} y={CT + 250} style={zh(30, H.text2, 800)} opacity={0.3 + 0.7 * wf}>一樣熱</text>
      </svg>
    </Card>
  );
};

// ── tel-gas：雙層管氣流剖面 ──
const Gas: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330;
  const ij = on(f, T(o, "inj")), cr = on(f, T(o, "cross")), dn = on(f, T(o, "down"));
  const x0 = 90, x1 = 380, yt = CT + 10, yb = CT + 196, ix0 = 110, ix1 = 360;
  const dots = (n: number, fn: (u: number) => [number, number], c: string, a: number, sp = 0.012) => Array.from({ length: n }, (_, i) => { const [x, y] = fn(fr(f * sp + i / n)); return <circle key={i} cx={x} cy={y} r={6} fill={c} opacity={a} />; });
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        <path d={`M${x0} ${yb} L${x0} ${yt} L${x1} ${yt} L${x1} ${yb}`} stroke={QZ} strokeWidth={4} fill="none" />
        <line x1={ix0} y1={yb} x2={ix0} y2={yt + 34} stroke={QZ} strokeWidth={3} /><line x1={ix1} y1={yb} x2={ix1} y2={yt + 34} stroke={QZ} strokeWidth={3} />
        {Array.from({ length: 7 }, (_, i) => <line key={i} x1={150} x2={340} y1={yt + 56 + i * 18} y2={yt + 56 + i * 18} stroke={WAF_D} strokeWidth={3} />)}
        <rect x={126} y={yt + 50} width={8} height={yb - yt - 50} fill={GAS} opacity={0.4 + 0.6 * ij} />
        <g opacity={0.3 + 0.7 * cr}>{Array.from({ length: 6 }, (_, i) => <circle key={i} cx={140 + 196 * fr(f * 0.02 + i * 0.37)} cy={yt + 65 + i * 18} r={6} fill={GAS} />)}</g>
        {dots(4, (u) => [130, yb - (yb - yt - 50) * u], GAS, ij)}
        {dots(4, (u) => [ix1 + 10, yt + 34 + (yb - yt - 34) * u], EXH, dn)}
        <Arrow x1={x1 + 4} y1={yb - 6} x2={x1 + 50} y2={yb - 6} c={EXH} w={5} o={0.3 + 0.7 * dn} />
        <text x={24} y={yb + 46} style={zh(30, H.text2, 800)}>噴氣管</text><text x={300} y={yb + 46} style={zh(30, H.text2, 800)}>排氣</text>
        <Sep x={470} />
        <Rows items={[["噴氣管往上送氣", GAS, ij * (1 - 0.6 * cr)], ["小孔橫著掃過晶圓", GAS, cr * (1 - 0.6 * dn)], ["內外管夾縫往下", EXH, dn]]} y0={CT + 64} dy={70} />
      </svg>
    </Card>
  );
};

// ── tel-film：晶圓剖面上下兩面一層層長膜 ──
const Film: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330;
  const rc = on(f, T(o, "react")), fm = on(f, T(o, "film")), al = on(f, T(o, "all"));
  const nL = Math.min(6, Math.max(0, Math.floor((f - T(o, "react") - 4) / 16) + 1)), y = CT + 130, x = 40, w = 380;
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        <rect x={x} y={y} width={w} height={30} fill={WAF} stroke={WAF_D} strokeWidth={2} />
        {Array.from({ length: nL }, (_, i) => <g key={i}><rect x={x} y={y - 8 * (i + 1)} width={w} height={7} fill={FILM} opacity={0.55 + 0.07 * i} /><rect x={x} y={y + 31 + 8 * i} width={w} height={7} fill={FILM} opacity={0.55 + 0.07 * i} /></g>)}
        <text x={x} y={CT + 40} style={zh(30, H.text2, 800)}>晶圓剖面（放大示意）</text>
        <text x={x} y={CT + 248} style={zh(30, H.text, 900)} opacity={0.35 + 0.65 * fm}>{`上下兩面都長膜：第 ${Math.max(1, nL)} 層`}</text>
        <Sep x={470} />
        <Rows items={[["氣體在表面反應", GAS, rc * (1 - 0.6 * fm)], ["薄膜一層層長厚", FILM, fm * (1 - 0.6 * al)], ["上百片一起長", OK, al]]} y0={CT + 64} dy={70} />
      </svg>
    </Card>
  );
};

// ── tel-batch：批次 vs 單片的取捨 ──
const Batch: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330;
  const ef = on(f, T(o, "eff")), bd = on(f, T(o, "bad")), bt = on(f, T(o, "boat"));
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        <rect x={50} y={CT + 10} width={130} height={190} fill="none" stroke={bd > 0.5 ? RED : QZ} strokeWidth={bd > 0.5 ? 5 : 3} />
        {Array.from({ length: 12 }, (_, i) => <line key={i} x1={62} x2={168} y1={CT + 24 + i * 15} y2={CT + 24 + i * 15} stroke={bt > 0.5 ? RED : WAF_D} strokeWidth={4} />)}
        <text x={64} y={CT + 248} style={zh(30, H.text, 900)}>批次</text>
        <line x1={280} y1={CT + 120} x2={400} y2={CT + 120} stroke={WAF_D} strokeWidth={5} />
        <text x={290} y={CT + 248} style={zh(30, H.text, 900)}>單片</text>
        <Sep x={470} />
        <Rows items={[["一次上百片，效率高", OK, ef * (1 - 0.6 * bd)], ["但一爐出問題", RED, bd * (1 - 0.6 * bt)], ["整舟一起受影響", RED, bt]]} y0={CT + 64} dy={70} />
      </svg>
    </Card>
  );
};

// ── tel-coat：旋轉塗佈，厚度隨轉速下降（教科書通則，定性） ──
const Coat: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330;
  const bk = on(f, T(o, "back")), dr = on(f, T(o, "drop")), sp = on(f, T(o, "spin")), th = on(f, T(o, "thin"));
  const x0 = 60, x1 = 420, yb = CT + 196, yt = CT + 50, c = (u: number) => yt + 20 + (yb - yt - 30) * (1 - 1 / Math.sqrt(1 + 8 * u));
  const path = Array.from({ length: 41 }, (_, i) => { const u = i / 40; return `${i ? "L" : "M"}${x0 + (x1 - x0) * u} ${c(u)}`; }).join(" ");
  const u = cl((f - T(o, "thin") + 10) / 40);
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        <line x1={x0} y1={yb} x2={x1 + 10} y2={yb} stroke={H.text2} strokeWidth={3} />
        <line x1={x0} y1={yb} x2={x0} y2={yt} stroke={H.text2} strokeWidth={3} />
        <text x={x0 + 14} y={CT + 34} style={zh(30, H.text2, 800)}>膜厚（示意）</text>
        <path d={path} stroke={RES} strokeWidth={5} fill="none" opacity={0.3 + 0.7 * th} />
        <circle cx={x0 + (x1 - x0) * u} cy={c(u)} r={11} fill={H.amber} stroke="#FFFFFF" strokeWidth={3} opacity={0.3 + 0.7 * th} />
        <text x={x0 + 150} y={yb + 44} style={zh(30, H.text2, 800)}>轉速 →</text>
        <Sep x={470} />
        <Rows items={[["回到塗佈顯影", BLUE, bk * (1 - 0.6 * dr)], ["光阻滴在中央", RES, dr * (1 - 0.6 * sp)], ["一轉就甩成薄膜", H.amber, sp * (1 - 0.6 * th)], ["轉越快越薄", OK, th]]} />
      </svg>
    </Card>
  );
};

// ── tel-co：公司＋真實輪廓台灣地圖（新竹、台中、台南營運中心、高雄） ──
const TW_PATH = "M180.3 82.0 L192.0 91.6 L202.6 99.9 L207.3 100.6 L197.3 110.2 L199.1 127.4 L195.6 136.4 L185.0 166.5 L179.1 190.8 L170.9 222.8 L157.4 245.2 L142.8 271.4 L139.9 299.6 L132.8 297.7 L125.2 270.2 L116.4 263.8 L105.8 253.5 L98.8 229.8 L94.7 219.6 L98.8 204.9 L101.7 179.3 L113.5 162.0 L119.3 147.9 L129.3 133.2 L144.0 112.7 L153.3 99.3 L172.1 89.7Z";
const geo = (lat: number, lon: number) => [180.3 + (lon - 121.54) * 58.6, 82 + (25.30 - lat) * 64];
const Co: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 360;
  const jp = on(f, T(o, "jp")), cr = on(f, T(o, "cryo")), tn = on(f, T(o, "tn")), rp = on(f, T(o, "rep"));
  const S = 1.05, OX = 470, OY = 0, pt = (la: number, lo: number) => { const [x, y] = geo(la, lo); return [OX + x * S, OY + y * S]; };
  const sites: [string, number, number, number, boolean][] = [["新竹", 24.78, 121.0, CT + 50, false], ["台中", 24.21, 120.62, CT + 104, false], ["台南營運中心", 23.10, 120.27, CT + 158, true], ["高雄", 22.62, 120.31, CT + 262, false]];
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        <LogoBox id="tel" x={28} y={CT + 6} h={64} a={jp} maxW={140} />
        <FlagBox code="JP" x={210} y={CT + 20} a={jp} /><text x={272} y={CT + 50} style={zh(32, H.text, 900)} opacity={0.4 + 0.6 * jp}>日本</text>
        <g opacity={0.35 + 0.65 * jp}><text x={28} y={CT + 124} style={zh(30, H.text2, 800)}>2025 財年營收（財報）</text>
          <text x={28} y={CT + 170} style={zh(40, H.text, 900)}>約 2.4 兆日圓</text></g>
        <g opacity={0.35 + 0.65 * cr}><text x={28} y={CT + 226} style={zh(30, H.text2, 800)}>低溫蝕刻（公司論文）</text>
          <text x={28} y={CT + 272} style={zh(40, H.amber, 900)}>零下 70°C</text></g>
        <Sep x={470} y1={346} />
        <path d={TW_PATH} transform={`translate(${OX} ${OY}) scale(${S})`} fill={OK} opacity={0.3 + 0.35 * tn} stroke={OK} strokeWidth={3 / S} strokeLinejoin="round" />
        {sites.map(([n, la, lo, ty, hi], i) => { const [x, y] = pt(la, lo), a = hi ? tn : cl((f - T(o, "tn") - 8 - i * 5) / 8);
          return <g key={n} opacity={0.35 + 0.65 * a}><circle cx={x} cy={y} r={(hi ? 11 : 7) * (1 + 0.25 * a * Math.sin(f * 0.25 + i))} fill={hi ? H.amber : H.text2} />
            <line x1={x + 10} y1={y} x2={714} y2={ty - 10} stroke={H.text2} strokeWidth={2} /><text x={722} y={ty} style={zh(30, hi ? H.text : H.text2, 900)}>{n}</text></g>; })}
        <g opacity={0.35 + 0.65 * rp}><text x={722} y={CT + 196} style={zh(30, H.text2, 800)}>2024 開幕</text><text x={722} y={CT + 232} style={zh(30, H.amber, 900)}>零件就近維修</text></g>
        <FlagBox code="TW" x={526} y={CT + 250} a={tn} />
      </svg>
    </Card>
  );
};

// ── tel-next：塗佈 → 爐管 → 蝕刻都做完，做對了嗎？下一集科磊（量測檢測）＋美國國旗；留言關鍵字 ──
const Next: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330;
  const ck = on(f, T(o, "chk")), nx = on(f, T(o, "next")), kw = on(f, T(o, "kw"), 8);
  const box = (x: number, t: string) => <g><rect x={x} y={CT + 30} width={118} height={70} fill="#FFFFFF" stroke={H.lineSoft} strokeWidth={2} /><text x={x + 59} y={CT + 76} textAnchor="middle" style={zh(30, H.text, 900)}>{t}</text></g>;
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        {box(24, "塗佈")}<Arrow x1={146} y1={CT + 65} x2={172} y2={CT + 65} c={H.text2} w={4} />
        {box(176, "爐管")}<Arrow x1={298} y1={CT + 65} x2={324} y2={CT + 65} c={H.text2} w={4} />
        {box(328, "蝕刻")}
        <g opacity={0.3 + 0.7 * ck}><circle cx={60} cy={CT + 168} r={30} fill={H.amber} /><text x={60} y={CT + 182} textAnchor="middle" style={zh(40, onC(H.amber), 900)}>?</text>
          <text x={110} y={CT + 180} style={zh(32, H.text, 900)}>每一步都做對了嗎？</text></g>
        <Sep x={470} />
        <g opacity={0.35 + 0.65 * nx}>
          {hasLogo("kla") ? <LogoBox id="kla" x={500} y={CT + 10} h={70} a={nx} maxW={170} />
            : <g><rect x={500} y={CT + 10} width={170} height={82} fill="#FFFFFF" stroke={nx > 0.5 ? H.amber : H.lineSoft} strokeWidth={nx > 0.5 ? 4 : 1.5} /><text x={585} y={CT + 66} textAnchor="middle" style={zh(40, H.text, 900)}>KLA</text></g>}
          <FlagBox code="US" x={700} y={CT + 32} a={nx} /><text x={762} y={CT + 62} style={zh(32, H.text, 900)}>美國</text>
          <text x={500} y={CT + 136} style={zh(40, H.text, 900)}>科磊</text><text x={600} y={CT + 134} style={zh(30, H.text2, 800)}>量測與檢測</text>
          <text x={500} y={CT + 182} style={zh(30, H.text2, 800)}>下一集：設備五大-5</text></g>
        <g opacity={kw} transform={`translate(${W / 2 + 230} 290) rotate(-2) scale(${1 + 0.3 * (1 - kw)})`}>
          <rect x={-220} y={-28} width={440} height={56} fill={H.amber} /><text x={0} y={12} textAnchor="middle" style={zh(32, onC(H.amber), 900)}>留言「東京威力」拿資料</text>
        </g>
      </svg>
    </Card>
  );
};

export const TelSection: React.FC<P> = (p) => {
  const kd = String((p.o as any).kind);
  if (kd === "tel-hook") return <Hook {...p} />;
  if (kd === "tel-tool") return <Tool {...p} />;
  if (kd === "tel-stack") return <Stack {...p} />;
  if (kd === "tel-load") return <Load {...p} />;
  if (kd === "tel-lift") return <Lift {...p} />;
  if (kd === "tel-heat") return <Heat {...p} />;
  if (kd === "tel-gas") return <Gas {...p} />;
  if (kd === "tel-film") return <Film {...p} />;
  if (kd === "tel-batch") return <Batch {...p} />;
  if (kd === "tel-coat") return <Coat {...p} />;
  if (kd === "tel-co") return <Co {...p} />;
  if (kd === "tel-next") return <Next {...p} />;
  return null;
};

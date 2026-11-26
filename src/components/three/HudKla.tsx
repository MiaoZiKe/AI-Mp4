// 2026/11/26 tech-kla：設備五大-5 KLA（量測檢測）的 2D 示意卡（overlay `section` 的 kind 以 "kla-" 開頭，Hud.tsx 的 HudSection 轉過來）。
//   kla-hook 接上集：圖案做好了，有沒有做壞？→ KLA｜kla-tour 拆開檢測機（光源 → 物鏡 → 晶圓台 → 運算櫃）｜kla-load 晶圓怎麼送進去（取出、找缺口、放上、吸住）｜
//   kla-src 寬頻電漿光源（雷射點燃電漿、寬頻光、濾片選波段）｜kla-bf 明場側視（垂直照、收反射、缺陷處變暗）｜kla-df 暗場側視（斜射、鏡面反射進擋板、只收散射）｜
//   kla-scan 蛇行掃描＋速度（加速、等速、減速）｜kla-cmp 相鄰晶粒相減｜kla-ovl 框中框疊對｜kla-film 橢圓偏光膜厚｜kla-co 公司（LOGO、國旗、真實輪廓台灣地圖）｜kla-next 下一集
// 全部示意，不標未查證的數字；結構一開始就畫出，念到時該處亮起、動起來；時間全部來自 script.json 的 t（cue）。
// 排版原則（card-overlap.mjs 檢查）：內容從 CARD_CONTENT_TOP 以下；字不放進會動的圖形範圍；字 ≥30px；字離圖形 ≥6px。
import React from "react";
import { FONT_ZH } from "../../theme";
import { H, L, CARD_HEAD, CARD_CONTENT_TOP, cardTitleBox } from "./hudSkin";
import { EASE, tween } from "../anim";
import type { Model3D, Overlay3D, State3D } from "./engine";
import { Flag, LogoSvg, hasLogo, logoW } from "./Brand";

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
const RED = "#E0472F", OK = "#14A38B", BLUE = "#2F7FE0", WAF = "#B4C2DA", WAF_D = "#7F93B5", LIGHT = "#5BB8F0", DF = "#E8A317", DIE = "#7FA4E0", COR = "#E8613C", TEAL = "#2A7F8F", FILM = "#2BA39A";
const Sep: React.FC<{ x: number; y0?: number; y1?: number }> = ({ x, y0 = CT + 4, y1 = 316 }) => <line x1={x} y1={y0} x2={x} y2={y1} stroke={H.lineSoft} strokeWidth={3} />;
const Arrow: React.FC<{ x1: number; y1: number; x2: number; y2: number; c: string; w?: number; o?: number }> = ({ x1, y1, x2, y2, c, w = 5, o = 1 }) => {
  const a = Math.atan2(y2 - y1, x2 - x1), s = w * 2.6;
  return <g opacity={o}><path d={`M${x1} ${y1} L${x2 - Math.cos(a) * s * 0.8} ${y2 - Math.sin(a) * s * 0.8}`} stroke={c} strokeWidth={w} />
    <path d={`M${x2} ${y2} L${x2 - Math.cos(a) * s - Math.sin(a) * s * 0.6} ${y2 - Math.sin(a) * s + Math.cos(a) * s * 0.6} L${x2 - Math.cos(a) * s + Math.sin(a) * s * 0.6} ${y2 - Math.sin(a) * s - Math.cos(a) * s * 0.6} Z`} fill={c} /></g>;
};
const Check: React.FC<{ x: number; y: number; o?: number }> = ({ x, y, o = 1 }) => <path opacity={o} d={`M${x - 18} ${y} l12 12 l26 -28`} stroke={OK} strokeWidth={7} fill="none" />;
const Row: React.FC<{ x: number; y: number; t: string; c: string; a: number; px?: number }> = ({ x, y, t, c, a, px = 30 }) => (
  <g opacity={0.35 + 0.65 * a}><rect x={x} y={y - px * 0.72} width={12} height={px * 0.72} fill={c} /><text x={x + 24} y={y} style={zh(px, H.text, 900)}>{t}</text></g>
);
const LogoBox: React.FC<{ id: string; x: number; y: number; h: number; a: number; maxW?: number }> = ({ id, x, y, h, a, maxW = 260 }) => {
  if (!hasLogo(id)) return <g><rect x={x} y={y} width={maxW} height={h + 12} fill="#FFFFFF" stroke={a > 0.5 ? H.amber : H.lineSoft} strokeWidth={a > 0.5 ? 4 : 1.5} />
    <text x={x + 14} y={y + h * 0.78} style={zh(Math.round(h * 0.7), "#3B0A7A", 900)}>KLA</text></g>;
  const lw = Math.min(maxW, logoW(id, h)), lh = (h * lw) / logoW(id, h);
  return <g><rect x={x} y={y} width={lw + 16} height={h + 12} fill="#FFFFFF" stroke={a > 0.5 ? H.amber : H.lineSoft} strokeWidth={a > 0.5 ? 4 : 1.5} />
    <LogoSvg id={id} x={x + 8} y={y + 6 + (h - lh) / 2} h={lh} /></g>;
};
const FlagBox: React.FC<{ code: string; x: number; y: number; a: number }> = ({ code, x, y, a }) => (
  <g><rect x={x} y={y} width={50} height={36} fill="none" stroke={a > 0.5 ? H.amber : H.lineSoft} strokeWidth={a > 0.5 ? 4 : 1.5} /><Flag code={code} h={28} x={x + 4} y={y + 4} asSvg /></g>
);
const rnd = (i: number) => fr(Math.sin(i * 12.9898 + 4.1) * 43758.5453);
const ease = (u: number) => EASE.move(cl(u));
/** 俯視晶圓（晶粒格），可帶一顆缺陷 */
const WaferTop: React.FC<{ cx: number; cy: number; r: number; def?: number; dieOp?: number }> = ({ cx, cy, r, def = 0, dieOp = 1 }) => {
  const s = r / 4.4, dies: [number, number][] = [];
  for (let i = -4; i <= 3; i++) for (let j = -4; j <= 3; j++) { const x = (i + 0.5) * s, y = (j + 0.5) * s; if (Math.hypot(Math.abs(x) + s / 2, Math.abs(y) + s / 2) < r - 2) dies.push([x, y]); }
  return <g><circle cx={cx} cy={cy} r={r} fill={WAF} stroke={WAF_D} strokeWidth={2} />
    {dies.map(([x, y], i) => <rect key={i} x={cx + x - s / 2 + 1.5} y={cy + y - s / 2 + 1.5} width={s - 3} height={s - 3} fill={DIE} opacity={dieOp} />)}
    <path d={`M${cx - 6} ${cy + r} l6 -8 l6 8 Z`} fill={WAF_D} />
    {def > 0 ? <circle cx={cx + s * 0.6} cy={cy - s * 0.4} r={5} fill={RED} opacity={def} /> : null}</g>;
};

// ── kla-hook：上集做好的晶圓，有沒有做壞？（放大鏡掃過，找到一顆紅點）；右：KLA LOGO＋美國國旗 ──
const Hook: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330;
  const pv = on(f, T(o, "prev")), q = on(f, T(o, "q")), kl = on(f, T(o, "kla"));
  const u = fr((f - T(o, "q")) / 50), mx = 70 + 140 * (0.5 + 0.5 * Math.sin(u * Math.PI * 2)), my = CT + 120 + 40 * Math.cos(u * Math.PI * 2);
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        <g opacity={0.45 + 0.55 * pv}><WaferTop cx={140} cy={CT + 120} r={100} def={q} /></g>
        <g opacity={q}><circle cx={mx} cy={my} r={34} fill="none" stroke={H.text} strokeWidth={5} /><path d={`M${mx + 24} ${my + 24} l26 26`} stroke={H.text} strokeWidth={8} /></g>
        <text x={290} y={CT + 70} style={zh(30, H.text2, 800)} opacity={0.4 + 0.6 * pv}>上集：圖案做好了</text>
        <text x={290} y={CT + 130} style={zh(40, H.text, 900)} opacity={0.35 + 0.65 * q}>有沒有做壞？</text>
        <Sep x={600} />
        <LogoBox id="kla" x={626} y={CT + 30} h={60} a={kl} maxW={290} />
        <g opacity={0.35 + 0.65 * kl}><FlagBox code="US" x={626} y={CT + 132} a={kl} /><text x={692} y={CT + 162} style={zh(32, H.text, 900)}>美國・KLA</text>
          <text x={626} y={CT + 230} style={zh(30, H.text2, 800)}>檢測機一片一片找</text></g>
      </svg>
    </Card>
  );
};

// ── kla-tour：四大模組一路點亮（光源 → 物鏡 → 晶圓台 → 運算櫃），光沿著箭頭走 ──
const Tour: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330;
  const items: [string, string, string, string][] = [["src", "寬頻光源", "發光", DF], ["obj", "物鏡", "放大看", BLUE], ["stage", "晶圓台", "帶晶圓跑", OK], ["pc", "運算櫃", "比對找錯", COR]];
  const a = items.map(([id]) => on(f, T(o, id)));
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        {items.map(([, t, d, c], i) => { const x = 30 + i * 232; return <g key={i} opacity={0.35 + 0.65 * a[i]}>
          <rect x={x} y={CT + 40} width={190} height={120} fill={a[i] > 0.5 ? "#FFF6E0" : "#FFFFFF"} stroke={a[i] > 0.5 ? c : H.lineSoft} strokeWidth={a[i] > 0.5 ? 5 : 2} />
          <text x={x + 95} y={CT + 92} textAnchor="middle" style={zh(32, H.text, 900)}>{t}</text>
          <text x={x + 95} y={CT + 138} textAnchor="middle" style={zh(30, H.text2, 800)}>{d}</text>
          {i < 3 ? <Arrow x1={x + 196} y1={CT + 100} x2={x + 226} y2={CT + 100} c={H.text2} w={4} o={0.4 + 0.6 * a[i + 1]} /> : null}</g>; })}
        <text x={30} y={CT + 222} style={zh(30, H.text2, 800)} opacity={0.4 + 0.6 * a[3]}>拍到的影像，交給電腦比對</text>
        <Check x={500} y={CT + 212} o={a[3]} />
      </svg>
    </Card>
  );
};

// ── kla-load：四步（取出 → 轉一圈找缺口 → 放上晶圓台 → 真空吸住）；左邊小晶圓跟著轉，缺口轉到正下方停 ──
const Load: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330;
  const keys = ["foup", "notch", "put", "vac"], a = keys.map((n) => on(f, T(o, n)));
  const cur = a.reduce((c, v, i) => (v > 0.5 ? i : c), -1);
  const sp = ease((f - T(o, "notch")) / 40), ang = 300 * (1 - sp) + 0 * sp;
  const steps = ["① 手臂從晶圓盒取出", "② 轉一圈，找到缺口", "③ 放上晶圓台", "④ 真空吸住，不會滑"];
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        <g transform={`rotate(${f >= T(o, "notch") ? ang : 300} 150 ${CT + 126})`}><circle cx={150} cy={CT + 126} r={84} fill={WAF} stroke={WAF_D} strokeWidth={3} />
          <path d={`M142 ${CT + 210} l8 -14 l8 14 Z`} fill={H.text} /></g>
        <path d={`M150 ${CT + 226} l-12 18 h24 Z`} fill={RED} opacity={0.4 + 0.6 * a[1]} />
        
        <Sep x={300} />
        {steps.map((t, i) => <Row key={i} x={330} y={CT + 52 + i * 62} t={t} c={cur === i ? H.amber : H.lineSoft} a={a[i]} />)}
      </svg>
    </Card>
  );
};

// ── kla-src：雷射打進燈泡 → 電漿亮球（往外放光）；右：寬頻光譜條＋濾片窗框選一段 ──
const Src: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330;
  const la = on(f, T(o, "laser")), pl = on(f, T(o, "plasma")), br = on(f, T(o, "broad")), fl = on(f, T(o, "filt"));
  const cx = 230, cy = CT + 120, fl0 = 1 + 0.06 * Math.sin(f * 0.9) * pl;
  const win = 410 + 340 * (0.5 + 0.5 * Math.sin((f - T(o, "filt")) / 18)) * (1 - ease((f - T(o, "filt") - 50) / 20)) + 60 * ease((f - T(o, "filt") - 50) / 20);
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        <defs><radialGradient id="klaPl"><stop offset="0" stopColor="#FFFFFF" /><stop offset="0.45" stopColor="#D8CCFF" /><stop offset="1" stopColor="#B9A8FF" stopOpacity="0" /></radialGradient>
          <linearGradient id="klaSp" x1="0" x2="1"><stop offset="0" stopColor="#6A3FD0" /><stop offset="0.3" stopColor="#7B61FF" /><stop offset="0.5" stopColor="#3E8EF7" /><stop offset="0.7" stopColor="#2FBF71" /><stop offset="0.85" stopColor="#F2B632" /><stop offset="1" stopColor="#E5484D" /></linearGradient></defs>
        <rect x={20} y={cy - 8} width={130 * la} height={16} fill="#FF3B3B" opacity={la} />
        <text x={24} y={cy - 26} style={zh(30, H.text2, 800)} opacity={0.4 + 0.6 * la}>雷射</text>
        <circle cx={cx} cy={cy} r={70 * fl0} fill="url(#klaPl)" opacity={pl} />
        <circle cx={cx} cy={cy} r={22} fill="none" stroke={H.text2} strokeWidth={3} />
        {Array.from({ length: 10 }, (_, i) => { const t = (i / 10) * Math.PI * 2, u = fr(f / 20 + i * 0.1); return <line key={i} x1={cx + Math.cos(t) * (40 + 30 * u)} y1={cy + Math.sin(t) * (40 + 30 * u)} x2={cx + Math.cos(t) * (52 + 30 * u)} y2={cy + Math.sin(t) * (52 + 30 * u)} stroke="#B9A8FF" strokeWidth={4} opacity={br * (1 - u)} />; })}
        <text x={30} y={CT + 252} style={zh(30, H.text2, 800)} opacity={0.4 + 0.6 * pl}>電漿：很小、很亮</text>
        <Sep x={380} />
        <text x={410} y={CT + 44} style={zh(30, H.text, 900)} opacity={0.4 + 0.6 * br}>寬頻光：一整段波長</text>
        <rect x={410} y={CT + 80} width={500} height={54} fill="url(#klaSp)" opacity={0.3 + 0.7 * br} />
        <g opacity={fl}><rect x={win} y={CT + 72} width={110} height={70} fill="none" stroke={H.text} strokeWidth={5} />
          <rect x={410} y={CT + 80} width={Math.max(0, win - 410)} height={54} fill="#FFFFFF" opacity={0.55} /><rect x={win + 110} y={CT + 80} width={Math.max(0, 910 - win - 110)} height={54} fill="#FFFFFF" opacity={0.55} /></g>
        <text x={410} y={CT + 184} style={zh(30, H.text2, 800)}>深紫外</text><text x={600} y={CT + 184} style={zh(30, H.text2, 800)}>紫外</text><text x={790} y={CT + 184} style={zh(30, H.text2, 800)}>可見光</text>
        <text x={410} y={CT + 244} style={zh(30, H.text, 900)} opacity={0.4 + 0.6 * fl}>濾片：挑出要的一段</text>
      </svg>
    </Card>
  );
};

// ── kla-bf：明場側視：光垂直往下 → 平面鏡面反射回來（亮）；缺陷（凹坑）處反射被打散 → 回來的變暗 ──
const Bf: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330;
  const dn = on(f, T(o, "down")), rf = on(f, T(o, "refl")), dk = on(f, T(o, "dark"));
  const sY = CT + 200, xs = [120, 330];
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        <rect x={40} y={sY} width={400} height={30} fill={WAF} stroke={WAF_D} strokeWidth={2} />
        <path d={`M${xs[1] - 22} ${sY} q22 26 44 0`} fill={H.cardCompare} stroke={WAF_D} strokeWidth={2} />
        {xs.map((x, i) => <g key={i}>
          <path d={`M${x - 46} ${CT + 10} L${x - 6} ${sY - 2} L${x + 6} ${sY - 2} L${x + 46} ${CT + 10} Z`} fill={LIGHT} opacity={0.35 * dn} />
          <Arrow x1={x - 14} y1={CT + 14 + 60 * fr(f / 40)} x2={x - 14} y2={CT + 64 + 60 * fr(f / 40)} c={BLUE} w={5} o={dn} />
          <Arrow x1={x + 14} y1={sY - 60 - 60 * fr(f / 40)} x2={x + 14} y2={sY - 110 - 60 * fr(f / 40)} c={i ? "#9FB3CC" : OK} w={i ? 3 : 6} o={rf * (i ? 1 - 0.65 * dk : 1)} />
          {i ? <g opacity={rf}>{[-50, 50].map((d) => <Arrow key={d} x1={x} y1={sY - 6} x2={x + d} y2={sY - 46} c="#9FB3CC" w={3} />)}</g> : null}</g>)}
        <Sep x={480} />
        <Row x={510} y={CT + 60} t="正常：反射回來，亮" c={OK} a={rf} />
        <Row x={510} y={CT + 130} t="缺陷：反射打散，變暗" c={RED} a={dk} />
        <text x={510} y={CT + 210} style={zh(30, H.text2, 800)} opacity={0.4 + 0.6 * dk}>小顆粒不容易看出來</text>
      </svg>
    </Card>
  );
};

// ── kla-df：暗場側視：斜射光 → 鏡面反射進擋板；缺陷把光散向四面八方，只有往上的進物鏡 ──
const Df: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330;
  const ti = on(f, T(o, "tilt")), bl = on(f, T(o, "block")), sc = on(f, T(o, "scat"));
  const sY = CT + 210, px = 240;
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        <rect x={40} y={sY} width={420} height={28} fill={WAF} stroke={WAF_D} strokeWidth={2} />
        <path d={`M${px - 30} ${CT + 6} L${px - 10} ${CT + 70} L${px + 10} ${CT + 70} L${px + 30} ${CT + 6} Z`} fill={H.text2} />
        <path d={`M${px - 10} ${CT + 74} L${px - 3} ${sY - 4} L${px + 3} ${sY - 4} L${px + 10} ${CT + 74} Z`} fill={DF} opacity={0.3 * sc} />
        <Arrow x1={60} y1={CT + 120} x2={px - 8} y2={sY - 6} c={DF} w={6} o={ti} />
        <Arrow x1={px + 8} y1={sY - 6} x2={400} y2={CT + 126} c={DF} w={6} o={bl} />
        <rect x={404} y={CT + 96} width={44} height={44} fill={H.text} opacity={0.3 + 0.7 * bl} />
        <circle cx={px} cy={sY - 6} r={7} fill={RED} />
        {Array.from({ length: 7 }, (_, i) => { const t = Math.PI * (1.08 + i * 0.14), u = fr(f / 22 + i * 0.17); return <line key={i} x1={px + Math.cos(t) * (12 + 50 * u)} y1={sY - 6 + Math.sin(t) * (12 + 50 * u)} x2={px + Math.cos(t) * (24 + 50 * u)} y2={sY - 6 + Math.sin(t) * (24 + 50 * u)} stroke={DF} strokeWidth={4} opacity={sc * (1 - u)} />; })}
        <Sep x={490} />
        <Row x={520} y={CT + 50} t="斜著打光" c={DF} a={ti} />
        <Row x={520} y={CT + 112} t="鏡面反射 → 擋板吃掉" c={H.text2} a={bl} />
        <Row x={520} y={CT + 174} t="散射光 → 進物鏡" c={RED} a={sc} />
        <text x={520} y={CT + 242} style={zh(30, H.text2, 800)} opacity={0.4 + 0.6 * sc}>背景黑、缺陷亮</text>
      </svg>
    </Card>
  );
};

// ── kla-scan：左：晶圓上蛇行路徑一條條畫出、光點跟著走；右：速度–時間（梯形：加速、等速、減速），游標同步 ──
const Scan: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330;
  const sc = on(f, T(o, "scan")), sl = on(f, T(o, "slow")), tu = on(f, T(o, "turn")), fa = on(f, T(o, "fast"));
  const cx = 150, cy = CT + 130, r = 110, lanes = [-60, -20, 20, 60];
  const per = 48, n = Math.max(0, f - T(o, "scan") + 14), li = Math.min(lanes.length - 1, Math.floor(n / per)), u = cl((n - li * per) / 38);
  const xe = (lane: number) => Math.sqrt(Math.max(0, r * r - lane * lane)) - 12;
  const pos = (lane: number, uu: number, dir: number) => cx + dir * (-xe(lane) + 2 * xe(lane) * ease(uu));
  const dir = li % 2 ? -1 : 1, dx = pos(lanes[li], u, dir), dy = cy + lanes[li];
  const gx = 470, gy = CT + 180, gw = 420, gh = 120, tr = [0, 0.22, 0.78, 1];
  const vt = (t: number) => (t < tr[1] ? t / tr[1] : t < tr[2] ? 1 : (1 - t) / (1 - tr[2]));
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        <circle cx={cx} cy={cy} r={r} fill={WAF} stroke={WAF_D} strokeWidth={2} />
        {lanes.slice(0, li + 1).map((ln, i) => { const d = i % 2 ? -1 : 1, x0 = pos(ln, 0, d), x1 = i < li ? pos(ln, 1, d) : dx;
          return <g key={i}><line x1={x0} y1={cy + ln} x2={x1} y2={cy + ln} stroke={BLUE} strokeWidth={14} opacity={0.35 * sc} />
            {i < li ? <path d={`M${pos(ln, 1, d)} ${cy + ln} q${d * 22} 20 0 40`} stroke={DF} strokeWidth={4} fill="none" opacity={sc} /> : null}</g>; })}
        <circle cx={dx} cy={dy} r={10} fill="#FFFFFF" stroke={BLUE} strokeWidth={4} opacity={sc} />
        <Sep x={300} />
        <line x1={gx} y1={gy} x2={gx + gw} y2={gy} stroke={H.text2} strokeWidth={3} /><line x1={gx} y1={gy} x2={gx} y2={gy - gh - 10} stroke={H.text2} strokeWidth={3} />
        <path d={`M${gx} ${gy} L${gx + gw * tr[1]} ${gy - gh} L${gx + gw * tr[2]} ${gy - gh} L${gx + gw} ${gy}`} stroke={BLUE} strokeWidth={5} fill="none" opacity={0.4 + 0.6 * sc} />
        <circle cx={gx + gw * u} cy={gy - gh * vt(u)} r={9} fill={H.amber} opacity={sc} />
        <text x={330} y={gy - 60} style={zh(30, H.text2, 800)}>速度</text>
        <text x={gx} y={gy + 44} style={zh(30, H.text, 900)} opacity={0.35 + 0.65 * fa}>加速</text>
        <text x={gx + gw * 0.38} y={gy + 44} style={zh(30, H.text, 900)} opacity={0.35 + 0.65 * sc}>等速</text>
        <text x={gx + gw - 64} y={gy + 44} style={zh(30, H.text, 900)} opacity={0.35 + 0.65 * sl}>減速</text>
        <text x={330} y={CT + 30} style={zh(30, H.text2, 800)} opacity={0.4 + 0.6 * tu}>一條掃完，轉向換下一條</text>
      </svg>
    </Card>
  );
};

// ── kla-cmp：晶粒 A − 晶粒 B ＝ 差異圖（一樣的消掉，只剩缺陷，圈起來） ──
const Cmp: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 400;
  const ad = on(f, T(o, "adj")), sb = on(f, T(o, "sub")), cc = on(f, T(o, "cancel")), df = on(f, T(o, "defect")), mk = on(f, T(o, "mask"));
  const pat = (x: number, y: number, op: number) => <g opacity={op}>{[0, 1, 2, 3].map((i) => <rect key={i} x={x + 18} y={y + 22 + i * 36} width={i % 2 ? 110 : 150} height={16} fill={TEAL} />)}
    <rect x={x + 130} y={y + 58} width={20} height={70} fill={TEAL} /></g>;
  const P0 = [30, 330, 630], Y = CT + 20;
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        {P0.map((x, i) => <rect key={i} x={x} y={Y} width={190} height={170} fill="#FFFFFF" stroke={i === 2 ? (df > 0.5 ? RED : H.lineSoft) : (ad > 0.5 ? BLUE : H.lineSoft)} strokeWidth={i === 2 ? 4 : 3} />)}
        {pat(P0[0], Y, 0.4 + 0.6 * ad)}{pat(P0[1], Y, 0.4 + 0.6 * ad)}
        <circle cx={P0[1] + 70} cy={Y + 112} r={8} fill={RED} opacity={0.4 + 0.6 * ad} />
        {pat(P0[2], Y, 0.6 * sb * (1 - cc))}
        <circle cx={P0[2] + 70} cy={Y + 112} r={8} fill={RED} opacity={sb} />
        <circle cx={P0[2] + 70} cy={Y + 112} r={26 + 4 * Math.sin(f * 0.3)} fill="none" stroke={RED} strokeWidth={5} opacity={df} />
        <text x={262} y={Y + 104} textAnchor="middle" style={zh(56, H.text, 900)} opacity={0.4 + 0.6 * sb}>−</text>
        <text x={562} y={Y + 104} textAnchor="middle" style={zh(56, H.text, 900)} opacity={0.4 + 0.6 * sb}>＝</text>
        <text x={125} y={CT + 236} textAnchor="middle" style={zh(30, H.text, 900)}>晶粒 A</text>
        <text x={425} y={CT + 236} textAnchor="middle" style={zh(30, H.text, 900)}>晶粒 B</text>
        <text x={725} y={CT + 236} textAnchor="middle" style={zh(30, df > 0.5 ? RED : H.text, 900)}>{df > 0.5 ? "剩下＝缺陷" : "相減"}</text>
        <g opacity={0.3 + 0.7 * mk}><line x1={30} y1={CT + 262} x2={W - 30} y2={CT + 262} stroke={H.lineSoft} strokeWidth={2} />
          <text x={30} y={CT + 306} style={zh(30, H.text, 900)}>光罩也要查：極紫外光光罩</text>
          <FlagBox code="JP" x={420} y={CT + 278} a={mk} /><rect x={484} y={CT + 276} width={150} height={42} fill="#FFFFFF" stroke={mk > 0.5 ? H.amber : H.lineSoft} strokeWidth={mk > 0.5 ? 4 : 1.5} />
          <text x={496} y={CT + 306} style={zh(30, "#1F3A5F", 900)}>Lasertec</text>
          <text x={648} y={CT + 306} style={zh(30, H.text2, 800)}>專門檢測・媒體報導</text></g>
      </svg>
    </Card>
  );
};

// ── kla-ovl：框中框：下層外框（珊瑚）＋上層內框（深青），中心偏一點；兩中心連線＝疊對誤差（放大畫） ──
const Ovl: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330;
  const me = on(f, T(o, "meas")), ov = on(f, T(o, "ovl")), al = on(f, T(o, "align"));
  const cx = 200, cy = CT + 130, d = 22 * ease((f - T(o, "ovl")) / 30);
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        <rect x={cx - 110} y={cy - 110} width={220} height={220} fill="none" stroke={COR} strokeWidth={18} opacity={0.4 + 0.6 * me} />
        <rect x={cx - 50 + d} y={cy - 50 - d * 0.6} width={100} height={100} fill="none" stroke={TEAL} strokeWidth={16} opacity={0.3 + 0.7 * ov} />
        <circle cx={cx} cy={cy} r={6} fill={COR} opacity={al} /><circle cx={cx + d} cy={cy - d * 0.6} r={6} fill={TEAL} opacity={al} />
        <g opacity={al}><line x1={cx} y1={cy} x2={cx + d} y2={cy - d * 0.6} stroke={H.text} strokeWidth={4} /></g>
        <Sep x={360} />
        <Row x={390} y={CT + 50} t="外框：下層圖案" c={COR} a={me} />
        <Row x={390} y={CT + 112} t="內框：上層圖案" c={TEAL} a={ov} />
        <Row x={390} y={CT + 174} t="兩個中心的偏移" c={H.amber} a={al} />
        <text x={390} y={CT + 242} style={zh(30, H.text2, 800)} opacity={0.4 + 0.6 * al}>偏太多，這片就要重做</text>
      </svg>
    </Card>
  );
};

// ── kla-film：偏振光斜打薄膜 → 反射後偏振改變；右：反射隨波長的曲線，薄、厚兩條不同（示意） ──
const Film: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330;
  const po = on(f, T(o, "pol")), rf = on(f, T(o, "refl")), th = on(f, T(o, "thick"));
  const sY = CT + 190, cx = 220;
  const ell = (x: number, y: number, rx: number, ry: number, a: number, c: string, op: number) => <ellipse cx={x} cy={y} rx={rx} ry={ry} transform={`rotate(${a} ${x} ${y})`} fill="none" stroke={c} strokeWidth={4} opacity={op} />;
  const curve = (ph: number, c: string, op: number) => <path d={Array.from({ length: 41 }, (_, i) => `${i ? "L" : "M"}${520 + i * 10} ${CT + 130 + 50 * Math.sin(i * 0.32 * ph + ph)}`).join(" ")} stroke={c} strokeWidth={4} fill="none" opacity={op} />;
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        <rect x={40} y={sY} width={360} height={26} fill={FILM} opacity={0.85} /><rect x={40} y={sY + 26} width={360} height={30} fill={WAF} stroke={WAF_D} strokeWidth={2} />
        <Arrow x1={70} y1={CT + 40} x2={cx - 6} y2={sY - 4} c={BLUE} w={5} o={po} />
        <Arrow x1={cx + 6} y1={sY - 4} x2={370} y2={CT + 40} c={OK} w={5} o={rf} />
        {ell(100, CT + 110, 30, 6, -30, BLUE, po)}
        {ell(340, CT + 110, 26, 14, 40, OK, rf)}
        <Sep x={460} />
        {curve(1, BLUE, 0.3 + 0.7 * rf * (1 - 0.5 * th))}{curve(1.45, H.amber, th)}
        <text x={490} y={CT + 244} style={zh(30, H.text2, 800)}>波長 →</text>
        <text x={650} y={CT + 244} style={zh(30, H.text, 900)} opacity={0.4 + 0.6 * th}>曲線形狀反推厚度</text>
      </svg>
    </Card>
  );
};

// ── kla-co：LOGO＋美國國旗；專做量測檢測；台灣真實輪廓，竹北（總部）、桃園、台南據點 ──
const TW_PATH = "M180.3 82.0 L192.0 91.6 L202.6 99.9 L207.3 100.6 L197.3 110.2 L199.1 127.4 L195.6 136.4 L185.0 166.5 L179.1 190.8 L170.9 222.8 L157.4 245.2 L142.8 271.4 L139.9 299.6 L132.8 297.7 L125.2 270.2 L116.4 263.8 L105.8 253.5 L98.8 229.8 L94.7 219.6 L98.8 204.9 L101.7 179.3 L113.5 162.0 L119.3 147.9 L129.3 133.2 L144.0 112.7 L153.3 99.3 L172.1 89.7Z";
// 投影同 HudAsml／HudTrk／HudAmat：x＝180.3＋(經度−121.54)×58.6、y＝82＋(25.30−緯度)×64
const geo = (lat: number, lon: number) => [180.3 + (lon - 121.54) * 58.6, 82 + (25.30 - lat) * 64];
const Co: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 360;
  const us = on(f, T(o, "us")), sp = on(f, T(o, "spec")), tw = on(f, T(o, "tw"));
  const S = 1.05, OX = 470, OY = 0, pt = (la: number, lo: number) => { const [x, y] = geo(la, lo); return [OX + x * S, OY + y * S]; };
  const [hx, hy] = pt(24.83, 121.01), [tx, ty] = pt(25.0, 121.3), [nx, ny] = pt(23.1, 120.3);
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        <LogoBox id="kla" x={28} y={CT + 8} h={48} a={us} maxW={230} />
        <FlagBox code="US" x={290} y={CT + 14} a={us} /><text x={352} y={CT + 44} style={zh(32, H.text, 900)} opacity={0.4 + 0.6 * us}>美國</text>
        <text x={28} y={CT + 116} style={zh(30, H.text2, 800)} opacity={0.4 + 0.6 * us}>總部：加州米爾必達</text>
        <g opacity={0.35 + 0.65 * sp}><text x={28} y={CT + 174} style={zh(30, H.text2, 800)}>專做</text>
          <text x={28} y={CT + 226} style={zh(40, H.amber, 900)}>量測＋檢測</text>
          <text x={28} y={CT + 274} style={zh(30, H.text2, 800)}>（業界叫製程控制）</text></g>
        <Sep x={500} y1={346} />
        <path d={TW_PATH} transform={`translate(${OX} ${OY}) scale(${S})`} fill={OK} opacity={0.3 + 0.35 * tw} stroke={OK} strokeWidth={3 / S} strokeLinejoin="round" />
        <circle cx={hx} cy={hy} r={9 * (1 + 0.2 * Math.sin(f * 0.25) * tw)} fill={H.amber} opacity={0.4 + 0.6 * tw} />
        <circle cx={tx} cy={ty} r={6} fill={BLUE} opacity={0.4 + 0.6 * tw} /><circle cx={nx} cy={ny} r={6} fill={BLUE} opacity={0.4 + 0.6 * tw} />
        <line x1={hx + 10} y1={hy + 2} x2={704} y2={CT + 100} stroke={H.text2} strokeWidth={2} opacity={0.4 + 0.6 * tw} />
        <g opacity={0.4 + 0.6 * tw}><FlagBox code="TW" x={526} y={CT + 220} a={tw} />
          <text x={712} y={CT + 110} style={zh(30, H.text, 900)}>竹北：台灣總部</text>
          <text x={712} y={CT + 180} style={zh(30, H.text2, 800)}>另有桃園、台南</text>
          <text x={712} y={CT + 220} style={zh(30, H.text2, 800)}>等據點</text></g>
      </svg>
    </Card>
  );
};

// ── kla-next：系列走過的五家（每家一格，KLA 打勾）→ 下一集：台灣自己的設備廠（國旗） ──
const Next: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330;
  const dn = on(f, T(o, "done")), nx = on(f, T(o, "next")), kw = on(f, T(o, "kw"));
  const cos = ["曝光", "沉積", "蝕刻", "塗佈", "檢測"];
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        {cos.map((t, i) => { const x = 30 + i * 180, hi = i === 4; return <g key={i} opacity={hi ? 0.4 + 0.6 * dn : 0.75}>
          <rect x={x} y={CT + 20} width={150} height={70} fill={hi ? "#FFF4DA" : "#FFFFFF"} stroke={hi ? H.amber : H.lineSoft} strokeWidth={hi ? 4 : 2} />
          <text x={x + 75} y={CT + 66} textAnchor="middle" style={zh(30, H.text, 900)}>{t}</text>
          {i < 4 ? <Arrow x1={x + 154} y1={CT + 55} x2={x + 176} y2={CT + 55} c={H.text2} w={4} /> : null}</g>; })}
        <Check x={830} y={CT + 128} o={dn} />
        <g opacity={0.35 + 0.65 * nx}><FlagBox code="TW" x={30} y={CT + 146} a={nx} />
          <text x={96} y={CT + 176} style={zh(36, H.text, 900)}>下一集：台灣自己的設備廠</text></g>
        <text x={30} y={CT + 246} style={zh(30, H.text2, 800)} opacity={0.4 + 0.6 * kw}>留言「KLA」拿完整資料</text>
      </svg>
    </Card>
  );
};

export const KlaSection: React.FC<P> = (p) => {
  const kd = String((p.o as any).kind);
  if (kd === "kla-hook") return <Hook {...p} />;
  if (kd === "kla-tour") return <Tour {...p} />;
  if (kd === "kla-load") return <Load {...p} />;
  if (kd === "kla-src") return <Src {...p} />;
  if (kd === "kla-bf") return <Bf {...p} />;
  if (kd === "kla-df") return <Df {...p} />;
  if (kd === "kla-scan") return <Scan {...p} />;
  if (kd === "kla-cmp") return <Cmp {...p} />;
  if (kd === "kla-ovl") return <Ovl {...p} />;
  if (kd === "kla-film") return <Film {...p} />;
  if (kd === "kla-co") return <Co {...p} />;
  if (kd === "kla-next") return <Next {...p} />;
  return null;
};

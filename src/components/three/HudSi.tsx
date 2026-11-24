// 2026/11/24 tech-wafer1：矽晶圓-1 的 2D 示意卡（overlay `section` 的 kind 以 "si-" 開頭，Hud.tsx 的 HudSection 轉過來）。
//   si-hook 砂→？→鏡面晶圓｜si-mg 電弧爐：二氧化矽＋碳→矽＋一氧化碳、純度 98%｜si-pure 十一個九、一千億個原子裡一顆雜質｜
//   si-siem 西門子法：氣體→蒸餾→長回矽棒｜si-melt 多晶（排得亂）→坩堝加熱熔掉｜si-cz 拉晶剖面＋原子照晶種排隊｜
//   si-saw 線鋸切片｜si-pol 研磨→拋光（表面越來越平）｜si-size 8 吋 vs 12 吋｜si-co 全球五大｜si-next 台灣還有誰＋留言
// 全部示意；結構一開始就畫出（不留空框），念到時該處亮起、動起來；時間全部來自 script.json 的 t（cue）。
// 排版原則（card-overlap.mjs 檢查）：內容從 CARD_CONTENT_TOP 以下；字不放進會動的圖形範圍；欄間 ≥24px；分隔線不穿字；字 ≥30px。
import React from "react";
import { FONT_ZH } from "../../theme";
import { H, L, sm, CARD_HEAD, CARD_CONTENT_TOP, cardTitleBox } from "./hudSkin";
import { EASE, tween } from "../anim";
import type { Model3D, Overlay3D } from "./engine";
import { Flag, LogoSvg, hasLogo, logoW } from "./Brand";
import "./BrandWafer";

const zh = (px: number, color: string = H.text, w = 800): React.CSSProperties => ({ fontFamily: FONT_ZH, fontSize: px, fill: color, color, fontWeight: w, whiteSpace: "nowrap" });
const onC = (bg: string) => (bg === H.amber ? ((H as any).onAmber ?? H.onAccent) : H.onAccent);
type P = { o: Overlay3D; f: number; k: number; m: Model3D };
const T = (o: Overlay3D, n: string) => ((o as any).t?.[n]?.at ?? o.at) as number;
const CT = CARD_CONTENT_TOP;
const Card: React.FC<{ o: Overlay3D; k: number; W: number; Hh: number; children: React.ReactNode }> = ({ o, k, W, Hh, children }) => (
  <div style={{ position: "absolute", left: o.x ?? L.X, top: o.y ?? 900, width: W, height: Hh, opacity: k, background: H.cardCompare, border: `2px solid ${H.lineSoft}`, boxSizing: "border-box", overflow: "hidden" }}>
    {o.title ? <div style={{ ...zh(CARD_HEAD.px, onC(H.line), 800), ...cardTitleBox(), background: H.line, zIndex: 2 }}>{o.title}</div> : null}
    {o.tag ? <div style={{ position: "absolute", right: 16, top: 14, ...zh(sm(28), H.text2, 600), zIndex: 2 }}>{o.tag}</div> : null}
    {children}
  </div>
);
const ph = (f: number, sp: number, j: number, n: number, seed = 0) => (((f * sp + j / n + seed * 0.17) % 1) + 1) % 1;
const lit = (f: number, at: number, lo = 0.4) => lo + (1 - lo) * tween(f, at, 10, EASE.enter);
const on = (f: number, at: number, d = 10) => tween(f, at, d, EASE.enter);
const cl = (x: number) => Math.min(1, Math.max(0, x));
const SAND = "#E3CF9F", SAND_D = "#B89B5E", COAL = "#33363C", SI = "#AFC0DA", SI_D = "#7F93B5", MG = "#8C9099", POLY = "#9AA4B4", INGOT = "#7E8AA2",
  MELT = "#FF8A2A", HEAT = "#FF7A2F", HOT = "#FFB23F", RED = "#E0472F", OK = "#14A38B", BLUE = "#2F7FE0", GAS = "#3FA866", CO = "#8A96A8", MIRROR = "#C8D5EA", DIE = "#7FA4E0", QZ = "#E9E4D6";
const Sep: React.FC<{ x: number; y0?: number; y1?: number }> = ({ x, y0 = CT + 4, y1 = 316 }) => <line x1={x} y1={y0} x2={x} y2={y1} stroke={H.lineSoft} strokeWidth={3} />;
const Arrow: React.FC<{ x1: number; y1: number; x2: number; y2: number; c: string; w?: number; o?: number }> = ({ x1, y1, x2, y2, c, w = 5, o = 1 }) => {
  const a = Math.atan2(y2 - y1, x2 - x1), s = w * 2.6;
  return <g opacity={o}><path d={`M${x1} ${y1} L${x2 - Math.cos(a) * s * 0.8} ${y2 - Math.sin(a) * s * 0.8}`} stroke={c} strokeWidth={w} />
    <path d={`M${x2} ${y2} L${x2 - Math.cos(a) * s - Math.sin(a) * s * 0.6} ${y2 - Math.sin(a) * s + Math.cos(a) * s * 0.6} L${x2 - Math.cos(a) * s + Math.sin(a) * s * 0.6} ${y2 - Math.sin(a) * s - Math.cos(a) * s * 0.6} Z`} fill={c} /></g>;
};
const Check: React.FC<{ x: number; y: number; o?: number }> = ({ x, y, o = 1 }) => <path opacity={o} d={`M${x - 20} ${y} l14 14 l28 -30`} stroke={OK} strokeWidth={8} fill="none" />;
/** 文字列（右欄條列）：念到才亮，前面加色點 */
const Row: React.FC<{ x: number; y: number; t: string; c: string; a: number; px?: number }> = ({ x, y, t, c, a, px = 32 }) => (
  <g opacity={0.35 + 0.65 * a}><rect x={x} y={y - px * 0.72} width={12} height={px * 0.72} fill={c} /><text x={x + 24} y={y} style={zh(px, H.text, 900)}>{t}</text></g>
);
/** 晶圓（俯視）：圓＋晶粒格＋缺口，shine＝反光帶位置（0–1） */
const Wafer: React.FC<{ cx: number; cy: number; r: number; die: number; glow?: number; shine?: number; id: string }> = ({ cx, cy, r, die, glow = 0, shine = -1, id }) => {
  const cells: React.ReactNode[] = []; const s = die + 3, n = Math.ceil(r / s) + 1;
  for (let i = -n; i <= n; i++) for (let j = -n; j <= n; j++) {
    const x = i * s - die / 2, y = j * s - die / 2;
    const far = Math.max(Math.hypot(x, y), Math.hypot(x + die, y), Math.hypot(x, y + die), Math.hypot(x + die, y + die));
    if (far < r - 4) cells.push(<rect key={`${i}_${j}`} x={cx + x} y={cy + y} width={die} height={die} fill={DIE} opacity={0.55 + 0.45 * glow} />);
  }
  return <g>
    <defs><clipPath id={id}><circle cx={cx} cy={cy} r={r} /></clipPath></defs>
    <circle cx={cx} cy={cy} r={r} fill={MIRROR} stroke={SI_D} strokeWidth={3} />
    {cells}
    {shine >= 0 ? <rect clipPath={`url(#${id})`} x={cx - r + shine * 2.6 * r - 0.8 * r} y={cy - r} width={r * 0.35} height={2 * r} fill="#FFFFFF" opacity={0.55} transform={`rotate(25 ${cx} ${cy})`} /> : null}
    <rect x={cx - 5} y={cy + r - 8} width={10} height={10} fill={H.cardCompare} />
  </g>;
};

// ── si-hook：一把砂 → 怎麼變？ → 鏡面晶圓（晶片做在上面） ──
const Hook: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330;
  const ch = on(f, T(o, "chip")), sa = on(f, T(o, "sand")), hw = on(f, T(o, "how")), mi = on(f, T(o, "mirror"));
  const grains = Array.from({ length: 46 }, (_, j) => { const a = (j * 137.5) % 360, rr = 12 + ((j * 53) % 100); const x = 150 + Math.cos(a) * rr * 1.05, y = 296 - Math.abs(Math.sin(a)) * (110 - rr) * 0.9 - 6;
    return <circle key={j} cx={x} cy={Math.min(296, y)} r={8} fill={j % 4 ? SAND : SAND_D} />; });
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        <g opacity={lit(f, T(o, "sand"), 0.35)}>
          <text x={40} y={CT + 40} style={zh(32, H.text, 900)}>一把砂</text>
          <rect x={40} y={298} width={220} height={8} fill={SAND_D} />
          {grains}
        </g>
        <Arrow x1={290} y1={220} x2={420} y2={220} c={H.amber} w={7} o={0.35 + 0.65 * hw} />
        <text x={356} y={180} textAnchor="middle" style={zh(56, H.amber, 900)} opacity={0.35 + 0.65 * hw}>？</text>
        <text x={356} y={296} textAnchor="middle" style={zh(32, H.text, 900)} opacity={0.35 + 0.65 * hw}>怎麼變</text>
        <Sep x={446} />
        <g opacity={lit(f, T(o, "chip"), 0.35)}>
          <Wafer cx={600} cy={206} r={110} die={22} glow={ch} shine={mi > 0 ? cl((f - T(o, "mirror")) / 30) : -1} id="sihook" />
        </g>
        <g opacity={0.35 + 0.65 * ch}><text x={736} y={CT + 70} style={zh(32, H.text, 900)}>晶片</text><text x={736} y={CT + 114} style={zh(32, H.text, 900)}>做在上面</text></g>
        <g opacity={0.35 + 0.65 * mi}><text x={736} y={272} style={zh(32, BLUE, 900)}>一面鏡子</text></g>
      </svg>
    </Card>
  );
};

// ── si-mg：二氧化矽（砂）＋碳 → 矽＋一氧化碳｜冶金級矽純度約 98% ──
const Mg: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330;
  const a1 = on(f, T(o, "sio2")), a2 = on(f, T(o, "carbon")), a3 = on(f, T(o, "oxy")), a4 = on(f, T(o, "mg")), p = cl((f - T(o, "p98")) / 30);
  const chip = (x: number, y: number, w: number, c: string, t: string, a: number, dark = false) => (
    <g opacity={0.3 + 0.7 * a}><rect x={x} y={y} width={w} height={56} fill={c} /><text x={x + w / 2} y={y + 39} textAnchor="middle" style={zh(32, dark ? "#FFFFFF" : H.text, 900)}>{t}</text></g>);
  const rise = (j: number) => { const u = ph(f, 0.03, j, 3); return <g key={j} opacity={a3 * Math.min(1, (1 - u) * 4, u * 6)}><circle cx={384 + j * 26} cy={240 - u * 40} r={8} fill={CO} /><circle cx={396 + j * 26} cy={240 - u * 40} r={8} fill={RED} /></g>; };
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        {chip(36, 84, 190, SAND, "二氧化矽", a1)}
        <text x={244} y={124} style={zh(40, H.text2, 900)}>＋</text>
        {chip(290, 84, 150, COAL, "碳", a2, true)}
        <Arrow x1={236} y1={150} x2={236} y2={206} c={HEAT} w={6} o={0.35 + 0.65 * a2} />
        {chip(36, 222, 190, MG, "矽", a4, true)}
        <text x={244} y={262} style={zh(40, H.text2, 900)}>＋</text>
        {chip(290, 252, 150, CO, "一氧化碳", a3, true)}
        {[0, 1, 2].map(rise)}
        <Sep x={470} />
        <g opacity={lit(f, T(o, "p98"), 0.35)}>
          <text x={500} y={CT + 40} style={zh(32, H.text, 900)}>冶金級矽的純度</text>
          <rect x={500} y={136} width={400} height={50} fill="#FFFFFF" stroke={H.lineSoft} strokeWidth={3} />
          <rect x={502} y={138} width={396 * 0.98 * EASE.move(p)} height={46} fill={MG} />
          <text x={500} y={266} style={zh(60, H.text, 900)}>{`約 ${Math.round(98 * EASE.move(p))}%`}</text>
          <text x={500} y={306} style={zh(30, H.text2, 800)}>還有 2% 是雜質</text>
        </g>
      </svg>
    </Card>
  );
};

// ── si-pure：99.999999999%（十一個九）｜一千億個原子、雜質不到一個｜電晶體才準 ──
const Pure: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330;
  const n = Math.min(11, Math.max(0, Math.floor((f - T(o, "n11")) / 2.5) + 1)), e11 = on(f, T(o, "e11")), im = on(f, T(o, "imp")), ok = on(f, T(o, "ok"));
  const nines = "99." + "9".repeat(Math.max(0, n - 2)) + "%";
  const dots: React.ReactNode[] = [];
  for (let i = 0; i < 12; i++) for (let j = 0; j < 5; j++) {
    const bad = i === 8 && j === 2;
    dots.push(<circle key={`${i}_${j}`} cx={594 + i * 28} cy={104 + j * 26} r={bad ? 11 : 9} fill={bad ? RED : SI_D} opacity={bad ? im * (0.6 + 0.4 * Math.sin(f * 0.3)) + 0.0 : 0.85} />);
    if (bad && im < 0.05) dots.pop();
    if (bad && im < 0.05) dots.push(<circle key="ok" cx={594 + i * 28} cy={104 + j * 26} r={9} fill={SI_D} opacity={0.85} />);
  }
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        <g opacity={lit(f, T(o, "n11"), 0.35)}>
          <text x={40} y={156} style={zh(50, BLUE, 900)}>{n >= 2 ? nines : "99%"}</text>
          <text x={40} y={212} style={zh(32, H.text, 900)}>十一個九（電子級）</text>
        </g>
        <g opacity={0.3 + 0.7 * ok}><text x={40} y={292} style={zh(34, H.text, 900)}>電晶體才準</text><Check x={250} y={280} o={ok} /></g>
        <Sep x={556} />
        <g opacity={lit(f, T(o, "e11"), 0.35)}>{dots}</g>
        <text x={584} y={262} style={zh(32, H.text, 900)} opacity={0.35 + 0.65 * e11}>一千億個原子</text>
        <text x={584} y={306} style={zh(32, RED, 900)} opacity={0.35 + 0.65 * im}>雜質不到一個</text>
      </svg>
    </Card>
  );
};

// ── si-siem：冶金級矽＋氯化氫→氣體（三氯矽烷）→ 蒸餾去雜質 → 在熱矽棒上長回來＝多晶矽 ──
const Siem: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330;
  const g = on(f, T(o, "gas")), d = on(f, T(o, "dist")), r = cl((f - T(o, "rod")) / 70), po = on(f, T(o, "poly"));
  const bub = (j: number) => { const u = ph(f, 0.035, j, 6); return <circle key={j} cx={80 + (j * 37) % 180} cy={206 - u * 120} r={9} fill={GAS} opacity={g * Math.min(1, (1 - u) * 4, u * 6)} />; };
  const vap = (j: number) => { const u = ph(f, 0.03, j, 5); return <circle key={j} cx={446 + (j % 2) * 26} cy={210 - u * 120} r={8} fill={GAS} opacity={d * Math.min(1, (1 - u) * 4, u * 6)} />; };
  const drop = (j: number) => { const u = ph(f, 0.025, j, 3); return <circle key={j} cx={420 + j * 24} cy={186 + u * 24} r={7} fill={RED} opacity={d * Math.min(1, (1 - u) * 3, u * 6)} />; };
  const rr = 18 + 46 * EASE.move(r);
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        <g opacity={lit(f, T(o, "gas"), 0.35)}>
          <rect x={60} y={210} width={200} height={20} fill={MG} />
          {[0, 1, 2, 3, 4, 5].map(bub)}
          <text x={40} y={274} style={zh(32, H.text, 900)}>變成氣體</text>
          <text x={40} y={310} style={zh(30, H.text2, 800)}>三氯矽烷</text>
        </g>
        <Arrow x1={276} y1={150} x2={320} y2={150} c={H.text3} w={5} />
        <g opacity={lit(f, T(o, "dist"), 0.35)}>
          <rect x={400} y={CT + 10} width={100} height={146} fill="#FFFFFF" stroke={SI_D} strokeWidth={4} />
          {[0, 1, 2, 3].map((j) => <line key={j} x1={402} y1={100 + j * 30} x2={498} y2={100 + j * 30} stroke={SI_D} strokeWidth={3} />)}
          {[0, 1, 2, 3, 4].map(vap)}{[0, 1, 2].map(drop)}
          <text x={346} y={274} style={zh(32, H.text, 900)}>蒸餾</text>
          <text x={346} y={310} style={zh(30, H.text2, 800)}>把雜質分掉</text>
        </g>
        <Arrow x1={560} y1={150} x2={604} y2={150} c={H.text3} w={5} />
        <g opacity={lit(f, T(o, "rod"), 0.35)}>
          <circle cx={760} cy={150} r={Math.max(rr, 18)} fill={POLY} />
          {[0.35, 0.6, 0.85].map((q, j) => (rr > 18 + 46 * q * 0.9 ? <circle key={j} cx={760} cy={150} r={18 + 46 * q} fill="none" stroke={SI_D} strokeWidth={2} /> : null))}
          <circle cx={760} cy={150} r={16} fill={HOT} />
          <text x={640} y={274} style={zh(32, H.text, 900)}>長回棒子上</text>
          <text x={640} y={310} style={zh(30, BLUE, 900)} opacity={0.35 + 0.65 * po}>＝多晶矽</text>
        </g>
      </svg>
    </Card>
  );
};

// ── si-melt：多晶＝很多小晶粒、方向亂｜放進坩堝、加熱到 1400°C 以上、熔掉 ──
const Melt: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330;
  const me = on(f, T(o, "messy")), cr = on(f, T(o, "cruc")), ht = on(f, T(o, "heat")), mt = cl((f - T(o, "melt")) / 40);
  const deg = Math.round(25 + (1420 - 25) * EASE.move(cl((f - T(o, "heat")) / 40)));
  const grains = [[40, 76, 18], [160, 76, -30], [280, 76, 40], [40, 170, -12], [160, 170, 55], [280, 170, -40]].map(([x, y, a], j) => (
    <g key={j} transform={`rotate(${a} ${x + 55} ${y + 44})`}>
      {Array.from({ length: 9 }, (_, q) => <circle key={q} cx={x + 22 + (q % 3) * 32} cy={y + 14 + Math.floor(q / 3) * 30} r={9} fill={SI_D} />)}
    </g>));
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        <g opacity={lit(f, T(o, "messy"), 0.35)}>
          <g opacity={0.9}>{grains.map((gg, j) => <g key={j} transform={`translate(0 ${j < 3 ? 6 : 0})`}>{gg}</g>)}</g>
          {[[150, 82, 150, 262], [270, 82, 270, 262], [40, 172, 390, 172]].map(([x1, y1, x2, y2], j) => <line key={j} x1={x1} y1={y1} x2={x2} y2={y2} stroke={RED} strokeWidth={3} strokeDasharray="8 6" opacity={0.4 + 0.6 * me} />)}
          <text x={40} y={306} style={zh(32, H.text, 900)}>多晶：方向亂</text>
        </g>
        <Sep x={440} />
        <g opacity={lit(f, T(o, "cruc"), 0.35)}>
          <text x={640} y={CT + 40} textAnchor="middle" style={zh(36, HEAT, 900)} opacity={0.35 + 0.65 * ht}>{`${deg}°C`}</text>
          <path d="M520 128 L520 296 L760 296 L760 128" fill="none" stroke={QZ} strokeWidth={12} />
          <path d="M508 120 L508 306 L772 306 L772 120" fill="none" stroke={"#3B4049"} strokeWidth={6} />
          <rect x={527} y={290 - 120 * EASE.move(mt)} width={226} height={120 * EASE.move(mt)} fill={MELT} opacity={0.9} />
          {Array.from({ length: 10 }, (_, j) => <rect key={j} x={534 + (j % 5) * 43} y={250 - Math.floor(j / 5) * 40 + 18 * mt} width={34} height={30} fill={POLY} opacity={(1 - mt) * cr} transform={`rotate(${(j * 23) % 40 - 20} ${551 + (j % 5) * 43} ${265 - Math.floor(j / 5) * 40})`} />)}
          {[0, 1, 2].map((j) => <path key={j} d={`M${560 + j * 80} 160 q12 -12 0 -24 q-12 -12 0 -24`} stroke={HEAT} strokeWidth={5} fill="none" opacity={ht * (0.5 + 0.5 * Math.sin(f * 0.35 + j))} />)}
        </g>
        <Row x={796} y={200} t="坩堝" c={QZ} a={cr} />
        <Row x={796} y={276} t="熔掉" c={MELT} a={on(f, T(o, "melt"))} />
      </svg>
    </Card>
  );
};

// ── si-cz：拉晶剖面（晶種浸入→慢轉→往上拉，晶棒越長越長）｜右：原子照晶種一排排排好 ──
const Cz: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330;
  const sd = T(o, "seed"), rt = on(f, T(o, "rot")), pl = T(o, "pull"), ln = T(o, "line"), ig = on(f, T(o, "ingot"));
  const dip = EASE.move(cl((f - sd) / 20)), grow = EASE.move(cl((f - pl) / 84));
  const YM = 238, h = 130 * grow, seedBot = YM - 34 * (1 - dip) - h, top = YM - h;
  const ang = f * 0.12 * rt;
  const rows = 6;
  const atoms: React.ReactNode[] = [];
  for (let r = 0; r < rows; r++) {
    const ta = ln + r * 14 - 20, u = EASE.move(cl((f - ta) / 16));
    for (let c = 0; c < 9; c++) {
      const tx = 556 + c * 40, ty = 110 + r * 30, sx = tx + ((c * 37 + r * 19) % 60) - 30, sy = 290;
      const x = r === 0 ? tx : sx + (tx - sx) * u, y = r === 0 ? ty : sy + (ty - sy) * u;
      atoms.push(<circle key={`${r}_${c}`} cx={x} cy={y} r={9} fill={r === 0 ? INGOT : u > 0.98 ? SI_D : MELT} opacity={r === 0 ? 1 : 0.25 + 0.75 * Math.max(u, f > ta - 30 ? 0.5 : 0)} />);
    }
  }
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        <path d="M90 214 L90 312 L410 312 L410 214" fill="none" stroke={QZ} strokeWidth={10} />
        <rect x={95} y={YM} width={310} height={70} fill={MELT} />
        <line x1={250} y1={CT + 2} x2={250} y2={seedBot - 20} stroke={SI_D} strokeWidth={3} />
        <rect x={238} y={seedBot - 24} width={24} height={10} fill={SI_D} />
        <rect x={243} y={seedBot - 14} width={14} height={14 + (top - seedBot > 0 ? 0 : 0)} fill={INGOT} />
        {h > 1 ? <path d={`M243 ${seedBot} L243 ${Math.min(top + 18, YM)} L${250 - 58 * cl(h / 30)} ${Math.min(top + 30, YM)} L${250 - 58 * cl(h / 30)} ${YM} L${250 + 58 * cl(h / 30)} ${YM} L${250 + 58 * cl(h / 30)} ${Math.min(top + 30, YM)} L257 ${Math.min(top + 18, YM)} L257 ${seedBot} Z`} fill={INGOT} opacity={0.6 + 0.4 * (ig > 0 ? 1 : 0.6)} /> : null}
        {dip > 0.9 ? <ellipse cx={250} cy={YM} rx={h > 1 ? 64 * cl(h / 30) + 6 : 12} ry={6} fill={HOT} /> : null}
        <g opacity={0.35 + 0.65 * rt}>
          <path d={`M196 ${YM - 18} A60 12 0 0 0 304 ${YM - 18}`} fill="none" stroke={BLUE} strokeWidth={5} transform={`rotate(${Math.sin(ang) * 3} 250 ${YM})`} />
          <path d={`M304 ${YM - 18} l-16 -8 l2 14 Z`} fill={BLUE} />
          <path d={`M330 292 A80 12 0 0 1 170 292`} fill="none" stroke={H.amber} strokeWidth={5} />
          <path d={`M170 292 l16 -8 l-2 14 Z`} fill={H.amber} />
        </g>
        <Arrow x1={172} y1={206} x2={172} y2={CT + 14} c={HEAT} w={6} o={0.35 + 0.65 * on(f, pl)} />
        <text x={30} y={CT + 40} style={zh(30, H.text, 900)} opacity={0.35 + 0.65 * rt}>慢慢轉</text>
        <text x={30} y={CT + 92} style={zh(30, H.text, 900)} opacity={0.35 + 0.65 * on(f, pl)}>往上拉</text>
        <text x={30} y={CT + 132} style={zh(30, HEAT, 900)} opacity={0.35 + 0.65 * on(f, pl)}>{"<1mm/分"}</text>
        <text x={330} y={CT + 40} style={zh(30, H.text, 900)} opacity={0.35 + 0.65 * on(f, sd)}>晶種</text>
        <Sep x={470} />
        <g opacity={lit(f, ln - 30, 0.35)}>{atoms}</g>
        <text x={500} y={308} style={zh(30, H.text, 900)} opacity={0.35 + 0.65 * on(f, ln)}>原子照晶種排隊</text>
        <text x={760} y={308} style={zh(30, BLUE, 900)} opacity={0.35 + 0.65 * ig}>→單晶</text>
      </svg>
    </Card>
  );
};

// ── si-saw：晶棒往下壓進鑽石線網，切成一片片｜厚 775 微米 ──
const Saw: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330;
  const sw = T(o, "saw"), sl = T(o, "slice");
  const dn = EASE.move(cl((f - sw + 8) / 40)), sp = EASE.move(cl((f - sl - 4) / 24));
  const y0 = 84 + 110 * dn - 120 * sp, N = 12;
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        {Array.from({ length: N }, (_, j) => <rect key={j} x={60 + j * 34 + (j - (N - 1) / 2) * 10 * sp} y={Math.max(CT + 6, y0)} width={34 - (dn > 0.95 ? 3 : 0)} height={96} fill={INGOT} />)}
        {Array.from({ length: N + 1 }, (_, j) => { const x = 60 + j * 34 - 1.5; return <g key={j}>
          <circle cx={x} cy={248} r={6} fill={"#C9D3E2"} stroke={SI_D} strokeWidth={2} />
          {[0, 1, 2].map((q) => { const u = ph(f, 0.06, q, 3, j); return <rect key={q} x={x - 3} y={240 + u * 16 - 2} width={6} height={4} fill="#FFFFFF" opacity={on(f, sw - 6)} />; })}
        </g>; })}
        <line x1={50} y1={262} x2={480} y2={262} stroke={SI_D} strokeWidth={3} />
        <Sep x={520} />
        <Row x={550} y={128} t="鑽石線來回跑" c={SI_D} a={on(f, sw)} />
        <Row x={550} y={196} t="切成一片片" c={INGOT} a={on(f, sl)} />
        <g opacity={0.35 + 0.65 * on(f, sl + 20)}>
          <rect x={560} y={236} width={300} height={14} fill={MIRROR} stroke={SI_D} strokeWidth={2} />
          <text x={560} y={300} style={zh(30, H.text2, 800)}>12 吋厚約 775 微米</text>
        </g>
      </svg>
    </Card>
  );
};

// ── si-pol：剖面看表面：刀痕（粗）→ 研磨（較平）→ 拋光（鏡面、光線整齊反射） ──
const Pol: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330;
  const gr = T(o, "grind"), po = T(o, "pol"), wa = on(f, T(o, "wafer"));
  const a = 26 * (1 - 0.7 * EASE.move(cl((f - gr) / 24))) * (1 - EASE.move(cl((f - po) / 24)));
  const pts = Array.from({ length: 41 }, (_, i) => `${40 + i * 12.5},${210 + (i % 2 ? -a : a * 0.6) * (0.6 + 0.4 * Math.sin(i * 1.7))}`).join(" ");
  const mir = cl((f - po - 10) / 20);
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        <polygon points={`40,312 ${pts} 540,312`} fill={mir > 0.5 ? MIRROR : SI} stroke={SI_D} strokeWidth={3} />
        <g opacity={mir}>
          <Arrow x1={120} y1={CT + 10} x2={240} y2={204} c={H.amber} w={5} />
          <Arrow x1={240} y1={204} x2={360} y2={CT + 10} c={H.amber} w={5} />
          <Arrow x1={300} y1={CT + 10} x2={420} y2={204} c={H.amber} w={5} />
          <Arrow x1={420} y1={204} x2={530} y2={CT + 30} c={H.amber} w={5} />
        </g>
        <Sep x={570} />
        <Row x={600} y={124} t="研磨：磨掉刀痕" c={SI_D} a={on(f, gr)} />
        <Row x={600} y={194} t="拋光：像鏡子" c={MIRROR} a={on(f, po)} />
        <g opacity={0.35 + 0.65 * wa}><text x={600} y={282} style={zh(44, BLUE, 900)}>＝晶圓</text></g>
      </svg>
    </Card>
  );
};

// ── si-size：8 吋 vs 12 吋（面積 2.25 倍；15 毫米晶粒約 139 → 300 多顆） ──
const Size: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330;
  const wy = on(f, T(o, "why")), ar = on(f, T(o, "area")), mo = on(f, T(o, "more"));
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        <g opacity={lit(f, T(o, "area"), 0.45)}><Wafer cx={136} cy={236} r={76} die={16} glow={mo} id="si8" />
          <text x={136} y={CT + 52} textAnchor="middle" style={zh(32, H.text, 900)}>8 吋</text></g>
        <g opacity={lit(f, T(o, "why"), 0.45)}><Wafer cx={384} cy={202} r={114} die={16} glow={mo} id="si12" /></g>
        <Sep x={526} />
        <text x={556} y={CT + 46} style={zh(34, BLUE, 900)} opacity={0.35 + 0.65 * wy}>12 吋</text>
        <text x={556} y={190} style={zh(54, H.text, 900)} opacity={0.35 + 0.65 * ar}>面積 ×2.25</text>
        <text x={556} y={250} style={zh(32, H.text, 900)} opacity={0.35 + 0.65 * mo}>約 139 → 300 多顆</text>
        <text x={556} y={300} style={zh(30, H.text2, 800)} opacity={0.35 + 0.65 * mo}>15 毫米晶粒為例</text>
      </svg>
    </Card>
  );
};

// ── si-co：全球五大（不列個別市占）｜五家合計超過八成 ──
// 2026/11/24 審片必改：每列＝國旗＋官方 LOGO（Brand.tsx；抓不到原檔的只留文字）＋公司名，念到那家整列亮
const Co: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330;
  const L5: [string, string, string, string, string][] = [["信越化學", "日本", "shin", "JP", "shinetsu"], ["勝高 SUMCO", "日本", "sumco", "JP", "sumco"], ["環球晶", "台灣", "gw", "TW", "globalwafers"], ["世創 Siltronic", "德國", "sil", "DE", "siltronic"], ["SK Siltron", "韓國", "sk", "KR", "sksiltron"]];
  const t5 = cl((f - T(o, "top5")) / 30), nOn = L5.reduce((a, r) => a + on(f, T(o, r[2])), 0) / 5;
  const RH = 50, Y0 = CT + 6;
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        {L5.map(([n, c, id, fl, lg], j) => { const a = on(f, T(o, id)), y = Y0 + j * RH, cy = y + RH / 2;
          const lw = hasLogo(lg) ? Math.min(170, logoW(lg, 36)) : 0, lh = lw ? Math.round(36 * lw / logoW(lg, 36)) : 0;
          // 2026/11/24 審片規則：國旗、LOGO 全程 100% 不透明（不用 opacity 變淡＝改色）；未輪到＝細灰框，輪到＝粗色框＋放大
          const hc = id === "gw" ? H.amber : BLUE, sc = 1 + 0.08 * a;
          return <g key={j}>
            {a > 0.01 ? <rect x={22} y={y + 3} width={566} height={RH - 6} fill={hc} opacity={0.14 * a} /> : null}
            <g opacity={0.3 + 0.7 * a}><text x={92} y={cy + 10} style={zh(28, H.text2, 800)}>{c}</text>
              <text x={162} y={cy + 12} style={zh(32, H.text, 900)}>{n}</text></g>
            <g transform={`translate(${53} ${cy}) scale(${sc}) translate(${-53} ${-cy})`}>
              <rect x={29} y={cy - 17} width={48} height={34} fill="none" stroke={a > 0.5 ? hc : H.lineSoft} strokeWidth={a > 0.5 ? 4 : 1.5} />
              <Flag code={fl} h={28} x={32} y={cy - 14} asSvg /></g>
            {lw ? <g transform={`translate(${408 + lw / 2} ${cy}) scale(${sc}) translate(${-(408 + lw / 2)} ${-cy})`}>
              <rect x={402} y={cy - lh / 2 - 5} width={lw + 12} height={lh + 10} fill="#FFFFFF" stroke={a > 0.5 ? hc : H.lineSoft} strokeWidth={a > 0.5 ? 4 : 1.5} /><LogoSvg id={lg} x={408} y={cy - lh / 2} h={lh} /></g> : null}
          </g>; })}
        <Sep x={606} />
        <g>
          <text x={630} y={CT + 40} style={zh(32, H.text, 900)}>五家合計</text>
          <rect x={630} y={140} width={290} height={50} fill="#FFFFFF" stroke={H.lineSoft} strokeWidth={3} />
          <rect x={632} y={142} width={286 * 0.83 * Math.max(nOn * 0.9, EASE.move(t5))} height={46} fill={BLUE} />
          <line x1={632 + 286 * 0.8} y1={130} x2={632 + 286 * 0.8} y2={200} stroke={H.amber} strokeWidth={4} />
          <text x={630} y={270} style={zh(52, H.text, 900)} opacity={lit(f, T(o, "top5"), 0.25)}>超過八成</text>
        </g>
      </svg>
    </Card>
  );
};

// ── si-next：台灣：環球晶（五大之一）、台勝科、合晶 → 下一集：矽晶圓-2；留言「拉晶」 ──
const Next: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330;
  const items: [string, string, string, string][] = [["環球晶", "五大之一", "tw", H.amber], ["台勝科", "做什麼？", "fst", BLUE], ["合晶", "做什麼？", "ww", BLUE]];
  const kw = on(f, T(o, "kw")), nx = on(f, T(o, "next"));
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        {items.map(([a, b, id, c], j) => { const x = 30 + j * 312, l = lit(f, T(o, id), 0.4), hl = f >= T(o, id) && f < T(o, "kw");
          return <g key={j} opacity={l}>
            <rect x={x} y={CT + 6} width={262} height={118} fill={hl ? c : H.cardCompare} stroke={c} strokeWidth={hl ? 5 : 3} />
            <text x={x + 146} y={CT + 56} textAnchor="middle" style={zh(40, hl ? "#FFFFFF" : H.text, 900)}>{a}</text>
            <text x={x + 131} y={CT + 104} textAnchor="middle" style={zh(sm(30), hl ? "#FFFFFF" : H.text2, 800)}>{b}</text>
          </g>; })}
        {items.map(([, , id], j) => <Flag key={`f${j}`} code="TW" h={26} x={30 + j * 312 + 14} y={CT + 22} asSvg />)}
        <g opacity={kw} transform={`translate(${W / 2} 288) rotate(-2) scale(${1 + 0.3 * (1 - kw)})`}>
          <rect x={-220} y={-32} width={440} height={64} fill={H.amber} /><text x={0} y={14} textAnchor="middle" style={zh(38, onC(H.amber), 900)}>留言「拉晶」拿完整資料</text>
        </g>
      </svg>
    </Card>
  );
};

export const SiSection: React.FC<P> = (p) => {
  const kd = String((p.o as any).kind);
  if (kd === "si-hook") return <Hook {...p} />;
  if (kd === "si-mg") return <Mg {...p} />;
  if (kd === "si-pure") return <Pure {...p} />;
  if (kd === "si-siem") return <Siem {...p} />;
  if (kd === "si-melt") return <Melt {...p} />;
  if (kd === "si-cz") return <Cz {...p} />;
  if (kd === "si-saw") return <Saw {...p} />;
  if (kd === "si-pol") return <Pol {...p} />;
  if (kd === "si-size") return <Size {...p} />;
  if (kd === "si-co") return <Co {...p} />;
  if (kd === "si-next") return <Next {...p} />;
  return null;
};

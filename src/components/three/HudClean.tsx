// 2026/11/21 tech-clean：清洗的 2D 示意卡（overlay `section` 的 kind 以 "cln-" 開頭，Hud.tsx 的 HudSection 轉過來）。
//   cln-hook 接上一支＋清洗次數｜cln-kill 顆粒讓線路短路｜cln-ash 灰化｜cln-pop 高溫爆裂｜cln-spm 穿殼→加溫→硫酸雙氧水｜
//   cln-spin 單片旋轉清洗（俯視）｜cln-mega 兆音波剖面｜cln-chem 藥液輪流換｜cln-dry 乾燥（水 vs 異丙醇）｜cln-co 誰在做｜cln-next 接下來
// 全部示意；結構一開始就畫出（不留空框），念到時該處亮起、動起來；時間全部來自 script.json 的 t（cue）。
// 排版原則（card-overlap.mjs 檢查）：字不放進會動的圖形範圍；每欄之間留 ≥24px；分隔線不穿過字；字 ≥30px。
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
const SC1 = "#2F7FE0", SC2 = "#E0901A", DIW = "#3DB5E6", IPA = "#8A63D8", RES = "#D9822B", CRUST = "#4A2A14", DIRT = "#5B4A3A", CU = "#C98A3E", SI = "#AFC0DA", SI_D = "#7F93B5",
  RED = "#E0472F", OK = "#14A38B", MEGA = "#14A38B", HEAT = "#FF7A2F", PLASMA = "#B07CFF";
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

// ── cln-hook：佈植完（光阻焦硬、表面髒）｜每做一步就洗｜50 次以上？ ──
const Hook: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330;
  const a = lit(f, T(o, "hard")), d = on(f, T(o, "dirty")), n50 = on(f, T(o, "n50")), w = on(f, T(o, "why"));
  const n = Math.round(50 * EASE.move(cl((f - T(o, "n50")) / 24)));
  const chips = ["佈植", "清洗", "氧化", "清洗", "曝光", "清洗"];
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        <g opacity={a}>
          <text x={36} y={108} style={zh(34, CRUST, 900)}>光阻焦硬</text>
          <text x={36} y={154} style={zh(34, DIRT, 900)} opacity={0.35 + 0.65 * d}>表面也髒</text>
          <rect x={36} y={252} width={240} height={52} fill={SI} />
          {[56, 176].map((x, j) => <g key={j}><rect x={x} y={206} width={84} height={46} fill={RES} /><rect x={x} y={200} width={84} height={10} fill={CRUST} /></g>)}
          {Array.from({ length: 6 }, (_, j) => <circle key={j} cx={150 + (j % 3) * 9} cy={240 - Math.floor(j / 3) * 9} r={5} fill={DIRT} opacity={d} />)}
          {Array.from({ length: 5 }, (_, j) => <circle key={j} cx={60 + j * 48} cy={196 - (j % 2) * 6} r={5} fill={DIRT} opacity={d} />)}
        </g>
        <Sep x={304} />
        <g opacity={lit(f, T(o, "n50"), 0.35)}>
          {chips.map((c, j) => { const x = 324 + (j % 3) * 104, y = 84 + Math.floor(j / 3) * 78, cln = c === "清洗", hi = cln && n50 > 0.5;
            return <g key={j}><rect x={x} y={y} width={92} height={54} fill={hi ? DIW : H.cardCompare} stroke={cln ? DIW : H.text3} strokeWidth={3} />
              <text x={x + 46} y={y + 38} textAnchor="middle" style={zh(30, hi ? "#FFFFFF" : H.text, 900)}>{c}</text></g>; })}
          <text x={324} y={292} style={zh(30, H.text2, 800)}>每做一步，就洗一次</text>
        </g>
        <Sep x={644} />
        <g opacity={n50}>
          <text x={790} y={176} textAnchor="middle" style={zh(96, DIW, 900)}>{`${n}+`}</text>
          <text x={790} y={226} textAnchor="middle" style={zh(32, H.text, 900)}>次清洗</text>
        </g>
        <g opacity={w}><rect x={700} y={250} width={180} height={52} fill={H.amber} /><text x={790} y={288} textAnchor="middle" style={zh(34, onC(H.amber), 900)}>為什麼？</text></g>
      </svg>
    </Card>
  );
};

// ── cln-kill：線寬幾十奈米｜線寬一半大的顆粒卡進縫｜兩條線接通＝短路 ──
const Kill: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330;
  const wd = on(f, T(o, "width")), hf = on(f, T(o, "half"), 14), sh = on(f, T(o, "short"));
  const py = 92 + (226 - 92) * EASE.move(hf), blink = sh * (0.6 + 0.4 * Math.sin(f * 0.9));
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        <rect x={40} y={292} width={520} height={24} fill={SI} />
        {[60, 330].map((x, j) => <rect key={j} x={x} y={120} width={180} height={172} fill={sh > 0.5 ? RED : CU} opacity={sh > 0.5 ? 0.55 + 0.45 * blink : 1} />)}
        <g opacity={wd}><path d="M60 96 H240 M60 84 V108 M240 84 V108" stroke={H.amber} strokeWidth={5} /></g>
        <circle cx={285} cy={py} r={44} fill={DIRT} opacity={hf > 0 ? 1 : 0} />
        <g opacity={sh}>
          <Arrow x1={150} y1={250} x2={440} y2={250} c={RED} w={6} />
          <path d={`M285 ${py - 70} l-14 30 h20 l-14 30`} stroke="#FFC21A" strokeWidth={6} fill="none" opacity={blink} />
        </g>
        <Sep x={588} />
        <Row x={612} y={122} t="線寬：幾十奈米" c={H.amber} a={wd} />
        <Row x={612} y={202} t="顆粒：線寬一半" c={DIRT} a={hf} />
        <Row x={612} y={282} t="兩線接通＝短路" c={RED} a={sh} />
      </svg>
    </Card>
  );
};

// ── cln-ash：氧電漿 → 氧自由基打在硬殼上 → 燒成氣體排走（低溫、慢）＝灰化 ──
const Ash: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330;
  const cr = lit(f, T(o, "crust")), pl = on(f, T(o, "plasma")), sl = cl((f - T(o, "slow")) / 90), as = on(f, T(o, "ash"));
  const ct = 22 - 12 * sl;
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        <rect x={30} y={70} width={560} height={64} fill={PLASMA} opacity={0.12 + 0.3 * pl * (0.8 + 0.2 * Math.sin(f * 0.5))} />
        <rect x={30} y={272} width={560} height={40} fill={SI} />
        {[60, 240, 420].map((x, j) => <g key={j} opacity={cr}><rect x={x} y={208} width={140} height={64} fill={RES} /><rect x={x} y={208 - ct} width={140} height={ct} fill={CRUST} /></g>)}
        {Array.from({ length: 6 }, (_, j) => { const u = ph(f, 0.03, j, 6); const x = 100 + (j % 3) * 180 + (j > 2 ? 40 : 0); const y = 110 + u * 70;
          return <circle key={j} cx={x} cy={y} r={11} fill={RED} opacity={pl * Math.min(1, (1 - u) * 4)} />; })}
        {Array.from({ length: 4 }, (_, j) => { const u = ph(f, 0.022, j, 4, 2); const x = 200 + j * 90 + u * 40, y = 196 - u * 110;
          return <g key={j} opacity={sl > 0 ? Math.min(1, (1 - u) * 3) * Math.min(1, sl * 6) : 0}><circle cx={x} cy={y} r={9} fill="#8A96A8" /><circle cx={x + 11} cy={y - 4} r={7} fill="#8A96A8" /></g>; })}
        <Sep x={612} />
        <Row x={636} y={112} t="氧電漿" c={PLASMA} a={pl} />
        <Row x={636} y={172} t="自由基燒硬殼" c={RED} a={on(f, T(o, "slow"))} />
        <Row x={636} y={232} t="變成氣體排走" c="#8A96A8" a={on(f, T(o, "slow") + 20)} />
        <g opacity={as}><rect x={636} y={256} width={200} height={50} fill={H.amber} /><text x={736} y={293} textAnchor="middle" style={zh(34, onC(H.amber), 900)}>＝灰化</text></g>
      </svg>
    </Card>
  );
};

// ── cln-pop：如果高溫 → 底下光阻冒氣 → 殼被撐破、碎片噴出 ✗ ──
const Pop: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330;
  const ho = on(f, T(o, "hot")), ga = on(f, T(o, "gas")), po = on(f, T(o, "pop")), sp = cl((f - T(o, "spray")) / 30);
  const block = (x: number, bub: number, broken: number) => (
    <g>
      <rect x={x} y={250} width={240} height={30} fill={SI} />
      <rect x={x + 30} y={176} width={180} height={74} fill={RES} />
      {broken > 0 ? null : <rect x={x + 30} y={168} width={180} height={12} fill={CRUST} />}
      {Array.from({ length: 5 }, (_, j) => <ellipse key={j} cx={x + 60 + j * 30} cy={214 - (j % 2) * 10} rx={8 + 6 * bub} ry={6 + 4 * bub} fill="#F7E0C4" stroke={CRUST} strokeWidth={2} opacity={bub} />)}
    </g>);
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        <g opacity={lit(f, T(o, "hot"))}>
          {block(30, 0, 0)}
          {[0, 1, 2].map((j) => <path key={j} d={`M${80 + j * 60} 300 q10 -8 0 -16 q-10 -8 0 -16`} stroke={HEAT} strokeWidth={4} fill="none" opacity={ho * (0.6 + 0.4 * Math.sin(f * 0.4 + j))} transform="translate(0 0)" />)}
          <text x={150} y={110} textAnchor="middle" style={zh(34, RED, 900)} opacity={ho}>直接高溫</text>
        </g>
        <Sep x={316} />
        <g opacity={lit(f, T(o, "gas"))}>
          {block(340, ga, 0)}
          <text x={460} y={110} textAnchor="middle" style={zh(34, H.text, 900)}>底下冒氣</text>
        </g>
        <Sep x={628} />
        <g opacity={lit(f, T(o, "pop"))}>
          {block(650, 1, po)}
          {po > 0 ? [-1, 1].map((s, j) => <rect key={j} x={770 + s * 60 - 30 + s * 30 * sp} y={160 - 40 * sp} width={60} height={12} fill={CRUST} transform={`rotate(${s * 25 * sp} ${770 + s * 60} 166)`} />) : null}
          {Array.from({ length: 8 }, (_, j) => { const a = -Math.PI / 2 + (j - 3.5) * 0.32, r = 20 + 90 * sp; return <rect key={j} x={770 + Math.cos(a) * r} y={180 + Math.sin(a) * r * 0.9} width={9} height={9} fill={CRUST} opacity={sp > 0 ? 1 - sp * 0.3 : 0} />; })}
          <text x={770} y={110} textAnchor="middle" style={zh(34, RED, 900)}>殼被撐破</text>
          <Cross x={892} y={92} s={16} o={on(f, T(o, "spray"))} />
        </g>
      </svg>
    </Card>
  );
};

// ── cln-spm：①殼燒穿 ②加溫燒乾淨 ③硫酸＋雙氧水溶掉殘渣 ──
const Spm: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330;
  const th = on(f, T(o, "through")), wa = cl((f - T(o, "warm")) / 40), sp = cl((f - T(o, "spm")) / 50);
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        <g opacity={lit(f, T(o, "through"))}>
          <rect x={40} y={222} width={240} height={32} fill={SI} />
          <rect x={70} y={150} width={180} height={72} fill={RES} />
          <rect x={70} y={142} width={180} height={10} fill={CRUST} opacity={1 - th} />
          {[0, 1, 2].map((j) => <path key={j} d={`M${110 + j * 50} 132 v-30`} stroke={RED} strokeWidth={5} opacity={th * (0.5 + 0.5 * Math.sin(f * 0.5 + j))} />)}
          <text x={160} y={296} textAnchor="middle" style={zh(32, H.text, 900)}>①殼燒穿</text>
        </g>
        <Sep x={316} />
        <g opacity={lit(f, T(o, "warm"))}>
          <rect x={348} y={222} width={240} height={32} fill={SI} />
          <rect x={378} y={150 + 72 * wa} width={180} height={72 * (1 - wa)} fill={RES} />
          {Array.from({ length: 6 }, (_, j) => <circle key={j} cx={392 + j * 30} cy={216} r={5} fill={DIRT} opacity={wa} />)}
          <rect x={348} y={254} width={240} height={10} fill={HEAT} opacity={on(f, T(o, "warm"))} />
          <text x={468} y={296} textAnchor="middle" style={zh(32, H.text, 900)}>②加溫燒乾淨</text>
        </g>
        <Sep x={628} />
        <g opacity={lit(f, T(o, "spm"))}>
          <rect x={656} y={222} width={240} height={32} fill={SI} />
          <rect x={656} y={180} width={240} height={42} fill={SC2} opacity={0.25 + 0.3 * on(f, T(o, "spm"))} />
          {Array.from({ length: 6 }, (_, j) => <circle key={j} cx={676 + j * 40} cy={216 - 30 * sp - (j % 2) * 8 * sp} r={5 * (1 - sp * 0.8)} fill={DIRT} opacity={1 - sp} />)}
          <rect x={666} y={92} width={220} height={64} fill={SC2} opacity={on(f, T(o, "spm"))} />
          <text x={776} y={136} textAnchor="middle" style={zh(30, "#FFFFFF", 900)} opacity={on(f, T(o, "spm"))}>硫酸＋雙氧水</text>
          <text x={776} y={296} textAnchor="middle" style={zh(32, H.text, 900)}>③溶掉殘渣</text>
        </g>
      </svg>
    </Card>
  );
};

// ── cln-spin：俯視晶圓旋轉＋噴嘴中心→邊緣＋顆粒沿螺旋甩出 ──
const Spin: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330;
  const sn = lit(f, T(o, "single")), spn = on(f, T(o, "spin")), sw = on(f, T(o, "sweep")), fl = on(f, T(o, "fling"));
  const cx = 230, cy = 190, R = 102, ang = Math.max(0, f - T(o, "spin")) * 0.12;
  const nr = sw > 0 ? R * 0.92 * (0.5 - 0.5 * Math.cos(Math.max(0, f - T(o, "sweep")) * 0.06)) : 0;
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        <g opacity={sn}>
          <circle cx={cx} cy={cy} r={R + 18} fill="none" stroke={H.text3} strokeWidth={4} />
          <circle cx={cx} cy={cy} r={R} fill="#C9D6EA" stroke={SI_D} strokeWidth={3} />
          <g transform={`rotate(${(ang * 180) / Math.PI} ${cx} ${cy})`}>
            {Array.from({ length: 49 }, (_, j) => { const i = (j % 7) - 3, q = Math.floor(j / 7) - 3; const x = cx + i * 28, y = cy + q * 28; return Math.hypot(i * 28 + 12, q * 28 + 12) < R - 6 && Math.hypot(i * 28 - 12, q * 28 - 12) < R - 6 ? <rect key={j} x={x - 11} y={y - 11} width={22} height={22} fill="#9FB3D3" /> : null; })}
            <rect x={cx - 8} y={cy + R - 8} width={16} height={8} fill={H.text} />
          </g>
          <path d={`M${cx + 70} ${cy - R - 4} A ${R + 4} ${R + 4} 0 0 1 ${cx + R + 4} ${cy - 60}`} stroke={H.amber} strokeWidth={5} fill="none" opacity={spn} />
          <Arrow x1={cx + R - 2} y1={cy - 72} x2={cx + R + 6} y2={cy - 52} c={H.amber} w={5} o={spn} />
        </g>
        <g opacity={sw}><circle cx={cx + nr} cy={cy} r={14} fill={SC1} stroke="#FFFFFF" strokeWidth={3} /><path d={`M${cx} ${cy} H${cx + R}`} stroke={SC1} strokeWidth={3} strokeDasharray="8 6" /></g>
        {Array.from({ length: 6 }, (_, j) => { const u = ph(f, 0.025, j, 6); const r = 20 + u * (R + 22), a = j * 1.05 + u * 1.4 + ang * 0.2;
          return <circle key={j} cx={cx + Math.cos(a) * r} cy={cy + Math.sin(a) * r} r={6} fill={DIRT} opacity={fl * Math.min(1, (1 - u) * 5)} />; })}
        <Sep x={404} />
        <Row x={430} y={124} t="晶圓吸在轉盤上旋轉" c={H.amber} a={spn} />
        <Row x={430} y={204} t="噴嘴：中心掃到邊緣" c={SC1} a={sw} />
        <Row x={430} y={284} t="顆粒被往外甩掉" c={DIRT} a={fl} />
      </svg>
    </Card>
  );
};

// ── cln-mega：兆音波棒 → 聲波打進液膜 → 細小水流把顆粒推走 ──
const Mega: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330;
  const st = lit(f, T(o, "stuck")), mg = on(f, T(o, "mega")), hz = on(f, T(o, "mhz")), sr = on(f, T(o, "stream")), aw = cl((f - T(o, "away")) / 30);
  const lift = sr * cl((f - T(o, "stream")) / 40);
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        <rect x={50} y={150} width={500} height={110} fill={DIW} opacity={0.22} />
        <rect x={50} y={260} width={500} height={50} fill={SI} />
        {[0, 1, 2, 3].map((j) => <rect key={j} x={90 + j * 120} y={234} width={50} height={26} fill={CU} />)}
        <g opacity={0.4 + 0.6 * mg}><rect x={70} y={100} width={460} height={42} fill={MEGA} /><text x={300} y={132} textAnchor="middle" style={zh(30, "#FFFFFF", 900)}>兆音波棒</text></g>
        {Array.from({ length: 4 }, (_, j) => { const u = ph(f, 0.06, j, 4); const y = 152 + u * 76;
          return <path key={j} d={`M70 ${y} q20 -8 40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0`} stroke={MEGA} strokeWidth={3} fill="none" opacity={hz * (1 - u) * 0.9} />; })}
        {[0, 1, 2].map((j) => { const x = 165 + j * 120, y = 248 - 70 * lift - 40 * aw, dx = 60 * aw; return <g key={j}>
          <circle cx={x + dx} cy={y} r={10} fill={DIRT} opacity={st * (1 - aw * 0.6)} />
          <Arrow x1={x - 30} y1={232} x2={x + 10} y2={204} c={DIW} w={4} o={sr * (0.6 + 0.4 * Math.sin(f * 0.5 + j))} /></g>; })}
        <Sep x={584} />
        <text x={760} y={128} textAnchor="middle" style={zh(48, MEGA, 900)} opacity={0.35 + 0.65 * hz}>約 1 MHz</text>
        <text x={760} y={182} textAnchor="middle" style={zh(30, H.text, 800)} opacity={0.35 + 0.65 * hz}>每秒振動約一百萬次</text>
        <Row x={612} y={262} t="水流把顆粒推走" c={DIW} a={sr} />
      </svg>
    </Card>
  );
};

// ── cln-chem：藥液一（顆粒、有機物）→ 超純水 → 藥液二（金屬）→ 超純水 ──
const Chem: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330;
  const items: [string, string, string, string, string][] = [["藥液一", "去顆粒", "有機物", SC1, "sc1"], ["超純水", "沖乾淨", "", DIW, "sc1+30"], ["藥液二", "去金屬", "", SC2, "sc2"], ["超純水", "沖乾淨", "", DIW, "rinse"]];
  const at = (s: string) => (s.includes("+") ? T(o, s.split("+")[0]) + Number(s.split("+")[1]) : T(o, s));
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        {items.map(([a, b, c, col, id], j) => { const x = 24 + j * 232, t = at(id), l = lit(f, t, 0.35), hi = f >= t && (j === 3 || f < at(items[j + 1][4]));
          return <g key={j} opacity={l}>
            <rect x={x} y={84} width={200} height={190} fill={hi ? col : H.cardCompare} stroke={col} strokeWidth={hi ? 5 : 3} />
            <text x={x + 100} y={140} textAnchor="middle" style={zh(36, hi ? "#FFFFFF" : H.text, 900)}>{a}</text>
            <text x={x + 100} y={196} textAnchor="middle" style={zh(32, hi ? "#FFFFFF" : H.text2, 800)}>{b}</text>
            {c ? <text x={x + 100} y={244} textAnchor="middle" style={zh(32, hi ? "#FFFFFF" : H.text2, 800)}>{c}</text> : null}
            {j < 3 ? <Arrow x1={x + 204} y1={179} x2={x + 228} y2={179} c={H.text3} w={4} /> : null}
          </g>; })}
        <text x={476} y={312} textAnchor="middle" style={zh(30, H.text2, 800)} opacity={lit(f, T(o, "turn"), 0.4)}>每換一種藥液，中間都用超純水沖</text>
      </svg>
    </Card>
  );
};

// ── cln-dry：水直接甩乾（水痕、細線被拉倒）✗｜異丙醇換掉水、從中心往外乾 ✓ ──
const Dry: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330;
  const mk = on(f, T(o, "mark")), fa = on(f, T(o, "fall"), 16), ip = on(f, T(o, "ipa")), fr = cl((f - T(o, "front")) / 50);
  const lines = (x0: number, lean: number) => [0, 1, 2, 3, 4].map((j) => { const x = x0 + j * 62, tilt = j === 1 ? lean : j === 2 ? -lean : 0;
    return <rect key={j} x={x} y={150} width={22} height={100} fill={CU} transform={`rotate(${tilt} ${x + 11} 250)`} />; });
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        <g opacity={lit(f, T(o, "mark"))}>
          <rect x={40} y={250} width={380} height={30} fill={SI} />
          <rect x={98} y={170} width={84} height={80} fill={DIW} opacity={0.5 * (1 - fa * 0.6)} />
          {lines(76, 12 * fa)}
          <ellipse cx={330} cy={248} rx={34} ry={7} fill="none" stroke={DIRT} strokeWidth={4} opacity={mk} />
          <text x={40} y={110} style={zh(32, H.text, 900)}>水直接甩乾</text>
          <text x={40} y={316} style={zh(30, RED, 800)} opacity={0.3 + 0.7 * mk}>留水痕、拉倒細線</text>
          <Cross x={392} y={98} s={16} o={fa} />
        </g>
        <Sep x={476} />
        <g opacity={lit(f, T(o, "ipa"))}>
          <rect x={516} y={250} width={380} height={30} fill={SI} />
          <rect x={516 + 190 * fr} y={170} width={Math.max(0, 190 - 190 * fr)} height={80} fill={IPA} opacity={0.4 * ip} />
          <rect x={706} y={170} width={Math.max(0, 190 - 190 * fr)} height={80} fill={IPA} opacity={0.4 * ip} />
          {lines(552, 0)}
          {fr > 0 ? <><Arrow x1={706} y1={140} x2={706 - 170 * fr - 16} y2={140} c={IPA} w={4} /><Arrow x1={706} y1={140} x2={706 + 170 * fr + 16} y2={140} c={IPA} w={4} /></> : null}
          <text x={516} y={110} style={zh(32, H.text, 900)}>異丙醇換掉水</text>
          <text x={516} y={316} style={zh(30, OK, 800)} opacity={0.3 + 0.7 * on(f, T(o, "front"))}>從中心往外推乾</text>
          <Check x={870} y={96} o={on(f, T(o, "front"))} />
        </g>
      </svg>
    </Card>
  );
};

// ── cln-co：單片清洗機台（迪恩士、東京威力科創、科林研發）｜先進封裝濕製程（台灣：辛耘、弘塑） ──
const Co: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330;
  const L1: [string, string, string][] = [["迪恩士", "日本", "screen"], ["東京威力科創", "日本", "tel"], ["科林研發", "美國", "lam"]];
  const L2: [string, string, string][] = [["辛耘", "台灣", "tw"], ["弘塑", "台灣", "tw"]];
  const col = (x: number, head: string, rows: [string, string, string][], c: string, w: number) => (
    <g>
      <rect x={x} y={70} width={w} height={46} fill={c} /><text x={x + 16} y={104} style={zh(30, "#FFFFFF", 900)}>{head}</text>
      {rows.map(([n, cty, id], j) => { const a = on(f, T(o, id) + j * 0); const y = 166 + j * 54;
        return <g key={j} opacity={0.3 + 0.7 * a}><text x={x + 16} y={y} style={zh(34, H.text, 900)}>{n}</text><text x={x + w - 16} y={y} textAnchor="end" style={zh(30, H.text2, 800)}>{cty}</text></g>; })}
    </g>);
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        {col(30, "單片清洗機台", L1, SC1, 430)}
        <Sep x={486} />
        <g opacity={lit(f, T(o, "tw"), 0.35)}>{col(510, "先進封裝濕製程", L2, H.amber === "" ? SC2 : SC2, 412)}
          <text x={526} y={300} style={zh(30, H.text2, 800)} opacity={on(f, T(o, "pkg"))}>濕式清洗槽、單晶圓旋轉清洗</text></g>
      </svg>
    </Card>
  );
};

// ── cln-next：洗乾淨 → 長出均勻氧化層、離子加熱歸位 → 下一支：氧化與熱處理；留言「清洗」 ──
const Next: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330;
  const items: [string, string, string, string][] = [["表面", "洗乾淨", "clean", DIW], ["氧化層", "加熱歸位", "oxide", HEAT], ["下一支", "氧化與熱處理", "next", H.amber]];
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
          <rect x={-220} y={-32} width={440} height={64} fill={H.amber} /><text x={0} y={14} textAnchor="middle" style={zh(38, onC(H.amber), 900)}>留言「清洗」看完整解說</text>
        </g>
      </svg>
    </Card>
  );
};

export const ClnSection: React.FC<P> = (p) => {
  const kd = String((p.o as any).kind);
  if (kd === "cln-hook") return <Hook {...p} />;
  if (kd === "cln-kill") return <Kill {...p} />;
  if (kd === "cln-ash") return <Ash {...p} />;
  if (kd === "cln-pop") return <Pop {...p} />;
  if (kd === "cln-spm") return <Spm {...p} />;
  if (kd === "cln-spin") return <Spin {...p} />;
  if (kd === "cln-mega") return <Mega {...p} />;
  if (kd === "cln-chem") return <Chem {...p} />;
  if (kd === "cln-dry") return <Dry {...p} />;
  if (kd === "cln-co") return <Co {...p} />;
  if (kd === "cln-next") return <Next {...p} />;
  return null;
};

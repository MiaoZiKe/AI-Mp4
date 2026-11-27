// 2026/11/27 tech-probe1：探針卡-1（系列 2 第 21 集）的 2D 示意卡（overlay `section` 的 kind 以 "probe1-" 開頭，Hud.tsx 的 HudSection 轉過來）。
//   probe1-hook 接上集：哪顆晶片是好的｜probe1-flow 切開之前先測（晶圓測試）｜probe1-stamp 針很多的印章：一次蓋下去，每根針碰一個接點｜
//   probe1-pitch 最密處接點間距 vs 一根頭髮｜probe1-spring 彈簧筆：壓下去會彎、高低差被吸收、壓力平均｜probe1-scrub 指甲刮掉生鏽處：刮破氧化膜才接通｜
//   probe1-types 懸臂 → 垂直 → 微機電｜probe1-count 針數（專利：數千根；報導：未來平均三萬以上）與越多越難壓平｜probe1-tester 測試機像出題老師｜probe1-next 晶圓地圖與下一集。
// 全部示意：只放 research.md 查得到的說法；結構一開始就畫出，念到時該處亮起、動起來；時間全部來自 script.json 的 t（cue）。
// 排版原則（card-overlap.mjs 檢查）：內容從 CARD_CONTENT_TOP 以下、離標題 ≥8px；字不放進會動的圖形範圍；字 ≥30px；字離圖形 ≥6px。本集沒有公司與國家，沒有 LOGO、國旗。
import React from "react";
import { FONT_ZH } from "../../theme";
import { H, L, CARD_HEAD, CARD_CONTENT_TOP, cardTitleBox } from "./hudSkin";
import { EASE, tween } from "../anim";
import type { Model3D, Overlay3D, State3D } from "./engine";

const zh = (px: number, color: string = H.text, w = 800): React.CSSProperties => ({ fontFamily: FONT_ZH, fontSize: px, fill: color, color, fontWeight: w, whiteSpace: "nowrap" });
const onC = (bg: string) => (bg === H.amber ? ((H as any).onAmber ?? H.onAccent) : H.onAccent);
type P = { o: Overlay3D; f: number; k: number; m: Model3D; s?: State3D };
const T = (o: Overlay3D, n: string) => ((o as any).t?.[n]?.at ?? o.at) as number;
const CT = CARD_CONTENT_TOP + 8;
const Card: React.FC<{ o: Overlay3D; k: number; W: number; Hh: number; children: React.ReactNode }> = ({ o, k, W, Hh, children }) => (
  <div style={{ position: "absolute", left: o.x ?? L.X, top: o.y ?? 900, width: W, height: Hh, opacity: k, background: H.cardCompare, border: `2px solid ${H.lineSoft}`, boxSizing: "border-box", overflow: "hidden" }}>
    {o.title ? <div style={{ ...zh(CARD_HEAD.px, onC(H.line), 800), ...cardTitleBox(), background: H.line, zIndex: 2 }}>{o.title}</div> : null}
    {o.tag ? <div style={{ position: "absolute", right: 16, top: 14, ...zh(28, H.text2, 600), zIndex: 2 }}>{o.tag}</div> : null}
    {children}
  </div>
);
const on = (f: number, at: number, d = 10) => tween(f, at, d, EASE.enter);
const fr = (x: number) => ((x % 1) + 1) % 1;
const RED = "#E0472F", OK = "#14A38B", BLUE = "#2F7FE0", ORG = "#F29A4A", GRY = "#98A2B3", GOLD = "#D8B25A", AL = "#C3CAD6", OX = "#6FA7D8", SI = "#5E6B82", PCB = "#1E6B4E", HAIR = "#4A3525", DIE = "#7F95BC", CER = "#E8E4DA";
const Sep: React.FC<{ x: number }> = ({ x }) => <line x1={x} y1={CT + 4} x2={x} y2={316} stroke={H.lineSoft} strokeWidth={3} />;
const Row: React.FC<{ x: number; y: number; t: string; c: string; a: number; px?: number }> = ({ x, y, t, c, a, px = 30 }) => (
  <g opacity={0.35 + 0.65 * a}><rect x={x} y={y - px * 0.72} width={12} height={px * 0.72} fill={c} /><text x={x + 24} y={y} style={zh(px, H.text, 900)}>{t}</text></g>
);
const RX = 352;   // 右側文字欄起點
// 小晶圓（圓＋晶片格），晶片顏色由 col(i, j) 決定
const Wafer: React.FC<{ cx: number; cy: number; r: number; col: (i: number, j: number) => string; op?: number }> = ({ cx, cy, r, col, op = 1 }) => {
  const p = 22, cells: React.ReactNode[] = [];
  for (let i = -6; i <= 5; i++) for (let j = -6; j <= 5; j++) { const x = cx + i * p, y = cy + j * p; if (Math.hypot(Math.abs(i + 0.5) * p + p / 2, Math.abs(j + 0.5) * p + p / 2) < r - 4) cells.push(<rect key={`${i}_${j}`} x={x + 2} y={y + 2} width={p - 4} height={p - 4} fill={col(i, j)} />); }
  return <g opacity={op}><circle cx={cx} cy={cy} r={r} fill={SI} stroke={H.text2} strokeWidth={3} />{cells}</g>;
};

// ── probe1-hook：前一集水氣電備齊、晶圓做完；哪顆晶片是好的？一片好幾百顆 ──
const Hook: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330, q = on(f, T(o, "q")), pv = on(f, T(o, "prev")), mn = on(f, T(o, "many")), pu = Math.sin(f * 0.14) * 0.5 + 0.5;
  const hot = new Set(["-2_-1", "1_2", "3_-3", "-4_1", "0_-4"]);
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        <Wafer cx={166} cy={CT + 124} r={122} col={(i, j) => (hot.has(`${i}_${j}`) && q > 0.5 ? (pu > 0.5 ? "#F2B632" : DIE) : DIE)} op={0.45 + 0.55 * Math.max(q, mn)} />
        <Sep x={RX - 26} />
        <Row x={RX} y={CT + 52} t="哪顆晶片是好的？" c={BLUE} a={q} />
        <Row x={RX} y={CT + 122} t="前一集：水氣電備齊" c={H.text2} a={pv} />
        <Row x={RX} y={CT + 192} t="一片好幾百顆（依大小而異）" c={H.amber} a={mn} />
      </svg>
    </Card>
  );
};

// ── probe1-flow：晶圓做完 → 晶圓測試 → 切開 → 封裝 ──
const Flow: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330, ct = on(f, T(o, "cut")), ea = on(f, T(o, "each")), nm = on(f, T(o, "name"));
  const steps: [string, number][] = [["晶圓做完", 1], ["晶圓測試", Math.max(ea, nm)], ["切開", ct * 0.5], ["封裝", ct * 0.5]];
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        {steps.map(([t, a], i) => { const y = CT + 4 + i * 58, hi = i === 1 && a > 0.5; return <g key={t} opacity={0.45 + 0.55 * Math.max(a, 0.2)}>
          <rect x={40} y={y} width={230} height={46} fill={hi ? "#FFF4DA" : "#FFFFFF"} stroke={hi ? H.amber : H.lineSoft} strokeWidth={hi ? 5 : 2} />
          <text x={155} y={y + 33} textAnchor="middle" style={zh(30, H.text, 900)}>{t}</text>
          {i < 3 ? <path d={`M155 ${y + 48} l0 8`} stroke={H.text2} strokeWidth={4} /> : null}</g>; })}
        <Sep x={RX - 26} />
        <Row x={RX} y={CT + 52} t="切開之前，還是一整片" c={H.text2} a={ct} />
        <Row x={RX} y={CT + 122} t="一顆一顆通電測試" c={BLUE} a={ea} />
        <Row x={RX} y={CT + 192} t="這一步叫晶圓測試" c={H.amber} a={nm} />
      </svg>
    </Card>
  );
};

// ── probe1-stamp：探針卡像一枚針很多的印章；一次蓋下去，每根針碰一個接點 ──
const Stamp: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330, cd = on(f, T(o, "card")), sp = on(f, T(o, "stamp")), dn = on(f, T(o, "down"), 12), ea = on(f, T(o, "each"));
  const drop = 54 * dn, xs = Array.from({ length: 8 }, (_, i) => 58 + i * 30);
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        <g transform={`translate(0 ${drop})`} opacity={0.4 + 0.6 * Math.max(cd, sp)}>
          <rect x={140} y={CT + 4} width={50} height={34} fill={GRY} stroke={H.text2} strokeWidth={3} />
          <rect x={40} y={CT + 38} width={250} height={26} fill={PCB} stroke={H.text2} strokeWidth={3} />
          {xs.map((x) => <line key={x} x1={x + 7} y1={CT + 64} x2={x + 7} y2={CT + 100} stroke={GOLD} strokeWidth={4} />)}
        </g>
        <rect x={30} y={CT + 166} width={270} height={36} fill={SI} stroke={H.text2} strokeWidth={3} />
        {xs.map((x) => <rect key={x} x={x} y={CT + 156} width={14} height={10} fill={ea > 0.5 ? OK : AL} stroke={H.text2} strokeWidth={1.5} />)}
        <Sep x={RX - 26} />
        <Row x={RX} y={CT + 52} t="探針卡：針很多的印章" c={H.amber} a={sp} />
        <Row x={RX} y={CT + 122} t="一次蓋下去" c={BLUE} a={dn} />
        <Row x={RX} y={CT + 192} t="每根針碰一個接點" c={OK} a={ea} />
      </svg>
    </Card>
  );
};

// ── probe1-pitch：最密處接點間距 < 50 微米；一根頭髮約 50～100 微米（示意，不按比例） ──
const Pitch: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330, gp = on(f, T(o, "gap")), hr = on(f, T(o, "hair"), 14);
  const y0 = CT + 150, xs = [62, 122, 182, 242];
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        {xs.map((x) => <rect key={x} x={x} y={y0} width={30} height={22} fill={AL} stroke={H.text2} strokeWidth={2} opacity={0.5 + 0.5 * gp} />)}
        <rect x={30} y={y0 + 22} width={270} height={30} fill={SI} stroke={H.text2} strokeWidth={2} />
        <g opacity={gp}><path d={`M77 ${y0 - 22} L137 ${y0 - 22}`} stroke={BLUE} strokeWidth={4} /><path d={`M77 ${y0 - 32} l0 20 M137 ${y0 - 32} l0 20`} stroke={BLUE} strokeWidth={4} /></g>
        <rect x={150 - 84 * hr} y={CT + 14} width={168 * hr} height={46} rx={23} fill={HAIR} opacity={0.3 + 0.7 * hr} />
        <Sep x={RX - 26} />
        <Row x={RX} y={CT + 52} t="最密處接點間距 < 50 微米" c={BLUE} a={gp} />
        <Row x={RX} y={CT + 122} t="一根頭髮約 50～100 微米" c={H.amber} a={hr} />
        <Row x={RX} y={CT + 192} t="比頭髮還窄（專利例）" c={H.text2} a={hr} />
      </svg>
    </Card>
  );
};

// ── probe1-spring：針有彈性，像彈簧筆；高低不一的針壓下去會彎，高低差被吸收、壓力平均 ──
const Spring: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330, sp = on(f, T(o, "spring")), pn = on(f, T(o, "pen")), bd = on(f, T(o, "bend"), 18), ev = on(f, T(o, "even"));
  const coil = (x: number, y: number, h: number) => `M${x} ${y} ` + Array.from({ length: 6 }, (_, i) => `l${i % 2 ? -14 : 14} ${h / 6}`).join(" ");
  const sh = 70 - 30 * bd;
  const hs = [0, 14, 6], xs = [190, 232, 274];
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        <g opacity={0.4 + 0.6 * pn}>
          <rect x={52} y={CT + 6} width={36} height={60} fill={BLUE} stroke={H.text2} strokeWidth={3} />
          <path d={coil(63, CT + 66, sh)} fill="none" stroke={H.text2} strokeWidth={4} />
          <rect x={56} y={CT + 66 + sh} width={28} height={30} fill={GRY} stroke={H.text2} strokeWidth={3} />
          <rect x={30} y={CT + 196} width={90} height={14} fill={SI} />
        </g>
        {xs.map((x, i) => { const top = CT + 40, tip = CT + 150 + hs[i] * (1 - bd) - 6 * bd, bow = 6 + 14 * bd * (1 - hs[i] / 20);
          return <g key={x} opacity={0.4 + 0.6 * sp}><path d={`M${x} ${top} Q${x - bow} ${(top + tip) / 2} ${x} ${tip}`} fill="none" stroke={GOLD} strokeWidth={6} />
            <circle cx={x} cy={tip} r={7} fill={bd > 0.6 ? "#F2B632" : RED} /></g>; })}
        <rect x={160} y={CT + 156} width={140} height={20} fill={AL} stroke={H.text2} strokeWidth={2} />
        {xs.map((x, i) => <rect key={x} x={x - 8} y={CT + 236 - 40 * (ev > 0.5 ? 1 : 0.5 + i * 0.25)} width={16} height={40 * (ev > 0.5 ? 1 : 0.5 + i * 0.25)} fill={ev > 0.5 ? OK : ORG} opacity={0.3 + 0.7 * bd} />)}
        <Sep x={RX - 26} />
        <Row x={RX} y={CT + 52} t="針有彈性，像彈簧筆" c={H.amber} a={pn} />
        <Row x={RX} y={CT + 122} t="壓下去會彎，高低差被吸收" c={BLUE} a={bd} />
        <Row x={RX} y={CT + 192} t="每根針的壓力才平均" c={OK} a={ev} />
      </svg>
    </Card>
  );
};

// ── probe1-scrub：鋁墊表面有氧化膜（不導電）；針輕輕刮動，像指甲刮掉生鏽處，刮開才接通電 ──
const Scrub: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330, ox = on(f, T(o, "ox")), ins = on(f, T(o, "insul")), sc = on(f, T(o, "scrub"), 30), nl = on(f, T(o, "nail")), cn = on(f, T(o, "on"));
  const y0 = CT + 150, tx = 110 + 90 * sc;
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        <rect x={40} y={y0} width={250} height={44} fill={AL} stroke={H.text2} strokeWidth={2} />
        <rect x={40} y={y0 - 14} width={250} height={14} fill={OX} opacity={0.5 + 0.5 * ox} />
        <rect x={106} y={y0 - 15} width={Math.max(0, tx - 106)} height={16} fill="#F4F7FB" opacity={sc} />
        <path d={`M${tx - 60} ${CT + 10} Q${tx - 20} ${CT + 60} ${tx} ${y0 - 14}`} fill="none" stroke={GOLD} strokeWidth={8} />
        <rect x={40} y={y0 + 44} width={250} height={22} fill={SI} />
        <g opacity={ins * (1 - cn)}><path d={`M250 ${CT + 20} l24 24 M274 ${CT + 20} l-24 24`} stroke={RED} strokeWidth={6} /></g>
        {[0, 1, 2].map((i) => { const u = fr(f * 0.03 + i / 3); return <circle key={i} cx={tx - 4} cy={y0 - 22 - 80 * u} r={7} fill={OK} opacity={cn * (1 - u)} />; })}
        <Sep x={RX - 26} />
        <Row x={RX} y={CT + 48} t="氧化膜：不導電" c={BLUE} a={Math.max(ox, ins)} />
        <Row x={RX} y={CT + 108} t="針輕輕刮動" c={H.amber} a={sc} />
        <Row x={RX} y={CT + 168} t="像指甲刮掉生鏽處" c={H.text2} a={nl} />
        <Row x={RX} y={CT + 228} t="刮開露出金屬，才接通電" c={OK} a={cn} />
      </svg>
    </Card>
  );
};

// ── probe1-types：針的演進：懸臂式（斜插粗針）→ 垂直式（站著）→ 微機電（半導體製程做的微針） ──
const Types: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330, ev = on(f, T(o, "evo")), ca = on(f, T(o, "cant")), ve = on(f, T(o, "vert")), me = on(f, T(o, "mems"));
  const base = CT + 200;
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        <g opacity={0.35 + 0.65 * ca}><rect x={30} y={CT + 20} width={36} height={60} fill="#B07A3A" />{[0, 1].map((i) => <path key={i} d={`M64 ${CT + 44 + i * 14} L104 ${base - 36} L106 ${base}`} fill="none" stroke={GOLD} strokeWidth={6} />)}</g>
        <g opacity={0.35 + 0.65 * ve}><rect x={128} y={CT + 20} width={64} height={14} fill={CER} stroke={H.text2} strokeWidth={2} />{[140, 160, 180].map((x) => <path key={x} d={`M${x} ${CT + 34} Q${x - 10} ${CT + 110} ${x} ${base}`} fill="none" stroke={GOLD} strokeWidth={4} />)}</g>
        <g opacity={0.35 + 0.65 * me}><rect x={218} y={CT + 20} width={80} height={14} fill={CER} stroke={H.text2} strokeWidth={2} />{[228, 248, 268, 288].map((x) => <path key={x} d={`M${x} ${CT + 34} l0 40 l8 0 l0 30 l-8 0 l0 ${base - CT - 104}`} fill="none" stroke="#9AA3B2" strokeWidth={3} />)}</g>
        <rect x={24} y={base} width={280} height={18} fill={AL} stroke={H.text2} strokeWidth={2} />
        <path d={`M40 ${base + 40} L286 ${base + 40}`} stroke={H.amber} strokeWidth={5} opacity={ev} /><path d={`M296 ${base + 40} l-14 -9 l0 18 Z`} fill={H.amber} opacity={ev} />
        <Sep x={RX - 26} />
        <Row x={RX} y={CT + 52} t="懸臂式：斜插的粗針" c={H.amber} a={ca} />
        <Row x={RX} y={CT + 122} t="垂直式：針垂直站著" c={BLUE} a={ve} />
        <Row x={RX} y={CT + 192} t="微機電：半導體技術做的" c={OK} a={me} />
      </svg>
    </Card>
  );
};

// ── probe1-count：針數（專利：可有數千根；報導：未來平均三萬根以上）；總壓力＝針數×每根的力，越多越難壓平 ──
const Count: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330, cd = on(f, T(o, "card8")), mn = on(f, T(o, "many"), 20), mo = on(f, T(o, "more")), fl = on(f, T(o, "flat"));
  const sag = 18 * fl;
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        <text x={30} y={CT + 32} style={zh(30, H.text2, 800)} opacity={0.4 + 0.6 * cd}>專利例</text>
        <rect x={140} y={CT + 10} width={30} height={30} fill={GRY} opacity={0.4 + 0.6 * cd} />
        <text x={30} y={CT + 86} style={zh(30, H.text2, 800)} opacity={0.4 + 0.6 * mn}>報導</text>
        <rect x={140} y={CT + 64} width={160 * mn} height={30} fill={H.amber} />
        <path d={`M40 ${CT + 150} Q165 ${CT + 150 + sag} 290 ${CT + 150}`} fill="none" stroke={PCB} strokeWidth={14} opacity={0.4 + 0.6 * mo} />
        {Array.from({ length: 9 }, (_, i) => { const x = 50 + i * 30, t = (x - 40) / 250, y = CT + 156 + 4 * t * (1 - t) * sag; return <line key={i} x1={x} y1={y} x2={x} y2={y + 34} stroke={GOLD} strokeWidth={4} opacity={0.4 + 0.6 * mo} />; })}
        <rect x={30} y={CT + 212} width={270} height={14} fill={AL} />
        <Sep x={RX - 26} />
        <Row x={RX} y={CT + 48} t="專利：一張卡可有數千根" c={H.text2} a={cd} />
        <Row x={RX} y={CT + 108} t="報導：未來平均三萬根以上" c={H.amber} a={mn} />
        <Row x={RX} y={CT + 168} t="總壓力＝針數×每根的力" c={BLUE} a={mo} />
        <Row x={RX} y={CT + 228} t="越多越難壓得一樣平" c={RED} a={fl} />
      </svg>
    </Card>
  );
};

// ── probe1-tester：測試機像出題老師：送訊號（出題）經探針卡進晶片，收回應（作答）判對錯 ──
const Tester: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330, ts = on(f, T(o, "tester")), tc = on(f, T(o, "teacher")), sd = on(f, T(o, "send")), an = on(f, T(o, "ans"));
  const u = fr(f * 0.025);
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        <g opacity={0.4 + 0.6 * ts}><rect x={30} y={CT + 10} width={90} height={150} fill="#E2E8F0" stroke={H.text2} strokeWidth={3} />{[0, 1, 2, 3].map((i) => <circle key={i} cx={50} cy={CT + 30 + i * 22} r={6} fill={OK} />)}<rect x={64} y={CT + 26} width={44} height={30} fill={BLUE} /></g>
        <rect x={150} y={CT + 72} width={60} height={26} fill={PCB} stroke={H.text2} strokeWidth={2} opacity={0.4 + 0.6 * sd} />
        <rect x={232} y={CT + 60} width={64} height={52} fill={SI} stroke={H.text2} strokeWidth={3} opacity={0.4 + 0.6 * sd} />
        <path d={`M120 ${CT + 76} L232 ${CT + 76}`} stroke={BLUE} strokeWidth={4} opacity={sd} /><circle cx={120 + 112 * u} cy={CT + 76} r={7} fill={BLUE} opacity={sd} />
        <path d={`M232 ${CT + 96} L120 ${CT + 96}`} stroke={OK} strokeWidth={4} opacity={an} /><circle cx={232 - 112 * fr(u + 0.5)} cy={CT + 96} r={7} fill={OK} opacity={an} />
        <g opacity={an}><path d={`M150 ${CT + 196} l14 14 l28 -30`} fill="none" stroke={OK} strokeWidth={8} /><path d={`M232 ${CT + 180} l30 30 M262 ${CT + 180} l-30 30`} stroke={RED} strokeWidth={8} /></g>
        <Sep x={RX - 26} />
        <Row x={RX} y={CT + 48} t="針的後面是測試機" c={H.text2} a={ts} />
        <Row x={RX} y={CT + 108} t="像出題老師" c={H.amber} a={tc} />
        <Row x={RX} y={CT + 168} t="送訊號進去：出題" c={BLUE} a={sd} />
        <Row x={RX} y={CT + 228} t="看晶片答對沒有" c={OK} a={an} />
      </svg>
    </Card>
  );
};

// ── probe1-next：晶圓地圖（綠＝通過、灰＝沒通過，示意）；下一集誰做探針卡；留言關鍵字 ──
const Next: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330, fa = on(f, T(o, "fail")), mk = on(f, T(o, "mark")), nx = on(f, T(o, "next")), kw = on(f, T(o, "kw"));
  const bad = new Set(["-5_0", "4_-2", "-1_3", "2_4", "-3_-4", "0_-5", "4_2", "-4_3"]);
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        <Wafer cx={166} cy={CT + 124} r={122} col={(i, j) => (bad.has(`${i}_${j}`) && mk > 0.5 ? RED : fa > 0.5 ? OK : DIE)} op={0.5 + 0.5 * fa} />
        <Sep x={RX - 26} />
        <Row x={RX} y={CT + 52} t="沒通過的晶片被標記（紅）" c={RED} a={mk} />
        <Row x={RX} y={CT + 122} t="下一集：誰做探針卡" c={H.text2} a={nx} />
        <Row x={RX} y={CT + 192} t="留言「探針卡」拿完整資料" c={H.amber} a={kw} />
      </svg>
    </Card>
  );
};

export const Probe1Section: React.FC<P> = (p) => {
  const kd = String((p.o as any).kind);
  if (kd === "probe1-hook") return <Hook {...p} />;
  if (kd === "probe1-flow") return <Flow {...p} />;
  if (kd === "probe1-stamp") return <Stamp {...p} />;
  if (kd === "probe1-pitch") return <Pitch {...p} />;
  if (kd === "probe1-spring") return <Spring {...p} />;
  if (kd === "probe1-scrub") return <Scrub {...p} />;
  if (kd === "probe1-types") return <Types {...p} />;
  if (kd === "probe1-count") return <Count {...p} />;
  if (kd === "probe1-tester") return <Tester {...p} />;
  if (kd === "probe1-next") return <Next {...p} />;
  return null;
};

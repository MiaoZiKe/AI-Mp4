// 2026/11/28 tech-bt：BT 載板與 T-glass 缺料（系列 3 第 9 集）的 2D 示意卡（overlay `section` 的 kind 以 "bt-" 開頭，Hud.tsx 的 HudSection 轉過來）。寫法照 HudAbfsub.tsx。
//   bt-hook 接前一集｜bt-make 布→樹脂→銅箔｜bt-rebar 鋼筋混凝土｜bt-vs BT 與味之素膜｜bt-cte 兩人三腳（熱膨脹不同）｜bt-tglass 低膨脹布＋約九成（媒體報導）＋日東紡｜
//   bt-flour 大店搶光麵粉（分析師普遍認為）｜bt-expand 日東紡擴廠、台玻出貨｜bt-co 台灣 BT 載板三家｜bt-next 下一集玻璃基板（尚未量產）｜bt-cta 提問＋留言關鍵字。
// 公司官方 LOGO 原檔抓不到（同 tech-abfsub 環境限制），用白底深色文字名牌（不仿商標）＋國旗，100% 不透明。
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
const fr = (x: number) => ((x % 1) + 1) % 1;
const RED = "#E0472F", OK = "#14A38B", BLUE = "#2F7FE0", GRY = "#98A2B3", SI = "#5E6B82", CU = "#C77B3C", LASER = "#E0473A", PCB = "#2F6B4A", CORE = "#E8D9B0", ABF = "#9CCFB0", RESIN = "#E9C46A", COOKIE = "#D9A55B", COOKIED = "#B07A35";
const Sep: React.FC<{ x: number }> = ({ x }) => <line x1={x} y1={CT + 4} x2={x} y2={316} stroke={H.lineSoft} strokeWidth={3} />;
const Row: React.FC<{ x: number; y: number; t: string; c: string; a: number; px?: number }> = ({ x, y, t, c, a, px = 30 }) => (
  <g opacity={0.35 + 0.65 * a}><rect x={x} y={y - px * 0.72} width={12} height={px * 0.72} fill={c} /><text x={x + 24} y={y} style={zh(px, H.text, 900)}>{t}</text></g>
);
const FlagBox: React.FC<{ code: string; x: number; y: number; a: number }> = ({ code, x, y, a }) => (
  <g><rect x={x} y={y} width={50} height={36} fill="none" stroke={a > 0.5 ? H.amber : H.lineSoft} strokeWidth={a > 0.5 ? 4 : 1.5} /><Flag code={code} h={28} x={x + 4} y={y + 4} asSvg /></g>
);
const NamePlate: React.FC<{ x: number; y: number; w: number; h: number; t: string; a: number; px?: number }> = ({ x, y, w, h, t, a, px = 34 }) => (
  <g><rect x={x} y={y} width={w} height={h} fill="#FFFFFF" stroke={a > 0.5 ? H.amber : H.lineSoft} strokeWidth={a > 0.5 ? 4 : 1.5} />
    <text x={x + w / 2} y={y + h / 2 + px * 0.34} textAnchor="middle" style={zh(px, "#1F3A5F", 900)}>{t}</text></g>
);

const CLOTH = "#F1EEE4", CLOTHD = "#CDBB88", PREPREG = "#E3B65A", TGL = "#9FC3E8", GLASS = "#BFE3F0", CONC = "#B9B7B0", REBAR = "#6E5A4A", HOT = "#F28A3C";
const Sv: React.FC<{ W: number; Hh: number; children: React.ReactNode }> = ({ W, Hh, children }) => <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>{children}</svg>;
const Weave: React.FC<{ x: number; y: number; w: number; h: number; c: string; d: string; a?: number }> = ({ x, y, w, h, c, d, a = 1 }) => (
  <g opacity={a}><rect x={x} y={y} width={w} height={h} fill={c} stroke={H.text2} strokeWidth={1.5} />
    {Array.from({ length: Math.floor(h / 14) }, (_, i) => <line key={`h${i}`} x1={x} y1={y + 7 + i * 14} x2={x + w} y2={y + 7 + i * 14} stroke={d} strokeWidth={5} />)}
    {Array.from({ length: Math.floor(w / 14) }, (_, i) => <line key={`v${i}`} x1={x + 7 + i * 14} y1={y} x2={x + 7 + i * 14} y2={y + h} stroke={d} strokeWidth={5} strokeDasharray="7 7" strokeDashoffset={i % 2 ? 7 : 0} />)}</g>
);
const Arr: React.FC<{ x1: number; y: number; x2: number; c: string; w?: number }> = ({ x1, y, x2, c, w = 4 }) => { const d = Math.sign(x2 - x1) || 1; return (
  <g><line x1={x1} y1={y} x2={x2 - d * 8} y2={y} stroke={c} strokeWidth={w} /><path d={`M${x2},${y} L${x2 - d * 14},${y - 8} L${x2 - d * 14},${y + 8} Z`} fill={c} /></g>); };

// ── bt-hook：前一集 ABF 載板很貴 → 便宜的載板長怎樣？ ──
const Hook: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330, ch = on(f, T(o, "cheap")), pv = on(f, T(o, "prev")), cp = on(f, T(o, "chip")), pr = on(f, T(o, "pricey"));
  return (<Card o={o} k={k} W={W} Hh={Hh}><Sv W={W} Hh={Hh}>
    <rect x={30} y={CT + 40} width={150} height={150} fill={PCB} stroke={H.text2} strokeWidth={2} opacity={0.4 + 0.6 * pv} /><rect x={70} y={CT + 80} width={70} height={70} fill={SI} opacity={0.4 + 0.6 * pv} />
    <rect x={210} y={CT + 120} width={90} height={70} fill="#7FA36A" stroke={H.text2} strokeWidth={2} /><text x={255} y={CT + 100} textAnchor="middle" style={zh(56, RED, 900)} opacity={ch}>？</text>
    <text x={105} y={CT + 232} textAnchor="middle" style={zh(28, H.text2, 800)}>ABF 載板</text><text x={255} y={CT + 232} textAnchor="middle" style={zh(28, H.text2, 800)}>BT 載板</text>
    <Sep x={334} />
    <Row x={360} y={CT + 56} t="便宜的載板長怎樣？" c={BLUE} a={ch} />
    <Row x={360} y={CT + 122} t="前一集：ABF 載板很貴" c={H.text2} a={pv} />
    <Row x={360} y={CT + 188} t="不是每顆晶片都用得起" c={H.amber} a={Math.max(cp, pr)} />
  </Sv></Card>);
};
// ── bt-make：玻璃纖維布 → 泡樹脂（預浸材）→ 兩面壓銅箔＝核心板 ──
const Make: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330, bt = on(f, T(o, "bt")), cl = on(f, T(o, "cloth")), rs = on(f, T(o, "resin")), cu = on(f, T(o, "cu"));
  return (<Card o={o} k={k} W={W} Hh={Hh}><Sv W={W} Hh={Hh}>
    <Weave x={24} y={CT + 70} w={84} h={84} c={CLOTH} d={CLOTHD} a={0.4 + 0.6 * cl} />
    <Arr x1={112} y={CT + 112} x2={136} c={H.text2} />
    <g opacity={0.4 + 0.6 * rs}><Weave x={140} y={CT + 70} w={84} h={84} c={PREPREG} d="#C9963A" /></g>
    <Arr x1={228} y={CT + 112} x2={248} c={H.text2} />
    <g opacity={0.4 + 0.6 * cu}><rect x={252} y={CT + 80} width={64} height={10} fill={CU} /><rect x={252} y={CT + 90} width={64} height={44} fill={PREPREG} stroke={H.text2} strokeWidth={1.5} /><rect x={252} y={CT + 134} width={64} height={10} fill={CU} /></g>
    <text x={66} y={CT + 196} textAnchor="middle" style={zh(28, H.text2, 800)}>布</text><text x={182} y={CT + 196} textAnchor="middle" style={zh(28, H.text2, 800)}>泡樹脂</text><text x={284} y={CT + 196} textAnchor="middle" style={zh(28, H.text2, 800)}>核心板</text>
    <Sep x={334} />
    <Row x={360} y={CT + 48} t="BT 載板的骨架" c={BLUE} a={bt} />
    <Row x={360} y={CT + 104} t="玻璃纖維布（織出來的）" c={H.text2} a={cl} />
    <Row x={360} y={CT + 160} t="泡樹脂、烘到半乾" c={H.amber} a={rs} />
    <Row x={360} y={CT + 216} t="兩面壓銅箔＝硬核心板" c={OK} a={cu} />
  </Sv></Card>);
};
// ── bt-rebar：鋼筋混凝土（鋼筋＝布、水泥＝樹脂） ──
const Rebar: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330, rc = on(f, T(o, "rc")), rb = on(f, T(o, "rebar")), ce = on(f, T(o, "cement")), hd = on(f, T(o, "hard")), ht = on(f, T(o, "heat"));
  return (<Card o={o} k={k} W={W} Hh={Hh}><Sv W={W} Hh={Hh}>
    <rect x={26} y={CT + 50} width={130} height={110} fill={CONC} stroke={H.text2} strokeWidth={2} opacity={0.4 + 0.6 * rc} />
    {[0, 1].map((j) => [0, 1, 2].map((i) => <circle key={`${i}${j}`} cx={56 + i * 35} cy={CT + 80 + j * 50} r={10} fill={REBAR} opacity={0.4 + 0.6 * Math.max(rc, rb)} />))}
    <text x={91} y={CT + 196} textAnchor="middle" style={zh(28, H.text2, 800)}>鋼筋＋水泥</text>
    <rect x={180} y={CT + 50} width={130} height={110} fill={RESIN} stroke={H.text2} strokeWidth={2} opacity={0.4 + 0.6 * ce} />
    {[0, 1].map((j) => Array.from({ length: 6 }, (_, i) => <ellipse key={`${i}${j}`} cx={192 + i * 21} cy={CT + 80 + j * 50 + (i % 2 ? 7 : -7)} rx={9} ry={6} fill={CLOTH} stroke={CLOTHD} strokeWidth={2} opacity={0.4 + 0.6 * rb} />))}
    <text x={245} y={CT + 196} textAnchor="middle" style={zh(28, H.text2, 800)}>布＋樹脂</text>
    <Sep x={334} />
    <Row x={360} y={CT + 48} t="像鋼筋混凝土" c={BLUE} a={rc} />
    <Row x={360} y={CT + 104} t="布＝鋼筋：撐住不變形" c={H.amber} a={rb} />
    <Row x={360} y={CT + 160} t="樹脂＝水泥：黏成一塊" c={H.amber} a={ce} />
    <Row x={360} y={CT + 216} t="又硬又耐熱" c={OK} a={Math.max(hd, ht)} />
  </Sv></Card>);
};
// ── bt-vs：BT（每層有布、線粗）vs 味之素膜（沒布、線細） ──
const Vs: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330, me = on(f, T(o, "mem")), ph = on(f, T(o, "phone")), ab = on(f, T(o, "abf")), nc = on(f, T(o, "nocloth")), fi = on(f, T(o, "fine")), ai = on(f, T(o, "ai"));
  return (<Card o={o} k={k} W={W} Hh={Hh}><Sv W={W} Hh={Hh}>
    {[0, 1, 2].map((i) => <g key={i}><rect x={24} y={CT + 40 + i * 40} width={130} height={34} fill={PREPREG} stroke={H.text2} strokeWidth={1.5} />
      {Array.from({ length: 6 }, (_, j) => <ellipse key={j} cx={34 + j * 22} cy={CT + 57 + i * 40} rx={7} ry={5} fill={CLOTH} />)}
      {[0, 1, 2].map((j) => <rect key={`c${j}`} x={32 + j * 44 + (i % 2) * 14} y={CT + 70 + i * 40} width={26} height={8} fill={CU} />)}</g>)}
    <text x={89} y={CT + 196} textAnchor="middle" style={zh(28, H.text2, 800)}>BT</text>
    <g opacity={0.4 + 0.6 * ab}>{[0, 1, 2, 3, 4].map((i) => <g key={i}><rect x={180} y={CT + 40 + i * 24} width={130} height={22} fill={i === 2 ? PREPREG : ABF} stroke={H.text2} strokeWidth={1.5} />
      {i !== 2 ? Array.from({ length: 10 }, (_, j) => <rect key={j} x={184 + j * 12.6} y={CT + 58 + i * 24} width={6} height={4} fill={CU} opacity={fi} />) : Array.from({ length: 6 }, (_, j) => <ellipse key={j} cx={190 + j * 22} cy={CT + 51 + i * 24} rx={7} ry={5} fill={CLOTH} />)}</g>)}</g>
    <text x={245} y={CT + 196} textAnchor="middle" style={zh(28, H.text2, 800)}>味之素膜</text>
    <Sep x={334} />
    <Row x={360} y={CT + 56} t="BT：記憶體、手機晶片" c={H.amber} a={Math.max(me, ph)} />
    <Row x={360} y={CT + 122} t="味之素膜沒布（核心仍有布）" c={BLUE} a={Math.max(ab, nc)} />
    <Row x={360} y={CT + 188} t="線更細，給人工智慧晶片" c={OK} a={Math.max(fi, ai)} />
  </Sv></Card>);
};
// ── bt-cte：兩人三腳：晶片幾乎不脹、載板脹得多 → 一拉就翹 ──
const Cte: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330, cl = on(f, T(o, "cloth")), li = on(f, T(o, "little")), mu = on(f, T(o, "much")), lg = on(f, T(o, "legs")), wp = on(f, T(o, "warp"));
  const bend = 26 * wp, ex = 12 * mu;
  return (<Card o={o} k={k} W={W} Hh={Hh}><Sv W={W} Hh={Hh}>
    <rect x={110} y={CT + 70 + bend * 0.1} width={110} height={22} fill={SI} stroke={H.text2} strokeWidth={2} />
    <path d={`M${50 - ex},${CT + 100 - bend} Q165,${CT + 100 + bend} ${280 + ex},${CT + 100 - bend} L${280 + ex},${CT + 124 - bend} Q165,${CT + 124 + bend} ${50 - ex},${CT + 124 - bend} Z`} fill={mu > 0.5 ? HOT : PCB} stroke={H.text2} strokeWidth={2} />
    <g opacity={li}><Arr x1={105} y={CT + 60} x2={92} c={BLUE} w={3} /><Arr x1={225} y={CT + 60} x2={238} c={BLUE} w={3} /></g>
    <g opacity={mu}><Arr x1={46 - ex} y={CT + 150} x2={22 - ex} c={HOT} w={5} /><Arr x1={284 + ex} y={CT + 150} x2={308 + ex} c={HOT} w={5} /></g>
    <text x={165} y={CT + 178} textAnchor="middle" style={zh(28, H.text2, 800)} opacity={0.4 + 0.6 * li}>晶片 ≈3</text>
    <text x={165} y={CT + 210} textAnchor="middle" style={zh(28, H.text2, 800)} opacity={0.4 + 0.6 * li}>載板 ≈15～20</text>
    <text x={165} y={CT + 242} textAnchor="middle" style={zh(28, H.text2, 700)} opacity={0.4 + 0.6 * li}>ppm/°C</text>
    <Sep x={334} />
    <Row x={360} y={CT + 48} t="樹脂受熱伸長，一般布壓不住" c={H.text2} a={cl} />
    <Row x={360} y={CT + 104} t="晶片幾乎不脹、載板脹得多" c={BLUE} a={Math.max(li, mu)} />
    <Row x={360} y={CT + 160} t="像兩人三腳不同步" c={H.amber} a={lg} />
    <Row x={360} y={CT + 216} t="一拉就翹，焊點被拉開" c={RED} a={wp} />
  </Sv></Card>);
};
// ── bt-tglass：低膨脹玻璃布脹得少、拉住載板；約九成出自日東紡（媒體報導） ──
const Tglass: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 392, tg = on(f, T(o, "tg")), ls = on(f, T(o, "less")), ho = on(f, T(o, "hold")), rp = on(f, T(o, "rep")), nn = on(f, T(o, "ninety")), ni = on(f, T(o, "nitto"));
  const cx = 165, cy = CT + 100, r = 76, a1 = -Math.PI / 2 + 2 * Math.PI * 0.9 * nn;
  const pie = nn > 0.01 ? `M${cx},${cy} L${cx},${cy - r} A${r},${r} 0 ${0.9 * nn > 0.5 ? 1 : 0} 1 ${cx + r * Math.cos(a1)},${cy + r * Math.sin(a1)} Z` : "";
  return (<Card o={o} k={k} W={W} Hh={Hh}><Sv W={W} Hh={Hh}>
    <circle cx={cx} cy={cy} r={r} fill={H.lineSoft} opacity={0.4 + 0.6 * rp} />{pie ? <path d={pie} fill={TGL} stroke={H.text2} strokeWidth={2} /> : null}
    <text x={cx} y={CT + 226} textAnchor="middle" style={zh(40, H.text, 900)} opacity={nn}>約九成</text>
    <text x={cx} y={CT + 264} textAnchor="middle" style={zh(28, H.text2, 800)} opacity={0.4 + 0.6 * rp}>全球低膨脹布</text><text x={cx} y={CT + 298} textAnchor="middle" style={zh(28, H.text2, 800)} opacity={0.4 + 0.6 * rp}>（媒體報導）</text>
    <Sep x={334} />
    <Row x={360} y={CT + 48} t="低膨脹玻璃布：脹得少" c={BLUE} a={Math.max(tg, ls)} />
    <Row x={360} y={CT + 104} t="拉住載板，少翹" c={OK} a={ho} />
    <Row x={360} y={CT + 160} t="據報導，約九成出自：" c={H.text2} a={Math.max(rp, nn)} />
    <FlagBox code="JP" x={360} y={CT + 196} a={ni} /><NamePlate x={426} y={CT + 190} w={220} h={50} t="日東紡" a={ni} px={32} />
    <text x={664} y={CT + 226} style={zh(30, H.text2, 800)} opacity={0.4 + 0.6 * ni}>日本玻纖布廠</text>
  </Sv></Card>);
};
// ── bt-flour：人工智慧載板核心也要這種布，大店搶光麵粉，小店斷貨（分析師普遍認為） ──
const Flour: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330, ai = on(f, T(o, "ai")), co = on(f, T(o, "core")), bg = on(f, T(o, "big")), sm = on(f, T(o, "small")), ou = on(f, T(o, "out"));
  return (<Card o={o} k={k} W={W} Hh={Hh}><Sv W={W} Hh={Hh}>
    <rect x={24} y={CT + 40} width={170} height={150} fill={H.lineSoft} stroke={H.text2} strokeWidth={2} opacity={0.4 + 0.6 * ai} />
    {Array.from({ length: 6 }, (_, i) => <circle key={i} cx={56 + (i % 3) * 52} cy={CT + 84 + Math.floor(i / 3) * 56} r={22} fill={TGL} stroke={H.text2} strokeWidth={1.5} opacity={Math.min(1, bg * 6 - i * 0.8 + 0.2) > 0 ? 0.3 + 0.7 * Math.max(0, Math.min(1, bg * 6 - i)) : 0.3} />)}
    <text x={109} y={CT + 226} textAnchor="middle" style={zh(28, H.text2, 800)}>大店</text>
    <rect x={220} y={CT + 100} width={90} height={90} fill="none" stroke={H.text2} strokeWidth={2} opacity={0.4 + 0.6 * sm} />
    <g opacity={ou}><line x1={230} y1={CT + 110} x2={300} y2={CT + 180} stroke={RED} strokeWidth={8} /><line x1={300} y1={CT + 110} x2={230} y2={CT + 180} stroke={RED} strokeWidth={8} /></g>
    <text x={265} y={CT + 226} textAnchor="middle" style={zh(28, H.text2, 800)}>小店</text>
    <Sep x={334} />
    <Row x={360} y={CT + 56} t="人工智慧載板核心也要" c={BLUE} a={Math.max(ai, co)} />
    <Row x={360} y={CT + 122} t="大店先拿走，像搶麵粉" c={H.amber} a={bg} />
    <Row x={360} y={CT + 188} t="小店（BT 載板）斷貨" c={RED} a={Math.max(sm, ou)} />
  </Sv></Card>);
};
// ── bt-expand：日東紡日本、台灣擴廠；台玻開始出貨 ──
const Expand: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 392, ni = on(f, T(o, "nitto")), ex = on(f, Math.max(T(o, "jp"), T(o, "expand"))), tg = on(f, T(o, "tg")), sh = on(f, T(o, "ship"));
  return (<Card o={o} k={k} W={W} Hh={Hh}><Sv W={W} Hh={Hh}>
    <FlagBox code="JP" x={30} y={CT + 36} a={ni} /><FlagBox code="TW" x={90} y={CT + 36} a={ni} /><NamePlate x={158} y={CT + 30} w={240} h={50} t="日東紡" a={ni} px={32} />
    <text x={418} y={CT + 66} style={zh(30, H.text2, 800)} opacity={0.4 + 0.6 * ex}>日本福島、台灣嘉義擴廠</text>
    <text x={418} y={CT + 116} style={zh(28, H.text2, 700)} opacity={0.4 + 0.6 * ex}>公司公告、媒體報導</text>
    <FlagBox code="TW" x={30} y={CT + 176} a={tg} /><NamePlate x={158} y={CT + 170} w={240} h={50} t="台玻 1802" a={tg} px={32} />
    <text x={418} y={CT + 206} style={zh(30, H.text2, 800)} opacity={0.4 + 0.6 * sh}>低膨脹布通過認證、出貨</text>
    <text x={418} y={CT + 256} style={zh(28, H.text2, 700)} opacity={0.4 + 0.6 * sh}>公司說法；量能尚未確定</text>
  </Sv></Card>);
};
// ── bt-co：台灣做 BT 載板的三家（念到的順序：景碩、南電、欣興） ──
const Co: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 392, kin = on(f, T(o, "kin")), nya = on(f, T(o, "nya")), uni = on(f, T(o, "uni"));
  const rows: [string, string, string, number][] = [["TW", "景碩 3189", "BT、ABF 載板（和碩集團）", kin], ["TW", "南電 8046", "BT、ABF 載板（台塑集團）", nya], ["TW", "欣興 3037", "ABF、BT 載板", uni]];
  return (<Card o={o} k={k} W={W} Hh={Hh}><Sv W={W} Hh={Hh}>
    {rows.map(([c, n, s, a], i) => <g key={n}><FlagBox code={c} x={30} y={CT + 30 + i * 96} a={a} /><NamePlate x={98} y={CT + 24 + i * 96} w={300} h={50} t={n} a={a} px={32} />
      <text x={418} y={CT + 60 + i * 96} style={zh(30, H.text2, 800)} opacity={0.4 + 0.6 * a}>{s}</text></g>)}
  </Sv></Card>);
};
// ── bt-next：布再改還是會脹 → 下一集把核心換成整片玻璃（截至 2026/11/27 尚未量產） ──
const Next: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330, st = on(f, T(o, "still")), nx = on(f, T(o, "next")), co = on(f, T(o, "core")), gl = on(f, T(o, "glass")), gs = on(f, T(o, "gs"));
  return (<Card o={o} k={k} W={W} Hh={Hh}><Sv W={W} Hh={Hh}>
    <rect x={24} y={CT + 70} width={120} height={14} fill={ABF} /><rect x={24} y={CT + 84} width={120} height={40} fill={PREPREG} stroke={H.text2} strokeWidth={1.5} opacity={0.4 + 0.6 * Math.max(st, co)} /><rect x={24} y={CT + 124} width={120} height={14} fill={ABF} />
    {Array.from({ length: 5 }, (_, j) => <ellipse key={j} cx={36 + j * 24} cy={CT + 104} rx={8} ry={5} fill={CLOTH} />)}
    <Arr x1={150} y={CT + 104} x2={182} c={H.text2} />
    <g opacity={0.4 + 0.6 * gl}><rect x={190} y={CT + 70} width={120} height={14} fill={ABF} /><rect x={190} y={CT + 84} width={120} height={40} fill={GLASS} stroke={H.text2} strokeWidth={1.5} /><rect x={190} y={CT + 124} width={120} height={14} fill={ABF} />
      {Array.from({ length: 5 }, (_, j) => <rect key={j} x={200 + j * 24} y={CT + 84} width={6} height={40} fill={CU} />)}</g>
    <text x={84} y={CT + 180} textAnchor="middle" style={zh(28, H.text2, 800)}>布核心</text><text x={250} y={CT + 180} textAnchor="middle" style={zh(28, H.text2, 800)}>玻璃核心</text>
    <Sep x={334} />
    <Row x={360} y={CT + 56} t="布再改，還是會脹" c={H.text2} a={st} />
    <Row x={360} y={CT + 122} t="下一集：核心換成整片玻璃" c={BLUE} a={Math.max(nx, co, gl)} />
    <Row x={360} y={CT + 188} t="玻璃基板：還沒量產" c={H.amber} a={gs} />
  </Sv></Card>);
};
// ── bt-cta：缺料會缺多久？留言 BT ──
const Cta: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330, q = on(f, T(o, "q")), kw = on(f, T(o, "kw"));
  const sand = Math.min(1, Math.max(0, (f - T(o, "q")) / 90));
  return (<Card o={o} k={k} W={W} Hh={Hh}><Sv W={W} Hh={Hh}>
    <path d={`M110,${CT + 40} L230,${CT + 40} L170,${CT + 130} Z`} fill="none" stroke={H.text2} strokeWidth={3} /><path d={`M110,${CT + 220} L230,${CT + 220} L170,${CT + 130} Z`} fill="none" stroke={H.text2} strokeWidth={3} />
    <path d={`M${110 + 60 * sand},${CT + 40 + 90 * sand} L${230 - 60 * sand},${CT + 40 + 90 * sand} L170,${CT + 130} Z`} fill={TGL} />
    <path d={`M${170 - 60 * sand},${CT + 220 - 50 * sand} L${170 + 60 * sand},${CT + 220 - 50 * sand} L230,${CT + 220} L110,${CT + 220} Z`} fill={TGL} opacity={sand} />
    <Sep x={334} />
    <Row x={360} y={CT + 70} t="你覺得缺料會缺多久？" c={BLUE} a={q} />
    <Row x={360} y={CT + 150} t="留言「BT」拿完整資料" c={H.amber} a={kw} />
  </Sv></Card>);
};

export const BtSection: React.FC<P> = (p) => {
  const kd = String((p.o as any).kind);
  const M: Record<string, React.FC<P>> = { "bt-hook": Hook, "bt-make": Make, "bt-rebar": Rebar, "bt-vs": Vs, "bt-cte": Cte, "bt-tglass": Tglass, "bt-flour": Flour, "bt-expand": Expand, "bt-co": Co, "bt-next": Next, "bt-cta": Cta };
  const C2 = M[kd]; return C2 ? <C2 {...p} /> : null;
};

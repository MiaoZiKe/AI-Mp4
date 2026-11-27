// 2026/11/27 tech-utility：廠務-2 水、氣、電（系列 2 第 20 集）的 2D 示意卡（overlay `section` 的 kind 以 "util-" 開頭，Hud.tsx 的 HudSection 轉過來）。
//   util-hook 接上集：洗晶圓的水要多乾淨｜util-upw 超純水像濾水壺（濾網＋樹脂），電阻率 18.2 MΩ·cm｜util-loop 一直循環、停著長細菌｜
//   util-water 台積電一天用水約三十多萬噸（換算）｜util-sag 電晃一下、機台當機、半天調回來｜util-ups 像筆電電池：市電一晃 UPS 接手｜
//   util-power 每十度電一度給台積電｜util-gas 氮氣用管線送到每台機台（像自來水管）｜util-co 供應商（國旗＋名牌）｜util-next 下一集探針卡。
// 只放查證過的數字（research.md）：18.2 MΩ·cm（25°C）、2024 全年用水 1.29 億立方公尺、2024 約 9%／2025 推算約 10%；UPS 不標撐多久、壓降不標毫秒。
// 排版（card-overlap.mjs 檢查）：內容從 CARD_CONTENT_TOP 以下；字 ≥30px；字不放進會動的圖形；國旗、LOGO、名牌永遠 100% 不透明（未輪到＝細灰框）。
import React from "react";
import { FONT_ZH } from "../../theme";
import { H, L, CARD_HEAD, CARD_CONTENT_TOP, cardTitleBox } from "./hudSkin";
import { EASE, tween } from "../anim";
import type { Model3D, Overlay3D, State3D } from "./engine";
import { Flag, LogoSvg, logoW } from "./Brand";

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
const RED = "#E0472F", OK = "#14A38B", BLUE = "#2F7FE0", WAT = "#4FA3E8", UPW = "#9FDBFF", ORG = "#F29A4A", GRY = "#98A2B3", AMB = "#F2C14A", BEAD = "#E8A33C", N2 = "#3FB8C4", POW = "#F2B632", BAT = "#2FBF71";
const Sep: React.FC<{ x: number; y2?: number }> = ({ x, y2 = 316 }) => <line x1={x} y1={CT + 4} x2={x} y2={y2} stroke={H.lineSoft} strokeWidth={3} />;
const Row: React.FC<{ x: number; y: number; t: string; c: string; a: number; px?: number }> = ({ x, y, t, c, a, px = 30 }) => (
  <g opacity={0.35 + 0.65 * a}><rect x={x} y={y - px * 0.72} width={12} height={px * 0.72} fill={c} /><text x={x + 24} y={y} style={zh(px, H.text, 900)}>{t}</text></g>
);
const FlagBox: React.FC<{ code: string; x: number; y: number; a: number }> = ({ code, x, y, a }) => (
  <g><rect x={x} y={y} width={50} height={36} fill="#FFFFFF" stroke={a > 0.5 ? H.amber : H.lineSoft} strokeWidth={a > 0.5 ? 4 : 1.5} /><Flag code={code} h={28} x={x + 4} y={y + 4} asSvg /></g>
);
const NamePlate: React.FC<{ x: number; y: number; w: number; h: number; t: string; a: number; px?: number }> = ({ x, y, w, h, t, a, px = 32 }) => (
  <g><rect x={x} y={y} width={w} height={h} fill="#FFFFFF" stroke={a > 0.5 ? H.amber : H.lineSoft} strokeWidth={a > 0.5 ? 4 : 1.5} />
    <text x={x + w / 2} y={y + h / 2 + px * 0.34} textAnchor="middle" style={zh(px, "#1F3A5F", 900)}>{t}</text></g>
);
const LogoBox: React.FC<{ id: string; x: number; y: number; h: number; a: number }> = ({ id, x, y, h, a }) => {
  const w = logoW(id, h - 12) + 16;
  return <g><rect x={x} y={y} width={w} height={h} fill="#FFFFFF" stroke={a > 0.5 ? H.amber : H.lineSoft} strokeWidth={a > 0.5 ? 4 : 1.5} /><LogoSvg id={id} x={x + 8} y={y + 6} h={h - 12} /></g>;
};
// 濾水壺（比喻小圖）：壺身、濾芯（上段濾網、下段樹脂珠）、水滴往下
const Pitcher: React.FC<{ x: number; y: number; a: number; mem: number; res: number; f: number }> = ({ x, y, a, mem, res, f }) => (
  <g opacity={0.4 + 0.6 * a}>
    <path d={`M${x} ${y} L${x + 150} ${y} L${x + 140} ${y + 170} L${x + 10} ${y + 170} Z`} fill="#EAF6FF" stroke={H.text2} strokeWidth={3} />
    <path d={`M${x + 150} ${y + 20} q36 10 26 60 q-6 30 -30 34`} fill="none" stroke={H.text2} strokeWidth={6} />
    <rect x={x + 40} y={y + 10} width={70} height={36} fill={mem > 0.5 ? "#FFFFFF" : "#E9EEF4"} stroke={mem > 0.5 ? H.amber : H.text2} strokeWidth={mem > 0.5 ? 4 : 2} />
    {[0, 1, 2, 3, 4, 5].map((i) => <line key={i} x1={x + 46 + i * 11} y1={y + 14} x2={x + 46 + i * 11} y2={y + 42} stroke={GRY} strokeWidth={2} />)}
    <rect x={x + 40} y={y + 46} width={70} height={44} fill="#FFF4DA" stroke={res > 0.5 ? H.amber : H.text2} strokeWidth={res > 0.5 ? 4 : 2} />
    {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => <circle key={i} cx={x + 50 + (i % 4) * 16} cy={y + 58 + Math.floor(i / 4) * 18} r={6} fill={BEAD} />)}
    {[0, 1, 2].map((i) => { const u = fr(f * 0.03 + i / 3); return <circle key={i} cx={x + 75} cy={y + 96 + u * 60} r={6} fill={WAT} opacity={a * (1 - 0.5 * u)} />; })}
    <rect x={x + 12} y={y + 130} width={126} height={38} fill={UPW} opacity={0.8} />
  </g>
);

// ── util-hook：前一集無塵室空氣乾淨了；這集：洗晶圓的水要多乾淨？左圖＝水滴＋問號 ──
const Hook: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330, ws = on(f, T(o, "wash")), cl = on(f, T(o, "clean")), pv = on(f, T(o, "prev")), ai = on(f, T(o, "air")), pu = Math.sin(f * 0.14) * 0.5 + 0.5;
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        <path d={`M150 ${CT + 16} C150 ${CT + 16} 90 ${CT + 100} 90 ${CT + 150} a60 60 0 0 0 120 0 C210 ${CT + 100} 150 ${CT + 16} 150 ${CT + 16} Z`} fill={UPW} stroke={BLUE} strokeWidth={4} opacity={0.4 + 0.6 * ws} />
        <text x={150} y={CT + 176} textAnchor="middle" style={zh(64, RED, 900)} opacity={cl * (0.6 + 0.4 * pu)}>？</text>
        <Sep x={318} />
        <Row x={344} y={CT + 56} t="洗晶圓的水，要多乾淨？" c={BLUE} a={cl} />
        <Row x={344} y={CT + 122} t="前一集：無塵室" c={H.text2} a={pv} />
        <Row x={344} y={CT + 188} t="連空氣都過濾乾淨" c={OK} a={ai} />
      </svg>
    </Card>
  );
};

// ── util-upw：超純水＝幾乎只剩水分子；濾水壺比喻（濾網＋樹脂）；電阻率 18.2 MΩ·cm（25°C） ──
const Upw: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330, up = on(f, T(o, "upw")), mo = on(f, T(o, "mol")), pi = on(f, T(o, "pitcher")), me = on(f, T(o, "mem")), re = on(f, T(o, "resin")), ca = on(f, T(o, "catch"));
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        <Pitcher x={36} y={CT + 14} a={pi} mem={me} res={re} f={f} />
        <Sep x={262} />
        <text x={290} y={CT + 58} style={zh(52, BLUE, 900)} opacity={0.4 + 0.6 * up}>18.2</text>
        <text x={290} y={CT + 96} style={zh(30, H.text2, 800)} opacity={0.4 + 0.6 * up}>MΩ·cm</text>
        <text x={290} y={CT + 134} style={zh(30, H.text2, 800)} opacity={0.4 + 0.6 * up}>電阻率</text>
        <Sep x={440} />
        <Row x={466} y={CT + 52} t="幾乎只剩水分子" c={BLUE} a={mo} />
        <Row x={466} y={CT + 112} t="濾網：逆滲透膜擋雜質" c={H.amber} a={me} />
        <Row x={466} y={CT + 172} t="樹脂：一顆顆抓走離子" c={ORG} a={re} />
        <Row x={466} y={CT + 232} t="紫外線、超過濾再拋光" c={OK} a={ca} />
      </svg>
    </Card>
  );
};

// ── util-loop：一直循環（環狀箭頭＋流動點）vs 停著不動的支管（細菌點冒出） ──
const Loop: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330, lp = on(f, T(o, "loop")), st = on(f, T(o, "stop")), ba = on(f, T(o, "bact"), 20);
  const cx = 120, cy = CT + 120, r = 74;
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke={UPW} strokeWidth={22} opacity={0.4 + 0.6 * lp} /><circle cx={cx} cy={cy} r={r} fill="none" stroke={BLUE} strokeWidth={3} opacity={0.4 + 0.6 * lp} />
        {[0, 1, 2, 3, 4, 5].map((i) => { const a = (fr(f * 0.012 + i / 6)) * Math.PI * 2; return <circle key={i} cx={cx + r * Math.cos(a)} cy={cy + r * Math.sin(a)} r={7} fill={BLUE} opacity={lp} />; })}
        <rect x={cx + r - 2} y={cy - 11} width={110} height={22} fill="#EAF6FF" stroke={H.text2} strokeWidth={2} opacity={0.4 + 0.6 * st} />
        <rect x={cx + r + 104} y={cy - 18} width={12} height={36} fill={RED} opacity={0.4 + 0.6 * st} />
        {[0, 1, 2, 3, 4].map((i) => <circle key={i} cx={cx + r + 20 + i * 18} cy={cy + (i % 2 ? -4 : 4)} r={4 + 3 * ba} fill={"#3FBF4F"} opacity={ba} />)}
        <Sep x={360} />
        <Row x={386} y={CT + 56} t="一直循環流動" c={BLUE} a={lp} />
        <Row x={386} y={CT + 122} t="停著不動的支管" c={RED} a={st} />
        <Row x={386} y={CT + 188} t="就會長細菌" c={OK} a={ba} />
      </svg>
    </Card>
  );
};

// ── util-water：台積電全公司一天用水約三十多萬噸＝2024 全年 1.29 億立方公尺 ÷365（換算）；≈ 140 座標準泳池（換算，每座 2,500 立方公尺） ──
const Water: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330, ts = on(f, T(o, "tsmc")), dy = on(f, T(o, "day")), nm = on(f, T(o, "num"), 16);
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        <LogoBox id="tsmc" x={30} y={CT + 12} h={72} a={ts} /><FlagBox code="TW" x={140} y={CT + 30} a={ts} />
        <text x={30} y={CT + 160} style={zh(60, BLUE, 900)} opacity={0.4 + 0.6 * nm}>約 35 萬噸</text>
        <text x={30} y={CT + 206} style={zh(30, H.text2, 800)} opacity={0.4 + 0.6 * dy}>每天（換算，約數）</text>
        <Sep x={352} />
        <Row x={378} y={CT + 52} t="2024 全年用水 1.29 億立方公尺" c={BLUE} a={dy} />
        <Row x={378} y={CT + 112} t="÷365 天；全部用水，不只超純水" c={H.text2} a={dy} />
        <Row x={378} y={CT + 164} t="約 140 座標準泳池" c={OK} a={nm} />
        {Array.from({ length: 14 }, (_, i) => <rect key={i} x={404 + i * 36} y={CT + 182} width={30} height={22} fill={i < Math.round(14 * nm) ? WAT : "#E9EEF4"} stroke={H.text2} strokeWidth={1.5} />)}
        <text x={404} y={CT + 246} style={zh(30, H.text2, 700)} opacity={0.4 + 0.6 * nm}>一格＝10 座（每座 2,500 立方公尺）</text>
      </svg>
    </Card>
  );
};

// ── util-sag：電壓波形晃一下（凹一段）→ 機台當機（紅叉）→ 要花半天調回來（時鐘） ──
const Sag: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330, el = on(f, T(o, "elec")), sg = on(f, T(o, "sag")), tl = on(f, T(o, "tool")), cr = on(f, T(o, "crash")), hf = on(f, T(o, "half"));
  const y0 = CT + 80, pts = Array.from({ length: 81 }, (_, i) => { const x = 30 + i * 3.4, dip = sg > 0.01 && i > 34 && i < 50 ? 0.4 : 1; return `${x.toFixed(1)},${(y0 - 40 * dip * Math.sin(i * 0.6)).toFixed(1)}`; }).join(" ");
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        <polyline points={pts} fill="none" stroke={POW} strokeWidth={4} opacity={0.4 + 0.6 * el} />
        <rect x={146} y={y0 - 52} width={56} height={104} fill="none" stroke={RED} strokeWidth={3} strokeDasharray="8 6" opacity={sg} />
        <rect x={40} y={CT + 150} width={110} height={80} fill="#F3F5F8" stroke={H.text2} strokeWidth={3} opacity={0.4 + 0.6 * tl} />
        <path d={`M70 ${CT + 168} l50 44 M120 ${CT + 168} l-50 44`} stroke={RED} strokeWidth={8} opacity={cr} />
        <circle cx={240} cy={CT + 190} r={42} fill="#FFFFFF" stroke={H.text2} strokeWidth={4} opacity={0.4 + 0.6 * hf} />
        <path d={`M240 ${CT + 190} L240 ${CT + 160} M240 ${CT + 190} L240 ${CT + 222}`} stroke={H.text} strokeWidth={5} opacity={0.4 + 0.6 * hf} />
        <path d={`M240 ${CT + 148} A42 42 0 0 1 240 ${CT + 232}`} fill="none" stroke={ORG} strokeWidth={8} opacity={hf} />
        <Sep x={318} />
        <Row x={344} y={CT + 52} t="電只要晃一下（壓降）" c={POW} a={sg} />
        <Row x={344} y={CT + 118} t="敏感的機台就當機" c={RED} a={cr} />
        <Row x={344} y={CT + 184} t="要花半天調回來" c={ORG} a={hf} />
        <Row x={344} y={CT + 250} t="2021 竹科壓降，媒體報導" c={H.text2} a={hf} />
      </svg>
    </Card>
  );
};

// ── util-ups：三條時間軸（市電：晃一下｜UPS：立刻接手｜機台：一直有電）；筆電電池比喻 ──
const Ups: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330, bk = on(f, T(o, "backup")), lp = on(f, T(o, "laptop")), mn = on(f, T(o, "mains")), up = on(f, T(o, "ups"));
  const X0 = 150, X1 = 420, xm = 270;
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        {[["市電", POW, CT + 40], ["UPS", BAT, CT + 100], ["機台", BLUE, CT + 160]].map(([t, c, y]) => <text key={t as string} x={30} y={(y as number) + 12} style={zh(30, H.text, 900)}>{t as string}</text>)}
        <rect x={X0} y={CT + 26} width={X1 - X0} height={26} fill={POW} opacity={0.4 + 0.6 * bk} /><rect x={xm} y={CT + 26} width={30} height={26} fill="#FFFFFF" stroke={RED} strokeWidth={3} opacity={mn} />
        <rect x={xm} y={CT + 86} width={30} height={26} fill={BAT} opacity={up} />
        <rect x={X0} y={CT + 146} width={X1 - X0} height={26} fill={BLUE} opacity={0.4 + 0.6 * bk} />
        <g opacity={0.4 + 0.6 * lp}><rect x={40} y={CT + 196} width={120} height={66} fill="#F3F5F8" stroke={H.text2} strokeWidth={3} /><rect x={20} y={CT + 262} width={160} height={10} fill={H.text2} />
          <rect x={200} y={CT + 214} width={84} height={40} fill="none" stroke={H.text2} strokeWidth={4} /><rect x={284} y={CT + 226} width={8} height={16} fill={H.text2} />
          <rect x={206} y={CT + 220} width={72 * Math.max(0.25, 1 - 0.4 * up)} height={28} fill={BAT} /></g>
        <Sep x={452} />
        <Row x={478} y={CT + 52} t="關鍵位置有備用電源" c={BAT} a={bk} />
        <Row x={478} y={CT + 118} t="像筆電的電池" c={H.text2} a={lp} />
        <Row x={478} y={CT + 184} t="市電一晃，UPS 接手" c={POW} a={mn} />
        <Row x={478} y={CT + 250} t="機台不會當機" c={BLUE} a={up} />
      </svg>
    </Card>
  );
};

// ── util-power：全台用電 10 格，其中 1 格是台積電（2024 約 9%、2025 推算約 10%，報導）；先進廠：超過一半花在空調與冷卻（報導） ──
const Power: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330, tn = on(f, T(o, "ten")), on1 = on(f, T(o, "one"), 14), ts = on(f, T(o, "tsmc"));
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        {Array.from({ length: 10 }, (_, i) => <g key={i}><rect x={30 + (i % 5) * 58} y={CT + 16 + Math.floor(i / 5) * 76} width={50} height={66} fill={i === 9 && on1 > 0.5 ? ORG : "#F3F5F8"} stroke={i === 9 && on1 > 0.5 ? RED : H.text2} strokeWidth={i === 9 && on1 > 0.5 ? 4 : 2} opacity={0.4 + 0.6 * tn} />
          <path d={`M${55 + (i % 5) * 58} ${CT + 28 + Math.floor(i / 5) * 76} l-10 22 h12 l-6 22 l18 -28 h-12 l6 -16 z`} fill={i === 9 && on1 > 0.5 ? "#FFFFFF" : POW} opacity={0.4 + 0.6 * tn} /></g>)}
        <LogoBox id="tsmc" x={30} y={CT + 186} h={64} a={ts} /><FlagBox code="TW" x={136} y={CT + 200} a={ts} />
        <Sep x={340} />
        <Row x={366} y={CT + 52} t="2024 約占全台用電 9%" c={ORG} a={on1} />
        <Row x={366} y={CT + 112} t="2025 推算約一成（報導）" c={H.text2} a={on1} />
        <Row x={366} y={CT + 172} t="先進廠：超過一半在空調、冷卻等" c={BLUE} a={ts} />
        <text x={390} y={CT + 222} style={zh(30, H.text2, 700)} opacity={0.4 + 0.6 * ts}>（報導，以先進製程廠為例）</text>
        <rect x={390} y={CT + 240} width={520} height={26} fill="#E9EEF4" stroke={H.text2} strokeWidth={2} opacity={0.4 + 0.6 * ts} />
        <rect x={390} y={CT + 240} width={520 * 0.461 * ts} height={26} fill={GRY} /><rect x={390 + 520 * 0.461} y={CT + 240} width={520 * 0.539 * ts} height={26} fill={BLUE} />
      </svg>
    </Card>
  );
};

// ── util-gas：空分廠（廠外）→ 地下管線 → 減壓站 → 閥箱 → 機台；氮氣（惰性氣體）像自來水管一樣被壓力推著走 ──
const Gas: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330, n2 = on(f, T(o, "n2")), pp = on(f, T(o, "pipe")), ou = on(f, T(o, "out")), tl = on(f, T(o, "tool")), tp = on(f, T(o, "tap"));
  const y = CT + 120, xs = [40, 120, 190, 260];
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        <rect x={30} y={CT + 20} width={44} height={96} fill="#C8CED8" stroke={H.text2} strokeWidth={3} opacity={0.4 + 0.6 * ou} />
        <path d={`M74 ${y} L300 ${y}`} stroke="#D7DEE8" strokeWidth={22} opacity={0.4 + 0.6 * pp} /><path d={`M74 ${y} L300 ${y}`} stroke={H.text2} strokeWidth={2} strokeDasharray="0" opacity={0.4 + 0.6 * pp} fill="none" />
        {Array.from({ length: 8 }, (_, i) => { const u = fr(f * 0.02 + i / 8); return <circle key={i} cx={78 + u * 218} cy={y + (i % 3 - 1) * 5} r={i % 3 === 1 ? 6 : 4} fill={N2} opacity={pp} />; })}
        <rect x={250} y={y - 50} width={50} height={100} fill="#F3F5F8" stroke={tl > 0.5 ? H.amber : H.text2} strokeWidth={tl > 0.5 ? 4 : 2} opacity={0.4 + 0.6 * tl} />
        <path d={`M120 ${CT + 196} l0 30 l40 0`} stroke={H.text2} strokeWidth={8} fill="none" opacity={0.4 + 0.6 * tp} /><circle cx={120} cy={CT + 190} r={12} fill={RED} opacity={0.4 + 0.6 * tp} />
        {[0, 1].map((i) => { const u = fr(f * 0.03 + i / 2); return <circle key={i} cx={166} cy={CT + 230 + u * 30} r={5} fill={WAT} opacity={tp * (1 - u)} />; })}
        <Sep x={330} />
        <Row x={356} y={CT + 52} t="氮氣：惰性氣體，到處都要" c={N2} a={n2} />
        <Row x={356} y={CT + 112} t="從廠外的空氣分離廠" c={H.text2} a={ou} />
        <Row x={356} y={CT + 172} t="經地下管線送到每台機台" c={BLUE} a={tl} />
        <Row x={356} y={CT + 232} t="像自來水管：壓力推著走" c={OK} a={tp} />
      </svg>
    </Card>
  );
};

// ── util-co：水有日本的 Organo；氣有聯華林德、三福氣體（台灣）。LOGO 原檔抓不到，用白底深色字名牌（不仿商標）；國旗程式繪製 ──
const Co: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 392, wa = on(f, T(o, "water")), og = on(f, T(o, "org")), lh = on(f, T(o, "lh")), sf = on(f, T(o, "sf"));
  const rows: [string, string, string, number][] = [["JP", "Organo", "水：超純水設備（日本）", og], ["TW", "聯華林德", "氣：大宗氣體（空分廠）", lh], ["TW", "三福氣體", "氣：大宗氣體（空分廠）", sf]];
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        <text x={30} y={CT + 34} style={zh(32, H.text2, 900)} opacity={0.4 + 0.6 * wa}>媒體報導的供應商，不排名</text>
        {rows.map(([c, n, s, a], i) => <g key={n}><FlagBox code={c} x={30} y={CT + 62 + i * 96} a={a} /><NamePlate x={98} y={CT + 56 + i * 96} w={260} h={50} t={n} a={a} px={32} />
          <text x={378} y={CT + 92 + i * 96} style={zh(30, H.text2, 800)} opacity={0.4 + 0.6 * a}>{s}</text></g>)}
      </svg>
    </Card>
  );
};

// ── util-next：水氣電備齊、晶圓做完；下一集探針卡（小圖：探針卡壓在晶圓上） ──
const Next: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330, rd = on(f, T(o, "ready")), hw = on(f, T(o, "how")), pr = on(f, T(o, "probe")), kw = on(f, T(o, "kw"));
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        {[["水", WAT, 40], ["氣", N2, 120], ["電", POW, 200]].map(([t, c, x]) => <g key={t as string} opacity={0.4 + 0.6 * rd}><rect x={x as number} y={CT + 16} width={66} height={56} fill={c as string} /><text x={(x as number) + 33} y={CT + 56} textAnchor="middle" style={zh(34, "#FFFFFF", 900)}>{t as string}</text></g>)}
        <g opacity={0.4 + 0.6 * pr}><rect x={50} y={CT + 104 + 30 * (1 - pr)} width={200} height={20} fill="#2F7A4A" stroke={H.text2} strokeWidth={2} />
          {Array.from({ length: 9 }, (_, i) => <line key={i} x1={110 + i * 10} y1={CT + 124 + 30 * (1 - pr)} x2={110 + i * 10} y2={CT + 150 + 30 * (1 - pr)} stroke="#7D8CA6" strokeWidth={3} />)}
          <rect x={40} y={CT + 186} width={220} height={14} fill="#5E6B82" />{Array.from({ length: 6 }, (_, i) => <rect key={i} x={56 + i * 34} y={CT + 176} width={26} height={10} fill={i === 2 || i === 3 ? (pr > 0.9 ? OK : "#8D9BB5") : "#8D9BB5"} />)}</g>
        <Sep x={318} />
        <Row x={344} y={CT + 50} t="水氣電備齊，晶圓做完" c={OK} a={rd} />
        <Row x={344} y={CT + 112} t="每顆晶片好不好？" c={BLUE} a={hw} />
        <Row x={344} y={CT + 174} t="下一集：探針卡" c={H.amber} a={pr} />
        <Row x={344} y={CT + 236} t="留言「水氣電」拿完整資料" c={H.text2} a={kw} />
      </svg>
    </Card>
  );
};

export const UtilitySection: React.FC<P> = (p) => {
  const kd = String((p.o as any).kind);
  if (kd === "util-hook") return <Hook {...p} />;
  if (kd === "util-upw") return <Upw {...p} />;
  if (kd === "util-loop") return <Loop {...p} />;
  if (kd === "util-water") return <Water {...p} />;
  if (kd === "util-sag") return <Sag {...p} />;
  if (kd === "util-ups") return <Ups {...p} />;
  if (kd === "util-power") return <Power {...p} />;
  if (kd === "util-gas") return <Gas {...p} />;
  if (kd === "util-co") return <Co {...p} />;
  if (kd === "util-next") return <Next {...p} />;
  return null;
};

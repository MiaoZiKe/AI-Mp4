// 2026/11/27 tech-pad：研磨墊（系列 2 第 17 集）的 2D 示意卡（overlay `section` 的 kind 以 "pad-" 開頭，Hud.tsx 的 HudSection 轉過來）。
//   pad-hook 接上集：誰來把晶圓磨平｜pad-what 研磨墊三層（研磨層、子墊、背膠）鋪在圓台｜pad-grind 砂紙磨木板：凸處先被磨低、整體變平｜
//   pad-pore 細孔抓研磨液、溝槽（鞋底紋路）排碎屑｜pad-glaze 用久的抹布：尖峰磨平、磨粒抓不住｜pad-dress 梳子梳起壓扁的毛：鑽石碟把表面刷粗｜
//   pad-wear 墊子磨薄就整片換掉、機台停下來｜pad-hard 太軟順著起伏磨不平、太硬容易刮傷｜pad-co 三家供應商（國旗＋名牌）｜pad-next 下一集耗材。
// 全部示意：不標壓力、硬度、溝槽尺寸、壽命；只放查證過的說法。結構一開始就畫出，念到時該處亮起、動起來；時間全部來自 script.json 的 t（cue）。
// 排版原則（card-overlap.mjs 檢查）：內容從 CARD_CONTENT_TOP 以下；字不放進會動的圖形範圍；字 ≥30px；字離圖形 ≥6px。
// 公司 LOGO：Qnity、富士紡、頌勝的官方原檔當天抓不到（見 videos/tech-pad/assets.md），一律用白底深色文字名牌（不仿商標）＋國旗，國旗與名牌 100% 不透明。
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
const RED = "#E0472F", OK = "#14A38B", BLUE = "#2F7FE0", ORG = "#F29A4A", GRY = "#98A2B3", CREAM = "#F0E2BA", CREAMD = "#D6C69A", SUB = "#8F95A0", ADH = "#A8D0EE", DARK = "#5C533C", GLZ = "#E6DCC4", SOFT = "#F3E8CD", HARD = "#B58B5A", AMB = "#F2C14A";
const Sep: React.FC<{ x: number }> = ({ x }) => <line x1={x} y1={CT + 4} x2={x} y2={316} stroke={H.lineSoft} strokeWidth={3} />;
const Row: React.FC<{ x: number; y: number; t: string; c: string; a: number; px?: number }> = ({ x, y, t, c, a, px = 30 }) => (
  <g opacity={0.35 + 0.65 * a}><rect x={x} y={y - px * 0.72} width={12} height={px * 0.72} fill={c} /><text x={x + 24} y={y} style={zh(px, H.text, 900)}>{t}</text></g>
);
const Chip: React.FC<{ x: number; y: number; w: number; t: string; a: number; c?: string }> = ({ x, y, w, t, a, c = "#FFF4DA" }) => (
  <g opacity={0.4 + 0.6 * a}><rect x={x} y={y} width={w} height={50} fill={a > 0.5 ? c : "#FFFFFF"} stroke={a > 0.5 ? H.amber : H.lineSoft} strokeWidth={a > 0.5 ? 4 : 2} />
    <text x={x + w / 2} y={y + 35} textAnchor="middle" style={zh(30, H.text, 900)}>{t}</text></g>
);
const FlagBox: React.FC<{ code: string; x: number; y: number; a: number }> = ({ code, x, y, a }) => (
  <g><rect x={x} y={y} width={50} height={36} fill="none" stroke={a > 0.5 ? H.amber : H.lineSoft} strokeWidth={a > 0.5 ? 4 : 1.5} /><Flag code={code} h={28} x={x + 4} y={y + 4} asSvg /></g>
);
const NamePlate: React.FC<{ x: number; y: number; w: number; h: number; t: string; a: number; px?: number }> = ({ x, y, w, h, t, a, px = 34 }) => (
  <g><rect x={x} y={y} width={w} height={h} fill="#FFFFFF" stroke={a > 0.5 ? H.amber : H.lineSoft} strokeWidth={a > 0.5 ? 4 : 1.5} />
    <text x={x + w / 2} y={y + h / 2 + px * 0.34} textAnchor="middle" style={zh(px, "#1F3A5F", 900)}>{t}</text></g>
);

// ── pad-hook：前一集研磨液備好；誰來把晶圓真正磨平？左圖＝晶圓表面高低不平（等著被磨平） ──
const Hook: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330, pv = on(f, T(o, "prev")), q = on(f, T(o, "q")), pu = Math.sin(f * 0.14) * 0.5 + 0.5;
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        <path d={`M30 ${CT + 150} L60 ${CT + 150} L60 ${CT + 112} L112 ${CT + 112} L112 ${CT + 150} L150 ${CT + 150} L150 ${CT + 96} L215 ${CT + 96} L215 ${CT + 150} L260 ${CT + 150} L260 ${CT + 120} L282 ${CT + 120} L282 ${CT + 150} L290 ${CT + 150} L290 ${CT + 196} L30 ${CT + 196} Z`} fill={ORG} opacity={0.35 + 0.65 * q} stroke={H.text2} strokeWidth={3} />
        <text x={160} y={CT + 70} textAnchor="middle" style={zh(60, RED, 900)} opacity={q * (0.6 + 0.4 * pu)}>？</text>
        <Sep x={318} />
        <Row x={344} y={CT + 56} t="誰來把晶圓真正磨平？" c={BLUE} a={q} />
        <Row x={344} y={CT + 122} t="前一集：研磨液備好了" c={H.text2} a={pv} />
        <Row x={344} y={CT + 188} t="線索：一塊會轉的墊子" c={H.amber} a={q} />
      </svg>
    </Card>
  );
};

// ── pad-what：研磨墊三層疊起來（研磨層、子墊、背膠）鋪在圓台上；有彈性的塑膠圓墊 ──
const What: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330, ans = on(f, T(o, "ans")), pd = on(f, T(o, "pad")), sf = on(f, T(o, "soft")), rd = on(f, T(o, "round"));
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        <rect x={34} y={CT + 12} width={250} height={44} fill={CREAM} stroke={sf > 0.5 ? H.amber : H.text2} strokeWidth={sf > 0.5 ? 5 : 3} opacity={0.4 + 0.6 * pd} />
        {[0, 1, 2, 3, 4, 5].map((i) => <circle key={i} cx={64 + i * 38} cy={CT + 30} r={6} fill={DARK} opacity={0.4 + 0.6 * pd} />)}
        <rect x={34} y={CT + 62} width={250} height={44} fill={SUB} stroke={H.text2} strokeWidth={3} opacity={0.4 + 0.6 * pd} />
        <rect x={34} y={CT + 112} width={250} height={14} fill={ADH} stroke={H.text2} strokeWidth={3} opacity={0.4 + 0.6 * pd} />
        <rect x={20} y={CT + 150} width={278} height={52} fill="#C9D2DE" stroke={rd > 0.5 ? H.amber : H.text2} strokeWidth={rd > 0.5 ? 5 : 3} opacity={0.4 + 0.6 * rd} />
        <path d={`M${309} ${CT + 150} q10 -14 20 0 q10 14 20 0`} fill="none" stroke={H.amber} strokeWidth={4} opacity={rd} transform="translate(-20 4)" />
        <Sep x={340} />
        <Row x={366} y={CT + 52} t="答案：研磨墊" c={H.amber} a={ans} />
        <Row x={366} y={CT + 112} t="一塊有彈性的塑膠圓墊" c={BLUE} a={sf} />
        <Row x={366} y={CT + 172} t="三層：研磨層、子墊、背膠" c={H.text2} a={pd} />
        <Row x={366} y={CT + 232} t="鋪在會旋轉的圓台" c={OK} a={rd} />
      </svg>
    </Card>
  );
};

// ── pad-grind：砂紙磨木板。凸的地方壓力大、先被磨低；凹處慢，整體慢慢變平（高度隨 sand→bump→off 降低） ──
const Grind: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330, sa = on(f, T(o, "sand")), bu = on(f, T(o, "bump")), of = on(f, T(o, "off"), 40);
  const hh = 54 * (1 - 0.92 * of), y0 = CT + 176, sl = Math.sin(f * 0.1) * 14;
  const xs = [48, 108, 168, 228];
  const col = of > 0.7 ? OK : bu > 0.5 ? RED : H.text2;
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        <rect x={30} y={y0} width={260} height={32} fill="#D9B98A" stroke={H.text2} strokeWidth={3} />
        {xs.map((x, i) => <rect key={i} x={x} y={y0 - hh} width={34} height={hh} fill={col} opacity={0.4 + 0.6 * sa} />)}
        <g transform={`translate(${sl} 0)`} opacity={0.4 + 0.6 * sa}><rect x={80} y={y0 - 100} width={150} height={26} fill="#C9A24A" stroke={H.text2} strokeWidth={3} /><rect x={80} y={y0 - 74} width={150} height={8} fill="#8E7A4B" /></g>
        <Sep x={318} />
        <Row x={344} y={CT + 52} t="像拿砂紙磨木板" c={H.text2} a={sa} />
        <Row x={344} y={CT + 118} t="凸的地方壓力大，先被磨" c={RED} a={bu} />
        <Row x={344} y={CT + 184} t="凹處磨得慢，整體變平" c={OK} a={of} />
      </svg>
    </Card>
  );
};

// ── pad-pore：細孔抓住研磨液；溝槽像鞋底紋路，讓藥水流動、帶走碎屑 ──
const Pore: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330, pr = on(f, T(o, "pore")), gv = on(f, T(o, "groove")), sh = on(f, T(o, "shoe")), ch = on(f, T(o, "chip"));
  const y0 = CT + 150;
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        <rect x={26} y={y0} width={110} height={64} fill={CREAM} stroke={H.text2} strokeWidth={3} /><rect x={196} y={y0} width={110} height={64} fill={CREAM} stroke={H.text2} strokeWidth={3} />
        <rect x={26} y={y0 + 64} width={280} height={22} fill={SUB} stroke={H.text2} strokeWidth={3} />
        {[[50, 22], [92, 40], [220, 26], [268, 42], [112, 24]].map(([x, y], i) => <circle key={i} cx={x} cy={y0 + y} r={9} fill={pr > 0.5 ? "#FFFFFF" : DARK} stroke={DARK} strokeWidth={3} opacity={0.5 + 0.5 * pr} />)}
        <rect x={136} y={y0 + 4} width={60} height={60} fill="#FBF6E8" opacity={0.4 + 0.6 * gv} />
        {[0, 1, 2].map((i) => { const u = fr(f * 0.016 + i / 3); return <circle key={i} cx={152 + (i % 2) * 28} cy={y0 + 6 + u * 54} r={6} fill={i === 1 ? DARK : H.amber} opacity={gv * (1 - 0.4 * u)} />; })}
        <path d={`M40 ${CT + 40} l16 -16 l16 16 l16 -16 l16 16 l16 -16 l16 16 l16 -16 l16 16 l16 -16 l16 16`} fill="none" stroke={DARK} strokeWidth={6} opacity={0.35 + 0.65 * sh} />
        <Sep x={334} />
        <Row x={360} y={CT + 48} t="細孔：抓住研磨液" c={BLUE} a={pr} />
        <Row x={360} y={CT + 104} t="溝槽：讓藥水流動" c={H.amber} a={gv} />
        <Row x={360} y={CT + 160} t="像鞋底紋路排水" c={H.text2} a={sh} />
        <Row x={360} y={CT + 216} t="一起帶走碎屑" c={OK} a={ch} />
      </svg>
    </Card>
  );
};

// ── pad-glaze：用久的抹布。新墊微凸起尖、抓得住磨粒；磨久變平滑、磨粒抓不住 ──
const Glaze: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330, lg = on(f, T(o, "long")), sl = on(f, T(o, "slick"), 24), rg = on(f, T(o, "rag")), ls = on(f, T(o, "lose"));
  const y1 = CT + 96, y2 = CT + 198, h = 26 * (1 - 0.82 * sl);
  const teeth = (y: number, hh: number) => `M30 ${y} ` + Array.from({ length: 8 }, (_, i) => `l17 ${-hh} l17 ${hh}`).join(" ");
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        <text x={34} y={CT + 26} style={zh(30, H.text2, 800)} opacity={0.4 + 0.6 * lg}>新墊</text>
        <path d={teeth(y1, 26)} fill="none" stroke={DARK} strokeWidth={5} opacity={0.5 + 0.5 * lg} /><rect x={30} y={y1} width={272} height={14} fill={CREAM} stroke={H.text2} strokeWidth={2} />
        {[0, 1, 2].map((i) => <circle key={i} cx={64 + i * 68} cy={y1 - 14} r={7} fill={H.amber} opacity={0.5 + 0.5 * lg} />)}
        <text x={34} y={y2 - 52} style={zh(30, H.text2, 800)} opacity={0.4 + 0.6 * sl}>用久的墊</text>
        <path d={teeth(y2, h)} fill="none" stroke={DARK} strokeWidth={5} opacity={0.5 + 0.5 * sl} /><rect x={30} y={y2} width={272} height={14} fill={GLZ} stroke={H.text2} strokeWidth={2} />
        {[0, 1, 2].map((i) => { const u = fr(f * 0.015 + i / 3); return <circle key={i} cx={64 + i * 68 + u * 40} cy={y2 - 12 - u * 24} r={7} fill={H.amber} opacity={ls * (1 - u * 0.5)} />; })}
        <Sep x={334} />
        <Row x={360} y={CT + 52} t="磨久了，尖尖的凸起磨平" c={H.text2} a={sl} />
        <Row x={360} y={CT + 118} t="像用久的抹布，滑滑的" c={H.amber} a={rg} />
        <Row x={360} y={CT + 184} t="磨粒抓不住，磨不動" c={RED} a={ls} />
      </svg>
    </Card>
  );
};

// ── pad-dress：鑽石碟來回掃，把表面刷粗；像梳子梳起壓扁的毛 ──
const Dress: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330, di = on(f, T(o, "dia")), sw = on(f, T(o, "sweep")), rg = on(f, T(o, "rough")), cb = on(f, T(o, "comb"));
  const y0 = CT + 190, cx = 60 + 150 * (0.5 + 0.5 * Math.sin(f * 0.08));
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        {Array.from({ length: 12 }, (_, i) => { const x = 40 + i * 22, lean = (1 - cb) * 14; return <line key={i} x1={x} y1={y0} x2={x + lean} y2={y0 - 16 - 24 * cb} stroke={DARK} strokeWidth={5} opacity={0.5 + 0.5 * rg} />; })}
        <rect x={30} y={y0} width={280} height={18} fill={CREAM} stroke={H.text2} strokeWidth={2} />
        <g transform={`translate(${cx - 110} 0)`} opacity={0.4 + 0.6 * di}><rect x={50} y={CT + 52} width={120} height={24} fill="#B5BCC8" stroke={H.text2} strokeWidth={3} />{[0, 1, 2, 3, 4].map((i) => <path key={i} d={`M${62 + i * 22} ${CT + 76} l8 0 l-4 22 Z`} fill="#BFEFFF" stroke={H.text2} strokeWidth={1.5} />)}</g>
        <Sep x={334} />
        <Row x={360} y={CT + 52} t="鑽石碟來回掃過墊子" c={H.amber} a={sw} />
        <Row x={360} y={CT + 118} t="把磨滑的表面重新刷粗" c={BLUE} a={rg} />
        <Row x={360} y={CT + 184} t="像梳子梳起壓扁的毛" c={OK} a={cb} />
      </svg>
    </Card>
  );
};

// ── pad-wear：墊子還是會磨薄；到壽命整片換掉，機台停下來 ──
const Wear: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330, th = on(f, T(o, "thin")), sw = on(f, T(o, "swap")), st = on(f, T(o, "stop"));
  const y0 = CT + 200;
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        <rect x={30} y={y0 - 92} width={110} height={92} fill={CREAM} stroke={H.text2} strokeWidth={3} />
        <rect x={190} y={y0 - 92 * (1 - 0.7 * th)} width={110} height={92 * (1 - 0.7 * th)} fill={GLZ} stroke={H.text2} strokeWidth={3} />
        <path d={`M148 ${y0 - 46} l32 0`} stroke={H.amber} strokeWidth={5} opacity={th} /><path d={`M180 ${y0 - 46} l-10 -8 l0 16 Z`} fill={H.amber} opacity={th} transform="translate(0 0)" />
        <text x={30} y={y0 + 42} style={zh(30, H.text2, 800)}>新墊</text><text x={190} y={y0 + 42} style={zh(30, H.text2, 800)}>用久的墊</text>
        <Sep x={334} />
        <Row x={360} y={CT + 48} t="磨薄，溝槽也變淺" c={H.text2} a={th} />
        <Row x={360} y={CT + 112} t="磨到不行，整片換掉" c={H.amber} a={sw} />
        <Row x={360} y={CT + 176} t="機台得停下來" c={RED} a={st} />
        <g opacity={0.3 + 0.7 * st}><circle cx={402} cy={CT + 232} r={16} fill={RED} /><rect x={394} y={CT + 224} width={16} height={16} fill="#FFFFFF" /></g>
      </svg>
    </Card>
  );
};

// ── pad-hard：太軟順著起伏磨不平；太硬容易刮傷（左軟右硬） ──
const Hard: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330, sf = on(f, T(o, "soft")), fl = on(f, T(o, "flat")), tg = on(f, T(o, "tough")), sc = on(f, T(o, "scr"));
  const y0 = CT + 96;
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        <rect x={24} y={y0 - 34} width={196} height={30} fill="#5E6B82" opacity={0.4 + 0.6 * sf} />{[44, 120, 176].map((x, i) => <rect key={i} x={x} y={y0 - 4} width={26} height={24} fill={ORG} opacity={0.4 + 0.6 * sf} />)}
        <path d={`M24 ${y0 + 54} L44 ${y0 + 54} L44 ${y0 + 22} L70 ${y0 + 22} L70 ${y0 + 54} L120 ${y0 + 54} L120 ${y0 + 22} L146 ${y0 + 22} L146 ${y0 + 54} L176 ${y0 + 54} L176 ${y0 + 22} L202 ${y0 + 22} L202 ${y0 + 54} L220 ${y0 + 54} L220 ${y0 + 90} L24 ${y0 + 90} Z`} fill={SOFT} stroke={H.text2} strokeWidth={3} opacity={0.4 + 0.6 * sf} />
        <rect x={252} y={y0 - 34} width={196} height={30} fill="#5E6B82" opacity={0.4 + 0.6 * tg} />{[272, 348, 404].map((x, i) => <rect key={i} x={x} y={y0 - 4} width={26} height={24} fill={RED} opacity={0.4 + 0.6 * tg} />)}
        <rect x={252} y={y0 + 22} width={196} height={68} fill={HARD} stroke={H.text2} strokeWidth={3} opacity={0.4 + 0.6 * tg} />
        <circle cx={338} cy={y0 + 14} r={8} fill={DARK} opacity={sc} /><path d={`M300 ${y0 - 22} l56 0`} stroke={RED} strokeWidth={5} opacity={sc} />
        <text x={24} y={y0 + 130} style={zh(30, H.text, 900)} opacity={0.4 + 0.6 * sf}>軟：凹處也被碰</text><text x={252} y={y0 + 130} style={zh(30, H.text, 900)} opacity={0.4 + 0.6 * tg}>硬：只碰凸處</text>
        <Sep x={472} />
        <Row x={498} y={CT + 52} t="太軟：順著起伏" c={H.amber} a={sf} />
        <Row x={498} y={CT + 104} t="磨不平" c={H.amber} a={fl} />
        <Row x={498} y={CT + 170} t="太硬：碎屑一壓" c={RED} a={tg} />
        <Row x={498} y={CT + 222} t="容易刮傷" c={RED} a={sc} />
      </svg>
    </Card>
  );
};

// ── pad-co：杜邦分家出來的電子材料公司（Qnity）、日本富士紡、台灣頌勝（上市，旗下智勝做研磨墊） ──
const Co: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 392, it = on(f, T(o, "intl")), dp = on(f, T(o, "dp")), fb = on(f, T(o, "fb")), tw = on(f, T(o, "tw")), sh = on(f, T(o, "sh"));
  const rows: [string, string, string, string, number][] = [["US", "Qnity", "原杜邦電子事業，2025/11 分家", "美國", dp], ["JP", "富士紡 Fujibo", "日本", "", fb], ["TW", "頌勝 7768", "上市；旗下智勝做研磨墊", "台灣", sh]];
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        <text x={30} y={CT + 34} style={zh(34, H.text2, 900)} opacity={0.4 + 0.6 * it}>少數幾家，不排名</text>
        {rows.map(([c, n, s, , a], i) => <g key={c}><FlagBox code={c} x={30} y={CT + 62 + i * 96} a={a} /><NamePlate x={98} y={CT + 56 + i * 96} w={300} h={50} t={n} a={a} px={32} />
          <text x={418} y={CT + 92 + i * 96} style={zh(30, H.text2, 800)} opacity={0.4 + 0.6 * a}>{s}</text></g>)}
      </svg>
    </Card>
  );
};

// ── pad-next：下一集耗材（墊子、鑽石碟、石英環） ──
const Next: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330, wr = on(f, T(o, "wear")), nx = on(f, T(o, "next")), kw = on(f, T(o, "kw"));
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        <g opacity={0.4 + 0.6 * wr}><ellipse cx={70} cy={CT + 150} rx={50} ry={20} fill={CREAM} stroke={H.text2} strokeWidth={3} /><rect x={20} y={CT + 130} width={100} height={20} fill={CREAM} /><ellipse cx={70} cy={CT + 130} rx={50} ry={20} fill={CREAMD} stroke={H.text2} strokeWidth={3} /></g>
        <g opacity={0.4 + 0.6 * nx}><ellipse cx={180} cy={CT + 140} rx={44} ry={18} fill="#B5BCC8" stroke={H.text2} strokeWidth={3} />{[0, 1, 2, 3, 4].map((i) => <circle key={i} cx={150 + i * 15} cy={CT + 140} r={3} fill="#BFEFFF" />)}</g>
        <g opacity={0.4 + 0.6 * kw}><ellipse cx={270} cy={CT + 160} rx={36} ry={16} fill="none" stroke="#9CC4E4" strokeWidth={10} /><ellipse cx={270} cy={CT + 132} rx={36} ry={16} fill="none" stroke="#9CC4E4" strokeWidth={10} /></g>
        <Sep x={334} />
        <Row x={360} y={CT + 56} t="下一集：耗材" c={H.text2} a={nx} />
        <Row x={360} y={CT + 122} t="墊子、鑽石碟、石英環" c={BLUE} a={wr} />
        <Row x={360} y={CT + 188} t="留言「研磨墊」拿完整資料" c={H.amber} a={kw} />
      </svg>
    </Card>
  );
};

export const PadSection: React.FC<P> = (p) => {
  const kd = String((p.o as any).kind);
  if (kd === "pad-hook") return <Hook {...p} />;
  if (kd === "pad-what") return <What {...p} />;
  if (kd === "pad-grind") return <Grind {...p} />;
  if (kd === "pad-pore") return <Pore {...p} />;
  if (kd === "pad-glaze") return <Glaze {...p} />;
  if (kd === "pad-dress") return <Dress {...p} />;
  if (kd === "pad-wear") return <Wear {...p} />;
  if (kd === "pad-hard") return <Hard {...p} />;
  if (kd === "pad-co") return <Co {...p} />;
  if (kd === "pad-next") return <Next {...p} />;
  return null;
};

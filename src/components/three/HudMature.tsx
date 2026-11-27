// 2026/11/28 tech-mature：中游補充篇 M1「成熟與特殊製程代工」的 2D 示意卡（overlay `section` 的 kind 以 "mature-" 開頭，Hud.tsx 的 HudSection 轉過來）。寫法照 HudGlass.tsx。
//   mature-hook 接系列一（先進拚三奈米）→ 都要這麼先進嗎｜mature-dish 奈米刻度尺＋家常菜｜mature-power 水龍頭（功率元件）＋配電盤（電源管理）｜
//   mature-ddi 螢幕逐列掃描（驅動晶片）＋8 吋／12 吋晶圓｜mature-tw 台灣三家（聯電、世界先進：Commons 原檔 LOGO；力積電：原檔抓不到→白底文字名牌）＋國旗｜
//   mature-cn 中國廠占前十大成熟產能超過四分之一（TrendForce 估計）｜mature-market 夜市攤位變多→價格壓低→台廠轉向車用、AI 伺服器電源｜mature-next 下一集記憶體＋留言關鍵字。
// LOGO、國旗 100% 不透明（未輪到用細灰框）。
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
void CARD_HEAD;
const Card: React.FC<{ o: Overlay3D; k: number; W: number; Hh: number; children: React.ReactNode }> = ({ o, k, W, Hh, children }) => (
  <div style={{ position: "absolute", left: o.x ?? L.X, top: o.y ?? 900, width: W, height: Hh, opacity: k, background: H.cardCompare, border: `2px solid ${H.lineSoft}`, boxSizing: "border-box", overflow: "hidden" }}>
    {o.title ? <div style={{ ...zh(CARD_HEAD.px, onC(H.line), 800), ...cardTitleBox(), background: H.line, zIndex: 2 }}>{o.title}</div> : null}
    {o.tag ? <div style={{ position: "absolute", right: 16, top: 14, ...zh(28, H.text2, 600), zIndex: 2 }}>{o.tag}</div> : null}
    {children}
  </div>
);
const on = (f: number, at: number, d = 10) => tween(f, at, d, EASE.enter);
const RED = "#E0472F", BLUE = "#2F7FE0", SI = "#5E6B82", CHIP = "#2B2E35", PIN = "#B9C1CC", WATER = "#4FA3E8", POW = "#F2B632", WAF = "#A7B3C8", AWN = "#E5484D";
const Sep: React.FC<{ x: number; y2?: number }> = ({ x, y2 = 316 }) => <line x1={x} y1={CT + 4} x2={x} y2={y2} stroke={H.lineSoft} strokeWidth={3} />;
const Row: React.FC<{ x: number; y: number; t: string; c: string; a: number; px?: number }> = ({ x, y, t, c, a, px = 30 }) => (
  <g opacity={0.35 + 0.65 * a}><rect x={x} y={y - px * 0.72} width={12} height={px * 0.72} fill={c} /><text x={x + 24} y={y} style={zh(px, H.text, 900)}>{t}</text></g>
);
const Sv: React.FC<{ W: number; Hh: number; children: React.ReactNode }> = ({ W, Hh, children }) => <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>{children}</svg>;
const Arr: React.FC<{ x1: number; y1: number; x2: number; y2: number; c: string; w?: number }> = ({ x1, y1, x2, y2, c, w = 4 }) => {
  const a = Math.atan2(y2 - y1, x2 - x1), ex = x2 - 12 * Math.cos(a), ey = y2 - 12 * Math.sin(a), px = 8 * Math.sin(a), py = -8 * Math.cos(a);
  return (<g><line x1={x1} y1={y1} x2={ex} y2={ey} stroke={c} strokeWidth={w} /><path d={`M${x2},${y2} L${ex + px},${ey + py} L${ex - px},${ey - py} Z`} fill={c} /></g>);
};
// 小晶片圖示：黑色本體＋兩側接腳
const Chip: React.FC<{ x: number; y: number; w: number; h: number; c?: string; a?: number; pins?: number }> = ({ x, y, w, h, c = CHIP, a = 1, pins = 4 }) => (
  <g opacity={a}>{Array.from({ length: pins }, (_, i) => { const yy = y + ((i + 0.5) * h) / pins - 3; return <g key={i}><rect x={x - 8} y={yy} width={8} height={6} fill={PIN} /><rect x={x + w} y={yy} width={8} height={6} fill={PIN} /></g>; })}
    <rect x={x} y={y} width={w} height={h} rx={3} fill={c} /><circle cx={x + 7} cy={y + 7} r={3} fill={SI} /></g>
);
const FlagBox: React.FC<{ code: string; x: number; y: number; a: number }> = ({ code, x, y, a }) => (
  <g><rect x={x} y={y} width={50} height={36} fill="#FFFFFF" stroke={a > 0.5 ? H.amber : H.lineSoft} strokeWidth={a > 0.5 ? 4 : 1.5} /><Flag code={code} h={28} x={x + 4} y={y + 4} asSvg /></g>
);
const LogoPlate: React.FC<{ id: string; x: number; y: number; w: number; h: number; a: number; lh: number }> = ({ id, x, y, w, h, a, lh }) => (
  <g><rect x={x} y={y} width={w} height={h} fill="#FFFFFF" stroke={a > 0.5 ? H.amber : H.lineSoft} strokeWidth={a > 0.5 ? 4 : 1.5} />
    <LogoSvg id={id} x={x + (w - logoW(id, lh)) / 2} y={y + (h - lh) / 2} h={lh} /></g>
);
const NamePlate: React.FC<{ x: number; y: number; w: number; h: number; t: string; a: number; px?: number }> = ({ x, y, w, h, t, a, px = 28 }) => (
  <g><rect x={x} y={y} width={w} height={h} fill="#FFFFFF" stroke={a > 0.5 ? H.amber : H.lineSoft} strokeWidth={a > 0.5 ? 4 : 1.5} />
    <text x={x + w / 2} y={y + h / 2 + px * 0.34} textAnchor="middle" style={zh(px, "#1F3A5F", 900)}>{t}</text></g>
);
const Wafer: React.FC<{ cx: number; cy: number; r: number; a: number }> = ({ cx, cy, r, a }) => {
  const st = 13, n = Math.floor(r / st);
  return (<g opacity={a}><circle cx={cx} cy={cy} r={r} fill={WAF} stroke={SI} strokeWidth={2} />
    {Array.from({ length: 2 * n + 1 }, (_, i) => { const d = (i - n) * st, hw = Math.sqrt(Math.max(0, r * r - d * d)) - 4; return (<g key={i}>
      <line x1={cx + d} y1={cy - hw} x2={cx + d} y2={cy + hw} stroke={SI} strokeWidth={1} opacity={0.5} /><line x1={cx - hw} y1={cy + d} x2={cx + hw} y2={cy + d} stroke={SI} strokeWidth={1} opacity={0.5} /></g>); })}
    <rect x={cx - 4} y={cy + r - 6} width={8} height={7} fill={H.cardCompare} /></g>);
};

// ── mature-hook：系列一的代工拚三奈米 → 每顆晶片都要這麼先進嗎？ ──
const Hook: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330, pv = on(f, T(o, "prev")), nm = on(f, T(o, "nm3")), q = on(f, T(o, "q"));
  return (<Card o={o} k={k} W={W} Hh={Hh}><Sv W={W} Hh={Hh}>
    <rect x={30} y={CT + 20} width={280} height={170} rx={10} fill="#2F6E4F" />
    <Chip x={130} y={CT + 60} w={80} h={80} c={BLUE} pins={5} a={0.5 + 0.5 * nm} />
    <text x={170} y={CT + 108} textAnchor="middle" style={zh(24, "#FFFFFF", 900)} opacity={nm}>3 奈米</text>
    {[[52, CT + 40], [52, CT + 130], [250, CT + 40], [250, CT + 130]].map(([x, y], i) => <Chip key={i} x={x} y={y} w={34} h={34} pins={3} a={0.45 + 0.55 * q} />)}
    <text x={170} y={CT + 232} textAnchor="middle" style={zh(28, H.text2, 800)}>其他晶片呢？</text>
    <Sep x={334} />
    <Row x={360} y={CT + 56} t="前一集：晶圓測完" c={H.text2} a={pv} />
    <Row x={360} y={CT + 122} t="系列一：代工拚三奈米" c={BLUE} a={nm} />
    <Row x={360} y={CT + 188} t="每顆晶片都要這麼先進？" c={H.amber} a={q} />
  </Sv></Card>);
};
// ── mature-dish：奈米刻度尺（先進｜成熟 28 奈米以上）＋家常菜 ──
const Dish: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330, no = on(f, T(o, "no")), mt = on(f, T(o, "n28"), 16), di = on(f, T(o, "dish")), dy = on(f, T(o, "daily"));
  const ticks = ["3", "5", "7", "16", "28", "40", "65", "90", "180"], x0 = 40, dx = 66;
  return (<Card o={o} k={k} W={W} Hh={Hh}><Sv W={W} Hh={Hh}>
    <rect x={x0 - 10} y={CT + 26} width={dx * 3 + 4} height={44} fill={BLUE} opacity={0.25 + 0.5 * no} />
    <rect x={x0 + dx * 4 - 20} y={CT + 26} width={(dx * 4 + 40) * mt} height={44} fill={H.amber} opacity={0.85} />
    <line x1={x0 - 10} y1={CT + 70} x2={x0 + dx * 8 + 20} y2={CT + 70} stroke={H.text2} strokeWidth={3} />
    {ticks.map((t, i) => <g key={t}><line x1={x0 + i * dx} y1={CT + 70} x2={x0 + i * dx} y2={CT + 84} stroke={H.text2} strokeWidth={3} />
      <text x={x0 + i * dx} y={CT + 116} textAnchor="middle" style={zh(26, i === 4 ? H.text : H.text2, i === 4 ? 900 : 700)}>{t}</text></g>)}
    <text x={x0 + dx} y={CT + 160} textAnchor="middle" style={zh(28, BLUE, 900)} opacity={0.4 + 0.6 * no}>先進</text>
    <text x={x0 + dx * 6} y={CT + 160} textAnchor="middle" style={zh(28, H.text, 900)} opacity={0.4 + 0.6 * mt}>成熟製程（奈米）</text>
    <text x={x0 + dx * 4} y={CT + 210} style={zh(26, H.text2, 800)} opacity={mt}>28 奈米以上</text>
    <Sep x={640} />
    <g opacity={0.4 + 0.6 * di}><path d={`M680,${CT + 70} Q790,${CT + 170} 900,${CT + 70} Z`} fill="#F4E3C3" stroke={H.text2} strokeWidth={3} />
      <ellipse cx={790} cy={CT + 70} rx={110} ry={14} fill="#E9C27A" stroke={H.text2} strokeWidth={2} />
      {[0, 1, 2].map((i) => <path key={i} d={`M${760 + i * 30},${CT + 50} q8,-14 0,-28`} stroke={H.text2} strokeWidth={3} fill="none" />)}</g>
    <text x={790} y={CT + 176} textAnchor="middle" style={zh(30, H.text, 900)} opacity={0.4 + 0.6 * di}>家常菜</text>
    <text x={790} y={CT + 222} textAnchor="middle" style={zh(28, H.amber, 900)} opacity={0.3 + 0.7 * dy}>天天少不了</text>
  </Sv></Card>);
};
// ── mature-power：功率元件＝水龍頭（閘極把手開、大電流流過）｜電源管理晶片＝配電盤（一路進、分好幾路出去）──
const Power: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330, el = on(f, T(o, "elec")), tp = on(f, T(o, "tap"), 14), cur = on(f, T(o, "big")), bd = on(f, T(o, "board"), 14), sp = on(f, T(o, "split"));
  const ang = -90 * tp, ph = (f % 30) / 30;
  return (<Card o={o} k={k} W={W} Hh={Hh}><Sv W={W} Hh={Hh}>
    {/* 水龍頭：管、龍頭、把手（轉 90 度＝開），水柱（大電流） */}
    <rect x={40} y={CT + 50} width={150} height={34} fill={PIN} stroke={SI} strokeWidth={2} />
    <path d={`M190,${CT + 50} h40 a20,20 0 0 1 20,20 v40 h-34 v-26 h-26 Z`} fill={PIN} stroke={SI} strokeWidth={2} />
    <g transform={`rotate(${ang} 200 ${CT + 44})`}><rect x={196} y={CT + 4} width={8} height={40} fill={SI} /><rect x={170} y={CT + 2} width={60} height={12} rx={6} fill={RED} /></g>
    <text x={30} y={CT + 30} style={zh(22, H.text2, 800)}>把手＝閘極</text>
    {cur > 0.05 ? <g>{[0, 1, 2, 3].map((i) => { const yy = CT + 112 + ((i / 4 + ph) % 1) * 90; return <rect key={i} x={220} y={yy} width={26} height={18} rx={8} fill={WATER} opacity={cur} />; })}
      <rect x={226} y={CT + 112} width={14} height={90} fill={WATER} opacity={0.45 * cur} /></g> : null}
    <rect x={180} y={CT + 206} width={110} height={16} fill={SI} opacity={0.6} />
    <text x={150} y={CT + 160} textAnchor="end" style={zh(28, H.text, 900)} opacity={0.35 + 0.65 * Math.max(el, tp)}>功率元件</text>
    <text x={150} y={CT + 200} textAnchor="end" style={zh(24, H.text2, 800)} opacity={0.35 + 0.65 * cur}>開關大電流</text>
    <Sep x={340} />
    {/* 配電盤：一路電進來，經電源管理晶片分給處理器、記憶體、螢幕 */}
    <Arr x1={360} y1={CT + 120} x2={440} y2={CT + 120} c={POW} w={6} />
    <text x={400} y={CT + 100} textAnchor="middle" style={zh(24, H.text2, 800)}>電池</text>
    <rect x={446} y={CT + 64} width={150} height={112} rx={8} fill="#F7F3EA" stroke={H.text2} strokeWidth={3} opacity={0.4 + 0.6 * bd} />
    {[0, 1, 2].map((i) => <rect key={i} x={466 + i * 42} y={CT + 84} width={28} height={40} rx={3} fill={i === 1 ? H.amber : SI} opacity={0.4 + 0.6 * bd} />)}
    <text x={521} y={CT + 160} textAnchor="middle" style={zh(24, H.text, 900)} opacity={0.4 + 0.6 * bd}>電源管理</text>
    {["處理器", "記憶體", "螢幕"].map((t, i) => { const y = CT + 40 + i * 80; return (<g key={t} opacity={0.3 + 0.7 * sp}>
      <Arr x1={598} y1={CT + 120} x2={690} y2={y} c={POW} w={5} />
      <rect x={698} y={y - 26} width={150} height={52} rx={6} fill="#FFFFFF" stroke={H.lineSoft} strokeWidth={2} />
      <text x={773} y={y + 10} textAnchor="middle" style={zh(28, H.text, 900)}>{t}</text></g>); })}
    <text x={521} y={CT + 226} textAnchor="middle" style={zh(26, H.amber, 900)} opacity={0.35 + 0.65 * bd}>像配電盤</text>
  </Sv></Card>);
};
// ── mature-ddi：驅動晶片逐列點亮螢幕｜8 吋（200 mm）與 12 吋（300 mm）晶圓 ──
const Ddi: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330, dd = on(f, T(o, "ddi")), px = on(f, T(o, "pixel")), wf = on(f, T(o, "w8")), w12 = on(f, T(o, "w12"));
  const lit = px > 0 ? Math.floor(((f - T(o, "pixel")) / 3) % 12) : -1;
  return (<Card o={o} k={k} W={W} Hh={Hh}><Sv W={W} Hh={Hh}>
    <rect x={40} y={CT + 14} width={300} height={170} rx={8} fill="#1C2230" />
    {Array.from({ length: 6 * 10 }, (_, i) => { const r = Math.floor(i / 10), c = i % 10, on1 = px > 0 && (r <= lit % 6 || lit >= 6);
      return <rect key={i} x={56 + c * 28} y={CT + 28 + r * 25} width={20} height={17} rx={2} fill={on1 ? ["#E5484D", "#2FBF71", "#3B82F6"][c % 3] : "#2E3646"} />; })}
    <rect x={110} y={CT + 192} width={160} height={22} rx={3} fill={CHIP} stroke={H.amber} strokeWidth={dd > 0.5 ? 3 : 0} />
    <text x={190} y={CT + 246} textAnchor="middle" style={zh(28, H.text, 900)} opacity={0.4 + 0.6 * dd}>驅動晶片</text>
    <Sep x={370} />
    <Wafer cx={490} cy={CT + 108} r={67} a={0.4 + 0.6 * wf} />
    <Wafer cx={750} cy={CT + 104} r={100} a={0.4 + 0.6 * w12} />
    <text x={490} y={CT + 226} textAnchor="middle" style={zh(28, H.text, 900)} opacity={0.4 + 0.6 * wf}>8 吋 200mm</text>
    <text x={750} y={CT + 246} textAnchor="middle" style={zh(28, H.text, 900)} opacity={0.4 + 0.6 * w12}>12 吋 300mm</text>
  </Sv></Card>);
};
// ── mature-tw：台灣三家（s5 聯電；s6 世界先進、力積電），每家一句身分 ──
const Tw: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 400, tw = on(f, T(o, "tw")), u = on(f, T(o, "umc")), v = on(f, T(o, "vis")), p = on(f, T(o, "psmc"));
  const rows: { logo?: string; lh?: number; name: string; code: string; s1: string; s2: string; a: number }[] = [
    { logo: "umc", lh: 32, name: "聯電", code: "2303", s1: "TrendForce：全球第四大代工廠", s2: "2Q26 市占 3.9%｜強項：驅動晶片", a: u },
    { logo: "vis", lh: 46, name: "世界先進", code: "5347", s1: "台積電也持股", s2: "主力：功率、電源晶片｜8 吋廠為主", a: v },
    { logo: "psmc", lh: 30, name: "力積電", code: "6770", s1: "記憶體＋邏輯代工", s2: "本集只談代工身分", a: p },
  ];
  return (<Card o={o} k={k} W={W} Hh={Hh}><Sv W={W} Hh={Hh}>
    {rows.map((r, i) => { const y = CT + 8 + i * 106; return (<g key={r.name}>
      <FlagBox code="TW" x={20} y={y + 16} a={Math.max(tw, r.a)} />
      {r.logo ? <LogoPlate id={r.logo} x={84} y={y} w={170} h={64} a={r.a} lh={r.lh!} /> : <NamePlate x={84} y={y} w={170} h={64} t="力積電 PSMC" a={r.a} px={26} />}
      <text x={170} y={y + 94} textAnchor="middle" style={zh(24, H.text2, 800)}>{r.name} {r.code}</text>
      <text x={286} y={y + 32} style={zh(30, H.text, 900)} opacity={0.4 + 0.6 * r.a}>{r.s1}</text>
      <text x={286} y={y + 74} style={zh(26, H.text2, 800)} opacity={0.4 + 0.6 * r.a}>{r.s2}</text></g>); })}
  </Sv></Card>);
};
// ── mature-cn：前十大成熟製程產能，中國廠超過四分之一（TrendForce 估計，分析預期）──
const Cn: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330, cn = on(f, T(o, "cn")), tf = on(f, T(o, "tf")), q = on(f, T(o, "quarter"), 18);
  const cx = 170, cy = CT + 122, r = 104, a1 = -Math.PI / 2 + 2 * Math.PI * 0.27 * q, big = 0.27 * q > 0.5 ? 1 : 0;
  return (<Card o={o} k={k} W={W} Hh={Hh}><Sv W={W} Hh={Hh}>
    <circle cx={cx} cy={cy} r={r} fill="#DDE3EC" stroke={H.text2} strokeWidth={2} />
    {q > 0.01 ? <path d={`M${cx},${cy} L${cx},${cy - r} A${r},${r} 0 ${big} 1 ${cx + r * Math.cos(a1)},${cy + r * Math.sin(a1)} Z`} fill={RED} /> : null}
    <line x1={cx} y1={cy} x2={cx + r} y2={cy} stroke="#FFFFFF" strokeWidth={3} strokeDasharray="6 5" opacity={q} />
    <text x={cx + 46} y={cy - 30} textAnchor="middle" style={zh(28, "#FFFFFF", 900)} opacity={q}>中國</text>
    <Sep x={330} />
    <FlagBox code="CN" x={356} y={CT + 14} a={cn} />
    <text x={424} y={CT + 44} style={zh(30, H.text, 900)} opacity={0.4 + 0.6 * cn}>中國在大擴產</text>
    <Row x={360} y={CT + 116} t="前十大成熟製程產能" c={H.text2} a={tf} />
    <Row x={360} y={CT + 176} t="中國廠將超過四分之一" c={RED} a={q} />
    <text x={360} y={CT + 232} style={zh(24, H.text2, 800)} opacity={0.4 + 0.6 * tf}>TrendForce 預估（2025 年底，分析預期）</text>
  </Sv></Card>);
};
// ── mature-market：新廠一座座蓋（夜市攤位變多）→ 價格壓低 → 台廠轉向車用、AI 伺服器電源 ──
const Market: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330, st = on(f, T(o, "stall"), 30), pr = on(f, T(o, "price"), 14), car = on(f, T(o, "car")), ai = on(f, T(o, "ai"));
  const n = Math.round(2 + 6 * st);
  return (<Card o={o} k={k} W={W} Hh={Hh}><Sv W={W} Hh={Hh}>
    {Array.from({ length: 8 }, (_, i) => { const x = 30 + (i % 4) * 78, y = CT + 18 + Math.floor(i / 4) * 92; return (<g key={i} opacity={i < n ? 1 : 0.12}>
      <path d={`M${x},${y + 24} L${x + 10},${y} L${x + 60},${y} L${x + 70},${y + 24} Z`} fill={AWN} />
      {[0, 1, 2].map((j) => <rect key={j} x={x + 14 + j * 16} y={y} width={8} height={24} fill="#FFFFFF" />)}
      <rect x={x + 6} y={y + 24} width={58} height={44} fill="#F7F3EA" stroke={H.text2} strokeWidth={2} /><rect x={x + 22} y={y + 40} width={26} height={28} fill={SI} /></g>); })}
    <text x={180} y={CT + 226} textAnchor="middle" style={zh(28, H.text, 900)} opacity={0.4 + 0.6 * st}>攤位一下變多</text>
    <Sep x={346} />
    <text x={420} y={CT + 46} textAnchor="middle" style={zh(28, H.text, 900)}>價格</text>
    <rect x={396} y={CT + 64 + 100 * pr} width={48} height={140 - 100 * pr} fill={RED} />
    <Arr x1={470} y1={CT + 70} x2={470} y2={CT + 190} c={RED} w={5} />
    <text x={420} y={CT + 236} textAnchor="middle" style={zh(26, RED, 900)} opacity={pr}>被壓低</text>
    <Sep x={520} />
    <text x={545} y={CT + 40} style={zh(26, H.text2, 800)}>台廠轉向較難的晶片</text>
    <g opacity={0.35 + 0.65 * car}><rect x={545} y={CT + 70} width={380} height={64} rx={8} fill="#FFFFFF" stroke={car > 0.5 ? H.amber : H.lineSoft} strokeWidth={car > 0.5 ? 4 : 2} />
      <path d={`M565,${CT + 116} h70 l-8,-20 h-50 Z`} fill={BLUE} /><circle cx={580} cy={CT + 118} r={7} fill={SI} /><circle cx={620} cy={CT + 118} r={7} fill={SI} />
      <text x={656} y={CT + 112} style={zh(30, H.text, 900)}>車用</text></g>
    <g opacity={0.35 + 0.65 * ai}><rect x={545} y={CT + 154} width={380} height={64} rx={8} fill="#FFFFFF" stroke={ai > 0.5 ? H.amber : H.lineSoft} strokeWidth={ai > 0.5 ? 4 : 2} />
      <rect x={567} y={CT + 164} width={50} height={44} rx={3} fill={SI} />{[0, 1, 2].map((j) => <rect key={j} x={573} y={CT + 170 + j * 13} width={38} height={8} fill="#8A96AA" />)}
      <text x={656} y={CT + 196} style={zh(30, H.text, 900)}>AI 伺服器電源</text></g>
  </Sv></Card>);
};
// ── mature-next：成熟製程拚品項 → 下一集更拚量的記憶體製造；留言「成熟製程」──
const Next: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330, it = on(f, T(o, "item")), nx = on(f, T(o, "next")), kw = on(f, T(o, "kw"));
  return (<Card o={o} k={k} W={W} Hh={Hh}><Sv W={W} Hh={Hh}>
    {[[40, CT + 30, 44, 44, BLUE], [110, CT + 24, 30, 56, SI], [164, CT + 36, 56, 30, H.amber], [50, CT + 112, 36, 36, CHIP], [116, CT + 108, 60, 44, "#2FBF71"]].map(([x, y, w, h, c], i) =>
      <Chip key={i} x={x as number} y={y as number} w={w as number} h={h as number} c={c as string} pins={3} a={0.4 + 0.6 * it} />)}
    <text x={130} y={CT + 214} textAnchor="middle" style={zh(26, H.text, 900)} opacity={0.4 + 0.6 * it}>拚品項</text>
    {Array.from({ length: 8 }, (_, i) => <Chip key={i} x={250 + (i % 2) * 44} y={CT + 16 + Math.floor(i / 2) * 40} w={34} h={30} c={CHIP} pins={2} a={0.4 + 0.6 * nx} />)}
    <text x={290} y={CT + 214} textAnchor="middle" style={zh(26, H.text, 900)} opacity={0.4 + 0.6 * nx}>拚產量</text>
    <Sep x={380} />
    <Row x={404} y={CT + 70} t="下一集：記憶體製造" c={BLUE} a={nx} />
    <Row x={404} y={CT + 150} t="留言「成熟製程」拿資料" c={H.amber} a={kw} />
  </Sv></Card>);
};

export const MatureSection: React.FC<P> = (p) => {
  const kd = String((p.o as any).kind);
  const M: Record<string, React.FC<P>> = { "mature-hook": Hook, "mature-dish": Dish, "mature-power": Power, "mature-ddi": Ddi, "mature-tw": Tw, "mature-cn": Cn, "mature-market": Market, "mature-next": Next };
  const C2 = M[kd]; return C2 ? <C2 {...p} /> : null;
};

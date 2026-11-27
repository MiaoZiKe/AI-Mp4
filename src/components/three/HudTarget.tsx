// 2026/11/27 tech-target：濺鍍靶材（系列 2 第 13 集）的 2D 示意卡（overlay `section` 的 kind 以 "target-" 開頭，Hud.tsx 的 HudSection 轉過來）。
//   target-hook 接上集：機台在打什麼？→ 一塊金屬板｜target-top 拆開陰極：供電與磁鐵｜target-cool 熱怎麼被帶走（靶 → 焊層 → 背板 → 水）｜target-shield 靶材與遮蔽環（只讓正面被打）｜
//   target-sect 陰極剖面（氬氣、高壓、離子加速撞靶、原子飛出）｜target-cos 原子往哪裡飛（餘弦分布）與薄膜長厚｜target-race 磁場跑道（俯視：電子轉圈、電漿集中）｜
//   target-groove 侵蝕溝三階段（新靶／中期／末期）與利用率｜target-line 靶怎麼做前半（精煉、融化鑄錠）｜target-grain 後半（軋延、晶粒、加工、接合）｜target-co 做靶材的公司｜target-next 下一集
// 全部示意，只標查證過的數字（約 15–40%、數百伏）；結構一開始就畫出，念到時該處亮起、動起來；時間全部來自 script.json 的 t（cue）。
// 排版原則（card-overlap.mjs 檢查）：內容從 CARD_CONTENT_TOP 以下；字不放進會動的圖形範圍；字 ≥30px；字離圖形 ≥6px。
// 公司名牌：JX、Solstice、光洋科三家的官方原檔 LOGO 當天都抓不到（見 videos/tech-target/assets.md），一律用白底深色文字名牌（不仿商標）＋國旗。
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
const cl = (x: number) => Math.min(1, Math.max(0, x));
const fr = (x: number) => ((x % 1) + 1) % 1;
const ease = (u: number) => EASE.move(cl(u));
const RED = "#E0472F", OK = "#14A38B", BLUE = "#2F7FE0", CU = "#D2793F", CU_L = "#F0A066", WAF = "#B4C2DA", WAF_D = "#7F93B5", PLA = "#9B7BFF", ION = "#4FA3FF", ELE = "#E0A81B", BACK = "#B9C2CF", WATER = "#4DA3FF", MAGN = "#E0472F", MAGS = "#2F7FE0", SOL = "#E8ECF2", DARK = "#4A525F";
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
const FlagBox: React.FC<{ code: string; x: number; y: number; a: number }> = ({ code, x, y, a }) => (
  <g><rect x={x} y={y} width={50} height={36} fill="none" stroke={a > 0.5 ? H.amber : H.lineSoft} strokeWidth={a > 0.5 ? 4 : 1.5} /><Flag code={code} h={28} x={x + 4} y={y + 4} asSvg /></g>
);
/** 文字名牌（沒有官方原檔 LOGO 的公司；白底深色字，不仿商標） */
const NamePlate: React.FC<{ x: number; y: number; w: number; h: number; t: string; a: number; px?: number }> = ({ x, y, w, h, t, a, px = 34 }) => (
  <g><rect x={x} y={y} width={w} height={h} fill="#FFFFFF" stroke={a > 0.5 ? H.amber : H.lineSoft} strokeWidth={a > 0.5 ? 4 : 1.5} />
    <text x={x + w / 2} y={y + h / 2 + px * 0.34} textAnchor="middle" style={zh(px, "#1F3A5F", 900)}>{t}</text></g>
);
const Chip: React.FC<{ x: number; y: number; w: number; t: string; a: number; done?: boolean }> = ({ x, y, w, t, a, done }) => (
  <g opacity={0.4 + 0.6 * a}><rect x={x} y={y} width={w} height={50} fill={a > 0.5 ? "#FFF4DA" : "#FFFFFF"} stroke={a > 0.5 ? H.amber : H.lineSoft} strokeWidth={a > 0.5 ? 4 : 2} />
    <text x={x + w / 2} y={y + 35} textAnchor="middle" style={zh(30, H.text, 900)}>{t}</text>{done ? <Check x={x + w - 6} y={y + 62} o={a} /> : null}</g>
);
/** 製程站的小圖示列：精煉｜鑄錠｜鍛造｜軋延｜退火｜加工｜接合（上半卡共用） */
const LineChips: React.FC<{ a: number[] }> = ({ a }) => {
  const names = ["精煉", "鑄錠", "鍛造", "軋延", "退火", "加工", "接合"];
  let x = 30;
  return <g>{names.map((n, i) => { const cx = x; x += 96 + 30; return <g key={n}><Chip x={cx} y={CT + 2} w={96} t={n} a={a[i]} />
    {i < 6 ? <Arrow x1={cx + 99} y1={CT + 27} x2={cx + 126} y2={CT + 27} c={H.text2} w={3} o={0.4 + 0.6 * a[i + 1]} /> : null}</g>; })}</g>;
};

// ── target-hook：上集的機台在打什麼？→ 一塊要被打碎的金屬板（銅色圓盤，問號變成答案） ──
const Hook: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330;
  const pv = on(f, T(o, "prev")), q = on(f, T(o, "q")), pl = on(f, T(o, "plate"));
  const cx = 150, cy = CT + 130;
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        <circle cx={cx} cy={cy} r={92} fill={CU} opacity={0.35 + 0.65 * pl} stroke="#8C4A22" strokeWidth={4} />
        <circle cx={cx} cy={cy} r={72} fill="none" stroke={CU_L} strokeWidth={3} opacity={0.6 * pl} />
        <text x={cx} y={cy + 28} textAnchor="middle" style={zh(84, H.text, 900)} opacity={q * (1 - pl)}>？</text>
        {[0, 1, 2, 3, 4, 5].map((i) => { const a = (i / 6) * Math.PI * 2 + 0.3; return <circle key={i} cx={cx + Math.cos(a) * 70} cy={cy + Math.sin(a) * 70} r={5} fill="#8C4A22" opacity={0.5 * pl} />; })}
        <Sep x={300} />
        <Row x={330} y={CT + 56} t="前一集：說要看靶材" c={H.text2} a={pv} />
        <Row x={330} y={CT + 122} t="靶材到底是什麼？" c={BLUE} a={q} />
        <Row x={330} y={CT + 188} t="一顆顆被撞出原子的板" c={H.amber} a={pl} />
        <text x={330} y={CT + 244} style={zh(30, H.text2, 800)} opacity={0.4 + 0.6 * pl}>原子不是整塊打碎</text>
      </svg>
    </Card>
  );
};

// ── target-top：左：陰極由上到下的疊層（供電、上蓋、磁鐵、水、背板、靶）；右：高壓與磁鐵說明，小圖：磁鐵組俯視在轉 ──
const Top: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330;
  const op = on(f, T(o, "open")), hv = on(f, T(o, "hv")), mg = on(f, T(o, "mag")), sp = on(f, T(o, "spin"));
  const rows: [string, string, number, string][] = [["", "供電", hv, "#F6D56A"], ["", "上蓋", op, "#D4DAE4"], ["", "磁鐵", mg, "#E7EAF0"], ["", "冷卻水", 0.6, "#BFDDFB"], ["", "背板", 0.6, BACK], ["", "靶材", 0.6, CU]];
  const hs = [36, 28, 44, 36, 28, 36];
  let y = CT + 4;
  const ang = sp * (f - T(o, "spin")) * 9;
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        {rows.map(([, t, a, c], i) => { const yy = y; y += hs[i] + 6; return <g key={t} opacity={0.4 + 0.6 * a}>
          <rect x={40} y={yy} width={i === 0 ? 120 : 230} height={hs[i]} fill={c} stroke={a > 0.5 && i < 3 ? H.amber : H.lineSoft} strokeWidth={a > 0.5 && i < 3 ? 4 : 1.5} />
          {hs[i] >= 36 ? <text x={i === 0 ? 100 : 155} y={yy + hs[i] - 8} textAnchor="middle" style={zh(30, H.text, 800)}>{t}</text> : null}</g>; })}
        <rect x={50} y={CT + 92} width={20} height={20} fill={MAGN} opacity={0.4 + 0.6 * mg} /><rect x={260} y={CT + 92} width={20} height={20} fill={MAGS} opacity={0.4 + 0.6 * mg} />
        <Sep x={330} />
        <Row x={360} y={CT + 52} t="靶接負高壓（數百伏）" c="#F6D56A" a={hv} />
        <Row x={360} y={CT + 116} t="磁鐵：外環與中心極性相反" c={MAGN} a={mg} />
        <Row x={360} y={CT + 180} t="磁鐵會轉，溝才平順" c={H.amber} a={sp} />
        <g opacity={0.4 + 0.6 * sp}><circle cx={820} cy={CT + 140} r={54} fill="none" stroke={H.lineSoft} strokeWidth={3} />
          <g transform={`rotate(${ang} 820 ${CT + 140})`}>{Array.from({ length: 10 }, (_, i) => { const a = (i / 10) * Math.PI * 2; return <circle key={i} cx={820 + Math.cos(a) * 42} cy={CT + 140 + Math.sin(a) * 42} r={7} fill={MAGN} />; })}
            <circle cx={820} cy={CT + 140} r={14} fill={MAGS} /></g></g>
      </svg>
    </Card>
  );
};

// ── target-cool：熱從靶面往背面走（靶 → 焊層 → 背板 → 冷卻水），溫度條由紅變藍；冷卻不夠焊料會熔 ──
const Cool: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330;
  const wa = on(f, T(o, "water")), he = on(f, T(o, "heat")), bk = on(f, T(o, "back")), so = on(f, T(o, "solder")), tg = on(f, T(o, "tgt"));
  const bl: [string, number, number, string, number][] = [["靶材", 40, 210, CU, tg], ["焊層", 280, 130, SOL, so], ["背板", 440, 190, BACK, bk], ["冷卻水", 660, 240, WATER, wa]];
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        <defs><linearGradient id="tgGr" x1="0" x2="1"><stop offset="0" stopColor="#E5602B" /><stop offset="0.5" stopColor="#F2B632" /><stop offset="1" stopColor="#4DA3FF" /></linearGradient></defs>
        {bl.map(([t, x, w, c, a], i) => <g key={t} opacity={0.4 + 0.6 * a}><rect x={x} y={CT + 6} width={w} height={84} fill={c} stroke={a > 0.5 ? H.amber : H.lineSoft} strokeWidth={a > 0.5 ? 4 : 1.5} />
          <text x={x + w / 2} y={CT + 58} textAnchor="middle" style={zh(32, i === 3 ? "#0B3A6E" : H.text, 900)}>{t}</text></g>)}
        {[0, 1, 2].map((i) => { const x = 252 + i * 160 + (i === 2 ? 70 : 0); return <Arrow key={i} x1={x - 14 + 18 * fr(f / 30 + i * 0.3)} y1={CT + 48} x2={x + 22 + 18 * fr(f / 30 + i * 0.3)} y2={CT + 48} c={RED} w={5} o={he * (i === 2 ? 0.5 + 0.5 * wa : 1)} />; })}
        <rect x={40} y={CT + 126} width={860} height={26} fill="url(#tgGr)" opacity={0.3 + 0.7 * he} />
        <text x={40} y={CT + 192} style={zh(30, H.text2, 800)} opacity={0.4 + 0.6 * he}>靶面最燙</text>
        <text x={720} y={CT + 192} style={zh(30, H.text2, 800)} opacity={0.4 + 0.6 * he}>被水帶走</text>
        <text x={40} y={CT + 244} style={zh(30, H.amber, 900)} opacity={0.35 + 0.65 * so}>冷卻不夠，焊料會熔、靶會剝落</text>
      </svg>
    </Card>
  );
};

// ── target-shield：靶邊剖面：遮蔽環貼著靶側面（中間只留一小道縫），離子只打到正面 ──
const Shield: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330;
  const tg = on(f, T(o, "tgt")), sh = on(f, T(o, "shield")), fc = on(f, T(o, "face"));
  const u = fr(f / 40);
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        <rect x={150} y={CT + 14} width={230} height={90} fill={CU} opacity={0.4 + 0.6 * tg} stroke="#8C4A22" strokeWidth={3} />
        <rect x={50} y={CT + 4} width={84} height={180} fill={DARK} opacity={0.4 + 0.6 * sh} stroke={sh > 0.5 ? H.amber : H.lineSoft} strokeWidth={sh > 0.5 ? 4 : 1.5} />
        <rect x={134} y={CT + 14} width={16} height={170} fill="none" stroke={H.text2} strokeWidth={2} strokeDasharray="6 5" opacity={0.4 + 0.6 * sh} />
        {[0, 1, 2].map((i) => <Arrow key={i} x1={185 + i * 70} y1={CT + 222 - 56 * fr(u + i * 0.3)} x2={185 + i * 70} y2={CT + 176 - 56 * fr(u + i * 0.3)} c={ION} w={5} o={fc} />)}
        <path d={`M150 ${CT + 104} h230`} stroke={H.amber} strokeWidth={6} opacity={fc} />
        <Sep x={430} />
        <Row x={460} y={CT + 56} t="靶材：只有正面被打" c={H.amber} a={fc} />
        <Row x={460} y={CT + 122} t="遮蔽環：把側面擋住" c={DARK} a={sh} />
        <Row x={460} y={CT + 188} t="中間只留一小道縫" c={H.text2} a={sh} />
        <text x={460} y={CT + 244} style={zh(30, H.text2, 800)} opacity={0.4 + 0.6 * sh}>內壁粗糙，抓住飛濺的膜屑</text>
      </svg>
    </Card>
  );
};

// ── target-sect：陰極剖面（磁鐵、水與背板、靶、電漿、晶圓）；離子往上加速撞靶、原子往下散開 ──
const Sect: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330;
  const ga = on(f, T(o, "gas")), vo = on(f, T(o, "volt")), io = on(f, T(o, "ion")), hi = on(f, T(o, "hit")), at = on(f, T(o, "atom"));
  const X = 30, BW = 420, yMag = CT + 2, yBk = yMag + 48, yTg = yBk + 48, yPl = yTg + 48, yWf = yPl + 62;
  const ions = [110, 230, 350].map((x, i) => { const u = fr(f / 46 + i * 0.33), g = u * u; return { x: X + x, y: yPl + 54 - 62 * g, a: io * Math.min(1, u * 8) }; });
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        <defs><linearGradient id="tgPl" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#C9B8FF" /><stop offset="1" stopColor="#9B7BFF" stopOpacity="0.15" /></linearGradient></defs>
        <rect x={X} y={yMag} width={BW} height={42} fill="#E7EAF0" stroke={H.lineSoft} strokeWidth={2} />
        {[0, 1, 2].map((i) => <rect key={i} x={X + 50 + i * 130} y={yMag + 8} width={80} height={26} fill={i === 1 ? MAGS : MAGN} opacity={0.9} />)}
        <rect x={X} y={yBk} width={BW} height={42} fill={BACK} stroke={H.lineSoft} strokeWidth={2} />
        <rect x={X} y={yBk + 28} width={BW} height={14} fill={WATER} opacity={0.7} />
        <rect x={X} y={yTg} width={BW} height={42} fill={CU} stroke="#8C4A22" strokeWidth={2} /><rect x={X} y={yTg - 4} width={BW} height={5} fill={SOL} />
        <rect x={X} y={yPl} width={BW} height={54} fill="url(#tgPl)" opacity={0.3 + 0.7 * vo} />
        <rect x={X} y={yWf} width={BW} height={26} fill={WAF} stroke={WAF_D} strokeWidth={2} />
        {Array.from({ length: 18 }, (_, i) => <circle key={i} cx={X + 20 + ((i * 97) % 380)} cy={yPl + 8 + ((i * 53) % 40)} r={3.5} fill="#8E9BB0" opacity={ga * (0.5 + 0.5 * fr(f / 60 + i * 0.13))} />)}
        {ions.map((p, i) => <g key={i} opacity={p.a}><circle cx={p.x} cy={p.y} r={8} fill={ION} /><line x1={p.x} y1={p.y + 10} x2={p.x} y2={p.y + 28} stroke={ION} strokeWidth={4} opacity={0.5} /></g>)}
        {[100, 230, 350].map((x, i) => { const u = fr(f / 50 + i * 0.27); return <g key={i} opacity={at * (1 - u * 0.4)}>{[-1, 0, 1].map((d) => <circle key={d} cx={X + x + d * 36 * u} cy={yTg + 46 + (yWf - yTg - 60) * u} r={5} fill={CU_L} />)}</g>; })}
        <circle cx={X + 230} cy={yTg + 44} r={12 + 4 * Math.sin(f * 0.4)} fill="none" stroke="#F2B632" strokeWidth={4} opacity={hi} />
        <Sep x={490} />
        <Row x={520} y={CT + 40} t="通入氬氣" c={H.text2} a={ga} />
        <Row x={520} y={CT + 100} t="靶接高壓（數百伏）" c={H.amber} a={vo} />
        <Row x={520} y={CT + 160} t="氬離子被吸向靶，越來越快" c={ION} a={io} />
        <Row x={520} y={CT + 220} t="撞出金屬原子，往下飛" c={CU} a={at} />
      </svg>
    </Card>
  );
};

// ── target-cos：左：餘弦分布（發射點、圓形瓣、箭頭長短）；右：薄膜三階段（小島 → 連成一層 → 變厚） ──
const Cos: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330;
  const sp = on(f, T(o, "spread")), ce = on(f, T(o, "center")), si = on(f, T(o, "side")), wa = on(f, T(o, "wafer")), fi = on(f, T(o, "film"));
  const ex = 160, ey = CT + 8, R = 150;
  const th = [-60, -40, -20, 0, 20, 40, 60];
  const s2 = cl((f - T(o, "film") - 40) / 14);
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        <rect x={30} y={ey - 6} width={260} height={12} fill={CU} />
        <circle cx={ex} cy={ey + R / 2} r={R / 2} fill="none" stroke={H.lineSoft} strokeWidth={3} strokeDasharray="6 5" opacity={0.4 + 0.6 * sp} />
        {th.map((d) => { const a = (d * Math.PI) / 180, L2 = R * Math.cos(a), ctr = d === 0, op = ctr ? ce : Math.abs(d) >= 40 ? si : sp; return <Arrow key={d} x1={ex} y1={ey + 6} x2={ex + L2 * Math.sin(a)} y2={ey + 6 + L2 * Math.cos(a)} c={ctr ? H.amber : CU_L} w={ctr ? 7 : 4} o={op * (ctr ? 1 : 0.8)} />; })}
        <rect x={30} y={CT + 218} width={260} height={16} fill={WAF} stroke={WAF_D} strokeWidth={2} opacity={0.3 + 0.7 * wa} />
        <Sep x={330} />
        {[["先長成小島", fi], ["連成一層", fi * s2], ["越堆越厚", cl((f - T(o, "film") - 70) / 14)]].map(([t, a], i) => <g key={i} opacity={0.35 + 0.65 * (a as number)}>
          <rect x={360} y={CT + 14 + i * 70} width={250} height={14} fill={WAF} />
          {i === 0 ? [0, 1, 2, 3, 4].map((j) => <ellipse key={j} cx={390 + j * 46} cy={CT + 11 + i * 70} rx={13} ry={7} fill={CU} />) : <rect x={360} y={CT + 14 + i * 70 - (i === 1 ? 6 : 14)} width={250} height={i === 1 ? 6 : 14} fill={CU} />}
          <text x={640} y={CT + 32 + i * 70} style={zh(30, H.text, 900)}>{t as string}</text></g>)}
      </svg>
    </Card>
  );
};

// ── target-race：靶面俯視：中心與外環磁鐵（極性相反）、電子沿跑道轉圈、電漿集中在這一圈 ──
const Race: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330;
  const el = on(f, T(o, "elec")), ra = on(f, T(o, "race")), co = on(f, T(o, "conc"));
  const cx = 180, cy = CT + 136, R = 110, RT = 66;
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        <circle cx={cx} cy={cy} r={R} fill={CU} opacity={0.35} stroke="#8C4A22" strokeWidth={3} />
        {Array.from({ length: 14 }, (_, i) => { const a = (i / 14) * Math.PI * 2; return <circle key={i} cx={cx + Math.cos(a) * 96} cy={cy + Math.sin(a) * 96} r={7} fill={MAGN} />; })}
        <circle cx={cx} cy={cy} r={20} fill={MAGS} />
        <circle cx={cx} cy={cy} r={RT} fill="none" stroke={PLA} strokeWidth={10 + 12 * co} opacity={0.25 + 0.6 * co} />
        <circle cx={cx} cy={cy} r={RT} fill="none" stroke={H.amber} strokeWidth={3} strokeDasharray="8 7" opacity={ra} />
        {Array.from({ length: 6 }, (_, i) => { const a = f * 0.09 + (i / 6) * Math.PI * 2; return <g key={i} opacity={el}><circle cx={cx + Math.cos(a) * RT} cy={cy + Math.sin(a) * RT} r={7} fill={ELE} /><circle cx={cx + Math.cos(a - 0.22) * RT} cy={cy + Math.sin(a - 0.22) * RT} r={4} fill={ELE} opacity={0.5} /></g>; })}
        <Sep x={340} />
        <Row x={370} y={CT + 56} t="電子被磁場困住" c={ELE} a={el} />
        <Row x={370} y={CT + 122} t="沿一圈跑道轉" c={H.amber} a={ra} />
        <Row x={370} y={CT + 188} t="電漿集中在這一圈" c={PLA} a={co} />
        <text x={370} y={CT + 244} style={zh(30, H.text2, 800)} opacity={0.4 + 0.6 * co}>所以這一圈最先被吃掉</text>
      </svg>
    </Card>
  );
};

// ── target-groove：靶截面三階段（新靶／中期／末期），溝只在跑道位置、V 形越來越深，末期溝底接近焊層（警示）；右：利用率 ──
const Groove: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330;
  const gr = on(f, T(o, "groove")), de = on(f, T(o, "deep")), sw = on(f, T(o, "swap")), pc = on(f, T(o, "pct"));
  const rows: [string, number][] = [["新靶", 1], ["中期", gr], ["末期", sw]];
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        {rows.map(([t, a], i) => { const y = CT + 8 + i * 84, x0 = 150, w = 360, h = 52, depth = i === 1 ? 22 * (0.3 + 0.7 * de) : i === 2 ? 22 + 20 * sw : 0;
          return <g key={t} opacity={0.4 + 0.6 * a}>
            <text x={30} y={y + 38} style={zh(30, H.text, 900)}>{t}</text>
            <rect x={x0} y={y} width={w} height={h} fill={CU} stroke="#8C4A22" strokeWidth={2} /><rect x={x0} y={y + h} width={w} height={6} fill={SOL} />
            {i > 0 ? [x0 + 80, x0 + w - 80].map((cxn, j) => <path key={j} d={`M${cxn - 30} ${y} L${cxn} ${y + depth} L${cxn + 30} ${y} Z`} fill={H.cardCompare} stroke={i === 2 && sw > 0.5 ? H.amber : "#8C4A22"} strokeWidth={i === 2 ? 4 : 2} />) : null}
          </g>; })}
        <Sep x={540} />
        <Row x={566} y={CT + 52} t="溝在跑道正下方" c={H.amber} a={gr} />
        <Row x={566} y={CT + 116} t="越吃越深" c={RED} a={de} />
        <Row x={566} y={CT + 180} t="快見底：換新靶" c={RED} a={sw} />
        <text x={566} y={CT + 244} style={zh(30, H.text, 900)} opacity={0.35 + 0.65 * pc}>利用率 15–40%</text>
      </svg>
    </Card>
  );
};

// ── target-line：靶怎麼做（前半）：五站小圖示列，亮到哪站講到哪站；下面三行說明 ──
const Line: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330;
  const q = on(f, T(o, "q")), re = on(f, T(o, "refine")), fu = on(f, T(o, "furnace")), ig = on(f, T(o, "ingot"));
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        <LineChips a={[re, Math.max(fu, ig), on(f, T(o, "forge")), 0.3 * q, 0.3 * q, 0.3 * q, 0.3 * q]} />
        <Row x={30} y={CT + 116} t="精煉：把雜質去掉，純度要很高" c={BLUE} a={re} />
        <Row x={30} y={CT + 176} t="真空裡融化：不讓空氣混進來" c={H.amber} a={fu} />
        <Row x={30} y={CT + 236} t="倒成錠，再用鍛壓機打實" c={CU} a={Math.max(ig, on(f, T(o, "forge")))} />
      </svg>
    </Card>
  );
};

// ── target-grain：靶怎麼做（後半）：軋延使晶粒壓扁拉長，退火後變成細小均勻的等軸晶粒；右邊四行對應軋延、退火、加工、接合 ──
const Grain: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330;
  const ro = on(f, T(o, "roll")), an = on(f, T(o, "anneal")), gr = on(f, T(o, "grain")), la = on(f, T(o, "lathe")), bo = on(f, T(o, "bond"));
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        <LineChips a={[1, 1, 1, ro, an, la, bo]} />
        <g opacity={0.4 + 0.6 * ro}><g transform={`translate(40 ${CT + 68})`}>{Array.from({ length: 12 }, (_, i) => <rect key={i} x={(i % 3) * 66} y={Math.floor(i / 3) * 32} width={66} height={32} fill={i % 2 ? "#C9D2E0" : "#AEBBD0"} stroke={H.text2} strokeWidth={1.5} transform={`scale(1 1)`} />)}</g></g>
        <g opacity={0.4 + 0.6 * gr}><g transform={`translate(270 ${CT + 68})`}>{Array.from({ length: 36 }, (_, i) => <rect key={i} x={(i % 6) * 33} y={Math.floor(i / 6) * 21} width={33} height={21} fill={(i + Math.floor(i / 6)) % 2 ? "#C9D2E0" : "#AEBBD0"} stroke={H.text2} strokeWidth={1.5} />)}</g></g>
        <Arrow x1={246} y1={CT + 132} x2={266} y2={CT + 132} c={H.amber} w={4} o={an} />
        <text x={40} y={CT + 236} style={zh(30, H.text2, 800)} opacity={0.35 + 0.65 * ro}>軋後：壓扁</text>
        <text x={270} y={CT + 236} style={zh(30, H.text, 900)} opacity={0.35 + 0.65 * gr}>退火後：細均勻</text>
        <Sep x={500} y0={CT + 70} />
        <Row x={530} y={CT + 96} t="軋延：晶粒被壓扁" c={H.amber} a={ro} />
        <Row x={530} y={CT + 142} t="加熱退火：重新長細" c={RED} a={Math.max(an, gr)} />
        <Row x={530} y={CT + 188} t="車成圓盤，磨亮靶面" c={BLUE} a={la} />
        <Row x={530} y={CT + 234} t="用焊料接到背板" c={CU} a={bo} />
      </svg>
    </Card>
  );
};

// ── target-co：JX、Solstice、光洋科；每家兩行：名牌＋國旗＋國名，下一行是查證過的一句話 ──
const Co: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 360;
  const jx = on(f, T(o, "jx")), sx = on(f, T(o, "sixty")), us = on(f, T(o, "us")), tw = on(f, T(o, "tw"));
  const rows: [string, string, string, string, number][] = [["JX 金屬", "JP", "據報約六成（Fuji Keizai 2023，經 JX 引用）", "日本", Math.max(jx, sx)], ["Solstice", "US", "Honeywell 電子材料事業，2025/10 分拆", "美國", us], ["光洋科 1785", "TW", "台南設有塑性成型中心（媒體報導）", "台灣", tw]];
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        {rows.map(([n, c, note, cn, a], i) => { const y = CT - 2 + i * 93; return <g key={n} opacity={0.4 + 0.6 * a}>
          <NamePlate x={30} y={y} w={250} h={50} t={n} a={a} px={i === 2 ? 30 : 32} />
          <FlagBox code={c} x={300} y={y + 7} a={a} /><text x={372} y={y + 36} style={zh(30, H.text, 900)}>{cn}</text>
          <text x={30} y={y + 82} style={zh(30, H.text2, 800)}>{note}</text></g>; })}
      </svg>
    </Card>
  );
};

// ── target-next：系列走過的（設備廠、靶材打勾）→ 下一集：前驅物（氣體原料） ──
const Next: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330;
  const nx = on(f, T(o, "next")), ga = on(f, T(o, "gas")), pr = on(f, T(o, "pre")), kw = on(f, T(o, "kw"));
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        <Chip x={30} y={CT + 6} w={170} t="設備廠" a={1} /><Arrow x1={208} y1={CT + 31} x2={254} y2={CT + 31} c={H.text2} w={4} />
        <Chip x={262} y={CT + 6} w={170} t="靶材" a={1} done /><Arrow x1={440} y1={CT + 31} x2={486} y2={CT + 31} c={H.text2} w={4} o={0.4 + 0.6 * nx} />
        <Chip x={494} y={CT + 6} w={200} t="前驅物" a={nx} />
        <g opacity={0.35 + 0.65 * ga}><circle cx={800} cy={CT + 30} r={7} fill={ION} /><circle cx={840} cy={CT + 14} r={7} fill={ION} /><circle cx={870} cy={CT + 46} r={7} fill={ION} /></g>
        <Row x={30} y={CT + 128} t="更薄的膜：改用氣體原料" c={ION} a={ga} />
        <Row x={30} y={CT + 188} t="下一集：前驅物" c={H.amber} a={pr} />
        <text x={30} y={CT + 244} style={zh(30, H.text2, 800)} opacity={0.4 + 0.6 * kw}>留言「靶材」拿完整資料</text>
      </svg>
    </Card>
  );
};

export const TargetSection: React.FC<P> = (p) => {
  const kd = String((p.o as any).kind);
  if (kd === "target-hook") return <Hook {...p} />;
  if (kd === "target-top") return <Top {...p} />;
  if (kd === "target-cool") return <Cool {...p} />;
  if (kd === "target-shield") return <Shield {...p} />;
  if (kd === "target-sect") return <Sect {...p} />;
  if (kd === "target-cos") return <Cos {...p} />;
  if (kd === "target-race") return <Race {...p} />;
  if (kd === "target-groove") return <Groove {...p} />;
  if (kd === "target-line") return <Line {...p} />;
  if (kd === "target-grain") return <Grain {...p} />;
  if (kd === "target-co") return <Co {...p} />;
  if (kd === "target-next") return <Next {...p} />;
  return null;
};

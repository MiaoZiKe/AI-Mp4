// 2026/11/27 tech-gas：特用氣體（系列 2 第 15 集）的 2D 示意卡（overlay `section` 的 kind 以 "gas-" 開頭，Hud.tsx 的 HudSection 轉過來）。
//   gas-hook 接上集｜gas-use 氣體四大用途｜gas-ppb 純度比喻（游泳池與一小匙）｜gas-reg 兩段調節器｜gas-chain 送氣路徑與閥箱分流｜gas-pur 純化器吸附｜
//   gas-dbl 雙套管與洩漏偵測鏈｜gas-chm 噴頭與氣流｜gas-burn 燃燒＋水洗／電漿式｜gas-co 公司（名牌＋國旗）｜gas-next 下一集
// 全部示意，不標瓶壓、效率、靈敏度等沒有查證的數字；時間來自 script.json 的 t（cue）。字 ≥30px；LOGO／國旗 100% 不透明。
// 公司名牌：林德、液化空氣、大陽日酸的官方原檔 LOGO 當天抓不到（見 videos/tech-gas/assets.md），一律白底深色文字名牌（不仿商標）；林德只寫「全球」不放旗。
import React from "react";
import { FONT_ZH } from "../../theme";
import { H, CARD_HEAD, CARD_CONTENT_TOP, cardTitleBox } from "./hudSkin";
import { EASE, tween } from "../anim";
import type { Model3D, Overlay3D, State3D } from "./engine";
import { Flag } from "./Brand";

const zh = (px: number, color: string = H.text, w = 800): React.CSSProperties => ({ fontFamily: FONT_ZH, fontSize: px, fill: color, color, fontWeight: w, whiteSpace: "nowrap" });
const onC = (bg: string) => (bg === H.amber ? ((H as any).onAmber ?? H.onAccent) : H.onAccent);
type P = { o: Overlay3D; f: number; k: number; m: Model3D; s?: State3D };
const T = (o: Overlay3D, n: string) => ((o as any).t?.[n]?.at ?? o.at) as number;
const CT = CARD_CONTENT_TOP;
const Card: React.FC<{ o: Overlay3D; k: number; W: number; Hh: number; children: React.ReactNode }> = ({ o, k, W, Hh, children }) => (
  <div style={{ position: "absolute", left: o.x ?? 64, top: o.y ?? 900, width: W, height: Hh, opacity: k, background: H.cardCompare, border: `2px solid ${H.lineSoft}`, boxSizing: "border-box", overflow: "hidden" }}>
    {o.title ? <div style={{ ...zh(CARD_HEAD.px, onC(H.line), 800), ...cardTitleBox(), background: H.line, zIndex: 2 }}>{o.title}</div> : null}
    {o.tag ? <div style={{ position: "absolute", right: 16, top: 14, ...zh(28, H.text2, 600), zIndex: 2 }}>{o.tag}</div> : null}
    {children}
  </div>
);
const on = (f: number, at: number, d = 10) => tween(f, at, d, EASE.enter);
const fr = (x: number) => ((x % 1) + 1) % 1;
const GAS = "#2FBF9B", IMP = "#F28C28", N2 = "#4FA3FF", RED = "#E0472F", BLUE = "#2F7FE0", STEEL = "#B4BFCF", BRASS = "#C9A24A", WASTE = "#D9C25A", FIRE = "#FF8A2B";
const Sep: React.FC<{ x: number }> = ({ x }) => <line x1={x} y1={CT + 4} x2={x} y2={316} stroke={H.lineSoft} strokeWidth={3} />;
const Arrow: React.FC<{ x1: number; y1: number; x2: number; y2: number; c: string; w?: number; o?: number }> = ({ x1, y1, x2, y2, c, w = 5, o = 1 }) => {
  const a = Math.atan2(y2 - y1, x2 - x1), s = w * 2.6;
  return <g opacity={o}><path d={`M${x1} ${y1} L${x2 - Math.cos(a) * s * 0.8} ${y2 - Math.sin(a) * s * 0.8}`} stroke={c} strokeWidth={w} />
    <path d={`M${x2} ${y2} L${x2 - Math.cos(a) * s - Math.sin(a) * s * 0.6} ${y2 - Math.sin(a) * s + Math.cos(a) * s * 0.6} L${x2 - Math.cos(a) * s + Math.sin(a) * s * 0.6} ${y2 - Math.sin(a) * s - Math.cos(a) * s * 0.6} Z`} fill={c} /></g>;
};
const Row: React.FC<{ x: number; y: number; t: string; c: string; a: number; px?: number }> = ({ x, y, t, c, a, px = 30 }) => (
  <g opacity={0.35 + 0.65 * a}><rect x={x} y={y - px * 0.72} width={12} height={px * 0.72} fill={c} /><text x={x + 24} y={y} style={zh(px, H.text, 900)}>{t}</text></g>
);
const Chip: React.FC<{ x: number; y: number; w: number; t: string; a: number }> = ({ x, y, w, t, a }) => (
  <g opacity={0.4 + 0.6 * a}><rect x={x} y={y} width={w} height={50} fill={a > 0.5 ? "#FFF4DA" : "#FFFFFF"} stroke={a > 0.5 ? H.amber : H.lineSoft} strokeWidth={a > 0.5 ? 4 : 2} />
    <text x={x + w / 2} y={y + 35} textAnchor="middle" style={zh(30, H.text, 900)}>{t}</text></g>
);
const Plate: React.FC<{ x: number; y: number; w: number; t: string; a: number; code?: string }> = ({ x, y, w, t, a, code }) => (
  <g><rect x={x} y={y} width={w} height={50} fill="#FFFFFF" stroke={a > 0.5 ? H.amber : H.lineSoft} strokeWidth={a > 0.5 ? 4 : 1.5} />
    <text x={x + 14} y={y + 36} style={zh(32, "#1F3A5F", 900)}>{t}</text>
    {code ? <g><rect x={x + w + 10} y={y + 7} width={50} height={36} fill="none" stroke={a > 0.5 ? H.amber : H.lineSoft} strokeWidth={a > 0.5 ? 4 : 1.5} /><Flag code={code} h={28} x={x + w + 14} y={y + 11} asSvg /></g> : null}</g>
);
const Bottle: React.FC<{ x: number; y: number; c: string }> = ({ x, y, c }) => (
  <g><rect x={x} y={y + 14} width={34} height={84} rx={6} fill="#9AA7BA" stroke="#5C6678" strokeWidth={2} /><rect x={x + 8} y={y} width={18} height={18} fill="#C9A24A" /><rect x={x} y={y + 40} width={34} height={12} fill={c} /></g>
);

// ── gas-hook：接上集（液態原料汽化）→ 這集（氣本來就是氣）→ 怎麼安全送進廠 ──
const Hook: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330, pv = on(f, T(o, "prev")), q = on(f, T(o, "q")), bt = on(f, T(o, "bot"));
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        <g opacity={0.4 + 0.6 * pv}><rect x={34} y={CT + 70} width={70} height={90} fill="#BFDDFB" stroke={H.lineSoft} strokeWidth={2} /><rect x={34} y={CT + 110} width={70} height={50} fill="#4DA3FF" opacity={0.7} />
          {[0, 1, 2].map((i) => <circle key={i} cx={52 + i * 18} cy={CT + 50 - 10 * fr(f / 40 + i * 0.3)} r={6} fill={GAS} />)}</g>
        <Arrow x1={116} y1={CT + 112} x2={190} y2={CT + 112} c={H.text2} w={4} o={pv} />
        <text x={34} y={CT + 214} style={zh(30, H.text2, 800)} opacity={0.4 + 0.6 * pv}>液體汽化成氣</text>
        <Sep x={300} />
        <Row x={330} y={CT + 56} t="前一集：原料先變成氣" c={H.text2} a={pv} />
        <Row x={330} y={CT + 122} t="這一集：氣本來就是氣" c={BLUE} a={q} />
        <Row x={330} y={CT + 188} t="一瓶氣怎麼安全送進廠？" c={H.amber} a={bt} />
        <g opacity={0.35 + 0.65 * bt}><Bottle x={236} y={CT + 70} c={GAS} /></g>
      </svg>
    </Card>
  );
};
// ── gas-use：蝕刻／鍍膜／摻雜／曝光雷射，各一欄代表氣體 ──
const Use: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330;
  const a = [on(f, T(o, "etch")), on(f, T(o, "dep")), on(f, T(o, "dop")), on(f, T(o, "all"))];
  const cols: [string, string[], string][] = [["蝕刻", ["CF4", "NF3"], RED], ["鍍膜", ["SiH4", "WF6"], BLUE], ["摻雜", ["PH3", "B2H6"], IMP], ["雷射", ["Ne", "F2"], GAS]];
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        {cols.map(([t, gs, c], i) => { const x = 24 + i * 232; return <g key={t} opacity={0.4 + 0.6 * a[i]}>
          <rect x={x} y={CT + 4} width={212} height={58} fill={c} /><text x={x + 106} y={CT + 46} textAnchor="middle" style={zh(36, "#FFFFFF", 900)}>{t}</text>
          {gs.map((g, j) => <g key={g}><rect x={x} y={CT + 82 + j * 66} width={212} height={54} fill="#FFFFFF" stroke={a[i] > 0.5 ? H.amber : H.lineSoft} strokeWidth={a[i] > 0.5 ? 4 : 2} /><text x={x + 106} y={CT + 120 + j * 66} textAnchor="middle" style={zh(32, H.text, 900)}>{g}</text></g>)}</g>; })}
      </svg>
    </Card>
  );
};
// ── gas-ppb：游泳池與一小匙（比喻，自行換算） ──
const Ppb: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330, q = on(f, T(o, "q")), pl = on(f, T(o, "pool")), sp = on(f, T(o, "spoon"));
  const drop = Math.min(1, Math.max(0, (f - T(o, "spoon")) / 14));
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        <rect x={34} y={CT + 40} width={360} height={150} fill="#BFDDFB" stroke="#4DA3FF" strokeWidth={4} opacity={0.4 + 0.6 * pl} />
        {[0, 1, 2].map((i) => <path key={i} d={`M${50 + i * 110} ${CT + 90 + i * 18} q 25 -14 50 0 t 50 0`} stroke="#4DA3FF" strokeWidth={3} fill="none" opacity={0.6 * pl} />)}
        <circle cx={214} cy={CT + 20 + 60 * drop} r={9} fill={IMP} opacity={sp} />
        <text x={34} y={CT + 232} style={zh(30, H.text2, 800)} opacity={0.4 + 0.6 * pl}>一座游泳池</text>
        <Sep x={430} />
        <Row x={460} y={CT + 56} t="水氣、氧只要一點點" c={IMP} a={q} />
        <Row x={460} y={CT + 122} t="也會傷到一層膜" c={RED} a={sp} />
        <Row x={460} y={CT + 188} t="標示：ppb（十億分之一）" c={H.text2} a={sp} />
        <text x={460} y={CT + 240} style={zh(30, H.text2, 800)} opacity={0.4 + 0.6 * sp}>比喻為換算，示意</text>
      </svg>
    </Card>
  );
};
// ── gas-reg：瓶 → 第一段 → 第二段 → 出口；高壓條緩降、低壓條不動 ──
const Reg: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330, b = on(f, T(o, "big")), r = on(f, T(o, "reg")), t2 = on(f, T(o, "two")), ou = on(f, T(o, "out"));
  const hi = 120 - 46 * Math.min(1, Math.max(0, (f - T(o, "two")) / 90)), jit = Math.sin(f * 0.6) * 1.2;
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        <g opacity={0.4 + 0.6 * b}><Bottle x={30} y={CT + 70} c={GAS} /></g>
        <Arrow x1={78} y1={CT + 112} x2={150} y2={CT + 112} c={GAS} w={7} o={b} />
        <rect x={160} y={CT + 70} width={110} height={84} fill={BRASS} stroke={H.lineSoft} strokeWidth={2} opacity={0.4 + 0.6 * r} /><text x={215} y={CT + 120} textAnchor="middle" style={zh(30, H.text, 900)} opacity={0.4 + 0.6 * r}>第一段</text>
        <Arrow x1={276} y1={CT + 112} x2={316} y2={CT + 112} c={GAS} w={4} o={t2} />
        <rect x={322} y={CT + 70} width={110} height={84} fill={BRASS} stroke={H.lineSoft} strokeWidth={2} opacity={0.4 + 0.6 * t2} /><text x={377} y={CT + 120} textAnchor="middle" style={zh(30, H.text, 900)} opacity={0.4 + 0.6 * t2}>第二段</text>
        <Arrow x1={438} y1={CT + 112} x2={470} y2={CT + 112} c={GAS} w={2.5} o={ou} />
        <text x={30} y={CT + 244} style={zh(30, H.text2, 800)}>高壓端慢慢降，低壓端穩住</text>
        <Sep x={560} />
        <text x={590} y={CT + 40} style={zh(30, H.text, 900)}>高壓表</text><rect x={590} y={CT + 56} width={50} height={120} fill="#E8ECF2" stroke={H.lineSoft} strokeWidth={2} /><rect x={590} y={CT + 176 - hi} width={50} height={hi} fill={RED} opacity={0.4 + 0.6 * t2} />
        <text x={730} y={CT + 40} style={zh(30, H.text, 900)}>低壓表</text><rect x={730} y={CT + 56} width={50} height={120} fill="#E8ECF2" stroke={H.lineSoft} strokeWidth={2} /><rect x={730} y={CT + 176 - 52 + jit} width={50} height={52} fill={BLUE} opacity={0.4 + 0.6 * ou} />
        <text x={590} y={CT + 232} style={zh(30, H.text2, 800)}>示意，不標壓力數值</text>
      </svg>
    </Card>
  );
};
// ── gas-chain：六站路徑，閥箱把一條線分給三台機台 ──
const Chain: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330, v = on(f, T(o, "vmb")), s = on(f, T(o, "src")), p = on(f, T(o, "split"));
  const names = ["氣瓶櫃", "純化器", "閥箱", "雙套管", "機台", "尾氣處理"], xs = [24, 176, 328, 480, 632, 784];
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        {names.map((n, i) => <g key={n}><Chip x={xs[i]} y={CT + 4} w={144} t={n} a={i === 2 ? v : i < 2 ? 1 : 0.5} />{i < 5 ? <Arrow x1={xs[i] + 146} y1={CT + 29} x2={xs[i + 1] - 2} y2={CT + 29} c={H.text2} w={3} o={0.5} /> : null}</g>)}
        <g opacity={0.35 + 0.65 * s}><rect x={60} y={CT + 130} width={120} height={50} fill="#FFFFFF" stroke={H.amber} strokeWidth={4} /><text x={120} y={CT + 164} textAnchor="middle" style={zh(30, H.text, 900)}>一個氣源</text></g>
        <Arrow x1={184} y1={CT + 155} x2={330} y2={CT + 155} c={GAS} w={5} o={s} />
        {[0, 1, 2].map((i) => <g key={i} opacity={0.3 + 0.7 * p}><path d={`M332 ${CT + 155} L 520 ${CT + 120 + i * 52}`} stroke={GAS} strokeWidth={4} fill="none" /><rect x={524} y={CT + 98 + i * 52} width={170} height={44} fill="#FFFFFF" stroke={p > 0.5 ? H.amber : H.lineSoft} strokeWidth={p > 0.5 ? 4 : 2} /><text x={609} y={CT + 130 + i * 52} textAnchor="middle" style={zh(30, H.text, 900)}>機台 {i + 1}</text></g>)}
        <text x={30} y={CT + 236} style={zh(30, H.text2, 800)} opacity={0.4 + 0.6 * p}>每條支路可單獨維修</text>
      </svg>
    </Card>
  );
};
// ── gas-pur：吸附床剖面（橘色雜質被顆粒留住、乾淨的氣出去），濾水器比喻 ──
const Pur: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330, pu = on(f, T(o, "pur")), lk = on(f, T(o, "like")), im = on(f, T(o, "imp")), cl = on(f, T(o, "clean"));
  const beads = Array.from({ length: 30 }, (_, i) => [70 + (i % 6) * 38 + (Math.floor(i / 6) % 2) * 16, CT + 70 + Math.floor(i / 6) * 34] as const);
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        <rect x={50} y={CT + 40} width={260} height={200} fill="#F4F6F9" stroke="#5C6678" strokeWidth={4} opacity={0.4 + 0.6 * pu} />
        {beads.map(([x, y], i) => <circle key={i} cx={x} cy={y + 20} r={12} fill="#D9B36B" opacity={0.4 + 0.6 * pu} />)}
        {Array.from({ length: 8 }, (_, i) => { const u = fr(f / 50 + i * 0.13); const stuck = im > 0.5 && i % 3 !== 0; const y = stuck ? CT + 226 - u * 150 * (0.35 + 0.1 * (i % 3)) : CT + 226 - u * 190; return <circle key={i} cx={80 + i * 28} cy={y} r={7} fill={IMP} opacity={im} />; })}
        <Arrow x1={180} y1={CT + 36} x2={180} y2={CT + 8} c={GAS} w={5} o={cl} />
        <Sep x={350} />
        <Row x={380} y={CT + 56} t="吸附顆粒表面把雜質留住" c={IMP} a={im} />
        <Row x={380} y={CT + 122} t="像濾水器濾水" c={BLUE} a={lk} />
        <Row x={380} y={CT + 188} t="乾淨的氣才往機台去" c={GAS} a={cl} />
        <text x={380} y={CT + 240} style={zh(30, H.text2, 800)} opacity={0.4 + 0.6 * cl}>吸附劑種類依氣體而定，示意</text>
      </svg>
    </Card>
  );
};
// ── gas-dbl：雙套管橫剖＋偵測鏈 ──
const Dbl: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330, ou = on(f, T(o, "out")), pi = on(f, T(o, "pipe")), lk = on(f, T(o, "leak")), vl = on(f, T(o, "valve"));
  const chain: [string, number][] = [["偵測", lk], ["警報", lk], ["關閥", vl], ["排氣", vl]];
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        <rect x={30} y={CT + 14} width={500} height={86} fill="#BFD3F2" stroke="#7D8CA6" strokeWidth={4} opacity={0.4 + 0.6 * ou} />
        <rect x={30} y={CT + 38} width={500} height={38} fill="#FFFFFF" stroke="#5C6678" strokeWidth={4} opacity={0.4 + 0.6 * pi} />
        {Array.from({ length: 8 }, (_, i) => <circle key={i} cx={40 + ((f * 3 + i * 63) % 480)} cy={CT + 57} r={6} fill={GAS} opacity={vl > 0.5 ? 0 : 1} />)}
        <g opacity={lk}><rect x={250} y={CT + 70} width={14} height={8} fill="#2B2F36" />{[0, 1, 2].map((i) => <circle key={i} cx={257 + (i - 1) * 16 * fr(f / 20 + i / 3)} cy={CT + 66 - 22 * fr(f / 20 + i / 3)} r={5} fill={GAS} />)}</g>
        <text x={30} y={CT + 134} style={zh(30, H.text, 900)} opacity={0.4 + 0.6 * pi}>內管</text><text x={150} y={CT + 134} style={zh(30, H.text, 900)} opacity={0.4 + 0.6 * ou}>外套管</text><text x={300} y={CT + 134} style={zh(30, H.text2, 800)} opacity={0.4 + 0.6 * lk}>洩漏留在環空</text>
        {chain.map(([t, a], i) => <g key={t + i}><Chip x={20 + i * 132} y={CT + 170} w={110} t={t} a={a} />{i < 3 ? <Arrow x1={20 + i * 132 + 112} y1={CT + 195} x2={20 + (i + 1) * 132 - 2} y2={CT + 195} c={H.text2} w={3} o={0.5 + 0.5 * a} /> : null}</g>)}
        <Sep x={570} />
        <Row x={596} y={CT + 56} t="外面再套一根管" c={BLUE} a={ou} />
        <Row x={596} y={CT + 122} t="漏出來被攔住" c={IMP} a={lk} />
        <Row x={596} y={CT + 188} t="偵測後自動關閥" c={H.amber} a={vl} />
      </svg>
    </Card>
  );
};
// ── gas-chm：噴頭俯視＋沿晶圓向外抽走 ──
const Chm: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330, a = on(f, T(o, "in")), s = on(f, T(o, "shw")), p = on(f, T(o, "pump")), cx = 160, cy = CT + 130;
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        <circle cx={cx} cy={cy} r={104} fill="#E8ECF2" stroke="#5C6678" strokeWidth={4} opacity={0.4 + 0.6 * a} />
        {Array.from({ length: 19 }, (_, i) => { const r = i === 0 ? 0 : i < 7 ? 28 : i < 19 ? 66 : 0, an = i < 7 ? (i - 1) * 60 : (i - 7) * 30; return <circle key={i} cx={cx + Math.cos((an * Math.PI) / 180) * r} cy={cy + Math.sin((an * Math.PI) / 180) * r} r={5} fill={BLUE} opacity={0.3 + 0.7 * s} />; })}
        {Array.from({ length: 8 }, (_, i) => { const an = (i * 45 * Math.PI) / 180, u = fr(f / 45 + i * 0.1); return <circle key={i} cx={cx + Math.cos(an) * (20 + u * 100)} cy={cy + Math.sin(an) * (20 + u * 100)} r={6} fill={GAS} opacity={s} />; })}
        <Sep x={310} />
        <Row x={336} y={CT + 56} t="噴頭孔陣：氣均勻灑下" c={BLUE} a={s} />
        <Row x={336} y={CT + 122} t="沿晶圓表面往外流" c={GAS} a={s} />
        <Row x={336} y={CT + 188} t="邊緣被泵抽走" c={H.amber} a={p} />
        <text x={336} y={CT + 240} style={zh(30, H.text2, 800)} opacity={0.4 + 0.6 * p}>腔內壓力很低，示意</text>
      </svg>
    </Card>
  );
};
// ── gas-burn：燃燒＋水洗 ／ 電漿＋水洗（兩種尾氣處理） ──
const Burn: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330, u = on(f, T(o, "used")), b = on(f, T(o, "burn")), w = on(f, T(o, "wash")), l = on(f, T(o, "like"));
  const Col: React.FC<{ x: number; head: string; mid: string; c: string; a: number }> = ({ x, head, mid, c, a }) => (
    <g opacity={0.4 + 0.6 * a}><text x={x} y={CT + 30} style={zh(32, H.text, 900)}>{head}</text>
      <Chip x={x} y={CT + 48} w={110} t="廢氣" a={u} /><Arrow x1={x + 114} y1={CT + 73} x2={x + 140} y2={CT + 73} c={H.text2} w={3} /><Chip x={x + 144} y={CT + 48} w={130} t={mid} a={a} /><Arrow x1={x + 278} y1={CT + 73} x2={x + 304} y2={CT + 73} c={H.text2} w={3} /><Chip x={x + 308} y={CT + 48} w={110} t="水洗" a={w} />
      <rect x={x + 150} y={CT + 112} width={118} height={26} fill={c} opacity={0.5 + 0.2 * Math.sin(f * 0.5)} /></g>
  );
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        <Col x={30} head="燃燒式" mid="火焰" c={FIRE} a={b} />
        <Col x={500} head="電漿式" mid="電漿" c="#9B7BFF" a={l} />
        <Row x={30} y={CT + 196} t="先分解有害的，再用水吸收" c={H.amber} a={w} />
        <Row x={30} y={CT + 240} t="像排油煙機加淨水，示意不標效率" c={BLUE} a={l} />
      </svg>
    </Card>
  );
};
// ── gas-co：公司名牌（林德只寫全球不放旗；液化空氣＝法國；大陽日酸＝日本；台灣三家＋台灣旗） ──
const Co: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 360, li = on(f, T(o, "lin")), ai = on(f, T(o, "air")), tw = on(f, T(o, "tw"));
  const L: [string, string | undefined, number][] = [["林德（全球）", undefined, li], ["液化空氣", "FR", ai], ["大陽日酸", "JP", ai]];
  const R: [string, number][] = [["台特化 4772", tw], ["聯華實業 1229", tw], ["兆捷 6959", tw]];
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        <text x={30} y={CT + 26} style={zh(30, H.text2, 800)}>國際</text><text x={500} y={CT + 26} style={zh(30, H.text2, 800)}>台灣</text>
        {L.map(([n, c, a], i) => <g key={n} opacity={0.4 + 0.6 * a}><Plate x={30} y={CT + 42 + i * 72} w={300} t={n} a={a} code={c} /></g>)}
        {R.map(([n, a], i) => <g key={n} opacity={0.4 + 0.6 * a}><Plate x={500} y={CT + 42 + i * 72} w={300} t={n} a={a} code="TW" /></g>)}
        <Sep x={470} />
      </svg>
    </Card>
  );
};
// ── gas-next：下一集：濕式化學品與研磨液；留言關鍵字 ──
const Next: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330, nx = on(f, T(o, "next")), lq = on(f, T(o, "liq")), kw = on(f, T(o, "kw"));
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        <Chip x={30} y={CT + 6} w={170} t="前驅物" a={1} /><Arrow x1={208} y1={CT + 31} x2={254} y2={CT + 31} c={H.text2} w={4} />
        <Chip x={262} y={CT + 6} w={170} t="特用氣體" a={1} /><Arrow x1={440} y1={CT + 31} x2={486} y2={CT + 31} c={H.text2} w={4} o={0.4 + 0.6 * nx} />
        <Chip x={494} y={CT + 6} w={300} t="濕式化學品與研磨液" a={nx} />
        <Row x={30} y={CT + 128} t="氣體之外：換看液體" c={BLUE} a={lq} />
        <Row x={30} y={CT + 188} t="清洗與研磨" c={H.amber} a={lq} />
        <g opacity={0.35 + 0.65 * kw}><rect x={560} y={CT + 150} width={330} height={60} fill="#FFF4DA" stroke={H.amber} strokeWidth={4} /><text x={725} y={CT + 192} textAnchor="middle" style={zh(34, H.text, 900)}>留言「氣體」</text></g>
      </svg>
    </Card>
  );
};
export const GasSection: React.FC<P> = (p) => {
  const kd = String((p.o as any).kind);
  const M: Record<string, React.FC<P>> = { "gas-hook": Hook, "gas-use": Use, "gas-ppb": Ppb, "gas-reg": Reg, "gas-chain": Chain, "gas-pur": Pur, "gas-dbl": Dbl, "gas-chm": Chm, "gas-burn": Burn, "gas-co": Co, "gas-next": Next };
  const C = M[kd]; return C ? <C {...p} /> : null;
};

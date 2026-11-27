// 2026/11/27 tech-wirebond：封裝打線（系列 3 第 2 集）的 2D 示意卡（overlay `section` 的 kind 以 "wb-" 開頭，Hud.tsx 的 HudSection 轉過來）。
//   wb-hook 接上集｜wb-path 焊墊—細線—金屬腳｜wb-needle 縫紉機針 vs 劈刀、頭髮 vs 線｜wb-steps 打一條線的五步｜wb-clay 搓黏土（不是融化）｜wb-speed 一秒約十條｜wb-cu 金線換銅線｜wb-co 日月光、安靠、庫力索法｜wb-next 下一集封裝材料
// 全部示意；只放查證過的說法（videos/tech-wirebond/research.md）。公司官方 LOGO 當天抓不到（assets.md），用白底文字名牌＋國旗，100% 不透明。
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
// solid：卡裡有 LOGO／國旗時不用透明度進場（官方 LOGO 與國旗 100% 不透明），改用由下滑入
const Card: React.FC<{ o: Overlay3D; k: number; W: number; Hh: number; solid?: boolean; children: React.ReactNode }> = ({ o, k, W, Hh, solid, children }) => (
  <div style={{ position: "absolute", left: o.x ?? L.X, top: o.y ?? 900, width: W, height: Hh, opacity: solid ? (k > 0.02 ? 1 : 0) : k, transform: solid ? `translateY(${Math.round((1 - k) * 20)}px)` : undefined, background: H.cardCompare, border: `2px solid ${H.lineSoft}`, boxSizing: "border-box", overflow: "hidden" }}>
    {o.title ? <div style={{ ...zh(CARD_HEAD.px, onC(H.line), 800), ...cardTitleBox(), background: H.line, zIndex: 2 }}>{o.title}</div> : null}
    {o.tag ? <div style={{ position: "absolute", right: 16, top: 14, ...zh(28, H.text2, 600), zIndex: 2 }}>{o.tag}</div> : null}
    {children}
  </div>
);
const on = (f: number, at: number, d = 10) => tween(f, at, d, EASE.enter);
const fr = (x: number) => ((x % 1) + 1) % 1;
const RED = "#E0472F", OK = "#14A38B", BLUE = "#2F7FE0", ORG = "#F29A4A", GRY = "#98A2B3", LIQ = "#BFDDFB", ACID = "#C9DE5A", ETCH = "#F2C94C", MILK = "#EFE8DA", SIL = "#CFE0F5", RUST = "#B5532B";
const Sep: React.FC<{ x: number; y2?: number }> = ({ x, y2 = 316 }) => <line x1={x} y1={CT + 4} x2={x} y2={y2} stroke={H.lineSoft} strokeWidth={3} />;
const Row: React.FC<{ x: number; y: number; t: string; c: string; a: number; px?: number }> = ({ x, y, t, c, a, px = 30 }) => (
  <g opacity={0.35 + 0.65 * a}><rect x={x} y={y - px * 0.72} width={12} height={px * 0.72} fill={c} /><text x={x + 24} y={y} style={zh(px, H.text, 900)}>{t}</text></g>
);
const Chip: React.FC<{ x: number; y: number; w: number; t: string; a: number; c?: string }> = ({ x, y, w, t, a, c = "#FFF4DA" }) => (
  <g opacity={0.4 + 0.6 * a}><rect x={x} y={y} width={w} height={50} fill={a > 0.5 ? c : "#FFFFFF"} stroke={a > 0.5 ? H.amber : H.lineSoft} strokeWidth={a > 0.5 ? 4 : 2} />
    <text x={x + w / 2} y={y + 35} textAnchor="middle" style={zh(30, H.text, 900)}>{t}</text></g>
);
const Arr: React.FC<{ x1: number; x2: number; y: number; a: number }> = ({ x1, x2, y, a }) => <g opacity={0.35 + 0.65 * a}><path d={`M${x1} ${y} L${x2 - 8} ${y}`} stroke={H.text2} strokeWidth={4} /><path d={`M${x2} ${y} l-14 -9 l0 18 Z`} fill={H.text2} /></g>;
const FlagBox: React.FC<{ code: string; x: number; y: number; a: number }> = ({ code, x, y, a }) => (
  <g><rect x={x} y={y} width={50} height={36} fill="none" stroke={a > 0.5 ? H.amber : H.lineSoft} strokeWidth={a > 0.5 ? 4 : 1.5} /><Flag code={code} h={28} x={x + 4} y={y + 4} asSvg /></g>
);
const NamePlate: React.FC<{ x: number; y: number; w: number; h: number; t: string; a: number; px?: number }> = ({ x, y, w, h, t, a, px = 34 }) => (
  <g><rect x={x} y={y} width={w} height={h} fill="#FFFFFF" stroke={a > 0.5 ? H.amber : H.lineSoft} strokeWidth={a > 0.5 ? 4 : 1.5} />
    <text x={x + w / 2} y={y + h / 2 + px * 0.34} textAnchor="middle" style={zh(px, "#1F3A5F", 900)}>{t}</text></g>
);

const AU = "#E2B33C", CU = "#D07A45", AL = "#C9CED6", DIE = "#2B3A55", LF = "#C98A5A", CAPC = "#EFEBE2", OXC = "#6B7380", GAS = "#7FC8B0";
/** 晶片小圖：深藍方塊＋一圈焊墊 */
const DieIcon: React.FC<{ x: number; y: number; s: number; a: number; lit?: number }> = ({ x, y, s, a, lit = 0 }) => (
  <g opacity={0.45 + 0.55 * a}><rect x={x} y={y} width={s} height={s} fill={DIE} stroke={H.text2} strokeWidth={3} />
    {Array.from({ length: 4 }, (_, i) => [x + s * (0.18 + i * 0.21), y + s * 0.08]).concat(Array.from({ length: 4 }, (_, i) => [x + s * (0.18 + i * 0.21), y + s * 0.84])).map(([px, py], i) =>
      <rect key={i} x={px - 6} y={py - 4} width={12} height={10} fill={lit > 0.5 ? H.amber : AL} />)}</g>
);
/** 線弧（貝茲曲線），p＝畫出的比例 */
const Arc: React.FC<{ x1: number; y1: number; x2: number; y2: number; h: number; p: number; c?: string; w?: number }> = ({ x1, y1, x2, y2, h, p, c = AU, w = 5 }) => {
  const d = `M${x1} ${y1} C ${x1} ${y1 - h}, ${x2 - (x2 - x1) * 0.3} ${Math.min(y1, y2) - h * 0.8}, ${x2} ${y2}`;
  return <path d={d} fill="none" stroke={c} strokeWidth={w} strokeLinecap="round" pathLength={1} strokeDasharray={`${Math.max(0.001, p)} 1`} />;
};
/** 劈刀小圖（尖端朝下的錐＋中間孔＋線） */
const Capi: React.FC<{ x: number; y: number; a: number; s?: number }> = ({ x, y, a, s = 1 }) => (
  <g opacity={0.45 + 0.55 * a} transform={`translate(${x} ${y}) scale(${s})`}><path d="M-22 -110 L22 -110 L22 -60 L7 0 L-7 0 L-22 -60 Z" fill={CAPC} stroke={H.text2} strokeWidth={3} />
    <line x1={0} y1={-130} x2={0} y2={4} stroke={AU} strokeWidth={4} /><circle cx={0} cy={10} r={8} fill={AU} /></g>
);

// ── wb-hook：前一集切好晶片 → 這一集打線；電怎麼接出來？ ──
const Hook: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330, pv = on(f, T(o, "prev")), ch = on(f, T(o, "chip")), ou = on(f, T(o, "out")), wb = tween(f, T(o, "wb"), 24, EASE.move);
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        <DieIcon x={40} y={CT + 40} s={130} a={ch} lit={ou} />
        <rect x={260} y={CT + 70} width={90} height={22} fill={LF} opacity={0.45 + 0.55 * ou} /><rect x={260} y={CT + 130} width={90} height={22} fill={LF} opacity={0.45 + 0.55 * ou} />
        <Arc x1={150} y1={CT + 52} x2={290} y2={CT + 70} h={50} p={wb} />
        <text x={196} y={CT + 214} style={zh(30, H.text2, 800)} opacity={0.45 + 0.55 * ou}>？</text>
        <Sep x={400} />
        <Row x={430} y={CT + 56} t="前一集：晶片切好了" c={H.text2} a={pv} /><Row x={430} y={CT + 122} t="電怎麼接出來？" c={H.amber} a={ou} /><Row x={430} y={CT + 188} t="這一集：打線" c={BLUE} a={wb} />
      </svg>
    </Card>
  );
};
// ── wb-path：焊墊（晶片）—細線—金屬腳（引腳） ──
const Path: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330, pa = on(f, T(o, "pad")), wi = tween(f, T(o, "wire"), 30, EASE.move), le = on(f, T(o, "lead"));
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        <rect x={30} y={CT + 110} width={260} height={70} fill={DIE} opacity={0.5 + 0.5 * pa} /><rect x={210} y={CT + 96} width={50} height={16} fill={pa > 0.5 ? H.amber : AL} />
        <rect x={440} y={CT + 150} width={200} height={30} fill={LF} opacity={0.45 + 0.55 * le} /><rect x={440} y={CT + 144} width={70} height={8} fill={le > 0.5 ? H.amber : "#E6EAF0"} />
        <Arc x1={235} y1={CT + 96} x2={470} y2={CT + 144} h={70} p={wi} />
        <text x={30} y={CT + 230} style={zh(30, H.text, 900)} opacity={0.45 + 0.55 * pa}>焊墊（晶片）</text><text x={440} y={CT + 230} style={zh(30, H.text, 900)} opacity={0.45 + 0.55 * le}>金屬腳</text>
        <Sep x={680} />
        <Row x={706} y={CT + 56} t="焊墊" c={H.amber} a={pa} /><Row x={706} y={CT + 122} t="細線" c={AU} a={wi} /><Row x={706} y={CT + 188} t="金屬腳" c={LF} a={le} />
      </svg>
    </Card>
  );
};
// ── wb-needle：像縫紉機針，但是壓、不是刺穿；線約頭髮三分之一粗 ──
const Needle: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330, ca = on(f, T(o, "cap")), se = on(f, T(o, "sew")), mi = on(f, T(o, "mid")), ha = on(f, T(o, "hair"));
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        <g opacity={0.45 + 0.55 * se}><path d="M70 60 L80 60 L78 228 L75 250 L72 228 Z" transform={`translate(0 ${CT - 40})`} fill="#B9C2CF" stroke={H.text2} strokeWidth={2} /><ellipse cx={75} cy={CT + 160} rx={3} ry={10} fill="#FFFFFF" stroke={H.text2} strokeWidth={2} /></g>
        <text x={30} y={CT + 252} style={zh(30, H.text2, 800)} opacity={0.45 + 0.55 * se}>縫紉機針</text>
        <Capi x={240} y={CT + 170} a={Math.max(ca, mi)} />
        <text x={180} y={CT + 252} style={zh(30, H.text, 900)} opacity={0.45 + 0.55 * ca}>劈刀：壓</text>
        <Sep x={350} />
        <circle cx={460} cy={CT + 110} r={78} fill="#F1E3C8" stroke={H.text2} strokeWidth={3} opacity={0.45 + 0.55 * ha} /><circle cx={460} cy={CT + 110} r={26} fill={AU} stroke="#8A5E00" strokeWidth={2} opacity={ha} />
        <text x={390} y={CT + 252} style={zh(30, H.text2, 800)} opacity={0.45 + 0.55 * ha}>頭髮 vs 線</text>
        <Sep x={580} />
        <Row x={606} y={CT + 56} t="線從中間穿出" c={AU} a={mi} /><Row x={606} y={CT + 122} t="約頭髮三分之一粗" c={H.amber} a={ha} /><Row x={606} y={CT + 188} t="不刺穿，是壓" c={BLUE} a={ca} />
      </svg>
    </Card>
  );
};
// ── wb-steps：打一條線的五步 ──
const Steps: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330, names = ["燒成球", "第一焊點", "拉弧線", "第二焊點", "拉斷"], a = ["s1", "s2", "s3", "s4", "s5"].map((n) => on(f, T(o, n)));
  const cur = a.reduce((c, v, i) => (v > 0.5 ? i : c), -1);
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        {names.map((n, i) => { const x = 24 + i * 184, on1 = a[i], here = i === cur;
          return <g key={i}><rect x={x} y={CT + 20} width={168} height={150} fill={here ? "#FFF4DA" : "#FFFFFF"} stroke={here ? H.amber : on1 > 0.5 ? H.text2 : H.lineSoft} strokeWidth={here ? 5 : 2} />
            <circle cx={x + 34} cy={CT + 56} r={22} fill={on1 > 0.5 ? H.amber : H.lineSoft} /><text x={x + 34} y={CT + 67} textAnchor="middle" style={zh(30, "#FFFFFF", 900)}>{i + 1}</text>
            <text x={x + 84} y={CT + 140} textAnchor="middle" style={zh(30, H.text, 900)} opacity={0.4 + 0.6 * on1}>{n}</text></g>; })}
        <text x={24} y={CT + 232} style={zh(30, H.text2, 800)}>劈刀一上一下，一條線約十分之一秒</text>
      </svg>
    </Card>
  );
};
// ── wb-clay：像兩塊黏土搓掉表面的灰就黏成一塊；不是融化 ──
const Clay: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330, cl = on(f, T(o, "clay")), du = on(f, T(o, "dust")), one = tween(f, T(o, "one"), 24, EASE.move), me = on(f, T(o, "melt"));
  const gap = 46 * (1 - one), wob = Math.sin(f * 0.9) * 6 * du * (1 - one);
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        <g opacity={0.45 + 0.55 * cl}><ellipse cx={200 + wob} cy={CT + 70 - gap / 2} rx={120} ry={36} fill={AU} stroke="#8A5E00" strokeWidth={3} />
          <ellipse cx={200} cy={CT + 140 + gap / 2} rx={140} ry={36} fill={AL} stroke={H.text2} strokeWidth={3} />
          {Array.from({ length: 9 }, (_, i) => <rect key={i} x={86 + i * 26 + (i % 2) * 6 + du * (i - 4) * 10} y={CT + 106 + (i % 3) * 3 - du * 8} width={14} height={6} fill={OXC} opacity={(1 - one) * (1 - 0.6 * du)} />)}
          <rect x={90} y={CT + 102} width={220} height={8} fill="#B78BE0" opacity={one} /></g>
        <text x={40} y={CT + 232} style={zh(30, H.text2, 800)} opacity={0.45 + 0.55 * du}>灰＝氧化膜，被搓碎擠開</text>
        <Sep x={420} />
        <Row x={446} y={CT + 52} t="壓力" c={H.text2} a={cl} /><Row x={446} y={CT + 106} t="加熱（約一百多度）" c={RED} a={cl} />
        <Row x={446} y={CT + 160} t="超音波來回搓" c={BLUE} a={du} /><Row x={446} y={CT + 214} t="不是融化、沒有焊錫" c={H.amber} a={me} />
      </svg>
    </Card>
  );
};
// ── wb-speed：一秒約十條；又快又便宜；手機、汽車 ──
const Speed: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330, te = on(f, T(o, "ten")), ch = on(f, T(o, "cheap")), ph = on(f, T(o, "phone")), st = on(f, T(o, "still"));
  const n = Math.min(10, Math.max(0, Math.floor((f - T(o, "ten")) / 3)));
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        <DieIcon x={40} y={CT + 40} s={150} a={1} />
        {Array.from({ length: 10 }, (_, i) => { const yy = CT + 50 + i * 13; return <path key={i} d={`M188 ${yy} Q 225 ${yy - 24} 262 ${yy + 8}`} fill="none" stroke={AU} strokeWidth={3} opacity={i < n ? 1 : 0.12} />; })}
        <rect x={262} y={CT + 46} width={30} height={140} fill={LF} />
        <text x={40} y={CT + 240} style={zh(30, H.text, 900)} opacity={0.45 + 0.55 * te}>一秒約 {n} 條（示意）</text>
        <Sep x={400} />
        <Row x={430} y={CT + 56} t="一秒約打十條" c={H.amber} a={te} /><Row x={430} y={CT + 122} t="設備成熟，又快又便宜" c={BLUE} a={ch} /><Row x={430} y={CT + 188} t="手機、汽車很多晶片還靠它" c={H.text2} a={Math.max(ph, st)} />
      </svg>
    </Card>
  );
};
// ── wb-cu：金線 → 銅線；銅會氧化，要吹保護氣 ──
const Cu: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330, go = on(f, T(o, "gold")), pr = on(f, T(o, "pricey")), cu = on(f, T(o, "cu")), ox = on(f, T(o, "ox")), ga = on(f, T(o, "gas"));
  const col = (x: number, c: string, name: string, l1: string, l2: string, a: number, a1: number, a2: number) => (
    <g><circle cx={x + 50} cy={CT + 90} r={42} fill={c} stroke={H.text2} strokeWidth={3} opacity={0.45 + 0.55 * a} />
      <text x={x + 110} y={CT + 70} style={zh(34, H.text, 900)} opacity={0.45 + 0.55 * a}>{name}</text>
      <Row x={x + 110} y={CT + 122} t={l1} c={RED} a={a1} /><Row x={x} y={CT + 196} t={l2} c={BLUE} a={a2} /></g>);
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        {col(24, AU, "金線", "太貴", "不易氧化", go, pr, go)}
        <Sep x={470} y2={CT + 215} />
        {col(496, CU, "銅線", "會氧化", "吹保護氣（氮＋氫）", cu, ox, ga)}
        <circle cx={546} cy={CT + 90} r={58} fill="none" stroke={GAS} strokeWidth={8} strokeDasharray="10 8" opacity={ga} />
        <text x={24} y={CT + 252} style={zh(30, H.text2, 800)} opacity={0.45 + 0.55 * cu}>銅也比較硬，壓太用力會傷到焊墊</text>
      </svg>
    </Card>
  );
};
// ── wb-co：日月光、安靠、庫力索法（官方 LOGO 當天抓不到，用白底文字名牌＋國旗；100% 不透明） ──
const Co: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 392, as = on(f, T(o, "ase")), am = on(f, T(o, "amkor")), mk = on(f, T(o, "maker")), kn = on(f, T(o, "kns"));
  const rows: [string, string, number, string][] = [["TW", "日月光", as, "封裝測試（台灣）"], ["US", "安靠", am, "封裝測試（美國）"], ["US", "庫力索法", Math.max(mk, kn), "打線機（美國、新加坡）"]];
  return (
    <Card o={o} k={k} W={W} Hh={Hh} solid>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        <text x={24} y={CT + 30} style={zh(32, H.text2, 900)}>封裝廠兩家、打線機一家</text>
        {rows.map(([c, nm, a, what], i) => { const y = CT + 56 + i * 98;
          return <g key={i}><FlagBox code={c} x={24} y={y + 6} a={a} /><NamePlate x={92} y={y} w={250} h={48} t={nm} a={a} px={32} />
            <text x={366} y={y + 35} style={zh(30, H.text2, 800)} opacity={0.4 + 0.6 * a}>{what}</text></g>; })}
      </svg>
    </Card>
  );
};
// ── wb-next：下一集封裝材料（導線架、封裝膠、錫球）；金線會被銅取代嗎？ ──
const Next: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330, dn = on(f, T(o, "done")), ba = on(f, T(o, "bare")), nx = on(f, T(o, "next")), ma = on(f, T(o, "mat")), q = on(f, T(o, "q")), kw = on(f, T(o, "kw"));
  const items: [string, string][] = [["導線架", LF], ["封裝膠", "#22252B"], ["錫球", "#C9CED6"]];
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        {items.map(([t, c], i) => { const x = 24 + i * 150, a = Math.max(nx, ma);
          return <g key={i} opacity={0.4 + 0.6 * a}>{i === 2 ? <circle cx={x + 60} cy={CT + 70} r={34} fill={c} stroke={H.text2} strokeWidth={3} /> : <rect x={x + 18} y={CT + 40} width={84} height={60} fill={c} stroke={H.text2} strokeWidth={3} />}
            <text x={x + 60} y={CT + 150} textAnchor="middle" style={zh(30, H.text, 900)}>{t}</text></g>; })}
        <text x={24} y={CT + 220} style={zh(30, H.text2, 800)} opacity={0.4 + 0.6 * Math.max(dn, ba)}>線接好了，晶片還光著</text>
        <Sep x={480} />
        <Row x={506} y={CT + 56} t="下一集：封裝材料" c={H.text2} a={nx} /><Row x={506} y={CT + 122} t="金線會被銅取代嗎？" c={H.amber} a={q} /><Row x={506} y={CT + 188} t="留言「打線」拿完整資料" c={BLUE} a={kw} />
      </svg>
    </Card>
  );
};

export const WirebondSection: React.FC<P> = (p0) => {
  const p = { ...p0, k: Math.min(1, (p0 as any).k * 1.5) } as P;   // 退場約 4 幀，換幕不留舊卡殘影
  const kd = String((p.o as any).kind);
  if (kd === "wb-hook") return <Hook {...p} />;
  if (kd === "wb-path") return <Path {...p} />;
  if (kd === "wb-needle") return <Needle {...p} />;
  if (kd === "wb-steps") return <Steps {...p} />;
  if (kd === "wb-clay") return <Clay {...p} />;
  if (kd === "wb-speed") return <Speed {...p} />;
  if (kd === "wb-cu") return <Cu {...p} />;
  if (kd === "wb-co") return <Co {...p} />;
  if (kd === "wb-next") return <Next {...p} />;
  return null;
};

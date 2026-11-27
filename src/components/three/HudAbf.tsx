// 2026/11/27 tech-abf：ABF-1 ABF 膜（系列 3 第 7 集）的 2D 示意卡（overlay `section` 的 kind 以 "abf-" 開頭，Hud.tsx 的 HudSection 轉過來）。
//   abf-hook 接上集｜abf-floor 載板像大樓｜abf-lam 像貼保鮮膜：貼、壓、烤｜abf-via 雷射孔像電梯井｜abf-sap 打草稿、描粗、擦掉｜abf-layers 一般處理器 vs AI 晶片載板層數｜
//   abf-aji 味之素（從做味精的化學研究延伸）｜abf-share 超過九成五＋晶化科技｜abf-next 下一集 ABF 載板。
// 只放查證過的數字（research.md）：十幾層、超過九成五；不標膜厚、線寬、溫度。國旗、名牌永遠 100% 不透明（未輪到＝細灰框）。
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

const ABF = "#EFE4C8", CU = "#C8743A", CUB = "#E39A5C", CORE = "#C9C08A", SM = "#2E6B47", RES = "#3E6FD8", PET = "#BFE3F5";
// 剖面小圖：n 層（膜＋銅線），中間芯板
const Stack: React.FC<{ x: number; y: number; w: number; n: number; a: number; hiFilm?: boolean }> = ({ x, y, w, n, a, hiFilm }) => {
  const h = 10, out: React.ReactNode[] = []; let yy = y;
  for (let i = 0; i < n; i++) { out.push(<rect key={`f${i}`} x={x} y={yy} width={w} height={h} fill={ABF} stroke={hiFilm ? H.amber : H.lineSoft} strokeWidth={hiFilm ? 2 : 1} />);
    for (let k = 0; k < 4; k++) out.push(<rect key={`c${i}${k}`} x={x + 8 + k * (w - 16) / 4} y={yy + h} width={(w - 16) / 8} height={4} fill={CU} />);
    yy += h + 4; if (i === Math.floor(n / 2) - 1) { out.push(<rect key="core" x={x} y={yy} width={w} height={18} fill={CORE} stroke={H.lineSoft} />); yy += 18; } }
  return <g opacity={0.4 + 0.6 * a}>{out}</g>;
};

// ── abf-hook：前一集訊號靠載板拉出去；這集：載板裡的絕緣膜在隔什麼？ ──
const Hook: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330, fi = on(f, T(o, "film")), q = on(f, T(o, "q")), pv = on(f, T(o, "prev")), sg = on(f, T(o, "sig")), pu = Math.sin(f * 0.14) * 0.5 + 0.5;
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        <rect x={80} y={CT + 14} width={110} height={34} fill="#3B4658" opacity={0.4 + 0.6 * sg} />
        <Stack x={40} y={CT + 56} w={190} n={4} a={fi} hiFilm={fi > 0.5} />
        {Array.from({ length: 5 }, (_, i) => { const u = fr(f * 0.02 + i / 5); return <circle key={i} cx={135} cy={CT + 48 + u * 150} r={6} fill={POW} opacity={sg} />; })}
        <text x={276} y={CT + 120} textAnchor="middle" style={zh(56, RED, 900)} opacity={q * (0.6 + 0.4 * pu)}>？</text>
        <Sep x={318} />
        <Row x={344} y={CT + 56} t="載板裡的絕緣膜，在隔什麼？" c={BLUE} a={q} />
        <Row x={344} y={CT + 122} t="前一集：先進封裝設備" c={H.text2} a={pv} />
        <Row x={344} y={CT + 188} t="訊號要靠載板拉出去" c={POW} a={sg} />
      </svg>
    </Card>
  );
};

// ── abf-floor：大樓剖面（樓層＝銅線層、樓板＝絕緣膜、電梯井＝孔） ──
const Floor: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330, bd = on(f, T(o, "bld")), cu = on(f, T(o, "cu")), md = on(f, T(o, "mid")), fi = on(f, T(o, "film"));
  const X = 40, Y = CT + 20, w = 240;
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        <path d={`M${X} ${Y + 30} L${X + w / 2} ${Y} L${X + w} ${Y + 30}`} fill="none" stroke={H.text2} strokeWidth={3} opacity={0.4 + 0.6 * bd} />
        {[0, 1, 2, 3].map((i) => <g key={i}><rect x={X} y={Y + 34 + i * 44} width={w} height={14} fill={ABF} stroke={fi > 0.5 ? H.amber : H.text2} strokeWidth={fi > 0.5 ? 3 : 1.5} opacity={0.4 + 0.6 * Math.max(md, bd)} />
          {[0, 1, 2, 3, 4].map((kk) => <rect key={kk} x={X + 14 + kk * 46} y={Y + 50 + i * 44} width={26} height={10} fill={CU} opacity={0.4 + 0.6 * cu} />)}</g>)}
        <rect x={X + 108} y={Y + 34} width={22} height={176} fill={CUB} opacity={0.3 + 0.7 * fi} />
        <Sep x={318} />
        <Row x={344} y={CT + 52} t="載板像一棟大樓" c={H.text2} a={bd} />
        <Row x={344} y={CT + 112} t="每層樓：走滿銅線" c={CU} a={cu} />
        <Row x={344} y={CT + 172} t="樓板：絕緣膜（ABF）隔開" c={H.amber} a={fi} />
        <Row x={344} y={CT + 232} t="不隔開，線會短路" c={RED} a={fi} />
      </svg>
    </Card>
  );
};

// ── abf-lam：膜三層（保護膜／樹脂／承載膜）→ 貼 → 壓平 → 加熱變硬 ──
const Lam: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330, th = on(f, T(o, "thin")), wr = on(f, T(o, "wrap")), st = on(f, T(o, "stick")), pr = on(f, T(o, "press")), ht = on(f, T(o, "heat"), 20);
  const X = 40, Y = CT + 40;
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        <g opacity={0.4 + 0.6 * th}><rect x={X} y={Y} width={240} height={8} fill="#9FD0EE" transform={`rotate(${-14 * st} ${X + 240} ${Y + 8})`} />
          <rect x={X} y={Y + 10} width={240} height={22} fill={ht > 0.5 ? "#D9C79A" : ABF} stroke={H.text2} strokeWidth={1.5} />
          <rect x={X} y={Y + 32} width={240} height={8} fill={PET} stroke={H.lineSoft} /></g>
        <rect x={X} y={Y + 70} width={240} height={26} fill={CORE} stroke={H.text2} strokeWidth={2} opacity={0.4 + 0.6 * wr} />
        <rect x={X - 6} y={Y + 110 - 20 * pr} width={252} height={16} fill="#A9B5C7" stroke={H.text2} strokeWidth={2} opacity={0.4 + 0.6 * pr} />
        {[0, 1, 2, 3].map((i) => <path key={i} d={`M${X + 30 + i * 60} ${Y + 150} q8 -10 0 -20 q-8 -10 0 -20`} fill="none" stroke={ORG} strokeWidth={4} opacity={ht * (0.6 + 0.4 * Math.sin(f * 0.2 + i))} />)}
        <Sep x={318} />
        <Row x={344} y={CT + 52} t="膜很薄：保護膜＋樹脂＋承載膜" c={H.text2} a={th} />
        <Row x={344} y={CT + 112} t="像貼保鮮膜，一張張貼" c={BLUE} a={st} />
        <Row x={344} y={CT + 172} t="抽真空、壓平" c={H.amber} a={pr} />
        <Row x={344} y={CT + 232} t="加熱，樹脂變硬（固化）" c={ORG} a={ht} />
      </svg>
    </Card>
  );
};

// ── abf-via：雷射光錐收斂到膜面，打出倒錐孔，孔底停在銅墊 ──
const Via: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330, ls = on(f, T(o, "laser")), ho = on(f, T(o, "hole")), lf = on(f, T(o, "lift")), cn = on(f, T(o, "conn"));
  const X = 40, Y = CT + 110;
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        <path d={`M${X + 90} ${CT + 10} L${X + 150} ${CT + 10} L${X + 124} ${Y} L${X + 116} ${Y} Z`} fill={RED} opacity={0.15 + 0.5 * ls * (0.7 + 0.3 * Math.sin(f * 0.6))} />
        <rect x={X} y={Y} width={240} height={50} fill={ABF} stroke={H.text2} strokeWidth={2} />
        <path d={`M${X + 100} ${Y} L${X + 140} ${Y} L${X + 130} ${Y + 50} L${X + 110} ${Y + 50} Z`} fill={cn > 0.5 ? CUB : "#2B2F36"} opacity={ho} />
        <rect x={X + 90} y={Y + 50} width={60} height={10} fill={CU} /><rect x={X} y={Y + 60} width={240} height={30} fill={ABF} stroke={H.lineSoft} />
        <rect x={X + 98} y={Y - 6} width={44} height={6} fill={CU} opacity={cn} />
        <Sep x={318} />
        <Row x={344} y={CT + 52} t="雷射收斂到膜面" c={RED} a={ls} />
        <Row x={344} y={CT + 112} t="打出小洞（倒錐形）" c={H.text2} a={ho} />
        <Row x={344} y={CT + 172} t="像電梯井：層和層連通" c={H.amber} a={lf} />
        <Row x={344} y={CT + 232} t="孔底停在銅墊，不打穿" c={BLUE} a={cn} />
      </svg>
    </Card>
  );
};

// ── abf-sap：四格（薄銅草稿 → 光阻開口 → 開口鍍厚 → 洗掉多的薄銅） ──
const Sap: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330, se = on(f, T(o, "seed")), dr = on(f, T(o, "draft")), li = on(f, T(o, "line")), tk = on(f, T(o, "thick")), wa = on(f, T(o, "wash"));
  const cell = (i: number, a: number, body: React.ReactNode) => <g key={i} opacity={0.35 + 0.65 * a} transform={`translate(${30 + i * 140} ${CT + 30})`}>
    <rect x={0} y={80} width={120} height={40} fill={ABF} stroke={H.text2} strokeWidth={1.5} />{body}
    <text x={60} y={160} textAnchor="middle" style={zh(30, H.text, 900)}>{["草稿", "蓋住", "描粗", "擦掉"][i]}</text></g>;
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        {cell(0, Math.max(se, dr), <rect x={0} y={76} width={120} height={4} fill={CUB} />)}
        {cell(1, li, <><rect x={0} y={76} width={120} height={4} fill={CUB} /><rect x={0} y={44} width={30} height={32} fill={RES} /><rect x={50} y={44} width={20} height={32} fill={RES} /><rect x={90} y={44} width={30} height={32} fill={RES} /></>)}
        {cell(2, tk, <><rect x={0} y={76} width={120} height={4} fill={CUB} /><rect x={0} y={44} width={30} height={32} fill={RES} /><rect x={50} y={44} width={20} height={32} fill={RES} /><rect x={90} y={44} width={30} height={32} fill={RES} /><rect x={30} y={50} width={20} height={26} fill={CU} /><rect x={70} y={50} width={20} height={26} fill={CU} /></>)}
        {cell(3, wa, <><rect x={30} y={50} width={20} height={30} fill={CU} /><rect x={70} y={50} width={20} height={30} fill={CU} /></>)}
        <Sep x={596} />
        <Row x={620} y={CT + 52} t="薄銅＝草稿" c={CUB} a={dr} />
        <Row x={620} y={CT + 112} t="只在線的地方鍍厚" c={CU} a={tk} />
        <Row x={620} y={CT + 172} t="多的薄銅洗掉" c={OK} a={wa} />
        <Row x={620} y={CT + 232} t="線才不會連在一起" c={H.text2} a={wa} />
      </svg>
    </Card>
  );
};

// ── abf-layers：一般處理器載板（少層、小）vs AI 晶片載板（十幾層、大）；膜用量跟著變多 ──
const Layers: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330, ai = on(f, T(o, "ai")), mn = on(f, T(o, "many")), tn = on(f, T(o, "ten"), 30), mo = on(f, T(o, "more"));
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        <Stack x={38} y={CT + 70} w={90} n={4} a={ai} />
        <text x={84} y={CT + 196} textAnchor="middle" style={zh(30, H.text2, 800)} opacity={0.4 + 0.6 * ai}>一般處理器</text>
        <g opacity={0.4 + 0.6 * tn}><Stack x={168} y={CT + 2} w={146} n={Math.max(4, Math.round(4 + 10 * tn))} a={1} /></g>
        <text x={241} y={CT + 250} textAnchor="middle" style={zh(30, H.amber, 900)} opacity={0.4 + 0.6 * tn}>AI 晶片</text>
        <Sep x={330} />
        <Row x={356} y={CT + 52} t="AI 晶片要拉出的線太多" c={BLUE} a={mn} />
        <Row x={356} y={CT + 112} t="載板疊到十幾層、面積更大" c={H.amber} a={tn} />
        <Row x={356} y={CT + 172} t="膜也越用越多" c={ORG} a={mo} />
        <text x={380} y={CT + 222} style={zh(30, H.text2, 700)} opacity={0.4 + 0.6 * tn}>（報導：AI 加速器 12～20 層）</text>
      </svg>
    </Card>
  );
};

// ── abf-aji：味之素（日本）——從做味精的化學研究延伸出來；1999 年推出（官方） ──
const Aji: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330, mk = on(f, T(o, "make")), jp = on(f, T(o, "jp")), aj = on(f, T(o, "aji")), ch = on(f, T(o, "chem"));
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        <FlagBox code="JP" x={30} y={CT + 26} a={Math.max(jp, aj)} /><NamePlate x={98} y={CT + 20} w={210} h={50} t="味之素" a={aj} px={32} />
        <g opacity={0.4 + 0.6 * ch}><rect x={40} y={CT + 110} width={70} height={90} rx={8} fill="#FFFFFF" stroke={H.text2} strokeWidth={3} /><rect x={52} y={CT + 96} width={46} height={16} fill={RED} />
          <path d={`M125 ${CT + 155} l40 0 m-12 -10 l12 10 l-12 10`} stroke={H.text2} strokeWidth={4} fill="none" />
          <rect x={180} y={CT + 130} width={120} height={14} fill="#9FD0EE" /><rect x={180} y={CT + 144} width={120} height={26} fill={ABF} stroke={H.text2} /><rect x={180} y={CT + 170} width={120} height={10} fill={PET} /></g>
        <Sep x={330} />
        <Row x={356} y={CT + 52} t="做這層膜的：味之素（日本）" c={H.amber} a={aj} />
        <Row x={356} y={CT + 112} t="本業：賣味精" c={H.text2} a={jp} />
        <Row x={356} y={CT + 172} t="從做味精的化學研究延伸" c={BLUE} a={ch} />
        <Row x={356} y={CT + 232} t="1999 年推出（官方）" c={H.text2} a={ch} />
      </svg>
    </Card>
  );
};

// ── abf-share：高階晶片用的增層膜，超過九成五來自味之素（報導）；台灣：晶化科技（自有增層膜，報導） ──
const Share: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 392, hi = on(f, T(o, "high")), sh = on(f, T(o, "share"), 30), aj = on(f, T(o, "aji")), jh = on(f, T(o, "jh")), ow = on(f, T(o, "own"));
  const cx = 130, cy = CT + 120, r = 92, ang = 2 * Math.PI * 0.95 * sh, x1 = cx + r * Math.sin(ang), y1 = cy - r * Math.cos(ang);
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        <circle cx={cx} cy={cy} r={r} fill="#E9EEF4" stroke={H.text2} strokeWidth={2} opacity={0.4 + 0.6 * hi} />
        {sh > 0.01 ? <path d={`M${cx} ${cy} L${cx} ${cy - r} A${r} ${r} 0 ${ang > Math.PI ? 1 : 0} 1 ${x1} ${y1} Z`} fill={H.amber} /> : null}
        <text x={cx} y={cy + r + 48} textAnchor="middle" style={zh(40, "#1F3A5F", 900)} opacity={0.4 + 0.6 * sh}>95%+</text>
        <Sep x={270} y2={380} />
        <FlagBox code="JP" x={296} y={CT + 26} a={aj} /><NamePlate x={364} y={CT + 20} w={200} h={50} t="味之素" a={aj} />
        <text x={584} y={CT + 56} style={zh(30, H.text2, 800)} opacity={0.4 + 0.6 * aj}>超過九成五（報導）</text>
        <FlagBox code="TW" x={296} y={CT + 122} a={jh} /><NamePlate x={364} y={CT + 116} w={200} h={50} t="晶化科技" a={jh} />
        <text x={584} y={CT + 152} style={zh(30, H.text2, 800)} opacity={0.4 + 0.6 * ow}>自有增層膜（報導）</text>
        <text x={296} y={CT + 236} style={zh(30, H.text2, 700)} opacity={0.4 + 0.6 * hi}>高階處理器、繪圖晶片載板用</text>
        <text x={296} y={CT + 286} style={zh(30, H.text2, 700)} opacity={0.4 + 0.6 * ow}>晶化產能與客戶：查不到</text>
      </svg>
    </Card>
  );
};

// ── abf-next：膜鋪好了 → 下一集：ABF 載板（大板一片多顆） ──
const Next: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330, dn = on(f, T(o, "done")), hw = on(f, T(o, "how")), nx = on(f, T(o, "next")), kw = on(f, T(o, "kw"));
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        <Stack x={40} y={CT + 20} w={230} n={4} a={dn} />
        <g opacity={0.4 + 0.6 * nx}><rect x={40} y={CT + 160} width={230} height={90} fill={SM} stroke={H.text2} strokeWidth={2} />
          {[0, 1, 2].map((i) => [0, 1].map((j) => <rect key={`${i}${j}`} x={54 + i * 74} y={CT + 170 + j * 40} width={60} height={32} fill="#3E8A5E" stroke={POW} strokeWidth={1.5} />))}</g>
        <Sep x={318} />
        <Row x={344} y={CT + 50} t="膜鋪好了" c={OK} a={dn} />
        <Row x={344} y={CT + 112} t="整塊載板怎麼做出來？" c={BLUE} a={hw} />
        <Row x={344} y={CT + 174} t="下一集：ABF 載板" c={H.amber} a={nx} />
        <Row x={344} y={CT + 236} t="留言「ABF」拿完整資料" c={H.text2} a={kw} />
      </svg>
    </Card>
  );
};

export const AbfSection: React.FC<P> = (p) => {
  const kd = String((p.o as any).kind);
  if (kd === "abf-hook") return <Hook {...p} />;
  if (kd === "abf-floor") return <Floor {...p} />;
  if (kd === "abf-lam") return <Lam {...p} />;
  if (kd === "abf-via") return <Via {...p} />;
  if (kd === "abf-sap") return <Sap {...p} />;
  if (kd === "abf-layers") return <Layers {...p} />;
  if (kd === "abf-aji") return <Aji {...p} />;
  if (kd === "abf-share") return <Share {...p} />;
  if (kd === "abf-next") return <Next {...p} />;
  return null;
};

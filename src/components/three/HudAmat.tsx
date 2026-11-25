// 2026/11/26 tech-amat：設備五大-2 應用材料（沉積、離子佈植）的 2D 示意卡（overlay `section` 的 kind 以 "amat-" 開頭，Hud.tsx 的 HudSection 轉過來）。
//   amat-hook 接上集：鋪膜 → 塗光阻 → 曝光，誰來鋪？｜amat-cluster 集群平台俯視（晶圓在腔間被搬、不出真空）｜amat-load 負載鎖抽真空（壓力條、燈號、閘門）｜
//   amat-move 手臂搬運的速度曲線（先加速再減速、停穩才放）｜amat-pvd 濺鍍側視（氬離子加速撞靶、原子散開落下、膜長厚）｜amat-mag 靶面俯視（偏心磁鐵轉、侵蝕環均勻變深）｜
//   amat-cvd 噴頭側視（簾幕狀噴下、近晶圓減速轉向、膜連續長厚）｜amat-ald 一圈四步（A→吹淨→B→吹淨，一圈一層）｜amat-imp 分析磁鐵俯視（輕的彎得多、重的彎得少、只有要的過縫）｜
//   amat-acc 加速管＋深度分佈（峰在表面底下）｜amat-co 公司（LOGO、國旗、財報、真實輪廓台灣地圖）｜amat-next 下一集
// 全部示意；結構一開始就畫出，念到時該處亮起、動起來；時間全部來自 script.json 的 t（cue）。物理：落下用重力加速（u²）、搬運用緩入緩出、加速管用越來越快。
// 排版原則（card-overlap.mjs 檢查）：內容從 CARD_CONTENT_TOP 以下；字不放進會動的圖形範圍；字 ≥30px；字不貼色條、不貼圖形（≥6px）。
import React from "react";
import { FONT_ZH } from "../../theme";
import { H, L, CARD_HEAD, CARD_CONTENT_TOP, cardTitleBox } from "./hudSkin";
import { EASE, tween } from "../anim";
import type { Model3D, Overlay3D, State3D } from "./engine";
import { Flag, LogoSvg, hasLogo, logoW } from "./Brand";

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
const RED = "#E0472F", OK = "#14A38B", BLUE = "#2F7FE0", WAF = "#B4C2DA", WAF_D = "#7F93B5", AR = "#8B5CF6", AR_L = "#C4B5FD", CU = "#D9894E", GA = "#F08A3C", GB = "#1FB5C9", PG = "#B8C2D0", STEEL = "#8E9BB0", YEL = "#F2B632", HEAT = "#E5484D";
const Sep: React.FC<{ x: number; y0?: number; y1?: number }> = ({ x, y0 = CT + 4, y1 = 316 }) => <line x1={x} y1={y0} x2={x} y2={y1} stroke={H.lineSoft} strokeWidth={3} />;
const Arrow: React.FC<{ x1: number; y1: number; x2: number; y2: number; c: string; w?: number; o?: number }> = ({ x1, y1, x2, y2, c, w = 5, o = 1 }) => {
  const a = Math.atan2(y2 - y1, x2 - x1), s = w * 2.6;
  return <g opacity={o}><path d={`M${x1} ${y1} L${x2 - Math.cos(a) * s * 0.8} ${y2 - Math.sin(a) * s * 0.8}`} stroke={c} strokeWidth={w} />
    <path d={`M${x2} ${y2} L${x2 - Math.cos(a) * s - Math.sin(a) * s * 0.6} ${y2 - Math.sin(a) * s + Math.cos(a) * s * 0.6} L${x2 - Math.cos(a) * s + Math.sin(a) * s * 0.6} ${y2 - Math.sin(a) * s - Math.cos(a) * s * 0.6} Z`} fill={c} /></g>;
};
const Check: React.FC<{ x: number; y: number; o?: number }> = ({ x, y, o = 1 }) => <path opacity={o} d={`M${x - 18} ${y} l12 12 l26 -28`} stroke={OK} strokeWidth={7} fill="none" />;
const Row: React.FC<{ x: number; y: number; t: string; c: string; a: number; px?: number }> = ({ x, y, t, c, a, px = 32 }) => (
  <g opacity={0.35 + 0.65 * a}><rect x={x} y={y - px * 0.72} width={12} height={px * 0.72} fill={c} /><text x={x + 24} y={y} style={zh(px, H.text, 900)}>{t}</text></g>
);
const LogoBox: React.FC<{ id: string; x: number; y: number; h: number; a: number; maxW?: number }> = ({ id, x, y, h, a, maxW = 260 }) => {
  if (!hasLogo(id)) return null;
  const lw = Math.min(maxW, logoW(id, h)), lh = (h * lw) / logoW(id, h);
  return <g><rect x={x} y={y} width={lw + 16} height={h + 12} fill="#FFFFFF" stroke={a > 0.5 ? H.amber : H.lineSoft} strokeWidth={a > 0.5 ? 4 : 1.5} />
    <LogoSvg id={id} x={x + 8} y={y + 6 + (h - lh) / 2} h={lh} /></g>;
};
const FlagBox: React.FC<{ code: string; x: number; y: number; a: number }> = ({ code, x, y, a }) => (
  <g><rect x={x} y={y} width={50} height={36} fill="none" stroke={a > 0.5 ? H.amber : H.lineSoft} strokeWidth={a > 0.5 ? 4 : 1.5} /><Flag code={code} h={28} x={x + 4} y={y + 4} asSvg /></g>
);
/** 固定亂數（同一個 i 永遠同一個值） */
const rnd = (i: number) => fr(Math.sin(i * 12.9898 + 4.1) * 43758.5453);
const ease = (u: number) => EASE.move(cl(u));

// ── amat-hook：上集鏈條「鋪薄膜 → 塗光阻 → 曝光」，鋪薄膜那格打問號；右：誰來鋪？→ 應用材料（LOGO＋美國國旗） ──
const Hook: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330;
  const pv = on(f, T(o, "prev")), who = on(f, T(o, "who")), am = on(f, T(o, "amat"));
  const box = (x: number, t: string, hi: boolean) => (
    <g><rect x={x} y={CT + 70} width={118} height={74} fill={hi ? "#FFF4DA" : "#FFFFFF"} stroke={hi ? H.amber : H.lineSoft} strokeWidth={hi ? 4 : 2} />
      <text x={x + 59} y={CT + 118} textAnchor="middle" style={zh(30, H.text, 900)}>{t}</text></g>);
  const q = 1 + 0.12 * Math.sin(f * 0.3) * who;
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        <g opacity={0.45 + 0.55 * pv}>
          {box(24, "鋪薄膜", true)}<Arrow x1={146} y1={CT + 107} x2={172} y2={CT + 107} c={H.text2} w={4} />
          {box(176, "塗光阻", false)}<Arrow x1={298} y1={CT + 107} x2={324} y2={CT + 107} c={H.text2} w={4} />
          {box(328, "曝光", false)}
        </g>
        <g transform={`translate(83 ${CT + 214}) scale(${q})`} opacity={0.3 + 0.7 * who}><circle r={34} fill={H.amber} /><text y={16} textAnchor="middle" style={zh(46, onC(H.amber), 900)}>?</text></g>
        <text x={136} y={CT + 226} style={zh(30, H.text2, 800)}>上集：曝光前要先鋪</text>
        <Sep x={470} />
        <text x={500} y={CT + 52} style={zh(40, H.text, 900)} opacity={0.35 + 0.65 * who}>誰來鋪薄膜？</text>
        <LogoBox id="amat" x={500} y={CT + 92} h={70} a={am} maxW={300} />
        <g opacity={0.35 + 0.65 * am}><FlagBox code="US" x={500} y={CT + 196} a={am} /><text x={566} y={CT + 226} style={zh(32, H.text, 900)}>美國・應用材料</text></g>
      </svg>
    </Card>
  );
};

// ── amat-cluster：俯視八角傳送腔＋一圈腔體；晶圓（藍點）由負載鎖被搬進腔、再換腔，路徑都在真空範圍（淡紫底）裡 ──
const Cluster: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330;
  const mid = on(f, T(o, "mid")), ring = on(f, T(o, "ring")), many = on(f, T(o, "many")), vac = on(f, T(o, "vac"));
  const cx = 200, cy = CT + 152, ap = 46, oct = Array.from({ length: 8 }, (_, i) => { const t = (i * Math.PI) / 4; return `${cx + (ap / Math.cos(Math.PI / 8)) * Math.cos(t)},${cy + (ap / Math.cos(Math.PI / 8)) * Math.sin(t)}`; }).join(" ");
  const fac = (deg: number, r: number) => [cx + r * Math.cos((deg * Math.PI) / 180), cy + r * Math.sin((deg * Math.PI) / 180)];
  const ch: [number, string][] = [[-22.5, CU], [-67.5, GA], [-112.5, GB], [-157.5, STEEL], [22.5, STEEL], [157.5, STEEL]];
  // 晶圓：負載鎖（112.5°）→ 中心 → 第一腔（-22.5°）→ 中心 → 第二腔（-67.5°）；每段緩入緩出
  const stops = [112.5, null, -22.5, null, -67.5, null, -112.5];
  const t0 = T(o, "mid"), seg = 22, n = Math.max(0, f - t0) / seg, i = Math.min(stops.length - 2, Math.floor(n)), u = ease(n - i);
  const P0 = stops[i] === null ? [cx, cy] : fac(stops[i] as number, 98), P1 = stops[i + 1] === null ? [cx, cy] : fac(stops[i + 1] as number, 98);
  const wx = P0[0] + (P1[0] - P0[0]) * u, wy = P0[1] + (P1[1] - P0[1]) * u;
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        <circle cx={cx} cy={cy} r={138} fill={AR_L} opacity={0.12 + 0.2 * vac} />
        {ch.map(([d, c], j) => { const [x, y] = fac(d, 98), a = d > -170 && d < 0 ? Math.max(ring, many) : ring * 0.7;
          return <g key={j} opacity={0.4 + 0.6 * a}><circle cx={x} cy={y} r={d === 22.5 || d === 157.5 ? 24 : 32} fill="#FFFFFF" stroke={c} strokeWidth={5} /></g>; })}
        {[67.5, 112.5].map((d) => { const [x, y] = fac(d, 92); return <rect key={d} x={x - 24} y={y - 20} width={48} height={40} fill="#FFFFFF" stroke={YEL} strokeWidth={4} transform={`rotate(${d - 90} ${x} ${y})`} opacity={0.5 + 0.5 * mid} />; })}
        <polygon points={oct} fill="#E7ECF5" stroke={BLUE} strokeWidth={4} opacity={0.4 + 0.6 * mid} />
        <circle cx={wx} cy={wy} r={12} fill={BLUE} stroke="#FFFFFF" strokeWidth={3} opacity={f >= t0 ? 1 : 0.3} />
        <Sep x={420} />
        <Row x={446} y={CT + 44} t="中間：真空傳送腔" c={BLUE} a={mid} />
        <Row x={446} y={CT + 108} t="四周：一圈製程腔" c={CU} a={ring} />
        <Row x={446} y={CT + 172} t="每個腔鋪不同的膜" c={GA} a={many} />
        <g opacity={0.35 + 0.65 * vac}><Check x={470} y={CT + 230} o={vac} /><text x={510} y={CT + 244} style={zh(32, H.text, 900)}>全程不出真空</text></g>
      </svg>
    </Card>
  );
};

// ── amat-load：負載鎖：門關上 → 抽氣（壓力條往下、黃燈閃）→ 綠燈 → 內側閘門往下滑開 ──
const Load: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330;
  const fo = on(f, T(o, "foup")), ll = on(f, T(o, "ll")), va = T(o, "vac"), ga = T(o, "gate");
  const pump = cl((f - va) / Math.max(10, ga - va)), p = 1 - Math.pow(pump, 0.55);   // 抽氣：一開始掉得快、後面慢（示意）
  const green = f >= ga - 6, open = ease((f - ga + 4) / 10);
  const blink = !green && f >= va ? (Math.sin(f * 0.5) > 0 ? 1 : 0.35) : 0.35;
  const dots = Array.from({ length: 14 }, (_, i) => i).filter((i) => rnd(i) < p + 0.05);
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        <rect x={40} y={CT + 20} width={210} height={132} fill="#F4F6FA" stroke={STEEL} strokeWidth={5} />
        <rect x={34} y={CT + 30} width={10} height={112} fill={H.text2} opacity={0.4 + 0.6 * ll} />
        <rect x={246} y={CT + 30 + 112 * open} width={10} height={112 * (1 - open)} fill={H.text2} />
        <rect x={90} y={CT + 112} width={110} height={8} fill={BLUE} opacity={0.4 + 0.6 * fo} />
        {dots.map((i) => <circle key={i} cx={56 + rnd(i + 30) * 178 + 6 * Math.sin(f * 0.2 + i)} cy={CT + 34 + rnd(i + 60) * 60 + 5 * Math.cos(f * 0.17 + i)} r={5} fill={PG} />)}
        <circle cx={56} cy={CT + 186} r={12} fill={YEL} opacity={green ? 0.25 : blink} /><circle cx={94} cy={CT + 186} r={12} fill={OK} opacity={green ? 1 : 0.2} />
        <text x={118} y={CT + 197} style={zh(30, H.text2, 800)}>燈號</text>
        <text x={40} y={CT + 250} style={zh(30, H.text2, 800)}>左門通大氣，右門通真空</text>
        <Sep x={470} />
        <text x={500} y={CT + 40} style={zh(30, H.text2, 800)}>腔內壓力（示意）</text>
        <rect x={500} y={CT + 56} width={400} height={30} fill="none" stroke={H.lineSoft} strokeWidth={2} />
        <rect x={502} y={CT + 58} width={396 * p} height={26} fill={green ? OK : YEL} />
        <Row x={500} y={CT + 140} t="① 晶圓盒 → 負載鎖" c={BLUE} a={fo} />
        <Row x={500} y={CT + 196} t="② 關門、抽真空" c={YEL} a={f >= va ? 1 : 0} />
        <Row x={500} y={CT + 252} t="③ 綠燈，閘門才開" c={OK} a={green ? 1 : 0} />
      </svg>
    </Card>
  );
};

// ── amat-move：手臂一次搬運的速度曲線：0 → 加速 → 最快 → 減速 → 0（停穩）→ 才放；圓點跟著時間走 ──
const Move: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330;
  const tk = on(f, T(o, "take")), tu = on(f, T(o, "turn")), ac = on(f, T(o, "acc")), st = on(f, T(o, "stop")), pt = on(f, T(o, "put"));
  const x0 = 44, x1 = 404, yb = CT + 200, hA = 150;
  const v = (u: number) => Math.sin(Math.PI * u) ** 2;   // 緩入緩出位移的速度（兩端 0）
  const path = Array.from({ length: 41 }, (_, i) => { const u = i / 40; return `${i ? "L" : "M"}${x0 + (x1 - x0) * u} ${yb - hA * v(u)}`; }).join(" ");
  const a0 = T(o, "turn"), a1 = T(o, "stop"), u = cl((f - a0) / Math.max(10, a1 - a0));
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        <line x1={x0} y1={yb} x2={x1 + 10} y2={yb} stroke={H.text2} strokeWidth={3} />
        <line x1={x0} y1={yb} x2={x0} y2={yb - hA - 14} stroke={H.text2} strokeWidth={3} />
        <path d={path} stroke={BLUE} strokeWidth={5} fill="none" opacity={0.4 + 0.6 * tu} />
        <circle cx={x0 + (x1 - x0) * u} cy={yb - hA * v(u)} r={12} fill={H.amber} stroke="#FFFFFF" strokeWidth={3} opacity={f >= a0 ? 1 : 0.3} />
        <text x={x0 + 10} y={yb + 44} style={zh(30, H.text2, 800)} opacity={0.4 + 0.6 * ac}>加速</text>
        <text x={x1 - 76} y={yb + 44} style={zh(30, H.text2, 800)} opacity={0.4 + 0.6 * ac}>減速</text>
        <text x={x0 + 140} y={yb + 44} style={zh(30, H.text2, 800)}>時間 →</text>
        <Sep x={470} />
        <Row x={500} y={CT + 44} t="伸進去、抬起取片" c={BLUE} a={tk} />
        <Row x={500} y={CT + 104} t="縮回、轉向" c={BLUE} a={tu} />
        <Row x={500} y={CT + 164} t="先加速、再減速" c={H.amber} a={ac} />
        <Row x={500} y={CT + 224} t="停穩才放到升降銷" c={OK} a={Math.max(st, pt)} />
      </svg>
    </Card>
  );
};

// ── amat-pvd：濺鍍側視：上面銅靶、靶下淡紫電漿帶；氬離子往上越飛越快撞靶 → 銅原子散開往下（比離子慢）→ 晶圓上的膜一點一點長厚 ──
const Pvd: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330;
  const ar = on(f, T(o, "ar")), tg = on(f, T(o, "tgt")), at = on(f, T(o, "atom")), ld = T(o, "land");
  const tY = CT + 30, gY = CT + 62, wY = CT + 236, film = cl((f - ld + 20) / 90);
  const ions = Array.from({ length: 6 }, (_, i) => { const u = fr(f / 26 + i / 6); return { x: 70 + i * 58, y: gY + 34 - 42 * u * u }; });
  const atoms = Array.from({ length: 12 }, (_, i) => { const u = fr(f / 52 + i / 12), x0 = 70 + rnd(i) * 300, x1 = x0 + (rnd(i + 9) - 0.5) * 120; return { x: x0 + (x1 - x0) * u, y: tY + 18 + (wY - tY - 22) * u }; });
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        <rect x={40} y={tY - 6} width={360} height={22} fill={CU} stroke="#A85A26" strokeWidth={2} opacity={0.5 + 0.5 * tg} />
        <rect x={40} y={gY - 10} width={360} height={46} fill={AR_L} opacity={(0.25 + 0.15 * Math.sin(f * 0.27)) * (0.4 + 0.6 * ar)} />
        {ions.map((p, i) => <circle key={i} cx={p.x} cy={p.y} r={6} fill={AR} opacity={0.3 + 0.7 * ar} />)}
        {atoms.map((p, i) => <circle key={i} cx={p.x} cy={p.y} r={5} fill={CU} opacity={at} />)}
        <rect x={60} y={wY + 4} width={320} height={16} fill={WAF} stroke={WAF_D} strokeWidth={2} />
        <rect x={60} y={wY + 4 - 14 * film} width={320} height={14 * film} fill={CU} />
        <Sep x={440} />
        <Row x={470} y={CT + 44} t="氬離子被拉向靶，越飛越快" c={AR} a={ar} px={30} />
        <Row x={470} y={CT + 104} t="撞出銅原子，往下散開" c={CU} a={at} px={30} />
        <Row x={470} y={CT + 164} t="落到晶圓，膜慢慢變厚" c={BLUE} a={film > 0 ? 1 : 0} px={30} />
        <text x={470} y={CT + 236} style={zh(30, H.text2, 800)}>腔內壓力約 1–10 毫托（示意）</text>
      </svg>
    </Card>
  );
};

// ── amat-mag：靶面俯視：偏心磁鐵組（紅 N 外圈、藍 S 內圈）繞中心轉，電漿亮帶跟著轉；侵蝕環慢慢變深而且是一整圈（均勻） ──
const Mag: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330;
  const mg = on(f, T(o, "mag")), tr = on(f, T(o, "trap")), ea = T(o, "eat");
  const cx = 200, cy = CT + 128, R = 118, spin = Math.max(0, f - T(o, "mag") + 20), ang = (spin * spin) / (spin + 30) * 0.16;   // 起轉慢、之後等速
  const ero = cl((f - T(o, "mag")) / 120);
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        <circle cx={cx} cy={cy} r={R} fill={CU} stroke="#A85A26" strokeWidth={3} />
        <circle cx={cx} cy={cy} r={82} fill="none" stroke="#5B3216" strokeWidth={22} opacity={0.12 + 0.6 * ero} />
        <g transform={`rotate(${(ang * 180) / Math.PI} ${cx} ${cy})`} opacity={0.4 + 0.6 * mg}>
          <circle cx={cx + 40} cy={cy} r={60} fill="none" stroke={RED} strokeWidth={12} />
          <circle cx={cx + 40} cy={cy} r={22} fill={BLUE} />
          <circle cx={cx + 40} cy={cy} r={42} fill="none" stroke={AR_L} strokeWidth={14} opacity={(0.5 + 0.3 * Math.sin(f * 0.3)) * (0.3 + 0.7 * tr)} />
        </g>
        <Sep x={440} />
        <Row x={470} y={CT + 44} t="磁鐵偏心，一直轉" c={RED} a={mg} />
        <Row x={470} y={CT + 108} t="電漿被困在靶面" c={AR} a={tr} />
        <Row x={470} y={CT + 172} t="轉一圈圈，吃得均勻" c={CU} a={on(f, ea)} />
        <text x={470} y={CT + 240} style={zh(30, H.text2, 800)}>深色環＝被吃掉的跑道</text>
      </svg>
    </Card>
  );
};

// ── amat-cvd：噴頭側視：孔陣均勻噴下（簾幕）、近晶圓減速轉向往兩側抽走；下面加熱基座暗紅；膜連續長厚 ──
const Cvd: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330;
  const cv = on(f, T(o, "cvd")), sh = on(f, T(o, "sh")), ev = on(f, T(o, "even")), fl = T(o, "film");
  const sY = CT + 30, wY = CT + 196, film = cl((f - fl + 10) / 80);
  const holes = Array.from({ length: 15 }, (_, i) => 62 + i * 22);
  const gas = holes.flatMap((x, i) => [0, 1].map((j) => {
    const u = fr(f / 40 + j / 2 + rnd(i) * 0.5), down = Math.min(1, u / 0.7), side = Math.max(0, (u - 0.7) / 0.3), dir = x < 220 ? -1 : 1;
    const y = sY + 14 + (wY - sY - 30) * (1 - (1 - down) ** 2), xx = x + dir * 70 * side * side;   // 往下：先快後慢（近晶圓減速）；之後側流
    return { x: xx, y: y - 6 * side, c: (i + j) % 2 ? GA : GB, o: 1 - side * 0.7 };
  }));
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        <rect x={50} y={sY - 4} width={340} height={16} fill={STEEL} opacity={0.5 + 0.5 * sh} />
        {holes.map((x) => <rect key={x} x={x - 3} y={sY + 8} width={6} height={6} fill="#2B3445" />)}
        {gas.map((g, i) => <circle key={i} cx={g.x} cy={g.y} r={4.5} fill={g.c} opacity={g.o * (0.2 + 0.8 * ev)} />)}
        <rect x={70} y={wY} width={300} height={12} fill={WAF} stroke={WAF_D} strokeWidth={2} />
        <rect x={70} y={wY - 12 * film} width={300} height={12 * film} fill="#E3A63A" />
        <rect x={60} y={wY + 14} width={320} height={28} fill={STEEL} />
        <rect x={80} y={wY + 24} width={280} height={8} fill={HEAT} opacity={0.45 + 0.25 * Math.sin(f * 0.15)} />
        <Sep x={440} />
        <Row x={470} y={CT + 44} t="氣體從噴頭小孔噴下" c={GA} a={Math.max(cv, sh)} px={30} />
        <Row x={470} y={CT + 104} t="整片均勻，像一層簾幕" c={GB} a={ev} px={30} />
        <Row x={470} y={CT + 164} t="在加熱的晶圓上反應" c={HEAT} a={film > 0 ? 1 : 0} px={30} />
        <Row x={470} y={CT + 224} t="膜連續長厚" c="#E3A63A" a={film > 0.3 ? 1 : 0} px={30} />
      </svg>
    </Card>
  );
};

// ── amat-ald：一圈四步：① A 進來貼滿一層 → ② 吹淨 → ③ B 進來反應 → ④ 吹淨；每圈膜多一層（右邊數圈數） ──
const Ald: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330;
  const al = on(f, T(o, "ald")), tu = T(o, "turns"), cyStarts = [tu + 4, T(o, "cycle") + 4, T(o, "one") + 2, T(o, "one") + 30];
  let ci = -1; cyStarts.forEach((c, i) => { if (f >= c) ci = i; });
  const ph = ci < 0 ? -1 : f - cyStarts[ci], step = ph < 0 ? -1 : ph < 12 ? 0 : ph < 20 ? 1 : ph < 32 ? 2 : ph < 40 ? 3 : 4;
  const layers = Math.max(0, ci + (step >= 4 ? 1 : 0)) + (ci >= 0 && step === 4 ? 0 : 0);
  const wY = CT + 196, x0 = 50, w = 320;
  const gasC = step === 0 ? GA : step === 2 ? GB : PG;
  const dots = step >= 0 && step < 4 ? Array.from({ length: 16 }, (_, i) => ({ x: x0 + 10 + rnd(i) * (w - 20), y: CT + 20 + fr(rnd(i + 3) + f / 30) * (wY - CT - 70) })) : [];
  const steps = ["① 氣體 A：貼滿一層就停", "② 吹淨：多的抽走", "③ 氣體 B：和那層反應", "④ 吹淨：完成一圈"];
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        {dots.map((d, i) => <circle key={i} cx={d.x} cy={d.y} r={5} fill={gasC} />)}
        <rect x={x0} y={wY} width={w} height={14} fill={WAF} stroke={WAF_D} strokeWidth={2} />
        {Array.from({ length: layers }, (_, i) => <rect key={i} x={x0} y={wY - 8 * (i + 1)} width={w} height={7} fill="#2BA39A" />)}
        {step === 0 || step === 1 ? <g>{Array.from({ length: 20 }, (_, i) => <circle key={i} cx={x0 + 8 + i * 16} cy={wY - 8 * layers - 5} r={4} fill={GA} opacity={step === 0 ? cl(ph / 10) : 1} />)}</g> : null}
        <text x={x0} y={CT + 252} style={zh(30, H.text2, 800)}>已長 {layers} 層（實際數百圈）</text>
        <Sep x={440} />
        {steps.map((t, i) => <g key={i} opacity={step === i ? 1 : 0.35 + 0.15 * al}><rect x={470} y={CT + 22 + i * 58} width={12} height={24} fill={step === i ? H.amber : H.lineSoft} />
          <text x={494} y={CT + 44 + i * 58} style={zh(30, H.text, 900)}>{t}</text></g>)}
      </svg>
    </Card>
  );
};

// ── amat-imp：分析磁鐵俯視：混合離子從左下往上進來，在磁鐵裡轉彎；輕的（綠）半徑小撞內牆、重的（粉）半徑大撞外牆、要的（藍）剛好過縫 ──
const Imp: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330;
  const im = on(f, T(o, "imp")), sr = on(f, T(o, "src")), mg = on(f, T(o, "mag")), pk = on(f, T(o, "pick"));
  const sx = 80, sy = CT + 244, Rm = 100, cx0 = sx + Rm, cy0 = CT + 160;   // 入口 (sx, cy0) 往上，弧心在右
  const arcPt = (r: number, u: number, endDeg: number) => { const t = Math.PI - u * (Math.PI - (endDeg * Math.PI) / 180); return [sx + r + r * Math.cos(t), cy0 - r * Math.sin(t)]; };
  const streams: [number, number, string, number][] = [[Rm, 90, BLUE, 7], [56, 62, "#7CB518", 5], [160, 116, "#E0559B", 9]];
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        <rect x={sx - 22} y={sy - 10} width={44} height={44} fill={AR_L} stroke={AR} strokeWidth={3} opacity={0.4 + 0.6 * sr} />
        <path d={`M${sx - 40} ${cy0} A ${Rm + 40} ${Rm + 40} 0 0 1 ${cx0} ${cy0 - Rm - 40} L ${cx0} ${cy0 - Rm + 40} A ${Rm - 40} ${Rm - 40} 0 0 0 ${sx + 40} ${cy0} Z`} fill="#F6E4CF" stroke="#C47A2C" strokeWidth={4} opacity={0.5 + 0.5 * mg} />
        <rect x={cx0 + 40} y={cy0 - Rm - 30} width={10} height={20} fill="#2B3445" /><rect x={cx0 + 40} y={cy0 - Rm + 10} width={10} height={20} fill="#2B3445" />
        {streams.map(([r, end, c, rr], j) => Array.from({ length: 5 }, (_, i) => {
          const u = fr(f / 46 + i / 5 + j * 0.13), tot = 0.25;
          let x, y; if (u < tot) { x = sx; y = sy - (sy - cy0) * (u / tot); } else { const v = (u - tot) / (1 - tot); [x, y] = arcPt(r, v, end); if (j === 0 && v > 0.98) { x += 0; } }
          return <circle key={`${j}-${i}`} cx={x} cy={y} r={rr} fill={c} opacity={(0.3 + 0.7 * mg) * (j === 0 ? 1 : 0.85)} />;
        }))}
        <Arrow x1={cx0 + 54} y1={cy0 - Rm} x2={cx0 + 110} y2={cy0 - Rm} c={BLUE} o={0.3 + 0.7 * pk} />
        <Sep x={440} />
        <Row x={470} y={CT + 44} t="離子源：氣體打成離子" c={AR} a={Math.max(im, sr)} px={30} />
        <Row x={470} y={CT + 104} t="輕的彎得多，撞內牆" c="#7CB518" a={mg} px={30} />
        <Row x={470} y={CT + 164} t="重的彎得少，撞外牆" c="#E0559B" a={mg} px={30} />
        <Row x={470} y={CT + 224} t="只有要的那種過縫" c={BLUE} a={pk} px={30} />
      </svg>
    </Card>
  );
};

// ── amat-acc：左：加速管（離子一環比一環快、拖尾變長）｜右：打進晶圓後的分佈（峰在表面底下，鐘形） ──
const Acc: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330;
  const ac = on(f, T(o, "acc")), ht = on(f, T(o, "hit")), cd = on(f, T(o, "cond"));
  const y = CT + 86, x0 = 40, x1 = 400;
  const ions = Array.from({ length: 5 }, (_, i) => { const u = fr(f / 30 + i / 5); return { x: x0 + (x1 - x0) * u * u, tail: 8 + 50 * u }; });
  const sx = 520, sY = CT + 60, depth = 200, peak = 0.38;
  const prof = Array.from({ length: 41 }, (_, i) => { const d = i / 40, c = Math.exp(-((d - peak) ** 2) / 0.02); return `${i ? "L" : "M"}${sx + 300 * c * ht} ${sY + depth * d}`; }).join(" ");
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        {Array.from({ length: 8 }, (_, i) => <rect key={i} x={x0 + 14 + i * 46} y={y - 30} width={14} height={60} fill={STEEL} opacity={0.5 + 0.5 * ac} />)}
        {ions.map((p, i) => <g key={i} opacity={0.3 + 0.7 * ac}><rect x={p.x - p.tail} y={y - 3} width={p.tail} height={6} fill={BLUE} opacity={0.4} /><circle cx={p.x} cy={y} r={7} fill={BLUE} /></g>)}
        <text x={x0} y={CT + 156} style={zh(30, H.text2, 800)}>加速管：一環比一環快</text>
        <text x={x0} y={CT + 204} style={zh(32, H.text, 900)} opacity={0.35 + 0.65 * cd}>打進去的地方</text>
        <text x={x0} y={CT + 246} style={zh(32, H.text, 900)} opacity={0.35 + 0.65 * cd}>導電性改變</text>
        <Sep x={440} />
        <line x1={sx - 10} y1={sY} x2={W - 30} y2={sY} stroke={H.text} strokeWidth={4} />
        <text x={sx + 210} y={sY - 14} style={zh(30, H.text2, 800)}>表面</text>
        <rect x={sx} y={sY} width={W - 30 - sx} height={depth} fill={WAF} opacity={0.25} />
        <path d={prof} stroke={BLUE} strokeWidth={5} fill="none" />
        <line x1={sx} y1={sY + depth * peak} x2={sx + 300 * ht} y2={sY + depth * peak} stroke={H.amber} strokeWidth={3} strokeDasharray="8 6" opacity={ht} />
        <text x={sx + 200} y={sY + depth * peak + 70} style={zh(30, H.text2, 800)} opacity={ht}>濃度峰在底下</text>
      </svg>
    </Card>
  );
};

// ── amat-co：公司：LOGO＋美國國旗｜全球第二大設備商（研究機構）｜最新財年營收（公司財報）｜台灣：真實輪廓地圖（新竹總部、湖口研究中心）＋京鼎（媒體報導） ──
const TW_PATH = "M180.3 82.0 L192.0 91.6 L202.6 99.9 L207.3 100.6 L197.3 110.2 L199.1 127.4 L195.6 136.4 L185.0 166.5 L179.1 190.8 L170.9 222.8 L157.4 245.2 L142.8 271.4 L139.9 299.6 L132.8 297.7 L125.2 270.2 L116.4 263.8 L105.8 253.5 L98.8 229.8 L94.7 219.6 L98.8 204.9 L101.7 179.3 L113.5 162.0 L119.3 147.9 L129.3 133.2 L144.0 112.7 L153.3 99.3 L172.1 89.7Z";
// 投影同 HudAsml／HudTrk：x＝180.3＋(經度−121.54)×58.6、y＝82＋(25.30−緯度)×64
const geo = (lat: number, lon: number) => [180.3 + (lon - 121.54) * 58.6, 82 + (25.30 - lat) * 64];
const Co: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 360;
  const us = on(f, T(o, "us")), n2 = on(f, T(o, "no2")), tw = on(f, T(o, "tw"));
  const S = 1.05, OX = 470, OY = 0, pt = (la: number, lo: number) => { const [x, y] = geo(la, lo); return [OX + x * S, OY + y * S]; };
  const [hx, hy] = pt(24.78, 121.0), [kx, ky] = pt(24.90, 121.04);
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        <LogoBox id="amat" x={28} y={CT + 8} h={50} a={us} maxW={210} />
        <FlagBox code="US" x={272} y={CT + 16} a={us} /><text x={334} y={CT + 46} style={zh(32, H.text, 900)} opacity={0.4 + 0.6 * us}>美國</text>
        <g opacity={0.35 + 0.65 * n2}><text x={28} y={CT + 116} style={zh(30, H.text2, 800)}>全球半導體設備商</text>
          <text x={28} y={CT + 170} style={zh(46, H.amber, 900)}>第 2 大</text><text x={190} y={CT + 166} style={zh(30, H.text2, 800)}>（研究機構）</text>
          <text x={28} y={CT + 222} style={zh(30, H.text2, 800)}>最新財年營收（公司財報）</text>
          <text x={28} y={CT + 270} style={zh(40, H.text, 900)}>約 345 億美元</text></g>
        <Sep x={500} y1={346} />
        <path d={TW_PATH} transform={`translate(${OX} ${OY}) scale(${S})`} fill={OK} opacity={0.3 + 0.35 * tw} stroke={OK} strokeWidth={3 / S} strokeLinejoin="round" />
        <circle cx={hx} cy={hy} r={9 * (1 + 0.2 * Math.sin(f * 0.25) * tw)} fill={H.amber} opacity={0.4 + 0.6 * tw} />
        <circle cx={kx} cy={ky} r={7} fill={BLUE} opacity={0.4 + 0.6 * tw} />
        <line x1={hx + 10} y1={hy + 4} x2={704} y2={CT + 150} stroke={H.text2} strokeWidth={2} opacity={0.4 + 0.6 * tw} />
        <line x1={kx + 8} y1={ky - 4} x2={704} y2={CT + 70} stroke={H.text2} strokeWidth={2} opacity={0.4 + 0.6 * tw} />
        <g opacity={0.4 + 0.6 * tw}><FlagBox code="TW" x={526} y={CT + 220} a={tw} />
          <text x={712} y={CT + 80} style={zh(30, H.text, 900)}>湖口：研究中心</text>
          <text x={712} y={CT + 160} style={zh(30, H.text, 900)}>新竹：台灣總部</text>
          <text x={712} y={CT + 226} style={zh(30, H.text2, 800)}>京鼎：模組代工</text>
          <text x={712} y={CT + 266} style={zh(30, H.text2, 800)}>（媒體報導）</text></g>
      </svg>
    </Card>
  );
};

// ── amat-next：鋪膜 ✓ → 曝光 ✓ → 蝕刻（下一集）；美國國旗＋科林研發；留言關鍵字 ──
const Next: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330;
  const fm = on(f, T(o, "film")), et = on(f, T(o, "etch")), nx = on(f, T(o, "next")), kw = on(f, T(o, "kw"));
  const cut = ease((f - T(o, "etch")) / 18);
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        <rect x={40} y={CT + 150} width={320} height={22} fill={WAF} stroke={WAF_D} strokeWidth={2} />
        <rect x={40} y={CT + 130} width={320} height={20} fill={CU} opacity={0.4 + 0.6 * fm} />
        {[0, 1, 2, 3].map((i) => <rect key={i} x={60 + i * 80} y={CT + 104} width={40} height={26} fill={AR} opacity={0.4 + 0.6 * fm} />)}
        {[0, 1, 2].map((i) => <rect key={i} x={100 + i * 80} y={CT + 130} width={40} height={20 * cut} fill="#FFFFFF" />)}
        <text x={40} y={CT + 226} style={zh(30, H.text2, 800)}>鋪膜 → 照圖 → 刻掉多的</text>
        <Sep x={440} />
        <g opacity={0.35 + 0.65 * Math.max(et, nx)}><FlagBox code="US" x={470} y={CT + 22} a={nx} /><text x={536} y={CT + 52} style={zh(32, H.text, 900)}>美國</text>
          <text x={470} y={CT + 124} style={zh(48, H.text, 900)}>科林研發</text><text x={470} y={CT + 170} style={zh(30, H.text2, 800)}>下一集：設備五大-3・蝕刻</text></g>
        <g opacity={kw} transform={`translate(${W / 2 + 220} 290) rotate(-2) scale(${1 + 0.3 * (1 - kw)})`}>
          <rect x={-200} y={-30} width={400} height={60} fill={H.amber} /><text x={0} y={12} textAnchor="middle" style={zh(34, onC(H.amber), 900)}>留言「應材」拿資料</text>
        </g>
      </svg>
    </Card>
  );
};

export const AmatSection: React.FC<P> = (p) => {
  const kd = String((p.o as any).kind);
  if (kd === "amat-hook") return <Hook {...p} />;
  if (kd === "amat-cluster") return <Cluster {...p} />;
  if (kd === "amat-load") return <Load {...p} />;
  if (kd === "amat-move") return <Move {...p} />;
  if (kd === "amat-pvd") return <Pvd {...p} />;
  if (kd === "amat-mag") return <Mag {...p} />;
  if (kd === "amat-cvd") return <Cvd {...p} />;
  if (kd === "amat-ald") return <Ald {...p} />;
  if (kd === "amat-imp") return <Imp {...p} />;
  if (kd === "amat-acc") return <Acc {...p} />;
  if (kd === "amat-co") return <Co {...p} />;
  if (kd === "amat-next") return <Next {...p} />;
  return null;
};

// 2026/11/24 tech-resist2：光阻-2（塗佈顯影機）的 2D 示意卡（overlay `section` 的 kind 以 "trk-" 開頭，Hud.tsx 的 HudSection 轉過來）。
//   trk-hook 光阻誰塗的＋塗佈顯影機黏著曝光機｜trk-flow 晶圓在裡面走一圈｜trk-coat 旋轉塗佈側視｜trk-thick 轉速–膜厚曲線＋EUV 光阻幾十奈米｜
//   trk-sb 軟烤趕溶劑｜trk-exp 曝光留下潛像｜trk-peb 曝後烤反應走完｜trk-dev 顯影→沖水→甩乾→烤硬｜trk-wait 馬上烤 vs 等太久（頂端走樣）｜
//   trk-co 誰在做（公司說法＋兩份估計）｜trk-tw 在台灣（台南營運中心）｜trk-next 下一集＋留言
// 全部示意；結構一開始就畫出（不留空框），念到時該處亮起、動起來；時間全部來自 script.json 的 t（cue）。
// 排版原則（card-overlap.mjs 檢查）：內容從 CARD_CONTENT_TOP 以下；字不放進會動的圖形範圍；欄間 ≥24px；分隔線不穿字；字 ≥30px；字不貼色條、不貼圖形（≥6px）。
import React from "react";
import { FONT_ZH } from "../../theme";
import { H, L, sm, CARD_HEAD, CARD_CONTENT_TOP, cardTitleBox } from "./hudSkin";
import { EASE, tween } from "../anim";
import type { Model3D, Overlay3D } from "./engine";
import { Flag, LogoSvg, hasLogo, logoW } from "./Brand";
import "./BrandWafer";

const zh = (px: number, color: string = H.text, w = 800): React.CSSProperties => ({ fontFamily: FONT_ZH, fontSize: px, fill: color, color, fontWeight: w, whiteSpace: "nowrap" });
const onC = (bg: string) => (bg === H.amber ? ((H as any).onAmber ?? H.onAccent) : H.onAccent);
type P = { o: Overlay3D; f: number; k: number; m: Model3D };
const T = (o: Overlay3D, n: string) => ((o as any).t?.[n]?.at ?? o.at) as number;
const CT = CARD_CONTENT_TOP;
const Card: React.FC<{ o: Overlay3D; k: number; W: number; Hh: number; children: React.ReactNode }> = ({ o, k, W, Hh, children }) => (
  <div style={{ position: "absolute", left: o.x ?? L.X, top: o.y ?? 900, width: W, height: Hh, opacity: k, background: H.cardCompare, border: `2px solid ${H.lineSoft}`, boxSizing: "border-box", overflow: "hidden" }}>
    {o.title ? <div style={{ ...zh(CARD_HEAD.px, onC(H.line), 800), ...cardTitleBox(), background: H.line, zIndex: 2 }}>{o.title}</div> : null}
    {o.tag ? <div style={{ position: "absolute", right: 16, top: 14, ...zh(sm(28), H.text2, 600), zIndex: 2 }}>{o.tag}</div> : null}
    {children}
  </div>
);
const ph = (f: number, sp: number, j: number, n: number, seed = 0) => (((f * sp + j / n + seed * 0.17) % 1) + 1) % 1;
const lit = (f: number, at: number, lo = 0.4) => lo + (1 - lo) * tween(f, at, 10, EASE.enter);
const on = (f: number, at: number, d = 10) => tween(f, at, d, EASE.enter);
const cl = (x: number) => Math.min(1, Math.max(0, x));
const RES = "#D9822B", RES_D = "#9E5410", LAT = "#C98A44", EXPO = "#8E5BD8", DEV = "#6F8CF0", DIW = "#5CC8F0", HEAT = "#FF7A2F", WAF = "#B4C2DA", WAF_D = "#7F93B5",
  CHK = "#5D6A82", RED = "#E0472F", OK = "#14A38B", BLUE = "#2F7FE0", EUV = "#9B6BFF", MASK = "#3A4560", AIR = "#8A96A8";
const Sep: React.FC<{ x: number; y0?: number; y1?: number }> = ({ x, y0 = CT + 4, y1 = 316 }) => <line x1={x} y1={y0} x2={x} y2={y1} stroke={H.lineSoft} strokeWidth={3} />;
const Arrow: React.FC<{ x1: number; y1: number; x2: number; y2: number; c: string; w?: number; o?: number }> = ({ x1, y1, x2, y2, c, w = 5, o = 1 }) => {
  const a = Math.atan2(y2 - y1, x2 - x1), s = w * 2.6;
  return <g opacity={o}><path d={`M${x1} ${y1} L${x2 - Math.cos(a) * s * 0.8} ${y2 - Math.sin(a) * s * 0.8}`} stroke={c} strokeWidth={w} />
    <path d={`M${x2} ${y2} L${x2 - Math.cos(a) * s - Math.sin(a) * s * 0.6} ${y2 - Math.sin(a) * s + Math.cos(a) * s * 0.6} L${x2 - Math.cos(a) * s + Math.sin(a) * s * 0.6} ${y2 - Math.sin(a) * s - Math.cos(a) * s * 0.6} Z`} fill={c} /></g>;
};
const Check: React.FC<{ x: number; y: number; o?: number; c?: string }> = ({ x, y, o = 1, c = OK }) => <path opacity={o} d={`M${x - 20} ${y} l14 14 l28 -30`} stroke={c} strokeWidth={8} fill="none" />;
const Cross: React.FC<{ x: number; y: number; o?: number }> = ({ x, y, o = 1 }) => <g opacity={o} stroke={RED} strokeWidth={8}><path d={`M${x - 16} ${y - 16} L${x + 16} ${y + 16}`} /><path d={`M${x + 16} ${y - 16} L${x - 16} ${y + 16}`} /></g>;
/** 右欄條列：念到才亮，前面加色塊 */
const Row: React.FC<{ x: number; y: number; t: string; c: string; a: number; px?: number }> = ({ x, y, t, c, a, px = 32 }) => (
  <g opacity={0.35 + 0.65 * a}><rect x={x} y={y - px * 0.72} width={12} height={px * 0.72} fill={c} /><text x={x + 24} y={y} style={zh(px, H.text, 900)}>{t}</text></g>
);
/** 兩顆球的分子（溶劑、空氣裡的鹼性物質） */
const Mol: React.FC<{ x: number; y: number; c: string; o: number; r?: number }> = ({ x, y, c, o, r = 8 }) => <g opacity={o}><circle cx={x - r * 0.7} cy={y} r={r} fill={c} /><circle cx={x + r * 0.7} cy={y - r * 0.3} r={r * 0.8} fill={c} /></g>;
/** 晶圓側視（含吸盤）＋上面一條光阻（segs：每段 [x0, x1, 顏色, 透明度]） */
const Side: React.FC<{ x: number; w: number; y: number; segs?: [number, number, string, number][]; film?: number; chuck?: boolean; plate?: string }> = ({ x, w, y, segs = [], film = 14, chuck = true, plate }) => (
  <g>
    {plate ? <rect x={x - 20} y={y + 16} width={w + 40} height={46} fill={plate} /> : null}
    {chuck ? <rect x={x + w / 2 - 50} y={y + 16} width={100} height={26} fill={CHK} /> : null}
    <rect x={x} y={y} width={w} height={16} fill={WAF} stroke={WAF_D} strokeWidth={2} />
    {segs.map(([a, b, c, o], j) => <rect key={j} x={a} y={y - film} width={Math.max(0, b - a)} height={film} fill={c} opacity={o} />)}
  </g>
);

// ── trk-hook：光阻誰塗的？左：晶圓上鋪一層光阻｜右：塗佈顯影機黏著曝光機，晶圓在中間來回 ──
const Hook: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330;
  const who = on(f, T(o, "who")), st = on(f, T(o, "stick")), th = on(f, T(o, "this"));
  const spread = EASE.move(cl((f - T(o, "who")) / 40));
  const half = 20 + 150 * spread;
  const u = ph(f, 0.012, 0, 1);
  const dx = 560 + 300 * (0.5 - 0.5 * Math.cos(u * Math.PI * 2));
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        <g opacity={lit(f, T(o, "who"), 0.4)}>
          <text x={40} y={CT + 44} style={zh(34, H.text, 900)}>光阻：誰塗上去的？</text>
          <Side x={60} w={340} y={236} segs={[[230 - half, 230 + half, RES, 0.35 + 0.65 * who]]} film={12} />
          <text x={40} y={312} style={zh(30, H.text2, 800)}>晶圓</text>
          <text x={150} y={312} style={zh(30, RES_D, 900)} opacity={0.35 + 0.65 * who}>光阻薄膜</text>
        </g>
        <Sep x={470} />
        <g opacity={lit(f, T(o, "stick"), 0.4)}>
          <circle cx={dx} cy={266} r={10} fill={WAF_D} opacity={st} />
          <rect x={500} y={CT + 10} width={200} height={170} fill={th > 0 ? H.amber : H.cardCompare} stroke={H.amber} strokeWidth={4} />
          <text x={600} y={CT + 82} textAnchor="middle" style={zh(34, th > 0.5 ? onC(H.amber) : H.text, 900)}>塗佈</text>
          <text x={600} y={CT + 128} textAnchor="middle" style={zh(34, th > 0.5 ? onC(H.amber) : H.text, 900)}>顯影機</text>
          <rect x={700} y={CT + 10} width={220} height={170} fill={BLUE} />
          <text x={810} y={CT + 106} textAnchor="middle" style={zh(36, "#FFFFFF", 900)}>曝光機</text>
          <rect x={692} y={CT + 34} width={16} height={122} fill={H.text} opacity={0.25 + 0.75 * st} />
        </g>
        <text x={760} y={316} textAnchor="middle" style={zh(30, H.text, 900)} opacity={0.3 + 0.7 * st}>連在一起</text>
      </svg>
    </Card>
  );
};

// ── trk-flow：晶圓走一圈（橘＝塗佈顯影機做、藍＝曝光機） ──
const Flow: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330;
  const nm = on(f, T(o, "name")), io = on(f, T(o, "inout")), ps = on(f, T(o, "pass"));
  const bx = [40, 336, 632], top = 82, bot = 224, bw = 260, bh = 62;
  const chip = (x: number, y: number, t: string, c: string, a: number, key: string) => (
    <g key={key} opacity={0.35 + 0.65 * a}><rect x={x} y={y} width={bw} height={bh} fill={c} /><text x={x + bw / 2} y={y + 43} textAnchor="middle" style={zh(32, c === BLUE ? "#FFFFFF" : onC(H.amber), 900)}>{t}</text></g>);
  // 沿流程跑的晶圓點（畫在方塊下面，只在箭頭的空隙看得到）
  const pts: [number, number][] = [[170, 113], [466, 113], [762, 113], [762, 255], [466, 255], [170, 255]];
  const u = ph(f, 0.01, 0, 1) * (pts.length - 1), i = Math.floor(u), t = u - i;
  const dot = ps > 0 ? [pts[i][0] + (pts[i + 1][0] - pts[i][0]) * t, pts[i][1] + (pts[i + 1][1] - pts[i][1]) * t] : null;
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        {dot ? <circle cx={dot[0]} cy={dot[1]} r={13} fill={WAF_D} opacity={ps} /> : null}
        {chip(bx[0], top, "① 塗光阻", H.amber, nm, "a")}{chip(bx[1], top, "② 軟烤", H.amber, nm, "b")}{chip(bx[2], top, "③ 曝光", BLUE, io, "c")}
        {chip(bx[2], bot, "④ 曝後烤", H.amber, nm, "d")}{chip(bx[1], bot, "⑤ 顯影", H.amber, nm, "e")}{chip(bx[0], bot, "⑥ 硬烤", H.amber, nm, "f")}
        <Arrow x1={304} y1={113} x2={332} y2={113} c={H.text2} o={0.4 + 0.6 * nm} /><Arrow x1={600} y1={113} x2={628} y2={113} c={BLUE} o={0.4 + 0.6 * io} />
        <Arrow x1={762} y1={148} x2={762} y2={220} c={BLUE} o={0.4 + 0.6 * io} />
        <Arrow x1={628} y1={255} x2={600} y2={255} c={H.text2} o={0.4 + 0.6 * nm} /><Arrow x1={332} y1={255} x2={304} y2={255} c={H.text2} o={0.4 + 0.6 * nm} />
        <text x={40} y={196} style={zh(30, H.text2, 800)} opacity={0.35 + 0.65 * nm}>橘：塗佈顯影機做</text>
        <text x={470} y={196} style={zh(30, BLUE, 900)} opacity={0.35 + 0.65 * io}>藍：曝光機</text>
      </svg>
    </Card>
  );
};

// ── trk-coat：側視：滴在中心 → 高速旋轉 → 甩成薄膜（多的從邊緣甩掉）｜右欄三步 ──
const Coat: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330;
  const ce = on(f, T(o, "center")), dr = on(f, T(o, "drop")), sp = on(f, T(o, "spin")), fi = on(f, T(o, "film"));
  const x0 = 60, w = 480, cx = x0 + w / 2, y = 236;
  const fall = cl((f - T(o, "drop")) / 14);
  const spread = EASE.move(cl((f - T(o, "spin")) / 36));
  const half = 30 + (w / 2 - 30) * spread, film = 30 - 18 * spread;
  const drops = sp > 0.3 ? [0, 1, 2, 3].map((j) => { const u = ph(f, 0.05, j, 4); const side = j % 2 ? 1 : -1;
    return <circle key={j} cx={cx + side * (w / 2 + 6 + u * 44)} cy={y - 10 - Math.sin(u * Math.PI) * 26} r={7} fill={RES} opacity={(1 - u) * sp} />; }) : null;
  const rot = (f * 0.35 * sp) % 1;
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        <g opacity={lit(f, T(o, "center"), 0.45)}>
          <rect x={cx - 16} y={CT + 6} width={32} height={46} fill={H.text2} />
          <rect x={cx - 6} y={CT + 52} width={12} height={14} fill={RES_D} />
          {dr > 0 && fall < 1 ? <path d={`M${cx} ${CT + 70 + fall * 110} q10 16 0 22 q-10 -6 0 -22Z`} fill={RES} /> : null}
          <Side x={x0} w={w} y={y} segs={dr > 0 && fall >= 1 ? [[cx - half, cx + half, RES, 1]] : []} film={film} />
          {drops}
          {sp > 0 ? <g opacity={sp}><path d={`M${cx - 80} ${y + 52} A80 12 0 0 0 ${cx + 80} ${y + 52}`} stroke={BLUE} strokeWidth={5} fill="none" />
            <Arrow x1={cx + 70} y1={y + 59} x2={cx + 84} y2={y + 50} c={BLUE} w={5} />
            <circle cx={cx - 80 + 160 * rot} cy={y + 52 + 12 * Math.sin(rot * Math.PI)} r={6} fill={BLUE} /></g> : null}
          <text x={x0} y={316} style={zh(30, H.text2, 800)}>晶圓</text>
        </g>
        <Sep x={600} />
        <Row x={628} y={CT + 50} t="① 滴在中心" c={RES} a={Math.max(ce * 0.6, dr)} />
        <Row x={628} y={CT + 120} t="② 高速旋轉" c={BLUE} a={sp} />
        <Row x={628} y={CT + 190} t="③ 甩成薄膜" c={RES_D} a={fi} />
        <text x={652} y={312} style={zh(30, H.text2, 800)} opacity={0.35 + 0.65 * sp}>每分鐘上千轉</text>
      </svg>
    </Card>
  );
};

// ── trk-thick：轉速越快、膜越薄（膜厚約和轉速平方根成反比）｜極紫外光光阻約 40 奈米 ──
const Thick: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330;
  const fa = on(f, T(o, "fast")), tn = on(f, T(o, "thin")), eu = on(f, T(o, "euv")), nm = on(f, T(o, "nm"));
  const gx0 = 110, gx1 = 480, gy0 = 120, gy1 = 270;
  const cv = (u: number) => [gx0 + 20 + (gx1 - gx0 - 30) * u, gy0 + 6 + (gy1 - gy0 - 20) * (1 - 1 / Math.sqrt(1 + 8 * u)) / (1 - 1 / 3)] as [number, number];
  const path = Array.from({ length: 31 }, (_, j) => cv(j / 30)).map(([x, y], j) => `${j ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`).join(" ");
  const p = 0.08 + 0.84 * EASE.move(cl((f - T(o, "fast")) / 40));
  const [px, py] = cv(p);
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        <g opacity={lit(f, T(o, "fast"), 0.45)}>
          <text x={gx0 + 14} y={CT + 36} style={zh(30, H.text2, 800)}>膜厚</text>
          <line x1={gx0} y1={gy0} x2={gx0} y2={gy1 + 10} stroke={H.text2} strokeWidth={3} />
          <line x1={gx0} y1={gy1 + 10} x2={gx1 + 10} y2={gy1 + 10} stroke={H.text2} strokeWidth={3} />
          <path d={path} stroke={RES} strokeWidth={6} fill="none" />
          <circle cx={px} cy={py} r={13} fill={BLUE} opacity={fa} />
          <text x={gx1 - 80} y={314} style={zh(30, H.text2, 800)}>轉速</text>
          <text x={36} y={gy1 + 6} style={zh(30, BLUE, 900)} opacity={0.3 + 0.7 * tn}>薄</text>
          <text x={36} y={gy0 + 26} style={zh(30, H.text2, 800)}>厚</text>
        </g>
        <Sep x={530} />
        <g opacity={lit(f, T(o, "euv"), 0.4)}>
          <text x={560} y={CT + 44} style={zh(32, H.text, 900)}>極紫外光用的光阻</text>
          <text x={560} y={CT + 130} style={zh(60, RES_D, 900)} opacity={0.35 + 0.65 * nm}>約 40 奈米</text>
          <rect x={560} y={CT + 166} width={340} height={22} fill={WAF} />
          <rect x={560} y={CT + 154} width={340} height={12} fill={RES} opacity={0.35 + 0.65 * eu} />
          <text x={560} y={312} style={zh(30, H.text2, 800)}>專利、論文的例子</text>
        </g>
      </svg>
    </Card>
  );
};

// ── trk-sb：軟烤：加熱板發熱、溶劑分子從膜裡往上跑掉 ──
const Sb: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330;
  const pl = on(f, T(o, "plate")), bk = on(f, T(o, "bake")), sv = on(f, T(o, "solv"));
  const hot = bk > 0 ? HEAT : "#9AA4B4";
  const mols = Array.from({ length: 7 }, (_, j) => { const u = ph(f, 0.022, j, 7, 3); const x = 100 + j * 64 + Math.sin(u * 6 + j) * 10;
    return <Mol key={j} x={x} y={206 - u * 120} c={AIR} o={sv * Math.min(1, u * 6, (1 - u) * 3)} />; });
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        <g opacity={lit(f, T(o, "plate"), 0.45)}>
          {mols}
          <Side x={70} w={460} y={228} segs={[[70, 530, RES, 1]]} film={14} chuck={false} plate={hot} />
          <text x={300} y={284} textAnchor="middle" style={zh(30, "#FFFFFF", 900)}>加熱板</text>
        </g>
        <Sep x={600} />
        <Row x={628} y={CT + 56} t="① 放上加熱板" c={H.amber} a={pl} />
        <Row x={628} y={CT + 126} t="② 烤一下" c={HEAT} a={bk} />
        <Row x={628} y={CT + 196} t="③ 溶劑跑掉" c={AIR} a={sv} />
        <text x={652} y={312} style={zh(30, H.text2, 800)} opacity={0.35 + 0.65 * bk}>約 90～150°C</text>
      </svg>
    </Card>
  );
};

// 光阻條紋（照光／沒照光）：x0 起，n 段，每段寬 sw
const stripeSegs = (x0: number, n: number, sw: number, cUn: string, cEx: string, oEx: number, oUn = 1): [number, number, string, number][] =>
  Array.from({ length: n }, (_, j) => [x0 + j * sw, x0 + (j + 1) * sw, j % 2 ? cEx : cUn, j % 2 ? oEx : oUn] as [number, number, string, number]);

// ── trk-exp：光穿過光罩的開口照到光阻，照到的地方變成看不見的潛像 ──
const Exp: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330;
  const ar = on(f, T(o, "arm")), sc = on(f, T(o, "scan")), ex = on(f, T(o, "expose")), la = on(f, T(o, "latent"));
  const x0 = 70, n = 9, sw = 50, my = CT + 54;
  const beams = Array.from({ length: n }, (_, j) => j % 2 ? <rect key={j} x={x0 + j * sw + 8} y={CT + 2} width={sw - 16} height={216 - CT} fill={EUV} opacity={0.55 * ex} /> : null);
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        <g opacity={lit(f, T(o, "scan"), 0.45)}>
          {beams}
          {Array.from({ length: n }, (_, j) => j % 2 ? null : <rect key={j} x={x0 + j * sw} y={my} width={sw} height={30} fill={MASK} />)}
          <Side x={x0} w={n * sw} y={230} segs={stripeSegs(x0, n, sw, RES, LAT, 1)} film={14} />
          {la > 0 ? Array.from({ length: n }, (_, j) => j % 2 ? <rect key={j} x={x0 + j * sw + 3} y={219} width={sw - 6} height={8} fill="none" stroke={EXPO} strokeWidth={2} strokeDasharray="6 5" opacity={la} /> : null) : null}
          <text x={x0} y={312} style={zh(30, H.text2, 800)}>光罩擋住的地方沒照到</text>
        </g>
        <Sep x={600} />
        <Row x={628} y={CT + 56} t="① 手臂送進去" c={BLUE} a={Math.max(ar, sc)} />
        <Row x={628} y={CT + 136} t="② 照光" c={EUV} a={ex} />
        <Row x={628} y={CT + 216} t="③ 看不見的圖案" c={EXPO} a={la} />
      </svg>
    </Card>
  );
};

// ── trk-peb：曝後烤：照到光的地方，產生的酸在加熱下把反應走完（顏色變深） ──
const Peb: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330;
  const bk = on(f, T(o, "back")), pb = on(f, T(o, "peb")), li = on(f, T(o, "lit")), re = on(f, T(o, "react"), 24);
  const x0 = 70, n = 9, sw = 50, y = 214;
  const mix = (a: string, b: string, t: number) => { const h = (s: string) => [1, 3, 5].map((i) => parseInt(s.slice(i, i + 2), 16)); const A = h(a), B = h(b);
    return `rgb(${A.map((v, i) => Math.round(v + (B[i] - v) * t)).join(",")})`; };
  const acid = li > 0 ? Array.from({ length: n }, (_, j) => j % 2 ? [0, 1, 2].map((q) => { const u = ph(f, 0.03, q, 3, j);
    return <circle key={`${j}_${q}`} cx={x0 + j * sw + 12 + q * 13} cy={y - 4 - 10 * Math.abs(Math.sin(u * Math.PI * 2))} r={4} fill="#FFFFFF" opacity={li * (1 - re * 0.8)} />; }) : null) : null;
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        <g opacity={lit(f, T(o, "back"), 0.45)}>
          <Side x={x0} w={n * sw} y={y + 4} segs={stripeSegs(x0, n, sw, RES, mix(LAT, EXPO, re), 1)} film={22} chuck={false} plate={pb > 0 ? HEAT : "#9AA4B4"} />
          {acid}
          <text x={x0 + n * sw / 2} y={274} textAnchor="middle" style={zh(30, "#FFFFFF", 900)}>加熱板</text>
          <text x={x0} y={CT + 40} style={zh(30, H.text2, 800)} opacity={0.35 + 0.65 * li}>白點：照光後產生的酸</text>
        </g>
        <Sep x={600} />
        <Row x={628} y={CT + 56} t="① 拿回來" c={BLUE} a={bk} />
        <Row x={628} y={CT + 136} t="② 再烤一次" c={HEAT} a={pb} />
        <Row x={628} y={CT + 216} t="③ 照光處反應完" c={EXPO} a={re} />
      </svg>
    </Card>
  );
};

// ── trk-dev：顯影液→照光處溶掉→沖水→甩乾→烤硬→圖案 ──
const Dev: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330;
  const dv = on(f, T(o, "dev")), ds = on(f, T(o, "dissolve"), 18), rn = on(f, T(o, "rinse")), dy = on(f, T(o, "dry")), hd = on(f, T(o, "hard")), pt = on(f, T(o, "pattern"));
  const steps: [string, string, number][] = [["顯影液", DEV, dv], ["溶掉", EXPO, ds], ["沖水", DIW, rn], ["甩乾", BLUE, dy], ["烤硬", HEAT, hd]];
  const x0 = 60, n = 9, sw = 58, y = 262;
  const liq = dv > 0 && rn < 1 ? DEV : DIW, lo = dv * (1 - dy) * 0.45;
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        {steps.map(([t, c, a], j) => { const x = 18 + j * 186, hl = a > 0.5;
          return <g key={j} opacity={0.35 + 0.65 * a}><rect x={x} y={CT + 4} width={168} height={56} fill={hl ? c : H.cardCompare} stroke={c} strokeWidth={3} />
            <text x={x + 84} y={CT + 44} textAnchor="middle" style={zh(32, hl ? "#FFFFFF" : H.text, 900)}>{t}</text></g>; })}
        <g opacity={lit(f, T(o, "dev"), 0.45)}>
          <rect x={x0} y={y - 70} width={n * sw} height={46} fill={liq} opacity={lo} />
          <Side x={x0} w={n * sw} y={y} segs={stripeSegs(x0, n, sw, hd > 0 ? RES_D : RES, EXPO, 1 - ds)} film={24} chuck={false} plate={hd > 0 ? HEAT : undefined} />
        </g>
        <g opacity={0.3 + 0.7 * pt}>
          <text x={640} y={226} style={zh(40, H.text, 900)}>圖案出來了</text>
          <Check x={900} y={212} o={pt} />
          <text x={640} y={276} style={zh(30, H.text2, 800)}>留下沒照光的光阻</text>
        </g>
      </svg>
    </Card>
  );
};

// ── trk-wait：馬上烤（直壁）vs 等太久（空氣裡的鹼性物質中和表面的酸 → 頂端走樣） ──
const Wait: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330;
  const lk = on(f, T(o, "link")), wt = on(f, T(o, "wait")), bd = on(f, T(o, "bad"), 20);
  const base = 280;
  const lines = (x0: number, tt: number) => [0, 1, 2].map((j) => { const x = x0 + j * 120;
    return <g key={j}><rect x={x} y={170} width={56} height={base - 170} fill={RES_D} />
      {tt > 0 ? <rect x={x - 18 * tt} y={170} width={56 + 36 * tt} height={22} fill={RES_D} /> : null}</g>; });
  const mols = Array.from({ length: 6 }, (_, j) => { const u = ph(f, 0.02, j, 6, 1);
    return <Mol key={j} x={520 + j * 66} y={128 + u * 30} c={AIR} o={wt * Math.min(1, u * 5, (1 - u) * 5)} r={7} />; });
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        <g opacity={lit(f, T(o, "link"), 0.4)}>
          <text x={40} y={CT + 40} style={zh(32, H.text, 900)}>曝光完馬上烤</text>
          <rect x={40} y={base} width={400} height={16} fill={WAF} />
          {lines(70, 0)}
          <Check x={400} y={140} o={lk} />
        </g>
        <Sep x={470} />
        <g opacity={lit(f, T(o, "wait"), 0.4)}>
          <text x={500} y={CT + 40} style={zh(32, H.text, 900)}>放太久：頂端走樣</text>
          {mols}
          <rect x={500} y={base} width={420} height={16} fill={WAF} />
          {lines(540, bd)}
          <Cross x={890} y={232} o={bd} />
        </g>
      </svg>
    </Card>
  );
};

// ── trk-co：誰在做（公司說法、兩份估計） ──
const Co: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330;
  const te = on(f, T(o, "tel")), eu = on(f, T(o, "euv")), al = on(f, T(o, "all"));
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        <g opacity={lit(f, T(o, "tel"), 0.4)}>
          <text x={36} y={CT + 48} style={zh(40, H.text, 900)}>東京威力科創</text>
          <text x={36} y={CT + 104} style={zh(32, H.text, 800)} opacity={0.35 + 0.65 * eu}>極紫外光用的塗佈顯影機</text>
          <text x={36} y={CT + 176} style={zh(56, RES_D, 900)} opacity={0.3 + 0.7 * al}>幾乎全包</text>
          <rect x={300} y={CT + 132} width={150} height={52} fill={H.amber} opacity={0.3 + 0.7 * al} />
          <text x={375} y={CT + 170} textAnchor="middle" style={zh(30, onC(H.amber), 900)} opacity={0.3 + 0.7 * al}>公司說法</text>
          <text x={36} y={312} style={zh(30, H.text2, 800)}>2020 新聞稿、2026 年 9 月記者會</text>
        </g>
        <g><rect x={292} y={CT + 14} width={50} height={36} fill="none" stroke={te > 0.5 ? H.amber : H.lineSoft} strokeWidth={te > 0.5 ? 4 : 1.5} />
          <Flag code="JP" h={28} x={296} y={CT + 18} asSvg />
          {hasLogo("tel") ? (() => { const lw = Math.min(200, logoW("tel", 34)); return <g><rect x={356} y={CT + 12} width={lw + 12} height={44} fill="#FFFFFF" stroke={te > 0.5 ? H.amber : H.lineSoft} strokeWidth={te > 0.5 ? 4 : 1.5} /><LogoSvg id="tel" x={362} y={CT + 17} h={34 * lw / logoW("tel", 34)} /></g>; })() : null}
          <rect x={632} y={CT + 222} width={50} height={36} fill="none" stroke={al > 0.5 ? H.amber : H.lineSoft} strokeWidth={al > 0.5 ? 4 : 1.5} />
          <Flag code="JP" h={28} x={636} y={CT + 226} asSvg /></g>
        <Sep x={610} />
        <g opacity={lit(f, T(o, "all"), 0.4)}>
          <text x={636} y={CT + 40} style={zh(30, H.text2, 800)}>全部塗佈顯影機</text>
          <text x={636} y={CT + 92} style={zh(40, H.text, 900)}>八成五以上</text>
          <text x={636} y={CT + 132} style={zh(30, H.text2, 800)}>兩份估計</text>
          <text x={636} y={CT + 198} style={zh(30, H.text, 800)}>另一家日廠</text>
          <text x={696} y={CT + 250} style={zh(30, H.text, 900)}>SCREEN</text>
        </g>
      </svg>
    </Card>
  );
};

// ── trk-tw：在台灣：台南營運中心（維修）、在地零組件加工 ──
const Tw: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330;
  const tw = on(f, T(o, "tw")), tn = on(f, T(o, "tainan")), rp = on(f, T(o, "repair")), pa = on(f, T(o, "parts"));
  const pulse = 1 + 0.25 * Math.sin(f * 0.25) * tn;
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        <g opacity={lit(f, T(o, "tw"), 0.45)}>
          <path d="M150 82 C192 96 206 150 198 206 C192 252 166 296 136 304 C114 282 100 236 102 186 C104 134 118 92 150 82Z" fill={OK} opacity={0.35 + 0.4 * tw} />
          <circle cx={124} cy={250} r={11 * pulse} fill={H.amber} opacity={0.3 + 0.7 * tn} />
          <line x1={136} y1={250} x2={220} y2={250} stroke={H.amber} strokeWidth={3} opacity={0.3 + 0.7 * tn} />
          <text x={228} y={262} style={zh(32, H.text, 900)} opacity={0.3 + 0.7 * tn}>台南</text>
        </g>
        <g><rect x={224} y={CT + 14} width={50} height={36} fill="none" stroke={tw > 0.5 ? H.amber : H.lineSoft} strokeWidth={tw > 0.5 ? 4 : 1.5} /><Flag code="TW" h={28} x={228} y={CT + 18} asSvg /></g>
        <Sep x={320} />
        <g opacity={lit(f, T(o, "tainan"), 0.4)}>
          <text x={348} y={CT + 44} style={zh(36, H.text, 900)}>東京威力科創 台南營運中心</text>
          <text x={348} y={CT + 88} style={zh(30, H.text2, 800)}>2024 年 12 月開幕</text>
        </g>
        <Row x={348} y={CT + 160} t="維修中心：就近修" c={H.amber} a={rp} />
        <Row x={348} y={CT + 226} t="零組件：在地廠商加工" c={OK} a={pa} />
      </svg>
    </Card>
  );
};

// ── trk-next：塗得均勻 → 圖案準不準？→ 看曝光機｜下一集＋留言 ──
const Next: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330;
  const ev = on(f, T(o, "even")), ac = on(f, T(o, "acc")), sc = on(f, T(o, "scan")), nx = on(f, T(o, "next")), kw = on(f, T(o, "kw"));
  const chip = (x: number, t: string, c: string, a: number, dark: boolean) => (
    <g opacity={0.35 + 0.65 * a}><rect x={x} y={CT + 8} width={262} height={70} fill={a > 0.5 ? c : H.cardCompare} stroke={c} strokeWidth={4} />
      <text x={x + 112} y={CT + 56} textAnchor="middle" style={zh(32, a > 0.5 && dark ? "#FFFFFF" : H.text, 900)}>{t}</text></g>);
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        {chip(24, "塗得均勻", OK, ev, true)}<Check x={244} y={CT + 40} o={ev} c="#FFFFFF" />
        <Arrow x1={292} y1={CT + 43} x2={334} y2={CT + 43} c={H.text2} o={0.35 + 0.65 * ac} />
        {chip(344, "準不準？", H.amber, ac, false)}
        <Arrow x1={612} y1={CT + 43} x2={654} y2={CT + 43} c={H.text2} o={0.35 + 0.65 * sc} />
        {chip(664, "看曝光機", BLUE, sc, true)}
        <text x={W / 2} y={214} textAnchor="middle" style={zh(34, H.text, 900)} opacity={0.3 + 0.7 * nx}>下一集：設備五大-1 艾司摩爾</text>
        <g opacity={kw} transform={`translate(${W / 2} 278) rotate(-2) scale(${1 + 0.3 * (1 - kw)})`}>
          <rect x={-220} y={-32} width={440} height={64} fill={H.amber} /><text x={0} y={14} textAnchor="middle" style={zh(38, onC(H.amber), 900)}>留言「顯影」拿完整資料</text>
        </g>
      </svg>
    </Card>
  );
};

export const TrkSection: React.FC<P> = (p) => {
  const kd = String((p.o as any).kind);
  if (kd === "trk-hook") return <Hook {...p} />;
  if (kd === "trk-flow") return <Flow {...p} />;
  if (kd === "trk-coat") return <Coat {...p} />;
  if (kd === "trk-thick") return <Thick {...p} />;
  if (kd === "trk-sb") return <Sb {...p} />;
  if (kd === "trk-exp") return <Exp {...p} />;
  if (kd === "trk-peb") return <Peb {...p} />;
  if (kd === "trk-dev") return <Dev {...p} />;
  if (kd === "trk-wait") return <Wait {...p} />;
  if (kd === "trk-co") return <Co {...p} />;
  if (kd === "trk-tw") return <Tw {...p} />;
  if (kd === "trk-next") return <Next {...p} />;
  return null;
};

// 2026/11/23 tech-wafer2：矽晶圓-2（磊晶、尺寸分工、台灣四家）的 2D 示意卡（overlay `section` 的 kind 以 "w2-" 開頭，Hud.tsx 的 HudSection 轉過來）。
//   w2-hook 拋光晶圓 vs 磊晶晶圓（再長一層？）｜w2-pol 拋光晶圓剖面：雜質整片一樣｜w2-cvd 磊晶爐剖面：燈管加熱、含矽氣體掠過晶圓＋溫度｜
//   w2-grow 原子照底下的排列落下、長出新一層｜w2-dope 底下摻多、上面摻少｜w2-size 12／8／6 吋分工｜w2-co 台灣四家（focus＝gw／fst／ww／epi）｜w2-next 下一集光罩＋留言
// 全部示意；結構一開始就畫出（不留空框），念到時該處亮起、動起來；時間全部來自 script.json 的 t（cue）。
// 排版原則（card-overlap.mjs 檢查）：內容從 CARD_CONTENT_TOP 以下；字不放進會動的圖形範圍；欄間 ≥24px；分隔線不穿字；字 ≥30px。
// 只給 tech-wafer2 用，不動 HudSi.tsx（tech-wafer1）。
import React from "react";
import { FONT_ZH } from "../../theme";
import { H, sm, CARD_HEAD, CARD_CONTENT_TOP, cardTitleBox } from "./hudSkin";
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
  <div style={{ position: "absolute", left: o.x ?? 64, top: o.y ?? 900, width: W, height: Hh, opacity: k, background: H.cardCompare, border: `2px solid ${H.lineSoft}`, boxSizing: "border-box", overflow: "hidden" }}>
    {o.title ? <div style={{ ...zh(CARD_HEAD.px, onC(H.line), 800), ...cardTitleBox(), background: H.line, zIndex: 2 }}>{o.title}</div> : null}
    {o.tag ? <div style={{ position: "absolute", right: 16, top: 14, ...zh(sm(28), H.text2, 600), zIndex: 2 }}>{o.tag}</div> : null}
    {children}
  </div>
);
const lit = (f: number, at: number, lo = 0.4) => lo + (1 - lo) * tween(f, at, 10, EASE.enter);
const on = (f: number, at: number, d = 10) => tween(f, at, d, EASE.enter);
const cl = (x: number) => Math.min(1, Math.max(0, x));
const SI = "#AFC0DA", SI_D = "#7F93B5", EPI = "#38C6D9", EPI_D = "#1E98AA", RED = "#E0472F", OK = "#14A38B", BLUE = "#2F7FE0", GAS = "#3FA866", H2C = "#6E9EE8",
  LAMP = "#FFC85A", HEAT = "#FF7A2F", MIRROR = "#C8D5EA", QZ = "#9FB9D8";
const Sep: React.FC<{ x: number; y0?: number; y1?: number }> = ({ x, y0 = CT + 4, y1 = 316 }) => <line x1={x} y1={y0} x2={x} y2={y1} stroke={H.lineSoft} strokeWidth={3} />;
const Arrow: React.FC<{ x1: number; y1: number; x2: number; y2: number; c: string; w?: number; o?: number }> = ({ x1, y1, x2, y2, c, w = 5, o = 1 }) => {
  const a = Math.atan2(y2 - y1, x2 - x1), s = w * 2.6;
  return <g opacity={o}><path d={`M${x1} ${y1} L${x2 - Math.cos(a) * s * 0.8} ${y2 - Math.sin(a) * s * 0.8}`} stroke={c} strokeWidth={w} />
    <path d={`M${x2} ${y2} L${x2 - Math.cos(a) * s - Math.sin(a) * s * 0.6} ${y2 - Math.sin(a) * s + Math.cos(a) * s * 0.6} L${x2 - Math.cos(a) * s + Math.sin(a) * s * 0.6} ${y2 - Math.sin(a) * s - Math.cos(a) * s * 0.6} Z`} fill={c} /></g>;
};
const Check: React.FC<{ x: number; y: number; o?: number }> = ({ x, y, o = 1 }) => <path opacity={o} d={`M${x - 20} ${y} l14 14 l28 -30`} stroke={OK} strokeWidth={8} fill="none" />;
/** 文字列：念到才亮，前面加色塊 */
const Row: React.FC<{ x: number; y: number; t: string; c: string; a: number; px?: number }> = ({ x, y, t, c, a, px = 32 }) => (
  <g opacity={0.35 + 0.65 * a}><rect x={x} y={y - px * 0.72} width={12} height={px * 0.72} fill={c} /><text x={x + 24} y={y} style={zh(px, H.text, 900)}>{t}</text></g>
);
/** 雜質點（固定亂數位置） */
const dots = (x: number, y: number, w: number, h: number, n: number, seed: number, r = 6, c = RED, o = 1) =>
  Array.from({ length: n }, (_, j) => { const u = ((j * 0.618 + seed * 0.37) % 1), v = ((j * 0.414 + seed * 0.53 + j * j * 0.013) % 1);
    return <circle key={`d${seed}_${j}`} cx={x + r + 2 + u * (w - 2 * r - 4)} cy={y + r + 2 + v * (h - 2 * r - 4)} r={r} fill={c} opacity={o} />; });
/** 晶圓俯視（裸晶圓，沒有晶粒）＋反光帶 */
const WaferTop: React.FC<{ cx: number; cy: number; r: number; glow?: number }> = ({ cx, cy, r, glow = 0 }) => (
  <g>
    <circle cx={cx} cy={cy} r={r} fill={MIRROR} stroke={glow > 0.05 ? BLUE : SI_D} strokeWidth={3 + 3 * glow} />
    <path d={`M${cx - 6} ${cy + r} L${cx} ${cy + r - 9} L${cx + 6} ${cy + r} Z`} fill={H.cardCompare} />
  </g>
);

// ── w2-hook：拋光晶圓 → 再長一層？ → 磊晶晶圓｜差在哪 ──
const Hook: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330;
  const sa = on(f, T(o, "same")), po = on(f, T(o, "pol")), gr = cl((f - T(o, "grow")) / 40), ep = on(f, T(o, "epi")), wy = on(f, T(o, "why"));
  const lh = 24 * EASE.move(gr);
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        <g opacity={lit(f, T(o, "pol"), 0.45 + 0.2 * sa)}>
          <text x={40} y={CT + 44} style={zh(32, H.text, 900)}>拋光晶圓</text>
          <rect x={40} y={190} width={250} height={70} fill={SI} stroke={SI_D} strokeWidth={3} />
          <rect x={40} y={190} width={250} height={6} fill="#FFFFFF" opacity={0.4 + 0.5 * po} />
        </g>
        <Arrow x1={318} y1={225} x2={420} y2={225} c={H.amber} w={7} o={0.35 + 0.65 * gr} />
        <text x={369} y={172} textAnchor="middle" style={zh(30, H.text, 900)} opacity={0.35 + 0.65 * gr}>再長一層</text>
        <g opacity={lit(f, T(o, "grow"), 0.45)}>
          <text x={450} y={CT + 44} style={zh(32, H.text, 900)} opacity={0.4 + 0.6 * ep}>磊晶晶圓</text>
          <rect x={450} y={190} width={250} height={70} fill={SI} stroke={SI_D} strokeWidth={3} />
          {lh > 0.5 ? <rect x={450} y={190 - lh} width={250} height={lh} fill={EPI} stroke={EPI_D} strokeWidth={2} /> : null}
          {gr > 0 && gr < 1 ? Array.from({ length: 7 }, (_, j) => { const p = ((f * 0.03 + j / 7) % 1); return <circle key={j} cx={470 + j * 34} cy={128 + p * (60 - lh)} r={6} fill={SI_D} opacity={0.9 - 0.6 * p} />; }) : null}
        </g>
        <Sep x={730} />
        <g opacity={0.3 + 0.7 * wy}>
          <text x={834} y={220} textAnchor="middle" style={zh(96, H.amber, 900)}>？</text>
          <text x={834} y={292} textAnchor="middle" style={zh(34, H.text, 900)}>差在哪</text>
        </g>
      </svg>
    </Card>
  );
};

// ── w2-pol：拋光晶圓剖面（雜質點整片均勻）＋濃度從表面到深處一樣 ──
const Pol: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330;
  const la = on(f, T(o, "last")), pw = on(f, T(o, "polw")), sm_ = on(f, T(o, "same"));
  const pulse = sm_ > 0 ? 0.6 + 0.4 * Math.sin(f * 0.25) : 0;
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        <g opacity={lit(f, T(o, "last"), 0.5)}>
          <rect x={40} y={96} width={400} height={208} fill={SI} stroke={SI_D} strokeWidth={3} />
          <rect x={40} y={96} width={400 * EASE.move(pw)} height={7} fill="#FFFFFF" opacity={0.85} />
          {dots(44, 108, 392, 192, 34, 3, 7, RED, 0.55 + 0.45 * Math.max(la * 0.4, pulse))}
        </g>
        <Sep x={476} />
        <text x={506} y={CT + 42} style={zh(34, BLUE, 900)} opacity={0.35 + 0.65 * pw}>拋光晶圓</text>
        <g opacity={0.35 + 0.65 * sm_}>
          <text x={506} y={164} style={zh(30, H.text2, 800)}>雜質濃度</text>
          <text x={660} y={164} style={zh(32, "#B4530A", 900)}>都一樣</text>
          <line x1={506} y1={184} x2={506} y2={252} stroke={H.text3} strokeWidth={3} />
          <line x1={506} y1={252} x2={900} y2={252} stroke={H.text3} strokeWidth={3} />
          <line x1={510} y1={214} x2={510 + 386 * EASE.move(cl((f - T(o, "same")) / 24))} y2={214} stroke={RED} strokeWidth={7} />
          <text x={506} y={298} style={zh(30, H.text2, 800)}>表面</text>
          <text x={900} y={298} textAnchor="end" style={zh(30, H.text2, 800)}>深處</text>
        </g>
      </svg>
    </Card>
  );
};

// ── w2-cvd：磊晶爐剖面（上下燈管、石英腔、承座＋晶圓、左進右出的含矽氣體）＋溫度 ──
const Cvd: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330;
  const inn = cl((f - T(o, "in")) / 24), la = on(f, T(o, "lamp")), dg = cl((f - T(o, "deg")) / 36), gs = on(f, T(o, "gas"));
  const temp = Math.round(25 + (1100 - 25) * EASE.move(dg));
  const wx = 150 + (1 - EASE.move(inn)) * 80;
  const hot = dg;
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        {/* 上燈組 */}
        <rect x={70} y={82} width={460} height={10} fill="#D9A93A" />
        {Array.from({ length: 9 }, (_, j) => <rect key={`u${j}`} x={84 + j * 50} y={96} width={36} height={14} rx={7} fill={la > 0 ? LAMP : "#EFE6CF"} stroke="#C9A045" strokeWidth={2} opacity={0.5 + 0.5 * la} />)}
        {/* 石英腔 */}
        <rect x={60} y={122} width={480} height={126} fill="none" stroke={QZ} strokeWidth={4} />
        {/* 進氣口、排氣口 */}
        <rect x={40} y={160} width={22} height={40} fill={SI_D} />
        <rect x={538} y={190} width={22} height={40} fill={SI_D} />
        {/* 承座＋晶圓 */}
        <rect x={140} y={218} width={320} height={16} fill="#3A3F48" />
        <rect opacity={0.25 + 0.75 * inn} x={wx} y={208} width={300} height={10} fill={hot > 0 ? `rgb(${Math.round(200 + 55 * hot)},${Math.round(213 - 60 * hot)},${Math.round(234 - 150 * hot)})` : MIRROR} stroke={SI_D} strokeWidth={2} />
        {/* 下燈組 */}
        {Array.from({ length: 9 }, (_, j) => <rect key={`l${j}`} x={84 + j * 50} y={258} width={36} height={14} rx={7} fill={la > 0 ? LAMP : "#EFE6CF"} stroke="#C9A045" strokeWidth={2} opacity={0.5 + 0.5 * la} />)}
        <rect x={70} y={278} width={460} height={10} fill="#D9A93A" />
        {/* 燈光往晶圓照（光帶） */}
        {la > 0 ? Array.from({ length: 5 }, (_, j) => <rect key={`b${j}`} x={130 + j * 80} y={112} width={8} height={94} fill={LAMP} opacity={0.25 * la} />) : null}
        {/* 氣體分子：三氯矽烷（綠，三球）、氫氣（藍，兩球）從左往右掠過晶圓 */}
        {gs > 0 ? Array.from({ length: 10 }, (_, j) => {
          const p = ((f * 0.012 + j / 10) % 1), x = 70 + p * 470, y = 172 + Math.sin(p * 3.2 + j) * 8 + (p > 0.85 ? (p - 0.85) * 160 : 0), h2 = j % 3 === 2;
          return <g key={`g${j}`} opacity={gs * (p < 0.08 ? p / 0.08 : 1)}>
            {h2 ? <><circle cx={x} cy={y} r={6} fill={H2C} /><circle cx={x + 10} cy={y} r={6} fill={H2C} /></>
              : <><circle cx={x} cy={y} r={7} fill={GAS} /><circle cx={x + 11} cy={y - 5} r={6} fill={GAS} /><circle cx={x + 11} cy={y + 6} r={6} fill={GAS} /></>}
          </g>; }) : null}
        <Sep x={576} />
        <text x={606} y={CT + 40} style={zh(30, H.text2, 800)} opacity={0.35 + 0.65 * la}>燈管加熱</text>
        <text x={606} y={186} style={zh(56, HEAT, 900)} opacity={0.35 + 0.65 * on(f, T(o, "deg"))}>{`約${temp}°C`}</text>
        <g opacity={0.35 + 0.65 * gs}>
          <circle cx={618} cy={262} r={8} fill={GAS} /><circle cx={630} cy={256} r={7} fill={GAS} /><circle cx={630} cy={268} r={7} fill={GAS} />
          <text x={652} y={274} style={zh(30, H.text, 900)}>含矽氣體</text>
          <circle cx={800} cy={262} r={7} fill={H2C} /><circle cx={812} cy={262} r={7} fill={H2C} />
          <text x={830} y={274} style={zh(30, H.text, 900)}>氫氣</text>
        </g>
      </svg>
    </Card>
  );
};

// ── w2-grow：原子照底下排列落下、一排排長成新層（左）｜三步（右） ──
const Grow: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330;
  const sp = on(f, T(o, "spin")), at = on(f, T(o, "atom")), ly = on(f, T(o, "lay"));
  const COLS = 10, X0 = 60, DX = 44, YB = 290, DY = 40;
  const nodes: React.ReactNode[] = [];
  for (let j = 0; j < 2; j++) for (let i = 0; i < COLS; i++) nodes.push(<circle key={`s${i}_${j}`} cx={X0 + i * DX} cy={YB - j * DY} r={14} fill={SI} stroke={SI_D} strokeWidth={2} />);
  for (let i = 0; i < COLS; i++) nodes.push(<line key={`v${i}`} x1={X0 + i * DX} y1={YB - 4 * DY} x2={X0 + i * DX} y2={YB - DY} stroke={SI_D} strokeWidth={2} strokeDasharray="4 6" opacity={0.6 * at} />);
  // 新層：兩排，每顆原子依序從上方落下（落下加速＋輕回彈）
  for (let j = 0; j < 2; j++) for (let i = 0; i < COLS; i++) {
    const t0 = T(o, "atom") + (j * COLS + i) * 2.4, p = cl((f - t0) / 12);
    if (p <= 0) continue;
    const yEnd = YB - (2 + j) * DY, y = yEnd - (1 - p * p) * 90 + (p >= 1 ? 0 : 0);
    nodes.push(<circle key={`e${i}_${j}`} cx={X0 + i * DX} cy={y} r={14} fill={EPI} stroke={EPI_D} strokeWidth={2} opacity={0.4 + 0.6 * p} />);
  }
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        <g opacity={lit(f, T(o, "spin"), 0.55)}>{nodes}</g>
        <line x1={40} y1={YB - 1.5 * DY} x2={500} y2={YB - 1.5 * DY} stroke={H.amber} strokeWidth={3} strokeDasharray="10 8" opacity={ly} />
        <Sep x={530} />
        <Row x={560} y={CT + 52} t="托盤在轉" c={BLUE} a={sp} />
        <Row x={560} y={CT + 132} t="照底下的排列" c={EPI_D} a={at} />
        <Row x={560} y={CT + 212} t="長出新一層" c={H.amber} a={ly} />
        <g transform={`translate(880 ${CT + 40}) rotate(${(f * 6) % 360})`} opacity={0.35 + 0.65 * sp}>
          <path d="M -18 0 A 18 18 0 1 1 0 18" stroke={BLUE} strokeWidth={5} fill="none" />
          <path d="M 0 10 L 0 26 L -12 18 Z" fill={BLUE} />
        </g>
      </svg>
    </Card>
  );
};

// ── w2-dope：上面磊晶層（雜質少）｜底下底材（雜質多）｜功率晶片常用 ──
const Dope: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330;
  const ad = on(f, T(o, "adj")), hv = on(f, T(o, "heavy")), lt = on(f, T(o, "light")), pw = on(f, T(o, "power"));
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        <g opacity={lit(f, T(o, "adj"), 0.5)}>
          <rect x={40} y={90} width={420} height={80} fill={EPI} stroke={EPI_D} strokeWidth={3} opacity={0.9} />
          <rect x={40} y={174} width={420} height={130} fill={SI} stroke={SI_D} strokeWidth={3} />
          {dots(44, 94, 412, 72, 3, 7, 7, RED, 0.4 + 0.6 * lt)}
          {dots(44, 178, 412, 122, 30, 5, 7, RED, 0.4 + 0.6 * hv)}
          <line x1={40} y1={172} x2={460} y2={172} stroke={H.amber} strokeWidth={4} opacity={ad} />
        </g>
        <Sep x={490} />
        <Row x={520} y={CT + 44} t="上面：摻少" c={EPI_D} a={lt} />
        <Row x={520} y={CT + 116} t="底下：摻多" c={RED} a={hv} />
        <g opacity={0.35 + 0.65 * pw}>
          <text x={520} y={CT + 214} style={zh(34, H.text, 900)}>功率晶片常用</text>
          <Check x={850} y={CT + 202} o={pw} />
        </g>
      </svg>
    </Card>
  );
};

// ── w2-size：12／8／6 吋（左，裸晶圓俯視）｜用途（右） ──
const Size: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330;
  const s12 = on(f, T(o, "w12")), s8 = on(f, T(o, "w8")), pw = on(f, T(o, "pw"));
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        <g opacity={lit(f, T(o, "w12"), 0.45)}><WaferTop cx={140} cy={206} r={104} glow={s12} /><text x={140} y={218} textAnchor="middle" style={zh(34, H.text, 900)}>12吋</text></g>
        <g opacity={lit(f, T(o, "w8"), 0.45)}><WaferTop cx={330} cy={236} r={70} glow={s8} /><text x={330} y={248} textAnchor="middle" style={zh(32, H.text, 900)}>8吋</text></g>
        <g opacity={lit(f, T(o, "w8"), 0.45)}><WaferTop cx={470} cy={252} r={54} glow={s8} /><text x={470} y={263} textAnchor="middle" style={zh(30, H.text, 900)}>6吋</text></g>
        <Sep x={546} />
        <g opacity={0.35 + 0.65 * s12}>
          <text x={576} y={CT + 46} style={zh(34, BLUE, 900)}>12 吋</text>
          <text x={576} y={CT + 92} style={zh(30, H.text, 900)}>先進邏輯、記憶體</text>
        </g>
        <g opacity={0.35 + 0.65 * Math.max(s8 * 0.6, pw)}>
          <text x={576} y={CT + 172} style={zh(34, "#B4530A", 900)}>8 吋、6 吋</text>
          <text x={576} y={CT + 218} style={zh(30, H.text, 900)}>多做功率晶片</text>
        </g>
      </svg>
    </Card>
  );
};

// ── w2-co：台灣四家（左：名單，念到的那家亮）｜右：角色兩行＋2025 營收長條 ──
type Co = { id: string; name: string; code: string; flags: string[]; logo: string; l1: string; l2: string; rev: number; revT: string; cues: [string, string, string, string] };
const COS: Co[] = [
  { id: "gw", name: "環球晶", flags: ["TW"], logo: "globalwafers", code: "6488", l1: "台灣最大", l2: "全球五大之一", rev: 606, revT: "606 億元", cues: ["gw", "gw", "top5", "rev"] },
  { id: "fst", name: "台勝科", flags: ["TW", "JP"], logo: "fst", code: "3532", l1: "台塑＋日本勝高合資", l2: "12吋逾七成（公司說法）", rev: 123, revT: "123 億元", cues: ["fst", "jv", "p70", "p70"] },
  { id: "ww", name: "合晶", flags: ["TW"], logo: "waferworks", code: "6182", l1: "6吋、8吋為主", l2: "功率元件；擴 12 吋", rev: 98, revT: "約 98 億元", cues: ["ww", "p68", "x12", "x12"] },
  { id: "epi", name: "嘉晶", flags: ["TW"], logo: "episil", code: "3016", l1: "專業磊晶廠", l2: "矽、碳化矽、氮化鎵", rev: 39, revT: "39 億元", cues: ["epi", "epi", "sic", "gan"] },
];
const CoCard: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330;
  const focus = String((o as any).focus ?? "gw"), fi = Math.max(0, COS.findIndex((c) => c.id === focus)), c = COS[fi];
  const a0 = on(f, T(o, c.cues[0])), a1 = on(f, T(o, c.cues[1])), a2 = on(f, T(o, c.cues[2])), a3 = Math.max(0.55 * on(f, T(o, c.cues[0]), 18), cl((f - T(o, c.cues[3])) / 24));   // 審片 W3：一進場營收條就先長到 55%，念到營收補滿
  const BW = 400;
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        {COS.map((r, j) => { const y = CT + 46 + j * 60, me = j === fi, op = me ? 0.4 + 0.6 * a0 : j < fi ? 0.6 : 0.35, act = me && a0 > 0.5, sc = me ? 1 + 0.08 * a0 : 1;
          // 2026/11/24 審片規則：國旗、LOGO 全程 100% 不透明；未輪到＝細灰框，輪到＝粗色框＋放大（文字照舊變淡）
          const lw = hasLogo(r.logo) ? Math.min(140, logoW(r.logo, 26)) : 0, lh = lw ? Math.round(26 * lw / logoW(r.logo, 26)) : 0, fw = r.flags.length * 46 - 6;
          return <g key={r.id}>
            {me ? <rect x={26} y={y - 40} width={410} height={54} fill={H.amber} opacity={0.28 * a0} /> : null}
            <g opacity={op}><text x={130} y={y} style={zh(34, H.text, 900)}>{r.name}</text>
              <text x={242} y={y} style={zh(26, H.text2, 800)}>{r.code}</text></g>
            <g transform={`translate(${34 + fw / 2} ${y - 19}) scale(${sc}) translate(${-(34 + fw / 2)} ${-(y - 19)})`}>
              <rect x={30} y={y - 36} width={fw + 8} height={34} fill="none" stroke={act ? H.amber : H.lineSoft} strokeWidth={act ? 4 : 1.5} />
              {r.flags.map((fl, q) => <Flag key={fl} code={fl} h={26} x={34 + q * 46} y={y - 32} asSvg />)}</g>
            {lw ? <g transform={`translate(${317 + lw / 2} ${y - 19}) scale(${sc}) translate(${-(317 + lw / 2)} ${-(y - 19)})`}>
              <rect x={312} y={y - 19 - lh / 2 - 4} width={lw + 10} height={lh + 8} fill="#FFFFFF" stroke={act ? H.amber : H.lineSoft} strokeWidth={act ? 4 : 1.5} /><LogoSvg id={r.logo} x={317} y={y - 19 - lh / 2} h={lh} /></g> : null}
          </g>; })}
        <Sep x={466} />
        <text x={496} y={CT + 46} style={zh(34, H.text, 900)} opacity={0.6 + 0.4 * a1}>{c.l1}</text>
        <text x={496} y={CT + 100} style={zh(30, H.text, 800)} opacity={0.6 + 0.4 * a2}>{c.l2}</text>
        <g opacity={0.7 + 0.3 * a3}>
          <text x={496} y={CT + 166} style={zh(30, H.text2, 800)}>2025 營收</text>
          <text x={W - 30} y={CT + 166} textAnchor="end" style={zh(32, BLUE, 900)}>{c.revT}</text>
          <rect x={496} y={CT + 190} width={BW} height={34} fill="#FFFFFF" stroke={H.lineSoft} strokeWidth={3} />
          <rect x={498} y={CT + 192} width={Math.max(2, (BW - 4) * (c.rev / 606) * EASE.move(a3))} height={30} fill={BLUE} />
        </g>
      </svg>
    </Card>
  );
};

// ── w2-next：晶圓備好了 → 電路怎麼印上去？ → 光罩（下一集）；留言「磊晶」 ──
const Next: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330;
  const items: [string, string, string, string][] = [["晶圓", "備好了", "ready", OK], ["電路", "怎麼印上去？", "print", BLUE], ["光罩", "晶片的底片", "mask", H.amber]];
  const kw = on(f, T(o, "kw")), nx = on(f, T(o, "next"));
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        {items.map(([a, b, id, c], j) => { const x = 30 + j * 312, l = lit(f, T(o, id), 0.4), hl = f >= T(o, id) && f < T(o, "kw");
          return <g key={j} opacity={l}>
            <rect x={x} y={CT + 6} width={262} height={118} fill={hl ? c : H.cardCompare} stroke={c} strokeWidth={hl ? 5 : 3} />
            <text x={x + 131} y={CT + 56} textAnchor="middle" style={zh(40, hl ? "#FFFFFF" : H.text, 900)}>{a}</text>
            <text x={x + 131} y={CT + 104} textAnchor="middle" style={zh(sm(30), hl ? "#FFFFFF" : H.text2, 800)}>{b}</text>
          </g>; })}
        <text x={W / 2} y={238} textAnchor="middle" style={zh(34, H.text, 900)} opacity={0.3 + 0.7 * nx}>下一集：光罩-1</text>
        <g opacity={kw} transform={`translate(${W / 2} 288) rotate(-2) scale(${1 + 0.3 * (1 - kw)})`}>
          <rect x={-220} y={-32} width={440} height={64} fill={H.amber} /><text x={0} y={14} textAnchor="middle" style={zh(38, onC(H.amber), 900)}>留言「磊晶」拿完整資料</text>
        </g>
      </svg>
    </Card>
  );
};

export const EpiSection: React.FC<P> = (p) => {
  const kd = String((p.o as any).kind);
  if (kd === "w2-hook") return <Hook {...p} />;
  if (kd === "w2-pol") return <Pol {...p} />;
  if (kd === "w2-cvd") return <Cvd {...p} />;
  if (kd === "w2-grow") return <Grow {...p} />;
  if (kd === "w2-dope") return <Dope {...p} />;
  if (kd === "w2-size") return <Size {...p} />;
  if (kd === "w2-co") return <CoCard {...p} />;
  if (kd === "w2-next") return <Next {...p} />;
  return null;
};

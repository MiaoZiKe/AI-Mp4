// 2026/11/23 tech-mask1：光罩-1 的 2D 示意卡（overlay `section` 的 kind 以 "mk1-" 開頭，Hud.tsx 的 HudSection 轉過來）。
//   mk1-hook 光→光罩（底片）→晶圓｜mk1-cr 石英＋鉻剖面｜mk1-duv 鉻擋光、玻璃透光（光斷開）｜mk1-x4 光罩圖案 ÷4 到晶圓｜
//   mk1-euv 深紫外光穿過玻璃、極紫外光被吃掉｜mk1-ml 鉬／矽多層膜反射（約 40 對）｜mk1-abs 吸收層：蓋到不反光｜
//   mk1-pel 護膜：灰塵不在焦點上｜mk1-cost 幾十片、上千萬美元｜mk1-co 空白光罩構造＋豪雅、AGC｜mk1-next 下一集＋留言「光罩」
// 全部示意；結構一開始就畫出（不留空框），念到時該處亮起、動起來；時間全部來自 script.json 的 t（cue）。
// 光＝直線光束（lessons 54：DUV 藍、EUV 紫），被鉻／吸收層擋住處斷開；光束用虛線往前跑表示行進方向。
// 排版原則（card-overlap.mjs 檢查）：內容從 CARD_CONTENT_TOP 以下；字不放進會動的圖形範圍；欄間 ≥24px；分隔線不穿字；字 ≥30px。
import React from "react";
import { FONT_ZH } from "../../theme";
import { H, L, sm, CARD_HEAD, CARD_CONTENT_TOP, cardTitleBox } from "./hudSkin";
import { EASE, tween } from "../anim";
import type { Model3D, Overlay3D } from "./engine";

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
const lit = (f: number, at: number, lo = 0.4) => lo + (1 - lo) * tween(f, at, 10, EASE.enter);
const on = (f: number, at: number, d = 10) => tween(f, at, d, EASE.enter);
const cl = (x: number) => Math.min(1, Math.max(0, x));
const QZ = "#CFE3F6", QZ_D = "#8FB3D9", CR = "#3A3F48", DUV = "#2F6BFF", EUV = "#8B5CF6", MO = "#4E5A70", SI = "#C3CFE2", ULE = "#E7D7BE", RU = "#C9B79C",
  ABS = "#262A31", RESIST = "#E8A23A", MIRROR = "#C8D5EA", RED = "#E0472F", OK = "#14A38B", HOT = "#FF7A2F", DUST = "#7B6F60", CAB = "#4A5873";
const Sep: React.FC<{ x: number; y0?: number; y1?: number }> = ({ x, y0 = CT + 4, y1 = 316 }) => <line x1={x} y1={y0} x2={x} y2={y1} stroke={H.lineSoft} strokeWidth={3} />;
const Arrow: React.FC<{ x1: number; y1: number; x2: number; y2: number; c: string; w?: number; o?: number }> = ({ x1, y1, x2, y2, c, w = 5, o = 1 }) => {
  const a = Math.atan2(y2 - y1, x2 - x1), s = w * 2.6;
  return <g opacity={o}><path d={`M${x1} ${y1} L${x2 - Math.cos(a) * s * 0.8} ${y2 - Math.sin(a) * s * 0.8}`} stroke={c} strokeWidth={w} />
    <path d={`M${x2} ${y2} L${x2 - Math.cos(a) * s - Math.sin(a) * s * 0.6} ${y2 - Math.sin(a) * s + Math.cos(a) * s * 0.6} L${x2 - Math.cos(a) * s + Math.sin(a) * s * 0.6} ${y2 - Math.sin(a) * s - Math.cos(a) * s * 0.6} Z`} fill={c} /></g>;
};
const Check: React.FC<{ x: number; y: number; o?: number }> = ({ x, y, o = 1 }) => <path opacity={o} d={`M${x - 20} ${y} l14 14 l28 -30`} stroke={OK} strokeWidth={8} fill="none" />;
const Cross: React.FC<{ x: number; y: number; o?: number; s?: number }> = ({ x, y, o = 1, s = 12 }) => <path opacity={o} d={`M${x - s} ${y - s} L${x + s} ${y + s} M${x + s} ${y - s} L${x - s} ${y + s}`} stroke={RED} strokeWidth={6} />;
/** 文字列（右欄條列）：念到才亮，前面加色塊 */
const Row: React.FC<{ x: number; y: number; t: string; c: string; a: number; px?: number }> = ({ x, y, t, c, a, px = 32 }) => (
  <g opacity={0.35 + 0.65 * a}><rect x={x} y={y - px * 0.72} width={12} height={px * 0.72} fill={c} /><text x={x + 24} y={y} style={zh(px, H.text, 900)}>{t}</text></g>
);
/** 光束：一條直線＋往前跑的虛線（行進方向）。a＝亮度 */
const Beam: React.FC<{ x1: number; y1: number; x2: number; y2: number; c: string; a: number; f: number; w?: number }> = ({ x1, y1, x2, y2, c, a, f, w = 7 }) => (
  <g opacity={a}>
    <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={c} strokeWidth={w} opacity={0.35} />
    <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={c} strokeWidth={w * 0.55} strokeDasharray="14 12" strokeDashoffset={-f * 2.2} />
  </g>
);

// ── mk1-hook：光 → 光罩（底片，鉻擋住一部分）→ 晶圓上印出縮小的圖案 ──
const Hook: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330;
  const ch = on(f, T(o, "chip")), li = on(f, T(o, "light")), fi = on(f, T(o, "film")), mk = on(f, T(o, "mask"));
  const lanes = [0, 1, 2, 3, 4, 5, 6].map((j) => 100 + j * 32), C0 = 196;
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        <rect x={120} y={CT + 8} width={152} height={26} fill={CAB} />
        {lanes.map((x, j) => <Beam key={`a${j}`} x1={x} y1={CT + 40} x2={x} y2={156} c={DUV} a={0.25 + 0.75 * li} f={f} w={6} />)}
        <rect x={76} y={158} width={240} height={22} fill={QZ} stroke={QZ_D} strokeWidth={2} opacity={lit(f, T(o, "mask"), 0.5)} />
        {lanes.map((x, j) => (j % 2 ? <rect key={`c${j}`} x={x - 12} y={180} width={24} height={9} fill={CR} /> : null))}
        {lanes.map((x, j) => (j % 2 ? null : <Beam key={`b${j}`} x1={x} y1={192} x2={C0 + (x - C0) / 4} y2={280} c={DUV} a={0.25 + 0.75 * li} f={f} w={5} />))}
        <rect x={116} y={282} width={160} height={6} fill={RESIST} />
        <rect x={116} y={288} width={160} height={12} fill={MIRROR} stroke={QZ_D} strokeWidth={2} />
        {lanes.map((x, j) => (j % 2 ? null : <rect key={`e${j}`} x={C0 + (x - C0) / 4 - 3} y={282} width={6} height={6} fill={DUV} opacity={fi} />))}
        <Sep x={360} />
        <Row x={392} y={130} t="晶片電路" c={DUV} a={ch} />
        <Row x={392} y={196} t="用光照著底片印上去" c={DUV} a={Math.max(li, fi) * 0.5 + fi * 0.5} />
        <g opacity={0.3 + 0.7 * mk}><rect x={392} y={228} width={300} height={62} fill={H.amber} /><text x={542} y={272} textAnchor="middle" style={zh(38, onC(H.amber), 900)}>底片＝光罩</text></g>
      </svg>
    </Card>
  );
};

// ── mk1-cr：石英玻璃（透光）＋下面一層鉻（擋光），電路＝鉻刻出的形狀 ──
const Cr: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330;
  const q = on(f, T(o, "quartz")), c = on(f, T(o, "cr")), p = on(f, T(o, "pat"));
  const gaps = [96, 176, 256, 336];
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        <g opacity={lit(f, T(o, "quartz"), 0.45)}>
          <rect x={40} y={CT + 26} width={400} height={104} fill={QZ} stroke={QZ_D} strokeWidth={3} />
          <text x={240} y={CT + 92} textAnchor="middle" style={zh(34, H.text, 900)}>石英玻璃</text>
        </g>
        <g opacity={lit(f, T(o, "cr"), 0.4)}>
          <rect x={40} y={CT + 130} width={400} height={22} fill={CR} />
          {gaps.map((x, j) => <rect key={j} x={x} y={CT + 130} width={28} height={22} fill={p > 0.05 ? "#FFF6D0" : H.cardCompare} stroke={p > 0.05 ? DUV : "none"} strokeWidth={3} />)}
        </g>
        <text x={40} y={CT + 210} style={zh(32, H.text, 900)} opacity={0.35 + 0.65 * c}>鉻（下面那層）</text>
        <text x={40} y={CT + 250} style={zh(sm(30), H.text2, 800)} opacity={0.35 + 0.65 * p}>開口＝電路的形狀</text>
        <Sep x={470} />
        <Row x={500} y={130} t="石英：讓光穿過" c={QZ_D} a={q} />
        <Row x={500} y={200} t="鉻：把光擋住" c={CR} a={c} />
        <Row x={500} y={270} t="電路刻在鉻上" c={H.amber} a={p} />
        <text x={500} y={312} style={zh(sm(30), H.text2, 700)} opacity={0.35 + 0.65 * q}>整片約 6 吋見方</text>
      </svg>
    </Card>
  );
};

// ── mk1-duv：光照下來 → 鉻擋住的地方光斷開、開口的地方穿過 → 圖案跟著光下去 ──
const Duv: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330;
  const d = on(f, T(o, "duv")), b = on(f, T(o, "block")), p = on(f, T(o, "pass")), ca = on(f, T(o, "carry"));
  const lanes = Array.from({ length: 9 }, (_, j) => 64 + j * 56);
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        {lanes.map((x, j) => <Beam key={`a${j}`} x1={x} y1={CT + 10} x2={x} y2={150} c={DUV} a={0.2 + 0.8 * d} f={f} />)}
        <rect x={36} y={150} width={500} height={34} fill={QZ} stroke={QZ_D} strokeWidth={2} opacity={0.85} />
        {lanes.map((x, j) => (j % 2 ? <rect key={`c${j}`} x={x - 22} y={184} width={44} height={14} fill={CR} /> : null))}
        {lanes.map((x, j) => (j % 2 ? <Cross key={`x${j}`} x={x} y={222} s={10} o={b} /> : <Beam key={`b${j}`} x1={x} y1={200} x2={x} y2={306} c={DUV} a={0.15 + 0.85 * p} f={f} />))}
        <Sep x={566} />
        <Row x={594} y={140} t="鉻：光斷開" c={RED} a={b} />
        <Row x={594} y={212} t="玻璃：光穿過" c={DUV} a={p} />
        <Row x={594} y={284} t="圖案跟著光下去" c={H.amber} a={ca} />
      </svg>
    </Card>
  );
};

// ── mk1-x4：光罩上的圖案（大）→ 鏡頭 → 晶圓上的圖案（小 4 倍） ──
const X4: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330;
  const le = on(f, T(o, "lens")), x4 = cl((f - T(o, "x4")) / 24), wa = on(f, T(o, "wafer"));
  const s = 1 - 0.75 * EASE.move(x4);
  const bars = (cx: number, cy: number, sc: number, c: string, op: number) => [-2, -1, 0, 1, 2].map((j) => <rect key={j} x={cx + j * 40 * sc - 9 * sc} y={cy - 80 * sc} width={18 * sc} height={160 * sc} fill={c} opacity={op} />);
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        <rect x={40} y={CT + 14} width={220} height={190} fill={QZ} stroke={QZ_D} strokeWidth={3} />
        {bars(150, CT + 109, 1, DUV, 0.85)}
        <text x={40} y={312} style={zh(32, H.text, 900)}>光罩：大 4 倍</text>
        <Arrow x1={284} y1={CT + 109} x2={384} y2={CT + 109} c={H.amber} w={7} o={0.35 + 0.65 * le} />
        <text x={334} y={CT + 72} textAnchor="middle" style={zh(40, H.amber, 900)} opacity={0.35 + 0.65 * x4}>÷4</text>
        <text x={334} y={CT + 162} textAnchor="middle" style={zh(sm(30), H.text2, 800)} opacity={0.35 + 0.65 * le}>鏡頭</text>
        <circle cx={480} cy={CT + 109} r={76} fill={MIRROR} stroke={QZ_D} strokeWidth={3} />
        <circle cx={480} cy={CT + 109} r={70} fill={RESIST} opacity={0.45} />
        <g opacity={0.25 + 0.75 * Math.max(x4, wa)}>{bars(480, CT + 109, Math.max(0.25, s), DUV, 1)}</g>
        <text x={420} y={312} style={zh(32, H.text, 900)} opacity={0.35 + 0.65 * wa}>晶圓上</text>
        <Sep x={588} />
        <Row x={616} y={140} t="經過鏡頭" c={H.amber} a={le} />
        <Row x={616} y={212} t="縮小四倍" c={H.amber} a={on(f, T(o, "x4"))} />
        <Row x={616} y={284} t="印到晶圓上" c={DUV} a={wa} />
      </svg>
    </Card>
  );
};

// ── mk1-euv：深紫外光（193 奈米）穿過玻璃｜極紫外光（13.5 奈米）在表面被吃掉 ──
const Euv: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330;
  const e = on(f, T(o, "euv")), ea = on(f, T(o, "eat")), no = on(f, T(o, "no"));
  const glow = 10 + 4 * Math.sin(f * 0.4);
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        <text x={40} y={CT + 36} style={zh(32, H.text, 900)}>深紫外光</text>
        <text x={226} y={CT + 36} style={zh(sm(30), H.text2, 800)}>193 奈米</text>
        <rect x={110} y={164} width={190} height={80} fill={QZ} stroke={QZ_D} strokeWidth={3} />
        <Beam x1={205} y1={CT + 52} x2={205} y2={310} c={DUV} a={0.9} f={f} w={9} />
        <text x={322} y={232} style={zh(32, OK, 900)}>穿過</text>
        <Check x={360} y={278} />
        <Sep x={470} />
        <g opacity={lit(f, T(o, "euv"), 0.4)}>
          <text x={500} y={CT + 36} style={zh(32, H.text, 900)}>極紫外光</text>
          <text x={686} y={CT + 36} style={zh(sm(30), H.text2, 800)}>13.5 奈米</text>
          <rect x={570} y={164} width={190} height={80} fill={QZ} stroke={QZ_D} strokeWidth={3} />
          <Beam x1={665} y1={CT + 52} x2={665} y2={164} c={EUV} a={0.3 + 0.7 * e} f={f} w={9} />
          <circle cx={665} cy={166} r={glow * ea} fill={HOT} opacity={0.6 * ea} />
          <rect x={570} y={164} width={190} height={14} fill={HOT} opacity={0.35 * ea} />
          <text x={782} y={212} style={zh(32, RED, 900)} opacity={0.3 + 0.7 * ea}>被吃掉</text>
          <Cross x={665} y={282} s={14} o={no} />
          <text x={700} y={296} style={zh(32, RED, 900)} opacity={0.3 + 0.7 * no}>穿不過去</text>
        </g>
      </svg>
    </Card>
  );
};

// ── mk1-ml：鉬／矽交錯疊（示意 10 對，實際約 40 對），每一層界面反射一點，加起來像鏡子 ──
const Ml: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330;
  const r = on(f, T(o, "refl")), mo = on(f, T(o, "mo")), n40 = cl((f - T(o, "n40")) / 30), mi = on(f, T(o, "mirror"));
  const NP = 10, PH = 14, Y0 = 162;
  const layers: React.ReactNode[] = [];
  for (let j = 0; j < NP; j++) {
    layers.push(<rect key={`m${j}`} x={40} y={Y0 + j * PH} width={440} height={6} fill={MO} />);
    layers.push(<rect key={`s${j}`} x={40} y={Y0 + j * PH + 6} width={440} height={8} fill={SI} />);
  }
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        <g opacity={lit(f, T(o, "mo"), 0.5)}>{layers}</g>
        <rect x={40} y={Y0 + NP * PH} width={440} height={6} fill={ULE} />
        <Beam x1={70} y1={CT + 16} x2={250} y2={Y0 - 2} c={EUV} a={0.3 + 0.7 * r} f={f} w={8} />
        {[0, 1, 2, 3].map((j) => <line key={j} x1={250 + j * 8} y1={Y0 + j * PH} x2={250 + j * 8 + 70} y2={Y0 + j * PH - 60} stroke={EUV} strokeWidth={3} opacity={(0.6 - j * 0.12) * mo} />)}
        <Beam x1={252} y1={Y0 - 2} x2={432} y2={CT + 16} c={EUV} a={0.15 + 0.85 * mi} f={f} w={8} />
        <Sep x={508} />
        <Row x={536} y={132} t="鉬＋矽 交錯疊" c={MO} a={mo} />
        <g opacity={0.35 + 0.65 * on(f, T(o, "n40"))}>
          <text x={560} y={214} style={zh(46, EUV, 900)}>{`約 ${Math.round(40 * EASE.move(n40))} 對`}</text>
          <text x={760} y={214} style={zh(sm(30), H.text2, 800)}>（圖為示意）</text>
        </g>
        <Row x={536} y={284} t="像鏡子把光彈回去" c={EUV} a={mi} />
      </svg>
    </Card>
  );
};

// ── mk1-abs：吸收層蓋住的地方光被吸掉，沒蓋到的地方反射 → 反射光帶著圖案 ──
const Abs: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330;
  const a = on(f, T(o, "abs")), d = on(f, T(o, "dark")), p = on(f, T(o, "pattern"));
  const AB = [[96, 60], [236, 60], [376, 60]];
  const HITS = [70, 126, 196, 266, 336, 406];
  const isAbs = (x: number) => AB.some(([ax, w]) => x >= ax && x <= ax + w);
  const YS = 226, YA = 190;
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        {Array.from({ length: 6 }, (_, j) => <g key={j}><rect x={40} y={YS + j * 12} width={440} height={5} fill={MO} /><rect x={40} y={YS + j * 12 + 5} width={440} height={7} fill={SI} /></g>)}
        <rect x={40} y={YS + 72} width={440} height={10} fill={ULE} />
        <rect x={40} y={YS - 4} width={440} height={4} fill={RU} />
        {AB.map(([x, w], j) => <rect key={j} x={x} y={YA} width={w} height={YS - 4 - YA} fill={ABS} opacity={lit(f, T(o, "abs"), 0.6)} />)}
        {HITS.map((x, j) => {
          const blk = isAbs(x), yh = blk ? YA : YS - 4, dx = 34;
          return <g key={j}>
            <Beam x1={x - dx * ((yh - (CT + 16)) / 100)} y1={CT + 16} x2={x} y2={yh} c={EUV} a={0.85} f={f} w={6} />
            {blk ? <circle cx={x} cy={yh} r={8} fill={HOT} opacity={0.7 * d} /> : <Beam x1={x} y1={yh} x2={x + dx * ((yh - (CT + 16)) / 100)} y2={CT + 16} c={EUV} a={0.2 + 0.8 * p} f={f} w={6} />}
          </g>;
        })}
        <Sep x={508} />
        <Row x={536} y={132} t="吸收層畫電路" c={ABS} a={a} />
        <Row x={536} y={204} t="蓋到：不反光" c={RED} a={d} />
        <Row x={536} y={276} t="反射光帶著圖案" c={EUV} a={p} />
      </svg>
    </Card>
  );
};

// ── mk1-pel：光聚焦在光罩圖案上；護膜架在上方，灰塵落在膜上 → 不在焦點，影子糊掉印不出來 ──
const Pel: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330;
  const pe = on(f, T(o, "pel")), du = cl((f - T(o, "dust")) / 16), fo = on(f, T(o, "focus")), no = on(f, T(o, "no"));
  const YF = 140, YM = 226, dy = YF - 9 - (1 - EASE.move(du)) * 50;
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        <Beam x1={170} y1={CT + 12} x2={258} y2={YM} c={DUV} a={0.3 + 0.7 * fo} f={f} w={6} />
        <Beam x1={346} y1={CT + 12} x2={262} y2={YM} c={DUV} a={0.3 + 0.7 * fo} f={f} w={6} />
        <rect x={60} y={YM} width={400} height={30} fill={QZ} stroke={QZ_D} strokeWidth={2} />
        <rect x={60} y={YM} width={400} height={6} fill={CR} />
        <g opacity={lit(f, T(o, "pel"), 0.45)}>
          <rect x={76} y={YF} width={12} height={YM - YF} fill="#A9B6CA" />
          <rect x={432} y={YF} width={12} height={YM - YF} fill="#A9B6CA" />
          <rect x={76} y={YF - 3} width={368} height={4} fill={QZ_D} />
        </g>
        <circle cx={330} cy={dy} r={8} fill={DUST} opacity={du > 0 ? 1 : 0} />
        <circle cx={348} cy={YM + 15} r={26} fill={DUST} opacity={0.18 * no} />
        <circle cx={260} cy={YM} r={7 + 3 * Math.sin(f * 0.35)} fill={H.amber} opacity={0.5 + 0.5 * fo} />
        <text x={60} y={306} style={zh(sm(30), H.text2, 800)} opacity={0.35 + 0.65 * fo}>焦點在圖案上</text>
        <Sep x={494} />
        <Row x={522} y={132} t="護膜架在上方" c={"#A9B6CA"} a={pe} />
        <Row x={522} y={204} t="灰塵落在膜上" c={DUST} a={on(f, T(o, "dust"))} />
        <Row x={522} y={276} t="對不到焦，印不出來" c={OK} a={Math.max(fo * 0.5, no)} />
      </svg>
    </Card>
  );
};

// ── mk1-cost：一疊光罩（幾十片）、一片有缺陷就不能用｜一整套上千萬美元 ──
const Cost: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330;
  const ma = cl((f - T(o, "many")) / 40), de = on(f, T(o, "def"));
  const N = 14, shown = Math.round(N * (0.3 + 0.7 * EASE.move(ma)));
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        {Array.from({ length: shown }, (_, j) => <g key={j}><path d={`M${50} ${298 - j * 15} l120 0 l40 -12 l-120 0 Z`} fill={QZ} stroke={QZ_D} strokeWidth={2} />
          <path d={`M${84} ${292 - j * 15} l60 0 l14 -4 l-60 0 Z`} fill={CR} /></g>)}
        <circle cx={140} cy={298 - (shown - 1) * 15 - 6} r={6} fill={RED} opacity={de * (0.6 + 0.4 * Math.sin(f * 0.4))} />
        <text x={236} y={CT + 52} style={zh(42, H.text, 900)} opacity={0.35 + 0.65 * on(f, T(o, "many"))}>幾十片</text>
        <text x={236} y={CT + 96} style={zh(sm(30), H.text2, 800)}>約 60～100 片</text>
        <text x={236} y={CT + 134} style={zh(sm(30), H.text2, 800)}>（估計）</text>
        <text x={236} y={284} style={zh(32, RED, 900)} opacity={0.3 + 0.7 * de}>片片不能有缺陷</text>
        <Sep x={492} />
        <g opacity={lit(f, T(o, "cost"), 0.35)}>
          <text x={520} y={CT + 48} style={zh(32, H.text, 900)}>一整套</text>
          <text x={520} y={CT + 128} style={zh(56, H.amber, 900)}>上千萬美元</text>
          <text x={520} y={CT + 186} style={zh(sm(30), H.text2, 800)}>7 奈米起每套</text>
          <text x={520} y={CT + 226} style={zh(sm(30), H.text2, 800)}>超過 1,000 萬美元（估計）</text>
        </g>
      </svg>
    </Card>
  );
};

// ── mk1-co：空白光罩（還沒畫圖）的層｜極紫外光用的幾乎都來自日本兩家：豪雅、AGC（旭硝子） ──
const Co: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330;
  const bl = on(f, T(o, "blank")), pa = on(f, T(o, "paper")), eu = on(f, T(o, "euv")), jp = on(f, T(o, "jp"));
  const ex = 22 * EASE.move(cl((f - T(o, "paper")) / 22));
  const lay: [number, number, string, string][] = [[CT + 14, 14, ABS, "吸收層（整片）"], [CT + 34, 8, RU, ""], [CT + 48, 44, "ML", "鉬／矽多層膜"], [CT + 98, 56, ULE, "玻璃基板"], [CT + 160, 8, "#6E6A62", ""]];
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        <g opacity={lit(f, T(o, "blank"), 0.4)}>
          {lay.map(([y, h, c, t], j) => { const yy = y + ex * j * 0.35;
            return <g key={j}>
              {c === "ML" ? Array.from({ length: 5 }, (_, q) => <g key={q}><rect x={40} y={yy + q * 9} width={170} height={4} fill={MO} /><rect x={40} y={yy + q * 9 + 4} width={170} height={5} fill={SI} /></g>) : <rect x={40} y={yy} width={170} height={h} fill={c} />}
              {t ? <text x={232} y={yy + Math.min(h, 30) / 2 + 12} style={zh(sm(30), H.text2, 800)}>{t}</text> : null}
            </g>; })}
        </g>
        <text x={40} y={300} style={zh(32, H.amber, 900)} opacity={0.3 + 0.7 * pa}>還沒畫圖＝白紙</text>
        <Sep x={478} />
        <text x={506} y={CT + 36} style={zh(sm(30), H.text2, 800)} opacity={0.35 + 0.65 * eu}>極紫外光用的空白光罩</text>
        {([["豪雅", "HOYA", "hoya"], ["旭硝子", "AGC", "agc"]] as const).map(([a, b, id], j) => { const x = 506 + j * 220, hl = on(f, T(o, id));
          return <g key={id} opacity={0.35 + 0.65 * hl}>
            <rect x={x} y={CT + 56} width={196} height={124} fill={hl > 0.5 ? H.amber : H.cardCompare} stroke={H.amber} strokeWidth={4} />
            <text x={x + 98} y={CT + 108} textAnchor="middle" style={zh(40, hl > 0.5 ? onC(H.amber) : H.text, 900)}>{a}</text>
            <text x={x + 98} y={CT + 156} textAnchor="middle" style={zh(sm(30), hl > 0.5 ? onC(H.amber) : H.text2, 800)}>{b}</text>
          </g>; })}
        <text x={506} y={300} style={zh(32, H.text, 900)} opacity={0.3 + 0.7 * jp}>幾乎都來自日本這兩家</text>
      </svg>
    </Card>
  );
};

// ── mk1-next：白紙有了 → 誰把電路畫上去？怎麼送進工廠？→ 下一集光罩-2；留言「光罩」 ──
const Next: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330;
  const items: [string, string][] = [["誰把電路畫上去？", "who"], ["怎麼送進工廠？", "ship"]];
  const kw = on(f, T(o, "kw")), nx = on(f, T(o, "next"));
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        {items.map(([a, id], j) => { const x = 30 + j * 462, l = lit(f, T(o, id), 0.4), hl = f >= T(o, id) && f < T(o, "kw");
          return <g key={id} opacity={l}>
            <rect x={x} y={CT + 6} width={428} height={104} fill={hl ? DUV : H.cardCompare} stroke={DUV} strokeWidth={hl ? 5 : 3} />
            <text x={x + 214} y={CT + 72} textAnchor="middle" style={zh(38, hl ? "#FFFFFF" : H.text, 900)}>{a}</text>
          </g>; })}
        <text x={W / 2} y={230} textAnchor="middle" style={zh(34, H.text, 900)} opacity={0.3 + 0.7 * nx}>下一集：光罩-2</text>
        <g opacity={kw} transform={`translate(${W / 2} 284) rotate(-2) scale(${1 + 0.3 * (1 - kw)})`}>
          <rect x={-220} y={-32} width={440} height={64} fill={H.amber} /><text x={0} y={14} textAnchor="middle" style={zh(38, onC(H.amber), 900)}>留言「光罩」拿完整資料</text>
        </g>
      </svg>
    </Card>
  );
};

export const Mask1Section: React.FC<P> = (p) => {
  const kd = String((p.o as any).kind);
  if (kd === "mk1-hook") return <Hook {...p} />;
  if (kd === "mk1-cr") return <Cr {...p} />;
  if (kd === "mk1-duv") return <Duv {...p} />;
  if (kd === "mk1-x4") return <X4 {...p} />;
  if (kd === "mk1-euv") return <Euv {...p} />;
  if (kd === "mk1-ml") return <Ml {...p} />;
  if (kd === "mk1-abs") return <Abs {...p} />;
  if (kd === "mk1-pel") return <Pel {...p} />;
  if (kd === "mk1-cost") return <Cost {...p} />;
  if (kd === "mk1-co") return <Co {...p} />;
  if (kd === "mk1-next") return <Next {...p} />;
  return null;
};

// 2026/11/23 tech-resist1：光阻-1 的 2D 示意卡（overlay `section` 的 kind 以 "pr1-" 開頭，Hud.tsx 的 HudSection 轉過來）。
//   pr1-hook 晶圓→剖面→照到光就變｜pr1-what 感光高分子＋塗在晶圓上｜pr1-expose 光罩擋光、照到的長鏈斷開｜pr1-pos 正型顯影前後｜
//   pr1-neg 正型 vs 負型｜pr1-why 線越細光越不夠→化學放大｜pr1-pag 光酸產生劑照光放出酸｜pr1-peb 烘烤時一個酸沿鏈拆保護基、次數往上數｜
//   pr1-euv ArF 與 EUV 光子數（42 對 3＝約 1/14）｜pr1-stoch 落點不均→斷線、橋接｜pr1-mor 化學放大 vs 金屬氧化物吸光｜
//   pr1-co 供應商（以日本廠為主）｜pr1-tw 台灣：雲林新廠（媒體報導）｜pr1-next 下一集塗佈顯影機
// 全部示意；結構一開始就畫出（不留空框），念到時該處亮起、動起來；時間全部來自 script.json 的 t（cue）。
// 排版原則（card-overlap.mjs 檢查）：內容從 CARD_CONTENT_TOP 以下；字不放進圖形範圍、離圖形 ≥8px；欄間 ≥24px；分隔線不穿字；字 ≥30px。
import React from "react";
import { FONT_ZH } from "../../theme";
import { H, L, sm, CARD_HEAD, CARD_CONTENT_TOP, cardTitleBox } from "./hudSkin";
import { EASE, tween } from "../anim";
import type { Model3D, Overlay3D } from "./engine";
import { Flag, LogoSvg, hasLogo, twPath, twPt } from "./Brand";
import "./BrandWafer";

const zh = (px: number, color: string = H.text, w = 800): React.CSSProperties => ({ fontFamily: FONT_ZH, fontSize: sm(px), fill: color, color, fontWeight: w, whiteSpace: "nowrap" });
const onC = (bg: string) => (bg === H.amber ? ((H as any).onAmber ?? H.onAccent) : H.onAccent);
type P = { o: Overlay3D; f: number; k: number; m: Model3D };
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
const dim = (a: number, lo = 0.35) => lo + (1 - lo) * a;
const cl = (x: number) => Math.min(1, Math.max(0, x));
const SI = "#8E9BB3", FILM = "#3FB6C8", RES = "#E9A23B", RES_D = "#B9741A", LIT = "#FFE36A", CHAIN = "#8A4B12", PAC = "#2F7FE0", DEV = "#7FB8F2",
  DUV = "#4E6CFF", EUV = "#9B4DFF", PG = "#F2A33A", OH = "#14A38B", PAG = "#8E44D8", ACID = "#E0472F", HEAT = "#FF7A2F", CHROME = "#2B3038", NET = "#14A38B", BAD = "#D4231A", SN = "#9AA6B8";
const Sep: React.FC<{ x: number; y0?: number; y1?: number }> = ({ x, y0 = CT + 4, y1 = 316 }) => <line x1={x} y1={y0} x2={x} y2={y1} stroke={H.lineSoft} strokeWidth={3} />;
const Arrow: React.FC<{ x1: number; y1: number; x2: number; y2: number; c: string; w?: number; o?: number }> = ({ x1, y1, x2, y2, c, w = 5, o = 1 }) => {
  const a = Math.atan2(y2 - y1, x2 - x1), s = w * 2.6;
  return <g opacity={o}><path d={`M${x1} ${y1} L${x2 - Math.cos(a) * s * 0.8} ${y2 - Math.sin(a) * s * 0.8}`} stroke={c} strokeWidth={w} />
    <path d={`M${x2} ${y2} L${x2 - Math.cos(a) * s - Math.sin(a) * s * 0.6} ${y2 - Math.sin(a) * s + Math.cos(a) * s * 0.6} L${x2 - Math.cos(a) * s + Math.sin(a) * s * 0.6} ${y2 - Math.sin(a) * s - Math.cos(a) * s * 0.6} Z`} fill={c} /></g>;
};
const Pill: React.FC<{ x: number; y: number; t: string; c: string; a?: number }> = ({ x, y, t, c, a = 1 }) => {
  const w = t.length * sm(30) + 28;
  return <g opacity={a}><rect x={x} y={y} width={w} height={44} rx={22} fill="#FFFFFF" stroke={c} strokeWidth={3} /><text x={x + w / 2} y={y + 33} textAnchor="middle" style={zh(30, c, 800)}>{t}</text></g>;
};

/** 光阻剖面：基板＋薄膜＋光阻 n 欄（每欄有長鏈）。exp＝哪幾欄照到光；brk＝斷鏈 0–1；yel＝照到的欄變黃 0–1；gone＝每欄消失 0–1；net＝交聯 0–1 */
const Stack: React.FC<{ x: number; y: number; w: number; n?: number; exp?: number[]; brk?: number; yel?: number; gone?: (c: number) => number; net?: number; f?: number; rh?: number }> =
  ({ x, y, w, n = 7, exp = [1, 3, 5], brk = 0, yel = 0, gone = () => 0, net = 0, f = 0, rh = 56 }) => {
  const cw = w / n, fh = 14, sh = 34;
  const cols: React.ReactNode[] = [];
  for (let c = 0; c < n; c++) {
    const e = exp.includes(c), g = gone(c);
    if (g >= 1) continue;
    const cx = x + c * cw, op = 1 - g;
    const fill = e ? mix(RES, LIT, yel) : RES;
    const rows: React.ReactNode[] = [];
    for (let r = 0; r < 3; r++) {
      const ry = y + 12 + r * ((rh - 22) / 2);
      for (let b = 0; b < 4; b++) {
        const bx = cx + 6 + b * ((cw - 12) / 3), jit = e ? brk * 2.5 * Math.sin(f * 0.9 + b + r * 2 + c) : 0;
        if (b < 3) {
          const nx = cx + 6 + (b + 1) * ((cw - 12) / 3);
          const broken = e && brk > 0.5 && b === 1;
          if (!broken) rows.push(<line key={`l${r}${b}`} x1={bx} y1={ry + jit} x2={nx} y2={ry + (e ? brk * 2.5 * Math.sin(f * 0.9 + b + 1 + r * 2 + c) : 0)} stroke={CHAIN} strokeWidth={3} />);
        }
        rows.push(<circle key={`b${r}${b}`} cx={bx} cy={ry + jit} r={4} fill={CHAIN} />);
      }
      if (e && net > 0 && r < 2) for (let b = 0; b < 4; b += 2) {
        const bx = cx + 6 + b * ((cw - 12) / 3);
        rows.push(<line key={`n${r}${b}`} x1={bx} y1={ry} x2={bx} y2={ry + (rh - 22) / 2} stroke={NET} strokeWidth={4} opacity={net} />);
      }
    }
    cols.push(<g key={c} opacity={op}><rect x={cx} y={y} width={cw + 0.5} height={rh} fill={fill} />{rows}</g>);
  }
  return <g>
    <rect x={x} y={y + rh + fh} width={w} height={sh} fill={SI} />
    <rect x={x} y={y + rh} width={w} height={fh} fill={FILM} />
    {cols}
  </g>;
};
const hex = (c: string) => [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16));
const mix = (a: string, b: string, t: number) => { const A = hex(a), B = hex(b); return `rgb(${A.map((v, i) => Math.round(v + (B[i] - v) * cl(t))).join(",")})`; };
/** 光罩：鉻條擋在不透光的欄上方 */
const Mask: React.FC<{ x: number; y: number; w: number; n?: number; exp?: number[] }> = ({ x, y, w, n = 7, exp = [1, 3, 5] }) => (
  <g><rect x={x} y={y} width={w} height={10} fill="#D6E6F8" stroke="#9FB3CF" strokeWidth={2} />
    {Array.from({ length: n }, (_, c) => (exp.includes(c) ? null : <rect key={c} x={x + c * (w / n)} y={y + 10} width={w / n} height={6} fill={CHROME} />))}</g>
);
/** 往下的光：透光欄一路到光阻、鉻條處停在光罩上 */
const Rays: React.FC<{ x: number; y0: number; yM: number; y1: number; w: number; n?: number; exp?: number[]; a: number; f: number; c?: string }> = ({ x, y0, yM, y1, w, n = 7, exp = [1, 3, 5], a, f, c = DUV }) => (
  <g opacity={a}>{Array.from({ length: n }, (_, k) => {
    const cx = x + (k + 0.5) * (w / n), end = exp.includes(k) ? y1 : yM - 2, d = ((f * 2.2 + k * 7) % 18);
    return <g key={k}><line x1={cx} y1={y0} x2={cx} y2={end} stroke={c} strokeWidth={5} strokeDasharray="10 8" strokeDashoffset={-d} /></g>;
  })}</g>
);

// ── pr1-hook：晶圓 → 放大剖面 → 照到光的那幾欄變了 ──
const Hook: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 300;
  const ch = on(f, T(o, "chip")), gl = on(f, T(o, "glue")), li = on(f, T(o, "light")), cg = on(f, T(o, "change"), 16);
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        <g opacity={dim(ch)}>
          <circle cx={130} cy={190} r={86} fill="#C8D5EA" stroke="#7F93B5" strokeWidth={3} />
          <circle cx={130} cy={190} r={80} fill={RES} opacity={0.75} />
          {Array.from({ length: 25 }, (_, j) => <rect key={j} x={130 - 62 + (j % 5) * 26} y={190 - 62 + Math.floor(j / 5) * 26} width={20} height={20} fill="#7FA4E0" opacity={0.45} />)}
          <rect x={176} y={150} width={40} height={40} fill="none" stroke={H.line} strokeWidth={3} />
        </g>
        <Arrow x1={226} y1={170} x2={292} y2={170} c={H.line} w={5} o={dim(gl)} />
        <g opacity={dim(gl)}>
          <Mask x={310} y={96} w={340} />
          <Rays x={310} y0={76} yM={96} y1={156} w={340} a={li} f={f} />
          <Stack x={310} y={160} w={340} yel={cg} brk={cg * 0.6} f={f} rh={50} />
        </g>
        <Sep x={680} />
        <text x={706} y={CT + 46} style={zh(32, H.text, 900)} opacity={dim(ch)}>晶片圖案</text>
        <text x={706} y={CT + 106} style={zh(32, H.text, 900)} opacity={dim(gl)}>先畫在膠上</text>
        <text x={706} y={CT + 166} style={zh(32, H.amber, 900)} opacity={dim(li)}>照到光</text>
        <text x={706} y={CT + 218} style={zh(32, H.amber, 900)} opacity={dim(cg)}>就會變</text>
      </svg>
    </Card>
  );
};

// ── pr1-what：感光的高分子長鏈＋感光成分；塗在晶圓上薄薄一層 ──
const What: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330;
  const pr = on(f, T(o, "pr")), po = on(f, T(o, "poly")), co = on(f, T(o, "coat"));
  const pts = Array.from({ length: 16 }, (_, i) => [52 + i * 30, 184 + (i % 2 ? -14 : 14)]);
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        <text x={40} y={CT + 44} style={zh(40, H.amber, 900)} opacity={dim(pr)}>光阻</text>
        <g opacity={dim(po)}>
          <polyline points={pts.map((p) => p.join(",")).join(" ")} fill="none" stroke={CHAIN} strokeWidth={5} />
          {pts.map(([x, y], i) => <circle key={i} cx={x} cy={y} r={9} fill={CHAIN} />)}
          {pts.filter((_, i) => i % 3 === 1).map(([x, y], i) => <g key={i}><line x1={x} y1={y} x2={x} y2={y - 34} stroke={CHAIN} strokeWidth={3} /><circle cx={x} cy={y - 40} r={9} fill={PAC} opacity={0.6 + 0.4 * Math.sin(f * 0.2 + i)} /></g>)}
        </g>
        <text x={40} y={296} style={zh(32, H.text, 900)} opacity={dim(po)}>長長的高分子＋感光成分</text>
        <Sep x={556} />
        <g opacity={dim(po)}><circle cx={600} cy={CT + 30} r={10} fill={PAC} /><text x={622} y={CT + 42} style={zh(30, H.text2, 800)}>感光成分</text>
          <circle cx={600} cy={CT + 82} r={10} fill={CHAIN} /><text x={622} y={CT + 94} style={zh(30, H.text2, 800)}>高分子長鏈</text></g>
        <g opacity={dim(co)}>
          <rect x={590} y={214} width={320} height={16} fill={RES} />
          <rect x={590} y={230} width={320} height={34} fill={SI} />
          <text x={590} y={304} style={zh(32, H.text, 900)}>薄薄塗在晶圓上</text>
        </g>
      </svg>
    </Card>
  );
};

// ── pr1-expose：光罩擋光；照到的欄長鏈斷開、變質（變黃） ──
const Expose: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330;
  const ma = on(f, T(o, "mask")), hi = on(f, T(o, "hit")), br = on(f, T(o, "break"), 14), al = on(f, T(o, "alter"), 16);
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        <g opacity={dim(ma)}><Mask x={40} y={110} w={600} /></g>
        <Rays x={40} y0={CT + 10} yM={110} y1={190} w={600} a={dim(hi, 0.25)} f={f} />
        <Stack x={40} y={196} w={600} brk={br} yel={al} f={f} rh={62} />
        <Sep x={670} />
        <text x={696} y={CT + 50} style={zh(32, H.text, 900)} opacity={dim(ma)}>光罩擋光</text>
        <text x={696} y={CT + 120} style={zh(32, DUV, 900)} opacity={dim(hi)}>照到的地方</text>
        <text x={696} y={CT + 190} style={zh(32, H.amber, 900)} opacity={dim(br)}>分子斷開</text>
        <text x={696} y={CT + 240} style={zh(32, H.amber, 900)} opacity={dim(al)}>變質</text>
      </svg>
    </Card>
  );
};

// ── pr1-pos：正型。顯影液蓋上 → 照到的欄溶掉 → 留下沒照到的 ──
const Pos: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330;
  const ps = on(f, T(o, "pos")), dv = on(f, T(o, "dev")), wa = cl((f - T(o, "wash")) / 30), kp = on(f, T(o, "keep"));
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        <text x={40} y={CT + 40} style={zh(32, H.line, 900)} opacity={dim(ps)}>正型・顯影前</text>
        <rect x={40} y={136} width={380} height={14} fill={DEV} opacity={dv} />
        <Stack x={40} y={152} w={380} yel={1} brk={1} f={f} rh={56} />
        <text x={40} y={300} style={zh(32, H.text, 900)} opacity={dim(dv)}>顯影液蓋上</text>
        <Arrow x1={444} y1={200} x2={500} y2={200} c={H.amber} w={6} o={dim(wa)} />
        <text x={524} y={CT + 40} style={zh(32, H.line, 900)} opacity={dim(wa)}>顯影後</text>
        <Stack x={524} y={152} w={380} yel={1} brk={1} f={f} rh={56} gone={(c) => ([1, 3, 5].includes(c) ? wa : 0)} />
        <text x={524} y={300} style={zh(32, H.amber, 900)} opacity={dim(kp)}>留下沒照到的</text>
      </svg>
    </Card>
  );
};

// ── pr1-neg：正型 vs 負型（同樣的光罩）；負型照到的連成網、洗完留下 ──
const Neg: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330;
  const ng = on(f, T(o, "neg")), nt = on(f, T(o, "net"), 16), st = cl((f - T(o, "stay")) / 30);
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        <text x={40} y={CT + 40} style={zh(32, H.line, 900)}>正型</text>
        <Stack x={40} y={140} w={380} gone={(c) => ([1, 3, 5].includes(c) ? 1 : 0)} rh={56} />
        <text x={40} y={300} style={zh(32, H.text, 900)}>照到的洗掉</text>
        <Sep x={476} />
        <text x={524} y={CT + 40} style={zh(32, H.amber, 900)} opacity={dim(ng)}>負型</text>
        <Stack x={524} y={140} w={380} yel={nt} net={nt} f={f} rh={56} gone={(c) => ([1, 3, 5].includes(c) ? 0 : st)} />
        <text x={524} y={300} style={zh(32, H.amber, 900)} opacity={dim(st)}>照到的留下</text>
        <g opacity={nt}><rect x={690} y={CT + 16} width={18} height={18} fill={NET} /><text x={718} y={CT + 36} style={zh(30, H.text2, 800)}>連成網</text></g>
      </svg>
    </Card>
  );
};

// ── pr1-why：線越細 → 進來的光越少 → 化學放大（一顆光子觸發很多次反應） ──
const Why: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330;
  const th = on(f, T(o, "thin")), wk = on(f, T(o, "weak")), ca = on(f, T(o, "car"));
  const pitch = 34 - 16 * EASE.move(cl((f - T(o, "thin")) / 40));
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        <g opacity={dim(th)}>
          <rect x={40} y={110} width={240} height={130} fill="#EEF3FB" />
          {Array.from({ length: Math.floor(230 / pitch) }, (_, i) => <rect key={i} x={46 + i * pitch} y={116} width={pitch * 0.5} height={118} fill={RES} />)}
          <text x={40} y={296} style={zh(32, H.text, 900)}>線越畫越細</text>
        </g>
        <Sep x={316} />
        <g opacity={dim(wk)}>
          <rect x={352} y={110} width={240} height={130} fill="#EEF3FB" />
          {Array.from({ length: 6 }, (_, i) => { const u = ((f * 0.03 + i / 6) % 1); return <circle key={i} cx={380 + (i * 37) % 190} cy={116 + u * 118} r={8} fill={DUV} opacity={0.4 + 0.6 * wk} />; })}
          <text x={352} y={296} style={zh(32, H.text, 900)}>光不夠用</text>
        </g>
        <Sep x={628} />
        <g opacity={dim(ca)}>
          <circle cx={688} cy={136} r={12} fill={DUV} />
          <Arrow x1={706} y1={136} x2={760} y2={136} c={H.amber} w={5} />
          {Array.from({ length: 12 }, (_, i) => <circle key={i} cx={786 + (i % 4) * 34} cy={116 + Math.floor(i / 4) * 40} r={11} fill={i < 12 * cl((f - T(o, "car")) / 24) ? OH : "#D5DDEA"} />)}
          <text x={664} y={250} style={zh(32, H.amber, 900)}>化學放大</text>
          <text x={664} y={300} style={zh(30, H.text2, 800)}>一顆光子，很多反應</text>
        </g>
      </svg>
    </Card>
  );
};

// ── pr1-pag：光子打中光酸產生劑 → 放出酸（H⁺） ──
const Pag: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330;
  const hv = on(f, T(o, "hv")), pg = on(f, T(o, "pag")), ac = on(f, T(o, "acid"), 14);
  const wave = Array.from({ length: 20 }, (_, i) => `${i ? "L" : "M"}${210 + Math.sin(i * 1.2 + f * 0.4) * 10} ${CT + 12 + i * 5}`).join(" ");
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        <path d={wave} stroke={DUV} strokeWidth={5} fill="none" opacity={dim(hv, 0.2)} />
        <g opacity={dim(pg)}>
          <circle cx={210} cy={210} r={36} fill={PAG} opacity={1 - 0.3 * ac} />
          {[0, 1, 2].map((j) => { const a = (Math.PI / 2) + (j * 2 * Math.PI) / 3; return <circle key={j} cx={210 + Math.cos(a) * 62} cy={210 + Math.sin(a) * 62} r={20} fill="#B98AE8" />; })}
        </g>
        <text x={40} y={CT + 44} style={zh(32, H.text, 900)} opacity={dim(pg)}>光酸</text>
        <text x={40} y={CT + 88} style={zh(32, H.text, 900)} opacity={dim(pg)}>產生劑</text>
        <Arrow x1={310} y1={210} x2={420} y2={210} c={H.amber} w={6} o={dim(ac)} />
        <g opacity={ac}>
          <circle cx={490} cy={210} r={40 + 6 * Math.sin(f * 0.3)} fill={ACID} opacity={0.25} />
          <circle cx={490} cy={210} r={32} fill={ACID} />
          <path d="M474 210 H506 M490 194 V226" stroke="#FFFFFF" strokeWidth={7} />
        </g>
        <Sep x={600} />
        <text x={628} y={CT + 50} style={zh(32, DUV, 900)} opacity={dim(hv)}>照到光</text>
        <text x={628} y={CT + 120} style={zh(32, H.text, 900)} opacity={dim(pg)}>光酸產生劑</text>
        <text x={628} y={CT + 190} style={zh(32, ACID, 900)} opacity={dim(ac)}>放出酸 H⁺</text>
        <text x={628} y={CT + 240} style={zh(30, H.text2, 800)} opacity={dim(ac)}>只有一點點</text>
      </svg>
    </Card>
  );
};

// ── pr1-peb：烘烤；一個酸沿鏈前進，經過的保護基（橘）被拆掉變成可溶（綠）；次數往上數到「幾百次」 ──
const Peb: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330;
  const bk = on(f, T(o, "bake")), t0 = T(o, "bake") + 10, hu = on(f, T(o, "hund"));
  const N = 9, pos = cl((f - t0) / 90) * (N - 0.2);
  const count = Math.round(1 + 299 * EASE.move(cl((f - t0) / (T(o, "hund") + 10 - t0))));
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        <text x={40} y={CT + 40} style={zh(32, HEAT, 900)} opacity={dim(bk)}>加熱烘烤</text>
        <line x1={50} y1={196} x2={600} y2={196} stroke={CHAIN} strokeWidth={6} />
        {Array.from({ length: N }, (_, i) => {
          const x = 70 + i * 64, done = pos > i + 0.4;
          return <g key={i}><circle cx={x} cy={196} r={9} fill={CHAIN} /><line x1={x} y1={196} x2={x} y2={156} stroke={CHAIN} strokeWidth={4} />
            {done ? <circle cx={x} cy={148} r={11} fill={OH} /> : <g><circle cx={x} cy={146} r={13} fill={PG} /><circle cx={x - 12} cy={132} r={8} fill={PG} /><circle cx={x + 12} cy={132} r={8} fill={PG} /></g>}</g>;
        })}
        <g opacity={on(f, t0)}>
          <circle cx={70 + pos * 64} cy={222} r={14} fill={ACID} />
          <path d={`M${62 + pos * 64} 222 H${78 + pos * 64} M${70 + pos * 64} 214 V230`} stroke="#FFFFFF" strokeWidth={4} />
        </g>
        <rect x={40} y={254} width={570} height={18} fill={mix("#B4542A", HEAT, bk)} />
        {Array.from({ length: 5 }, (_, j) => { const u = (f * 0.04 + j / 5) % 1; return <path key={j} d={`M${80 + j * 110} ${250 - u * 12} q8 -8 0 -16`} stroke={HEAT} strokeWidth={3} fill="none" opacity={bk * (1 - u)} />; })}
        <text x={40} y={308} style={zh(30, H.text2, 800)} opacity={dim(bk)}>烤盤</text>
        <Sep x={640} />
        <text x={666} y={CT + 50} style={zh(32, H.text, 900)} opacity={dim(on(f, T(o, "one")))}>一個酸</text>
        <text x={666} y={CT + 130} style={zh(56, ACID, 900)} opacity={dim(on(f, T(o, "chain")))}>{`×${count}`}</text>
        <text x={666} y={CT + 200} style={zh(32, H.amber, 900)} opacity={dim(hu)}>可達幾百次</text>
        <text x={666} y={CT + 244} style={zh(30, H.text2, 800)} opacity={dim(hu)}>變化被放大</text>
      </svg>
    </Card>
  );
};

// ── pr1-euv：同樣能量，ArF 42 顆小光子 vs EUV 3 顆大光子（約 1/14） ──
const Euv: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330;
  const eu = on(f, T(o, "euv")), sa = on(f, T(o, "same")), fr = on(f, T(o, "frac"), 14);
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        <text x={40} y={CT + 40} style={zh(32, DUV, 900)}>ArF 193 nm</text>
        <rect x={40} y={124} width={380} height={100} fill="#EEF3FB" />
        {Array.from({ length: 42 }, (_, i) => <circle key={i} cx={58 + (i % 14) * 26} cy={142 + Math.floor(i / 14) * 32} r={7} fill={DUV} opacity={dim(sa, 0.6)} />)}
        <text x={40} y={266} style={zh(30, H.text2, 800)}>每顆約 6.5 eV</text>
        <text x={40} y={308} style={zh(32, H.text, 900)} opacity={dim(sa)}>42 顆</text>
        <Sep x={476} />
        <text x={524} y={CT + 40} style={zh(32, EUV, 900)} opacity={dim(eu)}>EUV 13.5 nm</text>
        <rect x={524} y={124} width={380} height={100} fill="#EEF3FB" />
        {[[600, 160], [730, 196], [840, 150]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r={20} fill={EUV} opacity={dim(eu, 0.6)} />)}
        <text x={524} y={266} style={zh(30, H.text2, 800)} opacity={dim(eu)}>每顆約 92 eV</text>
        <text x={524} y={308} style={zh(32, H.amber, 900)} opacity={dim(fr)}>3 顆，約 1/14</text>
      </svg>
    </Card>
  );
};

// ── pr1-stoch：落點不均 → 線條斷掉、黏在一起 ──
const Stoch: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330;
  const fw = on(f, T(o, "few")), un = on(f, T(o, "uneven")), bk = on(f, T(o, "brk")), bg = on(f, T(o, "brg"));
  const hits = [[70, 130], [196, 220], [120, 180], [300, 140], [350, 230], [250, 120]];
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        <rect x={40} y={110} width={380} height={140} fill="#EEF3FB" />
        {Array.from({ length: 5 }, (_, i) => <rect key={i} x={60 + i * 76} y={110} width={30} height={140} fill={LIT} opacity={0.5} />)}
        {hits.map(([x, y], i) => <circle key={i} cx={x} cy={y} r={14} fill={EUV} opacity={dim(i < 3 ? fw : un, 0.25)} />)}
        <text x={40} y={300} style={zh(32, H.text, 900)} opacity={dim(un)}>落點不均</text>
        <Arrow x1={440} y1={180} x2={496} y2={180} c={H.amber} w={6} o={dim(bk)} />
        <rect x={520} y={110} width={380} height={140} fill="#EEF3FB" />
        {Array.from({ length: 5 }, (_, i) => {
          const x = 540 + i * 76;
          if (i === 1) return <g key={i}><rect x={x} y={110} width={30} height={54} fill={RES} /><rect x={x} y={192} width={30} height={58} fill={RES} /></g>;
          return <rect key={i} x={x} y={110} width={30} height={140} fill={RES} />;
        })}
        <rect x={768} y={200} width={46} height={22} fill={RES} opacity={bg} />
        <circle cx={631} cy={178} r={26} fill="none" stroke={BAD} strokeWidth={5} opacity={bk} />
        <circle cx={791} cy={211} r={30} fill="none" stroke={BAD} strokeWidth={5} opacity={bg} />
        <text x={520} y={300} style={zh(32, BAD, 900)} opacity={dim(bk)}>斷線</text>
        <text x={700} y={300} style={zh(32, BAD, 900)} opacity={dim(bg)}>黏在一起</text>
      </svg>
    </Card>
  );
};

// ── pr1-mor：化學放大（光子大多穿過）vs 金屬氧化物（團簇把光子吸住） ──
const Mor: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330;
  const tr = on(f, T(o, "try")), ab = on(f, T(o, "abs")), mo = on(f, T(o, "mor"));
  const u = (f * 0.03) % 1;
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        <text x={40} y={CT + 40} style={zh(32, H.line, 900)}>化學放大</text>
        <rect x={40} y={150} width={380} height={90} fill={RES} opacity={0.35} />
        {[0, 1].map((r) => <polyline key={r} points={Array.from({ length: 12 }, (_, i) => `${56 + i * 32},${176 + r * 40 + (i % 2 ? -6 : 6)}`).join(" ")} fill="none" stroke={CHAIN} strokeWidth={4} />)}
        <circle cx={230} cy={130 + u * 120} r={12} fill={EUV} opacity={dim(tr, 0.3)} />
        <text x={40} y={296} style={zh(30, H.text2, 800)} opacity={dim(tr)}>光子大多穿過去</text>
        <Sep x={476} />
        <text x={524} y={CT + 40} style={zh(32, H.amber, 900)} opacity={dim(mo)}>金屬氧化物</text>
        <rect x={524} y={150} width={380} height={90} fill="#E8ECF2" />
        {[600, 714, 828].map((x, i) => <g key={i}>
          {Array.from({ length: 6 }, (_, j) => { const a = (j * Math.PI) / 3; return <line key={j} x1={x} y1={195} x2={x + Math.cos(a) * 34} y2={195 + Math.sin(a) * 34} stroke="#4FB070" strokeWidth={4} />; })}
          <circle cx={x} cy={195} r={20} fill={SN} />
          <circle cx={x} cy={195} r={26} fill={LIT} opacity={ab * (0.35 + 0.25 * Math.sin(f * 0.3 + i))} />
        </g>)}
        <circle cx={714} cy={130 + Math.min(u, 0.45) * 120} r={12} fill={EUV} opacity={dim(tr, 0.3) * (u < 0.5 ? 1 : 0)} />
        <text x={524} y={296} style={zh(30, H.amber, 800)} opacity={dim(ab)}>吸光更強，業界在試</text>
      </svg>
    </Card>
  );
};

// ── pr1-co：供應商（以日本廠為主；市占各家說法不一，不寫數字） ──
const Co: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330;
  const jp = on(f, T(o, "jp")), rest = on(f, T(o, "shin") + 16);
  const rows: [string, string, string, number][] = [["捷時雅（JSR）", "日本", "jsr", 0], ["東京應化（TOK）", "日本", "tok", 0], ["信越化學", "日本", "shin", 0],
    ["住友化學", "日本", "", 1], ["富士軟片", "日本", "", 1], ["杜邦", "美國", "", 1]];
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        <text x={40} y={CT + 42} style={zh(36, H.amber, 900)} opacity={dim(jp)}>以日本廠為主</text>
        <text x={300} y={CT + 40} style={zh(30, H.text2, 800)} opacity={dim(jp)}>（市占各家說法不一）</text>
        {rows.map(([n, c, cue, g], i) => {
          const a = g ? rest : on(f, T(o, cue)); const x = i < 3 ? 40 : 520, y = 170 + (i % 3) * 56;
          return <g key={i} opacity={dim(a, 0.3)}><rect x={x} y={y - 24} width={12} height={24} fill={c === "日本" ? H.amber : H.line} />
            <text x={x + 26} y={y} style={zh(32, H.text, 900)}>{n}</text><text x={x + 320} y={y} style={zh(30, H.text2, 700)}>{c}</text></g>;
        })}
        <line x1={476} y1={136} x2={476} y2={300} stroke={H.lineSoft} strokeWidth={3} />
      </svg>
    </Card>
  );
};

// ── pr1-tw：台灣地圖＋雲林；合資公司、最快 2028（媒體報導） ──
const Tw: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330;
  const tw = on(f, T(o, "tw")), jv = on(f, T(o, "jv")), yl = on(f, T(o, "yl")), y8 = on(f, T(o, "y28"));
  const isl = twPath(112, 82, 64), [yx, yy] = twPt(120.25, 23.75, 112, 82, 64); // 台灣真實輪廓＋雲林麥寮位置（11-25）
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        <g opacity={dim(tw)}><path d={isl} fill="#DCE8F8" stroke={H.line} strokeWidth={3} strokeLinejoin="round" /></g>
        <g opacity={yl}><circle cx={yx} cy={yy} r={10 + 4 * Math.sin(f * 0.25)} fill={H.amber} opacity={0.35} /><circle cx={yx} cy={yy} r={8} fill={H.amber} /></g>
        <text x={250} y={yy + 10} style={zh(30, H.amber, 900)} opacity={dim(yl)}>雲林</text>
        <line x1={yx + 10} y1={yy} x2={240} y2={yy} stroke={H.amber} strokeWidth={3} opacity={yl} />
        <Sep x={330} />
        <g><rect x={352} y={CT + 20} width={96} height={34} fill="none" stroke={jv > 0.5 ? H.amber : H.lineSoft} strokeWidth={jv > 0.5 ? 4 : 1.5} />
          <Flag code="JP" h={26} x={356} y={CT + 24} asSvg /><Flag code="TW" h={26} x={404} y={CT + 24} asSvg /></g>
        <text x={456} y={CT + 48} style={zh(32, H.text, 900)} opacity={dim(jv)}>台灣捷時雅先進製造</text>
        {hasLogo("jsr") ? <g><rect x={862} y={CT + 6} width={58} height={58} fill="#FFFFFF" stroke={jv > 0.5 ? H.amber : H.lineSoft} strokeWidth={jv > 0.5 ? 4 : 1.5} /><LogoSvg id="jsr" x={866} y={CT + 10} h={50} /></g> : null}
        <text x={356} y={CT + 98} style={zh(30, H.text2, 800)} opacity={dim(jv)}>JSR 持股過半，和台灣夥伴合資</text>
        <text x={356} y={CT + 160} style={zh(32, H.text, 900)} opacity={dim(yl)}>台灣首座光阻廠（規劃）</text>
        <text x={356} y={CT + 222} style={zh(32, H.amber, 900)} opacity={dim(y8)}>最快 2028 年投產</text>
        <Pill x={720} y={CT + 192} t="媒體報導" c={H.text2} a={dim(y8)} />
      </svg>
    </Card>
  );
};

// ── pr1-next：塗佈→軟烤→曝光→顯影；本集講的是膠，下一集看機器（塗佈顯影機） ──
const Next: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330;
  const ok = on(f, T(o, "ok")), fl = on(f, T(o, "flat")), nx = on(f, T(o, "next")), tk = on(f, T(o, "track"));
  const st: [string, boolean][] = [["塗佈", true], ["軟烤", true], ["曝光", false], ["顯影", true]];
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        {st.map(([t, tr], i) => {
          const x = 40 + i * 222, hl = tr ? tk : 0;
          return <g key={i} opacity={dim(ok)}>
            <rect x={x} y={CT + 14} width={180} height={60} fill={hl > 0.5 ? H.line : "#FFFFFF"} stroke={H.line} strokeWidth={3} />
            <text x={x + 90} y={CT + 56} textAnchor="middle" style={zh(32, hl > 0.5 ? "#FFFFFF" : H.text, 900)}>{t}</text>
            {i < 3 ? <Arrow x1={x + 186} y1={CT + 44} x2={x + 216} y2={CT + 44} c={H.text2} w={4} /> : null}
          </g>;
        })}
        <g opacity={dim(fl)}>
          <rect x={40} y={196} width={400} height={10} fill={RES} />
          <rect x={40} y={206} width={400} height={30} fill={SI} />
          <text x={40} y={290} style={zh(32, H.text, 900)}>又薄又平</text>
        </g>
        <Sep x={476} y0={170} />
        <text x={512} y={226} style={zh(32, H.amber, 900)} opacity={dim(nx)}>下一集</text>
        <text x={512} y={284} style={zh(32, H.text, 900)} opacity={dim(tk)}>塗佈顯影機</text>
      </svg>
    </Card>
  );
};

export const ResistSection: React.FC<P> = (p) => {
  const kind = String((p.o as any).kind ?? "");
  const map: Record<string, React.FC<P>> = { "pr1-hook": Hook, "pr1-what": What, "pr1-expose": Expose, "pr1-pos": Pos, "pr1-neg": Neg, "pr1-why": Why, "pr1-pag": Pag,
    "pr1-peb": Peb, "pr1-euv": Euv, "pr1-stoch": Stoch, "pr1-mor": Mor, "pr1-co": Co, "pr1-tw": Tw, "pr1-next": Next };
  const C = map[kind];
  return C ? <C {...p} /> : null;
};

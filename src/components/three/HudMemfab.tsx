// 2026/11/28 tech-memfab：中游補充篇 M2「記憶體製造」的 2D 示意卡（overlay `section` 的 kind 以 "memfab-" 開頭，Hud.tsx 轉過來）。
//   memfab-hook 上一集代工→記憶體在哪做｜memfab-desk 動態記憶體＝書桌（斷電清空）｜memfab-flash 儲存型＝倉庫、編碼型＝便條紙
//   memfab-cell 一格＝開關＋電容（剖面，電荷進電容）｜memfab-nand 疊層→鑽深孔→填通道（剖面）｜memfab-idm 自己設計自己製造＋三大廠
//   memfab-tw 台灣三家（利基型）｜memfab-mu 美光在台灣（真實輪廓地圖）｜memfab-next 電動車高壓→碳化矽、氮化鎵；留言關鍵字。
// LOGO 只用 Brand.tsx LOGOS 表的原檔（100% 不透明，未輪到細灰框、輪到粗框）；沒有原檔的公司用白底深色文字名牌（不仿商標）。
import React from "react";
import { FONT_ZH } from "../../theme";
import { H, L, CARD_HEAD, CARD_CONTENT_TOP, cardTitleBox } from "./hudSkin";
import { EASE, tween } from "../anim";
import type { Model3D, Overlay3D, State3D } from "./engine";
import { Flag, LOGOS, LogoSvg } from "./Brand";

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
const cl01 = (x: number) => Math.min(1, Math.max(0, x));
// 示意色（材料本身的顏色，不是頻道色票）
const RED = "#E0472F", OK = "#14A38B", BLUE = "#2F7FE0", SI = "#5E6B82", SIL = "#A9B5C7", CAP = "#B8C2D4", CHG = "#2FB8C8", WL = "#4A5876", OX = "#E6EBF2",
  TRAP = "#E0A43A", CHAN = "#6FB38F", HOLE = "#151922", PCB = "#1E6B4E", PAD = "#E0B84E", CHIP = "#2E3442", WOOD = "#B9865A", WOODD = "#8A5E3A", NOTE = "#F6D365", BOX = "#C9A66B", SIC = "#3FA37A", GAN = "#C9A24A", BOLT = "#F2B632";
const Sep: React.FC<{ x: number; y2?: number }> = ({ x, y2 = 316 }) => <line x1={x} y1={CT + 4} x2={x} y2={y2} stroke={H.lineSoft} strokeWidth={3} />;
const Row: React.FC<{ x: number; y: number; t: string; c: string; a: number; px?: number }> = ({ x, y, t, c, a, px = 30 }) => (
  <g opacity={0.35 + 0.65 * a}><rect x={x} y={y - px * 0.72} width={12} height={px * 0.72} fill={c} /><text x={x + 24} y={y} style={zh(px, H.text, 900)}>{t}</text></g>
);
const Cap: React.FC<{ x: number; y: number; t: string; px?: number }> = ({ x, y, t, px = 26 }) => <text x={x} y={y} textAnchor="middle" style={zh(px, H.text2, 800)}>{t}</text>;
const Sv: React.FC<{ W: number; Hh: number; children: React.ReactNode }> = ({ W, Hh, children }) => <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>{children}</svg>;
const Arr: React.FC<{ x1: number; y: number; x2: number; c: string; w?: number }> = ({ x1, y, x2, c, w = 4 }) => { const d = Math.sign(x2 - x1) || 1; return (
  <g><line x1={x1} y1={y} x2={x2 - d * 8} y2={y} stroke={c} strokeWidth={w} /><path d={`M${x2},${y} L${x2 - d * 14},${y - 8} L${x2 - d * 14},${y + 8} Z`} fill={c} /></g>); };
const ArrV: React.FC<{ x: number; y1: number; y2: number; c: string; w?: number }> = ({ x, y1, y2, c, w = 4 }) => { const d = Math.sign(y2 - y1) || 1; return (
  <g><line x1={x} y1={y1} x2={x} y2={y2 - d * 8} stroke={c} strokeWidth={w} /><path d={`M${x},${y2} L${x - 8},${y2 - d * 14} L${x + 8},${y2 - d * 14} Z`} fill={c} /></g>); };
const FlagBox: React.FC<{ code: string; x: number; y: number; a: number }> = ({ code, x, y, a }) => (
  <g><rect x={x} y={y} width={50} height={36} fill="none" stroke={a > 0.5 ? H.amber : H.lineSoft} strokeWidth={a > 0.5 ? 4 : 1.5} /><Flag code={code} h={28} x={x + 4} y={y + 4} asSvg /></g>
);
// 公司：有原檔用 LOGO（白底、100% 不透明），沒有就白底深藍字名牌
const Brand: React.FC<{ id: string; name: string; x: number; y: number; w: number; h: number; a: number }> = ({ id, name, x, y, w, h, a }) => {
  const s = LOGOS[id]; const lh = h - 14, lw = s ? Math.min(w - 16, (lh * s.w) / s.h) : 0, lh2 = s ? (lw * s.h) / s.w : 0;
  return (<g><rect x={x} y={y} width={w} height={h} fill="#FFFFFF" stroke={a > 0.5 ? H.amber : H.lineSoft} strokeWidth={a > 0.5 ? 4 : 1.5} />
    {s ? <LogoSvg id={id} x={x + (w - lw) / 2} y={y + (h - lh2) / 2} h={lh2} /> : <text x={x + w / 2} y={y + h / 2 + 11} textAnchor="middle" style={zh(30, "#1F3A5F", 900)}>{name}</text>}</g>);
};
// 晶圓（圓＋晶粒格）
const Wafer: React.FC<{ cx: number; cy: number; r: number; c?: string; d?: string; rot?: number }> = ({ cx, cy, r, c = SIL, d = "#4C5E86", rot = 0 }) => {
  const n = 7, g = (r * 2) / n, cells: React.ReactNode[] = [];
  for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) { const x = cx - r + i * g, y = cy - r + j * g; if (Math.hypot(Math.abs(x + g / 2 - cx) + g / 2, Math.abs(y + g / 2 - cy) + g / 2) < r * 0.97) cells.push(<rect key={`${i}-${j}`} x={x + 1.5} y={y + 1.5} width={g - 3} height={g - 3} fill={d} />); }
  return (<g transform={`rotate(${rot} ${cx} ${cy})`}><circle cx={cx} cy={cy} r={r} fill={c} stroke={H.text2} strokeWidth={2} />{cells}<rect x={cx - 5} y={cy + r - 6} width={10} height={8} fill={H.cardCompare} /></g>);
};

// ── memfab-hook：上一集成熟製程代工 → 記憶體在哪做？→ 另一種晶圓廠 ──
const Hook: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330, pv = on(f, T(o, "prev")), q = on(f, T(o, "q")), fb = on(f, T(o, "fab"));
  return (<Card o={o} k={k} W={W} Hh={Hh}><Sv W={W} Hh={Hh}>
    <g opacity={0.4 + 0.6 * Math.max(pv, fb)}><Wafer cx={150} cy={CT + 104} r={76} rot={f * 0.4} /></g>
    <g opacity={q * (1 - fb)}><circle cx={262} cy={CT + 64} r={34} fill="#FFFFFF" stroke={RED} strokeWidth={3} /><text x={262} y={CT + 82} textAnchor="middle" style={zh(48, RED, 900)}>？</text></g>
    <Cap x={150} y={CT + 240} t="記憶體晶圓" />
    <Sep x={334} />
    <Row x={360} y={CT + 60} t="前一集：成熟製程代工" c={H.text2} a={pv} />
    <Row x={360} y={CT + 130} t="記憶體又在哪做？" c={BLUE} a={q} />
    <Row x={360} y={CT + 200} t="答案：另一種晶圓廠" c={H.amber} a={fb} />
  </Sv></Card>);
};
// ── memfab-desk：動態記憶體＝書桌；斷電→桌面清空 ──
const Desk: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330, th = on(f, T(o, "three")), dk = on(f, T(o, "desk")), off = on(f, T(o, "off"), 6);
  const y0 = CT + 120;
  return (<Card o={o} k={k} W={W} Hh={Hh}><Sv W={W} Hh={Hh}>
    <g opacity={0.4 + 0.6 * Math.max(dk, off)}>
      <rect x={40} y={y0} width={230} height={16} fill={WOOD} stroke={WOODD} strokeWidth={2} />
      <rect x={52} y={y0 + 16} width={12} height={74} fill={WOODD} /><rect x={246} y={y0 + 16} width={12} height={74} fill={WOODD} />
      <g opacity={1 - off}>{[0, 1, 2].map((i) => <rect key={i} x={64 + i * 64} y={y0 - 34 + (i % 2) * 6} width={48} height={34 - (i % 2) * 6} fill="#FFFFFF" stroke={H.text2} strokeWidth={2} transform={`rotate(${(i - 1) * 6} ${88 + i * 64} ${y0 - 17})`} />)}
        {[0, 1, 2, 3, 4].map((i) => <circle key={`b${i}`} cx={72 + i * 42} cy={y0 - 56} r={8} fill={CHG} />)}</g>
      <g transform={`translate(270 ${CT + 18})`}><rect x={0} y={0} width={56} height={40} rx={8} fill={off > 0.5 ? RED : OK} /><text x={28} y={30} textAnchor="middle" style={zh(26, "#FFFFFF", 900)}>{off > 0.5 ? "關" : "開"}</text></g>
      {off > 0.5 ? <g><line x1={74} y1={y0 - 70} x2={250} y2={y0 - 6} stroke={RED} strokeWidth={5} /><line x1={250} y1={y0 - 70} x2={74} y2={y0 - 6} stroke={RED} strokeWidth={5} /></g> : null}
    </g>
    <Cap x={155} y={CT + 246} t={off > 0.5 ? "斷電：桌面清空" : "有電：東西攤開好拿"} />
    <Sep x={334} />
    <Row x={360} y={CT + 60} t="記憶體分三種" c={H.text2} a={th} />
    <Row x={360} y={CT + 130} t="動態記憶體（DRAM）＝書桌" c={BLUE} a={dk} />
    <Row x={360} y={CT + 200} t="好拿，但斷電就清空" c={RED} a={off} />
  </Sv></Card>);
};
// ── memfab-flash：儲存型＝倉庫（斷電不消失）｜編碼型＝便條紙（記開機指令） ──
const FlashC: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330, fl = on(f, T(o, "flash")), wr = on(f, T(o, "ware")), kp = on(f, T(o, "keep")), nt = on(f, T(o, "note")), bt = on(f, T(o, "boot"));
  return (<Card o={o} k={k} W={W} Hh={Hh}><Sv W={W} Hh={Hh}>
    <g opacity={0.4 + 0.6 * Math.max(wr, kp)}>
      <path d={`M30,${CT + 92} L95,${CT + 44} L160,${CT + 92} Z`} fill={SI} /><rect x={38} y={CT + 92} width={114} height={84} fill={SIL} stroke={H.text2} strokeWidth={2} />
      {[0, 1, 2].map((i) => [0, 1].map((j) => <rect key={`${i}${j}`} x={46 + i * 34} y={CT + 104 + j * 34} width={30} height={28} fill={BOX} stroke={WOODD} strokeWidth={1.5} />))}
    </g>
    <Cap x={95} y={CT + 212} t="倉庫" />
    <g opacity={0.4 + 0.6 * Math.max(nt, bt)}>
      <rect x={190} y={CT + 56} width={110} height={110} fill={NOTE} stroke={WOODD} strokeWidth={2} transform={`rotate(-4 245 ${CT + 111})`} />
      {[0, 1, 2].map((i) => <rect key={i} x={204} y={CT + 82 + i * 24} width={i === 2 ? 50 : 80} height={8} fill={bt > 0.5 && i === 0 ? RED : WOODD} />)}
    </g>
    <Cap x={245} y={CT + 212} t="便條紙" />
    <Sep x={334} y2={376} />
    <Row x={360} y={CT + 52} t="快閃記憶體有兩種" c={H.text2} a={fl} />
    <Row x={360} y={CT + 112} t="儲存型（NAND）＝倉庫" c={H.amber} a={wr} />
    <Row x={360} y={CT + 172} t="斷電也不消失" c={OK} a={kp} />
    <Row x={360} y={CT + 232} t="編碼型（NOR）＝便條紙" c={BLUE} a={nt} />
    <Row x={360} y={CT + 292} t="記開機指令" c={BLUE} a={bt} />
  </Sv></Card>);
};
// ── memfab-cell：一格＝開關（電晶體）＋電容；開關打開電荷流進電容；電容又細又高（筷子） ──
const Cell: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330, ce = on(f, T(o, "cell")), sw = on(f, T(o, "sw")), cp = on(f, T(o, "cap")), ch = on(f, T(o, "chop"));
  const fill = cl01((f - T(o, "sw") - 6) / 30), by = CT + 232;
  return (<Card o={o} k={k} W={W} Hh={Hh}><Sv W={W} Hh={Hh}>
    <g opacity={0.4 + 0.6 * Math.max(ce, sw)}>
      <rect x={30} y={by} width={200} height={34} fill={SI} />
      <rect x={44} y={by - 4} width={40} height={10} fill={RED} opacity={0.7} /><rect x={150} y={by - 4} width={40} height={10} fill={RED} opacity={0.7} />
      <rect x={92} y={by - 30} width={50} height={22} fill={WL} stroke={H.text2} strokeWidth={1.5} /><rect x={92} y={by - 10} width={50} height={6} fill={OX} />
      <text x={117} y={by - 38} textAnchor="middle" style={zh(22, H.text2, 800)}>開關</text>
      <rect x={58} y={by - 50} width={12} height={46} fill={SIL} /><rect x={20} y={by - 62} width={70} height={12} fill="#C8794A" />
      <rect x={164} y={by - 40} width={12} height={36} fill={SIL} />
      <g opacity={0.4 + 0.6 * Math.max(cp, ch)}><rect x={154} y={CT + 22} width={32} height={by - 40 - CT - 22} fill={CAP} stroke={H.text2} strokeWidth={2} rx={6} />
        <rect x={162} y={by - 44 - (by - 70 - CT) * fill} width={16} height={(by - 70 - CT) * fill} fill={CHG} /></g>
      <text x={232} y={CT + 70} style={zh(22, H.text2, 800)}>電容</text>
      {sw > 0.5 && fill < 1 ? <ArrV x={64} y1={by - 54} y2={by - 16} c={CHG} w={3} /> : null}
    </g>
    <g opacity={ch}>{[0, 1, 2, 3].map((i) => <rect key={i} x={256 + i * 16} y={CT + 110} width={8} height={110} rx={3} fill={WOOD} stroke={WOODD} strokeWidth={1.5} />)}</g>
    <Sep x={334} />
    <Row x={360} y={CT + 60} t="一格＝開關＋電容" c={H.amber} a={ce} />
    <Row x={360} y={CT + 124} t="開關打開，電荷進電容" c={CHG} a={sw} />
    <Row x={360} y={CT + 188} t="電容又細又高" c={BLUE} a={cp} />
    <Row x={360} y={CT + 252} t="像一排筷子站著" c={WOODD} a={ch} />
  </Sv></Card>);
};
// ── memfab-nand：導體層／絕緣層交錯疊 → 由上往下鑽深孔 → 填儲存層＋通道（吸管） ──
const Nand: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330, st = on(f, T(o, "stack")), n3 = on(f, T(o, "n300")), dr = on(f, T(o, "drill")), sw = on(f, T(o, "straw"));
  const N = 12, lh = 15, x0 = 30, x1 = 290, yb = CT + 252, nShow = Math.round(N * cl01((f - T(o, "stack") + 4) / 30));
  const depth = cl01((f - T(o, "drill")) / 24) * N * lh;
  return (<Card o={o} k={k} W={W} Hh={Hh}><Sv W={W} Hh={Hh}>
    <rect x={x0} y={yb} width={x1 - x0} height={18} fill={SI} />
    {Array.from({ length: nShow }, (_, i) => <rect key={i} x={x0} y={yb - (i + 1) * lh} width={x1 - x0} height={lh} fill={i % 2 ? OX : WL} stroke={H.lineSoft} strokeWidth={0.8} />)}
    {[0, 1, 2, 3].map((j) => { const cx = x0 + 40 + j * 62; return (<g key={j}>
      {dr > 0 ? <rect x={cx - 10} y={yb - N * lh} width={20} height={depth} fill={HOLE} /> : null}
      {sw > 0 ? <g opacity={sw}><rect x={cx - 10} y={yb - N * lh} width={20} height={N * lh} fill={TRAP} /><rect x={cx - 5} y={yb - N * lh} width={10} height={N * lh} fill={CHAN} /></g> : null}
    </g>); })}
    {dr > 0 && sw < 0.5 ? [0, 1, 2, 3].map((j) => <ArrV key={j} x={x0 + 40 + j * 62} y1={CT + 10} y2={CT + 44} c="#B07CF0" w={3} />) : null}
    <Sep x={334} />
    <Row x={360} y={CT + 60} t="導體層、絕緣層交錯疊" c={H.text2} a={st} />
    <Row x={360} y={CT + 124} t="實際三百多層（321 層）" c={H.amber} a={n3} />
    <Row x={360} y={CT + 188} t="由上往下鑽深孔" c={BLUE} a={dr} />
    <Row x={360} y={CT + 252} t="填儲存層＋通道＝吸管" c={OK} a={sw} />
  </Sv></Card>);
};
// ── memfab-idm：自己設計→自己製造（同一家）；三星、SK 海力士、美光；三家合計近九成（TrendForce） ──
const Idm: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 392, sp = on(f, T(o, "spec")), id = on(f, T(o, "idm")), mk = on(f, T(o, "make")), a1 = on(f, T(o, "sam")), a2 = on(f, T(o, "sk")), a3 = on(f, T(o, "mu")), tf = on(f, T(o, "tf")), n9 = on(f, T(o, "n90"));
  const rows: [string, string, string, number][] = [["KR", "samsung", "三星", a1], ["KR", "skhynix", "SK 海力士", a2], ["US", "micron", "美光", a3]];
  return (<Card o={o} k={k} W={W} Hh={Hh}><Sv W={W} Hh={Hh}>
    <g opacity={0.4 + 0.6 * Math.max(sp, id, mk)}>
      <rect x={24} y={CT + 30} width={290} height={150} fill="none" stroke={H.amber} strokeWidth={3} strokeDasharray="10 6" />
      <text x={169} y={CT + 22} textAnchor="middle" style={zh(24, H.text2, 800)}>同一家公司</text>
      <rect x={40} y={CT + 70} width={100} height={70} fill="#FFFFFF" stroke={BLUE} strokeWidth={id > 0.5 ? 4 : 2} /><text x={90} y={CT + 115} textAnchor="middle" style={zh(28, BLUE, 900)}>設計</text>
      <Arr x1={146} y={CT + 105} x2={194} c={H.text2} />
      <rect x={198} y={CT + 70} width={100} height={70} fill="#FFFFFF" stroke={H.amber} strokeWidth={mk > 0.5 ? 4 : 2} /><text x={248} y={CT + 115} textAnchor="middle" style={zh(28, H.amber, 900)}>製造</text>
    </g>
    <g opacity={0.4 + 0.6 * Math.max(tf, n9)}>
      <rect x={24} y={CT + 214} width={290} height={28} fill={H.lineSoft} />
      <rect x={24} y={CT + 214} width={290 * 0.88 * n9} height={28} fill={H.amber} />
      <text x={169} y={CT + 280} textAnchor="middle" style={zh(28, H.text, 900)}>三家合計：近九成</text>
    </g>
    <Sep x={334} y2={376} />
    {rows.map(([c, idd, n, a], i) => <g key={idd}><FlagBox code={c} x={360} y={CT + 26 + i * 84} a={a} /><Brand id={idd} name={n} x={428} y={CT + 18 + i * 84} w={240} h={54} a={a} />
      <text x={688} y={CT + 56 + i * 84} style={zh(30, H.text2, 800)} opacity={0.4 + 0.6 * a}>{n}</text></g>)}
  </Sv></Card>);
};
// ── memfab-tw：台灣利基型（量小、規格特別）：南亞科、華邦電、旺宏 ──
const Tw: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 392, ni = on(f, T(o, "niche")), sp = on(f, T(o, "spec")), a1 = on(f, T(o, "nanya")), a2 = on(f, T(o, "wb")), a3 = on(f, T(o, "mx"));
  const rows: [string, string, string, number][] = [["nanya", "南亞科 2408", "動態記憶體", a1], ["winbond", "華邦電 2344", "動態＋快閃都做", a2], ["macronix", "旺宏 2337", "主攻快閃", a3]];
  return (<Card o={o} k={k} W={W} Hh={Hh}><Sv W={W} Hh={Hh}>
    <g opacity={0.4 + 0.6 * Math.max(ni, sp)}>
      {[0, 1, 2, 3, 4, 5].map((i) => <rect key={i} x={36 + (i % 3) * 94} y={CT + 40 + Math.floor(i / 3) * 96} width={78} height={70} rx={6} fill={["#FFFFFF", NOTE, SIL, "#FFFFFF", SIL, NOTE][i]} stroke={H.text2} strokeWidth={2} />)}
      {[0, 1, 2, 3, 4, 5].map((i) => <rect key={`c${i}`} x={52 + (i % 3) * 94} y={CT + 58 + Math.floor(i / 3) * 96} width={46} height={34} fill={CHIP} />)}
    </g>
    <Cap x={169} y={CT + 268} t="量小、規格特別" px={28} />
    <Sep x={334} y2={376} />
    {rows.map(([id, n, s, a], i) => <g key={id}><FlagBox code="TW" x={360} y={CT + 26 + i * 84} a={a} /><Brand id={id} name={n} x={428} y={CT + 18 + i * 84} w={240} h={54} a={a} />
      <text x={688} y={CT + 56 + i * 84} style={zh(30, H.text2, 800)} opacity={0.4 + 0.6 * a}>{s}</text></g>)}
  </Sv></Card>);
};
// ── memfab-mu：美光在台灣（真實輪廓）：台中、桃園；高頻寬記憶體 ──
const TW_PATH = "M180.3 82.0 L192.0 91.6 L202.6 99.9 L207.3 100.6 L197.3 110.2 L199.1 127.4 L195.6 136.4 L185.0 166.5 L179.1 190.8 L170.9 222.8 L157.4 245.2 L142.8 271.4 L139.9 299.6 L132.8 297.7 L125.2 270.2 L116.4 263.8 L105.8 253.5 L98.8 229.8 L94.7 219.6 L98.8 204.9 L101.7 179.3 L113.5 162.0 L119.3 147.9 L129.3 133.2 L144.0 112.7 L153.3 99.3 L172.1 89.7Z";
// 經緯度投影（同 TW_PATH：x＝207.3−(122−經度)×62，y＝82＋(25.3−緯度)×64）：桃園 121.30E 25.00N；台中后里 120.71E 24.30N
const PIN = { ty: [163.9, 101.2], tc: [127.3, 146.0] } as const;
const Mu: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330, mu = on(f, T(o, "mu")), tc = on(f, T(o, "tc")), ty = on(f, T(o, "ty")), hb = on(f, T(o, "hbm"));
  const s = 1.05, ox = 60, oy = CT + 6, P2 = (p: readonly number[]) => [ox + (p[0] - 94.7) * s, oy + (p[1] - 82) * s];
  const [tcx, tcy] = P2(PIN.tc), [tyx, tyy] = P2(PIN.ty);
  return (<Card o={o} k={k} W={W} Hh={Hh}><Sv W={W} Hh={Hh}>
    <path d={TW_PATH} transform={`translate(${ox - 94.7 * s} ${oy - 82 * s}) scale(${s})`} fill={OK} opacity={0.45} stroke={OK} strokeWidth={3 / s} strokeLinejoin="round" />
    <g opacity={0.3 + 0.7 * ty}><circle cx={tyx} cy={tyy} r={9} fill={RED} stroke="#FFFFFF" strokeWidth={2} /><line x1={tyx + 9} y1={tyy} x2={236} y2={tyy - 6} stroke={H.text2} strokeWidth={2} /><text x={240} y={tyy + 2} style={zh(26, H.text, 900)}>桃園</text></g>
    <g opacity={0.3 + 0.7 * tc}><circle cx={tcx} cy={tcy} r={9} fill={RED} stroke="#FFFFFF" strokeWidth={2} /><line x1={tcx + 9} y1={tcy} x2={236} y2={tcy + 30} stroke={H.text2} strokeWidth={2} /><text x={240} y={tcy + 38} style={zh(26, H.text, 900)}>台中</text></g>
    <Sep x={334} />
    <g opacity={0.4 + 0.6 * mu}><FlagBox code="US" x={360} y={CT + 22} a={mu} /><Brand id="micron" name="美光" x={428} y={CT + 14} w={200} h={52} a={mu} /></g>
    <Row x={360} y={CT + 124} t="台中：最大基地，含記憶體封裝" c={OK} a={tc} />
    <Row x={360} y={CT + 184} t="桃園：晶圓前段製造" c={OK} a={ty} />
    <Row x={360} y={CT + 244} t="高頻寬記憶體：一疊十二層" c={H.amber} a={hb} />
  </Sv></Card>);
};
// ── memfab-next：電動車要耐高壓 → 矽晶圓撐不住 → 下一集碳化矽、氮化鎵；留言關鍵字 ──
const Next: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330, ev = on(f, T(o, "ev")), si = on(f, T(o, "si")), nx = on(f, T(o, "next")), sc = on(f, T(o, "sic")), kw = on(f, T(o, "kw"));
  return (<Card o={o} k={k} W={W} Hh={Hh}><Sv W={W} Hh={Hh}>
    <g opacity={0.4 + 0.6 * ev}><path d={`M76,${CT + 20} L50,${CT + 76} L72,${CT + 76} L56,${CT + 124} L102,${CT + 60} L80,${CT + 60} L98,${CT + 20} Z`} fill={BOLT} stroke={WOODD} strokeWidth={2} /></g>
    <g opacity={0.4 + 0.6 * Math.max(ev, si)}><circle cx={74} cy={CT + 180} r={38} fill={SIL} stroke={H.text2} strokeWidth={2} />
      {si > 0.5 ? <path d={`M54,${CT + 154} L74,${CT + 180} L64,${CT + 192} L90,${CT + 212}`} fill="none" stroke={RED} strokeWidth={5} /> : null}</g>
    <Cap x={74} y={CT + 252} t="矽" />
    <Arr x1={120} y={CT + 180} x2={168} c={H.text2} />
    <g opacity={0.4 + 0.6 * Math.max(nx, sc)}><circle cx={222} cy={CT + 120} r={40} fill={SIC} opacity={0.85} stroke={H.text2} strokeWidth={2} /><circle cx={222} cy={CT + 222} r={40} fill={GAN} stroke={H.text2} strokeWidth={2} /></g>
    <text x={272} y={CT + 128} style={zh(24, H.text2, 800)}>碳化矽</text><text x={272} y={CT + 230} style={zh(24, H.text2, 800)}>氮化鎵</text>
    <Sep x={384} />
    <Row x={404} y={CT + 52} t="電動車：要耐高壓" c={H.text2} a={ev} />
    <Row x={404} y={CT + 114} t="矽晶圓撐不住" c={RED} a={si} />
    <Row x={404} y={CT + 176} t="下一集：碳化矽與氮化鎵" c={BLUE} a={Math.max(nx, sc)} />
    <Row x={404} y={CT + 238} t="留言「記憶體廠」拿資料" c={H.amber} a={kw} />
  </Sv></Card>);
};
export const MemfabSection: React.FC<P> = (p) => {
  const kd = String((p.o as any).kind);
  const M: Record<string, React.FC<P>> = { "memfab-hook": Hook, "memfab-desk": Desk, "memfab-flash": FlashC, "memfab-cell": Cell, "memfab-nand": Nand, "memfab-idm": Idm, "memfab-tw": Tw, "memfab-mu": Mu, "memfab-next": Next };
  const C2 = M[kd]; return C2 ? <C2 {...p} /> : null;
};

// 2026/11/28 tech-cufoil：銅箔與玻纖布（系列 3 第 12 集）的 2D 示意卡（overlay `section` 的 kind 以 "cuf-" 開頭，Hud.tsx 轉過來）。共用小零件照 HudCcl.tsx。
//   cuf-hook 接上集（布多平、銅多光滑）｜cuf-drum 滾筒電鍍＝煎潤餅皮｜cuf-nod 光面／粗面銅瘤＝魔鬼氈｜cuf-skin 訊號擠在表面＝洗衣板｜cuf-hvlp 低粗糙度：平 vs 黏得牢｜
//   cuf-weave 拉絲→捻紗→平織＝竹蓆｜cuf-skew 紗與空隙→一對訊號對不齊｜cuf-spread 開纖＋低介電｜cuf-co 台灣三家｜cuf-next 做成主機板→下一集伺服器主機板＋留言。
// 公司 LOGO 原檔抓不到（同 tech-ccl），用白底文字名牌＋國旗，100% 不透明。示意，不標粗糙度、介電常數數字。
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
const cl01 = (x: number) => Math.min(1, Math.max(0, x));
// 示意色（材料本身的顏色，不是頻道色票）：銅、膠片琥珀、玻纖白、綠漆、泥巴、跑道
const RED = "#E0472F", OK = "#14A38B", BLUE = "#2F7FE0", CU = "#C77B3C", CUH = "#E39A68", PP = "#E0A43A", PPD = "#B9822A", CORE = "#9C7A3C",
  YARN = "#EEF2F6", YARND = "#B8C4D2", RESIN = "#E9B85A", PCB = "#1E6B4E", PCBD = "#16523B", PAD = "#E0B84E", SI = "#5E6B82",
  COOK = "#8A5A35", CREAM = "#F6EBD5", MUD = "#7A5C3C", MUDD = "#5B4329", TRACK = "#3D7BD9", HOT = "#E5602B", SIG = "#2FB8C8";
const Sep: React.FC<{ x: number; y2?: number }> = ({ x, y2 = 316 }) => <line x1={x} y1={CT + 4} x2={x} y2={y2} stroke={H.lineSoft} strokeWidth={3} />;
const Row: React.FC<{ x: number; y: number; t: string; c: string; a: number; px?: number }> = ({ x, y, t, c, a, px = 30 }) => (
  <g opacity={0.35 + 0.65 * a}><rect x={x} y={y - px * 0.72} width={12} height={px * 0.72} fill={c} /><text x={x + 24} y={y} style={zh(px, H.text, 900)}>{t}</text></g>
);
const Cap: React.FC<{ x: number; y: number; t: string }> = ({ x, y, t }) => <text x={x} y={y} textAnchor="middle" style={zh(26, H.text2, 800)}>{t}</text>;
const Sv: React.FC<{ W: number; Hh: number; children: React.ReactNode }> = ({ W, Hh, children }) => <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>{children}</svg>;
const Arr: React.FC<{ x1: number; y: number; x2: number; c: string; w?: number }> = ({ x1, y, x2, c, w = 4 }) => { const d = Math.sign(x2 - x1) || 1; return (
  <g><line x1={x1} y1={y} x2={x2 - d * 8} y2={y} stroke={c} strokeWidth={w} /><path d={`M${x2},${y} L${x2 - d * 14},${y - 8} L${x2 - d * 14},${y + 8} Z`} fill={c} /></g>); };
const ArrV: React.FC<{ x: number; y1: number; y2: number; c: string; w?: number }> = ({ x, y1, y2, c, w = 4 }) => { const d = Math.sign(y2 - y1) || 1; return (
  <g><line x1={x} y1={y1} x2={x} y2={y2 - d * 8} stroke={c} strokeWidth={w} /><path d={`M${x},${y2} L${x - 8},${y2 - d * 14} L${x + 8},${y2 - d * 14} Z`} fill={c} /></g>); };
// 平織玻纖布：經紗（直）與緯紗（橫）一上一下交錯；a＝不透明度
const Weave: React.FC<{ x: number; y: number; w: number; h: number; p?: number; c?: string; d?: string; wet?: number }> = ({ x, y, w, h, p = 16, c = YARN, d = YARND, wet = 0 }) => {
  const nx = Math.floor(w / p), ny = Math.floor(h / p);
  return (<g>
    <rect x={x} y={y} width={w} height={h} fill={wet > 0 ? RESIN : "none"} opacity={wet} />
    {Array.from({ length: ny }, (_, j) => <rect key={`w${j}`} x={x} y={y + j * p + p * 0.18} width={w} height={p * 0.64} fill={c} stroke={d} strokeWidth={1} />)}
    {Array.from({ length: nx }, (_, i) => Array.from({ length: ny }, (_, j) => ((i + j) % 2 === 0 ?
      <rect key={`v${i}-${j}`} x={x + i * p + p * 0.18} y={y + j * p} width={p * 0.64} height={p} fill={c} stroke={d} strokeWidth={1} /> : null)))}
  </g>);
};
// 銅箔基板剖面：上銅／膠片（布紋點）／下銅
const Lam: React.FC<{ x: number; y: number; w: number; cu?: number; core?: number; n?: number; cc?: string }> = ({ x, y, w, cu = 10, core = 40, n = 2, cc = PP }) => (
  <g><rect x={x} y={y} width={w} height={cu} fill={CU} /><rect x={x} y={y + cu} width={w} height={core} fill={cc} stroke={H.text2} strokeWidth={1.2} />
    {Array.from({ length: n }, (_, r) => Array.from({ length: Math.floor(w / 14) }, (_, j) => <ellipse key={`${r}-${j}`} cx={x + 7 + j * 14} cy={y + cu + (core / (n + 1)) * (r + 1)} rx={5} ry={2.6} fill={YARN} />))}
    <rect x={x} y={y + cu + core} width={w} height={cu} fill={CU} /></g>
);
const FlagBox: React.FC<{ code: string; x: number; y: number; a: number }> = ({ code, x, y, a }) => (
  <g><rect x={x} y={y} width={50} height={36} fill="none" stroke={a > 0.5 ? H.amber : H.lineSoft} strokeWidth={a > 0.5 ? 4 : 1.5} /><Flag code={code} h={28} x={x + 4} y={y + 4} asSvg /></g>
);
const NamePlate: React.FC<{ x: number; y: number; w: number; h: number; t: string; a: number; px?: number }> = ({ x, y, w, h, t, a, px = 32 }) => (
  <g><rect x={x} y={y} width={w} height={h} fill="#FFFFFF" stroke={a > 0.5 ? H.amber : H.lineSoft} strokeWidth={a > 0.5 ? 4 : 1.5} />
    <text x={x + w / 2} y={y + h / 2 + px * 0.34} textAnchor="middle" style={zh(px, "#1F3A5F", 900)}>{t}</text></g>
);
// 小電路板（綠漆＋走線＋銲墊＋過孔）
const MiniPcb: React.FC<{ x: number; y: number; w: number; h: number }> = ({ x, y, w, h }) => (
  <g><rect x={x} y={y} width={w} height={h} rx={4} fill={PCB} stroke={PCBD} strokeWidth={2} />
    {[0.22, 0.42, 0.62, 0.82].map((r, i) => <path key={i} d={`M${x + 8},${y + h * r} L${x + w * 0.45},${y + h * r} L${x + w * 0.58},${y + h * (r - 0.1)} L${x + w - 10},${y + h * (r - 0.1)}`} fill="none" stroke={PAD} strokeWidth={2.5} />)}
    {[0.22, 0.42, 0.62, 0.82].map((r, i) => <g key={`p${i}`}><circle cx={x + 8} cy={y + h * r} r={4} fill={PAD} /><circle cx={x + w - 10} cy={y + h * (r - 0.1)} r={4.5} fill={PAD} /><circle cx={x + w - 10} cy={y + h * (r - 0.1)} r={1.8} fill={PCBD} /></g>)}
    <rect x={x + w * 0.3} y={y + h * 0.04} width={w * 0.34} height={h * 0.13} fill={SI} /></g>
);


const Rough: React.FC<{ x: number; y: number; w: number; amp: number; p?: number; c?: string; th?: number }> = ({ x, y, w, amp, p = 14, c = CU, th = 18 }) => {
  const n = Math.floor(w / p), pts = Array.from({ length: n + 1 }, (_, i) => `L${x + i * p},${y - (i % 2 ? amp : 0)}`).join(" ");
  return <path d={`M${x},${y + th} L${x},${y} ${pts} L${x + n * p},${y + th} Z`} fill={c} />;
};
// ── cuf-hook：布要多平、銅要多光滑？樹脂換了，布和銅也得升級 ──
const Hook: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330, fl = on(f, T(o, "flat")), sm = on(f, T(o, "smooth")), rs = on(f, T(o, "resin")), up = on(f, T(o, "up"));
  return (<Card o={o} k={k} W={W} Hh={Hh}><Sv W={W} Hh={Hh}>
    <g opacity={0.4 + 0.6 * fl}><Weave x={30} y={CT + 36} w={128} h={96} p={16} /></g>
    <Cap x={94} y={CT + 166} t="玻纖布" />
    <g opacity={0.4 + 0.6 * sm}><Rough x={186} y={CT + 92} w={126} amp={10 * (1 - 0.8 * up)} /></g>
    <Cap x={249} y={CT + 166} t="銅箔" />
    <g opacity={0.4 + 0.6 * rs}><rect x={30} y={CT + 196} width={282} height={26} fill={RESIN} stroke={PPD} strokeWidth={1.5} /><text x={171} y={CT + 218} textAnchor="middle" style={zh(22, "#5B3A12", 900)}>樹脂（上一集）</text></g>
    <Sep x={334} />
    <Row x={360} y={CT + 48} t="布要多平？" c={BLUE} a={fl} />
    <Row x={360} y={CT + 108} t="銅要多光滑？" c={CU} a={sm} />
    <Row x={360} y={CT + 168} t="前一集：換了樹脂" c={H.text2} a={rs} />
    <Row x={360} y={CT + 228} t="布和銅也得升級" c={H.amber} a={up} />
  </Sv></Card>);
};
// ── cuf-drum：電解：銅從藥水長到轉動的滾筒，撕下來＝煎潤餅皮 ──
const Drum: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330, ep = on(f, T(o, "plate")), gr = on(f, T(o, "grow")), pe = on(f, T(o, "peel")), cr = on(f, T(o, "crepe"));
  const cx = 130, cy = CT + 120, R = 62, rot = (f - o.at) * 1.2;
  return (<Card o={o} k={k} W={W} Hh={Hh}><Sv W={W} Hh={Hh}>
    <path d={`M40,${cy - 8} L40,${cy + 80} L220,${cy + 80} L220,${cy - 8}`} fill="#CFE6F2" stroke={H.text2} strokeWidth={3} />
    <path d={`M${cx - 80},${cy + 10} A84,84 0 0,0 ${cx + 80},${cy + 10}`} fill="none" stroke={H.text2} strokeWidth={8} opacity={0.4 + 0.6 * ep} />
    <circle cx={cx} cy={cy} r={R} fill="#B8C2CF" stroke={H.text2} strokeWidth={2} />
    <circle cx={cx} cy={cy} r={R + 4} fill="none" stroke={CU} strokeWidth={6 * gr} strokeDasharray={`${Math.PI * R * 1.1} 999`} transform={`rotate(${90 + rot % 360 * 0} ${cx} ${cy})`} />
    <g transform={`rotate(${rot} ${cx} ${cy})`}>{[0, 60, 120, 180, 240, 300].map((d) => <line key={d} x1={cx} y1={cy} x2={cx + Math.cos(d * Math.PI / 180) * (R - 10)} y2={cy + Math.sin(d * Math.PI / 180) * (R - 10)} stroke={H.text2} strokeWidth={2} />)}</g>
    {[0, 1, 2].map((j) => <ArrV key={j} x={cx - 40 + j * 40} y1={cy + 76} y2={cy + 58} c={OK} w={3} />)}
    <g opacity={pe}><path d={`M${cx},${cy - R - 4} L${cx + 120},${cy - R - 4} L${cx + 150},${cy - R + 20}`} fill="none" stroke={CU} strokeWidth={6} /><circle cx={cx + 162} cy={cy - R + 40} r={26} fill={CU} stroke="#8A4E22" strokeWidth={2} /></g>
    <Cap x={cx} y={CT + 248} t="鈦滾筒（陰極）" />
    <Sep x={334} />
    <Row x={360} y={CT + 48} t="銅箔是電鍍出來的" c={H.text2} a={ep} />
    <Row x={360} y={CT + 108} t="銅從藥水長到滾筒" c={OK} a={gr} />
    <Row x={360} y={CT + 168} t="再連續撕下來捲起" c={CU} a={pe} />
    <Row x={360} y={CT + 228} t="像煎潤餅皮" c={BLUE} a={cr} />
  </Sv></Card>);
};
// ── cuf-nod：光面平、粗面長小銅瘤，咬住樹脂＝魔鬼氈 ──
const Nod: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330, sh = on(f, T(o, "shiny")), nd = on(f, T(o, "nod")), vc = on(f, T(o, "velcro")), bt = on(f, T(o, "bite"));
  const y0 = CT + 150, x0 = 30, w = 282, dn = 40 * (1 - cl01((f - T(o, "bite")) / 14));
  return (<Card o={o} k={k} W={W} Hh={Hh}><Sv W={W} Hh={Hh}>
    <rect x={x0} y={y0} width={w} height={34} fill={CU} />
    <line x1={x0} y1={y0 + 34} x2={x0 + w} y2={y0 + 34} stroke={CUH} strokeWidth={5} opacity={0.4 + 0.6 * sh} />
    <text x={x0 + w / 2} y={y0 + 70} textAnchor="middle" style={zh(24, H.text2, 800)}>光面（貼滾筒）</text>
    {Array.from({ length: 14 }, (_, i) => <circle key={i} cx={x0 + 10 + i * 20} cy={y0 - 4} r={3 + 6 * nd} fill={CU} stroke="#8A4E22" strokeWidth={1} />)}
    <text x={x0} y={y0 - 26} style={zh(24, H.text2, 800)} opacity={nd}>粗面：小銅瘤</text>
    <g opacity={bt} transform={`translate(0,${-dn})`}><path d={`M${x0},${CT + 50} L${x0 + w},${CT + 50} L${x0 + w},${y0 - 6} ${Array.from({ length: 14 }, (_, i) => `L${x0 + w - 10 - i * 20},${y0 + 2} L${x0 + w - 20 - i * 20},${y0 - 8}`).join(" ")} L${x0},${y0 - 8} Z`} fill={RESIN} opacity={0.85} /><text x={x0 + w / 2} y={CT + 82} textAnchor="middle" style={zh(24, "#5B3A12", 900)}>樹脂</text></g>
    <Sep x={334} />
    <Row x={360} y={CT + 48} t="貼滾筒那面：光滑" c={H.text2} a={sh} />
    <Row x={360} y={CT + 108} t="另一面：長滿小銅瘤" c={CU} a={nd} />
    <Row x={360} y={CT + 168} t="像魔鬼氈" c={BLUE} a={vc} />
    <Row x={360} y={CT + 228} t="咬住樹脂，黏得牢" c={OK} a={bt} />
  </Sv></Card>);
};
// ── cuf-skin：高速訊號擠在銅表面走；表面粗＝路彎（洗衣板） ──
const Skin: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330, sp = on(f, T(o, "fast")), sf = on(f, T(o, "surf")), bd = on(f, T(o, "bend")), wb = on(f, T(o, "board"));
  const y0 = CT + 130, x0 = 30, w = 282, n = 14, p = w / n;
  const path = Array.from({ length: n + 1 }, (_, i) => `${i ? "L" : "M"}${x0 + i * p},${y0 - (i % 2 ? 14 : 0)}`).join(" ");
  const ph = ((f - T(o, "surf")) / 70) % 1;
  return (<Card o={o} k={k} W={W} Hh={Hh}><Sv W={W} Hh={Hh}>
    <rect x={x0} y={y0} width={w} height={70} fill={CU} opacity={0.35 + 0.35 * (1 - sf)} />
    <rect x={x0} y={y0} width={w} height={70} fill={CU} opacity={0} />
    <path d={`${path} L${x0 + w},${y0 + 70} L${x0},${y0 + 70} Z`} fill={CU} />
    <path d={path} fill="none" stroke={SIG} strokeWidth={8} opacity={0.25 + 0.75 * sf} />
    {sf > 0 ? [0, 0.33, 0.66].map((d) => { const t = (ph + d) % 1, i = Math.floor(t * n), r = t * n - i, ya = y0 - (i % 2 ? 14 : 0), yb = y0 - ((i + 1) % 2 ? 14 : 0);
      return <circle key={d} cx={x0 + (i + r) * p} cy={ya + (yb - ya) * r} r={8} fill="#FFFFFF" stroke={SIG} strokeWidth={3} />; }) : null}
    <text x={x0} y={y0 + 104} style={zh(24, H.text2, 800)} opacity={sf}>訊號（藍）只走表面一層</text>
    <text x={x0} y={CT + 70} style={zh(24, RED, 900)} opacity={bd}>表面越粗，路越彎、越耗</text>
    <Sep x={334} />
    <Row x={360} y={CT + 48} t="伺服器訊號很快" c={BLUE} a={sp} />
    <Row x={360} y={CT + 108} t="大多擠在銅表面走" c={SIG} a={sf} />
    <Row x={360} y={CT + 168} t="表面越粗路越彎" c={RED} a={bd} />
    <Row x={360} y={CT + 228} t="像在洗衣板跑步" c={H.amber} a={wb} />
  </Sv></Card>);
};
// ── cuf-hvlp：低粗糙度銅箔：更平（損耗少）↔ 黏得牢（銅瘤小）互相拉扯 ──
const Hvlp: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330, lp = on(f, T(o, "low")), fl = on(f, T(o, "flat")), gl = on(f, T(o, "glue")), hd = on(f, T(o, "hard"));
  const amp = 14 * (1 - 0.8 * cl01((f - T(o, "low")) / 20));
  const tilt = hd * Math.sin((f - T(o, "hard")) / 9) * 6;
  return (<Card o={o} k={k} W={W} Hh={Hh}><Sv W={W} Hh={Hh}>
    <text x={30} y={CT + 40} style={zh(24, H.text2, 800)}>一般 → 低粗糙度（示意）</text>
    <Rough x={30} y={CT + 92} w={282} amp={amp} />
    <line x1={30} y1={CT + 78} x2={312} y2={CT + 78} stroke={SIG} strokeWidth={6} opacity={0.3 + 0.7 * fl} />
    <g transform={`rotate(${tilt} 171 ${CT + 196})`}>
      <line x1={60} y1={CT + 196} x2={282} y2={CT + 196} stroke={H.text2} strokeWidth={5} />
      <rect x={52} y={CT + 166} width={84} height={30} fill={SIG} opacity={0.4 + 0.6 * fl} /><text x={94} y={CT + 189} textAnchor="middle" style={zh(22, "#FFFFFF", 900)}>平</text>
      <rect x={206} y={CT + 166} width={84} height={30} fill={OK} opacity={0.4 + 0.6 * gl} /><text x={248} y={CT + 189} textAnchor="middle" style={zh(22, "#FFFFFF", 900)}>黏牢</text>
    </g>
    <path d={`M161,${CT + 226} L171,${CT + 200} L181,${CT + 226} Z`} fill={H.text2} />
    <Sep x={334} />
    <Row x={360} y={CT + 48} t="用低粗糙度銅箔" c={CU} a={lp} />
    <Row x={360} y={CT + 108} t="做得更平：訊號少繞路" c={SIG} a={fl} />
    <Row x={360} y={CT + 168} t="又要黏得牢" c={OK} a={gl} />
    <Row x={360} y={CT + 228} t="兩頭拉扯，這最難" c={RED} a={hd} />
  </Sv></Card>);
};
// ── cuf-weave：玻璃拉絲 → 捻紗 → 一經一緯平織＝編竹蓆 ──
const WeaveC: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330, dr = on(f, T(o, "draw")), tw = on(f, T(o, "twist")), wv = on(f, T(o, "weave")), mt = on(f, T(o, "mat"));
  const nf = Math.floor(cl01((f - T(o, "weave")) / 40) * 6);
  return (<Card o={o} k={k} W={W} Hh={Hh}><Sv W={W} Hh={Hh}>
    <g opacity={0.4 + 0.6 * dr}><rect x={30} y={CT + 30} width={70} height={30} fill={HOT} />{Array.from({ length: 6 }, (_, i) => <line key={i} x1={38 + i * 11} y1={CT + 60} x2={62 + i * 1.5} y2={CT + 170} stroke={YARND} strokeWidth={2} />)}</g>
    <Cap x={65} y={CT + 200} t="拉絲" />
    <g opacity={0.4 + 0.6 * tw}>{Array.from({ length: 6 }, (_, i) => <path key={i} d={`M126,${CT + 50 + i * 20} q14,-10 28,0 q14,10 28,0`} fill="none" stroke={YARND} strokeWidth={5} />)}</g>
    <Cap x={154} y={CT + 200} t="捻紗" />
    <g opacity={0.4 + 0.6 * Math.max(wv, mt)}><Weave x={206} y={CT + 40} w={106} h={16 * Math.max(1, nf) + 0.1} p={16} /></g>
    <Cap x={259} y={CT + 200} t="平織" />
    <Sep x={334} />
    <Row x={360} y={CT + 48} t="玻璃拉成細絲" c={HOT} a={dr} />
    <Row x={360} y={CT + 108} t="捻成紗" c={H.text2} a={tw} />
    <Row x={360} y={CT + 168} t="一經一緯織成布" c={BLUE} a={wv} />
    <Row x={360} y={CT + 228} t="像編竹蓆" c={OK} a={mt} />
  </Sv></Card>);
};
// ── cuf-skew：紗（玻璃多）慢、空隙（樹脂多）快 → 一對訊號對不齊 ──
const Skew: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330, ya = on(f, T(o, "yarn")), sl = on(f, T(o, "speed")), pr = on(f, T(o, "pair")), mis = on(f, T(o, "skew"));
  const t = cl01((f - T(o, "speed")) / 60), xa = 40 + 220 * t * 0.78, xb = 40 + 220 * t;
  return (<Card o={o} k={k} W={W} Hh={Hh}><Sv W={W} Hh={Hh}>
    <rect x={30} y={CT + 40} width={282} height={150} fill={RESIN} opacity={0.5} />
    {[0, 1, 2].map((j) => <rect key={j} x={30} y={CT + 52 + j * 48} width={282} height={26} rx={12} fill={YARN} stroke={YARND} strokeWidth={2} opacity={0.4 + 0.6 * ya} />)}
    <line x1={30} y1={CT + 65} x2={312} y2={CT + 65} stroke={CU} strokeWidth={5} /><line x1={30} y1={CT + 89} x2={312} y2={CT + 89} stroke={CU} strokeWidth={5} />
    <circle cx={xa} cy={CT + 65} r={9} fill="#FFFFFF" stroke={SIG} strokeWidth={3} opacity={sl} /><circle cx={xb} cy={CT + 89} r={9} fill="#FFFFFF" stroke={SIG} strokeWidth={3} opacity={sl} />
    <text x={30} y={CT + 222} style={zh(22, H.text2, 800)} opacity={ya}>白＝紗　黃＝空隙</text>
    <g opacity={mis}><line x1={xa} y1={CT + 36} x2={xa} y2={CT + 110} stroke={RED} strokeWidth={3} strokeDasharray="6 5" /><line x1={xb} y1={CT + 36} x2={xb} y2={CT + 110} stroke={RED} strokeWidth={3} strokeDasharray="6 5" />
      <text x={(xa + xb) / 2} y={CT + 30} textAnchor="middle" style={zh(22, RED, 900)}>差一段</text></g>
    <Sep x={334} />
    <Row x={360} y={CT + 56} t="紗和空隙不一樣" c={H.text2} a={ya} />
    <Row x={360} y={CT + 122} t="訊號快慢不一" c={SIG} a={sl} />
    <Row x={360} y={CT + 188} t="一對訊號就對不齊" c={RED} a={Math.max(pr, mis)} />
  </Sv></Card>);
};
// ── cuf-spread：把紗攤平（梳開辮子）→ 換低介電玻璃：更快、損耗更少 ──
const Spread: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330, fl = on(f, T(o, "flat")), br = on(f, T(o, "braid")), ld = on(f, T(o, "lowdk")), fs = on(f, T(o, "fast"));
  const s = cl01((f - T(o, "flat")) / 24), h = 26 - 12 * s, gap = 22 - 18 * s;
  return (<Card o={o} k={k} W={W} Hh={Hh}><Sv W={W} Hh={Hh}>
    <rect x={30} y={CT + 40} width={282} height={150} fill={RESIN} opacity={0.5} />
    {[0, 1, 2].map((j) => <rect key={j} x={30} y={CT + 58 + j * (h + gap)} width={282} height={h} rx={h / 2} fill={ld > 0.5 ? "#CFE9DD" : YARN} stroke={ld > 0.5 ? OK : YARND} strokeWidth={2} />)}
    <text x={30} y={CT + 222} style={zh(22, H.text2, 800)}>{ld > 0.5 ? "綠＝低介電玻璃（示意）" : s > 0.5 ? "攤平：空隙變小" : "圓圓的紗束"}</text>
    <Sep x={334} />
    <Row x={360} y={CT + 48} t="把紗攤平" c={BLUE} a={fl} />
    <Row x={360} y={CT + 108} t="像把辮子梳開" c={H.text2} a={br} />
    <Row x={360} y={CT + 168} t="再換低介電玻璃" c={OK} a={ld} />
    <Row x={360} y={CT + 228} t="訊號更快、損耗更少" c={H.amber} a={fs} />
  </Sv></Card>);
};
// ── cuf-co：台灣三家（念到的順序；不排名） ──
const Co: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 392, a1 = on(f, T(o, "cotech")), a2 = on(f, T(o, "tglass")), a3 = on(f, T(o, "fulltech"));
  const rows: [string, string, string, number][] = [["TW", "金居 8358", "低粗糙度銅箔", a1], ["TW", "台玻 1802", "低介電玻纖布", a2], ["TW", "富喬 1815", "低介電玻纖布", a3]];
  return (<Card o={o} k={k} W={W} Hh={Hh}><Sv W={W} Hh={Hh}>
    {rows.map(([c, n, s, a], i) => <g key={n}><FlagBox code={c} x={30} y={CT + 36 + i * 96} a={a} /><NamePlate x={98} y={CT + 30 + i * 96} w={300} h={50} t={n} a={a} />
      <text x={418} y={CT + 66 + i * 96} style={zh(30, H.text2, 800)} opacity={0.4 + 0.6 * a}>{s}</text></g>)}
  </Sv></Card>);
};
// ── cuf-next：布和銅升級好 → 做成主機板 → 下一集伺服器主機板（為什麼越疊越多層）＋留言 ──
const Next: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330, up = on(f, T(o, "up")), mb = on(f, T(o, "mb")), ly = on(f, T(o, "stack")), nx = on(f, T(o, "next")), kw = on(f, T(o, "kw"));
  const n = 4 + Math.round(8 * cl01((f - T(o, "stack")) / 30));
  return (<Card o={o} k={k} W={W} Hh={Hh}><Sv W={W} Hh={Hh}>
    <g opacity={0.4 + 0.6 * Math.max(up, mb)}><MiniPcb x={30} y={CT + 30} w={150} h={110} /></g>
    <Cap x={105} y={CT + 180} t="主機板" />
    <g opacity={0.4 + 0.6 * ly}>{Array.from({ length: n }, (_, i) => <g key={i}><rect x={206} y={CT + 150 - i * 11} width={104} height={8} fill={PP} stroke={PPD} strokeWidth={1} /><rect x={206} y={CT + 147 - i * 11} width={104} height={3} fill={CU} /></g>)}</g>
    <Cap x={258} y={CT + 196} t="越疊越多層" />
    <Sep x={334} />
    <Row x={360} y={CT + 48} t="布和銅升級好了" c={H.text2} a={up} />
    <Row x={360} y={CT + 104} t="最後做成主機板" c={CU} a={mb} />
    <Row x={360} y={CT + 160} t="下一集：伺服器主機板" c={OK} a={Math.max(nx, ly)} />
    <Row x={360} y={CT + 216} t="留言「玻纖布」拿資料" c={H.amber} a={kw} />
  </Sv></Card>);
};

export const CufoilSection: React.FC<P> = (p) => {
  const kd = String((p.o as any).kind);
  const M: Record<string, React.FC<P>> = { "cuf-hook": Hook, "cuf-drum": Drum, "cuf-nod": Nod, "cuf-skin": Skin, "cuf-hvlp": Hvlp, "cuf-weave": WeaveC, "cuf-skew": Skew, "cuf-spread": Spread, "cuf-co": Co, "cuf-next": Next };
  const C2 = M[kd]; return C2 ? <C2 {...p} /> : null;
};

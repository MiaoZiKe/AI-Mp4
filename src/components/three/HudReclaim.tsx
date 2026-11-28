// 2026/11/28 tech-reclaim：中游補充篇 M4「再生晶圓」的 2D 示意卡（overlay `section` 的 kind 以 "reclaim-" 開頭，Hud.tsx 轉過來）。
//   reclaim-hook 前一集測機台片子能再用→不做晶片的晶圓？→測試｜reclaim-test 試跑＝試一口湯、測膜厚、數灰塵｜reclaim-dummy 擋片＝烤盤假餅乾
//   reclaim-used 跑一趟沾滿薄膜（剖面）→丟掉太貴→送去再生｜reclaim-strip 泡藥水一層層溶掉＝鍋子去油垢｜reclaim-cmp 研磨→拋光→清洗→檢查
//   reclaim-thin 每次變薄、六到二十次、太薄淘汰｜reclaim-tw 昇陽半、中砂、辛耘｜reclaim-next 密封盒→下一集光罩盒與晶圓載具；留言關鍵字。
// LOGO 只用 Brand.tsx LOGOS 表的原檔（100% 不透明，未輪到細灰框、輪到粗框）；沒有原檔的公司（昇陽半）用白底深色文字名牌（不仿商標）。
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
// 示意色（材料本身的顏色，不是頻道色票）
const RED = "#E0472F", OK = "#14A38B", BLUE = "#2F7FE0", SIL = "#A9B5C7", MIR = "#C9D3E2", DIE = "#4C5E86", OX = "#5FC4E8", NIT = "#7FCB8A", MET = "#C8794A",
  LIQ = "#6FB7E8", HEAT = "#FF8A3D", POT = "#5E6B82", SOUP = "#E9A13B", TRAY = "#8E9BB0", COOK = "#B9865A", COOKD = "#8A5E3A", FAKE = "#C9CED8", GREASE = "#8F6A2A", DUST = "#C9A66B", BOXC = "#8FA3BF";
const Sep: React.FC<{ x: number; y2?: number }> = ({ x, y2 = 316 }) => <line x1={x} y1={CT + 4} x2={x} y2={y2} stroke={H.lineSoft} strokeWidth={3} />;
const Row: React.FC<{ x: number; y: number; t: string; c: string; a: number; px?: number }> = ({ x, y, t, c, a, px = 30 }) => (
  <g opacity={0.35 + 0.65 * a}><rect x={x} y={y - px * 0.72} width={12} height={px * 0.72} fill={c} /><text x={x + 24} y={y} style={zh(px, H.text, 900)}>{t}</text></g>
);
const Cap: React.FC<{ x: number; y: number; t: string; px?: number }> = ({ x, y, t, px = 26 }) => <text x={x} y={y} textAnchor="middle" style={zh(px, H.text2, 800)}>{t}</text>;
const Sv: React.FC<{ W: number; Hh: number; children: React.ReactNode }> = ({ W, Hh, children }) => <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>{children}</svg>;
const Arr: React.FC<{ x1: number; y: number; x2: number; c: string; w?: number }> = ({ x1, y, x2, c, w = 4 }) => { const d = Math.sign(x2 - x1) || 1; return (
  <g><line x1={x1} y1={y} x2={x2 - d * 8} y2={y} stroke={c} strokeWidth={w} /><path d={`M${x2},${y} L${x2 - d * 14},${y - 8} L${x2 - d * 14},${y + 8} Z`} fill={c} /></g>); };
const FlagBox: React.FC<{ code: string; x: number; y: number; a: number }> = ({ code, x, y, a }) => (
  <g><rect x={x} y={y} width={50} height={36} fill="none" stroke={a > 0.5 ? H.amber : H.lineSoft} strokeWidth={a > 0.5 ? 4 : 1.5} /><Flag code={code} h={28} x={x + 4} y={y + 4} asSvg /></g>
);
const Brand: React.FC<{ id: string; name: string; x: number; y: number; w: number; h: number; a: number }> = ({ id, name, x, y, w, h, a }) => {
  const s = LOGOS[id]; const lh = h - 14, lw = s ? Math.min(w - 16, (lh * s.w) / s.h) : 0, lh2 = s ? (lw * s.h) / s.w : 0;
  return (<g><rect x={x} y={y} width={w} height={h} fill="#FFFFFF" stroke={a > 0.5 ? H.amber : H.lineSoft} strokeWidth={a > 0.5 ? 4 : 1.5} />
    {s ? <LogoSvg id={id} x={x + (w - lw) / 2} y={y + (h - lh2) / 2} h={lh2} /> : <text x={x + w / 2} y={y + h / 2 + 11} textAnchor="middle" style={zh(30, "#1F3A5F", 900)}>{name}</text>}</g>);
};
// 晶圓（正面）：dies＝產品片晶粒格；否則鏡面＋一道反光
const Wafer: React.FC<{ cx: number; cy: number; r: number; dies?: boolean; rot?: number }> = ({ cx, cy, r, dies = false, rot = 0 }) => {
  const n = 7, g = (r * 2) / n, cells: React.ReactNode[] = [];
  if (dies) for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) { const x = cx - r + i * g, y = cy - r + j * g; if (Math.hypot(Math.abs(x + g / 2 - cx) + g / 2, Math.abs(y + g / 2 - cy) + g / 2) < r * 0.97) cells.push(<rect key={`${i}-${j}`} x={x + 1.5} y={y + 1.5} width={g - 3} height={g - 3} fill={DIE} />); }
  return (<g transform={`rotate(${rot} ${cx} ${cy})`}><circle cx={cx} cy={cy} r={r} fill={dies ? SIL : MIR} stroke={H.text2} strokeWidth={2} />{cells}
    {!dies ? <path d={`M${cx - r * 0.55},${cy - r * 0.35} Q${cx},${cy - r * 0.8} ${cx + r * 0.55},${cy - r * 0.35}`} fill="none" stroke="#FFFFFF" strokeWidth={6} opacity={0.8} /> : null}
    <rect x={cx - 5} y={cy + r - 6} width={10} height={8} fill={H.cardCompare} /></g>);
};

// ── reclaim-hook：前一集測機台的片子能再用 → 不做晶片的晶圓拿來幹嘛？→ 測試 ──
const Hook: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330, pv = on(f, T(o, "prev")), re = on(f, T(o, "test")), q = on(f, T(o, "q")), ch = on(f, T(o, "chip")), ts = on(f, T(o, "tool"));
  return (<Card o={o} k={k} W={W} Hh={Hh}><Sv W={W} Hh={Hh}>
    <g opacity={0.5 + 0.5 * pv}><Wafer cx={92} cy={CT + 110} r={60} dies /></g>
    <g opacity={0.4 + 0.6 * Math.max(re, ts)}><Wafer cx={236} cy={CT + 110} r={60} /></g>
    <g opacity={q * (1 - ts)}><circle cx={236} cy={CT + 110} r={36} fill="#FFFFFF" stroke={RED} strokeWidth={3} /><text x={236} y={CT + 123} textAnchor="middle" style={zh(34, RED, 900)}>？</text></g>
    <Cap x={92} y={CT + 214} t="產品片" /><Cap x={236} y={CT + 214} t="測試片" />
    <Sep x={334} />
    <Row x={360} y={CT + 64} t="前一集：測試片磨掉一層再用" c={H.text2} a={Math.max(pv, re)} />
    <Row x={360} y={CT + 138} t="到底拿來幹嘛？" c={BLUE} a={q} />
    <Row x={360} y={CT + 212} t="不做晶片，專門測機台" c={H.amber} a={Math.max(ch, ts)} />
  </Sv></Card>);
};
// ── reclaim-test：機台開工前先試跑一片 → 像廚師先試一口湯 → 測膜厚、數灰塵 ──
const Test: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330, bl = on(f, T(o, "blank")), rn = on(f, T(o, "run")), sp = on(f, T(o, "soup")), fm = on(f, T(o, "film")), du = on(f, T(o, "dust"));
  const py = CT + 110;
  return (<Card o={o} k={k} W={W} Hh={Hh}><Sv W={W} Hh={Hh}>
    <g opacity={0.4 + 0.6 * sp}>
      <rect x={48} y={py} width={170} height={96} rx={10} fill={POT} stroke={H.text2} strokeWidth={2} />
      <rect x={36} y={py - 10} width={194} height={16} rx={6} fill={POT} /><rect x={20} y={py + 20} width={28} height={12} fill={POT} /><rect x={218} y={py + 20} width={28} height={12} fill={POT} />
      <ellipse cx={133} cy={py} rx={88} ry={10} fill={SOUP} />
      {[0, 1, 2].map((i) => <path key={i} d={`M${100 + i * 34},${py - 20} q-10,-18 0,-34 q10,-16 0,-32`} fill="none" stroke={H.text2} strokeWidth={3} opacity={0.6} transform={`translate(0 ${-((f * 0.6 + i * 9) % 12)})`} />)}
      <line x1={238} y1={py - 70} x2={170} y2={py - 4} stroke={COOKD} strokeWidth={8} strokeLinecap="round" /><ellipse cx={168} cy={py - 2} rx={18} ry={9} fill={COOKD} />
    </g>
    <g opacity={0.4 + 0.6 * Math.max(bl, rn)}><Wafer cx={286} cy={CT + 200} r={30} /></g>
    <Cap x={133} y={CT + 246} t="先試一口湯" />
    <Sep x={334} />
    <Row x={360} y={CT + 52} t="開工前：先放空白晶圓試跑" c={BLUE} a={Math.max(bl, rn)} />
    <Row x={360} y={CT + 114} t="像廚師先試一口湯" c={H.amber} a={sp} />
    <Row x={360} y={CT + 176} t="測膜厚：膜長得夠不夠厚" c={OK} a={fm} />
    <Row x={360} y={CT + 238} t="數灰塵：表面乾不乾淨" c={OK} a={du} />
  </Sv></Card>);
};
// ── reclaim-dummy：擋片補在爐管空位 → 烤盤沒排滿用假餅乾補位 → 熱才均勻 ──
const Dummy: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330, dm = on(f, T(o, "dum")), gp = on(f, T(o, "gap")), tr = on(f, T(o, "tray")), ck = on(f, T(o, "cookie")), ht = on(f, T(o, "heat"));
  const ty = CT + 126;
  return (<Card o={o} k={k} W={W} Hh={Hh}><Sv W={W} Hh={Hh}>
    <g opacity={0.4 + 0.6 * Math.max(tr, ck)}>
      <rect x={24} y={ty} width={288} height={70} rx={8} fill={TRAY} stroke={H.text2} strokeWidth={2} />
      {[0, 1, 2, 3, 4, 5].map((i) => { const fake = i === 0 || i === 5, x = 52 + i * 46; return fake
        ? <g key={i} opacity={ck}><circle cx={x} cy={ty + 35} r={19} fill={FAKE} stroke={H.text2} strokeWidth={2} strokeDasharray="5 4" /></g>
        : <g key={i}><circle cx={x} cy={ty + 35} r={19} fill={COOK} stroke={COOKD} strokeWidth={2} /><circle cx={x - 6} cy={ty + 30} r={3} fill={COOKD} /><circle cx={x + 6} cy={ty + 40} r={3} fill={COOKD} /></g>; })}
      {[0, 1, 2, 3, 4].map((i) => <path key={`h${i}`} d={`M${48 + i * 60},${ty - 12} q-8,-14 0,-28 q8,-14 0,-28`} fill="none" stroke={HEAT} strokeWidth={4} opacity={0.3 + 0.7 * ht} />)}
    </g>
    <Cap x={168} y={CT + 246} t="空位放假餅乾" />
    <Sep x={334} />
    <Row x={360} y={CT + 52} t="擋片：補在爐管的空位" c={BLUE} a={Math.max(dm, gp)} />
    <Row x={360} y={CT + 114} t="像烤盤沒排滿" c={H.text2} a={tr} />
    <Row x={360} y={CT + 176} t="用假餅乾補位" c={H.amber} a={ck} />
    <Row x={360} y={CT + 238} t="熱才均勻" c={RED} a={ht} />
  </Sv></Card>);
};
// ── reclaim-used：跑一趟沾滿薄膜（剖面）→ 丟掉太貴 → 送去再生 ──
const Used: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330, rn = on(f, T(o, "run")), fm = on(f, T(o, "film")), ts = on(f, T(o, "toss")), sh = on(f, T(o, "ship"));
  const x0 = 40, w = 250, y0 = CT + 200;
  const lay: [string, string, number][] = [["矽晶圓", SIL, 46], ["氧化層", OX, 18], ["氮化層", NIT, 16], ["金屬層", MET, 14]];
  let yy = y0; const rects: React.ReactNode[] = [];
  lay.forEach(([n, c, h], i) => { yy -= h; const a = i === 0 ? 1 : fm; rects.push(<g key={n} opacity={a}><rect x={x0} y={yy} width={w} height={h} fill={c} stroke={H.text2} strokeWidth={1.5} /></g>); });
  return (<Card o={o} k={k} W={W} Hh={Hh}><Sv W={W} Hh={Hh}>
    <g opacity={0.4 + 0.6 * Math.max(rn, fm)}>{rects}</g>
    <text x={x0 + w / 2} y={y0 + 34} textAnchor="middle" style={zh(24, H.text2, 800)}>剖面（膜厚放大）</text>
    <g opacity={ts * (1 - sh)}><line x1={x0} y1={CT + 40} x2={x0 + w} y2={y0} stroke={RED} strokeWidth={6} /><line x1={x0 + w} y1={CT + 40} x2={x0} y2={y0} stroke={RED} strokeWidth={6} /></g>
    <Sep x={334} />
    <Row x={360} y={CT + 64} t="跑一趟：沾滿薄膜" c={OK} a={Math.max(rn, fm)} />
    <Row x={360} y={CT + 138} t="直接丟掉：太貴" c={RED} a={ts} />
    <Row x={360} y={CT + 212} t="所以：送去再生" c={H.amber} a={sh} />
    <g opacity={sh}><Arr x1={700} y={CT + 268} x2={880} c={H.amber} w={5} /></g>
  </Sv></Card>);
};
// ── reclaim-strip：泡藥水 → 薄膜和金屬一層層溶掉 → 像鍋子去油垢 ──
const Strip: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330, dp = on(f, T(o, "dip")), mt = on(f, T(o, "metal"), 20), ly = on(f, T(o, "lyr"), 20), pn = on(f, T(o, "pan"));
  const y0 = CT + 106;
  return (<Card o={o} k={k} W={W} Hh={Hh}><Sv W={W} Hh={Hh}>
    <rect x={30} y={y0 - 40} width={276} height={150} rx={8} fill={LIQ} opacity={0.25 + 0.35 * dp} stroke={H.text2} strokeWidth={2} />
    <rect x={70} y={y0 + 40} width={196} height={22} fill={SIL} stroke={H.text2} strokeWidth={1.5} />
    <rect x={70} y={y0 + 26} width={196} height={14} fill={OX} opacity={1 - pn} />
    <rect x={70} y={y0 + 14} width={196} height={12} fill={NIT} opacity={1 - ly} />
    <rect x={70} y={y0 + 2} width={196} height={12} fill={MET} opacity={1 - mt} />
    {[0, 1, 2, 3, 4, 5].map((i) => <circle key={i} cx={56 + i * 44} cy={y0 + 96 - ((f * 1.3 + i * 17) % 120)} r={5} fill="#FFFFFF" stroke={LIQ} strokeWidth={2} opacity={dp} />)}
    <Cap x={168} y={CT + 246} t="外層先溶、晶圓留下" />
    <Sep x={334} />
    <Row x={360} y={CT + 64} t="第一步：泡藥水" c={BLUE} a={dp} />
    <Row x={360} y={CT + 138} t="薄膜和金屬一層層溶掉" c={OK} a={Math.max(mt, ly)} />
    <g opacity={0.35 + 0.65 * pn}><ellipse cx={420} cy={CT + 238} rx={44} ry={20} fill={POT} /><ellipse cx={420} cy={CT + 232} rx={34} ry={12} fill={GREASE} opacity={1 - pn * 0.8} /><line x1={462} y1={CT + 236} x2={500} y2={CT + 244} stroke={POT} strokeWidth={8} strokeLinecap="round" />
      <text x={520} y={CT + 248} style={zh(30, H.text, 900)}>像幫鍋子去油垢</text></g>
  </Sv></Card>);
};
// ── reclaim-cmp：研磨 → 拋光（回鏡面）→ 清洗 → 檢查（側面輪廓由粗糙變平） ──
const Cmp: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330, gr = on(f, T(o, "grind")), pl = on(f, T(o, "pol")), mi = on(f, T(o, "mirror")), cl = on(f, T(o, "clean")), ins = on(f, T(o, "insp"));
  const y0 = CT + 80, x0 = 36, w = 264, rough = 1 - Math.max(gr * 0.6, mi);
  const pts = Array.from({ length: 23 }, (_, i) => `${x0 + i * 12},${y0 - 6 * rough * (i % 2 ? 1 : -0.6) * (1 + (i % 3) * 0.4)}`).join(" ");
  return (<Card o={o} k={k} W={W} Hh={Hh}><Sv W={W} Hh={Hh}>
    <polygon points={`${x0},${y0 + 40} ${pts} ${x0 + w},${y0 + 40}`} fill={SIL} stroke={H.text2} strokeWidth={2} />
    <g opacity={mi}><line x1={x0 + 10} y1={y0 - 2} x2={x0 + w - 10} y2={y0 - 2} stroke="#FFFFFF" strokeWidth={4} /></g>
    <Cap x={168} y={y0 + 82} t={mi > 0.5 ? "回到鏡面" : "表面粗糙"} />
    <g opacity={ins}><rect x={x0} y={CT + 186} width={w} height={10} fill="#2FD3E0" /><text x={168} y={CT + 240} textAnchor="middle" style={zh(26, OK, 900)}>檢查通過</text></g>
    <Sep x={334} />
    <Row x={360} y={CT + 52} t="研磨：磨掉薄薄一層" c={BLUE} a={gr} />
    <Row x={360} y={CT + 114} t="拋光：回到鏡面" c={H.amber} a={Math.max(pl, mi)} />
    <Row x={360} y={CT + 176} t="清洗：刷掉研磨液" c={OK} a={cl} />
    <Row x={360} y={CT + 238} t="檢查：刮傷、微粒" c={OK} a={ins} />
  </Sv></Card>);
};
// ── reclaim-thin：每磨一次薄一點 → 一片大約用六到二十次 → 太薄淘汰 ──
const Thin: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330, th = on(f, T(o, "thin")), us = on(f, T(o, "use")), n = on(f, T(o, "n")), ot = on(f, T(o, "out"));
  const hs = [56, 48, 40, 32, 22];
  return (<Card o={o} k={k} W={W} Hh={Hh}><Sv W={W} Hh={Hh}>
    {hs.map((h, i) => { const a = i === 0 ? 1 : cl01(th * 5 - i + 1); const last = i === 4; return (
      <g key={i} opacity={a} transform={last ? `translate(${ot * 6} ${ot * 12})` : undefined}>
        <rect x={34 + i * 56} y={CT + 190 - h} width={42} height={h} fill={MIR} stroke={last && ot > 0.5 ? RED : H.text2} strokeWidth={last && ot > 0.5 ? 4 : 2} /></g>); })}
    <line x1={24} y1={CT + 163} x2={316} y2={CT + 163} stroke={RED} strokeWidth={3} strokeDasharray="8 6" opacity={0.4 + 0.6 * ot} />
    <text x={168} y={CT + 240} textAnchor="middle" style={zh(22, RED, 800)} opacity={0.4 + 0.6 * ot}>虛線＝最薄規格（厚度放大）</text>
    <Sep x={334} />
    <Row x={360} y={CT + 64} t="每磨一次：薄一點" c={BLUE} a={th} />
    <Row x={360} y={CT + 138} t="一片大約用 6～20 次" c={H.amber} a={Math.max(us, n)} />
    <Row x={360} y={CT + 212} t="太薄：淘汰" c={RED} a={ot} />
  </Sv></Card>);
};
const cl01 = (x: number) => Math.min(1, Math.max(0, x));
// ── reclaim-tw：台灣三家：昇陽半（產能全球數一數二）、中砂（砂輪起家、再生約占營收一半）、辛耘（代理設備＋自做再生） ──
const Tw: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 392, a1 = on(f, T(o, "psi")), a2 = on(f, T(o, "kinik")), a3 = on(f, T(o, "sci")), hf = on(f, T(o, "half"));
  const rows: [string, string, string, number][] = [["psi", "昇陽半", "8028｜產能數一數二", a1], ["kinik", "中砂", "1560｜再生約占營收一半", a2], ["scientech", "辛耘", "3583｜代理設備也做再生", a3]];
  const cx = 168, cy = CT + 150, R = 96, ang = (f * 1.2) % 360;
  return (<Card o={o} k={k} W={W} Hh={Hh}><Sv W={W} Hh={Hh}>
    <circle cx={cx} cy={cy} r={R} fill="none" stroke={OK} strokeWidth={6} strokeDasharray="22 14" />
    {[0, 120, 240].map((d) => { const r = ((d + ang) * Math.PI) / 180; return <path key={d} d={`M${cx + R * Math.cos(r)},${cy + R * Math.sin(r)} l-10,-12 l20,0 Z`} fill={OK} transform={`rotate(${d + ang + 90} ${cx + R * Math.cos(r)} ${cy + R * Math.sin(r)})`} />; })}
    <Wafer cx={cx} cy={cy} r={46} />
    <Cap x={cx} y={CT + 290} t="用過→再生→再用" />
    <g opacity={hf}><rect x={40} y={CT + 310} width={256} height={20} fill={H.lineSoft} /><rect x={40} y={CT + 310} width={128 * hf} height={20} fill={H.amber} /></g>
    <Sep x={334} y2={376} />
    {rows.map(([id, n, s, a], i) => <g key={id}><FlagBox code="TW" x={360} y={CT + 26 + i * 96} a={a} /><Brand id={id} name={n} x={428} y={CT + 14 + i * 96} w={170} h={60} a={a} />
      <text x={614} y={CT + 54 + i * 96} style={zh(24, H.text2, 800)} opacity={0.4 + 0.6 * a}>{s}</text></g>)}
  </Sv></Card>);
};
// ── reclaim-next：晶圓不能沾灰塵 → 來回運送靠密封盒 → 下一集光罩盒與晶圓載具；留言關鍵字 ──
const Next: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330, du = on(f, T(o, "dust")), mv = on(f, T(o, "move")), bx = on(f, T(o, "box")), nx = on(f, T(o, "next")), pd = on(f, T(o, "pod")), kw = on(f, T(o, "kw"));
  const bxX = 90 + Math.sin(f * 0.06) * 30 * mv, by = CT + 60;
  return (<Card o={o} k={k} W={W} Hh={Hh}><Sv W={W} Hh={Hh}>
    <g opacity={0.5 + 0.5 * Math.max(du, bx)}><rect x={bxX} y={by} width={150} height={150} rx={12} fill={BOXC} stroke={H.text2} strokeWidth={3} />
      {[0, 1, 2, 3, 4].map((i) => <rect key={i} x={bxX + 18} y={by + 24 + i * 24} width={114} height={8} rx={4} fill={MIR} stroke={H.text2} strokeWidth={1} />)}
      <rect x={bxX + 50} y={by - 14} width={50} height={14} fill={H.text2} /></g>
    {[[40, CT + 70], [50, CT + 170], [290, CT + 90], [300, CT + 200], [70, CT + 240], [270, CT + 40]].map(([x, y], i) => <circle key={i} cx={x + Math.sin(f * 0.08 + i) * 6} cy={y + Math.cos(f * 0.07 + i) * 6} r={6} fill={DUST} opacity={du} />)}
    <Arr x1={60} y={CT + 262} x2={290} c={H.text2} /><Arr x1={290} y={CT + 290} x2={60} c={H.text2} />
    <Sep x={364} />
    <Row x={390} y={CT + 52} t="晶圓不能沾灰塵" c={RED} a={du} />
    <Row x={390} y={CT + 114} t="來回運送：靠密封盒" c={OK} a={Math.max(mv, bx)} />
    <Row x={390} y={CT + 176} t="下一集：光罩盒與晶圓載具" c={BLUE} a={Math.max(nx, pd)} />
    <Row x={390} y={CT + 238} t="留言「再生晶圓」拿資料" c={H.amber} a={kw} />
  </Sv></Card>);
};
export const ReclaimSection: React.FC<P> = (p) => {
  const kd = String((p.o as any).kind);
  const M: Record<string, React.FC<P>> = { "reclaim-hook": Hook, "reclaim-test": Test, "reclaim-dummy": Dummy, "reclaim-used": Used, "reclaim-strip": Strip, "reclaim-cmp": Cmp, "reclaim-thin": Thin, "reclaim-tw": Tw, "reclaim-next": Next };
  const C2 = M[kd]; return C2 ? <C2 {...p} /> : null;
};

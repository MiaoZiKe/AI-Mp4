// 2026/11/27 tech-cleanroom：廠務-1 無塵室（系列 2 第 19 集）的 2D 示意卡（overlay `section` 的 kind 以 "cr-" 開頭，Hud.tsx 的 HudSection 轉過來）。
//   cr-hook 接上集：機台住的房間多乾淨｜cr-class 最乾淨那一級：一立方公尺（衣櫃大）最多約 10 顆｜cr-fall 天花板風扇濾網往下吹，像瀑布｜
//   cr-maze 濾網纖維迷宮（撞上、擦到、亂跳碰到都黏住）＋地板回風循環｜cr-suit 人是最大來源，無塵衣像連身雨衣｜cr-tire 正壓像輪胎的氣，門一開只往外吹｜
//   cr-env 溫度濕度固定（不標數值）：脹縮、靜電｜cr-co 台灣三家無塵室工程公司（國旗＋台灣輪廓＋文字名牌）｜cr-next 下一集水氣電。
// 全部示意：不標換氣次數、風速、壓差、溫濕度數字；只放 research.md 查證過的說法。結構一開始就畫出，念到時該處亮起、動起來；時間全部來自 script.json 的 t（cue）。
// 排版原則（card-overlap.mjs 檢查）：內容從 CARD_CONTENT_TOP 以下；字不放進會動的圖形範圍；字 ≥30px；字離圖形 ≥6px。
// 公司 LOGO：漢唐、亞翔、洋基工程官網被本機代理擋下、Wikimedia Commons 限流且查無原檔（見 videos/tech-cleanroom/assets.md），一律白底深色文字名牌（不仿商標）；
// 國旗與名牌 100% 不透明，未輪到只用細灰框（opacity 只套在文字與示意圖）。
import React from "react";
import { FONT_ZH } from "../../theme";
import { H, L, CARD_HEAD, CARD_CONTENT_TOP, cardTitleBox } from "./hudSkin";
import { EASE, tween } from "../anim";
import type { Model3D, Overlay3D, State3D } from "./engine";
import { Flag, twPath } from "./Brand";

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
const RED = "#E0472F", OK = "#14A38B", BLUE = "#2F7FE0", AIR = "#2F9FD8", DUST = "#4A3B2C", GRY = "#98A2B3", WHITE = "#FFFFFF", PANEL = "#E2E8F0", TILE = "#C9D2DE";
const Sep: React.FC<{ x: number }> = ({ x }) => <line x1={x} y1={CT + 4} x2={x} y2={316} stroke={H.lineSoft} strokeWidth={3} />;
const Row: React.FC<{ x: number; y: number; t: string; c: string; a: number; px?: number }> = ({ x, y, t, c, a, px = 30 }) => (
  <g opacity={0.35 + 0.65 * a}><rect x={x} y={y - px * 0.72} width={12} height={px * 0.72} fill={c} /><text x={x + 24} y={y} style={zh(px, H.text, 900)}>{t}</text></g>
);
const FlagBox: React.FC<{ code: string; x: number; y: number; a: number }> = ({ code, x, y, a }) => (
  <g><rect x={x} y={y} width={50} height={36} fill="none" stroke={a > 0.5 ? H.amber : H.lineSoft} strokeWidth={a > 0.5 ? 4 : 1.5} /><Flag code={code} h={28} x={x + 4} y={y + 4} asSvg /></g>
);
const NamePlate: React.FC<{ x: number; y: number; w: number; h: number; t: string; a: number; px?: number }> = ({ x, y, w, h, t, a, px = 32 }) => (
  <g><rect x={x} y={y} width={w} height={h} fill="#FFFFFF" stroke={a > 0.5 ? H.amber : H.lineSoft} strokeWidth={a > 0.5 ? 4 : 1.5} />
    <text x={x + w / 2} y={y + h / 2 + px * 0.34} textAnchor="middle" style={zh(px, "#1F3A5F", 900)}>{t}</text></g>
);
// 往下的箭頭（u＝0–1 沿路徑的位置）
const DownArrow: React.FC<{ x: number; y0: number; y1: number; u: number; c?: string; o?: number }> = ({ x, y0, y1, u, c = AIR, o = 1 }) => {
  const y = y0 + (y1 - y0) * u;
  return <path d={`M${x} ${y} l-7 -12 l14 0 Z`} fill={c} opacity={o * (u < 0.1 ? u * 10 : u > 0.9 ? (1 - u) * 10 : 1)} />;
};

// ── cr-hook：前一集機台放在超乾淨的房間；那間房到底多乾淨？左圖＝廠房剖開一角、問號 ──
const Hook: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330, rm = on(f, T(o, "room")), cl = on(f, T(o, "clean")), pv = on(f, T(o, "prev")), pu = Math.sin(f * 0.14) * 0.5 + 0.5;
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        <g opacity={0.4 + 0.6 * rm}>
          <rect x={40} y={CT + 70} width={240} height={150} fill={PANEL} stroke={H.text2} strokeWidth={3} />
          <path d={`M30 ${CT + 72} L160 ${CT + 22} L290 ${CT + 72} Z`} fill={GRY} stroke={H.text2} strokeWidth={3} />
          {[0, 1, 2].map((i) => <rect key={i} x={68 + i * 70} y={CT + 150} width={50} height={70} fill="#C3CCD8" stroke={H.text2} strokeWidth={2} />)}
        </g>
        <text x={160} y={CT + 140} textAnchor="middle" style={zh(60, RED, 900)} opacity={cl * (0.6 + 0.4 * pu)}>？</text>
        <Sep x={318} />
        <Row x={344} y={CT + 56} t="機台住的房間，多乾淨？" c={BLUE} a={Math.max(rm, cl)} />
        <Row x={344} y={CT + 122} t="前一集：放在超乾淨的房間" c={H.text2} a={pv} />
        <Row x={344} y={CT + 188} t="線索：數得出幾顆灰塵" c={H.amber} a={cl} />
      </svg>
    </Card>
  );
};

// ── cr-class：這間房叫無塵室；最乾淨那一級＝一立方公尺（約一個衣櫃）裡 0.1 微米以上最多約 10 顆 ──
const Class: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330, cr = on(f, T(o, "cr")), tp = on(f, T(o, "top")), cs = on(f, T(o, "closet")), tn = on(f, T(o, "ten"), 14);
  const ox = 70, oy = CT + 70, s = 150, d = 56;
  const dots = [[0.2, 0.3], [0.5, 0.18], [0.78, 0.35], [0.32, 0.62], [0.62, 0.55], [0.85, 0.72], [0.15, 0.82], [0.45, 0.88], [0.7, 0.9], [0.55, 0.38]];
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        <g opacity={0.4 + 0.6 * cs} stroke={H.text2} strokeWidth={3} fill="none">
          <path d={`M${ox} ${oy} l${d} -${d * 0.6} l${s} 0 l0 ${s} l-${d} ${d * 0.6} l-${s} 0 Z`} fill="#EAF6FC" />
          <path d={`M${ox} ${oy} l${s} 0 l${d} -${d * 0.6} M${ox + s} ${oy} l0 ${s}`} />
        </g>
        {dots.map(([u, v], i) => { const x = ox + 10 + u * (s - 10), y = oy + 8 + v * (s - 14), a = tn > (i + 1) / 11 ? 1 : 0.15;
          return <g key={i} opacity={0.3 + 0.7 * a}><circle cx={x} cy={y} r={11} fill="none" stroke="#C98A00" strokeWidth={2.5} /><circle cx={x} cy={y} r={4} fill="#C98A00" /></g>; })}
        <Sep x={340} />
        <Row x={366} y={CT + 48} t="這間房叫無塵室" c={BLUE} a={cr} />
        <Row x={366} y={CT + 106} t="最乾淨那一級（ISO 1）" c={H.text2} a={tp} />
        <Row x={366} y={CT + 164} t="一立方公尺，約一個衣櫃" c={OK} a={cs} />
        <Row x={366} y={CT + 222} t="0.1 微米以上最多約 10 顆" c={H.amber} a={tn} />
      </svg>
    </Card>
  );
};

// ── cr-fall：天花板鋪滿風扇濾網，乾淨空氣平行往下吹，像一道瀑布，把灰塵往下帶走 ──
const Fall: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330, ce = on(f, T(o, "ceil")), ff = on(f, T(o, "ffu")), dn = on(f, T(o, "down")), fl = on(f, T(o, "fall"));
  const y0 = CT + 46, y1 = CT + 208;
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        <rect x={26} y={CT + 10} width={276} height={30} fill={PANEL} stroke={H.text2} strokeWidth={3} opacity={0.4 + 0.6 * ce} />
        {[0, 1, 2, 3].map((i) => <g key={i} opacity={0.4 + 0.6 * ff}><rect x={36 + i * 67} y={CT + 14} width={56} height={22} fill={WHITE} stroke={ff > 0.5 ? H.amber : H.text2} strokeWidth={ff > 0.5 ? 3 : 2} /><circle cx={64 + i * 67} cy={CT + 25} r={6} fill={GRY} /></g>)}
        {[0, 1, 2, 3, 4, 5].map((i) => [0, 1, 2].map((j) => <DownArrow key={`${i}-${j}`} x={46 + i * 47} y0={y0} y1={y1} u={fr(f * 0.012 + j / 3 + i * 0.07)} o={dn} />))}
        {[0, 1].map((j) => { const u = fr(f * 0.012 + j / 2); return <circle key={j} cx={120 + j * 80} cy={y0 + (y1 - y0) * u} r={6} fill={DUST} opacity={fl * (u > 0.9 ? (1 - u) * 10 : 1)} />; })}
        <rect x={26} y={y1 + 6} width={276} height={22} fill={TILE} stroke={H.text2} strokeWidth={3} />
        {Array.from({ length: 12 }, (_, i) => <rect key={i} x={36 + i * 22} y={y1 + 13} width={10} height={8} fill="#5A6478" />)}
        <Sep x={334} />
        <Row x={360} y={CT + 52} t="天花板鋪滿風扇濾網" c={H.amber} a={ff} />
        <Row x={360} y={CT + 118} t="乾淨空氣平行往下吹" c={BLUE} a={dn} />
        <Row x={360} y={CT + 184} t="像瀑布：灰塵被往下帶走" c={OK} a={fl} />
      </svg>
    </Card>
  );
};

// ── cr-maze：濾網是纖維迷宮；灰塵撞上、擦到、亂跳碰到纖維都會黏住；空氣從地板孔洞抽回、往上回到天花板重新過濾 ──
const Maze: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330, fi = on(f, T(o, "filt")), mz = on(f, T(o, "maze")), st = on(f, T(o, "stick")), fl = on(f, T(o, "floor")), ag = on(f, T(o, "again"));
  const fib: [number, number][] = [[70, CT + 70], [150, CT + 50], [230, CT + 80], [110, CT + 130], [200, CT + 150], [270, CT + 125]];
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        {fib.map(([x, y], i) => <circle key={i} cx={x} cy={y} r={15} fill="#F1EEE6" stroke={H.text2} strokeWidth={3} opacity={0.4 + 0.6 * Math.max(fi, mz)} />)}
        {fib.slice(0, 5).map(([x, y], i) => <circle key={i} cx={x + 12} cy={y - 12} r={6} fill={DUST} opacity={st > (i + 1) / 6 ? 1 : 0.1} />)}
        {[0, 1, 2].map((j) => { const u = fr(f * 0.01 + j / 3); const x = 40 + j * 110, y = CT + 30 + u * 150; return <path key={j} d={`M${x + Math.sin(u * 9) * 14} ${y} l-6 -10 l12 0 Z`} fill={AIR} opacity={mz * (u > 0.9 ? (1 - u) * 10 : 1)} />; })}
        <g opacity={0.35 + 0.65 * fl}>
          <rect x={30} y={CT + 196} width={272} height={16} fill={TILE} stroke={H.text2} strokeWidth={2} />
          {Array.from({ length: 11 }, (_, i) => <rect key={i} x={40 + i * 24} y={CT + 200} width={10} height={8} fill="#5A6478" />)}
          <path d={`M60 ${CT + 222} L40 ${CT + 238} L20 ${CT + 238} L20 ${CT + 20} L34 ${CT + 20}`} fill="none" stroke={AIR} strokeWidth={4} strokeDasharray="10 7" strokeDashoffset={-f * 0.8} />
          <path d={`M34 ${CT + 20} l-10 -7 l0 14 Z`} fill={AIR} transform={`translate(4 0)`} opacity={ag > 0.5 ? 1 : 0.5} />
        </g>
        <Sep x={334} />
        <Row x={360} y={CT + 48} t="濾網：一團纖維迷宮" c={H.amber} a={mz} />
        <Row x={360} y={CT + 106} t="撞上、擦到都會黏住" c={RED} a={st} />
        <Row x={360} y={CT + 164} t="空氣從地板孔洞抽回" c={BLUE} a={fl} />
        <Row x={360} y={CT + 222} t="回到天花板重新過濾" c={OK} a={ag} />
      </svg>
    </Card>
  );
};

// ── cr-suit：最大的灰塵來源是人（皮屑、頭髮）；無塵衣像連身雨衣把人包住，只剩領口、袖口漏一點 ──
const Person: React.FC<{ x: number; y: number; suit: boolean; a: number }> = ({ x, y, suit, a }) => (
  <g opacity={0.4 + 0.6 * a}>
    <circle cx={x} cy={y} r={20} fill={suit ? WHITE : "#E8C3A0"} stroke={H.text2} strokeWidth={3} />
    {suit ? <rect x={x - 14} y={y - 6} width={28} height={9} rx={4} fill="#2E3A4E" /> : <path d={`M${x - 20} ${y - 4} q20 -26 40 0`} fill="#4A3426" />}
    <rect x={x - 24} y={y + 24} width={48} height={70} rx={14} fill={suit ? WHITE : "#4F7FBF"} stroke={H.text2} strokeWidth={3} />
    <rect x={x - 20} y={y + 94} width={16} height={56} fill={suit ? WHITE : "#3A4254"} stroke={H.text2} strokeWidth={2} /><rect x={x + 4} y={y + 94} width={16} height={56} fill={suit ? WHITE : "#3A4254"} stroke={H.text2} strokeWidth={2} />
  </g>
);
const Suit: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330, sr = on(f, T(o, "src")), pp = on(f, T(o, "ppl")), su = on(f, T(o, "suit")), rn = on(f, T(o, "rain")), hr = on(f, T(o, "hair"));
  const spray = (cx: number, cy: number, n: number, sc: number, op: number) => Array.from({ length: n }, (_, i) => { const u = fr(f * 0.018 + i / n), a = (i * 137) % 360 * (Math.PI / 180);
    return <circle key={i} cx={cx + Math.cos(a) * u * sc} cy={cy + Math.abs(Math.sin(a)) * u * sc + u * 30} r={4} fill="#8A6A48" opacity={op * (1 - u)} />; });
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        <Person x={90} y={CT + 44} suit={false} a={pp} />
        {spray(90, CT + 90, 14, 70, Math.max(sr, pp))}
        <Person x={240} y={CT + 44} suit a={su} />
        {[[226, CT + 66], [254, CT + 66], [216, CT + 136], [264, CT + 136]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r={6} fill="none" stroke={RED} strokeWidth={3} opacity={hr} />)}
        {spray(240, CT + 70, 3, 40, hr)}
        <path d={`M138 ${CT + 120} l52 0`} stroke={H.amber} strokeWidth={5} opacity={su} /><path d={`M190 ${CT + 120} l-12 -9 l0 18 Z`} fill={H.amber} opacity={su} />
        <Sep x={334} />
        <Row x={360} y={CT + 48} t="最大的灰塵來源，是人" c={RED} a={pp} />
        <Row x={360} y={CT + 106} t="穿無塵衣，像連身雨衣" c={BLUE} a={Math.max(su, rn)} />
        <Row x={360} y={CT + 164} t="包住皮屑和頭髮" c={OK} a={hr} />
        <Row x={360} y={CT + 222} t="領口、袖口還會漏一點" c={H.text2} a={hr} />
      </svg>
    </Card>
  );
};

// ── cr-tire：房間氣壓比外面高；像輪胎的氣，只會往外漏；門一開風往外吹，髒空氣進不來 ──
const Tire: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330, pr = on(f, T(o, "pres")), ti = on(f, T(o, "tire")), dr = on(f, T(o, "door")), ou = on(f, T(o, "out")), di = on(f, T(o, "dirty"));
  const cx = 86, cy = CT + 110;
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        <g opacity={0.4 + 0.6 * ti}><circle cx={cx} cy={cy} r={62} fill="#2B2F36" /><circle cx={cx} cy={cy} r={34} fill="#C3CCD8" stroke={H.text2} strokeWidth={3} /><circle cx={cx} cy={cy} r={8} fill={H.text2} /></g>
        {[0, 1, 2].map((j) => { const u = fr(f * 0.03 + j / 3); return <path key={j} d={`M${cx + 64 + u * 40} ${cy - 50 - u * 22} l-4 -12 l12 6 Z`} fill={AIR} opacity={ti * (1 - u)} />; })}
        <g opacity={0.4 + 0.6 * pr}>
          <rect x={174} y={CT + 40} width={130} height={150} fill="#EAF6FC" stroke={H.text2} strokeWidth={3} />
          <text x={239} y={CT + 98} textAnchor="middle" style={zh(30, BLUE, 900)}>高</text>
        </g>
        <rect x={168} y={CT + 120} width={12} height={70} fill={dr > 0.5 ? "#FFFFFF" : H.text2} stroke={H.text2} strokeWidth={2} />
        {[0, 1, 2].map((j) => { const u = fr(f * 0.035 + j / 3); return <path key={j} d={`M${170 - u * 60} ${CT + 140 + j * 18} l12 -7 l0 14 Z`} fill={AIR} opacity={ou * (1 - u)} transform={`rotate(180 ${170 - u * 60} ${CT + 140 + j * 18})`} />; })}
        {[0, 1].map((j) => <circle key={j} cx={150 - j * 24} cy={CT + 212 + j * 6} r={6} fill={DUST} opacity={di} />)}
        <path d={`M104 ${CT + 226} l-28 0`} stroke={RED} strokeWidth={4} opacity={di} />
        <Sep x={334} />
        <Row x={360} y={CT + 48} t="房間氣壓比外面高" c={BLUE} a={pr} />
        <Row x={360} y={CT + 106} t="像輪胎的氣：只往外漏" c={H.amber} a={ti} />
        <Row x={360} y={CT + 164} t="門一開，風往外吹" c={OK} a={Math.max(dr, ou)} />
        <Row x={360} y={CT + 222} t="髒空氣進不來" c={RED} a={di} />
      </svg>
    </Card>
  );
};

// ── cr-env：溫度、濕度都被固定（不標數值）；不固定：材料脹縮、靜電亂跑 ──
const Dial: React.FC<{ x: number; y: number; t: string; a: number }> = ({ x, y, t, a }) => (
  <g opacity={0.4 + 0.6 * a}>
    <circle cx={x} cy={y} r={44} fill={WHITE} stroke={H.text2} strokeWidth={3} />
    <path d={`M${x - 22} ${y - 38} A44 44 0 0 1 ${x + 22} ${y - 38}`} fill="none" stroke={OK} strokeWidth={9} />
    <line x1={x} y1={y} x2={x} y2={y - 34} stroke={RED} strokeWidth={4} /><circle cx={x} cy={y} r={5} fill={H.text2} />
    <text x={x} y={y + 76} textAnchor="middle" style={zh(30, H.text2, 800)}>{t}</text>
  </g>
);
const Env: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330, tp = on(f, T(o, "temp")), hm = on(f, T(o, "hum")), fx = on(f, T(o, "fix")), ex = on(f, T(o, "exp")), stc = on(f, T(o, "static"));
  const sw = ex * Math.sin(f * 0.18) * 8;
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        <Dial x={74} y={CT + 64} t="溫度" a={tp} />
        <Dial x={194} y={CT + 64} t="濕度" a={hm} />
        <g opacity={0.35 + 0.65 * ex}><rect x={40 - sw} y={CT + 196} width={160 + 2 * sw} height={18} fill="#3E4A60" />
          <path d={`M30 ${CT + 205} l-14 0 M210 ${CT + 205} l14 0`} stroke={H.amber} strokeWidth={4} transform={`translate(${-sw} 0)`} /></g>
        <path d={`M250 ${CT + 184} l14 12 l-10 4 l16 14`} fill="none" stroke={BLUE} strokeWidth={5} opacity={stc * (0.5 + 0.5 * Math.abs(Math.sin(f * 0.5)))} />
        <Sep x={334} />
        <Row x={360} y={CT + 52} t="溫度、濕度都固定" c={OK} a={fx} />
        <Row x={360} y={CT + 118} t="不然材料會脹縮" c={H.amber} a={ex} />
        <Row x={360} y={CT + 184} t="靜電也會亂跑" c={BLUE} a={stc} />
      </svg>
    </Card>
  );
};

// ── cr-co：台灣（國旗＋輪廓）三家無塵室／機電工程公司（文字名牌，不仿商標；不寫訂單、市占、客戶） ──
const Co: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330, tw = on(f, T(o, "tw")), ui = on(f, T(o, "uis")), lk = on(f, T(o, "lk")), yk = on(f, T(o, "yk")), bd = on(f, T(o, "build"));
  const rows: [string, number][] = [["漢唐集成 2404", ui], ["亞翔工程 6139", lk], ["洋基工程 6691", yk]];
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        <path d={twPath(40, CT + 14, 48)} fill={OK} opacity={0.3 + 0.4 * tw} stroke={OK} strokeWidth={3} strokeLinejoin="round" />
        <FlagBox code="TW" x={130} y={CT + 30} a={tw} />
        <text x={130} y={CT + 110} style={zh(30, H.text2, 800)} opacity={0.4 + 0.6 * tw}>台灣</text>
        <Sep x={250} />
        {rows.map(([n, a], i) => <g key={n}><NamePlate x={276} y={CT + 12 + i * 70} w={290} h={52} t={n} a={a} px={30} />
          <text x={586} y={CT + 48 + i * 70} style={zh(30, H.text2, 800)} opacity={0.4 + 0.6 * Math.max(a, bd)}>無塵室、機電工程</text></g>)}
        <text x={276} y={CT + 244} style={zh(30, H.text2, 800)} opacity={0.4 + 0.6 * bd}>報導列為無塵室工程商；不排名</text>
      </svg>
    </Card>
  );
};

// ── cr-next：房間乾淨了，機台還需要水、氣、電；下一集看廠務的水氣電 ──
const Next: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330, cl = on(f, T(o, "clean")), wq = on(f, T(o, "w")), nx = on(f, T(o, "next")), kw = on(f, T(o, "kw"));
  const icon = (i: number) => on(f, T(o, "w") + i * 12);
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        <g opacity={0.4 + 0.6 * icon(0)}><path d={`M70 ${CT + 40} q-30 44 -30 66 a30 30 0 0 0 60 0 q0 -22 -30 -66 Z`} fill={BLUE} stroke={H.text2} strokeWidth={3} /><text x={70} y={CT + 176} textAnchor="middle" style={zh(30, H.text, 900)}>水</text></g>
        <g opacity={0.4 + 0.6 * icon(1)}><rect x={140} y={CT + 46} width={44} height={88} rx={16} fill="#8E99A8" stroke={H.text2} strokeWidth={3} /><rect x={152} y={CT + 32} width={20} height={16} fill={H.text2} /><text x={162} y={CT + 176} textAnchor="middle" style={zh(30, H.text, 900)}>氣</text></g>
        <g opacity={0.4 + 0.6 * icon(2)}><path d={`M262 ${CT + 36} L232 ${CT + 96} L256 ${CT + 96} L244 ${CT + 140} L284 ${CT + 76} L260 ${CT + 76} Z`} fill={H.amber} stroke={H.text2} strokeWidth={3} /><text x={258} y={CT + 176} textAnchor="middle" style={zh(30, H.text, 900)}>電</text></g>
        <Sep x={334} />
        <Row x={360} y={CT + 56} t="房間乾淨了，還要水、氣、電" c={BLUE} a={Math.max(cl, wq)} />
        <Row x={360} y={CT + 122} t="下一集：廠務的水氣電" c={H.text2} a={nx} />
        <Row x={360} y={CT + 188} t="留言「無塵室」拿完整資料" c={H.amber} a={kw} />
      </svg>
    </Card>
  );
};

export const CleanroomSection: React.FC<P> = (p) => {
  const kd = String((p.o as any).kind);
  if (kd === "cr-hook") return <Hook {...p} />;
  if (kd === "cr-class") return <Class {...p} />;
  if (kd === "cr-fall") return <Fall {...p} />;
  if (kd === "cr-maze") return <Maze {...p} />;
  if (kd === "cr-suit") return <Suit {...p} />;
  if (kd === "cr-tire") return <Tire {...p} />;
  if (kd === "cr-env") return <Env {...p} />;
  if (kd === "cr-co") return <Co {...p} />;
  if (kd === "cr-next") return <Next {...p} />;
  return null;
};

// 2026/11/27 tech-pkgequip：先進封裝設備（系列 3 第 6 集）的 2D 示意卡（overlay `section` 的 kind 以 "pe-" 開頭，Hud.tsx 的 HudSection 轉過來）。
//   pe-hook 接上集：晶片怎麼精準疊在一起｜pe-line 像組電腦：五站一台台｜pe-flip 翻面、對位、放下｜pe-tcb 像熨斗燙貼布：加熱又加壓、一層一層｜
//   pe-uf 像水滲進磁磚縫：毛細作用｜pe-warp 載板＋壓膜烘烤：不翹｜pe-aoi 像海關驗行李：拍照比對｜pe-co 三家公司（國旗＋文字名牌）｜pe-next 下一集 ABF 膜。
// 全部示意：不標精度、溫度、壓力、市占；只放 research.md 查證過的說法。時間全部來自 script.json 的 t（cue）。
// 排版原則（card-overlap.mjs 檢查）：內容從 CARD_CONTENT_TOP 以下；字 ≥30px；字離圖形 ≥6px。國旗與名牌 100% 不透明，未輪到用細灰框。
import React from "react";
import { FONT_ZH } from "../../theme";
import { H, L, CARD_HEAD, CARD_CONTENT_TOP, cardTitleBox } from "./hudSkin";
import { EASE, tween } from "../anim";
import type { Model3D, Overlay3D, State3D } from "./engine";
import { Flag, hasFlag } from "./Brand";

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
const RED = "#E0472F", OK = "#14A38B", BLUE = "#2F7FE0", DIE = "#2B3447", WAF = "#6F7FA0", BUMP = "#AEB7C6", UF = "#E9B44C", NCF = "#F4D98A", HOT = "#F2803A", GRY = "#98A2B3", WHITE = "#FFFFFF";
const Sep: React.FC<{ x: number }> = ({ x }) => <line x1={x} y1={CT + 4} x2={x} y2={316} stroke={H.lineSoft} strokeWidth={3} />;
const Row: React.FC<{ x: number; y: number; t: string; c: string; a: number; px?: number }> = ({ x, y, t, c, a, px = 30 }) => (
  <g opacity={0.35 + 0.65 * a}><rect x={x} y={y - px * 0.72} width={12} height={px * 0.72} fill={c} /><text x={x + 24} y={y} style={zh(px, H.text, 900)}>{t}</text></g>
);
const FlagBox: React.FC<{ code: string; x: number; y: number; a: number }> = ({ code, x, y, a }) => (
  <g><rect x={x} y={y} width={50} height={36} fill="none" stroke={a > 0.5 ? H.amber : H.lineSoft} strokeWidth={a > 0.5 ? 4 : 1.5} />
    {hasFlag(code) ? <Flag code={code} h={28} x={x + 4} y={y + 4} asSvg /> : <text x={x + 25} y={y + 27} textAnchor="middle" style={zh(22, H.text, 900)}>{code}</text>}</g>
);
const NamePlate: React.FC<{ x: number; y: number; w: number; h: number; t: string; a: number; px?: number }> = ({ x, y, w, h, t, a, px = 30 }) => (
  <g><rect x={x} y={y} width={w} height={h} fill="#FFFFFF" stroke={a > 0.5 ? H.amber : H.lineSoft} strokeWidth={a > 0.5 ? 4 : 1.5} />
    <text x={x + w / 2} y={y + h / 2 + px * 0.34} textAnchor="middle" style={zh(px, "#1F3A5F", 900)}>{t}</text></g>
);

// ── pe-hook：前一集：好幾顆晶片封在一起要更精密的機台；晶片怎麼精準疊在一起？ ──
const Hook: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330, q = on(f, T(o, "q")), pv = on(f, T(o, "prev")), tl = on(f, T(o, "tool")), pu = Math.sin(f * 0.14) * 0.5 + 0.5;
  const dy = 40 * (1 - tl);
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        <rect x={30} y={CT + 170} width={260} height={26} fill={WAF} stroke={H.text2} strokeWidth={3} />
        {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => <circle key={i} cx={52 + i * 31} cy={CT + 168} r={5} fill={BUMP} />)}
        <g transform={`translate(0 ${-dy})`}><rect x={60} y={CT + 116} width={120} height={36} fill={DIE} /><rect x={196} y={CT + 104} width={64} height={48} fill={DIE} opacity={0.85} /></g>
        <text x={160} y={CT + 70} textAnchor="middle" style={zh(56, RED, 900)} opacity={q * (0.6 + 0.4 * pu) * (1 - tl)}>？</text>
        <Sep x={318} />
        <Row x={344} y={CT + 56} t="晶片怎麼精準疊在一起？" c={BLUE} a={q} />
        <Row x={344} y={CT + 122} t="前一集：好幾顆封在一起" c={H.text2} a={pv} />
        <Row x={344} y={CT + 188} t="需要更精密的機台" c={H.amber} a={tl} />
      </svg>
    </Card>
  );
};

// ── pe-line：像組電腦，五站各一台：接合 → 熱壓 → 點膠 → 壓烤 → 檢測 ──
const Line: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330, pc = on(f, T(o, "pc")), st = on(f, T(o, "step"));
  const names = ["接合", "熱壓", "點膠", "壓烤", "檢測"], cols = [RED, HOT, UF, BLUE, OK];
  const u = fr(f * 0.006);
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        {names.map((n, i) => { const a = st > (i + 0.5) / 5 ? 1 : 0.25 + 0.4 * pc; return <g key={n} opacity={a}><rect x={34 + i * 178} y={CT + 70} width={150} height={96} fill={WHITE} stroke={cols[i]} strokeWidth={5} />
          <text x={109 + i * 178} y={CT + 130} textAnchor="middle" style={zh(34, H.text, 900)}>{n}</text>{i < 4 ? <path d={`M${190 + i * 178} ${CT + 118} l16 0 l-6 -8 M${206 + i * 178} ${CT + 118} l-6 8`} stroke={H.text2} strokeWidth={4} fill="none" /> : null}</g>; })}
        <circle cx={34 + u * 880} cy={CT + 196} r={10} fill={BLUE} opacity={st} />
        <line x1={34} y1={CT + 196} x2={914} y2={CT + 196} stroke={H.lineSoft} strokeWidth={3} />
        <Row x={34} y={CT + 252} t="像組電腦：每一步都有專門的機台" c={H.amber} a={pc} />
        <g opacity={0.3 + 0.7 * pc}>{/* 組電腦小圖：主機板＋CPU＋記憶體條＋顯卡，一件一件裝上 */}
          <rect x={640} y={CT + 214} width={150} height={56} fill="#3E8E5E" stroke={H.text2} strokeWidth={2} />
          <rect x={655} y={CT + 222} width={34} height={30} fill={DIE} opacity={st > 0.2 ? 1 : 0.2} />
          {[0, 1].map((i) => <rect key={i} x={700 + i * 12} y={CT + 220} width={7} height={40} fill="#C8B15A" opacity={st > 0.5 ? 1 : 0.2} />)}
          <rect x={730} y={CT + 244} width={52} height={14} fill="#46536E" opacity={st > 0.8 ? 1 : 0.2} />
          <rect x={810} y={CT + 196} width={56} height={74} fill="#E2E8F0" stroke={H.text2} strokeWidth={2} /><rect x={818} y={CT + 204} width={40} height={6} fill={BLUE} /></g>
      </svg>
    </Card>
  );
};

// ── pe-flip：吸起晶片 → 翻面（接點朝下）→ 相機對準中介層 → 放下 ──
const Flip: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330, bd = on(f, T(o, "bond")), fl = on(f, T(o, "flip"), 16), al = on(f, T(o, "align")), hr = on(f, T(o, "hair"));
  const rot = 180 * fl;
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        <g transform={`translate(90 ${CT + 90}) rotate(${rot})`} opacity={0.4 + 0.6 * bd}><rect x={-40} y={-12} width={80} height={24} fill={DIE} />{[-30, -15, 0, 15, 30].map((x) => <circle key={x} cx={x} cy={-15} r={4} fill={BUMP} />)}</g>
        <path d={`M150 ${CT + 90} l40 0 l-8 -8 M190 ${CT + 90} l-8 8`} stroke={H.text2} strokeWidth={4} fill="none" opacity={fl} />
        <g opacity={0.4 + 0.6 * al}><rect x={206} y={CT + 30} width={40} height={30} fill="#1E2530" /><path d={`M226 ${CT + 60} l-26 60 l52 0 Z`} fill="#BFEFFF" opacity={0.5} /></g>
        <rect x={180} y={CT + 196} width={110} height={20} fill={WAF} stroke={H.text2} strokeWidth={3} />
        <g transform={`translate(0 ${-40 * (1 - hr)})`} opacity={0.3 + 0.7 * al}><rect x={205} y={CT + 166} width={60} height={20} fill={DIE} />{[212, 228, 244, 258].map((x) => <circle key={x} cx={x} cy={CT + 191} r={4} fill={BUMP} />)}</g>
        <Sep x={318} />
        <Row x={344} y={CT + 52} t="吸起晶片、翻面" c={H.amber} a={fl} />
        <Row x={344} y={CT + 118} t="相機對準中介層的接點" c={BLUE} a={al} />
        <Row x={344} y={CT + 184} t="放下，誤差比頭髮細得多" c={OK} a={hr} />
      </svg>
    </Card>
  );
};

// ── pe-tcb：像熨斗燙貼布：上方加熱又加壓，膠膜軟化、錫點接通，一層一層疊 ──
const Tcb: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330, mm = on(f, T(o, "mem")), tc = on(f, T(o, "tcb")), ht = on(f, T(o, "heat")), ir = on(f, T(o, "iron")), ly = on(f, T(o, "ly"), 40);
  const n = 4 + Math.round(8 * ly), press = Math.max(0, Math.sin(f * 0.25)) * 6 * tc;
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        {Array.from({ length: n }, (_, i) => <g key={i} opacity={0.4 + 0.6 * mm}><rect x={60} y={CT + 226 - i * 15} width={160} height={10} fill={i % 2 ? DIE : "#46536E"} /><rect x={56} y={CT + 236 - i * 15} width={168} height={5} fill={NCF} /></g>)}
        <g transform={`translate(0 ${press})`} opacity={0.4 + 0.6 * tc}><rect x={60} y={CT + 26} width={160} height={30} fill="#A9B5C7" stroke={H.text2} strokeWidth={3} /><rect x={60} y={CT + 56} width={160} height={10} fill={HOT} opacity={0.4 + 0.6 * ht} />
          {[0, 1, 2].map((i) => <path key={i} d={`M${100 + i * 40} ${CT + 6} l0 14 l-7 -7 M${100 + i * 40} ${CT + 20} l7 -7`} stroke={RED} strokeWidth={4} fill="none" opacity={ht} />)}</g>
        <path d={`M250 ${CT + 60} l50 0 l-6 22 l-44 0 Z`} fill="#C9CFD8" stroke={H.text2} strokeWidth={3} opacity={ir} /><rect x={254} y={CT + 84} width={40} height={8} fill={NCF} opacity={ir} />
        <Sep x={318} />
        <Row x={344} y={CT + 52} t="記憶體要疊十幾層" c={BLUE} a={mm} />
        <Row x={344} y={CT + 112} t="熱壓接合：加熱又加壓" c={RED} a={ht} />
        <Row x={344} y={CT + 172} t="像熨斗燙貼布" c={H.amber} a={ir} />
        <Row x={344} y={CT + 232} t="一層一層壓好" c={OK} a={ly} />
      </svg>
    </Card>
  );
};

// ── pe-uf：點膠針沿邊滴膠，膠靠毛細作用鑽進縫裡（先快後慢），另一邊形成膠邊；像水滲進磁磚縫 ──
const Uf: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330, gp = on(f, T(o, "gap")), dp = on(f, T(o, "disp")), wk = tween(f, T(o, "wick") - 10, 60, (t: number) => 1 - (1 - t) * (1 - t)), tl = on(f, T(o, "tile"));
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        <rect x={40} y={CT + 170} width={250} height={30} fill={WAF} stroke={H.text2} strokeWidth={3} />
        <rect x={70} y={CT + 110} width={190} height={40} fill={DIE} opacity={0.4 + 0.6 * gp} />
        {[0, 1, 2, 3, 4, 5].map((i) => <rect key={i} x={82 + i * 32} y={CT + 150} width={10} height={20} fill={BUMP} />)}
        <rect x={70} y={CT + 150} width={190 * wk} height={20} fill={UF} opacity={0.85} />
        <path d={`M70 ${CT + 150} l-22 20 l22 0 Z`} fill={UF} opacity={dp} />
        <g opacity={dp}><rect x={44} y={CT + 40} width={14} height={50} fill="#BFD3F2" stroke={H.text2} strokeWidth={2} /><rect x={49} y={CT + 90} width={4} height={30} fill={H.text2} /><circle cx={51} cy={CT + 128 + fr(f * 0.03) * 16} r={5} fill={UF} /></g>
        <Sep x={334} />
        <Row x={360} y={CT + 52} t="晶片底下的縫要補膠" c={H.text2} a={gp} />
        <Row x={360} y={CT + 112} t="點膠機沿著邊緣滴膠" c={H.amber} a={dp} />
        <Row x={360} y={CT + 172} t="膠自己鑽進縫裡" c={BLUE} a={wk} />
        <Row x={360} y={CT + 232} t="像水滲進磁磚縫" c={OK} a={tl} />
        <g opacity={0.3 + 0.7 * tl}>{/* 磁磚縫小圖：水從左邊縫口被吸進縫裡 */}
          {[0, 1, 2].map((i) => [0, 1].map((j) => <rect key={`${i}${j}`} x={640 + i * 52} y={CT + 160 + j * 52} width={46} height={46} fill="#F3F5F8" stroke={GRY} strokeWidth={2} />))}
          <rect x={640} y={CT + 206} width={(156) * Math.min(1, wk * 1.1)} height={6} fill="#5FB4FF" /><rect x={686} y={CT + 160} width={6} height={98 * Math.min(1, wk)} fill="#5FB4FF" /><rect x={738} y={CT + 160} width={6} height={98 * Math.max(0, wk - 0.3)} fill="#5FB4FF" />
          <circle cx={630} cy={CT + 209} r={8} fill="#5FB4FF" /></g>
      </svg>
    </Card>
  );
};

// ── pe-warp：晶圓貼到載板 → 壓膜 → 烘烤，翹起的晶圓被壓平 ──
const Warp: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330, cr = on(f, T(o, "car")), lm = on(f, T(o, "lam"), 30), fl = on(f, T(o, "flat"), 20);
  const bow = 26 * (1 - fl);
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        <rect x={40} y={CT + 190} width={250} height={20} fill="#CFE3F2" stroke={H.text2} strokeWidth={3} opacity={0.4 + 0.6 * cr} />
        <path d={`M40 ${CT + 186 - bow} Q165 ${CT + 186 + bow * 0.4} 290 ${CT + 186 - bow}`} fill="none" stroke={WAF} strokeWidth={10} />
        <circle cx={60 + 220 * lm} cy={CT + 150} r={22} fill="#2B2F36" opacity={lm > 0.02 && lm < 0.98 ? 1 : 0.3} />
        <g opacity={fl}><rect x={110} y={CT + 30} width={110} height={70} fill="#D9DEE6" stroke={H.text2} strokeWidth={3} /><rect x={120} y={CT + 80} width={90} height={8} fill={HOT} /></g>
        <Sep x={334} />
        <Row x={360} y={CT + 52} t="先把晶圓貼到載板" c={BLUE} a={cr} />
        <Row x={360} y={CT + 118} t="再壓膜、烘烤" c={H.amber} a={lm} />
        <Row x={360} y={CT + 184} t="讓整片不翹" c={OK} a={fl} />
      </svg>
    </Card>
  );
};

// ── pe-aoi：每做完一步就拍照比對（標準 vs 拍到的），揪出歪掉、缺膠；像海關驗行李 ──
const Aoi: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330, sp = on(f, T(o, "step")), ao = on(f, T(o, "aoi")), ng = on(f, T(o, "ng")), cu = on(f, T(o, "customs"));
  const cell = (x: number, y: number, bad: boolean) => <g>{[0, 1, 2].map((i) => [0, 1, 2].map((j) => { const b = bad && i === 2 && j === 0; return <rect key={`${i}${j}`} x={x + i * 36 + (b ? 6 : 0)} y={y + j * 36 + (b ? -4 : 0)} width={28} height={28} fill={DIE} transform={b ? `rotate(12 ${x + i * 36 + 20} ${y + j * 36 + 10})` : undefined} />; }))}
    {bad ? <rect x={x - 2} y={y + 70} width={32} height={32} fill="none" stroke={RED} strokeWidth={0} /> : null}</g>;
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        <g opacity={0.4 + 0.6 * ao}>{cell(34, CT + 60, false)}<text x={84} y={CT + 196} textAnchor="middle" style={zh(30, H.text2, 800)}>標準</text></g>
        <g opacity={0.4 + 0.6 * ao}>{cell(184, CT + 60, ng > 0.5)}<text x={234} y={CT + 196} textAnchor="middle" style={zh(30, H.text2, 800)}>拍到的</text></g>
        <rect x={250} y={CT + 52} width={54} height={50} fill="none" stroke={RED} strokeWidth={5} opacity={ng} />
        <Sep x={334} />
        <Row x={360} y={CT + 48} t="每做完一步就檢查" c={H.text2} a={sp} />
        <Row x={360} y={CT + 106} t="拍照，和標準比對" c={BLUE} a={ao} />
        <Row x={360} y={CT + 164} t="揪出歪掉、缺膠" c={RED} a={ng} />
        <Row x={360} y={CT + 222} t="像海關驗行李" c={H.amber} a={cu} />
        <g opacity={0.3 + 0.7 * cu}>{/* 海關小圖：行李經過 X 光框、可疑物標紅 */}
          <rect x={620} y={CT + 150} width={170} height={100} fill="none" stroke={H.text2} strokeWidth={4} /><rect x={600} y={CT + 250} width={210} height={10} fill={GRY} />
          <g transform={`translate(${-30 + 70 * fr(f * 0.008)} 0)`}><rect x={660} y={CT + 196} width={70} height={50} rx={6} fill="#8A6A48" stroke={H.text2} strokeWidth={2} /><rect x={683} y={CT + 186} width={24} height={10} fill="none" stroke={H.text2} strokeWidth={3} />
            <rect x={690} y={CT + 210} width={18} height={18} fill="none" stroke={RED} strokeWidth={4} opacity={ng} /></g></g>
      </svg>
    </Card>
  );
};

// ── pe-co：韓國韓美（記憶體熱壓接合機）、台灣萬潤（點膠、檢測）、志聖（載板貼合、壓膜烘烤）；不寫市占、營收、客戶 ──
const Co: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330, kr = on(f, T(o, "kr")), tw = on(f, T(o, "tw")), ar = on(f, T(o, "ar")), cs = on(f, T(o, "cs")), bk = on(f, T(o, "bake"));
  const rows: [string, string, string, number][] = [["KR", "韓美 Hanmi", "記憶體熱壓接合機", kr], ["TW", "萬潤 6187", "點膠、光學檢測", ar], ["TW", "志聖 2467", "載板貼合、壓膜烘烤", Math.max(cs, bk)]];
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        {rows.map(([c, n, d, a], i) => <g key={n}><FlagBox code={c} x={34} y={CT + 18 + i * 70} a={i === 0 ? kr : tw} /><NamePlate x={102} y={CT + 12 + i * 70} w={290} h={50} t={n} a={a} />
          <text x={412} y={CT + 48 + i * 70} style={zh(30, H.text2, 800)} opacity={0.4 + 0.6 * a}>{d}</text></g>)}
        <text x={34} y={CT + 236} style={zh(30, H.text2, 800)} opacity={0.4 + 0.6 * bk}>報導列為封裝設備供應商；不排名</text>
      </svg>
    </Card>
  );
};

// ── pe-next：封好了，訊號靠載板拉出去；下一集：載板裡的絕緣膜（ABF） ──
const Next: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330, dn = on(f, T(o, "done")), sb = on(f, T(o, "sub")), nx = on(f, T(o, "next")), kw = on(f, T(o, "kw"));
  const lay = ["#3E8E5E", "#E8D9A8", "#C8B15A", "#E8D9A8", "#3E8E5E"];
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        <g opacity={0.4 + 0.6 * dn}><rect x={110} y={CT + 40} width={110} height={36} fill={DIE} /><rect x={70} y={CT + 76} width={190} height={14} fill={WAF} /></g>
        {lay.map((c, i) => <rect key={i} x={50} y={CT + 100 + i * 22} width={230} height={20} fill={c} stroke={nx > 0.5 && c === "#E8D9A8" ? H.amber : H.text2} strokeWidth={nx > 0.5 && c === "#E8D9A8" ? 5 : 2} opacity={0.4 + 0.6 * sb} />)}
        <Sep x={318} />
        <Row x={344} y={CT + 56} t="訊號靠載板拉出去" c={BLUE} a={sb} />
        <Row x={344} y={CT + 122} t="下一集：載板裡的絕緣膜" c={H.text2} a={nx} />
        <Row x={344} y={CT + 188} t="留言「封裝設備」拿完整資料" c={H.amber} a={kw} />
      </svg>
    </Card>
  );
};

export const PkgequipSection: React.FC<P> = (p) => {
  const kd = String((p.o as any).kind);
  if (kd === "pe-hook") return <Hook {...p} />;
  if (kd === "pe-line") return <Line {...p} />;
  if (kd === "pe-flip") return <Flip {...p} />;
  if (kd === "pe-tcb") return <Tcb {...p} />;
  if (kd === "pe-uf") return <Uf {...p} />;
  if (kd === "pe-warp") return <Warp {...p} />;
  if (kd === "pe-aoi") return <Aoi {...p} />;
  if (kd === "pe-co") return <Co {...p} />;
  if (kd === "pe-next") return <Next {...p} />;
  return null;
};

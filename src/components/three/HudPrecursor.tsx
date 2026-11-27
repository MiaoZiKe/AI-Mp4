// 2026/11/27 tech-precursor：前驅物（系列 2 第 14 集）的 2D 示意卡（overlay `section` 的 kind 以 "precursor-" 開頭，Hud.tsx 的 HudSection 轉過來）。
//   precursor-hook 接上集：氣體從哪來？｜precursor-kinds 前驅物像備好的醬料、四種外型｜precursor-bubbler 起泡器怎麼拆（六件逐一亮）｜
//   precursor-path 送料路徑（載氣→流量控制→起泡器→加熱管路→脈衝閥→腔體）｜precursor-bubble 起泡器剖面（氣泡帶走蒸氣、溫度↑蒸氣↑）｜
//   precursor-cold 有加熱 vs 沒加熱（冷杯子凝水珠）｜precursor-pulse 閥一開一關的時序（A、吹淨、B、吹淨）｜precursor-ald ALD 一圈四步（刷油漆、刷滿就停）｜
//   precursor-purity 乾淨有兩把尺（雜質總量與金屬雜質）｜precursor-co 供應商與台灣地圖｜precursor-next 下一集特用氣體。
// 全部示意：不標脈衝秒數、溫度、流量；只放查證過的說法。結構一開始就畫出，念到時該處亮起、動起來；時間全部來自 script.json 的 t（cue）。
// 排版原則（card-overlap.mjs 檢查）：內容從 CARD_CONTENT_TOP 以下；字不放進會動的圖形範圍；字 ≥30px；字離圖形 ≥6px。
// 公司 LOGO：Merck、Air Liquide、宇川精材的官方原檔當天抓不到（見 videos/tech-precursor/assets.md），一律用白底深色文字名牌（不仿商標）＋國旗，國旗與名牌 100% 不透明。
import React from "react";
import { FONT_ZH } from "../../theme";
import { H, L, CARD_HEAD, CARD_CONTENT_TOP, cardTitleBox } from "./hudSkin";
import { EASE, tween } from "../anim";
import type { Model3D, Overlay3D, State3D } from "./engine";
import { Flag, twPath, twPt } from "./Brand";

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
const RED = "#E0472F", OK = "#14A38B", BLUE = "#2F7FE0", ORG = "#F29A4A", VAP = "#FF9A3C", H2O = "#3FC1E8", GRY = "#98A2B3", LIQ = "#BFDDFB", TAN = "#D6B677", HOT = "#E5602B";
const Sep: React.FC<{ x: number }> = ({ x }) => <line x1={x} y1={CT + 4} x2={x} y2={316} stroke={H.lineSoft} strokeWidth={3} />;
const Row: React.FC<{ x: number; y: number; t: string; c: string; a: number; px?: number }> = ({ x, y, t, c, a, px = 30 }) => (
  <g opacity={0.35 + 0.65 * a}><rect x={x} y={y - px * 0.72} width={12} height={px * 0.72} fill={c} /><text x={x + 24} y={y} style={zh(px, H.text, 900)}>{t}</text></g>
);
const Chip: React.FC<{ x: number; y: number; w: number; t: string; a: number; c?: string }> = ({ x, y, w, t, a, c = "#FFF4DA" }) => (
  <g opacity={0.4 + 0.6 * a}><rect x={x} y={y} width={w} height={50} fill={a > 0.5 ? c : "#FFFFFF"} stroke={a > 0.5 ? H.amber : H.lineSoft} strokeWidth={a > 0.5 ? 4 : 2} />
    <text x={x + w / 2} y={y + 35} textAnchor="middle" style={zh(30, H.text, 900)}>{t}</text></g>
);
const Arr: React.FC<{ x1: number; x2: number; y: number; a: number }> = ({ x1, x2, y, a }) => <g opacity={0.35 + 0.65 * a}><path d={`M${x1} ${y} L${x2 - 8} ${y}`} stroke={H.text2} strokeWidth={4} /><path d={`M${x2} ${y} l-14 -9 l0 18 Z`} fill={H.text2} /></g>;
const FlagBox: React.FC<{ code: string; x: number; y: number; a: number }> = ({ code, x, y, a }) => (
  <g><rect x={x} y={y} width={50} height={36} fill="none" stroke={a > 0.5 ? H.amber : H.lineSoft} strokeWidth={a > 0.5 ? 4 : 1.5} /><Flag code={code} h={28} x={x + 4} y={y + 4} asSvg /></g>
);
const NamePlate: React.FC<{ x: number; y: number; w: number; h: number; t: string; a: number; px?: number }> = ({ x, y, w, h, t, a, px = 34 }) => (
  <g><rect x={x} y={y} width={w} height={h} fill="#FFFFFF" stroke={a > 0.5 ? H.amber : H.lineSoft} strokeWidth={a > 0.5 ? 4 : 1.5} />
    <text x={x + w / 2} y={y + h / 2 + px * 0.34} textAnchor="middle" style={zh(px, "#1F3A5F", 900)}>{t}</text></g>
);
/** 小瓶子圖示（備好的醬料、原料瓶共用） */
const Jar: React.FC<{ x: number; y: number; c: string; a: number; s?: number }> = ({ x, y, c, a, s = 1 }) => (
  <g opacity={0.45 + 0.55 * a} transform={`translate(${x} ${y}) scale(${s})`}><rect x={-20} y={-60} width={40} height={14} fill={H.text2} /><rect x={-34} y={-46} width={68} height={92} rx={10} fill="#FFFFFF" stroke={H.text2} strokeWidth={4} /><rect x={-28} y={-6} width={56} height={46} rx={6} fill={c} /></g>
);

// ── precursor-hook：前一集預告 → 氣體從哪來？答案先從一瓶液體開始 ──
const Hook: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330, pv = on(f, T(o, "prev")), q = on(f, T(o, "q")), pu = Math.sin(f * 0.14) * 0.5 + 0.5;
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        <Jar x={130} y={CT + 150} c={ORG} a={q} s={1.5} />
        <text x={215} y={CT + 70} textAnchor="middle" style={zh(70, H.text, 900)} opacity={q * (0.6 + 0.4 * pu)}>？</text>
        <Sep x={300} />
        <Row x={330} y={CT + 56} t="前一集：更薄的膜改用氣體" c={H.text2} a={pv} />
        <Row x={330} y={CT + 122} t="氣體，從哪來？" c={BLUE} a={q} />
        <Row x={330} y={CT + 188} t="答案：先從一瓶液體開始" c={H.amber} a={q} />
      </svg>
    </Card>
  );
};

// ── precursor-kinds：像做菜前備好的醬料；四種外型一次亮一種 ──
const Kinds: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330, nm = on(f, T(o, "name")), sa = on(f, T(o, "sauce")), cb = on(f, T(o, "cab")), so = on(f, T(o, "solid"));
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        <Jar x={105} y={CT + 150} c="#C8553D" a={sa} s={1.4} /><text x={105} y={CT + 252} textAnchor="middle" style={zh(30, H.text2, 800)} opacity={0.4 + 0.6 * sa}>醬料</text>
        <Arr x1={170} x2={250} y={CT + 130} a={sa} />
        <Jar x={310} y={CT + 150} c={ORG} a={nm} s={1.4} /><text x={310} y={CT + 252} textAnchor="middle" style={zh(30, H.text2, 800)} opacity={0.4 + 0.6 * nm}>前驅物</text>
        <Sep x={400} />
        <Chip x={430} y={CT + 8} w={220} t="液體" a={nm} /><Chip x={680} y={CT + 8} w={220} t="固體" a={so} />
        <Chip x={430} y={CT + 74} w={220} t="含氯" a={sa} /><Chip x={680} y={CT + 74} w={220} t="含矽" a={cb} />
        <Row x={430} y={CT + 170} t="含目標元素，又能變成氣體" c={H.amber} a={nm} /><Row x={430} y={CT + 226} t="備好原料，後面才能做膜" c={H.text2} a={sa} />
      </svg>
    </Card>
  );
};

// ── precursor-bubbler：起泡器怎麼拆（六件逐一亮：氣櫃、進出氣閥、加熱套、插管、液體、頂部空間） ──
const Bubbler: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330;
  const a = ["cab", "lid", "jack", "dip", "liq", "head"].map((n) => on(f, T(o, n)));
  const names = ["氣櫃", "進出氣閥", "加熱套", "插管", "液體", "頂部空間"];
  const cur = a.reduce((m, v, i) => (v > 0.5 ? i : m), -1);
  const st = (i: number) => (cur === i ? H.amber : H.lineSoft), sw = (i: number) => (cur === i ? 5 : 2);
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        <rect x={40} y={CT + 2} width={230} height={250} fill="none" stroke={st(0)} strokeWidth={sw(0)} strokeDasharray="10 8" opacity={0.4 + 0.6 * a[0]} />
        <rect x={80} y={CT + 14} width={150} height={26} fill="#D4DAE4" stroke={st(1)} strokeWidth={sw(1)} opacity={0.4 + 0.6 * a[1]} />
        <rect x={70} y={CT + 46} width={170} height={180} fill="#FFFFFF" stroke={H.text2} strokeWidth={3} />
        <rect x={74} y={CT + 130} width={162} height={92} fill={LIQ} opacity={0.4 + 0.6 * a[4]} stroke={st(4)} strokeWidth={cur === 4 ? 4 : 0} />
        <rect x={74} y={CT + 52} width={162} height={74} fill="none" stroke={st(5)} strokeWidth={cur === 5 ? 4 : 0} strokeDasharray="8 6" />
        <line x1={110} y1={CT + 40} x2={110} y2={CT + 200} stroke={cur === 3 ? H.amber : H.text2} strokeWidth={cur === 3 ? 7 : 4} opacity={0.4 + 0.6 * a[3]} />
        <rect x={56} y={CT + 150} width={14} height={70} fill={TAN} stroke={st(2)} strokeWidth={sw(2)} opacity={0.4 + 0.6 * a[2]} /><rect x={240} y={CT + 150} width={14} height={70} fill={TAN} stroke={st(2)} strokeWidth={sw(2)} opacity={0.4 + 0.6 * a[2]} />
        <Sep x={300} />
        {names.map((n, i) => <Row key={n} x={i < 3 ? 330 : 640} y={CT + 56 + (i % 3) * 78} t={n} c={i === cur ? H.amber : BLUE} a={a[i]} px={34} />)}
      </svg>
    </Card>
  );
};

// ── precursor-path：送料路徑六站，由冷到暖；念到哪站亮哪站 ──
const Path: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330;
  const st = [["載氣", 0], ["流量控制", on(f, T(o, "gas"))], ["起泡器", on(f, T(o, "gas"))], ["加熱管路", on(f, T(o, "pipe"))], ["脈衝閥", on(f, T(o, "valve"))], ["腔體", on(f, T(o, "back"))]] as [string, number][];
  const ws = [92, 160, 120, 160, 120, 92], xs: number[] = []; let x = 24; ws.forEach((w) => { xs.push(x); x += w + 20; });
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        <defs><linearGradient id="pcGr" x1="0" x2="1"><stop offset="0" stopColor="#4DA3FF" /><stop offset="0.45" stopColor="#F2B632" /><stop offset="1" stopColor="#E5602B" /></linearGradient></defs>
        {st.map(([n, a], i) => <g key={n}><Chip x={xs[i]} y={CT + 6} w={ws[i]} t={n} a={i === 0 ? 1 : a} />{i < 5 ? <Arr x1={xs[i] + ws[i] + 2} x2={xs[i] + ws[i] + 18} y={CT + 31} a={a} /> : null}</g>)}
        <rect x={24} y={CT + 92} width={W - 48} height={20} fill="url(#pcGr)" /><text x={24} y={CT + 148} style={zh(30, H.text2, 800)}>示意：越往後管路越暖一點</text>
        <Row x={24} y={CT + 204} t="起泡器產生蒸氣，管路保溫送進腔體" c={H.amber} a={on(f, T(o, "pipe"))} /><Row x={24} y={CT + 252} t="閥一開一關，控制一次送多少" c={BLUE} a={on(f, T(o, "valve"))} />
      </svg>
    </Card>
  );
};

// ── precursor-bubble：起泡器剖面（載氣氣泡上升、越往上越橘）＋溫度↑→蒸氣↑ ──
const Bubble: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330, bl = on(f, T(o, "blow")), bu = on(f, T(o, "bubble")), sc = on(f, T(o, "scent"));
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        <rect x={50} y={CT + 6} width={180} height={236} fill="#FFFFFF" stroke={H.text2} strokeWidth={4} /><rect x={54} y={CT + 100} width={172} height={138} fill={LIQ} />
        <line x1={96} y1={CT} x2={96} y2={CT + 210} stroke={H.text2} strokeWidth={6} /><rect x={40} y={CT + 150} width={14} height={80} fill={TAN} /><rect x={226} y={CT + 150} width={14} height={80} fill={TAN} />
        {[0, 1, 2, 3, 4].map((i) => { const u = fr(f * 0.012 + i * 0.2), by = CT + 205 - u * 105, c = u < 0.45 ? "#FFFFFF" : VAP; return <circle key={i} cx={96 + Math.sin(u * 9 + i) * 10 + (i % 2) * 18} cy={by} r={9 + u * 3} fill={c} stroke={GRY} strokeWidth={2} opacity={bl} />; })}
        {[0, 1, 2, 3, 4, 5].map((i) => <circle key={`v${i}`} cx={120 + fr(f * 0.01 + i * 0.17) * 90} cy={CT + 40 + Math.sin(i * 2.1 + f * 0.05) * 20} r={6} fill={VAP} opacity={sc} />)}
        <path d={`M200 ${CT + 40} L270 ${CT + 40}`} stroke={VAP} strokeWidth={5} opacity={sc} />
        <Sep x={320} />
        <Row x={350} y={CT + 52} t="載氣吹進液體" c={H.text2} a={bl} /><Row x={350} y={CT + 112} t="氣泡一路帶走蒸氣" c={H.amber} a={bu} /><Row x={350} y={CT + 172} t="溫度高，蒸氣就多" c={RED} a={sc} />
        {[0, 1, 2].map((i) => <rect key={i} x={380 + i * 76} y={CT + 252 - (22 + i * 20) * sc} width={54} height={(22 + i * 20) * sc} fill={[BLUE, H.amber, RED][i]} />)}
      </svg>
    </Card>
  );
};

// ── precursor-cold：有加熱順暢通過；沒加熱蒸氣遇冷凝成液滴，像冷杯子外的水珠 ──
const Cold: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330, ho = on(f, T(o, "hot")), co = on(f, T(o, "cold")), dr = on(f, T(o, "drop"));
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        <rect x={30} y={CT + 14} width={380} height={64} fill="#FFE3CF" stroke={HOT} strokeWidth={4} /><rect x={30} y={CT + 124} width={380} height={64} fill="#DCEBFA" stroke={BLUE} strokeWidth={4} />
        {[0, 1, 2, 3, 4, 5].map((i) => <circle key={i} cx={42 + fr(f * 0.008 + i / 6) * 350} cy={CT + 46 + Math.sin(i * 3) * 14} r={7} fill={VAP} opacity={ho} />)}
        {[0, 1, 2, 3, 4].map((i) => { const u = fr(f * 0.008 + i / 5), x = 42 + Math.min(u, 0.55 + i * 0.05) * 350; return <circle key={`c${i}`} cx={x} cy={CT + 156 + Math.sin(i * 3) * 14} r={7} fill={VAP} opacity={co} />; })}
        {[0, 1, 2, 3].map((i) => <circle key={`d${i}`} cx={290 + i * 26} cy={CT + 186} r={8 + i * 2} fill="#E9E3D6" stroke={GRY} strokeWidth={2} opacity={dr} />)}
        <Sep x={440} />
        <Row x={470} y={CT + 50} t="有加熱：蒸氣順暢通過" c={HOT} a={ho} /><Row x={470} y={CT + 116} t="沒加熱：遇冷就凝結" c={BLUE} a={co} /><Row x={470} y={CT + 182} t="像冷杯子外的水珠" c={H.amber} a={dr} />
        <text x={470} y={CT + 240} style={zh(30, H.text2, 800)}>最後會堵住管子</text>
      </svg>
    </Card>
  );
};

// ── precursor-pulse：閥一開一關的時序（原料脈衝、吹淨、水脈衝、吹淨），不標秒數 ──
const Pulse: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330, op = on(f, T(o, "open")), cs = on(f, T(o, "close")), pf = on(f, T(o, "puff"));
  const lanes: [string, string, number, number, number][] = [["原料閥", ORG, 40, 150, op], ["吹淨", GRY, 190, 120, cs], ["水閥", H2O, 310, 150, pf], ["吹淨", GRY, 460, 120, pf]];
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        {lanes.map(([n, c, x, w, a], i) => <g key={i}><text x={24} y={CT + 52 + i * 50} style={zh(30, H.text, 800)}>{n}</text>
          <rect x={190} y={CT + 22 + i * 50} width={640} height={36} fill="#FFFFFF" stroke={H.lineSoft} strokeWidth={2} />
          <rect x={190 + (x - 40) * 1.3 + (i % 2 === 0 ? 0 : 0)} y={CT + 22 + i * 50} width={w * 1.1} height={36} fill={c} opacity={0.35 + 0.65 * a} stroke={a > 0.5 ? H.amber : "none"} strokeWidth={a > 0.5 ? 4 : 0} /></g>)}
        <text x={24} y={CT + 252} style={zh(30, H.text2, 800)}>示意：一圈四步，每步長短不標數字</text>
      </svg>
    </Card>
  );
};

// ── precursor-ald：ALD 一圈四步，每格一排表面位置：橘＝原料、青＝水、灰＝吹淨；刷滿就停 ──
const Ald: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330, a = ["paint", "one", "full", "atom"].map((n) => on(f, T(o, n)));
  const cells: [string, string][] = [["原料", ORG], ["吹淨", GRY], ["水", H2O], ["吹淨", GRY]];
  const cur = a.reduce((m, v, i) => (v > 0.5 ? i : m), 0);
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        {cells.map(([n, c], i) => { const x = 24 + i * 232, lit = a[i];
          return <g key={i}><rect x={x} y={CT + 4} width={214} height={176} fill="#FFFFFF" stroke={cur === i && lit > 0.5 ? H.amber : H.lineSoft} strokeWidth={cur === i && lit > 0.5 ? 5 : 2} />
            <text x={x + 107} y={CT + 40} textAnchor="middle" style={zh(30, H.text, 900)}>{`${i + 1}　${n}`}</text>
            <rect x={x + 16} y={CT + 130} width={182} height={34} fill={H.text2} opacity={0.35} />
            {[0, 1, 2, 3, 4].map((j) => { const cx = x + 36 + j * 36, done = i === 0 ? lit > 0.5 && f > T(o, "one") + 4 * j : i === 1 ? true : i === 2 ? a[3] > 0.5 : true;
              const dot = i === 0 ? (done ? ORG : "#FFFFFF") : i === 1 ? ORG : i === 2 ? (done ? H2O : ORG) : H2O;
              return <circle key={j} cx={cx} cy={CT + 118} r={11} fill={dot} stroke={i === 0 && !done ? RED : GRY} strokeWidth={2} opacity={0.4 + 0.6 * lit} />; })}
            {i === 0 || i === 2 ? [0, 1, 2].map((j) => <circle key={`m${j}`} cx={x + 50 + j * 56} cy={CT + 66 + fr(f * 0.012 + j / 3) * 30} r={9} fill={c} opacity={lit} />) : [0, 1, 2, 3].map((j) => <circle key={`n${j}`} cx={x + 30 + fr(f * 0.012 + j / 4) * 150} cy={CT + 78 + (j % 2) * 18} r={5} fill={GRY} opacity={lit} />)}
          </g>; })}
        <Row x={24} y={CT + 216} t="每個位置只反應一次，用完就停" c={H.amber} a={a[2]} /><Row x={24} y={CT + 258} t="重複許多圈，一圈約一個原子厚" c={BLUE} a={a[3]} />
      </svg>
    </Card>
  );
};

// ── precursor-purity：乾淨有兩把尺（雜質全部加起來、傷晶片的金屬雜質更少），一顆金屬原子就可能出問題 ──
const Purity: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330, cl2 = on(f, T(o, "clean")), at = on(f, T(o, "atom")), bd = on(f, T(o, "bad"));
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        <text x={30} y={CT + 36} style={zh(30, H.text, 800)} opacity={0.4 + 0.6 * cl2}>雜質全部加起來</text>
        <rect x={30} y={CT + 52} width={520 * cl2} height={34} fill={GRY} /><rect x={30} y={CT + 52} width={520} height={34} fill="none" stroke={H.lineSoft} strokeWidth={2} />
        <text x={30} y={CT + 128} style={zh(30, H.text, 800)} opacity={0.4 + 0.6 * at}>傷晶片的金屬雜質（更少）</text>
        <rect x={30} y={CT + 144} width={46 * at} height={34} fill={H.amber} /><rect x={30} y={CT + 144} width={520} height={34} fill="none" stroke={H.lineSoft} strokeWidth={2} />
        <text x={30} y={CT + 226} style={zh(30, H.text2, 800)}>兩把尺不一樣，都要很小</text>
        <Sep x={600} />
        <rect x={640} y={CT + 120} width={280} height={60} fill={H.text2} opacity={0.3} />
        <circle cx={780} cy={CT + 100 + 20 * at} r={15} fill={H.amber} stroke="#8A5E00" strokeWidth={3} opacity={at} />
        <path d={`M700 ${CT + 150} h160`} stroke={bd > 0.5 ? RED : H.lineSoft} strokeWidth={bd > 0.5 ? 6 : 2} strokeDasharray="10 8" />
        <text x={640} y={CT + 230} style={zh(34, bd > 0.5 ? RED : H.text2, 900)} opacity={0.4 + 0.6 * bd}>一顆就可能出問題</text>
      </svg>
    </Card>
  );
};

// ── precursor-co：全球少數幾家；德國默克、法國液空、台灣宇川精材（興櫃）；台灣地圖標台中與南科 ──
const Co: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 400, fw = on(f, T(o, "few")), de = on(f, T(o, "de")), fr2 = on(f, T(o, "fr")), tw = on(f, T(o, "tw"));
  const P1 = twPt(120.68, 24.15, 70, CT + 12, 60), P2 = twPt(120.28, 23.1, 70, CT + 12, 60);
  const rows: [string, string, string, string, number][] = [["DE", "默克 Merck", "德國", "", de], ["FR", "法國液空 Air Liquide", "法國", "", fr2], ["TW", "宇川精材", "台灣・興櫃", "", tw]];
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        <path d={twPath(70, CT + 12, 60)} fill="#E7EDF7" stroke={tw > 0.5 ? H.amber : H.text2} strokeWidth={3} opacity={0.5 + 0.5 * tw} />
        <circle cx={P1[0]} cy={P1[1]} r={9} fill={H.amber} opacity={0.3 + 0.7 * fr2} /><circle cx={P2[0]} cy={P2[1]} r={9} fill={H.amber} opacity={0.3 + 0.7 * tw} />
        <line x1={P1[0] + 10} y1={P1[1]} x2={190} y2={P1[1]} stroke={H.amber} strokeWidth={3} opacity={0.3 + 0.7 * fr2} /><text x={196} y={P1[1] + 10} style={zh(30, H.text, 900)} opacity={0.4 + 0.6 * fr2}>台中</text><line x1={P2[0] + 10} y1={P2[1]} x2={190} y2={P2[1]} stroke={H.amber} strokeWidth={3} opacity={0.3 + 0.7 * tw} /><text x={196} y={P2[1] + 10} style={zh(30, H.text, 900)} opacity={0.4 + 0.6 * tw}>南科</text>
        <Sep x={290} />
        <text x={316} y={CT + 36} style={zh(34, H.text2, 900)} opacity={0.4 + 0.6 * fw}>全球少數幾家供應</text>
        {rows.map(([c, n, s, , a], i) => <g key={c}><FlagBox code={c} x={316} y={CT + 62 + i * 92} a={a} /><NamePlate x={384} y={CT + 56 + i * 92} w={330} h={48} t={n} a={a} px={32} />
          <text x={730} y={CT + 92 + i * 92} style={zh(32, H.text2, 800)} opacity={0.4 + 0.6 * a}>{s}</text></g>)}
      </svg>
    </Card>
  );
};

// ── precursor-next：下一集特用氣體 ──
const Next: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330, nx = on(f, T(o, "next")), gs = on(f, T(o, "gas")), kw = on(f, T(o, "kw"));
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        <g opacity={0.45 + 0.55 * gs} transform={`translate(130 ${CT + 150})`}><rect x={-34} y={-40} width={68} height={130} rx={24} fill="#FFFFFF" stroke={H.text2} strokeWidth={5} /><rect x={-14} y={-66} width={28} height={28} fill={H.text2} /><rect x={-28} y={30} width={56} height={44} fill={H2O} /></g>
        <Sep x={300} />
        <Row x={330} y={CT + 56} t="下一集：製程用的氣體" c={H.text2} a={nx} /><Row x={330} y={CT + 122} t="特用氣體" c={BLUE} a={gs} /><Row x={330} y={CT + 188} t="留言「前驅物」拿完整資料" c={H.amber} a={kw} />
      </svg>
    </Card>
  );
};

export const PrecursorSection: React.FC<P> = (p) => {
  const kd = String((p.o as any).kind);
  if (kd === "precursor-hook") return <Hook {...p} />;
  if (kd === "precursor-kinds") return <Kinds {...p} />;
  if (kd === "precursor-bubbler") return <Bubbler {...p} />;
  if (kd === "precursor-path") return <Path {...p} />;
  if (kd === "precursor-bubble") return <Bubble {...p} />;
  if (kd === "precursor-cold") return <Cold {...p} />;
  if (kd === "precursor-pulse") return <Pulse {...p} />;
  if (kd === "precursor-ald") return <Ald {...p} />;
  if (kd === "precursor-purity") return <Purity {...p} />;
  if (kd === "precursor-co") return <Co {...p} />;
  if (kd === "precursor-next") return <Next {...p} />;
  return null;
};

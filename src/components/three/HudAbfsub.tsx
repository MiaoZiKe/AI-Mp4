// 2026/11/27 tech-abfsub：ABF 載板（系列 3 第 8 集）的 2D 示意卡（overlay `section` 的 kind 以 "abs-" 開頭，Hud.tsx 的 HudSection 轉過來）。
//   abs-hook 接前一集｜abs-role 晶片→載板→主機板（細密→大顆）｜abs-core 核心板＝地基｜abs-sym 兩面對稱才不翹｜abs-layer 一層三步｜abs-size 接近十公分見方｜
//   abs-yield 闖關（示意，非實際良率）｜abs-warp 烤過頭的餅乾｜abs-co 公司（國旗＋文字名牌）｜abs-next 下一集 BT 載板。
// 全部示意：除了念稿的兩個數字（十公分、二十多層）不標尺寸。公司 LOGO 官方原檔抓不到時用白底深色文字名牌（不仿商標）＋國旗，100% 不透明。
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
const fr = (x: number) => ((x % 1) + 1) % 1;
const RED = "#E0472F", OK = "#14A38B", BLUE = "#2F7FE0", GRY = "#98A2B3", SI = "#5E6B82", CU = "#C77B3C", LASER = "#E0473A", PCB = "#2F6B4A", CORE = "#E8D9B0", ABF = "#9CCFB0", RESIN = "#E9C46A", COOKIE = "#D9A55B", COOKIED = "#B07A35";
const Sep: React.FC<{ x: number }> = ({ x }) => <line x1={x} y1={CT + 4} x2={x} y2={316} stroke={H.lineSoft} strokeWidth={3} />;
const Row: React.FC<{ x: number; y: number; t: string; c: string; a: number; px?: number }> = ({ x, y, t, c, a, px = 30 }) => (
  <g opacity={0.35 + 0.65 * a}><rect x={x} y={y - px * 0.72} width={12} height={px * 0.72} fill={c} /><text x={x + 24} y={y} style={zh(px, H.text, 900)}>{t}</text></g>
);
const FlagBox: React.FC<{ code: string; x: number; y: number; a: number }> = ({ code, x, y, a }) => (
  <g><rect x={x} y={y} width={50} height={36} fill="none" stroke={a > 0.5 ? H.amber : H.lineSoft} strokeWidth={a > 0.5 ? 4 : 1.5} /><Flag code={code} h={28} x={x + 4} y={y + 4} asSvg /></g>
);
const NamePlate: React.FC<{ x: number; y: number; w: number; h: number; t: string; a: number; px?: number }> = ({ x, y, w, h, t, a, px = 34 }) => (
  <g><rect x={x} y={y} width={w} height={h} fill="#FFFFFF" stroke={a > 0.5 ? H.amber : H.lineSoft} strokeWidth={a > 0.5 ? 4 : 1.5} />
    <text x={x + w / 2} y={y + h / 2 + px * 0.34} textAnchor="middle" style={zh(px, "#1F3A5F", 900)}>{t}</text></g>
);

// ── abs-hook：前一集膜備好了；整塊載板怎麼做？（左圖：載板側面一層層，問號） ──
const Hook: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330, q = on(f, T(o, "q")), pv = on(f, T(o, "prev")), fm = on(f, T(o, "film"));
  const n = Math.min(9, Math.floor(Math.max(0, f - T(o, "q")) / 8));
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        {Array.from({ length: n }, (_, i) => <rect key={i} x={40} y={CT + 220 - (i + 1) * 20} width={250} height={16} fill={i === 4 ? CORE : i % 2 ? CU : ABF} stroke={H.text2} strokeWidth={1.5} />)}
        <Sep x={318} />
        <Row x={344} y={CT + 56} t="整塊載板，怎麼做出來？" c={BLUE} a={q} />
        <Row x={344} y={CT + 122} t="前一集：味之素的膜備好了" c={H.text2} a={pv} />
        <Row x={344} y={CT + 188} t="今天：一層一層蓋出整塊板" c={H.amber} a={fm} />
      </svg>
    </Card>
  );
};

// ── abs-role：晶片 → 載板 → 主機板；細密的凸塊拉成大顆錫球 ──
const Role: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330, ch = on(f, T(o, "chip")), mb = on(f, T(o, "mb")), fi = on(f, T(o, "fine")), bl = on(f, T(o, "ball"));
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        <rect x={110} y={CT + 20} width={110} height={30} fill={SI} stroke={H.text2} strokeWidth={2} opacity={0.4 + 0.6 * ch} />
        {Array.from({ length: 12 }, (_, i) => <circle key={i} cx={116 + i * 9} cy={CT + 56} r={3} fill={GRY} opacity={0.4 + 0.6 * fi} />)}
        <rect x={50} y={CT + 62} width={230} height={40} fill={ABF} stroke={H.text2} strokeWidth={2} />
        {Array.from({ length: 7 }, (_, i) => <circle key={i} cx={66 + i * 33} cy={CT + 114} r={11} fill={GRY} stroke={H.text2} strokeWidth={1.5} opacity={0.4 + 0.6 * bl} />)}
        <rect x={20} y={CT + 126} width={290} height={26} fill={PCB} opacity={0.4 + 0.6 * mb} />
        <text x={30} y={CT + 196} style={zh(30, H.text2, 800)}>細密 → 大顆</text>
        <Sep x={334} />
        <Row x={360} y={CT + 52} t="晶片在最頂端" c={BLUE} a={ch} />
        <Row x={360} y={CT + 112} t="載板夾在中間" c={H.amber} a={Math.max(ch, mb)} />
        <Row x={360} y={CT + 172} t="細密接點拉成大顆錫球" c={OK} a={bl} />
        <Row x={360} y={CT + 232} t="錫球再焊到主機板" c={H.text2} a={mb} />
      </svg>
    </Card>
  );
};

// ── abs-core：核心板＝地基：鑽穿、鍍銅、補平 ──
const Core: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330, co = on(f, T(o, "core")), dr = on(f, T(o, "drill")), pl = on(f, T(o, "plate")), fl = on(f, T(o, "fill")), ba = on(f, T(o, "base"));
  const y0 = CT + 90;
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        <rect x={30} y={y0 - 8} width={270} height={8} fill={CU} /><rect x={30} y={y0 + 80} width={270} height={8} fill={CU} />
        <rect x={30} y={y0} width={270} height={80} fill={CORE} stroke={H.text2} strokeWidth={2} opacity={0.4 + 0.6 * co} />
        {[0, 1, 2].map((i) => <line key={i} x1={30} y1={y0 + 18 + i * 22} x2={300} y2={y0 + 18 + i * 22} stroke="#CDBB88" strokeWidth={4} opacity={co} />)}
        <rect x={152} y={y0 - 8} width={26} height={96} fill="#FFFFFF" opacity={dr} />
        <rect x={152} y={y0 - 8} width={5} height={96} fill={CU} opacity={pl} /><rect x={173} y={y0 - 8} width={5} height={96} fill={CU} opacity={pl} />
        <rect x={157} y={y0 - 8} width={16} height={96} fill={RESIN} opacity={fl} />
        <text x={40} y={CT + 236} style={zh(30, H.text2, 800)} opacity={0.4 + 0.6 * ba}>地基：硬、不易變形</text>
        <Sep x={334} />
        <Row x={360} y={CT + 48} t="核心板：玻纖布＋樹脂" c={H.amber} a={co} />
        <Row x={360} y={CT + 104} t="鑽穿，讓兩面相通" c={H.text2} a={dr} />
        <Row x={360} y={CT + 160} t="孔壁鍍銅、樹脂補平" c={BLUE} a={Math.max(pl, fl)} />
        <Row x={360} y={CT + 216} t="像先打好地基" c={OK} a={ba} />
      </svg>
    </Card>
  );
};

// ── abs-sym：兩面同時往外蓋，兩邊一樣厚才不翹（右：只蓋一面就翹） ──
const Sym: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330, tw = on(f, T(o, "two")), ou = on(f, T(o, "out")), ev = on(f, T(o, "even")), wp = on(f, T(o, "warp"));
  const y0 = CT + 110;
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        <rect x={30} y={y0} width={120} height={24} fill={CORE} stroke={H.text2} strokeWidth={2} />
        {[1, 2].map((i) => <rect key={`t${i}`} x={30} y={y0 - i * 16} width={120} height={14} fill={ABF} stroke={H.text2} strokeWidth={1.5} opacity={ou} />)}
        {[1, 2].map((i) => <rect key={`b${i}`} x={30} y={y0 + 24 + (i - 1) * 16 + 2} width={120} height={14} fill={ABF} stroke={H.text2} strokeWidth={1.5} opacity={ou} />)}
        <text x={90} y={CT + 214} textAnchor="middle" style={zh(30, OK, 900)} opacity={0.4 + 0.6 * ev}>平</text>
        <path d={`M180 ${y0 + 30} Q245 ${y0 + 10 - 30 * wp} 310 ${y0 + 30}`} fill="none" stroke={RED} strokeWidth={14} opacity={0.4 + 0.6 * wp} />
        <path d={`M180 ${y0 + 12} Q245 ${y0 - 8 - 30 * wp} 310 ${y0 + 12}`} fill="none" stroke={ABF} strokeWidth={10} opacity={0.4 + 0.6 * wp} />
        <text x={245} y={CT + 214} textAnchor="middle" style={zh(30, RED, 900)} opacity={0.4 + 0.6 * wp}>單面會翹</text>
        <Sep x={334} />
        <Row x={360} y={CT + 52} t="兩面同時往外蓋" c={BLUE} a={Math.max(tw, ou)} />
        <Row x={360} y={CT + 118} t="兩邊一樣厚" c={OK} a={ev} />
        <Row x={360} y={CT + 184} t="板子才不會翹" c={H.amber} a={wp} />
      </svg>
    </Card>
  );
};

// ── abs-layer：一層三步：貼膜 → 雷射打洞 → 鍍銅（一層接通一層） ──
const Layer: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330, fm = on(f, T(o, "film")), ho = on(f, T(o, "hole")), cu = on(f, T(o, "cu")), lk = on(f, T(o, "link"));
  const y0 = CT + 180;
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        <rect x={30} y={y0} width={270} height={14} fill={CU} />
        {[0, 1, 2].map((i) => <rect key={i} x={30} y={y0 - (i + 1) * 40} width={270} height={34} fill={ABF} stroke={H.text2} strokeWidth={1.5} opacity={i === 0 ? 0.4 + 0.6 * fm : lk} />)}
        {[0, 1, 2].map((i) => <rect key={`c${i}`} x={30} y={y0 - (i + 1) * 40 - 6} width={270} height={6} fill={CU} opacity={i === 0 ? cu : lk} />)}
        <path d={`M150 ${y0 - 40} L158 ${y0} L172 ${y0} L180 ${y0 - 40} Z`} fill={ho > 0.5 && cu < 0.5 ? "#FFFFFF" : CU} opacity={Math.max(ho, cu)} />
        <line x1={165} y1={CT + 10} x2={165} y2={y0 - 40} stroke={LASER} strokeWidth={5} opacity={ho * (1 - cu)} />
        <Sep x={334} />
        <Row x={360} y={CT + 48} t="貼膜（前一集的膜）" c={H.text2} a={fm} />
        <Row x={360} y={CT + 104} t="雷射打洞，停在下一層銅" c={LASER} a={ho} />
        <Row x={360} y={CT + 160} t="鍍銅，填進洞和線路" c={H.amber} a={cu} />
        <Row x={360} y={CT + 216} t="一層接通一層" c={OK} a={lk} />
      </svg>
    </Card>
  );
};

// ── abs-size：一般晶片的載板 vs 人工智慧晶片的載板（接近十公分見方） ──
const Size: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330, ai = on(f, T(o, "ai")), pn = on(f, T(o, "pins")), tn = on(f, T(o, "ten"));
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        <rect x={30} y={CT + 120} width={56} height={56} fill={PCB} stroke={H.text2} strokeWidth={2} /><rect x={48} y={CT + 138} width={20} height={20} fill={SI} />
        <rect x={120} y={CT + 30} width={146} height={146} fill={PCB} stroke={H.text2} strokeWidth={2} opacity={0.4 + 0.6 * ai} /><rect x={160} y={CT + 70} width={66} height={66} fill={SI} opacity={0.4 + 0.6 * ai} />
        {Array.from({ length: 30 }, (_, i) => <circle key={i} cx={128 + (i % 10) * 14.5} cy={CT + 38 + Math.floor(i / 10) * 8} r={2.5} fill="#E7B341" opacity={pn} />)}
        <line x1={120} y1={CT + 196} x2={266} y2={CT + 196} stroke={H.amber} strokeWidth={6} opacity={tn} /><line x1={120} y1={CT + 186} x2={120} y2={CT + 206} stroke={H.amber} strokeWidth={4} opacity={tn} /><line x1={266} y1={CT + 186} x2={266} y2={CT + 206} stroke={H.amber} strokeWidth={4} opacity={tn} />
        <text x={193} y={CT + 244} textAnchor="middle" style={zh(30, H.text, 900)} opacity={tn}>接近十公分</text>
        <Sep x={334} />
        <Row x={360} y={CT + 52} t="人工智慧晶片：接腳超多" c={BLUE} a={Math.max(ai, pn)} />
        <Row x={360} y={CT + 118} t="線要拉得開，板就得變大" c={H.text2} a={pn} />
        <Row x={360} y={CT + 184} t="接近十公分見方" c={H.amber} a={tn} />
      </svg>
    </Card>
  );
};

// ── abs-yield：每一層都是一關，一關失手就全毀（示意，非實際良率） ──
const Yield: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330, tw = on(f, T(o, "twenty")), mo = on(f, T(o, "more")), er = on(f, T(o, "err")), gm = on(f, T(o, "game")), fl = on(f, T(o, "fail"));
  const n = Math.min(22, Math.floor(Math.max(0, f - T(o, "twenty") + 12) / 3));
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        {Array.from({ length: 22 }, (_, i) => { const bad = i === 15 && er > 0.5, lit = i < n && !(i > 15 && er > 0.5); return <rect key={i} x={40} y={CT + 226 - (i + 1) * 9.5} width={200} height={7} fill={fl > 0.5 ? RED : bad ? RED : lit ? OK : "#DDE3EC"} opacity={0.5 + 0.5 * tw} />; })}
        <g opacity={fl}><line x1={250} y1={CT + 30} x2={300} y2={CT + 80} stroke={RED} strokeWidth={10} /><line x1={300} y1={CT + 30} x2={250} y2={CT + 80} stroke={RED} strokeWidth={10} /></g>
        <Sep x={334} />
        <Row x={360} y={CT + 48} t="兩面加起來二十多層" c={BLUE} a={tw} />
        <Row x={360} y={CT + 104} t="每多一層，多一次出錯機會" c={H.text2} a={mo} />
        <Row x={360} y={CT + 160} t="像闖關" c={H.amber} a={gm} />
        <Row x={360} y={CT + 216} t="一關失手，整片報廢" c={RED} a={fl} />
      </svg>
    </Card>
  );
};

// ── abs-warp：越大越厚、受熱越容易翹，像烤過頭的餅乾 ──
const Warp: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330, bg = on(f, T(o, "big")), ht = on(f, T(o, "heat"), 24), ck = on(f, T(o, "cookie"));
  const y0 = CT + 110, b = 34 * ht;
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        <path d={`M30 ${y0 - b} Q160 ${y0 + b} 290 ${y0 - b} L290 ${y0 - b + 22} Q160 ${y0 + b + 22} 30 ${y0 - b + 22} Z`} fill={PCB} stroke={H.text2} strokeWidth={2} opacity={0.4 + 0.6 * bg} />
        {[0, 1, 2].map((i) => <path key={i} d={`M${90 + i * 70} ${y0 + 70} q10 -14 0 -28 q-10 -14 0 -28`} fill="none" stroke="#F28A3C" strokeWidth={5} opacity={ht} />)}
        <g opacity={0.35 + 0.65 * ck}><path d={`M60 ${CT + 222} Q160 ${CT + 196 - 10} 260 ${CT + 222} L260 ${CT + 236} Q160 ${CT + 212} 60 ${CT + 236} Z`} fill={COOKIE} stroke={COOKIED} strokeWidth={3} />{[0, 1, 2].map((i) => <circle key={i} cx={110 + i * 50} cy={CT + 222 - 6 + Math.abs(i - 1) * 4} r={5} fill={COOKIED} />)}</g>
        <Sep x={334} />
        <Row x={360} y={CT + 52} t="板子越大越厚" c={H.text2} a={bg} />
        <Row x={360} y={CT + 118} t="受熱，材料脹得不一樣" c={H.amber} a={ht} />
        <Row x={360} y={CT + 184} t="翹起來，像烤過頭的餅乾" c={RED} a={ck} />
      </svg>
    </Card>
  );
};

// ── abs-co：台灣欣興、南電、景碩；日本揖斐電；新光電氣 2025/6/6 已下市 ──
const Co: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 392, uni = on(f, T(o, "uni")), nya = on(f, T(o, "nya")), kin = on(f, T(o, "kin")), jp = on(f, T(o, "jp"));
  const rows: [string, string, string, number][] = [["TW", "欣興 3037", "ABF 載板大廠", uni], ["TW", "南電 8046", "ABF、BT 載板（台塑集團）", nya], ["TW", "景碩 3189", "ABF、BT 載板（和碩集團）", kin], ["JP", "揖斐電 4062", "日本大廠；新光電氣 2025/6 已下市", jp]];
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        {rows.map(([c, n, s, a], i) => <g key={n}><FlagBox code={c} x={30} y={CT + 22 + i * 74} a={a} /><NamePlate x={98} y={CT + 16 + i * 74} w={300} h={50} t={n} a={a} px={32} />
          <text x={418} y={CT + 52 + i * 74} style={zh(30, H.text2, 800)} opacity={0.4 + 0.6 * a}>{s}</text></g>)}
      </svg>
    </Card>
  );
};

// ── abs-next：不是每顆晶片都用得起；下一集 BT 載板 ──
const Next: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330, cs = on(f, T(o, "cost")), nx = on(f, T(o, "next")), ot = on(f, T(o, "other")), kw = on(f, T(o, "kw"));
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        <rect x={30} y={CT + 60} width={140} height={140} fill={PCB} stroke={H.text2} strokeWidth={2} opacity={0.4 + 0.6 * cs} /><text x={100} y={CT + 146} textAnchor="middle" style={zh(40, "#FFFFFF", 900)} opacity={cs}>$$$</text>
        <rect x={200} y={CT + 130} width={90} height={56} fill="#7FA36A" stroke={H.text2} strokeWidth={2} opacity={0.4 + 0.6 * ot} /><text x={245} y={CT + 110} textAnchor="middle" style={zh(56, RED, 900)} opacity={ot}>？</text>
        <Sep x={334} />
        <Row x={360} y={CT + 56} t="不是每顆晶片都用得起" c={H.text2} a={cs} />
        <Row x={360} y={CT + 122} t="下一集：另一種常見的載板" c={BLUE} a={Math.max(nx, ot)} />
        <Row x={360} y={CT + 188} t="留言「載板」拿完整資料" c={H.amber} a={kw} />
      </svg>
    </Card>
  );
};

export const AbfsubSection: React.FC<P> = (p) => {
  const kd = String((p.o as any).kind);
  if (kd === "abs-hook") return <Hook {...p} />;
  if (kd === "abs-role") return <Role {...p} />;
  if (kd === "abs-core") return <Core {...p} />;
  if (kd === "abs-sym") return <Sym {...p} />;
  if (kd === "abs-layer") return <Layer {...p} />;
  if (kd === "abs-size") return <Size {...p} />;
  if (kd === "abs-yield") return <Yield {...p} />;
  if (kd === "abs-warp") return <Warp {...p} />;
  if (kd === "abs-co") return <Co {...p} />;
  if (kd === "abs-next") return <Next {...p} />;
  return null;
};

// 2026/11/27 tech-pkgmat：封裝材料（系列 3 第 3 集）的 2D 示意卡（overlay `section` 的 kind 以 "pkg-" 開頭，Hud.tsx 的 HudSection 轉過來）。
//   pkg-hook 光著的晶片｜pkg-lf 導線架構造｜pkg-make 沖壓 vs 蝕刻｜pkg-emc 封裝膠成分（約八成細砂，依配方而異）｜pkg-mold 轉移成型（布丁 vs 越熱越硬）｜
//   pkg-shell 外殼擋濕氣與碰撞（不寫散熱）｜pkg-ball 四周排腳 vs 底部錫球｜pkg-cte 熱脹冷縮剪切｜pkg-uf 毛細作用（茶滲進兩片玻璃）｜pkg-co 公司（國旗＋名牌）｜pkg-next 下一集覆晶。
// 排版：內容從 CARD_CONTENT_TOP 以下；字 ≥30px；國旗與名牌 100% 不透明（只有文字用透明度）。公司 LOGO 官方原檔當天抓不到（見 videos/tech-pkgmat/assets.md），用白底深色文字名牌。
import React from "react";
import { FONT_ZH } from "../../theme";
import { H, L, CARD_HEAD, CARD_CONTENT_TOP, cardTitleBox } from "./hudSkin";
import { EASE, tween } from "../anim";
import type { Model3D, Overlay3D, State3D } from "./engine";

const zh = (px: number, color: string = H.text, w = 800): React.CSSProperties => ({ fontFamily: FONT_ZH, fontSize: px, fill: color, color, fontWeight: w, whiteSpace: "nowrap" });
const onC = (bg: string) => (bg === H.amber ? ((H as any).onAmber ?? H.onAccent) : H.onAccent);
type P = { o: Overlay3D; f: number; k: number; m: Model3D; s?: State3D };
const T = (o: Overlay3D, n: string) => ((o as any).t?.[n]?.at ?? o.at) as number;
const CT = CARD_CONTENT_TOP + 8;
const Card: React.FC<{ o: Overlay3D; k: number; W: number; Hh: number; children: React.ReactNode }> = ({ o, k, W, Hh, children }) => (
  <div style={{ position: "absolute", left: o.x ?? L.X, top: o.y ?? 900, width: W, height: Hh, opacity: k, background: H.cardCompare, border: `2px solid ${H.lineSoft}`, boxSizing: "border-box", overflow: "hidden" }}>
    {o.title ? <div style={{ ...zh(CARD_HEAD.px, onC(H.line), 800), ...cardTitleBox(), background: H.line, zIndex: 2 }}>{o.title}</div> : null}
    {o.tag ? <div style={{ position: "absolute", right: 16, top: 14, ...zh(28, H.text2, 600), zIndex: 2 }}>{o.tag}</div> : null}
    {children}
  </div>
);
const on = (f: number, at: number, d = 10) => tween(f, at, d, EASE.enter);
const fr = (x: number) => ((x % 1) + 1) % 1;
const RED = "#E0472F", OK = "#14A38B", BLUE = "#2F7FE0", ORG = "#F29A4A", GRY = "#98A2B3", GOLD = "#D8B25A", AL = "#C3CAD6", OX = "#6FA7D8", SI = "#5E6B82", PCB = "#1E6B4E", HAIR = "#4A3525", DIE = "#7F95BC", CER = "#E8E4DA";
const Sep: React.FC<{ x: number }> = ({ x }) => <line x1={x} y1={CT + 4} x2={x} y2={316} stroke={H.lineSoft} strokeWidth={3} />;
const Row: React.FC<{ x: number; y: number; t: string; c: string; a: number; px?: number }> = ({ x, y, t, c, a, px = 30 }) => (
  <g opacity={0.35 + 0.65 * a}><rect x={x} y={y - px * 0.72} width={12} height={px * 0.72} fill={c} /><text x={x + 24} y={y} style={zh(px, H.text, 900)}>{t}</text></g>
);
const RX = 352;   // 右側文字欄起點
// 小晶圓（圓＋晶片格），晶片顏色由 col(i, j) 決定
const Wafer: React.FC<{ cx: number; cy: number; r: number; col: (i: number, j: number) => string; op?: number }> = ({ cx, cy, r, col, op = 1 }) => {
  const p = 22, cells: React.ReactNode[] = [];
  for (let i = -6; i <= 5; i++) for (let j = -6; j <= 5; j++) { const x = cx + i * p, y = cy + j * p; if (Math.hypot(Math.abs(i + 0.5) * p + p / 2, Math.abs(j + 0.5) * p + p / 2) < r - 4) cells.push(<rect key={`${i}_${j}`} x={x + 2} y={y + 2} width={p - 4} height={p - 4} fill={col(i, j)} />); }
  return <g opacity={op}><circle cx={cx} cy={cy} r={r} fill={SI} stroke={H.text2} strokeWidth={3} />{cells}</g>;
};
import { Flag } from "./Brand";
const CU = "#C8794A", EMC = "#1B1D22", EMCS = "#4A3528", SOL = "#B9C0CA", UF = "#E8A33A", WATER = "#6FB6E8", HOT = "#E5602B", SUB = "#2F5D4A";
const FlagBox: React.FC<{ code: string; x: number; y: number; a: number }> = ({ code, x, y, a }) => (
  <g><rect x={x} y={y} width={50} height={36} fill="none" stroke={a > 0.5 ? H.amber : H.lineSoft} strokeWidth={a > 0.5 ? 4 : 1.5} /><Flag code={code} h={28} x={x + 4} y={y + 4} asSvg /></g>
);
const NamePlate: React.FC<{ x: number; y: number; w: number; h: number; t: string; a: number; px?: number }> = ({ x, y, w, h, t, a, px = 32 }) => (
  <g><rect x={x} y={y} width={w} height={h} fill="#FFFFFF" stroke={a > 0.5 ? H.amber : H.lineSoft} strokeWidth={a > 0.5 ? 4 : 1.5} />
    <text x={x + w / 2} y={y + h / 2 + px * 0.34} textAnchor="middle" style={zh(px, "#1F3A5F", 900)}>{t}</text></g>
);
// 小導線架（俯視）：晶片座＋四周引腳
const MiniLF: React.FC<{ cx: number; cy: number; s?: number; chip?: boolean; wires?: boolean; op?: number }> = ({ cx, cy, s = 1, chip = true, wires = false, op = 1 }) => (
  <g opacity={op}>
    {[0, 1, 2, 3].flatMap((side) => [-3, -1, 1, 3].map((u) => { const a = side * 90 * Math.PI / 180, c = Math.cos(a), sn = Math.sin(a);
      const x0 = cx + (c * 46 - sn * u * 12) * s, y0 = cy + (sn * 46 + c * u * 12) * s, x1 = cx + (c * 96 - sn * u * 12) * s, y1 = cy + (sn * 96 + c * u * 12) * s;
      return <line key={`${side}${u}`} x1={x0} y1={y0} x2={x1} y2={y1} stroke={CU} strokeWidth={8 * s} />; }))}
    <rect x={cx - 38 * s} y={cy - 38 * s} width={76 * s} height={76 * s} fill={CU} />
    {chip ? <rect x={cx - 28 * s} y={cy - 28 * s} width={56 * s} height={56 * s} fill={CHIP} stroke={H.text2} strokeWidth={2} /> : null}
    {wires ? [0, 1, 2, 3].flatMap((side) => [-1, 1].map((u) => { const a = side * 90 * Math.PI / 180, c = Math.cos(a), sn = Math.sin(a);
      return <line key={`w${side}${u}`} x1={cx + (c * 26 - sn * u * 8) * s} y1={cy + (sn * 26 + c * u * 8) * s} x2={cx + (c * 52 - sn * u * 12) * s} y2={cy + (sn * 52 + c * u * 12) * s} stroke={GOLD} strokeWidth={3} />; })) : null}
  </g>
);
const CHIP = "#4C5568";

// ── pkg-hook：線接好了，晶片還光著；要怎麼保護？ ──
const Hook: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330, ba = on(f, T(o, "bare")), pr = on(f, T(o, "prot")), pv = on(f, T(o, "prev")), mt = on(f, T(o, "mat")), pu = Math.sin(f * 0.14) * 0.5 + 0.5;
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        <MiniLF cx={160} cy={CT + 116} s={1.05} wires op={0.5 + 0.5 * Math.max(ba, pv)} />
        <rect x={132} y={CT + 88} width={56} height={56} fill="none" stroke={RED} strokeWidth={5} opacity={pr * (0.6 + 0.4 * pu)} />
        <Sep x={RX - 26} />
        <Row x={RX} y={CT + 52} t="晶片還光著，怎麼保護？" c={BLUE} a={Math.max(ba, pr)} />
        <Row x={RX} y={CT + 122} t="前一集：線接好了" c={H.text2} a={pv} />
        <Row x={RX} y={CT + 192} t="這集：導線架、封裝膠、錫球" c={H.amber} a={mt} />
      </svg>
    </Card>
  );
};

// ── pkg-lf：導線架＝一片薄銅：晶片座在中間、四周伸出金屬腳 ──
const LF: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330, lf = on(f, T(o, "lf")), cu = on(f, T(o, "cu")), lg = on(f, T(o, "leg"));
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        <MiniLF cx={160} cy={CT + 116} s={1.05} op={0.45 + 0.55 * Math.max(lf, cu)} />
        <circle cx={160} cy={CT + 116} r={48} fill="none" stroke={H.amber} strokeWidth={4} opacity={lf} />
        <Sep x={RX - 26} />
        <Row x={RX} y={CT + 52} t="晶片座：晶片坐在中間" c={H.amber} a={lf} />
        <Row x={RX} y={CT + 122} t="一片薄薄的銅（銅合金）" c={H.text2} a={cu} />
        <Row x={RX} y={CT + 192} t="四周伸出金屬腳" c={BLUE} a={lg} />
      </svg>
    </Card>
  );
};

// ── pkg-make：量大＝沖壓（像餅乾模一壓成形）；腳細＝蝕刻（藥水把沒蓋光阻的吃掉） ──
const Make: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330, bg = on(f, T(o, "big")), ck = on(f, T(o, "cookie")), ps = on(f, T(o, "press"), 8), et = on(f, T(o, "etch"), 20);
  const dn = 30 * ps;
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        <g opacity={0.4 + 0.6 * Math.max(bg, ck)}>
          <rect x={46} y={CT + 10 + dn} width={90} height={40} fill="#A9B5C7" stroke={H.text2} strokeWidth={3} />
          {[0, 1, 2, 3].map((i) => <rect key={i} x={54 + i * 21} y={CT + 50 + dn} width={10} height={14} fill="#7D8CA6" />)}
          <rect x={30} y={CT + 100} width={122} height={10} fill={CU} />
        </g>
        <g opacity={0.4 + 0.6 * et}>
          {[0, 1, 2, 3, 4, 5].map((i) => <rect key={i} x={186 + i * 18} y={CT + 92} width={10} height={8} fill={BLUE} />)}
          <rect x={180} y={CT + 100} width={116} height={10} fill={CU} opacity={1 - 0.75 * et} />
          {[0, 1, 2, 3, 4, 5].map((i) => <rect key={`c${i}`} x={186 + i * 18} y={CT + 100} width={10} height={10} fill={CU} />)}
          {[0, 1, 2].map((i) => { const u = fr(f * 0.04 + i / 3); return <circle key={`d${i}`} cx={200 + i * 36} cy={CT + 20 + 70 * u} r={6} fill={WATER} opacity={et * (1 - u * 0.4)} />; })}
        </g>
        <text x={90} y={CT + 160} textAnchor="middle" style={zh(30, H.text, 900)} opacity={0.4 + 0.6 * ck}>沖壓</text>
        <text x={238} y={CT + 160} textAnchor="middle" style={zh(30, H.text, 900)} opacity={0.4 + 0.6 * et}>蝕刻</text>
        <Sep x={RX - 26} />
        <Row x={RX} y={CT + 52} t="量大：像餅乾模，一壓成形" c={H.amber} a={ck} />
        <Row x={RX} y={CT + 122} t="腳細：藥水把不要的吃掉" c={BLUE} a={et} />
        <Row x={RX} y={CT + 192} t="光阻蓋住的地方留下來" c={H.text2} a={et} />
      </svg>
    </Card>
  );
};

// ── pkg-emc：封裝膠＝黑色環氧樹脂＋大量細砂（二氧化矽填料約七到九成，依配方而異） ──
const Emc: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330, em = on(f, T(o, "emc")), ep = on(f, T(o, "epoxy")), sd = on(f, T(o, "sand"), 24);
  const cx = 160, cy = CT + 116, r = 90, ang = 2 * Math.PI * 0.8 * sd;
  const arc = `M${cx} ${cy} L${cx} ${cy - r} A${r} ${r} 0 ${ang > Math.PI ? 1 : 0} 1 ${cx + r * Math.sin(ang)} ${cy - r * Math.cos(ang)} Z`;
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        <circle cx={cx} cy={cy} r={r} fill={EMCS} opacity={0.5 + 0.5 * Math.max(em, ep)} />
        {sd > 0.01 ? <path d={arc} fill="#F4F6FA" stroke={H.text2} strokeWidth={2} /> : null}
        <circle cx={cx} cy={cy} r={r} fill="none" stroke={H.text2} strokeWidth={3} />
        <Sep x={RX - 26} />
        <Row x={RX} y={CT + 52} t="封裝膠：黑色環氧樹脂" c={H.text2} a={Math.max(em, ep)} />
        <Row x={RX} y={CT + 122} t="大約八成是細砂（白）" c={BLUE} a={sd} />
        <Row x={RX} y={CT + 192} t="砂多：受熱比較不會脹" c={H.amber} a={sd} />
      </svg>
    </Card>
  );
};

// ── pkg-mold：轉移成型：料餅加熱變軟、柱塞擠進模穴、包住晶片金線；像灌布丁，但越熱越硬 ──
const Mold: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330, sf = on(f, T(o, "soft")), md = on(f, T(o, "mold"), 40), pd = on(f, T(o, "pud")), wr = on(f, T(o, "wrap")), hd = on(f, T(o, "hard"), 20);
  const fill = 160 * md;
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        <rect x={30} y={CT + 30} width={270} height={120} fill="#A9B5C7" stroke={H.text2} strokeWidth={3} />
        <rect x={60} y={CT + 70} width={180} height={44} fill="#FFFFFF" />
        <rect x={60 + 180 - Math.min(180, fill)} y={CT + 70} width={Math.min(180, fill)} height={44} fill={hd > 0.5 ? EMC : EMCS} />
        <rect x={120} y={CT + 92} width={60} height={12} fill={CHIP} /><path d="M120 98 q-20 -26 -40 0 M180 98 q20 -26 40 0" transform={`translate(0 ${CT})`} fill="none" stroke={GOLD} strokeWidth={3} />
        <rect x={250} y={CT + 114} width={26} height={60 - 20 * md} fill={EMCS} opacity={0.5 + 0.5 * sf} /><rect x={250} y={CT + 174 - 20 * md} width={26} height={24} fill="#7D8CA6" />
        <g opacity={hd}>{[0, 1, 2].map((i) => <path key={i} d={`M${70 + i * 80} ${CT + 168} q10 -14 0 -26 q-10 -12 0 -24`} fill="none" stroke={HOT} strokeWidth={5} />)}</g>
        <Sep x={RX - 26} />
        <Row x={RX} y={CT + 48} t="料餅加熱變軟，擠進模具" c={H.text2} a={Math.max(sf, md)} />
        <Row x={RX} y={CT + 108} t="像灌布丁，包住晶片金線" c={H.amber} a={Math.max(pd, wr)} />
        <Row x={RX} y={CT + 168} t="布丁冷了才凝固" c={H.text2} a={hd} />
        <Row x={RX} y={CT + 228} t="封裝膠是越熱越硬" c={RED} a={hd} />
      </svg>
    </Card>
  );
};

// ── pkg-shell：硬了擋住濕氣、碰撞，也絕緣；散熱主要靠金屬（不是封裝膠） ──
const Shell: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330, wt = on(f, T(o, "wet")), ht = on(f, T(o, "hit")), sh = on(f, T(o, "shell"));
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        <rect x={70} y={CT + 110} width={180} height={70} fill={EMC} opacity={0.5 + 0.5 * sh} />
        {[-2, -1, 0, 1, 2].map((u) => <line key={u} x1={60} y1={CT + 150 + u * 8} x2={40} y2={CT + 168 + u * 8} stroke={CU} strokeWidth={4} />)}
        {[0, 1, 2].map((i) => { const t = fr(f * 0.03 + i / 3), y = CT + 20 + 84 * Math.min(1, t * 1.4), x = 100 + i * 50 + (t > 0.7 ? (t - 0.7) * 120 : 0); return <circle key={i} cx={x} cy={y} r={8} fill={WATER} opacity={wt * (1 - t * 0.5)} />; })}
        <circle cx={230} cy={CT + 96} r={10} fill="#8A7F72" opacity={ht} />
        <Sep x={RX - 26} />
        <Row x={RX} y={CT + 52} t="擋住濕氣" c={BLUE} a={wt} />
        <Row x={RX} y={CT + 122} t="擋住碰撞，也絕緣" c={H.amber} a={ht} />
        <Row x={RX} y={CT + 192} t="晶片有了殼（散熱靠金屬）" c={H.text2} a={sh} />
      </svg>
    </Card>
  );
};

// ── pkg-ball：四周排腳數量有限；底部整面排錫球（零點幾毫米） ──
const Ball: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330, mn = on(f, T(o, "many")), bl = on(f, T(o, "ball"), 20), mm = on(f, T(o, "mm")), pc = on(f, T(o, "pcb"));
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        <g opacity={0.45 + 0.55 * mn}><MiniLF cx={84} cy={CT + 100} s={0.62} /></g>
        <g opacity={0.4 + 0.6 * bl}><rect x={168} y={CT + 40} width={124} height={124} fill={SUB} stroke={H.text2} strokeWidth={3} />
          {Array.from({ length: 36 }, (_, i) => <circle key={i} cx={182 + (i % 6) * 19.2} cy={CT + 54 + Math.floor(i / 6) * 19.2} r={6.5 * Math.min(1, bl * 1.2)} fill={SOL} stroke={H.text2} strokeWidth={1} />)}</g>
        <text x={84} y={CT + 210} textAnchor="middle" style={zh(30, H.text, 900)} opacity={0.4 + 0.6 * mn}>四周排腳</text>
        <text x={230} y={CT + 210} textAnchor="middle" style={zh(30, H.text, 900)} opacity={0.4 + 0.6 * bl}>底部錫球</text>
        <Sep x={RX - 26} />
        <Row x={RX} y={CT + 52} t="腳太多，四周排不下" c={H.text2} a={mn} />
        <Row x={RX} y={CT + 122} t="底部整面種錫球：零點幾毫米" c={H.amber} a={Math.max(bl, mm)} />
        <Row x={RX} y={CT + 192} t="加熱熔化，焊到電路板" c={BLUE} a={pc} />
      </svg>
    </Card>
  );
};

// ── pkg-cte：晶片（封裝）和電路板受熱伸長不一樣，錫點被來回剪，久了裂開 ──
const Cte: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330, ct = on(f, T(o, "cte")), cr = on(f, T(o, "crack"));
  const sw = Math.sin(f * 0.115) * 14 * ct;
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        <rect x={50} y={CT + 30} width={230} height={36} fill={SUB} stroke={H.text2} strokeWidth={2} />
        {[0, 1, 2, 3].map((i) => { const x = 80 + i * 56; return <g key={i}><path d={`M${x} ${CT + 66} L${x + 20} ${CT + 66} L${x + 20 + sw} ${CT + 122} L${x + sw} ${CT + 122} Z`} fill={SOL} stroke={H.text2} strokeWidth={2} />
          <line x1={x} y1={CT + 72} x2={x + 20} y2={CT + 72} stroke={RED} strokeWidth={4} opacity={cr} /></g>; })}
        <rect x={40 + sw} y={CT + 122} width={250} height={36} fill="#1E6B4E" stroke={H.text2} strokeWidth={2} />
        <path d={`M${300 + sw} ${CT + 140} l-12 -8 l0 16 Z`} fill={HOT} opacity={ct} /><path d={`M${30 + sw} ${CT + 140} l12 -8 l0 16 Z`} fill={HOT} opacity={ct} />
        <Sep x={RX - 26} />
        <Row x={RX} y={CT + 52} t="晶片和電路板一起受熱" c={H.text2} a={ct} />
        <Row x={RX} y={CT + 122} t="電路板伸縮得多，錫點被剪" c={H.amber} a={ct} />
        <Row x={RX} y={CT + 192} t="來回很多次，錫點裂開" c={RED} a={cr} />
      </svg>
    </Card>
  );
};

// ── pkg-uf：底部填充膠沿邊點，靠毛細作用自己吸進縫（像茶滲進兩片玻璃之間），硬化後黏成一塊、分散力量 ──
const Uf: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330, uf = on(f, T(o, "uf")), te = on(f, T(o, "tea"), 40), gl = on(f, T(o, "glue")), sp = on(f, T(o, "spread"));
  const fill = 220 * Math.sqrt(te);
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        <rect x={50} y={CT + 40} width={230} height={30} fill="#BFD3F2" stroke={H.text2} strokeWidth={2} />
        <rect x={50} y={CT + 96} width={230} height={30} fill="#BFD3F2" stroke={H.text2} strokeWidth={2} />
        <rect x={280 - fill} y={CT + 70} width={fill} height={26} fill={UF} opacity={0.85} />
        <rect x={274} y={CT + 6} width={8} height={36} fill="#7D8CA6" opacity={0.4 + 0.6 * uf} />
        {[0, 1, 2].map((i) => <path key={i} d={`M${80 + i * 70} ${CT + 170} l18 -12 l18 12`} fill="none" stroke={OK} strokeWidth={5} opacity={sp} />)}
        <text x={160} y={CT + 220} textAnchor="middle" style={zh(30, H.text, 900)} opacity={0.4 + 0.6 * te}>兩片玻璃中間的茶</text>
        <Sep x={RX - 26} />
        <Row x={RX} y={CT + 48} t="縫邊點底部填充膠" c={H.text2} a={uf} />
        <Row x={RX} y={CT + 108} t="毛細作用：自己吸進去" c={H.amber} a={te} />
        <Row x={RX} y={CT + 168} t="硬了黏成一塊" c={BLUE} a={gl} />
        <Row x={RX} y={CT + 228} t="力量分散，不保證不裂" c={OK} a={sp} />
      </svg>
    </Card>
  );
};

// ── pkg-co：導線架（長華電材 8070 子公司長華科技 6548、界霖 5285）、封裝膠（日本住友電木） ──
const Co: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 392, lf = on(f, T(o, "lf2")), cw = on(f, T(o, "cw")), sb = on(f, T(o, "sb"));
  const rows: [string, string, string, number][] = [["TW", "長華科技 6548", "導線架；母公司長華電材 8070", cw], ["TW", "界霖 5285", "導線架", cw], ["JP", "住友電木", "封裝膠（環氧樹脂模封料）", sb]];
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        <text x={30} y={CT + 34} style={zh(32, H.text2, 900)} opacity={0.4 + 0.6 * lf}>少數幾家，不排名</text>
        {rows.map(([c, n, s, a], i) => <g key={n}><FlagBox code={c} x={30} y={CT + 62 + i * 96} a={a} /><NamePlate x={98} y={CT + 56 + i * 96} w={300} h={50} t={n} a={a} px={30} />
          <text x={418} y={CT + 92 + i * 96} style={zh(30, H.text2, 800)} opacity={0.4 + 0.6 * a}>{s}</text></g>)}
      </svg>
    </Card>
  );
};

// ── pkg-next：晶片自己長凸塊、倒扣（覆晶）；下一集；留言關鍵字 ──
const Next: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330, bp = on(f, T(o, "bump")), fl = on(f, T(o, "flip"), 24), nx = on(f, T(o, "next")), kw = on(f, T(o, "kw"));
  const rot = 180 * fl;
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        <g transform={`rotate(${rot} 160 ${CT + 80})`} opacity={0.4 + 0.6 * bp}><rect x={100} y={CT + 64} width={120} height={30} fill={CHIP} stroke={H.text2} strokeWidth={2} />
          {[0, 1, 2, 3, 4].map((i) => <circle key={i} cx={112 + i * 24} cy={CT + 58} r={7} fill={SOL} stroke={H.text2} strokeWidth={1} />)}</g>
        <rect x={70} y={CT + 160} width={180} height={24} fill={SUB} stroke={H.text2} strokeWidth={2} />
        <Sep x={RX - 26} />
        <Row x={RX} y={CT + 52} t="晶片自己長凸塊、倒扣" c={H.amber} a={Math.max(bp, fl)} />
        <Row x={RX} y={CT + 122} t="下一集：覆晶" c={H.text2} a={nx} />
        <Row x={RX} y={CT + 192} t="留言「錫球」拿完整資料" c={H.amber} a={kw} />
      </svg>
    </Card>
  );
};

export const PkgmatSection: React.FC<P> = (p) => {
  const kd = String((p.o as any).kind);
  if (kd === "pkg-hook") return <Hook {...p} />;
  if (kd === "pkg-lf") return <LF {...p} />;
  if (kd === "pkg-make") return <Make {...p} />;
  if (kd === "pkg-emc") return <Emc {...p} />;
  if (kd === "pkg-mold") return <Mold {...p} />;
  if (kd === "pkg-shell") return <Shell {...p} />;
  if (kd === "pkg-ball") return <Ball {...p} />;
  if (kd === "pkg-cte") return <Cte {...p} />;
  if (kd === "pkg-uf") return <Uf {...p} />;
  if (kd === "pkg-co") return <Co {...p} />;
  if (kd === "pkg-next") return <Next {...p} />;
  return null;
};

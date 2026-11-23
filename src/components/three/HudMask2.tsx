// 2026/11/24 tech-mask2：光罩-2（誰做光罩、怎麼運送）的 2D 示意卡（overlay `section` 的 kind 以 "mk2-" 開頭，Hud.tsx 的 HudSection 轉過來）。
//   mk2-hook 光罩（晶片的底片）→ 誰做？→ 怎麼送進曝光機｜mk2-cap 晶圓廠自己的光罩廠（台積電、英特爾、三星）＋改版迴圈｜
//   mk2-mer 專業光罩廠（DNP、Tekscend、Photronics）｜mk2-tw 台灣光罩：成熟製程｜mk2-eb 電子束寫入剖面（石英／鉻／光阻，電子帶「－」）｜
//   mk2-mb 單束 vs 多束｜mk2-ins 一個瑕疵 → 每顆晶粒都印上｜mk2-pod 光罩盒兩層（爆炸側視）｜mk2-vac 很難加保護膜 → 內盒在真空裡才打開｜
//   mk2-co 最早通過認證：英特格、家登｜mk2-next 下一集光阻＋留言「光罩盒」
// 全部示意；結構一開始就畫出（不留空框），念到時該處亮起、動起來；時間全部來自 script.json 的 t（cue）。
// 排版原則（card-overlap.mjs 檢查）：內容從 CARD_CONTENT_TOP 以下；字離圖形 ≥10px；欄間 ≥24px；分隔線不穿字；字 ≥30px；電子的「－」用線畫，不用字。
import React from "react";
import { FONT_ZH } from "../../theme";
import { H, sm, CARD_HEAD, CARD_CONTENT_TOP, cardTitleBox } from "./hudSkin";
import { EASE, tween } from "../anim";
import type { Model3D, Overlay3D } from "./engine";

const zh = (px: number, color: string = H.text, w = 800): React.CSSProperties => ({ fontFamily: FONT_ZH, fontSize: px, fill: color, color, fontWeight: w, whiteSpace: "nowrap" });
const onC = (bg: string) => (bg === H.amber ? ((H as any).onAmber ?? H.onAccent) : H.onAccent);
type P = { o: Overlay3D; f: number; k: number; m: Model3D };
const T = (o: Overlay3D, n: string) => ((o as any).t?.[n]?.at ?? o.at) as number;
const CT = CARD_CONTENT_TOP;
const Card: React.FC<{ o: Overlay3D; k: number; W: number; Hh: number; children: React.ReactNode }> = ({ o, k, W, Hh, children }) => (
  <div style={{ position: "absolute", left: o.x ?? 64, top: o.y ?? 900, width: W, height: Hh, opacity: k, background: H.cardCompare, border: `2px solid ${H.lineSoft}`, boxSizing: "border-box", overflow: "hidden" }}>
    {o.title ? <div style={{ ...zh(CARD_HEAD.px, onC(H.line), 800), ...cardTitleBox(), background: H.line, zIndex: 2 }}>{o.title}</div> : null}
    {o.tag ? <div style={{ position: "absolute", right: 16, top: 14, ...zh(sm(28), H.text2, 600), zIndex: 2 }}>{o.tag}</div> : null}
    {children}
  </div>
);
const ph = (f: number, sp: number, j: number, n: number) => (((f * sp + j / n) % 1) + 1) % 1;
const lit = (f: number, at: number, lo = 0.4) => lo + (1 - lo) * tween(f, at, 10, EASE.enter);
const on = (f: number, at: number, d = 10) => tween(f, at, d, EASE.enter);
const cl = (x: number) => Math.min(1, Math.max(0, x));
const QZ = "#D6E6F8", QZ_D = "#9DB6D6", CR = "#3A3F48", RES = "#E8A33C", LINE = "#2F5FB0", ELE = "#2F7FE0", RED = "#E0472F", OK = "#14A38B",
  POD = "#F2F2EE", POD_D = "#B5BCC6", INNER = "#B9C4D4", INNER_D = "#7F8CA3", SEAL = "#14C38E", DUST = "#8A8F98", EUV = "#8B5CF6", DIE = "#7FA4E0", BLUE = "#2F7FE0";
const Sep: React.FC<{ x: number; y0?: number; y1?: number }> = ({ x, y0 = CT + 4, y1 = 316 }) => <line x1={x} y1={y0} x2={x} y2={y1} stroke={H.lineSoft} strokeWidth={3} />;
const Arrow: React.FC<{ x1: number; y1: number; x2: number; y2: number; c: string; w?: number; o?: number }> = ({ x1, y1, x2, y2, c, w = 5, o = 1 }) => {
  const a = Math.atan2(y2 - y1, x2 - x1), s = w * 2.6;
  return <g opacity={o}><path d={`M${x1} ${y1} L${x2 - Math.cos(a) * s * 0.8} ${y2 - Math.sin(a) * s * 0.8}`} stroke={c} strokeWidth={w} />
    <path d={`M${x2} ${y2} L${x2 - Math.cos(a) * s - Math.sin(a) * s * 0.6} ${y2 - Math.sin(a) * s + Math.cos(a) * s * 0.6} L${x2 - Math.cos(a) * s + Math.sin(a) * s * 0.6} ${y2 - Math.sin(a) * s - Math.cos(a) * s * 0.6} Z`} fill={c} /></g>;
};
const Check: React.FC<{ x: number; y: number; o?: number }> = ({ x, y, o = 1 }) => <path opacity={o} d={`M${x - 20} ${y} l14 14 l28 -30`} stroke={OK} strokeWidth={8} fill="none" />;
const Cross: React.FC<{ x: number; y: number; o?: number }> = ({ x, y, o = 1 }) => <g opacity={o}><path d={`M${x - 16} ${y - 16} L${x + 16} ${y + 16} M${x + 16} ${y - 16} L${x - 16} ${y + 16}`} stroke={RED} strokeWidth={7} /></g>;
/** 電子：小圓點＋線畫的「－」（lessons 54） */
const Ele: React.FC<{ x: number; y: number; o?: number; r?: number }> = ({ x, y, o = 1, r = 9 }) => (
  <g opacity={o}><circle cx={x} cy={y} r={r} fill={ELE} /><line x1={x - r * 0.55} y1={y} x2={x + r * 0.55} y2={y} stroke="#FFFFFF" strokeWidth={2.5} /></g>);
/** 光罩俯視：石英方板＋圖案區細線 */
const MaskTop: React.FC<{ x: number; y: number; s: number; a?: number }> = ({ x, y, s, a = 1 }) => {
  const ln: React.ReactNode[] = []; const m = s * 0.16, n = 7;
  for (let i = 0; i < n; i++) ln.push(<rect key={i} x={x + m} y={y + m + i * ((s - 2 * m) / n)} width={(s - 2 * m) * (i % 2 ? 0.7 : 1)} height={(s - 2 * m) / n * 0.45} fill={LINE} opacity={0.4 + 0.6 * a} />);
  return <g><rect x={x} y={y} width={s} height={s} fill={QZ} stroke={QZ_D} strokeWidth={3} />{ln}</g>;
};

// ── mk2-hook：光罩（晶片的底片）→ 誰做？ → 怎麼送進曝光機 ──
const Hook: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330;
  const pv = on(f, T(o, "prev")), wh = on(f, T(o, "who")), hw = on(f, T(o, "how")), sc = on(f, T(o, "scan"));
  const box = 0.35 + 0.65 * hw, px = 300 + 210 * cl((f - T(o, "how")) / 40);
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        <g opacity={lit(f, T(o, "prev"), 0.35)}>
          <MaskTop x={50} y={CT + 22} s={150} a={pv} />
          <text x={40} y={296} style={zh(32, H.text, 900)}>晶片的底片</text>
        </g>
        <g opacity={0.35 + 0.65 * wh}>
          <text x={300} y={CT + 60} style={zh(36, H.amber, 900)}>誰做？</text>
        </g>
        <g opacity={box}>
          <rect x={px} y={176} width={60} height={46} rx={6} fill={POD} stroke={POD_D} strokeWidth={3} />
          <Arrow x1={300} y1={256} x2={600} y2={256} c={H.amber} w={6} />
          <text x={300} y={306} style={zh(30, H.text2, 800)}>裝盒運送</text>
        </g>
        <Sep x={640} />
        <g opacity={lit(f, T(o, "scan"), 0.35)}>
          <rect x={690} y={CT + 20} width={210} height={150} fill={H.cardCompare} stroke={H.line} strokeWidth={4} />
          <rect x={760} y={CT + 40} width={70} height={18} fill={QZ_D} />
          <line x1={795} y1={CT + 64} x2={795} y2={CT + 140} stroke={EUV} strokeWidth={6 + 4 * sc} />
          <rect x={735} y={CT + 144} width={120} height={12} fill={DIE} />
          <text x={690} y={296} style={zh(32, H.text, 900)}>曝光機</text>
        </g>
      </svg>
    </Card>
  );
};

// ── mk2-cap：台積電、英特爾、三星自己做最先進的光罩｜同一個廠區，改版最快 ──
const Cap: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330;
  const rows: [string, string][] = [["台積電", "tsmc"], ["英特爾", "intel"], ["三星", "ss"]];
  const fa = on(f, T(o, "fast")), u = ph(f, 0.02, 0, 1);
  const loop: [number, number][] = [[650, 124], [825, 124], [825, 190], [740, 224], [565, 224], [565, 158]];
  const lens = loop.map((p, i) => { const q = loop[(i + 1) % loop.length]; return i === 2 || i === 5 ? 0 : Math.hypot(q[0] - p[0], q[1] - p[1]); }), tot = lens.reduce((a, b) => a + b, 0);
  let dd = u * tot, si = 0; while (si < lens.length - 1 && dd > lens[si]) { dd -= lens[si]; si++; }
  const pa = loop[si], pb = loop[(si + 1) % loop.length], r0 = lens[si] > 0 ? dd / lens[si] : 0, dx = pa[0] + (pb[0] - pa[0]) * r0, dy = pa[1] + (pb[1] - pa[1]) * r0;
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        <text x={40} y={CT + 40} style={zh(32, H.text, 900)} opacity={lit(f, T(o, "adv"), 0.35)}>最先進的光罩</text>
        {rows.map(([n, id], j) => { const a = on(f, T(o, id)), y = CT + 104 + j * 60;
          return <g key={id} opacity={0.3 + 0.7 * a}><rect x={40} y={y - 36} width={240} height={50} fill={BLUE} opacity={0.15 + 0.25 * a} />
            <text x={60} y={y} style={zh(34, H.text, 900)}>{n}</text></g>; })}
        <text x={300} y={CT + 164} style={zh(32, H.text2, 800)} opacity={lit(f, T(o, "tsmc"), 0.35)}>自己做</text>
        <Sep x={440} />
        <g opacity={lit(f, T(o, "fast"), 0.35)}>
          <rect x={480} y={96} width={170} height={56} fill={BLUE} opacity={0.18} />
          <text x={500} y={134} style={zh(30, H.text, 900)}>光罩廠</text>
          <rect x={740} y={196} width={170} height={56} fill={H.amber} opacity={0.22} />
          <text x={760} y={234} style={zh(30, H.text, 900)}>晶圓廠</text>
          <path d="M650 124 L825 124 L825 182" fill="none" stroke={H.lineSoft} strokeWidth={4} />
          <path d="M818 182 L832 182 L825 194 Z" fill={H.lineSoft} />
          <path d="M740 224 L565 224 L565 164" fill="none" stroke={H.lineSoft} strokeWidth={4} />
          <path d="M558 164 L572 164 L565 152 Z" fill={H.lineSoft} />
          <circle cx={dx} cy={dy} r={9} fill={H.amber} opacity={0.4 + 0.6 * fa} />
          <text x={480} y={306} style={zh(32, H.amber, 900)} opacity={0.35 + 0.65 * fa}>設計改版，馬上重做光罩</text>
        </g>
      </svg>
    </Card>
  );
};

// ── mk2-mer：專業光罩廠（最大三家）：大日本印刷、Tekscend（原凸版光罩）＝日本；Photronics＝美國 ──
const Mer: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330;
  const L: [string, string, string, string][] = [["大日本印刷 DNP", "日本", "jp", H.amber], ["Tekscend（原凸版光罩）", "日本", "jp", H.amber], ["Photronics", "美國", "us", BLUE]];
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        <text x={40} y={CT + 40} style={zh(32, H.text, 900)} opacity={lit(f, T(o, "mer"), 0.35)}>接其他公司的單</text>
        {L.map(([n, c, id, col], j) => { const a = on(f, T(o, id) + (j === 1 ? 8 : 0)), y = CT + 104 + j * 62;
          return <g key={j} opacity={0.3 + 0.7 * a}>
            <rect x={40} y={y - 38} width={12} height={46} fill={col} />
            <text x={70} y={y} style={zh(34, H.text, 900)}>{n}</text>
            <text x={900} y={y} textAnchor="end" style={zh(32, H.text2, 800)}>{c}</text></g>; })}
      </svg>
    </Card>
  );
};

// ── mk2-tw：台灣光罩（2338）：主力成熟製程（公司說法：65／55／80 奈米） ──
const Tw: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330;
  const t1 = on(f, T(o, "tmc")), t2 = on(f, T(o, "mat"));
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        <g opacity={0.35 + 0.65 * t1}>
          <text x={40} y={CT + 60} style={zh(48, H.text, 900)}>台灣光罩</text>
          <text x={40} y={CT + 116} style={zh(32, H.text2, 800)}>1988 年成立</text>
        </g>
        <Sep x={340} />
        <g opacity={lit(f, T(o, "mat"), 0.35)}>
          <text x={370} y={CT + 40} style={zh(30, H.text2, 800)}>製程世代</text>
          <rect x={370} y={128} width={250} height={56} fill={H.cardCompare} stroke={H.lineSoft} strokeWidth={3} />
          <text x={390} y={167} style={zh(30, H.text2, 800)}>最先進</text>
          <rect x={640} y={128} width={270} height={56} fill={OK} opacity={0.2 + 0.6 * t2} />
          <text x={660} y={167} style={zh(32, H.text, 900)}>成熟製程</text>
          <text x={370} y={240} style={zh(30, H.text2, 800)}>晶圓廠多半自己做</text>
          <text x={640} y={240} style={zh(30, H.text, 900)}>主力在這裡</text>
          <text x={640} y={292} style={zh(30, H.text2, 800)}>65／55／80 奈米</text>
        </g>
      </svg>
    </Card>
  );
};

// ── mk2-eb：電子束寫入剖面：石英＋鉻＋光阻，電子（－）從上往下打，寫過的地方一格格變色 ──
const Eb: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330;
  const q = on(f, T(o, "qz")), c = on(f, T(o, "cr")), r = on(f, T(o, "res")), e = on(f, T(o, "eb")), wr = T(o, "wr");
  const X0 = 40, X1 = 560, Y_RES = 214, Y_CR = 228, Y_QZ = 240;
  const nCell = 13, cw = (X1 - X0) / nCell, done = Math.max(0, Math.min(nCell, Math.floor((f - wr) / 5) + 1));
  const bx = X0 + cw * (Math.min(done, nCell - 1) + 0.5);
  const cells: React.ReactNode[] = [];
  for (let i = 0; i < nCell; i++) if (i < done && f >= wr && i % 3 !== 2) cells.push(<rect key={i} x={X0 + i * cw + 2} y={Y_RES} width={cw - 4} height={12} fill={LINE} />);
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        <rect x={X0} y={Y_QZ} width={X1 - X0} height={60} fill={QZ} opacity={0.35 + 0.65 * q} />
        <rect x={X0} y={Y_CR} width={X1 - X0} height={12} fill={CR} opacity={0.3 + 0.7 * c} />
        <rect x={X0} y={Y_RES} width={X1 - X0} height={14} fill={RES} opacity={0.3 + 0.7 * r} />
        {cells}
        <g opacity={e}>
          <path d={`M${bx - 30} ${CT + 6} L${bx + 30} ${CT + 6} L${bx + 4} ${Y_RES - 6} L${bx - 4} ${Y_RES - 6} Z`} fill={ELE} opacity={0.12} />
          {[0, 1, 2, 3].map((j) => { const u = ph(f, 0.05, j, 4); return <Ele key={j} x={bx + (1 - u) * (j % 2 ? 14 : -14)} y={CT + 16 + u * (Y_RES - CT - 34)} o={Math.min(1, u * 6, (1 - u) * 6)} />; })}
        </g>
        <Sep x={600} />
        <g>
          <text x={630} y={CT + 40} style={zh(32, H.text, 900)} opacity={0.35 + 0.65 * e}>電子束（帶負電）</text>
          <g opacity={0.35 + 0.65 * r}><rect x={630} y={130} width={16} height={30} fill={RES} /><text x={662} y={156} style={zh(30, H.text, 900)}>光阻</text></g>
          <g opacity={0.35 + 0.65 * c}><rect x={630} y={182} width={16} height={30} fill={CR} /><text x={662} y={208} style={zh(30, H.text, 900)}>鉻（擋光）</text></g>
          <g opacity={0.35 + 0.65 * q}><rect x={630} y={234} width={16} height={30} fill={QZ} stroke={QZ_D} strokeWidth={2} /><text x={662} y={260} style={zh(30, H.text, 900)}>石英板</text></g>
          <text x={630} y={306} style={zh(30, LINE, 900)} opacity={0.3 + 0.7 * on(f, wr)}>一筆筆寫上去</text>
        </g>
      </svg>
    </Card>
  );
};

// ── mk2-mb：單束（一格一格寫）vs 多束（整片一起寫）；IMS（英特爾旗下）512×512 道 ──
const Mb: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330;
  const sl = T(o, "slow"), al = T(o, "all"), a2 = on(f, T(o, "n26"));
  const g1 = Math.max(0, Math.min(48, Math.floor((f - sl) / 3))), g2 = cl((f - al) / 40);
  const grid = (x0: number, y0: number, n: number, m: number, s: number, fill: (i: number) => boolean) => {
    const out: React.ReactNode[] = [];
    for (let j = 0; j < m; j++) for (let i = 0; i < n; i++) out.push(<rect key={`${i}_${j}`} x={x0 + i * s} y={y0 + j * s} width={s - 4} height={s - 4} fill={fill(j * n + i) ? LINE : H.lineSoft} opacity={fill(j * n + i) ? 1 : 0.5} />);
    return out;
  };
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        <g opacity={lit(f, T(o, "fine"), 0.35)}>
          <text x={40} y={CT + 40} style={zh(32, H.text, 900)}>一道電子束</text>
          {grid(40, 140, 12, 4, 30, (i) => i < g1)}
          <text x={40} y={300} style={zh(32, RED, 900)} opacity={0.3 + 0.7 * on(f, sl)}>一格一格，太慢</text>
        </g>
        <Sep x={440} />
        <g opacity={lit(f, T(o, "adv"), 0.35)}>
          <text x={470} y={CT + 40} style={zh(32, H.text, 900)}>多束一起寫</text>
          {grid(470, 140, 12, 4, 30, () => g2 > 0.05)}
          {g2 > 0 && g2 < 1 ? Array.from({ length: 12 }, (_, i) => <Ele key={i} x={483 + i * 30} y={128 + 2 * Math.sin(f * 0.4 + i)} r={6} />) : null}
          <text x={470} y={300} style={zh(32, BLUE, 900)} opacity={0.3 + 0.7 * a2}>二十六萬道（512×512）</text>
        </g>
      </svg>
    </Card>
  );
};

// ── mk2-ins：光罩上一個瑕疵 → 每次曝光、每顆晶粒同一處都印上 ──
const Ins: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330;
  const d = on(f, T(o, "def")), rp = on(f, T(o, "rep")), pulse = 0.6 + 0.4 * Math.sin(f * 0.3);
  const scan = 86 + 160 * ph(f, 0.02, 0, 1);
  const dies: React.ReactNode[] = [];
  for (let j = 0; j < 4; j++) for (let i = 0; i < 5; i++) {
    const x = 560 + i * 66, y = CT + 16 + j * 56;
    dies.push(<g key={`${i}_${j}`}><rect x={x} y={y} width={58} height={48} fill={DIE} opacity={0.75} />
      <circle cx={x + 40} cy={y + 16} r={6} fill={RED} opacity={rp * pulse} /></g>);
  }
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        <g opacity={lit(f, T(o, "ins"), 0.35)}>
          <MaskTop x={60} y={CT + 14} s={176} />
          <rect x={60} y={scan - 4 + CT - 66} width={176} height={8} fill="#38C6D9" opacity={0.6 * (1 - d)} />
          <circle cx={190} cy={CT + 120} r={10 + 4 * d} fill={RED} opacity={d * pulse} />
          <text x={40} y={300} style={zh(32, H.text, 900)}>光罩上一個瑕疵</text>
        </g>
        <Arrow x1={300} y1={170} x2={510} y2={170} c={RED} w={6} o={0.3 + 0.7 * rp} />
        <text x={300} y={130} style={zh(30, H.text2, 800)} opacity={0.3 + 0.7 * rp}>每次曝光</text>
        <g opacity={lit(f, T(o, "rep"), 0.35)}>{dies}</g>
      </svg>
    </Card>
  );
};

// ── mk2-pod：光罩盒兩層（側視爆炸）：外盒上蓋／內盒上蓋（金屬）／光罩／內盒底板（金屬）／外盒底座；灰塵撞到外盒彈開 ──
const Pod: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330;
  const pd = on(f, T(o, "pod")), tw = on(f, T(o, "two")), ou = on(f, T(o, "out")), inn = on(f, T(o, "inn"));
  const cx = 290;
  const retY = 196 - 40 * (1 - pd);
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        <g opacity={0.35 + 0.65 * ou}>
          <path d={`M${cx - 230} ${CT + 70} L${cx - 230} ${CT + 26} Q${cx - 230} ${CT + 10} ${cx - 214} ${CT + 10} L${cx + 214} ${CT + 10} Q${cx + 230} ${CT + 10} ${cx + 230} ${CT + 26} L${cx + 230} ${CT + 70} Z`} fill={POD} stroke={POD_D} strokeWidth={4} />
          <rect x={cx - 230} y={288} width={460} height={26} fill={POD} stroke={POD_D} strokeWidth={4} />
        </g>
        <g opacity={0.35 + 0.65 * inn}>
          <rect x={cx - 170} y={CT + 84} width={340} height={36} fill={INNER} stroke={INNER_D} strokeWidth={4} />
          <rect x={cx - 170} y={248} width={340} height={28} fill={INNER} stroke={INNER_D} strokeWidth={4} />
          <line x1={cx - 170} y1={250} x2={cx + 170} y2={250} stroke={SEAL} strokeWidth={4} opacity={inn} />
        </g>
        <g opacity={0.35 + 0.65 * pd}>
          <rect x={cx - 130} y={retY} width={260} height={18} fill={QZ} stroke={QZ_D} strokeWidth={3} />
          <rect x={cx - 100} y={retY + 18} width={200} height={6} fill={CR} />
        </g>
        {[0, 1, 2].map((j) => { const u = ph(f, 0.03, j, 3), hit = 0.55; const x = u < hit ? 10 + u / hit * (cx - 250 - 10 + 30) : cx - 210 - (u - hit) / (1 - hit) * 150, y = u < hit ? CT + 20 + 30 * j - 20 * (u / hit) : CT + 0 + 30 * j - 10 + (u - hit) * 120;
          return <rect key={j} x={x} y={y} width={9} height={9} fill={DUST} opacity={ou * Math.min(1, u * 6, (1 - u) * 6)} transform={`rotate(${f * 4 + j * 40} ${x + 4} ${y + 4})`} />; })}
        <Sep x={560} />
        <g>
          <text x={590} y={CT + 40} style={zh(32, H.text, 900)} opacity={0.35 + 0.65 * tw}>有兩層</text>
          <g opacity={0.35 + 0.65 * ou}><rect x={590} y={130} width={16} height={30} fill={POD} stroke={POD_D} strokeWidth={2} /><text x={622} y={156} style={zh(30, H.text, 900)}>外盒：擋灰塵</text></g>
          <g opacity={0.35 + 0.65 * inn}><rect x={590} y={186} width={16} height={30} fill={INNER} stroke={INNER_D} strokeWidth={2} /><text x={622} y={212} style={zh(30, H.text, 900)}>內盒：金屬</text></g>
          <g opacity={0.35 + 0.65 * pd}><rect x={590} y={242} width={16} height={30} fill={QZ} stroke={QZ_D} strokeWidth={2} /><text x={622} y={268} style={zh(30, H.text, 900)}>光罩在最裡面</text></g>
        </g>
      </svg>
    </Card>
  );
};

// ── mk2-vac：極紫外光罩很難加保護膜（光要穿兩次）→ 內盒到真空機台裡才打開 ──
const Vac: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330;
  const fl = on(f, T(o, "film")), vc = on(f, T(o, "vac")), op = on(f, T(o, "open"), 20);
  const mol = (j: number) => { const u = ph(f, 0.03, j, 5); const x = 560 + ((j * 71) % 240) + u * 80, y = 140 + ((j * 37) % 110) - u * 30;
    return <g key={j} opacity={(1 - vc) * 0.9 + vc * 0.12}><circle cx={x} cy={y} r={7} fill="#9CC3FF" /><circle cx={x + 10} cy={y} r={6} fill="#5C95F0" /></g>; };
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        <g opacity={lit(f, T(o, "why"), 0.35)}>
          <rect x={60} y={204} width={300} height={22} fill={QZ} stroke={QZ_D} strokeWidth={3} />
          <path d={`M90 ${CT + 22} L200 198 L310 ${CT + 22}`} fill="none" stroke={EUV} strokeWidth={6} />
          <line x1={70} y1={150} x2={350} y2={150} stroke={H.amber} strokeWidth={5} strokeDasharray="12 8" opacity={0.35 + 0.65 * fl} />
          <text x={40} y={268} style={zh(30, H.text, 900)}>保護膜：光要穿兩次</text>
          <Cross x={392} y={150} o={fl} />
          <text x={40} y={310} style={zh(30, RED, 900)} opacity={0.3 + 0.7 * fl}>很難加</text>
        </g>
        <Sep x={470} />
        <g opacity={lit(f, T(o, "vac"), 0.35)}>
          <rect x={520} y={CT + 10} width={390} height={186} fill="none" stroke={H.line} strokeWidth={4} />
          {[0, 1, 2, 3, 4].map(mol)}
          <rect x={620} y={226 - 30} width={180} height={22} fill={INNER} stroke={INNER_D} strokeWidth={3} />
          <rect x={620} y={196 - 34 - 70 * op} width={180} height={30} fill={INNER} stroke={INNER_D} strokeWidth={3} />
          <text x={520} y={310} style={zh(30, H.text, 900)}>真空裡才打開</text>
          <Check x={800} y={296} o={op} />
        </g>
      </svg>
    </Card>
  );
};

// ── mk2-co：最早通過艾司摩爾（ASML）認證的極紫外光光罩盒：英特格（美國，2018/8 第一家）、家登（台灣，2018/12 宣布） ──
const Co: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330;
  const items: [string, string, string, string, string][] = [["英特格 Entegris", "美國", "2018/8 第一家通過", "ent", BLUE], ["家登（3680）", "台灣", "2018/12 宣布通過", "gd", H.amber]];
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        <text x={40} y={CT + 40} style={zh(30, H.text2, 800)} opacity={lit(f, T(o, "cert"), 0.35)}>曝光機大廠艾司摩爾（ASML）認證</text>
        {items.map(([n, c, d, id, col], j) => { const a = on(f, T(o, id)), x = 40 + j * 450;
          return <g key={id} opacity={0.3 + 0.7 * a}>
            <rect x={x} y={130} width={420} height={170} fill={col} opacity={0.12 + 0.18 * a} />
            <rect x={x} y={130} width={12} height={170} fill={col} />
            <text x={x + 36} y={182} style={zh(36, H.text, 900)}>{n}</text>
            <text x={x + 36} y={230} style={zh(30, H.text2, 800)}>{c}</text>
            <text x={x + 36} y={278} style={zh(30, H.text, 800)}>{d}</text></g>; })}
      </svg>
    </Card>
  );
};

// ── mk2-next：光罩到了 → 還要一層膠（光阻）接住圖案 → 下一集；留言「光罩盒」 ──
const Next: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330;
  const ar = on(f, T(o, "arr")), gl = on(f, T(o, "glue")), li = on(f, T(o, "light")), nx = on(f, T(o, "next")), kw = on(f, T(o, "kw"));
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        <g opacity={0.35 + 0.65 * ar}>
          <rect x={60} y={CT + 10} width={240} height={20} fill={QZ} stroke={QZ_D} strokeWidth={3} />
          <line x1={180} y1={CT + 36} x2={180} y2={176} stroke={EUV} strokeWidth={6} opacity={0.3 + 0.7 * li} />
        </g>
        <g opacity={0.35 + 0.65 * gl}>
          <rect x={60} y={190} width={240} height={14} fill={RES} />
          {li > 0 ? <rect x={150} y={190} width={60} height={14} fill={LINE} opacity={li} /> : null}
          <rect x={60} y={204} width={240} height={22} fill={DIE} />
          <text x={40} y={290} style={zh(32, H.text, 900)}>一層膠接住圖案</text>
        </g>
        <Sep x={440} />
        <text x={470} y={CT + 50} style={zh(34, H.text, 900)} opacity={0.3 + 0.7 * nx}>下一集：光阻-1</text>
        <text x={470} y={CT + 100} style={zh(30, H.text2, 800)} opacity={0.3 + 0.7 * li}>照到光就會變的膠</text>
        <g opacity={kw} transform={`translate(680 272) rotate(-2) scale(${1 + 0.3 * (1 - kw)})`}>
          <rect x={-210} y={-32} width={420} height={64} fill={H.amber} /><text x={0} y={14} textAnchor="middle" style={zh(34, onC(H.amber), 900)}>留言「光罩盒」拿完整資料</text>
        </g>
      </svg>
    </Card>
  );
};

export const Mask2Section: React.FC<P> = (p) => {
  const kd = String((p.o as any).kind);
  if (kd === "mk2-hook") return <Hook {...p} />;
  if (kd === "mk2-cap") return <Cap {...p} />;
  if (kd === "mk2-mer") return <Mer {...p} />;
  if (kd === "mk2-tw") return <Tw {...p} />;
  if (kd === "mk2-eb") return <Eb {...p} />;
  if (kd === "mk2-mb") return <Mb {...p} />;
  if (kd === "mk2-ins") return <Ins {...p} />;
  if (kd === "mk2-pod") return <Pod {...p} />;
  if (kd === "mk2-vac") return <Vac {...p} />;
  if (kd === "mk2-co") return <Co {...p} />;
  if (kd === "mk2-next") return <Next {...p} />;
  return null;
};

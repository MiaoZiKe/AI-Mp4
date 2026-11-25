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
import { Flag, Logo, logoW } from "./Brand";
import "./BrandWafer";

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
  POD = "#FBFBF8", POD_D = "#8F97A3", INNER = "#7D8AA0", INNER_D = "#465269", SEAL = "#14C38E", DUST = "#8A8F98", EUV = "#8B5CF6", DIE = "#7FA4E0", BLUE = "#2F7FE0";
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

/** 公司列（HTML，LOGO 用 Remotion 的 Img 會等圖載入）：白底 LOGO 板＋國旗＋名稱。
 *  審片規則（11/24）：LOGO 與國旗全程 100% 不透明，不准用透明度表示「還沒輪到」；未輪到＝細灰框、輪到＝粗色框＋略放大（a＝輪到的程度 0–1）。只有字跟著 a 變淡。 */
const Plate: React.FC<{ logo?: string; text?: string; h?: number; w: number; a?: number; c?: string }> = ({ logo, text, h = 40, w, a = 1, c = BLUE }) => (
  <div style={{ width: w, height: h + 16, background: "#FFFFFF", border: a > 0.5 ? `4px solid ${c}` : "2px solid #C3CAD5", boxSizing: "border-box", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", transform: `scale(${(1 + 0.06 * a).toFixed(3)})` }}>
    {logo ? <Logo id={logo} h={Math.min(h, Math.round(((w - 20) * h) / Math.max(1, logoW(logo, h))))} /> : <span style={{ ...zh(30, "#14213D", 900) }}>{text}</span>}
  </div>);
const Row: React.FC<{ x: number; y: number; a: number; children: React.ReactNode }> = ({ x, y, children }) => (
  <div style={{ position: "absolute", left: x, top: y, display: "flex", alignItems: "center", gap: 16 }}>{children}</div>);
const Tx: React.FC<{ a: number; px?: number; c?: string; w?: number; children: React.ReactNode }> = ({ a, px = 32, c = H.text, w = 900, children }) => <span style={{ ...zh(px, c === H.text2 ? H.text : c, w), opacity: 0.75 + 0.25 * a }}>{children}</span>;

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
        <g opacity={0.6 + 0.4 * wh}>
          <text x={300} y={CT + 60} style={zh(40, H.text, 900)}>誰做？</text>
        </g>
        <g opacity={box}>
          <rect x={px} y={176} width={60} height={46} rx={6} fill={POD} stroke={POD_D} strokeWidth={3} />
          <Arrow x1={300} y1={256} x2={600} y2={256} c={H.amber} w={6} />
          <text x={300} y={306} style={zh(32, H.text, 900)}>裝盒運送</text>
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

// ── mk2-cap：台積電、英特爾、三星自己做最先進的光罩（LOGO＋國旗逐列進場）｜右邊：同一個廠區，改版馬上重做 ──
const Cap: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330;
  const rows: [string, string, string, string][] = [["tsmc", "台積電", "TW", "tsmc"], ["intel", "英特爾", "US", "intel"], ["samsung", "三星", "KR", "ss"]];
  const fa = on(f, T(o, "fast")), u = ph(f, 0.025, 0, 1);
  const px = u < 0.5 ? 722 + 110 * (u * 2) : 768 - 110 * (u * 2 - 1), py = u < 0.5 ? 148 : 234;
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      {rows.map(([lg, n, fl, id], j) => (
        <Row key={id} x={28} y={CT + 6 + j * 86} a={on(f, T(o, id), 8)}>
          <Plate logo={lg} w={150} h={40} a={on(f, T(o, id), 8)} /><Flag code={fl} h={36} /><Tx a={on(f, T(o, id), 8)} px={34}>{n}</Tx>
        </Row>))}
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        <Sep x={540} />
        <g opacity={lit(f, T(o, "fast"), 0.75)}>
          <rect x={580} y={122} width={130} height={52} fill={BLUE} opacity={0.18} /><text x={596} y={158} style={zh(30, H.text, 900)}>光罩廠</text>
          <rect x={780} y={208} width={130} height={52} fill={H.amber} opacity={0.25} /><text x={796} y={244} style={zh(30, H.text, 900)}>晶圓廠</text>
          <path d={`M710 148 L845 148 L845 198`} fill="none" stroke={H.lineSoft} strokeWidth={4} /><path d="M838 198 L852 198 L845 208 Z" fill={H.lineSoft} />
          <path d={`M780 234 L645 234 L645 184`} fill="none" stroke={H.lineSoft} strokeWidth={4} /><path d="M638 184 L652 184 L645 174 Z" fill={H.lineSoft} />
          <rect x={px - 12} y={py - 10} width={24} height={20} rx={3} fill={POD} stroke={POD_D} strokeWidth={2} opacity={0.4 + 0.6 * fa} />
          <text x={572} y={310} style={zh(30, H.text, 900)} opacity={0.35 + 0.65 * fa}>同一個廠區，改版最快</text>
        </g>
      </svg>
    </Card>
  );
};

// ── mk2-mer：專業光罩廠，數字條＝各國家數（每一格是一家的 LOGO）：日本 2（DNP、Tekscend）、美國 1（Photronics） ──
const Mer: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330;
  const jp = on(f, T(o, "jp"), 8), jp2 = on(f, T(o, "jp") + 8, 8), us = on(f, T(o, "us"), 8), me = on(f, T(o, "mer"), 8);
  const seg = (x: number, y: number, a: number, logo: string, col: string, lh = 44) => (
    <div style={{ position: "absolute", left: x, top: y, width: 236, height: lh + 28 }}>
      <div style={{ position: "absolute", left: 0, top: 0, width: 236 * a, height: lh + 28, background: col }} />
      <div style={{ position: "absolute", left: 6, top: 6 }}><Plate logo={logo} w={224} h={lh} a={a} c={col} /></div></div>);
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <div style={{ position: "absolute", left: 28, top: CT + 2, ...zh(30, H.text, 800), opacity: 0.6 + 0.4 * me }}>主要的專業光罩廠：家數</div>
      <Row x={28} y={CT + 52} a={jp}><Flag code="JP" h={40} /><Tx a={jp} px={34}>日本</Tx></Row>
      {seg(214, CT + 42, jp, "dnp", "#E58A1F")}{seg(458, CT + 42, jp2, "tekscend", "#E58A1F")}
      <div style={{ position: "absolute", left: 714, top: CT + 52, ...zh(40, H.text, 900), opacity: jp2 }}>2 家</div>
      <Row x={28} y={CT + 160} a={us}><Flag code="US" h={40} /><Tx a={us} px={34}>美國</Tx></Row>
      {seg(214, CT + 128, us, "photronics", BLUE, 100)}
      <div style={{ position: "absolute", left: 470, top: CT + 160, ...zh(40, H.text, 900), opacity: us }}>1 家</div>
      <div style={{ position: "absolute", left: 600, top: CT + 132, ...zh(30, H.text, 800) }}>Tekscend＝</div>
      <div style={{ position: "absolute", left: 600, top: CT + 176, ...zh(30, H.text, 800) }}>原凸版光罩</div>
    </Card>
  );
};

// ── mk2-tw：台灣光罩（2338）＋國旗；製程世代條：最先進（晶圓廠多半自己做）vs 成熟製程（主力；公司說法 65／55／80 奈米） ──
const Tw: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330;
  const t1 = on(f, T(o, "tmc"), 8), t2 = on(f, T(o, "mat"), 12);
  const nodes: [string, number][] = [["80", 0.55], ["65", 0.75], ["55", 0.95]];
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <Row x={28} y={CT + 8} a={t1}><Flag code="TW" h={40} /><Logo id="tmc" h={34} pad={2} style={{ opacity: t1 }} /><Tx a={t1} w={800}>代號 2338・1988 年成立</Tx></Row>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        <g opacity={0.7 + 0.3 * t2}>
          <text x={28} y={176} style={zh(30, H.text, 800)}>製程世代</text>
          <rect x={200} y={146} width={250} height={46} fill={H.cardCompare} stroke={H.lineSoft} strokeWidth={3} />
          <text x={216} y={180} style={zh(30, H.text, 800)}>最先進</text>
          <rect x={470} y={146} width={450 * t2} height={46} fill={OK} opacity={0.85} />
          <text x={486} y={180} style={zh(30, "#FFFFFF", 900)} opacity={t2}>成熟製程：主力</text>
          <text x={200} y={238} style={zh(30, H.text, 800)}>晶圓廠多半自己做</text>
          {nodes.map(([n, v], j) => <g key={n} opacity={on(f, T(o, "mat") + 8 + j * 6)}>
            <rect x={470 + j * 150} y={300 - 50 * v} width={44} height={50 * v} fill={OK} opacity={0.55} />
            <text x={522 + j * 150} y={300} style={zh(30, H.text, 900)}>{n}</text></g>)}
          <text x={28} y={300} style={zh(30, H.text, 800)}>奈米（公司說法）</text>
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
          {grid(470, 126, 12, 4, 30, (i) => g2 > 0.05 && (i % 12) < Math.ceil(12 * Math.min(1, g2 * 3)))}
          {g2 > 0 && g2 < 1 ? Array.from({ length: 12 }, (_, i) => <Ele key={i} x={483 + i * 30} y={128 + 2 * Math.sin(f * 0.4 + i)} r={6} />) : null}
          <g opacity={0.3 + 0.7 * a2} transform={`translate(470 300) scale(${(0.85 + 0.15 * a2).toFixed(3)})`}><text x={0} y={0} style={zh(56, BLUE, 900)}>26萬道</text><text x={192} y={-6} style={zh(30, H.text2, 800)}>（512×512）</text></g>
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
        <g opacity={0.75 + 0.25 * ou}>
          <path d={`M${cx - 230} ${CT + 70} L${cx - 230} ${CT + 26} Q${cx - 230} ${CT + 10} ${cx - 214} ${CT + 10} L${cx + 214} ${CT + 10} Q${cx + 230} ${CT + 10} ${cx + 230} ${CT + 26} L${cx + 230} ${CT + 70} Z`} fill={POD} stroke={POD_D} strokeWidth={4} />
          <rect x={cx - 230} y={288} width={460} height={26} fill={POD} stroke={POD_D} strokeWidth={4} />
        </g>
        <g opacity={0.75 + 0.25 * inn}>
          <rect x={cx - 170} y={CT + 84} width={340} height={36} fill={INNER} stroke={INNER_D} strokeWidth={4} />
          <rect x={cx - 170} y={248} width={340} height={28} fill={INNER} stroke={INNER_D} strokeWidth={4} />
          <line x1={cx - 170} y1={250} x2={cx + 170} y2={250} stroke={SEAL} strokeWidth={4} opacity={inn} />
        </g>
        <g opacity={0.75 + 0.25 * pd}>
          <rect x={cx - 130} y={retY} width={260} height={18} fill={QZ} stroke={QZ_D} strokeWidth={3} />
          <rect x={cx - 100} y={retY + 2} width={200} height={8} fill="#1F3F8F" />
        </g>
        {[0, 1, 2].map((j) => { const u = ph(f, 0.03, j, 3), hit = 0.55; const x = u < hit ? 10 + u / hit * (cx - 250 - 10 + 30) : cx - 210 - (u - hit) / (1 - hit) * 150, y = u < hit ? CT + 32 + 30 * j - 20 * (u / hit) : CT + 12 + 30 * j - 10 + (u - hit) * 120; // 11-25：灰塵整體下移 12px，不壓標題
          return <rect key={j} x={x} y={y} width={9} height={9} fill={DUST} opacity={ou * Math.min(1, u * 6, (1 - u) * 6)} transform={`rotate(${f * 4 + j * 40} ${x + 4} ${y + 4})`} />; })}
        <Sep x={560} />
        <g>
          <text x={590} y={CT + 40} style={zh(32, H.text, 900)} opacity={0.75 + 0.25 * tw}>有兩層</text>
          <g opacity={0.8 + 0.2 * ou}><rect x={586} y={128} width={30} height={34} fill={POD} stroke="#6B7380" strokeWidth={4} /><text x={628} y={156} style={zh(30, H.text, 900)}>外盒：擋灰塵</text><Check x={870} y={144} o={ou} /></g>
          <g opacity={0.8 + 0.2 * inn}><rect x={586} y={184} width={30} height={34} fill={INNER} stroke={INNER_D} strokeWidth={4} /><text x={628} y={212} style={zh(30, H.text, 900)}>內盒：金屬</text><Check x={870} y={200} o={inn} /></g>
          <g opacity={0.8 + 0.2 * pd}><rect x={586} y={240} width={30} height={34} fill="#1F3F8F" stroke={QZ_D} strokeWidth={4} /><text x={628} y={268} style={zh(30, H.text, 900)}>光罩在最裡面</text></g>
        </g>
      </svg>
    </Card>
  );
};

// ── mk2-vac：極紫外光罩很難加保護膜（光要穿兩次）→ 內盒到真空機台裡才打開 ──
const Vac: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330;
  const fl = on(f, T(o, "film")), op = on(f, T(o, "open"), 20);
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
        {([["① 外盒留在機台外", "why", H.amber], ["② 內盒送進腔體", "film", BLUE], ["③ 抽真空", "vac", BLUE], ["④ 真空裡才打開", "open", RED]] as [string, string, string][]).map(([t, id, c], j) => {
          const a = on(f, T(o, id), 8), y = CT + 40 + j * 54;
          return <g key={id} opacity={0.3 + 0.7 * a}><rect x={505} y={y - 30} width={8} height={38} fill={c} /><text x={528} y={y} style={zh(30, H.text, 900)}>{t}</text><Check x={890} y={y - 12} o={a} /></g>; })}
        <text x={505} y={310} style={zh(30, H.text2, 800)} opacity={0.3 + 0.7 * op}>內盒＝可拿掉的硬保護膜</text>
      </svg>
    </Card>
  );
};

// ── mk2-co：最早通過艾司摩爾（ASML）認證的極紫外光光罩盒：英特格（美國，2018/8 第一家）、家登（台灣，2018/12 宣布）＋2018 年時間條 ──
const Co: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330;
  const ce = on(f, T(o, "cert"), 8), en = on(f, T(o, "ent"), 8), gd = on(f, T(o, "gd"), 8);
  const X0 = 40, X1 = 912, mx = (m: number) => X0 + ((X1 - X0) * (m - 0.5)) / 12;
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <Row x={36} y={CT + 2} a={ce}><Tx a={ce} px={30} c={H.text2} w={800}>曝光機大廠</Tx><Plate logo="asml" w={150} h={34} a={ce} /><Tx a={ce} px={30} c={H.text2} w={800}>認證（2018 年）</Tx></Row>
      <Row x={36} y={CT + 70} a={en}><Plate logo="entegris" w={210} h={40} a={en} /><Flag code="US" h={36} /><Tx a={en}>英特格・8 月第一家</Tx></Row>
      <Row x={36} y={CT + 142} a={gd}><Plate logo="gudeng" w={210} h={40} a={gd} c={H.amber} /><Flag code="TW" h={36} /><Tx a={gd}>家登・12 月宣布通過</Tx></Row>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        <line x1={X0} y1={300} x2={X0 + (X1 - X0) * Math.max(ce, 0.2)} y2={300} stroke={H.lineSoft} strokeWidth={6} />
        {[1, 4, 7, 10].map((m) => <line key={m} x1={mx(m)} y1={292} x2={mx(m)} y2={308} stroke={H.lineSoft} strokeWidth={3} />)}
        <rect x={mx(1)} y={292} width={(mx(8) - mx(1)) * en} height={16} fill={BLUE} opacity={0.85} />
        <rect x={mx(8)} y={292} width={(mx(12) - mx(8)) * gd} height={16} fill={H.amber} opacity={0.85} />
        <circle cx={mx(8)} cy={300} r={10 * en} fill={BLUE} /><circle cx={mx(12)} cy={300} r={10 * gd} fill={H.amber} />
      </svg>
    </Card>
  );
};

// ── mk2-next：光罩到了 → 還要一層膠（光阻）接住圖案 → 下一集；留言「光罩盒」 ──
const Next: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330;
  const ar = on(f, T(o, "arr")), gl = on(f, T(o, "glue")), li = on(f, T(o, "light")), kw = on(f, T(o, "kw"));
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        <g opacity={0.75 + 0.25 * ar}>
          <rect x={60} y={CT + 10} width={240} height={20} fill={QZ} stroke={QZ_D} strokeWidth={3} />
          <line x1={180} y1={CT + 36} x2={180} y2={176} stroke={EUV} strokeWidth={6} opacity={0.75 + 0.25 * li} />
        </g>
        <g opacity={0.75 + 0.25 * gl}>
          <rect x={60} y={190} width={240} height={14} fill={RES} />
          {li > 0 ? <rect x={150} y={190} width={60} height={14} fill={LINE} opacity={li} /> : null}
          <rect x={60} y={204} width={240} height={22} fill={DIE} />
          <text x={40} y={290} style={zh(32, H.text, 900)}>一層膠接住圖案</text>
        </g>
        <Sep x={440} />
        <g opacity={0.75 + 0.25 * gl}>
          <text x={470} y={CT + 36} style={zh(30, H.text, 800)}>照光前</text>
          <rect x={470} y={CT + 56} width={190} height={40} fill={RES} />
        </g>
        <g opacity={0.75 + 0.25 * li}>
          <text x={710} y={CT + 36} style={zh(30, H.text, 900)}>照光後：變了</text>
          <rect x={710} y={CT + 56} width={190} height={40} fill={RES} />
          {[0, 1, 2, 3, 4].map((j) => <rect key={j} x={716 + j * 38} y={CT + 56} width={20} height={40 * on(f, T(o, "light") + j * 4, 6)} fill={LINE} />)}
        </g>
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

// 2026/11/27 tech-flipchip：封裝-2 覆晶（系列 3 第 4 集）的 2D 示意卡（overlay `section` 的 kind 以 "fc-" 開頭，Hud.tsx 的 HudSection 轉過來）。
// 全部示意：只放 research.md 查證過的說法（熱脹冷縮約 3 vs 16 ppm/°C、日月光 2024 封測營收第一、Besi 廠商說法）；國旗、名牌不放進 opacity 群組（100% 不透明）。
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
const RED = "#E0472F", OK = "#14A38B", BLUE = "#2F7FE0", GRY = "#98A2B3", PCB = "#1F6B45", GOLD = "#D4A83C", CORK = "#C9A26A", CORKD = "#A9844F", NEEDLE = "#8E98AA", WOOD = "#E8C27A", GRAPH = "#3A3F4A";
const Sep: React.FC<{ x: number; y2?: number }> = ({ x, y2 = 316 }) => <line x1={x} y1={CT + 4} x2={x} y2={y2} stroke={H.lineSoft} strokeWidth={3} />;
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
const Check: React.FC<{ x: number; y: number; o?: number; c?: string }> = ({ x, y, o = 1, c = OK }) => <path opacity={o} d={`M${x - 16} ${y} l11 12 l24 -26`} stroke={c} strokeWidth={7} fill="none" />;


const SI = "#4A5A7E", SUBG = "#3E6B4A", CU = "#C8743C", SN = "#AEB5C0", UF = "#E8B44E", LID = "#B7C0CE", HOT = "#E5602B", WIRE = "#D9A92E", INK = "#1F3A5F";
// 小晶片＋凸塊剖面（倒扣）
const FcMini: React.FC<{ x: number; y: number; w: number; a: number; dy?: number }> = ({ x, y, w, a, dy = 0 }) => (
  <g opacity={0.35 + 0.65 * a}>
    <rect x={x} y={y + 40} width={w} height={14} fill={SUBG} />
    {Array.from({ length: 6 }, (_, i) => <circle key={i} cx={x + 14 + (i * (w - 28)) / 5} cy={y + 34 - dy} r={6} fill={SN} />)}
    <rect x={x + 4} y={y + 10 - dy} width={w - 8} height={18} fill={SI} />
  </g>
);

// ── fc-hook：接上集（封裝材料）；腳不夠用，晶片的電怎麼接出去？ ──
const Hook: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330, q = on(f, T(o, "q")), pv = on(f, T(o, "prev")), fc = on(f, T(o, "fc")), pu = 0.5 + 0.5 * Math.sin(f * 0.14);
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        <rect x={60} y={CT + 70} width={170} height={120} fill={SI} stroke={H.text2} strokeWidth={3} />
        {Array.from({ length: 10 }, (_, i) => <rect key={i} x={68 + i * 16} y={CT + 58} width={8} height={10} fill={WIRE} />)}
        {Array.from({ length: 10 }, (_, i) => <rect key={`b${i}`} x={68 + i * 16} y={CT + 192} width={8} height={10} fill={WIRE} />)}
        <text x={145} y={CT + 150} textAnchor="middle" style={zh(64, RED, 900)} opacity={q * (0.6 + 0.4 * pu)}>？</text>
        <Sep x={300} />
        <Row x={326} y={CT + 56} t="腳不夠用，電怎麼接出去？" c={BLUE} a={q} />
        <Row x={326} y={CT + 122} t="前一集：導線架、封裝膠、錫球" c={H.text2} a={pv} />
        <Row x={326} y={CT + 188} t="這一集：覆晶" c={H.amber} a={fc} />
      </svg>
    </Card>
  );
};

// ── fc-stamp：打線一條一條縫 vs 覆晶像蓋印章一次全部接好 ──
const Stamp: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330, fl = on(f, T(o, "flip"), 20), dn = on(f, T(o, "down")), st = on(f, T(o, "stamp")), pr = on(f, T(o, "press"), 16);
  const sy = CT + 40 + 70 * pr;
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        <g opacity={0.35 + 0.65 * st}><rect x={70} y={sy - 40} width={36} height={40} fill="#8E6A4A" /><rect x={40} y={sy} width={96} height={30} fill="#B5543A" />
          {Array.from({ length: 5 }, (_, i) => <circle key={i} cx={52 + i * 18} cy={sy + 36} r={5} fill={SN} />)}</g>
        <rect x={30} y={CT + 196} width={240} height={18} fill={SUBG} />
        {pr > 0.9 ? Array.from({ length: 5 }, (_, i) => <circle key={i} cx={52 + i * 18} cy={CT + 190} r={5} fill={OK} />) : null}
        <Sep x={300} />
        <Row x={326} y={CT + 48} t="把晶片翻過來" c={BLUE} a={fl} />
        <Row x={326} y={CT + 104} t="正面（有凸塊那面）朝下" c={H.text2} a={dn} />
        <Row x={326} y={CT + 160} t="像蓋印章：一次全部接好" c={H.amber} a={st} />
        <Row x={326} y={CT + 216} t="打線要一條一條拉" c={GRY} a={st} />
      </svg>
    </Card>
  );
};

// ── fc-vs：打線只在邊緣一圈；覆晶整面陣列；訊號路徑短 ──
const Vs: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330, wb = on(f, T(o, "wb")), ed = on(f, T(o, "edge")), fu = on(f, T(o, "full")), mn = on(f, T(o, "many")), sh = on(f, T(o, "short"));
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        <g opacity={0.35 + 0.65 * Math.max(wb, ed)}><rect x={30} y={CT + 30} width={120} height={120} fill={SI} />
          {Array.from({ length: 6 }, (_, i) => [<rect key={`t${i}`} x={38 + i * 19} y={CT + 34} width={10} height={10} fill={WIRE} />, <rect key={`d${i}`} x={38 + i * 19} y={CT + 136} width={10} height={10} fill={WIRE} />, <rect key={`l${i}`} x={34} y={CT + 38 + i * 19} width={10} height={10} fill={WIRE} />, <rect key={`r${i}`} x={136} y={CT + 38 + i * 19} width={10} height={10} fill={WIRE} />])}
          <text x={90} y={CT + 192} textAnchor="middle" style={zh(30, H.text, 900)}>打線</text></g>
        <g opacity={0.35 + 0.65 * fu}><rect x={170} y={CT + 30} width={120} height={120} fill={SI} />
          {Array.from({ length: 36 }, (_, i) => <circle key={i} cx={182 + (i % 6) * 19.2} cy={CT + 42 + Math.floor(i / 6) * 19.2} r={5.5} fill={SN} />)}
          <text x={230} y={CT + 192} textAnchor="middle" style={zh(30, H.text, 900)}>覆晶</text></g>
        <Sep x={318} />
        <Row x={344} y={CT + 48} t="打線：只能排在邊緣一圈" c={H.text2} a={ed} />
        <Row x={344} y={CT + 104} t="覆晶：整面都是接點" c={BLUE} a={fu} />
        <Row x={344} y={CT + 160} t="腳數多" c={H.amber} a={mn} />
        <Row x={344} y={CT + 216} t="訊號路徑短，不繞一圈線" c={OK} a={sh} />
      </svg>
    </Card>
  );
};

// ── fc-heat：背面朝外，沒有線擋著，貼散熱蓋，熱往上走 ──
const Heat: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330, bk = on(f, T(o, "back")), nw = on(f, T(o, "nowire")), ld = on(f, T(o, "lid"), 16);
  const ly = CT + 24 + 46 * ld;
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        <FcMini x={40} y={CT + 116} w={220} a={1} />
        <rect x={84} y={CT + 120} width={132} height={6} fill="#D0D6DE" opacity={0.4 + 0.6 * bk} />
        <g opacity={0.35 + 0.65 * ld}><rect x={36} y={ly} width={228} height={16} fill={LID} stroke={H.text2} strokeWidth={2} /><rect x={36} y={ly} width={10} height={60} fill={LID} /><rect x={254} y={ly} width={10} height={60} fill={LID} /></g>
        {[0, 1, 2].map((i) => { const u = ((f * 0.02 + i / 3) % 1); return <path key={i} d={`M${100 + i * 50} ${CT + 110 - u * 30} q10 -10 0 -20 q-10 -10 0 -20`} stroke={HOT} strokeWidth={4} fill="none" opacity={ld * (1 - u)} />; })}
        <Sep x={318} />
        <Row x={344} y={CT + 56} t="晶片背面朝外" c={H.text2} a={bk} />
        <Row x={344} y={CT + 122} t="沒有線擋著" c={BLUE} a={nw} />
        <Row x={344} y={CT + 188} t="直接貼散熱蓋，熱往上走" c={HOT} a={ld} />
      </svg>
    </Card>
  );
};

// ── fc-bump：凸塊怎麼長：凸塊下金屬層 → 光阻開孔 → 電鍍銅柱 → 錫帽 → 去光阻 → 回焊成圓頂 ──
const Bump: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330, bp = on(f, T(o, "bump")), wf = on(f, T(o, "wafer")), cu = on(f, T(o, "cu"), 30), sn = on(f, T(o, "sn"), 16);
  const steps: [string, number][] = [["金屬底層", bp], ["光阻開孔", bp], ["電鍍銅柱", cu], ["戴錫帽", sn], ["去光阻、回焊", sn]];
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        <rect x={40} y={CT + 196} width={220} height={30} fill={SI} />
        <rect x={40} y={CT + 186} width={70} height={10} fill={"#7FA8E8"} opacity={0.3 + 0.5 * bp} /><rect x={190} y={CT + 186} width={70} height={10} fill={"#7FA8E8"} opacity={0.3 + 0.5 * bp} />
        <rect x={120} y={CT + 196 - 110 * cu} width={60} height={110 * cu} fill={CU} />
        <rect x={120} y={CT + 196 - 110 * cu - 26 * sn} width={60} height={26 * sn} fill={SN} />
        <Sep x={300} />
        <Row x={326} y={CT + 44} t="晶圓還沒切就先做好" c={H.text2} a={wf} />
        {steps.map(([t, a], i) => <text key={t} x={350 + (i % 3) * 200} y={CT + 104 + Math.floor(i / 3) * 56} style={zh(30, H.text, 900)} opacity={0.35 + 0.65 * a}>{`${i + 1}. ${t}`}</text>)}
        <Row x={326} y={CT + 236} t="銅柱撐高度，錫帽負責焊" c={H.amber} a={sn} />
      </svg>
    </Card>
  );
};

// ── fc-align：錫熔化，表面張力像水珠把東西拉正（錫量多時） ──
const Align: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330, pl = on(f, T(o, "place")), ml = on(f, T(o, "melt"), 30), ts = on(f, T(o, "tension")), dr = on(f, T(o, "drop")), al = on(f, T(o, "align"));
  const off = 26 * (1 - ml);
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        <rect x={30} y={CT + 186} width={240} height={18} fill={SUBG} />
        {Array.from({ length: 5 }, (_, i) => <rect key={i} x={52 + i * 46 - 7} y={CT + 180} width={14} height={6} fill={"#D4A83C"} />)}
        <g transform={`translate(${off} ${-4 * (1 - ml)})`}><rect x={40} y={CT + 128} width={220} height={22} fill={SI} />
          {Array.from({ length: 5 }, (_, i) => <ellipse key={i} cx={52 + i * 46} cy={CT + 165} rx={9 + 3 * ml} ry={14 - 2 * ml} fill={ml > 0.5 ? "#F2B632" : SN} />)}</g>
        <g opacity={0.35 + 0.65 * dr}><path d={`M70 ${CT + 60} q20 -40 40 0 a20 20 0 1 1 -40 0`} fill="#9FD3F5" stroke={H.text2} strokeWidth={2} /></g>
        <Sep x={300} />
        <Row x={326} y={CT + 44} t="放到載板加熱" c={H.text2} a={pl} />
        <Row x={326} y={CT + 98} t="錫一熔化，表面張力" c={H.amber} a={Math.max(ml, ts)} />
        <Row x={326} y={CT + 152} t="像水珠，把晶片拉正" c={BLUE} a={dr} />
        <text x={326} y={CT + 222} style={zh(30, H.text2, 800)} opacity={0.4 + 0.6 * al}>（錫量多時；細間距改熱壓接合）</text>
      </svg>
    </Card>
  );
};

// ── fc-cte：熱脹冷縮：矽約 3、有機載板約 16 ppm/°C（約五倍），焊點被扭 ──
const Cte: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330, bt = on(f, T(o, "but")), ct = on(f, T(o, "cte")), x5 = on(f, T(o, "x5"), 20), cr = on(f, T(o, "crack"));
  const BX = 40, BW = 240;
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        <text x={BX} y={CT + 40} style={zh(30, H.text, 900)} opacity={0.4 + 0.6 * ct}>晶片（矽）約 3</text>
        <rect x={BX} y={CT + 54} width={BW * 0.19 * Math.max(0.05, x5)} height={30} fill={SI} />
        <text x={BX} y={CT + 126} style={zh(30, H.text, 900)} opacity={0.4 + 0.6 * ct}>載板約 16</text>
        <rect x={BX} y={CT + 140} width={BW * Math.max(0.05, x5)} height={30} fill={SUBG} />
        <text x={BX} y={CT + 214} style={zh(30, H.text2, 800)} opacity={0.4 + 0.6 * x5}>ppm/°C（文獻值）</text>
        <Sep x={318} />
        <Row x={344} y={CT + 56} t="晶片和載板，熱脹冷縮" c={H.text2} a={Math.max(bt, ct)} />
        <Row x={344} y={CT + 122} t="差了約五倍" c={H.amber} a={x5} />
        <Row x={344} y={CT + 188} t="一熱一冷，焊點被扭壞" c={RED} a={cr} />
      </svg>
    </Card>
  );
};

// ── fc-uf：沿邊緣點膠，膠像紙巾吸水滲進縫裡（毛細），再烤硬護住焊點 ──
const Uf: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330, ed = on(f, T(o, "edge")), wk = on(f, T(o, "wick"), 40), gp = on(f, T(o, "gap")), bk = on(f, T(o, "bake")), gd = on(f, T(o, "guard"));
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        <g opacity={0.4 + 0.6 * wk}><rect x={40} y={CT + 30} width={90} height={60} fill="#FFFFFF" stroke={H.text2} strokeWidth={2} /><rect x={40} y={CT + 90 - 54 * wk} width={90} height={54 * wk} fill="#9FD3F5" opacity={0.8} />
          <rect x={30} y={CT + 92} width={110} height={16} fill="#9FD3F5" /><text x={150} y={CT + 72} style={zh(30, H.text2, 800)}>紙巾吸水</text></g>
        <rect x={30} y={CT + 214} width={250} height={16} fill={SUBG} />
        <rect x={40} y={CT + 160} width={230} height={22} fill={SI} />
        {Array.from({ length: 6 }, (_, i) => <rect key={i} x={50 + i * 42} y={CT + 182} width={12} height={32} fill={SN} />)}
        <rect x={40} y={CT + 183} width={230 * wk} height={30} fill={bk > 0.5 ? "#B9853A" : UF} opacity={0.75} />
        <Sep x={318} />
        <Row x={344} y={CT + 48} t="沿晶片邊緣點膠" c={H.text2} a={ed} />
        <Row x={344} y={CT + 104} t="膠自己滲進縫裡（毛細）" c={BLUE} a={Math.max(wk, gp)} />
        <Row x={344} y={CT + 160} t="再烤硬" c={HOT} a={bk} />
        <Row x={344} y={CT + 216} t="護住每個焊點" c={OK} a={gd} />
      </svg>
    </Card>
  );
};

// ── fc-co：封裝大廠日月光（台）、安靠（美）；覆晶接合機 Besi（荷蘭，廠商說法） ──
const Co: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 360, bg = on(f, T(o, "big")), as = on(f, T(o, "ase")), am = on(f, T(o, "amk")), fb = on(f, T(o, "fcb")), bs = on(f, T(o, "besi"));
  const rows: [string, string, string, number][] = [["TW", "日月光 ASE", "2024 全球封測營收第一（TrendForce）", as], ["US", "安靠 Amkor", "2024 第二", am], ["NL", "Besi", "回焊型覆晶接合機（廠商說法）", bs]];
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        <text x={30} y={CT + 32} style={zh(30, H.text2, 900)} opacity={0.4 + 0.6 * Math.max(bg, fb)}>封裝廠兩家＋接合機一家（不排名接合機）</text>
        {rows.map(([c, n, s, a], i) => <g key={c}><FlagBox code={c} x={30} y={CT + 60 + i * 84} a={a} /><NamePlate x={98} y={CT + 54 + i * 84} w={260} h={50} t={n} a={a} px={32} />
          <text x={378} y={CT + 90 + i * 84} style={zh(30, H.text2, 800)} opacity={0.4 + 0.6 * a}>{s}</text></g>)}
      </svg>
    </Card>
  );
};

// ── fc-next：覆晶還得靠載板拉線 → 下一集：線直接做在晶圓（扇出型與晶圓級封裝） ──
const Next: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330, sb = on(f, T(o, "sub")), nx = on(f, T(o, "next")), rd = on(f, T(o, "rdl"), 20), fo = on(f, T(o, "fo"));
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        <g opacity={0.35 + 0.65 * sb}><FcMini x={30} y={CT + 10} w={240} a={1} /></g>
        <g opacity={0.35 + 0.65 * rd}><rect x={60} y={CT + 150} width={180} height={60} fill="#2B2F3A" /><rect x={120} y={CT + 160} width={60} height={30} fill={SI} />
          {[-1, 1].map((s) => [0, 1, 2].map((i) => <line key={`${s}${i}`} x1={150 + s * 30} y1={CT + 166 + i * 9} x2={150 + s * (40 + 40 * rd)} y2={CT + 158 + i * 18} stroke="#E2B53E" strokeWidth={3} />))}</g>
        <Sep x={300} />
        <Row x={326} y={CT + 52} t="覆晶還得靠載板拉線" c={H.text2} a={sb} />
        <Row x={326} y={CT + 118} t="下一集：線直接做在晶圓" c={BLUE} a={Math.max(nx, rd)} />
        <Row x={326} y={CT + 184} t="扇出型與晶圓級封裝" c={H.amber} a={fo} />
      </svg>
    </Card>
  );
};

// ── fc-ask：你手機的晶片是哪一種？留言「覆晶」 ──
const Ask: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330, ph = on(f, T(o, "phone")), kw = on(f, T(o, "kw"));
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        <g opacity={0.4 + 0.6 * ph}><rect x={90} y={CT + 14} width={110} height={196} rx={18} fill="#FFFFFF" stroke={INK} strokeWidth={5} /><rect x={118} y={CT + 80} width={54} height={54} fill={SI} /><text x={145} y={CT + 172} textAnchor="middle" style={zh(40, RED, 900)}>？</text></g>
        <Sep x={300} />
        <Row x={326} y={CT + 60} t="你手機的晶片是哪一種？" c={BLUE} a={ph} />
        <Row x={326} y={CT + 126} t="打線，還是覆晶？" c={H.text2} a={ph} />
        <Row x={326} y={CT + 192} t="留言「覆晶」拿完整資料" c={H.amber} a={kw} />
      </svg>
    </Card>
  );
};

export const FlipchipSection: React.FC<P> = (p) => {
  const kd = String((p.o as any).kind);
  const m: Record<string, React.FC<P>> = { "fc-hook": Hook, "fc-stamp": Stamp, "fc-vs": Vs, "fc-heat": Heat, "fc-bump": Bump, "fc-align": Align, "fc-cte": Cte, "fc-uf": Uf, "fc-co": Co, "fc-next": Next, "fc-ask": Ask };
  const C = m[kd];
  return C ? <C {...p} /> : null;
};

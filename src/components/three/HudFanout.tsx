// 2026/11/27 tech-fanout：扇出型與晶圓級封裝（系列 3 第 5 集）的 2D 示意卡（overlay `section` 的 kind 以 "fo-" 開頭，Hud.tsx 轉過來）。
//   fo-hook 接上集｜fo-fanin 接點多晶片小｜fo-wlp 晶圓級封裝｜fo-note 小便條（扇入擠不下）｜fo-recon 餅乾烤盤（重組晶圓）｜fo-rdl 延長線（重佈線）｜fo-warp 翹曲與偏移｜fo-co 台積電、力成｜fo-next 下一集。
// 全部示意：不標尺寸、良率、市占。時間全部來自 script.json 的 t（cue）。LOGO、國旗 100% 不透明（不放在 opacity 群組裡）。
import React from "react";
import { FONT_ZH } from "../../theme";
import { H, L, CARD_HEAD, CARD_CONTENT_TOP, cardTitleBox } from "./hudSkin";
import { EASE, tween } from "../anim";
import type { Model3D, Overlay3D, State3D } from "./engine";
import { Flag, LogoSvg, twPath } from "./Brand";

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
const RED = "#E0472F", OK = "#14A38B", BLUE = "#2F7FE0", GRY = "#98A2B3", CER = "#F2EBDD", CERD = "#D9CDB4", QZ = "#BFE3EC", STEEL = "#8E9BB0", ION = "#F2B632", PLS = "#8E7CF6";
const Sep: React.FC<{ x: number }> = ({ x }) => <line x1={x} y1={CT + 4} x2={x} y2={316} stroke={H.lineSoft} strokeWidth={3} />;
const Row: React.FC<{ x: number; y: number; t: string; c: string; a: number; px?: number }> = ({ x, y, t, c, a, px = 30 }) => (
  <g opacity={0.35 + 0.65 * a}><rect x={x} y={y - px * 0.72} width={12} height={px * 0.72} fill={c} /><text x={x + 24} y={y} style={zh(px, H.text, 900)}>{t}</text></g>
);
const FlagBox: React.FC<{ code: string; x: number; y: number; a: number }> = ({ code, x, y, a }) => (
  <g><rect x={x} y={y} width={50} height={36} fill="none" stroke={a > 0.5 ? H.amber : H.lineSoft} strokeWidth={a > 0.5 ? 4 : 1.5} /><Flag code={code} h={28} x={x + 4} y={y + 4} asSvg /></g>
);
const NamePlate: React.FC<{ x: number; y: number; w: number; h: number; t: string; a: number; px?: number }> = ({ x, y, w, h, t, a, px = 32 }) => (
  <g><rect x={x} y={y} width={w} height={h} fill="#FFFFFF" stroke={a > 0.5 ? H.amber : H.lineSoft} strokeWidth={a > 0.5 ? 4 : 1.5} /><text x={x + w / 2} y={y + h / 2 + px * 0.34} textAnchor="middle" style={zh(px, "#1F3A5F", 900)}>{t}</text></g>
);

const MOLD = "#2A2D33", PI = "#D9A441", CU = "#C47B3E", SOL = "#AEB6C2", SUB = "#2F7D4F", SI = "#7C8798";
// 小封裝剖面圖：kind＝"flip"（晶片＋凸塊＋厚載板＋錫球）｜"fo"（晶片埋模封＋薄重佈線＋錫球散到外圍）
const MiniPkg: React.FC<{ x: number; y: number; kind: "flip" | "fo"; a: number; grow?: number }> = ({ x, y, kind, a, grow = 1 }) => kind === "flip" ? (
  <g opacity={0.4 + 0.6 * a}>
    <rect x={x + 40} y={y} width={60} height={16} fill={SI} stroke={H.text2} strokeWidth={2} />
    {[0, 1, 2, 3, 4].map((i) => <rect key={i} x={x + 44 + i * 12} y={y + 16} width={5} height={7} fill={CU} />)}
    <rect x={x} y={y + 23} width={140} height={22} fill={SUB} stroke={H.text2} strokeWidth={2} />
    {[0, 1, 2, 3, 4, 5].map((i) => <circle key={i} cx={x + 14 + i * 22} cy={y + 52} r={6} fill={SOL} />)}
  </g>
) : (
  <g opacity={0.4 + 0.6 * a}>
    <rect x={x} y={y} width={140} height={22} fill={MOLD} /><rect x={x + 40} y={y + 4} width={60} height={18} fill={SI} />
    <rect x={x} y={y + 22} width={140} height={10} fill={PI} />
    {[[70, 14], [70, 126]].map(([x0, x1], i) => <line key={i} x1={x + x0} y1={y + 27} x2={x + x0 + (x1 - x0) * grow} y2={y + 27} stroke={CU} strokeWidth={4} />)}
    {[0, 1, 2, 3, 4, 5].map((i) => <circle key={i} cx={x + 14 + i * 22} cy={y + 39} r={6} fill={SOL} />)}
  </g>
);
// fo-hook：接上集——覆晶靠載板；這集不用載板
const Hook: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330, su = on(f, T(o, "sub")), pv = on(f, T(o, "prev")), fl = on(f, T(o, "flip"));
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        <MiniPkg x={30} y={CT + 30} kind="flip" a={fl} /><text x={30} y={CT + 116} style={zh(30, H.text2, 800)} opacity={0.4 + 0.6 * fl}>覆晶：靠載板</text>
        <MiniPkg x={30} y={CT + 150} kind="fo" a={su} /><text x={30} y={CT + 226} style={zh(30, OK, 900)} opacity={0.4 + 0.6 * su}>扇出型：沒有載板</text>
        <Sep x={318} />
        <Row x={344} y={CT + 56} t="不用載板，線怎麼拉出去？" c={RED} a={su} />
        <Row x={344} y={CT + 122} t="前一集：覆晶靠載板拉線" c={H.text2} a={pv} />
        <Row x={344} y={CT + 188} t="這集：線直接做在晶圓" c={OK} a={fl} />
      </svg>
    </Card>
  );
};
// fo-fanin：晶片越小、接點越多，底下塞不下錫球
const Fanin: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330, sm = on(f, T(o, "small")), mo = on(f, T(o, "more")), nf = on(f, T(o, "nofit"));
  const s = 150 - 40 * sm;
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        <rect x={40} y={CT + 40} width={s} height={s} fill={SI} stroke={H.amber} strokeWidth={4} />
        {Array.from({ length: 16 }, (_, i) => <circle key={i} cx={40 + ((i % 4) + 0.5) * (s / 4)} cy={CT + 40 + (Math.floor(i / 4) + 0.5) * (s / 4)} r={8} fill={SOL} opacity={0.4 + 0.6 * mo} />)}
        {[0, 1, 2].map((i) => <circle key={i} cx={40 + s + 24 + i * 22} cy={CT + 60 + i * 24} r={8} fill={RED} opacity={nf} />)}
        <Sep x={318} />
        <Row x={344} y={CT + 56} t="晶片越做越小" c={H.text2} a={sm} />
        <Row x={344} y={CT + 122} t="接點卻越來越多" c={BLUE} a={mo} />
        <Row x={344} y={CT + 188} t="底下塞不下錫球" c={RED} a={nf} />
      </svg>
    </Card>
  );
};
// fo-wlp：晶圓級封裝——沒切就做好線路與錫球，切開跟晶片差不多大
const Wlp: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330, wl = on(f, T(o, "wlp")), bl = on(f, T(o, "balls")), ct = on(f, T(o, "cut")), sa = on(f, T(o, "same"));
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        <circle cx={120} cy={CT + 120} r={90} fill={SI} stroke={H.text2} strokeWidth={3} opacity={0.4 + 0.6 * wl} />
        {[-60, -20, 20, 60].map((d, i) => <line key={`v${i}`} x1={120 + d} y1={CT + 40} x2={120 + d} y2={CT + 200} stroke={H.text2} strokeWidth={2} opacity={0.6} />)}
        {[-60, -20, 20, 60].map((d, i) => <line key={`h${i}`} x1={40} y1={CT + 120 + d} x2={200} y2={CT + 120 + d} stroke={H.text2} strokeWidth={2} opacity={0.6} />)}
        {[-40, 0, 40].flatMap((a) => [-40, 0, 40].map((b) => <circle key={`${a}${b}`} cx={120 + a} cy={CT + 120 + b} r={6} fill={SOL} opacity={bl} />))}
        <rect x={232} y={CT + 100} width={40} height={40} fill={SI} stroke={H.amber} strokeWidth={3} opacity={ct} /><circle cx={252} cy={CT + 120} r={6} fill={SOL} opacity={ct} />
        <Sep x={318} />
        <Row x={344} y={CT + 56} t="晶圓還沒切就做好錫球" c={BLUE} a={Math.max(wl, bl)} />
        <Row x={344} y={CT + 122} t="切開就是成品" c={H.amber} a={ct} />
        <Row x={344} y={CT + 188} t="跟晶片差不多大（扇入）" c={OK} a={sa} />
      </svg>
    </Card>
  );
};
// fo-note：小便條寫滿電話——接點只能擠在晶片範圍
const Note: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330, ol = on(f, T(o, "only")), nt = on(f, T(o, "note")), ph = on(f, T(o, "phone"), 30), fu = on(f, T(o, "full"));
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        <rect x={60} y={CT + 30} width={170} height={170} fill="#FFF3A8" stroke={H.text2} strokeWidth={3} opacity={0.4 + 0.6 * nt} />
        {Array.from({ length: 7 }, (_, i) => <line key={i} x1={76} y1={CT + 56 + i * 22} x2={76 + 140 * Math.min(1, Math.max(0, ph * 7 - i))} y2={CT + 56 + i * 22} stroke={H.text} strokeWidth={4} />)}
        <text x={244} y={CT + 196} style={zh(40, RED, 900)} opacity={fu}>×</text>
        <Sep x={318} />
        <Row x={344} y={CT + 56} t="接點只能擠在晶片範圍" c={H.amber} a={ol} />
        <Row x={344} y={CT + 122} t="像小便條寫滿電話" c={BLUE} a={nt} />
        <Row x={344} y={CT + 188} t="接點一多就寫不下" c={RED} a={fu} />
      </svg>
    </Card>
  );
};
// fo-recon：餅乾排進烤盤倒滿巧克力——好晶片排在載盤、灌模封料、變成新晶圓（晶片先放）
const Recon: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330, pl = on(f, T(o, "place")), fi = on(f, T(o, "fill"), 30), co = on(f, T(o, "cookie")), nw = on(f, T(o, "new"));
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        <rect x={30} y={CT + 150} width={260} height={14} fill="#CFE6F2" stroke={H.text2} strokeWidth={2} />
        <rect x={30} y={CT + 150 - 50 * fi} width={260} height={50 * fi} fill={MOLD} opacity={0.9} />
        {[0, 1, 2, 3].map((i) => <rect key={i} x={46 + i * 64} y={CT + 116} width={36} height={34} fill={SI} stroke={H.text2} strokeWidth={2} opacity={Math.min(1, Math.max(0.25, pl * 4 - i))} />)}
        <text x={30} y={CT + 204} style={zh(30, H.text2, 800)} opacity={0.4 + 0.6 * co}>餅乾＝晶片</text><text x={30} y={CT + 240} style={zh(30, H.text2, 800)} opacity={0.4 + 0.6 * co}>巧克力＝模封料</text>
        <Sep x={318} />
        <Row x={344} y={CT + 52} t="挑好晶片排進載盤（拉開間距）" c={BLUE} a={pl} />
        <Row x={344} y={CT + 118} t="灌滿模封料（加熱加壓）" c={H.amber} a={fi} />
        <Row x={344} y={CT + 184} t="變成一片新晶圓" c={OK} a={nw} />
      </svg>
    </Card>
  );
};
// fo-rdl：重佈線層像延長線，把接點拉到外圍
const Rdl: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330, rd = on(f, T(o, "rdl")), cd = on(f, T(o, "cord")), ou = on(f, T(o, "outer"), 30), ba = on(f, T(o, "ball"));
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        <MiniPkg x={60} y={CT + 70} kind="fo" a={rd} grow={ou} />
        <path d={`M200 ${CT + 186} q30 -30 60 0 q30 30 0 40`} fill="none" stroke={CU} strokeWidth={5} opacity={cd} /><rect x={248} y={CT + 220} width={24} height={16} fill={H.text2} opacity={cd} />
        <text x={60} y={CT + 160} style={zh(30, H.text2, 800)} opacity={0.4 + 0.6 * ba}>錫球在晶片外圍</text>
        <Sep x={318} />
        <Row x={344} y={CT + 56} t="鋪重佈線層（銅線）" c={H.amber} a={rd} />
        <Row x={344} y={CT + 122} t="像延長線，從晶片拉到外圍" c={BLUE} a={Math.max(cd, ou)} />
        <Row x={344} y={CT + 188} t="錫球就有地方放（扇出）" c={OK} a={ba} />
      </svg>
    </Card>
  );
};
// fo-warp：熱脹冷縮不同 → 翹、晶片偏移、對不準
const Warp: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330, ct = on(f, T(o, "cte")), wp = on(f, T(o, "warp"), 20), sh = on(f, T(o, "shift")), mi = on(f, T(o, "miss"));
  const c = 40 * wp;
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        <path d={`M30 ${CT + 120 - c} Q160 ${CT + 120 + c} 290 ${CT + 120 - c} L290 ${CT + 140 - c} Q160 ${CT + 140 + c} 30 ${CT + 140 - c} Z`} fill={MOLD} />
        <line x1={30} y1={CT + 120} x2={290} y2={CT + 120} stroke={H.amber} strokeWidth={2} strokeDasharray="8 6" />
        <rect x={150 + 16 * sh} y={CT + 190} width={40} height={30} fill={SI} stroke={H.text2} strokeWidth={2} /><rect x={150} y={CT + 190} width={40} height={30} fill="none" stroke={H.amber} strokeWidth={2} strokeDasharray="6 4" />
        <text x={238} y={CT + 218} style={zh(36, RED, 900)} opacity={mi}>×</text>
        <text x={30} y={CT + 70} style={zh(30, H.text2, 800)} opacity={0.4 + 0.6 * ct}>塑膠脹得比晶片多</text>
        <Sep x={318} />
        <Row x={344} y={CT + 52} t="熱脹冷縮不同" c={H.amber} a={ct} />
        <Row x={344} y={CT + 108} t="整片翹起來" c={RED} a={wp} />
        <Row x={344} y={CT + 164} t="晶片被擠歪（模封流動、收縮）" c={RED} a={sh} />
        <Row x={344} y={CT + 220} t="線就對不準" c={RED} a={mi} />
      </svg>
    </Card>
  );
};
// fo-co：台積電（官方 LOGO）、力成（文字名牌）；台灣國旗＋輪廓
const Co: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 392, ts = on(f, T(o, "tsmc")), pt = on(f, T(o, "ptc")), y = (i: number) => CT + 20 + i * 120;
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        <FlagBox code="TW" x={26} y={y(0) + 12} a={ts} />
        <g><rect x={92} y={y(0)} width={110} height={70} fill="#FFFFFF" stroke={ts > 0.5 ? H.amber : H.lineSoft} strokeWidth={ts > 0.5 ? 4 : 1.5} /><LogoSvg id="tsmc" x={104} y={y(0) + 6} h={58} /></g>
        <text x={222} y={y(0) + 30} style={zh(32, "#1F3A5F", 900)}>台積電 2330</text>
        <text x={222} y={y(0) + 68} style={zh(30, H.text, 800)} opacity={0.4 + 0.6 * ts}>整合扇出型 InFO：2016 年起用在手機處理器</text>
        <FlagBox code="TW" x={26} y={y(1) + 12} a={pt} /><NamePlate x={92} y={y(1)} w={200} h={70} t="力成 6239" a={pt} />
        <text x={312} y={y(1) + 30} style={zh(30, H.text, 800)} opacity={0.4 + 0.6 * pt}>扇出型面板級封裝（方形面板）</text>
        <text x={312} y={y(1) + 68} style={zh(30, H.text2, 800)} opacity={0.4 + 0.6 * pt}>發展中，截至 2026/11/27 尚未量產</text>
        <path d={twPath(880, 70, 40)} fill={ts > 0.5 || pt > 0.5 ? H.amber : H.lineSoft} opacity={0.5} />
      </svg>
    </Card>
  );
};
// fo-next：下一集先進封裝設備
const Next: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330, nx = on(f, T(o, "next")), tl = on(f, T(o, "tool")), kw = on(f, T(o, "kw")), mu = on(f, T(o, "multi"));
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        <rect x={30} y={CT + 150} width={200} height={40} fill={MOLD} />{[0, 1, 2].map((i) => <rect key={i} x={46 + i * 62} y={CT + 156} width={46} height={28} fill={SI} />)}
        <rect x={240} y={CT + 40} width={60} height={150} fill="#E2E8F0" stroke={H.text2} strokeWidth={3} opacity={0.4 + 0.6 * tl} />
        <Sep x={318} />
        <Row x={344} y={CT + 56} t="好幾顆晶片封在一起" c={H.text2} a={mu} />
        <Row x={344} y={CT + 122} t="下一集：先進封裝設備" c={BLUE} a={nx} />
        <Row x={344} y={CT + 188} t="留言「扇出」拿完整資料" c={H.amber} a={kw} />
      </svg>
    </Card>
  );
};
export const FanoutSection: React.FC<P> = (p) => {
  const kd = String((p.o as any).kind);
  if (kd === "fo-hook") return <Hook {...p} />; if (kd === "fo-fanin") return <Fanin {...p} />; if (kd === "fo-wlp") return <Wlp {...p} />; if (kd === "fo-note") return <Note {...p} />;
  if (kd === "fo-recon") return <Recon {...p} />; if (kd === "fo-rdl") return <Rdl {...p} />; if (kd === "fo-warp") return <Warp {...p} />; if (kd === "fo-co") return <Co {...p} />; if (kd === "fo-next") return <Next {...p} />;
  return null;
};

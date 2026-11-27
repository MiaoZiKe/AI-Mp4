// 2026/11/27 tech-chem：濕式化學品與研磨液（系列 2 第 16 集）的 2D 示意卡（overlay `section` 的 kind 以 "chem-" 開頭，Hud.tsx 的 HudSection 轉過來）。
//   chem-hook 接上集：氣體→液體、連一粒灰都不行？｜chem-kinds 洗／蝕刻／磨平三種藥水｜chem-pool 游泳池一小匙→管內紅點極少｜chem-path 送液路徑（大槽→管線→管理櫃→循環迴路→機台旁）｜
//   chem-pipe 檸檬汁不裝鐵杯：鐵管酸咬下金屬、塑膠管乾淨｜chem-slurry 研磨液＝磨粒（機械）＋藥劑（化學）｜chem-stir 結塊刮傷→攪動、循環、過濾（像攪拌的豆漿）｜chem-co 英特格、中華化、三福化｜chem-next 下一集研磨墊。
// 全部示意：不標粒徑、濃度、流量、壓力、市占；只放查證過的說法（research.md）。結構一開始就畫出，念到時該處亮起、動起來；時間全部來自 script.json 的 t（cue）。
// 排版原則（card-overlap.mjs 檢查）：內容從 CARD_CONTENT_TOP 以下；字不放進會動的圖形範圍；字 ≥30px；字離圖形 ≥6px。
// 公司 LOGO：英特格＝官網原檔（public/logos/entegris.svg，白底名牌）；中華化、三福化官方原檔當天抓不到（見 videos/tech-chem/assets.md），用白底深色文字名牌（不仿商標）＋國旗，國旗與名牌 100% 不透明。
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
// solid：卡裡有 LOGO／國旗時不用透明度進場（官方 LOGO 與國旗 100% 不透明），改用由下滑入
const Card: React.FC<{ o: Overlay3D; k: number; W: number; Hh: number; solid?: boolean; children: React.ReactNode }> = ({ o, k, W, Hh, solid, children }) => (
  <div style={{ position: "absolute", left: o.x ?? L.X, top: o.y ?? 900, width: W, height: Hh, opacity: solid ? (k > 0.02 ? 1 : 0) : k, transform: solid ? `translateY(${Math.round((1 - k) * 20)}px)` : undefined, background: H.cardCompare, border: `2px solid ${H.lineSoft}`, boxSizing: "border-box", overflow: "hidden" }}>
    {o.title ? <div style={{ ...zh(CARD_HEAD.px, onC(H.line), 800), ...cardTitleBox(), background: H.line, zIndex: 2 }}>{o.title}</div> : null}
    {o.tag ? <div style={{ position: "absolute", right: 16, top: 14, ...zh(28, H.text2, 600), zIndex: 2 }}>{o.tag}</div> : null}
    {children}
  </div>
);
const on = (f: number, at: number, d = 10) => tween(f, at, d, EASE.enter);
const fr = (x: number) => ((x % 1) + 1) % 1;
const RED = "#E0472F", OK = "#14A38B", BLUE = "#2F7FE0", ORG = "#F29A4A", GRY = "#98A2B3", LIQ = "#BFDDFB", ACID = "#C9DE5A", ETCH = "#F2C94C", MILK = "#EFE8DA", SIL = "#CFE0F5", RUST = "#B5532B";
const Sep: React.FC<{ x: number; y2?: number }> = ({ x, y2 = 316 }) => <line x1={x} y1={CT + 4} x2={x} y2={y2} stroke={H.lineSoft} strokeWidth={3} />;
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
/** 瓶子圖示（桶身＋蓋＋液面） */
const Bottle: React.FC<{ x: number; y: number; c: string; a: number; s?: number }> = ({ x, y, c, a, s = 1 }) => (
  <g opacity={0.45 + 0.55 * a} transform={`translate(${x} ${y}) scale(${s})`}><rect x={-12} y={-62} width={24} height={14} fill={H.text2} /><rect x={-34} y={-48} width={68} height={96} rx={10} fill="#FFFFFF" stroke={H.text2} strokeWidth={4} />
    <rect x={-28} y={-8} width={56} height={50} rx={6} fill={c} /><rect x={-20} y={8} width={40} height={10} fill="#FFFFFF" opacity={0.7} /></g>
);

// ── chem-hook：接上集：氣體→液體；連一粒灰都不行？ ──
const Hook: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330, pv = on(f, T(o, "prev")), lq = on(f, T(o, "liq")), du = on(f, T(o, "dust")), pu = Math.sin(f * 0.14) * 0.5 + 0.5;
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        <g opacity={0.45 + 0.55 * pv} transform={`translate(80 ${CT + 150})`}><rect x={-26} y={-44} width={52} height={120} rx={22} fill="#FFFFFF" stroke={H.text2} strokeWidth={5} /><rect x={-11} y={-68} width={22} height={24} fill={H.text2} /><rect x={-22} y={34} width={44} height={36} fill={GRY} /></g>
        <Arr x1={130} x2={200} y={CT + 130} a={lq} />
        <Bottle x={290} y={CT + 150} c={LIQ} a={lq} s={1.4} />
        <circle cx={346} cy={CT + 46 + 4 * pu} r={9} fill={H.amber} stroke="#8A5E00" strokeWidth={3} opacity={du} />
        <Sep x={400} />
        <Row x={430} y={CT + 56} t="前一集：氣體" c={H.text2} a={pv} /><Row x={430} y={CT + 122} t="這一集：液體（藥水）" c={BLUE} a={lq} /><Row x={430} y={CT + 188} t="連一粒灰都不行？" c={H.amber} a={du} />
      </svg>
    </Card>
  );
};

// ── chem-kinds：洗／蝕刻／磨平，三種藥水；統稱濕式化學品 ──
const Kinds: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330, a = ["wash", "etch", "polish"].map((n) => on(f, T(o, n))), nm = on(f, T(o, "name"));
  const cols: [string, string, string, string][] = [["洗", LIQ, "清洗液", BLUE], ["蝕刻", ETCH, "蝕刻液", H.amber], ["磨平", MILK, "研磨液", GRY]];
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        {cols.map(([act, c, nme, ac], i) => { const x = 24 + i * 310, lit = a[i];
          return <g key={i}><rect x={x} y={CT + 4} width={290} height={176} fill="#FFFFFF" stroke={lit > 0.5 ? H.amber : H.lineSoft} strokeWidth={lit > 0.5 ? 5 : 2} />
            <Bottle x={x + 66} y={CT + 106} c={c} a={lit} s={0.9} />
            <text x={x + 120} y={CT + 52} style={zh(34, H.text, 900)} opacity={0.4 + 0.6 * lit}>{act}</text>
            <text x={x + 120} y={CT + 100} style={zh(30, H.text2, 800)} opacity={0.4 + 0.6 * lit}>{nme}</text>
            <rect x={x + 120} y={CT + 124} width={150} height={30} fill={ac} opacity={0.3 + 0.7 * lit} />
          </g>; })}
        <Row x={24} y={CT + 222} t="統稱：濕式化學品" c={H.amber} a={nm} /><text x={430} y={CT + 222} style={zh(30, H.text2, 800)} opacity={0.4 + 0.6 * nm}>每一步都靠液體</text>
      </svg>
    </Card>
  );
};

// ── chem-pool：一座游泳池只混進一小匙；管內紅點極少 ──
const Pool: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330, q = on(f, T(o, "q")), pl = on(f, T(o, "pool")), sp = on(f, T(o, "spoon"));
  const dots = Array.from({ length: 36 }, (_, i) => [((i * 53) % 100) / 100, ((i * 37 + 11) % 100) / 100] as [number, number]);
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        <rect x={24} y={CT + 40} width={330} height={150} fill="#BFE6F5" stroke="#4FA9C9" strokeWidth={4} opacity={0.4 + 0.6 * pl} />
        {[0, 1, 2, 3].map((i) => <line key={i} x1={24} y1={CT + 70 + i * 36} x2={354} y2={CT + 70 + i * 36} stroke="#4FA9C9" strokeWidth={2} opacity={0.5 * pl} />)}
        <g opacity={0.4 + 0.6 * sp}><ellipse cx={300} cy={CT + 20} rx={26} ry={12} fill={H.text2} /><rect x={310} y={CT + 14} width={60} height={8} fill={H.text2} /><circle cx={300} cy={CT + 34} r={6} fill={RED} /></g>
        <Arr x1={372} x2={430} y={CT + 110} a={sp} />
        <rect x={446} y={CT + 40} width={210} height={150} fill="#FFFFFF" stroke={H.text2} strokeWidth={4} opacity={0.4 + 0.6 * sp} />
        {dots.map(([u, v], i) => <circle key={i} cx={458 + u * 186 + Math.sin(f * 0.05 + i) * 3} cy={CT + 52 + v * 126 + Math.cos(f * 0.04 + i) * 3} r={5} fill={LIQ} opacity={0.4 + 0.6 * sp} />)}
        <circle cx={600} cy={CT + 100} r={8} fill={RED} stroke="#7A1A0C" strokeWidth={2} opacity={sp} />
        <Sep x={690} />
        <Row x={716} y={CT + 56} t="多乾淨？" c={H.text2} a={q} /><Row x={716} y={CT + 122} t="一座游泳池" c={BLUE} a={pl} /><Row x={716} y={CT + 188} t="只混進一小匙" c={H.amber} a={sp} />
        <text x={24} y={CT + 232} style={zh(30, H.text2, 800)} opacity={0.4 + 0.6 * sp}>紅點＝雜質，比例示意</text>
        <text x={350} y={CT + 232} style={zh(30, H.text2, 900)} opacity={sp}>先進製程還要再少十倍以上（示意）</text>
      </svg>
    </Card>
  );
};

// ── chem-path：送液路徑（廠外大槽→管線→管理櫃→循環迴路→機台旁） ──
const Path: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 326, a = ["tank", "pipe", "water", "clean", "back"].map((n) => on(f, T(o, n)));
  const chips: [string, number][] = [["廠外大槽", 150], ["管線", 100], ["管理櫃", 130], ["循環迴路", 160], ["機台旁", 130]];
  let x = 24; const pos = chips.map(([, w]) => { const r = x; x += w + 44; return r; });
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        {chips.map(([t, w], i) => <g key={t}><Chip x={pos[i]} y={CT + 8} w={w} t={t} a={a[i]} />{i < 4 ? <Arr x1={pos[i] + w + 4} x2={pos[i] + w + 40} y={CT + 33} a={a[i + 1]} /> : null}</g>)}
        {[0, 1, 2, 3, 4, 5].map((i) => <circle key={i} cx={24 + fr(f * 0.006 + i / 6) * 904} cy={CT + 100} r={6} fill={LIQ} stroke={BLUE} strokeWidth={1.5} opacity={a[1]} />)}
        <line x1={24} y1={CT + 100} x2={928} y2={CT + 100} stroke={H.lineSoft} strokeWidth={3} opacity={0.6} />
        <Row x={24} y={CT + 160} t="像自來水廠送水" c={BLUE} a={a[2]} /><Row x={24} y={CT + 214} t="每一段都過濾，不准掉渣" c={H.amber} a={a[3]} />
      </svg>
    </Card>
  );
};

// ── chem-pipe：檸檬汁不裝鐵杯；鐵管酸咬下金屬、塑膠管乾淨 ──
const Pipe: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330, pl = on(f, T(o, "plastic")), ir = on(f, T(o, "iron")), le = on(f, T(o, "lemon")), bi = on(f, T(o, "bite"));
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        <g opacity={0.45 + 0.55 * le}><circle cx={90} cy={CT + 80} r={44} fill="#F5D948" stroke="#C9A800" strokeWidth={4} />{[0, 45, 90, 135].map((d) => <line key={d} x1={90} y1={CT + 80} x2={90 + 38 * Math.cos((d * Math.PI) / 180)} y2={CT + 80 + 38 * Math.sin((d * Math.PI) / 180)} stroke="#FFF8CC" strokeWidth={3} />)}</g>
        <g opacity={0.45 + 0.55 * le}><rect x={200} y={CT + 52} width={110} height={110} fill="#8E96A3" stroke={H.text2} strokeWidth={4} /><rect x={206} y={CT + 58} width={98} height={26} fill={ACID} opacity={0.8} />
          {[[230, CT + 110], [270, CT + 130], [250, CT + 146]].map(([cx, cy], i) => <circle key={i} cx={cx} cy={cy} r={7} fill={RUST} opacity={bi} />)}</g>
        <Arr x1={140} x2={196} y={CT + 100} a={le} />
        <text x={24} y={CT + 214} style={zh(30, H.text2, 800)} opacity={0.4 + 0.6 * le}>檸檬汁＋鐵杯</text>
        <Sep x={350} />
        <rect x={380} y={CT + 10} width={250} height={70} fill="#ECEAE4" stroke={H.text2} strokeWidth={4} opacity={0.4 + 0.6 * ir} />
        {[0, 1, 2].map((i) => <circle key={i} cx={400 + fr(f * 0.01 + i / 3) * 210} cy={CT + 46} r={7} fill={ACID} opacity={ir} />)}
        <rect x={380} y={CT + 110} width={250} height={70} fill="#ECEAE4" stroke={H.text2} strokeWidth={4} opacity={0.4 + 0.6 * pl} />
        {[0, 1, 2].map((i) => <circle key={`p${i}`} cx={400 + fr(f * 0.01 + i / 3) * 210} cy={CT + 146} r={7} fill={ACID} opacity={pl} />)}
        {[0, 1, 2, 3].map((i) => <circle key={`r${i}`} cx={420 + fr(f * 0.012 + i / 4) * 180} cy={CT + 60 + (i % 2) * 8} r={6} fill={RUST} opacity={bi} />)}
        <Row x={656} y={CT + 52} t="鐵：酸咬下金屬" c={RED} a={bi} px={30} /><Row x={656} y={CT + 150} t="塑膠：酸咬不動" c={OK} a={pl} px={30} />
        <text x={380} y={CT + 226} style={zh(30, H.text2, 800)} opacity={0.4 + 0.6 * bi}>金屬雜質會污染晶圓</text>
      </svg>
    </Card>
  );
};

// ── chem-slurry：研磨液＝磨粒（機械）＋藥劑（化學） ──
const Slurry: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330, sl = on(f, T(o, "slurry")), gr = on(f, T(o, "grain")), wa = on(f, T(o, "wash")), sa = on(f, T(o, "sand")), ch = on(f, T(o, "chem")), bo = on(f, T(o, "both"));
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        <rect x={24} y={CT + 8} width={400} height={30} fill={H.text2} opacity={0.5 + 0.5 * sa} />
        <rect x={24} y={CT + 38} width={400} height={120} fill="#F4EFE4" opacity={0.4 + 0.6 * sl} />
        {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => <circle key={i} cx={50 + i * 48 + Math.sin(f * 0.07 + i) * 3} cy={CT + 70 + (i % 3) * 22 + Math.cos(f * 0.06 + i) * 3} r={9} fill={SIL} stroke={BLUE} strokeWidth={2} opacity={0.4 + 0.6 * gr} />)}
        <rect x={24} y={CT + 150} width={400} height={30} fill="#9AA3B2" /><rect x={190} y={CT + 130} width={90} height={22} fill="#9AA3B2" opacity={1 - 0.6 * sa} />
        {[0, 1, 2].map((i) => <circle key={`o${i}`} cx={60 + i * 40} cy={CT + 140 - 12 * ch} r={5} fill={RED} opacity={ch} />)}
        <Sep x={450} />
        <Row x={476} y={CT + 52} t="磨粒：機械磨（砂）" c={BLUE} a={sa} /><Row x={476} y={CT + 106} t="藥劑：化學溶" c={ORG} a={ch} /><Row x={476} y={CT + 160} t="兩個一起動手" c={H.amber} a={bo} />
        <text x={476} y={CT + 214} style={zh(30, H.text2, 800)} opacity={0.4 + 0.6 * wa}>像含細砂的洗面乳</text>
        <text x={24} y={CT + 212} style={zh(30, H.text2, 800)} opacity={0.4 + 0.6 * sl}>研磨液放大（示意）</text>
      </svg>
    </Card>
  );
};

// ── chem-stir：結塊刮傷→攪動、循環、過濾（像不停攪拌的豆漿） ──
const Stir: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330, lu = on(f, T(o, "lump")), sc = on(f, T(o, "scratch")), st = on(f, T(o, "stir")), lo = on(f, T(o, "loop")), fi = on(f, T(o, "filter")), so = on(f, T(o, "soy"));
  const ang = f * 7;
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        <rect x={24} y={CT + 8} width={140} height={170} fill="#F4EFE4" stroke={H.text2} strokeWidth={4} opacity={0.5 + 0.5 * st} />
        <line x1={94} y1={CT + 8} x2={94} y2={CT + 120} stroke={H.text2} strokeWidth={4} />
        <g transform={`translate(94 ${CT + 122})`} opacity={0.4 + 0.6 * st}><ellipse cx={0} cy={0} rx={Math.abs(Math.cos((ang * Math.PI) / 180)) * 42 + 6} ry={7} fill={BLUE} /></g>
        <g opacity={0.3 + 0.7 * lu}><rect x={44} y={CT + 150} width={22} height={18} fill="#8A8F96" /><rect x={116} y={CT + 152} width={18} height={16} fill="#8A8F96" /></g>
        <path d={`M164 ${CT + 150} H214 V${CT + 190} H${210}`} fill="none" stroke={BLUE} strokeWidth={4} opacity={0.4 + 0.6 * lo} />
        <rect x={214} y={CT + 70} width={46} height={120} fill="#FFFFFF" stroke={fi > 0.5 ? H.amber : H.text2} strokeWidth={fi > 0.5 ? 5 : 3} opacity={0.5 + 0.5 * fi} />
        <rect x={228} y={CT + 80} width={18} height={100} fill={SIL} opacity={0.4 + 0.6 * fi} />
        <path d={`M237 ${CT + 70} V${CT + 28} H94`} fill="none" stroke={BLUE} strokeWidth={4} opacity={0.4 + 0.6 * lo} />
        {[0, 1, 2].map((i) => <circle key={i} cx={237 - fr(f * 0.01 + i / 3) * 143} cy={CT + 28} r={5} fill={LIQ} stroke={BLUE} strokeWidth={1.5} opacity={lo} />)}
        <Sep x={290} />
        <Row x={316} y={CT + 52} t="結塊：刮傷晶圓" c={RED} a={Math.max(lu, sc)} /><Row x={316} y={CT + 106} t="攪動：磨粒不沉底" c={BLUE} a={st} />
        <Row x={316} y={CT + 160} t="循環＋過濾：濾掉結塊" c={H.amber} a={Math.max(lo, fi)} /><text x={316} y={CT + 214} style={zh(30, H.text2, 800)} opacity={0.4 + 0.6 * so}>像不停攪拌的豆漿</text>
      </svg>
    </Card>
  );
};

// ── chem-co：英特格、中華化、三福化 ──
const Co: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 392, ia = on(f, T(o, "intl")), ca = on(f, T(o, "chc")), ac = on(f, T(o, "acid")), sa = on(f, T(o, "sanfu")), de = on(f, T(o, "dev"));
  const rows: [string, number, string, number][] = [["US", ia, "研磨液", ia], ["TW", Math.max(ca, ac), "電子級硫酸", ac], ["TW", Math.max(sa, de), "顯影液回收再純化", de]];
  return (
    <Card o={o} k={k} W={W} Hh={Hh} solid>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        <path d={twPath(60, CT + 16, 56)} fill="#E7EDF7" stroke={Math.max(ca, sa) > 0.5 ? H.amber : H.text2} strokeWidth={3} opacity={0.5 + 0.5 * Math.max(ca, sa)} />
        <Sep x={200} y2={Hh - 12} />
        <text x={222} y={CT + 30} style={zh(32, H.text2, 900)} opacity={0.5 + 0.5 * ia}>三家各一句</text>
        {rows.map(([c, a, what, a2], i) => { const y = CT + 56 + i * 98;
          return <g key={i}><FlagBox code={c} x={222} y={y + 6} a={a} />
            {i === 0 ? <g><rect x={290} y={y} width={230} height={48} fill="#FFFFFF" stroke={a > 0.5 ? H.amber : H.lineSoft} strokeWidth={a > 0.5 ? 4 : 1.5} /><LogoSvg id="entegris" x={302} y={y + 6} h={36} /></g> : <NamePlate x={290} y={y} w={230} h={48} t={i === 1 ? "中華化" : "三福化"} a={a} px={32} />}
            <text x={540} y={y + 35} style={zh(30, H.text2, 800)} opacity={0.4 + 0.6 * a2}>{what}</text></g>; })}
      </svg>
    </Card>
  );
};

// ── chem-next：下一集研磨墊 ──
const Next: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330, pa = on(f, T(o, "pad")), nx = on(f, T(o, "next")), kw = on(f, T(o, "kw")), ang = f * 2.2;
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        <g opacity={0.45 + 0.55 * pa} transform={`translate(150 ${CT + 124})`}><circle r={86} fill="#9AA3B2" stroke={H.text2} strokeWidth={5} />{[26, 52, 78].map((r) => <circle key={r} r={r} fill="none" stroke="#6E7482" strokeWidth={2} />)}<line x1={0} y1={0} x2={80 * Math.cos((ang * Math.PI) / 180)} y2={80 * Math.sin((ang * Math.PI) / 180)} stroke={RED} strokeWidth={5} /></g>
        <Sep x={300} />
        <Row x={330} y={CT + 56} t="下一集：把晶圓磨平的墊子" c={H.text2} a={nx} /><Row x={330} y={CT + 122} t="研磨墊" c={BLUE} a={pa} /><Row x={330} y={CT + 188} t="留言「化學品」拿完整資料" c={H.amber} a={kw} />
      </svg>
    </Card>
  );
};

export const ChemSection: React.FC<P> = (p0) => {
  const p = { ...p0, k: Math.min(1, (p0 as any).k * 1.5) } as P;   // r1：退場壓到約 4 幀（原 6 幀），換幕不留舊卡殘影
  const kd = String((p.o as any).kind);
  if (kd === "chem-hook") return <Hook {...p} />;
  if (kd === "chem-kinds") return <Kinds {...p} />;
  if (kd === "chem-pool") return <Pool {...p} />;
  if (kd === "chem-path") return <Path {...p} />;
  if (kd === "chem-pipe") return <Pipe {...p} />;
  if (kd === "chem-slurry") return <Slurry {...p} />;
  if (kd === "chem-stir") return <Stir {...p} />;
  if (kd === "chem-co") return <Co {...p} />;
  if (kd === "chem-next") return <Next {...p} />;
  return null;
};

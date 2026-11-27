// 2026/11/27 tech-parts：零組件耗材（系列 2 第 18 集）的 2D 示意卡（overlay `section` 的 kind 以 "parts-" 開頭，Hud.tsx 的 HudSection 轉過來）。
//   parts-hook 接上集｜parts-wave 海浪拍礁石（零件被一層層打薄）｜parts-ring 桌面往外多接一圈（有環／無環的電場等位線）｜parts-esc 摩擦過的氣球黏牆（靜電吸附）｜
//   parts-liner 陶瓷內襯耐電漿、不掉渣｜parts-wear 磨薄、電漿跟著變、要換｜parts-aux 真空泵、閥門、電源輪流亮｜parts-co 東陶（官方 LOGO）、台灣精材、翔名｜parts-next 下一集無塵室。
// 全部示意：不標壽命小時數、市占、營收；只放查證過的說法。時間全部來自 script.json 的 t（cue）。排版同 HudPad：內容從 CARD_CONTENT_TOP 以下、字 ≥30px、字離圖形 ≥6px。
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

// parts-hook：接上集——研磨墊磨壞就換，腔體裡的零件也一樣
const Hook: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330, u = on(f, T(o, "used")), pv = on(f, T(o, "prev")), pd = on(f, T(o, "pad")), pu = Math.sin(f * 0.14) * 0.5 + 0.5;
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        <rect x={30} y={CT + 70} width={110} height={44} fill={CERD} stroke={H.text2} strokeWidth={3} opacity={0.4 + 0.6 * pv} /><text x={85} y={CT + 150} textAnchor="middle" style={zh(30, H.text2, 800)} opacity={0.4 + 0.6 * pv}>研磨墊</text>
        <path d="M150 60 l36 0" transform={`translate(0 ${CT + 22})`} stroke={H.amber} strokeWidth={5} opacity={pv} /><path d={`M186 ${CT + 82} l-10 -8 l0 16 Z`} fill={H.amber} opacity={pv} />
        <rect x={200} y={CT + 52} width={94} height={90} fill="none" stroke={H.text2} strokeWidth={4} opacity={0.4 + 0.6 * u} /><rect x={218} y={CT + 104} width={58} height={20} fill={QZ} stroke={H.text2} strokeWidth={3} opacity={0.4 + 0.6 * u} />
        <text x={226} y={CT + 92} style={zh(52, RED, 900)} opacity={u * (0.6 + 0.4 * pu)}>？</text>
        <Sep x={318} />
        <Row x={344} y={CT + 56} t="腔體裡哪些零件被消耗？" c={BLUE} a={u} />
        <Row x={344} y={CT + 122} t="前一集：研磨墊磨壞就換" c={H.text2} a={pv} />
        <Row x={344} y={CT + 188} t="線索：腔體裡的零件也一樣" c={H.amber} a={pd} />
      </svg>
    </Card>
  );
};
// parts-wave：電漿像海浪拍礁石，零件一層層被打薄
const Wave: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330, pl = on(f, T(o, "plasma")), wv = on(f, T(o, "wave")), rf = on(f, T(o, "reef")), th = on(f, T(o, "thin"), 40);
  const y0 = CT + 210, rh = 70 * (1 - 0.45 * th), ph = f * 0.12;
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        <path d={`M30 ${y0} L80 ${y0 - 6} L150 ${y0 - rh} L230 ${y0 - rh * 0.8} L280 ${y0} Z`} fill={th > 0.5 ? CERD : STEEL} stroke={H.text2} strokeWidth={3} opacity={0.4 + 0.6 * rf} />
        {[0, 1, 2].map((i) => { const dx = ((ph + i * 2.1) % 6.28) / 6.28 * 70; return <path key={i} d={`M${20 + dx} ${y0 - 24 - i * 26} q14 -26 30 -4 q-4 14 -20 14`} fill="none" stroke={PLS} strokeWidth={6} opacity={wv * (0.5 + 0.5 * Math.sin(ph + i))} />; })}
        <text x={34} y={CT + 26} style={zh(30, PLS, 900)} opacity={0.4 + 0.6 * pl}>電漿</text>
        <Sep x={318} />
        <Row x={344} y={CT + 52} t="電漿不停轟擊零件" c={PLS} a={pl} />
        <Row x={344} y={CT + 118} t="像海浪不停拍礁石" c={BLUE} a={wv} />
        <Row x={344} y={CT + 184} t="表面一層層被打薄" c={RED} a={th} />
      </svg>
    </Card>
  );
};
// parts-ring：桌面往外多接一圈——無環時等位線在晶圓邊緣彎折；有環時順著延伸（示意）
const Ring: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330, tb = on(f, T(o, "table")), ex = on(f, T(o, "ext")), ev = on(f, T(o, "even")), y0 = CT + 150;
  const lines = [0, 1, 2].map((i) => i * 26);
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        <rect x={26} y={y0 + 30} width={120} height={22} fill={H.text2} opacity={0.4 + 0.6 * tb} /><text x={26} y={y0 + 88} style={zh(30, H.text2, 800)} opacity={0.4 + 0.6 * tb}>無環</text>
        {lines.map((d, i) => <path key={i} d={`M20 ${y0 - d} L110 ${y0 - d} Q140 ${y0 - d} 160 ${y0 - d + 22 + i * 4}`} fill="none" stroke={RED} strokeWidth={5} opacity={0.3 + 0.7 * ev} />)}
        <rect x={180} y={y0 + 30} width={120} height={22} fill={H.text2} opacity={0.4 + 0.6 * tb} /><rect x={300} y={y0 + 30} width={10} height={22} fill={QZ} stroke={H.text2} strokeWidth={2} opacity={ex} /><rect x={296} y={y0 + 30} width={0} height={0} />
        <rect x={304} y={y0 + 30} width={0} height={0} />
        <text x={190} y={y0 + 88} style={zh(30, OK, 900)} opacity={0.4 + 0.6 * ex}>有環</text>
        {lines.map((d, i) => <path key={i} d={`M170 ${y0 - d} L318 ${y0 - d}`} fill="none" stroke={OK} strokeWidth={5} opacity={0.3 + 0.7 * ev} />)}
        <Sep x={338} />
        <Row x={364} y={CT + 52} t="像把桌面往外多接" c={H.text2} a={tb} />
        <Row x={364} y={CT + 118} t="電場順著環一路延伸" c={BLUE} a={ex} />
        <Row x={364} y={CT + 184} t="邊緣電漿才會均勻" c={OK} a={ev} />
      </svg>
    </Card>
  );
};
// parts-esc：摩擦過的氣球黏牆；盤內電極通電，盤面與晶圓底面出現相反電荷
const Esc: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330, li = on(f, T(o, "lie")), cl = on(f, T(o, "clamp")), bl = on(f, T(o, "balloon")), ce = on(f, T(o, "cer")), y0 = CT + 140;
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        <rect x={26} y={y0 - 40} width={16} height={130} fill={H.text2} opacity={0.4 + 0.6 * bl} />
        <circle cx={90} cy={y0 + 10} r={32} fill="#F29A9A" stroke={H.text2} strokeWidth={3} opacity={bl} />
        {[0, 1, 2].map((i) => <circle key={i} cx={76 + i * 14} cy={y0 + 12} r={6} fill={i % 2 ? RED : BLUE} opacity={bl} />)}
        <rect x={196} y={y0 + 6} width={118} height={10} fill={STEEL} opacity={0.4 + 0.6 * li} />
        <rect x={190} y={y0 + 40} width={130} height={26} fill={CER} stroke={H.text2} strokeWidth={3} opacity={0.4 + 0.6 * ce} /><rect x={190} y={y0 + 70} width={130} height={14} fill="#C47B3E" opacity={0.4 + 0.6 * cl} />
        {[0, 1, 2, 3].map((i) => <circle key={i} cx={212 + i * 28} cy={y0 + 28} r={6} fill={BLUE} opacity={cl} />)}
        {[0, 1, 2, 3].map((i) => <circle key={i} cx={212 + i * 28} cy={y0 + 53} r={6} fill={RED} opacity={cl} />)}
        <Sep x={338} />
        <Row x={364} y={CT + 44} t="晶圓躺在吸盤上" c={H.text2} a={li} />
        <Row x={364} y={CT + 100} t="紅藍電荷：相反互相吸" c={BLUE} a={cl} />
        <Row x={364} y={CT + 156} t="像摩擦過的氣球黏牆" c={H.amber} a={bl} />
        <Row x={364} y={CT + 212} t="吸盤表面是陶瓷" c={OK} a={ce} />
      </svg>
    </Card>
  );
};
// parts-liner：陶瓷內襯，耐電漿、不容易掉渣（左：金屬被打出碎屑；右：陶瓷平整）
const Liner: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330, wl = on(f, T(o, "wall")), rs = on(f, T(o, "resist")), sh = on(f, T(o, "shed")), y0 = CT + 120;
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        <rect x={30} y={y0 + 40} width={120} height={40} fill={STEEL} stroke={H.text2} strokeWidth={3} opacity={0.4 + 0.6 * wl} />
        {[0, 1, 2].map((i) => { const u = fr(f * 0.02 + i / 3); return <circle key={i} cx={60 + i * 26 + u * 14} cy={y0 + 34 - u * 50} r={5} fill={H.text} opacity={sh * (1 - u * 0.5)} />; })}
        <rect x={180} y={y0 + 40} width={120} height={40} fill={STEEL} stroke={H.text2} strokeWidth={3} opacity={0.4 + 0.6 * wl} /><rect x={180} y={y0 + 22} width={120} height={18} fill={CER} stroke={H.text2} strokeWidth={3} opacity={0.4 + 0.6 * rs} />
        {[0, 1, 2, 3].map((i) => <path key={i} d={`M${200 + i * 28} ${y0 - 24} l0 36`} stroke={ION} strokeWidth={5} opacity={0.4 + 0.6 * rs} />)}
        <text x={30} y={y0 + 120} style={zh(30, H.text2, 800)} opacity={0.4 + 0.6 * sh}>金屬</text><text x={180} y={y0 + 120} style={zh(30, OK, 900)} opacity={0.4 + 0.6 * rs}>陶瓷內襯</text>
        <Sep x={338} />
        <Row x={364} y={CT + 52} t="內壁貼一層陶瓷" c={H.amber} a={wl} />
        <Row x={364} y={CT + 118} t="耐電漿，表面平整" c={BLUE} a={rs} />
        <Row x={364} y={CT + 184} t="不容易掉渣、少微粒" c={OK} a={sh} />
      </svg>
    </Card>
  );
};
// parts-wear：磨薄 → 尺寸變 → 電漿跟著變 → 用一段時間就要換（新環高、舊環約六成高）
const Wear: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330, sl = on(f, T(o, "slow"), 30), sz = on(f, T(o, "size")), pl = on(f, T(o, "plasma")), sw = on(f, T(o, "swap")), y0 = CT + 190;
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        <rect x={30} y={y0 - 100} width={100} height={100} fill={QZ} stroke={H.text2} strokeWidth={3} opacity={0.4 + 0.6 * sl} />
        <rect x={190} y={y0 - 100 * (1 - 0.4 * sl)} width={100} height={100 * (1 - 0.4 * sl)} fill={CERD} stroke={H.text2} strokeWidth={3} opacity={0.4 + 0.6 * sz} />
        <path d={`M140 ${y0 - 50} l40 0`} stroke={H.amber} strokeWidth={5} opacity={sl} /><path d={`M182 ${y0 - 50} l-10 -8 l0 16 Z`} fill={H.amber} opacity={sl} />
        <text x={30} y={y0 + 38} style={zh(30, H.text2, 800)}>新環</text><text x={190} y={y0 + 38} style={zh(30, H.text2, 800)}>舊環</text>
        <Sep x={318} />
        <Row x={344} y={CT + 44} t="被電漿慢慢打薄" c={H.text2} a={sl} />
        <Row x={344} y={CT + 100} t="尺寸變，電漿跟著變" c={PLS} a={Math.max(sz, pl)} />
        <Row x={344} y={CT + 156} t="用一段時間就要換" c={H.amber} a={sw} />
        <g opacity={0.3 + 0.7 * sw}><circle cx={374} cy={CT + 212} r={16} fill={RED} /><rect x={366} y={CT + 204} width={16} height={16} fill="#FFFFFF" /></g>
      </svg>
    </Card>
  );
};
// parts-aux：真空泵、閥門、射頻電源輪流亮
const Aux: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330, a = [on(f, T(o, "pump")), on(f, T(o, "valve")), on(f, T(o, "power"))], sv = on(f, T(o, "serv")), y0 = CT + 120;
  const st = (i: number) => ({ stroke: a[i] > 0.5 ? H.amber : H.text2, strokeWidth: a[i] > 0.5 ? 5 : 3 });
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        <rect x={26} y={y0} width={90} height={90} fill="#C4D2E6" {...st(0)} opacity={0.5 + 0.5 * a[0]} /><circle cx={71} cy={y0 - 22} r={20} fill="none" {...st(0)} />
        <rect x={140} y={y0 + 34} width={70} height={22} fill="#C4D2E6" {...st(1)} opacity={0.5 + 0.5 * a[1]} /><circle cx={175} cy={y0 + 10} r={22} fill="none" {...st(1)} /><path d={`M175 ${y0 + 34} l0 -4`} {...st(1)} />
        <rect x={232} y={y0 - 10} width={76} height={100} fill="#F3F5F8" {...st(2)} opacity={0.5 + 0.5 * a[2]} /><rect x={244} y={y0} width={52} height={26} fill={BLUE} opacity={0.4 + 0.6 * a[2]} />
        <Sep x={338} />
        <Row x={364} y={CT + 44} t="真空泵" c={BLUE} a={a[0]} /><Row x={364} y={CT + 100} t="閥門" c={H.amber} a={a[1]} /><Row x={364} y={CT + 156} t="射頻電源" c={BLUE} a={a[2]} />
        <Row x={364} y={CT + 222} t="都要定期保養" c={OK} a={sv} />
      </svg>
    </Card>
  );
};
// parts-co：東陶（官網原檔 LOGO 以 Wikimedia Commons 原檔）、台灣精材、翔名；國旗＋台灣輪廓
const Co: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 392, jp = on(f, T(o, "jp")), to = on(f, T(o, "toto")), tw = on(f, T(o, "tw")), xm = on(f, T(o, "xm")), y = (i: number) => CT + 14 + i * 90;
  const lh = 40, lw = Math.round((lh * 58) / 13);
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        <FlagBox code="JP" x={26} y={y(0) + 8} a={Math.max(jp, to)} />
        <g><rect x={92} y={y(0)} width={lw + 24} height={lh + 14} fill="#FFFFFF" stroke={to > 0.5 ? H.amber : H.lineSoft} strokeWidth={to > 0.5 ? 4 : 1.5} /><LogoSvg id="toto" x={104} y={y(0) + 7} h={lh} /></g>
        <text x={92 + lw + 44} y={y(0) + 40} style={zh(30, H.text, 800)} opacity={0.4 + 0.6 * to}>靜電吸盤 1988 年量產</text>
        <FlagBox code="TW" x={26} y={y(1) + 8} a={tw} /><NamePlate x={92} y={y(1)} w={330} h={54} t="台灣精材 3467" a={tw} />
        <text x={442} y={y(1) + 40} style={zh(30, H.text, 800)} opacity={0.4 + 0.6 * tw}>陶瓷、石英、矽耗材</text>
        <FlagBox code="TW" x={26} y={y(2) + 8} a={xm} /><NamePlate x={92} y={y(2)} w={330} h={54} t="翔名 8091" a={xm} />
        <text x={442} y={y(2) + 40} style={zh(30, H.text, 800)} opacity={0.4 + 0.6 * xm}>蝕刻、離子佈植耗材</text>
        <text x={26} y={y(3) + 22} style={zh(30, H.text2, 800)} opacity={0.4 + 0.6 * Math.max(tw, xm)}>少數幾家，不排名；非靜電吸盤供應名單</text>
        <path d={twPath(850, 110, 40)} fill={tw > 0.5 || xm > 0.5 ? H.amber : H.lineSoft} opacity={0.5} />
      </svg>
    </Card>
  );
};
// parts-next：下一集無塵室
const Next: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330, nx = on(f, T(o, "next")), cl = on(f, T(o, "clean")), kw = on(f, T(o, "kw"));
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        <rect x={30} y={CT + 40} width={260} height={150} fill="none" stroke={H.text2} strokeWidth={4} opacity={0.4 + 0.6 * cl} />
        {Array.from({ length: 5 }, (_, i) => <rect key={i} x={40 + i * 50} y={CT + 46} width={40} height={10} fill={H.amber} opacity={0.4 + 0.6 * cl} />)}
        {Array.from({ length: 6 }, (_, i) => { const u = fr(f * 0.02 + i / 6); return <circle key={i} cx={60 + i * 40} cy={CT + 70 + u * 100} r={5} fill={BLUE} opacity={cl * 0.8} />; })}
        <rect x={120} y={CT + 130} width={90} height={56} fill="#C4D2E6" stroke={H.text2} strokeWidth={3} opacity={0.4 + 0.6 * cl} />
        <Sep x={318} />
        <Row x={344} y={CT + 56} t="下一集：無塵室" c={H.text2} a={nx} />
        <Row x={344} y={CT + 122} t="零件和機台都在裡面" c={BLUE} a={cl} />
        <Row x={344} y={CT + 188} t="留言「耗材」拿完整資料" c={H.amber} a={kw} />
      </svg>
    </Card>
  );
};
export const PartsSection: React.FC<P> = (p) => {
  const kd = String((p.o as any).kind);
  if (kd === "parts-hook") return <Hook {...p} />; if (kd === "parts-wave") return <Wave {...p} />; if (kd === "parts-ring") return <Ring {...p} />; if (kd === "parts-esc") return <Esc {...p} />;
  if (kd === "parts-liner") return <Liner {...p} />; if (kd === "parts-wear") return <Wear {...p} />; if (kd === "parts-aux") return <Aux {...p} />; if (kd === "parts-co") return <Co {...p} />; if (kd === "parts-next") return <Next {...p} />;
  return null;
};

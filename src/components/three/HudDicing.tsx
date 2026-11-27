// 2026/11/27 tech-dicing：晶圓切割與薄化（系列 3 第 1 集）的 2D 示意卡（overlay `section` 的 kind 以 "dc-" 開頭，Hud.tsx 的 HudSection 轉過來）。
//   dc-hook 接前一集：晶圓測完了，怎麼切開｜dc-saw 不能拿鋸子（硬又脆、走道窄）｜dc-hoop 刺繡框：膠膜繃在鐵框｜dc-blade 淋水切磁磚（DISCO 官方規格最高 60,000 min⁻¹）｜
//   dc-chip 越薄越容易崩角（厚 vs 薄）｜dc-stealth 雷射焦點在晶圓裡面、改質層｜dc-expand 掰巧克力：膠膜撐開、晶片分開｜dc-thin 為什麼要磨薄（疊高度）｜
//   dc-grind 正面貼膠帶、翻面、先粗後細｜dc-tsv 電梯井：銅柱貫穿堆疊｜dc-co 三家（國旗＋文字名牌）｜dc-next 下一集封裝打線。
// 全部示意：除了念稿的兩個數字（轉速、厚度量級）不標尺寸。結構一開始就畫出，念到時該處亮起、動起來；時間全部來自 script.json 的 t（cue）。
// 排版原則（card-overlap.mjs 檢查）：內容從 CARD_CONTENT_TOP 以下；字不放進會動的圖形範圍；字 ≥30px；字離圖形 ≥6px。
// 公司 LOGO：DISCO、鈦昇、昇陽半導體官方原檔當天抓不到（見 videos/tech-dicing/assets.md），一律用白底深色文字名牌（不仿商標）＋國旗，國旗與名牌 100% 不透明。
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
const RED = "#E0472F", OK = "#14A38B", BLUE = "#2F7FE0", GRY = "#98A2B3", SI = "#5E6B82", SIL = "#8D9AB4", TAPE = "#A8D0EE", FRAME = "#9AA7BB", CU = "#C77B3C", CIRC = "#2F4E86", WATER = "#5FB8E8", LASER = "#E0473A", CHOC = "#7A4A2A", CHOCL = "#9B6640", CLOTH = "#F3E8CD", WOOD = "#C9A66B", TILE = "#E8EEF5";
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
// 晶圓俯視（格線＝走道）：cx, cy, r；cut＝已切的道數（由上往下）
const WaferTop: React.FC<{ cx: number; cy: number; r: number; cut: number; a?: number }> = ({ cx, cy, r, cut, a = 1 }) => {
  const g = 22, n = Math.floor(r / g);
  return (
    <g opacity={a}>
      <circle cx={cx} cy={cy} r={r} fill={SIL} stroke={H.text2} strokeWidth={3} />
      {Array.from({ length: 2 * n + 1 }, (_, i) => { const d = (i - n) * g, h = Math.sqrt(Math.max(0, r * r - d * d)); return <g key={i}><line x1={cx - h} y1={cy + d} x2={cx + h} y2={cy + d} stroke={i < cut ? "#1C2333" : "#C3CDDD"} strokeWidth={i < cut ? 4 : 2} /><line x1={cx + d} y1={cy - h} x2={cx + d} y2={cy + h} stroke="#C3CDDD" strokeWidth={2} /></g>; })}
    </g>
  );
};

// ── dc-hook：前一集晶圓測完了；一片晶圓怎麼切成一顆顆？（左圖：晶圓俯視，切痕一道道出現） ──
const Hook: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330, q = on(f, T(o, "q")), pv = on(f, T(o, "prev")), dn = on(f, T(o, "done")), pu = Math.sin(f * 0.14) * 0.5 + 0.5;
  const cut = Math.min(9, Math.floor(Math.max(0, f - T(o, "q")) / 12));
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        <WaferTop cx={160} cy={CT + 120} r={108} cut={cut} />
        
        <Sep x={318} />
        <Row x={344} y={CT + 56} t="一片晶圓，怎麼切成一顆顆？" c={BLUE} a={q} />
        <Row x={344} y={CT + 122} t="前一集：晶圓測完了" c={H.text2} a={pv} />
        <Row x={344} y={CT + 188} t="現在往下游：切割與薄化" c={H.amber} a={dn} />
      </svg>
    </Card>
  );
};

// ── dc-saw：鋸子✗：矽硬又脆（一碰就裂）、晶片間的走道很窄 ──
const Saw: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330, sw = on(f, T(o, "saw")), hd = on(f, T(o, "hard")), st = on(f, T(o, "street"));
  const y0 = CT + 150;
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        <rect x={26} y={y0} width={128} height={70} fill={SI} stroke={H.text2} strokeWidth={3} /><rect x={166} y={y0} width={128} height={70} fill={SI} stroke={H.text2} strokeWidth={3} />
        <rect x={154} y={y0} width={12} height={70} fill={st > 0.5 ? H.amber : "#C3CDDD"} />
        <g transform={`translate(0 ${-30 * (1 - sw)})`} opacity={0.4 + 0.6 * sw}>
          <path d={`M110 ${y0 - 10} ${Array.from({ length: 6 }, (_, i) => `l9 -16 l9 16`).join(" ")} L210 ${y0 - 60} L110 ${y0 - 60} Z`} fill="#B7BFCB" stroke={H.text2} strokeWidth={3} />
        </g>
        <path d={`M160 ${y0 + 4} l-16 18 l8 10 l-22 24 M160 ${y0 + 4} l18 16 l-6 12 l24 22`} fill="none" stroke={RED} strokeWidth={5} opacity={hd} />
        <g opacity={sw}><line x1={250} y1={CT + 20} x2={298} y2={CT + 68} stroke={RED} strokeWidth={10} /><line x1={298} y1={CT + 20} x2={250} y2={CT + 68} stroke={RED} strokeWidth={10} /></g>
        <Sep x={334} />
        <Row x={360} y={CT + 52} t="不能拿鋸子" c={RED} a={sw} />
        <Row x={360} y={CT + 118} t="矽又硬又脆：一碰就裂" c={H.amber} a={hd} />
        <Row x={360} y={CT + 184} t="晶片間的走道很窄" c={BLUE} a={st} />
      </svg>
    </Card>
  );
};

// ── dc-hoop：刺繡框（布繃在圈裡）＝膠膜繃在鐵框、晶圓貼在中間 ──
const Hoop: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330, tp = on(f, T(o, "tape")), fm = on(f, T(o, "frame")), hp = on(f, T(o, "hoop"));
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        <g opacity={0.35 + 0.65 * Math.max(tp, fm)}>
          <circle cx={92} cy={CT + 110} r={64} fill={TAPE} stroke={FRAME} strokeWidth={fm > 0.5 ? 14 : 8} />
          <circle cx={92} cy={CT + 110} r={38} fill={SIL} stroke={H.text2} strokeWidth={2} opacity={tp} />
        </g>
        <text x={92} y={CT + 214} textAnchor="middle" style={zh(30, H.text2, 800)}>晶圓＋膠膜</text>
        <g opacity={0.35 + 0.65 * hp}>
          <circle cx={250} cy={CT + 110} r={54} fill={CLOTH} stroke={WOOD} strokeWidth={12} />
          <path d={`M224 ${CT + 104} q12 -18 26 0 q12 18 26 0`} fill="none" stroke={RED} strokeWidth={4} />
        </g>
        <text x={250} y={CT + 214} textAnchor="middle" style={zh(30, H.text2, 800)}>刺繡框</text>
        <Sep x={334} />
        <Row x={360} y={CT + 52} t="晶圓先貼在膠膜" c={BLUE} a={tp} />
        <Row x={360} y={CT + 118} t="膠膜繃在鐵框" c={H.text2} a={fm} />
        <Row x={360} y={CT + 184} t="像繃好的刺繡布：切完不散" c={OK} a={hp} />
      </svg>
    </Card>
  );
};

// ── dc-blade：比頭髮還薄的鑽石刀片＋淋水＝切磁磚 ──
const Blade: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330, hr = on(f, T(o, "hair")), bl = on(f, T(o, "blade")), rp = on(f, T(o, "rpm")), tl = on(f, T(o, "tile"));
  const a = f * 0.5 * rp, cx = 110, cy = CT + 112;
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        <rect x={20} y={CT + 196} width={290} height={30} fill={TILE} stroke={H.text2} strokeWidth={3} opacity={0.4 + 0.6 * tl} />
        <g opacity={0.4 + 0.6 * bl}>
          <circle cx={cx} cy={cy} r={78} fill="#6B7385" stroke="#BFEFFF" strokeWidth={6} />
          <circle cx={cx} cy={cy} r={34} fill="#C3CBD8" stroke={H.text2} strokeWidth={2} />
          <line x1={cx} y1={cy} x2={cx + 70 * Math.cos(a)} y2={cy + 70 * Math.sin(a)} stroke={RED} strokeWidth={6} />
        </g>
        {[0, 1, 2, 3, 4].map((i) => { const u = fr(f * 0.03 + i / 5); return <circle key={i} cx={210 - 30 * u + 60 * u * u} cy={CT + 60 + 130 * u} r={6} fill={WATER} opacity={tl * (1 - 0.5 * u)} />; })}
        <path d={`M230 ${CT + 40} l40 0 l0 20`} fill="none" stroke={GRY} strokeWidth={8} opacity={0.4 + 0.6 * tl} />
        <Sep x={334} />
        <Row x={360} y={CT + 48} t="比頭髮還薄" c={H.text2} a={hr} />
        <Row x={360} y={CT + 104} t="鑽石刀片" c={BLUE} a={bl} />
        <Row x={360} y={CT + 160} t="每分鐘最高轉六萬圈" c={H.amber} a={rp} />
        <Row x={360} y={CT + 216} t="淋水沖走碎屑，像切磁磚" c={OK} a={tl} />
      </svg>
    </Card>
  );
};

// ── dc-chip：厚晶圓切口整齊、薄晶圓背面崩角 ──
const Chip: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330, th = on(f, T(o, "thin")), ch = on(f, T(o, "chip"));
  const y0 = CT + 200;
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        <rect x={24} y={y0 - 110} width={56} height={110} fill={SI} stroke={H.text2} strokeWidth={3} /><rect x={90} y={y0 - 110} width={56} height={110} fill={SI} stroke={H.text2} strokeWidth={3} />
        <text x={85} y={y0 + 40} textAnchor="middle" style={zh(30, H.text2, 800)}>厚：整齊</text>
        <g opacity={0.4 + 0.6 * th}><rect x={180} y={y0 - 30} width={58} height={30} fill={SI} stroke={H.text2} strokeWidth={3} /><rect x={248} y={y0 - 30} width={58} height={30} fill={SI} stroke={H.text2} strokeWidth={3} /></g>
        <g opacity={ch}><path d={`M238 ${y0} l-10 0 l6 -10 Z M248 ${y0} l12 0 l-7 -12 Z`} fill={RED} />{[0, 1, 2].map((i) => <rect key={i} x={226 + i * 12} y={y0 + 8 + i * 10 + 20 * fr(f * 0.02 + i / 3)} width={8} height={6} fill={RED} />)}</g>
        <text x={243} y={y0 + 40} textAnchor="middle" style={zh(30, H.text2, 800)}>薄：崩角</text>
        <Sep x={334} />
        <Row x={360} y={CT + 52} t="晶圓越薄，越脆弱" c={H.text2} a={th} />
        <Row x={360} y={CT + 118} t="切口邊緣崩出缺角" c={RED} a={ch} />
        <Row x={360} y={CT + 184} t="背面最容易崩" c={H.amber} a={ch} />
      </svg>
    </Card>
  );
};

// ── dc-stealth：雷射焦點在晶圓「裡面」，畫出一排看不見的改質點；表面不開槽 ──
const Stealth: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330, sd = on(f, T(o, "sd")), ins = on(f, T(o, "inside")), cr = on(f, T(o, "crack"));
  const y0 = CT + 150, n = Math.min(10, Math.floor(Math.max(0, f - T(o, "inside")) / 6));
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        <rect x={24} y={y0} width={286} height={80} fill={SIL} stroke={H.text2} strokeWidth={3} opacity={0.6} />
        <g opacity={sd}><rect x={70 + n * 22} y={CT + 6} width={30} height={40} fill={GRY} /><path d={`M${85 + n * 22 - 16} ${CT + 46} L${85 + n * 22} ${y0 + 40} L${85 + n * 22 + 16} ${CT + 46} Z`} fill={LASER} opacity={0.45} /></g>
        {Array.from({ length: n }, (_, i) => <circle key={i} cx={85 + i * 22} cy={y0 + 40} r={6} fill={LASER} opacity={ins} />)}
        {Array.from({ length: n }, (_, i) => <line key={i} x1={85 + i * 22} y1={y0 + 6} x2={85 + i * 22} y2={y0 + 74} stroke={RED} strokeWidth={2} opacity={cr} />)}
        <Sep x={334} />
        <Row x={360} y={CT + 52} t="雷射隱形切割" c={LASER} a={sd} />
        <Row x={360} y={CT + 118} t="焦點在晶圓裡面，表面不切開" c={BLUE} a={ins} />
        <Row x={360} y={CT + 184} t="畫出一排看不見的裂痕" c={H.amber} a={cr} />
        <Row x={360} y={CT + 244} t="乾式，沒有碎屑" c={OK} a={cr} />
      </svg>
    </Card>
  );
};

// ── dc-expand：膠膜撐開 → 晶片沿裂痕分開＝掰巧克力 ──
const Expand: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330, ex = on(f, T(o, "exp"), 30), sp = on(f, T(o, "split")), cc = on(f, T(o, "choc"));
  const g = 4 + 10 * ex;
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        <rect x={20} y={CT + 20} width={150} height={150} fill={TAPE} stroke={FRAME} strokeWidth={6} />
        {[0, 1, 2].map((i) => [0, 1, 2].map((j) => <rect key={`${i}${j}`} x={95 + (i - 1) * (36 + g) - 18} y={CT + 95 + (j - 1) * (36 + g) - 18} width={36} height={36} fill={SI} stroke={H.text2} strokeWidth={2} />))}
        <g opacity={0.35 + 0.65 * cc}>
          <rect x={194} y={CT + 46} width={50} height={110} fill={CHOC} /><rect x={244 + 10 * cc} y={CT + 46} width={50} height={110} fill={CHOC} transform={`rotate(${8 * cc} 244 156)`} />
          {[0, 1].map((j) => <line key={j} x1={194} y1={CT + 82 + j * 37} x2={294} y2={CT + 82 + j * 37} stroke={CHOCL} strokeWidth={3} />)}
        </g>
        <text x={244} y={CT + 214} textAnchor="middle" style={zh(30, H.text2, 800)}>掰巧克力</text>
        <Sep x={334} />
        <Row x={360} y={CT + 52} t="把膠膜往外撐開" c={BLUE} a={ex} />
        <Row x={360} y={CT + 118} t="晶片沿裂痕分開" c={H.amber} a={sp} />
        <Row x={360} y={CT + 184} t="像掰巧克力：沿著刻痕斷" c={OK} a={cc} />
      </svg>
    </Card>
  );
};

// ── dc-thin：同一個封裝高度，厚晶片疊三層就爆框、磨薄的能疊好幾層 ──
const Thin: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330, wy = on(f, T(o, "why")), st = on(f, T(o, "stack")), mm = on(f, T(o, "mm")), hr = on(f, T(o, "hair"));
  const y0 = CT + 190, Hb = 150;
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        {[30, 180].map((x) => <rect key={x} x={x} y={y0 - Hb} width={110} height={Hb} fill="none" stroke={H.amber} strokeWidth={3} strokeDasharray="10 6" />)}
        {[0, 1, 2].map((i) => <rect key={i} x={40} y={y0 - (i + 1) * 58} width={90} height={54} fill={i === 2 ? RED : SI} stroke={H.text2} strokeWidth={2} opacity={0.4 + 0.6 * st} />)}
        {Array.from({ length: 8 }, (_, i) => <rect key={i} x={190} y={y0 - (i + 1) * 18} width={90} height={15} fill={SI} stroke={H.text2} strokeWidth={2} opacity={0.3 + 0.7 * hr} />)}
        <text x={85} y={y0 + 36} textAnchor="middle" style={zh(30, H.text2, 800)}>厚：疊不下</text><text x={235} y={y0 + 36} textAnchor="middle" style={zh(30, H.text2, 800)}>薄：疊得進</text>
        <Sep x={334} />
        <Row x={360} y={CT + 48} t="為什麼要磨薄？" c={H.text2} a={wy} />
        <Row x={360} y={CT + 104} t="晶片要疊好幾層" c={BLUE} a={st} />
        <Row x={360} y={CT + 160} t="晶圓快一公釐厚" c={H.amber} a={mm} />
        <Row x={360} y={CT + 216} t="得磨到比頭髮還薄" c={OK} a={hr} />
      </svg>
    </Card>
  );
};

// ── dc-grind：正面貼膠帶 → 翻過來 → 鑽石砂輪磨背面，先粗後細 ──
const Grind: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330, tp = on(f, T(o, "tape")), fl = on(f, T(o, "flip"), 16), wh = on(f, T(o, "wheel")), co = on(f, T(o, "coarse")), fi = on(f, T(o, "fine"));
  const th = 44 * (1 - 0.45 * co - 0.3 * fi), y0 = CT + 200;
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        <rect x={40} y={y0} width={240} height={14} fill={GRY} />
        <g transform={`translate(160 ${y0 - 30}) scale(1 ${1 - 2 * Math.min(1, fl)}) translate(-160 ${-(y0 - 30)})`} opacity={0.4 + 0.6 * tp}>
          <rect x={60} y={y0 - th} width={200} height={th} fill={SI} stroke={H.text2} strokeWidth={2} /><rect x={60} y={y0} width={200} height={10} fill="#EAF2FA" stroke={H.text2} strokeWidth={2} />
        </g>
        <g opacity={0.4 + 0.6 * wh}><rect x={110} y={CT + 30} width={100} height={36} fill="#8C97AB" stroke={H.text2} strokeWidth={2} />{[0, 1, 2, 3, 4].map((i) => <rect key={i} x={114 + i * 20} y={CT + 66} width={14} height={12} fill={fi > 0.5 ? "#BFEFFF" : "#D8DEE8"} stroke={H.text2} strokeWidth={1.5} />)}</g>
        <Sep x={334} />
        <Row x={360} y={CT + 48} t="正面貼保護膠帶" c={BLUE} a={tp} />
        <Row x={360} y={CT + 104} t="翻過來，背面朝上" c={H.text2} a={fl} />
        <Row x={360} y={CT + 160} t="鑽石砂輪磨背面" c={H.amber} a={wh} />
        <Row x={360} y={CT + 216} t="先粗磨、再細磨" c={OK} a={Math.max(co, fi)} />
      </svg>
    </Card>
  );
};

// ── dc-tsv：磨薄露出銅柱（矽穿孔）；像電梯井，貫穿疊起來的晶片 ──
const Tsv: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330, cu = on(f, T(o, "cu")), ts = on(f, T(o, "tsv")), lf = on(f, T(o, "lift")), th = on(f, T(o, "thru"));
  const y0 = CT + 226;
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        {[0, 1, 2, 3].map((i) => <rect key={i} x={30} y={y0 - (i + 1) * 40} width={130} height={34} fill={SI} stroke={H.text2} strokeWidth={2} />)}
        {[62, 128].map((x) => <rect key={x} x={x - 6} y={y0 - 160} width={12} height={160} fill={CU} opacity={0.4 + 0.6 * cu} />)}
        {[62, 128].map((x, i) => { const u = fr(f * 0.02 + i / 2); return <circle key={x} cx={x} cy={y0 - 160 + 160 * u} r={7} fill="#F2B632" opacity={th} />; })}
        <g opacity={0.35 + 0.65 * lf}>{[0, 1, 2, 3].map((i) => <rect key={i} x={190} y={y0 - (i + 1) * 40} width={110} height={36} fill="#FFFFFF" stroke={H.text2} strokeWidth={2} />)}<rect x={232} y={y0 - 160} width={26} height={160} fill="#C9D2DE" stroke={H.text2} strokeWidth={2} /><rect x={236} y={y0 - 70 - 60 * fr(f * 0.01)} width={18} height={22} fill={H.amber} /></g>
        <Sep x={334} />
        <Row x={360} y={CT + 48} t="磨到最後，露出銅柱" c={H.amber} a={cu} />
        <Row x={360} y={CT + 104} t="叫矽穿孔（TSV）" c={BLUE} a={ts} />
        <Row x={360} y={CT + 160} t="像大樓的電梯井" c={H.text2} a={lf} />
        <Row x={360} y={CT + 216} t="貫穿疊起來的晶片" c={OK} a={th} />
      </svg>
    </Card>
  );
};

// ── dc-co：日本迪思科（切割研磨機）、台灣鈦昇（雷射切割）、昇陽半導體（薄化代工） ──
const Co: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 392, jp = on(f, T(o, "jp")), bt = on(f, T(o, "btl")), ps = on(f, T(o, "psi"));
  const rows: [string, string, string, number][] = [["JP", "DISCO 迪思科", "切割機、研磨機、刀片", jp], ["TW", "鈦昇 8027", "雷射切割設備", bt], ["TW", "昇陽半導體 8028", "晶圓薄化代工", ps]];
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        <text x={30} y={CT + 34} style={zh(32, H.text2, 900)}>不排名、不講市占（各家說法不一）</text>
        {rows.map(([c, n, s, a], i) => <g key={n}><FlagBox code={c} x={30} y={CT + 62 + i * 96} a={a} /><NamePlate x={98} y={CT + 56 + i * 96} w={330} h={50} t={n} a={a} px={32} />
          <text x={448} y={CT + 92 + i * 96} style={zh(30, H.text2, 800)} opacity={0.4 + 0.6 * a}>{s}</text></g>)}
      </svg>
    </Card>
  );
};

// ── dc-next：下一集封裝打線 ──
const Next: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330, dn = on(f, T(o, "done")), nx = on(f, T(o, "next")), wr = on(f, T(o, "wire"), 20), kw = on(f, T(o, "kw"));
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        <rect x={20} y={CT + 170} width={290} height={40} fill="#3F7A55" />
        <rect x={100} y={CT + 120} width={130} height={50} fill={SI} stroke={H.text2} strokeWidth={2} opacity={0.4 + 0.6 * dn} />
        {[0, 1, 2].map((i) => <path key={i} d={`M${112 + i * 50} ${CT + 124} q-30 -50 -70 46`} fill="none" stroke="#E7B341" strokeWidth={4} strokeDasharray="10 8" opacity={wr} />)}
        <text x={260} y={CT + 100} style={zh(60, RED, 900)} opacity={dn * (1 - wr)}>？</text>
        <Sep x={334} />
        <Row x={360} y={CT + 56} t="晶片切好了，電怎麼接出來？" c={H.text2} a={dn} />
        <Row x={360} y={CT + 122} t="下一集：封裝打線" c={BLUE} a={nx} />
        <Row x={360} y={CT + 188} t="留言「切割」拿完整資料" c={H.amber} a={kw} />
      </svg>
    </Card>
  );
};

export const DicingSection: React.FC<P> = (p) => {
  const kd = String((p.o as any).kind);
  if (kd === "dc-hook") return <Hook {...p} />;
  if (kd === "dc-saw") return <Saw {...p} />;
  if (kd === "dc-hoop") return <Hoop {...p} />;
  if (kd === "dc-blade") return <Blade {...p} />;
  if (kd === "dc-chip") return <Chip {...p} />;
  if (kd === "dc-stealth") return <Stealth {...p} />;
  if (kd === "dc-expand") return <Expand {...p} />;
  if (kd === "dc-thin") return <Thin {...p} />;
  if (kd === "dc-grind") return <Grind {...p} />;
  if (kd === "dc-tsv") return <Tsv {...p} />;
  if (kd === "dc-co") return <Co {...p} />;
  if (kd === "dc-next") return <Next {...p} />;
  return null;
};

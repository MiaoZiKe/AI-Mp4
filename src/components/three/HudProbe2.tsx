// 2026/11/27 tech-probe2：探針卡-2 誰在做（系列 2 第 22 集收尾）的 2D 示意卡（overlay `section` 的 kind 以 "probe2-" 開頭，Hud.tsx 的 HudSection 轉過來）。
//   probe2-hook 接上集：一張卡好幾萬根針，誰做得出來｜probe2-ff 少數幾家主導、FormFactor 探針卡約占 2025 營收八成｜probe2-pin 一萬個圖釘壓進軟木板：高度差、壓不到、針彈性超壓｜
//   probe2-mpi 台灣旺矽：垂直式與懸臂式（公司說法，媒體轉述）｜probe2-chpt 中華精測：探針卡＋測試板，客戶多為手機與 AI 晶片大廠（媒體）｜
//   probe2-wear 像鉛筆越寫越短：耗材、清針、換針｜probe2-ai AI 晶片腳數多、間距小，台廠追趕（TrendForce）｜probe2-recap 系列 2 收尾：設備、材料、廠務、測試｜probe2-next 系列 3 預告＋留言關鍵字。
// 全部示意：不標針數、針壓、壽命、市占百分比；只放 research.md 查證過的說法。結構一開始就畫出，念到時該處亮起；時間全部來自 script.json 的 t（cue）。
// 排版原則（card-overlap.mjs 檢查）：內容從 CARD_CONTENT_TOP 以下；字不放進會動的圖形範圍；字 ≥30px；字離圖形 ≥6px。
// 公司 LOGO：FormFactor、旺矽、中華精測的官方原檔，Wikimedia Commons 查無、官網與維基百科本環境連不上（見 videos/tech-probe2/assets.md），一律白底深色文字名牌（不仿商標）＋國旗；國旗與名牌 100% 不透明（不放進 opacity 群組）。
// 台灣輪廓：照 HudTrk.tsx trk-tw 的經緯度等距投影 27 點；新竹、平鎮標在真實經緯度換算的位置。
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
// 台灣本島輪廓（HudTrk.tsx trk-tw 同一組 27 點；x＝180.3＋(經度−121.54)×57.7、y＝82＋(25.30−緯度)×64）
const TW_PATH = "M180.3 82.0 L192.0 91.6 L202.6 99.9 L207.3 100.6 L197.3 110.2 L199.1 127.4 L195.6 136.4 L185.0 166.5 L179.1 190.8 L170.9 222.8 L157.4 245.2 L142.8 271.4 L139.9 299.6 L132.8 297.7 L125.2 270.2 L116.4 263.8 L105.8 253.5 L98.8 229.8 L94.7 219.6 L98.8 204.9 L101.7 179.3 L113.5 162.0 L119.3 147.9 L129.3 133.2 L144.0 112.7 L153.3 99.3 L172.1 89.7Z";
const twXY = (lon: number, lat: number) => [180.3 + (lon - 121.54) * 57.7, 82 + (25.3 - lat) * 64] as const;
const TwMap: React.FC<{ x: number; y: number; s: number; a: number; dot: [number, number]; name: string; pulse: number }> = ({ x, y, s, a, dot, name, pulse }) => {
  const [dx, dy] = twXY(dot[0], dot[1]);
  const px = x + (dx - 94) * s, py = y + (dy - 82) * s;
  return (
    <g>
      <g transform={`translate(${x} ${y}) scale(${s}) translate(-94 -82)`}><path d={TW_PATH} fill={OK} opacity={0.3 + 0.35 * a} stroke={OK} strokeWidth={3 / s} strokeLinejoin="round" /></g>
      <circle cx={px} cy={py} r={9 * (1 + 0.25 * pulse)} fill={H.amber} opacity={0.35 + 0.65 * a} />
      <line x1={px + 10} y1={py} x2={x + 128 * s + 26} y2={py} stroke={H.amber} strokeWidth={3} opacity={0.35 + 0.65 * a} />
      <text x={x + 128 * s + 32} y={py + 11} style={zh(30, H.text, 900)} opacity={0.4 + 0.6 * a}>{name}</text>
    </g>
  );
};

// ── probe2-hook：前一集：一張探針卡好幾萬根針。這麼精細的卡，誰做得出來？左圖＝卡片俯視（綠色電路板＋中央密密麻麻的針點） ──
const Hook: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330, pv = on(f, T(o, "prev")), q = on(f, T(o, "q")), nd = on(f, T(o, "needle")), pu = Math.sin(f * 0.14) * 0.5 + 0.5;
  const cx = 150, cy = CT + 128;
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        <circle cx={cx} cy={cy} r={112} fill={PCB} stroke={H.text2} strokeWidth={3} />
        {Array.from({ length: 24 }, (_, i) => { const a = (i * Math.PI) / 12; return <rect key={i} x={cx + 98 * Math.cos(a) - 4} y={cy + 98 * Math.sin(a) - 4} width={8} height={8} fill={GOLD} />; })}
        <rect x={cx - 46} y={cy - 46} width={92} height={92} fill="#F4F1E8" stroke={H.text2} strokeWidth={2} />
        {Array.from({ length: 64 }, (_, i) => <circle key={i} cx={cx - 38 + (i % 8) * 10.9} cy={cy - 38 + Math.floor(i / 8) * 10.9} r={2.6} fill={NEEDLE} opacity={0.35 + 0.65 * nd} />)}
        <text x={cx} y={cy + 20} textAnchor="middle" style={zh(64, RED, 900)} opacity={q * (0.6 + 0.4 * pu)}>？</text>
        <Sep x={300} />
        <Row x={326} y={CT + 56} t="這麼精細的卡，誰做得出來？" c={BLUE} a={q} />
        <Row x={326} y={CT + 122} t="前一集：一張卡好幾萬根針" c={H.text2} a={pv} />
        <Row x={326} y={CT + 188} t="這一集：誰在做、為什麼難" c={H.amber} a={nd} />
      </svg>
    </Card>
  );
};

// ── probe2-ff：全球由少數幾家主導；美國 FormFactor 探針卡約占 2025 年營收八成（6.379 億／7.85 億美元，公司財報） ──
const Ff: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330, fw = on(f, T(o, "few")), us = on(f, T(o, "us")), ff = on(f, T(o, "ff")), pc = on(f, T(o, "pct"), 30);
  const BX = 40, BW = 860, BY = CT + 140, share = 6.379 / 7.85;
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        <Row x={BX} y={CT + 44} t="全球由少數幾家主導（TrendForce 2026/6）" c={H.text2} a={fw} />
        <FlagBox code="US" x={BX} y={CT + 70} a={us} />
        <NamePlate x={BX + 66} y={CT + 64} w={290} h={50} t="FormFactor" a={ff} px={32} />
        <text x={BX + 376} y={CT + 101} style={zh(30, H.text2, 800)} opacity={0.4 + 0.6 * ff}>美國，那斯達克上市</text>
        <rect x={BX} y={BY} width={BW} height={44} fill="#FFFFFF" stroke={H.lineSoft} strokeWidth={2} />
        <rect x={BX} y={BY} width={BW * share * pc} height={44} fill={BLUE} />
        <rect x={BX + BW * share} y={BY} width={BW * (1 - share)} height={44} fill={GRY} opacity={0.3 + 0.5 * pc} />
        <text x={BX + 16} y={BY + 33} style={zh(30, "#FFFFFF", 900)} opacity={pc}>探針卡：約八成</text>
        <text x={BX + BW - 16} y={BY + 33} textAnchor="end" style={zh(30, H.text, 800)} opacity={pc}>其他</text>
        <text x={BX} y={BY + 88} style={zh(30, H.text2, 800)} opacity={0.4 + 0.6 * pc}>2025 營收：探針卡 6.38 億／全部 7.85 億美元</text>
      </svg>
    </Card>
  );
};

// ── probe2-pin：一萬個圖釘壓進軟木板。圖釘長短差一點，就有幾根碰不到板子；針有彈性，多壓一點全部碰到 ──
const Pin: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330, mo = on(f, T(o, "more")), pn = on(f, T(o, "pin")), gp = on(f, T(o, "gap")), ms = on(f, T(o, "miss")), fx = on(f, T(o, "flex"), 20);
  const L = [0, 14, 2, 22, 4, 0, 18, 3, 26, 1], y0 = CT + 176, press = 50 * pn + 30 * fx;
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        <rect x={24} y={y0} width={276} height={26} fill={CORK} stroke={CORKD} strokeWidth={3} />
        {[0, 1, 2, 3, 4, 5, 6].map((i) => <circle key={i} cx={40 + i * 40} cy={y0 + 13} r={3} fill={CORKD} />)}
        <rect x={24} y={CT + 6 + press} width={276} height={16} fill="#5E6B82" opacity={0.4 + 0.6 * mo} />
        {L.map((d, i) => { const x = 38 + i * 28, top = CT + 22 + press, free = top + 104 - d, tip = Math.min(y0, free), bow = Math.max(0, free - y0) * 0.6;
          const reach = free >= y0 - 3, c = gp > 0.5 ? (reach ? OK : RED) : "#8E98AA";
          return <g key={i}><path d={`M${x} ${top} Q${x + bow} ${(top + tip) / 2} ${x} ${tip}`} stroke={c} strokeWidth={4} fill="none" opacity={0.45 + 0.55 * pn} />
            {!reach && ms > 0.5 ? <rect x={x - 5} y={tip + 3} width={10} height={Math.max(3, y0 - tip - 5)} fill={RED} opacity={ms} /> : null}</g>; })}
        <Sep x={326} />
        <Row x={352} y={CT + 40} t="針越多，越難一起碰到" c={H.text2} a={mo} />
        <Row x={352} y={CT + 90} t="像一萬個圖釘壓進軟木板" c={H.amber} a={pn} />
        <Row x={352} y={CT + 140} t="長短差一點、板子不平" c={BLUE} a={gp} />
        <Row x={352} y={CT + 190} t="就有幾根壓不到" c={RED} a={ms} />
        <Row x={352} y={CT + 240} t="針有彈性：多壓一點，全碰到" c={OK} a={fx} />
      </svg>
    </Card>
  );
};

// ── probe2-mpi：台灣旺矽（新竹）；垂直式（直針穿兩片導板）與懸臂式（斜針從環上伸出、膠固定）；台廠排第一＝公司說法、媒體轉述 ──
const Mpi: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330, tw = on(f, T(o, "tw")), mp = on(f, T(o, "mpi")), rp = on(f, T(o, "rep")), vt = on(f, T(o, "vert")), ct = on(f, T(o, "cant")), fs = on(f, T(o, "first"));
  const pulse = 0.5 + 0.5 * Math.sin(f * 0.25);
  const VX = 476, CX = 716, DY = CT + 78;
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        <TwMap x={22} y={CT + 6} s={0.92} a={tw} dot={[120.97, 24.8]} name="新竹" pulse={pulse * mp} />
        <Sep x={300} />
        <FlagBox code="TW" x={322} y={CT + 12} a={tw} />
        <NamePlate x={386} y={CT + 6} w={230} h={50} t="旺矽 MPI" a={mp} px={32} />
        <text x={632} y={CT + 43} style={zh(30, H.text2, 800)} opacity={0.4 + 0.6 * mp}>6223</text>
        <g opacity={0.4 + 0.6 * vt}>
          <rect x={VX - 70} y={DY} width={140} height={12} fill={GRAPH} /><rect x={VX - 70} y={DY + 54} width={140} height={12} fill={GRAPH} />
          {[-48, -24, 0, 24, 48].map((d) => <path key={d} d={`M${VX + d} ${DY - 8} L${VX + d} ${DY + 12} Q${VX + d + 8} ${DY + 33} ${VX + d} ${DY + 54} L${VX + d} ${DY + 84}`} stroke={vt > 0.5 ? BLUE : NEEDLE} strokeWidth={4} fill="none" />)}
          <text x={VX} y={DY + 122} textAnchor="middle" style={zh(30, H.text, 900)}>垂直式</text>
        </g>
        <g opacity={0.4 + 0.6 * ct}>
          <rect x={CX - 90} y={DY} width={180} height={14} fill={GRAPH} /><ellipse cx={CX} cy={DY + 24} rx={52} ry={12} fill={H.amber} opacity={0.8} />
          {[-40, -20, 0, 20, 40].map((d) => <path key={d} d={`M${CX + d * 1.6} ${DY + 14} L${CX + d * 0.5} ${DY + 72} L${CX + d * 0.45} ${DY + 84}`} stroke={ct > 0.5 ? BLUE : NEEDLE} strokeWidth={4} fill="none" />)}
          <text x={CX} y={DY + 122} textAnchor="middle" style={zh(30, H.text, 900)}>懸臂式</text>
        </g>
        <text x={322} y={CT + 246} style={zh(30, H.text, 900)} opacity={0.4 + 0.6 * Math.max(fs, rp * 0.6)}>據報導：台廠排第一（公司說法）</text>
      </svg>
    </Card>
  );
};

// ── probe2-chpt：中華精測（桃園平鎮）：探針卡＋測試板；客戶多是手機與 AI 晶片大廠（媒體報導，不列客戶名） ──
const Chpt: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330, ch = on(f, T(o, "chpt")), cd = on(f, T(o, "card")), bd = on(f, T(o, "board")), ph = on(f, T(o, "phone")), ai = on(f, T(o, "ai"));
  const pulse = 0.5 + 0.5 * Math.sin(f * 0.25), PY = CT + 84;
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        <TwMap x={22} y={CT + 6} s={0.92} a={ch} dot={[121.21, 24.94]} name="平鎮" pulse={pulse * ch} />
        <Sep x={300} />
        <FlagBox code="TW" x={322} y={CT + 12} a={ch} />
        <NamePlate x={386} y={CT + 6} w={300} h={50} t="中華精測 CHPT" a={ch} px={32} />
        <text x={702} y={CT + 43} style={zh(30, H.text2, 800)} opacity={0.4 + 0.6 * ch}>6510</text>
        <g opacity={0.4 + 0.6 * cd}><circle cx={384} cy={PY + 52} r={46} fill={PCB} stroke={cd > 0.5 ? H.amber : H.text2} strokeWidth={cd > 0.5 ? 5 : 3} /><rect x={366} y={PY + 34} width={36} height={36} fill="#F4F1E8" />
          <text x={448} y={PY + 64} style={zh(30, H.text, 900)}>探針卡</text></g>
        <g opacity={0.4 + 0.6 * bd}><rect x={580} y={PY + 10} width={110} height={84} fill={PCB} stroke={bd > 0.5 ? H.amber : H.text2} strokeWidth={bd > 0.5 ? 5 : 3} /><rect x={617} y={PY + 34} width={36} height={36} fill={GRAPH} />
          <text x={706} y={PY + 64} style={zh(30, H.text, 900)}>測試板</text></g>
        <Row x={322} y={CT + 250} t="客戶多是手機、AI 晶片大廠" c={BLUE} a={Math.max(ph, ai * 0.999)} />
      </svg>
    </Card>
  );
};

// ── probe2-wear：探針卡是耗材；針尖會磨損，像鉛筆越寫越短；要定期清針、換針 ──
const Wear: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330, cs = on(f, T(o, "cons")), wr = on(f, T(o, "wear"), 20), pn = on(f, T(o, "pencil"), 30), cr = on(f, T(o, "care")), sw = on(f, T(o, "swap"));
  const len = 230 - 120 * pn, y1 = CT + 60, y2 = CT + 150;
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        <g opacity={0.4 + 0.6 * Math.max(cs, pn)}>
          <rect x={30} y={y1 - 14} width={len} height={28} fill={WOOD} stroke={H.text2} strokeWidth={2} />
          <rect x={30} y={y1 - 14} width={22} height={28} fill="#E8A0A8" stroke={H.text2} strokeWidth={2} />
          <path d={`M${30 + len} ${y1 - 14} L${30 + len + 32} ${y1} L${30 + len} ${y1 + 14} Z`} fill="#F3D9A8" stroke={H.text2} strokeWidth={2} />
          <path d={`M${30 + len + 22} ${y1 - 5} L${30 + len + 32} ${y1} L${30 + len + 22} ${y1 + 5} Z`} fill={GRAPH} />
        </g>
        {[[60, 0, "新針"], [150, 1, "磨鈍"], [240, 2, "清乾淨"]].map(([x, s, t]) => { const xx = x as number, st = s as number, a = st === 0 ? cs : st === 1 ? wr : cr;
          const tipW = st === 0 ? 2 : 12;
          return <g key={xx} opacity={0.35 + 0.65 * a}><path d={`M${xx - 14} ${y2} L${xx + 14} ${y2} L${xx + tipW} ${y2 + 58 - (st ? 12 : 0)} L${xx - tipW} ${y2 + 58 - (st ? 12 : 0)} Z`} fill={NEEDLE} stroke={H.text2} strokeWidth={2} />
            {st === 1 ? <rect x={xx - 14} y={y2 + 40} width={28} height={10} fill="#8A6A3E" /> : null}
            <text x={xx} y={y2 + 100} textAnchor="middle" style={zh(30, H.text, 900)}>{t as string}</text></g>; })}
        <Sep x={318} />
        <Row x={344} y={CT + 48} t="探針卡其實是耗材" c={H.text2} a={cs} />
        <Row x={344} y={CT + 106} t="針尖每碰一次都磨一點" c={H.amber} a={wr} />
        <Row x={344} y={CT + 164} t="像鉛筆越寫越短" c={BLUE} a={pn} />
        <Row x={344} y={CT + 222} t="定期清針、換針" c={OK} a={Math.max(cr, sw)} />
      </svg>
    </Card>
  );
};

// ── probe2-ai：AI 晶片腳數多、間距小 → 卡越做越難；研究機構：台灣精測、旺矽趁 AI 浪潮提升占比 ──
const Ai: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330, pi = on(f, T(o, "pins")), pt = on(f, T(o, "pitch")), hd = on(f, T(o, "hard")), tw = on(f, T(o, "tw"));
  const grid = (x0: number, y0: number, n: number, sz: number, a: number, c: string) => Array.from({ length: n * n }, (_, i) => <rect key={i} x={x0 + (i % n) * (112 / n)} y={y0 + Math.floor(i / n) * (112 / n)} width={sz} height={sz} fill={c} opacity={a} />);
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        <rect x={20} y={CT + 22} width={128} height={128} fill="#FFFFFF" stroke={H.text2} strokeWidth={2} />{grid(28, CT + 30, 5, 12, 0.9, GOLD)}
        <text x={84} y={CT + 192} textAnchor="middle" style={zh(30, H.text2, 800)}>一般晶片</text>
        <rect x={164} y={CT + 22} width={128} height={128} fill="#FFFFFF" stroke={pi > 0.5 ? H.amber : H.text2} strokeWidth={pi > 0.5 ? 4 : 2} />{grid(172, CT + 30, 14, 4.6, 0.35 + 0.65 * pi, GOLD)}
        <text x={228} y={CT + 192} textAnchor="middle" style={zh(30, H.text, 900)} opacity={0.4 + 0.6 * pi}>AI 晶片</text>
        <Sep x={318} />
        <Row x={344} y={CT + 48} t="AI 晶片：腳數多" c={H.amber} a={pi} />
        <Row x={344} y={CT + 104} t="間距小，針要更細更密" c={BLUE} a={pt} />
        <Row x={344} y={CT + 160} t="卡越做越難" c={RED} a={hd} />
        <Row x={344} y={CT + 216} t="研究機構：台廠趁 AI 提升占比" c={OK} a={tw} />
      </svg>
    </Card>
  );
};

// ── probe2-recap：系列 2 收尾：設備 → 材料 → 廠務 → 測試，一片晶圓做完也測完 ──
const Recap: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330, done = on(f, T(o, "done"), 14);
  const cells: [string, string][] = [["eq", "設備"], ["mat", "材料"], ["fac", "廠務"], ["test", "測試"]];
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        {cells.map(([c, t], i) => { const a = on(f, T(o, c)), x = 24 + i * 226; return <g key={c}>
          <rect x={x} y={CT + 20} width={190} height={92} fill={a > 0.5 ? (i === 3 ? OK : BLUE) : "#FFFFFF"} stroke={a > 0.5 ? (i === 3 ? OK : BLUE) : H.lineSoft} strokeWidth={3} />
          <text x={x + 95} y={CT + 78} textAnchor="middle" style={zh(40, a > 0.5 ? "#FFFFFF" : H.text2, 900)}>{t}</text>
          {i < 3 ? <path d={`M${x + 196} ${CT + 66} l22 0 m-8 -8 l8 8 l-8 8`} stroke={H.text2} strokeWidth={4} fill="none" opacity={0.4 + 0.6 * a} /> : null}</g>; })}
        <circle cx={60} cy={CT + 196} r={34} fill="#3C4E7A" stroke={H.text2} strokeWidth={2} opacity={0.4 + 0.6 * done} />
        {Array.from({ length: 16 }, (_, i) => <rect key={i} x={41 + (i % 4) * 10} y={CT + 177 + Math.floor(i / 4) * 10} width={7} height={7} fill={OK} opacity={done} />)}
        <Check x={130} y={CT + 196} o={done} />
        <text x={170} y={CT + 208} style={zh(34, H.text, 900)} opacity={0.4 + 0.6 * done}>一片晶圓：做完，也測完了</text>
      </svg>
    </Card>
  );
};

// ── probe2-next：下一個系列：晶片往下游走；第一集：晶圓切割與薄化；留言「探針卡廠」 ──
const Next: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330, nx = on(f, T(o, "next")), dn = on(f, T(o, "down")), ep = on(f, T(o, "ep")), dc = on(f, T(o, "dice")), kw = on(f, T(o, "kw"));
  const cx = 150, cy = CT + 128;
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        <circle cx={cx} cy={cy} r={110} fill="#D6DCE6" stroke={H.text2} strokeWidth={3} opacity={0.4 + 0.6 * dn} />
        <circle cx={cx} cy={cy} r={92} fill="#9FC3EF" opacity={0.4 + 0.6 * dn} />
        <circle cx={cx} cy={cy} r={68} fill="#3C4E7A" opacity={0.4 + 0.6 * dn} />
        {[-2, -1, 0, 1, 2].map((i) => <line key={`a${i}`} x1={cx - 62} y1={cy + i * 22} x2={cx + 62} y2={cy + i * 22} stroke="#FFFFFF" strokeWidth={dc > 0.5 ? 3 : 1.5} opacity={0.5 + 0.5 * dc} />)}
        {[-2, -1, 0, 1, 2].map((i) => <line key={`b${i}`} x1={cx + i * 22} y1={cy - 62} x2={cx + i * 22} y2={cy + 62} stroke="#FFFFFF" strokeWidth={dc > 0.5 ? 3 : 1.5} opacity={0.5 + 0.5 * dc} />)}
        <Sep x={300} />
        <Row x={326} y={CT + 52} t="下一個系列：晶片往下游走" c={H.text2} a={Math.max(nx, dn)} />
        <Row x={326} y={CT + 118} t="第一集：晶圓切割與薄化" c={BLUE} a={Math.max(ep, dc)} />
        <Row x={326} y={CT + 184} t="留言「探針卡廠」拿完整資料" c={H.amber} a={kw} />
      </svg>
    </Card>
  );
};

export const Probe2Section: React.FC<P> = (p) => {
  const kd = String((p.o as any).kind);
  if (kd === "probe2-hook") return <Hook {...p} />;
  if (kd === "probe2-ff") return <Ff {...p} />;
  if (kd === "probe2-pin") return <Pin {...p} />;
  if (kd === "probe2-mpi") return <Mpi {...p} />;
  if (kd === "probe2-chpt") return <Chpt {...p} />;
  if (kd === "probe2-wear") return <Wear {...p} />;
  if (kd === "probe2-ai") return <Ai {...p} />;
  if (kd === "probe2-recap") return <Recap {...p} />;
  if (kd === "probe2-next") return <Next {...p} />;
  return null;
};

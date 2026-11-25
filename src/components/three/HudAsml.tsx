// 2026/11/26 tech-asml：設備五大-1 艾司摩爾（曝光）的 2D 示意卡（overlay `section` 的 kind 以 "asml-" 開頭，Hud.tsx 的 HudSection 轉過來）。
//   asml-hook 誰做得出來＋全世界只有 1 家｜asml-proj 像投影機（光罩 → 收斂光錐 → 晶圓，縮小 4 倍）｜asml-step 它負責哪一步（每一層都要曝光）｜
//   asml-col 空氣吸光 → 抽真空、碗形鏡收光（發散 → 收斂）｜asml-grid 一片晶圓照好幾十格（換格有加減速與過衝）｜
//   asml-co 全球三家（LOGO＋國旗）｜asml-euv 極紫外光只有 ASML＋價格｜asml-num 2025 年 48 台、營收兩成多來自台灣｜asml-tw 在台灣（真實輪廓地圖＋據點＋供應商）｜asml-next 下一集
// 全部示意；結構一開始就畫出，念到時該處亮起、動起來；時間全部來自 script.json 的 t（cue）。
// 排版原則（card-overlap.mjs 檢查）：內容從 CARD_CONTENT_TOP 以下；字不放進會動的圖形範圍；字 ≥30px；字不貼色條、不貼圖形（≥6px）。
import React from "react";
import { FONT_ZH } from "../../theme";
import { H, L, sm, CARD_HEAD, CARD_CONTENT_TOP, cardTitleBox } from "./hudSkin";
import { EASE, tween } from "../anim";
import type { Model3D, Overlay3D, State3D } from "./engine";
import { LPP, lppPhase } from "./Ops";
import { Flag, LogoSvg, hasLogo, logoW } from "./Brand";

const zh = (px: number, color: string = H.text, w = 800): React.CSSProperties => ({ fontFamily: FONT_ZH, fontSize: px, fill: color, color, fontWeight: w, whiteSpace: "nowrap" });
const onC = (bg: string) => (bg === H.amber ? ((H as any).onAmber ?? H.onAccent) : H.onAccent);
type P = { o: Overlay3D; f: number; k: number; m: Model3D; s?: State3D };
const T = (o: Overlay3D, n: string) => ((o as any).t?.[n]?.at ?? o.at) as number;
const CT = CARD_CONTENT_TOP;
const Card: React.FC<{ o: Overlay3D; k: number; W: number; Hh: number; children: React.ReactNode }> = ({ o, k, W, Hh, children }) => (
  <div style={{ position: "absolute", left: o.x ?? L.X, top: o.y ?? 900, width: W, height: Hh, opacity: k, background: H.cardCompare, border: `2px solid ${H.lineSoft}`, boxSizing: "border-box", overflow: "hidden" }}>
    {o.title ? <div style={{ ...zh(CARD_HEAD.px, onC(H.line), 800), ...cardTitleBox(), background: H.line, zIndex: 2 }}>{o.title}</div> : null}
    {o.tag ? <div style={{ position: "absolute", right: 16, top: 14, ...zh(sm(28), H.text2, 600), zIndex: 2 }}>{o.tag}</div> : null}
    {children}
  </div>
);
const lit = (f: number, at: number, lo = 0.4) => lo + (1 - lo) * tween(f, at, 10, EASE.enter);
const on = (f: number, at: number, d = 10) => tween(f, at, d, EASE.enter);
const cl = (x: number) => Math.min(1, Math.max(0, x));
const ph = (f: number, sp: number, j: number, n: number) => (((f * sp + j / n) % 1) + 1) % 1;
const RED = "#E0472F", OK = "#14A38B", BLUE = "#2F7FE0", EUV = "#8B5CF6", EUV_L = "#C4B5FD", WAF = "#B4C2DA", WAF_D = "#7F93B5", MASK = "#1F3A6B", MIR = "#E8B04A", AIR = "#8A96A8", TIN = "#9AA6B8";
const Sep: React.FC<{ x: number; y0?: number; y1?: number }> = ({ x, y0 = CT + 4, y1 = 316 }) => <line x1={x} y1={y0} x2={x} y2={y1} stroke={H.lineSoft} strokeWidth={3} />;
const Arrow: React.FC<{ x1: number; y1: number; x2: number; y2: number; c: string; w?: number; o?: number }> = ({ x1, y1, x2, y2, c, w = 5, o = 1 }) => {
  const a = Math.atan2(y2 - y1, x2 - x1), s = w * 2.6;
  return <g opacity={o}><path d={`M${x1} ${y1} L${x2 - Math.cos(a) * s * 0.8} ${y2 - Math.sin(a) * s * 0.8}`} stroke={c} strokeWidth={w} />
    <path d={`M${x2} ${y2} L${x2 - Math.cos(a) * s - Math.sin(a) * s * 0.6} ${y2 - Math.sin(a) * s + Math.cos(a) * s * 0.6} L${x2 - Math.cos(a) * s + Math.sin(a) * s * 0.6} ${y2 - Math.sin(a) * s - Math.cos(a) * s * 0.6} Z`} fill={c} /></g>;
};
const Check: React.FC<{ x: number; y: number; o?: number; c?: string }> = ({ x, y, o = 1, c = OK }) => <path opacity={o} d={`M${x - 20} ${y} l14 14 l28 -30`} stroke={c} strokeWidth={8} fill="none" />;
const Cross: React.FC<{ x: number; y: number; o?: number }> = ({ x, y, o = 1 }) => <g opacity={o} stroke={RED} strokeWidth={8}><path d={`M${x - 16} ${y - 16} L${x + 16} ${y + 16}`} /><path d={`M${x + 16} ${y - 16} L${x - 16} ${y + 16}`} /></g>;
const Row: React.FC<{ x: number; y: number; t: string; c: string; a: number; px?: number }> = ({ x, y, t, c, a, px = 32 }) => (
  <g opacity={0.35 + 0.65 * a}><rect x={x} y={y - px * 0.72} width={12} height={px * 0.72} fill={c} /><text x={x + 24} y={y} style={zh(px, H.text, 900)}>{t}</text></g>
);
/** LOGO 白底小板：未輪到＝細灰框，輪到＝粗框（LOGO 本身全程 100% 不透明） */
const LogoBox: React.FC<{ id: string; x: number; y: number; h: number; a: number; maxW?: number }> = ({ id, x, y, h, a, maxW = 260 }) => {
  if (!hasLogo(id)) return null;
  const lw = Math.min(maxW, logoW(id, h)), lh = (h * lw) / logoW(id, h);
  return <g><rect x={x} y={y} width={lw + 16} height={h + 12} fill="#FFFFFF" stroke={a > 0.5 ? H.amber : H.lineSoft} strokeWidth={a > 0.5 ? 4 : 1.5} />
    <LogoSvg id={id} x={x + 8} y={y + 6 + (h - lh) / 2} h={lh} /></g>;
};
const FlagBox: React.FC<{ code: string; x: number; y: number; a: number }> = ({ code, x, y, a }) => (
  <g><rect x={x} y={y} width={50} height={36} fill="none" stroke={a > 0.5 ? H.amber : H.lineSoft} strokeWidth={a > 0.5 ? 4 : 1.5} /><Flag code={code} h={28} x={x + 4} y={y + 4} asSvg /></g>
);
/** 阻尼過衝：0→1 緩入緩出，到位後小幅過衝收斂（跟 3D 晶圓台換格同一種手感） */
const settle = (f: number, at: number, dur = 12) => {
  const n = f - at; if (n <= 0) return 0; if (n < dur) return EASE.move(n / dur);
  const m = n - dur; return 1 + 0.16 * Math.exp(-m / 5) * Math.sin((2 * Math.PI * m) / 10);
};

// ── asml-hook：誰做得出來？左：曝光機剖面（錫滴、閃光、光路）｜右：最先進的那種，全世界只有 1 家 ──
const Hook: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330;
  const tp = on(f, T(o, "top")), one = on(f, T(o, "one"), 8);
  const cyc = ph(f, 1 / 33, 0, 1), flash = cyc > 0.55 && cyc < 0.85 ? Math.sin(((cyc - 0.55) / 0.3) * Math.PI) : 0;
  const dropY = 96 + 80 * Math.min(1, (cyc / 0.55) ** 2);   // 錫滴受重力加速落下
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        <g>
          <rect x={40} y={92} width={380} height={176} fill="#EEF2F8" stroke={WAF_D} strokeWidth={3} />
          <path d="M70 250 Q60 180 70 110" stroke={MIR} strokeWidth={8} fill="none" />
          {cyc < 0.55 ? <circle cx={130} cy={dropY} r={7} fill={TIN} /> : null}
          <circle cx={130} cy={180} r={8 + 26 * flash} fill={EUV} opacity={0.2 + 0.6 * flash} />
          <path d={`M130 180 L72 128 M130 180 L72 232 M72 128 L330 180 M72 232 L330 180`} stroke={EUV} strokeWidth={4} opacity={0.25 + 0.6 * flash} />
          <rect x={330} y={130} width={70} height={100} fill={MASK} />
          <text x={40} y={312} style={zh(30, H.text2, 800)}>曝光機（剖開示意）</text>
        </g>
        <Sep x={456} />
        <text x={486} y={CT + 44} style={zh(34, H.text, 900)} opacity={0.35 + 0.65 * tp}>最先進的極紫外光機</text>
        <text x={486} y={232} style={zh(42, H.text, 900)} opacity={0.35 + 0.65 * one}>全世界只有</text>
        <g opacity={0.25 + 0.75 * one} transform={`translate(770 290) scale(${1 + 0.35 * (1 - one)})`}>
          <text x={0} y={0} textAnchor="middle" style={zh(150, H.amber, 900)}>1</text>
        </g>
        <text x={850} y={286} style={zh(48, H.text, 900)} opacity={0.35 + 0.65 * one}>家</text>
      </svg>
    </Card>
  );
};

// ── asml-proj：像投影機：光罩（大圖）→ 收斂的光錐 → 晶圓上縮小 4 倍的同一張圖 ──
const Proj: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330;
  const pj = on(f, T(o, "proj")), mk = on(f, T(o, "mask")), x4 = on(f, T(o, "x4")), wf = on(f, T(o, "wafer"));
  const pat = (x: number, y: number, s: number, c: string, op: number) => (
    <g opacity={op}>{[0, 1, 2, 3].map((i) => <rect key={i} x={x + i * 56 * s} y={y} width={30 * s} height={44 * s} fill={c} />)}<rect x={x} y={y + 50 * s} width={198 * s} height={10 * s} fill={c} /></g>);
  // 光錐：上寬下窄（收斂），裡面的光點往下走、越往下越擠（速度不變、間距跟著錐變窄）
  const top = 152, bot = 266, cx = 190, wTop = 240, wBot = 60;
  const rays = Array.from({ length: 9 }, (_, i) => i);
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        <rect x={cx - 130} y={CT + 22} width={260} height={64} fill={MASK} stroke={H.text} strokeWidth={2} opacity={0.45 + 0.55 * Math.max(pj, mk)} />
        {pat(cx - 99, CT + 28, 1, "#E8EEF8", 0.4 + 0.6 * mk)}
        <path d={`M${cx - wTop / 2} ${top} L${cx + wTop / 2} ${top} L${cx + wBot / 2} ${bot} L${cx - wBot / 2} ${bot} Z`} fill={EUV_L} opacity={0.18 + 0.3 * pj} />
        <path d={`M${cx - wTop / 2} ${top} L${cx - wBot / 2} ${bot} M${cx + wTop / 2} ${top} L${cx + wBot / 2} ${bot}`} stroke={EUV} strokeWidth={3} opacity={0.3 + 0.5 * pj} />
        {rays.map((i) => { const u = (i - 4) / 4; const t = ph(f, 1 / 40, i % 3, 3); const y = top + (bot - top) * t; const half = wTop / 2 + (wBot / 2 - wTop / 2) * t;
          return <circle key={i} cx={cx + u * half * 0.85} cy={y} r={4.5} fill={EUV} opacity={(0.3 + 0.6 * pj) * (1 - 0.4 * t)} />; })}
        <rect x={cx - 120} y={bot + 2} width={240} height={14} fill={WAF} stroke={WAF_D} strokeWidth={2} />
        {pat(cx - 25, bot - 15, 0.25, EUV, 0.3 + 0.7 * wf)}
        <Sep x={420} />
        <Row x={448} y={CT + 50} t="光罩：電路的原圖" c={MASK} a={mk} />
        <g opacity={0.35 + 0.65 * x4}><text x={448} y={CT + 150} style={zh(34, H.text, 900)}>縮小</text>
          <text x={540} y={CT + 156} style={zh(72, H.amber, 900)}>4 倍</text></g>
        <Row x={448} y={CT + 236} t="印到晶圓的光阻上" c={EUV} a={wf} />
      </svg>
    </Card>
  );
};

// ── asml-step：鋪薄膜 → 塗光阻 → 曝光 → 顯影 → 蝕刻，每一層都重複；曝光那格亮 ──
const Step: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330;
  const ly = on(f, T(o, "lay")), lt = on(f, T(o, "lit")), ex = on(f, T(o, "expo"));
  const names = ["鋪薄膜", "塗光阻", "曝光", "顯影", "蝕刻"], cw = 160, gap = 26, x0 = 24, y0 = CT + 24;
  const tok = ph(f, 1 / 150, 0, 1), tx = x0 + cw / 2 + tok * 4 * (cw + gap);
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        {names.map((n, i) => { const x = x0 + i * (cw + gap), hot = i === 2; const a = hot ? Math.max(lt, ex) : 0;
          return <g key={i}>
            <rect x={x} y={y0} width={cw} height={80} fill={hot && a > 0.5 ? BLUE : H.cardCompare} stroke={hot ? BLUE : H.lineSoft} strokeWidth={hot ? 5 : 3} />
            <text x={x + cw / 2} y={y0 + 52} textAnchor="middle" style={zh(32, hot && a > 0.5 ? "#FFFFFF" : H.text, 900)}>{n}</text>
            {i < 4 ? <Arrow x1={x + cw + 3} y1={y0 + 40} x2={x + cw + gap - 2} y2={y0 + 40} c={H.text2} w={4} /> : null}
          </g>; })}
        <circle cx={tx} cy={y0 + 100} r={9} fill={WAF_D} />
        <path d={`M${x0 + 4 * (cw + gap) + cw / 2} ${y0 + 116} L${x0 + 4 * (cw + gap) + cw / 2} ${y0 + 146} L${x0 + cw / 2} ${y0 + 146} L${x0 + cw / 2} ${y0 + 122}`} stroke={H.amber} strokeWidth={5} fill="none" opacity={0.3 + 0.7 * ly} />
        <path d={`M${x0 + cw / 2 - 12} ${y0 + 130} L${x0 + cw / 2} ${y0 + 114} L${x0 + cw / 2 + 12} ${y0 + 130} Z`} fill={H.amber} opacity={0.3 + 0.7 * ly} />
        <text x={W / 2} y={300} textAnchor="middle" style={zh(34, H.text, 900)} opacity={0.35 + 0.65 * ly}>晶片的每一層，都要繞一圈</text>
      </svg>
    </Card>
  );
};

// ── asml-col：左：空氣分子把光吸掉 → 抽真空｜右：電漿往四面發光（發散）→ 碗形鏡反射 → 收斂到中間焦點 ──
const Col: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330;
  const ai = on(f, T(o, "air")), va = on(f, T(o, "vac"), 24), bw = on(f, T(o, "bowl")), bm = on(f, T(o, "beam"));
  const mols = [[120, 150], [200, 236], [270, 170], [340, 230], [160, 262], [380, 140], [240, 120]];
  const rayX = 40 + 360 * ph(f, 1 / 45, 0, 1);
  const absorbed = va < 0.5 && rayX > 230;
  const PX = 640, PY = 196, FX = 900, FY = 196;
  const bowl = Array.from({ length: 7 }, (_, i) => { const a = (-60 + i * 20) * Math.PI / 180; return [PX - 150 * Math.cos(a) + 20, PY + 80 * Math.sin(a)]; });
  const cyc = ph(f, 1 / 33, 0, 1), fl = cyc < 0.3 ? Math.sin((cyc / 0.3) * Math.PI) : 0;
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        <text x={40} y={CT + 40} style={zh(32, H.text, 900)} opacity={0.35 + 0.65 * ai}>空氣會吸光</text>
        {mols.map(([x, y], i) => <g key={i} opacity={(1 - va) * (0.5 + 0.5 * ai)} transform={`translate(${x + 4 * Math.sin(f * 0.13 + i)} ${y + 4 * Math.cos(f * 0.11 + i * 2)})`}><circle cx={-6} cy={0} r={9} fill={AIR} /><circle cx={6} cy={-3} r={7} fill={AIR} /></g>)}
        <line x1={40} y1={200} x2={absorbed ? 230 : rayX} y2={200} stroke={EUV} strokeWidth={6} opacity={0.3 + 0.6 * ai} />
        {!absorbed ? <circle cx={rayX} cy={200} r={8} fill={EUV} opacity={0.4 + 0.6 * ai} /> : <circle cx={230} cy={200} r={14 * (1 - (rayX - 230) / 170)} fill={EUV} opacity={0.5} />}
        <Cross x={250} y={262} o={ai * (1 - va)} />
        <text x={40} y={314} style={zh(32, OK, 900)} opacity={va}>抽成真空 ✓</text>
        <Sep x={440} />
        {bowl.map(([x, y], i) => i < bowl.length - 1 ? <line key={i} x1={x} y1={y} x2={bowl[i + 1][0]} y2={bowl[i + 1][1]} stroke={MIR} strokeWidth={9} opacity={0.4 + 0.6 * bw} /> : null)}
        {bowl.map(([x, y], i) => <g key={`r${i}`} opacity={(0.15 + 0.45 * bw) * (0.6 + 0.4 * fl)}>
          <line x1={PX} y1={PY} x2={x} y2={y} stroke={EUV} strokeWidth={3} />
          <line x1={x} y1={y} x2={FX} y2={FY} stroke={EUV} strokeWidth={3} opacity={0.35 + 0.65 * bm} /></g>)}
        {bowl.map(([x, y], i) => { const t = ph(f, 1 / 36, i, 7), go = t < 0.4, u = go ? t / 0.4 : (t - 0.4) / 0.6;
          const px = go ? PX + (x - PX) * u : x + (FX - x) * u, py = go ? PY + (y - PY) * u : y + (FY - y) * u;
          return <circle key={`p${i}`} cx={px} cy={py} r={5} fill={EUV} opacity={(0.3 + 0.7 * bw) * (go ? 1 : 0.3 + 0.7 * bm)} />; })}
        <circle cx={PX} cy={PY} r={9 + 14 * fl} fill={EUV} opacity={0.5 + 0.5 * fl} />
        <circle cx={FX} cy={FY} r={8} fill={H.amber} opacity={0.3 + 0.7 * bm} />
        <text x={470} y={314} style={zh(30, H.text, 900)} opacity={0.35 + 0.65 * bw}>碗形收集鏡</text>
        <text x={784} y={314} style={zh(30, H.text, 900)} opacity={0.35 + 0.65 * bm}>中間焦點</text>
      </svg>
    </Card>
  );
};

// ── asml-grid：晶圓上一格一格照（光縫掃過那一格 → 換格：加速、減速、小過衝 → 停穩再掃）；念到「好幾十格」整片快速填滿 ──
const Grid: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330;
  const dn = on(f, T(o, "done")), mv = on(f, T(o, "move")), st = on(f, T(o, "settle")), mn = on(f, T(o, "many"));
  const cx = 170, cy = 198, r = 118, fw = 30, fh = 38;
  const cells: [number, number][] = [];
  for (let j = -3; j <= 2; j++) for (let i = -4; i <= 3; i++) { const x = cx + i * fw, y = cy + j * fh; if ([[x, y], [x + fw, y], [x, y + fh], [x + fw, y + fh]].every(([a, b]) => Math.hypot(a - cx, b - cy) < r - 4)) cells.push([x, y]); }
  const order = [...cells].sort((a, b) => a[1] - b[1] || a[0] - b[0]);
  const start = Math.floor(order.length / 2) - 1;
  // 第 0 格在 done 前掃；move、settle+20、many+4 各換一格（跟 3D 同一組 cue）
  const steps = [T(o, "move"), T(o, "settle") + 20, T(o, "many") + 4];
  const idx = start + steps.filter((s) => f >= s).length;
  const curPrev = order[Math.max(0, idx - 1)], cur = order[Math.min(order.length - 1, idx)];
  const lastStep = steps.filter((s) => f >= s).pop();
  const sp = lastStep !== undefined ? settle(f, lastStep) : 1;
  const bx = lastStep !== undefined ? curPrev[0] + (cur[0] - curPrev[0]) * sp : cur[0], by = lastStep !== undefined ? curPrev[1] + (cur[1] - curPrev[1]) * sp : cur[1];
  const fillAll = cl((f - T(o, "many") - 10) / 40);
  const slit = ph(f, 1 / 24, 0, 1);
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        <circle cx={cx} cy={cy} r={r} fill={WAF} stroke={WAF_D} strokeWidth={3} />
        {order.map(([x, y], i) => { const done = i < idx || (i === idx && f >= T(o, "done") && f < (steps[0] ?? 0)) || (fillAll > 0 && (i * 1) / order.length < fillAll);
          return <rect key={i} x={x + 1} y={y + 1} width={fw - 2} height={fh - 2} fill={done ? EUV_L : "#DCE4F0"} stroke={WAF_D} strokeWidth={1} />; })}
        <rect x={bx - 2} y={by - 2} width={fw + 4} height={fh + 4} fill="none" stroke={H.amber} strokeWidth={4} />
        <rect x={bx + 2} y={by + 2 + (fh - 8) * slit} width={fw - 4} height={4} fill={EUV} opacity={0.9} />
        <Sep x={330} />
        <Row x={358} y={CT + 44} t="掃完一格" c={EUV} a={dn} />
        <Row x={358} y={CT + 104} t="移到下一格：加速 → 減速" c={H.amber} a={mv} />
        <Row x={358} y={CT + 164} t="停穩了再掃" c={OK} a={st} />
        <g opacity={0.35 + 0.65 * mn}><text x={382} y={CT + 238} style={zh(34, H.text, 900)}>一片晶圓：</text>
          <text x={560} y={CT + 242} style={zh(52, H.amber, 900)}>好幾十格</text></g>
      </svg>
    </Card>
  );
};

// ── asml-co：全球三家（LOGO＋國旗＋強項） ──
const Co: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330;
  const th = on(f, T(o, "three")), as = on(f, T(o, "asml")), jp = on(f, T(o, "jp")), ca = on(f, T(o, "canon"));
  const col = (x: number, id: string, h: number, code: string, cn: string, name: string, sub: string, a: number) => (
    <g opacity={0.45 + 0.55 * Math.max(a, th * 0.6)}>
      <LogoBox id={id} x={x} y={CT + 12} h={h} a={a} maxW={250} />
      <FlagBox code={code} x={x} y={CT + 116} a={a} />
      <text x={x + 66} y={CT + 146} style={zh(32, H.text, 900)}>{cn}</text>
      <text x={x} y={CT + 200} style={zh(36, H.text, 900)}>{name}</text>
      <text x={x} y={CT + 248} style={zh(30, H.text2, 800)}>{sub}</text>
    </g>);
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        {col(28, "asml", 54, "NL", "荷蘭", "艾司摩爾", "高階機九成以上", as)}
        <Sep x={326} />
        {col(352, "nikon", 82, "JP", "日本", "尼康", "浸潤式、乾式", jp)}
        <Sep x={636} />
        {col(662, "canon", 44, "JP", "日本", "佳能", "成熟製程為主", ca)}
      </svg>
    </Card>
  );
};

// ── asml-euv：極紫外光機誰做得出來：ASML ✓、尼康 ✕、佳能 ✕｜右：一台約 2 億美元 ──
const Euv: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330;
  const eu = on(f, T(o, "euv")), only = on(f, T(o, "only")), pr = on(f, T(o, "price"));
  const row = (y: number, id: string, h: number, name: string, ok: boolean) => (
    <g><LogoBox id={id} x={28} y={y} h={h} a={ok ? only : 0} maxW={190} />
      <text x={252} y={y + h / 2 + 12} style={zh(32, H.text, 900)} opacity={0.45 + 0.55 * eu}>{name}</text>
      {ok ? <Check x={414} y={y + h / 2 + 4} o={only} /> : <Cross x={416} y={y + h / 2 + 4} o={only} />}</g>);
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        {row(CT + 10, "asml", 50, "艾司摩爾", true)}
        {row(CT + 92, "nikon", 64, "尼康", false)}
        {row(CT + 190, "canon", 40, "佳能", false)}
        <Sep x={456} />
        <g opacity={0.35 + 0.65 * pr}>
          <text x={490} y={CT + 52} style={zh(34, H.text, 900)}>一台大約</text>
          <text x={490} y={CT + 150} style={zh(76, H.amber, 900)}>2 億美元</text>
          <text x={490} y={CT + 206} style={zh(30, H.text2, 800)}>新一代 High-NA</text>
          <text x={490} y={CT + 246} style={zh(30, H.text2, 800)}>約 4 億美元</text>
        </g>
        <g opacity={pr}><rect x={780} y={CT + 186} width={136} height={48} fill={H.amber} /><text x={848} y={CT + 220} textAnchor="middle" style={zh(30, onC(H.amber), 900)}>媒體報導</text></g>
      </svg>
    </Card>
  );
};

// ── asml-num：2025 年：極紫外光機出貨 0 → 48 台｜系統營收約 22% 來自台灣（甜甜圈） ──
const Num: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330;
  const yr = on(f, T(o, "year")), n48 = on(f, T(o, "n48")), tw = on(f, T(o, "tw"));
  const cnt = Math.round(48 * EASE.move(cl((f - T(o, "n48")) / 30)));
  // 0:51 Andy 看不出 22%：卡片一出來就畫好 22% 實心扇段（深色底環＋中間大字），念到「台灣」時扇段加粗、往外彈一下
  const cx = 590, cy = 200, R = 92, sw = 40, frac = 0.22 * EASE.move(cl((f - o.at - 4) / 20)), pop = Math.sin(Math.PI * cl((f - T(o, "tw")) / 14)) * 10;
  const arc = (a0: number, a1: number) => { const p = (a: number) => [cx + R * Math.sin(2 * Math.PI * a), cy - R * Math.cos(2 * Math.PI * a)]; const [x0, y0] = p(a0), [x1, y1] = p(a1); return `M${x0} ${y0} A${R} ${R} 0 ${a1 - a0 > 0.5 ? 1 : 0} 1 ${x1} ${y1}`; };
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        <g opacity={0.35 + 0.65 * Math.max(yr, n48)}>
          <text x={36} y={CT + 44} style={zh(32, H.text2, 800)}>極紫外光機出貨</text>
          <text x={36} y={CT + 190} style={zh(130, EUV, 900)}>{cnt}</text>
          <text x={36 + (cnt >= 10 ? 196 : 112)} y={CT + 186} style={zh(48, H.text, 900)}>台</text>
          <text x={36} y={312} style={zh(30, H.text2, 800)}>公司財報</text>
        </g>
        <Sep x={400} />
        <g opacity={0.8 + 0.2 * tw}>
          <circle cx={cx} cy={cy} r={R} fill="none" stroke="#A9B8CF" strokeWidth={sw} />
          {frac > 0.002 ? <path d={arc(0, frac)} stroke={H.amber} strokeWidth={sw + 6 * tw + pop} fill="none" /> : null}
          <text x={cx} y={cy + 16} textAnchor="middle" style={zh(46, H.text, 900)}>{Math.round(frac * 100)}%</text>
          <FlagBox code="TW" x={744} y={CT + 40} a={tw} />
          <text x={808} y={CT + 70} style={zh(34, H.text, 900)}>台灣</text>
          <text x={744} y={CT + 160} style={zh(50, H.amber, 900)}>約 22%</text>
          <text x={744} y={CT + 220} style={zh(30, H.text2, 800)}>系統營收</text>
        </g>
      </svg>
    </Card>
  );
};

// ── asml-tw：在台灣：真實輪廓（富貴角、三貂角、鵝鑾鼻、安平…27 點經緯度投影，同 HudTrk trk-tw）＋據點（新竹總部、林口新據點、台中、台南）＋台灣供應商 ──
const TW_PATH = "M180.3 82.0 L192.0 91.6 L202.6 99.9 L207.3 100.6 L197.3 110.2 L199.1 127.4 L195.6 136.4 L185.0 166.5 L179.1 190.8 L170.9 222.8 L157.4 245.2 L142.8 271.4 L139.9 299.6 L132.8 297.7 L125.2 270.2 L116.4 263.8 L105.8 253.5 L98.8 229.8 L94.7 219.6 L98.8 204.9 L101.7 179.3 L113.5 162.0 L119.3 147.9 L129.3 133.2 L144.0 112.7 L153.3 99.3 L172.1 89.7Z";
// 投影：x＝180.3＋(經度−121.54)×58.6、y＝82＋(25.30−緯度)×64（由富貴角、鵝鑾鼻兩點定；台南 23.00N 120.20E 落在 102,229 與 trk-tw 一致）
const geo = (lat: number, lon: number) => [180.3 + (lon - 121.54) * 58.6, 82 + (25.30 - lat) * 64];
const Tw: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 360;
  const hq = on(f, T(o, "hq")), lk = on(f, T(o, "lk")), mic = on(f, T(o, "mic")), gd = on(f, T(o, "gd")), kc = on(f, T(o, "kc"));
  const S = 1.12, OX = -70, OY = -22;   // 地圖整體放大一點、往左上靠
  const pt = (lat: number, lon: number) => { const [x, y] = geo(lat, lon); return [OX + x * S, OY + y * S]; };
  const sites: [string, number, number, number, number][] = [["林口", 25.08, 121.38, lk, 100], ["新竹", 24.80, 120.97, hq, 146], ["台中", 24.15, 120.67, Math.max(hq, lk) * 0.7, 196], ["台南", 23.0, 120.2, Math.max(hq, lk) * 0.7, 262]];
  const chip = (x: number, a: number, id: string | null, t: string) => (
    <g opacity={0.4 + 0.6 * a}><rect x={x} y={CT + 220} width={182} height={64} fill="#FFFFFF" stroke={a > 0.5 ? H.amber : H.lineSoft} strokeWidth={a > 0.5 ? 4 : 1.5} />
      {id && hasLogo(id) ? <LogoSvg id={id} x={x + 12} y={CT + 232} h={Math.min(40, (158 * 40) / logoW(id, 40))} /> : <text x={x + 91} y={CT + 264} textAnchor="middle" style={zh(32, H.text, 900)}>{t}</text>}</g>);
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        <path d={TW_PATH} transform={`translate(${OX} ${OY}) scale(${S})`} fill={OK} opacity={0.35 + 0.35 * Math.max(hq, lk)} stroke={OK} strokeWidth={3 / S} strokeLinejoin="round" />
        {sites.map(([n, la, lo, a, ly], i) => { const [x, y] = pt(la, lo), pul = 1 + 0.25 * Math.sin(f * 0.25 + i) * a;
          return <g key={n} opacity={0.35 + 0.65 * a}><circle cx={x} cy={y} r={8 * pul} fill={i < 2 ? H.amber : BLUE} />
            <line x1={x + 9} y1={y} x2={196} y2={ly - 10} stroke={H.text2} strokeWidth={2} />
            <text x={202} y={ly} style={zh(30, H.text, 900)}>{n}</text></g>; })}
        <FlagBox code="TW" x={24} y={CT + 6} a={Math.max(hq, lk)} />
        <Sep x={300} y1={346} />
        <Row x={326} y={CT + 40} t="新竹：台灣總部" c={H.amber} a={hq} />
        <Row x={326} y={CT + 92} t="林口：新據點興建中" c={H.amber} a={lk} />
        <Row x={326} y={CT + 144} t="台中、台南：服務據點" c={BLUE} a={Math.max(hq, lk) * 0.8} px={30} />
        <text x={326} y={CT + 202} style={zh(30, H.text2, 800)} opacity={0.4 + 0.6 * mic}>台灣供應商（媒體報導）</text>
        {chip(326, mic, null, "帆宣")}{chip(530, gd, "gudeng", "家登")}{chip(734, kc, null, "公準")}
      </svg>
    </Card>
  );
};

// ── asml-next：曝光只負責照 → 照之前要先鋪薄膜 → 下一集：應用材料｜留言 ──
const Next: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330;
  const fm = on(f, T(o, "film")), nx = on(f, T(o, "next")), kw = on(f, T(o, "kw"));
  // 薄膜一層一層落下鋪上（受重力加速、落定小回彈）
  const layers = [0, 1, 2].map((i) => { const a = T(o, "film") + i * 8, n = f - a; if (n <= 0) return -80; if (n < 10) return -80 + 80 * (n / 10) ** 2; const m = n - 10; return 6 * Math.exp(-m / 4) * Math.sin(m * 0.9); });
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        <rect x={40} y={226} width={260} height={22} fill={WAF} stroke={WAF_D} strokeWidth={2} />
        {layers.map((dy, i) => dy > -80 ? <rect key={i} x={40} y={212 - i * 14 + dy} width={260} height={12} fill={["#7FA4E0", "#D9873A", "#9AA7BA"][i]} /> : null)}
        <text x={40} y={300} style={zh(30, H.text2, 800)}>照之前：先鋪薄膜</text>
        <Arrow x1={330} y1={200} x2={410} y2={200} c={H.text2} o={0.35 + 0.65 * nx} />
        <g opacity={0.35 + 0.65 * nx}>
          <FlagBox code="US" x={440} y={CT + 22} a={nx} />
          <text x={506} y={CT + 52} style={zh(32, H.text, 900)}>美國</text>
          <text x={440} y={CT + 124} style={zh(48, H.text, 900)}>應用材料</text>
          <text x={440} y={CT + 170} style={zh(30, H.text2, 800)}>下一集：設備五大-2</text>
        </g>
        <g opacity={kw} transform={`translate(${W / 2 + 150} 290) rotate(-2) scale(${1 + 0.3 * (1 - kw)})`}>
          <rect x={-200} y={-30} width={400} height={60} fill={H.amber} /><text x={0} y={12} textAnchor="middle" style={zh(34, onC(H.amber), 900)}>留言「ASML」拿資料</text>
        </g>
      </svg>
    </Card>
  );
};

// ── asml-lpp：雷射打錫滴（側視）：錫滴從噴嘴射出、往下加速 → 預脈衝打扁成餅 → 主脈衝打成電漿 → 往四面發光（光錐）、碎點噴開；相位＝3D 的 lpp 動作 ──
const Lpp: React.FC<P> = ({ o, f, k, m, s }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330;
  const src = (o as any).source ?? "lpp", d = (m.product.actions ?? {})[src] as any, op = s?.ops?.[src];
  const live = d && op && op.k > 0.01, ph = live ? lppPhase(d, op.t) : 0, vk = live ? op.k : 0, P2 = LPP;
  const fx = 330, top = 88, fy = 206, q = 4;
  const tri = (a: number, b: number) => (ph < a || ph > b ? 0 : Math.sin((Math.PI * (ph - a)) / (b - a)));
  const el: React.ReactNode[] = [];
  if (live) {
    for (let j = 0; j < q; j++) { if (j === 0 && ph >= P2.pre) continue; const t = 1 - (P2.pre - ph + j) / q; if (t < 0) continue; const u = 0.6 * t + 0.4 * t * t;
      el.push(<circle key={`d${j}`} cx={fx} cy={top + (fy - top) * u} r={12} fill={TIN} stroke={H.text2} strokeWidth={2} opacity={vk * Math.min(1, t * 6)} />); }
    const a = tri(P2.pre - 0.05, P2.pre + 0.05), b = tri(P2.main - 0.05, P2.main + 0.06);
    if (a > 0.01) el.push(<line key="pre" x1={30} y1={fy} x2={fx} y2={fy} stroke="#FF8A7A" strokeWidth={4 + 3 * a} opacity={vk * a} />);
    if (b > 0.01) el.push(<line key="main" x1={30} y1={fy} x2={fx} y2={fy} stroke={RED} strokeWidth={10 + 8 * b} opacity={vk * b} />);
    if (ph >= P2.pre && ph < P2.main + 0.02) { const e = EASE.enter(Math.min(1, (ph - P2.pre) / (P2.main - P2.pre))); el.push(<ellipse key="pan" cx={fx} cy={fy} rx={12 * (1 - 0.6 * e)} ry={12 + 30 * e} fill={TIN} stroke={H.text2} strokeWidth={2} opacity={vk} />); }
    if (ph >= P2.main) {
      const u = (ph - P2.main) / (1 - P2.main), fade = Math.pow(1 - u, 1.4), r = 16 + 30 * EASE.enter(Math.min(1, u * 3));
      // 光錐：電漿往左邊的碗形鏡發光（發散），亮度隨距離變淡
      el.push(<path key="cone" d={`M${fx} ${fy} L120 ${fy - 104} L120 ${fy + 92} Z`} fill={EUV} opacity={vk * fade * 0.28} />);
      el.push(<circle key="halo" cx={fx} cy={fy} r={r * 1.7} fill={EUV} opacity={vk * fade * 0.2} />, <circle key="pl" cx={fx} cy={fy} r={r} fill={EUV} opacity={vk * fade * 0.85} />);
      for (let j = 0; j < 8; j++) { const an = (j / 8) * Math.PI * 2 + 0.3, r0 = r + 4, r1 = r + 10 + 24 * EASE.enter(u); el.push(<line key={`ray${j}`} x1={fx + Math.cos(an) * r0} y1={fy + Math.sin(an) * r0} x2={fx + Math.cos(an) * r1} y2={fy + Math.sin(an) * r1} stroke={EUV} strokeWidth={4} strokeLinecap="round" opacity={vk * fade} />); }
    }
  }
  const step = !live ? -1 : ph < P2.pre ? 0 : ph < P2.main ? 1 : ph < P2.main + 0.1 ? 2 : 3;
  const items = ["① 錫滴落下", "② 預脈衝：打扁", "③ 主脈衝：電漿", "④ 發出極紫外光"];
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        <rect x={fx - 14} y={CT + 6} width={28} height={14} fill={H.text2} />
        <rect x={fx - 22} y={Hh - 30} width={44} height={14} fill={H.text2} />
        <path d={`M120 ${fy - 104} Q86 ${fy} 120 ${fy + 92}`} stroke={MIR} strokeWidth={8} fill="none" />
        <line x1={30} y1={fy} x2={fx - 26} y2={fy} stroke={RED} strokeOpacity={0.25} strokeWidth={2} strokeDasharray="8 7" />
        <text x={150} y={fy + 50} style={zh(30, H.text2, 800)}>雷射 →</text>
        <text x={24} y={CT + 26} style={zh(30, H.text2, 800)}>碗形鏡</text>
        {el}
        <Sep x={560} y1={Hh - 14} />
        {items.map((t, j) => <g key={j} opacity={step === j ? 1 : 0.4}><rect x={588} y={CT + 22 + j * 62} width={12} height={24} fill={step === j ? H.amber : H.lineSoft} />
          <text x={612} y={CT + 44 + j * 62} style={zh(30, H.text, 900)}>{t}</text></g>)}
      </svg>
    </Card>
  );
};

// ── asml-scan：光罩台與晶圓台反向掃描（側視）：位移＝3D vibrate 同一個正弦（兩端減速、中間最快），右邊速度條跟著變 ──
const Scan: React.FC<P> = ({ o, f, k, m, s }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330;
  const acts = (m.product.actions ?? {}) as any, dM = acts[(o as any).mask ?? "maskScan"], op = s?.ops?.[(o as any).mask ?? "maskScan"];
  const g = op ? op.g : 0, tt = op ? op.T : f / 30, fr = dM?.freq ?? 0.4, A = 110;
  const sx = Math.sin(2 * Math.PI * fr * tt), vx = Math.cos(2 * Math.PI * fr * tt);
  const mx = 290 + A * g * sx, wx = 290 - (A / 4) * g * sx;
  const cyc = ph(f, 1 / 8, 0, 1);
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        <rect x={mx - 130} y={CT + 16} width={260} height={26} fill={MASK} />
        {[0, 1, 2, 3, 4].map((i) => <rect key={i} x={mx - 110 + i * 46} y={CT + 42} width={24} height={8} fill="#E8EEF8" />)}
        <path d={`M262 ${CT + 52} L318 ${CT + 52} L298 248 L282 248 Z`} fill={EUV_L} opacity={0.35 + 0.3 * g} />
        <circle cx={290} cy={CT + 52 + (248 - CT - 52) * cyc} r={5} fill={EUV} opacity={0.4 + 0.5 * g} />
        <path d="M232 168 Q290 156 348 168" stroke={MIR} strokeWidth={7} fill="none" />
        <rect x={wx - 130} y={250} width={260} height={16} fill={WAF} stroke={WAF_D} strokeWidth={2} />
        <rect x={wx - 60} y={266} width={120} height={14} fill={H.text2} />
        <rect x={286} y={244} width={8} height={6} fill={EUV} />
        <Sep x={540} />
        <Row x={566} y={CT + 40} t="光罩台 ⇄" c={MASK} a={1} />
        <Row x={566} y={CT + 92} t="晶圓台反向，只走 1/4" c={WAF_D} a={1} px={30} />
        <text x={566} y={CT + 160} style={zh(30, H.text2, 800)}>速度</text>
        <rect x={640} y={CT + 136} width={280} height={30} fill="none" stroke={H.lineSoft} strokeWidth={2} />
        <rect x={642} y={CT + 138} width={276 * g * Math.abs(vx)} height={26} fill={Math.abs(vx) < 0.35 ? RED : OK} />
        <text x={566} y={CT + 230} style={zh(32, H.text, 900)} opacity={0.4 + 0.6 * g * (1 - Math.abs(vx))}>到盡頭：減速 → 折返</text>
      </svg>
    </Card>
  );
};

export const AsmlSection: React.FC<P> = (p) => {
  const kd = String((p.o as any).kind);
  if (kd === "asml-hook") return <Hook {...p} />;
  if (kd === "asml-proj") return <Proj {...p} />;
  if (kd === "asml-step") return <Step {...p} />;
  if (kd === "asml-col") return <Col {...p} />;
  if (kd === "asml-grid") return <Grid {...p} />;
  if (kd === "asml-co") return <Co {...p} />;
  if (kd === "asml-euv") return <Euv {...p} />;
  if (kd === "asml-num") return <Num {...p} />;
  if (kd === "asml-tw") return <Tw {...p} />;
  if (kd === "asml-next") return <Next {...p} />;
  if (kd === "asml-lpp") return <Lpp {...p} />;
  if (kd === "asml-scan") return <Scan {...p} />;
  return null;
};

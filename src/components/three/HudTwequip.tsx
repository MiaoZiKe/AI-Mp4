// 2026/11/27 tech-twequip：系列 2 第 12 集「台灣自己的設備廠」的 2D 示意卡（overlay `section` 的 kind 以 "twequip-" 開頭，Hud.tsx 的 HudSection 轉過來）。
//   twequip-hook 接上集（檢查完了 → 怎麼洗乾淨？）｜twequip-tour 拆開清洗機（前端搬運區 → 清洗腔 → 藥液櫃）｜twequip-foup 晶圓盒開門與映射（側視、風扇氣流向下）｜
//   twequip-arm 手臂直線伸入（俯視、三關節連桿、對照弧線）｜twequip-chamber 單片腔剖面（吸盤、抓取銷、液柱、液膜先厚後薄、甩出）｜twequip-cup 杯內分路（三層、一層一種藥液）｜
//   twequip-dry 甩乾乾區由中心向外（俯視同心圓＋IPA 臂跟隨）｜twequip-chem 藥液路徑（桶 → 泵 → 濾芯 → 加熱 → 混合閥 → 腔）｜twequip-batch 批次 vs 單片（專利範例數字）｜
//   twequip-who 台灣廠負責哪一段（流程條）｜twequip-co 公司（官網 LOGO、國旗、真實輪廓台灣地圖）｜twequip-next 下一集
// 全部示意，不標未查證的數字；結構一開始就畫出，念到時該處亮起、動起來；時間全部來自 script.json 的 t（cue）。
// 排版原則（card-overlap.mjs 檢查）：內容從 CARD_CONTENT_TOP 以下；字不放進會動的圖形範圍；字 ≥30px；字離圖形 ≥6px。
import React from "react";
import { FONT_ZH } from "../../theme";
import { H, L, CARD_HEAD, CARD_CONTENT_TOP, cardTitleBox } from "./hudSkin";
import { EASE, tween } from "../anim";
import type { Model3D, Overlay3D, State3D } from "./engine";
import { Flag, LogoSvg, hasLogo, logoW } from "./Brand";

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
const cl = (x: number) => Math.min(1, Math.max(0, x));
const fr = (x: number) => ((x % 1) + 1) % 1;
const ease = (u: number) => EASE.move(cl(u));
const RED = "#E0472F", OK = "#14A38B", BLUE = "#2F7FE0", WAF = "#B4C2DA", WAF_D = "#7F93B5", LIGHT = "#5BB8F0", DIE = "#7FA4E0", COR = "#E8613C", TEAL = "#2A7F8F", LIQ = "#58C9D8", CHEM = "#F08A2C", WATER = "#2F7FE0", IPAC = "#8A5BE0", GREY = "#8A93A6";
const Sep: React.FC<{ x: number; y0?: number; y1?: number }> = ({ x, y0 = CT + 4, y1 = 316 }) => <line x1={x} y1={y0} x2={x} y2={y1} stroke={H.lineSoft} strokeWidth={3} />;
const Arrow: React.FC<{ x1: number; y1: number; x2: number; y2: number; c: string; w?: number; o?: number }> = ({ x1, y1, x2, y2, c, w = 5, o = 1 }) => {
  const a = Math.atan2(y2 - y1, x2 - x1), s = w * 2.6;
  return <g opacity={o}><path d={`M${x1} ${y1} L${x2 - Math.cos(a) * s * 0.8} ${y2 - Math.sin(a) * s * 0.8}`} stroke={c} strokeWidth={w} />
    <path d={`M${x2} ${y2} L${x2 - Math.cos(a) * s - Math.sin(a) * s * 0.6} ${y2 - Math.sin(a) * s + Math.cos(a) * s * 0.6} L${x2 - Math.cos(a) * s + Math.sin(a) * s * 0.6} ${y2 - Math.sin(a) * s - Math.cos(a) * s * 0.6} Z`} fill={c} /></g>;
};
const Check: React.FC<{ x: number; y: number; o?: number }> = ({ x, y, o = 1 }) => <path opacity={o} d={`M${x - 18} ${y} l12 12 l26 -28`} stroke={OK} strokeWidth={7} fill="none" />;
const Row: React.FC<{ x: number; y: number; t: string; c: string; a: number; px?: number }> = ({ x, y, t, c, a, px = 30 }) => (
  <g opacity={0.35 + 0.65 * a}><rect x={x} y={y - px * 0.72} width={12} height={px * 0.72} fill={c} /><text x={x + 24} y={y} style={zh(px, H.text, 900)}>{t}</text></g>
);
const LogoBox: React.FC<{ id: string; x: number; y: number; h: number; a: number; maxW?: number; name?: string }> = ({ id, x, y, h, a, maxW = 260, name = "" }) => {
  const st = a > 0.5 ? H.amber : H.lineSoft, sw = a > 0.5 ? 4 : 1.5;
  if (!hasLogo(id)) return <g><rect x={x} y={y} width={maxW} height={h + 12} fill="#FFFFFF" stroke={st} strokeWidth={sw} /><text x={x + 14} y={y + h * 0.78} style={zh(Math.round(h * 0.7), "#1F3A5F", 900)}>{name}</text></g>;
  const lw = Math.min(maxW, logoW(id, h)), lh = (h * lw) / logoW(id, h);
  return <g><rect x={x} y={y} width={lw + 16} height={h + 12} fill="#FFFFFF" stroke={st} strokeWidth={sw} /><LogoSvg id={id} x={x + 8} y={y + 6 + (h - lh) / 2} h={lh} /></g>;
};
const FlagBox: React.FC<{ code: string; x: number; y: number; a: number }> = ({ code, x, y, a }) => (
  <g><rect x={x} y={y} width={50} height={36} fill="none" stroke={a > 0.5 ? H.amber : H.lineSoft} strokeWidth={a > 0.5 ? 4 : 1.5} /><Flag code={code} h={28} x={x + 4} y={y + 4} asSvg /></g>
);
const rnd = (i: number) => fr(Math.sin(i * 12.9898 + 4.1) * 43758.5453);
/** 俯視晶圓（晶粒格），可帶微粒 */
const WaferTop: React.FC<{ cx: number; cy: number; r: number; dust?: number; dieOp?: number; fill?: string }> = ({ cx, cy, r, dust = 0, dieOp = 1, fill = WAF }) => {
  const s = r / 4.4, dies: [number, number][] = [];
  for (let i = -4; i <= 3; i++) for (let j = -4; j <= 3; j++) { const x = (i + 0.5) * s, y = (j + 0.5) * s; if (Math.hypot(Math.abs(x) + s / 2, Math.abs(y) + s / 2) < r - 2) dies.push([x, y]); }
  return <g><circle cx={cx} cy={cy} r={r} fill={fill} stroke={WAF_D} strokeWidth={2} />
    {dies.map(([x, y], i) => <rect key={i} x={cx + x - s / 2 + 1.5} y={cy + y - s / 2 + 1.5} width={s - 3} height={s - 3} fill={DIE} opacity={dieOp} />)}
    <path d={`M${cx - 6} ${cy + r} l6 -8 l6 8 Z`} fill={WAF_D} />
    {dust > 0 ? Array.from({ length: 9 }, (_, i) => { const a = rnd(i) * 6.28, d = rnd(i + 20) * (r - 14); return <circle key={i} cx={cx + Math.cos(a) * d} cy={cy + Math.sin(a) * d} r={4} fill={RED} opacity={dust} />; }) : null}</g>;
};
const TW_PATH = "M180.3 82.0 L192.0 91.6 L202.6 99.9 L207.3 100.6 L197.3 110.2 L199.1 127.4 L195.6 136.4 L185.0 166.5 L179.1 190.8 L170.9 222.8 L157.4 245.2 L142.8 271.4 L139.9 299.6 L132.8 297.7 L125.2 270.2 L116.4 263.8 L105.8 253.5 L98.8 229.8 L94.7 219.6 L98.8 204.9 L101.7 179.3 L113.5 162.0 L119.3 147.9 L129.3 133.2 L144.0 112.7 L153.3 99.3 L172.1 89.7Z";
/** 台灣真實輪廓（經緯度 27 點投影，同 HudKla／HudAsml）：左上角放在 (x, y)，縮放 s */
const TwMap: React.FC<{ x: number; y: number; s: number; a: number; c?: string }> = ({ x, y, s, a, c = OK }) => (
  <path d={TW_PATH} transform={`translate(${x - 94.7 * s} ${y - 82 * s}) scale(${s})`} fill={c} opacity={0.3 + 0.35 * a} stroke={c} strokeWidth={3 / s} strokeLinejoin="round" />
);

// ── twequip-hook：上集 KLA 檢查完了（找到髒點）→ 怎麼洗乾淨？；右：台灣輪廓＋國旗「台灣設備廠做哪一段？」 ──
const Hook: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 360;
  const pv = on(f, T(o, "prev")), q = on(f, T(o, "q")), tw = on(f, T(o, "tw"));
  const u = fr((f - T(o, "q")) / 60), wipe = ease((f - T(o, "q") - 10) / 40);
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        <g opacity={0.45 + 0.55 * pv}><WaferTop cx={120} cy={CT + 120} r={90} dust={pv * (1 - wipe)} /></g>
        <Arrow x1={226} y1={CT + 120} x2={282} y2={CT + 120} c={BLUE} w={5} o={0.3 + 0.7 * q} />
        <g opacity={0.35 + 0.65 * q}><WaferTop cx={390} cy={CT + 120} r={90} dust={0} fill="#C9D6EE" /><path d={`M${352} ${CT + 128} l-14 -50 l20 18 l16 -34 l14 40 l20 -22`} stroke={LIGHT} strokeWidth={4} fill="none" opacity={0.5 + 0.5 * Math.sin(u * 6.28)} /></g>
        <text x={28} y={CT + 268} style={zh(30, H.text2, 800)} opacity={0.4 + 0.6 * pv}>上集：測出髒點</text>
        <text x={290} y={CT + 268} style={zh(40, H.text, 900)} opacity={0.35 + 0.65 * q}>怎麼洗乾淨？</text>
        <Sep x={560} />
        <TwMap x={620} y={CT + 14} s={0.78} a={tw} />
        <FlagBox code="TW" x={780} y={CT + 20} a={tw} />
        <g opacity={0.35 + 0.65 * tw}><text x={716} y={CT + 130} style={zh(30, H.text, 900)}>台灣設備廠</text>
          <text x={716} y={CT + 176} style={zh(30, H.text2, 800)}>做哪一段？</text></g>
      </svg>
    </Card>
  );
};

// ── twequip-tour：三大模組一路點亮（前端搬運區 → 清洗腔 → 藥液櫃），晶圓沿箭頭走 ──
const Tour: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 360;
  const items: [string, string, string, string][] = [["efem", "前端搬運區", "管進出", BLUE], ["chamber", "清洗腔", "一片一片洗", OK], ["cab", "藥液櫃", "供應藥液", COR]];
  const a = items.map(([id]) => on(f, T(o, id)));
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        {items.map(([, t, d, c], i) => { const x = 30 + i * 306; return <g key={i} opacity={0.35 + 0.65 * a[i]}>
          <rect x={x} y={CT + 30} width={250} height={124} fill={a[i] > 0.5 ? "#FFF6E0" : "#FFFFFF"} stroke={a[i] > 0.5 ? c : H.lineSoft} strokeWidth={a[i] > 0.5 ? 5 : 2} />
          <text x={x + 125} y={CT + 84} textAnchor="middle" style={zh(34, H.text, 900)}>{t}</text>
          <text x={x + 125} y={CT + 132} textAnchor="middle" style={zh(30, H.text2, 800)}>{d}</text>
          {i < 2 ? <Arrow x1={x + 256} y1={CT + 92} x2={x + 300} y2={CT + 92} c={H.text2} w={4} o={0.4 + 0.6 * a[i + 1]} /> : null}</g>; })}
        <text x={30} y={CT + 214} style={zh(30, H.text2, 800)} opacity={0.4 + 0.6 * a[2]}>三塊接在一起，才洗得動一片晶圓</text>
        <Check x={880} y={CT + 202} o={a[2]} />
      </svg>
    </Card>
  );
};

// ── twequip-foup：側視。頂部風扇濾網氣流向下；晶圓盒開門（門降下）；映射光束由上掃到下，缺片的那一槽亮紅 ──
const Foup: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 360;
  const fn = on(f, T(o, "fan")), dr = on(f, T(o, "door")), mp = on(f, T(o, "map")), sl = on(f, T(o, "slot"));
  const sweep = ease((f - T(o, "map")) / 80), x0 = 420, y0 = CT + 18, n = 8, gap = 4;
  const slotY = (i: number) => y0 + 14 + i * 24;
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        <rect x={30} y={CT + 14} width={230} height={44} fill="#FFFFFF" stroke={fn > 0.5 ? BLUE : H.lineSoft} strokeWidth={fn > 0.5 ? 4 : 2} />
        <text x={145} y={CT + 46} textAnchor="middle" style={zh(30, H.text, 900)} opacity={0.4 + 0.6 * fn}>風扇濾網</text>
        {[60, 110, 160, 210].map((x, i) => { const t = fr(f / 24 + i * 0.25); return <g key={i} opacity={fn}><line x1={x} y1={CT + 66} x2={x} y2={CT + 66 + 150} stroke={LIGHT} strokeWidth={2} opacity={0.4} />
          <circle cx={x} cy={CT + 66 + t * 150} r={5} fill={LIGHT} /></g>; })}
        <text x={30} y={CT + 252} style={zh(30, H.text2, 800)} opacity={0.4 + 0.6 * fn}>氣流向下排出</text>
        <Sep x={296} />
        <rect x={x0} y={y0} width={190} height={n * 24 + 36} fill="none" stroke={H.text2} strokeWidth={4} />
        <rect x={x0 - 4 + 0} y={y0 + 4 + 120 * ease((f - T(o, "door") - 8) / 14) * dr} width={10} height={n * 24 + 28 - 120 * ease((f - T(o, "door") - 8) / 14) * dr} fill={GREY} opacity={1 - 0.0} />
        {Array.from({ length: n }, (_, i) => { const miss = i === gap; const hit = sweep * (n * 24 + 36) + y0 > slotY(i) && mp > 0.5; return <g key={i}>
          {miss ? <rect x={x0 + 28} y={slotY(i) - 4} width={140} height={16} fill="none" stroke={hit ? RED : H.lineSoft} strokeWidth={hit ? 3 : 1.5} strokeDasharray="6 5" />
            : <ellipse cx={x0 + 98} cy={slotY(i) + 4} rx={72} ry={8} fill={WAF} stroke={hit ? OK : WAF_D} strokeWidth={hit ? 3 : 1.5} />}
        </g>; })}
        <line x1={x0 - 30} y1={y0 + sweep * (n * 24 + 30)} x2={x0 + 220} y2={y0 + sweep * (n * 24 + 30)} stroke={RED} strokeWidth={4} opacity={mp} />
        <Sep x={690} />
        <text x={704} y={CT + 46} style={zh(30, H.text, 900)} opacity={0.4 + 0.6 * mp}>感測器掃過</text>
        {Array.from({ length: n }, (_, i) => <circle key={i} cx={712 + i * 26} cy={CT + 92} r={9} fill={i === gap ? (sl > 0.5 ? RED : "#FFFFFF") : (sweep * n > i ? OK : "#FFFFFF")} stroke={i === gap ? RED : OK} strokeWidth={2.5} />)}
        <text x={704} y={CT + 156} style={zh(30, H.text2, 800)} opacity={0.4 + 0.6 * sl}>缺一片也看得出來</text>
        <text x={704} y={CT + 202} style={zh(30, H.text2, 800)} opacity={0.4 + 0.6 * sl}>也抓得到疊片</text>
        <text x={704} y={CT + 248} style={zh(30, H.text2, 800)} opacity={0.4 + 0.6 * dr}>片數為示意</text>
      </svg>
    </Card>
  );
};

// ── twequip-arm：俯視。三關節連桿（肩、肘、腕）＋雙刀；刀片沿直線伸入盒內（右上對照：弧線會撞到盒口）；下排：取 → 對準 → 放 ──
const ArmCard: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 360;
  const ar = on(f, T(o, "arm")), lf = on(f, T(o, "lift")), al = on(f, T(o, "align")), pt = on(f, T(o, "put"));
  const L1 = 92, BLEN = 40, bx = 90, by = CT + 120;                       // 肩座標
  const ext = 0.5 + 0.5 * Math.sin((f - T(o, "arm")) / 14 - 1.57) * ar;      // 伸出比例（來回，緩入緩出）
  const tipX = bx + 70 + 150 * ease(ext), d = Math.max(20, tipX - BLEN - bx), al1 = Math.acos(Math.min(1, d / (2 * L1)));
  const ex = bx + L1 * Math.cos(al1), ey = by - L1 * Math.sin(al1), wx = bx + d, wy = by;
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        <rect x={430} y={CT + 70} width={90} height={100} fill="none" stroke={H.text2} strokeWidth={4} />
        <circle cx={480} cy={by} r={30} fill={WAF} stroke={WAF_D} strokeWidth={2} opacity={0.5 + 0.5 * ar} />
        <circle cx={bx} cy={by} r={18} fill={H.text2} /><line x1={bx} y1={by} x2={ex} y2={ey} stroke={BLUE} strokeWidth={14} strokeLinecap="round" /><line x1={ex} y1={ey} x2={wx} y2={wy} stroke={TEAL} strokeWidth={12} strokeLinecap="round" />
        <circle cx={ex} cy={ey} r={10} fill={H.text} /><circle cx={wx} cy={wy} r={9} fill={H.text} />
        <line x1={wx} y1={wy - 9} x2={wx + BLEN} y2={wy - 9} stroke={H.amber} strokeWidth={6} /><line x1={wx} y1={wy + 9} x2={wx + BLEN} y2={wy + 9} stroke={H.amber} strokeWidth={6} />
        <text x={30} y={CT + 226} style={zh(30, H.text2, 800)} opacity={0.4 + 0.6 * ar}>刀片走直線，不碰盒口</text>
        <Sep x={560} />
        <path d={`M610 ${CT + 150} Q690 ${CT + 40} 770 ${CT + 150}`} stroke={RED} strokeWidth={4} fill="none" strokeDasharray="8 6" opacity={0.7} />
        <path d={`M792 ${CT + 148} l24 24 M816 ${CT + 148} l-24 24`} stroke={RED} strokeWidth={6} opacity={0.8} /><text x={600} y={CT + 196} style={zh(30, RED, 900)}>弧線 ✗</text>
        <Row x={600} y={CT + 232} t="上刀載片・下刀空刀" c={lf > 0.5 ? H.amber : H.lineSoft} a={lf} />
        <Row x={600} y={CT + 276} t="② 轉一圈對準缺口" c={al > 0.5 ? H.amber : H.lineSoft} a={al} />
      </svg>
    </Card>
  );
};

// ── twequip-chamber：單片腔側視剖面。吸盤＋6 顆抓取銷＋晶圓轉（箭頭）；噴嘴臂落下一條液柱；液膜先厚後薄；邊緣甩出液滴撞杯壁 ──
const Chamber: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 360;
  const sp = on(f, T(o, "spin")), nz = on(f, T(o, "nz")), st = on(f, T(o, "stream")), fm = on(f, T(o, "film")), fl = on(f, T(o, "fling"));
  const cx = 250, wy = CT + 112, R = 130, gap = ease((f - T(o, "film")) / 40);
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        <rect x={cx - 50} y={wy + 16} width={100} height={22} fill="#C9D3E3" stroke={WAF_D} strokeWidth={2} />
        <rect x={cx - 14} y={wy + 38} width={28} height={62} fill="#9AA6BC" />
        <rect x={cx - 40} y={wy + 100} width={80} height={30} fill={H.text2} />
        {[-R - 8, R + 8].map((x, i) => <rect key={i} x={cx + x - 5} y={wy + 4} width={10} height={14} fill={H.text2} />)}
        <rect x={cx - R} y={wy} width={2 * R} height={10} fill={WAF} stroke={WAF_D} strokeWidth={2} />
        {fm > 0 ? <path d={`M${cx - R} ${wy} L${cx - R} ${wy - 3} Q${cx - R * 0.6} ${wy - 4 - 12 * gap} ${cx} ${wy - 3 - 18 * gap} Q${cx + R * 0.6} ${wy - 4 - 12 * gap} ${cx + R} ${wy - 3} L${cx + R} ${wy} Z`} fill={LIQ} opacity={0.7 * fm} /> : null}
        <path d={`M${cx - R - 74} ${wy - 40} L${cx - R - 74} ${wy + 112} M${cx + R + 74} ${wy - 40} L${cx + R + 74} ${wy + 112}`} stroke={GREY} strokeWidth={5} />
        {nz > 0 ? <g opacity={nz}><rect x={cx - 12} y={CT + 22} width={34} height={20} fill={COR} /><line x1={cx - 12} y1={CT + 32} x2={cx - 150} y2={CT + 32} stroke={COR} strokeWidth={8} /></g> : null}
        {st > 0 ? <line x1={cx + 5} y1={CT + 42} x2={cx + 5} y2={wy - 4} stroke={LIQ} strokeWidth={5} opacity={st} /> : null}
        {fl > 0 ? [0, 1, 2, 3].map((i) => { const t = fr(f / 22 + i * 0.25); return <g key={i} opacity={fl}>
          <circle cx={cx + R + t * 66} cy={wy - 4 + t * t * 22} r={5} fill={LIQ} /><circle cx={cx - R - t * 66} cy={wy - 4 + t * t * 22} r={5} fill={LIQ} /></g>; }) : null}
        <ellipse cx={cx} cy={wy + 24} rx={R + 22} ry={14} fill="none" stroke={BLUE} strokeWidth={5} strokeDasharray="14 10" strokeDashoffset={-((f * 3) % 24)} opacity={sp} />
        <text x={cx} y={wy + 172} textAnchor="middle" style={zh(30, H.text2, 800)} opacity={0.4 + 0.6 * sp}>吸盤＋抓取銷</text>
        <Sep x={560} y1={330} />
        <Row x={590} y={CT + 52} t="轉動：離心力往外" c={sp > 0.5 ? H.amber : H.lineSoft} a={sp} />
        <Row x={590} y={CT + 112} t="一條液柱落在中心" c={st > 0.5 ? H.amber : H.lineSoft} a={st} />
        <Row x={590} y={CT + 172} t="液膜：先厚後薄" c={fm > 0.5 ? H.amber : H.lineSoft} a={fm} />
        <Row x={590} y={CT + 232} t="液滴被甩出杯壁" c={fl > 0.5 ? H.amber : H.lineSoft} a={fl} />
      </svg>
    </Card>
  );
};

// ── twequip-cup：杯內分路。杯的剖面三個進液槽（橘＝化學液、藍＝純水、紫＝IPA），杯子升降讓不同槽對準晶圓；右：拆開腔體的順序 ──
const CupCard: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 360;
  const sp = on(f, T(o, "split")), nz = on(f, T(o, "nz")), cu = on(f, T(o, "cup")), ch = on(f, T(o, "chk")), mo = on(f, T(o, "mot"));
  const cx = 190, top = CT + 6, slot = (i: number) => top + 20 + i * 52;
  const lvl = ease((f - T(o, "cup") - 18) / 24), act = cu < 0.5 ? 1 : lvl < 0.5 ? 1 : 0, cupDy = (act === 1 ? 0 : -52) * (cu > 0.5 ? 1 : 0) + 0;   // 杯子上移 52＝水槽對準晶圓
  const wafY = slot(1) + 22 - cupDy * 0;
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        <g>
          {[[0, WATER], [1, CHEM], [2, IPAC]].map(([i, c]: any) => <g key={i}><rect x={cx + 110} y={slot(i)} width={14} height={42} fill={c} opacity={0.35 + 0.65 * cu} /><rect x={cx - 124} y={slot(i)} width={14} height={42} fill={c} opacity={0.35 + 0.65 * cu} /></g>)}
          <rect x={cx - 124} y={slot(0) - 14} width={248} height={8} fill={H.text2} /><rect x={cx - 124} y={slot(2) + 52} width={248} height={8} fill={H.text2} />
          {[0, 1, 2, 3].map((i) => <rect key={i} x={cx - 124} y={slot(0) + i * 52 - 14 + (i ? 0 : 0)} width={248 - 0} height={0} fill="none" />)}
          {[1, 2].map((i) => <g key={i}><rect x={cx - 124} y={slot(i) - 10} width={52} height={6} fill={H.text2} /><rect x={cx + 72} y={slot(i) - 10} width={52} height={6} fill={H.text2} /></g>)}
          <path d={`M${cx - 124} ${slot(2) + 60} L${cx - 40} ${slot(2) + 90} L${cx + 40} ${slot(2) + 90} L${cx + 124} ${slot(2) + 60}`} fill="none" stroke={H.text2} strokeWidth={6} />
        </g>
        <rect x={cx - 80} y={wafY} width={160} height={8} fill={WAF} stroke={WAF_D} strokeWidth={2} />
        <rect x={cx - 14} y={wafY + 8} width={28} height={110} fill="#9AA6BC" />
        <text x={cx} y={CT + 262} textAnchor="middle" style={zh(30, H.text2, 800)} opacity={0.4 + 0.6 * cu}>一層一種藥液</text>
        <Sep x={420} />
        <Row x={450} y={CT + 46} t="噴嘴臂：噴藥液" c={nz > 0.5 ? H.amber : H.lineSoft} a={nz} />
        <Row x={450} y={CT + 100} t="擋液杯：三層分路" c={cu > 0.5 ? H.amber : H.lineSoft} a={cu} />
        <Row x={450} y={CT + 154} t="吸盤：抓住晶圓邊緣" c={ch > 0.5 ? H.amber : H.lineSoft} a={ch} />
        <Row x={450} y={CT + 208} t="馬達：帶著它轉" c={mo > 0.5 ? H.amber : H.lineSoft} a={mo} />
        <text x={450} y={CT + 262} style={zh(30, H.text2, 800)} opacity={0.4 + 0.6 * sp}>通例 1：1：5・70–85℃</text>
      </svg>
    </Card>
  );
};

// ── twequip-dry：俯視晶圓。乾區（同心圓）由中心向外擴大；IPA 臂（紫）跟著邊緣走；氮氣（淡藍）在前面吹 ──
const Dry: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 360;
  const dr = on(f, T(o, "dry")), ex = on(f, T(o, "expand")), ip = on(f, T(o, "ipa")), mk = on(f, T(o, "mark"));
  const cx = 160, cy = CT + 130, R = 100, g = ease((f - T(o, "expand")) / 66), rd = 8 + (R - 14) * g;
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        <circle cx={cx} cy={cy} r={R} fill={LIQ} opacity={0.35 + 0.25 * (1 - g)} stroke={WAF_D} strokeWidth={2} />
        <circle cx={cx} cy={cy} r={rd * ex} fill={WAF} stroke={OK} strokeWidth={5} />
        <g opacity={ip}><line x1={cx + 150} y1={cy - 80} x2={cx + rd * 0.7} y2={cy - rd * 0.7} stroke={IPAC} strokeWidth={10} strokeLinecap="round" /><circle cx={cx + rd * 0.7} cy={cy - rd * 0.7} r={9} fill={IPAC} />
          <circle cx={cx + rd * 0.7 - 14} cy={cy - rd * 0.7 + 14} r={6} fill="#BFEFFF" /></g>
        <text x={cx} y={CT + 262} textAnchor="middle" style={zh(30, H.text2, 800)} opacity={0.4 + 0.6 * dr}>由中心先乾</text>
        <Sep x={400} />
        <Row x={430} y={CT + 52} t="① 轉更快：甩掉大部分" c={dr > 0.5 ? H.amber : H.lineSoft} a={dr} />
        <Row x={430} y={CT + 112} t="② 乾區由中心向外擴" c={ex > 0.5 ? H.amber : H.lineSoft} a={ex} />
        <Row x={430} y={CT + 172} t="③ 異丙醇降低表面張力" c={ip > 0.5 ? H.amber : H.lineSoft} a={ip} />
        <Row x={430} y={CT + 232} t="④ 避免水痕" c={mk > 0.5 ? H.amber : H.lineSoft} a={mk} />
        <Check x={880} y={CT + 226} o={mk} />
      </svg>
    </Card>
  );
};

// ── twequip-chem：藥液路徑 桶 → 幫浦 → 濾芯 → 加熱 → 混合閥 → 腔；點沿管路流動；下方電控箱 ──
const Chem: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 360;
  const tk = on(f, T(o, "tank")), pu = on(f, T(o, "pump")), mx = on(f, T(o, "mix")), eb = on(f, T(o, "eb"));
  const nodes: [string, number, string][] = [["藥液桶", tk, COR], ["幫浦", pu, BLUE], ["濾芯", pu, BLUE], ["加熱", pu, CHEM], ["混合閥", mx, OK], ["清洗腔", mx, H.text2]];
  const y = CT + 70, dx = 152, x0 = 76, bw = 100;
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        {nodes.slice(0, 5).map((_, i) => <g key={i}><line x1={x0 + i * dx + bw / 2} y1={y} x2={x0 + (i + 1) * dx - bw / 2} y2={y} stroke={H.lineSoft} strokeWidth={6} />
          <circle cx={x0 + i * dx + bw / 2 + ((fr(f / 40 + i * 0.3)) * (dx - bw))} cy={y} r={7} fill={i < 2 ? CHEM : i < 4 ? WATER : LIQ} opacity={tk} /></g>)}
        {nodes.map(([t, a, c], i) => <g key={i} opacity={0.4 + 0.6 * a}><rect x={x0 + i * dx - bw / 2} y={y - 34} width={bw} height={68} fill={a > 0.5 ? "#FFF6E0" : "#FFFFFF"} stroke={a > 0.5 ? c : H.lineSoft} strokeWidth={a > 0.5 ? 4 : 2} />
          <text x={x0 + i * dx} y={y + 10} textAnchor="middle" style={zh(30, H.text, 900)}>{t}</text></g>)}
        <text x={30} y={CT + 152} style={zh(30, H.text2, 800)} opacity={0.4 + 0.6 * mx}>純水＋藥液，按比例混合</text>
        <text x={30} y={CT + 198} style={zh(30, H.text2, 800)} opacity={0.4 + 0.6 * mx}>歷史常見配比 1：1：5（通例，本機不標）</text>
        <g opacity={0.4 + 0.6 * eb}><rect x={30} y={CT + 224} width={330} height={52} fill={eb > 0.5 ? "#FFF6E0" : "#FFFFFF"} stroke={eb > 0.5 ? H.amber : H.lineSoft} strokeWidth={eb > 0.5 ? 4 : 2} />
          <text x={46} y={CT + 260} style={zh(30, H.text, 900)}>電控箱：控制整套動作</text></g>
      </svg>
    </Card>
  );
};

// ── twequip-batch：批次 vs 單片（專利範例的時間；不是機台規格）。上：批次一條長條；下：單片一格一格 ──
const Batch: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 360;
  const bt = on(f, T(o, "bat")), on1 = on(f, T(o, "one")), sg = on(f, T(o, "sgl")), us = on(f, T(o, "use"));
  const g1 = ease((f - T(o, "one")) / 50), g2 = ease((f - T(o, "sgl")) / 40);
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        <text x={30} y={CT + 40} style={zh(30, H.text, 900)} opacity={0.4 + 0.6 * bt}>批次：一批數十片一起泡</text>
        <rect x={30} y={CT + 56} width={700} height={40} fill="#FFFFFF" stroke={bt > 0.5 ? H.amber : H.lineSoft} strokeWidth={bt > 0.5 ? 4 : 2} /><rect x={30} y={CT + 56} width={700 * g1} height={40} fill={CHEM} opacity={0.85} />
        <text x={748} y={CT + 88} style={zh(30, H.text2, 800)} opacity={0.4 + 0.6 * on1}>約一小時多</text>
        <text x={30} y={CT + 150} style={zh(30, H.text, 900)} opacity={0.4 + 0.6 * sg}>單片：一片一片洗，每片目標約 2 分鐘</text>
        {Array.from({ length: 11 }, (_, i) => <rect key={i} x={30 + i * 64} y={CT + 166} width={58} height={40} fill={i < Math.floor(g2 * 11) ? OK : "#FFFFFF"} stroke={sg > 0.5 ? H.amber : H.lineSoft} strokeWidth={sg > 0.5 ? 3 : 2} />)}
        <text x={30} y={CT + 254} style={zh(30, H.text2, 800)} opacity={0.4 + 0.6 * us}>專利範例，不是弘塑／辛耘機台規格</text>
        <text x={700} y={CT + 254} style={zh(34, H.text, 900)} opacity={0.4 + 0.6 * us}>各有用途</text>
      </svg>
    </Card>
  );
};

// ── twequip-who：流程條。晶圓廠最前段（外商為主）→ 中段／先進封裝（台灣廠打進）→ 封測；濕式清洗那一格亮色 ──
const Who: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 360;
  const fr_ = on(f, T(o, "front")), fo = on(f, T(o, "foreign")), tw = on(f, T(o, "tw")), bk = on(f, T(o, "back"));
  const cols: [string, string, number, string][] = [["晶圓廠最前段", "電晶體階段", fr_, GREY], ["中段・先進封裝", "封裝端", tw, OK], ["封測", "切割與測試", bk, BLUE]];
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        {cols.map(([t, s, a, c], i) => { const x = 30 + i * 306; return <g key={i} opacity={0.4 + 0.6 * a}>
          <rect x={x} y={CT + 12} width={250} height={92} fill={a > 0.5 ? "#FFF6E0" : "#FFFFFF"} stroke={a > 0.5 ? c : H.lineSoft} strokeWidth={a > 0.5 ? 5 : 2} />
          <text x={x + 125} y={CT + 58} textAnchor="middle" style={zh(32, H.text, 900)}>{t}</text><text x={x + 125} y={CT + 94} textAnchor="middle" style={zh(30, H.text2, 800)}>{s}</text>
          {i < 2 ? <Arrow x1={x + 256} y1={CT + 58} x2={x + 300} y2={CT + 58} c={H.text2} w={4} o={0.5} /> : null}</g>; })}
        <FlagBox code="JP" x={30} y={CT + 196} a={fo} /><FlagBox code="US" x={92} y={CT + 196} a={fo} /><FlagBox code="TW" x={530} y={CT + 144} a={tw} />
        <g opacity={0.35 + 0.65 * fo}><rect x={30} y={CT + 134} width={250} height={56} fill="#FFFFFF" stroke={fo > 0.5 ? GREY : H.lineSoft} strokeWidth={fo > 0.5 ? 4 : 2} /><text x={44} y={CT + 172} style={zh(30, H.text, 900)}>日系、美系大廠</text>
          <text x={158} y={CT + 226} style={zh(30, H.text2, 800)}>外商為主</text></g>
        <g opacity={0.35 + 0.65 * tw}><rect x={336} y={CT + 134} width={250} height={56} fill="#FFFFFF" stroke={tw > 0.5 ? OK : H.lineSoft} strokeWidth={tw > 0.5 ? 4 : 2} /><text x={350} y={CT + 172} style={zh(30, H.text, 900)}>弘塑、辛耘</text>
          <text x={336} y={CT + 224} style={zh(30, H.text2, 800)}>濕式清洗、蝕刻</text></g>
        <g opacity={0.35 + 0.65 * bk}><text x={642} y={CT + 172} style={zh(30, H.text2, 800)}>濕製程也用得到</text></g>
        <text x={30} y={CT + 272} style={zh(30, H.text2, 800)} opacity={0.4 + 0.6 * tw}>媒體報導；不列市占數字</text>
      </svg>
    </Card>
  );
};

// ── twequip-co：弘塑、辛耘、家登三家（官網 LOGO 原檔）＋台灣國旗＋真實輪廓；機台外觀為示意 ──
const Co: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 360;
  const a = [on(f, T(o, "gptc")), on(f, T(o, "gptc")), on(f, T(o, "gdg"))];
  const rows: [string, string, string, string][] = [["gptc", "弘塑 GPTC", "濕式清洗機、金屬蝕刻", "3131"], ["scientech", "辛耘 Scientech", "自製濕式清洗機", "3583"], ["gudeng", "家登 Gudeng", "晶圓盒", "3680"]];
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        {rows.map(([id, nm, job, code], i) => { const y = CT + 8 + i * 84; return <g key={id}>
          <LogoBox id={id} x={28} y={y} h={50} a={a[i]} maxW={250} name={nm} />
          <g opacity={0.35 + 0.65 * a[i]}><text x={320} y={y + 36} style={zh(32, H.text, 900)}>{job}</text><text x={672} y={y + 36} style={zh(30, H.text2, 800)}>{code}</text></g></g>; })}
        <TwMap x={772} y={CT + 6} s={0.82} a={Math.max(...a)} />
        <FlagBox code="TW" x={850} y={CT + 6} a={Math.max(...a)} />
        <text x={28} y={CT + 272} style={zh(30, H.text2, 800)} opacity={0.4 + 0.6 * a[2]}>機台外觀為示意，非其實機</text>
      </svg>
    </Card>
  );
};

// ── twequip-next：下一集（濺鍍靶材）：清洗之後是薄膜沉積 ──
const Next: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 360;
  const nx = on(f, T(o, "next")), kw = on(f, T(o, "kw"));
  const cos = ["曝光", "蝕刻", "清洗", "沉積", "靶材"];
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        {cos.map((t, i) => { const x = 30 + i * 180, hi = i === 4; return <g key={i} opacity={hi ? 0.4 + 0.6 * nx : 0.75}>
          <rect x={x} y={CT + 20} width={150} height={70} fill={hi ? "#FFF4DA" : "#FFFFFF"} stroke={hi ? H.amber : H.lineSoft} strokeWidth={hi ? 4 : 2} />
          <text x={x + 75} y={CT + 66} textAnchor="middle" style={zh(30, H.text, 900)}>{t}</text>
          {i < 4 ? <Arrow x1={x + 154} y1={CT + 55} x2={x + 176} y2={CT + 55} c={H.text2} w={4} /> : null}</g>; })}
        <Check x={830} y={CT + 128} o={nx} />
        <g opacity={0.35 + 0.65 * nx}><text x={30} y={CT + 176} style={zh(36, H.text, 900)}>下一集：濺鍍靶材</text></g>
        <text x={30} y={CT + 246} style={zh(30, H.text2, 800)} opacity={0.4 + 0.6 * kw}>留言「設備廠」拿完整資料</text>
      </svg>
    </Card>
  );
};

export const TwequipSection: React.FC<P> = (p) => {
  const kd = String((p.o as any).kind);
  if (kd === "twequip-hook") return <Hook {...p} />;
  if (kd === "twequip-tour") return <Tour {...p} />;
  if (kd === "twequip-foup") return <Foup {...p} />;
  if (kd === "twequip-arm") return <ArmCard {...p} />;
  if (kd === "twequip-chamber") return <Chamber {...p} />;
  if (kd === "twequip-cup") return <CupCard {...p} />;
  if (kd === "twequip-dry") return <Dry {...p} />;
  if (kd === "twequip-chem") return <Chem {...p} />;
  if (kd === "twequip-batch") return <Batch {...p} />;
  if (kd === "twequip-who") return <Who {...p} />;
  if (kd === "twequip-co") return <Co {...p} />;
  if (kd === "twequip-next") return <Next {...p} />;
  return null;
};

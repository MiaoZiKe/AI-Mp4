// 2026/11/20 tech-implant：離子佈植的 2D 示意卡（overlay `section` 的 kind 以 "imp-" 開頭，Hud.tsx 的 HudSection 轉過來）。
//   imp-hook 開場（平、不導電、打離子、速度）｜imp-np N型／P型晶格｜imp-mask 光阻遮罩＋射束線四段｜imp-src 離子源剖面｜imp-acc 加速管｜
//   imp-sel 分析磁鐵分選｜imp-scan 掃描軌跡｜imp-cmp 深度與濃度＋傳統擴散對照｜imp-co 誰在做｜imp-next 接下來
// 全部示意；結構一開始就完整畫出（不留空框），念到時該處亮起、動起來；時間全部來自 script.json 的 t（cue）。顏色讀 model.json 的 palette。
import React from "react";
import { FONT_ZH } from "../../theme";
import { H, L, sm } from "./hudSkin";
import { EASE, tween } from "../anim";
import type { Model3D, Overlay3D } from "./engine";
import { col } from "./model";

const zh = (px: number, color: string = H.text, w = 800): React.CSSProperties => ({ fontFamily: FONT_ZH, fontSize: px, fill: color, color, fontWeight: w, whiteSpace: "nowrap" });
const onC = (bg: string) => (bg === H.amber ? ((H as any).onAmber ?? H.onAccent) : H.onAccent);
type P = { o: Overlay3D; f: number; k: number; m: Model3D };
const T = (o: Overlay3D, n: string) => ((o as any).t?.[n]?.at ?? o.at) as number;
const Card: React.FC<{ o: Overlay3D; k: number; W: number; Hh: number; children: React.ReactNode }> = ({ o, k, W, Hh, children }) => (
  <div style={{ position: "absolute", left: o.x ?? L.X, top: o.y ?? 900, width: W, height: Hh, opacity: k, background: H.cardCompare, border: `2px solid ${H.lineSoft}`, boxSizing: "border-box", overflow: "hidden" }}>
    {o.title ? <div style={{ position: "absolute", left: 16, top: 10, ...zh(30, onC(H.line), 800), background: H.line, padding: "2px 14px 4px", zIndex: 2 }}>{o.title}</div> : null}
    {o.tag ? <div style={{ position: "absolute", right: 16, top: 14, ...zh(sm(28), H.text2, 600), zIndex: 2 }}>{o.tag}</div> : null}
    {children}
  </div>
);
const ph = (f: number, sp: number, j: number, n: number, seed = 0) => (((f * sp + j / n + seed * 0.17) % 1) + 1) % 1;
const cc = (m: Model3D) => (n: string) => col(m.product, n);
const lit = (f: number, at: number, lo = 0.5) => lo + (1 - lo) * tween(f, at, 10, EASE.enter);
const on = (f: number, at: number, d = 10) => tween(f, at, d, EASE.enter);
/** 帶「＋」的離子 */
const Ion: React.FC<{ x: number; y: number; r?: number; c: string; o?: number; tail?: number; dir?: [number, number] }> = ({ x, y, r = 13, c, o = 1, tail = 0, dir = [1, 0] }) => (
  <g opacity={o}>
    {tail > 0 ? [1, 2, 3].map((j) => <circle key={j} cx={x - dir[0] * tail * j} cy={y - dir[1] * tail * j} r={r * (1 - j * 0.22)} fill={c} opacity={0.5 - j * 0.13} />) : null}
    <circle cx={x} cy={y} r={r} fill={c} stroke="#FFFFFF" strokeWidth={2} />
    <path d={`M${x - r * 0.55} ${y} H${x + r * 0.55} M${x} ${y - r * 0.55} V${y + r * 0.55}`} stroke="#FFFFFF" strokeWidth={Math.max(2.5, r * 0.28)} />
  </g>
);
/** 帶「－」的電子 */
const Ele: React.FC<{ x: number; y: number; r?: number; c: string; o?: number }> = ({ x, y, r = 9, c, o = 1 }) => (
  <g opacity={o}><circle cx={x} cy={y} r={r} fill={c} stroke="#FFFFFF" strokeWidth={1.5} /><path d={`M${x - r * 0.55} ${y} H${x + r * 0.55}`} stroke="#FFFFFF" strokeWidth={2.6} /></g>
);
const Arrow: React.FC<{ x1: number; y1: number; x2: number; y2: number; c: string; w?: number; o?: number }> = ({ x1, y1, x2, y2, c, w = 5, o = 1 }) => {
  const a = Math.atan2(y2 - y1, x2 - x1), s = w * 2.6;
  return <g opacity={o}><path d={`M${x1} ${y1} L${x2 - Math.cos(a) * s * 0.8} ${y2 - Math.sin(a) * s * 0.8}`} stroke={c} strokeWidth={w} />
    <path d={`M${x2} ${y2} L${x2 - Math.cos(a) * s - Math.sin(a) * s * 0.6} ${y2 - Math.sin(a) * s + Math.cos(a) * s * 0.6} L${x2 - Math.cos(a) * s + Math.sin(a) * s * 0.6} ${y2 - Math.sin(a) * s - Math.cos(a) * s * 0.6} Z`} fill={c} /></g>;
};
const Badge: React.FC<{ x: number; y: number; w: number; text: string; bg: string; o?: number; px?: number }> = ({ x, y, w, text, bg, o = 1, px = 32 }) => (
  <g opacity={o}><rect x={x} y={y} width={w} height={px + 16} fill={bg} rx={4} /><text x={x + w / 2} y={y + px + 3} textAnchor="middle" style={zh(px, onC(bg), 900)}>{text}</text></g>
);
const N_C = "#14B8A6", P_C = "#F05A28", ION_C = "#FF7A1A", HEAVY = "#7C5CD6", LIGHT = "#12A88A", ELEC = "#2FA8FF", SI = "#AFC0DA", SI_D = "#7F93B5", RES = "#9E2A2B";

// ── imp-hook：上一支量完（平、膜厚對）→ 但不導電 → 打離子 → 每秒 1,300 公里 ──
const Hook: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330;
  const a = lit(f, T(o, "ok")), b = lit(f, T(o, "no")), c = lit(f, T(o, "shoot")), sp = on(f, T(o, "speed"), 18);
  const xb = on(f, T(o, "no") + 6, 8), n = Math.round(1300 * EASE.move(Math.min(1, Math.max(0, (f - T(o, "speed")) / 20))));
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        <g opacity={a}>
          <circle cx={120} cy={176} r={78} fill="#C9D6EA" stroke={SI_D} strokeWidth={3} />
          {Array.from({ length: 7 }, (_, i) => <path key={i} d={`M${54 + i * 22} 120 V232 M64 ${110 + i * 22} H176`} stroke="#9FB3D3" strokeWidth={1.5} />)}
          <circle cx={120} cy={176} r={78} fill="none" stroke={SI_D} strokeWidth={3} />
          <path d="M84 178 l22 22 l44 -48" stroke="#14A38B" strokeWidth={11} fill="none" opacity={on(f, T(o, "ok") + 2, 8)} />
          <text x={210} y={150} style={zh(34, H.text, 900)}>表面平</text>
          <text x={210} y={196} style={zh(34, H.text, 900)}>膜厚對</text>
          <text x={210} y={240} style={zh(sm(28), "#14A38B", 800)}>✓ 量測過關</text>
        </g>
        <Arrow x1={330} y1={176} x2={368} y2={176} c={H.text3} w={4} />
        <g opacity={b}>
          {/* 電路：電池 → 矽 → 燈泡（不亮） */}
          <path d="M400 110 H600 M400 250 H600 M400 110 V150 M400 210 V250 M600 110 V140 M600 220 V250" stroke={H.text2} strokeWidth={4} fill="none" />
          <rect x={386} y={150} width={28} height={10} fill={H.text2} /><rect x={380} y={200} width={40} height={10} fill={H.text2} />
          <text x={378} y={186} style={zh(sm(28), H.text2, 800)}>＋</text>
          <rect x={470} y={226} width={70} height={46} fill={SI} stroke={SI_D} strokeWidth={3} /><text x={505} y={259} textAnchor="middle" style={zh(sm(28), H.text, 900)}>矽</text>
          <circle cx={600} cy={180} r={38} fill="#E8ECF2" stroke={H.text3} strokeWidth={4} />
          <path d="M586 196 q14 -30 28 0" stroke={H.text3} strokeWidth={3} fill="none" />
          <g opacity={xb}><path d="M570 150 L630 210 M630 150 L570 210" stroke={H.coral} strokeWidth={8} /></g>
          <text x={470} y={92} style={zh(34, H.coral, 900)} opacity={xb}>不導電</text>
        </g>
        <Arrow x1={650} y1={176} x2={688} y2={176} c={H.text3} w={4} />
        <g opacity={c}>
          <rect x={890} y={70} width={36} height={190} fill={SI} stroke={SI_D} strokeWidth={3} />
          {[0, 1, 2].map((j) => { const u = ph(f, 0.045, j, 3); return <Ion key={j} x={712 + u * 170} y={110 + j * 55} r={14} c={ION_C} tail={6 + u * 14} o={c > 0.9 ? Math.min(1, (1 - u) * 6) : 0.6} />; })}
          <text x={706} y={84} style={zh(30, H.text, 900)}>打進離子</text>
        </g>
        <g opacity={sp}>
          <rect x={700} y={262} width={226} height={56} fill={H.amber} />
          <text x={813} y={302} textAnchor="middle" style={zh(36, onC(H.amber), 900)}>{n.toLocaleString("en-US")} km/s</text>
        </g>
      </svg>
    </Card>
  );
};

// ── 小晶格（4×3 原子＋鍵），center＝中間那顆換成什麼 ──
const Lattice: React.FC<{ x: number; y: number; dop?: "P" | "B" | null; dopO?: number; f: number; eO?: number; hO?: number }> = ({ x, y, dop, dopO = 0, f, eO = 0, hO = 0 }) => {
  const g = 62, cols = 4, rows = 3, pts: [number, number][] = [];
  for (let i = 0; i < cols; i++) for (let j = 0; j < rows; j++) pts.push([x + i * g, y + j * g]);
  const ci = 1, cj = 1, cx = x + ci * g, cy = y + cj * g;
  return (
    <g>
      {pts.map(([px, py], i) => <g key={i}>{px < x + (cols - 1) * g ? <path d={`M${px} ${py} H${px + g}`} stroke={SI_D} strokeWidth={4} /> : null}{py < y + (rows - 1) * g ? <path d={`M${px} ${py} V${py + g}`} stroke={SI_D} strokeWidth={4} /> : null}</g>)}
      {pts.map(([px, py], i) => <g key={i}><circle cx={px} cy={py} r={17} fill={SI} stroke={SI_D} strokeWidth={2.5} /><text x={px} y={py + 8} textAnchor="middle" style={zh(20, H.text2, 800)}>Si</text></g>)}
      {dop ? <g opacity={dopO}><circle cx={cx} cy={cy} r={21} fill={dop === "P" ? N_C : P_C} stroke="#FFFFFF" strokeWidth={3} /><text x={cx} y={cy + 9} textAnchor="middle" style={zh(24, "#FFFFFF", 900)}>{dop}</text></g> : null}
      {dop === "P" ? <Ele x={cx + 34 * Math.cos(f * 0.16)} y={cy + 24 * Math.sin(f * 0.16)} r={10} c={ELEC} o={eO} /> : null}
      {dop === "B" ? <g opacity={hO}><circle cx={cx + g / 2} cy={cy} r={14} fill="#FFFFFF" stroke={P_C} strokeWidth={3} strokeDasharray="5 4" /><text x={cx + g / 2} y={cy - 22} textAnchor="middle" style={zh(22, P_C, 900)}>洞</text></g> : null}
    </g>
  );
};
// ── imp-np：純矽（導電差）｜打進磷→多出電子＝N型｜打進硼→留下電洞＝P型 ──
const Np: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330;
  const a = lit(f, T(o, "pure")), p = on(f, T(o, "ph")), nt = on(f, T(o, "ntype")), b = on(f, T(o, "bo")), ho = on(f, T(o, "hole")), pt = on(f, T(o, "ptype"));
  const drop = (t: number) => -60 * (1 - t);
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        <g opacity={a}>
          <Lattice x={60} y={100} f={f} />
          <text x={40} y={300} style={zh(30, H.text, 900)}>純矽：導電差</text>
        </g>
        <line x1={318} y1={70} x2={318} y2={315} stroke={H.lineSoft} strokeWidth={3} />
        <g opacity={lit(f, T(o, "ph"))}>
          <g transform={`translate(0 ${drop(p)})`}><Lattice x={370} y={100} dop="P" dopO={p} f={f} eO={on(f, T(o, "ph") + 10)} /></g>
          <text x={350} y={300} style={zh(30, H.text, 900)}>打進磷：多出電子</text>
          <Badge x={556} y={64} w={70} text="N型" bg={N_C} o={nt} px={28} />
        </g>
        <line x1={634} y1={70} x2={634} y2={315} stroke={H.lineSoft} strokeWidth={3} />
        <g opacity={lit(f, T(o, "bo"))}>
          <g transform={`translate(0 ${drop(b)})`}><Lattice x={686} y={100} dop="B" dopO={b} f={f} hO={ho} /></g>
          <text x={666} y={300} style={zh(30, H.text, 900)}>打進硼：留下電洞</text>
          <Badge x={866} y={64} w={70} text="P型" bg={P_C} o={pt} px={28} />
        </g>
      </svg>
    </Card>
  );
};

// ── imp-mask：光阻遮住不要打的地方（剖面）＋射束線四段 ──
const Mask: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330;
  const a = lit(f, T(o, "mask")), go = on(f, T(o, "line"), 6);
  const st = [["離子源", "src"], ["加速管", "acc"], ["分析磁鐵", "mag"], ["終端站", "end"]];
  const ySi = 222, x0 = 30, x1 = 540, oL = 230, oR = 330;
  const dope = Math.min(1, Math.max(0, (f - T(o, "line")) / 60));
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        <g opacity={a}>
          <rect x={x0} y={ySi} width={x1 - x0} height={80} fill={SI} stroke={SI_D} strokeWidth={2} />
          <rect x={oL} y={ySi} width={oR - oL} height={36 * dope + 2} fill={N_C} opacity={0.75} />
          <rect x={x0} y={ySi - 34} width={oL - x0} height={34} fill={RES} /><rect x={oR} y={ySi - 34} width={x1 - oR} height={34} fill={RES} />
          <text x={x0 + 12} y={ySi - 8} style={zh(sm(28), "#FFFFFF", 900)}>光阻（遮罩）</text>
          <text x={x0 + 12} y={ySi + 60} style={zh(sm(28), H.text, 900)}>矽</text>
          <text x={oR + 20} y={ySi + 60} style={zh(sm(28), N_C, 900)} opacity={dope}>只有開口打進去</text>
          {Array.from({ length: 7 }, (_, j) => { const x = 60 + j * 74, u = ph(f, 0.05, j, 7, 3); const inside = x > oL && x < oR; const yEnd = inside ? ySi + 26 : ySi - 46; const y = 76 + u * (yEnd - 76);
            return <Ion key={j} x={x} y={y} r={12} c={ION_C} tail={8} dir={[0, 1]} o={go * Math.min(1, (1 - u) * 5)} />; })}
          {go > 0 ? null : <text x={60} y={110} style={zh(sm(28), H.text2, 700)}>離子從上往下打</text>}
        </g>
        <line x1={580} y1={70} x2={580} y2={315} stroke={H.lineSoft} strokeWidth={3} />
        <text x={604} y={92} style={zh(sm(28), H.text2, 800)} opacity={lit(f, T(o, "line"))}>離子一路飛過：</text>
        {st.map(([n, id], j) => { const t = T(o, id), h = on(f, t), y = 108 + j * 52, nx = j < 3 && f >= T(o, st[j + 1][1]);
          return <g key={j} opacity={0.4 + 0.6 * lit(f, t, 0.3)}>
            <rect x={604} y={y} width={300} height={42} fill={h > 0.5 && !nx ? H.amber : H.cardCompare} stroke={H.text3} strokeWidth={2} />
            <text x={624} y={y + 32} style={zh(30, h > 0.5 && !nx ? onC(H.amber) : H.text, 900)}>{`${"①②③④"[j]} ${n}`}</text>
            {j < 3 ? <path d={`M754 ${y + 42} v10`} stroke={H.text3} strokeWidth={3} /> : null}
          </g>; })}
      </svg>
    </Card>
  );
};

// ── imp-src：離子源剖面：氣瓶→腔體（燈絲放電子、撞散分子→＋離子）→引出電極拉出 ──
const Src: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330;
  const g = lit(f, T(o, "gas")), pl = on(f, T(o, "plasma")), p3 = on(f, T(o, "ph3"), 8), b3 = on(f, T(o, "bf3"), 8), pu = on(f, T(o, "pull"));
  const cx0 = 290, cx1 = 640, cy0 = 70, cy1 = 300;
  const bottle = (x: number, c: string, name: string, hi: number) => (
    <g>
      <rect x={x} y={150} width={64} height={150} rx={26} fill="#D9DEE6" stroke={hi > 0.5 ? c : H.text3} strokeWidth={hi > 0.5 ? 5 : 2.5} />
      <rect x={x} y={205} width={64} height={34} fill={c} /><rect x={x + 22} y={128} width={20} height={24} fill={H.text3} />
      <text x={x + 32} y={233} textAnchor="middle" style={zh(26, "#FFFFFF", 900)}>{name}</text>
    </g>);
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        <g opacity={g}>
          {bottle(40, N_C, "PH₃", p3)}{bottle(140, P_C, "BF₃", b3)}
          <path d={`M72 128 V112 H240 V170 H${cx0}`} stroke={H.text3} strokeWidth={5} fill="none" /><path d="M172 128 V112" stroke={H.text3} strokeWidth={5} />
          {Array.from({ length: 4 }, (_, j) => { const u = ph(f, 0.02, j, 4); const x = 72 + u * 228, y = u < 0.6 ? 112 : 170; const c = j % 2 ? P_C : N_C;
            return <g key={j} opacity={g > 0.9 ? 1 : 0}><circle cx={x} cy={y} r={9} fill={c} /><circle cx={x + 9} cy={y - 6} r={5} fill={c} /><circle cx={x + 9} cy={y + 6} r={5} fill={c} /></g>; })}
          <text x={248} y={150} style={zh(sm(28), H.text2, 800)}>氣體</text>
        </g>
        {/* 腔體 */}
        <rect x={cx0} y={cy0} width={cx1 - cx0} height={cy1 - cy0} fill="#3B465E" stroke={H.text3} strokeWidth={3} />
        <rect x={cx0 + 6} y={cy0 + 6} width={cx1 - cx0 - 12} height={cy1 - cy0 - 12} fill="#C77DFF" opacity={0.12 + 0.45 * pl * (0.8 + 0.2 * Math.sin(f * 0.6))} />
        <path d={`M${cx0 + 26} 120 l8 12 l-8 12 l8 12 l-8 12 l8 12 l-8 12`} stroke={pl > 0.3 ? "#FFB347" : "#9AA8BE"} strokeWidth={5} fill="none" />
        <text x={cx0 + 14} y={cy1 - 14} style={zh(sm(28), "#FFFFFF", 800)}>燈絲</text>
        {Array.from({ length: 7 }, (_, j) => { const t = f * 0.09 + j * 0.9; return <Ele key={j} x={cx0 + 70 + ((j * 47 + f * 2.2) % 220)} y={185 + 60 * Math.sin(t)} r={8} c={ELEC} o={pl} />; })}
        {Array.from({ length: 4 }, (_, j) => { const u = ph(f, 0.025, j, 4, 1); return <Ion key={j} x={cx0 + 140 + u * 170} y={110 + j * 46} r={12} c={ION_C} o={pl * (u > 0.3 ? 1 : u / 0.3)} />; })}
        <text x={cx0 + 60} y={cy0 + 34} style={zh(sm(28), "#FFFFFF", 900)} opacity={pl}>撞散分子→＋離子</text>
        {/* 引出電極＋電場 */}
        <g opacity={lit(f, T(o, "pull"), 0.55)}>
          {[0, 1].map((j) => <g key={j}><rect x={cx1 + 18 + j * 30} y={cy0 + 10} width={12} height={92} fill={H.text2} /><rect x={cx1 + 18 + j * 30} y={cy1 - 102} width={12} height={92} fill={H.text2} /></g>)}
          {[0, 1, 2].map((j) => { const u = ph(f, 0.06, j, 3); return <Arrow key={j} x1={cx1 + 8 + u * 50} y1={150 + j * 16} x2={cx1 + 34 + u * 50} y2={150 + j * 16} c="#4FA3FF" w={3} o={pu} />; })}
          {[0, 1, 2].map((j) => { const u = ph(f, 0.05, j, 3, 2); return <Ion key={j} x={cx1 + 20 + u * 260} y={185} r={13} c={ION_C} tail={6 + u * 12} o={pu * Math.min(1, (1 - u) * 6)} />; })}
          <text x={cx1 + 90} y={120} style={zh(sm(28), H.text, 900)} opacity={pu}>電場拉出</text>
          <text x={cx1 + 90} y={262} style={zh(sm(28), H.text2, 800)}>→ 加速管</text>
        </g>
      </svg>
    </Card>
  );
};

// ── imp-acc：電極環電位一環一環升高，離子等加速度越跑越快；速度讀數同步 ──
const Acc: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330;
  const r0 = T(o, "ring"), fa = T(o, "fast"), kv = on(f, T(o, "kev")), vv = T(o, "v");
  const x0 = 50, x1 = 640, nR = 10, y = 175, per = 40;
  const u = f >= r0 + 10 ? ((f - r0 - 10) % per) / per : 0, pos = u * u; // 等加速度：位置∝t²
  const ix = x0 + 20 + pos * (x1 - x0 - 30), spd = 2 * u; // 速度∝t
  const vShow = Math.round(1300 * EASE.move(Math.min(1, Math.max(0, (f - vv) / 20))));
  const lerp = (a: string, b: string, t: number) => { const pa = [1, 3, 5].map((i) => parseInt(a.slice(i, i + 2), 16)), pb = [1, 3, 5].map((i) => parseInt(b.slice(i, i + 2), 16)); return `rgb(${pa.map((v, i) => Math.round(v + (pb[i] - v) * t)).join(",")})`; };
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        <rect x={x0} y={y - 46} width={x1 - x0} height={92} fill="#E6EFFC" stroke={H.lineSoft} strokeWidth={2} />
        {Array.from({ length: nR }, (_, j) => { const x = x0 + 20 + (j * (x1 - x0 - 40)) / (nR - 1), l = on(f, r0 + j * 4, 6);
          return <g key={j}><rect x={x - 8} y={y - 62} width={16} height={124} rx={4} fill={lerp("#1E3A8A", "#9CC9FF", j / (nR - 1))} stroke={l > 0.5 ? "#7CC4FF" : H.text3} strokeWidth={l > 0.5 ? 4 : 1.5} />
            <text x={x} y={y + 92} textAnchor="middle" style={zh(22, H.text2, 800)} opacity={0.35 + 0.65 * l}>{Math.round((j * 100) / (nR - 1))}</text></g>; })}
        <text x={x0} y={y - 76} style={zh(sm(28), H.text, 900)}>電壓（kV）：0 → 100，一環比一環高</text>
        <Ion x={ix} y={y} r={15} c={ION_C} tail={4 + spd * 9} o={on(f, r0 + 8)} />
        <Arrow x1={x0 + 160} y1={y + 120} x2={x0 + 360} y2={y + 120} c="#4FA3FF" w={4} o={on(f, fa)} />
        <text x={x0 + 372} y={y + 130} style={zh(sm(28), "#1F6FEB", 900)} opacity={on(f, fa)}>越跑越快</text>
        <line x1={672} y1={70} x2={672} y2={315} stroke={H.lineSoft} strokeWidth={3} />
        <g opacity={lit(f, T(o, "kev"), 0.6)}>
          <text x={700} y={110} style={zh(sm(28), H.text2, 800)}>能量</text>
          <text x={700} y={156} style={zh(40, H.text, 900)}>{kv > 0.5 ? "100 keV" : "—"}</text>
          <text x={700} y={192} style={zh(sm(28), H.text2, 800)}>硼離子</text>
        </g>
        <g opacity={lit(f, vv, 0.6)}>
          <rect x={700} y={210} width={230} height={62} fill={f >= vv ? H.amber : H.cardCompare} stroke={H.text3} strokeWidth={2} />
          <text x={815} y={254} textAnchor="middle" style={zh(36, f >= vv ? onC(H.amber) : H.text, 900)}>{vShow.toLocaleString("en-US")} km/s</text>
          <text x={700} y={305} style={zh(22, H.text3, 700)}>v＝√(2E/m) 計算</text>
        </g>
      </svg>
    </Card>
  );
};

// ── imp-sel：分析磁鐵（俯視）：對的沿中間轉過去，太重撞外壁、太輕撞內壁 ──
const Sel: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330;
  const al = on(f, T(o, "all")), be = lit(f, T(o, "bend")), mi = on(f, T(o, "miss")), wa = on(f, T(o, "wall")), pa = on(f, T(o, "pass"));
  // 圓心 (cx,cy)，入口在左上（往右進），轉 90° 往下出
  const cx = 120, cy = 290, R = 180, w = 40;
  const arc = (r: number) => `M${cx} ${cy - r} A${r} ${r} 0 0 1 ${cx + r} ${cy}`;
  const pt = (r: number, a: number, ox = cx, oy = cy) => [ox + r * Math.sin(a), oy - r * Math.cos(a)];
  const path = (kind: "ok" | "heavy" | "light", u: number) => {
    if (kind === "ok") return pt(R, (u * Math.PI) / 2);
    const r2 = kind === "heavy" ? R * 1.9 : R * 0.6, oy = cy - R + r2; // 同一個入口切線、不同半徑
    const lim = kind === "heavy" ? 0.36 : 0.42;
    return pt(r2, Math.min(u, 1) * lim * Math.PI, cx, oy);
  };
  const kinds: ("ok" | "heavy" | "light")[] = ["ok", "heavy", "light", "ok"];
  const colr = { ok: ION_C, heavy: HEAVY, light: LIGHT };
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        <g transform="translate(60 12)">
          <path d={arc(R + w)} stroke={H.text2} strokeWidth={8} fill="none" /><path d={arc(R - w)} stroke={H.text2} strokeWidth={8} fill="none" />
          <path d={arc(R)} stroke="#FFB24A" strokeWidth={34} fill="none" opacity={0.18 * be} />
          <path d={`M${cx - 120} ${cy - R} H${cx}`} stroke={H.text3} strokeWidth={4} strokeDasharray="8 6" />
          <path d={`M${cx + R - w - 10} ${cy + 26} H${cx + R - 14} M${cx + R + 14} ${cy + 26} H${cx + R + w + 10}`} stroke={H.text} strokeWidth={8} />
          <text x={cx + R + w + 16} y={cy + 30} style={zh(22, H.text2, 800)}>狹縫</text>
          <text x={cx - 120} y={cy - R - 18} style={zh(sm(26), H.text2, 800)}>進來</text>
          {kinds.map((kd, j) => { const u = ph(f, 0.022, j, 4); const show = kd === "ok" ? be : mi; if (show < 0.05) return null;
            const [x, y] = path(kd, u * 1.15); const hit = kd !== "ok" && u * 1.15 >= 1; const r = kd === "heavy" ? 15 : kd === "light" ? 9 : 12;
            return <g key={j}>{hit ? <g opacity={wa}><path d={`M${x - 16} ${y} H${x + 16} M${x} ${y - 16} V${y + 16} M${x - 11} ${y - 11} L${x + 11} ${y + 11} M${x + 11} ${y - 11} L${x - 11} ${y + 11}`} stroke="#FFC21A" strokeWidth={4} /></g>
              : <Ion x={x} y={y} r={r} c={colr[kd]} o={show} />}</g>; })}
          {al > 0 && be < 0.6 ? [0, 1, 2].map((j) => { const u = ph(f, 0.04, j, 3); return <Ion key={j} x={cx - 120 + u * 120} y={cy - R} r={[12, 15, 9][j]} c={[ION_C, HEAVY, LIGHT][j]} o={al} />; }) : null}
        </g>
        <g transform="translate(560 0)">
          {[["什麼都有", H.text, "all"], ["太重：撞外壁", HEAVY, "miss"], ["太輕：撞內壁", LIGHT, "miss"], ["剛好：過關", ION_C, "pass"]].map(([t, c, id], j) =>
            <g key={j} opacity={lit(f, T(o, id as string), 0.35)}>
              {j ? <Ion x={22} y={96 + j * 58} r={[0, 15, 9, 12][j]} c={c as string} /> : <g>{[0, 1, 2].map((q) => <circle key={q} cx={12 + q * 12} cy={96} r={7} fill={[ION_C, HEAVY, LIGHT][q]} />)}</g>}
              <text x={56} y={106 + j * 58} style={zh(30, j === 3 && pa > 0.5 ? ION_C : H.text, 900)}>{t as string}</text>
            </g>)}
          <Badge x={56} y={262} w={300} text="只剩對的離子" bg={H.amber} o={pa} px={30} />
        </g>
      </svg>
    </Card>
  );
};

// ── imp-scan：射束左右掃＋晶圓上下動 → 軌跡鋪滿整片 → 均勻 ──
const Scan: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330;
  const sw = T(o, "sweep"), mv = T(o, "move"), ev = on(f, T(o, "every")), sa = on(f, T(o, "same"));
  const cx = 190, cy = 185, R = 120;
  const tMax = Math.max(0, f - sw), pts: string[] = [];
  for (let t = 0; t <= tMax; t += 1) { const x = cx + R * Math.sin(t * 0.32), y = cy - R + (Math.max(0, t + sw - mv) / 90) * 2 * R; if (y > cy + R) break; pts.push(`${x.toFixed(1)},${(f >= mv ? y : cy - R + 6).toFixed(1)}`); }
  const fill = Math.min(1, Math.max(0, (f - mv) / 80));
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        <defs><clipPath id="impw"><circle cx={cx} cy={cy} r={R} /></clipPath></defs>
        <circle cx={cx} cy={cy} r={R} fill="#C9D6EA" stroke={SI_D} strokeWidth={3} />
        <g clipPath="url(#impw)">
          {Array.from({ length: 11 }, (_, i) => <path key={i} d={`M${cx - R + i * 24} ${cy - R} V${cy + R} M${cx - R} ${cy - R + i * 24} H${cx + R}`} stroke="#9FB3D3" strokeWidth={1.2} />)}
          <rect x={cx - R} y={cy - R} width={2 * R} height={2 * R * fill} fill={ION_C} opacity={0.35 * fill + 0.2 * sa} />
          {pts.length > 1 ? <polyline points={pts.join(" ")} stroke={ION_C} strokeWidth={3} fill="none" opacity={0.9} /> : null}
        </g>
        <text x={cx - R} y={cy + R + 2} style={zh(22, H.text2, 800)}> </text>
        <g transform="translate(360 0)">
          <g opacity={lit(f, T(o, "enter"), 0.45)}><text x={0} y={100} style={zh(30, H.text, 900)}>① 射束進終端站</text></g>
          <g opacity={lit(f, sw, 0.4)}><path d="M20 140 h70 m-70 0 l14 -10 m-14 10 l14 10 m56 -10 l-14 -10 m14 10 l-14 10" stroke="#1F6FEB" strokeWidth={5} fill="none" /><text x={110} y={152} style={zh(30, H.text, 900)}>② 射束左右掃</text></g>
          <g opacity={lit(f, mv, 0.4)}><path d="M55 176 v60 m0 -60 l-10 14 m10 -14 l10 14 m-10 46 l-10 -14 m10 14 l10 -14" stroke="#1F6FEB" strokeWidth={5} fill="none" /><text x={110} y={218} style={zh(30, H.text, 900)}>③ 晶圓上下動</text></g>
          <g opacity={lit(f, T(o, "every"), 0.4)}><text x={110} y={282} style={zh(30, H.text, 900)}>④ 每一點打進的量一樣</text></g>
        </g>
        <g opacity={ev}><circle cx={cx + 50} cy={cy + 30} r={16} fill="none" stroke={H.text} strokeWidth={3} /><path d={`M${cx + 30} ${cy + 30} h40 M${cx + 50} ${cy + 10} v40`} stroke={H.text} strokeWidth={2} /></g>
        <g opacity={sa} transform={`translate(${cx} ${cy}) rotate(-8) scale(${1 + 0.4 * (1 - sa)})`}><rect x={-70} y={-30} width={140} height={60} fill={H.amber} /><text x={0} y={14} textAnchor="middle" style={zh(40, onC(H.amber), 900)}>均勻</text></g>
      </svg>
    </Card>
  );
};

// ── imp-cmp：佈植（能量→深度、劑量→濃度，停在固定深度）vs 傳統擴散（表面最濃、往內漸淡） ──
const Cmp: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330;
  const st = on(f, T(o, "stop")), en = on(f, T(o, "energy"), 24), ds = on(f, T(o, "dose"), 24);
  const ax0 = 60, ay0 = 112, ah = 186, aw = 270;
  const curve = (peak: number, hgt: number, sig: number) => { const pts: string[] = []; for (let i = 0; i <= 40; i++) { const d = i / 40; const c = hgt * Math.exp(-((d - peak) ** 2) / (2 * sig * sig)); pts.push(`${(ax0 + c * aw).toFixed(1)},${(ay0 + d * ah).toFixed(1)}`); } return pts.join(" "); };
  const peak = 0.38 + 0.22 * en, hgt = 0.55 + 0.4 * ds;
  const knob = (x: number, y: number, a: number, name: string, act: number) => (
    <g opacity={0.5 + 0.5 * act}><circle cx={x} cy={y} r={28} fill={H.cardCompare} stroke={act > 0.5 ? H.amber : H.text3} strokeWidth={5} />
      <path d={`M${x} ${y} L${x + 22 * Math.cos(a)} ${y + 22 * Math.sin(a)}`} stroke={H.text} strokeWidth={5} /><text x={x} y={y + 54} textAnchor="middle" style={zh(sm(26), H.text, 900)}>{name}</text></g>);
  const diff = () => { const pts: string[] = []; for (let i = 0; i <= 40; i++) { const d = i / 40; pts.push(`${(560 + 250 * Math.exp(-d * 3.2)).toFixed(1)},${(ay0 + d * ah).toFixed(1)}`); } return pts.join(" "); };
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        <g opacity={lit(f, T(o, "in"), 0.55)}>
          <text x={ax0 + 120} y={ay0 - 14} style={zh(sm(26), H.text, 900)}>離子佈植</text>
          <path d={`M${ax0} ${ay0} V${ay0 + ah} M${ax0} ${ay0} H${ax0 + aw + 20}`} stroke={H.text2} strokeWidth={3} />
          <text x={ax0 - 50} y={ay0 + ah} style={zh(22, H.text2, 800)}>深</text><text x={ax0 - 50} y={ay0 + 18} style={zh(22, H.text2, 800)}>表面</text>
          <polyline points={curve(peak, hgt, 0.11)} stroke={ION_C} strokeWidth={5} fill="none" opacity={st} />
          <path d={`M${ax0} ${ay0 + peak * ah} H${ax0 + aw}`} stroke="#C2441F" strokeWidth={3} strokeDasharray="10 7" opacity={st} />
          <text x={ax0 + aw - 120} y={ay0 + peak * ah - 10} style={zh(22, "#C2441F", 900)} opacity={st}>停在這裡</text>
          {Array.from({ length: 5 }, (_, j) => { const u = Math.min(1, Math.max(0, (f - T(o, "in") - j * 6) / 40)); const d = (peak + (j - 2) * 0.04) * (1 - Math.exp(-u * 4)) / (1 - Math.exp(-4));
            return <Ion key={j} x={ax0 + 40 + j * 44} y={ay0 + d * ah} r={10} c={ION_C} o={u > 0 && u < 1 ? 1 : 0.6 * (u >= 1 ? 1 : 0)} />; })}
        </g>
        {knob(400, 112, -2.4 + 1.6 * en, "能量→多深", en)}
        {knob(400, 226, -2.4 + 1.6 * ds, "劑量→多濃", ds)}
        <line x1={480} y1={64} x2={480} y2={315} stroke={H.lineSoft} strokeWidth={3} />
        <g opacity={0.45 + 0.55 * st}>
          <text x={510} y={ay0 - 14} style={zh(sm(26), H.text2, 900)}>傳統擴散（高溫爐）</text>
          <path d={`M560 ${ay0} V${ay0 + ah} M560 ${ay0} H${560 + 270}`} stroke={H.text3} strokeWidth={3} />
          <polyline points={diff()} stroke={H.text3} strokeWidth={5} fill="none" />
          <text x={590} y={ay0 + 130} style={zh(sm(26), H.text2, 800)}>表面最濃、往內漸淡</text>
          <text x={590} y={ay0 + 166} style={zh(sm(26), H.text2, 800)}>沒有固定停止深度</text>
        </g>
        <text x={510} y={318} style={zh(22, H.text2, 800)} opacity={ds}>擴散看溫度與時間｜佈植看能量與劑量</text>
      </svg>
    </Card>
  );
};

// ── imp-co：誰在做（念到誰誰亮；引線在 3D 那邊，從公司名指到部位） ──
const Co: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330;
  const rows: [string, string, string, string, string][] = [["am", "應用材料", "Applied Materials", "離子佈植機", "廠商公布"], ["ax", "亞舍立", "Axcelis", "離子佈植機", "廠商公布"], ["jc", "兆捷（台灣）", "", "植入氣體", "媒體報導"]];
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        {rows.map(([id, n, en, what, src], j) => { const t = T(o, id), a = on(f, t), cur = f >= t && (j === 2 || f < T(o, rows[j + 1][0])); const y = 74 + j * 80;
          return <g key={j} opacity={0.45 + 0.55 * a}>
            <rect x={24} y={y} width={904} height={68} fill={cur ? H.amberSoft : H.cardCompare} stroke={cur ? H.amber : H.lineSoft} strokeWidth={cur ? 4 : 2} />
            <text x={44} y={y + 46} style={zh(36, H.text, 900)}>{n}</text>
            {en ? <text x={44 + n.length * 37 + 14} y={y + 44} style={zh(24, H.text2, 700)}>{en}</text> : null}
            <text x={600} y={y + 46} style={zh(32, H.text, 800)}>{what}</text>
            <text x={912} y={y + 44} textAnchor="end" style={zh(22, H.text3, 700)}>{src}</text>
          </g>; })}
      </svg>
    </Card>
  );
};

// ── imp-next：佈植完 → 光阻焦硬、表面髒 → 下一支：清洗；留言「離子」 ──
const Next: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330;
  const items: [string, string, string, string][] = [["離子佈植", "有了導電區域", "zone", N_C], ["光阻焦硬", "表面也髒", "hard", "#6B3A1E"], ["下一支", "清洗", "next", H.amber]];
  const kw = on(f, T(o, "kw"));
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        {items.map(([a, b, id, c], j) => { const x = 30 + j * 312, l = lit(f, T(o, id), 0.4), hl = f >= T(o, id) && (j === 2 || f < T(o, items[j + 1][2]));
          return <g key={j} opacity={l}>
            <rect x={x} y={76} width={262} height={140} fill={hl ? c : H.cardCompare} stroke={c} strokeWidth={hl ? 5 : 3} />
            <text x={x + 131} y={136} textAnchor="middle" style={zh(40, hl ? "#FFFFFF" : H.text, 900)}>{a}</text>
            <text x={x + 131} y={186} textAnchor="middle" style={zh(sm(30), hl ? "#FFFFFF" : H.text2, 800)}>{b}</text>
            {j < 2 ? <path d={`M${x + 270} 146 H${x + 300} m-14 -12 l14 12 l-14 12`} stroke={H.text3} strokeWidth={5} fill="none" /> : null}
          </g>; })}
        {f >= T(o, "dirty") ? Array.from({ length: 8 }, (_, j) => <circle key={j} cx={372 + ((j * 53) % 230)} cy={96 + ((j * 37) % 100)} r={5} fill="#5B5F66" opacity={on(f, T(o, "dirty"))} />) : null}
        <g opacity={kw} transform={`translate(${W / 2} 270) rotate(-3) scale(${1 + 0.3 * (1 - kw)})`}>
          <rect x={-220} y={-32} width={440} height={64} fill={H.amber} /><text x={0} y={14} textAnchor="middle" style={zh(38, onC(H.amber), 900)}>留言「離子」看完整解說</text>
        </g>
      </svg>
    </Card>
  );
};

export const ImpSection: React.FC<P> = (p) => {
  const kd = String((p.o as any).kind);
  if (kd === "imp-hook") return <Hook {...p} />;
  if (kd === "imp-np") return <Np {...p} />;
  if (kd === "imp-mask") return <Mask {...p} />;
  if (kd === "imp-src") return <Src {...p} />;
  if (kd === "imp-acc") return <Acc {...p} />;
  if (kd === "imp-sel") return <Sel {...p} />;
  if (kd === "imp-scan") return <Scan {...p} />;
  if (kd === "imp-cmp") return <Cmp {...p} />;
  if (kd === "imp-co") return <Co {...p} />;
  if (kd === "imp-next") return <Next {...p} />;
  return null;
};

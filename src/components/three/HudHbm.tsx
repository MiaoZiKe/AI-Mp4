// 2026/11/17 tech-hbm v3：貼近旁白內容的 2D 側視剖面（overlay `section` 的 kind 以 "hbm-" 開頭，Hud.tsx 的 HudSection 轉過來）。
//   hbm-lines 64 條 vs 2,048 條資料線的側視對照｜hbm-route 從旁邊拉不出來 → 改從面上打洞｜hbm-heat 疊十二層熱往上散、一片壞整疊壞｜hbm-pair GPU 與 HBM 並排在中介層上、下一站伺服器
// 都是示意（線數、尺寸不照實際）；顏色讀 H（頻道皮膚）與 model.json 的 palette，元件裡不寫色碼；動作時間全部來自 script.json 的 t（cue）。
import React from "react";
import { FONT_EN, FONT_ZH } from "../../theme";
import { H, L, sm } from "./hudSkin";
import { EASE, tween } from "../anim";
import type { Model3D, Overlay3D } from "./engine";
import { col } from "./model";

const zh = (px: number, color: string = H.text, w = 800): React.CSSProperties => ({ fontFamily: FONT_ZH, fontSize: px, fill: color, color, fontWeight: w, whiteSpace: "nowrap" });
const mono = (px: number, color: string = H.text2, w = 600): React.CSSProperties => ({ fontFamily: `${H.font.mono}, ${FONT_EN}`, fontSize: px, fill: color, color, fontWeight: w, whiteSpace: "nowrap" });
const onC = (bg: string) => (bg === H.amber ? ((H as any).onAmber ?? H.onAccent) : H.onAccent);
type P = { o: Overlay3D; f: number; k: number; m: Model3D };
const T = (o: Overlay3D, n: string) => ((o as any).t?.[n]?.at ?? o.at) as number;

const Card: React.FC<{ o: Overlay3D; k: number; W: number; Hh: number; children: React.ReactNode }> = ({ o, k, W, Hh, children }) => (
  <div style={{ position: "absolute", left: o.x ?? L.X, top: o.y ?? 900, width: W, height: Hh, opacity: k, background: H.cardCompare, border: `2px solid ${H.lineSoft}`, boxSizing: "border-box", overflow: "hidden" }}>
    {o.title ? <div style={{ position: "absolute", left: 16, top: 10, ...zh(30, onC(H.line), 800), background: H.line, padding: "2px 14px 4px", zIndex: 2 }}>{o.title}</div> : null}
    {o.tag ? <div style={{ position: "absolute", right: 16, top: 14, ...zh(sm(30), H.text2, 600), zIndex: 2 }}>{o.tag}</div> : null}
    {children}
  </div>
);
/** 沿線移動的光點（相位 = 幀數 × 速度）：資料在跑 */
const dotsOn = (n: number, x0: number, x1: number, y: number, f: number, c: string, r = 4, seed = 0) =>
  Array.from({ length: n }, (_, j) => { const u = (((f * 0.018 + j / n + seed * 0.13) % 1) + 1) % 1; return <circle key={j} cx={x0 + (x1 - x0) * u} cy={y} r={r} fill={c} />; });
/** 一疊層：每層一條，最上面一層 i=n-1 */
const stackRects = (x: number, yb: number, w: number, n: number, h: number, gap: number, c1: string, c2: string, hot?: (i: number) => string | null) =>
  Array.from({ length: n }, (_, i) => <rect key={i} x={x} y={yb - (i + 1) * (h + gap) + gap} width={w} height={h} fill={hot?.(i) ?? (i % 2 ? c1 : c2)} />);

// ── hbm-lines：64 條 vs 2,048 條 ──
const Lines: React.FC<P> = ({ o, f, k, m }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330, c = (n: string) => col(m.product, n);
  const six4 = T(o, "six4"), x32 = T(o, "x32"), n2048 = T(o, "n2048");
  const gA = tween(f, six4 - 6, 22, EASE.move), gB = tween(f, x32, 26, EASE.move), nA = tween(f, six4 + 8, 6, EASE.enter), nB = tween(f, n2048, 6, EASE.enter);
  const popB = 1 + 0.14 * Math.sin(Math.PI * tween(f, n2048, 10, EASE.move));
  const dram = c("dram"), dram2 = c("dram2"), sig = c("lp_sig"), bad = c("lp_bad"), steel = c("steel"), dark = c("dark");
  const ya = 120, yh = 100; // 母線區
  const L8 = Array.from({ length: 8 }, (_, i) => ya + 6 + (i * (yh - 12)) / 7), L64 = Array.from({ length: 64 }, (_, i) => ya + 3 + (i * (yh - 6)) / 63);
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        {/* 左：一般電腦記憶體條 → 處理器 */}
        <rect x={30} y={ya - 8} width={70} height={yh + 16} fill={c("ddrPcb")} stroke={H.text3} strokeWidth={1.5} />
        {[0, 1, 2, 3].map((i) => <rect key={i} x={40} y={ya + i * 24} width={50} height={16} fill={c("chipBk")} />)}
        <rect x={350} y={ya - 8} width={86} height={yh + 16} fill={steel} stroke={H.text3} strokeWidth={1.5} />
        <text x={393} y={ya + yh / 2 + 10} textAnchor="middle" style={mono(sm(30), H.text, 800)}>CPU</text>
        <path d={`M100 ${ya + yh / 2} H350`} stroke={H.text3} strokeWidth={1.5} strokeDasharray="6 8" opacity={1 - gA} />
        {L8.map((y, i) => <line key={i} x1={100} y1={y} x2={100 + 250 * gA} y2={y} stroke={bad} strokeWidth={3} />)}
        {gA >= 1 ? L8.map((y, i) => <g key={i}>{dotsOn(1, 100, 350, y, f, sig, 4, i)}</g>) : null}
        {/* 右：HBM 一疊 → AI 晶片 */}
        <g>{stackRects(500, ya + yh + 8, 84, 8, 11, 1.5, dram, dram2)}</g>
        <rect x={500} y={ya + yh + 6} width={84} height={6} fill={c("orange")} />
        <rect x={860} y={ya - 8} width={80} height={yh + 16} fill={steel} stroke={H.text3} strokeWidth={1.5} />
        <text x={900} y={ya + yh / 2 + 10} textAnchor="middle" style={mono(sm(30), H.text, 800)}>GPU</text>
        <path d={`M584 ${ya + yh / 2} H860`} stroke={H.text3} strokeWidth={1.5} strokeDasharray="6 8" opacity={1 - gB} />
        {L64.map((y, i) => <line key={i} x1={584} y1={y} x2={584 + 276 * gB} y2={y} stroke={sig} strokeWidth={1.1} />)}
        {gB >= 1 ? L64.filter((_, i) => i % 4 === 0).map((y, i) => <g key={i}>{dotsOn(1, 584, 860, y, f, c("orangeHi"), 3, i)}</g>) : null}
        <line x1={476} y1={64} x2={476} y2={Hh - 28} stroke={H.lineSoft} strokeWidth={2} strokeDasharray="4 8" />
        {/* 名稱與數字 */}
        <text x={30} y={Hh - 24} style={zh(34, H.text, 800)}>一般電腦記憶體</text>
        <text x={436} y={Hh - 22} textAnchor="end" opacity={nA} style={zh(58 * (1 + 0.14 * Math.sin(Math.PI * tween(f, six4 + 8, 10, EASE.move))), bad, 900)}>64 條</text>
        <text x={500} y={Hh - 24} style={zh(34, H.text, 800)}>HBM</text>
        <text x={940} y={Hh - 22} textAnchor="end" opacity={nB} style={zh(58 * popB, H.amber, 900)}>2,048 條</text>
        <text x={500} y={ya - 22} opacity={tween(f, x32 - 4, 6, EASE.enter)} style={zh(sm(30), H.text2, 700)}>上一代 HBM3E 是 1,024 條</text>
      </svg>
    </Card>
  );
};

// ── hbm-route：從旁邊拉不出來 → 改從面上打洞 ──
const Route: React.FC<P> = ({ o, f, k, m }) => {
  const W = o.w ?? 952, Hh = o.h ?? 340, c = (n: string) => col(m.product, n);
  const many = T(o, "many"), side = T(o, "side"), chip = T(o, "chip");
  const gL = tween(f, many, 22, EASE.move), jam = tween(f, side, 10, EASE.enter), out = tween(f, chip, 8, EASE.move), vt = tween(f, chip + 2, 12, EASE.move);
  const si = c("si"), siTop = c("siTop"), bad = c("lp_bad"), sig = c("lp_sig"), steel = c("steel"), cu = c("cu"), amber = c("orange");
  const sx = 40, sw = 400, sy = 112, sh = 62, N = 28;
  const shake = jam > 0 && out < 1 ? Math.sin(f * 2.1) * 1.4 * jam : 0;
  const cols = Array.from({ length: 12 }, (_, i) => sx + 26 + i * 32);
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        {/* 晶片（側視一片矽）與下面的中介層 */}
        <rect x={sx} y={sy} width={sw} height={sh} fill={si} stroke={H.text3} strokeWidth={1.5} />
        <rect x={sx} y={sy} width={sw} height={8} fill={siTop} />
        <rect x={sx - 10} y={sy + sh + 40} width={sw + 20} height={14} fill={c("adh")} />
        <text x={sx + 8} y={sy + sh + 32} style={mono(sm(30), H.text2, 700)}>HBM 的一片</text>
        {/* GPU */}
        <rect x={640} y={96} width={110} height={sh + 40} fill={steel} stroke={H.text3} strokeWidth={1.5} />
        <text x={695} y={96 + (sh + 40) / 2 + 10} textAnchor="middle" style={mono(sm(30), H.text, 800)}>GPU</text>
        {/* 側面出線：從晶片的邊擠出去（擠成一團，變紅） */}
        {Array.from({ length: N }, (_, i) => { const y0 = sy + 8 + (i * (sh - 14)) / (N - 1), y1 = 100 + (i * (sh + 24)) / (N - 1); const a = 1 - out;
          return <line key={i} x1={sx + sw} y1={y0 + shake} x2={sx + sw + (640 - sx - sw) * gL} y2={y0 + (y1 - y0) * gL + shake} stroke={jam > 0.3 ? bad : sig} strokeWidth={1.6} opacity={a} />; })}
        {jam > 0 && out < 1 ? <g opacity={1 - out}>
          <path d={`M${sx + sw + 10} ${sy} v${sh} M${sx + sw + 4} ${sy} h12 M${sx + sw + 4} ${sy + sh} h12`} stroke={bad} strokeWidth={4} fill="none" />
          <text x={sx + sw + 100} y={sy + sh / 2 + 12} style={zh(34, bad, 900)} opacity={jam}>出口只有一條邊</text>
        </g> : null}
        {/* 面上打洞：垂直銅柱穿過整片，資料往下走 */}
        {cols.map((x, i) => <g key={i}>
          <rect x={x - 5} y={sy} width={10} height={sh * vt} fill={cu} />
          {vt >= 1 ? <circle cx={x} cy={sy + ((f * 0.9 + i * 11) % (sh + 40))} r={4} fill={amber} /> : null}
        </g>)}
        {vt > 0 ? <g opacity={vt}><path d={`M${sx} ${sy - 12} H${sx + sw}`} stroke={sig} strokeWidth={4} /><path d={`M${sx} ${sy - 18} v12 M${sx + sw} ${sy - 18} v12`} stroke={sig} strokeWidth={4} /></g> : null}
        <text x={940} y={166} textAnchor="end" style={zh(52, H.amber, 900)} opacity={tween(f, many, 6, EASE.enter)}>2,048 條</text>
        <text x={40} y={Hh - 22} style={zh(34, bad, 800)} opacity={jam * (1 - out)}>旁邊拉線　　　　　擠不下</text>
        <text x={40} y={Hh - 22} style={zh(34, sig, 800)} opacity={vt}>從面上打洞　整個面都是出口</text>
      </svg>
    </Card>
  );
};

// ── hbm-heat：疊十二層，熱往上散；一片壞整疊壞；良率查不到 ──
const Heat: React.FC<P> = ({ o, f, k, m }) => {
  const W = o.w ?? 952, Hh = o.h ?? 350, c = (n: string) => col(m.product, n);
  const st = T(o, "stackup"), yl = T(o, "yield"), un = T(o, "unknown");
  const hot = tween(f, st, 18, EASE.move), bad = tween(f, yl, 8, EASE.enter), all = tween(f, yl + 6, 10, EASE.move), qa = tween(f, un, 8, EASE.enter);
  const dram = c("dram"), dram2 = c("dram2"), heat = c("lp_heat"), coral = c("lp_bad"), steel = c("steel");
  const n = 12, lh = 16, g = 3, x = 70, w = 230, yb = Hh - 34;
  const hotOf = (i: number) => { const v = hot * (1 - i / (n - 1)) * 0.9; if (i === 5 && bad > 0.5) return coral; if (all > 0.5) return coral; return v > 0.55 ? heat : null; };
  const rows = [
    { t: "熱從底下往上散，要穿過 12 層", at: st + 4, cc: H.text },
    { t: "一片壞了，整疊跟著壞", at: yl + 2, cc: coral },
    { t: "各家良率　查不到", at: un, cc: H.amber },
  ];
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        <rect x={x - 20} y={yb + 4} width={w + 40} height={18} fill={steel} />
        <text x={x + w + 30} y={yb + 20} style={mono(sm(30), H.text2, 700)}>GPU</text>
        <g>{stackRects(x, yb, w, n, lh, g, dram, dram2, hotOf)}</g>
        {/* 熱：從底部往上的箭頭，越往上越淡 */}
        {[0, 1, 2, 3].map((j) => { const xx = x + 36 + j * 54, ph = ((f * 0.03 + j * 0.27) % 1); return hot > 0 ? <g key={j} opacity={hot * (1 - ph) * 0.95}>
          <path d={`M${xx} ${yb - ph * 200} v-26 m-9 10 l9 -12 l9 12`} stroke={heat} strokeWidth={5} fill="none" strokeLinecap="round" />
        </g> : null; })}
        {bad > 0 ? <g opacity={bad}><path d={`M${x + w / 2 - 14} ${yb - 6 * (lh + g) + 2} l28 -26 m0 26 l-28 -26`} stroke={H.onAccent} strokeWidth={5} /></g> : null}
        {bad > 0 ? <text x={x + w + 30} y={yb - 5 * (lh + g) - 2} opacity={bad} style={zh(32, coral, 900)}>壞 1 片</text> : null}
        <text x={x + w + 30} y={yb - 11 * (lh + g) + 10} opacity={tween(f, st, 8, EASE.enter)} style={zh(32, H.text, 800)}>12 層</text>
        {rows.map((r, i) => <text key={i} x={470} y={118 + i * 74} opacity={tween(f, r.at, 8, EASE.enter)} style={zh(i === 2 ? 46 : 38, r.cc, 900)}>{r.t}</text>)}
        <text x={470} y={118 + 2 * 74 + 50} opacity={qa} style={zh(sm(32), H.text2, 700)}>廠商沒有公布　截至 2026/11/19</text>
      </svg>
    </Card>
  );
};

// ── hbm-pair：GPU 與 HBM 並排在中介層上 → 下一站伺服器 ──
const Pair: React.FC<P> = ({ o, f, k, m }) => {
  const W = o.w ?? 952, Hh = o.h ?? 300, c = (n: string) => col(m.product, n);
  const done = T(o, "done"), where = T(o, "where"), next = T(o, "next"), s0 = o.at;
  const dram = c("dram"), dram2 = c("dram2"), steel = c("steel"), sig = c("lp_sig"), cu = c("cu"), orange = c("orange");
  const drop = (a: number, h = 70) => (1 - EASE.move(Math.min(1, Math.max(0, (f - a) / 12)))) * -h; // 往上位移（落下前）
  const vis = (a: number) => Math.min(1, Math.max(0, (f - a) / 3));
  const ck = tween(f, done, 8, EASE.enter), w2 = tween(f, where, 10, EASE.move), nx = tween(f, next, 8, EASE.enter);
  const yb = 226, ix = 70, iw = 470;
  const hbm = (xx: number, a: number) => <g opacity={vis(a)} transform={`translate(0 ${drop(a)})`}>{stackRects(xx, yb, 84, 8, 11, 1.5, dram, dram2)}<rect x={xx} y={yb - 2} width={84} height={5} fill={orange} /></g>;
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        <rect x={ix - 20} y={yb + 20} width={iw + 40} height={16} fill={steel} opacity={0.55} />
        <rect x={ix} y={yb + 4} width={iw} height={16} fill={cu} opacity={vis(s0 + 2)} />
        <text x={ix + iw + 30} y={yb + 34} style={mono(sm(30), H.text2, 700)} opacity={0.9}>中介層</text>
        {hbm(ix + 34, s0 + 18)}
        <g opacity={vis(s0 + 8)} transform={`translate(0 ${drop(s0 + 8)})`}><rect x={ix + 190} y={yb - 76} width={110} height={80} fill={steel} stroke={H.text3} strokeWidth={1.5} /><text x={ix + 245} y={yb - 26} textAnchor="middle" style={mono(sm(30), H.text, 800)}>GPU</text></g>
        {hbm(ix + 352, s0 + 28)}
        {[0, 1, 2].map((i) => <g key={i} opacity={ck}>
          <line x1={ix + 118} y1={yb - 30 + i * 12} x2={ix + 190} y2={yb - 30 + i * 12} stroke={sig} strokeWidth={2.5} /><line x1={ix + 300} y1={yb - 30 + i * 12} x2={ix + 352} y2={yb - 30 + i * 12} stroke={sig} strokeWidth={2.5} />
          {dotsOn(1, ix + 118, ix + 190, yb - 30 + i * 12, f, sig, 4, i)}{dotsOn(1, ix + 300, ix + 352, yb - 30 + i * 12, f, sig, 4, i + 1)}
        </g>)}
        <g opacity={ck} transform={`translate(0 ${(1 - ck) * 10})`}><rect x={ix + 150} y={52} width={190} height={50} fill={H.amber} /><text x={ix + 245} y={90} textAnchor="middle" style={zh(36, onC(H.amber), 900)}>都拼好了</text></g>
        {/* 下一站：伺服器（先是問號，念到「下一支」才標名稱） */}
        <path d={`M${ix + iw + 100} ${yb - 40} h${70 * w2}`} stroke={H.amber} strokeWidth={5} opacity={w2} />
        <g opacity={w2}>
          <rect x={700} y={70} width={230} height={170} fill="none" stroke={H.text2} strokeWidth={3} strokeDasharray="10 8" />
          {[0, 1, 2, 3].map((i) => <rect key={i} x={716} y={86 + i * 36} width={198} height={22} fill={H.lineSoft} opacity={nx} />)}
          <text x={815} y={176} textAnchor="middle" style={zh(96, H.amber, 900)} opacity={1 - nx}>？</text>
        </g>
        <text x={815} y={Hh - 24} textAnchor="middle" opacity={nx} style={zh(40, H.text, 900)}>下一站：伺服器</text>
      </svg>
    </Card>
  );
};

export const HbmSection: React.FC<P> = (p) => {
  const kd = String((p.o as any).kind);
  if (kd === "hbm-lines") return <Lines {...p} />;
  if (kd === "hbm-route") return <Route {...p} />;
  if (kd === "hbm-heat") return <Heat {...p} />;
  if (kd === "hbm-pair") return <Pair {...p} />;
  return null;
};

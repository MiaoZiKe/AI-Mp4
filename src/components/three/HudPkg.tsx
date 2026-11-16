// 2026/11/16 tech-packaging（先進封裝）的 2D 剖面與圖卡：overlay `section` 的 kind 以 "pkg-" 開頭的都在這裡（Hud.tsx 的 HudSection 轉過來）。
// 沒寫這些 kind 的舊片完全不受影響。卡片外框、字色讀 H（頻道皮膚）；零件顏色讀 model.json 的 palette（col(m.product, 名字)），
// 所以 2D 和 3D 是同一份顏色；訊號光點讀 3D flow 動作的同一份數值（engine 的 op.u／op.k）。元件裡不寫色碼。
// 物理（playbook 第九節 19）：框與缺陷點受重力落下（位移 ∝ t²）、落地回彈逐次縮小（阻尼）；不逐幀手填。
//   pkg-frames 光罩框（面積單位）一個個落下排成兩列＋計數；pkg-wafers 兩片晶圓＋缺陷點落下；pkg-detour 拆開走遠路 vs 單一大晶片；
//   pkg-xsec 封裝剖面（晶片→微凸塊→中介層 RDL／TSV→C4→基板）＋一般電路板對照；pkg-warp 大面積翹曲示意；pkg-choice 往旁邊拼／往上疊。
import React from "react";
import { FONT_EN, FONT_ZH } from "../../theme";
import { H, L, sm } from "./hudSkin";
import { EASE, seeded, tween } from "../anim";
import type { Model3D, Overlay3D, State3D } from "./engine";
import { col } from "./model";

const zh = (px: number, color: string = H.text, w = 800): React.CSSProperties => ({ fontFamily: FONT_ZH, fontSize: px, fill: color, color, fontWeight: w, whiteSpace: "nowrap" });
const en = (px: number, color: string = H.text2, w = 600): React.CSSProperties => ({ fontFamily: `${H.font.mono}, ${FONT_EN}`, fontSize: px, fill: color, color, fontWeight: w, whiteSpace: "nowrap" });
const onC = (bg: string) => (bg === H.amber ? ((H as any).onAmber ?? H.onAccent) : H.onAccent);
const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
type P = { o: Overlay3D; f: number; k: number; m: Model3D; s: State3D };

/** 重力落下＋阻尼回彈：n＝開始落下後第幾幀，T＝落下要幾幀，A＝回彈高度（px）。回傳往上的位移（0＝落定） */
export const dropY = (n: number, T: number, h: number, A: number) => {
  if (n < 0) return h;
  if (n < T) return h * (1 - (n / T) ** 2);
  const t = n - T; // 落地後：|sin| 半波，每一下高度 ×0.35、時間 ×0.7
  let amp = A, len = 6, q = t;
  for (let i = 0; i < 3; i++) { if (q < len) return amp * Math.sin((Math.PI * q) / len); q -= len; amp *= 0.35; len *= 0.7; }
  return 0;
};

const Card: React.FC<{ o: Overlay3D; k: number; W: number; Hh: number; children: React.ReactNode }> = ({ o, k, W, Hh, children }) => (
  <div style={{ position: "absolute", left: o.x ?? L.X, top: o.y ?? 900, width: W, height: Hh, opacity: k, background: H.cardCompare, border: `2px solid ${H.lineSoft}`, boxSizing: "border-box", overflow: "hidden" }}>
    {o.title ? <div style={{ position: "absolute", left: 16, top: 10, ...zh(30, onC(H.line), 800), background: H.line, padding: "2px 14px 4px", zIndex: 2 }}>{o.title}</div> : null}
    {o.tag ? <div style={{ position: "absolute", right: 16, top: 14, ...zh(sm(30), H.text2, 600), zIndex: 2 }}>{o.tag}</div> : null}
    {children}
  </div>
);

// ── pkg-frames：光罩框＝面積單位。items＝[{ at, dashed? }]，一格一格受重力落下；右上計數＝已落定的格數 ──
const Frames: React.FC<P> = ({ o, f, k, m }) => {
  const W = o.w ?? 952, Hh = o.h ?? 430, cols = o.cols ?? 7, items = (o.items ?? []) as { at: number; dashed?: boolean }[];
  const pad = 24, gap = 14, fw = Math.min(o.fw ?? 1e9, (W - 2 * pad - (cols - 1) * gap) / cols), fh = (fw * 33) / 26, top = 66;
  const T = 6, landed = o.total ?? items.filter((it) => f >= it.at + T).length, lastAt = Math.max(-1e9, ...items.filter((it) => f >= it.at + T).map((it) => it.at + T));
  const pop = 1 + 0.25 * Math.sin(Math.PI * clamp01((f - lastAt) / 8));
  const flash = ((o.flash ?? []) as { at: number }[]).reduce((a, q) => Math.max(a, Math.sin(Math.PI * clamp01((f - q.at) / 14))), 0);
  const fc = col(m.product, "pkFrame"), unit = o.unit ?? "個光罩面積";
  const marks = (o.marks ?? []) as { at: number; text: string; from: number }[];
  return (
    <Card o={{ ...o, tag: undefined }} k={k} W={W} Hh={Hh}>
      <div style={{ position: "absolute", right: 18, top: o.fw ? top + fh / 2 - 40 : 6, display: "flex", flexDirection: o.fw ? "column" : "row", alignItems: o.fw ? "flex-end" : "baseline", gap: 10 }}>
        <div style={{ ...zh(64, H.amber, 900), transform: `scale(${pop.toFixed(3)})`, transformOrigin: "right center" }}>×{landed}</div>
        <div style={zh(sm(30), H.text2, 700)}>{unit}</div>
      </div>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
        {items.map((it, i) => {
          const r = Math.floor(i / cols), c = i % cols, x = pad + c * (fw + gap), y = top + r * (fh + 16);
          if (f < it.at) return null;
          const dy = dropY(f - it.at, T, 150, 12), o2 = clamp01((f - it.at + 1) / 2);
          return (
            <g key={i} transform={`translate(0 ${(-dy).toFixed(1)})`} opacity={o2}>
              <rect x={x} y={y} width={fw} height={fh} fill={fc} fillOpacity={it.dashed ? 0.05 : 0.16 + 0.5 * flash} stroke={fc} strokeWidth={it.dashed ? 3 : 4} strokeDasharray={it.dashed ? "9 7" : undefined} />
              <text x={x + fw / 2} y={y + fh / 2 + 14} textAnchor="middle" style={en(40, it.dashed ? H.text3 : H.text, 800)}>{i + 1}</text>
            </g>
          );
        })}
        {marks.map((mk, j) => {
          if (f < mk.at) return null;
          const i0 = mk.from, r = Math.floor(i0 / cols), c = i0 % cols, x = pad + c * (fw + gap), y = top + r * (fh + 16);
          const a = tween(f, mk.at, 6, EASE.enter);
          return <g key={`m${j}`} opacity={a}><rect x={x + 4} y={y + 6} width={fw - 8} height={44} fill={H.panel} stroke={H.text3} strokeWidth={2} /><text x={x + fw / 2} y={y + 40} textAnchor="middle" style={en(32, H.text, 800)}>{mk.text}</text></g>;
        })}
      </svg>
      {o.note ? <div style={{ position: "absolute", left: pad, bottom: 12, opacity: tween(f, o.note.at ?? o.at, 6, EASE.enter), ...zh(sm(30), H.text2, 700) }}>{o.note.text}</div> : null}
    </Card>
  );
};

// ── pkg-wafers：兩片晶圓（左：拆成小顆、右：一整顆大晶片），同一組缺陷點受重力落下；被打中的格子變紅；右邊計數「好的 ≈45%」 ──
const waferCache = new Map<string, any>();
const waferData = (R: number, small: number, big: number) => {
  const key = `${R}/${small}/${big}`;
  if (waferCache.has(key)) return waferCache.get(key) as { S: [number, number][]; B: [number, number][]; pts: [number, number][] };
  const cells = (c: number) => { const out: [number, number][] = []; const n = Math.ceil(R / c) + 1; for (let j = -n; j < n; j++) for (let i = -n; i < n; i++) { const x = i * c, y = j * c; if ([[x, y], [x + c, y], [x, y + c], [x + c, y + c]].every(([a, b]) => a * a + b * b <= (R - 4) ** 2)) out.push([x, y]); } return out; };
  const S = cells(small), B = cells(big), r = seeded(20261118);
  // 缺陷點：先挑約 55% 的大晶片各放一顆（示意，對應「好的不到一半」），再撒幾顆落在晶片之間
  const pts: [number, number][] = [];
  for (const [x, y] of B) if (r() < 0.56) pts.push([x + 6 + r() * (big - 12), y + 6 + r() * (big - 12)]);
  const data = { S, B, pts };
  waferCache.set(key, data);
  return data;
};
const Wafers: React.FC<P> = ({ o, f, k, m }) => {
  const W = o.w ?? 952, Hh = o.h ?? 420, R = Math.min(170, (Hh - 110) / 2), small = 24, big = 56, { S, B, pts } = waferData(R, small, big);
  const t0 = o.defect?.at ?? o.at + 10, half = o.half?.at ?? t0 + 30, T = 7;
  const landAt = (i: number) => t0 + Math.round((i * 22) / Math.max(1, pts.length)) + T;
  const hit = (cx: number, cy: number, c: number, i: number) => f >= landAt(i) && pts[i][0] >= cx && pts[i][0] < cx + c && pts[i][1] >= cy && pts[i][1] < cy + c;
  const wf = col(m.product, "pkWafer"), good = col(m.product, "pkGood"), bad = col(m.product, "pkBad"), dft = col(m.product, "pkInk");
  const wafer = (ox: number, list: [number, number][], c: number, label: string, sub: string) => {
    const cy = 58 + R;
    let nBad = 0;
    const rects = list.map(([x, y], j) => { let b = false; for (let i = 0; i < pts.length; i++) if (hit(x, y, c, i)) { b = true; break; } if (b) nBad++; return <rect key={j} x={ox + x + 1} y={cy + y + 1} width={c - 2} height={c - 2} fill={b ? bad : good} fillOpacity={b ? 0.85 : 0.32} stroke={H.lineSoft} strokeWidth={1} />; });
    return { el: (
      <g>
        <circle cx={ox} cy={cy} r={R} fill={wf} stroke={H.text3} strokeWidth={2} />
        {rects}
        {pts.map((p: [number, number], i: number) => { const n = f - (landAt(i) - T); if (n < 0) return null; const dy = dropY(n, T, 120, 5); return <circle key={`d${i}`} cx={ox + p[0]} cy={cy + p[1] - dy} r={6} fill={dft} stroke={H.panel} strokeWidth={2.5} />; })}
        <text x={ox} y={cy + R + 40} textAnchor="middle" style={zh(sm(32), H.text, 800)}>{label}</text>
      </g>), nBad, n: list.length };
  };
  const L1 = wafer(W * 0.21, S, small, "拆成小顆", ""), R1 = wafer(W * 0.555, B, big, "一整顆大晶片", "");
  const hk = tween(f, half, 6, EASE.enter), pop = 1 + 0.2 * Math.sin(Math.PI * clamp01((f - half) / 10));
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>{L1.el}{R1.el}</svg>
      <div style={{ position: "absolute", left: W - 232, top: 150, opacity: hk, transform: `scale(${pop.toFixed(3)})`, transformOrigin: "left top", background: H.panel, border: `3px solid ${H.coral}`, padding: "4px 14px 6px" }}>
        <div style={zh(sm(30), H.text2, 700)}>好的</div><div style={zh(56, H.coral, 900)}>{o.half?.text ?? "≈45%"}</div>
      </div>
    </Card>
  );
};

// ── pkg-detour：上＝拆開再拼（A → 下到微凸塊 → 中介層走線 → 上到 B，路徑長、接點多）；下＝單一大晶片（直線、短） ──
const Detour: React.FC<P> = ({ o, f, k, m }) => {
  const W = o.w ?? 460, Hh = o.h ?? 470, chip = col(m.product, "pkChip"), ipc = col(m.product, "pkIp"), ub = col(m.product, "pkUb"), sig = col(m.product, "pkSig"), badc = col(m.product, "pkBad");
  const jA = o.joints?.at ?? o.at + 10, dA = o.detour?.at ?? jA + 20, wide = W >= 800, cx0 = 30, cw = wide ? W / 2 - 60 : W - 60, cx2 = wide ? W / 2 + 30 : cx0; // wide＝兩張圖左右並排（寬卡）
  // 上：兩顆晶片在中介層上
  const y0 = 104, chipW = cw * 0.4, chipH = 52, ipY = y0 + chipH + 14;
  const ax = cx0 + chipW / 2, bx = cx0 + cw - chipW / 2, sy = y0 + chipH / 2, ry = ipY + 8;
  const path = [[ax, sy], [ax + chipW * 0.3, sy], [ax + chipW * 0.3, ry], [bx - chipW * 0.3, ry], [bx - chipW * 0.3, sy], [bx, sy]];
  const seg = path.slice(1).map((p, i) => Math.hypot(p[0] - path[i][0], p[1] - path[i][1])), tot = seg.reduce((a, b) => a + b, 0);
  const at = (u: number) => { let d = u * tot, i = 0; while (i < seg.length - 1 && d > seg[i]) { d -= seg[i]; i++; } const a = path[i], b = path[i + 1], t = Math.min(1, d / seg[i]); return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]; };
  const jk = tween(f, jA, 6, EASE.enter), dk = tween(f, dA, 8, EASE.move);
  const dots = [0, 0.33, 0.66].map((ph, i) => { const u = (((f - o.at) / 30) * 0.55 + ph) % 1, [x, y] = dk > 0.5 ? at(u) : [ax + (bx - ax) * u, sy]; return <circle key={i} cx={x} cy={y} r={7} fill={dk > 0.5 ? badc : sig} stroke={H.panel} strokeWidth={2} />; });
  // 下：單一大晶片
  const y2 = wide ? y0 : 318, bigH = wide ? chipH + 36 : 62;
  const dots2 = [0, 0.5].map((ph, i) => { const u = (((f - o.at) / 30) * 1.1 + ph) % 1; return <circle key={i} cx={cx2 + 40 + (cw - 80) * u} cy={y2 + bigH / 2} r={7} fill={sig} stroke={H.panel} strokeWidth={2} />; });
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        <text x={cx0} y={y0 - 10} style={zh(sm(30), H.text, 800)}>拆開再拼</text>
        <rect x={cx0} y={ipY} width={cw} height={22} fill={ipc} stroke={H.text3} strokeWidth={1.5} />
        {[cx0, cx0 + cw - chipW].map((x, i) => <g key={i}><rect x={x} y={y0} width={chipW} height={chipH} fill={chip} rx={4} />{Array.from({ length: 9 }, (_, j) => <circle key={j} cx={x + 10 + j * ((chipW - 20) / 8)} cy={y0 + chipH + 7} r={4.5} fill={ub} opacity={0.4 + 0.6 * jk} stroke={jk > 0.5 ? badc : "none"} strokeWidth={1.5} />)}</g>)}
        <polyline points={(dk > 0.5 ? path : [[ax, sy], [bx, sy]]).map((p) => p.join(",")).join(" ")} fill="none" stroke={dk > 0.5 ? badc : sig} strokeWidth={3} strokeDasharray={dk > 0.5 ? "10 7" : undefined} opacity={0.8} />
        {dots}
        <text x={cx2} y={y2 - 10} style={zh(sm(30), H.text, 800)}>單一大晶片</text>
        <rect x={cx2} y={y2} width={cw} height={bigH} fill={chip} rx={4} />
        <line x1={cx2 + 40} y1={y2 + bigH / 2} x2={cx2 + cw - 40} y2={y2 + bigH / 2} stroke={sig} strokeWidth={3} />
        {dots2}
        <text x={cx2} y={y2 + bigH + 44} style={zh(sm(30), H.text2, 700)}>在同一塊矽裡，走得短</text>
        {wide ? <><text x={cx0} y={ipY + 66} style={zh(sm(30), H.coral, 800)}>{dk > 0.5 ? "下到凸塊、繞中介層、再上來" : "想像中直接過去"}</text><line x1={W / 2} x2={W / 2} y1={y0 - 30} y2={Hh - 20} stroke={H.lineSoft} strokeWidth={2} /></> : null}
      </svg>
      {[["接點", jA, 0], ["距離", dA, 1]].map(([t, a, i]) => (
        <div key={i as number} style={{ position: "absolute", right: 14 + (1 - (i as number)) * 128, top: 8, opacity: tween(f, a as number, 6, EASE.enter), ...zh(36, H.coral, 900), background: H.panel, border: `2px solid ${H.coral}`, padding: "0 10px 2px" }}>{t as string} ↑</div>
      ))}
    </Card>
  );
};

// ── pkg-xsec：沿晶片與記憶體的交界切開（由上到下：晶片／HBM → 微凸塊 → 中介層（RDL 細線＋TSV）→ C4 → 有機基板）；右邊一般電路板對照。
//    光點讀 3D 的 flows（同一份 op.u、op.k）：HBM → RDL → 晶片、晶片 → RDL → HBM；電路板那邊同一個時間跑得慢、稀疏、路徑長 ──
const XSec: React.FC<P> = ({ o, f, k, m, s }) => {
  const W = o.w ?? 952, Hh = o.h ?? 470, c = (n: string) => col(m.product, n), acts = m.product.actions ?? {};
  const thin = o.thin?.at ?? o.at + 10, near = o.near?.at ?? thin + 30, glow = tween(f, thin, 8, EASE.enter), nk = tween(f, near, 8, EASE.enter);
  const lx = 24, lw = W * 0.62, top = 64;
  // 層的 y（由上到下，順序與 3D 一致）
  const yChip = top + 34, hChip = 60, yUb = yChip + hChip, hUb = 16, yIp = yUb + hUb, hIp = 62, yC4 = yIp + hIp, hC4 = 24, ySub = yC4 + hC4, hSub = 66;
  const chipX0 = lx + 20, chipX1 = lx + lw * 0.5, hbmX0 = chipX1 + 44, hbmX1 = lx + lw - 20;
  const rdlY = [yIp + 8, yIp + 15, yIp + 22, yIp + 29];
  const ubs = (x0: number, x1: number, n: number) => Array.from({ length: n }, (_, i) => x0 + 10 + (i * (x1 - x0 - 20)) / (n - 1));
  // 光點：HBM 底 → 往下到 RDL → 沿 RDL → 往上到晶片底（memIn），反方向（memOut）
  const pathIn = (y: number) => [[hbmX0 + 30, yUb], [hbmX0 + 30, y], [chipX1 - 40, y], [chipX1 - 40, yUb]];
  const flowDots = (id: string, pts: number[][], key: string) => {
    const d = acts[id] as any, op = s.ops[id];
    if (!d || !op) return null;
    const restK = d.rest && op.f >= op.until ? (d.restO ?? 0.55) * (1 - tween(op.f, op.end + d.rest, 8, EASE.move)) : 0, vis = Math.max(op.k, restK);
    if (vis <= 0.01) return null;
    const seg = pts.slice(1).map((p, i) => Math.hypot(p[0] - pts[i][0], p[1] - pts[i][1])), tot = seg.reduce((a, b) => a + b, 0);
    const at = (u: number) => { let dd = u * tot, i = 0; while (i < seg.length - 1 && dd > seg[i]) { dd -= seg[i]; i++; } const a = pts[i], b = pts[i + 1], t = Math.min(1, dd / seg[i]); return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]; };
    const n = d.n ?? 6, speed = Math.min(1, op.g), out: React.ReactNode[] = [];
    for (let i = 0; i < n; i++) {
      const raw = op.u * (d.rate ?? 1) - (d.phase ?? 0) - i / n; if (raw < 0) continue;
      const u = raw - Math.floor(raw), e = Math.min(1, u * 10, (1 - u) * 10) * vis;
      for (let t = 3; t >= 0; t--) { const uu = u - t * 0.025 * speed; if (uu <= 0) continue; const [x, y] = at(uu); out.push(<circle key={`${key}${i}-${t}`} cx={x} cy={y} r={t ? 6 - t : 7} fill={t ? c("pkSig") : H.panel} stroke={t ? "none" : c("pkSigRim")} strokeWidth={2.5} opacity={e * (t ? 0.55 - t * 0.12 : 1)} />); }
    }
    return out;
  };
  const flows = (o.flows ?? []) as string[];
  // 電路板對照：線粗約 5 倍、條數少、兩點相距遠；光點用同一個 op，但只用 0.3 倍速、一半顆數
  const bx0 = lx + lw + 30, bw = W - bx0 - 24, byTop = top + 40, bH = hChip + hUb + hIp + hC4 + hSub;
  const op0 = s.ops[flows[0]], bdots: React.ReactNode[] = [];
  if (op0 && op0.k > 0.01) for (let i = 0; i < 3; i++) { const raw = op0.u * 0.32 - i / 3; if (raw < 0) continue; const u = raw - Math.floor(raw); bdots.push(<circle key={`b${i}`} cx={bx0 + 16 + (bw - 32) * u} cy={byTop + bH * 0.55} r={7} fill={H.panel} stroke={c("pkSigRim")} strokeWidth={2.5} opacity={op0.k * Math.min(1, u * 10, (1 - u) * 10)} />); }
  const lab = (x: number, y: number, t: string, e2?: string, anchor: "start" | "end" = "start") => <g><text x={x} y={y} textAnchor={anchor} style={zh(sm(30), H.text, 800)}>{t}</text>{e2 ? <text x={x} y={y + 30} textAnchor={anchor} style={en(sm(30), H.text2, 600)}>{e2}</text> : null}</g>;
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        {/* 晶片、HBM（HBM 側面畫出薄片分層） */}
        <rect x={chipX0} y={yChip} width={chipX1 - chipX0} height={hChip} fill={c("pkChip")} rx={3} />
        <text x={(chipX0 + chipX1) / 2} y={yChip + 42} textAnchor="middle" style={zh(sm(30), H.onAccent, 800)}>運算晶片</text>
        <rect x={hbmX0} y={yChip} width={hbmX1 - hbmX0} height={hChip} fill={c("pkHbm")} rx={3} />
        {Array.from({ length: 11 }, (_, i) => <line key={i} x1={hbmX0} x2={hbmX1} y1={yChip + 6 + i * 5} y2={yChip + 6 + i * 5} stroke={c("pkHbm2")} strokeWidth={1.5} />)}
        <text x={(hbmX0 + hbmX1) / 2} y={yChip + 42} textAnchor="middle" style={zh(sm(30), H.onAccent, 800)}>HBM</text>
        {/* 微凸塊（細密） */}
        {[...ubs(chipX0, chipX1, 16), ...ubs(hbmX0, hbmX1, 9)].map((x, i) => <circle key={`u${i}`} cx={x} cy={yUb + hUb / 2} r={5} fill={c("pkUb")} />)}
        {/* 中介層：矽本體＋上方 RDL 細線（念到「細很多」亮起）＋TSV */}
        <rect x={lx} y={yIp} width={lw} height={hIp} fill={c("pkIp")} stroke={H.text3} strokeWidth={1.5} />
        {rdlY.map((y, i) => <line key={`r${i}`} x1={lx + 6} x2={lx + lw - 6} y1={y} y2={y} stroke={glow > 0.5 ? c("pkProc") : c("pkRdl")} strokeWidth={1.6} opacity={0.5 + 0.5 * glow} />)}
        {Array.from({ length: 9 }, (_, i) => <rect key={`t${i}`} x={lx + 30 + i * ((lw - 60) / 8) - 3} y={yIp + 34} width={6} height={hIp - 34} fill={c("pkTsv")} />)}
        {/* C4（較粗、間距寬）、基板（增層＋核心，線粗） */}
        {Array.from({ length: 9 }, (_, i) => <ellipse key={`c${i}`} cx={lx + 30 + i * ((lw - 60) / 8)} cy={yC4 + hC4 / 2} rx={11} ry={10} fill={c("pkC4")} />)}
        <rect x={lx - 12} y={ySub} width={lw + 24} height={hSub} fill={c("pkSub")} stroke={H.text3} strokeWidth={1.5} />
        <rect x={lx - 12} y={ySub + 19} width={lw + 24} height={28} fill={c("pkSub2")} />
        {[ySub + 12, ySub + 54].map((y, i) => <line key={`s${i}`} x1={lx} x2={lx + lw} y1={y} y2={y} stroke={c("pkSubCu")} strokeWidth={6} />)}
        {/* 光點（和 3D 同一份） */}
        {flows[0] ? flowDots(flows[0], pathIn(rdlY[1]), "i") : null}
        {flows[1] ? flowDots(flows[1], pathIn(rdlY[2]).slice().reverse(), "o") : null}
        {/* 「貼得近」：HBM 與晶片之間的短箭頭尺 */}
        <g opacity={nk}><line x1={chipX1 + 2} x2={hbmX0 - 2} y1={yChip - 16} y2={yChip - 16} stroke={H.amber} strokeWidth={4} /><path d={`M${chipX1 + 2} ${yChip - 26} v20 M${hbmX0 - 2} ${yChip - 26} v20`} stroke={H.amber} strokeWidth={4} /><text x={(chipX1 + hbmX0) / 2} y={yChip - 26} textAnchor="middle" style={zh(sm(30), H.amber, 900)}>近</text></g>
        {/* 標籤 */}
        {lab(lx, ySub + hSub + 36, "晶片・微凸塊・中介層・C4・基板")}
        {/* 一般電路板對照 */}
        <text x={bx0} y={byTop - 12} style={zh(sm(30), H.text, 800)}>一般電路板</text>
        <rect x={bx0} y={byTop} width={bw} height={bH} fill={c("pkPcb")} opacity={0.85} />
        {[0.3, 0.55, 0.8].map((v, i) => <line key={`p${i}`} x1={bx0 + 10} x2={bx0 + bw - 10} y1={byTop + bH * v} y2={byTop + bH * v} stroke={c("pkPcbCu")} strokeWidth={9} />)}
        {bdots}
        <g opacity={nk}><line x1={bx0 + 16} x2={bx0 + bw - 16} y1={byTop + bH + 22} y2={byTop + bH + 22} stroke={H.text2} strokeWidth={3} /><text x={bx0 + bw / 2} y={byTop + bH + 56} textAnchor="middle" style={zh(sm(30), H.text2, 800)}>線粗、條數少</text></g>
      </svg>
    </Card>
  );
};

// ── pkg-warp：大面積易翹曲（示意）：中介層剖面的邊緣微微上翹，念到時閃一下；中介層與基板之間的底部填充膠小標 ──
const Warp: React.FC<P> = ({ o, f, k, m }) => {
  const W = o.w ?? 520, Hh = o.h ?? 250, c = (n: string) => col(m.product, n), t0 = o.flash?.at ?? o.at + 6;
  const fl = Math.sin(Math.PI * clamp01((f - t0) / 16)), bend = 14 * fl, x0 = 30, x1 = W - 30, y = 120;
  const curve = (dy: number) => `M${x0} ${y + dy - bend} Q${W / 2} ${y + dy + bend * 0.6} ${x1} ${y + dy - bend}`;
  const uf = tween(f, o.uf?.at ?? t0 + 10, 6, EASE.enter);
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        {Array.from({ length: 8 }, (_, i) => <line key={i} x1={x0 + (i * (x1 - x0)) / 7} x2={x0 + (i * (x1 - x0)) / 7} y1={y - 40} y2={y + 10} stroke={H.lineSoft} strokeWidth={1.5} />)}
        <path d={curve(0)} fill="none" stroke={c("pkIp")} strokeWidth={16} />
        <path d={curve(0)} fill="none" stroke={fl > 0.2 ? H.coral : H.text3} strokeWidth={2.5} />
        <rect x={x0 - 10} y={y + 26} width={x1 - x0 + 20} height={34} fill={c("pkSub")} stroke={H.text3} strokeWidth={1.5} />
        <rect x={x0 + 10} y={y + 12} width={x1 - x0 - 20} height={14} fill={H.amber} opacity={0.5 * uf} />
        <text x={x0} y={Hh - 16} style={zh(sm(30), H.text2, 800)} opacity={uf}>底部填充膠</text>
      </svg>
    </Card>
  );
};

// ── pkg-choice：二選一（左＝往旁邊拼 2.5D：兩顆晶片並排在薄板上；右＝往上疊 3D：一疊 12 層）；念到才亮 ──
const Choice: React.FC<P> = ({ o, f, k, m }) => {
  const W = o.w ?? 952, Hh = o.h ?? 300, c = (n: string) => col(m.product, n), la = tween(f, o.left?.at ?? o.at, 6, EASE.enter), ra = tween(f, o.right?.at ?? o.at + 20, 6, EASE.enter);
  const half = W / 2, base = Hh - 70;
  const box = (x: number, on: number, children: React.ReactNode, t: string) => (
    <g opacity={0.45 + 0.55 * on}>
      <rect x={x + 14} y={60} width={half - 28} height={Hh - 76} fill="none" stroke={on > 0.5 ? H.amber : H.lineSoft} strokeWidth={on > 0.5 ? 4 : 2} />
      {children}
      <text x={x + half / 2} y={Hh - 26} textAnchor="middle" style={zh(sm(34), H.text, 900)}>{t}</text>
    </g>
  );
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        {box(0, la, <g><rect x={60} y={base - 20} width={half - 120} height={14} fill={c("pkIp")} stroke={H.text3} /><rect x={80} y={base - 70} width={(half - 180) / 2} height={46} fill={c("pkChip")} /><rect x={100 + (half - 180) / 2} y={base - 70} width={(half - 180) / 2} height={46} fill={c("pkChip")} /></g>, "往旁邊拼（2.5D）")}
        {box(half, ra, <g>{Array.from({ length: 12 }, (_, i) => <rect key={i} x={half + half / 2 - 70} y={base - 16 - i * 10 * (0.6 + 0.4 * ra)} width={140} height={8} fill={i % 2 ? c("pkHbm2") : c("pkHbm")} />)}</g>, "往上疊（3D）")}
        <text x={half} y={Hh / 2 + 10} textAnchor="middle" style={zh(40, H.text2, 900)}>？</text>
      </svg>
    </Card>
  );
};

export const PkgSection: React.FC<P> = (p) => {
  const kd = (p.o as any).kind;
  if (kd === "pkg-frames") return <Frames {...p} />;
  if (kd === "pkg-wafers") return <Wafers {...p} />;
  if (kd === "pkg-detour") return <Detour {...p} />;
  if (kd === "pkg-xsec") return <XSec {...p} />;
  if (kd === "pkg-warp") return <Warp {...p} />;
  if (kd === "pkg-choice") return <Choice {...p} />;
  return null;
};

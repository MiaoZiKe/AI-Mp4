// 等距風 isoVersion 6 的「比喻畫面」view（Andy 2026/11/17：風格不要侷限都是對話框，可以多變一點，多配合當前的內容進行，生動點）。
// 這裡每一種 view 都是「用一個動作講一件事」的 SVG／CSS 2D 小場景，資料全由 props 給（文字、時間、顏色），可重用到之後的片：
//   belts 兩條輸送帶並排對照（輸入一樣、輸出不同）｜paper 一張紙被逐行寫出、蓋章、釘住、交給 AI｜slots 同一張卡複製進多個槽口，之後每次都先讀
//   scoreboard 計分牌＋星星＋每次得分｜pack AI 背包越塞越重｜volume 大箱子對小紙條（或長文濃縮成一張小卡）
//   lostmid 一長排方塊，開頭結尾亮、中間暗（越長越不穩）｜carry 舊桌子的便條搬到乾淨新桌子｜balance 天平（A 重 B 輕，≠）
//   board 黑板：AI 與「你」輪流寫字、紅筆圈錯｜compound 單利對複利的年度長條（利息再生利息）
// 色碼一律走 THEME_ISO（col／T）；進場時間都是 cue id 加減幀（props 裡的 at），不手填秒數。說明見 docs/channels/caffaine-visual-plan-1116.md 第 5 節。
import React from "react";
import { FONT_ZH, LAYOUT_ISO as L, THEME_ISO as T } from "../../theme";
import { EASE, tween } from "../anim";
import type { Panel } from "./engine";
import { bounce, Chip, col, riseIn, slam } from "./IsoVideo";

type VP = { f: number; p: Panel; tone: (typeof T.tones)[string] };
const zh: React.CSSProperties = { fontFamily: FONT_ZH, whiteSpace: "nowrap", lineHeight: 1.16 };
const FAR = 1e9, X0 = L.X, TOP = 450, IW = L.INNER_W;
const E = (f: number, at: number, d: number) => tween(f, at, d, EASE.move);
const O = (f: number, at: number, d: number) => tween(f, at, d, EASE.enter);
const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const typed = (t: string, f: number, at: number, dur: number): [string, string] => { const n = Math.floor(clamp((f - at) / Math.max(1, dur)) * t.length); return [t.slice(0, n), t.slice(n)]; };
const Full: React.FC<{ children?: React.ReactNode }> = ({ children }) => <svg width={L.W} height={L.H} style={{ position: "absolute", left: 0, top: 0 }}>{children}</svg>;
const Panel2: React.FC<{ x: number; y: number; w: number; h: number; color?: string; ov?: string; style?: React.CSSProperties; children?: React.ReactNode }> = ({ x, y, w, h, color = "primary", ov, style, children }) => (
  <div data-ov={ov} style={{ position: "absolute", left: x, top: y, width: w, height: h, background: T.card, borderRadius: 40, boxShadow: `0 10px 0 ${col(color).side}`, boxSizing: "border-box", ...style }}>{children}</div>
);

// ───────── 小機器人（AI）：idle／read／happy／strain 四種表情 ─────────
const Bot: React.FC<{ x: number; y: number; s?: number; f: number; mood?: string; c?: string }> = ({ x, y, s = 1, f, mood = "idle", c = "primary" }) => {
  const k = col(c), bob = mood === "strain" ? 3 * Math.sin(f / 2.2) : 8 * Math.sin(f / 9), sway = mood === "strain" ? 1.5 * Math.sin(f / 3) : 3 * Math.sin(f / 13), blink = f % 96 < 4 && mood !== "happy" && mood !== "strain";
  const sx = mood === "strain" ? 1.05 : 1, sy = mood === "strain" ? 0.93 : 1;
  const ey = -102, look = mood === "read" ? 5 : 0, sw = { fill: "none", stroke: T.ink, strokeWidth: 6, strokeLinecap: "round", strokeLinejoin: "round" } as const;
  return (
    <g transform={`translate(${x},${y + bob}) scale(${s * sx},${s * sy}) rotate(${sway.toFixed(2)})`}>
      <rect x={-44} y={-46} width={26} height={42} rx={10} fill={k.side} /><rect x={18} y={-46} width={26} height={42} rx={10} fill={k.side} />
      <rect x={-94} y={-112} width={26} height={62} rx={13} fill={k.side} transform={mood === "happy" ? `rotate(${(-18 + 8 * Math.sin(f / 5)).toFixed(1)} -81 -106)` : undefined} /><rect x={68} y={-112} width={26} height={62} rx={13} fill={k.side} transform={mood === "happy" ? `rotate(${(18 - 8 * Math.sin(f / 5)).toFixed(1)} 81 -106)` : undefined} />
      <rect x={-72} y={-150} width={144} height={112} rx={38} fill={k.side} /><rect x={-72} y={-158} width={144} height={112} rx={38} fill={k.fill} />
      <path d="M0 -158 V-182" stroke={k.side} strokeWidth={7} strokeLinecap="round" /><circle cx={0} cy={-188} r={10} fill={col("note").fill} stroke={T.card} strokeWidth={4} />
      <rect x={-54} y={-142} width={108} height={72} rx={28} fill={T.card} />
      {mood === "happy" ? <><path d="M-34 -100 Q-22 -118 -10 -100" {...sw} /><path d="M10 -100 Q22 -118 34 -100" {...sw} /></>
        : mood === "strain" ? <><path d="M-36 -114 L-16 -102 L-36 -90" {...sw} /><path d="M36 -114 L16 -102 L36 -90" {...sw} /></>
        : <><ellipse cx={-22 + look} cy={ey} rx={9} ry={blink ? 1.5 : 11} fill={T.ink} /><ellipse cx={22 + look} cy={ey} rx={9} ry={blink ? 1.5 : 11} fill={T.ink} /></>}
      {mood === "happy" ? <path d="M-16 -82 Q0 -66 16 -82" {...sw} strokeWidth={5} /> : mood === "strain" ? <path d="M-18 -78 Q-9 -88 0 -78 T18 -78" {...sw} strokeWidth={5} /> : <path d="M-12 -80 H12" {...sw} strokeWidth={5} />}
      {mood === "strain" ? <path d="M70 -150 Q56 -128 70 -118 Q84 -128 70 -150 Z" fill={col("sky").fill} stroke={T.card} strokeWidth={3} /> : null}
    </g>
  );
};
/** 紙張（SVG）：白底、細框、幾行假字；accent 給上緣色條 */
const Sheet: React.FC<{ x: number; y: number; w: number; h: number; rot?: number; lines?: number; accent?: string; fill?: string }> = ({ x, y, w, h, rot = 0, lines = 4, accent, fill = T.card }) => (
  <g transform={`rotate(${rot} ${x + w / 2} ${y + h / 2})`}>
    <rect x={x + 4} y={y + 7} width={w} height={h} rx={12} fill={T.cardSide} />
    <rect x={x} y={y} width={w} height={h} rx={12} fill={fill} stroke={T.line} strokeWidth={3} />
    {accent ? <rect x={x} y={y} width={w} height={Math.max(10, h * 0.1)} rx={8} fill={accent} /> : null}
    {Array.from({ length: lines }, (_, i) => <rect key={i} x={x + w * 0.14} y={y + h * 0.22 + i * ((h * 0.7) / lines)} width={w * (i === lines - 1 ? 0.45 : 0.72)} height={Math.max(6, h * 0.045)} rx={4} fill={T.line} />)}
  </g>
);
const Tick: React.FC<{ cx: number; cy: number; r: number; color: string; t: number }> = ({ cx, cy, r, color, t }) => (
  <g transform={`translate(${cx},${cy}) scale(${(0.4 + 0.6 * t + 0.15 * Math.sin(Math.min(1, t) * 3.14)).toFixed(3)})`} opacity={clamp(t * 3)}>
    <circle r={r} fill={col(color).fill} stroke={T.card} strokeWidth={4} /><path d={`M${-r * 0.42} ${r * 0.02} L${-r * 0.1} ${r * 0.36} L${r * 0.46} ${-r * 0.3}`} fill="none" stroke={col(color).on} strokeWidth={r * 0.2} strokeLinecap="round" strokeLinejoin="round" />
  </g>
);
const Env: React.FC<{ x: number; y: number; w?: number }> = ({ x, y, w = 96 }) => (
  <g transform={`translate(${x},${y})`}><rect width={w} height={w * 0.68} rx={10} fill={col("primary").soft} stroke={col("primary").fill} strokeWidth={5} /><path d={`M6 8 L${w / 2} ${w * 0.38} L${w - 6} 8`} fill="none" stroke={col("primary").fill} strokeWidth={5} strokeLinejoin="round" /></g>
);

// ───────── belts：兩條輸送帶並排（輸入一樣，輸出不同） ─────────
const BeltsView: React.FC<VP> = ({ f, p }) => {
  const q = p.p as any, A = (s: any, fb: number) => p.at(s, fb), lanes = q.lanes as any[], LH = 330, tops = [TOP, TOP + LH + 100];
  const tMid = A(q.mid?.at, FAR);
  return (
    <>
      {lanes.map((ln, i) => {
        const y0 = tops[i], c = col(ln.color), tReq = A(ln.reqAt, p.in + 2), pass = E(f, tReq, 20), items = (ln.items ?? []) as any[], tGate = A(ln.gate?.at, FAR);
        const ex = lerp(X0 + 6, X0 + 330, pass);
        return (
          <React.Fragment key={i}>
            <div data-ov={`泳道${i + 1}`} style={{ position: "absolute", left: X0, top: y0, ...bounce(f, A(ln.at, p.in + 2 + i * 4)) }}><Chip text={ln.label} bg={c.fill} fg={c.on} px={42} side={c.side} /></div>
            <Full>
              <rect x={X0} y={y0 + 262} width={IW} height={38} rx={19} fill={T.cardSide} />
              <path d={`M${X0 + 22} ${y0 + 281} H${X0 + IW - 22}`} stroke={T.card} strokeWidth={7} strokeLinecap="round" strokeDasharray="16 24" strokeDashoffset={-(f * 3) % 40} />
              <Bot x={X0 + 410} y={y0 + 262} s={0.95} f={f} mood={f > tReq + 10 && f < tReq + 40 ? "read" : "idle"} c={ln.color === "wrong" ? "sky" : "primary"} />
              {f >= tReq && pass < 1 ? <Env x={ex} y={y0 + 200} /> : null}
              {ln.gate && f >= tGate ? (() => { const g = E(f, tGate, 12); return (
                <g transform={`translate(0,${Math.round((1 - g) * -120)})`} opacity={O(f, tGate, 4)}>
                  <rect x={X0 + 556} y={y0 + 70} width={150} height={180} rx={16} fill={col("note").soft} stroke={col("note").fill} strokeWidth={6} />
                  <path d={`M${X0 + 580} ${y0 + 112} H${X0 + 682} M${X0 + 580} ${y0 + 146} H${X0 + 682} M${X0 + 580} ${y0 + 180} H${X0 + 650}`} stroke={col("note").fill} strokeWidth={8} strokeLinecap="round" />
                  <circle cx={X0 + 631} cy={y0 + 232} r={20} fill={col("wrong").fill} />
                </g>); })() : null}
              {items.map((it, k) => {
                const t = A(it.at, FAR); if (f < t) return null; const e = E(f, t, 12);
                if (it.kind === "card") {
                  const ox = lerp(X0 + 520, X0 + 730, e);
                  return <g key={k} opacity={O(f, t, 4)}><rect x={ox} y={y0 + 70} width={220} height={190} rx={22} fill={T.card} stroke={col("right").fill} strokeWidth={6} />{[0, 1, 2].map((r) => <g key={r}><circle cx={ox + 42} cy={y0 + 114 + r * 50} r={14} fill={col("right").fill} /><rect x={ox + 70} y={y0 + 106 + r * 50} width={120} height={16} rx={8} fill={T.line} /></g>)}</g>;
                }
                const tx = X0 + 590 + k * 54, ox = lerp(X0 + 520, tx, e), oy = y0 + 112 - 18 * Math.sin(Math.min(1, e) * 3.14) + (k % 2) * 8;
                return <g key={k} opacity={O(f, t, 3)}><Sheet x={ox} y={oy} w={118} h={150} rot={(k % 2 ? 7 : -6) + k} lines={4} accent={col("wrong").fill} /></g>;
              })}
            </Full>
          </React.Fragment>
        );
      })}
      {q.mid && f >= tMid ? <div data-ov="中間標籤" style={{ position: "absolute", left: X0, width: IW, top: TOP + LH + 10, display: "flex", justifyContent: "center", ...bounce(f, tMid) }}><Chip text={q.mid.text} bg={col(q.mid.color ?? "plum").fill} fg="#fff" px={44} side={col(q.mid.color ?? "plum").side} /></div> : null}
    </>
  );
};

// ───────── paper：一張紙逐行被寫出來，蓋章、釘住，再交給 AI ─────────
const PaperView: React.FC<VP> = ({ f, p }) => {
  const q = p.p as any, A = (s: any, fb: number) => p.at(s, fb), lines = q.lines as { t: string; at: any; dur?: number; label?: string; color?: string; mark?: any[] }[];
  const bot = q.bot, cw = bot ? 640 : IW, fs = q.fs ?? 40, chH = q.h ?? 720, py = TOP + 10, tStamp = A(q.stamp?.at, FAR), tPin = A(q.pin?.at, FAR), tChip = A(q.chip?.at, FAR);
  const ats = lines.map((ln, i) => A(ln.at, p.in + 4 + i * 20)), cur = lines.findIndex((ln, i) => f >= ats[i] && f < ats[i] + (ln.dur ?? 26) + 4);
  const mini = E(f, tPin + 10, 18), bx = X0 + cw + (IW - cw) / 2, by = py + chH - 40;
  return (
    <>
      <div style={{ position: "absolute", left: X0, top: py, width: cw, height: chH, boxSizing: "border-box", padding: "46px 36px 24px", background: T.card, borderRadius: 28, boxShadow: `0 10px 0 ${col(q.color ?? "primary").side}`, ...riseIn(f, p.in + 1, 60) }}>
        {q.title ? <div style={{ ...zh, fontWeight: 900, fontSize: 40, color: col(q.color ?? "primary").text, marginBottom: 20 }}>{q.title}</div> : null}
        {lines.map((ln, i) => {
          const [a] = typed(ln.t, f, ats[i], ln.dur ?? 26), c = col(ln.color ?? "primary");
          const act = ((ln.mark ?? []) as any[]).map((m) => ({ i: ln.t.indexOf(m.word), n: m.word.length, c: col(m.color), on: f >= A(m.at, FAR) })).filter((m) => m.i >= 0 && m.on);
          return (
            <div key={i} data-ov={`紙行${i + 1}`} style={{ display: "flex", gap: 20, alignItems: "flex-start", marginBottom: 22, opacity: f >= ats[i] ? 1 : 0.15 }}>
              {q.num === false ? null : <div style={{ ...zh, flexShrink: 0, width: 56, height: 56, borderRadius: 28, background: c.fill, color: c.on, fontWeight: 900, fontSize: 34, display: "flex", alignItems: "center", justifyContent: "center", marginTop: 4, boxShadow: `0 4px 0 ${c.side}`, transform: cur === i ? `rotate(${(8 * Math.sin(f / 3)).toFixed(1)}deg)` : undefined }}>{ln.label ?? i + 1}</div>}
              <div style={{ ...zh, whiteSpace: "normal", fontWeight: 800, fontSize: fs, lineHeight: 1.32, color: T.ink }}>{[...ln.t].map((ch: string, k: number) => { const m = act.find((x) => k >= x.i && k < x.i + x.n); return <span key={k} style={{ opacity: k < a.length ? 1 : 0, background: m ? m.c.soft : undefined, boxShadow: m ? `inset 0 -8px 0 ${m.c.fill}` : undefined }}>{ch}</span>; })}</div>
            </div>
          );
        })}
      </div>
      {tPin < FAR ? <Full><g transform={`translate(0,${Math.round((1 - E(f, tPin, 8)) * -90)})`} opacity={f >= tPin ? 1 : 0}><circle cx={X0 + cw / 2} cy={py + 6} r={22} fill={col("wrong").fill} stroke={T.card} strokeWidth={5} /><circle cx={X0 + cw / 2 - 7} cy={py - 1} r={6} fill="#fff" opacity={0.7} /></g></Full> : null}
      {q.stamp && f >= tStamp ? <div data-ov={f >= tStamp + 8 ? "印章" : undefined} style={{ position: "absolute", left: bot ? X0 + cw - 30 : X0 + cw - (q.stamp.text.length * 64 + 100), top: bot ? py + 40 : py + chH - 130, ...slam(f, tStamp, -9, 2.6), border: `8px solid ${col(q.stamp.color ?? "wrong").fill}`, borderRadius: 18, padding: "6px 26px", ...zh, fontWeight: 900, fontSize: 64, color: col(q.stamp.color ?? "wrong").fill, background: "rgba(255,255,255,0.7)" }}>{q.stamp.text}</div> : null}
      {bot ? <Full><Bot x={bx} y={by} s={1.45} f={f} mood={f >= tPin + 22 ? "happy" : f >= tPin ? "read" : "idle"} />
        {f >= tPin + 10 ? <g opacity={O(f, tPin + 10, 4)}><Sheet x={lerp(X0 + cw - 150, bx - 130, mini)} y={lerp(py + 60, by - 190 - 30 * Math.sin(mini * 3.14), mini)} w={86} h={108} rot={lerp(-8, 8, mini)} lines={3} accent={col("note").fill} /></g> : null}</Full> : null}
      {bot && q.chip && f >= tChip ? <div data-ov="紙旁標籤" style={{ position: "absolute", left: X0 + cw + 10, width: IW - cw - 10, top: by + 36, display: "flex", justifyContent: "center", ...bounce(f, tChip) }}><Chip text={q.chip.text} bg={col(q.chip.color ?? "right").fill} fg="#fff" px={38} side={col(q.chip.color ?? "right").side} /></div> : null}
    </>
  );
};

// ───────── slots：同一張規則卡複製進三個槽口，之後每次新請求都先讀 ─────────
const SlotsView: React.FC<VP> = ({ f, p }) => {
  const q = p.p as any, A = (s: any, fb: number) => p.at(s, fb), sl = q.slots as { label: string; sub: string; color: string; at: any }[], tRead = A(q.readAt, FAR), tChip = A(q.chip?.at, FAR);
  const CW = 290, GAP = 41, my = 700, MH = 340, cx0 = X0 + IW / 2, cy0 = 520;
  return (
    <>
      <div data-ov="規則卡" style={{ position: "absolute", left: cx0 - 150, top: TOP, width: 300, height: 170, boxSizing: "border-box", background: col("note").soft, border: `6px solid ${col("note").fill}`, borderRadius: 24, padding: "14px 20px", ...riseIn(f, p.in + 2, 50) }}>
        <div style={{ ...zh, fontWeight: 900, fontSize: 46, color: T.ink }}>{q.card ?? "規則卡"}</div>
        <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 14 }}>{[0.9, 0.7, 0.5].map((w, i) => <div key={i} style={{ height: 12, width: `${w * 100}%`, borderRadius: 6, background: col("note").fill, opacity: 0.7 }} />)}</div>
      </div>
      <Full>{sl.map((_, i) => <path key={i} d={`M${cx0} ${TOP + 176} Q${cx0} ${my - 40} ${X0 + i * (CW + GAP) + CW / 2} ${my - 6}`} fill="none" stroke={col(sl[i].color).fill} strokeWidth={7} strokeLinecap="round" strokeDasharray="2 18" strokeDashoffset={-(f * 0.9) % 20} opacity={f >= A(sl[i].at, FAR) ? 0.7 : 0} />)}</Full>
      {sl.map((s, i) => {
        const x = X0 + i * (CW + GAP), c = col(s.color), t = A(s.at, p.in + 6 + i * 10), e = E(f, t, 16), r = E(f, tRead + i * 8, 12), lit = f >= t;
        return (
          <React.Fragment key={i}>
            <Panel2 x={x} y={my} w={CW} h={MH} color={s.color} ov={`槽口${i + 1}`} style={{ transform: f >= t && f < t + 14 ? `scale(${(1 + 0.05 * Math.sin((f - t) / 14 * 3.14)).toFixed(3)})` : undefined }}>
              <div style={{ position: "absolute", left: 0, right: 0, top: 218, textAlign: "center" }}><div style={{ ...zh, fontWeight: 900, fontSize: 44, color: T.ink }}>{s.label}</div><div style={{ ...zh, fontWeight: 700, fontSize: 30, color: lit ? c.text : T.ink3, marginTop: 6 }}>{s.sub}</div></div>
            </Panel2>
            <Full>
              <Bot x={x + CW / 2} y={my + 190} s={0.78} f={f} mood={f >= tRead + i * 8 + 10 ? "happy" : f >= tRead + i * 8 ? "read" : "idle"} c={s.color} />
              {f >= t ? <g opacity={O(f, t, 3)} transform={`translate(${lerp(cx0 - 38, x + CW - 70, e)},${lerp(cy0 - 70, my + 40, e) - 90 * Math.sin(e * 3.14)}) rotate(${lerp(0, 8, e)})`}><rect width={76} height={96} rx={12} fill={col("note").soft} stroke={col("note").fill} strokeWidth={5} /><path d="M14 30 H62 M14 50 H62 M14 70 H44" stroke={col("note").fill} strokeWidth={6} strokeLinecap="round" /></g> : null}
              {f >= tRead + i * 8 ? <><g transform={`translate(${x + CW / 2 - 44},${lerp(my - 130, my + 20, r)})`} opacity={1 - clamp((r - 0.7) * 3.3)}><Env x={0} y={0} w={88} /></g><Tick cx={x + 46} cy={my + 46} r={30} color="right" t={E(f, tRead + i * 8 + 10, 10)} /></> : null}
            </Full>
          </React.Fragment>
        );
      })}
      {q.chip && f >= tChip ? <div data-ov="槽口說明" style={{ position: "absolute", left: X0, width: IW, top: my + MH + 50, display: "flex", justifyContent: "center", ...bounce(f, tChip) }}><Chip text={q.chip.text} bg={col(q.chip.color ?? "right").fill} fg="#fff" px={44} side={col(q.chip.color ?? "right").side} /></div> : null}
    </>
  );
};

// ───────── scoreboard：計分牌＋星星＋每次得分 ─────────
const starPts = (cx: number, cy: number, r: number) => Array.from({ length: 10 }, (_, i) => { const a = -Math.PI / 2 + (i * Math.PI) / 5, rr = i % 2 ? r * 0.46 : r; return `${(cx + rr * Math.cos(a)).toFixed(1)},${(cy + rr * Math.sin(a)).toFixed(1)}`; }).join(" ");
const ScoreView: React.FC<VP> = ({ f, p }) => {
  const q = p.p as any, A = (s: any, fb: number) => p.at(s, fb), bs = q.boards as any[], BW = 460, BH = 640, y0 = TOP + 10, tRuns = A(q.runsAt, p.in + 6);
  return (
    <>
      {bs.map((b, i) => {
        const x = X0 + i * (BW + 32), c = col(b.color), tC = A(b.countAt, FAR), e = f >= tC ? tween(f, tC, 30, EASE.count) : 0, v = b.value * e, shown = b.dec ? v.toFixed(1) : String(Math.round(v)), full = b.value >= b.max && e >= 1;
        return (
          <React.Fragment key={i}>
            <Panel2 x={x} y={y0} w={BW} h={BH} color={b.color} ov={`計分牌${i + 1}`} style={{ ...riseIn(f, p.in + 2 + i * 4, 60), outline: full ? `8px solid ${c.fill}` : undefined, outlineOffset: 6 }}>
              <div style={{ position: "absolute", left: 0, right: 0, top: 22, display: "flex", justifyContent: "center" }}><Chip text={b.label} bg={c.fill} fg={c.on} px={44} side={c.side} /></div>
              <div style={{ position: "absolute", left: 0, right: 0, top: 120, display: "flex", justifyContent: "center", alignItems: "baseline", gap: 10, transform: full ? `scale(${(1 + 0.04 * Math.sin(f / 4)).toFixed(3)})` : undefined }}>
                <div style={{ ...zh, fontWeight: 900, fontSize: 190, lineHeight: 1, color: c.text }}>{shown}</div><div style={{ ...zh, fontWeight: 900, fontSize: 56, color: T.ink2 }}>分</div>
              </div>
              <div style={{ position: "absolute", left: 0, right: 0, top: 360, textAlign: "center", ...zh, fontWeight: 800, fontSize: 34, color: T.ink2 }}>各跑 5 次</div>
              <div style={{ position: "absolute", left: 0, right: 0, top: 416, display: "flex", justifyContent: "center", gap: 12 }}>
                {(b.runs as number[]).map((r, k) => { const t = tRuns + k * 4 + i * 2, ok = r >= 4; return <div key={k} style={{ width: 76, height: 76, borderRadius: 38, background: f >= t ? col(ok ? "right" : "wrong").fill : T.line, color: "#fff", ...zh, fontWeight: 900, fontSize: 44, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: f >= t ? `0 6px 0 ${col(ok ? "right" : "wrong").side}` : undefined, transform: `scale(${f >= t ? (0.5 + 0.5 * E(f, t, 8) + 0.12 * Math.sin(E(f, t, 8) * 3.14)).toFixed(3) : 0.6})`, opacity: f >= t ? 1 : 0.5 }}>{f >= t ? r : ""}</div>; })}
              </div>
            </Panel2>
            <Full>{Array.from({ length: 5 }, (_, k) => { const cx = x + 60 + k * 85, cy = y0 + 520, fr = clamp(v - k); return <g key={k}><clipPath id={`st${i}${k}`}><rect x={cx - 40} y={cy - 40} width={80 * fr} height={80} /></clipPath><polygon points={starPts(cx, cy, 38)} fill={T.line} stroke={T.cardSide} strokeWidth={3} strokeLinejoin="round" /><polygon points={starPts(cx, cy, 38)} fill={col("note").fill} stroke={col("note").side} strokeWidth={3} strokeLinejoin="round" clipPath={`url(#st${i}${k})`} transform={full ? `rotate(${(8 * Math.sin(f / 4 + k)).toFixed(1)} ${cx} ${cy})` : undefined} /></g>; })}</Full>
          </React.Fragment>
        );
      })}
      {q.note ? <div data-ov="計分說明" style={{ position: "absolute", left: X0, width: IW, top: y0 + BH + 50, textAlign: "center", ...zh, fontWeight: 800, fontSize: 34, color: T.ink2, opacity: O(f, p.in + 20, 8) }}>{q.note}</div> : null}
    </>
  );
};

// ───────── pack：AI 背包越塞越重 ─────────
const PackView: React.FC<VP> = ({ f, p }) => {
  const q = p.p as any, A = (s: any, fb: number) => p.at(s, fb), n = q.count as number, t0 = A(q.fromAt, p.in + 4), t1 = A(q.toAt, p.in + 60), tGlow = A(q.glowAt, FAR), tQ = A(q.q?.at, FAR);
  const step = (t1 - t0) / Math.max(1, n - 1), landed = Math.max(0, Math.min(n, Math.floor((f - t0 - 8) / step) + 1)), prog = clamp(landed / n), bx = 360, by = 1160, packTop = 900;
  return (
    <>
      <div data-ov="份數" style={{ position: "absolute", left: X0, top: TOP + 14, display: "flex", alignItems: "baseline", gap: 14, ...bounce(f, p.in + 2) }}>
        <div style={{ ...zh, fontWeight: 900, fontSize: 170, lineHeight: 1, color: col("wrong").text, minWidth: 190, textAlign: "right" }}>{landed}</div><div style={{ ...zh, fontWeight: 900, fontSize: 56, color: T.ink }}>份文件</div>
      </div>
      <Full>
        <path d={`M${bx + 56} ${by - 160} Q${bx + 150} ${by - 220} ${bx + 210} ${packTop + 20}`} fill="none" stroke={col("sky").side} strokeWidth={14} strokeLinecap="round" />
        <path d={`M${bx + 56} ${by - 60} Q${bx + 150} ${by - 40} ${bx + 210} ${by - 80}`} fill="none" stroke={col("sky").side} strokeWidth={14} strokeLinecap="round" />
        <rect x={bx + 190} y={packTop + 8} width={250} height={260} rx={44} fill={col("sky").side} /><rect x={bx + 190} y={packTop} width={250} height={260} rx={44} fill={col("sky").fill} />
        <rect x={bx + 224} y={packTop + 150} width={182} height={80} rx={22} fill={col("sky").soft} />
        {Array.from({ length: n }, (_, i) => { const t = t0 + i * step, e = E(f, t, 9); if (f < t) return null; const yy = packTop - 10 - i * 21, jx = ((i * 37) % 21) - 10; return <g key={i} opacity={O(f, t, 3)}><rect x={bx + 214 + jx} y={lerp(TOP + 20, yy, e)} width={200} height={26} rx={8} fill={T.card} stroke={T.line} strokeWidth={3} transform={`rotate(${((i % 5) - 2) * 1.6} ${bx + 314} ${yy})`} /></g>; })}
        <Bot x={bx} y={by} s={2.0} f={f} mood={prog > 0.3 ? "strain" : "idle"} />
      </Full>
      <div data-ov="規定便條" style={{ position: "absolute", left: X0 + 760, top: packTop + 20, width: 190, height: 170, boxSizing: "border-box", background: col("note").fill, borderRadius: 18, boxShadow: `0 8px 0 ${col("note").side}`, display: "flex", alignItems: "center", justifyContent: "center", transform: `rotate(5deg) scale(${f >= tGlow ? (1 + 0.05 * Math.sin((f - tGlow) / 3)).toFixed(3) : 1})`, outline: f >= tGlow ? `8px solid ${col("right").fill}` : undefined, outlineOffset: 6, ...zh, fontWeight: 900, fontSize: 60, color: T.ink }}>{q.note ?? "規定"}</div>
      {f >= tGlow ? <div data-ov="還記得標籤" style={{ position: "absolute", left: X0 + 730, top: packTop - 90, ...bounce(f, tGlow + 4) }}><Chip text="還記得" bg={col("right").fill} fg="#fff" px={44} side={col("right").side} /></div> : null}
      {q.q && f >= tQ ? <div data-ov="問題標籤" style={{ position: "absolute", left: X0, width: IW, top: 1150, display: "flex", justifyContent: "center", ...bounce(f, tQ) }}><Chip text={q.q.text} bg={col("plum").fill} fg="#fff" px={44} side={col("plum").side} /></div> : null}
    </>
  );
};

// ───────── volume：大箱子 對 小紙條（也能表現「長文濃縮成一張小卡」） ─────────
const VolumeView: React.FC<VP> = ({ f, p }) => {
  const q = p.p as any, A = (s: any, fb: number) => p.at(s, fb), B = q.big, S = q.small, bw = q.bigW ?? 470, sw = q.smallW ?? 230, sh = q.smallH ?? 200, base = TOP + 600;
  const tB = A(B.at, p.in + 2), tS = A(S.at, FAR), tA = A(q.arrow?.at, FAR), tE = A(q.end?.at, FAR), eS = E(f, tS, 14), bc = col(B.color ?? "wrong"), sc = col(S.color ?? "right"), n = B.n ?? 8;
  return (
    <>
      <Full>
        {Array.from({ length: n }, (_, i) => { const t = tB + i * 3, e = E(f, t, 10); if (f < t) return null; return <g key={i} opacity={O(f, t, 3)} transform={`translate(${(i % 2) * 8 + i * 5},${(-i * 11 + Math.round((1 - e) * -50) + 5 * Math.sin(f / 10 + i * 0.3)).toFixed(1)})`}><Sheet x={X0} y={base - 520} w={bw - 50} h={520} lines={i === n - 1 ? 7 : 0} accent={i === n - 1 ? bc.fill : undefined} fill={i === n - 1 ? T.card : (i % 2 ? T.line : T.card)} /></g>; })}
        {f >= tS ? <g opacity={O(f, tS, 4)} transform={`translate(0,${Math.round((1 - eS) * -160)})`}><rect x={X0 + IW - sw + 4} y={base - sh + 8} width={sw} height={sh} rx={16} fill={sc.side} /><rect x={X0 + IW - sw} y={base - sh} width={sw} height={sh} rx={16} fill={sc.soft} stroke={sc.fill} strokeWidth={6} />{S.text ? null : [0.7, 0.55, 0.4].map((w, i) => <rect key={i} x={X0 + IW - sw + 26} y={base - sh + 40 + i * 44} width={(sw - 52) * w} height={16} rx={8} fill={sc.fill} opacity={0.55} />)}</g> : null}
        {q.spin && f >= tA ? <g transform={`translate(${X0 + bw - 20},${base - 560}) rotate(${(f * 7) % 360})`} opacity={O(f, tA, 6)}><path d="M-34 0 A34 34 0 0 1 28 -20" fill="none" stroke={T.ink} strokeWidth={9} strokeLinecap="round" /><path d="M34 0 A34 34 0 0 1 -28 20" fill="none" stroke={T.ink} strokeWidth={9} strokeLinecap="round" /><path d="M20 -34 L30 -16 L10 -14 Z M-20 34 L-30 16 L-10 14 Z" fill={T.ink} /></g> : null}
        {q.arrow && f >= tA ? <g opacity={O(f, tA, 6)} transform={`translate(${X0 + bw + 20},${base - 250})`}><path d="M0 0 H100 M76 -26 L104 0 L76 26" fill="none" stroke={T.ink3} strokeWidth={10} strokeLinecap="round" strokeLinejoin="round" /></g> : null}
      </Full>
      {f >= tB ? <div data-ov="大箱標籤" style={{ position: "absolute", left: X0, top: base + 30, width: bw, ...riseIn(f, tB + 8, 30) }}><div style={{ ...zh, fontWeight: 900, fontSize: 52, color: bc.text }}>{B.label}</div><div style={{ ...zh, fontWeight: 700, fontSize: 34, color: T.ink2, marginTop: 6 }}>{B.sub}</div></div> : null}
      {f >= tS ? <div data-ov="小紙標籤" style={{ position: "absolute", left: X0 + IW - Math.max(sw, 330), width: Math.max(sw, 330), top: base + 30, textAlign: "right", opacity: O(f, tS + 6, 6) }}><div style={{ ...zh, fontWeight: 900, fontSize: 52, color: sc.text }}>{S.label}</div><div style={{ ...zh, fontWeight: 700, fontSize: 34, color: T.ink2, marginTop: 6 }}>{S.sub}</div></div> : null}
      {f >= tS && S.text ? <div data-ov="小紙字" style={{ position: "absolute", left: X0 + IW - sw + 14, top: base - sh + 6, width: sw - 28, height: sh - 12, display: "flex", alignItems: "center", opacity: O(f, tS + 8, 6), ...zh, whiteSpace: "normal", fontWeight: 900, fontSize: 40, lineHeight: 1.25, color: T.ink }}>{S.text}</div> : null}
      {q.arrow && f >= tA ? <div data-ov="箭頭字" style={{ position: "absolute", left: X0 + bw + 14, top: base - 330, width: 130, textAlign: "center", ...zh, fontWeight: 900, fontSize: 40, color: T.ink2, opacity: O(f, tA, 6) }}>{q.arrow.text}</div> : null}
      {q.end && f >= tE ? <div data-ov="結語標籤" style={{ position: "absolute", left: X0, width: IW, top: base + 150, display: "flex", justifyContent: "center", ...bounce(f, tE) }}><Chip text={q.end.text} bg={col(q.end.color ?? "plum").fill} fg="#fff" px={44} side={col(q.end.color ?? "plum").side} /></div> : null}
    </>
  );
};

// ───────── lostmid：一長排方塊，開頭結尾亮、中間暗 ─────────
const LostMidView: React.FC<VP> = ({ f, p }) => {
  const q = p.p as any, A = (s: any, fb: number) => p.at(s, fb), N = q.n as number, tG = A(q.growAt, p.in + 4), tW = A(q.wobbleAt, FAR), tM = A(q.midAt, FAR), BW = 56, GAP = (IW - N * BW) / (N - 1), by = TOP + 330;
  const cnt = Math.round(lerp(q.n0 ?? 5, N, E(f, tG - 6, 34))), amp = f >= tW ? 12 * E(f, tW, 20) : 0, mid0 = Math.floor(N * 0.3), mid1 = Math.ceil(N * 0.7), pm = E(f, tM, 14);
  const cxs = Array.from({ length: N }, (_, i) => X0 + i * (BW + GAP) + BW / 2), curve = cxs.map((x, i) => { const u = i / (N - 1), dip = 4 * u * (1 - u); return [x, TOP + 90 + dip * 170 * pm + amp * 0.9 * Math.sin(f / 3 + i * 1.7)] as [number, number]; });
  const path = curve.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`).join(" ");
  return (
    <>
      <Full>
        {f >= tG ? <path d={path} fill="none" stroke={col(f >= tM ? "wrong" : "primary").fill} strokeWidth={10} strokeLinecap="round" strokeLinejoin="round" opacity={O(f, tG, 10)} /> : null}
        {f >= tM ? <><rect x={cxs[mid0] - BW / 2 - 12} y={by - 20} width={cxs[mid1 - 1] - cxs[mid0] + BW + 24} height={200} rx={26} fill="none" stroke={col("wrong").fill} strokeWidth={8} strokeDasharray="22 14" opacity={pm} /></> : null}
        {Array.from({ length: N }, (_, i) => {
          const on = i < cnt, isMid = i >= mid0 && i < mid1, dim = f >= tM && isMid, c = col("primary"), jig = on ? amp * Math.sin(f / 2.6 + i * 1.9) : 0;
          return <g key={i} opacity={on ? 1 : 0} transform={`translate(0,${jig.toFixed(1)}) rotate(${(f >= tW ? (amp / 12) * 6 * Math.sin(f / 3.1 + i) : 0).toFixed(1)} ${cxs[i]} ${by + 80})`}><rect x={cxs[i] - BW / 2} y={by + 8} width={BW} height={160} rx={14} fill={dim ? T.cardSide : c.side} /><rect x={cxs[i] - BW / 2} y={by} width={BW} height={160} rx={14} fill={dim ? T.line : c.fill} stroke={dim ? T.cardSide : "none"} strokeWidth={3} /></g>;
        })}
        <path d={`M${X0} ${by + 230} H${X0 + IW - 20} M${X0 + IW - 48} ${by + 206} L${X0 + IW - 18} ${by + 230} L${X0 + IW - 48} ${by + 254}`} fill="none" stroke={T.ink3} strokeWidth={8} strokeLinecap="round" strokeLinejoin="round" opacity={O(f, tG, 8)} />
      </Full>
      <div data-ov="長度標籤" style={{ position: "absolute", left: X0, top: by + 280, ...bounce(f, tG) }}><Chip text={q.lenLabel ?? "輸入越長"} bg={col("primary").fill} fg="#fff" px={44} side={col("primary").side} /></div>
      {f >= tW ? <div data-ov="不穩標籤" style={{ position: "absolute", left: X0 + IW - 380, top: by + 280, ...bounce(f, tW) }}><Chip text={q.wobbleLabel ?? "越不穩"} bg={col("note").fill} fg={T.ink} px={44} side={col("note").side} /></div> : null}
      {f >= tM ? <div data-ov="中間最差" style={{ position: "absolute", left: X0, width: IW, top: by + 400, display: "flex", justifyContent: "center", ...bounce(f, tM + 6) }}><Chip text={q.midLabel ?? "放在中間，表現最差"} bg={col("wrong").fill} fg="#fff" px={46} side={col("wrong").side} /></div> : null}
      {f >= tM ? <div data-ov="開頭標籤" style={{ position: "absolute", left: X0, top: TOP + 4, opacity: O(f, tM, 6), ...zh, fontWeight: 900, fontSize: 40, color: col("right").text }}>開頭 表現好</div> : null}
      {f >= tM ? <div data-ov="結尾標籤" style={{ position: "absolute", left: X0 + IW - 270, top: TOP + 4, opacity: O(f, tM, 6), ...zh, fontWeight: 900, fontSize: 40, color: col("right").text }}>結尾 表現好</div> : null}
    </>
  );
};

// ───────── carry：舊桌子的便條搬到乾淨的新桌子 ─────────
const CarryView: React.FC<VP> = ({ f, p }) => {
  const q = p.p as any, A = (s: any, fb: number) => p.at(s, fb), tN = A(q.note?.at, p.in + 20), tT = A(q.ticks?.at, FAR), tOk = A(q.okAt, FAR), PW = 400, py = TOP + 20, PH = 600, rx = X0 + IW - PW, e = E(f, tN, 24), n = q.ticks?.n ?? 4;
  const nx = lerp(X0 + PW - 60, rx + 40, e), ny = lerp(py + 360, py + 330, e) - 190 * Math.sin(e * 3.14), done = e >= 1;
  return (
    <>
      <Panel2 x={X0} y={py} w={PW} h={PH} color="wrong" ov="舊桌面" style={riseIn(f, p.in + 1, 50)}><div style={{ position: "absolute", left: 0, right: 0, top: 18, display: "flex", justifyContent: "center" }}><Chip text={q.left.label} bg={col("wrong").fill} fg="#fff" px={40} side={col("wrong").side} /></div></Panel2>
      <Panel2 x={rx} y={py} w={PW} h={PH} color="right" ov="新桌面" style={riseIn(f, p.in + 4, 50)}><div style={{ position: "absolute", left: 0, right: 0, top: 18, display: "flex", justifyContent: "center" }}><Chip text={q.right.label} bg={col("right").fill} fg="#fff" px={40} side={col("right").side} /></div></Panel2>
      <Full>
        {Array.from({ length: q.left.n ?? 9 }, (_, i) => <Sheet key={i} x={X0 + 60 + ((i * 53) % 130)} y={py + 520 - 190 - i * 22} w={190} h={120} rot={((i * 7) % 11) - 5} lines={3} />)}
        <Bot x={X0 + PW / 2} y={py + PH - 24} s={1.1} f={f} mood={done ? "idle" : "strain"} />
        <path d={`M${X0 + PW + 30} ${py + 300} H${rx - 30} M${rx - 56} ${py + 276} L${rx - 28} ${py + 300} L${rx - 56} ${py + 324}`} fill="none" stroke={T.ink3} strokeWidth={9} strokeLinecap="round" strokeLinejoin="round" opacity={O(f, tN - 6, 8) * (1 - e * 0.6)} />
        <rect x={rx + 50} y={py + PH - 36} width={PW - 100} height={12} rx={6} fill={T.line} />
        <Bot x={rx + PW / 2 + (done ? 70 : 0)} y={py + PH - 36} s={1.1} f={f} mood={f >= tOk ? "happy" : done ? "read" : "idle"} c="right" />
        {f >= tN ? <g transform={`translate(${nx},${ny}) rotate(${lerp(-10, 6, e)})`}><rect width={150} height={110} rx={14} fill={col("note").soft} stroke={col("note").fill} strokeWidth={6} /><path d="M20 36 H130 M20 60 H130 M20 84 H96" stroke={col("note").fill} strokeWidth={8} strokeLinecap="round" /></g> : null}
        {Array.from({ length: n }, (_, i) => <Tick key={i} cx={X0 + IW / 2 - ((n - 1) * 90) / 2 - 150 + i * 90} cy={py + PH + 100} r={36} color="right" t={f >= tT + i * 8 ? E(f, tT + i * 8, 10) : 0} />)}
      </Full>
      {q.ticks && f >= tT ? <div data-ov="守住標籤" style={{ position: "absolute", left: X0 + IW / 2 + 40, top: py + PH + 66, ...bounce(f, tT + n * 8) }}><Chip text={q.ticks.text} bg={col("right").fill} fg="#fff" px={46} side={col("right").side} /></div> : null}
    </>
  );
};

// ───────── balance：天平，A 很重、B 很輕，中間「≠」 ─────────
const BalanceView: React.FC<VP> = ({ f, p }) => {
  const q = p.p as any, A = (s: any, fb: number) => p.at(s, fb), tL = A(q.left.at, p.in + 4), tR = A(q.right.at, FAR), tQ = A(q.q?.at, FAR), tNe = A(q.mid?.at, tR);
  const px = X0 + IW / 2, py = TOP + 190, HL = 330, th = -(q.tilt ?? 10) * E(f, tL + 6, 22) * (1 + 0.04 * Math.sin(f / 7)) + 1.8 * Math.sin(f / 9), rad = (th * Math.PI) / 180;
  const ends = [[px - HL * Math.cos(rad), py - HL * Math.sin(rad)], [px + HL * Math.cos(rad), py + HL * Math.sin(rad)]], blk = [q.left, q.right], ts = [tL, tR];
  return (
    <>
      <Full>
        <path d={`M${px - 150} ${TOP + 700} L${px - 40} ${py + 20} H${px + 40} L${px + 150} ${TOP + 700} Z`} fill={T.cardSide} /><rect x={px - 200} y={TOP + 690} width={400} height={30} rx={15} fill={T.ink3} />
        <g transform={`rotate(${th.toFixed(2)} ${px} ${py})`}><rect x={px - HL - 20} y={py - 16} width={2 * HL + 40} height={32} rx={16} fill={T.ink} /></g>
        <circle cx={px} cy={py} r={26} fill={col("note").fill} stroke={T.ink} strokeWidth={6} />
        {ends.map(([ex, ey], i) => { const c = col(blk[i].color), t = ts[i], e = E(f, t, 16), py2 = ey + 190; return (
          <g key={i}>
            <path d={`M${ex} ${ey} L${ex - 110} ${py2} M${ex} ${ey} L${ex + 110} ${py2}`} stroke={T.ink3} strokeWidth={6} strokeLinecap="round" /><rect x={ex - 130} y={py2 - 6} width={260} height={30} rx={15} fill={T.ink2} />
            {f >= t ? <g opacity={O(f, t, 3)} transform={`translate(0,${Math.round((1 - e) * -260)})`}><rect x={ex - 95 + 5} y={py2 - 150 + 8} width={190} height={146} rx={24} fill={c.side} /><rect x={ex - 95} y={py2 - 150} width={190} height={146} rx={24} fill={blk[i].light ? c.soft : c.fill} stroke={blk[i].light ? c.fill : "none"} strokeWidth={6} /></g> : null}
          </g>); })}
      </Full>
      {ends.map(([ex, ey], i) => f >= ts[i] ? <div key={i} data-ov={f >= ts[i] + 18 ? `天平字${i + 1}` : undefined} style={{ position: "absolute", left: ex - 95, top: ey + 190 - 150 + Math.round((1 - E(f, ts[i], 16)) * -260), width: 190, height: 146, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", opacity: O(f, ts[i], 3), ...zh, fontWeight: 900, fontSize: 62, color: blk[i].light ? col(blk[i].color).text : col(blk[i].color).on }}>{blk[i].label}</div> : null)}
      {f >= tNe ? <div data-ov="不等於" style={{ position: "absolute", left: px - 90, top: TOP - 14, width: 180, textAlign: "center", ...slam(f, tNe, 0, 2.4), ...zh, fontWeight: 900, fontSize: 150, lineHeight: 1, color: col("wrong").fill }}>≠</div> : null}
      {q.q && f >= tQ ? <div data-ov="天平問句" style={{ position: "absolute", left: X0, width: IW, top: TOP + 725, display: "flex", justifyContent: "center", ...bounce(f, tQ) }}><Chip text={q.q.text} bg={col("plum").fill} fg="#fff" px={46} side={col("plum").side} /></div> : null}
    </>
  );
};

// ───────── board：黑板，AI 與「你」輪流寫字，紅筆圈錯 ─────────
const BoardView: React.FC<VP> = ({ f, p }) => {
  const q = p.p as any, A = (s: any, fb: number) => p.at(s, fb), lines = q.lines as any[], FS = q.fs ?? 52, RH = Math.round(FS * 1.36), TX = X0 + 190, bx0 = X0, by0 = TOP + 6, BH = q.h ?? 720;
  let acc = by0 + 34; const tops = lines.map((ln) => { const y = acc; acc += ln.rows.length * RH + (ln.note ? 78 : 0) + 34; return y; });
  return (
    <>
      <Full>
        <rect x={bx0} y={by0 + 10} width={IW} height={BH} rx={30} fill={T.ink3} /><rect x={bx0} y={by0} width={IW} height={BH} rx={30} fill={T.ink} /><rect x={bx0 + 60} y={by0 + BH - 4} width={IW - 120} height={22} rx={11} fill={T.cardSide} />
        {(q.marks ?? []).map((m: any, i: number) => { const t = A(m.at, FAR); if (f < t) return null; const ln = lines[m.line], x = TX + m.c0 * FS - 10, y = tops[m.line] + m.row * RH + 2, w = (m.c1 - m.c0) * FS + 20, d = E(f, t, 14), pul = 1 + 0.02 * Math.sin((f - t) / 4); return <rect key={i} x={x} y={y} width={w} height={RH - 4} rx={22} fill="none" stroke={col(m.color ?? "wrong").fill} strokeWidth={8} strokeLinecap="round" pathLength={1} strokeDasharray="1" strokeDashoffset={1 - d} transform={`translate(${x + w / 2},${y + RH / 2}) scale(${pul}) translate(${-x - w / 2},${-y - RH / 2})`} opacity={ln ? 1 : 0} />; })}
      </Full>
      {lines.map((ln, i) => {
        const t = A(ln.at, p.in + 4 + i * 30), dur = ln.dur ?? 40, dimT = A(ln.dimAt, FAR), c = col(ln.color ?? "primary"), who = ln.who === "ai", chars = ln.rows.join("").length, n = Math.floor(clamp((f - t) / dur) * chars);
        let used = 0; const op = (f >= t ? 1 : (ln.pre ? 1 : 0)) * (f >= dimT ? 1 - 0.65 * E(f, dimT, 10) : 1), tn = ln.pre ? chars : n, tt = A(ln.note?.at, FAR);
        return (
          <React.Fragment key={i}>
            <div data-ov={`黑板行${i + 1}`} style={{ position: "absolute", left: bx0 + 36, top: tops[i], width: 130, height: 154, opacity: op }}>
              <svg width={130} height={154} viewBox="-80 -170 160 190">{who ? <Bot x={0} y={0} s={0.8} f={f} mood={f >= t && f < t + dur ? "read" : "idle"} /> : <><circle cx={0} cy={-70} r={62} fill={col("note").fill} /><text x={0} y={-48} textAnchor="middle" fontFamily={FONT_ZH} fontWeight={900} fontSize={70} fill={T.ink}>你</text></>}</svg>
            </div>
            {ln.rows.map((row: string, r: number) => { const a = Math.max(0, Math.min(row.length, tn - used)); used += row.length; return <div key={r} data-ov={r === 0 ? `黑板字${i + 1}` : undefined} style={{ position: "absolute", left: TX, top: tops[i] + r * RH, ...zh, fontWeight: 800, fontSize: FS, color: ln.color ? c.soft : T.card, opacity: op }}><span>{row.slice(0, a)}</span><span style={{ opacity: 0 }}>{row.slice(a)}</span></div>; })}
            {ln.note && f >= tt ? <div data-ov={`黑板註${i + 1}`} style={{ position: "absolute", left: TX, top: tops[i] + ln.rows.length * RH + 6, ...bounce(f, tt) }}><Chip text={ln.note.text} bg={col(ln.note.color ?? "wrong").fill} fg="#fff" px={38} side={col(ln.note.color ?? "wrong").side} /></div> : null}
          </React.Fragment>
        );
      })}
    </>
  );
};

// ───────── compound：單利 對 複利 的年度長條（利息再生利息） ─────────
const CompoundView: React.FC<VP> = ({ f, p }) => {
  const q = p.p as any, A = (s: any, fb: number) => p.at(s, fb), Y = q.years ?? 8, r = q.rate ?? 0.2, P0 = 100, tS = A(q.single.at, p.in + 4), tC = A(q.comp.at, FAR), tH = A(q.hit?.at, FAR), tT = A(q.ticks?.at, FAR);
  const base = TOP + 650, MH = 460, mx = P0 * Math.pow(1 + r, Y), k = MH / mx, gw = IW / Y, bw = 46;
  const seg = (x: number, parts: [number, string][], g: number) => { let y = base; return parts.map(([v, c], i) => { const h = v * k * g; y -= h; return h > 0.5 ? <rect key={i} x={x} y={y} width={bw} height={h} rx={i === parts.length - 1 ? 10 : 0} fill={col(c).fill} stroke={T.card} strokeWidth={2} /> : null; }); };
  const gC = E(f, tC, 40), top8 = base - mx * k * gC, extra8 = (mx - P0 - Y * P0 * r) * k * gC;
  return (
    <>
      <div data-ov="圖例單利" style={{ position: "absolute", left: X0, top: TOP, ...bounce(f, tS) }}><Chip text={q.single.label} bg={col("note").fill} fg={T.ink} px={38} side={col("note").side} /></div>
      {q.comp ? <div data-ov="圖例複利" style={{ position: "absolute", left: X0 + 370, top: TOP, ...bounce(f, tC) }}><Chip text={q.comp.label} bg={col("wrong").fill} fg="#fff" px={38} side={col("wrong").side} /></div> : null}
      <Full>
        <rect x={X0 - 6} y={base + 4} width={IW + 12} height={10} rx={5} fill={T.ink3} opacity={0.6} />
        <clipPath id="cpclip"><rect x={X0} y={base - MH - 40} width={IW} height={MH + 40} /></clipPath>
        <rect x={X0 + ((f * 9) % (IW + 300)) - 150} y={base - MH - 40} width={110} height={MH + 40} fill="#fff" opacity={0.38} clipPath="url(#cpclip)" transform={`skewX(-12)`} />
        <g transform={`translate(${X0 + IW - 50},${TOP + 40 + 12 * Math.sin(f / 8)})`}><circle r={30} fill={col("note").fill} stroke={col("note").side} strokeWidth={6} /><path d="M-10 -4 H10 M-10 8 H10 M0 -16 V18" stroke={col("note").side} strokeWidth={5} strokeLinecap="round" transform={`scale(${(0.8 + 0.2 * Math.cos(f / 8)).toFixed(2)} 1)`} /></g>
        {Array.from({ length: Y }, (_, i) => {
          const n = i + 1, gx = X0 + i * gw + (gw - 2 * bw - 8) / 2, gS = E(f, tS + i * 4, 18), simple = n * P0 * r, comp = P0 * Math.pow(1 + r, n);
          return <g key={i}>{seg(gx, [[P0, "primary"], [simple, "note"]], gS)}{f >= tC ? seg(gx + bw + 8, [[P0, "primary"], [simple, "note"], [comp - P0 - simple, "wrong"]], E(f, tC + i * 4, 18)) : null}</g>;
        })}
        {f >= tH ? <ellipse cx={X0 + (Y - 1) * gw + (gw - 2 * bw - 8) / 2 + bw + 8 + bw / 2} cy={top8 + extra8 / 2} rx={bw / 2 + 24} ry={extra8 / 2 + 22} fill="none" stroke={T.ink} strokeWidth={8} strokeLinecap="round" pathLength={1} strokeDasharray="1" strokeDashoffset={1 - E(f, tH + 4, 14)} /> : null}
        {Array.from({ length: n3(q.ticks) }, (_, i) => <Tick key={i} cx={X0 + IW / 2 - 300 + i * 90} cy={base + 130} r={34} color="right" t={f >= tT + i * 8 ? E(f, tT + i * 8, 10) : 0} />)}
      </Full>
      {Array.from({ length: Y }, (_, i) => <div key={i} style={{ position: "absolute", left: X0 + i * gw, top: base + 22, width: gw, textAlign: "center", ...zh, fontWeight: 800, fontSize: 32, color: T.ink2 }}>{i + 1}</div>)}
      <div data-ov="示意說明" style={{ position: "absolute", left: X0, top: TOP + 84, ...zh, fontWeight: 700, fontSize: 30, color: T.ink3 }}>{q.note}</div>
      {q.hit && f >= tH ? <div data-ov="紅筆標註" style={{ position: "absolute", left: X0 + 480, width: IW - 480, top: TOP + 82, display: "flex", justifyContent: "flex-end", ...bounce(f, tH) }}><Chip text={q.hit.text} bg={col("wrong").fill} fg="#fff" px={40} side={col("wrong").side} /></div> : null}
      {q.ticks && f >= tT ? <div data-ov="次數標籤" style={{ position: "absolute", left: X0 + IW / 2 - 50, top: base + 96, ...bounce(f, tT + 24) }}><Chip text={q.ticks.text} bg={col("right").fill} fg="#fff" px={42} side={col("right").side} /></div> : null}
    </>
  );
};
const n3 = (t: any) => (t?.n ?? 0) as number;

export const META_VIEWS: Record<string, React.FC<VP>> = { belts: BeltsView, paper: PaperView, slots: SlotsView, scoreboard: ScoreView, pack: PackView, volume: VolumeView, lostmid: LostMidView, carry: CarryView, balance: BalanceView, board: BoardView, compound: CompoundView };

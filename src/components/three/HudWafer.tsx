// 2026/11/18 tech-waferflow：晶圓流程的 2D 示意卡（overlay `section` 的 kind 以 "wf-" 開頭，Hud.tsx 的 HudSection 轉過來）。
//   wf-ring 開場「同一套動作、重複數十次」的問號環｜wf-sec 剖面圖＋步驟清單（每一步在剖面上真的發生變化，與 3D 同一份 cue）
//   wf-count 疊層計數（一輪一層、重複）｜wf-who 誰做哪一步（公司＋狀態）｜wf-next 下一支預告（蝕刻）
// 全部示意；顏色讀 model.json 的 palette；時間全部來自 script.json 的 t（cue）。
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
    {o.tag ? <div style={{ position: "absolute", right: 16, top: 14, ...zh(sm(30), H.text2, 600), zIndex: 2 }}>{o.tag}</div> : null}
    {children}
  </div>
);
const ph = (f: number, sp: number, j: number, n: number, seed = 0) => (((f * sp + j / n + seed * 0.17) % 1) + 1) % 1;
const hex = (s: string) => [parseInt(s.slice(1, 3), 16), parseInt(s.slice(3, 5), 16), parseInt(s.slice(5, 7), 16)];
const mix2 = (a: string, b: string, t: number) => { const A = hex(a), B = hex(b); return `rgb(${A.map((v, i) => Math.round(v + (B[i] - v) * t)).join(",")})`; };
const STEPS = ["沉積", "塗光阻", "曝光", "顯影", "蝕刻", "去光阻", "離子佈植", "研磨"];

// ── wf-ring：開場問號環 ──
const Ring: React.FC<P> = ({ o, f, k, m }) => {
  const W = o.w ?? 952, Hh = o.h ?? 300, c = (n: string) => col(m.product, n);
  const same = T(o, "same"), rep = T(o, "rep"), which = T(o, "which");
  const bw = 124, gp = 34, x0 = 36, y0 = 92, bh = 92;
  const lp = tween(f, rep, 16, EASE.move), wq = tween(f, which, 12, EASE.enter), pul = 1 + 0.07 * Math.sin(f * 0.3) * wq;
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        {Array.from({ length: 6 }, (_, i) => { const x = x0 + i * (bw + gp), a = tween(f, same + i * 5, 8, EASE.enter);
          return <g key={i} opacity={a}>
            <rect x={x} y={y0} width={bw} height={bh} fill={H.cardCompare} stroke={wq > 0.5 ? H.amber : H.text3} strokeWidth={wq > 0.5 ? 5 : 3} />
            <text x={x + bw / 2} y={y0 + 66} textAnchor="middle" style={zh(60 * pul, wq > 0.5 ? H.amber : H.text2, 900)}>？</text>
            {i < 5 ? <path d={`M${x + bw + 4} ${y0 + 46} h${gp - 10} m-10 -9 l10 9 l-10 9`} stroke={H.text3} strokeWidth={4} fill="none" /> : null}
          </g>; })}
        {(() => { const xa = x0 + 5 * (bw + gp) + bw / 2, xb = x0 + bw / 2, yy = y0 + bh + 58;
          return <g opacity={lp}><path d={`M${xa} ${y0 + bh + 6} V${yy} H${xb} V${y0 + bh + 8}`} stroke={c("lp_proc")} strokeWidth={6} fill="none" />
            {[0, 1, 2].map((j) => { const u = ph(f, 0.012, j, 3), d = u * (2 * 52 + (xa - xb)); let px = xa, py = y0 + bh + 6 + d;
              if (d > 52 && d <= 52 + (xa - xb)) { px = xa - (d - 52); py = yy; } else if (d > 52 + (xa - xb)) { px = xb; py = yy - (d - 52 - (xa - xb)); }
              return <circle key={j} cx={px} cy={py} r={7} fill={c("lp_proc")} />; })}
            <text x={(xa + xb) / 2} y={yy + 40} textAnchor="middle" style={zh(40, c("lp_proc"), 900)}>一輪做一層，重複數十次</text></g>; })()}
      </svg>
    </Card>
  );
};

// ── wf-sec：剖面圖＋步驟 ──
const Sec: React.FC<P> = ({ o, f, k, m }) => {
  const W = o.w ?? 952, Hh = o.h ?? 300, c = (n: string) => col(m.product, n);
  const t = (n: string) => T(o, n);
  const X0 = 30, U = 42, base = 246, hS = 44, hO = 20, hM = 18, hR = 24;
  const LN = Array.from({ length: 7 }, (_, i) => X0 + i * 1.8 * U), GP = Array.from({ length: 6 }, (_, i) => X0 + 1.0 * U + i * 1.8 * U);
  const wL = 1.0 * U, wG = 0.8 * U;
  const yO = base - hO, yM = yO - hM, yR = yM - hR;
  const gO = tween(f, t("ox"), 10, EASE.move), gM = tween(f, t("mt"), 10, EASE.move), gR = tween(f, t("res"), 12, EASE.move);
  const mask = tween(f, t("msk"), 10, EASE.enter) * (1 - tween(f, t("dev"), 8, EASE.enter)), light = tween(f, t("lt"), 8, EASE.enter) * (1 - tween(f, t("dev"), 8, EASE.enter));
  const struck = tween(f, t("prt"), 10, EASE.enter), wash = tween(f, t("wash"), 14, EASE.move), cut = tween(f, t("cut"), 14, EASE.move), strip = tween(f, t("strip"), 14, EASE.move);
  const devF = tween(f, t("dev"), 6, EASE.enter) * (1 - wash), plF = tween(f, t("pl"), 6, EASE.enter) * (1 - cut), strF = tween(f, t("use"), 6, EASE.enter) * (1 - strip);
  const ionA = tween(f, t("ion"), 8, EASE.enter) * (1 - tween(f, t("pol") - 6, 8, EASE.enter)), dope = tween(f, t("ion") + 16, 14, EASE.move);
  const fillG = tween(f, t("pol"), 14, EASE.move), flat = tween(f, t("pol") + 14, 40, EASE.move), pads = tween(f, t("pol") + 10, 8, EASE.enter);
  const st = [t("dep"), t("res"), t("lt"), t("dev"), t("bare"), t("use"), t("ion"), t("pol")];
  let act = -1; st.forEach((s, i) => { if (f >= s) act = i; });
  const done = tween(f, t("next"), 10, EASE.enter);
  const resist = c("resist"), resistL = mix2(c("resist"), "#FFD2FF", 0.65), oxide = c("oxide"), metal = c("metalL"), si = c("silicon");
  const bump = (x: number) => { const cx = (x - X0 - wL / 2) / (1.8 * U); const q = cx - Math.round(cx); return Math.max(0, Math.cos(q * Math.PI * 1.0)) ** 3; };
  const fillTop = (x: number) => yM - 2 - 12 * (1 - flat) * bump(x) * (1 - 0) ;
  const pts: string[] = []; for (let x = X0; x <= X0 + 11.8 * U; x += 6) pts.push(`${x},${fillTop(x)}`);
  const fillPath = `M${X0},${yO} L${pts.join(" L")} L${X0 + 11.8 * U},${yO} Z`;
  const padX = X0 + 40 + (Math.sin(f * 0.07) * 0.5 + 0.5) * (11.8 * U - 200);
  const Lbl = (x: number, y: number, s: string, a: number, cl: string) => <text x={x} y={y} opacity={a} style={zh(sm(30), cl, 800)}>{s}</text>;
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        {/* 光罩與光線 */}
        <g opacity={mask}>
          <rect x={X0 - 10} y={92} width={11.8 * U + 20} height={8} fill={c("reticleG")} />
          {LN.map((x, i) => <rect key={i} x={x} y={82} width={wL} height={12} fill={c("chrome")} />)}
          {Lbl(X0 + 11.8 * U - 6, 76, "光罩", mask, H.text2)}
        </g>
        {light > 0 ? GP.map((x, i) => <g key={i} opacity={light}><rect x={x} y={100} width={wG} height={yR - 100} fill={c("beamL")} opacity={0.35} />
          {[0, 1, 2].map((j) => <circle key={j} cx={x + wG / 2} cy={100 + ((f * 3 + j * 40) % (yR - 100))} r={5} fill={c("lp_light")} />)}</g>) : null}
        {/* 基板與摻雜 */}
        <rect x={X0} y={base} width={11.8 * U} height={hS} fill={si} />
        <text x={X0 + 8} y={base + 34} style={zh(sm(30), H.onAccent, 800)}>矽基板</text>
        {GP.map((x, i) => <rect key={i} x={x} y={base} width={wG} height={16} fill={c("dope")} opacity={dope} />)}
        {/* 氧化層 */}
        <rect x={X0} y={base - hO * gO} width={11.8 * U} height={hO * gO} fill={oxide} />
        {/* 金屬：線＋縫（縫被蝕刻掉） */}
        {LN.map((x, i) => <rect key={i} x={x} y={yO - hM * gM} width={wL} height={hM * gM} fill={metal} />)}
        {GP.map((x, i) => <rect key={i} x={x} y={yO - hM * gM} width={wG} height={hM * gM} fill={metal} opacity={1 - cut} />)}
        {/* 光阻：線＋縫（縫曝光後變色、顯影後被洗掉） */}
        {LN.map((x, i) => <rect key={i} x={x} y={yM - hR * gR} width={wL} height={hR * gR} fill={resist} opacity={1 - strip} />)}
        {GP.map((x, i) => <rect key={i} x={x} y={yM - hR * gR} width={wG} height={hR * gR} fill={mix2(resist, resistL, struck)} opacity={1 - wash} />)}
        {/* 顯影藥水／電漿離子／去光阻藥水／離子束 */}
        {devF > 0.02 ? GP.map((x, i) => [0, 1, 2].map((j) => <circle key={`${i}${j}`} cx={x + wG / 2} cy={106 + ph(f, 0.02, j, 3, i) * (yM - 106)} r={5} fill={c("waterB")} opacity={devF} />)) : null}
        {plF > 0.02 ? <g opacity={plF}><rect x={X0} y={94} width={11.8 * U} height={10} fill={c("lp_ion")} opacity={0.5} />
          {GP.map((x, i) => [0, 1, 2].map((j) => <circle key={`${i}${j}`} cx={x + wG / 2} cy={106 + ph(f, 0.03, j, 3, i) * (yM - 106)} r={5.5} fill={c("lp_ion")} />))}
          {LN.map((x, i) => [0, 1].map((j) => <circle key={`l${i}${j}`} cx={x + wL / 2} cy={106 + ph(f, 0.03, j, 2, i + 3) * (yR - 8 - 106)} r={4.5} fill={c("lp_ion")} opacity={0.5} />))}</g> : null}
        {strF > 0.02 ? LN.map((x, i) => [0, 1, 2].map((j) => <circle key={`${i}${j}`} cx={x + wL * (0.2 + 0.3 * j)} cy={106 + ph(f, 0.02, j, 3, i) * (yR - 106)} r={5} fill={c("lp_proc")} opacity={strF} />)) : null}
        {ionA > 0.02 ? <g opacity={ionA}>{GP.map((x, i) => [0, 1, 2].map((j) => <circle key={`${i}${j}`} cx={x + wG / 2} cy={106 + ph(f, 0.03, j, 3, i) * (base + 12 - 106)} r={5.5} fill={c("lp_ion")} />))}
          {LN.map((x, i) => [0, 1].map((j) => <circle key={`l${i}${j}`} cx={x + wL / 2} cy={106 + ph(f, 0.03, j, 2, i + 3) * (yM - 106)} r={4.5} fill={c("lp_ion")} opacity={0.5} />))}</g> : null}
        {/* CMP：新鋪的氧化層凹凸不平，研磨墊壓過去磨平 */}
        {fillG > 0 ? <path d={fillPath} fill={oxide} opacity={fillG} stroke={mix2(oxide, "#FFFFFF", 0.4)} strokeWidth={2} /> : null}
        {pads > 0 ? <g opacity={pads}><rect x={padX} y={yM - 2 - 34 + 12 * flat} width={200} height={20} fill={c("pad")} /><rect x={padX} y={yM - 2 - 14 + 12 * flat} width={200} height={5} fill={c("diamond")} />
          <path d={`M${padX + 20} ${yM - 56 + 12 * flat} h160 m-14 -10 l14 10 l-14 10`} stroke={c("lp_proc")} strokeWidth={4} fill="none" /></g> : null}
        {/* 標名 */}
        {Lbl(X0 + 5.5 * U, base - 2 - 0, "", 0, H.text)}
        {Lbl(X0 + 12.1 * U, yO + 11, "氧化層", gO, c("lp_ox"))}
        {Lbl(X0 + 12.1 * U, yM + 11, "金屬層", gM * (1 - 0), c("lp_mt"))}
        {Lbl(X0 + 12.1 * U, yR + 14, "光阻", gR * (1 - strip), c("lp_res"))}
        {/* 步驟清單（兩欄） */}
        {STEPS.map((s, i) => { const col2 = i < 4 ? 0 : 1, row = i % 4, x = 655 + col2 * 150, y = 104 + row * 52; const on = i === act, past = i < act;
          return <g key={i} opacity={f >= st[i] - 6 ? 1 : 0.28}>
            <rect x={x - 6} y={y - 32} width={142} height={42} fill={on ? H.amber : "none"} stroke={on ? H.amber : "none"} />
            <text x={x} y={y} style={zh(29, on ? onC(H.amber) : past ? c("lp_good") : H.text, 800)}>{past ? "✓" : "①②③④⑤⑥⑦⑧"[i]}{s}</text></g>; })}
      </svg>
    </Card>
  );
};

// ── wf-count：疊層計數 ──
const Count: React.FC<P> = ({ o, f, k, m }) => {
  const W = o.w ?? 952, Hh = o.h ?? 300, c = (n: string) => col(m.product, n);
  const one = T(o, "one"), rep = T(o, "rep"), hund = T(o, "hund"), N = (o as any).n ?? 12, stag = (o as any).stag ?? 9;
  const n = f < rep ? (f >= one ? 1 : 0) : Math.min(N, 1 + Math.floor((f - rep) / stag + 1));
  const a = tween(f, one, 8, EASE.enter), b = tween(f, rep, 10, EASE.enter), h = tween(f, hund, 10, EASE.enter);
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        <text x={40} y={170} opacity={a} style={zh(150, c("lp_proc"), 900)}>{n}</text>
        <text x={n >= 10 ? 270 : 190} y={170} opacity={a} style={zh(54, H.text, 900)}>層</text>
        <text x={40} y={226} opacity={a} style={zh(sm(32), H.text2, 800)}>一輪＝沉積→曝光→蝕刻→磨平</text>
        {Array.from({ length: N }, (_, i) => <rect key={i} x={430 + i * 38} y={118 - i * 4} width={30} height={16 + i * 4} fill={i < n ? (i % 2 ? c("lp_mt") : c("lp_ox")) : H.lineSoft} opacity={i < n ? 1 : 0.4} />)}
        <text x={430} y={186} opacity={b} style={zh(40, H.text, 900)}>重複數十次</text>
        <text x={430} y={232} opacity={h} style={zh(40, c("lp_proc"), 900)}>先進晶片：上百道光罩層</text>
        <text x={430} y={272} opacity={h} style={zh(sm(30), H.text2, 700)}>約 80～120 層・產業估計</text>
      </svg>
    </Card>
  );
};

// ── wf-who：誰做哪一步 ──
const Who: React.FC<P> = ({ o, f, k, m }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330, c = (n: string) => col(m.product, n);
  const rows: [string, string, string, string][] = [["曝光機", "艾司摩爾", "asml", "公司公布"], ["蝕刻機", "科林研發", "lam", "公司公布"], ["光罩盒", "家登", "gd", "媒體報導"], ["去光阻藥水", "三福化", "sf", "媒體報導"], ["研磨墊修整碟", "中砂", "kn", "媒體報導"]];
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        {rows.map(([what, who, key, tag], i) => { const a = tween(f, T(o, key), 8, EASE.enter), y = 96 + i * 46, tw = i < 2;
          return <g key={i} opacity={a}>
            <text x={30} y={y} style={zh(34, H.text2, 800)}>{what}</text>
            <text x={330} y={y} style={zh(40, H.text, 900)}>{who}</text>
            <rect x={640} y={y - 32} width={150} height={40} fill={tw ? c("lp_good") : H.amber} />
            <text x={715} y={y - 2} textAnchor="middle" style={zh(sm(30), tw ? H.onAccent : onC(H.amber), 800)}>{tag}</text>
            <text x={810} y={y} style={zh(sm(30), H.text2, 700)}>{i < 2 ? "國際" : "台灣"}</text></g>; })}
      </svg>
    </Card>
  );
};

// ── wf-next：下一支預告（蝕刻機） ──
const Next: React.FC<P> = ({ o, f, k, m }) => {
  const W = o.w ?? 952, Hh = o.h ?? 300, c = (n: string) => col(m.product, n);
  const tr = T(o, "tricks"), nx = T(o, "next"), hw = T(o, "how"), kw = T(o, "kw");
  const a = tween(f, tr, 10, EASE.enter), b = tween(f, nx, 10, EASE.enter), cI = tween(f, hw, 14, EASE.move), d = tween(f, kw, 10, EASE.enter);
  const X0 = 40, U = 40, base = 236;
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        <g opacity={a}>
          <rect x={X0} y={base} width={7 * U + 6 * 0.8 * U} height={30} fill={c("silicon")} />
          <rect x={X0} y={base - 14} width={7 * U + 6 * 0.8 * U} height={14} fill={c("oxide")} />
          {Array.from({ length: 7 }, (_, i) => <rect key={i} x={X0 + i * 1.8 * U} y={base - 26} width={U} height={12} fill={c("metalL")} />)}
          {Array.from({ length: 6 }, (_, i) => <rect key={i} x={X0 + U + i * 1.8 * U} y={base - 26} width={0.8 * U * (1 - cI)} height={12} fill={c("metalL")} />)}
          {Array.from({ length: 7 }, (_, i) => <rect key={i} x={X0 + i * 1.8 * U} y={base - 44} width={U} height={18} fill={c("resist")} />)}
          {cI > 0 ? Array.from({ length: 6 }, (_, i) => [0, 1].map((j) => <circle key={`${i}${j}`} cx={X0 + U + i * 1.8 * U + 0.4 * U} cy={110 + ph(f, 0.03, j, 2, i) * 100} r={5.5} fill={c("lp_ion")} opacity={cI} />)) : null}
        </g>
        <text x={560} y={120} opacity={b} style={zh(46, H.text, 900)}>下一支</text>
        <g opacity={b}><rect x={560} y={140} width={350} height={64} fill={H.amber} /><text x={735} y={188} textAnchor="middle" style={zh(40, onC(H.amber), 900)}>蝕刻機 ▸</text></g>
        <text x={560} y={256} opacity={d} style={zh(36, c("lp_proc"), 900)}>留言「流程」看完整解說</text>
      </svg>
    </Card>
  );
};

export const WfSection: React.FC<P> = (p) => {
  const kd = String((p.o as any).kind);
  if (kd === "wf-ring") return <Ring {...p} />;
  if (kd === "wf-sec") return <Sec {...p} />;
  if (kd === "wf-count") return <Count {...p} />;
  if (kd === "wf-who") return <Who {...p} />;
  if (kd === "wf-next") return <Next {...p} />;
  return null;
};

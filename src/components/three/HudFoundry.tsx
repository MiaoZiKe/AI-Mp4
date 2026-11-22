// 2026/11/18 tech-foundry：晶圓代工的 2D 示意卡（overlay `section` 的 kind 以 "fdy-" 開頭，Hud.tsx 的 HudSection 轉過來）。
//   fdy-share 代工市占甜甜圈｜fdy-why 設計與製造分開｜fdy-air 無塵室氣流剖面｜fdy-path 傳送盒到反應腔｜fdy-die 晶粒剖面（電晶體＋金屬線）
//   fdy-nodes 先進 vs 成熟對照卡｜fdy-who 各家主力｜fdy-next 下一支
// 全部示意；顏色讀 H 與 model.json 的 palette；時間全部來自 script.json 的 t（cue）。
import React from "react";
import { FONT_ZH } from "../../theme";
import { H, L, sm, CARD_HEAD, CARD_CONTENT_TOP, cardTitleBox } from "./hudSkin";
import { EASE, tween } from "../anim";
import type { Model3D, Overlay3D } from "./engine";
import { col } from "./model";

const zh = (px: number, color: string = H.text, w = 800): React.CSSProperties => ({ fontFamily: FONT_ZH, fontSize: px, fill: color, color, fontWeight: w, whiteSpace: "nowrap" });
const onC = (bg: string) => (bg === H.amber ? ((H as any).onAmber ?? H.onAccent) : H.onAccent);
type P = { o: Overlay3D; f: number; k: number; m: Model3D };
const T = (o: Overlay3D, n: string) => ((o as any).t?.[n]?.at ?? o.at) as number;
const Card: React.FC<{ o: Overlay3D; k: number; W: number; Hh: number; children: React.ReactNode }> = ({ o, k, W, Hh, children }) => (
  <div style={{ position: "absolute", left: o.x ?? L.X, top: o.y ?? 900, width: W, height: Hh, opacity: k, background: H.cardCompare, border: `2px solid ${H.lineSoft}`, boxSizing: "border-box", overflow: "hidden" }}>
    {o.title ? <div style={{ ...zh(CARD_HEAD.px, onC(H.line), 800), ...cardTitleBox(), background: H.line, zIndex: 2 }}>{o.title}</div> : null}
    {o.tag ? <div style={{ position: "absolute", right: 16, top: 14, ...zh(sm(28), H.text2, 600), zIndex: 2 }}>{o.tag}</div> : null}
    {children}
  </div>
);
const ph = (f: number, sp: number, j: number, n: number, seed = 0) => (((f * sp + j / n + seed * 0.17) % 1) + 1) % 1;

// ── fdy-share：代工營收占比（TrendForce 2026Q2：台積電 72.5、三星 5.9、中芯 5.4、聯電 3.9、其他 12.3）──
const SHARE: [string, number, string][] = [["台積電", 72.5, "aBlue"], ["三星", 5.9, "steel2"], ["中芯", 5.4, "steel"], ["聯電", 3.9, "aOrange"], ["其他", 12.3, "steelHi"]];
const Share: React.FC<P> = ({ o, f, k, m }) => {
  const W = o.w ?? 952, Hh = o.h ?? 320, c = (n: string) => col(m.product, n);
  const wc = T(o, "wc"), pct = T(o, "pct"), tsmc = T(o, "tsmc"), ask = T(o, "ask");
  const a = tween(f, wc, 10, EASE.enter), g = tween(f, pct - 6, 34, EASE.move), tt = tween(f, tsmc, 8, EASE.enter), q = tween(f, ask, 10, EASE.enter);
  const r = 96, C = 2 * Math.PI * r, cx = 178, cy = 188;
  let acc = 0;
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        <g opacity={a} transform={`rotate(-90 ${cx} ${cy})`}>
          {SHARE.map(([n, v, cc], i) => { const len = (v / 100) * C * g, st = (acc / 100) * C * g; acc += v;
            return <circle key={i} cx={cx} cy={cy} r={r} fill="none" stroke={c(cc)} strokeWidth={46} strokeDasharray={`${Math.max(0, len - 2)} ${C}`} strokeDashoffset={-st} />; })}
        </g>
        <text x={cx} y={cy + 8} textAnchor="middle" opacity={tween(f, pct, 8, EASE.enter)} style={zh(40, c("aBlue"), 900)}>72.5%</text>
        <text x={cx} y={cy + 36} textAnchor="middle" opacity={tween(f, pct, 8, EASE.enter)} style={zh(26, H.text2, 700)}>台積電</text>
        {SHARE.map(([n, v, cc], i) => { const y = 92 + i * 40, hi = i === 0; const on = tween(f, wc + 4 + i * 5, 8, EASE.enter);
          return <g key={i} opacity={on}><rect x={400} y={y - 24} width={26} height={26} fill={c(cc)} /><text x={440} y={y} style={zh(hi ? 38 : 32, H.text, hi ? 900 : 700)}>{n}</text>
            <text x={900} y={y} textAnchor="end" style={zh(hi ? 38 : 32, hi ? c("aBlue") : H.text2, 900)}>{v.toFixed(1)}%</text></g>; })}
        <g opacity={q}><rect x={400} y={Hh - 62} width={500} height={46} fill={H.amber} /><text x={650} y={Hh - 28} textAnchor="middle" style={zh(32, onC(H.amber), 900)}>設計公司為什麼不自己蓋廠？</text></g>
      </svg>
    </Card>
  );
};

// ── fdy-why：設計 與 製造 分開 ──
const Why: React.FC<P> = ({ o, f, k, m }) => {
  const W = o.w ?? 952, Hh = o.h ?? 320, c = (n: string) => col(m.product, n);
  const build = T(o, "build"), cost = T(o, "cost"), nofit = T(o, "nofit"), design = T(o, "design"), fab = T(o, "fab");
  const aF = tween(f, build, 10, EASE.enter), aC = tween(f, cost, 24, EASE.move), aN = tween(f, nofit, 10, EASE.enter), aD = tween(f, design, 10, EASE.enter), aX = tween(f, fab, 12, EASE.enter);
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        {/* 代工廠（右）：廠房＋煙囪 */}
        <g opacity={0.8 + 0.2 * Math.max(aF, aX)} transform="translate(640 44)">
          <rect x={0} y={40} width={200} height={84} fill={c("wall")} stroke={H.text3} strokeWidth={3} /><rect x={0} y={40} width={200} height={14} fill={c("aBlue")} />
          {[0, 1, 2, 3, 4, 5].map((i) => <rect key={i} x={12 + i * 30} y={70} width={16} height={36} fill={c("win")} />)}
          {/* 煙囪頂要在右上小字下緣＋4px 以下（11/22 Andy：「這邊發生重疊 需要避免以後繼續發生」） */}<rect x={150} y={CARD_CONTENT_TOP - 44} width={18} height={84 - CARD_CONTENT_TOP} fill={c("steelHi")} /><rect x={178} y={CARD_CONTENT_TOP - 38} width={14} height={78 - CARD_CONTENT_TOP} fill={c("steelHi")} />
          <text x={100} y={162} textAnchor="middle" style={zh(34, H.text, 900)}>代工廠：蓋廠＋製造</text>
        </g>
        {/* 設計公司（左）：藍圖 */}
        <g opacity={0.8 + 0.2 * aD} transform="translate(64 44)">
          <rect x={0} y={20} width={200} height={104} fill={c("wall")} stroke={H.text3} strokeWidth={3} />
          <path d="M20 100 H100 V60 H180 M20 70 H70 M120 100 H180" stroke={c("aBlue")} strokeWidth={4} fill="none" />
          <rect x={86} y={46} width={28} height={28} fill="none" stroke={c("aOrange")} strokeWidth={4} />
          <text x={100} y={162} textAnchor="middle" style={zh(34, H.text, 900)}>設計公司：只管設計</text>
        </g>
        <g opacity={aX}>
          <path d="M290 96 H600" stroke={c("aOrange")} strokeWidth={6} /><path d="M588 84 l14 12 l-14 12" stroke={c("aOrange")} strokeWidth={6} fill="none" />
          <text x={445} y={80} textAnchor="middle" style={zh(sm(30), H.text2, 800)}>設計圖</text>
          {[0, 1, 2].map((j) => <rect key={j} x={290 + 300 * ph(f, 0.012, j, 3)} y={88} width={16} height={16} fill={c("aOrange")} />)}
          <path d="M600 140 H290" stroke={c("aTeal")} strokeWidth={6} /><path d="M302 128 l-14 12 l14 12" stroke={c("aTeal")} strokeWidth={6} fill="none" />
          <text x={445} y={176} textAnchor="middle" style={zh(sm(30), H.text2, 800)}>做好的晶片</text>
        </g>
        {/* 成本條 */}
        <text x={64} y={Hh - 70} style={zh(32, H.text, 800)}>一座先進晶圓廠</text>
        <rect x={64} y={Hh - 56} width={520} height={26} fill={H.lineSoft} />
        <rect x={64} y={Hh - 56} width={520 * aC} height={26} fill={c("lp_bad")} />
        <text x={600} y={Hh - 34} opacity={aC} style={zh(34, c("lp_bad"), 900)}>一百億美元以上</text>
        <text x={340} y={Hh - 70} opacity={aN} style={zh(32, c("lp_bad"), 800)}>訂單不夠大，就攤不平</text>
      </svg>
    </Card>
  );
};

// ── fdy-air：無塵室剖面 ──
const Air: React.FC<P> = ({ o, f, k, m }) => {
  const W = o.w ?? 952, Hh = o.h ?? 320, c = (n: string) => col(m.product, n);
  const enter = T(o, "enter"), air = T(o, "air"), dust = T(o, "dust");
  const a = tween(f, enter, 10, EASE.enter), b = tween(f, air, 12, EASE.enter), d = tween(f, dust, 10, EASE.enter);
  const x0 = 70, x1 = 880, yC = CARD_CONTENT_TOP + 20, yF = 224; // 天花板（yC−20）從標題下緣＋8px 開始
  const nF = 8, fw = (x1 - x0) / nF;
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        <rect x={x0} y={yC - 20} width={x1 - x0} height={20} fill={c("wallD")} />
        {Array.from({ length: nF }, (_, i) => <g key={i} opacity={a}><rect x={x0 + i * fw + 6} y={yC} width={fw - 12} height={16} fill={c("ffu")} stroke={H.text3} strokeWidth={2} /><rect x={x0 + i * fw + 14} y={yC + 14} width={fw - 28} height={5} fill={c("filter")} /></g>)}
        {Array.from({ length: 3 }, (_, i) => { const tx = x0 + 70 + i * 270; return <g key={i}><rect x={tx} y={yF - 78} width={150} height={78} fill={c("wall")} stroke={H.text3} strokeWidth={3} /><rect x={tx} y={yF - 78} width={150} height={12} fill={c("aBlue")} /></g>; })}
        <rect x={x0} y={yF} width={x1 - x0} height={12} fill={c("floorC")} />
        {Array.from({ length: 16 }, (_, i) => <rect key={i} x={x0 + 20 + i * 50} y={yF} width={26} height={12} fill={c("slot")} opacity={0.8} />)}
        <rect x={x0} y={yF + 12} width={x1 - x0} height={44} fill={H.lineSoft} opacity={0.35} />
        {/* 往下的空氣 */}
        {b > 0 ? Array.from({ length: 24 }, (_, j) => { const x = x0 + 24 + (j % 12) * 66 + (j >= 12 ? 30 : 0), u = ph(f, 0.014, j, 24, j % 5), y = yC + 22 + u * (yF - yC - 22);
          return <g key={j} opacity={b * (u < 0.1 ? u * 10 : 1)}><path d={`M${x} ${y} v22 m-6 -8 l6 8 l6 -8`} stroke={c("lp_sig")} strokeWidth={4} fill="none" strokeLinecap="round" /></g>; }) : null}
        {/* 灰塵：被氣流帶著穿過地板 */}
        {d > 0 ? Array.from({ length: 12 }, (_, j) => { const x = x0 + 40 + j * 66, u = ph(f, 0.011, j, 12, j % 4), y = yC + 40 + u * (yF + 44 - yC - 40); return <circle key={j} cx={x + (j % 3) * 8} cy={y} r={5.5} fill={c("lp_bad")} opacity={d} />; }) : null}
        {/* 地板下往兩側，再沿回風牆往上 */}
        {b > 0 ? <g opacity={b}><path d={`M${(x0 + x1) / 2} ${yF + 34} H${x0 + 14} V${yC + 26}`} stroke={c("lp_sig")} strokeWidth={4} fill="none" strokeDasharray="10 10" opacity={0.7} /><path d={`M${(x0 + x1) / 2} ${yF + 34} H${x1 - 14} V${yC + 26}`} stroke={c("lp_sig")} strokeWidth={4} fill="none" strokeDasharray="10 10" opacity={0.7} /></g> : null}
        <text x={x0 + 4} y={Hh - 16} opacity={0.8 + 0.2 * a} style={zh(sm(30), H.text, 800)}>① 濾網過濾</text>
        <text x={x0 + 230} y={Hh - 16} opacity={0.8 + 0.2 * b} style={zh(sm(30), H.text, 800)}>② 空氣往下吹</text>
        <text x={x0 + 480} y={Hh - 16} opacity={0.8 + 0.2 * d} style={zh(sm(30), c("lp_bad"), 900)}>③ 灰塵穿過地板被帶走</text>
      </svg>
    </Card>
  );
};

// ── fdy-path：傳送盒 → 軌道 → 機台 → 手臂 → 反應腔 ──
const Path: React.FC<P> = ({ o, f, k, m }) => {
  const W = o.w ?? 952, Hh = o.h ?? 320, c = (n: string) => col(m.product, n);
  const names: [string, string, string][] = [["傳送盒", "25 片一盒", "box"], ["天花板軌道", "天車載著跑", "rail"], ["機台", "放到裝載口", "tool"], ["機械手臂", "一片片取出", "arm"], ["反應腔", "製程在這裡", "put"]];
  const bw = 156, gap = 30, x0 = 30, y0 = 100, bh = 120;
  const on = names.map(([, , key]) => tween(f, T(o, key), 8, EASE.enter));
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        {names.map(([n, d], i) => { const x = x0 + i * (bw + gap), a = on[i], act = a > 0.5 && (i === 4 || on[i + 1] < 0.5);
          return <g key={i} opacity={0.8 + 0.2 * a}>
            <rect x={x} y={y0} width={bw} height={bh} fill={H.cardCompare} stroke={act ? H.amber : H.text3} strokeWidth={act ? 6 : 3} />
            <text x={x + bw / 2} y={y0 + 54} textAnchor="middle" style={zh(i === 1 || i === 3 ? 28 : 34, H.text, 900)}>{n}</text>
            <text x={x + bw / 2} y={y0 + 96} textAnchor="middle" style={zh(sm(26), H.text2, 700)}>{d}</text>
          </g>; })}
        {[0, 1, 2, 3].map((i) => { const xa = x0 + i * (bw + gap) + bw, xb = xa + gap, a = Math.min(on[i], on[i + 1]);
          return <g key={i} opacity={a}><path d={`M${xa} ${y0 + bh / 2} H${xb}`} stroke={c("aOrange")} strokeWidth={6} /><path d={`M${xb - 12} ${y0 + bh / 2 - 12} l12 12 l-12 12`} stroke={c("aOrange")} strokeWidth={6} fill="none" />
            <circle cx={xa + 8 + (gap - 16) * ph(f, 0.03, 0, 1)} cy={y0 + bh / 2} r={7} fill={c("wafer")} stroke={H.text3} strokeWidth={2} /></g>; })}
        <text x={W / 2} y={y0 + bh + 62} textAnchor="middle" style={zh(sm(32), H.text2, 800)}>晶圓全程在盒子與機台裡走，不碰外面的空氣</text>
      </svg>
    </Card>
  );
};

// ── fdy-die：左＝晶圓上排滿晶粒，右＝一顆晶粒的剖面（矽基板、電晶體、多層金屬線、接點），訊號由接點往下到電晶體 ──
const Die: React.FC<P> = ({ o, f, k, m }) => {
  const W = o.w ?? 952, Hh = o.h ?? 320, c = (n: string) => col(m.product, n);
  const zw = T(o, "zw"), dies = T(o, "dies"), open = T(o, "open"), tr = T(o, "tr"), metal = T(o, "metal"), sig = T(o, "sig");
  const aW = tween(f, zw, 10, EASE.enter), aD = tween(f, dies, 12, EASE.enter), aO = tween(f, open, 12, EASE.move), aT = tween(f, tr, 8, EASE.enter), aM = tween(f, metal, 8, EASE.enter), aS = tween(f, sig, 12, EASE.enter);
  const wx = 150, wy = 170, wr = 96, st = 24;
  const dies_: React.ReactNode[] = [];
  for (let i = -4; i <= 4; i++) for (let j = -4; j <= 4; j++) { const x = wx + i * st, y = wy + j * st; if (Math.hypot(x - wx, y - wy) < wr - 14) dies_.push(<rect key={`${i}_${j}`} x={x - 10} y={y - 10} width={20} height={20} fill={c("aBlue")} opacity={aD * 0.8} stroke={c("wafer")} strokeWidth={1} />); }
  const sx = 400, sw = 440, ys = [250, 226, 200, 174, 148, 122], lh = 24;   // 由下往上：矽、電晶體、金屬 1～4、接點
  const base = [["矽基板", "steel", 1], ["電晶體層", "ox", aT], ["金屬線", "oxD", aM], ["金屬線", "ox", aM], ["金屬線", "oxD", aM], ["接點", "pass", aM]] as [string, string, number][];
  const path = `M${sx + 330} ${ys[5] - 6} V${ys[1] + 6} H${sx + 270}`;
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        <g opacity={aW}><circle cx={wx} cy={wy} r={wr} fill={c("wafer")} stroke={H.text3} strokeWidth={3} /><rect x={wx - 14} y={wy + wr - 6} width={28} height={10} fill={H.cardCompare} />{dies_}
          <rect x={wx + 2 * st - 10} y={wy + 1 * st - 10} width={20} height={20} fill={c("aOrange")} opacity={aD} /></g>
        <text x={wx} y={Hh - 8} textAnchor="middle" opacity={aW} style={zh(sm(30), H.text2, 800)}>晶圓上排滿晶粒</text>
        <g opacity={aO}>
          <path d={`M${wx + 2 * st + 10} ${wy + st} L${sx - 20} ${ys[1]}`} stroke={c("aOrange")} strokeWidth={3} strokeDasharray="8 8" fill="none" />
          {base.map(([n, mt, a], i) => { const y = ys[i] - i * 0, hh = i === 0 ? 40 : lh; return <g key={i}>
            <rect x={sx} y={y - hh / 2} width={sw} height={hh} fill={c(mt)} stroke={H.text3} strokeWidth={2} opacity={0.8 + 0.2 * (i === 0 ? aO : a)} />
            {i === 1 ? Array.from({ length: 12 }, (_, j) => <g key={j} opacity={aT}><rect x={sx + 14 + j * 36} y={y - 8} width={8} height={16} fill={c("aBlue")} /><rect x={sx + 26 + j * 36} y={y - 10} width={6} height={20} fill={c("aOrange")} /></g>) : null}
            {i >= 2 && i <= 4 ? Array.from({ length: 6 }, (_, j) => <rect key={j} x={sx + 10 + j * 70 + (i % 2) * 20} y={y - 2} width={58} height={5} fill={c("cuHi")} opacity={aM} />) : null}
            {i === 5 ? Array.from({ length: 7 }, (_, j) => <rect key={j} x={sx + 14 + j * 60} y={y - 14} width={34} height={8} fill={c("gold")} opacity={aM} />) : null}
          </g>; })}
          <g opacity={aT}><text x={sx + sw + 12} y={ys[1] - 2} style={zh(sm(30), c("aOrange"), 900)}>電晶體</text></g>
          <g opacity={aM}><text x={sx + sw + 12} y={ys[3] + 8} style={zh(sm(30), c("aBlue"), 900)}>金屬線</text><text x={sx + sw + 12} y={ys[5] + 8} style={zh(sm(30), H.text2, 800)}>接點</text></g>
          <text x={sx + sw + 12} y={ys[0] + 32} style={zh(sm(30), H.text2, 800)}>矽基板</text>
          {aS > 0 ? <g opacity={aS}><path d={path} stroke={c("lp_sig")} strokeWidth={4} fill="none" strokeDasharray="6 8" />
            {[0, 1, 2].map((j) => { const u = ph(f, 0.02, j, 3); return <circle key={j} cx={sx + 330 - (u > 0.7 ? (u - 0.7) / 0.3 * 60 : 0)} cy={ys[5] - 6 + Math.min(1, u / 0.7) * (ys[1] - ys[5] + 12)} r={6} fill={c("lp_sig")} />; })}</g> : null}
        </g>
      </svg>
    </Card>
  );
};

// ── fdy-nodes：先進 vs 成熟對照卡 ──
const Nodes: React.FC<P> = ({ o, f, k, m }) => {
  const W = o.w ?? 952, Hh = o.h ?? 320, c = (n: string) => col(m.product, n);
  const two = T(o, "two"), adv = T(o, "adv"), phone = T(o, "phone"), mat = T(o, "mat"), car = T(o, "car");
  const aR = tween(f, two, 10, EASE.enter), aA = tween(f, adv, 10, EASE.enter), aP = tween(f, phone, 8, EASE.enter), aM = tween(f, mat, 10, EASE.enter), aC = tween(f, car, 8, EASE.enter);
  const ticks: [string, number][] = [["2", 0], ["3", 1], ["5", 2], ["7", 3], ["28", 5], ["40", 6], ["65", 7], ["90", 8]];
  const tx = (i: number) => 160 + i * 96;
  const chip = (x: number, y: number, t: string, a: number, cc: string) => <g opacity={0.8 + 0.2 * a}><rect x={x} y={y} width={190} height={46} fill={cc} /><text x={x + 95} y={y + 33} textAnchor="middle" style={zh(30, onC(cc), 900)}>{t}</text></g>;
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        <g>
          <line x1={60} y1={96} x2={W - 60} y2={96} stroke={H.text3} strokeWidth={3} />
          {ticks.map(([t, i]) => <g key={t}><line x1={tx(i)} y1={88} x2={tx(i)} y2={104} stroke={H.text3} strokeWidth={3} /><text x={tx(i)} y={128} textAnchor="middle" style={zh(sm(28), H.text2, 700)}>{t}</text></g>)}
          <text x={64} y={128} style={zh(sm(28), H.text3, 700)}>奈米</text>
          <rect x={tx(0) - 20} y={74} width={tx(3) - tx(0) + 40} height={10} fill={c("aBlue")} opacity={0.4 + 0.6 * aA} />
          <rect x={tx(5) - 20} y={74} width={tx(8) - tx(5) + 40} height={10} fill={c("aOrange")} opacity={0.4 + 0.6 * aM} />
        </g>
        <g opacity={0.8 + 0.2 * aA}>
          <rect x={64} y={140} width={400} height={126} fill="none" stroke={c("aBlue")} strokeWidth={aA > 0.5 ? 5 : 3} />
          <text x={264} y={180} textAnchor="middle" style={zh(33, c("aBlue"), 900)}>先進製程　約 7 奈米以下</text>
        </g>
        {chip(84, 200, "手機處理器", aP, c("aBlue"))}{chip(274, 200, "AI 加速晶片", aP, c("aBlue"))}
        <g opacity={0.8 + 0.2 * aM}>
          <rect x={488} y={140} width={400} height={126} fill="none" stroke={c("aOrange")} strokeWidth={aM > 0.5 ? 5 : 3} />
          <text x={688} y={180} textAnchor="middle" style={zh(33, c("aOrange"), 900)}>成熟製程　約 28 奈米以上</text>
        </g>
        {chip(508, 200, "車用晶片", aC, c("aOrange"))}{chip(698, 200, "電源管理晶片", aC, c("aOrange"))}
        <text x={W / 2} y={Hh - 18} textAnchor="middle" style={zh(sm(30), H.text2, 700)}>台積電公布：2026 年第三季，7 奈米以下占晶圓營收 79%</text>
      </svg>
    </Card>
  );
};

// ── fdy-who：各家主力（補充，主要靠 3D 引線）──
const Who: React.FC<P> = ({ o, f, k, m }) => {
  const W = o.w ?? 952, Hh = o.h ?? 320, c = (n: string) => col(m.product, n);
  const rows: [string, string, string, string][] = [["台積電", "以先進為主，也做成熟", "ts", "aBlue"], ["聯電", "成熟製程為主", "um", "aOrange"], ["世界先進", "8 吋・電源管理晶片", "vi", "aTeal"], ["力積電", "記憶體、驅動晶片", "ps", "aPurple"]];
  const hi = (key: string, next?: string) => { const a = tween(f, T(o, key), 8, EASE.enter); return [a, a > 0.5 && (!next || tween(f, T(o, next), 8, EASE.enter) < 0.5)] as const; };
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        {rows.map(([n, d, key, cc], i) => { const [a, act] = hi(key, rows[i + 1]?.[2]); const y = i === 0 ? 76 : 152 + (i - 1) * 52, hh = i === 0 ? 70 : 46;
          return <g key={i} opacity={0.8 + 0.2 * a}>
            <rect x={64} y={y} width={230} height={hh} fill={c(cc)} /><text x={179} y={y + hh / 2 + 12} textAnchor="middle" style={zh(34, "#FFFFFF", 900)}>{n}</text>
            <rect x={294} y={y} width={594} height={hh} fill="none" stroke={act ? H.amber : H.lineSoft} strokeWidth={act ? 5 : 2} />
            {i === 0 ? <><text x={318} y={y + 30} style={zh(30, H.text, 800)}>以先進為主，也做成熟</text><text x={318} y={y + 62} style={zh(28, H.text2, 700)}>7 奈米以下占晶圓營收 79%（2026Q3）</text></>
              : <text x={318} y={y + 34} style={zh(34, H.text, 800)}>{d}</text>}
          </g>; })}
      </svg>
    </Card>
  );
};

// ── fdy-next：設計 → 代工 → 下一支 ──
const Next: React.FC<P> = ({ o, f, k, m }) => {
  const W = o.w ?? 952, Hh = o.h ?? 300, c = (n: string) => col(m.product, n);
  const split = T(o, "split"), how = T(o, "how"), next = T(o, "next"), flow = T(o, "flow");
  const a = tween(f, split, 10, EASE.enter), b = tween(f, how, 10, EASE.enter), n = tween(f, next, 10, EASE.enter), e = tween(f, flow, 8, EASE.enter);
  const box = (x: number, t: string, al: number, cc: string, tc: string) => <g opacity={0.8 + 0.2 * al}><rect x={x} y={70} width={250} height={96} fill={cc} /><text x={x + 125} y={128} textAnchor="middle" style={zh(t.length > 5 ? 31 : 38, tc, 900)}>{t}</text></g>;
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        {box(40, "設計公司", a, c("aBlue"), "#FFFFFF")}{box(351, "代工廠", a, c("aOrange"), "#FFFFFF")}{box(662, "一片晶圓的流程", n, H.amber, onC(H.amber))}
        <g opacity={a}><path d="M296 118 H345" stroke={H.text3} strokeWidth={6} /><path d="M334 106 l12 12 l-12 12" stroke={H.text3} strokeWidth={6} fill="none" /></g>
        <g opacity={b}><path d="M607 118 H656" stroke={H.text3} strokeWidth={6} strokeDasharray="8 8" /><path d="M645 106 l12 12 l-12 12" stroke={H.text3} strokeWidth={6} fill="none" /></g>
        <text x={W / 2} y={212} textAnchor="middle" opacity={b} style={zh(38, H.text, 900)}>代工廠到底怎麼製造？</text>
        <g opacity={e}><rect x={W / 2 - 280} y={Hh - 58} width={560} height={46} fill={H.amber} /><text x={W / 2} y={Hh - 24} textAnchor="middle" style={zh(34, onC(H.amber), 900)}>下一支 ▸ 一片晶圓要經過哪些流程</text></g>
      </svg>
    </Card>
  );
};

export const FdySection: React.FC<P> = (p) => {
  const kd = String((p.o as any).kind);
  if (kd === "fdy-share") return <Share {...p} />;
  if (kd === "fdy-why") return <Why {...p} />;
  if (kd === "fdy-air") return <Air {...p} />;
  if (kd === "fdy-path") return <Path {...p} />;
  if (kd === "fdy-die") return <Die {...p} />;
  if (kd === "fdy-nodes") return <Nodes {...p} />;
  if (kd === "fdy-who") return <Who {...p} />;
  if (kd === "fdy-next") return <Next {...p} />;
  return null;
};

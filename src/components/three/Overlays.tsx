// 3D 產品台的 2D 疊層（script.json 每幕的 props.overlay；時間在 engine.ts 換成絕對幀）。全部是 HTML／SVG，畫在 3D 畫布上面，
// 不增加 3D 渲染時間。用途：前 3 秒的鉤子（波形面板＋蓋章）、中段的衝突（叉叉）、逐步揭曉（步驟列）、結尾的提問卡與下一集（圈起零件）。
// type：scope 波形面板｜stamp 蓋章｜cross 叉叉｜circle 圈起標註點｜steps 步驟列｜card 提問卡｜ribbon 底部波帶。
// 顏色只讀 THEME_3D（accent3D 的角色色）；位置寫畫面像素（x、y）或 part（model.anchors，跟著 3D 投影走，可加 dx、dy）。
// 波形都是示意：scope 的「加起來」是兩道波逐點相加，不是另外畫的動畫。
import React, { useMemo } from "react";
import { FONT_ZH, FPS, LAYOUT_3D as L, THEME_3D as T, accent3D } from "../../theme";
import { EASE, tween } from "../anim";
import { cameraFor, mix, projectPoint, type Model3D, type Overlay3D, type State3D } from "./engine";

const zh = (size: number, weight: number = T.weight.zh, color: string = T.ink): React.CSSProperties => ({ fontFamily: FONT_ZH, fontWeight: weight, fontSize: size, color, whiteSpace: "nowrap" });
const life = (o: Overlay3D, f: number, i = 5, x = 6) => tween(f, o.at, i, EASE.enter) * (1 - tween(f, o.until, x, EASE.exit));
const TAU = Math.PI * 2;
/** 示意波形：low＝低沉、穩定（基頻加兩個倍頻）；fast＝變化快（頻率高、忽大忽小） */
const wave = (kind: string, u: number, t: number) => {
  if (kind === "fast") { const p = 4.6 * u - 1.5 * t; return ((Math.sin(TAU * p) + 0.7 * Math.sin(TAU * 1.63 * p + 1.1) + 0.5 * Math.sin(TAU * 2.31 * p + 0.4)) / 2.2) * (0.55 + 0.45 * Math.sin(TAU * (0.8 * u - 0.45 * t))); }
  const p = 1.7 * u - 0.8 * t;
  return (Math.sin(TAU * p) + 0.38 * Math.sin(TAU * 2 * p) + 0.2 * Math.sin(TAU * 3 * p)) / 1.58;
};

/** 波形面板：粗線＝耳朵聽到的（噪音＋耳機的聲音）；anti.at 之後耳機的聲音（藍、細）加進來。match＝抵消幾成、lag＝慢多少（對不準） */
const Scope: React.FC<{ o: Overlay3D; f: number }> = ({ o, f }) => {
  const k = life(o, f);
  if (k <= 0) return null;
  const W = L.INNER_W, H = o.h ?? 220, HEAD = 62, N = 110, t = f / FPS, kind = o.wave ?? "low";
  const an = o.anti, a = an ? tween(f, an.at, an.dur ?? 14, EASE.move) * (1 - tween(f, an.until ?? 1e9, 10, EASE.move)) : 0;
  const match = an?.match ?? 0.75, lag = an?.lag ?? 0, ok = match >= 0.6 && lag < 0.03;
  const cy = HEAD + (H - HEAD) / 2, amp = (H - HEAD) / 2 - 16, x0 = 30, x1 = W - 30;
  const line = (fn: (u: number) => number) => Array.from({ length: N + 1 }, (_, i) => { const u = i / N; return `${(x0 + (x1 - x0) * u).toFixed(1)},${(cy - fn(u) * amp * Math.min(1, u * 9, (1 - u) * 9)).toFixed(1)}`; }).join(" ");
  const noise = (u: number) => wave(kind, u, t), anti = (u: number) => -match * a * wave(kind, u - lag, t), sum = (u: number) => noise(u) + anti(u);
  const cN = accent3D("coral"), cA = accent3D("blue"), cS = accent3D("mint");
  const pill = (c: { fill: string; text: string }, txt: string, op: number) => (
    <div style={{ display: "flex", alignItems: "center", gap: 10, opacity: op, ...zh(30, T.weight.body, c.text) }}><div style={{ width: 18, height: 18, borderRadius: T.radius.pill, background: c.fill }} />{txt}</div>
  );
  return (
    <div style={{ position: "absolute", left: L.X, top: o.y, width: W, height: H, opacity: k, transform: `translateY(${Math.round(14 * (1 - k))}px)`, background: T.panel, border: `4px solid ${T.ink}`, borderRadius: T.radius.card, boxShadow: T.cardShadow, overflow: "hidden" }}>
      <div style={{ position: "absolute", left: 28, right: 28, top: 12, height: 46, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ ...zh(38), letterSpacing: "0.04em" }}>{o.title ?? "耳朵聽到的"}</div>
        <div style={{ display: "flex", gap: 26 }}>{pill(cN, o.noiseLabel ?? "噪音", 1)}{an ? pill(cA, an.label ?? "耳機的聲音", a) : null}</div>
      </div>
      <svg width={W} height={H} style={{ position: "absolute", left: 0, top: 0 }}>
        <line x1={x0} x2={x1} y1={cy} y2={cy} stroke={T.line} strokeWidth={3} />
        {a > 0.01 ? <polyline points={line(noise)} fill="none" stroke={cN.fill} strokeWidth={5} strokeLinejoin="round" opacity={0.5 * a} /> : null}
        {a > 0.01 ? <polyline points={line(anti)} fill="none" stroke={cA.fill} strokeWidth={5} strokeLinejoin="round" opacity={0.85 * a} /> : null}
        <polyline points={line(sum)} fill="none" stroke={cN.fill} strokeWidth={12} strokeLinecap="round" strokeLinejoin="round" opacity={ok ? 1 - a : 1} />
        {ok && a > 0.01 ? <polyline points={line(sum)} fill="none" stroke={cS.fill} strokeWidth={12} strokeLinecap="round" strokeLinejoin="round" opacity={a} /> : null}
      </svg>
    </div>
  );
};

/** 蓋章：有顏色的標籤「拍」上去（先大後小、微微歪） */
const Stamp: React.FC<{ o: Overlay3D; f: number; x: number; y: number }> = ({ o, f, x, y }) => {
  const k = life(o, f, 5, 5);
  if (k <= 0) return null;
  const c = accent3D(o.color), size = o.size ?? 76, slam = 1 + 0.7 * (1 - tween(f, o.at, 6, EASE.enter)) + 0.06 * Math.sin(Math.PI * tween(f, o.at + 6, 8, EASE.move));
  return (
    <div style={{ position: "absolute", left: Math.round(x), top: Math.round(y), opacity: k, transform: `translate(-50%, -50%) rotate(${o.rot ?? -6}deg) scale(${slam.toFixed(3)})` }}>
      <div style={{ ...zh(size, T.weight.zh, T.onAccent), background: c.fill, border: `5px solid ${T.ink}`, borderRadius: T.radius.chip, padding: `${Math.round(size * 0.1)}px ${Math.round(size * 0.42)}px ${Math.round(size * 0.14)}px`, letterSpacing: "0.06em", boxShadow: T.cardShadow, lineHeight: 1.2 }}>{o.text}</div>
    </div>
  );
};

/** 叉叉：兩筆依序畫出來 */
const Cross: React.FC<{ o: Overlay3D; f: number; x: number; y: number }> = ({ o, f, x, y }) => {
  const k = life(o, f, 2, 5);
  if (k <= 0) return null;
  const r = (o.size ?? 120) / 2, c = accent3D(o.color ?? "coral"), len = r * 2 * Math.SQRT2;
  const q1 = tween(f, o.at, 5, EASE.move), q2 = tween(f, o.at + 4, 5, EASE.move);
  const st = (q: number) => ({ fill: "none", strokeLinecap: "round" as const, strokeDasharray: `${len} ${len}`, strokeDashoffset: len * (1 - q) });
  return (
    <svg width={L.W} height={L.H} style={{ position: "absolute", left: 0, top: 0, opacity: k }}>
      {[T.panel, c.fill].map((col, i) => (
        <g key={i} stroke={col} strokeWidth={i ? 20 : 34}>
          <path d={`M${x - r} ${y - r} L${x + r} ${y + r}`} {...st(q1)} />
          {q2 > 0 ? <path d={`M${x + r} ${y - r} L${x - r} ${y + r}`} {...st(q2)} /> : null}
        </g>
      ))}
    </svg>
  );
};

/** 圈起一個標註點：一圈描出來，再輕輕縮放提醒 */
const Circle: React.FC<{ o: Overlay3D; f: number; x: number; y: number }> = ({ o, f, x, y }) => {
  const k = life(o, f, 2, 6);
  if (k <= 0) return null;
  const r = (o.r ?? 70) * (1 + 0.06 * Math.sin((f - o.at) * 0.22)), c = accent3D(o.color ?? "coral"), len = TAU * r, q = tween(f, o.at, 12, EASE.move);
  return (
    <svg width={L.W} height={L.H} style={{ position: "absolute", left: 0, top: 0, opacity: k }}>
      {[T.panel, c.fill].map((col, i) => <circle key={i} cx={x} cy={y} r={r} fill="none" stroke={col} strokeWidth={i ? 11 : 21} strokeLinecap="round" strokeDasharray={`${len} ${len}`} strokeDashoffset={len * (1 - q)} transform={`rotate(-100 ${x} ${y})`} />)}
    </svg>
  );
};

/** 步驟列：幾個零件依序揭曉（還沒講到的是「？」），講到的那一個亮起來並留著，畫面一直累積 */
const Steps: React.FC<{ o: Overlay3D; f: number }> = ({ o, f }) => {
  const k = life(o, f);
  if (k <= 0) return null;
  const items = (o.items ?? []) as { text: string; at: number; color?: string }[];
  const cur = items.reduce((a, it, i) => (f >= it.at ? i : a), -1);
  return (
    <div style={{ position: "absolute", left: L.X, top: o.y, width: L.INNER_W, display: "flex", alignItems: "center", gap: 14, opacity: k }}>
      {o.title ? <div style={{ ...zh(34, T.weight.zh, T.panel), background: T.ink, borderRadius: T.radius.pill, padding: "8px 24px 10px", letterSpacing: "0.06em" }}>{o.title}</div> : null}
      {items.map((it, i) => {
        const on = tween(f, it.at - 2, 6, EASE.enter), c = accent3D(it.color), bump = 1 + 0.14 * Math.sin(Math.PI * tween(f, it.at - 2, 10, EASE.move));
        return (
          <React.Fragment key={i}>
            {i > 0 || o.title ? <svg width={26} height={30} viewBox="0 0 26 30"><path d="M4 4 L20 15 L4 26" fill="none" stroke={i <= cur ? T.ink : T.ink3} strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" /></svg> : null}
            <div style={{ position: "relative", transform: `scale(${bump.toFixed(3)})`, ...zh(40, T.weight.zh, on > 0.5 ? (i === cur ? T.onAccent : c.text) : T.ink3), background: on > 0.5 ? (i === cur ? c.fill : c.soft) : T.panel, border: `4px solid ${on > 0.5 ? T.ink : T.line}`, borderRadius: T.radius.chip, padding: "6px 22px 8px", letterSpacing: "0.04em", minWidth: 60, textAlign: "center" }}>
              {on > 0.5 ? it.text : "？"}
            </div>
          </React.Fragment>
        );
      })}
    </div>
  );
};

/** 提問卡：蓋在舞台上的大字卡（kicker 小標＋幾行大字；hi 的字上強調色） */
const Card: React.FC<{ o: Overlay3D; f: number }> = ({ o, f }) => {
  const k = life(o, f, 7, 6);
  if (k <= 0) return null;
  const c = accent3D(o.color ?? "coral"), lines = (o.lines ?? []) as string[], size = o.size ?? 104;
  const under = tween(f, o.at + 8, 12, EASE.move);
  return (
    <div style={{ position: "absolute", left: L.X, top: o.y, width: L.INNER_W, opacity: k, transform: `translateY(${Math.round(40 * (1 - k))}px) scale(${(0.94 + 0.06 * k).toFixed(3)})`, background: T.panel, border: `5px solid ${T.ink}`, borderRadius: T.radius.card, boxShadow: T.cardShadow, padding: "40px 44px 52px", boxSizing: "border-box" }}>
      {o.kicker ? <div style={{ display: "inline-block", ...zh(36, T.weight.body, T.onAccent), background: c.fill, borderRadius: T.radius.pill, padding: "8px 28px 10px", letterSpacing: "0.08em", marginBottom: 18 }}>{o.kicker}</div> : null}
      {lines.map((ln, i) => {
        const hi = o.hi && ln.includes(o.hi) ? ln.split(o.hi) : null;
        return (
          <div key={i} style={{ ...zh(size), lineHeight: 1.28, letterSpacing: "0.02em" }}>
            {hi ? <>{hi[0]}<span style={{ position: "relative", color: c.text }}>{o.hi}<span style={{ position: "absolute", left: 0, bottom: 0, height: 12, width: `${(100 * under).toFixed(1)}%`, background: c.fill, borderRadius: 6 }} /></span>{hi[1]}</> : ln}
          </div>
        );
      })}
      {o.foot ? <div style={{ ...zh(40, T.weight.body, T.ink2), marginTop: 20, letterSpacing: "0.04em" }}>{o.foot}</div> : null}
    </div>
  );
};

/** 底部波帶（字幕與出處下面，背景裝飾）：跟著 keys 的 v 變大變小——吵的時候是暖色大波，壓下去之後是小小的綠波 */
const Ribbon: React.FC<{ o: Overlay3D; f: number }> = ({ o, f }) => {
  const k = life(o, f, 1, 8);
  if (k <= 0) return null;
  const top = o.y ?? 1640, H = L.H - top, N = 80, t = f / FPS;
  let v = o.v ?? 1, fastK = 0;
  for (const key of (o.keys ?? []) as { at: number; v: number; fast?: boolean }[]) { const tw = tween(f, key.at, 16, EASE.move); v = mix(v, key.v, tw); fastK = mix(fastK, key.fast ? 1 : 0, tw); }
  const calm = Math.max(0, Math.min(1, (0.62 - v) / 0.3)), cy = H * 0.42, amp = H * 0.3;
  const pts = (ph: number) => Array.from({ length: N + 1 }, (_, i) => { const u = i / N; return `${(u * L.W).toFixed(1)},${(cy - (0.08 + 0.92 * v) * amp * mix(wave("low", u * 1.2 + ph, t), wave("fast", u * 1.2 + ph, t) * 1.5, fastK)).toFixed(1)}`; }).join(" ");
  const cN = accent3D("coral"), cS = accent3D("mint");
  return (
    <svg width={L.W} height={H} style={{ position: "absolute", left: 0, top, opacity: k }}>
      <polyline points={pts(0.31)} fill="none" stroke={T.line} strokeWidth={10} strokeLinejoin="round" />
      <polyline points={pts(0)} fill="none" stroke={cN.fill} strokeWidth={16} strokeLinejoin="round" opacity={(1 - calm) * 0.55} />
      <polyline points={pts(0)} fill="none" stroke={cS.fill} strokeWidth={16} strokeLinejoin="round" opacity={calm * 0.6} />
    </svg>
  );
};

export const Overlays: React.FC<{ m: Model3D; s: State3D; f: number }> = ({ m, s, f }) => {
  const cam = useMemo(() => cameraFor(s), [s]);
  const at = (o: Overlay3D) => {
    const an = o.part ? m.product.anchors[o.part] : null;
    if (!an) return { x: o.x ?? L.W / 2, y: o.y ?? L.H / 2 };
    const p = projectPoint(s, cam, an.layer, an.p);
    return { x: p.x + (o.dx ?? 0), y: p.y + (o.dy ?? 0) };
  };
  return (
    <>
      {(m.overlays ?? []).map((o, i) => {
        if (f < o.at - 1) return null;
        if (o.type === "ribbon") return <Ribbon key={i} o={o} f={f} />;
        if (o.type === "scope") return <Scope key={i} o={o} f={f} />;
        if (o.type === "steps") return <Steps key={i} o={o} f={f} />;
        if (o.type === "card") return <Card key={i} o={o} f={f} />;
        const p = at(o);
        if (o.type === "stamp") return <Stamp key={i} o={o} f={f} x={p.x} y={p.y} />;
        if (o.type === "cross") return <Cross key={i} o={o} f={f} x={p.x} y={p.y} />;
        if (o.type === "circle") return <Circle key={i} o={o} f={f} x={p.x} y={p.y} />;
        return null;
      })}
    </>
  );
};

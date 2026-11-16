// 等距風「畫面多樣化」引擎（script.json 頂層 stage: "iso" ＋ isoVersion: 6；第一支 videos/caffaine-sketch-game/）。
// Andy 2026/11/16：「AI 頻道為何都是同一個畫面背景，需要更豐富點」。規劃表：docs/channels/caffaine-visual-plan-1116.md。
// 每一幕 props.view 選一種畫面類型（split／chat／browser／device／lens／kinetic／flow／claim；其餘類型下一輪補），
// props.tone 選段落色調（event／principle／bug／fix／unknown／claim，色票在 THEME_ISO.tones）；換幕時底色用圓形擦開轉場。
// 固定不動：LOGO 左上（HeaderIso）、查證截至、性質小標＋狀態標籤、下方字幕與出處、片尾卡 caffend。全部 2D（SVG＋CSS），不用 3D。
// 時間全部由 cue 換算（props 裡的 at 只寫 cue id 或 start／voice／end／exit 加減幾幀）。
import React, { useLayoutEffect, useMemo, useState } from "react";
import { AbsoluteFill, Audio, Sequence, continueRender, delayRender, staticFile, useCurrentFrame } from "remotion";
import type { Script, TimelineV2 } from "../../types";
import { FONT_EN, FONT_ZH, FPS, LAYOUT_ISO as L, THEME_ISO as T } from "../../theme";
import { EASE, tween } from "../anim";
import { buildIso, type Panel } from "./engine";
import { CaffEndcard } from "./CaffAnim";
import { bounce, Caption, type Cap, Chip, col, HeaderIso, riseIn, slam, SourceLine } from "./IsoVideo";

const zh: React.CSSProperties = { fontFamily: FONT_ZH, whiteSpace: "nowrap", lineHeight: 1.16 };
const en: React.CSSProperties = { fontFamily: FONT_EN, whiteSpace: "nowrap", lineHeight: 1 };
const FAR = 1e9, X0 = L.X, TOP = 440, IW = L.INNER_W;
const E = (f: number, at: number, d: number) => tween(f, at, d, EASE.move);
const O = (f: number, at: number, d: number) => tween(f, at, d, EASE.enter);
const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const toneOf = (name?: string) => T.tones[name ?? "event"] ?? T.tones.event;
/** 遊戲截圖（540×960）的共用裁切：去掉米色邊，兩張手繪風圖大小一致 */
const GBOX = [18, 80, 504, 800];

type VP = { f: number; p: Panel; tone: (typeof T.tones)[string] };

// ───────── 小零件 ─────────
const Star: React.FC<{ cx: number; cy: number; r: number; stroke: string; sw?: number; fill?: string }> = ({ cx, cy, r, stroke, sw = 4, fill = "none" }) => {
  const pts = Array.from({ length: 10 }, (_, i) => { const a = -Math.PI / 2 + (i * Math.PI) / 5, rr = i % 2 ? r * 0.45 : r; return `${(cx + rr * Math.cos(a)).toFixed(1)},${(cy + rr * Math.sin(a)).toFixed(1)}`; }).join(" ");
  return <polygon points={pts} fill={fill} stroke={stroke} strokeWidth={sw} strokeLinejoin="round" />;
};
type IconName = "file" | "window" | "play" | "star" | "redo" | "text" | "pencil" | "chip" | "phone" | "tap" | "gamepad" | "check" | "bubble" | "mag" | "stop";
const Ico: React.FC<{ n: IconName; size?: number; color?: string; fill?: string }> = ({ n, size = 64, color = T.ink, fill = "#fff" }) => {
  const s = { fill: "none", stroke: color, strokeWidth: 4.5, strokeLinecap: "round", strokeLinejoin: "round" } as const;
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" style={{ display: "block", flexShrink: 0 }}>
      {n === "file" ? <><path d="M16 6 H38 L50 18 V58 H16 Z" {...s} fill={fill} /><path d="M38 6 V18 H50" {...s} /><path d="M24 34 H42 M24 44 H42" {...s} /></> : null}
      {n === "window" ? <><rect x={6} y={10} width={52} height={44} rx={8} {...s} fill={fill} /><path d="M6 24 H58" {...s} /><circle cx={16} cy={17} r={1.5} {...s} /><circle cx={24} cy={17} r={1.5} {...s} /></> : null}
      {n === "play" ? <><circle cx={32} cy={32} r={25} {...s} fill={fill} /><path d="M26 20 L45 32 L26 44 Z" {...s} fill={color} /></> : null}
      {n === "star" ? <Star cx={32} cy={34} r={26} stroke={color} sw={4.5} fill={fill} /> : null}
      {n === "redo" ? <><path d="M50 22 A20 20 0 1 0 52 36" {...s} /><path d="M52 8 V22 H38" {...s} /></> : null}
      {n === "text" ? <><path d="M10 14 H54 M10 26 H54 M10 38 H40" {...s} /><path d="M44 46 L52 54" {...s} /></> : null}
      {n === "pencil" ? <><path d="M10 54 L14 40 L44 10 L54 20 L24 50 Z" {...s} fill={fill} /><path d="M38 16 L48 26" {...s} /></> : null}
      {n === "chip" ? <><rect x={14} y={14} width={36} height={36} rx={8} {...s} fill={fill} /><path d="M24 6 V14 M40 6 V14 M24 50 V58 M40 50 V58 M6 24 H14 M6 40 H14 M50 24 H58 M50 40 H58" {...s} /></> : null}
      {n === "phone" ? <><rect x={18} y={5} width={28} height={54} rx={7} {...s} fill={fill} /><path d="M28 51 H36" {...s} /></> : null}
      {n === "tap" ? <><path d="M26 30 V12 A4 4 0 0 1 34 12 V28 L46 31 A5 5 0 0 1 50 36 V44 A14 14 0 0 1 36 58 H34 A14 14 0 0 1 24 52 L14 40 A4 4 0 0 1 20 35 L26 40" {...s} fill={fill} /></> : null}
      {n === "gamepad" ? <><rect x={4} y={18} width={56} height={30} rx={15} {...s} fill={fill} /><path d="M18 26 V40 M11 33 H25" {...s} /><circle cx={44} cy={29} r={2.5} {...s} /><circle cx={50} cy={37} r={2.5} {...s} /></> : null}
      {n === "check" ? <><circle cx={32} cy={32} r={26} stroke="none" fill={fill} /><path d="M18 33 L28 43 L47 22" {...s} strokeWidth={7} /></> : null}
      {n === "bubble" ? <><path d="M8 12 H56 V42 H30 L18 54 V42 H8 Z" {...s} fill={fill} /></> : null}
      {n === "mag" ? <><circle cx={27} cy={27} r={18} {...s} fill={fill} /><path d="M40 40 L56 56" {...s} strokeWidth={7} /></> : null}
      {n === "stop" ? <><circle cx={32} cy={32} r={26} {...s} fill={fill} /><path d="M20 20 L44 44 M44 20 L20 44" {...s} /></> : null}
    </svg>
  );
};
const Card: React.FC<{ color?: string; style?: React.CSSProperties; children?: React.ReactNode; pad?: number; ov?: string }> = ({ color = "primary", style, children, pad = 12, ov }) => (
  <div data-ov={ov} style={{ background: T.card, borderRadius: 26, padding: pad, boxShadow: `0 8px 0 ${col(color).side}`, ...style }}>{children}</div>
);
/** 遊戲截圖：照 box 裁切放大；children 畫在原圖座標（viewBox＝box）上，例如圈選框 */
const Shot: React.FC<{ src: string; w: number; box?: number[]; sw?: number; sh?: number; style?: React.CSSProperties; children?: React.ReactNode }> = ({ src, w, box = GBOX, sw = 540, sh = 960, style, children }) => {
  const k = w / box[2], h = Math.round(box[3] * k);
  return (
    <div style={{ position: "relative", width: w, height: h, overflow: "hidden", borderRadius: 14, background: "#FAF6EC", boxShadow: `inset 0 0 0 3px ${T.line}`, ...style }}>
      <img src={staticFile(src)} style={{ position: "absolute", left: -box[0] * k, top: -box[1] * k, width: sw * k, height: sh * k, display: "block" }} />
      <svg width={w} height={h} viewBox={`${box[0]} ${box[1]} ${box[2]} ${box[3]}`} style={{ position: "absolute", left: 0, top: 0 }}>{children}</svg>
    </div>
  );
};
/** 圈選框（原圖座標）：描線畫出來，之後輕輕脈動 */
const Ring: React.FC<{ f: number; at: number; box?: number[]; circle?: number[]; color: string; sw?: number }> = ({ f, at, box, circle, color, sw = 7 }) => {
  const t = E(f, at, 12), pul = f > at + 12 ? 1 + 0.025 * Math.sin((f - at) / 4) : 1;
  if (f < at) return null;
  const c = col(color).fill;
  return box ? (
    <g transform={`translate(${box[0] + box[2] / 2},${box[1] + box[3] / 2}) scale(${pul}) translate(${-box[0] - box[2] / 2},${-box[1] - box[3] / 2})`}>
      <rect x={box[0]} y={box[1]} width={box[2]} height={box[3]} rx={16} fill="none" stroke={c} strokeWidth={sw} pathLength={1} strokeDasharray="1" strokeDashoffset={1 - t} strokeLinecap="round" />
    </g>
  ) : circle ? <circle cx={circle[0]} cy={circle[1]} r={circle[2] * pul} fill="none" stroke={c} strokeWidth={sw} pathLength={1} strokeDasharray="1" strokeDashoffset={1 - t} strokeLinecap="round" /> : null;
};
const stateColor = (t: string) => (/確定/.test(t) ? "right" : /查不到|尚未/.test(t) ? "plum" : /不符|不一致/.test(t) ? "wrong" : "note");
const StatusChip: React.FC<{ f: number; at: number; text: string; color?: string }> = ({ f, at, text, color }) => {
  const c = col(color ?? stateColor(text));
  return <div data-ov="狀態" style={{ ...bounce(f, at), display: "inline-block" }}><Chip text={text} bg={c.soft} fg={c.text} px={30} /></div>;
};
const Tag: React.FC<{ f: number; p: Panel }> = ({ f, p }) => {
  const o = O(f, p.in, 4) * (f < p.out ? 1 : 0), c = col(String(p.p.tagColor ?? "primary"));
  const st = p.p.status ? String(p.p.status) : "", tS = p.at(p.p.statusAt, p.in + 10);
  return o <= 0.01 ? null : (
    <div style={{ position: "absolute", left: X0, top: L.MAIN_TOP + 8, opacity: o, display: "flex", alignItems: "center", gap: 26 }}>
      <div data-ov="性質小標" style={{ ...zh, fontWeight: 900, fontSize: 40, color: c.on, background: c.fill, borderRadius: 18, padding: "6px 26px", boxShadow: `0 6px 0 ${c.side}` }}>{String(p.p.tag)}</div>
      {st ? <StatusChip f={f} at={tS} text={st} /> : null}
    </div>
  );
};
const AsOf: React.FC<{ text: string }> = ({ text }) => <div data-ov="查證日期" style={{ position: "absolute", right: X0, top: L.MAIN_TOP + 14, ...zh, fontWeight: 800, fontSize: 32, color: T.ink2 }}>{text}</div>;

// ───────── 背景：色調、紋理、頂底色帶、飄浮小物 ─────────
const Texture: React.FC<{ tex: string; color: string; id: string }> = ({ tex, color, id }) => {
  const o = 0.2;
  const body = tex === "dots" ? <circle cx={20} cy={20} r={4} fill={color} opacity={o} />
    : tex === "diag" ? <path d="M-5 45 L45 -5 M20 60 L60 20" stroke={color} strokeWidth={5} opacity={o * 0.8} />
    : tex === "grid" ? <path d="M0 0 H80 M0 0 V80" stroke={color} strokeWidth={3} opacity={o} />
    : tex === "plus" ? <path d="M30 20 V40 M20 30 H40" stroke={color} strokeWidth={5} strokeLinecap="round" opacity={o} />
    : tex === "dash" ? <path d="M6 30 H34" stroke={color} strokeWidth={6} strokeLinecap="round" opacity={o} />
    : <circle cx={40} cy={40} r={14} fill={color} opacity={o * 0.8} />;
  const sz = tex === "grid" ? 80 : tex === "bigdots" ? 110 : tex === "diag" ? 60 : 60;
  return <svg width={L.W} height={L.H} style={{ position: "absolute", left: 0, top: 0 }}><defs><pattern id={id} width={sz} height={sz} patternUnits="userSpaceOnUse">{body}</pattern></defs><rect width={L.W} height={L.H} fill={`url(#${id})`} /></svg>;
};
const Drift: React.FC<{ f: number; color: string }> = ({ f, color }) => {
  const items = [[90, 470, 0], [960, 560, 1], [140, 1180, 2], [930, 1230, 3], [520, 400, 0], [60, 840, 1], [1000, 880, 2]];
  return (
    <svg width={L.W} height={L.H} style={{ position: "absolute", left: 0, top: 0 }}>
      {items.map(([x, y, k], i) => {
        const dx = 14 * Math.sin(f / 34 + i * 1.7), dy = 20 * Math.cos(f / 41 + i * 2.3), r = (f / (3 + i)) % 360;
        return (
          <g key={i} transform={`translate(${x + dx},${y + dy}) rotate(${r})`} opacity={0.32}>
            {k === 0 ? <circle r={14} fill="none" stroke={color} strokeWidth={5} /> : k === 1 ? <path d="M-14 0 H14 M0 -14 V14" stroke={color} strokeWidth={5} strokeLinecap="round" /> : k === 2 ? <rect x={-11} y={-11} width={22} height={22} rx={5} fill={color} /> : <Star cx={0} cy={0} r={17} stroke={color} sw={4} />}
          </g>
        );
      })}
    </svg>
  );
};
const ToneBg: React.FC<{ tone: string; f: number }> = ({ tone, f }) => {
  const t = toneOf(tone);
  return (
    <AbsoluteFill style={{ background: `linear-gradient(160deg, ${t.bg0} 0%, ${t.bg1} 100%)` }}>
      <Texture tex={t.tex} color={t.accent} id={`tx-${tone}`} />
      <Drift f={f} color={t.accent} />
      <svg width={L.W} height={L.H} style={{ position: "absolute", left: 0, top: 0 }}>
        <rect x={0} y={0} width={L.W} height={64} fill={t.band} /><rect x={0} y={L.H - 64} width={L.W} height={64} fill={t.band} />
        {Array.from({ length: 27 }, (_, i) => <g key={i}><rect x={i * 40 + 16} y={22} width={8} height={8} rx={2} fill={t.accent} opacity={0.4} /><rect x={i * 40 + 16} y={L.H - 42} width={8} height={8} rx={2} fill={t.accent} opacity={0.4} /></g>)}
      </svg>
    </AbsoluteFill>
  );
};
const Bands: React.FC<{ on: number; steps: [string, string][] }> = ({ on, steps }) => (
  <div style={{ position: "absolute", left: L.X, width: L.INNER_W, top: 1690, display: "flex", alignItems: "center", justifyContent: "center", gap: 18 }}>
    {steps.map(([w, c], i) => { const act = on === i, cc = col(c); return (
      <React.Fragment key={w}>
        {i ? <svg width={54} height={30} viewBox="0 0 60 30"><path d="M4 15 H46 M36 5 L48 15 L36 25" fill="none" stroke={T.ink3} strokeWidth={6} strokeLinecap="round" strokeLinejoin="round" /></svg> : null}
        <div data-ov="追蹤條" style={{ ...zh, fontWeight: 900, fontSize: 46, padding: "12px 30px", borderRadius: 30, background: act ? cc.fill : T.card, color: act ? cc.on : T.ink3, boxShadow: `0 8px 0 ${act ? cc.side : T.cardSide}`, transform: `scale(${act ? 1.06 : 1})` }}>{w}</div>
      </React.Fragment>); })}
  </div>
);


const StackSplit: React.FC<VP> = ({ f, p, tone }) => {
  const q = p.p as any, A = (s: any, fb: number) => p.at(s, fb);
  const sides = [q.top, q.bottom] as any[];
  const tS = sides.map((x, i) => A(x.at, p.in + 3 + i * 40));
  if (q.top.cells) {
    const heads = q.heads ?? ["負責人", "事項", "期限"], CH = 330, tD = A(q.diffAt, FAR), widths = [290, 380, 170];
    return (
      <>
        {sides.map((sd, i) => {
          const t = tS[i], e = E(f, t, 12), c = col(sd.color);
          if (f < t) return <Ghost key={i} color={c.fill} style={{ left: X0, top: TOP + i * (CH + 34), width: IW, height: CH }}><Chip text={sd.label} bg={c.soft} fg={c.text} px={34} /></Ghost>;
          return (
            <div key={i} data-ov={`表${i + 1}`} style={{ position: "absolute", left: X0, top: TOP + i * (CH + 34), width: IW, height: CH, background: T.card, borderRadius: 32, boxShadow: `0 8px 0 ${c.side}`, boxSizing: "border-box", padding: "20px 32px", opacity: O(f, t, 5), transform: `translateX(${Math.round((1 - e) * (i ? 60 : -60))}px)` }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: 64 }}>
                <Chip text={sd.label} bg={c.fill} fg={c.on} px={34} />
                <div style={{ ...zh, fontWeight: 800, fontSize: 30, color: T.ink2 }}>{sd.by}</div>
              </div>
              <div style={{ display: "flex", gap: 20, marginTop: 20 }}>
                {sd.cells.map((cv: string, k: number) => {
                  const hot = q.diffCell === k && f >= tD, hc = col("wrong");
                  return (
                    <div key={k} style={{ width: widths[k], background: hot ? "#FFF2C6" : "#F4F6FD", borderRadius: 20, padding: "12px 18px", boxSizing: "border-box", height: 190, boxShadow: hot ? `0 0 0 6px ${hc.fill}` : undefined, transform: hot ? `scale(${(1 + 0.03 * Math.sin(f / 4)).toFixed(3)})` : undefined }}>
                      <div style={{ ...zh, fontWeight: 700, fontSize: 28, color: T.ink3 }}>{heads[k]}</div>
                      <div style={{ ...zh, whiteSpace: "normal", fontWeight: 900, fontSize: k === 0 ? 48 : k === 1 ? 38 : 34, lineHeight: 1.25, color: hot ? hc.text : T.ink, marginTop: 6 }}>{cv}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
        {q.badge ? <div data-ov="差異徽章" style={{ position: "absolute", left: X0, top: TOP + 2 * (CH + 34), width: IW, display: "flex", justifyContent: "center", ...(f >= A(q.badge.at, FAR) ? bounce(f, A(q.badge.at, FAR)) : { opacity: 0 }) }}><Chip text={q.badge.text} bg={col("wrong").fill} fg="#fff" px={44} /></div> : null}
      </>
    );
  }
  const IWp = 560, ih = Math.round(IWp * 800 / 1280), CH = ih + 24, mids = (q.mids ?? []) as { text: string; at: any; color: string; kind?: string }[];
  let my = TOP + 130;
  return (
    <>
      {sides.map((sd, i) => {
        const t = tS[i], e = E(f, t, 12), c = col(sd.color), y = TOP + i * (CH + 36);
        if (f < t) return <Ghost key={i} color={c.fill} style={{ left: X0, top: y, width: IWp + 24, height: CH }}><Chip text={sd.label} bg={c.soft} fg={c.text} px={34} /></Ghost>;
        return (
          <React.Fragment key={i}>
            <div data-ov={`圖${i + 1}`} style={{ position: "absolute", left: X0, top: y, opacity: O(f, t, 5), transform: `translateX(${Math.round((1 - e) * -50)}px) rotate(${(-2 * (1 - e)).toFixed(2)}deg)` }}>
              <Card color={sd.color}><div style={{ width: IWp, height: ih, borderRadius: 12, overflow: "hidden", background: "#FAF6EC", boxShadow: `inset 0 0 0 3px ${T.line}` }}><img src={staticFile(sd.src)} style={{ width: IWp, height: ih, display: "block" }} /></div></Card>
            </div>
            <div data-ov={`標籤${i + 1}`} style={{ position: "absolute", left: X0 + IWp + 64, top: i ? y + CH - 70 : y + 6, ...bounce(f, A(sd.labelAt ?? sd.at, t)) }}><Chip text={sd.label} bg={c.fill} fg={c.on} px={30} /></div>
          </React.Fragment>
        );
      })}
      {mids.map((m, i) => {
        const t = A(m.at, FAR), c = col(m.color), big = m.kind === "stamp", h = big ? 170 : 120, y = my; my += h + 24;
        return f < t ? null : big
          ? <div key={i} data-ov={`中${i + 1}`} style={{ position: "absolute", left: X0 + IWp + 64 + 80, top: y, width: 170, height: 170, borderRadius: 85, background: c.fill, boxShadow: `0 8px 0 ${c.side}`, display: "flex", alignItems: "center", justifyContent: "center", ...en, fontWeight: 900, fontSize: 110, color: "#fff", ...slam(f, t, -6, 1.3) }}>{m.text}</div>
          : <div key={i} data-ov={`中${i + 1}`} style={{ position: "absolute", left: X0 + IWp + 64, top: y, width: IW - IWp - 64, ...zh, whiteSpace: "normal", ...bounce(f, t) }}><Chip text={m.text} bg={c.fill} fg={c.on} px={28} /></div>;
      })}
    </>
  );
};

// ───────── T6 左右對照 ─────────
const SplitView: React.FC<VP> = (vp) => (((vp.p.p as any).layout === "stack") ? <StackSplit {...vp} /> : <SplitSide {...vp} />);
const SplitSide: React.FC<VP> = ({ f, p, tone }) => {
  const q = p.p as any, A = (s: any, fb: number) => p.at(s, fb);
  const WI = 370, tL = A(q.left.at, p.in + 3), tR = A(q.right.at, p.in + 60), tM = A(q.mid?.at, FAR), tAI = A(q.aiAt, p.in + 6);
  const CW = WI + 24, ex = E(f, tL, 12), exM = E(f, tM, 14);
  const wipe = E(f, tR, 16), H = Math.round(800 * (WI / GBOX[2]));
  const ring = (t: number, big = 1) => (f < t ? 0 : 1);
  void ring;
  return (
    <>
      <div style={{ position: "absolute", left: X0, top: TOP + 4, width: CW, display: "flex", justifyContent: "center" }}>
        <div data-ov="標籤左" style={bounce(f, A(q.left.labelAt ?? q.left.at, tL))}><Chip text={q.left.label} bg={col(q.left.color).fill} fg={col(q.left.color).on} px={34} /></div>
      </div>
      <div style={{ position: "absolute", left: X0 + IW - CW, top: TOP + 4, width: CW, display: "flex", justifyContent: "center" }}>
        <div data-ov="標籤右" style={bounce(f, A(q.right.labelAt ?? q.right.at, tR))}><Chip text={q.right.label} bg={col(q.right.color).fill} fg={col(q.right.color).on} px={34} /></div>
      </div>
      {/* 左：草圖 */}
      <div data-ov="左卡" style={{ position: "absolute", left: X0, top: TOP + 90, opacity: O(f, tL, 5), transform: `translateX(${Math.round((1 - ex) * -48)}px) rotate(${(-3 * (1 - ex) - 1.2 * ex).toFixed(2)}deg)` }}>
        <Card color={q.left.color}><Shot src={q.left.src} w={WI}>{null}</Shot></Card>
      </div>
      {f >= tR ? (
        <div data-ov="右卡" style={{ position: "absolute", left: X0 + IW - CW, top: TOP + 90, clipPath: `inset(0 ${(100 * (1 - wipe)).toFixed(1)}% 0 0)` }}>
          <Card color={q.right.color}>
            <Shot src={q.right.src} w={WI}>
              {(() => { const y = 150 + (((f - tR) * 9) % 560); return <g><path d={`M${150} ${y - 38} V${y - 18}`} stroke={T.ink} strokeWidth={4} /><Star cx={150} cy={y} r={22} stroke={T.ink} fill="#fff" /></g>; })()}
              {(() => { const y = 120 + (((f - tR) * 6 + 300) % 600); return <g><path d={`M${380} ${y - 38} V${y - 18}`} stroke={T.ink} strokeWidth={4} /><Star cx={380} cy={y} r={22} stroke={T.ink} fill="#fff" /></g>; })()}
            </Shot>
          </Card>
        </div>
      ) : null}
      {/* 中：AI → 計時 */}
      <div data-ov="AI 圓" style={{ position: "absolute", left: X0 + CW + (IW - 2 * CW) / 2 - 56, top: TOP + 260, width: 112, height: 112, borderRadius: 56, background: col("primary").fill, boxShadow: `0 8px 0 ${col("primary").side}`, display: "flex", alignItems: "center", justifyContent: "center", ...en, fontWeight: 900, fontSize: 52, color: "#fff", opacity: O(f, tAI, 6), transform: `scale(${(1 + 0.06 * Math.sin(f / 6)).toFixed(3)})` }}>AI</div>
      <svg width={IW - 2 * CW} height={50} style={{ position: "absolute", left: X0 + CW, top: TOP + 388 }}>
        {[0, 1, 2].map((i) => <path key={i} d={`M${34 + i * 36} 8 L${58 + i * 36} 25 L${34 + i * 36} 42`} fill="none" stroke={tone.accent} strokeWidth={9} strokeLinecap="round" strokeLinejoin="round" opacity={f < tAI ? 0 : 0.25 + 0.75 * clamp(Math.sin((f - i * 5) / 5))} />)}
      </svg>
      {q.mid ? (
        <div data-ov="計時" style={{ position: "absolute", left: X0 + CW + (IW - 2 * CW) / 2 - 66, top: TOP + 480, width: 132, height: 132, opacity: O(f, tM, 4), transform: `scale(${(0.4 + 0.6 * exM + 0.08 * Math.sin(exM * 3.14)).toFixed(3)})` }}>
          <svg width={132} height={132} viewBox="0 0 160 160"><circle cx={80} cy={80} r={68} fill={T.card} stroke={T.line} strokeWidth={14} /><circle cx={80} cy={80} r={68} fill="none" stroke={col("right").fill} strokeWidth={14} strokeLinecap="round" pathLength={1} strokeDasharray="1" strokeDashoffset={1 - E(f, tM, 40) * 0.8} transform="rotate(-90 80 80)" /></svg>
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", ...zh, fontWeight: 900, fontSize: 38, color: col("right").text }}>{q.mid.text}</div>
        </div>
      ) : null}
    </>
  );
};

// ───────── T5 對話輸入 ─────────
const ChatView: React.FC<VP> = ({ f, p }) => {
  const q = p.p as any, A = (s: any, fb: number) => p.at(s, fb);
  const msgs = (q.msgs ?? []) as { who: "me" | "ai"; text?: string; at: any; typeAt?: any; typeDur?: number; check?: boolean; typingAt?: any; attach?: { src: string; cap: string } }[];
  const T0 = (m: (typeof msgs)[number]) => A(m.at, p.in + 20);
  const typing = msgs.find((m) => m.who === "me" && m.typeAt !== undefined && f >= A(m.typeAt, FAR) && f < T0(m));
  const typed = typing ? Math.round((typing.text ?? "").length * clamp((f - A(typing.typeAt, 0)) / (typing.typeDur ?? 24))) : 0;
  const lastSend = Math.max(...msgs.filter((m) => m.who === "me").map(T0), p.in);
  const chips = (q.chips ?? []) as { text: string; at: any; color: string; hot?: boolean }[];
  return (
    <div style={{ position: "absolute", left: X0, top: TOP, width: IW, height: 780, background: T.card, borderRadius: 36, boxShadow: `0 10px 0 ${T.cardSide}, ${T.depth.soft}` }}>
      <div data-ov="對話標題" style={{ position: "absolute", left: 28, top: 20, height: 60, display: "flex", alignItems: "center", gap: 18 }}>
        <div style={{ width: 58, height: 58, borderRadius: 29, background: col("primary").fill, display: "flex", alignItems: "center", justifyContent: "center", ...en, fontWeight: 900, fontSize: 28, color: "#fff" }}>AI</div>
        <div style={{ ...zh, fontWeight: 900, fontSize: 36, color: T.ink }}>{q.title ?? "和 AI 對話"}</div>
      </div>
      <div data-ov="對話區" style={{ position: "absolute", left: 28, top: 104, width: IW - 56, height: 530, display: "flex", flexDirection: "column", gap: 20, overflow: "hidden" }}>
        <div style={{ alignSelf: "flex-start", ...zh, whiteSpace: "normal", fontWeight: 800, fontSize: 42, padding: "16px 28px", borderRadius: 32, borderBottomLeftRadius: 8, background: "#EEF2FC", color: T.ink, opacity: O(f, p.in, 4) }}>{q.hello ?? "嗨，今天想做什麼？"}</div>
        {f < Math.min(...msgs.map(T0)) ? <div style={{ position: "absolute", left: (IW - 56 - 230) / 2, top: 190, width: 230, height: 230, borderRadius: 115, background: col("primary").fill, boxShadow: `0 10px 0 ${col("primary").side}, 0 0 0 ${Math.round(14 + 10 * Math.sin(f / 6))}px ${col("primary").soft}`, display: "flex", alignItems: "center", justifyContent: "center", ...en, fontWeight: 900, fontSize: 112, color: "#fff", opacity: 1 - O(f, Math.min(...msgs.map(T0)) - 6, 6) }}>AI</div> : null}
        {msgs.map((m, i) => {
          const t = T0(m), me = m.who === "me", e = E(f, t, 10);
          if (f < t) return null;
          return (
            <div key={i} style={{ alignSelf: me ? "flex-end" : "flex-start", opacity: O(f, t, 4), transform: `translateY(${Math.round((1 - e) * 36)}px) scale(${(0.9 + 0.1 * e).toFixed(3)})`, transformOrigin: me ? "100% 100%" : "0 100%" }}>
              {m.attach ? (
                <div style={{ background: col("primary").soft, borderRadius: 28, padding: 10, display: "flex", alignItems: "center", gap: 18 }}>
                  <Shot src={m.attach.src} w={120} box={[10, 80, 520, 790]} style={{ borderRadius: 10 }}>{null}</Shot>
                  <div style={{ ...zh, fontWeight: 800, fontSize: 32, color: T.ink2, paddingRight: 18 }}>{m.attach.cap}</div>
                </div>
              ) : (
                <div style={{ ...zh, whiteSpace: "normal", maxWidth: 760, fontWeight: 800, fontSize: 48, lineHeight: 1.3, padding: "16px 28px", borderRadius: 32, borderBottomRightRadius: me ? 8 : 32, borderBottomLeftRadius: me ? 32 : 8, background: me ? col("primary").fill : "#EEF2FC", color: me ? "#fff" : T.ink, display: "flex", alignItems: "center", gap: 14 }}>
                  {m.check ? <Ico n="check" size={46} color="#fff" fill={col("right").fill} /> : null}{m.text}
                </div>
              )}
            </div>
          );
        })}
        {msgs.filter((m) => m.who === "ai" && m.typingAt !== undefined && f >= A(m.typingAt, FAR) && f < T0(m)).map((m, i) => (
          <div key={`d${i}`} style={{ alignSelf: "flex-start", background: "#EEF2FC", borderRadius: 32, padding: "22px 30px", display: "flex", gap: 12 }}>{[0, 1, 2].map((k) => <div key={k} style={{ width: 18, height: 18, borderRadius: 9, background: T.ink3, transform: `translateY(${(-9 * Math.max(0, Math.sin((f - k * 4) / 4))).toFixed(1)}px)` }} />)}</div>
        ))}
        {chips.length ? (
          <div style={{ display: "flex", gap: 18, marginTop: 6, alignSelf: "flex-end", paddingRight: 20 }}>
            {chips.map((c, i) => { const t = A(c.at, FAR), cc = col(c.color); return f < t ? null : <div key={i} style={{ ...bounce(f, t), boxShadow: c.hot ? `0 0 0 ${Math.round(5 + 4 * Math.sin(f / 4))}px ${cc.soft}` : undefined, borderRadius: 999 }}><Chip text={c.text} bg={cc.fill} fg={cc.on} px={36} /></div>; })}
          </div>
        ) : null}
      </div>
      <div data-ov="輸入框" style={{ position: "absolute", left: 28, bottom: 24, width: IW - 56, height: 110, borderRadius: 55, background: "#F1F4FB", boxShadow: `inset 0 0 0 4px ${T.line}`, display: "flex", alignItems: "center", paddingLeft: 36, paddingRight: 14, boxSizing: "border-box", justifyContent: "space-between" }}>
        <div style={{ ...zh, fontWeight: 700, fontSize: 38, color: typing ? T.ink : T.ink3, overflow: "hidden", maxWidth: IW - 230 }}>{typing ? (typing.text ?? "").slice(0, typed) : "輸入訊息…"}{f % 16 < 9 && f < lastSend + 100 ? <span style={{ display: "inline-block", width: 4, height: 44, background: col("primary").fill, marginLeft: 4, verticalAlign: "middle" }} /> : null}</div>
        <div style={{ width: 82, height: 82, borderRadius: 41, background: col("primary").fill, boxShadow: `0 5px 0 ${col("primary").side}`, display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${(1 + 0.18 * (f >= lastSend - 1 ? Math.max(0, 1 - (f - lastSend) / 8) : 0)).toFixed(3)})` }}>
          <svg width={44} height={44} viewBox="0 0 44 44"><path d="M6 22 H36 M24 9 L37 22 L24 35" fill="none" stroke="#fff" strokeWidth={6} strokeLinecap="round" strokeLinejoin="round" /></svg>
        </div>
      </div>
    </div>
  );
};


const BrowserWide: React.FC<VP> = ({ f, p, tone }) => {
  const q = p.p as any, A = (s: any, fb: number) => p.at(s, fb);
  const shots = q.shots as { src: string; at: any; img: number[]; label?: string }[], WW = IW, VW = WW - 24, VH = 430;
  const k = VW / shots[0].img[0], sc = A(q.scrollAt, FAR), sy = lerp(q.scroll?.[0] ?? 0, q.scroll?.[1] ?? 0, E(f, sc, 34)) * k;
  let cur = 0; shots.forEach((s, i) => { if (f >= A(s.at, FAR)) cur = i; });
  const items = (q.items ?? []) as { text: string; sub?: string; at: any; color: string; icon: IconName }[];
  const IWd = Math.floor((IW - (items.length - 1) * 20) / Math.max(1, items.length)), e0 = E(f, p.in + 2, 12);
  return (
    <>
      <div data-ov="瀏覽器" style={{ position: "absolute", left: X0, top: TOP, width: WW, opacity: O(f, p.in, 4), transform: `translateY(${Math.round((1 - e0) * 50)}px)` }}>
        <Card color="primary" pad={0} style={{ overflow: "hidden" }}>
          <div style={{ height: 76, background: "#EEF2FC", display: "flex", alignItems: "center", gap: 12, padding: "0 20px" }}>
            {["#FF7A5C", "#FFD766", "#19A88A"].map((c) => <div key={c} style={{ width: 20, height: 20, borderRadius: 10, background: c }} />)}
            <div style={{ marginLeft: 10, flex: 1, height: 46, borderRadius: 23, background: "#fff", boxShadow: `inset 0 0 0 3px ${T.line}`, display: "flex", alignItems: "center", paddingLeft: 20, ...zh, fontWeight: 700, fontSize: 28, color: T.ink2 }}>{shots[cur].label ?? "咖啡店首頁"}</div>
          </div>
          <div style={{ position: "relative", width: VW, height: VH, margin: 12, overflow: "hidden", borderRadius: 10 }}>
            <img src={staticFile(shots[cur].src)} style={{ position: "absolute", left: 0, top: -sy, width: VW, display: "block" }} />
            <svg width={VW} height={VH} viewBox={`0 ${sy / k} ${shots[0].img[0]} ${VH / k}`} style={{ position: "absolute", left: 0, top: 0 }}>
              {(q.rings ?? []).filter((r: any) => r.shot === cur).map((r: any, i: number) => <Ring key={i} f={f} at={A(r.at, FAR)} box={r.box} circle={r.circle} color={r.color} sw={10} />)}
            </svg>
          </div>
        </Card>
      </div>
      {items.map((it, i) => {
        const t = A(it.at, FAR), c = col(it.color), on = f >= t, e = E(f, t, 12), left = X0 + i * (IWd + 20), top = TOP + 570;
        return on ? (
          <div key={i} data-ov={`項目${i + 1}`} style={{ position: "absolute", left, top, width: IWd, height: 180, opacity: O(f, t, 4), transform: `translateY(${Math.round((1 - e) * 40)}px)`, background: T.card, borderRadius: 26, boxShadow: `0 8px 0 ${c.side}`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8, padding: "0 10px", boxSizing: "border-box" }}>
            <Ico n={it.icon} size={64} fill={c.soft} />
            <div style={{ ...zh, fontWeight: 900, fontSize: 38, color: T.ink }}>{it.text}</div>
            {it.sub ? <div style={{ ...zh, fontWeight: 700, fontSize: 28, color: T.ink2 }}>{it.sub}</div> : null}
          </div>
        ) : <Ghost key={i} color={c.fill} style={{ left, top, width: IWd, height: 180 }}><div style={{ ...en, fontWeight: 900, fontSize: 60, color: c.fill }}>{i + 1}</div></Ghost>;
      })}
    </>
  );
};

// ───────── T3 瀏覽器視窗（也用在「實測截圖」） ─────────
const BrowserView: React.FC<VP> = (vp) => (((vp.p.p as any).wide) ? <BrowserWide {...vp} /> : <BrowserSide {...vp} />);
const BrowserSide: React.FC<VP> = ({ f, p, tone }) => {
  const q = p.p as any, A = (s: any, fb: number) => p.at(s, fb);
  const WI = 400, H = Math.round(800 * (WI / GBOX[2])), WW = WI + 24;
  const shots = (q.shots ?? []) as { src: string; at: any }[];
  const items = (q.items ?? []) as { text: string; sub?: string; at: any; color: string; icon: IconName; num?: { to: number; from?: number; label: string } }[];
  const tFile = A(q.fileAt, p.in + 3), tOpen = A(q.openAt, p.in + 3);
  const hasFile = q.file && q.openAt !== undefined && A(q.openAt, 0) > p.in + 12;
  const open = !hasFile || f >= tOpen, eo = E(f, tOpen, 12);
  let cur = 0; shots.forEach((s, i) => { if (f >= A(s.at, FAR)) cur = i; });
  return (
    <>
      {/* 開窗之前：檔案卡 */}
      {hasFile && !open ? (
        <div data-ov="檔案卡" style={{ position: "absolute", left: X0, top: TOP, width: WW, height: H + 88, opacity: O(f, tFile, 5), transform: `translateY(${Math.round((1 - E(f, tFile, 14)) * 60 + 8 * Math.sin(f / 9))}px)` }}>
          <Card color="note" pad={0} style={{ width: WW, height: H + 88, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 30 }}>
            <Ico n="file" size={230} fill="#FFF2C6" />
            <Chip text={q.file} bg={col("note").soft} fg={col("note").text} px={34} />
          </Card>
        </div>
      ) : null}
      {open ? (
        <div data-ov="瀏覽器" style={{ position: "absolute", left: X0, top: TOP, width: WW, opacity: O(f, tOpen, 4), transform: `scale(${(0.86 + 0.14 * eo).toFixed(3)})`, transformOrigin: "50% 40%" }}>
          <Card color="primary" pad={0} style={{ overflow: "hidden" }}>
            <div style={{ height: 76, background: "#EEF2FC", display: "flex", alignItems: "center", gap: 12, padding: "0 20px" }}>
              {["#FF7A5C", "#FFD766", "#19A88A"].map((c) => <div key={c} style={{ width: 20, height: 20, borderRadius: 10, background: c }} />)}
              <div style={{ marginLeft: 10, flex: 1, height: 46, borderRadius: 23, background: "#fff", boxShadow: `inset 0 0 0 3px ${T.line}`, display: "flex", alignItems: "center", paddingLeft: 20, ...en, fontWeight: 700, fontSize: 28, color: T.ink2 }}>{q.file ?? "game.html"}</div>
            </div>
            <div style={{ position: "relative", width: WI, height: H, margin: 12 }}>
              {shots.map((s, i) => { const t = A(s.at, FAR); if (f < t && i > 0) return null; const w = i === 0 ? 1 : E(f, t, 12); return (
                <div key={i} style={{ position: "absolute", left: 0, top: 0, zIndex: i, clipPath: `inset(0 0 ${(100 * (1 - w)).toFixed(1)}% 0)` }}>
                  <Shot src={s.src} w={WI}>
                    {(q.rings ?? []).filter((r: any) => r.shot === i).map((r: any, k: number) => <Ring key={k} f={f} at={A(r.at, FAR)} box={r.box} circle={r.circle} color={r.color} />)}
                  </Shot>
                </div>); })}
            </div>
          </Card>
        </div>
      ) : null}
      <div style={{ position: "absolute", left: X0 + WW + 32, top: TOP, width: IW - WW - 32 }}>
        {items.map((it, i) => {
          const t = A(it.at, FAR); if (f < t) return <Ghost key={i} color={col(it.color).fill} style={{ left: 0, top: i * 184, width: "100%", height: 156 }}><div style={{ ...en, fontWeight: 900, fontSize: 60, color: col(it.color).fill }}>{i + 1}</div></Ghost>; const c = col(it.color), e = E(f, t, 12);
          const last = i === items.length - 1 || f < A(items[i + 1].at, FAR);
          const nv = it.num ? Math.round(lerp(it.num.from ?? 0, it.num.to, E(f, t + 2, 12))) : 0;
          return (
            <div key={i} data-ov={`項目${i + 1}`} style={{ position: "absolute", left: 0, top: i * 184, width: "100%", height: 156, opacity: O(f, t, 4), transform: `translateX(${Math.round((1 - e) * 36)}px) scale(${last ? (1 + 0.025 * Math.sin(f / 5)).toFixed(3) : 1})`, background: T.card, borderRadius: 26, boxShadow: `0 8px 0 ${c.side}`, display: "flex", alignItems: "center", gap: 20, padding: "0 24px", boxSizing: "border-box" }}>
              <div style={{ width: 84, height: 84, borderRadius: 24, background: c.soft, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><Ico n={it.icon} size={58} /></div>
              <div style={{ minWidth: 0 }}>
                <div style={{ ...zh, fontWeight: 900, fontSize: 42, color: T.ink }}>{it.num ? `${it.num.label} ${nv}` : it.text}</div>
                {it.sub ? <div style={{ ...zh, fontWeight: 700, fontSize: 30, color: T.ink2, marginTop: 6 }}>{it.sub}</div> : null}
              </div>
              <div style={{ marginLeft: "auto", flexShrink: 0 }}><Ico n="check" size={52} fill={c.fill} /></div>
            </div>
          );
        })}
      </div>
    </>
  );
};

// ───────── T11 手機框 ─────────
const DeviceView: React.FC<VP> = ({ f, p, tone }) => {
  const q = p.p as any, A = (s: any, fb: number) => p.at(s, fb);
  const tP = A(q.at ?? "start", p.in + 3), tTap = A(q.tapAt, FAR), SW = 330, SH = Math.round(SW * 844 / 390);
  const e = E(f, tP, 14), cards = (q.cards ?? []) as { text: string; sub?: string; at: any; color: string; icon: IconName }[];
  const fx = lerp(SW * 0.75, SW * 0.5, E(f, tTap - 22, 20)), fy = lerp(SH + 40, SH * 0.5, E(f, tTap - 22, 20));
  const press = f >= tTap ? Math.max(0, 1 - (f - tTap) / 26) : 0;
  return (
    <>
      <div data-ov="手機" style={{ position: "absolute", left: X0 + 30 + Math.round((1 - e) * -50), top: TOP + Math.round(8 * Math.sin(f / 14)), opacity: O(f, tP, 5), transform: `rotate(${(-3 * (1 - e) + 1.2).toFixed(2)}deg)` }}>
        <div style={{ width: SW + 40, padding: 20, borderRadius: 56, background: T.ink, boxShadow: `0 12px 0 #0E1530, ${T.depth.soft}` }}>
          <div style={{ position: "relative", width: SW, height: SH, borderRadius: 34, overflow: "hidden", background: "#FAF6EC" }}>
            <img src={staticFile(q.src)} style={{ width: SW, height: SH, display: "block", objectFit: "cover" }} />
            {f >= tTap - 22 ? <>
              <div style={{ position: "absolute", left: SW / 2 - 90 * (1 - press) - 40, top: SH * 0.5 - 90 * (1 - press) - 40, width: 80 + 180 * (1 - press), height: 80 + 180 * (1 - press), borderRadius: 999, border: `8px solid ${col("right").fill}`, opacity: f >= tTap ? press : 0 }} />
              <div style={{ position: "absolute", left: fx - 36, top: fy - 36, transform: `scale(${(1 - 0.2 * Math.min(1, press * 3)).toFixed(3)})`, opacity: O(f, tTap - 22, 6) }}><Ico n="tap" size={96} fill="#fff" /></div>
            </> : null}
          </div>
        </div>
      </div>
      <div style={{ position: "absolute", left: X0 + SW + 120, top: TOP + 40, width: IW - SW - 120 }}>
        {cards.map((c, i) => { const t = A(c.at, FAR); if (f < t) return <Ghost key={i} color={col(c.color).fill} style={{ left: 0, top: i * 250, width: "100%", height: 220 }}><Ico n={c.icon} size={90} color={col(c.color).fill} fill="#fff" /></Ghost>; const cc = col(c.color), ee = E(f, t, 12); return (
          <div key={i} data-ov={`卡${i + 1}`} style={{ position: "absolute", left: 0, top: i * 250, width: "100%", minHeight: 220, opacity: O(f, t, 4), transform: `translateX(${Math.round((1 - ee) * 36)}px)`, background: T.card, borderRadius: 30, boxShadow: `0 8px 0 ${cc.side}`, padding: "26px 26px", boxSizing: "border-box" }}>
            <div style={{ width: 84, height: 84, borderRadius: 24, background: cc.soft, display: "flex", alignItems: "center", justifyContent: "center" }}><Ico n={c.icon} size={58} /></div>
            <div style={{ ...zh, fontWeight: 900, fontSize: 44, color: T.ink, marginTop: 14 }}>{c.text}</div>
            {c.sub ? <div style={{ ...zh, fontWeight: 700, fontSize: 30, color: T.ink2, marginTop: 6 }}>{c.sub}</div> : null}
          </div>); })}
      </div>
    </>
  );
};

// ───────── T9 放大鏡圈出 ─────────
const LensView: React.FC<VP> = ({ f, p, tone }) => {
  const q = p.p as any, A = (s: any, fb: number) => p.at(s, fb);
  const WI = 420, k = WI / GBOX[2], tI = A(q.at ?? "start", p.in + 3), tScr = A(q.scanAt, FAR), tLap = A(q.stampAt, FAR), tA = A(q.noteAt, FAR);
  const e = E(f, tI, 14), box = q.ring as number[];
  const cx = (box[0] + box[2] / 2 - GBOX[0]) * k, cy = (box[1] + box[3] / 2 - GBOX[1]) * k;
  const m = E(f, tScr - 6, 22), mx = lerp(WI * 0.7, cx + 30, m) + (f > tScr + 16 ? 8 * Math.sin(f / 6) : 0), my = lerp(WI * 0.2, cy - 10, m) + (f > tScr + 16 ? 5 * Math.cos(f / 5) : 0);
  const ZW = IW - (WI + 24) - 36, z = q.zoom, ZH = Math.round(ZW * (z.h / z.w));
  return (
    <>
      <div data-ov="大圖" style={{ position: "absolute", left: X0, top: TOP, opacity: O(f, tI, 5), transform: `translateX(${Math.round((1 - e) * -48)}px) rotate(${(-3 * (1 - e)).toFixed(2)}deg)` }}>
        <Card color="wrong" style={{ position: "relative" }}>
          <Shot src={q.src} w={WI}>
            <Ring f={f} at={tScr + 14} box={box} color="wrong" sw={8} />
          </Shot>
          {f >= tScr - 6 && f < tLap + 40 ? <div style={{ position: "absolute", left: 12 + mx - 40, top: 12 + my - 40, opacity: O(f, tScr - 6, 4) * (1 - O(f, tLap + 28, 10)) }}><Ico n="mag" size={100} color={T.ink} fill="rgba(255,255,255,0.55)" /></div> : null}
        </Card>
      </div>
      <div style={{ position: "absolute", left: X0 + WI + 24 + 36, top: TOP, width: ZW }}>
        <div data-ov="說明條" style={{ ...bounce(f, A(q.noteAt, p.in + 8)), display: "inline-block" }}><Chip text={q.note} bg={col("wrong").soft} fg={col("wrong").text} px={34} /></div>
        {f < tScr ? <Ghost ov="放大空位" color={tone.accent} style={{ left: 0, top: 110, width: ZW, height: ZH + 56 }}><div style={{ transform: `scale(${(1 + 0.06 * Math.sin(f / 6)).toFixed(3)})` }}><Ico n="mag" size={150} color={tone.accent} fill="#fff" /></div></Ghost> : null}
        {f >= tScr ? (
          <div data-ov="放大圖" style={{ position: "absolute", left: 0, top: 110, width: ZW, ...riseIn(f, tScr, 40) }}>
            <Card color="wrong"><div style={{ width: ZW - 24, height: ZH, borderRadius: 12, overflow: "hidden" }}><img src={staticFile(z.src)} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} /></div><div style={{ ...zh, fontWeight: 900, fontSize: 32, color: col("wrong").text, textAlign: "center", marginTop: 8 }}>{z.cap}</div></Card>
          </div>
        ) : null}
        {f >= tLap ? <div data-ov="蓋章" style={{ position: "absolute", left: ZW / 2 - 130, top: 110 + ZH + 140, ...slam(f, tLap, -8, 1.3) }}><div style={{ width: 260, height: 260, borderRadius: 130, border: `14px solid ${col("wrong").fill}`, display: "flex", alignItems: "center", justifyContent: "center", ...zh, fontWeight: 900, fontSize: 150, color: col("wrong").fill, background: "rgba(255,255,255,0.7)" }}>{q.stamp}</div></div> : null}
      </div>
    </>
  );
};

// ───────── T2 大字動態 ─────────
const KineticView: React.FC<VP> = ({ f, p, tone }) => {
  const q = p.p as any, A = (s: any, fb: number) => p.at(s, fb), rows = (q.rows ?? []) as { big: string; unit: string; at: any; color: string; size?: number; usize?: number }[];
  const RP = (r: { size?: number }) => (r.size ? Math.round(r.size * 1.04) + 10 : 270);
  const rowTop = (i: number) => TOP + 20 + rows.slice(0, i).reduce((a, r) => a + RP(r), 0), rowsEnd = rowTop(rows.length);
  const tQ = A(q.q?.at, FAR), eq = E(f, tQ, 16);
  return (
    <>
      {rows.map((r, i) => { const t = A(r.at, p.in + 3), e = E(f, t, 14), c = col(r.color); if (f < t) return <Ghost key={i} color={c.fill} style={{ left: X0, top: rowTop(i) + 20, width: IW, height: RP(r) - 40, ...zh, fontWeight: 900, fontSize: 150, color: c.fill }}>？</Ghost>; return (
        <div key={i} data-ov={`大字${i + 1}`} style={{ position: "absolute", left: X0, top: rowTop(i), width: IW, height: RP(r) - 30, display: "flex", alignItems: "center", gap: 34, opacity: O(f, t, 4) }}>
          <div style={{ perspective: 900 }}><div style={{ ...zh, fontWeight: 900, fontSize: r.size ?? 330, lineHeight: 1, color: c.fill, textShadow: `0 10px 0 ${c.side}`, transform: `translateY(${(6 * Math.sin(f / 10 + i * 2)).toFixed(1)}px) rotate(${(1.6 * Math.sin(f / 17 + i)).toFixed(2)}deg) rotateX(${((1 - e) * -90).toFixed(1)}deg) scale(${(1 + 0.06 * Math.sin(Math.min(1, e) * 3.14)).toFixed(3)})`, transformOrigin: "50% 100%" }}>{r.big}</div></div>
          <div style={{ ...zh, fontWeight: 900, fontSize: r.usize ?? 120, color: T.ink, transform: `translateX(${Math.round((1 - e) * 80)}px)` }}>{r.unit}</div>
        </div>); })}
      {q.q && f < tQ ? <Ghost color={col("plum").fill} style={{ left: X0, top: rowsEnd, width: IW, height: 190, ...zh, fontWeight: 900, fontSize: 120, color: col("plum").fill }}>？</Ghost> : null}
      {q.q && f >= tQ ? (
        <div data-ov="問號卡" style={{ position: "absolute", left: X0, top: rowsEnd, width: IW, height: 190, background: T.card, borderRadius: 40, boxShadow: `0 10px 0 ${col("plum").side}`, display: "flex", alignItems: "center", gap: 36, padding: "0 40px", boxSizing: "border-box", opacity: O(f, tQ, 4), transform: `translateY(${Math.round((1 - eq) * 100)}px)` }}>
          <div style={{ ...zh, fontWeight: 900, fontSize: 170, color: col("plum").fill, transform: `translateY(${(-14 * Math.abs(Math.sin(f / 9))).toFixed(1)}px) rotate(${(8 * Math.sin(f / 11)).toFixed(1)}deg)` }}>？</div>
          <div style={{ ...zh, fontWeight: 900, fontSize: 64, color: T.ink }}>{q.q.text}</div>
        </div>
      ) : null}
    </>
  );
};

// ───────── T8 流程路徑 ─────────
const FlowView: React.FC<VP> = ({ f, p, tone }) => {
  const q = p.p as any, A = (s: any, fb: number) => p.at(s, fb), nodes = q.nodes as { icon: IconName; label: string; sub: string; color: string; at: any }[];
  const NW = 280, NH = 420, gap = (IW - 3 * NW) / 2, y0 = TOP + 40, cxs = nodes.map((_, i) => X0 + i * (NW + gap) + NW / 2);
  const tN = nodes.map((n, i) => A(n.at, p.in + 3 + i * 6)), tLoop = A(q.loopAt, FAR), tChip = A(q.chipAt, FAR);
  const midY = y0 + 150;
  // 光點：節點之間沿線移動（lightAt 兩個時間：到站出發）
  const legs = (q.lights ?? []) as { from: any; to: any }[];
  let dot = null as { x: number; y: number } | null;
  legs.forEach((lg, i) => { const a = A(lg.from, FAR), b = A(lg.to, FAR); if (f >= a && f <= b + 3) dot = { x: lerp(cxs[i] + NW / 2, cxs[i + 1] - NW / 2, clamp((f - a) / Math.max(1, b - a))), y: midY }; });
  const loopPath = `M${cxs[2]} ${y0 + NH + 6} V${y0 + NH + 190} H${cxs[1]} V${y0 + NH + 14}`;
  const lp = E(f, tLoop, 26);
  const ld = f >= tLoop + 26 ? ((f - tLoop - 26) % 60) / 60 : -1;
  return (
    <>
      <svg width={L.W} height={L.H} style={{ position: "absolute", left: 0, top: 0 }}>
        {[0, 1].map((i) => <path key={i} d={`M${cxs[i] + NW / 2 + 4} ${midY} H${cxs[i + 1] - NW / 2 - 4}`} stroke={tone.accent} strokeWidth={7} strokeDasharray="4 16" strokeLinecap="round" fill="none" opacity={f < tN[i + 1] - 24 ? 0 : 0.9} strokeDashoffset={-(f * 0.6) % 20} />)}
        {tLoop < FAR ? <path d={loopPath} fill="none" stroke={col("wrong").fill} strokeWidth={8} strokeDasharray="4 18" strokeLinecap="round" pathLength={1} style={{ strokeDasharray: `${lp} 2`, strokeDashoffset: 0 }} /> : null}
        {tLoop < FAR && lp > 0.97 ? <path d={`M${cxs[1] - 18} ${y0 + NH + 40} L${cxs[1]} ${y0 + NH + 12} L${cxs[1] + 18} ${y0 + NH + 40}`} fill="none" stroke={col("wrong").fill} strokeWidth={8} strokeLinecap="round" strokeLinejoin="round" /> : null}
        {dot ? <circle cx={dot.x} cy={dot.y} r={16} fill={col("primary").fill} stroke="#fff" strokeWidth={5} /> : null}
        {ld >= 0 ? (() => { const pts = [[cxs[2], y0 + NH + 6], [cxs[2], y0 + NH + 190], [cxs[1], y0 + NH + 190], [cxs[1], y0 + NH + 14]]; const segs = [144, cxs[2] - cxs[1], 136], tot = segs[0] + segs[1] + segs[2]; let d = ld * tot, i = 0; while (i < 2 && d > segs[i]) { d -= segs[i]; i++; } const a = pts[i], b = pts[i + 1]; return <circle cx={lerp(a[0], b[0], d / segs[i])} cy={lerp(a[1], b[1], d / segs[i])} r={13} fill={col("wrong").fill} stroke="#fff" strokeWidth={4} />; })() : null}
      </svg>
      {nodes.map((n, i) => f < tN[i] ? <Ghost key={`g${i}`} ov={undefined} color={col(n.color).fill} style={{ left: cxs[i] - NW / 2, top: y0, width: NW, height: NH, ...en, fontWeight: 900, fontSize: 120, color: col(n.color).fill }}>{i + 1}</Ghost> : null)}
      {nodes.map((n, i) => { if (f < tN[i]) return null; const e = E(f, tN[i], 14), c = col(n.color), lit = f >= tN[i] && f < tN[i] + 40; return (
        <div key={i} data-ov={`節點${i + 1}`} style={{ position: "absolute", left: cxs[i] - NW / 2, top: y0 + Math.round((1 - e) * 90 + 7 * Math.sin(f / 12 + i * 2)), width: NW, height: NH, opacity: O(f, tN[i], 4), transform: `scale(${(lit ? 1 + 0.05 * Math.sin((f - tN[i]) / 4) : 1).toFixed(3)})`, background: T.card, borderRadius: 36, boxShadow: `0 10px 0 ${c.side}`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16, padding: "0 12px", boxSizing: "border-box" }}>
          <div style={{ width: 190, height: 190, borderRadius: 48, background: c.soft, display: "flex", alignItems: "center", justifyContent: "center" }}><Ico n={n.icon} size={130} fill={c.soft} /></div>
          <div style={{ ...zh, fontWeight: 900, fontSize: 52, color: T.ink }}>{n.label}</div>
          <div style={{ ...zh, fontWeight: 700, fontSize: 30, color: T.ink2 }}>{n.sub}</div>
          <div style={{ position: "absolute", left: -16, top: -16, width: 56, height: 56, borderRadius: 28, background: c.fill, color: c.on, ...en, fontWeight: 900, fontSize: 34, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 4px 0 ${c.side}` }}>{i + 1}</div>
        </div>); })}
      {q.chip && f >= tChip ? <div data-ov="迴圈標籤" style={{ position: "absolute", left: (cxs[1] + cxs[2]) / 2 - 300, width: 600, top: y0 + NH + 230, display: "flex", justifyContent: "center", ...bounce(f, tChip) }}><Chip text={q.chip} bg={col("wrong").fill} fg="#fff" px={44} /></div> : null}
    </>
  );
};

// ───────── T12 領取卡 ─────────
const ClaimView: React.FC<VP> = ({ f, p, tone }) => {
  const q = p.p as any, A = (s: any, fb: number) => p.at(s, fb), tK = A(q.kwAt, p.in + 3), tAll = A(q.allAt, FAR), chars = String(q.keyword).split("");
  const eA = E(f, tAll, 14);
  return (
    <>
      <div data-ov="引言卡" style={{ position: "absolute", left: X0, top: TOP + 4, width: IW, ...riseIn(f, p.in + 3, 40), background: T.card, borderRadius: 32, boxShadow: `0 8px 0 ${col("note").side}`, padding: "30px 40px", boxSizing: "border-box", textAlign: "center" }}>
        <div style={{ ...zh, fontWeight: 900, fontSize: 52, color: T.ink }}>{q.kicker}</div>
      </div>
      {f < tK - 10 ? <Ghost color={col("primary").fill} style={{ left: X0 + 56, top: TOP + 180, width: IW - 112, height: 340, borderRadius: 64 }}><Ico n="bubble" size={150} color={col("primary").fill} fill="#fff" /></Ghost> : null}
      <div data-ov="留言泡泡" style={{ position: "absolute", left: X0 + 56, top: TOP + 180, width: IW - 112, height: 340, background: col("primary").fill, borderRadius: 64, borderBottomLeftRadius: 14, boxShadow: `0 12px 0 ${col("primary").side}`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", opacity: O(f, tK - 10, 4), transform: `scale(${(0.9 + 0.1 * E(f, tK - 10, 12)).toFixed(3)})` }}>
        <div style={{ ...zh, fontWeight: 800, fontSize: 40, color: "#DDE2FF", marginBottom: 8 }}>在貼文下留言</div>
        <div style={{ display: "flex", gap: 10 }}>{chars.map((c, i) => <div key={i} style={{ ...zh, fontWeight: 900, fontSize: 240, lineHeight: 1.1, color: "#fff", opacity: O(f, tK + i * 6, 4), transform: `translateY(${Math.round((1 - E(f, tK + i * 6, 8)) * -70)}px) rotate(${i ? 3 : -3}deg)` }}>{c}</div>)}</div>
      </div>
      {f < tAll ? <Ghost color={col("right").fill} style={{ left: X0, top: TOP + 570, width: IW, height: 170 }}><Ico n="file" size={80} color={col("right").fill} fill="#fff" /></Ghost> : null}
      {f >= tAll ? (
        <div data-ov="範本卡" style={{ position: "absolute", left: X0, top: TOP + 570, width: IW, opacity: O(f, tAll, 4), transform: `translateY(${Math.round((1 - eA) * 60)}px)`, background: T.card, borderRadius: 32, boxShadow: `0 8px 0 ${col("right").side}`, padding: "30px 40px", boxSizing: "border-box", display: "flex", alignItems: "center", gap: 28 }}>
          <div style={{ width: 100, height: 100, borderRadius: 28, background: col("right").soft, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><Ico n="file" size={72} fill="#fff" /></div>
          <div><div style={{ ...zh, fontWeight: 900, fontSize: 50, color: T.ink }}>{q.card}</div><div style={{ ...zh, fontWeight: 700, fontSize: 34, color: T.ink2, marginTop: 8 }}>{q.sub}</div></div>
        </div>
      ) : null}
    </>
  );
};

// ───────── 共用：虛線空位（開頭 0.3 秒內版面就有東西，不留大片空白） ─────────
// 2026-11-16 Andy：虛線空位／問號／灰編號一律拿掉，下一項到 cue 才進場
const Ghost: React.FC<{ style: React.CSSProperties; color: string; ov?: string; children?: React.ReactNode }> = () => null;

const bounceOut = (t: number) => { const n = 7.5625, d = 2.75; if (t < 1 / d) return n * t * t; if (t < 2 / d) { t -= 1.5 / d; return n * t * t + 0.75; } if (t < 2.5 / d) { t -= 2.25 / d; return n * t * t + 0.9375; } t -= 2.625 / d; return n * t * t + 0.984375; };
const CheckMark: React.FC<{ t: number; size: number; color: string; bad?: boolean }> = ({ t, size, color, bad }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" style={{ display: "block", flexShrink: 0 }}>
    <circle cx={32} cy={32} r={28} fill={t > 0 ? color : "none"} stroke={t > 0 ? color : T.ink3} strokeWidth={5} strokeDasharray={t > 0 ? undefined : "6 8"} />
    <path d={bad ? "M21 21 L43 43 M43 21 L21 43" : "M18 33 L28 43 L47 22"} fill="none" stroke="#fff" strokeWidth={7} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray="1" strokeDashoffset={1 - t} />
  </svg>
);
/** 一行字裡的一段做螢光標記（從左掃到右） */
const MarkText: React.FC<{ text: string; mark?: string; t: number; hl?: string; fg?: string }> = ({ text, mark, t, hl = "#FFD766", fg }) => {
  const i = mark ? text.indexOf(mark) : -1;
  if (i < 0) return <>{text}</>;
  return <>{text.slice(0, i)}<span style={{ backgroundImage: `linear-gradient(${hl},${hl})`, backgroundRepeat: "no-repeat", backgroundSize: `${(100 * t).toFixed(1)}% 100%`, color: t > 0.5 ? T.ink : fg, borderRadius: 8, padding: "0 4px" }}>{mark}</span>{text.slice(i + mark!.length)}</>;
};

// ───────── T4 程式編輯器（深色；唯一的深色段） ─────────
type CodeLine = { t: string; n?: number; at: any; dur?: number; mark?: string; markAt?: any; kind?: "out"; ok?: boolean };
const ED = { bg: "#1F2440", bar: "#2B3254", txt: "#E8ECFF", dim: "#8A93C0", num: "#6B74A6", out: "#7BE0C3" };
const EditorView: React.FC<VP> = ({ f, p, tone }) => {
  const q = p.p as any, A = (s: any, fb: number) => p.at(s, fb);
  const lines = q.lines as CodeLine[], wrap = !!q.wrap, fs = q.size ?? (wrap ? 40 : 38);
  const tags = (q.tags ?? []) as { text: string; at: any; color: string }[], hasBadge = !!q.badge || tags.length > 0, WH = q.badge ? 660 : tags.length ? 700 : (q.height ?? 780);
  const nums: number[] = []; lines.forEach((l, i) => nums.push(l.n ?? (i ? nums[i - 1] + 1 : (q.start ?? 1))));
  type Row = { k: "line"; i: number } | { k: "skel"; n: number; w: number } | { k: "fold"; c: number } | { k: "div" };
  const rows: Row[] = [];
  const first = nums[0], before = q.before ?? 1, after = q.after ?? 1;
  for (let b = before; b >= 1; b--) if (first - b >= 1) rows.push({ k: "skel", n: first - b, w: 260 + ((first - b) * 97) % 380 });
  lines.forEach((l, i) => {
    if (i && nums[i] - nums[i - 1] > 1) rows.push({ k: "fold", c: nums[i] - nums[i - 1] - 1 });
    if (l.kind === "out" && lines[i - 1]?.kind !== "out") rows.push({ k: "div" });
    rows.push({ k: "line", i });
  });
  const last = nums[nums.length - 1];
  for (let a = 1; a <= after; a++) rows.push({ k: "skel", n: last + a, w: 220 + ((last + a) * 131) % 420 });
  const tLine = lines.map((l, i) => A(l.at, p.in + 4 + i * 12));
  const durOf = (l: CodeLine) => l.dur ?? Math.max(14, Math.min(34, Math.round(l.t.length * 1.1)));
  let cur = -1; lines.forEach((l, i) => { if (f >= tLine[i]) cur = i; });
  const tTot = A(q.total?.at, FAR), tot = q.total ? Math.round(E(f, tTot, 40) * q.total.to) : 0;
  const tHl = A(q.hlAt, FAR), eHl = E(f, tHl, 10);
  const tSh = A(q.shrinkAt ?? q.total?.at, FAR), thumb = lerp(0.62, 0.05, E(f, tSh, 26));
  const bd = q.badge, tB = A(bd?.at, FAR), cb = col(bd?.color ?? "primary");
  const gut = 116, TXTW = IW - gut - 90;
  return (
    <>
      <div data-ov="編輯器" style={{ position: "absolute", left: X0, top: TOP, width: IW, height: WH, background: ED.bg, borderRadius: 30, boxShadow: `0 10px 0 #0E1330, ${T.depth.soft}`, overflow: "hidden", opacity: O(f, p.in, 4) }}>
        <div style={{ height: 76, background: ED.bar, display: "flex", alignItems: "center", gap: 14, padding: "0 24px" }}>
          {["#FF7A5C", "#FFD766", "#19A88A"].map((c) => <div key={c} style={{ width: 20, height: 20, borderRadius: 10, background: c }} />)}
          <div style={{ marginLeft: 14, height: 52, borderRadius: 14, background: ED.bg, display: "flex", alignItems: "center", gap: 12, padding: "0 20px", ...en, fontWeight: 700, fontSize: 30, color: ED.txt, ...({ transform: `translateY(${Math.round((1 - E(f, A(q.fileAt, p.in + 2), 10)) * -20)}px)` }) }}><Ico n="file" size={34} color={ED.txt} fill="none" />{q.file}</div>
        </div>
        <div style={{ position: "absolute", left: 0, top: 76, width: gut, bottom: 64, background: "#262C4D" }} />
        <div style={{ position: "absolute", left: 0, top: 76, width: IW, bottom: 64, padding: "10px 0", boxSizing: "border-box", overflow: "hidden", display: "flex", flexDirection: "column", gap: 8 }}>
          {rows.map((r, ri) => {
            if (r.k === "skel") return <div key={ri} style={{ display: "flex", alignItems: "center", minHeight: 58 }}><div style={{ width: gut, textAlign: "right", paddingRight: 26, boxSizing: "border-box", ...en, fontWeight: 700, fontSize: 28, color: ED.num }}>{r.n}</div><div style={{ marginLeft: 26, width: r.w, height: 18, borderRadius: 9, background: ED.bar, opacity: 0.9 }} /></div>;
            if (r.k === "fold") return <div key={ri} style={{ display: "flex", alignItems: "center", minHeight: 58 }}><div style={{ width: gut, textAlign: "right", paddingRight: 26, boxSizing: "border-box", ...en, fontWeight: 700, fontSize: 28, color: ED.num }}>⋯</div><div style={{ marginLeft: 26, ...zh, fontWeight: 700, fontSize: 30, color: ED.dim }}>省略 {r.c} 行</div></div>;
            if (r.k === "div") { const t0 = Math.min(...lines.filter((l) => l.kind === "out").map((l) => A(l.at, FAR))); return <div key={ri} style={{ display: "flex", alignItems: "center", minHeight: 70, opacity: O(f, t0 - 6, 6) }}><div style={{ width: gut }} /><div style={{ marginLeft: 26, ...zh, fontWeight: 800, fontSize: 32, color: ED.out, border: `3px solid ${ED.out}`, borderRadius: 16, padding: "4px 20px" }}>{q.outLabel ?? "實測回答（節錄）"}</div></div>; }
            const l = lines[r.i], t0 = tLine[r.i], pr = clamp((f - t0) / durOf(l)), n = Math.ceil(l.t.length * pr);
            const tm = A(l.markAt, FAR), isHl = q.hl === r.i && f >= tHl, out = l.kind === "out";
            const shown = f < t0 ? "" : l.t.slice(0, n);
            const curNow = cur === r.i && (f - t0 < durOf(l) + 40);
            return (
              <div key={ri} data-ov={undefined} style={{ display: "flex", alignItems: "flex-start", minHeight: wrap ? 0 : 66, background: isHl ? `rgba(255,215,102,${(0.16 * eHl).toFixed(3)})` : "transparent", position: "relative" }}>
                {isHl ? <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 8, background: "#FFD766", opacity: eHl }} /> : null}
                <div style={{ width: gut, textAlign: "right", paddingRight: 26, boxSizing: "border-box", ...en, fontWeight: 700, fontSize: 28, lineHeight: "66px", color: isHl ? "#FFD766" : ED.num }}>{out ? (f >= t0 ? "▶" : "") : nums[r.i]}</div>
                <div style={{ marginLeft: 26, width: TXTW, ...zh, whiteSpace: wrap ? "normal" : "nowrap", fontWeight: 700, fontSize: fs, lineHeight: wrap ? 1.4 : "66px", color: out ? ED.out : ED.txt, letterSpacing: 0.5 }}>
                  {f >= tm && l.mark ? <MarkText text={shown} mark={l.mark} t={E(f, tm, 10)} fg={ED.txt} /> : shown}
                  {curNow && f % 16 < 9 ? <span style={{ display: "inline-block", width: 14, height: fs, background: "#FFD766", marginLeft: 4, verticalAlign: "middle" }} /> : null}
                  {l.ok && pr >= 1 ? <span style={{ display: "inline-block", marginLeft: 16, verticalAlign: "middle", ...bounce(f, t0 + durOf(l)) }}><Ico n="check" size={50} color="#fff" fill={col("right").fill} /></span> : null}
                </div>
              </div>
            );
          })}
        </div>
        <div style={{ position: "absolute", right: 22, top: 100, bottom: 84, width: 14, borderRadius: 7, background: ED.bar }}><div style={{ position: "absolute", left: 0, top: 0, width: 14, height: `${(thumb * 100).toFixed(1)}%`, borderRadius: 7, background: ED.dim }} /></div>
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 64, background: ED.bar, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 30px", boxSizing: "border-box", ...zh, fontWeight: 700, fontSize: 30, color: ED.dim }}>
          <span>{cur >= 0 ? `第 ${nums[cur]} 行` : "第 1 行"}</span>
          <span style={{ color: q.total && f >= tTot ? "#FFD766" : ED.dim }}>{q.total ? `共 ${tot} 行` : (q.status2 ?? "")}</span>
        </div>
      </div>
      {bd ? (
        <div data-ov="徽章" style={{ position: "absolute", left: X0, top: TOP + WH + 24, width: IW, height: 130, background: T.card, borderRadius: 30, boxShadow: `0 8px 0 ${cb.side}`, display: "flex", alignItems: "center", gap: 30, padding: "0 40px", boxSizing: "border-box", opacity: O(f, tB, 4), transform: `scale(${(0.92 + 0.08 * E(f, tB, 10)).toFixed(3)})` }}>
          <div style={{ ...en, fontWeight: 900, fontSize: 96, color: cb.fill, textShadow: `0 6px 0 ${cb.side}`, minWidth: 330 }}>{bd.num}</div>
          <div style={{ ...zh, fontWeight: 900, fontSize: 52, color: T.ink }}>{bd.unit}</div>
        </div>
      ) : null}
      {tags.length ? (
        <div style={{ position: "absolute", left: X0, top: TOP + WH + 30, width: IW, display: "flex", gap: 18, justifyContent: "center", flexWrap: "wrap" }}>
          {tags.map((c, i) => { const t = A(c.at, FAR), cc = col(c.color); return f < t ? <div key={i} style={{ opacity: 0 }}><Chip text={c.text} bg={cc.fill} fg={cc.on} px={34} /></div> : <div key={i} data-ov={`標籤${i + 1}`} style={bounce(f, t)}><Chip text={c.text} bg={cc.fill} fg={cc.on} px={34} /></div>; })}
        </div>
      ) : null}
    </>
  );
};

// ───────── T7 抽籤筒／骰子（搖、彈出、落地回彈） ─────────
const PIPS: Record<number, number[][]> = { 1: [[1, 1]], 2: [[0, 0], [2, 2]], 3: [[0, 0], [1, 1], [2, 2]], 4: [[0, 0], [2, 0], [0, 2], [2, 2]], 5: [[0, 0], [2, 0], [1, 1], [0, 2], [2, 2]], 6: [[0, 0], [2, 0], [0, 1], [2, 1], [0, 2], [2, 2]] };
const Die: React.FC<{ face: number; size: number }> = ({ face, size }) => (
  <svg width={size} height={size} viewBox="0 0 200 200" style={{ display: "block" }}>
    <rect x={8} y={14} width={184} height={184} rx={40} fill="#C9CEE8" /><rect x={8} y={6} width={184} height={184} rx={40} fill="#fff" stroke={T.ink} strokeWidth={7} />
    {PIPS[face].map(([a, b], i) => <circle key={i} cx={52 + a * 48} cy={50 + b * 48} r={15} fill={face === 1 ? col("wrong").fill : T.ink} />)}
  </svg>
);
const DrawView: React.FC<VP> = ({ f, p, tone }) => {
  const q = p.p as any, A = (s: any, fb: number) => p.at(s, fb);
  const rounds = q.rounds as { label: string; at: any; from?: any; pick?: number; face?: number; color: string }[];
  const note = q.note ? <div data-ov="示意" style={{ position: "absolute", left: X0, top: TOP + 784, width: IW, textAlign: "center", ...zh, fontWeight: 800, fontSize: 32, color: T.ink2 }}>{q.note}</div> : null;
  if (q.mode === "dice") {
    const DS = 260, tD = rounds.map((r, i) => A(r.at, p.in + 6 + i * 20)), tNe = A(q.diffAt, FAR), xs = [X0 + 70, X0 + IW - 70 - DS];
    return (
      <>
        <div data-ov="引言" style={{ position: "absolute", left: X0, top: TOP + 4, width: IW, height: 130, background: T.card, borderRadius: 32, boxShadow: `0 8px 0 ${col("primary").side}`, display: "flex", alignItems: "center", justifyContent: "center", ...zh, fontWeight: 900, fontSize: 60, color: T.ink, ...riseIn(f, p.in + 2, 14) }}>{q.kicker}</div>
        <div style={{ position: "absolute", left: X0, top: TOP + 450, width: IW, height: 130, borderRadius: 40, background: "rgba(255,255,255,0.7)", boxShadow: `inset 0 0 0 5px ${T.line}` }} />
        {rounds.map((r, i) => {
          const t = tD[i], u = clamp((f - t) / 30), dy = f < t ? -110 : -110 * (1 - bounceOut(u)), rot = f < t ? 0 : 180 * (1 - E(f, t, 30)), landed = f >= t + 30;
          return (
            <React.Fragment key={i}>
              {f < t ? <Ghost color={col(r.color).fill} style={{ left: xs[i], top: TOP + 310, width: DS, height: DS, borderRadius: 50, ...zh, fontWeight: 900, fontSize: 150, color: col(r.color).fill }}>？</Ghost> : null}
              <div style={{ position: "absolute", left: xs[i] + 20, top: TOP + 560, width: DS - 40, height: 30, borderRadius: 15, background: "rgba(30,36,80,0.18)", transform: `scale(${(0.5 + 0.5 * bounceOut(u)).toFixed(3)})`, opacity: f < t ? 0 : 1 }} />
              <div data-ov={`骰子${i + 1}`} style={{ position: "absolute", left: xs[i], top: TOP + 310 + dy, width: DS, height: DS, transform: `rotate(${rot.toFixed(1)}deg)`, opacity: f < t - 2 ? 0 : 1 }}><Die face={r.face ?? 1} size={DS} /></div>
              <div data-ov={`骰標${i + 1}`} style={{ position: "absolute", left: xs[i] - 20, top: TOP + 620, width: DS + 40, display: "flex", justifyContent: "center", opacity: landed ? 1 : 0.0, ...(landed ? bounce(f, t + 30) : {}) }}><Chip text={`${r.label}・${r.face} 點`} bg={col(r.color).fill} fg={col(r.color).on} px={34} /></div>
            </React.Fragment>
          );
        })}
        {f >= tNe ? <div data-ov="不等號" style={{ position: "absolute", left: X0 + IW / 2 - 90, top: TOP + 360, width: 180, height: 180, borderRadius: 90, background: col("wrong").fill, boxShadow: `0 8px 0 ${col("wrong").side}`, display: "flex", alignItems: "center", justifyContent: "center", ...en, fontWeight: 900, fontSize: 120, color: "#fff", ...slam(f, tNe, -6, 1.3) }}>≠</div> : null}
        {note}
      </>
    );
  }
  // 抽籤筒
  const opts = q.options as string[], TW = 340, TH = 520, tx = X0 + 60, ty = TOP + 190;
  const shakeOf = (): number => { let s = Math.sin(f / 9) * 1.2; rounds.forEach((r) => { const a = A(r.from, FAR), b = A(r.at, FAR); if (f >= a && f < b) s = 6 * Math.sin((f - a) * 1.15) * Math.min(1, (f - a) / 6); }); return s; };
  const flown = rounds.map((r) => r.pick as number);
  const tAt = rounds.map((r, i) => A(r.at, p.in + 20 + i * 40));
  const stickX = [96, 148, 200, 252], stickTop = [34, 64, 22, 54], stickRot = [-7, 3, 5, -3];
  const cardTop = (i: number) => ty + i * 290;
  return (
    <>
      <div data-ov="題目" style={{ position: "absolute", left: X0, top: TOP + 4, width: IW, height: 150, background: T.card, borderRadius: 32, boxShadow: `0 8px 0 ${col("primary").side}`, display: "flex", alignItems: "center", justifyContent: "center", gap: 18, ...riseIn(f, p.in + 2, 14) }}>
        <div style={{ ...zh, fontWeight: 900, fontSize: 56, color: T.ink }}>{q.stem}</div>
      </div>
      <div data-ov="籤筒" style={{ position: "absolute", left: tx, top: ty, width: TW, height: TH, transform: `rotate(${shakeOf().toFixed(2)}deg) scale(0.9)`, transformOrigin: "50% 100%", opacity: O(f, p.in, 4) }}>
        <svg width={TW} height={TH} viewBox={`0 0 ${TW} ${TH}`}>
          {stickX.map((x, i) => { const r = flown.indexOf(i); const gone = r >= 0 && f >= tAt[r]; return gone ? null : <g key={i} transform={`rotate(${stickRot[i]} ${x} 240)`}><rect x={x - 22} y={stickTop[i]} width={44} height={240} rx={12} fill={["#FFF2C6", "#D8F4EB", "#DCEFFC", "#FFE3DB"][i]} stroke={T.ink} strokeWidth={5} /><rect x={x - 22} y={stickTop[i]} width={44} height={46} rx={12} fill={col(["note", "right", "sky", "wrong"][i]).fill} stroke={T.ink} strokeWidth={5} /></g>; })}
          <path d="M52 232 H288 V470 Q288 500 258 500 H82 Q52 500 52 470 Z" fill={col("note").fill} stroke={T.ink} strokeWidth={7} strokeLinejoin="round" />
          <rect x={52} y={232} width={236} height={34} fill={col("note").side} stroke={T.ink} strokeWidth={6} />
          <circle cx={170} cy={375} r={62} fill="#fff" stroke={T.ink} strokeWidth={6} /><text x={170} y={400} textAnchor="middle" fontSize={78} fontWeight={900} fill={T.ink} style={{ fontFamily: FONT_ZH }}>籤</text>
        </svg>
      </div>
      {rounds.map((r, i) => {
        const t = tAt[i], u = clamp((f - t) / 22), c = col(r.color), landed = f >= t + 22, pick = opts[r.pick as number];
        const sx = tx + 170, sy = ty + 150, ex = X0 + 470 + 241, ey = cardTop(i) + 120;
        const px = lerp(sx, ex, E(f, t, 22)), py = lerp(sy, ey, E(f, t, 22)) - 100 * Math.sin(Math.PI * u), rot = 720 * (1 - E(f, t, 22)) - 8;
        return (
          <React.Fragment key={i}>
            <Ghost ov={landed ? undefined : `空位${i + 1}`} color={landed ? "transparent" : tone.accent} style={{ left: X0 + 470, top: cardTop(i), width: 482, height: 240, flexDirection: "column", gap: 8, opacity: landed ? 0 : 0.55 }}><div style={{ ...zh, fontWeight: 900, fontSize: 44, color: T.ink3 }}>{r.label}</div></Ghost>
            {landed ? (
              <div data-ov={`籤卡${i + 1}`} style={{ position: "absolute", left: X0 + 470, top: cardTop(i), width: 482, height: 240, background: T.card, borderRadius: 30, boxShadow: `0 8px 0 ${c.side}`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10, ...slam(f, t + 22, 0, 1.12) }}>
                <Chip text={r.label} bg={c.soft} fg={c.text} px={28} />
                <div style={{ ...zh, fontWeight: 900, fontSize: 84, color: c.fill, textShadow: `0 5px 0 ${c.side}` }}>{pick}</div>
              </div>
            ) : null}
            {f >= t && f < t + 22 ? <div style={{ position: "absolute", left: px - 90, top: py - 36, width: 180, height: 72, borderRadius: 18, background: c.fill, border: `5px solid ${T.ink}`, boxSizing: "border-box", display: "flex", alignItems: "center", justifyContent: "center", ...zh, fontWeight: 900, fontSize: 40, color: c.on, transform: `rotate(${rot.toFixed(1)}deg)` }}>{pick}</div> : null}
          </React.Fragment>
        );
      })}
      {note}
    </>
  );
};

// ───────── T10 清單／格子時間軸（一格一格亮起、打勾） ─────────
const CheckView: React.FC<VP> = ({ f, p, tone }) => {
  const q = p.p as any, A = (s: any, fb: number) => p.at(s, fb);
  if (q.mode === "grid") {
    const N = q.cells as number, cols = q.cols ?? 4, rws = Math.ceil(N / cols), gap = 28, cw = Math.floor((IW - (cols - 1) * gap) / cols), ch = 250;
    const t0 = A(q.litAt, p.in + 4), st = q.stagger ?? 5, tF = A(q.focus?.at, FAR), tL = A(q.link?.at, FAR), eL = E(f, tL, 30);
    const cx = (i: number) => (i % cols) * (cw + gap) + cw / 2, cy = (i: number) => Math.floor(i / cols) * (ch + gap) + ch / 2;
    const path = Array.from({ length: N }, (_, i) => `${i ? "L" : "M"}${cx(i)} ${cy(i)}`).join(" ");
    return (
      <div style={{ position: "absolute", left: X0, top: TOP + 10, width: IW }}>
        <svg width={IW} height={rws * (ch + gap)} style={{ position: "absolute", left: 0, top: 0 }}>
          <path d={path} fill="none" stroke={col("sky").fill} strokeWidth={10} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={`${eL} 1.2`} />
        </svg>
        {Array.from({ length: N }, (_, i) => {
          const t = t0 + i * st, on = f >= t, e = E(f, t, 10), foc = q.focus && f >= tF && (q.focus.cell ?? 0) === i, c = col(i % 2 ? "primary" : "right");
          if (!on) return null;
          return (
            <div key={i} data-ov={`格${i + 1}`} style={{ position: "absolute", left: (i % cols) * (cw + gap), top: Math.floor(i / cols) * (ch + gap), width: cw, height: ch, borderRadius: 30, background: on ? T.card : "rgba(255,255,255,0.45)", boxShadow: on ? `0 8px 0 ${c.side}` : `inset 0 0 0 5px ${T.line}`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6, transform: `scale(${(on ? (foc ? 1.06 + 0.02 * Math.sin(f / 5) : 0.9 + 0.1 * e + 0.06 * Math.sin(Math.min(1, e) * 3.14)) : 0.94).toFixed(3)})` }}>
              <div style={{ ...en, fontWeight: 900, fontSize: 116, color: on ? c.fill : T.ink3, lineHeight: 1 }}>{i + 1}</div>
              <div style={{ ...zh, fontWeight: 800, fontSize: 40, color: on ? T.ink : T.ink3 }}>{(q.label ?? "第 {n} 句").replace("{n}", String(i + 1))}</div>
            </div>
          );
        })}
        {q.focus ? <div data-ov="焦點卡" style={{ position: "absolute", left: 0, top: rws * (ch + gap) + 20, width: IW, height: 150, background: T.card, borderRadius: 32, boxShadow: `0 8px 0 ${col("note").side}`, display: "flex", alignItems: "center", justifyContent: "center", gap: 22, ...zh, fontWeight: 900, fontSize: 56, color: T.ink, opacity: O(f, tF, 4), transform: `translateY(${Math.round((1 - E(f, tF, 12)) * 50)}px)` }}><Ico n="pencil" size={74} fill={col("note").soft} />{q.focus.text}</div>
          : <Ghost ov="" style={{ display: "none" }} color="#000" />}
      </div>
    );
  }
  const items = q.items as { text: string; sub?: string; at: any; color?: string; bad?: boolean; mark?: string; markAt?: any; big?: boolean }[];
  const head = q.head, tH = A(head?.at, p.in + 3), tS = A(q.stamp?.at, FAR);
  return (
    <>
      <div data-ov="清單標題" style={{ position: "absolute", left: X0, top: TOP + 4, width: q.stamp ? IW - 200 : IW, height: 150, background: T.card, borderRadius: 32, boxShadow: `0 8px 0 ${col(head?.color ?? "primary").side}`, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 40px", boxSizing: "border-box", ...riseIn(f, tH, 14) }}>
        <div style={{ ...zh, fontWeight: 900, fontSize: 56, color: T.ink }}>{head?.text}</div>
              </div>
      {q.stamp && f >= tS ? <div data-ov="蓋章" style={{ position: "absolute", left: X0 + IW - 170, top: TOP - 6, width: 170, height: 170, borderRadius: 85, border: `12px solid ${col(q.stamp.color).fill}`, background: "rgba(255,255,255,0.8)", display: "flex", alignItems: "center", justifyContent: "center", ...zh, fontWeight: 900, fontSize: 70, color: col(q.stamp.color).fill, ...slam(f, tS, -12, 1.1) }}>{q.stamp.text}</div> : null}
      {items.map((it, i) => {
        const t = A(it.at, FAR), on = f >= t, e = E(f, t, 12), c = col(it.color ?? (it.bad ? "wrong" : "right"));
        const h = it.big ? 470 : 190, top = TOP + 190 + items.slice(0, i).reduce((a, x) => a + (x.big ? 470 : 190) + 26, 0);
        const tm = A(it.markAt, FAR);
        if (!on) return null;
        return (
          <div key={i} data-ov={`項目${i + 1}`} style={{ position: "absolute", left: X0, top: top, width: IW, height: h, borderRadius: 32, background: on ? T.card : "rgba(255,255,255,0.5)", boxShadow: on ? `0 8px 0 ${c.side}` : `inset 0 0 0 5px ${T.line}`, display: "flex", alignItems: "center", gap: 30, padding: "0 36px", boxSizing: "border-box", opacity: on ? 1 : 0.7, transform: `translateX(${on ? Math.round((1 - e) * 30) : 0}px)` }}>
            <CheckMark t={on ? E(f, t + 2, 12) : 0} size={it.big ? 110 : 92} color={c.fill} bad={it.bad} />
            <div style={{ minWidth: 0 }}>
              <div style={{ ...zh, whiteSpace: "normal", fontWeight: 900, fontSize: it.big ? 64 : 52, lineHeight: 1.3, color: on ? T.ink : T.ink3 }}>{on && it.mark ? <MarkText text={it.text} mark={it.mark} t={f >= tm ? E(f, tm, 10) : 0} hl={col("wrong").soft} /> : it.text}</div>
              {it.sub ? <div style={{ ...zh, fontWeight: 700, fontSize: 34, color: T.ink2, marginTop: 8 }}>{it.sub}</div> : null}
            </div>
          </div>
        );
      })}
    </>
  );
};

// ───────── T13 資料圖（方格填色／長條），一律標「示意」 ─────────
const ChartView: React.FC<VP> = ({ f, p, tone }) => {
  const q = p.p as any, A = (s: any, fb: number) => p.at(s, fb);
  const chips = (q.chips ?? []) as { text: string; at: any; color: string }[];
  const tail = (top: number) => (
    <>
      <div style={{ position: "absolute", left: X0, top, width: IW, display: "flex", gap: 18, justifyContent: "center", flexWrap: "wrap" }}>
        {chips.map((c, i) => { const t = A(c.at, FAR), cc = col(c.color); return f < t ? <div key={i} style={{ opacity: 0.0 }}><Chip text={c.text} bg={cc.fill} fg={cc.on} px={34} /></div> : <div key={i} data-ov={`標籤${i + 1}`} style={bounce(f, t)}><Chip text={c.text} bg={cc.fill} fg={cc.on} px={34} /></div>; })}
      </div>
      {q.note ? <div data-ov="示意" style={{ position: "absolute", left: X0, top: top + 96, width: IW, textAlign: "center", ...zh, fontWeight: 800, fontSize: 32, color: T.ink2 }}>{q.note}</div> : null}
    </>
  );
  if (q.kind === "bars") {
    const its = q.items as { t: string; h: number; color: string }[], BW = 190, BG = Math.floor((IW - its.length * BW) / (its.length - 1 || 1)), base = TOP + 520, MH = 440;
    const tG = A(q.growAt, p.in + 4), tM = A(q.mark?.at, FAR);
    return (
      <>
        <svg width={L.W} height={L.H} style={{ position: "absolute", left: 0, top: 0 }}><rect x={X0 - 10} y={base} width={IW + 20} height={10} rx={5} fill={T.ink3} opacity={0.6} /></svg>
        {its.map((b, i) => { const g = E(f, tG + i * 5, 22), c = col(b.color), h = Math.max(8, b.h * MH * g), mk = q.mark && q.mark.idx === i && f >= tM; return (
          <React.Fragment key={i}>
            <div data-ov={`長條${i + 1}`} style={{ position: "absolute", left: X0 + i * (BW + BG), top: base - h, width: BW, height: h, borderRadius: "22px 22px 6px 6px", background: c.fill, boxShadow: `0 8px 0 ${c.side}`, outline: mk ? `8px solid ${T.ink}` : undefined, outlineOffset: 6 }} />
            <div style={{ position: "absolute", left: X0 + i * (BW + BG) - 20, top: base + 26, width: BW + 40, textAlign: "center", ...zh, fontWeight: 900, fontSize: 44, color: T.ink }}>{b.t}</div>
          </React.Fragment>); })}
        {q.mark && f >= tM ? <div data-ov="長條標記" style={{ position: "absolute", left: X0 + (q.mark.idx ?? 0) * (BW + BG) + BW + 36, top: base - its[q.mark.idx ?? 0].h * MH - 6, ...bounce(f, tM) }}><Chip text={q.mark.text} bg={col("right").fill} fg="#fff" px={34} /></div> : null}
        {tail(base + 100)}
      </>
    );
  }
  const cols = q.cols as number, rws = q.rows as number, gap = 12, cell = Math.min(Math.floor((IW - (cols - 1) * gap) / cols), Math.floor((q.maxH ?? 600) / rws) - gap), gw = cols * cell + (cols - 1) * gap, gx = X0 + Math.floor((IW - gw) / 2), gy = TOP + 20;
  const groups = q.groups as { n: number; color: string; at: any; gs?: number }[];
  let acc = 0; const owner: { g: number; k: number }[] = [];
  groups.forEach((g, gi) => { for (let k = 0; k < g.n; k++) owner[acc++] = { g: gi, k }; });
  const tB = A(q.box?.at, FAR), bg = q.box ? groups[q.box.group] : null;
  let bx = [0, 0, 0, 0];
  if (bg) { const s0 = groups.slice(0, q.box.group).reduce((a, x) => a + x.n, 0), idxs = Array.from({ length: bg.n }, (_, k) => s0 + k), cs = idxs.map((i) => Math.floor(i / rws)), rs = idxs.map((i) => i % rws); bx = [gx + Math.min(...cs) * (cell + gap) - 8, gy + Math.min(...rs) * (cell + gap) - 8, (Math.max(...cs) - Math.min(...cs) + 1) * (cell + gap) - gap + 16, (Math.max(...rs) - Math.min(...rs) + 1) * (cell + gap) - gap + 16]; }
  return (
    <>
      {Array.from({ length: cols * rws }, (_, i) => {
        const o = owner[i], g = o ? groups[o.g] : null, t = g ? A(g.at, FAR) + o.k * (g.gs ?? 1.2) : FAR, on = f >= t, c = g ? col(g.color) : col("primary"), e = E(f, t, 8);
        return <div key={i} data-ov={undefined} style={{ position: "absolute", left: gx + Math.floor(i / rws) * (cell + gap), top: gy + (i % rws) * (cell + gap), width: cell, height: cell, borderRadius: Math.round(cell * 0.2), background: on ? c.fill : "rgba(255,255,255,0.6)", boxShadow: on ? `0 6px 0 ${c.side}` : `inset 0 0 0 4px ${T.line}`, transform: `scale(${on ? (0.6 + 0.4 * e + 0.12 * Math.sin(Math.min(1, e) * 3.14)).toFixed(3) : 1})` }} />;
      })}
      {q.box && f >= tB ? <svg width={L.W} height={L.H} style={{ position: "absolute", left: 0, top: 0 }}><rect x={bx[0]} y={bx[1]} width={bx[2]} height={bx[3]} rx={22} fill="none" stroke={T.ink} strokeWidth={9} strokeDasharray="1" pathLength={1} strokeDashoffset={1 - E(f, tB, 14)} /></svg> : null}
      {tail(gy + rws * (cell + gap) + 30)}
    </>
  );
};

const VIEWS: Record<string, React.FC<VP>> = { editor: EditorView, draw: DrawView, check: CheckView, chart: ChartView, split: SplitView, chat: ChatView, browser: BrowserView, device: DeviceView, lens: LensView, kinetic: KineticView, flow: FlowView, claim: ClaimView };
export const VIEW6 = Object.keys(VIEWS);

export const VarietyIso: React.FC<Script & { timeline: TimelineV2 }> = ({ scenes, timeline, channel, ...rest }) => {
  const f = useCurrentFrame();
  const ov = !!(rest as any).ovcheck;
  const [hdl] = useState(() => (ov ? delayRender("ovcheck") : 0));
  useLayoutEffect(() => {
    if (!ov) return;
    const eff = (el: Element | null) => { let o = 1; while (el && el !== document.body) { o *= Number(getComputedStyle(el).opacity); el = el.parentElement; } return o; };
    const boxes = Array.from(document.querySelectorAll("[data-ov]")).map((el) => { const r = el.getBoundingClientRect(); return { n: el.getAttribute("data-ov"), x: r.x, y: r.y, w: r.width, h: r.height, o: eff(el), ovf: (el as HTMLElement).scrollWidth > (el as HTMLElement).clientWidth + 2 }; }).filter((b) => b.w > 1 && b.h > 1 && b.o > 0.5);
    const small: { t: string; fs: number }[] = [];
    document.querySelectorAll("div,span").forEach((el) => { const tn = Array.from(el.childNodes).filter((c) => c.nodeType === 3 && (c.textContent ?? "").trim()); if (tn.length && eff(el) > 0.5) { const fs = parseFloat(getComputedStyle(el).fontSize); if (fs < 28) small.push({ t: (el.textContent ?? "").slice(0, 12), fs }); } });
    console.log("OVREPORT " + JSON.stringify({ f, boxes, small, desk: null, objs: [] }));
    continueRender(hdl);
  });
  const mapped = useMemo(() => scenes.map((s) => ({ ...s, props: { ...(s.props as any), panel: (s.props as any)?.view ?? (s.props as any)?.panel } })) as typeof scenes, [scenes]);
  const panels = useMemo(() => buildIso(mapped, timeline), [mapped, timeline]);
  const by = Object.fromEntries(timeline.scenes.map((x) => [x.id, x]));
  const ordered = scenes.filter((s) => by[s.id]);
  const caps: Cap[] = ordered.filter((s) => by[s.id].subtitleWindow).map((s) => ({ en: s.subtitle.en, window: by[s.id].subtitleWindow as [number, number], phrases: by[s.id].lines.map((l) => ({ ...l, text: l.text.replace(/[，、；：。]+$/, "") })), keywords: s.keywords ?? [], kw: ((s.props as any)?.kw ?? {}) as Record<string, string> }));
  const srcs = ordered.map((s) => ({ sources: s.sources, window: by[s.id].sourceWindow }));
  const endP = panels.find((x) => x.kind === "caffend");
  const world = panels.filter((x) => x.kind !== "caffend");
  const inEnd = !!endP && f >= endP.in;
  const curI = Math.max(0, world.reduce((a, x, i) => (x.in <= f ? i : a), 0)), cur = world[curI], prev = world[curI - 1];
  const wipe = curI === 0 ? 1 : E(f, cur.in, 12);
  const asOf = String((scenes[0].props as any)?.asOf ?? "");
  const tracker = ((rest as any).tracker ?? [["草圖", "note"], ["AI 寫程式", "primary"], ["能玩", "right"]]) as [string, string][];
  const trk = (cur?.p as any)?.track;
  return (
    <AbsoluteFill style={{ background: T.bg }}>
      {prev ? <ToneBg tone={(prev.p as any).tone} f={f} /> : null}
      <div style={{ position: "absolute", inset: 0, clipPath: wipe >= 1 ? undefined : `circle(${Math.round(wipe * 2300)}px at 50% 78%)` }}><ToneBg tone={(inEnd ? world[world.length - 1] : cur)?.p.tone as string} f={f} /></div>
      {inEnd ? null : <Bands on={typeof trk === "number" ? trk : -1} steps={tracker} />}
      {inEnd ? null : world.map((x) => {
        if (f < x.in || f >= x.out) return null;
        const V = VIEWS[String((x.p as any).view)]; if (!V) return null;
        const prog = clamp((f - x.in) / Math.max(1, x.out - x.in)), exit = 1 - O(f, x.out - 6, 6);
        return <div key={x.sid} style={{ position: "absolute", inset: 0, opacity: exit, transform: `scale(${(1 + 0.016 * prog).toFixed(4)})`, transformOrigin: "50% 45%" }}><V f={f} p={x} tone={toneOf((x.p as any).tone)} /></div>;
      })}
      {inEnd ? null : world.map((x) => <Tag key={x.sid} f={f} p={x} />)}
      {inEnd ? null : <AsOf text={asOf} />}
      {inEnd ? <CaffEndcard f={f - endP!.in} keyword={String(endP!.p.keyword ?? "")} /> : null}
      {inEnd ? null : <HeaderIso name={channel?.name ?? "AI"} tag={channel?.tag ?? ""} right={channel?.slogan} progress={Math.min(1, f / Math.max(1, timeline.totalFrames - 1))} logo />}
      {inEnd ? null : <Caption cues={caps} f={f} />}
      {inEnd ? null : <SourceLine cues={srcs} f={f} />}
      {timeline.voice ? <Audio src={staticFile(timeline.voice.file)} /> : timeline.scenes.filter((t) => t.audio).map((t) => <Sequence key={`${t.id}-audio`} from={t.audioFrame} durationInFrames={Math.ceil(t.audioSec * FPS) + 1} layout="none"><Audio src={staticFile(t.audio as string)} /></Sequence>)}
    </AbsoluteFill>
  );
};
export const CoverVariety: React.FC<Script> = ({ channel }) => <AbsoluteFill style={{ background: T.bg }}><ToneBg tone="event" f={0} /><HeaderIso name={channel?.name ?? "AI"} tag="" right={channel?.slogan} progress={0} logo /></AbsoluteFill>;

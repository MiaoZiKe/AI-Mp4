// 3D 產品台（styleVersion 3 ＋ stage: "three"；對外稱 v4）：畫面中間是一個 @remotion/three 的 3D 舞台，
// 外面一圈（背景、鉤子大標、零件標籤與引線、頁首、字幕卡、出處）是 HTML。標籤位置用和 3D 同一台相機投影（engine.ts）。
// 全專案只有 src/components/three/ 可以用 three.js。渲染要 gl: "swangle"（scripts/lib.mjs 依 stage 自動切換）。
import React, { useMemo } from "react";
import { AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import type { Script, TimelineV2 } from "../../types";
import { FONT_EN, FONT_ZH, FPS, LAYOUT_3D as L, THEME_3D as T, accent3D } from "../../theme";
import type * as THREE from "three";
import { EASE, seeded, tween } from "../anim";
import { buildModel, cameraFor, projectPoint, signalLevel, signalVal, stateAt, type Label3D, type Model3D, type State3D } from "./engine";
import { col, fxOf, type Fx, type ProductModel } from "./model";
import { ProductScene } from "./Scene";
import { Caption3D, Header3D, Source3D } from "./Tracks";
import { Overlays } from "./Overlays";

const px = (n: number) => Math.round(n);
const zh = (size: number, weight: number = T.weight.body, color: string = T.ink): React.CSSProperties => ({ fontFamily: FONT_ZH, fontWeight: weight, fontSize: size, color, whiteSpace: "nowrap" });

/** 攝影棚背景：淺灰底＋下半部地面色帶＋細格線（躺下後地面才看得到透視格）。鏡頭推近時格線跟著放大一點、四角壓暗（景深感的替代品） */
const Backdrop: React.FC<{ lay: number; fo?: number; fx?: Fx }> = ({ lay, fo = 0, fx }) => (
  <AbsoluteFill style={{ background: T.bg }}>
    <div style={{ position: "absolute", left: 0, right: 0, top: L.STAGE_TOP + 560, bottom: 0, background: T.floor }} />
    <svg width={L.W} height={L.H} style={{ position: "absolute", left: 0, top: 0, opacity: 0.35 + 0.65 * lay - 0.3 * fo, transform: `scale(${(1 + 0.07 * fo).toFixed(4)})`, transformOrigin: "50% 45%", filter: fx?.backdropBlur && fo > 0.01 ? `blur(${(fx.backdropBlur * fo).toFixed(1)}px)` : undefined }}>
      {Array.from({ length: 9 }, (_, i) => { const x = 540 + (i - 4) * 150; return <line key={i} x1={x} y1={L.STAGE_TOP + 560} x2={540 + (i - 4) * 330} y2={L.CAP_TOP + 30} stroke={T.grid} strokeWidth={2} />; })}
      {[0, 70, 160, 280, 440].map((d, i) => <line key={`h${i}`} x1={0} x2={L.W} y1={L.STAGE_TOP + 560 + d} y2={L.STAGE_TOP + 560 + d} stroke={T.grid} strokeWidth={2} />)}
    </svg>
    {fx?.vignette !== false && fo > 0.01 ? <div style={{ position: "absolute", left: 0, top: L.STAGE_TOP - 80, width: L.W, height: L.STAGE_H + 80, opacity: fo, maskImage: "linear-gradient(180deg, transparent 0%, black 22%, black 78%, transparent 100%)", WebkitMaskImage: "linear-gradient(180deg, transparent 0%, black 22%, black 78%, transparent 100%)", background: `linear-gradient(90deg, ${T.vignette[1]} 0%, ${T.vignette[0]} 30%, ${T.vignette[0]} 70%, ${T.vignette[1]} 100%)` }} /> : null}
  </AbsoluteFill>
);

/** 分層時的殘影與導引線（畫在模型後面，所以只在層與層之間的空隙看得到）：
 *  殘影＝每一層前 3／6／9 幀所在位置的外框；導引線＝把各層四個角連起來的虛線，分開多少就長多少 */
const Trails: React.FC<{ m: Model3D; s: State3D; f: number; fx: Fx }> = ({ m, s, f, fx }) => {
  const pr = m.product;
  if (f < m.explode || s.fo >= 1 || (!fx.ghost && !fx.guides)) return null;
  const cam = cameraFor(s);
  const rect = (d: (typeof pr.layers)[number]) => { const [w, h, cx, cy] = d.outline ?? [pr.size.w, pr.size.h, 0, 0]; return [[cx - w / 2, cy - h / 2], [cx + w / 2, cy - h / 2], [cx + w / 2, cy + h / 2], [cx - w / 2, cy + h / 2]]; };
  const poly = (st: State3D, c: THREE.PerspectiveCamera, d: (typeof pr.layers)[number]) => rect(d).map((q) => { const p = projectPoint(st, c, d.id, [q[0], q[1], 0]); return `${p.x.toFixed(1)},${p.y.toFixed(1)}`; }).join(" ");
  const ghosts: React.ReactNode[] = [];
  // 殘影只在「躺平之後、各層分開」的時候畫（躺下的過程整支在轉，畫出來會像線框亂飛）
  if (fx.ghost && s.lay >= 0.999) [3, 6, 9].forEach((lag, gi) => {
    const ps = stateAt(m, f - lag), pc = cameraFor(ps);
    pr.layers.forEach((d) => {
      if (ps.lay < 0.999 || Math.abs(ps.layers[d.id].z - s.layers[d.id].z) < 0.12 || s.layers[d.id].opacity < 0.2) return;
      ghosts.push(<polygon key={`${d.id}${lag}`} points={poly(ps, pc, d)} fill="none" stroke={T.ink3} strokeWidth={3} strokeLinejoin="round" opacity={[0.5, 0.32, 0.16][gi] * s.layers[d.id].opacity} />);
    });
  });
  const sorted = [...pr.layers].sort((a, b) => a.k - b.k);
  const open = Math.max(...sorted.map((d) => s.layers[d.id].e)) * (1 - s.fo);
  return (
    <svg width={L.W} height={L.H} style={{ position: "absolute", left: 0, top: 0 }}>
      {fx.guides && open > 0.02 ? [0, 1, 2, 3].map((ci) => {
        const full = rect({ id: "", z: 0, k: 0 });
        const pts = sorted.map((d) => projectPoint(s, cam, d.id, [full[ci][0] * 0.86, full[ci][1] * 0.93, 0]));
        return (
          <g key={ci} opacity={0.75 * open}>
            <polyline points={pts.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ")} fill="none" stroke={T.ink3} strokeWidth={3} strokeDasharray="4 12" strokeLinecap="round" />
          </g>
        );
      }) : null}
      {ghosts}
    </svg>
  );
};

/** 微塵光斑：開場與收尾比較明顯，中間很淡；固定 seed，慢慢飄 */
const DUST = (() => { const r = seeded(77); return Array.from({ length: T.dust.n }, () => ({ x: r(), y: r(), r: 10 + r() * 34, vx: (r() - 0.5) * 0.9, vy: -0.2 - r() * 0.7, ph: r() * 6.28, o: 0.4 + r() * 0.6 })); })();
const Dust: React.FC<{ m: Model3D; f: number }> = ({ m, f }) => {
  const env = T.dust.rest + (T.dust.peak - T.dust.rest) * Math.max(1 - tween(f, 16, 40, EASE.move), tween(f, m.total - 26, 22, EASE.move));
  return (
    <svg width={L.W} height={L.STAGE_H} style={{ position: "absolute", left: 0, top: L.STAGE_TOP }}>
      <defs><radialGradient id="dust3d"><stop offset="0" stopColor={T.dust.color} stopOpacity={1} /><stop offset="0.5" stopColor={T.dust.color} stopOpacity={0.5} /><stop offset="1" stopColor={T.dust.color} stopOpacity={0} /></radialGradient></defs>
      {DUST.map((d, i) => {
        const x = (((d.x * L.W + d.vx * f) % L.W) + L.W) % L.W, y = (((d.y * L.STAGE_H + d.vy * f) % L.STAGE_H) + L.STAGE_H) % L.STAGE_H;
        const edge = Math.min(1, y / 120, (L.STAGE_H - y) / 120);
        return <circle key={i} cx={x.toFixed(1)} cy={y.toFixed(1)} r={d.r} fill="url(#dust3d)" opacity={(env * d.o * edge * (0.75 + 0.25 * Math.sin(f * 0.07 + d.ph))).toFixed(3)} />;
      })}
    </svg>
  );
};

/** 鉤子：第 0 幀就在的大標；拆開時往上退場 */
const Hook: React.FC<{ m: Model3D; f: number }> = ({ m, f }) => {
  if (!m.hook) return null;
  const out = tween(f, m.explode - 4, 8, EASE.exit);
  if (out >= 1) return null;
  const a = accent3D("blue");
  const d = tween(f, m.drop - 2, 8, EASE.enter), under = tween(f, m.drop - 2, 10, EASE.move);
  return (
    <div style={{ position: "absolute", left: L.X + 4, top: L.HOOK_TOP, opacity: 1 - out, transform: `translateY(${px(-36 * out)}px)` }}>
      {m.hook.kicker ? <div style={{ display: "inline-block", ...zh(30, T.weight.body, T.panel), background: T.ink, borderRadius: T.radius.pill, padding: "10px 26px", letterSpacing: "0.1em" }}>{m.hook.kicker}</div> : null}
      <div style={{ display: "flex", alignItems: "center", gap: 20, marginTop: 10 }}>
        <div style={{ ...zh((m.hook as any).size ?? 132, T.weight.zh), lineHeight: 1.2, letterSpacing: "0.01em" }}>
          {m.hook.title}
          <div style={{ height: 12, width: `${(100 * under).toFixed(1)}%`, background: a.fill, borderRadius: 6, marginTop: 2 }} />
        </div>
        {/* 水滴：念到「一點水」時落下 */}
        <svg width={104} height={132} viewBox="0 0 52 66" style={{ opacity: d, transform: `translateY(${px(-46 * (1 - d))}px) scale(${(0.6 + 0.4 * d).toFixed(3)})` }}>
          <path d="M26 3 C26 3 5 30 5 43 a21 21 0 0 0 42 0 C47 30 26 3 26 3 Z" fill={a.fill} />
          <path d="M15 44 a11 11 0 0 0 9 10" fill="none" stroke={T.panel} strokeWidth={4} strokeLinecap="round" />
        </svg>
      </div>
    </div>
  );
};

/** 零件標籤：圓點釘在零件上（投影位置，先彈出一圈波紋），引線從圓點畫到標籤，標籤出現時一道光掃過 */
const Labels: React.FC<{ m: Model3D; s: State3D; f: number; fx: Fx }> = ({ m, s, f, fx }) => {
  const cam = useMemo(() => cameraFor(s), [s]);
  const A = m.product.anchors;
  // 同一個零件只留最新的一張；rename 把那張的字換掉
  const shown = m.labels.filter((l) => f >= l.at - 2).filter((l, _, arr) => !arr.some((o) => o !== l && o.part === l.part && o.at > l.at));
  // 退場：標籤自己寫的 until；沒寫的話，聚焦之後不在主角那一層的標籤退場
  const gone = (l: Label3D) => (l.until < 1e8 ? l.until : A[l.part]?.layer !== m.focusLayer ? m.focus : 1e9);
  const geom = (l: Label3D) => {
    const an = A[l.part], p = projectPoint(s, cam, an.layer, an.p);
    const rn = m.rename && m.rename.part === l.part && f >= m.rename.at ? m.rename : null;
    const txt = rn ? rn.text : l.text, estW = Math.max([...txt].length * (rn ? 68 : 58), rn?.en ? rn.en.length * 16 : 0) + 64 + L.LABEL_PAD;
    const left = an.dx < 0;
    const x = left ? Math.max(L.X + estW, p.x + an.dx) : Math.min(L.W - L.X - estW, p.x + an.dx), y = p.y + an.dy;
    return { an, p, rn, left, x, y };
  };
  return (
    <>
      <svg width={L.W} height={L.H} style={{ position: "absolute", left: 0, top: 0 }}>
        {shown.map((l, i) => {
          if (!A[l.part]) return null;
          const out = 1 - tween(f, gone(l), 6, EASE.exit);
          const o = tween(f, l.at - 2, 4, EASE.enter) * out;
          if (o <= 0) return null;
          const { p, x, y, left } = geom(l), c = accent3D(l.color);
          // 引線：先斜著走到標籤的高度，再水平接到標籤；用 dashoffset 從圓點那端畫出去
          const kx = x + (left ? 34 : -34), len = Math.hypot(kx - p.x, y - p.y) + 34;
          const q = tween(f, l.at - 1, T.motion.leader, EASE.move);
          const ring = tween(f, l.at - 2, 14, EASE.enter);
          return (
            <g key={i} opacity={o}>
              <path d={`M${p.x.toFixed(1)} ${p.y.toFixed(1)} L${kx.toFixed(1)} ${y.toFixed(1)} L${x.toFixed(1)} ${y.toFixed(1)}`} fill="none" stroke={T.ink} strokeWidth={4} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={`${len.toFixed(1)} ${len.toFixed(1)}`} strokeDashoffset={(len * (1 - q)).toFixed(1)} />
              {ring < 1 ? <circle cx={p.x} cy={p.y} r={13 + 30 * ring} fill="none" stroke={c.fill} strokeWidth={5 * (1 - ring)} opacity={1 - ring} /> : null}
              <circle cx={p.x} cy={p.y} r={13} fill={T.panel} stroke={T.ink} strokeWidth={4} />
              <circle cx={p.x} cy={p.y} r={6} fill={c.fill} />
            </g>
          );
        })}
      </svg>
      {shown.map((l, i) => {
        if (!A[l.part]) return null;
        const o = tween(f, l.at + 3, T.motion.in, EASE.enter) * (1 - tween(f, gone(l), 6, EASE.exit));
        if (o <= 0) return null;
        const { rn, left, x, y } = geom(l), c = accent3D(l.color);
        const t0 = rn ? rn.at : l.at + 3;
        const bump = 1 + 0.08 * Math.sin(Math.PI * tween(f, t0, 10, EASE.move));
        const sh = tween(f, t0 + 2, 14, EASE.move);
        return (
          <div key={i} style={{ position: "absolute", left: px(x), top: px(y), opacity: o, transform: `translate(${left ? "-100%" : "0"}, -50%) scale(${bump.toFixed(3)})`, transformOrigin: left ? "100% 50%" : "0 50%" }}>
            <div style={{ position: "relative", overflow: "hidden", display: "flex", flexDirection: "column", alignItems: left ? "flex-end" : "flex-start", background: T.panel, border: `4px solid ${T.ink}`, borderRadius: T.radius.chip, padding: "8px 26px 10px", boxShadow: T.cardShadow }}>
              <div style={{ ...zh(rn ? 64 : 54, T.weight.zh, c.text), lineHeight: 1.25, letterSpacing: "0.04em" }}>{rn ? rn.text : l.text}</div>
              {rn?.en ? <div style={{ ...zh(26, T.weight.body, T.ink2), fontFamily: FONT_EN, letterSpacing: "0.04em", marginTop: -2 }}>{rn.en}</div> : null}
              {/* 光掃：一道斜的亮帶從左掃到右 */}
              {fx.sheen && sh > 0 && sh < 1 ? <div style={{ position: "absolute", top: -10, bottom: -10, width: 70, left: `${(-30 + 150 * sh).toFixed(1)}%`, transform: "skewX(-20deg)", background: c.soft, opacity: 0.9, mixBlendMode: "multiply" }} /> : null}
            </div>
          </div>
        );
      })}
    </>
  );
};

/** 運作動畫的小儀表（actions 裡 type: "meter"）：釘在標註點旁邊的小卡。bar＝音量條（跟著 source 的大小）、wave＝小波形（畫 traces 列的幾道波） */
const Meters: React.FC<{ m: Model3D; s: State3D }> = ({ m, s }) => {
  const cam = useMemo(() => cameraFor(s), [s]);
  const pr = m.product, O = T.ops;
  return (
    <>
      {Object.entries(pr.actions ?? {}).map(([id, d]) => {
        const op = s.ops[id], an = pr.anchors[d.anchor ?? ""];
        if (d.type !== "meter" || !op || !an || op.k <= 0.01) return null;
        const p = projectPoint(s, cam, an.layer, an.p), c = accent3D(d.accent), W = d.w ?? 250, left = an.dx < 0;
        const x = left ? Math.max(L.X + W + 44, p.x + an.dx) : Math.min(L.W - L.X - W - 44, p.x + an.dx), y = p.y + an.dy;
        const lv = d.source ? signalLevel(pr, s, d.source) : op.g, H = (d as any).h ?? 104, N = (d as any).h ? 72 : 40;
        return (
          <React.Fragment key={id}>
            <svg width={L.W} height={L.H} style={{ position: "absolute", left: 0, top: 0, opacity: op.k }}>
              <path d={`M${p.x.toFixed(1)} ${p.y.toFixed(1)} L${x.toFixed(1)} ${y.toFixed(1)}`} stroke={T.ink} strokeWidth={4} strokeLinecap="round" />
              <circle cx={p.x} cy={p.y} r={9} fill={c.fill} stroke={T.ink} strokeWidth={4} />
            </svg>
            <div style={{ position: "absolute", left: px(x), top: px(y), opacity: op.k, transform: `translate(${left ? "-100%" : "0"}, -50%) scale(${(0.9 + 0.1 * op.k).toFixed(3)})`, transformOrigin: left ? "100% 50%" : "0 50%", background: T.panel, border: `4px solid ${T.ink}`, borderRadius: T.radius.chip, padding: "8px 18px 12px", boxShadow: T.cardShadow, width: W }}>
              {d.label ? <div style={{ ...zh(40, T.weight.zh, c.text), lineHeight: 1.3, letterSpacing: "0.04em" }}>{d.label}</div> : null}
              {d.kind === "wave" ? (
                <svg width={W} height={H} style={{ display: "block", marginTop: 4 }}>
                  <line x1={0} x2={W} y1={H / 2} y2={H / 2} stroke={T.line} strokeWidth={3} />
                  {(d.traces ?? []).map((tid) => {
                    const td = pr.actions?.[tid], amp = td?.type === "sum" ? pr.actions?.[td.of?.[0] ?? ""]?.amp ?? 0.5 : td?.amp ?? 0.5;
                    if (!td || !s.ops[tid]) return null;
                    const pts = Array.from({ length: N + 1 }, (_, i) => `${((i / N) * W).toFixed(1)},${(H / 2 - (signalVal(pr, s, tid, i / N) / amp) * (H / 2 - 8)).toFixed(1)}`).join(" ");
                    return <polyline key={tid} points={pts} fill="none" stroke={col(pr, td.color ?? T.ink)} strokeWidth={6} strokeLinecap="round" strokeLinejoin="round" opacity={s.ops[tid].k} />;
                  })}
                </svg>
              ) : (
                <div style={{ position: "relative", height: 30, marginTop: 8, background: T.line, borderRadius: T.radius.pill, overflow: "hidden" }}>
                  <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: `${(100 * Math.max(O.meterMin, lv)).toFixed(1)}%`, background: c.fill, borderRadius: T.radius.pill }} />
                </div>
              )}
            </div>
          </React.Fragment>
        );
      })}
    </>
  );
};

/** 3D 舞台（1080×990，頁首下面到字幕卡上面） */
const Stage: React.FC<{ s: State3D; model: ProductModel }> = ({ s, model }) => {
  const fx = fxOf(model);
  return (
    <div style={{ position: "absolute", left: 0, top: L.STAGE_TOP, width: L.W, height: L.STAGE_H }}>
      <ThreeCanvas linear={false} shadows={fx.shadows >= 2 ? (fx.shadowSoft ? "soft" : "percentage") : false} width={L.W} height={L.STAGE_H} dpr={fx.dpr ?? T.dpr} gl={{ antialias: !!fx.msaa, alpha: true }} camera={{ fov: T.camera.fov, near: 1, far: 400, position: [0, 0, 60] }}>
        <ProductScene model={model} s={s} />
      </ThreeCanvas>
    </div>
  );
};

export const VideoThree: React.FC<Script & { timeline: TimelineV2 }> = ({ scenes, timeline, channel, model }) => {
  const f = useCurrentFrame();
  const m = useMemo(() => buildModel(scenes, timeline, model as ProductModel), [scenes, timeline, model]);
  const fx = useMemo(() => fxOf(model as ProductModel), [model]);
  const s = useMemo(() => stateAt(m, f), [m, f]);
  const by = Object.fromEntries(timeline.scenes.map((x) => [x.id, x]));
  const ordered = scenes.filter((x) => by[x.id]);
  const subCues = ordered.filter((x) => by[x.id].subtitleWindow).map((x) => ({ id: x.id, en: x.subtitle.en, keywords: x.keywords, window: by[x.id].subtitleWindow as [number, number], phrases: by[x.id].lines, keywords_at: by[x.id].keywords }));
  const srcCues = ordered.map((x) => ({ sources: x.sources, window: by[x.id].sourceWindow }));
  return (
    <AbsoluteFill>
      <Backdrop lay={s.lay} fo={s.fo} fx={fx} />
      <Trails m={m} s={s} f={f} fx={fx} />
      {fx.dust ? <Dust m={m} f={f} /> : null}
      <Stage s={s} model={m.product} />
      <Hook m={m} f={f} />
      <Labels m={m} s={s} f={f} fx={fx} />
      {m.product.actions ? <Meters m={m} s={s} /> : null}
      {m.overlays?.length ? <Overlays m={m} s={s} f={f} /> : null}
      <Caption3D cues={subCues} />
      <Source3D cues={srcCues} px={m.product.fx?.srcPx} />
      <Header3D name={channel?.name ?? "科技"} tag={channel?.tag ?? "拆開來看"} total={timeline.totalFrames} />
      {timeline.voice ? <Audio src={staticFile(timeline.voice.file)} /> : timeline.scenes.filter((t) => t.audio).map((t) => (
        <Sequence key={`${t.id}-audio`} from={t.audioFrame} durationInFrames={Math.ceil(t.audioSec * FPS) + 1} name={`${t.id}-audio`} layout="none"><Audio src={staticFile(t.audio as string)} /></Sequence>
      ))}
    </AbsoluteFill>
  );
};

/** 封面：大標＋分解後的模型（停在聚焦前一幀，各層都看得到） */
export const CoverThree: React.FC<Script & { coverCrop?: number }> = ({ cover, scenes, timeline, channel, coverCrop, model }) => {
  const c = (cover ?? {}) as { title?: string[]; sub?: string };
  const m = useMemo(() => (timeline && model ? buildModel(scenes, timeline as TimelineV2, model as ProductModel) : null), [scenes, timeline, model]);
  const s = useMemo(() => (m ? stateAt(m, Math.min(m.focus - 1, m.total - 1)) : null), [m]);
  const shift = coverCrop ? (L.H - coverCrop) / 2 - 150 : 0;
  const a = accent3D("blue");
  return (
    <AbsoluteFill>
      <Backdrop lay={1} />
      {s && m ? <div style={{ position: "absolute", inset: 0, transform: "translateY(330px)" }}><Stage s={s} model={m.product} /></div> : null}
      <div style={{ position: "absolute", inset: 0, transform: `translateY(${shift}px)` }}><Header3D name={channel?.name ?? "科技"} tag={channel?.tag ?? "拆開來看"} total={1} /></div>
      <div style={{ position: "absolute", left: L.X + 4, top: 360 }}>
        {(c.title ?? []).map((t, i) => <div key={i} style={{ ...zh(150, T.weight.zh, i === 1 ? a.text : T.ink), lineHeight: 1.18 }}>{t}</div>)}
        <div style={{ display: "inline-block", ...zh(46, T.weight.body, T.panel), background: T.ink, borderRadius: T.radius.pill, padding: "10px 32px", marginTop: 22 }}>{c.sub}</div>
      </div>
    </AbsoluteFill>
  );
};

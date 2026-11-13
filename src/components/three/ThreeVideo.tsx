// 3D 產品台（styleVersion 3 ＋ stage: "three"；對外稱 v4）：畫面中間是一個 @remotion/three 的 3D 舞台，
// 外面一圈（背景、鉤子大標、零件標籤與引線、頁首、字幕卡、出處）是 HTML。標籤位置用和 3D 同一台相機投影（engine.ts）。
// 全專案只有 src/components/three/ 可以用 three.js。渲染要 gl: "swangle"（scripts/lib.mjs 依 stage 自動切換）。
import React, { useMemo } from "react";
import { AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import type { Script, TimelineV2 } from "../../types";
import { FONT_EN, FONT_ZH, FPS, LAYOUT_3D as L, THEME_3D as T, accent3D } from "../../theme";
import { EASE, tween } from "../anim";
import { ANCHORS, G, buildModel, cameraFor, projectPoint, stateAt, type Model3D, type State3D } from "./engine";
import { PhoneScene } from "./Scene";
import { Caption3D, Header3D, Source3D } from "./Tracks";

const px = (n: number) => Math.round(n);
const zh = (size: number, weight: number = T.weight.body, color: string = T.ink): React.CSSProperties => ({ fontFamily: FONT_ZH, fontWeight: weight, fontSize: size, color, whiteSpace: "nowrap" });

/** 攝影棚背景：淺灰底＋下半部地面色帶＋細格線（躺下後地面才看得到透視格） */
const Backdrop: React.FC<{ lay: number }> = ({ lay }) => (
  <AbsoluteFill style={{ background: T.bg }}>
    <div style={{ position: "absolute", left: 0, right: 0, top: L.STAGE_TOP + 560, bottom: 0, background: T.floor }} />
    <svg width={L.W} height={L.H} style={{ position: "absolute", left: 0, top: 0, opacity: 0.35 + 0.65 * lay }}>
      {Array.from({ length: 9 }, (_, i) => { const x = 540 + (i - 4) * 150; return <line key={i} x1={x} y1={L.STAGE_TOP + 560} x2={540 + (i - 4) * 330} y2={L.CAP_TOP + 30} stroke={T.grid} strokeWidth={2} />; })}
      {[0, 70, 160, 280, 440].map((d, i) => <line key={`h${i}`} x1={0} x2={L.W} y1={L.STAGE_TOP + 560 + d} y2={L.STAGE_TOP + 560 + d} stroke={T.grid} strokeWidth={2} />)}
    </svg>
  </AbsoluteFill>
);

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
        <div style={{ ...zh(132, T.weight.zh), lineHeight: 1.2, letterSpacing: "0.01em" }}>
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

/** 零件標籤：圓點釘在零件上（投影位置），一條引線接到標籤 */
const Labels: React.FC<{ m: Model3D; s: State3D; f: number }> = ({ m, s, f }) => {
  const cam = useMemo(() => cameraFor(s), [s]);
  // 同一個零件只留最新的一張；rename 把那張的字換掉
  const shown = m.labels.filter((l) => f >= l.at - 2).filter((l, _, arr) => !arr.some((o) => o !== l && o.part === l.part && o.at > l.at));
  // 聚焦之後，不在均熱板上的標籤（晶片）退場；蒸氣出現後水的標籤退場、循環出現後蒸氣的退場
  const gone = (l: { part: string; at: number }) => (ANCHORS[l.part]?.layer !== "plate" ? m.focus : l.part === "water" ? m.vapor - 6 : l.part === "vapor" ? m.condense - 4 : l.part === "plate" ? m.heat - 6 : 1e9);
  return (
    <>
      <svg width={L.W} height={L.H} style={{ position: "absolute", left: 0, top: 0 }}>
        {shown.map((l, i) => {
          const an = ANCHORS[l.part]; if (!an) return null;
          const o = tween(f, l.at - 2, T.motion.in, EASE.enter) * (1 - tween(f, gone(l), 6, EASE.exit));
          if (o <= 0) return null;
          const p = projectPoint(s, cam, an.layer, an.p), c = accent3D(l.color);
          const q = tween(f, l.at - 2, 10, EASE.move);
          const rn = m.rename && m.rename.part === l.part && f >= m.rename.at ? m.rename : null;
          const txt = rn ? rn.text : l.text, estW = Math.max([...txt].length * (rn ? 68 : 58), rn?.en ? rn.en.length * 16 : 0) + 64 + L.LABEL_PAD;
          const tx = an.dx < 0 ? Math.max(L.X + estW, p.x + an.dx) : Math.min(L.W - L.X - estW, p.x + an.dx);
          const ex = p.x + (tx - p.x) * q, ey = p.y + an.dy * q;
          return (
            <g key={i} opacity={o}>
              <line x1={p.x} y1={p.y} x2={ex} y2={ey} stroke={T.ink} strokeWidth={4} strokeLinecap="round" />
              <circle cx={p.x} cy={p.y} r={13} fill={T.panel} stroke={T.ink} strokeWidth={4} />
              <circle cx={p.x} cy={p.y} r={6} fill={c.fill} />
            </g>
          );
        })}
      </svg>
      {shown.map((l, i) => {
        const an = ANCHORS[l.part]; if (!an) return null;
        const o = tween(f, l.at + 2, T.motion.in, EASE.enter) * (1 - tween(f, gone(l), 6, EASE.exit));
        if (o <= 0) return null;
        const p = projectPoint(s, cam, an.layer, an.p), c = accent3D(l.color);
        const rn = m.rename && m.rename.part === l.part && f >= m.rename.at ? m.rename : null;
        const bump = rn ? 1 + 0.08 * Math.sin(Math.PI * tween(f, rn.at, 10, EASE.move)) : 1 + 0.08 * Math.sin(Math.PI * tween(f, l.at, 10, EASE.move));
        const left = an.dx < 0;
        // 估標籤寬度，整張留在左右安全區裡
        const txt = rn ? rn.text : l.text, estW = Math.max([...txt].length * (rn ? 68 : 58), rn?.en ? rn.en.length * 16 : 0) + 64 + L.LABEL_PAD;
        const x = left ? Math.max(L.X + estW, p.x + an.dx) : Math.min(L.W - L.X - estW, p.x + an.dx), y = p.y + an.dy;
        return (
          <div key={i} style={{ position: "absolute", left: px(x), top: px(y), opacity: o, transform: `translate(${left ? "-100%" : "0"}, -50%) scale(${bump.toFixed(3)})`, transformOrigin: left ? "100% 50%" : "0 50%" }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: left ? "flex-end" : "flex-start", background: T.panel, border: `4px solid ${T.ink}`, borderRadius: T.radius.chip, padding: "8px 26px 10px", boxShadow: T.cardShadow }}>
              <div style={{ ...zh(rn ? 64 : 54, T.weight.zh, c.text), lineHeight: 1.25, letterSpacing: "0.04em" }}>{rn ? rn.text : l.text}</div>
              {rn?.en ? <div style={{ ...zh(26, T.weight.body, T.ink2), fontFamily: FONT_EN, letterSpacing: "0.04em", marginTop: -2 }}>{rn.en}</div> : null}
            </div>
          </div>
        );
      })}
    </>
  );
};

/** 3D 舞台（1080×990，頁首下面到字幕卡上面） */
const Stage: React.FC<{ s: State3D }> = ({ s }) => {
  // 立著時腳下的橢圓影子：跟著手機底部的投影位置走
  const foot = projectPoint(s, cameraFor(s), "frame", [0, -G.H / 2, -s.layers.frame.z]);
  return (
  <div style={{ position: "absolute", left: 0, top: L.STAGE_TOP, width: L.W, height: L.STAGE_H }}>
    {/* 立著的時候腳下的橢圓影子 */}
    <div style={{ position: "absolute", left: 540 - L.FOOT_W / 2, top: foot.y - L.STAGE_TOP - 22, width: L.FOOT_W, height: 56, borderRadius: "50%", background: T.part.shadow, opacity: T.shadow * 1.4 * (1 - s.lay) }} />
    <ThreeCanvas linear={false} width={L.W} height={L.STAGE_H} dpr={T.dpr} gl={{ antialias: true, alpha: true }} camera={{ fov: T.camera.fov, near: 1, far: 400, position: [0, 0, 60] }}>
      <PhoneScene s={s} />
    </ThreeCanvas>
  </div>
  );
};

export const VideoThree: React.FC<Script & { timeline: TimelineV2 }> = ({ scenes, timeline, channel }) => {
  const f = useCurrentFrame();
  const m = useMemo(() => buildModel(scenes, timeline), [scenes, timeline]);
  const s = useMemo(() => stateAt(m, f), [m, f]);
  const by = Object.fromEntries(timeline.scenes.map((x) => [x.id, x]));
  const ordered = scenes.filter((x) => by[x.id]);
  const subCues = ordered.filter((x) => by[x.id].subtitleWindow).map((x) => ({ id: x.id, en: x.subtitle.en, keywords: x.keywords, window: by[x.id].subtitleWindow as [number, number], phrases: by[x.id].lines, keywords_at: by[x.id].keywords }));
  const srcCues = ordered.map((x) => ({ sources: x.sources, window: by[x.id].sourceWindow }));
  return (
    <AbsoluteFill>
      <Backdrop lay={s.lay} />
      <Stage s={s} />
      <Hook m={m} f={f} />
      <Labels m={m} s={s} f={f} />
      <Caption3D cues={subCues} />
      <Source3D cues={srcCues} />
      <Header3D name={channel?.name ?? "科技"} tag={channel?.tag ?? "拆開來看"} total={timeline.totalFrames} />
      {timeline.voice ? <Audio src={staticFile(timeline.voice.file)} /> : timeline.scenes.filter((t) => t.audio).map((t) => (
        <Sequence key={`${t.id}-audio`} from={t.audioFrame} durationInFrames={Math.ceil(t.audioSec * FPS) + 1} name={`${t.id}-audio`} layout="none"><Audio src={staticFile(t.audio as string)} /></Sequence>
      ))}
    </AbsoluteFill>
  );
};

/** 封面：大標＋分解後的模型（停在聚焦前一幀，各層都看得到） */
export const CoverThree: React.FC<Script & { coverCrop?: number }> = ({ cover, scenes, timeline, channel, coverCrop }) => {
  const c = (cover ?? {}) as { title?: string[]; sub?: string };
  const m = useMemo(() => (timeline ? buildModel(scenes, timeline as TimelineV2) : null), [scenes, timeline]);
  const s = useMemo(() => (m ? stateAt(m, Math.min(m.focus - 1, m.total - 1)) : null), [m]);
  const shift = coverCrop ? (L.H - coverCrop) / 2 - 150 : 0;
  const a = accent3D("blue");
  return (
    <AbsoluteFill>
      <Backdrop lay={1} />
      {s ? <div style={{ position: "absolute", inset: 0, transform: "translateY(330px)" }}><Stage s={s} /></div> : null}
      <div style={{ position: "absolute", inset: 0, transform: `translateY(${shift}px)` }}><Header3D name={channel?.name ?? "科技"} tag={channel?.tag ?? "拆開來看"} total={1} /></div>
      <div style={{ position: "absolute", left: L.X + 4, top: 360 }}>
        {(c.title ?? []).map((t, i) => <div key={i} style={{ ...zh(150, T.weight.zh, i === 1 ? a.text : T.ink), lineHeight: 1.18 }}>{t}</div>)}
        <div style={{ display: "inline-block", ...zh(46, T.weight.body, T.panel), background: T.ink, borderRadius: T.radius.pill, padding: "10px 32px", marginTop: 22 }}>{c.sub}</div>
      </div>
    </AbsoluteFill>
  );
};

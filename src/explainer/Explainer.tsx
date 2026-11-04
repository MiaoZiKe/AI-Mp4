import React from "react";
import { AbsoluteFill, Audio, Sequence, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import type { Scene, Script } from "../types";
import { FPS } from "./theme";
import { K, SAFE2, FONT_ZH, FONT_EN, glow } from "./theme";
import { sceneFrames, sceneStarts, totalFrames } from "../timing";
import { Caption, SourceLine, Stage, TopBar, Pill } from "./parts";
import { Icon } from "../components/Icons";
import * as S from "./scenes";

const REGISTRY: Record<string, React.FC<any>> = {
  Hook: S.Hook, Twist: S.Twist, Term: S.Term, Seats: S.Seats, Standoff: S.Standoff,
  Impact: S.Impact, Markets: S.Markets, Timeline: S.Timeline, Recap: S.Recap, End: S.End,
};
const FADE = Math.round(0.3 * FPS);

type XScene = Scene & { tint?: string; chapter?: { i: number; n: number; label: string } };

const SceneView: React.FC<{ scene: XScene; asOf: string }> = ({ scene, asOf }) => {
  const f = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const t = interpolate(f, [0, FADE, durationInFrames - FADE, durationInFrames], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  // 換幕：0.3 秒淡入淡出 + 輕微縮放推進（Ken Burns），讓畫面一直有動感
  const zoom = interpolate(f, [0, durationInFrames], [1.0, 1.035]);
  const Comp = REGISTRY[scene.component];
  if (!Comp) throw new Error(`Unknown component: ${scene.component}`);
  const isEnd = scene.component === "End";
  const top = scene.chapter ? 400 : 330;
  return (
    <AbsoluteFill style={{ opacity: t }}>
      <div style={{ position: "absolute", left: SAFE2.left, right: SAFE2.left, top, height: isEnd ? 1340 : 1215 - top, display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${zoom})` }}>
        <Comp {...scene.props} />
      </div>
      {!isEnd && <Caption zh={scene.subtitle.zh} en={scene.subtitle.en} keywords={scene.keywords} />}
      {!isEnd && <SourceLine sources={scene.sources} asOf={asOf} />}
    </AbsoluteFill>
  );
};

const Chrome: React.FC<{ scenes: XScene[] }> = ({ scenes }) => {
  const f = useCurrentFrame();
  const starts = sceneStarts(scenes);
  let idx = 0;
  starts.forEach((s, i) => { if (f >= s) idx = i; });
  return <TopBar chapter={scenes[idx].chapter ?? null} progress={f / totalFrames(scenes)} />;
};

const Tint: React.FC<{ scenes: XScene[] }> = ({ scenes }) => {
  const f = useCurrentFrame();
  const starts = sceneStarts(scenes);
  let idx = 0;
  starts.forEach((s, i) => { if (f >= s) idx = i; });
  const tint = (K as Record<string, string>)[scenes[idx].tint ?? "violet"] ?? K.violet;
  return <Stage tint={tint} />;
};

export const Explainer: React.FC<Script> = ({ scenes, asOf, audio }) => {
  const xs = scenes as XScene[];
  const starts = sceneStarts(xs);
  return (
    <AbsoluteFill style={{ background: K.ink }}>
      <Tint scenes={xs} />
      {xs.map((s, i) => (
        <Sequence key={s.id} from={starts[i]} durationInFrames={sceneFrames(s)} name={s.id}>
          <SceneView scene={s} asOf={asOf} />
        </Sequence>
      ))}
      <Chrome scenes={xs} />
      {audio ? <Audio src={staticFile(audio)} /> : null}
    </AbsoluteFill>
  );
};

/** 封面：與第一幕同一句鉤子 */
export const ExplainerCover: React.FC<Script & { cover?: { kicker: string; title: string[]; chips: { icon: string; text: string; color: string }[] } }> = ({ cover, asOf }) => {
  const c = cover!;
  return (
    <AbsoluteFill>
      <Stage tint={K.amber} />
      <TopBar progress={0} />
      <div style={{ position: "absolute", left: SAFE2.left, right: SAFE2.left, top: 400, display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
        <div style={{ fontFamily: FONT_ZH, fontWeight: 900, fontSize: 52, color: K.ink, background: K.cyan, borderRadius: 14, padding: "8px 28px" }}>{c.kicker}</div>
        <div style={{ display: "flex", gap: 36, marginTop: 60 }}>
          <Icon name="whitehouse" color={K.amber} size={190} />
          <Icon name="capitol" color={K.violet} size={190} />
        </div>
        {c.title.map((t, i) => (
          <div key={i} style={{ fontFamily: FONT_ZH, fontWeight: 900, fontSize: i === 1 ? 150 : 104, lineHeight: 1.16, marginTop: i ? 0 : 50, color: i === 1 ? K.amber : K.text, filter: i === 1 ? glow(K.amber, 14) : undefined }}>{t}</div>
        ))}
        <div style={{ display: "flex", gap: 22, marginTop: 60 }}>
          {c.chips.map((ch) => {
            const col = (K as Record<string, string>)[ch.color] ?? K.cyan;
            return (
              <div key={ch.text} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, width: 190, padding: "16px 0", borderRadius: 20, background: K.card, border: `1.5px solid ${col}`, boxShadow: `0 0 18px ${col}44` }}>
                <Icon name={ch.icon} color={col} size={80} />
                <span style={{ fontFamily: FONT_ZH, fontWeight: 900, fontSize: 40, color: col }}>{ch.text}</span>
              </div>
            );
          })}
        </div>
        <div style={{ marginTop: 56 }}><Pill status="pending" text={`部分席次仍在計票｜截至 ${asOf}`} size={30} /></div>
        <div style={{ fontFamily: FONT_EN, fontSize: 30, color: K.dim, marginTop: 22 }}>US midterms 2026: what changes next?</div>
      </div>
    </AbsoluteFill>
  );
};

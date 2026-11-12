// v3 主引擎：PaperStage（一張比畫面大的桌面，鏡頭在上面平移／推拉）＋ Cutout（紙片）＋ VideoV3。
// 全片只有一個舞台：23 鏡是同一張桌面上的 23 個鏡位，紙片依 cue 貼上、移動、退場；沒有「一幕一張圖卡」。
import React, { useMemo } from "react";
import { AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame } from "remotion";
import type { Scene, Script, TimelineV2 } from "../../types";
import { FPS, LAYOUT_V3 as L, THEME_V3 as T } from "../../theme";
import { AMBIENT } from "../anim";
import { AssetContext, Paper, useAsset, useAssets, type AssetMeta } from "./assets";
import { alive, buildStage, cameraAt, matAt, placeAt, presence, resolveAt, stateAt, type Stage, type StageItem } from "./engine";
import { DashedPath, ImgPiece, PassWindow, StripTitle, imgSize, stripSize, type PieceProps } from "./Pieces";
import { PhoneMock } from "./PhoneMock";
import { EndCardV3, HeaderV3, PaperCaption, SourceTrackV3 } from "./Tracks";

const RENDER: Record<string, React.FC<PieceProps>> = { img: ImgPiece, strip: StripTitle, phone: PhoneMock, pass: PassWindow, path: DashedPath };
const natural = (it: StageItem, assets: Record<string, AssetMeta>): [number, number] => {
  const t = it.spec.type ?? "img";
  if (t === "phone") return [assets.phone.body[2], assets.phone.body[3]];
  if (t === "pass") return [assets.pass.w, assets.pass.h];
  if (t === "strip") return stripSize(it.spec, assets);
  if (t === "path") return [0, 0];
  return imgSize(it.spec, assets);
};

/**
 * Cutout：一張紙片。位置＝紙本體中心（x, y）、w＝紙本體寬；進場滑入＋小角度旋轉落定、每 2 幀更新位置（逐格感）、
 * 落定後極小抖動（固定 seed）、可沿路徑移動（moves／path）。所有數值由 engine.ts 依絕對幀算出。
 */
export const Cutout: React.FC<{ it: StageItem; f: number }> = ({ it, f }) => {
  const { assets, ambient } = useAssets();
  const t = it.spec.type ?? "img";
  const Comp = RENDER[t];
  if (!Comp) throw new Error(`v3 不認得的 type：${t}`);
  const { state, since, prev } = stateAt(it, f);
  const args = { spec: it.spec, f, state, since, prev, born: it.born };
  if (t === "path") return <div style={{ position: "absolute", left: 0, top: 0, zIndex: it.z }}><Comp {...args} /></div>;
  const [nw, nh] = natural(it, assets);
  const pl = placeAt(it, f), pr = presence(it, f, ambient);
  if (pr.opacity <= 0) return null;
  const k = (pl.w || nw) / nw;
  return (
    <div style={{ position: "absolute", left: Math.round(pl.x + pr.dx - nw / 2), top: Math.round(pl.y + pr.dy - nh / 2), width: nw, height: nh, zIndex: it.z, opacity: pr.opacity,
      transform: `rotate(${(pl.rot + pr.rot).toFixed(2)}deg) scale(${(k * pr.scale).toFixed(4)})`, clipPath: pr.wipe < 1 ? `inset(-60px ${(100 * (1 - pr.wipe)).toFixed(1)}% -60px -60px)` : pr.wipeOut > 0 ? `inset(-60px -60px -60px ${(100 * pr.wipeOut).toFixed(1)}%)` : undefined }}>
      <Comp {...args} />
    </div>
  );
};

const Items: React.FC<{ stage: Stage; layer: string; f: number }> = ({ stage, layer, f }) => (
  <>{stage.items.filter((it) => it.layer === layer && alive(it, f)).map((it) => <Cutout key={it.key} it={it} f={f} />)}</>
);

/**
 * PaperStage：由下到上——桌面紙紋（跟著鏡頭平鋪）→ desk 層紙片 → 切割墊（由上蓋下／往上掀開）→ mat 層紙片
 * →（以上都在世界座標，跟鏡頭走）→ 暗角 → near 層（手機，畫面座標，近景）→ screen 層（畫面座標的大紙條）。
 * 轉場＝鏡頭移到桌面另一區，或色紙蓋下再掀開；沒有淡入淡出。
 */
export const PaperStage: React.FC<{ stage: Stage }> = ({ stage }) => {
  const f = useCurrentFrame();
  const { cx, cy, s } = cameraAt(stage, f);
  const tx = L.W / 2 - cx * s, ty = L.H / 2 - cy * s;
  const desk = useAsset("desk"), mat = useAsset("mat"), vig = useAsset("vignette");
  const world: React.CSSProperties = { position: "absolute", left: 0, top: 0, width: 0, height: 0, transform: `translate(${tx.toFixed(2)}px, ${ty.toFixed(2)}px) scale(${s.toFixed(5)})`, transformOrigin: "0 0" };
  const tile = (a: { src: string; w: number; h: number }): React.CSSProperties => ({ backgroundImage: `url(${a.src})`, backgroundSize: `${(a.w * s).toFixed(2)}px ${(a.h * s).toFixed(2)}px`, backgroundPosition: `${tx.toFixed(2)}px ${ty.toFixed(2)}px` });
  const m = matAt(stage, f);
  const edge = Math.round(L.H * m);
  return (
    <AbsoluteFill style={{ background: T.desk, overflow: "hidden", isolation: "isolate" }}>
      <AbsoluteFill style={tile(desk)} />
      <div style={world}><Items stage={stage} layer="desk" f={f} /></div>
      {m > 0 ? (
        <>
          <div style={{ position: "absolute", left: 0, top: 0, width: L.W, height: edge, overflow: "hidden" }}><div style={{ position: "absolute", left: 0, top: 0, width: L.W, height: L.H, background: T.mat, ...tile(mat) }} /></div>
          {m < 1 ? <div style={{ position: "absolute", left: -20, right: -20, top: edge - 2, height: 2, boxShadow: "0 6px 16px 4px rgba(20,14,6,0.45)" }} /> : null}
        </>
      ) : null}
      <div style={world}><Items stage={stage} layer="mat" f={f} /></div>
      <img src={vig.src} style={{ position: "absolute", left: 0, top: 0, width: L.W, height: L.H, opacity: 0.3 + 0.3 * m }} />
      <Items stage={stage} layer="near" f={f} />
      <Items stage={stage} layer="screen" f={f} />
    </AbsoluteFill>
  );
};

/** 專屬元件幕（非 PaperScene）：目前只有 EndCard */
const Special: React.FC<{ scenes: Scene[]; timeline: TimelineV2 }> = ({ scenes, timeline }) => {
  const f = useCurrentFrame();
  const by = Object.fromEntries(timeline.scenes.map((x) => [x.id, x]));
  return <>{scenes.filter((s) => s.component === "EndCard" && by[s.id] && f >= by[s.id].startFrame).map((s) => <EndCardV3 key={s.id} start={by[s.id].startFrame} {...s.props} />)}</>;
};

export const VideoV3: React.FC<Script & { timeline: TimelineV2 }> = ({ scenes, timeline, slug, v3, audit }) => {
  const f = useCurrentFrame();
  const stage = useMemo(() => buildStage(scenes, timeline), [scenes, timeline]);
  if (stage.warnings.length && f === 0) console.warn(`[v3] ${stage.warnings.join("；")}`);
  const by = Object.fromEntries(timeline.scenes.map((x) => [x.id, x]));
  const ordered = scenes.filter((s) => by[s.id]);
  const subCues = ordered.filter((s) => by[s.id].subtitleWindow).map((s) => ({ id: s.id, en: s.subtitle.en, keywords: s.keywords, window: by[s.id].subtitleWindow as [number, number], phrases: by[s.id].lines, keywords_at: by[s.id].keywords }));
  const srcCues = ordered.filter((s) => s.component !== "EndCard").map((s) => ({ sources: s.sources, window: by[s.id].sourceWindow }));
  const ctx = useMemo(() => ({ slug, assets: (v3?.assets ?? {}) as Record<string, AssetMeta>, ambient: AMBIENT && !audit }), [slug, v3, audit]);
  // 頁首紙底：寫了 headerPlate 的幕，從開始到下一幕開始（片尾卡蓋上就不需要了）
  // headerPlate: true＝整幕；{ at, dur｜until: "幕 id.cue±n" }＝從 at 起 dur 幀或到 until（鏡頭帶著東西從頁首後面經過的那一段）。回傳 [已貼上幾幀, 還剩幾幀]
  const plateAt = (ff: number): [number, number] => ordered.reduce((v, s, i) => {
    const hp = (s.props as any)?.headerPlate; if (!hp) return v;
    const next = ordered[i + 1] ? by[ordered[i + 1].id].startFrame : timeline.totalFrames;
    const a = typeof hp === "object" ? resolveAt(hp.at, by[s.id], next) : by[s.id].startFrame;
    let b = typeof hp === "object" && hp.dur ? a + hp.dur : next;
    if (typeof hp === "object" && hp.until) { const [sid, cue] = String(hp.until).split("."); const k = ordered.findIndex((x) => x.id === sid); if (k >= 0) b = resolveAt(cue, by[sid], ordered[k + 1] ? by[ordered[k + 1].id].startFrame : timeline.totalFrames); }
    return ff >= a && ff < b ? [ff - a, b - ff] as [number, number] : v;
  }, [-1, 0] as [number, number]);
  const endStart = Math.min(...ordered.filter((s) => s.component === "EndCard").map((s) => by[s.id].startFrame), Infinity);
  return (
    <AssetContext.Provider value={ctx}>
      <AbsoluteFill>
        <PaperStage stage={stage} />
        {/* 蓋場大紙（top 層）與片尾卡都在字幕紙條底下：最後一句的字幕留在紙上念完，再自己往下滑出 */}
        <AbsoluteFill style={{ isolation: "isolate" }}><Items stage={stage} layer="top" f={f} /></AbsoluteFill>
        <Special scenes={ordered} timeline={timeline} />
        <PaperCaption cues={subCues} endAt={endStart} />
        <SourceTrackV3 cues={srcCues} />
        {timeline.voice ? <Audio src={staticFile(timeline.voice.file)} /> : timeline.scenes.filter((t) => t.audio).map((t) => (
          <Sequence key={`${t.id}-audio`} from={t.audioFrame} durationInFrames={Math.ceil(t.audioSec * FPS) + 1} name={`${t.id}-audio`} layout="none"><Audio src={staticFile(t.audio as string)} /></Sequence>
        ))}
        <HeaderV3 dark={f < endStart && matAt(stage, f) > 0.17 && plateAt(f)[0] < 0} plate={plateAt(f)[0]} plateLeft={plateAt(f)[1]} />
      </AbsoluteFill>
    </AssetContext.Provider>
  );
};
export { Paper };

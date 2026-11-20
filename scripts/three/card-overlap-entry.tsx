// scripts/three/card-overlap.mjs 用 esbuild 打包這支（不開 3D）：把 HUD 片每個 2D 疊層，在要檢查的幀用 react-dom/server 輸出成靜態 HTML。
// 用和畫面同一份的 engine.ts（絕對幀）、hudLayout.ts 的 planHud（蓋章找好的位置）、Hud.tsx 的 HudOverlays（各 Hud*.tsx 的示意卡都從這裡分派）。
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { buildModel, stateAt, type Overlay3D } from "../../src/components/three/engine";
import { planHud } from "../../src/components/three/hudLayout";
import { setHudLayout, setHudSkin, H, sm } from "../../src/components/three/hudSkin";
import { HudOverlays, zoomKeys } from "../../src/components/three/Hud";

/** 疊層裡所有巢狀的 at（engine 已換成絕對幀）＝這張卡的 cue 時間點 */
const atsOf = (o: any, out: number[] = [], depth = 0): number[] => {
  if (!o || typeof o !== "object" || depth > 6) return out;
  for (const [k, v] of Object.entries(o)) {
    if ((k === "at" || k === "textAt") && typeof v === "number" && Number.isFinite(v)) out.push(v);
    else if (v && typeof v === "object") atsOf(v, out, depth + 1);
  }
  return out;
};

export type Shot = { i: number; type: string; kind?: string; title?: string; tag?: string; frame: number; why: string; html: string };

export const shots = (script: any, only?: string): Shot[] => {
  const hud = script.hud, tl = script.timeline;
  setHudSkin(script.hudSkin, hud.smallPx);
  const L = setHudLayout(hud.layout) as any;
  const model = { ...script.model, palette: { ...script.model.palette, ...(H as any).parts } };
  const m = buildModel(script.scenes, tl, model);
  const keys = zoomKeys(script.scenes, tl, hud);
  const hookOut = keys.find((k: any) => !k.drift && k.at > 0)?.at ?? 1e9;
  const plan = planHud(m, L, hud, keys, sm(28), hookOut);
  const out: Shot[] = [];
  plan.overlays.forEach((o: Overlay3D, i: number) => {
    const oo = o as any;
    if (only && !String(oo.kind ?? oo.type).includes(only)) return;
    const end = Math.min(oo.until ?? tl.totalFrames, tl.totalFrames) - 2;
    const fr = new Map<number, string>();
    fr.set(Math.min(end, o.at + 12), "出場＋12");
    for (const a of atsOf(oo)) if (a > o.at && a + 12 < end) fr.set(a + 12, fr.get(a + 12) ?? `cue ${a}＋12`);
    fr.set(end, "結束前 2 幀");
    for (const [f, why] of [...fr.entries()].sort((a, b) => a[0] - b[0])) {
      if (f < o.at) continue;
      const s = stateAt(m, f);
      const html = renderToStaticMarkup(<HudOverlays m={m} f={f} list={[o]} s={s} />);
      out.push({ i, type: o.type, kind: oo.kind, title: oo.title, tag: oo.tag, frame: f, why, html });
    }
  });
  return out;
};

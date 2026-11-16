// tech-packaging 開發用（2026/11/16）：印指定幀的主素材框（和 layout-check 同一份 modelRect），調鏡頭用，不渲染
import { buildModel, stateAt } from "../../src/components/three/engine";
import { modelRect } from "../../src/components/three/hudLayout";
import { setHudLayout, setHudSkin, canvasBox, L } from "../../src/components/three/hudSkin";
export const probe = (script: any, frames: number[]) => {
  setHudSkin(script.hudSkin, script.hud.smallPx); setHudLayout(script.hud.layout);
  const m = buildModel(script.scenes, script.timeline, script.model);
  const c = canvasBox(), cy = c.top + c.h / 2, k = (L as any).ART_FIT ?? 1; // 畫面上（乘上全片固定的 ART_FIT）
  return frames.map((f) => { const r = modelRect(script.model, stateAt(m, f)); return [f, r && [540 + (r.x0 - 540) * k, cy + (r.y0 - cy) * k, 540 + (r.x1 - 540) * k, cy + (r.y1 - cy) * k].map(Math.round)]; });
};
import { layerBoxes } from "../../src/components/three/hudLayout";
import { cameraFor, projectPoint } from "../../src/components/three/engine";
export const perLayer = (script: any, f: number) => {
  setHudSkin(script.hudSkin, script.hud.smallPx); setHudLayout(script.hud.layout);
  const m = buildModel(script.scenes, script.timeline, script.model), s = stateAt(m, f), cam = cameraFor(s), out: any[] = [];
  for (const [id, b] of Object.entries(layerBoxes(script.model)) as any) {
    if ((s.layers[id]?.opacity ?? 1) < 0.3) continue;
    const ps = [0, 1, 2, 3, 4, 5, 6, 7].map((i) => projectPoint(s, cam, id, [i & 1 ? b.max[0] : b.min[0], i & 2 ? b.max[1] : b.min[1], i & 4 ? b.max[2] : b.min[2]]));
    out.push([id, Math.round(Math.min(...ps.map((p) => p.x))), Math.round(Math.min(...ps.map((p) => p.y))), Math.round(Math.max(...ps.map((p) => p.x))), Math.round(Math.max(...ps.map((p) => p.y)))]);
  }
  return out;
};

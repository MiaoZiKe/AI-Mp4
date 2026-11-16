// scripts/three/yield-check.mjs 打包這支：逐幀用 renderToStaticMarkup 畫 art: "yield"（HudYield.tsx），收集每個字、標籤、蓋章、卡片的外框，
// 檢查（1）兩個不同的東西互相重疊（同一張卡片裡的字不算）（2）字或卡片蓋到主素材的中央區域（3）超出舞台（4）鉤子大字期間壓到鉤子。
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { YieldArt, YB } from "../../src/components/three/HudYield";
import { atOf, artRegion, centerOf, hookRect, type Rect } from "../../src/components/three/hudLayout";
import { setHudLayout, setHudSkin } from "../../src/components/three/hudSkin";

const inter = (a: Rect, b: Rect) => Math.max(0, Math.min(a.x1, b.x1) - Math.max(a.x0, b.x0)) * Math.max(0, Math.min(a.y1, b.y1) - Math.max(a.y0, b.y0));
const inside = (a: Rect, b: Rect) => a.x0 >= b.x0 - 1 && a.x1 <= b.x1 + 1 && a.y0 >= b.y0 - 1 && a.y1 <= b.y1 + 1;
export const check = (script: any, step = 1) => {
  setHudSkin(script.hudSkin, script.hud.smallPx);
  const L = setHudLayout(script.hud.layout) as any, tl = script.timeline, at = atOf(tl), first = tl.scenes[0].id;
  const lvl = script.hud.levels.find((l: any) => l.art === "yield");
  const cues = Object.fromEntries(Object.entries(lvl.cues).map(([k, v]) => [k, at(first, v, 1e9)]));
  const R = artRegion(L), hook = script.scenes[0].props.hook, hookOut = at(first, script.scenes[0].props.zoom?.[0]?.at, 1e9) + 8, hr = hookRect(hook, L);
  const ec = script.scenes.find((s: any) => s.props?.endCard), ecAt = at(ec.id, ec.props.endCard.at, 1e9);
  const issues: { f: number; kind: string; a: string; b?: string }[] = [];
  let frames = 0, maxBoxes = 0;
  for (let f = 0; f < Math.min(ecAt + 6, tl.totalFrames); f += step) {
    YB.on = true; YB.list = [];
    const html = renderToStaticMarkup(<svg><YieldArt f={f} cues={cues} /></svg>);
    if (/NaN|Infinity/.test(html)) issues.push({ f, kind: "NaN", a: (html.match(/.{60}(NaN|Infinity).{20}/) ?? [""])[0] });
    YB.on = false; frames++;
    // ZoomArt 的變形是 scale(u)·translate(…) 再反過來：HudYield 已經畫在畫面 px，所以這裡的框就是畫面座標
    if (f < hookOut) YB.list.push({ k: "fill", r: hr, g: "hook" });
    const L2 = YB.list, mains = L2.filter((x) => x.k === "main"), els = L2.filter((x) => x.k !== "main" && x.k !== "fill" && x.k !== "line"), lines = L2.filter((x) => x.k === "line");
    // 連續空白橫條：舞台（R.y0–R.y1）裡沒有任何東西（字、卡片、主素材、填色區）的橫條 > 60px（只看到片尾卡前）
    { const iv = L2.map((x) => [Math.max(R.y0, x.r.y0), Math.min(R.y1, x.r.y1)]).filter(([a, b]) => b > a).sort((a, b) => a[0] - b[0]);
      let y = R.y0, gap = 0, at0 = 0; for (const [a, b] of iv) { if (a - y > gap) { gap = a - y; at0 = y; } y = Math.max(y, b); } if (R.y1 - y > gap) { gap = R.y1 - y; at0 = y; }
      if (gap > 60) issues.push({ f, kind: "連續空白橫條", a: `${Math.round(at0)}–${Math.round(at0 + gap)}（${Math.round(gap)}px）` }); }
    // 線條穿字：登記過的線段外框和別組的字相交
    for (const l of lines) for (const e of els) if (e.k === "txt" && e.g !== l.g && inter(l.r, e.r) > 2) issues.push({ f, kind: "線條穿字", a: `${e.t}`, b: l.g });
    maxBoxes = Math.max(maxBoxes, els.length);
    const own = (e: any, m: any) => e.g && m.g && (e.g === m.g || e.g.startsWith(m.g + ":"));
    for (let i = 0; i < els.length; i++) {
      const a = els[i];
      if (a.r.y0 < R.y0 - 2 || a.r.y1 > R.y1 + 2 || a.r.x0 < 20 || a.r.x1 > 1060) issues.push({ f, kind: "超出舞台", a: `${a.k}:${a.t ?? a.g}` });
      if (f < hookOut && inter(a.r, hr) > 4) issues.push({ f, kind: "壓到鉤子", a: `${a.k}:${a.t ?? a.g}` });
      for (const m of mains) if (a.k !== "lens" && !own(a, m) && inter(a.r, centerOf(m.r)) > 4) issues.push({ f, kind: "蓋到主素材中央", a: `${a.k}:${a.t ?? a.g}`, b: m.g });
      for (let j = i + 1; j < els.length; j++) {
        const b = els[j];
        if (a.g && a.g === b.g) continue;
        if ((a.k === "card" && inside(b.r, a.r)) || (b.k === "card" && inside(a.r, b.r))) continue;
        if (inter(a.r, b.r) > 4) issues.push({ f, kind: "重疊", a: `${a.k}:${a.t ?? a.g}`, b: `${b.k}:${b.t ?? b.g}` });
      }
    }
  }
  return { frames, issues, maxBoxes };
};

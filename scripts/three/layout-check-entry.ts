// scripts/three/layout-check.mjs 用 esbuild 打包這支（不開瀏覽器）：用和畫面同一份的 engine.ts／hudLayout.ts 算每一幀的版面，找出
// 標籤／蓋章壓到模型、兩張卡同時出現又重疊、內容超出安全區、內容底部太高（下方空白太多）、小字太小、片尾卡太短。
import { buildModel, stateAt } from "../../src/components/three/engine";
import { arrangeOverlays, cardRect, hit, area, modelRect, obstaclesOf, placeLabels, stampRect, textW, visible, zoomAt, zoomKeys, ENDCARD_SETTLED, METER_H, type Rect } from "../../src/components/three/hudLayout";
import { setHudLayout, setHudSkin, H } from "../../src/components/three/hudSkin";
import { cameraFor, projectPoint } from "../../src/components/three/engine";
import { EASE, tween } from "../../src/components/anim";

type Issue = { level: "error" | "warn"; kind: string; msg: string; frames?: [number, number] };

export const check = (script: any) => {
  const out: Issue[] = [];
  const E = (kind: string, msg: string, frames?: [number, number]) => out.push({ level: "error", kind, msg, frames });
  const W = (kind: string, msg: string, frames?: [number, number]) => out.push({ level: "warn", kind, msg, frames });
  const hud = script.hud, tl = script.timeline;
  if (!hud || !tl) return { issues: out, stats: {} };
  setHudSkin(script.hudSkin, hud.smallPx);
  const L = setHudLayout(hud.layout) as any;
  const total = tl.totalFrames, SAFE = { x0: 64, y0: 220, x1: 1080 - 64, y1: 1920 - 220 };
  // ── 靜態規則 ──
  if (hud.layout !== "fill") W("版面", "hud.layout 不是 \"fill\"：LOGO 仍是小的、下方空白沒填滿（2026/11/15 使用者回饋）");
  const capBottom = L.CAP_TOP + L.CAP_H, srcBottom = L.SRC_TOP + L.SRC_PX * 1.3;
  if (Math.max(capBottom, srcBottom) < 1600) E("版面", `內容底部只到 y${Math.round(Math.max(capBottom, srcBottom))}：下方空白太多，要撐到約 y1650–1700`);
  if (srcBottom > SAFE.y1) E("版面", `出處列下緣 y${Math.round(srcBottom)} 超出下方安全區（y${SAFE.y1}）`);
  if (L.HEADER_TOP < SAFE.y0) E("版面", `頁首 y${L.HEADER_TOP} 在上方安全區內（要 ≥${SAFE.y0}）`);
  const small = Math.max(hud.smallPx ?? 0, 0);
  if (small < 30) E("小字", `hud.smallPx＝${small}：小字下限要 ≥30`);
  if (L.CAP_EN_PX < 30) E("小字", `英文副字幕 ${L.CAP_EN_PX}px < 30`);
  const srcPx = Math.max(script.model?.fx?.srcPx ?? 30, L.SRC_PX);
  if (srcPx < 30) E("小字", `出處列 ${srcPx}px < 30`);
  // 片尾卡長度
  const endScene = script.scenes.find((x: any) => x.silent === true && x.props?.endCard);
  if (endScene) {
    const by: Record<string, any> = Object.fromEntries(tl.scenes.map((x: any) => [x.id, x]));
    const ec = endScene.props.endCard;
    const at = ec.at ? resolveAt(tl, endScene.id, ec.at) : by[endScene.id]?.startFrame;
    const len = total - at;
    if (len < 90) E("片尾卡", `片尾卡 ${(len / 30).toFixed(2)} 秒，要 ≥3 秒（可用 endCard.at 提早開始）`);
    if (len - ENDCARD_SETTLED < 30) E("片尾卡", `片尾卡動畫在第 ${ENDCARD_SETTLED} 幀才落定，之後只停 ${((len - ENDCARD_SETTLED) / 30).toFixed(2)} 秒（要 ≥1 秒）`);
  }
  // 出處列：一行要放得下（Hud.tsx 會縮字，但不低於 30px）
  for (const sc of script.scenes) {
    const j = (sc.sources ?? []).join("、");
    if (!j) continue;
    const text = /^(資料)?來源|示意/.test(j) ? j : `來源：${j}`, need = (srcPx * (L.INNER_W - 30)) / textW(text, srcPx, 0.02);
    if (need < 30) E("小字", `${sc.id} 出處列太長，一行放不下要縮到 ${Math.floor(need)}px（<30）：改短「${text}」`);
  }
  // ── 逐幀 ──
  const m = buildModel(script.scenes, tl, script.model);
  const keys = zoomKeys(script.scenes, tl, hud, H.motion.zoom, H.motion.drift);
  const is3D = (f: number) => zoomAt(hud, keys, f).handoff > 0.5;
  const mcache = new Map<number, Rect | null>();
  const mrAt = (f: number) => { if (!mcache.has(f)) mcache.set(f, is3D(f) ? modelRect(m.product, stateAt(m, f)) : null); return mcache.get(f) ?? null; };
  const enPx0 = Math.max(28, small), lab = placeLabels(m, L, is3D, enPx0, obstaclesOf(m, []));
  const ovs = arrangeOverlays(m, L, is3D, obstaclesOf(m, lab));
  for (const o of ovs) if (o._delayed) W("換幕", `${o.type}「${o.text ?? o.title ?? o.kicker ?? ""}」和前一張重疊，自動延後 ${o._delayed} 幀進場（舊的退場完才進）`);
  for (const o of ovs) if (o._moved) W("避開模型", `蓋章「${o.text}」原本會壓到模型或其他東西，自動挪到 (${Math.round(o.x ?? 540)}, ${Math.round(o.y)})`);
  const ovRect = (o: any): Rect | null => (o.type === "stamp" ? stampRect(o, o.x ?? L.W / 2, o.y ?? L.STAGE_TOP + L.STAGE_H / 2) : cardRect(o, L));
  const ovK = (o: any, f: number) => tween(f, o.at, 5, EASE.enter) * (1 - tween(f, o.until, 6, EASE.exit));
  const runs: Record<string, [number, number][]> = {};
  const add = (key: string, f: number) => { const rs = (runs[key] ??= []), r = rs[rs.length - 1]; if (r && r[1] >= f - 2) r[1] = f; else rs.push([f, f]); };
  const meters = Object.entries(m.product.actions ?? {}).filter(([, d]) => d.type === "meter" && d.x !== undefined);
  for (let f = 0; f < total; f++) {
    const s = stateAt(m, f), mr = mrAt(f), cam = cameraFor(s);
    const items: { name: string; r: Rect; kind: string }[] = [];
    for (const o of ovs) { if (!visible(o, f) || ovK(o, f) < 0.15) continue; const r = ovRect(o); if (r) items.push({ name: `${o.type === "stamp" ? (o.style === "tag" ? "小標" : "蓋章") : o.type}「${o.text ?? o.title ?? o.kicker ?? ""}」`, r, kind: o.type === "stamp" ? "stamp" : "card" }); }
    for (const { l, an, p0, rect } of lab) {
      const k = tween(f, l.at + 3, 6, EASE.enter) * (1 - tween(f, l.until, 6, EASE.exit));
      if (k < 0.15) continue;
      const dx = 0, dy = 0;
      items.push({ name: `標籤「${l.text}」`, r: { x0: rect.x0 + dx, y0: rect.y0 + dy, x1: rect.x1 + dx, y1: rect.y1 + dy }, kind: "label" });
    }
    for (const [id, d] of meters) { const op = s.ops[id]; if (op && op.k > 0.15) items.push({ name: `儀表「${d.label}」`, r: { x0: d.x!, y0: d.y!, x1: d.x! + (d.w ?? 330), y1: d.y! + METER_H }, kind: "meter" }); }
    for (const it of items) {
      if (it.r.x0 < SAFE.x0 - 1 || it.r.x1 > SAFE.x1 + 1 || it.r.y0 < SAFE.y0 || it.r.y1 > SAFE.y1) add(`E|安全區|${it.name} 超出安全區`, f);
      if (it.kind !== "card" && it.r.y1 > L.CAP_TOP + 2) add(`E|字幕|${it.name} 壓到字幕框`, f);
      if (mr && (it.kind === "label" || it.kind === "stamp") && area(it.r, mr) > 0) add(`E|模型|${it.name} 壓到模型`, f);
    }
    for (let i = 0; i < items.length; i++) for (let j = i + 1; j < items.length; j++) {
      const a = items[i], b = items[j];
      if (!hit(a.r, b.r)) continue;
      // 蓋章故意疊在卡片上（一起退場）不算；兩張卡、標籤和任何東西、蓋章和蓋章重疊都算
      if ((a.kind === "stamp" && b.kind === "card") || (a.kind === "card" && b.kind === "stamp")) continue;
      add(`E|重疊|${a.name} 和 ${b.name} 重疊`, f);
    }
  }
  for (const [key, rs] of Object.entries(runs)) for (const fr of rs) { const [lv, kind, msg] = key.split("|"); (lv === "E" ? E : W)(kind, msg, fr); }
  return { issues: out, stats: { frames: total, labels: lab.length, overlays: ovs.length }, labels: lab.map((p) => ({ text: p.l.text, at: p.l.at, until: p.l.until, rect: p.rect })), overlays: ovs.map((o) => ({ type: o.type, text: o.text ?? o.title ?? o.kicker, at: o.at, until: o.until, x: o.x, y: o.y, rect: o.type === "stamp" ? stampRect(o, o.x ?? 540, o.y ?? 856) : cardRect(o, L) })) };
};

const resolveAt = (tl: any, sceneId: string, spec: string) => {
  const by: Record<string, any> = Object.fromEntries(tl.scenes.map((x: any, i: number) => [x.id, { ...x, exit: tl.scenes[i + 1]?.startFrame ?? tl.totalFrames }]));
  const r = /^(?:([^\s:+-]+):)?([^\s:+-]+)([+-]\d+)?$/.exec(spec)!, t = r[1] ? by[r[1]] : by[sceneId];
  const base = r[2] === "start" ? t.startFrame : r[2] === "voice" ? t.voiceStartFrame : r[2] === "end" ? t.voiceEndFrame : r[2] === "exit" ? t.exit : t.cues.find((q: any) => q.id === r[2])?.frame;
  return base + Number(r[3] ?? 0);
};

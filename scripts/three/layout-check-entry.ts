// scripts/three/layout-check.mjs 用 esbuild 打包這支（不開瀏覽器）：用和畫面同一份的 engine.ts／hudLayout.ts 算每一幀的版面，找出
// 標籤／蓋章壓到模型、兩張卡同時出現又重疊、內容超出安全區、內容底部太高（下方空白太多）、小字太小、片尾卡太短。
import { buildModel, stateAt } from "../../src/components/three/engine";
import { cardRect, visibleMain, hit, area, hookRect, hudReserved, planHud, stampRect, textW, visible, zoomKeys, ENDCARD_SETTLED, ENDCARD, METER_H, type Rect } from "../../src/components/three/hudLayout";
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
    // 留言關鍵字（2026/11/15 Andy）：每支片尾卡都要有、2～4 字、字級 ≥40、在 LOGO 落定後出現、整行在安全區與片尾卡框內
    if (!ec.comment) W("片尾卡", "endCard.comment 沒寫：每支影片要訂一個留言關鍵字（2～4 字），片尾卡顯示「留言「關鍵字」拿完整資料」");
    else {
      const n = [...String(ec.comment)].length, line = `留言「${ec.comment}」拿完整資料`, px = L.ENDCARD_COMMENT_PX, w = textW(line, px), top = L.STAGE_TOP + 300 + 868;
      if (n < 2 || n > 4) E("片尾卡", `留言關鍵字「${ec.comment}」${n} 字，要 2～4 字`);
      if (px < 40) E("小字", `片尾卡留言關鍵字 ${px}px < 40`);
      if (w > L.INNER_W - 40) E("片尾卡", `「${line}」寬約 ${Math.round(w)}px，放不下一行`);
      if (top + px * 1.4 > Math.min(SAFE.y1, L.CAP_TOP + L.CAP_H, L.IG_SAFE_BOTTOM)) E("片尾卡", `留言關鍵字那一行超出片尾卡框（下緣 y${Math.round(top + px * 1.4)}）`);
      if (ENDCARD.comment < ENDCARD.dot[1] + 6) E("片尾卡", "留言關鍵字要等 LOGO 落定後才出現");
      if (len - (ENDCARD.comment + 8) < 30) E("片尾卡", "留言關鍵字出現後停不到 1 秒");
    }
    if (len - ENDCARD_SETTLED < 30) E("片尾卡", `片尾卡動畫在第 ${ENDCARD_SETTLED} 幀才落定，之後只停 ${((len - ENDCARD_SETTLED) / 30).toFixed(2)} 秒（要 ≥1 秒）`);
  }
  // 出處列：一行要放得下（Hud.tsx 會縮字，但不低於 30px）
  for (const sc of script.scenes) {
    const j = (sc.sources ?? []).join("、");
    if (!j) continue;
    const text = /^(資料)?來源|示意/.test(j) ? j : `來源：${j}`, need = (srcPx * (L.INNER_W - 30)) / textW(text, srcPx, 0.02);
    if (need < 30) E("小字", `${sc.id} 出處列太長，一行放不下要縮到 ${Math.floor(need)}px（<30）：改短「${text}」`);
  }
  // IG／Reels 底部介面（約 y1600 以下會被漸層蓋住）：字幕卡要在上面；出處可以在下面但要知道會被蓋
  if (L.CAP_TOP + L.CAP_H > L.IG_SAFE_BOTTOM) E("IG 底部", `字幕卡下緣 y${L.CAP_TOP + L.CAP_H} 超過 y${L.IG_SAFE_BOTTOM}（IG 底部介面會蓋住）`);
  if (L.SRC_TOP + L.SRC_PX > L.IG_SAFE_BOTTOM && L.IG_SAFE_BOTTOM < 1920) W("IG 底部", `出處列在 y${L.SRC_TOP} 起，IG 上會被底部漸層蓋住（規則允許，只放出處）`);
  // ── 逐幀 ──
  const m = buildModel(script.scenes, tl, script.model);
  const keys = zoomKeys(script.scenes, tl, hud, H.motion.zoom, H.motion.drift);
  const hookOut = keys.find((k) => !k.drift && k.at > 0)?.at ?? 1e9;
  const enPx0 = Math.max(28, small), plan = planHud(m, L, hud, keys, enPx0, hookOut), lab = plan.labels, ovs = plan.overlays;
  for (const o of ovs) if (o._delayed) W("換幕", `${o.type}「${o.text ?? o.title ?? o.kicker ?? ""}」和前一張重疊，自動延後 ${o._delayed} 幀進場（舊的退場完才進）`);
  for (const o of ovs) if (o._moved) W("避開模型", `蓋章「${o.text}」原本會壓到主素材或其他東西，自動挪到 (${Math.round(o.x ?? 540)}, ${Math.round(o.y)})`);
  for (const t of plan.triggers) W("主素材讓位", `${t.why} 出現期間（第 ${Math.max(0, t.at)}–${t.until} 幀）主素材先縮小移開`);
  const ovRect = (o: any): Rect | null => (o.type === "stamp" ? stampRect(o, o.x ?? L.W / 2, o.y ?? L.STAGE_TOP + L.STAGE_H / 2) : cardRect(o, L));
  const ovK = (o: any, f: number) => tween(f, o.at, 5, EASE.enter) * (1 - tween(f, o.until, 6, EASE.exit));
  const runs: Record<string, [number, number][]> = {};
  const add = (key: string, f: number) => { const rs = (runs[key] ??= []), r = rs[rs.length - 1]; if (r && r[1] >= f - 2) r[1] = f; else rs.push([f, f]); };
  const meters = Object.entries(m.product.actions ?? {}).filter(([, d]) => d.type === "meter" && d.x !== undefined);
  const bands = L.BAND_TOP ? hudReserved(L) : [];
  const HE = hud.layout === "fill" ? "E" : "W";
  let occl = 0;
  for (let f = 0; f < total; f++) {
    const s = stateAt(m, f), main = visibleMain(plan.mainAt(f), L, !plan.is3D(f)), mr = plan.is3D(f) ? main : null;
    const items: { name: string; r: Rect; kind: string }[] = [];
    for (const o of ovs) { if (!visible(o, f) || ovK(o, f) < 0.15) continue; const r = ovRect(o); if (r) items.push({ name: `${o.type === "stamp" ? (o.style === "tag" ? "小標" : "蓋章") : o.type}「${o.text ?? o.title ?? o.kicker ?? ""}」`, r, kind: o.type === "stamp" ? "stamp" : "card" }); }
    for (const { l, rect } of lab) {
      const k = tween(f, l.at + 3, 6, EASE.enter) * (1 - tween(f, l.until, 6, EASE.exit));
      if (k < 0.15) continue;
      items.push({ name: `標籤「${l.text}」`, r: rect, kind: "label" });
    }
    for (const [id, d] of meters) { const op = s.ops[id]; if (op && op.k > 0.15) items.push({ name: `儀表「${d.label}」`, r: { x0: d.x!, y0: d.y!, x1: d.x! + (d.w ?? 330), y1: d.y! + METER_H }, kind: "meter" }); }
    if (m.hook && f < hookOut + 8) items.push({ name: "鉤子大字", r: hookRect(m.hook as any, L), kind: "hook" });
    const hudItems = bands.map((r, i) => ({ name: i ? "HUD 讀數（下帶：尺標、示意圖標示）" : "HUD 讀數（上帶：層級、倍率、FIELD）", r, kind: "hud" }));
    for (const it of items) {
      if (it.r.x0 < SAFE.x0 - 1 || it.r.x1 > SAFE.x1 + 1 || it.r.y0 < SAFE.y0 || it.r.y1 > SAFE.y1) add(`E|安全區|${it.name} 超出安全區`, f);
      if (it.kind !== "card" && it.r.y1 > L.CAP_TOP + 2) add(`E|字幕|${it.name} 壓到字幕框`, f);
      if (mr && (it.kind === "label" || it.kind === "stamp") && area(it.r, mr) > 0) add(`E|模型|${it.name} 壓到模型`, f);
    }
    // 主素材遮擋（2026/11/15 Andy：「避免中間重要的素材被遮擋」）：任何疊層和主素材框重疊超過主素材框面積的 5%
    if (main) {
      const A0 = Math.max(1, (main.x1 - main.x0) * (main.y1 - main.y0));
      for (const it of [...items, ...hudItems]) { const r = area(it.r, main) / A0; if (r > 0.05) { add(`${HE}|主素材遮擋|${it.name} 蓋到主素材（${plan.is3D(f) ? "3D 模型" : "2D 圖"}）超過 5%`, f); occl++; } }
    }
    for (let i = 0; i < items.length; i++) for (let j = i + 1; j < items.length; j++) {
      const a = items[i], b = items[j];
      if (!hit(a.r, b.r)) continue;
      if ((a.kind === "stamp" && b.kind === "card") || (a.kind === "card" && b.kind === "stamp")) continue;
      add(`E|重疊|${a.name} 和 ${b.name} 重疊`, f);
    }
  }
  for (const [key, rs] of Object.entries(runs)) for (const fr of rs) { const [lv, kind, msg] = key.split("|"); (lv === "E" ? E : W)(kind, msg, fr); }
  return { issues: out, stats: { frames: total, labels: lab.length, overlays: ovs.length, occlusionFrames: occl }, labels: lab.map((p) => ({ text: p.l.text, at: p.l.at, until: p.l.until, rect: p.rect })), overlays: ovs.map((o) => ({ type: o.type, text: o.text ?? o.title ?? o.kicker, at: o.at, until: o.until, x: o.x, y: o.y, rect: o.type === "stamp" ? stampRect(o, o.x ?? 540, o.y ?? 856) : cardRect(o, L) })) };
};

const resolveAt = (tl: any, sceneId: string, spec: string) => {
  const by: Record<string, any> = Object.fromEntries(tl.scenes.map((x: any, i: number) => [x.id, { ...x, exit: tl.scenes[i + 1]?.startFrame ?? tl.totalFrames }]));
  const r = /^(?:([^\s:+-]+):)?([^\s:+-]+)([+-]\d+)?$/.exec(spec)!, t = r[1] ? by[r[1]] : by[sceneId];
  const base = r[2] === "start" ? t.startFrame : r[2] === "voice" ? t.voiceStartFrame : r[2] === "end" ? t.voiceEndFrame : r[2] === "exit" ? t.exit : t.cues.find((q: any) => q.id === r[2])?.frame;
  return base + Number(r[3] ?? 0);
};

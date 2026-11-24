// scripts/three/layout-check.mjs 用 esbuild 打包這支（不開瀏覽器）：用和畫面同一份的 engine.ts／hudLayout.ts 算每一幀的版面，找出
// 標籤／蓋章壓到模型、兩張卡同時出現又重疊、內容超出安全區、內容底部太高（下方空白太多）、小字太小、片尾卡太短。
import { buildModel, stateAt } from "../../src/components/three/engine";
import { rulerLen, zoomAt, meters as metersOf, cardRect, centerOf, endcardGeom, endcardTimes, visibleMain, hit, area, hookRect, hudReserved, planHud, stampRect, textW, visible, zoomKeys, ENDCARD_SETTLED, ENDCARD, METER_H, type Rect } from "../../src/components/three/hudLayout";
import { setHudLayout, setHudSkin, H } from "../../src/components/three/hudSkin";
import { cameraFor, projectPoint } from "../../src/components/three/engine";
import { EASE, tween } from "../../src/components/anim";

type Issue = { level: "error" | "warn"; kind: string; msg: string; frames?: [number, number] };

export const check = (script: any) => {
  const out: Issue[] = [];
  let edgeStats: Record<string, number> = {};
  const E = (kind: string, msg: string, frames?: [number, number]) => out.push({ level: "error", kind, msg, frames });
  const W = (kind: string, msg: string, frames?: [number, number]) => out.push({ level: "warn", kind, msg, frames });
  const hud = script.hud, tl = script.timeline;
  if (!hud || !tl) return { issues: out, stats: {} };
  setHudSkin(script.hudSkin, hud.smallPx);
  const L = setHudLayout(hud.layout) as any;
  const total = tl.totalFrames, SAFE = { x0: 64, y0: L.SAFE_TOP ?? 220, x1: 1080 - 64, y1: L.FOOT_H ? 1920 - (L.EDGE_BLANK_MAX || 60) : 1920 - 220 };
  // ── 靜態規則 ──
  if (hud.layout !== "fill") W("版面", "hud.layout 不是 \"fill\"：LOGO 仍是小的、下方空白沒填滿（2026/11/15 使用者回饋）");
  const capBottom = L.CAP_TOP + L.CAP_H, srcBottom = L.SRC_TOP + L.SRC_PX * 1.3;
  if (Math.max(capBottom, srcBottom) < 1600) E("版面", `內容底部只到 y${Math.round(Math.max(capBottom, srcBottom))}：下方空白太多，要撐到約 y1650–1700`);
  // 頂端／底端空白帶（2026/11/15 v7，Andy：「紅框處還有空間…每個頻道都要注意」）：沒有任何內容的橫條超過 EDGE_BLANK_MAX（60px）判 error
  const rows: [number, number, string][] = [
    ...((H as any).light ? [[0, 14, "頂端色條"] as [number, number, string]] : []),
    [L.HEADER_TOP, L.HEADER_TOP + L.HEADER_H, "頁首"], [L.PROGRESS_TOP - 8, L.PROGRESS_TOP - 5, "進度線"], [L.STAGE_TOP, L.STAGE_TOP + L.STAGE_H, "舞台"],
    [L.CAP_TOP, capBottom, "字幕卡"], [L.SRC_TOP, srcBottom, "出處"], ...(L.FOOT_H ? [[L.FOOT_TOP, L.FOOT_TOP + L.FOOT_H, "頁尾帶"] as [number, number, string]] : []),
  ];
  rows.sort((a, b) => a[0] - b[0]);
  const topBlank = rows[0][0], bottomEnd = Math.max(...rows.map((r) => r[1])), bottomBlank = 1920 - bottomEnd, EB = L.EDGE_BLANK_MAX || 60;
  const edgeErr = hud.layout === "fill" ? E : W;
  if (topBlank > EB) edgeErr("版面", `頂端空白帶 ${Math.round(topBlank)}px（y0–${Math.round(topBlank)} 沒有任何內容，上限 ${EB}px）`);
  if (bottomBlank > EB) edgeErr("版面", `底端空白帶 ${Math.round(bottomBlank)}px（y${Math.round(bottomEnd)}–1920 沒有任何內容，上限 ${EB}px）`);
  for (let i = 1; i < rows.length; i++) { const gap = rows[i][0] - Math.max(...rows.slice(0, i).map((r) => r[1])); if (gap > EB) W("版面", `${rows[i - 1][2]}和${rows[i][2]}中間空了 ${Math.round(gap)}px`); }
  edgeStats = { topBlank: Math.round(topBlank), bottomBlank: Math.round(bottomBlank), bottomEnd: Math.round(bottomEnd) };
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
      const n = [...String(ec.comment)].length, line = `留言「${ec.comment}」拿完整資料`, px = L.ENDCARD_COMMENT_PX, w = textW(line, px), top = endcardGeom(L, !!ec.logoAnim).comment;
      if (n < 2 || n > 4) E("片尾卡", `留言關鍵字「${ec.comment}」${n} 字，要 2～4 字`);
      if (px < 40) E("小字", `片尾卡留言關鍵字 ${px}px < 40`);
      if (w > L.INNER_W - 40) E("片尾卡", `「${line}」寬約 ${Math.round(w)}px，放不下一行`);
      if (top + px * 1.4 > Math.min(SAFE.y1, L.CAP_TOP + L.CAP_H, L.IG_SAFE_BOTTOM)) E("片尾卡", `留言關鍵字那一行超出片尾卡框（下緣 y${Math.round(top + px * 1.4)}）`);
      const ET = endcardTimes(ec.logoAnim);
      if (ET.comment < ET.dot[1] + 6) E("片尾卡", "留言關鍵字要等 LOGO 落定後才出現");
      if (len - (ET.comment + 8) < 30) E("片尾卡", "留言關鍵字出現後停不到 1 秒");
    }
    const ST = endcardTimes(ec.logoAnim).settled;
    if (len - ST < 30) E("片尾卡", `片尾卡動畫在第 ${ST} 幀才落定，之後只停 ${((len - ST) / 30).toFixed(2)} 秒（要 ≥1 秒）`);
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
  for (const o of ovs) if (o._moved) W("避開模型", `${o.type === "stamp" ? "蓋章" : o.type}「${o.text ?? o.title ?? o.kicker ?? ""}」原本會壓到主素材或其他東西，自動挪到 (${Math.round(o.x ?? 540)}, ${Math.round(o.y)})`);
  for (const o of ovs) if (o._backdrop) W("主素材退成背景", `${o.type}「${o.text ?? o.title ?? o.kicker ?? ""}」放不下、會蓋到主素材正中央：出現期間主素材降到半透明當背景`);
  for (const t of plan.triggers) W("主素材讓位", `${t.why} 出現期間（第 ${Math.max(0, t.at)}–${t.until} 幀）主素材先縮小移開`);
  const ovRect = (o: any): Rect | null => (o.type === "stamp" ? stampRect(o, o.x ?? L.W / 2, o.y ?? L.STAGE_TOP + L.STAGE_H / 2) : cardRect(o, L));
  const ovK = (o: any, f: number) => tween(f, o.at, 5, EASE.enter) * (1 - tween(f, o.until, 6, EASE.exit));
  const runs: Record<string, [number, number][]> = {};
  const add = (key: string, f: number) => { const rs = (runs[key] ??= []), r = rs[rs.length - 1]; if (r && r[1] >= f - 2) r[1] = f; else rs.push([f, f]); };
  const meters = Object.entries(m.product.actions ?? {}).filter(([, d]) => d.type === "meter" && d.x !== undefined);
  // 比例尺（2026/11/24 tech-mask1：「2 μm」用了希臘 μ 讀不懂 → 比例尺長度 NaN，只剩一根豎線）：
  // 靜態：每一級 field、ruler 都要讀得懂；逐幀：照 Hud.tsx 同一支 rulerLen 算長度（含 3D 鏡頭推拉的 camK），非有限數字判 error
  for (const lv of hud.levels) for (const [k, v] of [["field", lv.field], ["ruler", lv.ruler]] as const)
    if (!(metersOf(v) > 0)) E("比例尺", `層級「${lv.label}」的 ${k}「${v}」讀不懂（單位要是 m／cm／mm／µm 或 μm／nm，數字在前）`);
  {
    const hand = keys.find((k) => hud.levels[k.to]?.handoff3D), d0 = hand ? stateAt(m, hand.at + hand.dur).cam.d : 0;
    const bad: number[] = [];
    for (let f = 0; f < total; f += 3) {
      const z = zoomAt(hud, keys, f), lvl = z.level ?? hud.levels[0];
      if (lvl.readout === false) continue;
      const camK = z.handoff > 0.99 && d0 > 0 ? d0 / stateAt(m, f).cam.d : 1, px = rulerLen(L, lvl.ruler, z.logField, camK);
      if (!Number.isFinite(px) || px <= 0) bad.push(f);
    }
    if (bad.length) E("比例尺", `比例尺長度算不出來（NaN／0）共 ${bad.length} 個抽樣幀，例如第 ${bad.slice(0, 5).join("、")} 幀：畫面只會剩一根豎線`, [bad[0], bad[bad.length - 1]]);
  }
  const bands = L.BAND_TOP ? hudReserved(L) : [];
  const HE = hud.layout === "fill" ? "E" : "W";
  const ymd = String(script.asOf ?? "").split(/[\/-]/).map(Number), LE = ymd.length === 3 && ymd[0] * 10000 + ymd[1] * 100 + ymd[2] >= 20261121 ? "E" : "W";
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
      
    }
    // 主素材遮擋（2026/11/15 Andy：「避免中間重要的素材被遮擋」；v6 改兩級）：蓋到主素材「中央區域」（寬高各取中間一半）→ error；只蓋到外圈邊緣（>5%）→ warning。
    // 主素材在卡片出現期間退成背景（_backdrop，planHud 的 dimAt）時不算遮擋，另記一筆 warning
    if (main && plan.dimAt(f) > 0.5) add(`W|主素材退成背景|卡片放不下、主素材在卡片出現期間降到半透明`, f);
    else if (main) {
      const A0 = Math.max(1, (main.x1 - main.x0) * (main.y1 - main.y0)), C = centerOf(main), AC = Math.max(1, (C.x1 - C.x0) * (C.y1 - C.y0)), what = plan.is3D(f) ? "3D 模型" : "2D 圖";
      for (const it of [...items, ...hudItems]) {
        if (area(it.r, C) / AC > 0.01) { add(`${HE}|主素材遮擋|${it.name} 蓋到主素材（${what}）正中央`, f); occl++; }
        else if (area(it.r, main) / A0 > 0.05) add(`W|主素材邊緣|${it.name} 蓋到主素材（${what}）邊緣（超過 5%，沒蓋到中央）`, f);
      }
    }
    // 3D 標籤卡互相距離 <8px（2026/11/21 Andy 退件：量測 s3、s8 兩框貼在一起）＋引線穿過別張標籤卡：asOf 11/21 以後的片 error，舊片 warning
    const labOn = items.filter((it) => it.kind === "label");
    for (let i = 0; i < labOn.length; i++) for (let j = i + 1; j < labOn.length; j++) if (!hit(labOn[i].r, labOn[j].r) && hit(labOn[i].r, labOn[j].r, 8)) add(`${LE}|標籤間距|${labOn[i].name} 和 ${labOn[j].name} 距離 <8px（貼在一起）`, f);
    if (labOn.length > 1) {
      const cam = cameraFor(s), yv = plan.base3D;
      for (const { l, an, x, y, left, rect } of lab) {
        const k = tween(f, l.at + 3, 6, EASE.enter) * (1 - tween(f, l.until, 6, EASE.exit)); if (k < 0.15) continue;
        const p0 = projectPoint(s, cam, an.layer, an.p), p = { x: p0.x * yv.s + yv.ox, y: p0.y * yv.s + yv.oy }, kx = x + (left ? 30 : -30);
        const segs: [number, number, number, number][] = [[p.x, p.y, kx, y], [kx, y, x, y]];
        for (const o of labOn) { if (o.r === rect) continue; const r = { x0: o.r.x0 + 2, y0: o.r.y0 + 2, x1: o.r.x1 - 2, y1: o.r.y1 - 2 };
          if (segs.some(([ax, ay, bx, by]) => segHitsRect(ax, ay, bx, by, r))) add(`${LE}|引線穿過標籤|標籤「${l.text}」的引線穿過 ${o.name}`, f); }
      }
    }
    for (let i = 0; i < items.length; i++) for (let j = i + 1; j < items.length; j++) {
      const a = items[i], b = items[j];
      if (!hit(a.r, b.r)) continue;
      if ((a.kind === "stamp" && b.kind === "card") || (a.kind === "card" && b.kind === "stamp")) continue;
      add(`E|重疊|${a.name} 和 ${b.name} 重疊`, f);
    }
  }
  for (const [key, rs] of Object.entries(runs)) for (const fr of rs) { const [lv, kind, msg] = key.split("|"); (lv === "E" ? E : W)(kind, msg, fr); }
  return { issues: out, stats: { ...edgeStats, frames: total, labels: lab.length, overlays: ovs.length, occlusionFrames: occl }, mainSamples: Array.from({ length: Math.ceil(total / 15) }, (_, i) => { const r = plan.mainAt(i * 15); return [i * 15, r ? [r.x0, r.y0, r.x1, r.y1].map(Math.round) : null]; }), labels: lab.map((p) => ({ text: p.l.text, at: p.l.at, until: p.l.until, rect: p.rect })), overlays: ovs.map((o) => ({ type: o.type, text: o.text ?? o.title ?? o.kicker, at: o.at, until: o.until, x: o.x, y: o.y, rect: o.type === "stamp" ? stampRect(o, o.x ?? 540, o.y ?? 856) : cardRect(o, L) })) };
};

/** 線段 (ax,ay)–(bx,by) 有沒有穿過矩形 r（取樣 2px） */
const segHitsRect = (ax: number, ay: number, bx: number, by: number, r: Rect) => { const n = Math.max(1, Math.ceil(Math.hypot(bx - ax, by - ay) / 2)); for (let i = 0; i <= n; i++) { const x = ax + ((bx - ax) * i) / n, y = ay + ((by - ay) * i) / n; if (x > r.x0 && x < r.x1 && y > r.y0 && y < r.y1) return true; } return false; };
const resolveAt = (tl: any, sceneId: string, spec: string) => {
  const by: Record<string, any> = Object.fromEntries(tl.scenes.map((x: any, i: number) => [x.id, { ...x, exit: tl.scenes[i + 1]?.startFrame ?? tl.totalFrames }]));
  const r = /^(?:([^\s:+-]+):)?([^\s:+-]+)([+-]\d+)?$/.exec(spec)!, t = r[1] ? by[r[1]] : by[sceneId];
  const base = r[2] === "start" ? t.startFrame : r[2] === "voice" ? t.voiceStartFrame : r[2] === "end" ? t.voiceEndFrame : r[2] === "exit" ? t.exit : t.cues.find((q: any) => q.id === r[2])?.frame;
  return base + Number(r[3] ?? 0);
};

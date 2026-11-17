// 科技片零件與動作庫入口。把「只寫資料」的 model.json／script.json 展開成引擎認得的完整資料：
//   expandModel(raw)        model.json 的 parts 裡 { "part": "wafer", ... } → 一組零件／層／標註點／動作；actions 裡 { "preset": "current", ... } → 動作
//   expandScript(script, m) script.json 每幕 props.motion: [{ "preset": "pick-place", ... }] → props.shift／props.run
//   loadExpanded(script)    兩個一起做（script.model 已有就用它，否則讀 videos/<slug>/model.json）
// 沒用到零件庫的舊片（parts 全是 shape、沒有 preset、沒有 motion）原樣回傳，不受影響。格式與參數見 docs/three-parts.md。
import fs from "node:fs";
import path from "node:path";
import { PARTS, PART_NAMES } from "./parts.mjs";
import { ACTION_PRESETS, MOTIONS, takeColors } from "./motions.mjs";
import { LIB_MAT, M_, mergeLib, mergeColors } from "./materials.mjs";

export { PART_NAMES };
const R2 = (x) => Math.round(x * 1000) / 1000;
const add3 = (p, q) => [R2(p[0] + (q[0] ?? 0)), R2(p[1] + (q[1] ?? 0)), R2(p[2] + (q[2] ?? 0))];
const clone = (x) => JSON.parse(JSON.stringify(x));

/** 一個零件實例的工具包（parts.mjs 的 c） */
const makeCtx = (o, out, used) => {
  const id = o.id ?? o.part, layer = o.layer ?? id, pos = o.pos ?? [0, 0, 0];
  const c = {
    id, layer, pos, out,
    P(name, def) {
      const { abs, mat, pos: dp = [0, 0, 0], layer: L, split, ...rest } = def, over = o.mats?.[mat];
      if (!over) used.add(mat);
      // split（2026/11/17）：at 的每一份各自成為獨立零件（<名稱>0、<名稱>1…），旋轉時各自繞自己的位置（輸送軌的每支滾輪、堆疊裡的每一塊）；沒寫 split 的 at 照舊合併成一個零件
      if (split && rest.at) {
        const { at, ...r2 } = rest;
        at.forEach((a, i) => out.parts.push({ id: `${id}_${name}${i}`, layer: L ?? layer, ...r2, pos: abs ? add3(dp, a) : add3(pos, add3(dp, a)), mat: over ?? M_ + mat }));
        return;
      }
      out.parts.push({ id: `${id}_${name}`, layer: L ?? layer, ...rest, pos: abs ? dp.map(R2) : add3(pos, dp), mat: over ?? M_ + mat });
    },
    L(lid, extra = {}) { out.layers.push({ id: lid, z: o.z ?? 0, k: o.k ?? 0, ...extra }); },
    outline(w, d) { out.outline = [R2(w), R2(d), pos[0], pos[2]]; },
    anchor(name, a) { out.anchors[name ? `${id}_${name}` : id] = { layer: a.layer ?? layer, p: a.abs ? a.p.map(R2) : add3(pos, a.p), dx: o.label?.dx ?? a.dx ?? 100, dy: o.label?.dy ?? a.dy ?? -80 }; },
    /** 名稱開頭符合的零件 id（要在 P 之後呼叫） */
    ids(...names) { return out.parts.filter((p) => names.some((n) => p.id.startsWith(`${id}_${n}`))).map((p) => p.id); },
    act(name, def, colors = []) { out.actions[`${id}_${name}`] = { layer: layer, ...def }; for (const k of colors) out.colors.add(k); },
  };
  return c;
};

/** "@id" ／ "@id:名稱" → 該實例（符合名稱開頭）的所有零件 id */
const refs = (list, parts) => (list ?? []).flatMap((s) => {
  if (typeof s !== "string" || s[0] !== "@") return [s];
  const [id, name = ""] = s.slice(1).split(":"), pre = `${id}_${name}`, hit = parts.filter((p) => p.id.startsWith(pre)).map((p) => p.id);
  if (!hit.length) throw new Error(`零件庫：「${s}」找不到任何零件`);
  return hit;
});

export const expandModel = (raw) => {
  if (!raw) return raw;
  const usesPart = (raw.parts ?? []).some((p) => p.part), usesPreset = Object.values(raw.actions ?? {}).some((a) => a?.preset);
  if (!usesPart && !usesPreset) return raw;
  const m = clone(raw); m.layers ??= []; m.anchors ??= {}; m.actions ??= {};
  const used = new Set(), colors = new Set(), parts = [], have = new Set(m.layers.map((l) => l.id));
  const addLayer = (l) => { if (!have.has(l.id)) { have.add(l.id); m.layers.push(l); } };
  const actions = {};
  for (const p of raw.parts ?? []) {
    if (!p.part) { parts.push(p); continue; }
    const gen = PARTS[p.part];
    if (!gen) throw new Error(`零件庫沒有「${p.part}」（可用：${PART_NAMES.join("、")}）`);
    const out = { parts: [], layers: [], anchors: {}, actions: {}, info: {}, outline: null, colors }, c = makeCtx(p, out, used);
    gen(p, c);
    const lid = c.layer;
    addLayer({ id: lid, z: p.z ?? 0, k: p.k ?? 0, ...(out.outline ? { outline: out.outline } : {}), ...(p.bg ? { bg: true } : {}) });
    out.layers.forEach((l) => addLayer(l));
    for (const q of out.parts) parts.push(q);
    Object.assign(m.anchors, out.anchors, clone(raw.anchors ?? {}));
    Object.assign(actions, out.actions);
  }
  m.parts = parts;
  // actions：先放零件自帶的，再放 model.json 自己寫的（同名以自己寫的為準）；preset 在這裡展開，"@id" 換成零件 id
  for (const [k, a] of Object.entries(raw.actions ?? {})) {
    if (a?.preset) {
      const f = ACTION_PRESETS[a.preset];
      if (!f) throw new Error(`model.actions「${k}」的 preset「${a.preset}」不存在（${Object.keys(ACTION_PRESETS).join("、")}）`);
      const { preset, parts: pr, ...rest } = a;
      for (const [suf, def] of Object.entries(f({ ...rest, parts: pr ? refs(pr, parts) : undefined }))) actions[k + suf] = Object.fromEntries(Object.entries(def).filter(([, v]) => v !== undefined));
      for (const cn of takeColors()) colors.add(cn);
    } else actions[k] = a;
  }
  for (const a of Object.values(actions)) { if (a.parts) a.parts = refs(a.parts, parts); if (a.level) a.level = refs(a.level, parts); }
  m.actions = actions;
  mergeLib(m, used); mergeColors(m, colors);
  // 零件自帶動作用到的色票名是 lp_xxx 全名；補上
  for (const a of Object.values(actions)) for (const k of ["color", "rim", "trailColor"]) { const v = a[k]; if (typeof v === "string" && v.startsWith("lp_")) mergeColors(m, [v.slice(3)]); }
  m.anchors = { ...m.anchors, ...(raw.anchors ?? {}) };
  return m;
};

/** script.json 每幕 props.motion → props.shift／props.run（原本就有的 shift／run 留著，motion 的接在後面） */
export const expandScript = (script, model) => {
  if (!script?.scenes?.some((s) => s.props?.motion)) return script;
  const s2 = clone(script);
  for (const sc of s2.scenes) {
    const mo = sc.props?.motion; if (!mo) continue;
    const shift = [].concat(sc.props.shift ?? []), run = [].concat(sc.props.run ?? []);
    for (const o of [].concat(mo)) {
      const f = MOTIONS[o.preset];
      if (!f) throw new Error(`${sc.id}: props.motion 的 preset「${o.preset}」不存在（${Object.keys(MOTIONS).join("、")}）`);
      const r = f(o, o, model ?? {});
      shift.push(...r.shift); run.push(...r.run);
    }
    delete sc.props.motion;
    if (shift.length) sc.props.shift = shift; if (run.length) sc.props.run = run;
  }
  return s2;
};

/** 讀 script（已經是物件）＋該片的 model.json，兩個一起展開；回傳 { script, model } */
export const loadExpanded = (script, root) => {
  const mp = path.join(root, "videos", String(script.slug), "model.json");
  let model = script.model ?? (fs.existsSync(mp) ? JSON.parse(fs.readFileSync(mp, "utf8")) : null);
  model = expandModel(model);
  return { script: expandScript(script, model), model };
};

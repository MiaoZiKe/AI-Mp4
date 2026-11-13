// 亮色雜誌編排（styleVersion 3 ＋ stage: "editorial"）：米白底、粗黑大標、一個番茄紅強調色、細欄線與大留白。
// 每一幕是一頁版面（props.page）：線長出來、字從遮罩後面升起、重點用色筆劃線、AI 的回答是一塊被剪下的引文。沒有視窗、游標、卡片陰影。
// 時間全部來自 timeline（engine.ts）；顏色與版面讀 THEME_EDITORIAL／LAYOUT_EDITORIAL，這裡不寫死色碼；畫面上的字都來自 script.json。
import React, { useMemo } from "react";
import { AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame } from "remotion";
import type { Script, TimelineV2 } from "../../types";
import { FONT_EN, FONT_ZH, FPS, LAYOUT_EDITORIAL as L, THEME_EDITORIAL as T } from "../../theme";
import { EASE, tween } from "../anim";
import { buildEditorial, type Page } from "./engine";

const M = T.motion, A = T.accent;
const zh: React.CSSProperties = { fontFamily: FONT_ZH, whiteSpace: "nowrap", lineHeight: 1.14 };
const num: React.CSSProperties = { fontFamily: FONT_EN, whiteSpace: "nowrap", lineHeight: 1, fontWeight: T.weight.title, letterSpacing: "-0.04em", fontVariantNumeric: "tabular-nums" };
const abs = (x: number, y: number, extra?: React.CSSProperties): React.CSSProperties => ({ position: "absolute", left: x, top: y, ...extra });

/** 線：從左往右長出來 */
const Rule: React.FC<{ f: number; at: number; x?: number; y: number; w?: number; h?: number; color?: string; vertical?: boolean }> = ({ f, at, x = L.X, y, w = L.INNER_W, h = T.rule.hair, color = T.ink, vertical }) => {
  const p = tween(f, at, M.rule, EASE.move);
  return <div style={{ ...abs(x, y), width: vertical ? h : w, height: vertical ? w : h, background: color, transformOrigin: "0 0", transform: vertical ? `scaleY(${p.toFixed(4)})` : `scaleX(${p.toFixed(4)})` }} />;
};
/** 字從遮罩後面升起（雜誌版面常見的進場；不淡入） */
const Rise: React.FC<{ f: number; at: number; style?: React.CSSProperties; children: React.ReactNode }> = ({ f, at, style, children }) => {
  const p = tween(f, at, M.rise);
  return <div style={{ overflow: "hidden", ...style }}><div style={{ transform: `translateY(${((1 - p) * 108).toFixed(2)}%)` }}>{children}</div></div>;
};
/** 色筆線：畫在字的下緣，從左往右 */
const Pen: React.FC<{ f: number; at: number; color?: string; children: React.ReactNode }> = ({ f, at, color = A.fill, children }) => {
  const p = tween(f, at, M.pen, EASE.move);
  return <span style={{ whiteSpace: "nowrap", backgroundImage: `linear-gradient(${color},${color})`, backgroundRepeat: "no-repeat", backgroundSize: `${(100 * p).toFixed(1)}% 0.14em`, backgroundPosition: "0 96%" }}>{children}</span>;
};
const penned = (text: string, target: string | undefined, f: number, at: number, bold?: boolean) => {
  const i = target ? text.indexOf(target) : -1;
  if (i < 0 || !target) return text;
  return <>{text.slice(0, i)}<Pen f={f} at={at}><span style={{ fontWeight: bold ? T.weight.title : undefined }}>{target}</span></Pen>{text.slice(i + target.length)}</>;
};
const Strike: React.FC<{ f: number; at: number; color?: string; h?: number }> = ({ f, at, color = A.fill, h = T.rule.pen }) => (
  <span style={{ position: "absolute", left: "-1%", top: "52%", width: `${(102 * tween(f, at, M.strike, EASE.move)).toFixed(1)}%`, height: h, marginTop: -h / 2, background: color }} />
);
/** 欄目小標：紅色小方塊＋字 */
const Kicker: React.FC<{ text: string; y: number; f: number; at: number; color?: string; mark?: string }> = ({ text, y, f, at, color = T.ink2, mark = A.fill }) => (
  <Rise f={f} at={at} style={abs(L.X, y)}>
    <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
      <div style={{ width: 22, height: 22, background: mark }} />
      <div style={{ ...zh, fontWeight: T.weight.strong, fontSize: 30, letterSpacing: "0.06em", color }}>{text}</div>
    </div>
  </Rise>
);

type PP = { page: Page; f: number };
const COL_W = (L.INNER_W - L.COL_GAP) / 2;

/** 第 1 頁（鉤子）：第 0 幀就是完整的大標＋兩欄數字 */
const Hook: React.FC<PP> = ({ page: { p, at }, f }) => {
  const size = p.size ?? 150, lh = Math.round(size * 1.12), top = 410, ruleY = top + lh * p.title.length + 34;
  const nums: any[] = p.nums ?? [];
  return (
    <>
      <Kicker text={p.kicker} y={350} f={f} at={-99} />
      {(p.title as string[]).map((t, i) => (
        <div key={i} style={{ ...abs(L.X, top + i * lh), ...zh, fontWeight: T.weight.title, fontSize: size, letterSpacing: "-0.01em", color: T.ink }}>{penned(t, p.pen?.text, f, at(p.pen?.at, 0))}</div>
      ))}
      <Rule f={f} at={-99} y={ruleY} h={T.rule.thick} />
      <Rule f={f} at={-99} x={L.X + COL_W + L.COL_GAP / 2} y={ruleY + 30} w={282} color={T.hair} vertical />
      {nums.map((n, i) => {
        const x = L.X + i * (COL_W + L.COL_GAP), tagAt = n.tagAt ? at(n.tagAt) : -99;
        return (
          <React.Fragment key={i}>
            <div style={{ ...abs(x, ruleY + 28), ...zh, fontWeight: T.weight.strong, fontSize: 30, color: T.ink2 }}>{n.label}</div>
            <div style={{ ...abs(x, ruleY + 80), ...num, fontSize: 136, color: n.accent ? A.fill : T.ink }}>
              <span style={{ position: "relative", display: "inline-block" }}>{n.value}{n.strikeAt ? <Strike f={f} at={at(n.strikeAt)} /> : null}</span>
            </div>
            <Rise f={f} at={tagAt} style={abs(x, ruleY + 238)}>
              <div style={{ ...zh, fontWeight: T.weight.strong, fontSize: 36, color: n.strikeAt ? A.text : T.ink }}>{n.tag}</div>
            </Rise>
          </React.Fragment>
        );
      })}
      {p.stand ? (
        <>
          <Rule f={f} at={at(p.stand.at)} y={ruleY + 326} color={T.hair} />
          <Rise f={f} at={at(p.stand.at) + M.stagger} style={abs(L.X, ruleY + 348)}>
            <div style={{ ...zh, fontWeight: T.weight.body, fontSize: 38, color: T.ink2 }}>{p.stand.text}</div>
          </Rise>
        </>
      ) : null}
    </>
  );
};

/** 第 2 頁（提問）：大字母 Q＋條件表＋逐字排出來的那一句話＋「1 句話」 */
const Ask: React.FC<PP> = ({ page: { p, at, in: a }, f }) => {
  const specs: [string, string][] = p.specs ?? [], sAt = at(p.specsAt, a);
  const lines: string[] = p.prompt ?? [], total = lines.join("").length, t0 = at(p.typeAt, a);
  const shown = Math.max(0, Math.min(total, Math.floor((f - t0) / M.step)));
  const c = p.count ?? {}, cAt = at(c.at, a);
  let used = 0;
  return (
    <>
      <Kicker text={p.kicker} y={350} f={f} at={a} />
      <Rise f={f} at={a + 2} style={abs(L.X - 8, 404)}><div style={{ ...num, fontSize: 380, lineHeight: 0.86, color: A.fill }}>{p.letter}</div></Rise>
      {specs.map(([k, v], i) => {
        const y = 420 + i * 100, t = sAt + i * M.stagger;
        return (
          <React.Fragment key={i}>
            <Rule f={f} at={t} x={400} y={y} w={616} color={i === 0 ? T.ink : T.hair} />
            <Rise f={f} at={t + 2} style={abs(400, y + 22, { width: 616 })}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <div style={{ ...zh, fontWeight: T.weight.body, fontSize: 30, color: T.ink3 }}>{k}</div>
                <div style={{ ...zh, fontWeight: T.weight.strong, fontSize: 42, color: T.ink }}>{v}</div>
              </div>
            </Rise>
          </React.Fragment>
        );
      })}
      <Rule f={f} at={a + 4} y={756} h={T.rule.thick} />
      {lines.map((l, i) => {
        const n = Math.max(0, Math.min(l.length, shown - used)), caret = shown >= used && shown < used + l.length || (i === lines.length - 1 && shown >= total);
        used += l.length;
        const blink = shown >= total ? Math.floor((f - t0) / 8) % 2 === 0 : true;
        return (
          <div key={i} style={{ ...abs(L.X, 800 + i * 118), ...zh, fontWeight: T.weight.title, fontSize: 100, letterSpacing: "-0.01em", color: T.ink, height: 118 }}>
            <Pen f={f} at={cAt + i * M.stagger}>{l.slice(0, n)}</Pen>
            {caret && f >= t0 - 6 && f < cAt + 20 ? <span style={{ display: "inline-block", width: 8, height: 92, marginLeft: 8, verticalAlign: "-10px", background: A.fill, opacity: blink ? 1 : 0 }} /> : null}
          </div>
        );
      })}
      <Rule f={f} at={cAt} y={1064} color={T.hair} />
      <Rise f={f} at={cAt + 2} style={abs(L.X, 1084)}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 18 }}>
          <div style={{ ...num, fontSize: 168, color: A.fill }}>{c.value}</div>
          <div style={{ ...zh, fontWeight: T.weight.title, fontSize: 76, color: T.ink }}>{c.unit}</div>
        </div>
      </Rise>
      <Rise f={f} at={cAt + 2 + M.stagger} style={abs(L.X + 420, 1166, { width: L.INNER_W - 420 })}>
        <div style={{ ...zh, fontWeight: T.weight.body, fontSize: 36, color: T.ink2, textAlign: "right" }}>{c.note}</div>
      </Rise>
    </>
  );
};

/** 裁切記號：四個角各一組短線 */
const Crop: React.FC<{ x: number; y: number; w: number; h: number }> = ({ x, y, w, h }) => {
  const s = 26, g = 10, c = T.ink, t = T.rule.hair;
  const mk = (cx: number, cy: number, dx: number, dy: number, k: string) => (
    <React.Fragment key={k}>
      <div style={{ ...abs(dx < 0 ? cx - g - s : cx + g, cy - t / 2), width: s, height: t, background: c }} />
      <div style={{ ...abs(cx - t / 2, dy < 0 ? cy - g - s : cy + g), width: t, height: s, background: c }} />
    </React.Fragment>
  );
  return <>{mk(x, y, -1, -1, "a")}{mk(x + w, y, 1, -1, "b")}{mk(x, y + h, -1, 1, "c")}{mk(x + w, y + h, 1, 1, "d")}</>;
};

/** 第 3 頁（回答）：大引號＋被剪下的引文（實測原文節錄）＋標註線 */
const Quote: React.FC<PP> = ({ page: { p, at, in: a }, f }) => {
  const lead: string[] = p.lead ?? [], lines: string[] = p.lines ?? [];
  const bx = L.X + 28, by = 556, bw = L.INNER_W - 56, bh = p.h ?? 536, pad = 44;
  const open = tween(f, a + 2, M.rule, EASE.move), penAt = at(p.pen?.at, a), mAt = at(p.moreAt, a), nAt = at(p.note?.at, a);
  const np = tween(f, nAt, M.rule, EASE.move);
  return (
    <>
      <Kicker text={p.kicker} y={350} f={f} at={a} />
      <Rise f={f} at={a + 2} style={abs(L.X - 6, 400, { height: 150 })}><div style={{ ...num, fontSize: 380, lineHeight: 0.92, color: A.fill }}>“</div></Rise>
      <Rise f={f} at={a + 4} style={abs(L.X + 250, 452, { width: L.INNER_W - 250 })}>
        <div style={{ ...zh, fontWeight: T.weight.strong, fontSize: 30, color: T.ink2, textAlign: "right" }}>{p.by}</div>
      </Rise>
      <div style={{ ...abs(bx, by), width: bw, height: bh, clipPath: `inset(0 0 ${((1 - open) * 100).toFixed(2)}% 0)` }}>
        <div style={{ position: "absolute", inset: 0, background: T.clip, border: `${T.rule.hair}px dashed ${T.ink3}`, boxSizing: "border-box" }} />
        <div style={{ ...abs(pad, pad - 6) }}>
          {lead.map((l, i) => (
            <Rise key={i} f={f} at={a + 6 + i * M.stagger}><div style={{ ...zh, lineHeight: 1.36, fontWeight: T.weight.strong, fontSize: 60, color: T.ink }}>{penned(l, p.pen?.text, f, penAt, true)}</div></Rise>
          ))}
        </div>
        <div style={{ ...abs(pad, pad + lead.length * 82 + 30), width: bw - pad * 2, height: T.rule.hair, background: T.hair, transformOrigin: "0 0", transform: `scaleX(${tween(f, mAt, M.rule, EASE.move).toFixed(4)})` }} />
        {lines.map((l, i) => (
          <Rise key={i} f={f} at={mAt + 2} style={abs(pad, pad + lead.length * 82 + 56, { width: bw - pad * 2 })}>
            <div style={{ fontFamily: FONT_ZH, fontWeight: T.weight.light, fontSize: 38, lineHeight: 1.52, color: T.ink2 }}>{l}</div>
          </Rise>
        ))}
        <Rise f={f} at={mAt + 2 + M.stagger} style={abs(pad, bh - pad - 26, { width: bw - pad * 2 })}>
          <div style={{ ...zh, fontWeight: T.weight.body, fontSize: L.MIN_PX, color: T.ink3 }}>{p.more}</div>
        </Rise>
      </div>
      {open >= 1 ? <Crop x={bx} y={by} w={bw} h={bh} /> : null}
      {/* 標註線：從引文裡那個數字的右邊拉到旁註 */}
      {p.note ? (
        <>
          <div style={{ ...abs(p.note.x ?? 600, by + pad + 82 + 40), width: Math.round((p.note.len ?? 90) * np), height: T.rule.hair + 1, background: A.fill }} />
          {np > 0 ? <div style={{ ...abs((p.note.x ?? 600) - 7, by + pad + 82 + 34), width: 14, height: 14, borderRadius: 7, background: A.fill }} /> : null}
          <Rise f={f} at={nAt + 4} style={abs((p.note.x ?? 600) + (p.note.len ?? 90) + 14, by + pad + 82 + 18)}>
            <div style={{ ...zh, fontWeight: T.weight.strong, fontSize: 34, color: A.text }}>{p.note.text}</div>
          </Rise>
        </>
      ) : null}
      {p.big ? (
        <>
          <Rule f={f} at={penAt} y={by + bh + 34} color={T.hair} />
          <Rise f={f} at={penAt + 2} style={abs(L.X, by + bh + 78)}><div style={{ ...zh, fontWeight: T.weight.strong, fontSize: 32, color: T.ink2 }}>{p.big.label}</div></Rise>
          <Rise f={f} at={penAt + 2} style={abs(L.X, by + bh + 46, { width: L.INNER_W })}><div style={{ ...num, fontSize: 112, color: T.ink, textAlign: "right" }}>{p.big.value}</div></Rise>
        </>
      ) : null}
    </>
  );
};

/** 第 4 頁（對答案）：上面是 AI 說的（劃掉、標年份），下面是今年的數字（最大的字） */
const Versus: React.FC<PP> = ({ page: { p, at, in: a }, f }) => {
  const A1 = p.a ?? {}, B = p.b ?? {};
  const sAt = at(A1.strikeAt, a), yAt = at(A1.yearAt, a), rAt = at(p.ruleAt, a), bAt = at(B.at, a), subAt = at(B.subAt, bAt + 10);
  const from = Number(B.fromValue ?? 0), to = parseFloat(B.value), unit = String(B.value).replace(/^[\d.]+/, "");
  const cp = tween(f, bAt, M.count, EASE.count), val = (from + (to - from) * cp).toFixed(2) + unit;
  const yp = tween(f, yAt, M.rule, EASE.move);
  return (
    <>
      <Kicker text={p.kicker} y={350} f={f} at={a} />
      <Rise f={f} at={a + 2} style={abs(L.X, 412)}><div style={{ ...zh, fontWeight: T.weight.strong, fontSize: 32, color: T.ink2 }}>{A1.label}</div></Rise>
      <Rise f={f} at={a + 3} style={abs(L.X, 470)}>
        <div style={{ ...num, fontSize: 176, color: f >= sAt + M.strike ? T.ink3 : T.ink }}><span style={{ position: "relative", display: "inline-block" }}>{A1.value}<Strike f={f} at={sAt} h={16} /></span></div>
      </Rise>
      <div style={{ ...abs(664, 500), width: T.rule.hair + 1, height: Math.round(150 * yp), background: A.fill }} />
      <Rise f={f} at={yAt + 2} style={abs(690, 470)}><div style={{ ...num, fontSize: 118, color: A.fill }}>{A1.year}</div></Rise>
      <Rise f={f} at={yAt + 2 + M.stagger} style={abs(690, 598)}><div style={{ ...zh, fontWeight: T.weight.strong, fontSize: 38, color: A.text }}>{A1.yearNote}</div></Rise>
      <Rule f={f} at={rAt} y={716} h={T.rule.thick} />
      <Rise f={f} at={rAt + 3} style={abs(L.X, 752)}><div style={{ ...zh, fontWeight: T.weight.strong, fontSize: 32, color: T.ink2 }}>{B.label}</div></Rise>
      <div style={{ ...abs(L.X - 6, 812), ...num, fontSize: 262, color: f >= bAt ? A.fill : T.hair }}>{f >= bAt ? val : f >= rAt + 3 ? B.blank : ""}</div>
      <Rule f={f} at={subAt} y={1108} color={T.hair} />
      <Rise f={f} at={subAt + 2} style={abs(L.X, 1134)}><div style={{ ...zh, fontWeight: T.weight.title, fontSize: 56, color: T.ink }}>{penned(B.sub, B.subPen, f, subAt + 8)}</div></Rise>
    </>
  );
};

/** 第 5 頁（轉折）：整塊番茄紅從左邊蓋進來，白色特大標；下面是五個欄位的預告 */
const Turn: React.FC<PP> = ({ page: { p, at, in: a }, f }) => {
  const bp = tween(f, at(p.bandAt, a), M.rule + 2, EASE.move), tAt = at(p.titleAt, a), sAt = at(p.stepsAt, tAt + 8), oAt = at(p.old?.strikeAt, a);
  const steps: string[] = p.steps ?? [], sw = L.INNER_W / Math.max(1, steps.length);
  const top = L.MAIN_TOP - 16, h = L.MAIN_BOTTOM - top + 6;
  return (
    <div style={{ ...abs(0, top), width: L.W, height: h, background: A.fill, clipPath: `inset(0 ${((1 - bp) * 100).toFixed(2)}% 0 0)` }}>
      <div style={{ position: "absolute", left: 0, top: -top }}>
        <Kicker text={p.kicker} y={366} f={f} at={a + 6} color={A.on} mark={A.on} />
        <Rise f={f} at={a + 8} style={abs(L.X + 300, 362, { width: L.INNER_W - 300 })}>
          <div style={{ ...zh, fontWeight: T.weight.body, fontSize: 36, color: A.onDim, textAlign: "right" }}><span style={{ position: "relative", display: "inline-block" }}>{p.old?.text}<Strike f={f} at={oAt} color={A.on} h={4} /></span></div>
        </Rise>
        {(p.title as string[]).map((t, i) => (
          <Rise key={i} f={f} at={tAt + i * M.stagger} style={abs(L.X - 8, 424 + i * 300)}>
            <div style={{ ...zh, lineHeight: 1.04, fontWeight: T.weight.title, fontSize: 288, letterSpacing: "-0.02em", color: A.on }}>{t}</div>
          </Rise>
        ))}
        <Rule f={f} at={sAt - 2} y={1066} h={T.rule.thick} color={A.on} />
        {steps.map((s, i) => (
          <Rise key={i} f={f} at={sAt + i * M.stagger} style={abs(L.X + i * sw, 1094, { width: sw })}>
            <div style={{ ...num, letterSpacing: 0, fontSize: 30, color: A.onDim }}>{String(i + 1).padStart(2, "0")}</div>
            <div style={{ ...zh, fontWeight: T.weight.strong, fontSize: 40, color: A.on, marginTop: 10 }}>{s}</div>
          </Rise>
        ))}
      </div>
    </div>
  );
};

const KIND: Record<string, React.FC<PP>> = { hook: Hook, ask: Ask, quote: Quote, versus: Versus, turn: Turn };
/** 一頁：下一頁進來前 M.exit 幀，整頁由下往上被裁掉（像翻頁，不淡出） */
const PageView: React.FC<PP> = ({ page, f }) => {
  const C = KIND[page.kind];
  if (!C || f < page.in || f >= page.out) return null;
  const e = tween(f, page.out - M.exit, M.exit, EASE.exit);
  return <div style={{ position: "absolute", left: 0, top: 0, width: L.W, height: L.H, clipPath: e > 0 ? `inset(0 0 ${(L.H - L.MAIN_TOP + 30 - (L.MAIN_BOTTOM - L.MAIN_TOP + 60) * (1 - e)).toFixed(1)}px 0)` : undefined }}><C page={page} f={f} /></div>;
};

// ───────── 固定的東西：報頭、字幕、出處 ─────────
export const HeaderEditorial: React.FC<{ tag: string; slogan?: string; folio: string; progress: number }> = ({ tag, slogan, folio, progress }) => (
  <>
    <div style={{ ...abs(L.X, L.HEADER_TOP), width: L.INNER_W, height: T.rule.thick, background: T.ink }} />
    <div style={{ ...abs(L.X, L.HEADER_TOP + 14), width: L.INNER_W, height: L.HEADER_H - 14, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
      <div style={{ ...zh, fontWeight: T.weight.title, fontSize: 36, color: T.ink }}>{tag}</div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 22 }}>
        {slogan ? <div style={{ ...zh, fontWeight: T.weight.body, fontSize: L.MIN_PX, color: T.ink3 }}>{slogan}</div> : null}
        <div style={{ ...num, letterSpacing: 0, fontWeight: T.weight.strong, fontSize: 30, color: T.ink }}>{folio}</div>
      </div>
    </div>
    <div style={{ ...abs(L.X, L.PROGRESS_TOP), width: L.INNER_W, height: T.rule.hair, background: T.hair }} />
    <div style={{ ...abs(L.X, L.PROGRESS_TOP - 1), width: Math.round(L.INNER_W * progress), height: T.rule.hair + 2, background: A.fill }} />
  </>
);

type Cap = { en: string; window: [number, number]; phrases: { text: string; start: number }[]; keywords: string[] };
const enSplit = (s: string) => String(s ?? "").split("|").map((x) => x.trim()).filter(Boolean);
/** 字幕：靠左、沒有底卡；一次一段中文大字（關鍵詞用強調色），下面一行英文跟著換 */
const Caption: React.FC<{ cues: Cap[]; f: number }> = ({ cues, f }) => {
  const act = cues.filter((c) => c.phrases.length);
  if (!act.length) return null;
  const cue = [...act].reverse().find((c) => f >= c.window[0]) ?? act[0];
  const ps = cue.phrases, es = enSplit(cue.en);
  let k = 0; for (let i = 0; i < ps.length; i++) if (f >= ps[i].start) k = i;
  const enText = es.length > ps.length ? es.filter((_, i) => Math.floor((i * ps.length) / es.length) === k).join(" ") : es[Math.min(es.length - 1, Math.floor((k * es.length) / ps.length))];
  const text = ps[k].text, st = k === 0 ? cue.window[0] : ps[k].start;
  const parts: { t: string; c?: string }[] = [];
  let rest = text;
  while (rest) {
    const hit = cue.keywords.map((w) => ({ w, i: rest.indexOf(w) })).filter((x) => x.i >= 0).sort((x, y) => x.i - y.i)[0];
    if (!hit) { parts.push({ t: rest }); break; }
    if (hit.i > 0) parts.push({ t: rest.slice(0, hit.i) });
    parts.push({ t: hit.w, c: A.text });
    rest = rest.slice(hit.i + hit.w.length);
  }
  return (
    <>
      <div style={{ ...abs(L.X, L.CAP_TOP), width: L.INNER_W, height: T.rule.hair, background: T.ink }} />
      <div style={{ ...abs(L.X, L.CAP_TOP + 34), width: 14, height: 156, background: A.fill }} />
      <Rise f={f} at={st <= 0 ? -99 : st} style={abs(L.X + 44, L.CAP_TOP + 30, { width: L.INNER_W - 44 })}>
        <div style={{ ...zh, lineHeight: 1.3, fontWeight: T.weight.title, fontSize: L.CAP_ZH_PX, color: T.ink }}>{parts.map((x, i) => <span key={i} style={{ color: x.c }}>{x.t}</span>)}</div>
      </Rise>
      <div style={{ ...abs(L.X + 46, L.CAP_TOP + 144), fontFamily: FONT_EN, whiteSpace: "nowrap", fontWeight: 600, fontSize: L.CAP_EN_PX, color: T.ink2 }}>{enText}</div>
    </>
  );
};
const SourceLine: React.FC<{ cues: { sources: string[]; window: [number, number] }[]; f: number }> = ({ cues, f }) => {
  const cur = cues.find((c) => c.sources?.length && f >= c.window[0] && f < c.window[1]);
  if (!cur) return null;
  const j = cur.sources.join("、");
  return (
    <>
      <div style={{ ...abs(L.X, L.SRC_TOP - 22), width: L.INNER_W, height: T.rule.hair, background: T.hair }} />
      <div style={{ ...abs(L.X, L.SRC_TOP), width: L.INNER_W, ...zh, fontWeight: T.weight.body, fontSize: L.SRC_PX, color: T.ink3 }}>{/^(資料)?來源/.test(j) ? j : `來源：${j}`}</div>
    </>
  );
};
const folioOf = (i: number, n: number) => `${String(i + 1).padStart(2, "0")}／${String(n).padStart(2, "0")}`;

export const VideoEditorial: React.FC<Script & { timeline: TimelineV2 }> = ({ scenes, timeline, channel }) => {
  const f = useCurrentFrame();
  const pages = useMemo(() => buildEditorial(scenes, timeline), [scenes, timeline]);
  const by = Object.fromEntries(timeline.scenes.map((x) => [x.id, x]));
  const ordered = scenes.filter((s) => by[s.id]);
  const caps: Cap[] = ordered.filter((s) => by[s.id].subtitleWindow).map((s) => ({ en: s.subtitle.en, window: by[s.id].subtitleWindow as [number, number], phrases: by[s.id].lines, keywords: s.keywords ?? [] }));
  const srcs = ordered.map((s) => ({ sources: s.sources, window: by[s.id].sourceWindow }));
  const cur = Math.max(0, pages.findIndex((x) => f >= x.in && f < x.out));
  return (
    <AbsoluteFill style={{ background: T.paper }}>
      <HeaderEditorial tag={channel?.tag ?? "AI 動手做"} slogan={channel?.slogan} folio={folioOf(cur, pages.length)} progress={Math.min(1, f / Math.max(1, timeline.totalFrames - 1))} />
      {pages.map((x) => <PageView key={x.sid} page={x} f={f} />)}
      <Caption cues={caps} f={f} />
      <SourceLine cues={srcs} f={f} />
      {timeline.voice ? <Audio src={staticFile(timeline.voice.file)} /> : timeline.scenes.filter((t) => t.audio).map((t) => (
        <Sequence key={`${t.id}-audio`} from={t.audioFrame} durationInFrames={Math.ceil(t.audioSec * FPS) + 1} name={`${t.id}-audio`} layout="none"><Audio src={staticFile(t.audio as string)} /></Sequence>
      ))}
    </AbsoluteFill>
  );
};

/** 封面：第 1 頁落定的樣子（大標＋兩欄數字） */
export const CoverEditorial: React.FC<Script & { coverCrop?: number }> = ({ scenes, channel, coverCrop }) => {
  const p = (scenes[0]?.props ?? {}) as Record<string, any>;
  const shift = coverCrop ? (L.H - coverCrop) / 2 - 150 : 0;
  const page: Page = { kind: "hook", sid: "cover", in: 0, out: 1e9, p, at: () => 0 };
  return (
    <AbsoluteFill style={{ background: T.paper }}>
      <div style={{ position: "absolute", inset: 0, transform: `translateY(${shift}px)` }}><HeaderEditorial tag={channel?.tag ?? "AI 動手做"} slogan={channel?.slogan} folio={folioOf(0, scenes.length)} progress={0} /></div>
      <Hook page={page} f={9999} />
    </AbsoluteFill>
  );
};

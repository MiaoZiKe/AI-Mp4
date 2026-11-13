// 亮色產品發表風（styleVersion 3 ＋ stage: "bright"）：暖白底、靛藍主色、珊瑚橘輔色；圓角大卡片滑入、數字彈跳、重點用色塊螢光標出。
// 提示詞與 AI 的回答都是大字卡，不畫軟體視窗。時間全部來自 timeline（engine.ts）；顏色與版面讀 THEME_BRIGHT／LAYOUT_BRIGHT，這裡不寫死色碼。
import React, { useMemo } from "react";
import { AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame } from "remotion";
import type { Script, TimelineV2 } from "../../types";
import { FONT_EN, FONT_ZH, FPS, LAYOUT_BRIGHT as L, THEME_BRIGHT as T } from "../../theme";
import { EASE, pop, springAccent, tween } from "../anim";
import { buildBright, type Panel } from "./engine";

const M = T.motion;
type Tone = "white" | "primary" | "accent" | "dashed";
const col = (name?: string) => T.color[name ?? "primary"] ?? T.color.primary;
/** #RRGGBB → rgba()（光暈、帶色陰影用；顏色本身仍來自 token） */
const rgba = (hex: string, a: number) => `rgba(${parseInt(hex.slice(1, 3), 16)},${parseInt(hex.slice(3, 5), 16)},${parseInt(hex.slice(5, 7), 16)},${a})`;
const lift = (hex: string) => `0 ${T.shadow.liftY}px ${T.shadow.liftBlur}px ${rgba(hex, T.shadow.liftAlpha)}`;
const zh: React.CSSProperties = { fontFamily: FONT_ZH, whiteSpace: "nowrap", lineHeight: 1.16 };
const en: React.CSSProperties = { fontFamily: FONT_EN, whiteSpace: "nowrap", lineHeight: 1 };

/** 滑入：從下面（或上面）滑進來，帶一點點過衝 */
const slide = (f: number, at: number, dist: number = M.slide): React.CSSProperties => {
  const s = springAccent(f, at);
  return { opacity: tween(f, at, 6), transform: `translateY(${Math.round((1 - s) * dist)}px)` };
};
/** 彈出：從小放大、過衝再落定（標籤、數字、圓章） */
const bounce = (f: number, at: number, rot = 0): React.CSSProperties => ({ opacity: tween(f, at, 3), transform: `scale(${(f < at ? 0.4 : pop(f, at, 0.4)).toFixed(4)}) rotate(${rot}deg)` });

const Card: React.FC<{ x: number; y: number; w: number; h: number; tone?: Tone; color?: string; style?: React.CSSProperties; children?: React.ReactNode }> = ({ x, y, w, h, tone = "white", color, style, children }) => {
  const c = col(color ?? (tone === "accent" ? "accent" : "primary"));
  const skin: React.CSSProperties = tone === "white" ? { background: T.card, boxShadow: T.shadow.card }
    : tone === "dashed" ? { border: `4px dashed ${T.line}`, background: rgba(T.card, 0.5) }
      : { background: c.fill, boxShadow: lift(c.fill) };
  return <div style={{ position: "absolute", left: x, top: y, width: w, height: h, borderRadius: T.radius.card, boxSizing: "border-box", ...skin, ...style }}>{children}</div>;
};
const Chip: React.FC<{ text: string; bg: string; fg: string; px?: number; style?: React.CSSProperties; shadow?: boolean }> = ({ text, bg, fg, px = 30, style, shadow }) => (
  <div style={{ ...zh, display: "inline-block", fontWeight: T.weight.strong, fontSize: px, color: fg, background: bg, borderRadius: T.radius.pill, padding: `${Math.round(px * 0.36)}px ${Math.round(px * 0.8)}px`, boxShadow: shadow ? T.shadow.card : undefined, ...style }}>{text}</div>
);
/** 螢光標記：色塊從左往右抹到字的後面 */
const Mark: React.FC<{ f: number; at: number; bg: string; fg?: string; children: React.ReactNode }> = ({ f, at, bg, fg, children }) => {
  const p = tween(f, at, M.mark, EASE.move);
  return <span style={{ color: p > 0.5 ? fg : undefined, backgroundImage: `linear-gradient(${bg},${bg})`, backgroundRepeat: "no-repeat", backgroundSize: `${(100 * p).toFixed(1)}% 82%`, backgroundPosition: "0 62%", borderRadius: T.radius.mark, padding: "0 0.08em" }}>{children}</span>;
};
/** 把一句話裡的 target 換成螢光標記 */
const marked = (text: string, target: string | undefined, f: number, at: number, bg: string, fg?: string) => {
  const i = target ? text.indexOf(target) : -1;
  if (i < 0 || !target) return text;
  return <>{text.slice(0, i)}<Mark f={f} at={at} bg={bg} fg={fg}>{target}</Mark>{text.slice(i + target.length)}</>;
};
const Strike: React.FC<{ f: number; at: number; color: string; h?: number }> = ({ f, at, color, h = 12 }) => (
  <span style={{ position: "absolute", left: "-4%", top: "50%", width: `${(108 * tween(f, at, M.strike, EASE.move)).toFixed(1)}%`, height: h, marginTop: -h / 2, borderRadius: h, background: color }} />
);

// ───────── 各種畫面 ─────────
type PP = { panel: Panel; f: number };

/** 鉤子：第 0 幀就是完整的大字主張＋兩張數字卡（AI 給的／今年實際） */
const Hook: React.FC<PP> = ({ panel: { p, at }, f }) => {
  const mk = p.mark ?? {}, mc = col(mk.color ?? "accent");
  const nums: any[] = p.nums ?? [];
  const w = (L.INNER_W - 24) / 2;
  return (
    <>
      <div style={{ position: "absolute", left: L.X, top: 352 }}><Chip text={p.kicker} bg={T.color.primary.soft} fg={T.color.primary.text} /></div>
      <div style={{ position: "absolute", left: L.X, top: 444, ...zh, fontWeight: T.weight.title, fontSize: p.size ?? 136, color: T.ink, letterSpacing: "-0.01em" }}>
        {(p.title as string[]).map((t, i) => <div key={i}>{marked(t, mk.text, f, at(mk.at, 0), mc.soft, mc.text)}</div>)}
      </div>
      {nums.map((n, i) => {
        const c = col(n.color), solid = n.tone === "solid";
        const sAt = n.strikeAt !== undefined ? at(n.strikeAt) : Infinity, tAt = n.tagAt !== undefined ? at(n.tagAt) : 0, bAt = n.bumpAt !== undefined ? at(n.bumpAt) : -999;
        const struck = f >= sAt + M.strike;
        return (
          <Card key={i} x={L.X + i * (w + 24)} y={826} w={w} h={404} tone={solid ? "primary" : "white"} color={n.color} style={{ padding: "40px 36px", transform: f >= bAt ? `scale(${pop(f, bAt, 0.94).toFixed(4)})` : undefined }}>
            <div style={{ ...zh, fontWeight: T.weight.strong, fontSize: 36, color: solid ? c.on : T.ink2 }}>{n.label}</div>
            <div style={{ position: "relative", display: "inline-block", marginTop: 26, ...en, fontWeight: T.weight.num, fontSize: 122, letterSpacing: "-0.03em", color: solid ? c.on : struck ? T.ink3 : c.text }}>
              {n.value}{n.strikeAt !== undefined ? <Strike f={f} at={sAt} color={T.ink} /> : null}
            </div>
            {n.tag ? <div style={{ position: "absolute", left: 36, bottom: 40, transformOrigin: "0 50%", ...bounce(f, tAt, n.tagRot ?? 0) }}><Chip text={n.tag} px={n.tagPx ?? 34} bg={solid ? c.on : c.fill} fg={solid ? c.text : c.on} /></div> : null}
          </Card>
        );
      })}
    </>
  );
};

/** 我問的那一句：主色大卡，字一個一個打出來；下面一張小卡數「只有一句」 */
const Ask: React.FC<PP> = ({ panel, f }) => {
  const { p, at } = panel, c = T.color.primary, t0 = panel.in + 3;
  const lines: string[] = p.lines ?? [], tAt = at(p.typeAt, t0 + 6);
  let used = 0;
  const total = lines.join("").length, shown = Math.max(0, Math.floor((f - tAt) / M.step)), typing = shown < total;
  const cnt = p.count ?? {}, cAt = at(cnt.at);
  return (
    <>
      <div style={{ position: "absolute", left: L.X, top: 352, ...slide(f, t0, 60) }}><Chip text={p.label} bg={c.soft} fg={c.text} /></div>
      {p.tag ? <div style={{ position: "absolute", right: L.X, top: 352, transformOrigin: "100% 50%", ...bounce(f, at(p.tag.at)) }}><Chip text={p.tag.text} bg={T.card} fg={T.ink2} shadow /></div> : null}
      <div style={{ position: "absolute", inset: 0, ...slide(f, t0) }}>
        <Card x={L.X} y={446} w={L.INNER_W} h={548} tone="primary" style={{ padding: "56px 60px" }}>
          <div style={{ ...zh, fontWeight: T.weight.strong, fontSize: 34, color: rgba(c.on, 0.78) }}>{p.head}</div>
          <div style={{ marginTop: 44, ...zh, lineHeight: 1.3, fontWeight: T.weight.title, fontSize: p.size ?? 104, color: c.on }}>
            {lines.map((l, i) => {
              const n = Math.max(0, Math.min(l.length, shown - used)), caret = (shown >= used && shown < used + l.length) || (i === lines.length - 1 && !typing);
              used += l.length;
              return <div key={i} style={{ height: "1.3em" }}>{l.slice(0, n)}{caret ? <span style={{ display: "inline-block", width: 10, height: "0.92em", marginLeft: 10, verticalAlign: "-0.1em", borderRadius: 5, background: c.on, opacity: typing || Math.floor(f / 9) % 2 === 0 ? 1 : 0 }} /> : null}</div>;
            })}
          </div>
        </Card>
      </div>
      {cnt.text ? (
        <div style={{ position: "absolute", inset: 0, ...slide(f, cAt, 90) }}>
          <Card x={L.X} y={1030} w={L.INNER_W} h={204} style={{ display: "flex", alignItems: "center", padding: "0 44px", gap: 36 }}>
            <div style={{ width: 124, height: 124, borderRadius: T.radius.pill, background: T.color.accent.fill, boxShadow: lift(T.color.accent.fill), display: "flex", alignItems: "center", justifyContent: "center", ...en, fontWeight: T.weight.num, fontSize: 84, color: T.color.accent.on, ...bounce(f, at(cnt.popAt, cAt + 4)) }}>{cnt.n}</div>
            <div>
              <div style={{ ...zh, fontWeight: T.weight.title, fontSize: 66, color: T.ink }}>{cnt.text}</div>
              <div style={{ ...zh, fontWeight: T.weight.body, fontSize: 34, color: T.ink2, marginTop: 10 }}>{cnt.sub}</div>
            </div>
          </Card>
        </div>
      ) : null}
    </>
  );
};

/** AI 的回答（實測節錄）：白色大字卡，後面疊兩層表示「一大篇」；念到數字時螢光標出，並跳出一張數字卡 */
const Answer: React.FC<PP> = ({ panel, f }) => {
  const { p, at } = panel, c = col(p.color ?? "accent"), t0 = panel.in + 3;
  const lines: string[] = p.lines ?? [], mk = p.mark ?? {}, mAt = at(mk.at), sAt = at(p.stackAt, t0 + 10);
  const co = p.callout ?? {}, coAt = at(co.at, mAt);
  const Y = 470, H = 600;
  return (
    <>
      {[2, 1].map((k) => { const q = tween(f, sAt + (k - 1) * M.stagger, 10); return <div key={k} style={{ position: "absolute", left: L.X + 30 * k, top: Y + H - 80 + Math.round(24 * k * q), width: L.INNER_W - 60 * k, height: 80, borderRadius: T.radius.card, background: T.card, opacity: q * (1 - 0.3 * k), boxShadow: T.shadow.card }} />; })}
      <div style={{ position: "absolute", inset: 0, ...slide(f, t0) }}>
        <Card x={L.X} y={Y} w={L.INNER_W} h={H} style={{ padding: "42px 48px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <Chip text={p.label} bg={c.soft} fg={c.text} />
            <div style={{ ...zh, fontWeight: T.weight.body, fontSize: L.MIN_PX, color: T.ink3 }}>{p.by}</div>
          </div>
          <div style={{ marginTop: 30, fontFamily: FONT_ZH, lineHeight: 1.42, fontWeight: T.weight.strong, fontSize: 52, color: T.ink }}>{marked(lines[0] ?? "", mk.text, f, mAt, c.soft, c.text)}</div>
          {lines.slice(1).map((l, i) => <div key={i} style={{ marginTop: 22, fontFamily: FONT_ZH, lineHeight: 1.5, fontWeight: T.weight.body, fontSize: 36, color: T.ink2, ...slide(f, at(p.restAt, t0 + 12) + i * M.stagger, 40) }}>{l}</div>)}
          {p.more ? <div style={{ marginTop: 18, ...zh, fontWeight: T.weight.body, fontSize: L.MIN_PX, color: T.ink3, opacity: tween(f, at(p.restAt, t0 + 12) + 6, 6) }}>{p.more}</div> : null}
        </Card>
      </div>
      {co.value ? (
        <div style={{ position: "absolute", left: 486, top: 1004, width: 530, height: 240, transformOrigin: "70% 60%", ...bounce(f, coAt, -3) }}>
          <Card x={0} y={0} w={530} h={240} tone="accent" color={p.color ?? "accent"} style={{ padding: "30px 40px" }}>
            <div style={{ ...zh, fontWeight: T.weight.strong, fontSize: 34, color: rgba(c.on, 0.86) }}>{co.label}</div>
            <div style={{ ...en, fontWeight: T.weight.num, fontSize: 138, letterSpacing: "-0.03em", color: c.on, marginTop: 8 }}>{co.value}</div>
          </Card>
        </div>
      ) : null}
    </>
  );
};

/** 對答案：上面白卡是 AI 給的數字（劃掉、蓋上年份），下面虛線框念到時填成主色卡、數字跳上來 */
const Compare: React.FC<PP> = ({ panel, f }) => {
  const { p, at } = panel, t0 = panel.in + 3, a = p.wrong ?? {}, b = p.right ?? {};
  const ca = col(a.color ?? "accent"), cb = col(b.color ?? "primary");
  const sAt = at(a.strikeAt), fAt = at(b.at), struck = f >= sAt + M.strike;
  const q = tween(f, fAt, 5), v = Number(b.fromValue ?? 0) + (Number(b.value) - Number(b.fromValue ?? 0)) * tween(f, fAt, M.count, EASE.count);
  return (
    <>
      <div style={{ position: "absolute", inset: 0, ...slide(f, t0) }}>
        <Card x={L.X} y={350} w={L.INNER_W} h={424} style={{ padding: "40px 48px" }}>
          <Chip text={a.label} bg={ca.soft} fg={ca.text} px={32} />
          <div><div style={{ position: "relative", display: "inline-block", marginTop: 22, ...en, fontWeight: T.weight.num, fontSize: 178, letterSpacing: "-0.03em", color: struck ? T.ink3 : ca.text }}>{a.value}<Strike f={f} at={sAt} color={T.ink} h={14} /></div></div>
          <div style={{ position: "absolute", right: 40, bottom: 36, transformOrigin: "80% 50%", ...bounce(f, at(a.stampAt, sAt), -4) }}><Chip text={a.stamp} px={44} bg={ca.fill} fg={ca.on} style={{ fontWeight: T.weight.title, boxShadow: lift(ca.fill) }} /></div>
        </Card>
      </div>
      <div style={{ position: "absolute", inset: 0, ...slide(f, t0 + M.stagger) }}>
        <Card x={L.X} y={812} w={L.INNER_W} h={428} tone="dashed" style={{ padding: "40px 48px", opacity: 1 - q }}>
          <Chip text={b.label} bg={T.line} fg={T.ink2} px={32} />
          <div style={{ ...en, fontWeight: T.weight.num, fontSize: 190, color: T.line, marginTop: 20 }}>?</div>
        </Card>
        {f >= fAt ? (
          <div style={{ position: "absolute", left: L.X, top: 812, width: L.INNER_W, height: 428, opacity: q, transform: `scale(${pop(f, fAt, 0.9).toFixed(4)})` }}>
            <Card x={0} y={0} w={L.INNER_W} h={428} tone="primary" color={b.color} style={{ padding: "40px 48px" }}>
              <Chip text={b.label} bg={cb.on} fg={cb.text} px={32} />
              <div style={{ ...en, fontWeight: T.weight.num, fontSize: 198, letterSpacing: "-0.03em", color: cb.on, marginTop: 14 }}>{v.toFixed(2)}{b.unit}</div>
              <div style={{ ...zh, fontWeight: T.weight.body, fontSize: 32, color: rgba(cb.on, 0.9), marginTop: 14, opacity: tween(f, fAt + M.count, 6) }}>{b.sub}</div>
            </Card>
          </div>
        ) : null}
      </div>
    </>
  );
};

/** 換個問法：舊做法（小白卡，劃掉）→ 箭頭 → 新做法（主色大卡，大字＋螢光色塊＋三個預告標籤） */
const Next: React.FC<PP> = ({ panel, f }) => {
  const { p, at } = panel, t0 = panel.in + 3, c = T.color.primary, a = T.color.accent, o = p.old ?? {};
  const mAt = at(p.mark?.at), sAt = at(o.strikeAt, mAt), struck = f >= sAt + M.strike;
  const chips: string[] = p.chips ?? [];
  return (
    <>
      <div style={{ position: "absolute", inset: 0, ...slide(f, t0, -M.slide) }}>
        <Card x={L.X} y={350} w={L.INNER_W} h={212} style={{ padding: "0 48px", display: "flex", alignItems: "center", gap: 32 }}>
          <Chip text={o.label} bg={T.line} fg={T.ink2} px={32} />
          <div style={{ position: "relative", ...zh, fontWeight: T.weight.title, fontSize: 80, color: struck ? T.ink3 : T.ink }}>{o.text}<Strike f={f} at={sAt} color={a.fill} /></div>
        </Card>
      </div>
      <div style={{ position: "absolute", left: 540 - 52, top: 590, width: 104, height: 104, borderRadius: T.radius.pill, background: c.soft, display: "flex", alignItems: "center", justifyContent: "center", ...bounce(f, t0 + 8) }}>
        <svg width={56} height={56} viewBox="0 0 56 56"><path d="M28 8v38M12 30l16 16 16-16" fill="none" stroke={c.fill} strokeWidth={8} strokeLinecap="round" strokeLinejoin="round" /></svg>
      </div>
      <div style={{ position: "absolute", inset: 0, ...slide(f, t0 + M.stagger) }}>
        <Card x={L.X} y={722} w={L.INNER_W} h={520} tone="primary" style={{ padding: "48px 52px" }}>
          <Chip text={p.kicker} bg={c.on} fg={c.text} px={36} />
          <div style={{ ...zh, fontWeight: T.weight.title, fontSize: p.size ?? 184, color: c.on, marginTop: 20, letterSpacing: "-0.01em" }}>{marked(p.title, p.mark?.text, f, mAt, a.fill)}</div>
          <div style={{ position: "absolute", left: 52, bottom: 48, display: "flex", gap: 20 }}>
            {chips.map((t, i) => <div key={i} style={bounce(f, at(p.chipsAt, mAt + 6) + i * M.stagger)}><Chip text={t} px={40} bg={rgba(c.on, 0.16)} fg={c.on} /></div>)}
          </div>
        </Card>
      </div>
    </>
  );
};
const KINDS: Record<string, React.FC<PP>> = { hook: Hook, ask: Ask, answer: Answer, compare: Compare, next: Next };

/** 一塊畫面：下一塊進來時往上淡出 */
const PanelView: React.FC<PP> = ({ panel, f }) => {
  if (f < panel.in || f >= panel.out + M.exit) return null;
  const e = tween(f, panel.out, M.exit, EASE.exit), K = KINDS[panel.kind];
  if (!K) return null;
  return <div style={{ position: "absolute", inset: 0, opacity: 1 - e, transform: e > 0 ? `translateY(${Math.round(-M.exitRise * e)}px) scale(${(1 - 0.03 * e).toFixed(4)})` : undefined }}><K panel={panel} f={f} /></div>;
};
/** 留在上面的小膠囊（上一塊畫面的提示詞縮成一行，陪下一塊一起看） */
const Pill: React.FC<PP> = ({ panel: { p, at }, f }) => {
  const q = p.pill, c = T.color.primary;
  if (!q) return null;
  const a = at(q.from), b = at(q.until);
  if (f < a || f >= b + M.exit) return null;
  const e = tween(f, b, M.exit, EASE.exit), s = slide(f, a + 3, -90);
  return (
    <div style={{ position: "absolute", left: L.X, top: 346, width: L.INNER_W, height: 96, borderRadius: T.radius.pill, background: c.fill, boxShadow: lift(c.fill), display: "flex", alignItems: "center", padding: "0 16px", gap: 22, boxSizing: "border-box", opacity: Number(s.opacity) * (1 - e), transform: e > 0 ? `translateY(${Math.round(-M.exitRise * e)}px)` : s.transform }}>
      <Chip text={q.label} bg={c.on} fg={c.text} px={30} />
      <div style={{ ...zh, fontWeight: T.weight.strong, fontSize: 42, color: c.on }}>{q.text}</div>
    </div>
  );
};

// ───────── 固定的東西：背景、頁首、字幕卡、出處 ─────────
const Backdrop: React.FC<{ f: number }> = ({ f }) => {
  const g = T.glow, a = (f / g.period) * Math.PI * 2, dx = Math.round(Math.cos(a) * g.drift), dy = Math.round(Math.sin(a) * g.drift);
  const p = T.color.primary.fill, c = T.color.accent.fill;
  return <AbsoluteFill style={{ background: `radial-gradient(circle at ${860 + dx}px ${420 + dy}px, ${rgba(p, g.primary)} 0, ${rgba(p, 0)} 640px), radial-gradient(circle at ${180 - dx}px ${1500 - dy}px, ${rgba(c, g.accent)} 0, ${rgba(c, 0)} 700px), ${T.bg}` }} />;
};
export const HeaderBright: React.FC<{ name: string; tag: string; right?: string; progress: number }> = ({ name, tag, right, progress }) => (
  <>
    <div style={{ position: "absolute", left: L.X, right: L.X, top: L.HEADER_TOP, height: L.HEADER_H, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
        <div style={{ width: 60, height: 60, borderRadius: 18, background: T.color.primary.fill, display: "flex", alignItems: "center", justifyContent: "center", ...en, fontWeight: T.weight.num, fontSize: 30, color: T.color.primary.on }}>{name}</div>
        <div style={{ ...zh, fontWeight: T.weight.strong, fontSize: 36, color: T.ink }}>{tag}</div>
      </div>
      {right ? <div style={{ ...zh, fontWeight: T.weight.body, fontSize: L.MIN_PX, color: T.ink3 }}>{right}</div> : null}
    </div>
    <div style={{ position: "absolute", left: L.X, top: L.PROGRESS_TOP, width: L.INNER_W, height: 6, borderRadius: 6, background: T.line, overflow: "hidden" }}>
      <div style={{ width: `${(100 * progress).toFixed(2)}%`, height: 6, borderRadius: 6, background: T.color.primary.fill }} />
    </div>
  </>
);

type Cap = { en: string; window: [number, number]; phrases: { text: string; start: number }[]; keywords: string[]; kw: Record<string, string> };
const enSplit = (s: string) => String(s ?? "").split("|").map((x) => x.trim()).filter(Boolean);
/** 字幕卡：一次一段中文大字（關鍵詞上色），下面一行英文跟著換 */
const Caption: React.FC<{ cues: Cap[]; f: number }> = ({ cues, f }) => {
  const act = cues.filter((c) => c.phrases.length);
  if (!act.length) return null;
  const cue = [...act].reverse().find((c) => f >= c.window[0]) ?? act[0];
  const ps = cue.phrases, es = enSplit(cue.en);
  let k = 0; for (let i = 0; i < ps.length; i++) if (f >= ps[i].start) k = i;
  // 英文段數比中文多時併成同樣的段數，少的時候幾段中文共用一段英文
  const enText = es.length > ps.length ? es.filter((_, i) => Math.floor((i * ps.length) / es.length) === k).join(" ") : es[Math.min(es.length - 1, Math.floor((k * es.length) / ps.length))];
  const text = ps[k].text, st = k === 0 ? cue.window[0] : ps[k].start;
  // 關鍵詞上色：預設主色，script.json 該幕 props.kw 可以指定 accent
  const parts: { t: string; c?: string }[] = [];
  let rest = text;
  while (rest) {
    const hit = cue.keywords.map((w) => ({ w, i: rest.indexOf(w) })).filter((x) => x.i >= 0).sort((x, y) => x.i - y.i)[0];
    if (!hit) { parts.push({ t: rest }); break; }
    if (hit.i > 0) parts.push({ t: rest.slice(0, hit.i) });
    parts.push({ t: hit.w, c: col(cue.kw[hit.w]).text });
    rest = rest.slice(hit.i + hit.w.length);
  }
  const p = st <= 0 ? 1 : tween(f, st, 5); // 第 0 幀的字幕直接是實的
  return (
    <Card x={L.X} y={L.CAP_TOP} w={L.INNER_W} h={L.CAP_H} style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 20 }}>
      <div style={{ ...zh, fontWeight: T.weight.title, fontSize: L.CAP_ZH_PX, color: T.ink, opacity: 0.35 + 0.65 * p, transform: `translateY(${Math.round(12 * (1 - p))}px)` }}>{parts.map((x, i) => <span key={i} style={{ color: x.c }}>{x.t}</span>)}</div>
      <div style={{ ...en, fontWeight: 600, fontSize: L.CAP_EN_PX, color: T.ink2 }}>{enText}</div>
    </Card>
  );
};
const SourceLine: React.FC<{ cues: { sources: string[]; window: [number, number] }[]; f: number }> = ({ cues, f }) => {
  const cur = cues.find((c) => c.sources?.length && f >= c.window[0] && f < c.window[1]);
  if (!cur) return null;
  const j = cur.sources.join("、");
  return <div style={{ position: "absolute", left: L.X, width: L.INNER_W, top: L.SRC_TOP, textAlign: "center", ...zh, fontWeight: T.weight.body, fontSize: L.SRC_PX, color: T.ink3 }}>{/^(資料)?來源/.test(j) ? j : `來源：${j}`}</div>;
};

export const VideoBright: React.FC<Script & { timeline: TimelineV2 }> = ({ scenes, timeline, channel }) => {
  const f = useCurrentFrame();
  const panels = useMemo(() => buildBright(scenes, timeline), [scenes, timeline]);
  const by = Object.fromEntries(timeline.scenes.map((x) => [x.id, x]));
  const ordered = scenes.filter((s) => by[s.id]);
  const caps: Cap[] = ordered.filter((s) => by[s.id].subtitleWindow).map((s) => ({ en: s.subtitle.en, window: by[s.id].subtitleWindow as [number, number], phrases: by[s.id].lines, keywords: s.keywords ?? [], kw: ((s.props as any)?.kw ?? {}) as Record<string, string> }));
  const srcs = ordered.map((s) => ({ sources: s.sources, window: by[s.id].sourceWindow }));
  return (
    <AbsoluteFill style={{ background: T.bg }}>
      <Backdrop f={f} />
      <HeaderBright name={channel?.name ?? "AI"} tag={channel?.tag ?? "AI 動手做"} right={channel?.slogan} progress={Math.min(1, f / Math.max(1, timeline.totalFrames - 1))} />
      {panels.map((x) => <PanelView key={x.sid} panel={x} f={f} />)}
      {panels.map((x) => <Pill key={`${x.sid}-pill`} panel={x} f={f} />)}
      <Caption cues={caps} f={f} />
      <SourceLine cues={srcs} f={f} />
      {timeline.voice ? <Audio src={staticFile(timeline.voice.file)} /> : timeline.scenes.filter((t) => t.audio).map((t) => (
        <Sequence key={`${t.id}-audio`} from={t.audioFrame} durationInFrames={Math.ceil(t.audioSec * FPS) + 1} name={`${t.id}-audio`} layout="none"><Audio src={staticFile(t.audio as string)} /></Sequence>
      ))}
    </AbsoluteFill>
  );
};

/** 封面：鉤子那一塊的落定畫面（大字＋兩張數字卡） */
export const CoverBright: React.FC<Script & { coverCrop?: number }> = ({ scenes, channel, coverCrop }) => {
  const p = (scenes[0]?.props ?? {}) as Record<string, any>;
  const shift = coverCrop ? (L.H - coverCrop) / 2 - 150 : 0;
  const panel: Panel = { kind: "hook", sid: "cover", in: 0, out: 1e9, p, at: () => 0 };
  return (
    <AbsoluteFill style={{ background: T.bg }}>
      <Backdrop f={0} />
      <div style={{ position: "absolute", inset: 0, transform: `translateY(${shift}px)` }}><HeaderBright name={channel?.name ?? "AI"} tag={channel?.tag ?? "AI 動手做"} right={channel?.slogan} progress={0} /></div>
      <Hook panel={panel} f={9999} />
    </AbsoluteFill>
  );
};

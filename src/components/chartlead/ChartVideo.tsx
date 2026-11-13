// 資料圖表主導（styleVersion 3 ＋ stage: "chart"）：整個畫面是一張會動的圖表，全片不換場。
// 上面是圖表標題與讀數，中間是階梯圖（收盤首次站上的整數關卡；時間軸會縮放），下面是每一段的長條（花的時間 → 漲幅）。
// 時間全部來自 timeline（engine.ts 把 script.json 的時間換成絕對幀）；數字全部從 script.json 的 chart.steps 算；顏色與版面讀 THEME_CHARTLEAD／LAYOUT_CHARTLEAD。純 SVG＋CSS。
import React, { useMemo } from "react";
import { AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame } from "remotion";
import type { Script, TimelineV2 } from "../../types";
import { FONT_EN, FONT_ZH, FPS, LAYOUT_CHARTLEAD as L, THEME_CHARTLEAD as T } from "../../theme";
import { EASE, tween } from "../anim";
import { buildModel, comma, fmtDate, mix, ms, spanParts, type ChartModel, type ChartSpec } from "./engine";
import { CaptionChart, HeaderChart, SourceChart } from "./Tracks";

const YEAR = 365.25 * 86400000;
const zh = (size: number, weight: number = T.weight.body, color: string = T.text): React.CSSProperties => ({ fontFamily: FONT_ZH, fontWeight: weight, fontSize: size, color, whiteSpace: "nowrap" });
const num: React.CSSProperties = { fontFamily: FONT_EN, fontVariantNumeric: "tabular-nums" };
const lin = (t: number) => t;

/** 背景：深色看盤底＋細格線（每格 60px） */
const Backdrop: React.FC = () => <AbsoluteFill style={{ background: T.bg, backgroundImage: `linear-gradient(${T.grid} 2px, transparent 2px), linear-gradient(90deg, ${T.grid} 2px, transparent 2px)`, backgroundSize: "60px 60px", backgroundPosition: "4px 0px" }} />;

/** 讀數裡的「數字＋單位」：數字用等寬英文字、單位用中文小一級 */
const Parts: React.FC<{ parts: { n: string; u: string }[]; px: number; color: string }> = ({ parts, px, color }) => (
  <span style={{ display: "inline-flex", alignItems: "baseline", gap: px * 0.12 }}>
    {parts.map((p, i) => (
      <React.Fragment key={i}>
        <span style={{ ...num, fontWeight: 800, fontSize: px, color, letterSpacing: "-0.02em" }}>{p.n}</span>
        <span style={{ ...zh(Math.max(26, px * 0.52), T.weight.zh, color) }}>{p.u}</span>
      </React.Fragment>
    ))}
  </span>
);

export const ChartStage: React.FC<{ m: ChartModel; f: number; title?: string[] }> = ({ m, f, title }) => {
  const { steps, legs } = m;
  // ── 時間軸（x）：依 views 縮放 ──
  let dom = { from: m.views[0].from, to: m.views[0].to };
  for (const v of m.views.slice(1)) { const p = tween(f, v.at, T.motion.zoom, EASE.move); dom = { from: mix(dom.from, v.from, p), to: mix(dom.to, v.to, p) }; }
  const PW = L.PLOT_X1 - L.PLOT_X0, PH = L.PLOT_BOTTOM - L.PLOT_TOP;
  const X = (t: number) => L.PLOT_X0 + ((t - dom.from) / (dom.to - dom.from)) * PW;
  const gap = steps[1].level - steps[0].level;
  const lo = steps[0].level - L.Y_PAD * gap, hi = steps[steps.length - 1].level + L.Y_PAD * gap;
  const Y = (v: number) => L.PLOT_BOTTOM - ((v - lo) / (hi - lo)) * PH;
  const pxPerYear = (PW * YEAR) / (dom.to - dom.from);
  // ── 每一段的進度：橫線（drawAt → landAt−rise）＋往上（landAt−rise → landAt） ──
  const st = legs.map((g) => {
    const up0 = g.landAt - T.motion.rise;
    return { g, flat: tween(f, g.drawAt, Math.max(1, up0 - g.drawAt), g.i === 0 ? lin : EASE.move), rise: tween(f, up0, T.motion.rise, EASE.enter), target: tween(f, g.targetAt - 2, T.motion.in, EASE.enter), landed: f >= g.landAt };
  });
  const pts: [number, number][] = [[X(steps[0].t), Y(steps[0].level)]];
  let tip = { t: steps[0].t, v: steps[0].level };
  for (const s of st) {
    if (s.flat <= 0) break;
    const a = steps[s.g.i], b = steps[s.g.i + 1];
    tip = { t: mix(a.t, b.t, s.flat), v: mix(a.level, b.level, s.rise) };
    pts.push([X(tip.t), Y(a.level)]);
    if (s.rise > 0) pts.push([X(b.t), Y(tip.v)]);
    if (s.flat < 1) break;
  }
  const cur = [...st].reverse().find((s) => f >= s.g.drawAt);          // 現在講的那一段
  const drawing = cur && cur.flat > 0 && cur.flat < 1;
  const g = m.gain;
  const gainOn = g ? tween(f, g.at, T.motion.in, EASE.enter) : 0;
  const bracket = g ? tween(f, g.bracketAt - 2, T.motion.in, EASE.enter) : 0;
  const line = pts.map((p) => `${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" ");
  const area = `${line} ${pts[pts.length - 1][0].toFixed(1)},${L.PLOT_BOTTOM} ${pts[0][0].toFixed(1)},${L.PLOT_BOTTOM}`;
  // x 軸刻度：每 10 年一格；放大到每年夠寬時，每一年都標
  const y0 = new Date(dom.from).getUTCFullYear(), y1 = new Date(dom.to).getUTCFullYear();
  const ticks: { x: number; y: number; o: number }[] = [];
  for (let y = y0; y <= y1 + 1; y++) {
    const x = X(Date.UTC(y, 0, 1));
    if (x < L.PLOT_X0 + 4 || x > L.PLOT_X1 - 4) continue;
    const o = y % 10 === 0 ? Math.min(1, Math.max(0, (pxPerYear - 6) / 8)) : Math.min(1, Math.max(0, (pxPerYear - 90) / 80));
    if (o > 0.02) ticks.push({ x, y, o });
  }
  // ── 讀數 ──
  const readLeg = cur ?? st[0];
  const a = steps[readLeg.g.i], b = steps[readLeg.g.i + 1];
  const parts = f < readLeg.g.drawAt ? [{ n: "?", u: "" }] : spanParts(a.t, mix(a.t, b.t, readLeg.flat), b.t);
  const readPop = readLeg.landed ? 1 + 0.06 * (1 - tween(f, readLeg.g.landAt, 8, EASE.enter)) : 1;
  const maxDays = Math.max(...legs.map((x) => x.days));
  const titleSwap = g && g.title ? tween(f, g.at - 2, 10, EASE.move) : 0;
  return (
    <AbsoluteFill>
      {/* 圖表標題 */}
      <div style={{ position: "absolute", left: L.X, top: L.KICKER_TOP, ...zh(L.KICKER_PX, T.weight.body, T.text2), letterSpacing: "0.06em" }}>{m.kicker}</div>
      {title ? (
        <div style={{ position: "absolute", left: L.X, top: L.TITLE_TOP, ...zh(L.TITLE_PX, T.weight.zh), lineHeight: `${L.TITLE_PX + 14}px`, letterSpacing: "0.02em" }}>{title.join("")}</div>
      ) : (
        <>
          <div style={{ position: "absolute", left: L.X, top: L.TITLE_TOP, ...zh(L.TITLE_PX, T.weight.zh), lineHeight: `${L.TITLE_PX + 14}px`, letterSpacing: "0.02em", opacity: 1 - Math.min(1, titleSwap * 2), transform: `translateY(${(-16 * titleSwap).toFixed(1)}px)` }}>{m.title}</div>
          {g && titleSwap > 0.5 ? <div style={{ position: "absolute", left: L.X, top: L.TITLE_TOP, ...zh(L.TITLE_PX, T.weight.zh), lineHeight: `${L.TITLE_PX + 14}px`, letterSpacing: "0.02em", opacity: titleSwap * 2 - 1, transform: `translateY(${(16 * (1 - titleSwap)).toFixed(1)}px)` }}>{g.title}</div> : null}
        </>
      )}
      {/* 讀數：現在講的那一段＋花了多久（線畫到哪、數字就數到哪）；最後一幕換成「每一段都是 +1 萬點」 */}
      <div style={{ position: "absolute", left: L.X, top: L.READ_TOP, height: L.READ_H, display: "flex", alignItems: "center", gap: 28 }}>
        <div style={{ ...zh(L.READ_TAG_PX, T.weight.body, T.onAccent), background: bracket > 0.5 ? T.up : T.amber, borderRadius: T.radius.chip, padding: "8px 20px", letterSpacing: "0.04em" }}>
          {bracket > 0.5 ? "每一段都是" : `${a.label} → ${b.label}`}
        </div>
        <div style={{ transform: `scale(${readPop.toFixed(3)})`, transformOrigin: "left center" }}>
          {bracket > 0.5 ? <Parts parts={[{ n: `+${comma(gap)}`, u: "點" }]} px={L.READ_PX} color={T.upText} /> : <Parts parts={parts} px={L.READ_PX} color={T.amberText} />}
        </div>
      </div>
      {/* 階梯圖 */}
      <svg width={L.W} height={L.H} style={{ position: "absolute", left: 0, top: 0 }}>
        <defs><clipPath id="cl-plot"><rect x={L.PLOT_X0} y={L.PLOT_TOP - 70} width={PW} height={PH + 70} /></clipPath></defs>
        <line x1={L.PLOT_X0} y1={L.PLOT_BOTTOM} x2={L.PLOT_X1} y2={L.PLOT_BOTTOM} stroke={T.rule} strokeWidth={T.stroke.target} />
        {steps.map((s, i) => {
          const hit = i === 0 ? 1 : st[i - 1] ? st[i - 1].target : 0;      // 念到這個關卡時，這條線亮起來
          const reached = i === 0 || (st[i - 1]?.landed ?? false);
          return <line key={i} x1={L.PLOT_X0} y1={Y(s.level)} x2={L.PLOT_X1} y2={Y(s.level)} stroke={hit > 0 && !reached ? T.amber : T.rule} strokeWidth={hit > 0 && !reached ? T.stroke.target : T.stroke.grid} strokeDasharray={hit > 0 && !reached ? "14 10" : "4 10"} opacity={mix(0.7, 1, hit)} />;
        })}
        <g clipPath="url(#cl-plot)">
          <polygon points={area} fill={T.upSoft} opacity={mix(1, 0.5, bracket)} />
          <polyline points={line} fill="none" stroke={T.up} strokeWidth={mix(T.stroke.line, T.stroke.lineDim, bracket)} strokeLinejoin="miter" strokeLinecap="butt" opacity={mix(1, T.dim + 0.2, bracket)} />
          {/* 最後一幕：三段往上的那一截加粗（每一截都是同樣的 1 萬點） */}
          {bracket > 0 ? st.filter((s) => s.landed).map((s) => { const p = steps[s.g.i], q = steps[s.g.i + 1]; return <line key={s.g.i} x1={X(q.t)} y1={Y(p.level)} x2={X(q.t)} y2={mix(Y(p.level), Y(q.level), bracket)} stroke={T.up} strokeWidth={T.stroke.line + 5} />; }) : null}
          {/* 站上關卡的那一天：圓點 */}
          {steps.map((s, i) => { const on = i === 0 ? 1 : st[i - 1] ? tween(f, st[i - 1].g.landAt - 1, T.motion.label, EASE.enter) : 0; return on > 0 ? <circle key={i} cx={X(s.t)} cy={Y(s.level)} r={(6 + 7 * on).toFixed(1)} fill={T.bg} stroke={T.up} strokeWidth={5} /> : null; })}
          {drawing ? <circle cx={X(tip.t)} cy={Y(tip.v)} r={11} fill={T.up} /> : null}
        </g>
        {ticks.map((t) => <line key={t.y} x1={t.x} y1={L.PLOT_BOTTOM} x2={t.x} y2={L.PLOT_BOTTOM + 10} stroke={T.rule} strokeWidth={T.stroke.grid} opacity={t.o} />)}
      </svg>
      {/* y 軸標籤 */}
      {steps.map((s, i) => {
        const reached = i === 0 || (st[i - 1]?.landed ?? false), hit = i > 0 && st[i - 1] ? st[i - 1].target : 0;
        return <div key={i} style={{ position: "absolute", left: L.X, width: L.PLOT_X0 - L.X - 14, top: Y(s.level) - L.Y_LABEL_PX * 0.75, textAlign: "right", ...zh(L.Y_LABEL_PX, T.weight.zh, reached ? T.text : hit > 0.5 ? T.amberText : T.text3) }}>{s.label}</div>;
      })}
      {/* x 軸年份 */}
      {ticks.map((t) => <div key={t.y} style={{ position: "absolute", left: t.x - 60, width: 120, top: L.TICK_TOP + 8, textAlign: "center", ...num, fontWeight: 600, fontSize: L.TICK_PX, color: T.text2, opacity: t.o }}>{t.y}</div>)}
      {/* 線頭上跟著走的日期 */}
      {drawing && cur && (cur.g.i > 0 || X(tip.t) > X(steps[0].t) + 230) ? (
        <div style={{ position: "absolute", left: Math.min(L.PLOT_X1 - 150, cur.g.i === 0 ? X(tip.t) - 75 : X(tip.t) + 14), width: 150, top: Y(tip.v) - 64, textAlign: "center", ...num, fontWeight: 700, fontSize: 30, color: T.onAccent, background: T.up, borderRadius: T.radius.chip, lineHeight: "44px" }}>
          {pxPerYear > 90 ? fmtDate(tip.t).replace(/\/\d+$/, "") : new Date(tip.t).getUTCFullYear()}
        </div>
      ) : null}
      {/* 每個關卡的日期與當天收盤（第一個標在右上，其他標在左上） */}
      {steps.map((s, i) => {
        const on = i === 0 ? 1 : st[i - 1] ? tween(f, st[i - 1].g.landAt, T.motion.label, EASE.enter) : 0;
        const x = X(s.t), w = 210;
        if (on <= 0 || x < L.PLOT_X0 - 2 || x > L.PLOT_X1 + 2) return null;
        const below = i > 0 && x - 18 - w < L.PLOT_X0;                    // 左上放不下（會壓到 y 軸標籤）就改放右下
        const left = i === 0 || below ? x + 18 : x - 18 - w;
        return (
          <div key={i} style={{ position: "absolute", left, width: w, top: below ? Y(s.level) + 12 : Y(s.level) - 76, textAlign: i === 0 || below ? "left" : "right", opacity: on * mix(1, T.dim + 0.3, bracket), transform: `translateY(${(6 * (1 - on)).toFixed(1)}px)` }}>
            <div style={{ ...num, fontWeight: 700, fontSize: 28, color: T.text, lineHeight: "32px" }}>{fmtDate(s.t)}</div>
            <div style={{ ...zh(26, T.weight.light, T.text2), lineHeight: "32px" }}>收 <span style={{ ...num, fontWeight: 600 }}>{comma(s.close)}</span></div>
          </div>
        );
      })}
      {/* 最後一幕：每一截旁邊標「+1 萬點」 */}
      {g && bracket > 0 ? st.filter((s) => s.landed).map((s, k) => {
        const p = steps[s.g.i], q = steps[s.g.i + 1], x = X(q.t), right = k === st.length - 1, w = 130;
        return <div key={k} style={{ position: "absolute", left: right ? x + 16 : x - 16 - w, width: w, top: (Y(p.level) + Y(q.level)) / 2 - 20, textAlign: right ? "left" : "right", ...zh(30, T.weight.zh, T.upText), opacity: bracket, lineHeight: "40px" }}><span style={num}>+1</span> 萬點</div>;
      }) : null}
      <div style={{ position: "absolute", left: L.PLOT_X0, top: L.NOTE_TOP, ...zh(L.NOTE_PX, T.weight.light, T.text3), letterSpacing: "0.02em" }}>{m.note}</div>
      {/* 長條：每一段花的時間（依天數等比例）；最後一幕換成漲幅 */}
      <div style={{ position: "absolute", left: L.X, top: L.BARS_TOP, ...zh(L.BARS_HEAD_PX, T.weight.body, gainOn > 0.5 ? T.upText : T.amberText), letterSpacing: "0.08em" }}>{gainOn > 0.5 && g ? g.barsTitle : m.barsTitle}</div>
      <div style={{ position: "absolute", left: L.X + 150, right: L.X, top: L.BARS_TOP + 20, height: 2, background: T.ruleSoft, marginLeft: gainOn > 0.5 ? 220 : 0 }} />
      {st.map((s, k) => {
        const on = tween(f, s.g.landAt - 2, T.motion.bar, EASE.enter);
        if (on <= 0) return null;
        const q = g && g.bars[k] !== undefined ? tween(f, g.bars[k], T.motion.bar, EASE.move) : 0;
        const wTime = Math.max(6, (s.g.days / maxDays) * L.BAR_W), wGain = (s.g.gainPct / 100) * L.BAR_W;
        const w = mix(wTime * on, wGain, q), top = L.ROW_TOP + k * L.ROW_GAP;
        const pa = steps[s.g.i], pb = steps[s.g.i + 1];
        const focus = g && f >= g.at ? (q > 0 ? 1 : T.dim + 0.2) : 1;
        return (
          <div key={k} style={{ position: "absolute", left: L.X, top, height: L.ROW_H, width: L.INNER_W, opacity: Math.min(1, on * 2) * focus }}>
            <div style={{ position: "absolute", left: 0, top: 0, lineHeight: `${L.ROW_H}px`, ...zh(L.ROW_PX - 4, T.weight.body, T.text2) }}>{pa.label}→{pb.label}</div>
            <div style={{ position: "absolute", left: L.BAR_X - L.X, top: 6, height: L.ROW_H - 12, width: w, background: q > 0.5 ? T.up : T.amber, borderRadius: T.radius.bar }} />
            <div style={{ position: "absolute", left: L.BAR_X - L.X + w + 16, top: 0, lineHeight: `${L.ROW_H}px` }}>
              {q > 0.5 ? <Parts parts={[{ n: `+${Math.round(s.g.gainPct)}`, u: "%" }]} px={L.ROW_PX + 6} color={T.upText} /> : <Parts parts={spanParts(pa.t, pb.t, pb.t)} px={L.ROW_PX + 6} color={T.amberText} />}
            </div>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

const specOf = (p: Script) => (p as unknown as { chart: ChartSpec }).chart;

export const VideoChart: React.FC<Script & { timeline: TimelineV2 }> = (props) => {
  const { scenes, timeline, channel } = props;
  const f = useCurrentFrame();
  const m = useMemo(() => buildModel(scenes, timeline, specOf(props)), [scenes, timeline]);
  const by = Object.fromEntries(timeline.scenes.map((x) => [x.id, x]));
  const ordered = scenes.filter((s) => by[s.id]);
  const subCues = ordered.filter((s) => by[s.id].subtitleWindow).map((s) => ({ id: s.id, en: s.subtitle.en, keywords: s.keywords, window: by[s.id].subtitleWindow as [number, number], phrases: by[s.id].lines, keywords_at: by[s.id].keywords }));
  const srcCues = ordered.map((s) => ({ sources: s.sources, window: by[s.id].sourceWindow }));
  return (
    <AbsoluteFill>
      <Backdrop />
      <ChartStage m={m} f={f} />
      <CaptionChart cues={subCues} />
      <SourceChart cues={srcCues} />
      <HeaderChart name={channel?.name ?? "白話股市"} tag={channel?.tag ?? "一張圖看懂"} total={timeline.totalFrames} />
      {timeline.voice ? <Audio src={staticFile(timeline.voice.file)} /> : timeline.scenes.filter((t) => t.audio).map((t) => (
        <Sequence key={`${t.id}-audio`} from={t.audioFrame} durationInFrames={Math.ceil(t.audioSec * FPS) + 1} name={`${t.id}-audio`} layout="none"><Audio src={staticFile(t.audio as string)} /></Sequence>
      ))}
    </AbsoluteFill>
  );
};

/** 封面：大標＋畫完三段的階梯圖與時間長條（不需要配音時間軸；全部從 chart.steps 算） */
export const CoverChart: React.FC<Script & { coverCrop?: number }> = (props) => {
  const { cover, channel, scenes, coverCrop } = props;
  const c = (cover ?? {}) as { title?: string[]; sub?: string };
  const spec = specOf(props);
  const views = scenes.map((s) => s.props?.view).filter(Boolean) as { from: string; to: string }[];
  const v = views[views.length - 1];
  const legs = spec.steps.slice(1).map((b, i) => ({ i, days: Math.round((ms(b.date) - ms(spec.steps[i].date)) / 86400000), gainPct: (100 * (b.level - spec.steps[i].level)) / spec.steps[i].level, drawAt: -100, targetAt: -100, landAt: -50 }));
  const m: ChartModel = { total: 1, kicker: c.sub ?? spec.kicker, title: spec.title, note: spec.note, barsTitle: spec.barsTitle ?? "", steps: spec.steps.map((s) => ({ ...s, t: ms(s.date) })), legs, views: [{ at: 0, from: ms(v.from), to: ms(v.to) }] };
  const shift = coverCrop ? (L.H - coverCrop) / 2 - 150 : 0;   // 裁切版：把內容往下移進裁切範圍
  return (
    <AbsoluteFill>
      <Backdrop />
      <div style={{ position: "absolute", inset: 0, transform: `translateY(${shift}px)` }}>
        <HeaderChart name={channel?.name ?? "白話股市"} tag={channel?.tag ?? "一張圖看懂"} total={1} />
        <ChartStage m={m} f={0} title={c.title} />
      </div>
    </AbsoluteFill>
  );
};

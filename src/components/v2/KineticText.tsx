// styleVersion 2：KineticText 全螢幕大字（docs/layout-rules.md「五個元件怎麼填滿」）
// 關鍵詞／數字 140–200px、2–3 行、寬 900–952、y 380–1150；同詞大字水印出血；黃色螢光筆底條；角落 200–280px 輔助圖；
// 底部出血色帶由 SceneBackdropV2 提供。每一行、翻牌數字、輔助圖都依 cue 絕對幀（已換成本地幀）觸發。
import React from "react";
import { useCurrentFrame } from "remotion";
import { FONT_EN, FONT_ZH, LAYOUT_V2 as L, THEME_V2 as T, accentV2 } from "../../theme";
import { DUR, EASE, bump, countUp, tween } from "../anim";
import { cueAt, cueIn, firstEarly, focusLevel, hasCue, useCue } from "../../cue";
import { IconV2, fmtNum, markerBg, reveal } from "./base";

type Count = { from: number; to: number; decimals?: number; startAt?: string; at?: string };
export type KLine = { text: string; at?: string; size?: number; color?: string; mark?: boolean; count?: Count; font?: "zh" | "num" };
type Flip = { value: number; from: number; startAt?: string; at?: string; unit?: string; caption?: string };
type Aux =
  | { type: "ring"; value: number; label: string; caption?: string; at?: string; pos?: "tr" | "br"; color?: string }
  | { type: "sparkline"; values: number[]; ends?: [string, string]; label: string; decimals?: number; suffix?: string; at?: string; pos?: "tr" | "br"; color?: string }
  | { type: "icon"; name: string; at?: string; pos?: "tr" | "br"; color?: string };
export type KineticProps = { kicker?: string; lines: KLine[]; flip?: Flip; aux?: Aux; watermark?: string; note?: string; noteAt?: string; color?: string };

const ly = (y: number) => y - L.CONTENT_TOP;
const AUX = 260;

/** 翻牌（odometer）：每一位數各自滾動；低位進位時高位才轉 */
const FlipNumber: React.FC<{ v: number; final: number; color: string }> = ({ v, final, color }) => {
  const s = fmtNum(final);
  const h = 206;
  let place = s.replace(/,/g, "").length - 1;
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 10 }}>
      {[...s].map((ch, i) => {
        if (ch === ",") return <div key={i} style={{ fontFamily: FONT_EN, fontWeight: T.weight.num, fontSize: 120, color: T.text, width: 30, lineHeight: 1 }}>,</div>;
        const k = place--;
        const p = 10 ** k;
        const digit = Math.floor(v / p) % 10;
        const frac = k === 0 ? v % 1 : Math.max(0, (v % p) - (p - 1));
        const y = -(digit + frac) * h;
        return (
          <div key={i} style={{ position: "relative", width: 104, height: h, overflow: "hidden", borderRadius: T.radius, background: T.card, border: `${T.cardBorderW}px solid ${T.cardBorder}`, boxShadow: T.shadow }}>
            <div style={{ position: "absolute", left: 0, right: 0, top: 0, transform: `translateY(${y.toFixed(1)}px)` }}>
              {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map((d, j) => (
                <div key={j} style={{ height: h, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FONT_EN, fontWeight: T.weight.num, fontSize: 160, color, fontVariantNumeric: "tabular-nums" }}>{d}</div>
              ))}
            </div>
            <div style={{ position: "absolute", left: 0, right: 0, top: h / 2 - 1, height: 3, background: T.bg }} />
          </div>
        );
      })}
    </div>
  );
};

const AuxView: React.FC<{ aux: Aux; f: number; start: number }> = ({ aux, f, start }) => {
  const a = accentV2(aux.color);
  const p = tween(f, start, DUR.l + 6, EASE.move);
  const box: React.CSSProperties = { position: "absolute", width: AUX, height: AUX, right: 0, ...(aux.pos === "tr" ? { top: ly(L.KT_TOP) } : { top: ly(L.KT_BOTTOM) - AUX }), ...reveal(f, start, 1, 16) };
  if (aux.type === "icon") return <div style={{ ...box, display: "flex", alignItems: "center", justifyContent: "center" }}><IconV2 name={aux.name} color={aux.color} size={AUX - 20} draw={p} /></div>;
  if (aux.type === "ring") {
    const r = 92, c = 2 * Math.PI * r;
    return (
      <div style={{ ...box, display: "flex", flexDirection: "column", alignItems: "center" }}>
        <svg width={220} height={220} viewBox="0 0 220 220">
          <circle cx={110} cy={110} r={r} fill="none" stroke={T.track} strokeWidth={30} />
          <circle cx={110} cy={110} r={r} fill="none" stroke={a.fill} strokeWidth={30} strokeDasharray={`${(c * aux.value * p / 100).toFixed(1)} ${c}`} transform="rotate(-90 110 110)" />
          <text x={110} y={124} textAnchor="middle" fontFamily={FONT_EN} fontWeight={T.weight.num} fontSize={44} fill={a.text}>{fmtNum(aux.value * p, 2)}%</text>
        </svg>
        <div style={{ fontFamily: FONT_ZH, fontSize: 28, fontWeight: 700, color: T.text2, marginTop: 2, whiteSpace: "nowrap" }}>{aux.label}</div>
      </div>
    );
  }
  // sparkline
  const vs = aux.values, w = AUX, hh = 170, pad = 16;
  const lo = Math.min(0, ...vs), hi = Math.max(0, ...vs);
  const X = (i: number) => pad + (i / (vs.length - 1)) * (w - pad * 2);
  const Y = (v: number) => pad + (1 - (v - lo) / (hi - lo || 1)) * (hh - pad * 2);
  const n = Math.max(1, p * (vs.length - 1));
  const k = Math.floor(n), fr = n - k;
  const pts = vs.slice(0, k + 1).map((v, i) => [X(i), Y(v)]);
  if (k < vs.length - 1) pts.push([X(k) + (X(k + 1) - X(k)) * fr, Y(vs[k]) + (Y(vs[k + 1]) - Y(vs[k])) * fr]);
  const head = pts[pts.length - 1];
  return (
    <div style={{ ...box, background: T.card, border: `${T.cardBorderW}px solid ${T.cardBorder}`, borderRadius: T.radius, boxShadow: T.shadow, padding: "14px 0 0", boxSizing: "border-box" }}>
      <div style={{ fontFamily: FONT_ZH, fontSize: 28, fontWeight: 700, color: T.text2, textAlign: "center" }}>{aux.label}</div>
      <svg width={w} height={hh} style={{ display: "block" }}>
        <line x1={pad} x2={w - pad} y1={Y(0)} y2={Y(0)} stroke={T.chart.grid} strokeWidth={3} strokeDasharray="8 8" />
        <polyline points={pts.map((q) => q.map((x) => x.toFixed(1)).join(",")).join(" ")} fill="none" stroke={a.fill} strokeWidth={7} strokeLinejoin="round" strokeLinecap="round" />
        <circle cx={head[0]} cy={head[1]} r={10} fill={a.fill} stroke={T.card} strokeWidth={4} />
      </svg>
      {aux.ends && <div style={{ position: "absolute", left: 14, right: 14, bottom: 8, display: "flex", justifyContent: "space-between", fontFamily: FONT_EN, fontSize: 28, fontWeight: 700, color: T.text2 }}><span>{aux.ends[0]}</span><span style={{ color: a.text, opacity: p >= 1 ? 1 : 0 }}>{aux.ends[1]}</span></div>}
    </div>
  );
};

export const KineticText: React.FC<KineticProps> = ({ kicker, lines, flip, aux, watermark, note, noteAt, color }) => {
  const f = useCurrentFrame();
  const c = useCue();
  const acc = accentV2(color);
  const starts = firstEarly(lines.map((l, i) => cueIn(c, l.at, 6 + i * 8)));
  const cued = lines.map((l) => hasCue(c, l.at));
  // 前景層：整幕緩慢水平漂移（視差 1.0，40px）；水印反向漂移（0.2）
  const drift = tween(f, 0, Math.max(1, c.exit), EASE.move);
  const fx = Math.round(56 * (1 - drift) * 10) / 10; // 56 → 0：只往左漂、最後對齊左側脊線，不出安全區
  const wx = Math.round((-8 + 16 * drift) * 10) / 10;
  const flipLand = flip ? cueAt(c, flip.at, 50) : 0;
  let flipStart = flip ? cueAt(c, flip.startAt, Math.max(6, flipLand - 40)) : 0;
  if (flip && flipLand - flipStart < 30) flipStart = flipLand - 36;
  const flipV = flip ? flip.from + (flip.value - flip.from) * countUp(f, flipStart, flipLand) : 0;
  const auxIn = aux ? cueIn(c, aux.at, 20) : 0;
  return (
    <div style={{ position: "relative", width: 952, height: L.CONTENT_BOTTOM - L.CONTENT_TOP }}>
      {watermark && (
        <div style={{ position: "absolute", right: -180, top: ly(L.KT_TOP) + 160, transform: `translateX(${wx}px)`, fontFamily: FONT_ZH, fontWeight: T.weight.title, fontSize: L.WATERMARK_PX + 60, lineHeight: 1, whiteSpace: "nowrap", color: T.watermark, opacity: L.WATERMARK_OPACITY + 0.01 }}>{watermark}</div>
      )}
      {/* 左側主色直條：串起每一行（版面的脊線），隨進場由上往下畫出 */}
      <div style={{ position: "absolute", left: 0, top: ly(L.KT_TOP) - 30, width: 10, height: (L.KT_BOTTOM - L.KT_TOP + 30) * tween(f, 0, DUR.l * 2, EASE.move), background: acc.fill, borderRadius: 2, transform: `translateX(${fx}px)` }} />
      <div style={{ position: "absolute", left: 30, width: 922, top: ly(L.KT_TOP), height: L.KT_BOTTOM - L.KT_TOP, display: "flex", flexDirection: "column", justifyContent: "space-between", alignItems: "flex-start", transform: `translateX(${fx}px)` }}>
        {kicker && <div style={{ ...reveal(f, 0), alignSelf: "stretch", fontFamily: FONT_ZH, fontSize: 44, fontWeight: 700, color: T.text2, letterSpacing: "0.04em", borderBottom: `5px solid ${acc.fill}`, paddingBottom: 6 }}>{kicker}</div>}
        {flip && (
          <div style={{ ...reveal(f, Math.min(flipStart - 6, 8)), display: "flex", alignItems: "flex-end", gap: 22 }}>
            <div style={{ transform: `scale(${bump(f, flipLand, 0.04).toFixed(4)})`, transformOrigin: "0% 100%" }}><FlipNumber v={flipV} final={flip.value} color={acc.text} /></div>
            {flip.unit && <div style={{ fontFamily: FONT_ZH, fontSize: 84, fontWeight: T.weight.title, color: T.text, lineHeight: 1 }}>{flip.unit}</div>}
          </div>
        )}
        {flip?.caption && <div style={{ ...reveal(f, flipLand - 6, 1, 12), fontFamily: FONT_ZH, fontSize: 40, fontWeight: 700, color: T.text2 }}>{flip.caption}</div>}
        {lines.map((l, i) => {
          const fo = focusLevel(f, c, starts, cued, i);
          const land = cueAt(c, l.at, starts[i] + 4);
          const sz = l.size ?? 160;
          let text = l.text;
          if (l.count) {
            // 數字從該行進場開始跑，念到 count.at 後 12 幀落定（至少跑 18 幀）
            const cs = l.count.startAt ? cueAt(c, l.count.startAt, starts[i]) : starts[i];
            const cl = Math.max(cueAt(c, l.count.at, land) + 12, cs + 18);
            text = text.replace("{n}", fmtNum(l.count.from + (l.count.to - l.count.from) * countUp(f, cs, cl), l.count.decimals ?? 0));
          }
          const col = l.color ? accentV2(l.color).text : T.text;
          const r = reveal(f, starts[i], fo, 24);
          return (
            <div key={i} style={{ ...r, transform: `${r.transform} scale(${(cued[i] ? bump(f, land, 0.05) : 1).toFixed(4)})`, transformOrigin: "0% 70%", fontFamily: l.font === "num" ? FONT_EN : FONT_ZH, fontSize: sz, fontWeight: T.weight.title, lineHeight: 1.08, letterSpacing: "-0.02em", color: col, whiteSpace: "nowrap", fontVariantNumeric: "tabular-nums" }}>
              <span style={{ ...(l.mark ? markerBg(tween(f, land, DUR.m, EASE.enter)) : {}), paddingRight: 8 }}>{text}</span>
            </div>
          );
        })}
        {note && <div style={{ ...reveal(f, cueIn(c, noteAt, 30), 1, 12), fontFamily: FONT_ZH, fontSize: 38, fontWeight: T.weight.body, color: T.text2, lineHeight: 1.4, maxWidth: aux ? 952 - AUX - 24 : 952 }}>{note}</div>}
      </div>
      {aux && <AuxView aux={aux} f={f} start={auxIn} />}
    </div>
  );
};

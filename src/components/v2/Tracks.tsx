// styleVersion 2：全片字幕軌（短語模式）與來源列軌道
import React from "react";
import { interpolateColors, useCurrentFrame } from "remotion";
import { FONT_EN, FONT_ZH, LAYOUT_V2 as L, THEME_V2 as T } from "../../theme";
import { DUR, EASE, tween } from "../anim";
import { splitParts } from "../Subtitle";

export type PhraseCue = {
  id: string; en: string; keywords: string[];
  /** 絕對幀 [in, out) */
  window: [number, number];
  /** align.mjs 算好的短語（timeline lines）：text＝字幕的連續子字串，start＝出現幀 */
  phrases: { text: string; start: number }[];
  keywords_at: { text: string; start: number }[];
};

/** v3 字幕換段：進 9 幀（從下方 12px 升起淡入）、出 6 幀（上移 12px 淡出），舊段在新段開始前 OUT−OVERLAP 幀起淡出，新舊段只交疊 2 幀（≤3）；英文在幕首延後 6 幀（主體先落定） */
const IN = 9, OUT = 6, OVERLAP = 2, EN_DELAY = 6, RISE = 14;
const display = (p: string) => p.replace(/\n/g, "").replace(/[，、；：。]+$/, "");
/** 英文副字幕：依中文「句」顯示，每段 ≤ SUB_EN_MAX 字元（在空白處切）；第 k 段對應中文短語的比例位置 */
export const enChunks = (en: string, max: number = L.SUB_EN_MAX) => {
  const words = en.split(/\s+/).filter(Boolean);
  const out: string[] = [];
  let cur = "";
  for (const w of words) { if (cur && (cur + " " + w).length > max) { out.push(cur); cur = w; } else cur = cur ? `${cur} ${w}` : w; }
  if (cur) out.push(cur);
  // 平衡：最後一段太短就和前一段重分
  if (out.length > 1 && out[out.length - 1].length < max * 0.35) {
    const all = (out[out.length - 2] + " " + out[out.length - 1]).split(" ");
    const half = Math.ceil(all.length / 2);
    out.splice(out.length - 2, 2, all.slice(0, half).join(" "), all.slice(half).join(" "));
  }
  return out.length ? out : [""];
};

/** 一段的不透明度與位移：t0 起 IN 幀淡入上升；next（下一段開始）前 OVERLAP 幀起 OUT 幀淡出上移 */
const seg = (f: number, t0: number, next: number, first: boolean) => {
  const ein = first && t0 <= 0 ? 1 : tween(f, t0, IN, EASE.enter);
  const eout = tween(f, next - OUT + OVERLAP, OUT, EASE.exit);
  return { op: Math.min(ein, 1 - eout), dy: Math.round(RISE * (1 - ein) - RISE * eout) };
};

const PhraseView: React.FC<{ cue: PhraseCue; f: number }> = ({ cue, f }) => {
  const [a, b] = cue.window;
  const ps = cue.phrases;
  const kwAt = Object.fromEntries(cue.keywords_at.map((x) => [x.text, x.start]));
  const startOf = (k: number) => (k === 0 ? a : ps[k].start);
  const endOf = (k: number) => (k + 1 < ps.length ? ps[k + 1].start : b);
  // 可見的段：開始 ≤ f < 結束 + OUT − OVERLAP（交疊時同時畫兩段）
  const vis = ps.map((_, k) => k).filter((k) => f >= startOf(k) && f < endOf(k) + OVERLAP);
  const en = enChunks(cue.en);
  const enStartOf = (ek: number) => (ek === 0 ? a + EN_DELAY : ps[Math.ceil((ek * ps.length) / en.length)]?.start ?? a);
  const enEndOf = (ek: number) => (ek + 1 < en.length ? enStartOf(ek + 1) : b);
  const enVis = en.map((_, k) => k).filter((k) => f >= enStartOf(k) && f < enEndOf(k) + OVERLAP);
  return (
    <div style={{ position: "absolute", left: L.X, width: L.SUB_RIGHT - L.X, top: L.SUB_TOP, height: L.SUB_BOTTOM - L.SUB_TOP }}>
      {vis.map((k) => {
        const { op, dy } = seg(f, startOf(k), endOf(k), k === 0);
        return (
          <div key={k} style={{ position: "absolute", left: 0, right: 0, top: 46, height: 150, display: "flex", alignItems: "center", justifyContent: "center", opacity: op, transform: `translateY(${dy}px)`, fontFamily: FONT_ZH, fontWeight: T.weight.title, fontSize: L.SUB_ZH_PX, lineHeight: 1.24, color: T.text, whiteSpace: "nowrap" }}>
            <span>
              {splitParts(display(ps[k].text), cue.keywords).map((p, i) => {
                if (p.k < 0) return <span key={i}>{p.text}</span>;
                const style = T.kw[p.k % T.kw.length];
                const at = kwAt[p.text];
                const t = at === undefined ? 1 : tween(f, at - 1, DUR.s, EASE.enter);
                const w = Math.round(t * 100);
                return (
                  <span key={i} style={{ color: interpolateColors(t, [0, 1], [T.text, style.color]), whiteSpace: "nowrap", padding: "0 2px",
                    ...(style.mark ? { backgroundImage: `linear-gradient(${style.mark}, ${style.mark})`, backgroundRepeat: "no-repeat", backgroundPosition: "0 90%", backgroundSize: `${w}% 36%` } : {}) }}>{p.text}</span>
                );
              })}
            </span>
          </div>
        );
      })}
      {enVis.map((k) => {
        const { op, dy } = seg(f, enStartOf(k), enEndOf(k), false);
        return <div key={`en${k}`} style={{ position: "absolute", left: 0, right: 0, top: 178, textAlign: "center", opacity: Math.max(0, op), transform: `translateY(${dy}px)`, fontFamily: FONT_EN, fontSize: L.SUB_EN_PX, lineHeight: 1.3, fontWeight: T.weight.body, color: T.text2, whiteSpace: "nowrap" }}>{en[k]}</div>;
      })}
    </div>
  );
};

/** 全片字幕軌（v2 短語模式）：一次一段、底緣 y ≤ LAYOUT_V2.SUB_BOTTOM，跟絕對時間軸走 */
export const SubtitleTrackV2: React.FC<{ cues: PhraseCue[] }> = ({ cues }) => {
  const f = useCurrentFrame();
  // 換幕時上一幕最後一段還在淡出（交疊 OVERLAP 幀）：同時畫兩個 cue
  const act = cues.filter((c) => c.phrases.length && f >= c.window[0] && f < c.window[1] + OVERLAP);
  return <>{act.map((c) => <PhraseView key={c.id} cue={c} f={f} />)}</>;
};

/** 來源列（v2）：字幕下方，細分隔線＋24px 輔助文字；相鄰幕來源相同就合併 */
export const SourceTrackV2: React.FC<{ cues: { sources: string[]; window: [number, number] }[]; asOf?: string }> = ({ cues, asOf }) => {
  const f = useCurrentFrame();
  const merged: { text: string; window: [number, number] }[] = [];
  for (const c of cues) {
    if (!c.sources.length) continue;
    const text = `資料來源：${c.sources.join("、")}${asOf ? `｜截至 ${asOf}` : ""}`;
    const last = merged[merged.length - 1];
    if (last && last.text === text && last.window[1] === c.window[0]) last.window = [last.window[0], c.window[1]];
    else merged.push({ text, window: [c.window[0], c.window[1]] });
  }
  // v3：進 9 幀、出 6 幀（與字幕同節奏），新舊交疊 3 幀
  const cur = merged.find((c) => f >= c.window[0] && f < c.window[1] + OVERLAP);
  if (!cur) return null;
  const nxt = merged.find((c) => c !== cur && f >= c.window[0] && f < c.window[1]);
  const show = nxt && f >= cur.window[1] ? nxt : cur;
  const op = Math.min(show.window[0] === 0 ? 1 : tween(f, show.window[0], IN, EASE.enter), 1 - tween(f, show.window[1] - OUT + OVERLAP, OUT, EASE.exit));
  return (
    <div style={{ position: "absolute", left: L.X, right: L.X, top: L.SOURCE_TOP, borderTop: `2px solid ${T.divider}`, paddingTop: 10, opacity: op }}>
      <div style={{ fontFamily: FONT_ZH, fontSize: 24, color: T.text3, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{show.text}</div>
    </div>
  );
};

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

const IN = 3, OUT = 2;
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

const PhraseView: React.FC<{ cue: PhraseCue; f: number }> = ({ cue, f }) => {
  const [a, b] = cue.window;
  const ps = cue.phrases;
  let k = 0;
  for (let i = 0; i < ps.length; i++) if (f >= ps[i].start) k = i;
  const cur = ps[k];
  const nextStart = k + 1 < ps.length ? ps[k + 1].start : b;
  const t0 = k === 0 ? a : cur.start;
  // 換段：舊段最後 2 幀淡出、新段 3 幀淡入＋上移 8px（任一幀只有一段）
  const op = Math.min(t0 === 0 ? 1 : tween(f, t0, IN, EASE.enter), 1 - tween(f, nextStart - OUT, OUT, EASE.exit));
  const dy = Math.round(8 * (1 - tween(f, t0, IN + 1, EASE.enter)));
  const kwAt = Object.fromEntries(cue.keywords_at.map((x) => [x.text, x.start]));
  const en = enChunks(cue.en);
  const ek = Math.min(en.length - 1, Math.floor((k * en.length) / ps.length));
  const enStart = k === 0 ? a : ps[Math.ceil((ek * ps.length) / en.length)]?.start ?? a;
  const enOp = Math.min(enStart === 0 ? 1 : tween(f, enStart, IN, EASE.enter), (ek + 1 < en.length ? 1 - tween(f, (ps[Math.ceil(((ek + 1) * ps.length) / en.length)]?.start ?? b) - OUT, OUT, EASE.exit) : 1 - tween(f, b - OUT, OUT, EASE.exit)));
  return (
    <div style={{ position: "absolute", left: L.X, width: L.SUB_RIGHT - L.X, top: L.SUB_TOP, height: L.SUB_BOTTOM - L.SUB_TOP, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", textAlign: "center" }}>
      <div style={{ opacity: op, transform: `translateY(${dy}px)`, fontFamily: FONT_ZH, fontWeight: T.weight.title, fontSize: L.SUB_ZH_PX, lineHeight: 1.24, color: T.text, whiteSpace: "nowrap" }}>
        {splitParts(display(cur.text), cue.keywords).map((p, i) => {
          if (p.k < 0) return <span key={i}>{p.text}</span>;
          const style = T.kw[p.k % T.kw.length];
          const at = kwAt[p.text];
          const t = at === undefined ? 1 : tween(f, at - 1, DUR.xs, EASE.enter);
          const w = Math.round(t * 100);
          return (
            <span key={i} style={{ color: interpolateColors(t, [0, 1], [T.text, style.color]), whiteSpace: "nowrap", padding: "0 2px",
              ...(style.mark ? { backgroundImage: `linear-gradient(${style.mark}, ${style.mark})`, backgroundRepeat: "no-repeat", backgroundPosition: "0 90%", backgroundSize: `${w}% 36%` } : {}) }}>{p.text}</span>
          );
        })}
      </div>
      <div style={{ opacity: Math.max(0, enOp), marginTop: 10, fontFamily: FONT_EN, fontSize: L.SUB_EN_PX, lineHeight: 1.3, fontWeight: T.weight.body, color: T.text2, whiteSpace: "nowrap" }}>{en[ek]}</div>
    </div>
  );
};

/** 全片字幕軌（v2 短語模式）：一次一段、底緣 y ≤ LAYOUT_V2.SUB_BOTTOM，跟絕對時間軸走 */
export const SubtitleTrackV2: React.FC<{ cues: PhraseCue[] }> = ({ cues }) => {
  const f = useCurrentFrame();
  const cue = cues.find((c) => f >= c.window[0] && f < c.window[1]);
  return cue && cue.phrases.length ? <PhraseView cue={cue} f={f} /> : null;
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
  const cur = merged.find((c) => f >= c.window[0] && f < c.window[1]);
  if (!cur) return null;
  const op = Math.min(cur.window[0] === 0 ? 1 : tween(f, cur.window[0], 3, EASE.enter), 1 - tween(f, cur.window[1] - 2, 2, EASE.exit));
  return (
    <div style={{ position: "absolute", left: L.X, right: L.X, top: L.SOURCE_TOP, borderTop: `2px solid ${T.divider}`, paddingTop: 10, opacity: op }}>
      <div style={{ fontFamily: FONT_ZH, fontSize: 24, color: T.text3, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{cur.text}</div>
    </div>
  );
};

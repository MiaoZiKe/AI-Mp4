// 資料圖表主導的固定層：頁首（頻道名＋標籤＋進度線）、字幕列、出處。時間讀 timeline（和 v3 同一套字幕短語）。
import React from "react";
import { useCurrentFrame } from "remotion";
import { FONT_EN, FONT_ZH, LAYOUT_CHARTLEAD as L, THEME_CHARTLEAD as T } from "../../theme";
import { EASE, tween } from "../anim";
import { splitParts } from "../Subtitle";
import type { PhraseCue } from "../v2/Tracks";

const display = (p: string) => p.replace(/\n/g, "").replace(/[，、；：。]+$/, "");
const enSplit = (en: string) => String(en ?? "").split("|").map((x) => x.trim()).filter(Boolean);

export const HeaderChart: React.FC<{ name: string; tag: string; total: number }> = ({ name, tag, total }) => {
  const f = useCurrentFrame();
  return (
    <>
      <div style={{ position: "absolute", left: L.X, right: L.X, top: L.HEADER_TOP, height: L.HEADER_H, display: "flex", alignItems: "center", justifyContent: "space-between", fontFamily: FONT_ZH }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          {/* 頻道標記：三根往上的長條（自繪，不是任何商標） */}
          <div style={{ width: 48, height: 48, display: "flex", alignItems: "flex-end", gap: 6 }}>
            {[18, 30, 46].map((h, i) => <div key={i} style={{ width: 12, height: h, background: i === 2 ? T.up : T.text, borderRadius: T.radius.bar }} />)}
          </div>
          <div style={{ fontWeight: T.weight.zh, fontSize: 40, color: T.text, letterSpacing: "0.04em" }}>{name}</div>
        </div>
        <div style={{ fontWeight: T.weight.body, fontSize: 26, color: T.amberText, border: `2px solid ${T.amber}`, borderRadius: T.radius.chip, padding: "6px 20px", letterSpacing: "0.08em" }}>{tag}</div>
      </div>
      <div style={{ position: "absolute", left: L.X, top: L.PROGRESS_TOP, width: L.INNER_W, height: 4, background: T.ruleSoft }}>
        <div style={{ width: `${(100 * Math.min(1, f / Math.max(1, total - 1))).toFixed(2)}%`, height: 4, background: T.amber }} />
      </div>
    </>
  );
};

/** 字幕列：一次一段單行；關鍵詞念到時換成琥珀色並畫底線；英文跟著中文的句 */
export const CaptionChart: React.FC<{ cues: PhraseCue[] }> = ({ cues }) => {
  const f = useCurrentFrame();
  const act = cues.filter((c) => c.phrases.length);
  if (!act.length) return null;
  const cue = [...act].reverse().find((c) => f >= c.window[0]) ?? act[0];
  const a = cue.window[0], ps = cue.phrases;
  const startOf = (k: number) => (k === 0 ? a : ps[k].start);
  let k = 0; for (let i = 0; i < ps.length; i++) if (f >= startOf(i)) k = i;
  const en = enSplit(cue.en);
  const enStart = (e: number) => (e === 0 ? a : ps[Math.ceil((e * ps.length) / en.length)]?.start ?? a);
  let e = 0; for (let i = 0; i < en.length; i++) if (f >= enStart(i)) e = i;
  const kwAt = Object.fromEntries(cue.keywords_at.map((x) => [x.text, x.start]));
  const p = a <= 0 && k === 0 ? 1 : tween(f, startOf(k), 5, EASE.enter);
  return (
    <div style={{ position: "absolute", left: L.X, top: L.CAP_TOP, width: L.INNER_W, height: L.CAP_H, background: T.panel, borderTop: `4px solid ${T.rule}`, borderBottom: `2px solid ${T.ruleSoft}` }}>
      <div style={{ position: "absolute", left: 0, right: 0, top: 30, height: 104, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FONT_ZH, fontWeight: T.weight.zh, fontSize: L.CAP_ZH_PX, color: T.text, letterSpacing: "0.02em", whiteSpace: "nowrap", transform: `translateY(${Math.round(8 * (1 - p))}px)`, opacity: p }}>
        <span>
          {splitParts(display(ps[k].text), cue.keywords).map((s, i) => {
            if (s.k < 0) return <span key={i}>{s.text}</span>;
            const q = kwAt[s.text] === undefined ? 1 : tween(f, kwAt[s.text] - 1, 8, EASE.move);
            return (
              <span key={i} style={{ position: "relative", color: q > 0.5 ? T.amberText : T.text }}>
                {s.text}
                <span style={{ position: "absolute", left: 0, bottom: -6, height: 8, width: `${(100 * q).toFixed(1)}%`, background: T.amber }} />
              </span>
            );
          })}
        </span>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 158, textAlign: "center", fontFamily: FONT_EN, fontWeight: T.weight.light, fontSize: L.CAP_EN_PX, color: T.text2, whiteSpace: "nowrap" }}>{en[e]}</div>
    </div>
  );
};

/** 出處：字幕列下方一行小字；相鄰幕相同就不重貼 */
export const SourceChart: React.FC<{ cues: { sources: string[]; window: [number, number] }[] }> = ({ cues }) => {
  const f = useCurrentFrame();
  const k = cues.map((c, i) => (c.sources?.length && f >= c.window[0] ? i : -1)).reduce((x, y) => Math.max(x, y), -1);
  if (k < 0) return null;
  const cur = cues[k], j = cur.sources.join("、");
  const same = k > 0 && cues[k - 1].sources?.join("、") === j;
  const p = same || cur.window[0] <= 0 ? 1 : tween(f, cur.window[0], T.motion.in, EASE.enter);
  return (
    <div style={{ position: "absolute", left: L.X + 4, top: L.SRC_TOP, display: "flex", alignItems: "center", gap: 12, opacity: p, fontFamily: FONT_ZH, fontWeight: T.weight.light, fontSize: L.SRC_PX, color: T.text3, letterSpacing: "0.02em", whiteSpace: "nowrap" }}>
      <div style={{ width: 10, height: 10, background: T.text3 }} />
      {/^(資料)?來源/.test(j) ? j : `來源：${j}`}
    </div>
  );
};

// v3 固定層：字幕紙條（PaperCaption）、出處紙條、頁首、片尾卡。座標讀 LAYOUT_V3，顏色讀 THEME_V3。
import React from "react";
import { Easing, useCurrentFrame } from "remotion";
import { FONT_EN, FONT_ZH, LAYOUT_V3 as L } from "../../theme";
import { DUR, EASE, tween } from "../anim";
import { splitParts } from "../Subtitle";
import { enChunks, type PhraseCue } from "../v2/Tracks";
import { Paper, useChannel, useT } from "./assets";
import { MarkerHighlight, tidyQ } from "./Pieces";

const IN = DUR.s - 2, OVERLAP = 2;
/** 英文副字幕分段：稿子裡寫「|」＝手動斷點（一段對一段中文短語）；沒寫才自動斷（每段 ≤46 字元）。scripts/subs.mjs 的 v3 分支同一套 */
export const EN_MAX_V3 = 46;
export const enSplitV3 = (en: string) => (String(en ?? "").includes("|") ? String(en).split("|").map((x) => x.trim()).filter(Boolean) : enChunks(en, EN_MAX_V3));
const display = (p: string) => p.replace(/\n/g, "").replace(/[，、；：。]+$/, "");

/**
 * 字幕（沿用 v2 短語模式與 timeline 的字幕時間）：白色撕邊紙條一直貼在桌上，字一段一段換（單行、中文 72px 900），
 * 關鍵詞念到時芥末黃麥克筆底擦出；英文副字幕 30px 在紙條下緣，跟著中文的句。沒有字幕的時段（片尾卡）紙條往下滑出。
 * 換段：新字直接接上（不淡入、不先清空），只有 10px 的落定位移，紙條不會閃一下空白。
 */
export const PaperCaption: React.FC<{ cues: PhraseCue[]; endAt?: number }> = ({ cues, endAt = Infinity }) => {
  const f = useCurrentFrame();
  const T = useT();
  const act = cues.filter((c) => c.phrases.length);
  if (!act.length) return null;
  const first = act[0].window[0], last = Math.min(act[act.length - 1].window[1], endAt);   // 片尾卡一出來就連字一起滑走，不留空紙條
  // 紙條：片頭就在；最後一句結束後往下滑出（6 幀）
  const out = tween(f, last, DUR.s - 2, EASE.exit);
  if (f < first - IN || out >= 1) return null;
  const cur = act.filter((c, i) => f >= c.window[0] && (f < c.window[1] + OVERLAP || i === act.length - 1));
  // 換段時紙條極小地歪一下（每段固定一個角度，逐格感）
  const idx = act.reduce((n, c) => n + c.phrases.filter((p, k) => (k === 0 ? c.window[0] : p.start) <= f).length, 0);
  const rot = ((idx * 7919) % 5 - 2) * 0.12;
  return (
    <div style={{ position: "absolute", left: L.CAP_X, top: L.CAP_TOP, transform: `translateY(${Math.round(700 * out)}px) rotate(${rot.toFixed(2)}deg)` }}>
      <Paper asset="caption" w={L.CAP_W}>
        {cur.map((cue) => {
          const [a, b] = cue.window, ps = cue.phrases;
          const kwAt = Object.fromEntries(cue.keywords_at.map((x) => [x.text, x.start]));
          const startOf = (k: number) => (k === 0 ? a : ps[k].start), endOf = (k: number) => (k + 1 < ps.length ? ps[k + 1].start : b);
          const en = enSplitV3(cue.en);
          const enStart = (e: number) => (e === 0 ? a : ps[Math.ceil((e * ps.length) / en.length)]?.start ?? a), enEnd = (e: number) => (e + 1 < en.length ? enStart(e + 1) : b);
          const isLast = cue === act[act.length - 1];
          const vis = (t0: number, t1: number) => f >= t0 && (f < t1 || (isLast && t1 === b));
          return (
            <React.Fragment key={cue.id}>
              {ps.map((ph, k) => {
                if (!vis(startOf(k), endOf(k))) return null;
                const p = k === 0 && a <= 0 ? 1 : tween(f, startOf(k), IN, EASE.enter);
                return (
                  <div key={k} style={{ position: "absolute", left: 0, right: 0, top: 34, height: 100, display: "flex", alignItems: "center", justifyContent: "center", transform: `translateY(${Math.round(10 * (1 - p))}px)`, fontFamily: FONT_ZH, fontWeight: T.weight.zh, fontSize: L.CAP_ZH_PX, lineHeight: 1.2, letterSpacing: "0.02em", color: T.ink, whiteSpace: "nowrap" }}>
                    <span>
                      {splitParts(display(ph.text), cue.keywords).map((s, i) => (s.k < 0 ? <span key={i}>{tidyQ(s.text)}</span> : <MarkerHighlight key={i} k={s.k} p={kwAt[s.text] === undefined ? 1 : tween(f, kwAt[s.text] - 1, DUR.s, EASE.move)}>{tidyQ(s.text)}</MarkerHighlight>))}
                    </span>
                  </div>
                );
              })}
              {en.map((t, e) => (vis(enStart(e), enEnd(e)) ? (
                <div key={`en${e}`} style={{ position: "absolute", left: 0, right: 0, top: 150, textAlign: "center", fontFamily: FONT_EN, fontWeight: T.weight.enBody, fontSize: L.CAP_EN_PX, lineHeight: 1.3, color: T.ink2, whiteSpace: "nowrap" }}>{t}</div>
              ) : null))}
            </React.Fragment>
          );
        })}
      </Paper>
    </div>
  );
};

/** 出處紙條：牛皮色撕邊小紙條貼在字幕下方；相鄰幕文字相同就不重貼。文字＝scene.sources（已是「來源：…」整句就照用） */
export const SourceTrackV3: React.FC<{ cues: { sources: string[]; window: [number, number] }[] }> = ({ cues }) => {
  const f = useCurrentFrame();
  const T = useT();
  const merged: { text: string; window: [number, number] }[] = [];
  for (const c of cues) {
    if (!c.sources?.length) continue;
    const j = c.sources.join("、"), text = /^(資料)?來源/.test(j) ? j : `來源：${j}`;
    const lastM = merged[merged.length - 1];
    if (lastM && lastM.text === text && lastM.window[1] >= c.window[0]) lastM.window[1] = c.window[1]; else merged.push({ text, window: [c.window[0], c.window[1]] });
  }
  const cur = merged.find((c) => f >= c.window[0] - 1 && f < c.window[1] + DUR.s);
  if (!cur) return null;
  const ff = Math.floor(f / 2) * 2;
  const p = cur.window[0] <= 0 ? 1 : tween(ff, cur.window[0], DUR.s - 2, EASE.enter), q = tween(ff, cur.window[1], DUR.s - 2, EASE.exit);
  return (
    <div style={{ position: "absolute", left: L.SRC_X + 20, top: L.SRC_TOP, transform: `translateX(${Math.round(-760 * (1 - p) - 760 * q)}px) rotate(-0.6deg)` }}>
      <Paper asset="src">
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", paddingLeft: 22, fontFamily: FONT_ZH, fontWeight: T.weight.body, fontSize: L.SRC_PX, color: T.srcInk, letterSpacing: "0.02em", whiteSpace: "nowrap" }}>{cur.text}</div>
      </Paper>
    </div>
  );
};

/** 頁首：紅圓紙片＋「白話國際」、右上「國際白話講」膠囊；dark＝切割墊蓋到頁首時換成淺色字 */
export const HeaderV3: React.FC<{ dark?: boolean; plate?: number; plateLeft?: number; top?: number }> = ({ dark: darkIn, plate: plateIn = -1, plateLeft: plateLeftIn = 99, top }) => {
  const T = useT(), ch = useChannel();
  // skin 的 headerPlate＝紙底一直墊著（軟木板這種花底）；deskDark＝桌面本身是深色，沒墊紙底時字用淺色
  const plate = plateIn < 0 && T.headerPlate ? 99 : plateIn;
  const plateLeft = plateIn < 0 && T.headerPlate ? 99 : plateLeftIn;
  const dark = plate >= 0 ? false : darkIn;
  // 紙底寬度跟著字數走（預設 4 字／5 字時就是原本的 290／258）
  const dn = [...ch.name].length - 4, dt = [...ch.tag].length - 5;
  const plates = [[-22, -14, 290 + dn * 42, -1.2], [L.W - 2 * L.X - 236 - dt * 28, -12, 258 + dt * 28, 1]] as const;
  return (
  <div style={{ position: "absolute", left: L.X, right: L.X, top: top ?? L.HEADER_TOP, height: L.HEADER_H, display: "flex", justifyContent: "space-between", alignItems: "center", fontFamily: FONT_ZH }}>
    {/* plate＝紙底已貼上幾幀（−1＝沒有）：兩張小白紙墊在字後面，4 幀壓下來 */}
    {plate >= 0 ? plates.map(([x, y, w, r], i) => { const p = tween(plate, i * 2, DUR.xs, EASE.enter), q = plateLeft <= 4 ? 1 - plateLeft / 4 : 0; return <div key={i} style={{ position: "absolute", left: x, top: y - Math.round(10 * (1 - p)), transform: `rotate(${r}deg) scale(${(1 + 0.06 * (1 - p)).toFixed(3)})`, clipPath: q > 0 ? `inset(-40px -40px -40px ${(100 * q).toFixed(0)}%)` : undefined }}><Paper asset="label-s" w={w} /></div>; }) : null}
    <div style={{ position: "relative", display: "flex", alignItems: "center", gap: 14, fontWeight: T.weight.zh, fontSize: 40, letterSpacing: "0.04em", color: dark ? T.onDark : T.ink }}>
      <Paper asset="dot" w={28} />{ch.name}
    </div>
    <div style={{ position: "relative", fontWeight: T.weight.body, fontSize: 26, letterSpacing: "0.08em", color: dark ? T.onDark2 : T.blue, border: `3px solid ${dark ? T.onDark2 : T.blue}`, borderRadius: 6, padding: "6px 20px" }}>{ch.tag}</div>
  </div>
  );
};

/**
 * 片尾卡：米白大紙蓋滿畫面（接在前一幕由下蓋上來的那張紙之後），三行字依序由遮罩下推上（隔 5 幀）。
 * props：slogan（預設「一支講透一件事」）、next（下一集預告，問句）、cloud（角落小紙雲，預設 true）。start＝本幕開始的絕對幀。
 */
export const EndCardV3: React.FC<{ start: number; slogan?: string; next?: string; cloud?: boolean }> = ({ start, slogan: sloganIn, next, cloud = true }) => {
  const f = useCurrentFrame();
  const T = useT(), ch = useChannel();
  const slogan = sloganIn ?? ch.slogan;
  // 頻道名字級：4 個字以內 150px，再長就縮到一行放得下
  const nameN = [...ch.name].length, nameSize = nameN <= 4 ? 150 : Math.floor(Math.min(150, (L.W - 2 * L.X - 98) / (nameN * 1.05)));
  const row = (i: number, child: React.ReactNode, h: number) => {
    const p = tween(f, start + (i === 2 ? 26 : i * 5), DUR.s, EASE.enter);   // 第三行（下一集預告）晚一拍才上來，片尾前 1 秒還有變化
    return <div style={{ height: h, overflow: "hidden", display: "flex", justifyContent: "center", alignItems: "center" }}><div style={{ transform: `translateY(${Math.round(h * (1 - p))}px)` }}>{child}</div></div>;
  };
  const cp = tween(Math.floor(f / 2) * 2, start + 12, DUR.s, EASE.enter);
  const drift = Math.round(-1.5 * Math.max(0, Math.floor((f - start - 20) / 2) * 2));   // 紙雲貼上後慢慢往左飄（每 2 幀 3px）、螢光筆底線慢慢畫完，片尾不是定格
  return (
    <div style={{ position: "absolute", inset: 0 }}>
      <div style={{ position: "absolute", left: -80, top: -120 }}><Paper asset="sheet-cream" /></div>
      <div style={{ position: "absolute", left: L.X, right: L.X, top: 640, fontFamily: FONT_ZH, color: T.ink, textAlign: "center" }}>
        {row(0, <div style={{ display: "flex", alignItems: "center", gap: 28, fontWeight: T.weight.zh, fontSize: nameSize, letterSpacing: "0.04em", lineHeight: 1.2 }}><Paper asset="dot" w={70} />{ch.name}</div>, 200)}
        {row(1, <div style={{ fontWeight: T.weight.zh, fontSize: 64, letterSpacing: "0.08em" }}><MarkerHighlight p={tween(f, start + 16, 44, Easing.linear)}>{slogan}</MarkerHighlight></div>, 120)}
        {next ? <div style={{ marginTop: 90 }}>{row(2, <div style={{ fontWeight: T.weight.zh, fontSize: 60, letterSpacing: "0.02em", color: T.blue, borderTop: `6px solid ${T.blue}`, borderBottom: `6px solid ${T.blue}`, padding: "26px 30px" }}>{next}</div>, 170)}</div> : null}
      </div>
      {cloud ? <div style={{ position: "absolute", left: 700, top: 410, transform: `translateX(${Math.round(500 * (1 - cp)) + drift}px) rotate(-4deg)` }}><Paper asset="cloud" w={300} /></div> : null}
    </div>
  );
};

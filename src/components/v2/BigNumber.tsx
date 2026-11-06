import React from "react";
import { useCurrentFrame } from "remotion";
import { FONT_EN, FONT_ZH, THEME_V2 as T, accentV2 } from "../../theme";
import { DUR, EASE, bump, countUp, tween } from "../anim";
import { cueAt, cueIn, useCue } from "../../cue";
import { CardV2, EN, IconV2, StatusTagV2, fmtNum, reveal } from "./base";

type Bar = { label: string; value: number; text: string; color?: string; at?: string };
type Props = {
  icon?: string; label: string; labelEn?: string; value: number; from?: number; decimals?: number; prefix?: string; suffix?: string;
  note?: string; color?: string; tag?: string;
  /** 數字開始遞增／落定的 cue；ref：數字上方的對照小標（例如「比特幣同日 約 −6%」）；bars：資料條 */
  startAt?: string; at?: string; noteAt?: string; ref?: { label: string; text: string; at?: string }; bars?: Bar[];
};

/** 大數字（v2）：from → value 遞增，落定在 at 的 cue（念到數字那一刻），落定後 bump 一次並保持不動 */
export const BigNumberV2: React.FC<Props> = ({ icon, label, labelEn, value, from = 0, decimals = 0, prefix = "", suffix = "", note, color, tag, startAt, at, noteAt, ref, bars }) => {
  const f = useCurrentFrame();
  const c = useCue();
  const a = accentV2(color);
  const land = cueAt(c, at, 50);
  let start = cueAt(c, startAt, Math.max(8, land - 30));
  if (land - start < 24) start = land - 30; // 遞增至少 1 秒，數字跑動本身就是資訊
  const numIn = Math.min(start - 4, land - 8);
  const v = from + (value - from) * countUp(f, start, land);
  const noteIn = cueIn(c, noteAt, land + 6);
  // 字級依顯示字數縮放：數字（含前後綴）寬度不超過卡片內寬約 840px（Inter 數字約 0.6em）
  const shownLen = fmtNum(value, decimals).length + (suffix.trim() && !/[^\x00-\x7f]/.test(suffix) ? 0.7 : 0);
  const numPx = Math.min(236, Math.floor(760 / (shownLen * 0.62)));
  const maxBar = Math.max(...(bars ?? []).map((b) => Math.abs(b.value)), 1);
  return (
    <CardV2 topBar={color} style={{ ...reveal(f, 0), width: 952, padding: "48px 56px 44px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
        {icon && <IconV2 name={icon} color={color === "pink" ? "yellow" : "pink"} size={120} draw={tween(f, 0, DUR.l, EASE.enter)} />}
        <div>
          <div style={{ fontFamily: FONT_ZH, fontSize: 54, fontWeight: T.weight.title, color: T.text, lineHeight: 1.2 }}>{label}</div>
          {labelEn && <div style={{ ...EN, marginTop: 4 }}>{labelEn}</div>}
        </div>
      </div>
      {ref && (
        <div style={{ ...reveal(f, cueIn(c, ref.at, 10), 1, 16), alignSelf: "flex-start", display: "inline-flex", alignItems: "baseline", gap: 16, padding: "10px 20px", borderRadius: T.radiusTag, background: T.track }}>
          <span style={{ fontFamily: FONT_ZH, fontSize: 38, fontWeight: 700, color: T.text2 }}>{ref.label}</span>
          <span style={{ fontFamily: FONT_EN, fontSize: 52, fontWeight: T.weight.num, color: T.text }}>{ref.text}</span>
        </div>
      )}
      <div style={{ ...reveal(f, numIn, 1, 16), fontFamily: FONT_EN, fontWeight: T.weight.num, fontSize: numPx, lineHeight: 1.0, letterSpacing: "-0.04em", color: a.text, margin: 0, fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" }}>
        <span style={{ display: "inline-block", transform: `scale(${bump(f, land, 0.05)})`, transformOrigin: "0% 70%" }}>
          {prefix && <span style={{ fontSize: Math.round(numPx * 0.4), fontFamily: FONT_ZH, fontWeight: 700, color: T.text2, marginRight: 10 }}>{prefix.trim()}</span>}
          {fmtNum(v, decimals)}
          {suffix && <span style={{ fontSize: Math.round(numPx * (suffix.trim().length > 1 || /[^\x00-\x7f]/.test(suffix) ? 0.4 : 0.6)), marginLeft: 8, fontFamily: /[^\x00-\x7f]/.test(suffix) ? FONT_ZH : FONT_EN }}>{suffix.trim()}</span>}
        </span>
      </div>
      {bars && (
        <div style={{ display: "flex", flexDirection: "column", gap: 26 }}>
          {bars.map((b, i) => {
            const bi = cueIn(c, b.at, 10 + i * 10);
            const bc = accentV2(b.color);
            const w = tween(f, bi, DUR.l, EASE.move) * (Math.abs(b.value) / maxBar);
            return (
              <div key={i} style={{ ...reveal(f, bi, 1, 12), display: "flex", alignItems: "center", gap: 20 }}>
                <span style={{ width: 140, fontFamily: FONT_ZH, fontSize: 38, fontWeight: 700, color: T.text2 }}>{b.label}</span>
                <div style={{ flex: 1, height: 48, borderRadius: 4, background: T.track, overflow: "hidden" }}>
                  <div style={{ width: `${w * 100}%`, height: "100%", background: bc.fill }} />
                </div>
                <span style={{ minWidth: 130, textAlign: "right", fontFamily: FONT_EN, fontSize: 48, whiteSpace: "nowrap", fontWeight: T.weight.num, color: bc.text }}>{b.text}</span>
              </div>
            );
          })}
        </div>
      )}
      {note && <div style={{ ...reveal(f, noteIn, 1, 12), fontFamily: FONT_ZH, fontSize: 38, lineHeight: 1.5, fontWeight: T.weight.body, color: T.text2 }}>{note}</div>}
      {tag && <div style={{ ...reveal(f, noteIn + 4, 1, 12) }}><StatusTagV2 status={tag} size={32} /></div>}
    </CardV2>
  );
};

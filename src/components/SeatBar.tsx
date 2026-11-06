import React from "react";
import { useCurrentFrame } from "remotion";
import { C, FONT_ZH, FONT_EN } from "../theme";
import { Card } from "./Card";
import { progress, riseFor, countUp } from "./anim";
import { useV2 } from "../style";
import { StatusTag } from "./BigNumber";

type Seg = { label: string; seats: number; color: "dem" | "rep" | "undecided" };
type Chamber = { name: string; nameEn?: string; total: number; majority: number; segments: Seg[]; status?: string; statusText?: string; note?: string };

const BAR_W = 872; // 卡片寬 952 − 左右 padding 40×2
/** 席次條：低飽和紅藍並列＋文字標示，含過半門檻線，數字遞增 */
export const SeatBar: React.FC<{ chambers: Chamber[] }> = ({ chambers }) => {
  const f = useCurrentFrame();
  const v2 = useV2();
  const R = riseFor(v2);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 34, width: 952 }}>
      {chambers.map((ch, ci) => {
        const d = ci * 22;
        const p = v2 ? countUp(f, d + 8, d + 48) : 1 - Math.pow(1 - progress(f, d + 8, 40), 3); // v2：只緩動一次
        let x = 0;
        return (
          <Card key={ci} color={C.purple} style={{ ...R(f, d), padding: "28px 40px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <span style={{ fontFamily: FONT_ZH, fontSize: 50, fontWeight: 900, color: C.white }}>{ch.name}</span>
                {ch.nameEn && <span style={{ fontFamily: FONT_EN, fontSize: 26, color: "rgba(255,255,255,0.65)", marginLeft: 14 }}>{ch.nameEn}</span>}
              </div>
              {ch.status && <StatusTag status={ch.status} text={ch.statusText} />}
            </div>
            <div style={{ position: "relative", width: BAR_W, height: 64, marginTop: 52, borderRadius: 12, background: "rgba(255,255,255,0.06)", overflow: "visible" }}>
              {ch.segments.map((s, i) => {
                const w = (s.seats / ch.total) * BAR_W;
                const left = x; x += w;
                return <div key={i} style={{ position: "absolute", left: v2 ? Math.round(left * p) : left * p, top: 0, height: 64, width: Math.max(0, v2 ? Math.round(w * p - 3) : w * p - 3), background: C[s.color], borderRadius: 10 }} />;
              })}
              <div style={{ position: "absolute", left: (ch.majority / ch.total) * BAR_W - 2, top: -16, height: 96, borderLeft: `4px dashed ${C.yellow}`, opacity: progress(f, d + 30, 10) }} />
              <div style={{ position: "absolute", left: (ch.majority / ch.total) * BAR_W - 120, width: 240, textAlign: "center", top: -50, fontFamily: FONT_ZH, fontSize: 26, color: C.yellow, opacity: progress(f, d + 30, 10) }}>
                過半門檻 {ch.majority}
              </div>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 18 }}>
              {ch.segments.map((s, i) => (
                <div key={i} style={{ fontFamily: FONT_ZH, fontSize: 32, color: "rgba(255,255,255,0.9)", textAlign: i === 0 ? "left" : i === ch.segments.length - 1 ? "right" : "center" }}>
                  <span style={{ display: "inline-block", width: 18, height: 18, borderRadius: 4, background: C[s.color], marginRight: 8 }} />
                  {s.label} <b style={{ fontFamily: FONT_EN, fontSize: 40, color: C.white }}>{Math.round(s.seats * p)}</b>
                </div>
              ))}
            </div>
            {ch.note && <div style={{ fontFamily: FONT_ZH, fontSize: 26, color: "rgba(255,255,255,0.6)", marginTop: 12 }}>{ch.note}</div>}
          </Card>
        );
      })}
    </div>
  );
};

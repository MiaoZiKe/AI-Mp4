import React from "react";
import { FONT_ZH, SAFE } from "../theme";
export const SourceFooter: React.FC<{ sources: string[]; asOf?: string }> = ({ sources, asOf }) =>
  sources.length ? (
    <div style={{ position: "absolute", left: SAFE.x, right: SAFE.x, bottom: SAFE.bottom, textAlign: "center", fontFamily: FONT_ZH, fontSize: 22, color: "rgba(255,255,255,0.5)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
      資料來源：{sources.join("、")}{asOf ? `｜截至 ${asOf}` : ""}
    </div>
  ) : null;

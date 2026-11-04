import React from "react";
import { CONTENT, FONT_MONO, SAFE } from "../theme";

/** 畫面底部資料來源小字（位於字幕底板上方） */
export const SourceFooter: React.FC<{ text: string }> = ({ text }) => (
  <div
    style={{
      position: "absolute", left: SAFE.left, right: SAFE.right, top: CONTENT.bottom - 6, height: 26,
      fontFamily: FONT_MONO, fontSize: 19, color: "rgba(255,255,255,0.55)", whiteSpace: "nowrap", overflow: "hidden",
      textOverflow: "ellipsis",
    }}
  >
    ▸ 來源 SRC: {text}
  </div>
);

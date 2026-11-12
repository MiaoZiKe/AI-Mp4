// v3 打樣用：沒有配音時，依字數估一份「時間軸 v2」格式的假時間軸（每秒 4.3 字、換幕 0.15 秒或 pauseAfter）。
// 只給 scripts/v3/proof.mjs 驗證畫面用；正式片一律用 npm run align 產生的 timeline.json（配音是時鐘）。
import { splitPhrases, SUB_MAX_EM_V2, clean } from "../validate.mjs";

const FPS = 30, TRANS = 10, MIN_SCENE_F = 45, TAIL_END_F = 18;
export function fakeTimeline(script, { cps = 4.3, gap = 0.15, endCardFrames = 75 } = {}) {
  const out = [];
  let voiceStart = 8;
  script.scenes.forEach((s, i) => {
    const isEnd = s.component === "EndCard";
    const spoken = isEnd ? "" : clean(s.narration);
    const vf = Math.round((spoken.length / cps) * FPS);
    const prev = out[i - 1];
    const startFrame = i === 0 ? 0 : Math.max(prev.startFrame + MIN_SCENE_F, voiceStart - TRANS, prev.voiceEndFrame - 2);
    const voiceEnd = voiceStart + vf;
    const pos = (text, occ = 1) => { const t = clean(text); let k = -1; for (let n = 0; n < occ; n++) k = spoken.indexOf(t, k + 1); return k < 0 ? null : voiceStart + Math.round((k / Math.max(1, spoken.length)) * vf); };
    const lines = [];
    if (!isEnd) {
      let used = 0;
      for (const l of splitPhrases(s.subtitle.zh, s.keywords ?? [], SUB_MAX_EM_V2)) {
        const n = clean(l).length;
        const t0 = voiceStart + Math.round((used / Math.max(1, spoken.length)) * vf);
        lines.push({ text: l, start: Math.max(startFrame, t0 - 3), chars: [...l].map((_, k) => t0 + Math.round((k / Math.max(1, l.length)) * (n / Math.max(1, spoken.length)) * vf)) });
        used += n;
      }
    }
    out.push({
      id: s.id, audio: null, audioFrame: voiceStart, audioSec: vf / FPS, startFrame, durationFrames: 0, transitionFrames: i === 0 ? 0 : TRANS, transition: null,
      voiceStartFrame: voiceStart, voiceEndFrame: voiceEnd, stillFrame: 0,
      subtitleWindow: isEnd ? null : [i === 0 ? 0 : lines[0]?.start ?? startFrame, 0], sourceWindow: [i === 0 ? 0 : startFrame + 5, 0],
      words: [], lines, keywords: (s.keywords ?? []).map((k) => ({ text: k, start: pos(k) })).filter((k) => k.start !== null),
      cues: (s.cues ?? []).map((c) => ({ id: c.id, text: c.text, frame: pos(c.text, c.occurrence ?? 1) })),
    });
    voiceStart = voiceEnd + Math.round((typeof s.pauseAfter === "number" ? s.pauseAfter : gap) * FPS) + (isEnd ? endCardFrames : 0);
  });
  out.forEach((x, i) => {
    const n = out[i + 1];
    const isEnd = script.scenes[i].component === "EndCard";
    x.durationFrames = n ? n.startFrame + n.transitionFrames - x.startFrame : isEnd ? endCardFrames : Math.max(MIN_SCENE_F, x.voiceEndFrame + TAIL_END_F - x.startFrame);
    x.stillFrame = n ? n.startFrame - 1 : x.startFrame + x.durationFrames - 12;
    if (x.subtitleWindow) x.subtitleWindow[1] = n ? (n.subtitleWindow ? n.subtitleWindow[0] : n.startFrame) : x.startFrame + x.durationFrames;
    x.sourceWindow[1] = n ? n.sourceWindow[0] : x.startFrame + x.durationFrames;
  });
  const last = out[out.length - 1];
  const totalFrames = last.startFrame + last.durationFrames;
  return { version: 2, fake: true, slug: script.slug, fps: FPS, totalFrames, totalSec: +(totalFrames / FPS).toFixed(2), gapSec: gap, transitionFrames: TRANS, scenes: out, voice: null };
}

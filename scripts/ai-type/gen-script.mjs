// 產生 videos/sample-ai-type/script.json：旁白、字幕、cue、配音設定原樣取自 sample-ai-ui，只換畫面（stage: "type"、每幕 props.items）。
import fs from "node:fs";
import path from "node:path";
const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "../..");
const src = JSON.parse(fs.readFileSync(path.join(ROOT, "videos/sample-ai-ui/script.json"), "utf8"));
const COLORS = ["hot", "blue", "green", "yellow"];
const SLOTS = src.scenes.find((s) => s.props?.slots).props.slots;
const EN = SLOTS.map((s) => String(s.en ?? "").toUpperCase());
const BAND_TOP = 320, BAND_H = 305;
const chipX = (k) => 64 + k * 244;

const items = {
  s1: { ground: "ink", items: [
    { t: "你問 AI，", y: 350, size: 128, until: "s2:start+4" },
    { t: "是不是都", y: 500, size: 128, until: "s2:start+5" },
    { t: "只打", y: 690, size: 236, mode: "ghost", until: "s2:start+6" },
    { t: "一句話？", y: 940, size: 236, mode: "ghost", color: "hot", until: "s2:start+7" },
    { t: "PROMPT", font: "en", size: 28, ls: "0.22em", color: "fg2", y: 1262, at: "one-8", mode: "rise", set: [{ at: "s2:start+6", y: 352 }] },
    { kind: "block", rect: [64, 1440, 952, 4], color: "fg3", at: "one-8", enter: "wipe-r", set: [{ at: "s2:start+6", rect: [64, 530, 952, 4] }] },
    { t: "幫我寫一篇貼文", y: 1312, size: 104, at: "one-3", caret: { color: "hot", until: "s2:start+2" }, set: [{ at: "s2:start+6", y: 402 }, { at: "s2:plain+8", color: "fg3" }], strike: { at: "s2:plain+2", color: "hot" } },
  ] },
  s2: { items: [
    { t: "難怪它回得", y: 740, size: 150 },
    { t: "很普通", y: 930, size: 310, color: "fg2" },
  ] },
  s3: { ground: "paper", enter: "wipe-up", enterAt: "voice-9", items: [
    { t: "Google 的", y: 345, size: 124, set: [{ at: "good-6", color: "fg3" }], until: "exit+0" },
    { t: "官方指南說，", y: 496, size: 150, set: [{ at: "good-6", color: "fg3" }], until: "exit+1" },
    { kind: "block", rect: [64, 708, 22, 22], color: "hot", at: "guide+8", enter: "pop", until: "exit+2" },
    { t: src.scenes[2].props.editor.guide.text + " — " + src.scenes[2].props.editor.guide.by, font: "en", weight: 600, size: 34, color: "fg2", x: 104, y: 700, at: "guide+8", mode: "rise", until: "exit+2" },
    { t: "好的提示詞", y: 830, size: 176, until: "exit+2" },
    { t: "有", y: 1232, size: 176, until: "exit+3" },
    { t: "四塊", x: 270, y: 1040, size: 372, color: "hot", until: "exit+4" },
    ...COLORS.map((c, k) => ({ kind: "block", layer: "top", rect: [64 + k * 242, 1456, 226, 56], color: c, at: `four+${1 + 2 * k}`, enter: "wipe-r",
      set: [{ at: `s4:c${k + 1}-5`, rect: [0, BAND_TOP + k * BAND_H, 1080, BAND_H], dur: 9 }, { at: `s5:start+${3 + k}`, rect: [chipX(k), 380, 220, 120], dur: 9 }] })),
  ] },
  s4: { items: SLOTS.flatMap((s, k) => {
    const y = BAND_TOP + k * BAND_H, on = `on:${COLORS[k]}`;
    return [
      { t: s.label, layer: "top", y: y + 46, size: 208, color: on, until: "s5:start+1", exit: "fade" },
      { t: EN[k], layer: "top", font: "en", size: 30, ls: "0.2em", color: on, x: 520, y: y + 72, at: `c${k + 1}+4`, mode: "rise", until: "s5:start+1", exit: "fade" },
      { t: s.text, layer: "top", weight: 700, size: 46, w: 496, color: on, x: 520, y: y + 124, at: `c${k + 1}+6`, mode: "rise", until: "s5:start+1", exit: "fade" },
    ];
  }) },
  s5: { ground: "ink", enter: "wipe-up", enterAt: "start+0", items: [
    ...SLOTS.map((s, k) => ({ t: s.label, layer: "top", x: chipX(k) + 50, y: 410, size: 60, color: `on:${COLORS[k]}`, at: `start+${13 + k}`, mode: "slam" })),
    { t: "四塊", layer: "top", ground: "ink", y: 620, size: 300, until: "same-6" },
    { t: "補上去，", y: 930, size: 200, until: "same-5" },
    { t: "同一個", y: 620, size: 250, until: "ans-6" },
    { t: "AI，", y: 880, size: 380, font: "en", until: "ans-5" },
    { t: "回答", y: 620, size: 230 },
    { t: "很普通", y: 880, size: 300, color: "fg3", at: "ans-2", mode: "rise", strike: { at: "ans+1", color: "hot" }, until: "close-7", exit: "drop" },
    { t: "更貼近", y: 880, size: 300, color: "hot", underline: { at: "close+12", color: "hot" } },
    { t: "你要的。", y: 1230, size: 200 },
  ] },
};
const out = { ...src, slug: "sample-ai-type", title: src.title.replace("（AI 教學風格試片）", "（AI 教學風格試片：動態大字）"), stage: "type",
  cover: { ...src.cover, chips: SLOTS.map((s, k) => ({ label: s.label, color: COLORS[k] })) },
  scenes: src.scenes.map((s) => ({ ...s, component: "TypeScene", props: items[s.id] })) };
fs.writeFileSync(path.join(ROOT, "videos/sample-ai-type/script.json"), JSON.stringify(out, null, 2) + "\n");
console.log("✔ videos/sample-ai-type/script.json");

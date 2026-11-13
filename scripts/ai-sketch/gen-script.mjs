// node scripts/ai-sketch/gen-script.mjs：從 videos/sample-ai-ui/script.json 產生 videos/sample-ai-sketch/script.json。
// 旁白、字幕、cue、配音設定原樣帶過來（同一段聲音、同樣的 cue），只換畫面（props）。要改畫面就改這裡再重跑。
// 座標是「板子上的座標」：每幕 origin 是這一區的左上角；鏡頭 camera.to＝[左上角 x, y, 縮放]，主畫面是 952×920。
import fs from "node:fs";
import path from "node:path";
const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "../..");
const src = JSON.parse(fs.readFileSync(path.join(ROOT, "videos/sample-ai-ui/script.json"), "utf8"));
const slots = src.scenes.find((s) => s.id === "s4").props.slots;
const s5 = src.scenes.find((s) => s.id === "s5").props;
const A = [-1400, 0]; // 第一區：只打一句話 → 回得很普通
const ROW_Y = (i) => 250 + i * 168;

const props = {
  s1: {
    origin: A, camera: { to: [A[0], 0, 1] },
    hook: { title: src.scenes[0].props.hook.title },
    items: [
      { type: "hatch", box: [300, 100, 462, 132], color: "yellow", gap: 40, at: "line-3" },
      { type: "text", t: `${src.scenes[0].props.hook.kicker}，是不是都`, x: 14, y: 8, size: 58, color: "ink2", at: "start-60", hook: true },
      { type: "text", t: src.scenes[0].props.hook.title, x: 10, y: 86, size: 150, color: "ink", at: "start-60", hook: true },
      { type: "rect", box: [50, 320, 850, 160], color: "ink", w: "bold", at: "start-60" },
      { type: "send", box: [806, 366, 64, 66], color: "ink2", at: "start-60" },
      { type: "text", t: src.scenes[0].props.draft.text, x: 86, y: 356, size: 88, color: "blue", at: "ask", end: "one" },
      { type: "ellipse", box: [475, 400, 470, 124], color: "red", w: "bold", at: "line+5", dur: 12 },
    ],
  },
  s2: {
    origin: A,
    items: [
      { type: "arrow", pts: [[150, 500], [138, 548], [152, 596]], color: "ink", at: "start-3" },
      { type: "robot", box: [40, 606, 230, 286], mood: "flat", color: "ink", w: "bold", at: "start+2", dur: 14 },
      { type: "bubble", box: [336, 622, 580, 168], color: "ink", at: "back-8", dur: 9 },
      { type: "squiggle", box: [376, 668, 500, 0], color: "ink3", at: "back+0", dur: 5 },
      { type: "squiggle", box: [376, 708, 440, 0], color: "ink3", at: "back+3", dur: 5 },
      { type: "squiggle", box: [376, 748, 300, 0], color: "ink3", at: "back+6", dur: 4 },
      { type: "cross", box: [470, 640, 320, 132], color: "red", w: "bold", at: "plain-1", dur: 7 },
      { type: "text", t: "很普通", x: 452, y: 800, size: 112, color: "red", rot: -3, at: "plain+2", per: 2 },
    ],
  },
  s3: {
    origin: [0, 0], camera: { to: [0, 0, 1], at: "start+3", dur: 13 },
    items: [
      { type: "book", box: [8, 6, 118, 92], color: "ink", at: "start+13", dur: 9 },
      { type: "text", t: "官方指南", x: 150, y: 16, size: 66, color: "ink", at: "guide-2", per: 2 },
      { type: "underline", box: [150, 92, 262, 0], color: "blue", at: "guide+7", dur: 5 },
      { type: "text", t: "Prompting guide 101", x: 444, y: 22, size: 54, font: "en", color: "ink2", at: "guide+10", per: 1 },
      { type: "text", t: "好的提示詞有", x: 10, y: 122, size: 84, color: "ink", at: "good", per: 2 },
      { type: "text", t: "四塊", x: 544, y: 104, size: 108, color: "red", at: "four-2", per: 3 },
      { type: "ellipse", box: [652, 160, 134, 76], color: "red", w: "bold", at: "four+5", dur: 9 },
      ...slots.map((sl, i) => ({ type: "rect", box: [4, ROW_Y(i), 944, 156], color: sl.color, at: `good+${10 + i * 6}`, dur: 12 })),
    ],
  },
  s4: {
    origin: [0, 0], kwColors: slots.map((sl) => sl.color),
    items: slots.flatMap((sl, i) => [
      { type: "hatch", box: [22, ROW_Y(i) + 18, 200, 120], color: sl.color, at: `${sl.at}-3`, dur: 7 },
      { type: "text", t: sl.label, x: 38, y: ROW_Y(i) + 14, size: 84, color: sl.color, at: sl.at, per: 3 },
      { type: "text", t: sl.en, x: 46, y: ROW_Y(i) + 100, size: 44, font: "en", color: "ink2", at: `${sl.at}+6`, per: 1 },
      { type: "text", t: sl.text, x: 262, y: ROW_Y(i) + 52, size: 52, color: "ink", at: `${sl.at}+5`, per: 1.4 },
    ]),
  },
  s5: {
    origin: [0, 0], camera: { to: [0, 0, 0.6], at: "fill-14", dur: 16 },
    items: [
      { type: "brace", box: [985, 252, 70, 656], color: "ink", w: "bold", at: "fill-1", dur: 9 },
      { type: "arrow", pts: [[1075, 580], [1135, 574], [1196, 580]], color: "ink", w: "bold", head: 44, at: "fill+9", dur: 6 },
      { type: "robot", box: [1218, 372, 330, 410], mood: "smile", color: "ink", w: "bold", at: "same-8", dur: 14 },
      { type: "text", t: `${s5.run.node.sub} ${s5.run.node.text}`, x: 1206, y: 262, size: 84, color: "blue", at: "same-1", per: 2 },
      { type: "arrow", pts: [[1384, 800], [1378, 880], [1330, 966]], color: "ink", w: "bold", head: 44, at: "ans-10", dur: 6 },
      { type: "rect", box: [20, 990, 1540, 512], color: "ink", w: "bold", at: "ans-5", dur: 12 },
      { type: "text", t: s5.result.title, x: 66, y: 1030, size: 100, color: "ink", at: "ans+3", per: 1.1 },
      { type: "underline", box: [66, 1142, 1196, 0], color: "blue", w: "bold", at: "ans+17", dur: 6 },
      { type: "text", t: s5.result.lines[0].t, x: 66, y: 1190, size: 76, color: "ink2", at: "ans+18", per: 1 },
      { type: "text", t: s5.result.lines[2].t, x: 66, y: 1300, size: 76, color: "ink2", at: "ans+28", per: 1 },
      { type: "check", box: [1150, 1176, 210, 160], color: "green", w: 16, at: "close-1", dur: 7 },
      { type: "spark", box: [1400, 1200, 70, 0], angles: [-60, -20, 20], color: "green", w: "bold", at: "close+6", dur: 5 },
      { type: "hatch", box: [958, 1378, 572, 96], color: "green", gap: 44, at: "close+2", dur: 8 },
      { type: "text", t: s5.result.badge.text, x: 968, y: 1380, size: 92, color: "green", at: "close+4", per: 2 },
    ],
  },
};

const out = {
  ...src,
  slug: "sample-ai-sketch",
  title: src.title.replace("（AI 教學風格試片）", "（AI 教學風格試片：白板手繪）"),
  stage: "sketch",
  cover: { ...src.cover, chips: slots.map((sl) => ({ label: sl.label, color: sl.color })) },
  scenes: src.scenes.map((s) => ({ ...s, component: "SketchScene", props: props[s.id] })),
};
fs.writeFileSync(path.join(ROOT, "videos/sample-ai-sketch/script.json"), JSON.stringify(out, null, 2) + "\n");
console.log(`✔ videos/sample-ai-sketch/script.json（${out.scenes.length} 幕）`);

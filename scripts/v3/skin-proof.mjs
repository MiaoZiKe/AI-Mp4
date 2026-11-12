// node scripts/v3/skin-proof.mjs <skin|all> [--no-paper]
// v3 外觀打樣：同一份 2 幕＋片尾卡的小腳本，換 skin 與 channel 各渲一輪（假時間軸，不需要配音），確認每套外觀的
// 桌面、頁首、字幕紙條、出處紙條、封面、片尾卡，以及通用紙片（撕邊標題條、拍立得、便條、大數字、堆疊方塊、長條、折線、箭頭、虛線）。
// 輸出：out/skin-proof/<skin>/{s01,s02,end,cover}.png＋sheet.png；範例腳本寫到 docs/style-v3/skin-proof-script.json（新片可以照抄寫法）。
// 紙材放 public/v3/_skin-<skin>/（照片借用 out/what-is-server/assets-raw/photos/aisle.jpg）。
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { renderStill, selectComposition } from "@remotion/renderer";
import { ROOT, BROWSER, makeBundle, chromiumOptions } from "../lib.mjs";
import { fakeTimeline } from "./fake-timeline.mjs";
import { validate } from "../validate.mjs";

await import("../fetch-fonts.mjs");
const SKINS = Object.keys(JSON.parse(fs.readFileSync(path.join(ROOT, "src", "theme-v3-skins.json"), "utf8")));
const want = process.argv[2] === "all" || !process.argv[2] ? SKINS : process.argv[2].split(",");
const CHANNEL = {
  desk: undefined,   // 預設：白話國際／國際白話講／一支講透一件事
  blueprint: { name: "白話科技", tag: "科技白話講" },
  newsprint: { name: "白話股市", tag: "股市白話講" },
  notebook: { name: "白話感情", tag: "感情白話講", slogan: "一支看懂一個現象" },
  sticky: { name: "白話 AI 實驗室", tag: "AI 動手做", slogan: "一支學會一件事" },
};
const title = { type: "strip", layer: "screen", paper: "strip-hook", x: 540, y: 560, w: 880, rot: -1.4, align: "left", pad: [70, 26],
  lines: [{ t: "紙片打樣", size: 132, lh: 1.08 }, { t: "共 {5} 套外觀", size: 120, accentSize: 160, lh: 1.1 }, { t: "同一套[引擎]與版面", size: 54, color: "ink3", lh: 1.3, mt: 10 }],
  tape: [{ asset: "tape-y", x: 150, y: 8, rot: -5 }, { asset: "tape-m", x: 790, y: 0, rot: 4 }] };
const polaroid = { type: "strip", paper: "polaroid-aisle", caption: true, x: 310, y: 1035, w: 420, rot: -4, lines: [{ t: "實拍照片", size: 46 }], tape: [{ asset: "tape-r", x: 250, y: 4, rot: 3, w: 170 }] };
const note = { type: "strip", paper: "note-yellow", x: 800, y: 1040, w: 360, rot: 3, lines: [{ t: "便條", size: 92 }, { t: "寫[重點]", size: 72 }] };
const make = (skin) => ({
  slug: `_skin-${skin}`, title: `v3 外觀打樣：${skin}`, asOf: "2026/11/13", styleVersion: 3, skin, ...(CHANNEL[skin] ? { channel: CHANNEL[skin] } : {}),
  voice: { voiceName: "Iapetus", mode: "take" },
  cover: { camera: { to: [540, 960, 1] }, items: [{ ...title, y: 700 }, { ...polaroid, y: 1180 }, { ...note, y: 1190 }] },
  scenes: [
    { id: "s01", beat: "hook", narration: "同一套引擎，換一張桌面，就是另一個頻道。", subtitle: { zh: "同一套引擎\n換一張桌面\n就是另一個頻道", en: "Same engine, | a different desk, | a different channel." }, keywords: ["另一個頻道"],
      cues: [{ id: "desk", text: "桌面" }, { id: "ch", text: "頻道" }], component: "PaperScene",
      props: { camera: { to: [540, 960, 1] }, items: [
        { ...title, id: "title", state: { mark: 0 }, set: [{ at: "ch", mark: 1 }], to: "top" },
        { ...polaroid, id: "pol", at: "desk", from: "left", until: "s02" },
        { ...note, id: "note", at: "ch", from: "slam", until: "s02" },
      ] }, sources: ["來源：打樣用，不是正式內容"] },
    { id: "s02", beat: "mechanism", narration: "方塊可以一層一層疊，數字、長條、折線，也都是紙拼的。", subtitle: { zh: "方塊可以\n一層一層疊\n數字、長條、折線\n也都是紙拼的", en: "Blocks stack layer by layer; | numbers, bars and lines | are all cut from paper." }, keywords: ["一層一層疊", "紙拼的"],
      cues: [{ id: "stack", text: "一層一層" }, { id: "num", text: "數字" }, { id: "bar", text: "長條" }, { id: "line", text: "折線" }], component: "PaperScene",
      props: { camera: { to: [1740, 960, 1], dur: 12 }, items: [
        { type: "path", pts: [[1010, 1180], [1130, 1230], [1250, 1200]], head: true, state: { grow: 0 }, set: [{ at: "start", grow: 1 }] },
        { id: "stack", type: "stack", x: 1470, y: 560, at: "stack", state: { n: 1 }, set: [{ at: "stack+8", n: 2 }, { at: "stack+16", n: 3 }],
          layers: [{ asset: "block-kraft", w: 470, t: "基板" }, { asset: "block-mint", w: 400, t: "中介層" }, { row: [{ asset: "block-blue", w: 190, t: "晶片", onDark: true }, { asset: "block-red", w: 190, t: "記憶體", onDark: true }] }] },
        { id: "arrow", asset: "arrow-yellow", x: 1745, y: 560, w: 120, at: "num-4", from: "left" },
        { id: "num", type: "num", x: 2010, y: 560, w: 390, at: "num", from: "slam", value: 62.5, decimals: 1, unit: "%", head: "大數字", lines: [{ t: "會跳的", size: 44, color: "ink2" }], tape: [{ asset: "tape-m", x: 320, y: 4, rot: 5, w: 160 }] },
        { id: "bars", type: "bars", x: 1470, y: 1030, w: 460, h: 420, at: "bar", state: { grow: 0 }, set: [{ at: "bar", grow: 1 }], bars: [{ v: 12, label: "甲", color: "blue" }, { v: 20, label: "乙", color: "mint" }, { v: 31, label: "丙", color: "red" }] },
        { id: "line", type: "line", x: 2000, y: 1040, w: 440, h: 400, at: "line", vals: [15, 13.5, 14, 12, 9], labels: ["2015", "", "", "", "2025"], marks: [{ i: 0, t: "15" }, { i: 4, t: "9", color: "red" }] },
      ] }, sources: ["來源：打樣用，不是正式內容"] },
    { id: "s03", beat: "end", narration: "", subtitle: { zh: "", en: "" }, keywords: [], cues: [], durationSec: 2.5, silent: true, component: "EndCard", props: { next: "下一集：正式開工" }, sources: [] },
  ],
});
fs.writeFileSync(path.join(ROOT, "docs", "style-v3", "skin-proof-script.json"), JSON.stringify(make("blueprint"), null, 1) + "\n");

// 紙材要在打包之前做好：makeBundle 會把 public/ 整個複製進去，之後才產生的圖讀不到
if (!process.argv.includes("--no-paper")) for (const skin of want) execFileSync("python3", [path.join(ROOT, "scripts", "make-paper.py"), `_skin-${skin}`, `--skin=${skin}`, `--photos=${path.join(ROOT, "out", "what-is-server", "assets-raw", "photos")}`], { stdio: "inherit" });
const serveUrl = await makeBundle();
for (const skin of want) {
  const script = make(skin), slug = script.slug;
  const v = validate(script);
  v.warns.forEach((w) => console.log(`⚠ ${skin} ${w}`));
  const errs = v.errors.filter((e) => !/總長估算/.test(e));   // 打樣只有 2 幕，片長規則不適用
  if (errs.length) { errs.forEach((e) => console.error(`✖ ${skin} ${e}`)); process.exit(1); }
  script.v3 = { assets: JSON.parse(fs.readFileSync(path.join(ROOT, "public", "v3", slug, "meta.json"), "utf8")) };
  script.timeline = fakeTimeline(script);
  const out = path.join(ROOT, "out", "skin-proof", skin);
  fs.mkdirSync(out, { recursive: true });
  const opts = { serveUrl, inputProps: script, browserExecutable: BROWSER, chromiumOptions, logLevel: "warn" };
  const comp = await selectComposition({ ...opts, id: "Video" }), cover = await selectComposition({ ...opts, id: "Cover" });
  const tl = script.timeline;
  const shots = [["s01", tl.scenes[1].startFrame - 1], ["s02", tl.scenes[2].startFrame - 1], ["end", tl.totalFrames - 2]];
  for (const [name, frame] of shots) await renderStill({ ...opts, composition: comp, frame, output: path.join(out, `${name}.png`) });
  await renderStill({ ...opts, composition: cover, frame: 0, output: path.join(out, "cover.png") });
  const sheet = path.join(out, "sheet.png");
  execFileSync("ffmpeg", ["-y", "-loglevel", "error", ...["s01", "s02", "end", "cover"].flatMap((n) => ["-i", path.join(out, `${n}.png`)]), "-filter_complex", "[0][1][2][3]hstack=inputs=4,scale=2160:-1", "-frames:v", "1", sheet]);
  console.log(`✔ ${path.relative(ROOT, sheet)}（${skin}：s01／s02／片尾卡／封面）`);
}

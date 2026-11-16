// node videos/tech-yield/gen-script.mjs → 寫 videos/tech-yield/script.json 與 model.json。
// 畫面全部在 2D 圖層 art: "yield"（src/components/three/HudYield.tsx，2.5D 等角投影，程式算物理）；這支片不掛 3D 畫布。
// 每一幕的 cue 都自動放進 hud.levels[0].cues（「幕_cue」→ 絕對幀），畫面時間全部跟著配音走。念稿＝docs/prompts/tech-yield-旁白.txt（不改）。
import fs from "node:fs";
const R = new URL(".", import.meta.url).pathname;
const S = (id, para, narration, zh, en, keywords, cues, sources, props = {}) => ({ id, beat: "mechanism", para, narration, tts: narration, subtitle: { zh, en }, keywords, cues: cues.map(([id, text]) => ({ id, text })), component: "ThreeScene", props, sources });
const scenes = [
  S("s1", 1, "現在的 AI 晶片，為什麼這麼貴？一個原因是做壞的太多。", "現在的 AI 晶片\n為什麼這麼貴？\n一個原因是做壞的太多", "Why are AI chips so expensive? | One reason: too many come out bad.", ["做壞的"], [["ai", "晶片為什麼"], ["bad", "做壞的"]],
    ["估算：D0 0.1／cm²、泊松模型、300 mm 晶圓"],
    { hook: { kicker: "AI 晶片為什麼貴", title: "9成／不到一半", size: 120, top: 236 }, zoom: [{ to: "yield", at: "s2:exit-8", dur: 1 }] }),
  S("s2", 1, "同樣的工廠，小晶片九成能用，大晶片可能不到一半。", "同樣的工廠\n小晶片九成能用\n大晶片可能不到一半", "Same fab: about 90% of small chips work, | big chips maybe under half.", ["九成", "不到一半"], [["fab", "同樣的工廠"], ["hook", "九成"], ["half", "不到一半"]],
    ["估算：D0 0.1／cm²、泊松模型、300 mm 晶圓"]),
  S("s3", 2, "差在哪？晶片是在一片圓形的矽板上做的，這片叫晶圓，做完再切成一顆一顆。", "差在哪？\n晶片是在一片\n圓形的矽板上做的\n這片叫晶圓\n做完再切成一顆一顆", "What's the difference? | Chips are made on a round silicon disc — a wafer — | then cut into individual chips.", ["晶圓", "一顆一顆"], [["where", "差在哪"], ["disk", "矽板"], ["wafer", "叫晶圓"], ["cut", "切成"], ["each", "一顆一顆"]],
    ["300 mm 晶圓；切割道與晶片格為示意"]),
  S("s4", 3, "晶圓表面難免留下看不見的缺陷，可能是一顆微粒，也可能是一段沒做好的線路。", "晶圓表面難免留下\n看不見的缺陷\n可能是一顆微粒\n也可能是\n一段沒做好的線路", "Every wafer ends up with defects you can't see: | a particle, | or a bit of wiring that didn't come out right.", ["看不見的缺陷", "微粒"], [["invisible", "看不見"], ["particle", "微粒"], ["line", "沒做好"]],
    ["WikiChip〈Yield〉：隨機缺陷是良率損失主因之一"]),
  S("s5", 4, "缺陷落在哪一顆，那一顆就可能報廢。", "缺陷落在哪一顆\n那一顆就可能報廢", "Wherever a defect lands, | that chip may be scrapped.", ["報廢"], [["fall", "落在"], ["scrap", "報廢"]], ["缺陷位置為固定亂數示意；格數為 300 mm 晶圓實排"]),
  S("s6", 4, "能用的比例，就叫良率。", "能用的比例\n就叫良率", "The share that works | is called the yield.", ["良率"], [["ratio", "比例"], ["yield", "良率"]], ["WikiChip〈Yield〉（定義）"]),
  S("s7", 5, "關鍵是，缺陷是隨機落下的。晶片越大，被打中的機會就越高。", "關鍵是\n缺陷是隨機落下的\n晶片越大\n被打中的機會就越高", "The key: defects land at random. | The bigger the chip, | the more likely it gets hit.", ["隨機", "越大"], [["key", "關鍵"], ["random", "隨機"], ["big", "越大"], ["hit", "被打中"]], ["同一組缺陷；格數為 300 mm 晶圓實排"]),
  S("s8", 6, "用廠商公布過的缺陷數字估算，晶片面積大八倍，能用的就從九成，掉到可能不到一半。", "用廠商公布過的\n缺陷數字估算\n晶片面積大八倍\n能用的就從九成\n掉到可能不到一半", "Using a defect rate a chipmaker disclosed: | a chip with 8× the area | drops from 90% usable to maybe under half.", ["面積大八倍", "不到一半"], [["vendor", "廠商公布"], ["eight", "大八倍"], ["from", "從九成"], ["drop", "不到一半"]], ["D0≈0.1／cm²：台積電 2020（AnandTech）；泊松估算"]),
  S("s9", 7, "這是簡化的估算。各家實際的良率，廠商都沒有公布。", "這是簡化的估算\n各家實際的良率\n廠商都沒有公布", "This is a simplified estimate. | Actual yields? | No chipmaker has published them.", ["簡化的估算", "沒有公布"], [["simple", "簡化"], ["each2", "各家"], ["unpub", "沒有公布"]], ["查不到公布（截至 2026/11/17）；曲線為估算"]),
  S("s10", 8, "那大晶片怎麼辦？硬做一整顆，還是拆小再拼回去？", "那大晶片怎麼辦？\n硬做一整顆\n還是拆小再拼回去？", "So what about big chips? | Build one in a single piece, | or split it and put it back together?", ["一整顆", "拆小再拼"], [["how", "怎麼辦"], ["whole", "一整顆"], ["split", "拆小"]], ["二選一提問；拆開與拼回為外形示意"]),
  S("s11", 8, "下一支，來看先進封裝。想要完整解說，留言良率。", "下一支，來看先進封裝\n想要完整解說，留言良率", "Next up: advanced packaging. | Comment \"良率\" for the full notes.", ["先進封裝", "良率"], [["next", "下一支"], ["pkg", "先進封裝"], ["cm", "留言"]], ["下一集：先進封裝（已排定）"]),
  { id: "s12", beat: "end", silent: true, durationSec: 3.2, subtitle: { zh: "", en: "" }, keywords: [], cues: [], component: "ThreeScene",
    props: { endCard: { next: "先進封裝", trail: ["缺陷", "晶片大小", "良率", "拆小"], at: "s11:cm-8", comment: "良率", logoAnim: "transparent" } }, sources: [] },
];
scenes[0].beat = "hook"; scenes[9].beat = "cta"; scenes[10].beat = "cta";
// 畫面用的 cue：每幕的 start／end／exit 與每個 cue
const cues = {};
for (const s of scenes) { if (s.silent) continue; for (const k of ["start", "end", "exit"]) cues[`${s.id}_${k}`] = `${s.id}:${k}`; for (const c of s.cues) cues[`${s.id}_${c.id}`] = `${s.id}:${c.id}`; }
const script = {
  slug: "tech-yield", title: "晶圓良率：大晶片為什麼比較吃虧（科技透明圈 第 4 支）", asOf: "2026/11/17", styleVersion: 3, stage: "three",
  channel: { name: "科技透明圈", tag: "放大來看", slogan: "一支講透一件事" }, hudSkin: "light",
  voice: { voiceName: "Iapetus", model: "gemini-2.5-flash-preview-tts", mode: "take", languageCode: "cmn-TW", profile: "tech-b", _說明: "念稿定版：docs/prompts/tech-yield-旁白.txt；API 整篇 1 次請求" },
  hud: {
    levels: [{ id: "yield", label: "晶圓良率", en: "WAFER YIELD", field: "40 cm", ruler: "10 cm", art: "yield", readout: false, note: "查證截至 2026/11/17", noteAlways: true, noteAlways: true, cues }],
    theme: "dark", schematic: { text: "Schematic – not to scale", lift: 20, zh: "示意圖，非實際比例・格線與切割道為示意" }, maxLabels: 4, smallPx: 30, layout: "fill", scanBand: 0.3,
  },
  cover: { title: ["同一片晶圓", "大晶片吃虧"], sub: "晶圓良率", frame: 40 },
  sample: false, scenes,
};
fs.writeFileSync(R + "script.json", JSON.stringify(script, null, 2) + "\n");
// 這支片不掛 3D（畫面全在 HudYield.tsx）；model.json 只放引擎需要的最小結構
const model = { name: "tech-yield：畫面全部在 2D 圖層 art: yield（HudYield.tsx），這份只給引擎最小結構；由 gen-script.mjs 產生", unit: "cm", size: { w: 30, h: 30, r: 1, t: 0.6 },
  palette: { wafer: "#C9D6EA" }, materials: { m: { kind: "std", color: "wafer", rough: 0.5, metal: 0.2 } },
  layers: [{ id: "w", z: 0, k: 0 }], parts: [{ id: "dummy", layer: "w", shape: "box", size: [0.01, 0.01, 0.01], mat: "m" }], anchors: { c: { layer: "w", p: [0, 0, 0], dx: 0, dy: 0 } } };
fs.writeFileSync(R + "model.json", JSON.stringify(model, null, 1) + "\n");
const tts = scenes.filter((s) => !s.silent).reduce((a, s) => { (a[s.para] ??= []).push(s.tts); return a; }, {});
console.log("ok", scenes.length, Object.values(tts).map((x) => x.join("")).join("\n"));

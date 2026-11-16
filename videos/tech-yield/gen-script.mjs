// node videos/tech-yield/gen-script.mjs → 寫 videos/tech-yield/script.json 與 model.json。
// 畫面全部在 2D 圖層 art: "yield"（src/components/three/HudYield.tsx，2.5D 等角投影，程式算物理）；這支片不掛 3D 畫布。
// 每一幕的 cue 都自動放進 hud.levels[0].cues（「幕_cue」→ 絕對幀），畫面時間全部跟著配音走。念稿＝docs/prompts/tech-yield-旁白.txt（不改）。
import fs from "node:fs";
const R = new URL(".", import.meta.url).pathname;
const S = (id, para, narration, zh, en, keywords, cues, sources, props = {}) => ({ id, beat: "mechanism", para, narration, tts: narration, subtitle: { zh, en }, keywords, cues: cues.map(([id, text]) => ({ id, text })), component: "ThreeScene", props, sources });
const scenes = [
  S("s1", 1, "同一片晶圓，同樣的缺陷，小晶片九成能用，大晶片可能不到一半。", "同一片晶圓，同樣的缺陷\n小晶片九成能用\n大晶片可能不到一半", "Same wafer, same defects: | about 90% of small chips work, | big chips maybe under half.", ["九成", "不到一半"], [["same", "同樣的缺陷"], ["hook", "九成"], ["half", "不到一半"]],
    ["估算：D0 0.1／cm²、泊松模型、300 mm 晶圓"],
    { hook: { kicker: "同一片晶圓", title: "9成／不到一半", size: 120, top: 236 }, zoom: [{ to: "yield", at: "exit-8", dur: 1 }] }),
  S("s2", 2, "印完的晶圓，表面總會留下看不見的缺陷。", "印完的晶圓\n表面總會留下看不見的缺陷", "Every printed wafer is left with | defects you can't see.", ["看不見的缺陷"], [["printed", "印完"], ["invisible", "看不見"]], ["WikiChip〈Yield〉：隨機缺陷是良率損失主因之一"]),
  S("s3", 2, "可能是一顆微粒，也可能是一段沒印好的線。", "可能是一顆微粒\n也可能是一段沒印好的線", "It might be a particle, | or a line that didn't print right.", ["微粒", "沒印好的線"], [["particle", "微粒"], ["line", "沒印好"]], ["WikiChip〈Yield〉；放大示意，非實際比例"]),
  S("s4", 3, "缺陷落在哪一顆，那一顆就可能報廢。", "缺陷落在哪一顆\n那一顆就可能報廢", "Wherever a defect lands, | that chip may be scrapped.", ["報廢"], [["fall", "落在"], ["scrap", "報廢"]], ["缺陷位置為固定亂數示意；格數為 300 mm 晶圓實排"]),
  S("s5", 3, "能用的比例，就叫良率。", "能用的比例\n就叫良率", "The share that works | is called the yield.", ["良率"], [["ratio", "比例"], ["yield", "良率"]], ["WikiChip〈Yield〉（定義）"]),
  S("s6", 4, "切開之前，探針卡會把每一顆都通電測過。", "切開之前\n探針卡會把每一顆\n都通電測過", "Before dicing, a probe card | powers up and tests | every single chip.", ["探針卡", "通電測過"], [["cut", "切開"], ["probecard", "探針卡"], ["each", "每一顆"], ["test", "通電"]], ["晶圓測試流程：AnySilicon、NextPCB"]),
  S("s7", 4, "好的、壞的，全部記在一張晶圓地圖上。", "好的、壞的\n全部記在一張晶圓地圖上", "Good or bad, | it all goes onto a wafer map.", ["晶圓地圖"], [["good", "好的"], ["bad", "壞的"], ["map", "晶圓地圖"]], ["AnySilicon〈wafer sort〉；美國專利 5838951"]),
  S("s8", 5, "廠商公布過，五奈米量產初期，每平方公分大約零點一個缺陷。", "廠商公布過\n5 奈米量產初期\n每平方公分大約 0.1 個缺陷", "A chipmaker disclosed that early 5 nm | had about 0.1 defects | per square centimeter.", ["廠商公布", "0.1 個"], [["vendor", "廠商公布"], ["n5", "量產初期"], ["cm2", "每平方公分"], ["d0", "大約"]], ["台積電 2020 技術論壇（AnandTech 報導）"]),
  S("s9", 6, "缺陷一樣密，晶片大八倍，被打中的機會也大很多。", "缺陷一樣密\n晶片大八倍\n被打中的機會也大很多", "Same defect density, | a chip 8× bigger | is far more likely to be hit.", ["大八倍", "大很多"], [["dense", "一樣密"], ["eight", "大八倍"], ["hit", "被打中"]], ["面積：100 mm² 與 800 mm²（25 × 32 mm）"]),
  S("s10", 6, "估算下來，小晶片好的有五百多顆，大晶片只剩二十幾顆。", "估算下來\n小晶片好的有五百多顆\n大晶片只剩二十幾顆", "By estimate: 500-plus good small chips, | but only 20-some big ones.", ["五百多顆", "二十幾顆"], [["est", "估算"], ["s500", "五百多"], ["l20", "二十幾"]], ["估算：泊松模型 Y＝e^(−A·D0)；格數為實排結果"]),
  S("s11", 7, "有些壞的還救得回來。記憶體會多做幾排備用，壞掉那排直接換掉。", "有些壞的還救得回來\n記憶體會多做幾排備用\n壞掉那排直接換掉", "Some bad chips can be saved: | memory has spare rows, | and a broken row gets swapped out.", ["救得回來", "備用"], [["rescue", "救得回來"], ["mem", "記憶體"], ["spare", "備用"], ["broke", "壞掉那排"], ["swap", "換掉"]], ["備用列修補：IEEE TechNav、美國專利 4658379；運作為示意"]),
  S("s12", 8, "各家現在的良率，廠商都沒有公布，只能從估算看方向。", "各家現在的良率\n廠商都沒有公布\n只能從估算看方向", "Today's yields? | No maker has published them — | estimates only show the direction.", ["沒有公布", "估算"], [["now", "現在的良率"], ["unpub", "沒有公布"], ["estimate", "估算"]], ["查不到公布（截至 2026/11/17）；曲線為估算"]),
  S("s13", 9, "大晶片要硬做一整顆，還是拆小再拼回去？", "大晶片要硬做一整顆\n還是拆小再拼回去？", "Build a big chip in one piece, | or split it and put it back together?", ["一整顆", "拆小再拼"], [["whole", "一整顆"], ["split", "拆小"]], ["二選一提問；拆開與拼回為外形示意"]),
  S("s14", 9, "下一支，來看先進封裝。想要完整解說，留言良率。", "下一支，來看先進封裝\n想要完整解說，留言良率", "Next up: advanced packaging. | Comment \"良率\" for the full notes.", ["先進封裝", "良率"], [["next", "下一支"], ["pkg", "先進封裝"], ["cm", "留言"]], ["下一集：先進封裝（已排定）"]),
  { id: "s15", beat: "end", silent: true, durationSec: 3.2, subtitle: { zh: "", en: "" }, keywords: [], cues: [], component: "ThreeScene",
    props: { endCard: { next: "先進封裝", trail: ["缺陷", "測試", "良率", "修補"], at: "s14:cm-8", comment: "良率", logoAnim: "transparent" } }, sources: [] },
];
scenes[0].beat = "hook"; scenes[12].beat = "cta"; scenes[13].beat = "cta";
// 畫面用的 cue：每幕的 start／end／exit 與每個 cue
const cues = {};
for (const s of scenes) { if (s.silent) continue; for (const k of ["start", "end", "exit"]) cues[`${s.id}_${k}`] = `${s.id}:${k}`; for (const c of s.cues) cues[`${s.id}_${c.id}`] = `${s.id}:${c.id}`; }
const script = {
  slug: "tech-yield", title: "晶圓良率：大晶片為什麼比較吃虧（科技透明圈 第 4 支）", asOf: "2026/11/17", styleVersion: 3, stage: "three",
  channel: { name: "科技透明圈", tag: "放大來看", slogan: "一支講透一件事" }, hudSkin: "light",
  voice: { voiceName: "Iapetus", model: "gemini-2.5-flash-preview-tts", mode: "take", languageCode: "cmn-TW", profile: "tech-b", _說明: "念稿定版：docs/prompts/tech-yield-旁白.txt；API 整篇 1 次請求" },
  hud: {
    levels: [{ id: "yield", label: "晶圓良率", en: "WAFER YIELD", field: "40 cm", ruler: "10 cm", art: "yield", readout: false, note: "查證截至 2026/11/17", cues }],
    theme: "dark", schematic: { text: "Schematic – not to scale", zh: "示意圖，非實際比例・格線與切割道為示意" }, maxLabels: 4, smallPx: 30, layout: "fill", scanBand: 0.3,
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

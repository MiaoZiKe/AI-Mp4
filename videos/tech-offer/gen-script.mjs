// node videos/tech-offer/gen-script.mjs → 寫 videos/tech-offer/script.json（畫面、疊層、鏡頭都在這支；改腳本改這支）
import fs from "node:fs";
const R = new URL(".", import.meta.url).pathname;
const S = (id, beat, para, narration, zh, en, keywords, cues, props, sources, extra = {}) => ({ id, beat, para, narration, tts: narration, subtitle: { zh, en }, keywords, cues: cues.map(([id, text]) => ({ id, text })), component: "ThreeScene", props, sources, ...extra });
const tag = (at, until, text, x, y, color = "blue", size = 32) => ({ type: "stamp", style: "tag", at, until, text, x, y, color, size });
const stamp = (at, until, text, x, y, color = "amber", size = 64, rot = -5, more = {}) => ({ type: "stamp", at, until, text, x, y, color, size, rot, ...more });
const shot = (at, x, more = {}) => ({ at, x, dur: 20, ...more });
const hide = (layer, until, more = {}) => ({ layer, at: "start-40", until, opacity: 0, dur: 6, ...more });
// 年薪柱：開場第 0 幀已經疊了 4 塊，之後每 3 幀疊一塊（從上方落下）
// 物理（2026/11/16 Andy：「物理效果需要加強」）：方塊受重力落下（fallIn）、落地小彈跳、下面那疊被壓一下（press）
const below = (n) => Array.from({ length: n }, (_, j) => `m${j + 1}`);
const stackShifts = Array.from({ length: 12 }, (_, i) => ({ layer: `m${i + 1}`, at: "start-40", until: i < 11 ? "start-30" : "start-4", dy: 3.2, opacity: 0, dur: 6, fallIn: true, bounce: 0.05, press: below(i), pressAmt: 0.05 }));
const scenes = [
  S("s1", "hook", 1, "電子零組件業，一年領的錢，月薪只佔一半左右。", "電子零組件業\n一年領的錢\n月薪只佔一半左右", "In electronic components, | monthly pay is only about half | of what you take home in a year.", ["一半"], [["year", "一年"], ["half", "一半"]],
    { hook: { kicker: "電子零組件業", title: "月薪只佔一半", size: 120, top: 150 }, zoom: [{ to: "desk", at: "start-30", dur: 1 }],
      shot: [{ at: "start-30", x: -2.2, d: 46, elev: 15, y: 7.4, dur: 1 }],
      shift: [...stackShifts, { layer: "bonY", at: "start-40", until: "start+40", dy: 5, opacity: 0, dur: 8, fallIn: true, bounce: 0.04, press: below(12), pressAmt: 0.07 }, { layer: "bonD", at: "start-40", until: "start+58", dy: 5, opacity: 0, dur: 8, fallIn: true, bounce: 0.04, press: [...below(12), "bonY"], pressAmt: 0.06 },
        hide("certs", "s6:stock-6"), hide("contract", "s5:contract-8"), hide("gauge", "s5:earn-10")],
      overlay: [stamp("start+20", "s2:dgbas-4", "主計總處 2025", 760, 1090, "blue", 54, -6, { avoid: false }), stamp("half", "s2:m57-2", "≈ 一半", 720, 870, "amber", 62, -4, { avoid: false }),
        tag("half+6", "s2:end", "估算：68.5 ÷ 133 ≈ 51%", 300, 1300, "amber", 30)] },
    ["主計總處 2025 薪資統計（電子零組件業）；一半為估算"]),
  S("s2", "you", 1, "主計總處去年平均，一個月五萬七，一整年一百三十三萬。", "主計總處去年平均\n一個月 5.7 萬\n一整年 133 萬", "Government stats for last year: | 57,000 a month, | 1.33 million for the whole year.", ["5.7 萬", "133 萬"], [["dgbas", "主計總處"], ["m57", "一個月"], ["y133", "一整年"]],
    { zoom: [{ to: "desk", at: "dgbas-6", dur: 1 }], overlay: [
      { type: "bars", at: "dgbas+4", until: "s3:start-16", y: 1100, title: "電子零組件業 2025 平均", tag: "已確定・主計總處", compact: true, rows: [
        { label: "月薪 ×12", v: 0.515, text: "68.5 萬", color: "blue", at: "s2:dgbas+4" },
        { label: "全年總薪資", v: 1, text: "133 萬", color: "amber", at: "s2:y133-2" }] }] },
    ["主計總處 2025：經常性 5.7 萬／月、全年 133 萬"]),
  S("s3", "twist", 2, "offer 上寫的是月薪，一年實拿的卻多了一倍。差在哪？", "offer 上寫的是月薪\n一年實拿的卻多了一倍\n差在哪？", "The offer letter shows monthly pay, | but a year actually pays about double. | Where's the gap?", ["月薪", "多了一倍"], [["offer", "寫的"], ["double", "多了一倍"], ["where", "差在哪"]],
    { shot: [shot("start-8", -30, { y: 5.6, d: 60 })],
      shift: [{ layer: "scaleB", at: "start-40", until: "double-10", dy: 5, opacity: 0, dur: 8, fallIn: true, bounce: 0.04 }, hide("scaleF", "s12:start-4")],
      run: [{ id: "tiltS3", at: "double-2", until: "s4:start+2" }],
      labels: [{ part: "sL", text: "offer 上寫的", en: "monthly ×12", color: "blue", at: "offer", until: "s4:start-6" }, { part: "sR", text: "一年實拿", en: "whole year", color: "amber", at: "double-2", until: "s4:start-6" }],
      overlay: [stamp("double+4", "where-8", "× 約 1.9", 760, 1200, "amber", 60, -5, { avoid: false }), tag("double+10", "s4:start+2", "估算：133 ÷ 68.5", 330, 1330, "amber", 30), stamp("where-4", "s4:start+2", "差在哪？", 760, 1200, "coral", 60, -4, { avoid: false })] },
    ["估算：133 萬 ÷（5.7 萬 ×12）≈ 1.9 倍"]),
  S("s4", "mechanism", 3, "差在年終跟分紅。這兩樣法律上原則不算工資，", "差在年終跟分紅\n這兩樣法律上\n原則不算工資", "The gap is year-end bonus and profit sharing. | Legally, neither counts as wages, in principle.", ["年終", "分紅", "不算工資"], [["ye", "年終"], ["ps", "分紅"], ["law", "法律上"], ["nowage", "不算工資"]],
    { shot: [shot("start+2", 0, { y: 8.8, d: 64 })],
      shift: [{ layer: "bonD", at: "ps-4", until: "s13:start", dy: 0.5, dur: 8 }],
      labels: [{ part: "bonY", text: "年終", en: "year-end bonus", color: "amber", at: "ye", until: "s6:start" }, { part: "bonD", text: "分紅", en: "profit sharing", color: "amber", at: "ps", until: "s7:start-4" }],
      overlay: [{ type: "card", at: "law-4", until: "s5:start+4", y: 236, kicker: "法規條文", lines: ["年終、紅利：不算經常性給與"], hi: "不算", hiAt: "nowage", size: 52, foot: "勞基法施行細則 第 10 條" }] },
    ["勞基法施行細則第 10 條（紅利、年終獎金）"]),
  S("s5", "mechanism", 3, "跟著公司當年賺多少走。沒寫進合約的，", "跟著公司當年賺多少走\n沒寫進合約的", "They follow how much the company earns that year. | If it isn't written into the contract,", ["賺多少"], [["earn", "賺多少"], ["contract", "合約"]],
    { run: [{ id: "growD", at: "earn-8", until: "s6:start+6", ramp: 10 }, { id: "swingG", at: "earn-8", until: "s6:start+6", ramp: 20 }, { id: "meterD", at: "earn-6", until: "s6:start+6" }],
      overlay: [tag("earn+2", "s6:start+6", "法規條文：公司法 235-1（當年度獲利 × 章程比率）", 540, 1140, "blue", 30)] },
    ["公司法第 235 條之 1；儀表為示意"]),
  S("s6", "mechanism", 3, "就不一定每年有，分紅也可能發股票。", "就不一定每年有\n分紅也可能發股票", "it may not come every year — | and profit sharing can be paid in stock.", ["不一定", "股票"], [["maybe", "不一定"], ["stock", "股票"]],
    { run: [{ id: "blinkY", at: "maybe-4", until: "stock-4" }, { id: "hiBlank", at: "start", until: "stock" }],
      shift: [{ layer: "certs", at: "stock-6", until: "s7:start", dx: 4.6, dur: 12 }],
      labels: [{ part: "contract", text: "保障幾個月？", en: "guaranteed?", color: "amber", at: "start+2", until: "stock+4" }, { part: "certs", text: "股票", en: "shares", color: "blue", at: "stock+4", until: "s7:start-4" }],
      overlay: [tag("stock+2", "s7:start-8", "法規條文：公司法 235-1 第 3 項（股票或現金）", 540, 1140, "blue", 30)] },
    ["公司法第 235 條之 1 第 3 項（股票或現金）"]),
  S("s7", "mechanism", 4, "加班費只拿每月工資算，不含年終跟分紅。月薪除以兩百四十是時薪，", "加班費只拿每月工資算\n不含年終跟分紅\n月薪除以 240 是時薪", "Overtime is based on monthly wages only, | not bonuses. Monthly pay ÷ 240 | is the hourly rate.", ["每月工資", "240"], [["ot", "加班費"], ["monthly", "每月工資"], ["excl", "不含"], ["d240", "除以"], ["hr", "是時薪"]],
    { kwMark: "240", shot: [shot("start-8", 30, { y: 5.0, d: 46 })],
      run: Array.from({ length: 8 }, (_, r) => ({ id: `row${r}`, at: `d240${r * 3 - 16 >= 0 ? "+" : ""}${r * 3 - 16}`, until: "s8:start+10", ramp: 4 })),
      labels: [{ part: "big", text: "月薪", en: "monthly pay", color: "blue", at: "monthly", until: "s8:start" }],
      overlay: [stamp("excl", "d240-8", "年終、分紅 不算進時薪", 540, 1230, "coral", 50, -4, { avoid: false }), stamp("d240", "s8:start+14", "÷30 天 ÷8 小時", 540, 1230, "blue", 56, -4, { avoid: false }), tag("hr", "s8:start+14", "勞動部：月薪 ÷ 240＝平日每小時工資", 540, 1340, "blue", 30)] },
    ["勞基法第 24 條；勞動部（月薪 ÷ 30 ÷ 8）"]),
  S("s8", "mechanism", 4, "前兩小時至少多三分之一。月薪低，加班也領得少。", "前 2 小時至少多 1/3\n月薪低\n加班也領得少", "The first 2 overtime hours pay at least 1/3 more. | Lower monthly pay | means less overtime pay too.", ["1/3", "領得少"], [["two", "小時"], ["third", "至少多"], ["low", "月薪低"], ["less", "領得少"]],
    { run: [{ id: "slice", at: "start-4", until: "two+10" }, { id: "hands", at: "two-6", until: "s9:start" }, { id: "handsH", at: "two-6", until: "s9:start" }],
      shift: Array.from({ length: 8 }, (_, i) => [{ layer: `coinA${i}`, at: "start-40", until: i < 2 ? "start-30" : `two+${(i - 2) * 7}`, dy: 4, opacity: 0, dur: 7, fallIn: true, bounce: 0.06 }, { layer: `coinB${i}`, at: "start-40", until: i < 1 ? "start-30" : i < 5 ? `two+${(i - 1) * 8 + 4}` : "s13:end", dy: 4, opacity: 0, dur: 7, fallIn: true, bounce: 0.06 }]).flat(),
      labels: [{ part: "coinA", text: "A 月薪高", en: "higher pay", color: "blue", at: "low-2", until: "s9:start" }, { part: "coinB", text: "B 月薪低", en: "lower pay", color: "amber", at: "low+2", until: "s9:start" }],
      overlay: [stamp("third", "low-2", "+1/3 起跳", 540, 1250, "amber", 60, -4, { avoid: false }), tag("third+4", "s9:start", "法規條文：勞基法第 24 條（前 2 小時 +1/3、再 2 小時 +2/3）", 540, 1350, "blue", 30), stamp("less", "s9:start-6", "同樣加 4 小時", 540, 1250, "blue", 52, -4, { avoid: false })] },
    ["勞基法第 24 條；硬幣為示意"]),
  S("s9", "mechanism", 5, "勞退也一樣。公司每月提撥百分之六，看的是每月工資。", "勞退也一樣\n公司每月提撥 6%\n看的是每月工資", "Pension works the same way: | employers contribute 6% a month, | based on monthly wages.", ["6%", "每月工資"], [["pen", "勞退"], ["six", "提撥"], ["wage", "每月工資"]],
    { shot: [shot("start-8", 60, { y: 5.6, d: 46 })],
      run: [{ id: "dripA", at: "six-6", until: "s10:start" }, { id: "dripB", at: "six-6", until: "s10:start" }, { id: "rippleA", at: "six+2", until: "s10:start" }, { id: "rippleB", at: "six+2", until: "s10:start" }],
      shift: [{ layer: "waterA", at: "start-40", until: "six", dy: -4.1, dur: 70 }, { layer: "waterB", at: "start-40", until: "six", dy: -2.8, dur: 70 }, { layer: "skipBon", at: "wage-6", until: "s13:end", dx: 9, dur: 26 }],
      labels: [{ part: "jarA", text: "A 勞退專戶", en: "pension A", color: "blue", at: "pen", until: "s10:start" }, { part: "jarB", text: "B 勞退專戶", en: "pension B", color: "amber", at: "pen+4", until: "s10:start" }],
      overlay: [stamp("six", "s10:start-10", "每月 6%", 260, 1270, "amber", 62, -5), tag("wage", "s10:start", "法規條文：勞退條例第 14 條", 720, 1290, "blue", 30)] },
    ["勞工退休金條例第 14 條；勞動部"]),
  S("s10", "mechanism", 6, "責任制也不是公司說了算。要勞動部核定的職務、書面約定，再報地方政府核備。", "責任制也不是公司說了算\n要勞動部核定的職務、書面約定\n再報地方政府核備", "\"Exempt\" status isn't up to the company. | The job must be approved by the labor ministry, | agreed in writing, and filed locally.", ["核定", "書面約定", "核備"], [["resp", "責任制"], ["notco", "說了算"], ["approve", "核定"], ["write", "書面"], ["file", "核備"]],
    { shot: [shot("start-8", 90, { y: 3.9, d: 41 })],
      run: [{ id: "docGo", at: "start", until: "file+10" }, { id: "press0", at: "approve-2", until: "approve+10", ramp: 3 }, { id: "press1", at: "write-2", until: "write+10", ramp: 3 }, { id: "press2", at: "file-2", until: "file+10", ramp: 3 }],
      shift: [
        { layer: "doc", at: "notco", until: "s13:end", dx: 5, dur: 10 }, { layer: "doc", at: "approve+6", until: "s13:end", dx: 5, dur: 10 }, { layer: "doc", at: "write+6", until: "s13:end", dx: 5, dur: 10 },
        ...[0, 1, 2].flatMap((i) => [{ layer: `mark${i}`, at: "notco", until: "s13:end", dx: 5, dur: 10 }, { layer: `mark${i}`, at: "approve+6", until: "s13:end", dx: 5, dur: 10 }, { layer: `mark${i}`, at: "write+6", until: "s13:end", dx: 5, dur: 10 }]),
        { layer: "mark0", at: "start-40", until: "approve", opacity: 0, dur: 2 }, { layer: "mark1", at: "start-40", until: "write", opacity: 0, dur: 2 }, { layer: "mark2", at: "start-40", until: "file", opacity: 0, dur: 2 },
        ...[["stamp0", "approve"], ["stamp1", "write"], ["stamp2", "file"]].map(([layer, c]) => ({ layer, at: `${c}-5`, until: `${c}+4`, dy: -1.75, dur: 5, fallOut: true, bounce: 0.1, press: ["doc", "mark0", "mark1", "mark2"], pressAmt: 0.05 }))],
      labels: [{ part: "st0", text: "① 核定", en: "approved job", color: "blue", at: "approve-2", until: "s11:start" }, { part: "st1", text: "② 書面", en: "in writing", color: "blue", at: "write-2", until: "s11:start" }, { part: "st2", text: "③ 核備", en: "filed", color: "amber", at: "file-2", until: "s11:start" }],
      overlay: [stamp("notco", "approve-4", "不是公司說了算", 540, 1250, "coral", 56, -4, { avoid: false }), tag("approve", "s11:start", "法規條文：勞基法第 84 條之 1（少一道就不成立）", 540, 1340, "blue", 30)] },
    ["勞基法第 84 條之 1"]),
  S("s11", "twist", 7, "還不知道的，是明年的分紅。它跟著明年的獲利走，現在沒人說得準。", "還不知道的\n是明年的分紅\n它跟著明年的獲利走\n現在沒人說得準", "What we don't know yet is next year's profit sharing. | It follows next year's earnings — | no one can say for sure now.", ["明年的分紅", "說不準"], [["unk", "還不知道"], ["next", "明年的分紅"], ["earn2", "獲利"], ["nobody", "沒人說得準"]],
    { shot: [shot("start-8", 0, { y: 6.6, d: 64, dur: 24 })],
      run: [{ id: "growD", at: "earn2-8", until: "s12:start", ramp: 10, gain: 1.3 }, { id: "swingG", at: "earn2-8", until: "s12:start", ramp: 20, gain: 1.3 }, { id: "pulseD", at: "next-2", until: "s12:start" }],
      labels: [{ part: "bonD", text: "明年分紅", en: "next year", color: "amber", at: "next", until: "s12:start-4" }],
      overlay: [stamp("nobody", "s12:start", "＝？", 840, 1250, "amber", 80, -5, { avoid: false }), tag("unk+4", "s12:start", "查不到：明年獲利（截至 2026/11/16）", 360, 1250, "coral", 30)] },
    ["明年獲利：截至 2026/11/16 無公開數字"]),
  S("s12", "cta", 8, "所以兩份 offer，你會選月薪高的，還是分紅高的？", "所以兩份 offer\n你會選月薪高的\n還是分紅高的？", "So with two offers — | would you pick the higher monthly pay, | or the bigger profit share?", ["月薪高", "分紅高"], [["two", "兩份"], ["hiMo", "月薪高"], ["hiPs", "分紅高"]],
    { shot: [shot("start-8", -30, { y: 3.4, d: 56, dur: 24 })],
      shift: [{ layer: "scaleA", at: "s4:start", until: "s13:end", opacity: 0, dur: 6 }, { layer: "scaleB", at: "s4:start", until: "s13:end", opacity: 0, dur: 6 }],
      run: [{ id: "swingS", at: "start+6", until: "s13:start+20", ramp: 10 }],
      labels: [{ part: "sL", text: "A 月薪高", en: "higher monthly", color: "blue", at: "hiMo-2", until: "s13:start" }, { part: "sR", text: "B 分紅高", en: "bigger bonus", color: "amber", at: "hiPs-2", until: "s13:start" }],
      overlay: [{ type: "card", at: "two", until: "s13:start+6", y: 1160, kicker: "二選一", lines: ["A 月薪高　還是　B 分紅高？"], hi: "B 分紅高", hiAt: "hiPs", size: 52 }] },
    ["二選一提問"]),
  S("s13", "cta", 8, "週四，我們拆一家科技廠的整包。想要完整解說，留言整包。", "週四，我們拆一家科技廠的整包\n想要完整解說，留言整包", "Thursday: we break down | one tech company's whole package. | Comment \"整包\" for the full notes.", ["整包"], [["thu", "週四"], ["pkg", "整包"], ["cm", "留言"]],
    { shot: [shot("start-8", 0, { y: 6.6, d: 64, dur: 22 })],
      shift: [...Array.from({ length: 12 }, (_, i) => ({ layer: `m${i + 1}`, at: `pkg+${i}`, until: "s14:end+200", dx: (i % 2 ? 1 : -1) * (1.6 + (i % 4) * 0.9), dy: -i * 0.56, dz: 1.2 + (i % 3) * 1.1, dur: 16, throw: 3.2 })), // 拋物線：水平等速、垂直先上後落，落回桌面
        { layer: "bonY", at: "pkg+4", until: "s14:end+200", dx: -6, dy: -6.72, dz: -1, dur: 18, throw: 3 }, { layer: "bonD", at: "pkg+6", until: "s14:end+200", dx: 6.5, dy: -10.9, dz: -1, dur: 20, throw: 3 }],
      overlay: [stamp("pkg+4", "s14:start+4", "週四：拆整包", 540, 430, "blue", 58, -4, { avoid: false })] },
    ["下一集：11/19（四）公司待遇影片（已排定）"]),
  { id: "s14", beat: "end", silent: true, durationSec: 3.2, subtitle: { zh: "", en: "" }, keywords: [], cues: [], component: "ThreeScene",
    props: { endCard: { next: "一家科技廠的整包", trail: ["月薪", "年終", "分紅", "勞退"], at: "s13:cm-8", comment: "整包", logoAnim: "transparent" } }, sources: [] },
];
const script = {
  slug: "tech-offer", title: "兩份 offer 怎麼比：月薪只佔一半（科技透明圈 第 3 支）", asOf: "2026/11/16", styleVersion: 3, stage: "three",
  channel: { name: "科技透明圈", tag: "放大來看", slogan: "一支講透一件事" }, hudSkin: "light",
  voice: { voiceName: "Iapetus", model: "gemini-2.5-flash-preview-tts", mode: "take", languageCode: "cmn-TW", profile: "tech-b", _說明: "念稿定版：docs/prompts/tech-offer-旁白.txt（commit 4e936cd）；API 整篇 1 次請求（2026-11-16 01:53）", _語速: "照 playbook 第九節 16 條：原始整篇純說話 280 字／56.4 秒＝4.96 字/秒 → 整篇 atempo 1.10（原檔 .take-3c860fa4f1.raw.orig.wav），約 5.45 字/秒，對齊 tech-2nm 的 5.46" },
  hud: {
    levels: [{ id: "desk", label: "兩份 offer", en: "OFFER", field: "1 m", ruler: "10 cm", art: "none", handoff3D: true, readout: false, note: "查證截至 2026/11/16" }],
    theme: "dark", schematic: { text: "Schematic – not to scale", zh: "示意，非實際比例・運作為示意" }, maxLabels: 4, smallPx: 30, layout: "fill", scanBand: 0.3, _scanBand: "2026-11-16 美編：掃描亮帶 8% × 0.3 ≈ 2.4%（白底上不髒）",
  },
  cover: { title: ["月薪", "只佔一半"], sub: "兩份 offer 怎麼比", frame: 40 },
  sample: false, scenes,
};
fs.writeFileSync(R + "script.json", JSON.stringify(script, null, 2) + "\n");
console.log("ok", scenes.length);

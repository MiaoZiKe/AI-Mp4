// v3（桌面紙拼貼）打樣資料：what-is-server 23 鏡的 PaperScene props、cues、keywords。
// 旁白、字幕、出處取自 videos/what-is-server/storyboard.draft.json；scripts/v3/proof.mjs 合併後輸出完整範例
// docs/style-v3/proof-script.json（給整合的人照著寫正式的 script.json）。
//
// 世界座標（桌面，px；鏡頭 [cx, cy, s]＝這個世界點對到畫面中心 (540, 960)、縮放 s）：
//   機櫃／出餐口：中心 (540, 1500)；紙虛線：從 P0 (180, 2640) 斜上到 (540, 1985)；機櫃牆：中心 (540, 250)
// 手機在 near 層（畫面座標，近景），所以直向全景裡手機大、廚房小。

export const P0 = [180, 2640];
export const PATH = [P0, [410, 2400], [350, 2180], [440, 1992]];
const CAM = { phone: [180, 2825, 1], rack: [630, 1654, 1], pass: [540, 1659, 1], wide: [513, 2547, 0.42], row: [540, 2085, 0.6], wall: [540, 262, 0.85] };
const PH = { close: { x: 540, y: 1352, w: 600 }, wide: { x: 400, y: 1503, w: 520 }, off: { x: 540, y: 2760, w: 600 } };
const hook = (extra) => ({
  type: "strip", layer: "screen", paper: "strip-hook", x: 540, y: 580, w: 920, rot: -1.6, align: "left", pad: [70, 26],
  lines: [{ t: "IG 掛過", size: 132, lh: 1.08 }, { t: "約 {6 小時}", size: 132, accentSize: 176, lh: 1.1 }, { t: "那次[不是你]網路爛", size: 54, color: "ink3", lh: 1.3, mt: 10 }],
  tape: [{ asset: "tape-y", x: 150, y: 8, rot: -5 }, { asset: "tape-m", x: 790, y: 0, rot: 4 }], state: { mark: 0 }, to: "top", ...extra,
});
/** at 字串：cue 加減幾幀（"serve+11"、"back-14"） */
const o = (base, n) => (n ? `${base}${n > 0 ? "+" : ""}${n}` : base);
const SRC = ["來源：Meta 工程部落格、ThousandEyes 2021/10"];

export const SCENES = {
  s01: { keywords: ["怪自己"], cues: [{ id: "blame", text: "怪自己" }], sources: SRC, props: {
    camera: { to: CAM.phone },
    items: [
      { id: "path", type: "path", pts: PATH, dash: 1.4, state: { grow: 0 }, until: "end" },
      { id: "phone", type: "phone", layer: "near", ...PH.close, state: { screen: "error" }, set: [{ at: "start+9", pull: 1 }, { at: "start+48", pull: 2 }], until: "end" },
      hook({ set: [{ at: "blame", mark: 1 }] }),
    ] } },
  s02: { keywords: ["不在你這邊"], cues: [{ id: "notyou", text: "不在你這邊" }], props: {
    camera: [{ to: [180, 2785, 1], at: "notyou+8", dur: 8 }, { to: CAM.phone, at: "notyou+18", dur: 10 }],
    items: [{ ref: "path", at: "start+3", state: { grow: 1 } }] } },
  s03: { keywords: ["照片", "不在"], cues: [{ id: "photo", text: "照片" }, { id: "gone", text: "不在" }], props: {
    items: [
      { ref: "phone", at: "start", state: { screen: "grid", photos: [1, 1, 1] }, set: [{ at: "photo", scroll: 1 }, { at: "gone", photos: [0, 1, 1] }, { at: "gone+5", photos: [0, 0, 1] }, { at: "gone+8", photos: [0, 0, 0] }] },
      ...[0, 5, 8].map((d, i) => ({ asset: "photo", layer: "near", x: 540, y: 1071 + i * 266, w: 280, z: 5, at: `gone+${d}`, from: "cut", moves: [{ path: [[700, 620], [860, -260]], dur: 14, ease: "exit" }] })),
    ] } },
  s04: { keywords: ["別人的電腦"], cues: [{ id: "where", text: "那在哪" }, { id: "others", text: "別人的電腦" }], props: {
    camera: { to: CAM.rack, at: "where", dur: 16 },
    items: [
      { ref: "phone", at: "where", ...PH.off, dur: 14 },
      { id: "rack", asset: "rack", x: 540, y: 1500, w: 560, at: "where+4", from: "top", step: false, until: "s07" },
      { id: "doorphoto", asset: "photo", x: 700, y: 1770, w: 300, rot: 4, z: 3, at: "others+4", until: "s06" },
    ] } },
  s05: { keywords: ["Server", "伺服器"], cues: [{ id: "server", text: "Server" }, { id: "zh", text: "伺服器" }], props: {
    punch: "server",
    items: [{ id: "label", type: "strip", paper: "label", x: 822, y: 1336, w: 560, rot: -4, z: 5, at: "server", from: "slam", align: "left", pad: [46, 30],
      lines: [{ t: "Server", size: 128, ls: -0.02, lh: 1 }, { t: "[伺服器]", size: 66, ls: 0.06, lh: 1.25, mt: 10 }], tape: [{ asset: "tape-m", x: 300, y: 0, rot: 3 }], state: { mark: 0 }, set: [{ at: "zh", mark: 1 }], until: "s07" }] } },
  s06: { keywords: ["幫別人做事"], cues: [{ id: "serve", text: "幫別人做事" }], props: {
    camera: { to: [600, 1730, 0.94] },
    items: [
      ...["photo", "envelope", "heart"].map((a, i) => ({ asset: a, x: 300, y: 2230, w: 230, z: 2, at: o("serve", i * 13 - 12), from: "left",
        moves: [{ at: o("serve", i * 13 - 2), path: [[540, 1985], [540, 1800]], dur: 9 }, { at: o("serve", i * 13 + 9), to: { x: 1350, y: 1640, rot: 20 }, dur: 9, ease: "exit" }] })),
      { asset: "sheet-kraft", layer: "screen", x: 540, y: 1000, w: 1240, at: "exit-9", from: "bottom", until: "s07.start+4", to: "top" },
    ] } },
  s07: { keywords: ["廚房"], cues: [{ id: "kitchen", text: "廚房" }], props: {
    camera: { to: CAM.pass, dur: 1 },
    items: [
      { id: "pass", type: "pass", layer: "mat", x: 540, y: 1500, w: 900, from: "cut", state: { inside: "rack" }, set: [{ at: "kitchen+4", inside: "kitchen" }], until: "end" },
      { type: "strip", paper: "label-s", layer: "mat", x: 770, y: 1760, w: 400, rot: 3, z: 5, at: "kitchen", lines: [{ t: "廚房", size: 100, ls: 0.1 }], tape: [{ asset: "tape-y", x: 40, y: 6, rot: -30, w: 150 }], until: "s08" },
    ] } },
  s08: { keywords: ["點餐"], cues: [{ id: "scroll", text: "滑" }, { id: "order", text: "點餐" }], props: {
    camera: { to: CAM.wide, dur: 16 },
    items: [
      { ref: "phone", ...PH.wide, dur: 16, state: { screen: "grid", photos: [0, 0, 0] }, set: [{ at: "scroll", scroll: 1 }, { at: "order+12", scroll: 2 }] },
      ...[0, 14].map((d) => ({ asset: "ticket", x: P0[0], y: P0[1] + 60, w: 300, z: 1, at: `order+${d}`, from: "cut", moves: [{ path: [...PATH.slice(1), [600, 1690]], dur: 26 }] })),
    ] } },
  s09: { keywords: ["送回來"], cues: [{ id: "done", text: "做好" }, { id: "back", text: "送回來" }], props: {
    items: [
      { ref: "phone", set: [{ at: "back+2", photos: [1, 0, 0] }, { at: "back+12", photos: [1, 1, 0] }] },
      ...[0, 10].map((d) => ({ asset: "photo", x: 600, y: 1700, w: 340, z: 1, at: `done+${d}`, from: "cut", moves: [{ to: { y: 1930 }, dur: 6 }, { at: o("back", d - 14), path: [[540, 2000], ...PATH.slice(1, 3).reverse(), [P0[0], P0[1] + 120]], dur: 16 }] })),
    ] } },
  s10: { keywords: ["出事"], cues: [{ id: "down", text: "出事" }], pauseAfter: 0.35, props: {
    mat: true, camera: { to: CAM.pass }, punch: "down",
    items: [
      { ref: "phone", ...PH.off },
      { ref: "pass", set: [{ at: "down-10", lit: false }] },
      { type: "strip", paper: "strip-red", layer: "mat", x: 540, y: 1834, w: 760, rot: 4, z: 5, at: "down", from: "slam", lines: [{ t: "出事？", size: 172, color: "white", ls: 0.04 }], tape: [{ asset: "tape-y", x: 16, y: 70, rot: 58 }], until: "s11" },
    ] } },
  s11: { keywords: ["通通"], cues: [{ id: "all", text: "通通" }], props: {
    camera: { to: CAM.row },
    items: [7, 540, 1073].map((x, i) => ({ id: `row${i}`, type: "phone", layer: "mat", x, y: 2462, w: 483, at: `start+${[2, 5, 7][i]}`, state: { screen: "grid", photos: [1, 1, 1] }, set: [{ at: "all", screen: "error-big", swap: "cut" }], until: "s14" })) } },
  s12: { keywords: ["整個掛掉"], cues: [{ id: "year", text: "2021" }, { id: "outage", text: "掛掉" }], sources: SRC, props: {
    camera: { to: CAM.pass },
    items: [
      { type: "strip", paper: "label-s", layer: "mat", x: 330, y: 1085, w: 440, rot: -3, z: 5, at: "year", lines: [{ t: "2021/10/4", size: 78, weight: 800 }], tape: [{ asset: "tape-m", x: 380, y: 4, rot: 24, w: 150 }], until: "s13" },
      { ref: "pass", set: [{ at: "outage", shutter: true }] },
    ] } },
  s13: { keywords: ["六個小時"], cues: [{ id: "six", text: "六個小時" }], sources: SRC, pauseAfter: 0.3, props: {
    camera: { to: CAM.row }, punch: "six",
    items: [
      { id: "six", type: "strip", paper: "sheet-big", layer: "screen", x: 540, y: 600, w: 860, rot: -1.2, at: "six", from: "bottom", box: [50, 30, 800, 400], lines: [{ t: "約 {6} 小時", size: 170, accentSize: 300, lh: 1.05 }], until: "s15" },
      { id: "pol", type: "strip", paper: "polaroid-aisle", caption: true, layer: "screen", x: 232, y: 880, w: 320, rot: -7, z: 2, at: "six+6", lines: [{ t: "機房", size: 50, ls: 0.2 }], tape: [{ asset: "tape-y", x: 250, y: 4, rot: 6 }], until: "s14" },
    ] } },
  s14: { keywords: ["半夜", "天亮"], cues: [{ id: "night", text: "半夜" }, { id: "dawn", text: "天亮" }], sources: SRC, props: {
    items: [
      { ref: "six", x: 800, y: 440, w: 400, rot: 5, dur: 10 },
      { asset: "sheet-night", layer: "mat", x: 540, y: 2046, w: 1750, z: 1, at: "start", from: "left", step: false, until: "s15" },
      { asset: "moon", layer: "mat", x: 1010, y: 1500, w: 300, z: 3, at: "night", until: "s14.dawn-4", to: "left" },
      { asset: "sheet-dawn", layer: "mat", x: 540, y: 2046, w: 1750, z: 4, at: "dawn-14", from: "right", step: false, until: "s15" },
      { asset: "sun", layer: "mat", x: 1010, y: 1500, w: 340, z: 5, at: "dawn", from: "bottom", until: "s15" },
      { ref: "phone", x: 400, y: 1330, w: 470, state: { screen: "error" } },
      { type: "strip", paper: "label-s", layer: "screen", x: 290, y: 420, w: 380, rot: -3, at: "start+6", lines: [{ t: "台灣時間", size: 76 }], until: "s15" },
    ] } },
  s15: { keywords: ["改錯設定"], cues: [{ id: "why", text: "原因呢" }, { id: "config", text: "改錯" }], sources: SRC, props: {
    camera: { to: [540, 1560, 1.12] },
    items: [
      { ref: "phone", ...PH.off },
      { id: "cfg", asset: "ticket-config", layer: "mat", x: 720, y: 1520, w: 320, rot: 5, z: 4, at: "why+10", until: "s17" },
      { asset: "cross-0", layer: "mat", x: 618, y: 1531, w: 96, z: 5, at: "config", from: "wipe", until: "s17" },
      { asset: "cross-1", layer: "mat", x: 618, y: 1531, w: 96, z: 5, at: "config+5", from: "wipe", until: "s17" },
    ] } },
  s16: { keywords: ["鎖死"], cues: [{ id: "lock", text: "鎖死" }], sources: SRC, props: {
    camera: { to: [540, 1820, 0.8] },
    items: [
      { asset: "lock", layer: "mat", x: 500, y: 1700, w: 250, z: 6, at: "lock", from: "slam", until: "s17" },
      ...[0, 9].map((d, i) => ({ asset: "ticket", layer: "mat", x: 330 + i * 330, y: 2900, w: 230, z: 3, at: `lock+${6 + d}`, from: "cut",
        moves: [{ to: { x: 430 + i * 200, y: 2090 }, dur: 9, ease: "exit" }, { at: `lock+${16 + d}`, to: { x: 390 + i * 260, y: 2250, rot: i ? 16 : -14 }, dur: 12, ease: "enter" }], until: "s17" })),
    ] } },
  s17: { keywords: ["LINE", "先不要怪"], cues: [{ id: "line", text: "LINE" }, { id: "dontblame", text: "先不要怪" }], props: {
    mat: false, camera: { to: CAM.phone },
    items: [
      { ref: "phone", ...PH.close, state: { screen: "chat" }, set: [{ at: "line", title: "LINE" }] },
      hook({ id: "hook2", at: "dontblame", from: "top", set: [{ at: "dontblame+12", mark: 1 }], until: "s18" }),
    ] } },
  s18: { keywords: ["廚房出事"], cues: [{ id: "kitchen", text: "廚房" }, { id: "down", text: "出事" }], props: {
    camera: { to: CAM.wide, dur: 14 },
    items: [
      { ref: "phone", ...PH.wide, dur: 14 },
      { type: "strip", paper: "tag-red", layer: "mat", x: 640, y: 1500, w: 560, rot: -5, z: 6, at: "kitchen", lines: [{ t: "出事中", size: 78, color: "white", ls: 0.08 }],
        moves: [{ at: "down", to: { rot: 3 }, dur: 6 }, { at: "down+6", to: { rot: -4 }, dur: 6 }], until: "s20" },
    ] } },
  s19: { keywords: ["什麼東西"], cues: [{ id: "what", text: "什麼東西" }], props: {
    camera: { to: [180, 3027, 1] },
    items: [{ ref: "phone", x: 540, y: 1150, w: 600, state: { screen: "comment" }, set: [{ at: "what", hop: 1 }] }] } },
  s20: { keywords: ["Server", "放在哪裡"], cues: [{ id: "many", text: "這麼多" }, { id: "where", text: "放在哪裡" }], props: {
    camera: { to: CAM.wall, dur: 18 }, punch: "where",
    items: [
      { ref: "phone", ...PH.off, dur: 14 },
      { id: "wall", asset: "rack-s", x: 540, y: 250, w: 280, grid: { cols: 3, rows: 3, dx: 330, dy: 500, stagger: 4 }, at: "many", from: "cut", until: "end" },
      { type: "strip", paper: "polaroid-rack", caption: true, x: 520, y: 60, w: 600, rot: -3, z: 3, at: "many+16", lines: [{ t: "Server", size: 56, weight: 800 }], tape: [{ asset: "tape-y", x: 250, y: 4, rot: -4 }], until: "s21" },
      { type: "strip", paper: "strip-yellow", layer: "screen", x: 590, y: 1100, w: 640, rot: 3, z: 4, at: "where", from: "slam", lines: [{ t: "放在哪？", size: 150 }], until: "s21" },
      { asset: "qmark", layer: "screen", x: 930, y: 930, w: 190, rot: 10, z: 5, at: "where+3", until: "s21" },
    ] } },
  s21: { keywords: ["雲端", "不在天上"], cues: [{ id: "cloud", text: "雲端" }, { id: "notsky", text: "不在天上" }], props: {
    camera: { to: [540, 100, 0.85] },
    items: [{ id: "cloud", asset: "cloud", layer: "mat", x: 540, y: -560, w: 640, z: 5, at: "cloud", from: "top", moves: [{ at: "notsky", to: { y: 1900, rot: -8 }, dur: 16, ease: "exit" }], until: "s23" }] } },
  s22: { keywords: ["帶你去看"], cues: [{ id: "next", text: "帶你去看" }], props: {
    camera: { to: [540, 1100, 0.85], dur: 16 },
    items: [{ asset: "sheet-cream", layer: "top", x: 540, y: 980, w: 1240, at: "next", from: "bottom", until: "end" }] } },
  s23: { component: "EndCard", props: { slogan: "一支講透一件事", next: "下一集：雲端，到底在哪？" } },
};

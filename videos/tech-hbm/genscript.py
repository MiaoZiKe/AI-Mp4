# scratch generator (not committed): writes videos/tech-hbm/script.json
import json
HX = {"H": 0, "W": 60, "X": 120, "Y": 180, "Z": 240}
XX, YX, ZX, WX = HX["X"], HX["Y"], HX["Z"], HX["W"]
HIDE = "s1:start-40"      # 一開始就藏起來的起點
FAR = "s9:end+400"

def sh(layer, at, until=None, **kw):
    d = {"layer": layer, "at": at}
    if until: d["until"] = until
    d.update(kw); return d
def hide_until(layer, until, dy=None, dur=2):
    d = {"layer": layer, "at": HIDE, "until": until, "opacity": 0, "dur": dur}
    if dy is not None: d["dy"] = dy
    return d
def gone(layer, at, dur=6): return {"layer": layer, "at": at, "until": FAR, "opacity": 0, "dur": dur}
def fall(layer, until, press=None, dy=1.2, bounce=0.07):
    d = {"layer": layer, "at": HIDE, "until": until, "dy": dy, "opacity": 0, "dur": 12, "fallIn": True, "bounce": bounce}
    if press: d["press"] = press; d["pressAmt"] = 0.012
    return d
def off(c, n): return f"{c}{'+' if n >= 0 else '-'}{abs(n)}"
def run(i, at, until=None, ramp=None, **kw):
    d = {"id": i, "at": at}
    if until: d["until"] = until
    if ramp: d["ramp"] = ramp
    d.update(kw); return d
def lab(part, text, en, color, at, until): return {"part": part, "text": text, "en": en, "color": color, "at": at, "until": until}
def stamp(text, at, until, color="amber", size=44, rot=-4, **kw):
    d = {"type": "stamp", "at": at, "until": until, "text": text, "color": color, "size": size, "rot": rot}
    d.update(kw); return d

def cue(i, t): return {"id": i, "text": t}
def scene(i, beat, para, tts, zh, en, kw, cues, props, src, pause=None, narr=None):
    s = {"id": i, "beat": beat, "para": para, "narration": narr or tts, "tts": tts,
         "subtitle": {"zh": "\n".join(zh), "en": " | ".join(en)}, "keywords": kw, "cues": cues, "component": "ThreeScene", "props": props, "sources": src}
    if pause: s["pauseAfter"] = pause
    assert len(zh) == len(en), (i, len(zh), len(en))
    return s

scenes = []

# ───────────── s1 鉤子（H）─────────────
s1_shift = [fall(f"hm_s{k}", off("start", 3 + 5 * (k - 6)), press=[f"hm_s{k-1}"], dy=1.3) for k in range(6, 12)]
s1_shift += [fall("ai", "ai", press=["ip"], dy=2.4, bounce=0.06), fall("h2", "ring", press=["ip"], dy=2.0), fall("h3", off("ring", 6), press=["ip"], dy=2.0)]
scenes.append(scene("s1", "hook", 1,
    "現在的 AI 晶片，算得再快，資料送不進來也沒用。所以它旁邊那圈記憶體，是十二層疊在一起，整疊還比一張信用卡薄。",
    ["現在的 AI 晶片", "算得再快", "資料送不進來也沒用", "所以它旁邊那圈記憶體", "是十二層疊在一起", "整疊還比一張信用卡薄"],
    ["Today's AI chips,", "however fast,", "can't use data that never gets in.", "So the ring of memory beside them", "is stacked twelve layers high,", "yet the stack is thinner than a credit card."],
    ["資料送不進來", "十二層", "信用卡"],
    [cue("ai", "AI 晶片"), cue("data", "送不進來"), cue("ring", "那圈記憶體"), cue("twelve", "十二層"), cue("card", "信用卡")],
    {"hook": {"kicker": "第五代 HBM3E｜廠商公布", "title": "12 層＜信用卡", "size": 120, "top": 236},
     "zoom": [{"to": "pk", "at": "start-30", "dur": 1}],
     "shot": [{"at": "start-30", "dur": 1, "x": 0.9, "y": 0.5, "d": 27, "elev": 30}],
     "shift": s1_shift,
     "run": [run("h_aihot", "data", "ring", 6), run("h_jam", "data", "ring+10", 6), run("h_hmglow", "twelve", "card+40", 6)],
     "labels": [lab("hm_top", "12 層 720 µm", "12 layers, 720 µm", "amber", "twelve", "s2:start-2"), lab("card", "信用卡 760 µm", "Card, 760 µm", "blue", "card", "s2:start-2")],
     "overlay": []},
    ["三星 12 層 TSV 新聞稿；SK 海力士 2024/9；ISO 7810"], pause=0.7))

# ───────────── s2 HBM 是什麼（H）─────────────
scenes.append(scene("s2", "you", 2,
    "這種記憶體叫高頻寬記憶體，HBM。高頻寬，就是一次能送很多資料。",
    ["這種記憶體叫", "高頻寬記憶體", "HBM，高頻寬", "就是一次能送很多資料"],
    ["This memory is called", "High Bandwidth Memory,", "HBM. High bandwidth means", "a lot of data at once."],
    ["高頻寬記憶體", "一次能送很多資料"],
    [cue("hbm", "HBM"), cue("band", "一次能送"), cue("much", "很多資料")],
    {"zoom": [{"to": "pk", "at": "start-2", "dur": 1}], "shot": [{"at": "start-2", "dur": 14, "x": 1.4, "y": 0.5, "d": 20, "elev": 30}],
     "shift": [hide_until("band", "band", dy=0), gone("card", "s3:start-2", 1)],
     "run": [run("h_hmglow", "hbm", "band", 6), run("h_band", "band", "s3:start-2", 6)],
     "labels": [lab("hm_top", "HBM", "High Bandwidth Memory", "amber", "hbm", "s3:start-2")],
     "overlay": [stamp("已確定", "much", "s3:start-2", "blue", x=880, y=330)]},
    ["TrendForce 2025/9；Siemens 2026/4"]))

# ───────────── s3 64 vs 2048（W）─────────────
scenes.append(scene("s3", "mechanism", 3,
    "多到什麼程度？一般電腦記憶體一次走六十四條資料線，新一代 HBM 一疊有兩千零四十八條。",
    ["多到什麼程度？", "一般電腦記憶體", "一次走六十四條資料線", "新一代 HBM", "一疊有兩千零四十八條"],
    ["How much more?", "A normal PC memory module", "moves 64 data lines at a time.", "The new-generation HBM", "has 2,048 lines in one stack."],
    ["六十四條", "兩千零四十八條"],
    [cue("six4", "六十四條"), cue("n2048", "兩千零四十八"), cue("x32", "一疊有")],
    {"shot": [{"at": "start-2", "dur": 1, "x": WX, "y": 0.4, "d": 36, "elev": 38}],
     "run": [run("w_narrow", "six4-6", "s4:start-2", 6), run("w_wide", "n2048-6", "s4:start-2", 6)],
     "overlay": [{"type": "bars", "at": "six4", "until": "s4:start-2", "y": 1010, "compact": True, "title": "一次走幾條資料線", "tag": "JEDEC，示意",
                  "rows": [{"label": "一般電腦記憶體", "v": 0.03, "text": "64", "color": "coral", "textAt": "six4"},
                           {"label": "HBM3E", "v": 0.5, "text": "1,024", "color": "blue", "textAt": "x32"},
                           {"label": "HBM4", "v": 1.0, "text": "2,048", "color": "amber", "textAt": "n2048"}]},
                 stamp("差 32 倍", "n2048+16", "s4:start-2", "coral", 52, x=830, y=1200, avoid=False)]},
    ["JEDEC DDR5；Tom's Hardware；TrendForce"]))

# ───────────── s4 打洞（H → X）─────────────
s4_shift = [hide_until("sideLines", "many", dy=0), gone("sideLines", "chip", 1)]
for k in range(4): s4_shift.append(hide_until(f"x_ho{k}", off("hole", -18 + 8 * k)))
s4_shift = [x for x in s4_shift if x]
scenes.append(scene("s4", "mechanism", 4,
    "線這麼多，從旁邊拉不出來，只好直接在晶片上打洞。",
    ["線這麼多", "從旁邊拉不出來", "只好直接在晶片上打洞"],
    ["That many lines", "can't be routed out from the side,", "so holes are drilled straight into the chip."],
    ["拉不出來", "打洞"],
    [cue("many", "線這麼多"), cue("side", "拉不出來"), cue("chip", "晶片上"), cue("hole", "打洞")],
    {"shot": [{"at": "start-2", "dur": 1, "x": 3.8, "y": 0.6, "d": 19, "elev": 24},
              {"at": "chip", "dur": 1, "x": XX, "y": 1.4, "d": 19, "elev": 30}],
     "shift": s4_shift,
     "run": [run("x_plasma", "hole-20", "hole+40", 6)],
     "labels": [],
     "overlay": [stamp("放不下（示意）", "side", "chip", "coral", 44, y=1060, x=540),
                 {"type": "cross", "at": "side", "until": "chip", "part": "sl", "size": 190, "color": "coral"},
                 stamp("放大示意", "chip", "s5:fill+104", "amber", 40, y=330, x=230),
                 {"type": "section", "kind": "tsv", "at": "hole", "until": "s5:fill+104", "x": 64, "y": 905, "w": 952, "h": 340, "title": "矽穿孔怎麼做", "tag": "示意，非實際比例",
                  "t": {"holes": {"at": "hole"}, "fill": {"at": "s5:fill-8"}, "flip": {"at": "s5:fill+8"}, "car": {"at": "s5:fill+14"}, "grind": {"at": "s5:fill+24"}, "end": {"at": "s5:fill+84"}}, "grindDur": 60}]},
    ["三星新聞稿；TrendForce（示意：2,048 條線擠不出來）"], pause=0.7))

# ───────────── s5 TSV 加工（X → Y）─────────────
s5_shift = []
for k in range(5): s5_shift.append(hide_until(f"x_cu{k}", off("fill", -8 + 3 * k)))
s5_shift += [hide_until("x_dense", "holes"), hide_until("x_ovf", "fill+2"), gone("x_ovf", "fill+8", 3)]
s5_shift += [hide_until("x_cmp", "fill+2"), {"layer": "x_cmp", "at": "fill+3", "until": "fill+7", "dy": -0.2, "dur": 3}, gone("x_cmp", "fill+7", 3)]
s5_shift += [hide_until("x_carrier", "fill+14", dy=-1.6, dur=10)]
# 磨薄：磨輪 F+16 下降、F+24 接觸，連續磨到 F+84（2 秒），四片矽依序磨掉，F+84 才抬起
s5_shift += [hide_until("x_wheel", "fill+12"), {"layer": "x_wheel", "at": "fill+16", "until": FAR, "dy": -1.25, "dur": 8}]
for k in range(4):
    s5_shift.append({"layer": "x_wheel", "at": off("fill", 36 + 14 * k), "until": FAR, "dy": -0.25, "dur": 12})
    s5_shift.append({"layer": f"x_u{k}", "at": off("fill", 36 + 14 * k), "until": FAR, "opacity": 0, "dur": 6})
s5_shift += [{"layer": "x_wheel", "at": "fill+84", "until": FAR, "dy": 2.6, "dur": 6}, gone("x_wheel", "fill+90", 2), hide_until("x_tip", "fill+80")]
for k in (1, 2, 3):
    s5_shift.append(fall(f"y_d{k}", off("fill", 96 + 6 * (k - 1)), press=[("y_base" if k == 1 else f"y_d{k-1}")], dy=1.1, bounce=0.05))
s5_shift.append(hide_until("y_base", "fill+92"))
scenes.append(scene("s5", "mechanism", 5,
    "每一層打上幾萬個比頭髮細的孔，填銅，再從背面磨薄，一層一層往下接通。",
    ["每一層打上幾萬個", "比頭髮細的孔", "填銅，再從背面磨薄", "一層一層往下接通"],
    ["Each layer gets tens of thousands of holes", "thinner than a hair,", "filled with copper, then thinned from the back,", "layer by layer, connected downward."],
    ["幾萬個", "填銅", "背面磨薄", "往下接通"],
    [cue("holes", "幾萬個"), cue("hair", "比頭髮細"), cue("fill", "填銅"), cue("back", "背面"), cue("thin", "磨薄"), cue("stack", "一層一層"), cue("thru", "往下接通")],
    {"shot": [{"at": "start-2", "dur": 1, "x": XX, "y": 1.4, "d": 19, "elev": 30},
              {"at": "fill+92", "dur": 1, "x": YX + 3.0, "y": 1.0, "d": 40, "elev": 24}],
     "shift": s5_shift,
     "motion": [{"preset": "pick-place", "tool": "y_nz", "item": "y_d4", "at": "fill+104", "down": 1.2, "to": [-7.8, 0], "dyEnd": 1.72, "press": ["y_d3"], "k": 0.35}],
     "run": [run("x_flip", "fill+8", FAR, 14), run("x_whspin", "fill+12", "fill+90", 8), run("x_cmpvib", "fill+3", "fill+9", 2),
             run("x_tipglow", "fill+82", FAR, 6)],
     "labels": [],
     "overlay": [stamp("共數萬個", "holes", "fill", "amber", 44, x=840, y=300),
                 stamp("孔徑約人髮 1/20", "hair", "fill+2", "blue", 38, x=800, y=380)]},
    ["三星新聞稿；Wikipedia TSV；SemiEngineering"], pause=0.7))

# ───────────── s6 同高（Y → Z）─────────────
s6_shift = []
for k in range(4): s6_shift.append(hide_until(f"y_uf{k}", off("vendor", 72 + 5 * k)))
s6_shift.append(hide_until("y_bh", "vendor+26"))
s6_shift.append(gone("y_bh", "vendor+92", 6))
for side, n in (("a", 8), ("b", 12)):
    s6_shift.append(hide_until(f"z{side}_base", "same-8"))
    for i in range(n): s6_shift.append(fall(f"z{side}_{i}", off("same", -2 + (2 if side == "b" else 3) * i), press=[f"z{side}_base" if i == 0 else f"z{side}_{i-1}"], dy=1.0, bounce=0.03))
s6_shift.append(hide_until("zl", "same+34"))
scenes.append(scene("s6", "payoff", 6,
    "廠商說，十二層的每一片都磨得更薄，才塞得進原本八層的高度。",
    ["廠商說", "十二層的每一片", "都磨得更薄", "才塞得進", "原本八層的高度"],
    ["The makers say", "each of the twelve layers", "is ground thinner,", "so twelve fit into", "the height of the original eight."],
    ["磨得更薄", "原本八層"],
    [cue("vendor", "廠商說"), cue("thin2", "磨得更薄"), cue("same", "原本八層"), cue("height", "高度")],
    {"shot": [{"at": "start-2", "dur": 1, "x": YX + 3.0, "y": 1.0, "d": 40, "elev": 24},
              {"at": "same-8", "dur": 1, "x": ZX, "y": 0.8, "d": 28, "elev": 22}],
     "shift": s6_shift,
     "motion": [{"preset": "press-bond", "tool": "y_bh", "at": "vendor+30", "down": 1.2, "press": ["y_d4", "y_d3"], "melt": ["y_melt4"], "current": ["y_cur"], "k": 0.6}],
     "run": [run("zl_glow", "height", FAR, 6)],
     "labels": [lab("za", "原本 8 層", "original 8", "blue", "same+10", "s7a:start-2"), lab("zb", "12 層，每片更薄", "12, thinner each", "amber", "same+16", "s7a:start-2")],
     "overlay": [stamp("同高", "height", "s7a:start-2", "blue", 52, x=830, y=1000), stamp("做法依廠商而異", "vendor+30", "same-8", "amber", 34, x=760, y=330)]},
    ["科技新報 2024/9；三星新聞稿；ServeTheHome"], pause=0.7))

# ───────────── s7a 誰在做 ─────────────
scenes.append(scene("s7a", "payoff", 7,
    "目前做的有 SK 海力士、三星和美光，台灣的台積電，負責新一代最底下那層晶片。",
    ["目前做的有", "SK 海力士", "三星和美光", "台灣的台積電", "負責新一代", "最底下那層晶片"],
    ["The makers today:", "SK hynix,", "Samsung and Micron,", "and Taiwan's TSMC", "builds the new generation's", "bottom layer."],
    ["SK 海力士", "台積電", "最底下"],
    [cue("skh", "SK"), cue("sam", "三星"), cue("mic", "美光"), cue("tsmc", "台積電"), cue("base", "最底下")],
    {"shot": [{"at": "start-2", "dur": 1, "x": 2.0, "y": -1.2, "d": 28, "elev": 28}],
     "run": [run("h_hmglow", "skh", "tsmc", 6), run("h_basehot", "base", "s7b:start-2", 6)],
     "labels": [lab("hm_base", "基底晶片（橘）", "base die", "amber", "base", "s7b:start-2")],
     "overlay": [{"type": "card", "at": "skh", "until": "s7b:start-2", "y": 850, "kicker": "媒體報導", "rows": [["SK 海力士", "HBM"], ["三星", "HBM"], ["美光", "HBM"], ["台積電", "新一代底層晶片"], ["韓美半導體、ASMPT", "鍵合設備"]], "hi": "台積電", "hiAt": "tsmc", "size": 42, "foot": "查證截至 2026/11/19，非投資建議"}]},
    ["各公司新聞稿；科技新報；TrendForce 2025/12"]))

# ───────────── s7b 良率沒公布 ─────────────
scenes.append(scene("s7b", "twist", 7,
    "疊這麼多層，每一家的良率多少，廠商都沒有公布。",
    ["疊這麼多層", "每一家的良率多少", "廠商都沒有公布"],
    ["With this many layers,", "what is each maker's yield?", "None of them has published it."],
    ["良率", "沒有公布"],
    [cue("stackup", "疊這麼多層"), cue("yield", "良率"), cue("unknown", "沒有公布")],
    {"shot": [{"at": "start-2", "dur": 1, "x": 2.0, "y": -0.8, "d": 22, "elev": 24}],
     "run": [run("h_heat", "stackup", "yield+10", 6), run("h_bad", "yield", "unknown+20", 4)],
     "labels": [],
     "overlay": [stamp("疊越高越難散熱", "stackup+6", "yield", "coral", 40, x=300, y=330),
                 stamp("一片壞整疊壞", "yield+4", "unknown", "coral", 44, x=300, y=330),
                 stamp("查不到", "unknown", "s8:start-2", "blue", 56, x=300, y=330),
                 {"type": "card", "at": "unknown", "until": "s8:start-2", "y": 900, "lines": ["各家良率　查不到", "截至 2026/11/19"], "size": 40, "foot": "廠商沒有公布"}]},
    ["research.md #9（截至 2026/11/16 查不到各家良率）"], pause=0.7))

# ───────────── s8 下一集 ─────────────
PKL = ['ip', 'ai', 'hm_b', 'h2', 'h3', 'band', 'card', 'hm_s0', 'hm_s1', 'hm_s2', 'hm_s3', 'hm_s4', 'hm_s5', 'hm_s6', 'hm_s7', 'hm_s8', 'hm_s9', 'hm_s10', 'hm_s11']
s8_shift = [hide_until("rk", "where-14", dy=0), hide_until("rk_tray", "where-14", dy=0), gone("card", "s8:start-2", 1)]
s8_shift += [{"layer": l, "at": "where", "until": FAR, "dz": -5.2, "dy": 2.47, "dur": 40} for l in PKL if l != "card"]
scenes.append(scene("s8", "cta", 8,
    "晶片和記憶體都拼好了，最後裝進哪裡？下一支，來看伺服器到底是什麼。想要完整解說，留言堆疊。",
    ["晶片和記憶體都拼好了", "最後裝進哪裡？", "下一支", "來看伺服器到底是什麼", "想要完整解說", "留言堆疊"],
    ["Chip and memory are assembled.", "Where do they go next?", "Next:", "what a server really is.", "For the full notes,", "comment \"堆疊\"."],
    ["拼好了", "伺服器", "堆疊"],
    [cue("done", "都拼好了"), cue("where", "裝進哪裡"), cue("next", "下一支"), cue("kw", "留言堆疊")],
    {"shot": [{"at": "start-2", "dur": 1, "x": 0, "y": 2.2, "d": 40, "elev": 26}],
     "shift": s8_shift,
     "labels": [],
     "overlay": []},
    ["下一支：11/20（五）20:00 伺服器（已排定）"]))

# ───────────── s9 片尾卡 ─────────────
scenes.append({"id": "s9", "beat": "end", "silent": True, "durationSec": 3.2, "subtitle": {"zh": "", "en": ""}, "keywords": [], "cues": [], "component": "ThreeScene",
               "props": {"endCard": {"next": "伺服器到底是什麼", "trail": ["打孔", "磨薄", "疊十二層", "HBM"], "at": "s8:kw-8", "comment": "堆疊", "logoAnim": "transparent"}}, "sources": []})

script = {
 "slug": "tech-hbm", "title": "HBM：AI 晶片要的資料太多，記憶體只好打洞、疊成一疊（科技透明圈 第 6 支）", "asOf": "2026/11/19", "styleVersion": 3, "stage": "three",
 "channel": {"name": "科技透明圈", "tag": "放大來看", "slogan": "一支講透一件事"}, "hudSkin": "light",
 "voice": {"voiceName": "Iapetus", "model": "gemini-2.5-flash-preview-tts", "mode": "take", "languageCode": "cmn-TW", "profile": "tech-b",
           "_說明": "念稿：docs/prompts/tech-hbm-旁白.txt；第一句句首的「AI」前加「現在的」避免被念成「欸」；API 整篇 1 次請求"},
 "hud": {"levels": [{"id": "pk", "label": "HBM 記憶體堆疊", "en": "HBM STACK", "field": "11 mm", "ruler": "1 mm", "art": "none", "handoff3D": True, "readout": False,
                      "note": "查證截至 2026/11/19", "noteAlways": True}],
         "theme": "dark", "schematic": {"text": "Schematic – not to scale", "zh": "示意圖，非實際比例・垂直放大・運作為示意"}, "maxLabels": 4, "smallPx": 30, "layout": "fill", "scanBand": 0.3},
 "cover": {"title": ["十二層", "比信用卡薄"], "sub": "HBM 高頻寬記憶體", "frame": 40},
 "sample": False,
 "scenes": scenes,
}
json.dump(script, open("/home/user/ai-mp4/videos/tech-hbm/script.json", "w"), ensure_ascii=False, indent=1)
print("ok", len(scenes))

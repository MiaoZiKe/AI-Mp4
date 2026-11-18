# 產生 videos/tech-icdesign/script.json（改這支再重產）
import json
HIDE = "s1:start-40"; FAR = "s10:end+400"
def off(c, n): return f"{c}{'+' if n >= 0 else '-'}{abs(n)}"
def hide_until(layer, until, dy=None, dur=2):
    d = {"layer": layer, "at": HIDE, "until": until, "opacity": 0, "dur": dur}
    if dy is not None: d["dy"] = dy
    return d
def fall(layer, until, dy=1.2, bounce=0.07, press=None):
    d = {"layer": layer, "at": HIDE, "until": until, "dy": dy, "opacity": 0, "dur": 12, "fallIn": True, "bounce": bounce}
    if press: d["press"] = press; d["pressAmt"] = 0.012
    return d
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
def scene(i, beat, para, tts, zh, en, kw, cues, props, src, pause=None):
    s = {"id": i, "beat": beat, "para": para, "narration": tts, "tts": tts,
         "subtitle": {"zh": "\n".join(zh), "en": " | ".join(en)}, "keywords": kw, "cues": cues, "component": "ThreeScene", "props": props, "sources": src}
    if pause: s["pauseAfter"] = pause
    assert len(zh) == len(en), (i, len(zh), len(en))
    for c in cues: assert c["text"] in tts, (i, c)
    return s
def sec(kind, at, until, y, h, title, tag, t, **kw):
    d = {"type": "section", "kind": kind, "at": at, "until": until, "x": 64, "y": y, "w": 952, "h": h, "avoid": False, "title": title, "tag": tag, "t": {k: {"at": v} for k, v in t.items()}}
    d.update(kw); return d
def shot(at, x, y, d, elev, dur=14, yaw=None):
    s = {"at": at, "dur": dur, "x": x, "y": y, "d": d, "elev": elev}
    if yaw is not None: s["yaw"] = yaw
    return s
STACK = ["sub", "dev", "m1", "m2", "m3", "m4", "m5"]
GAPY = 4.0
scenes = []

# ───────── s1 鉤子：晶片設計公司沒有工廠（2D 縮放第一級：整顆晶片）─────────
scenes.append(scene("s1", "hook", 1,
    "晶片設計公司沒有工廠，因為交出去的只是設計圖。",
    ["晶片設計公司沒有工廠", "因為交出去的", "只是設計圖"],
    ["A chip-design company has no factory,", "because what it hands over", "is only a design."],
    ["沒有工廠", "設計圖"],
    [cue("co", "晶片設計公司"), cue("nofab", "沒有工廠"), cue("pic", "設計圖")],
    {"hook": {"kicker": "晶片設計公司沒有工廠", "title": "只交設計圖", "size": 100, "top": 150},
     "zoom": [{"to": "chip", "at": "start-30"}],
     "overlay": [stamp("晶片設計公司", "co+4", "nofab-4", "blue", 40, style="tag", x=300, y=1296),
                 stamp("沒有工廠", "nofab", "pic-4", "coral", 64, x=800, y=1206),
                 stamp("交出去：一份設計圖", "pic", "s2:start-2", "amber", 44, style="tag", x=640, y=1296)]},
    ["來源：fabless（無晶圓廠）的通用定義"], pause=0.7))

# ───────── s2 怎麼來（放大）─────────
scenes.append(scene("s2", "mechanism", 2,
    "設計圖怎麼來？放大來看，晶片裡面有什麼。",
    ["設計圖怎麼來？", "放大來看", "晶片裡面有什麼"],
    ["Where does the design come from?", "Zoom in first:", "what is inside a chip?"],
    ["怎麼來", "放大"],
    [cue("how", "怎麼來"), cue("zoom", "放大"), cue("inside", "裡面有什麼")],
    {"overlay": [stamp("怎麼來？", "how", "zoom-6", "amber", 52, style="tag", x=330, y=1256),
                 stamp("放大來看", "zoom", "inside-4", "amber", 52, style="tag", x=330, y=1256),
                 stamp("晶片・約 1 公分", "inside", "s3:start-2", "blue", 40, style="tag", x=720, y=1296)]},
    ["示意"], pause=0.7))

# ───────── s3 縮放：功能區塊→標準元件→電晶體（交棒給 3D）─────────
scenes.append(scene("s3", "mechanism", 3,
    "晶片分成功能區塊，裡面是一行行的標準元件，每個只有幾顆電晶體。",
    ["晶片分成功能區塊", "裡面是一行行的", "標準元件", "每個只有幾顆電晶體"],
    ["A chip splits into function blocks;", "inside are rows of", "standard cells,", "each with just a few transistors."],
    ["功能區塊", "標準元件", "電晶體"],
    [cue("blk", "功能區塊"), cue("row", "一行行"), cue("cell", "標準元件"), cue("tr", "電晶體")],
    {"zoom": [{"to": "blk", "at": "row-8", "dur": 26}, {"to": "rows", "at": "cell-8", "dur": 26}, {"to": "cell", "at": "tr-12", "dur": 30}],
     "overlay": [stamp("功能區塊", "blk", "row-8", "amber", 44, style="tag", x=540, y=1296),
                 stamp("一行一行排", "row+6", "cell-8", "blue", 40, style="tag", x=720, y=1296),
                 stamp("標準元件", "cell+8", "tr-14", "blue", 40, style="tag", x=720, y=1296),
                 stamp("一顆反相器（開關）", "tr+4", "s4:start-2", "amber", 40, style="tag", x=540, y=1296)]},
    ["示意：區塊配置不是任何一顆真實晶片"], pause=0.7))

# ───────── s4 拆開：電晶體＋金屬層（2.5D 爆炸剖析、每層標名）─────────
EXP = [{"layer": l, "at": off("open", i), "until": "s6:spec-12", "dy": round(i * GAPY, 2), "dur": 22} for i, l in enumerate(STACK)]
scenes.append(scene("s4", "mechanism", 4,
    "拆開來看，電晶體在最底層，上面疊著十幾層金屬線，把它們連起來。",
    ["拆開來看", "電晶體在最底層", "上面疊著十幾層金屬線", "把它們連起來"],
    ["Take it apart:", "transistors sit at the bottom,", "a dozen-plus metal layers on top", "wire them together."],
    ["電晶體", "十幾層金屬線", "連起來"],
    [cue("open", "拆開"), cue("tr", "電晶體"), cue("top", "十幾層金屬線"), cue("link", "連起來")],
    {"shot": [shot("open-4", 0, -1, 185, 30, 26, yaw=0.5)],
     "shift": EXP,
     "run": [run("s_via1", "link", "s5:start-2", 6), run("s_via2", "link+4", "s5:start-2", 6), run("s_via3", "link+8", "s5:start-2", 6), run("s_via4", "link+12", "s5:start-2", 6), run("s_ct", "link", "s5:start-2", 6)],
     "labels": [lab("a_sub", "矽基板", "", "blue", "open+20", "s5:wire-10"), lab("a_dev", "電晶體", "", "amber", "tr", "s5:wire-10"),
                lab("a_m1", "M1", "", "amber", "top", "s5:wire-10"), lab("a_m2", "M2", "", "coral", off("top", 8), "s5:wire-10"),
                lab("a_m3", "M3", "", "blue", off("top", 16), "s5:wire-10"), lab("a_m4", "M4", "", "blue", off("top", 24), "s5:wire-10"),
                lab("a_m5", "M5 最上層", "", "blue", off("top", 30), "s5:wire-10")],
     "overlay": [stamp("示意 5 層・實際 10～15 層", "top+30", "s5:start-2", "amber", 34, style="tag", x=470, y=1296)]},
    ["來源：Semiconductor Engineering 技術文章"], pause=0.7))

# ───────── s5 訊號流動（3D 光點＋2D 側面剖面同步）─────────
scenes.append(scene("s5", "mechanism", 5,
    "訊號沿著金屬線，從最上層一層層流到電晶體，再流出去。",
    ["訊號沿著金屬線", "從最上層", "一層層流到電晶體", "再流出去"],
    ["A signal follows the metal wires,", "from the top layer,", "down layer by layer to the transistor,", "then flows out again."],
    ["金屬線", "一層層", "流出去"],
    [cue("sig", "訊號"), cue("wire", "金屬線"), cue("top", "最上層"), cue("lay", "一層層"), cue("tr", "電晶體"), cue("out", "流出去")],
    {"run": [run("s_in", "sig", off("tr", 16), 8), run("s_gate", off("tr", -6), "s6:spec-14", 10), run("s_out", "out", "s6:spec-14", 8)],
     "labels": [lab("a_in", "訊號從這裡進來", "Signal in", "amber", "top", "lay"), lab("a_via", "穿孔：連到下一層", "Via", "blue", "lay", "tr-4"), lab("a_gate", "閘極通電，開關動", "Gate switches", "amber", "tr", "out+20")],
     "overlay": [sec("ic-sec", "start+2", "s6:start-16", 930, 340, "訊號怎麼走", "示意・側面剖面", {"top": "top", "tr": "tr", "out": "out"})]},
    ["示意：金屬層數與走法簡化"], pause=0.7))

# ───────── s6 設計流程（站 D）─────────
scenes.append(scene("s6", "mechanism", 6,
    "線路太細沒辦法手畫。先定規格，再寫程式描述電路，用軟體驗證，最後排位置接線。",
    ["線路太細沒辦法手畫", "先定規格", "再寫程式描述電路", "用軟體驗證", "最後排位置接線"],
    ["Too fine to draw by hand.", "Set the spec first,", "write code that describes the circuit,", "verify it with software,", "then place and route."],
    ["手畫", "定規格", "寫程式", "接線"],
    [cue("hand", "手畫"), cue("spec", "定規格"), cue("code", "寫程式"), cue("sim", "軟體驗證"), cue("pr", "排位置"), cue("wire", "接線")],
    {"zoom": [{"to": "flow", "at": "spec-8", "dur": 20}],
     "shot": [shot("spec-6", 150, -5, 72, 55, 1, yaw=-0.5)],
     "shift": [fall("sp", "spec", dy=3.4, bounce=0.1), fall("rt", "code", dy=3.4, bounce=0.1), fall("sm", "sim", dy=3.4, bounce=0.1), fall("pr", "pr", dy=3.4, bounce=0.1), fall("mk", off("wire", 24), dy=3.4, bounce=0.1),
               hide_until("sm_cur", "sim"), hide_until("pr_r1", "pr"), hide_until("pr_r2", "wire"), hide_until("d_flow", "code"),
               {"layer": "sm_cur", "at": "sim", "until": off("pr", -4), "dx": 4.6, "dur": 40}],
     "run": [
             run("d_f0", off("code", -6), "s7:start-2", 6), run("d_f1", off("sim", -6), "s7:start-2", 6), run("d_f2", off("pr", -6), "s7:start-2", 6), run("d_f3", off("wire", 8), "s7:start-2", 6)],
     "labels": [lab("d_a0", "規格", "Spec", "amber", "spec", "code-4"), lab("d_a1", "程式（RTL）", "RTL code", "blue", "code", "sim-4"), lab("d_a2", "模擬驗證", "Simulation", "blue", "sim", "pr-4"),
                lab("d_a3", "布局繞線", "Place & route", "amber", "pr", off("wire", 24)), lab("d_a4", "光罩", "Photomask", "coral", off("wire", 28), "s7:start-8")],
     "overlay": [sec("ic-flow", "start+2", "s7:start-16", 930, 300, "從規格到版圖", "示意・五步簡化", {"hand": "hand", "spec": "spec", "code": "code", "sim": "sim", "pr": "pr", "wire": "wire"})]},
    ["AnySilicon；Wikipedia Design flow（通用流程）"], pause=0.7))

# ───────── s7 光罩曝光（站 M）─────────
scenes.append(scene("s7", "mechanism", 7,
    "畫好的圖交給晶圓廠做成光罩，光照過去，圖案縮小四倍，印在晶圓上。",
    ["畫好的圖", "交給晶圓廠做成光罩", "光照過去", "圖案縮小四倍", "印在晶圓上"],
    ["The finished layout", "goes to the fab to become a photomask.", "Light shines through,", "the pattern shrinks four times,", "and prints on the wafer."],
    ["光罩", "縮小四倍", "晶圓"],
    [cue("pic", "畫好的圖"), cue("fab", "晶圓廠"), cue("mask", "做成光罩"), cue("light", "光照過去"), cue("four", "縮小四倍"), cue("wafer", "印在晶圓上")],
    {"zoom": [{"to": "mask", "at": "start-6", "dur": 40}],
     "shot": [shot("start-2", 300, 1.5, 80, 14, 1)],
     "shift": [fall("m_mask", "mask", dy=5.0, bounce=0.08), hide_until("m_beam1", "light"), hide_until("m_beam2", "light"), hide_until("m_spot", "light"), hide_until("m_print", "wafer")],
     "run": [run("m_light", off("light", -4), "s8:start-2", 8), run("m_ray1", "light", "s8:start-2", 6), run("m_ray2", off("light", 10), "s8:start-2", 6), run("m_hit", off("wafer", -4), "s8:start-2", 8)],
     "labels": [lab("m_a_src", "光源", "Light source", "amber", "pic", "fab-6"), lab("m_a_lens", "曝光機的鏡組", "Projection lens", "blue", "fab", "mask+14"), lab("m_a_mask", "光罩", "Photomask", "amber", "mask", "light-4"),
                lab("m_a_lens", "縮小鏡組", "Reduction lens", "blue", "four", "wafer-6"), lab("m_a_print", "晶圓上的圖案", "Printed pattern", "coral", "wafer", "s8:start-8")],
     "overlay": [sec("ic-mask", "four-8", "s8:start-16", 930, 310, "光罩 vs 晶圓", "示意・常見縮小比例", {"four": "four", "wafer": "wafer"})]},
    ["來源：光罩廠 Compugraphics 說明、美國專利"], pause=0.7))

# ───────── s8 台灣誰在做（站 Z，引線指到晶片部位）─────────
scenes.append(scene("s8", "payoff", 8,
    "這些事台灣誰在做？設計服務有創意電子、世芯，矽智財有力旺、晶心科，設計軟體靠新思、益華、西門子。",
    ["這些事台灣誰在做？", "設計服務有", "創意電子・世芯", "矽智財有", "力旺・晶心科", "設計軟體靠", "新思・益華・西門子"],
    ["Who does this in Taiwan?", "Design services:", "GUC and Alchip.", "Silicon IP:", "eMemory and Andes.", "Design software:", "Synopsys, Cadence, Siemens."],
    ["創意電子", "力旺", "新思"],
    [cue("who", "誰在做"), cue("svc", "設計服務"), cue("guc", "創意電子"), cue("ip", "矽智財"), cue("em", "力旺"), cue("andes", "晶心科"), cue("eda", "設計軟體靠")],
    {"zoom": [{"to": "die", "at": "start-6", "dur": 40}],
     "shot": [shot("start-2", 454, -4, 84, 36, 1, yaw=0.0)],
     "shift": [],
     "labels": [lab("z_die", "創意、世芯：設計服務", "", "amber", "svc", "ip-6"), lab("z_mem", "力旺：記憶體矽智財", "", "blue", "em", "andes-6"), lab("z_cpu", "晶心科：CPU 智財", "", "blue", "andes", "eda-6"),
                lab("z_mon", "三大 EDA：設計軟體", "", "amber", "eda", "s9:start-8")],
     "overlay": [sec("ic-who", "start+2", "s9:start-16", 930, 300, "台灣誰在做", "示意・媒體報導", {"guc": "svc", "em": "ip", "eda": "eda"})]},
    ["媒體報導：數位時代、科技新報、工商時報"], pause=0.7))

# ───────── s9 結尾 ─────────
scenes.append(scene("s9", "cta", 9,
    "不過設計好了，還得有人做出來。下一支，晶圓代工有哪幾家。想要完整解說，留言 IC 設計。",
    ["不過設計好了", "還得有人做出來", "下一支", "晶圓代工有哪幾家", "想要完整解說", "留言 IC 設計"],
    ["But a finished design", "still has to be built.", "Next:", "which foundries are there?", "For the full notes,", "comment \"IC設計\"."],
    ["做出來", "晶圓代工", "IC 設計"],
    [cue("done", "設計好了"), cue("make", "做出來"), cue("next", "下一支"), cue("fab2", "晶圓代工"), cue("full", "想要完整解說"), cue("kw", "留言")],
    {"run": [run("z_glow", "make", "s10:start", 8)],
     "labels": [lab("z_die", "設計好的晶片", "The finished design", "amber", "done", "next-6")],
     "overlay": [sec("ic-next", "start+2", "kw-14", 930, 300, "接下來", "示意", {"make": "make", "next": "fab2"}), stamp("完整解說在留言", "full", "kw-14", "blue", 36, x=780, y=336, avoid=False)]},
    ["下一支：晶圓代工有哪幾家（已排定）"]))

scenes.append({"id": "s10", "beat": "end", "silent": True, "durationSec": 3.2, "subtitle": {"zh": "", "en": ""}, "keywords": [], "cues": [], "component": "ThreeScene",
               "props": {"endCard": {"next": "晶圓代工", "trail": ["晶片版圖", "金屬層", "設計流程", "光罩"], "at": "s9:kw-8", "comment": "IC設計", "logoAnim": "transparent"}}, "sources": []})

NOTE = "查證截至 2026/11/18"
def lvl(i, label, en, field, ruler, art, **kw):
    d = {"id": i, "label": label, "en": en, "field": field, "ruler": ruler, "art": art}; d.update(kw); return d
script = {
 "slug": "tech-icdesign", "title": "IC 設計：一顆晶片怎麼從規格變成光罩（科技透明圈 第 10 支）", "asOf": "2026/11/18", "styleVersion": 3, "stage": "three",
 "channel": {"name": "科技透明圈", "tag": "放大來看", "slogan": "一支講透一件事"}, "hudSkin": "light",
 "voice": {"voiceName": "Iapetus", "model": "gemini-2.5-flash-preview-tts", "mode": "take", "languageCode": "cmn-TW", "profile": "tech-b",
           "_說明": "念稿：docs/prompts/tech-icdesign-旁白.txt；整篇 1 次請求"},
 "hud": {"levels": [lvl("chip", "一顆晶片", "DIE", "12 mm", "2 mm", "ic-die", note=NOTE, noteAlways=True),
                    lvl("blk", "一個區塊", "BLOCK", "480 µm", "100 µm", "ic-blk", note=NOTE, noteAlways=True),
                    lvl("rows", "標準元件", "STANDARD CELLS", "6 µm", "1 µm", "ic-rows", note=NOTE, noteAlways=True),
                    lvl("cell", "電晶體與金屬線", "TRANSISTOR + METAL", "400 nm", "100 nm", "ic-cell", handoff3D=True, note=NOTE, noteAlways=True),
                    lvl("flow", "設計流程", "DESIGN FLOW", "30 cm", "10 cm", "none", readout=False, note=NOTE, noteAlways=True),
                    lvl("mask", "光罩曝光", "PHOTOMASK EXPOSURE", "20 cm", "5 cm", "none", readout=False, note=NOTE, noteAlways=True),
                    lvl("die", "整顆晶片", "FULL CHIP", "30 cm", "10 cm", "none", readout=False, note=NOTE, noteAlways=True)],
         "theme": "dark", "schematic": {"text": "Schematic – not to scale", "zh": "示意圖，非實際比例"}, "maxLabels": 8, "smallPx": 30, "layout": "fill", "scanBand": 0.3},
 "cover": {"title": ["設計晶片", "沒有工廠"], "sub": "IC 設計", "frame": 40},
 "sample": False, "scenes": scenes,
}
json.dump(script, open("/home/user/ai-mp4/videos/tech-icdesign/script.json", "w"), ensure_ascii=False, indent=1)
print("ok", len(scenes), "字數", sum(len(s.get("tts", "")) for s in scenes))

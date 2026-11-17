# 產生 videos/tech-800v/script.json
import json
RX, CXX, DXX = 0, 60, 120
HIDE = "s1:start-40"      # 一開始就藏起來的起點
FAR = "s10:end+400"

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
SH_R = {"x": 1.4, "y": 3.5, "d": 36, "elev": 20}
SH_R2 = {"x": 2.6, "y": 0.7, "d": 42, "elev": 20}
SH_C = {"x": CXX + 0.2, "y": 0.0, "d": 46, "elev": 16}
SH_D = {"x": DXX + 0.2, "y": 0.4, "d": 46, "elev": 18}
SH_B = {"x": 180, "y": -1.8, "d": 27, "elev": 44}
def card(kind, at, until, t, y=905, h=345, title="", tag="示意，非實際比例"):
    return {"type": "section", "kind": kind, "at": at, "until": until, "x": 64, "y": y, "w": 952, "h": h, "avoid": False, "title": title, "tag": tag, "t": {k: {"at": v} for k, v in t.items()}}
ZOOM = [{"to": "pk", "at": "start-2", "dur": 1}]

# s1（每句一個事件）：rack 機櫃標籤、bar 銅排與電流、kg 發熱＋200 kg、why 問號、volt 電壓
s1_shift = [hide_until("busN", "s7:use"), hide_until("sc", "s7:use-30", dy=0)]
for k in range(6): s1_shift.append(fall(f"tr{k}", off("start", 4 + 4 * k), dy=1.6 + 0.2 * k, bounce=0.05))
scenes.append(scene("s1", "hook", 1,
    "一百萬瓦的 AI 機櫃，光送電的銅條，廠商估計就要兩百公斤。為什麼？答案在電壓。",
    ["一百萬瓦的 AI 機櫃", "光送電的銅條", "廠商估計就要兩百公斤", "為什麼？", "答案在電壓"],
    ["A one-megawatt AI rack,", "just the copper to feed it,", "is estimated at 200 kilograms.", "Why?", "The answer is voltage."],
    ["兩百公斤", "電壓"],
    [cue("rack", "AI 機櫃"), cue("bar", "銅條"), cue("kg", "兩百公斤"), cue("why", "為什麼"), cue("volt", "電壓")],
    {"hook": {"kicker": "1 MW 機櫃｜廠商估算", "title": "銅排 200 公斤", "size": 120, "top": 236},
     "zoom": [{"to": "pk", "at": "start-30", "dur": 1}], "shot": [{"at": "start-30", "dur": 1, **SH_R}], "shift": s1_shift,
     "run": [run("r_fan", "start", "s2:start-2", 8), run("r_shelf", "rack", "s2:start-2", 8), run("r_air3", "start+10", "s2:start-2", 6),
             run("r_cur", "bar", "s2:start-2", 10), run("r_cur2", "bar", "s2:start-2", 10), run("r_hot", "kg-8", "s2:start-2", 40), run("r_heat", "kg", "s2:start-2", 6)],
     "labels": [lab("rk_frame", "AI 機櫃 1 MW", "1 MW AI rack", "blue", "rack", "s2:start-12"), lab("rk_bus", "銅排", "busbar", "blue", "bar", "kg"), lab("rk_bus", "約 200 kg", "≈ 200 kg", "amber", "kg", "s2:start-12")],
     "overlay": [stamp("廠商估算", "kg+4", "s2:start-12", "amber", 44, x=830, y=330), stamp("？", "why", "volt", "coral", 96, x=250, y=560, avoid=False), stamp("電壓", "volt", "s2:start-12", "blue", 64, x=250, y=560, avoid=False)]},
    ["NVIDIA 2025/5；Tom's Hardware（約 200 kg）"], pause=0.7))

# s2：now 電源架、v54 五十幾伏特、fat 很粗的銅條（電流＋夾片）、busbar 銅排
s2_run = [run("r_fan", "start-2", "s3:start-2", 4), run("r_shelf", "now", "s3:start-2", 6), run("r_air3", "start-2", "s3:start-2", 4), run("r_air", "v54", "s3:start-2", 6), run("r_air2", "v54+10", "s3:start-2", 6),
          run("r_cur", "fat", "s3:start-2", 8), run("r_cur2", "fat", "s3:start-2", 8), run("r_hot", "fat", "s3:start-2", 30)]
for k in range(6):
    s2_run.append(run(f"r_br{k}", off("fat", 10 + 6 * k), "s3:start-2", 4)); s2_run.append(run(f"r_bl{k}", off("fat", 10 + 6 * k), "s3:start-2", 4))
scenes.append(scene("s2", "you", 2,
    "現在機櫃裡的電，只有五十幾伏特，靠很粗的銅條送進去，叫銅排。",
    ["現在機櫃裡的電", "只有五十幾伏特", "靠很粗的銅條送進去", "叫銅排"],
    ["Inside today's rack,", "the power is only about 50 volts,", "pushed in through thick copper bars", "called busbars."],
    ["五十幾伏特", "銅排"],
    [cue("now", "機櫃裡的電"), cue("v54", "五十幾伏特"), cue("fat", "很粗的銅條"), cue("busbar", "銅排")],
    {"zoom": ZOOM, "shot": [{"at": "start-2", "dur": 14, **SH_R, "x": 0.8, "d": 33}], "run": s2_run,
     "labels": [lab("rk_shelf", "電源架", "power shelf", "amber", "now", "v54"), lab("rk_shelf", "54 V", "54 V", "amber", "v54", "s3:start-12"), lab("rk_bus", "粗銅條", "thick copper", "blue", "fat", "busbar"), lab("rk_bus", "銅排", "busbar", "blue", "busbar", "s3:start-12")],
     "overlay": []},
    ["NVIDIA 技術部落格 2025/5；SemiAnalysis"]))

# s3：power「P＝」、vxi「V×I」、low 電壓低、big 電流大
scenes.append(scene("s3", "mechanism", 3,
    "功率等於電壓乘電流。電壓低，電流就得很大。",
    ["功率等於", "電壓乘電流", "電壓低", "電流就得很大"],
    ["Power equals", "voltage times current.", "With low voltage,", "the current has to be huge."],
    ["電壓乘電流", "很大"],
    [cue("power", "功率等於"), cue("vxi", "電壓乘電流"), cue("low", "電壓低"), cue("big", "很大")],
    {"zoom": ZOOM, "shot": [{"at": "start-2", "dur": 1, **SH_C}],
     "run": [run("c_srcU", "power", "s6:start-2", 8), run("c_lampU", "vxi", "s6:start-2", 10), run("c_up", "big-6", "s6:start-2", 8)],
     "labels": [lab("c_up", "54 V 供電", "54 V supply", "amber", "low", "s4:start-2")],
     "overlay": [card("pw-compare", "start+2", "s6:start-14", {"power": "power", "vxi": "vxi", "low": "low", "big": "big", "cur": "s4:cur", "hot": "s4:hot", "thick": "s4:thick", "x15": "s4:x15", "x219": "s4:x219", "v800": "s5:v800", "amp": "s5:amp", "thin": "s5:thin"}, title="同樣的電，兩種電壓")]},
    ["P＝V×I；1 MW÷54 V≈18,519 A（算式）"], pause=0.7))

# s4：cur 電流大、hot 銅排就燙、thick 越做越粗、x15 十五倍（800 V 欄）、x219 兩百多倍
scenes.append(scene("s4", "mechanism", 4,
    "電流大，銅排就燙，只好越做越粗。電流大十五倍，發熱大兩百多倍。",
    ["電流大", "銅排就燙", "只好越做越粗", "電流大十五倍", "發熱大兩百多倍"],
    ["Big current", "heats the busbar,", "so it keeps getting thicker.", "Fifteen times the current", "means over two hundred times the heat."],
    ["發熱", "兩百多倍"],
    [cue("cur", "電流大"), cue("hot", "銅排就燙"), cue("thick", "越做越粗"), cue("x15", "十五倍"), cue("x219", "兩百多倍")],
    {"shot": [{"at": "start-2", "dur": 1, **SH_C}],
     "run": [run("c_hot", "hot-6", "s6:start-2", 40), run("c_heat", "hot", "s6:start-2", 6), run("c_heat2", "hot+8", "s6:start-2", 6), run("c_srcD", "x15-6", "s6:start-2", 8), run("c_dn", "x15", "s5:thin", 8), run("c_lampD", "x15+6", "s6:start-2", 10)],
     "labels": [lab("c_up", "電流大", "big current", "coral", "cur", "hot"), lab("c_up", "燙", "hot", "coral", "hot", "thick"), lab("c_up", "越做越粗", "ever thicker", "amber", "thick", "x15"), lab("c_dn", "800 V 供電", "800 V supply", "blue", "x15", "s5:start-2")],
     "overlay": [stamp("×219", "x219", "s5:start-2", "coral", 56, x=830, y=330)]},
    ["P＝I²R；14.8²≈219（算式，同一條銅排）"], pause=0.7))

# s5：v800 八百伏特、amp 十五分之一、thin 做細
scenes.append(scene("s5", "mechanism", 5,
    "改成八百伏特，電流只剩十五分之一，銅排就能做細。",
    ["改成八百伏特", "電流只剩十五分之一", "銅排就能做細"],
    ["Switch to 800 volts,", "the current drops to one fifteenth,", "so the busbar can be thin."],
    ["八百伏特", "做細"],
    [cue("v800", "八百伏特"), cue("amp", "十五分之一"), cue("thin", "做細")],
    {"shot": [{"at": "start-2", "dur": 1, **SH_C}],
     "shift": [{"layer": "cdB", "at": "thin-4", "until": FAR, "opacity": 0, "dy": -0.6, "dur": 8}, hide_until("cdT", "thin+4", dy=1.4)],
     "run": [run("c_dnT", "thin+16", "s6:start-2", 6)],
     "labels": [lab("c_dn", "800 V", "800 V", "blue", "v800", "amp"), lab("c_dn", "電流 1/15", "current 1/15", "blue", "amp", "thin"), lab("c_thin", "截面約 1/15", "≈1/15 cross-section", "blue", "thin+10", "s6:start-2")],
     "overlay": [stamp("估算", "amp", "s6:start-2", "blue", 40, x=860, y=330)]},
    ["電流密度相同時，截面與電流成正比（估算）"], pause=0.7))

# s6：why 高壓（總覽）、chip 晶片近景＋降壓一級怎麼做、hi 800 V、steps 降到約 50 V、many 降到約 12 V 再到晶片
scenes.append(scene("s6", "twist", 6,
    "那以前為什麼不用高壓？因為晶片只吃很低的電壓，電壓越高，中間要降壓的次數越多。",
    ["那以前為什麼不用高壓", "因為晶片只吃很低的電壓", "電壓越高", "中間要降壓的次數越多"],
    ["So why not use high voltage before?", "Because the chip needs very low voltage.", "The higher the voltage,", "the more times it must be stepped down."],
    ["很低的電壓", "降壓"],
    [cue("why", "為什麼不用高壓"), cue("chip", "晶片只吃很低"), cue("hi", "電壓越高"), cue("steps", "降壓的次數"), cue("many", "越多")],
    {"zoom": ZOOM, "shot": [{"at": "start-2", "dur": 1, **SH_D}, {"at": "chip-4", "dur": 14, **SH_B}, {"at": "hi-4", "dur": 14, **SH_D}],
     "run": [run("d_pS", "why", "s7:start-2", 8),
             run("d_bin", "chip", "hi-4", 6), run("d_bzT", "chip+6", "hi-4", 6), run("d_bzB", "chip+6", "hi-4", 6), run("d_bxT", "chip+14", "hi-4", 6), run("d_bxB", "chip+14", "hi-4", 6), run("d_bmosG", "chip+18", "hi-4", 6),
             run("d_bsT", "chip+24", "hi-4", 6), run("d_bsB", "chip+24", "hi-4", 6), run("d_bdieG", "chip+32", "hi-4", 8), run("d_bheat", "chip+36", "hi-4", 6), run("d_bair", "chip+8", "hi-4", 6),
             run("d_f1", "hi", "s7:start-2", 6), run("d_f2", "steps", "s7:start-2", 6), run("d_pA", "steps", "s7:start-2", 8), run("d_hA", "steps+6", "s7:start-2", 6), run("d_air", "steps", "s7:start-2", 6),
             run("d_f3", "many", "s7:start-2", 6), run("d_pB", "many-4", "s7:start-2", 8), run("d_hB", "many+6", "s7:start-2", 6), run("d_pC", "many+10", "s7:start-2", 8)],
     "labels": [lab("d_sc", "800 V", "800 V", "amber", "why", "chip-6"), lab("b_die", "晶片 約 1 V", "chip, ~1 V", "blue", "chip+30", "hi-6"), lab("b_ind", "電感", "inductor", "amber", "chip+16", "hi-6"), lab("b_mos", "開關晶片", "switch chip", "amber", "chip+4", "hi-6"),
                lab("d_sc", "800 V", "800 V", "amber", "hi", "s7:start-14"), lab("d_a", "約 50 V", "~50 V", "amber", "steps", "s7:start-14"), lab("d_b", "約 12 V", "~12 V", "amber", "many", "s7:start-14")],
     "overlay": [card("pw-vrm", "chip", "hi-8", {"chip": "chip"}, title="降一級怎麼做", tag="示意：降壓一級的原理"),
                 card("pw-chain", "hi", "s7:start-14", {"why": "hi", "chip": "many", "hi": "hi", "steps": "steps", "many": "many"}, title="電壓逐級降下來", tag="示意：常見路徑之一，各家不同")]},
    ["Power Systems Design；Arrow 2026/8（晶片約 1 V）"], pause=0.7))

# s7：y2027 2027 規劃、use 開始改用（側櫃滑入、銅排換細）、tw 台達電（電源櫃＋電源架引線）、lite 光寶科（電源櫃引線）、cab 電源櫃
scenes.append(scene("s7", "payoff", 7,
    "廠商規劃二零二七年開始改用。台灣的台達電和光寶科，也在做這種電源櫃。",
    ["廠商規劃二零二七年", "開始改用", "台灣的台達電和光寶科", "也在做這種電源櫃"],
    ["The makers plan 2027", "for the switch.", "In Taiwan, Delta and Lite-On", "are building these power cabinets too."],
    ["二零二七年", "台達電", "光寶科"],
    [cue("y2027", "二零二七年"), cue("use", "開始改用"), cue("tw", "台達電"), cue("lite", "光寶科"), cue("cab", "電源櫃")],
    {"zoom": ZOOM, "shot": [{"at": "start-2", "dur": 1, **SH_R2}],
     "shift": [{"layer": "sc", "at": "s1:start-40", "until": "use", "dx": 5, "opacity": 0, "dur": 26},
               {"layer": "busT", "at": "use+30", "until": FAR, "opacity": 0, "dy": -0.4, "dur": 8},
               hide_until("busN", "use+36", dy=1.6, dur=10)],
     "run": [run("r_scglow", "use+10", "s8:start-2", 8), run("r_fan", "start-2", "s8:start-2", 4), run("r_sc", "use+40", "s8:start-2", 6), run("r_curN", "use+44", "s8:start-2", 8), run("r_curN2", "use+44", "s8:start-2", 8), run("r_shelf", "tw", "s8:start-2", 8), run("r_air3", "start", "s8:start-2", 4)],
     "labels": [lab("rk_sc", "台達電 電源櫃", "Delta cabinet", "amber", "tw", "s8:start-2"), lab("rk_shelf", "台達電 電源架", "Delta power shelf", "amber", "tw+8", "s8:start-2"), lab("rk_sc2", "光寶科 電源櫃", "Lite-On cabinet", "blue", "lite", "s8:start-2")],
     "overlay": [stamp("2027 廠商規劃", "y2027", "use+20", "amber", 40, x=770, y=330), stamp("媒體報導", "tw", "s8:start-2", "blue", 40, x=790, y=330)]},
    ["NVIDIA 2025/5；科技新報 2026/3/28"]))

# s8：save 省多少（？）、none 廠商目標值、real 非實測
scenes.append(scene("s8", "twist", 8,
    "整套能省多少，目前還沒有實際機房的數字。",
    ["整套能省多少", "目前還沒有", "實際機房的數字"],
    ["How much the whole system saves", "is not yet known:", "there are no real data-center figures."],
    ["沒有", "數字"],
    [cue("save", "能省多少"), cue("none", "還沒有"), cue("real", "實際機房")],
    {"zoom": ZOOM, "shot": [{"at": "start-2", "dur": 1, **SH_R2}],
     "run": [run("r_scglow", "start-2", "s9:start-2", 4), run("r_fan", "start-2", "s9:start-2", 4), run("r_sc", "start-2", "s9:start-2", 4), run("r_curN", "start-2", "s9:start-2", 4), run("r_curN2", "start-2", "s9:start-2", 4)],
     "labels": [],
     "overlay": [card("pw-unk", "save-2", "s9:start-14", {"save": "save", "none": "none", "real": "real"}, y=905, h=345, title="整套能省多少", tag="廠商目標值")]},
    ["NVIDIA 2025/5（目標最多降 30% 總持有成本）"], pause=0.7))

# s9：so 所以、up 電壓拉高、small 電流變小、slim 銅條就能細、full 想要完整解說、kw 留言供電、next 下一支
scenes.append(scene("s9", "cta", 9,
    "所以，電壓拉高，電流變小，銅條就能細。想要完整解說，留言供電。下一支，晶片設計公司為什麼沒有工廠。",
    ["所以", "電壓拉高", "電流變小", "銅條就能細", "想要完整解說", "留言供電", "下一支", "晶片設計公司為什麼沒有工廠"],
    ["So,", "raise the voltage,", "the current shrinks,", "and the copper can be thin.", "For the full notes,", "comment \"供電\".", "Next:", "why a chip-design company has no factory."],
    ["電壓拉高", "電流變小", "銅條就能細"],
    [cue("so", "所以"), cue("up", "電壓拉高"), cue("small", "電流變小"), cue("slim", "銅條就能細"), cue("full", "完整解說"), cue("kw", "留言供電"), cue("next", "下一支")],
    {"zoom": ZOOM, "shot": [{"at": "start-2", "dur": 1, **SH_R2}],
     "run": [run("r_scglow", "start-2", "s10:start-2", 4), run("r_fan", "start-2", "s10:start-2", 4), run("r_sc", "start-2", "s10:start-2", 4), run("r_curN", "slim", "s10:start-2", 6), run("r_curN2", "slim", "s10:start-2", 6)],
     "labels": [lab("rk_thin", "細銅排", "thin busbar", "blue", "slim", "full")],
     "overlay": [card("pw-sum", "so-2", "full-6", {"so": "so", "up": "up", "small": "small", "slim": "slim"}, y=905, h=345, title="一句話", tag="示意"),
                 stamp("完整解說", "full", "kw", "amber", 52, x=300, y=330, avoid=False), stamp("留言「供電」", "kw", "s10:start-2", "amber", 56, x=300, y=330, avoid=False)]},
    ["下一支：11/23（一）晶片設計公司（已排定）"]))

scenes.append({"id": "s10", "beat": "end", "silent": True, "durationSec": 3.2, "subtitle": {"zh": "", "en": ""}, "keywords": [], "cues": [], "component": "ThreeScene",
               "props": {"endCard": {"next": "晶片設計公司為什麼沒有工廠", "trail": ["電壓", "電流", "銅排", "降壓"], "at": "s9:next", "comment": "供電", "logoAnim": "transparent"}}, "sources": []})
script = {
 "slug": "tech-800v", "title": "八百伏特：AI 機櫃為什麼要把電壓拉高（科技透明圈 第 9 支）", "asOf": "2026/11/22", "styleVersion": 3, "stage": "three",
 "channel": {"name": "科技透明圈", "tag": "放大來看", "slogan": "一支講透一件事"}, "hudSkin": "light",
 "voice": {"voiceName": "Iapetus", "model": "gemini-2.5-flash-preview-tts", "mode": "take", "languageCode": "cmn-TW", "profile": "tech-b",
           "_說明": "念稿：docs/prompts/tech-800v-旁白.txt；句首無英文字母；API 整篇 1 次請求"},
 "hud": {"levels": [{"id": "pk", "label": "AI 機櫃供電", "en": "RACK POWER", "field": "約 2 m", "ruler": "10 cm", "art": "none", "handoff3D": True, "readout": False,
                      "note": "查證截至 2026/11/22", "noteAlways": True}],
         "theme": "dark", "schematic": {"text": "Schematic – not to scale", "zh": "示意圖，非實際比例・電流與發熱為示意"}, "maxLabels": 4, "smallPx": 30, "layout": "fill", "scanBand": 0.3},
 "cover": {"title": ["銅排", "200 公斤"], "sub": "八百伏特供電", "frame": 40},
 "sample": False,
 "scenes": scenes,
}
json.dump(script, open("/home/user/ai-mp4/videos/tech-800v/script.json", "w"), ensure_ascii=False, indent=1)
print("ok", len(scenes))

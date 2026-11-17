# 產生 videos/tech-deposition/script.json（改這支再重產）
import json
TX, CX, WX, SX, VX, AX, EX = 0, 60, 120, 180, 240, 300, 360
HIDE = "s1:start-40"; FAR = "s10:end+400"
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
def shot(at, x, y, d, elev, dur=14): return {"at": at, "dur": dur, "x": x, "y": y, "d": d, "elev": elev}
scenes = []
U = "s10:start"  # 片尾卡
def ald_runs(c, a0, a1, pa0, pa1, b0, b1, pb0, pb1):
    """第 c 圈：A 氣、吹掉、B 氣、吹掉的時間窗"""
    out = []
    for x, t0, t1 in (("A", a0, a1), ("PA", pa0, pa1), ("B", b0, b1), ("PB", pb0, pb1)):
        for sfx in ("t", "i"): out.append(run(f"a_{x}{c}{sfx}", t0, t1, 4))
    return out

# ───────── s1 鉤子（T 機台） ─────────
scenes.append(scene("s1", "hook", 1,
    "晶片裡有一層膜，只有幾個原子那麼薄。它是怎麼長上去的？",
    ["晶片裡有一層膜", "只有幾個原子那麼薄", "它是怎麼長上去的？"],
    ["Inside a chip is a film", "only a few atoms thin.", "How does it get grown on?"],
    ["一層膜", "幾個原子", "長上去"],
    [cue("film", "一層膜"), cue("thin", "幾個原子"), cue("how", "怎麼長上去")],
    {"hook": {"kicker": "原子級｜怎麼長上去？", "title": "幾個原子厚", "size": 120, "top": 236},
     "zoom": [{"to": "tool", "at": "start-30", "dur": 1}],
     "shot": [shot("start-30", TX + 1.0, -0.5, 100, 30, 1)],
     "run": [run("t_spin", "start-30", "s3:start", 8), run("t_ledlit", "film", "s2:start-2", 6), run("t_modlit", "how", "s3:start", 8)],
     "labels": [lab("t_foup", "晶圓盒", "Wafer carrier", "blue", "film", "thin-10"), lab("t_mod", "反應腔", "Chamber", "amber", "how", "s2:start-2"), lab("t_core", "機械手臂", "Robot arm", "coral", "thin", "how-8")],
     "overlay": [sec("dep-scale", "film-4", "s2:start-2", 920, 330, "一層膜有多薄", "示意：依原子間距換算", {"film": "film", "thin": "thin", "how": "how"})]},
    ["物性換算（原子間距）；清大博士論文"], pause=0.7))

# ───────── s2 沉積是什麼（T→C） ─────────
scenes.append(scene("s2", "mechanism", 2,
    "蝕刻挖出溝槽後，要把材料鋪回去，這叫薄膜沉積，在反應腔裡進行。",
    ["蝕刻挖出溝槽後", "要把材料鋪回去", "這叫薄膜沉積", "在反應腔裡進行"],
    ["After etching cuts the trenches,", "material must be laid back down.", "This is thin-film deposition,", "done inside a reaction chamber."],
    ["蝕刻", "薄膜沉積", "反應腔"],
    [cue("etch", "蝕刻挖出溝槽後"), cue("back", "鋪回去"), cue("dep", "薄膜沉積"), cue("cham", "反應腔")],
    {"zoom": [{"to": "chamber", "at": "cham-6", "dur": 40}],
     "shot": [shot("start-4", TX + 1.0, -0.5, 96, 30, 24), shot("cham-2", CX, 3.4, 70, 22, 28)],
     "run": [run("t_spin", "start-30", "s3:start", 8), run("t_modlit", "dep", "s3:start", 8)],
     "labels": [lab("t_mod", "反應腔", "Chamber", "amber", "dep", "dep+30")],
     "overlay": [sec("dep-step", "start+2", "cham-24", 960, 250, "製程裡的位置", "蝕刻之後", {"etch": "etch", "back": "back", "dep": "dep"})]},
    ["製程通則；上一支：蝕刻機"], pause=0.7))

# ───────── s3 反應腔爆炸剖析（C，運作動畫 A） ─────────
EXP_END = "s4:start-4"
scenes.append(scene("s3", "mechanism", 3,
    "噴氣頭灑下氣體，晶圓躺在加熱座上，用過的氣體從底下抽走。",
    ["噴氣頭灑下氣體", "晶圓躺在加熱座上", "用過的氣體從底下抽走"],
    ["The showerhead sprays gas down,", "the wafer lies on a heated stage,", "and used gas is pumped out below."],
    ["噴氣頭", "加熱座", "抽走"],
    [cue("shower", "噴氣頭"), cue("wafer", "晶圓躺"), cue("heat", "加熱座"), cue("pump", "底下抽走")],
    {"zoom": [{"to": "chamber", "at": "start-6", "dur": 1}],
     "shot": [shot("start-2", CX + 2.0, 3.4, 70, 22, 1)],
     "shift": [{"layer": "ch_lid", "at": "start+4", "until": EXP_END, "dy": 6.0, "dur": 22}, {"layer": "ch_sh", "at": "start+12", "until": EXP_END, "dy": 3.2, "dur": 22},
               {"layer": "cwf", "at": "start+20", "until": EXP_END, "dy": 1.4, "dur": 22}, {"layer": "ch_pump", "at": "start+4", "until": EXP_END, "dx": 2.0, "dur": 22}],
     "run": [run("c_in", "shower-6", EXP_END, 8), run("c_show", "shower+4", EXP_END, 8), run("c_showb", "shower+4", EXP_END, 8), run("ch_hot", "heat-8", EXP_END, 12),
             run("c_outL", "pump", EXP_END, 8), run("c_outR", "pump", EXP_END, 8)],
     "labels": [lab("ch_in", "進氣管", "Gas inlet", "blue", "start+16", "shower+6"), lab("ch_sh", "噴氣頭", "Showerhead", "amber", "shower", "pump-6"), lab("ch_wf", "晶圓", "Wafer", "coral", "wafer", "pump-6"),
                lab("ch_ht", "加熱座", "Heated stage", "amber", "heat", "pump-6"), lab("ch_stub", "抽氣口", "Pump port", "blue", "pump", EXP_END)],
     "overlay": [sec("dep-chamber", "start+2", "s4:start-16", 930, 340, "反應腔剖面", "示意，非實際比例", {"open": "start", "shower": "shower", "wafer": "wafer", "pump": "pump"})]},
    ["單片沉積腔通則；各廠機型說明"], pause=0.7))

# ───────── s4 CVD（W，運作動畫 B） ─────────
scenes.append(scene("s4", "mechanism", 4,
    "做法不只一種，最常見的是化學氣相沉積，氣體碰到熱晶圓起反應，固體留下長成膜。",
    ["做法不只一種", "最常見的是化學氣相沉積", "氣體碰到熱晶圓起反應", "固體留下長成膜"],
    ["There are several ways.", "The most common is chemical vapor deposition:", "gas meets the hot wafer and reacts,", "and the solid left behind grows into a film."],
    ["化學氣相沉積", "起反應", "長成膜"],
    [cue("many", "做法不只一種"), cue("cvd", "化學氣相沉積"), cue("react", "起反應"), cue("solid", "固體留下")],
    {"zoom": [{"to": "surface", "at": "start-4", "dur": 40}],
     "shot": [shot("start-2", WX, 0.9, 44, 14, 1)],
     "shift": [hide_until("w_f1", "react+12", dur=8), hide_until("w_f2", "solid+10", dur=8), hide_until("w_f3", "solid+44", dur=8)],
     "run": [run("w_ga", "cvd", "s5:start-2", 6), run("w_gb", "cvd+6", "s5:start-2", 6), run("w_gta", "cvd+14", "s5:start-2", 6), run("w_gtb", "cvd+20", "s5:start-2", 6),
             run("w_hot", "react-10", "s5:start-2", 12), run("w_by", "react+10", "s5:start-2", 6), run("w_by2", "react+16", "s5:start-2", 6)],
     "labels": [lab("w_trench", "晶圓表面的溝槽（放大）", "Trench on the wafer", "blue", "many", "cvd-6"), lab("w_gas", "兩種氣體", "Two gases", "amber", "cvd", "react-6"),
                lab("w_hot", "熱晶圓", "Hot wafer", "coral", "react", "solid-4"), lab("w_film", "長出的膜", "Growing film", "amber", "solid", "s5:start-8")],
     "overlay": [sec("dep-cvd", "start+2", "s5:start-16", 930, 330, "氣體在表面反應", "示意，非實際比例", {"cvd": "cvd", "react": "react", "solid": "solid"})]},
    ["semiengineering；Wevolver（CVD 原理）"], pause=0.7))

# ───────── s5 濺鍍（S，運作動畫 C） ─────────
scenes.append(scene("s5", "mechanism", 5,
    "另一種是濺鍍，離子撞向金屬靶材，打出的原子落到晶圓上。",
    ["另一種是濺鍍", "離子撞向金屬靶材", "打出的原子落到晶圓上"],
    ["Another is sputtering:", "ions slam into a metal target,", "and the atoms knocked loose land on the wafer."],
    ["濺鍍", "靶材", "原子"],
    [cue("spu", "濺鍍"), cue("ion", "離子撞向"), cue("target", "靶材"), cue("atom", "打出的原子"), cue("land", "落到晶圓上")],
    {"zoom": [{"to": "chamber", "at": "start-4", "dur": 40}],
     "shot": [shot("start-2", SX, 2.7, 58, 14, 1)],
     "shift": [hide_until("s_f", "land+14", dur=10)],
     "run": [run("s_glow", "spu", "s6:start-2", 10), run("s_ion", "ion", "s6:start-2", 6), run("s_ionb", "ion", "s6:start-2", 6),
             run("s_at", "atom", "s6:start-2", 6), run("s_atb", "atom+4", "s6:start-2", 6), run("s_atc", "atom+8", "s6:start-2", 6), run("s_atd", "atom+12", "s6:start-2", 6)],
     "labels": [lab("s_ion", "氬離子", "Argon ions", "blue", "ion", "target-4"), lab("s_tgt", "金屬靶材", "Metal target", "amber", "target", "land+10"), lab("s_film", "鍍上去的膜", "Deposited film", "coral", "land", "s6:start-6")],
     "overlay": [sec("dep-pvd", "start+2", "s6:start-16", 930, 340, "濺鍍：離子撞靶", "示意，非實際比例", {"spu": "spu", "ion": "ion", "target": "target", "atom": "atom", "land": "land"})]},
    ["Wevolver；Kindle-Tech（濺鍍原理）"], pause=0.7))

# ───────── s6 對照（V） ─────────
scenes.append(scene("s6", "twist", 6,
    "但溝槽又深又窄，這兩種不容易鋪均勻，所以先進製程改用原子層沉積。",
    ["但溝槽又深又窄", "這兩種不容易鋪均勻", "所以先進製程", "改用原子層沉積"],
    ["But the trenches are deep and narrow,", "so neither method coats evenly.", "That's why advanced nodes", "switch to atomic layer deposition."],
    ["又深又窄", "鋪均勻", "原子層沉積"],
    [cue("deep", "又深又窄"), cue("uneven", "不容易鋪均勻"), cue("adv", "先進製程"), cue("ald", "原子層沉積")],
    {"zoom": [{"to": "surface", "at": "start-4", "dur": 30}],
     "shot": [shot("start-2", VX, 1.8, 62, 14, 1)],
     "shift": [hide_until("v_pvd", "uneven+6", dur=10), hide_until("v_ald", "ald+4", dur=10)],
     "labels": [lab("v_tr", "又深又窄的溝槽", "Deep, narrow trench", "blue", "deep", "uneven-4"), lab("v_top", "頂端鋪得厚", "Thick on top", "coral", "uneven+10", "ald-6"), lab("v_side", "側壁鋪得薄", "Thin on the wall", "coral", "uneven+22", "ald-6"),
                lab("v_even", "每一面一樣厚", "Even on every face", "amber", "ald+12", "s7:start-6")],
     "overlay": [sec("dep-cmp", "start+2", "s7:start-16", 930, 340, "兩種鋪法對照", "示意，非實際比例", {"deep": "deep", "uneven": "uneven", "ald": "ald"})]},
    ["semiengineering；科技新報專訪 ASM（GAA 深寬比高）"], pause=0.7))

# ───────── s7 ALD（A，運作動畫 D） ─────────
scenes.append(scene("s7", "mechanism", 7,
    "兩種氣體輪流進來，第一種貼滿一層，多的吹掉，第二種再反應，一圈只長一層原子。",
    ["兩種氣體輪流進來", "第一種貼滿一層", "多的吹掉", "第二種再反應", "一圈只長一層原子"],
    ["Two gases take turns.", "The first covers one layer,", "the extra is blown away,", "the second reacts with it,", "and each cycle adds one layer of atoms."],
    ["輪流進來", "貼滿一層", "吹掉", "一層原子"],
    [cue("turn", "輪流進來"), cue("a", "第一種"), cue("full", "貼滿一層"), cue("purge", "多的吹掉"), cue("b", "第二種"), cue("one", "一層原子")],
    {"zoom": [{"to": "surface", "at": "start-4", "dur": 30}],
     "shot": [shot("start-2", AX, 0.9, 44, 14, 1)],
     "shift": [hide_until("a_A0", "full+4", dur=8), hide_until("a_B0", "b+30", dur=8), hide_until("a_A1", "one+10", dur=8), hide_until("a_B1", "one+22", dur=8), hide_until("a_A2", "one+34", dur=8), hide_until("a_B2", "one+46", dur=8)],
     "run": ald_runs(1, "a", "full+8", "purge", "b-4", "b", "b+30", "b+34", "one+4") + ald_runs(2, "one+6", "one+16", "one+16", "one+20", "one+20", "one+30", "one+30", "one+34") + ald_runs(3, "one+32", "one+40", "one+40", "one+44", "one+44", "one+52", "one+52", "one+60"),
     "labels": [lab("a_gas", "A 氣體（藍）", "Gas A", "blue", "a", "purge-4"), lab("a_gas", "B 氣體（橘）", "Gas B", "amber", "b", "one-6"), lab("a_film", "一圈長一層", "One layer per cycle", "coral", "one", "s8:start-6")],
     "overlay": [sec("dep-ald", "start+2", "s8:start-16", 930, 340, "一圈四步驟", "示意，非實際比例", {"turn": "turn", "a": "a", "full": "full", "purge": "purge", "b": "b", "one": "one"})]},
    ["semiengineering；Beneq；ASM"], pause=0.7))

# ───────── s8 誰在做（T→S→T，引線） ─────────
scenes.append(scene("s8", "payoff", 8,
    "機台有應用材料、科林研發、東京威力科創、ASM。台灣光洋科做靶材，京鼎供應應用材料設備。",
    ["機台有應用材料、科林研發", "東京威力科創、ASM", "台灣光洋科做靶材", "京鼎供應應用材料設備"],
    ["Tool makers: Applied Materials, Lam Research,", "Tokyo Electron and ASM.", "In Taiwan, Solar Applied makes targets,", "and Foxsemicon supplies Applied's equipment."],
    ["應用材料", "光洋科", "京鼎"],
    [cue("am", "應用材料"), cue("lam", "科林研發"), cue("tel", "東京威力科創"), cue("asm", "ASM"), cue("gy", "光洋科"), cue("jd", "京鼎")],
    {"zoom": [{"to": "tool", "at": "start-4", "dur": 30}],
     "shot": [shot("start-2", TX + 1.0, -0.5, 100, 30, 1)],
     "run": [run("t_spin", "start-4", "s9:start", 8), run("t_modlit", "am", "s9:start", 8)],
     "labels": [lab("t_body", "沉積機台", "Deposition tools", "amber", "am", "gy-12"), lab("t_tgt", "光洋科：靶材", "Targets", "amber", "gy", "jd-10"), lab("t_modR", "京鼎：設備", "Equipment supplier", "blue", "jd", "s9:start-6")],
     "overlay": [sec("dep-co", "start+2", "s9:start-16", 930, 330, "誰在做", "媒體報導／廠商公布", {"am": "am", "lam": "lam", "tel": "tel", "asm": "asm", "gy": "gy", "jd": "jd"})]},
    ["TechInsights；ASM 年報；科技新報；聯合報"], pause=0.7))

# ───────── s9 結尾（E） ─────────
scenes.append(scene("s9", "cta", 9,
    "所以這層膜，是氣體一層層長的。但長完會凹凸不平，所以下一支，看化學機械研磨，磨到比鏡子還平。留言沉積，看完整解說。",
    ["所以這層膜", "是氣體一層層長的", "但長完會凹凸不平", "所以下一支", "看化學機械研磨", "磨到比鏡子還平", "留言沉積", "看完整解說"],
    ["So this film", "is grown from gas, layer by layer.", "But afterwards the surface is bumpy,", "so next:", "chemical mechanical polishing,", "grinding flatter than a mirror.", "Comment \"沉積\"", "for the full notes."],
    ["一層層長", "凹凸不平", "磨到比鏡子還平", "沉積"],
    [cue("grow", "一層層長"), cue("bump", "凹凸不平"), cue("next", "下一支"), cue("cmp", "化學機械研磨"), cue("flat", "比鏡子還平"), cue("kw", "留言沉積"), cue("full", "看完整解說")],
    {"zoom": [{"to": "surface", "at": "start-4", "dur": 30}],
     "shot": [shot("start-2", EX, 1.4, 44, 16, 1)],
     "shift": [hide_until("e_bump", "bump-4", dur=10), hide_until("e_flat", "flat+4", dur=10), hide_until("e_pad", "cmp-12", dy=1.4, dur=14),
               {"layer": "e_bump", "at": "flat-6", "until": FAR, "opacity": 0, "dur": 8},
               {"layer": "e_pad", "at": "cmp+6", "until": "flat+4", "dy": -1.4, "dur": 24}, {"layer": "e_pad", "at": "flat+8", "until": FAR, "opacity": 0, "dur": 8}],
     "run": [run("e_padglow", "cmp+6", "flat+10", 6)],
     "labels": [lab("e_bump", "長完高低不平", "Bumpy after deposition", "coral", "bump", "next-4"), lab("e_pad", "研磨墊", "Polishing pad", "blue", "cmp", "flat+4")],
     "overlay": [sec("dep-step", "start+2", "kw-14", 940, 250, "接下來", "下一支：研磨", {"etch": "start", "back": "start", "dep": "start"}), stamp("留言「沉積」", "kw", "kw+60", "blue", 36, x=780, y=336, avoid=False)]},
    ["製程通則（沉積後需平坦化）；下一支：化學機械研磨"]))

# ───────── s10 片尾卡 ─────────
scenes.append({"id": "s10", "beat": "end", "silent": True, "durationSec": 3.2, "subtitle": {"zh": "", "en": ""}, "keywords": [], "cues": [], "component": "ThreeScene",
               "props": {"endCard": {"next": "化學機械研磨", "trail": ["化學氣相", "濺鍍", "原子層"], "at": "s9:kw-8", "comment": "沉積", "logoAnim": "transparent"}}, "sources": []})

NOTE = "查證截至 2026/11/18"
script = {
 "slug": "tech-deposition", "title": "薄膜沉積：一層幾個原子厚的膜怎麼長上去（科技透明圈）", "asOf": "2026/11/18", "styleVersion": 3, "stage": "three",
 "channel": {"name": "科技透明圈", "tag": "放大來看", "slogan": "一支講透一件事"}, "hudSkin": "light",
 "voice": {"voiceName": "Iapetus", "model": "gemini-2.5-flash-preview-tts", "mode": "take", "languageCode": "cmn-TW", "profile": "tech-b",
           "_說明": "念稿：docs/prompts/tech-deposition-旁白.txt；整篇 1 次請求"},
 "hud": {"levels": [{"id": "tool", "label": "沉積機台", "en": "DEPOSITION TOOL", "field": "3 m", "ruler": "1 m", "art": "none", "handoff3D": True, "readout": True, "note": NOTE, "noteAlways": True},
                    {"id": "chamber", "label": "反應腔", "en": "CHAMBER", "field": "30 cm", "ruler": "10 cm", "art": "none", "readout": True, "note": NOTE, "noteAlways": True},
                    {"id": "surface", "label": "晶圓表面溝槽", "en": "WAFER TRENCH", "field": "300 nm", "ruler": "100 nm", "art": "none", "readout": True, "note": NOTE, "noteAlways": True}],
         "theme": "dark", "schematic": {"text": "Schematic – not to scale", "zh": "示意圖，非實際比例"}, "maxLabels": 4, "smallPx": 30, "layout": "fill", "scanBand": 0.3},
 "cover": {"title": ["幾個原子厚", "怎麼長上去"], "sub": "薄膜沉積", "frame": 40},
 "sample": False, "scenes": scenes,
}
json.dump(script, open("/home/user/ai-mp4/videos/tech-deposition/script.json", "w"), ensure_ascii=False, indent=1)
print("ok", len(scenes), "字數", sum(len(s["tts"]) for s in scenes if "tts" in s))

# 產生 videos/tech-metrology/script.json。旁白／字幕／cue 是前製（Sonnet）定稿，不改；3D 分鏡 props 由建模（Opus）依 visual-spec.md 補。
# 站別座標見 genmodel.py：T x=0、F x=60、E x=120、O x=180、D x=240、P x=300
import json, math
TX, FX, EX, OX, DX, PX = 0, 60, 120, 180, 240, 300
HIDE = "s1:start-40"; FAR = "s10:end+400"
def cue(i, t): return {"id": i, "text": t}
def scene(i, beat, tts, zh, en, kw, cues, props, src, pause=0.7):
    assert len(zh) == len(en), (i, len(zh), len(en))
    for c in cues: assert c["text"] in tts, (i, c)
    s = {"id": i, "beat": beat, "para": int(i[1:]), "narration": tts, "tts": tts,
         "subtitle": {"zh": "\n".join(zh), "en": " | ".join(en)}, "keywords": kw, "cues": cues,
         "component": "ThreeScene", "props": props, "sources": src}
    if pause: s["pauseAfter"] = pause
    return s
def off(c, n): return f"{c}{'+' if n >= 0 else '-'}{abs(n)}"
def run(i, at, until=None, ramp=6, **kw):
    d = {"id": i, "at": at, "ramp": ramp}
    if until: d["until"] = until
    d.update(kw); return d
def lab(part, text, en, color, at, until): return {"part": part, "text": text, "en": en, "color": color, "at": at, "until": until}
def stamp(text, at, until, color="amber", size=44, rot=-4, **kw):
    d = {"type": "stamp", "at": at, "until": until, "text": text, "color": color, "size": size, "rot": rot}; d.update(kw); return d
def sec(kind, at, until, y, h, title, tag, t, **kw):
    d = {"type": "section", "kind": kind, "at": at, "until": until, "x": 64, "y": y, "w": 952, "h": h, "avoid": False, "title": title, "tag": tag, "t": {k: {"at": v} for k, v in t.items()}}
    d.update(kw); return d
def shot(at, x, y, d, elev, dur=14): return {"at": at, "dur": dur, "x": x, "y": y, "d": d, "elev": elev}
def hid(layer, a, b, dur=2): return {"layer": layer, "at": a, "until": b, "opacity": 0, "dur": dur}
def mv(layer, at, until, dur=14, dx=0, dy=0, dz=0, spring=None, **kw):
    d = {"layer": layer, "at": at, "until": until, "dur": dur, "dx": dx, "dy": dy, "dz": dz}
    if spring: d["spring"] = spring
    d.update(kw); return d
def fall(layer, until, dy=1.4, bounce=.08, press=None):
    d = {"layer": layer, "at": HIDE, "until": until, "dy": dy, "opacity": 0, "dur": 12, "fallIn": True, "bounce": bounce}
    if press: d["press"] = press; d["pressAmt"] = .02
    return d
SPR = {"tau": 7, "period": 18}

# ── 各站「什麼時候看得到」（同一份放進每一幕，引擎只認一次也沒關係：shift 是全片的） ──
VIS = [
 # P：s1 先只有磨平的膜（m2 還沒疊上去）；量測頭 s1 掃過後離開
 fall("p_m2", "s1:two", dy=1.6, press=["p_m1"]), hid("p_mark", HIDE, "s1:nm-2"), hid("p_mark", "s2:start", FAR),
 hid("p_probe", "s1:two-6", FAR), hid("p_def", HIDE, "s2:defect-2"),
 # F：晶圓載台把晶圓送到量測點（減速、微回彈）
 mv("f_wf", HIDE, "s3:start+2", dur=2, dx=-5.0, spring=SPR), mv("f_stage", HIDE, "s3:start+2", dur=2, dx=0),
 # E：下段電子束（會擺動）等「掃過去」才出現
 hid("e_beam", HIDE, "s4:scan-2"),
 # O：上層光柵先錯開一點（歪），s5 拆開時上下拉開
 hid("o_opt", HIDE, "s5:light-8", dur=6), hid("o_lite", HIDE, "s5:light-8", dur=6),
 # D：缺陷被光帶掃到才出現；s9 換一片乾淨的晶圓：缺陷消失、放行環與離子源出現
 hid("d_ok", HIDE, "s9:ok-2"), fall("d_ion", "s9:ion-14", dy=2.0),
 # T：資料線上的訊號、手臂夾的晶圓（缺陷點）
]

# ── 疊對：上層光柵歪 0.35（s5 two 之後），量完不修（修正是 s7 的事） ──
# ── 缺陷：光帶從後往前掃（dz＝9.6，40 幀緩入緩出），掃到誰誰出現 ──
SZ0, SPAN, SCAN_DUR = -4.8, 9.6, 40
DEFZ = [-2.2, -1.0, .4, 1.6, 2.3]
def ease_inv(e):
    lo, hi = 0.0, 1.0
    for _ in range(40):
        m = (lo + hi) / 2; v = 4 * m ** 3 if m < .5 else 1 - (-2 * m + 2) ** 3 / 2
        lo, hi = (m, hi) if v < e else (lo, m)
    return lo
DEF_AT = [round(ease_inv((z - SZ0) / SPAN) * SCAN_DUR) for z in DEFZ]
for i, n in enumerate(DEF_AT):
    VIS.append(hid(f"d_def{i}", HIDE, off("s6:fast", -4 + n)))
    VIS.append(hid(f"d_def{i}", "s9:start-2", FAR))

S = []
# ───────── s1 鉤子（P：磨平的膜 → 兩層線路差兩奈米） ─────────
S.append(scene("s1", "hook", "磨平之後，還要量量看到底平不平。兩層線路疊起來，只差兩奈米左右，這要怎麼量？",
  ["磨平之後", "還要量量看到底平不平", "兩層線路疊起來", "只差兩奈米左右", "這要怎麼量？"],
  ["After polishing,", "we still check whether it is really flat.", "Stacked, two layers of wiring", "are off by only about 2 nm.", "So how do we measure that?"],
  ["量量看", "兩奈米", "怎麼量"],
  [cue("flat", "磨平之後"), cue("check", "量量看到底平不平"), cue("two", "兩層線路疊起來"), cue("nm", "只差兩奈米左右"), cue("ask", "這要怎麼量")],
  {"hook": {"kicker": "接上一支｜磨平後", "title": "兩奈米都不能歪", "size": 120, "top": 236},
   "zoom": [{"to": "pattern", "at": "start-30", "dur": 1}],
   "shot": [shot("start-30", PX, 1.1, 66, 18, 1), shot("nm-6", PX + 1.0, 1.4, 58, 16, 26)],
   "shift": VIS + [mv("p_probe", "start", FAR, dur=70, dx=9.0)],
   "run": [run("p_probeLt", "start", "two-8", 4), run("p_markOn", "nm", "s2:start", 6)],
   "labels": [lab("p_flat", "磨平的膜", "Polished film", "blue", "flat+4", "two-4"), lab("p_probe", "量量看平不平", "Check flatness", "amber", "check", "two-12"),
              lab("p_m2", "上層線路", "Upper wiring", "coral", "two+10", "s2:start-4"), lab("p_m1", "下層線路", "Lower wiring", "blue", "two+16", "nm-4"), lab("p_mark", "只差約兩奈米", "About 2 nm off", "amber", "nm", "s2:start-4")],
   "overlay": [sec("met-prev", "flat+4", "s2:start-2", 930, 330, "上一支：磨平之後", "示意，非實際比例", {"flat": "flat", "check": "check", "two": "two", "nm": "nm", "ask": "ask"})]},
  ["疊對約 2 奈米：SEMI Engineering"]))

# ───────── s2 一層層做（P：爆炸剖析、每層標名；前面歪→後面白做→每一步都量→找缺陷） ─────────
EXP = [("p_tr", 1.4), ("p_m1", 2.8), ("p_m2", 4.2), ("p_def", 4.2)]
s2_shift = [mv(l, off("layer", 2 + 5 * k), "s3:start", dur=22, dy=dy) for k, (l, dy) in enumerate(EXP)] + [mv("p_m1", "early", "s3:start", dur=12, dx=.7, spring=None)]
S.append(scene("s2", "you", "晶圓一層層做，前面歪了，後面全白做，所以每一步都要量，還要找缺陷。",
  ["晶圓一層層做", "前面歪了", "後面全白做", "所以每一步都要量", "還要找缺陷"],
  ["Wafers are built layer by layer.", "If an early step drifts,", "everything after is wasted,", "so every step gets measured,", "and checked for defects."],
  ["一層層", "每一步", "缺陷"],
  [cue("layer", "一層層做"), cue("early", "前面歪了"), cue("waste", "後面全白做"), cue("every", "每一步都要量"), cue("defect", "還要找缺陷")],
  {"zoom": [{"to": "pattern", "at": "start-4", "dur": 1}],
   "shot": [shot("start-2", PX, 2.0, 60, 18, 1), shot("layer+2", PX, 3.4, 74, 18, 24)],
   "shift": s2_shift,
   "run": [run("p_m1bad", "early", "every-4", 6), run("p_waste", "waste", "every-4", 8)] + [run(f"p_ok{k}", off("every", 8 * k), "s3:start", 6) for k in range(4)] + [run("p_defOn", "defect", "s3:start", 6)],
   "labels": [lab("p_si", "矽基板", "Silicon", "blue", "layer+4", "early-2"), lab("p_tr", "電晶體層", "Transistors", "amber", "layer+10", "early-2"), lab("p_m1", "前面這層歪了", "This layer drifted", "coral", "early", "every-4"),
              lab("p_m2", "後面全白做", "All wasted", "coral", "waste", "every-4"), lab("p_tr", "每一層都量", "Measure every layer", "blue", "every+8", "s3:start-4"), lab("p_def", "缺陷", "Defect", "amber", "defect", "s3:start-4")],
   "overlay": [sec("met-layer", "start+2", "s3:start-2", 930, 340, "一層層做，一步歪全白做", "示意", {"ly": "layer", "early": "early", "waste": "waste", "every": "every", "defect": "defect"})]},
  ["製程通則"]))

# ───────── s3 膜厚（F：載台送到量測點 → 光打在膜上 → 表面／底部各反射 → 疊起來亮暗 → 光譜儀算厚度） ─────────
S.append(scene("s3", "mechanism", "先量厚度。光打在膜上，表面和底部各反射一次，兩道光疊起來，亮暗不同，就算得出厚度。",
  ["先量厚度", "光打在膜上", "表面和底部各反射一次", "兩道光疊起來", "亮暗不同", "就算得出厚度"],
  ["First, thickness.", "Light hits the film,", "reflecting once off the top and once off the bottom.", "The two beams overlap,", "bright or dark depending on thickness,", "and that gives the thickness."],
  ["厚度", "各反射一次", "亮暗"],
  [cue("thick", "先量厚度"), cue("hit", "光打在膜上"), cue("refl", "各反射一次"), cue("overlap", "兩道光疊起來"), cue("bd", "亮暗不同"), cue("calc", "算得出厚度")],
  {"zoom": [{"to": "wafer", "at": "start-4", "dur": 1}],
   "shot": [shot("start-2", FX + .6, 2.4, 84, 10, 1), shot("refl-4", FX + 1.0, 3.2, 76, 10, 30)],
   "run": [run("f_lampOn", "hit-10", "s4:start", 6), run("f_in", "hit", "s4:start", 6), run("f_hitP", "hit+6", "refl", 6), run("f_r1", "refl", "s4:start", 6), run("f_r2", "refl+8", "s4:start", 6),
           run("f_fringe", "overlap", "s4:start", 8), run("f_specOn", "bd", "s4:start", 8), run("f_wave", "bd", "s4:start", 10)],
   "labels": [lab("f_film", "膜：要量多厚", "Film thickness", "blue", "thick", "refl-4"), lab("f_lamp", "光源", "Light source", "amber", "hit", "overlap-4"), lab("f_pol", "偏振片", "Polarizer", "blue", "hit+10", "overlap-4"),
              lab("f_top", "表面反射", "Top reflection", "amber", "refl", "bd-4"), lab("f_bot", "底部反射", "Bottom reflection", "blue", "refl+8", "bd-4"),
              lab("f_det", "兩道光疊起來", "Beams overlap", "coral", "overlap", "calc-4"), lab("f_spec", "光譜儀：亮暗→厚度", "Spectrometer", "amber", "bd", "s4:start-4"), lab("f_si", "矽基板", "Silicon", "blue", "calc", "s4:start-4")],
   "overlay": [sec("met-film", "start+2", "s4:start-2", 930, 340, "光怎麼量出厚度", "示意，非實際比例", {"hit": "hit", "refl": "refl", "overlap": "overlap", "bd": "bd", "calc": "calc"})]},
  ["膜厚量測：halbleiter.org；橢圓偏光說明"]))

# ───────── s4 線寬（E：CD-SEM 鏡柱） ─────────
S.append(scene("s4", "mechanism", "再量線寬。電子束掃過去，從跑出來的電子，看出線的邊緣，就量得出寬度。",
  ["再量線寬", "電子束掃過去", "從跑出來的電子", "看出線的邊緣", "就量得出寬度"],
  ["Next, line width.", "An electron beam scans across,", "and from the electrons that come out,", "it finds the edges of each line,", "so the width can be measured."],
  ["線寬", "電子束", "邊緣"],
  [cue("cd", "再量線寬"), cue("scan", "電子束掃過去"), cue("el", "跑出來的電子"), cue("edge", "線的邊緣"), cue("wid", "量得出寬度")],
  {"zoom": [{"to": "wafer", "at": "start-4", "dur": 1}, {"to": "pattern", "at": "el", "dur": 30}],
   "shot": [shot("start-2", EX, 3.8, 90, 10, 1), shot("el-4", EX + 1.0, 3.0, 78, 12, 30)],
   "run": [run("e_gunOn", "start", "s5:start", 6), run("e_pri", "scan-8", "s5:start", 6), run("e_scan", "scan", "s5:start", 10), run("e_deflOn", "scan", "s5:start", 6)]
          + [run(f"e_sec{k}", off("el", 3 * k), "s5:start", 6) for k in range(4)] + [run("e_edgeOn", "el+6", "s5:start", 6), run("e_wave", "edge", "s5:start", 10)],
   "labels": [lab("e_gun", "電子槍", "Electron gun", "amber", "cd", "el-4"), lab("e_cond", "聚光鏡", "Condenser lens", "blue", "cd+10", "el-4"), lab("e_defl", "偏轉線圈：讓束掃動", "Scan coils", "coral", "scan", "el-4"), lab("e_obj", "物鏡", "Objective lens", "blue", "scan+12", "el-4"),
              lab("e_det", "偵測器", "Detector", "amber", "el", "s5:start-4"), lab("e_edge", "邊緣：電子特別多", "Edges glow", "coral", "edge", "s5:start-4"), lab("e_line", "線寬", "Line width", "blue", "wid", "s5:start-4")],
   "overlay": [sec("met-cd", "start+2", "s5:start-2", 930, 340, "電子束怎麼量線寬", "示意，非實際比例", {"scan": "scan", "el": "el", "edge": "edge", "wid": "wid"})]},
  ["CD-SEM：SemiconductorX；日立／應材 CD-SEM 說明"]))

# ───────── s5 疊對（O：兩層光柵、0 與 ±1 階、兩邊亮度） ─────────
S.append(scene("s5", "mechanism", "接著量疊對。兩層各刻一組紋路，光打上去，兩邊反射的亮度不同，差多少，就是歪多少。",
  ["接著量疊對", "兩層各刻一組紋路", "光打上去", "兩邊反射的亮度不同", "差多少", "就是歪多少"],
  ["Then, overlay.", "Each layer carries its own set of lines.", "Light hits them,", "and the two sides reflect different brightness.", "The difference", "is how far off they are."],
  ["疊對", "紋路", "歪多少"],
  [cue("ov", "接著量疊對"), cue("two", "兩層各刻一組紋路"), cue("light", "光打上去"), cue("diff", "兩邊反射的亮度不同"), cue("how", "差多少"), cue("off", "就是歪多少")],
  {"zoom": [{"to": "pattern", "at": "start-4", "dur": 1}],
   "shot": [shot("start-2", OX, -1.2, 58, 16, 1), shot("two+24", OX, 2.4, 82, 10, 26)],
   "shift": [mv("o_up", "ov+8", "light-14", dur=18, dy=2.6), mv("o_mid", "ov+8", "light-14", dur=18, dy=1.3), mv("o_up", "two+30", FAR, dur=16, dx=.4)],
   "run": [run("o_in", "light", "s6:start", 6), run("o_m0", "light+10", "s6:start", 6), run("o_p1", "diff-6", "s6:start", 6, gain=1.0), run("o_n1", "diff-6", "s6:start", 6, gain=.45),
           run("o_detPon", "diff", "s6:start", 8, gain=1.0), run("o_detNon", "diff", "s6:start", 8, gain=.35), run("o_offOn", "how", "s6:start", 6)],
   "labels": [lab("o_up", "上層紋路", "Upper grating", "coral", "two", "two+22"), lab("o_lo", "下層紋路", "Lower grating", "blue", "two+8", "two+22"),
              lab("o_detP", "這邊比較亮", "Brighter", "coral", "diff", "s6:start-4"), lab("o_detN", "這邊比較暗", "Dimmer", "blue", "diff+8", "s6:start-4"), lab("o_off", "錯開量＝歪多少", "Offset", "coral", "how", "s6:start-4")],
   "overlay": [sec("met-ovl", "start+2", "s6:start-2", 930, 340, "兩層歪了多少", "示意，非實際比例", {"two": "two", "light": "light", "diff": "diff", "how": "how", "off": "off"})]},
  ["繞射式疊對：SPIE、ASML 官網"]))

# ───────── s6 缺陷（D：光學快速掃 → 色點 → 電子束逐點複檢） ─────────
S.append(scene("s6", "twist", "最後找缺陷。光學掃得快但看不細，電子束看得細卻很慢，所以先用光學找出可疑處，再用電子束看清楚。",
  ["最後找缺陷", "光學掃得快但看不細", "電子束看得細卻很慢", "所以先用光學找出可疑處", "再用電子束看清楚"],
  ["Last, defects.", "Optical scans fast but not finely.", "E-beam sees fine detail but is slow.", "So optical flags the suspects first,", "then the e-beam takes a close look."],
  ["缺陷", "光學", "電子束"],
  [cue("def", "最後找缺陷"), cue("fast", "光學掃得快"), cue("fine", "電子束看得細"), cue("slow", "卻很慢"), cue("so", "先用光學找出可疑處"), cue("look", "再用電子束看清楚")],
  {"zoom": [{"to": "wafer", "at": "start-4", "dur": 1}, {"to": "pattern", "at": "fine+10", "dur": 24}, {"to": "wafer", "at": "so-6", "dur": 20}, {"to": "pattern", "at": "look+6", "dur": 24}],
   "shot": [shot("start-2", DX, -1.2, 58, 32, 1), shot("fine+4", DX - 1.8, -.6, 34, 30, 22), shot("so-6", DX, -1.2, 58, 32, 22), shot("look+4", DX - .6, -.6, 34, 30, 22)],
   "shift": [mv("d_scan", "fast-4", "fine-14", dur=SCAN_DUR, dz=SPAN),
             mv("d_rev", "fine-8", "s9:start", dur=22, dx=(DX - 1.8) - (DX + 4.0), dz=-2.2 - 3.4, spring=SPR), mv("d_rev", "look-8", "s9:start", dur=22, dx=1.2, dz=2.6)],
   "run": [run("d_bandOn", "fast-6", "fine-8", 6), run("d_dotsOn", "fast+10", "s7:start", 6), run("d_rBeamE", "fine+12", "so-4", 6), run("d_rBeamE", "look+14", "s7:start", 6)],
   "labels": [lab("d_wf", "整片晶圓", "Whole wafer", "blue", "def", "fast-4"), lab("d_head", "光學：掃得快、看不細", "Optical: fast", "amber", "fast", "fine-6"), lab("d_map", "可疑處（色點）", "Suspect spots", "coral", "fast+20", "fine-6"),
              lab("d_def0", "電子束：看得細、很慢", "E-beam: fine, slow", "blue", "fine+20", "so-8"), lab("d_map", "先找出可疑處", "Flag suspects", "coral", "so", "look-4"), lab("d_def2", "再看清楚：一顆顆粒", "Close look: a particle", "blue", "look+20", "s7:start-10")],
   "overlay": [sec("met-def", "start+2", "s7:start-2", 930, 340, "快的先找，細的再看", "示意", {"fast": "fast", "fine": "fine", "slow": "slow", "so": "so", "look": "look"})]},
  ["SemiconductorX；SEMVision 說明"]))

# ───────── s7 回饋（T：量測機→資料線→曝光機修正；缺陷晶圓→手臂→檢出盒） ─────────
S.append(scene("s7", "payoff", "量到歪了，數字送回曝光機修正；量到缺陷，就把那片挑出來。",
  ["量到歪了", "數字送回曝光機修正", "量到缺陷", "就把那片挑出來"],
  ["If it is off,", "the numbers go back to the scanner to correct.", "If there is a defect,", "that wafer is pulled out."],
  ["送回", "修正", "挑出來"],
  [cue("off", "量到歪了"), cue("back", "數字送回曝光機修正"), cue("bad", "量到缺陷"), cue("pull", "挑出來")],
  {"zoom": [{"to": "tool", "at": "start-4", "dur": 30}],
   "shot": [shot("start-2", TX - 11.0, -1.0, 150, 24, 1), shot("bad-20", TX + 5.0, -2.5, 64, 30, 26)],
   "shift": [mv("s_stage", "back+36", "back+40", dur=8, dx=.5, spring={"tau": 6, "period": 14})],
   "motion": [{"preset": "arm-transfer", "arm": "ar", "at": "bad-24", "item": "a_wf", "grab": .65, "put": -.8, "raise": .15}],
   "run": [run("m_leds", "start-30", "s10:start", 2), run("t_data", "back-4", "bad", 6)],
   "labels": [lab("t_optL", "量到歪了", "Offset measured", "coral", "off", "back-4"), lab("t_data", "數字送回去", "Data sent back", "blue", "back", "bad-14"), lab("t_scan", "曝光機：修正位置", "Scanner corrects", "amber", "back+10", "bad-14"),
              lab("t_arm", "有缺陷的晶圓", "Defective wafer", "coral", "bad", "pull-4"), lab("t_bin", "挑出來：檢出盒", "Pulled out", "coral", "pull", "s8:start-4")],
   "overlay": [sec("met-loop", "start+2", "s8:start-2", 930, 340, "量完之後", "示意", {"off": "off", "back": "back", "bad": "bad", "pull": "pull"})]},
  ["量測回饋曝光機：SEMI Engineering"]))

# ───────── s8 誰在做（T：引線指到部位） ─────────
S.append(scene("s8", "payoff", "疊對有科磊和艾司摩爾，電子束有應用材料和日立先端科技，台灣有華洋精機和牧德。",
  ["疊對有科磊和艾司摩爾", "電子束有應用材料", "和日立先端科技", "台灣有華洋精機和牧德"],
  ["Overlay: KLA and ASML.", "E-beam: Applied Materials", "and Hitachi High-Tech.", "In Taiwan: Hwa Yang Precision and MAK Tech."],
  ["科磊", "應用材料", "華洋精機", "牧德"],
  [cue("kla", "科磊"), cue("asml", "艾司摩爾"), cue("am", "應用材料"), cue("hit", "日立先端科技"), cue("tw", "台灣有"), cue("hy", "華洋精機"), cue("mak", "牧德")],
  {"zoom": [{"to": "tool", "at": "start-4", "dur": 30}],
   "shot": [shot("start-2", TX + .5, -1.4, 110, 22, 18)],
   "labels": [lab("t_insp", "科磊：疊對、缺陷檢測", "KLA", "amber", "kla", "am-4"), lab("t_optL", "艾司摩爾：疊對量測", "ASML", "blue", "asml", "hit-4"),
              lab("t_sem", "應用材料：電子束複檢、線寬", "Applied Materials", "coral", "am", "tw-4"), lab("t_semR", "日立先端科技：線寬", "Hitachi High-Tech", "blue", "hit", "hy-4"),
              lab("t_ret", "華洋精機（台）：光罩微粒檢測", "Hwa Yang (TW)", "amber", "hy", "s9:start-4"), lab("t_wf", "牧德（台）：晶圓外觀檢查", "MAK Tech (TW)", "coral", "mak", "s9:start-4")],
   "overlay": [sec("met-co", "start+2", "s9:start-2", 965, 300, "誰在做", "各公司官網、媒體報導", {"kla": "kla", "asml": "asml", "am": "am", "hit": "hit", "hy": "hy", "mak": "mak"})]},
  ["各公司官網與科技新報、工商時報"]))

# ───────── s9 結尾（D：乾淨的晶圓放行 → 離子束預告） ─────────
S.append(scene("s9", "cta", "量過沒問題，才放行。接下來，要用離子把雜質打進夕裡，才控制得了導電。下一支，看離子佈植。留言量測，看完整解說。",
  ["量過沒問題", "才放行", "接下來", "要用離子把雜質打進矽裡", "才控制得了導電", "下一支", "看離子佈植", "留言量測", "看完整解說"],
  ["Once it checks out,", "it moves on.", "Next,", "ions drive impurities into the silicon", "to control how it conducts.", "Next up:", "ion implantation.", "Comment \"量測\"", "for the full notes."],
  ["放行", "離子佈植", "量測"],
  [cue("ok", "量過沒問題"), cue("go", "才放行"), cue("next", "接下來"), cue("ion", "用離子"), cue("imp", "雜質"), cue("cond", "控制得了導電"), cue("nx", "下一支"), cue("ii", "看離子佈植"), cue("kw", "留言量測"), cue("full", "看完整解說")],
  {"zoom": [{"to": "wafer", "at": "start-4", "dur": 1}],
   "shot": [shot("start-2", DX, -1.2, 58, 30, 1), shot("next-4", DX, .8, 70, 18, 30)],
   "run": [run("d_okOn", "ok", "next+10", 8), run("d_ions", "ion", "s10:start", 8)],
   "labels": [lab("d_wf", "量過沒問題", "Checked OK", "blue", "ok", "next-4"), lab("d_ion", "離子：帶正電", "Ions (+)", "coral", "ion", "nx-4"), lab("d_map", "雜質打進矽裡", "Dopants go in", "amber", "imp", "nx-4")],
   "overlay": [stamp("放行", "go", "next+6", "blue", 64, x=860, y=330, avoid=False),
               sec("met-step", "start+2", "kw-14", 940, 250, "接下來", "下一支：離子佈植", {"cmp": "ok", "met": "go", "next": "nx"}),
               stamp("留言「量測」", "kw", "kw+60", "blue", 36, x=780, y=336, avoid=False)]},
  ["系列：離子佈植"], pause=None))
S.append({"id": "s10", "beat": "end", "silent": True, "durationSec": 3.2, "subtitle": {"zh": "", "en": ""}, "keywords": [], "cues": [], "component": "ThreeScene",
  "props": {"endCard": {"next": "離子佈植", "trail": ["離子", "佈植", "導電"], "at": "s9:kw-8", "comment": "量測", "logoAnim": "transparent"}}, "sources": []})
NOTE = "查證截至 2026/11/20"
script = {
 "slug": "tech-metrology", "title": "量測與檢測：每做完一步，都要量一次（科技透明圈）", "asOf": "2026/11/20", "styleVersion": 3, "stage": "three",
 "channel": {"name": "科技透明圈", "tag": "放大來看", "slogan": "一支講透一件事"}, "hudSkin": "light",
 "voice": {"voiceName": "Iapetus", "model": "gemini-3.8-flash-tts", "mode": "take", "languageCode": "cmn-TW", "profile": "tech-b",
           "_說明": "念稿：docs/prompts/tech-metrology-旁白.txt；整篇 1 次請求"},
 "hud": {"levels": [
   {"id": "tool", "label": "量測檢測機台", "en": "METROLOGY TOOL", "field": "3 m", "ruler": "1 m", "art": "none", "handoff3D": True, "readout": True, "note": NOTE, "noteAlways": True},
   {"id": "wafer", "label": "晶圓", "en": "WAFER", "field": "30 cm", "ruler": "10 cm", "art": "none", "readout": True, "note": NOTE, "noteAlways": True},
   {"id": "pattern", "label": "線路與膜層", "en": "PATTERN & FILM", "field": "300 nm", "ruler": "100 nm", "art": "none", "readout": True, "note": NOTE, "noteAlways": True}],
   "theme": "dark", "schematic": {"text": "Schematic – not to scale", "zh": "示意圖，非實際比例"}, "maxLabels": 4, "smallPx": 30, "layout": "fill", "scanBand": 0.3},
 "cover": {"title": ["每做完一步", "都要量一次"], "sub": "量測與檢測", "frame": 40},
 "sample": False, "scenes": S,
}
json.dump(script, open("/home/user/ai-mp4/videos/tech-metrology/script.json", "w"), ensure_ascii=False, indent=1)
print("ok", len(S), "字數", sum(len(s["tts"]) for s in S if "tts" in s), "DEF_AT", DEF_AT)

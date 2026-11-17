# 產生 videos/tech-waferflow/script.json（改這支再重產）。念稿、字幕、cue 在 narr.py。
import json, sys
sys.path.insert(0, "/home/user/ai-mp4/videos/tech-waferflow")
from narr import S
HIDE = "s1:start-40"; FAR = "s12:end+400"
def off(c, n): return f"{c}{'+' if n >= 0 else '-'}{abs(n)}"
def hide(layer, a, b, dur=6): return {"layer": layer, "at": a, "until": b, "opacity": 0, "dur": dur}
def gone(layer, at, dur=10): return {"layer": layer, "at": at, "until": FAR, "opacity": 0, "dur": dur}
def fall(layer, until, dy=3.2, bounce=0.06, press=None):
    d = {"layer": layer, "at": HIDE, "until": until, "dy": dy, "opacity": 0, "dur": 12, "fallIn": True, "bounce": bounce}
    if press: d["press"] = press; d["pressAmt"] = 0.02
    return d
def tool(layers, shows):
    """layers 只在 shows（[(開始, 結束)…]）這幾段看得到，其餘時間隱藏"""
    out = []
    ls = layers if isinstance(layers, list) else [layers]
    for l in ls:
        prev = HIDE
        for a, b in shows:
            out.append(hide(l, prev, a)); prev = b
        out.append(hide(l, prev, FAR))
    return out
def run(i, at, until=None, ramp=None, **kw):
    d = {"id": i, "at": at}
    if until: d["until"] = until
    if ramp: d["ramp"] = ramp
    d.update(kw); return d
def lab(part, text, en, color, at, until): return {"part": part, "text": text, "en": en, "color": color, "at": at, "until": until}
def stamp(text, at, until, color="amber", size=44, rot=-4, **kw):
    d = {"type": "stamp", "at": at, "until": until, "text": text, "color": color, "size": size, "rot": rot}
    d.update(kw); return d
def shot(at, x, y, d, elev, dur=22): return {"at": at, "dur": dur, "x": x, "y": y, "d": d, "elev": elev}
def card(kind, at, until, y, h, title, tag, t, **kw):
    d = {"type": "section", "kind": kind, "at": at, "until": until, "x": 64, "y": y, "w": 952, "h": h, "avoid": False, "title": title, "tag": tag, "t": {k: {"at": v} for k, v in t.items()}}
    d.update(kw); return d
SX, CX, KX = 60, 120, 180
P = {}   # 每幕 props
SRC = {}

# ───────── s1 鉤子：晶圓 ─────────
P["s1"] = {
 "hook": {"kicker": "產業估計｜是哪幾步？", "title": "3 個月 × 數十次", "size": 120, "top": 236},
 "zoom": [{"to": "wafer", "at": "start-30", "dur": 1}],
 "shot": [shot("start-30", 0, -3.0, 36, 34, 1)],
 "run": [run("w_spin", "start-30", "s2:start-2", 8)],
 "labels": [lab("w_wafer", "晶圓", "Wafer", "blue", "wafer", "same-4")],
 "overlay": [card("wf-ring", "start+2", "s2:start-2", 960, 300, "同一套動作", "示意", {"same": "same", "rep": "rep", "which": "which"})]}
SRC["s1"] = ["SIA 產業協會估計；TRUMPF 科普文"]

# ───────── s2 沉積 ─────────
P["s2"] = {
 "zoom": [{"to": "sect", "at": "start-6", "dur": 40}],
 "shot": [shot("start-2", SX, 1.4, 52, 20, 26)],
 "shift": [fall("ox", "ox+4", dy=3.4, press=["sub"]), fall("mt_line", "mt+6", dy=3.4, press=["ox"]), fall("mt_gap", "mt+6", dy=3.4, press=["ox"]), hide("dp", HIDE, "s8:ion+12", 2)]
          + tool("t_dep", [("s2:start-6", "s3:start-6")]),
 "run": [run("d_ox0", off("ox", -18), off("mt", -6), 6), run("d_ox1", off("ox", -18), off("mt", -6), 6), run("d_mt0", off("mt", -14), "s3:start-6", 6), run("d_mt1", off("mt", -14), "s3:start-6", 6)],
 "labels": [lab("a_sub", "矽基板", "Silicon wafer", "blue", "dep", "s3:start-6"), lab("d_head", "沉積頭：氣體噴下來", "Deposition head", "amber", "dep+8", "ox"),
            lab("a_ox", "氧化層（絕緣）", "Oxide (insulator)", "amber", "ox+22", "s3:start-6"), lab("a_mt", "金屬層（導電）", "Metal (conductor)", "coral", "mt+22", "s3:start-6")],
 "overlay": [stamp("① 沉積", "dep", "s3:start-6", "amber", 56, x=200, y=330),
             card("wf-sec", "start+2", "s9:start-2", 960, 300, "剖面示意", "示意，非實際比例", {"dep": "s2:dep", "ox": "s2:ox", "mt": "s2:mt", "res": "s3:res", "lt": "s4:lt", "msk": "s4:msk", "prt": "s4:prt", "dev": "s5:dev", "wash": "s5:wash",
                  "bare": "s6:bare", "pl": "s6:pl", "cut": "s6:cut", "use": "s7:use", "strip": "s7:strip", "ion": "s8:ion", "pol": "s8:pol", "next": "s8:next"})]}
SRC["s2"] = ["SemiconductorX；科林研發法說會；示意"]

# ───────── s3 塗光阻＋爆炸剖析 ─────────
EXP = [("ox", 1.8), ("mt_line", 3.6), ("mt_gap", 3.6), ("rs_line", 5.4), ("rs_gap", 5.4)]
P["s3"] = {
 "shot": [shot("start-2", SX, 1.4, 52, 20, 20), shot("film-6", SX, 2.2, 62, 18, 22)],
 "shift": [fall("rs_line", "res+14", dy=3.4, press=["mt_line", "mt_gap"]), fall("rs_gap", "res+14", dy=3.4)] + tool("t_res", [("s3:start-6", "film-8")]) +
          [{"layer": l, "at": "film", "until": "s4:start-6", "dy": dy, "dur": 18} for l, dy in EXP],
 "run": [run("r_drip", off("res", -8), off("res", 30), 6), run("s_spin", off("res", -6), off("res", 44), 10)],
 "labels": [lab("r_nozzle", "光阻（液體）", "Photoresist", "amber", "res", "film-6"),
            lab("a_sub", "矽基板", "Silicon", "blue", "film+4", "s4:start-8"), lab("a_ox", "氧化層", "Oxide", "amber", "film+12", "s4:start-8"),
            lab("a_mt", "金屬層", "Metal", "coral", "film+20", "s4:start-8"), lab("a_rs", "光阻", "Resist", "blue", "film+28", "s4:start-8")],
 "overlay": [stamp("② 塗光阻", "res", "s4:start-14", "amber", 56, x=200, y=330)]}
SRC["s3"] = ["示意；光阻（正光阻）照到光的部分在顯影時被洗掉"]

# ───────── s4 曝光 ─────────
P["s4"] = {
 "shot": [shot("start-2", SX, 2.0, 58, 16, 26)],
 "shift": tool("t_exp", [("s4:start-6", "s5:start-6"), ("s10:asml-6", "s10:lam-6"), ("s10:gd-6", "s10:sf-6")]) + tool("t_exp_w", [("lt", "s5:start-6"), ("s10:asml-2", "s10:lam-6")]) + tool("t_exp_l", [("msk", "s5:start-6"), ("s10:asml-2", "s10:lam-6")]),
 "run": [run("e_lampg", "start-4", "s5:start-2", 6), run("e_rayw", "lt", "s5:start-6", 6), run("e_ray", "msk", "s5:start-6", 6), run("s_rsx", "prt", "s5:wash", 8)],
 "labels": [lab("e_retA", "光罩（圖形）", "Photomask", "amber", "msk", "s5:start-6"), lab("e_lensA", "鏡頭", "Lens", "blue", "prt-6", "s5:start-6"), lab("a_gap", "照到光的地方", "Exposed resist", "coral", "prt+4", "s5:start-6")],
 "overlay": [stamp("③ 曝光", "lt", "s5:start-6", "amber", 56, x=200, y=330)]}
SRC["s4"] = ["TechInsights（ASML 曝光機）；示意"]

# ───────── s5 顯影 ─────────
P["s5"] = {
 "shot": [shot("start-2", SX, -0.1, 45, 20, 22)],
 "shift": tool("t_dev", [("s5:start-6", "s6:start-6")]) + [gone("rs_gap", "wash", 12)],
 "run": [run("v_flow", off("dev", -4), off("wash", 36), 6)],
 "labels": [lab("v_A", "顯影藥水", "Developer", "blue", "dev", "show+10")],
 "overlay": [stamp("④ 顯影", "dev", "s6:start-6", "amber", 56, x=210, y=290)]}
SRC["s5"] = ["示意"]

# ───────── s6 蝕刻 ─────────
P["s6"] = {
 "shot": [shot("start-2", SX, 2.0, 52, 18, 22)],
 "shift": tool("t_etch", [("s6:start-6", "s7:start-6"), ("s10:lam-6", "s10:gd-6"), ("s11:start-6", FAR)]) + tool("t_etch_p", [("pl-6", "s7:start-6"), ("s10:lam-4", "s10:gd-6"), ("s11:start-6", FAR)]) + [gone("mt_gap", "cut", 12)],
 "run": [run("t_plg", off("pl", -6), "s7:start-2", 6), run("t_ion0", "pl", off("cut", 36), 6), run("t_ion1", "pl", off("cut", 36), 6), run("t_blk", "pl", off("cut", 36), 6)],
 "labels": [lab("t_plA", "電漿（帶電的氣體）", "Plasma", "amber", "pl", "cut-6"), lab("t_topA", "上電極", "Top electrode", "blue", "pl+10", "cut-6"), lab("a_mtl", "圖形留在金屬上", "Pattern in metal", "coral", "cut+14", "s7:start-6")],
 "overlay": [stamp("⑤ 蝕刻", "bare", "s7:start-6", "amber", 56, x=200, y=330)]}
SRC["s6"] = ["示意；蝕刻機廠商：科林研發法說會"]

# ───────── s7 去光阻 ─────────
P["s7"] = {
 "shot": [shot("start-2", SX, -0.1, 45, 20, 22)],
 "shift": tool("t_str", [("s7:start-6", "s8:start-6"), ("s10:sf-6", "s10:kn-10")]) + [gone("rs_line", "strip+8", 12)],
 "run": [run("x_flow", off("strip", -4), off("strip", 40), 6)],
 "labels": [lab("x_A", "去光阻藥水", "Resist stripper", "coral", "strip", "done")],
 "overlay": [stamp("⑥ 去光阻", "use", "s8:start-14", "amber", 56, x=200, y=330)]}
SRC["s7"] = ["示意"]

# ───────── s8 離子佈植＋研磨 ─────────
P["s8"] = {
 "zoom": [{"to": "equip", "at": "pol-24", "dur": 30}],
 "shot": [shot("start-2", SX, 3.6, 80, 16, 1), shot("pol-18", CX, 1.4, 46, 22, 30)],
 "shift": tool("t_imp", [("s8:start", "pol-18")]),
 "run": [run("i_srcg", off("ion", -8), "pol-18", 6), run("i_beam", off("ion", -6), "pol-18", 6), run("i_gap0", off("ion", -2), "pol-18", 6), run("i_gap1", off("ion", -2), "pol-18", 6), run("i_line", off("ion", -2), "pol-18", 6),
         run("s_dpg", off("ion", 14), "pol-18", 8),
         run("m_padspin", off("pol", -26), "s9:start-2", 12), run("m_headspin", off("pol", -26), "s9:start-2", 12), run("m_sweep", off("pol", -14), "s9:start-2", 10), run("m_slf", off("pol", -14), "s9:start-2", 6)],
 "labels": [lab("i_srcA", "離子源", "Ion source", "amber", "ion", "pol-22"), lab("a_dp", "摻進矽裡的區域", "Doped region", "coral", "ion+34", "pol-22"),
            lab("m_padA", "研磨墊", "Polishing pad", "blue", "pol+6", "next-6"), lab("m_headA", "研磨頭（夾住晶圓）", "Carrier head", "amber", "pol+16", "next-6"), lab("m_slA", "研磨液", "Slurry", "coral", "pol+26", "next-6")],
 "overlay": [stamp("⑦ 離子佈植", "ion", "pol-20", "amber", 52, x=230, y=330), stamp("⑧ 研磨", "pol+8", "s9:start-6", "amber", 56, x=200, y=330)]}
SRC["s8"] = ["示意；CMP 每層研磨平整：TRUMPF 科普文"]

# ───────── s9 一層一層疊 ─────────
NK, STAG = 12, 9
P["s9"] = {
 "zoom": [{"to": "sect", "at": "start-6", "dur": 36}],
 "shot": [shot("start-2", KX, 1.6, 46, 20, 30), shot("rep+30", KX, 1.8, 52, 18, 60)],
 "shift": [fall("k0", off("one", 12), dy=4.5, bounce=0.05)] + [fall(f"k{k}", off("rep", STAG * k - 6), dy=4.5, bounce=0.05) for k in range(1, NK)],
 "labels": [lab("k_bot", "矽基板", "Substrate", "blue", "one", "s10:start-6"), lab("k_top", "最上面一層", "Top layer", "amber", "hund-10", "s10:start-6")],
 "overlay": [card("wf-count", "start+2", "s10:start-4", 960, 300, "疊層", "示意・產業估計", {"one": "one", "rep": "rep", "hund": "hund"}, n=NK, stag=STAG)]}
SRC["s9"] = ["產業估計：80～120 層光罩"]

# ───────── s10 誰做哪一步 ─────────
P["s10"] = {
 "zoom": [{"to": "equip", "at": "start-6", "dur": 30}],
 "shot": [shot("start-2", SX, 2.6, 58, 16, 24), shot("lam-12", SX, 2.0, 52, 18, 24), shot("gd-12", SX + 3.5, 2.6, 62, 16, 24), shot("sf-12", SX, -0.1, 45, 20, 24), shot("kn-14", CX, -0.4, 46, 22, 28)],
 "run": [run("e_lampg", "asml-6", "lam-6", 6), run("e_ray", "asml", "lam-6", 6), run("t_plg", off("lam", -4), "gd-6", 6), run("t_ion0", "lam", "gd-6", 6), run("t_ion1", "lam", "gd-6", 6), run("t_blk", "lam", "gd-6", 6),
         run("x_flow", off("sf", -2), "kn-10", 6), run("m_padspin", off("kn", -20), "s11:start-2", 12), run("m_headspin", off("kn", -20), "s11:start-2", 12), run("m_sweep", off("kn", -10), "s11:start-2", 10)],
 "labels": [lab("e_lensA", "艾司摩爾：曝光機", "ASML: scanner", "amber", "asml", "lam-8"), lab("t_elA", "科林研發：蝕刻機", "Lam Research: etcher", "amber", "lam", "gd-8"), lab("e_podA", "家登：光罩盒", "Mask pod", "amber", "gd", "sf-8"),
            lab("x_A", "三福化：去光阻藥水", "Resist stripper", "amber", "sf", "kn-18"), lab("m_discA", "中砂：修整研磨墊的鑽石碟", "Pad conditioner", "amber", "kn", "s11:start-6")],
 "overlay": [card("wf-who", "start+2", "s11:start-4", 960, 300, "誰做哪一步", "查證截至 2026/11/18", {"asml": "asml", "lam": "lam", "gd": "gd", "sf": "sf", "kn": "kn"})]}
SRC["s10"] = ["TechInsights；法說會；媒體報導"]

# ───────── s11 結尾 ─────────
P["s11"] = {
 "zoom": [{"to": "equip", "at": "start-6", "dur": 1}],
 "shot": [shot("start-2", SX, 2.0, 52, 18, 24)],
 "run": [run("t_plg", "next-4", "s12:end", 6), run("t_ion0", "next", "s12:end", 6), run("t_ion1", "next", "s12:end", 6), run("t_blk", "next", "s12:end", 6)],
 "labels": [],
 "overlay": [card("wf-next", "start+2", "kw-10", 960, 300, "下一支", "示意", {"tricks": "tricks", "next": "next", "how": "how", "kw": "kw"}), stamp("完整解說在留言", "full", "kw-6", "blue", 36, x=780, y=336, avoid=False)]}
SRC["s11"] = ["下一支 11/26 蝕刻機"]

scenes = []
for i, b, p, t, zh, en, kw, cues in S:
    props = P[i]
    s = {"id": i, "beat": b, "para": p, "narration": t, "tts": t, "subtitle": {"zh": "\n".join(zh), "en": " | ".join(en)}, "keywords": kw,
         "cues": [{"id": a, "text": c} for a, c in cues], "component": "ThreeScene", "props": props, "sources": SRC[i]}
    if i != "s11": s["pauseAfter"] = 0.7
    assert len(zh) == len(en), i
    for _, c in cues: assert c in t, (i, c)
    scenes.append(s)
# 補沒有在 narr.py 宣告、但腳本引用的 cue：先檢查
ids = {s["id"]: {c["id"] for c in s["cues"]} for s in scenes}
scenes.append({"id": "s12", "beat": "end", "silent": True, "durationSec": 3.2, "subtitle": {"zh": "", "en": ""}, "keywords": [], "cues": [], "component": "ThreeScene",
               "props": {"endCard": {"next": "蝕刻機", "trail": ["沉積", "曝光", "蝕刻", "研磨"], "at": "s11:kw-8", "comment": "流程", "logoAnim": "transparent"}}, "sources": []})
script = {
 "slug": "tech-waferflow", "title": "一片晶圓要經過哪些流程（科技透明圈 第 11 支）", "asOf": "2026/11/25", "styleVersion": 3, "stage": "three",
 "channel": {"name": "科技透明圈", "tag": "放大來看", "slogan": "一支講透一件事"}, "hudSkin": "light",
 "voice": {"voiceName": "Iapetus", "model": "gemini-2.5-flash-preview-tts", "mode": "take", "languageCode": "cmn-TW", "profile": "tech-b", "_說明": "整篇 1 次請求；out/voice-waferflow/waferflow-a.wav"},
 "hud": {"levels": [{"id": "equip", "label": "設備", "en": "EQUIPMENT", "field": "1 m", "ruler": "20 cm", "art": "none", "handoff3D": True, "readout": False, "note": "設備為示意，非實際比例", "noteAlways": True},
                    {"id": "wafer", "label": "晶圓", "en": "WAFER", "field": "30 cm", "ruler": "5 cm", "art": "none", "readout": True, "note": "查證截至 2026/11/18", "noteAlways": True},
                    {"id": "sect", "label": "表面剖面", "en": "CROSS-SECTION", "field": "30 µm", "ruler": "5 µm", "art": "none", "readout": True, "note": "查證截至 2026/11/18", "noteAlways": True}],
         "theme": "dark", "schematic": {"text": "Schematic – not to scale", "zh": "示意圖，非實際比例・層厚與圖形為示意"}, "maxLabels": 4, "smallPx": 30, "layout": "fill", "scanBand": 0.3},
 "cover": {"title": ["一片晶圓", "八步一層"], "sub": "流程", "frame": 40},
 "sample": False, "scenes": scenes,
}
json.dump(script, open("/home/user/ai-mp4/videos/tech-waferflow/script.json", "w"), ensure_ascii=False, indent=1)
print("ok", len(scenes))

"""tech-utility 腳本產生器：python3 videos/tech-utility/genscript.py → script.json（自動先跑 gen-model.mjs 產 model.json）
廠務-2：水、氣、電（科技透明圈 系列 2 第 20 集；前一集 2-19 無塵室；下一集 2-21 探針卡-1）。念稿定稿於 script.md，**一字不改**。
旁白、cue、字幕、hook、片尾卡、hud、voice 與各幕 3D 動作（shot／shift／run／labels／overlay）都在這支；cue 來自 timeline.json，配音後重跑本檔即可。
標籤時間：同一幕的標籤依序排（每張 46 幀、一次一張），起點＝max(念到 cue 前幾幀, 上一張結束＋2)，用 timeline.json 的 cue 幀換算成「cue+N」，配音後重跑會重排。
2D 卡：src/components/three/HudUtility.tsx（util-*）。構造與物理：physics-spec.md；模組清單與爆炸步驟對照：visual-spec.md。"""
import json, re, os, subprocess
HERE = os.path.dirname(os.path.abspath(__file__))
subprocess.run(["node", os.path.join(HERE, "gen-model.mjs")], check=True)
MODEL = json.load(open(os.path.join(HERE, "model.json")))
I = MODEL["info"]
UX, FX, WX, LX, TX, EX, GX, VX, PX = (I[k] for k in ("UX", "FX", "WX", "LX", "TX", "EX", "GX", "VX", "PX"))
# (id, beat, 旁白, 中文字幕行, 英文字幕行, cues[(id,文字)], keywords, sources, 無聲幕長秒, 開口前只有畫面秒, 念完後最少只有畫面秒)
S = [
("s1", "hook", "洗晶圓的水，要多乾淨？前一集的無塵室，連空氣都過濾乾淨。",
 ["洗晶圓的水", "要多乾淨？", "前一集的無塵室", "連空氣都", "過濾乾淨"], ["The water that washes wafers:", "how clean must it be?", "Last episode, the cleanroom", "even had its air", "filtered clean."],
 [("wash", "洗晶圓"), ("clean", "多乾淨"), ("prev", "前一集"), ("air", "空氣")], ["多乾淨", "無塵室", "空氣"], ["示意動畫，不是量測"], 7.2, 0.0, 2.0),
("s2", "mechanism", "這叫超純水，幾乎只剩水分子。做法像濾水壺，濾網加樹脂，把雜質一個個抓走。",
 ["這叫超純水", "幾乎只剩水分子", "做法像濾水壺", "濾網加樹脂", "把雜質", "一個個抓走"], ["This is ultrapure water,", "almost nothing but water molecules.", "It works like a filter pitcher:", "membranes plus resin", "pull the impurities", "out one by one."],
 [("upw", "超純水"), ("mol", "水分子"), ("pitcher", "濾水壺"), ("mem", "濾網"), ("resin", "樹脂"), ("catch", "抓走")], ["超純水", "濾水壺", "樹脂"],
 ["Xylem 超純水 FAQ、SEMI F63；USPTO 4879041"], 9.6, 0.3, 2.6),
("s3", "mechanism", "它還得一直循環流動。停著不動，就會長細菌。",
 ["它還得", "一直循環流動", "停著不動", "就會長細菌"], ["It also has to", "keep circulating.", "If it sits still,", "bacteria grow."],
 [("loop", "循環"), ("stop", "停著"), ("bact", "細菌")], ["循環", "停著不動", "細菌"], ["USPTO 9702124（死水支管）；示意動畫，不是量測"], 6.8, 0.3, 2.4),
("s4", "mechanism", "台積電全公司一天用水，約三十多萬噸。",
 ["台積電全公司", "一天用水", "約三十多萬噸"], ["TSMC, company-wide,", "uses each day", "over 300,000 tonnes of water."],
 [("tsmc", "台積電"), ("day", "一天"), ("num", "三十多萬")], ["台積電", "三十多萬噸"], ["台積電 2024 年報（每天用水為換算）"], 5.6, 0.2, 1.8),
("s5", "mechanism", "再說電。電只要晃一下，敏感的機台就當機，要花半天調回來。",
 ["再說電", "電只要晃一下", "敏感的機台", "就當機", "要花半天調回來"], ["Now, power.", "One brief voltage dip,", "and sensitive tools", "crash,", "taking half a day to recover."],
 [("elec", "再說電"), ("sag", "晃一下"), ("tool", "機台"), ("crash", "當機"), ("half", "半天")], ["晃一下", "當機", "半天"], ["自由時報 2021 竹科壓降報導；示意動畫，不是量測"], 7.0, 0.2, 1.8),
("s6", "mechanism", "所以關鍵位置有備用電源。像筆電的電池，市電一晃，U P S 立刻接手。",
 ["所以關鍵位置", "有備用電源", "像筆電的電池", "市電一晃", "UPS 立刻接手"], ["So key spots", "have backup power.", "Like a laptop battery:", "when the grid flickers,", "the UPS takes over at once."],
 [("backup", "備用電源"), ("laptop", "筆電"), ("mains", "市電"), ("ups", "接手")], ["備用電源", "筆電的電池", "UPS"], ["中時 2022/7/28 台積電回應；示意動畫，不是量測"], 8.4, 0.2, 2.3),
("s7", "mechanism", "大約每十度電，台灣就有一度被台積電用掉。",
 ["大約每十度電", "台灣就有一度", "被台積電用掉"], ["Of about every ten units", "of power in Taiwan, one", "is used by TSMC."],
 [("ten", "十度電"), ("one", "一度"), ("tsmc", "台積電")], ["十度電", "一度", "台積電"], ["自由財經、鉅亨（2025 為推算）、數位時代"], 6.6, 0.2, 2.0),
("s8", "mechanism", "氣體也一樣。氮氣像廠裡的空氣，用管線從廠外送到每台機台，像自來水管。",
 ["氣體也一樣", "氮氣像", "廠裡的空氣", "用管線從廠外", "送到每台機台", "像自來水管"], ["Gas works the same way.", "Nitrogen is like", "the fab's own air,", "piped in from outside", "to every tool,", "like water mains."],
 [("gas", "氣體"), ("n2", "氮氣"), ("pipe", "管線"), ("out", "廠外"), ("tool", "每台機台"), ("tap", "自來水管")], ["氮氣", "管線", "自來水管"],
 ["科技新報、數位時代；示意動畫，不是量測"], 9.6, 0.2, 2.6),
("s9", "payoff", "水有日本的 Organo，氣有聯華林德和三福氣體。",
 ["水有日本的 Organo", "氣有聯華林德", "和三福氣體"], ["For water, Japan's Organo;", "for gas, Linde LienHwa", "and Air Products San Fu."],
 [("water", "水有"), ("org", "Organo"), ("lh", "聯華林德"), ("sf", "三福")], ["Organo", "聯華林德", "三福氣體"],
 ["科技新報、自由時報；截至 2026/11/27"], 6.6, 0.2, 1.8),
("s10", "cta", "水氣電備齊，晶圓做完。怎麼知道每顆晶片好不好？看探針卡。留言水氣電，拿完整資料。",
 ["水氣電備齊", "晶圓做完", "怎麼知道", "每顆晶片好不好？", "看探針卡", "留言水氣電", "拿完整資料"], ["With water, gas and power ready,", "the wafer gets made.", "But how do you know", "if each chip is good?", "Look at the probe card.", "Comment \"utilities\"", "for the full notes."],
 [("ready", "備齊"), ("how", "怎麼知道"), ("probe", "探針卡"), ("kw", "留言水氣電")], ["備齊", "探針卡", "水氣電"], ["示意動畫，不是量測"], 9.2, 0.0, 1.6),
]
def TTS(t):
    t = t.replace("上集", "上一集").replace("上一一集", "上一集").replace("矽", "細").replace("光罩", "光照")
    for a, b in [("上一集", "前一集"), ("量測", "測量"), ("上百片", "一百多片")]:
        t = t.replace(a, b)
    return t
scenes = []
for i, (sid, beat, nar, zh, en, cues, kws, src, dur, head, tail) in enumerate(S):
    assert len(zh) == len(en), (sid, len(zh), len(en))
    for z in zh: assert len(re.sub(r"[ ，。？]", "", z)) <= 11, (sid, z)
    for z in zh[:-1]: assert len(re.sub(r"[ ，。？]", "", z)) >= 3, ("字幕短語 <3 字會被併入下一段、英文對位跑掉", sid, z)
    for c in cues: assert c[1] in nar and c[1] in "".join(zh).replace(" ", ""), (sid, c)
    # Andy 第 39 條（11-27 晚）：旁白之間的無聲最多 1 秒 → 念完後只留 1.0 秒；幕長＝開口前＋念稿估時＋1.0（s9 公司卡另照第 40 條檢查）
    nh = S[i + 1][9] if i + 1 < len(S) else 0.0
    nch = len(re.sub(r"[，。？！、；：\s]", "", nar)); hold = round(1.0 - nh - (0.13 if sid in ("s9", "s10") else 0), 2); dur = round(max(4.6, head + nch / 5.2 + 0.2 + hold), 2)
    sc = {"id": sid, "beat": beat, "para": i + 1, "narration": nar, "tts": TTS(nar),
          "subtitle": {"zh": "\n".join(zh), "en": " | ".join(en)},
          "keywords": kws, "cues": [{"id": a, "text": b} for a, b in cues],
          "component": "ThreeScene", "sources": src, "props": {}, "durationSec": dur, "holdSec": hold}
    if head > 0: sc["headSec"] = head
    if i < len(S) - 1: sc["pauseAfter"] = hold
    scenes.append(sc)
md = open(os.path.join(HERE, "script.md")).read().split("---")[0]
paras = [p.strip() for p in md.split("\n\n")[1:] if p.strip() and not p.startswith("#") and not p.startswith("念稿")]
assert [s["narration"] for s in scenes] == paras, ("念稿與 script.md 不一致", [(a["narration"], b) for a, b in zip(scenes, paras) if a["narration"] != b])
scenes[0]["props"]["hook"] = {"kicker": "接上集：無塵室連空氣都過濾乾淨", "title": "水要多乾淨？", "size": 120, "top": 236}
scenes.append({"id": "s11", "beat": "end", "silent": True, "durationSec": 3.2, "subtitle": {"zh": "", "en": ""}, "keywords": [], "cues": [], "component": "ThreeScene", "sources": [],
               "props": {"endCard": {"next": "探針卡", "trail": ["怎麼知道每顆晶片好不好"], "comment": "水氣電", "logoAnim": "transparent"}}})

# ═════════ 時間軸（有 timeline.json 就讀 cue 幀，用來排標籤）═════════
TL = {}
try:
    for s in json.load(open(os.path.join(HERE, "timeline.json")))["scenes"]:
        TL[s["id"]] = {"cue": {c["id"]: c["frame"] for c in s.get("cues", [])}, "vs": s.get("voiceStartFrame"), "ve": s.get("voiceEndFrame"), "st": s.get("startFrame"), "n": s.get("durationFrames")}
except Exception:
    pass
FAR = "s11:start+400"
T0 = "s1:start-40"
def run(i, at, until=None, ramp=6, **kw):
    d = {"id": i, "at": at, "ramp": ramp}
    if until: d["until"] = until
    d.update(kw); return d
def lab(part, text, en, color, at, until, xy=None, **kw):
    d = {"part": part, "text": text, "en": en, "color": color, "at": at, "until": until, "cut": True}
    if xy: d["xy"] = xy
    d.update(kw); return d
LEN = 45
def seq(sid, items):
    """items：[(part, 中文, 英文, 色, cue, 提前幀)]；依序排、每張 LEN 幀、一次一張；回傳 labels（at／until 寫成「cue+N」）"""
    out, prev_end = [], None
    for it in items:
        part, t, e, col, cue, off = it[:6]; xy = it[6] if len(it) > 6 else None
        if cue in ("end", "voice", "start"):
            base = {"end": TL.get(sid, {}).get("ve"), "voice": TL.get(sid, {}).get("vs"), "start": TL.get(sid, {}).get("st")}[cue]
        else:
            base = TL.get(sid, {}).get("cue", {}).get(cue)
        n = -off
        if cue == "end" and base is not None and TL[sid]["cue"]:
            # precheck 把「end」當幕尾（引擎是收聲），改寫成最後一個 cue＋N，兩邊意思一致
            lc = max(TL[sid]["cue"], key=lambda q: TL[sid]["cue"][q]); n = base - off - TL[sid]["cue"][lc]; cue, base, off = lc, TL[sid]["cue"][lc], -n
        if base is not None and prev_end is not None and base + n < prev_end + 2: n = prev_end + 2 - base
        if base is not None and TL.get(sid, {}).get("vs") is not None and base + n < TL[sid]["vs"] - 2: n = TL[sid]["vs"] - 2 - base   # 不早於本幕換鏡那一幀
        if base is not None:
            ids = [x[0] for x in S]; k = ids.index(sid)
            lim = (TL[ids[k + 1]]["vs"] - 10) if k + 1 < len(ids) and ids[k + 1] in TL else None
            if lim is not None and base + n + LEN > lim:
                print(f"⚠ {sid} 標籤「{t}」放不下（結束 {base + n + LEN} > 下一幕字幕起點 {lim}），略過"); continue
        out.append(lab(part, t, e, col, f"{cue}{n:+d}", f"{cue}{n + LEN:+d}", xy))
        prev_end = (base + n + LEN) if base is not None else None
    return out
YAW = [0.0]
def shot(at, x, y, d, elev, dur=30, yaw=None):
    o = {"at": at, "dur": dur, "x": x, "y": y, "d": d, "elev": elev}
    if yaw is not None and abs(yaw - YAW[0]) > 1e-6: o["yaw"] = round(yaw - YAW[0], 4); YAW[0] = yaw
    return o
def hid(lay, a, b, dur=10, o=0): return {"layer": lay, "at": a, "until": b, "opacity": o, "dur": dur}
def mv(lay, a, b, dur=22, **kw):
    d = {"layer": lay, "at": a, "until": b, "dur": dur}; d.update(kw); return d
def sec(kind, at, until, title, tag, t=None, y=1066, h=330, **kw):
    d = {"type": "section", "kind": kind, "at": at, "until": until, "x": 64, "y": y, "w": 952, "h": h, "avoid": False, "title": title, "tag": tag}
    if t is not None: d["t"] = {k: {"at": v} for k, v in t.items()}
    d.update(kw); return d
LAYERS = [l["id"] for l in MODEL["layers"] if not l.get("bg")]
VIS = []
def vis(lay, wins, dur=3):
    assert lay in LAYERS, lay
    prev = T0
    for a, b in wins:
        if a != T0: VIS.append(hid(lay, prev, a, dur))
        prev = b
    if prev != FAR: VIS.append(hid(lay, prev, FAR, dur))
C = "voice-3"          # 換幕：3D 鏡頭、HUD 層級、2D 卡、字幕、出處列在字幕窗起點同一幀換
CC = "voice-4"
def nxt(sid): return f"s{int(sid[1:]) + 1}:voice-3"
def card(sid, kind, title, tag, t=None, **kw): return sec(kind, C, nxt(sid), title, tag, t, cut=True, **kw)

# ── 站 F：晶圓廠剖面爆炸分解（physics-spec §2 步驟 1、3、4、5；步驟 9 組回在 s10）──
RD = "s10:ready"
VIS += [hid("fFacade", "s1:prev-2", f"{RD}+20", 12, 0)]                                  # 步驟 1：外殼（正面牆）掀開，留框線（fFrame）
VIS += [mv("fRoof", "s1:prev-2", f"{RD}+12", 20, dy=5.6), mv("fFan", "s1:prev-2", f"{RD}+12", 20, dy=5.6)]  # 步驟 1：屋頂沿垂直軸抬起
VIS += [mv("fClean", "s1:prev+8", f"{RD}+6", 20, dy=3.8)]                                # 步驟 3：無塵室層分離
VIS += [mv("fPlen", "s1:air+4", f"{RD}+0", 20, dy=2.0)]                                    # 步驟 4：回風夾層分離
VIS += [mv("fSubW", "s2:start+2", f"{RD}-6", 20, dx=-2.6), mv("fSubG", "s2:start+2", f"{RD}-6", 20, dx=2.6)]   # 步驟 5：地下廠務層：水往左、氣往右拉開
# ── 站 W：超純水各站沿流向逐站拉起（步驟 6；拉起時亮標籤，放回後換下一站）──
# ── 站 G：地下管線土層掀開、廠房牆抬起露出閥箱（步驟 8）──
VIS += [mv("gGround", "s8:pipe-6", "s8:end+2", 18, dy=1.9)]
VIS += [hid("gGround", "s8:pipe-6", "s8:end+2", 12, 0.35)]
# ── 站 L：死水支管的細菌只在「停著不動」之後出現 ──
vis("lBact", [("s3:stop+6", FAR)], 8)
# ── 站 T：s7 冷卻塔從屋頂抬起（步驟 2），講完放回 ──
VIS += [mv("tTower", "s7:start+4", "s7:end+4", 20, dy=2.0), mv("tFan", "s7:start+4", "s7:end+4", 20, dy=2.0)]
# ── 站 E：s5 沒有不斷電系統；s6 念到「備用電源」從後方推進來（步驟 7 最後一站）；紅燈只在當機時亮 ──
VIS += [hid("eUPS", T0, "s6:backup-4", 4, 0), mv("eUPS", T0, "s6:backup", 22, dz=-2.6)]
vis("eLampR", [("s5:crash", "s6:start+10")], 2)
VIS += [hid("eLampG", "s5:crash", "s6:start+10", 2, 0)]
VIS += [hid("eLights", "s5:sag+18", "s5:sag+42", 3, 0.1), hid("eLights", "s6:mains+2", "s6:mains+26", 3, 0.1)]   # 電壓晃一下：燈條一起暗
# ── 站 V：念到哪家才從半透明變實體（三座廠往中間靠，整組一個鏡頭看得到）──
VIS += [mv(l, T0, FAR, 1, dx=1.4) for l in ("v0", "vF0")] + [mv(l, T0, FAR, 1, dx=-1.2) for l in ("v2", "vF2")]
VIS += [hid("v0", "s9:start-6", "s9:org-12", 6, 0.3), hid("v1", "s9:start-6", "s9:lh-12", 6, 0.3), hid("v2", "s9:start-6", "s9:sf-12", 6, 0.3)]
# ── 站 P：探針卡念到時往下壓，針尖碰到晶粒；接點亮起 ──
VIS += [mv("pCard", "s10:probe", FAR, 26, dy=-0.83)]
vis("pHit", [("s10:probe+26", FAR)], 3)

# ═════ 各幕 ═════
UL = (UX + 0.4, 2.3, 25, 34)                  # 站 U 鏡頭（看向 x、y、距離、仰角）
FL0, FL1 = (FX, 1.2, 54, 14), (FX, 2.6, 76, 12)  # 站 F：合起來／爆炸後
WLc = (WX - 0.6, 0.2, 40, 38)
LLc = (LX + 0.6, 0.6, 33, 38)
T4, T7 = (TX - 5.0, 1.0, 42, 14), (TX + 3.8, 4.6, 46, 16)
ELc = (EX - 2.0, -0.4, 40, 26)
GLc = (GX - 4.6, 1.2, 40, 18)
VLc = (VX + 0.2, -0.6, 48, 16)
PLc = (PX, 0.6, 20, 12)
def S_(at, c, dur=1): return shot(at, c[0], c[1], c[2], c[3], dur)
P = {}
P["s1"] = {"zoom": [{"to": "use", "at": "start-30", "dur": 1}, {"to": "use", "at": "clean+6", "dur": 1}, {"to": "fab", "at": "prev-4", "dur": 1}],
 "shot": [S_("start-30", UL), shot("start", UL[0], UL[1], UL[2] - 1.0, UL[3], 70), S_("prev-4", FL1)],
 "shift": VIS,
 "run": [run("uSpin", "start-30", "prev", 8), run("uJet", "start-30", "prev", 4), run("uOutA", "start-30", "prev", 4), run("uOutB", "start-30", "prev", 4), run("uOutC", "start-30", "prev", 4),
         run("uFlingA", "start-30", "prev", 4), run("uFlingB", "start-30", "prev", 4), run("uFlingC", "start-30", "prev", 4),
         run("fAir", "prev+8", "s2:upw+44", 8), run("fRet", "end+10", "s2:upw+44", 8), run("fRet2", "end+10", "s2:upw+44", 8), run("fFanSpin", "prev", "s2:upw+44", 10), run("fFanSpin2", "prev", "s2:upw+44", 10)],
 "labels": seq("s1", [("fClean", "無塵室（前一集）", "Cleanroom (last episode)", "amber", "prev", -6),
                      ("fPlen", "回風夾層", "Return-air plenum", "blue", "air", -6)]),
 "overlay": [sec("util-hook", "start", nxt("s1"), "系列 2・第 20 集", "示意，非實際比例", {"wash": "wash", "clean": "clean", "prev": "prev", "air": "air"}, cut=True)]}
W_SHIFT = []
w_lab = seq("s2", [("fSub", "地下廠務層：水、電、氣", "Sub-fab: water, power, gas", "blue", "upw", 4),
                   ("wRo", "預處理＋濾網（逆滲透膜）", "Pretreat + RO membranes", "amber", "upw", -44),
                   ("wMix", "樹脂：離子交換", "Resin: ion exchange", "amber", "resin", 30), ("wUv", "紫外線＋超過濾", "UV + ultrafiltration", "blue", "resin", 100),
                   ])
# 每站拉起的時間＝它的標籤時間（wUV、wUF 共用「紫外線＋超過濾」那張；儲槽跟著電阻率表那張）
lift = {"wPre": w_lab[1], "wRO": w_lab[1], "wIX": w_lab[2], "wUV": w_lab[3], "wUF": w_lab[3]}
for lay, L in lift.items():
    W_SHIFT.append(mv(lay, L["at"], L["until"], 12, dy=1.1))
WCUT = w_lab[0]["until"]          # 地下廠務層標籤結束才切到超純水站
P["s2"] = {"zoom": [{"to": "fab", "at": CC, "dur": 1}, {"to": "sys", "at": WCUT, "dur": 1}],
 "shot": [S_(CC, FL1), shot("start+2", FX, 0.4, 60, 15, 40), S_(WCUT, WLc), shot("mem-8", WX - 1.2, -0.3, 27, 34, 12), shot("resin-8", WX + 1.8, -0.3, 30, 34, 12), shot("resin+40", WX + 1.7, 0.4, 20, 30, 12)],
 "shift": W_SHIFT,
 "run": [run("fWRise", "start", WCUT, 6), run("fGRise", "start", WCUT, 6), run("fERise", "start", WCUT, 6),
         run("wFeed", WCUT, "s3:voice-4", 6), run("wImp", WCUT, "s3:voice-4", 6), run("wConc", WCUT, "s3:voice-4", 6), run("wPerm", WCUT, "s3:voice-4", 6), run("wHp", WCUT, "s3:voice-4", 6),
         run("wIon", lift["wIX"]["at"], "s3:voice-4", 6), run("wBeadGlow", lift["wIX"]["at"], "s3:voice-4", 6), run("wUvGlow", lift["wUV"]["at"], "s3:voice-4", 6), run("wUvRay", lift["wUV"]["at"], "s3:voice-4", 6), run("wUvRay2", lift["wUV"]["at"], "s3:voice-4", 6), run("wUvRay3", lift["wUV"]["at"], "s3:voice-4", 6), run("wUvRay4", lift["wUV"]["at"], "s3:voice-4", 6), run("wUvBeam0", lift["wUV"]["at"], "s3:voice-4", 4), run("wUvBeam1", lift["wUV"]["at"], "s3:voice-4", 4), run("wUvBeam2", lift["wUV"]["at"], "s3:voice-4", 4), run("wUvBeam3", lift["wUV"]["at"], "s3:voice-4", 4), run("wUvBeam4", lift["wUV"]["at"], "s3:voice-4", 4), run("wUvBeam5", lift["wUV"]["at"], "s3:voice-4", 4),
         run("wOrg", lift["wUV"]["at"], "s3:voice-4", 6)],
 "labels": w_lab,
 "overlay": [card("s2", "util-upw", "超純水：像濾水壺，但更細", "示意（電阻率為 25°C 規格）", {"upw": "upw", "mol": "mol", "pitcher": "pitcher", "mem": "mem", "resin": "resin", "catch": "catch"})]}
P["s3"] = {"zoom": [{"to": "sys", "at": CC, "dur": 1}],
 "shot": [S_(CC, LLc), shot("stop-6", LX + 0.6, 0.2, 31, 36, 30)],
 "run": [run("lFlow", "start-4", "s4:voice-4", 6), run("lPumpSpin", "start-4", "s4:voice-4", 10), run("lDrip", "start-4", "s4:voice-4", 6), run("lBactGrow", "stop+6", "s4:voice-4", 8)],
 "labels": seq("s3", [("lLoop", "循環主管：一直流", "Loop: always flowing", "blue", "loop", 4), ("lDead", "死水支管：長細菌", "Dead leg: bacteria grow", "amber", "stop", 0)]),
 "overlay": [card("s3", "util-loop", "停著不動就長細菌", "示意", {"loop": "loop", "stop": "stop", "bact": "bact"})]}
P["s4"] = {"zoom": [{"to": "co", "at": CC, "dur": 1}],
 "shot": [S_(CC, T4), shot("num", T4[0] - 0.8, T4[1], T4[2] - 4, T4[3], 50)],
 "run": [run("tIn", "start-4", "s5:voice-4", 6)],
 "labels": seq("s4", [("tSign", "台積電廠房", "TSMC fab", "blue", "tsmc", 4, [300, 880]), ("tTank", "原水槽", "Raw-water tanks", "blue", "num", 4)]),
 "overlay": [card("s4", "util-water", "一天用水約三十多萬噸", "換算，約數", {"tsmc": "tsmc", "day": "day", "num": "num"})]}
P["s5"] = {"zoom": [{"to": "sys", "at": CC, "dur": 1}],
 "shot": [S_(CC, ELc), shot("sag+8", EX + 0.6, 0.6, 27, 20, 8)],
 "run": [run("eHvFlow", "start-4", "sag", 6), run("eLvFlow", "start-4", "sag", 6), run("eHvFlow", "sag+28", "s6:mains", 6), run("eLvFlow", "crash+30", "s6:mains", 6),
         run("eSag", "sag+18", "sag+42", 5), run("eRedBlink", "crash", "s6:start+10", 6), run("eTransHum", "start-4", "s6:mains", 6)],
 "labels": seq("s5", [("eTrans", "變壓器：地下高壓電接進來", "Transformer, fed underground", "blue", "elec", 6), ("eSwg", "電壓晃一下", "Voltage dip", "amber", "sag", -8), ("eTool", "敏感機台當機", "Sensitive tool trips", "amber", "crash", 4)]),
 "overlay": [card("s5", "util-sag", "電只要晃一下", "報導（2021 竹科壓降）", {"elec": "elec", "sag": "sag", "tool": "tool", "crash": "crash", "half": "half"})]}
P["s6"] = {"zoom": [{"to": "sys", "at": CC, "dur": 1}],
 "shot": [S_(CC, (EX + 0.4, -0.2, 36, 28)), shot("laptop", EX + 1.6, -0.1, 33, 28, 40)],
 "run": [run("eSag", "mains+2", "mains+26", 5), run("eBatt", "mains-2", "mains+44", 4), run("eUpsGlow", "mains", "mains+44", 6),
         run("eHvFlow", "mains+28", "s7:voice-4", 6), run("eLvFlow", "mains+28", "s7:voice-4", 6), run("eTransHum", "start-4", "s7:voice-4", 6)],
 "labels": seq("s6", [("eUps", "不斷電系統（UPS）", "Uninterruptible power supply", "amber", "backup", 2), ("eBatt", "電池架", "Battery racks", "blue", "laptop", 4),
                      ("eTool", "機台照常運作", "Tool keeps running", "blue", "mains", -32)]),
 "overlay": [card("s6", "util-ups", "市電一晃，UPS 立刻接手", "示意（不標撐多久）", {"backup": "backup", "laptop": "laptop", "mains": "mains", "ups": "ups"})]}
P["s7"] = {"zoom": [{"to": "co", "at": CC, "dur": 1}],
 "shot": [S_(CC, T7), shot("one", T7[0] + 0.6, T7[1] + 0.3, T7[2] - 5, T7[3], 50)],
 "run": [run("tFanSpin", "start-4", "s8:voice-4", 12), run("tFanSpin2", "start-4", "s8:voice-4", 12), run("tPlume", "start+10", "s8:voice-4", 8), run("tCw", "start-4", "s8:voice-4", 6),
         run("tChw", "start-4", "s8:voice-4", 6), run("tCondHot", "start-4", "s8:voice-4", 6)],
 "labels": seq("s7", [("tTower", "屋頂冷卻塔", "Rooftop cooling towers", "blue", "ten", 0), ("tCw", "冷卻水：把熱帶到塔頂", "Cooling water carries heat", "amber", "one", 0)]),
 "overlay": [card("s7", "util-power", "每十度電，一度給台積電", "報導；2025 為推算", {"ten": "ten", "one": "one", "tsmc": "tsmc"})]}
P["s8"] = {"zoom": [{"to": "sys", "at": CC, "dur": 1}],
 "shot": [S_(CC, GLc), shot("pipe-6", GX + 0.8, 0.2, 30, 16, 20), shot("tool-6", GX + 5.0, 0.2, 38, 18, 14)],
 "run": [run("gVapUp", "start-4", "s9:voice-4", 6), run("gLiqDown", "start-4", "s9:voice-4", 6), run("gN2c", "start-4", "s9:voice-4", 6), run("gN2w", "start-4", "s9:voice-4", 6),
         run("gN2t", "start-4", "s9:voice-4", 6), run("gMist", "start-4", "s9:voice-4", 8), run("gLeakBlink", "tool", "s9:voice-4", 6)],
 "labels": seq("s8", [("gAsu", "廠外空氣分離廠：做出氮氣", "Air separation plant", "blue", "gas", 2), ("gPipeU", "地下管線：壓力推著走", "Underground pipeline", "amber", "pipe", 2), ("gVmb", "閥箱：分給每台機台", "Valve box to each tool", "blue", "tool", -4)]),
 "overlay": [card("s8", "util-gas", "像自來水管：壓力推著走", "示意", {"gas": "gas", "n2": "n2", "pipe": "pipe", "out": "out", "tool": "tool", "tap": "tap"})]}
P["s9"] = {"zoom": [{"to": "co", "at": CC, "dur": 1}],
 "shot": [S_(CC, VLc)],
 "labels": seq("s9", [("v0", "超純水設備", "UPW systems", "blue", "org", 2), ("v1", "空氣分離廠", "Air separation", "blue", "lh", 2)]),
 "overlay": [sec("util-co", C, "s10:voice", "水、氣的供應商", "媒體報導；截至 2026/11/27", {"water": "water", "org": "org", "lh": "lh", "sf": "sf"}, cut=True, h=392, y=1000)]}   # 第 40 條：念完最後一家後再停 1.0 秒（到 s10 開口才換）
P["s10"] = {"zoom": [{"to": "fab", "at": "voice-1", "dur": 1}, {"to": "probe", "at": "probe-24", "dur": 1}],
 "shot": [S_("voice-1", FL1), shot("ready+36", FL0[0], FL0[1], FL0[2], FL0[3], 30), S_("probe-24", PLc), shot("probe+10", PX, 0.6, 16, 10, 40)],
 "run": [run("fAir", "start-4", "probe-24", 8), run("fFanSpin", "start-4", "probe-24", 10), run("fFanSpin2", "start-4", "probe-24", 10), run("pTest", "probe+26", FAR, 6)],
 "labels": seq("s10", [("pCard", "探針卡（下一集）", "Probe card (next)", "amber", "probe", 2),
                       ("pNeedle", "針尖碰到晶片接點", "Tips touch the pads", "blue", "probe", -30)]),
 "overlay": [sec("util-next", "voice", "s11:start", "接下來", "下一集：探針卡", {"ready": "ready", "how": "how", "probe": "probe", "kw": "kw"}, cut=True)]}
for sc in scenes:
    if sc["id"] in P: sc["props"].update(P[sc["id"]])

lv = lambda i, l, e, f, r: {"id": i, "label": l, "en": e, "field": f, "ruler": r, "art": "none", "readout": False, "note": "查證截至 2026/11/27", "noteAlways": True}
levels = [lv("use", "用水點（示意）", "POINT OF USE", "3 m", "50 cm"), lv("fab", "晶圓廠剖面（示意）", "FAB CROSS-SECTION", "20 m", "5 m"), lv("sys", "廠務系統（示意）", "FAB UTILITIES", "15 m", "2 m"),
          lv("co", "廠房與供應商（示意）", "FABS AND SUPPLIERS", "25 m", "5 m"), lv("probe", "探針卡（下一集）", "PROBE CARD", "3 m", "50 cm")]
levels[0]["handoff3D"] = True
out = {"slug": "tech-utility", "prevEpisode": "2-19：無塵室", "title": "水、氣、電（科技透明圈）", "asOf": "2026/11/27", "styleVersion": 3, "stage": "three",
       "channel": {"name": "科技透明圈", "tag": "代工的供應商", "slogan": "一支講透一件事"}, "hudSkin": "light", "sourceFollowsCaption": True,
       "voice": {"voiceName": "Iapetus", "model": "gemini-2.5-flash-preview-tts", "mode": "take", "profile": "tech-b",
                 "_說明": "旁白金手指；本支無聲版，不送 TTS（配音由頻道負責人統一做）"},
       "hud": {"levels": levels, "theme": "dark", "schematic": {"text": "", "zh": "示意，非特定廠牌實機"}, "maxLabels": 4, "smallPx": 30, "layout": "fill", "scanBand": 0.3},
       "cover": {"title": ["水、氣、電", "晶圓廠的命脈"], "sub": "洗晶圓的水要多乾淨？", "frame": 40}, "sample": False, "scenes": scenes}
json.dump(out, open(os.path.join(HERE, "script.json"), "w"), ensure_ascii=False, indent=1)
bad = []
subst = json.load(open(os.path.join(HERE, "..", "..", "scripts", "three", "tts-subst.json")))["subst"]
for s in scenes:
    t = s.get("tts") or ""
    for r in subst:
        if r["from"] in t and not (r["from"] == "上集" and "上一集" in t): bad.append((s["id"], r["from"]))
    if "上" in t: bad.append((s["id"], "念稿有上"))
    for w in ["FOUP", "EFEM", "負載鎖", "量測"]:
        if w in (s.get("narration") or "") + s["subtitle"]["zh"]: bad.append((s["id"], w))
    for src in s.get("sources", []):
        for w in ["上一集", "前一集", "預告", "series_plan", "tech-", "通例", "通識"]:
            if w in src: bad.append((s["id"], "出處列", w))
n = sum(len(re.sub(r"[，。？！、；：\s]", "", s.get("tts") or "")) for s in scenes)
tot = sum(s["durationSec"] for s in scenes)
print("念稿字數", n, "問題", bad, "無聲估計片長", round(tot, 1), "秒；各幕", [s["durationSec"] for s in scenes])
open(os.path.join(HERE, "_tts.txt"), "w").write("\n\n".join(s["tts"] for s in scenes if s.get("tts")))

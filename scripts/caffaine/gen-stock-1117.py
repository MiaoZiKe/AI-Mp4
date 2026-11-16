# 產生 caffaine-mobile-broken／excel-chart／pdf-quiz 三支的 script.json（念稿與畫面資料集中在這裡，方便一次改）。
import json, copy, sys
ROOT = "/home/user/ai-mp4/"
base = json.load(open(ROOT + "videos/caffaine-sketch-game/script.json"))
ASOF = "查證截至 2026/11/17"
def sc(id, beat, narr, zh, en, cues, kw, props, src, tag, tagColor, status, statusAt, track, view, tone, tts=None, kwc=None):
    p = {"tag": tag, "tagColor": tagColor, "status": status, "statusAt": statusAt, "track": track, "kw": kw, "view": view, "tone": tone}
    if id == "s01": p["asOf"] = ASOF
    p.update(props)
    s = {"id": id, "beat": beat, "narration": narr, "subtitle": {"zh": zh, "en": en}, "keywords": list(kw.keys()),
         "cues": [{"id": a, "text": b} for a, b in cues], "component": "IsoScene", "props": p, "sources": src, "para": 1}
    if tts: s["tts"] = tts
    return s
import re, textwrap
def fixup(scenes):
    for s in scenes:
        for r in s["props"].get("rows", []):
            if "size" in r: continue
            w = lambda x: sum(0.62 if ord(c) < 128 else 1.0 for c in x)
            r["size"] = 300 if w(r["big"]) <= 1.2 else 240 if w(r["big"]) <= 2.5 else 200
            if s["props"].get("q"): r["size"] = min(r["size"], 220)
            r["usize"] = int(min(120, max(60, (900 - 34 - w(r["big"]) * r["size"]) / max(1, w(r["unit"])))))
    for s in scenes:
        en = s["subtitle"]["en"].replace(" | ", " ")
        if en: s["subtitle"]["en"] = " | ".join(textwrap.wrap(en, 44))
        s["sources"] = [x if len(x) <= 36 else re.split("[；：（]", x)[0] for x in s["sources"]]
def build(slug, title, cover, tracker, kw_word, scenes):
    fixup(scenes)
    d = copy.deepcopy(base); d["slug"] = slug; d["title"] = title; d["asOf"] = "2026/11/17"
    d["cover"] = cover; d["tracker"] = tracker
    d["scenes"] = scenes + [{"id": "end", "narration": "", "subtitle": {"zh": "", "en": ""}, "keywords": [], "component": "IsoScene", "props": {"panel": "caffend", "keyword": kw_word}, "sources": [], "silent": True, "durationSec": 3.6}]
    json.dump(d, open(ROOT + f"videos/{slug}/script.json", "w"), ensure_ascii=False, indent=2)
    n = sum(len(s["narration"].replace(" ", "")) for s in scenes)
    print(slug, "旁白字數(不含空白)", n, "含空白", sum(len(s["narration"]) for s in scenes))
def chat(title, msgs, chips=None):
    p = {"title": title, "msgs": msgs}
    if chips: p["chips"] = chips
    return p

# ---------- 1 mobile-broken ----------
P = "caffaine-mobile-broken/"
S1 = [
 sc("s01","hook","叫 AI 做咖啡店網頁，用手機寬度打開，價目表的價格欄不見了。",
    "叫 AI 做咖啡店網頁\n用手機寬度打開\n價目表的價格欄\n不見了","Asked AI for a cafe site. | On a phone-width screen the price column is gone.",
    [("cafe","咖啡店網頁"),("ph","手機寬度"),("price","價格欄")],{"價格欄":"wrong"},
    {"rows":[{"big":"390","unit":"像素手機寬","at":"start-1","color":"primary"},{"big":"1","unit":"欄看不到","at":"price","color":"wrong"}]},
    ["Gemini 實測 2026/11/17；Playwright 手機寬度 390×844"],"事件","primary","已確定・實測","price+6",0,"kinetic","event"),
 sc("s02","check","我請它做咖啡店網頁，有價目表和推薦卡，交回一個網頁檔。",
    "我請它做咖啡店網頁\n有價目表和推薦卡\n交回一個網頁檔","I asked for a cafe page with menu, price list, cards. | It returned one web file.",
    [("say","請它做咖啡店網頁"),("list","價目表"),("fin","交回一個網頁檔")],{"價目表":"primary"},
    chat("和 AI 對話",[{"who":"me","text":"做咖啡店介紹網頁：選單、價目表、推薦卡","typeAt":"say","typeDur":34,"at":"list+8"},{"who":"ai","text":"已完成，附上一個網頁檔","check":True,"typingAt":"list+10","at":"fin+4"}]),
    ["提示詞節錄；原文見 tests/01-first.json"],"步驟 1","note","已確定・實測提示（節錄）","say+6",0,"chat","event"),
 sc("s03","twist","手機寬度打開，價目表右邊被切掉，價格欄在畫面外。",
    "手機寬度打開\n價目表右邊被切掉\n價格欄在畫面外","Opened at phone width: | the table is cut off, price column out of view.",
    [("open","手機寬度打開"),("cut","右邊被切掉"),("out","價格欄在畫面外")],{"被切掉":"wrong"},
    {"src":P+"lens-before.png","ring":[408,205,110,125],"note":"手機 390 寬","noteAt":"open","scanAt":"cut","stampAt":"out","stamp":"切","zoom":{"src":P+"before-zoom.png","w":940,"h":564,"cap":"放大：價格在畫面外"}},
    ["Playwright 實測（tests/table.py）：價格欄右緣 443px，畫面寬 390px"],"翻車","wrong","已確定・實測","cut+6",1,"lens","bug"),
 sc("s04","payoff","我跟它說：價格欄被擠到畫面外，請修好，其他不要動。",
    "我跟它說\n價格欄被擠到畫面外\n請修好\n其他不要動","I told it: price column is off-screen, fix it, | change nothing else.",
    [("say","價格欄被擠到畫面外"),("fix","請修好"),("keep","其他不要動")],{"請修好":"right"},
    chat("和 AI 對話",[{"who":"me","text":"價格欄被擠到畫面外，請修好，其他不要動","typeAt":"say","typeDur":40,"at":"fix-2"}],[{"text":"請它修好","at":"fix","color":"right"},{"text":"其他不要動","at":"keep","color":"note","hot":True}]),
    ["提示詞節錄；原文見 tests/02-fix.json"],"修正 1","right","已確定・實測提示（節錄）","say+6",1,"chat","fix"),
 sc("s05","twist","它改了，但只是變成能左右滑，價格還是要滑才看得到。",
    "它改了\n但只是變成能左右滑\n價格還是要滑\n才看得到","It changed it, but only made the table swipeable: | the price still needs a swipe.",
    [("chg","它改了"),("slide","左右滑"),("price","價格還是要滑")],{"要滑":"wrong"},
    {"src":P+"phone-fix1.png","at":"start-1","tapAt":"slide","cards":[{"icon":"phone","text":"能左右滑了","sub":"價格仍在畫面外","at":"slide","color":"note"},{"icon":"tap","text":"價格要滑才看到","sub":"沒有真的修好","at":"price","color":"wrong"}]},
    ["Playwright 實測（tests/table.py）：修一次後表格寬 500px、畫面 390px"],"翻車","wrong","已確定・實測","slide+6",1,"device","bug"),
 sc("s06","unknown","所以一句話只修了一半，因為我沒說要不用滑。這次只測一個網頁。",
    "所以一句話只修了一半\n因為我沒說要不用滑\n這次只測一個網頁","So one sentence fixed only half: I never said I wanted no swiping. | One page, one model tested.",
    [("half","只修了一半"),("nos","不用滑"),("known","一個網頁")],{"一半":"wrong"},
    {"rows":[{"big":"1 句","unit":"只修一半","at":"start-1","color":"wrong"},{"big":"1","unit":"個網頁","at":"known","color":"sky"}],"q":{"text":"別的網頁呢？","at":"known+30"}},
    ["Gemini 實測，只試 1 個網頁、1 個模型（research.md）"],"還不知道","plum","查不到・還沒測","known+30",2,"kinetic","unknown"),
 sc("s07","payoff","我再補一句：不要橫向滑動，每個品項改成一張小卡片。",
    "我再補一句\n不要橫向滑動\n每個品項\n改成一張小卡片","One more sentence: no sideways swiping, | one small card per item on phones.",
    [("say","不要橫向滑動"),("card","每個品項改成一張小卡片")],{"小卡片":"right"},
    chat("和 AI 對話",[{"who":"me","text":"不要橫向滑動，手機上每個品項改成一張小卡片","typeAt":"say","typeDur":44,"at":"card-2"}],[{"text":"說清楚要看到什麼","at":"card","color":"right","hot":True}]),
    ["提示詞節錄；原文見 tests/03-fix2.json"],"修正 2","right","已確定・實測提示（節錄）","say+6",2,"chat","fix"),
 sc("s08","payoff","這次每個品項是一張卡片，尺寸、熱量、價格，不用滑就看得到。",
    "這次每個品項\n是一張卡片\n尺寸、熱量、價格\n不用滑就看得到","Now each item is a card: size, calories, price, | all visible without swiping.",
    [("now","每個品項是一張卡片"),("all","不用滑就看得到")],{"不用滑":"right"},
    {"left":{"src":P+"phone-fix1.png","label":"修一次：要滑","color":"wrong","at":"start-1"},"right":{"src":P+"phone-fix2.png","label":"說清楚：不用滑","color":"right","at":"now"},"mid":{"text":"價格看得到","at":"all"},"aiAt":"start+8"},
    ["Playwright 實測（tests/table.py）：修兩次後價格欄在畫面內、無橫向捲動"],"修好","right","已確定・實測（1 次）","all+6",2,"split","fix"),
 sc("s09","so","所以做法三步：用手機寬度打開、說清楚要看到什麼、再打開確認。",
    "所以做法三步\n用手機寬度打開\n說清楚要看到什麼\n再打開確認","Three steps: open at phone width, | say what you want to see, check again.",
    [("so","做法三步"),("a","用手機寬度打開"),("b","說清楚要看到什麼"),("c","再打開確認")],{"三步":"right"},
    {"nodes":[{"icon":"window","label":"手機寬度打開","sub":"390 寬","color":"note","at":"start-1"},{"icon":"chip","label":"說清楚","sub":"要看到什麼","color":"primary","at":"b"},{"icon":"check","label":"再打開確認","sub":"看到才算","color":"right","at":"c"}],"lights":[{"from":"a","to":"b"},{"from":"b+2","to":"c"}],"loopAt":"c+6","chipAt":"c+26","chip":"沒好就再說一句"},
    ["做法整理；內容取自本次實測"],"所以呢","right","","so",2,"flow","fix"),
 sc("s10","cta","留言「手機」，拿這句修版提示詞。",
    "留言「手機」\n拿這句修版提示詞","Comment “手機” to get the prompt.",
    [("kw","手機"),("all","修版提示詞")],{"手機":"primary"},
    {"kicker":"想要手機版修好的提示詞","keyword":"手機","kwAt":"kw","allAt":"all","card":"提示詞＋用法","sub":"私訊給你"},
    ["提示詞與測試紀錄整理在 CaffAIne 網站"],"領取","right","","kw",2,"claim","claim"),
]
for s in S1:
    if not s["props"]["status"]: s["props"].pop("status"); s["props"].pop("statusAt")
build("caffaine-mobile-broken","叫 AI 做網站，手機打開直接爆版？一句話修好（CaffAIne 無聲版）",{"title":["手機打開","價格欄不見了"],"sub":"AI 做的網站，修兩次才對"},[["手機","note"],["說清楚","primary"],["看得到","right"]],"手機",S1)

# ---------- 2 excel-chart ----------
X = "caffaine-excel-chart/"
S2 = [
 sc("s01","hook","把 Excel 表格貼給 AI，約十一秒，就交回一個會動的圖表網頁。",
    "把 Excel 表格貼給 AI\n約十一秒\n交回一個\n會動的圖表網頁","Paste an Excel table to AI: in about 11 seconds | it returns an animated chart page.",
    [("xl","Excel 表格"),("sec","約十一秒"),("ch","會動的圖表網頁")],{"會動":"primary"},
    {"rows":[{"big":"11","unit":"秒交回網頁","at":"start-1","color":"primary"},{"big":"動","unit":"會動的圖表","at":"ch","color":"right"}]},
    ["Gemini 實測 2026/11/17；回應約 10.8 秒（tests/02-messy.json）"],"事件","primary","已確定・實測","sec+6",0,"kinetic","event"),
 sc("s02","check","我貼上從 Excel 複製的銷量表，請它畫折線圖，要有動畫。",
    "我貼上\nExcel 複製的銷量表\n請它畫折線圖\n要有動畫","I pasted sales copied from Excel, | asked for a line chart that animates on load.",
    [("say","貼上"),("ask","請它畫折線圖"),("anim","要有動畫")],{"動畫":"primary"},
    chat("和 AI 對話",[{"who":"me","text":"（貼上表格）請畫三家門市的折線圖，載入時要有動畫","typeAt":"say","typeDur":40,"at":"anim-2"},{"who":"ai","text":"已完成，附上一個網頁檔","check":True,"typingAt":"anim","at":"anim+30"}]),
    ["提示詞節錄；表格為示意資料（虛構）；原文見 tests/02-messy.json"],"步驟 1","note","已確定・實測提示（節錄）","say+6",0,"chat","event"),
 sc("s03","check","網頁打開，三條線真的一條一條畫出來。",
    "網頁打開\n三條線真的\n一條一條畫出來","Open the page: the three lines draw themselves in.",
    [("open","網頁打開"),("draw","一條一條畫出來")],{"畫出來":"right"},
    {"wide":True,"shots":[{"src":X+"messy-a1.png","at":"start-1","img":[1120,887],"label":"載入中：線正在畫"}],"items":[{"icon":"window","text":"網頁打開","sub":"一個網頁檔","at":"open","color":"primary"},{"icon":"play","text":"線畫出來","sub":"連拍截圖為證","at":"draw","color":"right"}]},
    ["Playwright 連拍（tests/shot.py）：載入 0.3 秒、0.8 秒、2 秒的畫面不同"],"實測","primary","已確定・實測","draw+6",1,"browser","principle"),
 sc("s04","twist","但是看三月，門市 B 的線掉到零。表格那格明明是空白。",
    "但是看三月\n門市 B 的線掉到零\n表格那格明明是空白","But look at March: store B drops to zero. | That cell in the table was blank.",
    [("but","但是看三月"),("zero","掉到零"),("blank","那格明明是空白")],{"掉到零":"wrong"},
    {"src":X+"lens-messy.png","ring":[215,550,110,110],"note":"三月・門市 B","noteAt":"but","scanAt":"zero","stampAt":"blank","stamp":"零","zoom":{"src":X+"messy-zoom.png","w":960,"h":576,"cap":"放大：空白被畫成 0"}},
    ["Playwright 實測截圖；表格 3 月門市 B 為空白（tests/sales-messy.tsv）"],"翻車","wrong","已確定・實測","zero+6",1,"lens","bug"),
 sc("s05","why","空白，不等於零。這是 AI 自己的決定，我沒有交代。",
    "空白，不等於零\n這是 AI 自己的決定\n我沒有交代","Blank is not zero. | That was AI's own call; I never said.",
    [("blank","空白，不等於零"),("decide","AI 自己的決定")],{"不等於零":"wrong"},
    {"rows":[{"big":"0","unit":"不是空白","at":"start-1","color":"wrong"},{"big":"空","unit":"才是沒有資料","at":"decide","color":"right"}]},
    ["Playwright 實測；成因為推測，非模型自述"],"原因","primary","分析推測・非實測","decide+6",1,"kinetic","principle"),
 sc("s06","payoff","我補一句：空白代表沒資料，別畫成零，線斷開，標上無資料。",
    "我補一句\n空白代表沒資料\n別畫成零\n線斷開，標上無資料","I added: blank means no data. Don't plot zero; | break the line and label it.",
    [("say","空白代表沒資料"),("brk","線斷開"),("lab","標上無資料")],{"沒資料":"right"},
    chat("和 AI 對話",[{"who":"me","text":"空白代表沒有資料，別畫成 0，那一段線斷開並標示無資料","typeAt":"say","typeDur":44,"at":"lab-2"}],[{"text":"線斷開","at":"brk","color":"right"},{"text":"標「無資料」","at":"lab","color":"note","hot":True}]),
    ["提示詞節錄；原文見 tests/03-fix.json"],"修正","right","已確定・實測提示（節錄）","say+6",2,"chat","fix"),
 sc("s07","payoff","改完，三月那一段斷開，標著無資料，其他兩條線沒動。",
    "改完\n三月那一段斷開\n標著無資料\n其他兩條線沒動","Fixed: March breaks and says no data. | The other two lines are unchanged.",
    [("done","三月那一段斷開"),("lab","標著無資料"),("keep","其他兩條線沒動")],{"斷開":"right"},
    {"layout":"stack","top":{"src":X+"messy.png","label":"修之前","color":"wrong","at":"start-1"},"bottom":{"src":X+"fix.png","label":"修之後","color":"right","at":"done"},"mids":[{"text":"無資料","at":"lab","color":"note"},{"text":"其他沒動","at":"keep","color":"right","kind":"stamp"}]},
    ["Playwright 實測（tests/shot.py）；只試 1 次"],"修好","right","已確定・實測（1 次）","keep+6",2,"split","fix"),
 sc("s08","unknown","不過我只試了兩份小表格，一個模型，更大的表格行不行，還不知道。",
    "不過我只試了兩份小表格\n一個模型\n更大的表格行不行\n還不知道","But I tried only two small tables and one model. | Bigger tables: unknown.",
    [("known","兩份小表格"),("q","還不知道")],{"還不知道":"wrong"},
    {"rows":[{"big":"2","unit":"份小表格","at":"start-1","color":"primary"},{"big":"1","unit":"個模型","at":"known+26","color":"sky"}],"q":{"text":"更大的表格呢？","at":"q"},"status":"查不到・還沒測","statusAt":"q"},
    ["Gemini 實測，只試 2 份小表格、1 個模型（research.md）"],"還不知道","plum","","q",2,"kinetic","unknown"),
 sc("s09","so","所以做法三步：貼表格、看圖有沒有怪點，有就說清楚。",
    "所以做法三步\n貼表格\n看圖有沒有怪點\n有就說清楚","Three steps: paste the table, check for odd points, | and say it clearly if so.",
    [("so","做法三步"),("a","貼表格"),("b","看圖有沒有怪點"),("c","有就說清楚")],{"三步":"right"},
    {"nodes":[{"icon":"file","label":"貼表格","sub":"直接複製貼上","color":"note","at":"start-1"},{"icon":"mag","label":"看有沒有怪點","sub":"零、缺口、跳動","color":"primary","at":"b"},{"icon":"chip","label":"說清楚","sub":"空白代表什麼","color":"right","at":"c"}],"lights":[{"from":"a","to":"b"},{"from":"b+2","to":"c"}],"loopAt":"c+6","chipAt":"c+26","chip":"有毛病就說一句"},
    ["做法整理；內容取自本次實測"],"所以呢","right","","so",2,"flow","fix"),
 sc("s10","cta","留言「圖表」，拿這句貼表格的提示詞。",
    "留言「圖表」\n拿這句貼表格的提示詞","Comment “圖表” to get the prompt.",
    [("kw","圖表"),("all","貼表格的提示詞")],{"圖表":"primary"},
    {"kicker":"想要表格變圖表的提示詞","keyword":"圖表","kwAt":"kw","allAt":"all","card":"提示詞＋用法","sub":"私訊給你"},
    ["提示詞與測試紀錄整理在 CaffAIne 網站"],"領取","right","","kw",2,"claim","claim"),
]
for s in S2:
    if not s["props"]["status"]: s["props"].pop("status"); s["props"].pop("statusAt")
build("caffaine-excel-chart","Excel 表格丟給 AI，變成會動的圖表（CaffAIne 無聲版）",{"title":["Excel 表格","變成會動的圖表"],"sub":"空白格會被當成 0，要說清楚"},[["貼表格","note"],["AI 畫圖","primary"],["會動","right"]],"圖表",S2)

# ---------- 3 pdf-quiz ----------
Q = "caffaine-pdf-quiz/"
S3 = [
 sc("s01","hook","一份講義丟給 AI，約十秒，就變成能自己測驗的小考網頁。",
    "一份講義丟給 AI\n約十秒\n變成能自己測驗的\n小考網頁","One handout to AI: in about ten seconds | it's a self-grading quiz page.",
    [("hand","一份講義"),("sec","約十秒"),("quiz","小考網頁")],{"小考":"primary"},
    {"rows":[{"big":"10","unit":"秒交回網頁","at":"start-1","color":"primary"},{"big":"5","unit":"題小考","at":"quiz","color":"right"}]},
    ["Gemini 實測 2026/11/17；回應約 9.6 秒（tests/01-first.json）"],"事件","primary","已確定・實測","sec+6",0,"kinetic","event"),
 sc("s02","check","我貼上虛構講義，請它出五題，選完有對錯，最後算分。",
    "我貼上虛構講義\n請它出五題\n選完有對錯\n最後算分","I pasted a made-up meeting handout and asked for five | multiple-choice questions, instant feedback, final score.",
    [("paste","貼上虛構講義"),("ask","出五題"),("end","最後算分")],{"五題":"primary"},
    chat("和 AI 對話",[{"who":"me","text":"（貼上講義）出 5 題選擇題，選完顯示對錯，最後給總分","typeAt":"paste","typeDur":40,"at":"end-2"},{"who":"ai","text":"已完成，附上一個網頁檔","check":True,"typingAt":"end","at":"end+30"}]),
    ["提示詞節錄；講義為示意（虛構）；原文見 tests/01-first.json"],"步驟 1","note","已確定・實測提示（節錄）","paste+6",0,"chat","event"),
 sc("s03","check","它交回網頁檔，一次一題，選完跳出對錯和解釋。",
    "它交回網頁檔\n一次一題\n選完跳出\n對錯和解釋","It returned a web file: one question at a time, | right/wrong and an explanation right after.",
    [("file","網頁檔"),("one","一次一題"),("expl","對錯和解釋")],{"一次一題":"primary"},
    {"shots":[{"src":Q+"q1.png","at":"start-1","label":"一次一題"},{"src":Q+"wrong.png","at":"expl","label":"選完跳出解釋"}],"items":[{"icon":"file","text":"一個網頁檔","sub":"AI 交回來的","at":"file","color":"note"},{"icon":"text","text":"一次一題","sub":"共 5 題","at":"one","color":"primary"},{"icon":"check","text":"對錯＋解釋","sub":"選完立刻出現","at":"expl","color":"right"}]},
    ["Playwright 實測截圖（tests/play.py）"],"實測","primary","已確定・實測","expl+6",1,"browser","principle"),
 sc("s04","check","我逐題對過講義，五題都對得上。",
    "我逐題對過講義\n五題\n都對得上","I checked every question against the handout: | all five match.",
    [("cmp","逐題對過講義"),("five","五題"),("ok","都對得上")],{"對得上":"right"},
    {"mode":"list","head":{"text":"我逐題對照講義","at":"start-1","color":"primary"},"items":[{"text":"題目只用講義內容","sub":"5 題","at":"cmp","color":"primary"},{"text":"正確答案對得上","sub":"逐題核對","at":"five","color":"right"},{"text":"解釋貼近原文","sub":"沒有多出來的規定","at":"ok","color":"note"}]},
    ["人工逐題核對講義（research.md）；只核對這一份"],"核對","right","已確定・人工核對","five+6",1,"check","principle"),
 sc("s05","twist","但有個小毛病：選完後選項全變灰，看不出我選了哪個，哪個才對。",
    "但有個小毛病\n選完後選項全變灰\n看不出我選了哪個\n哪個才對","But a small bug: after choosing, all options turn grey, | so I can't tell which I chose or which is right.",
    [("but","有個小毛病"),("gray","選項全變灰"),("which","看不出我選了哪個")],{"變灰":"wrong"},
    {"src":Q+"lens-wrong.png","ring":[47,351,446,208],"note":"選完以後","noteAt":"but","scanAt":"gray","stampAt":"which","stamp":"灰","zoom":{"src":Q+"wrong-zoom.png","w":960,"h":460,"cap":"放大：選項全灰"}},
    ["Playwright 實測截圖（tests/play.py）"],"翻車","wrong","已確定・實測","gray+6",1,"lens","bug"),
 sc("s06","payoff","我說：答對標綠色，答錯標紅色，也把正確答案標綠。",
    "我說\n答對標綠色\n答錯標紅色\n也把正確答案標綠","I said: mark my pick green if right, red if wrong, | and show the right answer in green.",
    [("say","答對標綠色"),("rg","答錯標紅色"),("fix","正確答案標綠")],{"標綠":"right"},
    chat("和 AI 對話",[{"who":"me","text":"我選的選項答對標綠色、答錯標紅色，答錯時把正確答案也標綠色。其他不要動","typeAt":"say","typeDur":46,"at":"fix-2"}],[{"text":"答對綠、答錯紅","at":"rg","color":"right"},{"text":"其他不要動","at":"fix","color":"note","hot":True}]),
    ["提示詞節錄；原文見 tests/02-fix.json"],"修正","right","已確定・實測提示（節錄）","say+6",2,"chat","fix"),
 sc("s07","payoff","改完，選錯的是紅色，正確答案是綠色，一眼就看懂。",
    "改完\n選錯的是紅色\n正確答案是綠色\n一眼就看懂","Fixed: the wrong pick is red, the right answer green, | easy to see at a glance.",
    [("done","選錯的是紅色"),("ok","正確答案是綠色"),("see","一眼就看懂")],{"一眼":"right"},
    {"left":{"src":Q+"wrong.png","label":"修之前：全灰","color":"wrong","at":"start-1"},"right":{"src":Q+"wrongfix.png","label":"修之後：紅綠","color":"right","at":"done"},"mid":{"text":"看懂了","at":"see"},"aiAt":"start+8"},
    ["Playwright 實測截圖（tests/play.py）；只試 1 次"],"修好","right","已確定・實測（1 次）","ok+6",2,"split","fix"),
 sc("s08","payoff","我故意答錯第一題，其餘答對，總分八十分。",
    "我故意答錯第一題\n其餘答對\n總分八十分","I got question 1 wrong on purpose, the rest right: | 80 points, scored correctly.",
    [("bad","故意答錯第一題"),("rest","其餘答對"),("eighty","八十分")],{"八十分":"right"},
    {"rows":[{"big":"4/5","unit":"答對","at":"start-1","color":"primary"},{"big":"80","unit":"分，算對了","at":"eighty","color":"right"}]},
    ["Playwright 實測（tests/play.py）：1 題答錯、4 題答對，顯示總分 80 分"],"結果","right","已確定・實測（1 次）","eighty+6",2,"kinetic","fix"),
 sc("s09","unknown","不過只試了這一份講義，更長的講義行不行，還不知道。",
    "不過只試了這一份講義\n更長的講義行不行\n還不知道","But I tried only this one handout. | Longer, harder ones: unknown.",
    [("known","只試了這一份講義"),("q","還不知道")],{"還不知道":"wrong"},
    {"rows":[{"big":"1","unit":"份講義","at":"start-1","color":"primary"},{"big":"1","unit":"個模型","at":"known+26","color":"sky"}],"q":{"text":"更長的講義呢？","at":"q"},"status":"查不到・還沒測","statusAt":"q"},
    ["Gemini 實測，只試 1 份講義、1 個模型（research.md）"],"還不知道","plum","","q",2,"kinetic","unknown"),
 sc("s10","so","所以做法三步：貼講義、檢查題目、哪裡看不懂就說。",
    "所以做法三步\n貼講義\n檢查題目\n哪裡看不懂就說","Three steps: paste the handout, check the questions, | and say what's unclear.",
    [("so","做法三步"),("a","貼講義"),("b","檢查題目"),("c","哪裡看不懂就說")],{"三步":"right"},
    {"nodes":[{"icon":"file","label":"貼講義","sub":"整段貼上","color":"note","at":"start-1"},{"icon":"mag","label":"檢查題目","sub":"對照講義","color":"primary","at":"b"},{"icon":"chip","label":"哪裡不懂就說","sub":"一句話改","color":"right","at":"c"}],"lights":[{"from":"a","to":"b"},{"from":"b+2","to":"c"}],"loopAt":"c+6","chipAt":"c+26","chip":"有毛病就說一句"},
    ["做法整理；內容取自本次實測"],"所以呢","right","","so",2,"flow","fix"),
 sc("s11","cta","留言「小考」，拿這句出題提示詞。",
    "留言「小考」\n拿這句出題提示詞","Comment “小考” to get the prompt.",
    [("kw","小考"),("all","出題提示詞")],{"小考":"primary"},
    {"kicker":"想要講義變小考的提示詞","keyword":"小考","kwAt":"kw","allAt":"all","card":"提示詞＋用法","sub":"私訊給你"},
    ["提示詞與測試紀錄整理在 CaffAIne 網站"],"領取","right","","kw",2,"claim","claim"),
]
for s in S3:
    if not s["props"]["status"]: s["props"].pop("status"); s["props"].pop("statusAt")
build("caffaine-pdf-quiz","一份講義丟給 AI，變成能自己測驗的小考網頁（CaffAIne 無聲版）",{"title":["一份講義","變成能測驗的小考"],"sub":"選完要看得出對錯，得再補一句"},[["講義","note"],["AI 出題","primary"],["能測驗","right"]],"小考",S3)

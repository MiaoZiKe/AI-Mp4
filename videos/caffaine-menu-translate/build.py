# node scripts/caffaine/autoscript.mjs caffaine-menu-translate --force && python3 videos/caffaine-menu-translate/build.py
import json
from PIL import Image
F = "videos/caffaine-menu-translate/script.json"; d = json.load(open(F)); S = {s["id"]: s["props"] for s in d["scenes"]}
P = "caffaine-menu-translate/"
Image.open("public/" + P + "a2card.png").crop((20, 100, 1060, 520)).resize((960, 388), Image.LANCZOS).save("public/" + P + "a2zoom.png")
S["s01"]["cards"] = [{"icon": "phone", "text": "拍一張菜單", "sub": "日文，程式畫的示意", "at": "k1", "color": "primary"}, {"icon": "text", "text": "叫 AI 翻譯", "sub": "只說：幫我翻譯", "at": "k2", "color": "wrong"}]
S["s01"]["tapAt"] = "k3"
S["s02"]["msgs"] = [{"who": "me", "attach": {"src": P + "phone.png", "cap": "菜單照片"}, "at": "start+6"}, {"who": "me", "text": "幫我翻譯這張菜單。", "typeAt": "k1", "typeDur": 30, "at": "k3+14"}]
S["s05"]["msgs"] = [{"who": "me", "text": "每道菜用一句話說明它是什麼、主要食材和做法；菜單上標了過敏原的要照抄標出來", "typeAt": "k1", "typeDur": 44, "at": "k3+16"}]
p = S["s04"]; p.update(native=[540, 560], ring=[10, 52, 520, 58], note="親子丼", stamp="？", zoom={"src": P + "a2zoom.png", "w": 960, "h": 388, "cap": "放大：只有名字，沒說明"})
txt = open("videos/caffaine-menu-translate/tests/answer-B.txt", encoding="utf-8").read().split("\n")
p = S["s06"]; p["lines"] = [{"t": txt[i - 1].strip(), "n": i, "at": "start-1" if j == 0 else f"k1+{j*10}", "dur": 26, **({"mark": "淋上雞蛋", "markAt": "k3"} if i == 9 else {})} for j, i in enumerate([8, 9, 10])]
p["before"] = 0; p["size"] = 44; p["hl"] = 1; p["hlAt"] = "k3"
S["s07"]["rows"] = [{"big": "0", "unit": "道標不確定", "at": "start-10", "color": "wrong", "size": 230, "usize": 110}, {"big": "全是它補的", "unit": "", "at": "k3", "color": "note", "size": 140, "usize": 110}]
json.dump(d, open(F, "w"), ensure_ascii=False, indent=1)

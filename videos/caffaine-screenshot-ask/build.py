# 重產：node scripts/caffaine/autoscript.mjs caffaine-screenshot-ask --force && python3 videos/caffaine-screenshot-ask/build.py
import json
F = "videos/caffaine-screenshot-ask/script.json"; d = json.load(open(F)); S = {s["id"]: s["props"] for s in d["scenes"]}
P = "caffaine-screenshot-ask/"
txt = open("videos/caffaine-screenshot-ask/tests/answer-A-run2.txt", encoding="utf-8").read().split("\n")
ln = lambda key: next(i + 1 for i, t in enumerate(txt) if key in t)
# s01 讀圖開場：整個橫幅圈起來，放大圖＝橫幅
p = S["s01"]; p.update(native=[540, 960], ring=[28, 126, 484, 186], note="看不懂的畫面", stamp="？", zoom={"src": P + "zoom.png", "w": 960, "h": 460, "cap": "放大：紅字那一塊"})
# s02 手機框＋兩張卡
p = S["s02"]; p["cards"] = [{"icon": "phone", "text": "第一步：截圖", "sub": "整個畫面截下來", "at": "k1", "color": "primary"}, {"icon": "tap", "text": "紅字要在裡面", "sub": "錯誤訊息別切掉", "at": "k3", "color": "wrong"}]
# s03 對話：先附截圖，再打問句
p = S["s03"]; p["msgs"] = [{"who": "me", "attach": {"src": P + "screen.png", "cap": "截圖"}, "at": "start+6"}, {"who": "me", "text": "請告訴我它在說什麼、為什麼會這樣、我該怎麼辦，請一步一步說。", "typeAt": "k1", "typeDur": 40, "at": "k3+14"}]
# s04 回答節錄（程式檔逐行對 answer-A-run2.txt）
p = S["s04"]; p["lines"] = [
  {"t": txt[ln("您目前的手機只剩下") - 1].strip(), "n": ln("您目前的手機只剩下"), "at": "start-1", "dur": 30, "mark": "0.3 GB", "markAt": "k1"},
  {"t": txt[ln("第一步：點擊") - 1].strip(), "n": ln("第一步：點擊"), "at": "k2-6", "dur": 14},
  {"t": txt[ln("點選畫面上的藍色框框按鈕") - 1].strip(), "n": ln("點選畫面上的藍色框框按鈕"), "at": "k2+4", "dur": 30, "mark": "管理儲存空間", "markAt": "k3"}]
p["hl"] = 2; p["hlAt"] = "k3"; p["before"] = 0; p["size"] = 44
# s06 左右對照：縮很小（讀對）vs 只截一半（猜）
p = S["s06"]; [p.pop(k, None) for k in ("layout", "top", "bottom")]
p.update(left={"src": P + "small-up.png", "label": "縮到很小：讀對", "color": "right", "at": "start-1", "native": [540, 960], "crop": [0, 100, 540, 640]},
         right={"src": P + "cropped.png", "label": "只截一半：開始猜", "color": "wrong", "at": "k2", "native": [540, 640], "crop": [0, 0, 540, 640]},
         mid={"text": "猜", "at": "k3"}, aiAt="start+8", size="big", wl=380, wr=380)
# s07 大字
p = S["s07"]; p["rows"] = [{"big": "先猜 Wi-Fi", "unit": "", "at": "start-10", "color": "wrong", "size": 150, "usize": 110}, {"big": "其實是空間", "unit": "", "at": "k3", "color": "right", "size": 140, "usize": 110}]
json.dump(d, open(F, "w"), ensure_ascii=False, indent=1); print("patched")

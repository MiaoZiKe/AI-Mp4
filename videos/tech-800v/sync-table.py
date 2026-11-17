# 產生「逐句念稿 ↔ 該時刻畫面」對照表（videos/tech-800v/sync-table.md）與每句截圖拼圖（out/tech-800v-sync.jpg）
import json, os
from PIL import Image, ImageDraw, ImageFont
R = "/home/user/ai-mp4"
sb = json.load(open(f"{R}/videos/tech-800v/storyboard.json")); sc = sb.get("scenes", sb)
EV = {
 ("s1","rack"):"標籤「AI 機櫃 1 MW」指到機櫃框；電源架亮、風扇轉", ("s1","bar"):"銅排標籤指到側邊粗銅排；電流光點開始往上流", ("s1","kg"):"標籤變「約 200 kg」＋蓋章廠商估算；銅排漸紅、熱波往外擴",
 ("s1","why"):"蓋章「？」", ("s1","volt"):"蓋章「電壓」",
 ("s2","now"):"標籤「電源架」指到橘色電源架；架亮起", ("s2","v54"):"標籤變「54 V」；氣流箭頭吸過機櫃", ("s2","fat"):"標籤「粗銅條」；兩側銅排電流往上、每層夾片分岔電流", ("s2","busbar"):"標籤「銅排」",
 ("s3","power"):"2D 卡出現「P ＝」；3D 切到銅排對照、電源端亮", ("s3","vxi"):"卡上補「V × I」「功率不變」；燈亮", ("s3","low"):"卡上 54 V 欄＋電壓條（短）；標籤「54 V 供電」", ("s3","big"):"電流條拉長到 18,519 A、截面光點變密；3D 上條光點密集",
 ("s4","cur"):"標籤「電流大」指到上條銅排", ("s4","hot"):"標籤「燙」；銅排漸紅、熱波；卡上發熱條開始長", ("s4","thick"):"標籤「越做越粗」；卡上截面變大", ("s4","x15"):"800 V 欄出現：電流 1,250 A；下條光點稀疏、標籤「800 V 供電」", ("s4","x219"):"發熱條到頂「×219」，800 V 欄「×1」；蓋章 ×219",
 ("s5","v800"):"標籤「800 V」、卡上 800 V 字放大一下", ("s5","amp"):"標籤「電流 1/15」、1,250 A 放大一下", ("s5","thin"):"粗銅排下沉、細銅排落下接上；卡上截面縮成 1/15",
 ("s6","why"):"鏡頭到降壓路徑總覽，標籤「800 V」指到電源側櫃", ("s6","chip"):"鏡頭切電路板近景：標籤「開關晶片」→「電感」→「晶片 約 1 V」；電流由輸入接點流過走線、開關、電感、電容到晶片；2D 卡「降一級怎麼做」", ("s6","hi"):"回總覽：標籤「800 V」、電流離開電源側櫃；卡「電壓逐級降下來」出現 800 V 柱", ("s6","steps"):"電流流入降壓模組 A、模組亮；標籤「約 50 V」；卡上 50 V 柱", ("s6","many"):"流入模組 B；標籤「約 12 V」；卡上 12 V 柱、再到晶片 約 1 V",
 ("s7","y2027"):"蓋章「2027 廠商規劃」", ("s7","use"):"電源側櫃從右側滑入；粗銅排淡出、細銅排落下", ("s7","tw"):"引線「台達電 電源櫃」指到側櫃、「台達電 電源架」指到電源架；蓋章媒體報導", ("s7","lite"):"引線「光寶科 電源櫃」指到側櫃", ("s7","cab"):"側櫃保持發亮、電流通過連接排",
 ("s8","save"):"卡「整套能省多少」出現虛線 ？", ("s8","none"):"卡上出現「廠商目標：總成本最多少三成」", ("s8","real"):"卡上章「目標值，非實測」",
 ("s9","so"):"卡「一句話」標題「所以」", ("s9","up"):"卡上「電壓 拉高 ↑」", ("s9","small"):"卡上「電流 變小 ↓」", ("s9","slim"):"卡上「銅排 變細 ↓」；標籤「細銅排」指到細銅排、電流通過", ("s9","full"):"蓋章「完整解說」", ("s9","kw"):"蓋章「留言「供電」」", ("s9","next"):"片尾卡：下一支 ▸ 晶片設計公司為什麼沒有工廠",
}
sd = json.load(open(f"{R}/videos/tech-800v/script.json"))
lines = {s["id"]: s for s in sd["scenes"]}
out = ["# tech-800v 逐句念稿 ↔ 該時刻畫面對照表（storyboard 抽 cue；截圖＝cue 後 0.3 秒）", "", "| 幕 | cue | 秒 | 念到 | 該時刻畫面 | 截圖 |", "|---|---|---|---|---|---|"]
tiles = []
for s in sc:
    for c in s.get("cues", []):
        f = c.get("frame", c.get("abs")); img = f"out/tech-800v-peek/tech-800v-f{f+9}.png"
        out.append(f"| {s['id']} | {c['id']} | {f/30:.1f} | {c['text']} | {EV.get((s['id'], c['id']), '')} | {os.path.basename(img)} |")
        if os.path.exists(f"{R}/{img}"): tiles.append((f"{s['id']} {c['text']} {f/30:.1f}s", Image.open(f"{R}/{img}").resize((270, 480))))
open(f"{R}/videos/tech-800v/sync-table.md", "w").write("\n".join(out) + "\n")
cols = 7; rows = (len(tiles) + cols - 1) // cols
sheet = Image.new("RGB", (270 * cols, 500 * rows), "white"); d = ImageDraw.Draw(sheet)
for i, (t, im) in enumerate(tiles):
    x, y = (i % cols) * 270, (i // cols) * 500; sheet.paste(im, (x, y + 20)); d.text((x + 4, y + 4), t, fill="black")
sheet.save(f"{R}/out/tech-800v-sync.jpg", quality=82); print(len(tiles))

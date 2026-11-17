# 產生「逐句念稿 ↔ 該時刻畫面」對照表（videos/tech-icdesign/sync-table.md）與每句截圖拼圖（out/tech-icdesign-sync.jpg）
import json, os, subprocess, sys
from PIL import Image, ImageDraw
R = "/home/user/ai-mp4"; VER = sys.argv[1] if len(sys.argv) > 1 else "v1"
sb = json.load(open(f"{R}/videos/tech-icdesign/storyboard.json")); sc = sb.get("scenes", sb)
EV = {
 ("s1","co"):"2D 縮放第一級：整顆晶片功能區塊（CPU／NPU／記憶體／I/O）；大字「只交設計圖」；章「晶片設計公司」", ("s1","nofab"):"蓋章「沒有工廠」", ("s1","pic"):"標籤「交出去：一份設計圖」",
 ("s2","how"):"標籤「怎麼來？」", ("s2","zoom"):"標籤「放大來看」", ("s2","inside"):"標籤「晶片・約 1 公分」",
 ("s3","blk"):"標籤「功能區塊」（晶片四塊）", ("s3","row"):"放大到一個區塊：標準元件一行行；標籤「一行一行排」", ("s3","cell"):"再放大到標準元件列：標籤「標準元件」，正中央一顆反相器", ("s3","tr"):"放大到電晶體層級交棒 3D；標籤「一顆反相器（開關）」",
 ("s4","open"):"3D 十二層由下往上拆開（爆炸剖析）；標籤「矽基板」", ("s4","tr"):"標籤「電晶體」指到最底層主動區與閘極", ("s4","top"):"標籤「第 1 層金屬 M1」→M2→M3→M4→最上層 M5 依序出現；章「示意 5 層・實際 10～15 層」", ("s4","link"):"所有通孔與接點亮起（連起來）",
 ("s5","sig"):"鏡頭拉遠、白色訊號光點出現在 M5 左端；2D 剖面卡出現", ("s5","wire"):"光點沿 M5 金屬線前進；標籤「訊號從這裡進來」", ("s5","top"):"光點在最上層 M5", ("s5","lay"):"光點一層一層穿過通孔往下（M4→M3→M2→M1）；標籤「穿孔：連到下一層」", ("s5","tr"):"光點到閘極：閘極亮、卡上閘極閃一圈；標籤「閘極通電，開關動」", ("s5","out"):"輸出光點從汲極往上一層層流出右端；卡上「流出去」",
 ("s6","hand"):"鏡頭到設計流程站；2D 卡「手畫每一條線 ✕」", ("s6","spec"):"規格白紙落下、亮起；標籤「規格」；卡上「規格」亮", ("s6","code"):"程式編輯器落下、資料光點流過去；標籤「程式（RTL）」", ("s6","sim"):"模擬螢幕落下、紅色游標掃過方波；標籤「模擬驗證」", ("s6","pr"):"布局板落下、第一組繞線長出；標籤「布局繞線」", ("s6","wire"):"第二組繞線長出；之後光罩板落下，標籤「光罩」",
 ("s7","pic"):"鏡頭到光罩曝光柱；標籤「光源」", ("s7","fab"):"標籤「曝光機的鏡組」", ("s7","mask"):"光罩從上落下；標籤「光罩」", ("s7","light"):"光束與光點由上而下穿過光罩、鏡組", ("s7","four"):"2D 卡「光罩 vs 晶圓」：縮小 4 倍；標籤「縮小鏡組」", ("s7","wafer"):"中央晶粒被打亮、縮小的圖案出現；標籤「晶圓上的圖案」",
 ("s8","who"):"鏡頭到整顆晶片與設計電腦", ("s8","guc"):"引線「創意、世芯：設計服務」指到晶片本體；卡上第一列；章「媒體報導」", ("s8","em"):"引線「力旺：記憶體矽智財」指到記憶體區塊；卡上第二列", ("s8","andes"):"引線「晶心科：CPU 智財」指到 CPU 區塊", ("s8","eda"):"引線「三大 EDA：設計軟體」指到設計電腦；卡上第三列",
 ("s9","done"):"標籤「設計好的晶片」", ("s9","make"):"晶片亮一下；卡「設計公司 → 晶圓代工」", ("s9","next"):"卡上「晶圓代工」出現", ("s9","fab2"):"卡上「把它做出來」", ("s9","full"):"蓋章「完整解說在留言」", ("s9","kw"):"片尾卡：下一支 ▸ 晶圓代工；留言「IC設計」",
}
out = [f"# tech-icdesign 逐句念稿 ↔ 該時刻畫面對照表（storyboard 抽 cue；截圖＝成片 out/tech-icdesign.{VER}.mp4 在 cue 後 0.3 秒）", "", "| 幕 | cue | 秒 | 念到 | 該時刻畫面 | 截圖 |", "|---|---|---|---|---|---|"]
tiles = []
os.makedirs(f"{R}/out/tech-icdesign-sync", exist_ok=True)
for s in sc:
    for c in s.get("cues", []):
        f = c.get("frame", c.get("abs")); img = f"out/tech-icdesign-sync/{s['id']}-{c['id']}.png"
        subprocess.run(["ffmpeg", "-loglevel", "error", "-y", "-ss", f"{(f+9)/30:.3f}", "-i", f"{R}/out/tech-icdesign.{VER}.mp4", "-frames:v", "1", f"{R}/{img}"])
        out.append(f"| {s['id']} | {c['id']} | {f/30:.1f} | {c['text']} | {EV.get((s['id'], c['id']), '')} | {os.path.basename(img)} |")
        if os.path.exists(f"{R}/{img}"): tiles.append((f"{s['id']} {c['text']} {f/30:.1f}s", Image.open(f"{R}/{img}").resize((270, 480))))
open(f"{R}/videos/tech-icdesign/sync-table.md", "w").write("\n".join(out) + "\n")
cols = 7; rows = (len(tiles) + cols - 1) // cols
sheet = Image.new("RGB", (270 * cols, 500 * rows), "white"); d = ImageDraw.Draw(sheet)
for i, (t, im) in enumerate(tiles):
    x, y = (i % cols) * 270, (i // cols) * 500; sheet.paste(im, (x, y + 20)); d.text((x + 4, y + 4), t, fill="black")
sheet.save(f"{R}/out/tech-icdesign-sync.jpg", quality=82); print(len(tiles))

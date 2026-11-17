# 產生「逐句念稿 ↔ 該時刻畫面」對照表（videos/tech-foundry/sync-table.md）與每句截圖拼圖（out/tech-foundry-sync.jpg）
import json, os, subprocess, sys
from PIL import Image, ImageDraw, ImageFont
R = "/home/user/ai-mp4"; VER = sys.argv[1] if len(sys.argv) > 1 else "v1"
sb = json.load(open(f"{R}/videos/tech-foundry/storyboard.json")); sc = sb.get("scenes", sb)
EV = {
 ("s1","wc"):"大字「台積電 72.5%」；排氣塔蒸氣上冒、貨車開過；2D 甜甜圈卡出現", ("s1","pct"):"甜甜圈長到 72.5%，中央「72.5% 台積電」", ("s1","tsmc"):"先進廠區藍帶閃；圖例「台積電 72.5%」放大", ("s1","ask"):"黃條「設計公司為什麼不自己蓋廠？」",
 ("s2","build"):"標籤「一座先進晶圓廠」指到先進廠區（藍帶閃）；2D 右邊代工廠亮", ("s2","cost"):"紅色成本條由左長到「一百億美元以上」", ("s2","nofit"):"短橫條「訂單不夠大，就攤不平」", ("s2","design"):"左邊設計公司亮、設計圖箭頭往右", ("s2","fab"):"右邊代工廠亮、晶片箭頭往左",
 ("s3","enter"):"鏡頭進無塵室，標籤「天花板的風扇濾網」指到天花板；右上「無塵室 ×20」", ("s3","air"):"藍色氣流線由濾網往下，穿過地板往兩側、沿回風牆往上；2D 剖面藍箭頭往下", ("s3","dust"):"橘色灰塵點隨氣流穿過格柵地板；標籤「格柵地板」",
 ("s4","box"):"天車上的傳送盒亮橘；標籤「晶圓傳送盒（FOUP）」；2D「傳送盒」亮", ("s4","rail"):"天車沿天花板軌道往右走；標籤「天花板軌道」", ("s4","tool"):"吊帶放長、傳送盒降到機台裝載口；2D「機台」亮", ("s4","arm"):"鏡頭飛進機台內；伸縮臂伸進傳送盒、載片刀托起最底下一片晶圓；標籤「機械手臂」", ("s4","put"):"載片刀帶晶圓沿軌道到反應腔、伸進槽口；反應腔視窗亮紫光；標籤「反應腔」",
 ("s5","zw"):"鏡頭到晶圓（右上「晶圓 ×2000」）；2D 卡晶圓圖出現", ("s5","dies"):"晶圓上晶粒格；標籤「一顆晶粒」；被挑的一顆浮起", ("s5","open"):"鏡頭到晶粒（×10⁴），六層依序往上爆炸拉開；標籤「矽基板」", ("s5","tr"):"標籤「電晶體」；藍（源極汲極）橘（閘極）方塊閃", ("s5","metal"):"標籤「金屬線（多層）」「接點」；層層落回、電訊號藍點由接點往下到電晶體",
 ("s6","two"):"鏡頭回廠區（×1）；2D 對照卡奈米刻度尺出現", ("s6","adv"):"先進廠區藍帶亮＋標籤「先進製程廠區」；卡左欄亮", ("s6","phone"):"左欄晶片：手機處理器、AI 加速晶片", ("s6","mat"):"橘帶、青帶亮＋標籤「成熟製程廠區」；卡右欄亮", ("s6","car"):"右欄晶片：車用晶片、電源管理晶片",
 ("s7","div"):"2D「各家主力」卡出現", ("s7","ts"):"引線「台積電 先進＋成熟」指到先進廠區；先進、成熟兩區一起閃", ("s7","um"):"引線「聯電 成熟製程」指到成熟 12 吋廠區", ("s7","vi"):"引線「世界先進 8吋」指到 8 吋廠區", ("s7","ps"):"引線「力積電 記憶體」指到記憶體廠區",
 ("s8","split"):"2D 卡：設計公司→代工廠", ("s8","next"):"第三格「一片晶圓的流程」出現", ("s8","how"):"虛線箭頭、「代工廠到底怎麼製造？」", ("s8","flow"):"黃條「下一支 ▸ 一片晶圓要經過哪些流程」", ("s8","full"):"蓋章「完整解說在留言」", ("s8","kw"):"片尾卡接上，留言「代工」",
}
out = [f"# tech-foundry 逐句念稿 ↔ 該時刻畫面對照表（storyboard 抽 cue；截圖＝成片 out/tech-foundry.{VER}.mp4 在 cue 後 0.3 秒）", "", "| 幕 | cue | 秒 | 念到 | 該時刻畫面 | 截圖 |", "|---|---|---|---|---|---|"]
tiles = []
os.makedirs(f"{R}/out/tech-foundry-sync", exist_ok=True)
for s in sc:
    for c in s.get("cues", []):
        f = c.get("frame", c.get("abs")); img = f"out/tech-foundry-sync/{s['id']}-{c['id']}.png"
        subprocess.run(["ffmpeg", "-loglevel", "error", "-y", "-ss", f"{(f+9)/30:.3f}", "-i", f"{R}/out/tech-foundry.{VER}.mp4", "-frames:v", "1", f"{R}/{img}"])
        out.append(f"| {s['id']} | {c['id']} | {f/30:.1f} | {c['text']} | {EV.get((s['id'], c['id']), '')} | {os.path.basename(img)} |")
        if os.path.exists(f"{R}/{img}"): tiles.append((f"{s['id']} {c['text']} {f/30:.1f}s", Image.open(f"{R}/{img}").resize((270, 480))))
open(f"{R}/videos/tech-foundry/sync-table.md", "w").write("\n".join(out) + "\n")
cols = 7; rows = (len(tiles) + cols - 1) // cols
sheet = Image.new("RGB", (270 * cols, 500 * rows), "white"); d = ImageDraw.Draw(sheet)
for i, (t, im) in enumerate(tiles):
    x, y = (i % cols) * 270, (i // cols) * 500; sheet.paste(im, (x, y + 20)); d.text((x + 4, y + 4), t, fill="black")
sheet.save(f"{R}/out/tech-foundry-sync.jpg", quality=82); print(len(tiles))

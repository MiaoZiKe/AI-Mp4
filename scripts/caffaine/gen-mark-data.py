#!/usr/bin/env python3
"""把 CaffAIne 定稿 LOGO（public/brand/caffaine/horizontal_light.svg）的像素資料拆成 TS 資料檔，讓片尾卡與左上角 LOGO 用程式重畫（可動畫）。
用法：python3 scripts/caffaine/gen-mark-data.py   → 寫 src/components/ai-iso/caffaineMark.ts
"""
import re, json
svg = open("public/brand/caffaine/horizontal_light.svg", encoding="utf8").read()
paths = re.findall(r'<path d="([^"]+)" fill="(#[0-9A-Fa-f]+)"', svg)
frame = re.search(r'<path d="(M64 50[^"]+)" fill="none"', svg).group(1)
def cells(d): return [[float(a), float(b)] for a, b in re.findall(r"M(-?[\d.]+) (-?[\d.]+)h", d)]
by = {}
for d, c in paths:
    by.setdefault(c.upper(), []).append(d)
# 前三個 path 在 mark 群組，其後是字母 AI（在 data-role=word 群組，座標是 wordmark 座標）
mark_end = svg.index('data-role="word"')
mark_paths = [(d, c.upper()) for d, c in re.findall(r'<path d="([^"]+)" fill="(#[0-9A-Fa-f]+)"', svg[:mark_end])]
word_paths = [(d, c.upper()) for d, c in re.findall(r'<path d="([^"]+)" fill="(#[0-9A-Fa-f]+)"', svg[mark_end:])]
out = {}
for d, c in mark_paths:
    out.setdefault({"#C77A3A": "cup", "#FFF6E8": "ai", "#E9A25D": "accent"}[c], []).extend(cells(d))
# accent 裡：杯把一格（48,100）、其餘是蒸氣
acc = out.pop("accent")
out["handle"] = [c for c in acc if c == [48.0, 100.0]]
out["steam"] = [c for c in acc if c != [48.0, 100.0]]
# 框線：折線頂點
pts = [(int(x), int(y)) for x, y in re.findall(r"[MHV]?\s*(-?\d+)\s*(?:(-?\d+))?", frame) if False]
# 手動解析 M x y H x V y …
toks = frame.replace("M", " M ").replace("H", " H ").replace("V", " V ").split()
x = y = 0; poly = []; i = 0
while i < len(toks):
    t = toks[i]
    if t == "M": x, y = float(toks[i+1]), float(toks[i+2]); i += 3
    elif t == "H": x = float(toks[i+1]); i += 2
    elif t == "V": y = float(toks[i+1]); i += 2
    else: i += 1
    poly.append([x, y])
out["frame"] = poly
# wordmark 的 AI 像素字：座標相對 wordmark 群組，分成 A（x<850）與 I
wc = []
for d, c in word_paths: wc.extend(cells(d))
out["wordA"] = [[a - 757.049375, b + 91] for a, b in wc if a < 850]
out["wordI"] = [[a - 861.049375, b + 91] for a, b in wc if a >= 850]
print({k: len(v) for k, v in out.items()})
ts = "// 由 scripts/caffaine/gen-mark-data.py 從 public/brand/caffaine/horizontal_light.svg 產生，不要手改。\n// mark 座標系：viewBox 約 22–178 × 12–182，每格 8；wordA／wordI 是 AI 兩個像素字（格 13，相對各字左上，y 0–91）。\n"
ts += "export const CAFF = " + json.dumps(out) + " as const;\n"
open("src/components/ai-iso/caffaineMark.ts", "w").write(ts)

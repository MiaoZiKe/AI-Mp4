# 2026/11/17 Andy：風格不要侷限都是對話框 → 教室／黑板比喻版（本片 0 幕對話框）。念稿與時間軸不動；s04 多加一個動畫卡點「利息再生利息」。
# 前置：script.json 已由 autoscript 產生（不要再 --force）；執行：python3 videos/caffaine-feynman/build.py
import sys; sys.path.insert(0, "scripts/caffaine")
from metaphor_build import apply
apply("caffaine-feynman", {
  "s01": {"view": "balance", "tone": "event", "tilt": 11,
    "left": {"label": "看懂", "color": "primary", "at": "k1-6"}, "right": {"label": "學會", "color": "wrong", "at": "k2-4", "light": True}, "mid": {"at": "k2"}, "q": {"text": "怎麼逼自己真的學會？", "at": "k3"}},
  "s03": {"view": "board", "tone": "principle", "fs": 72, "lines": [
      {"who": "ai", "rows": ["利息會變成新的本金，", "繼續幫你賺錢"], "at": "start+10", "dur": 60, "color": "primary"},
      {"who": "you", "rows": ["複利就是銀行每年", "固定給你一筆利息，", "存越久領越多"], "at": "k3", "dur": 38, "color": "note", "note": {"text": "故意講錯", "at": "k4+6", "color": "wrong"}}],
    "marks": [{"line": 1, "row": 1, "c0": 0, "c1": 8, "at": "k4", "color": "note"}]},
  "s04": {"view": "compound", "tone": "bug", "years": 8, "rate": 0.2, "note": "示意：本金 100，每年 20%",
    "single": {"label": "你講的：單利", "at": "start+10"}, "comp": {"label": "實際：複利", "at": "k3"}, "hit": {"text": "漏了：利息再生利息", "at": "k3+22"}, "ticks": {"at": "k4", "n": 3, "text": "三次都抓到"}},
  "s05": {"view": "volume", "tone": "fix", "bigW": 380, "smallW": 380, "smallH": 210,
    "big": {"label": "正確版本", "sub": "一大段", "n": 3, "at": "start+6", "color": "wrong"}, "small": {"label": "一句話", "sub": "", "text": "複利就是利滾利，賺到的利息留下來繼續賺", "at": "k1", "color": "right"},
    "arrow": {"text": "簡化", "at": "k1-6"}, "end": {"text": "直接講給同事聽", "at": "k2", "color": "plum"}},
  "s06": {"view": "board", "tone": "principle", "fs": 72, "lines": [
      {"who": "ai", "rows": ["利息會變成新的本金，", "繼續幫你賺錢"], "pre": True, "dimAt": "k1+8", "color": "primary"},
      {"who": "you", "rows": ["複利就是銀行每年", "固定給你一筆利息"], "at": "k2-6", "dur": 30, "color": "note", "note": {"text": "卡在這裡", "at": "k3-16", "color": "wrong"}}],
    "marks": [{"line": 1, "row": 1, "c0": 0, "c1": 8, "at": "k3-24", "color": "wrong"}]},
  "s07": {"view": "paper", "tone": "claim", "title": "四步提示詞（＿＿換成你想學的主題）", "color": "note", "h": 700, "fs": 54, "num": True,
    "lines": [{"t": "用國中生聽得懂的話解釋＿＿", "at": "start+6", "dur": 18, "color": "primary", "mark": [{"word": "＿＿", "at": "k1", "color": "note"}]},
              {"t": "換我講：＿＿就是⋯⋯", "at": "start+22", "dur": 14, "color": "sky", "mark": [{"word": "＿＿", "at": "k1+6", "color": "note"}]},
              {"t": "抓出我講錯的，再問我一題", "at": "start+38", "dur": 18, "color": "wrong"}, {"t": "把正確版本簡化成一句話", "at": "start+54", "dur": 16, "color": "right"}],
    "stamp": {"text": "留言「費曼」", "at": "k2", "color": "note"}, "pin": {"at": "k3"}},
}, keywords={"s04": ["抓你講錯的地方", "單利", "利息再生利息", "三次都抓到"]}, pause={"s04": 0.6})

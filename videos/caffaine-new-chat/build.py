# 2026/11/17 Andy：風格不要侷限都是對話框 → 比喻畫面版（本片 0 幕對話框）。念稿與 cue 不動；s04 流程、s08 大字沿用原本畫面。
# 前置：script.json 已由 autoscript 產生（不要再 --force）；執行：python3 videos/caffaine-new-chat/build.py
import sys; sys.path.insert(0, "scripts/caffaine")
from metaphor_build import apply
apply("caffaine-new-chat", {
  "s01": {"view": "pack", "tone": "event", "count": 16, "fromAt": "start+4", "toAt": "k2+20", "note": "規定", "glowAt": "k2", "q": {"text": "為什麼還要開新對話？", "at": "k3"}},
  "s02": {"view": "volume", "tone": "bug", "spin": True,
    "big": {"label": "整段對話", "sub": "九萬字", "n": 9, "at": "start+4", "color": "wrong"}, "small": {"label": "交接摘要", "sub": "三百多字", "at": "k2-4", "color": "right"},
    "arrow": {"text": "重讀", "at": "k1+6"}, "end": {"text": "每問一句，都要整段重讀", "at": "k1+22", "color": "plum"}},
  "s03": {"view": "lostmid", "tone": "principle", "n": 14, "n0": 5, "growAt": "k1-4", "wobbleAt": "k2", "midAt": "k3", "lenLabel": "輸入越長", "wobbleLabel": "越不穩", "midLabel": "放在中間，表現最差"},
  "s05": {"view": "paper", "tone": "fix", "title": "給 AI 的提示詞", "color": "sky", "h": 570, "fs": 52, "num": False,
    "lines": [{"t": "我要換到新的對話繼續。", "at": "start+8", "dur": 18, "color": "primary"}, {"t": "請寫一段交接摘要，讓我貼到新對話：", "at": "k1-4", "dur": 26, "color": "primary"}, {"t": "要包含我交代你的規定，以及我們聊過的主要主題。", "at": "k2-26", "dur": 34, "color": "primary", "mark": [{"word": "規定", "at": "k2", "color": "wrong"}, {"word": "主要主題", "at": "k3", "color": "right"}]}],
    "pin": {"at": "k3+10"}},
  "s06": {"view": "paper", "tone": "fix", "title": "AI 寫的交接摘要", "color": "right", "h": 580, "fs": 46, "num": False,
    "lines": [{"t": "規定：每一則回覆，開頭寫「報告：」，最後一行寫「完畢」。", "at": "k1", "dur": 30, "color": "wrong", "mark": [{"word": "規定", "at": "k2", "color": "wrong"}]},
              {"t": "聊過的主題：年度預算檢討、新進員工訓練手冊、客戶服務流程規範⋯⋯共 16 份。", "at": "k2-10", "dur": 34, "color": "right", "mark": [{"word": "主題", "at": "k2+16", "color": "right"}]}],
    "stamp": {"text": "規定＋主題", "at": "k2+22", "color": "right"}},
  "s07": {"view": "carry", "tone": "principle", "left": {"label": "舊對話", "n": 9}, "right": {"label": "新對話"}, "note": {"at": "k1"}, "okAt": "k2", "ticks": {"at": "k3", "n": 4, "text": "守住"}},
}, pause={"s07": 0.6})
apply("caffaine-new-chat", {"s08": {"view": "kinetic", "tone": "claim", "rows": [{"big": "不是變笨", "unit": "", "at": "start-10", "color": "primary", "size": 190, "usize": 100}, {"big": "是越長越不穩", "unit": "", "at": "k2", "color": "wrong", "size": 134, "usize": 100}, {"big": "留言「交接」", "unit": "", "at": "k3", "color": "right", "size": 134, "usize": 100}],
  "recap": [{"text": "九萬字", "sub": "整段重讀", "at": "start+8", "color": "wrong"}, {"text": "三百字", "sub": "交接摘要", "at": "k2", "color": "right"}, {"text": "四次都守住", "sub": "實測", "at": "k3", "color": "primary"}]}})

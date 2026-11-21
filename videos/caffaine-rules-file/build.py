# 2026/11/17 Andy：風格不要侷限都是對話框 → 比喻畫面版。念稿與 cue 不動，只換 s01/s03/s04/s05 的 view（s02 保留唯一一幕對話框，s06 大字、s07 領取卡不動）。
# 前置：script.json 已由 autoscript 產生（不要再 --force，會把比喻畫面蓋掉）；執行：python3 videos/caffaine-rules-file/build.py
import sys; sys.path.insert(0, "scripts/caffaine")
from metaphor_build import apply
rules = ["我是行銷部專案經理，同事都很忙，我要的是能直接貼進群組的訊息。", "口氣：直接、不客套。", "格式：第一行只放結論，後面最多三點條列，全文不超過 80 字。", "禁忌：不寫「您好」「謝謝」「希望」這類開場或結尾，不用表情符號。"]
apply("caffaine-rules-file", {
  "s01": {"view": "belts", "tone": "event", "lanes": [
      {"label": "沒規則", "color": "wrong", "at": "start-6", "reqAt": "start-4", "items": [{"at": f"k1-{22 - 5 * i}", "kind": "sheet"} for i in range(5)]},
      {"label": "有規則", "color": "right", "at": "start-6", "reqAt": "k2-30", "gate": {"at": "k2"}, "items": [{"at": "k3-8", "kind": "card"}]}],
    "mid": {"text": "差在哪？", "at": "k4-4", "color": "plum"}},
  "s03": {"view": "paper", "tone": "fix", "title": "規則檔.txt", "color": "sky", "h": 720, "fs": 38,
    "lines": [{"t": t, "at": a, "dur": 55 if a == "start+10" else 12, "color": c} for t, a, c in zip(rules, ["start+10", "k3-6", "k4-6", "k5-6"], ["primary", "sky", "right", "wrong"])],
    "stamp": {"text": "只寫一次", "at": "k5+16", "color": "wrong"}, "pin": {"at": "k5+24"}, "bot": True, "chip": {"text": "每次先讀", "at": "k5+30", "color": "right"}},
  "s04": {"view": "slots", "tone": "fix", "card": "規則卡", "slots": [
      {"label": "自訂指令", "sub": "ChatGPT", "color": "primary", "at": "k1"}, {"label": "技能", "sub": "Gemini（原 Gem）", "color": "note", "at": "k2"}, {"label": "專案指示", "sub": "Claude 專案", "color": "right", "at": "k3"}],
    "readAt": "k4", "chip": {"text": "貼一次，每次新對話都先讀", "at": "k4+14", "color": "right"}},
  "s05": {"view": "scoreboard", "tone": "principle", "runsAt": "k1", "note": "實測：同一句請求各跑 5 次，滿分 5 分",
    "boards": [{"label": "沒規則", "color": "wrong", "value": 1.6, "max": 5, "dec": True, "runs": [1, 2, 1, 2, 2], "countAt": "k2"}, {"label": "有規則", "color": "right", "value": 5, "max": 5, "dec": False, "runs": [5, 5, 5, 5, 5], "countAt": "k3"}]},
  "s06": {"view": "kinetic", "tone": "principle", "rows": [{"big": "不是變聰明", "unit": "", "at": "start-10", "color": "wrong", "size": 170, "usize": 90}, {"big": "是規矩寫成檔", "unit": "", "at": "k2", "color": "right", "size": 126, "usize": 90}, {"big": "每次先讀過", "unit": "", "at": "k3", "color": "primary", "size": 126, "usize": 90}],
    "recap": [{"text": "沒規則", "sub": "平均 1.6 分", "at": "start+8", "color": "wrong"}, {"text": "有規則", "sub": "次次滿分", "at": "k2", "color": "right"}, {"text": "寫一次", "sub": "每次先讀", "at": "k3", "color": "primary"}]},
}, pause={"s03": 0.7, "s05": 0.5})
# 2026/11/22 驗證第三輪：s02 對話窗上方（主視覺區 330–450）補一張「沒規則：每次都要重講」提示卡
import json as _j
_F = "videos/caffaine-rules-file/script.json"; _d = _j.load(open(_F))
for _s in _d["scenes"]:
    if _s["id"] == "s02": _s["props"]["topChip"] = "沒規則：每次都要重講"
_j.dump(_d, open(_F, "w"), ensure_ascii=False, indent=1)

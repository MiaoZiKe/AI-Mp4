"""Single source of truth for the film's script: scenes, captions and narration.

Each cue = one caption + one narration line. `at` is the desired start time (s);
tts.py measures the synthesized audio and writes exact frame-aligned timings
into timeline.json.  Numbers in captions must match research.md.
"""

FPS = 24
DURATION = 66.0
N_FRAMES = 1584
DATA_DATE = "2026/11/04"
BRAND = "每日財經筆記"
HANDLE = "@daily.finance.notes"

SCENES = [
    {"id": 1, "name": "片頭·星塵聚成議席", "t0": 0.0, "t1": 8.0,
     "visual": "星空與星雲，100 顆光點從星塵中聚合成參議院半圓議席；片頭品牌與標題"},
    {"id": 2, "name": "參眾兩院結果", "t0": 8.0, "t1": 20.0,
     "visual": "參院議席依實際結果上色（兩黨同速），標出過半線；鏡頭平移到眾院 435 席（開票快照）"},
    {"id": 3, "name": "分裂政府·權力制衡", "t0": 20.0, "t1": 32.0,
     "visual": "行政（白宮·共和黨）與立法（國會·民主黨）兩座等大玻璃柱，上方天平擺盪後停在水平"},
    {"id": 4, "name": "政策與市場資料卡", "t0": 32.0, "t1": 46.0,
     "visual": "鏡頭沿四張玻璃資料卡推移：預算與舉債上限、關稅、AI 與資料中心、選後市場長條圖"},
    {"id": 5, "name": "台灣", "t0": 46.0, "t1": 58.0,
     "visual": "光筆描出台灣輪廓，半導體聚落亮起晶片光點；台股收盤數字與盤中震幅；焦點標籤"},
    {"id": 6, "name": "歷史與結尾", "t0": 58.0, "t1": 66.0,
     "visual": "地平線晨光漸亮，期中選舉後 12 個月 S&P 500 平均漲幅長條圖；總結；品牌與資料日期"},
]

# caption: <=18 chars; narration: Traditional Chinese (converted to Simplified only for the TTS front-end)
CUES = [
    {"scene": 1, "at": 3.70, "caption": "美國期中選舉 選後的世界會怎麼走？",
     "narration": "期中選舉落幕，選後的世界，會怎麼走？"},
    {"scene": 2, "at": 8.25, "caption": "參議院：民主黨至少54席 取得多數",
     "narration": "參議院由民主黨取得多數，至少五十四席，兩席計票中。"},
    {"scene": 2, "at": 14.45, "caption": "眾議院：民主黨過半 多席計票中",
     "narration": "眾議院同樣由民主黨過半，仍有多個選區在計票。"},
    {"scene": 3, "at": 20.50, "caption": "行政與立法分屬兩黨 形成分裂政府",
     "narration": "白宮屬共和黨，國會由民主黨主導，形成分裂政府。"},
    {"scene": 3, "at": 26.30, "caption": "總統握否決權 國會握預算與監督",
     "narration": "總統仍有否決權，國會則握有預算與監督的力量。"},
    {"scene": 4, "at": 32.05, "caption": "預算與舉債上限 需兩黨協商", "icon": "tax",
     "narration": "預算與舉債上限，需兩黨協商。"},
    {"scene": 4, "at": 35.85, "caption": "關稅仍由行政部門主導", "icon": "container",
     "narration": "關稅，仍由行政部門主導。"},
    {"scene": 4, "at": 38.55, "caption": "AI與資料中心 恐受更多審查", "icon": "chip",
     "narration": "AI與資料中心，恐受更多審查。"},
    {"scene": 4, "at": 42.40, "caption": "美股大漲 殖利率與美元走低", "icon": "kline",
     "narration": "美股大漲，殖利率與美元走低。"},
    {"scene": 5, "at": 46.50, "caption": "台股開票日震盪 收在42,949點",
     "narration": "台股在開票日劇烈震盪，終場收在四萬兩千九百四十九點。"},
    {"scene": 5, "at": 52.60, "caption": "晶片關稅與AI供應鏈 仍是焦點",
     "narration": "對台灣而言，晶片關稅與AI供應鏈仍是焦點。"},
    {"scene": 6, "at": 58.30, "caption": "史上選後一年 美股平均漲約15%",
     "narration": "歷史上，選後一年美股平均上漲約一成五。"},
    {"scene": 6, "at": 62.60, "caption": "制衡之下 世界繼續前行",
     "narration": "制衡之下，世界繼續前行。"},
]

# Brand cards (no narration)
CARDS = [
    {"kind": "brand_open", "t0": 0.5, "t1": 3.45},
    {"kind": "brand_close", "t0": 63.90, "t1": 66.0},
]

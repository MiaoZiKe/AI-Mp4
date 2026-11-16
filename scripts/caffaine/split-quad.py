#!/usr/bin/env python3
"""把合併 TTS（caffaine-quad-tmp，前綴 a_/b_/c_/d_）切回各支：複製音檔到 public/audio/<slug>/、寫各自的 tts-manifest.json。
用法：python3 scripts/caffaine/split-quad.py"""
import json, shutil, os
M = json.load(open("videos/caffaine-quad-tmp/tts-manifest.json"))
slugs = {"a": "caffaine-made-by-ai", "b": "caffaine-two-answers", "c": "caffaine-same-look", "d": "caffaine-sketch-game"}
for p, slug in slugs.items():
    sc = [dict(s) for s in M["scenes"] if s["id"].startswith(p + "_")]
    out = f"public/audio/{slug}"
    if os.path.isdir(out):
        for f in os.listdir(out):
            if f.endswith(".wav") and f != "voice.wav": os.remove(f"{out}/{f}")
    os.makedirs(out, exist_ok=True)
    for i, s in enumerate(sc, 1):
        s["id"] = s["id"][2:]
        src = "public/" + s["file"]; new = f"audio/{slug}/{i:02d}-{s['id']}.wav"
        shutil.copy(src, "public/" + new); s["file"] = new
    m = dict(M); m["slug"] = slug; m["scenes"] = sc
    m["take"] = dict(M["take"], combinedWith="caffaine-quad-tmp（四支同一次 TTS 請求）")
    json.dump(m, open(f"videos/{slug}/tts-manifest.json", "w"), ensure_ascii=False, indent=2)
    print(slug, len(sc))

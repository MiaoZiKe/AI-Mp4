#!/usr/bin/env python3
"""voice-batch 的合併／切回（各頻道共用；split-quad.py 的一般化，不改它）。
  merge <slug>...  → 建 videos/voice-batch-tmp/script.json（幕 id 加前綴 p1_ p2_…，para 加 100×序號）；
                     voice 取第一支的 script.json（音色、profile、languageCode…），各支不一致就報錯；印出 gapMin／beatGap
  split <slug>...  → 把 voice-batch-tmp 的 tts-manifest 切回各支（複製音檔到 public/audio/<slug>/、寫各自 tts-manifest.json）"""
import json, os, shutil, sys
TMP = "videos/voice-batch-tmp"
DEFAULT_VOICE = {"voiceName": "Sulafat", "mode": "take", "languageCode": "cmn-TW", "profile": "ai-report-v5"}  # CaffAIne 預設
def load(s): return json.load(open(f"videos/{s}/script.json"))
def merge(slugs):
    vs = []
    for s in slugs:
        v = load(s).get("voice") or DEFAULT_VOICE
        vs.append({k: v.get(k) for k in ("voiceName", "profile", "languageCode", "style")})
    if any(x != vs[0] for x in vs):
        sys.exit("✖ 同一批一定同音色同 profile：\n" + "\n".join(f"  {s}: {x}" for s, x in zip(slugs, vs)))
    voice = dict(load(slugs[0]).get("voice") or DEFAULT_VOICE); voice["mode"] = "take"
    scenes = []
    for i, s in enumerate(slugs, 1):
        for sc in load(s)["scenes"]:
            t = (sc.get("tts") or sc.get("narration") or "").strip()
            if not t: continue
            o = {"id": f"p{i}_{sc['id']}", "narration": sc.get("narration", t), "para": 100 * i + (sc.get("para") or 1)}
            if sc.get("tts"): o["tts"] = sc["tts"]
            scenes.append(o)
    os.makedirs(TMP, exist_ok=True)
    json.dump({"slug": "voice-batch-tmp", "voice": voice, "scenes": scenes}, open(f"{TMP}/script.json", "w"), ensure_ascii=False, indent=1)
    v = voice
    print(f"{len(slugs)} 支、{len(scenes)} 幕、音色 {v.get('voiceName')}／{v.get('profile')}")
def split(slugs):
    M = json.load(open(f"{TMP}/tts-manifest.json"))
    for i, slug in enumerate(slugs, 1):
        sc = [dict(s) for s in M["scenes"] if s["id"].startswith(f"p{i}_")]
        out = f"public/audio/{slug}"
        if os.path.isdir(out):
            for f in os.listdir(out):
                if f.endswith(".wav") and f != "voice.wav": os.remove(f"{out}/{f}")
        os.makedirs(out, exist_ok=True)
        for j, s in enumerate(sc, 1):
            s["id"] = s["id"].split("_", 1)[1]
            new = f"audio/{slug}/{j:02d}-{s['id']}.wav"; shutil.copy("public/" + s["file"], "public/" + new); s["file"] = new
        m = dict(M); m["slug"] = slug; m["scenes"] = sc
        m["take"] = dict(M["take"], combinedWith=f"voice-batch-tmp（{len(slugs)} 支同一次 TTS 請求）")
        json.dump(m, open(f"videos/{slug}/tts-manifest.json", "w"), ensure_ascii=False, indent=2)
        print(slug, len(sc), "幕")
if __name__ == "__main__":
    cmd, slugs = sys.argv[1], sys.argv[2:]
    if not slugs: sys.exit(__doc__)
    {"merge": merge, "split": split}[cmd](slugs)

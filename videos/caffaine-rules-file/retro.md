# 復盤：caffaine-rules-file（2026/11/17–18，長期技巧第一批）

- 比上一批好在哪：畫面從對話框改成配合內容的比喻與動作（見 `docs/channels/caffaine-examples.md`），全中文、因果串接旁白。
- 花多久：第一版無聲約 2.5 小時（三支同批）；比喻重做約 3.3 小時（三支同時出片在 4 核心機器互搶，比估計慢約 1 小時）；配音＋對齊約 7 分鐘、有聲出片約 30 分鐘。
- 新增可重用：IsoMetaphor 11 種 view、Bot／Sheet／Tick 小零件、metaphor_build.py 套版、validate「對話框每支最多 1 幕」。
- 下次改什麼：落定後停留補到 1.5 秒；三支不要同時出片（改成依序，總時間反而短）；開工先寫六面向規格（第二十一節）再做。

## 2026/11/21 補：每幕最後動作落定後至少停 1.5 秒
- 改了什麼：`scripts/caffaine/metaphor_build.py` 新增 `hold_pass`（apply 結束自動跑）：每幕所有 at／xxxAt 解析成幀，最後一個動作（at 有 dur 的算 at+dur）落定後到下一幕開始不足 45 幀時，整幕事件依「離幕首越遠移越多」的比例往前移，順序不變、仍寫成 cue±幀；旁白、cue、pauseAfter 都沒動。共 5 幕提前 14～25 幀（0.47～0.83 秒）；全片重新出片約 9 分鐘（含 ov-check），另修計分牌脈動縮放造成的「文字超出框」誤報（改成置中後再縮放）。
- 驗收：`python3 scripts/caffaine/hold-check.py caffaine-rules-file` 每幕落定後最小 1.50 秒、0 幕不足；freezedetect（n=0.003:d=1.2）0 次；重疊 0 筆；拼圖已看過。
- 下次直接沿用：新片的 build.py 照舊寫 at，跑 `python3 videos/<slug>/build.py` 會自動套用落定保護，再跑 `hold-check.py` 看表；提前不了的幕沒有（三支全過）。出片前先 `rm -rf out/.bundle` 並留 ≥1.5GB 磁碟，否則 Remotion 會 Page crashed。

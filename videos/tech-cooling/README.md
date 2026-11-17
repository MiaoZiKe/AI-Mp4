# tech-cooling：液冷（科技透明圈 第 8 支，11/21（六）20:00）

## 做到哪（2026/11/17）
- v1：`out/tech-cooling.v1.mp4`（55.5 秒；念稿 283 字；配音 Iapetus＋tech-b 整篇 1 次請求，`out/voice-cooling/cooling-a.wav`，原始語速 4.24 字/秒、F0 122 Hz，atempo 1.288 → 約 5.46 字/秒）。
- v2：`out/tech-cooling.v2.mp4`（53.6 秒；`make-tech.sh --take=out/voice-cooling/cooling-b.wav --atempo=1.288 --ver=v2`，**沒有再送 TTS**，cooling-b＝cooling-a 把「漏水的機率，各家都沒有公布」那句剪掉）。依 Andy 11/17 回饋：
  1. 拿掉「查不到／尚未確定」整句與畫面字樣、拿掉「非投資建議」字樣。
  2. 公司用引線指到 3D 部位：奇鋐、雙鴻→冷板、台達電→CDU、高力→板式熱交換器、富世達→快接頭（媒體報導；來源見 research.md #17、#18）。
  3. 逐句事件：每句字幕都有自己的畫面事件，對照表見 `sync-table.md`，截圖 `out/tech-cooling.v2-sync1～4.jpg`。
  4. 細節：冷板內部微通道＋水流變色＋熱傳導＋2D 剖面；快接頭透明剖面（閥芯、彈簧、O 形環）拔插；機櫃背面分歧管與每層快接頭；CDU 透明側板內 14 片板式熱交換器逆向流動、幫浦葉輪轉動、乾冷器風扇；風冷對照（風扇轉、氣流只推一小段、機櫃變橘發熱）。
- 運作動畫 4 段（A 冷板水流變色、B 快接頭拔插、C CDU 熱交換＋幫浦＋乾冷器、D 風冷對照）；2D 卡 `cool-cups／cool-plate／cool-loop／cool-hx／cool-split／cool-next`（`src/components/three/HudCool.tsx`）。
- 檢查：validate 0 error、layout-check 0 error（頂端空白 0px、底端空白 46px）、kinematics 0 error；重疊檢查：程式 1608 幀 0 筆。
- 產生程式：`genmodel.py`、`genscript.py`（改程式再重產 model.json、script.json）。

## 已知限制
- 敘述銜接（11/17 新規則：句與句要有因果）：第 8 段「冷板不是全包」接第 9 段「機櫃還會更耗電」是跳接，要補一句連接（例如「熱越來越多，機櫃還會更耗電」）需要重配音（尚未做，等指示）。
- 乾冷器、CDU 的尺寸與板數為示意；溫度顏色只表示方向，不標數字。
- 語速：原始 4.24 字/秒略低於基準下限 4.3，已 atempo 到 5.46；捲舌指標未量（voice-retro 缺 pypinyin）、人耳未確認。

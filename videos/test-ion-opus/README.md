# test-ion-opus：離子佈植機怎麼把離子打進晶圓（模型比較測試・Opus）

- 用途：Andy 11-20 的模型比較測試（Opus 版），也是下一支正片「離子佈植」的核心運作畫面候選。
- 規格：1080×1920、30fps、14 秒、無配音、無字幕；stage "three"、hudSkin light、hud.layout fill。
- 成片：`out/test-ion-opus.v1.mp4`（不進 git）；格子圖 `out/test-ion-opus.v1-grid.jpg`。
- 產生資料：`python3 videos/test-ion-opus/gen.py`（寫 model.json、script.json、timeline.json、storyboard.json；改畫面改 gen.py，不手改 json）。
- 渲染：`ffmpeg -f lavfi -i anullsrc=r=48000:cl=mono -t 14 out/test-ion-opus.silence.wav`，再 `AUDIO=out/test-ion-opus.silence.wav bash scripts/three/chunk-render.sh test-ion-opus v1`。
- 看指定幀：`node scripts/v3/peek.mjs test-ion-opus out/x.png 75,175,262,400 --scale 0.3 --cols 4`。
- 畫面規格：`visual-spec.md`。

## 做法重點（沒有改任何共用檔）
- 「＋」離子：每顆是球＋兩條白色方條（橫、直）組成的「＋」，各自一層；用 `props.shift` 串起來走路徑：
  加速段用 `fallOut`（位移∝t²＝等加速度），之後每段用 `throw: 0`（等速直線），弧線切成 12 段。
- 拖尾：同一條路徑複製三層、各延遲 2／4／6 幀，間距＝速度×延遲，所以越快拖尾越長。
- 磁鐵濾掉的離子：太重的弧線半徑 5.6、太輕的 1.85，算到撞上飛行腔內外壁那一點就消失，同一幀出現星形火花（6 幀淡出）＋ `wave` 波紋。
- 晶圓掃描：射束左右掃（`rotate` swing 的扇形光束＋`vibrate` 光點，同頻率同相位），每顆離子的落點用同一個正弦算；晶圓連載台用 `vibrate` 上下機械掃描。
- 剖面放大：離子用 `shift` 的 `spring`（週期設很長＝只剩指數衰減）做「越走越慢、停在一定深度」，停止深度是固定亂數的鐘形分布；摻雜區五層淡→濃→淡。
- 驗證：沒跑 `npm run validate`（它要求字幕與鉤子大字，這支依題目不放）；版面靠 peek 截圖人工看。

## 已知缺點
見回報；之後要接進正片時，再依配音 cue 把 gen.py 裡的幀數換成 cue。

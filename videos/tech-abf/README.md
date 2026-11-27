# tech-abf：ABF-1 ABF 膜（系列 3 第 7 集；前一集 3-6 先進封裝設備；下一集 3-8 ABF 載板）
- 狀態（2026/11/27 台北）：r0 無聲完整版，送雙審。**未配音、未送 TTS、未渲染整片**。留言關鍵字「ABF」。念稿 script.md 已由頻道負責人定稿（11-27：保留「留言 A B F」、不說副產品、台灣只放晶化科技；「超過九成五」畫面標「日經 2025、味之素揭露」）。
- 產生：`python3 videos/tech-abf/genscript.py`（先跑 gen-model.mjs）→ `node scripts/three/silent-timeline.mjs tech-abf` → 再跑一次 genscript。2D 卡 `src/components/three/HudAbf.tsx`（abf-*，9 張）；共用檔只動 Hud.tsx（import＋一行分派）。
- 9 幕＋片尾；無聲估 63.0 秒（每幕 5.6～8.0 秒）。站點與爆炸步驟見 visual-spec.md。
- 運作動畫（跟旁白同步）：①s3 貼膜（滑入→撕保護膜→壓板降下抽真空→加熱固化變色→撕承載膜；烘烤爐熱風）；②s4 雷射三孔（光錐、煙、倒錐孔停在銅墊）；③s5 半加成法（種子銅落下→光阻→離子只落進開口兩階段長厚→去光阻→蝕刻掉線間薄銅；電鍍槽離子流）；另有 s1、s2 訊號沿銅線經孔換層。
- 比喻都有畫面：大樓（s2 爆炸剖面＋卡片樓板）、貼保鮮膜（s3）、電梯井（s4 孔＋卡片）、打草稿再描粗再擦掉（s5 四格卡片）。
- 第 38–40 條：無音效；>1 秒無聲段 0 個（量法：timeline.json voiceEnd→下一幕 voiceStart，8 段 1.00 秒、s9→片尾 0.87 秒）；公司卡：s7 味之素卡 1 家（門檻 3.5 秒）實際約 6.6 秒、念完「味之素」後還有一句；s8 兩家（門檻 3.9 秒）實際約 7.5 秒，念完「晶化科技」後到換幕約 2.0 秒，卡片期間鏡頭不動。

## 檢查結果（本檔最後一次改 script.json 之後）
- precheck（含抽幀）0／0；validate 0 error（74 warning）；layout-check 0；card-overlap 0／0；kinematics 0；flow 0（12 條）。
- 證據：out/tech-abf/k/f<幀>.png（清單 out/tech-abf/k-list.txt，9 個幕界 ±1 與關鍵格；雷射光錐加大前渲的，光錐以外相同）。

## 風險
2. 味之素、晶化科技 LOGO 原檔沒拿到（Commons 429、官網 403），用文字名牌。
3. 晶化科技產能、客戶、英文名查不到；卡片寫「查不到」。

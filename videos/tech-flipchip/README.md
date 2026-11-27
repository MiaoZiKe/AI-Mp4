# tech-flipchip：封裝-2 覆晶（系列 3 第 4 集；前一集 3-3 封裝材料；下一集 3-5 扇出型與晶圓級封裝）
- 狀態（2026/11/27 台北）：無聲完整版（子聊天室製作），未配音、未渲染整片。留言關鍵字「覆晶」。
- 產生：`python3 videos/tech-flipchip/genscript.py`（自動先跑 gen-model.mjs，失敗會印錯誤並停）→ `node scripts/three/silent-timeline.mjs tech-flipchip --force`（注意是 three 版，不是 ui 版） → 再跑一次 genscript。
- 11 幕＋片尾卡；念稿 259 字（script.md 逐段比對；最後一段拆成兩幕，字未改）；無聲片長 65.0 秒（每幕 4.5～7.2 秒；第 39 條：每幕念完留白 0.7 秒、s9 0.87 秒，相鄰幕無聲段 0.83～1.0 秒，>1 秒 0 個）。
- 2D 卡 `src/components/three/HudFlipchip.tsx`（11 張，kind `fc-*`）；Hud.tsx 加 import＋一行登記。
- 規格：physics-spec.md、visual-spec.md；素材：assets.md（LOGO 三類來源都被擋 → 文字名牌）；研究：research.md（60 條）。
- 字幕：genscript 擋「行內有、，」「行 <3 字」（字幕切分會在標點切開、短段併掉造成中英錯位）；storyboard 逐幕中英 1:1 已核對。

## 已知限制
- 公司 LOGO：官網、維基百科被代理擋；三家都是文字名牌＋程式國旗。
- research 多數條目只到「中」信心（ase、amkor、besi、ucla 網域只看到搜尋摘要）。
- 「表面張力把晶片拉正」只對錫量多的凸塊；2D 卡與出處列已註明「錫量多時；細間距改熱壓接合」。
- 熱脹冷縮變形是誇大示意（畫面與出處列已標）。

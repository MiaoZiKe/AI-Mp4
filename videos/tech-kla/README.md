# tech-kla：設備五大-5：KLA（量測檢測）（科技透明圈 系列「代工的供應商」第 11 集；上一集設備五大-4：東京威力科創；下一集 12/14：台灣自己的設備廠）
- 狀態（2026/11/26 台北）：前段完成（研究、腳本、建模、12 張 2D 卡、無聲時間軸）。**未配音、未渲染**。12/13（日）18:00 發，留言關鍵字「KLA」。
- 產生：`python3 videos/tech-kla/genscript.py`（自動先跑 gen-model.mjs）→ model.json＋script.json。無聲時間軸：`node scripts/three/silent-timeline.mjs tech-kla` 後再跑一次 genscript。2D 卡：`src/components/three/HudKla.tsx`（kla-*）。
- Hud／Brand 已由 CEO 掛上（commit a013df4），sign-kla.png 已產生。原本的掛法紀錄：
  - Hud.tsx：`import { KlaSection } from "./HudKla";`＋分派 `if (String((o as any).kind ?? "").startsWith("kla-")) return <KlaSection o={o} f={f} k={k} m={m} s={s} />;`
  - Brand.tsx LOGOS：`kla: { file: "logos/kla.png", w: 960, h: 214, name: "KLA 科磊", source: "https://commons.wikimedia.org/wiki/File:KLA_Corp._logo.svg" },`
  - 3D 貼圖：`node scripts/three/make-brand-tex.mjs tech-kla flag:US logo:kla`（掛上 Brand 之後跑）
- 12 幕＋片尾卡；念稿 328 字；無聲估 84 秒（含片尾 3.2 秒）。s2 念稿拉長給爆炸分解每張標籤 1.5 秒、s3 已砍短（7.0 秒）；配音後照第 13 條 atempo（上限 1.12）約 75 秒。
- 開場（接東京威力 s12 原文「怎麼確認每一步都做對？下一集看量測檢測的科磊」）：s1「上一集問，每一步做對了沒有？誰來檢查？科磊，也就是 KLA，一片一片找。」（第一個問號約第 2.9 秒）；kicker「接上集：每一步做對了嗎」、標題「誰來檢查？」。結尾：「檢查做完了，下一集看台灣自己的設備廠。」
- 光罩：s8「光罩也要檢查，常拿去跟設計圖比對。」卡片下排兩行：「光罩也要查：常跟設計圖比對｜KLA LOGO 也有光罩檢測機」「極紫外光光罩專門檢測：日本國旗＋Lasertec（媒體報導）」，不寫數字、不另做 3D。
- 第 1 輪（照 docs/reviews/2026-11-26-kla-mech.md、-physics.md 11 條必改＋3 條可改＋Andy 第 20 條細節）：反射鏡大開口朝照明管、電漿在碗底；隔振腳入鏡（s7 從右側斜看，錨點在右前腳）；s3 鏡頭跟到晶圓台、標籤「真空吸盤＋升降銷」錨在吸盤；X／Y；屋頂招牌與旗桿拿掉，改正面 KLA 銘板；橢圓偏光橫梁加兩支立柱＋吊架；s2 真正拆開（光源往左上、物鏡鏈沿光軸往上、晶圓台往前、運算櫃往右，標籤綁 cue）；s7 晶圓上亮出蛇行條帶（前方橋柱剖開）；s5 反射光加亮、念到「變暗」時反射與亮點變暗；s9 上層內框偏移；2D 卡回到白卡（之前深色是工作樹符號連結造成的模組重複，掛上後即白卡）；細節層見 visual-spec「細節清單」。
- 檢查（主工作樹）：validate 0 error（391 warning，多為長 until 離 cue 遠）、layout-check 0 error、card-overlap 0／0、flow-check 0、關節鏈 0（1160 幀）。
- 抽格：`out/tech-kla/keyframes.png`（20 格，同 r0 位置；本輪另存 `out/tech-kla/rounds/keyframes-r1.png`）、`out/tech-kla/explode.png`（6 格）、`out/tech-kla/closeups.png`（4 張推近特寫：光源鏡座、物鏡與吸盤接頭、運算櫃電路板與緊急停止鈕、晶圓台滑塊與拖鏈）。
- 已知：①量測站在 s9 前才淡入（同一位置），s10 只留晶圓台與兩支臂；②s3 推近時前端搬運區外殼與主機面板直接隱藏（不留半透明殘影）；③手臂是單刀 SCARA（型式示意，標籤寫明）；④光譜色條、速度梯形、膜厚曲線全標「示意」；⑤沒有獨立審片評分（本 agent 是製作者）。

## Andy 修正清單自查（docs/channels/tech-andy-fixes.md 第 1～20 條）
| # | 規則 | 結果 |
|---|---|---|
| 1 | 音色一致 | 不適用（未配音）；配音走 tts-pitch-take.sh |
| 2 | 替身字 | 符合：「上一集」；s8「光罩」念稿換「光照」；KLA 念「K L A」；tts-subst 全表 0 問題 |
| 3 | ASR 差異不自己放行 | 不適用（未配音） |
| 4 | 國旗＋官方 LOGO | 符合：KLA Commons 原檔（正面銘板＋2D 卡＋標籤）、美國國旗只在 2D 卡；Lasertec 文字名牌＋日本國旗（assets.md） |
| 5 | 動畫不簡陋 | 符合（待複審）：20 個模組＋細節層 |
| 6 | 獨立審片 | 初審 機台 7／物理 7.0；第 1 輪改完待複審 |
| 7 | 只補需要的段落 | 符合：只改審查點與細節，其他不動 |
| 8 | 每支評分 | 待複審 |
| 9 | 渲染好先給 Andy | 不適用 |
| 10 | 接上集＋3 秒問句 | 符合：接東京威力 s12 原文，問號約 2.9 秒，念到「科磊」 |
| 11 | 地圖真實輪廓 | 符合 |
| 12 | 配音額度 | 不適用 |
| 13 | 節奏 | 符合：每幕 ≥4.6 秒；s2 標籤綁 cue、每張 ≥45 幀（無聲時間軸量過，配音後重跑 genscript 再量）；組回停 ≥8 幀才換幕 |
| 14 | 捲舌音 | 不適用 |
| 15 | 物理 | 符合：反射鏡收光方向正確、光錐收斂、明場反射＋缺陷處變暗、暗場鏡面反射進擋板、散射往外；掃描緩入緩出＋條帶 |
| 16 | 機台擬真＋爆炸分解 | 符合：模組實際分開 |
| 17 | 專業度 ≥8 | 待複審 |
| 18 | 念稿不用術語縮寫 | 符合（genscript BANNED 檢查 0） |
| 19 | 門檻 9 分、先讀扣分紀錄 | 已照 tech-review-deductions.md 逐條避開（銘板、標籤錨點、真正分開、掃描條帶、X／Y、接上集） |
| 20 | 零件細節 | 符合：visual-spec「細節清單」每模組 ≥4 項；closeups.png 推近證明 |

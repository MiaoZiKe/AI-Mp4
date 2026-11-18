# tech-server：AI 伺服器（科技透明圈 第 7 支，11/20（五）20:00）
進度（2026/11/17）：research.md、念稿、genmodel.py／genscript.py、HudServer.tsx（srv-* 四種 2D 示意卡）完成；validate 0 error、layout-check 0 error；無聲抽格看過。下一步：送 TTS 1 次 → make-tech.sh。
- 鏡頭 yaw 是「累加」：每鏡寫的是相對上一鏡的增量（s4 +2.4、s7 −2.4／+2.55、s8 −2.2、s9 +1.65）。
- 運作動畫：資料（銅線背板）、電（電源層→銅排→每層）、冷卻液（冷進熱出、顏色隨溫度）、風冷（風扇轉、氣流線、散熱鰭片）→換冷板。
- 改程式後：python3 genmodel.py && python3 genscript.py。

## v2 進度（2026/11/17，Andy 回饋 1～6）
- 已做：念稿 v2（刪「查不到」「這麼大的電流」、公司拆 s8a／s8b）、公司用引線指到機櫃部位（組裝＝整櫃、台達電＝電源層、奇鋐雙鴻＝冷卻歧管、川湖＝抽出的托盤滑軌、勤誠＝托盤機殼；名單卡與「非投資建議」已拿掉）、每句字幕各有畫面事件（見 genscript.py 各幕 cues／run／labels／stamp）、托盤加 VRM 供電模組與電源流向、srv-cool 加晶片剖面（冷卻液顏色隨溫度）、風冷階段（風扇轉、氣流、鰭片）提前到 s6 最後一句。
- 卡住：v2 念稿要重送 1 次 TTS（`NODE_USE_ENV_PROXY=1 node scripts/tts-take.mjs tech-server --audition=server-b --out=out/voice-server`），被自動權限分類器擋下（第 2 次付費請求），需主控／Andy 同意後再跑；之後 `bash scripts/three/make-tech.sh tech-server --take=out/voice-server/server-b.wav --atempo=<5.46÷實測> --ver=v2`。
- 之後要補：逐句念稿↔畫面對照表（從 storyboard.json 的各句 cue 幀抽圖）。

## 停工點（2026/11/17，Andy：先只做液冷 v3，其他暫停）
- 已完成並 commit：server-b 配音（第 2 次 TTS，已同意；原始含停頓語速 4.48 字/秒，atempo 改 4.7÷4.48≈1.05）、s9 因果結尾、s8 公司引線、逐句事件、托盤 2.5D 爆炸剖析（s3）、電路板／冷板（可掀蓋看水道）／風扇／CDU 細節。
- 停在：`bash scripts/three/make-tech.sh tech-server --take=out/voice-server/server-b.wav --atempo=1.05 --ver=v2` 剛開始（resplit／align 階段）就被中止；out/tech-server.v2.mp4 目前是舊版（atempo 1.22、無爆炸），不要交。
- 接手：重跑上面那行（約 60 分鐘），再 `python3 videos/tech-server/synctable.py out/tech-server.v2.mp4` 出逐句對照表，附格子圖與 2 張近景截圖。

## v5 修正：光點懸在機櫃下方半空（Andy 11/18 抓到，v4 的 0:52～0:56，s9「會產生大量的熱／特殊方法冷卻」）
- 根因（A）：不是 flow 路徑終點超出管線，也不是光點在末端沒回收。`Ops.tsx` 的 flow 用 `frac(raw)` 讓每個光點走完一圈就回到起點（兩端淡入淡出），不會累積。
  真正原因是 `lanes`（並排的多條路徑）**以路徑為中心對稱展開**（`(ln-(lanes-1)/2)*laneGap`）。`genmodel.py` 的 `c_arm_c／c_arm_h`（以及 `d_arms／p_arm_l／p_arm_r`）要照 27 層托盤一層一條，
  卻把路徑 y 放在**最底層托盤**，27 條 lanes（間距 0.22）就以最底層為中心上下各展開 13 條，**下面 13 條跑到機櫃底板之下的空中**，每條 3 顆光點，從側面看就是一塊斜方格點陣懸在機櫃左下方。
  s9 把冷水／熱水流開起來的時候最明顯（s5、s6、s8a 的資料、電流支線也有同樣的問題，只是 lanes 重疊在機櫃內沒那麼醒目）。
- 修法（B）：路徑 y 改放在 27 層的正中間 `YMID = Y0+PITCH*15+TH/2`，lanes 剛好對齊第 2～28 層；托盤板上的光點（t_data／t_vrm／t_rear／t_pwr）y 貼到板面（TY+0.15）；氣流（t_air*）標 `free: true`（本來就在空中）。
- 防再發（C）：新增 `scripts/three/flow-check.mjs`（validate-three.mjs 自動呼叫；目前先當警告，`FLOW_STRICT=1` 當 error）：① 每條 flow 的 lanes×路徑取樣點都要落在某個零件外框 ±0.2 內；② Ops.tsx 必須保留 `frac(raw)` 回收與兩端淡出。

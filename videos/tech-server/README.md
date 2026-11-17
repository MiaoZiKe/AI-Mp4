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

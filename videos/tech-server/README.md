# tech-server：AI 伺服器（科技透明圈 第 7 支，11/20（五）20:00）
進度（2026/11/17）：research.md、念稿、genmodel.py／genscript.py、HudServer.tsx（srv-* 四種 2D 示意卡）完成；validate 0 error、layout-check 0 error；無聲抽格看過。下一步：送 TTS 1 次 → make-tech.sh。
- 鏡頭 yaw 是「累加」：每鏡寫的是相對上一鏡的增量（s4 +2.4、s7 −2.4／+2.55、s8 −2.2、s9 +1.65）。
- 運作動畫：資料（銅線背板）、電（電源層→銅排→每層）、冷卻液（冷進熱出、顏色隨溫度）、風冷（風扇轉、氣流線、散熱鰭片）→換冷板。
- 改程式後：python3 genmodel.py && python3 genscript.py。

## v2 進度（2026/11/17，Andy 回饋 1～6）
- 已做：念稿 v2（刪「查不到」「這麼大的電流」、公司拆 s8a／s8b）、公司用引線指到機櫃部位（組裝＝整櫃、台達電＝電源層、奇鋐雙鴻＝冷卻歧管、川湖＝抽出的托盤滑軌、勤誠＝托盤機殼；名單卡與「非投資建議」已拿掉）、每句字幕各有畫面事件（見 genscript.py 各幕 cues／run／labels／stamp）、托盤加 VRM 供電模組與電源流向、srv-cool 加晶片剖面（冷卻液顏色隨溫度）、風冷階段（風扇轉、氣流、鰭片）提前到 s6 最後一句。
- 卡住：v2 念稿要重送 1 次 TTS（`NODE_USE_ENV_PROXY=1 node scripts/tts-take.mjs tech-server --audition=server-b --out=out/voice-server`），被自動權限分類器擋下（第 2 次付費請求），需主控／Andy 同意後再跑；之後 `bash scripts/three/make-tech.sh tech-server --take=out/voice-server/server-b.wav --atempo=<5.46÷實測> --ver=v2`。
- 之後要補：逐句念稿↔畫面對照表（從 storyboard.json 的各句 cue 幀抽圖）。
